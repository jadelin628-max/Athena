/*
 * 考研数学三 · 公式记忆应用 — 核心逻辑
 * 记忆原理：主动回忆（先看提示→自行回想→再核对答案）
 *         + 间隔重复（SM-2 算法）+ 交错练习（卡片乱序）
 */
(function () {
  'use strict';
  const VERSION = '1.2.3';

  // ---------------- 更新日志（设置页「📜 更新日志」展示） ----------------
  const CHANGELOG = [
    { v: '1.2.3', date: '2026-08', items: ['考研倒计时徽章移至界面左上角（替代品牌字标），每日弹窗提示语精简', '数三 / 微观 / 统计：为尚未对应真题的卡片补充真实考研真题例题（本轮新增 155 张卡的真题来源标注：数三 +28、微观 +50、统计 +77）'] },
    { v: '1.2.2', date: '2026-08', items: ['时政分类改为仅收录 2026 年时政大事（两会·十五五纲要 / 建党 105 周年 / 中央经济工作会议 / 中央一号文件 / 中德联合声明 / 夏季达沃斯等）', '设置页新增「📜 更新日志」，可查看每个版本的修改内容'] },
    { v: '1.2.1', date: '2026-08', items: ['应用更名 Athena，美术全面换用新品牌视觉规范（新图标 / 新色板 / 深色主题）', '考研倒计时：上边栏常驻徽章 + 每日首次打开弹窗，考试日期可在设置中修改', '每日新卡数量上限（默认 10，设置可调），新卡不再一次性全部塞入学习队列', '新增「🗝️ 助记」行：政治 46 条 / 数三 9 条 / 统计 5 条背诵口诀', '新增时政分类（v1.2.2 起改为仅 2026 年时政大事）'] },
    { v: '1.2.0', date: '2026-08', items: ['新增政治学科：马原（哲学/政经/科社）、毛中特、史纲、思修·法治共 180 张背诵卡 + 8 张分析题答题套路卡', 'UI 按背诵类学科适配（搜索/自测/考查方式文案），政治专属红色主题'] },
    { v: '1.1.3', date: '2026-08', items: ['三科各新增 3 张解题套路卡（共 9 张）', '热力图可点开查看每日复习明细，导出/导入保留统计日志'] },
    { v: '1.1.0', date: '2026-07', items: ['思维导图支持缩放（按钮 / Ctrl+滚轮）', '新增「统计」视图：学习日历热力图 / 平均掌握度趋势 / 各分类掌握度进度条', '模板卡各配 1 道真题'] },
    { v: '1.0.0', date: '2026-06', items: ['初始版本：数三公式记忆，含学习（SM-2 间隔重复 + 交错练习）/ 浏览 / 导图 / 自测 / 统计 / 记忆原理 / 设置', 'PWA 离线可用，支持导出 / 导入进度备份'] }
  ];

  // ---------------- 学科管理（多学科数据注册表） ----------------
  const SUBJECT_KEY = 'formula_app_subject';
  let currentSubjectId = null;
  let CATS = null, DATA = null, META = null;
  let EXAMPLES = {}, REL = {}, DEPTH = {}, PITFALL = {}, MNEM = {};

  function subjectList() { return window.SUBJECTS || {}; }
  // 学科内容类型：formula（公式学科）/ qa（背诵类学科，如政治），驱动界面文案适配
  function subjKind() {
    const s = subjectList()[currentSubjectId];
    return (s && s.kind) || 'formula';
  }
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
    PITFALL = subj.PITFALL || {};
    MNEM = subj.MNEM || {};
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

  function updateNavBadge() {
    const btn = document.querySelector('nav .nav-btn[data-arg="learn"]');
    if (!btn || !DB || !DATA) return;
    const due = stats().due;
    let badge = btn.querySelector('.nav-badge');
    if (due > 0) {
      if (!badge) { badge = el('span', 'nav-badge'); badge.textContent = String(due); btn.appendChild(badge); }
      else badge.textContent = String(due);
    } else if (badge) { badge.remove(); }
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

  function defaultCard() { return { reps: 0, ef: 2.5, ivl: 0, due: 0, lapses: 0, state: 'new', s: 0, notes: '' }; }

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
      if (typeof c.notes !== 'string') c.notes = '';
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
      if (typeof c.notes === 'string') out.notes = c.notes;
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
      browseCat = 'all'; browseQuery = ''; browseExpanded = {}; searchRefocus = false; browseMastery = 'all'; browseStars = 'all'; heatSel = null;
    }
    const fresh = { cards: {}, settings: { dailyNew: 10 }, log: {} };
    DATA.forEach(function (f) { fresh.cards[f.id] = sanitizeCard(payload.cards[f.id]); });
    if (payload.settings && typeof payload.settings.dailyNew === 'number') {
      fresh.settings.dailyNew = Math.max(1, Math.min(99, Math.round(payload.settings.dailyNew)));
    }
    if (payload.settings && typeof payload.settings.examDate === 'string') {
      fresh.settings.examDate = payload.settings.examDate;
    }
    if (payload.log && payload.log.checkins && typeof payload.log.checkins === 'object') {
      fresh.log.checkins = {};
      Object.keys(payload.log.checkins).forEach(function (k) { fresh.log.checkins[k] = true; });
    }
    if (payload.log && typeof payload.log === 'object') {
      ['daily', 'mastery', 'detail'].forEach(function (k) {
        if (payload.log[k] && typeof payload.log[k] === 'object') {
          fresh.log[k] = {};
          Object.keys(payload.log[k]).forEach(function (dk) {
            const v = payload.log[k][dk];
            if (k === 'detail') {
              fresh.log[k][dk] = (v && typeof v === 'object') ? JSON.parse(JSON.stringify(v)) : {};
            } else if (typeof v === 'number') {
              fresh.log[k][dk] = v;
            }
          });
        }
      });
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
  function markReviewed(id) {
    if (!DB.log.daily) DB.log.daily = {};
    const t = todayStr();
    DB.log.daily[t] = (DB.log.daily[t] || 0) + 1;
    if (id) {
      if (!DB.log.detail) DB.log.detail = {};
      if (!DB.log.detail[t]) DB.log.detail[t] = {};
      DB.log.detail[t][id] = (DB.log.detail[t][id] || 0) + 1;
    }
    saveDB();
  }
  function todayReviewed() {
    return (DB.log.daily && DB.log.daily[todayStr()]) || 0;
  }

  // ---------------- 考研倒计时 ----------------
  const EXAM_AUTO_MONTH = 11, EXAM_AUTO_DAY = 20; // 默认按每年 12 月 20 日（初试通常在 12 月下旬）
  function examDateObj() {
    const s = (DB && DB.settings && DB.settings.examDate) || '';
    if (s) {
      const d = new Date(s + 'T00:00:00');
      if (!isNaN(d.getTime())) return d;
    }
    const now = new Date();
    let d = new Date(now.getFullYear(), EXAM_AUTO_MONTH, EXAM_AUTO_DAY);
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    if (d < today) d = new Date(now.getFullYear() + 1, EXAM_AUTO_MONTH, EXAM_AUTO_DAY);
    return d;
  }
  function countdownDays() {
    const exam = examDateObj();
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    return Math.max(0, Math.round((exam - today) / 86400000));
  }
  function updateCountdown() {
    const badge = document.getElementById('countdownBadge');
    if (!badge || !DB) return;
    const d = countdownDays();
    badge.textContent = d === 0 ? '🎯 今天考研' : '📅 距考研 ' + d + ' 天';
    badge.title = '考试日期：' + fmtDate(examDateObj()) + (DB.settings && DB.settings.examDate ? '（手动设置，可在设置中修改）' : '（默认每年 12 月 20 日，可在设置中修改）');
    badge.classList.toggle('urgent', d > 0 && d <= 30);
  }
  const COUNTDOWN_SEEN_KEY = 'athena_countdown_seen';
  function maybeShowCountdownPopup() {
    try {
      if (localStorage.getItem(COUNTDOWN_SEEN_KEY) === todayStr()) return;
      localStorage.setItem(COUNTDOWN_SEEN_KEY, todayStr());
    } catch (e) {}
    showCountdownPopup();
  }
  function showCountdownPopup() {
    const d = countdownDays();
    const exam = examDateObj();
    const modal = el('div', 'countdown-modal');
    const backdrop = el('div', 'countdown-backdrop');
    backdrop.setAttribute('data-action', 'countdown-close');
    modal.appendChild(backdrop);
    const card = el('div', 'countdown-card');
    card.appendChild(el('div', 'countdown-hero', '📚'));
    card.appendChild(el('div', 'countdown-title', d === 0 ? '今天就是考研日！' : '距离考研还有'));
    if (d > 0) {
      const days = el('div', 'countdown-days');
      days.appendChild(el('span', 'countdown-num', String(d)));
      days.appendChild(el('span', 'countdown-unit', '天'));
      card.appendChild(days);
    }
    card.appendChild(el('p', 'muted', '考试日期：' + fmtDate(exam) + (DB.settings && DB.settings.examDate ? '（手动设置）' : '（默认每年 12 月 20 日）')));
    if (d > 0 && d <= 30) {
      card.appendChild(el('p', 'countdown-tip', '已进入冲刺阶段：稳住节奏，坚持每天复习，优先攻克高频与薄弱知识点。'));
    }
    const ok = el('button', 'btn primary', '开始学习');
    ok.setAttribute('data-action', 'countdown-close');
    card.appendChild(ok);
    modal.appendChild(card);
    document.body.appendChild(modal);
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
  function pitfallOf(id) { return (PITFALL && PITFALL[id]) || ''; }
  function mnemOf(id) { return (MNEM && MNEM[id]) || ''; }
  function exampleOf(id) { return (EXAMPLES && EXAMPLES[id]) || null; }
  function examplesOf(id) { const ex = EXAMPLES && EXAMPLES[id]; if (!ex) return []; return Array.isArray(ex) ? ex : [ex]; }
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
      c.due = now + ((metaOf(id)[0] >= 4) ? 5 : 10) * 60 * 1000; // 高星遗忘后 5 分钟再见，其余 10 分钟
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
  let heatSel = null;
  let mapScale = 1;
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
    const bar = el('div', 'stats-bar');
    bar.appendChild(el('span', 'stat', '今天已学习 ' + todayReviewed() + ' 张'));
    bar.appendChild(el('span', 'stat', '待复习 ' + s.due));
    bar.appendChild(el('span', 'stat', '平均掌握 ' + s.avg + '%'));
    bar.appendChild(el('span', 'stat', '已掌握 ' + s.mature));
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

  // 每日新卡配额（A1）：记录「今天已引入多少张新卡」，避免一轮塞进全部新卡
  function newIntroducedToday() {
    try {
      const l = (DB.log && DB.log.newToday) || {};
      const t = todayStr();
      return (l[t] && typeof l[t].n === 'number') ? l[t].n : 0;
    } catch (e) { return 0; }
  }
  function markNewIntroduced(n) {
    try {
      if (!DB.log) DB.log = {};
      if (!DB.log.newToday) DB.log.newToday = {};
      const t = todayStr();
      const l = DB.log.newToday[t] || { n: 0 };
      l.n += n;
      DB.log.newToday[t] = l;
      saveDB();
    } catch (e) {}
  }
  function dailyNewLimit() {
    return Math.max(1, Math.min(99, (DB.settings && typeof DB.settings.dailyNew === 'number') ? DB.settings.dailyNew : 10));
  }

  function buildSession() {
    const now = Date.now();
    const all = DATA.map(function (f) { return f.id; });
    const due = all.filter(function (id) {
      const c = card(id);
      return (c.state === 'review' || c.state === 'learn') && c.due <= now;
    });
    due.sort(function (a, b) {
      const sa = metaOf(a)[0] || 0, sb = metaOf(b)[0] || 0;
      if (sb !== sa) return sb - sa;
      return card(a).due - card(b).due;
    });
    // 新卡：今天最多引入 dailyNew 张，超出部分顺延到明天
    const fresh = interleave(all.filter(function (id) { return card(id).state === 'new'; }));
    const quota = Math.max(0, dailyNewLimit() - newIntroducedToday());
    const chosenNew = fresh.slice(0, quota);
    if (chosenNew.length) markNewIntroduced(chosenNew.length);
    const freshLater = fresh.slice(quota);
    const rest = interleave(all.filter(function (id) {
      return due.indexOf(id) === -1 && chosenNew.indexOf(id) === -1 && freshLater.indexOf(id) === -1;
    }));
    deck = due.concat(chosenNew, rest);
    pos = 0;
    frontier = 0;
    pendingAdvance = false;
    seenAgain = {};
    saveSession();
  }

  function surfaceDue() {
    if (!deck.length || frontier >= deck.length) return;
    const now = Date.now();
    const head = deck.slice(0, frontier);
    const tail = deck.slice(frontier);
    const due = tail.filter(function (id) {
      const c = card(id);
      return (c.state === 'review' || c.state === 'learn') && c.due <= now;
    });
    if (!due.length) return;
    const rest = tail.filter(function (id) { return due.indexOf(id) === -1; });
    deck = head.concat(due, rest);
  }

  function renderLearn() {
    const app = document.getElementById('app');
    surfaceDue();
    app.appendChild(statsBar());

    const done = (deck.length === 0) || (frontier >= deck.length && pos >= frontier);
    if (done) {
      const wrap = el('div', 'center-card');
      wrap.appendChild(el('h2', null, '🎉 本轮已完成'));
      const remainNew = DATA.filter(function (f) { return card(f.id).state === 'new'; }).length;
      if (deck.length === 0) {
        wrap.appendChild(el('p', 'muted', '今日到期复习已清空，新卡额度已用完——明天再来解锁新知识点。'));
      } else {
        wrap.appendChild(el('p', 'muted', '已完成 ' + deck.length + ' 个知识点的一轮学习。'));
        if (remainNew > 0) {
          wrap.appendChild(el('p', 'muted', '还有 ' + remainNew + ' 张新知识点将在明天开放（每日上限 ' + dailyNewLimit() + ' 张）。'));
        }
      }
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

    const extras = buildExtras(id, reviewed ? '' : ' hidden');
    if (extras) cardEl.appendChild(extras);

    const hint = el('div', 'hint muted' + (reviewed ? '' : ' hidden'),
      reviewed
        ? (pendingAdvance ? '✅ ' + masteryDeltaText() + '，' + scheduleText(st) + '，点击「下一张」继续。' : '这是你已复习过的卡片（答案已展示），点「回到当前卡片」继续。')
        : '回想后再点击「显示答案」核对，主动回忆效果最佳。');
    cardEl.appendChild(hint);

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
    const nb = app.querySelector('.notes-box');
    if (nb) nb.classList.remove('hidden');
    const pb = app.querySelector('.pitfall-box');
    if (pb) pb.classList.remove('hidden');
    const mb = app.querySelector('.mnem-box');
    if (mb) mb.classList.remove('hidden');
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
    markReviewed(id);
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
    search.placeholder = subjKind() === 'qa' ? '搜索知识点（名称 / 内容）…' : '搜索公式（名称 / 内容）…';
    search.value = browseQuery;
    search.addEventListener('input', function () { browseQuery = search.value; searchRefocus = true; renderApp(); });
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
    if (n === 0) list.appendChild(el('p', 'muted', subjKind() === 'qa' ? '没有匹配的知识点。' : '没有匹配的公式。'));
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
      const extras = buildExtras(f.id, '');
      if (extras) body.appendChild(extras);
      const reset = el('button', 'btn small danger', '重置此卡片进度');
      reset.setAttribute('data-action', 'resetcard');
      reset.setAttribute('data-arg', f.id);
      body.appendChild(reset);
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
  function renderSettings() {
    const app = document.getElementById('app');
    const wrap = el('div', 'settings-wrap');

    const s1 = el('div', 'setting-row');
    s1.appendChild(el('span', null, '每日新卡数量'));
    const num = el('input', 'num');
    num.type = 'number'; num.min = 1; num.max = 99;
    num.value = dailyNewLimit();
    num.addEventListener('change', function () {
      const v = Math.max(1, Math.min(99, Math.round(parseInt(num.value, 10) || 10)));
      num.value = v;
      DB.settings.dailyNew = v;
      saveDB();
      toast('每日新卡数量已设为 ' + v);
    });
    s1.appendChild(num);
    wrap.appendChild(s1);
    wrap.appendChild(el('p', 'muted', '每天最多引入的新知识点数量（默认 10）。当日额度用完后，其余新卡顺延到次日开放，避免新卡一次性堆积。'));

    const s4 = el('div', 'setting-row');
    s4.appendChild(el('span', null, '考研日期'));
    const examInput = el('input', 'num');
    examInput.type = 'date';
    examInput.style.width = '158px';
    examInput.value = (DB.settings && DB.settings.examDate) || '';
    examInput.title = '留空则自动按每年 12 月 20 日（考研初试通常在 12 月下旬）';
    examInput.addEventListener('change', function () {
      DB.settings.examDate = examInput.value || '';
      saveDB();
      updateCountdown();
      toast(examInput.value ? '考研日期已设为 ' + examInput.value : '已恢复自动（每年 12 月 20 日）');
    });
    s4.appendChild(examInput);
    wrap.appendChild(s4);
    wrap.appendChild(el('p', 'muted', '用于顶部倒计时与每日首启弹窗。留空 = 自动取最近一个 12 月下旬的考研初试日。'));

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

    const s5 = el('div', 'setting-row changelog-row');
    s5.appendChild(el('span', null, '📜 更新日志'));
    const tog = el('button', 'btn small', '展开');
    tog.setAttribute('data-action', 'togglog');
    s5.appendChild(tog);
    wrap.appendChild(s5);
    wrap.appendChild(el('p', 'muted', '记录每个版本的修改内容，当前版本高亮。'));

    const cl = el('div', 'changelog-body hidden');
    CHANGELOG.forEach(function (entry) {
      const row = el('div', 'changelog-item' + (entry.v === VERSION ? ' current' : ''));
      row.appendChild(el('span', 'changelog-badge', 'v' + entry.v));
      const right = el('div', 'changelog-main');
      right.appendChild(el('span', 'changelog-date', entry.date));
      const list = el('ul', 'changelog-items');
      entry.items.forEach(function (it) { list.appendChild(el('li', null, it)); });
      right.appendChild(list);
      row.appendChild(right);
      cl.appendChild(row);
    });
    wrap.appendChild(cl);

    app.appendChild(wrap);
  }

  // ---------------- 记忆原理视图 ----------------
  function snapshotMastery() {
    if (!DB || !DATA) return;
    const t = todayStr();
    if (!DB.log.mastery) DB.log.mastery = {};
    if (DB.log.mastery[t] == null) {
      DB.log.mastery[t] = stats().avg;
      saveDB();
    }
  }

  function renderStatistics() {
    const app = document.getElementById('app');
    const wrap = el('div', 'principles-wrap');
    wrap.appendChild(el('h2', null, '📈 学习统计'));

    wrap.appendChild(el('h3', null, '🔥 学习日历（近 16 周）'));
    const daily = (DB.log && DB.log.daily) || {};
    const detailLog = (DB.log && DB.log.detail) || {};
    const weeks = 16, total = weeks * 7;
    const start = new Date(); start.setDate(start.getDate() - (total - 1));
    const grid = el('div', 'heatmap-grid');
    grid.style.gridTemplateColumns = 'repeat(' + weeks + ', 12px)';
    for (let d = 0; d < total; d++) {
      const date = new Date(start); date.setDate(start.getDate() + d);
      const key = fmtDate(date), cnt = daily[key] || 0;
      const cell = el('div', 'heat-cell');
      cell.title = key + '：' + cnt + ' 张' + (cnt > 0 ? '（点击查看当日明细）' : '');
      cell.className += cnt >= 8 ? ' l4' : cnt >= 5 ? ' l3' : cnt >= 2 ? ' l2' : cnt > 0 ? ' l1' : ' l0';
      if (cnt > 0) {
        cell.classList.add('clickable');
        cell.setAttribute('data-action', 'heatdate');
        cell.setAttribute('data-arg', key);
      }
      if (heatSel === key) cell.classList.add('sel');
      grid.appendChild(cell);
    }
    const hb = el('div', 'stat-card'); hb.appendChild(grid);
    hb.appendChild(el('p', 'muted', '颜色越深，当天学习张数越多；点击有记录的格子可查看当日明细。'));
    wrap.appendChild(hb);

    if (heatSel) {
      const selCnt = daily[heatSel] || 0;
      const det = el('div', 'stat-card heat-detail');
      const dhead = el('div', 'heat-detail-head');
      dhead.appendChild(el('strong', null, '📅 ' + heatSel + ' · 共复习 ' + selCnt + ' 张'));
      const dclose = el('button', 'btn small', '关闭');
      dclose.setAttribute('data-action', 'heatclose');
      dhead.appendChild(dclose);
      det.appendChild(dhead);
      const detail = detailLog[heatSel] || {};
      const ids = Object.keys(detail).filter(function (id) { return DATA.some(function (f) { return f.id === id; }); });
      if (ids.length) {
        ids.sort(function (a, b) { return detail[b] - detail[a]; });
        const list = el('div', 'heat-detail-list');
        ids.forEach(function (id) {
          const f = DATA.find(function (x) { return x.id === id; });
          const row = texEl('button', 'chip heat-item', f.title + ' ×' + detail[id]);
          row.setAttribute('data-action', 'jump');
          row.setAttribute('data-arg', id);
          list.appendChild(row);
        });
        det.appendChild(list);
        det.appendChild(el('p', 'muted', '点击知识点可跳转到浏览页查看完整卡片。'));
      } else {
        det.appendChild(el('p', 'muted', '当天复习 ' + selCnt + ' 张。单卡明细从本次更新后开始记录，历史日期的明细暂未保留。'));
      }
      wrap.appendChild(det);
    }

    wrap.appendChild(el('h3', null, '📈 平均掌握度趋势'));
    const mlog = (DB.log && DB.log.mastery) || {};
    const keys = Object.keys(mlog).sort();
    const tc = el('div', 'stat-card');
    if (keys.length < 2) {
      tc.appendChild(el('p', 'muted', '数据积累中——每天打开应用会自动记录一次平均掌握度，几天后这里会显示趋势折线。'));
    } else {
      const W = 680, H = 170, pad = 26;
      const vals = keys.map(function (k) { return mlog[k]; });
      const mn = Math.min.apply(null, vals), mx = Math.max.apply(null, vals), rg = (mx - mn) || 1;
      const svg = svgEl('svg', { viewBox: '0 0 ' + W + ' ' + H, width: '100%' });
      const pts = keys.map(function (k, i) {
        const x = pad + i * (W - 2 * pad) / (keys.length - 1);
        const y = H - pad - (mlog[k] - mn) / rg * (H - 2 * pad);
        return [x, y];
      });
      svg.appendChild(svgEl('path', { d: 'M ' + pts.map(function (p) { return p[0] + ' ' + p[1]; }).join(' L '), fill: 'none', stroke: '#378ADD', 'stroke-width': '2' }));
      pts.forEach(function (p) { svg.appendChild(svgEl('circle', { cx: p[0], cy: p[1], r: '2.5', fill: '#378ADD' })); });
      tc.appendChild(svg);
      tc.appendChild(el('p', 'muted', '共 ' + keys.length + ' 天记录，最新平均掌握度 ' + vals[vals.length - 1] + '%。'));
    }
    wrap.appendChild(tc);

    wrap.appendChild(el('h3', null, '📊 各分类掌握度'));
    const cc = el('div', 'stat-card');
    catOrder().forEach(function (c) {
      const avg = categoryAvg(c);
      const row = el('div', 'cat-bar-row');
      row.appendChild(el('span', 'cat-bar-name', CATS[c]));
      const bar = el('div', 'cat-bar');
      const fill = el('div', 'cat-bar-fill');
      fill.style.width = avg + '%';
      fill.style.background = masteryColor(avg);
      bar.appendChild(fill);
      row.appendChild(bar);
      row.appendChild(el('span', 'cat-bar-val', avg + '%'));
      cc.appendChild(row);
    });
    wrap.appendChild(cc);

    app.appendChild(wrap);
  }

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
    if (pct < 1) return '#EDEBE4';
    if (pct < 25) return '#D3D1C7';
    if (pct < 45) return '#B5D4F4';
    if (pct < 65) return '#76AFE8';
    if (pct < 85) return '#378ADD';
    if (pct < 95) return '#2A75C0';
    return '#D4537E'; // 樱粉=已记牢（与品牌对勾同色）
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
    p.style.cssText = 'position:absolute;transform:translate(-50%,-50%);display:flex;align-items:center;justify-content:center;text-align:center;line-height:1.25;box-sizing:border-box;left:' + x + 'px;top:' + y + 'px;width:' + Math.ceil(w) + 'px;height:' + Math.ceil(h) + 'px;background:radial-gradient(circle at 30% 25%, rgba(255,255,255,.92), ' + fill + ' 55%, ' + fill + ');border:' + (ring ? '3px solid #378ADD' : '1.3px solid #E4E1D8') + ';color:' + color + ';font-size:' + fontSize + 'px;font-weight:600;border-radius:' + Math.ceil(h / 2) + 'px;cursor:pointer;';
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
  function catOrder() {
    const subj = subjectList()[currentSubjectId];
    return (subj && Array.isArray(subj.ORDER) && subj.ORDER.length) ? subj.ORDER : Object.keys(CATS);
  }

  function renderMap() {
    const app = document.getElementById('app');
    const subj = subjectList()[currentSubjectId];
    const cats = catOrder();
    if (!mapCat || !CATS[mapCat]) mapCat = cats[0];
    const cards = DATA.filter(function (f) { return f.cat === mapCat; });

    const wrap = el('div', 'map-wrap');
    const bar = el('div', 'map-toolbar');
    bar.appendChild(el('strong', null, (subj ? subj.icon + ' ' + subj.name : '') + ' · 思维导图'));
    bar.appendChild(el('span', 'muted', '拖动/滚动查看 · Ctrl+滚轮或按钮缩放 · 点分类展开 · 点知识点看详情'));
    const zoom = el('span', 'map-zoom-ctrl');
    const mkz = function (label, arg) { const b = el('button', 'btn small', label); b.setAttribute('data-action', 'mapzoom'); b.setAttribute('data-arg', arg); zoom.appendChild(b); };
    mkz('−', 'out'); mkz('＋', 'in'); mkz('⟲', 'reset');
    bar.appendChild(zoom);
    wrap.appendChild(bar);

    const rowH = 48;
    const W = 1180;
    const H = Math.max(860, (Math.max(cats.length, cards.length) + 2) * rowH + 40);
    const scroll = el('div', 'map-scroll');
    const zoomWrap = el('div', 'map-zoom');
    zoomWrap.style.width = (W * mapScale) + 'px';
    zoomWrap.style.height = (H * mapScale) + 'px';
    const canvas = el('div', 'map-canvas');
    canvas.style.width = W + 'px';
    canvas.style.height = H + 'px';
    canvas.style.transform = 'scale(' + mapScale + ')';
    canvas.style.transformOrigin = '0 0';
    const svg = svgEl('svg', { viewBox: '0 0 ' + W + ' ' + H, width: '100%', height: '100%' });
    svg.style.cssText = 'position:absolute;left:0;top:0;pointer-events:none;';
    canvas.appendChild(svg);
    zoomWrap.appendChild(canvas);
    scroll.appendChild(zoomWrap);

    const root = mapPillHtml(90, H / 2, subj ? subj.name : '', '#D4537E', '#fff', false, subj ? subj.name : '', '18');
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
      svg.appendChild(mapEdge(90, H / 2, root.w, root.h, catX, y, p.w, p.h, '#DCD9D0'));
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
      const fill = sel ? '#D4537E' : masteryColor(mp);
      const txt = (sel || mp >= 85) ? '#fff' : '#1c2333';
      const p = mapPillHtml(cardX, y, f.title, fill, txt, sel, f.title + ' · 掌握 ' + mp + '%', '13');
      svg.appendChild(mapEdge(base.x, base.y, base.w, base.h, cardX, y, p.w, p.h, '#DCD9D0'));
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
    const cont = el('div', 'map-card-content');
    cont.appendChild(el('div', 'mini-label', '💡 提示'));
    const fq = el('div', 'map-front'); renderTex(fq, f.front); cont.appendChild(fq);
    cont.appendChild(el('div', 'mini-label', '答案'));
    const fa = el('div', 'map-back'); renderTex(fa, f.back); cont.appendChild(fa);
    panel.appendChild(cont);
    panel.appendChild(el('p', 'muted', (subjKind() === 'qa' ? '📌 考查方式：' : '📌 常考题型：') + metaOf(f.id)[1]));
    const mn = mnemOf(f.id);
    if (mn) {
      const mb = el('div', 'mnem-box');
      mb.appendChild(el('span', 'mnem-label', '🗝️ 助记：'));
      mb.appendChild(texEl('span', null, mn));
      panel.appendChild(mb);
    }
    const pf = pitfallOf(f.id);
    if (pf) {
      const pfb = el('div', 'pitfall-box');
      pfb.appendChild(el('span', 'pitfall-label', '⚠️ 常见陷阱：'));
      pfb.appendChild(texEl('span', null, pf));
      panel.appendChild(pfb);
    }
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
    const exs = examplesOf(f.id);
    exs.forEach(function (ex, i) {
      const eb = el('div', 'example-box');
      const label = exs.length > 1 ? ('📝 ' + (ex.src ? '真题' : '例题') + ' ' + (i + 1)) : (ex.src ? '📝 真题' : '📝 经典例题');
      eb.appendChild(el('div', 'example-label', label));
      const q = el('div', 'example-q'); renderTex(q, ex.q); eb.appendChild(q);
      eb.appendChild(el('div', 'mini-label', '解析'));
      const a = el('div', 'example-a'); renderTex(a, ex.a); eb.appendChild(a);
      if (ex.a2) {
        eb.appendChild(el('div', 'mini-label', '💡 巧解'));
        const a2 = el('div', 'example-a'); renderTex(a2, ex.a2); eb.appendChild(a2);
      }
      if (ex.src) eb.appendChild(el('div', 'example-src', '📚 来源：' + ex.src));
      panel.appendChild(eb);
    });
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
      case 'countdown-close': {
        const m = document.querySelector('.countdown-modal');
        if (m) m.remove();
        break;
      }
      case 'mapzoom':
        if (arg === 'in') mapScale = Math.min(2.5, mapScale + 0.2);
        else if (arg === 'out') mapScale = Math.max(0.4, mapScale - 0.2);
        else mapScale = 1;
        renderApp();
        break;
      case 'heatdate':
        heatSel = arg;
        renderApp();
        break;
      case 'heatclose':
        heatSel = null;
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
        a.download = (subj ? subj.short : '公式') + (subjKind() === 'qa' ? '知识点记忆-备份.json' : '公式记忆-备份.json');
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
      case 'togglog': {
        const body = document.querySelector('.changelog-body');
        if (!body) break;
        const hidden = body.classList.toggle('hidden');
        const btn = document.querySelector('[data-action="togglog"]');
        if (btn) btn.textContent = hidden ? '展开' : '收起';
        break;
      }
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
  function inScrollable(t) {
    let n = t;
    while (n && n !== document.body && n.nodeType === 1) {
      const cs = getComputedStyle(n);
      if ((cs.overflowX === 'auto' || cs.overflowX === 'scroll') && n.scrollWidth > n.clientWidth + 2) return true;
      n = n.parentElement;
    }
    return false;
  }
  document.addEventListener('touchstart', function (e) {
    if (currentView !== 'learn') return;
    if (e.touches.length === 1) touchStart = { x: e.touches[0].clientX, y: e.touches[0].clientY, scroll: inScrollable(e.target) };
  }, { passive: true });
  document.addEventListener('touchend', function (e) {
    if (currentView !== 'learn' || !touchStart) return;
    const dx = e.changedTouches[0].clientX - touchStart.x;
    const dy = e.changedTouches[0].clientY - touchStart.y;
    const wasScroll = touchStart.scroll;
    touchStart = null;
    if (wasScroll) return; // 公式/内容横向滚动时，不触发卡片翻页
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

  // 沉浸模式
  const itBtn = document.getElementById('immersiveToggle');
  if (itBtn) itBtn.addEventListener('click', function () { document.body.classList.toggle('immersive'); });
  const ieBtn = document.getElementById('immersiveExit');
  if (ieBtn) ieBtn.addEventListener('click', function () { document.body.classList.remove('immersive'); });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') document.body.classList.remove('immersive');
  });

  // 导图 Ctrl+滚轮缩放
  document.addEventListener('wheel', function (e) {
    if (currentView !== 'map' || !e.ctrlKey) return;
    e.preventDefault();
    if (e.deltaY < 0) mapScale = Math.min(2.5, mapScale + 0.15);
    else mapScale = Math.max(0.4, mapScale - 0.15);
    renderApp();
  }, { passive: false });

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
    mapCat = null; mapSel = null; mapScale = 1; mapTx = 0; mapTy = 0; heatSel = null;
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
      setTimeout(maybeShowCountdownPopup, 350);
    });
  }

  const subjectSelect = document.getElementById('subjectSelect');
  if (subjectSelect) {
    subjectSelect.addEventListener('change', function () { switchSubject(subjectSelect.value); });
  }

  initApp();
  bootKatex(0);
})();
