import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';

// browse.mjs 用标记块抽取「先复习 / 先新学」的队列顺序纯函数（DOM/存储无关）
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const src = fs.readFileSync(path.join(root, 'src/browse.mjs'), 'utf8');
const BEGIN = '// ===== BEGIN TESTABLE queue order helpers =====';
const END = '// ===== END TESTABLE queue order helpers =====';
const a = src.indexOf(BEGIN);
const b = src.indexOf(END);
if (a < 0 || b < 0) throw new Error('browse.mjs 缺少 queue order helpers 标记块');
const block = src.slice(a + BEGIN.length, b);
const EXPORTS = [
  'QUEUE_ORDER_DEFAULT', 'QUEUE_ORDERS',
  'queueOrderOf', 'queueSessionOf', 'queueStepState', 'queueSessions', 'queueSessionRankOf',
  'queueCardRank', 'queueSurfacesNow', 'queueGroupBySession', 'queueActiveSession', 'queueMergeDeferred',
  'queueSortFront'
];
const sandbox = {};
vm.runInNewContext(block + '\n' + EXPORTS.map((n) => `this.${n} = ${n};`).join('\n'), sandbox);
const queueOrderOf = sandbox.queueOrderOf;
const queueSessionOf = sandbox.queueSessionOf;
const queueStepState = sandbox.queueStepState;
const queueSessions = (o) => Array.from(sandbox.queueSessions(o));
const queueSessionRankOf = sandbox.queueSessionRankOf;
const queueCardRank = sandbox.queueCardRank;
const queueSurfacesNow = sandbox.queueSurfacesNow;
const queueGroupBySession = (ids, o) => Array.from(sandbox.queueGroupBySession(ids, o, stateOf)) ;
const queueActiveSession = (ids, f, o) => sandbox.queueActiveSession(ids, f, o, stateOf);
const queueMergeDeferred = (tail, extra, o) => Array.from(sandbox.queueMergeDeferred(tail, extra, o, stateOf));

// 三种队列分别用一个代表 id：未学新卡 / 学习步进 / 到期复习 / 重学步进
const states = { n1: 'new', n2: 'new', l1: 'learning', r1: 'review', r2: 'review', r9: 'review', rl1: 'relearning', n9: 'new' };
const stateOf = (id) => states[id];

test('queueOrderOf：缺省先复习，非法值一律回退默认', () => {
  assert.equal(sandbox.QUEUE_ORDER_DEFAULT, 'review');
  assert.deepEqual(Array.from(sandbox.QUEUE_ORDERS), ['review', 'new']);
  assert.equal(queueOrderOf(undefined), 'review');
  assert.equal(queueOrderOf(null), 'review');
  assert.equal(queueOrderOf(''), 'review');
  assert.equal(queueOrderOf('review'), 'review');
  assert.equal(queueOrderOf('new'), 'new');
  // 大小写/任意字符串都不猜，回退默认（与 store.mjs 的净化器同口径）
  assert.equal(queueOrderOf('NEW'), 'review');
  assert.equal(queueOrderOf('learning'), 'review');
  assert.equal(queueOrderOf(true), 'review');
});

test('queueSessionOf / queueStepState：三队列归属与步进卡识别', () => {
  // 新学会话 = 未学新卡 + 学习步进；复习会话 = 到期复习 + 重学步进
  assert.equal(queueSessionOf('new'), 'new');
  assert.equal(queueSessionOf('learning'), 'new');
  assert.equal(queueSessionOf('review'), 'review');
  assert.equal(queueSessionOf('relearning'), 'review');
  // 未知状态落复习会话（宁可多复习一次，也不把卡吞掉）
  assert.equal(queueSessionOf('whatever'), 'review');
  // 分钟级步进卡只有 learning / relearning 两种
  assert.equal(queueStepState('learning'), true);
  assert.equal(queueStepState('relearning'), true);
  assert.equal(queueStepState('new'), false);
  assert.equal(queueStepState('review'), false);
});

test('queueSessions / queueSessionRankOf / queueCardRank：先后与位次', () => {
  assert.deepEqual(queueSessions('review'), ['review', 'new']);
  assert.deepEqual(queueSessions(undefined), ['review', 'new']);
  assert.deepEqual(queueSessions('new'), ['new', 'review']);
  assert.equal(queueSessionRankOf('review', 'review'), 0);
  assert.equal(queueSessionRankOf('review', 'new'), 1);
  assert.equal(queueSessionRankOf('new', 'new'), 0);
  assert.equal(queueSessionRankOf('new', 'review'), 1);
  assert.equal(queueSessionRankOf('review', 'nope'), 2);
  // 按卡状态取位次
  assert.equal(queueCardRank('new', 'review'), 1);
  assert.equal(queueCardRank('new', 'learning'), 0);
  assert.equal(queueCardRank('review', 'relearning'), 0);
});

test('queueSurfacesNow：步进卡恒真；只有「后一个会话」的复习卡留在原地', () => {
  // 默认「先复习」：活动会话 = 复习 → 所有到期状态都吸回（旧行为）
  assert.equal(queueSurfacesNow('review', 'review', 'review'), true);
  assert.equal(queueSurfacesNow('review', 'review', 'relearning'), true);
  assert.equal(queueSurfacesNow('review', 'review', 'learning'), true);
  // 复习做完、活动会话滚到新学：复习卡依旧吸回
  assert.equal(queueSurfacesNow('review', 'new', 'review'), true);

  // 「先新学」：活动会话 = 新学 → 到期复习卡不插队（等新学会话结束再吸回）
  assert.equal(queueSurfacesNow('new', 'new', 'review'), false);
  // 但分钟级步进卡（学习/重学）两种顺序下都立刻回队首——短时记忆步进窗口不能被拖长
  assert.equal(queueSurfacesNow('new', 'new', 'learning'), true);
  assert.equal(queueSurfacesNow('new', 'new', 'relearning'), true);
  // 新学会话做完、活动会话滚到复习：到期复习卡恢复吸回
  assert.equal(queueSurfacesNow('new', 'review', 'review'), true);
});

test('回归锁：默认顺序下任何活动会话都吸回全部到期卡（= 改造前行为）', () => {
  ['review', 'learning', 'relearning'].forEach((st) => {
    ['review', 'new'].forEach((active) => {
      assert.equal(queueSurfacesNow('review', active, st), true, st + '/' + active);
    });
  });
});

test('queueGroupBySession：稳定分组，组内保持输入顺序，二次应用幂等', () => {
  const ids = ['r1', 'n1', 'r2', 'n2'];
  assert.deepEqual(queueGroupBySession(ids, 'review'), ['r1', 'r2', 'n1', 'n2']);
  assert.deepEqual(queueGroupBySession(ids, 'new'), ['n1', 'n2', 'r1', 'r2']);
  // 步进卡跟各自会话走
  assert.deepEqual(queueGroupBySession(['r1', 'l1', 'rl1', 'n1'], 'new'), ['l1', 'n1', 'r1', 'rl1']);
  const once = queueGroupBySession(ids, 'new');
  assert.deepEqual(queueGroupBySession(once, 'new'), once);
  assert.deepEqual(queueGroupBySession([], 'new'), []);
  assert.deepEqual(queueGroupBySession(null, 'new'), []);
});

test('queueActiveSession：取 frontier 处卡片的会话，越界回落到末卡/首个会话', () => {
  // 先复习：deck = [复习…, 新学…]
  const deckR = ['r1', 'r2', 'n1'];
  assert.equal(queueActiveSession(deckR, 0, 'review'), 'review');
  assert.equal(queueActiveSession(deckR, 1, 'review'), 'review');
  assert.equal(queueActiveSession(deckR, 2, 'review'), 'new');
  // frontier 走到末尾（队列清空）→ 用最后一张卡，避免「巩固步进中」卡死
  assert.equal(queueActiveSession(deckR, 3, 'review'), 'new');
  assert.equal(queueActiveSession(deckR, 99, 'review'), 'new');
  // 先新学：deck = [新学…, 复习…]
  const deckN = ['n1', 'l1', 'r1'];
  assert.equal(queueActiveSession(deckN, 0, 'new'), 'new');
  assert.equal(queueActiveSession(deckN, 2, 'new'), 'review');
  // 空队列 → 先做那个会话
  assert.equal(queueActiveSession([], 0, 'review'), 'review');
  assert.equal(queueActiveSession([], 0, 'new'), 'new');
});

test('queueMergeDeferred：延迟卡插到同会话组的最前面', () => {
  const tail = ['n1', 'r1', 'r2'];
  // 先复习：延迟的复习卡排回复习组最前（逾期最久者优先由调用方按 due 排序保证）
  assert.deepEqual(queueMergeDeferred(tail, ['r9'], 'review'), ['r9', 'r1', 'r2', 'n1']);
  // 先新学：延迟的新学会话卡同理
  assert.deepEqual(queueMergeDeferred(['r1', 'r2'], ['n9'], 'new'), ['n9', 'r1', 'r2']);
  // 无延迟卡时是恒等分组（不丢卡、不改组内顺序）
  assert.deepEqual(queueMergeDeferred(tail, [], 'review'), ['r1', 'r2', 'n1']);
  assert.deepEqual(queueMergeDeferred([], ['r9'], 'review'), ['r9']);
});

test('queueSortFront：步进卡抢占队首区（组内按 due 升序），复习卡排在其后', () => {
  const due = { r1: 5000, r2: 1000, l1: 3000, rl1: 2000 };
  const dueOf = (id) => due[id];
  const sortFront = (ids) => Array.from(sandbox.queueSortFront(ids, stateOf, dueOf));
  // 学习/重学步进卡在前（rl1 比 l1 早到期），到期复习卡在后（r2 比 r1 早到期）：
  // 只按 due 混排会把 l1 压到 r2 之后，刚刚「忘记」的卡就要等好几天积压才轮到。
  assert.deepEqual(sortFront(['r1', 'l1', 'r2', 'rl1']), ['rl1', 'l1', 'r2', 'r1']);
  // 全是复习卡时退化为纯 due 升序（逾期最久先做），全是步进卡时同理
  assert.deepEqual(sortFront(['r1', 'r2']), ['r2', 'r1']);
  assert.deepEqual(sortFront(['l1', 'rl1']), ['rl1', 'l1']);
  // 缺参/空数组不炸，且不修改入参
  assert.deepEqual(sortFront([]), []);
  assert.deepEqual(Array.from(sandbox.queueSortFront(null, stateOf, dueOf)), []);
  const input = ['r1', 'l1'];
  sortFront(input);
  assert.deepEqual(input, ['r1', 'l1']);
});

test('接线：三处队列编排都读 queueOrder，设置页有对应选项', () => {
  // buildSession 拼队列 / surfaceDue 判吸回 / reorderQueue 切设置后重排 —— 三处都必须走同一个解析器
  const hits = src.match(/queueOrderOf\(prefGet\('queueOrder'\)\)/g) || [];
  assert.ok(hits.length >= 3, 'queueOrder 解析点不足 3 处：' + hits.length);
  assert.match(src, /deck = queueOrderOf\(prefGet\('queueOrder'\)\) === 'new' \? segNew\.concat\(segReview\) : segReview\.concat\(segNew\);/);
  assert.match(src, /function reorderQueue\(\)/);
  const settingsSrc = fs.readFileSync(path.join(root, 'src/settings.mjs'), 'utf8');
  assert.match(settingsSrc, /key: 'queueOrder'/);
  assert.match(settingsSrc, /item\.type === 'choice'/);
  assert.match(settingsSrc, /reorderQueue\(\);/);
  // 队首区必须按「步进卡优先」排序，且步进卡到点自动重渲染（不能等用户下次评分才回队首）
  assert.match(src, /queueSortFront\(front, stateOfCard/);
  assert.match(src, /function scheduleStepRefresh\(now\)/);
  assert.match(src, /scheduleStepRefresh\(now\);/);
  assert.match(src, /if \(currentView === 'learn' && !document\.querySelector\('\.map-modal'\)\) renderApp\(\);/);
});
