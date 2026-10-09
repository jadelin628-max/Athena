import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import {
  fsrsInitDifficulty, fsrsInitStability, fsrsRetention,
  fsrsDifficulty, fsrsLapseStability, fsrsSuccessStability, fsrsInterval
} from '../src/fsrs-core.mjs';

// wrong.mjs 在浏览器里与其它模块拼接进同一 IIFE（共享 config.mjs 的 DAY/dayStart、
// fsrs-core 的函数、store.mjs 的 DB/card/defaultWrongCard）；单测时把这些依赖注入为全局，
// 再动态加载被测模块。
globalThis.DAY = 86400000;
globalThis.dayStart = (ts) => { const d = new Date(ts); d.setHours(0, 0, 0, 0); return d.getTime(); };
globalThis.desiredRetention = () => 0.9;
Object.assign(globalThis, {
  fsrsInitDifficulty, fsrsInitStability, fsrsRetention,
  fsrsDifficulty, fsrsLapseStability, fsrsSuccessStability, fsrsInterval
});
// store.mjs 的数据面：知识卡按 id 取全局 DB.cards；错题卡由各用例塞进 DB.wrongs
globalThis.DB = { cards: {}, wrongs: {}, log: { revlogs: [] } };
globalThis.card = (id) => globalThis.DB.cards[id] || null;
globalThis.saveDB = () => {};
const { initWrongAsLapsed, applyRatingToWrongCard, demoteLinked } = await import('../src/wrong.mjs');
// 来源标记（linkedMastery）由 store.mjs 的错题卡工厂/净化器承载，直接加载同一份源码验证保真性
//（store.mjs 顶层只有声明与常量，导入无副作用）
const { defaultWrongCard, sanitizeWrongCard } = await import('../src/store.mjs');

const DAY = 86400000;
function newWrong(extra) { return Object.assign({ state: 'new', step: 0, reps: 0, ivl: 0, lapses: 0, grad: 0, diff: 5, stab: 0, fsrsInit: 0, due: 0, lastR: 0 }, extra || {}); }
// 浮点容差断言：期望值与实际值用不同时刻的 Date.now() 采样，毫秒跳变会让 daysSince 略偏，
// 进而让 R 与稳定度在 1e-8 相对量级上抖动——容差取 1e-6 只吸收计时噪声，仍能拦住真实公式回归。
function approx(actual, expected, msg) {
  assert.ok(Math.abs(actual - expected) <= 1e-6 * Math.max(1, Math.abs(expected)), (msg || '浮点不一致') + ': ' + actual + ' vs ' + expected);
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

// —— T49 下线「例题纳入错题 → 知识点掌握度联动」（只删联动，保留例题入错题） ——
// 两类来源的区分口径（与 src/store.mjs 的 defaultWrongCard / sanitizeWrongCard 一致）：
//   linkedMastery === 0 → 例题标入错题：评分只走错题卡自身调度，绝不改动关联知识点卡；
//   linkedMastery === 1（或缺失＝旧数据）→ 手动录入的知识卡错题：保留既有降级联动。

// 复刻 src/wrong.mjs 的真实调用序列（doWrongRate）：先评错题卡自身，再按开关做联动降级。
// 注入固定 now，使同一份知识卡在两个并行场景里沉浸在同一时刻——任何字段写入都会破坏快照。
function rateWrongLikeDoWrongRate(w, rating, now) {
  applyRatingToWrongCard(w, rating);
  if (rating <= 1) demoteLinked(w, rating);
}

function exampleWrong() { return Object.assign(newWrong(), { q: '真题题干', a: '解析', linked: ['k1'], linkedMastery: 0 }); }
function manualWrong() { return Object.assign(newWrong(), { q: '手动录入题目', a: '解析', linked: ['k1'], linkedMastery: 1 }); }
// 一份「正在复习、已到期」的知识卡：任何时候被降级都会留下 diff/stab/lapses/state/due/lastR 的变化
function linkedKnowledgeCard(now) {
  return { state: 'review', step: 0, reps: 4, ivl: 6, grad: 2, diff: 5.5, stab: 12, lapses: 0, due: now - DAY, lastR: now - 6 * DAY };
}

test('例题标记入错题：linkedMastery=0，题目/解析/来源照常写入，仍进入错题复习队列（只删联动）', () => {
  const w = exampleWrong();
  assert.equal(w.linkedMastery, 0);
  assert.deepEqual(w.linked, ['k1']); // 关联知识点标签仍在（展示/跳转不受影响）
  initWrongAsLapsed(w);
  assert.equal(w.state, 'review'); // 例题照常入错题本并参与重做
  assert.equal(w.lapses, 1);
  assertTomorrow(w.due);
});

test('例题标入错题后评分四档：关联知识点卡记忆字段逐字节不变（前后快照对比）', () => {
  for (const rating of [0, 1, 2, 3]) {
    const now = Date.now();
    const c = linkedKnowledgeCard(now);
    globalThis.DB.cards = { k1: c };
    globalThis.DB.wrongs = {};
    const w = exampleWrong();
    globalThis.DB.wrongs.w1 = w;
    initWrongAsLapsed(w);
    const before = JSON.stringify(c); // 评分前快照
    rateWrongLikeDoWrongRate(w, rating, now);
    assert.equal(w.state, 'review'); // 错题卡自身照常调度
    assert.equal(JSON.stringify(c), before, `rating=${rating} 时关联知识点卡被改动`);
    assert.equal(c.diff, 5.5);
    assert.equal(c.stab, 12);
    assert.equal(c.state, 'review');
    assert.equal(c.lapses, 0);
    assert.equal(c.due, now - DAY);
    assert.equal(c.lastR, now - 6 * DAY);
  }
});

test('知识卡错题回归：linkedMastery=1 时「不会/思路错」的降级联动与既往一致', () => {
  for (const rating of [0, 1]) {
    const now = Date.now();
    const c = linkedKnowledgeCard(now);
    globalThis.DB.cards = { k1: c };
    const w = manualWrong();
    initWrongAsLapsed(w);
    const expectedDiff = fsrsDifficulty(5.5, 1);
    const R = fsrsRetention(Math.max(0, (now - c.lastR) / DAY), 12); // 降级前的 R 按旧状态算
    rateWrongLikeDoWrongRate(w, rating, now);
    assert.equal(c.state, 'relearning', `rating=${rating} 应降级为重学`);
    assert.equal(c.diff, expectedDiff);
    assert.equal(c.lapses, 1);
    assert.equal(c.step, 0);
    assert.equal(c.grad, 0);
    assert.equal(c.reps, 0);
    assert.equal(c.ivl, 0);
    assertTomorrow(c.due);
    approx(c.stab, fsrsLapseStability(expectedDiff, 12, R), '降级后稳定度');
    assert.ok(c.lastR >= now, '降级必须刷新 lastR（跨端合并按 lastR 选边）');
  }
});

test('知识卡错题回归：算错/会做对不触发降级（与既往一致）', () => {
  for (const rating of [2, 3]) {
    const now = Date.now();
    const c = linkedKnowledgeCard(now);
    globalThis.DB.cards = { k1: c };
    const before = JSON.stringify(c);
    const w = manualWrong();
    initWrongAsLapsed(w);
    rateWrongLikeDoWrongRate(w, rating, now);
    assert.equal(JSON.stringify(c), before, `rating=${rating} 不应改动关联知识点卡`);
  }
});

test('旧数据兼容：错题卡缺 linkedMastery 时按 1 处理（历史行为不被静默改写、历史影响不回滚）', () => {
  const now = Date.now();
  const legacy = Object.assign(newWrong(), { q: '旧数据错题', a: '解析', linked: ['k1'] }); // v2.1.0 之前无 linkedMastery
  assert.equal(legacy.linkedMastery, undefined);
  const c = linkedKnowledgeCard(now);
  globalThis.DB.cards = { k1: c };
  rateWrongLikeDoWrongRate(legacy, 0, now);
  assert.equal(legacy.linkedMastery, undefined, '只删联动：不写回历史卡的来源标记');
  assert.equal(c.state, 'relearning', '旧卡按历史口径仍降级');
  assert.equal(c.lapses, 1);
});

test('来源标记保真：净化/导入回灌后 linkedMastery 不丢（同步与备份导入不会重新打开例题联动）', () => {
  assert.equal(defaultWrongCard().linkedMastery, 1); // 默认（手动录入）＝开启联动
  assert.equal(sanitizeWrongCard({ linked: ['k1'], linkedMastery: 0 }).linkedMastery, 0);
  assert.equal(sanitizeWrongCard({ linked: ['k1'], linkedMastery: 1 }).linkedMastery, 1);
  assert.equal(sanitizeWrongCard({ linked: ['k1'] }).linkedMastery, 1); // 旧数据缺字段 → 按历史行为补 1
  assert.equal(sanitizeWrongCard({ linkedMastery: null }).linkedMastery, 1);
  assert.equal(sanitizeWrongCard(null).linkedMastery, 1);
  assert.equal(sanitizeWrongCard({ linkedMastery: '0' }).linkedMastery, 1); // 非数值不当作关闭
  // 端到端：净化后的例题错题评分仍未改动关联知识点卡
  const now = Date.now();
  const c = linkedKnowledgeCard(now);
  globalThis.DB.cards = { k1: c };
  const before = JSON.stringify(c);
  const roundTripped = sanitizeWrongCard(exampleWrong());
  assert.equal(roundTripped.linkedMastery, 0);
  initWrongAsLapsed(roundTripped);
  rateWrongLikeDoWrongRate(roundTripped, 0, now);
  assert.equal(JSON.stringify(c), before, '净化回灌后的例题错题仍不得改动关联知识点卡');
  // 同一净化路径下的手动录入错题仍照常降级（对照）
  const c2 = linkedKnowledgeCard(now);
  globalThis.DB.cards = { k1: c2 };
  const manual = sanitizeWrongCard(manualWrong());
  initWrongAsLapsed(manual);
  rateWrongLikeDoWrongRate(manual, 0, now);
  assert.equal(c2.state, 'relearning');
});

test('联动开关边界：无关联/无此卡/未到期/非降级档时不改动任何知识卡', () => {
  const now = Date.now();
  const c = linkedKnowledgeCard(now);
  globalThis.DB.cards = { k1: c };
  const before = JSON.stringify(c);
  demoteLinked(undefined, 0);
  demoteLinked(null, 0);
  demoteLinked({ linked: [], linkedMastery: 1 }, 0);
  demoteLinked({ linked: ['k1'], linkedMastery: 1 }, 2); // 算错：非降级档
  demoteLinked({ linked: ['ghost'], linkedMastery: 1 }, 0); // 关联 id 已不存在
  demoteLinked({ linked: ['k1'], linkedMastery: 0 }, 0); // 例题来源：联动已下线
  demoteLinked({ linked: ['k1'], linkedMastery: 0 }, 1); // 例题来源 + 思路错
  assert.equal(JSON.stringify(c), before, '不该被改动的知识卡被改动了');
  const fresh = Object.assign(newWrong(), { linked: ['k1'], linkedMastery: 1 });
  globalThis.DB.cards.k1 = newWrong(); // state === 'new'：无记忆状态可降级
  const freshBefore = JSON.stringify(globalThis.DB.cards.k1);
  demoteLinked(fresh, 0);
  assert.equal(JSON.stringify(globalThis.DB.cards.k1), freshBefore, 'new 卡不应被降级');
  // 旧签名兼容：未传 rating 时按「降级档」处理（与 T51 之前的 linkedIds 单参调用同口径）
  demoteLinked({ linked: ['k1'], linkedMastery: 1 });
  assert.equal(globalThis.DB.cards.k1.state, 'new', 'new 卡仍不降级');
});

test('接线契约：doWrongRate 仍按来源调用联动（demoteLinked(w, r)），markAsWrong 仍置 linkedMastery=0', () => {
  const src = readFileSync(new URL('../src/wrong.mjs', import.meta.url), 'utf8');
  const lines = src.split('\n');
  const rateLine = lines.findIndex((l) => /function doWrongRate\(/.test(l));
  const callLine = lines.findIndex((l) => /demoteLinked\(w, r\)/.test(l));
  const markLine = lines.findIndex((l) => /function markAsWrong\(/.test(l));
  assert.ok(rateLine >= 0, '未找到 doWrongRate');
  assert.ok(callLine >= 0, 'doWrongRate 内未找到 demoteLinked(w, r) 调用');
  assert.ok(markLine >= 0, '未找到 markAsWrong');
  assert.ok(callLine > rateLine && callLine < rateLine + 30, 'demoteLinked 调用不在 doWrongRate 体内（联动接线被改动）');
  const markBody = lines.slice(markLine, markLine + 40).join('\n'); // markAsWrong 体内
  assert.match(markBody, /linkedMastery\s*=\s*0/, 'markAsWrong 未关闭例题的联动开关');
});