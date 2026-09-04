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
          if (!deck.length) return false;
          pos = Math.max(0, Math.min(s.pos | 0, deck.length));
          frontier = Math.max(0, Math.min(s.frontier | 0, deck.length));
          // 已学完（pos 与 frontier 都越过队尾）的会话不恢复——返回 false 让 buildSession 重建，
          // 以纳入新到期的复习卡；否则会永远停留在「额度用完」旧队列，第二天到期的卡进不来
          if (frontier >= deck.length && pos >= frontier) {
            deck = []; pos = 0; frontier = 0; pendingAdvance = false;
            return false;
          }
          // 防御：pos 越过队尾但 frontier 未学完（不应发生），回退到队尾
          if (pos >= deck.length) pos = deck.length - 1;
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
    const t = todayStr();
    // 「今天已学习 X 张」按去重卡片统计（DB.log.detail 记录每个卡 id 只出现一次），而不是每次评分累加
    const det = (DB.log && DB.log.detail && DB.log.detail[t]) || null;
    if (det && typeof det === 'object') {
      const keys = Object.keys(det).filter(function (id) { return DATA.some(function (f) { return f.id === id; }); });
      return keys.length;
    }
    return (DB.log && DB.log.daily && DB.log.daily[t]) || 0;
  }

  // ---------------- 目标倒计时（原「考研倒计时」，目标名可编辑文本，便于考研后复用） ----------------
  function goalTitle() { return (DB && DB.settings && typeof DB.settings.goalTitle === 'string' && DB.settings.goalTitle.trim()) ? DB.settings.goalTitle.trim() : GOAL_DEFAULT; }
  function examDateObj() {
    const s = (DB && DB.settings && DB.settings.examDate) || '';
    if (s) {
      const d = new Date(s + 'T00:00:00');
      if (!isNaN(d.getTime())) return d;
    }
    return null;
  }
  function countdownDays() {
    const exam = examDateObj();
    if (!exam) return null;
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    return Math.max(0, Math.round((exam - today) / 86400000));
  }
  function updateCountdown() {
    const badge = document.getElementById('countdownBadge');
    if (!badge || !DB) return;
    const d = countdownDays();
    if (d == null) { badge.classList.add('hidden'); return; }
    badge.classList.remove('hidden');
    const g = goalTitle();
    badge.textContent = d === 0 ? '🎯 今天是' + g : '📅 距' + g + ' ' + d + ' 天';
    badge.title = '目标日期：' + fmtDate(examDateObj()) + '（可在设置中修改）';
    badge.classList.toggle('urgent', d > 0 && d <= 30);
  }
  const COUNTDOWN_SEEN_KEY = 'athena_countdown_seen';
  function maybeShowCountdownPopup() {
    if (countdownDays() == null) return;
    try {
      if (localStorage.getItem(COUNTDOWN_SEEN_KEY) === todayStr()) return;
      localStorage.setItem(COUNTDOWN_SEEN_KEY, todayStr());
    } catch (e) {}
    showCountdownPopup();
  }
  function showCountdownPopup() {
    const d = countdownDays();
    if (d == null) return;
    const exam = examDateObj();
    const g = goalTitle();
    const modal = el('div', 'countdown-modal');
    const backdrop = el('div', 'countdown-backdrop');
    backdrop.setAttribute('data-action', 'countdown-close');
    modal.appendChild(backdrop);
    const card = el('div', 'countdown-card');
    card.appendChild(el('div', 'countdown-hero', '📚'));
    card.appendChild(el('div', 'countdown-title', d === 0 ? '今天是' + g + '日！' : '距离' + g + '还有'));
    if (d > 0) {
      const days = el('div', 'countdown-days');
      days.appendChild(el('span', 'countdown-num', String(d)));
      days.appendChild(el('span', 'countdown-unit', '天'));
      card.appendChild(days);
    }
    card.appendChild(el('p', 'muted', '目标日期：' + fmtDate(exam) + '（手动设置）'));
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
    if ((c.state === 'learning' || c.state === 'relearning')) return 15;
    const d = c.ivl;
    if (d < 1) return 25;
    if (d < 7) return 45;
    if (d < 21) return 65;
    if (d < 60) return 85;
    return 95;
  }

  function mastery(id) {
    const c = card(id);
    let score;
    if (c.state === 'new') {
      score = 0;
    } else {
      // 掌握度 = 稳定度 S 到目标 S_N 的比例（⚠️自设计：对数压缩，S 量纲而非半衰期 h 量纲，避免 h=90·S 放大导致虚高）
      //   学习/重学阶段用短时稳定度（FSRS 已在维护：Again 降、Good/Easy 不降，随评分真实变化）；复习阶段用长期稳定度。
      //   s = ln(1+S)/ln(1+S_N)，S≥S_N（毕业）即 100%；对数使「记忆强度增长先快后慢」、避免早期全 0。
      const S = (typeof c.stab === 'number' && c.stab > 0) ? c.stab : 0;
      const sN = targetS();
      const s = Math.max(0, Math.min(1, Math.log(1 + S) / Math.log(1 + sN)));
      score = Math.round(100 * s);
    }
    score = Math.max(0, Math.min(100, score));
    let label;
    if (isGraduated(c)) label = '毕业';
    else if (score < 10) label = '未学';
    else if (score < 25) label = '初学';
    else if (score < 45) label = '生疏';
    else if (score < 65) label = '巩固中';
    else if (score < 85) label = '已掌握';
    else if (score < 95) label = '熟练';
    else label = '稳固';
    return { pct: score, label: label };
  }

  // 当前可提取性 R（预测回忆概率，%）：与「掌握度」解耦，用于趋势图（实际 vs 预测同量纲）与卡面双维度
  function currentR(id) {
    const c = card(id);
    if (c.state !== 'review' || !(c.stab > 0)) return null;
    const days = Math.max(0, (Date.now() - (c.lastR || Date.now())) / DAY);
    return Math.round(fsrsRetention(days, c.stab) * 100);
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
    if ((c.state === 'learning' || c.state === 'relearning')) return '再作答几次（答「简单」）后进入间隔记忆';
    return '间隔 ' + c.ivl + ' 天后再复习';
  }
  function masteryDeltaText() {
    if (lastMasteryDelta == null) return '已记录';
    return '掌握度 ' + (lastMasteryDelta >= 0 ? '+' : '') + lastMasteryDelta;
  }

  // 记忆算法可视化：下次复习时间 + 掌握度趋势曲线 + 实际/预测遗忘曲线
  function fmtDayMs(ts) { const d = new Date(ts); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); }
  function svgText(tag, x, y, str, attrsExtra) {
    const t = svgEl(tag, Object.assign({ x: x, y: y, 'font-size': '9', fill: '#999' }, attrsExtra || {}));
    t.textContent = str;
    return t;
  }
  function nextReviewText(c) {
    if (c.state === 'new') return '待学习';
    if ((c.state === 'learning' || c.state === 'relearning')) {
      const min = Math.max(1, Math.round((c.due - Date.now()) / 60000));
      return '学习中 · 第 ' + ((c.step | 0) + 1) + ' 步（约 ' + min + ' 分钟后重现）';
    }
    return '下次复习：' + fmtDayMs(c.due) + '（间隔 ' + c.ivl + ' 天）';
  }
  // 掌握度趋势：实际掌握度历史点（每次评分后跳变）+ 100% 目标参考线
  function svgMasteryTrend(id) {
    const c = card(id);
    const hist = (c.hist || []);
    const wrap = el('div', 'chart-wrap');
    wrap.appendChild(el('div', 'chart-label muted', '掌握度趋势（时间）· ● 每次评分后的掌握度 · ─ 目标(100%)'));
    if (hist.length < 2) { wrap.appendChild(el('p', 'muted', '📈 数据积累中——学习 2 次后显示趋势。')); return wrap; }
    let minT = hist[0].t;
    let maxT = hist[hist.length - 1].t;
    const spanT = Math.max(1, (maxT - minT) || 1);
    const W = 300, H = 118, padL = 28, padR = 8, padT = 12, padB = 18;
    const X = function (t) { return padL + (t - minT) / spanT * (W - padL - padR); };
    const Y = function (m) { return padT + (1 - m / 100) * (H - padT - padB); };
    const svg = svgEl('svg', { viewBox: '0 0 ' + W + ' ' + H, width: '100%' });
    [0, 50, 100].forEach(function (m) { const y = Y(m); svg.appendChild(svgEl('line', { x1: padL, x2: W - padR, y1: y, y2: y, stroke: '#E7E4DD', 'stroke-width': '1' })); svg.appendChild(svgText('text', padL - 4, y + 3, String(m), { 'text-anchor': 'end' })); });
    // 目标参考线（100% = 毕业/稳固）
    svg.appendChild(svgEl('line', { x1: padL, x2: W - padR, y1: Y(100), y2: Y(100), stroke: '#A9C9E8', 'stroke-width': '1', 'stroke-dasharray': '4 3' }));
    // 实际掌握度曲线 + 点
    const pts = hist.map(function (p) { return X(p.t) + ',' + Y(p.m); }).join(' ');
    svg.appendChild(svgEl('polyline', { points: pts, fill: 'none', stroke: '#D4537E', 'stroke-width': '2' }));
    hist.forEach(function (p) {
      const cEl = svgEl('circle', { cx: X(p.t), cy: Y(p.m), r: '3', fill: '#378ADD' });
      const tt = svgEl('title', {}); tt.textContent = fmtDayMs(p.t) + ' 掌握度 ' + p.m + '%';
      cEl.appendChild(tt); svg.appendChild(cEl);
    });
    // 日期横坐标
    svg.appendChild(svgText('text', padL, H - 5, fmtDayMs(minT)));
    svg.appendChild(svgText('text', W - padR, H - 5, fmtDayMs(maxT), { 'text-anchor': 'end' }));
    wrap.appendChild(svg);
    return wrap;
  }
  function memoryBox(id, hiddenClass) {
    const c = card(id);
    const box = el('div', 'memory-box' + (hiddenClass || ''));
    box.appendChild(el('div', 'memory-badge', '🧠 记忆'));
    box.appendChild(el('div', 'memory-sched muted', '🗓 ' + nextReviewText(c)));
    if (c.state === 'review') {
      const h = cardHalflife(c);
      const targetText = targetLinked()
        ? ('目标：稳至' + goalTitle() + '(≥' + Math.round(TARGET_CONFIDENCE * 100) + '%) · 距' + goalTitle() + ' ' + countdownDays() + ' 天')
        : ('目标 S_N=' + Math.round(targetS()) + ' 天');
      box.appendChild(el('div', 'memory-fsrs muted', '📐 难度 ' + (c.diff || 5).toFixed(1) + ' · 稳定性 S=' + (c.stab || 0).toFixed(1) + ' 天 · ' + targetText + (isGraduated(c) ? ' · ✔已毕业' : '')));
    }
    box.appendChild(svgMasteryTrend(id));
    return box;
  }

  function stats() {
    const now = Date.now();
    let due = 0, learn = 0, review = 0, fresh = 0, mature = 0, pctSum = 0;
    DATA.forEach(function (f) {
      const c = card(f.id);
      pctSum += mastery(f.id).pct;
      if (c.state === 'new') fresh++;
      else if ((c.state === 'learning' || c.state === 'relearning')) { learn++; }
      else { if (c.due <= now) due++; else { review++; if (isGraduated(c)) mature++; } }
    });
    return { due: due, learn: learn, review: review, fresh: fresh, mature: mature, total: DATA.length, avg: Math.round(pctSum / DATA.length) };
  }

  // 记忆算法相关指标（供统计页可视化）
  function avgCurrentR() {
    let s = 0, n = 0;
    DATA.forEach(function (f) { const r = currentR(f.id); if (r != null) { s += r; n++; } });
    return n ? Math.round(s / n) : 0;
  }
  function graduatedCount() { return DATA.filter(function (f) { return isGraduated(card(f.id)); }).length; }
  function totalLapses() { return DATA.reduce(function (a, f) { return a + (card(f.id).lapses || 0); }, 0); }
  function stateCounts() {
    let fresh = 0, learn = 0, review = 0, grad = 0;
    DATA.forEach(function (f) {
      const c = card(f.id);
      if (c.state === 'new') fresh++;
      else if ((c.state === 'learning' || c.state === 'relearning')) learn++;
      else { review++; if (isGraduated(c)) grad++; }
    });
    return { fresh: fresh, learn: learn, review: review, grad: grad };
  }
  // 记忆强度（半衰期 h，天）分桶柱状图数据：[桶标签, 张数]
  function halflifeHistogram() {
    const buckets = [
      ['<7d', 0], ['7-30d', 0], ['30-90d', 0], ['90-180d', 0], ['180-365d', 0], ['≥365d', 0]
    ];
    DATA.forEach(function (f) {
      const h = cardHalflife(card(f.id));
      if (!(h > 0)) return;
      if (h < 7) buckets[0][1]++;
      else if (h < 30) buckets[1][1]++;
      else if (h < 90) buckets[2][1]++;
      else if (h < 180) buckets[3][1]++;
      else if (h < 365) buckets[4][1]++;
      else buckets[5][1]++;
    });
    return buckets;
  }

  function cardHalflife(c) { return (c.state === 'review' && typeof c.stab === 'number') ? fsrsHalflife(c.stab) : 0; }
  // 毕业目标稳定度 S（天）：卡片稳定度达到该值即视为「毕业/稳固」——语义为「停止复习后仍能 ≥90% 记得」的天数。
  // 开「与目标倒计时挂钩」：目标 S = 剩余天数（下限 TARGET_MIN_DAYS），等价要求目标日可提取性 ≥ TARGET_CONFIDENCE（90%）。
  //   因 R(S,S)=0.9，S 目标数值即「距目标天数」，直观合理（不再用半衰期 h=90·S，避免 120 天目标被显示成 1 万多天）。
  // 关「挂钩」：回退到用户手动填的固定目标稳定度（默认 90 天）。
  function targetS() {
    const manual = (DB && DB.settings && typeof DB.settings.targetS === 'number') ? DB.settings.targetS : TARGET_S_DEFAULT;
    if (!targetLinked()) return manual;
    const days = countdownDays();
    if (days == null) return manual;
    return Math.max(TARGET_MIN_DAYS, days);
  }
  // 是否与目标倒计时挂钩（用于记忆框/设置页文案）
  function targetLinked() { return !(DB && DB.settings && DB.settings.targetLinkExam === false) && countdownDays() != null; }
  function isGraduated(c) { return c.state === 'review' && (typeof c.stab === 'number' ? c.stab : 0) >= targetS(); }

  // 每日时间预算（秒）：按时间而非卡片数安排学习
  function budgetSec() { return Math.max(5, (DB && DB.settings && typeof DB.settings.minutesPerDay === 'number') ? DB.settings.minutesPerDay : MIN_PER_DAY_DEFAULT) * 60; }
  function budgetMin() { return Math.round(budgetSec() / 60); }
  function todayCostSec() { const t = todayStr(); return (DB && DB.log && DB.log.cost && DB.log.cost[t]) || 0; }
  function todayCostMin() { return Math.round(todayCostSec() / 60); }
  // 记录本次评分的复习成本（以评分档映射时间），计入今日预算
  function addCost(r) {
    const t = todayStr();
    if (!DB.log.cost) DB.log.cost = {};
    DB.log.cost[t] = (DB.log.cost[t] || 0) + (RATING_COST_S[r] || 3);
  }

  // 卡面「存储强度」文本：以稳定度 S（天）为准（毕业/掌握度均按 S 判），半衰期 h 仅作「遗忘到 50% 耗时」参考展示
  function memoryStrengthText(c) {
    if (c.state !== 'review') return '';
    const h = cardHalflife(c);
    return '存储强度 S=' + (c.stab || 0).toFixed(1) + '天（半衰期 h=' + h.toFixed(1) + '天，仅供参考）' + (isGraduated(c) ? ' · ✔已毕业' : '');
  }

  // 学习毕业：毕业时用「当前稳定度」（可能已被短时记忆 / 学习期遗忘压低）确定间隔
  function graduateReview(c, stab) {
    c.grad = 1; c.reps = 1; c.state = 'review';
    c.stab = Math.max(FSRS_S_MIN, (typeof stab === 'number') ? stab : c.stab);
    c.ivl = Math.max(1, Math.round(fsrsInterval(c.stab)));
    c.due = dayStart(Date.now()) + c.ivl * DAY;
  }

  // 学习阶段：时间步进（新卡 Learning 1 分钟 → 10 分钟）；复习遗忘进入 Relearning（10 分钟一步，FSRS-6 默认）
  const STEP_MS = [60 * 1000, 10 * 60 * 1000];
  const LAST_STEP = 1;                    // learning：第 1 步为最后一步（Good 过此步毕业）
  const RELEARN_MS = [10 * 60 * 1000];    // FSRS-6 relearning_steps = ['10m']
  const RELEARN_LAST_STEP = 0;            // relearning：仅 1 步（索引 0）
  // 四档评分：0 = 忘记(Again)；1 = 困难(Hard)；2 = 良好(Good)；3 = 简单(Easy)
  function applyRatingToCard(c, rating) {
    const now = Date.now();
    const G = rating + 1; // 0=Again→1, 1=Hard→2, 2=Good→3, 3=Easy→4
    const s = (typeof c.s === 'number') ? c.s : initialStrength(c);
    if (typeof c.step !== 'number') c.step = 0;
    // —— 学习 / 重学阶段（FSRS-6：Learning=[1m,10m]，Relearning=[10m]；短时记忆稳定度）——
    if (c.state === 'new' || (c.state === 'learning' || c.state === 'relearning') || c.state === 'relearning') {
      const isRelearn = (c.state === 'relearning');
      const steps = isRelearn ? RELEARN_MS : STEP_MS;
      const lastStep = isRelearn ? RELEARN_LAST_STEP : LAST_STEP;
      // 新卡首次评分建立初始 D/S；其后同日学习/重学步进用短时记忆稳定度更新（Again 降低、Good/Easy 不降）
      if (c.state === 'new' || !(c.fsrsInit)) {
        c.diff = fsrsInitDifficulty(G);
        c.stab = fsrsInitStability(G);
        c.fsrsInit = 1;
      } else {
        c.stab = fsrsShortTermStability(c.stab, G);
      }
      c.s = Math.max(0, s + (rating === 0 ? -25 : (rating === 3 ? 20 : (rating === 2 ? 12 : -8))));
      if (rating === 0) { // Again：回第 0 步
        c.step = 0; c.grad = 0; c.reps = 0; c.ivl = 0;
        c.state = isRelearn ? 'relearning' : 'learning';
        c.due = now + steps[0];
        return;
      }
      if (rating === 1) { // Hard：前进一步（不毕业）
        c.step = Math.min(c.step + 1, lastStep);
        c.state = isRelearn ? 'relearning' : 'learning';
        c.due = now + steps[c.step];
        return;
      }
      if (rating === 2) { // Good：前进一步，超过最后一步 → 毕业
        c.step = c.step + 1;
        if (c.step > lastStep) {
          graduateReview(c, c.stab);
        } else {
          c.state = isRelearn ? 'relearning' : 'learning';
          c.due = now + steps[c.step];
        }
        return;
      }
      graduateReview(c, c.stab); // Easy：直接毕业
      return;
    }
    // —— 复习阶段（FSRS-6：R(t,S) 遗忘曲线 + 难度/稳定性更新 + 期望保留率）——
    const daysSince = Math.max(0, (now - (c.lastR || c.due)) / DAY);
    const R = fsrsRetention(daysSince, c.stab);
    if (rating === 0) { // Again：遗忘 → 稳定性下降、难度上升，进入 Relearning 重学（10 分钟一步）
      c.step = 0; c.state = 'relearning'; c.grad = 0; c.reps = 0; c.ivl = 0;
      c.lapses++;
      c.diff = fsrsDifficulty(c.diff, 1);
      c.stab = fsrsLapseStability(c.diff, c.stab, R);
      c.s = Math.max(0, s - 25);
      c.due = now + RELEARN_MS[0];
      return;
    }
    if (rating === 1) { // Hard
      c.diff = fsrsDifficulty(c.diff, 2);
      c.stab = fsrsSuccessStability(c.diff, c.stab, R, 2);
      c.ivl = Math.max(1, Math.round(fsrsInterval(c.stab)));
      c.reps++; c.state = 'review'; c.s = Math.max(0, s - 8); c.due = dayStart(now) + c.ivl * DAY;
      return;
    }
    if (rating === 2) { // Good
      c.diff = fsrsDifficulty(c.diff, 3);
      c.stab = fsrsSuccessStability(c.diff, c.stab, R, 3);
      c.ivl = Math.max(1, Math.round(fsrsInterval(c.stab)));
      c.reps++; c.state = 'review'; c.s = Math.min(100, s + 12); c.due = dayStart(now) + c.ivl * DAY;
      return;
    }
    // Easy
    c.diff = fsrsDifficulty(c.diff, 4);
    c.stab = fsrsSuccessStability(c.diff, c.stab, R, 4);
    c.ivl = Math.max(1, Math.round(fsrsInterval(c.stab)));
    c.reps++; c.state = 'review'; c.s = Math.min(100, s + 20); c.due = dayStart(now) + c.ivl * DAY;
  }

  function applyRating(id, rating) { applyRatingToCard(card(id), rating); }

  // 预览：选择某个评分档后，距下次复习/重现的时长（用克隆卡跑一遍正版逻辑，不动真实数据）
  function previewNextTime(id, rating) {
    const clone = Object.assign({}, card(id));
    applyRatingToCard(clone, rating);
    // 毕业后按「自然日」展示整天间隔（与 due 对齐自然日一致，避免显示 0.2 天这种误导）；
    // 学习/重学阶段仍按精确分钟（1 分钟 / 10 分钟步进）展示。
    if (clone.state === 'review' && clone.ivl >= 1) return clone.ivl * DAY;
    return clone.due - Date.now(); // 毫秒
  }
  function fmtPreview(ms) {
    if (!(ms > 0)) return '即刻';
    const min = ms / 60000;
    if (min < 90) return Math.max(1, Math.round(min)) + ' 分钟';
    const days = min / 1440;
    return Math.round(days * 10) / 10 + ' 天';
  }

  // ---------------- 视图状态 ----------------
  let currentView = 'learn';
  let deck = [];
  let pos = 0;
  let frontier = 0;
  let pendingAdvance = false;
  let lastMasteryDelta = null;
  let lastRatingUndo = null;
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
