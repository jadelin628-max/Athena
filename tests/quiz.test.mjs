import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';
import {
  FSRS_S_MIN, fsrsInitStability, fsrsInitDifficulty, fsrsShortTermStability,
  fsrsRetention, fsrsDifficulty, fsrsLapseStability, fsrsSuccessStability, fsrsInterval
} from '../src/fsrs-core.mjs';

// quiz.mjs 不在 tools/build.mjs 的 STRIP 集合内（浏览器里是同一 IIFE，不能出现 export），
// 所以自测纯函数放进 TESTABLE 标记块，单测用标记块抽取到 vm 求值——与 pref-scope / act-settings 同款。
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const src = fs.readFileSync(path.join(root, 'src/quiz.mjs'), 'utf8');
const BEGIN = '// ===== BEGIN TESTABLE quiz core helpers =====';
const END = '// ===== END TESTABLE quiz core helpers =====';
const a = src.indexOf(BEGIN);
const b = src.indexOf(END);
if (a < 0 || b < 0) throw new Error('quiz.mjs 缺少 quiz core helpers 标记块');
const block = src.slice(a + BEGIN.length, b);
const sandbox = {};
vm.runInNewContext(block + '\n' + [
  'this.QUIZ_MAX_COUNT = QUIZ_MAX_COUNT;',
  'this.QUIZ_DEFAULT_COUNT = QUIZ_DEFAULT_COUNT;',
  'this.QUIZ_WEAK_ACC = QUIZ_WEAK_ACC;',
  'this.QUIZ_DIFF_MIN = QUIZ_DIFF_MIN;',
  'this.QUIZ_DIFF_MAX = QUIZ_DIFF_MAX;',
  'this.QUIZ_DEFAULT_DIFF = QUIZ_DEFAULT_DIFF;',
  'this.QUIZ_UNCATED = QUIZ_UNCATED;',
  'this.QUIZ_MAX_RECORDS = QUIZ_MAX_RECORDS;',
  'this.quizDefaultConfig = quizDefaultConfig;',
  'this.quizShuffle = quizShuffle;',
  'this.quizClampNum = quizClampNum;',
  'this.quizSanitizeRange = quizSanitizeRange;',
  'this.quizSanitizeConfig = quizSanitizeConfig;',
  'this.quizFilterEntries = quizFilterEntries;',
  'this.quizBuildQueue = quizBuildQueue;',
  'this.quizWeakIds = quizWeakIds;',
  'this.quizVerdict = quizVerdict;',
  'this.quizBuildReport = quizBuildReport;',
  'this.quizLogStats = quizLogStats;',
  'this.quizCardCandidates = quizCardCandidates;',
  'this.quizWrongCandidates = quizWrongCandidates;',
  'this.quizEnqueue = quizEnqueue;'
].join('\n'), sandbox);

// vm 里造的对象跨 realm，deepStrictEqual 会因原型不同判不等——比较前统一转成本 realm 的普通值
const clean = (v) => JSON.parse(JSON.stringify(v));

// sched.mjs（既有「提前复习」接口）在浏览器里共享 config.mjs 的 DAY/dayStart 与 fsrs-core 的函数；
// 单测同样注入全局后再动态加载——与 tests/sched.test.mjs 同款。
globalThis.DAY = 86400000;
globalThis.dayStart = (ts) => { const d = new Date(ts); d.setHours(0, 0, 0, 0); return d.getTime(); };
Object.assign(globalThis, {
  fsrsInitStability, fsrsInitDifficulty, fsrsShortTermStability, fsrsRetention,
  fsrsDifficulty, fsrsLapseStability, fsrsSuccessStability, fsrsInterval
});
const { markCardDueNow } = await import('../src/sched.mjs');

const NOW = Date.now(); // 以当前时间为基准，「未到期 / 已到期」判定在任何运行时刻都稳定

// 注入确定性随机源：循环取序列（用于可复现地验证随机出题）
function seqRnd(seq) {
  let i = 0;
  return function () { const v = seq[i % seq.length]; i++; return v; };
}
function mkEntry(id, cat, diff, mastery) {
  return { id: id, cat: cat, diff: diff, mastery: mastery, label: 'L-' + id, prompt: 'P-' + id };
}
// 8 张候选：4 张「经济学」/4 张「统计学」，难度 1–8，掌握度 10–80
const ENTRIES = [
  mkEntry('e1', '经济学', 1, 10), mkEntry('e2', '经济学', 3, 30),
  mkEntry('e3', '经济学', 5, 50), mkEntry('e4', '经济学', 8, 80),
  mkEntry('s1', '统计学', 2, 20), mkEntry('s2', '统计学', 4, 40),
  mkEntry('s3', '统计学', 6, 60), mkEntry('s4', '统计学', 7, 70)
];

test('常量与默认配置（阈值/边界对外可见）', () => {
  assert.equal(sandbox.QUIZ_WEAK_ACC, 60, '表现差阈值必须是 60%');
  assert.equal(sandbox.QUIZ_MAX_COUNT, 50);
  assert.equal(sandbox.QUIZ_DEFAULT_COUNT, 10);
  assert.equal(sandbox.QUIZ_DIFF_MIN, 1);
  assert.equal(sandbox.QUIZ_DIFF_MAX, 10);
  assert.equal(sandbox.QUIZ_DEFAULT_DIFF, 5);
  assert.equal(sandbox.QUIZ_UNCATED, '未关联');
  assert.deepEqual(clean(sandbox.quizDefaultConfig()), { count: 10, cats: [], diff: [1, 10], mastery: [0, 100] });
});

test('配置净化：四维边界校验（越界夹取 / 非法回落 / 上下限自动交换）', () => {
  const S = (r, allCats) => clean(sandbox.quizSanitizeConfig(r, allCats));

  // 默认与非法输入
  assert.deepEqual(S(undefined), { count: 10, cats: [], diff: [1, 10], mastery: [0, 100] });
  assert.deepEqual(S(null), { count: 10, cats: [], diff: [1, 10], mastery: [0, 100] });
  assert.deepEqual(S({}), { count: 10, cats: [], diff: [1, 10], mastery: [0, 100] });
  assert.deepEqual(S('nonsense'), { count: 10, cats: [], diff: [1, 10], mastery: [0, 100] });

  // 数量 1–50，非法值回落默认 10，小数四舍五入
  assert.equal(S({ count: 0 }).count, 1);
  assert.equal(S({ count: -5 }).count, 1);
  assert.equal(S({ count: 999 }).count, 50);
  assert.equal(S({ count: 12.4 }).count, 12);
  assert.equal(S({ count: 'abc' }).count, 10);
  assert.equal(S({ count: NaN }).count, 10);
  assert.equal(S({ count: 3 }).count, 3);

  // 难度 1–10
  assert.deepEqual(S({ diff: [3, 99] }).diff, [3, 10]);
  assert.deepEqual(S({ diff: [-5, 4] }).diff, [1, 4]);
  assert.deepEqual(S({ diff: [8, 2] }).diff, [2, 8], '下限大于上限自动交换');
  assert.deepEqual(S({ diff: [null, undefined] }).diff, [1, 10]);
  assert.deepEqual(S({ diff: 'x' }).diff, [1, 10]);

  // 掌握度 0–100
  assert.deepEqual(S({ mastery: [-20, 300] }).mastery, [0, 100]);
  assert.deepEqual(S({ mastery: [70, 30] }).mastery, [30, 70]);
  assert.deepEqual(S({ mastery: [55, 55] }).mastery, [55, 55]);

  // 章节：未知章节丢弃、重复去重、非字符串丢弃；不给 allCats 时只做类型/去重校验
  const all = ['经济学', '统计学'];
  assert.deepEqual(S({ cats: ['经济学', '不存在', '经济学', 7, null, '统计学'] }, all).cats, ['经济学', '统计学']);
  assert.deepEqual(S({ cats: ['经济学', '不存在'] }).cats, ['经济学', '不存在']);
  assert.deepEqual(S({ cats: '经济学' }).cats, []);

  // 四维一起越界
  assert.deepEqual(S({ count: 100, cats: ['经济学'], diff: [0, 12], mastery: [-1, 101] }, all),
    { count: 50, cats: ['经济学'], diff: [1, 10], mastery: [0, 100] });
});

test('quizClampNum / quizSanitizeRange 基本行为', () => {
  assert.equal(sandbox.quizClampNum(5, 1, 10, 3), 5);
  assert.equal(sandbox.quizClampNum(0, 1, 10, 3), 1);
  assert.equal(sandbox.quizClampNum(11, 1, 10, 3), 10);
  assert.equal(sandbox.quizClampNum('7', 1, 10, 3), 7);
  assert.equal(sandbox.quizClampNum('x', 1, 10, 3), 3);
  assert.deepEqual(clean(sandbox.quizSanitizeRange([2, 5], 1, 10, [1, 10])), [2, 5]);
  assert.deepEqual(clean(sandbox.quizSanitizeRange([2], 1, 10, [4, 6])), [2, 6]);
});

test('候选筛选：章节 / 难度 / 掌握度三段都命中才留在池子里', () => {
  const cfg = (c) => sandbox.quizSanitizeConfig(c, []);
  const ids = (c) => Array.from(sandbox.quizFilterEntries(ENTRIES, cfg(c))).map((e) => e.id);

  assert.equal(ids({ count: 8 }).length, 8, '默认范围（空章节=全部）覆盖所有候选');
  assert.deepEqual(ids({ count: 8, cats: ['经济学'] }), ['e1', 'e2', 'e3', 'e4']);
  assert.deepEqual(ids({ count: 8, cats: ['经济学', '统计学'] }).length, 8);
  assert.deepEqual(ids({ count: 8, diff: [5, 6] }), ['e3', 's3'], '难度区间含端点');
  assert.deepEqual(ids({ count: 8, mastery: [50, 70] }), ['e3', 's3', 's4'], '掌握度区间含端点');
  assert.deepEqual(ids({ count: 8, cats: ['统计学'], diff: [4, 8], mastery: [50, 70] }), ['s3', 's4']);
  assert.deepEqual(ids({ count: 8, cats: ['统计学'], diff: [1, 3] }), ['s1']);

  // 缺 diff 的候选按默认 D=5 参与筛选（口径统一）
  const noDiff = [{ id: 'x1', cat: '经济学', mastery: 0 }];
  assert.deepEqual(Array.from(sandbox.quizFilterEntries(noDiff, cfg({ diff: [5, 5] }))).map((e) => e.id), ['x1']);
  assert.deepEqual(Array.from(sandbox.quizFilterEntries(noDiff, cfg({ diff: [6, 10] }))).map((e) => e.id), []);

  // 脏数据不炸：无 id 的候选直接丢弃
  assert.deepEqual(Array.from(sandbox.quizFilterEntries([{ cat: '经济学' }, null, ENTRIES[0]], cfg({}))).map((e) => e.id), ['e1']);
  assert.deepEqual(Array.from(sandbox.quizFilterEntries(null, cfg({}))), []);
});

test('「配置 → 出题队列」纯函数：数量 / 干扰项 / 不重复 / 池子不足', () => {
  const cfg = (c) => sandbox.quizSanitizeConfig(c, []);
  const built = sandbox.quizBuildQueue(ENTRIES, cfg({ count: 3 }), seqRnd([0.1, 0.4, 0.7, 0.2, 0.9, 0.3]), ENTRIES);

  assert.equal(built.qs.length, 3, '按配置数量出题');
  assert.equal(built.poolSize, 8);
  assert.equal(built.totalSize, 8);

  const ids = Array.from(built.qs).map((q) => q.id);
  assert.equal(new Set(ids).size, ids.length, '同一场自测不重复出同一题');

  Array.from(built.qs).forEach((q) => {
    const opts = Array.from(q.opts);
    assert.equal(opts.length, 4, '每题 1 正确 + 3 干扰');
    assert.equal(new Set(opts.map((o) => o.id)).size, 4, '选项互不重复');
    assert.ok(opts.some((o) => o.id === q.id), '选项里必须含正确答案');
    assert.equal(opts.filter((o) => o.id === q.id)[0].label, q.label, '正确答案用题干对象的 label');
    assert.equal(typeof q.prompt, 'string');
    assert.equal(typeof q.mastery, 'number');
    assert.equal(typeof q.diff, 'number');
  });

  // 全部候选都满足四维条件
  const filtered = sandbox.quizBuildQueue(ENTRIES, cfg({ count: 50, cats: ['统计学'], diff: [4, 8], mastery: [50, 70] }), Math.random, ENTRIES);
  assert.equal(filtered.qs.length, 2, '池子不足时按实际数量出题');
  Array.from(filtered.qs).forEach((q) => {
    assert.equal(q.cat, '统计学');
    assert.ok(q.diff >= 4 && q.diff <= 8);
    assert.ok(q.mastery >= 50 && q.mastery <= 70);
  });

  // 干扰项优先取自同一筛选池：池里只有 2 张时，仍从更大的 fallback 补足到 4 个选项
  const small = [ENTRIES[0]];
  const lone = sandbox.quizBuildQueue(small, cfg({ count: 1 }), seqRnd([0.5]), ENTRIES);
  assert.equal(lone.qs.length, 1);
  assert.equal(Array.from(lone.qs)[0].opts.length, 4, '池子不足时从全量候选补干扰项');

  // 池子空 → 不出题（UI 会提示放宽范围）
  const empty = sandbox.quizBuildQueue(ENTRIES, cfg({ count: 5, cats: ['不存在的章节'] }), Math.random, ENTRIES);
  assert.equal(empty.qs.length, 0);
  assert.equal(empty.poolSize, 0);

  // 单个候选且没有 fallback → 只有 1 个选项也不崩
  const solo = sandbox.quizBuildQueue([ENTRIES[1]], cfg({ count: 3 }), Math.random, []);
  assert.equal(solo.qs.length, 1);
  assert.equal(Array.from(solo.qs)[0].opts.length, 1);

  // 确定性随机源 → 结果可复现（同一 seed 两次构建一致）
  const r1 = sandbox.quizBuildQueue(ENTRIES, cfg({ count: 4 }), seqRnd([0.3, 0.6]), ENTRIES);
  const r2 = sandbox.quizBuildQueue(ENTRIES, cfg({ count: 4 }), seqRnd([0.3, 0.6]), ENTRIES);
  assert.deepEqual(clean(Array.from(r1.qs).map((q) => [q.id, Array.from(q.opts).map((o) => o.id)])),
    clean(Array.from(r2.qs).map((q) => [q.id, Array.from(q.opts).map((o) => o.id)])));
});

test('quizShuffle 不改原数组', () => {
  const arr = [1, 2, 3, 4, 5];
  const out = Array.from(sandbox.quizShuffle(arr, seqRnd([0.2, 0.8])));
  assert.deepEqual(arr, [1, 2, 3, 4, 5]);
  assert.deepEqual(out.slice().sort((x, y) => x - y), [1, 2, 3, 4, 5]);
});

test('表现差判定：单题答错必入队；整场正确率 < 60% 时整场入队（阈值边界）', () => {
  const ans = (id, ok) => ({ id: id, ok: ok, cat: '经济学', mastery: 50, predicted: 50, ms: 1000, label: 'L' + id });
  const four = [ans('a', true), ans('b', true), ans('c', false), ans('d', true), ans('e', false)];

  // 正确率 60%（3/5）→ 只有错题入队（阈值含端点，不算「表现差」整场）
  assert.deepEqual(clean(sandbox.quizWeakIds(four, 60)), ['c', 'e']);
  assert.deepEqual(clean(sandbox.quizWeakIds(four, 61)), ['c', 'e']);

  // 正确率 59%（< 60%）→ 整场入队（含答对的题）
  assert.deepEqual(clean(sandbox.quizWeakIds(four, 59)), ['a', 'b', 'c', 'd', 'e']);
  assert.deepEqual(clean(sandbox.quizWeakIds(four, 0)), ['a', 'b', 'c', 'd', 'e']);

  // pct 缺失/非法 → 只按错题判定
  assert.deepEqual(clean(sandbox.quizWeakIds(four, null)), ['c', 'e']);
  assert.deepEqual(clean(sandbox.quizWeakIds(four, undefined)), ['c', 'e']);

  // 全对 → 不入队；空输入不炸
  assert.deepEqual(clean(sandbox.quizWeakIds([ans('a', true), ans('b', true)], 100)), []);
  assert.deepEqual(clean(sandbox.quizWeakIds([], 0)), []);
  assert.deepEqual(clean(sandbox.quizWeakIds(null, 0)), []);
  assert.deepEqual(clean(sandbox.quizWeakIds([null, { ok: false }, ans('z', false)], 90)), ['z'], '缺 id 的脏数据丢弃');
});

test('报告：成绩 / 章节表现 / 用时 / 与预测掌握度的差距 四项齐全', () => {
  const answers = [
    { id: 'e1', cat: '经济学', ok: true, mastery: 40, predicted: 60, ms: 20000, label: 'L-e1' },
    { id: 'e2', cat: '经济学', ok: false, mastery: 60, predicted: 80, ms: 40000, label: 'L-e2' },
    { id: 's1', cat: '统计学', ok: true, mastery: 20, predicted: null, ms: 30000, label: 'L-s1' }
  ];
  const rep = clean(sandbox.quizBuildReport({ mode: 'cards', answers: answers, correct: 2, ms: 90000 }));

  // ① 成绩
  assert.equal(rep.total, 3);
  assert.equal(rep.correct, 2);
  assert.equal(rep.pct, 67);
  assert.equal(rep.verdict, '及格');

  // ② 章节表现（按首次出现顺序，含题数与正确率）
  assert.deepEqual(rep.byCat, [
    { cat: '经济学', n: 2, ok: 1, pct: 50 },
    { cat: '统计学', n: 1, ok: 1, pct: 100 }
  ]);

  // ③ 用时
  assert.equal(rep.ms, 90000);
  assert.equal(rep.msAvg, 30000);

  // ④ 与预测掌握度的差距：预测 = 本组题平均掌握度；predictedR 只统计有 R 的卡片
  assert.equal(rep.predicted, 40);
  assert.equal(rep.predictedR, 70);
  assert.equal(rep.gap, 27);

  // 表现差清单与入队前状态
  assert.deepEqual(rep.weakIds, ['e2'], '67% ≥ 60%：只有错题');
  assert.equal(rep.mode, 'cards');
});

test('报告：成绩档位 / 空场次 / 预测差距符号 / 整场表现差', () => {
  const mk = (n, okCount, mastery) => {
    const list = [];
    for (let i = 0; i < n; i++) list.push({ id: 'q' + i, cat: '经济学', ok: i < okCount, mastery: mastery, predicted: mastery, ms: 10000, label: 'L' + i });
    return list;
  };
  const V = (n, ok, mastery) => clean(sandbox.quizBuildReport({ answers: mk(n, ok, mastery), ms: n * 10000 }));

  assert.equal(V(10, 10, 0).verdict, '优秀');
  assert.equal(V(10, 9, 0).verdict, '优秀');
  assert.equal(V(100, 89, 0).verdict, '良好');
  assert.equal(V(100, 75, 0).verdict, '良好');
  assert.equal(V(100, 74, 0).verdict, '及格');
  assert.equal(V(100, 60, 0).verdict, '及格');
  assert.equal(V(100, 59, 0).verdict, '待加强');

  // 整场 < 60% → weakIds = 全部题（含答对的）
  const weakAll = V(5, 2, 50);
  assert.equal(weakAll.pct, 40);
  assert.deepEqual(weakAll.weakIds, ['q0', 'q1', 'q2', 'q3', 'q4']);

  // 实际高于预测 → 正差距；低于预测 → 负差距
  assert.equal(V(4, 4, 50).gap, 50);
  assert.equal(V(4, 0, 80).gap, -80);

  // 空场次不炸（避免「一题都没答就收尾」这类边界崩页面）
  const empty = clean(sandbox.quizBuildReport({ answers: [], ms: 0 }));
  assert.equal(empty.total, 0);
  assert.equal(empty.pct, 0);
  assert.equal(empty.gap, 0);
  assert.equal(empty.verdict, '—');
  assert.deepEqual(empty.byCat, []);
  assert.equal(empty.predictedR, null);
  assert.deepEqual(empty.weakIds, []);
  assert.equal(clean(sandbox.quizBuildReport(null)).total, 0);
});

test('错题候选：题面给题目、选项给解析；章节由关联知识点映射，未关联单列一桶', () => {
  const data = [{ id: 'k1', cat: '经济学', title: '需求定理', back: 'P1' }, { id: 'k2', cat: '统计学', title: '大数定律', back: 'P2' }];
  const wrongs = {
    w1: { q: '题目一', a: '解析一', linked: ['k1'], diff: 3, state: 'review', stab: 10, lastR: NOW },
    w2: { q: '题目二', a: '解析二', linked: ['k2'] },
    w3: { q: '题目三', a: '解析三', linked: ['不存在'] },
    w4: { q: '题目四', a: '', linked: [] }
  };
  const out = clean(sandbox.quizWrongCandidates(wrongs, data, (wid) => wid === 'w1' ? 42 : 7, (w) => (w.state === 'review' && typeof w.stab === 'number') ? 88 : 0));

  assert.equal(out.length, 4);
  const by = (id) => out.filter((e) => e.id === id)[0];
  assert.equal(by('w1').prompt, '题目一');
  assert.equal(by('w1').label, '解析一');
  assert.equal(by('w1').cat, '经济学');
  assert.equal(by('w1').diff, 3);
  assert.equal(by('w1').mastery, 42);
  assert.equal(by('w1').predicted, 88);
  assert.equal(by('w2').cat, '统计学');
  assert.equal(by('w2').diff, 5, '未进入排期的错题按默认 D=5');
  assert.equal(by('w3').cat, '未关联', '关联的知识点不存在 → 未关联桶');
  assert.equal(by('w4').cat, '未关联');
  assert.equal(by('w4').label, '（无解析）');
  assert.equal(by('w4').mastery, 7);

  assert.deepEqual(clean(sandbox.quizWrongCandidates(null, data)), []);
  assert.deepEqual(clean(sandbox.quizWrongCandidates({ w9: { q: 'q', a: 'a' } }, null)), [{ id: 'w9', label: 'a', prompt: 'q', cat: '未关联', diff: 5, mastery: 0, predicted: 0 }]);
});

test('错题自测端到端（纯函数链路）：按错题范围配置 → 出题队列 → 报告', () => {
  const data = [{ id: 'k1', cat: '经济学' }, { id: 'k2', cat: '统计学' }];
  const wrongs = {
    w1: { q: '题目一', a: '解析一', linked: ['k1'], diff: 3 },
    w2: { q: '题目二', a: '解析二', linked: ['k1'], diff: 4 },
    w3: { q: '题目三', a: '解析三', linked: ['k2'], diff: 8 },
    w4: { q: '题目四', a: '解析四', linked: [], diff: 5 }
  };
  const cfgs = sandbox.quizSanitizeConfig;
  const entries = sandbox.quizWrongCandidates(wrongs, data, () => 40, () => 0);

  // 只选「经济学」章节 → 只出该章节错题
  const built = sandbox.quizBuildQueue(entries, cfgs({ count: 10, cats: ['经济学'] }, []), seqRnd([0.2, 0.7]), entries);
  assert.deepEqual(clean(Array.from(built.qs).map((q) => q.id)).sort(), ['w1', 'w2']);
  assert.equal(built.poolSize, 2);
  Array.from(built.qs).forEach((q) => {
    assert.equal(q.cat, '经济学');
    assert.ok(Array.from(q.opts).some((o) => o.id === q.id));
    assert.ok(Array.from(q.opts).length >= 2);
  });

  // 「未关联」桶 + 难度范围：只要 D=5 的那道
  const mis = sandbox.quizBuildQueue(entries, cfgs({ count: 10, cats: ['未关联'], diff: [5, 5] }, []), seqRnd([0.5]), entries);
  assert.deepEqual(clean(Array.from(mis.qs).map((q) => q.id)), ['w4']);

  // 同一报告结构用于错题场次（mode='wrong'），章节表现里出现「未关联」
  const answers = [
    { id: 'w1', cat: '经济学', ok: true, mastery: 40, predicted: 0, ms: 5000, label: '解析一' },
    { id: 'w4', cat: '未关联', ok: false, mastery: 40, predicted: 0, ms: 7000, label: '解析四' }
  ];
  const rep = clean(sandbox.quizBuildReport({ mode: 'wrong', answers: answers, correct: 1, ms: 12000 }));
  assert.equal(rep.mode, 'wrong');
  assert.equal(rep.pct, 50);
  assert.deepEqual(rep.byCat, [
    { cat: '经济学', n: 1, ok: 1, pct: 100 },
    { cat: '未关联', n: 1, ok: 0, pct: 0 }
  ]);
  assert.deepEqual(rep.weakIds, ['w1', 'w4'], '正确率 50% < 60% → 整场入队（错题侧同样口径）');
});

test('知识卡候选（纯）：题面给内容、选项给名称；缺 R 记 0', () => {
  const data = [{ id: 'k1', cat: '经济学', title: '需求定理', back: '公式一' }, { id: 'k2', cat: '统计学', title: '大数定律', back: '公式二' }];
  const out = clean(sandbox.quizCardCandidates(data, (id) => ({ diff: id === 'k1' ? 2 : undefined }), (id) => id === 'k1' ? 33 : 0, (id) => id === 'k2' ? null : 78));
  assert.equal(out[0].label, '需求定理');
  assert.equal(out[0].prompt, '公式一');
  assert.equal(out[0].diff, 2);
  assert.equal(out[0].mastery, 33);
  assert.equal(out[0].predicted, 78);
  assert.equal(out[1].diff, 5, '没有排期卡 → 默认 D=5');
  assert.equal(out[1].predicted, 0, '没有 R（未进入 review）→ 0');
  assert.deepEqual(clean(sandbox.quizCardCandidates(null, null, null, null)), []);
});

test('统计聚合：自测次数 / 题数 / 正确率 / 用时 / 表现差入队（含来源分类与窗口过滤）', () => {
  const recs = [
    { t: 1000, mode: 'cards', total: 10, correct: 8, pct: 80, ms: 600000, weak: ['a'], queued: ['a'] },
    { t: 3000, mode: 'wrong', total: 5, correct: 1, pct: 20, ms: 300000, weak: ['b', 'c'], queued: ['b'] },
    { t: 2000, mode: 'cards', total: 4, correct: 4, pct: 100, ms: 120000, weak: [], queued: [] }
  ];
  const all = clean(sandbox.quizLogStats(recs, 0));
  assert.equal(all.n, 3);
  assert.equal(all.totalQ, 19);
  assert.equal(all.correctQ, 13);
  assert.equal(all.acc, 68);
  assert.equal(all.ms, 1020000);
  assert.equal(all.msAvg, 53684);
  assert.equal(all.weak, 3);
  assert.equal(all.queued, 2);
  assert.deepEqual(all.list.map((r) => r.t), [1000, 2000, 3000], '按时间升序');
  assert.equal(all.last.t, 3000);
  assert.equal(all.byMode.cards.n, 2);
  assert.equal(all.byMode.cards.total, 14);
  assert.equal(all.byMode.cards.correct, 12);
  assert.equal(all.byMode.cards.ms, 720000);
  assert.equal(all.byMode.wrong.n, 1);
  assert.equal(all.byMode.wrong.total, 5);

  // 窗口过滤（学习报告的日/周/月/年口径复用）
  const win = clean(sandbox.quizLogStats(recs, 2500));
  assert.equal(win.n, 1);
  assert.equal(win.totalQ, 5);
  assert.equal(win.byMode.wrong.n, 1);

  // 脏数据与空输入
  assert.equal(clean(sandbox.quizLogStats([null, { mode: 'cards' }, { t: NaN }, recs[0]], 0)).n, 1);
  const empty = clean(sandbox.quizLogStats([], 0));
  assert.equal(empty.n, 0);
  assert.equal(empty.acc, null);
  assert.equal(empty.msAvg, 0);
  assert.equal(empty.last, null);
  assert.equal(clean(sandbox.quizLogStats(null, 0)).n, 0);
});

test('表现差 → 入队：走既有「提前复习」接口（markCardDueNow），只提前到期时间', () => {
  const mkCard = (extra) => Object.assign({
    state: 'review', step: 0, reps: 5, ivl: 21, lapses: 2, grad: 1, diff: 6.4, stab: 42.5,
    fsrsInit: 1, due: NOW + 21 * 86400000, lastR: NOW - 3 * 86400000, hist: [1, 2, 3], linked: ['k1']
  }, extra || {});
  const future = mkCard({});
  const fresh = mkCard({ state: 'new', due: 0, stab: 0, lastR: 0 });
  const overdue = mkCard({ due: NOW - 86400000 });
  const table = { due1: future, fresh1: fresh, overdue1: overdue };
  const before = { due1: JSON.stringify(future), fresh1: JSON.stringify(fresh), overdue1: JSON.stringify(overdue) };

  // 表现差清单里混入不存在的 id：不能崩，计入 skipped
  const res = clean(sandbox.quizEnqueue(['due1', 'fresh1', 'overdue1', 'missing'], (id) => table[id], markCardDueNow));

  assert.deepEqual(res.queued, ['due1'], '只有「已排期且未到期」的卡需要提前');
  assert.deepEqual(res.skipped, ['fresh1', 'overdue1', 'missing'], '新卡/已到期/不存在 → 无需提前');

  // 到期时间被提前到现在；其余记忆字段逐字节不变
  assert.ok(future.due <= Date.now(), '到期时间提前到现在');
  assert.equal(JSON.stringify(fresh), before.fresh1, '新卡一个字段都不写');
  assert.equal(JSON.stringify(overdue), before.overdue1, '已到期卡一个字段都不写');
  const after = JSON.parse(JSON.stringify(future));
  const pre = JSON.parse(before.due1);
  delete after.due; delete pre.due;
  assert.deepEqual(after, pre, '除 due 外 13 个字段逐项不变（不重置记忆历史）');
  assert.deepEqual(after.hist, [1, 2, 3]);
  assert.deepEqual(after.linked, ['k1']);

  // 接口自身幂等：同一张卡再入队一次不重复改动、也不报错
  const again = clean(sandbox.quizEnqueue(['due1'], (id) => table[id], markCardDueNow));
  assert.deepEqual(again.queued, [], '已提前到期的卡第二次调用不再改动（幂等）');
  assert.deepEqual(again.skipped, ['due1']);
});

test('源码契约：quiz.mjs 不能出现 export（不在构建 STRIP 集合内），也不自行写 due', () => {
  const buildSrc = fs.readFileSync(path.join(root, 'tools/build.mjs'), 'utf8');
  const m = buildSrc.match(/STRIP\s*=\s*new Set\(\[([\s\S]*?)\]\)/);
  const strippedList = m ? m[1] : '';
  const isStripped = /['"]quiz\.mjs['"]/.test(strippedList);
  if (!isStripped) {
    assert.ok(!/^[ \t]*export[ \t]/m.test(src),
      'quiz.mjs 不在 tools/build.mjs 的 STRIP 集合内：出现 export 会让浏览器端 app.js 直接 SyntaxError');
  }
  assert.ok(!/\.due\s*=[^=]/.test(src),
    'quiz.mjs 不得自行改到期时间：提前复习只能用 sched.mjs 的 markCardDueNow');
  assert.ok(/markCardDueNow/.test(src), '入队必须调用既有「提前复习」接口');
  assert.ok(src.indexOf(BEGIN) >= 0 && src.indexOf(END) > src.indexOf(BEGIN), '标记块必须保留（单测靠它抽取）');
});

test('新存储键写入口径：DB.log.quiz 与 DB.log.counts[日].q（记录上限 200）', () => {
  // 记录条数上限常量为 200：超出部分从头裁剪（防止 log 无限增长）
  assert.equal(sandbox.QUIZ_MAX_RECORDS, 200);
  // quizSaveRecord 依赖 DB/todayStr/saveDB，属浏览器侧适配层——这里只做源码级契约校验
  assert.ok(/DB\.log\.quiz/.test(src), '自测记录写入 DB.log.quiz');
  assert.ok(/counts\[t\]\.q/.test(src), '每日自测题数写入 DB.log.counts[日].q');
  assert.ok(/DB\.settings\.quizCfg|quizCfgStore/.test(src), '四维配置按来源持久化到 settings.quizCfg');
});