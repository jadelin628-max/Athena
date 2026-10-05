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
  focusPlanSettle
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

test('番号独立流水不回收', () => {
  let st = focusSetPlanMode(focusDefaultState(), true).state;
  let r = focusCreateOrg(st, { level: 'group' }, NOW);
  assert.equal(focusOrgLabel(r.org, st.settings).indexOf('●1'), 0);
  st = r.state;
  r = focusCreateOrg(st, { level: 'corps' }, NOW);
  assert.equal(focusOrgLabel(r.org, st.settings).indexOf('▲1'), 0);
  st = r.state;
  r = focusCreateOrg(st, { level: 'group' }, NOW);
  assert.equal(r.org.seq, 2);
  st = r.state;
  st = focusDeleteOrg(st, st.orgs[0].id, NOW).state;
  r = focusCreateOrg(st, { level: 'group' }, NOW);
  assert.equal(r.org.seq, 3);
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
