/*
 * 考研数学三 · 公式记忆应用 — 核心逻辑
 * 记忆原理：主动回忆（先看提示→自行回想→再核对答案）
 *         + 间隔重复（SM-2 算法）+ 交错练习（卡片乱序）
 */
(function () {
  'use strict';

  // ---------------- 学科管理（多学科数据注册表） ----------------
  const SUBJECT_KEY = 'formula_app_subject';
  let currentSubjectId = null;
  let CATS = null, DATA = null, META = null;
  let EXAMPLES = {}, REL = {}, DEPTH = {};

  function subjectList() { return window.SUBJECTS || {}; }
  function setSubject(id) {
    const list = subjectList();
    const subj = list[id] || list[Object.keys(list)[0]] || null;
    if (!subj) return false;
    currentSubjectId = subj.id;
    CATS = subj.CATS;
    DATA = subj.DATA;
    META = subj.META;
    EXAMPLES = subj.EXAMPLE || {};
    REL = subj.REL || {};
    DEPTH = subj.DEPTH || {};
    try { localStorage.setItem(SUBJECT_KEY, subj.id); } catch (e) {}
    document.title = subj.name;
    const b = document.getElementById('brandText');
    if (b) b.textContent = subj.icon;
    const sel = document.getElementById('subjectSelect');
    if (sel) sel.value = subj.id;
    document.body.setAttribute('data-subject', subj.id);
    const hdr = document.querySelector('header');
    if (hdr) hdr.setAttribute('data-subject-icon', subj.icon);
    return true;
  }
  function dbKey() { return currentSubjectId + '_formula_srs_v1'; }
  function sessionKey() { return currentSubjectId + '_formula_session_v2'; }

  function updateBrand() {
    const b = document.getElementById('brandText');
    if (!b || !currentSubjectId || !DB || !DATA) return;
    const subj = subjectList()[currentSubjectId];
    const s = stats();
    b.textContent = (subj ? subj.icon : '') + ' ' + s.avg + '%';
  }

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
  const THEME_KEY = 'ms3_formula_theme';
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
      try { local = JSON.parse(localStorage.getItem(dbKey())); } catch (e) {}
      if (local && typeof local === 'object') { normalizeDB(local); resolve(); return; }
      idbGet(dbKey()).then(function (v) {
        normalizeDB((v && typeof v === 'object') ? v : null);
        resolve();
      }).catch(function () { normalizeDB(null); resolve(); });
    });
  }
  function saveDB() {
    const json = JSON.stringify(DB);
    try { localStorage.setItem(dbKey(), json); } catch (e) {}
    try { idbSet(dbKey(), DB); } catch (e) {}
  }

  function sanitizeCard(c) {
    const out = defaultCard();
    if (c && typeof c === 'object') {
      if (typeof c.reps === 'number') out.reps = c.reps;
      if (typeof c.ef === 'number') out.ef = c.ef;
      if (typeof c.ivl === 'number') out.ivl = c.ivl;
      if (typeof c.due === 'number') out.due = c.due;
      if (typeof c.lapses === 'number') out.lapses = c.lapses;
      if (typeof c.s === 'number') out.s = c.s;
      if (c.state === 'new' || c.state === 'learn' || c.state === 'review') out.state = c.state;
    }
    return out;
  }
  function importDB(text) {
    let data;
    try { data = JSON.parse(text); } catch (e) { throw new Error('不是有效的 JSON 文件'); }
    let payload = data;
    let target = currentSubjectId;
    if (data && data.format === 'formula-memory' && data.db) {
      payload = data.db;
      target = data.subject || currentSubjectId;
    }
    if (!payload || typeof payload !== 'object' || !payload.cards || typeof payload.cards !== 'object') {
      throw new Error('文件格式不正确（缺少 cards 数据）');
    }
    if (target !== currentSubjectId) {
      if (!setSubject(target)) throw new Error('备份中的学科不受支持');
      deck = []; pos = 0; frontier = 0; pendingAdvance = false; lastMasteryDelta = null; seenAgain = {}; quiz = null;
      browseCat = 'all'; browseQuery = ''; browseExpanded = {}; searchRefocus = false; browseMastery = 'all'; browseStars = 'all';
    }
    const fresh = { cards: {}, settings: { dailyNew: 10 }, log: {} };
    DATA.forEach(function (f) { fresh.cards[f.id] = sanitizeCard(payload.cards[f.id]); });
    if (payload.settings && typeof payload.settings.dailyNew === 'number') {
      fresh.settings.dailyNew = Math.max(1, Math.min(99, Math.round(payload.settings.dailyNew)));
    }
    if (payload.log && payload.log.checkins && typeof payload.log.checkins === 'object') {
      fresh.log.checkins = {};
      Object.keys(payload.log.checkins).forEach(function (k) { fresh.log.checkins[k] = true; });
    }
    DB = fresh;
    saveDB();
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
    try { localStorage.setItem(sessionKey(), JSON.stringify({ deck: deck, pos: pos, frontier: frontier, pendingAdvance: pendingAdvance, seenAgain: seenAgain })); } catch (e) {}
  }
  function loadSession() {
    try {
      const raw = localStorage.getItem(sessionKey());
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

  // 旧版本（单学科）数据迁移到按学科命名的新键
  function migrateLegacy() {
    const pairs = [
      ['ms3_formula_srs_v1', 'math3_formula_srs_v1'],
      ['ms3_formula_session_v1', 'math3_formula_session_v1']
    ];
    pairs.forEach(function (p) {
      try {
        if (!localStorage.getItem(p[1]) && localStorage.getItem(p[0])) {
          localStorage.setItem(p[1], localStorage.getItem(p[0]));
        }
      } catch (e) {}
    });
    try {
      idbGet('ms3_formula_srs_v1').then(function (v) {
        if (v) idbGet('math3_formula_srs_v1').then(function (n) { if (!n) idbSet('math3_formula_srs_v1', v); }).catch(function () {});
      }).catch(function () {});
    } catch (e) {}
  }

  // ---------------- 打卡与坚持天数 ----------------
  function fmtDate(d) {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return y + '-' + m + '-' + day;
  }
  function todayStr() { return fmtDate(new Date()); }
  function markReviewed() {
    if (!DB.log.daily) DB.log.daily = {};
    const t = todayStr();
    DB.log.daily[t] = (DB.log.daily[t] || 0) + 1;
    saveDB();
  }
  function todayReviewed() {
    return (DB.log.daily && DB.log.daily[todayStr()]) || 0;
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
  function exampleOf(id) { return (EXAMPLES && EXAMPLES[id]) || null; }
  function relOf(id) { return (REL && REL[id]) || []; }
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
  let mapCat = null, mapSel = null;
  let mapTx = 0, mapTy = 0;
  let mapDragMoved = false;

  // ---------------- 通用 DOM ----------------
  function el(tag, cls, text) {
    const e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text != null) e.textContent = text;
    return e;
  }

  function texEl(tag, cls, text) {
    const e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text != null) renderTex(e, text);
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
    document.body.classList.toggle('view-map', currentView === 'map');
    if (currentView === 'learn') renderLearn();
    else if (currentView === 'browse') renderBrowse();
    else if (currentView === 'quiz') renderQuiz();
    else if (currentView === 'settings') renderSettings();
    else if (currentView === 'principle') renderPrinciples();
    else if (currentView === 'map') renderMap();
    // 高亮导航
    document.querySelectorAll('nav .nav-btn').forEach(function (b) {
      b.classList.toggle('active', b.getAttribute('data-arg') === currentView);
    });
    updateBrand();
  }

  function statsBar() {
    const s = stats();
    const bar = el('div', 'stats-bar');
    bar.appendChild(el('span', 'stat', '今天已学习 ' + todayReviewed() + ' 张'));
    bar.appendChild(el('span', 'stat', '待复习 ' + s.due));
    bar.appendChild(el('span', 'stat', '平均掌握 ' + s.avg + '%'));
    bar.appendChild(el('span', 'stat', '已掌握 ' + s.mature));
    bar.appendChild(el('span', 'stat', '总计 ' + s.total));
    return bar;
  }

  // ---------------- 学习视图 ----------------
  function buildSession() {
    const now = Date.now();
    const all = DATA.map(function (f) { return f.id; });
    const due = all.filter(function (id) {
      const c = card(id);
      return (c.state === 'review' || c.state === 'learn') && c.due <= now;
    });
    const rest = shuffle(all.filter(function (id) { return due.indexOf(id) === -1; }));
    deck = shuffle(due).concat(rest);
    pos = 0;
    frontier = 0;
    pendingAdvance = false;
    seenAgain = {};
    saveSession();
  }

  function renderLearn() {
    const app = document.getElementById('app');
    app.appendChild(statsBar());

    const done = (deck.length === 0) || (frontier >= deck.length && pos >= frontier);
    if (done) {
      const wrap = el('div', 'center-card');
      wrap.appendChild(el('h2', null, '🎉 本轮已完成'));
      wrap.appendChild(el('p', 'muted', '已完成 ' + deck.length + ' 个知识点的一轮学习。'));
      const again = el('button', 'btn primary', '再来一轮');
      again.setAttribute('data-action', 'restart');
      wrap.appendChild(again);
      app.appendChild(wrap);
      return;
    }
    renderLearnCard(deck[pos]);
  }

  // 例题 + 相关知识点（答案区附加内容，hiddenClass 为空字符串时可见）
  function buildExtras(id, hiddenClass) {
    const ex = exampleOf(id);
    const rels = relOf(id);
    if (!ex && rels.length === 0) return null;
    const box = el('div', 'extras' + hiddenClass);
    if (ex) {
      const eb = el('div', 'example-box');
      eb.appendChild(el('div', 'example-label', ex.src ? '📝 真题' : '📝 经典例题'));
      const q = el('div', 'example-q');
      renderTex(q, ex.q);
      eb.appendChild(q);
      eb.appendChild(el('div', 'mini-label', '解析'));
      const a = el('div', 'example-a');
      renderTex(a, ex.a);
      eb.appendChild(a);
      if (ex.src) eb.appendChild(el('div', 'example-src', '📚 来源：' + ex.src));
      box.appendChild(eb);
    }
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
    searchRefocus = false;
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

    const extras = buildExtras(id, reviewed ? '' : ' hidden');
    if (extras) cardEl.appendChild(extras);

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
    const ex = app.querySelector('.extras');
    if (ex) ex.classList.remove('hidden');
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
    markReviewed();
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
      ub.appendChild(el('span', 'use-label', '📌 常考题型：'));
      ub.appendChild(el('span', null, metaOf(f.id)[1]));
      a.appendChild(ub);
      body.appendChild(a);
      const extras = buildExtras(f.id, '');
      if (extras) body.appendChild(extras);
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
  function renderSettings() {
    const app = document.getElementById('app');
    const wrap = el('div', 'settings-wrap');

    const s2 = el('div', 'setting-row');
    s2.appendChild(el('span', null, '备份 / 迁移进度'));
    const exp = el('button', 'btn', '导出 JSON');
    exp.setAttribute('data-action', 'export');
    s2.appendChild(exp);
    const imp = el('button', 'btn primary', '导入 JSON');
    imp.setAttribute('data-action', 'importjson');
    s2.appendChild(imp);
    wrap.appendChild(s2);
    wrap.appendChild(el('p', 'muted', '换设备或换网址（如本地→线上）时：先「导出」生成备份文件，再到新位置「导入」。'));

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
    wrap.appendChild(el('p', 'muted', '本应用遵循认知科学中被反复验证的记忆与学习规律——每条都给出「是什么」与「怎么实践」。'));

    const cards = [
      { icon: '✍️', name: '主动回忆 · Active Recall',
        desc: '先回想、再核对，比反复阅读更能加固记忆。',
        how: '卡片默认只显示提示，先自行回想，再点「显示答案」。' },
      { icon: '⏱️', name: '间隔重复 · Spaced Repetition',
        desc: '在即将遗忘时复习，用最少次数达成长期记忆。',
        how: '内置 SM-2 算法：按「忘记/困难/良好/简单」打分，自动把下次复习安排在遗忘临界点。' },
      { icon: '📉', name: '遗忘曲线 · Forgetting Curve',
        desc: '艾宾浩斯发现遗忘「先快后慢」，不复习会迅速丢失。',
        how: '每天完成「待复习」卡片，在遗忘临界点及时巩固，而不是考前突击。' },
      { icon: '🔀', name: '交错练习 · Interleaving',
        desc: '混合不同章节，比集中刷一类更能提升辨析与迁移能力。',
        how: '复习队列随机乱序，各章节公式混合出现。' },
      { icon: '🧪', name: '测试效应 · Testing Effect',
        desc: '「考自己」比「看自己」记得更牢。',
        how: '用自测模式随机抽题，给出公式选名称，检验是否真正认得。' },
      { icon: '🌱', name: '生成效应 · Generation Effect',
        desc: '自己生成答案，比被动接收的记忆更深。',
        how: '看到提示后先在脑中/纸上写出公式，再点「显示答案」核对。' },
      { icon: '🔗', name: '精加工 · Elaboration',
        desc: '把新知识与已知知识、应用场景建立联系，形成意义网络。',
        how: '复习时追问：公式的条件是什么？和其他公式什么关系？用在什么题型？' },
      { icon: '🖼️', name: '双重编码 · Dual Coding',
        desc: '语言符号 + 图形图像双通道编码，记忆更牢。',
        how: '给公式配上图形（积分面积、正态曲线、预算线等），文字与图形一起记。' },
      { icon: '🗣️', name: '费曼技巧 · Feynman Technique',
        desc: '能用自己的话讲清楚，才是真理解。',
        how: '合上卡片，把公式与推导讲给自己或写下来；讲不通就回去再看。' },
      { icon: '❓', name: '自我解释 · Self-explanation',
        desc: '学习时向自己解释每一步「为什么」。',
        how: '每记一个公式都问「为什么成立、为什么这样推导」，不只看结论。' },
      { icon: '🎯', name: '元认知监控 · Metacognition',
        desc: '准确判断自己「会不会」，避免熟练错觉。',
        how: '用「忘记/困难/良好/简单」如实自评，并用自测结果校准对自己掌握度的判断。' },
      { icon: '🌙', name: '睡眠巩固 · Sleep & Consolidation',
        desc: '睡眠期间大脑会巩固白天所学，是记忆的关键环节。',
        how: '睡前做一组复习并保证充足睡眠，避免熬夜突击影响记忆固化。' },
      { icon: '📅', name: '分散学习 · Distributed Practice',
        desc: '每天少量多次，远优于考前一次性集中。',
        how: '每天坚持打卡、完成当日队列（「坚持天数」会给你反馈），让复习形成习惯。' }
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

  // ---------------- 思维导图视图 ----------------
  function svgEl(tag, attrs) {
    const e = document.createElementNS('http://www.w3.org/2000/svg', tag);
    for (const k in attrs) e.setAttribute(k, attrs[k]);
    return e;
  }
  function mapEdge(x1, y1, w1, h1, x2, y2, w2, h2, color) {
    const rx1 = w1 / 2, ry1 = h1 / 2, rx2 = w2 / 2, ry2 = h2 / 2;
    const dx = x2 - x1, dy = y2 - y1;
    const d = Math.sqrt(dx * dx + dy * dy) || 1;
    const ux = dx / d, uy = dy / d;
    const t1 = 1 / Math.sqrt(Math.pow(ux / rx1, 2) + Math.pow(uy / ry1, 2));
    const t2 = 1 / Math.sqrt(Math.pow(ux / rx2, 2) + Math.pow(uy / ry2, 2));
    const sx = x1 + ux * t1, sy = y1 + uy * t1;
    const ex = x2 - ux * t2, ey = y2 - uy * t2;
    const midX = sx + (ex - sx) * 0.5;
    return svgEl('path', { d: 'M ' + sx + ' ' + sy + ' C ' + midX + ' ' + sy + ', ' + midX + ' ' + ey + ', ' + ex + ' ' + ey, fill: 'none', stroke: color, 'stroke-width': '1.5', 'stroke-linecap': 'round' });
  }
  function masteryColor(pct) {
    if (pct < 1) return '#cbd2e0';
    if (pct < 25) return '#ffc1ad';
    if (pct < 45) return '#ffd29d';
    if (pct < 65) return '#ffe08a';
    if (pct < 85) return '#a8e6cf';
    if (pct < 95) return '#5fc49a';
    return '#2f9e6e';
  }
  function textWidth(text, fontSize) {
    fontSize = +fontSize || 0;
    let w = 0;
    for (let i = 0; i < text.length; i++) {
      w += (text.charCodeAt(i) > 255) ? fontSize : fontSize * 0.62;
    }
    return w;
  }
  function plainText(str) {
    return String(str).replace(/\$\$?/g, '').replace(/\\[a-zA-Z]+/g, '').replace(/[{}^_]/g, '');
  }
  function measureTitle(text, fontSize) {
    const meas = document.createElement('div');
    meas.style.cssText = 'position:absolute;left:-9999px;top:-9999px;visibility:hidden;white-space:nowrap;font-size:' + fontSize + 'px;font-weight:600;line-height:1.25;';
    document.body.appendChild(meas);
    renderTex(meas, text);
    const w = meas.scrollWidth || 0;
    const h = meas.scrollHeight || fontSize;
    document.body.removeChild(meas);
    return { w: w, h: h };
  }
  function mapPillHtml(x, y, text, fill, color, ring, tip, fontSize) {
    fontSize = parseFloat(fontSize) || 13;
    const m = measureTitle(text, fontSize);
    const padX = fontSize * 0.9, padY = fontSize * 0.45;
    const w = Math.max(fontSize * 2.2, m.w + padX * 2);
    const h = Math.max(fontSize * 1.75, m.h + padY * 2);
    const p = document.createElement('div');
    p.style.cssText = 'position:absolute;transform:translate(-50%,-50%);display:flex;align-items:center;justify-content:center;text-align:center;line-height:1.25;box-sizing:border-box;left:' + x + 'px;top:' + y + 'px;width:' + Math.ceil(w) + 'px;height:' + Math.ceil(h) + 'px;background:radial-gradient(circle at 30% 25%, rgba(255,255,255,.92), ' + fill + ' 55%, ' + fill + ');border:' + (ring ? '3px solid #16a065' : '1.3px solid #d5dbea') + ';color:' + color + ';font-size:' + fontSize + 'px;font-weight:600;border-radius:' + Math.ceil(h / 2) + 'px;cursor:pointer;';
    if (tip) p.title = plainText(tip);
    renderTex(p, text);
    return { el: p, w: w, h: h };
  }
  function categoryAvg(cat) {
    const list = DATA.filter(function (f) { return f.cat === cat; });
    if (!list.length) return 0;
    let s = 0;
    list.forEach(function (f) { s += mastery(f.id).pct; });
    return Math.round(s / list.length);
  }

  function renderMap() {
    const app = document.getElementById('app');
    const subj = subjectList()[currentSubjectId];
    const cats = Object.keys(CATS);
    if (!mapCat || !CATS[mapCat]) mapCat = cats[0];
    const cards = DATA.filter(function (f) { return f.cat === mapCat; });

    const wrap = el('div', 'map-wrap');
    const bar = el('div', 'map-toolbar');
    bar.appendChild(el('strong', null, (subj ? subj.icon + ' ' + subj.name : '') + ' · 思维导图'));
    bar.appendChild(el('span', 'muted', '拖动 / 滚动查看 · 点分类展开 · 点知识点看详情'));
    wrap.appendChild(bar);

    const rowH = 48;
    const W = 1180;
    const H = Math.max(860, (Math.max(cats.length, cards.length) + 2) * rowH + 40);
    const scroll = el('div', 'map-scroll');
    const canvas = el('div', 'map-canvas');
    canvas.style.width = W + 'px';
    canvas.style.height = H + 'px';
    const svg = svgEl('svg', { viewBox: '0 0 ' + W + ' ' + H, width: '100%', height: '100%' });
    svg.style.cssText = 'position:absolute;left:0;top:0;pointer-events:none;';
    canvas.appendChild(svg);
    scroll.appendChild(canvas);

    const root = mapPillHtml(90, H / 2, subj ? subj.name : '', '#4f6ef7', '#fff', false, subj ? subj.name : '', '18');
    canvas.appendChild(root.el);

    const catX = 330;
    const catStartY = (H - (cats.length - 1) * rowH) / 2;
    const catMeta = {};
    cats.forEach(function (k, i) {
      const y = catStartY + i * rowH;
      const avg = categoryAvg(k);
      const fill = masteryColor(avg);
      const txt = avg >= 85 ? '#fff' : '#1c2333';
      const p = mapPillHtml(catX, y, CATS[k], fill, txt, (k === mapCat), CATS[k] + ' · 平均掌握 ' + avg + '%', '15');
      catMeta[k] = { x: catX, y: y, w: p.w, h: p.h };
      svg.appendChild(mapEdge(90, H / 2, root.w, root.h, catX, y, p.w, p.h, '#cdd3e4'));
      p.el.addEventListener('click', function () { mapCat = k; mapSel = null; renderApp(); });
      canvas.appendChild(p.el);
    });

    const cardX = 660;
    const base = catMeta[mapCat];
    const cardStartY = (H - (cards.length - 1) * rowH) / 2;
    cards.forEach(function (f, i) {
      const y = cardStartY + i * rowH;
      const sel = (f.id === mapSel);
      const mp = mastery(f.id).pct;
      const fill = sel ? '#16a065' : masteryColor(mp);
      const txt = (sel || mp >= 85) ? '#fff' : '#1c2333';
      const p = mapPillHtml(cardX, y, f.title, fill, txt, sel, f.title + ' · 掌握 ' + mp + '%', '13');
      svg.appendChild(mapEdge(base.x, base.y, base.w, base.h, cardX, y, p.w, p.h, '#cdd3e4'));
      p.el.addEventListener('click', function () { mapSel = f.id; renderApp(); });
      canvas.appendChild(p.el);
    });

    wrap.appendChild(scroll);

    app.appendChild(wrap);

    if (mapSel) {
      const f = DATA.find(function (x) { return x.id === mapSel; });
      if (f) app.appendChild(mapModal(f));
    }
  }

  function buildMapPanel(f) {
    const panel = el('div');
    const h = el('div', 'map-panel-head');
    h.appendChild(el('span', 'badge', CATS[f.cat]));
    h.appendChild(texEl('strong', null, f.title));
    h.appendChild(el('span', 'star-badge small', starText(metaOf(f.id)[0])));
    panel.appendChild(h);
    panel.appendChild(el('p', 'muted', '📌 常考题型：' + metaOf(f.id)[1]));
    const rels = relOf(f.id);
    if (rels.length) {
      const rw = el('div', 'rel-list');
      rw.appendChild(el('div', 'mini-label', '相关知识点（点击跳转）'));
      rels.forEach(function (r) {
        const tf = DATA.find(function (x) { return x.id === r.to; });
        if (!tf) return;
        const chip = texEl('button', 'chip rel-chip', (r.tag ? '[' + r.tag + '] ' : '') + tf.title);
        chip.setAttribute('data-action', 'jump');
        chip.setAttribute('data-arg', tf.id);
        rw.appendChild(chip);
      });
      panel.appendChild(rw);
    } else {
      panel.appendChild(el('p', 'muted', '暂无关联标签。'));
    }
    const ex = exampleOf(f.id);
    if (ex) {
      const eb = el('div', 'example-box');
      eb.appendChild(el('div', 'example-label', ex.src ? '📝 真题' : '📝 经典例题'));
      const q = el('div', 'example-q'); renderTex(q, ex.q); eb.appendChild(q);
      eb.appendChild(el('div', 'mini-label', '解析'));
      const a = el('div', 'example-a'); renderTex(a, ex.a); eb.appendChild(a);
      if (ex.src) eb.appendChild(el('div', 'example-src', '📚 来源：' + ex.src));
      panel.appendChild(eb);
    }
    return panel;
  }

  function mapModal(f) {
    const modal = el('div', 'map-modal');
    const backdrop = el('div', 'map-modal-backdrop');
    backdrop.setAttribute('data-action', 'mapclose');
    modal.appendChild(backdrop);
    const card = el('div', 'map-modal-card');
    const close = el('button', 'map-modal-close', '×');
    close.setAttribute('data-action', 'mapclose');
    close.setAttribute('title', '关闭');
    card.appendChild(close);
    card.appendChild(buildMapPanel(f));
    modal.appendChild(card);
    return modal;
  }

  // ---------------- 动作分发 ----------------
  function handleAction(action, arg) {
    switch (action) {
      case 'nav':
        currentView = arg;
        renderApp();
        break;
      case 'mapclose':
        mapSel = null;
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
      case 'jump':
        jumpToCard(arg);
        break;
      case 'restart':
        buildSession();
        renderApp();
        break;
      case 'reveal':
        revealCurrent();
        break;
      case 'rate':
        doRate(parseInt(arg, 10));
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
      case 'export': {
        const payload = { format: 'formula-memory', version: 2, subject: currentSubjectId, db: DB };
        const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        const subj = subjectList()[currentSubjectId];
        a.download = (subj ? subj.short : '公式') + '公式记忆-备份.json';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        toast('已导出');
        break;
      }
      case 'importjson': {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'application/json,.json';
        input.onchange = function () {
          const file = input.files && input.files[0];
          if (!file) return;
          const reader = new FileReader();
          reader.onload = function () {
            try {
              importDB(String(reader.result));
              buildSession(0);
              currentView = 'learn';
              renderApp();
              toast('导入成功');
            } catch (err) {
              toast(err.message || '导入失败');
            }
          };
          reader.readAsText(file);
        };
        input.click();
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

  // ---------------- 学科切换与选择器 ----------------
  function switchSubject(id) {
    if (id === currentSubjectId || !setSubject(id)) return;
    deck = []; pos = 0; frontier = 0; pendingAdvance = false; lastMasteryDelta = null; seenAgain = {}; quiz = null;
    mapCat = null; mapSel = null; mapTx = 0; mapTy = 0;
    browseCat = 'all'; browseQuery = ''; browseExpanded = {}; searchRefocus = false; browseMastery = 'all'; browseStars = 'all';
    loadDBAsync().then(function () {
      if (!loadSession()) buildSession(0);
      currentView = 'learn';
      renderApp();
    });
  }
  function renderSubjectSelect() {
    const sel = document.getElementById('subjectSelect');
    if (!sel) return;
    sel.innerHTML = '';
    Object.keys(subjectList()).forEach(function (id) {
      const s = subjectList()[id];
      const opt = document.createElement('option');
      opt.value = id;
      opt.textContent = s.icon + ' ' + s.short;
      sel.appendChild(opt);
    });
    sel.value = currentSubjectId;
  }

  // ---------------- 启动 ----------------
  function initApp() {
    applyTheme();
    let saved = null;
    try { saved = localStorage.getItem(SUBJECT_KEY); } catch (e) {}
    setSubject(saved);
    migrateLegacy();
    renderSubjectSelect();
    loadDBAsync().then(function () {
      if (!loadSession()) buildSession(0);
      currentView = 'learn';
      renderApp();
    });
  }

  const subjectSelect = document.getElementById('subjectSelect');
  if (subjectSelect) {
    subjectSelect.addEventListener('change', function () { switchSubject(subjectSelect.value); });
  }

  initApp();
  bootKatex(0);
})();
