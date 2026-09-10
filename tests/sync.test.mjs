import test from 'node:test';
import assert from 'node:assert/strict';

// sync.mjs 顶层只声明常量与函数（localStorage/fetch 等浏览器全局仅在函数体内使用），
// Node 24 自带 btoa/atob/TextEncoder/TextDecoder，注入可变 localStorage 桩后即可安全导入。
const store = {};
globalThis.localStorage = {
  getItem: (k) => (k in store ? store[k] : null),
  setItem: (k, v) => { store[k] = String(v); },
  removeItem: (k) => { delete store[k]; }
};
const { b64encodeUtf8, b64decodeUtf8, mergeDb, syncConfigured, syncReady, saveSyncCfg } = await import('../src/sync.mjs');

test('b64 UTF-8 往返：中文 / LaTeX 公式 / emoji / 多行', () => {
  const cases = [
    '中文与 English 混排',
    'R(t,S) = (1 + F·t/S)^{-0.1542}，$\\frac{a}{b}$',
    '🎉 emoji 与换行\n第二行\t制表符',
    ''
  ];
  for (const s of cases) assert.equal(b64decodeUtf8(b64encodeUtf8(s)), s);
});

test('mergeDb：卡片并集 + 调度整组按 lastR 选边 + 笔记独立按 noteUpd', () => {
  const local = {
    updatedAt: 1000, schemaVersion: 1, settings: { a: 1 }, log: {},
    cards: {
      x: { lastR: 100, stab: 5, notes: 'A笔记' },   // 本地笔记更新（noteUpd 更晚）
      y: { lastR: 300, stab: 9, notes: 'Y' },       // 仅本地有
      z: { lastR: 50, stab: 3, notes: 'Z' }
    },
    wrongs: {}
  };
  const remote = {
    updatedAt: 2000, schemaVersion: 1, settings: { a: 2 }, log: {},
    cards: {
      x: { lastR: 200, stab: 8, notes: 'R笔记' },   // 云端复习更新（lastR 更晚）
      w: { lastR: 400, stab: 2, notes: 'W' }        // 仅云端有
    },
    wrongs: {}
  };
  local.cards.x.noteUpd = 150;
  remote.cards.x.noteUpd = 120;
  const m = mergeDb(local, remote);
  assert.equal(m.cards.x.lastR, 200);      // 调度整组取云端（复习较新）
  assert.equal(m.cards.x.stab, 8);
  assert.equal(m.cards.x.notes, 'A笔记');   // 笔记独立取本地（noteUpd 较晚）
  assert.equal(m.cards.x.noteUpd, 150);
  assert.equal(m.cards.y.stab, 9);         // 仅本地有 → 保留
  assert.equal(m.cards.w.lastR, 400);      // 仅云端有 → 整卡采用
  assert.equal(m.cards.z.lastR, 50);
  assert.equal(m.updatedAt, 2000);         // 取大
  assert.deepEqual(m.settings, { a: 1 });  // 设置本地优先
});

test('mergeDb：调度与笔记来自不同侧时互不挤掉', () => {
  const local = { updatedAt: 1, cards: { x: { lastR: 500, stab: 9, notes: '旧笔记', noteUpd: 100 } }, wrongs: {}, log: {}, settings: {} };
  const remote = { updatedAt: 2, cards: { x: { lastR: 100, stab: 1, notes: '新笔记', noteUpd: 900 } }, wrongs: {}, log: {}, settings: {} };
  const m = mergeDb(local, remote);
  assert.equal(m.cards.x.lastR, 500);      // 调度取本地（复习较新）
  assert.equal(m.cards.x.stab, 9);
  assert.equal(m.cards.x.notes, '新笔记');  // 笔记取云端（编辑较晚）
  assert.equal(m.cards.x.noteUpd, 900);
});

test('mergeDb：日志逐日取大、counts 逐字段取大、checkins 取或、detail 逐卡取大、metrics 取当日专注较长一侧、newIntro 并集', () => {
  const local = {
    updatedAt: 1, cards: {}, wrongs: {}, settings: {},
    log: {
      daily: { d1: 5, d2: 2 }, studyTime: { d1: 60000, d2: 1000 },
      counts: { d1: { n: 2, r: 3, w: 0, a: 1 } }, checkins: { d1: true },
      detail: { d1: { c1: 2 } }, mastery: { d1: 10 }, metrics: { d1: { avg: 10 } },
      newIntro: { ids: ['a', 'b'] }
    }
  };
  const remote = {
    updatedAt: 2, cards: {}, wrongs: {}, settings: {},
    log: {
      daily: { d1: 3, d3: 7 }, studyTime: { d1: 30000, d3: 80000 },
      counts: { d1: { n: 1, r: 5, w: 1, a: 0 } }, checkins: { d3: true },
      detail: { d1: { c2: 4 } }, mastery: { d1: 30 }, metrics: { d1: { avg: 30 } },
      newIntro: { ids: ['b', 'c'] }
    }
  };
  const m = mergeDb(local, remote);
  assert.deepEqual(m.log.daily, { d1: 5, d2: 2, d3: 7 });
  assert.deepEqual(m.log.studyTime, { d1: 60000, d2: 1000, d3: 80000 });
  assert.deepEqual(m.log.counts.d1, { n: 2, r: 5, w: 1, a: 1 });
  assert.deepEqual(m.log.checkins, { d1: true, d3: true });
  assert.deepEqual(m.log.detail.d1, { c1: 2, c2: 4 });
  assert.equal(m.log.mastery.d1, 10);       // d1 本地专注更长 → 取本地快照
  assert.equal(m.log.metrics.d1.avg, 10);
  assert.deepEqual(m.log.newIntro.ids, ['a', 'b', 'c']);
});

test('手动同步门槛 = 已配置（Token+仓库）；自动同步门槛 = 已配置且开启开关', () => {
  saveSyncCfg({});
  assert.equal(syncConfigured(), false);
  assert.equal(syncReady(), false);

  saveSyncCfg({ token: 't', repo: 'user/repo' }); // 只填了 Token 与仓库（未开开关）
  assert.equal(syncConfigured(), true);           // 手动同步应放行
  assert.equal(syncReady(), false);               // 自动同步仍需开关

  saveSyncCfg({ token: 't', repo: 'user/repo', enabled: true });
  assert.equal(syncReady(), true);

  saveSyncCfg({ token: 't', repo: 'bad repo with space', enabled: true });
  assert.equal(syncConfigured(), false);          // 仓库路径格式非法
  assert.equal(syncReady(), false);
});
