import test from 'node:test';
import assert from 'node:assert/strict';
import {
  FSRS_S_MIN, fsrsInitStability, fsrsInitDifficulty, fsrsShortTermStability,
  fsrsRetention, fsrsDifficulty, fsrsLapseStability, fsrsSuccessStability, fsrsInterval
} from '../src/fsrs-core.mjs';

// sched.mjs 在浏览器里与其它模块拼接进同一 IIFE（共享 config.mjs 的 DAY/dayStart 与 fsrs-core 的函数）；
// 单测时把这两个依赖注入为全局，再动态加载被测模块。
globalThis.DAY = 86400000;
globalThis.dayStart = (ts) => { const d = new Date(ts); d.setHours(0, 0, 0, 0); return d.getTime(); };
Object.assign(globalThis, {
  fsrsInitStability, fsrsInitDifficulty, fsrsShortTermStability, fsrsRetention,
  fsrsDifficulty, fsrsLapseStability, fsrsSuccessStability, fsrsInterval
});
const { applySchedRating, markCardDueNow } = await import('../src/sched.mjs');

const MIN = 60 * 1000;
// 与 learn.mjs 的 graduateReview 等价（毕业用当前稳定度定间隔）
function graduateLikeLearn(c) {
  c.grad = 1; c.reps = 1; c.state = 'review';
  c.stab = Math.max(FSRS_S_MIN, c.stab);
  c.ivl = Math.max(1, Math.round(fsrsInterval(c.stab)));
  c.due = dayStart(Date.now()) + c.ivl * DAY;
}
// 与 learn.mjs 的 LEARN_SCHED 等价的注入参数
const learnOpts = {
  stepsLearn: [1 * MIN, 10 * MIN],
  stepsRelearn: [10 * MIN],
  lastLearnStep: 1,
  lastRelearnStep: 0,
  learningDue: (now, steps, step) => now + steps[step],
  relearnDue: (now) => now + 10 * MIN,
  graduate: graduateLikeLearn,
  reviewIvl: (c) => Math.max(1, Math.round(fsrsInterval(c.stab)))
};

function newCard(extra) { return Object.assign({ state: 'new', step: 0, reps: 0, ivl: 0, lapses: 0, grad: 0, diff: 5, stab: 0, fsrsInit: 0, due: 0, lastR: 0 }, extra || {}); }
// 浮点容差断言：被测代码与断言各自采样 Date.now()，毫秒跳变会让 daysSince 略偏，进而让 R 与稳定度
// 在 1e-10~1e-8 相对量级上抖动（实测同一算式相隔 1 毫秒：55.946136006982144 vs 55.9461360281637，
// 相对差 3.8e-10 → 严格相等会随机判红）。容差取 1e-6：只吸收计时噪声，仍能拦住真实公式回归
//（档位 / 复习起点类偏差 ≥ 3e-2；复现与标定见 backup/scratch/flake/probe-flake.mjs）。
// 口径与 tests/wrong.test.mjs 的 approx 一致。
function approx(actual, expected, msg) {
  assert.ok(Math.abs(actual - expected) <= 1e-6 * Math.max(1, Math.abs(expected)), (msg || '浮点不一致') + ': ' + actual + ' vs ' + expected);
}

test('新卡 Good：进入学习第 1 步（10 分钟后重现），初始 S/D 按档位建立', () => {
  const c = newCard();
  applySchedRating(c, 2, learnOpts);
  assert.equal(c.state, 'learning');
  assert.equal(c.step, 1); // 越过最后一步才毕业；新卡 Good 先进到最后一步
  assert.ok(Math.abs(c.due - Date.now() - 10 * MIN) < 50);
  assert.equal(c.fsrsInit, 1);
  assert.equal(c.diff, fsrsInitDifficulty(3));
  assert.equal(c.stab, fsrsInitStability(3));
});

test('新卡 Again：回第 0 步，1 分钟后重现，初始 S/D 按档位建立', () => {
  const c = newCard();
  applySchedRating(c, 0, learnOpts);
  assert.equal(c.state, 'learning');
  assert.equal(c.step, 0);
  assert.equal(c.ivl, 0);
  assert.equal(c.diff, fsrsInitDifficulty(1));
  assert.equal(c.stab, fsrsInitStability(1));
  assert.ok(Math.abs(c.due - Date.now() - 1 * MIN) < 50);
});

test('新卡 Hard：前进一步（10 分钟后重现），不毕业', () => {
  const c = newCard();
  applySchedRating(c, 1, learnOpts);
  assert.equal(c.state, 'learning');
  assert.equal(c.step, 1);
  assert.ok(Math.abs(c.due - Date.now() - 10 * MIN) < 50);
  assert.equal(c.state !== 'review', true);
});

test('学习最后一步再 Hard：停留在最后一步原地循环（固化现有设计）', () => {
  const c = newCard();
  applySchedRating(c, 1, learnOpts); // → step 1
  const stabAfterFirst = c.stab;
  applySchedRating(c, 1, learnOpts); // Hard again
  assert.equal(c.step, 1);
  assert.equal(c.state, 'learning');
  assert.ok(Math.abs(c.due - Date.now() - 10 * MIN) < 50);
  // 短时记忆稳定度：Good/Easy/Hard 不低于原值
  assert.ok(c.stab >= stabAfterFirst);
});

test('step1 + Good：毕业', () => {
  const c = newCard();
  applySchedRating(c, 1, learnOpts);
  applySchedRating(c, 2, learnOpts);
  assert.equal(c.state, 'review');
  assert.equal(c.grad, 1);
});

test('新卡 Easy：直接毕业', () => {
  const c = newCard();
  applySchedRating(c, 3, learnOpts);
  assert.equal(c.state, 'review');
  assert.equal(c.grad, 1);
  assert.equal(c.stab, fsrsInitStability(4));
});

test('复习卡 Again：进入重学、lapses+1、10 分钟后重现', () => {
  const c = newCard({ state: 'review', stab: 30, diff: 5, due: Date.now() - DAY, lastR: Date.now() - DAY, reps: 3, ivl: 30 });
  const lapsesBefore = c.lapses;
  applySchedRating(c, 0, learnOpts);
  assert.equal(c.state, 'relearning');
  assert.equal(c.step, 0);
  assert.equal(c.lapses, lapsesBefore + 1);
  assert.ok(Math.abs(c.due - Date.now() - 10 * MIN) < 50);
  assert.equal(c.diff, fsrsDifficulty(5, 1));
  const R = fsrsRetention(Math.max(0, (Date.now() - (Date.now() - DAY)) / DAY), 30);
  // 容差比较：代码内部与断言各自采样 Date.now()，毫秒跳变会让浮点差在最后几位
  approx(c.stab, fsrsLapseStability(c.diff, 30, R), '遗忘后稳定度');
});

test('复习卡 Hard/Good/Easy：保持 review，间隔按稳定度，到期按自然日对齐', () => {
  for (const rating of [1, 2, 3]) {
    const c = newCard({ state: 'review', stab: 30, diff: 5, due: Date.now() - DAY, lastR: Date.now() - DAY, reps: 3, ivl: 30 });
    applySchedRating(c, rating, learnOpts);
    assert.equal(c.state, 'review');
    assert.equal(c.reps, 4);
    assert.equal(c.ivl, Math.max(1, Math.round(fsrsInterval(c.stab))));
    // 容忍测试执行恰好跨过午夜零点（due 会多一天）
    const a = dayStart(Date.now()) + c.ivl * DAY;
    assert.ok(c.due === a || c.due === a + DAY, 'due 未按自然日对齐');
  }
});

test('重学阶段 Good：越过最后一步（0）毕业', () => {
  const c = newCard({ state: 'relearning', step: 0, stab: 5, diff: 7, fsrsInit: 1 });
  applySchedRating(c, 2, learnOpts);
  assert.equal(c.state, 'review');
  assert.equal(c.grad, 1);
});

// ---------------- 提前复习：markCardDueNow（浏览界面「立即重学」/ 自测表现差入重学队列共用） ----------------
// 语义红线：只把 due 落到此刻（纯调度字段），记忆历史一个字节都不能动。

const deepClone = (o) => JSON.parse(JSON.stringify(o));
const snapExceptDue = (c) => { const o = Object.assign({}, c); delete o.due; return JSON.stringify(o); };

test('未到期卡：markCardDueNow 立即到期，且 S/D/学习阶段/历史字段全不变', () => {
  const NOW = Date.now();
  const c = newCard({
    state: 'review', step: 0, reps: 7, ivl: 21, lapses: 2, grad: 1, diff: 6.4, stab: 42.5,
    fsrsInit: 1, due: NOW + 5 * DAY, lastR: NOW - 2 * DAY, ivlR: 21, notes: '笔记', hist: [{ t: 1, s: 2 }]
  });
  const before = deepClone(c);
  assert.equal(markCardDueNow(c, NOW), true);
  assert.equal(c.due, NOW, '应立刻到期');
  assert.equal(snapExceptDue(c), snapExceptDue(before), '除 due 外不得有任何字段变化');
  // 红线字段逐项点名（失败时能直接看出哪一项被改动）
  assert.equal(c.stab, before.stab, 'stability 不得改动');
  assert.equal(c.diff, before.diff, 'difficulty 不得改动');
  assert.equal(c.state, before.state, '学习阶段不得改动');
  assert.equal(c.step, before.step);
  assert.equal(c.grad, before.grad);
  assert.equal(c.reps, before.reps);
  assert.equal(c.lapses, before.lapses);
  assert.equal(c.ivl, before.ivl);
  assert.equal(c.lastR, before.lastR);
  assert.equal(c.ivlR, before.ivlR);
  assert.equal(c.fsrsInit, before.fsrsInit);
  assert.deepEqual(c.hist, before.hist);
});

test('学习/重学阶段的未到期卡：同样只提前 due，阶段与步号保持原样', () => {
  const NOW = Date.now();
  for (const state of ['learning', 'relearning']) {
    const c = newCard({ state: state, step: 1, reps: 0, ivl: 0, grad: 0, diff: 5, stab: 3, due: NOW + 10 * MIN, lastR: NOW - MIN });
    const before = deepClone(c);
    assert.equal(markCardDueNow(c, NOW), true);
    assert.equal(c.due, NOW);
    assert.equal(c.state, state, '阶段不得被改写');
    assert.equal(c.step, before.step, '步号不得被改写');
    assert.equal(snapExceptDue(c), snapExceptDue(before));
  }
});

test('已到期卡：markCardDueNow 幂等（返回 false，一个字段都不写）', () => {
  const NOW = Date.now();
  for (const due of [NOW - DAY, NOW]) {
    const c = newCard({ state: 'review', reps: 3, ivl: 10, diff: 6, stab: 40, due: due, lastR: NOW - 2 * DAY });
    const before = JSON.stringify(c);
    assert.equal(markCardDueNow(c, NOW), false, '已到期不应报告改动');
    assert.equal(markCardDueNow(c, NOW), false, '重复调用仍应幂等');
    assert.equal(JSON.stringify(c), before, '幂等分支不得写任何字段');
  }
});

test('提前到期后再调用：幂等（第二次返回 false，due 不再漂移）', () => {
  const NOW = Date.now();
  const c = newCard({ state: 'review', stab: 20, diff: 5, due: NOW + 3 * DAY, lastR: NOW - DAY });
  assert.equal(markCardDueNow(c, NOW), true);
  assert.equal(c.due, NOW);
  assert.equal(markCardDueNow(c, NOW + 60000), false);
  assert.equal(c.due, NOW, 'due 不得被后续调用改写');
});

test('新卡与损坏排期：不猜不改（返回 false 且无异常）', () => {
  const NOW = Date.now();
  const fresh = newCard(); // state 'new', due 0：由新学队列引入，不走提前复习
  const freshBefore = JSON.stringify(fresh);
  assert.equal(markCardDueNow(fresh, NOW), false);
  assert.equal(JSON.stringify(fresh), freshBefore);

  assert.equal(markCardDueNow(null, NOW), false);
  assert.equal(markCardDueNow(undefined), false);
  assert.equal(markCardDueNow('card', NOW), false);

  const nanDue = newCard({ state: 'review', due: NaN });
  const nanBefore = JSON.stringify(nanDue);
  assert.equal(markCardDueNow(nanDue, NOW), false, 'NaN 排期不猜测');
  assert.equal(JSON.stringify(nanDue), nanBefore);

  const noDue = newCard({ state: 'review' });
  delete noDue.due;
  assert.equal(markCardDueNow(noDue, NOW), false);
  assert.equal('due' in noDue, false, '缺 due 时不得凭空写入');

  // 省略 now：回退到 Date.now()，仍能提前到期
  const soon = newCard({ state: 'review', stab: 10, diff: 5, due: Date.now() + 5 * DAY, lastR: Date.now() - DAY });
  assert.equal(markCardDueNow(soon), true);
  assert.ok(soon.due <= Date.now());
});

test('提前到期不写评分日志：revlog 与卡片日志字段均不变，且不调用 pushRevlog', () => {
  const NOW = Date.now();
  const revlogs = [{ t: 1, cid: 'a', r: 3, st: 2, ivl: 10, k: 'k' }];
  const revlogBefore = JSON.stringify(revlogs);
  let pushCalls = 0;
  globalThis.DB = { log: { revlogs: revlogs } };
  globalThis.pushRevlog = function () { pushCalls++; };
  try {
    const c = newCard({
      state: 'review', reps: 4, ivl: 30, diff: 5, stab: 30, due: NOW + 3 * DAY,
      lastR: NOW - DAY, revlog: [{ t: 0, r: 4 }]
    });
    const cardLogBefore = JSON.stringify(c.revlog);
    assert.equal(markCardDueNow(c, NOW), true);
    assert.equal(revlogs.length, 1, '本次点击不是一次复习记录');
    assert.equal(JSON.stringify(revlogs), revlogBefore);
    assert.equal(pushCalls, 0, '不得调用 pushRevlog');
    assert.equal(JSON.stringify(c.revlog), cardLogBefore);
  } finally {
    delete globalThis.DB;
    delete globalThis.pushRevlog;
  }
});

test('提前到期后仍由既有 FSRS 算法算间隔：更新只依赖历史 S/D 与本次评分', () => {
  const lastR = Date.now() - 12 * DAY;
  const base = {
    state: 'review', step: 0, reps: 4, ivl: 30, lapses: 1, grad: 1,
    diff: 5.2, stab: 30, fsrsInit: 1, lastR: lastR, due: Date.now() + 8 * DAY
  };
  const early = newCard(base);   // 先「立即重学」再评分
  const normal = newCard(base);  // 不动 due 直接评分（对照）
  assert.equal(markCardDueNow(early, Date.now()), true);
  const stabBefore = early.stab;
  applySchedRating(early, 2, learnOpts);
  applySchedRating(normal, 2, learnOpts);
  // 保留率按 lastR（真实复习历史）算：提前到期不改变本次评估的遗忘程度
  // 容差比较：两次 applySchedRating 各自采样 Date.now()，1 毫秒的采样差就能让 S 在浮点末位分叉
  //（实测 55.946136006982144 vs 55.9461360281637，相对差 3.8e-10），故不再用严格相等。
  approx(early.stab, normal.stab, 'S 更新应与未提前到期的对照完全一致');
  approx(early.diff, normal.diff, 'D 更新应与对照完全一致');
  const R = fsrsRetention(Math.max(0, (Date.now() - lastR) / DAY), base.stab);
  const expectedDiff = fsrsDifficulty(base.diff, 3);
  const expectedStab = fsrsSuccessStability(expectedDiff, base.stab, R, 3);
  // D 只由历史 D 与本次评分产出（与时间无关的纯函数，两次调用逐位相同）→ 保留更紧的比较
  assert.ok(Math.abs(early.diff - expectedDiff) < 1e-9, 'D 由历史 D 与本次评分产出');
  approx(early.stab, expectedStab, 'S 由历史 S 与保留率产出');
  // 历史没有被重置：起点仍是原来的 S/D，且间隔由既有算法给出
  assert.equal(early.state, 'review');
  assert.equal(early.reps, base.reps + 1);
  assert.equal(early.lastR, lastR, 'lastR 由评分流程维护，提前到期不得改写');
  assert.equal(early.ivl, Math.max(1, Math.round(fsrsInterval(early.stab))));
  assert.notEqual(early.stab, fsrsInitStability(3), 'S 不得被重置为初始稳定度');
  assert.ok(stabBefore > 0);
});
