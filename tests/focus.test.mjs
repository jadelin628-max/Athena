import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
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
  focusChineseNumber,
  focusSeqOrdinalOk,
  focusUnitTypeKey,
  focusUnitTypeLabel,
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
  focusUnitDone,
  focusOrgPending,
  focusNodeDone,
  focusOrgStateLabel,
  focusCombineReadiness,
  focusIncompleteUnder,
  focusFormalizeHint,
  focusReasonText,
  focusIsAncestorOrg,
  FOCUS_REASON_TEXT,
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
  // t41：层级文字标 chip 的纯函数已删除（整体下线），不再从 src 导入
  focusTreeGuideLine,
  focusTreeGuides,
  focusTreeExpandKey,
  focusTreeExpandFields,
  focusExpandTagViews,
  focusExpandModuleViews,
  FOCUS_TREE_INDENT_PX,
  focusFmtTs,
  focusFmtDur,
  FOCUS_LEVEL_VISUAL_ORDER,
  focusParentAttribution,
  focusReminderInfo,
  focusReminderSync,
  focusReminderStart,
  focusReminderClear,
  FOCUS_REMINDER_UI_KEY
} from '../src/focus.mjs';
import { buildProduct } from '../tools/build.mjs';

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

test('风味开关仅设置：开后改中文序数层级名（不再用符号番号）', () => {
  let st = makeState();
  st = startAndFinish(st, 'n1', NOW, NOW + 25 * MIN).state;
  const u = st.units[0];
  // 风味关：回归护栏——番号口径逐字不变
  assert.ok(focusUnitLabel(u, st.settings).indexOf('#1') === 0);
  st = focusSetFlavor(st, true).state;
  // 风味开（t41）：`第<N><单元层级名>`；不再出现番号符号与类型名
  const on = focusUnitLabel(u, st.settings);
  assert.ok(on.indexOf('第1任务单元') === 0, '风味开应以「第1任务单元」开头，实际：' + on);
  assert.equal(on.indexOf('#'), -1, '风味开不再显示番号符号');
  assert.equal(on.indexOf('专注'), -1, '类型名改由行上方类型标签承担，不再进行标题');
  st = focusSetStructure(st, 'triad').state;
  assert.equal(st.settings.structure, 'triad');
  st = focusSetTypeName(st, 'focus', '深度工作', NOW).state;
  st = focusSetLevelName(st, 'group', '小队', NOW).state;
  assert.equal(st.settings.typeNames.focus, '深度工作');
  assert.equal(st.settings.levelNames.group, '小队');
});

// ---------- t41：中文序数标签口径 / 单元类型标签 ----------

test('t41 中文序数：1/2/3/10/11/20/21/99 等正常值 + 非法值返回空串', () => {
  const cases = [[1, '一'], [2, '二'], [3, '三'], [4, '四'], [9, '九'], [10, '十'], [11, '十一'], [12, '十二'],
    [20, '二十'], [21, '二十一'], [30, '三十'], [99, '九十九'], [100, '一百'], [101, '一百零一'],
    [110, '一百一十'], [1000, '一千'], [1001, '一千零一'], [9999, '九千九百九十九']];
  cases.forEach(function (c) {
    assert.equal(focusChineseNumber(c[0]), c[1], '中文序数 ' + c[0]);
  });
  // 数字字符串视为序号
  assert.equal(focusChineseNumber('3'), '三');
  // 非法：<=0 / 非数字 / 非整数 / 超范围 → ''（调用方据此降级，绝不输出「第undefined」）
  [0, -1, 2.5, 1.5, 10000, NaN, Infinity, null, undefined, '', 'abc', 'x1', {}].forEach(function (bad) {
    assert.equal(focusChineseNumber(bad), '', '非法序号应返回空串：' + String(bad));
  });
  // 序数可用性判别器与之一致
  assert.equal(focusSeqOrdinalOk(3), true);
  assert.equal(focusSeqOrdinalOk('3'), true);
  assert.equal(focusSeqOrdinalOk(0), false);
  assert.equal(focusSeqOrdinalOk(2.5), false);
  assert.equal(focusSeqOrdinalOk(null), false);
  assert.equal(focusSeqOrdinalOk('abc'), false);
});

test('t41 风味关：编制/单元行标题逐字同 2.1.1（回归护栏）', () => {
  const off = focusDefaultSettings();
  assert.equal(off.flavor, false);
  assert.equal(focusOrgLabel({ level: 'army', seq: 1, name: '总目标' }, off), '◆1 总目标');
  assert.equal(focusOrgLabel({ level: 'corps', seq: 3, name: '嵌套组' }, off), '▲3 嵌套组');
  assert.equal(focusOrgLabel({ level: 'group', seq: 2, name: '' }, off), '●2');
  assert.equal(focusUnitLabel({ seq: 82, name: '名称', typeKey: 'focus' }, off), '#82 · 名称');
  assert.equal(focusUnitLabel({ seq: 82, name: '', taskText: '' }, off), '#82');
  // 风味关下行标题不含类型名（类型改由行上方标签承担）
  assert.equal(focusUnitLabel({ seq: 1, name: 'A', typeKey: 'scout' }, off), '#1 · A');
  // 既有入口语义不变
  assert.equal(focusUnitLabel(null, off), '#0');
  assert.equal(focusOrgLabel(null, off), '');
  // 未传 settings 时按默认（风味关）口径
  assert.equal(focusOrgLabel({ level: 'army', seq: 1, name: '总目标' }), '◆1 总目标');
});

test('t41 风味开：编制行改「第<中文序数><层级名> · <自定义名>」', () => {
  const st = Object.assign(focusDefaultSettings(), { flavor: true });
  assert.equal(focusOrgLabel({ level: 'army', seq: 1, name: '总目标' }, st), '第一任务集团 · 总目标');
  assert.equal(focusOrgLabel({ level: 'group', seq: 2, name: '写作' }, st), '第二任务组 · 写作');
  assert.equal(focusOrgLabel({ level: 'corps', seq: 11, name: '嵌入' }, st), '第十一任务群 · 嵌入');
  assert.equal(focusOrgLabel({ level: 'army', seq: 21, name: '' }, st), '第二十一任务集团');
  assert.equal(focusOrgLabel({ level: 'army', seq: 99, name: 'X' }, st), '第九十九任务集团 · X');
  // 层级名取 settings.levelNames[level]（可自定义）
  const custom = Object.assign({}, st, { levelNames: Object.assign({}, st.levelNames, { army: '总方向' }) });
  assert.equal(focusOrgLabel({ level: 'army', seq: 1, name: '总目标' }, custom), '第一总方向 · 总目标');
  // 未知层级键回落到键名本身（既有语义不变）
  assert.equal(focusOrgLabel({ level: 'squad', seq: 1, name: 'X' }, st), '第一squad · X');
  // 风味开不得出现番号符号（◆/▲/●）
  ['army', 'corps', 'group'].forEach(function (lv, i) {
    const t = focusOrgLabel({ level: lv, seq: i + 1, name: 'N' }, st);
    assert.equal(/[◆▲●]/.test(t), false, '风味开编制行仍含符号：' + t);
  });
});

test('t41 风味开：单元行改「第<N><单元层级名> · <自定义名>」（N 用阿拉伯数字）', () => {
  const st = Object.assign(focusDefaultSettings(), { flavor: true });
  assert.equal(focusUnitLabel({ seq: 82, name: '名称', typeKey: 'focus' }, st), '第82任务单元 · 名称');
  assert.equal(focusUnitLabel({ seq: 1, name: '积分', typeKey: 'scout' }, st), '第1任务单元 · 积分');
  assert.equal(focusUnitLabel({ seq: 3, name: '', taskText: '任务文本' }, st), '第3任务单元 · 任务文本');
  assert.equal(focusUnitLabel({ seq: 7, name: '' }, st), '第7任务单元');
  // 单元层级名同样取 settings.levelNames.unit
  const custom = Object.assign({}, st, { levelNames: Object.assign({}, st.levelNames, { unit: '单元' }) });
  assert.equal(focusUnitLabel({ seq: 82, name: '名称' }, custom), '第82单元 · 名称');
  // 风味开不得出现 # 或其它番号符号
  ['#', '◆', '▲', '●'].forEach(function (sym) {
    assert.equal(focusUnitLabel({ seq: 82, name: '名称' }, st).indexOf(sym), -1, '风味开单元行仍含符号：' + sym);
  });
});

test('t41 序号缺失/非法时降级：不带序数前缀，不出现「第undefined」与空串', () => {
  const st = Object.assign(focusDefaultSettings(), { flavor: true });
  [0, -1, 2.5, null, undefined, NaN, 'abc', {}].forEach(function (bad) {
    const t = focusOrgLabel({ level: 'army', seq: bad, name: '总目标' }, st);
    assert.equal(t, '任务集团 · 总目标', '编制降级异常：' + String(bad) + ' → ' + t);
    assert.equal(t.indexOf('第'), -1, '降级后不得带序数前缀：' + t);
    assert.equal(t.indexOf('undefined'), -1, '降级输出出现 undefined：' + t);
  });
  [0, -1, 2.5, null, undefined, NaN, 'abc'].forEach(function (bad) {
    const t = focusUnitLabel({ seq: bad, name: '名称' }, st);
    assert.equal(t, '任务单元 · 名称', '单元降级异常：' + String(bad) + ' → ' + t);
    assert.equal(t.indexOf('undefined'), -1, '降级输出出现 undefined：' + t);
  });
  // 无名称时降级也不得为空串
  assert.equal(focusOrgLabel({ level: 'army', seq: 0 }, st), '任务集团');
  assert.equal(focusUnitLabel({ seq: 0 }, st), '任务单元');
  // 超范围（>9999）同样降级
  assert.equal(focusOrgLabel({ level: 'army', seq: 10000, name: 'X' }, st), '任务集团 · X');
});

test('t41 单元类型标签：五类文本 + 空/未知 typeKey 回退「专注」', () => {
  const st = focusDefaultSettings();
  const keys = ['focus', 'assault', 'life', 'plan', 'scout'];
  ['专注', '突击', '生活', '计划', '侦查'].forEach(function (want, i) {
    assert.equal(focusUnitTypeLabel({ typeKey: keys[i] }, st), want, '类型名 ' + keys[i]);
    assert.equal(focusUnitTypeKey({ typeKey: keys[i] }), keys[i]);
  });
  [undefined, null, '', 'squad', 'FOCUS', 0].forEach(function (bad) {
    assert.equal(focusUnitTypeLabel({ typeKey: bad }, st), '专注', '回退失败：' + String(bad));
    assert.equal(focusUnitTypeKey({ typeKey: bad }), 'focus', '归一失败：' + String(bad));
  });
  assert.equal(focusUnitTypeLabel(null, st), '专注');
  assert.equal(focusUnitTypeLabel({}, st), '专注');
  // 自定义类型名生效；空串类型名回落内置「专注」
  const custom = Object.assign({}, st, { typeNames: Object.assign({}, st.typeNames, { assault: '猛攻', focus: '' }) });
  assert.equal(focusUnitTypeLabel({ typeKey: 'assault' }, custom), '猛攻');
  assert.equal(focusUnitTypeLabel({ typeKey: 'focus' }, custom), '专注', '空串类型名应回落内置「专注」');
  // 与风味开关无关：两种模式同结果
  const flavored = Object.assign({}, st, { flavor: true });
  assert.equal(focusUnitTypeLabel({ typeKey: 'scout' }, flavored), focusUnitTypeLabel({ typeKey: 'scout' }, st));
});

test('t41 渲染端契约：类型标签挂在单元行**上方**，且不拖拽/不绑事件', () => {
  const src = fs.readFileSync(new URL('../src/focus.mjs', import.meta.url), 'utf8');
  const mount = "if (r.kind === 'unit') tree.appendChild(focusUnitTypeTagEl(r.unit, r.depth, st.settings));";
  const tagPush = src.indexOf(mount);
  const rowPush = src.indexOf('tree.appendChild(row);');
  assert.ok(tagPush > 0, '未找到类型标签挂载点');
  assert.ok(rowPush > tagPush, '类型标签必须先于行入树（渲染在行上方）');
  const at = src.indexOf('function focusUnitTypeTagEl');
  assert.ok(at > 0, '未找到类型标签元素函数');
  const body = src.slice(at, at + 900);
  assert.ok(body.indexOf("el('div', 'focus-unit-type-tag'") > 0, '类型标签类名应为 .focus-unit-type-tag');
  assert.equal(body.indexOf('draggable'), -1, '类型标签不得可拖拽');
  assert.equal(body.indexOf('addEventListener'), -1, '类型标签不得绑任何事件（点它不改展开/选中）');
  assert.ok(body.indexOf("tag.setAttribute('data-type', key)") > 0, '类型标签应带 data-type（供样式与探针）');
});

test('t41 设置侧契约：层次徽标开关行已删除、风味显示文案改中文序数口径', () => {
  const s = fs.readFileSync(new URL('../src/settings.mjs', import.meta.url), 'utf8');
  const key = 'showLevel' + 'Tag';
  assert.equal(s.indexOf(key), -1, 'src/settings.mjs 又出现层次徽标设置键');
  assert.equal(s.indexOf('层级文字标'), -1, 'src/settings.mjs 又出现层次徽标设置行文案');
  assert.ok(s.indexOf('显示中文序数层级名') > 0, '风味显示行的说明文案未更新为中文序数口径');
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
  // 2.2.0 转正收紧：数量下限已达标，但两个下级组仍是「计划层待转正」的空组 → 仍不可转正
  const cChk = focusOrgCanFormalize(st, c.org.id);
  assert.equal(cChk.ok, false);
  assert.equal(cChk.reason, 'need_done_units');
  assert.equal(cChk.need, 2);
  assert.equal(cChk.childCount, 2);
  assert.deepEqual(cChk.pending.map(function (p) { return p.id; }).sort(), [g1.org.id, g2.org.id].sort());
  const badFin = focusFormalizeOrg(st, c.org.id, NOW);
  assert.equal(badFin.ok, false);
  assert.equal(badFin.reason, 'need_done_units');
  assert.equal(badFin.pending.length, 2);
  assert.equal(focusFindOrg(badFin.state, c.org.id).formalized, false, '校验失败不得写入');
  // 两个组各填一个已完成单元并各自转正后，群里才可转正（数量下限 + 下级全部完成）
  st = addUnits(st, 1, 700);
  st = focusAssignUnit(st, st.units[st.units.length - 1].id, g1.org.id, NOW).state;
  st = addUnits(st, 1, 700);
  st = focusAssignUnit(st, st.units[st.units.length - 1].id, g2.org.id, NOW).state;
  assert.equal(focusOrgCanFormalize(st, c.org.id).ok, false, '下级组未转正仍不可转正');
  st = focusFormalizeOrg(st, g1.org.id, NOW).state;
  st = focusFormalizeOrg(st, g2.org.id, NOW).state;
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

// ---------- t12：2.0 简洁风回滚（结构层级 / 树杈引导 / 两段式） ----------

test('层级结构：只留结构属性（层级 / rank / 四级次序），无颜色与字号规范', () => {
  assert.deepEqual(FOCUS_LEVEL_VISUAL_KEYS, ['rank', 'order']);
  assert.deepEqual(FOCUS_LEVEL_VISUAL_ORDER, ['unit', 'group', 'corps', 'army']);
  FOCUS_LEVEL_KEYS.forEach(function (lv, i) {
    const v = focusLevelVisual(lv);
    assert.ok(v, 'visual 缺失：' + lv);
    assert.equal(v.level, lv);
    assert.equal(v.rank, FOCUS_LEVEL_RANK[lv]);
    assert.equal(v.order, i);
    // 2.2.0 回滚：层级规范里不再有颜色 / 底色 / 字号 / 字重 / 边框
    ['borderColor', 'tint', 'fontSize', 'fontWeight', 'borderWidth', 'symbol'].forEach(function (k) {
      assert.equal(v[k], undefined, lv + ' 仍带旧视觉字段：' + k);
    });
  });
  // 结构次序与层次表同源
  assert.equal(FOCUS_LEVEL_VISUALS.army.rank, FOCUS_LEVEL_RANK.army);
  assert.equal(FOCUS_LEVEL_VISUALS.army.order, 3);
  for (let i = 0; i < FOCUS_LEVEL_KEYS.length; i++) {
    for (let j = i + 1; j < FOCUS_LEVEL_KEYS.length; j++) {
      const a = FOCUS_LEVEL_KEYS[i];
      const b = FOCUS_LEVEL_KEYS[j];
      const d = focusLevelVisualDelta(a, b);
      assert.ok(d >= 1, a + ' vs ' + b + ' 仅 ' + d + ' 项不同');
    }
  }
  assert.equal(focusLevelVisualDelta('unit', 'unit'), 0);
  assert.equal(focusLevelVisualDelta('unit', 'squad'), -1);
  assert.equal(focusLevelVisual('squad'), null);

  // t24 死代码守卫：父级 chip（渲染函数与选择器）自 t12 起无调用点，已整体删除，禁止复活。
  // 名称刻意拼接：避免本测试文件自身被「渲染函数全名」的 grep 命中（该验收要求 0 命中）。
  const CHIP_FN = 'focusParent' + 'ChipEl';
  const CHIP_CLS = ['focus', 'parent', 'chip'].join('-');
  const hasParentChip = (text) => {
    const s = String(text);
    return s.indexOf(CHIP_FN) >= 0 || s.indexOf(CHIP_CLS) >= 0;
  };
  // 反证：守卫必须能对「chip 复活」判红（合成样本），否则下面的 0 命中断言毫无意义
  assert.equal(hasParentChip('function ' + CHIP_FN + '(attr) { return null; }'), true, '守卫失效：合成函数样本应判红');
  assert.equal(hasParentChip('span.' + CHIP_CLS + ' { color: red; }'), true, '守卫失效：合成选择器样本应判红');
  assert.equal(hasParentChip('.focus-level-badge { color: red; }'), false, '守卫误报：邻近选择器应判绿');
  const focusSrcText = fs.readFileSync(new URL('../src/focus.mjs', import.meta.url), 'utf8');
  const styleText = fs.readFileSync(new URL('../style.css', import.meta.url), 'utf8');
  assert.equal(hasParentChip(focusSrcText), false, 'src/focus.mjs 又出现父级 chip 死代码');
  assert.equal(hasParentChip(styleText), false, 'style.css 又出现父级 chip 选择器');
  assert.equal(hasParentChip(buildProduct()), false, '构建产物又出现父级 chip 死代码');
  // 归属信息仍由既有渲染承担：纯函数入口在，展开面板 .focus-tree-expand-attr 才会输出「归属 …」
  assert.equal(typeof focusParentAttribution, 'function');
  assert.equal(focusParentAttribution(focusDefaultState(), 'nope'), null);
});

test('层级视觉顺序严格递进（四级，t41 未改动）', () => {
  // 四级文字/结构顺序严格递进（层次越高 order 越大）——与 t41 删除 chip 无关，原断言原样保留
  const orders = FOCUS_LEVEL_KEYS.map(function (lv) { return focusLevelVisual(lv).order; });
  for (let i = 1; i < orders.length; i++) {
    assert.ok(orders[i] > orders[i - 1], '未递进：' + JSON.stringify(orders));
  }
});

test('t41 层次徽标 chip 已整体删除：纯函数 / 元素函数 / 设置键 三条 0 命中', () => {
  // 名称刻意拼接：避免本测试文件自身被「函数全名 / 选择器字面量 / 设置键」的 grep 命中（该验收要求 0 命中）
  const BADGE_FN = 'focusLevel' + 'Badge';
  const BADGE_EL_FN = 'focusLevel' + 'BadgeEl';
  const BADGE_CLS = ['focus', 'level', 'badge'].join('-');
  const TAG_KEY = 'showLevel' + 'Tag';
  const hit = (text, needle) => String(text).indexOf(needle) >= 0;
  // 反证：守卫必须能对「chip 复活」判红（合成样本），否则下面的 0 命中断言毫无意义
  assert.equal(hit('function ' + BADGE_FN + '(level) { return null; }', BADGE_FN), true, '守卫失效：合成函数样本应判红');
  assert.equal(hit('span.' + BADGE_CLS + ' { color: red; }', BADGE_CLS), true, '守卫失效：合成选择器样本应判红');
  assert.equal(hit('.focus-tree-guide { color: red; }', BADGE_CLS), false, '守卫误报：邻近选择器应判绿');
  assert.equal(hit('const x = ' + TAG_KEY + ';', TAG_KEY), true, '守卫失效：合成设置键样本应判红');
  // 1) src 文本 + 构建产物：三个名字 0 命中（不留死代码，参照 t24 先例）
  const srcText = fs.readFileSync(new URL('../src/focus.mjs', import.meta.url), 'utf8');
  [['src/focus.mjs', srcText], ['构建产物', buildProduct()]].forEach(function (pair) {
    const who = pair[0];
    const text = pair[1];
    assert.equal(hit(text, BADGE_FN), false, who + ' 又出现层次徽标 chip 纯函数');
    assert.equal(hit(text, BADGE_EL_FN), false, who + ' 又出现层次徽标 chip 元素函数');
    assert.equal(hit(text, BADGE_CLS), false, who + ' 又出现层次徽标 chip 选择器');
    assert.equal(hit(text, TAG_KEY), false, who + ' 又出现层次徽标设置键');
  });
  // 2) 设置键已删除：默认设置/默认状态/sanitize 都不再输出该键，旧数据携带该键须被静默忽略且不抛错
  assert.equal(TAG_KEY in focusDefaultSettings(), false, '默认设置仍输出层次徽标开关');
  assert.equal(TAG_KEY in focusDefaultState().settings, false, '默认状态的设置仍输出层次徽标开关');
  const stale = {};
  stale[TAG_KEY] = false;
  const sanitized = focusSanitizeState({ settings: stale });
  assert.equal(TAG_KEY in sanitized.settings, false, 'sanitize 仍输出层次徽标开关');
  assert.equal(sanitized.settings.flavor, false, '旧数据静默忽略该键后，其余字段仍应正常');
  // 3) 渲染端不再有 chip 挂载点与计数调用（行内层级信息只剩行标题一处）
  assert.equal(srcText.indexOf('main.appendChild(' + BADGE_FN), -1, 'src 又出现 chip 挂载点');
  assert.equal(srcText.indexOf('focusNextLevelCount(st, r.id)'), -1, 'src 又出现 chip 专用的下级计数调用');
});

test('树行带显式层级 + 树杈引导链（单元行 level=unit）', () => {
  let st = makeState();
  const gr = focusCreateOrg(st, { level: 'group', name: '写作', fromPlan: true }, NOW);
  st = gr.state;
  st = startAndFinish(st, 'n1', NOW, NOW + 25 * MIN).state;
  const unitId = st.units[0].id;
  st = focusAssignUnit(st, unitId, gr.org.id, NOW).state;

  const rows = focusTreeRows(st, {});
  const uRow = rows.filter(function (r) { return r.kind === 'unit' && r.id === unitId; })[0];
  assert.equal(uRow.level, 'unit');
  assert.equal(uRow.visual, focusLevelVisual('unit'));
  assert.equal(uRow.depth, 1);
  const gRow = rows.filter(function (r) { return r.kind === 'org' && r.id === gr.org.id; })[0];
  assert.equal(gRow.level, 'group');
  assert.equal(gRow.visual, focusLevelVisual('group'));
  assert.equal(gRow.depth, 0);
  assert.equal(gRow.parent.attached, false);
  assert.equal(gRow.parent.text, '未编入');
  const rootRow = rows.filter(function (r) { return r.kind === 'root'; })[0];
  assert.equal(rootRow.level, undefined);
  assert.ok(rootRow.visual == null);

  // 引导链：每行都有树杈字符，缩进宽度按层级递进，且不依赖颜色
  const guides = focusTreeGuides(rows);
  assert.equal(guides.length, rows.length);
  rows.forEach(function (r, i) {
    const g = guides[i];
    assert.equal(g.depth, r.depth);
    assert.equal(typeof g.text, 'string');
    assert.ok(g.text.length >= 2, '引导线过短：' + JSON.stringify(g.text));
    assert.equal(g.chars, g.text.length);
    assert.equal(g.chars, 2 * (r.depth + 1), '缩进宽度应按层级递进：' + JSON.stringify(g.text));
  });
  const g0 = guides[rows.indexOf(gRow)];
  const g1 = guides[rows.indexOf(uRow)];
  assert.equal(g0.text, '├─');
  assert.equal(g1.text, '│ └─');
  assert.ok(g1.text.length > g0.text.length, '引导线宽度未按层级递进');
});

test('树杈引导：父级竖线可见，同级最后一项用 └、其余用 ├（折叠父级仍带竖线）', () => {
  // 三层全在合法编制内：集团 ◆ ← 群 ▲ ← 组 ●（focusCanAttach 只允许「恰为上一级」）
  let st = makeState();
  const a = focusCreateOrg(st, { level: 'army', name: 'A' }, NOW);
  assert.equal(a.ok, true, '需要计划模式才能建高层次');
  st = a.state;
  const c = focusCreateOrg(st, { level: 'corps', name: 'C' }, NOW);
  st = c.state;
  const g = focusCreateOrg(st, { level: 'group', name: 'G' }, NOW);
  st = g.state;
  assert.equal(focusCanAttach('corps', 'army'), true);
  assert.equal(focusCanAttach('group', 'corps'), true);
  assert.equal(focusCanAttach('group', 'army'), false, '不得跨级编入');
  const attC = focusAttachNodes(st, [c.org.id], a.org.id, NOW);
  assert.equal(attC.ok, true, '群应能编入集团');
  st = attC.state;
  const attG = focusAttachNodes(st, [g.org.id], c.org.id, NOW);
  assert.equal(attG.ok, true, '组应能编入群');
  st = attG.state;

  const rows = focusTreeRows(st, {});
  const guides = focusTreeGuides(rows);
  const byId = {};
  rows.forEach(function (r, i) { byId[r.id] = guides[i]; });

  // 集团：顶层还有下文 → ├─
  assert.equal(byId[a.org.id].depth, 0);
  assert.equal(byId[a.org.id].text, '├─');
  // 群：挂在集团下且是集团最后一个下级 → 父级竖线 + └
  assert.equal(byId[c.org.id].depth, 1);
  assert.equal(byId[c.org.id].text, '│ └─');
  assert.equal(byId[c.org.id].chain[0], true, '父级竖线位应为实线');
  // 组：是群的最后一个下级（群后面不再有同层节点）→ 父级竖线收束为留白
  // 留白用不换行空格（\u00A0）：HTML 会把连续普通空格折叠掉，缩进会错位
  assert.equal(byId[g.org.id].depth, 2);
  assert.equal(byId[g.org.id].text, '│ \u00A0 └─');
  // 「未编入」是顶层最后一行 → └─（缩进 0）
  const root = rows.filter(function (r) { return r.kind === 'root'; })[0];
  assert.equal(byId[root.id].depth, 0);
  assert.equal(byId[root.id].text, '└─');

  // 每行缩进宽度 = 2 * (层级 + 1) 个字符，逐级递进
  rows.forEach(function (r, i) {
    assert.equal(guides[i].chars, 2 * (r.depth + 1), '缩进未按层级递进：' + JSON.stringify(guides[i].text));
  });

  // 折叠群：群的下级不渲染，但群行引导位仍是实线（父级竖线不因折叠消失）
  const collapsed = {};
  collapsed[c.org.id] = true;
  const rows2 = focusTreeRows(st, { collapsed: collapsed });
  const guides2 = focusTreeGuides(rows2);
  const cIdx = rows2.map(function (r) { return r.id; }).indexOf(c.org.id);
  assert.ok(cIdx >= 0);
  assert.equal(guides2[cIdx].text, '│ └─');
  assert.equal(rows2.filter(function (r) { return r.id === g.org.id; }).length, 0, '折叠后不应有下级行');
});

test('两段式第二段：展开字段取自既有纯函数（起止/总时/均完成/下级数/单元数/计划中/截止）', () => {
  let st = makeState();
  const g = focusCreateOrg(st, { level: 'group', name: '写作', fromPlan: true, dueAt: NOW + 3 * 86400000, minChildCount: 2 }, NOW);
  st = g.state;
  st = startAndFinish(st, 'n1', NOW, NOW + 25 * MIN, { completion: 80 }).state;
  const u1 = st.units[0];
  st = focusAssignUnit(st, u1.id, g.org.id, NOW).state;

  const rows = focusTreeRows(st, {});
  const gRow = rows.filter(function (r) { return r.id === g.org.id; })[0];
  const info = focusTreeExpandFields(st, gRow);
  const f = {};
  info.fields.forEach(function (x) { f[x[0]] = String(x[1]); });
  const agg = focusOrgAggregates(st, g.org.id);
  assert.equal(f['起止时间'], focusFmtTs(agg.startAt) + ' → ' + focusFmtTs(agg.endAt));
  assert.ok(f['起止时间'].indexOf('→') > 0);
  assert.equal(f['总时间'], focusFmtDur(agg.totalMin));
  assert.equal(f['平均完成度'], String(agg.avgCompletion) + '%');
  assert.equal(f['下级数量'], String(focusNextLevelCount(st, g.org.id)) + ' 个任务单元');
  assert.equal(f['单元数量'], agg.unitCount + ' 个');
  assert.ok(f['是否计划中'].indexOf('是') === 0, '计划中应显示「是」');
  assert.equal(f['计划截止日期'], focusFmtTs(g.org.dueAt));
  assert.equal(info.kind, 'org');
  // t27：标题只取主体名称，「第 X 层 · 层次名」这类层级前缀不再混入标题；
  // 层次名与番号各走独立字段（渲染端用独立元素承载）
  assert.equal(info.title, '写作', '标题应只取主体名称：' + info.title);
  assert.ok(info.title.indexOf('第 ') < 0 && info.title.indexOf('单元 #') < 0, '标题不得含层级前缀');
  assert.equal(info.levelText, '任务组');
  assert.equal(info.seqText, '●1');
  assert.equal(info.parent.attached, false);

  // t27：计划中 / 计划截止日期提升为标签（只从 fields 派生，单一真源），其余字段进模块卡
  const tags = focusExpandTagViews(info);
  assert.deepEqual(tags.map(function (t) { return t.kind; }), ['plan', 'due']);
  assert.equal(tags[0].key, '是否计划中');
  assert.equal(tags[0].text, '计划中');
  assert.ok(tags[0].title.indexOf('转正需下级全部完成（≥ 2 个）') >= 0, '转正所需下级数应随标签 title：' + tags[0].title);
  assert.equal(tags[1].key, '计划截止日期');
  assert.ok(tags[1].text.indexOf('截止 ') === 0, '有截止日期应有明确标签：' + tags[1].text);
  assert.equal(tags[1].title, focusFmtTs(g.org.dueAt));
  assert.deepEqual(focusExpandModuleViews(info).map(function (m) { return m.key; }),
    ['起止时间', '总时间', '平均完成度', '下级数量', '单元数量'], '标签化的两行不再进模块卡');

  // 无下级单元：时间/完成度给明确文案，字段一个不少
  let st2 = makeState();
  const g2 = focusCreateOrg(st2, { level: 'group', name: '空组', fromPlan: false }, NOW);
  st2 = g2.state;
  const row2 = focusTreeRows(st2, {}).filter(function (r) { return r.id === g2.org.id; })[0];
  const info2 = focusTreeExpandFields(st2, row2);
  assert.equal(info2.fields.length, 7, '七项字段必须齐全');
  const f2 = {};
  info2.fields.forEach(function (x) { f2[x[0]] = String(x[1]); });
  assert.equal(f2['单元数量'], '0 个');
  assert.equal(f2['平均完成度'], '暂无');
  assert.ok(f2['是否计划中'].indexOf('否') === 0, '正式层次应显示「否」');
  assert.equal(f2['计划截止日期'], '未设置');
  // t27：未设置的截止日期也要有明确标签
  const tags2 = focusExpandTagViews(info2);
  assert.equal(tags2[0].text, '已完成层次');
  assert.equal(tags2[1].text, '无截止日期');
  assert.equal(tags2[1].title, '未设置截止日期');

  // 单元行：字段给到实际/计划时长（t36：**已编入**单元的归属不是字段行，唯一带前缀的渲染点是
  // 面板的 .focus-tree-expand-attr；未编入单元反过来——没有 attr 行，归属由字段行承载）
  const uRow = rows.filter(function (r) { return r.id === u1.id; })[0];
  const uInfo = focusTreeExpandFields(st, uRow);
  assert.equal(uInfo.kind, 'unit');
  const uf = {};
  uInfo.fields.forEach(function (x) { uf[x[0]] = String(x[1]); });
  assert.equal(uf['起止时间'], focusFmtTs(u1.startedAt) + ' → ' + focusFmtTs(u1.endedAt));
  assert.equal(uf['完成度'], u1.completion + '%');
  // t36：旧断言 `uf['归属'] === '●1 写作'` 与 t26 判据冲突——该字段行 + attr 行会让已编入单元的
  // 展开面板里「归属」出现两次（t26 证据 panelCount=2）。本行 u1 已编入 → 字段行不出现，
  // 归属实体改由 parent 提供；未编入单元仍走字段行（见本文件下方未编入用例）。
  assert.equal(uInfo.parent.attached, true);
  assert.equal(uf['归属'], undefined, 't36：已编入单元的模块卡不得再有「归属」字段行');
  assert.equal(uInfo.parent.text, '●1 写作', '归属实体仍由 parent 提供（不含「归属 」前缀）');
  // t27：单元标题同样取主体名（不拼「单元 #N · 链名」），番号走独立字段
  assert.equal(uInfo.title, String(u1.name == null ? '' : u1.name) || '未命名单元');
  assert.ok(uInfo.title.indexOf('单元 #') < 0, '单元标题不得含「单元 #N ·」前缀：' + uInfo.title);
  assert.equal(uInfo.seqText, '#' + (Number(u1.seq) || 0));
  assert.equal(uInfo.levelText, '');
  assert.equal(focusExpandTagViews(uInfo).length, 0, '单元没有计划/截止标签');
  assert.equal(focusTreeExpandKey(uRow), 'unit:' + u1.id);
  assert.equal(focusTreeExpandKey(gRow), 'org:' + g.org.id);
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
  assert.equal(a.text, '●1 写作'); // 契约：text 是实体，不含「归属 」前缀（前缀只在渲染点拼）

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
  assert.equal(gAttr.text, '▲1 论文');
  assert.equal(focusNodeLevel(st, gr.org.id), 'group');
  // 单元归属不受影响（父级仍是那个组）
  assert.equal(focusParentAttribution(st, unitId).parentLevel, 'group');
});

test('展开面板归属行：纯函数给实体、唯一前缀在渲染点，「归属」只出现一次', () => {
  // 判别器：统计文本里「归属」出现次数；先以合成样本自证可判红（否则本测试的所有断言都没有判别力）
  const countWord = function (s) { return String(s).split('归属').length - 1; };
  assert.equal(countWord('归属 归属 ●1 写作'), 2); // t26 F1（字段行 + attr 行各一次）必须判红
  assert.equal(countWord('归属 ●1 写作'), 1);
  assert.equal(countWord('未编入'), 0);

  // 已编入：纯函数只给实体，渲染端在 .focus-tree-expand-attr 行拼一次前缀 → 面板里「归属」恰好一次
  let st = makeState();
  const gr = focusCreateOrg(st, { level: 'group', name: '写作', fromPlan: true }, NOW);
  st = gr.state;
  st = startAndFinish(st, 'n1', NOW, NOW + 25 * MIN).state;
  const unitId = st.units[0].id;
  st = focusAssignUnit(st, unitId, gr.org.id, NOW).state;
  const row = focusTreeRows(st, {}).filter(function (r) { return r.id === unitId; })[0];
  const info = focusTreeExpandFields(st, row);
  assert.equal(info.parent.attached, true);
  assert.equal(info.parent.text, '●1 写作'); // 契约：text 不含「归属 」前缀
  assert.equal(info.parent.parentLabel, '●1 写作'); // 已编入时 parentLabel 与 text 同值（均为纯数据）
  const attrLine = '归属 ' + String(info.parent.text || ''); // 与 focusTreeExpandPanelEl 的拼法逐字同源
  assert.equal(attrLine, '归属 ●1 写作');
  assert.equal(countWord(attrLine), 1);
  const fv = {};
  info.fields.forEach(function (x) { fv[x[0]] = String(x[1]); });
  // t36：旧断言 `fv['归属'] === '●1 写作'` 与 t26 判据冲突——它就是重复的第二处（字段行）。
  // 现在已编入单元的字段行不出现，attr 行守卫 attached（已编入才渲染）→ 面板里「归属」只来自 attrLine。
  assert.equal(fv['归属'], undefined, 't36：已编入不得再有「归属」字段行（面板仅 attrLine 一处 = 1）');
  assert.equal(countWord(attrLine) + (fv['归属'] ? countWord(fv['归属']) : 0), 1, '面板归属出现次数 = 1');

  // 未编入：attr 行不渲染（守卫 attached；t25:unattached-renders-explicit-text 要求 attrLines===0），
  // 归属信息改由单元模块卡字段行 ['归属','未编入'] 承载 → 面板里仍然恰好一次（信息不得整体丢失）
  let st2 = makeState();
  st2 = startAndFinish(st2, 'n1', NOW, NOW + 25 * MIN).state;
  const freeId = st2.units[0].id;
  const row2 = focusTreeRows(st2, {}).filter(function (r) { return r.id === freeId; })[0];
  const info2 = focusTreeExpandFields(st2, row2);
  assert.equal(info2.parent.attached, false);
  assert.equal(info2.parent.text, '未编入');
  const fv2 = {};
  info2.fields.forEach(function (x) { fv2[x[0]] = String(x[1]); });
  // t36：旧断言 `fv2['归属'] === undefined`（＝未编入也由 attr 行渲染「归属 未编入」）与 t25 判据冲突：
  // t25:unattached-renders-explicit-text 要求 attrLines===0 且模块卡给「归属：未编入」。
  assert.equal(fv2['归属'], '未编入', '未编入单元由模块卡字段行承载归属（信息不得整体丢失）');
  const attrLine2 = info2.parent.attached ? '归属 ' + String(info2.parent.text || '') : '';
  assert.equal(attrLine2, '', '未编入不渲染 attr 行（t25:unattached-renders-explicit-text：attrLines=0）');
  // 模块卡 DOM 文本近似：key 元素 + val 元素（.focus-tree-expand-mod-key / -val）——「归属」出现次数看 key
  const fieldRowText2 = '归属' + String(fv2['归属']);
  assert.equal(fieldRowText2, '归属未编入');
  assert.equal(countWord(attrLine2) + countWord(fieldRowText2), 1, '未编入面板归属出现次数 = 1');
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

// ---------- t13：已完成单元免计划组合（已完成层次） + 转正需下属完成 ----------

test('t13 免计划组合：成员全为已完成单元即可组合，产物为「已完成层次」', () => {
  const base = addUnits(makeState(), 3, 0);
  const ids = base.units.map(function (u) { return u.id; });
  // 全部完成 → 准备度就绪（免计划组合的前提）
  const ready = focusCombineReadiness(base, ids);
  assert.equal(ready.allDone, true);
  assert.equal(ready.done, 3);
  assert.equal(ready.total, 3);
  assert.deepEqual(ready.pending, []);

  // 关闭计划模式：仍可组合（无需 force）
  let st = focusSetPlanMode(base, false).state;
  assert.equal(st.planMode, false);
  const r = focusCombineNodes(st, { ids: ids, name: '收官组' }, NOW);
  assert.equal(r.ok, true);
  assert.equal(r.level, 'group');
  // 产物是「已完成层次」：fromPlan=false + formalized=true，不入待转正流程
  assert.equal(r.org.fromPlan, false);
  assert.equal(r.org.formalized, true);
  assert.equal(focusOrgPending(r.org), false);
  assert.equal(focusOrgStateLabel(r.org), '已完成');
  st = r.state;
  assert.equal(st.orgs.length, 1, '只多出这一个产物，无空壳');
  assert.equal(st.units.filter(function (u) { return u.orgId === r.org.id; }).length, 3);
  assert.equal(focusOrgCanFormalize(st, r.org.id).reason, 'not_plan');
  const fin = focusFormalizeOrg(st, r.org.id, NOW);
  assert.equal(fin.ok, false);
  assert.equal(fin.reason, 'not_plan');
  assert.equal(focusFindOrg(fin.state, r.org.id).formalized, true, '已完成层次不得被改写');

  // 对照：计划模式内语义不变（产物仍是计划层，待转正）
  const planSt = focusSetPlanMode(base, true).state;
  const pr = focusCombineNodes(planSt, { ids: ids, name: '计划组' }, NOW);
  assert.equal(pr.ok, true);
  assert.equal(pr.org.fromPlan, true);
  assert.equal(pr.org.formalized, false);
  assert.equal(focusOrgStateLabel(pr.org), '计划中');

  // 非计划模式下显式 fromPlan:true 也不能造出计划层（产物恒为已完成层次）
  const forced = focusCombineNodes(focusSetPlanMode(base, false).state,
    { ids: ids.slice(0, 2), name: '显式计划', fromPlan: true }, NOW);
  assert.equal(forced.ok, true);
  assert.equal(forced.org.fromPlan, false);
  assert.equal(forced.org.formalized, true);
});

test('t13 已完成层次可再组合到更高层，也可带 parentId 归属既有层次', () => {
  const base = addUnits(makeState(), 12, 0);
  let st = focusSetPlanMode(base, false).state;
  const ids = base.units.map(function (u) { return u.id; });
  const gA = focusCombineNodes(st, { ids: ids.slice(0, 3), name: 'G-A' }, NOW);
  assert.equal(gA.ok, true);
  st = gA.state;
  const gB = focusCombineNodes(st, { ids: ids.slice(3, 6), name: 'G-B' }, NOW);
  st = gB.state;

  // 两个「已完成组」→ 已完成群（层级 +1，仍免计划）
  const c = focusCombineNodes(st, { ids: [gA.org.id, gB.org.id], name: 'C-A' }, NOW);
  assert.equal(c.ok, true);
  assert.equal(c.level, 'corps');
  assert.equal(c.org.fromPlan, false);
  assert.equal(c.org.formalized, true);
  st = c.state;
  assert.equal(focusFindOrg(st, gA.org.id).parentId, c.org.id);
  assert.equal(focusFindOrg(st, gB.org.id).parentId, c.org.id);

  // 带 parentId：新的已完成组直接归属到既有群
  const gC = focusCombineNodes(st, { ids: ids.slice(6, 9), name: 'G-C', parentId: c.org.id }, NOW);
  assert.equal(gC.ok, true);
  assert.equal(gC.org.parentId, c.org.id);
  st = gC.state;
  assert.equal(focusFindOrg(st, gC.org.id).parentId, c.org.id);

  // 继续向上：已完成组 → 已完成群 → 已完成集团（全程免计划）
  const gD = focusCombineNodes(st, { ids: ids.slice(9, 12), name: 'G-D' }, NOW);
  assert.equal(gD.ok, true);
  st = gD.state;
  const cD = focusCombineNodes(st, { ids: [gD.org.id], name: 'C-D' }, NOW);
  assert.equal(cD.ok, true);
  st = cD.state;
  const army = focusCombineNodes(st, { ids: [c.org.id, cD.org.id], name: 'A-A' }, NOW);
  assert.equal(army.ok, true);
  assert.equal(army.level, 'army');
  assert.equal(army.org.fromPlan, false);
  assert.equal(army.org.formalized, true);
  st = army.state;
  assert.equal(focusFindOrg(st, c.org.id).parentId, army.org.id);
  // 一级也不能跳：单元不得直接进群/集团，组不得直接进集团
  assert.equal(focusAttachNodes(st, [ids[0]], c.org.id, NOW).reason, 'bad_parent');
  assert.equal(focusAttachNodes(st, [gA.org.id], army.org.id, NOW).reason, 'bad_parent');
  // 集团是最高层
  assert.equal(focusCombineLevelOf(st, [army.org.id]), null);
  assert.equal(focusCombineNodes(st, { ids: [army.org.id] }, NOW).reason, 'no_level_up');
});

test('t13 循环守卫与逐级校验：祖先判定 + 自环零写入', () => {
  const base = addUnits(makeState(), 3, 0);
  let st = focusSetPlanMode(base, false).state;
  const ids = base.units.map(function (u) { return u.id; });
  const g = focusCombineNodes(st, { ids: ids, name: 'G' }, NOW);
  assert.equal(g.ok, true);
  st = g.state;
  const c = focusCombineNodes(st, { ids: [g.org.id], name: 'C' }, NOW);
  assert.equal(c.ok, true);
  st = c.state;

  // 祖先判定：群是组的祖先；反向不成立；自身不是自己的祖先；不存在 → false
  assert.equal(focusIsAncestorOrg(st, c.org.id, g.org.id), true);
  assert.equal(focusIsAncestorOrg(st, g.org.id, c.org.id), false);
  assert.equal(focusIsAncestorOrg(st, c.org.id, c.org.id), false);
  assert.equal(focusIsAncestorOrg(st, 'nope', g.org.id), false);

  // 自环／错级编入一律 bad_parent，且零写入
  const before = JSON.stringify(st.orgs);
  const self = focusAttachNodes(st, [c.org.id], c.org.id, NOW);
  assert.equal(self.ok, false);
  assert.equal(self.reason, 'bad_parent');
  assert.equal(focusFindOrg(self.state, c.org.id).parentId, null);
  assert.equal(focusAttachNodes(st, [g.org.id], g.org.id, NOW).reason, 'bad_parent');
  assert.equal(focusAttachNodes(st, [c.org.id], g.org.id, NOW).reason, 'bad_parent');
  assert.equal(JSON.stringify(st.orgs), before, '守卫拒绝时不得写入');
  // 正常逐级编入仍可用（组 → 已有群）
  const c2 = focusCombineNodes(st, { ids: ['__none__'] }, NOW);
  assert.equal(c2.reason, 'not_found');
});

test('t13 非计划模式含未完成成员：明确拒绝，零写入（不得留空壳）', () => {
  const raw = {
    planMode: false,
    units: [
      { id: 'u_done', typeKey: 'focus', name: '完成', startedAt: NOW, endedAt: NOW + 25 * MIN, seq: 1 },
      { id: 'u_doing', typeKey: 'focus', name: '未完成', startedAt: NOW, endedAt: 0, seq: 2 }
    ]
  };
  const st = focusSanitizeState(raw);
  assert.equal(focusUnitDone(focusFindUnit(st, 'u_doing')), false);
  const ready = focusCombineReadiness(st, ['u_done', 'u_doing']);
  assert.equal(ready.allDone, false);
  assert.equal(ready.done, 1);
  assert.deepEqual(ready.pending, ['u_doing']);

  const r = focusCombineNodes(st, { ids: ['u_done', 'u_doing'], name: 'G' }, NOW);
  assert.equal(r.ok, false);
  assert.equal(r.reason, 'member_incomplete');
  assert.deepEqual(r.pending, ['u_doing']);
  assert.equal(r.doneCount, 1);
  assert.equal(r.memberCount, 2);
  assert.equal(r.state.orgs.length, st.orgs.length, '拒绝时不得创建空壳节点');
  assert.equal(r.state.units.filter(function (u) { return u.orgId; }).length, 0, '不得偷偷编入');
  assert.notEqual(focusReasonText(r.reason), '操作失败', '须有明确失败原因文案');

  // 全未完成同样被拒
  const allUndone = focusCombineNodes(st, { ids: ['u_doing'], name: 'G' }, NOW);
  assert.equal(allUndone.reason, 'member_incomplete');
  assert.deepEqual(allUndone.pending, ['u_doing']);

  // 计划模式内语义不变：可组合成计划层（待转正），不因含未完成成员被拒
  const planSt = focusSanitizeState(Object.assign({}, raw, { planMode: true }));
  const pr = focusCombineNodes(planSt, { ids: ['u_done', 'u_doing'], name: 'G' }, NOW);
  assert.equal(pr.ok, true);
  assert.equal(pr.org.fromPlan, true);
  assert.equal(pr.org.formalized, false);
  assert.equal(focusOrgStateLabel(pr.org), '计划中');
});

test('t13 转正收紧：下一级须全部为完成单元（组→单元；群/集团→递归到单元）', () => {
  const unitDone = { id: 'u1', typeKey: 'focus', name: '已完成', startedAt: NOW, endedAt: NOW + 25 * MIN, seq: 1, orgId: 'g1' };
  const unitDoing = { id: 'u2', typeKey: 'focus', name: '未完成', startedAt: NOW, endedAt: 0, seq: 2, orgId: 'g1' };
  const groupPending = { id: 'g1', level: 'group', seq: 1, name: '组', fromPlan: true, formalized: false, minChildCount: 1 };

  // 组：1 完成 + 1 未完成 → need_done_units（数量已达标，未完成拦住）
  const st = focusSanitizeState({ planMode: true, units: [unitDone, unitDoing], orgs: [groupPending] });
  const chk = focusOrgCanFormalize(st, 'g1');
  assert.equal(chk.ok, false);
  assert.equal(chk.reason, 'need_done_units');
  assert.equal(chk.need, 1);
  assert.equal(chk.childCount, 2);
  assert.deepEqual(chk.pending.map(function (p) { return p.id; }), ['u2']);
  assert.equal(chk.pending[0].kind, 'unit');
  assert.equal(chk.pending[0].level, 'unit');
  assert.ok(chk.pending[0].label, '未完成清单须带可读名称');
  const fin = focusFormalizeOrg(st, 'g1', NOW);
  assert.equal(fin.ok, false);
  assert.equal(fin.reason, 'need_done_units');
  assert.equal(fin.pending.length, 1);
  assert.equal(focusFindOrg(fin.state, 'g1').formalized, false, '失败不得写入');
  assert.equal(fin.state.units.filter(function (u) { return u.orgId === 'g1'; }).length, 2);

  // 同一结构、两个单元都完成 → 可转正，pending 为空
  const stOk = focusSanitizeState({
    planMode: true,
    units: [unitDone, Object.assign({}, unitDoing, { endedAt: NOW + 50 * MIN, seq: 2 })],
    orgs: [groupPending]
  });
  const chkOk = focusOrgCanFormalize(stOk, 'g1');
  assert.equal(chkOk.ok, true);
  assert.equal(chkOk.need, 1);
  assert.equal(chkOk.childCount, 2);
  assert.deepEqual(chkOk.pending, []);
  assert.equal(focusFormalizeOrg(stOk, 'g1', NOW).ok, true);

  // 数量下限仍优先生效：0 个下级 + minChildCount 2 → need_fill
  const stFew = focusSanitizeState({
    planMode: true,
    orgs: [{ id: 'g2', level: 'group', seq: 1, fromPlan: true, minChildCount: 2 }]
  });
  const chkFew = focusOrgCanFormalize(stFew, 'g2');
  assert.equal(chkFew.reason, 'need_fill');
  assert.equal(chkFew.need, 2);
  assert.equal(chkFew.childCount, 0);
  assert.equal(focusFormalizeHint(chkFew), '转正需 2 个下级（现有 0）');

  // 群：下级组仍是计划层 → pending 是那个 org；子组转正后群才可转正
  const stCorps = focusSanitizeState({
    planMode: true,
    units: [unitDone],
    orgs: [
      { id: 'c1', level: 'corps', seq: 1, name: '群', fromPlan: true, formalized: false, minChildCount: 1 },
      groupPending
    ].map(function (o) { return o.id === 'g1' ? Object.assign({}, o, { parentId: 'c1' }) : o; })
  });
  const chkCorps = focusOrgCanFormalize(stCorps, 'c1');
  assert.equal(chkCorps.reason, 'need_done_units');
  assert.equal(chkCorps.pending.length, 1);
  assert.equal(chkCorps.pending[0].kind, 'org');
  assert.equal(chkCorps.pending[0].id, 'g1');
  assert.equal(chkCorps.pending[0].level, 'group');
  assert.equal(focusFormalizeHint(chkCorps), '转正需下级全部完成（未完成 1 项）');
  const afterChild = focusFormalizeOrg(stCorps, 'g1', NOW).state;
  assert.equal(focusOrgCanFormalize(afterChild, 'c1').ok, true);
  assert.equal(focusFormalizeOrg(afterChild, 'c1', NOW).ok, true);
  assert.equal(focusOrgPending(focusFindOrg(focusFormalizeOrg(afterChild, 'c1', NOW).state, 'c1')), false);

  // 集团：递归到单元——深层未完成单元同样拦住转正（即使中间层已转正）
  const stArmy = focusSanitizeState({
    planMode: true,
    units: [{ id: 'u1', typeKey: 'focus', name: '未完成', startedAt: NOW, endedAt: 0, seq: 1, orgId: 'g1' }],
    orgs: [
      { id: 'a1', level: 'army', seq: 1, name: '集团', fromPlan: true, formalized: false, minChildCount: 1 },
      { id: 'c1', level: 'corps', seq: 1, parentId: 'a1', fromPlan: true, formalized: true, minChildCount: 1 },
      { id: 'g1', level: 'group', seq: 1, parentId: 'c1', fromPlan: true, formalized: true, minChildCount: 1 }
    ]
  });
  const chkArmy = focusOrgCanFormalize(stArmy, 'a1');
  assert.equal(chkArmy.reason, 'need_done_units');
  assert.deepEqual(chkArmy.pending.map(function (p) { return p.id; }), ['u1']);
  assert.equal(chkArmy.pending[0].kind, 'unit');
});

test('t13 纯函数：完成/计划层判据、组合准备度、未完成清单与原因文案', () => {
  // 完成单元判据：计时结束（入流水）才算完成；完成度是自评，不入判据
  assert.equal(focusUnitDone({ endedAt: 1, completion: 0 }), true);
  assert.equal(focusUnitDone({ endedAt: 0, completion: 100 }), false);
  assert.equal(focusUnitDone(null), false);
  assert.equal(focusOrgPending({ fromPlan: true, formalized: false }), true);
  assert.equal(focusOrgPending({ fromPlan: true, formalized: true }), false);
  assert.equal(focusOrgPending({ fromPlan: false, formalized: true }), false);
  assert.equal(focusOrgPending(null), false);

  const st = focusSanitizeState({
    planMode: true,
    units: [
      { id: 'u1', typeKey: 'focus', startedAt: NOW, endedAt: NOW + 25 * MIN, seq: 1 },
      { id: 'u2', typeKey: 'focus', startedAt: NOW, endedAt: 0, seq: 2 }
    ],
    orgs: [{ id: 'g1', level: 'group', seq: 1, fromPlan: true }]
  });
  assert.equal(focusNodeDone(st, 'u1'), true);
  assert.equal(focusNodeDone(st, 'u2'), false);
  assert.equal(focusNodeDone(st, 'g1'), false, '计划层待转正 = 未完成');
  assert.equal(focusNodeDone(st, 'nope'), false);
  assert.equal(focusOrgStateLabel(focusFindOrg(st, 'g1')), '计划中');
  assert.equal(focusOrgStateLabel(null), '');
  const plain = focusSanitizeState({ orgs: [{ id: 'g2', level: 'group', seq: 1, fromPlan: false }] });
  assert.equal(focusNodeDone(plain, 'g2'), true);
  assert.equal(focusOrgStateLabel(focusFindOrg(plain, 'g2')), '已完成');

  assert.deepEqual(focusCombineReadiness(st, ['u1']),
    { ok: true, allDone: true, done: 1, total: 1, pending: [] });
  assert.deepEqual(focusCombineReadiness(st, ['u1', 'u2', 'g1']),
    { ok: false, allDone: false, done: 1, total: 3, pending: ['u2', 'g1'] });
  assert.equal(focusCombineReadiness(st, []).ok, false);
  assert.equal(focusCombineReadiness(st, []).allDone, false);
  assert.equal(focusCombineReadiness(st, ['nope']).allDone, false);

  // 未完成清单：未结束单元 + 未转正的下级节点（含标签）
  const stIn = focusSanitizeState({
    planMode: true,
    units: [{ id: 'u1', typeKey: 'focus', name: '深', startedAt: NOW, endedAt: 0, seq: 1, orgId: 'g1' }],
    orgs: [
      { id: 'c1', level: 'corps', seq: 1, fromPlan: true },
      { id: 'g1', level: 'group', seq: 1, parentId: 'c1', fromPlan: true, formalized: false }
    ]
  });
  const inc = focusIncompleteUnder(stIn, 'c1');
  assert.deepEqual(inc.map(function (p) { return p.kind + ':' + p.id; }), ['org:g1', 'unit:u1']);
  assert.ok(inc[0].label && inc[1].label);
  assert.deepEqual(focusIncompleteUnder(stIn, 'none'), []);
  assert.deepEqual(focusIncompleteUnder(null, 'c1'), []);

  // 原因文案：新增两条 + 未知原因兜底
  assert.ok(focusReasonText('member_incomplete').indexOf('成员') >= 0);
  assert.ok(focusReasonText('need_done_units').indexOf('完成') >= 0);
  assert.equal(focusReasonText('need_plan_mode'), '请先开启计划模式');
  assert.equal(focusReasonText('nope'), '操作失败');
  assert.ok(FOCUS_REASON_TEXT.member_incomplete && FOCUS_REASON_TEXT.need_done_units);
  // 转正入口文案
  assert.equal(focusFormalizeHint({ ok: false, reason: 'need_fill', need: 3, childCount: 1 }), '转正需 3 个下级（现有 1）');
  assert.equal(focusFormalizeHint({ ok: false, reason: 'need_done_units', pending: [{}, {}] }), '转正需下级全部完成（未完成 2 项）');
  assert.equal(focusFormalizeHint({ ok: true, pending: [] }), '');
  assert.equal(focusFormalizeHint(null), '');
});

test('t27 渲染端结构（源码级守卫 + 反证）：点行展开 / 折叠键 / 标签 / 模块卡 / 步长', () => {
  const srcPath = new URL('../src/focus.mjs', import.meta.url);
  const src = fs.readFileSync(srcPath, 'utf8');
  const bundle = buildProduct();
  // 判据只看代码，不看注释（注释里允许写「旧的 .focus-tree-expand 已删除」这类说明文字）
  const stripComments = (text) => String(text)
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/(^|[^:])\/\/[^\n]*/g, '$1');
  const srcCode = stripComments(src);

  // 「应消失」判据：为真即回归（每行独立详情展开键 / 旧兜底选择器 / 内联 paddingLeft）
  const bad = (text) => {
    const s = String(text);
    return {
      deadExpandKey: s.indexOf('focusTreeExpandEl') >= 0,
      deadExpandClass: /\bfocus-tree-expand\b(?![-\w])/.test(s),
      oldFoldSelector: s.indexOf("focusCssDeclared('.focus-tree-row .focus-tree-expand')") >= 0,
      rowPadLeft: /\brow\.style\.paddingLeft\b/.test(s)
    };
  };
  // 「应在场」判据：为假即缺失（行点击展开 / 折叠键 / 状态标签 / 模块卡 / 统一缩进步长）
  const good = (text) => {
    const s = String(text);
    return {
      rowToggle: s.indexOf("setAttribute('role', 'button')") >= 0 &&
        s.indexOf("setAttribute('tabindex', '0')") >= 0 &&
        s.indexOf("setAttribute('aria-expanded'") >= 0 &&
        s.indexOf("setAttribute('data-expand-toggle', 'row')") >= 0 &&
        s.indexOf('focusRowInteractive') >= 0 &&
        s.indexOf("k !== 'Enter'") >= 0 && s.indexOf("k !== ' '") >= 0,
      foldKey: s.indexOf("'focus-tree-fold focus-tree-fold-level'") >= 0 &&
        s.indexOf("setAttribute('data-collapsed'") >= 0 &&
        s.indexOf("fold.setAttribute('aria-expanded'") >= 0 &&
        s.indexOf('focusTreeFoldDefaults(fold)') >= 0,
      foldFallback: s.indexOf("focusCssDeclared('.focus-tree-row .focus-tree-fold-level')") >= 0 &&
        s.indexOf('narrow ? 40 : 28') >= 0,
      tags: s.indexOf("'focus-tree-expand-tag'") >= 0 &&
        s.indexOf("tag.setAttribute('data-kind', String(t.kind))") >= 0 &&
        s.indexOf("'focus-tree-expand-seq'") >= 0 &&
        s.indexOf("'focus-tree-expand-level'") >= 0 &&
        s.indexOf('focusExpandTagViews(info)') >= 0,
      modules: s.indexOf("'focus-tree-expand-mod focus-tree-expand-field'") >= 0 &&
        s.indexOf('focusExpandModuleViews(info)') >= 0,
      indent: s.indexOf('FOCUS_TREE_INDENT_PX') >= 0 &&
        s.indexOf("setProperty('--focus-tree-indent'") >= 0 &&
        s.indexOf("guide.setAttribute('data-chain'") >= 0 &&
        s.indexOf("row.setAttribute('data-indent'") >= 0
    };
  };

  const rb = bad(srcCode);
  Object.keys(rb).forEach(function (k) { assert.equal(rb[k], false, 'src/focus.mjs 回归：' + k); });
  const bb = bad(stripComments(bundle));
  Object.keys(bb).forEach(function (k) { assert.equal(bb[k], false, '构建产物回归：' + k); });
  const rg = good(srcCode);
  Object.keys(rg).forEach(function (k) { assert.equal(rg[k], true, 'src/focus.mjs 缺结构：' + k); });
  const bg = good(stripComments(bundle));
  Object.keys(bg).forEach(function (k) { assert.equal(bg[k], true, '构建产物缺结构：' + k); });

  // 反证一：「应消失」判据对合成回归样本必须判红
  assert.equal(bad('row.appendChild(focusTreeExpandEl(r, false));').deadExpandKey, true, '反证：详情展开键复活应判红');
  assert.equal(bad("const btn = el('button', 'focus-tree-fold focus-tree-expand');").deadExpandClass, true, '反证：旧展开键类名复活应判红');
  assert.equal(bad("if (focusCssDeclared('.focus-tree-row .focus-tree-expand')) return;").oldFoldSelector, true, '反证：旧兜底选择器应判红');
  assert.equal(bad("row.style.paddingLeft = (depth * 12) + 'px';").rowPadLeft, true, '反证：内联缩进数字应判红');

  // 反证二：「应在场」判据对「挖掉该结构」的活文件必须判红（证明判据不是恒真）
  const strip = (re) => src.replace(re, '/* t27 counter-proof removed */');
  assert.equal(good(strip(/function focusBindRowExpand\(row, r\) \{[\s\S]*?\n    \}/)).rowToggle, false, '反证：删掉行点击绑定应判红');
  assert.equal(good(strip(/const fold = el\('button', 'focus-tree-fold focus-tree-fold-level'[\s\S]*?\n        row\.appendChild\(fold\);/)).foldKey, false, '反证：删掉层级折叠键应判红');
  assert.equal(good(strip(/const tag = el\('span', 'focus-tree-expand-tag'\);/)).tags, false, '反证：删掉状态标签区应判红');
  assert.equal(good(strip(/focus-tree-expand-mod focus-tree-expand-field/)).modules, false, '反证：删掉模块卡渲染应判红');
  assert.equal(good(src.replace(/FOCUS_TREE_INDENT_PX/g, 'FOCUS_TREE_STEP_X')).indent, false, '反证：换成未导出步长常量应判红');
});

test('t27 非计划免日期组合：弹窗不渲染截止日期/最低下级数，提交不读隐藏输入（源码级守卫 + 反证）', () => {
  const src = fs.readFileSync(new URL('../src/focus.mjs', import.meta.url), 'utf8');
  const body = (src.match(/function focusOpenCombineModal\(st\) \{[\s\S]*?\n  \}/) || [''])[0];
  assert.ok(body.length > 400, '未取到 focusOpenCombineModal 函数体');

  // 两个「计划层专属」字段必须整体包在 if (!freeCombine) 分支内（按元素创建点判定，不看注释文字）
  const planFieldsGuarded = (text) => {
    const s = String(text);
    const g = s.indexOf('if (!freeCombine) {');
    const due = s.indexOf("el('div', 'muted', '截止日期（可选）')");
    const min = s.indexOf("el('div', 'muted', '可转正最低下一级任务数')");
    return g > 0 && due > g && min > g &&
      s.indexOf('let dueInp = null') > 0 && s.indexOf('let minChild = null') > 0;
  };
  // 免计划提交分支：按非计划语义传参，不读隐藏输入
  const freeSubmit = (text) => /if \(freeCombine\) \{[\s\S]*?dueAt: null, minChildCount: 1[\s\S]*?\} else \{[\s\S]*?focusPlanNodeFields/.test(String(text));
  assert.equal(planFieldsGuarded(body), true, '免计划时两个计划字段仍被无条件渲染');
  assert.equal(freeSubmit(body), true, '免计划提交分支未按非计划语义传参');
  // 反证（合成回归样本）
  assert.equal(planFieldsGuarded("card.appendChild(el('div', 'muted', '截止日期（可选）'));\n    const dueInp = el('input');\n    card.appendChild(el('div', 'muted', '可转正最低下一级任务数'));"), false, '反证：无条件渲染应判红');
  assert.equal(freeSubmit('const nf = focusPlanNodeFields({ dueAt: dueInp.value, minChildCount: minChild.value }, 1);'), false, '反证：免计划仍读隐藏输入应判红');

  // 计划模式两字段与既有校验不变；另两个创建弹窗保持可选字段不变
  assert.ok(body.indexOf("dueInp.type = 'date'") > 0, '计划模式仍要有日期输入');
  assert.ok(body.indexOf('minChild.min = String(FOCUS_MIN_CHILD_MIN)') > 0 && body.indexOf('minChild.max = String(FOCUS_MIN_CHILD_MAX)') > 0);
  const planBody = (src.match(/function focusOpenPlanTaskModal\(st\) \{[\s\S]*?\n  \}/) || [''])[0];
  const inlineBody = (src.match(/function focusOpenInlineChildModal\(parentOrg, st\) \{[\s\S]*?\n  \}/) || [''])[0];
  assert.ok(planBody.indexOf('截止日期（可选）') > 0, '「新建计划任务」应保留截止日期字段');
  assert.ok(inlineBody.indexOf('截止日期（可选）') > 0, '「添加子级」应保留截止日期字段');
});

test('t27 树杈引导：输出契约不变，缩进步长统一为常量、按层级递进', () => {
  assert.equal(FOCUS_TREE_INDENT_PX, 14, '缩进步长唯一真源');
  const rows = [{ id: 'a', depth: 0 }, { id: 'b', depth: 1 }, { id: 'c', depth: 1 }, { id: 'd', depth: 2 }];
  const gs = focusTreeGuides(rows);
  assert.equal(gs.length, 4);
  gs.forEach(function (g) {
    assert.equal(g.chars, 2 * (g.depth + 1), '每层占 2 字符 → 步长一致');
    assert.equal(g.text.length, g.chars, 'chars 必须等于实际字符数');
    assert.ok(Array.isArray(g.chain) && g.chain.length === g.depth + 1);
  });
  assert.deepEqual(gs.map(function (g) { return g.text; }), ['└─', '\u00A0 ├─', '\u00A0 └─', '\u00A0 \u00A0 └─']);
  // 末位收口 / 连续竖线：chain 位串与 data-chain 一一对应（渲染端只读，不改写字符）
  assert.deepEqual(gs.map(function (g) { return g.chain.map(function (b) { return b ? '1' : '0'; }).join(''); }),
    ['1', '00', '01', '001']);
  assert.equal(gs[3].last, true);
  assert.equal(gs[1].last, false);
  // 有后续兄弟 → 该层竖线连续（chain[d]=true），且上层不残留：末位兄弟之后的行按闭合列留白
  const gs2 = focusTreeGuides([{ id: 'a', depth: 0 }, { id: 'b', depth: 1 }, { id: 'b2', depth: 1 }, { id: 'c', depth: 0 }, { id: 'd', depth: 1 }]);
  assert.deepEqual(gs2.map(function (g) { return g.text; }), ['├─', '│ ├─', '│ └─', '└─', '\u00A0 └─']);
  assert.deepEqual(gs2.map(function (g) { return g.chain.map(function (b) { return b ? '1' : '0'; }).join(''); }),
    ['0', '10', '11', '1', '01']);
  gs2.forEach(function (g) { assert.equal(g.chars, 2 * (g.depth + 1)); });
});

test('t36 归属单一渲染点：字段行只在未编入出现、attr 行只在已编入渲染（源码级守卫 + 反证）', () => {
  const src = fs.readFileSync(new URL('../src/focus.mjs', import.meta.url), 'utf8');
  const bundle = buildProduct();
  const stripComments = (text) => String(text)
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/(^|[^:])\/\/[^\n]*/g, '$1');
  const srcCode = stripComments(src);

  // 判据一（渲染端）：attr 行的守卫条件必须显式含 attached —— 未编入不得渲染该行
  // （t25:unattached-renders-explicit-text 要求 attrLines===0；t26 F1 的另一半是它无条件渲染）
  const attrGuard = (text) => {
    const m = /if \(([^)]*)\) \{\s*\n\s*pane\.appendChild\(el\('div', 'focus-tree-expand-attr'/.exec(String(text));
    return m ? m[1].trim() : null;
  };
  // 判据二（纯函数）：单元字段行的「归属」必须挂在「未编入」条件里，已编入不得 push 该键
  // （t25:attribution-single-count / no-double-prefix 要求已编入模块卡无「归属」键）
  const unitFieldGuard = (text) => {
    const body = (String(text).match(/function focusTreeExpandFields\(state, node\) \{[\s\S]*?\n  \}/) || [''])[0];
    if (body.length < 200) return null; // 抽取失败 → 判据无效，同样不等于期望值
    const m = /if \(!\(([^)]*)\)\) \{\s*\n\s*unitFields\.push\(\['归属'/.exec(body);
    return m ? m[1].trim() : null;
  };
  // 判据三：带前缀的归属拼接全仓恰好一处（唯一渲染点）
  const prefixedPoints = (text) => (String(text).match(/'归属 ' \+/g) || []).length;

  assert.equal(attrGuard(srcCode), 'info.parent && info.parent.attached', 't36：attr 行必须挂 attached 守卫');
  assert.equal(unitFieldGuard(srcCode), 'parent && parent.attached', 't36：单元「归属」字段行必须只在未编入时 push');
  assert.equal(prefixedPoints(srcCode), 1, 't36：带前缀的「归属」拼接必须恰好一处');
  const bundleCode = stripComments(bundle);
  assert.equal(attrGuard(bundleCode), 'info.parent && info.parent.attached', 't36（产物）：attr 行必须挂 attached 守卫');
  assert.equal(unitFieldGuard(bundleCode), 'parent && parent.attached', 't36（产物）：单元「归属」字段行必须只在未编入时 push');
  assert.equal(prefixedPoints(bundleCode), 1, 't36（产物）：「归属」前缀拼接恰好一处');
  // 「归属」信息不得整体丢失：纯函数入口仍在，两条互斥分支必须都存在于源码（未编入字段行 + 已编入 attr 行）
  assert.equal((srcCode.match(/focusParentAttribution\(/g) || []).length > 0, true, 't36：归属纯函数入口不得删除');
  assert.equal(unitFieldGuard(srcCode) !== null && attrGuard(srcCode) !== null, true, 't36：两条归属渲染分支缺一不可');

  // 契约注释必须与最终实现同步（三处 t36 标记：fields 口径 + focusParentAttribution 契约 + 面板渲染点）
  assert.ok(src.indexOf('t36 口径（归属单一渲染点，两处互斥）') > 0, 't36：fields 注释未同步');
  assert.ok(src.indexOf('t36 单一渲染点') > 0, 't36：focusParentAttribution 契约注释未同步');
  assert.ok(src.indexOf('t36：已编入才渲染') > 0, 't36：面板渲染点注释未同步');

  // 反证（合成回归样本）：三条判据都必须能判红，否则等于恒真
  const synth = (mid) => 'function focusTreeExpandFields(state, node) {\n  // ' + 'x'.repeat(210) + '\n' + mid + '\n  }';
  const everPush = synth("      if (true) {\n        unitFields.push(['归属', String((parent && parent.text) || '未编入')]);\n      }");
  assert.notEqual(unitFieldGuard(everPush), 'parent && parent.attached', '反证：字段行无条件 push 应判红');
  const preFixFields = synth("      const unitFields = [\n        ['完成度', '80%'],\n        ['归属', parent ? String(parent.text || '') : '未编入']\n      ];");
  assert.equal(unitFieldGuard(preFixFields), null, '反证：t36 前的字段行写法（无 !attached 守卫）应判红');
  const unconditionalAttr = "      if (info.parent) {\n        pane.appendChild(el('div', 'focus-tree-expand-attr', '归属 ' + String(a)));\n      }";
  assert.notEqual(attrGuard(unconditionalAttr), 'info.parent && info.parent.attached', '反证：attr 行退回无条件应判红');
  assert.equal(prefixedPoints("el('div', 'focus-tree-expand-attr', '归属 ' + a);\nel('div', 'x', '归属 ' + b);"), 2, '反证：出现第二个前缀拼接应判红（计数须 ≠ 1）');
});
