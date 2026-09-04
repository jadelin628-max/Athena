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
        how: '内置 FSRS-6 算法：按「忘记/困难/良好/简单」打分，自动把下次复习安排在遗忘临界点。' },
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
      '掌握度 = 记忆「存储强度」到毕业目标的比例（⚠️自设计，依据论文「存储强度」概念 + 对数压缩）：每张卡随复习稳固度提升，达到毕业目标即 100%。分级：未学 → 初学 → 生疏 → 巩固中 → 已掌握 → 熟练 → 稳固 → 毕业。另在卡片上单独显示「当前可提取性 R」表示此刻想起的概率。当前整体平均掌握度 ' + s.avg + '%。'));
    const legend = el('div', 'legend');
    const levels = ['未学', '初学', '生疏', '巩固中', '已掌握', '熟练', '稳固', '毕业'];
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
