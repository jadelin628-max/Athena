  // ---------------- 行动·计划：WOOP 主干（V2 计划模块重置） ----------------
  // 规格：docs/ACT.md §3；如果-那么 = WOOP 的 P 步，环境审计 = 障碍步的「外部提示」清单。
  // 存储 athena_act_v1，与学习库 *_formula_srs_v1 隔离。旧 ifThen / envAudit 字段加载时丢弃。
  // 禁止：物质/娱乐兑换、连击惩罚、改动 FSRS。校验仅软提示，不强制阻断。

  const ACT_KEY = 'athena_act_v1';

  function actDefaultData() {
    return { woops: [], habits: [] };
  }

  function actSanitizeCues(arr) {
    return (Array.isArray(arr) ? arr : []).filter(function (c) { return c && typeof c === 'object'; }).map(function (c) {
      return {
        id: String(c.id || ('cue_' + Date.now() + '_' + Math.floor(Math.random() * 10000))),
        text: String(c.text == null ? '' : c.text),
        cueType: ['time', 'place', 'emotion', 'prior', 'app'].indexOf(c.cueType) >= 0 ? c.cueType : 'prior',
        strategy: c.strategy === 'transform' ? 'transform' : 'remove',
        method: ['digital', 'physical', 'route'].indexOf(c.method) >= 0 ? c.method : 'digital',
        note: String(c.note == null ? '' : c.note)
      };
    }).filter(function (c) { return c.text; });
  }

  function actSanitize(raw) {
    const out = actDefaultData();
    if (!raw || typeof raw !== 'object') return out;
    if (Array.isArray(raw.woops)) {
      raw.woops.forEach(function (x) {
        if (!x || typeof x !== 'object') return;
        const created = Number(x.createdAt) || Date.now();
        const w = {
          id: String(x.id || ('woop_' + Date.now() + '_' + Math.floor(Math.random() * 10000))),
          wish: String(x.wish == null ? '' : x.wish),
          outcome: String(x.outcome == null ? '' : x.outcome),
          obstacle: String(x.obstacle == null ? '' : x.obstacle),
          cues: actSanitizeCues(x.cues),
          planIf: String(x.planIf == null ? '' : x.planIf),
          planThen: String(x.planThen == null ? '' : x.planThen),
          createdAt: created,
          updatedAt: Number(x.updatedAt) || created
        };
        if (w.wish && w.outcome && w.obstacle && w.planIf && w.planThen) out.woops.push(w);
      });
    }
    // 旧计划数据（ifThen / envAudit）按产品决策丢弃，不进入新结构
    // habits 由习惯树接管；此处只保留数组占位，不解析业务字段
    if (Array.isArray(raw.habits)) out.habits = raw.habits.filter(function (h) { return h && typeof h === 'object'; });
    return out;
  }

  function loadAct() {
    if (typeof window !== 'undefined' && window.__actData) return window.__actData;
    let raw = null;
    try { raw = JSON.parse(localStorage.getItem(ACT_KEY)); } catch (e) {}
    const data = actSanitize(raw);
    if (typeof window !== 'undefined') window.__actData = data;
    return data;
  }

  function saveAct(data) {
    const d = data || actDefaultData();
    if (typeof window !== 'undefined') window.__actData = d;
    try { localStorage.setItem(ACT_KEY, JSON.stringify(d)); } catch (e) {}
    return d;
  }

  function actUid(prefix) {
    return (prefix || 'id') + '_' + Date.now() + '_' + Math.floor(Math.random() * 10000);
  }

  // ---------------- 纯校验（export 供 tests 对拍；软提示，不阻断） ----------------
  // ACT §2 文案：「如果」外部情境；「那么」无需再决策的动作。
  const ACT_IF_HINT = '「如果」必须是外部情境（时间 / 地点 / 前序行为），禁止纯内心状态（「如果我有动力」不合格）。';
  const ACT_THEN_HINT = '「那么」必须是无需再决策的动作（「打开 Anki 复习 10 张」合格；「学习一会儿」不合格）。';
  const ACT_OBSTACLE_HINT = '障碍必须是内心障碍（「因为我……」），不是外部困难。';

  // 内心状态词（无外部锚点时判不合格）
  const ACT_INNER_IF = /有动力|想学|想练|愿意学|心情好|状态好|有时间|有空|有精力|想做作业|来感觉|有心情|想努力|愿意努力/;
  // 外部情境锚点：时间 / 地点 / 前序行为
  const ACT_OUTER_IF = /早上|早晨|清晨|中午|下午|傍晚|晚上|夜里|深夜|睡前|起床|醒来|点|分|时|家|宿舍|图书馆|教室|自习室|办公室|工位|地铁|公交|路上|车上|桌前|书桌|床边|沙发|厨房|吃完|吃完饭|喝完|做完|写完|背完|上完|下课|下班|下课后|走进|到了|打开|关掉|回到|离开|之后|以后|之前|到家|进家|坐在|站在|闹钟|通知|提醒|出门|进门|拿起|放下|看到/;

  function actValidateIf(text) {
    const s = String(text == null ? '' : text).trim();
    if (!s) return { ok: false, reason: 'empty', hint: '「如果」不能为空。' + ACT_IF_HINT };
    const hasOuter = ACT_OUTER_IF.test(s);
    const hasInner = ACT_INNER_IF.test(s);
    if (hasInner && !hasOuter) return { ok: false, reason: 'internal', hint: ACT_IF_HINT };
    if (!hasOuter && s.length < 8) return { ok: false, reason: 'vague', hint: ACT_IF_HINT };
    return { ok: true, hint: '' };
  }

  function actValidateThen(text) {
    const s = String(text == null ? '' : text).trim();
    if (!s) return { ok: false, reason: 'empty', hint: '「那么」不能为空。' + ACT_THEN_HINT };
    // 仍需再决策的模糊表述
    if (/^(学习|复习|练习|看看|读书|写作|背书|刷题|看书|学)(一)?(会儿|下|点|些)$/.test(s)) {
      return { ok: false, reason: 'vague', hint: ACT_THEN_HINT };
    }
    if (/^(好好学习|努力学习|努力|加油|尽力|尽量|争取|好好学|多学点|学一会儿|学一下|学一点)$/.test(s)) {
      return { ok: false, reason: 'vague', hint: ACT_THEN_HINT };
    }
    return { ok: true, hint: '' };
  }

  function actValidateIfThen(ifText, thenText) {
    return { if: actValidateIf(ifText), then: actValidateThen(thenText) };
  }

  function actValidateObstacle(text) {
    const s = String(text == null ? '' : text).trim();
    if (!s) return { ok: false, reason: 'empty', hint: ACT_OBSTACLE_HINT };
    const external = /因为(没时间|太忙|工作忙|要加班|别人|天气|环境|没条件|没钱|设备|网络|老师|同学|室友|家人)/;
    const internal = /因为我(会|就|容易|总是|老是|怕|担心|焦虑|拖延|分心|走神|想玩|想刷|不够|太累|懒|畏难|完美主义|在意|习惯)/;
    if (external.test(s) && !internal.test(s)) return { ok: false, reason: 'external', hint: ACT_OBSTACLE_HINT };
    return { ok: true, hint: '' };
  }

  function actFormatIfThen(item) {
    const ifT = String((item && item.if) || '').trim();
    const thenT = String((item && item.then) || '').trim();
    return '如果 ' + ifT + '，那么我将 ' + thenT;
  }

  function actIsThisWeek(dateStr) {
    if (!dateStr) return false;
    const d = new Date(dateStr + 'T00:00:00');
    if (isNaN(d.getTime())) return false;
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekAgo = today.getTime() - 6 * 86400000;
    return d.getTime() >= weekAgo && d.getTime() <= today.getTime() + 86400000;
  }

  // 主页/行动摘要（习惯数取自 habit.mjs；模块单独加载时回退占位）
  function actTodaySummary() {
    const d = loadAct();
    let habitDue = 0, habitDone = 0, habitTotal = 0;
    if (typeof habitHomeCounts === 'function') {
      const hc = habitHomeCounts();
      habitDue = hc.due; habitDone = hc.done; habitTotal = hc.total;
    } else {
      habitTotal = (d.habits || []).filter(function (h) { return h && !h.removedAt; }).length;
    }
    return {
      woop: d.woops.length,
      habitDue: habitDue,
      habitDone: habitDone,
      habitTotal: habitTotal
    };
  }

  // ---------------- 会话级 UI 状态（不落盘） ----------------
  let actView = 'plan';          // plan | habit | focus | help（由 currentView 驱动，见 renderAct）
  let actWoopStep = 0;           // WOOP 向导 0–3
  let actWoopDraft = null;       // { wish, outcome, obstacle, cues[], planIf, planThen }
  const homePlanFold = { woop: false }; // 主页计划入口折叠态

  // ---------------- WOOP 主干：删除 / 四步向导（含外部提示） ----------------
  const ACT_CUE_TYPES = [
    ['time', '时间'],
    ['place', '地点'],
    ['emotion', '情绪'],
    ['prior', '前序动作'],
    ['app', 'App 通知']
  ];
  const ACT_METHODS = [
    ['digital', '数字', '删/隐藏 App、关通知、手机离卧室'],
    ['physical', '物理', '零食不进家、运动服放床边'],
    ['route', '路线', '绕开触发点']
  ];

  function actDeleteWoop(id) {
    if (typeof window !== 'undefined' && !window.confirm('确定删除这条 WOOP 吗？（不可恢复）')) return;
    const d = loadAct();
    d.woops = d.woops.filter(function (w) { return w.id !== id; });
    saveAct(d);
    renderApp();
    toast('已删除 WOOP');
  }

  function actOpenWoop(existing) {
    actWoopStep = 0;
    actWoopDraft = existing ? {
      id: existing.id,
      wish: existing.wish || '',
      outcome: existing.outcome || '',
      obstacle: existing.obstacle || '',
      cues: (existing.cues || []).map(function (c) { return Object.assign({}, c); }),
      planIf: existing.planIf || '',
      planThen: existing.planThen || ''
    } : { id: null, wish: '', outcome: '', obstacle: '', cues: [], planIf: '', planThen: '' };
    actRenderWoopModal();
  }

  function actRenderWoopModal() {
    const old = document.querySelector('.map-modal.woop-modal');
    if (old) old.remove();
    const modal = el('div', 'map-modal woop-modal');
    const backdrop = el('div', 'map-modal-backdrop');
    backdrop.addEventListener('click', function () {
      const m = document.querySelector('.map-modal.woop-modal');
      if (m) m.remove();
      actWoopDraft = null;
    });
    modal.appendChild(backdrop);
    const card = el('div', 'map-modal-card wrong-input-card');

    const STEPS = [
      { key: 'wish', label: 'W · 愿望', title: '愿望（Wish）', ph: '用一两句写下对你真正重要的愿望…' },
      { key: 'outcome', label: 'O · 结果', title: '结果（Outcome）· 最佳画面', ph: '愿望实现后最好的画面/感受…' },
      { key: 'obstacle', label: 'O · 障碍', title: '内心障碍 + 外部提示', ph: '写成「因为我……」的内心障碍（不是外部困难）…' },
      { key: 'plan', label: 'P · 计划', title: '计划（Plan）→ 如果-那么', ph: '' }
    ];
    const step = STEPS[actWoopStep];
    card.appendChild(el('h3', null, (actWoopDraft.id ? '✏️ 编辑' : '🌈') + ' WOOP · ' + step.label + '（' + (actWoopStep + 1) + '/4）'));
    card.appendChild(el('p', 'muted', '顺序：愿望 → 结果 → 内心障碍（可附外部提示）→ 计划。'));

    function goStep(n) {
      actWoopStep = n;
      actRenderWoopModal();
    }

    if (actWoopStep < 2) {
      const ta = el('textarea', 'wrong-input');
      ta.placeholder = step.ph;
      ta.value = actWoopDraft[step.key] || '';
      card.appendChild(el('span', 'mini-label', step.title));
      card.appendChild(ta);
      const btns = el('div', 'wrong-input-btns');
      if (actWoopStep > 0) {
        const back = el('button', 'btn', '上一步');
        back.addEventListener('click', function () {
          actWoopDraft[step.key] = ta.value;
          goStep(actWoopStep - 1);
        });
        btns.appendChild(back);
      }
      const next = el('button', 'btn primary', '下一步');
      next.addEventListener('click', function () {
        const v = ta.value.trim();
        if (!v) { toast(step.title + '不能为空'); return; }
        actWoopDraft[step.key] = v;
        goStep(actWoopStep + 1);
      });
      btns.appendChild(next);
      const cancel = el('button', 'btn', '取消');
      cancel.addEventListener('click', function () {
        const m = document.querySelector('.map-modal.woop-modal');
        if (m) m.remove();
        actWoopDraft = null;
      });
      btns.appendChild(cancel);
      card.appendChild(btns);
    } else if (actWoopStep === 2) {
      // O · 内心障碍 + 外部提示（原环境审计并入）
      card.appendChild(el('span', 'mini-label', '内心障碍（因为我……）'));
      const ta = el('textarea', 'wrong-input');
      ta.value = actWoopDraft.obstacle || '';
      ta.placeholder = step.ph;
      card.appendChild(ta);
      const hint = el('div', 'act-hint');
      card.appendChild(hint);
      ta.addEventListener('input', function () {
        const v = actValidateObstacle(ta.value);
        hint.textContent = ta.value.trim() ? (v.ok ? '' : v.hint) : '';
        hint.className = 'act-hint' + (v.ok || !ta.value.trim() ? '' : ' warn');
      });
      const v0 = actValidateObstacle(ta.value);
      hint.textContent = v0.ok ? '' : v0.hint;
      hint.className = 'act-hint' + (v0.ok ? '' : ' warn');

      card.appendChild(el('span', 'mini-label', '外部提示（可选）→ 移除 / 改造'));
      card.appendChild(el('p', 'muted', '移除提示 ≫ 在提示面前硬扛。数字 / 物理 / 路线。'));
      const list = el('div', 'audit-cue-list');
      (actWoopDraft.cues || []).forEach(function (c, idx) {
        const row = el('div', 'audit-cue-row');
        row.appendChild(el('div', 'act-ifthen-main', (idx + 1) + '. ' + c.text));
        const typeLabel = (ACT_CUE_TYPES.filter(function (t) { return t[0] === c.cueType; })[0] || [])[1] || '';
        const methodLabel = (ACT_METHODS.filter(function (m) { return m[0] === c.method; })[0] || [])[1] || '';
        row.appendChild(el('div', 'muted', typeLabel + ' · ' + (c.strategy === 'remove' ? '移除' : '改造') + ' · ' + methodLabel + (c.note ? ' · ' + c.note : '')));
        const del = el('button', 'btn small danger', '删');
        del.addEventListener('click', function () {
          actWoopDraft.cues.splice(idx, 1);
          actRenderWoopModal();
        });
        row.appendChild(del);
        list.appendChild(row);
      });
      card.appendChild(list);

      const addBox = el('div', 'audit-add');
      const cueText = el('input', 'wrong-input');
      cueText.type = 'text';
      cueText.placeholder = '提示描述，如「手机放在床头」…';
      addBox.appendChild(cueText);
      let cueType = 'prior';
      const typeWrap = el('div', 'chips');
      ACT_CUE_TYPES.forEach(function (t) {
        const chip = el('button', 'chip' + (t[0] === cueType ? ' active' : ''), t[1]);
        chip.addEventListener('click', function () {
          cueType = t[0];
          typeWrap.querySelectorAll('.chip').forEach(function (c) { c.classList.remove('active'); });
          chip.classList.add('active');
        });
        typeWrap.appendChild(chip);
      });
      addBox.appendChild(typeWrap);
      let strategy = 'remove';
      const stratWrap = el('div', 'chips');
      [['remove', '移除提示'], ['transform', '改造提示']].forEach(function (s) {
        const chip = el('button', 'chip' + (s[0] === strategy ? ' active' : ''), s[1]);
        chip.addEventListener('click', function () {
          strategy = s[0];
          stratWrap.querySelectorAll('.chip').forEach(function (c) { c.classList.remove('active'); });
          chip.classList.add('active');
        });
        stratWrap.appendChild(chip);
      });
      addBox.appendChild(stratWrap);
      let method = 'digital';
      const methodWrap = el('div', 'chips');
      ACT_METHODS.forEach(function (m) {
        const chip = el('button', 'chip' + (m[0] === method ? ' active' : ''), m[1]);
        chip.addEventListener('click', function () {
          method = m[0];
          methodWrap.querySelectorAll('.chip').forEach(function (c) { c.classList.remove('active'); });
          chip.classList.add('active');
        });
        methodWrap.appendChild(chip);
      });
      addBox.appendChild(methodWrap);
      const noteIn = el('input', 'wrong-input');
      noteIn.type = 'text';
      noteIn.placeholder = '做法（可选），如「删掉短视频 App」…';
      addBox.appendChild(noteIn);
      const addBtn = el('button', 'btn', '＋ 添加提示');
      addBtn.addEventListener('click', function () {
        const t = cueText.value.trim();
        if (!t) { toast('请填写提示描述'); return; }
        actWoopDraft.cues.push({
          id: actUid('cue'),
          text: t,
          cueType: cueType,
          strategy: strategy,
          method: method,
          note: noteIn.value.trim()
        });
        actRenderWoopModal();
      });
      addBox.appendChild(addBtn);
      card.appendChild(addBox);

      const btns = el('div', 'wrong-input-btns');
      const back = el('button', 'btn', '上一步');
      back.addEventListener('click', function () {
        actWoopDraft.obstacle = ta.value;
        goStep(1);
      });
      const next = el('button', 'btn primary', '下一步：计划');
      next.addEventListener('click', function () {
        const v = ta.value.trim();
        if (!v) { toast('内心障碍不能为空'); return; }
        const ov = actValidateObstacle(v);
        if (!ov.ok) { toast(ov.hint); return; }
        actWoopDraft.obstacle = v;
        goStep(3);
      });
      btns.appendChild(back);
      btns.appendChild(next);
      const cancel = el('button', 'btn', '取消');
      cancel.addEventListener('click', function () {
        const m = document.querySelector('.map-modal.woop-modal');
        if (m) m.remove();
        actWoopDraft = null;
      });
      btns.appendChild(cancel);
      card.appendChild(btns);
    } else {
      // P：如果-那么（主干内嵌，不再单列计划库）
      card.appendChild(el('span', 'mini-label', '如果（外部情境）'));
      const ifTa = el('textarea', 'wrong-input');
      ifTa.value = actWoopDraft.planIf || '';
      ifTa.placeholder = '如果 [时间/地点/前序行为]…';
      card.appendChild(ifTa);
      const hintIf = el('div', 'act-hint');
      card.appendChild(hintIf);

      card.appendChild(el('span', 'mini-label', '那么（无需再决策的动作）'));
      const thenTa = el('textarea', 'wrong-input');
      thenTa.value = actWoopDraft.planThen || '';
      thenTa.placeholder = '那么我将 [具体动作]…';
      card.appendChild(thenTa);
      const hintThen = el('div', 'act-hint');
      card.appendChild(hintThen);

      function refreshP() {
        const v = actValidateIfThen(ifTa.value, thenTa.value);
        hintIf.textContent = v.if.ok ? '' : v.if.hint;
        hintIf.className = 'act-hint' + (v.if.ok ? '' : ' warn');
        hintThen.textContent = v.then.ok ? '' : v.then.hint;
        hintThen.className = 'act-hint' + (v.then.ok ? '' : ' warn');
      }
      ifTa.addEventListener('input', refreshP);
      thenTa.addEventListener('input', refreshP);
      refreshP();

      const btns = el('div', 'wrong-input-btns');
      const back = el('button', 'btn', '上一步');
      back.addEventListener('click', function () {
        actWoopDraft.planIf = ifTa.value;
        actWoopDraft.planThen = thenTa.value;
        goStep(2);
      });
      const done = el('button', 'btn primary', actWoopDraft.id ? '保存 WOOP' : '保存 WOOP');
      done.addEventListener('click', function () {
        const ifT = ifTa.value.trim();
        const thenT = thenTa.value.trim();
        if (!ifT || !thenT) { toast('计划中的「如果」与「那么」不能为空'); return; }
        const d = loadAct();
        const now = Date.now();
        const payload = {
          wish: actWoopDraft.wish,
          outcome: actWoopDraft.outcome,
          obstacle: actWoopDraft.obstacle,
          cues: (actWoopDraft.cues || []).slice(),
          planIf: ifT,
          planThen: thenT,
          updatedAt: now
        };
        if (actWoopDraft.id) {
          const hit = d.woops.filter(function (x) { return x.id === actWoopDraft.id; })[0];
          if (hit) {
            hit.wish = payload.wish;
            hit.outcome = payload.outcome;
            hit.obstacle = payload.obstacle;
            hit.cues = payload.cues;
            hit.planIf = payload.planIf;
            hit.planThen = payload.planThen;
            hit.updatedAt = now;
          }
        } else {
          d.woops.push(Object.assign({ id: actUid('woop'), createdAt: now }, payload));
        }
        saveAct(d);
        const m = document.querySelector('.map-modal.woop-modal');
        if (m) m.remove();
        actWoopDraft = null;
        renderApp();
        toast('WOOP 已保存');
      });
      btns.appendChild(back);
      btns.appendChild(done);
      card.appendChild(btns);
    }

    modal.appendChild(card);
    document.body.appendChild(modal);
  }
  // ---------------- 帮助子页：RSIP 设计手册（V2-E） ----------------
  // 界面少长科普；科学细节/依据走知识库短链，口径与 map.mjs 一致。
  function actOpenKb(entryId) {
    // 与 map.mjs 同 IIFE 作用域：直接选中条目后进知识库
    try { kbSel = String(entryId); } catch (e) {}
    currentView = 'principle';
    renderApp();
  }

  function actHelpStrategy(name, line, tip) {
    const row = el('div', 'act-strategy');
    row.appendChild(el('div', 'act-strategy-name', name));
    row.appendChild(el('div', null, line));
    if (tip) row.appendChild(el('div', 'muted', tip));
    return row;
  }

  // 帮助页入口按钮：指向对应视图（专注链已升为行动默认视图 → 帮助页入口一律指 actFocus）
  function actHelpNavChip(label, view) {
    const b = el('button', 'btn small', label);
    b.setAttribute('data-action', 'nav');
    b.setAttribute('data-arg', view);
    return b;
  }

  function renderActHelp(wrap) {
    wrap.appendChild(el('h2', null, '📖 RSIP · 设计手册'));
    wrap.appendChild(el('p', 'muted', '按二级导航顺序速查：专注链 → 计划 → 习惯树（含规则）+ 设计四攻略。科学依据见知识库，这里只给可执行要点。'));

    // 目录：点按跳到对应小节；锚点 = 各小节面板 id
    const toc = el('div', 'act-panel act-help-toc');
    toc.appendChild(el('div', 'mini-label', '目录'));
    const tocRow = el('div', 'chips');
    [
      ['专注链', '#act-help-focus'],
      ['计划', '#act-help-plan'],
      ['习惯树 · 攻略', '#act-help-habit'],
      ['习惯树 · 规则', '#act-help-habit-rules'],
      ['详见知识库', '#act-help-kb']
    ].forEach(function (pair) {
      const b = el('button', 'chip', pair[0]);
      b.setAttribute('data-anchor', pair[1]);
      b.addEventListener('click', function () {
        const target = document.querySelector(pair[1]);
        if (target && target.scrollIntoView) target.scrollIntoView({ block: 'start' });
      });
      tocRow.appendChild(b);
    });
    toc.appendChild(tocRow);
    wrap.appendChild(toc);

    const panels = [];

    const sec1 = el('div', 'act-panel act-help-page');
    sec1.id = 'act-help-habit';
    sec1.appendChild(el('h3', null, '设计四攻略（习惯树 · RSIP）'));
    sec1.appendChild(actHelpStrategy(
      '① 零敲牛皮糖',
      '动作小到不可能失败；每日最多 1 个新节点入树。',
      '内化一点一点涨，失败不丢——碎片时间也能完成的动作优先。'
    ));
    sec1.appendChild(actHelpStrategy(
      '② 农村包围城市',
      '先建外围易行节点，再用父子层级逼近核心难习惯。',
      '树用来「围」不是「冲」：外围站稳再打中心。'
    ));
    sec1.appendChild(actHelpStrategy(
      '③ 组容错',
      '同标签成保护组；组内有人维持时，本次漏做不因组内保护被移除。',
      'minK 可编辑；全部超标才整组失败。一个人倒下 ≠ 整片倒下。'
    ));
    sec1.appendChild(actHelpStrategy(
      '④ 不破不立',
      '坏习惯是替换不是消灭；在 WOOP 障碍步列外部提示并移除/改造。',
      '失败回习惯库、内化保留，可再入树——破了还能立。'
    ));
    sec1.appendChild(actHelpNavChip('去习惯树 →', 'actHabit'));
    panels.push(sec1);

    const sec2 = el('div', 'act-panel act-help-page');
    sec2.id = 'act-help-focus';
    sec2.appendChild(el('h3', null, '专注链 · CTDP 简述'));
    const ul2 = el('ul');
    [
      '神圣座位：固定触发说明 +「就座」启动，成功记 #N 工作量证明。',
      '下必为例：可疑行为二选一——清链重来，或永久允许此例外（进判例表）。',
      '预约链：信号后 15 分钟内启动；侦查任务 5 分钟低门槛，可延长。',
      '精锐/普通链 + 继位：精锐崩溃由最强普通链继承。'
    ].forEach(function (t) { ul2.appendChild(el('li', null, t)); });
    sec2.appendChild(ul2);
    const ctdpLink = el('button', 'btn small', '知识库 · 专注链 CTDP →');
    ctdpLink.addEventListener('click', function () { actOpenKb('ctdp'); });
    sec2.appendChild(ctdpLink);
    sec2.appendChild(actHelpNavChip('去专注链 →', 'actFocus'));
    panels.push(sec2);

    const sec3 = el('div', 'act-panel act-help-page');
    sec3.id = 'act-help-plan';
    sec3.appendChild(el('h3', null, '计划 · WOOP 速查'));
    const ul3 = el('ul');
    [
      'W 愿望：一两句写清对你真正重要的愿望。',
      'O 结果：愿望实现后最好的画面。',
      'O 障碍：内心障碍写成「因为我……」；可附外部提示 → 移除/改造（数字/物理/路线）。',
      'P 计划：如果 [外部情境]，那么我将 [无需再决策的动作]。',
      '计划主干只有 WOOP；如果-那么是 P 步，提示清单在障碍步。'
    ].forEach(function (t) { ul3.appendChild(el('li', null, t)); });
    sec3.appendChild(ul3);
    const woopLink = el('button', 'btn small', '知识库 · WOOP →');
    woopLink.addEventListener('click', function () { actOpenKb('woop'); });
    sec3.appendChild(woopLink);
    sec3.appendChild(actHelpNavChip('去计划 →', 'actPlan'));
    panels.push(sec3);

    const sec4 = el('div', 'act-panel act-help-page');
    sec4.id = 'act-help-habit-rules';
    sec4.appendChild(el('h3', null, '习惯树 · 规则简述'));
    const ul4 = el('ul');
    [
      '每日最多 1 个新节点入树；当日成功后可继续点亮。',
      '失败：节点回习惯库，级联熄灭子孙；内化进度不丢。',
      '节点显示标题 / 内化条（0–100）/ 强化 +n；点击选中后可改父级。',
      '内化 ≥50 强化保底 +1，≥100 保底 +2；失败降级 −1，子孙不连坐；可手动升/降。',
      '组容错：同组维持数 ≥ minK 时，本次超标成员受组内保护；minK 可在面板或选中节点处编辑。',
      '每日检查：未履行 miss+1，超容忍天数判失败；已履行 miss 清零并记内化。',
      '过程反馈仅内化条 / 强化位 / 次数——无连击惩罚、无奖励兑换。',
      '内化接近满时，行为趋于「定式」——无需再决策的自动反应。'
    ].forEach(function (t) { ul4.appendChild(el('li', null, t)); });
    sec4.appendChild(ul4);
    const rsipLink = el('button', 'btn small', '知识库 · 习惯树 RSIP →');
    rsipLink.addEventListener('click', function () { actOpenKb('rsip'); });
    sec4.appendChild(rsipLink);
    panels.push(sec4);

    const sec5 = el('div', 'act-panel act-help-page');
    sec5.id = 'act-help-kb';
    sec5.appendChild(el('h3', null, '详见知识库'));
    const links = el('div', 'act-help-kb-links');
    [
      ['ctdp', '专注链 · CTDP'],
      ['woop', 'WOOP'],
      ['if-then', '执行意图'],
      ['env', '提示与替换'],
      ['rsip', '习惯树 · RSIP'],
      ['process-fb', '过程反馈']
    ].forEach(function (pair) {
      const b = el('button', 'chip', pair[1]);
      b.addEventListener('click', function () { actOpenKb(pair[0]); });
      links.appendChild(b);
    });
    sec5.appendChild(links);
    panels.push(sec5);

    // 页面顺序 = 二级导航顺序：专注链 → 计划 → 习惯树（攻略 + 规则）→ 详见知识库
    [sec2, sec3, sec1, sec4, sec5].forEach(function (p) { wrap.appendChild(p); });
  }

  // ---------------- 渲染：行动壳 / 计划区 ----------------
  function renderAct() {
    const app = document.getElementById('app');
    const wrap = el('div', 'act-wrap');
    const isHelp = currentView === 'actHelp';
    const isHabit = currentView === 'actHabit';
    const isFocus = currentView === 'actFocus';
    actView = isHelp ? 'help' : (isHabit ? 'habit' : (isFocus ? 'focus' : 'plan'));

    if (isHelp) {
      renderActHelp(wrap);
      app.appendChild(wrap);
      return;
    }

    if (isHabit) {
      wrap.appendChild(el('h2', null, '🌳 习惯树'));
      renderHabitSection(wrap);
      app.appendChild(wrap);
      return;
    }

    if (isFocus) {
      wrap.appendChild(el('h2', null, '⛓️ 专注链'));
      renderFocusSection(wrap);
      app.appendChild(wrap);
      return;
    }

    // 计划区：WOOP 主干（如果-那么 = P 步，外部提示 = 障碍步）
    wrap.appendChild(el('h2', null, '📋 计划 · WOOP'));
    const head = el('div', 'act-section-head');
    head.appendChild(el('h3', null, 'WOOP 记录'));
    const add = el('button', 'btn primary', '开始 WOOP');
    add.addEventListener('click', function () { actOpenWoop(null); });
    head.appendChild(add);
    wrap.appendChild(head);

    const d = loadAct();
    if (!d.woops.length) {
      const empty = el('div', 'act-panel');
      empty.appendChild(illus('empty-plan'));
      empty.appendChild(el('p', null, '还没有 WOOP。四步：愿望 → 结果 → 内心障碍（可附外部提示）→ 计划。'));
      wrap.appendChild(empty);
    } else {
      d.woops.slice().reverse().forEach(function (w) {
        wrap.appendChild(actWoopCard(w));
      });
    }

    app.appendChild(wrap);
  }

  function actWoopCard(w) {
    const card = el('div', 'act-ifthen-card');
    card.appendChild(el('div', 'act-ifthen-main', 'W：' + w.wish));
    card.appendChild(el('div', 'muted', 'O：' + w.outcome));
    const cues = w.cues || [];
    card.appendChild(el('div', 'muted', '障碍：' + w.obstacle + (cues.length ? ' · 外部提示 ' + cues.length + ' 条' : '')));
    if (cues.length) {
      const cueBox = el('div', 'muted');
      cueBox.style.marginTop = '2px';
      cueBox.textContent = cues.map(function (c) {
        return (c.strategy === 'remove' ? '移除·' : '改造·') + c.text;
      }).join('；');
      card.appendChild(cueBox);
    }
    card.appendChild(el('div', 'muted', 'P：' + actFormatIfThen({ if: w.planIf, then: w.planThen })));
    const btns = el('div', 'act-ifthen-btns');
    const edit = el('button', 'btn small', '编辑');
    edit.addEventListener('click', function () { actOpenWoop(w); });
    const del = el('button', 'btn small danger', '删除');
    del.addEventListener('click', function () { actDeleteWoop(w.id); });
    btns.appendChild(edit);
    btns.appendChild(del);
    card.appendChild(btns);
    return card;
  }

  // 主页：计划模块入口——WOOP 主干
  function actHomePlanSection(key, title, countText, bodyNodes) {
    const sec = el('div', 'act-home-plan-sec');
    const head = el('div', 'act-home-plan-sec-head');
    const fold = el('button', 'act-home-fold', homePlanFold[key] ? '▸' : '▾');
    fold.type = 'button';
    fold.title = homePlanFold[key] ? '展开' : '折叠';
    fold.setAttribute('aria-label', homePlanFold[key] ? '展开' : '折叠');
    fold.addEventListener('click', function (e) {
      e.stopPropagation();
      homePlanFold[key] = !homePlanFold[key];
      renderApp();
    });
    head.appendChild(fold);
    const titleBtn = el('button', 'act-home-plan-sec-title', title + ' · ' + countText);
    titleBtn.type = 'button';
    titleBtn.addEventListener('click', function () {
      currentModule = 'act';
      currentView = 'actPlan';
      renderApp();
    });
    head.appendChild(titleBtn);
    sec.appendChild(head);
    if (!homePlanFold[key] && bodyNodes.length) {
      const body = el('div', 'act-home-plan-body');
      bodyNodes.forEach(function (n) { body.appendChild(n); });
      sec.appendChild(body);
    } else if (!homePlanFold[key]) {
      sec.appendChild(el('div', 'muted act-home-plan-empty', '暂无条目'));
    }
    return sec;
  }

  function renderHomePlanEntry() {
    const d = loadAct();
    const box = el('div', 'act-home-entry act-home-plan');
    const head = el('div', 'act-home-plan-head');
    head.appendChild(el('div', 'act-home-entry-title', '📋 计划 · WOOP'));
    const go = el('button', 'act-home-entry-go', '进入 ▶');
    go.type = 'button';
    go.addEventListener('click', function () {
      currentModule = 'act';
      currentView = 'actPlan';
      renderApp();
    });
    head.appendChild(go);
    box.appendChild(head);

    const cols = el('div', 'act-home-plan-cols');
    const woopNodes = d.woops.slice().reverse().map(function (w) {
      const line = el('div', 'act-home-ifthen-line');
      line.textContent = 'W：' + w.wish + ' → ' + w.planThen;
      return line;
    });
    cols.appendChild(actHomePlanSection('woop', 'WOOP', String(d.woops.length), woopNodes));
    box.appendChild(cols);
    return box;
  }

  // 主页：习惯树独立入口（待检 / 今日 / 活跃）
  function renderHomeHabitEntry() {
    let due = 0, done = 0, total = 0;
    if (typeof habitHomeCounts === 'function') {
      const hc = habitHomeCounts();
      due = hc.due; done = hc.done; total = hc.total;
    }
    const box = el('button', 'act-home-entry act-home-habit');
    const left = el('div', 'act-home-entry-main');
    left.appendChild(el('div', 'act-home-entry-title', '🌳 习惯树'));
    left.appendChild(el('div', 'muted', '待检 ' + due + ' · 今日 ' + done + '/' + total + ' · 活跃 ' + total));
    box.appendChild(left);
    box.appendChild(el('span', 'act-home-entry-go', '进入 ▶'));
    box.addEventListener('click', function () {
      currentModule = 'act';
      currentView = 'actHabit';
      renderApp();
    });
    return box;
  }

export { actValidateIf, actValidateThen, actValidateIfThen, actValidateObstacle, actFormatIfThen, actSanitize, actDefaultData, actIsThisWeek, actTodaySummary, ACT_IF_HINT, ACT_THEN_HINT, ACT_OBSTACLE_HINT };
