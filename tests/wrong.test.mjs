import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
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

// ---------------- t18：错题自测作为二级导航项（错题模块） ----------------
// src/learn.mjs / src/actions.mjs 都是「同一 IIFE 内的片段」（learn.mjs 末尾停在 `function renderApp() {`，
// 函数体在 browse.mjs 开头；actions.mjs 末尾的 `})();` 收的是 app.mjs 开的那层 IIFE），
// 既不能整文件 import 也不能 node --check。这里按花括号配对切出被测函数原文，塞进 vm 沙箱跑真逻辑：
// 断言直接落在生产代码上，且行号漂移不会让用例失真（与上面「接线契约」的源码级校验同思路）。
const SRC_LEARN = readFileSync(new URL('../src/learn.mjs', import.meta.url), 'utf8');
const SRC_ACTIONS = readFileSync(new URL('../src/actions.mjs', import.meta.url), 'utf8');
// SRC_WRONG 可用 ATHENA_WRONG_FILE 覆盖（t28）：反证「把页内入口加回 / 把「手动录入」挪回末位」时，
// 同一套断言必须在被改坏的源码上判红，见 backup/scratch/wrong-entry/check-wrong-entry.mjs
const SRC_WRONG = readFileSync(process.env.ATHENA_WRONG_FILE || new URL('../src/wrong.mjs', import.meta.url), 'utf8');
const SRC_CSS = readFileSync(process.env.ATHENA_CSS_FILE || new URL('../style.css', import.meta.url), 'utf8');

// 花括号配对（跳过字符串/模板串/行注释/块注释），用于切出完整函数原文
function braceEnd(text, openAt) {
  let depth = 0;
  for (let i = openAt; i < text.length; i++) {
    const c = text[i];
    const n = text[i + 1];
    if (c === '/' && n === '/') { const e = text.indexOf('\n', i); i = e < 0 ? text.length : e; continue; }
    if (c === '/' && n === '*') { const e = text.indexOf('*/', i + 2); i = e < 0 ? text.length : e + 1; continue; }
    if (c === '"' || c === "'" || c === '`') {
      for (let j = i + 1; j < text.length; j++) {
        if (text[j] === '\\') { j++; continue; }
        if (text[j] === c) { i = j; break; }
      }
      continue;
    }
    if (c === '{') depth++;
    else if (c === '}') { depth--; if (depth === 0) return i; }
  }
  throw new Error('括号不闭合：' + text.slice(openAt, openAt + 40));
}

function sliceFunction(text, header) {
  const at = text.indexOf(header);
  assert.ok(at >= 0, '未找到 ' + header);
  const openAt = text.indexOf('{', at + header.length - 1);
  assert.ok(openAt > at, header + ' 没有函数体');
  return text.slice(at, braceEnd(text, openAt) + 1);
}

// 切出 switch 里 `case 'x':` 的分支体（到 break; 或下一个 case 为止）
function caseBody(text, label) {
  const header = "case '" + label + "':";
  const at = text.indexOf(header);
  assert.ok(at >= 0, '未找到 ' + header);
  const start = at + header.length;
  const brk = text.indexOf('break;', start);
  const next = text.indexOf("case '", start);
  const end = brk >= 0 && (next < 0 || brk < next) ? brk : next;
  assert.ok(end > start, header + ' 没有结尾');
  return text.slice(start, end);
}

// 最小 DOM 桩：够 el()/renderSubnav()/wrongQuizEntry() 用
function mkNode(tag) {
  return {
    tag: tag, className: '', textContent: '', attrs: {}, children: [], handlers: {}, offsetHeight: 0,
    style: { setProperty() {} },
    appendChild(c) { this.children.push(c); return c; },
    setAttribute(k, v) { this.attrs[k] = String(v); },
    getAttribute(k) { return Object.prototype.hasOwnProperty.call(this.attrs, k) ? this.attrs[k] : null; },
    addEventListener(type, fn) { this.handlers[type] = fn; },
    classList: { add() {}, remove() {}, toggle() {} }
  };
}

const EL_SRC = sliceFunction(SRC_LEARN, 'function el(tag, cls, text)');
const SUBNAV_SRC = sliceFunction(SRC_LEARN, 'function renderSubnav()');
const ENTER_WRONG_QUIZ_SRC = sliceFunction(SRC_ACTIONS, 'function enterWrongQuiz()');
const NAV_CASE_SRC = caseBody(SRC_ACTIONS, 'nav');
const MODULE_CASE_SRC = caseBody(SRC_ACTIONS, 'module');

// 跑真 renderSubnav()，回收二级栏按钮（args/labels/icons/active 都是 DOM 上的事实）
function renderSubnavOf(view, moduleId) {
  const sub = mkNode('div');
  const iconNames = [];
  const ctx = {
    currentView: view, currentModule: moduleId, iconNames: iconNames,
    highlightShell() {}, syncFocusReminder() {}, icon(name) { iconNames.push(name); return mkNode('span'); },
    document: {
      documentElement: { style: { setProperty() {} } },
      createElement: (t) => mkNode(t),
      createTextNode: (t) => ({ tag: '#text', text: String(t) }),
      getElementById: (id) => (id === 'subnav' ? sub : null),
      querySelector: (sel) => (sel === 'header' ? { offsetHeight: 56 } : null),
      querySelectorAll: () => []
    }
  };
  vm.createContext(ctx);
  vm.runInContext(EL_SRC + '\n' + SUBNAV_SRC, ctx);
  vm.runInContext('renderSubnav()', ctx);
  const buttons = sub.children.filter((c) => c.tag === 'button');
  return {
    buttons: buttons,
    args: buttons.map((b) => b.getAttribute('data-arg')),
    labels: buttons.map((b) => (b.children.find((c) => c.tag === '#text') || { text: '' }).text.trim()),
    actions: buttons.map((b) => b.getAttribute('data-action')),
    classes: buttons.map((b) => b.className),
    icons: iconNames.slice(),
    active: buttons.filter((b) => /\bactive\b/.test(b.className)).map((b) => b.getAttribute('data-arg'))
  };
}

// 跑真 handleAction 的 nav / module 分支体（其余分支不执行、不参与，仅本分支逻辑进沙箱）
function dispatchNav(state, action, arg) {
  const calls = { render: 0, close: 0 };
  const ctx = Object.assign({
    currentView: 'wrong', currentModule: 'wrong', quiz: null,
    closeDrawer() { calls.close++; }, renderApp() { calls.render++; }
  }, state || {});
  vm.createContext(ctx);
  vm.runInContext(ENTER_WRONG_QUIZ_SRC + '\nfunction navStep(arg) {' + NAV_CASE_SRC + '}\nfunction moduleStep(arg) {' + MODULE_CASE_SRC + '}', ctx);
  if (action === 'nav') ctx.navStep(arg); else ctx.moduleStep(arg);
  return { view: ctx.currentView, module: ctx.currentModule, quiz: ctx.quiz, render: calls.render };
}

// 跑真 renderWrongLearn() / renderWrongBrowse()（DB.wrongs 为空 → 建完工具条即走空态早退），
// 回收 .learn-top 工具条本身：子节点顺序与属性都是生产代码 appendChild 的事实（t28）
function renderWrongToolbar(fnName) {
  const app = mkNode('div');
  const ctx = {
    DB: { wrongs: {} }, wrongDeck: [], wrongFrontier: 0, wrongPos: 0,
    openWrongInput() {}, illus: () => mkNode('span'),
    document: {
      createElement: (t) => mkNode(t),
      createTextNode: (t) => ({ tag: '#text', text: String(t) }),
      getElementById: (id) => (id === 'app' ? app : null)
    }
  };
  vm.createContext(ctx);
  vm.runInContext(EL_SRC, ctx);
  vm.runInContext(sliceFunction(SRC_WRONG, 'function ' + fnName + '()'), ctx);
  vm.runInContext(fnName + '()', ctx);
  const tb = app.children.filter((c) => /\blearn-top\b/.test(c.className));
  assert.equal(tb.length, 1, fnName + ' 应恰好建立一个 .learn-top 工具条');
  return tb[0];
}

test('t18 二级项：错题模块新增「自测」（紧随「重做」），图标与卡片模块自测同一字符图标', () => {
  const wrong = renderSubnavOf('wrong', 'wrong');
  assert.deepEqual(wrong.args, ['wrong', 'wrongQuiz', 'wrongBrowse', 'wrongStats'], '错题模块二级项顺序应为 重做 → 自测 → 浏览 → 统计');
  assert.deepEqual(wrong.labels, ['重做', '自测', '浏览', '统计']);
  assert.equal(wrong.icons[1], 'pencil', '「自测」应沿用自测字符图标口径（pencil）');
  assert.ok(wrong.classes.every((c) => c === 'nav-btn sub-btn' || c === 'nav-btn sub-btn active'), '二级项类名沿用 nav-btn sub-btn（未新增类名，样式/移动端口径不变）');
  assert.ok(wrong.actions.every((a) => a === 'nav'), '二级项一律派发 data-action="nav"');
  assert.ok(wrong.buttons.every((b) => b.children.some((c) => c.tag === 'span')), '每项都带图标节点');
  const cards = renderSubnavOf('quiz', 'cards');
  assert.deepEqual(cards.args, ['learn', 'browse', 'quiz', 'bank', 'statistics', 'help'], '卡片模块二级项不得被改动');
  assert.equal(cards.icons[2], wrong.icons[1], '错题自测与卡片自测必须共用同一图标名');
  // 移动端二级栏宽度：错题模块 4 项 ≤ 既有最多 6 项（卡片模块），标签仍是 2 个汉字，未新建最坏情况
  assert.ok(wrong.buttons.length <= cards.buttons.length, '错题模块项数（' + wrong.buttons.length + '）不应超过既有最多项数（' + cards.buttons.length + '）');
});

test('t18 高亮：错题自测视图高亮「自测」（不再映射回「重做」），卡片自测仍高亮 quiz', () => {
  const cases = [
    ['wrong', 'wrong', 'wrong'],
    ['quiz', 'wrong', 'wrongQuiz'],
    ['wrongBrowse', 'wrong', 'wrongBrowse'],
    ['wrongStats', 'wrong', 'wrongStats'],
    ['quiz', 'cards', 'quiz'],
    ['learn', 'cards', 'learn'],
    ['bank', 'cards', 'bank'],
    ['actFocus', 'act', 'actFocus']
  ];
  for (const [view, moduleId, expect] of cases) {
    const r = renderSubnavOf(view, moduleId);
    assert.deepEqual(r.active, [expect], 'currentModule=' + moduleId + ' currentView=' + view + ' 应恰好高亮 ' + expect);
  }
  const home = renderSubnavOf('home', 'cards');
  assert.deepEqual(home.active, [], '主页无二级栏（不受影响）');
});

test('t18 派发：nav/module wrongQuiz → currentModule=wrong + currentView=quiz（不落 learn），单次渲染且不带入卡片会话', () => {
  assert.ok(!/currentView\s*=\s*arg;/.test(NAV_CASE_SRC), 'nav 分支不得把 arg 直接当视图写回（wrongQuiz 不是渲染分支，必须落 quiz）');
  const nav = dispatchNav({ quiz: { mode: 'cards' } }, 'nav', 'wrongQuiz');
  assert.equal(nav.module, 'wrong');
  assert.equal(nav.view, 'quiz', 'nav wrongQuiz 的视图必须是 quiz（不能是 wrongQuiz / learn）');
  assert.equal(nav.render, 1, '只渲染一次，不得重复渲染');
  assert.equal(nav.quiz, null, '卡片自测（mode=cards）会话不得被带进错题自测视图');
  const ongoing = { mode: 'wrong', qs: [{ id: 'x' }] };
  assert.equal(dispatchNav({ quiz: ongoing }, 'nav', 'wrongQuiz').quiz, ongoing, '进行中的错题自测会话应保持（二级栏误点不丢进度）');
  // 既有派发口径零回归
  assert.equal(dispatchNav({}, 'nav', 'quiz').module, 'cards');
  assert.equal(dispatchNav({}, 'nav', 'wrong').view, 'wrong');
  assert.equal(dispatchNav({}, 'nav', 'wrongBrowse').view, 'wrongBrowse');
  assert.equal(dispatchNav({}, 'nav', 'wrongStats').view, 'wrongStats');
  // 一级模块入口（module）同样不得把 wrongQuiz 落到 learn
  assert.equal(dispatchNav({}, 'module', 'wrongQuiz').view, 'quiz');
  assert.equal(dispatchNav({}, 'module', 'wrongQuiz').module, 'wrong');
  assert.equal(dispatchNav({}, 'module', 'wrong').view, 'wrong');
  assert.equal(dispatchNav({}, 'module', 'act').view, 'actFocus');
  assert.equal(dispatchNav({}, 'module', 'cards').view, 'learn');
});

test('t28 页内入口已删除：二级功能栏「自测」是唯一入口（wrongQuizEntry 与其 3 处调用全部移除）', () => {
  assert.equal((SRC_WRONG.match(/wrongQuizEntry/g) || []).length, 0, 'src/wrong.mjs 不得残留 wrongQuizEntry（函数与 3 处调用都应删除）');
  assert.ok(!/function\s+wrongQuizEntry\s*\(/.test(SRC_WRONG), 'wrongQuizEntry 函数应整体删除');
  assert.ok(!SRC_WRONG.includes('tb.appendChild(wrongQuizEntry'), '三个工具条都不得再挂页内自测入口');
  assert.ok(!SRC_WRONG.includes('📝 错题自测'), '错题本页内不得再渲染「📝 错题自测」按钮');
  assert.ok(!SRC_WRONG.includes('点上方「📝 错题自测」'), '错题统计页文案不得再指向已删除的页内按钮');
  assert.match(SRC_WRONG, /入口已改为二级功能栏/, '删除处必须留注释说明入口已改为二级功能栏');
  // 唯一入口的行为零回归：nav 与 module 两条路径都落 wrong/quiz，且不丢进行中的会话
  const nav = dispatchNav({ quiz: { mode: 'cards' } }, 'nav', 'wrongQuiz');
  assert.deepEqual([nav.module, nav.view, nav.quiz, nav.render], ['wrong', 'quiz', null, 1], '二级栏「自测」应一次渲染落 wrong/quiz，且不带入卡片会话');
  const ongoing = { mode: 'wrong', qs: [{ id: 'x' }] };
  assert.equal(dispatchNav({ quiz: ongoing }, 'nav', 'wrongQuiz').quiz, ongoing, '二级栏「自测」不得重置进行中的错题自测会话');
  assert.equal(dispatchNav({}, 'module', 'wrongQuiz').view, 'quiz');
  assert.equal(dispatchNav({}, 'module', 'wrongQuiz').module, 'wrong');
  // nav 与 module 两条派发路径共用同一个会话守卫（页内入口删除不影响它）
  assert.match(SRC_ACTIONS, /function enterWrongQuiz\(\)/);
  assert.equal((SRC_ACTIONS.match(/enterWrongQuiz\(\)/g) || []).length, 3, 'enterWrongQuiz 应为 1 处定义 + nav/module 各 1 处调用');
});

test('t28 「手动录入」在重做/浏览两视图里都是 .learn-top 首个子元素（左上角、热区 ≥32px、计数排后）', () => {
  for (const fnName of ['renderWrongLearn', 'renderWrongBrowse']) {
    const tb = renderWrongToolbar(fnName);
    assert.ok(tb.children.length >= 2, fnName + ' 工具条应至少含「手动录入」+ 计数两段');
    const first = tb.children[0];
    assert.equal(first.tag, 'button', fnName + ' 的 .learn-top 首个子元素必须是按钮（左上角，移动端首屏可点）');
    assert.ok(/手动录入/.test(first.textContent), fnName + ' 首个子元素应是「➕ 手动录入」，实际：' + first.textContent);
    assert.ok(/\bprimary\b/.test(first.className), fnName + ' 手动录入应沿用既有 primary 按钮类（不新建类名）');
    // t31 起热区不再内联：由 style.css 的 `.learn-top .btn.small` 统一给出（.btn.small 默认 30px）
    assert.ok(!/style\.minHeight/.test(SRC_WRONG), fnName + ' 手动录入不得再内联 min-height（t31 起样式归 style.css）');
    assert.ok(/\.learn-top\s+\.btn\.small\s*\{[^}]*min-height:\s*32px/.test(SRC_CSS),
      fnName + ' 热区 ≥32px 必须由 style.css 的 .learn-top .btn.small 规则给出');
    assert.equal(typeof first.handlers.click, 'function', fnName + ' 手动录入必须绑定 openWrongInput');
    const second = tb.children[1];
    assert.equal(second.tag, 'span', fnName + ' 计数字符串必须排在「手动录入」之后');
    assert.ok(/^共 \d+ 道$/.test(second.textContent), fnName + ' 第二个子元素应是计数文本，实际：' + second.textContent);
  }
});