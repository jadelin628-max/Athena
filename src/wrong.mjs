  // ---------------- 错题模块 ----------------
  // 错题卡独立于知识卡：动手重做 → 看解析 → 按解题结果评分（不会/思路错/算错/会做对）。
  // 调度复用 FSRS 内核，仅把学习步进改为「按天」；毕业 = 稳定度达目标（与知识卡一致，无「退出」）。

  const WRONG_STEP_MS = [DAY];      // 错题学习步：1 天（问题不适合分钟内重现）
  const WRONG_RELEARN_MS = [DAY];   // 错题重学步：1 天
  const WRONG_COST_S = 240;         // 错题单题约 4 分钟（计入每日时间预算）
  // 难题更疏：间隔乘 1.4，减少高频重现
  function wrongInterval(c) {
    const ivl = Math.max(1, Math.round(fsrsInterval(c.stab)));
    return (c.kind === '难题') ? Math.max(1, Math.round(ivl * 1.4)) : ivl;
  }

  function wrongCard(wid) { return (DB && DB.wrongs && DB.wrongs[wid]) || null; }

  // 评分 → FSRS 档位（与知识卡四档一一对应）：0 不会=Again, 1 思路错=Hard, 2 算错=Good, 3 会做对=Easy
  function applyRatingToWrongCard(c, rating) {
    const now = Date.now();
    const G = rating + 1;
    if (typeof c.step !== 'number') c.step = 0;
    if (c.state === 'new' || c.state === 'learning' || c.state === 'relearning') {
      const isRelearn = (c.state === 'relearning');
      const steps = isRelearn ? WRONG_RELEARN_MS : WRONG_STEP_MS;
      const lastStep = 0;
      if (c.state === 'new' || !c.fsrsInit) {
        c.diff = fsrsInitDifficulty(G);
        c.stab = fsrsInitStability(G);
        c.fsrsInit = 1;
      } else {
        c.stab = fsrsShortTermStability(c.stab, G);
      }
      if (rating <= 1) { // 不会 / 思路错：次日重现，不毕业
        c.step = 0; c.grad = 0; c.reps = 0; c.ivl = 0;
        c.state = isRelearn ? 'relearning' : 'learning';
        c.due = dayStart(now) + DAY;
        return;
      }
      if (rating === 2) { // 算错：再学一步，次日重现后毕业
        c.step = c.step + 1;
        if (c.step > lastStep) {
          wrongGraduate(c);
        } else {
          c.state = isRelearn ? 'relearning' : 'learning';
          c.due = dayStart(now) + DAY;
        }
        return;
      }
      wrongGraduate(c); // 会做对：直接毕业
      return;
    }
    // —— 复习阶段 ——
    const daysSince = Math.max(0, (now - (c.lastR || c.due)) / DAY);
    const R = fsrsRetention(daysSince, c.stab);
    if (rating === 0) { // 不会：遗忘
      c.step = 0; c.state = 'relearning'; c.grad = 0; c.reps = 0; c.ivl = 0;
      c.lapses++;
      c.diff = fsrsDifficulty(c.diff, 1);
      c.stab = fsrsLapseStability(c.diff, c.stab, R);
      c.due = dayStart(now) + DAY;
      return;
    }
    if (rating === 1) { // 思路错：Hard
      c.diff = fsrsDifficulty(c.diff, 2);
      c.stab = fsrsSuccessStability(c.diff, c.stab, R, 2);
      c.ivl = wrongInterval(c);
      c.reps++; c.state = 'review'; c.due = dayStart(now) + c.ivl * DAY;
      return;
    }
    if (rating === 2) { // 算错：Good
      c.diff = fsrsDifficulty(c.diff, 3);
      c.stab = fsrsSuccessStability(c.diff, c.stab, R, 3);
      c.ivl = wrongInterval(c);
      c.reps++; c.state = 'review'; c.due = dayStart(now) + c.ivl * DAY;
      return;
    }
    // 会做对：Easy
    c.diff = fsrsDifficulty(c.diff, 4);
    c.stab = fsrsSuccessStability(c.diff, c.stab, R, 4);
    c.ivl = Math.max(1, Math.round(fsrsInterval(c.stab)));
    c.reps++; c.state = 'review'; c.due = dayStart(now) + c.ivl * DAY;
  }

  function wrongGraduate(c) {
    c.grad = 1; c.reps = 1; c.state = 'review';
    c.stab = Math.max(FSRS_S_MIN, c.stab);
    c.ivl = wrongInterval(c);
    c.due = dayStart(Date.now()) + c.ivl * DAY;
  }

  function isWrongGraduated(c) { return c.state === 'review' && (typeof c.stab === 'number' ? c.stab : 0) >= targetS(); }

  // 错题掌握度：稳定度到目标的比例（与知识卡一致，目标随选定日期变化）
  function wrongMastery(wid) {
    const c = wrongCard(wid);
    let score = 0;
    if (c && c.state !== 'new' && typeof c.stab === 'number' && c.stab > 0) {
      const sN = targetS();
      score = Math.round(100 * Math.max(0, Math.min(1, Math.log(1 + c.stab) / Math.log(1 + sN))));
    }
    let label;
    if (!c || c.state === 'new') label = '未做';
    else if (score < 25) label = '薄弱';
    else if (score < 65) label = '巩固中';
    else if (score < 85) label = '较稳';
    else label = '已稳固';
    return { pct: score, label: label };
  }

  function wrongNextText(w) {
    if (w.state === 'new') return '待做';
    if (w.state === 'learning' || w.state === 'relearning') return '学习中 · 次日重现';
    return '下次 ' + fmtDayMs(w.due) + '（间隔 ' + w.ivl + ' 天）' + (isWrongGraduated(w) ? ' · ✔已稳固' : '');
  }

  // 错题失败（不会/思路错）→ 关联知识卡降级，提前重现补漏
  function demoteLinked(linkedIds) {
    if (!linkedIds || !linkedIds.length) return;
    const now = Date.now();
    linkedIds.forEach(function (id) {
      const c = card(id);
      if (!c || c.state === 'new') return;
      const R = fsrsRetention(Math.max(0, (now - (c.lastR || c.due)) / DAY), c.stab);
      c.diff = fsrsDifficulty(c.diff, 1);
      c.stab = fsrsLapseStability(c.diff, c.stab, R);
      c.lapses = (c.lapses || 0) + 1;
      c.step = 0;
      if (c.state === 'review') { c.state = 'relearning'; c.grad = 0; c.reps = 0; c.ivl = 0; }
      c.due = dayStart(now) + DAY;
    });
  }

  // —— 错题视图状态 ——
  let wrongDeck = [];
  let wrongFrontier = 0;
  let wrongExpanded = {};
  let wrongJumpId = null;

  function buildWrongSession() {
    const now = Date.now();
    const ids = Object.keys(DB.wrongs || {});
    const due = ids.filter(function (wid) {
      const c = DB.wrongs[wid];
      return (c.state === 'review' || c.state === 'learning' || c.state === 'relearning') && c.due <= now;
    });
    due.sort(function (a, b) { return DB.wrongs[a].due - DB.wrongs[b].due; });
    const fresh = shuffle(ids.filter(function (wid) { return DB.wrongs[wid].state === 'new'; }));
    wrongDeck = due.concat(fresh);
    wrongFrontier = 0;
  }

  function renderWrongLearn() {
    const app = document.getElementById('app');
    const total = Object.keys(DB.wrongs || {}).length;
    const tb = el('div', 'learn-top');
    tb.appendChild(el('span', 'muted', '共 ' + total + ' 道'));
    const add = el('button', 'btn small primary', '➕ 手动录入');
    add.addEventListener('click', openWrongInput);
    tb.appendChild(add);
    app.appendChild(tb);
    if (total === 0) {
      const wrap = el('div', 'center-card');
      wrap.appendChild(el('h2', null, '📕 错题本'));
      wrap.appendChild(el('p', 'muted', '还没有错题。在「浏览」页的真题处点「标记为错题」，即可把做错的题收进来，按记忆算法重现、重做、补漏。'));
      app.appendChild(wrap);
      return;
    }
    if (!wrongDeck.length) buildWrongSession();
    if (wrongFrontier >= wrongDeck.length) {
      const wrap = el('div', 'center-card');
      wrap.appendChild(el('h2', null, '🎉 错题本轮完成'));
      wrap.appendChild(el('p', 'muted', '本轮错题已做完——按排期到期的错题会自动重现。'));
      app.appendChild(wrap);
      return;
    }
    renderWrongCard(wrongDeck[wrongFrontier]);
  }

  function renderWrongCard(wid) {
    const app = document.getElementById('app');
    const w = DB.wrongs[wid];
    const wrap = el('div', 'learn-wrap');

    const top = el('div', 'learn-top');
    top.appendChild(el('span', 'badge', w.kind === '难题' ? '⭐ 难题' : '📕 错题'));
    wrap.appendChild(top);

    const m = wrongMastery(wid);
    const meta = el('div', 'learn-meta');
    meta.appendChild(el('span', 'mastery-badge', m.label + ' ' + m.pct + '%'));
    const bar = el('div', 'mastery-bar');
    const fill = el('div', 'mastery-fill');
    fill.style.width = m.pct + '%';
    bar.appendChild(fill);
    meta.appendChild(bar);
    meta.appendChild(el('span', 'muted', wrongNextText(w)));
    wrap.appendChild(meta);

    const cardEl = el('div', 'card');
    const qBox = el('div', 'front');
    renderTex(qBox, w.q);
    cardEl.appendChild(qBox);

    const aBox = el('div', 'back hidden');
    renderTex(aBox, w.a);
    cardEl.appendChild(aBox);

    if (w.a2) {
      const a2b = el('div', 'wrong-a2 hidden');
      a2b.appendChild(el('div', 'mini-label', '💡 巧解'));
      const a2c = el('div', 'example-a');
      renderTex(a2c, w.a2);
      a2b.appendChild(a2c);
      cardEl.appendChild(a2b);
    }
    if (w.src) {
      cardEl.appendChild(el('div', 'wrong-src hidden', '📚 来源：' + w.src));
    }
    if (w.linked && w.linked.length) {
      const rb = el('div', 'rel-box');
      rb.appendChild(el('div', 'mini-label', '关联知识点'));
      w.linked.forEach(function (id) {
        const f = DATA.find(function (x) { return x.id === id; });
        if (!f) return;
        const chip = texEl('button', 'chip rel-chip', f.title);
        chip.setAttribute('data-action', 'jump');
        chip.setAttribute('data-arg', id);
        rb.appendChild(chip);
      });
      cardEl.appendChild(rb);
    }
    wrap.appendChild(cardEl);

    const controls = el('div', 'controls');
    const reveal = el('button', 'btn primary', '显示解析');
    reveal.setAttribute('data-action', 'wreveal');
    controls.appendChild(reveal);
    wrap.appendChild(controls);

    const rating = el('div', 'rating hidden');
    const mk = function (label, r) {
      const b = el('button', 'btn rate r' + r, label);
      b.setAttribute('data-action', 'wrate');
      b.setAttribute('data-arg', String(r));
      rating.appendChild(b);
    };
    mk('不会', 0);
    mk('思路错', 1);
    mk('算错', 2);
    mk('会做对', 3);
    wrap.appendChild(rating);

    app.appendChild(wrap);
  }

  function revealWrong() {
    const app = document.getElementById('app');
    app.querySelector('.back').classList.remove('hidden');
    const a2 = app.querySelector('.wrong-a2');
    if (a2) a2.classList.remove('hidden');
    const src = app.querySelector('.wrong-src');
    if (src) src.classList.remove('hidden');
    app.querySelector('.controls').classList.add('hidden');
    app.querySelector('.rating').classList.remove('hidden');
  }

  function doWrongRate(r) {
    if (!wrongDeck.length || wrongFrontier >= wrongDeck.length) return;
    const wid = wrongDeck[wrongFrontier];
    const w = DB.wrongs[wid];
    applyRatingToWrongCard(w, r);
    if (r <= 1) demoteLinked(w.linked); // 不会/思路错 → 关联知识卡降级
    w.lastSolveMs = Date.now();
    if (!Array.isArray(w.hist)) w.hist = [];
    w.hist.push({ t: Date.now(), m: wrongMastery(wid).pct });
    if (w.hist.length > 60) w.hist = w.hist.slice(-60);
    w.lastR = Date.now();
    w.ivlR = w.ivl || 0;
    const t = todayStr();
    if (!DB.log.cost) DB.log.cost = {};
    DB.log.cost[t] = (DB.log.cost[t] || 0) + WRONG_COST_S;
    wrongFrontier++;
    saveDB();
    renderApp();
  }

  // 把一道真题/例题标记为错题（linked 为关联知识点 id）
  function markAsWrong(ex, linkedId) {
    if (!ex || !ex.q) return;
    // 查重：已有相同题目的错题则跳转，不重复添加
    const existing = Object.keys(DB.wrongs || {}).find(function (wid) {
      return (DB.wrongs[wid].q || '').trim() === (ex.q || '').trim();
    });
    if (existing) {
      currentModule = 'wrong';
      currentView = 'wrongBrowse';
      wrongJumpId = existing;
      renderApp();
      toast('已在错题本中，已为你定位');
      return;
    }
    const id = 'wp_' + Date.now() + '_' + Math.floor(Math.random() * 10000);
    const w = defaultWrongCard();
    w.kind = '错题';
    w.q = ex.q; w.a = ex.a; w.a2 = ex.a2 || ''; w.src = ex.src || '';
    if (linkedId) w.linked = [linkedId];
    applyRatingToWrongCard(w, 0); // 视为已做过一次（失败），初始化难度/稳定性，次日重现
    DB.wrongs[id] = w;
    saveDB();
    toast('已加入错题本');
  }

  function deleteWrongCard(wid) {
    if (!confirm('确定删除这道错题吗？（不可恢复）')) return;
    delete DB.wrongs[wid];
    saveDB();
    wrongDeck = [];
    renderApp();
    toast('已删除错题');
  }

  function renderWrongBrowse() {
    const app = document.getElementById('app');
    const ids = Object.keys(DB.wrongs || {});
    const tb = el('div', 'learn-top');
    tb.appendChild(el('span', 'muted', '共 ' + ids.length + ' 道'));
    const add = el('button', 'btn small primary', '➕ 手动录入');
    add.addEventListener('click', openWrongInput);
    tb.appendChild(add);
    app.appendChild(tb);

    if (!ids.length) {
      const wrap = el('div', 'center-card');
      wrap.appendChild(el('h2', null, '📕 错题本'));
      wrap.appendChild(illus('empty-wrong'));
      wrap.appendChild(el('p', 'muted', '还没有错题。可在「知识卡·浏览」页的真题处标记，或点上方「手动录入」。'));
      app.appendChild(wrap);
      return;
    }

    const list = el('div', 'browse-list');
    ids.forEach(function (wid) {
      const w = DB.wrongs[wid];
      const m = wrongMastery(wid);
      const item = el('div', 'browse-item');
      item.setAttribute('data-wrong', wid);
      const head = el('button', 'browse-item-head');
      head.setAttribute('data-action', 'wtoggle');
      head.setAttribute('data-arg', wid);
      const left = el('div', 'browse-title');
      left.appendChild(el('span', 'badge', '📕 错题'));
      left.appendChild(texEl('span', 'browse-name', w.q));
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
      if (wrongExpanded[wid]) {
        const body = el('div', 'browse-body');
        const a = el('div', 'browse-a');
        a.appendChild(el('div', 'mini-label', '解析'));
        const ab = el('div');
        renderTex(ab, w.a);
        a.appendChild(ab);
        body.appendChild(a);
        if (w.a2) {
          const a2b = el('div', 'browse-a');
          a2b.appendChild(el('div', 'mini-label', '💡 巧解'));
          renderTex(a2b, w.a2);
          body.appendChild(a2b);
        }
        if (w.src) body.appendChild(el('p', 'muted', '📚 来源：' + w.src));
        if (w.linked && w.linked.length) {
          const rb = el('div', 'rel-box');
          rb.appendChild(el('div', 'mini-label', '关联知识点'));
          w.linked.forEach(function (id) {
            const f = DATA.find(function (x) { return x.id === id; });
            if (!f) return;
            const chip = texEl('button', 'chip rel-chip', f.title);
            chip.setAttribute('data-action', 'jump');
            chip.setAttribute('data-arg', id);
            rb.appendChild(chip);
          });
          body.appendChild(rb);
        }
        const del = el('button', 'btn small danger', '删除此题');
        del.addEventListener('click', function () { deleteWrongCard(wid); });
        body.appendChild(del);
        item.appendChild(body);
      }
      list.appendChild(item);
    });
    app.appendChild(list);

    if (wrongJumpId) {
      const target = list.querySelector('[data-wrong="' + wrongJumpId + '"]');
      if (target) {
        wrongExpanded[wrongJumpId] = true;
        const headBtn = target.querySelector('.browse-item-head');
        if (headBtn) {
          headBtn.classList.add('flash');
          target.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }
      wrongJumpId = null;
    }
  }

  function renderWrongStats() {
    const app = document.getElementById('app');
    const wrap = el('div', 'principles-wrap');
    wrap.appendChild(el('h2', null, '📊 错题统计'));

    const ids = Object.keys(DB.wrongs || {});
    if (!ids.length) {
      wrap.appendChild(el('p', 'muted', '还没有错题。'));
      app.appendChild(wrap);
      return;
    }

    let due = 0, fresh = 0, learn = 0, review = 0, grad = 0, pctSum = 0, lapses = 0;
    ids.forEach(function (wid) {
      const w = DB.wrongs[wid];
      pctSum += wrongMastery(wid).pct;
      lapses += (w.lapses || 0);
      if (w.state === 'new') fresh++;
      else if (w.state === 'learning' || w.state === 'relearning') learn++;
      else { review++; if (isWrongGraduated(w)) grad++; }
      if ((w.state === 'review' || w.state === 'learning' || w.state === 'relearning') && w.due <= Date.now()) due++;
    });
    const avg = Math.round(pctSum / ids.length);

    const ov = el('div', 'stat-overview');
    const kpi = function (label, val) { const c = el('div', 'stat-kpi'); c.appendChild(el('strong', null, String(val))); c.appendChild(el('span', 'muted', label)); ov.appendChild(c); };
    kpi('总错题', ids.length);
    kpi('待重做', due);
    kpi('已稳固', grad);
    kpi('平均掌握', avg + '%');
    kpi('累计遗忘', lapses);
    wrap.appendChild(ov);

    wrap.appendChild(el('h3', null, '📌 状态分布'));
    const sd = el('div', 'stat-card');
    [['未做', fresh], ['学习中', learn], ['复习中', review], ['已稳固', grad]].forEach(function (p) {
      const row = el('div', 'cat-bar-row');
      row.appendChild(el('span', 'cat-bar-name', p[0]));
      const bar = el('div', 'cat-bar');
      const fill = el('div', 'cat-bar-fill');
      fill.style.width = Math.round(p[1] / ids.length * 100) + '%';
      fill.style.background = p[0] === '已稳固' ? '#2A75C0' : '#B5D4F4';
      bar.appendChild(fill);
      row.appendChild(bar);
      row.appendChild(el('span', 'cat-bar-val', p[1] + ' 道'));
      sd.appendChild(row);
    });
    wrap.appendChild(sd);

    wrap.appendChild(el('h3', null, '💪 掌握度分布'));
    const dist = {};
    ids.forEach(function (wid) { const l = wrongMastery(wid).label; dist[l] = (dist[l] || 0) + 1; });
    const dd = el('div', 'stat-card');
    ['未做', '薄弱', '巩固中', '较稳', '已稳固'].forEach(function (l) {
      if (dist[l] == null) return;
      const row = el('div', 'cat-bar-row');
      row.appendChild(el('span', 'cat-bar-name', l));
      const bar = el('div', 'cat-bar');
      const fill = el('div', 'cat-bar-fill');
      fill.style.width = Math.round(dist[l] / ids.length * 100) + '%';
      fill.style.background = masteryColor(dist[l] ? 70 : 10);
      bar.appendChild(fill);
      row.appendChild(bar);
      row.appendChild(el('span', 'cat-bar-val', dist[l] + ' 道'));
      dd.appendChild(row);
    });
    wrap.appendChild(dd);

    app.appendChild(wrap);
  }

  // —— 手动录入错题 ——
  let wrongInput = null; // { q, a, a2, src, linked: [] }

  function wrongField(label, input) {
    const box = el('div', 'wrong-field');
    box.appendChild(el('span', 'mini-label', label));
    box.appendChild(input);
    return box;
  }

  function openWrongInput() {
    wrongInput = { linked: [] };
    const modal = el('div', 'map-modal');
    const backdrop = el('div', 'map-modal-backdrop');
    backdrop.addEventListener('click', closeWrongInput);
    modal.appendChild(backdrop);

    const cardBox = el('div', 'map-modal-card wrong-input-card');
    cardBox.appendChild(el('h3', null, '➕ 手动录入错题'));

    const q = el('textarea', 'wrong-input');
    q.placeholder = '题目（必填）…';
    cardBox.appendChild(wrongField('题目', q));

    const a = el('textarea', 'wrong-input');
    a.placeholder = '解析（必填）…';
    cardBox.appendChild(wrongField('解析', a));

    const a2 = el('textarea', 'wrong-input');
    a2.placeholder = '💡 巧解（可选）…';
    cardBox.appendChild(wrongField('巧解', a2));

    const src = el('input', 'wrong-input');
    src.type = 'text';
    src.placeholder = '来源（可选，如：2023 数三真题）…';
    cardBox.appendChild(wrongField('来源', src));

    const linkedBox = el('div', 'wrong-field');
    linkedBox.appendChild(el('span', 'mini-label', '关联知识点（可选）'));
    const search = el('input', 'search');
    search.type = 'search';
    search.placeholder = '搜索知识点名称…';
    const results = el('div', 'wrong-results');
    search.addEventListener('input', function () { renderWrongLinkedResults(search.value, results); });
    linkedBox.appendChild(search);
    linkedBox.appendChild(results);
    cardBox.appendChild(linkedBox);

    const btns = el('div', 'wrong-input-btns');
    const save = el('button', 'btn primary', '保存到错题本');
    save.addEventListener('click', function () { saveWrongInput(q.value, a.value, a2.value, src.value); });
    const cancel = el('button', 'btn', '取消');
    cancel.addEventListener('click', closeWrongInput);
    btns.appendChild(save);
    btns.appendChild(cancel);
    cardBox.appendChild(btns);

    wrongInput.q = q; wrongInput.a = a; wrongInput.a2 = a2; wrongInput.src = src; wrongInput.search = search;

    modal.appendChild(cardBox);
    document.body.appendChild(modal);
  }

  function renderWrongLinkedResults(query, container) {
    container.innerHTML = '';
    const q = query.trim().toLowerCase();
    if (!q) return;
    DATA.filter(function (f) {
      return (f.title + ' ' + f.front).toLowerCase().indexOf(q) !== -1;
    }).slice(0, 12).forEach(function (f) {
      const on = wrongInput.linked.indexOf(f.id) !== -1;
      const chip = el('button', 'chip' + (on ? ' active' : ''), f.title);
      chip.addEventListener('click', function () {
        const idx = wrongInput.linked.indexOf(f.id);
        if (idx >= 0) wrongInput.linked.splice(idx, 1); else wrongInput.linked.push(f.id);
        chip.classList.toggle('active');
      });
      container.appendChild(chip);
    });
  }

  function saveWrongInput(q, a, a2, src) {
    if (!q.trim() || !a.trim()) { toast('题目与解析不能为空'); return; }
    const id = 'wp_' + Date.now() + '_' + Math.floor(Math.random() * 10000);
    const w = defaultWrongCard();
    w.kind = '错题';
    w.q = q.trim(); w.a = a.trim(); w.a2 = a2.trim(); w.src = src.trim();
    w.linked = wrongInput.linked.slice();
    applyRatingToWrongCard(w, 0); // 视为已做过一次（失败），次日重现
    DB.wrongs[id] = w;
    saveDB();
    closeWrongInput();
    wrongDeck = [];
    renderApp();
    toast('已保存到错题本');
  }

  function closeWrongInput() {
    const m = document.querySelector('.map-modal');
    if (m) m.remove();
    wrongInput = null;
  }
