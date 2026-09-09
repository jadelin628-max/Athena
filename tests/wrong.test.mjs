import test from 'node:test';
import assert from 'node:assert/strict';
import {
  fsrsInitDifficulty, fsrsInitStability, fsrsRetention,
  fsrsDifficulty, fsrsLapseStability, fsrsSuccessStability, fsrsInterval
} from '../src/fsrs-core.mjs';

// wrong.mjs 在浏览器里与其它模块拼接进同一 IIFE（共享 config.mjs 的 DAY/dayStart 与 fsrs-core 的函数）；
// 单测时把这两个依赖注入为全局，再动态加载被测模块。
globalThis.DAY = 86400000;
globalThis.dayStart = (ts) => { const d = new Date(ts); d.setHours(0, 0, 0, 0); return d.getTime(); };
Object.assign(globalThis, {
  fsrsInitDifficulty, fsrsInitStability, fsrsRetention,
  fsrsDifficulty, fsrsLapseStability, fsrsSuccessStability, fsrsInterval
});
const { initWrongAsLapsed, applyRatingToWrongCard } = await import('../src/wrong.mjs');

const DAY = 86400000;
function newWrong(extra) { return Object.assign({ state: 'new', step: 0, reps: 0, ivl: 0, lapses: 0, grad: 0, diff: 5, stab: 0, fsrsInit: 0, due: 0, lastR: 0 }, extra || {}); }
// 浮点容差断言：期望值与实际值用不同时刻的 Date.now() 采样，毫秒跳变会让浮点差在最后几位
function approx(actual, expected, msg) {
  assert.ok(Math.abs(actual - expected) <= 1e-9 * Math.max(1, Math.abs(expected)), (msg || '浮点不一致') + ': ' + actual + ' vs ' + expected);
}
// 自然日对齐断言：容忍测试执行恰好跨过午夜零点（due 会多一天）
function assertTomorrow(actual) {
  const a = dayStart(Date.now()) + DAY;
  assert.ok(actual === a || actual === a + DAY, 'due 未对齐明日自然日: ' + actual);
}

test('添加即视为当天已忘记：直接进入复习队列，次日重现，lapses=1', () => {
  const c = newWrong();
  initWrongAsLapsed(c);
  assert.equal(c.state, 'review'); // 无学习/重学步进
  assert.equal(c.lapses, 1);
  assert.equal(c.diff, fsrsInitDifficulty(1));
  assert.equal(c.stab, fsrsInitStability(1));
  assert.equal(c.fsrsInit, 1);
  assert.equal(c.ivl, 1);
  assert.equal(c.due, dayStart(Date.now()) + DAY);
});

test('评「不会」：遗忘更新后仍为复习态，次日重现', () => {
  const c = newWrong();
  initWrongAsLapsed(c);
  const lastR = Date.now() - DAY;
  c.lastR = lastR; c.due = dayStart(lastR) + DAY; // 昨天评过一次，今天到期
  const lapsesBefore = c.lapses;
  const R = fsrsRetention(Math.max(0, (Date.now() - lastR) / DAY), c.stab);
  applyRatingToWrongCard(c, 0);
  assert.equal(c.state, 'review');
  assert.equal(c.lapses, lapsesBefore + 1);
  assert.equal(c.diff, fsrsDifficulty(fsrsInitDifficulty(1), 1));
  approx(c.stab, fsrsLapseStability(c.diff, fsrsInitStability(1), R), '遗忘后稳定度');
  assert.equal(c.ivl, 1);
  assertTomorrow(c.due);
});

test('评「思路错/算错/会做对」：标准 FSRS 成功更新，间隔按稳定度计算并自然延长', () => {
  for (const rating of [1, 2, 3]) {
    const c = newWrong();
    initWrongAsLapsed(c);
    const lastR = Date.now() - DAY;
    c.lastR = lastR; c.due = dayStart(lastR) + DAY;
    const R = fsrsRetention(1, c.stab);
    const newD = fsrsDifficulty(fsrsInitDifficulty(1), rating + 1); // 难度先更新，稳定度用新难度
    applyRatingToWrongCard(c, rating);
    assert.equal(c.state, 'review');
    assert.equal(c.reps, 1);
    assert.equal(c.diff, newD);
    assert.equal(c.ivl, Math.max(1, Math.round(fsrsInterval(c.stab))));
    approx(c.stab, fsrsSuccessStability(newD, fsrsInitStability(1), R, rating + 1), '成功稳定度');
    assert.ok(c.due === dayStart(Date.now()) + c.ivl * DAY || c.due === dayStart(Date.now()) + (c.ivl + 1) * DAY, 'due 未按自然日对齐');
  }
});

test('连做间隔大幅延长、永不消失：间隔到期后再做对，间隔延长且卡片仍在队列', () => {
  const c = newWrong();
  initWrongAsLapsed(c);
  c.lastR = Date.now() - DAY; c.due = dayStart(Date.now() - DAY) + DAY;
  applyRatingToWrongCard(c, 3); // 会做对
  const ivl1 = c.ivl;
  assert.ok(ivl1 >= 1);
  // 间隔到期后（daysSince = ivl1）再做一次：R<1 → 稳定度增长 → 间隔延长
  c.lastR = Date.now() - ivl1 * DAY;
  c.due = dayStart(c.lastR) + ivl1 * DAY;
  applyRatingToWrongCard(c, 3);
  assert.equal(c.state, 'review');
  assert.ok(c.ivl > ivl1, `间隔应延长: ${ivl1} -> ${c.ivl}`);
  assert.ok(c.stab >= 0.001); // 卡片仍在（无退出机制）
});
