import test from 'node:test';
import assert from 'node:assert/strict';
import {
  MILE_KEY,
  MILE_KINDS,
  MILESTONE_DEFS,
  mileYmd,
  mileAddDays,
  mileDayDiff,
  mileConsecutiveStreak,
  evaluateMilestones,
  mileRecordNew,
  mileFindDef,
  mileNormalize,
  mileNormalizeHit,
  mileGroupStableDays,
  mileEmptySnapshot,
  mileFmtTime
} from '../src/mile.mjs';

function snap(over) {
  const base = mileEmptySnapshot();
  if (over && over.habit) Object.assign(base.habit, over.habit);
  if (over && over.focus) Object.assign(base.focus, over.focus);
  if (over && over.learn) Object.assign(base.learn, over.learn);
  return base;
}

function fullSnap() {
  return snap({
    habit: {
      maxInternalize: 100, fullInternalize: 3, midInternalize: 3, settleStreak: 30, groupStableDays: 14,
      treeCount: 10, libraryCount: 10, maxLevel: 5, maxDoneCount: 100, totalDone: 100, tagCount: 5, oldestTreeDays: 30
    },
    focus: {
      mainWorkCount: 50, successionCount: 1, maxDailyMinutes: 240, totalUnits: 100, totalMinutes: 3600,
      precedents: 5, scoutPromoted: 1, perfectUnits: 10, typeCount: 4, focusStreak: 7
    },
    learn: {
      anyCleared: true, reviewStreak: 30, totalReviews: 1000, subjectsStarted: 5, subjectsCleared: 3,
      maxDailyReviews: 50, maxDailyStudyMin: 60, allClearToday: true
    }
  });
}

// ---------------- 日期工具 ----------------

test('mileYmd / mileAddDays / mileDayDiff 基本口径', () => {
  assert.equal(mileYmd(new Date(2026, 2, 5)), '2026-03-05');
  assert.equal(mileAddDays('2026-03-05', 1), '2026-03-06');
  assert.equal(mileAddDays('2026-03-01', -1), '2026-02-28');
  assert.equal(mileAddDays('2026-03-01', 0), '2026-03-01');
  assert.equal(mileDayDiff('2026-03-01', '2026-03-08'), 7);
  assert.equal(mileDayDiff('2026-03-08', '2026-03-01'), -7);
  assert.ok(Number.isNaN(mileDayDiff('bad', '2026-03-01')));
});

test('mileConsecutiveStreak：连击从今天或昨天起算', () => {
  const days = ['2026-03-01', '2026-03-02', '2026-03-03', '2026-03-05', '2026-03-06'];
  assert.equal(mileConsecutiveStreak(days, '2026-03-06'), 2);
  assert.equal(mileConsecutiveStreak(days, '2026-03-07'), 2);
  assert.equal(mileConsecutiveStreak(days, '2026-03-04'), 3);
  assert.equal(mileConsecutiveStreak(days, '2026-03-10'), 0);
  assert.equal(mileConsecutiveStreak([], '2026-03-06'), 0);
});

test('mileConsecutiveStreak 接受对象 map', () => {
  assert.equal(mileConsecutiveStreak({ '2026-03-05': 3, '2026-03-06': 1 }, '2026-03-06'), 2);
  assert.equal(mileConsecutiveStreak({ '2026-03-05': 0 }, '2026-03-06'), 0);
});

// ---------------- 规则边界（原首批 9 条） ----------------

test('习惯：内化 100% 边界', () => {
  // 49 → 无；99 → 仅半自动化；100 → 定式已成
  assert.deepEqual(evaluateMilestones(snap({ habit: { maxInternalize: 49 } })), []);
  const mid = evaluateMilestones(snap({ habit: { maxInternalize: 99 } }));
  assert.deepEqual(mid, ['mile_habit_mid']);
  const met = evaluateMilestones(snap({ habit: { maxInternalize: 100, fullInternalize: 1 } }));
  assert.ok(met.includes('mile_habit_full'));
  assert.ok(met.includes('mile_habit_mid'));
  assert.ok(!met.includes('mile_habit_settle7'));
});

test('习惯：连续 7 日结算边界', () => {
  assert.ok(!evaluateMilestones(snap({ habit: { settleStreak: 6 } })).includes('mile_habit_settle7'));
  assert.ok(evaluateMilestones(snap({ habit: { settleStreak: 7 } })).includes('mile_habit_settle7'));
  assert.ok(evaluateMilestones(snap({ habit: { settleStreak: 12 } })).includes('mile_habit_settle7'));
});

test('习惯：组 14 日稳定边界', () => {
  assert.ok(!evaluateMilestones(snap({ habit: { groupStableDays: 13 } })).includes('mile_habit_group14'));
  assert.ok(evaluateMilestones(snap({ habit: { groupStableDays: 14 } })).includes('mile_habit_group14'));
});

test('专注：主链 #10 / #50 边界', () => {
  let met = evaluateMilestones(snap({ focus: { mainWorkCount: 9, successionCount: 0, maxDailyMinutes: 0 } }));
  assert.ok(!met.includes('mile_focus_10'));
  met = evaluateMilestones(snap({ focus: { mainWorkCount: 10, successionCount: 0, maxDailyMinutes: 0 } }));
  assert.ok(met.includes('mile_focus_10'));
  assert.ok(!met.includes('mile_focus_50'));
  met = evaluateMilestones(snap({ focus: { mainWorkCount: 50, successionCount: 0, maxDailyMinutes: 0 } }));
  assert.ok(met.includes('mile_focus_10'));
  assert.ok(met.includes('mile_focus_50'));
});

test('专注：继位 1 次 / 日 120 分边界', () => {
  assert.ok(!evaluateMilestones(snap({ focus: { successionCount: 0 } })).includes('mile_focus_succession'));
  assert.ok(evaluateMilestones(snap({ focus: { successionCount: 1 } })).includes('mile_focus_succession'));
  assert.ok(!evaluateMilestones(snap({ focus: { maxDailyMinutes: 119 } })).includes('mile_focus_day120'));
  assert.ok(evaluateMilestones(snap({ focus: { maxDailyMinutes: 120 } })).includes('mile_focus_day120'));
});

test('学习：清空到期 / 连 7 日复习', () => {
  assert.ok(!evaluateMilestones(snap({ learn: { anyCleared: false, reviewStreak: 7 } })).includes('mile_learn_clear'));
  assert.ok(evaluateMilestones(snap({ learn: { anyCleared: true, reviewStreak: 0 } })).includes('mile_learn_clear'));
  assert.ok(!evaluateMilestones(snap({ learn: { reviewStreak: 6 } })).includes('mile_learn_streak7'));
  assert.ok(evaluateMilestones(snap({ learn: { reviewStreak: 7 } })).includes('mile_learn_streak7'));
});

// ---------------- 规则边界（T37b 扩展） ----------------

test('习惯扩展：入树/内化半百/强化/打卡/库龄', () => {
  assert.ok(!evaluateMilestones(snap({ habit: { treeCount: 0 } })).includes('mile_habit_first'));
  assert.ok(evaluateMilestones(snap({ habit: { treeCount: 1 } })).includes('mile_habit_first'));
  assert.ok(evaluateMilestones(snap({ habit: { treeCount: 5 } })).includes('mile_habit_tree5'));
  assert.ok(evaluateMilestones(snap({ habit: { treeCount: 10 } })).includes('mile_habit_tree10'));
  assert.ok(evaluateMilestones(snap({ habit: { maxInternalize: 50 } })).includes('mile_habit_mid'));
  assert.ok(!evaluateMilestones(snap({ habit: { fullInternalize: 2 } })).includes('mile_habit_full3'));
  assert.ok(evaluateMilestones(snap({ habit: { fullInternalize: 3 } })).includes('mile_habit_full3'));
  assert.ok(evaluateMilestones(snap({ habit: { maxLevel: 2 } })).includes('mile_habit_level2'));
  assert.ok(evaluateMilestones(snap({ habit: { maxLevel: 5 } })).includes('mile_habit_level5'));
  assert.ok(!evaluateMilestones(snap({ habit: { maxDoneCount: 49 } })).includes('mile_habit_done50'));
  assert.ok(evaluateMilestones(snap({ habit: { maxDoneCount: 50 } })).includes('mile_habit_done50'));
  assert.ok(evaluateMilestones(snap({ habit: { maxDoneCount: 100 } })).includes('mile_habit_done100'));
  assert.ok(evaluateMilestones(snap({ habit: { libraryCount: 10 } })).includes('mile_habit_lib10'));
  assert.ok(evaluateMilestones(snap({ habit: { tagCount: 5 } })).includes('mile_habit_tags5'));
  assert.ok(evaluateMilestones(snap({ habit: { oldestTreeDays: 30 } })).includes('mile_habit_oldest30'));
  assert.ok(evaluateMilestones(snap({ habit: { settleStreak: 14 } })).includes('mile_habit_settle14'));
  assert.ok(evaluateMilestones(snap({ habit: { settleStreak: 30 } })).includes('mile_habit_settle30'));
});

test('专注扩展：单元量/总时长/判例/侦查/类型/连坐', () => {
  assert.ok(evaluateMilestones(snap({ focus: { totalUnits: 1 } })).includes('mile_focus_first'));
  assert.ok(evaluateMilestones(snap({ focus: { totalUnits: 10 } })).includes('mile_focus_units10'));
  assert.ok(evaluateMilestones(snap({ focus: { totalUnits: 50 } })).includes('mile_focus_units50'));
  assert.ok(evaluateMilestones(snap({ focus: { totalUnits: 100 } })).includes('mile_focus_units100'));
  assert.ok(!evaluateMilestones(snap({ focus: { totalMinutes: 1199 } })).includes('mile_focus_total20h'));
  assert.ok(evaluateMilestones(snap({ focus: { totalMinutes: 1200 } })).includes('mile_focus_total20h'));
  assert.ok(evaluateMilestones(snap({ focus: { totalMinutes: 3600 } })).includes('mile_focus_total60h'));
  assert.ok(evaluateMilestones(snap({ focus: { maxDailyMinutes: 60 } })).includes('mile_focus_day60'));
  assert.ok(evaluateMilestones(snap({ focus: { maxDailyMinutes: 240 } })).includes('mile_focus_day240'));
  assert.ok(evaluateMilestones(snap({ focus: { precedents: 1 } })).includes('mile_focus_prec1'));
  assert.ok(evaluateMilestones(snap({ focus: { precedents: 5 } })).includes('mile_focus_prec5'));
  assert.ok(evaluateMilestones(snap({ focus: { scoutPromoted: 1 } })).includes('mile_focus_scout1'));
  assert.ok(evaluateMilestones(snap({ focus: { perfectUnits: 10 } })).includes('mile_focus_perfect10'));
  assert.ok(!evaluateMilestones(snap({ focus: { typeCount: 3 } })).includes('mile_focus_types4'));
  assert.ok(evaluateMilestones(snap({ focus: { typeCount: 4 } })).includes('mile_focus_types4'));
  assert.ok(evaluateMilestones(snap({ focus: { focusStreak: 7 } })).includes('mile_focus_streak7'));
});

test('学习扩展：回忆量/多科/单日爆发/全库清空', () => {
  assert.ok(evaluateMilestones(snap({ learn: { totalReviews: 1 } })).includes('mile_learn_first'));
  assert.ok(evaluateMilestones(snap({ learn: { totalReviews: 100 } })).includes('mile_learn_reviews100'));
  assert.ok(evaluateMilestones(snap({ learn: { totalReviews: 500 } })).includes('mile_learn_reviews500'));
  assert.ok(evaluateMilestones(snap({ learn: { totalReviews: 1000 } })).includes('mile_learn_reviews1000'));
  assert.ok(evaluateMilestones(snap({ learn: { subjectsStarted: 3 } })).includes('mile_learn_subjects3'));
  assert.ok(evaluateMilestones(snap({ learn: { subjectsStarted: 5 } })).includes('mile_learn_subjects5'));
  assert.ok(evaluateMilestones(snap({ learn: { maxDailyReviews: 30 } })).includes('mile_learn_day30'));
  assert.ok(evaluateMilestones(snap({ learn: { maxDailyReviews: 50 } })).includes('mile_learn_day50'));
  assert.ok(evaluateMilestones(snap({ learn: { subjectsCleared: 3 } })).includes('mile_learn_clear3'));
  assert.ok(evaluateMilestones(snap({ learn: { maxDailyStudyMin: 60 } })).includes('mile_learn_study60'));
  assert.ok(evaluateMilestones(snap({ learn: { allClearToday: true } })).includes('mile_learn_allclear'));
  assert.ok(evaluateMilestones(snap({ learn: { reviewStreak: 14 } })).includes('mile_learn_streak14'));
  assert.ok(evaluateMilestones(snap({ learn: { reviewStreak: 30 } })).includes('mile_learn_streak30'));
});

test('evaluateMilestones：空快照与缺失字段不抛错、不误触', () => {
  assert.deepEqual(evaluateMilestones({}), []);
  assert.deepEqual(evaluateMilestones(null), []);
  assert.deepEqual(evaluateMilestones(undefined), []);
});

test('evaluateMilestones：满条件一次返回全部 50 条', () => {
  const met = evaluateMilestones(fullSnap());
  assert.equal(met.length, MILESTONE_DEFS.length);
  assert.equal(MILESTONE_DEFS.length, 50);
  assert.equal(MILE_KINDS.length, 3);
  // 三类都有
  const kinds = {};
  MILESTONE_DEFS.forEach(function (d) { kinds[d.kind] = (kinds[d.kind] || 0) + 1; });
  assert.ok(kinds.habit >= 17);
  assert.ok(kinds.focus >= 18);
  assert.ok(kinds.learn >= 15);
});

// ---------------- Hit 记录（纯函数） ----------------

test('mileRecordNew：幂等，不重复记同一 defId', () => {
  const t = 1770000000000;
  const r1 = mileRecordNew([], ['mile_habit_full', 'mile_focus_10'], t);
  assert.equal(r1.created.length, 2);
  assert.equal(r1.hits.length, 2);
  assert.equal(r1.hits[0].defId, 'mile_habit_full');
  assert.ok(r1.hits[0].id && r1.hits[0].at === t);

  const r2 = mileRecordNew(r1.hits, ['mile_habit_full', 'mile_focus_10', 'mile_learn_clear'], t + 1000);
  assert.equal(r2.created.length, 1);
  assert.equal(r2.created[0].defId, 'mile_learn_clear');
  assert.equal(r2.hits.length, 3);
});

test('mileRecordNew：忽略未知 defId', () => {
  const r = mileRecordNew([], ['no_such', 'mile_habit_full'], 1);
  assert.equal(r.created.length, 1);
  assert.equal(r.hits.length, 1);
});

// ---------------- 存储归一化 ----------------

test('mileNormalize：去重、排序、丢弃未知/坏 Hit', () => {
  const st = mileNormalize({
    hits: [
      { id: 'b', defId: 'mile_focus_10', at: 200, note: 'x' },
      { id: 'a', defId: 'mile_habit_full', at: 100 },
      { defId: 'mile_habit_full', at: 300 },
      { defId: 'ghost', at: 50 },
      { defId: 'mile_learn_clear' },
      null
    ]
  });
  assert.equal(st.hits.length, 2);
  assert.equal(st.hits[0].defId, 'mile_habit_full');
  assert.equal(st.hits[1].defId, 'mile_focus_10');
  assert.equal(st.hits[1].note, 'x');
});

test('mileNormalizeHit：合法 Hit 保留 note', () => {
  const h = mileNormalizeHit({ defId: 'mile_learn_streak7', at: 9, note: '备注' });
  assert.equal(h.defId, 'mile_learn_streak7');
  assert.equal(h.note, '备注');
  assert.equal(mileNormalizeHit({ defId: 'x', at: 1 }), null);
  assert.equal(mileNormalizeHit(null), null);
});

test('MILE_KEY 与 Def 结构契约', () => {
  assert.equal(MILE_KEY, 'athena_mile_v1');
  MILESTONE_DEFS.forEach(function (d) {
    assert.ok(d.id && d.title && d.kind && typeof d.rule === 'function');
    assert.ok(d.hint && d.meaning && d.go);
    assert.ok(MILE_KINDS.indexOf(d.kind) >= 0);
    assert.ok(['actHabit', 'actFocus', 'learn'].indexOf(d.go) >= 0);
    assert.ok(d.meaning.indexOf('这说明') === 0, 'meaning 须以「这说明」开头：' + d.id);
    // 风味名：非空、不是旧版干名（长度 ≥2，避免单字占位）
    assert.ok(d.title.length >= 2, 'title 须是风味名：' + d.id);
  });
});

// ---------------- 组稳定龄（简化） ----------------

test('mileGroupStableDays：全员 level≥1 才计龄', () => {
  const today = '2026-03-20';
  const nodes = [
    { id: 'a', onTree: true, tag: '运动', level: 1, addedOn: '2026-03-01' },
    { id: 'b', onTree: true, tag: '运动', level: 2, addedOn: '2026-03-05' }
  ];
  assert.equal(mileGroupStableDays(nodes, today), 19);
  nodes[1].level = 0;
  assert.equal(mileGroupStableDays(nodes, today), 0);
  assert.equal(mileGroupStableDays([{ id: 'c', onTree: false, tag: 'x', level: 1, addedOn: '2026-01-01' }], today), 0);
});

test('mileFmtTime：有时间戳时可读', () => {
  const s = mileFmtTime(new Date(2026, 2, 5, 9, 8).getTime());
  assert.match(s, /^2026-03-05 \d{2}:\d{2}$/);
  assert.equal(mileFmtTime(0), '');
});

test('mileFindDef：50 条唯一 id，原首批 9 条兼容保留', () => {
  const ids = MILESTONE_DEFS.map(function (d) { return d.id; });
  assert.equal(ids.length, 50);
  assert.equal(new Set(ids).size, 50, 'id 必须唯一');
  [
    'mile_habit_full', 'mile_habit_settle7', 'mile_habit_group14',
    'mile_focus_10', 'mile_focus_50', 'mile_focus_succession', 'mile_focus_day120',
    'mile_learn_clear', 'mile_learn_streak7'
  ].forEach(function (id) {
    assert.ok(mileFindDef(id), '原 id 必须保留：' + id);
  });
  ids.forEach(function (id) {
    assert.ok(mileFindDef(id));
  });
  assert.equal(mileFindDef('nope'), null);
});

test('风味名唯一且原 9 条已换名', () => {
  const titles = MILESTONE_DEFS.map(function (d) { return d.title; });
  assert.equal(new Set(titles).size, titles.length, 'title 必须唯一');
  const byId = {};
  MILESTONE_DEFS.forEach(function (d) { byId[d.id] = d.title; });
  assert.equal(byId.mile_habit_full, '定式已成');
  assert.equal(byId.mile_focus_50, '深度工作');
  assert.equal(byId.mile_learn_day50, '肝帝觉醒');
  assert.equal(byId.mile_learn_allclear, '今日功成');
});
