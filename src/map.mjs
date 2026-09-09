  // ---------------- 原理 · 学习科学（结构化文档：目录跳转 + 关键词搜索） ----------------
  const PRINCIPLE_SECTIONS = [
    {
      id: 'core', icon: '✍️', title: '核心方法：主动回忆 + 间隔重复',
      blocks: [
        { p: '学习科学里证据最强的两项技术（Dunlosky 2013 系统评估，证据等级 A）：检索练习——合上书主动回忆，远比反复阅读更牢固（Roediger & Karpicke 2006）；间隔重复——同样的总时长，分散到多天远优于考前突击（Cepeda 2006，254 项研究荟萃）。' },
        { p: '本应用的学习闭环就是这两项的组合：卡片默认只显示提示 → 先自行回想（必要时写下来）→ 点「显示答案」核对 → 按真实回忆质量评分，FSRS-6 算法把下一次复习自动安排在遗忘临界点。' },
        { muted: '重读、划线、抄写感觉「顺滑」，恰恰是低效的证据——这叫流畅性错觉。学得「难受」（合意困难）往往才是有效信号；反之，被动输入时大脑的三个可塑性信号（肾上腺素、乙酰胆碱、多巴胺）都不释放，等于白学。' }
      ]
    },
    {
      id: 'interleave', icon: '🔀', title: '交错与辨别',
      blocks: [
        { p: '交错练习（B 级）：把不同章节、不同题型混着练，远期成绩与迁移能力显著更好——练习时更「难受」，又是合意困难。集中刷同一类题的「顺滑感」是错觉。' },
        { p: '本应用的实现：带「同类/对比/类比」关联的卡片聚成簇、相邻出现（辨析聚类）；「裸回忆」开关进一步隐藏分类徽标，逼你先判断「这是哪一类、该用哪个方法」再回忆。' },
        { rows: [['自测', '随机抽卡「给内容选名称」，检验是否真正认得（生成效应：自己生成的答案记得更牢）。'], ['错题本', '真题做错后收进错题本，重做并评分，按 FSRS 排期重现；「不会/思路错」会把关联知识点一并降级、次日补漏。'], ['费曼技巧', '能用自己的话讲清楚才是真理解：合上卡片讲一遍，卡壳处即盲区（B 级）。'], ['自我解释', '每记一个公式追问：为什么成立？和什么已知有关？用在什么题型？（B 级）']] }
      ]
    },
    {
      id: 'fsrs', icon: '📐', title: '调度内核：FSRS-6',
      blocks: [
        { p: '每张卡由难度 D 与稳定度 S 建模；可提取性 R(t,S) = (1 + F·t/S)^decay 表示「此刻能想起的概率」。四档评分（再来一次/困难/良好/简单）对应 FSRS 官方四档，按官方 21 参数默认权重更新 D/S，并按期望保留率 90% 反推下次间隔。' },
        { p: '知识卡：学习阶段按时间步进（1 分钟 → 10 分钟），Good 越过最后一步毕业进入长期复习，遗忘后进入 10 分钟重学。错题卡为纯复习态：添加即视为「当天已忘记」，次日重现，之后与知识卡走同一套 FSRS 复习逻辑。' },
        { muted: '调度内核是纯函数（src/fsrs-core.mjs、sched.mjs），与官方权重做对拍测试；毕业目标可与考试倒计时挂钩（要求目标日仍能 ≥90% 记得）。' }
      ]
    },
    {
      id: 'mastery', icon: '📊', title: '掌握度与毕业目标',
      blocks: [
        { p: '掌握度 = 记忆「存储强度」到毕业目标的比例（⚠️自设计，依据论文「存储强度」概念 + 对数压缩）：达到毕业目标即 100%。分级：未学 → 初学 → 生疏 → 巩固中 → 已掌握 → 熟练 → 稳固 → 毕业。另单独显示「当前可提取性 R」表示此刻想起的概率。' },
        { p: '毕业目标默认与目标倒计时挂钩：要求目标日仍能 ≥90% 记得（等价于稳定度 S ≥ 剩余天数），随倒计时自动收紧；可在设置中改为固定目标值。' },
        { legend: true }
      ]
    },
    {
      id: 'science', icon: '📚', title: '学习科学清单：怎么学最有效',
      blocks: [
        { h: '高效（A 级，跨学科稳定）' },
        { rows: [['检索练习', '合上书先回忆：做题、默写、闪卡、给假想学生讲——本应用的核心闭环。'], ['间隔重复', '同内容隔天/隔周回顾——FSRS 自动排期；间隔约为目标保留期的 10–20%。']] },
        { h: '中效（B 级，用对场景有效）' },
        { rows: [['交错练习', '不同题型混着练（已内置辨析聚类）。'], ['精细提问 / 自我解释', '对材料追问「为什么成立、和什么有关」。'], ['示例学习', '先照例题仿写，尽快脱离例题独立做。']] },
        { h: '低效（D 级，大量时间换微量收益）' },
        { rows: [['重读 / 划线 / 被动摘要', '感觉顺滑恰恰是流畅性错觉——把这部分时间换成检索练习。']] },
        { p: '两个常见辟谣：「学习风格」（视觉型/听觉型）没有证据支持，请按材料本身的最佳表征学习（Pashler 2008，A 级负面证据）；「手写一定优于打字」证据混合，手写的真正价值在于强迫概括与加工。' }
      ]
    },
    {
      id: 'body', icon: '🌙', title: '身体是学习系统的一部分',
      blocks: [
        { rows: [['睡眠（A 级）', '「学之前睡好」（睡眠决定编码效率），「学之后睡够」（巩固发生在深睡与安静休息）。熬夜学习的净收益通常为负。'], ['安静休息（B 级）', '学完 10–20 分钟不看手机、闭眼或散步，给海马「重放」留时间。'], ['运动（A/B 级）', '规律运动改善情绪、动机与睡眠；中等强度运动后 1–2 小时是编码黄金窗——把最难的材料放在运动后学。'], ['专注（A 级常识）', '任务切换有真实成本；手机哪怕静音扣在桌上也会偷走工作记忆——学习时段物理隔离。'], ['咖啡因（A 级）', '提升警觉，但半衰期约 5 小时：睡前 8–10 小时停止摄入；每日总量 ≤400mg。']] },
        { muted: '本节为一般健康信息，不构成医疗建议；个体差异请以自身实验与医生意见为准。' }
      ]
    },
    {
      id: 'motivation', icon: '🎯', title: '动机与坚持',
      blocks: [
        { p: '最强的日常动机来源是「可见的微小进步」（Progress Principle，对 1.2 万个工作日的研究）——统计页的学习报告与趋势图就是为此设计：把注意力放在过程反馈，而非遥远的终点。' },
        { p: '对拖延：它本质是用短期情绪修复替代长期目标。对策有三——自我原谅比自责更能减少下一次拖延（B 级）；启动只承诺两分钟（启动后继续的概率远大于放弃）；把任务拆到「下一个具体物理动作」。' },
        { p: '习惯自动化的中位数约 66 天（「21 天养成」是讹传）；把新行为写成「当 X 时我就做 Y」的执行意图，是动机科学里效应量最大的廉价工具。环境设计大于意志力。' },
        { muted: '本应用刻意不做积分、抽卡、连击惩罚等设计：变率奖励是劫持动机的赌场工具，而有形奖励会侵蚀你本来就有的学习兴趣（过度合理化效应，A 级）。' }
      ]
    },
    {
      id: 'troubleshoot', icon: '🛠️', title: '学不进去排查表',
      blocks: [
        { rows: [['完全不想启动', '先查睡眠够不够、刺激密度是否过高（短视频依赖）。对策：补觉优先；两分钟启动法。'], ['三分钟热度', '查自主/胜任/关联缺了哪个。对策：把「要学」转成「我选择学」；看学习报告里的微进步；找个搭子。'], ['学完就忘', '是不是只重读不检索？间隔为零？对策：用自测与错题本；相信算法排期，到期就复习。'], ['越学越麻木', '是否形成刺激依赖（不听音乐学不了）？对策：给辅助刺激做减法与随机化；用真休息替代刷手机。'], ['burnout 前兆', '恢复是否长期不足？对策：减载 + 睡眠 + 每周一个无目标日；持续两周以上请就医。']] },
        { muted: '持续两周以上的情绪低落、兴趣丧失、睡眠食欲明显改变——请直接寻求专业帮助，这不是「调优」能解决的问题。' }
      ]
    }
  ];

  let principleQuery = '';
  function principleBlockText(sec) {
    return sec.blocks.map(function (b) {
      if (b.p) return b.p;
      if (b.muted) return b.muted;
      if (b.h) return b.h;
      if (b.rows) return b.rows.map(function (r) { return r[0] + r[1]; }).join(' ');
      return '';
    }).join(' ');
  }

  function renderPrinciples() {
    const app = document.getElementById('app');
    const wrap = el('div', 'principles-wrap');

    wrap.appendChild(el('h2', null, '🧠 原理 · 学习科学'));
    wrap.appendChild(el('p', 'muted', '本应用遵循认知科学中被反复验证的记忆与学习规律——目录跳转，或搜索关键词直达章节；条目后标注证据等级（A 强 / B 中 / C 弱）。'));

    // 搜索（实时过滤章节）
    const search = el('input', 'search');
    search.type = 'search';
    search.placeholder = '搜索关键词（如：睡眠 / 交错 / 遗忘曲线 / 拖延）…';
    search.value = principleQuery;
    wrap.appendChild(search);

    // 目录（吸顶 chips，锚点跳转）
    const toc = el('div', 'chips principle-toc');
    const tocChips = {};
    PRINCIPLE_SECTIONS.forEach(function (sec) {
      const chip = el('button', 'chip', sec.icon + ' ' + sec.title);
      chip.addEventListener('click', function () {
        const node = document.getElementById('pr-' + sec.id);
        if (node) node.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
      tocChips[sec.id] = chip;
      toc.appendChild(chip);
    });
    wrap.appendChild(toc);

    // 章节
    const boxes = {};
    PRINCIPLE_SECTIONS.forEach(function (sec) {
      const box = el('div', 'principle');
      box.id = 'pr-' + sec.id;
      const head = el('div', 'principle-head');
      head.appendChild(el('span', 'principle-icon', sec.icon));
      head.appendChild(el('strong', null, sec.title));
      box.appendChild(head);
      sec.blocks.forEach(function (b) {
        if (b.h) {
          box.appendChild(el('div', 'mini-label', b.h));
        } else if (b.p) {
          box.appendChild(el('p', null, b.p));
        } else if (b.muted) {
          box.appendChild(el('p', 'muted how', b.muted));
        } else if (b.rows) {
          b.rows.forEach(function (row) {
            const r = el('div', 'cat-bar-row');
            r.appendChild(el('span', 'cat-bar-name', row[0]));
            r.appendChild(el('span', 'pr-row-text', row[1]));
            box.appendChild(r);
          });
        } else if (b.legend) {
          const s = stats();
          const legend = el('div', 'legend');
          const levels = ['未学', '初学', '生疏', '巩固中', '已掌握', '熟练', '稳固', '毕业'];
          const counts = {};
          DATA.forEach(function (f) { const l = mastery(f.id).label; counts[l] = (counts[l] || 0) + 1; });
          levels.forEach(function (lv) {
            const p = el('span', 'legend-item');
            p.textContent = lv + ' ' + (counts[lv] || 0);
            legend.appendChild(p);
          });
          box.appendChild(legend);
          box.appendChild(el('p', 'muted', '当前整体平均掌握度 ' + s.avg + '%（分级实时统计如上）。'));
        }
      });
      boxes[sec.id] = box;
      wrap.appendChild(box);
    });

    const empty = el('p', 'muted', '没有匹配的章节——换个关键词试试。');
    empty.classList.add('hidden');
    wrap.appendChild(empty);

    function applyFilter() {
      const q = principleQuery.trim().toLowerCase();
      let visible = 0;
      PRINCIPLE_SECTIONS.forEach(function (sec) {
        const text = (sec.title + ' ' + principleBlockText(sec)).toLowerCase();
        const show = !q || text.indexOf(q) !== -1;
        boxes[sec.id].style.display = show ? '' : 'none';
        tocChips[sec.id].style.display = show ? '' : 'none';
        if (show) visible++;
      });
      empty.classList.toggle('hidden', visible > 0 || !q);
    }
    search.addEventListener('input', function () {
      principleQuery = search.value;
      applyFilter();
    });
    applyFilter();

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
