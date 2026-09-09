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
const { applySchedRating } = await import('../src/sched.mjs');

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
  assert.ok(Math.abs(c.stab - fsrsLapseStability(c.diff, 30, R)) <= 1e-9 * Math.max(1, c.stab), '遗忘后稳定度');
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
