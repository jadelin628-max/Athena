    const app = document.getElementById('app');
    app.innerHTML = '';
    document.body.classList.toggle('view-map', currentView === 'map');
    if (currentView === 'learn') renderLearn();
    else if (currentView === 'browse') renderBrowse();
    else if (currentView === 'quiz') renderQuiz();
    else if (currentView === 'settings') renderSettings();
    else if (currentView === 'principle') renderPrinciples();
    else if (currentView === 'statistics') renderStatistics();
    else if (currentView === 'map') renderMap();
    // 高亮导航
    document.querySelectorAll('nav .nav-btn').forEach(function (b) {
      b.classList.toggle('active', b.getAttribute('data-arg') === currentView);
    });
    const vf = el('div', 'app-version');
    vf.textContent = 'Athena · 版本 v' + VERSION;
    app.appendChild(vf);
    updateNavBadge();
    updateBrand();
    updateCountdown();
    snapshotMastery();
  }

  function statsBar() {
    const s = stats();
    const incNew = incompleteNewCount();
    const bar = el('div', 'stats-bar');
    bar.appendChild(el('span', 'stat', '今天已学习 ' + todayReviewed() + ' 张'));
    bar.appendChild(el('span', 'stat', '⏱ 今日 ' + todayCostMin() + ' / 预算 ' + budgetMin() + ' 分' + (todayCostSec() > budgetSec() ? '（已超出，可继续）' : '')));
    bar.appendChild(el('span', 'stat', '待复习 ' + s.due + ' 张'));
    bar.appendChild(el('span', 'stat', '未学完新卡 ' + incNew + ' 张'));
    bar.appendChild(el('span', 'stat', '平均掌握 ' + s.avg + '%'));
    bar.appendChild(el('span', 'stat', '总计 ' + s.total));
    return bar;
  }

  // ---------------- 学习视图 ----------------
  function interleave(ids) {
    const byCat = {};
    ids.forEach(function (id) {
      const f = DATA.find(function (x) { return x.id === id; });
      const c = f ? f.cat : '?';
      (byCat[c] = byCat[c] || []).push(id);
    });
    const groups = Object.keys(byCat).map(function (k) { return shuffle(byCat[k]); });
    const out = [];
    let added = true;
    while (added) {
      added = false;
      for (let i = 0; i < groups.length; i++) {
        if (groups[i].length) { out.push(groups[i].shift()); added = true; }
      }
    }
    return out;
  }

  // 新卡摄入：一次性引入全部未学新卡（时间预算为软上限，超出仅提示、不封顶引入）
  function introState() {
    if (!DB.log) DB.log = {};
    if (!DB.log.newIntro || !Array.isArray(DB.log.newIntro.ids)) DB.log.newIntro = { ids: [] };
    return DB.log.newIntro;
  }
  // 未完全学习的新卡：处于学习阶段、尚未毕业（曾经点过「忘记」）
  function incompleteNewCount() {
    return DATA.filter(function (f) { const c = card(f.id); return (c.state === 'learning' || c.state === 'relearning') && (c.grad | 0) === 0; }).length;
  }

  function buildSession() {
    const now = Date.now();
    const all = DATA.map(function (f) { return f.id; });
    const st = introState();
    // 引入全部「未引入的新卡」（时间预算为软上限：超出仅提示，不封顶新卡引入）
    const pending = shuffle(all.filter(function (id) { return card(id).state === 'new' && st.ids.indexOf(id) === -1; }));
    if (pending.length) { st.ids = st.ids.concat(pending); saveDB(); }
    // 到期复习（review 且到期）
    const due = all.filter(function (id) {
      const c = card(id);
      return c.state === 'review' && c.due <= now;
    });
    due.sort(function (a, b) {
      const sa = metaOf(a)[0] || 0, sb = metaOf(b)[0] || 0;
      if (sb !== sa) return sb - sa;
      return card(a).due - card(b).due;
    });
    // 学习阶段（时间步进到点）的卡：新卡被遗忘 / 复习卡被遗忘，都在等计时器，到点才回来
    const resumeLearning = interleave(all.filter(function (id) { return (card(id).state === 'learning' || card(id).state === 'relearning') && card(id).due <= now; }));
    // 已引入但仍未学的新卡（完全随机序）
    const newToStudy = shuffle(st.ids.filter(function (id) { return card(id).state === 'new'; }));
    // 队列 = 到期复习 + 续学 + 已引入新卡
    deck = due.concat(resumeLearning, newToStudy);
    pos = 0;
    frontier = 0;
    pendingAdvance = false;
    seenAgain = {};
    saveSession();
  }

  function surfaceDue() {
    const now = Date.now();
    const isDue = function (id) {
      const c = card(id);
      return (c.state === 'review' || c.state === 'learning' || c.state === 'relearning') && c.due <= now;
    };
    // 记住当前 pos 指向的卡，重组后尽量保持/正确回退
    const curId = (pos >= 0 && pos < deck.length) ? deck[pos] : null;
    const inDeck = {};
    deck.forEach(function (id) { inDeck[id] = true; });
    // deck 外部的到期卡（昨天学完今天到期、但不在当前队列）——吸收进队首
    const fresh = [];
    DATA.forEach(function (f) {
      if (!inDeck[f.id] && isDue(f.id)) fresh.push(f.id);
    });
    fresh.sort(function (a, b) {
      const sa = metaOf(a)[0] || 0, sb = metaOf(b)[0] || 0;
      if (sb !== sa) return sb - sa;
      return card(a).due - card(b).due;
    });
    // 拆分 head（已学）/tail（待学），把到期卡统一归到「待学区」最前
    const head = deck.slice(0, frontier);
    const tail = deck.slice(frontier);
    // 学习/重学卡评分后会被推回队尾等待重现，同时留在「已学区」供确认展示；
    // 二者指向同一张卡，到期时必须去重（队尾副本优先），否则 front 会出现重复卡、打乱队列。
    const surfaced = {};              // 已确定要进入 front 的卡（去重键）
    const dueTail = [];
    tail.forEach(function (id) {
      if (isDue(id) && !surfaced[id]) { surfaced[id] = true; dueTail.push(id); }
    });
    const dueHead = [];
    head.forEach(function (id) {
      if (isDue(id) && !surfaced[id]) { surfaced[id] = true; dueHead.push(id); }
    });
    const keepHead = head.filter(function (id) { return !surfaced[id]; });
    const restTail = tail.filter(function (id) { return !surfaced[id]; });
    const front = fresh.concat(dueHead, dueTail);
    front.sort(function (a, b) { return card(a).due - card(b).due; });
    deck = keepHead.concat(front, restTail);
    frontier = keepHead.length;
    // 恢复 pos：原卡仍在「已学区」（未到期）则保持回看；否则跳到第一张待学卡
    if (curId != null) {
      const idx = deck.indexOf(curId);
      pos = (idx >= 0 && idx < frontier) ? idx : frontier;
    } else {
      pos = frontier;
    }
    if (pos < 0) pos = 0;
    if (pos > deck.length) pos = deck.length;
  }
  // 自适应步进：学习阶段的卡若等待过久（超过阈值），把它从队列靠后拉近，尽早重现
  function renderLearn() {
    const app = document.getElementById('app');
    surfaceDue();
    app.appendChild(statsBar());

    const done = (deck.length === 0) || (frontier >= deck.length && pos >= frontier);
    if (done) {
      const wrap = el('div', 'center-card');
      wrap.appendChild(el('h2', null, '🎉 本轮已完成'));
      const overBudget = todayCostSec() > budgetSec();
      wrap.appendChild(el('p', 'muted', '全部知识点已纳入学习计划，暂无更多内容——按排期到期的卡片会自动进入复习队列。' + (overBudget ? '（今日已超出时间预算 ' + (todayCostMin() - budgetMin()) + ' 分钟，仍可继续）' : '')));
      app.appendChild(wrap);
      return;
    }
    renderLearnCard(deck[pos]);
  }

  // 例题 + 相关知识点（答案区附加内容，hiddenClass 为空字符串时可见）
  function buildExtras(id, hiddenClass) {
    const exs = examplesOf(id);
    const rels = relOf(id);
    if (exs.length === 0 && rels.length === 0) return null;
    const box = el('div', 'extras' + hiddenClass);
    exs.forEach(function (ex, i) {
      const eb = el('div', 'example-box');
      const label = exs.length > 1 ? ('📝 ' + (ex.src ? '真题' : '例题') + ' ' + (i + 1)) : (ex.src ? '📝 真题' : '📝 经典例题');
      eb.appendChild(el('div', 'example-label', label));
      const q = el('div', 'example-q');
      renderTex(q, ex.q);
      eb.appendChild(q);
      eb.appendChild(el('div', 'mini-label', '解析'));
      const a = el('div', 'example-a');
      renderTex(a, ex.a);
      eb.appendChild(a);
      if (ex.a2) {
        eb.appendChild(el('div', 'mini-label', '💡 巧解'));
        const a2 = el('div', 'example-a');
        renderTex(a2, ex.a2);
        eb.appendChild(a2);
      }
      if (ex.src) eb.appendChild(el('div', 'example-src', '📚 来源：' + ex.src));
      box.appendChild(eb);
    });
    if (rels.length) {
      const rb = el('div', 'rel-box');
      rb.appendChild(el('div', 'mini-label', '相关知识点'));
      rels.forEach(function (r) {
        const tf = DATA.find(function (x) { return x.id === r.to; });
        if (!tf) return;
        const chip = texEl('button', 'chip rel-chip', (r.tag ? '[' + r.tag + '] ' : '') + tf.title);
        chip.setAttribute('data-action', 'jump');
        chip.setAttribute('data-arg', tf.id);
        rb.appendChild(chip);
      });
      box.appendChild(rb);
    }
    return box;
  }

  function jumpToCard(id) {
    currentView = 'browse';
    browseCat = 'all';
    browseQuery = '';
    browseMastery = 'all'; browseStars = 'all';
    browseExpanded = {};
    browseExpanded[id] = true;
    renderApp();
    setTimeout(function () {
      const node = document.querySelector('[data-card="' + id + '"]');
      if (node) node.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 60);
  }

  function renderLearnCard(id) {
    const app = document.getElementById('app');
    const f = DATA.find(function (x) { return x.id === id; });
    const reviewed = pos < frontier;
    const wrap = el('div', 'learn-wrap');

    const top = el('div', 'learn-top');
    top.appendChild(el('span', 'badge', CATS[f.cat]));
    wrap.appendChild(top);

    const m = mastery(id);
    const st = card(id);
    const meta = el('div', 'learn-meta');
    meta.appendChild(el('span', 'mastery-badge', m.label + ' ' + m.pct + '%'));
    meta.appendChild(el('span', 'star-badge', starText(metaOf(id)[0])));
    const bar = el('div', 'mastery-bar');
    const fill = el('div', 'mastery-fill');
    fill.style.width = m.pct + '%';
    bar.appendChild(fill);
    meta.appendChild(bar);
    meta.appendChild(el('span', 'muted',
      st.state === 'new' ? '尚未学习' : ((st.state === 'learning' || st.state === 'relearning') ? '学习中' : ('间隔 ' + st.ivl + ' 天' + (st.lapses > 0 ? ' · 遗忘 ' + st.lapses + ' 次' : '') + ' · ' + memoryStrengthText(st)))));
    wrap.appendChild(meta);

    const cardEl = el('div', 'card');
    const frontBox = el('div', 'front');
    if (!reviewed) { frontBox.setAttribute('data-action', 'reveal'); frontBox.setAttribute('title', '点击显示答案'); }
    renderTex(frontBox, f.front);
    cardEl.appendChild(frontBox);

    const backBox = el('div', 'back' + (reviewed ? '' : ' hidden'));
    renderTex(backBox, f.back);
    cardEl.appendChild(backBox);

    const useBox = el('div', 'use-box' + (reviewed ? '' : ' hidden'));
    useBox.appendChild(el('span', 'use-label', subjKind() === 'qa' ? '📌 考查方式：' : '📌 常考题型：'));
    useBox.appendChild(el('span', null, metaOf(id)[1]));
    cardEl.appendChild(useBox);

    const mn = mnemOf(id);
    if (mn) {
      const mb = el('div', 'mnem-box' + (reviewed ? '' : ' hidden'));
      mb.appendChild(el('span', 'mnem-label', '🗝️ 助记：'));
      mb.appendChild(texEl('span', null, mn));
      cardEl.appendChild(mb);
    }

    const pf = pitfallOf(id);
    if (pf) {
      const pfb = el('div', 'pitfall-box' + (reviewed ? '' : ' hidden'));
      pfb.appendChild(el('span', 'pitfall-label', '⚠️ 常见陷阱：'));
      pfb.appendChild(texEl('span', null, pf));
      cardEl.appendChild(pfb);
    }

    const hint = el('div', 'hint muted' + (reviewed ? '' : ' hidden'),
      reviewed
        ? (pendingAdvance ? '✅ ' + masteryDeltaText() + '，' + scheduleText(st) + '，点击「下一张」继续。' : '这是你已复习过的卡片（答案已展示），点「回到当前卡片」继续。')
        : '回想后再点击「显示答案」核对，主动回忆效果最佳。');
    cardEl.appendChild(hint);

    // 笔记模块置于真题/相关知识点模块之前
    const notesBox = el('div', 'notes-box' + (reviewed ? '' : ' hidden'));
    notesBox.appendChild(el('div', 'mini-label', '📝 我的笔记（感想 / 补充 / 易错点）'));
    const notes = el('textarea', 'card-notes');
    notes.placeholder = '在这里记录你的理解、补充或易错点…';
    notes.value = st.notes || '';
    let notesTimer;
    notes.addEventListener('input', function () {
      st.notes = notes.value;
      clearTimeout(notesTimer);
      notesTimer = setTimeout(saveDB, 400);
    });
    notesBox.appendChild(notes);
    cardEl.appendChild(notesBox);

    const extras = buildExtras(id, reviewed ? '' : ' hidden');
    if (extras) cardEl.appendChild(extras);

    cardEl.appendChild(memoryBox(id, reviewed ? '' : ' hidden'));

    wrap.appendChild(cardEl);

    const nav = el('div', 'learn-nav');
    if (pos > 0) {
      const back = el('button', 'btn small', '← 上一张');
      back.setAttribute('data-action', 'goback');
      nav.appendChild(back);
    }
    if (reviewed) {
      const go = el('button', 'btn small primary', pendingAdvance ? '下一张 ▶' : '回到当前卡片 →');
      go.setAttribute('data-action', 'gofront');
      nav.appendChild(go);
    }
    wrap.appendChild(nav);

    if (!reviewed) {
      const controls = el('div', 'controls');
      const reveal = el('button', 'btn primary', '显示答案');
      reveal.setAttribute('data-action', 'reveal');
      controls.appendChild(reveal);
      wrap.appendChild(controls);

      const rating = el('div', 'rating hidden');
      const mk = function (label, sub, r) {
        const prev = fmtPreview(previewNextTime(id, r)); // 预测：选此档后距下次复习的时长
        const b = el('button', 'btn rate r' + r, '');
        b.setAttribute('data-action', 'rate');
        b.setAttribute('data-arg', String(r));
        b.setAttribute('title', sub + ' · 下次约 ' + prev);
        b.appendChild(el('span', null, label));
        b.appendChild(el('small', 'rate-prev', prev));
        rating.appendChild(b);
      };
      mk('忘记', '完全没印象，再学一次', 0);
      mk('困难', '有印象但吃力', 1);
      mk('良好', '能想起，正常间隔', 2);
      mk('简单', '很轻松，拉长间隔', 3);
      wrap.appendChild(rating);
    }

    app.appendChild(wrap);
  }

  function revealCurrent() {
    const app = document.getElementById('app');
    app.querySelector('.back').classList.remove('hidden');
    app.querySelector('.use-box').classList.remove('hidden');
    const ex = app.querySelector('.extras');
    if (ex) ex.classList.remove('hidden');
    app.querySelector('.hint').classList.remove('hidden');
    const nb = app.querySelector('.notes-box');
    if (nb) nb.classList.remove('hidden');
    const pb = app.querySelector('.pitfall-box');
    if (pb) pb.classList.remove('hidden');
    const mb = app.querySelector('.mnem-box');
    if (mb) mb.classList.remove('hidden');
    const mem = app.querySelector('.memory-box');
    if (mem) mem.classList.remove('hidden');
    app.querySelector('.controls').classList.add('hidden');
    app.querySelector('.rating').classList.remove('hidden');
  }

  function doRate(r) {
    if (frontier >= deck.length) return;
    const id = deck[frontier];
    const beforeM = mastery(id).pct; // 评分前掌握度（存储强度到目标比例）
    applyRating(id, r);
    const afterM = mastery(id).pct;
    lastMasteryDelta = afterM - beforeM;
    markReviewed(id);
    addCost(r);
    // 记录掌握度历史快照（每次评分后的掌握度，供「掌握度趋势图」）
    {
      const c = card(id);
      if (!Array.isArray(c.hist)) c.hist = [];
      c.hist.push({ t: Date.now(), m: afterM, ivl: c.ivl || 0 });
      if (c.hist.length > 60) c.hist = c.hist.slice(-60);
      c.lastR = Date.now();
      c.ivlR = c.ivl || 0;
    }
    // 时间步进：学习中的卡按计时器到点重现（推回队尾，由 surfaceDue 在其 due 到达时提前）
    if (card(id).state === 'learning' || card(id).state === 'relearning') {
      deck.push(id);
    }
    frontier++;
    pendingAdvance = true;
    saveDB();
    saveSession();
    renderApp();
  }

  // ---------------- 浏览视图 ----------------
  let browseCat = 'all';
  let browseQuery = '';
  let browseExpanded = {};
  let browseMastery = 'all';
  let browseStars = 'all';

