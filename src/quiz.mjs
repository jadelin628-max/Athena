  // ---------------- 帮助栏目：本科目的指导与答疑文章（检索用，不参与学习调度） ----------------
  let helpState = { open: {} };

  function renderHelp() {
    if (!helpState.open) helpState.open = {};
    const app = document.getElementById('app');
    app.innerHTML = ''; // 搜索/展开会直接重入本函数：先清容器，避免 DOM 叠加
    const wrap = el('div', 'help-wrap');
    wrap.appendChild(el('h2', null, '❓ 帮助 · ' + (BASE_SUBJ ? BASE_SUBJ.name : '')));
    wrap.appendChild(el('p', 'muted', '本科目的学习方法、环境准备与常见疑问——供检索查阅，不进入学习队列与统计。'));

    const search = el('input', 'help-search');
    search.type = 'search';
    search.placeholder = '搜索帮助文章…';
    search.value = helpState.q || '';
    search.addEventListener('input', function () {
      helpState.q = search.value;
      renderHelp();
      const box = document.querySelector('.help-search');
      if (box) { box.focus(); box.setSelectionRange(box.value.length, box.value.length); }
    });
    wrap.appendChild(search);

    const arts = (BASE_SUBJ && BASE_SUBJ.HELP) || [];
    const q = (helpState.q || '').trim().toLowerCase();
    const list = arts.filter(function (a) {
      return !q || a.title.toLowerCase().indexOf(q) !== -1 || String(a.body).toLowerCase().indexOf(q) !== -1;
    });
    if (!arts.length) {
      wrap.appendChild(el('p', 'muted', '本学科暂无帮助文章。'));
    } else if (!list.length) {
      wrap.appendChild(el('p', 'muted', '没有匹配「' + helpState.q + '」的文章。'));
    }
    list.forEach(function (a) {
      const item = el('div', 'help-item');
      const head = el('button', 'help-head' + (helpState.open[a.id] ? ' open' : ''), '');
      head.type = 'button';
      head.appendChild(el('span', null, a.title));
      head.appendChild(el('span', 'help-arrow', helpState.open[a.id] ? '▾' : '▸'));
      head.addEventListener('click', function () {
        helpState.open[a.id] = !helpState.open[a.id];
        renderHelp();
      });
      item.appendChild(head);
      if (helpState.open[a.id]) {
        const body = el('div', 'help-body');
        renderTex(body, a.body);
        item.appendChild(body);
      }
      wrap.appendChild(item);
    });
    app.appendChild(wrap);
  }

  function renderBrowse() {
    const app = document.getElementById('app');

    const head = el('div', 'browse-head');
    const search = el('input', 'search');
    search.type = 'search';
    search.placeholder = subjKind() === 'qa' ? '搜索知识点（名称 / 内容）…' : '搜索公式（名称 / 内容）…';
    search.value = browseQuery;
    // 输入时只重绘列表，不重建整个视图（避免销毁搜索框导致输入/IME 被打断）；
    // 150ms 防抖：停止输入后才做全量过滤 + 重建列表，逐键不再卡顿。
    // IME 保护：拼音等输入法组合期间（上屏未选字）value 是拼音中间态，
    // 此时过滤会得到"没有匹配"的假象（移动端搜索失效报告的根因）——
    // 组合期间跳过过滤，compositionend（选字/上屏）后立即按最终文本过滤。
    let searchTimer = null;
    let composing = false;
    const scheduleList = function () {
      clearTimeout(searchTimer);
      searchTimer = setTimeout(function () {
        const old = app.querySelector('.browse-list');
        if (old) old.replaceWith(buildBrowseList());
      }, 150);
    };
    search.addEventListener('compositionstart', function () { composing = true; });
    search.addEventListener('compositionend', function () {
      composing = false;
      browseQuery = search.value;
      scheduleList();
    });
    search.addEventListener('input', function () {
      if (composing) return;
      browseQuery = search.value;
      scheduleList();
    });
    head.appendChild(search);
    app.appendChild(head);

    const chips = el('div', 'chips');
    const allChip = el('button', 'chip' + (browseCat === 'all' ? ' active' : ''), '全部');
    allChip.setAttribute('data-action', 'bcat');
    allChip.setAttribute('data-arg', 'all');
    chips.appendChild(allChip);
    catOrder().forEach(function (k) {
      const b = el('button', 'chip' + (browseCat === k ? ' active' : ''), CATS[k]);
      b.setAttribute('data-action', 'bcat');
      b.setAttribute('data-arg', k);
      chips.appendChild(b);
    });
    app.appendChild(chips);

    const chipsM = el('div', 'chips');
    chipsM.appendChild(el('span', 'filter-label', '掌握'));
    ['all', '未学', '初学', '生疏', '巩固中', '已掌握', '熟练', '稳固', '毕业'].forEach(function (v) {
      const b = el('button', 'chip' + (browseMastery === v ? ' active' : ''), v === 'all' ? '全部' : v);
      b.setAttribute('data-action', 'bmastery');
      b.setAttribute('data-arg', v);
      chipsM.appendChild(b);
    });
    app.appendChild(chipsM);

    const chipsS = el('div', 'chips');
    chipsS.appendChild(el('span', 'filter-label', '重要'));
    ['all', '1', '2', '3', '4', '5'].forEach(function (v) {
      const b = el('button', 'chip' + (browseStars === v ? ' active' : ''), v === 'all' ? '全部' : v + '★');
      b.setAttribute('data-action', 'bstars');
      b.setAttribute('data-arg', v);
      chipsS.appendChild(b);
    });
    app.appendChild(chipsS);

    app.appendChild(buildBrowseList());
  }

  // 构建浏览列表（独立函数，供搜索输入时局部重绘，避免整页重建打断输入）
  function buildBrowseList() {
    const list = el('div', 'browse-list');
    let n = 0;
    DATA.forEach(function (f) {
      if (browseCat !== 'all' && f.cat !== browseCat) return;
      if (browseMastery !== 'all' && mastery(f.id).label !== browseMastery) return;
      if (browseStars !== 'all' && String(metaOf(f.id)[0]) !== browseStars) return;
      if (browseQuery) {
        const hay = (f.title + ' ' + f.front + ' ' + f.back).toLowerCase();
        if (hay.indexOf(browseQuery.trim().toLowerCase()) === -1) return;
      }
      n++;
      list.appendChild(browseItem(f));
    });
    if (n === 0) { list.appendChild(illus('empty-search')); list.appendChild(el('p', 'muted', subjKind() === 'qa' ? '没有匹配的知识点。' : '没有匹配的公式。')); }
    return list;
  }

  function browseItem(f) {
    const item = el('div', 'browse-item');
    item.setAttribute('data-card', f.id);
    const head = el('button', 'browse-item-head');
    head.setAttribute('data-action', 'btoggle');
    head.setAttribute('data-arg', f.id);
    const left = el('div', 'browse-title');
    left.appendChild(el('span', 'badge', CATS[f.cat]));
    left.appendChild(texEl('span', 'browse-name', f.title));
    left.appendChild(el('span', 'star-badge small', starText(metaOf(f.id)[0])));
    const m = mastery(f.id);
    const mark = el('span', 'browse-state');
    mark.textContent = m.label + ' ' + m.pct + '%';
    left.appendChild(mark);
    head.appendChild(left);
    item.appendChild(head);

    const bar = el('div', 'mastery-bar');
    const fill = el('div', 'mastery-fill');
    fill.style.width = m.pct + '%';
    bar.appendChild(fill);
    item.appendChild(bar);

    if (browseExpanded[f.id]) {
      const body = el('div', 'browse-body');
      const q = el('div', 'browse-q');
      q.appendChild(el('div', 'mini-label', '提示'));
      const qb = el('div');
      renderTex(qb, f.front);
      q.appendChild(qb);
      body.appendChild(q);
      const a = el('div', 'browse-a');
      a.appendChild(el('div', 'mini-label', '答案'));
      const ab = el('div');
      renderTex(ab, f.back);
      a.appendChild(ab);
      const ub = el('div', 'use-box');
      ub.appendChild(el('span', 'use-label', subjKind() === 'qa' ? '📌 考查方式：' : '📌 常考题型：'));
      ub.appendChild(el('span', null, metaOf(f.id)[1]));
      a.appendChild(ub);
      body.appendChild(a);
      const mn = mnemOf(f.id);
      if (mn) {
        const mb = el('div', 'mnem-box');
        mb.appendChild(el('span', 'mnem-label', '🗝️ 助记：'));
        mb.appendChild(texEl('span', null, mn));
        body.appendChild(mb);
      }
      const pf = pitfallOf(f.id);
      if (pf) {
        const pfb = el('div', 'pitfall-box');
        pfb.appendChild(el('span', 'pitfall-label', '⚠️ 常见陷阱：'));
        pfb.appendChild(texEl('span', null, pf));
        body.appendChild(pfb);
      }
      // 笔记模块置于真题/相关知识点模块之前（与学习页一致）
      const notesBox = el('div', 'notes-box');
      notesBox.appendChild(el('div', 'mini-label', '📝 我的笔记（感想 / 补充 / 易错点）'));
      const notes = el('textarea', 'card-notes');
      notes.placeholder = '在这里记录你的理解、补充或易错点…';
      notes.value = card(f.id).notes || '';
      let notesTimer;
      notes.addEventListener('input', function () {
        card(f.id).notes = notes.value;
        card(f.id).noteUpd = Date.now(); // 笔记独立时间戳（云同步合并用）
        clearTimeout(notesTimer);
        notesTimer = setTimeout(saveDB, 400);
      });
      notesBox.appendChild(notes);
      body.appendChild(notesBox);
      const extras = buildExtras(f.id, '');
      if (extras) body.appendChild(extras);
      body.appendChild(memoryBox(f.id));
      const edit = el('button', 'btn small', '✏️ 编辑');
      edit.addEventListener('click', function () { openCardEdit(f.id); });
      body.appendChild(edit);
      const reset = el('button', 'btn small danger', '重置此卡片进度');
      reset.setAttribute('data-action', 'resetcard');
      reset.setAttribute('data-arg', f.id);
      body.appendChild(reset);
      item.appendChild(body);
    }
    return item;
  }

  // ================== 自测（T51 重构：可配置队列 + 报告 + 表现差入重学） ==================
  // 流程：配置（数量 / 章节范围 / 难度范围 / 掌握度范围）→ 出题队列 → 逐题作答
  //       → 报告（成绩 / 章节表现 / 用时 / 与预测掌握度的差距）→ 表现差按既有
  //       「提前复习」接口（sched.markCardDueNow）进入重学队列。
  // 两种来源共用同一套流程与 UI：知识卡自测（默认）与错题自测（currentModule==='wrong'）。
  // 口径：自测只做「检查」——不写评分日志（revlog）、不改 FSRS 参数；唯一的排期改动是
  //       表现差的题把到期时间提前到现在（不重置记忆历史，不新增算法）。

  // ===== BEGIN TESTABLE quiz core helpers =====
  // 纯函数区（无 DOM / 无 DB 依赖）：tests/quiz.test.mjs 用标记块抽取到 vm 求值回归。
  const QUIZ_MAX_COUNT = 50;       // 数量上限（配置面板边界校验）
  const QUIZ_DEFAULT_COUNT = 10;
  const QUIZ_WEAK_ACC = 60;        // 整场正确率 < 60% → 视为「表现差」（阈值明确可测）
  const QUIZ_DIFF_MIN = 1;         // FSRS 记忆难度 D 的值域
  const QUIZ_DIFF_MAX = 10;
  const QUIZ_MASTERY_MIN = 0;      // 掌握度（%）值域
  const QUIZ_MASTERY_MAX = 100;
  const QUIZ_DEFAULT_DIFF = 5;     // 未进入排期的卡没有真实 D，按默认 5 计
  const QUIZ_UNCATED = '未关联';    // 错题没有关联知识点时的章节桶
  const QUIZ_MAX_RECORDS = 200;    // DB.log.quiz 保留条数上限

  function quizDefaultConfig() {
    return {
      count: QUIZ_DEFAULT_COUNT,
      cats: [],
      diff: [QUIZ_DIFF_MIN, QUIZ_DIFF_MAX],
      mastery: [QUIZ_MASTERY_MIN, QUIZ_MASTERY_MAX]
    };
  }

  function quizShuffle(arr, rnd) {
    const a = (Array.isArray(arr) ? arr : []).slice();
    const rand = (typeof rnd === 'function') ? rnd : Math.random;
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(rand() * (i + 1)) % (i + 1);
      const t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }

  function quizClampNum(v, lo, hi, dflt) {
    const n = (typeof v === 'number') ? v : parseFloat(v);
    if (!isFinite(n)) return dflt;
    if (n < lo) return lo;
    if (n > hi) return hi;
    return n;
  }

  // 区间净化：夹取到 [lo,hi]；下限大于上限时自动交换
  function quizSanitizeRange(pair, lo, hi, dflt) {
    const a = Array.isArray(pair) ? pair : [];
    const l = quizClampNum(a[0], lo, hi, dflt[0]);
    const h = quizClampNum(a[1], lo, hi, dflt[1]);
    return l <= h ? [l, h] : [h, l];
  }

  // 四维配置净化（配置面板的边界校验）：数量 1–50、难度 1–10、掌握度 0–100，
  // 越界夹取、非法值回落默认、未知章节丢弃、重复章节去重。
  function quizSanitizeConfig(raw, allCats) {
    const r = (raw && typeof raw === 'object') ? raw : {};
    const keys = Array.isArray(allCats) ? allCats : [];
    const seen = {};
    const cats = [];
    if (Array.isArray(r.cats)) {
      r.cats.forEach(function (k) {
        if (typeof k !== 'string' || !k) return;
        if (keys.length && keys.indexOf(k) === -1) return;
        if (seen[k]) return;
        seen[k] = true;
        cats.push(k);
      });
    }
    return {
      count: Math.round(quizClampNum(r.count, 1, QUIZ_MAX_COUNT, QUIZ_DEFAULT_COUNT)),
      cats: cats,
      diff: quizSanitizeRange(r.diff, QUIZ_DIFF_MIN, QUIZ_DIFF_MAX, [QUIZ_DIFF_MIN, QUIZ_DIFF_MAX]),
      mastery: quizSanitizeRange(r.mastery, QUIZ_MASTERY_MIN, QUIZ_MASTERY_MAX, [QUIZ_MASTERY_MIN, QUIZ_MASTERY_MAX])
    };
  }

  // 候选筛选：章节范围（空数组=全部）+ 难度范围 + 掌握度范围，三段都命中才留在池子里
  function quizFilterEntries(entries, cfg) {
    const c = cfg || quizDefaultConfig();
    const cats = c.cats || [];
    const d = c.diff || [QUIZ_DIFF_MIN, QUIZ_DIFF_MAX];
    const m = c.mastery || [QUIZ_MASTERY_MIN, QUIZ_MASTERY_MAX];
    return (Array.isArray(entries) ? entries : []).filter(function (e) {
      if (!e || !e.id) return false;
      if (cats.length && cats.indexOf(e.cat) === -1) return false;
      const diff = (typeof e.diff === 'number' && isFinite(e.diff)) ? e.diff : QUIZ_DEFAULT_DIFF;
      const mast = (typeof e.mastery === 'number' && isFinite(e.mastery)) ? e.mastery : 0;
      if (!(diff >= d[0] && diff <= d[1])) return false;
      return mast >= m[0] && mast <= m[1];
    });
  }

  // 「配置 → 出题队列」纯函数：池内随机取 count 张（池子不足则全取）；
  // 每题配 3 个干扰项——优先取自同一筛选池，不足时从 fallback（全量）补，至少 2 个选项。
  function quizBuildQueue(entries, cfg, rnd, fallback) {
    const rand = (typeof rnd === 'function') ? rnd : Math.random;
    const c = quizSanitizeConfig(cfg, []);
    const pool = quizFilterEntries(entries, c);
    const extra = Array.isArray(fallback) ? fallback : (Array.isArray(entries) ? entries : []);
    const want = Math.min(c.count, pool.length);
    const picked = quizShuffle(pool, rand).slice(0, want);
    const qs = picked.map(function (e) {
      const seen = {};
      seen[e.id] = true;
      const distract = [];
      const take = function (list) {
        quizShuffle(list, rand).forEach(function (x) {
          if (distract.length >= 3 || !x || !x.id || seen[x.id]) return;
          seen[x.id] = true;
          distract.push(x);
        });
      };
      take(pool.filter(function (x) { return x.id !== e.id; }));
      if (distract.length < 3) take(extra.filter(function (x) { return x.id !== e.id; }));
      return {
        id: e.id,
        label: e.label,
        prompt: e.prompt,
        cat: e.cat,
        diff: (typeof e.diff === 'number' && isFinite(e.diff)) ? e.diff : QUIZ_DEFAULT_DIFF,
        mastery: (typeof e.mastery === 'number' && isFinite(e.mastery)) ? e.mastery : 0,
        predicted: (typeof e.predicted === 'number' && isFinite(e.predicted)) ? e.predicted : 0,
        opts: quizShuffle([e].concat(distract), rand).map(function (x) { return { id: x.id, label: x.label }; })
      };
    });
    return { qs: qs, poolSize: pool.length, totalSize: (Array.isArray(entries) ? entries.length : 0) };
  }

  // 表现差判定（阈值明确可测）：
  //   ① 单题答错 → 该题进入重学队列；
  //   ② 整场正确率 < QUIZ_WEAK_ACC（60%）→ 整场视为「表现差」，全部题目进入重学队列。
  function quizWeakIds(answers, pct) {
    const poor = (typeof pct === 'number' && isFinite(pct)) ? (pct < QUIZ_WEAK_ACC) : false;
    const out = [];
    (Array.isArray(answers) ? answers : []).forEach(function (a) {
      if (!a || !a.id) return;
      if (a.ok === false || poor) { if (out.indexOf(a.id) === -1) out.push(a.id); }
    });
    return out;
  }

  function quizVerdict(pct) {
    if (typeof pct !== 'number' || !isFinite(pct)) return '—';
    if (pct >= 90) return '优秀';
    if (pct >= 75) return '良好';
    if (pct >= QUIZ_WEAK_ACC) return '及格';
    return '待加强';
  }

  // 报告：成绩 / 章节表现 / 用时 / 与预测掌握度的差距（+ 表现差清单）
  function quizBuildReport(rec) {
    const r = rec || {};
    const answers = (Array.isArray(r.answers) ? r.answers : []).filter(function (a) { return a && a.id; });
    const total = answers.length;
    const correct = (typeof r.correct === 'number') ? r.correct : answers.filter(function (a) { return a.ok === true; }).length;
    const pct = total ? Math.round(correct / total * 100) : 0;
    const ms = (typeof r.ms === 'number' && isFinite(r.ms) && r.ms > 0) ? Math.round(r.ms) : 0;
    const order = [];
    const bucket = {};
    answers.forEach(function (a) {
      const k = a.cat || QUIZ_UNCATED;
      if (!bucket[k]) { bucket[k] = { cat: k, n: 0, ok: 0 }; order.push(k); }
      bucket[k].n++;
      if (a.ok === true) bucket[k].ok++;
    });
    const byCat = order.map(function (k) {
      const b = bucket[k];
      return { cat: b.cat, n: b.n, ok: b.ok, pct: b.n ? Math.round(b.ok / b.n * 100) : 0 };
    });
    // 与预测掌握度的差距：预测＝本组题的平均掌握度（%），实际＝本次正确率（%）。
    // 另附「算法预测可提取性 R」（复习中卡片的 FSRS 回忆概率），同量纲、口径不同。
    const predSum = answers.reduce(function (s, a) {
      return s + ((typeof a.mastery === 'number' && isFinite(a.mastery)) ? a.mastery : 0);
    }, 0);
    const rList = answers.filter(function (a) { return typeof a.predicted === 'number' && isFinite(a.predicted); });
    const rSum = rList.reduce(function (s, a) { return s + a.predicted; }, 0);
    const predicted = total ? Math.round(predSum / total) : 0;
    return {
      mode: r.mode === 'wrong' ? 'wrong' : 'cards',
      total: total,
      correct: correct,
      pct: pct,
      ms: ms,
      msAvg: total ? Math.round(ms / total) : 0,
      byCat: byCat,
      predicted: predicted,
      predictedR: rList.length ? Math.round(rSum / rList.length) : null,
      gap: pct - predicted,
      verdict: total ? quizVerdict(pct) : '—',
      weakIds: quizWeakIds(answers, pct),
      answers: answers
    };
  }

  // 统计页聚合（纯）：自测次数 / 题数 / 正确率 / 用时 / 表现差入队张数
  function quizLogStats(records, fromTs) {
    const list = (Array.isArray(records) ? records : []).filter(function (r) {
      return r && typeof r.t === 'number' && isFinite(r.t) && (!fromTs || r.t >= fromTs);
    }).sort(function (a, b) { return a.t - b.t; });
    let totalQ = 0, correctQ = 0, ms = 0, weak = 0, queued = 0;
    const byMode = {
      cards: { n: 0, total: 0, correct: 0, ms: 0 },
      wrong: { n: 0, total: 0, correct: 0, ms: 0 }
    };
    list.forEach(function (r) {
      const t = (typeof r.total === 'number') ? r.total : 0;
      const c = (typeof r.correct === 'number') ? r.correct : 0;
      const m = (typeof r.ms === 'number' && isFinite(r.ms)) ? r.ms : 0;
      totalQ += t; correctQ += c; ms += m;
      weak += (Array.isArray(r.weak) ? r.weak.length : 0);
      queued += (Array.isArray(r.queued) ? r.queued.length : 0);
      const k = r.mode === 'wrong' ? 'wrong' : 'cards';
      byMode[k].n++; byMode[k].total += t; byMode[k].correct += c; byMode[k].ms += m;
    });
    return {
      n: list.length,
      totalQ: totalQ,
      correctQ: correctQ,
      ms: ms,
      weak: weak,
      queued: queued,
      acc: totalQ ? Math.round(correctQ / totalQ * 100) : null,
      msAvg: totalQ ? Math.round(ms / totalQ) : 0,
      byMode: byMode,
      last: list.length ? list[list.length - 1] : null,
      list: list
    };
  }
  // 知识卡候选（纯）：data 为知识点数组，cardOf(id)→排期卡、masteryOf(id)→掌握度%、
  // rOf(id)→算法预测可提取性 R（null 表示无）。题面方向：给出内容（back），选它的名称（title）。
  function quizCardCandidates(data, cardOf, masteryOf, rOf) {
    return (Array.isArray(data) ? data : []).map(function (f) {
      const c = (typeof cardOf === 'function') ? (cardOf(f.id) || {}) : {};
      const r = (typeof rOf === 'function') ? rOf(f.id) : null;
      return {
        id: f.id,
        label: f.title,
        prompt: f.back,
        cat: f.cat,
        diff: (typeof c.diff === 'number' && isFinite(c.diff)) ? c.diff : QUIZ_DEFAULT_DIFF,
        mastery: (typeof masteryOf === 'function') ? (masteryOf(f.id) || 0) : 0,
        predicted: (r == null || !isFinite(r)) ? 0 : r
      };
    });
  }

  // 错题候选（纯）：wrongs 为错题表，data 为知识点数组（把关联知识点映射到章节）；
  // masteryOf(wid)→掌握度%、predOf(w)→算法预测可提取性 R。题面方向：给出题目（q），选它的解析（a）。
  // 没有关联知识点的错题单列 QUIZ_UNCATED 桶（不影响筛选：选「全部」时仍会被抽到）。
  function quizWrongCandidates(wrongs, data, masteryOf, predOf) {
    const list = Array.isArray(data) ? data : [];
    return Object.keys(wrongs || {}).map(function (wid) {
      const w = wrongs[wid] || {};
      let cat = QUIZ_UNCATED;
      if (w.linked && w.linked.length) {
        const f = list.find(function (x) { return x.id === w.linked[0]; });
        if (f) cat = f.cat;
      }
      return {
        id: wid,
        label: w.a || '（无解析）',
        prompt: w.q,
        cat: cat,
        diff: (typeof w.diff === 'number' && isFinite(w.diff)) ? w.diff : QUIZ_DEFAULT_DIFF,
        mastery: (typeof masteryOf === 'function') ? (masteryOf(wid) || 0) : 0,
        predicted: (typeof predOf === 'function') ? (predOf(w) || 0) : 0
      };
    });
  }
  // 表现差 → 提前复习入队（纯）：ids 为表现差清单；retriever(id)→卡片对象；
  // dueNow(card) 为既有「提前复习」接口（= sched.mjs 的 markCardDueNow，只提前到期时间，
  // 不动记忆历史）。接口返回 true → 计入 queued（已提前到现在）；false（新卡/已到期，接口
  // 一个字段都不写）或卡片不存在 → 计入 skipped（无需提前）。不新增任何排期算法。
  function quizEnqueue(ids, retriever, dueNow) {
    const queued = [], skipped = [];
    (Array.isArray(ids) ? ids : []).forEach(function (id) {
      const c = (typeof retriever === 'function') ? retriever(id) : null;
      if (!c) { skipped.push(id); return; }
      if (typeof dueNow === 'function' && dueNow(c)) queued.push(id);
      else skipped.push(id);
    });
    return { queued: queued, skipped: skipped };
  }
  // ===== END TESTABLE quiz core helpers =====

  // —— 自测会话/配置状态 ——
  // 配置按来源分别持久化到 DB.settings.quizCfg（新存储键，见交付说明）；会话对象沿用 learn.mjs 的 quiz。
  let quizCfg = null;

  // 来源模式：错题模块进入时用 wrong，其余（一级导航「自测」）用知识卡
  function quizMode() { return currentModule === 'wrong' ? 'wrong' : 'cards'; }

  function quizCatLabel(k) { return (CATS && CATS[k]) || k; }

  function quizCfgStore() {
    if (!DB.settings || typeof DB.settings !== 'object') DB.settings = {};
    if (!DB.settings.quizCfg || typeof DB.settings.quizCfg !== 'object') DB.settings.quizCfg = {};
    return DB.settings.quizCfg;
  }

  // 知识卡候选（适配层）：给出内容（back），选它的名称（title）——与旧版自测同向
  function quizCardEntries() {
    return quizCardCandidates(
      DATA,
      function (id) { return card(id); },
      function (id) { return mastery(id).pct; },
      function (id) { return currentR(id); }
    );
  }

  // 错题候选（适配层）：给出题目（q），选它的解析（a）；章节取关联知识点所属分类，未关联单列一桶
  function quizWrongEntries() {
    return quizWrongCandidates(
      DB.wrongs,
      DATA,
      function (wid) { return wrongMastery(wid).pct; },
      function (w) {
        if (w.state === 'review' && w.stab > 0) {
          const days = Math.max(0, (Date.now() - (w.lastR || Date.now())) / DAY);
          return Math.round(fsrsRetention(days, w.stab) * 100);
        }
        return 0;
      }
    );
  }

  function quizEntries(mode) {
    return ((mode || quizMode()) === 'wrong') ? quizWrongEntries() : quizCardEntries();
  }

  // 章节范围可选项＝当前来源实际出现过的分类（错题可含「未关联」桶）
  function quizCatOptions(mode) {
    const seen = {};
    quizEntries(mode).forEach(function (e) { if (e.cat) seen[e.cat] = true; });
    const keys = [];
    catOrder().forEach(function (k) { if (seen[k]) { keys.push(k); delete seen[k]; } });
    Object.keys(seen).forEach(function (k) { keys.push(k); });
    return keys;
  }

  function quizGetCfg(mode) {
    const m = mode || quizMode();
    if (!quizCfg) quizCfg = quizCfgStore();
    return quizSanitizeConfig(quizCfg[m], quizCatOptions(m));
  }

  function quizSetCfg(mode, next) {
    const m = mode || quizMode();
    const clean = quizSanitizeConfig(next, quizCatOptions(m));
    quizCfgStore()[m] = clean;
    if (typeof saveDB === 'function') saveDB();
    return clean;
  }

  function quizItemLabel(mode, id) {
    if (mode === 'wrong') {
      const w = (DB.wrongs || {})[id];
      return w ? w.q : id;
    }
    const f = (DATA || []).find(function (x) { return x.id === id; });
    return f ? f.title : id;
  }

  // —— 配置面板控件 ——
  function quizNumRow(label, lo, hi, step, value, onSet) {
    const row = el('div', 'quiz-cfg-row');
    row.appendChild(el('span', 'quiz-cfg-label', label));
    const inp = el('input', 'quiz-cfg-num');
    inp.type = 'number';
    inp.min = String(lo);
    inp.max = String(hi);
    inp.step = String(step);
    inp.value = String(value);
    inp.addEventListener('change', function () {
      const raw = parseFloat(inp.value);
      const clean = quizClampNum(raw, lo, hi, value);
      if (isFinite(raw) && Math.abs(raw - clean) > 1e-9) toast(label + ' 允许 ' + lo + '–' + hi + '，已调整为 ' + clean);
      onSet(clean);
    });
    row.appendChild(inp);
    return row;
  }

  function quizRangeRow(mode, label, hint, lo, hi, step, key, cfg) {
    const row = el('div', 'quiz-cfg-row');
    row.appendChild(el('span', 'quiz-cfg-label', label));
    const box = el('div', 'quiz-cfg-inputs');
    const commit = function (idx, raw) {
      const clean = quizClampNum(raw, lo, hi, cfg[key][idx]);
      const pair = (idx === 0) ? [clean, cfg[key][1]] : [cfg[key][0], clean];
      if (isFinite(raw) && Math.abs(raw - clean) > 1e-9) toast(label + ' 允许 ' + lo + '–' + hi + '，已调整为 ' + clean);
      if (pair[0] > pair[1]) toast(label + ' 下限大于上限，已自动交换');
      const patch = {};
      patch[key] = pair;
      quizSetCfg(mode, Object.assign({}, cfg, patch));
      renderApp();
    };
    for (let idx = 0; idx < 2; idx++) {
      const inp = el('input', 'quiz-cfg-num');
      inp.type = 'number';
      inp.min = String(lo);
      inp.max = String(hi);
      inp.step = String(step);
      inp.value = String(cfg[key][idx]);
      (function (i, node) {
        node.addEventListener('change', function () { commit(i, parseFloat(node.value)); });
      })(idx, inp);
      box.appendChild(inp);
      if (idx === 0) box.appendChild(el('span', 'quiz-cfg-sep muted', '–'));
    }
    row.appendChild(box);
    if (hint) row.appendChild(el('span', 'quiz-cfg-hint muted', hint));
    return row;
  }

  function quizCatRow(mode, cfg) {
    const row = el('div', 'quiz-cfg-row');
    row.appendChild(el('span', 'quiz-cfg-label', '章节范围'));
    const chips = el('div', 'chips quiz-cfg-chips');
    const all = el('button', 'chip' + (cfg.cats.length ? '' : ' active'), '全部');
    all.addEventListener('click', function () {
      quizSetCfg(mode, Object.assign({}, cfg, { cats: [] }));
      renderApp();
    });
    chips.appendChild(all);
    quizCatOptions(mode).forEach(function (k) {
      const on = cfg.cats.indexOf(k) !== -1;
      const b = el('button', 'chip' + (on ? ' active' : ''), quizCatLabel(k));
      b.addEventListener('click', function () {
        const cats = on ? cfg.cats.filter(function (x) { return x !== k; }) : cfg.cats.concat([k]);
        quizSetCfg(mode, Object.assign({}, cfg, { cats: cats }));
        renderApp();
      });
      chips.appendChild(b);
    });
    row.appendChild(chips);
    return row;
  }

  // ---------------- 自测视图：配置 → 出题 → 报告 ----------------
  function renderQuiz() {
    if (!quiz) { renderQuizConfig(); return; }
    if (quiz.idx >= quiz.qs.length) { renderQuizResult(); return; }
    renderQuizQuestion();
  }

  function renderQuizConfig() {
    const app = document.getElementById('app');
    const mode = quizMode();
    const entries = quizEntries(mode);
    const cfg = quizGetCfg(mode);
    const wrap = el('div', 'quiz-wrap');

    const top = el('div', 'learn-top');
    top.appendChild(el('span', 'muted', mode === 'wrong' ? '📝 错题自测' : '📝 知识卡自测'));
    if (mode === 'wrong') {
      const back = el('button', 'btn small', '← 返回错题本');
      back.addEventListener('click', function () { currentView = 'wrong'; renderApp(); });
      top.appendChild(back);
    }
    wrap.appendChild(top);

    const box = el('div', 'quiz-config');
    box.appendChild(el('p', 'muted', mode === 'wrong'
      ? '按范围抽题：给出题目，选出正确的解析。表现差的题按「提前复习」进入错题重做队列（不改记忆历史）。'
      : (subjKind() === 'qa'
        ? '按范围抽题：给出内容，选择它的名称。表现差的卡按「提前复习」进入重学队列（不改记忆历史）。'
        : '按范围抽题：给出公式，选择它的名称。表现差的卡按「提前复习」进入重学队列（不改记忆历史）。')));

    box.appendChild(quizNumRow('数量', 1, QUIZ_MAX_COUNT, 1, cfg.count, function (v) {
      quizSetCfg(mode, Object.assign({}, cfg, { count: v }));
      renderApp();
    }));
    box.appendChild(quizCatRow(mode, cfg));
    box.appendChild(quizRangeRow(mode, '难度范围', 'FSRS 记忆难度 D（1–10）；未进入排期的卡按默认 D=' + QUIZ_DEFAULT_DIFF + ' 计', QUIZ_DIFF_MIN, QUIZ_DIFF_MAX, 0.5, 'diff', cfg));
    box.appendChild(quizRangeRow(mode, '掌握度范围', '掌握度 %（0–100）；口径与「浏览」/「错题统计」一致', QUIZ_MASTERY_MIN, QUIZ_MASTERY_MAX, 1, 'mastery', cfg));
    wrap.appendChild(box);

    const pool = quizFilterEntries(entries, cfg);
    const take = Math.min(cfg.count, pool.length);
    const info = el('div', 'quiz-cfg-info');
    info.appendChild(el('span', 'quiz-pool-count', '命中 ' + pool.length + ' / 共 ' + entries.length + ' 题'));
    info.appendChild(el('span', 'muted', take
      ? '本次将出 ' + take + ' 题' + (pool.length < cfg.count ? '（候选不足，按实际数量出题）' : '')
      : '当前范围没有可用题目，请放宽章节 / 难度 / 掌握度范围'));
    wrap.appendChild(info);

    const acts = el('div', 'quiz-actions');
    const start = el('button', 'btn primary', take ? '开始自测（' + take + ' 题）' : '开始自测');
    start.setAttribute('data-action', 'qstart');
    if (!take) start.disabled = true;
    acts.appendChild(start);
    const reset = el('button', 'btn small', '恢复默认范围');
    reset.addEventListener('click', function () {
      quizSetCfg(mode, quizDefaultConfig());
      renderApp();
    });
    acts.appendChild(reset);
    wrap.appendChild(acts);

    app.appendChild(wrap);
  }

  function renderQuizQuestion() {
    const app = document.getElementById('app');
    const q = quiz.qs[quiz.idx];
    if (quiz.qTimerIdx !== quiz.idx) { quiz.qTimerIdx = quiz.idx; quiz.qAt = Date.now(); }
    const wrongMode = quiz.mode === 'wrong';
    const wrap = el('div', 'quiz-wrap');

    const top = el('div', 'learn-top');
    top.appendChild(el('span', 'muted', '第 ' + (quiz.idx + 1) + ' / ' + quiz.qs.length + ' 题'));
    top.appendChild(el('span', 'badge', '得分 ' + quiz.score));
    top.appendChild(el('span', 'muted', 'D=' + (q.diff || QUIZ_DEFAULT_DIFF).toFixed(1) + ' · 掌握 ' + Math.round(q.mastery || 0) + '%'));
    wrap.appendChild(top);

    const cardEl = el('div', 'card');
    const label = el('div', 'mini-label', wrongMode
      ? '这道题的正确答案是？'
      : (subjKind() === 'qa' ? '这个知识点叫什么？' : '这个公式叫什么？'));
    cardEl.appendChild(label);
    const fb = el('div', 'front');
    renderTex(fb, q.prompt);
    cardEl.appendChild(fb);
    wrap.appendChild(cardEl);

    const opts = el('div', 'quiz-opts' + (wrongMode ? ' quiz-opts-long' : ''));
    q.opts.forEach(function (o) {
      const b = texEl('button', 'btn quiz-opt' + (wrongMode ? ' quiz-opt-long' : ''), o.label);
      b.setAttribute('data-action', 'qanswer');
      b.setAttribute('data-arg', o.id);
      opts.appendChild(b);
    });
    wrap.appendChild(opts);

    app.appendChild(wrap);
  }

  function doQuizAnswer(oid) {
    const q = quiz.qs[quiz.idx];
    if (q.done) return; // 幂等：同一次作答只记一次
    q.done = true;
    const correct = oid === q.id;
    if (correct) quiz.score++;
    quiz.answers.push({
      id: q.id,
      cat: q.cat,
      ok: correct,
      mastery: q.mastery,
      predicted: q.predicted,
      ms: Math.max(0, Date.now() - (quiz.qAt || quiz.startedAt || Date.now())),
      label: q.label,
      picked: oid
    });
    // 高亮反馈
    const opts = document.querySelectorAll('.quiz-opt');
    opts.forEach(function (b) {
      b.disabled = true;
      if (b.getAttribute('data-arg') === q.id) b.classList.add('correct');
      else if (b.getAttribute('data-arg') === oid) b.classList.add('wrong');
    });
    const isLast = quiz.idx + 1 >= quiz.qs.length;
    const wrap = document.querySelector('.quiz-wrap');
    if (wrap) {
      const fb = el('div', 'quiz-fb' + (correct ? ' ok' : ' no'));
      fb.appendChild(el('span', null, correct ? '✅ 正确' : '❌ 错误'));
      if (!correct) {
        const ans = el('div', 'quiz-fb-ans');
        ans.appendChild(el('span', 'muted', quiz.mode === 'wrong' ? '正确答案：' : '正确名称：'));
        const tex = el('span', 'quiz-fb-tex');
        renderTex(tex, q.label);
        ans.appendChild(tex);
        fb.appendChild(ans);
      }
      wrap.appendChild(fb);
      const next = el('button', 'btn primary', isLast ? '查看报告' : '下一题');
      next.setAttribute('data-action', 'qnext');
      wrap.appendChild(next);
    }
    if (isLast) finishQuiz();
  }

  // 收尾（在最后一题作答时调用，只跑一次）：生成报告 → 表现差入重学队列 → 落盘记录。
  // 入队复用 t3 的提前复习接口 markCardDueNow：只把到期时间移到现在，不动记忆历史；
  // 新卡/已到期卡返回 false（它们本就按排期出现），计入「无需提前」。
  function finishQuiz() {
    if (!quiz || quiz.report) return;
    const ms = Math.max(0, Date.now() - (quiz.startedAt || Date.now()));
    const rep = quizBuildReport({ mode: quiz.mode, answers: quiz.answers, correct: quiz.score, ms: ms });
    const enq = quizEnqueue(rep.weakIds, function (id) {
      return (quiz.mode === 'wrong') ? (DB.wrongs || {})[id] : (DB.cards || {})[id];
    }, markCardDueNow);
    rep.queued = enq.queued;
    rep.already = enq.skipped;
    quiz.report = rep;
    quizSaveRecord(rep);
    if (typeof saveDB === 'function') saveDB();
  }

  // 落盘：DB.log.quiz（自测记录，新存储键）+ DB.log.counts[今日].q（每日自测题数）
  function quizSaveRecord(rep) {
    if (!DB.log || typeof DB.log !== 'object') DB.log = {};
    if (!Array.isArray(DB.log.quiz)) DB.log.quiz = [];
    DB.log.quiz.push({
      t: Date.now(),
      mode: rep.mode,
      total: rep.total,
      correct: rep.correct,
      pct: rep.pct,
      ms: rep.ms,
      msAvg: rep.msAvg,
      predicted: rep.predicted,
      gap: rep.gap,
      verdict: rep.verdict,
      byCat: rep.byCat.map(function (c) { return { c: c.cat, n: c.n, ok: c.ok }; }),
      weak: rep.weakIds,
      queued: rep.queued,
      diff: quiz.cfg ? quiz.cfg.diff : null,
      mastery: quiz.cfg ? quiz.cfg.mastery : null,
      cats: quiz.cfg ? quiz.cfg.cats : null
    });
    if (DB.log.quiz.length > QUIZ_MAX_RECORDS) DB.log.quiz.splice(0, DB.log.quiz.length - QUIZ_MAX_RECORDS);
    const t = todayStr();
    if (!DB.log.counts || typeof DB.log.counts !== 'object') DB.log.counts = {};
    if (!DB.log.counts[t] || typeof DB.log.counts[t] !== 'object') DB.log.counts[t] = {};
    DB.log.counts[t].q = (DB.log.counts[t].q || 0) + rep.total;
  }

  function renderQuizResult() {
    const app = document.getElementById('app');
    const rep = quiz.report || quizBuildReport({ mode: quiz.mode, answers: quiz.answers, correct: quiz.score, ms: 0 });
    const wrongMode = rep.mode === 'wrong';
    const wrap = el('div', 'quiz-wrap quiz-report');

    const top = el('div', 'learn-top');
    top.appendChild(el('span', 'muted', wrongMode ? '📝 错题自测 · 报告' : '📝 知识卡自测 · 报告'));
    wrap.appendChild(top);

    // —— 成绩 ——
    const head = el('div', 'stat-card quiz-report-head');
    head.appendChild(el('h2', null, '测验完成'));
    head.appendChild(el('p', 'big-score', rep.correct + ' / ' + rep.total));
    head.appendChild(el('p', 'muted', '正确率 ' + rep.pct + '% · ' + rep.verdict + '（表现差线 ' + QUIZ_WEAK_ACC + '%）'));
    wrap.appendChild(head);

    const kpi = function (label, val) {
      const c = el('div', 'stat-kpi');
      c.appendChild(el('strong', null, String(val)));
      c.appendChild(el('span', 'muted', label));
      return c;
    };
    const ov = el('div', 'stat-overview');
    ov.appendChild(kpi('正确率', rep.pct + '%'));
    ov.appendChild(kpi('用时', fmtStudyMs(rep.ms)));
    ov.appendChild(kpi('平均每题', rep.msAvg >= 60000 ? fmtStudyMs(rep.msAvg) : Math.round(rep.msAvg / 1000) + ' 秒'));
    ov.appendChild(kpi('预测掌握度', rep.predicted + '%'));
    ov.appendChild(kpi('差距', (rep.gap >= 0 ? '+' : '') + rep.gap + '%'));
    wrap.appendChild(ov);

    // —— 章节表现 ——
    wrap.appendChild(el('h3', null, '📚 章节表现'));
    const cb = el('div', 'stat-card');
    if (!rep.byCat.length) cb.appendChild(el('p', 'muted', '本次没有可统计的章节数据。'));
    rep.byCat.forEach(function (c) {
      const row = el('div', 'cat-bar-row');
      row.appendChild(el('span', 'cat-bar-name', c.cat === QUIZ_UNCATED ? c.cat : quizCatLabel(c.cat)));
      const bar = el('div', 'cat-bar');
      const fill = el('div', 'cat-bar-fill');
      fill.style.width = c.pct + '%';
      fill.style.background = masteryColor(c.pct);
      bar.appendChild(fill);
      row.appendChild(bar);
      row.appendChild(el('span', 'cat-bar-val', c.ok + '/' + c.n + ' · ' + c.pct + '%'));
      cb.appendChild(row);
    });
    wrap.appendChild(cb);

    // —— 与预测掌握度的差距 ——
    wrap.appendChild(el('h3', null, '🎯 与预测掌握度的差距'));
    const pb = el('div', 'stat-card');
    pb.appendChild(el('p', null, '预测掌握度（本组题平均）' + rep.predicted + '% · 实际正确率 ' + rep.pct + '% · 差距 ' + (rep.gap >= 0 ? '+' : '') + rep.gap + '%'));
    if (rep.predictedR !== null) {
      pb.appendChild(el('p', 'muted', '参考：算法预测可提取性 R（仅复习中的卡片）' + rep.predictedR + '%——R 是「今天回忆起来的概率」，与掌握度（记忆强度）口径不同。'));
    }
    pb.appendChild(el('p', 'muted', rep.gap >= 5
      ? '实际高于预测：这些内容比算法估计的更熟，可以适当拉长间隔。'
      : (rep.gap <= -5
        ? '实际低于预测：比算法估计的更生疏，表现差的题已提前转入复习。'
        : '实际与预测基本一致：算法对当前记忆强度的估计较准。')));
    pb.appendChild(el('p', 'muted', '用时 ' + fmtStudyMs(rep.ms) + '（平均每题 ' + Math.round(rep.msAvg / 1000) + ' 秒）。自测只做检查——不写评分日志、不改 FSRS 参数。'));
    wrap.appendChild(pb);

    // —— 表现差 → 重学队列 ——
    wrap.appendChild(el('h3', null, '🔁 表现差 → 重学队列'));
    const wb = el('div', 'stat-card');
    wb.appendChild(el('p', null, '表现差 ' + rep.weakIds.length + ' 题 · 已提前加入' + (wrongMode ? '重做' : '复习') + '队列 ' + rep.queued.length + ' 张'));
    if (rep.weakIds.length) {
      const list = el('div', 'quiz-weak-list');
      rep.weakIds.forEach(function (id) {
        list.appendChild(texEl('span', 'chip quiz-weak-item', quizItemLabel(rep.mode, id)));
      });
      wb.appendChild(list);
    }
    if (rep.already && rep.already.length) {
      wb.appendChild(el('p', 'muted', rep.already.length + ' 张是新卡或已到期，无需提前——会按原排期出现。'));
    }
    wb.appendChild(el('p', 'muted', wrongMode
      ? '「提前复习」只把错题的到期时间移到现在，不动记忆历史（稳定性/难度/遗忘次数/评分日志），重做后按原算法继续。'
      : '「提前复习」只把到期时间移到现在，不动记忆历史（稳定性/难度/遗忘次数/评分日志），复习后按原算法继续。'));
    wrap.appendChild(wb);

    // —— 操作 ——
    const acts = el('div', 'quiz-actions');
    const again = el('button', 'btn primary', '再来一组');
    again.setAttribute('data-action', 'qstart');
    acts.appendChild(again);
    const cfgBtn = el('button', 'btn', '调整配置');
    cfgBtn.addEventListener('click', function () { quiz = null; renderApp(); });
    acts.appendChild(cfgBtn);
    const backBtn = el('button', 'btn', wrongMode ? '返回错题本' : '返回学习');
    backBtn.addEventListener('click', function () {
      quiz = null;
      currentView = wrongMode ? 'wrong' : 'learn';
      renderApp();
    });
    acts.appendChild(backBtn);
    wrap.appendChild(acts);

    app.appendChild(wrap);
  }

  // 开始自测（既有 action 名 qstart 复用，actions.mjs 无需改动）：
  // 读当前模式的四维配置 → 纯函数出题 → 建立会话状态（记录起始时间，用于报告「用时」）
  function startQuiz() {
    const mode = quizMode();
    const cfg = quizGetCfg(mode);
    const all = quizEntries(mode);
    const built = quizBuildQueue(all, cfg, Math.random, all);
    if (!built.qs.length) {
      toast('没有符合条件的题目——请放宽章节 / 难度 / 掌握度范围');
      return;
    }
    const now = Date.now();
    quiz = {
      mode: mode,
      cfg: cfg,
      qs: built.qs,
      idx: 0,
      score: 0,
      answers: [],
      startedAt: now,
      qAt: now,
      qTimerIdx: 0,
      poolSize: built.poolSize,
      totalSize: built.totalSize,
      report: null
    };
    renderApp();
  }

  // ---------------- 设置视图 ----------------
