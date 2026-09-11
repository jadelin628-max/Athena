  function subjectList() { return window.SUBJECTS || {}; }
  // 学科图标（assets/subject_icon/，无对应图则回退 emoji）
  const SUBJECT_ICON_URLS = {
    math3: 'assets/subject_icon/icon-math.svg',
    econ: 'assets/subject_icon/icon-economics.svg',
    stats: 'assets/subject_icon/icon-statistics.svg',
    politics: 'assets/subject_icon/icon-politics.svg'
  };
  function subjectIconUrl(id) { return SUBJECT_ICON_URLS[id] || null; }
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
    BASE_SUBJ = subj;
    META = subj.META;
    EXAMPLES = subj.EXAMPLE || {};
    REL = subj.REL || {};
    PITFALL = subj.PITFALL || {};
    MNEM = subj.MNEM || {};
    try { localStorage.setItem(SUBJECT_KEY, subj.id); } catch (e) { warnStorageFailure(); }
    document.title = subj.name;
    renderSubjectDropdown();
    document.body.setAttribute('data-subject', subj.id);
    const url = subjectIconUrl(subj.id);
    document.body.style.setProperty('--subject-watermark', url ? 'url("' + url + '")' : 'none');
    return true;
  }
  function dbKey() { return currentSubjectId + '_formula_srs_v1'; }
  function sessionKey() { return currentSubjectId + '_formula_session_v2'; }

  // 把总体掌握度写进左上角学科选择器内的百分比徽标（每轮渲染随统计刷新）
  function updateBrand() {
    const pct = document.getElementById('subjectPct');
    if (!pct || !currentSubjectId || !DB || !DATA) return;
    pct.textContent = stats().avg + '%';
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

  function defaultCard() { return { reps: 0, ivl: 0, due: 0, lapses: 0, state: 'new', grad: 0, step: 0, diff: 5, stab: 0, fsrsInit: 0, notes: '', hist: [], lastR: 0, ivlR: 0 }; }

  // 错题卡（独立于知识卡，复用 FSRS 调度状态 + 题目字段）
  function defaultWrongCard() { return { reps: 0, ivl: 0, due: 0, lapses: 0, state: 'new', grad: 0, step: 0, diff: 5, stab: 0, fsrsInit: 0, kind: '错题', q: '', a: '', a2: '', src: '', linked: [], errType: '', lastSolveMs: 0, hist: [], lastR: 0, ivlR: 0 }; }
  function sanitizeWrongCard(w) {
    const out = defaultWrongCard();
    if (w && typeof w === 'object') {
      ['reps', 'ivl', 'due', 'lapses', 'grad', 'step', 'diff', 'stab', 'lastSolveMs', 'lastR', 'ivlR'].forEach(function (k) { if (typeof w[k] === 'number') out[k] = w[k]; });
      if (w.fsrsInit) out.fsrsInit = 1;
      out.kind = '错题'; // 难题分类已废除（v1.16.0），存量「难题」统一迁移
      if (typeof w.q === 'string') out.q = w.q;
      if (typeof w.a === 'string') out.a = w.a;
      if (typeof w.a2 === 'string') out.a2 = w.a2;
      if (typeof w.src === 'string') out.src = w.src;
      if (Array.isArray(w.linked)) out.linked = w.linked.filter(function (x) { return typeof x === 'string'; });
      if (typeof w.errType === 'string') out.errType = w.errType;
      if (Array.isArray(w.hist)) out.hist = w.hist.map(function (h) { return { t: h.t, m: h.m }; });
      if (w.state === 'new' || w.state === 'learning' || w.state === 'relearning' || w.state === 'review') out.state = w.state;
    }
    return out;
  }

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
    // 整体 schema 版本号：为将来大迁移留钩子（旧数据无此字段，一律补为当前版本 1）
    if (DB.schemaVersion == null) DB.schemaVersion = 1;
    if (!DB.cards) DB.cards = {};
    if (!DB.settings) DB.settings = {};
    if (DB.settings.dailyNew == null) DB.settings.dailyNew = 10;
    // 旧版本用 targetH（半衰期天）作为固定毕业目标；迁移到 targetS（稳定度天）。
    //   旧 90 天半衰期 ≈ 90/K ≈ 1 天稳定度，语义已变：直接采用新默认值（不再沿用旧数值，避免误把「半衰期天」当「稳定度天」）。
    if (DB.settings.targetS == null) DB.settings.targetS = TARGET_S_DEFAULT;
    if (DB.settings.targetH != null) delete DB.settings.targetH;
    if (DB.settings.targetLinkExam == null) DB.settings.targetLinkExam = true;
    if (DB.settings.fdr == null) DB.settings.fdr = 0.9; // 期望保留率（FSRS 间隔目标，设置可调 0.80–0.98）
    if (DB.settings.goalTitle == null) DB.settings.goalTitle = GOAL_DEFAULT;
    if (DB.settings.bareRecall == null) DB.settings.bareRecall = false;
    if (!DB.log) DB.log = {};
    if (!DB.log.counts) DB.log.counts = {}; // 每日完成量分类计数（n 新学 / r 复习 / w 错题重做）
    if (!DB.wrongs) DB.wrongs = {};
    if (!DB.custom) DB.custom = {};
    if (!DB.cardOverrides) DB.cardOverrides = {};
    if (!DB.customRel) DB.customRel = {};
    // 错题卡调度迁移（v1.16.0 重置为纯复习态）：学习/重学态 → 复习态；难题分类废除
    Object.keys(DB.wrongs).forEach(function (wid) {
      const w = DB.wrongs[wid];
      if (!w || typeof w !== 'object') return;
      if (w.kind === '难题') w.kind = '错题';
      if (w.state === 'learning' || w.state === 'relearning') w.state = 'review';
    });
    refreshData();
    DATA.forEach(function (f) {
      if (!DB.cards[f.id]) DB.cards[f.id] = defaultCard();
      const c = DB.cards[f.id];
      if (typeof c.notes !== 'string') c.notes = '';
    });
    saveDB(true); // 加载时的规范化回写不是数据修改：保留原 updatedAt，否则「最后打开时间」会冒充数据版本、破坏云同步的新旧判断
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
  // 把静态卡片 + 用户覆盖 + 用户自建卡片合成当前 DATA / META / EXAMPLE
  function refreshData() {
    const subj = BASE_SUBJ;
    if (!subj) return;
    const ov = (DB && DB.cardOverrides) || {};

    // DATA：静态卡应用覆盖（含隐藏）→ 追加自建卡
    DATA = subj.DATA
      .filter(function (f) { return !(ov[f.id] && ov[f.id].hidden); })
      .map(function (f) {
        const o = ov[f.id] || {};
        return {
          id: f.id,
          cat: (o.cat != null) ? o.cat : f.cat,
          title: (o.title != null) ? o.title : f.title,
          front: (o.front != null) ? o.front : f.front,
          back: (o.back != null) ? o.back : f.back
        };
      });
    if (DB && DB.custom) {
      Object.keys(DB.custom).forEach(function (id) {
        const c = DB.custom[id];
        if (c && c.id && typeof c.title === 'string' && typeof c.front === 'string' && typeof c.back === 'string') {
          DATA.push({ id: c.id, cat: c.cat || '?', title: c.title, front: c.front, back: c.back });
        }
      });
    }

    // META：star / examType 覆盖
    META = {};
    Object.keys(subj.META || {}).forEach(function (id) {
      const base = subj.META[id] || [3, '综合计算与应用'];
      const o = ov[id] || {};
      META[id] = [
        (o.star != null) ? o.star : base[0],
        (o.examType != null) ? o.examType : base[1]
      ];
    });

    // EXAMPLE：例题整段覆盖
    EXAMPLES = {};
    Object.keys(subj.EXAMPLE || {}).forEach(function (id) {
      EXAMPLES[id] = (ov[id] && Array.isArray(ov[id].examples)) ? ov[id].examples : subj.EXAMPLE[id];
    });

    // REL：静态 REL + 自建卡 REL
    REL = Object.assign({}, subj.REL || {});
    if (DB && DB.customRel) {
      Object.keys(DB.customRel).forEach(function (id) {
        if (DB.customRel[id] && DB.customRel[id].length) REL[id] = DB.customRel[id];
      });
    }
  }

  function sanitizeCustomCard(c) {
    if (!c || typeof c !== 'object' || typeof c.id !== 'string' || !c.id) return null;
    return {
      id: c.id,
      cat: (typeof c.cat === 'string') ? c.cat : '?',
      title: (typeof c.title === 'string') ? c.title : '',
      front: (typeof c.front === 'string') ? c.front : '',
      back: (typeof c.back === 'string') ? c.back : ''
    };
  }

  // 手动录入知识点（自建卡）：写入 DB.custom + DB.cards，立即合成进 DATA
  function saveCustomCard(title, front, back, cat, relList) {
    const t = (title || '').trim(), f = (front || '').trim(), b = (back || '').trim();
    if (!t || !f || !b) { toast('标题、提示、答案不能为空'); return false; }
    const id = 'cu_' + Date.now() + '_' + Math.floor(Math.random() * 10000);
    DB.custom[id] = { id: id, cat: cat || Object.keys(CATS)[0], title: t, front: f, back: b };
    DB.cards[id] = defaultCard();
    if (relList && relList.length) DB.customRel[id] = relList;
    refreshData();
    saveDB();
    renderApp();
    toast('已录入知识点');
    return true;
  }

  function sanitizeCardOverride(o) {
    if (!o || typeof o !== 'object') return null;
    const out = {};
    if (typeof o.title === 'string') out.title = o.title;
    if (typeof o.front === 'string') out.front = o.front;
    if (typeof o.back === 'string') out.back = o.back;
    if (typeof o.cat === 'string') out.cat = o.cat;
    if (typeof o.star === 'number') out.star = o.star;
    if (typeof o.examType === 'string') out.examType = o.examType;
    if (Array.isArray(o.examples)) out.examples = o.examples.filter(function (e) { return e && typeof e.q === 'string'; });
    if (o.hidden === true) out.hidden = true;
    return (Object.keys(out).length ? out : null);
  }

  // 保存对某张内置卡的覆盖（编辑题目/答案/标签/例题/隐藏）
  function saveCardOverride(id, o) {
    const ov = {};
    if (o.title != null) ov.title = String(o.title).trim();
    if (o.front != null) ov.front = String(o.front).trim();
    if (o.back != null) ov.back = String(o.back).trim();
    if (o.cat != null) ov.cat = o.cat;
    if (o.star != null) ov.star = o.star;
    if (o.examType != null) ov.examType = String(o.examType).trim();
    if (Array.isArray(o.examples) && o.examples.length) ov.examples = o.examples;
    if (o.hidden) ov.hidden = true;
    if (Object.keys(ov).length === 0) delete DB.cardOverrides[id];
    else DB.cardOverrides[id] = ov;
    refreshData();
    saveDB();
    renderApp();
    toast('已保存修改');
  }

  // 存储写失败告警（每次会话只提示一次）：配额满/隐私模式下丢的是学习进度，绝不能静默
  let storageWarned = false;
  function warnStorageFailure() {
    if (storageWarned) return;
    storageWarned = true;
    try { console.error('Athena: localStorage 写入失败（存储空间可能已满或处于隐私模式），学习进度无法保存！'); } catch (e) {}
    try { toast('⚠️ 学习进度写入失败（存储空间可能已满）——请立即到「设置」导出备份，避免进度丢失！'); } catch (e) {}
  }

  // 合并写：短时间窗口内的多次 saveDB 只落一次盘，且把序列化挪出评分点击的绘制路径。
  let saveDirty = false;
  let saveFlushScheduled = false;
  let saveKeepTimestamp = false; // 本次落盘是否保留原 updatedAt（加载时的规范化回写不算数据修改）
  let idbBackupTimer = null;
  function flushSave() {
    if (!DB || !saveDirty) return; // 无待写内容：不落盘、不刷新时间戳（纯刷新页面不应冒充数据修改）
    saveDirty = false;
    saveFlushScheduled = false;
    if (!saveKeepTimestamp) DB.updatedAt = Date.now(); // 同步时间戳（云同步「新者胜」的依据），只在真实修改时前进
    saveKeepTimestamp = false;
    let json = null;
    try { json = JSON.stringify(DB); } catch (e) { warnStorageFailure(); return; }
    try {
      localStorage.setItem(dbKey(), json);
      if (typeof scheduleSyncPush === 'function') scheduleSyncPush(); // 脏学科防抖推送（sync.mjs）
    } catch (e) {
      warnStorageFailure();
    }
    // IndexedDB 作为低频备份：防抖 2s，避免每次评分都全量写 IDB（idbSet 内部已吞异常，备份尽力而为）
    if (idbBackupTimer) clearTimeout(idbBackupTimer);
    idbBackupTimer = setTimeout(function () {
      idbBackupTimer = null;
      idbSet(dbKey(), DB);
    }, 2000);
  }
  // keepTimestamp=true：加载时的规范化回写，保留原 updatedAt（不算数据修改）
  function saveDB(keepTimestamp) {
    saveKeepTimestamp = !!keepTimestamp;
    saveDirty = true;
    if (saveFlushScheduled) return;
    saveFlushScheduled = true;
    // 延迟 100ms：让评分后的界面先绘制，再串行化落盘（大库时评分点击不再卡顿）；
    // 同窗口内的多次 saveDB 合并为一次写。切后台/关页由 pagehide/visibilitychange 兜底 flush。
    setTimeout(function () { if (saveDirty) flushSave(); }, 100);
  }

  function sanitizeCard(c) {
    const out = defaultCard();
    if (c && typeof c === 'object') {
      if (typeof c.reps === 'number') out.reps = c.reps;
      if (typeof c.ivl === 'number') out.ivl = c.ivl;
      if (typeof c.due === 'number') out.due = c.due;
      if (typeof c.lapses === 'number') out.lapses = c.lapses;
      if (typeof c.grad === 'number') out.grad = c.grad;
      if (typeof c.step === 'number') out.step = c.step;
      if (typeof c.diff === 'number') out.diff = c.diff;
      if (typeof c.stab === 'number') out.stab = c.stab;
      if (c.fsrsInit) out.fsrsInit = 1;
      if (Array.isArray(c.hist)) out.hist = c.hist.map(function (h) { return { t: h.t, m: h.m, ivl: h.ivl || 0 }; });
      if (typeof c.lastR === 'number') out.lastR = c.lastR;
      if (typeof c.ivlR === 'number') out.ivlR = c.ivlR;
      if (c.state === 'new' || c.state === 'learning' || c.state === 'relearning' || c.state === 'review') out.state = c.state;
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
      resetSessionState(); // 统一会话重置（含错题队列/导图/浏览过滤，避免上一学科状态残留）
    }
    const fresh = { schemaVersion: 1, cards: {}, settings: {}, log: {}, wrongs: {}, custom: {}, cardOverrides: {}, customRel: {} };
    DATA.forEach(function (f) { fresh.cards[f.id] = sanitizeCard(payload.cards[f.id]); });
    if (payload.settings && typeof payload.settings.dailyNew === 'number') {
      fresh.settings.dailyNew = Math.max(1, Math.min(99, Math.round(payload.settings.dailyNew)));
    }
    if (payload.settings && typeof payload.settings.targetS === 'number') {
      fresh.settings.targetS = Math.max(7, Math.min(730, Math.round(payload.settings.targetS)));
    }
    if (payload.settings && typeof payload.settings.fdr === 'number') {
      fresh.settings.fdr = Math.max(0.8, Math.min(0.98, payload.settings.fdr));
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
    if (payload.settings && typeof payload.settings.bareRecall === 'boolean') {
      fresh.settings.bareRecall = payload.settings.bareRecall;
    }
    if (payload.log && payload.log.checkins && typeof payload.log.checkins === 'object') {
      fresh.log.checkins = {};
      Object.keys(payload.log.checkins).forEach(function (k) { fresh.log.checkins[k] = true; });
    }
    if (payload.log && typeof payload.log === 'object') {
      ['daily', 'mastery', 'detail', 'counts'].forEach(function (k) {
        if (payload.log[k] && typeof payload.log[k] === 'object') {
          fresh.log[k] = {};
          Object.keys(payload.log[k]).forEach(function (dk) {
            const v = payload.log[k][dk];
            if (k === 'detail' || k === 'counts') {
              fresh.log[k][dk] = (v && typeof v === 'object') ? JSON.parse(JSON.stringify(v)) : {};
            } else if (typeof v === 'number') {
              fresh.log[k][dk] = v;
            }
          });
        }
      });
    }
    if (payload.wrongs && typeof payload.wrongs === 'object') {
      Object.keys(payload.wrongs).forEach(function (wid) {
        if (payload.wrongs[wid] && typeof payload.wrongs[wid] === 'object') {
          fresh.wrongs[wid] = sanitizeWrongCard(payload.wrongs[wid]);
        }
      });
    }
    if (payload.custom && typeof payload.custom === 'object') {
      Object.keys(payload.custom).forEach(function (id) {
        const c = sanitizeCustomCard(payload.custom[id]);
        if (c) fresh.custom[id] = c;
      });
    }
    if (payload.cardOverrides && typeof payload.cardOverrides === 'object') {
      Object.keys(payload.cardOverrides).forEach(function (id) {
        const o = sanitizeCardOverride(payload.cardOverrides[id]);
        if (o) fresh.cardOverrides[id] = o;
      });
    }
    if (payload.customRel && typeof payload.customRel === 'object') {
      Object.keys(payload.customRel).forEach(function (id) {
        const arr = payload.customRel[id];
        if (Array.isArray(arr)) {
          fresh.customRel[id] = arr.filter(function (e) { return e && typeof e.to === 'string' && typeof e.tag === 'string'; });
        }
      });
    }
    DB = fresh;
    refreshData();
    saveDB();
  }

  // 导出全部科目：把每个学科的 DB 序列化到单个对象（多平台互通备份）
  function exportAllSubjects() {
    const out = {};
    Object.keys(subjectList()).forEach(function (sid) {
      const key = sid + '_formula_srs_v1';
      let db = null;
      try { db = JSON.parse(localStorage.getItem(key)); } catch (e) {}
      out[sid] = (db && typeof db === 'object') ? db : { cards: {}, settings: {}, log: {} };
    });
    return out;
  }
  // 导入全部科目：把 { sid: db } 写入各科 localStorage + IndexedDB；返回成功写入的科目数。
  // 写入失败的学科不计入成功数（调用方以此判断是否提示），并触发存储告警。
  function importAllSubjects(data) {
    const subs = data && data.subjects;
    if (!subs || typeof subs !== 'object') throw new Error('文件格式不正确（缺少 subjects 数据）');
    const list = subjectList();
    let count = 0;
    let failed = false;
    Object.keys(subs).forEach(function (sid) {
      if (!list[sid]) return; // 跳过本应用不认识的学科
      const db = subs[sid];
      if (!db || typeof db !== 'object' || typeof db.cards !== 'object') return;
      const key = sid + '_formula_srs_v1';
      let ok = true;
      try { localStorage.setItem(key, JSON.stringify(db)); } catch (e) { ok = false; }
      if (!ok) { failed = true; return; }
      idbSet(key, db);
      count++;
    });
    if (failed) warnStorageFailure();
    return count;
  }
