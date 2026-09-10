  function snapshotMastery() {
    if (!DB || !DATA) return;
    const t = todayStr();
    if (!DB.log.mastery) DB.log.mastery = {};
    if (DB.log.mastery[t] == null) {
      const s = stats();
      DB.log.mastery[t] = s.avg;
      if (!DB.log.metrics) DB.log.metrics = {};
      DB.log.metrics[t] = {
        avg: s.avg,                 // 平均掌握度（存储强度）
        avgR: avgCurrentR(),        // 平均当前可提取性 R
        due: s.due,                 // 待复习
        grad: graduatedCount(),     // 毕业卡数
        lapses: totalLapses(),      // 累计遗忘
        newCt: s.fresh, learn: s.learn, review: s.review,
        total: DATA.length
      };
      saveDB();
    }
  }

  // 统计页折线图（从每日 metrics 快照画一条趋势线，含图例/最新值）
  function sparkTrend(title, items, color, unit, fixedMax) {
    const box = el('div', 'stat-card');
    const head = el('div', 'trend-head');
    head.appendChild(el('strong', null, title));
    if (items.length) head.appendChild(el('span', 'trend-latest muted', '最新 ' + items[items.length - 1].value + (unit || '')));
    box.appendChild(head);
    if (items.length < 2) { box.appendChild(illus('stats-growing')); box.appendChild(el('p', 'muted', '数据积累中——每天打开应用记录一次，几天后显示趋势。')); return box; }
    const W = 680, H = 150, pad = 30;
    const vals = items.map(function (i) { return i.value; });
    let mn = (fixedMax != null) ? 0 : Math.min.apply(null, vals);
    let mx = (fixedMax != null) ? fixedMax : Math.max.apply(null, vals);
    if (mx - mn < 1e-6) { mn -= 1; mx += 1; }
    const svg = svgEl('svg', { viewBox: '0 0 ' + W + ' ' + H, width: '100%' });
    [mn, (mn + mx) / 2, mx].forEach(function (v) {
      const y = H - pad - (v - mn) / (mx - mn) * (H - 2 * pad);
      svg.appendChild(svgEl('line', { x1: pad, x2: W - pad, y1: y, y2: y, stroke: '#E7E4DD', 'stroke-width': '1' }));
      svg.appendChild(svgText('text', pad - 4, y + 3, String(Math.round(v)), { 'text-anchor': 'end' }));
    });
    const pts = items.map(function (i, idx) {
      return [pad + idx * (W - 2 * pad) / (items.length - 1), H - pad - (i.value - mn) / (mx - mn) * (H - 2 * pad)];
    });
    svg.appendChild(svgEl('path', { d: 'M ' + pts.map(function (p) { return p[0] + ' ' + p[1]; }).join(' L '), fill: 'none', stroke: color, 'stroke-width': '2' }));
    pts.forEach(function (p) { svg.appendChild(svgEl('circle', { cx: p[0], cy: p[1], r: '2.5', fill: color })); });
    const li = [0, Math.floor((items.length - 1) / 2), items.length - 1];
    li.forEach(function (idx, j) {
      const x = pts[idx][0];
      svg.appendChild(svgText('text', x, H - 4, items[idx].label, j === li.length - 1 ? { 'text-anchor': 'end' } : (j === 0 ? {} : { 'text-anchor': 'middle' })));
    });
    box.appendChild(svg);
    return box;
  }

  // ---------------- 学习报告（日/周/月/年聚合） ----------------
  let reportPeriod = 'day'; // 会话内状态，不持久化
  const REPORT_PERIODS = [['day', '日报'], ['week', '周报'], ['month', '月报'], ['year', '年报']];
  const REPORT_DAYS = { day: 1, week: 7, month: 30, year: 365 };

  function fmtStudyMs(ms) {
    const min = Math.round(ms / 60000);
    if (min < 1) return '0 分钟';
    if (min < 60) return min + ' 分钟';
    return Math.floor(min / 60) + ' 小时 ' + (min % 60) + ' 分';
  }

  function renderStudyReport() {
    const box = el('div', 'stat-card');
    const chips = el('div', 'chips');
    REPORT_PERIODS.forEach(function (p) {
      const b = el('button', 'chip' + (reportPeriod === p[0] ? ' active' : ''), p[1]);
      b.addEventListener('click', function () { reportPeriod = p[0]; renderApp(); });
      chips.appendChild(b);
    });
    box.appendChild(chips);

    const days = REPORT_DAYS[reportPeriod];
    const counts = (DB.log && DB.log.counts) || {};
    const study = (DB.log && DB.log.studyTime) || {};
    const daily = (DB.log && DB.log.daily) || {};
    const masteryLog = (DB.log && DB.log.mastery) || {};

    let studyMs = 0, n = 0, r = 0, w = 0, a = 0, activeDays = 0;
    for (let i = 0; i < days; i++) {
      const d = new Date(); d.setDate(d.getDate() - i);
      const key = fmtDate(d);
      const st = study[key] || 0;
      const c = counts[key];
      if (st > 0 || (daily[key] || 0) > 0 || c) activeDays++;
      studyMs += st;
      if (c) { n += (c.n || 0); r += (c.r || 0); w += (c.w || 0); a += (c.a || 0); }
    }

    // 掌握度变化：今日 vs 窗口起点前最近一次快照（日报即「vs 昨天」，最多回看 30 天）
    const cur = (masteryLog[todayStr()] != null) ? masteryLog[todayStr()] : stats().avg;
    let base = null;
    const lookback = (reportPeriod === 'day') ? 1 : days - 1;
    for (let i = lookback; i <= days + 30; i++) {
      const d = new Date(); d.setDate(d.getDate() - i);
      const k = fmtDate(d);
      if (masteryLog[k] != null) { base = masteryLog[k]; break; }
    }
    const deltaTxt = (base == null) ? '—' : ((cur - base >= 0 ? '+' : '') + (cur - base) + '%');

    const ov = el('div', 'stat-overview');
    const kpi = function (label, val, unit) { const c = el('div', 'stat-kpi'); c.appendChild(el('strong', null, String(val))); c.appendChild(el('span', 'muted', label + (unit || ''))); ov.appendChild(c); };
    kpi('专注时长', fmtStudyMs(studyMs), '');
    kpi('新学', n, ' 张');
    kpi('复习', r, ' 张');
    kpi('错题重做', w, ' 道');
    kpi('遗忘率', (n + r > 0) ? Math.round(a / (n + r) * 100) + '%' : '—', '');
    kpi('学习天数', activeDays + '/' + days, '');
    kpi('掌握度变化', deltaTxt, '');
    box.appendChild(ov);
    box.appendChild(el('p', 'muted', (function () {
      let base = '窗口：近 ' + days + ' 天。学习时长自 v1.16.0、新学/复习/错题分类计数自 v1.17.0 起记录，更早时段的聚合不完整。';
      if (n + r > 0) base += ' 遗忘率 = 「再来一次」÷ 总评分——FSRS 期望保留率 90%，约 10% 为设计工作点（偏高=挫败区，偏低=间隔偏保守）。';
      return base;
    })()));
    return box;
  }

  // ---------------- 未来负载预测 ----------------
  // 未来 days 天的到期量分桶（知识卡+错题卡；仅统计已进入复习排期的卡，
  // 新卡与学习/重学中的卡由学习行为决定、无法预测，不计入）。逾期未复习的计入「今天」。
  function dueForecast(days) {
    const buckets = new Array(days).fill(0);
    let beyond = 0;
    const today = dayStart(Date.now());
    const addCard = function (c) {
      if (!c || c.state !== 'review' || !c.due) return;
      let idx = Math.floor((dayStart(c.due) - today) / DAY);
      if (idx < 0) idx = 0;
      if (idx >= days) beyond++; else buckets[idx]++;
    };
    DATA.forEach(function (f) { addCard(card(f.id)); });
    Object.keys(DB.wrongs || {}).forEach(function (wid) { addCard(DB.wrongs[wid]); });
    return { buckets: buckets, beyond: beyond };
  }

  // 考试日预期：假设「每次到期都按良好复习」，模拟到考试日的 FSRS 稳定度增长，
  // 返回考试日的可提取性 R（0-1）。这是规划参考（每次复习会真实进一步提升）。
  function simulateExamRetention(c, examDays) {
    const examTs = dayStart(Date.now()) + examDays * DAY;
    let stab = c.stab, diff = c.diff, due = c.due, lastR = c.lastR || c.due;
    let guard = 0;
    while (due <= examTs && guard++ < 500) {
      const R = fsrsRetention(Math.max(0, (due - lastR) / DAY), stab);
      diff = fsrsDifficulty(diff, 3); // 良好
      stab = fsrsSuccessStability(diff, stab, R, 3);
      const ivl = Math.max(1, Math.round(fsrsInterval(stab)));
      lastR = due;
      due = dayStart(due) + ivl * DAY;
    }
    return fsrsRetention(Math.max(0, (examTs - lastR) / DAY), stab);
  }

  // 考试日展望：已排期卡片中，考试日预计仍能 ≥90% 记得的比例与平均可提取性
  function examOutlook() {
    const examDays = countdownDays();
    if (examDays == null || examDays <= 0) return null;
    let predictable = 0, ok = 0, rSum = 0;
    const evaluate = function (c) {
      if (!c || c.state !== 'review' || !(c.stab > 0)) return;
      predictable++;
      const R = simulateExamRetention(c, examDays);
      if (R >= TARGET_CONFIDENCE) ok++;
      rSum += R;
    };
    DATA.forEach(function (f) { evaluate(card(f.id)); });
    Object.keys(DB.wrongs || {}).forEach(function (wid) { evaluate(DB.wrongs[wid]); });
    if (!predictable) return null;
    return { examDays: examDays, pct: Math.round(ok / predictable * 100), avg: Math.round(rSum / predictable * 100) };
  }

  function forecastChart(buckets, examIdx) {
    const W = 680, H = 150, pad = 26, padTop = 20;
    const max = Math.max.apply(null, buckets.concat([1]));
    const svg = svgEl('svg', { viewBox: '0 0 ' + W + ' ' + H, width: '100%' });
    const bw = (W - pad * 2) / buckets.length;
    const base = H - pad;
    buckets.forEach(function (cnt, i) {
      const h = Math.round(cnt / max * (H - pad - padTop));
      const x = pad + i * bw;
      const rect = svgEl('rect', {
        x: (x + bw * 0.12).toFixed(1), y: base - h,
        width: (bw * 0.76).toFixed(1), height: Math.max(h, 1), rx: 3,
        fill: i === examIdx ? '#D4537E' : (i === 0 ? '#76AFE8' : '#B5D4F4')
      });
      const d = new Date(); d.setDate(d.getDate() + i);
      const t = svgEl('title', {});
      t.textContent = (i === 0 ? '今天' : (d.getMonth() + 1) + '月' + d.getDate() + '日') + '：到期 ' + cnt + ' 张' + (i === examIdx ? '（考试日 🎯）' : '');
      rect.appendChild(t);
      svg.appendChild(rect);
      if (cnt > 0) svg.appendChild(svgText('text', x + bw / 2, base - h - 5, String(cnt), { 'text-anchor': 'middle', 'font-weight': '600', fill: i === examIdx ? '#D4537E' : '#888780' }));
      const label = i === 0 ? '今天' : (i === 1 ? '明天' : (d.getMonth() + 1) + '/' + d.getDate());
      svg.appendChild(svgText('text', x + bw / 2, H - 8, label, { 'text-anchor': 'middle' }));
    });
    svg.appendChild(svgEl('line', { x1: pad, x2: W - pad, y1: base, y2: base, stroke: '#E7E4DD', 'stroke-width': '1' }));
    return svg;
  }

  function renderForecastCard() {
    const box = el('div', 'stat-card');
    const days = 14;
    const fc = dueForecast(days);
    const outlook = examOutlook();
    const examIdx = (outlook && outlook.examDays < days) ? outlook.examDays : -1;
    box.appendChild(forecastChart(fc.buckets, examIdx));

    const s = stats();
    const fc30 = dueForecast(30);
    let total30 = fc30.buckets.reduce(function (a, b) { return a + b; }, 0) + fc30.beyond;
    const ov = el('div', 'stat-overview');
    const kpi = function (label, val, unit) { const c = el('div', 'stat-kpi'); c.appendChild(el('strong', null, String(val))); c.appendChild(el('span', 'muted', label + (unit || ''))); ov.appendChild(c); };
    kpi('未来 7 天', fc.buckets.slice(0, 7).reduce(function (a, b) { return a + b; }, 0), ' 张');
    kpi('未来 30 天', total30, ' 张');
    if (outlook) {
      kpi(goalTitle() + '日预期', outlook.pct, '% ≥90%记得');
      kpi('预期平均可提取', outlook.avg, '%');
    } else {
      kpi('已排期卡片', s.total - stateCounts().fresh, ' 张');
      kpi('更远到期', fc.beyond, ' 张');
    }
    box.appendChild(ov);
    box.appendChild(el('p', 'muted', outlook
      ? '预测假设「每次到期都按良好复习」：在此前提下，' + goalTitle() + '日（' + outlook.examDays + ' 天后）预计 ' + outlook.pct + '% 的已排期卡片仍能 ≥90% 记得、平均可提取性 ' + outlook.avg + '%。未排期（新卡/学习中）卡片未计入——继续学习会改变预测。'
      : '预测基于当前 FSRS 状态；新卡与学习中的卡片未计入。设置目标日期后，这里还会给出考试日「仍能 ≥90% 记得」的预期比例。'));
    return box;
  }

  function renderStatistics() {
    const app = document.getElementById('app');
    const wrap = el('div', 'principles-wrap');
    wrap.appendChild(el('h2', null, '📈 学习统计'));

    const s = stats();
    const sc = stateCounts();

    // —— 学习报告（日/周/月/年聚合）——
    wrap.appendChild(el('h3', null, '📋 学习报告'));
    wrap.appendChild(renderStudyReport());

    // —— 未来负载预测 ——
    wrap.appendChild(el('h3', null, '📅 未来负载预测（14 天）'));
    wrap.appendChild(renderForecastCard());

    // —— 记忆算法关键指标趋势（每日快照 DB.log.metrics）——
    wrap.appendChild(el('h3', null, '🧠 记忆趋势（每日）'));
    const metrics = (DB.log && DB.log.metrics) || {};
    const mKeys = Object.keys(metrics).sort();
    const mSeries = function (f) { return mKeys.map(function (k) { return { label: k, value: metrics[k][f] }; }); };
    const tg = el('div', 'trend-grid');
    tg.appendChild(sparkTrend('平均掌握度（存储强度·%）', mSeries('avg'), '#378ADD', '%', 100));
    tg.appendChild(sparkTrend('待复习数量', mSeries('due'), '#D4537E', ''));
    wrap.appendChild(tg);
    wrap.appendChild(el('p', 'muted', '每天打开应用自动记录一次指标（掌握度按存储强度），积累几天后即可看趋势。'));

    // —— 学习日历（近 16 周热力图，点击查看当日明细）——
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

    // —— 记忆状态分布 ——
    wrap.appendChild(el('h3', null, '📌 记忆状态分布（共 ' + s.total + ' 张 · 平均掌握 ' + s.avg + '%）'));
    const sd = el('div', 'stat-card');
    [['新卡', sc.fresh], ['学习中', sc.learn], ['复习中', sc.review], ['已毕业', sc.grad]].forEach(function (p) {
      const row = el('div', 'cat-bar-row');
      row.appendChild(el('span', 'cat-bar-name', p[0]));
      const bar = el('div', 'cat-bar');
      const fill = el('div', 'cat-bar-fill');
      fill.style.width = s.total ? Math.round(p[1] / s.total * 100) + '%' : '0%';
      fill.style.background = p[0] === '已毕业' ? '#2A75C0' : (p[0] === '学习中' ? '#76AFE8' : '#B5D4F4');
      bar.appendChild(fill);
      row.appendChild(bar);
      row.appendChild(el('span', 'cat-bar-val', p[1] + ' 张'));
      sd.appendChild(row);
    });
    wrap.appendChild(sd);

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


export { dueForecast, simulateExamRetention, examOutlook };
