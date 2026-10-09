import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = (p) => readFileSync(path.join(ROOT, p), 'utf8');

// bank.mjs 在浏览器里与其它模块拼接进同一 IIFE（共享 store.mjs 的 window.SUBJECTS、
// wrong.mjs 的 markAsWrong、learn.mjs 的 el/texEl/toast）；单测时把 window 与知识点数据
// 注入隔离 vm，只加载 bank.mjs 的 TESTABLE 纯函数块——避免把整个模块的 DOM 依赖拖进来。
const BLOCK = /\/\/ ===== BEGIN TESTABLE bank-helpers =====([\s\S]*?)\/\/ ===== END TESTABLE bank-helpers =====/;
const blockBody = read('src/bank.mjs').match(BLOCK);
assert.ok(blockBody, 'src/bank.mjs 缺少 TESTABLE bank-helpers 块（单测契约）');

const sandbox = { window: {}, String, Math, console, Number, Object, Array, DB: {} };
vm.createContext(sandbox);
// 先加载三科知识点数据（题库 tags 必须命中这些 id），再加载题库数据
for (const f of ['math3.js', 'econ.js', 'stats.js']) {
  vm.runInContext(read('data/' + f), sandbox, { filename: f });
}
for (const f of ['bank_math3.js', 'bank_econ.js', 'bank_stats.js']) {
  vm.runInContext(read('data/' + f), sandbox, { filename: f });
}
const exposed = ['bankStarLevel', 'bankStars', 'bankTypeStars', 'bankTypeFrequency', 'bankTagCat', 'bankTagTitle', 'bankMatch', 'bankAllQuestions', 'bankSameQuestion', 'bankLookupWrongEntry', 'bankWrongState', 'bankFilteredQuestions', 'bankCurrentFilter', 'bankTypeSelected', 'bankSubjectTotals', 'bankSubjectTotal', 'bankSubjectTypeCount', 'bankHitText', 'bankScopeText', 'bankCurrentSubjectId', 'bankNormalizeTypeFilter', 'bankTypeOptions', 'bankTagRanking', 'bankTagOptions', 'bankTagOptionHidden', 'bankStarOptions', 'bankSelectValue', 'bankSchoolLabel'];
// 筛选会话状态声明在 learn.mjs（同一 IIFE 作用域），单测注入等价初值才能驱动筛选逻辑；
// bank.mjs 自身不得声明这些变量（见「导航接线」用例，重复声明会抛语法错误）。
// currentSubjectId 声明在 src/app.mjs（全局学科选择器）：t17 起题库范围恒等于它（不再是页内 bankSubject）。
const stateVars = "var bankType = 'all', bankTag = 'all', bankStar = 'all', bankQuery = '', bankOpen = null, bankOnlyWrong = false, currentSubjectId = 'math3';";
// 常量表与题型取名助手在 TESTABLE 块之外（不属于纯函数块），单测需要一并注入
const bankSrc = read('src/bank.mjs');
const consts = [
  bankSrc.match(/var BANK_SUBJECT_META = \{[\s\S]*?\n\};/)[0],
  bankSrc.match(/var BANK_SUBJECT_ORDER = \[[^\]]*\];/)[0],
  bankSrc.match(/function bankTypeName\(subjectId, typeKey\) \{[\s\S]*?\n\}/)[0]
].join('\n');
sandbox.exports = {};
vm.runInContext(
  stateVars + '\n' + consts + '\n' + blockBody[1] +
  '\nObject.assign(exports, {' + exposed.join(', ') + '});',
  sandbox,
  { filename: 'bank-helpers.js' }
);
const B = sandbox.exports;
const BANK = sandbox.window.BANK;
const SUBJECTS = sandbox.window.SUBJECTS;

const BANKS = ['math3', 'econ', 'stats'];

// ---------------------------------------------------------- 期望值一律从数据派生（t25）
// t19 逐题溯源审计后：移除 m3-2019-6（题干实为 2013 年第 5 题、题源标注不实）与 m3-2019-13
// （矩阵元素在来源文字层不可还原）→ math3 14 / econ 15 / stats 16 = 45，
// 依据 backup/scratch/bank-audit/audit.md §1（汇总）与 §2（逐题核验表）。
// t27 补充：2023/2024/2025 三年选择题 9 道经 read_image 转写 + 网络双源核对后入库 →
// math3 23 / econ 15 / stats 16 = 54，依据 backup/scratch/bank-vision/audit-vision.md。
// t30 补充：2025 年第 3 题（级数敛散性判别）补入，并新增 math3 的 series 题型键 →
// math3 24 / econ 15 / stats 16 = 55，依据 backup/scratch/bank-fix2/（读图裁片 + 三源核对）。
// 因此本文件不再硬编码 16/47 之类的分布数字，一律用下面的派生函数从 data/bank_*.js 现算；
// 只保留「不得低于已入库量」的护栏，避免题量悄悄失守（下限是护栏，不是对现实的固定描述）。
const MIN_QUESTIONS = { math3: 24, econ: 15, stats: 15 };
const MIN_TOTAL = 55;
// 题型定义来自 t4 的题型体系表（数学三 10 / 微观 6 / 统计 6）；t27 为「积分与变限积分」新增 math3 的
// integral 键（11 类）、t30 为「级数敛散性判别」新增 series 键（12 类）。下表同为「护栏」而非对现实的
// 固定描述：题型被误删时立刻转红。
const MIN_TYPES = { math3: 12, econ: 6, stats: 6 };
const qCount = (sid) => BANK[sid].questions.length; // 各科题量（数据文件真值）
const typeCount = (sid) => BANK[sid].types.length; // 各科题型数（数据文件真值）
const TOTAL_Q = () => BANKS.reduce((n, sid) => n + qCount(sid), 0); // 全库题量合计
const typeHit = (sid, type) => BANK[sid].questions.filter((q) => q.type === type).length;
const typeStarHit = (sid, type, star) => BANK[sid].questions.filter((q) => q.type === type && q.star >= star).length;
const starHitIn = (sid, star) => BANK[sid].questions.filter((q) => q.star >= star).length;
const tagHitIn = (sid, tag) => BANK[sid].questions.filter((q) => (q.tags || []).indexOf(tag) >= 0).length;
// 知识点下拉上限来自 bank.mjs 的常量（避免测试与实现各写一份 60）
const TAG_LIMIT = Number(read('src/bank.mjs').match(/var BANK_TAG_OPTION_LIMIT = (\d+);/)[1]);

// ------------------------------------------------ 视图层 harness（真渲染，非源码字符串断言）
// t17 起题库页的骨架（三组下拉、徽标、空状态）由视图函数决定，所以把整个 src/bank.mjs（去掉
// export 块）放进第二个 vm，配最小 DOM 桩 + 语义对齐 src/actions.mjs `case 'bankFilter'` 的
// handleAction，就能断言「渲染出来的树」而不是「源码里有没有某段字符串」。
function mkNode() {
  const node = {
    tag: '', className: '', children: [], attrs: {}, text: '', value: '', _handlers: {},
    setAttribute(k, v) { this.attrs[k] = String(v); if (k === 'class') this.className = String(v); },
    getAttribute(k) { return Object.prototype.hasOwnProperty.call(this.attrs, k) ? this.attrs[k] : null; },
    appendChild(c) { this.children.push(c); return c; },
    addEventListener(t, h) { (this._handlers[t] = this._handlers[t] || []).push(h); },
    removeEventListener() {},
    fire(type) { for (const h of (this._handlers[type] || [])) h(); },
    get textContent() { return this.text; },
    set textContent(v) { this.text = String(v); this.children = []; },
    get innerHTML() { return this.text; },
    set innerHTML(v) { this.text = String(v); this.children = []; }
  };
  return node;
}
const mkEl = (tag, cls, text) => {
  const n = mkNode();
  n.tag = tag;
  n.className = cls || '';
  if (text !== undefined && text !== null) n.text = String(text);
  return n;
};
const walkTree = (node, fn) => { fn(node); for (const c of node.children) walkTree(c, fn); };
const byClass = (root, cls) => {
  const out = [];
  walkTree(root, (n) => { if (String(n.className || '').split(/\s+/).indexOf(cls) >= 0) out.push(n); });
  return out;
};
const byTag = (root, tag) => { const out = []; walkTree(root, (n) => { if (n.tag === tag) out.push(n); }); return out; };
const treeText = (node) => (node.text || '') + node.children.map(treeText).join('');

const appEl = mkEl('div', 'app');
const view = { window: {}, String, Math, console, Number, Object, Array, DB: {} };
vm.createContext(view);
view.document = {
  getElementById: (id) => (id === 'app' ? appEl : null),
  createElement: (t) => mkEl(t, ''),
  createElementNS: () => mkEl('svg', '')
};
view.el = mkEl;
view.texEl = mkEl;
view.icon = (name) => { const n = mkEl('svg', 'ui-icon'); n.setAttribute('data-icon', name); return n; };
view.toast = () => {};
view.window.__actions = [];
for (const f of ['math3.js', 'econ.js', 'stats.js', 'bank_math3.js', 'bank_econ.js', 'bank_stats.js']) {
  vm.runInContext(read('data/' + f), view, { filename: f });
}
// 会话状态 + renderApp + handleAction：语义对齐 src/actions.mjs 的 case 'bankFilter'（只认
// type= / tag= / star=，未知 key（含已下线的 typeStar=）静默忽略且不抛错）与 case 'bankReset'
vm.runInContext(
  "var bankType = 'all', bankTag = 'all', bankStar = 'all', bankQuery = '', bankOpen = null, currentSubjectId = 'math3';\n" +
  'function renderApp() { renderBank(); }\n' +
  'function handleAction(action, arg) {\n' +
  '  window.__actions.push([action, arg]);\n' +
  '  if (action === \'bankReset\') {\n' +
  "    bankType = 'all'; bankTag = 'all'; bankStar = 'all'; bankQuery = ''; bankOpen = null; toast('已重置题库筛选');\n" +
  '    renderApp(); return;\n' +
  '  }\n' +
  "  var eq = String(arg == null ? '' : arg).indexOf('=');\n" +
  '  if (eq > 0) {\n' +
  '    var k = String(arg).slice(0, eq), v = String(arg).slice(eq + 1);\n' +
  "    if (k === 'type') bankType = v; else if (k === 'tag') bankTag = v; else if (k === 'star') bankStar = v;\n" +
  '  }\n' +
  '  bankOpen = null;\n' +
  '  renderApp();\n' +
  '}',
  view,
  { filename: 'bank-session.js' }
);
vm.runInContext(read('src/bank.mjs').replace(/export \{[\s\S]*?\};\s*$/, ''), view, { filename: 'bank-app.js' });

// 渲染：设置全局学科与会话筛选后再渲染（返回清空重建后的 #app 子树）
const renderTree = (sid, code) => {
  vm.runInContext(
    'currentSubjectId = ' + JSON.stringify(sid) + "; bankType = 'all'; bankTag = 'all'; bankStar = 'all'; bankQuery = ''; bankOpen = null;",
    view
  );
  if (code) vm.runInContext(code, view);
  vm.runInContext('renderBank()', view);
  return appEl;
};
const viewState = (expr) => vm.runInContext(expr, view);
const setViewState = (code) => vm.runInContext(code, view);

// ---------------------------------------------------------------- 数据契约

test('三科题库均挂载 window.BANK.<subj>，且每科题量不低于已入库下限（math3 ≥24、econ ≥15、stats ≥15、合计 ≥55）', () => {
  let total = 0;
  for (const sid of BANKS) {
    const bank = BANK[sid];
    assert.ok(bank, 'window.BANK.' + sid + ' 未挂载');
    assert.equal(bank.id, sid);
    assert.ok(bank.name, sid + ' 缺 name');
    assert.ok(typeof bank.sourceNote === 'string' && bank.sourceNote.trim().length > 0, sid + ' 缺 sourceNote');
    // 下限取自 t19 审计（backup/scratch/bank-audit/audit.md §1）：math3 因移除 2 题降至 14，
    // econ 15、stats 16。护栏只保证「不会悄悄变少」；2.2.0 全量入库后应上调 math3 到 ≥15。
    assert.ok(bank.questions.length >= MIN_QUESTIONS[sid],
      sid + ' 题量低于审计下限 ' + MIN_QUESTIONS[sid] + '：' + bank.questions.length);
    assert.ok(bank.types.length >= 1, sid + ' 缺题型定义');
    total += bank.questions.length;
  }
  assert.ok(total >= MIN_TOTAL, '三科合计题量低于审计下限 ' + MIN_TOTAL + '：' + total);
  // 审计判定移除的题不得回流（题源标注不实 / 来源文字层不可还原，见 audit.md §2）
  for (const gone of ['m3-2019-6', 'm3-2019-13']) {
    assert.ok(!BANK.math3.questions.some((q) => q.id === gone), '审计判定移除的题不应仍在库：' + gone);
  }
});

test('每题字段齐全：题干/答案解析/难度五星/题型/知识点标签/陷阱/提示/来源', () => {
  for (const sid of BANKS) {
    const bank = BANK[sid];
    const pool = new Set((SUBJECTS[sid].DATA || SUBJECTS[sid].data || []).map((c) => c.id));
    for (const q of bank.questions) {
      for (const fld of ['stem', 'answer', 'traps', 'hint']) {
        assert.ok(typeof q[fld] === 'string' && q[fld].trim().length > 0, sid + ' ' + q.id + ' 缺 ' + fld);
      }
      assert.ok(q.year, sid + ' ' + q.id + ' 缺 year');
      assert.ok(q.no != null && q.no !== '', sid + ' ' + q.id + ' 缺题号');
      assert.ok(Number.isInteger(q.star) && q.star >= 1 && q.star <= 5, sid + ' ' + q.id + ' 难度非 1..5 整数');
      assert.ok(Array.isArray(q.tags) && q.tags.length > 0, sid + ' ' + q.id + ' 缺知识点标签');
      for (const tg of q.tags) assert.ok(pool.has(tg), sid + ' ' + q.id + ' 标签不是现有知识点 id: ' + tg);
      assert.ok(q.src && q.src.file && q.src.no, sid + ' ' + q.id + ' 缺来源（文件名/题号）');
      // t19 新增字段契约：school 为来源院校（含年份），三个数据文件逐题必备（题量下限由 MIN_QUESTIONS 护栏约束）
      assert.ok(typeof q.school === 'string' && q.school.trim().length > 0, sid + ' ' + q.id + ' 缺 school（来源院校）');
      assert.ok(q.school.indexOf(String(q.year)) >= 0, sid + ' ' + q.id + ' school 应含年份：' + q.school);
    }
  }
});

// ------------------------------------------- 期望答案表（t30）：答案一致性反回归护栏
// tests/fixtures/bank-answer-manifest.json 是**人工逐题转录**的数学三期望答案表（选择题记字母、
// 填空/解答题记源解析末式的关键结论锚点），**不由脚本从 data/bank_*.js 生成**。因此任何一处答案
// 被悄悄改写、或新增题没有显式补进表里，都会在这里转红；负向对照（改 1 题字母必红）见
// backup/scratch/bank-fix2/negative-control.log。
test('数学三每题答案与人工转录的期望答案表一致（答案被改写即转红）', () => {
  const raw = read('tests/fixtures/bank-answer-manifest.json');
  const manifest = JSON.parse(raw);
  // 表必须是静态人工转录件：带来源清单，且不引用题库运行期数据
  assert.ok(manifest._meta && Array.isArray(manifest._meta.sources) && manifest._meta.sources.length > 0,
    '期望答案表缺 _meta.sources（转录来源清单）');
  assert.ok(/手工/.test(manifest._meta.provenance || ''), '期望答案表应注明为手工转录');
  assert.ok(raw.indexOf('BANK') < 0 && raw.indexOf('questions.length') < 0, '期望答案表不得由题库数据派生生成');

  const answers = manifest.answers;
  const byId = {};
  for (const q of BANK.math3.questions) byId[q.id] = q;
  // id 集合完全相等：新增题必须显式补进期望表（这正是护栏的意义）
  assert.deepEqual(Object.keys(answers).sort(), Object.keys(byId).sort(),
    '期望答案表的 id 集合应与 math3 数据完全一致');

  const letterOf = (answer) => {
    const s = String(answer);
    for (const re of [/选\s*([A-D])\b/, /答案\s*[：:]?\s*\(?([A-D])\)?/, /\(([A-D])\)/]) {
      const m = s.match(re);
      if (m) return m[1];
    }
    return null;
  };
  for (const [id, want] of Object.entries(answers)) {
    const q = byId[id];
    assert.ok(want && (want.kind === 'choice' || want.kind === 'fill'), id + ' 期望表条目缺 kind');
    assert.ok(typeof want.src === 'string' && want.src.length > 0, id + ' 期望表条目缺转录来源');
    const opts = q.options || [];
    if (want.kind === 'choice') {
      assert.equal(opts.length, 4, id + ' 选择题应有 4 个选项');
      assert.equal(letterOf(q.answer), want.a, id + ' 答案字母与期望表不一致（期望 ' + want.a + '）');
    } else {
      assert.equal(opts.length, 0, id + ' 填空/解答题不应有选项');
      assert.ok(want.anchor && q.answer.indexOf(want.anchor) >= 0,
        id + ' 答案关键结论与期望表锚点不一致：' + want.anchor);
    }
  }
});

test('每题题型必须命中本文件 types 定义，且每个题型都有题命中', () => {
  for (const sid of BANKS) {
    const bank = BANK[sid];
    const keys = new Set(bank.types.map((t) => t.key));
    const hits = {};
    for (const q of bank.questions) {
      assert.ok(keys.has(q.type), sid + ' ' + q.id + ' 题型不在 types 内: ' + q.type);
      hits[q.type] = (hits[q.type] || 0) + 1;
    }
    for (const k of keys) assert.ok(hits[k] > 0, sid + ' 题型 ' + k + ' 无题目命中');
  }
});

test('题型定义含名称/定义/判据/示例题号（2.2.0 全量复用所需）', () => {
  for (const sid of BANKS) {
    for (const t of BANK[sid].types) {
      for (const fld of ['name', 'def', 'judge', 'sample']) {
        assert.ok(typeof t[fld] === 'string' && t[fld].trim().length > 0, sid + ' 题型 ' + t.key + ' 缺 ' + fld);
      }
    }
  }
});

// ---------------------------------------------------------------- 星级与频率

test('难度星级：1..5 收敛，越界取边界，bankStars 恒 5 星字符', () => {
  assert.equal(B.bankStarLevel(1), 1);
  assert.equal(B.bankStarLevel(5), 5);
  assert.equal(B.bankStarLevel(0), 1);
  assert.equal(B.bankStarLevel(9), 5);
  assert.equal(B.bankStarLevel('4'), 4);
  assert.equal(B.bankStars(3), '★★★☆☆');
  assert.equal(B.bankStars(5), '★★★★★');
  for (let s = 1; s <= 5; s++) assert.equal(B.bankStars(s).length, 5);
});

test('题型出现频率星级由库内实际频次统计得出（非人工硬编码）', () => {
  // 频次阈值：≥18% → 5★；≥13% → 4★；其余 3★
  assert.equal(B.bankTypeStars(0, 10), 3);
  assert.equal(B.bankTypeStars(1, 10), 3);
  assert.equal(B.bankTypeStars(13, 100), 4);
  assert.equal(B.bankTypeStars(17, 100), 4);
  assert.equal(B.bankTypeStars(18, 100), 5);
  assert.equal(B.bankTypeStars(50, 100), 5);
  assert.equal(B.bankTypeStars(3, 0), 3); // 除零保护
});

test('bankTypeFrequency 的 count/ratio/stars 与库内真题逐题统计一致', () => {
  for (const sid of BANKS) {
    const bank = BANK[sid];
    const rows = B.bankTypeFrequency(sid);
    assert.equal(rows.length, bank.types.length, sid + ' 频率表行数≠题型数');
    const total = bank.questions.length;
    let sum = 0;
    for (const r of rows) {
      const actual = bank.questions.filter((q) => q.type === r.key).length;
      assert.equal(r.count, actual, sid + ' ' + r.key + ' 频次不符');
      assert.equal(r.ratio, actual / total, sid + ' ' + r.key + ' 占比不符');
      assert.equal(r.stars, B.bankTypeStars(actual, total), sid + ' ' + r.key + ' 星级与统计口径不符');
      assert.ok(r.stars >= 3 && r.stars <= 5, sid + ' ' + r.key + ' 频率星级应在 3..5');
      sum += r.count;
    }
    assert.equal(sum, total, sid + ' 频率表未覆盖全部题目');
    // 降序
    for (let i = 1; i < rows.length; i++) assert.ok(rows[i - 1].count >= rows[i].count, sid + ' 频率表未按频次降序');
  }
});

test('数据文件不得硬编码题型星级（避免频率被人工固化）', () => {
  for (const sid of BANKS) {
    const bank = BANK[sid];
    for (const t of bank.types) assert.equal(t.star, undefined, sid + ' 题型 ' + t.key + ' 不应带 star 字段');
    const src = read('data/bank_' + sid + '.js');
    const starCount = (src.match(/star:/g) || []).length;
    assert.equal(starCount, bank.questions.length, sid + ' 数据文件里 star 出现次数应等于题数（仅题目难度）');
  }
});

// ---------------------------------------------------------------- 双体系筛选

test('知识点标签解析复用 data/<subj>.js 的 cat 与 title', () => {
  const cat = B.bankTagCat('stats', 'xt15');
  assert.ok(cat && cat.length > 0, 'xt15 应能解析出所属 cat');
  const title = B.bankTagTitle('stats', 'xt15');
  assert.ok(title && title.length > 0, 'xt15 应能解析出标题');
  assert.equal(B.bankTagCat('stats', '不存在的id'), '');
  assert.equal(B.bankTagTitle('stats', '不存在的id'), '');
});

test('bankMatch：题型/知识点/难度/关键词可组合，难度为「≥」语义，typeStar 维度已下线', () => {
  const q = { subject: 'stats', type: 'testing', tags: ['test07', 'xt15'], star: 4, typeStars: 5, stem: '配对样本 t 检验', answer: 't 统计量', hint: '两样本', traps: '假设条件' };
  assert.ok(B.bankMatch(q, { type: 'all', tag: 'all', star: 'all' }));
  assert.ok(B.bankMatch(q, { subject: 'stats', type: 'testing', tag: 'xt15', star: 4, query: '配对' }));
  assert.ok(!B.bankMatch(q, { subject: 'econ' }), '科目不符应筛掉（学科为可选后置条件，范围由 bankFilteredQuestions 收敛）');
  assert.ok(!B.bankMatch(q, { type: 'regress' }), '题型不符应筛掉');
  assert.ok(!B.bankMatch(q, { tag: 'test01' }), '知识点不符应筛掉');
  assert.ok(B.bankMatch(q, { star: '3' }), '难度 3★ 筛选应包含 4★ 题（≥）');
  assert.ok(!B.bankMatch(q, { star: '5' }), '难度 5★ 筛选不应包含 4★ 题');
  // t17：题型出现频率维度整体下线——历史参数既不参与匹配也不抛错
  assert.ok(B.bankMatch(q, { typeStar: '5' }), 'typeStar 参数应被忽略（不再参与匹配）');
  assert.doesNotThrow(() => B.bankMatch(q, { typeStar: '5', type: 'all' }), '历史 typeStar 参数不得抛错');
  assert.ok(!B.bankMatch(q, { query: '卡方' }), '关键词不命中应筛掉');
  assert.ok(B.bankMatch(q, { query: '  T 统计量 ' }), '关键词应忽略大小写与两侧空白');
});

// ------------------------------------------------- 学科范围＝全局学科选择器（t17）

const withSubject = (sid, code) => {
  setBankFilter('currentSubjectId = ' + JSON.stringify(sid) + ';');
  if (code) setBankFilter(code);
  return B.bankFilteredQuestions();
};

test('bankCurrentSubjectId：只认三科，三科之外（全库其它 22 科）返回 null 且不抛错', () => {
  for (const sid of BANKS) {
    setBankFilter('currentSubjectId = ' + JSON.stringify(sid) + ';');
    assert.equal(B.bankCurrentSubjectId(), sid, sid + ' 应命中题库学科');
  }
  for (const other of ['focus', 'english', 'politics', '408', '', null]) {
    setBankFilter('currentSubjectId = ' + JSON.stringify(other) + ';');
    assert.equal(B.bankCurrentSubjectId(), null, String(other) + ' 不应命中题库学科');
  }
  assert.equal(withSubject('focus').length, 0, '三科外不应命中任何题目（渲染层给空状态）');
  assert.equal(withSubject('english').length, 0, '三科外不应命中任何题目');
});

test('题库范围恒等于全局学科：切学科后命中数与题目全部属于该科，互不串味', () => {
  for (const sid of BANKS) {
    const rows = withSubject(sid);
    assert.equal(rows.length, BANK[sid].questions.length, sid + ' 未筛选命中数应等于该科题量');
    for (const q of rows) assert.equal(q.subject, sid, '范围外的题目不得混入：' + q.id);
  }
  // 页内科目筛选参数（subject=）已下线：历史参数不参与匹配、也不报错
  const rows = withSubject('math3', "bankType = 'all';");
  assert.equal(rows.length, qCount('math3'), '未筛选命中数应为数学三数据文件题量');
  assert.ok(B.bankMatch(rows[0], { subject: 'all' }), 'subject=all 不再影响匹配');
});

test('历史遗留的合并题型 key（sid:key）没有对应选项 → 渲染前自愈回全选态', () => {
  setBankFilter("currentSubjectId = 'math3'; bankType = 'stats:regress';");
  assert.equal(B.bankFilteredQuestions().length, 0, '合并 key 在本科目下不应命中（旧行为的「看不见的筛选」）');
  B.bankNormalizeTypeFilter('math3');
  assert.equal(filterOf().type, 'all', '无对应选项的题型 key 应回到全选态');
  assert.equal(B.bankFilteredQuestions().length, qCount('math3'), '自愈后应恢复本科目全量');
  setBankFilter("bankType = 'regress';");
  B.bankNormalizeTypeFilter('stats');
  assert.equal(filterOf().type, 'regress', '有对应选项的题型 key 不得被重置');
  // bankTypeSelected 仍兼容历史合并 key（纯函数语义不变）
  const q = { subject: 'stats', type: 'estimate' };
  assert.equal(B.bankTypeSelected(q, 'stats:estimate'), true);
  assert.equal(B.bankTypeSelected(q, 'math3:estimate'), false, '带科目后缀的 key 不得命中别的科目');
  resetBankFilter();
});

test('bankAllQuestions 扁平化三科题目并挂上 subject/typeName/typeStars', () => {
  const all = B.bankAllQuestions();
  let expect = 0;
  for (const sid of BANKS) expect += BANK[sid].questions.length;
  assert.equal(all.length, expect);
  const ids = new Set(all.map((q) => q.id));
  assert.equal(ids.size, all.length, '题目 id 应全局唯一');
  for (const q of all) {
    assert.ok(BANKS.includes(q.subject), q.id + ' 缺 subject');
    assert.ok(q.subjectLabel && q.subjectLabel.length > 0, q.id + ' 缺 subjectLabel');
    const bank = BANK[q.subject];
    const def = bank.types.find((t) => t.key === q.type);
    assert.equal(q.typeName, def.name, q.id + ' typeName 应取题型定义名');
    assert.ok(q.typeStars >= 3 && q.typeStars <= 5, q.id + ' 缺由库内频次统计出的 typeStars');
  }
});

test('题目 id 不与知识点 id 命名混淆，且三科题型 key 可重名但各自独立统计', () => {
  for (const sid of BANKS) {
    for (const q of BANK[sid].questions) assert.ok(/^[a-z]{1,3}\d?-\d{4}-\d+$/.test(q.id), '题目 id 命名应形如 m3-2012-1 / ec-2016-1：' + q.id);
  }
  // 不同科目的同 key 题型各自统计，互不串味
  const m3 = B.bankTypeFrequency('math3').map((r) => r.key);
  const st = B.bankTypeFrequency('stats').map((r) => r.key);
  assert.equal(new Set(m3).size, m3.length);
  assert.equal(new Set(st).size, st.length);
});

test('目录扫描：data/bank_*.js 都已被单测与校验器覆盖（防新增科目漏检）', () => {
  const listed = ['bank_math3.js', 'bank_econ.js', 'bank_stats.js'];
  for (const f of listed) assert.ok(read('data/' + f).length > 0, f + ' 缺失');
  for (const sid of BANKS) assert.ok(BANK[sid], '未覆盖的题库科目: ' + sid);
});

test('题干/解析里的 LaTeX 转义完好：解析后不得出现 \f/\t/\r 等被吃掉反斜杠的控制字符', () => {
  // 回归：曾有一处 $\\frac 写成 $\frac，JS 把 \f 解析成换页符，KaTeX 直接报解析错误。
  // 单反斜杠在数据文件里是「两个字符」，只有 JS 字符串解析后的值才能暴露这类损坏。
  const CTRL = { 0x0c: '\\f', 0x09: '\\t', 0x0d: '\\r', 0x08: '\\b', 0x0b: '\\v' };
  let checked = 0;
  for (const sid of BANKS) {
    for (const q of BANK[sid].questions) {
      const fields = ['stem', 'answer', 'traps', 'hint'];
      for (const fld of fields) {
        const s = q[fld] || '';
        checked++;
        for (let i = 0; i < s.length; i++) {
          const c = s.charCodeAt(i);
          if (c < 32 && c !== 10) {
            assert.fail(sid + ' ' + q.id + '.' + fld + ' 含控制字符 ' + (CTRL[c] || '0x' + c.toString(16)) +
              '（LaTeX 反斜杠被 JS 转义吃掉）：' + JSON.stringify(s.slice(Math.max(0, i - 24), i + 16)));
          }
        }
        // $ 定界成对（KaTeX 前的基本不变量）
        const dollars = (s.replace(/\\\$/g, '').match(/\$/g) || []).length;
        assert.equal(dollars % 2, 0, sid + ' ' + q.id + '.' + fld + ' 的 $ 未成对（' + dollars + ' 个）');
      }
      for (const o of (q.options || [])) {
        checked++;
        const dollars = (o.replace(/\\\$/g, '').match(/\$/g) || []).length;
        assert.equal(dollars % 2, 0, sid + ' ' + q.id + ' 选项 $ 未成对：' + o);
      }
    }
  }
  assert.ok(checked > 0, '未检查到任何渲染字段');
});

// ---------------------------------------------------------------- 视图与接线契约

test('视图接线契约：renderBank 可渲染，筛选由三组 select 的 change 派发既有 bankFilter 动作', () => {
  const src = read('src/bank.mjs');
  assert.match(src, /function renderBank\(\) \{/, '应导出 renderBank');
  assert.match(src, /app\.innerHTML = ''/, 'renderBank 应清空 #app');
  // t17：原生 <select> 无法携带随选择变化的 data-arg，且 click 委托会在展开下拉时重渲染，
  // 因此 change 里直接派发「既有动作名 + 既有参数名」，不新增 action。
  assert.match(src, /handleAction\('bankFilter', key \+ '=' \+ v\)/, '筛选应派发既有 bankFilter 动作');
  assert.ok(src.indexOf("data-action', 'bankFilter'") < 0, '下拉不得挂 data-action（click 委托会毁掉原生下拉）');
  assert.match(src, /data-action', 'bankOpen'/, '题目应可点击进详情');
  assert.match(src, /data-action', 'bankAddWrong'/, '每题应有一键入错题本按钮');
  for (const arg of ['type=', 'tag=', 'star=']) {
    assert.ok(src.indexOf("'" + arg + "'") >= 0 || src.indexOf(arg) >= 0, '缺少筛选参数 ' + arg);
  }
  // 页内科目筛选与题型频率筛选已下线：相关参数名不得再被读取
  assert.ok(src.indexOf("'subject='") < 0, '页内科目筛选参数 subject= 应下线（范围改由全局学科选择器决定）');
  const codeOnly = src.split('\n').filter((l) => l.trim().indexOf('//') !== 0).join('\n');
  assert.ok(!/typeStar\b/.test(codeOnly), '题型频率筛选维度 typeStar 应彻底移除（每题自带的 typeStars 频率星级保留）');
  // 旧 chip 组与频率 facet 不得残留（data-bank-facet 是下拉自身的标记，不算残留）
  for (const dead of ['bank-chip', 'bank-facet-freq', 'bank-subjects', 'bank-tabs', 'bank-note', 'bank-src']) {
    assert.ok(src.indexOf(dead) < 0, '已下线的 ' + dead + ' 不应残留在 src/bank.mjs');
  }
  assert.ok(src.indexOf("'bank-facet'") < 0 && src.indexOf("'bank-facet ") < 0, '旧的 .bank-facet 容器类名应下线（仅保留 data-bank-facet 标记）');
});

test('错题接线：复用现有 markAsWrong，不自建错题存储', () => {
  const src = read('src/bank.mjs');
  assert.match(src, /markAsWrong\(ex, 'bank:' \+ q\.id\)/, '应调用现有 markAsWrong');
  assert.ok(src.indexOf('indexedDB') < 0 && src.indexOf('idbSet') < 0, '题库不得自建存储');
});

test('导航接线：learn.mjs 声明题库会话状态并在 resetSessionState 中复位', () => {
  const src = read('src/learn.mjs');
  // bankSubject / bankTypeStar 随「页内科目选择」「频率筛选」一起下线（t17/t18），故只锁仍然生效的字段
  for (const v of ['bankType', 'bankTag', 'bankStar', 'bankQuery', 'bankOpen']) {
    assert.ok(src.indexOf('let ' + v) >= 0, 'learn.mjs 应声明 ' + v + '（同一 IIFE 作用域，不可在 bank.mjs 重复声明）');
  }
  assert.match(src, /bankType = 'all';\s*bankTag = 'all';\s*bankStar = 'all';/, 'resetSessionState 应复位题库筛选');
  assert.match(src, /\['bank', '题库'\]/, 'cards 二级导航应含题库入口');
  assert.match(src, /bank: '(?:bank|deck)'/, '题库入口应有图标映射');
  assert.match(src, /currentView === 'bank'\) return 'cards'/, 'shellModuleId 应把题库归到「学习」一级');
  const bankSource = read('src/bank.mjs');
  for (const v of ['bankType', 'bankTag', 'bankStar', 'bankQuery', 'bankOpen']) {
    assert.ok(!new RegExp('var ' + v + '\\b').test(bankSource), 'bank.mjs 不得重复声明 ' + v + '（同作用域会抛语法错误）');
  }
});

test('数据加载契约：index.html 与 sw.js 均接线三份题库数据', () => {
  const html = read('index.html');
  const sw = read('sw.js');
  for (const f of ['data/bank_math3.js', 'data/bank_econ.js', 'data/bank_stats.js']) {
    assert.ok(html.indexOf('<script src="' + f + '"></script>') >= 0, 'index.html 缺少 ' + f);
    assert.ok(sw.indexOf("'./" + f + "'") >= 0, 'sw.js 预缓存缺少 ' + f);
  }
  // 必须在 app.js 之前加载（bank.mjs 运行时要读 window.BANK）
  assert.ok(html.indexOf('data/bank_stats.js') < html.indexOf('app.js'), '题库数据必须在 app.js 之前加载');
  // 船长发版轮统一改版本号：2.1.0 发版时 sw.js 缓存戳由 ms3-v112 升为 ms3-v113。
  // 这里只钉「必须是合法的 ms3-vN 缓存戳」这一结构契约，具体值由发版轮维护（题库任务不得擅自改动）。
  assert.match(sw, /const VERSION = 'ms3-v\d+';/, 'sw.js VERSION 必须是合法的 ms3-vN 缓存戳');
});

// t11（构建接线）负责的落地点：题库「点得进去」的接线。
// renderApp() 的函数体在 src/browse.mjs（build.mjs 把 src/*.mjs 拼进同一 IIFE），
// handleAction 在 src/actions.mjs，两者都不在本任务 inScope。这里钉住契约：
//   · 本任务保证的一半（renderBank 必须可被同 IIFE 内的 renderApp 直接调用）——立即断言；
//   · t11 的一半（派发与动作分支）——未接线时打印待办并放行，一旦接线则强制收紧。
test('派发接线契约：renderBank 可被同 IIFE 的 renderApp 调用，且 t11 接线后动作分支齐备', () => {
  const bank = read('src/bank.mjs');
  // 函数声明会被提升，且与 renderLearn/renderBrowse 等同一 IIFE 作用域内可见 → 派发可直接调用
  assert.match(bank, /^function renderBank\(\) \{/m, 'renderBank 必须是函数声明（可提升，供 renderApp 派发调用）');
  assert.match(bank, /^function bankData\(subjectId\) \{/m, 'bankData 必须是函数声明，且读 window.BANK 时不依赖 DOM（模块加载后即可调用）');

  const browse = read('src/browse.mjs');
  const actions = read('src/actions.mjs');
  const wired = browse.indexOf("currentView === 'bank'") >= 0;
  if (!wired) {
    console.error('[待办·t11] renderApp 尚未派发题库视图；接线内容：在 renderApp() 里加 `else if (currentView === "bank") renderBank();`，并在 handleAction 里加 nav 分支 `else if (arg === "bank") currentModule = "cards";` 与 bankFilter/bankOpen/bankAddWrong/bankStep/bankBack/bankReset 六个 case。');
    return;
  }
  assert.match(browse, /renderBank\(\)/, 'renderApp 已派发则必须调用 renderBank()');
  for (const act of ['bankFilter', 'bankOpen', 'bankAddWrong', 'bankReset']) {
    assert.ok(actions.indexOf("'" + act + "'") >= 0, 'handleAction 已接线则必须识别 ' + act + ' 动作');
  }
  assert.match(actions, /arg === 'bank'/, 'handleAction 的 nav 分支应把 arg=bank 映到 currentModule=cards（currentView 由 handleAction 无条件赋值）');
});

// ------------------------------------------------------------------ t14 F1 回归
// 缺陷：bankWrongState 曾调用全仓库无定义的 lookupWrongEntry → 恒 { inBook: false }，
// 使列表卡（:548 一带）与详情页（:631 一带）的按钮与错题本实际内容不一致。
// 口径锚点（与 src/wrong.mjs 的入库查重必须一致）：
//   src/wrong.mjs:363-364  `const existing = Object.keys(DB.wrongs || {}).find(function (wid) {
//                             return (DB.wrongs[wid].q || '').trim() === (ex.q || '').trim(); });`
// 即「题干原文 trim 后严格相等」——不折叠内部空白、不做全角/半角或大小写归一化、不比对解析。
// bankAddToWrong 的 ex.q = q.stem（与本题库题干同源），所以两侧输入同一份文本。

test('错题本状态口径与 src/wrong.mjs 的入库查重同源（同数据源、同比较表达式）', () => {
  const wrong = read('src/wrong.mjs');
  const bank = read('src/bank.mjs');
  // ① 错题本侧：钉住查重表达式的真实形态（改动 wrong.mjs 会让本用例变红，提醒重新对齐口径）
  assert.match(
    wrong,
    /\(DB\.wrongs\[wid\]\.q \|\| ''\)\.trim\(\) === \(ex\.q \|\| ''\)\.trim\(\)/,
    'wrong.mjs 的入库查重应为「题干 trim 后严格相等」；若口径变更，bank.mjs 的 bankSameQuestion 必须同步'
  );
  // ② 题库侧：同数据源（DB.wrongs）+ 同比较（bankSameQuestion 只做 trim）
  assert.match(bank, /function bankSameQuestion\(a, b\)/, 'bank.mjs 应把查重口径收敛到 bankSameQuestion');
  assert.match(bank, /String\(a[^)]*\)\.trim\(\) ===\s*\n?\s*String\(b[^)]*\)\.trim\(\)/, 'bankSameQuestion 应只做 trim 后严格相等（不折叠内部空白、不做全角半角归一化）');
  assert.match(bank, /function bankLookupWrongEntry\(q\)/, 'bank.mjs 应自建错题本查询，不得依赖未定义的 lookupWrongEntry');
  assert.ok(bank.indexOf('lookupWrongEntry') < 0, 'bank.mjs 不得再引用全仓库无定义的 lookupWrongEntry（F1 回归）');
  assert.match(bank, /DB\.wrongs/, 'bankLookupWrongEntry 应读与 wrong.mjs 同一数据源 DB.wrongs');
  assert.match(bank, /wrongCard\(/, 'bankLookupWrongEntry 应优先复用 wrong.mjs 已公开的读取接口 wrongCard(wid)');
  // ③ 入库路径不变：ex.q 仍是 q.stem（口径两侧同源的前提）
  assert.match(bank, /function bankAddToWrong\(q\) \{[\s\S]*?q:\s*q\.stem[\s\S]*?markAsWrong\(ex, 'bank:' \+ q\.id\)/, 'bankAddToWrong 应继续以 q.stem 入错题本（口径同源、入库路径不变）');
  // ④ 错题本模块零改动（本任务不新增其导出）
  assert.ok(!/export \{[^}]*lookupWrongEntry/.test(wrong), '不得为本题在 wrong.mjs 新增查询导出');
});

test('错题本状态：未入册 → false；入册后 → true（并回传命中条目）', () => {
  const q = BANK.math3.questions.find((x) => x.id === 'm3-2019-12');
  assert.ok(q, '样例题 m3-2019-12 应存在');

  // 未入册
  sandbox.DB.wrongs = {};
  assert.equal(B.bankWrongState(q).inBook, false, '未入册应为 false');
  assert.equal(B.bankWrongState(q).entry, null, '未入册不应回传条目');
  assert.equal(B.bankLookupWrongEntry(q), null, '未入册时查询应返回 null');

  // 入册（题干与入库路径同源：ex.q = q.stem）
  sandbox.DB.wrongs = { wp_1: { q: q.stem, a: q.answer } };
  const st = B.bankWrongState(q);
  assert.equal(st.inBook, true, '入册后应为 true');
  assert.ok(st.entry && st.entry.q === q.stem, '应回传命中的错题条目本身');
  const hit = B.bankLookupWrongEntry(q);
  assert.equal(hit.id, 'wp_1', '命中应回传错题条目 id（供「点按定位」使用）');

  // 另一题不受影响
  const other = BANK.math3.questions.find((x) => x.id !== q.id);
  assert.equal(B.bankWrongState(other).inBook, false, '仅该题命中，其余题仍为 false');
  sandbox.DB.wrongs = {};
});

test('错题本状态边界：口径=trim 后严格相等（首尾空白等价；内部空白与全角差异不等价）', () => {
  const q = BANK.math3.questions.find((x) => x.id === 'm3-2019-12');

  // 边界 1：错题本条目带首尾空白/换行 → 与 wrong.mjs 的 .trim() 口径一致，仍判定入册
  sandbox.DB.wrongs = { wp_ws: { q: '  ' + q.stem + '\n ' } };
  assert.equal(B.bankWrongState(q).inBook, true, '题干首尾空白应被 trim 掉（与 wrong.mjs 口径一致）');
  sandbox.DB.wrongs = {};

  // 边界 2：题库侧题干带首尾空白 → 同样等价（bankAddToWrong 传的是原文，两侧都 trim）
  sandbox.DB.wrongs = { wp_ws2: { q: q.stem } };
  assert.equal(B.bankWrongState({ stem: ' ' + q.stem + ' ' }).inBook, true, '两侧都 trim，首尾空白不影响判定');
  sandbox.DB.wrongs = {};

  // 边界 3：内部空白不同 → 不等价（口径不折叠内部空白；与 wrong.mjs 完全一致：
  //         wrong.mjs 会把这种题当新题入库，题库侧也就不应显示「已在错题本」）
  sandbox.DB.wrongs = { wp_sp: { q: '设 函数  连续 且 可导' } };
  assert.equal(B.bankWrongState({ stem: '设 函数 连续 且 可导' }).inBook, false, '内部空白不同不应命中（与 wrong.mjs 一致，避免出现「按钮说已在、入库却又新增」的不一致）');
  sandbox.DB.wrongs = {};

  // 边界 4：全角/半角差异 → 不等价（无归一化），与 wrong.mjs 口径一致
  sandbox.DB.wrongs = { wp_fw: { q: '求极限 lim（x→0）sinx／x' } };
  assert.equal(B.bankWrongState({ stem: '求极限 lim(x→0)sinx/x' }).inBook, false, '全角/半角不做归一化，与 wrong.mjs 口径一致');
  sandbox.DB.wrongs = {};

  // 边界 5：空条目 —— 这里必须与 wrong.mjs **逐字镜像**（`''.trim() === ''.trim()` 为 true）：
  //         wrong.mjs 的查重也会把空题干判为命中（第二次点击不会再插一条），
  //         题库侧同样判为命中，才是真正的「口径完全一致」。真实题目题干非空，故此路径不会触达 UI。
  sandbox.DB.wrongs = { wp_empty: { q: '' } };
  assert.equal(B.bankWrongState({ stem: '' }).inBook, true, '空题干两侧 trim 后相等 → 与 wrong.mjs 镜像判定（真实题目题干非空，不会触达）');
  assert.equal(B.bankWrongState(q).inBook, false, '错题本空题干不应误判命中非空题干');
  sandbox.DB.wrongs = {};
  // 边界 6：缺 q 字段 / 空库不抛异常，且不误判
  sandbox.DB.wrongs = { wp_null: {} };
  assert.equal(B.bankWrongState(q).inBook, false, '缺 q 字段的条目不应命中非空题干');
  assert.equal(B.bankWrongState({}).inBook, true, '缺 q 字段等价于空题干 → 与 wrong.mjs 同为空串比较（镜像判定）');
  sandbox.DB.wrongs = {};
  assert.equal(B.bankWrongState({}).inBook, false, '空库时不应命中任何题');
  assert.doesNotThrow(() => B.bankWrongState(q), 'DB.wrongs 为空对象时不应抛异常');
  assert.doesNotThrow(() => B.bankLookupWrongEntry(null), '传 null 不应抛异常');
});

test('错题本状态渲染契约：列表卡与详情页两处都按 inBook 切换按钮文案与 is-in，且动作不变', () => {
  const bank = read('src/bank.mjs');
  // 列表卡（bankItemNode，约 :548）
  assert.match(bank, /var st = bankWrongState\(q\);\s*\n\s*var mark = el\('button', 'bank-btn bank-btn-wrong' \+ \(st\.inBook \? ' is-in' : ''\), st\.inBook \? '已在错题本' : '加入错题本'\);/, '列表卡应按 bankWrongState 切换 is-in 与文案');
  // 详情页（bankDetailNode，约 :650）
  assert.match(bank, /var st = bankWrongState\(q\);\s*\n\s*var mark = el\('button', 'bank-btn bank-btn-wrong' \+ \(st\.inBook \? ' is-in' : ''\), st\.inBook \? '已在错题本（点按定位）' : '加入错题本'\);/, '详情页应按 bankWrongState 切换 is-in 与文案');
  // 两处按钮都必须仍走 bankAddWrong（入库/跳转路径不变）
  assert.equal((bank.match(/el\('button', 'bank-btn bank-btn-wrong'/g) || []).length, 2, '应恰好两处错题按钮（列表卡 + 详情页）');
  assert.equal((bank.match(/mark\.setAttribute\('data-action', 'bankAddWrong'\)/g) || []).length, 2, '两处按钮都应保持 data-action=bankAddWrong');
  assert.equal((bank.match(/mark\.setAttribute\('data-arg', q\.id\)/g) || []).length, 2, '两处按钮都应带题目 id，便于定位');
  // 单测导出清单包含本次新增的三件套（build.mjs 的 STRIP 会剥离 export 行，不影响浏览器端）
  assert.match(bank, /export \{[\s\S]*bankWrongState[\s\S]*\};/, 'bank.mjs 应导出 bankWrongState 供单测使用');
});

// ------------------------------------------------- 概览口径：总量 vs 命中数

const setBankFilter = (code) => vm.runInContext(code, sandbox);
const resetBankFilter = () => setBankFilter(
  "bankType='all'; bankTag='all'; bankStar='all'; bankQuery=''; bankOpen=null; currentSubjectId='math3';"
);
// vm 沙箱里造出来的对象与宿主 realm 的 Object.prototype 不同源，严格 deepEqual 会报
//「same structure but not reference-equal」→ 一律摊平成宿主侧普通对象再比较。
const filterOf = () => ({ ...B.bankCurrentFilter() });
const subjLabel = (sid) => sandbox.BANK_SUBJECT_META[sid].label;

test('概览卡口径：科目总量恒为全库（各科题量/题型数与数据文件一致，合计=三科之和），不随筛选变化', () => {
  const totals = B.bankSubjectTotals();
  assert.equal(totals.total, TOTAL_Q(), '全库真题合计应等于三科数据文件题量之和');
  assert.ok(totals.total >= MIN_TOTAL, '全库合计不得低于审计下限 ' + MIN_TOTAL + '：' + totals.total);
  for (const sid of BANKS) {
    assert.ok(qCount(sid) >= MIN_QUESTIONS[sid], sid + ' 题量低于审计下限 ' + MIN_QUESTIONS[sid] + '：' + qCount(sid));
    assert.ok(typeCount(sid) >= MIN_TYPES[sid], sid + ' 题型数低于体系表下限 ' + MIN_TYPES[sid] + '：' + typeCount(sid));
    assert.equal(B.bankSubjectTotal(totals, sid), qCount(sid), sid + ' 概览总量应与数据文件题量一致');
    assert.equal(B.bankSubjectTypeCount(totals, sid), typeCount(sid), sid + ' 概览题型数应与数据文件一致');
  }
  // 概览总量不接收筛选结果：函数体只读全库 bankAllQuestions()
  const body = read('src/bank.mjs').match(/function bankSubjectTotals\(\) \{[\s\S]*?\n  \}/)[0];
  assert.ok(body.indexOf('bankAllQuestions()') >= 0, 'bankSubjectTotals 应基于全库题目统计');
  assert.ok(body.indexOf('bankFilteredQuestions') < 0, 'bankSubjectTotals 不得读取筛选结果（否则概览随筛选塌陷）');
  assert.ok(read('src/bank.mjs').indexOf('bankOverviewStats') < 0, '按筛选命中的旧概览函数应已删除');
  // 八种筛选组合下总量恒定（学科逐一切换 + 题型/知识点/难度叠加 + 历史 typeStar 参数）
  const combos = ['', "bankType='deriv'", "bankType='math3:econ'", "currentSubjectId='econ'", "currentSubjectId='stats'; bankType='regress'", "currentSubjectId='stats'; bankStar='5'", "bankTag='xt15'", "bankTypeStar='5'; bankStar='4'"];
  const seen = [];
  for (const code of combos) {
    resetBankFilter();
    if (code) setBankFilter(code);
    const t = B.bankSubjectTotals();
    seen.push([t.total, B.bankSubjectTotal(t, 'math3'), B.bankSubjectTypeCount(t, 'math3'), B.bankSubjectTotal(t, 'econ'), B.bankSubjectTotal(t, 'stats')].join('/'));
  }
  const wantSig = [TOTAL_Q(), qCount('math3'), typeCount('math3'), qCount('econ'), qCount('stats')].join('/');
  assert.deepEqual(Array.from(new Set(seen)), [wantSig], '总量在任何筛选组合下都应恒定（期望值由数据文件派生），实际: ' + JSON.stringify(seen));
  resetBankFilter();
});

test('「当前筛选命中 N 题」：未筛选等于当前学科总量，筛选后随命中实时变化（工具条范围文案走学科总量口径）', () => {
  resetBankFilter();
  const m3 = qCount('math3');
  assert.equal(B.bankFilteredQuestions().length, m3, '未筛选应命中当前学科（数学三）全部 ' + m3 + ' 题');
  assert.equal(B.bankHitText(m3, m3), '当前筛选命中 ' + m3 + ' 题', '未筛选时应显示学科总量，不带「（全部）」后缀');
  assert.equal(B.bankHitText(2, m3), '当前筛选命中 2 题（全部 ' + m3 + ' 题）', '筛选后应同时给出命中数与学科总量');
  const cases = [
    { code: "currentSubjectId='math3'", want: qCount('math3') },
    { code: "currentSubjectId='econ'", want: qCount('econ') },
    { code: "currentSubjectId='stats'", want: qCount('stats') },
    { code: "currentSubjectId='focus'", want: 0 },
    { code: "currentSubjectId='math3'; bankType='deriv'", want: typeHit('math3', 'deriv'), sid: 'math3' },
    { code: "currentSubjectId='stats'; bankType='regress'", want: typeHit('stats', 'regress'), sid: 'stats' },
    { code: "currentSubjectId='stats'; bankType='testing'; bankStar='4'", want: typeStarHit('stats', 'testing', 4), sid: 'stats' },
    { code: "currentSubjectId='stats'; bankStar='5'", want: starHitIn('stats', 5), sid: 'stats' },
    { code: "currentSubjectId='stats'; bankTag='xt15'", want: tagHitIn('stats', 'xt15'), sid: 'stats' }
  ];
  // 派生期望不能退化成「恒 0 / 恒等于全量」——否则派生会掩盖数据塌陷或筛选失效
  for (const c of cases) {
    if (c.sid) assert.ok(c.want > 0 && c.want < qCount(c.sid), '派生期望应是该科的真子集且非空：' + c.code + ' → ' + c.want);
  }
  for (const c of cases) {
    resetBankFilter();
    if (c.code) setBankFilter(c.code);
    assert.equal(B.bankFilteredQuestions().length, c.want, (c.code || '未筛选') + ' 命中数应为 ' + c.want);
  }
  // bankCurrentFilter 与 learn.mjs 的会话状态一一对应（学科范围已不属于筛选维度）
  resetBankFilter();
  setBankFilter("currentSubjectId='stats'; bankType='regress'; bankTag='xt15'; bankStar='4'");
  assert.deepEqual(filterOf(), { type: 'regress', tag: 'xt15', star: '4', query: '' });
  // 工具条范围文案按当前学科总量渲染，且不含命中数
  const totals = B.bankSubjectTotals();
  assert.equal(B.bankScopeText('math3', totals), subjLabel('math3') + ' · 共 ' + qCount('math3') + ' 题 · ' + typeCount('math3') + ' 类题型');
  assert.equal(B.bankScopeText('stats', totals), subjLabel('stats') + ' · 共 ' + qCount('stats') + ' 题 · ' + typeCount('stats') + ' 类题型');
  assert.match(read('src/bank.mjs'), /bankHitLine\(rows\.length, bankSubjectTotal\(totals, sid\)\)/, '概览区应渲染「当前筛选命中」行（命中数来自筛选结果，总量走当前学科）');
  resetBankFilter();
});

test('三组下拉的选项口径：题型按库内频次降序、知识点按命中数降序（上限 60）、难度 ★5→★1，当前值回填', () => {
  resetBankFilter();
  // 题型：首项全选 + 库内频次降序，星级/题数一律来自 bankTypeFrequency
  const tOpts = B.bankTypeOptions('stats');
  assert.equal(tOpts.length, B.bankTypeFrequency('stats').length + 1, '题型选项数 = 库内题型数 + 全选');
  assert.equal(tOpts[0].value, 'all');
  assert.equal(tOpts[0].label, '全部题型');
  const freq = B.bankTypeFrequency('stats');
  for (let i = 0; i < freq.length; i++) {
    assert.equal(tOpts[i + 1].value, freq[i].key, '题型选项应按频次降序排列');
    assert.equal(tOpts[i + 1].label, freq[i].name + ' ' + B.bankStars(freq[i].stars) + ' ' + freq[i].count + ' 题');
  }
  assert.ok(tOpts[1].label.indexOf(B.bankStars(freq[0].stars)) >= 0, '题型选项应带频率星级与题数');
  assert.equal(B.bankTypeOptions('focus').length, 1, '三科之外只给「全部题型」');
  // 同名题型不串味：同名 key 在各自科目内独立统计（旧合并 key 视图已随页内科目选择下线）
  assert.equal(B.bankTypeFrequency('math3').filter((r) => r.key === 'estimate').length, 1);
  assert.equal(B.bankTypeFrequency('stats').filter((r) => r.key === 'estimate').length, 1);
  const q = { subject: 'stats', type: 'estimate' };
  assert.equal(B.bankTypeSelected(q, 'estimate'), true, '裸 key 按本科目题型匹配');
  assert.equal(B.bankTypeSelected(q, 'stats:estimate'), true, '历史合并 key 仍向后兼容（纯函数语义不变）');
  assert.equal(B.bankTypeSelected(q, 'math3:estimate'), false, '带科目后缀的 key 不得命中别的科目');

  // 知识点：全部知识点 + 按当前命中数降序
  const rows = B.bankFilteredQuestions();
  const rank = B.bankTagRanking(rows);
  assert.ok(rank.length > 3, '数学三 ' + qCount('math3') + ' 题应覆盖 3 个以上知识点标签，实际 ' + rank.length);
  const gOpts = B.bankTagOptions(rows);
  assert.equal(gOpts[0].value, 'all');
  assert.equal(gOpts[0].label, '全部知识点');
  assert.equal(gOpts[1].value, rank[0].id, '知识点首项应为命中数最高的标签');
  assert.ok(gOpts[1].label.indexOf(String(rank[0].count) + ' 题') >= 0, '知识点选项应带命中数');
  assert.ok(gOpts[1].label.indexOf(rank[0].cat) >= 0, '知识点选项应带分类前缀');
  assert.equal(gOpts.length - 1, Math.min(rank.length, TAG_LIMIT), '知识点选项数 = min(标签数, 上限 ' + TAG_LIMIT + ')，当前标签数 ' + rank.length);
  assert.equal(
    B.bankTagOptionHidden(rows),
    Math.max(0, rank.length - TAG_LIMIT),
    rank.length > TAG_LIMIT
      ? '标签数 ' + rank.length + ' 超过上限 ' + TAG_LIMIT + ' → 应提示「其余 ' + (rank.length - TAG_LIMIT) + ' 个知识点」（刻意截断）'
      : '未超上限时没有「其余 N 个」提示'
  );
  // 超上限：当前选中值即使被截断也必须保留在首位，并给出「其余 N 个」提示
  const low = rank[rank.length - 1].id;
  const clipped = B.bankTagOptions(rows, low, 3);
  assert.equal(clipped.length, 4, '上限 3 = 全选 + 3 个知识点');
  assert.equal(clipped[1].value, low, '被上限截断的当前选中知识点必须置于首位（否则回填跳到全选）');
  assert.ok(B.bankTagOptionHidden(rows, null, 3) > 0, '超上限时应给出「其余 N 个知识点」提示');

  // 难度（≥）：全部难度 + ★5…★1
  const sOpts = B.bankStarOptions();
  assert.deepEqual(Array.from(sOpts).map((o) => o.value), ['all', '5', '4', '3', '2', '1']);
  assert.deepEqual(Array.from(sOpts).map((o) => o.label), ['全部难度', B.bankStars(5), B.bankStars(4), B.bankStars(3), B.bankStars(2), B.bankStars(1)]);

  // 回填：当前值在选项里就选中它，否则回到首项（历史合并 key / 已删题型自动自愈）
  assert.equal(B.bankSelectValue(tOpts, freq[0].key), freq[0].key);
  assert.equal(B.bankSelectValue(tOpts, 'stats:estimate'), 'all', '历史合并 key 无对应选项 → 回全选态');
  assert.equal(B.bankSelectValue(tOpts, null), 'all');
  assert.equal(B.bankSelectValue(gOpts, 'no-such-tag'), 'all');
});

test('渲染树：三组原生 select（各带可见 label）替代 chip 组，页内科目选择与频率 facet 全部消失', () => {
  const tree = renderTree('math3');
  assert.equal(byClass(tree, 'bank-filters').length, 1, '应渲染 .bank-filters 容器');
  const sels = byTag(tree, 'select');
  assert.equal(sels.length, 3, '题型/知识点/难度应各渲染一个原生 select');
  assert.deepEqual(sels.map((s) => s.getAttribute('data-bank-facet')), ['type', 'tag', 'star'], '三组下拉顺序应为 题型/知识点/难度');
  for (const s of sels) {
    const id = s.getAttribute('id');
    assert.equal(id, 'bank-filter-' + s.getAttribute('data-bank-facet'), '下拉应有稳定 id（供 label 关联）');
    const label = byTag(tree, 'label').filter((l) => l.getAttribute('for') === id);
    assert.equal(label.length, 1, '每个下拉都应有可见 label（for=' + id + '）');
    assert.ok(label[0].text.length > 0, 'label 应有可见文案');
    assert.equal(s.children[0].getAttribute('value'), 'all', '首项应为全选');
    assert.equal(s.children[0].getAttribute('selected'), 'selected', '当前值（全选）应回填 selected');
    assert.equal(s.getAttribute('data-arg'), s.getAttribute('data-bank-facet') + '=all', 'data-arg 应可观察当前筛选参数');
  }
  assert.equal(sels[0].children.length, B.bankTypeOptions('math3').length, '题型下拉选项数应与库内题型一致');
  assert.equal(sels[2].children.length, B.bankStarOptions().length, '难度下拉应为 全部难度 + ★5…★1（选项数由 bankStarOptions 派生）');
  // 页内科目选择 / 频率筛选 / chip 组均已下线
  for (const dead of ['bank-subject', 'bank-subjects', 'bank-tabs', 'bank-note', 'bank-chip', 'bank-facet', 'bank-facet-freq']) {
    assert.equal(byClass(tree, dead).length, 0, '渲染树不应出现 .' + dead);
  }
  assert.ok(treeText(tree).indexOf('题型出现频率') < 0, '频率筛选文案不应出现在界面上');
  assert.ok(treeText(tree).indexOf('题库 · 真题') >= 0, '标题行仍应标明题库 · 真题');
  // 标题行用新增的 bank 图标
  const icons = byClass(tree, 'ui-icon');
  assert.equal(icons.length, 1, '题库标题行应有 1 个图标');
  assert.equal(icons[0].getAttribute('data-icon'), 'bank', '题库标题应使用 UI_ICONS.bank');
  // 历史残留参数（typeStar= / bankSubject=，来自旧会话或旧链接）不得让界面报错或改变结果集
  vm.runInContext("bankTypeStar = '5'; bankSubject = 'all';", view);
  assert.doesNotThrow(() => vm.runInContext('renderBank()', view), '历史 typeStar/bankSubject 残留不得抛错');
  assert.equal(byTag(appEl, 'select').length, 3, '历史残留参数不应影响筛选器渲染');
  assert.equal(byClass(appEl, 'bank-item').length, B.bankFilteredQuestions().length, '历史残留参数不应改变结果集');
  vm.runInContext("bankTypeStar = 'all'; bankSubject = 'math3';", view);
  const home = read('src/home.mjs');
  assert.ok(home.indexOf("bank: '") >= 0, 'UI_ICONS 应新增 bank 键');
  const bankIcon = home.match(/bank: '([^']*)'/);
  assert.ok(bankIcon && /^(?:<path[^>]*\/>|<rect[^>]*\/>|<circle[^>]*\/>)+$/.test(bankIcon[1]), 'bank 图标应为纯线稿（path/rect/circle），不带 fill/stroke');
});

test('三组下拉 change 端到端：派发既有 bankFilter 动作与既有参数名，可组合、可放宽', () => {
  const tree = renderTree('stats');
  const sel = byTag(tree, 'select').filter((s) => s.getAttribute('data-bank-facet') === 'type')[0];
  assert.ok(sel, '应有题型下拉');
  const regress = sel.children.filter((o) => o.getAttribute('value') === 'regress')[0];
  assert.ok(regress, '统计学应有「回归分析」题型选项');
  sel.value = 'regress';
  sel.fire('change');
  assert.deepEqual(viewState('window.__actions[window.__actions.length - 1]').slice ? Array.from(viewState('window.__actions[window.__actions.length - 1]')) : null, ['bankFilter', 'type=regress'], 'change 应派发 bankFilter + type=regress');
  assert.equal(viewState('bankType'), 'regress', '筛选状态应被写入（收口在 actions.mjs）');
  assert.equal(viewState('bankOpen'), null, '切筛选应退出详情页');
  // 重渲染后的树：命中 6 题、题型下拉回填 regress、可再放宽回全选
  assert.ok(treeText(appEl).indexOf('当前筛选命中 ' + typeHit('stats', 'regress') + ' 题（全部 ' + qCount('stats') + ' 题）') >= 0, '重渲染后应显示命中 ' + typeHit('stats', 'regress') + ' 题（全部 ' + qCount('stats') + ' 题）');
  const after = byTag(appEl, 'select').filter((s) => s.getAttribute('data-bank-facet') === 'type')[0];
  assert.equal(after.value, 'regress', '下拉应回填当前筛选值');
  assert.equal(after.children.filter((o) => o.getAttribute('selected') === 'selected')[0].getAttribute('value'), 'regress');
  after.value = 'all';
  after.fire('change');
  assert.ok(treeText(appEl).indexOf('当前筛选命中 ' + qCount('stats') + ' 题') >= 0, '放宽回全选应恢复学科全量（' + qCount('stats') + ' 题）');
  // 知识点与难度同样走既有参数名
  const tagSel = byTag(appEl, 'select').filter((s) => s.getAttribute('data-bank-facet') === 'tag')[0];
  tagSel.value = 'xt15';
  tagSel.fire('change');
  assert.equal(viewState('bankTag'), 'xt15');
  const starSel = byTag(appEl, 'select').filter((s) => s.getAttribute('data-bank-facet') === 'star')[0];
  starSel.value = '4';
  starSel.fire('change');
  assert.equal(viewState('bankStar'), '4');
  assert.deepEqual(Array.from(viewState('window.__actions')).slice(-3).map((a) => Array.from(a).join('|')), ['bankFilter|type=all', 'bankFilter|tag=xt15', 'bankFilter|star=4'], '只能派发既有动作名与既有参数名');
});

test('徽标口径：首两枚徽标为「院校 · 年度 · 题号」（school 缺失时回退科目名），详情页不再渲染 src 明细', () => {
  const tree = renderTree('math3');
  const rows = B.bankFilteredQuestions();
  const first = rows[0];
  const badges = byClass(tree, 'bank-badge-school');
  assert.equal(badges.length, rows.length, '列表卡每题一枚院校徽标');
  assert.equal(badges[0].text, first.school || subjLabel('math3'), '徽标应取 q.school || 科目名（t19 补 school 后自动显示院校）');
  assert.equal(byClass(tree, 'bank-badge-subject').length, 0, '旧的科目名徽标类名应下线');
  const years = byClass(tree, 'bank-badge-year');
  assert.equal(years.length, rows.length, '列表卡每题一枚「年度 · 题号」徽标');
  assert.equal(years[0].text, first.year + ' · ' + first.no, '徽标应显示年度与题号');
  const src = read('src/bank.mjs');
  const schoolFn = src.match(/function bankSchoolLabel\(q\) \{[\s\S]*?\n\}/)[0];
  assert.ok(schoolFn.indexOf('q.school') >= 0 && schoolFn.indexOf('q.subjectLabel') >= 0, '徽标应保留 q.school → q.subjectLabel 回退（t19 补 school 后自动生效）');
  assert.ok(src.indexOf('bank-src') < 0, '详情页 src 明细块应删除（数据字段保留给 t19/2.2.0）');
  // 详情页：仍可一键入错题本，但没有 src 明细块
  setViewState('bankOpen = ' + JSON.stringify(first.id) + ';');
  vm.runInContext('renderBank()', view);
  assert.equal(byClass(appEl, 'bank-detail').length, 1, '应按 bankOpen 渲染详情页');
  assert.equal(byClass(appEl, 'bank-src').length, 0, '详情页不应有 src 明细块');
  assert.equal(byClass(appEl, 'bank-detail-actions').length, 1, '详情页应有操作区');
  assert.equal(byClass(appEl, 'bank-answer').length, 1, '详情页应有答案与解析');
  assert.equal(byClass(appEl, 'bank-traps').length, 1, '详情页应有陷阱');
  assert.equal(byClass(appEl, 'bank-hint').length, 1, '详情页应有提示');
  const wrongBtn = byClass(appEl, 'bank-btn-wrong');
  assert.equal(wrongBtn.length, 1, '详情页应有一键入错题本按钮');
  assert.equal(wrongBtn[0].getAttribute('data-action'), 'bankAddWrong');
  assert.equal(wrongBtn[0].getAttribute('data-arg'), first.id);
  // 三科之外（学科选择器停在别的学科）：空状态而不是报错
  const empty = renderTree('focus');
  assert.equal(byClass(empty, 'bank-empty-subject').length, 1, '三科之外应渲染学科空状态');
  const emptyText = treeText(empty);
  for (const name of ['数学三', '微观经济学', '统计学']) assert.ok(emptyText.indexOf(name) >= 0, '空状态文案应引导切到 ' + name);
  assert.equal(byClass(empty, 'bank-filters').length, 0, '空状态不应渲染筛选器');
  assert.equal(byTag(empty, 'select').length, 0, '空状态不应渲染下拉');
  assert.ok(emptyText.indexOf('当前学科暂无题库数据') >= 0, '空状态应说明原因');
  renderTree('math3');
});

test('重置（bankReset）回到全选态：命中数恢复学科全量，三组下拉都回到「全部」', () => {
  resetBankFilter();
  const m3 = qCount('math3');
  setBankFilter("bankType='ode'; bankTag='ode01'; bankStar='5'");
  assert.notEqual(B.bankFilteredQuestions().length, m3, '重置前应处于筛选态（不等于学科全量 ' + m3 + '）');
  resetBankFilter();
  assert.equal(B.bankFilteredQuestions().length, m3, '重置后应命中当前学科（数学三）全部 ' + m3 + ' 题');
  assert.equal(B.bankHitText(B.bankFilteredQuestions().length, B.bankSubjectTotal(B.bankSubjectTotals(), 'math3')), '当前筛选命中 ' + m3 + ' 题');
  assert.deepEqual(filterOf(), { type: 'all', tag: 'all', star: 'all', query: '' });
  // 端到端：视图层的重置按钮真派发 bankReset 后，三组下拉与命中数一起回全选态
  const tree = renderTree('math3', "bankType = 'deriv'; bankTag = 'xt15'; bankStar = '4';");
  const beforeText = treeText(tree);
  assert.ok(beforeText.indexOf('当前筛选命中 ' + m3 + ' 题') < 0, '应先处于筛选态');
  assert.ok(new RegExp('当前筛选命中 \\d+ 题（全部 ' + m3 + ' 题）').test(beforeText), '筛选态应显示命中数与学科总量');
  const reset = byClass(tree, 'bank-reset')[0];
  assert.ok(reset, '工具条应有重置按钮');
  assert.equal(reset.getAttribute('data-action'), 'bankReset');
  vm.runInContext("handleAction('bankReset', null)", view);
  assert.equal(viewState('bankType'), 'all');
  assert.equal(viewState('bankTag'), 'all');
  assert.equal(viewState('bankStar'), 'all');
  assert.equal(viewState('bankQuery'), '');
  assert.ok(treeText(appEl).indexOf('当前筛选命中 ' + m3 + ' 题') >= 0, '重置后应恢复学科全量（' + m3 + ' 题）');
  for (const s of byTag(appEl, 'select')) {
    assert.equal(s.getAttribute('data-arg'), s.getAttribute('data-bank-facet') + '=all', '重置后三组下拉都应回到全选态');
  }
  // actions.mjs 的 bankReset 分支复位的正是这些字段（该文件不在本任务 inScope，只做契约锁定）
  const actions = read('src/actions.mjs');
  const resetCase = actions.match(/case 'bankReset':([\s\S]*?)(?:\n      case |\n      default)/);
  assert.ok(resetCase, 'actions.mjs 应有 bankReset 分支');
  for (const v of ['bankType', 'bankTag', 'bankStar', 'bankQuery']) {
    assert.ok(resetCase[1].indexOf(v + " = 'all'") >= 0 || resetCase[1].indexOf(v + " = ''") >= 0, 'actions.mjs 的 bankReset 应复位 ' + v);
  }
});