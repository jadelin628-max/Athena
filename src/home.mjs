  // ---------------- 仪表盘主页：多学科总控 + 功能分发 ----------------
  // 数据口径：各科快照直接读 localStorage（不切换学科）；当前学科用实时 stats()。
  function homeSubjectRows() {
    const today = todayStr();
    const now = Date.now();
    const rows = [];
    Object.keys(subjectList()).forEach(function (sid) {
      const meta = subjectList()[sid];
      let db = null;
      try { db = JSON.parse(localStorage.getItem(sid + '_formula_srs_v1')); } catch (e) {}
      let due = 0, learned = 0, min = 0, mastery = null, has = false;
      if (db && db.cards) {
        has = true;
        Object.keys(db.cards).forEach(function (id) {
          const c = db.cards[id];
          if ((c.state === 'review' || c.state === 'learning' || c.state === 'relearning') && c.due && c.due <= now) due++;
        });
        Object.keys(db.wrongs || {}).forEach(function (wid) {
          const w = db.wrongs[wid];
          if (w.state === 'review' && w.due && w.due <= now) due++;
        });
        learned = Object.keys((db.log && db.log.detail && db.log.detail[today]) || {}).length;
        min = Math.round(((db.log && db.log.studyTime && db.log.studyTime[today]) || 0) / 60000);
        const mlog = (db.log && db.log.mastery) || {};
        const keys = Object.keys(mlog).sort();
        if (keys.length) mastery = mlog[keys[keys.length - 1]];
      }
      rows.push({ sid: sid, name: meta.name, short: meta.short, icon: meta.icon, due: due, learned: learned, min: min, mastery: mastery, has: has, current: sid === currentSubjectId });
    });
    return rows;
  }

  // 连续学习天数：各科 log.daily 有活动日期的并集，数到今天（未学则从昨天起算，保留连击）
  function homeStreak() {
    const dates = {};
    Object.keys(subjectList()).forEach(function (sid) {
      let db = null;
      try { db = JSON.parse(localStorage.getItem(sid + '_formula_srs_v1')); } catch (e) {}
      const daily = (db && db.log && db.log.daily) || {};
      Object.keys(daily).forEach(function (d) { if (daily[d] > 0) dates[d] = true; });
    });
    const d = new Date();
    if (!dates[fmtDate(d)]) d.setDate(d.getDate() - 1);
    let n = 0;
    while (dates[fmtDate(d)]) { n++; d.setDate(d.getDate() - 1); }
    return n;
  }

  // 考试倒计时：扫描各科设置里最近的正数目标日期
  function homeExamDays() {
    let best = null;
    Object.keys(subjectList()).forEach(function (sid) {
      let db = null;
      try { db = JSON.parse(localStorage.getItem(sid + '_formula_srs_v1')); } catch (e) {}
      const s = db && db.settings && db.settings.examDate;
      if (s) {
        const d = new Date(s + 'T00:00:00');
        if (!isNaN(d.getTime())) {
          const today = new Date(); today.setHours(0, 0, 0, 0);
          const days = Math.round((d - today) / DAY);
          if (days > 0 && (best == null || days < best)) best = days;
        }
      }
    });
    return best;
  }

  // 每日一句：从古诗词 + 四书按日期确定性轮换
  function homeQuote() {
    const pool = [];
    ['poem', 'sishu'].forEach(function (sid) {
      const mod = subjectList()[sid];
      ((mod && mod.DATA) || []).forEach(function (c) {
        if (c && String(c.back).length > 10) pool.push({ sid: sid, id: c.id, title: c.title, text: String(c.back) });
      });
    });
    if (!pool.length) return null;
    const pick = pool[Math.floor(Date.now() / DAY) % pool.length];
    return { sid: pick.sid, id: pick.id, title: pick.title, quote: pick.text.split('。')[0] + '。' };
  }

  // ---------------- 功能入口线稿图标（currentColor 单色，随文字颜色自适应） ----------------
  const UI_ICONS = {
    home: '<path d="M3.5 11 L12 3.5 L20.5 11"/><path d="M6 9.5 V20 H18 V9.5"/><path d="M10 20 V14.5 H14 V20"/>',
    deck: '<rect x="4" y="7.5" width="12.5" height="12.5" rx="2"/><path d="M8.5 4.5 H18 A2 2 0 0 1 20 6.5 V16"/>',
    wrong: '<rect x="4" y="4" width="16" height="16" rx="2"/><path d="M9 9 L15 15 M15 9 L9 15"/>',
    search: '<circle cx="11" cy="11" r="6"/><path d="M15.5 15.5 L20.5 20.5"/>',
    pencil: '<path d="M4 20 L5.2 15.4 L16 4.6 A2.1 2.1 0 0 1 19 7.6 L8.2 18.4 Z"/><path d="M14.5 6.1 L17.5 9.1"/>',
    chart: '<path d="M5 20 V11 M12 20 V4.5 M19 20 V14"/><path d="M3 20.5 H21"/>',
    cap: '<path d="M2.5 9.5 L12 4.5 L21.5 9.5 L12 14.5 Z"/><path d="M6.5 11.8 V16.2 C6.5 17.8 17.5 17.8 17.5 16.2 V11.8"/><path d="M21.5 9.5 V14.5"/>',
    sliders: '<path d="M4 7 H20 M4 12 H20 M4 17 H20"/><circle cx="9.5" cy="7" r="2.1"/><circle cx="15" cy="12" r="2.1"/><circle cx="10.5" cy="17" r="2.1"/>'
  };
  function icon(name) {
    const s = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    s.setAttribute('viewBox', '0 0 24 24');
    s.setAttribute('class', 'ui-icon');
    s.setAttribute('aria-hidden', 'true');
    s.innerHTML = UI_ICONS[name] || '';
    return s;
  }

  function renderHome() {
    const app = document.getElementById('app');
    const wrap = el('div', 'home-wrap');

    // 问候 + 倒计时
    const hour = new Date().getHours();
    const hello = (hour < 5) ? '夜深了' : (hour < 11) ? '早上好' : (hour < 14) ? '中午好' : (hour < 18) ? '下午好' : '晚上好';
    const greet = el('div', 'home-greet');
    greet.appendChild(el('h2', null, hello + '，今天也来几张卡？'));
    const examDays = homeExamDays();
    if (examDays != null) greet.appendChild(el('span', 'badge home-exam', '距目标 ' + examDays + ' 天'));
    wrap.appendChild(greet);

    // 今日概览 KPI
    const rows = homeSubjectRows();
    const totalDue = rows.reduce(function (a, r) { return a + (r.due || 0); }, 0);
    const totalLearned = rows.reduce(function (a, r) { return a + (r.learned || 0); }, 0);
    const totalMin = rows.reduce(function (a, r) { return a + (r.min || 0); }, 0);
    const streak = homeStreak();
    const kpis = el('div', 'stat-overview home-kpis');
    const kpi = function (label, val, unit) { const c = el('div', 'stat-kpi'); c.appendChild(el('strong', null, String(val))); c.appendChild(el('span', 'muted', label + (unit || ''))); kpis.appendChild(c); };
    kpi('全库待复习', totalDue, '');
    kpi('今日已学', totalLearned, '');
    kpi('专注', totalMin, ' 分钟');
    kpi('连续学习', streak, ' 天');
    wrap.appendChild(kpis);

    // 今日功成：全库无待复习且今天确实学过
    if (totalDue === 0 && totalLearned > 0) {
      wrap.appendChild(illus('all-clear'));
      wrap.appendChild(el('p', 'muted', '🎉 今日所有科目的复习都已完成——好好休息，明天见。'));
    }

    // 继续学习 Hero
    const cur = rows.filter(function (r) { return r.current; })[0] || null;
    if (cur) {
      const hero = el('button', 'home-hero');
      const left = el('div', 'home-hero-main');
      left.appendChild(el('div', 'home-hero-title', (cur.has ? '继续学习' : '开始学习') + ' · ' + cur.short));
      left.appendChild(el('div', 'muted', '⏳ 待复习 ' + cur.due + ' · ✅ 今日已学 ' + cur.learned + ' · 掌握 ' + (cur.mastery != null ? cur.mastery + '%' : '—')));
      hero.appendChild(left);
      hero.appendChild(el('span', 'home-hero-go', '进入 ▶'));
      hero.addEventListener('click', function () {
        if (cur.sid !== currentSubjectId) switchSubject(cur.sid); // 同科已加载：直接回学习页
        currentView = 'learn';
        renderApp();
      });
      wrap.appendChild(hero);
    }

    // 学科网格
    wrap.appendChild(el('h3', null, '📚 学科'));
    const grid = el('div', 'home-grid');
    rows.forEach(function (r) {
      const card = el('button', 'home-card' + (r.current ? ' current' : ''));
      const url = subjectIconUrl(r.sid);
      if (url) {
        const img = document.createElement('img');
        img.src = url;
        img.className = 'home-card-icon';
        img.alt = '';
        card.appendChild(img);
      } else {
        card.appendChild(el('span', 'home-card-icon', r.icon || '📘'));
      }
      card.appendChild(el('div', 'home-card-name', r.short));
      card.appendChild(el('div', 'muted', (r.mastery != null ? '掌握 ' + r.mastery + '%' : '尚未开始') + (r.due ? ' · ⏳' + r.due : '')));
      if (r.current) card.appendChild(el('span', 'home-card-now', '继续'));
      card.addEventListener('click', function () {
        if (r.sid !== currentSubjectId) switchSubject(r.sid);
        currentView = 'learn';
        renderApp();
      });
      grid.appendChild(card);
    });
    wrap.appendChild(grid);

    // 每日一句
    const q = homeQuote();
    if (q) {
      wrap.appendChild(el('h3', null, '🗓 每日一句'));
      const quote = el('button', 'home-quote');
      quote.appendChild(el('div', 'home-quote-text', '「' + q.quote + '」'));
      quote.appendChild(el('div', 'muted', '—— ' + q.title));
      quote.addEventListener('click', function () {
        switchSubject(q.sid);
        currentView = 'browse';
        renderApp();
        setTimeout(function () { jumpToCard(q.id); }, 350);
      });
      wrap.appendChild(quote);
    }

    // 快捷入口
    wrap.appendChild(el('h3', null, '⚡ 快捷入口'));
    const tiles = el('div', 'home-tiles');
    [['pencil', '自测', 'quiz'], ['chart', '统计', 'statistics'], ['cap', '原理', 'principle'], ['sliders', '设置', 'settings']].forEach(function (t) {
      const b = el('button', 'home-tile');
      const ic = icon(t[0]);
      ic.classList.add('home-tile-icon');
      b.appendChild(ic);
      b.appendChild(el('span', null, t[1]));
      b.setAttribute('data-action', 'nav');
      b.setAttribute('data-arg', t[2]);
      tiles.appendChild(b);
    });
    wrap.appendChild(tiles);

    app.appendChild(wrap);
  }
