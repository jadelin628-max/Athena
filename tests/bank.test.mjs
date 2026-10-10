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
const exposed = ['bankStarLevel', 'bankStars', 'bankTypeStars', 'bankTypeFrequency', 'bankTagCat', 'bankTagTitle', 'bankMatch', 'bankAllQuestions', 'bankSameQuestion', 'bankLookupWrongEntry', 'bankWrongState', 'bankFilteredQuestions', 'bankCurrentFilter', 'bankTypeSelected', 'bankSubjectTotals', 'bankSubjectTotal', 'bankSubjectTypeCount', 'bankHitText', 'bankScopeText', 'bankCurrentSubjectId', 'bankNormalizeTypeFilter', 'bankTypeOptions', 'bankTagRanking', 'bankTagOptions', 'bankTagOptionHidden', 'bankStarOptions', 'bankSelectValue', 'bankSchoolLabel', 'bankChoiceLetter', 'bankYearSelected', 'bankYearSourceLabel', 'bankYearRows', 'bankYearOptions', 'bankNormalizeYearFilter'];
// 筛选会话状态声明在 learn.mjs（同一 IIFE 作用域），单测注入等价初值才能驱动筛选逻辑；
// bank.mjs 自身不得声明这些变量（见「导航接线」用例，重复声明会抛语法错误）。
// currentSubjectId 声明在 src/app.mjs（全局学科选择器）：t17 起题库范围恒等于它（不再是页内 bankSubject）。
const stateVars = "var bankType = 'all', bankTag = 'all', bankStar = 'all', bankYear = '', bankQuery = '', bankOpen = null, bankOnlyWrong = false, currentSubjectId = 'math3';";
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
// t32 补充：统计学科卡片例题入库试点 → stats 16 + 170（origin=card 的卡片派生题）= 186，全库 225；
// 依据 backup/scratch/bank-cv/（生成脚本 build-bank-cv.mjs + 逐题对拍 check-card-questions.mjs）。
// 因此本文件不再硬编码 16/47 之类的分布数字，一律用下面的派生函数从 data/bank_*.js 现算；
// 只保留「不得低于已入库量」的护栏，避免题量悄悄失守（下限是护栏，不是对现实的固定描述）。
const MIN_QUESTIONS = { math3: 24, econ: 15, stats: 186 };
const MIN_TOTAL = 225;
// 题型定义来自 t4 的题型体系表（数学三 10 / 微观 6 / 统计 6）；t27 为「积分与变限积分」新增 math3 的
// integral 键（11 类）、t30 为「级数敛散性判别」新增 series 键（12 类）、t32 为统计卡片例题新增
// prob/dist/multi/numchar/limit 五键（6 → 11 类）。下表同为「护栏」而非对现实的固定描述：题型被误删时立刻转红。
const MIN_TYPES = { math3: 12, econ: 6, stats: 11 };
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
// t17 起题库页的骨架（四组下拉、徽标、空状态）由视图函数决定，所以把整个 src/bank.mjs（去掉
// export 块）放进第二个 vm，配最小 DOM 桩 + 语义对齐 src/actions.mjs `case 'bankFilter'` 的
// handleAction，就能断言「渲染出来的树」而不是「源码里有没有某段字符串」。
function mkNode() {
  const node = {
    tag: '', className: '', children: [], attrs: {}, text: '', value: '', _handlers: {}, parent: null,
    setAttribute(k, v) { this.attrs[k] = String(v); if (k === 'class') this.className = String(v); },
    getAttribute(k) { return Object.prototype.hasOwnProperty.call(this.attrs, k) ? this.attrs[k] : null; },
    appendChild(c) { this.children.push(c); if (c && typeof c === 'object') c.parent = this; return c; },
    addEventListener(t, h) { (this._handlers[t] = this._handlers[t] || []).push(h); },
    removeEventListener() {},
    fire(type, ev) { for (const h of (this._handlers[type] || [])) h(ev); },
    focus() { this.focused = true; },
    // 祖先/子树判定：供自定义下拉的「点控件外关闭」用（真实 DOM 的 Node.contains）
    contains(other) {
      if (!other) return false;
      if (other === this) return true;
      for (const c of this.children) {
        if (c === other || (c && typeof c.contains === 'function' && c.contains(other))) return true;
      }
      return false;
    },
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
// t7 自建下拉：按 facet（type/tag/star）取 trigger / 弹层 / 可选选项
const facetSel = (root, key) => byClass(root, 'bank-select').filter((s) => s.getAttribute('data-bank-facet') === key)[0];
const facetMenu = (root, key) => byClass(root, 'bank-select-menu').filter((m) => m.getAttribute('data-bank-menu') === key)[0];
const facetOptions = (root, key) => byClass(facetMenu(root, key), 'bank-select-option').filter((o) => !o.getAttribute('aria-disabled'));

const appEl = mkEl('div', 'app');
const view = { window: {}, String, Math, console, Number, Object, Array, DB: {} };
vm.createContext(view);
// 文档级监听（actions.mjs:315 的全局 click 委托 + bank.mjs 的「点控件外关闭 / Esc 关闭」都挂在 document 上）
const docHandlers = { click: [], keydown: [] };
const closestAttr = (node, attr) => {
  let n = node;
  while (n) {
    if (n.attrs && Object.prototype.hasOwnProperty.call(n.attrs, attr)) return n;
    n = n.parent || null;
  }
  return null;
};
view.document = {
  getElementById: (id) => (id === 'app' ? appEl : null),
  createElement: (t) => mkEl(t, ''),
  createElementNS: () => mkEl('svg', ''),
  addEventListener: (t, h) => { (docHandlers[t] = docHandlers[t] || []).push(h); },
  removeEventListener: () => {}
};
view.el = mkEl;
// texEl 的真渲染等价桩：浏览器里 texEl → renderTex 会写 data-tex 并把文本交给 KaTeX，
// 公式定界符 $ 不会留在节点文本里（无 KaTeX 时 render.mjs 的 plainFallback 也剥掉 $）。
// 单测据此断言「徽标 / 标签 / 下拉项确实过了渲染管线」，而不是只看源码里出现过 texEl。
const texElStub = (tag, cls, text) => {
  const n = mkEl(tag, cls);
  if (text !== undefined && text !== null) {
    const raw = String(text);
    n.setAttribute('data-tex', raw);
    n.text = raw.replace(/\$/g, '');
  }
  return n;
};
view.texEl = texElStub;
view.icon = (name) => { const n = mkEl('svg', 'ui-icon'); n.setAttribute('data-icon', name); return n; };
view.toast = () => {};
view.window.__actions = [];
for (const f of ['math3.js', 'econ.js', 'stats.js', 'bank_math3.js', 'bank_econ.js', 'bank_stats.js']) {
  vm.runInContext(read('data/' + f), view, { filename: f });
}
// 会话状态 + renderApp + handleAction：语义对齐 src/actions.mjs 的 case 'bankFilter'（只认
// type= / tag= / star=，未知 key（含已下线的 typeStar=）静默忽略且不抛错）与 case 'bankReset'
vm.runInContext(
  "var bankType = 'all', bankTag = 'all', bankStar = 'all', bankYear = '', bankQuery = '', bankOpen = null, currentSubjectId = 'math3';\n" +
  'function renderApp() { renderBank(); }\n' +
  'function handleAction(action, arg) {\n' +
  '  window.__actions.push([action, arg]);\n' +
  '  if (action === \'bankReset\') {\n' +
  "    bankType = 'all'; bankTag = 'all'; bankStar = 'all'; bankYear = ''; bankQuery = ''; bankOpen = null; toast('已重置题库筛选');\n" +
  '    renderApp(); return;\n' +
  '  }\n' +
  "  var eq = String(arg == null ? '' : arg).indexOf('=');\n" +
  '  if (eq > 0) {\n' +
  '    var k = String(arg).slice(0, eq), v = String(arg).slice(eq + 1);\n' +
  "    if (k === 'type') bankType = v; else if (k === 'tag') bankTag = v; else if (k === 'star') bankStar = v;\n" +
  "    else if (k === 'year') bankYear = (v === 'all' ? '' : v);\n" +
  '  }\n' +
  '  bankOpen = null;\n' +
  '  renderApp();\n' +
  '}',
  view,
  { filename: 'bank-session.js' }
);
vm.runInContext(read('src/bank.mjs').replace(/export \{[\s\S]*?\};\s*$/, ''), view, { filename: 'bank-app.js' });

// actions.mjs:315-319 的全局 click 委托：任何带 data-action 的元素统一走 handleAction（自建下拉的
// 选项就靠它派发 bankFilter）。注册在 bank.mjs 的「点控件外关闭」监听之前 —— 与浏览器里的注册顺序一致。
docHandlers.click.push((ev) => {
  const hit = closestAttr(ev.target, 'data-action');
  if (!hit) return;
  vm.runInContext(
    'handleAction(' + JSON.stringify(hit.getAttribute('data-action')) + ', ' + JSON.stringify(hit.getAttribute('data-arg')) + ')',
    view
  );
});
const dispatchDoc = (type, target, extra) => {
  const ev = Object.assign({ type, target }, extra || {});
  for (const h of (docHandlers[type] || [])) h(ev);
};
// 真点击 = 目标节点自身的监听 + 冒泡到 document（顺序与浏览器一致）
const clickNode = (node) => { node.fire('click', { type: 'click', target: node }); dispatchDoc('click', node); };
const pressEsc = () => dispatchDoc('keydown', appEl, { key: 'Escape' });

// 渲染：设置全局学科与会话筛选后再渲染（返回清空重建后的 #app 子树）
const renderTree = (sid, code) => {
  vm.runInContext(
    'currentSubjectId = ' + JSON.stringify(sid) + "; bankType = 'all'; bankTag = 'all'; bankStar = 'all'; bankYear = ''; bankQuery = ''; bankOpen = null;",
    view
  );
  if (code) vm.runInContext(code, view);
  vm.runInContext('renderBank()', view);
  return appEl;
};
const viewState = (expr) => vm.runInContext(expr, view);
const setViewState = (code) => vm.runInContext(code, view);

// ---------------------------------------------------------------- 数据契约

test('三科题库均挂载 window.BANK.<subj>，且每科题量不低于已入库下限（math3 ≥24、econ ≥15、stats ≥186、合计 ≥225）', () => {
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

test('每题字段齐全：题干/答案解析/难度五星/题型/知识点标签/来源（traps/hint 为条件必需）', () => {
  for (const sid of BANKS) {
    const bank = BANK[sid];
    const pool = new Set((SUBJECTS[sid].DATA || SUBJECTS[sid].data || []).map((c) => c.id));
    for (const q of bank.questions) {
      // t32：origin 缺省视为 'year'（真题）；'card' 为卡片派生题
      const origin = q.origin == null ? 'year' : q.origin;
      assert.ok(origin === 'year' || origin === 'card', sid + ' ' + q.id + ' origin 非法（只能是 year / card）：' + origin);
      for (const fld of ['stem', 'answer']) {
        assert.ok(typeof q[fld] === 'string' && q[fld].trim().length > 0, sid + ' ' + q.id + ' 缺 ' + fld);
      }
      // t32：traps/hint 条件必需——origin=card 时可整字段省略，但存在就必须非空（禁写空串）；altAnswer 一律可选
      for (const fld of ['traps', 'hint', 'altAnswer']) {
        if (q[fld] == null) {
          assert.ok(origin === 'card' || fld === 'altAnswer', sid + ' ' + q.id + ' 缺 ' + fld);
          continue;
        }
        assert.ok(typeof q[fld] === 'string' && q[fld].trim().length > 0,
          sid + ' ' + q.id + ' 的 ' + fld + ' 存在但为空（无内容应省略该字段）');
      }
      assert.ok(q.year, sid + ' ' + q.id + ' 缺 year');
      assert.ok(q.no != null && q.no !== '', sid + ' ' + q.id + ' 缺题号');
      assert.ok(Number.isInteger(q.star) && q.star >= 1 && q.star <= 5, sid + ' ' + q.id + ' 难度非 1..5 整数');
      assert.ok(Array.isArray(q.tags) && q.tags.length > 0, sid + ' ' + q.id + ' 缺知识点标签');
      for (const tg of q.tags) assert.ok(pool.has(tg), sid + ' ' + q.id + ' 标签不是现有知识点 id: ' + tg);
      // 溯源分族：真题走 src.file/src.no；卡片派生题以 src.card + src.note 为溯源主体
      if (origin === 'card') {
        assert.ok(q.src && typeof q.src.card === 'string' && q.src.card.trim().length > 0,
          sid + ' ' + q.id + ' 卡片派生题缺 src.card');
        assert.ok(typeof q.src.note === 'string' && q.src.note.trim().length > 0,
          sid + ' ' + q.id + ' 卡片派生题缺 src.note（溯源主体：来源原文 + 缺失字段说明）');
        assert.ok(pool.has(q.src.card), sid + ' ' + q.id + ' src.card 不是本学科卡片 id：' + q.src.card);
        assert.ok(q.src.note.indexOf(String(q.year)) >= 0, sid + ' ' + q.id + ' src.note 应含年份（年份须来自例题 src）');
      } else {
        assert.ok(q.src && q.src.file && q.src.no, sid + ' ' + q.id + ' 缺来源（文件名/题号）');
      }
      // t19 新增字段契约：school 为来源院校（含年份），三个数据文件逐题必备（题量下限由 MIN_QUESTIONS 护栏约束）
      assert.ok(typeof q.school === 'string' && q.school.trim().length > 0, sid + ' ' + q.id + ' 缺 school（来源院校）');
      assert.ok(q.school.indexOf(String(q.year)) >= 0, sid + ' ' + q.id + ' school 应含年份：' + q.school);
    }
  }
});

// ------------------------------------------------- t32：卡片例题 → 题库 逐题对拍（统计学科试点）
// 期望值一律从 data/stats.js 现算（EXAMPLE / META / PITFALL / MNEM），不读生成脚本的中间产物：
// 生成脚本被改写、题库文件被手改、或某条目漏进/多进题库，都会在这里转红。
const cardEntryIds = (EXAMPLE) => {
  const out = [];
  for (const key of Object.keys(EXAMPLE)) {
    const val = EXAMPLE[key];
    const arr = Array.isArray(val) ? val : [val];
    arr.forEach((e, i) => {
      const src = String((e && e.src) == null ? '' : e.src).trim();
      const m = src.match(/(?:19|20)\d{2}/);
      if (!m) return; // 例题 src 无四位年份 → 按口径排除（例题仅真题红线，不编造年份）
      out.push({ key, idx: i, entry: e, year: Number(m[0]), src, id: 'cv-st-' + key + (i > 0 ? '-' + (i + 1) : '') });
    });
  }
  return out;
};

test('卡片派生题（t32 统计试点）：id/标签/星级/题干/答案/另解/陷阱/提示与 data/stats.js 逐题同源', () => {
  const S = SUBJECTS.stats;
  const META = S.META || {};
  const EXAMPLE = S.EXAMPLE || {};
  const PITFALL = S.PITFALL || {};
  const MNEM = S.MNEM || {};
  const cards = new Set((S.DATA || []).map((c) => c.id));
  const expected = cardEntryIds(EXAMPLE);
  const derived = BANK.stats.questions.filter((q) => q.origin === 'card');
  assert.ok(expected.length > 0 && derived.length > 0, '本用例不得空转（统计应有卡片派生题）');
  // ① 集合一一对应：EXAMPLE 里带四位年份的条目 ⇄ 题库 origin=card 的题（多一条少一条都转红）
  assert.deepEqual(Array.from(derived, (q) => q.id).sort(), Array.from(expected, (e) => e.id).sort(),
    'EXAMPLE（带年份条目）→ 题库 的 id 集合应一一对应');
  // POC 首批真题原样保留（本任务只做增量）
  assert.equal(BANK.stats.questions.length - derived.length, 16, 'POC 首批 16 题应逐条保留（增量入库）');
  const byId = new Map(expected.map((e) => [e.id, e]));
  for (const q of derived) {
    const e = byId.get(q.id);
    // ② 题干/答案/另解逐字同源；a2 只进 altAnswer，不并入 answer、不另立题目
    assert.equal(q.stem, e.entry.q, q.id + ' 题干应与 EXAMPLE 的 q 逐字一致');
    assert.equal(q.answer, e.entry.a, q.id + ' 答案应与 EXAMPLE 的 a 逐字一致');
    assert.equal(q.altAnswer == null ? null : q.altAnswer, e.entry.a2 == null ? null : e.entry.a2,
      q.id + ' 另解只对应 EXAMPLE 的 a2（无 a2 则整字段省略）');
    // ③ 陷阱/提示只取自 PITFALL/MNEM，禁编造：有则逐字相等、无则整字段省略
    assert.equal(q.traps == null ? null : q.traps, PITFALL[e.key] == null ? null : PITFALL[e.key],
      q.id + ' 陷阱应取自 PITFALL[' + e.key + ']（无条目则省略字段，不得写空串）');
    assert.equal(q.hint == null ? null : q.hint, MNEM[e.key] == null ? null : MNEM[e.key],
      q.id + ' 提示应取自 MNEM[' + e.key + ']（无条目则省略字段，不得写空串）');
    // ④ 标签＝码 space（只是来源卡片 id，不得写 META 的中文名）；星级＝META 首元素
    assert.deepEqual(Array.from(q.tags), [e.key], q.id + ' tags 应为 [来源卡片 id]');
    assert.ok(META[e.key] && Array.isArray(META[e.key]), q.id + ' 卡片缺 META 条目：' + e.key);
    assert.equal(q.star, META[e.key][0], q.id + ' 星级应等于 META[' + e.key + '][0]');
    assert.ok(cards.has(e.key), q.id + ' 来源卡片应为 data/stats.js 的真实卡片：' + e.key);
    // ⑤ 年份只来自例题 src；school 是「来源 + 年份」口径且年份在尾部（年份筛选简称＝去掉尾部年份的前缀）
    assert.equal(q.year, e.year, q.id + ' 年份应取自例题 src');
    assert.ok(String(q.src.note).indexOf(e.src) >= 0, q.id + ' src.note 应含例题 src 原文：' + e.src);
    assert.match(String(q.school), new RegExp(String(e.year) + ' 年$'), q.id + ' school 应以「<年份> 年」结尾');
    assert.ok(B.bankYearSourceLabel(q.year, q.school).length > 0, q.id + ' 年份来源简称不得为空');
    assert.equal(q.no, '卡片 ' + e.key + (e.idx > 0 ? '-' + (e.idx + 1) : ''), q.id + ' 题号应为「卡片 <id>」形态');
    assert.ok(typeof q.type === 'string' && q.type.length > 0, q.id + ' 缺题型');
    // ⑥ 逐字段不得是空串/undefined（渲染层与校验器都不应拿到它们）
    for (const [k, v] of Object.entries(q)) {
      if (typeof v === 'string') assert.ok(v.trim().length > 0, q.id + ' 字段 ' + k + ' 不得为空串');
      assert.notEqual(v, undefined, q.id + ' 字段 ' + k + ' 不得是 undefined');
    }
  }
});
// ---------------------------------------------------------- 答案字母口径（t7 提到模块级）
// 选择题答案里的字母原本只写在散文里（如「选 B。记 $a_n=…」）。t7 起界面要显式标注，
// 因此把口径集中成一份：三个正则按序尝试——散文「选 B」→「答案：B」→「(B)」，
// 解析不出返回 null（界面不得显示空标识）。src/bank.mjs 的 bankChoiceLetter() 必须与之同口径，
// 本文件两处用例（期望答案表护栏 / 选择题字母标识）共用这一份，避免两边各写一份漂移。
const LETTER_RES = [/选\s*([A-D])\b/, /答案\s*[：:]?\s*\(?([A-D])\)?/, /\(([A-D])\)/];
const letterOf = (answer) => {
  const s = String(answer);
  for (const re of LETTER_RES) {
    const m = s.match(re);
    if (m) return m[1];
  }
  return null;
};

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

test('题目 id 命名：真题形如 m3-2012-1 / ec-2016-1，卡片派生题形如 cv-st-<cardId>（t32）', () => {
  const pool = (sid) => new Set((SUBJECTS[sid].DATA || SUBJECTS[sid].data || []).map((c) => c.id));
  for (const sid of BANKS) {
    for (const q of BANK[sid].questions) {
      if (q.origin === 'card') {
        // t32：卡片派生题 id＝cv-<sid 缩写>-<卡片 id>[-<条目序>]，与真题 id 零相撞
        assert.ok(/^cv-st-[A-Za-z0-9]+(-\d+)?$/.test(q.id), '卡片派生题 id 命名应形如 cv-st-pb01 / cv-st-xx03-2：' + q.id);
        assert.equal(q.id.indexOf('cv-st-' + q.src.card), 0, q.id + ' 卡片派生题 id 应以 cv-st-<src.card> 开头');
        assert.ok(pool(sid).has(q.src.card), q.id + ' 卡片派生题的来源卡片应存在于本学科卡片数据');
      } else {
        assert.ok(/^[a-z]{1,3}\d?-\d{4}-\d+$/.test(q.id), '题目 id 命名应形如 m3-2012-1 / ec-2016-1：' + q.id);
      }
    }
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

test('视图接线契约：renderBank 可渲染，筛选由四组自定义下拉的选项派发既有 bankFilter 动作', () => {
  const src = read('src/bank.mjs');
  assert.match(src, /function renderBank\(\) \{/, '应导出 renderBank');
  assert.match(src, /app\.innerHTML = ''/, 'renderBank 应清空 #app');
  // t7：原生 <select> 的 <option> 只吃纯文本、无法承载 KaTeX，三组筛选改自建下拉
  // （trigger button + 弹层 listbox）；选项 button 携带 data-action="bankFilter" + data-arg
  // （key=value 口径不变），由 src/actions.mjs 的全局 click 委托派发既有动作与既有参数名，
  // 不新增 action 名；折叠态 trigger 自身不挂 data-action，展开时不会被委托重渲染。
  assert.match(src, /data-action', 'bankFilter'/, '下拉选项应挂既有 bankFilter 动作名');
  assert.match(src, /data-arg', key \+ '=' \+ v\)/, '下拉选项应携带 key=value 的既有参数口径');
  assert.ok(src.indexOf("el('select'") < 0, '原生 <select> 应下线（<option> 无法渲染公式）');
  assert.match(src, /aria-haspopup', 'listbox'/, 'trigger 应声明 aria-haspopup=listbox');
  assert.ok(src.indexOf('function bankOpenSelect(') >= 0 && src.indexOf('function bankCloseSelect()') >= 0, '应自建下拉开合');
  assert.ok(src.indexOf('bankSelectOpen = null') >= 0, '重渲染前应复位下拉展开态');
  assert.match(src, /k !== 'Escape' && k !== 'Esc'/, 'Esc 应可关闭下拉');
  assert.match(src, /data-action', 'bankOpen'/, '题目应可点击进详情');
  assert.match(src, /data-action', 'bankAddWrong'/, '每题应有一键入错题本按钮');
  for (const arg of ['type=', 'tag=', 'star=', 'year=']) {
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
  for (const v of ['bankType', 'bankTag', 'bankStar', 'bankYear', 'bankQuery', 'bankOpen']) {
    assert.ok(src.indexOf('let ' + v) >= 0, 'learn.mjs 应声明 ' + v + '（同一 IIFE 作用域，不可在 bank.mjs 重复声明）');
  }
  assert.match(src, /bankType = 'all';\s*bankTag = 'all';\s*bankStar = 'all';\s*bankYear = '';/, 'resetSessionState 应复位题库筛选（t14 起含年份/卷）');
  assert.match(src, /\['bank', '题库'\]/, 'cards 二级导航应含题库入口');
  assert.match(src, /bank: '(?:bank|deck)'/, '题库入口应有图标映射');
  assert.match(src, /currentView === 'bank'\) return 'cards'/, 'shellModuleId 应把题库归到「学习」一级');
  const bankSource = read('src/bank.mjs');
  for (const v of ['bankType', 'bankTag', 'bankStar', 'bankYear', 'bankQuery', 'bankOpen']) {
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
  "bankType='all'; bankTag='all'; bankStar='all'; bankYear=''; bankQuery=''; bankOpen=null; currentSubjectId='math3';"
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
  assert.deepEqual(filterOf(), { type: 'regress', tag: 'xt15', star: '4', year: '', query: '' });
  // 工具条范围文案按当前学科总量渲染，且不含命中数
  const totals = B.bankSubjectTotals();
  assert.equal(B.bankScopeText('math3', totals), subjLabel('math3') + ' · 共 ' + qCount('math3') + ' 题 · ' + typeCount('math3') + ' 类题型');
  assert.equal(B.bankScopeText('stats', totals), subjLabel('stats') + ' · 共 ' + qCount('stats') + ' 题 · ' + typeCount('stats') + ' 类题型');
  assert.match(read('src/bank.mjs'), /bankHitLine\(rows\.length, bankSubjectTotal\(totals, sid\)\)/, '概览区应渲染「当前筛选命中」行（命中数来自筛选结果，总量走当前学科）');
  resetBankFilter();
});

test('四组下拉的选项口径：题型按库内频次降序、知识点按命中数降序（上限 60）、难度 ★5→★1、年份降序，当前值回填', () => {
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

test('渲染树：四组自定义下拉（trigger button + 弹层 listbox，各带可见 label）替代原生 select 与 chip 组', () => {
  resetBankFilter(); // 纯函数沙箱与视图沙箱各自持有会话状态，先归零再取期望值
  const tree = renderTree('math3');
  assert.equal(byClass(tree, 'bank-filters').length, 1, '应渲染 .bank-filters 容器');
  // t7：原生 select 退场（<option> 无法承载 KaTeX 渲染的公式）
  assert.equal(byTag(tree, 'select').length, 0, '不应再有原生 select');
  assert.equal(byTag(tree, 'option').length, 0, '不应再有原生 option');
  assert.equal(byClass(tree, 'bank-select-menu').length, 4, '题型/知识点/难度/年份·卷 应各渲染一个弹层 listbox');
  const keys = ['type', 'tag', 'star', 'year'];
  assert.deepEqual(keys.map((k) => facetSel(tree, k) && facetSel(tree, k).getAttribute('data-bank-facet')),
    keys, '四组下拉顺序应为 题型/知识点/难度/年份·卷（t14 仅在末尾追加年份，既有三组不重排）');
  for (const key of keys) {
    const sel = facetSel(tree, key);
    assert.ok(sel, '应有 ' + key + ' 下拉 trigger');
    assert.equal(sel.tag, 'button', key + ' 下拉 trigger 应为 button（可聚焦/可回车）');
    assert.equal(sel.getAttribute('type'), 'button');
    assert.equal(sel.getAttribute('id'), 'bank-filter-' + key, '下拉应有稳定 id（供 label 关联）');
    assert.equal(sel.getAttribute('aria-haspopup'), 'listbox');
    assert.equal(sel.getAttribute('aria-expanded'), 'false', '初始应为收起态');
    const label = byTag(tree, 'label').filter((l) => l.getAttribute('for') === sel.getAttribute('id'));
    assert.equal(label.length, 1, '每个下拉都应有可见 label（for=bank-filter-' + key + '）');
    assert.ok(label[0].text.length > 0, 'label 应有可见文案');
    assert.equal(sel.getAttribute('data-arg'), key + '=all', 'data-arg 应可观察当前筛选参数（口径不变）');
    const text = byClass(sel, 'bank-select-text');
    assert.equal(text.length, 1, 'trigger 内应有 .bank-select-text（折叠态显示当前值）');
    assert.equal(text[0].getAttribute('data-tex'), '全部' + (key === 'star' ? '难度' : key === 'tag' ? '知识点' : key === 'year' ? '年份' : '题型'),
      '折叠态文案应经渲染管线（data-tex）');
    assert.equal(byClass(sel, 'bank-select-caret').length, 1, 'trigger 内应有 .bank-select-caret 指示可展开');
    // 弹层：role=listbox，初始 aria-hidden
    const menu = facetMenu(tree, key);
    assert.ok(menu, '应有 ' + key + ' 弹层');
    assert.equal(menu.getAttribute('role'), 'listbox');
    assert.equal(menu.getAttribute('aria-hidden'), 'true', '初始应收起');
    assert.equal(menu.className, 'bank-select-menu', '收起态不带 is-open');
  }
  // 选项：button + role=option + 既有 data-action/data-arg 口径，文本经渲染管线
  const typeOpts = facetOptions(tree, 'type');
  assert.equal(typeOpts.length, B.bankTypeOptions('math3').length, '题型下拉选项数应与库内题型一致');
  const tAll = typeOpts.filter((o) => o.getAttribute('data-value') === 'all')[0];
  assert.ok(tAll, '首项应为全选');
  assert.equal(tAll.tag, 'button');
  assert.equal(tAll.getAttribute('role'), 'option');
  assert.equal(tAll.getAttribute('data-action'), 'bankFilter', '选项靠 actions.mjs 的全局 click 委托派发');
  assert.equal(tAll.getAttribute('data-arg'), 'type=all', 'data-arg 口径 key=value');
  assert.equal(tAll.getAttribute('aria-selected'), 'true', '当前值（全选）应回填选中态');
  assert.ok(tAll.className.split(/\s+/).indexOf('is-selected') >= 0, '当前值应带 is-selected');
  assert.equal(tAll.getAttribute('data-tex'), '全部题型', '选项文本应经渲染管线');
  const starOpts = facetOptions(tree, 'star');
  assert.equal(starOpts.length, B.bankStarOptions().length, '难度下拉应为 全部难度 + ★5…★1（选项数由 bankStarOptions 派生）');
  assert.deepEqual(starOpts.map((o) => o.getAttribute('data-value')), ['all', '5', '4', '3', '2', '1'], '难度降序口径不变');
  assert.equal(starOpts.map((o) => o.getAttribute('aria-selected')).indexOf('true'), 0, '仅全选处于选中态');
  // 知识点下拉：选项来自 bankTagOptions（上限 BANK_TAG_OPTION_LIMIT 口径不变）
  const tagOpts = facetOptions(tree, 'tag');
  assert.equal(tagOpts.length, B.bankTagOptions(B.bankFilteredQuestions(), 'all').length, '知识点选项数应与 bankTagOptions 一致');
  const tagIds = B.bankFilteredQuestions().flatMap((q) => q.tags || []);
  const formulaTags = [...new Set(tagIds)].filter((id) => (B.bankTagTitle('math3', id) || '').indexOf('$') >= 0);
  assert.ok(formulaTags.length > 0, '数学三应有含公式的知识点（否则本用例失去意义）');
  const shown = tagOpts.map((o) => o.getAttribute('data-value'));
  const formulaShown = formulaTags.filter((id) => shown.indexOf(id) >= 0);
  assert.ok(formulaShown.length > 0, '至少应有 1 个含公式的知识点进入选项（上限 60 内）');
  for (const o of tagOpts) {
    const raw = o.getAttribute('data-tex');
    assert.ok(raw !== null, '知识点选项文本应经渲染管线：' + o.getAttribute('data-value'));
    assert.equal(o.text.indexOf('$'), -1, '渲染后选项文本不应残留 $：' + raw);
  }
  // 上限外的知识点只做提示：不可选（无 data-action），保留既有语义类
  const rows = B.bankFilteredQuestions();
  if (B.bankTagOptionHidden(rows, 'all') > 0) {
    const more = byClass(facetMenu(tree, 'tag'), 'bank-select-option-more');
    assert.equal(more.length, 1, '超上限应渲染「其余 N 个知识点」提示项');
    assert.equal(more[0].getAttribute('aria-disabled'), 'true');
    assert.equal(more[0].getAttribute('data-action'), null, '提示项不可派发动作');
  }
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
  assert.equal(byClass(appEl, 'bank-select').filter((s) => s.getAttribute('data-bank-facet')).length, 4, '历史残留参数不应影响筛选器渲染');
  assert.equal(byClass(appEl, 'bank-item').length, B.bankFilteredQuestions().length, '历史残留参数不应改变结果集');
  vm.runInContext("bankTypeStar = 'all'; bankSubject = 'math3';", view);
  const home = read('src/home.mjs');
  assert.ok(home.indexOf("bank: '") >= 0, 'UI_ICONS 应新增 bank 键');
  const bankIcon = home.match(/bank: '([^']*)'/);
  assert.ok(bankIcon && /^(?:<path[^>]*\/>|<rect[^>]*\/>|<circle[^>]*\/>)+$/.test(bankIcon[1]), 'bank 图标应为纯线稿（path/rect/circle），不带 fill/stroke');
});

test('四组下拉交互端到端：点击展开 / 选择派发既有 bankFilter 与既有参数名 / 点外部与 Esc 关闭', () => {
  const tree = renderTree('stats');
  const sel = facetSel(tree, 'type');
  assert.ok(sel, '应有题型下拉');
  const menu = facetMenu(tree, 'type');
  const regress = facetOptions(tree, 'type').filter((o) => o.getAttribute('data-value') === 'regress')[0];
  assert.ok(regress, '统计学应有「回归分析」题型选项');

  // ① 点击 trigger 展开（同一时刻只展开一个）
  clickNode(sel);
  assert.equal(sel.getAttribute('aria-expanded'), 'true', '点击后应展开');
  assert.ok(menu.className.split(/\s+/).indexOf('is-open') >= 0, '展开态应带 is-open');
  assert.equal(menu.getAttribute('aria-hidden'), 'false');
  assert.equal(menu.getAttribute('role'), 'listbox');
  // ② 再点同一 trigger 收起
  clickNode(sel);
  assert.equal(sel.getAttribute('aria-expanded'), 'false', '再点应收起');
  assert.equal(menu.className, 'bank-select-menu');
  assert.equal(menu.getAttribute('aria-hidden'), 'true');
  // ③ 点控件外部关闭
  clickNode(sel);
  assert.equal(sel.getAttribute('aria-expanded'), 'true');
  clickNode(byClass(tree, 'bank-list')[0] || tree);
  assert.equal(sel.getAttribute('aria-expanded'), 'false', '点击控件外部应收起');
  // ④ Esc 关闭并把焦点还给 trigger
  clickNode(sel);
  assert.equal(sel.getAttribute('aria-expanded'), 'true');
  pressEsc();
  assert.equal(sel.getAttribute('aria-expanded'), 'false', 'Esc 应收起');
  assert.equal(sel.focused, true, 'Esc 收起后焦点应回到 trigger');

  // ⑤ 点选项：经 actions.mjs 的全局 click 委托派发既有动作与既有参数名
  clickNode(sel);
  clickNode(regress);
  const lastAction = viewState('window.__actions[window.__actions.length - 1]');
  assert.deepEqual(Array.from(lastAction), ['bankFilter', 'type=regress'], '选选项应派发 bankFilter + type=regress');
  assert.equal(viewState('bankType'), 'regress', '筛选状态应被写入（收口在 actions.mjs）');
  assert.equal(viewState('bankOpen'), null, '切筛选应退出详情页');
  assert.equal(viewState('bankSelectOpen'), null, '选择后展开态应归零（模块内部状态）');
  // 重渲染后的树：命中 6 题、trigger 回填 regress、弹层默认收起、选中项 is-selected，可再放宽回全选
  assert.ok(treeText(appEl).indexOf('当前筛选命中 ' + typeHit('stats', 'regress') + ' 题（全部 ' + qCount('stats') + ' 题）') >= 0, '重渲染后应显示命中 ' + typeHit('stats', 'regress') + ' 题（全部 ' + qCount('stats') + ' 题）');
  const after = facetSel(appEl, 'type');
  assert.equal(after.getAttribute('data-arg'), 'type=regress', 'trigger 应回填当前筛选参数');
  assert.equal(byClass(after, 'bank-select-text')[0].getAttribute('data-tex'), B.bankTypeOptions('stats').filter((o) => o.value === 'regress')[0].label, '折叠态文案应为当前题型');
  assert.equal(facetMenu(appEl, 'type').getAttribute('aria-hidden'), 'true', '重渲染后弹层应收起');
  const afterSelOpts = facetOptions(appEl, 'type').filter((o) => o.getAttribute('aria-selected') === 'true');
  assert.equal(afterSelOpts.length, 1, '重渲染后应只有一个选中项');
  assert.equal(afterSelOpts[0].getAttribute('data-value'), 'regress');
  clickNode(facetOptions(appEl, 'type').filter((o) => o.getAttribute('data-value') === 'all')[0]);
  assert.ok(treeText(appEl).indexOf('当前筛选命中 ' + qCount('stats') + ' 题') >= 0, '放宽回全选应恢复学科全量（' + qCount('stats') + ' 题）');
  // 知识点与难度同样走既有参数名
  clickNode(facetOptions(appEl, 'tag').filter((o) => o.getAttribute('data-value') === 'xt15')[0]);
  assert.equal(viewState('bankTag'), 'xt15');
  clickNode(facetOptions(appEl, 'star').filter((o) => o.getAttribute('data-value') === '4')[0]);
  assert.equal(viewState('bankStar'), '4');
  assert.deepEqual(Array.from(viewState('window.__actions')).slice(-3).map((a) => Array.from(a).join('|')), ['bankFilter|type=all', 'bankFilter|tag=xt15', 'bankFilter|star=4'], '只能派发既有动作名与既有参数名');
  // 展开态是 bank.mjs 内部状态：重渲染后旧节点已丢弃，不得残留 is-open
  assert.equal(byClass(appEl, 'bank-select-menu').filter((m) => m.className.split(/\s+/).indexOf('is-open') >= 0).length, 0, '重渲染后不应残留展开态');
});

// ------------------------------------------------------------------ t14 年份/卷 筛选
// 期望值一律从 data/bank_*.js 现算（年份与来源都是题目自带的 q.year / q.school，零数据改动）。
const yearRowsOf = (sid) => {
  const bag = new Map();
  for (const q of BANK[sid].questions) {
    const key = String(q.year) + '|' + q.school;
    if (!bag.has(key)) bag.set(key, { year: String(q.year), school: String(q.school), count: 0 });
    bag.get(key).count++;
  }
  return [...bag.values()].sort((a, b) => Number(b.year) - Number(a.year) || (a.school < b.school ? -1 : 1));
};
const yearHitIn = (sid, value) => {
  const bar = String(value).indexOf('|');
  const year = bar < 0 ? String(value) : String(value).slice(0, bar);
  const school = bar < 0 ? null : String(value).slice(bar + 1);
  return BANK[sid].questions.filter((q) => String(q.year) === year && (school === null || String(q.school) === school));
};
// 年份 × 题型 × 难度 × 关键词 的独立口径（不走 bankMatch，避免与被测实现同源）
const comboHit = (sid, value, type, star, query) => yearHitIn(sid, value).filter((q) => {
  const typeOk = B.bankTypeSelected(Object.assign({ subject: sid }, q), type);
  const starOk = star === 'all' || Number(q.star) >= Number(star);
  const hay = (String(q.stem || '') + ' ' + String(q.answer || '') + ' ' + String(q.hint || '') + ' ' + String(q.traps || '')).toLowerCase();
  const queryOk = !query || hay.indexOf(String(query).toLowerCase()) >= 0;
  return typeOk && starOk && queryOk;
}).length;

test('年份/卷选项：按库内 (年份, 来源) 聚合派生（年份降序、同年分来源、附题数），当前值回填', () => {
  resetBankFilter();
  for (const sid of BANKS) {
    // 前置：value 里存完整来源串要求每题都带 school（数据侧已补齐；缺失会让同年多来源无法区分）
    for (const q of BANK[sid].questions) {
      assert.ok(q.school && String(q.school).indexOf(String(q.year)) >= 0, sid + ' 每题都应带 school 且含年份：' + q.id);
    }
    const rows = B.bankYearRows(sid);
    const want = yearRowsOf(sid);
    assert.deepEqual(
      Array.from(rows, (r) => [String(r.year), String(r.school), r.count]),
      Array.from(want, (r) => [r.year, r.school, r.count]),
      sid + ' 年份聚合应与数据文件逐项一致（年份降序、同年按来源升序、附题数）'
    );
    assert.equal(rows.reduce((n, r) => n + r.count, 0), qCount(sid), sid + ' 聚合题数之和应等于全科题量');

    const opts = B.bankYearOptions(sid);
    assert.equal(opts.length, rows.length + 1, sid + ' 选项数 = 聚合分组数 + 全选');
    assert.equal(opts[0].value, 'all');
    assert.equal(opts[0].label, '全部年份');
    const covered = new Set();
    for (const o of opts.slice(1)) {
      const value = String(o.value);
      const hit = yearHitIn(sid, value);
      assert.ok(hit.length >= 1, sid + ' 年份选项不得命中 0 题：' + value);
      for (const q of hit) covered.add(q.id);
      assert.equal(String(o.label).indexOf(value.split('|')[0]) >= 0, true, sid + ' 选项文案应含年份：' + o.label);
      assert.ok(String(o.label).indexOf(String(hit.length) + ' 题') >= 0, sid + ' 选项文案应含题数：' + o.label);
      // 谓词与选项口径同源：bankYearSelected 只认这一份编码
      assert.equal(B.bankYearSelected({ year: value.split('|')[0], school: hit[0].school }, value), true);
    }
    assert.equal(covered.size, qCount(sid), sid + ' 年份选项并集应覆盖全科题目');
    assert.equal(new Set(opts.map((o) => String(o.value))).size, opts.length, sid + ' 选项 value 不得重复');
    assert.equal(new Set(opts.map((o) => String(o.label))).size, opts.length, sid + ' 选项 label 不得重复');
    assert.deepEqual(Array.from(B.bankYearOptions(sid), (o) => String(o.value)), Array.from(opts, (o) => String(o.value)), sid + ' 选项派生应稳定（两次调用一致）');

    // 同年单来源 → 裸年份；同年多来源 → 「年份|来源」逐年逐来源，来源简称必须是来源串前缀（去掉尾部年份）
    const multi = [...new Set(rows.map((r) => r.year))].filter((y) => rows.filter((r) => r.year === y).length > 1);
    for (const r of rows) {
      const isMulti = multi.indexOf(r.year) >= 0;
      if (isMulti) {
        const o = opts.filter((x) => String(x.value) === r.year + '|' + r.school)[0];
        assert.ok(o, sid + ' ' + r.year + ' 年多来源应逐年逐来源给出选项：' + r.year + '|' + r.school);
        const src = String(B.bankYearSourceLabel(r.year, r.school));
        assert.ok(src.length > 0 && r.school.indexOf(src) === 0, sid + ' 来源简称应是来源串的前缀（去掉尾部年份）：' + src);
        assert.ok(String(o.label).indexOf(src) >= 0, sid + ' 多来源选项文案应含来源简称：' + o.label);
      } else {
        assert.ok(opts.filter((x) => String(x.value) === r.year).length === 1, sid + ' 单来源年只应有裸年份选项：' + r.year);
      }
    }
  }
  // t21：math3 2025 曾把同一份卷子写成两种来源措辞（3 题拆成两项），现已统一为一份卷 →
  // 该年退回「裸年份」选项，且必须一次筛出全部 3 题（措辞与封面亲读口径见下一条用例）
  const y2025 = B.bankYearOptions('math3').filter((o) => String(o.value).indexOf('2025') === 0);
  assert.deepEqual(Array.from(y2025, (o) => String(o.value)), ['2025'], 'math3 2025 只应有一个年份/卷选项，实际 ' + JSON.stringify(Array.from(y2025, (o) => String(o.value))));
  assert.equal(yearHitIn('math3', '2025').length, 3, 'math3 2025 单选项应命中 3 题');
});

// ------------------------------------------------------------------ t21 同年单来源（题源语义统一）
// 同一份卷子不得出现两种 school 措辞：否则「年份/卷」筛选会把一份卷拆成多项，考生也分不清来源。
// 期望值一律从 data/bank_*.js 现算；规范化口径在测试内独立重写（与 tools/check_data.mjs 同口径但不同源）。
const normSchoolForTest = (s) => String(s == null ? '' : s)
  .replace(/[\uFF01-\uFF5E]/g, (ch) => String.fromCharCode(ch.charCodeAt(0) - 0xFEE0))
  .replace(/\u3000/g, ' ')
  .replace(/[·・•∙‧]/g, '-')
  .replace(/[／∕]/g, '/')
  .replace(/[—–―‐－]/g, '-')
  .replace(/\s+/g, '')
  .replace(/入学统一考试/g, '招生考试')
  .replace(/入学考试/g, '招生考试');

test('年份/来源口径：同一 (年份, 规范化来源) 只有一种措辞；单来源年裸年份、多来源年逐来源分项且都能整项筛出（t21 / t32）', () => {
  resetBankFilter();
  for (const sid of BANKS) {
    // ① 逐题按（年份, 规范化来源）聚合：同一份卷子的措辞必须唯一。
    //    t32 起统计学科引入卡片派生题（同年多校真题，如 2016 年同时有复旦/南开/中科大/北大光华…），
    //    同一年多种来源是数据现实，护栏因此从「每个年份一种措辞」收紧到「每个 (年份, 来源) 一种措辞」。
    const byYear = new Map();
    for (const q of BANK[sid].questions) {
      const y = String(q.year);
      if (!byYear.has(y)) byYear.set(y, new Map());
      const raw = String(q.school == null ? '' : q.school).trim();
      const key = normSchoolForTest(raw);
      if (!byYear.get(y).has(key)) byYear.get(y).set(key, new Set());
      byYear.get(y).get(key).add(raw);
    }
    for (const [y, groups] of byYear) {
      for (const [key, set] of groups) {
        assert.equal(set.size, 1, sid + ' ' + y + ' 年同一来源出现了多种措辞：' + JSON.stringify([...set]));
      }
    }

    // ② 聚合行：行数＝不同 (年份, 来源) 对数，每行来源串含年份
    const rows = B.bankYearRows(sid);
    const own = yearRowsOf(sid);
    assert.equal(rows.length, own.length, sid + ' 聚合行数应等于不同 (年份, 来源) 对数（现算 ' + own.length + '）');
    assert.deepEqual(
      Array.from(rows, (r) => r.year + '|' + r.school).sort(),
      own.map((r) => r.year + '|' + r.school).sort(),
      sid + ' 聚合行应与数据现算逐行一致'
    );
    for (const r of rows) {
      assert.ok(String(r.school).indexOf(String(r.year)) >= 0, sid + ' ' + r.year + ' 来源串应含年份：' + r.school);
    }
    const perYear = new Map();
    for (const r of rows) perYear.set(String(r.year), (perYear.get(String(r.year)) || 0) + 1);

    // ③ 选项编码与谓词口径：单来源年 → 裸年份；多来源年 → 「年份|来源」；两种都要一次筛出对应题目
    const opts = B.bankYearOptions(sid).slice(1);
    assert.equal(opts.length, rows.length, sid + ' 选项数应等于 (年份, 来源) 行数');
    const seenValue = new Set();
    for (const o of opts) {
      const value = String(o.value);
      assert.equal(seenValue.has(value), false, sid + ' 选项 value 不得重复：' + value);
      seenValue.add(value);
      assert.equal(String(o.label).indexOf('|'), -1, sid + ' 选项文案不得含来源分隔符：' + o.label);
      assert.equal(String(o.label).indexOf(value.slice(0, 4) + ' 年') === 0, true, sid + ' 选项文案应以「<年份> 年」开头：' + o.label);
      const row = rows.filter((r) => (perYear.get(String(r.year)) > 1 ? r.year + '|' + r.school : r.year) === value)[0];
      assert.ok(row, sid + ' 选项 value 应对应一条聚合行：' + value);
      if (perYear.get(String(row.year)) === 1) {
        assert.equal(value.indexOf('|'), -1, sid + ' 同年单来源时选项 value 应是裸年份：' + value);
      } else {
        assert.ok(value.indexOf('|') > 0, sid + ' 同年多来源时选项 value 应是「年份|来源」：' + value);
        assert.ok(String(o.label).indexOf(B.bankYearSourceLabel(row.year, row.school)) > 0,
          sid + ' 多来源项文案应带来源简称：' + o.label);
      }
      // 与下拉/谓词口径一致（对拍走独立口径，不调 bankMatch）
      setBankFilter("currentSubjectId = " + JSON.stringify(sid) + "; bankYear = " + JSON.stringify(value) + ";");
      assert.deepEqual(
        Array.from(B.bankFilteredQuestions(), (q) => q.id).sort(),
        Array.from(yearHitIn(sid, value), (q) => q.id).sort(),
        sid + ' ' + value + ' 应一次筛出该项全部题目'
      );
    }

    // ④ 同一年各来源项互不重叠、并集＝该年全部题目（多来源年的分项必须是无缝划分）
    for (const y of perYear.keys()) {
      const yearOpts = opts.filter((o) => String(o.value) === y || String(o.value).indexOf(y + '|') === 0);
      assert.equal(yearOpts.length, perYear.get(y), sid + ' ' + y + ' 年的选项数应与来源数一致');
      const ids = [];
      for (const o of yearOpts) {
        const v = String(o.value);
        const bar = v.indexOf('|');
        const vy = bar < 0 ? v : v.slice(0, bar);
        const vs = bar < 0 ? null : v.slice(bar + 1);
        for (const q of BANK[sid].questions) {
          if (String(q.year) === vy && (vs === null || String(q.school) === vs)) ids.push(q.id);
        }
      }
      assert.equal(new Set(ids).size, ids.length, sid + ' ' + y + ' 年各来源项不得重叠');
      assert.equal(new Set(ids).size, BANK[sid].questions.filter((q) => String(q.year) === y).length,
        sid + ' ' + y + ' 年各来源项并集应覆盖该年全部题目');
    }
  }

  // ④ math3 2025 逐项定案：同一份卷（试题册封面亲读口径「2025 年全国硕士研究生招生考试 试题（数学三）科目代码：303」）
  const y2025 = BANK.math3.questions.filter((q) => String(q.year) === '2025');
  assert.equal(y2025.length, 3, 'math3 2025 应有 3 题');
  assert.equal(new Set(y2025.map((q) => String(q.school))).size, 1, 'math3 2025 三题 school 应逐字相同');
  assert.equal(String(y2025[0].school), '全国硕士研究生招生考试-数学三 2025 年', 'math3 2025 措辞应为试题册封面口径');
  assert.equal(String(y2025[0].school).indexOf('入学'), -1, '不应再出现「入学统一考试」旧称');
  const o2025 = B.bankYearOptions('math3').filter((o) => String(o.value) === '2025');
  assert.equal(o2025.length, 1, 'math3 2025 应只有一个年份/卷选项');
  assert.equal(o2025[0].label, '2025 年 · 3 题', 'math3 2025 选项文案应为「2025 年 · 3 题」');
  assert.equal(yearHitIn('math3', '2025').length, 3, 'math3 2025 应一次命中 3 题');
});

test('年份/卷筛选端到端：与题型/难度/关键词正交、跨科残留自愈、下拉派发 year= 并回填', () => {
  resetBankFilter();
  // ① bankFilteredQuestions 接入年份谓词：逐科逐选项与独立口径一致
  for (const sid of BANKS) {
    for (const o of B.bankYearOptions(sid).slice(1)) {
      const value = String(o.value);
      setBankFilter("currentSubjectId = " + JSON.stringify(sid) + "; bankYear = " + JSON.stringify(value) + ";");
      assert.deepEqual(
        Array.from(B.bankFilteredQuestions(), (q) => q.id).sort(),
        Array.from(yearHitIn(sid, value), (q) => q.id).sort(),
        sid + ' ' + value + ' 的命中集合应与独立口径一致'
      );
    }
  }
  // ② 年份 × 题型 / 难度 / 关键词 正交（期望值走 comboHit，与被测实现不同源）
  const newest = String(B.bankYearOptions('math3').slice(1)[0].value);
  const combos = [
    { code: "currentSubjectId='math3'; bankYear=" + JSON.stringify(newest) + "; bankType='deriv'", sid: 'math3', value: newest, type: 'deriv', star: 'all', query: '' },
    { code: "currentSubjectId='stats'; bankYear='2017'; bankStar='4'", sid: 'stats', value: '2017', type: 'all', star: '4', query: '' },
    { code: "currentSubjectId='math3'; bankYear='2013'; bankType='deriv'; bankStar='4'", sid: 'math3', value: '2013', type: 'deriv', star: '4', query: '' }
  ];
  for (const c of combos) {
    resetBankFilter();
    setBankFilter(c.code);
    assert.equal(B.bankFilteredQuestions().length, comboHit(c.sid, c.value, c.type, c.star, c.query),
      '年份×题型×难度 组合应与独立口径一致：' + c.code);
  }
  resetBankFilter();
  const probeQ = BANK.math3.questions[0];
  const needle = String(probeQ.stem).slice(0, 6);
  setBankFilter("currentSubjectId='math3'; bankYear=" + JSON.stringify(String(probeQ.year)) + "; bankQuery=" + JSON.stringify(needle) + ";");
  assert.ok(B.bankFilteredQuestions().some((q) => q.id === probeQ.id), '年份 + 关键词应命中同题：' + probeQ.id);
  assert.equal(B.bankFilteredQuestions().length, comboHit('math3', String(probeQ.year), 'all', 'all', needle), '年份 + 关键词与独立口径一致');

  // ③ 跨科残留自愈：2017 是 econ/stats 的年份，math3 无此选项 → 渲染前回全选态
  const stale = renderTree('math3', "bankYear = '2017';");
  assert.equal(viewState('bankYear'), '', '跨科残留的年份值应回全选态自愈（否则下拉显示全部年份而列表被筛住）');
  assert.equal(facetSel(stale, 'year').getAttribute('data-arg'), 'year=all');
  assert.equal(byClass(stale, 'bank-item').length, qCount('math3'), '自愈后应回到全科题量');
  assert.equal(filterOf().type, 'all');
  // 本科目有效值不得被自愈复位
  const kept = renderTree('math3', "bankYear = " + JSON.stringify(newest) + ";");
  assert.equal(viewState('bankYear'), newest, '本科目有效年份值不得被自愈复位');
  assert.equal(byClass(kept, 'bank-item').length, yearHitIn('math3', newest).length, '有效年份值应正常收敛列表');

  // ④ 下拉交互：选项派发既有 bankFilter + year=，选中态回填，选「全部年份」写回空值。
  //    t32 起统计同年多来源 → 选项值出现「年份|来源」编码；裸年份（单来源年）与「年份|来源」两种都要能派发与回填。
  const statsOpts = B.bankYearOptions('stats').slice(1);
  const cands = [
    statsOpts.filter((o) => String(o.value).indexOf('|') < 0)[0],
    statsOpts.filter((o) => String(o.value).indexOf('|') >= 0)[0]
  ];
  assert.ok(cands[0] && cands[1], '统计学科应同时存在裸年份与「年份|来源」两种年份选项（前置：数据含单来源年与多来源年）');
  for (const cand of cands) {
    const val = String(cand.value);
    const tree = renderTree('stats');
    const sel = facetSel(tree, 'year');
    assert.ok(sel, '应有年份/卷 下拉 trigger');
    const target = facetOptions(tree, 'year').filter((o) => o.getAttribute('data-value') === val)[0];
    assert.ok(target, '统计学应有年份选项：' + val);
    clickNode(sel);
    assert.equal(sel.getAttribute('aria-expanded'), 'true', '点击后应展开');
    clickNode(target);
    assert.deepEqual(Array.from(viewState('window.__actions[window.__actions.length - 1]')), ['bankFilter', 'year=' + val],
      '选年份应派发既有 bankFilter 动作与 year= 参数：' + val);
    assert.equal(viewState('bankYear'), val, '年份值应写入会话状态：' + val);
    assert.equal(byClass(appEl, 'bank-item').length, yearHitIn('stats', val).length, '列表应只剩该项对应题目：' + val);
    assert.ok(treeText(appEl).indexOf('当前筛选命中 ' + yearHitIn('stats', val).length + ' 题（全部 ' + qCount('stats') + ' 题）') >= 0,
      '命中行应显示年份筛选后的活数：' + val);
    const after = facetSel(appEl, 'year');
    assert.equal(after.getAttribute('data-arg'), 'year=' + val, 'trigger 应回填当前年份参数：' + val);
    assert.equal(byClass(after, 'bank-select-text')[0].getAttribute('data-tex'), cand.label, '折叠态文案应为当前年份选项文案：' + val);
    const picked = facetOptions(appEl, 'year').filter((o) => o.getAttribute('aria-selected') === 'true');
    assert.equal(picked.length, 1, '应恰有一个选中项：' + val);
    assert.equal(picked[0].getAttribute('data-value'), val);
    clickNode(facetOptions(appEl, 'year').filter((o) => o.getAttribute('data-value') === 'all')[0]);
    assert.equal(viewState('bankYear'), '', '选「全部年份」应写回空值（状态里不存 UI 的 all）');
    assert.equal(byClass(appEl, 'bank-item').length, qCount('stats'), '放宽年份后应恢复全科题量');
  }

  // ⑤ 年份 × 题型无命中 → 沿用既有空状态文案（组合取自探针确认的空集，前置断言兜底防数据漂移）
  assert.equal(comboHit('math3', '2012', 'series', 'all', ''), 0, '前置：math3 2012 × series 应无命中（数据变动时用例须换组合）');
  const empty = renderTree('math3', "bankYear = '2012'; bankType = 'series';");
  assert.ok(treeText(empty).indexOf('没有满足当前筛选条件的题目。') >= 0, '年份×题型无命中时应渲染空状态文案');
  assert.equal(byClass(empty, 'bank-item').length, 0, '空状态不应渲染任何列表卡');
  assert.equal(byClass(empty, 'bank-empty').length, 1, '空状态容器应恰有一个');
  assert.equal(viewState('bankYear'), '2012', '空结果不应把年份筛选复位（只归一化不存在的值）');
});

test('渲染管线贯通：列表/详情的徽标与知识点标签一律经 texEl（data-tex），公式 $ 不落明文', () => {
  resetBankFilter();
  const tree = renderTree('math3');
  const rows = B.bankFilteredQuestions();
  const BADGES = ['bank-badge-school', 'bank-badge-year', 'bank-badge-type', 'bank-badge-freq', 'bank-badge-diff'];

  // ① 列表卡五枚徽标：全部带 data-tex（t7 前是纯文本 el 构造），且渲染后文本不含裸 $
  for (const cls of BADGES) {
    const nodes = byClass(tree, cls);
    assert.equal(nodes.length, rows.length, '列表卡每题应有一枚 .' + cls + '（实际 ' + nodes.length + '/' + rows.length + '）');
    for (const n of nodes) {
      assert.ok(n.getAttribute('data-tex') !== null, '.' + cls + ' 文本应经渲染管线（data-tex）');
      assert.equal(n.text.indexOf('$'), -1, '渲染后 .' + cls + ' 文本不应残留 $：' + n.getAttribute('data-tex'));
    }
  }
  // ② 知识点 chip 与 +N：同样过渲染管线（title 属性仍是纯文本，供原生 tooltip）
  const items = byClass(tree, 'bank-item');
  assert.equal(items.length, rows.length, '列表项数应与命中数一致');
  for (let i = 0; i < items.length; i++) {
    const chips = byClass(items[i], 'bank-tag');
    assert.ok(chips.length > 0, rows[i].id + ' 应至少渲染一枚知识点 chip');
    for (const c of chips) {
      assert.ok(c.getAttribute('data-tex') !== null, rows[i].id + ' 的知识点 chip 应经渲染管线');
      assert.equal(c.text.indexOf('$'), -1, rows[i].id + ' chip 渲染后不应残留 $：' + c.getAttribute('data-tex'));
    }
  }
  assert.ok(byClass(tree, 'bank-tag-more').length > 0, '数学三应有题目标签超过 4 枚（渲染 +N 折叠位）');

  // ③ 源码级保证：承载文本的节点一律走 texEl，不得再用纯文本 el 构造
  //    （渲染断言只能覆盖当前可见节点；被上限截断的标签靠这条静态护栏兜住）
  const codeOnly = read('src/bank.mjs').split('\n').filter((l) => l.trim().indexOf('//') !== 0).join('\n');
  for (const bad of [
    /el\('span',\s*'bank-badge'/,
    /el\('span',\s*'bank-tag'/,
    /el\('span',\s*'bank-option-text'/,
    // 选项字母 (A)–(D) 是 ASCII 标记、不含公式，刻意走纯文本 el（见 bankDetailNode 注释）
    /el\('div',\s*'bank-answer'/,
    /el\('div',\s*'bank-stem'/
  ]) {
    assert.ok(!bad.test(codeOnly), '文本载体必须经 texEl 渲染，不得用纯文本 el：' + bad);
  }
  for (const good of ["texEl('span', 'bank-badge", "texEl('span', 'bank-tag", "texEl('span', 'bank-option-text'", "texEl('div', 'bank-answer'"]) {
    assert.ok(codeOnly.indexOf(good) >= 0, '文本载体应由 texEl 构造：' + good);
  }

  // ④ 详情页：同款五徽标 + 全部知识点标签（含公式的那条必须真的走到渲染管线）
  const formulaTagOf = (row) => (row.tags || []).filter((id) => (B.bankTagTitle(row.subject, id) || '').indexOf('$') >= 0)[0];
  const withFormula = rows.filter((q) => formulaTagOf(q));
  assert.ok(withFormula.length > 0, '数学三应存在挂含公式标签的题目（否则本用例空转）');
  const target = withFormula[0];
  const formulaTitle = B.bankTagTitle(target.subject, formulaTagOf(target));
  setViewState('bankOpen = ' + JSON.stringify(target.id) + ';');
  vm.runInContext('renderBank()', view);
  const detail = byClass(appEl, 'bank-detail')[0];
  assert.ok(detail, target.id + ' 应渲染详情页');
  for (const cls of BADGES) {
    const nodes = byClass(detail, cls);
    assert.equal(nodes.length, 1, '详情页应有一枚 .' + cls);
    assert.ok(nodes[0].getAttribute('data-tex') !== null, '详情页 .' + cls + ' 应经渲染管线');
    assert.equal(nodes[0].text.indexOf('$'), -1, '详情页 .' + cls + ' 渲染后不应残留 $');
  }
  const detailChips = byClass(detail, 'bank-tag');
  assert.equal(detailChips.length, (target.tags || []).length, '详情页应渲染全部知识点标签');
  const hit = detailChips.filter((c) => c.getAttribute('data-tex') === formulaTitle)[0];
  assert.ok(hit, '含公式的标签应出现在详情页：' + formulaTitle);
  assert.ok(hit.getAttribute('data-tex').indexOf('$') >= 0, '含公式标签的原文应保留 $（渲染前的 data-tex）');
  assert.equal(hit.text.indexOf('$'), -1, '含公式标签渲染后不应残留 $：' + hit.getAttribute('data-tex'));
  renderTree('math3');
});

test('选择题标识：选项 (A)–(D) 前缀 + 答案区「答案：X」+ 正确项 is-answer；字母解析与期望答案表逐题一致', () => {
  // ① 纯函数口径：与文件头「答案字母口径」的三个正则同源（与期望答案表护栏共用一份）
  const bankSrc = read('src/bank.mjs');
  assert.match(bankSrc, /var BANK_CHOICE_RES = \[/, '字母解析正则应集中声明为 BANK_CHOICE_RES');
  for (const re of LETTER_RES) {
    assert.ok(bankSrc.indexOf(re.source) >= 0, 'bankChoiceLetter 的正则应含期望答案表口径：' + re.source);
  }
  assert.equal(B.bankChoiceLetter({ answer: '选 B。记 $a_n=…' }), 'B', '散文「选 B」应解析出 B');
  assert.equal(B.bankChoiceLetter({ answer: '答案：C' }), 'C', '「答案：C」应解析出 C');
  assert.equal(B.bankChoiceLetter({ answer: '把 (D) 代入即得' }), 'D', '「(D)」应解析出 D');
  assert.equal(B.bankChoiceLetter({ answer: '由单调有界准则知极限存在' }), null, '无字母应返回 null（界面不得显示空标识）');
  assert.equal(B.bankChoiceLetter({ answer: '选 E 项' }), null, 'A–D 之外的字母不认');
  assert.equal(B.bankChoiceLetter({}), null, '缺 answer 不得抛错');
  assert.equal(B.bankChoiceLetter(null), null, '空对象不得抛错');

  // ② 现 14 道选择题：字母逐题与人工转录的期望答案表一致（表在 tests/fixtures/，不由数据生成）
  const manifest = JSON.parse(read('tests/fixtures/bank-answer-manifest.json'));
  const all = B.bankAllQuestions();
  const choiceRows = all.filter((q) => (q.options || []).length > 0);
  const wantChoice = Object.entries(manifest.answers).filter(([, w]) => w.kind === 'choice');
  assert.equal(choiceRows.length, wantChoice.length, '有选项的题目数应与期望表 choice 条目一致（现 14）');
  assert.equal(choiceRows.length, 14, '数学三现为 14 道选择题（题量变化时同步复核期望表）');
  for (const q of choiceRows) {
    assert.equal(q.options.length, 4, q.id + ' 选择题应有 4 个选项');
    assert.equal(B.bankChoiceLetter(q), manifest.answers[q.id].a, q.id + ' 字母应与期望答案表一致');
    assert.equal(B.bankChoiceLetter(q), letterOf(q.answer), q.id + ' 应与期望表护栏的三正则口径一致');
    for (const leg of ['A', 'B', 'C', 'D']) assert.ok(q.options.some((o) => o.length > 0), q.id + ' 选项不应为空');
  }
  // 无选项的题（math3 10 / econ 15 / stats 16）不得被误判成选择题
  const noOpts = all.filter((q) => !(q.options || []).length);
  assert.equal(noOpts.length, all.length - choiceRows.length);
  for (const sid of ['econ', 'stats']) {
    assert.equal(BANK[sid].questions.filter((q) => (q.options || []).length).length, 0, sid + ' 现无选择题（行为不变）');
  }

  // ③ 视图：详情页逐题渲染 (A)–(D) 前缀、正确项 is-answer、答案区显式标识且在散文之前
  resetBankFilter();
  const listed = renderTree('math3');
  assert.equal(byClass(listed, 'bank-option-letter').length, 0, '列表卡不应渲染选项字母（选项只在详情页）');
  assert.equal(byClass(listed, 'bank-answer-letter').length, 0, '列表卡不应渲染答案标识');
  for (const q of choiceRows) {
    const letter = manifest.answers[q.id].a;
    setViewState('bankOpen = ' + JSON.stringify(q.id) + ';');
    vm.runInContext('renderBank()', view);
    const detail = byClass(appEl, 'bank-detail')[0];
    assert.ok(detail, q.id + ' 应渲染详情页');
    const opts = byClass(detail, 'bank-option');
    assert.equal(opts.length, 4, q.id + ' 详情页应有 4 个选项');
    for (let i = 0; i < opts.length; i++) {
      const want = String.fromCharCode(65 + i);
      assert.equal(opts[i].getAttribute('data-option-letter'), want, q.id + ' 选项字母应按 options 下标派生');
      const mark = byClass(opts[i], 'bank-option-letter')[0];
      assert.ok(mark, q.id + ' 选项应有 (A)–(D) 前缀');
      assert.equal(mark.text, '(' + want + ')', q.id + ' 前缀应为「(X)」形式');
      const txt = byClass(opts[i], 'bank-option-text')[0];
      assert.ok(txt && txt.getAttribute('data-tex') !== null, q.id + ' 选项正文应经渲染管线');
      assert.equal(txt.getAttribute('data-tex'), q.options[i], q.id + ' 选项正文应与数据一致');
      const isAns = opts[i].className.split(/\s+/).indexOf('is-answer') >= 0;
      assert.equal(isAns, want === letter, q.id + ' 只有答案字母对应的选项应带 is-answer（答案 ' + letter + '）');
    }
    const ansMark = byClass(detail, 'bank-answer-letter')[0];
    assert.ok(ansMark, q.id + ' 答案区应有显式标识');
    assert.equal(ansMark.text, '答案：' + letter, q.id + ' 标识文案应为「答案：X」');
    assert.equal(ansMark.getAttribute('data-answer-letter'), letter, q.id + ' 标识应带 data-answer-letter');
    // 顺序：显式标识紧接「答案与解析」标题、在答案散文之前，且各只出现一次
    const seq = [];
    walkTree(detail, (n) => {
      const cls = String(n.className || '').split(/\s+/);
      if (cls.indexOf('bank-answer-letter') >= 0) seq.push('mark');
      else if (cls.indexOf('bank-answer') >= 0) seq.push('prose');
    });
    assert.deepEqual(seq, ['mark', 'prose'], q.id + ' 显式标识应在答案散文之前');
    // 正确项视觉标记的类名是 CSS 侧契约（bank-style 落地），此处只锁定类名不锁定样式
    assert.ok(byClass(detail, 'is-answer').length <= 1, q.id + ' 最多一个正确项标记');
  }
  // ④ 无选项题行为不变：无 (A)–(D)、无答案标识、答案与解析照旧
  const fillRow = all.filter((q) => q.subject === 'math3' && !(q.options || []).length)[0];
  assert.ok(fillRow, '数学三应有填空题');
  setViewState('bankOpen = ' + JSON.stringify(fillRow.id) + ';');
  vm.runInContext('renderBank()', view);
  const fillDetail = byClass(appEl, 'bank-detail')[0];
  assert.ok(fillDetail, fillRow.id + ' 应渲染详情页');
  assert.equal(byClass(fillDetail, 'bank-option').length, 0, fillRow.id + ' 无选项题不应渲染选项行');
  assert.equal(byClass(fillDetail, 'bank-option-letter').length, 0, fillRow.id + ' 无选项题不应出现 (A)–(D)');
  assert.equal(byClass(fillDetail, 'bank-answer-letter').length, 0, fillRow.id + ' 无法解析字母时不得显示空标识');
  assert.equal(byClass(fillDetail, 'is-answer').length, 0, fillRow.id + ' 无选项题不应有正确项标记');
  assert.equal(byClass(fillDetail, 'bank-answer').length, 1, fillRow.id + ' 答案与解析照旧渲染');
  for (const sid of ['econ', 'stats']) {
    const row = BANK[sid].questions[0];
    setViewState('currentSubjectId = ' + JSON.stringify(sid) + '; bankOpen = ' + JSON.stringify(row.id) + ';');
    vm.runInContext('renderBank()', view);
    assert.equal(byClass(appEl, 'bank-detail').length, 1, sid + ' 应可渲染详情页');
    assert.equal(byClass(appEl, 'bank-option-letter').length, 0, sid + ' 无选项题不应出现选项字母');
    assert.equal(byClass(appEl, 'bank-answer-letter').length, 0, sid + ' 无选项题不应出现答案标识');
  }
  renderTree('math3');
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
  assert.equal(byTag(empty, 'select').length, 0, '空状态不应渲染下拉（原生 select 亦已下线）');
  assert.equal(byClass(empty, 'bank-select').length, 0, '空状态不应渲染自定义下拉 trigger');
  assert.ok(emptyText.indexOf('当前学科暂无题库数据') >= 0, '空状态应说明原因');
  renderTree('math3');
});

test('重置（bankReset）回到全选态：命中数恢复学科全量，四组下拉都回到「全部」', () => {
  resetBankFilter();
  const m3 = qCount('math3');
  setBankFilter("bankType='ode'; bankTag='ode01'; bankStar='5'");
  assert.notEqual(B.bankFilteredQuestions().length, m3, '重置前应处于筛选态（不等于学科全量 ' + m3 + '）');
  resetBankFilter();
  assert.equal(B.bankFilteredQuestions().length, m3, '重置后应命中当前学科（数学三）全部 ' + m3 + ' 题');
  assert.equal(B.bankHitText(B.bankFilteredQuestions().length, B.bankSubjectTotal(B.bankSubjectTotals(), 'math3')), '当前筛选命中 ' + m3 + ' 题');
  assert.deepEqual(filterOf(), { type: 'all', tag: 'all', star: 'all', year: '', query: '' });
  // 端到端：视图层的重置按钮真派发 bankReset 后，四组下拉与命中数一起回全选态
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
  assert.equal(viewState('bankYear'), '', 't14：年份/卷 应回到全选态');
  assert.equal(viewState('bankQuery'), '');
  assert.ok(treeText(appEl).indexOf('当前筛选命中 ' + m3 + ' 题') >= 0, '重置后应恢复学科全量（' + m3 + ' 题）');
  const resetSels = byClass(appEl, 'bank-select').filter((s) => s.getAttribute('data-bank-facet'));
  assert.equal(resetSels.length, 4, '重置后仍应渲染四组下拉');
  for (const s of resetSels) {
    assert.equal(s.getAttribute('data-arg'), s.getAttribute('data-bank-facet') + '=all', '重置后四组下拉都应回到全选态');
    const picked = facetOptions(appEl, s.getAttribute('data-bank-facet')).filter((o) => o.getAttribute('aria-selected') === 'true');
    assert.equal(picked.length, 1, '每组下拉应恰有一个选中项：' + s.getAttribute('data-bank-facet'));
    assert.equal(picked[0].getAttribute('data-value'), 'all', '重置后选中项应为全选：' + s.getAttribute('data-bank-facet'));
  }
  // actions.mjs 的 bankReset 分支复位的正是这些字段（该文件不在本任务 inScope，只做契约锁定）
  const actions = read('src/actions.mjs');
  const resetCase = actions.match(/case 'bankReset':([\s\S]*?)(?:\n      case |\n      default)/);
  assert.ok(resetCase, 'actions.mjs 应有 bankReset 分支');
  for (const v of ['bankType', 'bankTag', 'bankStar', 'bankYear', 'bankQuery']) {
    assert.ok(resetCase[1].indexOf(v + " = 'all'") >= 0 || resetCase[1].indexOf(v + " = ''") >= 0, 'actions.mjs 的 bankReset 应复位 ' + v);
  }
});

// ------------------------------------------- t32：卡片派生题的缺省字段与另解渲染契约
test('缺省字段渲染契约（t32）：traps/hint 缺失时整段跳过、altAnswer 渲染「另解」块、界面不出现 undefined', () => {
  // ① 真实数据面前置：统计至少要有一题带 altAnswer、一题既无 traps 也无 hint（否则条件分支空转）
  const all = B.bankAllQuestions();
  const withAlt = all.filter((q) => typeof q.altAnswer === 'string' && q.altAnswer.length > 0);
  const bare = all.filter((q) => q.origin === 'card' && q.traps == null && q.hint == null);
  assert.ok(withAlt.length > 0, '统计应有带另解（altAnswer）的卡片派生题');
  assert.ok(bare.length > 0, '统计应有既无 traps 也无 hint 的卡片派生题');

  // ② 真实数据：无 traps/hint 的题在详情页应整段跳过（不得渲染空段或 undefined）
  setViewState('bankOpen = ' + JSON.stringify(bare[0].id) + ';');
  vm.runInContext('renderBank()', view);
  assert.equal(byClass(appEl, 'bank-detail').length, 1, bare[0].id + ' 应渲染详情页');
  assert.equal(byClass(appEl, 'bank-traps').length, 0, bare[0].id + ' 缺 traps → 陷阱段应整段跳过');
  assert.equal(byClass(appEl, 'bank-hint').length, 0, bare[0].id + ' 缺 hint → 提示段应整段跳过');
  assert.equal(treeText(appEl).indexOf('undefined'), -1, '详情页不得出现 undefined');

  // ③ 真实数据：另解渲染为独立块，文本经渲染管线且与 altAnswer 同源
  setViewState('bankOpen = ' + JSON.stringify(withAlt[0].id) + ';');
  vm.runInContext('renderBank()', view);
  const altBlock = byClass(appEl, 'bank-alt-answer');
  assert.equal(altBlock.length, 1, withAlt[0].id + ' 应渲染另解块');
  assert.equal(altBlock[0].getAttribute('data-tex'), withAlt[0].altAnswer, '另解块文本应经渲染管线且等于 altAnswer');

  // ④ 合成题：刻意缺 year/school/traps/hint/altAnswer（真实数据里没有这种组合）→ 徽标与段落都要能跳
  const synthetic = {
    id: 'cv-st-zz99-synth', origin: 'card', star: 3, type: 'prob', tags: ['pb01'],
    stem: '合成题（缺 year / school / traps / hint / altAnswer）', answer: '合成答案',
    src: { card: 'pb01', note: '卡片例题（data/stats.js 的 EXAMPLE["pb01"]）来源原文：2026 复旦大学 432 统计学真题。' }
  };
  const push = (ctx) => vm.runInContext(
    'window.BANK.stats.questions.push(' + JSON.stringify(synthetic) + ')', ctx);
  const drop = () => {
    BANK.stats.questions = BANK.stats.questions.filter((q) => q.id !== synthetic.id);
    vm.runInContext('window.BANK.stats.questions = window.BANK.stats.questions.filter(function (q) { return q.id !== '
      + JSON.stringify(synthetic.id) + '; })', view);
  };
  try {
    push(sandbox);
    push(view);
    const tree = renderTree('stats');
    const item = byClass(tree, 'bank-item').filter((n) => treeText(n).indexOf('合成题（缺') >= 0)[0];
    assert.ok(item, '列表应渲染合成题（未筛年份时它应在列）');
    assert.equal(treeText(item).indexOf('undefined'), -1, '列表卡不得出现 undefined');
    assert.equal(byClass(item, 'bank-badge-year').length, 0, '缺 year/no 时「年度 · 题号」徽标应整枚跳过');
    const schoolBadge = byClass(item, 'bank-badge-school');
    assert.equal(schoolBadge.length, 1, 'school 缺失时院校徽标仍保留（回退科目名，既有 t19 口径）');
    assert.equal(schoolBadge[0].text, subjLabel('stats'), '缺 school 应回退科目名而不是空徽标');
    setViewState('bankOpen = ' + JSON.stringify(synthetic.id) + ';');
    vm.runInContext('renderBank()', view);
    const detail = byClass(appEl, 'bank-detail')[0];
    assert.ok(detail, '合成题应能打开详情页（缺 year/school 不致命）');
    assert.equal(byClass(appEl, 'bank-traps').length, 0, '缺 traps → 陷阱段整段跳过');
    assert.equal(byClass(appEl, 'bank-hint').length, 0, '缺 hint → 提示段整段跳过');
    assert.equal(byClass(appEl, 'bank-alt-answer').length, 0, '缺 altAnswer → 另解块整段跳过');
    assert.equal(treeText(detail).indexOf('undefined'), -1, '详情页不得出现 undefined');
    // ⑤ 缺 year 的题不得进年份选项、也不得被任何年份项命中；未筛年份时正常在列
    const yearVals = Array.from(B.bankYearOptions('stats').slice(1), (o) => String(o.value));
    assert.ok(yearVals.length > 0, '统计应有年份选项');
    for (const v of yearVals) {
      setBankFilter("currentSubjectId='stats'; bankYear=" + JSON.stringify(v) + ";");
      assert.ok(!B.bankFilteredQuestions().some((q) => q.id === synthetic.id), '无 year 的题不得被「' + v + '」命中');
    }
    setBankFilter("currentSubjectId='stats'; bankYear='';");
    assert.ok(B.bankFilteredQuestions().some((q) => q.id === synthetic.id), '未筛年份时缺 year 的题应正常在列');
  } finally {
    drop();
    renderTree('math3');
    resetBankFilter();
  }
});