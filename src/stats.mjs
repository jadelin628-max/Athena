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
    if (items.length < 2) { box.appendChild(el('p', 'muted', '数据积累中——每天打开应用记录一次，几天后显示趋势。')); return box; }
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

  function renderStatistics() {
    const app = document.getElementById('app');
    const wrap = el('div', 'principles-wrap');
    wrap.appendChild(el('h2', null, '📈 学习统计'));

    // —— 总览 ——
    const s = stats();
    const sc = stateCounts();
    const ov = el('div', 'stat-overview');
    const kpi = function (label, val, unit) { const c = el('div', 'stat-kpi'); c.appendChild(el('strong', null, String(val))); c.appendChild(el('span', 'muted', label + (unit || ''))); ov.appendChild(c); };
    kpi('总卡片', s.total, '');
    kpi('已毕业', sc.grad, '');
    kpi('待复习', s.due, '');
    kpi('平均掌握(存储)', s.avg, '%');
    kpi('平均可提取 R', avgCurrentR(), '%');
    kpi('累计遗忘', totalLapses(), '');
    wrap.appendChild(ov);

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

    // —— 记忆算法关键指标趋势（每日快照 DB.log.metrics）——
    wrap.appendChild(el('h3', null, '🧠 记忆算法关键指标趋势（每日）'));
    const metrics = (DB.log && DB.log.metrics) || {};
    const mKeys = Object.keys(metrics).sort();
    const mSeries = function (f) { return mKeys.map(function (k) { return { label: k, value: metrics[k][f] }; }); };
    const tg = el('div', 'trend-grid');
    tg.appendChild(sparkTrend('平均掌握度（存储强度·%）', mSeries('avg'), '#378ADD', '%', 100));
    tg.appendChild(sparkTrend('平均可提取性 R（%）', mSeries('avgR'), '#B5D4F4', '%', 100));
    tg.appendChild(sparkTrend('待复习数量', mSeries('due'), '#D4537E', ''));
    tg.appendChild(sparkTrend('已毕业卡数', mSeries('grad'), '#2A75C0', ''));
    tg.appendChild(sparkTrend('累计遗忘次数', mSeries('lapses'), '#E24B4A', ''));
    tg.appendChild(sparkTrend('学习中新卡', mSeries('learn'), '#76AFE8', ''));
    wrap.appendChild(tg);
    wrap.appendChild(el('p', 'muted', '每天打开应用自动记录一次上述指标（掌握度按存储强度、可提取性 R 按当前回忆概率），积累几天后即可看趋势。'));

    // —— 记忆状态分布 ——
    wrap.appendChild(el('h3', null, '📌 记忆状态分布'));
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

    // —— 记忆强度（半衰期 h）分布 ——
    wrap.appendChild(el('h3', null, '💪 记忆强度分布（半衰期 h）'));
    const hb2 = el('div', 'stat-card');
    const hist = halflifeHistogram();
    const maxH = Math.max.apply(null, hist.map(function (x) { return x[1]; }).concat([1]));
    hist.forEach(function (b) {
      const row = el('div', 'cat-bar-row');
      row.appendChild(el('span', 'cat-bar-name', b[0]));
      const bar = el('div', 'cat-bar');
      const fill = el('div', 'cat-bar-fill');
      fill.style.width = Math.round(b[1] / maxH * 100) + '%';
      fill.style.background = masteryColor(b[1] ? 70 : 10);
      bar.appendChild(fill);
      row.appendChild(bar);
      row.appendChild(el('span', 'cat-bar-val', b[1] + ' 张'));
      hb2.appendChild(row);
    });
    wrap.appendChild(hb2);
    wrap.appendChild(el('p', 'muted', '半衰期 h 表示「停止复习后回忆概率掉到 50%」所需天数，越大记忆越牢固（h=3·S/F，由 FSRS 稳定性 S 换算）。'));

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

