// ===== 题库（Bank）模块 =====
// POC：以「真题」为唯一题源，题型（自带五星出现频率，由库内实际频次统计）与
// 知识点标签（复用现有 data/<subj>.js 的 id，自带五星难度）并列两套体系 + 难度五星筛选。
// 数据来自 data/bank_math3.js / data/bank_econ.js / data/bank_stats.js（window.BANK.<subj>）。
// 本文件由 tools/build.mjs 拼进 app.js（与其它 src/*.mjs 同处一个 IIFE），函数互相直接调用。
//
// 学科范围（t17）：题库不再自带页内学科选择，范围恒等于全局学科选择器当前学科
// （src/app.mjs 的 currentSubjectId，三科 id 同名 math3/econ/stats）；三科之外渲染空状态。
// 三组筛选（题型 / 知识点 / 难度≥）收进原生 <select>：原生控件无法携带随选择变化的
// data-arg，因此 change 时直接派发既有 bankFilter 动作与既有参数名（type= / tag= / star=），
// 不新增 action 名；状态改写与重渲染仍统一收口在 src/actions.mjs 的 case 'bankFilter'。

// ---- 会话级状态 ----
// ⚠️ 这些状态变量声明在 src/learn.mjs 的「视图状态」区（与 browse*/wrong* 同处），
// 因为所有 src/*.mjs 会被 tools/build.mjs 拼进同一个 IIFE 作用域——同一作用域里
// 重复声明（var 或 let）会直接抛语法错误。此处只使用，不再声明；新增状态必须
// 同步补进 learn.mjs 的 resetSessionState()。

var BANK_SUBJECT_META = {
  math3: { label: '数学三', short: '数三', subject: 'math3' },
  econ: { label: '微观经济学', short: '微观', subject: 'econ' },
  stats: { label: '统计学', short: '统计', subject: 'stats' }
};

var BANK_SUBJECT_ORDER = ['math3', 'econ', 'stats'];

// ---- 纯函数（可测）----
// ===== BEGIN TESTABLE bank-helpers =====
// 星级统计、题型频率、知识点标签解析、筛选谓词、扁平化题目列表。
// 全部不读写 DOM，单测可直接 import（见 tests/bank.test.mjs）。

// 题库数据范围＝全局学科选择器的当前学科（src/app.mjs 的 currentSubjectId）。
// 三科 id 与全局学科 id 同名（math3 / econ / stats）；全库 25 科里另外 22 科没有题库数据
// → 返回 null，由渲染层给空状态提示（不得抛错）。
function bankCurrentSubjectId() {
  var sid = (typeof currentSubjectId === 'undefined') ? null : currentSubjectId;
  if (!sid) return null;
  sid = String(sid);
  return BANK_SUBJECT_ORDER.indexOf(sid) >= 0 ? sid : null;
}

function bankStarLevel(value) {
  var n = Math.round(Number(value) || 0);
  if (n < 1) n = 1;
  if (n > 5) n = 5;
  return n;
}

function bankStars(value) {
  return '★'.repeat(bankStarLevel(value)) + '☆'.repeat(5 - bankStarLevel(value));
}

// 题型出现频率 → 五星：库内频次最高的一档 5★，其后按占比落档，最低 3★。
// 频率全部来自库内真题实际统计，不由人工硬编码。
function bankTypeStars(freq, total) {
  var f = Number(freq) || 0;
  var t = Number(total) || 0;
  if (t <= 0 || f <= 0) return 3;
  var p = f / t;
  if (p >= 0.18) return 5;
  if (p >= 0.13) return 4;
  return 3;
}

// 题型频率表：[{ key, name, def, judge, sample, count, ratio, stars }]，按频次降序
function bankTypeFrequency(subjectId) {
  var bank = bankData(subjectId);
  if (!bank) return [];
  var total = bank.questions.length || 1;
  var freq = {};
  for (var i = 0; i < bank.questions.length; i++) {
    var t = bank.questions[i].type;
    freq[t] = (freq[t] || 0) + 1;
  }
  var rows = [];
  for (var j = 0; j < bank.types.length; j++) {
    var ty = bank.types[j];
    var count = freq[ty.key] || 0;
    rows.push({
      key: ty.key,
      name: ty.name || ty.key,
      def: ty.def || '',
      judge: ty.judge || '',
      sample: ty.sample || '',
      count: count,
      ratio: count / total,
      stars: bankTypeStars(count, total)
    });
  }
  rows.sort(function (a, b) { return b.count - a.count || (a.key < b.key ? -1 : 1); });
  return rows;
}

// 知识点标签 → 所属 cat 名（复用 data/<subj>.js 的 CATS）
function bankTagCat(subjectId, tagId) {
  var subj = bankSubjectData(subjectId);
  if (!subj) return '';
  var list = subj.DATA || subj.data || [];
  for (var i = 0; i < list.length; i++) {
    if (list[i].id === tagId) return (subj.CATS && subj.CATS[list[i].cat]) || list[i].cat || '';
  }
  return '';
}

// 知识点标签 → 卡片标题（题库详情里给标签加 tooltip）
function bankTagTitle(subjectId, tagId) {
  var subj = bankSubjectData(subjectId);
  if (!subj) return '';
  var list = subj.DATA || subj.data || [];
  for (var i = 0; i < list.length; i++) if (list[i].id === tagId) return list[i].title || '';
  return '';
}

// 题型筛选值的匹配规则：同科目内是题型 key（'regress'）。t15 的「全部科目」视图曾用合并
// key（'stats:regress'）避免 math3 与 stats 的同名题型（都有 'estimate'）串味；t17 起范围恒为
// 单一科目，已不再产生合并 key，这里保留解析以兼容历史会话值。
function bankTypeSelected(q, sel) {
  if (!sel || sel === 'all') return true;
  var s = String(sel);
  var colon = s.indexOf(':');
  if (colon > 0) {
    var sid = s.slice(0, colon);
    var key = s.slice(colon + 1);
    if (BANK_SUBJECT_ORDER.indexOf(sid) >= 0) return q.subject === sid && q.type === key;
  }
  return q.type === s;
}

// 历史遗留的合并题型 key（'sid:key'）在本科目的下拉里没有对应选项，会变成「看不见的筛选
// 条件」（列表被筛掉一截而下拉显示全部）→ 渲染前回到全选态自愈。
function bankNormalizeTypeFilter(subjectId) {
  if (!bankType || bankType === 'all') return;
  var rows = bankTypeFrequency(subjectId);
  for (var i = 0; i < rows.length; i++) if (rows[i].key === bankType) return;
  bankType = 'all';
}

// 单题是否满足当前筛选（纯函数，测试直接调用）。
// 学科不在谓词里：范围由 bankFilteredQuestions() 按全局学科收敛（f.subject 仅作可选后置条件）。
// t17 起已无「题型出现频率」维度（typeStar），故不再参与匹配。
function bankMatch(q, f) {
  if (f.subject && f.subject !== 'all' && q.subject !== f.subject) return false;
  if (!bankTypeSelected(q, f.type)) return false;
  if (f.tag && f.tag !== 'all' && (q.tags || []).indexOf(f.tag) < 0) return false;
  if (f.star && f.star !== 'all' && bankStarLevel(q.star) < Number(f.star)) return false;
  if (f.query) {
    var needle = String(f.query).trim().toLowerCase();
    if (needle) {
      var hay = (String(q.stem || '') + ' ' + String(q.answer || '') + ' ' + String(q.hint || '') + ' ' + String(q.traps || '')).toLowerCase();
      if (hay.indexOf(needle) < 0) return false;
    }
  }
  return true;
}

// 三科题目扁平化（每题挂 subject 与由库内频次统计出的 typeStars）
function bankAllQuestions() {
  var out = [];
  for (var i = 0; i < BANK_SUBJECT_ORDER.length; i++) {
    var sid = BANK_SUBJECT_ORDER[i];
    var bank = bankData(sid);
    if (!bank) continue;
    var rows = bankTypeFrequency(sid);
    var starByType = {};
    for (var j = 0; j < rows.length; j++) starByType[rows[j].key] = rows[j].stars;
    for (var k = 0; k < bank.questions.length; k++) {
      var q = bank.questions[k];
      var copy = {};
      for (var key in q) if (Object.prototype.hasOwnProperty.call(q, key)) copy[key] = q[key];
      copy.subject = sid;
      copy.subjectLabel = (BANK_SUBJECT_META[sid] && BANK_SUBJECT_META[sid].label) || sid;
      copy.typeName = bankTypeName(sid, q.type);
      copy.typeStars = starByType[q.type] || 3;
      out.push(copy);
    }
  }
  return out;
}

// 当前学科（全局学科选择器）下、满足当前会话筛选的题目。
// 范围收敛在这里完成：先按学科过滤，再套题型/知识点/难度/关键词谓词。
function bankFilteredQuestions() {
  var sid = bankCurrentSubjectId();
  if (!sid) return [];
  var all = bankAllQuestions();
  var f = bankCurrentFilter();
  var out = [];
  for (var i = 0; i < all.length; i++) {
    if (all[i].subject !== sid) continue;
    if (bankMatch(all[i], f)) out.push(all[i]);
  }
  out.sort(function (a, b) {
    if (a.year !== b.year) return b.year - a.year;
    return String(a.no).localeCompare(String(b.no));
  });
  return out;
}

// 当前会话筛选条件对象（与 src/learn.mjs 里声明的会话状态一一对应）
// 学科不在此列——它属于全局学科选择器（bankCurrentSubjectId）；频率星级维度已移除。
function bankCurrentFilter() {
  return {
    type: bankType,
    tag: bankTag,
    star: bankStar,
    query: bankQuery
  };
}

// 概览口径：各科**总量**（题数 / 题型数）——读全库，不接收筛选结果，因此恒不随筛选变化。
// 曾经的缺陷：概览卡复用筛选命中的 rows，选「数学三」后另两科显示 0 题，像数据丢失。
function bankSubjectTotals() {
  var all = bankAllQuestions();
  var out = { total: all.length, subjects: {} };
  for (var i = 0; i < all.length; i++) {
    var s = all[i].subject;
    if (!out.subjects[s]) out.subjects[s] = { count: 0, types: {} };
    out.subjects[s].count++;
    out.subjects[s].types[all[i].type] = true;
  }
  return out;
}

function bankSubjectTotal(totals, subjectId) {
  var st = (totals && totals.subjects && totals.subjects[subjectId]) || null;
  return st ? st.count : 0;
}

function bankSubjectTypeCount(totals, subjectId) {
  var st = (totals && totals.subjects && totals.subjects[subjectId]) || null;
  return st ? Object.keys(st.types).length : 0;
}

// 概览区第二行文案：当前筛选命中 N 题（未筛选时 N = 总量，省掉「全部」后缀）
function bankHitText(hits, total) {
  var n = Number(hits) || 0;
  var t = Number(total) || 0;
  return '当前筛选命中 ' + n + ' 题' + (n === t ? '' : '（全部 ' + t + ' 题）');
}

// 工具条范围文案：科目范围 + 该范围总量（总量口径，不随筛选变化；活数在概览命中行）
function bankScopeText(subjectId, totals) {
  if (!subjectId || subjectId === 'all') return '全部三科 · 共 ' + (Number((totals && totals.total) || 0)) + ' 题';
  var meta = BANK_SUBJECT_META[subjectId] || {};
  return (meta.label || subjectId) + ' · 共 ' + bankSubjectTotal(totals, subjectId) + ' 题 · ' +
    bankSubjectTypeCount(totals, subjectId) + ' 类题型';
}

// ---- 下拉筛选选项（纯函数，返回 [{ value, label }]）----
// 原生 <select> 的选项构造与 DOM 无关，单测可直接断言内容/顺序/上限；
// 题型星级与题数一律来自库内实际频次统计（bankTypeFrequency），不由人工硬编码。

var BANK_TAG_OPTION_LIMIT = 60;

// 题型：首项全选 + 按库内频次降序（bankTypeFrequency 已排序）→「名称 ★★★★☆ N 题」
function bankTypeOptions(subjectId) {
  var out = [{ value: 'all', label: '全部题型' }];
  var sid = subjectId || bankCurrentSubjectId();
  if (!sid) return out;
  var rows = bankTypeFrequency(sid);
  for (var i = 0; i < rows.length; i++) {
    out.push({
      value: rows[i].key,
      label: rows[i].name + ' ' + bankStars(rows[i].stars) + ' ' + rows[i].count + ' 题'
    });
  }
  return out;
}

// 知识点排名：按当前命中数降序（title/cat 复用现有知识点数据）
function bankTagRanking(rows) {
  var bag = {}, counts = {};
  for (var i = 0; i < (rows || []).length; i++) {
    var tags = rows[i].tags || [];
    for (var j = 0; j < tags.length; j++) {
      var id = tags[j];
      counts[id] = (counts[id] || 0) + 1;
      if (!bag[id]) bag[id] = { id: id, subject: rows[i].subject, star: 0 };
      if (rows[i].star > bag[id].star) bag[id].star = rows[i].star;
    }
  }
  var list = [];
  for (var key in bag) if (Object.prototype.hasOwnProperty.call(bag, key)) {
    list.push({
      id: bag[key].id,
      subject: bag[key].subject,
      star: bag[key].star,
      count: counts[key],
      title: bankTagTitle(bag[key].subject, bag[key].id) || bag[key].id,
      cat: bankTagCat(bag[key].subject, bag[key].id)
    });
  }
  list.sort(function (a, b) { return b.count - a.count || (a.id < b.id ? -1 : 1); });
  return list;
}

function bankTagOptionLabel(t) {
  return t.title + (t.cat ? ' · ' + t.cat : '') + ' · ' + t.count + ' 题';
}

// 知识点选项：首项全选 + 按命中数降序、上限 BANK_TAG_OPTION_LIMIT。
// 当前选中的知识点即使被上限截断也必须出现在选项里（否则下拉回填会跳到首项，
// 用户看不到自己选了哪一个）；超限数量由 bankTagOptionHidden 给出提示。
function bankTagOptions(rows, selectedId, limit) {
  var out = [{ value: 'all', label: '全部知识点' }];
  var lim = Number(limit) > 0 ? Math.floor(Number(limit)) : BANK_TAG_OPTION_LIMIT;
  var ranked = bankTagRanking(rows);
  var picked = ranked.slice(0, lim);
  var sel = (selectedId && selectedId !== 'all') ? String(selectedId) : '';
  if (sel) {
    var has = false;
    for (var i = 0; i < picked.length; i++) if (picked[i].id === sel) has = true;
    if (!has) {
      for (var j = 0; j < ranked.length; j++) {
        if (ranked[j].id === sel) { picked.unshift(ranked[j]); break; }
      }
    }
  }
  for (var k = 0; k < picked.length && out.length - 1 < lim; k++) {
    out.push({ value: picked[k].id, label: bankTagOptionLabel(picked[k]) });
  }
  return out;
}

// 被上限收进「其余 N 个知识点（缩小筛选后可见）」提示的数量
function bankTagOptionHidden(rows, selectedId, limit) {
  var lim = Number(limit) > 0 ? Math.floor(Number(limit)) : BANK_TAG_OPTION_LIMIT;
  var shown = bankTagOptions(rows, selectedId, lim).length - 1; // 减去「全部知识点」
  return Math.max(0, bankTagRanking(rows).length - shown);
}

// 难度（≥）：全部难度 + ★5…★1
function bankStarOptions() {
  var out = [{ value: 'all', label: '全部难度' }];
  for (var s = 5; s >= 1; s--) out.push({ value: String(s), label: bankStars(s) });
  return out;
}

// 下拉回填：当前值在选项里就选中它，否则回到首项（全选）
function bankSelectValue(options, current) {
  var v = String(current == null || current === '' ? 'all' : current);
  for (var i = 0; i < options.length; i++) if (String(options[i].value) === v) return v;
  return 'all';
}

// 来源徽标里的「院校」段：q.school 由数据侧补齐（t19），缺省回退科目名，
// 保证 POC 数据尚未带 school 时徽标语义仍完整（不得为此改 data/bank_*.js）。
function bankSchoolLabel(q) {
  if (!q) return '';
  var school = q.school ? String(q.school).trim() : '';
  if (school) return school;
  return q.subjectLabel ||
    (BANK_SUBJECT_META[q.subject] && BANK_SUBJECT_META[q.subject].label) ||
    q.subject || '';
}

// ---- 运行时小工具 ----

function bankData(subjectId) {
  var bank = (typeof window !== 'undefined' && window.BANK) || {};
  return bank[subjectId] || null;
}

function bankSubjectData(subjectId) {
  if (typeof window === 'undefined' || !window.SUBJECTS) return null;
  var meta = BANK_SUBJECT_META[subjectId];
  var sid = (meta && meta.subject) || subjectId;
  return window.SUBJECTS[sid] || null;
}
// 错题本查重口径 —— 必须与 src/wrong.mjs 的 markAsWrong 入库查重完全一致：
//   wrong.mjs:363-373  `(DB.wrongs[wid].q || '').trim() === (ex.q || '').trim()`
// 即「题干原文去首尾空白后严格相等」：不折叠内部空白、不做全角/半角归一化、不比对解析。
// bankAddToWrong 传的 ex.q 就是 q.stem（bank.mjs 的 ex.q = q.stem），两边输入同源。
function bankSameQuestion(a, b) {
  return String(a === null || a === undefined ? '' : a).trim() ===
         String(b === null || b === undefined ? '' : b).trim();
}

// 在错题本里按题干查找已有条目（与 wrong.mjs:363-364 同一数据源 DB.wrongs 与同一比较）。
// 读取走 wrong.mjs 已公开的 wrongCard(wid)；它不可用时退回同源直读，保证浏览器侧恒可用。
function bankLookupWrongEntry(q) {
  if (typeof DB === 'undefined' || !DB || !DB.wrongs) return null;
  var ids = Object.keys(DB.wrongs);
  var readWrong = (typeof wrongCard === 'function') ? wrongCard : function (wid) { return DB.wrongs[wid]; };
  var stem = (q && q.stem) || '';
  for (var i = 0; i < ids.length; i++) {
    var w = readWrong(ids[i]);
    if (w && bankSameQuestion(w.q, stem)) return { id: ids[i], entry: w };
  }
  return null;
}

// 某题是否已在错题本中（判定口径见上，与入库查重同源）
function bankWrongState(q) {
  var hit = bankLookupWrongEntry(q);
  return { inBook: !!(hit && hit.entry), entry: (hit && hit.entry) || null };
}
// ===== END TESTABLE bank-helpers =====

function bankAvailableSubjects() {
  var out = [];
  for (var i = 0; i < BANK_SUBJECT_ORDER.length; i++) {
    if (bankData(BANK_SUBJECT_ORDER[i])) out.push(BANK_SUBJECT_ORDER[i]);
  }
  return out;
}

function bankTypeName(subjectId, typeKey) {
  var bank = bankData(subjectId);
  if (!bank) return typeKey;
  for (var i = 0; i < bank.types.length; i++) if (bank.types[i].key === typeKey) return bank.types[i].name || typeKey;
  return typeKey;
}

function bankQuestionById(id) {
  var all = bankAllQuestions();
  for (var i = 0; i < all.length; i++) if (all[i].id === id) return all[i];
  return null;
}

function bankFindByStem(stem) {
  var all = bankAllQuestions();
  var needle = String(stem || '').replace(/\s+/g, '');
  for (var i = 0; i < all.length; i++) {
    var s = String(all[i].stem || '').replace(/\s+/g, '');
    if (s && (s.indexOf(needle) === 0 || needle.indexOf(s) === 0)) return all[i];
  }
  return null;
}

// 题目「可纳入错题本」的载体：题型 + 钩子（wrongId 便于回跳定位）
function bankBuildCard(q) {
  var tagText = (q.tags || []).map(function (id) { return bankTagTitle(q.subject, id) || id; }).join(' · ');
  return {
    title: q.subjectLabel + ' ' + q.year + ' ' + q.no + ' · ' + q.typeName,
    question: q.stem,
    answer: q.answer,
    questionHtml: q.stem,
    answerHtml: q.answer,
    tags: tagText,
    source: (q.src && (q.src.file || '')) + (q.src && q.src.no ? (' · ' + q.src.no) : ''),
    wrongId: 'bank_' + q.id
  };
}

// 一键加入错题本（复用 wrong.mjs 的现有机制，不重复实现）
function bankAddToWrong(q) {
  if (typeof markAsWrong !== 'function') {
    if (typeof toast === 'function') toast('错题本模块尚未就绪');
    return;
  }
  var ex = {
    q: q.stem,
    a: q.answer,
    src: (q.src && q.src.file) ? (q.src.file + (q.src.no ? ' ' + q.src.no : '')) : '',
    id: 'bank_' + q.id,
    subject: q.subject,
    year: q.year,
    no: q.no,
    type: q.type,
    tags: (q.tags || []).slice()
  };
  markAsWrong(ex, 'bank:' + q.id);
}

// 从错题本点回题库该题（wrong.mjs 的浏览页会调）。
// 范围＝全局学科选择器：题目属于别的科目时先切全局学科（src/actions.mjs 的 switchSubject），
// 它内部会 resetSessionState()（清 bankOpen）并异步重渲染，所以 bankOpen 必须在切换之后再写。
function bankOpenFromWrong(q) {
  var direct = q && q.id && bankQuestionById(q.id);
  var hit = direct || bankFindByStem((q && (q.q || q.question)) || '');
  if (hit) {
    if (hit.subject !== bankCurrentSubjectId() && typeof switchSubject === 'function') {
      switchSubject(hit.subject);
    }
    bankOpen = hit.id;
    if (typeof currentView !== 'undefined') currentView = 'bank';
    if (typeof currentModule !== 'undefined') currentModule = 'cards';
    if (typeof renderApp === 'function') renderApp();
    return true;
  }
  if (typeof toast === 'function') toast('题库中未找到该题');
  return false;
}

// ---- 视图 ----

// 全局学科不在三科内（全库 25 科里另外 22 科没有题库数据）时的空状态：
// 题库没有页内学科选择器，切学科只能走顶部全局选择器，这里把它指出来。
function bankSubjectEmpty() {
  var labels = [];
  var ids = bankAvailableSubjects();
  for (var i = 0; i < ids.length; i++) {
    labels.push((BANK_SUBJECT_META[ids[i]] || {}).label || ids[i]);
  }
  return el('div', 'bank-empty bank-empty-subject',
    '当前学科暂无题库数据 · 用顶部学科选择器切到 ' + labels.join(' / '));
}

function renderBank() {
  if (typeof document === 'undefined') return null;
  var app = document.getElementById('app');
  if (!app) return null;
  app.innerHTML = '';
  if (!bankAvailableSubjects().length) {
    var empty = el('div', 'bank-empty', '题库数据未加载（data/bank_*.js）。');
    app.appendChild(empty);
    return app;
  }
  // 学科范围恒等于全局学科选择器：三科外不出筛选区，也不残留上一科的题目
  if (!bankCurrentSubjectId()) {
    app.appendChild(bankSubjectEmpty());
    return app;
  }
  var q = bankOpen ? bankQuestionById(bankOpen) : null;
  if (q) app.appendChild(bankDetailNode(q));
  else app.appendChild(bankListPage());
  return app;
}

function bankListPage() {
  var sid = bankCurrentSubjectId();
  var wrap = el('div', 'bank-view');
  wrap.appendChild(bankHeader());

  bankNormalizeTypeFilter(sid);
  // 概览区恒为「本科目总量」口径（读全库，不随筛选变化）；筛选命中数是单独一行活数。
  var totals = bankSubjectTotals();
  var rows = bankFilteredQuestions();

  wrap.appendChild(bankHitLine(rows.length, bankSubjectTotal(totals, sid)));
  wrap.appendChild(bankFilters(rows));

  var toolbar = el('div', 'bank-toolbar');
  var scope = el('div', 'bank-count', bankScopeText(sid, totals));
  scope.setAttribute('data-bank-scope', sid);
  scope.setAttribute('data-bank-scope-total', String(bankSubjectTotal(totals, sid)));
  toolbar.appendChild(scope);
  var reset = el('button', 'bank-reset', '重置筛选');
  reset.setAttribute('type', 'button');
  reset.setAttribute('data-action', 'bankReset');
  toolbar.appendChild(reset);
  wrap.appendChild(toolbar);

  if (!rows.length) {
    wrap.appendChild(el('div', 'bank-empty', '没有满足当前筛选条件的题目。'));
    return wrap;
  }
  var list = el('div', 'bank-list');
  for (var i = 0; i < rows.length; i++) list.appendChild(bankItemNode(rows[i]));
  wrap.appendChild(list);
  return wrap;
}

// 概览区第二行：当前筛选命中数（活数）。与科目卡片的「总量」口径成对出现，两者语义分明。
function bankHitLine(hits, total) {
  var line = el('div', 'bank-hit' + (hits === total ? '' : ' is-filtered'));
  line.setAttribute('data-bank-hits', String(hits));
  line.setAttribute('data-bank-total', String(total));
  line.appendChild(el('span', 'bank-hit-text', bankHitText(hits, total)));
  return line;
}

// 标题行：图标 + 「题库 · 真题」+ 当前学科（学科由顶部全局学科选择器决定，页内不再重复选择）
function bankHeader() {
  var head = el('div', 'bank-head');
  var title = el('div', 'bank-title');
  if (typeof icon === 'function') title.appendChild(icon('bank'));
  title.appendChild(el('span', 'bank-title-text', '题库 · 真题'));
  head.appendChild(title);
  var sid = bankCurrentSubjectId();
  var meta = BANK_SUBJECT_META[sid] || {};
  head.appendChild(el('div', 'bank-head-scope', ((meta.label || sid || '') + ' · 真题')));
  return head;
}

// 三组并列筛选（题型 / 知识点 / 难度≥）——原生 <select>，各带可见 <label>。
// 原生控件无法携带随选择变化的 data-arg，因此 change 时直接派发既有 bankFilter 动作与
// 既有参数名（type= / tag= / star=）：不新增 action 名，状态改写与重渲染仍收口在 actions.mjs。
function bankFilterField(labelText, key, options, current) {
  var field = el('div', 'bank-filter bank-filter-' + key);
  var id = 'bank-filter-' + key;
  var lab = el('label', 'bank-filter-label', labelText);
  lab.setAttribute('for', id);
  field.appendChild(lab);

  var sel = el('select', 'bank-select bank-select-' + key);
  sel.setAttribute('id', id);
  sel.setAttribute('data-bank-facet', key);
  sel.setAttribute('aria-label', labelText);
  var value = bankSelectValue(options, current);
  sel.setAttribute('data-arg', key + '=' + value); // 供调试/测试观察当前筛选参数
  for (var i = 0; i < options.length; i++) {
    var o = el('option', 'bank-select-option' + (options[i].disabled ? ' bank-select-option-more' : ''), options[i].label);
    o.setAttribute('value', options[i].value);
    if (options[i].disabled) o.setAttribute('disabled', 'disabled');
    if (String(options[i].value) === value) o.setAttribute('selected', 'selected');
    sel.appendChild(o);
  }
  sel.value = value; // 回填当前筛选值（value 不在选项里时 bankSelectValue 已归到 all）
  sel.addEventListener('change', function () {
    var v = sel.value || 'all';
    sel.setAttribute('data-arg', key + '=' + v);
    if (typeof handleAction === 'function') handleAction('bankFilter', key + '=' + v);
  });
  field.appendChild(sel);
  return field;
}

function bankFilters(rows) {
  var box = el('div', 'bank-filters');
  box.appendChild(bankFilterField('题型', 'type', bankTypeOptions(bankCurrentSubjectId()), bankType));
  var tagOptions = bankTagOptions(rows, bankTag);
  var hidden = bankTagOptionHidden(rows, bankTag);
  if (hidden > 0) {
    tagOptions = tagOptions.concat([
      { value: '__more', label: '其余 ' + hidden + ' 个知识点（缩小筛选后可见）', disabled: true }
    ]);
  }
  box.appendChild(bankFilterField('知识点', 'tag', tagOptions, bankTag));
  box.appendChild(bankFilterField('难度（≥）', 'star', bankStarOptions(), bankStar));
  return box;
}

function bankItemNode(q) {
  var item = el('div', 'bank-item' + (bankOpen === q.id ? ' is-open' : ''));
  item.setAttribute('data-bank-id', q.id);

  var main = el('div', 'bank-item-main');
  main.setAttribute('data-action', 'bankOpen');
  main.setAttribute('data-arg', q.id);
  main.setAttribute('role', 'button');
  main.setAttribute('tabindex', '0');

  var top = el('div', 'bank-item-top');
  // 来源只留徽标：「院校 · 年度 · 题号」（院校取 q.school，数据侧尚未补时回退科目名）
  top.appendChild(el('span', 'bank-badge bank-badge-school', bankSchoolLabel(q)));
  top.appendChild(el('span', 'bank-badge bank-badge-year', q.year + ' · ' + q.no));
  top.appendChild(el('span', 'bank-badge bank-badge-type', q.typeName));
  var tstar = el('span', 'bank-badge bank-badge-freq bank-star' + q.typeStars, bankStars(q.typeStars));
  tstar.setAttribute('title', '题型出现频率星级（库内统计）');
  top.appendChild(tstar);
  var dstar = el('span', 'bank-badge bank-badge-diff bank-star' + bankStarLevel(q.star), bankStars(q.star));
  dstar.setAttribute('title', '题目难度星级');
  top.appendChild(dstar);
  main.appendChild(top);

  var stem = texEl('div', 'bank-stem', q.stem);
  main.appendChild(stem);

  var tags = el('div', 'bank-tag-row');
  var list = q.tags || [];
  for (var i = 0; i < Math.min(4, list.length); i++) {
    var tag = el('span', 'bank-tag', bankTagTitle(q.subject, list[i]) || list[i]);
    tag.setAttribute('title', bankTagCat(q.subject, list[i]) + ' · ' + list[i]);
    tags.appendChild(tag);
  }
  if (list.length > 4) tags.appendChild(el('span', 'bank-tag bank-tag-more', '+' + (list.length - 4)));
  main.appendChild(tags);
  item.appendChild(main);

  var actions = el('div', 'bank-item-actions');
  var st = bankWrongState(q);
  var mark = el('button', 'bank-btn bank-btn-wrong' + (st.inBook ? ' is-in' : ''), st.inBook ? '已在错题本' : '加入错题本');
  mark.setAttribute('type', 'button');
  mark.setAttribute('data-action', 'bankAddWrong');
  mark.setAttribute('data-arg', q.id);
  actions.appendChild(mark);
  var openBtn = el('button', 'bank-btn bank-btn-detail', '详情');
  openBtn.setAttribute('type', 'button');
  openBtn.setAttribute('data-action', 'bankOpen');
  openBtn.setAttribute('data-arg', q.id);
  actions.appendChild(openBtn);
  item.appendChild(actions);
  return item;
}

function bankDetailNode(q) {
  var wrap = el('div', 'bank-view bank-detail');
  wrap.appendChild(bankHeader());

  var bar = el('div', 'bank-detail-bar');
  var back = el('button', 'bank-back', '← 返回题库列表');
  back.setAttribute('type', 'button');
  back.setAttribute('data-action', 'bankBack');
  bar.appendChild(back);
  var prev = el('button', 'bank-btn bank-btn-nav', '上一题');
  prev.setAttribute('type', 'button');
  prev.setAttribute('data-action', 'bankStep');
  prev.setAttribute('data-arg', '-1');
  bar.appendChild(prev);
  var next = el('button', 'bank-btn bank-btn-nav', '下一题');
  next.setAttribute('type', 'button');
  next.setAttribute('data-action', 'bankStep');
  next.setAttribute('data-arg', '1');
  bar.appendChild(next);
  wrap.appendChild(bar);

  var body = el('div', 'bank-detail-body');
  var top = el('div', 'bank-item-top');
  // 来源只留徽标：「院校 · 年度 · 题号」（院校取 q.school，数据侧尚未补时回退科目名）
  top.appendChild(el('span', 'bank-badge bank-badge-school', bankSchoolLabel(q)));
  top.appendChild(el('span', 'bank-badge bank-badge-year', q.year + ' · ' + q.no));
  top.appendChild(el('span', 'bank-badge bank-badge-type', q.typeName));
  top.appendChild(el('span', 'bank-badge bank-badge-freq bank-star' + q.typeStars, bankStars(q.typeStars) + ' 出现频率'));
  top.appendChild(el('span', 'bank-badge bank-badge-diff bank-star' + bankStarLevel(q.star), bankStars(q.star) + ' 难度'));
  body.appendChild(top);

  body.appendChild(texEl('div', 'bank-stem bank-stem-detail', q.stem));

  var opt = q.options;
  if (opt && opt.length) {
    var ol = el('div', 'bank-options');
    for (var i = 0; i < opt.length; i++) ol.appendChild(texEl('div', 'bank-option', opt[i]));
    body.appendChild(ol);
  }

  body.appendChild(el('div', 'bank-sec-title', '答案与解析'));
  body.appendChild(texEl('div', 'bank-answer', q.answer));

  body.appendChild(el('div', 'bank-sec-title', '陷阱'));
  body.appendChild(texEl('div', 'bank-traps', q.traps));

  body.appendChild(el('div', 'bank-sec-title', '提示'));
  body.appendChild(texEl('div', 'bank-hint', q.hint));

  var tagBox = el('div', 'bank-tag-row bank-tag-row-detail');
  var tags = q.tags || [];
  for (var j = 0; j < tags.length; j++) {
    var tag = el('span', 'bank-tag', bankTagTitle(q.subject, tags[j]) || tags[j]);
    tag.setAttribute('title', bankTagCat(q.subject, tags[j]) + ' · ' + tags[j]);
    tagBox.appendChild(tag);
  }
  body.appendChild(tagBox);

  // 来源区已移除（t17）：来源只留在顶部徽标（院校 · 年度 · 题号）里。
  // 数据里的 q.src（文件/页码/题号/note）保留不动，供数据侧审计（t19）与 2.2.0 全量入库使用。

  var actions = el('div', 'bank-detail-actions');
  var st = bankWrongState(q);
  var mark = el('button', 'bank-btn bank-btn-wrong' + (st.inBook ? ' is-in' : ''), st.inBook ? '已在错题本（点按定位）' : '加入错题本');
  mark.setAttribute('type', 'button');
  mark.setAttribute('data-action', 'bankAddWrong');
  mark.setAttribute('data-arg', q.id);
  actions.appendChild(mark);
  body.appendChild(actions);

  wrap.appendChild(body);
  return wrap;
}

// 单测导出（tools/build.mjs 的 STRIP 会剥离，浏览器端 app.js 不含此行）
export {
  bankStarLevel, bankStars, bankTypeStars, bankTypeFrequency,
  bankTagCat, bankTagTitle, bankMatch, bankAllQuestions, bankFilteredQuestions,
  bankData, bankSubjectData,
  // t14：错题本状态判定（口径与 wrong.mjs 入库查重同源）
  bankSameQuestion, bankLookupWrongEntry, bankWrongState,
  // t15：概览总量口径 / 当前筛选命中
  bankTypeSelected, bankCurrentFilter,
  bankSubjectTotals, bankSubjectTotal, bankSubjectTypeCount, bankHitText, bankScopeText,
  // t17：学科范围＝全局学科选择器 / 三组下拉选项 / 徽标院校回退
  bankCurrentSubjectId, bankNormalizeTypeFilter,
  bankTypeOptions, bankTagRanking, bankTagOptions, bankTagOptionHidden, bankStarOptions,
  bankSelectValue, bankSchoolLabel
};