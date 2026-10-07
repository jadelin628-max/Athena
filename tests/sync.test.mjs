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
const { b64encodeUtf8, b64decodeUtf8, mergeDb, mergeActModule, mergeNodesByIdUpdatedAt, mergeMileHits, actModuleLocalPayload, actModuleWriteLocal, syncConfigured, syncReady, saveSyncCfg } = await import('../src/sync.mjs');
// 里程碑键与归一化口径来自 mile.mjs（形状契约对拍：sync 的合并结果必须能被 mileNormalize 原样接受）
const { MILE_KEY, mileNormalize } = await import('../src/mile.mjs');

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
  assert.equal(m.__changedFromRemote, true); // 采用了云端内容 → 必须写回本地
});

test('mergeDb：云端无新内容时不标记变化（本机旧数据不再盲目推送覆盖云端）', () => {
  const base = { updatedAt: 500, schemaVersion: 1, settings: { a: 1 }, cards: { x: { lastR: 100, stab: 5, notes: '' } }, wrongs: {}, log: { daily: { d1: 3 }, counts: { d1: { n: 1 } } } };
  const m = mergeDb(base, JSON.parse(JSON.stringify(base)));
  assert.equal(m.__changedFromRemote, false);
});

test('mergeDb：仅本机较新、云端陈旧 → 不标记变化（本地内容照常推送，云端无需写回本地）', () => {
  const local = { updatedAt: 900, schemaVersion: 1, settings: {}, cards: { x: { lastR: 900, stab: 9, notes: '' } }, wrongs: {}, log: {} };
  const remote = { updatedAt: 100, schemaVersion: 1, settings: {}, cards: { x: { lastR: 100, stab: 1, notes: '' } }, wrongs: {}, log: {} };
  const m = mergeDb(local, remote);
  assert.equal(m.cards.x.lastR, 900);      // 本地较新 → 保留本地
  assert.equal(m.__changedFromRemote, false);
  assert.equal(m.updatedAt, 900);
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

test('mergeDb：评分日志 revlogs 去重并集 + 时间序', () => {
  const local = { updatedAt: 1, schemaVersion: 1, cards: {}, wrongs: {}, log: { revlogs: [
    { t: 100, cid: 'c1', r: 3, st: 0, ivl: 2, k: 'k' },
    { t: 300, cid: 'c2', r: 1, st: 2, ivl: 1, k: 'w' }
  ] } };
  const remote = { updatedAt: 2, schemaVersion: 1, cards: {}, wrongs: {}, log: { revlogs: [
    { t: 300, cid: 'c2', r: 1, st: 2, ivl: 1, k: 'w' },  // 重复：去重
    { t: 200, cid: 'c1', r: 2, st: 1, ivl: 0, k: 'k' }   // 独有：并入且触发 changed
  ] } };
  const m = mergeDb(local, remote);
  assert.equal(m.log.revlogs.length, 3);
  assert.deepEqual(m.log.revlogs.map((e) => e.t), [100, 200, 300]); // 按时间排序
  assert.equal(m.__changedFromRemote, true); // 云端独有条目 → 写回本地
});

// —— T33 行动模块合并 ——

test('mergeNodesByIdUpdatedAt：同 id 取 updatedAt 较新一方', () => {
  const a = [{ id: 'n1', updatedAt: 100, v: 'old' }, { id: 'n2', updatedAt: 50, v: 'local-only' }];
  const b = [{ id: 'n1', updatedAt: 200, v: 'new' }, { id: 'n3', updatedAt: 10, v: 'remote-only' }];
  const m = mergeNodesByIdUpdatedAt(a, b);
  assert.equal(m.length, 3);
  const n1 = m.find((x) => x.id === 'n1');
  assert.equal(n1.v, 'new');
  assert.ok(m.find((x) => x.id === 'n2'));
  assert.ok(m.find((x) => x.id === 'n3'));
});

test('mergeActModule：习惯节点 id+updatedAt 取新，doneDates 日志并集', () => {
  const local = {
    updatedAt: 1000,
    act: {
      woops: [],
      habits: [
        { id: 'h1', updatedAt: 100, title: '本地', doneDates: ['2026-10-01', '2026-10-02'] },
        { id: 'h2', updatedAt: 50, title: '仅本地' }
      ]
    },
    habitGroups: [], focus: { chains: [], precedents: [], activeId: null }
  };
  const remote = {
    updatedAt: 2000,
    act: {
      woops: [],
      habits: [
        { id: 'h1', updatedAt: 300, title: '云端', doneDates: ['2026-10-02', '2026-10-03'] },
        { id: 'h3', updatedAt: 10, title: '仅云端' }
      ]
    },
    habitGroups: [], focus: { chains: [], precedents: [], activeId: null }
  };
  const m = mergeActModule(local, remote);
  const h1 = m.act.habits.find((x) => x.id === 'h1');
  assert.equal(h1.title, '云端'); // updatedAt 取新
  assert.deepEqual(h1.doneDates, ['2026-10-01', '2026-10-02', '2026-10-03']); // 日志并集
  assert.ok(m.act.habits.find((x) => x.id === 'h2'));
  assert.ok(m.act.habits.find((x) => x.id === 'h3'));
  assert.equal(m.__changedFromRemote, true);
});

test('mergeActModule：WOOP 节点取新；旧 ifThen/envAudit 不进入合并结果', () => {
  const local = {
    updatedAt: 10,
    act: {
      ifThen: [{ id: 'i1', updatedAt: 10, then: 'A' }],
      woops: [{ id: 'w1', updatedAt: 5, wish: 'L' }],
      envAudit: { updatedAt: 10, habit: 'local' },
      habits: []
    },
    habitGroups: [{ id: 'g1', name: '本地组', minK: 2 }],
    focus: {
      chains: [{ id: 'c1', updatedAt: 10 }, { id: 'c2', updatedAt: 5 }],
      precedents: [{ id: 'p1', behavior: '本地判例' }],
      activeId: 'c2'
    }
  };
  const remote = {
    updatedAt: 20,
    act: {
      ifThen: [{ id: 'i1', updatedAt: 20, then: 'B' }],
      woops: [{ id: 'w1', updatedAt: 15, wish: 'R' }, { id: 'w2', updatedAt: 1 }],
      envAudit: { updatedAt: 30, habit: 'remote' },
      habits: []
    },
    habitGroups: [{ id: 'g1', name: '云端组', minK: 9 }, { id: 'g2', name: '新组', minK: 1 }],
    focus: {
      chains: [{ id: 'c1', updatedAt: 99 }, { id: 'c3', updatedAt: 1 }],
      precedents: [{ id: 'p1', behavior: '旧判例' }, { id: 'p2', behavior: '云端判例' }],
      activeId: 'c3'
    }
  };
  const m = mergeActModule(local, remote);
  assert.equal(m.act.ifThen, undefined);
  assert.equal(m.act.envAudit, undefined);
  assert.deepEqual(Object.keys(m.act).sort(), ['habits', 'woops']);
  assert.equal(m.act.woops.find((x) => x.id === 'w1').wish, 'R'); // updatedAt 取新
  assert.equal(m.act.woops.length, 2);
  // 组：并集，同 id 本地优先
  assert.equal(m.habitGroups.length, 2);
  assert.equal(m.habitGroups.find((x) => x.id === 'g1').name, '本地组');
  // 链：id+updatedAt 取新
  assert.equal(m.focus.chains.find((x) => x.id === 'c1').updatedAt, 99);
  assert.ok(m.focus.chains.find((x) => x.id === 'c2'));
  assert.ok(m.focus.chains.find((x) => x.id === 'c3'));
  // 判例并集
  assert.equal(m.focus.precedents.length, 2);
  // activeId 本地优先（c2 仍在合并结果中）
  assert.equal(m.focus.activeId, 'c2');
  assert.equal(m.updatedAt, 20);
});

test('mergeActModule：updatedAt 取两端 max，不注入 now', () => {
  const a = { updatedAt: 10, act: { woops: [], habits: [] }, habitGroups: [], focus: { chains: [], precedents: [], activeId: null } };
  const b = { updatedAt: 20, act: { woops: [], habits: [] }, habitGroups: [], focus: { chains: [], precedents: [], activeId: null } };
  assert.equal(mergeActModule(a, b).updatedAt, 20);
  assert.equal(mergeActModule(b, a).updatedAt, 20);
});

test('mergeActModule：云端无新内容时不标记变化', () => {
  const base = {
    updatedAt: 100,
    act: { woops: [{ id: 'w1', updatedAt: 10 }], habits: [] },
    habitGroups: [],
    focus: { chains: [], precedents: [{ id: 'p1' }], activeId: null },
    settings: { dailyAddLimit: 1 }
  };
  const m = mergeActModule(JSON.parse(JSON.stringify(base)), JSON.parse(JSON.stringify(base)));
  assert.equal(m.__changedFromRemote, false);
  assert.deepEqual(m.settings, { dailyAddLimit: 1 }); // 设置本地优先
});

test('mergeActModule：本地 activeId 失效时回退到云端 activeId', () => {
  const local = {
    updatedAt: 1,
    act: { woops: [], habits: [] },
    habitGroups: [],
    focus: { chains: [{ id: 'c1', updatedAt: 1 }], precedents: [], activeId: 'ghost' }
  };
  const remote = {
    updatedAt: 2,
    act: { woops: [], habits: [] },
    habitGroups: [],
    focus: { chains: [{ id: 'c1', updatedAt: 1 }, { id: 'c9', updatedAt: 5 }], precedents: [], activeId: 'c9' }
  };
  const m = mergeActModule(local, remote);
  assert.equal(m.focus.activeId, 'c9');
});

// —— 里程碑（athena_mile_v1）接入云同步 ——

// 与 mergeActModule 的输入同形（mile 默认带空结构，模拟本机/新云端载荷）
function actPayload(extra) {
  return Object.assign({
    updatedAt: 0,
    act: { woops: [], habits: [] },
    habitGroups: [],
    focus: { chains: [], precedents: [], activeId: null },
    mile: { hits: [] }
  }, extra || {});
}

test('mergeMileHits：Hit 并集按 defId 去重、同 defId 取 at 较新、按 at 升序、坏记录丢弃', () => {
  const local = [
    { id: 'a1', defId: 'mile_habit_full', at: 100, note: '' },
    { id: 'a2', defId: 'mile_focus_10', at: 150, note: '' },
    { id: 'a3', defId: 'mile_learn_clear3', at: 10, note: '本机补记' },
    null,
    { defId: '', at: 20 },
    { defId: 'mile_learn_streak7', at: 0 }
  ];
  const remote = [
    { id: 'b1', defId: 'mile_focus_10', at: 300, note: '云端补记' },
    { id: 'b2', defId: 'mile_learn_streak7', at: 50, note: '' },
    { defId: 'mile_habit_full', at: 100 }
  ];
  const m = mergeMileHits(local, remote);
  assert.deepEqual(m.map((h) => h.defId), ['mile_learn_clear3', 'mile_learn_streak7', 'mile_habit_full', 'mile_focus_10']);
  assert.equal(m.length, 4);   // 只并集，不凭空生成未达成项
  const byDef = {};
  m.forEach((h) => { byDef[h.defId] = h; });
  assert.equal(byDef.mile_habit_full.id, 'a1');        // 同 at 平手 → 保留本地侧
  assert.equal(byDef.mile_learn_streak7.id, 'b2');     // 本机 at=0 为坏值被丢弃，云端记录胜出
  assert.equal(byDef.mile_learn_streak7.at, 50);
  assert.equal(byDef.mile_focus_10.id, 'b1');          // 云端较新
  assert.equal(byDef.mile_focus_10.at, 300);
  assert.equal(byDef.mile_focus_10.note, '云端补记');   // 形状随胜出记录
  assert.equal(byDef.mile_learn_clear3.note, '本机补记');
  assert.deepEqual(mergeMileHits(undefined, null), []);  // 两端都缺 → 空并集
  assert.deepEqual(mergeMileHits([], []), []);
});

test('mergeActModule：云端新 —— 云端独有 Hit 并集进入合并结果并标记 changed', () => {
  const local = actPayload({ updatedAt: 1000, mile: { hits: [{ id: 'l1', defId: 'mile_habit_first', at: 100, note: '' }] } });
  const remote = actPayload({ updatedAt: 2000, mile: { hits: [
    { id: 'l1', defId: 'mile_habit_first', at: 100, note: '' },
    { id: 'r1', defId: 'mile_learn_clear3', at: 250, note: '' }
  ] } });
  const m = mergeActModule(local, remote);
  assert.deepEqual(m.mile.hits.map((h) => h.defId), ['mile_habit_first', 'mile_learn_clear3']);
  assert.deepEqual(m.mile.hits.map((h) => h.at), [100, 250]);
  assert.equal(m.__changedFromRemote, true);
  assert.equal(m.updatedAt, 2000);
});

test('mergeActModule：本机新 —— 本机 Hit 保留、云端无新内容不标记 changed（老云端载荷无 mile 亦兼容）', () => {
  const local = actPayload({ updatedAt: 1000, mile: { hits: [{ id: 'l1', defId: 'mile_focus_10', at: 900, note: '' }] } });
  const remote = actPayload({ updatedAt: 100 });   // 老云端载荷
  delete remote.mile;
  const m = mergeActModule(local, remote);
  assert.deepEqual(m.mile, { hits: [{ id: 'l1', defId: 'mile_focus_10', at: 900, note: '' }] });
  assert.equal(m.__changedFromRemote, false);      // 云端无新内容（沿用现有口径）→ 本机内容照常推送
  assert.equal(m.updatedAt, 1000);
});

test('mergeActModule：同 defId 两端都有 → 取 at 较新一方（本机较新则不被云端旧记录覆盖）', () => {
  const mk = (at, id, up) => actPayload({ updatedAt: up, mile: { hits: [{ id: id, defId: 'mile_habit_settle7', at: at, note: '' }] } });
  const m = mergeActModule(mk(400, 'l1', 100), mk(700, 'r1', 200));   // 云端较新
  assert.deepEqual(m.mile.hits.map((h) => [h.id, h.at]), [['r1', 700]]);
  assert.equal(m.__changedFromRemote, false);      // 同 defId 两端都有 → 不算「云端独有」
  const m2 = mergeActModule(mk(700, 'l1', 900), mk(400, 'r1', 100));  // 本机较新
  assert.deepEqual(m2.mile.hits.map((h) => [h.id, h.at]), [['l1', 700]]);
});

test('mergeActModule：mile 缺字段/畸形（null、hits 非数组、元素坏、远端缺失）→ 空结构默认值，不抛错', () => {
  assert.deepEqual(mergeActModule(actPayload(), actPayload()).mile, { hits: [] });
  assert.deepEqual(mergeActModule({ mile: null }, { mile: null }).mile, { hits: [] });
  assert.deepEqual(mergeActModule({ mile: { hits: 'nope' } }, { mile: { hits: { 0: {} } } }).mile, { hits: [] });
  assert.deepEqual(mergeActModule({ mile: { hits: [null, 0, 'x', {}, { defId: 'mile_focus_10' }] } }, undefined).mile, { hits: [] });
  assert.deepEqual(mergeActModule({}, {}).mile, { hits: [] });
  assert.deepEqual(mergeActModule(undefined, undefined).mile, { hits: [] });
});

test('actModuleLocalPayload：payload 含 mile 字段（形状照 mileNormalize 输出，读 athena_mile_v1）', () => {
  delete store[MILE_KEY];
  delete store['athena_act_v1'];
  assert.deepEqual(actModuleLocalPayload().mile, { hits: [] });   // 老用户本机何时无里程碑数据

  store[MILE_KEY] = JSON.stringify({ hits: [
    { id: 'milehit_900_mile_focus_10', defId: 'mile_focus_10', at: 900, note: '本机' },
    { defId: 'mile_learn_clear3', at: 300, note: '' },
    { defId: 'mile_habit_full', at: 0 },
    null
  ] });
  const payload = actModuleLocalPayload();
  assert.ok(payload.mile && Array.isArray(payload.mile.hits));
  assert.deepEqual(payload.mile.hits.map((h) => h.defId), ['mile_learn_clear3', 'mile_focus_10']);
  assert.deepEqual(payload.mile.hits.map((h) => h.at), [300, 900]);          // 按 at 升序
  assert.equal(payload.mile.hits[0].id, 'milehit_300_mile_learn_clear3');    // 缺 id 按既有口径补
  assert.equal(payload.mile.hits[1].note, '本机');
  assert.deepEqual(mileNormalize(payload.mile), payload.mile);               // 形状契约：mileNormalize 原样接受
  assert.ok(Number(payload.updatedAt) > 0);
});

test('actModuleWriteLocal：mile 落到 athena_mile_v1；老载荷缺 mile → { hits: [] }；绝不触碰学习库键', () => {
  const srsSnap = JSON.stringify({ schemaVersion: 1, updatedAt: 4242, cards: { k1: { lastR: 1, updatedAt: 4242 } } });
  store['math3_formula_srs_v1'] = srsSnap;
  const act = { act: { woops: [], habits: [] }, habitGroups: [], focus: { chains: [], precedents: [], activeId: null } };

  store[MILE_KEY] = JSON.stringify({ hits: [{ defId: 'mile_habit_full', at: 5, note: '' }] });
  actModuleWriteLocal(Object.assign({ mile: { hits: [{ defId: 'mile_focus_10', at: 77, note: '' }] } }, act));
  assert.deepEqual(JSON.parse(store[MILE_KEY]).hits, [{ id: 'milehit_77_mile_focus_10', defId: 'mile_focus_10', at: 77, note: '' }]);

  actModuleWriteLocal(act);   // forceDownloadAll 语义：老云端载荷无 mile → 空结构单向覆盖
  assert.deepEqual(JSON.parse(store[MILE_KEY]), { hits: [] });

  assert.equal(store['math3_formula_srs_v1'], srsSnap);   // 学习库字符串（含 updatedAt）原样未动
  assert.deepEqual(Object.keys(store).filter((k) => /_formula_srs_v1$/.test(k)), ['math3_formula_srs_v1']);
  assert.equal(JSON.parse(store['math3_formula_srs_v1']).updatedAt, 4242);
});
