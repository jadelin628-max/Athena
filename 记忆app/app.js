/*
 * 考研数学三 · 公式记忆应用 — 核心逻辑
 * 记忆原理：主动回忆（先看提示→自行回想→再核对答案）
 *         + 间隔重复（SM-2 算法）+ 交错练习（卡片乱序）
 */
(function () {
  'use strict';

  const { CATS, DATA, META } = window.KAOYAN_MS3;

  // ---------------- KaTeX 加载（多 CDN 自动回退） ----------------
  const KATEX_SOURCES = [
    { js: 'katex/katex.min.js', css: 'katex/katex.min.css' },
    { js: 'https://cdn.bootcdn.net/ajax/libs/KaTeX/0.16.11/katex.min.js', css: 'https://cdn.bootcdn.net/ajax/libs/KaTeX/0.16.11/katex.min.css' },
    { js: 'https://cdn.jsdelivr.net/npm/katex@0.16.11/dist/katex.min.js', css: 'https://cdn.jsdelivr.net/npm/katex@0.16.11/dist/katex.min.css' },
    { js: 'https://unpkg.com/katex@0.16.11/dist/katex.min.js', css: 'https://unpkg.com/katex@0.16.11/dist/katex.min.css' },
    { js: 'https://cdn.staticfile.net/KaTeX/0.16.11/katex.min.js', css: 'https://cdn.staticfile.net/KaTeX/0.16.11/katex.min.css' }
  ];

  function injectKatexCss(url) {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = url;
    document.head.appendChild(link);
  }

  function bootKatex(i) {
    if (i >= KATEX_SOURCES.length) { return; }
    const src = KATEX_SOURCES[i];
    const s = document.createElement('script');
    s.src = src.js;
    s.async = true;
    let done = false;
    const ok = function () {
      if (done) return;
      done = true;
      if (typeof window.katex === 'undefined' || !window.katex.render) { bootKatex(i + 1); return; }
      injectKatexCss(src.css);
      upgradeAllMath();
    };
    const fail = function () { if (!done) { done = true; bootKatex(i + 1); } };
    s.onload = ok;
    s.onerror = fail;
    document.head.appendChild(s);
    setTimeout(fail, 12000);
  }

  // ---------------- 数学渲染（KaTeX 可用则渲染，否则降级为纯文本） ----------------
  function renderTex(el, str) {
    el.setAttribute('data-tex', str);
    el.innerHTML = '';
    if (typeof window.katex !== 'undefined' && window.katex.render) {
      const parts = String(str).split(/(\$\$[^$]*\$\$|\$[^$]*\$)/g);
      for (let i = 0; i < parts.length; i++) {
        const p = parts[i];
        if (!p) continue;
        if (p.startsWith('$$')) {
          const d = document.createElement('div');
          d.className = 'kx-block';
          try { window.katex.render(p.slice(2, -2), d, { displayMode: true, throwOnError: false }); }
          catch (e) { d.textContent = p.slice(2, -2); }
          el.appendChild(d);
        } else if (p.startsWith('$')) {
          const sp = document.createElement('span');
          sp.className = 'kx-inline';
          try { window.katex.render(p.slice(1, -1), sp, { displayMode: false, throwOnError: false }); }
          catch (e) { sp.textContent = p.slice(1, -1); }
          el.appendChild(sp);
        } else {
          el.appendChild(document.createTextNode(p));
        }
      }
    } else {
      el.textContent = String(str).replace(/\$/g, '');
    }
  }

  // KaTeX 加载完成后，原地把已渲染的纯文本升级为公式（不打断当前学习状态）
  function upgradeAllMath() {
    document.querySelectorAll('[data-tex]').forEach(function (n) {
      renderTex(n, n.getAttribute('data-tex'));
    });
  }

  // ---------------- 数据持久化 ----------------
  const LS_KEY = 'ms3_formula_srs_v1';
  const THEME_KEY = 'ms3_formula_theme';
  const SESSION_KEY = 'ms3_formula_session_v1';
  let DB = null;

  function defaultCard() { return { reps: 0, ef: 2.5, ivl: 0, due: 0, lapses: 0, state: 'new', s: 0 }; }

  // IndexedDB（作为更持久的数据备份；localStorage 仍为主存储）
  function idbOpen() {
    return new Promise(function (resolve, reject) {
      if (typeof indexedDB === 'undefined') { reject(new Error('no idb')); return; }
      const req = indexedDB.open('ms3_formula_db', 1);
      req.onupgradeneeded = function (e) { const db = e.target.result; if (!db.objectStoreNames.contains('kv')) db.createObjectStore('kv'); };
      req.onsuccess = function () { resolve(req.result); };
      req.onerror = function () { reject(req.error); };
    });
  }
  function idbGet(key) {
    return idbOpen().then(function (db) {
      return new Promise(function (resolve, reject) {
        const tx = db.transaction('kv', 'readonly');
        const r = tx.objectStore('kv').get(key);
        r.onsuccess = function () { resolve(r.result); db.close(); };
        r.onerror = function () { reject(r.error); db.close(); };
      });
    });
  }
  function idbSet(key, value) {
    return idbOpen().then(function (db) {
      return new Promise(function (resolve, reject) {
        const tx = db.transaction('kv', 'readwrite');
        tx.objectStore('kv').put(value, key);
        tx.oncomplete = function () { resolve(); db.close(); };
        tx.onerror = function () { reject(tx.error); db.close(); };
      });
    }).catch(function () {});
  }

  function normalizeDB(raw) {
    DB = (raw && typeof raw === 'object') ? raw : { cards: {}, settings: { dailyNew: 10 }, log: {} };
    if (!DB.cards) DB.cards = {};
    if (!DB.settings) DB.settings = {};
    if (DB.settings.dailyNew == null) DB.settings.dailyNew = 10;
    if (!DB.log) DB.log = {};
    DATA.forEach(function (f) {
      if (!DB.cards[f.id]) DB.cards[f.id] = defaultCard();
      const c = DB.cards[f.id];
      if (typeof c.s !== 'number') c.s = initialStrength(c);
    });
    saveDB();
  }
  function loadDBAsync() {
    return new Promise(function (resolve) {
      let local = null;
      try { local = JSON.parse(localStorage.getItem(LS_KEY)); } catch (e) {}
      if (local && typeof local === 'object') { normalizeDB(local); resolve(); return; }
      idbGet(LS_KEY).then(function (v) {
        normalizeDB((v && typeof v === 'object') ? v : null);
        resolve();
      }).catch(function () { normalizeDB(null); resolve(); });
    });
  }
  function saveDB() {
    const json = JSON.stringify(DB);
    try { localStorage.setItem(LS_KEY, json); } catch (e) {}
    try { idbSet(LS_KEY, DB); } catch (e) {}
  }
  function card(id) { return DB.cards[id]; }
  function shuffle(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }

  // ---------------- 会话持久化（跨模块/刷新保持学习卡片） ----------------
  function saveSession() {
    try { localStorage.setItem(SESSION_KEY, JSON.stringify({ deck: deck, pos: pos, frontier: frontier, pendingAdvance: pendingAdvance, seenAgain: seenAgain })); } catch (e) {}
  }
  function loadSession() {
    try {
      const raw = localStorage.getItem(SESSION_KEY);
      if (raw) {
        const s = JSON.parse(raw);
        if (s && Array.isArray(s.deck) && s.deck.length > 0) {
          deck = s.deck.filter(function (id) { return DATA.some(function (f) { return f.id === id; }); });
          pos = Math.max(0, Math.min(s.pos | 0, deck.length - 1));
          frontier = Math.max(0, Math.min(s.frontier | 0, deck.length));
          pendingAdvance = !!s.pendingAdvance;
          seenAgain = s.seenAgain || {};
          return true;
        }
      }
    } catch (e) {}
    return false;
  }

  // ---------------- 打卡与坚持天数 ----------------
  function fmtDate(d) {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return y + '-' + m + '-' + day;
  }
  function todayStr() { return fmtDate(new Date()); }
  function markCheckin() {
    if (!DB.log.checkins) DB.log.checkins = {};
    if (!DB.log.checkins[todayStr()]) { DB.log.checkins[todayStr()] = true; saveDB(); }
  }
  function isCheckedToday() { return !!(DB.log.checkins || {})[todayStr()]; }
  function totalCheckins() { return Object.keys(DB.log.checkins || {}).length; }
  function streakDays() {
    const c = DB.log.checkins || {};
    let s = 0;
    const d = new Date();
    if (!c[fmtDate(d)]) d.setDate(d.getDate() - 1);
    while (c[fmtDate(d)]) { s++; d.setDate(d.getDate() - 1); }
    return s;
  }
  function checkinBar() {
    const bar = el('div', 'checkin-bar');
    const info = el('div', 'checkin-info');
    info.appendChild(el('span', 'checkin-streak', '🔥 坚持 ' + streakDays() + ' 天'));
    info.appendChild(el('span', 'muted', '累计打卡 ' + totalCheckins() + ' 天'));
    bar.appendChild(info);
    const checked = isCheckedToday();
    const btn = el('button', 'btn' + (checked ? '' : ' primary'), checked ? '✓ 今日已打卡' : '📌 今日打卡');
    btn.setAttribute('data-action', 'checkin');
    bar.appendChild(btn);
    return bar;
  }

  // ---------------- 统计与掌握度 ----------------
  function initialStrength(c) {
    if (c.state === 'new') return 0;
    if (c.state === 'learn') return 15;
    const d = c.ivl;
    if (d < 1) return 25;
    if (d < 7) return 45;
    if (d < 21) return 65;
    if (d < 60) return 85;
    return 95;
  }

  function mastery(id) {
    const c = card(id);
    const s = Math.max(0, Math.min(100, Math.round((typeof c.s === 'number') ? c.s : initialStrength(c))));
    let label;
    if (s < 10) label = '未学';
    else if (s < 25) label = '初学';
    else if (s < 45) label = '生疏';
    else if (s < 65) label = '巩固中';
    else if (s < 85) label = '已掌握';
    else if (s < 95) label = '熟练';
    else label = '稳固';
    return { pct: s, label: label };
  }

  function metaOf(id) { return (META && META[id]) || [3, '综合计算与应用']; }
  function starText(n) {
    n = Math.max(1, Math.min(5, Math.round(n) || 3));
    let s = '';
    for (let i = 0; i < 5; i++) s += (i < n) ? '★' : '☆';
    return s;
  }
  function scheduleText(c) {
    if (c.state === 'learn') return '10 分钟后再复习';
    return '间隔 ' + c.ivl + ' 天后再复习';
  }
  function masteryDeltaText() {
    if (lastMasteryDelta == null) return '已记录';
    return '掌握度 ' + (lastMasteryDelta >= 0 ? '+' : '') + lastMasteryDelta;
  }

  function stats() {
    const now = Date.now();
    let due = 0, learn = 0, review = 0, fresh = 0, mature = 0, pctSum = 0;
    DATA.forEach(function (f) {
      const c = card(f.id);
      pctSum += mastery(f.id).pct;
      if (c.state === 'new') fresh++;
      else if (c.state === 'learn') { if (c.due <= now) due++; else learn++; }
      else { if (c.due <= now) due++; else { review++; if (c.ivl >= 21) mature++; } }
    });
    return { due: due, learn: learn, review: review, fresh: fresh, mature: mature, total: DATA.length, avg: Math.round(pctSum / DATA.length) };
  }

  // ---------------- SM-2 间隔重复 ----------------
  const DAY = 86400000;
  function applyRating(id, rating) {
    const c = card(id);
    const now = Date.now();
    const s = (typeof c.s === 'number') ? c.s : initialStrength(c);
    if (rating === 0) { // 忘记：掌握度大幅下调
      c.reps = 0;
      c.lapses++;
      c.ivl = 0;
      c.state = 'learn';
      c.s = Math.max(0, s - 25);
      c.due = now + 10 * 60 * 1000; // 10 分钟后再见
      return;
    }
    const q = rating + 2; // hard=3 good=4 easy=5
    c.ef = Math.max(1.3, c.ef + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02)));
    let ivl;
    if (c.reps === 0) ivl = (rating === 3) ? 4 : 1;
    else if (c.reps === 1) ivl = (rating === 3) ? 12 : 6;
    else {
      const mult = (rating === 1) ? 1.2 : (rating === 3 ? c.ef * 1.3 : c.ef);
      ivl = Math.max(1, Math.round(c.ivl * mult));
    }
    c.ivl = ivl;
    c.reps++;
    c.state = 'review';
    if (rating === 1) c.s = Math.max(0, s - 8);       // 困难：小幅下调
    else if (rating === 2) c.s = Math.min(100, s + 12); // 良好：上调
    else c.s = Math.min(100, s + 20);                   // 简单：更多上调
    c.due = now + ivl * DAY;
  }

  // ---------------- 视图状态 ----------------
  let currentView = 'learn';
  let deck = [];
  let pos = 0;
  let frontier = 0;
  let pendingAdvance = false;
  let lastMasteryDelta = null;
  let seenAgain = {};
  let quiz = null;

  // ---------------- 通用 DOM ----------------
  function el(tag, cls, text) {
    const e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text != null) e.textContent = text;
    return e;
  }

  function toast(msg) {
    let t = document.getElementById('toast');
    if (!t) { t = el('div', 'toast'); t.id = 'toast'; document.body.appendChild(t); }
    t.textContent = msg;
    t.classList.add('show');
    clearTimeout(t._timer);
    t._timer = setTimeout(function () { t.classList.remove('show'); }, 1800);
  }

  function renderApp() {
    const app = document.getElementById('app');
    app.innerHTML = '';
    if (currentView === 'learn') renderLearn();
    else if (currentView === 'browse') renderBrowse();
    else if (currentView === 'quiz') renderQuiz();
    else if (currentView === 'settings') renderSettings();
    else if (currentView === 'principle') renderPrinciples();
    // 高亮导航
    document.querySelectorAll('nav .nav-btn').forEach(function (b) {
      b.classList.toggle('active', b.getAttribute('data-arg') === currentView);
    });
  }

  function statsBar() {
    const s = stats();
    const bar = el('div', 'stats-bar');
    bar.appendChild(el('span', 'stat', '待复习 ' + s.due));
    bar.appendChild(el('span', 'stat', '新卡片 ' + s.fresh));
    bar.appendChild(el('span', 'stat', '已掌握 ' + s.mature));
    bar.appendChild(el('span', 'stat', '平均掌握 ' + s.avg + '%'));
    bar.appendChild(el('span', 'stat', '总计 ' + s.total));
    return bar;
  }

  // ---------------- 学习视图 ----------------
  function buildSession(extraNew) {
    const now = Date.now();
    const due = DATA.filter(function (f) {
      const c = card(f.id);
      return (c.state === 'review' || c.state === 'learn') && c.due <= now;
    }).map(function (f) { return f.id; });
    const fresh = shuffle(DATA.filter(function (f) { return card(f.id).state === 'new'; })
      .map(function (f) { return f.id; }));
    const limit = Math.max(0, Math.min(99, DB.settings.dailyNew || 10));
    const take = fresh.slice(0, limit + (extraNew || 0));
    deck = shuffle(due.concat(take));
    pos = 0;
    frontier = 0;
    pendingAdvance = false;
    seenAgain = {};
    saveSession();
  }

  function renderLearn() {
    const app = document.getElementById('app');
    app.appendChild(checkinBar());
    app.appendChild(statsBar());

    const done = (deck.length === 0) || (frontier >= deck.length && pos >= frontier);
    if (done) {
      const wrap = el('div', 'center-card');
      const h = el('h2', null, '🎉 今日任务已完成');
      wrap.appendChild(h);
      wrap.appendChild(el('p', 'muted',
        '🔥 已坚持 ' + streakDays() + ' 天 · 累计打卡 ' + totalCheckins() + ' 天' + (isCheckedToday() ? ' · 今日已打卡 ✓' : '')));
      const s = stats();
      let msg;
      if (s.due === 0 && s.fresh === 0) msg = '所有公式均已排入复习计划，明天再来巩固吧。';
      else if (s.due === 0) msg = '今日待复习卡片已完成，还可以继续学习新卡片。';
      else msg = '本组卡片已复习完，稍后（约10分钟后）忘记的卡片会再次出现。';
      wrap.appendChild(el('p', 'muted', msg));
      const actions = el('div', 'actions');
      if (s.fresh > 0) {
        const b = el('button', 'btn primary', '继续学新卡 +' + Math.min(s.fresh, 10));
        b.setAttribute('data-action', 'addnew');
        actions.appendChild(b);
      }
      if (s.due > 0) {
        const b2 = el('button', 'btn', '继续复习待复习卡片');
        b2.setAttribute('data-action', 'rebuild');
        actions.appendChild(b2);
      }
      wrap.appendChild(actions);
      app.appendChild(wrap);
      return;
    }
    renderLearnCard(deck[pos]);
  }

  function renderLearnCard(id) {
    const app = document.getElementById('app');
    const f = DATA.find(function (x) { return x.id === id; });
    const reviewed = pos < frontier;
    const remaining = deck.length - frontier;
    const wrap = el('div', 'learn-wrap');

    const top = el('div', 'learn-top');
    top.appendChild(el('span', 'badge', CATS[f.cat]));
    top.appendChild(el('span', 'muted', (reviewed && !pendingAdvance ? '回顾中 · ' : '') + '剩余 ' + remaining + ' 张'));
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
      st.state === 'new' ? '尚未学习' : ('间隔 ' + st.ivl + ' 天' + (st.lapses > 0 ? ' · 遗忘 ' + st.lapses + ' 次' : ''))));
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
    useBox.appendChild(el('span', 'use-label', '📌 常考题型：'));
    useBox.appendChild(el('span', null, metaOf(id)[1]));
    cardEl.appendChild(useBox);

    const hint = el('div', 'hint muted' + (reviewed ? '' : ' hidden'),
      reviewed
        ? (pendingAdvance ? '✅ ' + masteryDeltaText() + '，' + scheduleText(st) + '，点击「下一张」继续。' : '这是你已复习过的卡片（答案已展示），点「回到当前卡片」继续。')
        : '回想后再点击「显示答案」核对，主动回忆效果最佳。');
    cardEl.appendChild(hint);

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
        const b = el('button', 'btn rate r' + r, label);
        b.setAttribute('data-action', 'rate');
        b.setAttribute('data-arg', String(r));
        b.setAttribute('title', sub);
        rating.appendChild(b);
      };
      mk('忘记', '10 分钟后再见', 0);
      mk('困难', '缩短间隔', 1);
      mk('良好', '正常间隔', 2);
      mk('简单', '拉长间隔', 3);
      wrap.appendChild(rating);
    }

    app.appendChild(wrap);
  }

  function revealCurrent() {
    const app = document.getElementById('app');
    app.querySelector('.back').classList.remove('hidden');
    app.querySelector('.use-box').classList.remove('hidden');
    app.querySelector('.hint').classList.remove('hidden');
    app.querySelector('.controls').classList.add('hidden');
    app.querySelector('.rating').classList.remove('hidden');
  }

  function doRate(r) {
    if (frontier >= deck.length) return;
    const id = deck[frontier];
    const before = (typeof card(id).s === 'number') ? card(id).s : initialStrength(card(id));
    applyRating(id, r);
    const after = (typeof card(id).s === 'number') ? card(id).s : 0;
    lastMasteryDelta = Math.round(after - before);
    markCheckin();
    if (r === 0 && !seenAgain[id]) {
      seenAgain[id] = true;
      deck.push(id);
    }
    frontier++;
    pendingAdvance = true;
    saveDB();
    saveSession();
    renderApp();
  }

  function addMoreNew() {
    const s = stats();
    const n = Math.min(s.fresh, 10);
    const fresh = shuffle(DATA.filter(function (f) { return card(f.id).state === 'new'; })
      .map(function (f) { return f.id; }));
    const added = fresh.slice(0, n);
    deck = deck.concat(added);
    saveSession();
    if (added.length === 0) toast('没有更多新卡片了');
    renderApp();
  }

  // ---------------- 浏览视图 ----------------
  let browseCat = 'all';
  let browseQuery = '';
  let browseExpanded = {};
  let searchRefocus = false;
  let browseMastery = 'all';
  let browseStars = 'all';

  function renderBrowse() {
    const app = document.getElementById('app');

    const head = el('div', 'browse-head');
    const search = el('input', 'search');
    search.type = 'search';
    search.placeholder = '搜索公式（名称 / 内容）…';
    search.value = browseQuery;
    search.addEventListener('input', function () { browseQuery = search.value; searchRefocus = true; renderApp(); });
    head.appendChild(search);
    app.appendChild(head);

    const chips = el('div', 'chips');
    const allChip = el('button', 'chip' + (browseCat === 'all' ? ' active' : ''), '全部');
    allChip.setAttribute('data-action', 'bcat');
    allChip.setAttribute('data-arg', 'all');
    chips.appendChild(allChip);
    Object.keys(CATS).forEach(function (k) {
      const b = el('button', 'chip' + (browseCat === k ? ' active' : ''), CATS[k]);
      b.setAttribute('data-action', 'bcat');
      b.setAttribute('data-arg', k);
      chips.appendChild(b);
    });
    app.appendChild(chips);

    const chipsM = el('div', 'chips');
    chipsM.appendChild(el('span', 'filter-label', '掌握'));
    ['all', '未学', '初学', '生疏', '巩固中', '已掌握', '熟练', '稳固'].forEach(function (v) {
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
    if (n === 0) list.appendChild(el('p', 'muted', '没有匹配的公式。'));
    app.appendChild(list);

    if (searchRefocus) {
      searchRefocus = false;
      search.focus();
      const v = search.value;
      search.setSelectionRange(v.length, v.length);
    }
  }

  function browseItem(f) {
    const item = el('div', 'browse-item');
    const head = el('button', 'browse-item-head');
    head.setAttribute('data-action', 'btoggle');
    head.setAttribute('data-arg', f.id);
    const left = el('div', 'browse-title');
    left.appendChild(el('span', 'badge', CATS[f.cat]));
    left.appendChild(el('span', 'browse-name', f.title));
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
      ub.appendChild(el('span', 'use-label', '📌 常考题型：'));
      ub.appendChild(el('span', null, metaOf(f.id)[1]));
      a.appendChild(ub);
      body.appendChild(a);
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
      wrap.appendChild(el('p', 'muted', '每次随机抽取 10 道题：给出公式，选择它的名称。用来检验你是否真正「认得」公式。'));
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
    const label = el('div', 'mini-label', '这个公式叫什么？');
    cardEl.appendChild(label);
    const fb = el('div', 'front');
    renderTex(fb, q.card.back);
    cardEl.appendChild(fb);
    wrap.appendChild(cardEl);

    const opts = el('div', 'quiz-opts');
    q.opts.forEach(function (oid) {
      const of = DATA.find(function (x) { return x.id === oid; });
      const b = el('button', 'btn quiz-opt', of.title);
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
  function renderSettings() {
    const app = document.getElementById('app');
    const wrap = el('div', 'settings-wrap');

    const s1 = el('div', 'setting-row');
    s1.appendChild(el('span', null, '每日新卡片数'));
    const input = el('input', 'num');
    input.type = 'number';
    input.min = '1';
    input.max = '99';
    input.value = String(DB.settings.dailyNew);
    input.id = 'dailyNewInput';
    s1.appendChild(input);
    const save = el('button', 'btn', '保存');
    save.setAttribute('data-action', 'setdaily');
    s1.appendChild(save);
    wrap.appendChild(s1);
    wrap.appendChild(el('p', 'muted', '新卡片会按此数量加入每天的复习队列，建议 5~15 张。'));

    const s2 = el('div', 'setting-row');
    s2.appendChild(el('span', null, '导出学习进度备份'));
    const exp = el('button', 'btn', '导出 JSON');
    exp.setAttribute('data-action', 'export');
    s2.appendChild(exp);
    wrap.appendChild(s2);

    const s3 = el('div', 'setting-row danger-row');
    s3.appendChild(el('span', null, '重置全部学习进度'));
    const reset = el('button', 'btn danger', '清空并重来');
    reset.setAttribute('data-action', 'resetall');
    s3.appendChild(reset);
    wrap.appendChild(s3);

    app.appendChild(wrap);
  }

  // ---------------- 记忆原理视图 ----------------
  function renderPrinciples() {
    const app = document.getElementById('app');
    const wrap = el('div', 'principles-wrap');

    wrap.appendChild(el('h2', null, '🧠 记忆原理'));
    wrap.appendChild(el('p', 'muted', '本应用遵循认知科学中被反复验证的记忆规律——你正在进行的每一步，都对应下面一条原理。'));

    const cards = [
      { icon: '✍️', name: '主动回忆 · Active Recall',
        desc: '先回想、再核对，比反复阅读更能加固记忆。',
        how: '卡片默认只显示提示，你必须先自行回想，再点「显示答案」。' },
      { icon: '⏱️', name: '间隔重复 · Spaced Repetition',
        desc: '在即将遗忘时复习，用最少次数达成长期记忆。',
        how: '内置 SM-2 算法：按「忘记/困难/良好/简单」打分，自动把下次复习安排在遗忘临界点（10 分钟 → 1 天 → 6 天 → 指数拉长）。' },
      { icon: '🔀', name: '交错练习 · Interleaving',
        desc: '混合不同章节，比集中刷一类更能提升辨析能力。',
        how: '复习队列随机乱序，导数、积分、线代、概率混合出现。' },
      { icon: '🧪', name: '测试效应 · Testing Effect',
        desc: '「考自己」比「看自己」记得更牢。',
        how: '自测模式随机抽题，给出公式让你选名称，检验是否真正认得。' }
    ];
    cards.forEach(function (c) {
      const box = el('div', 'principle');
      const h = el('div', 'principle-head');
      h.appendChild(el('span', 'principle-icon', c.icon));
      h.appendChild(el('strong', null, c.name));
      box.appendChild(h);
      box.appendChild(el('p', null, c.desc));
      box.appendChild(el('p', 'muted how', '如何体现：' + c.how));
      wrap.appendChild(box);
    });

    const s = stats();
    const dist = el('div', 'principle');
    dist.appendChild(el('strong', null, '📊 掌握程度如何计算'));
    dist.appendChild(el('p', 'muted',
      '每张卡片根据你的记忆反馈动态调整掌握度：忘记/困难下调、良好/简单上调，并随复习间隔巩固。分级：未学 → 初学 → 生疏 → 巩固中 → 已掌握 → 熟练 → 稳固。当前整体平均掌握度 ' + s.avg + '%。'));
    const legend = el('div', 'legend');
    const levels = ['未学', '初学', '生疏', '巩固中', '已掌握', '熟练', '稳固'];
    const counts = {};
    DATA.forEach(function (f) { const l = mastery(f.id).label; counts[l] = (counts[l] || 0) + 1; });
    levels.forEach(function (lv) {
      const p = el('span', 'legend-item');
      p.textContent = lv + ' ' + (counts[lv] || 0);
      legend.appendChild(p);
    });
    dist.appendChild(legend);
    wrap.appendChild(dist);

    app.appendChild(wrap);
  }

  // ---------------- 动作分发 ----------------
  function handleAction(action, arg) {
    switch (action) {
      case 'nav':
        currentView = arg;
        renderApp();
        break;
      case 'goback':
        if (pos > 0) { pos--; pendingAdvance = false; saveSession(); renderApp(); }
        break;
      case 'gofront':
        pos = frontier;
        pendingAdvance = false;
        saveSession();
        renderApp();
        break;
      case 'checkin':
        markCheckin();
        renderApp();
        toast('打卡成功，已坚持 ' + streakDays() + ' 天');
        break;
      case 'reveal':
        revealCurrent();
        break;
      case 'rate':
        doRate(parseInt(arg, 10));
        break;
      case 'addnew':
        addMoreNew();
        break;
      case 'rebuild':
        buildSession(0);
        renderApp();
        break;
      case 'bcat':
        browseCat = arg;
        browseExpanded = {};
        renderApp();
        break;
      case 'bmastery':
        browseMastery = arg;
        browseExpanded = {};
        renderApp();
        break;
      case 'bstars':
        browseStars = arg;
        browseExpanded = {};
        renderApp();
        break;
      case 'btoggle':
        browseExpanded[arg] = !browseExpanded[arg];
        renderApp();
        break;
      case 'resetcard':
        DB.cards[arg] = defaultCard();
        saveDB();
        renderApp();
        toast('已重置该卡片');
        break;
      case 'qstart':
        startQuiz();
        break;
      case 'qanswer':
        doQuizAnswer(arg);
        break;
      case 'qnext':
        quiz.idx++;
        renderApp();
        break;
      case 'setdaily': {
        const v = parseInt(document.getElementById('dailyNewInput').value, 10);
        DB.settings.dailyNew = Math.max(1, Math.min(99, v || 10));
        saveDB();
        toast('已保存');
        break;
      }
      case 'export': {
        const blob = new Blob([JSON.stringify(DB, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = '数三公式记忆-备份.json';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        toast('已导出');
        break;
      }
      case 'resetall':
        if (confirm('确定要清空全部学习进度吗？此操作不可撤销。')) {
          DB.cards = {};
          DATA.forEach(function (f) { DB.cards[f.id] = defaultCard(); });
          saveDB();
          buildSession(0);
          currentView = 'learn';
          renderApp();
          toast('已重置');
        }
        break;
    }
  }

  // ---------------- 全局事件 ----------------
  document.addEventListener('click', function (e) {
    const t = e.target.closest('[data-action]');
    if (!t) return;
    handleAction(t.getAttribute('data-action'), t.getAttribute('data-arg'));
  });

  document.addEventListener('keydown', function (e) {
    if (currentView !== 'learn') return;
    if (e.key === ' ' || e.key === 'Enter') {
      const reveal = document.querySelector('.controls');
      if (reveal && !reveal.classList.contains('hidden')) {
        e.preventDefault();
        revealCurrent();
        return;
      }
    }
    const rating = document.querySelector('.rating');
    if (rating && !rating.classList.contains('hidden')) {
      const map = { '1': 0, '2': 1, '3': 2, '4': 3 };
      if (map[e.key] != null) doRate(map[e.key]);
    }
  });

  // 触屏手势：右滑「上一张」，左滑「下一张/回到当前」
  let touchStart = null;
  document.addEventListener('touchstart', function (e) {
    if (currentView !== 'learn') return;
    if (e.touches.length === 1) touchStart = { x: e.touches[0].clientX, y: e.touches[0].clientY };
  }, { passive: true });
  document.addEventListener('touchend', function (e) {
    if (currentView !== 'learn' || !touchStart) return;
    const dx = e.changedTouches[0].clientX - touchStart.x;
    const dy = e.changedTouches[0].clientY - touchStart.y;
    touchStart = null;
    if (Math.abs(dx) < 50 || Math.abs(dx) < Math.abs(dy)) return; // 需明显水平滑动
    if (dx < 0 && pos < frontier) handleAction('gofront');
    else if (dx > 0 && pos > 0) handleAction('goback');
  }, { passive: true });

  // ---------------- 主题 ----------------
  function applyTheme() {
    const t = localStorage.getItem(THEME_KEY) || 'light';
    document.documentElement.setAttribute('data-theme', t);
  }
  document.getElementById('themeToggle').addEventListener('click', function () {
    const cur = document.documentElement.getAttribute('data-theme');
    const next = cur === 'dark' ? 'light' : 'dark';
    localStorage.setItem(THEME_KEY, next);
    applyTheme();
  });

  // ---------------- PWA / 离线 ----------------
  if ('serviceWorker' in navigator && (location.protocol === 'https:' || location.protocol === 'http:')) {
    window.addEventListener('load', function () {
      navigator.serviceWorker.register('./sw.js').catch(function () {});
    });
  }

  // ---------------- 启动 ----------------
  function initApp() {
    applyTheme();
    loadDBAsync().then(function () {
      if (!loadSession()) buildSession(0);
      currentView = 'learn';
      renderApp();
    });
  }

  initApp();
  bootKatex(0);
})();
