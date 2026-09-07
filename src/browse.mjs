    const app = document.getElementById('app');
    app.innerHTML = '';
    if (currentView === 'learn') renderLearn();
    else if (currentView === 'browse') renderBrowse();
    else if (currentView === 'quiz') renderQuiz();
    else if (currentView === 'statistics') renderStatistics();
    else if (currentView === 'wrong') renderWrongLearn();
    else if (currentView === 'wrongBrowse') renderWrongBrowse();
    else if (currentView === 'wrongStats') renderWrongStats();
    else if (currentView === 'principle') renderPrinciples();
    else if (currentView === 'settings') renderSettings();
    // 高亮一级 tab + 渲染二级导航
    document.querySelectorAll('.module-tab').forEach(function (b) {
      b.classList.toggle('active', b.getAttribute('data-arg') === currentModule);
    });
    renderSubnav();
    renderDock();
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

  // ---------------- 学习视图 · 交错练习 ----------------
  // 辨析聚类：把「真有关系」的卡（REL 中 tag=同类/对比/类比）聚成簇、簇内相邻出现，
  // 无关联的卡不硬凑、按章节轮转。纯函数在 src/interleave.mjs。
  function catOfId(id) {
    const f = DATA.find(function (x) { return x.id === id; });
    return f ? f.cat : '?';
  }
  function interleaveByIds(ids) { return interleaveRelated(ids, REL, catOfId); }
  // 到期复习：先按重要度(星)分层，层内再做辨析聚类，兼顾「重要优先」与「相关卡较近」
  function interleaveByImportance(ids) {
    const tiers = {};
    ids.forEach(function (id) {
      const star = (metaOf(id) && metaOf(id)[0]) || 0;
      (tiers[star] = tiers[star] || []).push(id);
    });
    return Object.keys(tiers)
      .sort(function (a, b) { return Number(b) - Number(a); })
      .reduce(function (acc, k) { return acc.concat(interleaveByIds(tiers[k])); }, []);
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
    // 到期复习：先按重要度/到期排序，再按重要度分层做辨析交错（相关卡较近、同章不连续）
    const dueOrdered = interleaveByImportance(due);
    // 学习阶段（时间步进到点）的卡：辨析交错（相关卡较近）
    const resumeLearning = interleaveByIds(all.filter(function (id) { return (card(id).state === 'learning' || card(id).state === 'relearning') && card(id).due <= now; }));
    // 已引入但仍未学的新卡：先乱序，再辨析交错（相关新卡较近出现）
    const newToStudy = interleaveByIds(shuffle(st.ids.filter(function (id) { return card(id).state === 'new'; })));
    // 队列 = 到期复习 + 续学 + 已引入新卡
    deck = dueOrdered.concat(resumeLearning, newToStudy);
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
    const tb = el('div', 'learn-top');
    const add = el('button', 'btn small', '➕ 录入知识点');
    add.addEventListener('click', openCardInput);
    tb.appendChild(add);
    app.appendChild(tb);
    app.appendChild(statsBar());

    const done = (deck.length === 0) || (frontier >= deck.length && pos >= frontier);
    if (done) {
      const wrap = el('div', 'center-card');
      wrap.appendChild(el('h2', null, '🎉 本轮已完成'));
      wrap.appendChild(illus('learn-done'));
      const overBudget = todayCostSec() > budgetSec();
      wrap.appendChild(el('p', 'muted', '全部知识点已纳入学习计划，暂无更多内容——按排期到期的卡片会自动进入复习队列。' + (overBudget ? '（今日已超出时间预算 ' + (todayCostMin() - budgetMin()) + ' 分钟，仍可继续）' : '')));
      app.appendChild(wrap);
      return;
    }
    renderLearnCard(deck[pos]);
  }

  // —— 手动录入知识点（自建卡）——
  function openCardInput() {
    const modal = el('div', 'map-modal');
    const backdrop = el('div', 'map-modal-backdrop');
    backdrop.addEventListener('click', closeCardInput);
    modal.appendChild(backdrop);

    const cardBox = el('div', 'map-modal-card wrong-input-card');
    cardBox.appendChild(el('h3', null, '➕ 手动录入知识点'));

    const title = el('input', 'wrong-input');
    title.type = 'text';
    title.placeholder = '标题 / 名称（必填）…';
    cardBox.appendChild(wrongField('标题', title));

    const catSel = el('select', 'wrong-input');
    Object.keys(CATS).forEach(function (k) {
      const opt = document.createElement('option');
      opt.value = k;
      opt.textContent = CATS[k];
      catSel.appendChild(opt);
    });
    cardBox.appendChild(wrongField('分类', catSel));

    const front = el('textarea', 'wrong-input');
    front.placeholder = '提示 / 正面（必填，可含公式 $..$）…';
    cardBox.appendChild(wrongField('提示（正面）', front));

    const back = el('textarea', 'wrong-input');
    back.placeholder = '答案（必填，可含公式 $..$）…';
    cardBox.appendChild(wrongField('答案', back));

    // 关联知识点（自建卡 REL，带标签，用于交错聚类）
    const relList = [];
    const relBox = el('div', 'wrong-field');
    relBox.appendChild(el('span', 'mini-label', '关联知识点（可选，用于交错聚类）'));
    const relTag = el('select', 'wrong-input');
    ['同类', '对比', '类比', '相关', '前置', '方法', '应用'].forEach(function (t) {
      const opt = document.createElement('option');
      opt.value = t;
      opt.textContent = t;
      relTag.appendChild(opt);
    });
    const relSearch = el('input', 'search');
    relSearch.type = 'search';
    relSearch.placeholder = '搜索要关联的卡片…';
    const relResults = el('div', 'wrong-results');
    const relListBox = el('div', 'wrong-results');
    relSearch.addEventListener('input', function () {
      relResults.innerHTML = '';
      const q = relSearch.value.trim().toLowerCase();
      if (!q) return;
      DATA.filter(function (f) {
        return (f.title + ' ' + f.front).toLowerCase().indexOf(q) !== -1;
      }).slice(0, 10).forEach(function (f) {
        const chip = el('button', 'chip', f.title);
        chip.addEventListener('click', function () {
          if (!relList.some(function (r) { return r.to === f.id; })) {
            relList.push({ to: f.id, tag: relTag.value });
            relListBox.appendChild(renderRelChip(f.id, relTag.value, relList));
          }
        });
        relResults.appendChild(chip);
      });
    });
    relBox.appendChild(relTag);
    relBox.appendChild(relSearch);
    relBox.appendChild(relResults);
    relBox.appendChild(relListBox);
    cardBox.appendChild(relBox);

    const btns = el('div', 'wrong-input-btns');
    const save = el('button', 'btn primary', '保存');
    save.addEventListener('click', function () {
      if (saveCustomCard(title.value, front.value, back.value, catSel.value, relList)) closeCardInput();
    });
    const cancel = el('button', 'btn', '取消');
    cancel.addEventListener('click', closeCardInput);
    btns.appendChild(save);
    btns.appendChild(cancel);
    cardBox.appendChild(btns);

    modal.appendChild(cardBox);
    document.body.appendChild(modal);
  }

  function closeCardInput() {
    const m = document.querySelector('.map-modal');
    if (m) m.remove();
  }

  function renderRelChip(id, tag, relList) {
    const f = DATA.find(function (x) { return x.id === id; });
    const chip = el('button', 'chip', '[' + tag + '] ' + (f ? f.title : id));
    chip.addEventListener('click', function () {
      const idx = relList.findIndex(function (r) { return r.to === id; });
      if (idx >= 0) relList.splice(idx, 1);
      chip.remove();
    });
    return chip;
  }

  // —— 编辑卡片（覆盖层：题目/答案/标签/例题/隐藏）——
  function renderExampleEditor(e) {
    const eb = el('div', 'example-editor');
    const q = el('textarea', 'wrong-input');
    q.placeholder = '题目';
    q.value = e.q || '';
    const a = el('textarea', 'wrong-input');
    a.placeholder = '解析';
    a.value = e.a || '';
    const a2 = el('textarea', 'wrong-input');
    a2.placeholder = '💡 巧解（可选）';
    a2.value = e.a2 || '';
    const src = el('input', 'wrong-input');
    src.type = 'text';
    src.placeholder = '来源（可选）';
    src.value = e.src || '';
    const del = el('button', 'btn small danger', '删除此例题');
    del.addEventListener('click', function () { eb.remove(); });
    eb.appendChild(el('div', 'mini-label', '题目')); eb.appendChild(q);
    eb.appendChild(el('div', 'mini-label', '解析')); eb.appendChild(a);
    eb.appendChild(el('div', 'mini-label', '巧解')); eb.appendChild(a2);
    eb.appendChild(el('div', 'mini-label', '来源')); eb.appendChild(src);
    eb.appendChild(del);
    return eb;
  }

  function collectExamples(exWrap) {
    const out = [];
    exWrap.querySelectorAll('.example-editor').forEach(function (eb) {
      const fields = eb.querySelectorAll('.wrong-input');
      const q = fields[0].value.trim(), a = fields[1].value.trim(), a2 = fields[2].value.trim(), src = fields[3].value.trim();
      if (q) out.push({ q: q, a: a, a2: a2, src: src });
    });
    return out;
  }

  function openCardEdit(id) {
    const f = DATA.find(function (x) { return x.id === id; });
    if (!f) return;
    const ov = (DB.cardOverrides && DB.cardOverrides[id]) || {};
    const meta = metaOf(id);
    const exs = examplesOf(id).map(function (e) { return { q: e.q || '', a: e.a || '', a2: e.a2 || '', src: e.src || '' }; });

    const modal = el('div', 'map-modal');
    const backdrop = el('div', 'map-modal-backdrop');
    backdrop.addEventListener('click', closeEditModal);
    modal.appendChild(backdrop);

    const box = el('div', 'map-modal-card wrong-input-card edit-card');
    box.appendChild(el('h3', null, '✏️ 编辑知识点'));

    const title = el('textarea', 'wrong-input');
    title.value = f.title;
    box.appendChild(wrongField('标题', title));

    const front = el('textarea', 'wrong-input');
    front.value = f.front;
    box.appendChild(wrongField('提示（正面）', front));

    const back = el('textarea', 'wrong-input');
    back.value = f.back;
    box.appendChild(wrongField('答案', back));

    const catSel = el('select', 'wrong-input');
    Object.keys(CATS).forEach(function (k) {
      const opt = document.createElement('option');
      opt.value = k;
      opt.textContent = CATS[k];
      if (k === f.cat) opt.selected = true;
      catSel.appendChild(opt);
    });
    box.appendChild(wrongField('分类', catSel));

    const starSel = el('select', 'wrong-input');
    [1, 2, 3, 4, 5].forEach(function (n) {
      const opt = document.createElement('option');
      opt.value = String(n);
      opt.textContent = '★'.repeat(n);
      if (n === (meta[0] || 3)) opt.selected = true;
      starSel.appendChild(opt);
    });
    box.appendChild(wrongField('重要度', starSel));

    const examType = el('input', 'wrong-input');
    examType.type = 'text';
    examType.value = meta[1] || '';
    box.appendChild(wrongField('常考题型', examType));

    const exWrap = el('div', 'wrong-field');
    exWrap.appendChild(el('span', 'mini-label', '例题（可增删改，题目留空则不保存该例题）'));
    exs.forEach(function (e) { exWrap.appendChild(renderExampleEditor(e)); });
    const addEx = el('button', 'btn small', '➕ 添加例题');
    addEx.addEventListener('click', function () { exWrap.insertBefore(renderExampleEditor({ q: '', a: '', a2: '', src: '' }), addEx); });
    exWrap.appendChild(addEx);
    box.appendChild(exWrap);

    const hiddenCb = el('input', 'chk');
    hiddenCb.type = 'checkbox';
    hiddenCb.checked = !!ov.hidden;
    const hiddenLabel = el('label', 'setting-check', '');
    hiddenLabel.appendChild(hiddenCb);
    hiddenLabel.appendChild(el('span', null, '隐藏此卡片（软删除，可恢复）'));
    box.appendChild(hiddenLabel);

    const btns = el('div', 'wrong-input-btns');
    const save = el('button', 'btn primary', '保存');
    save.addEventListener('click', function () {
      saveCardOverride(id, {
        title: title.value, front: front.value, back: back.value,
        cat: catSel.value, star: Number(starSel.value), examType: examType.value,
        examples: collectExamples(exWrap), hidden: hiddenCb.checked
      });
      closeEditModal();
    });
    const restore = el('button', 'btn', '恢复原卡');
    restore.addEventListener('click', function () {
      delete DB.cardOverrides[id];
      saveDB();
      refreshData();
      closeEditModal();
      renderApp();
      toast('已恢复原卡');
    });
    const cancel = el('button', 'btn', '取消');
    cancel.addEventListener('click', closeEditModal);
    btns.appendChild(save);
    btns.appendChild(restore);
    btns.appendChild(cancel);
    box.appendChild(btns);

    modal.appendChild(box);
    document.body.appendChild(modal);
  }

  function closeEditModal() {
    const m = document.querySelector('.map-modal');
    if (m) m.remove();
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
      const mark = el('button', 'btn small', '📕 标记为错题');
      mark.addEventListener('click', function () { markAsWrong(ex, id); });
      eb.appendChild(mark);
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
    const catBadge = el('span', 'badge cat-badge', CATS[f.cat]);
    if (bareRecallOn() && !reviewed) catBadge.classList.add('hidden');
    top.appendChild(catBadge);
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
    if (reviewed && lastRatingUndo) {
      const undo = el('button', 'btn small', '↩ 撤销评分');
      undo.setAttribute('data-action', 'undo');
      nav.appendChild(undo);
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
        b.setAttribute('aria-label', label + '：' + sub + '，下次约 ' + prev);
        b.appendChild(el('span', null, label));
        b.appendChild(el('small', 'rate-prev', prev));
        rating.appendChild(b);
      };
      mk('再来一次', '完全没印象', 0);
      mk('困难', '有印象但吃力', 1);
      mk('良好', '能想起，正常间隔', 2);
      mk('简单', '很轻松，拉长间隔', 3);
      const kbd = el('div', 'keyboard-hint muted', '1 再来一次 · 2 困难 · 3 良好 · 4 简单 · Space/Enter 显示答案');
      rating.appendChild(kbd);
      wrap.appendChild(rating);
    }

    app.appendChild(wrap);
  }

  function revealCurrent() {
    const app = document.getElementById('app');
    app.querySelector('.back').classList.remove('hidden');
    app.querySelector('.use-box').classList.remove('hidden');
    if (bareRecallOn()) {
      const cb = app.querySelector('.cat-badge');
      if (cb) cb.classList.remove('hidden');
    }
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
    // 撤销快照：卡片状态 + 今日统计计数，供评分后单步回退
    lastRatingUndo = {
      id: id,
      card: JSON.parse(JSON.stringify(card(id))),
      costBefore: todayCostSec(),
      dailyBefore: (DB.log && DB.log.daily && DB.log.daily[todayStr()]) || 0,
      detailBefore: (DB.log && DB.log.detail && DB.log.detail[todayStr()] && DB.log.detail[todayStr()][id]) || 0
    };
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
    frontier++;
    pendingAdvance = true;
    saveDB();
    saveSession();
    renderApp();
  }

  function undoLastRating() {
    if (!lastRatingUndo) return;
    const u = lastRatingUndo;
    lastRatingUndo = null;
    const id = u.id;
    DB.cards[id] = u.card;
    const t = todayStr();
    if (DB.log && DB.log.daily && typeof DB.log.daily[t] === 'number') {
      DB.log.daily[t] = Math.max(0, DB.log.daily[t] - 1);
    }
    if (DB.log && DB.log.detail && DB.log.detail[t] && typeof DB.log.detail[t][id] === 'number') {
      DB.log.detail[t][id] = Math.max(0, DB.log.detail[t][id] - 1);
    }
    if (!DB.log.cost) DB.log.cost = {};
    DB.log.cost[t] = Math.max(0, u.costBefore);
    if (frontier > 0) frontier--;
    pendingAdvance = false;
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

