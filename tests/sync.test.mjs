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

// ===================== 自测数据持久化（v2.1.0）：log.quiz / settings.quizCfg =====================
// 记录形状来源：src/quiz.mjs 的 quizSaveRecord。这里照形状造一份工厂做对拍基准——
// 字段改名会先在测试里红灯，而不是等用户发现「导出→导入后自测历史没了」。
const quizRec = (t, extra) => Object.assign({
  t: t,
  mode: 'cards',
  total: 2,
  correct: 1,
  pct: 50,
  ms: 12000,
  msAvg: 6000,
  predicted: 82,
  gap: -32,
  verdict: '表现差',
  byCat: [{ c: '极限', n: 1, ok: 1 }, { c: '级数', n: 1, ok: 0 }],
  weak: ['k_lim_2'],
  queued: ['k_ser_9'],
  diff: [1, 10],
  mastery: [0, 100],
  cats: ['极限', '级数']
}, extra || {});
const bareDb = (extra) => Object.assign({ updatedAt: 1, schemaVersion: 1, cards: {}, wrongs: {}, settings: {}, log: {} }, extra || {});

// store.mjs 的 importDB / normalizeDB 整源抽取：剥离 ESM 导出（与 tools/build.mjs 的 stripExports 同规则）
// 后在 vm 里当普通脚本求值，于是能在 Node 里跑**真实的导入/加载路径**（而非只测纯函数）。
const { readFileSync } = await import('node:fs');
const nodeVm = (await import('node:vm')).default;
const storeSrc = readFileSync(new URL('../src/store.mjs', import.meta.url), 'utf8')
  .replace(/^\s*export\s*\{[\s\S]*?\}\s*;?\s*$/gm, '');
function newStoreCtx() {
  const sandbox = {
    window: {},
    localStorage: { getItem: () => null, setItem: () => {}, removeItem: () => {} },
    setTimeout: () => 0,   // saveDB 的延迟落盘：单测不需要真计时器（避免悬挂 timer 拖慢/挂住进程）
    DB: { cards: {}, settings: {}, log: {} },
    DATA: [],              // 静态卡数据集不参与：importDB 的 DATA.forEach 为空
    BASE_SUBJ: null,       // refreshData() 首行即返回（无静态数据可合成）
    currentSubjectId: 'math3',
    GOAL_DEFAULT: '考研',
    TARGET_S_DEFAULT: 90
  };
  // store.mjs 在模块内声明了 `let DB`（L134）：脚本作用域的同名绑定会遮蔽沙箱属性，
  // 于是 vm 内 `DB = fresh` 不会写回 sandbox.DB。跑完后把沙箱的 DB 换成读回内部状态的 getter，
  // 测试里的 ctx.DB 才等于真实 DB（getDB 作为等价入口一并保留）。
  nodeVm.runInNewContext(storeSrc
    + '\nthis.__t12 = { importDB: importDB, normalizeDB: normalizeDB, getDB: function () { return DB; } };'
    + "\nObject.defineProperty(this, 'DB', { get: function () { return DB; }, enumerable: true, configurable: true });", sandbox);
  return sandbox;
}
// 读取侧口径：quiz.mjs 的净化器（同一份数据的「消费端」），用于「store 输出是它的不动点」对拍
const quizSrc = readFileSync(new URL('../src/quiz.mjs', import.meta.url), 'utf8');
const Q_BEGIN = '// ===== BEGIN TESTABLE quiz core helpers =====';
const Q_END = '// ===== END TESTABLE quiz core helpers =====';
const qa = quizSrc.indexOf(Q_BEGIN);
const qb = quizSrc.indexOf(Q_END);
if (qa < 0 || qb < 0) throw new Error('quiz.mjs 缺少 quiz core helpers 标记块');
const quizSandbox = {};
nodeVm.runInNewContext(quizSrc.slice(qa + Q_BEGIN.length, qb) + '\nthis.quizDefaultConfig = quizDefaultConfig;\nthis.quizSanitizeConfig = quizSanitizeConfig;\nthis.QUIZ_MAX_RECORDS = QUIZ_MAX_RECORDS;', quizSandbox);

test('mergeDb：log.quiz 按 t 去重并集（升序、同 t 本地优先、云端独有 t 才标记 changed）', () => {
  const local = bareDb({ updatedAt: 10, log: { quiz: [quizRec(300), quizRec(100)] } });
  const remote = bareDb({ updatedAt: 20, log: { quiz: [quizRec(100, { correct: 2 }), quizRec(200)] } });
  const m = mergeDb(local, remote);
  assert.deepEqual(m.log.quiz.map((r) => r.t), [100, 200, 300]);   // 并集 + 按 t 升序
  assert.equal(m.log.quiz.length, 3);                              // 同 t 不翻倍
  assert.equal(m.log.quiz.find((r) => r.t === 100).correct, 1);    // 同 t 以本地记录为准
  assert.deepEqual(m.log.quiz.find((r) => r.t === 200).byCat, quizRec(200).byCat); // 云端记录整条保留（嵌套字段不丢）
  assert.deepEqual(m.log.quiz.find((r) => r.t === 200).weak, ['k_lim_2']);
  assert.equal(m.__changedFromRemote, true);                        // 采用了云端独有的场次 → 需写回本地
  assert.equal(m.updatedAt, 20);                                    // updatedAt 仍是「取大」：合并不额外刷新时间戳

  // 两端完全相同 → 不标记变化（自测记录不会让本机旧数据反复推送覆盖云端）
  const base = bareDb({ updatedAt: 500, log: { quiz: [quizRec(1), quizRec(2)] } });
  const same = mergeDb(base, JSON.parse(JSON.stringify(base)));
  assert.deepEqual(same.log.quiz.map((r) => r.t), [1, 2]);
  assert.equal(same.__changedFromRemote, false);

  // 只有本机有自测记录（云端载荷来自旧版本）→ 记录保留、且不算「云端有新内容」
  const onlyLocal = mergeDb(bareDb({ updatedAt: 7, log: { quiz: [quizRec(9)] } }), bareDb({ updatedAt: 5 }));
  assert.deepEqual(onlyLocal.log.quiz.map((r) => r.t), [9]);
  assert.equal(onlyLocal.__changedFromRemote, false);
});

test('mergeDb：log.quiz 超 200 条只保留最新 200 条（与应用端上限一致）', () => {
  const local = bareDb({ updatedAt: 1, log: { quiz: [] } });
  const remote = bareDb({ updatedAt: 2, log: { quiz: [] } });
  for (let i = 1; i <= 150; i++) local.log.quiz.push(quizRec(i));
  for (let i = 151; i <= 300; i++) remote.log.quiz.push(quizRec(i));
  const m = mergeDb(local, remote);
  assert.equal(m.log.quiz.length, 200);
  assert.equal(m.log.quiz[0].t, 101);      // 最旧的 100 条先出队
  assert.equal(m.log.quiz[199].t, 300);
  assert.equal(m.__changedFromRemote, true);
});

test('mergeDb：log.quiz 畸形输入（非数组 / 元素坏 / 缺 log）→ 空结构默认值，不抛错', () => {
  assert.deepEqual(mergeDb(bareDb({ log: { quiz: 'nope' } }), bareDb()).log.quiz, []);
  assert.deepEqual(mergeDb({ cards: {}, wrongs: {}, settings: {} }, { cards: {}, wrongs: {}, settings: {} }).log.quiz, []);
  const bad = mergeDb(
    bareDb({ log: { quiz: [null, 7, 'x', [], {}, { t: 'x' }, { t: NaN }, quizRec(5)] } }),
    bareDb({ log: { quiz: [null, quizRec(6)] } })
  );
  assert.deepEqual(bad.log.quiz.map((r) => r.t), [5, 6]);   // 非法元素单独丢弃，合法元素不丢
  const m = mergeDb(bareDb({ log: { quiz: [] } }), bareDb({ log: { quiz: [] } }));
  assert.deepEqual(m.log.quiz, []);
  assert.equal(m.__changedFromRemote, false);
});

// vm 里造出来的对象属于另一个 realm（[[Prototype]] 不同），node:assert/strict 的 deepEqual
// 连原型一起比 → 断言前做一次 JSON 结构归一（被测数据本身就是 JSON 可序列化的持久化结构）。
const plain = (v) => JSON.parse(JSON.stringify(v));

test('store.importDB 往返：log.quiz 逐字段保留（含嵌套 byCat/weak/queued/diff/mastery）、非法元素丢弃', () => {
  const ctx = newStoreCtx();
  const payload = {
    schemaVersion: 1, updatedAt: 12345, cards: {},
    settings: { quizCfg: { cards: { count: 3, cats: ['极限', '极限', '', 7], diff: [10, 1], mastery: [100, 1] }, wrong: { count: 999 } } },
    log: { quiz: [quizRec(1000), null, 7, 'x', [], { t: '1000' }, { t: NaN }, quizRec(2000)] }
  };
  ctx.__t12.importDB(JSON.stringify(payload));   // 导出路径就是 JSON.stringify(DB)：往返一次
  const db = plain(ctx.DB);
  assert.deepEqual(db.log.quiz.map((r) => r.t), [1000, 2000]);
  assert.deepEqual(db.log.quiz[0], quizRec(1000));            // 逐字段一致（含嵌套）
  assert.deepEqual(db.log.quiz[1].byCat, quizRec(2000).byCat);
  assert.deepEqual(db.log.quiz[1].weak, ['k_lim_2']);
  assert.deepEqual(db.log.quiz[1].queued, ['k_ser_9']);
  assert.deepEqual(db.log.quiz[1].diff, [1, 10]);
  assert.deepEqual(db.log.quiz[1].mastery, [0, 100]);
  // 深拷贝：改来源对象后重新读回导入结果，值不动（否则后续改动会回流进这个「备份」载荷）
  payload.log.quiz[7].byCat[0].ok = 99;
  assert.equal(plain(ctx.DB).log.quiz[1].byCat[0].ok, 1);
  // quizCfg：数量夹取、区间自动交换、章节去重/过滤非字符串；只给了 count 的来源其余回退默认
  assert.deepEqual(plain(db.settings.quizCfg.cards), { count: 3, cats: ['极限'], diff: [1, 10], mastery: [1, 100] });
  assert.deepEqual(plain(db.settings.quizCfg.wrong), { count: 50, cats: [], diff: [1, 10], mastery: [0, 100] });
});

test('store.importDB 往返：超过 200 条的自测记录只保留最新 200 条', () => {
  const ctx = newStoreCtx();
  const quiz = [];
  for (let i = 1; i <= 260; i++) quiz.push(quizRec(i));
  ctx.__t12.importDB(JSON.stringify({ schemaVersion: 1, cards: {}, settings: {}, log: { quiz: quiz } }));
  assert.equal(ctx.DB.log.quiz.length, 200);
  assert.equal(ctx.DB.log.quiz[0].t, 61);
  assert.equal(ctx.DB.log.quiz[199].t, 260);
});

test('store.normalizeDB：quizCfg 缺省/非法兜底与夹取（不抛错）；老库无 log.quiz 时补空数组', () => {
  const ctx = newStoreCtx();
  const defaults = {
    cards: { count: 10, cats: [], diff: [1, 10], mastery: [0, 100] },
    wrong: { count: 10, cats: [], diff: [1, 10], mastery: [0, 100] }
  };
  ctx.__t12.normalizeDB({ cards: {}, settings: {}, log: {} });   // 老库：既无 quizCfg 也无 log.quiz
  assert.deepEqual(plain(ctx.DB.settings.quizCfg), defaults);
  assert.deepEqual(ctx.DB.log.quiz.length, 0);                   // 老库补空数组（而非 undefined）

  // 整块非法（字符串 / 数组 / null / 数字 / 布尔）→ 回退默认，绝不抛错
  ['nope', [], null, 0, true].forEach((bad) => {
    ctx.__t12.normalizeDB({ cards: {}, settings: { quizCfg: bad }, log: { quiz: bad } });
    assert.deepEqual(plain(ctx.DB.settings.quizCfg), defaults);
    assert.deepEqual(ctx.DB.log.quiz.length, 0);
  });

  // 逐字段非法：夹取/回退，合法部分保留
  ctx.__t12.normalizeDB({
    cards: {},
    settings: { quizCfg: { cards: { count: 0, cats: [1, null, '', 'x', 'x', 'y'], diff: [5], mastery: [-3, 999] } } },
    log: { quiz: [null, { t: NaN }, { t: 'x' }, quizRec(5)] }
  });
  assert.equal(ctx.DB.settings.quizCfg.cards.count, 1);                    // 夹到下限 1
  assert.deepEqual(plain(ctx.DB.settings.quizCfg.cards.cats), ['x', 'y']);   // 非字符串/空串丢弃、重复去重
  assert.deepEqual(plain(ctx.DB.settings.quizCfg.cards.diff), [1, 10]);      // 单元素不是合法区间 → 默认
  assert.deepEqual(plain(ctx.DB.settings.quizCfg.cards.mastery), [0, 100]);  // 越界夹取
  assert.deepEqual(plain(ctx.DB.settings.quizCfg.wrong), defaults.wrong);    // 缺来源 → 默认
  assert.deepEqual(plain(ctx.DB.log.quiz).map((r) => r.t), [5]);
});

test('契约对拍：store 兜底出的自测配置是 quiz.mjs 读取侧净化器的不动点（老库加载后照常自测）', () => {
  const ctx = newStoreCtx();
  ctx.__t12.normalizeDB({ cards: {}, settings: {}, log: {} });
  const cats = ['极限', '级数'];
  const cfg = plain(ctx.DB.settings.quizCfg);
  assert.deepEqual(plain(quizSandbox.quizDefaultConfig()), cfg.cards);     // 与读取侧默认值同源
  assert.deepEqual(plain(quizSandbox.quizSanitizeConfig(cfg.cards, cats)), cfg.cards);   // store 输出是读取侧净化器的不动点
  assert.deepEqual(plain(quizSandbox.quizSanitizeConfig(cfg.wrong, cats)), cfg.wrong);
  assert.equal(quizSandbox.QUIZ_MAX_RECORDS, 200);                         // 上限三处一致（quiz 写入侧/store 读取侧/sync 合并侧）
  // 两个来源各自独立对象（深拷贝语义）：改一个不影响另一个
  ctx.DB.settings.quizCfg.cards.count = 7;
  assert.equal(ctx.DB.settings.quizCfg.wrong.count, 10);
});

// —— t13 云同步合并的畸形输入防御 ——
// 修复前的真实失败形态（完整日志见 backup/scratch/sync2/probe-capture.log）：
//   local.revlogs='nope'   → TypeError: ar.concat(...).forEach is not a function
//   remote.revlogs=42      → TypeError: br.forEach is not a function
//   newIntro.ids=42        → TypeError: bi.filter is not a function
//   detail={d1:null}       → TypeError: Cannot convert undefined or null to object
//   revlogs=[null,…]（两侧都是数组时 br 循环读 ar 元素）→ TypeError: Cannot read properties of null (reading 't')
// 修后：畸形数据按既有净化精神丢弃（该侧按「没有这段数据」参与合并），任何组合都不再中断整条同步链路。
const revLog = (t, cid, r) => ({ t: t, cid: cid, r: r, st: 1, ivl: 2, k: 'k' });

test('mergeDb：revlogs 单边非数组 → 不抛错，按该侧无数据合并，另一侧合法记录保留', () => {
  const remoteOnly = mergeDb(bareDb({ log: { revlogs: 'nope' } }), bareDb({ log: { revlogs: [revLog(1, 'c1', 3)] } }));
  assert.deepEqual(remoteOnly.log.revlogs, [revLog(1, 'c1', 3)]);
  assert.equal(remoteOnly.__changedFromRemote, true);   // 云端独有评分 → 仍需写回本地

  const localOnly = mergeDb(bareDb({ log: { revlogs: [revLog(2, 'c2', 1)] } }), bareDb({ log: { revlogs: 42 } }));
  assert.deepEqual(localOnly.log.revlogs, [revLog(2, 'c2', 1)]);
  assert.equal(localOnly.__changedFromRemote, false);   // 云端没有可用评分 → 不算改动
});

test('mergeDb：revlogs/quiz 双边非数组 → 降级空数组（结构合法），不抛错', () => {
  const m = mergeDb(bareDb({ log: { revlogs: {}, quiz: true } }), bareDb({ log: { revlogs: 'x', quiz: null } }));
  assert.deepEqual(m.log.revlogs, []);
  assert.deepEqual(m.log.quiz, []);
  assert.equal(m.__changedFromRemote, false);
});

test('mergeDb：数组内元素为非对象 → 坏元素单独丢弃、合法元素保留（修前读 null.t 即抛 TypeError）', () => {
  const m = mergeDb(
    bareDb({ log: { revlogs: [null, 7, 'x', [], {}, { t: 1 }, revLog(100, 'c1', 3)] } }),
    bareDb({ log: { revlogs: [revLog(200, 'c1', 2), revLog(100, 'c1', 3)] } })
  );
  assert.deepEqual(m.log.revlogs.map((e) => e.t), [100, 200]);   // 键 t|cid|r 去重 + 升序
  assert.equal(m.__changedFromRemote, true);
});

test('mergeDb：quiz 数组内元素为非对象（含 t 非数字）→ 丢弃，同 t 仍本地优先', () => {
  const m = mergeDb(
    bareDb({ log: { quiz: [null, 7, 'x', [], {}, { t: 'x' }, { t: NaN }, quizRec(1000)] } }),
    bareDb({ log: { quiz: [null, quizRec(1000, { correct: 2 }), quizRec(2000)] } })
  );
  assert.deepEqual(m.log.quiz.map((r) => r.t), [1000, 2000]);
  assert.equal(m.log.quiz[0].correct, 1);   // 本地优先
});

test('mergeDb：log 整体缺失 / 为 null / 为字符串或数字 / 逐字段畸形 → 返回结构始终合法', () => {
  const shapes = [
    mergeDb({ cards: {}, wrongs: {}, settings: {} }, { cards: {}, wrongs: {}, settings: {}, log: null }),
    mergeDb(bareDb({ log: 'x' }), bareDb({ log: 42 })),
    mergeDb(bareDb({ log: { revlogs: null, quiz: undefined, counts: null, detail: { d1: null }, newIntro: { ids: 42 } } }), bareDb({ log: {} }))
  ];
  shapes.forEach((m) => {
    assert.equal(typeof m.log, 'object');
    assert.ok(Array.isArray(m.log.revlogs));   // 修前 revlogs 缺失/为对象会原样留在结果里
    assert.ok(Array.isArray(m.log.quiz));
    assert.equal(typeof m.log.counts, 'object');
    assert.ok(Array.isArray(m.log.newIntro.ids));
  });
});

test('mergeDb：畸形字段不影响其余合法语义（counts 逐日逐字段取大、updatedAt/cards 不动）', () => {
  const local = bareDb({ updatedAt: 900, cards: { x: { lastR: 900, stab: 9 } }, log: { counts: { d1: { n: 2, r: 3 } }, revlogs: 'nope', quiz: 42 } });
  const remote = bareDb({ updatedAt: 100, cards: { x: { lastR: 100, stab: 1 } }, log: { counts: { d1: { n: 1, r: 5 }, d2: { n: 4 } }, revlogs: [revLog(1, 'c1', 3)], quiz: [quizRec(5)] } });
  const m = mergeDb(local, remote);
  assert.deepEqual(m.log.counts, { d1: { n: 2, r: 5 }, d2: { n: 4 } });
  assert.equal(m.updatedAt, 900);            // 仍取大、不刷新
  assert.equal(m.cards.x.lastR, 900);
  assert.deepEqual(m.log.revlogs.map((e) => e.t), [1]);   // 本地 revlogs 畸形 → 按空，云端记录照常并入
  assert.deepEqual(m.log.quiz.map((r) => r.t), [5]);
});
