import test from 'node:test';
import assert from 'node:assert/strict';
import {
  FSRS_S_MIN, fsrsRetention, fsrsDifficulty, fsrsSuccessStability, fsrsInterval, fsrsInitStability
} from '../src/fsrs-core.mjs';

// stats.mjs 的预测函数在浏览器里与其它模块同闭包（共享 config 的 DAY/dayStart、fsrs-core 函数与
// DATA/card/DB 全局）。单测注入这些全局后动态加载。
globalThis.DAY = 86400000;
globalThis.dayStart = (ts) => { const d = new Date(ts); d.setHours(0, 0, 0, 0); return d.getTime(); };
Object.assign(globalThis, {
  fsrsRetention, fsrsDifficulty, fsrsSuccessStability, fsrsInterval, fsrsInitStability,
  TARGET_CONFIDENCE: 0.9, GOAL_DEFAULT: '考研'
});
const DB = { cards: {}, wrongs: {} };
globalThis.DB = DB;
globalThis.DATA = [];
globalThis.card = (id) => DB.cards[id];
globalThis.countdownDays = () => 100;
globalThis.goalTitle = () => '考研';
globalThis.stats = () => ({ total: 0 });
globalThis.stateCounts = () => ({ fresh: 0 });
globalThis.svgEl = () => ({});
globalThis.svgText = () => ({});

const { dueForecast, simulateExamRetention, examOutlook } = await import('../src/stats.mjs');

function reviewCard(dueOffsetDays, stab) {
  return { state: 'review', due: dayStart(Date.now()) + dueOffsetDays * DAY, stab: stab || 30, diff: 5, lastR: Date.now() - 3 * DAY };
}

test('dueForecast：到期日正确分桶，逾期计入今天，更远计入 beyond，学习/新卡不计入', () => {
  DB.cards = {
    today: reviewCard(0),        // 今天到期
    overdue: Object.assign(reviewCard(-2)), // 逾期 → 计入今天
    in3: reviewCard(3),
    in13: reviewCard(13),
    in40: reviewCard(40),        // 超出窗口
    learning: { state: 'learning', due: Date.now() + 5 * 60000, stab: 1 }, // 不计入
    newCard: { state: 'new', due: 0, stab: 0 }
  };
  DB.cards.overdue.due = dayStart(Date.now()) - 2 * DAY;
  DATA.push({ id: 'today' }, { id: 'overdue' }, { id: 'in3' }, { id: 'in13' }, { id: 'in40' }, { id: 'learning' }, { id: 'newCard' });
  const fc = dueForecast(14);
  assert.equal(fc.buckets[0], 2);   // 今天 + 逾期
  assert.equal(fc.buckets[3], 1);
  assert.equal(fc.buckets[13], 1);
  assert.equal(fc.beyond, 1);
});

test('simulateExamRetention：稳定度越高考试日 R 越高；随复习次数递增趋近高保持', () => {
  const weak = reviewCard(1, 2);   // 低稳定度
  const strong = reviewCard(1, 60); // 高稳定度
  const rWeak = simulateExamRetention(weak, 90);
  const rStrong = simulateExamRetention(strong, 90);
  assert.ok(rStrong > rWeak, '高稳定度应预测更高保持率: ' + rStrong + ' vs ' + rWeak);
  assert.ok(rWeak > 0 && rWeak <= 1);
  assert.ok(rStrong > 0 && rStrong <= 1);
});

test('examOutlook：无考试日期返回 null；有日期时比例在 0-100 之间', () => {
  DB.cards = { a: reviewCard(1, 60), b: reviewCard(2, 5) };
  DB.wrongs = {};
  DATA.length = 0;
  DATA.push({ id: 'a' }, { id: 'b' });
  const out = examOutlook();
  assert.ok(out && out.examDays === 100);
  assert.ok(out.pct >= 0 && out.pct <= 100);
  assert.ok(out.avg >= 0 && out.avg <= 100);
  globalThis.countdownDays = () => null;
  assert.equal(examOutlook(), null);
  globalThis.countdownDays = () => 100; // 还原
});
