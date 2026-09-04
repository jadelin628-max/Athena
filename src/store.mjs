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
    if (!DB || !DATA) return;
    const due = stats().due;
    document.querySelectorAll('.nav-btn[data-arg="learn"]').forEach(function (btn) {
      let badge = btn.querySelector('.nav-badge');
      if (due > 0) {
        if (!badge) { badge = el('span', 'nav-badge'); badge.textContent = String(due); btn.appendChild(badge); }
        else badge.textContent = String(due);
      } else if (badge) { badge.remove(); }
    });
  }

  // ---------------- KaTeX 加载（多 CDN 自动回退） ----------------
  const THEME_KEY = 'ms3_formula_theme';
  let DB = null;

  function defaultCard() { return { reps: 0, ef: 2.5, ivl: 0, due: 0, lapses: 0, state: 'new', s: 0, grad: 0, step: 0, diff: 5, stab: 0, fsrsInit: 0, notes: '', hist: [], lastR: 0, ivlR: 0 }; }

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
    DB = (raw && typeof raw === 'object') ? raw : { cards: {}, settings: {}, log: {} };
    if (!DB.cards) DB.cards = {};
    if (!DB.settings) DB.settings = {};
    if (DB.settings.dailyNew == null) DB.settings.dailyNew = 10;
    if (DB.settings.minutesPerDay == null) DB.settings.minutesPerDay = MIN_PER_DAY_DEFAULT;
    // 旧版本用 targetH（半衰期天）作为固定毕业目标；迁移到 targetS（稳定度天）。
    //   旧 90 天半衰期 ≈ 90/K ≈ 1 天稳定度，语义已变：直接采用新默认值（不再沿用旧数值，避免误把「半衰期天」当「稳定度天」）。
    if (DB.settings.targetS == null) DB.settings.targetS = TARGET_S_DEFAULT;
    if (DB.settings.targetH != null) delete DB.settings.targetH;
    if (DB.settings.targetLinkExam == null) DB.settings.targetLinkExam = true;
    if (DB.settings.goalTitle == null) DB.settings.goalTitle = GOAL_DEFAULT;
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
  // 合并写：同一轮事件里的多次 saveDB 只落一次盘（iOS 稳定性优先）。
  let saveDirty = false;
  let saveFlushScheduled = false;
  let idbBackupTimer = null;
  function flushSave() {
    if (!DB) return;
    saveDirty = false;
    saveFlushScheduled = false;
    const json = JSON.stringify(DB);
    try { localStorage.setItem(dbKey(), json); } catch (e) {}
    // IndexedDB 作为低频备份：防抖 2s，避免每次评分都全量写 IDB
    if (idbBackupTimer) clearTimeout(idbBackupTimer);
    idbBackupTimer = setTimeout(function () {
      idbBackupTimer = null;
      try { idbSet(dbKey(), DB); } catch (e) {}
    }, 2000);
  }
  function saveDB() {
    if (saveFlushScheduled) { saveDirty = true; return; }
    saveDirty = true;
    saveFlushScheduled = true;
    if (typeof queueMicrotask === 'function') {
      queueMicrotask(function () { if (saveDirty) flushSave(); });
    } else {
      Promise.resolve().then(function () { if (saveDirty) flushSave(); });
    }
    // 兜底：即使微任务被推迟，也保证在下一轮 timer 里落盘
    setTimeout(function () { if (saveDirty) flushSave(); }, 0);
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
      if (typeof c.grad === 'number') out.grad = c.grad;
      if (typeof c.step === 'number') out.step = c.step;
      if (typeof c.diff === 'number') out.diff = c.diff;
      if (typeof c.stab === 'number') out.stab = c.stab;
      if (c.fsrsInit) out.fsrsInit = 1;
      if (Array.isArray(c.hist)) out.hist = c.hist.map(function (h) { return { t: h.t, m: h.m, ivl: h.ivl || 0 }; });
      if (typeof c.lastR === 'number') out.lastR = c.lastR;
      if (typeof c.ivlR === 'number') out.ivlR = c.ivlR;
      if (c.state === 'new' || (c.state === 'learning' || c.state === 'relearning') || c.state === 'relearning' || c.state === 'review') out.state = c.state;
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
      browseCat = 'all'; browseQuery = ''; browseExpanded = {}; browseMastery = 'all'; browseStars = 'all'; heatSel = null;
    }
    const fresh = { cards: {}, settings: {}, log: {} };
    DATA.forEach(function (f) { fresh.cards[f.id] = sanitizeCard(payload.cards[f.id]); });
    if (payload.settings && typeof payload.settings.dailyNew === 'number') {
      fresh.settings.dailyNew = Math.max(1, Math.min(99, Math.round(payload.settings.dailyNew)));
    }
    if (payload.settings && typeof payload.settings.minutesPerDay === 'number') {
      fresh.settings.minutesPerDay = Math.max(5, Math.min(120, Math.round(payload.settings.minutesPerDay)));
    }
    if (payload.settings && typeof payload.settings.targetS === 'number') {
      fresh.settings.targetS = Math.max(7, Math.min(730, Math.round(payload.settings.targetS)));
    }
    if (payload.settings && typeof payload.settings.targetLinkExam === 'boolean') {
      fresh.settings.targetLinkExam = payload.settings.targetLinkExam;
    }
    if (payload.settings && typeof payload.settings.goalTitle === 'string') {
      fresh.settings.goalTitle = payload.settings.goalTitle.trim() || GOAL_DEFAULT;
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
