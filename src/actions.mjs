  function handleAction(action, arg) {
    switch (action) {
      case 'nav':
        closeDrawer();
        currentView = arg;
        renderApp();
        break;
      case 'menuclose':
        closeDrawer();
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
        if (confirm('确定要清空全部学习进度吗？（清空后学习统计与记忆安排一并归零，便于重新测试）')) {
          DB.cards = {};
          DATA.forEach(function (f) { DB.cards[f.id] = defaultCard(); });
          // 同时清空学习统计日志与每科新卡波次、会话，使统计条归零
          DB.log = {};
          buildSession(0);
          localStorage.removeItem(sessionKey());
          currentView = 'learn';
          renderApp();
          toast('已重置（统计已清空）');
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
      case 'clearcache': {
        // 强制清除 Service Worker 与全部缓存后刷新（用于移动端测试最新版本）
        toast('正在清除缓存…');
        const done = function () {
          if ('caches' in window && window.caches.keys) {
            window.caches.keys().then(function (keys) {
              return Promise.all(keys.map(function (k) { return window.caches.delete(k); }));
            }).then(function () { location.reload(); }).catch(function () { location.reload(); });
          } else {
            location.reload();
          }
        };
        if ('serviceWorker' in navigator && navigator.serviceWorker.getRegistration) {
          navigator.serviceWorker.getRegistration().then(function (reg) {
            if (reg) { return reg.unregister().then(function () { done(); }); }
            done();
          }).catch(function () { done(); });
        } else {
          done();
        }
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
  // 判断目标是否处于（横向或纵向）可滚动容器内：容器内部滚动时不应触发卡片翻页
  function inScrollable(t) {
    let n = t;
    while (n && n !== document.body && n.nodeType === 1) {
      const cs = getComputedStyle(n);
      const ox = cs.overflowX, oy = cs.overflowY;
      if ((ox === 'auto' || ox === 'scroll') && n.scrollWidth > n.clientWidth + 2) return true;
      if ((oy === 'auto' || oy === 'scroll') && n.scrollHeight > n.clientHeight + 2) return true;
      n = n.parentElement;
    }
    return false;
  }
  document.addEventListener('touchstart', function (e) {
    if (currentView !== 'learn') return;
    if (e.touches.length === 1) touchStart = { x: e.touches[0].clientX, y: e.touches[0].clientY, scroll: inScrollable(e.target), locked: false };
  }, { passive: true });
  // 滑动过程中一旦出现明显纵向位移（页面/长答案滚动），锁定本次触摸为「滚动」，结束后不再翻页
  document.addEventListener('touchmove', function (e) {
    if (currentView !== 'learn' || !touchStart || touchStart.locked) return;
    const t = e.touches[0];
    const dx = t.clientX - touchStart.x;
    const dy = t.clientY - touchStart.y;
    if (Math.abs(dy) > 12 && Math.abs(dy) > Math.abs(dx)) touchStart.locked = true;
  }, { passive: true });
  document.addEventListener('touchend', function (e) {
    if (currentView !== 'learn' || !touchStart) return;
    const d = document.getElementById('drawer');
    if (d && d.classList.contains('open')) { touchStart = null; return; } // 抽屉打开时不触发翻页
    const dx = e.changedTouches[0].clientX - touchStart.x;
    const dy = e.changedTouches[0].clientY - touchStart.y;
    const wasScroll = touchStart.scroll || touchStart.locked;
    touchStart = null;
    if (wasScroll) return; // 公式/长答案滚动时，不触发卡片翻页
    // 需「明显水平滑动」：水平位移 ≥ 60px 且 ≥ 1.5 倍纵向位移（防止斜滑/轻微横移误翻页）
    if (Math.abs(dx) < 60 || Math.abs(dx) < 1.5 * Math.abs(dy)) return;
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

  // ☰ 抽屉菜单（移动端导航）
  function openDrawer() {
    const d = document.getElementById('drawer');
    const b = document.getElementById('drawerBackdrop');
    if (d) d.classList.add('open');
    if (b) b.classList.add('open');
  }
  function closeDrawer() {
    const d = document.getElementById('drawer');
    const b = document.getElementById('drawerBackdrop');
    if (d) d.classList.remove('open');
    if (b) b.classList.remove('open');
  }
  const menuBtn = document.getElementById('menuToggle');
  if (menuBtn) {
    menuBtn.addEventListener('click', function () {
      const d = document.getElementById('drawer');
      if (d && d.classList.contains('open')) closeDrawer();
      else openDrawer();
    });
  }

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') { document.body.classList.remove('immersive'); closeDrawer(); }
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
    browseCat = 'all'; browseQuery = ''; browseExpanded = {}; browseMastery = 'all'; browseStars = 'all';
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

  // ---------------- 自检钩子（?selftest=1 时全量渲染校验，供 tools/check_render.mjs 使用；正常使用零影响） ----------------
  (function maybeSelftest() {
    if (typeof location === 'undefined') return;
    let want = false;
    try { want = new URLSearchParams(location.search).has('selftest'); } catch (e) { return; }
    if (!want) return;
    window.__selftestReady = false;
    window.__selftestResult = null;

    function checkField(sid, id, field, str, holder, problems, stats) {
      if (typeof str !== 'string' || str.length === 0) return;
      stats.fields++;
      const el = document.createElement('div');
      holder.appendChild(el);
      renderTex(el, str);
      // KaTeX 渲染错误（throwOnError:false 时以 .katex-error 标记）
      const kerr = el.querySelectorAll('.katex-error').length;
      // 只检查「散文文本节点」：排除 .katex 子树（其 MathML <annotation> 含原始 TeX 源码，
      // textContent 必然包含 \frac/\text 等命令，属正常现象，不能据此判错）
      let prose = '';
      const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
      let n;
      while ((n = walker.nextNode()) !== null) {
        const pEl = n.parentElement;
        if (pEl && pEl.closest && pEl.closest('.katex')) continue;
        prose += n.textContent;
      }
      const litStar = /\*\*/.test(prose);
      // 散文中残留任意 \命令 都算未渲染（renderProse 只把 textbf/underline 等转 HTML，
      // 其余 \xxx 若漏进散文就是没被处理的 LaTeX）
      const litCmd = /\\([A-Za-z]+)/.test(prose);
      if (kerr || litStar || litCmd) {
        problems.push({ sid: sid, id: id, field: field, kerr: kerr, litStar: litStar, litCmd: litCmd, snippet: prose.slice(0, 80) });
      }
      holder.removeChild(el);
    }

    function run() {
      const subs = subjectList();
      const holder = document.createElement('div');
      holder.style.cssText = 'position:absolute;left:-99999px;top:0;';
      document.body.appendChild(holder);
      const problems = [];
      const stats = { cards: 0, fields: 0 };
      for (const sid of Object.keys(subs)) {
        const mod = subs[sid];
        const data = (mod.DATA || mod.data) || [];
        for (const c of data) {
          if (!c || !c.id) continue;
          stats.cards++;
          checkField(sid, c.id, 'title', c.title, holder, problems, stats);
          checkField(sid, c.id, 'front', c.front, holder, problems, stats);
          checkField(sid, c.id, 'back', c.back, holder, problems, stats);
        }
        const ex = mod.EXAMPLE || {};
        for (const id of Object.keys(ex)) {
          const arr = Array.isArray(ex[id]) ? ex[id] : [ex[id]];
          arr.forEach(function (e, i) {
            if (!e) return;
            checkField(sid, id, 'ex' + i + '.q', e.q, holder, problems, stats);
            checkField(sid, id, 'ex' + i + '.a', e.a, holder, problems, stats);
            checkField(sid, id, 'ex' + i + '.a2', e.a2, holder, problems, stats);
          });
        }
        const pf = mod.PITFALL || {};
        for (const id of Object.keys(pf)) checkField(sid, id, 'pitfall', pf[id], holder, problems, stats);
        const mn = mod.MNEM || {};
        for (const id of Object.keys(mn)) checkField(sid, id, 'mnem', mn[id], holder, problems, stats);
      }
      document.body.removeChild(holder);
      window.__selftestResult = {
        katexOk: typeof window.katex !== 'undefined' && !!window.katex.render,
        cards: stats.cards,
        fields: stats.fields,
        problems: problems
      };
      window.__selftestReady = true;
    }

    // 等 KaTeX 就绪（bootKatex 本地优先；最多等 15s）
    const t0 = Date.now();
    (function waitKatex() {
      if (typeof window.katex !== 'undefined' && window.katex.render) { run(); return; }
      if (Date.now() - t0 > 15000) { run(); return; }
      setTimeout(waitKatex, 120);
    })();
  })();
})();
