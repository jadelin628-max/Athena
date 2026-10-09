import test from 'node:test';
import assert from 'node:assert/strict';
import {
  FOCUS_DURATIONS,
  FOCUS_DEFAULT_DURATION,
  FOCUS_SCOUT_MIN,
  FOCUS_SCOUT_EXTEND_MIN,
  FOCUS_RESERVE_WINDOW_MS,
  FOCUS_TYPE_KEYS,
  FOCUS_FORMAL_TYPE_KEYS,
  FOCUS_ORG_LEVELS,
  FOCUS_SEQ_KEYS,
  FOCUS_TIER_MAIN,
  FOCUS_TIER_NORMAL,
  FOCUS_RESERVE_CHAIN_ID,
  FOCUS_ROLE_RESERVE,
  focusDefaultSettings,
  focusDefaultState,
  focusClampPct,
  focusYmd,
  focusSanitizeState,
  focusSanitizeChain,
  focusSanitizeOrg,
  focusFindChain,
  focusFindOrg,
  focusFindUnit,
  focusSeqLabel,
  focusUnitLabel,
  focusOrgLabel,
  focusWorkLabel,
  focusIsPrecedent,
  focusReservationRemainingMs,
  focusUnitRemainingMs,
  focusCanComplete,
  focusUnitKey,
  focusTickPlan,
  focusMainChain,
  focusSetTypeName,
  focusSetLevelName,
  focusSetFlavor,
  focusSetStructure,
  focusSetPlanMode,
  focusCreateChain,
  focusCreateMainChain,
  focusSetSeatNote,
  focusSetActive,
  focusReserve,
  focusExpireReservations,
  focusIsReserveChain,
  focusBumpReserveCount,
  focusSitDown,
  focusCompleteUnit,
  focusSetUnitName,
  focusScoutPromote,
  focusFlagSuspicious,
  focusResolveSuspicious,
  focusScoutStart,
  focusScoutEnd,
  focusSuccession,
  focusStrongestNormal,
  focusDailyMinutes,
  focusDailyAvgCompletion,
  focusHeatData,
  focusTrendSeries,
  focusCreateOrg,
  focusRenameOrg,
  focusDeleteOrg,
  focusAssignUnit,
  focusAssignUnits,
  focusReparentOrgs,
  focusUnassignedUnits,
  focusDescendantUnitIds,
  focusOrgAggregates,
  focusOrgCanFormalize,
  focusFormalizeOrg,
  focusTemplateTriad,
  focusTreeRows,
  focusPlanCreate,
  focusPlanFilledCount,
  focusPlanDueSoon,
  focusPlanSettle,
  FOCUS_LEVEL_KEYS,
  FOCUS_LEVEL_RANK,
  FOCUS_MIN_CHILD_MIN,
  FOCUS_MIN_CHILD_MAX,
  focusIsLevelKey,
  focusIsOrgLevel,
  focusLevelRank,
  focusLevelAtRank,
  focusParentLevelOf,
  focusChildLevelOf,
  focusCanAttach,
  focusNodeLevel,
  focusCombineLevelOf,
  focusCombineNodes,
  focusNextSeq,
  focusMaxSeq,
  focusNormalizeMinChildCount,
  focusMinChildCountValid,
  focusNormalizeDueAt,
  focusDueDateValid,
  focusPlanNodeFields,
  focusAttachNodes,
  focusNextLevelCount,
  FOCUS_LEVEL_VISUALS,
  FOCUS_LEVEL_VISUAL_KEYS,
  focusLevelVisual,
  focusLevelVisualDelta,
  focusLevelBadge,
  focusParentAttribution,
  focusReminderInfo,
  focusReminderSync,
  focusReminderStart,
  focusReminderClear,
  FOCUS_REMINDER_UI_KEY
} from '../src/focus.mjs';

const NOW = 1770000000000;
const MIN = 60000;

function makeState(opts) {
  const o = opts || {};
  let st = focusDefaultState();
  st = focusSetPlanMode(st, true).state;
  st = focusCreateChain(st, { id: 'n1', tier: FOCUS_TIER_NORMAL, unitMinutes: 25, seatNote: '书桌' }, NOW).state;
  if (o.main) {
    st = focusCreateChain(st, { id: 'm1', tier: FOCUS_TIER_MAIN, unitMinutes: 25 }, NOW).state;
  }
  return st;
}

function startAndFinish(st, chainId, startAt, endAt, opts) {
  const o = Object.assign({ taskText: '测试任务' }, opts || {});
  const r1 = focusSitDown(st, chainId, startAt, o);
  assert.equal(r1.ok, true, 'sitDown should ok');
  const r2 = focusCompleteUnit(r1.state, chainId, endAt, {
    achieved: true,
    completion: o.completion == null ? 100 : o.completion,
    name: o.name
  });
  assert.equal(r2.ok, true, 'complete should ok');
  return r2;
}

// ---------- 常量 / 设置 ----------

test('常量：主链/普通链 tier、番号前缀、类型五种', () => {
  assert.equal(FOCUS_TIER_MAIN, 'main');
  assert.equal(FOCUS_TIER_NORMAL, 'normal');
  assert.equal(FOCUS_SEQ_KEYS.unit, '#');
  assert.equal(FOCUS_SEQ_KEYS.group, '●');
  assert.equal(FOCUS_SEQ_KEYS.corps, '▲');
  assert.equal(FOCUS_SEQ_KEYS.army, '◆');
  assert.deepEqual(FOCUS_TYPE_KEYS, ['focus', 'assault', 'life', 'plan', 'scout']);
  assert.deepEqual(FOCUS_FORMAL_TYPE_KEYS, ['focus', 'assault', 'life', 'plan']);
  assert.deepEqual(FOCUS_ORG_LEVELS, ['group', 'corps', 'army']);
});

test('缺省设置：风味/三三制仅设置项，planMode 默认关', () => {
  const s = focusDefaultSettings();
  assert.equal(s.flavor, false);
  assert.equal(s.structure, 'free');
  assert.equal(s.levelNames.unit, '任务单元');
  const st = focusDefaultState();
  assert.equal(st.planMode, false);
});

// ---------- 主链唯一 + 继承 ----------

test('主链：同一时间只能有一个', () => {
  let st = focusCreateChain(focusDefaultState(), { id: 'm1', tier: FOCUS_TIER_MAIN }, NOW).state;
  assert.ok(focusMainChain(st));
  const r = focusCreateChain(st, { id: 'm2', tier: FOCUS_TIER_MAIN }, NOW);
  assert.equal(r.ok, false);
  assert.equal(r.reason, 'main_exists');
  // 旧数据 elite→main 迁移
  const legacy = focusSanitizeChain({ id: 'x', tier: 'elite' });
  assert.equal(legacy.tier, FOCUS_TIER_MAIN);
  // sanitize 保证 main 唯一
  const st2 = focusSanitizeState({
    chains: [
      { id: 'a', tier: 'main' },
      { id: 'b', tier: 'main' }
    ]
  });
  assert.equal(st2.chains.filter(function (c) { return c.tier === FOCUS_TIER_MAIN; }).length, 1);
});

test('主链：重新创建 | 从普通链继承', () => {
  let st = focusDefaultState();
  st = focusCreateChain(st, { id: 'n1', tier: FOCUS_TIER_NORMAL }, NOW).state;
  st = focusCompleteUnit(
    focusSitDown(st, 'n1', NOW, { taskText: 'a' }).state, 'n1', NOW + 25 * MIN,
    { achieved: true, completion: 90 }
  ).state;
  assert.equal(focusFindChain(st, 'n1').workCount, 1);

  // 重新创建
  let r = focusCreateMainChain(st, { mode: 'fresh', seatNote: 'x' }, NOW);
  assert.equal(r.ok, true);
  assert.equal(r.chain.tier, FOCUS_TIER_MAIN);
  assert.equal(r.chain.workCount, 0);
  assert.equal(r.chain.inheritedFrom, null);

  // 继承
  r = focusCreateMainChain(st, { mode: 'inherit', fromChainId: 'n1' }, NOW);
  assert.equal(r.ok, true);
  assert.equal(r.chain.workCount, 1);
  assert.equal(r.chain.inheritedFrom, 'n1');

  // 已有主链再建被拒
  st = r.state;
  assert.equal(focusCreateMainChain(st, { mode: 'fresh' }, NOW).ok, false);
  // 不能从主链继承
  st = makeState({ main: true });
  assert.equal(focusCreateMainChain(st, { mode: 'inherit', fromChainId: 'm1' }, NOW).ok, false);
});

// ---------- 单元任务化（完成度实装） ----------

test('开始必填任务内容；计时结束才可完成', () => {
  let st = makeState();
  assert.equal(focusSitDown(st, 'n1', NOW, { taskText: '' }).reason, 'empty_task');
  st = focusSitDown(st, 'n1', NOW, { taskText: 'x' }).state;
  assert.equal(focusCanComplete(focusFindChain(st, 'n1').current, NOW + 10 * MIN), false);
  assert.equal(focusCompleteUnit(st, 'n1', NOW + 10 * MIN, { achieved: true, completion: 50 }).reason, 'timer_not_done');
  const r = focusCompleteUnit(st, 'n1', NOW + 25 * MIN, { achieved: true, completion: 80 });
  assert.equal(r.ok, true);
  assert.equal(r.unit.completion, 80);
  assert.equal(r.unit.actualMin, 25);
});

test('完成度询问：达成/未达成 + 0–100 夹取 + 单元名可编辑', () => {
  let st = makeState();
  st = focusSitDown(st, 'n1', NOW, { taskText: '第三章习题' }).state;
  let r = focusCompleteUnit(st, 'n1', NOW + 25 * MIN, { achieved: false, completion: 40, name: '习题组A' });
  assert.equal(r.unit.achieved, false);
  assert.equal(r.unit.completion, 40);
  assert.equal(r.unit.name, '习题组A');
  st = r.state;
  st = focusSitDown(st, 'n1', NOW + 30 * MIN, { taskText: 'b' }).state;
  r = focusCompleteUnit(st, 'n1', NOW + 55 * MIN, { achieved: true, completion: 250 });
  assert.equal(r.unit.completion, 100);
  // name 缺省 = taskText
  assert.equal(r.unit.name, 'b');
  // 可改名
  const r2 = focusSetUnitName(r.state, r.unit.id, '改过的名字', NOW);
  assert.equal(r2.ok, true);
  assert.equal(r2.unit.name, '改过的名字');
});

test('全局流水 #N 不回收；清链不回收', () => {
  let st = makeState();
  st = startAndFinish(st, 'n1', NOW, NOW + 25 * MIN).state;
  st = startAndFinish(st, 'n1', NOW + 30 * MIN, NOW + 55 * MIN).state;
  st = focusSitDown(st, 'n1', NOW + 60 * MIN, { taskText: 's' }).state;
  st = focusFlagSuspicious(st, 'n1', '刷手机', NOW + 61 * MIN).state;
  st = focusResolveSuspicious(st, 'n1', 'clear', NOW + 62 * MIN).state;
  assert.equal(focusFindChain(st, 'n1').workCount, 0);
  assert.equal(st.seq.unit, 2);
  const r = startAndFinish(st, 'n1', NOW + 70 * MIN, NOW + 95 * MIN);
  assert.equal(r.unit.seq, 3);
});

test('侦查转正后入正式单元', () => {
  let st = makeState();
  st = focusScoutStart(st, 'n1', NOW, { taskText: '看提纲' }).state;
  assert.equal(focusScoutPromote(st, 'n1', 'assault', NOW + 2 * MIN).reason, 'timer_not_done');
  const r = focusScoutPromote(st, 'n1', 'assault', NOW + 5 * MIN);
  assert.equal(r.ok, true);
  const r2 = focusCompleteUnit(r.state, 'n1', NOW + 5 * MIN, { achieved: true, completion: 90 });
  assert.equal(r2.unit.typeKey, 'assault');
  assert.equal(r2.unit.completion, 90);
});

// ---------- 统计：均完成度趋势 ----------

test('日实际分钟 + 日均完成度 + 趋势序列', () => {
  let st = makeState();
  const day0 = NOW;
  const day1 = NOW + 86400000;
  st = startAndFinish(st, 'n1', day0, day0 + 30 * MIN, { minutes: 30, completion: 80 }).state;
  st = startAndFinish(st, 'n1', day1, day1 + 25 * MIN, { completion: 100 }).state;
  st = startAndFinish(st, 'n1', day1 + 60 * MIN, day1 + 80 * MIN, { minutes: 20, completion: 60 }).state;

  const map = focusDailyMinutes(st);
  assert.equal(map[focusYmd(day0)], 30);
  assert.equal(map[focusYmd(day1)], 45);

  const avg = focusDailyAvgCompletion(st);
  assert.equal(avg[focusYmd(day0)], 80);
  assert.equal(avg[focusYmd(day1)], 80); // (100+60)/2

  const trend = focusTrendSeries(st, 7, day1);
  assert.equal(trend.length, 7);
  assert.equal(trend[6].avgCompletion, 80);
  assert.equal(trend[5].avgCompletion, 80);
  assert.equal(trend[6].minutes, 45);
});

// ---------- CTDP 壳 ----------

test('下必为例二选一 + 判例', () => {
  let st = makeState();
  st = startAndFinish(st, 'n1', NOW, NOW + 25 * MIN).state;
  st = focusSitDown(st, 'n1', NOW + 30 * MIN, { taskText: 'b' }).state;
  st = focusFlagSuspicious(st, 'n1', '刷短视频', NOW + 31 * MIN).state;
  const r = focusResolveSuspicious(st, 'n1', 'allow', NOW + 32 * MIN);
  assert.equal(r.decision, 'allow');
  assert.ok(focusIsPrecedent(r.state.precedents, '刷短视频'));
  const r2 = focusFlagSuspicious(r.state, 'n1', '刷短视频', NOW + 33 * MIN);
  assert.equal(r2.alreadyAllowed, true);
});

test('预约 15 分钟窗', () => {
  let st = makeState();
  st = focusReserve(st, 'n1', NOW).state;
  assert.equal(focusReservationRemainingMs(focusFindChain(st, 'n1').reservation, NOW + 5 * MIN), 10 * MIN);
  const r = focusSitDown(st, 'n1', NOW + FOCUS_RESERVE_WINDOW_MS + 1, { taskText: 'x' });
  assert.equal(r.reason, 'reservation_expired');
});

test('主链崩溃 → 最强普通链继位', () => {
  let st = focusDefaultState();
  st = focusCreateChain(st, { id: 'm1', tier: FOCUS_TIER_MAIN }, NOW).state;
  st = focusCreateChain(st, { id: 'n1', tier: FOCUS_TIER_NORMAL }, NOW).state;
  st = focusCreateChain(st, { id: 'n2', tier: FOCUS_TIER_NORMAL }, NOW).state;
  st = startAndFinish(st, 'n1', NOW + 1 * MIN, NOW + 26 * MIN).state;
  st = startAndFinish(st, 'n2', NOW + 2 * MIN, NOW + 27 * MIN).state;
  st = startAndFinish(st, 'n2', NOW + 30 * MIN, NOW + 55 * MIN).state;
  st = focusSitDown(st, 'm1', NOW + 60 * MIN, { taskText: 'e' }).state;
  st = focusFlagSuspicious(st, 'm1', '打开游戏', NOW + 61 * MIN).state;
  const r = focusResolveSuspicious(st, 'm1', 'clear', NOW + 62 * MIN);
  assert.equal(r.successorId, 'n2');
  assert.equal(focusFindChain(r.state, 'n2').tier, FOCUS_TIER_MAIN);
});

// ---------- 状态树 / 计划并入 ----------

test('高层次创建须计划模式', () => {
  let st = focusDefaultState();
  assert.equal(focusCreateOrg(st, { level: 'group' }, NOW).reason, 'need_plan_mode');
  st = focusSetPlanMode(st, true).state;
  const r = focusCreateOrg(st, { level: 'group', name: 'G' }, NOW);
  assert.equal(r.ok, true);
  assert.equal(r.org.fromPlan, true);
  assert.equal(r.org.formalized, false);
});

test('番号复用：删除编制后同层复用最小空缺号，已有号不变、不重号', () => {
  let st = focusSetPlanMode(focusDefaultState(), true).state;
  let r = focusCreateOrg(st, { level: 'group' }, NOW);
  assert.equal(focusOrgLabel(r.org, st.settings).indexOf('●1'), 0);
  st = r.state;
  r = focusCreateOrg(st, { level: 'corps' }, NOW);
  assert.equal(focusOrgLabel(r.org, st.settings).indexOf('▲1'), 0);
  st = r.state;
  const g2 = focusCreateOrg(st, { level: 'group' }, NOW);
  assert.equal(g2.org.seq, 2);
  st = g2.state;
  const g2Id = g2.org.id;
  // 删除 group#2 以外的 group#1 → 新建 group 复用 1
  const g1Id = st.orgs.filter((o) => o.level === 'group' && o.seq === 1)[0].id;
  st = focusDeleteOrg(st, g1Id, NOW).state;
  assert.equal(focusFindOrg(st, g1Id), null);
  r = focusCreateOrg(st, { level: 'group' }, NOW);
  assert.equal(r.org.seq, 1);
  st = r.state;
  // 已有 group#2 号不变
  assert.equal(focusFindOrg(st, g2Id).seq, 2);
  assert.equal(focusFindOrg(st, r.org.id).seq, 1);
  // 同层不重号
  const groupSeqs = st.orgs.filter((o) => o.level === 'group').map((o) => o.seq).sort();
  assert.deepEqual(groupSeqs, [1, 2]);
  // 1、2 都占用后取 3
  st = focusCreateOrg(st, { level: 'group' }, NOW).state;
  r = focusCreateOrg(st, { level: 'group' }, NOW);
  assert.equal(r.org.seq, 4);
  st = r.state;
  // 删除中间号（2）后新建仍取最小空缺 2，不动 1/3/4
  st = focusDeleteOrg(st, g2Id, NOW).state;
  r = focusCreateOrg(st, { level: 'group' }, NOW);
  assert.equal(r.org.seq, 2);
  st = r.state;
  assert.deepEqual(st.orgs.filter((o) => o.level === 'group').map((o) => o.seq).sort(), [1, 2, 3, 4]);
  // 层间独立：corps 仍是 1，group 删除不影响
  assert.deepEqual(st.orgs.filter((o) => o.level === 'corps').map((o) => o.seq), [1]);
  // 计数器与现存最大号取齐
  assert.equal(st.seq.group, 4);
  assert.equal(st.seq.corps, 1);
  // 单元流水独立：编制删除不回收单元番号
  const u = focusCreateOrg(st, { level: 'group' }, NOW);
  st = u.state;
  assert.equal(focusNextSeq(st, 'unit'), 1);
  assert.equal(focusMaxSeq(st, 'unit'), 0);
  assert.equal(focusMaxSeq(st, 'group'), 5);
});

test('单元可编辑名字 + 显示完成度/时长/起止', () => {
  let st = makeState();
  st = startAndFinish(st, 'n1', NOW, NOW + 25 * MIN, { name: '习题 A', completion: 75 }).state;
  const u = st.units[0];
  assert.equal(u.name, '习题 A');
  assert.equal(u.completion, 75);
  assert.equal(u.actualMin, 25);
  assert.ok(u.startedAt && u.endedAt);
  // label 含名字
  assert.ok(focusUnitLabel(u, st.settings).indexOf('习题 A') >= 0);
});

test('高层聚合：子树总起止 / 总时长 / 均完成度', () => {
  let st = makeState();
  st = focusSetPlanMode(st, true).state;
  let r = focusCreateOrg(st, { level: 'group', name: 'G1', fromPlan: true }, NOW);
  const g = r.org;
  st = r.state;
  // 两个单元编入
  st = startAndFinish(st, 'n1', NOW, NOW + 25 * MIN, { minutes: 25, completion: 80 }).state;
  st = startAndFinish(st, 'n1', NOW + 100 * MIN, NOW + 130 * MIN, { minutes: 30, completion: 60 }).state;
  st = focusAssignUnits(st, st.units.map(function (u) { return u.id; }), g.id, NOW).state;

  const agg = focusOrgAggregates(st, g.id);
  assert.equal(agg.unitCount, 2);
  assert.equal(agg.totalMin, 55);
  assert.equal(agg.avgCompletion, 70);
  assert.equal(agg.startAt, NOW);
  assert.equal(agg.endAt, NOW + 130 * MIN);
});

test('树内多选组合：批量编入 + 批量改父', () => {
  let st = makeState();
  st = focusSetPlanMode(st, true).state;
  let r = focusCreateOrg(st, { level: 'group', name: 'G', fromPlan: true }, NOW);
  const g = r.org;
  st = r.state;
  st = startAndFinish(st, 'n1', NOW, NOW + 25 * MIN).state;
  st = startAndFinish(st, 'n1', NOW + 30 * MIN, NOW + 55 * MIN).state;
  const ids = st.units.map(function (u) { return u.id; });
  r = focusAssignUnits(st, ids, g.id, NOW);
  assert.equal(r.ok, true);
  assert.equal(r.touched.length, 2);
  assert.equal(focusUnassignedUnits(r.state).length, 0);

  // 批量改父：两个 group 挂到 corps
  st = r.state;
  const g2r = focusCreateOrg(st, { level: 'group', fromPlan: true }, NOW);
  const g2 = g2r.org;
  st = g2r.state;
  st = focusCreateOrg(st, { level: 'corps', fromPlan: true }, NOW).state;
  const corps = st.orgs.filter(function (o) { return o.level === 'corps'; })[0];
  r = focusReparentOrgs(st, [g.id, g2.id], corps.id, NOW);
  assert.equal(r.ok, true);
  assert.equal(r.touched.length, 2);
  assert.equal(focusFindOrg(r.state, g.id).parentId, corps.id);
});

test('计划高层转正：须至少一个下级；转正后为正式层次', () => {
  let st = makeState();
  st = focusSetPlanMode(st, true).state;
  let r = focusCreateOrg(st, { level: 'group', name: 'P', fromPlan: true }, NOW);
  const g = r.org;
  st = r.state;
  // 空节点不可转正
  assert.equal(focusOrgCanFormalize(st, g.id).ok, false);
  assert.equal(focusFormalizeOrg(st, g.id, NOW).reason, 'need_fill');
  // 填一个下级（自由模式：子单元或子 org）
  st = startAndFinish(st, 'n1', NOW, NOW + 25 * MIN).state;
  st = focusAssignUnit(st, st.units[0].id, g.id, NOW).state;
  assert.equal(focusOrgCanFormalize(st, g.id).ok, true);
  r = focusFormalizeOrg(st, g.id, NOW);
  assert.equal(r.ok, true);
  assert.equal(r.org.formalized, true);
  assert.equal(r.org.fromPlan, true);
  // 已转正不可重复
  assert.equal(focusFormalizeOrg(r.state, g.id, NOW).reason, 'already_formal');
});

test('竖列树行含聚合与折叠', () => {
  let st = makeState();
  st = focusSetPlanMode(st, true).state;
  const gr = focusCreateOrg(st, { level: 'group', name: 'G', fromPlan: true }, NOW);
  const g = gr.org;
  st = gr.state;
  st = startAndFinish(st, 'n1', NOW, NOW + 25 * MIN).state;
  st = focusAssignUnit(st, st.units[0].id, g.id, NOW).state;

  let rows = focusTreeRows(st, {});
  const orgRow = rows.filter(function (x) { return x.kind === 'org' && x.id === g.id; })[0];
  assert.ok(orgRow);
  assert.equal(orgRow.aggregates.unitCount, 1);
  assert.ok(orgRow.aggregates.avgCompletion != null);

  rows = focusTreeRows(st, { collapsed: (function () { const c = {}; c[g.id] = true; return c; })() });
  assert.equal(rows.filter(function (x) { return x.kind === 'unit' && x.unit.orgId === g.id; }).length, 0);
});

test('三三制模板也须计划模式', () => {
  let st = focusDefaultState();
  assert.equal(focusTemplateTriad(st, { count: 3 }, NOW).reason, 'need_plan_mode');
  st = focusSetPlanMode(st, true).state;
  const r = focusTemplateTriad(st, { count: 3 }, NOW);
  assert.equal(r.created.length, 3);
});

test('风味开关仅设置：开后类型名/层次名，# 始终显示', () => {
  let st = makeState();
  st = startAndFinish(st, 'n1', NOW, NOW + 25 * MIN).state;
  const u = st.units[0];
  assert.ok(focusUnitLabel(u, st.settings).indexOf('#1') === 0);
  st = focusSetFlavor(st, true).state;
  assert.ok(focusUnitLabel(u, st.settings).indexOf('专注') >= 0);
  assert.ok(focusUnitLabel(u, st.settings).indexOf('#1') === 0);
  st = focusSetStructure(st, 'triad').state;
  assert.equal(st.settings.structure, 'triad');
  st = focusSetTypeName(st, 'focus', '深度工作', NOW).state;
  st = focusSetLevelName(st, 'group', '小队', NOW).state;
  assert.equal(st.settings.typeNames.focus, '深度工作');
  assert.equal(st.settings.levelNames.group, '小队');
});

test('计划模式：未填满整链清空 / 填满 done', () => {
  let st = makeState();
  let r = focusPlanCreate(st, { title: '线代第三章', dueAt: NOW + 7 * 86400000, targetCount: 3 }, NOW);
  st = r.state;
  const plan = r.plan;
  st = startAndFinish(st, 'n1', NOW + 60 * MIN, NOW + 85 * MIN, { completion: 100 }).state;
  // 未挂 planId，计 0
  r = focusPlanSettle(st, plan.id, NOW + 8 * 86400000);
  assert.equal(r.cleared, true);
  assert.equal(focusFindChain(r.state, 'n1').workCount, 0);

  // 填满
  st = makeState();
  r = focusPlanCreate(st, { title: '小目标', dueAt: NOW + 86400000, targetCount: 1 }, NOW);
  st = r.state;
  st = focusSitDown(st, 'n1', NOW, { taskText: 'done', planId: r.plan.id }).state;
  st = focusCompleteUnit(st, 'n1', NOW + 25 * MIN, { achieved: true, completion: 100 }).state;
  assert.equal(focusPlanFilledCount(st, r.plan.id), 1);
  const r2 = focusPlanSettle(st, r.plan.id, NOW + 2 * 86400000);
  assert.equal(r2.cleared, false);
  assert.equal(r2.plan.status, 'done');
});

test('临近截止提醒', () => {
  let st = makeState();
  st = focusPlanCreate(st, { title: '快到期', dueAt: NOW + 2 * 86400000, targetCount: 2 }, NOW).state;
  st = focusPlanCreate(st, { title: '还早', dueAt: NOW + 30 * 86400000, targetCount: 2 }, NOW).state;
  const soon = focusPlanDueSoon(st, NOW);
  assert.equal(soon.length, 1);
  assert.equal(soon[0].title, '快到期');
});

test('sanitize：elite→main、单元 name、org formalized', () => {
  const st = focusSanitizeState({
    chains: [{ id: 'x', tier: 'elite' }],
    units: [{ id: 'u1', seq: 1, typeKey: 'zzz', taskText: 't', name: 'N' }],
    orgs: [{ id: 'g1', level: 'group', seq: 1, fromPlan: true }],
    planMode: 1
  });
  const x = focusFindChain(st, 'x');
  assert.equal(x.tier, FOCUS_TIER_MAIN);
  assert.equal(st.units[0].name, 'N');
  assert.equal(st.units[0].typeKey, 'focus');
  assert.equal(st.orgs[0].fromPlan, true);
  assert.equal(st.orgs[0].formalized, false);
  assert.equal(st.planMode, true);
  // 预约链自动存在
  assert.ok(focusFindChain(st, FOCUS_RESERVE_CHAIN_ID));
});

test('focusUnitRemainingMs / focusClampPct / focusYmd', () => {
  assert.equal(focusUnitRemainingMs({ startedAt: NOW, plannedMin: 25 }, NOW), 25 * MIN);
  assert.equal(focusUnitRemainingMs({ startedAt: NOW, plannedMin: 25 }, NOW + 30 * MIN), 0);
  assert.equal(focusClampPct(150), 100);
  assert.equal(focusClampPct(-1), 0);
  assert.equal(focusYmd(NOW), focusYmd(NOW + 60000));
});

// ---------- 预约链自动存在 + 计数规则 ----------

test('预约链自动存在，无需创建，仅计数不入编制', () => {
  const st = focusDefaultState();
  const rc = focusFindChain(st, FOCUS_RESERVE_CHAIN_ID);
  assert.ok(rc, 'auto reserve chain');
  assert.equal(rc.role, FOCUS_ROLE_RESERVE);
  assert.equal(focusIsReserveChain(rc), true);
  assert.equal(focusStrongestNormal(st), null);
  // 自身不可预约/就座
  assert.equal(focusReserve(st, FOCUS_RESERVE_CHAIN_ID, NOW).reason, 'reserve_chain_bound');
  assert.equal(focusSitDown(st, FOCUS_RESERVE_CHAIN_ID, NOW, { taskText: 'x' }).reason, 'reserve_chain_bound');
});

test('预约链计数绑定其他链预约：成功就座 +1', () => {
  let st = makeState();
  let r = focusReserve(st, 'n1', NOW);
  assert.equal(r.ok, true);
  st = r.state;
  assert.equal(focusFindChain(st, FOCUS_RESERVE_CHAIN_ID).workCount, 0);
  r = focusSitDown(st, 'n1', NOW + 5 * MIN, { taskText: '专注' });
  assert.equal(r.ok, true);
  assert.equal(r.reserveCounted, true);
  assert.equal(r.reserveLabel, '#1');
  assert.equal(focusFindChain(r.state, FOCUS_RESERVE_CHAIN_ID).workCount, 1);
  // 无预约就座不计预约链
  st = focusCompleteUnit(r.state, 'n1', NOW + 30 * MIN).state;
  r = focusSitDown(st, 'n1', NOW + 40 * MIN, { taskText: 'b' });
  assert.equal(r.reserveCounted, false);
  assert.equal(focusFindChain(r.state, FOCUS_RESERVE_CHAIN_ID).workCount, 1);
});

test('预约链：其他链预约违规 → 从零开始', () => {
  let st = makeState();
  st = focusReserve(st, 'n1', NOW).state;
  st = focusSitDown(st, 'n1', NOW + 1 * MIN, { taskText: 'a' }).state;
  assert.equal(focusFindChain(st, FOCUS_RESERVE_CHAIN_ID).workCount, 1);
  st = focusCompleteUnit(st, 'n1', NOW + 26 * MIN).state;
  // 第二次预约但超时
  st = focusReserve(st, 'n1', NOW + 30 * MIN).state;
  const r = focusExpireReservations(st, NOW + 30 * MIN + 15 * MIN + 1);
  assert.equal(r.reserveReset, true);
  assert.equal(focusFindChain(r.state, FOCUS_RESERVE_CHAIN_ID).workCount, 0);
});

test('预约链遵守下必为例（在绑定的普通链上）', () => {
  let st = makeState();
  let r = focusSitDown(st, 'n1', NOW, { taskText: 'x' });
  assert.equal(r.ok, true);
  assert.equal(r.reserveCounted, false);
  st = r.state;
  r = focusFlagSuspicious(st, 'n1', '刷手机', NOW + 1 * MIN);
  assert.equal(r.ok, true);
  st = r.state;
  r = focusResolveSuspicious(st, 'n1', 'allow', NOW + 2 * MIN);
  assert.equal(r.decision, 'allow');
  assert.ok(focusIsPrecedent(r.state.precedents, '刷手机'));
});

// ---------- 状态按链区分 ----------

test('状态树按链筛选记录', () => {
  let st = makeState();
  st = focusSetPlanMode(st, true).state;
  const r2 = focusCreateChain(st, { id: 'n2', tier: FOCUS_TIER_NORMAL }, NOW);
  st = r2.state;
  st = startAndFinish(st, 'n1', NOW, NOW + 25 * MIN).state;
  st = startAndFinish(st, 'n2', NOW + 30 * MIN, NOW + 55 * MIN, { taskText: 'n2任务' }).state;
  const chainIds = {};
  st.units.forEach(function (u) { chainIds[u.chainId] = 1; });
  assert.ok(Object.keys(chainIds).length >= 2);

  const filterId = st.units[0].chainId;
  const rows = focusTreeRows(st, { chainFilter: filterId, showUnassignedRoot: true });
  const unitRows = rows.filter(function (x) { return x.kind === 'unit'; });
  assert.ok(unitRows.length >= 1);
  unitRows.forEach(function (x) {
    assert.equal(x.unit.chainId, filterId);
  });

  const rowsAll = focusTreeRows(st, {});
  assert.ok(rowsAll.filter(function (x) { return x.kind === 'unit'; }).length >= 2);
});

// ---------- 计划：截止日期 + 转正门槛 ----------

test('计划任务可设截止日期与转正最低下级数', () => {
  let st = makeState();
  st = focusSetPlanMode(st, true).state;
  const due = NOW + 7 * 86400000;
  let r = focusCreateOrg(st, {
    level: 'group', name: '大任务', fromPlan: true,
    dueAt: due, minChildCount: 3
  }, NOW);
  assert.equal(r.ok, true);
  assert.equal(r.org.dueAt, due);
  assert.equal(r.org.minChildCount, 3);
  st = r.state;
  const g = r.org;

  // 1 个下级 < 3 → 不可转正
  st = startAndFinish(st, 'n1', NOW, NOW + 25 * MIN).state;
  st = focusAssignUnit(st, st.units[0].id, g.id, NOW).state;
  let chk = focusOrgCanFormalize(st, g.id);
  assert.equal(chk.ok, false);
  assert.equal(chk.need, 3);
  assert.equal(chk.childCount, 1);
  assert.equal(focusFormalizeOrg(st, g.id, NOW).reason, 'need_fill');

  // 补到 3 个
  st = startAndFinish(st, 'n1', NOW + 30 * MIN, NOW + 55 * MIN).state;
  st = focusAssignUnit(st, st.units[1].id, g.id, NOW).state;
  st = startAndFinish(st, 'n1', NOW + 60 * MIN, NOW + 85 * MIN).state;
  st = focusAssignUnit(st, st.units[2].id, g.id, NOW).state;
  chk = focusOrgCanFormalize(st, g.id);
  assert.equal(chk.ok, true);
  assert.equal(chk.childCount, 3);
  r = focusFormalizeOrg(st, g.id, NOW);
  assert.equal(r.ok, true);
  assert.equal(r.org.formalized, true);
});

test('sanitizeOrg：dueAt / minChildCount 规整', () => {
  const o = focusSanitizeOrg({
    id: 'x', level: 'group', seq: 1,
    fromPlan: true, dueAt: 123, minChildCount: -2
  });
  assert.equal(o.dueAt, 123);
  assert.equal(o.minChildCount, 1);
  const o2 = focusSanitizeOrg({
    id: 'y', level: 'group', seq: 1,
    fromPlan: true, dueAt: 0, minChildCount: 5
  });
  assert.equal(o2.dueAt, null);
  assert.equal(o2.minChildCount, 5);
});

// ---------- 到期 tick：纯决策（回归：计时结束后每秒 renderApp + 每秒叠完成度弹窗） ----------

// 真实 tick 循环的等价模拟：到期 → focusClearTick() → renderApp()（renderFocusSection 会重新装表）
// → 下一秒再决策。旧实现没有「同单元只处理一次」的标记，于是每秒重复一次。
function runTickSeconds(chain, startMs, seconds, promptedKeyIn) {
  let promptedKey = promptedKeyIn || null;
  let renders = 0;
  let modals = 0;
  let tickAlive = true;
  let countdowns = 0;
  for (let i = 0; i < seconds; i++) {
    const now = startMs + i * 1000;
    if (!tickAlive) continue; // 表已收且无 renderApp → 不再有 tick
    const plan = focusTickPlan(chain, now, promptedKey);
    if (plan.action === 'none') { tickAlive = false; continue; }
    if (plan.action === 'countdown') { countdowns += 1; continue; }
    if (plan.action === 'expired') {
      tickAlive = false; // focusClearTick()
      if (!plan.prompt) continue; // 同一单元已处理过 → 收起表，不再 renderApp / 不再开弹窗
      promptedKey = plan.key;
      renders += 1; // renderApp()
      tickAlive = true; // 重渲染后 renderFocusSection 重新装表
      if (plan.openModal) modals += 1;
      continue;
    }
    if (plan.action === 'reservation_expired') {
      tickAlive = false;
      renders += 1;
    }
  }
  return { renders: renders, modals: modals, promptedKey: promptedKey, tickAlive: tickAlive, countdowns: countdowns };
}

function runningChain(taskText, minutes, typeKey) {
  const r = focusSitDown(makeState(), 'n1', NOW, { taskText: taskText || '复现：计时结束弹窗', minutes: minutes });
  assert.equal(r.ok, true, 'sitDown should ok');
  assert.equal(r.chain.status, 'running');
  return { st: r.state, chain: r.chain };
}

test('focusUnitKey：同链同 startedAt + 同阶段才有同一身份', () => {
  const { chain } = runningChain();
  assert.equal(focusUnitKey(chain), 'n1:' + NOW + ':formal');
  assert.equal(focusUnitKey(chain), focusUnitKey(chain));
  assert.equal(focusUnitKey({ id: 'n1', current: null }), null);
  assert.equal(focusUnitKey(null), null);
  // 同链不同 startedAt → 不同单元
  const other = Object.assign({}, chain, { current: Object.assign({}, chain.current, { startedAt: NOW + 1 }) });
  assert.notEqual(focusUnitKey(other), focusUnitKey(chain));
});

test('focusTickPlan：计时中 countdown，到期 expired（正式单元要弹完成度）', () => {
  const { chain } = runningChain(null, 25);
  const mid = focusTickPlan(chain, NOW + 10 * MIN, null);
  assert.equal(mid.action, 'countdown');
  assert.equal(mid.remainMs, 15 * MIN);
  const due = focusTickPlan(chain, NOW + 25 * MIN, null);
  assert.equal(due.action, 'expired');
  assert.equal(due.remainMs, 0);
  assert.equal(due.prompt, true);
  assert.equal(due.scoutPhase, false);
  assert.equal(due.openModal, true);
  // 已提示过同一单元 → 不再提示
  const again = focusTickPlan(chain, NOW + 25 * MIN + 5000, due.key);
  assert.equal(again.action, 'expired');
  assert.equal(again.prompt, false);
  assert.equal(again.openModal, false);
  // 非 running/reserved 状态 / 无 current → 无动作
  assert.equal(focusTickPlan(null, NOW, null).action, 'none');
  assert.equal(focusTickPlan(Object.assign({}, chain, { current: null }), NOW, null).action, 'none');
  assert.equal(focusTickPlan(Object.assign({}, chain, { status: 'idle' }), NOW, null).action, 'none');
});

test('到期推进：30 秒观察窗只 renderApp 一次、只开一个完成度弹窗（旧实现每秒各一次）', () => {
  const { chain } = runningChain(null, 25);
  // 计时中：不渲染、不弹窗
  const during = runTickSeconds(chain, NOW, 60, null);
  assert.equal(during.renders, 0);
  assert.equal(during.modals, 0);
  assert.equal(during.countdowns, 60);
  // 到期后 30 秒
  const after = runTickSeconds(chain, NOW + 25 * MIN, 30, null);
  assert.equal(after.renders, 1, '到期后只 renderApp 一次');
  assert.equal(after.modals, 1, '最多一个完成度弹窗');
  assert.equal(after.promptedKey, focusUnitKey(chain));
  // 继续观察 30 秒：同一单元不再有任何渲染 / 弹窗
  const later = runTickSeconds(chain, NOW + 25 * MIN + 30 * 1000, 30, after.promptedKey);
  assert.equal(later.renders, 0);
  assert.equal(later.modals, 0);
});

test('取消不自动重开：已提示过的单元再 tick 也不开弹窗；完成后的新单元才再提示', () => {
  const first = runningChain(null, 25);
  const due = focusTickPlan(first.chain, NOW + 25 * MIN, null);
  assert.equal(due.openModal, true);
  // 用户点「取消」（只关弹窗）→ 标记保留 → 不再自动重开
  const afterCancel = runTickSeconds(first.chain, NOW + 26 * MIN, 30, due.key);
  assert.equal(afterCancel.modals, 0);
  assert.equal(afterCancel.renders, 0);
  // 用户点「记录完成」→ 单元入流水，链回到 idle
  const done = focusCompleteUnit(first.st, 'n1', NOW + 26 * MIN, { achieved: true, completion: 80, name: '' });
  assert.equal(done.ok, true);
  assert.equal(done.unit.achieved, true);
  assert.equal(done.unit.completion, 80);
  assert.equal(done.unit.name, '复现：计时结束弹窗');
  assert.equal(focusFindChain(done.state, 'n1').status, 'idle');
  // 再坐一次（新 startedAt）→ 到期重新提示
  const second = focusSitDown(done.state, 'n1', NOW + 40 * MIN, { taskText: '第二单元' });
  assert.equal(second.ok, true);
  const due2 = focusTickPlan(second.chain, NOW + 65 * MIN, due.key);
  assert.equal(due2.prompt, true);
  assert.equal(due2.openModal, true);
});

test('侦查到期：只自渲染一次、不开完成度弹窗；转正后再提示一次', () => {
  const r = focusScoutStart(makeState(), 'n1', NOW, { taskText: '侦查任务' });
  assert.equal(r.ok, true);
  assert.equal(r.chain.status, 'scouting');
  const dueMs = NOW + (r.chain.current.plannedMin || 0) * MIN;
  const due = focusTickPlan(r.chain, dueMs, null);
  assert.equal(due.action, 'expired');
  assert.equal(due.scoutPhase, true);
  assert.equal(due.openModal, false, '侦查到期不弹完成度');
  const after = runTickSeconds(r.chain, dueMs, 30, null);
  assert.equal(after.renders, 1);
  assert.equal(after.modals, 0);
  // 转正：阶段 scout → formal，允许再提示一次（此时才弹完成度）
  const promoted = focusScoutPromote(r.state, 'n1', 'focus', dueMs + MIN);
  assert.equal(promoted.ok, true);
  assert.equal(promoted.chain.status, 'running');
  const dueAfterPromote = focusTickPlan(promoted.chain, dueMs + MIN, after.promptedKey);
  assert.equal(dueAfterPromote.prompt, true, '转正后是新阶段 → 再提示一次');
  assert.equal(dueAfterPromote.openModal, true);
});

test('预约到期：窗口内 countdown，超时 reservation_expired（一次）', () => {
  const reserved = focusReserve(makeState(), 'n1', NOW);
  assert.equal(reserved.ok, true);
  assert.equal(reserved.chain.status, 'reserved');
  const plan = focusTickPlan(reserved.chain, NOW + 60000, null);
  assert.equal(plan.action, 'countdown');
  const expired = focusTickPlan(reserved.chain, NOW + FOCUS_RESERVE_WINDOW_MS, null);
  assert.equal(expired.action, 'reservation_expired');
  const after = runTickSeconds(reserved.chain, NOW + FOCUS_RESERVE_WINDOW_MS, 30, null);
  assert.equal(after.renders, 1);
  assert.equal(after.modals, 0);
});

// ---------- 统计页热力图：可见窗口色阶（回归：历史峰值把可见期压成同一档） ----------

const DAY = 86400000;

// 直接铺 units（endedAt = NOW - k 天，actualMin 指定），绕开每一步 CTDP 流程
function heatState(plan) {
  const st = makeState();
  st.units = plan.map(function (p, i) {
    const endedAt = NOW - p[0] * DAY;
    return {
      id: 'u' + i, seq: i + 1, typeKey: 'focus', name: '单元' + (i + 1), taskText: '注入任务' + (i + 1),
      chainId: 'n1', orgId: null, planId: null,
      startedAt: endedAt - p[1] * MIN, endedAt: endedAt,
      plannedMin: 25, actualMin: p[1], achieved: true, completion: 80, promotedFromScout: false
    };
  });
  return st;
}

test('focusHeatData：默认 8 周 = 56 格、展开 26 周 = 182 格，末格是今天', () => {
  const st = heatState([[0, 90], [3, 200]]);
  const hd = focusHeatData(st, NOW, 8);
  assert.equal(hd.cells.length, 56);
  assert.equal(focusHeatData(st, NOW, 26).cells.length, 182);
  const last = hd.cells[hd.cells.length - 1];
  assert.equal(last.isToday, true);
  assert.equal(last.day, focusYmd(NOW));
  assert.equal(last.minutes, 90);
  assert.equal(hd.today, focusYmd(NOW));
  assert.equal(hd.todayMinutes, 90);
  assert.equal(hd.activeDays, 2);
  assert.equal(hd.totalMin, 290);
  assert.equal(hd.peakMin, 200);
  assert.equal(hd.maxMin, 200);
  // 窗口首格 = 今天往前 55 天（含当天共 56 天）
  assert.equal(hd.cells[0].day, focusYmd(NOW - 55 * DAY));
  assert.equal(focusHeatData(st, NOW, 26).cells[0].day, focusYmd(NOW - 181 * DAY));
});

test('focusHeatData：色阶锚定可见窗口最高日（窗口外的历史大日不影响档位）', () => {
  const st = heatState([[70, 999], [3, 200], [10, 100], [0, 50]]);
  const hd = focusHeatData(st, NOW, 8);
  assert.equal(hd.maxMin, 200, '窗口外的 999 分不参与色阶锚点');
  assert.equal(hd.activeDays, 3, '窗口外的日子不计入汇总');
  const byDay = {};
  hd.cells.forEach(function (c) { byDay[c.day] = c; });
  assert.equal(byDay[focusYmd(NOW - 3 * DAY)].lv, 4, '窗口内峰值日 → 最深档');
  assert.equal(byDay[focusYmd(NOW - 10 * DAY)].lv, 2); // 100/200*4
  assert.equal(byDay[focusYmd(NOW)].lv, 1);            // 50/200*4
  // 若按全史锚定（旧实现），以上三档全部塌成 1 → 有数据日看起来“全部同色”
  const lvs = hd.cells.filter(function (c) { return c.lv > 0; }).map(function (c) { return c.lv; });
  assert.deepEqual(Array.from(new Set(lvs)).sort(), [1, 2, 4]);
});

test('focusHeatData：无数据 / 只有窗口外数据 → 全部 0 档（无 NaN）', () => {
  const empty = focusHeatData(heatState([]), NOW, 8);
  assert.equal(empty.cells.length, 56);
  assert.equal(empty.cells.every(function (c) { return c.lv === 0 && c.minutes === 0; }), true);
  assert.equal(empty.maxMin, 0);
  assert.equal(empty.activeDays, 0);
  assert.equal(empty.peakMin, 0);
  assert.equal(empty.todayMinutes, 0);

  const outside = focusHeatData(heatState([[70, 999]]), NOW, 8);
  assert.equal(outside.activeDays, 0);
  assert.equal(outside.cells.every(function (c) { return c.lv === 0; }), true);
});

test('focusHeatData：同一天多个单元按 actualMin 汇总后再定档', () => {
  const st = heatState([[0, 40], [0, 60], [1, 500]]);
  const hd = focusHeatData(st, NOW, 8);
  const byDay = {};
  hd.cells.forEach(function (c) { byDay[c.day] = c; });
  assert.equal(byDay[focusYmd(NOW)].minutes, 100);
  assert.equal(byDay[focusYmd(NOW)].lv, 1); // ceil(100/500*4)
  assert.equal(byDay[focusYmd(NOW - DAY)].lv, 4);
});

// ---------- 层次严格划分（显式类型 unit/group/corps/army） ----------

function addUnits(st, n, offsetMin) {
  let cur = st;
  const base = Number(offsetMin) || 0;
  for (let i = 0; i < n; i++) {
    const t0 = NOW + (base + i * 60) * MIN;
    cur = startAndFinish(cur, 'n1', t0, t0 + 25 * MIN, { name: '单元' }).state;
  }
  return cur;
}

test('层次表：四级键 / rank / 上下级 / 可编入关系（单一来源）', () => {
  assert.deepEqual(FOCUS_LEVEL_KEYS, ['unit', 'group', 'corps', 'army']);
  assert.deepEqual(FOCUS_ORG_LEVELS, ['group', 'corps', 'army']);
  FOCUS_LEVEL_KEYS.forEach(function (k, i) {
    assert.equal(focusIsLevelKey(k), true);
    assert.equal(focusLevelRank(k), i);
    assert.equal(FOCUS_LEVEL_RANK[k], i);
    assert.equal(focusLevelAtRank(i), k);
  });
  assert.equal(focusIsLevelKey('squad'), false);
  assert.equal(focusLevelRank('squad'), -1);
  assert.equal(focusLevelAtRank(4), null);
  assert.equal(focusLevelAtRank(-1), null);
  // 上级：单元 → 组 → 群 → 集团；集团无上级
  assert.equal(focusParentLevelOf('unit'), 'group');
  assert.equal(focusParentLevelOf('group'), 'corps');
  assert.equal(focusParentLevelOf('corps'), 'army');
  assert.equal(focusParentLevelOf('army'), null);
  // 下级：单元无下级
  assert.equal(focusChildLevelOf('unit'), null);
  assert.equal(focusChildLevelOf('group'), 'unit');
  assert.equal(focusChildLevelOf('corps'), 'group');
  assert.equal(focusChildLevelOf('army'), 'corps');
  // 可编入：恰为上一级
  assert.equal(focusCanAttach('unit', 'group'), true);
  assert.equal(focusCanAttach('group', 'corps'), true);
  assert.equal(focusCanAttach('corps', 'army'), true);
  assert.equal(focusCanAttach('group', 'group'), false);
  assert.equal(focusCanAttach('group', 'army'), false);
  assert.equal(focusCanAttach('unit', 'corps'), false);
  assert.equal(focusCanAttach('army', 'army'), false);
  assert.equal(focusCanAttach('group', null), false);
  assert.equal(focusCanAttach('unit', 'unit'), false);
});

test('层级由节点显式类型判定：组挂在群下仍是组（不靠父级槽位推断）', () => {
  let st = addUnits(makeState(), 1, 0);
  st = focusSetPlanMode(st, true).state;
  assert.equal(focusNodeLevel(st, st.units[0].id), 'unit');
  assert.equal(focusNodeLevel(st, 'nope'), null);

  const gr = focusCreateOrg(st, { level: 'group', name: 'G' }, NOW);
  st = gr.state;
  const co = focusCreateOrg(st, { level: 'corps', name: 'C' }, NOW);
  st = co.state;
  const at = focusAttachNodes(st, [gr.org.id], co.org.id, NOW);
  assert.equal(at.ok, true);
  st = at.state;
  // 挂在群下的节点仍是「组」，不是「单元」
  assert.equal(focusNodeLevel(st, gr.org.id), 'group');
  assert.equal(focusNodeLevel(st, co.org.id), 'corps');
  assert.equal(focusFindOrg(st, gr.org.id).level, 'group');
  // 组不能编入组（旧行为：被当成「另一种单元」只能挂到任务组下）
  const g2 = focusCreateOrg(st, { level: 'group', name: 'G2' }, NOW);
  st = g2.state;
  const bad = focusReparentOrgs(st, [gr.org.id], g2.org.id, NOW);
  assert.equal(bad.ok, false);
  assert.equal(bad.reason, 'bad_parent');
  // 组不能编入自己 / 自己的后代
  assert.equal(focusReparentOrgs(st, [gr.org.id], gr.org.id, NOW).ok, false);
});

test('未编入单元 → 任务组 → 任务群 → 任务集团：逐级归属', () => {
  let st = addUnits(makeState(), 3, 0);
  st = focusSetPlanMode(st, true).state;
  const unitIds = st.units.map(function (u) { return u.id; });

  // 三个未编入单元 → 组合产物落在 group 层
  let r = focusCombineNodes(st, { ids: unitIds, name: 'G1' }, NOW);
  assert.equal(r.ok, true);
  assert.equal(r.level, 'group');
  assert.equal(r.org.level, 'group');
  st = r.state;
  const g1 = r.org;
  assert.equal(st.units.filter(function (u) { return u.orgId === g1.id; }).length, 3);

  // 再三个单元 → 另一个任务组
  st = addUnits(st, 3, 200);
  const free = focusUnassignedUnits(st).map(function (u) { return u.id; });
  assert.equal(free.length, 3);
  r = focusCombineNodes(st, { ids: free, name: 'G2' }, NOW);
  assert.equal(r.ok, true);
  assert.equal(r.level, 'group');
  st = r.state;
  const g2 = r.org;

  // 两个「未编入单元组合成的任务组」→ 任务群（可继续向上归属）
  r = focusCombineNodes(st, { ids: [g1.id, g2.id], name: 'C1' }, NOW);
  assert.equal(r.ok, true);
  assert.equal(r.level, 'corps');
  st = r.state;
  const c1 = r.org;
  assert.equal(focusFindOrg(st, g1.id).parentId, c1.id);
  assert.equal(focusFindOrg(st, g2.id).parentId, c1.id);
  // 组 → 已有群：显式编入同样成立
  const moved = focusAttachNodes(st, [g1.id], c1.id, NOW);
  assert.equal(moved.ok, true);
  assert.equal(focusFindOrg(moved.state, g1.id).parentId, c1.id);

  // 任务群 → 任务集团
  st = addUnits(st, 3, 400);
  const free2 = focusUnassignedUnits(st).map(function (u) { return u.id; });
  const g3 = focusCombineNodes(st, { ids: free2, name: 'G3' }, NOW);
  assert.equal(g3.ok, true);
  st = g3.state;
  const c2 = focusCombineNodes(st, { ids: [g3.org.id], name: 'C2' }, NOW);
  assert.equal(c2.ok, true);
  assert.equal(c2.level, 'corps');
  st = c2.state;
  const army = focusCombineNodes(st, { ids: [c1.id, c2.org.id], name: 'A1' }, NOW);
  assert.equal(army.ok, true);
  assert.equal(army.level, 'army');
  st = army.state;
  assert.equal(focusFindOrg(st, c1.id).parentId, army.org.id);
  assert.equal(focusFindOrg(st, c2.org.id).parentId, army.org.id);
  // 群 → 集团：显式编入
  const rep = focusReparentOrgs(st, [c1.id], army.org.id, NOW);
  assert.equal(rep.ok, true);

  // 集团是最高层：不能再组合、不能再被编入
  assert.equal(focusParentLevelOf('army'), null);
  assert.equal(focusCombineLevelOf(st, [army.org.id]), null);
  const noUp = focusCombineNodes(st, { ids: [army.org.id] }, NOW);
  assert.equal(noUp.ok, false);
  assert.equal(noUp.reason, 'no_level_up');
  assert.equal(focusAttachNodes(st, [army.org.id], c1.id, NOW).reason, 'bad_parent');
  // 群不能进群/组；单元不能进群/集团
  assert.equal(focusAttachNodes(st, [c1.id], g1.id, NOW).reason, 'bad_parent');
  assert.equal(focusAttachNodes(st, [free2[0]], c1.id, NOW).reason, 'bad_parent');
  assert.equal(focusAttachNodes(st, [free2[0]], army.org.id, NOW).reason, 'bad_parent');

  // 混层组合被拒，且整单原子（不留半个产物）
  const mix = focusCombineNodes(st, { ids: [free2[0], g1.id] }, NOW);
  assert.equal(mix.ok, false);
  assert.equal(mix.reason, 'member_level_mismatch');
  assert.equal(mix.state.orgs.length, st.orgs.length);
});

test('组合产物可带截止日期与最小下级数，非法日期整单拒绝', () => {
  let st = addUnits(makeState(), 2, 0);
  st = focusSetPlanMode(st, true).state;
  const ids = st.units.map(function (u) { return u.id; });
  const due = new Date(2026, 2, 1, 23, 59, 59, 0).getTime();
  const r = focusCombineNodes(st, { ids: ids, name: 'G', dueAt: '2026-03-01', minChildCount: 4 }, NOW);
  assert.equal(r.ok, true);
  assert.equal(r.org.dueAt, due);
  assert.equal(r.org.minChildCount, 4);
  const bad = focusCombineNodes(st, { ids: ids, dueAt: '2026-02-30' }, NOW);
  assert.equal(bad.ok, false);
  assert.equal(bad.reason, 'bad_due');
  assert.equal(bad.state.orgs.length, st.orgs.length);
});

// ---------- 计划参数：两个新建入口共用同一校验 ----------

test('focusPlanNodeFields：最小下级数 1..99 + 合法日期（两入口共用）', () => {
  const ok = focusPlanNodeFields({ name: '  A  ', dueAt: '2026-03-01', minChildCount: '5' }, 1);
  assert.equal(ok.ok, true);
  assert.equal(ok.name, 'A');
  assert.equal(ok.minChildCount, 5);
  assert.equal(ok.dueAt, new Date(2026, 2, 1, 23, 59, 59, 0).getTime());
  // 空日期可选 → null
  assert.equal(focusDueDateValid(''), true);
  assert.equal(focusDueDateValid(null), true);
  assert.equal(focusPlanNodeFields({ dueAt: '' }, 1).dueAt, null);
  assert.equal(focusPlanNodeFields({}, 3).minChildCount, 3);
  // 非法日期 → 统一拒绝（两个入口据此不落库）
  ['2026-02-30', '2026-04-31', '2026-13-01', 'today', '2026/03/01', 'abc'].forEach(function (bad) {
    assert.equal(focusDueDateValid(bad), false, bad);
    const r = focusPlanNodeFields({ dueAt: bad }, 1);
    assert.equal(r.ok, false, bad);
    assert.equal(r.reason, 'bad_due', bad);
    assert.equal(focusNormalizeDueAt(bad), null, bad);
  });
  // 合法日期多形态
  assert.equal(focusNormalizeDueAt(1770000000000), 1770000000000);
  assert.equal(focusNormalizeDueAt('1770000000123'), 1770000000123);
  assert.equal(focusNormalizeDueAt(new Date(2026, 0, 2, 3, 4, 5)), new Date(2026, 0, 2, 3, 4, 5).getTime());
  assert.equal(focusNormalizeDueAt('2026-01-02'), new Date(2026, 0, 2, 23, 59, 59, 0).getTime());
  assert.equal(focusNormalizeDueAt(0), null);
  assert.equal(focusNormalizeDueAt(-5), null);
  // 最小下级数：越界收敛、非法回退默认
  assert.equal(FOCUS_MIN_CHILD_MIN, 1);
  assert.equal(FOCUS_MIN_CHILD_MAX, 99);
  assert.equal(focusNormalizeMinChildCount(0, 1), 1);
  assert.equal(focusNormalizeMinChildCount(-5, 1), 1);
  assert.equal(focusNormalizeMinChildCount(100, 1), 99);
  assert.equal(focusNormalizeMinChildCount(3.7, 1), 3);
  assert.equal(focusNormalizeMinChildCount('abc', 1), 1);
  assert.equal(focusNormalizeMinChildCount(null, 4), 4);
  assert.equal(focusNormalizeMinChildCount('', 2), 2);
  assert.equal(focusMinChildCountValid(1), true);
  assert.equal(focusMinChildCountValid(99), true);
  assert.equal(focusMinChildCountValid('7'), true);
  assert.equal(focusMinChildCountValid(0), false);
  assert.equal(focusMinChildCountValid(100), false);
  assert.equal(focusMinChildCountValid(2.5), false);
  assert.equal(focusMinChildCountValid(''), false);
});

test('计划参数落库：任意层级新建与子级新建都能带截止日期与最小下级数', () => {
  let st = focusSetPlanMode(focusDefaultState(), true).state;
  const due = new Date(2026, 2, 1, 23, 59, 59, 0).getTime();
  // 入口一：顶层新建任意层级
  ['group', 'corps', 'army'].forEach(function (level) {
    const r = focusCreateOrg(st, {
      level: level, name: 'T-' + level, fromPlan: true, dueAt: '2026-03-01', minChildCount: 7
    }, NOW);
    assert.equal(r.ok, true, level);
    assert.equal(r.org.level, level);
    assert.equal(r.org.dueAt, due);
    assert.equal(r.org.minChildCount, 7);
    assert.equal(r.org.fromPlan, true);
    assert.equal(r.org.formalized, false);
    assert.equal(focusOrgCanFormalize(r.state, r.org.id).need, 7);
  });
  // 入口二：子级新建（层次由父级显式层次决定）
  const cr = focusCreateOrg(st, { level: 'corps', name: 'C', fromPlan: true }, NOW);
  st = cr.state;
  const childLevel = focusChildLevelOf(cr.org.level);
  assert.equal(childLevel, 'group');
  const kid = focusCreateOrg(st, {
    level: childLevel, parentId: cr.org.id, name: '子', fromPlan: true, dueAt: '2026-05-20', minChildCount: 2
  }, NOW);
  assert.equal(kid.ok, true);
  assert.equal(kid.org.level, 'group');
  assert.equal(kid.org.parentId, cr.org.id);
  assert.equal(kid.org.dueAt, new Date(2026, 4, 20, 23, 59, 59, 0).getTime());
  assert.equal(kid.org.minChildCount, 2);
  // 两入口共用校验：非法日期同样被拒（不落库）
  const badTop = focusCreateOrg(st, { level: 'group', fromPlan: true, dueAt: '2026-02-30' }, NOW);
  assert.equal(badTop.ok, false);
  assert.equal(badTop.reason, 'bad_due');
  assert.equal(badTop.org, null);
  const badKid = focusCreateOrg(st, { level: 'group', parentId: cr.org.id, fromPlan: true, dueAt: '2026-02-30' }, NOW);
  assert.equal(badKid.ok, false);
  assert.equal(badKid.reason, 'bad_due');
  assert.equal(badKid.state.orgs.length, st.orgs.length);
  // 越界最小下级数：两入口同样收敛到 1..99
  assert.equal(focusCreateOrg(st, { level: 'group', fromPlan: true, minChildCount: 0 }, NOW).org.minChildCount, 1);
  assert.equal(focusCreateOrg(st, { level: 'group', fromPlan: true, minChildCount: 250 }, NOW).org.minChildCount, 99);
  assert.equal(focusCreateOrg(st, { level: 'army', fromPlan: true, minChildCount: -3 }, NOW).org.minChildCount, 1);
});

test('三三制批量创建：同样接受截止日期与最小下级数', () => {
  let st = focusSetPlanMode(focusDefaultState(), true).state;
  const r = focusTemplateTriad(st, { count: 3, dueAt: '2026-04-10', minChildCount: 2 }, NOW);
  assert.equal(r.created.length, 3);
  const due = new Date(2026, 3, 10, 23, 59, 59, 0).getTime();
  r.created.forEach(function (o) {
    assert.equal(o.dueAt, due);
    assert.equal(o.minChildCount, 2);
  });
  assert.equal(focusTemplateTriad(st, { count: 3, dueAt: '2026-04-31' }, NOW).reason, 'bad_due');
});

// ---------- 序号复用 ----------

test('focusNextSeq / focusMaxSeq：同层最小空缺，sanitize 收敛历史计数器', () => {
  const st = focusSanitizeState({
    seq: { unit: 7, group: 7, corps: 7, army: 7 },
    chains: [{ id: 'n1', tier: 'normal' }],
    units: [{ id: 'u1', chainId: 'n1', seq: 2 }, { id: 'u2', chainId: 'n1', seq: 5 }],
    orgs: [
      { id: 'g1', level: 'group', seq: 3 },
      { id: 'g2', level: 'group', seq: 1 },
      { id: 'c1', level: 'corps', seq: 4 }
    ]
  });
  // 计数器与现存节点取齐（历史虚线不跳号）
  assert.equal(st.seq.unit, 5);
  assert.equal(st.seq.group, 3);
  assert.equal(st.seq.corps, 4);
  assert.equal(st.seq.army, 0);
  assert.equal(focusMaxSeq(st, 'unit'), 5);
  assert.equal(focusMaxSeq(st, 'group'), 3);
  assert.equal(focusMaxSeq(st, 'corps'), 4);
  assert.equal(focusMaxSeq(st, 'army'), 0);
  // 组：1、3 占用 → 复用最小空缺 2
  assert.equal(focusNextSeq(st, 'group'), 2);
  // 层间独立
  assert.equal(focusNextSeq(st, 'corps'), 1);
  assert.equal(focusNextSeq(st, 'army'), 1);
  // 单元流水独立于编制
  assert.equal(focusNextSeq(st, 'unit'), 1);
  assert.equal(focusNextSeq(st, 'squad'), 0);
  assert.equal(focusNextSeq(focusDefaultState(), 'group'), 1);
});

test('删除编制后同层复用最小空缺号：级联删除同时回收多级', () => {
  let st = focusSetPlanMode(focusDefaultState(), true).state;
  const c = focusCreateOrg(st, { level: 'corps', name: 'C' }, NOW);
  st = c.state;
  const g1 = focusCreateOrg(st, { level: 'group', name: 'G1', parentId: c.org.id }, NOW);
  st = g1.state;
  const g2 = focusCreateOrg(st, { level: 'group', name: 'G2', parentId: c.org.id }, NOW);
  st = g2.state;
  assert.deepEqual([g1.org.seq, g2.org.seq], [1, 2]);
  // 删除群 → 级联删两个组 → 组、群都回到 1 可用
  const del = focusDeleteOrg(st, c.org.id, NOW);
  assert.equal(del.ok, true);
  st = del.state;
  assert.equal(st.orgs.filter(function (o) { return o.level === 'group'; }).length, 0);
  assert.equal(st.seq.group, 0);
  assert.equal(st.seq.corps, 0);
  assert.equal(focusNextSeq(st, 'group'), 1);
  assert.equal(focusNextSeq(st, 'corps'), 1);
  // 单元不受影响（其 orgId 被清空，番号不变）
  st.units.forEach(function (u) { assert.equal(u.orgId, null); });
});

test('下一级任务数按显式层次统计：组看单元、群看组、集团看群', () => {
  let st = makeState();
  const c = focusCreateOrg(st, { level: 'corps', name: 'C', fromPlan: true, minChildCount: 2 }, NOW);
  st = c.state;
  assert.equal(focusNextLevelCount(st, c.org.id), 0);
  // 群里只有 1 个组 → 未达最低下级数
  const g1 = focusCreateOrg(st, { level: 'group', name: 'G1', parentId: c.org.id }, NOW);
  st = g1.state;
  assert.equal(focusNextLevelCount(st, c.org.id), 1);
  assert.equal(focusOrgCanFormalize(st, c.org.id).ok, false);
  assert.equal(focusOrgCanFormalize(st, c.org.id).need, 2);
  const g2 = focusCreateOrg(st, { level: 'group', name: 'G2', parentId: c.org.id }, NOW);
  st = g2.state;
  assert.equal(focusNextLevelCount(st, c.org.id), 2);
  assert.equal(focusOrgCanFormalize(st, c.org.id).ok, true);
  assert.equal(focusFormalizeOrg(st, c.org.id, NOW).ok, true);

  // 组看的是单元，不是子 org
  const gOnly = focusCreateOrg(st, { level: 'group', name: 'GX', fromPlan: true }, NOW);
  st = gOnly.state;
  assert.equal(focusNextLevelCount(st, gOnly.org.id), 0);
  st = addUnits(st, 1, 700);
  st = focusAssignUnit(st, st.units[st.units.length - 1].id, gOnly.org.id, NOW).state;
  assert.equal(focusNextLevelCount(st, gOnly.org.id), 1);
  // 集团看的是群
  const a = focusCreateOrg(st, { level: 'army', name: 'A', fromPlan: true }, NOW);
  st = a.state;
  const c2 = focusCreateOrg(st, { level: 'corps', name: 'C2', parentId: a.org.id }, NOW);
  st = c2.state;
  assert.equal(focusNextLevelCount(st, a.org.id), 1);
  assert.equal(focusNextLevelCount(st, 'nope'), 0);
});

// ---------- t8：四级视觉差异 / 归属可见 / 悬浮提醒 ----------

test('层级视觉：符号与番号前缀一致，任意两层至少两项不同', () => {
  assert.deepEqual(FOCUS_LEVEL_VISUAL_KEYS, ['symbol', 'fontSize', 'fontWeight', 'borderWidth']);
  FOCUS_LEVEL_KEYS.forEach(function (lv) {
    const v = focusLevelVisual(lv);
    assert.ok(v, 'visual 缺失：' + lv);
    assert.equal(v.level, lv);
    assert.equal(v.rank, FOCUS_LEVEL_RANK[lv]);
    assert.equal(v.symbol, FOCUS_SEQ_KEYS[lv]);
    assert.equal(typeof v.fontSize, 'number');
    assert.equal(typeof v.fontWeight, 'number');
    assert.equal(typeof v.borderWidth, 'number');
    assert.ok(v.borderColor && v.tint, '颜色/底色缺失：' + lv);
  });
  for (let i = 0; i < FOCUS_LEVEL_KEYS.length; i++) {
    for (let j = i + 1; j < FOCUS_LEVEL_KEYS.length; j++) {
      const a = FOCUS_LEVEL_KEYS[i];
      const b = FOCUS_LEVEL_KEYS[j];
      const d = focusLevelVisualDelta(a, b);
      assert.ok(d >= 2, a + ' vs ' + b + ' 仅 ' + d + ' 项不同');
    }
  }
  assert.equal(focusLevelVisualDelta('unit', 'unit'), 0);
  assert.equal(focusLevelVisualDelta('unit', 'squad'), -1);
  assert.equal(focusLevelVisual('squad'), null);
  // 视觉规范与层次表同源
  assert.equal(FOCUS_LEVEL_VISUALS.army.symbol, FOCUS_SEQ_KEYS.army);
});

test('层级视觉：字号/字重/边框逐级递增，徽标用自定义层次名', () => {
  const sizes = FOCUS_LEVEL_KEYS.map(function (lv) { return focusLevelVisual(lv).fontSize; });
  const weights = FOCUS_LEVEL_KEYS.map(function (lv) { return focusLevelVisual(lv).fontWeight; });
  const borders = FOCUS_LEVEL_KEYS.map(function (lv) { return focusLevelVisual(lv).borderWidth; });
  [sizes, weights, borders].forEach(function (arr) {
    for (let i = 1; i < arr.length; i++) {
      assert.ok(arr[i] > arr[i - 1], '未递增：' + JSON.stringify(arr));
    }
  });
  let st = focusDefaultState();
  st = focusSetLevelName(st, 'group', '小队', NOW).state;
  assert.equal(focusLevelBadge('group', st.settings, 3).text, '● 小队 3');
  assert.equal(focusLevelBadge('group', st.settings, 3).name, '小队');
  assert.equal(focusLevelBadge('unit', st.settings, 0).text, '# 任务单元');
  assert.equal(focusLevelBadge('squad', st.settings, 1), null);
});

test('树行带显式层级与视觉规范（单元行 level=unit）', () => {
  let st = makeState();
  const gr = focusCreateOrg(st, { level: 'group', name: '写作', fromPlan: true }, NOW);
  st = gr.state;
  st = startAndFinish(st, 'n1', NOW, NOW + 25 * MIN).state;
  const unitId = st.units[0].id;
  st = focusAssignUnit(st, unitId, gr.org.id, NOW).state;

  const rows = focusTreeRows(st, {});
  const uRow = rows.filter(function (r) { return r.kind === 'unit' && r.id === unitId; })[0];
  assert.equal(uRow.level, 'unit');
  assert.equal(uRow.visual.symbol, '#');
  assert.equal(uRow.visual.fontSize, focusLevelVisual('unit').fontSize);
  const gRow = rows.filter(function (r) { return r.kind === 'org' && r.id === gr.org.id; })[0];
  assert.equal(gRow.level, 'group');
  assert.equal(gRow.visual, focusLevelVisual('group'));
  assert.equal(gRow.parent.attached, false);
  assert.equal(gRow.parent.text, '未编入');
  const rootRow = rows.filter(function (r) { return r.kind === 'root'; })[0];
  assert.equal(rootRow.level, undefined);
  assert.ok(rootRow.visual == null);
});

test('归属可见：单元显示父级符号与名称，跨层级编入后立即更新', () => {
  let st = makeState();
  const gr = focusCreateOrg(st, { level: 'group', name: '写作', fromPlan: true }, NOW);
  st = gr.state;
  st = startAndFinish(st, 'n1', NOW, NOW + 25 * MIN).state;
  const unitId = st.units[0].id;

  let a = focusParentAttribution(st, unitId);
  assert.equal(a.level, 'unit');
  assert.equal(a.attached, false);
  assert.equal(a.text, '未编入');
  assert.equal(a.parentSymbol, '·');
  assert.equal(focusParentAttribution(st, 'missing'), null);

  st = focusAssignUnit(st, unitId, gr.org.id, NOW).state;
  a = focusParentAttribution(st, unitId);
  assert.equal(a.attached, true);
  assert.equal(a.parentId, gr.org.id);
  assert.equal(a.parentLevel, 'group');
  assert.equal(a.parentSymbol, '●');
  assert.equal(a.parentSeq, 1);
  assert.equal(a.parentName, '写作');
  assert.equal(a.text, '归属 ●1 写作');

  // 组挂到群下：组自身层次仍是 group（由显式类型判定），归属变为 corps/▲
  const cr = focusCreateOrg(st, { level: 'corps', name: '论文', fromPlan: true }, NOW);
  st = cr.state;
  const att = focusAttachNodes(st, [gr.org.id], cr.org.id, NOW);
  assert.equal(att.ok, true);
  st = att.state;
  const gAttr = focusParentAttribution(st, gr.org.id);
  assert.equal(gAttr.level, 'group');
  assert.equal(gAttr.parentLevel, 'corps');
  assert.equal(gAttr.parentSymbol, '▲');
  assert.equal(gAttr.parentId, cr.org.id);
  assert.equal(gAttr.text, '归属 ▲1 论文');
  assert.equal(focusNodeLevel(st, gr.org.id), 'group');
  // 单元归属不受影响（父级仍是那个组）
  assert.equal(focusParentAttribution(st, unitId).parentLevel, 'group');
});

test('悬浮提醒：空闲不显示；专注走秒、到点、无 DOM 环境安全', () => {
  let st = makeState();
  assert.equal(focusReminderInfo(st, NOW).visible, false);
  assert.equal(focusReminderInfo(null, NOW).visible, false);

  const sit = focusSitDown(st, 'n1', NOW, { taskText: '精读一章', minutes: 25 });
  assert.equal(sit.ok, true);
  st = sit.state;
  let info = focusReminderInfo(st, NOW + 10 * MIN);
  assert.equal(info.visible, true);
  assert.equal(info.mode, 'focus');
  assert.equal(info.level, 'unit');
  assert.equal(info.symbol, '#');
  assert.equal(info.remainMs, 15 * MIN);
  assert.equal(info.clock, '15:00');
  assert.equal(info.plannedMin, 25);
  assert.equal(info.elapsedMin, 10);
  assert.equal(info.progressPct, 40);
  assert.ok(info.subtitle.indexOf('精读一章') >= 0);
  assert.ok(info.key && info.key.indexOf('n1:') === 0, 'key=' + info.key);
  // 走秒：同一状态在更晚的 now 下剩余更少
  assert.equal(focusReminderInfo(st, NOW + 10 * MIN + 1000).remainMs, 15 * MIN - 1000);
  // 到点
  const later = focusReminderInfo(st, NOW + 26 * MIN);
  assert.equal(later.remainMs, 0);
  assert.equal(later.expired, true);
  assert.equal(later.clock, '0:00');
  assert.equal(later.progressPct, 100);
  // 无 DOM：同步/启动/清理安全返回，不抛
  assert.equal(focusReminderStart(), false);
  assert.equal(focusReminderClear(), undefined);
  const sync = focusReminderSync(NOW, true);
  assert.equal(sync.rendered, false);
  assert.equal(sync.visible, false);
  assert.equal(typeof FOCUS_REMINDER_UI_KEY, 'string');
});

test('悬浮提醒：预约保留期倒计时，侦查显示侦查中', () => {
  let st = makeState();
  const res = focusReserve(st, 'n1', NOW);
  assert.equal(res.ok, true);
  st = res.state;
  let info = focusReminderInfo(st, NOW + 5 * MIN);
  assert.equal(info.visible, true);
  assert.equal(info.mode, 'reserve');
  assert.equal(info.remainMs, 10 * MIN);
  assert.equal(info.clock, '10:00');
  assert.equal(focusReminderInfo(st, NOW + 16 * MIN).expired, true);

  // 侦查进行中优先显示侦查（同一状态上不得被预约分支抢走）
  let st2 = makeState();
  const sc = focusScoutStart(st2, 'n1', NOW, { taskText: '找资料', minutes: 10 });
  assert.equal(sc.ok, true);
  st2 = sc.state;
  info = focusReminderInfo(st2, NOW + 4 * MIN);
  assert.equal(info.mode, 'scout');
  assert.equal(info.title, '侦查进行中');
  assert.equal(info.remainMs, 6 * MIN);
  assert.equal(info.clock, '6:00');
  assert.equal(info.plannedMin, 10);
});
