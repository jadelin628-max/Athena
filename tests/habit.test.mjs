import test from 'node:test';
import assert from 'node:assert/strict';
import {
  evaluateHabitDay,
  habitSanitize,
  habitAddNode,
  habitUpdateNode,
  habitSetParent,
  habitDeleteNode,
  habitFailNode,
  habitAddToTree,
  habitCanAddToTree,
  habitDailyAddCount,
  habitUpdateInternalize,
  habitInternalizeGain,
  habitMapLayout,
  habitDescendantIds,
  habitCanSetParent,
  habitDayStats,
  habitDots,
  habitTagGroups,
  habitDoneCount,
  habitActive,
  habitOnTree,
  habitLibrary,
  habitFind,
  habitChildrenOf,
  habitNormalizeDoneDates,
  habitYmd,
  habitToIdSet,
  habitNodeDepth,
  habitClampInternalize,
  HABIT_DOTS_DAYS,
  HABIT_TOLERANCE_DEFAULT,
  HABIT_INTERNALIZE_MAX,
  HABIT_DAILY_ADD_LIMIT,
  HABIT_MIN_K_DEFAULT,
  HABIT_MIN_K_MAX,
  HABIT_LEVEL_MAX,
  HABIT_CFG_DEFAULTS,
  habitGroupKey,
  habitClampMinK,
  habitSanitizeGroups,
  habitMinKOf,
  habitSetGroupMinK,
  habitGroupSummaries,
  habitClampLevel,
  habitLevelFloor,
  habitAutoLevelOnOk,
  habitDemoteLevel,
  habitLevelDelta,
  habitNormalizeCfg,
  habitCheckStatus,
  habitSetCheck,
  habitAllChecked,
  habitNormalizeState,
  habitSettlePreview,
  habitSettleDay,
  habitManualLevelUp,
  habitCanManualLevel,
  habitPendingSettleDates
} from '../src/habit.mjs';

const D1 = '2026-03-01';
const D2 = '2026-03-02';
const D3 = '2026-03-03';
const NOW = 1770000000000;

function node(over) {
  return Object.assign({
    id: 'n1',
    title: '习惯',
    detail: '',
    parentId: null,
    groupId: null,
    tag: '',
    difficulty: 2,
    level: 0,
    internalize: 0,
    onTree: true,
    lastOk: null,
    failCount: 0,
    addedOn: null,
    toleranceDays: 1,
    missCount: 0,
    doneDates: [],
    missDates: [],
    createdAt: NOW,
    updatedAt: NOW,
    removedAt: null
  }, over || {});
}

// ---------- 空树 / 基础 ----------

test('空树：habitSettleDay 不抛错，返回空结果', () => {
  const r = evaluateHabitDay([], new Set(), D1, NOW);
  assert.deepEqual(r.nodes, []);
  assert.deepEqual(r.failed, []);
  assert.deepEqual(r.cascaded, []);
  assert.deepEqual(r.removed, []);
  assert.deepEqual(r.completed, []);
  assert.deepEqual(r.incomplete, []);
  assert.deepEqual(r.protected, []);
  assert.deepEqual(r.violations, []);
  assert.equal(r.allChecked, true);
});

test('habitSanitize：补 RSIP 默认字段、去重 id、修断链 parentId、旧数据默认 onTree', () => {
  const d = habitSanitize([
    { id: 'a', title: 'A', toleranceDays: '2', missCount: -1, doneDates: ['2026-03-01', 'bad', '2026-03-01'], missDates: ['2026-03-02'], internalize: 150 },
    { id: 'a', title: 'dup' },
    { id: 'b', parentId: 'missing', title: 'B' },
    { id: 'c', title: '旧', removedAt: NOW },
    null,
    'x'
  ]);
  assert.equal(d.length, 3);
  assert.equal(d[0].id, 'a');
  assert.equal(d[0].toleranceDays, 2);
  assert.equal(d[0].missCount, 0);
  assert.equal(d[0].internalize, HABIT_INTERNALIZE_MAX);
  assert.equal(d[0].onTree, true);
  assert.equal(d[0].level, 0);
  assert.equal(d[0].failCount, 0);
  assert.deepEqual(d[0].doneDates, ['2026-03-01']);
  assert.deepEqual(d[0].missDates, ['2026-03-02']);
  assert.equal(d[1].parentId, null);
  assert.equal(d[2].onTree, false); // 旧数据 removedAt → 不在树
  assert.equal(HABIT_TOLERANCE_DEFAULT, 1);
  assert.equal(HABIT_DOTS_DAYS, 7);
  assert.equal(HABIT_INTERNALIZE_MAX, 100);
  assert.equal(HABIT_DAILY_ADD_LIMIT, 1);
  assert.equal(HABIT_CFG_DEFAULTS.dailyAddLimit, 1);
  assert.equal(HABIT_CFG_DEFAULTS.manualLevelPerDay, 1);
  assert.equal(HABIT_CFG_DEFAULTS.manualLevelKeepRatio, 0.5);
  assert.equal(HABIT_CFG_DEFAULTS.failInternalizePenalty, 15);
  assert.equal(HABIT_CFG_DEFAULTS.autoSettle, true);
});

test('habitOnTree / habitLibrary / habitActive 划分', () => {
  const nodes = [
    node({ id: 't', onTree: true }),
    node({ id: 'lib', onTree: false }),
    node({ id: 'dead', onTree: true, removedAt: NOW })
  ];
  assert.equal(habitOnTree(nodes).length, 1);
  assert.equal(habitLibrary(nodes).length, 1);
  assert.equal(habitActive(nodes).length, 2);
  assert.equal(habitOnTree(nodes)[0].id, 't');
  assert.equal(habitLibrary(nodes)[0].id, 'lib');
});

// ---------- 入树：每日最多 1 ----------

test('habitCanAddToTree / habitDailyAddCount：每日名额 1', () => {
  assert.equal(HABIT_DAILY_ADD_LIMIT, 1);
  const c0 = habitCanAddToTree([], D1);
  assert.equal(c0.ok, true);
  assert.equal(c0.addedToday, 0);

  const r1 = habitAddToTree([], { title: '背单词' }, D1, NOW);
  assert.equal(r1.ok, true);
  assert.equal(r1.addedToday, 1);
  assert.equal(r1.node.onTree, true);
  assert.equal(r1.node.addedOn, D1);

  const c1 = habitCanAddToTree(r1.nodes, D1);
  assert.equal(c1.ok, false);
  assert.equal(c1.reason, 'daily-limit');
  assert.equal(habitDailyAddCount(r1.nodes, D1), 1);

  const r2 = habitAddToTree(r1.nodes, { title: '深蹲' }, D1, NOW + 1);
  assert.equal(r2.ok, false);
  assert.equal(r2.reason, 'daily-limit');
  assert.equal(r2.nodes.length, 1);

  // 次日可再入
  const c2 = habitCanAddToTree(r1.nodes, D2);
  assert.equal(c2.ok, true);
  const r3 = habitAddToTree(r1.nodes, { title: '深蹲' }, D2, NOW + 2);
  assert.equal(r3.ok, true);
  assert.equal(r3.nodes.length, 2);
});

test('habitAddToTree：名额按 addedOn 计，当日失败回库也不退还', () => {
  let r = habitAddToTree([], { id: 'a', title: 'A' }, D1, NOW);
  assert.equal(r.ok, true);
  const failed = habitFailNode(r.nodes, 'a', NOW + 1);
  assert.equal(failed.ok, true);
  assert.equal(habitDailyAddCount(failed.nodes, D1), 1);
  const again = habitAddToTree(failed.nodes, { title: 'B' }, D1, NOW + 2);
  assert.equal(again.ok, false);
  assert.equal(again.reason, 'daily-limit');
});

test('habitAddToTree：提升库内节点；已在树上不可重复', () => {
  const lib = habitAddNode([], { id: 'a', title: 'A', onTree: false }, NOW);
  assert.equal(lib.node.onTree, false);
  assert.equal(habitLibrary(lib.nodes).length, 1);

  const r = habitAddToTree(lib.nodes, { id: 'a' }, D1, NOW + 1);
  assert.equal(r.ok, true);
  assert.equal(r.promoted, true);
  assert.equal(habitFind(r.nodes, 'a').onTree, true);
  assert.equal(habitFind(r.nodes, 'a').addedOn, D1);
  assert.equal(habitFind(r.nodes, 'a').title, 'A');

  const dup = habitAddToTree(r.nodes, { id: 'a' }, D1, NOW + 2);
  assert.equal(dup.ok, false);
  assert.equal(dup.reason, 'already-on-tree');
});

test('habitAddToTree：新建节点带上 parentId', () => {
  const parent = habitAddToTree([], { id: 'p', title: '父' }, D1, NOW);
  const child = habitAddToTree(parent.nodes, { id: 'c', title: '子', parentId: 'p' }, D2, NOW + 1);
  assert.equal(child.ok, true);
  assert.equal(habitFind(child.nodes, 'c').parentId, 'p');
  assert.equal(habitFind(child.nodes, 'c').onTree, true);
});

// ---------- 失败回滚：级联 + 内化不丢 ----------

test('habitFailNode：回习惯库、级联熄灭子孙、内化保留', () => {
  const nodes = [
    node({ id: 'p', title: '父', internalize: 40, onTree: true }),
    node({ id: 'c', title: '子', parentId: 'p', internalize: 22, onTree: true }),
    node({ id: 'g', title: '孙', parentId: 'c', internalize: 8, onTree: true, doneDates: [D1] }),
    node({ id: 'x', title: '旁支', internalize: 55, onTree: true })
  ];
  const r = habitFailNode(nodes, 'p', NOW);
  assert.equal(r.ok, true);
  assert.deepEqual(r.failed, ['p']);
  assert.deepEqual(r.cascaded.sort(), ['c', 'g']);

  const p = habitFind(r.nodes, 'p');
  const c = habitFind(r.nodes, 'c');
  const g = habitFind(r.nodes, 'g');
  const x = habitFind(r.nodes, 'x');

  // 回库：onTree=false，不是硬删
  assert.equal(p.onTree, false);
  assert.equal(c.onTree, false);
  assert.equal(g.onTree, false);
  assert.equal(p.removedAt, null);
  assert.equal(c.removedAt, null);
  assert.equal(g.removedAt, null);

  // 内化进度失败不丢
  assert.equal(p.internalize, 40);
  assert.equal(c.internalize, 22);
  assert.equal(g.internalize, 8);

  // failCount 仅记判败节点
  assert.equal(p.failCount, 1);
  assert.equal(c.failCount, 0);
  assert.equal(g.failCount, 0);

  // 旁支不动
  assert.equal(x.onTree, true);
  assert.equal(x.internalize, 55);

  // 都在习惯库
  assert.equal(habitLibrary(r.nodes).length, 3);
  assert.equal(habitOnTree(r.nodes).length, 1);
});

test('habitFailNode：已在库中的子孙不重复熄灭；缺节点返回 missing', () => {
  const nodes = [
    node({ id: 'p', onTree: true }),
    node({ id: 'c', parentId: 'p', onTree: false, internalize: 30, failCount: 2 })
  ];
  const r = habitFailNode(nodes, 'p', NOW);
  assert.deepEqual(r.cascaded, []);
  assert.equal(habitFind(r.nodes, 'c').failCount, 2);
  assert.equal(habitFind(r.nodes, 'c').internalize, 30);

  const miss = habitFailNode(nodes, 'nobody', NOW);
  assert.equal(miss.ok, false);
  assert.equal(miss.reason, 'missing');
});

// ---------- 内化更新 ----------

test('habitUpdateInternalize：增量与夹取 0..100', () => {
  const base = [node({ id: 'a', internalize: 10 })];
  const up = habitUpdateInternalize(base, 'a', 5, NOW);
  assert.equal(up.ok, true);
  assert.equal(up.node.internalize, 15);

  const over = habitUpdateInternalize(up.nodes, 'a', 999, NOW);
  assert.equal(over.node.internalize, HABIT_INTERNALIZE_MAX);

  const down = habitUpdateInternalize(over.nodes, 'a', -1000, NOW);
  assert.equal(down.node.internalize, 0);

  const bad = habitUpdateInternalize(base, 'a', 'x', NOW);
  assert.equal(bad.ok, false);
  assert.equal(bad.reason, 'bad-delta');

  const miss = habitUpdateInternalize(base, 'nope', 1, NOW);
  assert.equal(miss.ok, false);
  assert.equal(miss.reason, 'missing');

  assert.equal(habitClampInternalize(150), 100);
  assert.equal(habitClampInternalize(-3), 0);
  assert.equal(habitClampInternalize('40'), 40);
});

test('habitInternalizeGain：难度低增量略大', () => {
  assert.equal(habitInternalizeGain({ difficulty: 1 }), 2);
  assert.equal(habitInternalizeGain({ difficulty: 2 }), 2);
  assert.equal(habitInternalizeGain({ difficulty: 3 }), 1);
  assert.equal(habitInternalizeGain({ difficulty: 5 }), 1);
  assert.equal(habitInternalizeGain(null), 2);
});

// ---------- H1 结算：完成 / 未完成 / 无 miss ----------

test('检查态：done / undone / unchecked；habitSetCheck 可切换', () => {
  const n = node({ id: 'a' });
  assert.equal(habitCheckStatus(n, D1), 'unchecked');
  let r = habitSetCheck([n], 'a', 'done', D1, NOW);
  assert.equal(r.ok, true);
  assert.equal(habitCheckStatus(habitFind(r.nodes, 'a'), D1), 'done');
  r = habitSetCheck(r.nodes, 'a', 'undone', D1, NOW + 1);
  assert.equal(habitCheckStatus(habitFind(r.nodes, 'a'), D1), 'undone');
  r = habitSetCheck(r.nodes, 'a', 'unchecked', D1, NOW + 2);
  assert.equal(habitCheckStatus(habitFind(r.nodes, 'a'), D1), 'unchecked');
  // 不影响其他日期
  assert.equal(habitCheckStatus(habitFind(r.nodes, 'a'), D2), 'unchecked');
});

test('habitAllChecked：全员检完才 ok；清单含未检查 id', () => {
  const nodes = [
    node({ id: 'a', doneDates: [D1] }),
    node({ id: 'b', missDates: [D1] }),
    node({ id: 'c' })
  ];
  const g = habitAllChecked(nodes, D1);
  assert.equal(g.ok, false);
  assert.deepEqual(g.unchecked, ['c']);
  assert.equal(g.total, 3);
  const r = habitSetCheck(nodes, 'c', 'undone', D1, NOW);
  assert.equal(habitAllChecked(r.nodes, D1).ok, true);
});

test('结算完成：内化+、强化自动升、记 doneDates/lastOk', () => {
  const r = habitSettleDay([node({ id: 'a', difficulty: 2, internalize: 10, level: 0 })], D1, NOW, {
    doneSet: ['a']
  });
  const a = habitFind(r.nodes, 'a');
  assert.deepEqual(r.completed, ['a']);
  assert.deepEqual(r.incomplete, []);
  assert.deepEqual(r.failed, []);
  assert.equal(a.missCount, 0);
  assert.equal(a.lastOk, D1);
  assert.deepEqual(a.doneDates, [D1]);
  assert.equal(a.internalize, 12); // difficulty≤2 → +2
});

test('结算未完成且无组保护：回库+级联，内化按罚则', () => {
  const nodes = [
    node({ id: 'p', internalize: 40, level: 2 }),
    node({ id: 'c', parentId: 'p', internalize: 22 })
  ];
  // 显式 penalty=0：内化不丢（RSIP 旧口径）
  const r = habitSettleDay(nodes, D1, NOW, { doneSet: [], cfg: { failInternalizePenalty: 0 } });
  assert.deepEqual(r.failed, ['p']);
  assert.deepEqual(r.cascaded, ['c']);
  assert.equal(habitFind(r.nodes, 'p').onTree, false);
  assert.equal(habitFind(r.nodes, 'c').onTree, false);
  assert.equal(habitFind(r.nodes, 'p').internalize, 40);
  assert.equal(habitFind(r.nodes, 'c').internalize, 22);
  assert.equal(habitFind(r.nodes, 'p').level, 1); // 判败降 1
  assert.equal(habitFind(r.nodes, 'c').level, 0); // 子孙不连坐
  assert.equal(habitFind(r.nodes, 'p').failCount, 1);

  // failInternalizePenalty > 0 时扣（H4 默认 15）
  const r2 = habitSettleDay(nodes, D1, NOW, { doneSet: [], cfg: { failInternalizePenalty: 5 } });
  assert.equal(habitFind(r2.nodes, 'p').internalize, 35);
  const r3 = habitSettleDay(nodes, D1, NOW, { doneSet: [] });
  assert.equal(habitFind(r3.nodes, 'p').internalize, 25); // 40-15
});

test('未检查=未完成：用检查态结算（doneDates 之外都是候选）', () => {
  const nodes = [
    node({ id: 'a', doneDates: [D1] }),
    node({ id: 'b', missDates: [D1] }),
    node({ id: 'c' })
  ];
  const r = habitSettleDay(nodes, D1, NOW, {});
  assert.deepEqual(r.completed, ['a']);
  assert.ok(r.incomplete.indexOf('b') >= 0);
  assert.ok(r.incomplete.indexOf('c') >= 0);
  assert.ok(r.allChecked === false); // c 未检查
  // 无组：a 组为空键单人；b、c 各自单人组 → 都违规
  assert.ok(r.failed.indexOf('b') >= 0 || r.protected.indexOf('b') >= 0);
  assert.ok(r.violations.length + r.protected.length === 2);
});

test('完成：只调内化与强化；tolerance/miss 不参与判定', () => {
  const r = habitSettleDay([
    node({ id: 'a', toleranceDays: 99, missCount: 50, doneDates: [D1] }),
    node({ id: 'b', toleranceDays: 0, missCount: 0 })
  ], D1, NOW, { doneSet: ['a'] });
  assert.deepEqual(r.completed, ['a']);
  assert.deepEqual(r.failed, ['b']);
  assert.equal(habitFind(r.nodes, 'a').onTree, true);
  assert.equal(habitFind(r.nodes, 'b').onTree, false);
});

test('手动删除：habitDeleteNode 级联子孙（硬删）', () => {
  const nodes = [
    node({ id: 'p' }),
    node({ id: 'c1', parentId: 'p' }),
    node({ id: 'c2', parentId: 'c1' }),
    node({ id: 'other' })
  ];
  const r = habitDeleteNode(nodes, 'p', NOW);
  assert.deepEqual(r.removed.sort(), ['c1', 'c2', 'p']);
  assert.ok(habitFind(r.nodes, 'p').removedAt);
  assert.equal(habitFind(r.nodes, 'other').removedAt, null);
  assert.deepEqual(habitDescendantIds(nodes, 'p').sort(), ['c1', 'c2']);
});

// ---------- 组保护（minK · 以「已完成」为点亮） ----------

test('标签组：组内已完成 ≥ minK → 未完成受保护', () => {
  const nodes = [
    node({ id: 'a', tag: '晨间' }),
    node({ id: 'b', tag: '晨间' })
  ];
  const r = habitSettleDay(nodes, D1, NOW, { doneSet: ['a'] });
  assert.deepEqual(r.completed, ['a']);
  assert.equal(habitFind(r.nodes, 'b').onTree, true);
  assert.deepEqual(r.failed, []);
  assert.deepEqual(r.protected, ['b']);
});

test('标签组：组内无人完成 → 整组回库', () => {
  const nodes = [
    node({ id: 'a', tag: '晨间' }),
    node({ id: 'b', tag: '晨间' }),
    node({ id: 'c', tag: '夜读', doneDates: [D1] })
  ];
  const r = habitSettleDay(nodes, D1, NOW, { doneSet: ['c'] });
  assert.deepEqual(r.failed.sort(), ['a', 'b']);
  assert.equal(habitFind(r.nodes, 'c').onTree, true);
});

test('组保护不挡级联：父整组失败仍熄灭子孙', () => {
  const nodes = [
    node({ id: 'p', tag: 'A' }),
    node({ id: 'q', tag: 'A' }),
    node({ id: 'c', parentId: 'p', tag: 'B', doneDates: [D1] })
  ];
  const r = habitSettleDay(nodes, D1, NOW, { doneSet: ['c'] });
  assert.ok(r.failed.indexOf('p') >= 0);
  assert.ok(r.failed.indexOf('q') >= 0);
  assert.ok(r.cascaded.indexOf('c') >= 0);
  assert.equal(habitFind(r.nodes, 'c').onTree, false);
});

// ---------- SVG 布局 ----------

test('habitMapLayout：层级坐标、折叠、仅树上节点', () => {
  const nodes = [
    node({ id: 'p', title: '父', createdAt: 1, onTree: true }),
    node({ id: 'c1', title: '子1', parentId: 'p', createdAt: 2, onTree: true, internalize: 60, level: 2 }),
    node({ id: 'c2', title: '子2', parentId: 'p', createdAt: 3, onTree: true }),
    node({ id: 'lib', title: '库', onTree: false })
  ];
  const open = habitMapLayout(nodes, { collapsed: {} });
  assert.equal(open.items.length, 3);
  const p = open.items.filter(function (i) { return i.id === 'p'; })[0];
  const c1 = open.items.filter(function (i) { return i.id === 'c1'; })[0];
  const c2 = open.items.filter(function (i) { return i.id === 'c2'; })[0];
  assert.equal(p.depth, 0);
  assert.equal(c1.depth, 1);
  assert.equal(c2.depth, 1);
  assert.ok(c1.x > p.x);
  assert.ok(c1.y < c2.y);
  assert.equal(p.hasChildren, true);
  assert.equal(c1.internalize, 60);
  assert.equal(c1.level, 2);
  assert.equal(open.edges.length, 2);
  assert.ok(open.width > 0);
  assert.ok(open.height > 0);

  // 折叠 p → 只剩 p
  const folded = habitMapLayout(nodes, { collapsed: { p: true } });
  assert.equal(folded.items.length, 1);
  assert.equal(folded.items[0].id, 'p');
  assert.equal(folded.items[0].collapsed, true);
  assert.equal(folded.edges.length, 0);

  // 库节点不进导图
  assert.equal(open.items.filter(function (i) { return i.id === 'lib'; }).length, 0);
});

test('habitMapLayout：父不在树上时子节点按根布局', () => {
  const nodes = [
    node({ id: 'orphan', parentId: 'gone', onTree: true, createdAt: 1 })
  ];
  const m = habitMapLayout(nodes, {});
  assert.equal(m.items.length, 1);
  assert.equal(m.items[0].depth, 0);
});

// ---------- 树工具 ----------

test('habitCanSetParent：禁自挂/挂子孙，允许合法父', () => {
  const nodes = [
    node({ id: 'p' }),
    node({ id: 'c', parentId: 'p' }),
    node({ id: 'g', parentId: 'c' })
  ];
  assert.equal(habitCanSetParent(nodes, 'p', 'p'), false);
  assert.equal(habitCanSetParent(nodes, 'p', 'c'), false);
  assert.equal(habitCanSetParent(nodes, 'p', 'g'), false);
  assert.equal(habitCanSetParent(nodes, 'c', 'p'), true);
  assert.equal(habitCanSetParent(nodes, 'g', null), true);

  const r = habitSetParent(nodes, 'c', 'g', NOW);
  assert.equal(r.ok, false);
  assert.equal(r.reason, 'cycle');
  const r2 = habitSetParent(nodes, 'c', null, NOW);
  assert.equal(r2.ok, true);
  assert.equal(habitFind(r2.nodes, 'c').parentId, null);
});

test('habitAddNode 默认进习惯库；habitUpdateNode 可改难度/强化', () => {
  const added = habitAddNode([], { title: '背单词', tag: '晨', toleranceDays: 3 }, NOW);
  assert.equal(added.nodes.length, 1);
  assert.equal(added.node.onTree, false);
  assert.equal(added.node.toleranceDays, 3);
  assert.equal(added.node.internalize, 0);
  const up = habitUpdateNode(added.nodes, added.node.id, {
    title: '背 20 词',
    difficulty: 4,
    level: 2,
    internalize: 99
  }, NOW);
  assert.equal(up.node.title, '背 20 词');
  assert.equal(up.node.difficulty, 4);
  assert.equal(up.node.level, 2);
  // internalize 走专用函数
  assert.equal(up.node.internalize, 0);
  const ir = habitUpdateInternalize(up.nodes, up.node.id, 99, NOW);
  assert.equal(ir.node.internalize, 99);
});

test('habitNodeDepth：根 0，子 1，孙 2', () => {
  const nodes = [
    node({ id: 'p' }),
    node({ id: 'c', parentId: 'p' }),
    node({ id: 'g', parentId: 'c' })
  ];
  assert.equal(habitNodeDepth(nodes, 'p'), 0);
  assert.equal(habitNodeDepth(nodes, 'c'), 1);
  assert.equal(habitNodeDepth(nodes, 'g'), 2);
});

test('habitDayStats / habitDots / habitDoneCount：过程反馈字段', () => {
  const n = node({ id: 'a', doneDates: [D1, D2], onTree: true });
  assert.equal(habitDoneCount(n), 2);
  assert.deepEqual(habitDayStats([n], D2), { total: 1, done: 1, undone: 0, unchecked: 0, due: 0 });
  assert.deepEqual(habitDayStats([n, node({ id: 'b', onTree: true })], D3), { total: 2, done: 0, undone: 0, unchecked: 2, due: 2 });
  // 库节点不计入今日待检
  assert.deepEqual(habitDayStats([n, node({ id: 'lib', onTree: false })], D3), { total: 1, done: 0, undone: 0, unchecked: 1, due: 1 });
  const dots = habitDots(n, D3, 7);
  assert.equal(dots.length, 7);
  assert.equal(dots[dots.length - 1].date, D3);
  assert.equal(dots.filter(function (d) { return d.done; }).length, 2);
});

test('habitTagGroups：同 tag 合并，无 tag 各组', () => {
  const g = habitTagGroups([
    node({ id: 'a', tag: 'T' }),
    node({ id: 'b', tag: 'T' }),
    node({ id: 'c', tag: '' }),
    node({ id: 'd' })
  ]);
  assert.equal(g.length, 3);
  const t = g.filter(function (x) { return x.tag === 'T'; })[0];
  assert.equal(t.members.length, 2);
});

test('habitYmd / habitToIdSet / habitNormalizeDoneDates / habitChildrenOf', () => {
  assert.equal(habitYmd(new Date(2026, 2, 5)), '2026-03-05');
  assert.deepEqual(habitToIdSet(['a', 'b', 'a']), new Set(['a', 'b']));
  assert.deepEqual(habitToIdSet(new Set(['x'])), new Set(['x']));
  assert.deepEqual(habitNormalizeDoneDates(['2026-03-02', '2026-03-01', '2026-03-02']), ['2026-03-01', '2026-03-02']);
  const nodes = [node({ id: 'p' }), node({ id: 'c', parentId: 'p' }), node({ id: 'r' })];
  assert.deepEqual(habitChildrenOf(nodes, null).map(function (n) { return n.id; }).sort(), ['p', 'r']);
  assert.deepEqual(habitChildrenOf(nodes, 'p').map(function (n) { return n.id; }), ['c']);
  assert.deepEqual(habitChildrenOf(nodes, 'p', { onTree: true }).map(function (n) { return n.id; }), ['c']);
});

// ---------- T26 组 minK 容错 ----------

test('habitGroupKey：groupId 优先，否则 tag；空键为单人组', () => {
  assert.equal(habitGroupKey({ groupId: 'g1', tag: '晨' }), 'g1');
  assert.equal(habitGroupKey({ groupId: '', tag: '晨' }), '晨');
  assert.equal(habitGroupKey({ tag: '晨' }), '晨');
  assert.equal(habitGroupKey({}), '');
  assert.equal(habitGroupKey(null), '');
});

test('habitSanitizeGroups / habitMinKOf / habitSetGroupMinK：默认与夹取', () => {
  assert.equal(HABIT_MIN_K_DEFAULT, 1);
  assert.equal(HABIT_MIN_K_MAX, 99);
  const g = habitSanitizeGroups([
    { id: '晨间', minK: '2' },
    { id: '晨间', minK: 9 }, // 去重
    { id: '夜读', minK: -3 },
    { id: 'x', minK: 'bad' },
    null
  ]);
  assert.equal(g.length, 3);
  assert.equal(g[0].minK, 2);
  assert.equal(g[1].minK, 0);
  assert.equal(g[2].minK, HABIT_MIN_K_DEFAULT);
  assert.equal(habitMinKOf(g, '晨间'), 2);
  assert.equal(habitMinKOf(g, '未配置'), HABIT_MIN_K_DEFAULT);
  assert.equal(habitMinKOf(g, ''), HABIT_MIN_K_DEFAULT);

  const r = habitSetGroupMinK(g, '晨间', 5);
  assert.equal(r.ok, true);
  assert.equal(r.group.minK, 5);
  const r2 = habitSetGroupMinK(r.groups, '新组', 200);
  assert.equal(r2.group.minK, HABIT_MIN_K_MAX);
  assert.equal(habitClampMinK('3'), 3);
  assert.equal(habitClampMinK(undefined), HABIT_MIN_K_DEFAULT);
});

test('组保护 minK=2：已完成 1 不足名额 → 未完成成员回库', () => {
  const nodes = [
    node({ id: 'a', tag: '晨间' }),
    node({ id: 'b', tag: '晨间' }),
    node({ id: 'c', tag: '晨间', doneDates: [D1] })
  ];
  // 只完成 c → 点亮 1 < minK 2 → a、b 判失败
  const r = habitSettleDay(nodes, D1, NOW, {
    groups: [{ id: '晨间', minK: 2 }],
    doneSet: ['c']
  });
  assert.deepEqual(r.failed.sort(), ['a', 'b']);
  assert.equal(habitFind(r.nodes, 'a').onTree, false);
  assert.equal(habitFind(r.nodes, 'b').onTree, false);
  assert.equal(habitFind(r.nodes, 'c').onTree, true);
  assert.deepEqual(r.protected, []);
});

test('组保护 minK=2：已完成 2 达标 → 未完成受保护', () => {
  const nodes = [
    node({ id: 'a', tag: '晨间' }),
    node({ id: 'b', tag: '晨间', doneDates: [D1] }),
    node({ id: 'c', tag: '晨间', doneDates: [D1] })
  ];
  const r = habitSettleDay(nodes, D1, NOW, {
    groups: [{ id: '晨间', minK: 2 }],
    doneSet: ['b', 'c']
  });
  assert.deepEqual(r.failed, []);
  assert.deepEqual(r.protected, ['a']);
  assert.equal(habitFind(r.nodes, 'a').onTree, true);
});

test('组保护默认 minK=1 对齐 ACT：完成 1 人即保护', () => {
  const nodes = [
    node({ id: 'a', tag: 'T' }),
    node({ id: 'b', tag: 'T' })
  ];
  const r = habitSettleDay(nodes, D1, NOW, { doneSet: ['b'] });
  assert.deepEqual(r.failed, []);
  assert.deepEqual(r.protected, ['a']);
});

test('组保护 minK=0：点亮数恒 ≥0 → 未完成也保护（文档口径）', () => {
  const nodes = [
    node({ id: 'a', tag: 'T' }),
    node({ id: 'b', tag: 'T' })
  ];
  const r = habitSettleDay(nodes, D1, NOW, {
    groups: [{ id: 'T', minK: 0 }],
    doneSet: []
  });
  assert.deepEqual(r.failed, []);
  assert.deepEqual(r.protected.sort(), ['a', 'b']);
});

test('groupId 与 tag 等价成组；habitGroupSummaries 汇总完成/未完成', () => {
  const nodes = [
    node({ id: 'a', groupId: 'g1', tag: '晨', doneDates: [D1] }),
    node({ id: 'b', groupId: 'g1', tag: '晚' }),
    node({ id: 'c', tag: '独狼', doneDates: [D1] })
  ];
  const groups = habitTagGroups(nodes);
  assert.equal(groups.length, 2);
  const g1 = groups.filter(function (g) { return g.key === 'g1'; })[0];
  assert.equal(g1.members.length, 2);

  const sums = habitGroupSummaries(nodes, [{ id: 'g1', minK: 2 }], D1);
  const s1 = sums.filter(function (s) { return s.id === 'g1'; })[0];
  assert.equal(s1.minK, 2);
  assert.equal(s1.members.length, 2);
  assert.equal(s1.lit, 1);
  assert.equal(s1.over, 1);
});

// ---------- T26 强化 level ----------

test('habitLevelFloor / habitAutoLevelOnOk：内化阈值保底 +1/+2', () => {
  assert.equal(habitLevelFloor(0), 0);
  assert.equal(habitLevelFloor(49), 0);
  assert.equal(habitLevelFloor(50), 1);
  assert.equal(habitLevelFloor(99), 1);
  assert.equal(habitLevelFloor(100), 2);
  assert.equal(habitAutoLevelOnOk({ level: 0, internalize: 50 }), 1);
  assert.equal(habitAutoLevelOnOk({ level: 3, internalize: 50 }), 3); // 手动更高不降
  assert.equal(habitAutoLevelOnOk({ level: 0, internalize: 100 }), 2);
  assert.equal(habitClampLevel(99), HABIT_LEVEL_MAX);
  assert.equal(habitClampLevel(-1), 0);
});

test('habitDemoteLevel：失败降 1，不连坐；可关', () => {
  assert.equal(habitDemoteLevel({ level: 2 }), 1);
  assert.equal(habitDemoteLevel({ level: 0 }), 0);
  assert.equal(habitDemoteLevel({ level: 2 }, { demote: false }), 2);
});

test('habitFailNode：判败节点降级 1，子孙不连坐，内化仍不丢', () => {
  const nodes = [
    node({ id: 'p', level: 3, internalize: 40 }),
    node({ id: 'c', parentId: 'p', level: 2, internalize: 22 })
  ];
  const r = habitFailNode(nodes, 'p', NOW);
  assert.equal(habitFind(r.nodes, 'p').level, 2);
  assert.equal(habitFind(r.nodes, 'c').level, 2); // 级联不降级
  assert.equal(habitFind(r.nodes, 'p').internalize, 40);
  assert.equal(habitFind(r.nodes, 'c').internalize, 22);

  const noDemote = habitFailNode(nodes, 'p', NOW, { demote: false });
  assert.equal(habitFind(noDemote.nodes, 'p').level, 3);
});

test('habitLevelDelta：手动升/降夹取 0..MAX', () => {
  const base = [node({ id: 'a', level: 1 })];
  const up = habitLevelDelta(base, 'a', 2, NOW);
  assert.equal(up.node.level, 3);
  const down = habitLevelDelta(up.nodes, 'a', -10, NOW);
  assert.equal(down.node.level, 0);
  const top = habitLevelDelta(down.nodes, 'a', 20, NOW);
  assert.equal(top.node.level, HABIT_LEVEL_MAX);
  const bad = habitLevelDelta(base, 'a', 'x', NOW);
  assert.equal(bad.ok, false);
  const miss = habitLevelDelta(base, 'nope', 1, NOW);
  assert.equal(miss.ok, false);
});

test('履行自动升：内化到 50/100 时强化保底 +1/+2', () => {
  // difficulty=3 → 每次内化 +1
  let nodes = [node({ id: 'a', difficulty: 3, internalize: 49, level: 0 })];
  let r = habitSettleDay(nodes, D1, NOW, { doneSet: ['a'] });
  assert.equal(habitFind(r.nodes, 'a').internalize, 50);
  assert.equal(habitFind(r.nodes, 'a').level, 1);

  nodes = [node({ id: 'b', difficulty: 3, internalize: 99, level: 0 })];
  r = habitSettleDay(nodes, D1, NOW, { doneSet: ['b'] });
  assert.equal(habitFind(r.nodes, 'b').internalize, 100);
  assert.equal(habitFind(r.nodes, 'b').level, 2);
});

test('结算失败：判败根降级，受组保护的不降级', () => {
  const nodes = [
    node({ id: 'a', tag: 'T', level: 2 }),
    node({ id: 'b', tag: 'T', level: 2, doneDates: [D1] })
  ];
  // b 完成 → a 受保护 → 不降级
  const r = habitSettleDay(nodes, D1, NOW, { doneSet: ['b'] });
  assert.deepEqual(r.failed, []);
  assert.equal(habitFind(r.nodes, 'a').level, 2);

  // 无组保护：a 单独成组（无 tag）→ 失败降级
  const solo = habitSettleDay([node({ id: 'x', level: 2 })], D1, NOW, { doneSet: [] });
  assert.deepEqual(solo.failed, ['x']);
  assert.equal(habitFind(solo.nodes, 'x').level, 1);
});

// ---------- T30 H1：设置 / 手动强化 / 自动结算 ----------

test('habitNormalizeCfg：缺省与夹取', () => {
  const c = habitNormalizeCfg(null);
  assert.equal(c.dailyAddLimit, 1);
  assert.equal(c.manualLevelPerDay, 1);
  assert.equal(c.manualLevelKeepRatio, 0.5);
  assert.equal(c.failInternalizePenalty, 15);
  assert.equal(c.autoSettle, true);
  assert.equal(c.levelSteps.length, 2);

  const c2 = habitNormalizeCfg({
    dailyAddLimit: 3,
    manualLevelPerDay: 2,
    manualLevelKeepRatio: 0.8,
    failInternalizePenalty: 10,
    autoSettle: false
  });
  assert.equal(c2.dailyAddLimit, 3);
  assert.equal(c2.manualLevelPerDay, 2);
  assert.equal(c2.manualLevelKeepRatio, 0.8);
  assert.equal(c2.failInternalizePenalty, 10);
  assert.equal(c2.autoSettle, false);

  assert.equal(habitNormalizeCfg({ dailyAddLimit: 0 }).dailyAddLimit, 1);
  assert.equal(habitNormalizeCfg({ manualLevelKeepRatio: 2 }).manualLevelKeepRatio, 0.5);
});

test('habitSettlePreview：不改数据，给出完成/违规/保护', () => {
  const nodes = [
    node({ id: 'a', tag: 'T', doneDates: [D1] }),
    node({ id: 'b', tag: 'T' }),
    node({ id: 'c' })
  ];
  const p = habitSettlePreview(nodes, D1, { doneSet: ['a'] });
  assert.deepEqual(p.completed, ['a']);
  assert.deepEqual(p.protected, ['b']);
  assert.deepEqual(p.violations, ['c']);
  assert.equal(p.allChecked, true); // doneSet 覆盖时不看未检查
  // 不改节点
  assert.equal(habitFind(nodes, 'c').onTree, true);
});

test('手动强化：日 1 次、单习惯、内化保留 50%', () => {
  const nodes = [node({ id: 'a', level: 1, internalize: 80 })];
  const cfg = habitNormalizeCfg(null);
  let state = habitNormalizeState(null);
  const r = habitManualLevelUp(nodes, 'a', D1, NOW, { cfg: cfg, state: state });
  assert.equal(r.ok, true);
  assert.equal(r.node.level, 2);
  assert.equal(r.node.internalize, 40); // 80 * 0.5
  state = r.state;
  assert.equal(state.manualLevelOn, D1);
  assert.equal(state.manualLevelCount, 1);

  // 同日不能再用
  const again = habitManualLevelUp(r.nodes, 'a', D1, NOW + 1, { cfg: cfg, state: state });
  assert.equal(again.ok, false);
  assert.equal(again.reason, 'already-used');

  // 另一个习惯同日也不行（每日仅 1 次）
  const nodes2 = r.nodes.concat([node({ id: 'b', level: 0, internalize: 50 })]);
  const other = habitManualLevelUp(nodes2, 'b', D1, NOW + 2, { cfg: cfg, state: state });
  assert.equal(other.ok, false);
  assert.equal(other.reason, 'daily-limit');

  // 次日可再用
  const nextDay = habitManualLevelUp(r.nodes, 'a', D2, NOW + 3, { cfg: cfg, state: state });
  assert.equal(nextDay.ok, true);
  assert.equal(nextDay.state.manualLevelOn, D2);

  const can = habitCanManualLevel(state, D1, cfg);
  assert.equal(can.ok, false);
  assert.equal(habitCanManualLevel(state, D2, cfg).ok, true);
});

test('手动强化：keepRatio 可配；manualLevelPerDay=0 禁用', () => {
  const nodes = [node({ id: 'a', level: 0, internalize: 100 })];
  const cfg = habitNormalizeCfg({ manualLevelKeepRatio: 0, manualLevelPerDay: 0 });
  const r = habitManualLevelUp(nodes, 'a', D1, NOW, { cfg: cfg, state: habitNormalizeState(null) });
  assert.equal(r.ok, false);
  assert.equal(r.reason, 'daily-limit');

  const cfg2 = habitNormalizeCfg({ manualLevelKeepRatio: 1, manualLevelPerDay: 1 });
  const r2 = habitManualLevelUp(nodes, 'a', D1, NOW, { cfg: cfg2, state: habitNormalizeState(null) });
  assert.equal(r2.ok, true);
  assert.equal(r2.node.internalize, 100);
  assert.equal(r2.node.level, 1);
});

test('habitPendingSettleDates：补齐到昨日，已结算跳过', () => {
  const state = habitNormalizeState({ settledDates: [D1] });
  const pending = habitPendingSettleDates(state, D3, D1);
  assert.deepEqual(pending, [D2]);
  const none = habitPendingSettleDates(habitNormalizeState({ settledDates: [D1, D2] }), D3, D1);
  assert.deepEqual(none, []);
});

test('RSIP 闭环：入树 → 结算完成内化+ → 未完成回库 → 次日再入树', () => {
  let nodes = [];
  // D1 入树
  let r = habitAddToTree(nodes, { id: 'a', title: 'A', difficulty: 3 }, D1, NOW);
  assert.equal(r.ok, true);
  nodes = r.nodes;
  // D1 结算完成
  r = habitSettleDay(nodes, D1, NOW + 1, { doneSet: ['a'] });
  assert.equal(habitFind(r.nodes, 'a').internalize, 1);
  nodes = r.nodes;
  // D2 未完成 → 回库（penalty=0 保内化）
  r = habitSettleDay(nodes, D2, NOW + 3, { doneSet: [], cfg: { failInternalizePenalty: 0 } });
  assert.equal(habitFind(r.nodes, 'a').onTree, false);
  assert.equal(habitFind(r.nodes, 'a').internalize, 1);
  nodes = r.nodes;
  // D2 失败回库不占用当日入树名额（名额只看 addedOn）
  assert.equal(habitCanAddToTree(nodes, D2).ok, true);
  // D3 重新入树，内化保留
  r = habitAddToTree(nodes, { id: 'a' }, D3, NOW + 4);
  assert.equal(r.ok, true);
  assert.equal(habitFind(r.nodes, 'a').onTree, true);
  assert.equal(habitFind(r.nodes, 'a').internalize, 1);
  assert.equal(habitFind(r.nodes, 'a').addedOn, D3);
  // 同日名额用尽
  assert.equal(habitCanAddToTree(r.nodes, D3).ok, false);
});
