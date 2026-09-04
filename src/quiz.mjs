  function renderBrowse() {
    const app = document.getElementById('app');

    const head = el('div', 'browse-head');
    const search = el('input', 'search');
    search.type = 'search';
    search.placeholder = subjKind() === 'qa' ? '搜索知识点（名称 / 内容）…' : '搜索公式（名称 / 内容）…';
    search.value = browseQuery;
    // 输入时只重绘列表，不重建整个视图（避免销毁搜索框导致输入/IME 被打断）
    search.addEventListener('input', function () {
      browseQuery = search.value;
      const old = app.querySelector('.browse-list');
      if (old) old.replaceWith(buildBrowseList());
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
    if (n === 0) list.appendChild(el('p', 'muted', subjKind() === 'qa' ? '没有匹配的知识点。' : '没有匹配的公式。'));
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
        clearTimeout(notesTimer);
        notesTimer = setTimeout(saveDB, 400);
      });
      notesBox.appendChild(notes);
      body.appendChild(notesBox);
      const extras = buildExtras(f.id, '');
      if (extras) body.appendChild(extras);
      body.appendChild(memoryBox(f.id));
      const reset = el('button', 'btn small danger', '重置此卡片进度');
      reset.setAttribute('data-action', 'resetcard');
      reset.setAttribute('data-arg', f.id);
      body.appendChild(reset);
      item.appendChild(body);
    }
    return item;
  }

  // ---------------- 自测视图 ----------------
  function renderQuiz() {
    const app = document.getElementById('app');
    if (!quiz) {
      const wrap = el('div', 'center-card');
      wrap.appendChild(el('h2', null, '📝 随机自测'));
      wrap.appendChild(el('p', 'muted', subjKind() === 'qa'
        ? '每次随机抽取 10 道题：给出内容，选择它的名称。用来检验你是否真正「认得」这些知识点。'
        : '每次随机抽取 10 道题：给出公式，选择它的名称。用来检验你是否真正「认得」公式。'));
      const b = el('button', 'btn primary', '开始自测');
      b.setAttribute('data-action', 'qstart');
      wrap.appendChild(b);
      app.appendChild(wrap);
      return;
    }
    if (quiz.idx >= quiz.qs.length) {
      renderQuizResult();
      return;
    }
    renderQuizQuestion();
  }

  function renderQuizQuestion() {
    const app = document.getElementById('app');
    const q = quiz.qs[quiz.idx];
    const wrap = el('div', 'quiz-wrap');

    const top = el('div', 'learn-top');
    top.appendChild(el('span', 'muted', '第 ' + (quiz.idx + 1) + ' / ' + quiz.qs.length + ' 题'));
    top.appendChild(el('span', 'badge', '得分 ' + quiz.score));
    wrap.appendChild(top);

    const cardEl = el('div', 'card');
    const label = el('div', 'mini-label', subjKind() === 'qa' ? '这个知识点叫什么？' : '这个公式叫什么？');
    cardEl.appendChild(label);
    const fb = el('div', 'front');
    renderTex(fb, q.card.back);
    cardEl.appendChild(fb);
    wrap.appendChild(cardEl);

    const opts = el('div', 'quiz-opts');
    q.opts.forEach(function (oid) {
      const of = DATA.find(function (x) { return x.id === oid; });
      const b = texEl('button', 'btn quiz-opt', of.title);
      b.setAttribute('data-action', 'qanswer');
      b.setAttribute('data-arg', oid);
      opts.appendChild(b);
    });
    wrap.appendChild(opts);

    app.appendChild(wrap);
  }

  function doQuizAnswer(oid) {
    const q = quiz.qs[quiz.idx];
    const correct = oid === q.card.id;
    if (correct) quiz.score++;
    // 高亮反馈
    const opts = document.querySelectorAll('.quiz-opt');
    opts.forEach(function (b) {
      b.disabled = true;
      if (b.getAttribute('data-arg') === q.card.id) b.classList.add('correct');
      else if (b.getAttribute('data-arg') === oid) b.classList.add('wrong');
    });
    const wrap = document.querySelector('.quiz-wrap');
    const fb = el('div', 'quiz-fb' + (correct ? ' ok' : ' no'));
    fb.textContent = correct ? '✅ 正确' : '❌ 错误';
    wrap.appendChild(fb);
    const next = el('button', 'btn primary', quiz.idx + 1 >= quiz.qs.length ? '查看结果' : '下一题');
    next.setAttribute('data-action', 'qnext');
    wrap.appendChild(next);
  }

  function renderQuizResult() {
    const app = document.getElementById('app');
    const wrap = el('div', 'center-card');
    wrap.appendChild(el('h2', null, '测验完成'));
    wrap.appendChild(el('p', 'big-score', quiz.score + ' / ' + quiz.qs.length));
    const again = el('button', 'btn primary', '再来一组');
    again.setAttribute('data-action', 'qstart');
    wrap.appendChild(again);
    app.appendChild(wrap);
  }

  function startQuiz() {
    const picked = shuffle(DATA.slice()).slice(0, Math.min(10, DATA.length));
    quiz = {
      qs: picked.map(function (p) {
        const others = shuffle(DATA.filter(function (f) { return f.id !== p.id; })).slice(0, 3);
        return { card: p, opts: shuffle([p].concat(others)).map(function (o) { return o.id; }) };
      }),
      idx: 0,
      score: 0
    };
    renderApp();
  }

  // ---------------- 设置视图 ----------------
