  // ---------------- 行动设置（H4 · 与学习库隔离） ----------------
  // 与 H1–H3 同 schema 同键：
  //   习惯 → athena_act_cfg_v1（habitNormalizeCfg / habitLoadCfg）
  //   专注/结构/风味/名称 → athena_focus_v1.settings（focusSanitizeSettings）
  // 纯函数块可被 tests 抽取求值；绝不写入 *_formula_srs_v1。
  // ===== BEGIN TESTABLE act settings helpers =====
  // 键名与 habit.mjs 的 ACT_CFG_KEY 同值；此处不重复声明（构建拼接同作用域）
  const ACT_SETTINGS_CFG_KEY = 'athena_act_cfg_v1';

  // 编制层次键严格划分（单元 unit / 组 group / 群 corps / 集团 army）：
  // 顺序单一来源 = focus.mjs 的 FOCUS_LEVEL_KEYS；被 tests 抽取求值（无 focus.mjs）时回退本地字面量。
  // 未知层次键一律不落库（actSanitizeFocusSettings 只遍历已知键）。
  const ACT_FOCUS_LEVEL_KEYS = ['unit', 'group', 'corps', 'army'];
  const ACT_FOCUS_LEVEL_DEFAULT_NAMES = {
    unit: '任务单元',
    group: '任务组',
    corps: '任务群',
    army: '任务集团'
  };

  function actFocusLevelOrder() {
    if (typeof FOCUS_LEVEL_KEYS !== 'undefined' && Array.isArray(FOCUS_LEVEL_KEYS) && FOCUS_LEVEL_KEYS.length) {
      return FOCUS_LEVEL_KEYS.slice();
    }
    return ACT_FOCUS_LEVEL_KEYS.slice();
  }

  function actIsFocusLevelKey(key) {
    return actFocusLevelOrder().indexOf(String(key)) >= 0;
  }

  function actDefaultLevelNames() {
    const out = {};
    actFocusLevelOrder().forEach(function (k) {
      out[k] = ACT_FOCUS_LEVEL_DEFAULT_NAMES[k] || k;
    });
    return out;
  }

  function actDefaultHabitCfg() {
    return {
      dailyAddLimit: 1,
      manualLevelPerDay: 1,
      manualLevelKeepRatio: 0.5,
      failInternalizePenalty: 15,
      autoSettle: true
    };
  }

  function actDefaultFocusSettings() {
    return {
      unitMinutes: 25,
      unitDurations: [25, 50, 60],
      reserveWindowMin: 15,
      scoutMinutes: 5,
      planDueRemindDays: 3,
      structure: 'free', // 'free' | 'triad'
      flavor: false,
      typeNames: { focus: '专注', assault: '突击', life: '生活', plan: '计划', scout: '侦查' },
      levelNames: actDefaultLevelNames()
    };
  }

  function actClampNum(v, min, max, dflt) {
    const n = Number(v);
    if (!isFinite(n)) return dflt;
    return Math.max(min, Math.min(max, n));
  }

  function actSanitizeHabitCfg(raw) {
    const d = actDefaultHabitCfg();
    if (!raw || typeof raw !== 'object') return d;
    return {
      dailyAddLimit: Math.round(actClampNum(raw.dailyAddLimit, 1, 99, d.dailyAddLimit)),
      manualLevelPerDay: Math.round(actClampNum(raw.manualLevelPerDay, 0, 9, d.manualLevelPerDay)),
      manualLevelKeepRatio: actClampNum(raw.manualLevelKeepRatio, 0, 1, d.manualLevelKeepRatio),
      failInternalizePenalty: Math.round(actClampNum(raw.failInternalizePenalty, 0, 100, d.failInternalizePenalty)),
      autoSettle: raw.autoSettle == null ? d.autoSettle : !!raw.autoSettle
    };
  }

  function actSanitizeFocusSettings(raw) {
    const d = actDefaultFocusSettings();
    if (!raw || typeof raw !== 'object') return d;
    const out = {
      unitMinutes: Math.round(actClampNum(raw.unitMinutes, 1, 240, d.unitMinutes)),
      unitDurations: d.unitDurations.slice(),
      reserveWindowMin: Math.round(actClampNum(raw.reserveWindowMin, 1, 180, d.reserveWindowMin)),
      scoutMinutes: Math.round(actClampNum(raw.scoutMinutes, 1, 60, d.scoutMinutes)),
      planDueRemindDays: Math.round(actClampNum(raw.planDueRemindDays, 0, 30, d.planDueRemindDays)),
      structure: raw.structure === 'triad' ? 'triad' : 'free',
      flavor: raw.flavor == null ? d.flavor : !!raw.flavor,
      typeNames: Object.assign({}, d.typeNames),
      levelNames: Object.assign({}, d.levelNames)
    };
    if (Array.isArray(raw.unitDurations)) {
      const seen = {};
      const list = [];
      raw.unitDurations.forEach(function (x) {
        const v = Math.round(actClampNum(x, 1, 240, 0));
        if (v > 0 && !seen[v]) { seen[v] = 1; list.push(v); }
      });
      if (list.length) out.unitDurations = list.slice(0, 6);
    }
    ['typeNames', 'levelNames'].forEach(function (key) {
      const src = raw[key];
      if (!src || typeof src !== 'object') return;
      Object.keys(out[key]).forEach(function (k) {
        const v = src[k];
        if (typeof v === 'string' && v.trim()) out[key][k] = v.trim().slice(0, 12);
      });
    });
    return out;
  }

  // 合并视图（设置页用）：habit + focus 两段
  function actSanitizeSettings(raw) {
    const r = (raw && typeof raw === 'object') ? raw : {};
    return {
      habit: actSanitizeHabitCfg(r.habit),
      focus: actSanitizeFocusSettings(r.focus)
    };
  }
  // ===== END TESTABLE act settings helpers =====

  // 读：习惯走 athena_act_cfg_v1，专注走 athena_focus_v1.settings（与 H1–H3 同键）
  function loadActSettings() {
    let habitRaw = null;
    try { habitRaw = JSON.parse(localStorage.getItem(ACT_SETTINGS_CFG_KEY)); } catch (e) {}
    let focusRaw = null;
    try {
      const f = JSON.parse(localStorage.getItem('athena_focus_v1'));
      focusRaw = f && f.settings;
    } catch (e) {}
    // 若 habit.mjs / focus.mjs 已加载，优先用它们的 sanitize（同一 schema）
    let habit, focus;
    if (typeof habitNormalizeCfg === 'function') habit = habitNormalizeCfg(habitRaw);
    else habit = actSanitizeHabitCfg(habitRaw);
    if (typeof focusSanitizeSettings === 'function') focus = focusSanitizeSettings(focusRaw);
    else focus = actSanitizeFocusSettings(focusRaw);
    // unitDurations 是设置页展示用（focus 侧只存 unitMinutes）；补默认三档
    if (!Array.isArray(focus.unitDurations)) focus.unitDurations = [25, 50, 60];
    return { habit: habit, focus: focus };
  }

  function saveActSettings(patch) {
    const p = patch || {};
    const cur = loadActSettings();
    if (p.habit) {
      const next = actSanitizeHabitCfg(Object.assign({}, cur.habit, p.habit));
      try { localStorage.setItem(ACT_SETTINGS_CFG_KEY, JSON.stringify(next)); } catch (e) {}
      if (typeof window !== 'undefined') window.__habitCfg = next;
    }
    if (p.focus) {
      const nextF = actSanitizeFocusSettings(Object.assign({}, cur.focus, p.focus));
      // 写回 athena_focus_v1.settings（保留链/判例/编制等）
      let f = null;
      try { f = JSON.parse(localStorage.getItem('athena_focus_v1')); } catch (e) {}
      if (!f || typeof f !== 'object') f = {};
      // 只改 settings 段；不碰 chains/precedents/units/orgs/plans/seq
      f.settings = {
        unitMinutes: nextF.unitMinutes,
        reserveWindowMin: nextF.reserveWindowMin,
        scoutMinutes: nextF.scoutMinutes,
        scoutExtendMin: (cur.focus && cur.focus.scoutExtendMin) || 5,
        structure: nextF.structure,
        flavor: nextF.flavor,
        planDueRemindDays: nextF.planDueRemindDays,
        triadChildCount: (cur.focus && cur.focus.triadChildCount) || 3,
        typeNames: nextF.typeNames,
        levelNames: nextF.levelNames
      };
      try { localStorage.setItem('athena_focus_v1', JSON.stringify(f)); } catch (e) {}
      if (typeof window !== 'undefined') window.__focusData = null;
      if (typeof window !== 'undefined') delete window.__focusData;
    }
    return loadActSettings();
  }

  // 重置行动模块：确认后备份下载并清空三键；绝不动学习库 *_formula_srs_v1
  function resetActModule() {
    const keys = ['athena_act_v1', 'athena_habit_groups_v1', 'athena_focus_v1', 'athena_habit_state_v1'];
    const backup = { format: 'athena-act-backup', version: 1, exportedAt: Date.now() };
    keys.forEach(function (k) {
      let raw = null;
      try { raw = JSON.parse(localStorage.getItem(k)); } catch (e) {}
      backup[k] = raw;
    });
    backup.athena_act_cfg_v1 = loadActSettings().habit;
    try {
      if (typeof downloadJson === 'function') {
        const stamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
        downloadJson(backup, 'Athena-行动模块备份-' + stamp + '.json');
      }
    } catch (e) {}
    keys.forEach(function (k) {
      try { localStorage.removeItem(k); } catch (e) {}
    });
    try { localStorage.setItem('athena_act_backup_v1', JSON.stringify(backup)); } catch (e) {}
    if (typeof window !== 'undefined') {
      delete window.__actData;
      delete window.__habitGroups;
      delete window.__focusData;
      delete window.__habitState;
    }
    return true;
  }

  function renderSettings() {
    const app = document.getElementById('app');
    const wrap = el('div', 'settings-wrap');
    wrap.appendChild(el('h2', null, '⚙️ 设置'));
    const brand = illus('brand-settings');
    brand.classList.add('settings-brand-illus');
    wrap.appendChild(brand);

    // 分栏（会话内切换）：学习偏好 / 行动 / 数据与同步 / 关于
    let settingsTab = renderSettings._tab || 'study';
    const tabs = el('div', 'chips');
    [['study', '🎛 学习偏好'], ['act', '🎯 行动'], ['data', '💾 数据与同步'], ['about', 'ℹ️ 关于']].forEach(function (t) {
      const b = el('button', 'chip' + (settingsTab === t[0] ? ' active' : ''), t[1]);
      b.addEventListener('click', function () { renderSettings._tab = t[0]; renderApp(); });
      tabs.appendChild(b);
    });
    wrap.appendChild(tabs);

    const row = function (label) { const r = el('div', 'setting-row'); r.appendChild(el('span', null, label)); return r; };
    const note = function (text) { wrap.appendChild(el('p', 'muted', text)); };

    if (settingsTab === 'study') {

    // —— 作用域工具：可重叠项「本课 | 全局」二选一 ——
    const scopeChips = function (key, onChange) {
      const box = el('div', 'chips');
      const cur = prefScope(key);
      [['subject', '本课'], ['global', '全局']].forEach(function (t) {
        const b = el('button', 'chip' + (cur === t[0] ? ' active' : ''), t[1]);
        b.type = 'button';
        b.title = t[0] === 'global' ? '对所有科目生效（写入全局偏好）' : '仅对当前科目生效';
        b.addEventListener('click', function () {
          const v = prefGet(key);
          prefSet(key, v, t[0]);
          saveDB();
          toast(t[0] === 'global'
            ? '已改为全局生效（所有选「全局」的科目共用此值）'
            : '已改为本课生效（仅当前科目）');
          if (onChange) onChange();
          renderApp();
        });
        box.appendChild(b);
      });
      return box;
    };
    const secTitle = function (text, sub) {
      wrap.appendChild(el('h3', null, text));
      if (sub) wrap.appendChild(el('p', 'muted', sub));
    };

    // ═══ 本课设置（仅当前科目）═══
    secTitle('本课设置 · 仅「' + ((subjectList()[currentSubjectId] && subjectList()[currentSubjectId].name) || currentSubjectId) + '」', '只影响当前科目的学习队列与卡面；切换科目后各科各自独立。');

    // 初学者模式：章节选择因科而异，天然单科
    const subj = subjectList()[currentSubjectId];
    if (subj) {
      const resolved = resolveBeginner(DB.settings && DB.settings.beginner, subj, currentSubjectId);
      const begCfg = { on: resolved.on, cats: resolved.cats.slice() };
      const allCats = beginnerCatKeys(subj);
      const recCats = beginnerRecCats(subj);
      const sBeg = el('div', 'setting-row');
      sBeg.appendChild(el('span', null, '初学者模式'));
      const begCb = el('input', 'chk');
      begCb.type = 'checkbox';
      begCb.checked = !!begCfg.on;
      begCb.title = '开启后，新卡只从下方勾选的章节引入（章节因科而异，仅本课）';
      const begWrap = el('div', 'beg-cats');
      function renderBegCats() {
        begWrap.innerHTML = '';
        if (!begCb.checked) return;
        const cats = (Array.isArray(begCfg.cats) && begCfg.cats.length) ? begCfg.cats : recCats;
        allCats.forEach(function (k) {
          const chip = el('button', 'chip' + (cats.indexOf(k) !== -1 ? ' active' : ''), (subj.CATS && subj.CATS[k]) || k);
          chip.type = 'button';
          chip.addEventListener('click', function () {
            const cur = (Array.isArray(begCfg.cats) && begCfg.cats.length) ? begCfg.cats.slice() : cats.slice();
            const i = cur.indexOf(k);
            if (i !== -1) { if (cur.length > 1) cur.splice(i, 1); else return; }
            else cur.push(k);
            begCfg.cats = cur;
            DB.settings.beginner = { on: true, cats: cur, sid: currentSubjectId };
            saveDB();
            renderBegCats();
            rebuildQueue();
          });
          begWrap.appendChild(chip);
        });
        begWrap.appendChild(el('span', 'muted', '推荐起步：' + recCats.map(function (k) { return (subj.CATS && subj.CATS[k]) || k; }).join(' → ')));
      }
      begCb.addEventListener('change', function () {
        if (begCb.checked) {
          begCfg.on = true;
          if (!Array.isArray(begCfg.cats) || !begCfg.cats.length) begCfg.cats = recCats.slice();
          DB.settings.beginner = { on: true, cats: begCfg.cats, sid: currentSubjectId };
          toast('初学者模式已开启：新卡只从「' + begCfg.cats.map(function (k) { return (subj.CATS && subj.CATS[k]) || k; }).join('、') + '」引入');
        } else {
          DB.settings.beginner = { on: false, cats: (Array.isArray(begCfg.cats) && begCfg.cats.length) ? begCfg.cats.slice() : recCats.slice(), sid: currentSubjectId };
          toast('初学者模式已关闭：全部章节的新卡恢复引入');
        }
        saveDB();
        renderBegCats();
        rebuildQueue();
      });
      const begLabel = el('label', 'setting-check', '');
      begLabel.appendChild(begCb);
      begLabel.appendChild(el('span', null, '新卡只从选定章节引入（仅本课；其余章节之后解锁）'));
      sBeg.appendChild(begLabel);
      wrap.appendChild(sBeg);
      renderBegCats();
      wrap.appendChild(begWrap);
      wrap.appendChild(el('p', 'muted', '初学者模式按「章节」控制新卡引入，章节清单因科而异——因此固定为本课设置，不提供全局。'));
    }

    // —— 可重叠项：按当前作用域分入本课 / 全局模块 ——
    const overlapItems = [
      {
        key: 'dailyNew', label: '每日新卡上限', type: 'number', min: 0, max: 99, step: 1, width: '72px',
        title: '每天最多引入多少张新卡（0 = 暂停）',
        note: '每天最多把多少张新卡引入学习队列（已引入未学完的卡不受限）。到量后可在完成画面点「再来一批」。',
        commit: function (v) {
          rebuildQueue();
          toast(v === 0 ? '已暂停引入新卡，队列已重排' : '每日新卡上限已设为 ' + v + ' 张，队列已重排');
        }
      },
      {
        key: 'fdr', label: '期望保留率', type: 'number', min: 0.8, max: 0.98, step: 0.01, width: '96px',
        title: 'FSRS 按此保留率计算下次复习间隔（0.80–0.98，默认 0.90）',
        note: 'FSRS 按期望保留率计算下次复习间隔：调高（如考前 0.95）间隔更短、复习更密，调低更省时。',
        commit: function (v) { toast('期望保留率已设为 ' + v); }
      },
      {
        key: 'bareRecall', label: '裸回忆', type: 'check',
        checkText: '学习时隐藏分类提示（先判断类别再回忆）',
        note: '交错练习的关键是「辨别」：开启后卡片正面不显示分类徽标，点开答案后才出现。',
        commit: function (v) { toast(v ? '裸回忆已开启' : '裸回忆已关闭'); }
      },
      {
        key: 'goalTitle', label: '目标名称', type: 'text', maxLength: 10, width: '120px',
        title: '倒计时指向的目标名称（如考研 / 四六级 / 教资）',
        note: '倒计时与毕业目标文案中的目标名。若多科共用一场考试，可切到「全局」统一维护。',
        commit: function (v) { toast('目标名称已设为「' + v + '」'); }
      },
      {
        key: 'examDate', label: '目标日期', type: 'date', width: '158px',
        title: '留空则不显示倒计时与每日弹窗',
        note: '设置目标日期后，每次打开应用会弹出倒计时提醒。留空则全部关闭。',
        commit: function (v) { toast(v ? '目标日期已设为 ' + v : '已清除目标日期（倒计时关闭）'); }
      },
      {
        key: 'targetLinkExam', label: '毕业目标挂钩', type: 'check',
        checkText: '毕业目标随目标倒计时自动变化（需先设置目标日期）',
        note: '开启后：毕业目标 = 距目标日天数（要求目标日 ≥90% 记得）；关闭则用下方固定稳定度。',
        commit: function (v) { toast(v ? '毕业目标已与目标倒计时挂钩' : '毕业目标改用固定值'); }
      },
      {
        key: 'targetS', label: '毕业目标稳定度', type: 'number', min: 7, max: 730, step: 1, width: '96px',
        title: '关闭「挂钩」时使用的固定目标稳定度（天）',
        note: '稳定度 S 达到该值即「毕业/稳固」——停止复习后仍能 ≥90% 记得的天数。',
        commit: function (v) { toast('固定毕业目标稳定度 ' + v + ' 天'); }
      }
    ];

    function renderOverlapRow(item) {
      const sc = prefScope(item.key);
      const r = el('div', 'setting-row');
      r.appendChild(el('span', null, item.label));
      r.appendChild(scopeChips(item.key));
      const val = prefGet(item.key);
      if (item.type === 'check') {
        const cb = el('input', 'chk');
        cb.type = 'checkbox';
        cb.checked = !!val;
        if (item.key === 'targetLinkExam') cb.disabled = (countdownDays() == null);
        if (cb.disabled) cb.checked = false;
        const lab = el('label', 'setting-check', '');
        lab.appendChild(cb);
        lab.appendChild(el('span', null, item.checkText || ''));
        cb.addEventListener('change', function () {
          prefSet(item.key, cb.checked, sc);
          saveDB();
          if (item.commit) item.commit(cb.checked);
          renderApp();
        });
        r.appendChild(lab);
      } else {
        const input = el('input', 'num');
        input.type = item.type === 'date' ? 'date' : (item.type === 'text' ? 'text' : 'number');
        if (item.min != null) input.min = String(item.min);
        if (item.max != null) input.max = String(item.max);
        if (item.step != null) input.step = String(item.step);
        if (item.maxLength) input.maxLength = item.maxLength;
        if (item.width) input.style.width = item.width;
        if (item.title) input.title = item.title;
        input.value = (val == null) ? '' : String(val);
        input.addEventListener('change', function () {
          let v;
          if (item.type === 'text') {
            v = input.value.trim() || GOAL_DEFAULT;
          } else if (item.type === 'date') {
            v = input.value || '';
          } else {
            v = parseFloat(input.value);
            if (isNaN(v)) v = prefDefaults()[item.key];
            if (item.min != null) v = Math.max(item.min, v);
            if (item.max != null) v = Math.min(item.max, v);
            if (item.step >= 1) v = Math.round(v);
          }
          prefSet(item.key, v, sc);
          saveDB();
          input.value = (v == null) ? '' : String(v);
          if (item.commit) item.commit(v);
        });
        r.appendChild(input);
      }
      wrap.appendChild(r);
      if (item.note) wrap.appendChild(el('p', 'muted', item.note));
    }

    const subjItems = overlapItems.filter(function (it) { return prefScope(it.key) === 'subject'; });
    subjItems.forEach(renderOverlapRow);
    if (!subjItems.length) {
      wrap.appendChild(el('p', 'muted', '（当前没有仅本课生效的可调项——可把下方全局项切回「本课」）'));
    }

    // ═══ 全局设置（所有科目共享）═══
    secTitle('全局设置 · 所有科目共享', '选「全局」的项对每个科目共用同一份值；各科仍可单独切回「本课」覆盖。');
    const globItems = overlapItems.filter(function (it) { return prefScope(it.key) === 'global'; });
    globItems.forEach(renderOverlapRow);
    if (!globItems.length) {
      wrap.appendChild(el('p', 'muted', '（当前没有全局生效的可调项——点上方任一项旁的「全局」即可移入本区）'));
    }
    wrap.appendChild(el('p', 'muted', '「行动」模块设置见「🎯 行动」栏；云同步见「💾 数据与同步」栏——它们本身就是全局配置。'));

    }

    if (settingsTab === 'act') {

    const actS = loadActSettings();
    const habitCfg = actS.habit;
    const focusCfg = actS.focus;
    const actRow = function (label) { const r = el('div', 'setting-row'); r.appendChild(el('span', null, label)); return r; };
    const actNum = function (value, min, max, step, title, onCommit) {
      const input = el('input', 'num');
      input.type = 'number';
      input.min = String(min); input.max = String(max); input.step = String(step);
      input.style.width = '72px';
      input.value = String(value);
      if (title) input.title = title;
      input.addEventListener('change', function () {
        let v = parseFloat(input.value);
        if (isNaN(v)) v = value;
        v = Math.max(min, Math.min(max, v));
        if (step >= 1) v = Math.round(v);
        onCommit(v);
        input.value = String(v);
      });
      return input;
    };

    wrap.appendChild(el('h3', null, '习惯 · RSIP'));
    const rAdd = actRow('每日入树上限');
    rAdd.appendChild(actNum(habitCfg.dailyAddLimit, 1, 99, 1, '每天最多几个新习惯上树', function (v) {
      saveActSettings({ habit: { dailyAddLimit: v } });
      toast('每日入树上限已设为 ' + v);
    }));
    wrap.appendChild(rAdd);

    const rManual = actRow('手动强化次数/日');
    rManual.appendChild(actNum(habitCfg.manualLevelPerDay, 0, 9, 1, '每天最多手动强化几次（0 = 关闭手动强化）', function (v) {
      saveActSettings({ habit: { manualLevelPerDay: v } });
      toast('手动强化每日上限已设为 ' + v + ' 次');
    }));
    wrap.appendChild(rManual);

    const rKeep = actRow('手动强化内化保留');
    rKeep.appendChild(actNum(habitCfg.manualLevelKeepRatio, 0, 1, 0.05, '手动强化后内化进度保留比例（0.5 = 保留一半）', function (v) {
      saveActSettings({ habit: { manualLevelKeepRatio: v } });
      toast('手动强化后内化保留 ' + Math.round(v * 100) + '%');
    }));
    wrap.appendChild(rKeep);
    wrap.appendChild(el('p', 'muted', '手动强化每日仅 1 次、1 个习惯，且内化按比例保留（默认 50%）——比自动强化代价更高，表述更严。'));

    const rFail = actRow('失败内化惩罚');
    rFail.appendChild(actNum(habitCfg.failInternalizePenalty, 0, 100, 1, '习惯失败时内化扣减点数（0 = 不扣，进度不丢）', function (v) {
      saveActSettings({ habit: { failInternalizePenalty: v } });
      toast(v === 0 ? '失败不再扣内化' : '失败内化惩罚已设为 −' + v);
    }));
    wrap.appendChild(rFail);
    wrap.appendChild(el('p', 'muted', '失败回库时内化进度不会清零；此项是额外扣减（默认 15）。设 0 则完全保留。'));

    const rAuto = el('div', 'setting-row');
    rAuto.appendChild(el('span', null, '零点自动结算'));
    const autoCb = el('input', 'chk');
    autoCb.type = 'checkbox';
    autoCb.checked = !!habitCfg.autoSettle;
    const autoLab = el('label', 'setting-check', '');
    autoLab.appendChild(autoCb);
    autoLab.appendChild(el('span', null, '午夜自动结算前一日（全员检完才可手动结算）'));
    autoCb.addEventListener('change', function () {
      saveActSettings({ habit: { autoSettle: autoCb.checked } });
      toast(autoCb.checked ? '零点自动结算已开启' : '零点自动结算已关闭');
    });
    rAuto.appendChild(autoLab);
    wrap.appendChild(rAuto);

    wrap.appendChild(el('h3', null, '专注 · CTDP'));
    const rDur = actRow('单元时长（分）');
    [25, 50, 60].forEach(function (d) {
      const b = el('button', 'chip' + (focusCfg.unitMinutes === d ? ' active' : ''), d + ' 分');
      b.type = 'button';
      b.addEventListener('click', function () {
        saveActSettings({ focus: { unitMinutes: d } });
        toast('默认单元时长已设为 ' + d + ' 分');
        renderApp();
      });
      rDur.appendChild(b);
    });
    rDur.appendChild(actNum(focusCfg.unitMinutes, 1, 240, 1, '自定义默认单元时长', function (v) {
      saveActSettings({ focus: { unitMinutes: v } });
      toast('默认单元时长已设为 ' + v + ' 分');
    }));
    wrap.appendChild(rDur);

    const rRes = actRow('预约窗（分）');
    rRes.appendChild(actNum(focusCfg.reserveWindowMin, 1, 180, 1, '离开座位后预约保留时长', function (v) {
      saveActSettings({ focus: { reserveWindowMin: v } });
      toast('预约窗已设为 ' + v + ' 分钟');
    }));
    wrap.appendChild(rRes);

    const rScout = actRow('侦查时长（分）');
    rScout.appendChild(actNum(focusCfg.scoutMinutes, 1, 60, 1, '侦查任务默认时长', function (v) {
      saveActSettings({ focus: { scoutMinutes: v } });
      toast('侦查时长已设为 ' + v + ' 分钟');
    }));
    wrap.appendChild(rScout);

    const rRemind = actRow('计划到期提醒');
    rRemind.appendChild(actNum(focusCfg.planDueRemindDays, 0, 30, 1, '截止日前多少天开始提醒（0 = 不提醒）', function (v) {
      saveActSettings({ focus: { planDueRemindDays: v } });
      toast(v === 0 ? '计划到期提醒已关闭' : '计划到期前 ' + v + ' 天提醒');
    }));
    wrap.appendChild(rRemind);

    wrap.appendChild(el('h3', null, '结构与风味'));
    const rStruct = actRow('编制结构');
    const structChips = el('div', 'chips');
    [['free', '自由 N 叉'], ['triad', '三三制模板']].forEach(function (t) {
      const b = el('button', 'chip' + (focusCfg.structure === t[0] ? ' active' : ''), t[1]);
      b.type = 'button';
      b.addEventListener('click', function () {
        saveActSettings({ focus: { structure: t[0] } });
        toast(t[0] === 'triad' ? '创建向导默认三三制模板（每组建议 3 子，不强制）' : '默认自由 N 叉结构');
        renderApp();
      });
      structChips.appendChild(b);
    });
    rStruct.appendChild(structChips);
    wrap.appendChild(rStruct);

    const rFlavor = el('div', 'setting-row');
    rFlavor.appendChild(el('span', null, '风味显示'));
    const flavorCb = el('input', 'chk');
    flavorCb.type = 'checkbox';
    flavorCb.checked = !!focusCfg.flavor;
    const flavorLab = el('label', 'setting-check', '');
    flavorLab.appendChild(flavorCb);
    flavorLab.appendChild(el('span', null, '显示类型名与层次名（番号 # 始终显示）'));
    flavorCb.addEventListener('change', function () {
      saveActSettings({ focus: { flavor: flavorCb.checked } });
      toast(flavorCb.checked ? '风味显示已开启' : '风味显示已关闭（仅番号）');
    });
    rFlavor.appendChild(flavorLab);
    wrap.appendChild(rFlavor);

    // 层次顺序单一来源：严格四级 unit/group/corps/army（见 focus.mjs FOCUS_LEVEL_KEYS）
    const LEVEL_ORDER = actFocusLevelOrder();
    const rLevels = actRow('层次名');
    const levelWrap = el('div', 'beg-cats');
    LEVEL_ORDER.forEach(function (key) {
      const input = el('input', 'num');
      input.type = 'text';
      input.maxLength = 8;
      input.style.width = '88px';
      input.value = focusCfg.levelNames[key] || key;
      input.title = '编制层次名称';
      input.addEventListener('change', function () {
        // 严格类型：非法层次键不写入
        if (!actIsFocusLevelKey(key)) { input.value = focusCfg.levelNames[key] || key; return; }
        const patch = {};
        patch[key] = input.value.trim() || actDefaultLevelNames()[key] || key;
        saveActSettings({ focus: { levelNames: Object.assign({}, loadActSettings().focus.levelNames, patch) } });
        input.value = patch[key];
        toast('层次名已更新');
      });
      levelWrap.appendChild(input);
    });
    rLevels.appendChild(levelWrap);
    wrap.appendChild(rLevels);

    const TYPE_ORDER = ['focus', 'assault', 'life', 'plan', 'scout'];
    const rTypes = actRow('类型名');
    const typeWrap = el('div', 'beg-cats');
    TYPE_ORDER.forEach(function (key) {
      const input = el('input', 'num');
      input.type = 'text';
      input.maxLength = 8;
      input.style.width = '88px';
      input.value = focusCfg.typeNames[key] || key;
      input.title = '专注单元类型名';
      input.addEventListener('change', function () {
        const patch = {};
        patch[key] = input.value.trim() || actDefaultFocusSettings().typeNames[key];
        saveActSettings({ focus: { typeNames: Object.assign({}, loadActSettings().focus.typeNames, patch) } });
        input.value = patch[key];
        toast('类型名已更新');
      });
      typeWrap.appendChild(input);
    });
    rTypes.appendChild(typeWrap);
    wrap.appendChild(rTypes);
    wrap.appendChild(el('p', 'muted', '层次（严格逐级归属）：' + actFocusLevelOrder().map(function (k) { return focusCfg.levelNames[k] || k; }).join(' → ') + '（番号 # ● ▲ ◆）；类型：专注 / 突击 / 生活 / 计划 / 侦查。名称可改，番号不变。三三制为创建向导建议模板（每组 3 子），不强制。'));

    wrap.appendChild(el('h3', null, '重置'));
    const rReset = el('div', 'setting-row danger-row');
    rReset.appendChild(el('span', null, '重置行动模块'));
    const actReset = el('button', 'btn danger', '备份并清空');
    actReset.title = '清空习惯树 / 计划 / 专注链；不动学习库';
    actReset.addEventListener('click', function () {
      if (!confirm('确定要重置行动模块吗？\n\n将备份并清空：\n· 习惯树与 WOOP 计划\n· 习惯组配置与检查状态\n· 专注链、判例与编制\n\n学习库（知识卡/错题/统计）不会被改动。\n备份 JSON 会下载到本机，并保留最近一份在本地。')) return;
      resetActModule();
      toast('行动模块已重置（备份已下载）');
      renderApp();
    });
    rReset.appendChild(actReset);
    wrap.appendChild(rReset);
    wrap.appendChild(el('p', 'muted', '重置只影响行动数据（athena_act / habit_groups / focus / habit_state），不碰任何学科的学习库。若已开启云同步，下次同步会把云端行动数据合并回来——彻底清空云端请先重置再「完全上传」。'));

    }

    if (settingsTab === 'data') {

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

    const s2b = el('div', 'setting-row');
    s2b.appendChild(el('span', null, '全部科目互通'));
    const expAll = el('button', 'btn', '导出全部');
    expAll.setAttribute('data-action', 'exportall');
    s2b.appendChild(expAll);
    const impAll = el('button', 'btn primary', '导入全部');
    impAll.setAttribute('data-action', 'importall');
    s2b.appendChild(impAll);
    wrap.appendChild(s2b);
    wrap.appendChild(el('p', 'muted', '把四个学科的学习进度与统计打包成单个 JSON 文件，一键迁移到另一台设备或平台（手机 / 平板 / 电脑 / 网页版）。'));

    // —— 云同步（GitHub 私仓）——
    const scfg = syncCfg();
    const sSync = el('div', 'setting-row');
    sSync.appendChild(el('span', null, '云同步 (GitHub)'));
    const autoCb = el('input', 'chk');
    autoCb.type = 'checkbox';
    autoCb.checked = !!scfg.enabled;
    const autoLabel = el('label', 'setting-check', '');
    autoLabel.appendChild(autoCb);
    autoLabel.appendChild(el('span', null, '自动同步（启动拉取 + 评分后防抖上传）'));
    autoLabel.title = '开启后：打开应用自动比对云端，评分落盘约 30 秒后自动上传有变化的学科';
    autoCb.addEventListener('change', function () {
      const c = syncCfg();
      c.enabled = autoCb.checked;
      saveSyncCfg(c);
      toast(autoCb.checked ? '自动同步已开启' : '自动同步已关闭');
    });
    sSync.appendChild(autoLabel);
    wrap.appendChild(sSync);

    const sSyncCfg = el('div', 'setting-row');
    const tokenInput = el('input', 'num');
    tokenInput.type = 'password';
    tokenInput.style.width = '240px';
    tokenInput.placeholder = 'GitHub Token（仅保存在本设备）';
    tokenInput.value = scfg.token || '';
    sSyncCfg.appendChild(tokenInput);
    const repoInput = el('input', 'num');
    repoInput.type = 'text';
    repoInput.style.width = '170px';
    repoInput.placeholder = '用户名/仓库名';
    repoInput.value = scfg.repo || '';
    sSyncCfg.appendChild(repoInput);
    const saveBtn = el('button', 'btn', '保存并验证');
    saveBtn.addEventListener('click', function () {
      const c = syncCfg();
      c.token = tokenInput.value.trim();
      c.repo = repoInput.value.trim();
      saveSyncCfg(c);
      saveBtn.disabled = true;
      toast('正在验证…');
      syncValidate().then(function (msg) {
        toast(msg);
      }).catch(function (err) {
        toast('验证失败：' + (err.message || err));
      }).finally(function () { saveBtn.disabled = false; });
    });
    sSyncCfg.appendChild(saveBtn);
    wrap.appendChild(sSyncCfg);

    const sSyncBtns = el('div', 'setting-row');
    const syncBtn = el('button', 'btn primary', '立即同步');
    function setSyncBusy(busy) {
      syncBtn.disabled = busy;
      upBtn.disabled = busy;
      downBtn.disabled = busy;
    }
    syncBtn.addEventListener('click', function () {
      if (!syncConfigured()) { toast('云同步未配置完整：请先填写 Token 与仓库名并验证'); return; }
      setSyncBusy(true);
      toast('同步中…');
      runSync().then(function (summary) {
        let msg = '同步完成：云端更新 ' + summary.cloud.length + ' 科，本地更新 ' + summary.local.length + ' 科，双向合并 ' + summary.both.length + ' 科';
        if (summary.failed.length) msg += '，失败：' + summary.failed[0];
        toast(msg);
        renderApp();
      }).catch(function (err) {
        toast('同步失败：' + (err.message || err));
      }).finally(function () { setSyncBusy(false); });
    });
    sSyncBtns.appendChild(syncBtn);

    // 单向全覆盖（危险）：跳过合并，与「立即同步」并存；门槛同为 Token+仓库已配置
    const upBtn = el('button', 'btn danger', '完全上传');
    upBtn.title = '本机整库快照覆盖云端（不做合并）';
    upBtn.addEventListener('click', function () {
      if (!syncConfigured()) { toast('云同步未配置完整：请先填写 Token 与仓库名并验证'); return; }
      if (!confirm('确定要「完全上传」吗？（危险操作）\n\n将把本机全部学科的整库快照【覆盖】到云端，跳过合并。\n云端被覆盖的版本会先归档到 athena-sync/archive/，但云端上本机没有的进度仍可能被覆盖丢失。\n\n本机数据不会被改动。')) return;
      setSyncBusy(true);
      toast('完全上传中…');
      forceUploadAll().then(function (summary) {
        let msg = '完全上传完成：已覆盖 ' + summary.ok.length + ' 科';
        if (summary.skipped.length) msg += '，跳过 ' + summary.skipped.length + ' 科（本机无数据）';
        if (summary.failed.length) msg += '，失败：' + summary.failed[0];
        toast(msg);
        renderApp();
      }).catch(function (err) {
        toast('完全上传失败：' + (err.message || err));
      }).finally(function () { setSyncBusy(false); });
    });
    sSyncBtns.appendChild(upBtn);

    const downBtn = el('button', 'btn danger', '完全下载');
    downBtn.title = '云端整库快照覆盖本机（不做合并）';
    downBtn.addEventListener('click', function () {
      if (!syncConfigured()) { toast('云同步未配置完整：请先填写 Token 与仓库名并验证'); return; }
      if (!confirm('确定要「完全下载」吗？（危险操作）\n\n将把云端全部学科的整库快照【覆盖】到本机，跳过合并。\n本机被覆盖的版本会先归档到 athena-sync/archive/，但本机上云端没有的进度将被覆盖丢失。\n\n覆盖后当前学习会话会重建。')) return;
      setSyncBusy(true);
      toast('完全下载中…');
      forceDownloadAll().then(function (summary) {
        let msg = '完全下载完成：已覆盖 ' + summary.ok.length + ' 科';
        if (summary.skipped.length) msg += '，跳过 ' + summary.skipped.length + ' 科（云端无数据）';
        if (summary.failed.length) msg += '，失败：' + summary.failed[0];
        toast(msg);
        renderApp();
      }).catch(function (err) {
        toast('完全下载失败：' + (err.message || err));
      }).finally(function () { setSyncBusy(false); });
    });
    sSyncBtns.appendChild(downBtn);
    wrap.appendChild(sSyncBtns);
    wrap.appendChild(el('p', 'muted', '「完全上传 / 完全下载」为单向全覆盖（跳过合并）：上传以本机为准覆盖云端，下载以云端为准覆盖本机。覆盖前被覆盖侧会自动归档到 athena-sync/archive/（每科约保留 10 份），但对侧独有的新进度仍会被覆盖。日常多端请用「立即同步」（合并式）。'));
    const last = scfg.lastSyncAt
      ? ('上次同步：' + new Date(scfg.lastSyncAt).toLocaleString() + (scfg.lastSyncSummary && scfg.lastSyncSummary.force
          ? ('（' + (scfg.lastSyncSummary.force === 'upload' ? '完全上传' : '完全下载') + '：覆盖 ' + (scfg.lastSyncSummary.ok || 0) + ' 科，失败 ' + (scfg.lastSyncSummary.failed || 0) + ' 科）')
          : ('（云端更新 ' + (scfg.lastSyncSummary ? scfg.lastSyncSummary.cloud : 0) + ' / 本地更新 ' + (scfg.lastSyncSummary ? scfg.lastSyncSummary.local : 0) + ' / 双向合并 ' + (scfg.lastSyncSummary ? scfg.lastSyncSummary.both : 0) + ' 科）')) + (scfg.lastError ? '——上次错误：' + scfg.lastError : ''))
      : '尚未同步过。';
    note(last);
    note('准备步骤：① 在 GitHub 新建一个【私有】仓库；② 创建 Fine-grained Token，仅勾选该仓库、权限 Contents: Read and write；③ 填入上方并「保存并验证」。同步把四科整库快照存入仓库 athena-sync/ 目录；合并式同步按卡片逐张取较新记录，多端同时打开不会互相覆盖。仅在检测到另一设备有本机未见的变化时才归档旧版，归档每科只保留最近 10 份，仓库不会无限膨胀。数据为明文 JSON，请确保仓库为私有。');

    }

    if (settingsTab === 'about') {

    const s8 = el('div', 'setting-row');
    s8.appendChild(el('span', null, '更新与缓存'));
    const cc = el('button', 'btn', '强制清除缓存并更新');
    cc.setAttribute('data-action', 'clearcache');
    cc.setAttribute('title', '清除 Service Worker 与全部缓存后自动刷新，用于移动端测试最新版本');
    s8.appendChild(cc);
    wrap.appendChild(s8);
    wrap.appendChild(el('p', 'muted', '移动端看不到最新版本时使用：清除浏览器缓存（Service Worker + 静态资源缓存）后重新加载，不丢学习进度。'));

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

    }

    app.appendChild(wrap);
  }

  // ---------------- 记忆原理视图 ----------------
