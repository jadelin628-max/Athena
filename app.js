/*
 * 考研数学三 · 公式记忆应用 — 核心逻辑
 * 记忆原理：主动回忆（先看提示→自行回想→再核对答案）
 *         + 间隔重复（SM-2 算法）+ 交错练习（卡片乱序）
 */
(function () {
  'use strict';
  const VERSION = '1.5.2';

  // ---------------- 更新日志（设置页「📜 更新日志」展示） ----------------
  const CHANGELOG = [
    { v: '1.5.2', date: '2026-09', items: ['修复：复习队列结束后无法进入新学习队列——新卡引入不再被剩余时间预算封顶（此前复习完复习卡后预算耗尽、新卡不引入，导致学完复习卡直接「本轮已完成」进不了新卡），改为一次性引入全部未学新卡；时间预算仍为软上限（超出仅提示、不限制学习）', '设置页新增「强制清除缓存并更新」：注销 Service Worker + 清空全部 CacheStorage 后自动刷新，便于移动端测试最新版本（不丢学习进度）', 'README 移除「北大光华」等具体目标内容，改为通用记忆学习项目描述'] },
    { v: '1.5.1', date: '2026-09', items: ['修复：评分挡位（忘记/困难/良好/简单）在显示答案前错误可见——CSS 特异性导致 `.rating.hidden` 实际显示，违背「先回忆→显示答案→再评分」的标准流程；改为 `.hidden{display:none!important}`，现在未复习卡初始只显示题目与「显示答案」按钮，点开答案后才出现评分挡位'] },
    { v: '1.5.0', date: '2026-08', items: ['数三公式库逐卡审读与修正：修正 19 处公式不严谨（反函数/参数方程求导补条件、$a^x$·$\\arcsin$ 补 $a>0$ 条件、辅助角象限、隐函数求导 $F_y\\neq0$、方向导数需可微、面积公式改 $|f-g|$、Sylvester 不等式补 $n$ 定义、伴随 $|A^*|$ 补 $n\\ge2$、莱布尼茨补 $u_n\\ge0$、收敛半径补极限存在、阿贝尔定理前后对齐、拐点补连续、反函数补严格单调、幂零分解限定单特征值、正定/周期/单调口径修正等）', '数三补 12 张高频缺失卡：特征值继承性质、秩的等式不等式、相似矩阵性质、伴随矩阵运算、拉普拉斯分块行列式、常用数值级数和、$\\tan x-\\sin x$ 等价无穷小、极坐标面积、柱壳法体积、分部积分成品（$\\int\\ln x$、$\\int e^{ax}\\sin bx$）、方程组同解/公共解、一阶全微分形式不变性'] },
    { v: '1.4.6', date: '2026-08', items: ['修复：到期复习卡未进入学习队首——重写 surfaceDue，把「到期但不在队列」的卡（含昨天学完、今天到期的复习卡）吸收进队首，并把已学区中到期的卡重新归入待学区，修复「显示待复习好几张却学不到」的问题', '卡片与记忆模块的趋势图从「可提取性 R」改为「掌握度」：历史点统一记录每次评分后的掌握度，图表画掌握度折线 + 100% 目标参考线'] },
    { v: '1.4.5', date: '2026-08', items: ['修复：额度用完后重新打开模块误显示「最后一张卡片」——已学完会话（pos=frontier=deck.length）不再被恢复，而是重建队列，正确进入「额度用完/次日复习」界面', '修复：间隔 1 天的复习卡本应次日出现却拖到第三天——复习到期改为按自然日对齐（due = 当天 00:00 + ivl 天），不再用 now+24h 精确时刻（否则今晚 20:00 复习、明早打开还没到期）', '评分按钮的「下次约 X」对毕业后间隔按整天展示，与自然日到期一致'] },
    { v: '1.4.4', date: '2026-08', items: ['渲染器重构为字符级扫描器：`\\textbf{…}`/`\\underline{…}` 等文本命令改用括号配对读取（支持嵌套花括号如 `\\chi^{2}` 的 `{2}`）、`**…**`/`$…$`/`$$…$$` 作为整体 token 递归渲染——修复「命令内嵌数学」被 `$` 拆分截断导致 `\\textbf` 字面残留的一类 bug；`renderProse` 同时支持 markdown `**…**`→`<b>`', '毕业目标与掌握度量纲从「半衰期 h」改为「稳定度 S（天）」：毕业目标 `targetS()=剩余天数`（语义「停止复习后仍 ≥90% 记得」，毕业时机不变）；掌握度 `ln(1+S)/ln(1+S_N)` 不再虚高；学习阶段掌握度改用 FSRS 短时稳定度（随评分真实变化，非固定挡位）', '删除正文里泄漏的内部卡片编号（如 `（gm16）`/`（we11）`，共 11 处，全在微观）；修复 zb19/mk10/jj01/jj11 等 4 处数据渲染 bug（inline 矩阵 `\\`、漏 `$` 包裹、JSON 字面 `\\n`）', '工程校验工具化（tools/ 三道闸，零 npm 依赖）：`check_data.mjs`（数据完整性+内容不变量）、`check_render.mjs`（headless Chrome 跑真实渲染、断言 0 katex-error/0 残留命令）、`check_version.mjs`（版本标记一致性）；数据备份归档至 backup/'] },
    { v: '1.4.3', date: '2026-08', items: ['长答案按分点分段可视化：`renderTex` 检测 `①②③…`/全角`（1）（2）…` 分点，自动拆成带左侧竖线的段落块 `.ans-point`（跳过数学下标/命令内标记如 `X_{(1)}`、`\\textbf{①…` 以免破坏结构）；长答案更清晰分层' , '将目前确立的内容与文本规范固化为「开发标准」（见 PROGRESS）：算法来源（核心=FSRS 官方，自创需标注⚠️并请示）、内容范围（光华431=微观+统计·无宏观金融；数三=高数+线代）、例题仅真实真题且可跨知识点复用、标题公式用原始模板、正文加粗/下划线用应用字体、长答案分点分段、时间预算软上限、改数据文件禁用 PowerShell GBK 读写'] },
    { v: '1.4.2', date: '2026-08', items: ['正文文本模式命令改为**HTML 渲染**（彻底用应用字体，不再经 KaTeX 字体）：`\\textbf{…}`→`<b>`、`\\underline{…}`→`<u>`、`\\textit{…}`→`<i>`、`\\textrm`/`\\textsf`/`\\mathrm`/`\\text`→（默认字体）仅渲染内部文本；命令内部若含 `$..$` 数学则递归交给 KaTeX。→ 加粗/下划线不再出现字体不一致，也无 `\\textbf`/`\\n` 字面残留'] },
    { v: '1.4.1', date: '2026-08', items: ['修复正文渲染：此前用 \\text{} 包裹整段正文，导致（a）正文内出现 \\textbf 加粗/\\underline 下划线时字体不一致（KaTeX 字体 vs 应用字体）、（b）跨行正文（真实换行）被 KaTeX 报错、显示字面 \\\\n 等。改为「普通正文（含换行）保留为文本节点（应用字体），仅把 \\textbf{}/\\underline{}/\\textit{} 等文本模式命令片段单独交给 KaTeX」——字体统一、无 \\n/\\textbf 字面残留'] },
    { v: '1.3.9', date: '2026-08', items: ['记忆算法从 FSRS-4.5 升级为 FSRS-6（最新，2024-2025）：改用官方 21 参数默认权重（ts-fsrs/fsrs-rs v6.x DEFAULT_PARAMETERS）、遗忘曲线 R=(1+factor·t/S)^{-w20}（decay=0.1542）、引入短时记忆稳定度（学习期 Again 会降低稳定度、Good/Easy 不降）——修复此前「学习期多次遗忘→终于简单→仍给 15.69 天(16天间隔)」的不合理行为；现「遗忘后简单」毕业间隔显著缩短', 'FSRS-6 初始稳定度调整：再次=0.212 天 / 困难=1.29 天 / 良好=2.31 天 / 简单=8.30 天（原 FSRS-4.5 为 0.40/1.18/3.17/15.69）；难度更新改用线性阻尼+均值回归到 D0(Easy)；遗忘稳定度含 w17·w18 封顶；毕业/半衰期/目标 h_N 概念同步改为 FSRS-6 曲线（h≈90·S）'] },
    { v: '1.3.8', date: '2026-08', items: ['修复：卡片中 `$` 之外的文本模式 LaTeX 命令（如 \\textbf\\underline 加粗/下划线）此前不渲染、原样显示 —— 改为对含此类命令的正文段用 \\text{} 包裹后交给 KaTeX 渲染，正文中文不受影响', '修复移动端长等式溢出：行内公式过长会撑破页面导致整页缩放，改为 `.kx-inline` 过长时内部横向滚动 + 公式容器 overflow-x:auto 兜底'] },
    { v: '1.3.7', date: '2026-08', items: ['统计页重构 + 记忆算法可视化：总览 KPI、记忆算法关键指标趋势（平均掌握度/平均可提取R/待复习/已毕业/累计遗忘/学习中新卡）、记忆状态分布、记忆强度（半衰期 h）分布、各分类掌握度', '浏览页学习卡片的「我的笔记」模块上移至「记忆」模块之上（与学习页一致）', '内容拓展：统计深度补强（茆诗松/何书元/陈家鼎 + 古扎拉蒂/伍德里奇计量 + 光华431）、微观进阶补强（平新乔十八讲/范里安 + 光华431）、数学三广度拓展；例题优先真实真题，可跨知识点复用'] },
    { v: '1.3.6', date: '2026-08', items: ['掌握度改为「存储强度到目标的比」（毕业=100%）：h=半衰期、H=目标，s=ln(1+h)/ln(1+H)，达到毕业目标即满分（⚠️自设计，依据论文「存储强度」概念+对数压缩；FSRS 调度内核未动）', '"当前可提取性 R" 与掌握度解耦：趋势图专画 R（实际 vs 预测 R，同量纲）；卡面另显示存储强度 S/半衰期 h', '"考研倒计时"改为"目标倒计时"：目标名称与日期都可在设置中编辑（默认 考研 / 每年 12 月 20 日），考研后可改成四六级/教资等继续使用；每日首启弹窗与文案同步适配'] },
    { v: '1.3.5', date: '2026-08', items: ['毕业目标改为「与考研倒计时挂钩」（默认开启）：要求考试日仍能 ≥90% 记得（等价稳定度 S ≥ 剩余天数，即半衰期 h ≥ 12.79×剩余天数），目标随倒计时自动变化而非固定 90 天；可在设置中关闭并改回固定目标值。⚠️ 借 SSP-MMC「目标半衰期」概念并适配考研目标（非论文原始算法）'] },
    { v: '1.3.4', date: '2026-08', items: ['每日复习目标改称「时间预算」：由卡片数改为每日复习时间（默认 20 分钟，设置可调），到期复习优先、复习实际用时计入预算、剩余时间用于引入新卡——对齐 SSP-MMC 最小化记忆成本的成本约束', '引入「目标半衰期 h_N」毕业判据：卡片记忆强度（半衰期 h=3·S/F，由 FSRS 稳定性 S 换算）达到目标值（默认 90 天，设置可调）即视为「毕业/稳固」，取代原固定 0.9 目标保留率的毕业概念', '卡面双维度显示：掌握度（当前可提取性 R）+ 存储强度（稳定性 S / 半衰期 h / 是否已毕业），记忆框显示「目标 h_N」'] },
    { v: '1.3.3', date: '2026-08', items: ['例题清理：删除所有非真题例题（含「幕布版自测」及无来源自编题目），知识卡片的例题区**仅保留真实考研真题**（数三 125 / 微观 140 / 统计 159 条真题；原自编例题卡片不再显示例题）'] },
    { v: '1.3.2', date: '2026-08', items: ['删除自定的「期望保留率」校准机制，改用 FSRS 论文标准默认保留率(0.9)——核心调度完全对齐 FSRS-4.5 论文定义', '掌握度改为「当前可提取性 R（预测回忆概率）」：R(t,S)=(1+F·t/S)^-0.5，复习阶段显示此刻回忆起来的概率，趋势图对比实际 vs 预测 R（无自创算法，均来自论文/训练权重）'] },
    { v: '1.3.1', date: '2026-08', items: ['记忆算法升级为完整 FSRS-4.5：卡片按「难度 D + 稳定性 S」建模，幂律遗忘曲线 R(t,S)=(1+F·t/S)^-0.5，按期望保留率反推复习间隔', '引入 FSRS 官方 17 参数（默认权重由 fsrs-benchmark 训练得到）+ 难度均值回归 + 稳定性随保留率/难度非线性更新；掌握度改为由 FSRS 稳定性平滑导出', '毕业卡记忆框显示「难度 D / 稳定性 S / 目标保留率」'] },
    { v: '1.3.0', date: '2026-08', items: ['记忆算法升级：恢复四档评分（忘记/困难/良好/简单）+ 学习阶段改时间步进（1分钟→10分钟），更贴合主流 Anki', '掌握度与记忆算法绑定（近期回答质量+当前间隔平滑导出），新增记忆可视化（掌握度趋势：实际+预测双曲线，时间横轴可浏览）', '新增真实数据校准：用每次到期复习的真实回忆质量动态调整目标保留率，预测越用越准；清空进度同步清空统计', '初步引入 FSRS：卡片按「难度 D + 记忆稳定性 S」建模，幂律遗忘曲线 + 期望保留率决定复习间隔', '卡片页笔记模块上移至记忆模块之上，其余统计/UI 适配'] },
    { v: '1.2.7', date: '2026-08', items: ['记忆算法重构：两阶段（学习→复习）+ SM-2；遗忘即回退学习阶段并降低易度，答对才毕业；修复重复学/无限学/别科无卡等旧问题', '新卡改为每科软上限（每批 10 张，学完点「再来 10 张」继续），删除原「每日新卡数量」硬限制；学习界面删「剩余 x 张」，新增「待复习」「未学完新卡」标签', '内容拓展（长期）：识图/提取文本把自编例题改为真实真题（本轮数三 16 道 / 统计 15 张 / 微观 20 张，含 1.2.5 新增卡优先真题化）'] },
    { v: '1.2.5', date: '2026-08', items: ['修复：完成每日目标后「再来一轮」不再重复展示上一组卡片——队列只含到期复习 + 今日额度内新卡，已学未到期卡按 SM-2 排期不重复出现', '新增：点击左上角考研倒计时徽章可直接跳转到学习界面', '修正：上边栏「今天已学习 X 张」按去重卡片统计，不再重复计数', '内容拓展（长期推进）：细化 14 张简陋知识点、新增 9 张知识点/套路卡、补充 23 条陷阱提示（本轮第一批）'] },
    { v: '1.2.4', date: '2026-08', items: ['移动端顶栏瘦身：7 个导航入口收进「☰」抽屉菜单，顶栏保持单行（倒计时徽标与学科掌握度保留）', '修复：完成今日任务后「再来一轮」无反应——每日额度内已引入但未学完的新卡可再次进入队列，且无内容可学时不再显示无效按钮'] },
    { v: '1.2.3', date: '2026-08', items: ['考研倒计时徽章移至界面左上角（替代品牌字标），每日弹窗提示语精简', '数三 / 微观 / 统计：为尚未对应真题的卡片补充真实考研真题例题（本轮新增 155 张卡的真题来源标注：数三 +28、微观 +50、统计 +77）'] },
    { v: '1.2.2', date: '2026-08', items: ['时政分类改为仅收录 2026 年时政大事（两会·十五五纲要 / 建党 105 周年 / 中央经济工作会议 / 中央一号文件 / 中德联合声明 / 夏季达沃斯等）', '设置页新增「📜 更新日志」，可查看每个版本的修改内容'] },
    { v: '1.2.1', date: '2026-08', items: ['应用更名 Athena，美术全面换用新品牌视觉规范（新图标 / 新色板 / 深色主题）', '考研倒计时：上边栏常驻徽章 + 每日首次打开弹窗，考试日期可在设置中修改', '每日新卡数量上限（默认 10，设置可调），新卡不再一次性全部塞入学习队列', '新增「🗝️ 助记」行：政治 46 条 / 数三 9 条 / 统计 5 条背诵口诀', '新增时政分类（v1.2.2 起改为仅 2026 年时政大事）'] },
    { v: '1.2.0', date: '2026-08', items: ['新增政治学科：马原（哲学/政经/科社）、毛中特、史纲、思修·法治共 180 张背诵卡 + 8 张分析题答题套路卡', 'UI 按背诵类学科适配（搜索/自测/考查方式文案），政治专属红色主题'] },
    { v: '1.1.3', date: '2026-08', items: ['三科各新增 3 张解题套路卡（共 9 张）', '热力图可点开查看每日复习明细，导出/导入保留统计日志'] },
    { v: '1.1.0', date: '2026-07', items: ['思维导图支持缩放（按钮 / Ctrl+滚轮）', '新增「统计」视图：学习日历热力图 / 平均掌握度趋势 / 各分类掌握度进度条', '模板卡各配 1 道真题'] },
    { v: '1.0.0', date: '2026-06', items: ['初始版本：数三公式记忆，含学习（SM-2 间隔重复 + 交错练习）/ 浏览 / 导图 / 自测 / 统计 / 记忆原理 / 设置', 'PWA 离线可用，支持导出 / 导入进度备份'] }
  ];

  // ---------------- 学科管理（多学科数据注册表） ----------------
  const SUBJECT_KEY = 'formula_app_subject';
  let currentSubjectId = null;
  let CATS = null, DATA = null, META = null;
  let EXAMPLES = {}, REL = {}, DEPTH = {}, PITFALL = {}, MNEM = {};

  function subjectList() { return window.SUBJECTS || {}; }
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
    META = subj.META;
    EXAMPLES = subj.EXAMPLE || {};
    REL = subj.REL || {};
    DEPTH = subj.DEPTH || {};
    PITFALL = subj.PITFALL || {};
    MNEM = subj.MNEM || {};
    try { localStorage.setItem(SUBJECT_KEY, subj.id); } catch (e) {}
    document.title = subj.name;
    const b = document.getElementById('brandText');
    if (b) b.textContent = subj.icon;
    const sel = document.getElementById('subjectSelect');
    if (sel) sel.value = subj.id;
    document.body.setAttribute('data-subject', subj.id);
    const hdr = document.querySelector('header');
    if (hdr) hdr.setAttribute('data-subject-icon', subj.icon);
    return true;
  }
  function dbKey() { return currentSubjectId + '_formula_srs_v1'; }
  function sessionKey() { return currentSubjectId + '_formula_session_v2'; }

  function updateBrand() {
    const b = document.getElementById('brandText');
    if (!b || !currentSubjectId || !DB || !DATA) return;
    const subj = subjectList()[currentSubjectId];
    const s = stats();
    b.textContent = (subj ? subj.icon : '') + ' ' + s.avg + '%';
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
  const KATEX_SOURCES = [
    { js: 'katex/katex.min.js', css: 'katex/katex.min.css' },
    { js: 'https://cdn.bootcdn.net/ajax/libs/KaTeX/0.16.11/katex.min.js', css: 'https://cdn.bootcdn.net/ajax/libs/KaTeX/0.16.11/katex.min.css' },
    { js: 'https://cdn.jsdelivr.net/npm/katex@0.16.11/dist/katex.min.js', css: 'https://cdn.jsdelivr.net/npm/katex@0.16.11/dist/katex.min.css' },
    { js: 'https://unpkg.com/katex@0.16.11/dist/katex.min.js', css: 'https://unpkg.com/katex@0.16.11/dist/katex.min.css' },
    { js: 'https://cdn.staticfile.net/KaTeX/0.16.11/katex.min.js', css: 'https://cdn.staticfile.net/KaTeX/0.16.11/katex.min.css' }
  ];

  function injectKatexCss(url) {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = url;
    document.head.appendChild(link);
  }

  function bootKatex(i) {
    if (i >= KATEX_SOURCES.length) { return; }
    const src = KATEX_SOURCES[i];
    const s = document.createElement('script');
    s.src = src.js;
    s.async = true;
    let done = false;
    const ok = function () {
      if (done) return;
      done = true;
      if (typeof window.katex === 'undefined' || !window.katex.render) { bootKatex(i + 1); return; }
      injectKatexCss(src.css);
      upgradeAllMath();
    };
    const fail = function () { if (!done) { done = true; bootKatex(i + 1); } };
    s.onload = ok;
    s.onerror = fail;
    document.head.appendChild(s);
    setTimeout(fail, 12000);
  }

  // 将长答案按「分点」分段（①②③…、全角（1）（2）…），拆成可视化段落；
  // 跳过数学下标/命令内的标记（如 X_{(1)}、\textbf{①…）以免破坏结构
  function splitPoints(str) {
    const segs = [];
    const marker = /([①-⑩]|（\d+）)/g;
    let last = 0, m;
    while ((m = marker.exec(str)) !== null) {
      const idx = m.index;
      const prev = idx > 0 ? str[idx - 1] : '';
      if (prev === '{' || prev === '\\' || prev === '（' || prev === '(' || prev === '_' || prev === '^' || prev === '*' || prev === '`') continue;
      segs.push(str.slice(last, idx));
      last = idx;
    }
    segs.push(str.slice(last));
    return segs.map(function (s) { return s.trim(); }).filter(Boolean);
  }

  // ---------------- 数学渲染（KaTeX 可用则渲染，否则降级为纯文本） ----------------
  function renderTex(el, str) {
    el.setAttribute('data-tex', str);
    el.innerHTML = '';
    if (typeof window.katex !== 'undefined' && window.katex.render) {
      const pts = splitPoints(String(str));
      if (pts.length > 1) {
        pts.forEach(function (pt) {
          const d = document.createElement('div');
          d.className = 'ans-point';
          renderInto(d, pt);
          el.appendChild(d);
        });
      } else {
        renderInto(el, String(str));
      }
    } else {
      el.textContent = String(str).replace(/\$/g, '');
    }
  }
  // 找到从 open 位置起、与第 0 层 `{` 配对的 `}`（支持嵌套花括号，如 $\chi^{2}$ 里的 {2}）；找不到返回 -1
  function matchBrace(str, open) {
    let depth = 0;
    for (let j = open; j < str.length; j++) {
      const c = str[j];
      if (c === '{') depth++;
      else if (c === '}') { depth--; if (depth === 0) return j; }
    }
    return -1;
  }
  // 返回从 from 起下一个特殊字符（$、\、*）的下标；无则 -1
  function nextSpecial(str, from) {
    for (let j = from; j < str.length; j++) {
      const c = str[j];
      if (c === '$' || c === '\\' || c === '*') return j;
    }
    return -1;
  }
  // 把字符串渲染进 el：字符级扫描器（非单条正则）——
  //   $$..$$/$..$ 走 KaTeX；\textbf/\underline/\textit/\textrm/\textsf/\mathbf/\mathrm/\text{...}
  //   与 markdown **...** 转 HTML（应用字体）；\cmd{...} 用括号配对读取，内部可再含 $..$ 数学与嵌套花括号（递归）。
  //   这样 \textbf{方差用 $\chi^{2}$} 或 \underline{$\chi^{2}$ 拟合} 也能整体匹配，不再被 {2} 截断。
  function renderInto(el, str) {
    let i = 0;
    const n = str.length;
    while (i < n) {
      const ch = str[i];
      // 1) 行间公式 $$...$$
      if (ch === '$' && str[i + 1] === '$') {
        const end = str.indexOf('$$', i + 2);
        if (end === -1) { el.appendChild(document.createTextNode(str.slice(i))); break; }
        const body = str.slice(i + 2, end);
        const d = document.createElement('div');
        d.className = 'kx-block';
        try { window.katex.render(body, d, { displayMode: true, throwOnError: false }); }
        catch (e) { d.textContent = body; }
        el.appendChild(d);
        i = end + 2;
        continue;
      }
      // 2) 行内公式 $...$
      if (ch === '$') {
        const end = str.indexOf('$', i + 1);
        if (end === -1) { el.appendChild(document.createTextNode(str.slice(i))); break; }
        const body = str.slice(i + 1, end);
        const sp = document.createElement('span');
        sp.className = 'kx-inline';
        try { window.katex.render(body, sp, { displayMode: false, throwOnError: false }); }
        catch (e) { sp.textContent = body; }
        el.appendChild(sp);
        i = end + 1;
        continue;
      }
      // 3) markdown 加粗 **...**
      if (ch === '*' && str[i + 1] === '*') {
        const end = str.indexOf('**', i + 2);
        if (end === -1) { el.appendChild(document.createTextNode(str.slice(i))); break; }
        const b = document.createElement('b');
        renderInto(b, str.slice(i + 2, end));
        el.appendChild(b);
        i = end + 2;
        continue;
      }
      // 4) 文本模式命令 \cmd{...}（括号配对，支持嵌套）
      if (ch === '\\') {
        const cm = /^\\(textbf|underline|textit|textrm|textsf|mathbf|mathrm|text)\{/.exec(str.slice(i));
        if (cm) {
          const tag = cm[1];
          const openBrace = i + cm[0].length - 1;
          const closeBrace = matchBrace(str, openBrace);
          if (closeBrace === -1) { el.appendChild(document.createTextNode(str.slice(i))); break; }
          const inner = str.slice(openBrace + 1, closeBrace);
          if (tag === 'textbf' || tag === 'mathbf') {
            const b = document.createElement('b'); renderInto(b, inner); el.appendChild(b);
          } else if (tag === 'underline') {
            const u = document.createElement('u'); renderInto(u, inner); el.appendChild(u);
          } else if (tag === 'textit') {
            const it = document.createElement('i'); renderInto(it, inner); el.appendChild(it);
          } else {
            // textrm/textsf/mathrm/text → 应用字体，无额外标签
            renderInto(el, inner);
          }
          i = closeBrace + 1;
          continue;
        }
        // 无法识别的 \xxx：按字面保留（不吞掉，避免破坏后续内容）
        el.appendChild(document.createTextNode(ch));
        i++;
        continue;
      }
      // 5) 普通文本：前进到下一个特殊字符
      const nx = nextSpecial(str, i);
      if (nx === -1) { el.appendChild(document.createTextNode(str.slice(i))); break; }
      el.appendChild(document.createTextNode(str.slice(i, nx)));
      i = nx;
    }
  }

  // KaTeX 加载完成后，原地把已渲染的纯文本升级为公式（不打断当前学习状态）
  function upgradeAllMath() {
    document.querySelectorAll('[data-tex]').forEach(function (n) {
      renderTex(n, n.getAttribute('data-tex'));
    });
  }

  // ---------------- 数据持久化 ----------------
  const THEME_KEY = 'ms3_formula_theme';
  let DB = null;

  function defaultCard() { return { reps: 0, ef: 2.5, ivl: 0, due: 0, lapses: 0, state: 'new', s: 0, grad: 0, step: 0, diff: 5, stab: 0, fsrsInit: 0, notes: '', hist: [], lastR: 0, ivlR: 0 }; }

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
    if (!DB.cards) DB.cards = {};
    if (!DB.settings) DB.settings = {};
    if (DB.settings.dailyNew == null) DB.settings.dailyNew = 10;
    if (DB.settings.minutesPerDay == null) DB.settings.minutesPerDay = MIN_PER_DAY_DEFAULT;
    // 旧版本用 targetH（半衰期天）作为固定毕业目标；迁移到 targetS（稳定度天）。
    //   旧 90 天半衰期 ≈ 90/K ≈ 1 天稳定度，语义已变：直接采用新默认值（不再沿用旧数值，避免误把「半衰期天」当「稳定度天」）。
    if (DB.settings.targetS == null) DB.settings.targetS = TARGET_S_DEFAULT;
    if (DB.settings.targetH != null) delete DB.settings.targetH;
    if (DB.settings.targetLinkExam == null) DB.settings.targetLinkExam = true;
    if (DB.settings.goalTitle == null) DB.settings.goalTitle = GOAL_DEFAULT;
    if (!DB.log) DB.log = {};
    DATA.forEach(function (f) {
      if (!DB.cards[f.id]) DB.cards[f.id] = defaultCard();
      const c = DB.cards[f.id];
      if (typeof c.s !== 'number') c.s = initialStrength(c);
      if (typeof c.notes !== 'string') c.notes = '';
    });
    saveDB();
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
  function saveDB() {
    const json = JSON.stringify(DB);
    try { localStorage.setItem(dbKey(), json); } catch (e) {}
    try { idbSet(dbKey(), DB); } catch (e) {}
  }

  function sanitizeCard(c) {
    const out = defaultCard();
    if (c && typeof c === 'object') {
      if (typeof c.reps === 'number') out.reps = c.reps;
      if (typeof c.ef === 'number') out.ef = c.ef;
      if (typeof c.ivl === 'number') out.ivl = c.ivl;
      if (typeof c.due === 'number') out.due = c.due;
      if (typeof c.lapses === 'number') out.lapses = c.lapses;
      if (typeof c.s === 'number') out.s = c.s;
      if (typeof c.grad === 'number') out.grad = c.grad;
      if (typeof c.step === 'number') out.step = c.step;
      if (typeof c.diff === 'number') out.diff = c.diff;
      if (typeof c.stab === 'number') out.stab = c.stab;
      if (c.fsrsInit) out.fsrsInit = 1;
      if (Array.isArray(c.hist)) out.hist = c.hist.map(function (h) { return { t: h.t, m: h.m, ivl: h.ivl || 0 }; });
      if (typeof c.lastR === 'number') out.lastR = c.lastR;
      if (typeof c.ivlR === 'number') out.ivlR = c.ivlR;
      if (c.state === 'new' || (c.state === 'learning' || c.state === 'relearning') || c.state === 'relearning' || c.state === 'review') out.state = c.state;
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
      deck = []; pos = 0; frontier = 0; pendingAdvance = false; lastMasteryDelta = null; seenAgain = {}; quiz = null;
      browseCat = 'all'; browseQuery = ''; browseExpanded = {}; browseMastery = 'all'; browseStars = 'all'; heatSel = null;
    }
    const fresh = { cards: {}, settings: {}, log: {} };
    DATA.forEach(function (f) { fresh.cards[f.id] = sanitizeCard(payload.cards[f.id]); });
    if (payload.settings && typeof payload.settings.dailyNew === 'number') {
      fresh.settings.dailyNew = Math.max(1, Math.min(99, Math.round(payload.settings.dailyNew)));
    }
    if (payload.settings && typeof payload.settings.minutesPerDay === 'number') {
      fresh.settings.minutesPerDay = Math.max(5, Math.min(120, Math.round(payload.settings.minutesPerDay)));
    }
    if (payload.settings && typeof payload.settings.targetS === 'number') {
      fresh.settings.targetS = Math.max(7, Math.min(730, Math.round(payload.settings.targetS)));
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
    if (payload.log && payload.log.checkins && typeof payload.log.checkins === 'object') {
      fresh.log.checkins = {};
      Object.keys(payload.log.checkins).forEach(function (k) { fresh.log.checkins[k] = true; });
    }
    if (payload.log && typeof payload.log === 'object') {
      ['daily', 'mastery', 'detail'].forEach(function (k) {
        if (payload.log[k] && typeof payload.log[k] === 'object') {
          fresh.log[k] = {};
          Object.keys(payload.log[k]).forEach(function (dk) {
            const v = payload.log[k][dk];
            if (k === 'detail') {
              fresh.log[k][dk] = (v && typeof v === 'object') ? JSON.parse(JSON.stringify(v)) : {};
            } else if (typeof v === 'number') {
              fresh.log[k][dk] = v;
            }
          });
        }
      });
    }
    DB = fresh;
    saveDB();
  }
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
  const GOAL_DEFAULT = '考研';
  const EXAM_AUTO_MONTH = 11, EXAM_AUTO_DAY = 20; // 默认按每年 12 月 20 日（考研初试通常在 12 月下旬）
  function goalTitle() { return (DB && DB.settings && typeof DB.settings.goalTitle === 'string' && DB.settings.goalTitle.trim()) ? DB.settings.goalTitle.trim() : GOAL_DEFAULT; }
  function examDateObj() {
    const s = (DB && DB.settings && DB.settings.examDate) || '';
    if (s) {
      const d = new Date(s + 'T00:00:00');
      if (!isNaN(d.getTime())) return d;
    }
    const now = new Date();
    let d = new Date(now.getFullYear(), EXAM_AUTO_MONTH, EXAM_AUTO_DAY);
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    if (d < today) d = new Date(now.getFullYear() + 1, EXAM_AUTO_MONTH, EXAM_AUTO_DAY);
    return d;
  }
  function countdownDays() {
    const exam = examDateObj();
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    return Math.max(0, Math.round((exam - today) / 86400000));
  }
  function updateCountdown() {
    const badge = document.getElementById('countdownBadge');
    if (!badge || !DB) return;
    const d = countdownDays();
    const g = goalTitle();
    badge.textContent = d === 0 ? '🎯 今天是' + g : '📅 距' + g + ' ' + d + ' 天';
    badge.title = '目标日期：' + fmtDate(examDateObj()) + (DB.settings && DB.settings.examDate ? '（手动设置，可在设置中修改）' : '（默认每年 12 月 20 日，可在设置中修改）');
    badge.classList.toggle('urgent', d > 0 && d <= 30);
  }
  const COUNTDOWN_SEEN_KEY = 'athena_countdown_seen';
  function maybeShowCountdownPopup() {
    try {
      if (localStorage.getItem(COUNTDOWN_SEEN_KEY) === todayStr()) return;
      localStorage.setItem(COUNTDOWN_SEEN_KEY, todayStr());
    } catch (e) {}
    showCountdownPopup();
  }
  function showCountdownPopup() {
    const d = countdownDays();
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
    card.appendChild(el('p', 'muted', '目标日期：' + fmtDate(exam) + (DB.settings && DB.settings.examDate ? '（手动设置）' : '（默认每年 12 月 20 日）')));
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
      else if ((c.state === 'learning' || c.state === 'relearning')) { if (c.due <= now) due++; else learn++; }
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

  // ---------------- 记忆算法：两阶段（学习 → 复习）+ SM-2 ----------------
  const DAY = 86400000;
  // 当天 00:00（本地时区）：复习间隔按「自然日」对齐——间隔 N 天表示「第 N 天」整日可见，
  // 而非 now+N×24h（否则今天 20:00 复习的卡要到明晚 20:00 才到期，用户白天打开看不到，实际拖到第三天）
  function dayStart(ts) {
    const d = new Date(ts);
    d.setHours(0, 0, 0, 0);
    return d.getTime();
  }
  const EF_MIN = 1.3; // （保留，向后兼容；FSRS 的易度由难度/稳定性替代）
  // 期望保留率：FSRS 论文标准默认值（0.9，即「到期复习时回忆概率」），不再做自定校准
  const FDR = 0.9;
  // 目标稳定度 S（天）：一张卡「停止复习后仍能 ≥90% 记得」的记忆强度，达到该值视为「毕业/稳固」。
  // 与目标倒计时挂钩时：目标 S = 剩余天数（下限 TARGET_MIN_DAYS）——等价要求「目标日可提取性 ≥ TARGET_CONFIDENCE」，
  //   因遗忘曲线 R(S,S)=0.9（FSRS_FACTOR 即按 90% 反推），数值即「距目标天数」，直观合理（不再用半衰期 h=90·S 的量纲）。
  const TARGET_S_DEFAULT = 90;
  const TARGET_CONFIDENCE = 0.9;
  // 剩余天数的下限（天）：备考即将结束/已过考时仍保留一个不坍塌的毕业目标，避免任何卡都被标「已毕业」
  const TARGET_MIN_DAYS = 14;
  // 每日复习时间预算（分钟）：按「时间」而非「卡片数」安排学习（SSP-MMC 的成本约束 cost_limit）
  const MIN_PER_DAY_DEFAULT = 20;
  // 各评分档的单次复习成本（秒）：忘记最贵（重新学），简单最快（仅确认）；对齐论文「认识≈3s / 忘记≈9s」
  const RATING_COST_S = [9, 6, 3, 1];
  // ================= 完整 FSRS-6（2024-2025 最新，来自 open-spaced-repetition 官方训练权重） =================
  // 21 参数默认权重（ts-fsrs / fsrs-rs v6.x DEFAULT_PARAMETERS：w0..w20）
  const FW = [0.212, 1.2931, 2.3065, 8.2956, 6.4133, 0.8334, 3.0194, 0.001, 1.8722, 0.1666, 0.796, 1.4835, 0.0614, 0.2629, 1.6483, 0.6014, 1.8729, 0.5425, 0.0912, 0.0658, 0.1542];
  const FSRS_DECAY = -FW[20];               // 遗忘曲线指数 decay = -w20 = -0.1542
  const FSRS_FACTOR = Math.exp(Math.log(0.9) / FSRS_DECAY) - 1; // factor = e^{ln0.9/decay} - 1 ≈ 0.98
  const FSRS_S_MIN = 0.001;
  const FSRS_S_MAX = 36500.0;
  const FSRS_HALFLIFE_K = (Math.pow(0.5, 1 / FSRS_DECAY) - 1) / FSRS_FACTOR; // 半衰期 h = K·S（FSRS-6 曲线，K≈90）
  function fsrsClamp(x, lo, hi) { return Math.min(hi, Math.max(lo, x)); }
  // 可提取性（遗忘曲线）R(t,S) = (1 + factor·t/S)^{decay}
  function fsrsRetention(daysSince, S) {
    S = Math.max(FSRS_S_MIN, S);
    return Math.pow(1 + FSRS_FACTOR * Math.max(0, daysSince) / S, FSRS_DECAY);
  }
  // 期望保留率(DR) → 下次复习间隔（天）：I(r,s) = (r^{1/decay} − 1)/factor × s，DR=0.9 时 I=S
  function fsrsInterval(S) {
    const mod = (Math.pow(FDR, 1 / FSRS_DECAY) - 1) / FSRS_FACTOR;
    return Math.max(1, Math.round(Math.max(FSRS_S_MIN, S) * mod));
  }
  // 初始稳定性 S0(G) = max(w[G-1], 0.1)，G=1..4
  function fsrsInitStability(G) { return Math.max(FW[G - 1], 0.1); }
  // 初始难度 D0(G) = w4 − e^{(G−1)·w5} + 1，钳 1..10
  function fsrsInitDifficulty(G) {
    return fsrsClamp(FW[4] - Math.exp((G - 1) * FW[5]) + 1, 1, 10);
  }
  function fsrsInitDifficulty4() { return fsrsInitDifficulty(4); } // 均值回归锚点 D0(Easy)
  // 线性阻尼：难度越接近 10，每次变化越小
  function fsrsLinearDamping(delta_d, oldD) { return (delta_d * (10 - oldD)) / 9; }
  // 难度更新：delta = -w6·(G-3) → 线性阻尼 → 均值回归到 D0(Easy)
  function fsrsDifficulty(D, G) {
    D = (typeof D === 'number' && D >= 1 && D <= 10) ? D : 7;
    const delta_d = -FW[6] * (G - 3);
    const next_d = D + fsrsLinearDamping(delta_d, D);
    const reverted = FW[7] * fsrsInitDifficulty4() + (1 - FW[7]) * next_d;
    return fsrsClamp(reverted, 1, 10);
  }
  // 成功回忆的稳定性更新（Hard 有 w15 惩罚、Easy 有 w16 加成）
  function fsrsSuccessStability(D, S, R, G) {
    const hardPenalty = (G === 2) ? FW[15] : 1;
    const easyBound = (G === 4) ? FW[16] : 1;
    const growth = Math.exp(FW[8]) * (11 - D) * Math.pow(Math.max(FSRS_S_MIN, S), -FW[9]) * (Math.exp(FW[10] * (1 - R)) - 1) * hardPenalty * easyBound;
    return fsrsClamp(Math.max(FSRS_S_MIN, S) * (1 + growth), FSRS_S_MIN, FSRS_S_MAX);
  }
  // 遗忘的稳定性更新：sForget 与「短时记忆封顶 s/e^{w17·w18}」取小（稳定性不高于遗忘前）
  function fsrsLapseStability(D, S, R) {
    const sForget = fsrsClamp(FW[11] * Math.pow(Math.max(1, D), -FW[12]) * (Math.pow(Math.max(FSRS_S_MIN, S) + 1, FW[13]) - 1) * Math.exp(FW[14] * (1 - R)), FSRS_S_MIN, FSRS_S_MAX);
    const newSMin = Math.max(FSRS_S_MIN, S) / Math.exp(FW[17] * FW[18]);
    return fsrsClamp(newSMin, FSRS_S_MIN, sForget);
  }
  // 短时记忆稳定度（同日学习步进，t≈0）：Again 可降、Hard/Good/Easy 不低于原值
  function fsrsShortTermStability(S, G) {
    const sinc = Math.pow(Math.max(FSRS_S_MIN, S), -FW[19]) * Math.exp(FW[17] * (G - 3 + FW[18]));
    const maskedSinc = (G >= 2) ? Math.max(sinc, 1) : sinc;
    return fsrsClamp(Math.max(FSRS_S_MIN, S) * maskedSinc, FSRS_S_MIN, FSRS_S_MAX);
  }

  // 半衰期 h：可提取性 R 降到 50% 的时间间隔。由 FSRS-6 曲线 R(t,S)=(1+factor·t/S)^{decay} 解 R=0.5 → h=K·S
  // h 反映「记忆强度」（仅作展示参考，不作毕业/掌握度分母——因 K≈90 放大导致目标数值失真）
  function fsrsHalflife(S) { return Math.max(FSRS_S_MIN, S) * FSRS_HALFLIFE_K; }
  function cardHalflife(c) { return (c.state === 'review' && typeof c.stab === 'number') ? fsrsHalflife(c.stab) : 0; }
  // 毕业目标稳定度 S（天）：卡片稳定度达到该值即视为「毕业/稳固」——语义为「停止复习后仍能 ≥90% 记得」的天数。
  // 开「与目标倒计时挂钩」：目标 S = 剩余天数（下限 TARGET_MIN_DAYS），等价要求目标日可提取性 ≥ TARGET_CONFIDENCE（90%）。
  //   因 R(S,S)=0.9，S 目标数值即「距目标天数」，直观合理（不再用半衰期 h=90·S，避免 120 天目标被显示成 1 万多天）。
  // 关「挂钩」：回退到用户手动填的固定目标稳定度（默认 90 天）。
  function targetS() {
    const manual = (DB && DB.settings && typeof DB.settings.targetS === 'number') ? DB.settings.targetS : TARGET_S_DEFAULT;
    const linked = !(DB && DB.settings && DB.settings.targetLinkExam === false); // 默认开启
    if (!linked) return manual;
    return Math.max(TARGET_MIN_DAYS, countdownDays()); // S_N = 剩余天数（等价目标日可提取性 ≥ 90%）
  }
  // 是否与目标倒计时挂钩（用于记忆框/设置页文案）
  function targetLinked() { return !(DB && DB.settings && DB.settings.targetLinkExam === false); }
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
    const app = document.getElementById('app');
    app.innerHTML = '';
    document.body.classList.toggle('view-map', currentView === 'map');
    if (currentView === 'learn') renderLearn();
    else if (currentView === 'browse') renderBrowse();
    else if (currentView === 'quiz') renderQuiz();
    else if (currentView === 'settings') renderSettings();
    else if (currentView === 'principle') renderPrinciples();
    else if (currentView === 'statistics') renderStatistics();
    else if (currentView === 'map') renderMap();
    // 高亮导航
    document.querySelectorAll('nav .nav-btn').forEach(function (b) {
      b.classList.toggle('active', b.getAttribute('data-arg') === currentView);
    });
    const vf = el('div', 'app-version');
    vf.textContent = 'Athena · 版本 v' + VERSION;
    app.appendChild(vf);
    updateNavBadge();
    updateBrand();
    updateCountdown();
    snapshotMastery();
  }

  function statsBar() {
    const s = stats();
    const incNew = incompleteNewCount();
    const bar = el('div', 'stats-bar');
    bar.appendChild(el('span', 'stat', '今天已学习 ' + todayReviewed() + ' 张'));
    bar.appendChild(el('span', 'stat', '⏱ 今日 ' + todayCostMin() + ' / 预算 ' + budgetMin() + ' 分' + (todayCostSec() > budgetSec() ? '（已超出，可继续）' : '')));
    bar.appendChild(el('span', 'stat', '待复习 ' + s.due + ' 张'));
    bar.appendChild(el('span', 'stat', '未学完新卡 ' + incNew + ' 张'));
    bar.appendChild(el('span', 'stat', '平均掌握 ' + s.avg + '%'));
    bar.appendChild(el('span', 'stat', '总计 ' + s.total));
    return bar;
  }

  // ---------------- 学习视图 ----------------
  function interleave(ids) {
    const byCat = {};
    ids.forEach(function (id) {
      const f = DATA.find(function (x) { return x.id === id; });
      const c = f ? f.cat : '?';
      (byCat[c] = byCat[c] || []).push(id);
    });
    const groups = Object.keys(byCat).map(function (k) { return shuffle(byCat[k]); });
    const out = [];
    let added = true;
    while (added) {
      added = false;
      for (let i = 0; i < groups.length; i++) {
        if (groups[i].length) { out.push(groups[i].shift()); added = true; }
      }
    }
    return out;
  }

  // 新卡摄入：一次性引入全部未学新卡（时间预算为软上限，超出仅提示、不封顶引入）
  function introState() {
    if (!DB.log) DB.log = {};
    if (!DB.log.newIntro || !Array.isArray(DB.log.newIntro.ids)) DB.log.newIntro = { ids: [] };
    return DB.log.newIntro;
  }
  // 未完全学习的新卡：处于学习阶段、尚未毕业（曾经点过「忘记」）
  function incompleteNewCount() {
    return DATA.filter(function (f) { const c = card(f.id); return (c.state === 'learning' || c.state === 'relearning') && (c.grad | 0) === 0; }).length;
  }

  function buildSession() {
    const now = Date.now();
    const all = DATA.map(function (f) { return f.id; });
    const st = introState();
    // 引入全部「未引入的新卡」（时间预算为软上限：超出仅提示，不封顶新卡引入）
    const pending = shuffle(all.filter(function (id) { return card(id).state === 'new' && st.ids.indexOf(id) === -1; }));
    if (pending.length) { st.ids = st.ids.concat(pending); saveDB(); }
    // 到期复习（review 且到期）
    const due = all.filter(function (id) {
      const c = card(id);
      return c.state === 'review' && c.due <= now;
    });
    due.sort(function (a, b) {
      const sa = metaOf(a)[0] || 0, sb = metaOf(b)[0] || 0;
      if (sb !== sa) return sb - sa;
      return card(a).due - card(b).due;
    });
    // 学习阶段（时间步进到点）的卡：新卡被遗忘 / 复习卡被遗忘，都在等计时器，到点才回来
    const resumeLearning = interleave(all.filter(function (id) { return (card(id).state === 'learning' || card(id).state === 'relearning') && card(id).due <= now; }));
    // 已引入但仍未学的新卡（完全随机序）
    const newToStudy = shuffle(st.ids.filter(function (id) { return card(id).state === 'new'; }));
    // 队列 = 到期复习 + 续学 + 已引入新卡
    deck = due.concat(resumeLearning, newToStudy);
    pos = 0;
    frontier = 0;
    pendingAdvance = false;
    seenAgain = {};
    saveSession();
  }

  function surfaceDue() {
    const now = Date.now();
    const isDue = function (id) {
      const c = card(id);
      return (c.state === 'review' || c.state === 'learning' || c.state === 'relearning') && c.due <= now;
    };
    // 记住当前 pos 指向的卡，重组后尽量保持/正确回退
    const curId = (pos >= 0 && pos < deck.length) ? deck[pos] : null;
    const inDeck = {};
    deck.forEach(function (id) { inDeck[id] = true; });
    // deck 外部的到期卡（昨天学完今天到期、但不在当前队列）——吸收进队首
    const fresh = [];
    DATA.forEach(function (f) {
      if (!inDeck[f.id] && isDue(f.id)) fresh.push(f.id);
    });
    fresh.sort(function (a, b) {
      const sa = metaOf(a)[0] || 0, sb = metaOf(b)[0] || 0;
      if (sb !== sa) return sb - sa;
      return card(a).due - card(b).due;
    });
    // 拆分 head（已学）/tail（待学），把到期卡统一归到「待学区」最前
    const head = deck.slice(0, frontier);
    const tail = deck.slice(frontier);
    const dueHead = head.filter(isDue);
    const keepHead = head.filter(function (id) { return dueHead.indexOf(id) === -1; });
    const dueTail = tail.filter(isDue);
    const restTail = tail.filter(function (id) { return dueTail.indexOf(id) === -1; });
    const front = fresh.concat(dueHead, dueTail);
    front.sort(function (a, b) { return card(a).due - card(b).due; });
    deck = keepHead.concat(front, restTail);
    frontier = keepHead.length;
    // 恢复 pos：原卡仍在「已学区」（未到期）则保持回看；否则跳到第一张待学卡
    if (curId != null) {
      const idx = deck.indexOf(curId);
      pos = (idx >= 0 && idx < frontier) ? idx : frontier;
    } else {
      pos = frontier;
    }
    if (pos < 0) pos = 0;
    if (pos > deck.length) pos = deck.length;
  }
  // 自适应步进：学习阶段的卡若等待过久（超过阈值），把它从队列靠后拉近，尽早重现
  function renderLearn() {
    const app = document.getElementById('app');
    surfaceDue();
    app.appendChild(statsBar());

    const done = (deck.length === 0) || (frontier >= deck.length && pos >= frontier);
    if (done) {
      const wrap = el('div', 'center-card');
      wrap.appendChild(el('h2', null, '🎉 本轮已完成'));
      const overBudget = todayCostSec() > budgetSec();
      wrap.appendChild(el('p', 'muted', '全部知识点已纳入学习计划，暂无更多内容——按排期到期的卡片会自动进入复习队列。' + (overBudget ? '（今日已超出时间预算 ' + (todayCostMin() - budgetMin()) + ' 分钟，仍可继续）' : '')));
      app.appendChild(wrap);
      return;
    }
    renderLearnCard(deck[pos]);
  }

  // 例题 + 相关知识点（答案区附加内容，hiddenClass 为空字符串时可见）
  function buildExtras(id, hiddenClass) {
    const exs = examplesOf(id);
    const rels = relOf(id);
    if (exs.length === 0 && rels.length === 0) return null;
    const box = el('div', 'extras' + hiddenClass);
    exs.forEach(function (ex, i) {
      const eb = el('div', 'example-box');
      const label = exs.length > 1 ? ('📝 ' + (ex.src ? '真题' : '例题') + ' ' + (i + 1)) : (ex.src ? '📝 真题' : '📝 经典例题');
      eb.appendChild(el('div', 'example-label', label));
      const q = el('div', 'example-q');
      renderTex(q, ex.q);
      eb.appendChild(q);
      eb.appendChild(el('div', 'mini-label', '解析'));
      const a = el('div', 'example-a');
      renderTex(a, ex.a);
      eb.appendChild(a);
      if (ex.a2) {
        eb.appendChild(el('div', 'mini-label', '💡 巧解'));
        const a2 = el('div', 'example-a');
        renderTex(a2, ex.a2);
        eb.appendChild(a2);
      }
      if (ex.src) eb.appendChild(el('div', 'example-src', '📚 来源：' + ex.src));
      box.appendChild(eb);
    });
    if (rels.length) {
      const rb = el('div', 'rel-box');
      rb.appendChild(el('div', 'mini-label', '相关知识点'));
      rels.forEach(function (r) {
        const tf = DATA.find(function (x) { return x.id === r.to; });
        if (!tf) return;
        const chip = texEl('button', 'chip rel-chip', (r.tag ? '[' + r.tag + '] ' : '') + tf.title);
        chip.setAttribute('data-action', 'jump');
        chip.setAttribute('data-arg', tf.id);
        rb.appendChild(chip);
      });
      box.appendChild(rb);
    }
    return box;
  }

  function jumpToCard(id) {
    currentView = 'browse';
    browseCat = 'all';
    browseQuery = '';
    browseMastery = 'all'; browseStars = 'all';
    browseExpanded = {};
    browseExpanded[id] = true;
    renderApp();
    setTimeout(function () {
      const node = document.querySelector('[data-card="' + id + '"]');
      if (node) node.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 60);
  }

  function renderLearnCard(id) {
    const app = document.getElementById('app');
    const f = DATA.find(function (x) { return x.id === id; });
    const reviewed = pos < frontier;
    const wrap = el('div', 'learn-wrap');

    const top = el('div', 'learn-top');
    top.appendChild(el('span', 'badge', CATS[f.cat]));
    wrap.appendChild(top);

    const m = mastery(id);
    const st = card(id);
    const meta = el('div', 'learn-meta');
    meta.appendChild(el('span', 'mastery-badge', m.label + ' ' + m.pct + '%'));
    meta.appendChild(el('span', 'star-badge', starText(metaOf(id)[0])));
    const bar = el('div', 'mastery-bar');
    const fill = el('div', 'mastery-fill');
    fill.style.width = m.pct + '%';
    bar.appendChild(fill);
    meta.appendChild(bar);
    meta.appendChild(el('span', 'muted',
      st.state === 'new' ? '尚未学习' : ((st.state === 'learning' || st.state === 'relearning') ? '学习中' : ('间隔 ' + st.ivl + ' 天' + (st.lapses > 0 ? ' · 遗忘 ' + st.lapses + ' 次' : '') + ' · ' + memoryStrengthText(st)))));
    wrap.appendChild(meta);

    const cardEl = el('div', 'card');
    const frontBox = el('div', 'front');
    if (!reviewed) { frontBox.setAttribute('data-action', 'reveal'); frontBox.setAttribute('title', '点击显示答案'); }
    renderTex(frontBox, f.front);
    cardEl.appendChild(frontBox);

    const backBox = el('div', 'back' + (reviewed ? '' : ' hidden'));
    renderTex(backBox, f.back);
    cardEl.appendChild(backBox);

    const useBox = el('div', 'use-box' + (reviewed ? '' : ' hidden'));
    useBox.appendChild(el('span', 'use-label', subjKind() === 'qa' ? '📌 考查方式：' : '📌 常考题型：'));
    useBox.appendChild(el('span', null, metaOf(id)[1]));
    cardEl.appendChild(useBox);

    const mn = mnemOf(id);
    if (mn) {
      const mb = el('div', 'mnem-box' + (reviewed ? '' : ' hidden'));
      mb.appendChild(el('span', 'mnem-label', '🗝️ 助记：'));
      mb.appendChild(texEl('span', null, mn));
      cardEl.appendChild(mb);
    }

    const pf = pitfallOf(id);
    if (pf) {
      const pfb = el('div', 'pitfall-box' + (reviewed ? '' : ' hidden'));
      pfb.appendChild(el('span', 'pitfall-label', '⚠️ 常见陷阱：'));
      pfb.appendChild(texEl('span', null, pf));
      cardEl.appendChild(pfb);
    }

    const hint = el('div', 'hint muted' + (reviewed ? '' : ' hidden'),
      reviewed
        ? (pendingAdvance ? '✅ ' + masteryDeltaText() + '，' + scheduleText(st) + '，点击「下一张」继续。' : '这是你已复习过的卡片（答案已展示），点「回到当前卡片」继续。')
        : '回想后再点击「显示答案」核对，主动回忆效果最佳。');
    cardEl.appendChild(hint);

    // 笔记模块置于真题/相关知识点模块之前
    const notesBox = el('div', 'notes-box' + (reviewed ? '' : ' hidden'));
    notesBox.appendChild(el('div', 'mini-label', '📝 我的笔记（感想 / 补充 / 易错点）'));
    const notes = el('textarea', 'card-notes');
    notes.placeholder = '在这里记录你的理解、补充或易错点…';
    notes.value = st.notes || '';
    let notesTimer;
    notes.addEventListener('input', function () {
      st.notes = notes.value;
      clearTimeout(notesTimer);
      notesTimer = setTimeout(saveDB, 400);
    });
    notesBox.appendChild(notes);
    cardEl.appendChild(notesBox);

    const extras = buildExtras(id, reviewed ? '' : ' hidden');
    if (extras) cardEl.appendChild(extras);

    cardEl.appendChild(memoryBox(id, reviewed ? '' : ' hidden'));

    wrap.appendChild(cardEl);

    const nav = el('div', 'learn-nav');
    if (pos > 0) {
      const back = el('button', 'btn small', '← 上一张');
      back.setAttribute('data-action', 'goback');
      nav.appendChild(back);
    }
    if (reviewed) {
      const go = el('button', 'btn small primary', pendingAdvance ? '下一张 ▶' : '回到当前卡片 →');
      go.setAttribute('data-action', 'gofront');
      nav.appendChild(go);
    }
    wrap.appendChild(nav);

    if (!reviewed) {
      const controls = el('div', 'controls');
      const reveal = el('button', 'btn primary', '显示答案');
      reveal.setAttribute('data-action', 'reveal');
      controls.appendChild(reveal);
      wrap.appendChild(controls);

      const rating = el('div', 'rating hidden');
      const mk = function (label, sub, r) {
        const prev = fmtPreview(previewNextTime(id, r)); // 预测：选此档后距下次复习的时长
        const b = el('button', 'btn rate r' + r, '');
        b.setAttribute('data-action', 'rate');
        b.setAttribute('data-arg', String(r));
        b.setAttribute('title', sub + ' · 下次约 ' + prev);
        b.appendChild(el('span', null, label));
        b.appendChild(el('small', 'rate-prev', prev));
        rating.appendChild(b);
      };
      mk('忘记', '完全没印象，再学一次', 0);
      mk('困难', '有印象但吃力', 1);
      mk('良好', '能想起，正常间隔', 2);
      mk('简单', '很轻松，拉长间隔', 3);
      wrap.appendChild(rating);
    }

    app.appendChild(wrap);
  }

  function revealCurrent() {
    const app = document.getElementById('app');
    app.querySelector('.back').classList.remove('hidden');
    app.querySelector('.use-box').classList.remove('hidden');
    const ex = app.querySelector('.extras');
    if (ex) ex.classList.remove('hidden');
    app.querySelector('.hint').classList.remove('hidden');
    const nb = app.querySelector('.notes-box');
    if (nb) nb.classList.remove('hidden');
    const pb = app.querySelector('.pitfall-box');
    if (pb) pb.classList.remove('hidden');
    const mb = app.querySelector('.mnem-box');
    if (mb) mb.classList.remove('hidden');
    const mem = app.querySelector('.memory-box');
    if (mem) mem.classList.remove('hidden');
    app.querySelector('.controls').classList.add('hidden');
    app.querySelector('.rating').classList.remove('hidden');
  }

  function doRate(r) {
    if (frontier >= deck.length) return;
    const id = deck[frontier];
    const beforeM = mastery(id).pct; // 评分前掌握度（存储强度到目标比例）
    applyRating(id, r);
    const afterM = mastery(id).pct;
    lastMasteryDelta = afterM - beforeM;
    markReviewed(id);
    addCost(r);
    // 记录掌握度历史快照（每次评分后的掌握度，供「掌握度趋势图」）
    {
      const c = card(id);
      if (!Array.isArray(c.hist)) c.hist = [];
      c.hist.push({ t: Date.now(), m: afterM, ivl: c.ivl || 0 });
      if (c.hist.length > 60) c.hist = c.hist.slice(-60);
      c.lastR = Date.now();
      c.ivlR = c.ivl || 0;
    }
    // 时间步进：学习中的卡按计时器到点重现（推回队尾，由 surfaceDue 在其 due 到达时提前）
    if (card(id).state === 'learning' || card(id).state === 'relearning') {
      deck.push(id);
    }
    frontier++;
    pendingAdvance = true;
    saveDB();
    saveSession();
    renderApp();
  }

  // ---------------- 浏览视图 ----------------
  let browseCat = 'all';
  let browseQuery = '';
  let browseExpanded = {};
  let browseMastery = 'all';
  let browseStars = 'all';

  function renderBrowse() {
    const app = document.getElementById('app');

    const head = el('div', 'browse-head');
    const search = el('input', 'search');
    search.type = 'search';
    search.placeholder = subjKind() === 'qa' ? '搜索知识点（名称 / 内容）…' : '搜索公式（名称 / 内容）…';
    search.value = browseQuery;
    // 输入时只重绘列表，不重建整个视图（避免销毁搜索框导致输入/IME 被打断）
    search.addEventListener('input', function () {
      browseQuery = search.value;
      const old = app.querySelector('.browse-list');
      if (old) old.replaceWith(buildBrowseList());
    });
    head.appendChild(search);
    app.appendChild(head);

    const chips = el('div', 'chips');
    const allChip = el('button', 'chip' + (browseCat === 'all' ? ' active' : ''), '全部');
    allChip.setAttribute('data-action', 'bcat');
    allChip.setAttribute('data-arg', 'all');
    chips.appendChild(allChip);
    catOrder().forEach(function (k) {
      const b = el('button', 'chip' + (browseCat === k ? ' active' : ''), CATS[k]);
      b.setAttribute('data-action', 'bcat');
      b.setAttribute('data-arg', k);
      chips.appendChild(b);
    });
    app.appendChild(chips);

    const chipsM = el('div', 'chips');
    chipsM.appendChild(el('span', 'filter-label', '掌握'));
    ['all', '未学', '初学', '生疏', '巩固中', '已掌握', '熟练', '稳固', '毕业'].forEach(function (v) {
      const b = el('button', 'chip' + (browseMastery === v ? ' active' : ''), v === 'all' ? '全部' : v);
      b.setAttribute('data-action', 'bmastery');
      b.setAttribute('data-arg', v);
      chipsM.appendChild(b);
    });
    app.appendChild(chipsM);

    const chipsS = el('div', 'chips');
    chipsS.appendChild(el('span', 'filter-label', '重要'));
    ['all', '1', '2', '3', '4', '5'].forEach(function (v) {
      const b = el('button', 'chip' + (browseStars === v ? ' active' : ''), v === 'all' ? '全部' : v + '★');
      b.setAttribute('data-action', 'bstars');
      b.setAttribute('data-arg', v);
      chipsS.appendChild(b);
    });
    app.appendChild(chipsS);

    app.appendChild(buildBrowseList());
  }

  // 构建浏览列表（独立函数，供搜索输入时局部重绘，避免整页重建打断输入）
  function buildBrowseList() {
    const list = el('div', 'browse-list');
    let n = 0;
    DATA.forEach(function (f) {
      if (browseCat !== 'all' && f.cat !== browseCat) return;
      if (browseMastery !== 'all' && mastery(f.id).label !== browseMastery) return;
      if (browseStars !== 'all' && String(metaOf(f.id)[0]) !== browseStars) return;
      if (browseQuery) {
        const hay = (f.title + ' ' + f.front + ' ' + f.back).toLowerCase();
        if (hay.indexOf(browseQuery.trim().toLowerCase()) === -1) return;
      }
      n++;
      list.appendChild(browseItem(f));
    });
    if (n === 0) list.appendChild(el('p', 'muted', subjKind() === 'qa' ? '没有匹配的知识点。' : '没有匹配的公式。'));
    return list;
  }

  function browseItem(f) {
    const item = el('div', 'browse-item');
    item.setAttribute('data-card', f.id);
    const head = el('button', 'browse-item-head');
    head.setAttribute('data-action', 'btoggle');
    head.setAttribute('data-arg', f.id);
    const left = el('div', 'browse-title');
    left.appendChild(el('span', 'badge', CATS[f.cat]));
    left.appendChild(texEl('span', 'browse-name', f.title));
    left.appendChild(el('span', 'star-badge small', starText(metaOf(f.id)[0])));
    const m = mastery(f.id);
    const mark = el('span', 'browse-state');
    mark.textContent = m.label + ' ' + m.pct + '%';
    left.appendChild(mark);
    head.appendChild(left);
    item.appendChild(head);

    const bar = el('div', 'mastery-bar');
    const fill = el('div', 'mastery-fill');
    fill.style.width = m.pct + '%';
    bar.appendChild(fill);
    item.appendChild(bar);

    if (browseExpanded[f.id]) {
      const body = el('div', 'browse-body');
      const q = el('div', 'browse-q');
      q.appendChild(el('div', 'mini-label', '提示'));
      const qb = el('div');
      renderTex(qb, f.front);
      q.appendChild(qb);
      body.appendChild(q);
      const a = el('div', 'browse-a');
      a.appendChild(el('div', 'mini-label', '答案'));
      const ab = el('div');
      renderTex(ab, f.back);
      a.appendChild(ab);
      const ub = el('div', 'use-box');
      ub.appendChild(el('span', 'use-label', subjKind() === 'qa' ? '📌 考查方式：' : '📌 常考题型：'));
      ub.appendChild(el('span', null, metaOf(f.id)[1]));
      a.appendChild(ub);
      body.appendChild(a);
      const mn = mnemOf(f.id);
      if (mn) {
        const mb = el('div', 'mnem-box');
        mb.appendChild(el('span', 'mnem-label', '🗝️ 助记：'));
        mb.appendChild(texEl('span', null, mn));
        body.appendChild(mb);
      }
      const pf = pitfallOf(f.id);
      if (pf) {
        const pfb = el('div', 'pitfall-box');
        pfb.appendChild(el('span', 'pitfall-label', '⚠️ 常见陷阱：'));
        pfb.appendChild(texEl('span', null, pf));
        body.appendChild(pfb);
      }
      // 笔记模块置于真题/相关知识点模块之前（与学习页一致）
      const notesBox = el('div', 'notes-box');
      notesBox.appendChild(el('div', 'mini-label', '📝 我的笔记（感想 / 补充 / 易错点）'));
      const notes = el('textarea', 'card-notes');
      notes.placeholder = '在这里记录你的理解、补充或易错点…';
      notes.value = card(f.id).notes || '';
      let notesTimer;
      notes.addEventListener('input', function () {
        card(f.id).notes = notes.value;
        clearTimeout(notesTimer);
        notesTimer = setTimeout(saveDB, 400);
      });
      notesBox.appendChild(notes);
      body.appendChild(notesBox);
      const extras = buildExtras(f.id, '');
      if (extras) body.appendChild(extras);
      body.appendChild(memoryBox(f.id));
      const reset = el('button', 'btn small danger', '重置此卡片进度');
      reset.setAttribute('data-action', 'resetcard');
      reset.setAttribute('data-arg', f.id);
      body.appendChild(reset);
      item.appendChild(body);
    }
    return item;
  }

  // ---------------- 自测视图 ----------------
  function renderQuiz() {
    const app = document.getElementById('app');
    if (!quiz) {
      const wrap = el('div', 'center-card');
      wrap.appendChild(el('h2', null, '📝 随机自测'));
      wrap.appendChild(el('p', 'muted', subjKind() === 'qa'
        ? '每次随机抽取 10 道题：给出内容，选择它的名称。用来检验你是否真正「认得」这些知识点。'
        : '每次随机抽取 10 道题：给出公式，选择它的名称。用来检验你是否真正「认得」公式。'));
      const b = el('button', 'btn primary', '开始自测');
      b.setAttribute('data-action', 'qstart');
      wrap.appendChild(b);
      app.appendChild(wrap);
      return;
    }
    if (quiz.idx >= quiz.qs.length) {
      renderQuizResult();
      return;
    }
    renderQuizQuestion();
  }

  function renderQuizQuestion() {
    const app = document.getElementById('app');
    const q = quiz.qs[quiz.idx];
    const wrap = el('div', 'quiz-wrap');

    const top = el('div', 'learn-top');
    top.appendChild(el('span', 'muted', '第 ' + (quiz.idx + 1) + ' / ' + quiz.qs.length + ' 题'));
    top.appendChild(el('span', 'badge', '得分 ' + quiz.score));
    wrap.appendChild(top);

    const cardEl = el('div', 'card');
    const label = el('div', 'mini-label', subjKind() === 'qa' ? '这个知识点叫什么？' : '这个公式叫什么？');
    cardEl.appendChild(label);
    const fb = el('div', 'front');
    renderTex(fb, q.card.back);
    cardEl.appendChild(fb);
    wrap.appendChild(cardEl);

    const opts = el('div', 'quiz-opts');
    q.opts.forEach(function (oid) {
      const of = DATA.find(function (x) { return x.id === oid; });
      const b = texEl('button', 'btn quiz-opt', of.title);
      b.setAttribute('data-action', 'qanswer');
      b.setAttribute('data-arg', oid);
      opts.appendChild(b);
    });
    wrap.appendChild(opts);

    app.appendChild(wrap);
  }

  function doQuizAnswer(oid) {
    const q = quiz.qs[quiz.idx];
    const correct = oid === q.card.id;
    if (correct) quiz.score++;
    // 高亮反馈
    const opts = document.querySelectorAll('.quiz-opt');
    opts.forEach(function (b) {
      b.disabled = true;
      if (b.getAttribute('data-arg') === q.card.id) b.classList.add('correct');
      else if (b.getAttribute('data-arg') === oid) b.classList.add('wrong');
    });
    const wrap = document.querySelector('.quiz-wrap');
    const fb = el('div', 'quiz-fb' + (correct ? ' ok' : ' no'));
    fb.textContent = correct ? '✅ 正确' : '❌ 错误';
    wrap.appendChild(fb);
    const next = el('button', 'btn primary', quiz.idx + 1 >= quiz.qs.length ? '查看结果' : '下一题');
    next.setAttribute('data-action', 'qnext');
    wrap.appendChild(next);
  }

  function renderQuizResult() {
    const app = document.getElementById('app');
    const wrap = el('div', 'center-card');
    wrap.appendChild(el('h2', null, '测验完成'));
    wrap.appendChild(el('p', 'big-score', quiz.score + ' / ' + quiz.qs.length));
    const again = el('button', 'btn primary', '再来一组');
    again.setAttribute('data-action', 'qstart');
    wrap.appendChild(again);
    app.appendChild(wrap);
  }

  function startQuiz() {
    const picked = shuffle(DATA.slice()).slice(0, Math.min(10, DATA.length));
    quiz = {
      qs: picked.map(function (p) {
        const others = shuffle(DATA.filter(function (f) { return f.id !== p.id; })).slice(0, 3);
        return { card: p, opts: shuffle([p].concat(others)).map(function (o) { return o.id; }) };
      }),
      idx: 0,
      score: 0
    };
    renderApp();
  }

  // ---------------- 设置视图 ----------------
  function renderSettings() {
    const app = document.getElementById('app');
    const wrap = el('div', 'settings-wrap');

    const s4 = el('div', 'setting-row');
    s4.appendChild(el('span', null, '目标名称'));
    const goalInput = el('input', 'num');
    goalInput.type = 'text';
    goalInput.maxLength = 10;
    goalInput.style.width = '120px';
    goalInput.value = (DB.settings && typeof DB.settings.goalTitle === 'string') ? DB.settings.goalTitle : GOAL_DEFAULT;
    goalInput.title = '倒计时指向的目标名称（可编辑，如考研 / 四六级 / 教资）';
    goalInput.addEventListener('change', function () {
      const v = goalInput.value.trim() || GOAL_DEFAULT;
      DB.settings.goalTitle = v;
      saveDB();
      goalInput.value = v;
      updateCountdown();
      toast('目标名称已设为「' + v + '」');
      renderApp();
    });
    s4.appendChild(goalInput);
    wrap.appendChild(s4);

    const s4b = el('div', 'setting-row');
    s4b.appendChild(el('span', null, '目标日期'));
    const examInput = el('input', 'num');
    examInput.type = 'date';
    examInput.style.width = '158px';
    examInput.value = (DB.settings && DB.settings.examDate) || '';
    examInput.title = '留空则自动按每年 12 月 20 日（原考研初试日，可改）';
    examInput.addEventListener('change', function () {
      DB.settings.examDate = examInput.value || '';
      saveDB();
      updateCountdown();
      toast(examInput.value ? '目标日期已设为 ' + examInput.value : '已恢复自动（每年 12 月 20 日）');
    });
    s4b.appendChild(examInput);
    wrap.appendChild(s4b);
    wrap.appendChild(el('p', 'muted', '用于顶部「目标倒计时」与每日首启弹窗。目标名称与日期都可编辑——考研后可改成四六级/教资等，App 继续可用（复习排期不受影响，仅倒计时/毕业目标/掌握度随之更新）。留空日期 = 自动取最近一个 12 月 20 日。'));

    const s6 = el('div', 'setting-row');
    s6.appendChild(el('span', null, '每日复习时间预算'));
    const minInput = el('input', 'num');
    minInput.type = 'number';
    minInput.min = '5'; minInput.max = '120'; minInput.step = '1';
    minInput.style.width = '96px';
    minInput.value = (DB.settings && typeof DB.settings.minutesPerDay === 'number') ? DB.settings.minutesPerDay : MIN_PER_DAY_DEFAULT;
    minInput.title = '每日最多投入的复习时间（分钟）';
    minInput.addEventListener('change', function () {
      let v = parseInt(minInput.value, 10);
      if (isNaN(v)) v = MIN_PER_DAY_DEFAULT;
      v = Math.max(5, Math.min(120, v));
      DB.settings.minutesPerDay = v;
      saveDB();
      minInput.value = v;
      toast('每日复习时间预算 ' + v + ' 分钟');
      renderApp();
    });
    s6.appendChild(minInput);
    wrap.appendChild(s6);
    wrap.appendChild(el('p', 'muted', '按「时间」而非「卡片数」安排学习：到期复习优先，复习实际用时计入预算，剩余时间用来引入新卡——最小化记忆成本（SSP-MMC 成本约束）。'));

    const s7 = el('div', 'setting-row');
    s7.appendChild(el('span', null, '毕业目标稳定度'));
    const linkedCb = el('input', 'chk');
    linkedCb.type = 'checkbox';
    linkedCb.checked = targetLinked();
    linkedCb.title = '开启后：毕业目标随目标倒计时自动变化（要求目标日可提取性 ≥ 90%）';
    linkedCb.addEventListener('change', function () {
      DB.settings.targetLinkExam = linkedCb.checked;
      saveDB();
      toast(linkedCb.checked ? '毕业目标已与目标倒计时挂钩（目标日保证 ≥90%）' : '毕业目标改用固定值');
      renderApp();
    });
    const cbLabel = el('label', 'setting-check', '');
    cbLabel.appendChild(linkedCb);
    cbLabel.appendChild(el('span', null, '与目标倒计时挂钩'));
    s7.appendChild(cbLabel);
    const tInput = el('input', 'num');
    tInput.type = 'number';
    tInput.min = '7'; tInput.max = '730'; tInput.step = '1';
    tInput.style.width = '96px';
    tInput.value = (DB.settings && typeof DB.settings.targetS === 'number') ? DB.settings.targetS : TARGET_S_DEFAULT;
    tInput.title = '关闭「与倒计时挂钩」时使用的固定目标稳定度（天）';
    tInput.addEventListener('change', function () {
      let v = parseInt(tInput.value, 10);
      if (isNaN(v)) v = TARGET_S_DEFAULT;
      v = Math.max(7, Math.min(730, v));
      DB.settings.targetS = v;
      saveDB();
      tInput.value = v;
      toast('固定毕业目标稳定度 ' + v + ' 天');
      renderApp();
    });
    s7.appendChild(tInput);
    wrap.appendChild(s7);
    wrap.appendChild(el('p', 'muted', targetLinked()
      ? '毕业目标自动随目标倒计时变化：要求「' + goalTitle() + '日仍能 ≥90% 记得」（等价稳定度 S ≥ 剩余天数）。距' + goalTitle() + ' ' + countdownDays() + ' 天 → 目标 S_N ≈ ' + Math.round(targetS()) + ' 天。'
      : '稳定度 S 达到该值即「毕业/稳固」——表示「停止复习后仍能 ≥90% 记得」的天数（固定值 ' + Math.round(targetS()) + ' 天）。勾选上方的「与目标倒计时挂钩」可改为随倒计时动态变化。'));

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

    app.appendChild(wrap);
  }

  // ---------------- 记忆原理视图 ----------------
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
    halflifeHistogram().forEach(function (b) {
      const row = el('div', 'cat-bar-row');
      row.appendChild(el('span', 'cat-bar-name', b[0]));
      const bar = el('div', 'cat-bar');
      const fill = el('div', 'cat-bar-fill');
      const maxH = Math.max.apply(null, halflifeHistogram().map(function (x) { return x[1]; }).concat([1]));
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
        how: '内置 SM-2 算法：按「忘记/困难/良好/简单」打分，自动把下次复习安排在遗忘临界点。' },
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
