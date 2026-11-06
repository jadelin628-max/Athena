/* Athena 题库 · 考研数学三（共 418 题 ＝ 手写真题 385（t53 的 2010–2022 共 157 条 + POC 首批 24 条 + bank-wave3 的 2023–2025 三卷 56 条 + W3-h 的 2010–2019 卷内补题 126 条 + W3-k 的 2026 卷 22 条） + 卡片派生 33（t49 追加 150 + T139 补挂例题 55，T142/T149/J 压制 28 条，W3-l 按 0.25 口径再压制 91 条 + 5 条 dupKey 浮出项））
 * W3-h：2010–2019 十年卷面缺题已按题面合并册原页裁片亲读逐字补录（每年补齐到卷面 23 题），
 *   溯源见各题 src.note；1987–2009 按用户 2026-11-05 裁定「暂缓」，未入库。
 * W3-i：全库去重 —— 生成器按 tools/dup-key.mjs 的精确同题键只收首条派生题（−8），
 *   32 条复述 year 真题的例题在 data/math3.js 登记 subOf（−32）；year 真题 363 条一条未删。
 * W3-j：按用户「数学三 2010–2020 每年 23 题、2021 起每年 22 题」的单一标准复核 ——
 *   真题侧逐年条数与题号 1..N 全部合规（2010–2025），2026 卷材料未入库故为 0；
 *   另压制 5 条与他卡重复、且能对到同年真题的例题（ser12/gx59 → m3-2023-13，
 *   dbi02 → m3-2023-19，ext06-3/gx01 → m3-2025-11），派生 129 → 124。
 *   年份维度自此只认真题（src/bank.mjs 的 bankYearRows / bankMatch），列表按题号数值升序。
 * W3-k：2026 卷 22 题入库（材料：参考文件/真题/数学/2026年考研数学三真题及答案解析.pdf，15 页，
 *   题面 p1–p3、解析 p4–p15，170 dpi 渲染亲读；切片规范见 backup/scratch/bank-wave3/W3K-SLICE-SPEC.md）。
 *   逐年标准自此 2010–2026 全部达标（2010–2020 每年 23、2021–2026 每年 22），全库 487 → 509。
 *   一(10) 册上【答案】栏标 C 与自身解析末段「应选 D」矛盾，按重推结论取 D 并留痕（见该题 src.note）。
 *   2026 的 school 统一记「全国硕士研究生招生考试-数学三 2026 年」——册页眉作「入学统一考试」，
 *   但 2025 官方封面（科目代码 303）与 2019/2023/2024 口径均为「招生考试」，故按官方卷名归一。
 *
 * 数据形态（可扩展）：
 *   window.BANK.<subj> = { id, name, sourceNote, types[], questions[] }
 *   question = { id, year, no, type, tags[], star, stem, options?, answer, traps, hint, src }
 *
 * 与既有 data/*.js 一致的加载范式：本文件是普通脚本，靠 <script> 标签在 app.js 之前加载，
 * 挂在 window.BANK 命名空间下（与 window.SUBJECTS.<id> 并列，互不污染）。
 *
 * 关键约定：
 *   1) tags 只放「现有知识点的 id」（data/math3.js 中已有 id，共 398 个）——
 *      标签名与「自带五星难度」在运行时由题库模块从 window.SUBJECTS.math3 反查，
 *      本文件不复制、不改写知识点数据。
 *   2) type 必须是本文件 types[] 的 key；「题型频率（五星）」由题库模块按库内真题实际统计得出。
 *   3) stem 忠实于「真题答案解析册」文本层的可读内容；数学符号在源 PDF 文字层中残损，
 *      此处按题号与解析上下文复原为规范 LaTeX（复原依据见每题 src.note，不虚构条件与结论）。
 * t49 卡片派生题（origin: 'card'，id 形如 cv-m3-<卡片id>，见 BEGIN GENERATED 哨兵块）：
 *   由 data/math3.js 的 EXAMPLE（180 键 / 206 条 ＝ t49 追加 150 条 + T139 补挂例题 55 条 + T144 返修补挂 int33-2 例题 1 条）按已裁定映射生成，**不要手改**——改 data/math3.js 后
 *   重跑 `node tools/bank-cv.mjs --subject math3 --write --allow-workspace-write --allow-math3-reorder` 即可复算；字段口径见 docs/DATA_SCHEMA.md。
 */
(function () {
  'use strict';

  var TYPES = [
    { key: 'limit', name: '极限与未定式', def: '求数列/函数极限，含 0/0、∞/∞、1^∞ 等未定式，主用等价无穷小替换、洛必达法则、重要极限。', judge: '题干出现 lim、n→∞ 或 x→0，且所求为极限值（非导数/积分）。', sample: '2013-Q1' },
    { key: 'evalAns', name: '概念辨析·选择判断', def: '以选择题形式考查定义与性质的细微差别（可导性、间断点、无穷小阶、向量组等价等）。', judge: '四选一的选择题，判据是「哪一项错误/正确」而非算出数值。', sample: '2013-Q2' },
    { key: 'deriv', name: '导数与渐近线', def: '求导数值、导数定义式，或求曲线的渐近线（垂直/水平/斜）。', judge: '题干求 f′(x₀) 或问「渐近线的条数」。', sample: '2012-Q1、2012-Q2' },
    { key: 'econ', name: '经济应用（边际/弹性）', def: '成本、利润、边际成本、需求价格弹性等经济变量的计算与最优决策，数三特征题。', judge: '题干出现「成本/利润/边际/弹性/定价」等经济语汇。', sample: '2012-Q17、2013-Q18、2019-Q12' },
    { key: 'dblint', name: '二重积分计算', def: '把二重积分化为累次积分（直角坐标/极坐标），注意区域定限与对称性。', judge: '题干出现 ∬_D 与区域 D 的描述。', sample: '2012-Q16' },
    { key: 'integral', name: '积分与变限积分', def: '不定积分与原函数（含分段函数的原函数）、变限积分函数的求导与性质（极值/拐点/奇偶性）以及定积分的计算。', judge: '题干出现 ∫f(x)dx、原函数、∫_a^x f(t)dt 等积分式，且所求为原函数、积分值或积分函数的性质。', sample: '2023-Q2、2025-Q2' },
    { key: 'series', name: '级数敛散性判别', def: '常数项级数的收敛、绝对收敛与条件收敛判别：先把通项定阶（等价无穷小/泰勒展开），再用比较判别法、莱布尼茨判别法判定。', judge: '题干出现 Σ 记号与「收敛/发散/绝对收敛/条件收敛」的判定要求。', sample: '2025-Q3' },
    { key: 'ode', name: '微分方程通解与特解', def: '一阶/二阶常系数线性微分方程的通解、由附加条件定特解，以及拐点等后续分析。', judge: '题干给定微分方程（含特征方程型 y″+py′+qy=0）。', sample: '2012-Q19、2013-Q12' },
    { key: 'proof', name: '中值定理证明题', def: '用介值定理、罗尔定理、拉格朗日中值定理证明存在性命题（存在 ξ 使某式成立）。', judge: '题干为「证明：存在 ξ/a 使得…」。', sample: '2013-Q19' },
    { key: 'linalg', name: '线性代数求解', def: '行列式、逆矩阵、伴随矩阵、线性方程组解的结构、向量组等价与秩的综合计算。', judge: '题干涉及矩阵/向量组/线性方程组且要求数值或解的判定。', sample: '2024-Q6、2024-Q7' },
    { key: 'eigen', name: '特征值·二次型', def: '特征值与特征向量、相似对角化、二次型矩阵表示、正交变换下的标准形与正定判定。', judge: '题干出现「特征值/二次型/标准形/正交变换/相似」。', sample: '2013-Q21' },
    { key: 'estimate', name: '参数估计（矩估计/最大似然）', def: '由总体概率密度求矩估计量与最大似然估计量。', judge: '题干出现「矩估计量/最大似然估计量」。', sample: '2013-Q23' },
  // ==== BEGIN GENERATED card-questions (t49) ====
    { key: "multivar", name: "多元函数微分与极值", def: "偏导数与全微分、复合函数与隐函数求导、多元函数极值与最值（含条件极值与拉格朗日乘数法）、二元函数可微性判定。",
      judge: "卡片章节 cat=multi（多元函数微分学，题干不含二重积分记号）：求偏导/全微分/极值，或判定可微性与连续-偏导关系。", sample: "multi03、ext13" },
  // ==== END GENERATED card-questions (t49) ====

  ];

  var DATA = [
    {
      id: 'm3-2012-1', origin: 'year', year: 2012, no: '一(1)', type: 'deriv', star: 2,school: '全国硕士研究生入学统一考试-数学三 2012 年', 
      tags: ['ext06', 'lim01', 'gx01'],
      stem: '曲线 $y=\\dfrac{x^{2}+x}{x^{2}-1}$ 渐近线的条数为（ ）',
      options: ['0', '1', '2', '3'],
      answer: '选 C。两条渐近线：$x=1$ 为垂直渐近线（$x\\to1$ 时 $y\\to\\infty$）；$y=1$ 为水平渐近线（$x\\to\\infty$ 时 $y\\to1$）。因已有水平渐近线，同侧不存在斜渐近线，故共 2 条。',
      traps: '把 $x=-1$ 也算作渐近线——$x=-1$ 处分子分母同趋于 0 是可去间断点（约分后 $y=\\frac{x}{x-1}$），并非垂直渐近线；另外「有水平渐近线时同侧无斜渐近线」是常被忽略的排他关系。',
      hint: '先求垂直渐近线（看分母为零且分子不为零的点），再分别看 $x\\to\\pm\\infty$ 的极限判断水平/斜渐近线。',
      src: { file: '参考文件/真题/数学/6、【1987-2025年】考研数学三真题答案及解析/2012年数学三真题答案解析.pdf', page: 1, no: '一(1)', note: '题干与【答案】C 取自 `参考文件/真题/数学/6、【1987-2025年】考研数学三真题答案及解析/2012年数学三真题答案解析.pdf` 第 1 页（文字层可读）。' }
    },
    {
      id: 'm3-2012-2', origin: 'year', year: 2012, no: '一(2)', type: 'deriv', star: 4,school: '全国硕士研究生入学统一考试-数学三 2012 年', 
      tags: ['dr01', 'dr02', 'dr07', 'ext01', 'd01'],
      stem: '设函数 $f(x)=(\\mathrm{e}^{x}-1)(\\mathrm{e}^{2x}-2)\\cdots(\\mathrm{e}^{nx}-n)$，其中 $n$ 为正整数，则 $f\'(0)=$（ ）',
      options: ['$(-1)^{n-1}(n-1)!$', '$(-1)^{n}(n-1)!$', '$(-1)^{n-1}n!$', '$(-1)^{n}n!$'],
      answer: '选 A，$f\'(0)=(-1)^{n-1}(n-1)!$。记第 $k$ 个因子 $u_k=\\mathrm{e}^{kx}-k$，由乘积求导法则 $f\'(x)=\\sum_{k=1}^{n}\\Big(\\prod_{j\\ne k}u_j(x)\\Big)u_k\'(x)$；在 $x=0$ 处 $u_j(0)=\\mathrm{e}^{0}-j=1-j$，其中 $u_1(0)=0$，故除 $k=1$ 以外的每一项都含零因子 $u_1(0)$，全部为 0，只剩 $k=1$ 的一项：\n$$f\'(0)=\\Big(\\prod_{j=2}^{n}u_j(0)\\Big)u_1\'(0)=\\prod_{j=2}^{n}(1-j)\\cdot1=(-1)^{n-1}(n-1)!\\,.$$\n（数值验证：$n=2$ 时 $f\'(0)=-1$，$n=3$ 时为 $2$，$n=4$ 时为 $-6$，均与选项 A 一致。）',
      traps: '忘记 $u_1(0)=0$ 让除 $k=1$ 之外的全部项归零（只需保留 $k=1$ 那一项，其余不必逐项计算）；把 $\\prod_{j=2}^{n}(1-j)$ 的符号数错（共 $n-1$ 个负因子，故 $(-1)^{n-1}$）；把阶乘写成 $n!$（应为 $(n-1)!$）。注意来源解析册该题【答案】栏印作 C，但其自身展开的首项已是 $\\prod_{j=2}^{n}(1-j)$，按乘积求导法则应选 A。',
      hint: '乘积在一点的导数，只在「零因子位置」存活：先找出哪个因子在 $x=0$ 为 0（是 $u_1$），再算该项 = 该因子的导数 × 其余因子在 $x=0$ 的取值。',
      src: { file: '参考文件/真题/数学/6、【1987-2025年】考研数学三真题答案及解析/2012年数学三真题答案解析.pdf', page: 1, no: '一(2)', note: '题干与四选项取自 `参考文件/真题/数学/6、【1987-2025年】考研数学三真题答案及解析/2012年数学三真题答案解析.pdf` 第 1 页（文字层可读）；答案按乘积求导法则与复步长数值复核确定为 A（来源【答案】栏疑误）。' }
    },
    {
      id: 'm3-2012-16', origin: 'year', year: 2012, no: '三(16)', type: 'dblint', star: 2,school: '全国硕士研究生入学统一考试-数学三 2012 年', 
      tags: ['dbi01', 'dbi02', 'int02', 'tp08'],
      stem: '计算二重积分 $\\displaystyle\\iint_D \\mathrm{e}^{x}xy\\,\\mathrm{d}x\\mathrm{d}y$，其中 $D$ 是以曲线 $y=\\sqrt{x}$、$y=\\dfrac{1}{\\sqrt{x}}$ 及 $y$ 轴为边界的无界区域。',
      answer: '区域写作 $D=\\{(x,y)\\mid 0<x\\le 1,\\ \\sqrt{x}\\le y\\le 1/\\sqrt{x}\\}$（两条曲线交于 $(1,1)$，$y$ 轴即 $x=0$；$x\\to0^{+}$ 时 $y=1/\\sqrt{x}\\to+\\infty$，故 $D$ 无界）。化为先 $y$ 后 $x$ 的累次积分：\n$$\\iint_D\\mathrm{e}^{x}xy\\,\\mathrm{d}x\\mathrm{d}y=\\int_0^1\\mathrm{e}^{x}x\\Big[\\frac{y^2}{2}\\Big]_{\\sqrt{x}}^{1/\\sqrt{x}}\\mathrm{d}x=\\frac12\\int_0^1\\mathrm{e}^{x}x\\Big(\\frac1x-x\\Big)\\mathrm{d}x=\\frac12\\int_0^1\\mathrm{e}^{x}(1-x^2)\\,\\mathrm{d}x.$$\n而 $\\int_0^1\\mathrm{e}^{x}\\mathrm{d}x=\\mathrm{e}-1$、$\\int_0^1x^2\\mathrm{e}^{x}\\mathrm{d}x=\\big[x^2\\mathrm{e}^x-2x\\mathrm{e}^x+2\\mathrm{e}^x\\big]_0^1=\\mathrm{e}-2$，故原式 $=\\dfrac12\\big[(\\mathrm{e}-1)-(\\mathrm{e}-2)\\big]=\\dfrac12$。',
      traps: '被积函数漏掉因子 $x$（是 $\\mathrm{e}^{x}xy$，不是 $\\mathrm{e}^{x}y$）；忘记 $D$ 的无界性（$x=0$ 是边界，$x\\to0^{+}$ 时上边界 $1/\\sqrt{x}$ 发散），把积分限写成有界区域的形状；$\\int_0^1x^2\\mathrm{e}^{x}\\mathrm{d}x$ 的分部积分算错（结果 $\\mathrm{e}-2$）。',
      hint: '先画 $D$：两曲线交于 $(1,1)$，在 $(0,1)$ 上 $\\sqrt{x}<1/\\sqrt{x}$，故按 X 型区域从 $\\sqrt{x}$ 积到 $1/\\sqrt{x}$；对 $y$ 积完后再用分部积分处理 $\\int x^2\\mathrm{e}^{x}\\mathrm{d}x$。',
      src: { file: '参考文件/真题/数学/6、【1987-2025年】考研数学三真题答案及解析/2012年数学三真题答案解析.pdf', page: 6, no: '三(16)', note: '题干取自 `参考文件/真题/数学/6、【1987-2025年】考研数学三真题答案及解析/2012年数学三真题答案解析.pdf` 第 6-7 页（并见 `参考文件/_extract/真题__数学__5、【1987-2025年】考研数学三真题__3、2010-2022考研数学三真题.txt` 第 916 行）；被积函数与定限按解析原文复原。' }
    },
    {
      id: 'm3-2012-17', origin: 'year', year: 2012, no: '三(17)', type: 'econ', star: 3,school: '全国硕士研究生入学统一考试-数学三 2012 年', 
      tags: ['ext21', 'ext08', 'multi04', 'gx22', 'kn11'],
      stem: '某企业为生产甲、乙两种型号的产品，投入的固定成本为 10000（万元）。设该企业生产甲、乙两种产品的产量分别为 $x$（件）与 $y$（件），且两种产品的边际成本分别为 $\\dfrac{x}{2}+20$（万元/件）与 $y+6$（万元/件）。\n1）求生产甲、乙两种产品的总成本函数 $C(x,y)$（万元）；\n2）当总产量为 50 件时，甲、乙两种的产量各为多少可以使总成本最小？求最小成本；\n3）求总产量为 50 件且总成本最小时甲产品的边际成本，并解释其经济意义。',
      answer: '1）由 $\\partial C/\\partial x=x/2+20$ 对 $x$ 积分得 $C(x,y)=\\frac{x^2}{4}+20x+D(y)$；再由 $\\partial C/\\partial y=D\'(y)=y+6$ 积分得 $D(y)=\\frac{y^2}{2}+6y+c$，结合 $C(0,0)=10000$ 得 $c=10000$，故 $C(x,y)=\\frac{x^2}{4}+20x+\\frac{y^2}{2}+6y+10000$。\n2）令 $y=50-x$（$0\\le x\\le50$）代入得 $C(x)=\\frac{x^2}{4}+20x+\\frac{(50-x)^2}{2}+6(50-x)+10000$，求导 $C\'(x)=\\frac{x}{2}+20-(50-x)-6=\\frac{3x}{2}-36=0$，得 $x=24$、$y=26$，最小成本 $C=\\frac{576}{4}+480+\\frac{676}{2}+156+10000=11118$（万元）。\n3）此时甲的边际成本 $C_x(24,26)=\\frac{24}{2}+20=32$（万元/件）。经济意义：在总产量 50 件且成本最小的安排下，再多生产 1 件甲产品（相应少生产 1 件乙产品）会使总成本增加 32 万元/件。',
      traps: '把边际成本当作平均成本去乘产量；或在第 2）问忘了「总产量 50 件」是约束（$y=50-x$）而分别对 $x$、$y$ 求导；第 3）问的边际成本是偏导数 $\\partial C/\\partial x$ 在最优点的取值，不是平均成本。',
      hint: '第 1）问用「偏积分 + 初始条件」复原总成本；第 2）问把约束代入化为一元最优化；第 3）问先写 $\\partial C/\\partial x$ 再代点。',
      src: { file: '参考文件/真题/数学/6、【1987-2025年】考研数学三真题答案及解析/2012年数学三真题答案解析.pdf', page: 7, no: '三(17)', note: '题干原文完整可读（`参考文件/真题/数学/6、【1987-2025年】考研数学三真题答案及解析/2012年数学三真题答案解析.pdf` 第 7-8 页）；最小成本与边际成本按解析的积分结果复算。' }
    },
    {
      id: 'm3-2012-19', origin: 'year', year: 2012, no: '三(19)', type: 'ode', star: 4,school: '全国硕士研究生入学统一考试-数学三 2012 年', 
      tags: ['ode01', 'ode02', 'ext20', 'mvt01'],
      stem: '已知函数 $f(x)$ 满足方程 $f\'\'(x)+f\'(x)-2f(x)=0$ 及 $f\'(x)+f(x)=2\\mathrm{e}^{x}$。\n1）求表达式 $f(x)$；\n2）求曲线 $y=f(x^{2})\\displaystyle\\int_0^{x}f(-t^{2})\\,\\mathrm{d}t$ 的拐点。',
      answer: '1）特征方程 $r^2+r-2=0$ 的根为 $r_1=1$、$r_2=-2$，故齐次方程通解 $f(x)=C_1\\mathrm{e}^{x}+C_2\\mathrm{e}^{-2x}$。代入 $f\'(x)+f(x)=2\\mathrm{e}^{x}$：$2C_1\\mathrm{e}^{x}-C_2\\mathrm{e}^{-2x}=2\\mathrm{e}^{x}$，比较系数得 $C_1=1$、$C_2=0$，故 $f(x)=\\mathrm{e}^{x}$。\n2）此时 $f(x^2)=\\mathrm{e}^{x^2}$、$f(-t^2)=\\mathrm{e}^{-t^2}$，曲线为 $y=\\mathrm{e}^{x^{2}}\\displaystyle\\int_0^{x}\\mathrm{e}^{-t^{2}}\\,\\mathrm{d}t$。由乘积求导与变限积分求导：\n$$y\'=\\mathrm{e}^{x^2}\\cdot\\mathrm{e}^{-x^2}+2x\\mathrm{e}^{x^{2}}\\int_0^{x}\\mathrm{e}^{-t^{2}}\\mathrm{d}t=1+2x\\mathrm{e}^{x^{2}}\\int_0^{x}\\mathrm{e}^{-t^{2}}\\mathrm{d}t,$$\n$$y\'\'=2\\mathrm{e}^{x^{2}}\\int_0^{x}\\mathrm{e}^{-t^{2}}\\mathrm{d}t+2x\\cdot2x\\mathrm{e}^{x^{2}}\\int_0^{x}\\mathrm{e}^{-t^{2}}\\mathrm{d}t+2x\\mathrm{e}^{x^{2}}\\mathrm{e}^{-x^{2}}=2x+2(1+2x^{2})\\mathrm{e}^{x^{2}}\\int_0^{x}\\mathrm{e}^{-t^{2}}\\mathrm{d}t.$$\n当 $x=0$ 时 $\\int_0^{0}\\mathrm{e}^{-t^{2}}\\mathrm{d}t=0$，故 $y\'\'(0)=0$；当 $x>0$ 时 $2x>0$ 且 $2(1+2x^{2})\\mathrm{e}^{x^{2}}\\int_0^{x}\\mathrm{e}^{-t^{2}}\\mathrm{d}t>0$，两项同号为正，$y\'\'>0$；当 $x<0$ 时两项同为负，$y\'\'<0$。即 $x=0$ 两侧 $y\'\'$ 变号，且 $x\\ne0$ 时 $y\'\'\\ne0$（两项同号不可能抵消），故曲线有唯一拐点 $x=0$，$y(0)=\\mathrm{e}^{0}\\times0=0$，即拐点 $(0,0)$。',
      traps: '第 1）问代入 $f\'+f=2\\mathrm{e}^{x}$ 定常数时漏掉 $C_2\\mathrm{e}^{-2x}$ 的负号；第 2）问把曲线看成两个函数的差（来源是乘积 $f(x^2)\\int_0^xf(-t^2)\\mathrm{d}t$），或漏掉乘积求导中的变限积分项；只由 $y\'\'(0)=0$ 就断言拐点（还须两侧变号）。',
      hint: '第 1 问「特征方程 → 通解 → 附加条件定常数」；第 2 问注意曲线是两个含 $x$ 的因子的**乘积**，求 $y\'\'$ 时既要对 $\\mathrm{e}^{x^2}$ 求导也要对积分上限求导，最后用「两项同号」判定变号点。',
      src: { file: '参考文件/真题/数学/6、【1987-2025年】考研数学三真题答案及解析/2012年数学三真题答案解析.pdf', page: 9, no: '三(19)', note: '题干与解析取自 `参考文件/真题/数学/6、【1987-2025年】考研数学三真题答案及解析/2012年数学三真题答案解析.pdf` 第 9 页（并见 `参考文件/_extract/真题__数学__5、【1987-2025年】考研数学三真题__3、2010-2022考研数学三真题.txt` 第 934 行）；被积函数在上限处的形式按解析复原。' }
    },
    {
      id: 'm3-2013-1', origin: 'year', year: 2013, no: '一(1)', type: 'limit', star: 3,school: '全国硕士研究生入学统一考试-数学三 2013 年', 
      tags: ['inf01', 'inf02', 'inf05', 'lim01', 'zb13', 'kn08'],
      stem: '当 $x\\to0$ 时，用 $o(x)$ 表示比 $x$ 高阶的无穷小，则下列式子中错误的是（ ）',
      options: ['$x\\cdot o(x^{2})=o(x^{3})$', '$o(x)\\cdot o(x^{2})=o(x^{3})$', '$o(x^{2})+o(x^{2})=o(x^{2})$', '$o(x)+o(x^{2})=o(x^{2})$'],
      answer: '选 D。$o(x)+o(x^{2})=o(x)$（相加取**较低阶**那一项），故写成 $o(x^{2})$ 错误。A 项 $x\\cdot o(x^{2})=o(x^{3})$ 正确（因 $o(x^{2})$ 乘上 $x$ 后量级降一阶）；B 项 $o(x)\\cdot o(x^{2})=o(x^{3})$ 正确（无穷小相乘阶数相加）；C 项 $o(x^{2})+o(x^{2})=o(x^{2})$ 正确。',
      traps: '误以为 $o(x)+o(x^{2})$ 取**较高阶**（正确是取较低阶 $o(x)$）——记牢 $o(x^m)+o(x^n)=o(x^{\\min(m,n)})$ 而 $o(x^m)\\cdot o(x^n)=o(x^{m+n})$；把选项 (D) 记成 $o(x^{2})+o(x^{3})=o(x^{3})$ 这类同阶幂的加法（对加法而言它反而是错的写法）。',
      hint: '把 $o(x^k)$ 想成「量级比 $x^k$ 更小」：加法保留更小的指数（更粗的量级），乘法指数相加。',
      src: { file: '参考文件/真题/数学/6、【1987-2025年】考研数学三真题答案及解析/2013年数学三真题答案解析.pdf', page: 1, no: '一(1)', note: '题干与四选项取自 `参考文件/真题/数学/6、【1987-2025年】考研数学三真题答案及解析/2013年数学三真题答案解析.pdf` 第 1 页（选项 (D) 与【答案】D、【解析】$o(x)+o(x^{2})=o(x)$ 均可读），并见 `参考文件/_extract/真题__数学__5、【1987-2025年】考研数学三真题__3、2010-2022考研数学三真题.txt` 第 782-784 行。' }
    },
    {
      id: 'm3-2013-2', origin: 'year', year: 2013, no: '一(2)', type: 'evalAns', star: 3,school: '全国硕士研究生入学统一考试-数学三 2013 年', 
      tags: ['lim01', 'lim17', 'lim16', 'lim04'],
      stem: '函数 $f(x)=\\dfrac{|x|^{x}-1}{x(x+1)\\ln|x|}$ 的可去间断点的个数为（ ）',
      options: ['0', '1', '2', '3'],
      answer: '选 C，2 个。间断点来自分母零点与对数无定义：$x=0$、$x=-1$（分母中的 $x$ 与 $x+1$）以及 $x=\\pm1$（$\\ln|x|=0$），即 $x=0,\\ \\pm1$。\n在 $x=0$ 处：$|x|^{x}-1=\\mathrm{e}^{x\\ln|x|}-1\\sim x\\ln|x|$，故 $f(x)\\to\\dfrac{x\\ln|x|}{x(x+1)\\ln|x|}=\\dfrac{1}{x+1}\\to1$，极限存在 → 可去间断点。\n在 $x=1$ 处：$|x|^{x}-1\\sim\\ln x$（$x\\to1$ 时 $\\ln x\\to0$），故 $f(x)\\to\\dfrac{\\ln x}{x(x+1)\\ln|x|}=\\dfrac{1}{x(x+1)}\\to\\dfrac12$，极限存在 → 可去间断点。\n在 $x=-1$ 处：同法 $|x|^{x}-1\\sim x\\ln|x|$（$x\\to-1$），$f(x)\\to\\dfrac{1}{x+1}\\to\\infty$，极限不存在 → 无穷间断点，不可去。\n故可去间断点共 2 个（$x=0$ 与 $x=1$）。',
      traps: '把分母记错（来源是 $x(x+1)\\ln|x|$，不是 $(x-1)\\ln|x|$），从而把 $x=1$ 与 $x=-1$ 的间断点类型搞反；忘记 $|x|^{x}$ 要写成 $\\mathrm{e}^{x\\ln|x|}$ 来求极限而直接当作 1；遗漏 $x=-1$（$x+1=0$ 与 $\\ln|x|=0$ 同时成立）这一间断点。',
      hint: '先把全部间断点找齐（分母为零、对数无定义），再对每个点用 $a^b=\\mathrm{e}^{b\\ln a}$ 与等价无穷小 $\\mathrm{e}^{u}-1\\sim u$ 化成可约形式求极限。',
      src: { file: '参考文件/真题/数学/6、【1987-2025年】考研数学三真题答案及解析/2013年数学三真题答案解析.pdf', page: 1, no: '一(2)', note: '题干与【答案】C 取自 `参考文件/真题/数学/6、【1987-2025年】考研数学三真题答案及解析/2013年数学三真题答案解析.pdf` 第 1 页（解析中的极限推导可读：$\\lim_{x\\to0}f=1$、$\\lim_{x\\to1}f=1/2$、$\\lim_{x\\to-1}f=\\infty$）。' }
    },
    {
      id: 'm3-2013-12', origin: 'year', year: 2013, no: '二(12)', type: 'ode', star: 2,school: '全国硕士研究生入学统一考试-数学三 2013 年', 
      tags: ['ode03', 'gx47', 'ode01', 'ext20', 'wr02'],
      stem: '微分方程 $y\'\'-y\'+\\dfrac14 y=0$ 的通解为 $y=$ ______ 。',
      answer: '$y=\\mathrm{e}^{x/2}(C_1 x+C_2)$。特征方程 $\\lambda^2-\\lambda+\\frac14=0$，判别式 $1-1=0$，得二重根 $\\lambda=\\frac12$，故通解为 $y=\\mathrm{e}^{x/2}(C_1x+C_2)$。',
      traps: '判别式为零（重根）时忘记乘 $x$：写成 $y=C_1\\mathrm{e}^{x/2}+C_2\\mathrm{e}^{x/2}$（实为同一解，丢掉线性无关的另一解）；或把重根误判为两个不同根 $\\lambda=1/2,1/2$ 而漏乘 $x$。',
      hint: '先写特征方程 $\\lambda^2+p\\lambda+q=0$；$\\Delta>0$ 两不同实根、$\\Delta=0$ 重根（乘 $x$）、$\\Delta<0$ 共轭复根。',
      src: { file: '参考文件/真题/数学/6、【1987-2025年】考研数学三真题答案及解析/2013年数学三真题答案解析.pdf', page: 5, no: '二(12)', note: '题干与【答案】取自 `参考文件/真题/数学/6、【1987-2025年】考研数学三真题答案及解析/2013年数学三真题答案解析.pdf` 第 5 页。' }
    },
    {
      id: 'm3-2013-13', origin: 'year', year: 2013, no: '二(13)', type: 'linalg', star: 3,school: '全国硕士研究生入学统一考试-数学三 2013 年', 
      tags: ['la02', 'la11', 'la10', 'ln03'],
      stem: '设 $A=(a_{ij})$ 是三阶非零矩阵，$|A|$ 为 $A$ 的行列式，$A_{ij}$ 为 $a_{ij}$ 的代数余子式。若 $a_{ij}+A_{ij}=0\\ (i,j=1,2,3)$，则 $|A|=$ ______ 。',
      answer: '$|A|=-1$。由 $a_{ij}+A_{ij}=0$ 得 $A^*=-A^{\\mathsf T}$，两边取行列式：$|A^*|=|-A^{\\mathsf T}|=(-1)^3|A|=-|A|$；又 $|A^*|=|A|^{3-1}=|A|^2$，故 $|A|^2=-|A|$，$|A|(|A|+1)=0$。$A$ 非零且 $A^*=-A^{\\mathsf T}$ 使 $|A|=0$ 不成立（解析给出 $|A|\\ne0$ 的论证），故 $|A|=-1$。',
      traps: '忘记 $|A^*|=|A|^{n-1}$（三阶即 $|A|^2$）而直接写成 $|A|$；以及 $-A^{\\mathsf T}$ 的行列式中 $(-1)^3$ 的符号（$n=3$ 为奇次）。另外必须排除 $|A|=0$ 这一支。',
      hint: '把条件翻译成矩阵等式 $A^*=-A^{\\mathsf T}$，再用 $AA^*=|A|E$ 或 $|A^*|=|A|^{n-1}$ 建立关于 $|A|$ 的方程。',
      src: { file: '参考文件/真题/数学/6、【1987-2025年】考研数学三真题答案及解析/2013年数学三真题答案解析.pdf', page: 5, no: '二(13)', note: '题干与【答案】取自 `参考文件/真题/数学/6、【1987-2025年】考研数学三真题答案及解析/2013年数学三真题答案解析.pdf` 第 5 页（含 $A^*=-A^{\\mathsf T}$、$|A|^2=-|A|$ 推导）。' }
    },
    {
      id: 'm3-2013-18', origin: 'year', year: 2013, no: '三(18)', type: 'econ', star: 3,school: '全国硕士研究生入学统一考试-数学三 2013 年', 
      tags: ['ext21', 'ext08', 'gx22', 'kn11', 'kn12'],
      stem: '设生产某产品的固定成本为 6000 元，可变成本为 20 元/件，价格函数为 $P=60-\\dfrac{Q}{1000}$（$P$ 是单价，单位：元；$Q$ 是销量，单位：件），已知产销平衡，求：\n（1）该商品的边际利润；\n（2）当 $P=50$ 时的边际利润，并解释其经济意义；\n（3）使得利润最大的定价 $P$。',
      answer: '（1）设利润为 $l$，$l=PQ-(20Q+6000)=Q\\big(60-\\frac{Q}{1000}\\big)-20Q-6000=40Q-\\frac{Q^2}{1000}-6000$，边际利润 $l\'=40-\\frac{Q}{500}$。\n（2）$P=50$ 时由 $50=60-\\frac{Q}{1000}$ 得 $Q=10000$，边际利润 $l\'=40-20=20$。经济意义：此时销量每增加 1 件，利润增加 20 元。\n（3）令 $l\'=0$ 得 $Q=20000$，此时 $P=60-\\frac{20000}{1000}=40$（元），即利润最大的定价为 40 元。',
      traps: '把「边际利润」误当作「利润」或「边际收益」$PQ$ 的导数（$MR=60-\\frac{Q}{500}$ 与 $l\'$ 不同，因含可变成本 20）；第（3）问须用 $Q^*$ 反解 $P^*$（不是直接把 $P$ 当自变量求导）；「产销平衡」意味着 $Q$ 即销量。',
      hint: '先把利润写成只含 $Q$ 的二次函数，再求导；第（2）问先由价格函数反解出对应销量，再代边际利润式。',
      src: { file: '参考文件/真题/数学/6、【1987-2025年】考研数学三真题答案及解析/2013年数学三真题答案解析.pdf', page: 7, no: '三(18)', note: '题干与解析（价格函数 $P=60-Q/1000$、$l\'=40-Q/500$、$P=40$）取自 `参考文件/真题/数学/6、【1987-2025年】考研数学三真题答案及解析/2013年数学三真题答案解析.pdf` 第 7 页。' }
    },
    {
      id: 'm3-2013-19', origin: 'year', year: 2013, no: '三(19)', type: 'proof', star: 4,school: '全国硕士研究生入学统一考试-数学三 2013 年', 
      tags: ['ext04', 'mvt01', 'mvt02', 'tp03'],
      stem: '设函数 $f(x)$ 在 $[0,+\\infty)$ 上可导，$f(0)=0$ 且 $\\lim\\limits_{x\\to+\\infty}f(x)=2$。证明：\n（1）存在 $a>0$，使得 $f(a)=1$；\n（2）对（1）中的 $a$，存在 $\\xi\\in(0,a)$，使得 $f\'(\\xi)=\\dfrac1a$。',
      answer: '（1）由 $\\lim\\limits_{x\\to+\\infty}f(x)=2$ 知存在 $X>0$，当 $x>X$ 时 $f(x)>\\frac32>1$；又 $f(x)$ 在 $[0,X]$ 上连续且 $f(0)=0<1<f(X)$，由连续函数介值定理，存在 $a\\in(0,X)$ 使 $f(a)=1$。\n（2）$f(x)$ 在 $[0,a]$ 上连续、在 $(0,a)$ 内可导，由拉格朗日中值定理：$f\'(\\xi)=\\dfrac{f(a)-f(0)}{a-0}=\\dfrac{1-0}{a}=\\dfrac1a$，其中 $\\xi\\in(0,a)$。',
      traps: '第（1）问直接引用介值定理却未先用极限说明「存在 $X$ 使 $f(X)>1$」（缺了构造区间这一步，条件不完整）；第（2）问忘记验证 $[0,a]$ 上连续、$(0,a)$ 内可导（中值定理的前提），或把端点 $a$ 也含进开区间。',
      hint: '存在性证明先「用极限造出比 1 大的函数值」，再用介值定理；第二问就是在 $[0,a]$ 上用拉格朗日中值定理，右端恰为 $1/a$。',
      src: { file: '参考文件/真题/数学/6、【1987-2025年】考研数学三真题答案及解析/2013年数学三真题答案解析.pdf', page: 7, no: '三(19)', note: '题干与解答要点取自 `参考文件/真题/数学/6、【1987-2025年】考研数学三真题答案及解析/2013年数学三真题答案解析.pdf` 第 7 页（含「$\\lim f(x)=2$」「$f(0)=0$」等可读表述）。' }
    },
    {
      id: 'm3-2013-21', origin: 'year', year: 2013, no: '三(21)', type: 'eigen', star: 5,school: '全国硕士研究生入学统一考试-数学三 2013 年', 
      tags: ['zt02', 'tp04', 'kn66', 'kn67', 'la04'],
      stem: '设二次型 $f(x_1,x_2,x_3)=2\\big(a_1x_1+a_2x_2+a_3x_3\\big)^2+\\big(b_1x_1+b_2x_2+b_3x_3\\big)^2$，记 $\\boldsymbol{\\alpha}=\\begin{pmatrix}a_1\\\\a_2\\\\a_3\\end{pmatrix}$，$\\boldsymbol{\\beta}=\\begin{pmatrix}b_1\\\\b_2\\\\b_3\\end{pmatrix}$。\n（Ⅰ）证明二次型 $f$ 对应的矩阵为 $2\\boldsymbol{\\alpha}\\boldsymbol{\\alpha}^{\\mathsf T}+\\boldsymbol{\\beta}\\boldsymbol{\\beta}^{\\mathsf T}$；\n（Ⅱ）若 $\\boldsymbol{\\alpha},\\boldsymbol{\\beta}$ 正交且均为单位向量，证明二次型 $f$ 在正交变换下的标准形为二次型 $2y_1^2+y_2^2$。',
      answer: '（Ⅰ）记 $\\boldsymbol{x}=(x_1,x_2,x_3)^{\\mathsf T}$，则 $a_1x_1+a_2x_2+a_3x_3=\\boldsymbol{\\alpha}^{\\mathsf T}\\boldsymbol{x}$、$b_1x_1+b_2x_2+b_3x_3=\\boldsymbol{\\beta}^{\\mathsf T}\\boldsymbol{x}$，于是 $f=2(\\boldsymbol{\\alpha}^{\\mathsf T}\\boldsymbol{x})^2+(\\boldsymbol{\\beta}^{\\mathsf T}\\boldsymbol{x})^2=\\boldsymbol{x}^{\\mathsf T}\\big(2\\boldsymbol{\\alpha}\\boldsymbol{\\alpha}^{\\mathsf T}+\\boldsymbol{\\beta}\\boldsymbol{\\beta}^{\\mathsf T}\\big)\\boldsymbol{x}$。因 $2\\boldsymbol{\\alpha}\\boldsymbol{\\alpha}^{\\mathsf T}+\\boldsymbol{\\beta}\\boldsymbol{\\beta}^{\\mathsf T}$ 为实对称矩阵，故它就是 $f$ 的矩阵（二次型与对称矩阵一一对应）。\n（Ⅱ）$A=2\\boldsymbol{\\alpha}\\boldsymbol{\\alpha}^{\\mathsf T}+\\boldsymbol{\\beta}\\boldsymbol{\\beta}^{\\mathsf T}$，由 $\\|\\boldsymbol{\\alpha}\\|=\\|\\boldsymbol{\\beta}\\|=1$、$\\boldsymbol{\\alpha}^{\\mathsf T}\\boldsymbol{\\beta}=0$ 得 $A\\boldsymbol{\\alpha}=2\\boldsymbol{\\alpha}$、$A\\boldsymbol{\\beta}=\\boldsymbol{\\beta}$、$A\\boldsymbol{\\gamma}=\\boldsymbol{0}$（$\\boldsymbol{\\gamma}=\\boldsymbol{\\alpha}\\times\\boldsymbol{\\beta}$）。取 $\\boldsymbol{\\alpha},\\boldsymbol{\\beta},\\boldsymbol{\\gamma}$ 单位正交化后的正交矩阵 $Q$，正交变换 $\\boldsymbol{x}=Q\\boldsymbol{y}$ 下 $f=\\boldsymbol{y}^{\\mathsf T}Q^{\\mathsf T}AQ\\boldsymbol{y}=2y_1^2+y_2^2$。',
      traps: '（Ⅰ）忘记说明「矩阵必须实对称」才能作为二次型的矩阵（否则不唯一）；（Ⅱ）把 $A\\boldsymbol{\\alpha}=2\\boldsymbol{\\alpha}$ 的系数算错（$2\\boldsymbol{\\alpha}\\boldsymbol{\\alpha}^{\\mathsf T}\\boldsymbol{\\alpha}=2\\boldsymbol{\\alpha}$ 用了单位性），或漏掉第三个特征值 0 与对应向量 $\\boldsymbol{\\gamma}$ 的构造，导致正交矩阵凑不出。',
      hint: '把 $(\\boldsymbol{\\alpha}^{\\mathsf T}\\boldsymbol{x})^2$ 写成 $\\boldsymbol{x}^{\\mathsf T}\\boldsymbol{\\alpha}\\boldsymbol{\\alpha}^{\\mathsf T}\\boldsymbol{x}$ 即可看出矩阵；第二问直接验算 $A$ 作用在 $\\boldsymbol{\\alpha},\\boldsymbol{\\beta}$ 上得到特征值 2 与 1，再用正交补得 0。',
      src: { file: '参考文件/真题/数学/6、【1987-2025年】考研数学三真题答案及解析/2013年数学三真题答案解析.pdf', page: 8, no: '三(21)', note: '题干取自 `参考文件/真题/数学/6、【1987-2025年】考研数学三真题答案及解析/2013年数学三真题答案解析.pdf` 第 8-9 页（含二次型与 $\\boldsymbol{\\alpha},\\boldsymbol{\\beta}$ 定义、标准形 $2y_1^2+y_2^2$）。' }
    },
    {
      id: 'm3-2013-23', origin: 'year', year: 2013, no: '三(23)', type: 'estimate', star: 3,school: '全国硕士研究生入学统一考试-数学三 2013 年', 
      tags: ['tp02', 'int04', 'ext21', 'gx27'],
      stem: '设总体 $X$ 的概率密度为\n$$f(x)=\\begin{cases}\\theta^{2}x^{-3}\\mathrm{e}^{-\\theta/x},&x>0,\\\\0,&\\text{其它,}\\end{cases}$$\n其中 $\\theta$ 为未知参数且大于零，$X_1,X_2,\\cdots,X_N$ 为来自总体 $X$ 的简单随机样本。\n（1）求 $\\theta$ 的矩估计量；\n（2）求 $\\theta$ 的最大似然估计量。',
      answer: '（1）$E(X)=\\displaystyle\\int_0^{+\\infty}x\\cdot\\theta^{2}x^{-3}\\mathrm{e}^{-\\theta/x}\\,\\mathrm{d}x$。令 $t=\\dfrac{\\theta}{x}$（$x=\\dfrac{\\theta}{t}$、$\\mathrm{d}x=-\\dfrac{\\theta}{t^{2}}\\mathrm{d}t$）代入得 $E(X)=\\displaystyle\\int_0^{+\\infty}\\theta\\mathrm{e}^{-t}\\,\\mathrm{d}t=\\theta$。令 $E(X)=\\bar X$ 得 $\\theta$ 的矩估计量 $\\hat\\theta=\\bar X$。\n（2）似然函数 $L(\\theta)=\\displaystyle\\prod_{i=1}^{N}\\theta^{2}X_i^{-3}\\mathrm{e}^{-\\theta/X_i}=\\theta^{2N}\\Big(\\prod_{i=1}^{N}X_i^{-3}\\Big)\\mathrm{e}^{-\\theta\\sum 1/X_i}$，对数似然\n$$\\ln L=2N\\ln\\theta-3\\sum_{i=1}^{N}\\ln X_i-\\theta\\sum_{i=1}^{N}\\frac{1}{X_i}.$$\n令 $\\dfrac{\\mathrm{d}\\ln L}{\\mathrm{d}\\theta}=\\dfrac{2N}{\\theta}-\\displaystyle\\sum_{i=1}^{N}\\dfrac{1}{X_i}=0$，得 $\\theta$ 的最大似然估计量 $\\hat\\theta=\\dfrac{2N}{\\sum_{i=1}^{N}\\dfrac{1}{X_i}}$。',
      traps: '把 $f(x)=\\theta^{2}x^{-3}\\mathrm{e}^{-\\theta/x}$ 误认成指数分布 $f=\\frac1\\theta\\mathrm{e}^{-x/\\theta}$（均值 $\\theta$）或伽马型 $\\frac{x}{\\theta^2}\\mathrm{e}^{-x/\\theta}$（均值 $2\\theta$）——本题是逆伽马型，均值恰为 $\\theta$，矩估计量为 $\\bar X$ 而非 $\\frac{\\bar X}{2}$；最大似然求导时把 $\\sum\\frac{1}{X_i}$ 写成 $\\sum X_i$（分子是 $x$ 的负一次幂）。',
      hint: '矩估计先做换元 $t=\\theta/x$ 把 $E(X)$ 积出来，再令它等于样本均值；最大似然直接对 $\\ln L$ 求导，注意含 $\\theta$ 的那一项是 $\\theta\\sum(1/X_i)$。',
      src: { file: '参考文件/真题/数学/6、【1987-2025年】考研数学三真题答案及解析/2013年数学三真题答案解析.pdf', page: 9, no: '三(23)', note: '题干与【解析】取自 `参考文件/真题/数学/6、【1987-2025年】考研数学三真题答案及解析/2013年数学三真题答案解析.pdf` 第 9-10 页（含 $\\theta^{2}x^{-3}\\mathrm{e}^{-\\theta/x}$、$EX=\\theta$、$\\hat\\theta=X\\,$ 与 $\\,\\hat\\theta=2N/\\sum(1/X_i)$）。' }
    },
    {
      id: 'm3-2019-12', origin: 'year', year: 2019, no: '二(12)', type: 'econ', star: 4,school: '全国硕士研究生招生考试-数学三 2019 年', 
      tags: ['ext08', 'kn12', 'ext21', 'gx27', 'gx28'],
      stem: '以 $P_A$、$P_B$ 分别表示 A、B 两个商品的价格，设商品 A 的需求函数 $Q_A=500-P_A^{2}-P_AP_B+2P_B^{2}$，则当 $P_A=10$、$P_B=20$ 时，商品 A 的需求量对自身价格的弹性 $\\eta_{AA}$（$\\eta_{AA}>0$）= ______ 。',
      answer: '当 $P_B=20$ 时，$Q_A=500-P_A^{2}-20P_A+2\\times20^{2}=1300-20P_A-P_A^{2}$，$\\dfrac{\\mathrm{d}Q_A}{\\mathrm{d}P_A}=-20-2P_A$。\n由点弹性定义 $\\eta_{AA}=-\\dfrac{P_A}{Q_A}\\dfrac{\\mathrm{d}Q_A}{\\mathrm{d}P_A}=\\dfrac{2P_A(P_A+10)}{1300-20P_A-P_A^{2}}$。\n代入 $P_A=10$：$Q_A=1300-200-100=1000$、$\\dfrac{\\mathrm{d}Q_A}{\\mathrm{d}P_A}=-40$，故\n$$\\eta_{AA}=-\\dfrac{10}{1000}\\times(-40)=0.4,$$\n即应填 0.4。',
      traps: '点弹性公式漏掉 $\\dfrac{P_A}{Q_A}$ 的系数（只写 $\\dfrac{\\mathrm{d}Q_A}{\\mathrm{d}P_A}$）或漏掉负号；没有先把 $P_B=20$ 代入化简就直接对 $P_B$ 求偏导；把需求函数记错（漏掉 $P_A^{2}$ 或交叉项 $P_AP_B$）；忘记题目已声明 $\\eta_{AA}>0$（只需给出正值）。',
      hint: '先用 $P_B=20$ 把需求函数化为一元式，再按 $\\eta=-\\frac{P}{Q}\\frac{\\mathrm{d}Q}{\\mathrm{d}P}$ 代入，最后按题目要求取正值。',
      src: { file: '参考文件/真题/数学/6、【1987-2025年】考研数学三真题答案及解析/2019年数学三真题答案解析.pdf', page: 3, no: '二(12)', note: '题面取自 `参考文件/_extract/真题__数学__5、【1987-2025年】考研数学三真题__3、2010-2022考研数学三真题.txt` 第 303-304 行；解答取自 `参考文件/真题/数学/6、【1987-2025年】考研数学三真题答案及解析/2019年数学三真题答案解析.pdf` 第 3 页（「当 PB=20 时 QA=500−PA²−20PA+2·20²=1300−20PA−PA²…故应填 0.4」）。' }
    },
{
      id: 'm3-2023-1', origin: 'year', year: 2023, no: '一(1)', type: 'evalAns', star: 4,school: '全国硕士研究生招生考试-数学三 2023 年', 
      tags: ['ext13', 'gx17', 'gx40'],
      stem: '已知函数 $f(x,y)=\\ln\\left(y+|x\\sin y|\\right)$，则（ ）',
      options: ['$\\left.\\dfrac{\\partial f}{\\partial x}\\right|_{(0,1)}$ 不存在，$\\left.\\dfrac{\\partial f}{\\partial y}\\right|_{(0,1)}$ 存在', '$\\left.\\dfrac{\\partial f}{\\partial x}\\right|_{(0,1)}$ 存在，$\\left.\\dfrac{\\partial f}{\\partial y}\\right|_{(0,1)}$ 不存在', '$\\left.\\dfrac{\\partial f}{\\partial x}\\right|_{(0,1)}$、$\\left.\\dfrac{\\partial f}{\\partial y}\\right|_{(0,1)}$ 均存在', '$\\left.\\dfrac{\\partial f}{\\partial x}\\right|_{(0,1)}$、$\\left.\\dfrac{\\partial f}{\\partial y}\\right|_{(0,1)}$ 均不存在'],
      answer: '选 A。在点 $(0,1)$ 处按定义求偏导：\n$$\\left.\\frac{\\partial f}{\\partial x}\\right|_{(0,1)}=\\lim_{x\\to0}\\frac{f(x,1)-f(0,1)}{x}=\\lim_{x\\to0}\\frac{\\ln\\left(1+|x\\sin 1|\\right)}{x}=\\sin1\\cdot\\lim_{x\\to0}\\frac{|x|}{x},$$\n其中 $\\lim\\limits_{x\\to0}\\dfrac{|x|}{x}$ 不存在（左极限 $-1$、右极限 $1$），故 $\\partial f/\\partial x|_{(0,1)}$ 不存在。\n再看 $x=0$ 处：$f(0,y)=\\ln y$，于是\n$$\\left.\\frac{\\partial f}{\\partial y}\\right|_{(0,1)}=\\lim_{y\\to1}\\frac{\\ln y-\\ln 1}{y-1}=\\lim_{y\\to1}\\frac{\\ln y}{y-1}=1,$$\n即 $\\partial f/\\partial y|_{(0,1)}$ 存在。故选 A。',
      traps: '误选 D（都「不存在」）：$\\partial f/\\partial y$ 只留下 $\\ln y$，就是一元 $\\ln y$ 在 $y=1$ 处的导数，存在且为 1。另一处易错是把 $\\lim\\limits_{x\\to0}\\dfrac{\\ln(1+|x\\sin1|)}{x}$ 直接算成 $\\sin1$，漏掉 $|x|/x$ 的符号跳变。',
      hint: '求一点的偏导用定义：先固定另一个变量（$y=1$ 或 $x=0$）化成一元函数，再用导数定义；注意 $|x|$ 在 0 处左右符号不同，极限不存在。',
      src: { file: '参考文件/真题/数学/6、【1987-2025年】考研数学三真题答案及解析/2023年数学三真题答案解析.pdf', page: 1, no: '一(1)', note: '题面取自 `参考文件/真题/数学/5、【1987-2025年】考研数学三真题/2023年考研数学三真题.pdf` 第 2 页（扫描件，无文本层）；题干与选项的抽取文本为 `参考文件/_extract/真题__数学__5、【1987-2025年】考研数学三真题__2023年考研数学三真题.txt` 第 23 行（题干）与第 24-25 行（选项，(C)(D) 作「均存在/均不存在」），与该册第 2 页扫描页一致（裁片 `backup/scratch/bank-fix2/src-img/zt2023_p2_top.png`，我本人用 read_image 读图）。答案 A 取自 `2023年数学三真题答案解析.pdf` 第 1 页；抽取文本 `参考文件/_extract/真题__数学__6、【1987-2025年】考研数学三真题答案及解析__2023年数学三真题答案解析.txt` 第 5 行「（1）【答案】A」与第 9 行「答案选（A）」，裁片 `backup/scratch/bank-fix2/src-img/jx2023_p1_top.png`（我本人用 read_image 读图）。' }
    },
    {
      id: 'm3-2023-2', origin: 'year', year: 2023, no: '一(2)', type: 'integral', star: 4,school: '全国硕士研究生招生考试-数学三 2023 年', 
      tags: ['gx29', 'int24', 'gx31'],
      stem: '函数 $f(x)=\\begin{cases}\\dfrac{1}{\\sqrt{1+x^{2}}}, & x\\le 0,\\\\ (x+1)\\cos x, & x>0,\\end{cases}$ 的一个原函数为（ ）',
      options: ['$F(x)=\\begin{cases}\\ln\\left(\\sqrt{1+x^{2}}-x\\right), & x\\le 0,\\\\ (x+1)\\cos x-\\sin x, & x>0\\end{cases}$', '$F(x)=\\begin{cases}\\ln\\left(\\sqrt{1+x^{2}}-x\\right)+1, & x\\le 0,\\\\ (x+1)\\cos x-\\sin x, & x>0\\end{cases}$', '$F(x)=\\begin{cases}\\ln\\left(\\sqrt{1+x^{2}}+x\\right), & x\\le 0,\\\\ (x+1)\\sin x+\\cos x, & x>0\\end{cases}$', '$F(x)=\\begin{cases}\\ln\\left(\\sqrt{1+x^{2}}+x\\right)+1, & x\\le 0,\\\\ (x+1)\\sin x+\\cos x, & x>0\\end{cases}$'],
      answer: '选 D。分段积分：\n- $x\\le0$ 时 $\\displaystyle\\int\\frac{\\mathrm{d}x}{\\sqrt{1+x^{2}}}=\\ln\\left(x+\\sqrt{1+x^{2}}\\right)+C_1$；\n- $x>0$ 时 $\\displaystyle\\int(x+1)\\cos x\\,\\mathrm{d}x=(x+1)\\sin x-\\int\\sin x\\,\\mathrm{d}x=(x+1)\\sin x+\\cos x+C_2$。\n原函数必须处处连续，在 $x=0$ 处比较两侧极限：左极限 $\\ln 1+C_1=C_1$，右极限 $(0+1)\\cdot0+1+C_2=1+C_2$，故 $C_1=1+C_2$。取 $C_2=0$ 得 $C_1=1$，即 $F(x)$ 在 $x\\le0$ 段为 $\\ln\\left(x+\\sqrt{1+x^{2}}\\right)+1$、在 $x>0$ 段为 $(x+1)\\sin x+\\cos x$，选 D。（选项 C 左段为 $\\ln\\left(\\sqrt{1+x^{2}}+x\\right)$，在 $x=0$ 处左极限 $0$、右极限 $1$，不连续，故不是原函数。）',
      traps: '只分段积分而不检验「原函数在分段点连续」：右段只有 $(x+1)\\sin x+\\cos x$ 与 $(x+1)\\cos x-\\sin x$ 两种形状，前者是原函数；再靠 $x=0$ 处连续性在「$+1$ 与否」中二选一。另外 $\\ln\\left(x+\\sqrt{1+x^{2}}\\right)$ 与 $\\ln\\left(\\sqrt{1+x^{2}}-x\\right)$ 互为相反数，容易写错符号。',
      hint: '两段分别积分，再强制原函数在分界点 $x=0$ 连续：比较左右极限得到 $C_1=1+C_2$，据此在四个选项里择优。',
      src: { file: '参考文件/真题/数学/6、【1987-2025年】考研数学三真题答案及解析/2023年数学三真题答案解析.pdf', page: 1, no: '一(2)', note: '题面取自 `参考文件/真题/数学/5、【1987-2025年】考研数学三真题/2023年考研数学三真题.pdf` 第 2 页（扫描件，无文本层）；题干与四选项的抽取文本为 `参考文件/_extract/真题__数学__5、【1987-2025年】考研数学三真题__2023年考研数学三真题.txt` 第 27 行（题干，无「设」「则」）与第 29-36 行（四选项）。答案 D 取自 `2023年数学三真题答案解析.pdf` 第 1 页；抽取文本 `参考文件/_extract/真题__数学__6、【1987-2025年】考研数学三真题答案及解析__2023年数学三真题答案解析.txt` 第 12 行「（2）【答案】D」与第 17 行「答案选（D）」，裁片 `backup/scratch/bank-fix2/src-img/jx2023_p1_bot.png`（我本人用 read_image 读图）。' }
    },
    {
      id: 'm3-2023-3', origin: 'year', year: 2023, no: '一(3)', type: 'ode', star: 4,school: '全国硕士研究生招生考试-数学三 2023 年', 
      tags: ['ode03', 'tp07'],
      stem: '若微分方程 $y\'\'+ay\'+by=0$ 的解在 $(-\\infty,+\\infty)$ 上有界，则（ ）',
      options: ['$a<0,\\ b>0$', '$a>0,\\ b>0$', '$a=0,\\ b>0$', '$a=0,\\ b<0$'],
      answer: '选 C。特征方程为 $\\lambda^{2}+a\\lambda+b=0$，按判别式讨论：\n- 当 $a\\ne0$ 时，无论实根还是复根，特征根的实部都是 $-\\dfrac{a}{2}\\ne0$，通解含因子 $\\mathrm{e}^{-\\frac{a}{2}x}$，$x\\to\\pm\\infty$ 时必有一侧无界；\n- 当 $a=0,\\ b>0$ 时，$\\lambda=\\pm\\mathrm{i}\\sqrt{b}$，通解 $y=C_1\\cos\\sqrt{b}x+C_2\\sin\\sqrt{b}x$，在全实轴上有界；\n- 当 $b<0$ 时，$\\lambda=\\pm\\sqrt{|b|}$ 为实根，通解含 $\\mathrm{e}^{\\sqrt{|b|}x}$，$x\\to+\\infty$ 无界；\n- 当 $a=0,\\ b=0$ 时 $y=C_1+C_2x$ 也无界。\n故只有 $a=0,\\ b>0$ 满足条件，选 C。',
      traps: '把「有界」当成「趋于 0」（后者才是 $a>0$ 的稳定情形）；忽略 $a\\ne0$ 时复根也有实部 $-a/2$，从而误以为只要 $b>0$ 就有界。',
      hint: '写特征方程 $\\lambda^{2}+a\\lambda+b=0$，分实根/复根讨论；全实轴有界要求所有特征根实部为 0，且不能出现 $x$ 乘常数之一类增长项。',
      src: { file: '参考文件/真题/数学/6、【1987-2025年】考研数学三真题答案及解析/2023年数学三真题答案解析.pdf', page: 1, no: '一(3)', note: '题面取自 `参考文件/真题/数学/5、【1987-2025年】考研数学三真题/2023年考研数学三真题.pdf` 第 2 页起（扫描件，无文本层；题干首行见裁片 `backup/scratch/bank-fix2/src-img/zt2023_p2_top.png`，我本人用 read_image 读图）；题干与四选项的抽取文本为 `参考文件/_extract/真题__数学__5、【1987-2025年】考研数学三真题__2023年考研数学三真题.txt` 第 37 行（题干）与第 38-39 行（四选项）。答案 C 取自 `2023年数学三真题答案解析.pdf` 第 1-2 页（「(3)【答案】 C.」与「因此答案选(C).」）；抽取文本 `参考文件/_extract/真题__数学__6、【1987-2025年】考研数学三真题答案及解析__2023年数学三真题答案解析.txt` 第 18 行与第 30 行，裁片 `backup/scratch/bank-fix2/src-img/jx2023_p1_bot.png`、`backup/scratch/bank-fix2/src-img/jx2023_p2_top.png`（我本人用 read_image 读图）。' }
    },
    {
      id: 'm3-2023-4', origin: 'year', year: 2023, no: '一(4)', type: 'evalAns', star: 3,school: '全国硕士研究生招生考试-数学三 2023 年', 
      tags: ['ext16', 'kn51', 'gx51'],
      stem: '已知 $a_n<b_n\\ (n=1,2,\\cdots)$。若级数 $\\sum\\limits_{n=1}^{\\infty}a_n$ 与 $\\sum\\limits_{n=1}^{\\infty}b_n$ 均收敛，则「$\\sum\\limits_{n=1}^{\\infty}a_n$ 绝对收敛」是「$\\sum\\limits_{n=1}^{\\infty}b_n$ 绝对收敛」的（ ）',
      options: ['充分必要条件', '充分不必要条件', '必要不充分条件', '既不充分也不必要条件'],
      answer: '选 A。由 $a_n<b_n$ 知 $b_n-a_n>0$，而 $\\sum\\limits_{n=1}^{\\infty}(b_n-a_n)=\\sum\\limits_{n=1}^{\\infty}b_n-\\sum\\limits_{n=1}^{\\infty}a_n$ 为两个收敛级数之差，故收敛，且作为正项级数它绝对收敛。于是\n$$\\sum_{n=1}^{\\infty}|b_n|=\\sum_{n=1}^{\\infty}\\left|a_n+(b_n-a_n)\\right|\\le\\sum_{n=1}^{\\infty}|a_n|+\\sum_{n=1}^{\\infty}(b_n-a_n),$$\n即「$\\sum a_n$ 绝对收敛」$\\Rightarrow$「$\\sum b_n$ 绝对收敛」；同理 $\\sum|a_n|\\le\\sum|b_n|+\\sum(b_n-a_n)$ 给出反向蕴含。两向都成立，故为充分必要条件，选 A。',
      traps: '把 $a_n<b_n$ 误当作 $|a_n|<|b_n|$（只有正项级数才可能，此处 $a_n$ 可为负）；或试图举反例否定充分性，但任何反例都会破坏「$\\sum(b_n-a_n)$ 收敛」这一前提。',
      hint: '把两收敛级数之差 $\\sum(b_n-a_n)$ 当成一个收敛的正项级数，再用三角不等式 $|a_n+(b_n-a_n)|\\le|a_n|+(b_n-a_n)$ 双向夹逼。',
      src: { file: '参考文件/真题/数学/6、【1987-2025年】考研数学三真题答案及解析/2023年数学三真题答案解析.pdf', page: 2, no: '一(4)', note: '题面取自 `参考文件/真题/数学/5、【1987-2025年】考研数学三真题/2023年考研数学三真题.pdf` 第 2 页（扫描件，无文本层）；题干与四选项的抽取文本为 `参考文件/_extract/真题__数学__5、【1987-2025年】考研数学三真题__2023年考研数学三真题.txt` 第 40-41 行（题干）与第 43-44 行（四选项）。答案 A 取自 `2023年数学三真题答案解析.pdf` 第 2 页「(4)【答案】 A.」；抽取文本 `参考文件/_extract/真题__数学__6、【1987-2025年】考研数学三真题答案及解析__2023年数学三真题答案解析.txt` 第 32 行与第 42 行「答案选（A）」，裁片 `backup/scratch/bank-fix2/src-img/jx2023_p2_top.png`（我本人用 read_image 读图）。' }
    },
    {
      id: 'm3-2024-5', origin: 'year', year: 2024, no: '一(5)', type: 'eigen', star: 3,school: '全国硕士研究生招生考试-数学三 2024 年', 
      tags: ['la04', 'ln10', 'zt02'],
      stem: '已知 $f(x_1,x_2,x_3)=\\boldsymbol{X}^{\\mathrm{T}}\\boldsymbol{A}\\boldsymbol{X}$ 经正交变换化为 $y_1^{2}-2y_2^{2}+3y_3^{2}$，则二次型对应的矩阵 $\\boldsymbol{A}$ 的行列式和迹分别为（ ）',
      options: ['$-6,\\ -2$', '$6,\\ -2$', '$-6,\\ 2$', '$6,\\ 2$'],
      answer: '选 C。二次型经正交变换化为标准形时，标准形系数就是矩阵 $\\boldsymbol{A}$ 的特征值（正交变换是相似变换，特征值不变），故 $\\boldsymbol{A}$ 的特征值为 $1,\\ -2,\\ 3$。于是\n$$|\\boldsymbol{A}|=1\\cdot(-2)\\cdot3=-6,\\qquad \\operatorname{tr}(\\boldsymbol{A})=1+(-2)+3=2,$$\n选 C。',
      traps: '把标准形的系数直接当成主对角元（误以为 $\\operatorname{tr}\\boldsymbol{A}=1-2+3=2$ 就万事大吉），或用「二次型的正负惯性指数」代替特征值——惯性指数只能定符号个数，不能给出 $|\\boldsymbol{A}|$ 的具体数值所需的特征值。',
      hint: '正交变换不改变特征值：$f$ 的标准形系数即 $\\boldsymbol{A}$ 的特征值；再用 $|\\boldsymbol{A}|=\\prod\\lambda_i$、$\\operatorname{tr}\\boldsymbol{A}=\\sum\\lambda_i$。',
      src: { file: '参考文件/真题/数学/6、【1987-2025年】考研数学三真题答案及解析/2024年数学三真题答案解析.pdf', page: 1, no: '一(5)', note: '题面取自 `参考文件/真题/数学/5、【1987-2025年】考研数学三真题/2024年考研数学三真题.pdf` 第 1 页起（扫描件，无文本层）；题干与四选项的抽取文本为 `参考文件/_extract/真题__数学__5、【1987-2025年】考研数学三真题__2024年考研数学三真题.txt` 第 26-27 行（题干）与第 28-34 行（四选项）。答案 C 取自 `2024年数学三真题答案解析.pdf` 第 1 页「5. 答 应选 C」及其特征值解析；抽取文本 `参考文件/_extract/真题__数学__6、【1987-2025年】考研数学三真题答案及解析__2024年数学三真题答案解析.txt` 第 23 行「5.答应选C」，裁片 `backup/scratch/bank-fix2/src-img/jx2024_p1_bot.png`（我本人用 read_image 读图）。' }
    },
    {
      id: 'm3-2024-6', origin: 'year', year: 2024, no: '一(6)', type: 'linalg', star: 4,school: '全国硕士研究生招生考试-数学三 2024 年', 
      tags: ['kn35', 'la02', 'zb09'],
      stem: '设 $\\boldsymbol{A}$ 为三阶矩阵，$\\boldsymbol{P}=\\begin{pmatrix}1&0&0\\\\0&1&0\\\\1&0&1\\end{pmatrix}$，若 $\\boldsymbol{P}^{\\mathrm{T}}\\boldsymbol{A}\\boldsymbol{P}^{2}=\\begin{pmatrix}a+2c&0&c\\\\0&b&0\\\\2c&0&c\\end{pmatrix}$，则 $\\boldsymbol{A}=$（ ）',
      options: ['$\\begin{pmatrix}c&0&0\\\\0&a&0\\\\0&0&b\\end{pmatrix}$', '$\\begin{pmatrix}b&0&0\\\\0&c&0\\\\0&0&a\\end{pmatrix}$', '$\\begin{pmatrix}a&0&0\\\\0&b&0\\\\0&0&c\\end{pmatrix}$', '$\\begin{pmatrix}c&0&0\\\\0&b&0\\\\0&0&a\\end{pmatrix}$'],
      answer: '选 C。记 $\\boldsymbol{B}=\\boldsymbol{P}^{\\mathrm{T}}\\boldsymbol{A}\\boldsymbol{P}^{2}$。注意 $\\boldsymbol{P}=\\begin{pmatrix}1&0&0\\\\0&1&0\\\\1&0&1\\end{pmatrix}$ 是初等矩阵 $\\boldsymbol{E}_{31}(1)$（第 3 行加第 1 行），故 $\\boldsymbol{P}^{\\mathrm{T}}=\\boldsymbol{E}_{13}(1)$。两边左乘 $(\\boldsymbol{P}^{\\mathrm{T}})^{-1}$、右乘 $(\\boldsymbol{P}^{2})^{-1}$：\n$$\\boldsymbol{A}=(\\boldsymbol{P}^{\\mathrm{T}})^{-1}\\boldsymbol{B}(\\boldsymbol{P}^{2})^{-1},\\qquad (\\boldsymbol{P}^{\\mathrm{T}})^{-1}=\\begin{pmatrix}1&0&-1\\\\0&1&0\\\\0&0&1\\end{pmatrix},\\ \\ \\boldsymbol{P}^{2}=\\begin{pmatrix}1&0&0\\\\0&1&0\\\\2&0&1\\end{pmatrix},\\ (\\boldsymbol{P}^{2})^{-1}=\\begin{pmatrix}1&0&0\\\\0&1&0\\\\-2&0&1\\end{pmatrix}.$$\n先左乘（第 1 行减第 3 行，$c-c=0$）：$$\\begin{pmatrix}1&0&-1\\\\0&1&0\\\\0&0&1\\end{pmatrix}\\begin{pmatrix}a+2c&0&c\\\\0&b&0\\\\2c&0&c\\end{pmatrix}=\\begin{pmatrix}a&0&0\\\\0&b&0\\\\2c&0&c\\end{pmatrix};$$\n再右乘（第 1 列减 2 倍第 3 列，$2c-2c=0$）：$$\\boldsymbol{A}=\\begin{pmatrix}a&0&0\\\\0&b&0\\\\0&0&c\\end{pmatrix}=\\operatorname{diag}(a,b,c),$$ 选 C。',
      traps: '把 $\\boldsymbol{P}^{2}$ 当成 $\\boldsymbol{P}$（两者不相等，$\\boldsymbol{P}^{2}=\\begin{pmatrix}1&0&0\\\\0&1&0\\\\2&0&1\\end{pmatrix}$），或把 $\\boldsymbol{P}^{\\mathrm{T}}$ 与 $\\boldsymbol{P}^{-1}$ 混淆；也容易忽略「左乘 $\\boldsymbol{P}$ 是行变换、右乘 $\\boldsymbol{P}$ 是列变换」而直接得出 $\\boldsymbol{A}=\\boldsymbol{B}$。',
      hint: '认出 $\\boldsymbol{P}$ 是初等矩阵 $\\boldsymbol{E}_{31}(1)$，写 $\\boldsymbol{A}=(\\boldsymbol{P}^{\\mathrm{T}})^{-1}\\boldsymbol{B}(\\boldsymbol{P}^{2})^{-1}$，用「左乘＝行变换、右乘＝列变换」把 $c$ 消掉。',
      src: { file: '参考文件/真题/数学/6、【1987-2025年】考研数学三真题答案及解析/2024年数学三真题答案解析.pdf', page: 1, no: '一(6)', note: '题面取自 `参考文件/真题/数学/5、【1987-2025年】考研数学三真题/2024年考研数学三真题.pdf` 第 2 页（扫描件，无文本层）；该题含分块矩阵，抽取文本 `参考文件/_extract/真题__数学__5、【1987-2025年】考研数学三真题__2024年考研数学三真题.txt` 第 35-47 行为矩阵符号碎裂（不足以还原题干），题干文字以该册第 2 页扫描页为单源（无第二文本通道）。答案 C 取自 `2024年数学三真题答案解析.pdf` 第 1 页「6. 答 应选 C」及该页解答；抽取文本 `参考文件/_extract/真题__数学__6、【1987-2025年】考研数学三真题答案及解析__2024年数学三真题答案解析.txt` 第 26 行「6.答应选C」，裁片 `backup/scratch/bank-fix2/src-img/jx2024_p1_bot.png`（我本人用 read_image 读图）。' }
    },
    {
      id: 'm3-2024-7', origin: 'year', year: 2024, no: '一(7)', type: 'linalg', star: 5,school: '全国硕士研究生招生考试-数学三 2024 年', 
      tags: ['ln03', 'la08', 'la02'],
      stem: '设 $\\boldsymbol{A}=\\begin{pmatrix}a+1&b&3\\\\a&\\dfrac{b}{2}&1\\\\1&1&2\\end{pmatrix}$，$M_{ij}$ 为 $a_{ij}$ 的余子式，若 $|\\boldsymbol{A}|=-\\dfrac{1}{2}$ 且 $-M_{21}+M_{22}-M_{23}=0$，则（ ）',
      options: ['$a=1$ 或 $a=-\\dfrac{3}{2}$', '$a=0$ 或 $a=\\dfrac{3}{2}$', '$b=1$ 或 $b=-\\dfrac{1}{2}$', '$b=-1$ 或 $a=\\dfrac{1}{2}$'],
      answer: '选 B。先翻译余子式条件：$A_{ij}=(-1)^{i+j}M_{ij}$，故 $-M_{21}+M_{22}-M_{23}=A_{21}+A_{22}+A_{23}=0$。而「某行代数余子式之和」等于把该行换成全 1 后所得行列式，于是\n$$A_{21}+A_{22}+A_{23}=\\begin{vmatrix}a+1&b&3\\\\1&1&1\\\\1&1&2\\end{vmatrix}=(a+1)(2-1)-b(2-1)+3(1-1)=a+1-b=0,$$\n得 $b=a+1$。\n再由 $|\\boldsymbol{A}|=-\\dfrac{1}{2}$ 按第 1 行展开：\n$$|\\boldsymbol{A}|=(a+1)\\left(\\frac{b}{2}\\cdot2-1\\right)-b(2a-1)+3\\left(a-\\frac{b}{2}\\right)=\\left(a+1\\right)\\left(b-1\\right)-2ab+b+3a-\\frac{3}{2}b=-ab+2a+\\frac{1}{2}b-1,$$\n由 $|\\boldsymbol{A}|=-\\dfrac{1}{2}$ 得 $-ab+2a+\\dfrac{1}{2}b=\\dfrac{1}{2}$，即\n$$b(1-2a)=1-4a.$$\n代入 $b=a+1$：$(a+1)(1-2a)=1-4a\\Rightarrow -2a^{2}+3a=0\\Rightarrow a=0$ 或 $a=\\dfrac{3}{2}$（对应 $b=1$ 或 $b=\\dfrac{5}{2}$），与选项 B 一致，故选 B。',
      traps: '符号陷阱：$M_{21}$ 与 $M_{23}$ 前的负号把条件变成 $A_{21}+A_{22}+A_{23}=0$，漏符号会得到 $a-b-1=0$ 一类错误等式。选项 (C)(D) 只用 $b$ 表述，$b=1$ 虽真实出现，但 $b=-\\dfrac{1}{2}$ 是代回 $b=a+1$ 得到的 $a=-\\dfrac{3}{2}$ 才配对的值，不满足方程。',
      hint: '先把余子式方程用「代数余子式之和＝把该行换 1」写成一个三阶行列式，解出 $b=a+1$；再把它代入按行展开得到的 $|\\boldsymbol{A}|$ 表达式解一元二次方程。',
      src: { file: '参考文件/真题/数学/6、【1987-2025年】考研数学三真题答案及解析/2024年数学三真题答案解析.pdf', page: 2, no: '一(7)', note: '题面取自 `参考文件/真题/数学/5、【1987-2025年】考研数学三真题/2024年考研数学三真题.pdf` 第 2 页（扫描件，无文本层）；题干与四选项的抽取文本为 `参考文件/_extract/真题__数学__5、【1987-2025年】考研数学三真题__2024年考研数学三真题.txt` 第 49-51 行（题干）与第 52-55 行（四选项）。答案 B 取自 `2024年数学三真题答案解析.pdf` 第 2 页「7. 答 应选 B」；抽取文本 `参考文件/_extract/真题__数学__6、【1987-2025年】考研数学三真题答案及解析__2024年数学三真题答案解析.txt` 第 36 行「7.答应选B」，裁片 `backup/scratch/bank-fix2/src-img/jx2024_p2_top.png`（我本人用 read_image 读图）。' }
    },
    {
      id: 'm3-2025-1', origin: 'year', year: 2025, no: '一(1)', type: 'evalAns', star: 2,school: '全国硕士研究生招生考试-数学三 2025 年', 
      tags: ['inf08', 'inf12', 'inf06', 'zb13'],
      stem: '当 $x\\to0^{+}$ 时，下列无穷小量中，与 $x$ 等价的是（ ）',
      options: ['$\\mathrm{e}^{-\\sin x}-1$', '$\\sqrt{x+1}-\\cos x$', '$1-\\cos\\sqrt{2x}$', '$1-\\dfrac{\\ln(1+x)}{x}$'],
      answer: '选 C。逐项求与 $x$ 的比值（等价即极限为 1）：\n- (A) $\\mathrm{e}^{-\\sin x}-1\\sim-\\sin x\\sim-x$，比值为 $-1$；\n- (B) $\\sqrt{x+1}-\\cos x=\\left(\\sqrt{x+1}-1\\right)+\\left(1-\\cos x\\right)\\sim\\dfrac{x}{2}+\\dfrac{x^{2}}{2}$，比值为 $\\dfrac{1}{2}$；\n- (C) $1-\\cos\\sqrt{2x}\\sim\\dfrac{1}{2}\\left(\\sqrt{2x}\\right)^{2}=\\dfrac{1}{2}\\cdot2x=x$，比值为 $1$ ✓；\n- (D) $1-\\dfrac{\\ln(1+x)}{x}=\\dfrac{x-\\ln(1+x)}{x}\\sim\\dfrac{x^{2}/2}{x}=\\dfrac{x}{2}$，比值为 $\\dfrac{1}{2}$。\n故只有 (C) 与 $x$ 等价，选 C。',
      traps: '把「同阶」当成「等价」：(A) 与 $x$ 同阶但相差符号（比值 $-1$），(B)(D) 的比值都是 $\\dfrac{1}{2}$，只有 (C) 的比值为 1。(D) 还容易只看 $\\dfrac{\\ln(1+x)}{x}\\to1$ 就误判为一阶。',
      hint: '把每一项除以 $x$ 求极限；(B)(D) 先凑出 $\\sqrt{x+1}-1$、$x-\\ln(1+x)$ 的标准等价无穷小（$\\dfrac{x}{2}$、$\\dfrac{x^{2}}{2}$）。',
      src: { file: '参考文件/真题/数学/6、【1987-2025年】考研数学三真题答案及解析/2025年数学三真题参考解析.pdf', page: 1, no: '一(1)', note: '题面取自 `参考文件/真题/数学/5、【1987-2025年】考研数学三真题/2025年考研数学三真题.pdf` 第 2 页（扫描件，无文本层）；题干与四选项的抽取文本为 `参考文件/_extract/真题__数学__5、【1987-2025年】考研数学三真题__2025年考研数学三真题.txt` 第 10-12 行（题干与 (A)(B)(C)(D)）。答案 C 取自 `2025年数学三真题参考解析.pdf` 第 1 页与抽取文本 `参考文件/_extract/真题__数学__6、【1987-2025年】考研数学三真题答案及解析__2025年数学三真题参考解析.txt` 第 8 行「【答案】（C）」；同一答案另见该真题册第 6 页答案页「(1)【答案】（C）」（抽取文本 `参考文件/_extract/真题__数学__5、【1987-2025年】考研数学三真题__2025年考研数学三真题.txt` 第 101 行），裁片 `backup/scratch/bank-fix2/src-img/zt2025_p6_ans_top.png`（我本人用 read_image 读图）。' }
    },
    {
      id: 'm3-2025-2', origin: 'year', year: 2025, no: '一(2)', type: 'integral', star: 3,school: '全国硕士研究生招生考试-数学三 2025 年', 
      tags: ['int33', 'ms02', 'int25'],
      stem: '已知函数 $f(x)=\\displaystyle\\int_{0}^{x}\\mathrm{e}^{t^{2}}\\sin t\\,\\mathrm{d}t$，$g(x)=\\displaystyle\\int_{0}^{x}\\mathrm{e}^{t^{2}}\\mathrm{d}t\\cdot\\sin^{2}x$，则（ ）',
      options: ['$x=0$ 是 $f(x)$ 的极值点，也是 $g(x)$ 的极值点', '$x=0$ 是 $f(x)$ 的极值点，$(0,0)$ 是曲线 $y=g(x)$ 的拐点', '$x=0$ 是 $f(x)$ 的极值点，$(0,0)$ 是 $f(x)$ 的拐点', '$(0,0)$ 是 $f(x)$ 的拐点，也是 $g(x)$ 的拐点'],
      answer: '选 B。分别看两个函数在 $x=0$ 附近的性态：\n- $f\'(x)=\\mathrm{e}^{x^{2}}\\sin x$：$x<0$ 时 $f\'<0$、$x>0$ 时 $f\'>0$，导数在 $x=0$ 两侧变号，故 $x=0$ 是 $f(x)$ 的极小值点（$f$ 不是拐点）；\n- 把 $g$ 定阶：$\\displaystyle\\int_{0}^{x}\\mathrm{e}^{t^{2}}\\mathrm{d}t=x+\\dfrac{x^{3}}{3}+O(x^{5})$，$\\sin^{2}x=x^{2}+O(x^{4})$，故 $g(x)=x^{3}+O(x^{5})$。于是 $g\'\'(x)=6x+O(x^{3})$ 在 $x=0$ 两侧变号，$(0,0)$ 是曲线 $y=g(x)$ 的拐点 ✓；而 $g\'(x)=3x^{2}+O(x^{4})\\ge0$ 在 0 两侧不变号，$x=0$ 不是 $g$ 的极值点。\n故选 B。',
      traps: '两个函数要分开判断：$f$ 用一阶导变号（极值点），$g$ 必须定阶后用二阶导变号（拐点）。若误把 $g$ 的一阶导在 0 处的零值当成极值信号，会选 A；若忘了 $f$ 在 0 处确实变号，会选 D。',
      hint: '先写 $f\'=\\mathrm{e}^{x^{2}}\\sin x$ 判断极值；再把 $g$ 展开到 $x^{3}$ 量级（$\\int_0^x\\mathrm{e}^{t^2}\\mathrm{d}t\\approx x$、$\\sin^2x\\approx x^2$），用 $g\'\'$ 的符号变化判断拐点。',
      src: { file: '参考文件/真题/数学/6、【1987-2025年】考研数学三真题答案及解析/2025年数学三真题参考解析.pdf', page: 1, no: '一(2)', note: '题面取自 `参考文件/真题/数学/5、【1987-2025年】考研数学三真题/2025年考研数学三真题.pdf` 第 2 页（扫描件，无文本层）；题干与四选项的抽取文本为 `参考文件/_extract/真题__数学__5、【1987-2025年】考研数学三真题__2025年考研数学三真题.txt` 第 13 行（题干）与第 14-17 行（四选项）。答案 B 取自 `2025年数学三真题参考解析.pdf` 第 1 页与抽取文本 `参考文件/_extract/真题__数学__6、【1987-2025年】考研数学三真题答案及解析__2025年数学三真题参考解析.txt` 第 22 行「【答案】（B）」；同一答案另见该真题册第 6 页答案页「(2)【答案】(B) x=0 是 f(x) 的极值点，(0,0) 是曲线 y=g(x) 的拐点」（抽取文本 `参考文件/_extract/真题__数学__5、【1987-2025年】考研数学三真题__2025年考研数学三真题.txt` 第 102 行），裁片 `backup/scratch/bank-fix2/src-img/zt2025_p6_ans_top.png`（我本人用 read_image 读图）。' }
    },
    {
      id: 'm3-2025-3', origin: 'year', year: 2025, no: '一(3)', type: 'series', star: 4,school: '全国硕士研究生招生考试-数学三 2025 年', 
      tags: ['ser18', 'ser05', 'ser04', 'ser02'],
      stem: '已知 $k$ 为常数，则级数 $\\sum\\limits_{n=1}^{\\infty}(-1)^{n}\\left[\\dfrac{1}{n}-\\ln\\left(1+\\dfrac{k}{n^{2}}\\right)\\right]$（ ）',
      options: ['绝对收敛', '条件收敛', '发散', '敛散性与 $k$ 的取值相关'],
      answer: '选 B。记 $a_n=\\dfrac{1}{n}-\\ln\\left(1+\\dfrac{k}{n^{2}}\\right)$，对固定的常数 $k$ 作展开：\n$$\\ln\\left(1+\\dfrac{k}{n^{2}}\\right)=\\dfrac{k}{n^{2}}-\\dfrac{k^{2}}{2n^{4}}+O\\left(\\dfrac{1}{n^{6}}\\right),\\qquad a_n=\\dfrac{1}{n}-\\dfrac{k}{n^{2}}+O\\left(\\dfrac{1}{n^{4}}\\right)\\sim\\dfrac{1}{n}\\ (n\\to\\infty),$$\n故 $n$ 充分大时 $a_n>0$、$a_n\\to0$ 且单调递减。于是\n- 由莱布尼茨判别法，交错级数 $\\sum\\limits_{n=1}^{\\infty}(-1)^{n}a_n$ 收敛；\n- 但 $\\sum\\limits_{n=1}^{\\infty}|a_n|=\\sum\\limits_{n=1}^{\\infty}a_n$ 与调和级数同阶（$a_n\\sim\\dfrac1n$）而发散。\n故原级数条件收敛，选 B。（$k$ 为任意常数时结论不变：$k$ 只改变通项中 $1/n^{2}$ 阶的项，不改变 $a_n\\sim1/n$ 的主阶，故不选 D。）',
      traps: '把 $\\ln\\left(1+\\dfrac{k}{n^{2}}\\right)$ 只当成 $\\dfrac{k}{n^{2}}$，误以为通项是 $\\dfrac1n$ 减去一个二阶小量就可以绝对收敛而选 A；只看括号内两项相减就以为通项趋于 0 更快、忽略主阶仍是 $\\dfrac1n$；或误以为敛散性依赖 $k$ 而选 D —— $k$ 只影响 $1/n^{2}$ 阶项，不影响 $a_n\\sim1/n$ 的定阶结论。',
      hint: '先用泰勒展开给 $\\ln\\left(1+\\dfrac{k}{n^{2}}\\right)$ 定阶，得到 $a_n\\sim\\dfrac1n$ 且 $a_n>0$；再用莱布尼茨判别法判收敛、用 $\\sum a_n$ 与调和级数比较判「不绝对收敛」，两步合起来就是条件收敛。',
      src: { file: '参考文件/真题/数学/5、【1987-2025年】考研数学三真题/2025年考研数学三真题.pdf', page: 2, no: '一(3)', note: '题面取自本册（`参考文件/真题/数学/5、【1987-2025年】考研数学三真题/2025年考研数学三真题.pdf`）第 2 页（扫描件，无文本层）；题面四选项的抽取文本为 `参考文件/_extract/真题__数学__5、【1987-2025年】考研数学三真题__2025年考研数学三真题.txt` 第 18-20 行，裁片 `backup/scratch/bank-fix2/src-img/zt2025_p2_q3.png`（我本人用 read_image 读图，逐字为 (A) 绝对收敛 (B) 条件收敛 (C) 发散 (D) 敛散性与 k 的取值相关）。答案 B 见同册第 6 页答案页「(3)【答案】(B)条件收敛」（抽取文本同前文件第 103 行；裁片 `backup/scratch/bank-fix2/src-img/zt2025_p6_ans_top.png`，我本人用 read_image 读图），并与 `2025年数学三真题参考解析.pdf`（抽取文本 `参考文件/_extract/真题__数学__6、【1987-2025年】考研数学三真题答案及解析__2025年数学三真题参考解析.txt` 第 36、38、42 行）一致；第三源为存档网络答案图 `backup/scratch/bank-vision/web/xdf2025_2.png`（题面 (C)(D) 与「[答案] B」，我本人用 read_image 读图）。抽取文本探针记录见 `backup/scratch/bank-fix2/probe_src_t30.log`。' }
    },
    {
      id: "m3-2023-5", origin: "year", year: 2023, no: "一(5)", type: "linalg", star: 3, school: "全国硕士研究生招生考试-数学三 2023 年",
      tags: ["zb26","zb19","la11"],
      stem: "设 $\\boldsymbol{A},\\boldsymbol{B}$ 为 $n$ 阶可逆矩阵，$\\boldsymbol{E}$ 为 $n$ 阶单位矩阵，$\\boldsymbol{M}^{*}$ 为矩阵 $\\boldsymbol{M}$ 的伴随矩阵，则 $\\begin{bmatrix}\\boldsymbol{A}&\\boldsymbol{E}\\\\ \\boldsymbol{O}&\\boldsymbol{B}\\end{bmatrix}^{*}=$（ ）",
      options: ["$\\begin{bmatrix}|\\boldsymbol{A}|\\boldsymbol{B}^{*}&-\\boldsymbol{B}^{*}\\boldsymbol{A}^{*}\\\\ \\boldsymbol{O}&|\\boldsymbol{B}|\\boldsymbol{A}^{*}\\end{bmatrix}$","$\\begin{bmatrix}|\\boldsymbol{B}|\\boldsymbol{A}^{*}&-\\boldsymbol{A}^{*}\\boldsymbol{B}^{*}\\\\ \\boldsymbol{O}&|\\boldsymbol{A}|\\boldsymbol{B}^{*}\\end{bmatrix}$","$\\begin{bmatrix}|\\boldsymbol{B}|\\boldsymbol{A}^{*}&-\\boldsymbol{B}^{*}\\boldsymbol{A}^{*}\\\\ \\boldsymbol{O}&|\\boldsymbol{A}|\\boldsymbol{B}^{*}\\end{bmatrix}$","$\\begin{bmatrix}|\\boldsymbol{A}|\\boldsymbol{B}^{*}&-\\boldsymbol{A}^{*}\\boldsymbol{B}^{*}\\\\ \\boldsymbol{O}&|\\boldsymbol{B}|\\boldsymbol{A}^{*}\\end{bmatrix}$"],
      answer: "选 B。记 $\\boldsymbol{M}=\\begin{bmatrix}\\boldsymbol{A}&\\boldsymbol{E}\\\\ \\boldsymbol{O}&\\boldsymbol{B}\\end{bmatrix}$，则 $|\\boldsymbol{M}|=|\\boldsymbol{A}||\\boldsymbol{B}|\\ne0$，且由分块上三角矩阵求逆\n$$\\boldsymbol{M}^{-1}=\\begin{bmatrix}\\boldsymbol{A}^{-1}&-\\boldsymbol{A}^{-1}\\boldsymbol{B}^{-1}\\\\ \\boldsymbol{O}&\\boldsymbol{B}^{-1}\\end{bmatrix},$$\n于是\n$$\\boldsymbol{M}^{*}=|\\boldsymbol{M}|\\boldsymbol{M}^{-1}=\\begin{bmatrix}|\\boldsymbol{A}||\\boldsymbol{B}|\\boldsymbol{A}^{-1}&-|\\boldsymbol{A}||\\boldsymbol{B}|\\boldsymbol{A}^{-1}\\boldsymbol{B}^{-1}\\\\ \\boldsymbol{O}&|\\boldsymbol{A}||\\boldsymbol{B}|\\boldsymbol{B}^{-1}\\end{bmatrix}=\\begin{bmatrix}|\\boldsymbol{B}|\\boldsymbol{A}^{*}&-\\boldsymbol{A}^{*}\\boldsymbol{B}^{*}\\\\ \\boldsymbol{O}&|\\boldsymbol{A}|\\boldsymbol{B}^{*}\\end{bmatrix},$$\n其中用到 $|\\boldsymbol{A}|\\boldsymbol{A}^{-1}=\\boldsymbol{A}^{*}$、$|\\boldsymbol{B}|\\boldsymbol{B}^{-1}=\\boldsymbol{B}^{*}$ 及\n$$|\\boldsymbol{A}||\\boldsymbol{B}|\\boldsymbol{A}^{-1}\\boldsymbol{B}^{-1}=\\left(|\\boldsymbol{A}|\\boldsymbol{A}^{-1}\\right)\\left(|\\boldsymbol{B}|\\boldsymbol{B}^{-1}\\right)=\\boldsymbol{A}^{*}\\boldsymbol{B}^{*}.$$\n故选 B。",
      traps: "两个易错点：一是左上块应为 $|\\boldsymbol{B}|\\boldsymbol{A}^{*}$（用 $|\\boldsymbol{A}||\\boldsymbol{B}|\\boldsymbol{A}^{-1}$ 化成 $|\\boldsymbol{B}|\\cdot|\\boldsymbol{A}|\\boldsymbol{A}^{-1}$），选项 (A) 把它写成 $|\\boldsymbol{A}|\\boldsymbol{B}^{*}$，对角两块整体互换了；二是右上块 $-\\boldsymbol{A}^{*}\\boldsymbol{B}^{*}$ 与 $-\\boldsymbol{B}^{*}\\boldsymbol{A}^{*}$ 的次序不能交换。",
      hint: "先求 $|\\boldsymbol{M}|$ 与 $\\boldsymbol{M}^{-1}$（分块上三角的逆仍是分块上三角），再用 $\\boldsymbol{M}^{*}=|\\boldsymbol{M}|\\boldsymbol{M}^{-1}$ 一次乘进去。",
      src: { file: "参考文件/真题/数学/5、【1987-2025年】考研数学三真题/2023年考研数学三真题.pdf", page: 2, no: "一(5)", note: "题面取自 m3-2023-p2.png 亲读；答案与 2023 答案 PDF p2 对拍（册上选 B），并独立重推校验。" }
    },
    {
      id: "m3-2023-6", origin: "year", year: 2023, no: "一(6)", type: "eigen", star: 3, school: "全国硕士研究生招生考试-数学三 2023 年",
      tags: ["ms03","kn68"],
      stem: "二次型 $f(x_1,x_2,x_3)=(x_1+x_2)^{2}+(x_1+x_3)^{2}-4(x_2-x_3)^{2}$ 的规范形为（ ）",
      options: ["$y_1^{2}+y_2^{2}$","$y_1^{2}-y_2^{2}$","$y_1^{2}+y_2^{2}-4y_3^{2}$","$y_1^{2}+y_2^{2}-y_3^{2}$"],
      answer: "选 B。展开得\n$$f=2x_1^{2}-3x_2^{2}-3x_3^{2}+2x_1x_2+2x_1x_3+8x_2x_3,$$\n二次型矩阵\n$$\\boldsymbol{A}=\\begin{bmatrix}2&1&1\\\\ 1&-3&4\\\\ 1&4&-3\\end{bmatrix},\\qquad |\\lambda\\boldsymbol{E}-\\boldsymbol{A}|=\\lambda(\\lambda+7)(\\lambda-3).$$\n特征值为 $3,\\,-7,\\,0$，故正惯性指数 $p=1$、负惯性指数 $q=1$、秩为 2，规范形为 $y_1^{2}-y_2^{2}$，选 B。",
      traps: "「规范形」与「标准形」不是一回事：标准形的系数是任意正数（如 (C) 中配方法得到的 $y_1^{2}+y_2^{2}-4y_3^{2}$ 就是一个标准形），规范形只保留 $1,-1,0$，由惯性指数唯一确定。本题有一个零特征值，所以只出现两个平方项。",
      hint: "写出二次型矩阵，用 $|\\lambda\\boldsymbol{E}-\\boldsymbol{A}|=0$ 求特征值，数一数正、负、零的个数即得规范形。",
      src: { file: "参考文件/真题/数学/5、【1987-2025年】考研数学三真题/2023年考研数学三真题.pdf", page: 2, no: "一(6)", note: "题面取自 m3-2023-p2.png 亲读；答案与 2023 答案 PDF p3 对拍（册上选 B），并独立算特征值 $3,-7,0$ 校验。" }
    },
    {
      id: "m3-2023-7", origin: "year", year: 2023, no: "一(7)", type: "linalg", star: 3, school: "全国硕士研究生招生考试-数学三 2023 年",
      tags: ["zb07","ln08"],
      stem: "已知向量 $\\boldsymbol{\\alpha}_1=\\begin{pmatrix}1\\\\2\\\\3\\end{pmatrix}$，$\\boldsymbol{\\alpha}_2=\\begin{pmatrix}2\\\\1\\\\1\\end{pmatrix}$，$\\boldsymbol{\\beta}_1=\\begin{pmatrix}2\\\\5\\\\9\\end{pmatrix}$，$\\boldsymbol{\\beta}_2=\\begin{pmatrix}1\\\\0\\\\1\\end{pmatrix}$。若 $\\boldsymbol{\\gamma}$ 既可由 $\\boldsymbol{\\alpha}_1,\\boldsymbol{\\alpha}_2$ 线性表示，也可由 $\\boldsymbol{\\beta}_1,\\boldsymbol{\\beta}_2$ 线性表示，则 $\\boldsymbol{\\gamma}=$（ ）",
      options: ["$k\\begin{pmatrix}3\\\\3\\\\4\\end{pmatrix},\\ k\\in\\mathbb{R}$","$k\\begin{pmatrix}3\\\\5\\\\10\\end{pmatrix},\\ k\\in\\mathbb{R}$","$k\\begin{pmatrix}-1\\\\1\\\\2\\end{pmatrix},\\ k\\in\\mathbb{R}$","$k\\begin{pmatrix}1\\\\5\\\\8\\end{pmatrix},\\ k\\in\\mathbb{R}$"],
      answer: "选 D。设 $\\boldsymbol{\\gamma}=x_1\\boldsymbol{\\alpha}_1+x_2\\boldsymbol{\\alpha}_2=x_3\\boldsymbol{\\beta}_1+x_4\\boldsymbol{\\beta}_2$，即\n$$x_1\\boldsymbol{\\alpha}_1+x_2\\boldsymbol{\\alpha}_2-x_3\\boldsymbol{\\beta}_1-x_4\\boldsymbol{\\beta}_2=\\boldsymbol{0}.$$\n对 $(\\boldsymbol{\\alpha}_1,\\boldsymbol{\\alpha}_2,-\\boldsymbol{\\beta}_1,-\\boldsymbol{\\beta}_2)$ 作初等行变换得通解 $(x_1,x_2,x_3,x_4)=k(-3,1,-1,1)$，于是\n$$\\boldsymbol{\\gamma}=-3k\\boldsymbol{\\alpha}_1+k\\boldsymbol{\\alpha}_2=k\\left(-3\\begin{pmatrix}1\\\\2\\\\3\\end{pmatrix}+\\begin{pmatrix}2\\\\1\\\\1\\end{pmatrix}\\right)=k\\begin{pmatrix}-1\\\\-5\\\\-8\\end{pmatrix},$$\n即 $\\boldsymbol{\\gamma}=k\\begin{pmatrix}1\\\\5\\\\8\\end{pmatrix}$（$k$ 为任意常数，符号并入 $k$），选 D。校验：$(1,5,8)^{\\mathrm{T}}=\\boldsymbol{\\beta}_1-\\boldsymbol{\\beta}_2$，也确实在 $\\boldsymbol{\\beta}$ 组的张成空间内。",
      traps: "只用一个向量组就作答：只用 $\\boldsymbol{\\alpha}_1,\\boldsymbol{\\alpha}_2$ 表示会落到 (A) 的方向，只用 $\\boldsymbol{\\beta}_1,\\boldsymbol{\\beta}_2$ 会落到 (B)/(C) 附近。题干要求「两种表示都能」，必须解联立方程组取两个生成子空间的交。另外 $(1,5,8)$ 与 $(-1,-5,-8)$ 只差一个负号，不要因为符号不同就排除 (D)。",
      hint: "把 $\\boldsymbol{\\gamma}=x_1\\boldsymbol{\\alpha}_1+x_2\\boldsymbol{\\alpha}_2=x_3\\boldsymbol{\\beta}_1+x_4\\boldsymbol{\\beta}_2$ 移项成齐次方程组，求通解后代回任一组即可。",
      src: { file: "参考文件/真题/数学/5、【1987-2025年】考研数学三真题/2023年考研数学三真题.pdf", page: 3, no: "一(7)", note: "题面取自 m3-2023-p3.png 亲读；答案与 2023 答案 PDF p4 对拍（册上选 D），并独立重推校验。" }
    },
    {
      id: "m3-2023-8", origin: "year", year: 2023, no: "一(8)", type: "estimate", star: 3, school: "全国硕士研究生招生考试-数学三 2023 年",
      tags: ["zt04"],
      stem: "设随机变量 $X$ 服从参数为 1 的泊松分布，则 $E(|X-EX|)=$（ ）",
      options: ["$\\dfrac{1}{\\mathrm{e}}$","$\\dfrac{1}{2}$","$\\dfrac{2}{\\mathrm{e}}$","$1$"],
      answer: "选 C。$X\\sim P(1)$，$P\\{X=k\\}=\\dfrac{\\mathrm{e}^{-1}}{k!}$（$k=0,1,2,\\cdots$），$EX=1$。故\n$$E|X-1|=\\sum_{k=0}^{\\infty}|k-1|\\frac{\\mathrm{e}^{-1}}{k!}=\\mathrm{e}^{-1}\\left[1+\\sum_{k=2}^{\\infty}\\frac{k-1}{k!}\\right].$$\n其中\n$$\\sum_{k=2}^{\\infty}\\frac{k-1}{k!}=\\sum_{k=2}^{\\infty}\\left(\\frac{1}{(k-1)!}-\\frac{1}{k!}\\right)=(\\mathrm{e}-1)-(\\mathrm{e}-2)=1,$$\n所以 $E|X-1|=\\mathrm{e}^{-1}(1+1)=\\dfrac{2}{\\mathrm{e}}$，选 C。",
      traps: "$E|X-EX|\\ne|EX-EX|=0$，也不是 $DX=1$；$k=0$ 那一项的 $|k-1|=1$ 不能漏，$k=1$ 项为零可略去。$\\sum\\limits_{k\\ge2}\\dfrac{k-1}{k!}$ 要用裂项 $\\dfrac{k-1}{k!}=\\dfrac{1}{(k-1)!}-\\dfrac{1}{k!}$。",
      hint: "按定义把 $|k-1|$ 拆成 $k=0$ 与 $k\\ge2$ 两段，后者用裂项求和 $\\sum\\frac{1}{k!}=\\mathrm{e}-1$。",
      src: { file: "参考文件/真题/数学/5、【1987-2025年】考研数学三真题/2023年考研数学三真题.pdf", page: 3, no: "一(8)", note: "题面取自 m3-2023-p3.png 亲读；答案与 2023 答案 PDF p4 对拍（册上选 C），并独立重推校验。" }
    },
    {
      id: "m3-2023-9", origin: "year", year: 2023, no: "一(9)", type: "estimate", star: 3, school: "全国硕士研究生招生考试-数学三 2023 年",
      tags: ["zt04"],
      stem: "设 $X_1,X_2,\\cdots,X_n$ 为来自总体 $N(\\mu_1,\\sigma^{2})$ 的简单随机样本，$Y_1,Y_2,\\cdots,Y_m$ 为来自总体 $N(\\mu_2,2\\sigma^{2})$ 的简单随机样本，且两样本相互独立。记 $\\bar X=\\dfrac{1}{n}\\sum\\limits_{i=1}^{n}X_i$，$\\bar Y=\\dfrac{1}{m}\\sum\\limits_{i=1}^{m}Y_i$，$S_1^{2}=\\dfrac{1}{n-1}\\sum\\limits_{i=1}^{n}(X_i-\\bar X)^{2}$，$S_2^{2}=\\dfrac{1}{m-1}\\sum\\limits_{i=1}^{m}(Y_i-\\bar Y)^{2}$，则（ ）",
      options: ["$\\dfrac{S_1^{2}}{S_2^{2}}\\sim F(n,m)$","$\\dfrac{S_1^{2}}{S_2^{2}}\\sim F(n-1,m-1)$","$\\dfrac{2S_1^{2}}{S_2^{2}}\\sim F(n,m)$","$\\dfrac{2S_1^{2}}{S_2^{2}}\\sim F(n-1,m-1)$"],
      answer: "选 D。由正态总体样本方差的性质\n$$\\frac{(n-1)S_1^{2}}{\\sigma^{2}}\\sim\\chi^{2}(n-1),\\qquad \\frac{(m-1)S_2^{2}}{2\\sigma^{2}}\\sim\\chi^{2}(m-1),$$\n且两者独立，于是\n$$\\frac{S_1^{2}}{\\sigma^{2}}\\sim\\frac{\\chi^{2}(n-1)}{n-1},\\qquad \\frac{S_2^{2}}{2\\sigma^{2}}\\sim\\frac{\\chi^{2}(m-1)}{m-1},$$\n两式相除消去 $\\sigma^{2}$ 得\n$$\\frac{2S_1^{2}}{S_2^{2}}=\\frac{S_1^{2}/\\sigma^{2}}{S_2^{2}/(2\\sigma^{2})}\\sim F(n-1,m-1).$$\n故选 D。",
      traps: "最常见的错是直接写 $\\dfrac{S_1^{2}}{S_2^{2}}\\sim F(n-1,m-1)$：第二个总体的方差是 $2\\sigma^{2}$ 而不是 $\\sigma^{2}$，两个 $\\chi^{2}$ 统计量里的常数因子 2 必须补上。自由度也不是 $n,m$，样本方差除以 $n-1$、$m-1$ 后自由度各减 1。",
      hint: "先把两个样本方差各自标准化成 $\\chi^{2}$ 除以自由度，再相除，$\\sigma^{2}$ 会自动消去；注意 $Y$ 的方差是 $2\\sigma^{2}$。",
      src: { file: "参考文件/真题/数学/5、【1987-2025年】考研数学三真题/2023年考研数学三真题.pdf", page: 3, no: "一(9)", note: "题面取自 m3-2023-p3.png 亲读；答案与 2023 答案 PDF p5 对拍（册上选 D），并独立重推校验。" }
    },
    {
      id: "m3-2023-10", origin: "year", year: 2023, no: "一(10)", type: "estimate", star: 3, school: "全国硕士研究生招生考试-数学三 2023 年",
      tags: ["zt04"],
      stem: "设 $X_1,X_2$ 为来自总体 $N(\\mu,\\sigma^{2})$ 的简单随机样本，其中 $\\sigma\\ (\\sigma>0)$ 是未知参数。记 $\\hat\\sigma=a|X_1-X_2|$，若 $E(\\hat\\sigma)=\\sigma$，则 $a=$（ ）",
      options: ["$\\dfrac{\\sqrt{\\pi}}{2}$","$\\dfrac{\\sqrt{2\\pi}}{2}$","$\\sqrt{\\pi}$","$\\sqrt{2\\pi}$"],
      answer: "选 A。$X_1-X_2\\sim N(0,2\\sigma^{2})$，记 $Y=X_1-X_2$，其密度为 $\\dfrac{1}{2\\sqrt{\\pi}\\sigma}\\mathrm{e}^{-\\frac{y^{2}}{4\\sigma^{2}}}$（即 $\\tau=\\sqrt2\\sigma$ 的正态），故\n$$E|Y|=2\\int_{0}^{+\\infty}\\frac{y}{2\\sqrt{\\pi}\\sigma}\\mathrm{e}^{-\\frac{y^{2}}{4\\sigma^{2}}}\\mathrm{d}y=\\frac{1}{\\sqrt{\\pi}\\sigma}\\cdot 2\\sigma^{2}=\\frac{2\\sigma}{\\sqrt{\\pi}}.$$\n（一般地 $Y\\sim N(0,\\tau^{2})$ 时 $E|Y|=\\tau\\sqrt{2/\\pi}$，此处 $\\tau=\\sqrt2\\sigma$。）由 $a\\cdot\\dfrac{2\\sigma}{\\sqrt\\pi}=\\sigma$ 得 $a=\\dfrac{\\sqrt\\pi}{2}$，选 A。",
      traps: "把 $X_1-X_2$ 的方差写成 $\\sigma^{2}$（漏乘 2），会得到 $a=\\sqrt{2\\pi}$（选项 D）。另外 $E|Y|$ 是 $\\tau\\sqrt{2/\\pi}$ 而不是 $\\tau/2$ 或 $\\tau\\sqrt{\\pi/2}$，四个选项正是在这几个常数间设伏。",
      hint: "先定 $X_1-X_2\\sim N(0,2\\sigma^{2})$，再用 $Y\\sim N(0,\\tau^{2})$ 时 $E|Y|=\\tau\\sqrt{2/\\pi}$ 直接算。",
      src: { file: "参考文件/真题/数学/5、【1987-2025年】考研数学三真题/2023年考研数学三真题.pdf", page: 3, no: "一(10)", note: "题面取自 m3-2023-p3.png 亲读；答案与 2023 答案 PDF p5 对拍（册上选 A），并独立重推校验。" }
    },
    {
      id: "m3-2023-11", origin: "year", year: 2023, no: "二(11)", type: "limit", star: 3, school: "全国硕士研究生招生考试-数学三 2023 年",
      tags: ["tay02","tay03","tp10"],
      stem: "$\\lim\\limits_{x\\to\\infty}x^{2}\\left(2-x\\sin\\dfrac{1}{x}-\\cos\\dfrac{1}{x}\\right)=$______.",
      answer: "$\\dfrac{2}{3}$。令 $t=\\dfrac{1}{x}\\to0$，则\n$$x^{2}\\left(2-x\\sin\\frac{1}{x}-\\cos\\frac{1}{x}\\right)=\\frac{2-\\dfrac{\\sin t}{t}-\\cos t}{t^{2}}.$$\n由 $\\sin t=t-\\dfrac{t^{3}}{6}+o(t^{3})$ 得 $\\dfrac{\\sin t}{t}=1-\\dfrac{t^{2}}{6}+o(t^{2})$，又 $\\cos t=1-\\dfrac{t^{2}}{2}+o(t^{2})$，故分子\n$$2-\\left(1-\\frac{t^{2}}{6}\\right)-\\left(1-\\frac{t^{2}}{2}\\right)+o(t^{2})=\\frac{2}{3}t^{2}+o(t^{2}),$$\n所以原极限为 $\\dfrac{2}{3}$。",
      traps: "只把 $\\cos\\frac1x$ 展开、把 $x\\sin\\frac1x$ 留成 $\\sin t/t$ 的「已知极限 1」，就会算出分子只剩 $\\frac{t^{2}}{2}$，得到 $\\frac12$；两项都必须展开到 $t^{2}$ 阶。也不要用洛必达硬求，次数会越求越高。",
      hint: "换元 $t=1/x$ 后通分，$\\sin t/t$ 与 $\\cos t$ 都展开到 $t^{2}$ 项，比较系数。",
      src: { file: "参考文件/真题/数学/5、【1987-2025年】考研数学三真题/2023年考研数学三真题.pdf", page: 3, no: "二(11)", note: "题面取自 m3-2023-p3.png 亲读；答案与 2023 答案 PDF p5 对拍（册上 $\\frac23$），并独立重推校验。" }
    },
    {
      id: "m3-2023-12", origin: "year", year: 2023, no: "二(12)", type: "multivar", star: 3, school: "全国硕士研究生招生考试-数学三 2023 年",
      tags: ["multi01","zb34"],
      stem: "已知函数 $f(x,y)$ 满足 $\\mathrm{d}f(x,y)=\\dfrac{x\\,\\mathrm{d}y-y\\,\\mathrm{d}x}{x^{2}+y^{2}}$，$f(1,1)=\\dfrac{\\pi}{4}$，则 $f(\\sqrt3,3)=$______.",
      answer: "$\\dfrac{\\pi}{3}$。由 $\\mathrm{d}f=\\dfrac{x\\,\\mathrm{d}y-y\\,\\mathrm{d}x}{x^{2}+y^{2}}=\\mathrm{d}\\left(\\arctan\\dfrac{y}{x}\\right)$ 知\n$$f(x,y)=\\arctan\\frac{y}{x}+C.$$\n由 $f(1,1)=\\arctan1+C=\\dfrac{\\pi}{4}$ 得 $C=0$，故 $f(\\sqrt3,3)=\\arctan\\dfrac{3}{\\sqrt3}=\\arctan\\sqrt3=\\dfrac{\\pi}{3}$。",
      traps: "把 $\\dfrac{x\\,\\mathrm{d}y-y\\,\\mathrm{d}x}{x^{2}+y^{2}}$ 认成 $\\mathrm{d}\\ln\\sqrt{x^{2}+y^{2}}$ 或 $\\mathrm{d}\\arctan\\dfrac{x}{y}$：前者是 $\\dfrac{x\\,\\mathrm{d}x+y\\,\\mathrm{d}y}{x^{2}+y^{2}}$，后者的分子是 $y\\,\\mathrm{d}x-x\\,\\mathrm{d}y$，符号与 $x,y$ 的位置都不同。若把常数 $C$ 当成 $0$ 直接不算，虽本题恰好 $C=0$，但 $f(1,1)$ 的条件正是用来定 $C$ 的。",
      hint: "凑全微分：$\\mathrm{d}\\arctan\\frac{y}{x}=\\frac{x\\mathrm{d}y-y\\mathrm{d}x}{x^{2}+y^{2}}$，再用初值定常数。",
      src: { file: "参考文件/真题/数学/5、【1987-2025年】考研数学三真题/2023年考研数学三真题.pdf", page: 3, no: "二(12)", note: "题面取自 m3-2023-p3.png 亲读；答案与 2023 答案 PDF p6 对拍（册上 $\\frac\\pi3$），并独立重推校验。" }
    },
    {
      id: "m3-2023-13", origin: "year", year: 2023, no: "二(13)", type: "series", star: 3, school: "全国硕士研究生招生考试-数学三 2023 年",
      tags: ["tay01","gx59","kn61"],
      stem: "$\\sum\\limits_{n=0}^{\\infty}\\dfrac{x^{2n}}{(2n)!}=$______.",
      answer: "$\\dfrac{\\mathrm{e}^{x}+\\mathrm{e}^{-x}}{2}$。由\n$$\\mathrm{e}^{x}=\\sum_{n=0}^{\\infty}\\frac{x^{n}}{n!},\\qquad \\mathrm{e}^{-x}=\\sum_{n=0}^{\\infty}\\frac{(-1)^{n}x^{n}}{n!}$$\n两式相加，奇数项两两抵消、偶数项加倍：\n$$\\mathrm{e}^{x}+\\mathrm{e}^{-x}=2\\sum_{n=0}^{\\infty}\\frac{x^{2n}}{(2n)!},$$\n故原和为 $\\dfrac{\\mathrm{e}^{x}+\\mathrm{e}^{-x}}{2}$，即双曲余弦 $\\cosh x$，收敛域为 $(-\\infty,+\\infty)$。",
      traps: "误写成 $\\dfrac{\\mathrm{e}^{x}-\\mathrm{e}^{-x}}{2}$（那是 $\\sum\\frac{x^{2n+1}}{(2n+1)!}$，即 $\\sinh x$）。也可用 $S''=S,\\ S(0)=1,\\ S'(0)=0$ 求解，若漏掉初值会把常数 $C_1,C_2$ 定错。",
      hint: "$\\mathrm{e}^{x}$ 与 $\\mathrm{e}^{-x}$ 的展开式相加消去奇次项；或记 $S(x)$ 满足 $S''=S$ 且 $S(0)=1,S'(0)=0$。",
      src: { file: "参考文件/真题/数学/5、【1987-2025年】考研数学三真题/2023年考研数学三真题.pdf", page: 3, no: "二(13)", note: "题面取自 m3-2023-p3.png 亲读；答案与 2023 答案 PDF p6 对拍（册上 $\\frac{\\mathrm{e}^x+\\mathrm{e}^{-x}}{2}$），并独立重推校验。" }
    },
    {
      id: "m3-2023-14", origin: "year", year: 2023, no: "二(14)", type: "ode", star: 3, school: "全国硕士研究生招生考试-数学三 2023 年",
      tags: ["ode02","zb18"],
      stem: "设某公司在 $t$ 时刻的资产为 $f(t)$，从 0 时刻到 $t$ 时刻的平均资产等于 $\\dfrac{f(t)}{t}-t$。假设 $f(t)$ 连续且 $f(0)=0$，则 $f(t)=$______.",
      answer: "$2\\mathrm{e}^{t}-2t-2$。由题意\n$$\\frac{1}{t}\\int_{0}^{t}f(s)\\,\\mathrm{d}s=\\frac{f(t)}{t}-t\\ \\Longrightarrow\\ \\int_{0}^{t}f(s)\\,\\mathrm{d}s=f(t)-t^{2}.$$\n两边对 $t$ 求导得 $f(t)=f'(t)-2t$，即\n$$f'(t)-f(t)=2t.$$\n用一阶线性方程通解公式\n$$f(t)=\\mathrm{e}^{t}\\left(C+\\int 2t\\,\\mathrm{e}^{-t}\\mathrm{d}t\\right)=\\mathrm{e}^{t}\\left(C-2(t+1)\\mathrm{e}^{-t}\\right)=C\\mathrm{e}^{t}-2t-2.$$\n由 $f(0)=C-2=0$ 得 $C=2$，故 $f(t)=2\\mathrm{e}^{t}-2t-2$。",
      traps: "求导时把 $\\dfrac{f(t)}{t}$ 直接当成 $f(t)$，或忘记 $t^{2}$ 求导后的 $2t$ 项；也可能把平均资产写成 $\\dfrac{1}{t}\\int_0^t f$ 之外的形式（如 $\\dfrac{f(t)-f(0)}{t}$）。$f(0)=0$ 只用来定常数 $C$，不能提前代入丢项。",
      hint: "平均资产 = $\\frac1t\\int_0^t f(s)\\mathrm{d}s$，先乘 $t$ 去掉分母，再两边对 $t$ 求导化成一阶线性方程。",
      src: { file: "参考文件/真题/数学/5、【1987-2025年】考研数学三真题/2023年考研数学三真题.pdf", page: 3, no: "二(14)", note: "题面取自 m3-2023-p3.png 亲读；答案与 2023 答案 PDF p6 对拍（册上 $2\\mathrm{e}^t-2t-2$），并独立重推校验。" }
    },
    {
      id: "m3-2023-15", origin: "year", year: 2023, no: "二(15)", type: "linalg", star: 3, school: "全国硕士研究生招生考试-数学三 2023 年",
      tags: ["zb08","la08"],
      stem: "已知线性方程组 $\\begin{cases}ax_1+x_3=1,\\\\ x_1+ax_2+x_3=0,\\\\ x_1+2x_2+ax_3=0,\\\\ ax_1+bx_2=2\\end{cases}$ 有解，其中 $a,b$ 为常数。若 $\\begin{vmatrix}a&0&1\\\\ 1&a&1\\\\ 1&2&a\\end{vmatrix}=4$，则 $\\begin{vmatrix}1&a&1\\\\ 1&2&a\\\\ a&b&0\\end{vmatrix}=$______.",
      answer: "$8$。前三个方程的系数行列式 $|\\boldsymbol{A}|=\\begin{vmatrix}a&0&1\\\\ 1&a&1\\\\ 1&2&a\\end{vmatrix}=4\\ne0$，故前三个方程有唯一解，由克拉默法则\n$$x_1=\\frac{1}{4}\\begin{vmatrix}1&0&1\\\\ 0&a&1\\\\ 0&2&a\\end{vmatrix}=\\frac{a^{2}-2}{4},\\qquad x_2=\\frac{1}{4}\\begin{vmatrix}a&1&1\\\\ 1&0&1\\\\ 1&0&a\\end{vmatrix}=\\frac{1-a}{4}.$$\n（其中 $\\begin{vmatrix}1&0&1\\\\ 0&a&1\\\\ 0&2&a\\end{vmatrix}=a^{2}-2$，$\\begin{vmatrix}a&1&1\\\\ 1&0&1\\\\ 1&0&a\\end{vmatrix}=-(a-1)$。）方程组有解，第四个方程必须成立：\n$$ax_1+bx_2=2\\ \\Longrightarrow\\ a(a^{2}-2)+b(1-a)=8.$$\n而按第一行展开\n$$\\begin{vmatrix}1&a&1\\\\ 1&2&a\\\\ a&b&0\\end{vmatrix}=a^{3}-2a+b(1-a),$$\n故该行列式等于 $8$。",
      traps: "想先解出 $a$ 再代：$|\\boldsymbol{A}|=a^{3}-3a+2=4$ 给出 $a=2$ 或 $a=-1$，$a$ 不唯一，路会走死。正确做法是用「有解」把第四个方程当作 $a,b$ 的约束，再与待求行列式的展开式比对，常数 $8$ 正是 $2|\\boldsymbol{A}|$。",
      hint: "用克拉默法则写出 $x_1,x_2$（分母就是已知的 4），代入第四个方程得到含 $a,b$ 的式子；再直接展开待求行列式，两者比对。",
      src: { file: "参考文件/真题/数学/5、【1987-2025年】考研数学三真题/2023年考研数学三真题.pdf", page: 3, no: "二(15)", note: "题面取自 m3-2023-p3.png 亲读；答案与 2023 答案 PDF p6-p7 对拍（册上 8，册用 $|\\boldsymbol{B}|=8-|\\cdot|=0$ 的秩论证），并独立用克拉默法则重推校验。" }
    },
    {
      id: "m3-2023-16", origin: "year", year: 2023, no: "二(16)", type: "estimate", star: 3, school: "全国硕士研究生招生考试-数学三 2023 年",
      tags: ["zt04"],
      stem: "设随机变量 $X$ 与 $Y$ 相互独立，且 $X\\sim B(1,p)$，$Y\\sim B(2,p)$，$p\\in(0,1)$，则 $X+Y$ 与 $X-Y$ 的相关系数为______.",
      answer: "$-\\dfrac{1}{3}$。$DX=p(1-p)$，$DY=2p(1-p)$，且 $X,Y$ 独立，故\n$$\\mathrm{Cov}(X+Y,X-Y)=DX-DY=p(1-p)-2p(1-p)=-p(1-p),$$\n$$D(X+Y)=DX+DY=3p(1-p),\\qquad D(X-Y)=DX+DY=3p(1-p),$$\n所以相关系数\n$$\\rho=\\frac{\\mathrm{Cov}(X+Y,X-Y)}{\\sqrt{D(X+Y)}\\sqrt{D(X-Y)}}=\\frac{-p(1-p)}{3p(1-p)}=-\\frac{1}{3}.$$",
      traps: "展开协方差时把 $\\mathrm{Cov}(X,-Y)$ 与 $\\mathrm{Cov}(Y,X)$ 都写成 $+$，会得到 $DX+DY$ 而误判为 $\\frac13$；正确展开是 $\\mathrm{Cov}(X,X)-\\mathrm{Cov}(X,Y)+\\mathrm{Cov}(Y,X)-\\mathrm{Cov}(Y,Y)=DX-DY$。另外 $D(X-Y)=DX+DY$（独立），不是 $DX-DY$。",
      hint: "先算 $DX,DY$，再按双线性展开 $\\mathrm{Cov}(X+Y,X-Y)=DX-DY$，独立时 $D(X\\pm Y)=DX+DY$。",
      src: { file: "参考文件/真题/数学/5、【1987-2025年】考研数学三真题/2023年考研数学三真题.pdf", page: 4, no: "二(16)", note: "题面取自 m3-2023-p4.png 亲读；答案与 2023 答案 PDF p7 对拍（册上 $-\\frac13$），并独立重推校验。" }
    },
    {
      id: "m3-2023-17", origin: "year", year: 2023, no: "三(17)", type: "deriv", star: 4, school: "全国硕士研究生招生考试-数学三 2023 年",
      tags: ["multi02","ext05"],
      stem: "已知可导函数 $y=y(x)$ 满足 $a\\mathrm{e}^{x}+y^{2}+y-\\ln(1+x)\\cos y+b=0$，且 $y(0)=0$，$y'(0)=0$。\n（Ⅰ）求 $a,b$ 的值；\n（Ⅱ）判断 $x=0$ 是否为 $y(x)$ 的极值点。",
      answer: "（Ⅰ）$a=1$，$b=-1$。（Ⅱ）$x=0$ 是 $y(x)$ 的极大值点。\n（Ⅰ）在原方程中令 $x=0,\\ y=0$ 得 $a+b=0$。记 $F(x,y)=a\\mathrm{e}^{x}+y^{2}+y-\\ln(1+x)\\cos y+b$，两边对 $x$ 求导（$y=y(x)$）：\n$$a\\mathrm{e}^{x}+2yy'+y'-\\frac{\\cos y}{1+x}+\\ln(1+x)\\,y'\\sin y=0.$$\n再令 $x=0,\\ y=0,\\ y'(0)=0$ 得 $a-1=0$，故 $a=1,\\ b=-1$。\n（Ⅱ）$F_y=2y+1+\\ln(1+x)\\sin y$，在 $(0,0)$ 处 $F_y=1\\ne0$，故 $y=y(x)$ 可微且 $y''(0)=-\\dfrac{F_{xx}(0,0)}{F_y(0,0)}$。由 $F_x=\\mathrm{e}^{x}-\\dfrac{\\cos y}{1+x}$ 得\n$$F_{xx}=\\mathrm{e}^{x}+\\frac{\\cos y}{(1+x)^{2}},\\qquad F_{xx}(0,0)=1+1=2,$$\n于是 $y''(0)=-2<0$，$x=0$ 为 $y(x)$ 的极大值点（极大值 $y(0)=0$）。",
      traps: "只做（Ⅰ）就下结论：$y'(0)=0$ 只说明 $x=0$ 是驻点，必须再看 $y''(0)$ 的符号。求 $y''(0)$ 时忘记 $\\ln(1+x)\\cos y$ 求导后的两项（$\\frac{\\cos y}{1+x}$ 与 $\\ln(1+x)y'\\sin y$），或对 $F_{xx}$ 漏掉 $\\frac{\\cos y}{(1+x)^{2}}$ 这一项，会得到 $y''(0)=0$ 而无法判定。",
      hint: "先用 $x=0,y=0$ 定 $a+b=0$，再用一阶导数式加 $y'(0)=0$ 定 $a$；判极值用隐函数二阶导 $y''(0)=-F_{xx}/F_y$。",
      src: { file: "参考文件/真题/数学/5、【1987-2025年】考研数学三真题/2023年考研数学三真题.pdf", page: 4, no: "三(17)", note: "题面取自 m3-2023-p4.png 亲读；答案与 2023 答案 PDF p7 对拍（册上 $a=1,b=-1$、极大值点），并独立重推校验。" }
    },
    {
      id: "m3-2023-18", origin: "year", year: 2023, no: "三(18)", type: "integral", star: 4, school: "全国硕士研究生招生考试-数学三 2023 年",
      tags: ["int28","int29"],
      stem: "已知平面区域 $D=\\left\\{(x,y)\\mid 0\\le y\\le \\dfrac{1}{x\\sqrt{1+x^{2}}},\\ x\\ge1\\right\\}$。\n（Ⅰ）求 $D$ 的面积；\n（Ⅱ）求 $D$ 绕 $x$ 轴旋转所成旋转体的体积。",
      answer: "（Ⅰ）面积 $S=\\ln(1+\\sqrt2)$；（Ⅱ）体积 $V=\\pi\\left(1-\\dfrac{\\pi}{4}\\right)$。\n（Ⅰ）\n$$S=\\int_{1}^{+\\infty}\\frac{\\mathrm{d}x}{x\\sqrt{1+x^{2}}}.$$\n令 $x=\\tan\\theta$，则 $\\mathrm{d}x=\\sec^{2}\\theta\\,\\mathrm{d}\\theta$，$x\\sqrt{1+x^{2}}=\\tan\\theta\\sec\\theta$，$x:1\\to+\\infty$ 对应 $\\theta:\\dfrac{\\pi}{4}\\to\\dfrac{\\pi}{2}$，故\n$$S=\\int_{\\pi/4}^{\\pi/2}\\frac{\\sec^{2}\\theta}{\\tan\\theta\\sec\\theta}\\mathrm{d}\\theta=\\int_{\\pi/4}^{\\pi/2}\\csc\\theta\\,\\mathrm{d}\\theta=\\left[\\ln\\left|\\tan\\frac{\\theta}{2}\\right|\\right]_{\\pi/4}^{\\pi/2}=0-\\ln(\\sqrt2-1)=\\ln(1+\\sqrt2).$$\n（Ⅱ）由旋转体体积公式\n$$V=\\pi\\int_{1}^{+\\infty}\\frac{\\mathrm{d}x}{x^{2}(1+x^{2})}=\\pi\\int_{1}^{+\\infty}\\left(\\frac{1}{x^{2}}-\\frac{1}{1+x^{2}}\\right)\\mathrm{d}x=\\pi\\left[-\\frac{1}{x}-\\arctan x\\right]_{1}^{+\\infty}=\\pi\\left(1-\\frac{\\pi}{4}\\right).$$",
      traps: "（Ⅰ）用 $t=\\sqrt{x^{2}+1}$ 换元时上下限要同步换（$x:1\\to+\\infty$ 对应 $t:\\sqrt2\\to+\\infty$），漏换会算出 $\\ln(\\sqrt2+1)$ 之外的怪式子。（Ⅱ）容易把体积写成 $\\pi\\int y\\,\\mathrm{d}x$（那是面积），或忘记平方，得到 $\\pi\\int\\frac{\\mathrm{d}x}{x\\sqrt{1+x^{2}}}$ 而误抄成面积。",
      hint: "（Ⅰ）令 $x=\\tan\\theta$ 化为 $\\int\\csc\\theta\\,\\mathrm{d}\\theta$；（Ⅱ）$V=\\pi\\int y^{2}\\mathrm{d}x$，被积函数拆成 $\\frac{1}{x^{2}}-\\frac{1}{1+x^{2}}$。",
      src: { file: "参考文件/真题/数学/5、【1987-2025年】考研数学三真题/2023年考研数学三真题.pdf", page: 4, no: "三(18)", note: "题面取自 m3-2023-p4.png 亲读；答案与 2023 答案 PDF p7-p8 对拍（册上 $\\ln(1+\\sqrt2)$、$\\pi(1-\\frac\\pi4)$），并独立重推校验。" }
    },
    {
      id: "m3-2023-19", origin: "year", year: 2023, no: "三(19)", type: "dblint", star: 4, school: "全国硕士研究生招生考试-数学三 2023 年",
      tags: ["dbi02","tp08"],
      stem: "已知平面区域 $D=\\{(x,y)\\mid (x-1)^{2}+y^{2}\\le1\\}$，计算二重积分 $\\iint\\limits_{D}\\left|\\sqrt{x^{2}+y^{2}}-1\\right|\\mathrm{d}x\\mathrm{d}y$。",
      answer: "$3\\sqrt3-\\dfrac{\\pi}{9}-\\dfrac{32}{9}$。区域 $D$ 的极坐标表示为 $0\\le r\\le2\\cos\\theta,\\ -\\dfrac{\\pi}{2}\\le\\theta\\le\\dfrac{\\pi}{2}$，被积函数在 $r=1$（单位圆）处分段，于是\n$$I=\\int_{-\\pi/2}^{\\pi/2}\\mathrm{d}\\theta\\int_{0}^{2\\cos\\theta}|r-1|\\,r\\,\\mathrm{d}r.$$\n当 $|\\theta|\\le\\dfrac{\\pi}{3}$ 时 $2\\cos\\theta\\ge1$，内层积分为\n$$\\int_{0}^{1}(1-r)r\\,\\mathrm{d}r+\\int_{1}^{2\\cos\\theta}(r-1)r\\,\\mathrm{d}r=\\frac{1}{3}+\\frac{8}{3}\\cos^{3}\\theta-2\\cos^{2}\\theta;$$\n当 $\\dfrac{\\pi}{3}<|\\theta|\\le\\dfrac{\\pi}{2}$ 时 $2\\cos\\theta<1$，内层积分为\n$$\\int_{0}^{2\\cos\\theta}(1-r)r\\,\\mathrm{d}r=2\\cos^{2}\\theta-\\frac{8}{3}\\cos^{3}\\theta.$$\n由关于极轴的对称性\n$$I=2\\int_{0}^{\\pi/3}\\left(\\frac{1}{3}+\\frac{8}{3}\\cos^{3}\\theta-2\\cos^{2}\\theta\\right)\\mathrm{d}\\theta+2\\int_{\\pi/3}^{\\pi/2}\\left(2\\cos^{2}\\theta-\\frac{8}{3}\\cos^{3}\\theta\\right)\\mathrm{d}\\theta,$$\n用 $\\int\\cos^{2}\\theta\\,\\mathrm{d}\\theta=\\dfrac{\\theta}{2}+\\dfrac{\\sin2\\theta}{4}$、$\\int\\cos^{3}\\theta\\,\\mathrm{d}\\theta=\\sin\\theta-\\dfrac{\\sin^{3}\\theta}{3}$ 逐项代入：\n$$2\\left[\\frac{\\pi}{9}-\\frac{\\pi}{3}+\\frac{3\\sqrt3}{4}\\right]+2\\left[\\frac{\\pi}{6}+\\frac{3\\sqrt3}{4}-\\frac{16}{9}\\right]=3\\sqrt3-\\frac{\\pi}{9}-\\frac{32}{9}.$$",
      traps: "三个坑：一是不分段，直接算 $\\iint(r-1)r\\,\\mathrm{d}r\\mathrm{d}\\theta$（丢掉绝对值，$r<1$ 的部分符号错）；二是极坐标下界写错，圆的极坐标方程是 $r=2\\cos\\theta$ 而不是 $r=1$；三是角度分段点：$2\\cos\\theta=1$ 对应 $\\theta=\\dfrac{\\pi}{3}$，在 $\\left[\\dfrac{\\pi}{3},\\dfrac{\\pi}{2}\\right]$ 上圆完全落在单位圆内，公式要换。",
      hint: "极坐标下 $D$ 是 $r\\le2\\cos\\theta$，绝对值以 $r=1$ 分段，角度以 $\\theta=\\pm\\frac\\pi3$ 分段，再乘 2 倍对称。",
      src: { file: "参考文件/真题/数学/5、【1987-2025年】考研数学三真题/2023年考研数学三真题.pdf", page: 4, no: "三(19)", note: "题面取自 m3-2023-p4.png 亲读；答案与 2023 答案 PDF p8 对拍（册上分 $D_1,D_2$ 得 $3\\sqrt3-\\frac\\pi9-\\frac{32}{9}$，与本题按 $\\theta$ 分段的独立重推一致）。" }
    },
    {
      id: "m3-2023-20", origin: "year", year: 2023, no: "三(20)", type: "proof", star: 4, school: "全国硕士研究生招生考试-数学三 2023 年",
      tags: ["mvt04","tp03"],
      stem: "设函数 $f(x)$ 在 $[-a,a]$ 上具有 2 阶连续导数，证明：\n（Ⅰ）若 $f(0)=0$，则存在 $\\xi\\in(-a,a)$，使得 $f''(\\xi)=\\dfrac{1}{a^{2}}\\left[f(a)+f(-a)\\right]$；\n（Ⅱ）若 $f(x)$ 在 $(-a,a)$ 内取得极值，则存在 $\\eta\\in(-a,a)$，使得 $\\left|f''(\\eta)\\right|\\ge\\dfrac{1}{2a^{2}}\\left|f(a)-f(-a)\\right|$。",
      answer: "（Ⅰ）由泰勒公式（$f(0)=0$）\n$$f(a)=f'(0)a+\\frac{f''(\\eta_1)}{2!}a^{2},\\qquad f(-a)=-f'(0)a+\\frac{f''(\\eta_2)}{2!}a^{2},$$\n其中 $-a<\\eta_1<0<\\eta_2<a$。两式相加，一阶项抵消：\n$$f(a)+f(-a)=\\frac{a^{2}}{2}\\left[f''(\\eta_1)+f''(\\eta_2)\\right].$$\n$f''$ 在 $[\\eta_1,\\eta_2]$ 上连续，设其最小值为 $m$、最大值为 $M$，则\n$$m\\le\\frac{f''(\\eta_1)+f''(\\eta_2)}{2}\\le M,$$\n由介值定理，存在 $\\xi\\in[\\eta_1,\\eta_2]\\subset(-a,a)$ 使 $f''(\\xi)=\\dfrac{f''(\\eta_1)+f''(\\eta_2)}{2}$，代回即得\n$$f''(\\xi)=\\frac{1}{a^{2}}\\left[f(a)+f(-a)\\right].$$\n（Ⅱ）设 $f$ 在 $x_0\\in(-a,a)$ 取极值，由费马定理 $f'(x_0)=0$，于是在 $x_0$ 处展开\n$$f(x)=f(x_0)+\\frac{f''(\\xi)}{2}(x-x_0)^{2},$$\n分别取 $x=-a$ 与 $x=a$：\n$$f(-a)=f(x_0)+\\frac{f''(\\xi_1)}{2}(a+x_0)^{2},\\qquad f(a)=f(x_0)+\\frac{f''(\\xi_2)}{2}(a-x_0)^{2},$$\n其中 $\\xi_1$ 介于 $x_0$ 与 $-a$ 之间、$\\xi_2$ 介于 $x_0$ 与 $a$ 之间。相减并记 $M=\\max\\limits_{[-a,a]}|f''|$：\n$$|f(a)-f(-a)|=\\left|\\frac{f''(\\xi_2)}{2}(a-x_0)^{2}-\\frac{f''(\\xi_1)}{2}(a+x_0)^{2}\\right|\\le\\frac{M}{2}\\left[(a-x_0)^{2}+(a+x_0)^{2}\\right].$$\n而 $(a-x_0)^{2}+(a+x_0)^{2}=2a^{2}+2x_0^{2}\\le4a^{2}$，故\n$$|f(a)-f(-a)|\\le2a^{2}M.$$\n又 $|f''|$ 在 $[-a,a]$ 上连续，必在某点 $\\eta\\in(-a,a)$ 取到最大值 $M$，于是\n$$\\left|f''(\\eta)\\right|=M\\ge\\frac{1}{2a^{2}}\\left|f(a)-f(-a)\\right|.$$",
      traps: "（Ⅰ）的系数是 $\\dfrac{1}{a^{2}}$ 而不是 $\\dfrac{2}{a}$ 或 $\\dfrac{1}{a}$：两次泰勒都带 $\\dfrac{a^{2}}{2}$，相加后又除以 2，恰好约成 $a^{2}$。只对一个点展开（只用 $f(a)$）无法同时用上 $f(-a)$。（Ⅱ）关键是先由「取极值」得到 $f'(x_0)=0$，展开点必须选在 $x_0$ 而不是 0；放缩时 $2a^{2}+2x_{0}^{2}\\le4a^{2}$ 这一步不能省。",
      hint: "（Ⅰ）在 $0$ 点对 $a$ 与 $-a$ 各写一次带拉格朗日余项的泰勒式，相加后用 $f''$ 的介值性（连续函数取中间值）；（Ⅱ）在极值点 $x_0$ 展开，相减后放缩到 $2a^{2}M$，再用 $|f''|$ 取到最大值。",
      src: { file: "参考文件/真题/数学/5、【1987-2025年】考研数学三真题/2023年考研数学三真题.pdf", page: 4, no: "三(20)", note: "题面取自 m3-2023-p4.png 亲读；答案与 2023 答案 PDF p8-p9 对拍（册上同一证法：泰勒 + 介值/最值），并独立重推校验。" }
    },
    {
      id: "m3-2023-21", origin: "year", year: 2023, no: "三(21)", type: "eigen", star: 4, school: "全国硕士研究生招生考试-数学三 2023 年",
      tags: ["tp04","la13"],
      stem: "设矩阵 $\\boldsymbol{A}$ 满足：对任意 $x_1,x_2,x_3$，均有 $\\boldsymbol{A}\\begin{pmatrix}x_1\\\\x_2\\\\x_3\\end{pmatrix}=\\begin{pmatrix}x_1+x_2+x_3\\\\2x_1-x_2+x_3\\\\x_2-x_3\\end{pmatrix}$。\n（Ⅰ）求 $\\boldsymbol{A}$；\n（Ⅱ）求可逆矩阵 $\\boldsymbol{P}$ 与对角矩阵 $\\boldsymbol{\\Lambda}$，使得 $\\boldsymbol{P}^{-1}\\boldsymbol{A}\\boldsymbol{P}=\\boldsymbol{\\Lambda}$。",
      answer: "（Ⅰ）$\\boldsymbol{A}=\\begin{bmatrix}1&1&1\\\\ 2&-1&1\\\\ 0&1&-1\\end{bmatrix}$。\n（Ⅱ）取 $\\boldsymbol{P}=\\begin{bmatrix}-1&0&4\\\\ 0&1&3\\\\ 2&-1&1\\end{bmatrix}$，则 $\\boldsymbol{P}^{-1}\\boldsymbol{A}\\boldsymbol{P}=\\begin{bmatrix}-1&0&0\\\\ 0&-2&0\\\\ 0&0&2\\end{bmatrix}$。\n（Ⅰ）恒等式对一切 $x$ 成立，故 $\\boldsymbol{A}$ 的第 $j$ 列就是 $\\boldsymbol{e}_j$ 的像：分别取 $x=(1,0,0)^{\\mathrm{T}},(0,1,0)^{\\mathrm{T}},(0,0,1)^{\\mathrm{T}}$ 得\n$$\\boldsymbol{A}=\\begin{bmatrix}1&1&1\\\\ 2&-1&1\\\\ 0&1&-1\\end{bmatrix}.$$\n（Ⅱ）\n$$|\\lambda\\boldsymbol{E}-\\boldsymbol{A}|=\\begin{vmatrix}\\lambda-1&-1&-1\\\\ -2&\\lambda+1&-1\\\\ 0&-1&\\lambda+1\\end{vmatrix}=-(\\lambda+2)(\\lambda+1)(\\lambda-2),$$\n特征值为 $\\lambda_1=-1,\\ \\lambda_2=-2,\\ \\lambda_3=2$（互异，必可对角化）。\n解 $(\\boldsymbol{A}+\\boldsymbol{E})\\boldsymbol{x}=\\boldsymbol{0}$ 得 $\\boldsymbol{\\xi}_1=(-1,0,2)^{\\mathrm{T}}$；解 $(\\boldsymbol{A}+2\\boldsymbol{E})\\boldsymbol{x}=\\boldsymbol{0}$ 得 $\\boldsymbol{\\xi}_2=(0,1,-1)^{\\mathrm{T}}$；解 $(\\boldsymbol{A}-2\\boldsymbol{E})\\boldsymbol{x}=\\boldsymbol{0}$ 得 $\\boldsymbol{\\xi}_3=(4,3,1)^{\\mathrm{T}}$。三者线性无关，令 $\\boldsymbol{P}=(\\boldsymbol{\\xi}_1,\\boldsymbol{\\xi}_2,\\boldsymbol{\\xi}_3)$ 即得所要求的对角化，$\\boldsymbol{\\Lambda}=\\mathrm{diag}(-1,-2,2)$。",
      traps: "（Ⅰ）容易把「$\\boldsymbol{A}\\boldsymbol{x}$ 的表达式」按行抄成矩阵时行列颠倒（第三行只有 $x_2-x_3$，第一列应为 $(1,2,0)^{\\mathrm{T}}$）。（Ⅱ）$\\boldsymbol{P}$ 的列必须与 $\\boldsymbol{\\Lambda}$ 对角元的顺序对应；$\\boldsymbol{P}$ 不唯一（特征向量可乘任意非零常数、列可重排），只要 $\\boldsymbol{P}$ 可逆且 $\\boldsymbol{P}^{-1}\\boldsymbol{A}\\boldsymbol{P}=\\boldsymbol{\\Lambda}$ 即可。",
      hint: "（Ⅰ）把恒等式右端写成矩阵乘向量的形式，系数按列读出；（Ⅱ）三个特征值互异，各求一个特征向量作列拼成 $\\boldsymbol{P}$。",
      src: { file: "参考文件/真题/数学/5、【1987-2025年】考研数学三真题/2023年考研数学三真题.pdf", page: 4, no: "三(21)", note: "题面取自 m3-2023-p4.png 亲读；答案与 2023 答案 PDF p9-p10 对拍（册上 $\\boldsymbol{A}$、$\\boldsymbol{P}$、$\\boldsymbol{\\Lambda}$ 均同），并独立重推校验。" }
    },
    {
      id: "m3-2023-22", origin: "year", year: 2023, no: "三(22)", type: "estimate", star: 4, school: "全国硕士研究生招生考试-数学三 2023 年",
      tags: ["zt05","int25"],
      stem: "设随机变量 $X$ 的概率密度为 $f(x)=\\dfrac{\\mathrm{e}^{x}}{(1+\\mathrm{e}^{x})^{2}}$，$-\\infty<x<+\\infty$，令 $Y=\\mathrm{e}^{X}$。\n（Ⅰ）求 $X$ 的分布函数；\n（Ⅱ）求 $Y$ 的概率密度；\n（Ⅲ）$Y$ 的期望是否存在？",
      answer: "（Ⅰ）$F(x)=\\dfrac{\\mathrm{e}^{x}}{1+\\mathrm{e}^{x}}$，$-\\infty<x<+\\infty$。\n（Ⅱ）$f_Y(y)=\\begin{cases}\\dfrac{1}{(1+y)^{2}},&y>0,\\\\ 0,&\\text{其他}.\\end{cases}$\n（Ⅲ）不存在。\n（Ⅰ）\n$$F(x)=\\int_{-\\infty}^{x}\\frac{\\mathrm{e}^{t}}{(1+\\mathrm{e}^{t})^{2}}\\mathrm{d}t=\\left[-\\frac{1}{1+\\mathrm{e}^{t}}\\right]_{-\\infty}^{x}=1-\\frac{1}{1+\\mathrm{e}^{x}}=\\frac{\\mathrm{e}^{x}}{1+\\mathrm{e}^{x}}.$$\n（Ⅱ）$y=\\mathrm{e}^{x}$ 在 $(-\\infty,+\\infty)$ 上单调增，值域 $(0,+\\infty)$，反函数 $x=\\ln y$。当 $y>0$ 时\n$$F_Y(y)=P\\{\\mathrm{e}^{X}\\le y\\}=P\\{X\\le\\ln y\\}=F(\\ln y)=\\frac{y}{1+y},$$\n故 $f_Y(y)=F_Y'(y)=\\dfrac{1}{(1+y)^{2}}$；当 $y\\le0$ 时 $F_Y(y)=0$，$f_Y(y)=0$。\n（Ⅲ）\n$$EY=\\int_{0}^{+\\infty}y\\cdot\\frac{1}{(1+y)^{2}}\\mathrm{d}y,$$\n而被积函数 $\\dfrac{y}{(1+y)^{2}}\\sim\\dfrac{1}{y}$（$y\\to+\\infty$），由 $\\int_1^{+\\infty}\\dfrac{\\mathrm{d}y}{y}$ 发散知该积分发散，故 $EY$ 不存在。",
      traps: "（Ⅱ）忘记写 $y\\le0$ 时密度为 0 的分段，或把 $F_Y$ 求导时漏掉链式因子（$F(\\ln y)$ 直接求导得 $f(\\ln y)\\cdot\\frac1y$）。（Ⅲ）只算到 $\\dfrac{y}{(1+y)^{2}}$ 就断言「趋于 0 故收敛」是错的：$\\dfrac{y}{(1+y)^{2}}\\sim\\dfrac1y$，是 $p=1$ 的 $p$ 积分，发散。本题 $X$ 的分布是对称的 logistic 型，$Y$ 的尾部是 $\\dfrac1{y^{2}}$ 型但期望判断要看 $yf_Y(y)\\sim\\dfrac1y$。",
      hint: "（Ⅰ）直接积分，注意 $\\frac{\\mathrm{e}^{t}}{(1+\\mathrm{e}^{t})^{2}}$ 的原函数是 $-\\frac{1}{1+\\mathrm{e}^{t}}$；（Ⅱ）用分布函数法 $F_Y(y)=F(\\ln y)$；（Ⅲ）写 $EY=\\int yf_Y$，与 $\\int\\frac{\\mathrm{d}y}{y}$ 比较。",
      src: { file: "参考文件/真题/数学/5、【1987-2025年】考研数学三真题/2023年考研数学三真题.pdf", page: 4, no: "三(22)", note: "题面取自 m3-2023-p4.png 亲读；答案与 2023 答案 PDF p10 对拍（册上 $\\frac{\\mathrm{e}^x}{1+\\mathrm{e}^x}$、$\\frac{1}{(1+y)^2}$、期望不存在），并独立重推校验。" }
    },
    {
      id: "m3-2024-1", origin: "year", year: 2024, no: "一(1)", type: "limit", star: 3, school: "全国硕士研究生招生考试-数学三 2024 年",
      tags: ["lim16","lim17"],
      stem: "已知 $f(x)=\\lim\\limits_{n\\to\\infty}\\dfrac{1+x}{1+nx^{2n}}$，则 $f(x)$（ ）",
      options: ["在 $x=1,\\ x=-1$ 处均连续","在 $x=1$ 处连续，$x=-1$ 处不连续","在 $x=1,\\ x=-1$ 处均不连续","在 $x=1$ 处不连续，$x=-1$ 处连续"],
      answer: "选 D。按 $|x|$ 与 1 的大小讨论极限（$n\\to\\infty$ 时 $nx^{2n}$ 的行为由 $x^{2n}$ 决定）：\n- 当 $|x|<1$ 时 $x^{2n}\\to0$，$nx^{2n}\\to0$，故 $f(x)=1+x$；\n- 当 $|x|>1$ 时 $x^{2n}\\to+\\infty$，$nx^{2n}\\to+\\infty$，故 $f(x)=0$；\n- 当 $x=1$ 时 $f(1)=\\lim\\limits_{n\\to\\infty}\\dfrac{2}{1+n}=0$；当 $x=-1$ 时 $f(-1)=\\lim\\limits_{n\\to\\infty}\\dfrac{0}{1+n}=0$。\n即\n$$f(x)=\\begin{cases}1+x,&-1<x<1,\\\\ 0,&x\\le-1\\ \\text{或}\\ x\\ge1.\\end{cases}$$\n在 $x=1$ 处：$\\lim\\limits_{x\\to1^{-}}f(x)=2\\ne f(1)=0$，不连续；在 $x=-1$ 处：左极限 $0$、右极限 $\\lim\\limits_{x\\to-1^{+}}(1+x)=0$，均等于 $f(-1)=0$，连续。故选 D。",
      traps: "把 $f$ 看成在 $x=\\pm1$ 处都取 $1+x$ 的值，从而误选 (A)(B)；注意 $x=\\pm1$ 必须单独代入原式取极限，得到的是 0 而不是 $1+x$ 的极限值。另外上限是 $x^{2n}$ 不是 $x^{n}$：若误成 $x^{n}$，$x=-1$ 处 $nx^{n}$ 不收敛，判定会全变。",
      hint: "分 $|x|<1$、$|x|>1$、$x=\\pm1$ 四种情形求极限，先写出分段的 $f(x)$，再逐点比左右极限与函数值。",
      src: { file: "参考文件/真题/数学/5、【1987-2025年】考研数学三真题/2024年考研数学三真题.pdf", page: 1, no: "一(1)", note: "题面取自 m3-2024-p1.png 亲读；答案与 2024 答案 PDF p1 对拍（册上选 D），并独立重推校验。" }
    },
    {
      id: "m3-2024-2", origin: "year", year: 2024, no: "一(2)", type: "integral", star: 3, school: "全国硕士研究生招生考试-数学三 2024 年",
      tags: ["kn41","int23"],
      stem: "设 $I=\\int_{\\alpha}^{\\alpha+k\\pi}|\\sin x|\\,\\mathrm{d}x$，$k$ 为整数，则 $I$ 的值（ ）",
      options: ["只与 $\\alpha$ 有关","只与 $k$ 有关","与 $\\alpha$ 和 $k$ 均有关","与 $\\alpha$ 和 $k$ 均无关"],
      answer: "选 B。$|\\sin x|$ 以 $\\pi$ 为周期，且在任何长度为 $\\pi$ 的区间上积分值相同：\n$$\\int_{\\alpha}^{\\alpha+\\pi}|\\sin x|\\,\\mathrm{d}x=\\int_{0}^{\\pi}\\sin x\\,\\mathrm{d}x=2.$$\n把 $[\\alpha,\\alpha+k\\pi]$ 分成 $k$ 个长度为 $\\pi$ 的区间，得\n$$I=\\int_{\\alpha}^{\\alpha+k\\pi}|\\sin x|\\,\\mathrm{d}x=k\\int_{0}^{\\pi}\\sin x\\,\\mathrm{d}x=2k,$$\n故 $I$ 只与 $k$ 有关，与 $\\alpha$ 无关，选 B。",
      traps: "误以为积分下限 $\\alpha$ 会影响结果（选 A 或 C）：$|\\sin x|$ 的周期性保证了在任意长度 $\\pi$ 的区间上积分都等于 2，下限只是把区间整体平移。也不要因为 $\\sin x$ 本身不以 $\\pi$ 为周期就否定周期性——这里是 $|\\sin x|$。",
      hint: "把区间拆成 $k$ 段长度 $\\pi$ 的区间，用 $|\\sin x|$ 的 $\\pi$ 周期性把每段平移回 $[0,\\pi]$。",
      src: { file: "参考文件/真题/数学/5、【1987-2025年】考研数学三真题/2024年考研数学三真题.pdf", page: 1, no: "一(2)", note: "题面取自 m3-2024-p1.png 亲读；答案与 2024 答案 PDF p1 对拍（册上选 B），并独立重推校验。" }
    },
    {
      id: "m3-2024-3", origin: "year", year: 2024, no: "一(3)", type: "dblint", star: 3, school: "全国硕士研究生招生考试-数学三 2024 年",
      tags: ["dbi03","tp08"],
      stem: "已知 $f(x,y)$ 连续，则 $\\int_{\\pi/6}^{\\pi/2}\\mathrm{d}x\\int_{\\sin x}^{1}f(x,y)\\,\\mathrm{d}y=$（ ）",
      options: ["$\\int_{1/2}^{1}\\mathrm{d}y\\int_{\\pi/6}^{\\arcsin y}f(x,y)\\,\\mathrm{d}x$","$\\int_{1/2}^{1}\\mathrm{d}y\\int_{\\arcsin y}^{\\pi/2}f(x,y)\\,\\mathrm{d}x$","$\\int_{0}^{1/2}\\mathrm{d}y\\int_{\\pi/6}^{\\arcsin y}f(x,y)\\,\\mathrm{d}x$","$\\int_{0}^{1/2}\\mathrm{d}y\\int_{\\arcsin y}^{\\pi/2}f(x,y)\\,\\mathrm{d}x$"],
      answer: "选 A。积分区域\n$$D=\\left\\{(x,y)\\mid \\frac{\\pi}{6}\\le x\\le\\frac{\\pi}{2},\\ \\sin x\\le y\\le1\\right\\}.$$\n在 $\\left[\\dfrac{\\pi}{6},\\dfrac{\\pi}{2}\\right]$ 上 $\\sin x$ 从 $\\dfrac12$ 单调增到 $1$，故 $y$ 的范围是 $\\dfrac12\\le y\\le1$；固定 $y$ 后由 $\\sin x\\le y$ 及 $x\\le\\dfrac{\\pi}{2}$ 得 $\\dfrac{\\pi}{6}\\le x\\le\\arcsin y$（在 $\\left[\\dfrac{\\pi}{6},\\dfrac{\\pi}{2}\\right]$ 上 $\\arcsin$ 单调增）。所以\n$$\\int_{\\pi/6}^{\\pi/2}\\mathrm{d}x\\int_{\\sin x}^{1}f(x,y)\\,\\mathrm{d}y=\\int_{1/2}^{1}\\mathrm{d}y\\int_{\\pi/6}^{\\arcsin y}f(x,y)\\,\\mathrm{d}x,$$\n选 A。",
      traps: "三个易错点：一是 $y$ 的下限取 $\\sin\\dfrac{\\pi}{6}=\\dfrac12$ 而不是 0，故 (C)(D) 的 $\\int_0^{1/2}$ 错；二是固定 $y$ 后 $x$ 的右端是 $\\arcsin y$（由 $\\sin x\\le y$ 解出），不是 $\\dfrac{\\pi}{2}$，故 (B)(D) 的 $\\int_{\\arcsin y}^{\\pi/2}$ 错；三是 $x$ 的左端仍是 $\\dfrac{\\pi}{6}$，不能因为换了次序就丢掉。",
      hint: "先画出 $D$（$y=\\sin x$ 上方的曲边梯形），把 $y$ 从头到尾看一遍得到 $y$ 的范围，再对固定 $y$ 横着切确定 $x$ 的范围。",
      src: { file: "参考文件/真题/数学/5、【1987-2025年】考研数学三真题/2024年考研数学三真题.pdf", page: 1, no: "一(3)", note: "题面取自 m3-2024-p1.png 亲读；答案与 2024 答案 PDF p1 对拍（册上选 A），并独立重推校验。" }
    },
    {
      id: "m3-2024-4", origin: "year", year: 2024, no: "一(4)", type: "series", star: 3, school: "全国硕士研究生招生考试-数学三 2024 年",
      tags: ["tay04","ser12"],
      stem: "设幂级数 $\\sum\\limits_{n=0}^{\\infty}a_nx^{n}$ 的和函数为 $\\ln(2+x)$，则 $\\sum\\limits_{n=0}^{\\infty}na_{2n}=$（ ）",
      options: ["$-\\dfrac{1}{6}$","$-\\dfrac{1}{3}$","$\\dfrac{1}{6}$","$\\dfrac{1}{3}$"],
      answer: "选 A。由\n$$\\ln(2+x)=\\ln2+\\ln\\left(1+\\frac{x}{2}\\right)=\\ln2+\\sum_{n=1}^{\\infty}(-1)^{n-1}\\frac{1}{n}\\left(\\frac{x}{2}\\right)^{n},\\qquad -2<x\\le2,$$\n得 $a_0=\\ln2$，$a_n=\\dfrac{(-1)^{n-1}}{n\\cdot2^{n}}\\ (n\\ge1)$。于是对 $n\\ge1$\n$$a_{2n}=\\frac{(-1)^{2n-1}}{2n\\cdot2^{2n}}=-\\frac{1}{2n\\cdot4^{n}},\\qquad na_{2n}=-\\frac{1}{2\\cdot4^{n}},$$\n故\n$$\\sum_{n=0}^{\\infty}na_{2n}=\\sum_{n=1}^{\\infty}\\left(-\\frac{1}{2\\cdot4^{n}}\\right)=-\\frac{1}{2}\\sum_{n=1}^{\\infty}\\frac{1}{4^{n}}=-\\frac{1}{2}\\cdot\\frac{1/4}{1-1/4}=-\\frac{1}{6}.$$\n选 A。",
      traps: "三点易错：一是把 $\\ln(2+x)$ 的系数写成 $\\dfrac{(-1)^{n-1}}{n2^{n}}$ 却忘了 $\\ln2$ 只占 $a_0$（$n=0$ 项对 $na_{2n}$ 无贡献，可略）；二是指数 $2^{2n}=4^{n}$ 写错成 $2^{n}$；三是只把 $a_{2n}$ 求和而漏乘 $n$。等比求和 $\\sum_{n\\ge1}4^{-n}=\\frac13$，再乘 $-\\frac12$ 得 $-\\frac16$。",
      hint: "先把 $\\ln(2+x)$ 展成 $\\sum a_nx^{n}$ 读出 $a_n$，再取偶数下标、乘 $n$，最后按公比 $\\frac14$ 的等比级数求和。",
      src: { file: "参考文件/真题/数学/5、【1987-2025年】考研数学三真题/2024年考研数学三真题.pdf", page: 1, no: "一(4)", note: "题面取自 m3-2024-p1.png 亲读；答案与 2024 答案 PDF p1 对拍（册上选 A），并独立重推校验。" }
    },
    {
      id: "m3-2024-8", origin: "year", year: 2024, no: "一(8)", type: "estimate", star: 3, school: "全国硕士研究生招生考试-数学三 2024 年",
      tags: ["zt04"],
      stem: "设随机变量 $X$ 的概率密度为 $f(x)=\\begin{cases}6x(1-x),&0<x<1,\\\\ 0,&\\text{其他},\\end{cases}$ 则 $X$ 的三阶中心矩 $E(X-EX)^{3}=$（ ）",
      options: ["$-\\dfrac{1}{32}$","$0$","$\\dfrac{1}{10}$","$\\dfrac{1}{2}$"],
      answer: "选 B。\n$$EX=\\int_{0}^{1}x\\cdot6x(1-x)\\,\\mathrm{d}x=6\\left(\\frac{1}{3}-\\frac{1}{4}\\right)=\\frac{1}{2}.$$\n密度满足 $f(1-x)=6(1-x)x=f(x)$，即关于 $x=\\dfrac12$ 对称，故 $X-\\dfrac12$ 与 $\\dfrac12-X$ 同分布，其奇数阶矩为零：\n$$E\\left(X-\\frac{1}{2}\\right)^{3}=\\int_{0}^{1}6x(1-x)\\left(x-\\frac{1}{2}\\right)^{3}\\mathrm{d}x=0.$$\n（也可直接换元 $t=x-\\dfrac12$：被积函数为 $6\\left(\\dfrac14-t^{2}\\right)t^{3}$，是 $t$ 的奇函数，在对称区间 $\\left[-\\dfrac12,\\dfrac12\\right]$ 上积分为 0。）故选 B。",
      traps: "误以为「三阶中心矩」要求先算出 $EX$ 再硬积，算错符号或漏项；也容易把 $E(X-EX)^{3}$ 当作 $EX^{3}-(EX)^{3}$ 直接展开出错。本题的关键是看到密度关于 $x=\\frac12$ 对称，三阶中心矩必为 0（一、三阶中心矩为零与对称性等价）。",
      hint: "先算 $EX=\\frac12$，观察 $f(1-x)=f(x)$ 的对称性，就知道所有奇数阶中心矩为 0。",
      src: { file: "参考文件/真题/数学/5、【1987-2025年】考研数学三真题/2024年考研数学三真题.pdf", page: 3, no: "一(8)", note: "题面取自 m3-2024-p3.png 亲读（题干起于 p2 末行、选项在 p3 首行）；答案与 2024 答案 PDF p2 对拍（册上选 B），并独立重推校验。" }
    },
    {
      id: "m3-2024-9", origin: "year", year: 2024, no: "一(9)", type: "estimate", star: 3, school: "全国硕士研究生招生考试-数学三 2024 年",
      tags: ["zt04"],
      stem: "设随机变量 $X,Y$ 相互独立，且 $X\\sim N(0,2)$，$Y\\sim N(-1,1)$，记 $p_1=P\\{2X-Y>0\\}$，$p_2=P\\{X-2Y>1\\}$，则（ ）",
      options: ["$p_1>p_2>\\dfrac{1}{2}$","$p_2>p_1>\\dfrac{1}{2}$","$p_1<p_2<\\dfrac{1}{2}$","$p_2<p_1<\\dfrac{1}{2}$"],
      answer: "选 B。由独立性\n$$E(2X-Y)=0-(-1)=1,\\qquad D(2X-Y)=4\\cdot2+1=9,$$\n故 $2X-Y\\sim N(1,9)$，\n$$p_1=P\\{2X-Y>0\\}=1-\\Phi\\left(\\frac{0-1}{3}\\right)=\\Phi\\left(\\frac13\\right).$$\n又\n$$E(X-2Y)=0-2(-1)=2,\\qquad D(X-2Y)=2+4\\cdot1=6,$$\n故 $X-2Y\\sim N(2,6)$，\n$$p_2=P\\{X-2Y>1\\}=1-\\Phi\\left(\\frac{1-2}{\\sqrt6}\\right)=\\Phi\\left(\\frac{1}{\\sqrt6}\\right).$$\n由 $\\dfrac{1}{\\sqrt6}\\approx0.408>\\dfrac13\\approx0.333$ 及 $\\Phi$ 单调增，得 $p_2>p_1>\\Phi(0)=\\dfrac12$，选 B。",
      traps: "方差算错是主要失分点：$D(2X-Y)=4DX+DY$（独立相加，不是相减），$D(X-2Y)=DX+4DY$；另外 $Y$ 的均值是 $-1$，$E(2X-Y)=1$、$E(X-2Y)=2$ 的符号容易搞反，一旦把 $E(2X-Y)$ 写成 $-1$，$p_1=\\Phi(-\\frac13)$ 就会小于 $\\frac12$ 而误选 (C)(D)。",
      hint: "分别把 $2X-Y$ 与 $X-2Y$ 化成 $N(\\mu,\\sigma^{2})$，再统一写成 $1-\\Phi(\\cdot)=\\Phi(\\cdot)$ 的形式，比较括号内数值大小。",
      src: { file: "参考文件/真题/数学/5、【1987-2025年】考研数学三真题/2024年考研数学三真题.pdf", page: 3, no: "一(9)", note: "题面取自 m3-2024-p3.png 亲读；答案与 2024 答案 PDF p2 对拍（册上选 B），并独立重推校验。" }
    },
    {
      id: "m3-2024-10", origin: "year", year: 2024, no: "一(10)", type: "estimate", star: 3, school: "全国硕士研究生招生考试-数学三 2024 年",
      tags: ["zt04"],
      stem: "设随机变量 $X,Y$ 相互独立，且均服从参数为 $\\lambda$ 的指数分布，令 $Z=|X-Y|$，则下列随机变量与 $Z$ 同分布的是（ ）",
      options: ["$X+Y$","$\\dfrac{X+Y}{2}$","$2X$","$X$"],
      answer: "选 D。$X,Y$ 的联合密度为 $\\lambda^{2}\\mathrm{e}^{-\\lambda(x+y)}$（$x>0,y>0$）。对 $z\\ge0$，$Z=|X-Y|$ 的分布函数为\n$$F_Z(z)=P\\{|X-Y|\\le z\\}=2\\int_{0}^{+\\infty}\\lambda\\mathrm{e}^{-\\lambda y}\\mathrm{d}y\\int_{y}^{y+z}\\lambda\\mathrm{e}^{-\\lambda x}\\mathrm{d}x=1-\\mathrm{e}^{-\\lambda z},$$\n即 $Z\\sim E(\\lambda)$，与 $X$ 同分布，选 D。\n（直观解释：指数分布的无记忆性使 $|X-Y|$ 仍服从参数 $\\lambda$ 的指数分布；而 $X+Y$ 服从 $\\Gamma(2,\\lambda)$，$2X$ 服从 $\\Gamma(1,\\lambda/2)$ 的伸缩，均不同分布。）",
      traps: "误选 (A)：直觉上「两个指数相加还是指数」是错的，$X+Y\\sim\\Gamma(2,\\lambda)$，密度为 $\\lambda^{2}y\\mathrm{e}^{-\\lambda y}$。(C) $2X$ 的密度是 $\\frac{\\lambda}{2}\\mathrm{e}^{-\\lambda y/2}$，参数也变了。(B) $(X+Y)/2$ 更不是。只有 $|X-Y|$ 因无记忆性保持 $E(\\lambda)$。",
      hint: "直接算 $P\\{|X-Y|\\le z\\}$：在联合密度上对两条射线之间的带状区域积分，或用无记忆性判断 $|X-Y|$ 与 $X$ 同分布。",
      src: { file: "参考文件/真题/数学/5、【1987-2025年】考研数学三真题/2024年考研数学三真题.pdf", page: 3, no: "一(10)", note: "题面取自 m3-2024-p3.png 亲读；答案与 2024 答案 PDF p2-p3 对拍（册上选 D，册用分布函数法），并独立重推校验。" }
    },
    {
      id: "m3-2024-11", origin: "year", year: 2024, no: "二(11)", type: "limit", star: 3, school: "全国硕士研究生招生考试-数学三 2024 年",
      tags: ["int25","zb13"],
      stem: "$x\\to0$ 时，$\\int_{0}^{x}\\dfrac{(1+t^{2})\\sin t^{2}}{1+\\cos^{2}t}\\,\\mathrm{d}t$ 与 $x^{k}$ 是同阶无穷小，则 $k=$______.",
      answer: "$3$。当 $t\\to0$ 时\n$$\\frac{(1+t^{2})\\sin t^{2}}{1+\\cos^{2}t}\\sim\\frac{1\\cdot t^{2}}{1+1}=\\frac{t^{2}}{2},$$\n故\n$$\\int_{0}^{x}\\frac{(1+t^{2})\\sin t^{2}}{1+\\cos^{2}t}\\mathrm{d}t\\sim\\int_{0}^{x}\\frac{t^{2}}{2}\\mathrm{d}t=\\frac{x^{3}}{6},$$\n与 $x^{3}$ 同阶，所以 $k=3$。",
      traps: "把 $\\sin t^{2}$ 当成 $\\sin^{2}t$（两者都 $\\sim t^{2}$，本题恰好同阶，但若被积函数是 $\\sin t^{3}$ 就会差一阶）；也可能忘记分母 $1+\\cos^{2}t\\to2$ 这一常数因子，直接判成 $x^{2}$。等价无穷小只能在积分号内先化到最低阶，再积分升一阶。",
      hint: "先对被积函数作等价无穷小替换（$\\sin t^{2}\\sim t^{2}$，$1+\\cos^{2}t\\to2$），得 $\\sim\\frac{t^{2}}{2}$，再积分得 $\\frac{x^{3}}{6}$。",
      src: { file: "参考文件/真题/数学/5、【1987-2025年】考研数学三真题/2024年考研数学三真题.pdf", page: 3, no: "二(11)", note: "题面取自 m3-2024-p3.png 亲读；答案与 2024 答案 PDF p3 对拍（册上 3），并独立重推校验。" }
    },
    {
      id: "m3-2024-12", origin: "year", year: 2024, no: "二(12)", type: "integral", star: 3, school: "全国硕士研究生招生考试-数学三 2024 年",
      tags: ["gx34","int19"],
      stem: "$\\int_{2}^{+\\infty}\\dfrac{5}{x^{4}+3x^{2}-4}\\,\\mathrm{d}x=$______.",
      answer: "$\\dfrac{1}{2}\\ln3-\\dfrac{\\pi}{8}$。因\n$$x^{4}+3x^{2}-4=(x^{2}-1)(x^{2}+4),\\qquad \\frac{5}{(x^{2}-1)(x^{2}+4)}=\\frac{1}{x^{2}-1}-\\frac{1}{x^{2}+4},$$\n故\n$$\\int_{2}^{+\\infty}\\frac{5\\,\\mathrm{d}x}{x^{4}+3x^{2}-4}=\\left[\\frac12\\ln\\frac{x-1}{x+1}-\\frac12\\arctan\\frac{x}{2}\\right]_{2}^{+\\infty}.$$\n$x\\to+\\infty$ 时该式趋于 $0-\\dfrac12\\cdot\\dfrac{\\pi}{2}=-\\dfrac{\\pi}{4}$；$x=2$ 时为 $\\dfrac12\\ln\\dfrac13-\\dfrac12\\cdot\\dfrac{\\pi}{4}=-\\dfrac12\\ln3-\\dfrac{\\pi}{8}$。相减得\n$$\\int_{2}^{+\\infty}\\frac{5\\,\\mathrm{d}x}{x^{4}+3x^{2}-4}=\\frac12\\ln3-\\frac{\\pi}{8}.$$",
      traps: "部分分式设成 $\\dfrac{A}{x-1}+\\dfrac{B}{x+1}+\\dfrac{Cx+D}{x^{2}+4}$ 容易算错常数；本题按 $x^{2}$ 整体拆分最快。另一个坑是上限代值：$\\arctan\\dfrac{x}{2}\\to\\dfrac{\\pi}{2}$ 时还要乘前面的 $\\dfrac12$，漏乘会得到 $-\\dfrac{\\pi}{4}$ 之外的错误常数。",
      hint: "把分母分解为 $(x^{2}-1)(x^{2}+4)$，通分后拆成 $\\dfrac{1}{x^{2}-1}-\\dfrac{1}{x^{2}+4}$，再分别用 $\\frac12\\ln\\frac{x-1}{x+1}$ 与 $\\frac12\\arctan\\frac{x}{2}$。",
      src: { file: "参考文件/真题/数学/5、【1987-2025年】考研数学三真题/2024年考研数学三真题.pdf", page: 3, no: "二(12)", note: "题面取自 m3-2024-p3.png 亲读；答案与 2024 答案 PDF p3 对拍（册上 $\\frac12\\ln3-\\frac\\pi8$），并独立重推校验。" }
    },
    {
      id: "m3-2024-13", origin: "year", year: 2024, no: "二(13)", type: "multivar", star: 3, school: "全国硕士研究生招生考试-数学三 2024 年",
      tags: ["multi03","tp06"],
      stem: "$z=2x^{3}-9x^{2}-6y^{4}+12x+24y$ 的极值点是______.",
      answer: "$(1,1)$。令\n$$z_x=6x^{2}-18x+12=6(x-1)(x-2)=0,\\qquad z_y=-24y^{3}+24=0,$$\n得驻点 $(1,1)$ 与 $(2,1)$。又\n$$A=z_{xx}=12x-18,\\qquad B=z_{xy}=0,\\qquad C=z_{yy}=-72y^{2}.$$\n在 $(1,1)$ 处：$A=-6<0$，$AC-B^{2}=432>0$，为极大值点（极大值 $z(1,1)=2-9-6+12+24=23$）；在 $(2,1)$ 处：$A=6>0$，$AC-B^{2}=6\\times(-72)=-432<0$，不是极值点。故极值点为 $(1,1)$。",
      traps: "只解出驻点就答两个点：$(2,1)$ 处 $AC-B^{2}<0$ 是鞍点，必须用二阶判别式剔除。另外 $z_y=0$ 给的是 $y^{3}=1$ 即 $y=1$（实根唯一），不要漏掉 $x$ 的两个根。",
      hint: "先解 $z_x=z_y=0$ 得两个驻点，再逐点算 $A,C,B$ 与 $AC-B^{2}$ 判断。",
      src: { file: "参考文件/真题/数学/5、【1987-2025年】考研数学三真题/2024年考研数学三真题.pdf", page: 3, no: "二(13)", note: "题面取自 m3-2024-p3.png 亲读；答案与 2024 答案 PDF p3 对拍（册上 $(1,1)$），并独立重推校验。" }
    },
    {
      id: "m3-2024-14", origin: "year", year: 2024, no: "二(14)", type: "econ", star: 3, school: "全国硕士研究生招生考试-数学三 2024 年",
      tags: ["kn11","ext07"],
      stem: "设某商品价格 $P=\\begin{cases}25-0.25Q,&Q\\le20,\\\\ 35-0.75Q,&Q>20,\\end{cases}$ 其中 $Q$ 为产量，总成本函数 $C=150+5Q+0.25Q^{2}$，求利润的最大值为______万元。",
      answer: "$50$。利润 $L=PQ-C$，分段讨论。\n当 $0\\le Q\\le20$ 时\n$$L=(25-0.25Q)Q-\\left(150+5Q+0.25Q^{2}\\right)=-0.5Q^{2}+20Q-150=-0.5(Q-20)^{2}+50,$$\n在 $Q=20$ 处取最大值 $L(20)=50$。\n当 $Q>20$ 时\n$$L=(35-0.75Q)Q-\\left(150+5Q+0.25Q^{2}\\right)=-Q^{2}+30Q-150=-(Q-15)^{2}+75,$$\n它在 $Q>20$ 上单调减，故该段的上确界为 $\\lim\\limits_{Q\\to20^{+}}L=50$。\n两段比较，最大利润为 $50$ 万元。",
      traps: "只在第二段配方后看到顶点 $Q=15$ 处 $75$，就把 $75$ 当答案：$Q=15$ 不在 $Q>20$ 的区间内，第二段的顶点是区间外的假极值。正确做法是逐段求区间内的最值再比较端点值。另外需求函数在 $Q=20$ 处不连续（$25-5=20$ 与 $35-15=20$ 恰好相等，价格连续），利润函数也连续，端点 50 必须算。",
      hint: "分段写出 $L(Q)$，各自配方看顶点是否落在本段内；不在段内就取端点，最后两段比较。",
      src: { file: "参考文件/真题/数学/5、【1987-2025年】考研数学三真题/2024年考研数学三真题.pdf", page: 3, no: "二(14)", note: "题面取自 m3-2024-p3.png 亲读；答案与 2024 答案 PDF p3 对拍（册上 50），并独立重推校验。" }
    },
    {
      id: "m3-2024-15", origin: "year", year: 2024, no: "二(15)", type: "eigen", star: 3, school: "全国硕士研究生招生考试-数学三 2024 年",
      tags: ["la11","zb11"],
      stem: "$\\boldsymbol{A}$ 为 3 阶矩阵，$\\boldsymbol{A}^{*}$ 为其伴随矩阵，$\\boldsymbol{E}$ 为单位矩阵，且 $r(2\\boldsymbol{E}-\\boldsymbol{A})=1$，$r(\\boldsymbol{E}+\\boldsymbol{A})=2$，则 $\\left|\\boldsymbol{A}^{*}\\right|=$______.",
      answer: "$16$。由 $r(2\\boldsymbol{E}-\\boldsymbol{A})=1$ 知 $(2\\boldsymbol{E}-\\boldsymbol{A})\\boldsymbol{x}=\\boldsymbol{0}$ 的解空间维数为 $3-1=2$，即 $\\lambda=2$ 的几何重数为 2，从而 $\\lambda=2$ 至少是二重特征值；由 $r(\\boldsymbol{E}+\\boldsymbol{A})=2$ 知 $(-\\boldsymbol{E}-\\boldsymbol{A})\\boldsymbol{x}=\\boldsymbol{0}$ 的解空间维数为 $3-2=1$，即 $\\lambda=-1$ 的几何重数为 1。三阶矩阵的三个特征值（计重数）只能全在这两组里，故\n$$\\lambda_1=\\lambda_2=2,\\qquad \\lambda_3=-1,\\qquad |\\boldsymbol{A}|=2\\cdot2\\cdot(-1)=-4.$$\n于是\n$$\\left|\\boldsymbol{A}^{*}\\right|=|\\boldsymbol{A}|^{n-1}=|\\boldsymbol{A}|^{2}=16.$$",
      traps: "把 $r(2\\boldsymbol{E}-\\boldsymbol{A})=1$ 读成「$\\lambda=2$ 是单特征值」（秩越小重数越大，秩 1 恰说明重数 $\\ge2$）；或误用 $|\\boldsymbol{A}^{*}|=|\\boldsymbol{A}|$、$|\\boldsymbol{A}|^{n}$。正确公式是 $|\\boldsymbol{A}^{*}|=|\\boldsymbol{A}|^{n-1}$（本题 $n=3$）。还要注意 $|\\boldsymbol{A}|=-4\\ne0$ 才能用伴随矩阵公式，若 $|\\boldsymbol{A}|=0$ 则 $|\\boldsymbol{A}^{*}|=0$。",
      hint: "秩条件翻译成特征值的几何重数：$r(k\\boldsymbol{E}-\\boldsymbol{A})=3-m$ 说明 $k$ 至少是 $m$ 重特征值；凑齐三个特征值后算 $|\\boldsymbol{A}|$，再用 $|\\boldsymbol{A}^{*}|=|\\boldsymbol{A}|^{n-1}$。",
      src: { file: "参考文件/真题/数学/5、【1987-2025年】考研数学三真题/2024年考研数学三真题.pdf", page: 3, no: "二(15)", note: "题面取自 m3-2024-p3.png 亲读；答案与 2024 答案 PDF p3 对拍（册上 16），并独立重推校验。" }
    },
    {
      id: "m3-2024-16", origin: "year", year: 2024, no: "二(16)", type: "estimate", star: 3, school: "全国硕士研究生招生考试-数学三 2024 年",
      tags: ["zt04"],
      stem: "设随机试验每次成功的概率为 $p$，进行 3 次独立重复试验，在至少试验成功 1 次的条件下三次试验全部成功的概率为 $\\dfrac{4}{13}$，则 $p=$______.",
      answer: "$\\dfrac{2}{3}$。记 $A$=「三次全部成功」，$B$=「至少成功 1 次」，则 $P(A)=p^{3}$，$P(B)=1-(1-p)^{3}=3p-3p^{2}+p^{3}$，且 $A\\subset B$，故\n$$P(A\\mid B)=\\frac{P(AB)}{P(B)}=\\frac{p^{3}}{1-(1-p)^{3}}=\\frac{4}{13}.$$\n于是 $13p^{3}=4(3p-3p^{2}+p^{3})$，即\n$$9p^{3}+12p^{2}-12p=0\\ \\Longrightarrow\\ 3p\\left(3p^{2}+4p-4\\right)=0.$$\n由 $0<p<1$（$p\\ne0$）解得 $3p^{2}+4p-4=0$，即 $p=\\dfrac{-4+8}{6}=\\dfrac23$（另一根 $p=-2$ 舍去）。",
      traps: "把条件概率写成 $\\dfrac{p^{3}}{1-(1-p)^{3}}$ 之外的 $\\dfrac{p^{3}}{3p}$、$\\dfrac{p^{3}}{p}$ 等；也可能解出 $p=-2$ 不检验就保留。$A\\subset B$ 时 $P(AB)=P(A)$，这一步要用上。三次独立重复中「至少一次成功」的概率是 $1-(1-p)^{3}=3p-3p^{2}+p^{3}$，展开后能与 $p^{3}$ 约出三次方程。",
      hint: "用条件概率定义 $P(A\\mid B)=\\frac{p^{3}}{1-(1-p)^{3}}$，展开分母后整理成关于 $p$ 的三次方程，注意 $0<p<1$ 舍去负根。",
      src: { file: "参考文件/真题/数学/5、【1987-2025年】考研数学三真题/2024年考研数学三真题.pdf", page: 3, no: "二(16)", note: "题面取自 m3-2024-p3.png 亲读；答案与 2024 答案 PDF p3 对拍（册上 $\\frac23$），并独立重推校验。" }
    },
    {
      id: "m3-2024-17", origin: "year", year: 2024, no: "三(17)", type: "dblint", star: 4, school: "全国硕士研究生招生考试-数学三 2024 年",
      tags: ["dbi01","ext27"],
      stem: "区域 $D$ 位于第一象限，由 $xy=\\dfrac13$，$xy=3$，$y=\\dfrac13x$，$y=3x$ 围成，计算 $\\iint\\limits_{D}(1+x-y)\\,\\mathrm{d}x\\mathrm{d}y$。",
      answer: "$\\dfrac{8}{3}\\ln3$。区域 $D$ 关于直线 $y=x$ 对称（四条边界在该对称下互换：$xy=c$ 不变，$y=\\frac13x$ 与 $y=3x$ 互换），故\n$$\\iint\\limits_{D}x\\,\\mathrm{d}x\\mathrm{d}y=\\iint\\limits_{D}y\\,\\mathrm{d}x\\mathrm{d}y\\ \\Longrightarrow\\ \\iint\\limits_{D}(1+x-y)\\mathrm{d}x\\mathrm{d}y=\\iint\\limits_{D}1\\,\\mathrm{d}x\\mathrm{d}y=S_D.$$\n作变换 $u=xy,\\ v=\\dfrac{y}{x}$，则 $x=\\sqrt{\\dfrac{u}{v}},\\ y=\\sqrt{uv}$，\n$$\\left|\\frac{\\partial(x,y)}{\\partial(u,v)}\\right|=\\frac{1}{2v},$$\n区域化为 $\\dfrac13\\le u\\le3$，$\\dfrac13\\le v\\le3$，于是\n$$S_D=\\int_{1/3}^{3}\\mathrm{d}u\\int_{1/3}^{3}\\frac{1}{2v}\\mathrm{d}v=\\frac{8}{3}\\cdot\\frac{1}{2}\\left(\\ln3-\\ln\\frac13\\right)=\\frac{8}{3}\\ln3.$$",
      traps: "三个坑：一是不用对称性硬算 $\\iint x$ 与 $\\iint y$，代换后要处理 $\\sqrt{u/v}$ 这类项，极易算错；二是雅可比行列式漏掉 $\\dfrac{1}{2v}$ 中的 $\\dfrac{1}{2}$ 或把 $v$ 当成常数；三是区域的 $v$ 范围写成 $\\left[\\dfrac13,3\\right]$ 之外的值（$y=\\frac13x\\Rightarrow v=\\frac13$，$y=3x\\Rightarrow v=3$）。",
      hint: "先用对称性把 $\\iint x$ 与 $\\iint y$ 抵消，只剩面积；再用 $u=xy,\\ v=y/x$ 把双曲线与射线围成的区域变成矩形，别忘雅可比 $\\frac{1}{2v}$。",
      src: { file: "参考文件/真题/数学/5、【1987-2025年】考研数学三真题/2024年考研数学三真题.pdf", page: 4, no: "三(17)", note: "题面取自 m3-2024-p4.png 亲读；答案与 2024 答案 PDF p4 对拍（册上 $\\frac83\\ln3$，册把 $D$ 拆成两块按 $y$ 积分），并独立用 $u=xy,v=y/x$ 重推校验。" }
    },
    {
      id: "m3-2024-18", origin: "year", year: 2024, no: "三(18)", type: "multivar", star: 4, school: "全国硕士研究生招生考试-数学三 2024 年",
      tags: ["multi02","multi01"],
      stem: "函数 $z=z(x,y)$ 由 $z+\\mathrm{e}^{x}-y\\ln(1+z^{2})=0$ 确定，求 $\\left.\\left(\\dfrac{\\partial^{2}z}{\\partial x^{2}}+\\dfrac{\\partial^{2}z}{\\partial y^{2}}\\right)\\right|_{(0,0)}$。",
      answer: "$-1-2\\ln2$。令 $x=y=0$ 得 $z(0,0)=-1$。\n对 $x$ 求偏导：\n$$z_x+\\mathrm{e}^{x}-\\frac{2yz}{1+z^{2}}z_x=0,$$\n代入 $(0,0,-1)$ 得 $z_x+1=0$，即 $z_x(0,0)=-1$。\n对 $y$ 求偏导：\n$$z_y-\\ln(1+z^{2})-\\frac{2yz}{1+z^{2}}z_y=0,$$\n代入得 $z_y-\\ln2=0$，即 $z_y(0,0)=\\ln2$。\n第一式再对 $x$ 求偏导，在 $(0,0)$ 处（$y=0$，含 $y$ 的项全消失）得\n$$z_{xx}+\\mathrm{e}^{x}=0\\ \\Longrightarrow\\ z_{xx}(0,0)=-1.$$\n第二式写成 $z_y=\\ln(1+z^{2})+\\dfrac{2yz}{1+z^{2}}z_y$，两端再对 $y$ 求导：\n$$z_{yy}=\\frac{2zz_y}{1+z^{2}}+\\left[\\frac{2z}{1+z^{2}}+\\frac{2y(1-z^{2})z_y}{(1+z^{2})^{2}}\\right]z_y+\\frac{2yz}{1+z^{2}}z_{yy},$$\n在 $(0,0)$ 处 $z=-1,\\ z_y=\\ln2$，前两项为 $-\\ln2$ 与 $(-1)\\ln2=-\\ln2$，第三项为 $0$，故\n$$z_{yy}(0,0)=-2\\ln2.$$\n所以\n$$\\left.\\left(\\frac{\\partial^{2}z}{\\partial x^{2}}+\\frac{\\partial^{2}z}{\\partial y^{2}}\\right)\\right|_{(0,0)}=-1-2\\ln2.$$",
      traps: "最隐蔽的错是求 $z_{yy}$ 时漏掉「系数里含 $y$ 的那一项求导后仍留一个因子」：把 $z_y-\\ln(1+z^{2})-\\frac{2yz}{1+z^{2}}z_y=0$ 直接对 $y$ 求导，$\\left(\\frac{2yz}{1+z^{2}}\\right)'_y$ 在 $y=0$ 处等于 $\\frac{2z}{1+z^{2}}=-1$，它乘上 $z_y=\\ln2$ 贡献 $-\\ln2$，漏掉就只得 $-\\ln2$ 而错答 $-1-\\ln2$。另外 $z(0,0)=-1$ 必须先算，所有二阶导都依赖它。",
      hint: "先定 $z(0,0)=-1$，再分别对 $x$、$y$ 求一阶偏导（都取 $y=0$ 化简）；求 $z_{yy}$ 时把方程整理成显式 $z_y=\\cdots$ 再对 $y$ 求导，注意系数 $\\frac{2yz}{1+z^{2}}$ 的导数。",
      src: { file: "参考文件/真题/数学/5、【1987-2025年】考研数学三真题/2024年考研数学三真题.pdf", page: 4, no: "三(18)", note: "题面取自 m3-2024-p4.png 亲读；答案与 2024 答案 PDF p4 对拍（册上 $-1-2\\ln2$），并独立重推校验。" }
    },
    {
      id: "m3-2024-19", origin: "year", year: 2024, no: "三(19)", type: "integral", star: 3, school: "全国硕士研究生招生考试-数学三 2024 年",
      tags: ["int28","int33"],
      stem: "设 $t>0$，平面区域 $D$ 由曲线 $y=x\\mathrm{e}^{-2x}$ 与直线 $x=t$，$x=2t$ 及 $x$ 轴围成，记区域 $D$ 的面积为 $S(t)$，求 $S(t)$ 的最大值。",
      answer: "$S(t)$ 在 $t=\\ln2$ 处取最大值 $S(\\ln2)=\\dfrac{\\ln2}{16}+\\dfrac{3}{64}$。\n当 $x>0$ 时 $y=x\\mathrm{e}^{-2x}>0$，故\n$$S(t)=\\int_{t}^{2t}x\\mathrm{e}^{-2x}\\mathrm{d}x.$$\n对 $t$ 求导（变限积分）得\n$$S'(t)=2\\cdot2t\\mathrm{e}^{-4t}-t\\mathrm{e}^{-2t}=t\\mathrm{e}^{-4t}\\left(4-\\mathrm{e}^{2t}\\right).$$\n当 $0<t<\\ln2$ 时 $\\mathrm{e}^{2t}<4$，$S'(t)>0$；当 $t>\\ln2$ 时 $S'(t)<0$，故 $t=\\ln2$ 是唯一极大值点即最大值点。由\n$$\\int x\\mathrm{e}^{-2x}\\mathrm{d}x=-\\frac{x}{2}\\mathrm{e}^{-2x}-\\frac14\\mathrm{e}^{-2x}+C$$\n得\n$$S(\\ln2)=\\left[-\\frac{x}{2}\\mathrm{e}^{-2x}-\\frac14\\mathrm{e}^{-2x}\\right]_{\\ln2}^{2\\ln2}=\\left(-\\frac{\\ln2}{16}-\\frac{1}{64}\\right)-\\left(-\\frac{\\ln2}{8}-\\frac{1}{16}\\right)=\\frac{\\ln2}{16}+\\frac{3}{64}.$$",
      traps: "求 $S'(t)$ 时只对上限求导、漏掉下限项（下限 $t$ 也要乘 $-1$），会得到 $S'=4t\\mathrm{e}^{-4t}$ 而无驻点。另外 $\\int x\\mathrm{e}^{-2x}\\mathrm{d}x$ 的分部积分常数 $\\dfrac14$ 容易写成 $\\dfrac12$。最后要说明 $\\ln2$ 是极大值点，因为 $t>0$ 的区间上只有这一个驻点，极大即最大。",
      hint: "$S(t)=\\int_t^{2t}x\\mathrm{e}^{-2x}\\mathrm{d}x$，用变限积分求导（上限、下限各一项）得 $S'=t\\mathrm{e}^{-4t}(4-\\mathrm{e}^{2t})$，再分部积分算 $S(\\ln2)$。",
      src: { file: "参考文件/真题/数学/5、【1987-2025年】考研数学三真题/2024年考研数学三真题.pdf", page: 4, no: "三(19)", note: "题面取自 m3-2024-p4.png 亲读；答案与 2024 答案 PDF p4 对拍（册上 $t=\\ln2$、$\\frac{\\ln2}{16}+\\frac{3}{64}$），并独立重推校验。" }
    },
    {
      id: "m3-2024-20", origin: "year", year: 2024, no: "三(20)", type: "proof", star: 4, school: "全国硕士研究生招生考试-数学三 2024 年",
      tags: ["mvt04","tp03"],
      stem: "设 $f(x)$ 具有二阶导数，且 $f'(0)=f'(1)$，$|f''(x)|\\le1$，证明：\n（1）$x\\in(0,1)$，$\\left|f(x)-f(0)(1-x)-f(1)x\\right|\\le\\dfrac{x(1-x)}{2}$；\n（2）$\\left|\\displaystyle\\int_{0}^{1}f(x)\\mathrm{d}x-\\dfrac{f(0)+f(1)}{2}\\right|\\le\\dfrac{1}{12}$。",
      answer: "（1）对 $x\\in(0,1)$，分别以 $0$ 与 $1$ 为中心写带拉格朗日余项的泰勒公式，存在 $\\xi_1,\\xi_2\\in(0,1)$ 使\n$$f(x)=f(0)+f'(0)x+\\frac{f''(\\xi_1)}{2}x^{2},$$\n$$f(x)=f(1)+f'(1)(x-1)+\\frac{f''(\\xi_2)}{2}(x-1)^{2}.$$\n第一式乘 $(1-x)$、第二式乘 $x$ 相加，利用 $f'(0)=f'(1)$ 使一阶项抵消：\n$$f(x)=f(0)(1-x)+f(1)x+\\frac{1-x}{2}f''(\\xi_1)x^{2}+\\frac{x}{2}f''(\\xi_2)(x-1)^{2}.$$\n由 $|f''|\\le1$ 及 $x\\in(0,1)$ 得\n$$\\left|f(x)-f(0)(1-x)-f(1)x\\right|\\le\\frac{1-x}{2}x^{2}+\\frac{x}{2}(1-x)^{2}=\\frac{x(1-x)}{2}\\left[x+(1-x)\\right]=\\frac{x(1-x)}{2}.$$\n（2）由（1），把 $f(0)(1-x)+f(1)x$ 移项后积分：\n$$\\int_{0}^{1}\\left[f(0)(1-x)+f(1)x\\right]\\mathrm{d}x=f(0)\\cdot\\frac12+f(1)\\cdot\\frac12=\\frac{f(0)+f(1)}{2},$$\n于是\n$$\\left|\\int_{0}^{1}f(x)\\mathrm{d}x-\\frac{f(0)+f(1)}{2}\\right|=\\left|\\int_{0}^{1}\\left[f(x)-f(0)(1-x)-f(1)x\\right]\\mathrm{d}x\\right|\\le\\int_{0}^{1}\\frac{x(1-x)}{2}\\mathrm{d}x=\\frac{1}{12}.$$",
      traps: "（1）常见错法只用其中一个泰勒式（如以 0 为中心）得到 $\\dfrac{x^{2}}{2}$ 的界，得不到 $\\dfrac{x(1-x)}{2}$；必须两次展开、按 $(1-x)$ 与 $x$ 加权相加，才能让一阶项因 $f'(0)=f'(1)$ 抵消并出现 $x(1-x)$。（2）要先把 $f(0)(1-x)+f(1)x$ 的积分算成 $\\dfrac{f(0)+f(1)}{2}$（各占 $\\dfrac12$），再用（1）的结论逐项放大。",
      hint: "（1）在 $0$ 与 $1$ 两点各展开一次、分别乘 $(1-x)$ 与 $x$ 相加；（2）把结论（1）在 $[0,1]$ 上积分，右边 $\\int_0^1\\frac{x(1-x)}{2}\\mathrm{d}x=\\frac1{12}$。",
      src: { file: "参考文件/真题/数学/5、【1987-2025年】考研数学三真题/2024年考研数学三真题.pdf", page: 4, no: "三(20)", note: "题面取自 m3-2024-p4.png 亲读；答案与 2024 答案 PDF p4-p5 对拍（册上同一泰勒加权证法），并独立重推校验。" }
    },
    {
      id: "m3-2024-21", origin: "year", year: 2024, no: "三(21)", type: "linalg", star: 4, school: "全国硕士研究生招生考试-数学三 2024 年",
      tags: ["zb08","kn57"],
      stem: "已知矩阵 $\\boldsymbol{A}=\\begin{bmatrix}1&-1&0&-1\\\\ 1&1&0&3\\\\ 2&1&2&6\\end{bmatrix}$，$\\boldsymbol{B}=\\begin{bmatrix}1&0&1&2\\\\ 1&-1&a&a-1\\\\ 2&-3&2&-2\\end{bmatrix}$，向量 $\\boldsymbol{\\alpha}=\\begin{pmatrix}0\\\\2\\\\3\\end{pmatrix}$，$\\boldsymbol{\\beta}=\\begin{pmatrix}1\\\\0\\\\-1\\end{pmatrix}$。\n（1）证明方程组 $\\boldsymbol{A}\\boldsymbol{x}=\\boldsymbol{\\alpha}$ 的解是 $\\boldsymbol{B}\\boldsymbol{x}=\\boldsymbol{\\beta}$ 的解；\n（2）若方程组 $\\boldsymbol{A}\\boldsymbol{x}=\\boldsymbol{\\alpha}$ 与 $\\boldsymbol{B}\\boldsymbol{x}=\\boldsymbol{\\beta}$ 有不同的解，求 $a$。",
      answer: "（1）对增广矩阵 $(\\boldsymbol{A}:\\boldsymbol{\\alpha})$ 作初等行变换：\n$$(\\boldsymbol{A}:\\boldsymbol{\\alpha})=\\begin{bmatrix}1&-1&0&-1&0\\\\ 1&1&0&3&2\\\\ 2&1&2&6&3\\end{bmatrix}\\longrightarrow\\begin{bmatrix}1&0&0&1&1\\\\ 0&1&0&2&1\\\\ 0&0&1&1&0\\end{bmatrix},$$\n故 $\\boldsymbol{A}\\boldsymbol{x}=\\boldsymbol{\\alpha}$ 的通解为\n$$\\boldsymbol{x}=\\begin{pmatrix}1\\\\1\\\\0\\\\0\\end{pmatrix}+k\\begin{pmatrix}-1\\\\-2\\\\-1\\\\1\\end{pmatrix},\\qquad k\\in\\mathbb{R}.$$\n把它代入 $\\boldsymbol{B}\\boldsymbol{x}$：记 $\\boldsymbol{x}=(1-k,\\ 1-2k,\\ -k,\\ k)^{\\mathrm{T}}$，则\n$$\\boldsymbol{B}\\boldsymbol{x}=\\begin{bmatrix}1&0&1&2\\\\ 1&-1&a&a-1\\\\ 2&-3&2&-2\\end{bmatrix}\\begin{pmatrix}1-k\\\\1-2k\\\\-k\\\\k\\end{pmatrix}=\\begin{pmatrix}1\\\\0\\\\-1\\end{pmatrix}=\\boldsymbol{\\beta},$$\n其中第二行 $(1-k)-(1-2k)-ak+(a-1)k=0$、第三行 $2(1-k)-3(1-2k)-2k-2k=-1$，与 $a$ 无关。故 $\\boldsymbol{A}\\boldsymbol{x}=\\boldsymbol{\\alpha}$ 的解都是 $\\boldsymbol{B}\\boldsymbol{x}=\\boldsymbol{\\beta}$ 的解。\n（2）由（1），$\\boldsymbol{A}\\boldsymbol{x}=\\boldsymbol{\\alpha}$ 的解集含于 $\\boldsymbol{B}\\boldsymbol{x}=\\boldsymbol{\\beta}$ 的解集，两者「有不同的解」即后者的解集更大，等价于 $r(\\boldsymbol{B})<3$。对 $\\boldsymbol{B}$ 作初等行变换（$r_2-r_1,\\ r_3-2r_1$）：\n$$\\boldsymbol{B}\\longrightarrow\\begin{bmatrix}1&0&1&2\\\\ 0&-1&a-1&a-3\\\\ 0&-3&0&-6\\end{bmatrix},$$\n第三行与第二行成比例当且仅当 $3(a-1)=0$ 且 $3(a-3)=-6$，即 $a=1$。故 $a=1$ 时 $r(\\boldsymbol{B})=2<3$，$\\boldsymbol{B}\\boldsymbol{x}=\\boldsymbol{\\beta}$ 有无穷多解且包含 $\\boldsymbol{A}\\boldsymbol{x}=\\boldsymbol{\\alpha}$ 的全部解；$a\\ne1$ 时 $r(\\boldsymbol{B})=3$，$\\boldsymbol{B}\\boldsymbol{x}=\\boldsymbol{\\beta}$ 只有唯一解，与（1）矛盾。所以 $a=1$。",
      traps: "（1）若把 $\\boldsymbol{A}\\boldsymbol{x}=\\boldsymbol{\\alpha}$ 的特解写成 $(1,0,0,0)^{\\mathrm{T}}$ 就代入验证，会算得 $\\boldsymbol{B}\\boldsymbol{x}=(1,1,2)^{\\mathrm{T}}\\ne\\boldsymbol{\\beta}$；正确的特解是 $(1,1,0,0)^{\\mathrm{T}}$（$\\boldsymbol{A}$ 的第一、二列之和）。建议把通解整体代入 $\\boldsymbol{B}\\boldsymbol{x}$ 一次算完。（2）不要试图直接解两个方程组比较解集：由（1）已知包含关系，只需比较秩；$r(\\boldsymbol{B})<3$ 的唯一条件是 $a=1$。",
      hint: "（1）先解出 $\\boldsymbol{A}\\boldsymbol{x}=\\boldsymbol{\\alpha}$ 的通解，整体代入 $\\boldsymbol{B}\\boldsymbol{x}$ 化简；（2）包含关系已知，只需 $r(\\boldsymbol{B})<3$，用初等行变换找掉秩的 $a$。",
      src: { file: "参考文件/真题/数学/5、【1987-2025年】考研数学三真题/2024年考研数学三真题.pdf", page: 4, no: "三(21)", note: "题面取自 m3-2024-p4.png 亲读；答案与 2024 答案 PDF p5-p6 对拍：册上（1）把特解印成 $(1,0,0,0)^{\\mathrm{T}}$，重推为 $(1,1,0,0)^{\\mathrm{T}}$（代入 $\\boldsymbol{A}$ 首列 $(1,1,2)^{\\mathrm{T}}\\ne\\boldsymbol{\\alpha}$，只有 $(1,1,0,0)^{\\mathrm{T}}$ 满足），结论与（2）的 $a=1$ 不受影响；原因系排版漏印第二分量。" }
    },
    {
      id: "m3-2024-22", origin: "year", year: 2024, no: "三(22)", type: "estimate", star: 4, school: "全国硕士研究生招生考试-数学三 2024 年",
      tags: ["zt05","int25"],
      stem: "设总体 $X$ 服从 $[0,\\theta]$ 上的均匀分布，其中 $\\theta\\in(0,+\\infty)$ 为未知参数，$X_1,X_2,\\cdots,X_n$ 是来自总体 $X$ 的简单随机样本，记 $X_{(n)}=\\max\\{X_1,X_2,\\cdots,X_n\\}$，$T_c=cX_{(n)}$。\n（1）求 $c$，使得 $E(T_c)=\\theta$；\n（2）记 $h(c)=E(T_c-\\theta)^{2}$，求 $c$ 使得 $h(c)$ 最小。",
      answer: "（1）$c=\\dfrac{n+1}{n}$。（2）$c=\\dfrac{n+2}{n+1}$。\n（1）$X$ 的分布函数为 $F(x)=\\begin{cases}0,&x<0,\\\\ \\dfrac{x}{\\theta},&0\\le x<\\theta,\\\\ 1,&x\\ge\\theta,\\end{cases}$ 故 $X_{(n)}$ 的分布函数为 $[F(x)]^{n}$，密度\n$$f_{(n)}(x)=\\begin{cases}\\dfrac{nx^{n-1}}{\\theta^{n}},&0\\le x\\le\\theta,\\\\ 0,&\\text{其他}.\\end{cases}$$\n于是\n$$EX_{(n)}=\\int_{0}^{\\theta}x\\cdot\\frac{nx^{n-1}}{\\theta^{n}}\\mathrm{d}x=\\frac{n}{n+1}\\theta,$$\n由 $E(T_c)=\\dfrac{cn}{n+1}\\theta=\\theta$ 得 $c=\\dfrac{n+1}{n}$（无偏）。\n（2）\n$$EX_{(n)}^{2}=\\int_{0}^{\\theta}x^{2}\\cdot\\frac{nx^{n-1}}{\\theta^{n}}\\mathrm{d}x=\\frac{n}{n+2}\\theta^{2},$$\n故\n$$h(c)=E\\left(cX_{(n)}\\right)^{2}-2\\theta E\\left(cX_{(n)}\\right)+\\theta^{2}=\\theta^{2}\\left(\\frac{n}{n+2}c^{2}-\\frac{2n}{n+1}c+1\\right).$$\n这是关于 $c$ 的开口向上的二次函数，顶点在\n$$c=\\frac{\\dfrac{2n}{n+1}}{2\\cdot\\dfrac{n}{n+2}}=\\frac{n+2}{n+1},$$\n故 $c=\\dfrac{n+2}{n+1}$ 时 $h(c)$ 最小（此时均方误差最小，说明无偏估计不一定是均方误差最优）。",
      traps: "求 $X_{(n)}$ 的密度时漏掉 $n$ 的因子（$f_{(n)}=n[F]^{n-1}f$），会得到 $EX_{(n)}=\\dfrac{\\theta}{2}$ 而错答 $c=2$。（2）中 $h(c)=E(cX_{(n)}-\\theta)^{2}=c^{2}EX_{(n)}^{2}-2c\\theta EX_{(n)}+\\theta^{2}$，中间项系数是 $2c\\theta EX_{(n)}$，别漏 $\\theta$。最小化点 $\\dfrac{n+2}{n+1}>1$，与（1）的 $\\dfrac{n+1}{n}$ 不同，两个答案不要混。",
      hint: "先写 $X$ 的分布函数，再 $[F]^{n}$ 求导得 $X_{(n)}$ 的密度；算 $EX_{(n)}$ 与 $EX_{(n)}^{2}$，代入 $h(c)$ 后按二次函数顶点公式求 $c$。",
      src: { file: "参考文件/真题/数学/5、【1987-2025年】考研数学三真题/2024年考研数学三真题.pdf", page: 4, no: "三(22)", note: "题面取自 m3-2024-p4.png 亲读；答案与 2024 答案 PDF p6 对拍（册上 $\\frac{n+1}{n}$、$\\frac{n+2}{n+1}$），并独立重推校验。" }
    },
    {
      id: "m3-2025-4", origin: "year", year: 2025, no: "一(4)", type: "dblint", star: 2, school: "全国硕士研究生招生考试-数学三 2025 年",
      tags: ["dbi03","tp08"],
      stem: "设函数 $f(x)$ 连续，则 $\\displaystyle\\int_0^1\\mathrm{d}y\\int_0^y f(x)\\,\\mathrm{d}x=$（ ）",
      options: ["$\\int_0^1 xf(x)\\,\\mathrm{d}x$","$\\int_0^1 (1+x)f(x)\\,\\mathrm{d}x$","$\\int_0^1 (x-1)f(x)\\,\\mathrm{d}x$","$\\int_0^1 (1-x)f(x)\\,\\mathrm{d}x$"],
      answer: "选 D。积分区域为 $D=\\{(x,y)\\mid 0\\le y\\le1,\\ 0\\le x\\le y\\}$，改写为 $x$ 型即 $0\\le x\\le1$、$x\\le y\\le1$。交换次序：\n$$\\int_0^1\\mathrm{d}y\\int_0^y f(x)\\,\\mathrm{d}x=\\int_0^1 f(x)\\,\\mathrm{d}x\\int_x^1\\mathrm{d}y=\\int_0^1(1-x)f(x)\\,\\mathrm{d}x,$$\n故选 D。",
      traps: "把 $0\\le x\\le y$ 误读成 $0\\le y\\le x$，内层积分会变成 $\\int_0^x\\mathrm{d}y=x$，得到选项 A；选项 C 只差一个符号。",
      hint: "先画区域 $D$（三角形，顶点 $(0,0),(1,1),(0,1)$），再按「先 $y$ 后 $x$」重写上下限，内层 $\\int_x^1\\mathrm{d}y=1-x$。",
      src: { file: "参考文件/真题/数学/5、【1987-2025年】考研数学三真题/2025年考研数学三真题.pdf", page: 2, no: "一(4)", note: "题面取自 m3-2025-p2.png 亲读（并放大 m3-2025-p2q4.png 核对四选项）；答案与 2025 参考解析 p3 对拍（同页【答案】(D) 与换序推导一致），独立重推亦得 (D)。" }
    },
    {
      id: "m3-2025-5", origin: "year", year: 2025, no: "一(5)", type: "linalg", star: 3, school: "全国硕士研究生招生考试-数学三 2025 年",
      tags: ["zb08","kn37"],
      stem: "已知 $\\boldsymbol{A}$ 是 $m\\times n$ 的矩阵，$\\boldsymbol{\\beta}$ 是 $m$ 维非零向量。若 $\\boldsymbol{A}$ 有 $k$ 阶非零子式，则（ ）",
      options: ["当 $k=m$ 时 $\\boldsymbol{Ax}=\\boldsymbol{\\beta}$ 有解","当 $k=m$ 时 $\\boldsymbol{Ax}=\\boldsymbol{\\beta}$ 无解","当 $k<m$ 时 $\\boldsymbol{Ax}=\\boldsymbol{\\beta}$ 有解","当 $k<m$ 时 $\\boldsymbol{Ax}=\\boldsymbol{\\beta}$ 无解"],
      answer: "选 A。有 $k$ 阶非零子式 $\\Rightarrow r(\\boldsymbol{A})\\ge k$，而 $r(\\boldsymbol{A})\\le m$。当 $k=m$ 时 $r(\\boldsymbol{A})=m$，即 $\\boldsymbol{A}$ 行满秩；增广矩阵 $(\\boldsymbol{A}\\mid\\boldsymbol{\\beta})$ 只有 $m$ 行，故 $r(\\boldsymbol{A}\\mid\\boldsymbol{\\beta})=m=r(\\boldsymbol{A})$，方程组对任何 $\\boldsymbol{\\beta}$ 都有解，A 正确、B 错误。\n当 $k<m$ 时只能得到 $r(\\boldsymbol{A})\\ge k$，秩未定，解的存在性不能断言：例如 $\\boldsymbol{A}=\\begin{pmatrix}1&0\\\\0&0\\end{pmatrix}$，$k=1<m=2$，取 $\\boldsymbol{\\beta}=(1,0)^{\\mathrm{T}}$ 有解，取 $\\boldsymbol{\\beta}=(0,1)^{\\mathrm{T}}$ 无解，故 C、D 都不必然成立。",
      traps: "把「有 $k$ 阶非零子式」错当成 $r(\\boldsymbol{A})=k$；实际只能得 $r(\\boldsymbol{A})\\ge k$。$k<m$ 时正反例都存在，不能选 C 或 D。",
      hint: "行满秩必相容：$r(\\boldsymbol{A})=m$ 时 $r(\\boldsymbol{A}\\mid\\boldsymbol{\\beta})$ 被行数 $m$ 卡住，只能等于 $m$。",
      src: { file: "参考文件/真题/数学/5、【1987-2025年】考研数学三真题/2025年考研数学三真题.pdf", page: 2, no: "一(5)", note: "题面取自 m3-2025-p2.png 亲读（放大 m3-2025-p2q4.png 核对）；答案与 2025 参考解析 p3 对拍（【答案】(A)，册上解析仅一句 $k=m$ 时 $r(A)=r(A\\mid\\beta)=m$，属跳步，独立重推补出「增广矩阵只有 $m$ 行」与 $k<m$ 的反例）。" }
    },
    {
      id: "m3-2025-6", origin: "year", year: 2025, no: "一(6)", type: "eigen", star: 4, school: "全国硕士研究生招生考试-数学三 2025 年",
      tags: ["la13","zb25"],
      stem: "设 $\\boldsymbol{A}$ 为 3 阶矩阵，则「$\\boldsymbol{A}^3-\\boldsymbol{A}^2$ 可对角化」是「$\\boldsymbol{A}$ 可对角化」的（ ）",
      options: ["充分但不必要条件","必要但不充分条件","充分必要条件","既不充分也不必要条件"],
      answer: "选 B（必要但不充分）。\n必要性：若 $\\boldsymbol{A}$ 可对角化，即存在可逆矩阵 $\\boldsymbol{P}$ 使 $\\boldsymbol{P}^{-1}\\boldsymbol{AP}=\\boldsymbol{\\Lambda}$（对角阵），则\n$$\\boldsymbol{P}^{-1}(\\boldsymbol{A}^3-\\boldsymbol{A}^2)\\boldsymbol{P}=\\boldsymbol{\\Lambda}^3-\\boldsymbol{\\Lambda}^2$$\n仍是对角阵，故 $\\boldsymbol{A}^3-\\boldsymbol{A}^2$ 可对角化，条件是必要的。\n不充分：取 $\\boldsymbol{A}=\\begin{pmatrix}0&1\\\\0&0\\end{pmatrix}$，则 $\\boldsymbol{A}^2=\\boldsymbol{O}$，$\\boldsymbol{A}^3=\\boldsymbol{O}$，故 $\\boldsymbol{A}^3-\\boldsymbol{A}^2=\\boldsymbol{O}$ 可对角化；但 $\\boldsymbol{A}$ 的特征值全为 $0$ 而 $\\boldsymbol{A}\\ne\\boldsymbol{O}$，若 $\\boldsymbol{A}$ 可对角化则 $\\boldsymbol{A}=\\boldsymbol{O}$，矛盾，$\\boldsymbol{A}$ 本身不可对角化。故为必要但不充分条件，选 B。",
      traps: "只验证「$\\boldsymbol{A}$ 可对角化 $\\Rightarrow$ 多项式 $p(\\boldsymbol{A})$ 可对角化」就选 C；逆命题不成立，2 阶幂零 Jordan 块是标准反例。",
      hint: "必要性走 $\\boldsymbol{P}^{-1}p(\\boldsymbol{A})\\boldsymbol{P}=p(\\boldsymbol{\\Lambda})$；不充分性构造幂零块使 $\\boldsymbol{A}^3-\\boldsymbol{A}^2=\\boldsymbol{O}$。",
      src: { file: "参考文件/真题/数学/5、【1987-2025年】考研数学三真题/2025年考研数学三真题.pdf", page: 2, no: "一(6)", note: "题面取自 m3-2025-p2.png 亲读；答案与 2025 参考解析 p3 对拍（【答案】(B)，册上只写了必要性一句「若 A 可对角化，则 A³−A² 可对角化」，反例部分缺，独立重推补出幂零块反例）。" }
    },
    {
      id: "m3-2025-7", origin: "year", year: 2025, no: "一(7)", type: "eigen", star: 3, school: "全国硕士研究生招生考试-数学三 2025 年",
      tags: ["la09","zt02"],
      stem: "设矩阵 $\\boldsymbol{A}=\\begin{pmatrix}1&2\\\\-2&-a\\end{pmatrix}$，$\\boldsymbol{B}=\\begin{pmatrix}1&0\\\\1&a\\end{pmatrix}$，若 $f(x,y)=|x\\boldsymbol{A}+y\\boldsymbol{B}|$ 是正定二次型，则 $a$ 的取值范围是（ ）",
      options: ["$(0,2-\\sqrt3)$","$(2-\\sqrt3,2+\\sqrt3)$","$(2+\\sqrt3,4)$","$(0,4)$"],
      answer: "选 B。先乘开：\n$$x\\boldsymbol{A}+y\\boldsymbol{B}=\\begin{pmatrix}x+y&2x\\\\-2x+y&-ax+ay\\end{pmatrix},$$\n$$|x\\boldsymbol{A}+y\\boldsymbol{B}|=(x+y)(-ax+ay)-2x(-2x+y)=-a(x+y)(x-y)+4x^2-2xy=(4-a)x^2-2xy+ay^2.$$\n其矩阵为 $\\begin{pmatrix}4-a&-1\\\\-1&a\\end{pmatrix}$，正定 $\\Leftrightarrow$ $4-a>0$ 且 $a(4-a)-1>0$。后者即 $a^2-4a+1<0$，解得 $2-\\sqrt3<a<2+\\sqrt3$，该区间自动满足 $a<4$，故 $a\\in(2-\\sqrt3,2+\\sqrt3)$，选 B。",
      traps: "把 $|x\\boldsymbol{A}+y\\boldsymbol{B}|$ 按行列式「线性」展开成 $x^2|\\boldsymbol{A}|+y^2|\\boldsymbol{B}|$（行列式对矩阵不是线性的）；或只用第一个条件 $4-a>0$ 就停在 $(0,4)$（选项 D）。",
      hint: "先写出 $x\\boldsymbol{A}+y\\boldsymbol{B}$ 的 2 阶矩阵并算行列式，再套二元二次型正定的两个条件（平方项系数 $>0$、行列式 $>0$）。",
      src: { file: "参考文件/真题/数学/5、【1987-2025年】考研数学三真题/2025年考研数学三真题.pdf", page: 2, no: "一(7)", note: "题面取自 m3-2025-p2.png 亲读（选项跨至 m3-2025-p3.png 顶部，放大 m3-2025-p3q2.png 核对）；答案与 2025 参考解析 p3（【答案】(B)）及 p4（$2-\\sqrt3<a<2+\\sqrt3$ 的推导）对拍，独立重推一致。" }
    },
    {
      id: "m3-2025-8", origin: "year", year: 2025, no: "一(8)", type: "estimate", star: 4, school: "全国硕士研究生招生考试-数学三 2025 年",
      tags: ["zt04"],
      stem: "设随机变量 $X$ 服从正态分布 $N(-1,1)$，$Y$ 服从正态分布 $N(1,2)$，若 $X$ 与 $X+2Y$ 不相关，则 $X$ 与 $X-Y$ 的相关系数为（ ）",
      options: ["$\\dfrac{1}{3}$","$\\dfrac{1}{2}$","$\\dfrac{2}{3}$","$\\dfrac{3}{4}$"],
      answer: "选 D。$D(X)=1$，$D(Y)=2$。由 $X$ 与 $X+2Y$ 不相关：\n$$\\operatorname{Cov}(X,X+2Y)=D(X)+2\\operatorname{Cov}(X,Y)=1+2\\operatorname{Cov}(X,Y)=0\\ \\Longrightarrow\\ \\operatorname{Cov}(X,Y)=-\\frac12.$$\n于是 $\\operatorname{Cov}(X,X-Y)=D(X)-\\operatorname{Cov}(X,Y)=1+\\dfrac12=\\dfrac32$，$D(X-Y)=D(X)+D(Y)-2\\operatorname{Cov}(X,Y)=1+2+1=4$，故\n$$\\rho_{X,X-Y}=\\frac{\\operatorname{Cov}(X,X-Y)}{\\sqrt{D(X)}\\sqrt{D(X-Y)}}=\\frac{3/2}{1\\times2}=\\frac34,$$\n选 D。",
      traps: "$N(-1,1)$、$N(1,2)$ 的第二个参数是方差，$D(X)=1$、$D(Y)=2$；算 $D(X-Y)$ 时漏掉 $-2\\operatorname{Cov}(X,Y)$ 会得 $D=3$，相关系数变成 $\\dfrac{\\sqrt3}{2}$ 而无对应选项。",
      hint: "「不相关」即 $\\operatorname{Cov}(X,X+2Y)=0$，由此解出 $\\operatorname{Cov}(X,Y)=-\\dfrac12$，再把 $\\operatorname{Cov}(X,X-Y)$ 与 $D(X-Y)$ 一并算出。",
      src: { file: "参考文件/真题/数学/5、【1987-2025年】考研数学三真题/2025年考研数学三真题.pdf", page: 3, no: "一(8)", note: "题面取自 m3-2025-p3.png 亲读（放大 m3-2025-p3q2.png 核对 $N(-1,1)$、$N(1,2)$ 与四个选项）；答案与 2025 参考解析 p6 答案汇总「(8)【答案】(D) $\\dfrac34$」对拍（该册无本题详解页），独立重推一致。" }
    },
    {
      id: "m3-2025-9", origin: "year", year: 2025, no: "一(9)", type: "estimate", star: 3, school: "全国硕士研究生招生考试-数学三 2025 年",
      tags: ["zt04"],
      stem: "设 $x_1,x_2,\\cdots,x_{20}$ 是来自总体 $B(1,0.1)$ 的简单随机样本，令 $T=\\sum\\limits_{i=1}^{20}x_i$，利用泊松分布近似表示二项分布的方法可得 $P\\{T\\le1\\}\\approx$（ ）",
      options: ["$\\dfrac{1}{\\mathrm{e}^2}$","$\\dfrac{2}{\\mathrm{e}^2}$","$\\dfrac{3}{\\mathrm{e}^2}$","$\\dfrac{4}{\\mathrm{e}^2}$"],
      answer: "选 C。各 $x_i$ 独立同分布 $B(1,0.1)$，故 $T\\sim B(20,0.1)$，参数 $\\lambda=np=20\\times0.1=2$。用泊松分布近似：\n$$P\\{T\\le1\\}\\approx\\mathrm{e}^{-2}\\frac{2^0}{0!}+\\mathrm{e}^{-2}\\frac{2^1}{1!}=\\mathrm{e}^{-2}+2\\mathrm{e}^{-2}=\\frac{3}{\\mathrm{e}^2},$$\n选 C。",
      traps: "$\\lambda$ 应取 $np=2$，不是 $0.1$ 也不是 $20$；$P\\{T\\le1\\}$ 要同时累加 $T=0$ 与 $T=1$，只算 $T=1$ 会选 B。",
      hint: "先把 20 个 $B(1,0.1)$ 合成 $B(20,0.1)$，再取 $\\lambda=np=2$ 套泊松概率公式。",
      src: { file: "参考文件/真题/数学/5、【1987-2025年】考研数学三真题/2025年考研数学三真题.pdf", page: 3, no: "一(9)", note: "题面取自 m3-2025-p3.png 亲读（放大 m3-2025-p3q3.png 核对求和上下限 20 与 $B(1,0.1)$）；答案与 2025 参考解析 p4（【答案】(C)）及 p5（$\\lambda\\approx0.1\\cdot20=2$、$\\mathrm{e}^{-2}+2\\mathrm{e}^{-2}=3\\mathrm{e}^{-2}$）对拍，独立重推一致。" }
    },
    {
      id: "m3-2025-10", origin: "year", year: 2025, no: "一(10)", type: "estimate", star: 3, school: "全国硕士研究生招生考试-数学三 2025 年",
      tags: ["zt04"],
      stem: "设总体 $X$ 的均匀分布为 $F(x)$，$X_1,X_2,\\cdots,X_n$ 为来自总体 $X$ 的简单随机样本，样本的经验分布函数为 $F_n(x)$，对于给定的 $x\\,(0<F(x)<1)$，$D\\left(F_n(x)\\right)=$（ ）",
      options: ["$F(x)\\left(1-F(x)\\right)$","$\\left(F(x)\\right)^2$","$\\dfrac{1}{n}F(x)\\left(1-F(x)\\right)$","$\\dfrac{1}{n}\\left(F(x)\\right)^2$"],
      answer: "选 C。记 $Y_i=\\mathbf{1}\\{X_i\\le x\\}$，则各 $Y_i$ 相互独立且 $Y_i\\sim B\\left(1,F(x)\\right)$，而 $F_n(x)=\\dfrac1n\\sum\\limits_{i=1}^{n}Y_i$ 是样本均值，故\n$$D\\left(F_n(x)\\right)=\\frac{1}{n^2}\\cdot nF(x)\\left(1-F(x)\\right)=\\frac1nF(x)\\left(1-F(x)\\right),$$\n选 C。",
      traps: "漏掉 $\\dfrac{1}{n^2}$ 与 $n$ 的约简会选 A（误当成单个指示变量的方差）；把方差误写成「均值平方」会选 B 或 D。",
      hint: "把 $F_n(x)$ 写成 $n$ 个独立 $B\\left(1,F(x)\\right)$ 指示变量之平均，用 $D(\\bar Y)=\\dfrac1nD(Y_1)$。",
      src: { file: "参考文件/真题/数学/5、【1987-2025年】考研数学三真题/2025年考研数学三真题.pdf", page: 3, no: "一(10)", note: "题面取自 m3-2025-p3.png 亲读（放大 m3-2025-p3q4.png 核对四选项）；题干「总体 $X$ 的均匀分布为 $F(x)$」按原页字形照录（疑为「分布函数」之误排，未改字）。答案与 2025 参考解析 p6 答案汇总「(10)【答案】(C)」对拍（册上 p5 该题【答案】栏留空、无详解），独立重推一致。" }
    },
    {
      id: "m3-2025-11", origin: "year", year: 2025, no: "二(11)", type: "deriv", star: 4, school: "全国硕士研究生招生考试-数学三 2025 年",
      tags: ["gx01","gx59"],
      stem: "设 $g(x)$ 是函数 $f(x)=\\dfrac12\\ln\\dfrac{3+x}{3-x}$ 的反函数，则曲线 $y=g(x)$ 的渐近线方程为______。",
      answer: "填 $y=3$ 与 $y=-3$。由 $y=\\dfrac12\\ln\\dfrac{3+x}{3-x}$ 反解：$\\dfrac{3+x}{3-x}=\\mathrm{e}^{2y}$，故\n$$x=3\\cdot\\frac{\\mathrm{e}^{2y}-1}{\\mathrm{e}^{2y}+1}=3\\tanh y,\\qquad\\text{即}\\quad g(x)=\\frac{3\\left(\\mathrm{e}^{2x}-1\\right)}{\\mathrm{e}^{2x}+1}.$$\n于是 $\\lim\\limits_{x\\to+\\infty}g(x)=3$，$\\lim\\limits_{x\\to-\\infty}g(x)=-3$，故曲线有两条水平渐近线 $y=3$ 与 $y=-3$；$g$ 在 $\\mathbb{R}$ 上连续，无铅直渐近线。",
      traps: "$f$ 的定义域是 $(-3,3)$、值域是 $\\mathbb{R}$，所以 $g$ 的定义域是 $\\mathbb{R}$，渐近线只有水平方向。把 $f$ 的铅直渐近线 $x=\\pm3$ 搬到 $g$ 上（写 $x=\\pm3$）是最常见错误。",
      hint: "先把 $x$ 反解成 $y$ 的函数（即 $g$），再令 $x\\to\\pm\\infty$ 求极限。",
      src: { file: "参考文件/真题/数学/5、【1987-2025年】考研数学三真题/2025年考研数学三真题.pdf", page: 3, no: "二(11)", note: "题面取自 m3-2025-p3.png 亲读（放大 m3-2025-p3q5.png 核对 $\\dfrac12\\ln\\dfrac{3+x}{3-x}$）；答案与 2025 参考解析 p5 对拍（【答案】$y=3$ 和 $y=-3$，$g(x)=\\dfrac{3(\\mathrm{e}^{2x}-1)}{1+\\mathrm{e}^{2x}}$，两端极限 3 与 −3），独立重推一致。" }
    },
    {
      id: "m3-2025-12", origin: "year", year: 2025, no: "二(12)", type: "integral", star: 4, school: "全国硕士研究生招生考试-数学三 2025 年",
      tags: ["gx34","int27"],
      stem: "设 $\\displaystyle\\int_1^{+\\infty}\\frac{a}{x(2x+a)}\\,\\mathrm{d}x=\\ln 2$，则 $a=$______。",
      answer: "填 $a=2$。当 $a\\ne0$ 且在 $[1,+\\infty)$ 上 $2x+a\\ne0$ 时作部分分式：\n$$\\frac{a}{x(2x+a)}=\\frac1x-\\frac{2}{2x+a},$$\n故\n$$\\int_1^{R}\\frac{a}{x(2x+a)}\\,\\mathrm{d}x=\\Big[\\ln x-\\ln(2x+a)\\Big]_1^{R}=\\ln\\frac{R}{2R+a}-\\ln\\frac{1}{2+a}\\xrightarrow{R\\to+\\infty}\\ln\\frac12+\\ln(2+a)=\\ln\\frac{2+a}{2}.$$\n由 $\\ln\\dfrac{2+a}{2}=\\ln 2$ 得 $\\dfrac{2+a}{2}=2$，即 $a=2$（此时 $2+a=4>0$，且 $\\ln\\frac{R}{2R+a}\\to\\ln\\frac12$ 收敛），故 $a=2$。",
      traps: "把 $\\int\\dfrac{2\\,\\mathrm{d}x}{2x+a}$ 积成 $2\\ln(2x+a)$（漏掉内层系数 $2$ 带来的 $\\dfrac12$），会多出一个 $\\dfrac1a$ 因子而解出错误的 $a$；另外要检验 $2+a>0$ 保证对数有意义、积分收敛。",
      hint: "先裂项 $\\dfrac{a}{x(2x+a)}=\\dfrac1x-\\dfrac{2}{2x+a}$，原函数为 $\\ln x-\\ln(2x+a)$，上限取极限用 $\\dfrac{R}{2R+a}\\to\\dfrac12$。",
      src: { file: "参考文件/真题/数学/5、【1987-2025年】考研数学三真题/2025年考研数学三真题.pdf", page: 3, no: "二(12)", note: "题面取自 m3-2025-p3.png 亲读（放大 m3-2025-p3z12.png 确认下限 1、上限 $+\\infty$、分母 $x(2x+a)$）；答案与 2025 参考解析 p6 答案汇总「(12)【答案】$a=2$」对拍（该册无本题详解），独立重推得 $a=2$，一致。" }
    },
    {
      id: "m3-2025-13", origin: "year", year: 2025, no: "二(13)", type: "ode", star: 3, school: "全国硕士研究生招生考试-数学三 2025 年",
      tags: ["ode02","kn14"],
      stem: "微分方程 $xy'-y+x^2\\mathrm{e}^x=0$ 满足条件 $y(1)=-\\mathrm{e}$ 的解为 $y=$______。",
      answer: "填 $y=-x\\mathrm{e}^x$。方程即 $xy'-y=-x^2\\mathrm{e}^x$，两边同除 $x^2$：\n$$\\frac{xy'-y}{x^2}=\\left(\\frac{y}{x}\\right)'=-\\mathrm{e}^x,$$\n积分得 $\\dfrac{y}{x}=-\\mathrm{e}^x+C$，即 $y=x\\left(C-\\mathrm{e}^x\\right)$。代入 $y(1)=-\\mathrm{e}$：$-\\mathrm{e}=C-\\mathrm{e}$，故 $C=0$，$y=-x\\mathrm{e}^x$。",
      traps: "把它当可分离变量方程硬拆（右端含 $x^2\\mathrm{e}^x$ 且 $y$ 项不成比例）；应识别 $\\dfrac{xy'-y}{x^2}=\\left(\\dfrac{y}{x}\\right)'$ 这一「商法则」结构。",
      hint: "两边除 $x^2$ 凑成 $\\left(\\dfrac{y}{x}\\right)'=-\\mathrm{e}^x$，一次积分即得通解，再代初值。",
      src: { file: "参考文件/真题/数学/5、【1987-2025年】考研数学三真题/2025年考研数学三真题.pdf", page: 3, no: "二(13)", note: "题面取自 m3-2025-p3.png 亲读（放大 m3-2025-p3z14b.png 核对 $xy'-y+x^2\\mathrm{e}^x=0$ 与 $y(1)=-\\mathrm{e}$）；答案与 2025 参考解析 p6 答案汇总「(13)【答案】$y=-x\\mathrm{e}^x$」对拍（该册无本题详解），独立重推一致。" }
    },
    {
      id: "m3-2025-14", origin: "year", year: 2025, no: "二(14)", type: "multivar", star: 4, school: "全国硕士研究生招生考试-数学三 2025 年",
      tags: ["multi02","int25"],
      stem: "已知函数 $z=z(x,y)$ 由 $z+\\ln z-\\displaystyle\\int_y^x x\\mathrm{e}^{-t^2}\\,\\mathrm{d}t=1$ 确定，则 $\\left.\\dfrac{\\partial^2 z}{\\partial x^2}\\right|_{(1,1)}=$______。",
      answer: "填 $\\dfrac{1}{8\\mathrm{e}^2}$。先定 $z(1,1)$：积分区间退化，$z+\\ln z=1$，得 $z=1$。\n把被积函数中的 $x$ 提到积分号外：$I(x,y)=x\\displaystyle\\int_y^x\\mathrm{e}^{-t^2}\\mathrm{d}t$。对 $x$ 求偏导：\n$$z_x\\left(1+\\frac1z\\right)=\\int_y^x\\mathrm{e}^{-t^2}\\mathrm{d}t+x\\mathrm{e}^{-x^2},$$\n在 $(1,1)$ 处右端 $=0+\\mathrm{e}^{-1}$，故 $z_x=\\dfrac{1}{2\\mathrm{e}}$。\n再对 $x$ 求导：\n$$z_{xx}\\left(1+\\frac1z\\right)-\\frac{z_x^2}{z^2}=\\mathrm{e}^{-x^2}+\\left(\\mathrm{e}^{-x^2}-2x^2\\mathrm{e}^{-x^2}\\right)=\\left(2-2x^2\\right)\\mathrm{e}^{-x^2},$$\n在 $x=1$ 处右端为 $0$，于是 $2z_{xx}=z_x^2=\\dfrac{1}{4\\mathrm{e}^2}$，即 $z_{xx}\\Big|_{(1,1)}=\\dfrac{1}{8\\mathrm{e}^2}$。",
      traps: "被积函数里的 $x$ 是参数：对 $x$ 求导时既要「变上限求导」得 $x\\mathrm{e}^{-x^2}$，又要「对参数求导」得 $\\int_y^x\\mathrm{e}^{-t^2}\\mathrm{d}t$，漏掉第二项会把 $z_x$ 算成 $\\dfrac{1}{\\mathrm{e}}$。二阶求导别忘 $\\left(\\dfrac{1}{z}\\right)_x=-\\dfrac{z_x}{z^2}$ 的链式项。",
      hint: "先把 $x$ 提到积分号外再求导；二阶导对 $z_x\\left(1+\\dfrac1z\\right)=I_x$ 两边再求一次导，用商法则。",
      src: { file: "参考文件/真题/数学/5、【1987-2025年】考研数学三真题/2025年考研数学三真题.pdf", page: 3, no: "二(14)", note: "题面取自 m3-2025-p3.png 亲读（放大 m3-2025-p3z14c.png 与 m3-2025-p3z14d.png，确认被积函数为 $x\\mathrm{e}^{-t^2}$（$x$ 在积分号内）、右端常数 1）；答案与 2025 参考解析 p7 对拍（【答案】$\\dfrac18\\mathrm{e}^{-2}$，$z(1,1)=1$、$z_x=\\dfrac12\\mathrm{e}^{-1}$），独立重推一致。" }
    },
    {
      id: "m3-2025-15", origin: "year", year: 2025, no: "二(15)", type: "linalg", star: 4, school: "全国硕士研究生招生考试-数学三 2025 年",
      tags: ["la08","kn33"],
      stem: "已知 $f(x)=\\begin{vmatrix}2x+1&3&2x+1&1\\\\2x&-3&4x&-2\\\\2x+1&2&2x+1&1\\\\2x&-4&4x&-2\\end{vmatrix}$，$g(x)=\\begin{vmatrix}2x+1&1&2x+1&3\\\\5x+1&-2&4x&-3\\\\0&1&2x+1&2\\\\2x&-2&4x&-4\\end{vmatrix}$，则方程 $f(x)=g(x)$ 的不同的根的个数为______。",
      answer: "填 2。\n(1) 先证 $f(x)\\equiv0$：第 1 行减第 3 行得 $(0,1,0,0)$，第 2 行减第 4 行也得 $(0,1,0,0)$，故 $(R_1-R_3)-(R_2-R_4)=\\boldsymbol{0}$，四行线性相关，$f(x)=0$ 对一切 $x$ 成立。\n(2) 求 $g(x)$：作 $R_1\\leftarrow R_1-R_3$、$R_2\\leftarrow R_2-R_4$ 得 $\\begin{vmatrix}2x+1&0&0&1\\\\3x+1&0&0&1\\\\0&1&2x+1&2\\\\2x&-2&4x&-4\\end{vmatrix}$；再作 $R_1\\leftarrow R_1-R_2$ 得 $\\begin{vmatrix}-x&0&0&0\\\\3x+1&0&0&1\\\\0&1&2x+1&2\\\\2x&-2&4x&-4\\end{vmatrix}$。按第 1 行展开：\n$$g(x)=(-x)\\cdot(-1)^{1+1}\\begin{vmatrix}0&0&1\\\\1&2x+1&2\\\\-2&4x&-4\\end{vmatrix}=-x\\left(4x+2(2x+1)\\right)=-x(8x+2)=-2x(4x+1).$$\n(3) $f(x)=g(x)\\Leftrightarrow g(x)=0\\Leftrightarrow x=0$ 或 $x=-\\dfrac14$，共 2 个不同的根。",
      traps: "不先化简就硬算两个四阶行列式（各含 16 个元素、三次展开），极易算错；$f$ 的关键是「两对行只差一个元素」导致行线性相关、恒为 0。另外 $g$ 的化简方向是「消去第 1、3 列」，不要误用列变换破坏行列式值。",
      hint: "先用行差看 $f$ 的行相关性（恒为 0），再对 $g$ 用 $R_1-R_3$、$R_2-R_4$ 把第一列压成只剩一个非零元 $-x$，一阶展开即得二次多项式。",
      src: { file: "参考文件/真题/数学/5、【1987-2025年】考研数学三真题/2025年考研数学三真题.pdf", page: 4, no: "二(15)", note: "题面取自 m3-2025-p4.png 亲读（放大 m3-2025-p4a.png 逐元素核对两个四阶行列式）；答案与 2025 参考解析 p7–p8 对拍（【答案】2，册上作 $g(x)-f(x)=-2x(4x+1)=0$），独立重推得同一多项式与同一根数。" }
    },
    {
      id: "m3-2025-16", origin: "year", year: 2025, no: "二(16)", type: "estimate", star: 3, school: "全国硕士研究生招生考试-数学三 2025 年",
      tags: ["zt04"],
      stem: "设 $A$、$B$、$C$ 为三个随机事件，且 $A$ 与 $B$ 相互独立，$B$ 与 $C$ 相互独立，$A$ 与 $C$ 互不相容，已知 $P(A)=P(C)=\\dfrac14$，$P(B)=\\dfrac12$，则在事件 $A$、$B$、$C$ 至少有一个发生的事件下，$A$、$B$、$C$ 中恰有一个发生的概率为______。",
      answer: "填 $\\dfrac23$。由 $A$ 与 $C$ 互不相容得 $P(AC)=0$，从而 $P(ABC)=0$；由独立性 $P(AB)=\\dfrac14\\cdot\\dfrac12=\\dfrac18$，$P(BC)=\\dfrac12\\cdot\\dfrac14=\\dfrac18$。\n$$P(A\\cup B\\cup C)=\\frac14+\\frac12+\\frac14-\\frac18-\\frac18-0+0=\\frac34.$$\n「恰有一个发生」的概率为\n$$\\sum P(A)+P(B)+P(C)-2\\left[P(AB)+P(BC)+P(CA)\\right]+3P(ABC)=1-2\\cdot\\frac14+0=\\frac12.$$\n故所求条件概率 $=\\dfrac{1/2}{3/4}=\\dfrac23$。",
      traps: "$A$ 与 $C$ 互不相容**不能**推出 $A$、$C$ 独立（恰相反：$P(AC)=0\\ne P(A)P(C)=\\dfrac1{16}$）；「恰有一个」的容斥系数是 $-2$（不是 $-1$），漏掉会出现 $\\dfrac{3/4}{3/4}=1$ 之类的错值。",
      hint: "先各算「至少一个发生」$=\\dfrac34$ 与「恰有一个发生」$=\\dfrac12$ 两个无条件概率，再按条件概率定义相除。",
      src: { file: "参考文件/真题/数学/5、【1987-2025年】考研数学三真题/2025年考研数学三真题.pdf", page: 4, no: "二(16)", note: "题面取自 m3-2025-p4.png 亲读（放大 m3-2025-p4b.png 核对独立性/互不相容条件与 $P(A)=P(C)=\\dfrac14$、$P(B)=\\dfrac12$）；答案与 2025 参考解析 p8（【答案】$\\dfrac23$，解析栏空白）及 p9（Venn 图分块 $\\dfrac18,\\dfrac18,\\dfrac28,\\dfrac18,\\dfrac18$）对拍，独立重推一致。" }
    },
    {
      id: "m3-2025-17", origin: "year", year: 2025, no: "三(17)", type: "integral", star: 3, school: "全国硕士研究生招生考试-数学三 2025 年",
      tags: ["gx34","tp02"],
      stem: "计算 $\\displaystyle\\int_0^1\\frac{1}{(x+1)(x^2-2x+2)}\\,\\mathrm{d}x$。",
      answer: "结果为 $\\dfrac{3}{10}\\ln2+\\dfrac{\\pi}{10}$。\n设 $\\dfrac{1}{(x+1)(x^2-2x+2)}=\\dfrac{a}{x+1}+\\dfrac{bx+c}{x^2-2x+2}$，通分比较分子：\n$$1=a\\left(x^2-2x+2\\right)+(bx+c)(x+1)\\ \\Longrightarrow\\ a+b=0,\\ -2a+b+c=0,\\ 2a+c=1,$$\n解得 $a=\\dfrac15$，$b=-\\dfrac15$，$c=\\dfrac35$。又 $x^2-2x+2=(x-1)^2+1$，且 $-x+3=-(x-1)+2$，故\n$$\\int_0^1\\frac{\\mathrm{d}x}{(x+1)(x^2-2x+2)}=\\frac15\\ln(x+1)\\Big|_0^1+\\frac15\\int_0^1\\frac{-(x-1)+2}{(x-1)^2+1}\\,\\mathrm{d}x$$\n$$=\\frac15\\ln2+\\frac15\\left[-\\frac12\\ln\\left((x-1)^2+1\\right)+2\\arctan(x-1)\\right]_0^1=\\frac15\\ln2+\\frac15\\left(\\frac12\\ln2+\\frac{\\pi}{2}\\right)=\\frac{3}{10}\\ln2+\\frac{\\pi}{10}.$$",
      traps: "二次因子 $x^2-2x+2$ 判别式 $4-8<0$、在 $[0,1]$ 上不可约，必须保留 $\\dfrac{bx+c}{x^2-2x+2}$，不能拆成两个实一次因子；配方后分子要拆成「导数部分 $-(x-1)$」与「常数部分 $2$」，分别积成对数与反正切。",
      hint: "部分分式 + 二次因子配方 $(x-1)^2+1$，分子按「导数部分 + 常数部分」拆开。",
      src: { file: "参考文件/真题/数学/5、【1987-2025年】考研数学三真题/2025年考研数学三真题.pdf", page: 4, no: "三(17)", note: "题面取自 m3-2025-p4.png 亲读（放大 m3-2025-p4c.png 核对积分限 0→1 与被积函数）；答案与 2025 参考解析 p9–p10 对拍（【答案】$\\dfrac{3}{10}\\ln2+\\dfrac{\\pi}{10}$，$a=\\dfrac15,b=-\\dfrac15,c=\\dfrac35$），独立重推一致。" }
    },
    {
      id: "m3-2025-18", origin: "year", year: 2025, no: "三(18)", type: "deriv", star: 4, school: "全国硕士研究生招生考试-数学三 2025 年",
      tags: ["ext01","tay01","inf05"],
      stem: "设函数 $f(x)$ 在 $x=0$ 处连续，且 $\\lim\\limits_{x\\to0}\\dfrac{xf(x)-\\mathrm{e}^{2\\sin x}+1}{\\ln(1+x)+\\ln(1-x)}=-3$，证明 $f(x)$ 在 $x=0$ 处可导，并求 $f'(0)$。",
      answer: "结论：$f(0)=2$，$f'(0)=5$。\n分母 $\\ln(1+x)+\\ln(1-x)=\\ln(1-x^2)\\sim-x^2$，由极限值为 $-3$ 得\n$$xf(x)-\\mathrm{e}^{2\\sin x}+1=3x^2+o(x^2).$$\n又 $2\\sin x=2x-\\dfrac{x^3}{3}+o(x^3)$，故\n$$\\mathrm{e}^{2\\sin x}=1+2x+2x^2+o(x^2),$$\n从而\n$$xf(x)=\\mathrm{e}^{2\\sin x}-1+3x^2+o(x^2)=2x+5x^2+o(x^2),$$\n即当 $x\\ne0$ 且 $|x|$ 充分小时 $f(x)=2+5x+o(x)$。令 $x\\to0$，由 $f$ 在 $x=0$ 处连续得 $f(0)=2$；于是\n$$\\lim_{x\\to0}\\frac{f(x)-f(0)}{x-0}=\\lim_{x\\to0}\\frac{f(x)-2}{x}=5,$$\n故 $f$ 在 $x=0$ 处可导，且 $f'(0)=5$。",
      traps: "分母必须先合并成 $\\ln(1-x^2)\\sim-x^2$（负号易丢，会把 $3x^2$ 写成 $-3x^2$ 而算出 $f'(0)=1$）；$\\mathrm{e}^{2\\sin x}$ 必须展开到 $x^2$ 项——只展到 $2x$ 只能定出 $f(0)=2$，求不出 $f'(0)$。",
      hint: "分母等价成 $-x^2$ 反解出 $xf(x)$ 的展开式，除以 $x$ 得 $f(x)=2+5x+o(x)$，最后回到导数定义并与连续性拼接。",
      src: { file: "参考文件/真题/数学/5、【1987-2025年】考研数学三真题/2025年考研数学三真题.pdf", page: 4, no: "三(18)", note: "题面取自 m3-2025-p4.png 亲读（放大 m3-2025-p4c.png / m3-2025-p4d.png 核对极限式 $\\dfrac{xf(x)-\\mathrm{e}^{2\\sin x}+1}{\\ln(1+x)+\\ln(1-x)}=-3$）；答案与 2025 参考解析 p10–p11 对拍（【答案】$f'(0)=5$，册上用「分子分母同除」的极限法与保号性，我用泰勒展开重推，路径不同结论相同）。" }
    },
    {
      id: "m3-2025-19", origin: "year", year: 2025, no: "三(19)", type: "dblint", star: 4, school: "全国硕士研究生招生考试-数学三 2025 年",
      tags: ["dbi01","ext27"],
      stem: "已知平面有界区域 $D=\\{(x,y)\\mid y^2\\le x,\\ x^2\\le y\\}$，计算二重积分 $\\displaystyle\\iint\\limits_D(x-y+1)^2\\,\\mathrm{d}x\\mathrm{d}y$。",
      answer: "结果为 $\\dfrac{71}{210}$。$D$ 关于直线 $y=x$ 对称（把 $x,y$ 互换后两个条件互换），故\n$$\\iint_D(x-y+1)^2\\,\\mathrm{d}\\sigma=\\frac12\\iint_D\\left[(x-y+1)^2+(y-x+1)^2\\right]\\mathrm{d}\\sigma=\\iint_D\\left[(x-y)^2+1\\right]\\mathrm{d}\\sigma.$$\n又 $D:\\ 0\\le y\\le1,\\ y^2\\le x\\le\\sqrt y$，于是\n$$\\iint_D1\\,\\mathrm{d}\\sigma=\\int_0^1\\left(\\sqrt y-y^2\\right)\\mathrm{d}y=\\frac23-\\frac13=\\frac13,$$\n$$\\iint_D(x-y)^2\\mathrm{d}\\sigma=\\int_0^1\\mathrm{d}y\\int_{y^2}^{\\sqrt y}(x-y)^2\\mathrm{d}x=\\frac13\\int_0^1\\left[(\\sqrt y-y)^3-(y^2-y)^3\\right]\\mathrm{d}y$$\n$$=\\frac13\\int_0^1\\left(3y^{5/2}-3y^2+y^{3/2}-y^6+3y^5-3y^4\\right)\\mathrm{d}y=\\frac13\\left(\\frac67-1+\\frac25-\\frac17+\\frac12-\\frac35\\right)=\\frac{1}{210}.$$\n故原式 $=\\dfrac{1}{210}+\\dfrac13=\\dfrac{71}{210}$。",
      traps: "直接用 $(x-y+1)^2=x^2+y^2+1-2xy+2x-2y$ 逐项积分要算 $\\int_0^1x^{5/2}$、$\\int_0^1x^{7/2}$ 等大量项，极易出错；关键是用 $D$ 关于 $y=x$ 的对称性把交叉项 $2(x-y)$ 的积分消掉。定限时注意 $y^2\\le x$ 对 $0\\le y\\le1$ 给出 $x\\ge y^2$，$x^2\\le y$ 给出 $x\\le\\sqrt y$。",
      hint: "先观察 $D$ 关于 $y=x$ 对称，把被积函数对称化成 $(x-y)^2+1$；区域按 $y$ 型写成 $0\\le y\\le1$、$y^2\\le x\\le\\sqrt y$，内层对 $x$ 积分时用 $\\dfrac{(\\sqrt y-y)^3-\\cdots}{3}$。",
      src: { file: "参考文件/真题/数学/5、【1987-2025年】考研数学三真题/2025年考研数学三真题.pdf", page: 4, no: "三(19)", note: "题面取自 m3-2025-p4.png 亲读（放大 m3-2025-p4d.png 核对区域条件 $y^2\\le x,\\ x^2\\le y$ 与被积函数 $(x-y+1)^2$）；答案与 2025 参考解析 p12 对拍（【答案】$\\dfrac{71}{210}$，册上同样用对称化 $\\dfrac12[(x-y+1)^2+(y-x+1)^2]$），独立重推一致。" }
    },
    {
      id: "m3-2025-20", origin: "year", year: 2025, no: "三(20)", type: "proof", star: 5, school: "全国硕士研究生招生考试-数学三 2025 年",
      tags: ["mvt05","mvt02"],
      stem: "设函数 $f(x)$ 在区间 $(a,b)$ 内可导，证明导函数 $f'(x)$ 在 $(a,b)$ 内严格单调增加的充分必要条件是：对 $(a,b)$ 内任意的 $x_1,x_2,x_3$，当 $x_1<x_2<x_3$ 时，$\\dfrac{f(x_2)-f(x_1)}{x_2-x_1}<\\dfrac{f(x_3)-f(x_2)}{x_3-x_2}$。",
      answer: "必要性：设 $f'(x)$ 在 $(a,b)$ 内严格单调增加。对任意 $a<x_1<x_2<x_3<b$，由拉格朗日中值定理，存在 $\\xi_1\\in(x_1,x_2)$、$\\xi_2\\in(x_2,x_3)$ 使\n$$\\frac{f(x_2)-f(x_1)}{x_2-x_1}=f'(\\xi_1),\\qquad\\frac{f(x_3)-f(x_2)}{x_3-x_2}=f'(\\xi_2).$$\n由 $\\xi_1<x_2<\\xi_2$ 及 $f'$ 严格增加得 $f'(\\xi_1)<f'(\\xi_2)$，即所证不等式成立。\n充分性：设对任意 $x_1<x_2<x_3$ 有该严格不等式。\n① 先证 $f'$ 在 $(a,b)$ 上不减。任取 $a<u<v<b$，取 $h>0$ 使 $a<u-h$、$v+h<b$。对三元组 $(u-h,u,v)$ 与 $(u,v,v+h)$ 分别用条件：\n$$\\frac{f(u)-f(u-h)}{h}<\\frac{f(v)-f(u)}{v-u}<\\frac{f(v+h)-f(v)}{h}.$$\n令 $h\\to0^{+}$，由 $f$ 可导得\n$$f'(u)\\le\\frac{f(v)-f(u)}{v-u}\\le f'(v).$$\n② 再证严格性。若存在 $u<v$ 使 $f'(u)=f'(v)$，由① $f'$ 在 $[u,v]$ 上不减，故对任意 $s\\in(u,v)$ 有 $f'(u)\\le f'(s)\\le f'(v)=f'(u)$，即 $f'$ 在 $[u,v]$ 上恒等于 $k=f'(u)$；于是对 $u<s<t<v$，由中值定理 $\\dfrac{f(t)-f(s)}{t-s}=f'(\\xi)=k$，$f$ 在 $[u,v]$ 上是线性函数。取 $u<x_1<x_2<x_3<v$，则两个差商都等于 $k$，与题设的严格不等式矛盾。故对任意 $u<v$ 有 $f'(u)<f'(v)$，即 $f'$ 在 $(a,b)$ 内严格单调增加。",
      traps: "充分性最容易只做到第①步：两边取极限只能得到 $f'(u)\\le\\cdots\\le f'(v)$（非严格），若就此收尾，证的是「$f'$ 不减」而不是题目要求的「严格增加」；必须补第②步，用「$f'$ 在 $[u,v]$ 上为常数 $\\Rightarrow f$ 线性 $\\Rightarrow$ 差商相等」排除等号。",
      hint: "必要性：在两个子区间上各用一次拉格朗日中值定理。充分性：先用 $(u-h,u,v)$、$(u,v,v+h)$ 令 $h\\to0$ 得 $f'$ 不减，再用「等号成立则 $f$ 在该段线性、差商相等」推翻严格不等式。",
      src: { file: "参考文件/真题/数学/5、【1987-2025年】考研数学三真题/2025年考研数学三真题.pdf", page: 4, no: "三(20)", note: "题面取自 m3-2025-p4.png 亲读（放大 m3-2025-p4e.png 核对「严格单调增加」与差商不等式方向）；答案与 2025 参考解析 p12–p14 对拍：册上【答案】栏为「略」，充分性只由两端取极限得到 $f'(c_1)\\le\\cdots\\le f'(c_2)$ 便断言「$f'$ 在 $(a,b)$ 上单增」，未处理严格性——属跳步而非结论错误；本记录独立重推并补出排除等号的一步。" }
    },
    {
      id: "m3-2025-21", origin: "year", year: 2025, no: "三(21)", type: "linalg", star: 4, school: "全国硕士研究生招生考试-数学三 2025 年",
      tags: ["zb06","kn37","zb07"],
      stem: "设矩阵 $\\boldsymbol{A}=\\begin{pmatrix}1&-1&3&0&-1\\\\-1&0&-2&-a&-1\\\\1&1&a&2&3\\end{pmatrix}$ 的秩为 2。\n(1) 求 $a$ 的值。\n(2) 求 $\\boldsymbol{A}$ 的列向量组的一个极大线性无关组 $\\boldsymbol{\\alpha},\\boldsymbol{\\beta}$，并求矩阵 $\\boldsymbol{H}$，使得 $\\boldsymbol{A}=\\boldsymbol{GH}$，其中 $\\boldsymbol{G}=(\\boldsymbol{\\alpha},\\boldsymbol{\\beta})$。",
      answer: "(1) $a=1$。取 $\\boldsymbol{A}$ 的第 1、2、4 列构成的三阶子式：\n$$\\begin{vmatrix}1&-1&0\\\\-1&0&-a\\\\1&1&2\\end{vmatrix}=1\\cdot(0+a)-(-1)\\cdot(-2+a)+0=2a-2.$$\n由 $r(\\boldsymbol{A})=2<3$ 得该子式为 $0$，故 $a=1$（此时 $\\begin{vmatrix}1&-1\\\\-1&0\\end{vmatrix}=1\\ne0$，秩确为 2）。\n(2) 代入 $a=1$ 作初等行变换：\n$$\\boldsymbol{A}=\\begin{pmatrix}1&-1&3&0&-1\\\\-1&0&-2&-1&-1\\\\1&1&1&2&3\\end{pmatrix}\\to\\begin{pmatrix}1&-1&3&0&-1\\\\0&-1&1&-1&-2\\\\0&2&-2&2&4\\end{pmatrix}\\to\\begin{pmatrix}1&-1&3&0&-1\\\\0&-1&1&-1&-2\\\\0&0&0&0&0\\end{pmatrix},$$\n主元位于第 1、2 列，故 $\\boldsymbol{A}$ 的列向量组的一个极大线性无关组为\n$$\\boldsymbol{\\alpha}=\\begin{pmatrix}1\\\\-1\\\\1\\end{pmatrix},\\qquad\\boldsymbol{\\beta}=\\begin{pmatrix}-1\\\\0\\\\1\\end{pmatrix}.$$\n其余各列用 $\\boldsymbol{\\alpha},\\boldsymbol{\\beta}$ 表示：$\\boldsymbol{A}$ 的第 3 列为 $2\\boldsymbol{\\alpha}-\\boldsymbol{\\beta}=(3,-2,1)^{\\mathrm{T}}$，第 4 列为 $\\boldsymbol{\\alpha}+\\boldsymbol{\\beta}=(0,-1,2)^{\\mathrm{T}}$，第 5 列为 $\\boldsymbol{\\alpha}+2\\boldsymbol{\\beta}=(-1,-1,3)^{\\mathrm{T}}$，第 1、2 列的坐标分别是 $(1,0)^{\\mathrm{T}}$、$(0,1)^{\\mathrm{T}}$，故\n$$\\boldsymbol{H}=\\begin{pmatrix}1&0&2&1&1\\\\0&1&-1&1&2\\end{pmatrix},\\qquad \\boldsymbol{G}\\boldsymbol{H}=\\begin{pmatrix}1&-1\\\\-1&0\\\\1&1\\end{pmatrix}\\begin{pmatrix}1&0&2&1&1\\\\0&1&-1&1&2\\end{pmatrix}=\\boldsymbol{A}.$$",
      traps: "求 $a$ 必须选含 $a$ 的三阶子式（第 1、2、4 列），选到不含 $a$ 的列会得到与 $a$ 无关的行列式而无法定 $a$。极大线性无关组不唯一（本题也可取第 1、4 列），但 $\\boldsymbol{H}$ 必须按「$\\boldsymbol{A}$ 的每一列在 $\\boldsymbol{G}$ 的列下的坐标」逐列写出：$\\boldsymbol{H}$ 是 $2\\times5$，不是 $5\\times2$。",
      hint: "由 $r(\\boldsymbol{A})=2$ 令含 $a$ 的三阶子式为 $0$ 定出 $a$；把 $\\boldsymbol{A}$ 化成行阶梯形，主元列即极大无关组；再用 $\\boldsymbol{A}=\\boldsymbol{GH}$ 逐列比对求出 $\\boldsymbol{H}$ 的每一列。",
      src: { file: "参考文件/真题/数学/5、【1987-2025年】考研数学三真题/2025年考研数学三真题.pdf", page: 4, no: "三(21)", note: "题面取自 m3-2025-p4.png 亲读（放大 m3-2025-p4f.png 与 m3-2025-p5.png 顶部 $\\boldsymbol{G}=(\\boldsymbol{\\alpha},\\boldsymbol{\\beta})$ 核对矩阵与两小问）；答案与 2025 参考解析 p14–p15 对拍（(1) $a=1$；(2) $\\boldsymbol{\\alpha}=(1,-1,1)^{\\mathrm{T}}$、$\\boldsymbol{\\beta}=(-1,0,1)^{\\mathrm{T}}$、$\\boldsymbol{H}=\\begin{pmatrix}1&0&2&1&1\\\\0&1&-1&1&2\\end{pmatrix}$），独立重推并逐列验算 $\\boldsymbol{GH}=\\boldsymbol{A}$。" }
    },
    {
      id: "m3-2025-22", origin: "year", year: 2025, no: "三(22)", type: "estimate", star: 4, school: "全国硕士研究生招生考试-数学三 2025 年",
      tags: ["int27","int23"],
      stem: "投保人的损失事件发生时，保险公司的赔付额 $Y$ 与投保人的损失额 $X$ 的关系为 $Y=\\begin{cases}0,&X\\le100,\\\\X-100,&X>100,\\end{cases}$ 设损失事件发生时，投保人的损失额 $X$ 的概率密度为\n$$f(x)=\\begin{cases}\\dfrac{2\\times100^2}{(100+x)^3},&x>0,\\\\0,&x\\le0.\\end{cases}$$\n(Ⅰ) 求 $P\\{Y>0\\}$ 及 $EY$；\n(Ⅱ) 这种损失事件在一年内发生的次数记为 $N$，保险公司在一年内就这种损失事件产生的理赔次数记为 $M$。假设 $N$ 服从参数为 $\\delta$ 的泊松分布，在 $N=n\\,(n\\ge1)$ 的条件下，$M$ 服从二项分布 $B(n,p)$，其中 $p=P\\{Y>0\\}$，求 $M$ 的概率分布。",
      answer: "(Ⅰ) $P\\{Y>0\\}=\\dfrac14$，$EY=50$。\n$$P\\{Y>0\\}=P\\{X>100\\}=\\int_{100}^{+\\infty}\\frac{2\\times100^2}{(100+x)^3}\\,\\mathrm{d}x=\\left[-\\frac{100^2}{(100+x)^2}\\right]_{100}^{+\\infty}=\\frac{100^2}{200^2}=\\frac14.$$\n令 $t=x+100$，则\n$$EY=\\int_{100}^{+\\infty}(x-100)\\frac{2\\times100^2}{(100+x)^3}\\,\\mathrm{d}x=2\\times100^2\\int_{200}^{+\\infty}\\frac{t-200}{t^3}\\,\\mathrm{d}t=2\\times100^2\\left(\\frac{1}{200}-\\frac{1}{400}\\right)=50.$$\n(Ⅱ) $p=P\\{Y>0\\}=\\dfrac14$。由全概率公式，对 $m\\ge1$：\n$$P\\{M=m\\}=\\sum_{n=m}^{+\\infty}P\\{N=n\\}P\\{M=m\\mid N=n\\}=\\sum_{n=m}^{+\\infty}\\mathrm{e}^{-\\delta}\\frac{\\delta^n}{n!}\\binom{n}{m}p^m(1-p)^{n-m}$$\n$$=\\frac{\\mathrm{e}^{-\\delta}(\\delta p)^m}{m!}\\sum_{n=m}^{+\\infty}\\frac{\\left[\\delta(1-p)\\right]^{n-m}}{(n-m)!}=\\frac{\\mathrm{e}^{-\\delta}(\\delta p)^m}{m!}\\mathrm{e}^{\\delta(1-p)}=\\mathrm{e}^{-\\delta p}\\frac{(\\delta p)^m}{m!}.$$\n即对 $m=1,2,\\cdots$ 有 $P\\{M=m\\}=\\mathrm{e}^{-\\delta/4}\\dfrac{(\\delta/4)^m}{m!}$。\n注意条件 $N\\ge1$ 排除了 $N=0$，故 $m=0$ 的情形要单独算：\n$$P\\{M=0\\}=\\sum_{n=1}^{+\\infty}\\mathrm{e}^{-\\delta}\\frac{\\delta^n}{n!}(1-p)^n=\\mathrm{e}^{-\\delta}\\left(\\mathrm{e}^{\\delta(1-p)}-1\\right)=\\mathrm{e}^{-\\delta/4}-\\mathrm{e}^{-\\delta}.$$\n若按参考解析取 $\\delta=8$，则 $P\\{M=m\\}=\\mathrm{e}^{-2}\\dfrac{2^m}{m!}\\ (m=1,2,\\cdots)$，$P\\{M=0\\}=\\mathrm{e}^{-2}-\\mathrm{e}^{-8}$。",
      traps: "求和下限是 $n=m$（因为 $M\\le N$），不是 $n=1$；另外条件 $N\\ge1$ 使 $m=0$ 的通项不能直接套泊松公式（少减了 $\\mathrm{e}^{-\\delta}$），把 $m=0$ 也算成 $\\mathrm{e}^{-\\delta p}$ 是常见疏漏。$EY$ 的换元要把 $x-100$ 写成 $t-200$，直接对 $t-200$ 分部积分也可，但不要漏 $\\dfrac{1}{t^3}$ 的幂次。",
      hint: "先算 $p=P\\{X>100\\}=\\dfrac14$（$\\dfrac{2\\times100^2}{(100+x)^3}$ 的原函数是 $-\\dfrac{100^2}{(100+x)^2}$），再用全概率公式对 $n$ 求和，凑 $\\sum\\dfrac{[\\delta(1-p)]^{n-m}}{(n-m)!}=\\mathrm{e}^{\\delta(1-p)}$。",
      src: { file: "参考文件/真题/数学/5、【1987-2025年】考研数学三真题/2025年考研数学三真题.pdf", page: 5, no: "三(22)", note: "题面取自 m3-2025-p5.png 亲读（放大 m3-2025-p5b.png / m3-2025-p5c.png 核对分段函数与两小问，p5z22f.png 确认泊松参数在原卷印作 $\\delta$）；答案与 2025 参考解析 p15–p16 对拍：(Ⅰ) $P\\{Y>0\\}=\\dfrac14$、$EY=50$ 一致；(Ⅱ) 册上按 $\\delta=8$ 算得 $P\\{M=k\\}=\\dfrac{\\mathrm{e}^{-2}2^k}{k!}\\ (k=1,2,3\\cdots)$ 且重述题干写作「参数为 8」，与本题面字形 $\\delta$ 不同源——本记录按题干 $\\delta$ 给通式（$\\delta=8$ 时与册一致），并按「$N\\ge1$」独立重推出册上未列的 $m=0$ 项 $\\mathrm{e}^{-\\delta/4}-\\mathrm{e}^{-\\delta}$（$\\delta=8$ 时 $\\mathrm{e}^{-2}-\\mathrm{e}^{-8}$）。" }
    },
    {
      id: "m3-2010-9", origin: "year", year: 2010, no: "二(9)", type: "deriv", star: 3, school: "全国硕士研究生入学统一考试-数学三 2010 年",
      tags: ["int25","dr04","zt04"],
      stem: "设可导函数 $y=y(x)$ 由方程 $\\int_0^{x+y}\\mathrm{e}^{-t^2}\\,\\mathrm{d}t=\\int_0^x x\\sin t^2\\,\\mathrm{d}t$ 确定，则 $\\left.\\dfrac{\\mathrm{d}y}{\\mathrm{d}x}\\right|_{x=0}=$ \\_\\_\\_\\_.",
      answer: "$\\left.\\dfrac{\\mathrm{d}y}{\\mathrm{d}x}\\right|_{x=0}=-1$。令 $x=0$ 得 $\\int_0^{y(0)}\\mathrm{e}^{-t^2}\\mathrm{d}t=0$，故 $y(0)=0$。两端对 $x$ 求导（右端把常数因子 $x$ 提出积分号）：$$\\mathrm{e}^{-(x+y)^2}\\Big(1+\\frac{\\mathrm{d}y}{\\mathrm{d}x}\\Big)=\\int_0^x\\sin t^2\\,\\mathrm{d}t+x\\sin x^2.$$代入 $x=0,\\,y=0$ 得 $1+y'(0)=0$，故 $y'(0)=-1$。",
      src: { file: "参考文件/真题/数学/5、【1987-2025年】考研数学三真题/3、2010-2022考研数学三真题.pdf", page: 50, no: "二(9)", note: "题面：合并册 2010 卷（卷首 p49，页范围 p49–p52）p50 裁片 m3-1012-p50-top.png 亲读（方程右端为 ∫₀ˣ x·sin t² dt）；答案与 2010 答案册 p3 对拍（册上 −1），独立重推一致（x=0 处得 1+y′=0）；OCR 文本层仅作交叉核对，不作题面来源。" }
    },
    {
      id: "m3-2010-10", origin: "year", year: 2010, no: "二(10)", type: "integral", star: 3, school: "全国硕士研究生入学统一考试-数学三 2010 年",
      tags: ["int29","wr03","ext09"],
      stem: "设位于曲线 $y=\\dfrac{1}{\\sqrt{x(1+\\ln^2 x)}}\\ (\\mathrm{e}\\le x<+\\infty)$ 下方、$x$ 轴上方的无界区域为 $G$，则 $G$ 绕 $x$ 轴旋转一周所得空间区域的体积为 \\_\\_\\_\\_.",
      answer: "$\\dfrac{\\pi^2}{4}$。由旋转体体积公式 $$V=\\pi\\int_{\\mathrm{e}}^{+\\infty}y^2\\,\\mathrm{d}x=\\pi\\int_{\\mathrm{e}}^{+\\infty}\\frac{\\mathrm{d}x}{x(1+\\ln^2x)}=\\pi\\big[\\arctan(\\ln x)\\big]_{\\mathrm{e}}^{+\\infty}=\\pi\\Big(\\frac{\\pi}{2}-\\frac{\\pi}{4}\\Big)=\\frac{\\pi^2}{4}.$$",
      src: { file: "参考文件/真题/数学/5、【1987-2025年】考研数学三真题/3、2010-2022考研数学三真题.pdf", page: 50, no: "二(10)", note: "题面：合并册 2010 卷 p50 裁片 m3-1012-p50-top.png 亲读（y=1/√(x(1+ln²x))，e≤x<+∞）；答案与 2010 答案册 p3 对拍（册上 π²/4），独立重推一致（令 u=ln x 得 arctan）；OCR 文本层仅作交叉核对，不作题面来源。" }
    },
    {
      id: "m3-2010-11", origin: "year", year: 2010, no: "二(11)", type: "econ", star: 3, school: "全国硕士研究生入学统一考试-数学三 2010 年",
      tags: ["ext08","kn12","ode01"],
      stem: "设某商品的收益函数为 $R(p)$，收益弹性为 $1+p^3$，其中 $p$ 为价格，且 $R(1)=1$，则 $R(p)=$ \\_\\_\\_\\_.",
      answer: "$R(p)=p\\,\\mathrm{e}^{\\frac{1}{3}(p^3-1)}$。由弹性定义 $\\frac{p}{R}\\frac{\\mathrm{d}R}{\\mathrm{d}p}=1+p^3$ 得 $\\frac{\\mathrm{d}R}{R}=\\big(\\frac{1}{p}+p^2\\big)\\mathrm{d}p$，积分得 $\\ln R=\\ln p+\\frac{p^3}{3}+C$。由 $R(1)=1$ 得 $C=-\\frac13$，故 $\\ln R=\\ln p+\\frac{p^3-1}{3}$，即 $R(p)=p\\,\\mathrm{e}^{(p^3-1)/3}$。",
      src: { file: "参考文件/真题/数学/5、【1987-2025年】考研数学三真题/3、2010-2022考研数学三真题.pdf", page: 50, no: "二(11)", note: "题面：合并册 2010 卷 p50 裁片 m3-1012-p50-top.png 亲读；答案与 2010 答案册 p3 对拍（册上 p·e^{(p³−1)/3}），独立重推一致（分离变量 + R(1)=1 定常数）；OCR 文本层仅作交叉核对，不作题面来源。" }
    },
    {
      id: "m3-2010-12", origin: "year", year: 2010, no: "二(12)", type: "deriv", star: 2, school: "全国硕士研究生入学统一考试-数学三 2010 年",
      tags: ["ext06","gx22"],
      stem: "若曲线 $y=x^3+ax^2+bx+1$ 有拐点 $(-1,0)$，则 $b=$ \\_\\_\\_\\_.",
      answer: "$b=3$。$y''=6x+2a$，拐点横坐标 $-1$ 处 $y''(-1)=0$，得 $-6+2a=0$，$a=3$；又拐点在曲线上，代入 $(-1,0)$：$-1+a-b+1=0$，故 $b=a=3$。",
      src: { file: "参考文件/真题/数学/5、【1987-2025年】考研数学三真题/3、2010-2022考研数学三真题.pdf", page: 50, no: "二(12)", note: "题面：合并册 2010 卷 p50 裁片 m3-1012-p50-top.png 亲读；答案与 2010 答案册 p3 对拍（册上 b=3），独立重推一致（y″(−1)=0 得 a=3，再代入点得 b=3）；OCR 文本层仅作交叉核对，不作题面来源。" }
    },
    {
      id: "m3-2010-13", origin: "year", year: 2010, no: "二(13)", type: "linalg", star: 3, school: "全国硕士研究生入学统一考试-数学三 2010 年",
      tags: ["la01","la02","zb20"],
      stem: "设 $\\boldsymbol{A},\\boldsymbol{B}$ 为 $3$ 阶矩阵，且 $|\\boldsymbol{A}|=3$，$|\\boldsymbol{B}|=2$，$|\\boldsymbol{A}^{-1}+\\boldsymbol{B}|=2$，则 $|\\boldsymbol{A}+\\boldsymbol{B}^{-1}|=$ \\_\\_\\_\\_.",
      answer: "$3$。因 $\\boldsymbol{A}+\\boldsymbol{B}^{-1}=\\boldsymbol{A}(\\boldsymbol{A}^{-1}+\\boldsymbol{B})\\boldsymbol{B}^{-1}$，故 $$|\\boldsymbol{A}+\\boldsymbol{B}^{-1}|=|\\boldsymbol{A}|\\cdot|\\boldsymbol{A}^{-1}+\\boldsymbol{B}|\\cdot|\\boldsymbol{B}^{-1}|=3\\times2\\times\\frac{1}{2}=3.$$",
      src: { file: "参考文件/真题/数学/5、【1987-2025年】考研数学三真题/3、2010-2022考研数学三真题.pdf", page: 50, no: "二(13)", note: "题面：合并册 2010 卷 p50 裁片 m3-1012-p50-bot.png 亲读；答案与 2010 答案册 p4 对拍（册上 3），独立重推一致（A+B⁻¹=A(A⁻¹+B)B⁻¹）；OCR 文本层仅作交叉核对，不作题面来源。" }
    },
    {
      id: "m3-2010-14", origin: "year", year: 2010, no: "二(14)", type: "estimate", star: 2, school: "全国硕士研究生入学统一考试-数学三 2010 年",
      tags: ["gx55","gx64"],
      stem: "设 $X_1,X_2,\\cdots,X_n$ 是来自总体 $N(\\mu,\\sigma^2)\\ (\\sigma>0)$ 的简单随机样本。记统计量 $T=\\dfrac{1}{n}\\sum\\limits_{i=1}^{n}X_i^2$，则 $E(T)=$ \\_\\_\\_\\_.",
      answer: "$\\mu^2+\\sigma^2$。$E(T)=\\frac1n\\sum_{i=1}^n E(X_i^2)=E(X_1^2)=D(X_1)+[E(X_1)]^2=\\sigma^2+\\mu^2$。",
      src: { file: "参考文件/真题/数学/5、【1987-2025年】考研数学三真题/3、2010-2022考研数学三真题.pdf", page: 50, no: "二(14)", note: "题面：合并册 2010 卷 p50 裁片 m3-1012-p50-bot.png 亲读；答案与 2010 答案册 p4 对拍（册上 σ²+μ²），独立重推一致（E(X²)=D(X)+[E(X)]²）；OCR 文本层仅作交叉核对，不作题面来源。" }
    },
    {
      id: "m3-2010-15", origin: "year", year: 2010, no: "三(15)", type: "limit", star: 3, school: "全国硕士研究生入学统一考试-数学三 2010 年",
      tags: ["zt06","lim07","zt04"],
      stem: "求极限 $\\lim\\limits_{x\\to+\\infty}\\left(x^{\\frac{1}{x}}-1\\right)^{\\frac{1}{\\ln x}}$.",
      answer: "$\\mathrm{e}^{-1}$。因 $x^{1/x}-1=\\mathrm{e}^{\\ln x/x}-1\\sim\\dfrac{\\ln x}{x}$（$x\\to+\\infty$），故 $$\\ln\\!\\left(x^{1/x}-1\\right)=\\ln\\ln x-\\ln x+o(1),$$于是 $\\frac{1}{\\ln x}\\ln\\!\\left(x^{1/x}-1\\right)=\\frac{\\ln\\ln x}{\\ln x}-1+o(1)\\to-1$，原式 $=\\mathrm{e}^{-1}$。",
      traps: "不能把 $x^{1/x}-1$ 直接看成 $\\frac{\\ln x}{x}$ 后把指数 $\\frac{1}{\\ln x}$ 与底数分别取极限（$\\frac{\\ln x}{x}\\to0$、指数 $\\to0$ 是 $0^0$ 型），必须先取对数化成形如 $\\frac{\\ln(x^{1/x}-1)}{\\ln x}$ 的 $\\frac{\\infty}{\\infty}$ 型。",
      src: { file: "参考文件/真题/数学/5、【1987-2025年】考研数学三真题/3、2010-2022考研数学三真题.pdf", page: 50, no: "三(15)", note: "题面：合并册 2010 卷 p50 裁片 m3-1012-p50-bot.png 亲读（指数为 1/ln x）；答案与 2010 答案册 p4 对拍（册上 e⁻¹），独立重推一致（先取对数，ln ln x/ln x → 0）；OCR 文本层仅作交叉核对，不作题面来源。" }
    },
    {
      id: "m3-2010-16", origin: "year", year: 2010, no: "三(16)", type: "dblint", star: 4, school: "全国硕士研究生入学统一考试-数学三 2010 年",
      tags: ["dbi01","ext27","tp08"],
      stem: "计算二重积分 $\\displaystyle\\iint_D (x+y)^3\\,\\mathrm{d}x\\mathrm{d}y$，其中 $D$ 由曲线 $x=\\sqrt{1+y^2}$ 与直线 $x+\\sqrt{2}y=0$ 及 $x-\\sqrt{2}y=0$ 围成.",
      answer: "$\\dfrac{14}{15}$。$D$ 关于 $x$ 轴对称，展开 $(x+y)^3=x^3+3x^2y+3xy^2+y^3$，其中 $3x^2y+y^3$ 是 $y$ 的奇函数，在 $D$ 上积分为 $0$；余下 $x^3+3xy^2$ 是 $y$ 的偶函数。曲线与直线交于 $y=\\pm1$（$x=\\sqrt2$），取上半 $0\\le y\\le1$、$\\sqrt2\\,y\\le x\\le\\sqrt{1+y^2}$，则 $$\\iint_D(x+y)^3\\mathrm{d}x\\mathrm{d}y=2\\int_0^1\\!\\int_{\\sqrt2 y}^{\\sqrt{1+y^2}}(x^3+3xy^2)\\,\\mathrm{d}x\\,\\mathrm{d}y.$$内层原函数 $\\frac{x^4}{4}+\\frac32x^2y^2$ 代入上下限得 $\\frac14+2y^2-\\frac94y^4$，故原式 $=2\\big[\\frac14+\\frac23-\\frac{9}{20}\\big]=\\frac{14}{15}$。",
      traps: "误把整个 $(x+y)^3$ 当 $y$ 的奇/偶函数；或忽略 $D$ 关于 $x$ 轴的对称性而漏乘系数 2；积分上限应是 $\\sqrt{1+y^2}$、下限 $\\sqrt2y$，二者在 $y=1$ 处相交。",
      hint: "先展开 $(x+y)^3$，按 $y$ 的奇偶性分出为零的项；再取 $y\\ge0$ 的半区域，用 $x$ 从 $\\sqrt2y$ 到 $\\sqrt{1+y^2}$ 的 X 型累次积分，最后乘 2。",
      src: { file: "参考文件/真题/数学/5、【1987-2025年】考研数学三真题/3、2010-2022考研数学三真题.pdf", page: 51, no: "三(16)", note: "题面：合并册 2010 卷 p51 裁片 m3-1012-p51-top.png 亲读（曲线 x=√(1+y²)）；答案与 2010 答案册 p4 对拍（册上 14/15，解析册将 D 拆为 D₁∪D₂ 且用奇函数项为零），独立重推一致（2∫₀¹(1/4+2y²−9y⁴/4)dy=14/15）；OCR 文本层仅作交叉核对，不作题面来源。" }
    },
    {
      id: "m3-2010-17", origin: "year", year: 2010, no: "三(17)", type: "multivar", star: 3, school: "全国硕士研究生入学统一考试-数学三 2010 年",
      tags: ["multi04","tp06","gx41"],
      stem: "求函数 $u=xy+2yz$ 在约束条件 $x^2+y^2+z^2=10$ 下的最大值和最小值.",
      answer: "最大值 $5\\sqrt5$，最小值 $-5\\sqrt5$。令 $F=xy+2yz+\\lambda(x^2+y^2+z^2-10)$，由 $F_x=y+2\\lambda x=0$、$F_y=x+2z+2\\lambda y=0$、$F_z=2y+2\\lambda z=0$ 得 $z=2x$、$y=-2\\lambda x$、$\\lambda^2=\\frac54$。$\\lambda=-\\frac{\\sqrt5}{2}$ 时 $y=\\sqrt5x$、$z=2x$、$x=\\pm1$，驻点 $(1,\\sqrt5,2)$、$(-1,-\\sqrt5,-2)$ 处 $u=5\\sqrt5$；$\\lambda=\\frac{\\sqrt5}{2}$ 时 $y=-\\sqrt5x$，驻点 $(1,-\\sqrt5,2)$、$(-1,\\sqrt5,-2)$ 处 $u=-5\\sqrt5$；另有 $\\lambda=0$ 时 $y=0,\\,x=-2z$（$z=\\pm\\sqrt2$），$u=0$。比较得 $u_{\\max}=5\\sqrt5$，$u_{\\min}=-5\\sqrt5$。",
      traps: "漏掉 $\\lambda=0$（此时 $y=0,\\ x=-2z$）这一类驻点；或混淆 $y=\\pm\\sqrt5x$ 对应的极值符号。约束集为紧球面，最值一定存在，比较全部驻点函数值即可。",
      src: { file: "参考文件/真题/数学/5、【1987-2025年】考研数学三真题/3、2010-2022考研数学三真题.pdf", page: 51, no: "三(17)", note: "题面：合并册 2010 卷 p51 裁片 m3-1012-p51-top.png 亲读；答案与 2010 答案册 p5 对拍（册上 max 5√5、min −5√5，六个驻点），独立重推一致（λ²=5/4，z=2x，比较得 ±5√5，另有 λ=0 时 u=0）；OCR 文本层仅作交叉核对，不作题面来源。" }
    },
    {
      id: "m3-2010-18", origin: "year", year: 2010, no: "三(18)", type: "integral", star: 4, school: "全国硕士研究生入学统一考试-数学三 2010 年",
      tags: ["zb02","kn46","zt03"],
      stem: "(I) 比较 $\\int_0^1|\\ln t|\\,[\\ln(1+t)]^n\\,\\mathrm{d}t$ 与 $\\int_0^1 t^n|\\ln t|\\,\\mathrm{d}t\\ (n=1,2,\\cdots)$ 的大小，说明理由；(II) 记 $u_n=\\int_0^1|\\ln t|\\,[\\ln(1+t)]^n\\,\\mathrm{d}t\\ (n=1,2,\\cdots)$，求极限 $\\lim\\limits_{n\\to\\infty}u_n$.",
      answer: "(I) 当 $0<t<1$ 时 $0<\\ln(1+t)<t$，故 $[\\ln(1+t)]^n<t^n$；乘 $|\\ln t|\\ge0$ 并在 $[0,1]$ 上积分得 $$\\int_0^1|\\ln t|[\\ln(1+t)]^n\\,\\mathrm{d}t<\\int_0^1 t^n|\\ln t|\\,\\mathrm{d}t\\quad(n=1,2,\\cdots).$$(II) $0<u_n<\\int_0^1 t^n|\\ln t|\\,\\mathrm{d}t=\\dfrac{1}{(n+1)^2}\\to0$，由夹逼准则 $\\lim\\limits_{n\\to\\infty}u_n=0$。",
      traps: "(I) 中不等号方向易写反（$\\ln(1+t)<t$，不是大于）；(II) 须先由 $\\int_0^1 t^n|\\ln t|\\mathrm{d}t=\\frac{1}{(n+1)^2}$ 给出可趋于 0 的上界，不能只说「被积函数趋于 0」。",
      src: { file: "参考文件/真题/数学/5、【1987-2025年】考研数学三真题/3、2010-2022考研数学三真题.pdf", page: 51, no: "三(18)", note: "题面：合并册 2010 卷 p51 上下裁片 m3-1012-p51-top.png / m3-1012-p51-bot.png 亲读（(I) 两积分比较、(II) uₙ 定义与极限）；答案与 2010 答案册 p5 对拍（册上 (I) 前者小于后者、(II) 极限 0），独立重推一致（0<uₙ<1/(n+1)²）；OCR 文本层仅作交叉核对，不作题面来源。" }
    },
    {
      id: "m3-2010-19", origin: "year", year: 2010, no: "三(19)", type: "proof", star: 4, school: "全国硕士研究生入学统一考试-数学三 2010 年",
      tags: ["ext11","mvt01","mvt02"],
      stem: "设函数 $f(x)$ 在 $[0,3]$ 上连续，在 $(0,3)$ 内存在二阶导数，且 $2f(0)=\\int_0^2 f(x)\\,\\mathrm{d}x=f(2)+f(3)$。(I) 证明存在 $\\eta\\in(0,2)$，使 $f(\\eta)=f(0)$；(II) 证明存在 $\\xi\\in(0,3)$，使 $f''(\\xi)=0$.",
      answer: "(I) 由积分中值定理，存在 $\\eta_0\\in[0,2]$ 使 $\\int_0^2 f(x)\\mathrm{d}x=2f(\\eta_0)$，结合 $2f(0)=\\int_0^2f$ 得 $f(\\eta_0)=f(0)$。若 $f$ 在 $[0,2]$ 上恒等于 $f(0)$，则 $(0,2)$ 内任一点可作 $\\eta$；否则由 $\\int_0^2\\big(f(x)-f(0)\\big)\\mathrm{d}x=0$ 及连续性知 $f(x)-f(0)$ 在 $(0,2)$ 内必变号取零，故可取 $\\eta\\in(0,2)$ 使 $f(\\eta)=f(0)$。\n(II) 由 $2f(0)=f(2)+f(3)$ 得 $f(0)=\\frac{f(2)+f(3)}{2}$，由介值定理存在 $\\eta_1\\in(2,3)$ 使 $f(\\eta_1)=f(0)$。在 $[0,\\eta]$ 与 $[\\eta,\\eta_1]$ 上分别用罗尔定理，得 $\\xi_1\\in(0,\\eta)$、$\\xi_2\\in(\\eta,\\eta_1)$ 使 $f'(\\xi_1)=f'(\\xi_2)=0$；再在 $[\\xi_1,\\xi_2]$ 上对 $f'$ 用罗尔定理，得 $\\xi\\in(\\xi_1,\\xi_2)\\subset(0,3)$ 使 $f''(\\xi)=0$。",
      traps: "(I) 积分中值定理只给 $\\eta\\in[0,2]$（闭区间），题目要求开区间 $(0,2)$，需补一句「若 f 恒为常数则任取内点，否则变号取零」；(II) 须凑出两个使 $f'$ 为零的点再用一次罗尔，不能只用一个点就断言 $f''=0$。",
      hint: "(I) 积分中值定理 + 连续性把闭区间端点情形排除；(II) 由 $f(0)=\\frac{f(2)+f(3)}{2}$ 用介值定理在 $(2,3)$ 找 $\\eta_1$，再对 $f$ 用两次罗尔、对 $f'$ 用一次罗尔。",
      src: { file: "参考文件/真题/数学/5、【1987-2025年】考研数学三真题/3、2010-2022考研数学三真题.pdf", page: 51, no: "三(19)", note: "题面：合并册 2010 卷 p51 裁片 m3-1012-p51-bot.png 亲读（2f(0)=∫₀²f=f(2)+f(3)）；答案与 2010 答案册 p5–p6 对拍（册上用积分中值定理 + 介值定理 + 三次罗尔），独立重推一致；册上 (I) 只写 η∈[0,2]，按卷面要求补证可取 η∈(0,2)；OCR 文本层仅作交叉核对，不作题面来源。" }
    },
    {
      id: "m3-2010-20", origin: "year", year: 2010, no: "三(20)", type: "linalg", star: 3, school: "全国硕士研究生入学统一考试-数学三 2010 年",
      tags: ["zb08","tp09","kn37"],
      stem: "设 $\\boldsymbol{A}=\\begin{pmatrix}\\lambda&1&1\\\\0&\\lambda-1&0\\\\1&1&\\lambda\\end{pmatrix}$，$\\boldsymbol{b}=\\begin{pmatrix}a\\\\1\\\\1\\end{pmatrix}$。已知线性方程组 $\\boldsymbol{A}\\boldsymbol{x}=\\boldsymbol{b}$ 存在两个不同的解。(I) 求 $\\lambda,\\,a$；(II) 求方程组 $\\boldsymbol{A}\\boldsymbol{x}=\\boldsymbol{b}$ 的通解.",
      answer: "$\\lambda=-1,\\;a=-2$；通解 $\\boldsymbol{x}=\\begin{pmatrix}3/2\\\\-1/2\\\\0\\end{pmatrix}+k\\begin{pmatrix}1\\\\0\\\\1\\end{pmatrix}\\ (k\\in\\mathbb{R})$。由有两个不同解知 $r(\\boldsymbol{A})=r(\\boldsymbol{A},\\boldsymbol{b})<3$，故 $|\\boldsymbol{A}|=(\\lambda-1)^2(\\lambda+1)=0$，$\\lambda=1$ 或 $-1$；$\\lambda=1$ 时增广矩阵出现 $0=1$（无解），舍去。$\\lambda=-1$ 时对增广矩阵作行变换，末行相容要求 $a+2=0$，故 $a=-2$。此时方程组等价于 $x_1-x_3=\\frac32,\\;x_2=-\\frac12$，取 $x_3$ 为自由变量即得通解。",
      traps: "$\\lambda=1$ 时 $|\\boldsymbol{A}|=0$ 但增广矩阵不相容（无解），必须检验并舍去；通解里特解与非齐次方向向量不要写反。",
      src: { file: "参考文件/真题/数学/5、【1987-2025年】考研数学三真题/3、2010-2022考研数学三真题.pdf", page: 52, no: "三(20)", note: "题面：合并册 2010 卷 p52 裁片 m3-1012-p52-top.png 亲读（A、b 逐元素）；答案与 2010 答案册 p6–p7 对拍（册上 λ=−1, a=−2，通解 (3/2,−1/2,0)+k(1,0,1)），独立重推一致（|A|=(λ−1)²(λ+1)，λ=1 无解舍去）；OCR 文本层仅作交叉核对，不作题面来源。" }
    },
    {
      id: "m3-2010-21", origin: "year", year: 2010, no: "三(21)", type: "eigen", star: 4, school: "全国硕士研究生入学统一考试-数学三 2010 年",
      tags: ["la14","la04","tp04"],
      stem: "设 $\\boldsymbol{A}=\\begin{pmatrix}0&-1&4\\\\-1&3&a\\\\4&a&0\\end{pmatrix}$，正交矩阵 $\\boldsymbol{Q}$ 使 $\\boldsymbol{Q}^{\\mathrm{T}}\\boldsymbol{A}\\boldsymbol{Q}$ 为对角矩阵，若 $\\boldsymbol{Q}$ 的第 $1$ 列为 $\\dfrac{1}{\\sqrt{6}}(1,2,1)^{\\mathrm{T}}$，求 $a,\\,\\boldsymbol{Q}$.",
      answer: "$a=-1$，且 $\\boldsymbol{Q}=\\left(\\dfrac{1}{\\sqrt6}(1,2,1)^{\\mathrm T},\\ \\dfrac{1}{\\sqrt2}(-1,0,1)^{\\mathrm T},\\ \\dfrac{1}{\\sqrt3}(1,-1,1)^{\\mathrm T}\\right)$，使 $\\boldsymbol{Q}^{\\mathrm T}\\boldsymbol{A}\\boldsymbol{Q}=\\mathrm{diag}(2,-4,5)$。$\\boldsymbol{Q}$ 第 1 列是 $\\boldsymbol{A}$ 的特征向量，故 $\\boldsymbol{A}(1,2,1)^{\\mathrm T}=(2,5+a,4+2a)^{\\mathrm T}=\\lambda_1(1,2,1)^{\\mathrm T}$，得 $\\lambda_1=2$、$5+a=4$、$4+2a=2$，即 $a=-1$。此时 $|\\lambda\\boldsymbol{E}-\\boldsymbol{A}|=(\\lambda+4)(\\lambda-2)(\\lambda-5)$，特征值为 $2,-4,5$；对应特征向量 $(1,2,1)^{\\mathrm T},(-1,0,1)^{\\mathrm T},(1,-1,1)^{\\mathrm T}$ 已两两正交，单位化后按列排成 $\\boldsymbol{Q}$。",
      traps: "由第 1 列确定 $a$ 时须用完整的 $A\\xi=\\lambda\\xi$ 三个分量（不能只用一个分量）；三个特征向量虽来自不同特征值已正交，仍须单位化；$\\boldsymbol{Q}$ 的列顺序要与对角元 $2,-4,5$ 对应。",
      hint: "「正交矩阵 Q 使 QᵀAQ 为对角阵」即 Q 的列为 A 的单位正交特征向量；先用第 1 列代入 Aξ=λξ 求出 a 与 λ₁，再求其余特征值与特征向量、单位化。",
      src: { file: "参考文件/真题/数学/5、【1987-2025年】考研数学三真题/3、2010-2022考研数学三真题.pdf", page: 52, no: "三(21)", note: "题面：合并册 2010 卷 p52 裁片 m3-1012-p52-top.png 亲读（A 为 3×3，Q 第 1 列 (1,2,1)ᵀ/√6）；答案与 2010 答案册 p7–p8 对拍（册上 a=−1、λ₁=2、特征值 2,−4,5、Q 由三个单位特征向量组成），独立重推一致；OCR 文本层仅作交叉核对，不作题面来源。" }
    },
    {
      id: "m3-2010-22", origin: "year", year: 2010, no: "三(22)", type: "estimate", star: 3, school: "全国硕士研究生入学统一考试-数学三 2010 年",
      tags: ["int23","ext09","gx32"],
      stem: "设二维随机变量 $(X,Y)$ 的概率密度为 $f(x,y)=A\\mathrm{e}^{-2x^2+2xy-y^2}$，$-\\infty<x<+\\infty$，$-\\infty<y<+\\infty$，求常数 $A$ 及条件概率密度 $f_{Y|X}(y\\,|\\,x)$.",
      answer: "$A=\\dfrac{1}{\\pi}$，$f_{Y|X}(y\\,|\\,x)=\\dfrac{1}{\\sqrt\\pi}\\mathrm{e}^{-(y-x)^2}\\ (-\\infty<y<+\\infty)$。配方 $-2x^2+2xy-y^2=-(y-x)^2-x^2$，故 $$f_X(x)=A\\mathrm{e}^{-x^2}\\int_{-\\infty}^{+\\infty}\\mathrm{e}^{-(y-x)^2}\\mathrm{d}y=A\\sqrt\\pi\\,\\mathrm{e}^{-x^2}.$$由 $\\int_{-\\infty}^{+\\infty}f_X=1$ 得 $A\\sqrt\\pi\\cdot\\sqrt\\pi=A\\pi=1$，故 $A=1/\\pi$。于是 $$f_{Y|X}(y\\,|\\,x)=\\frac{f(x,y)}{f_X(x)}=\\frac{1}{\\sqrt\\pi}\\mathrm{e}^{-(y-x)^2},$$即 $Y\\,|\\,X=x\\sim N(x,\\tfrac12)$。",
      traps: "指数配方易错（应配成 $-(y-x)^2-x^2$）；高斯积分 $\\int_{-\\infty}^{+\\infty}\\mathrm{e}^{-u^2}\\mathrm{d}u=\\sqrt\\pi$ 用错会得到 $A=1/(2\\pi)$ 等错误结果；条件密度须除以边缘密度 $f_X(x)$，不能直接把联合密度归一化。",
      src: { file: "参考文件/真题/数学/5、【1987-2025年】考研数学三真题/3、2010-2022考研数学三真题.pdf", page: 52, no: "三(22)", note: "题面：合并册 2010 卷 p52 裁片 m3-1012-p52-bot.png 超清亲读（指数为 −2x²+2xy−y²）；答案与 2010 答案册 p8 对拍（册上 A=1/π、f_{Y|X}=(1/√π)e^{−(y−x)²}），独立重推一致（配方 + 高斯积分 √π）；OCR 文本层仅作交叉核对，不作题面来源。" }
    },
    {
      id: "m3-2010-23", origin: "year", year: 2010, no: "三(23)", type: "estimate", star: 3, school: "全国硕士研究生入学统一考试-数学三 2010 年",
      tags: ["gx55","gx64"],
      stem: "箱中装有 $6$ 个球，其中红、白、黑球的个数分别为 $1,2,3$ 个。现从箱中随机地取出 $2$ 个球，记 $X$ 为取出的红球个数，$Y$ 为取出的白球个数。(I) 求随机变量 $(X,Y)$ 的概率分布；(II) 求 $\\mathrm{Cov}(X,Y)$.",
      answer: "(I) $P(X=0,Y=0)=\\frac{3}{15}=\\frac15$，$P(0,1)=\\frac{6}{15}=\\frac25$，$P(0,2)=\\frac{1}{15}$，$P(1,0)=\\frac{3}{15}=\\frac15$，$P(1,1)=\\frac{2}{15}$，$P(1,2)=0$（因取 2 个球，$X+Y\\le2$，且总数 $\\mathrm{C}_6^2=15$，$P(X=i,Y=j)=\\frac{\\mathrm{C}_1^i\\mathrm{C}_2^j\\mathrm{C}_3^{2-i-j}}{15}$）。\n(II) $\\mathrm{Cov}(X,Y)=-\\frac{4}{45}$。$E(X)=\\frac13$，$E(Y)=\\frac23$，$E(XY)=1\\cdot1\\cdot\\frac{2}{15}=\\frac{2}{15}$，故 $\\mathrm{Cov}(X,Y)=\\frac{2}{15}-\\frac13\\cdot\\frac23=-\\frac{4}{45}$。",
      traps: "漏掉 $P(1,2)=0$（取 2 个球不可能同时 1 红 2 白）；把 $E(XY)$ 误算成 $E(X)E(Y)$（二者不独立）；组合数分母应为 $\\mathrm{C}_6^2=15$ 而非 6×5=30（不放回、不计顺序）。",
      src: { file: "参考文件/真题/数学/5、【1987-2025年】考研数学三真题/3、2010-2022考研数学三真题.pdf", page: 52, no: "三(23)", note: "题面：合并册 2010 卷 p52 裁片 m3-1012-p52-bot.png 亲读（红白黑 1,2,3 个，取 2 个）；答案与 2010 答案册 p9 对拍（册上分布表六个概率、Cov=−4/45），独立重推一致（C₆²=15，E(XY)=2/15）；OCR 文本层仅作交叉核对，不作题面来源。" }
    },
    {
      id: "m3-2011-9", origin: "year", year: 2011, no: "二(9)", type: "deriv", star: 3, school: "全国硕士研究生入学统一考试-数学三 2011 年",
      tags: ["lim01","dr04","ext02"],
      stem: "设 $f(x)=\\lim\\limits_{t\\to0}x(1+3t)^{\\frac{x}{t}}$，则 $f'(x)=$ \\_\\_\\_\\_.",
      answer: "$f'(x)=(1+3x)\\mathrm{e}^{3x}$。由重要极限 $\\lim\\limits_{t\\to0}(1+3t)^{\\frac{1}{3t}}=\\mathrm{e}$ 得 $\\lim\\limits_{t\\to0}(1+3t)^{\\frac{x}{t}}=\\mathrm{e}^{3x}$，故 $f(x)=x\\mathrm{e}^{3x}$，由乘积法则 $f'(x)=\\mathrm{e}^{3x}+3x\\mathrm{e}^{3x}=(1+3x)\\mathrm{e}^{3x}$。",
      traps: "易把 $\\lim\\limits_{t\\to0}(1+3t)^{x/t}$ 误算成 $\\mathrm{e}^{x}$：须配成 $\\big[(1+3t)^{1/(3t)}\\big]^{3x}\\to\\mathrm{e}^{3x}$；$x$ 对极限变量 $t$ 是常数，求导时用乘积法则。",
      src: { file: "参考文件/真题/数学/5、【1987-2025年】考研数学三真题/3、2010-2022考研数学三真题.pdf", page: 46, no: "二(9)", note: "卷首页 p45 页眉「2011 年全国硕士研究生招生考试试题」亲读确认（卷内第 1 页；2011 卷 p45–p48）。题面：合并册 p46 整页 m3-book-p46.png 及高清半页 w3h-2011-p46-top.png 逐字亲读（极限下标 t→0、指数 x/t、求 f'(x)）；答案与 2011 解析册 p4 对拍（册上 e^{3x}(1+3x)），独立重推一致（1^∞ 型极限得 f(x)=x·e^{3x} 再求导）；数学三 OCR 文本层不作题面来源。" }
    },
    {
      id: "m3-2011-10", origin: "year", year: 2011, no: "二(10)", type: "multivar", star: 3, school: "全国硕士研究生入学统一考试-数学三 2011 年",
      tags: ["multi01","multi03","ln01"],
      stem: "设函数 $z=\\left(1+\\dfrac{x}{y}\\right)^{\\frac{x}{y}}$，则 $\\mathrm{d}z\\big|_{(1,1)}=$ \\_\\_\\_\\_.",
      answer: "$\\mathrm{d}z\\big|_{(1,1)}=(1+2\\ln2)(\\mathrm{d}x-\\mathrm{d}y)$。记 $t=\\dfrac{x}{y}$，则 $z=(1+t)^t$，$\\ln z=t\\ln(1+t)$，故 $\\dfrac{\\mathrm{d}z}{z}=\\left[\\ln(1+t)+\\dfrac{t}{1+t}\\right]\\mathrm{d}t$。在 $(1,1)$ 处 $t=1,\\ z=2,\\ \\mathrm{d}t=\\mathrm{d}x-\\mathrm{d}y$，且 $\\ln(1+t)+\\frac{t}{1+t}=\\ln2+\\frac12$，所以 $\\mathrm{d}z=2\\left(\\ln2+\\frac12\\right)(\\mathrm{d}x-\\mathrm{d}y)=(1+2\\ln2)(\\mathrm{d}x-\\mathrm{d}y)$。",
      src: { file: "参考文件/真题/数学/5、【1987-2025年】考研数学三真题/3、2010-2022考研数学三真题.pdf", page: 46, no: "二(10)", note: "题面：合并册 p46 整页 m3-book-p46.png 及高清半页 w3h-2011-p46-top.png 逐字亲读（底数 1+x/y、指数 x/y、求 dz 在 (1,1)）；答案与 2011 解析册 p4 对拍（册上 (1+2ln2)(dx−dy)），独立重推一致（令 t=x/y 取对数微分，dt=dx−dy）；数学三 OCR 文本层不作题面来源。" }
    },
    {
      id: "m3-2011-11", origin: "year", year: 2011, no: "二(11)", type: "deriv", star: 3, school: "全国硕士研究生入学统一考试-数学三 2011 年",
      tags: ["dr04","ext06","gx22"],
      stem: "曲线 $\\tan\\left(x+y+\\dfrac{\\pi}{4}\\right)=\\mathrm{e}^{y}$ 在点 $(0,0)$ 处的切线方程为 \\_\\_\\_\\_.",
      answer: "$y=-2x$。方程两端对 $x$ 求导：$\\sec^2\\left(x+y+\\frac{\\pi}{4}\\right)(1+y')=\\mathrm{e}^{y}y'$。代入 $(0,0)$ 得 $\\frac{1}{\\cos^2(\\pi/4)}(1+y')=y'$，即 $2(1+y')=y'$，故 $y'(0)=-2$，切线方程为 $y=-2x$。",
      src: { file: "参考文件/真题/数学/5、【1987-2025年】考研数学三真题/3、2010-2022考研数学三真题.pdf", page: 46, no: "二(11)", note: "题面：合并册 p46 整页 m3-book-p46.png 及高清半页 w3h-2011-p46-top.png 逐字亲读（tan 括号内 x+y+π/4、右端 e^y、点 (0,0)）；答案与 2011 解析册 p4 对拍（册上 y=−2x），独立重推一致（隐函数求导得 y'(0)=−2）；数学三 OCR 文本层不作题面来源。" }
    },
    {
      id: "m3-2011-12", origin: "year", year: 2011, no: "二(12)", type: "integral", star: 3, school: "全国硕士研究生入学统一考试-数学三 2011 年",
      tags: ["int29","wr03","ext09"],
      stem: "曲线 $y=\\sqrt{x^2-1}$，直线 $x=2$ 及 $x$ 轴所围的平面图形绕 $x$ 轴旋转所得的旋转体的体积为 \\_\\_\\_\\_.",
      answer: "$\\dfrac{4\\pi}{3}$。曲线与 $x$ 轴交于 $x=1$，由旋转体体积公式 $$V=\\pi\\int_1^{2}y^2\\,\\mathrm{d}x=\\pi\\int_1^{2}(x^2-1)\\,\\mathrm{d}x=\\pi\\left[\\frac{x^3}{3}-x\\right]_1^{2}=\\frac{4\\pi}{3}.$$",
      src: { file: "参考文件/真题/数学/5、【1987-2025年】考研数学三真题/3、2010-2022考研数学三真题.pdf", page: 46, no: "二(12)", note: "题面：合并册 p46 整页 m3-book-p46.png 及高清半页 w3h-2011-p46-top.png 逐字亲读（y=√(x²−1)、直线 x=2、绕 x 轴）；答案与 2011 解析册 p4 末–p5 对拍（册上 V=π∫₁²(x²−1)dx=4π/3），独立重推一致；数学三 OCR 文本层不作题面来源。" }
    },
    {
      id: "m3-2011-13", origin: "year", year: 2011, no: "二(13)", type: "eigen", star: 3, school: "全国硕士研究生入学统一考试-数学三 2011 年",
      tags: ["ms03","kn68","zt02"],
      stem: "设二次型 $f(x_1,x_2,x_3)=\\boldsymbol{x}^{\\mathrm{T}}\\boldsymbol{A}\\boldsymbol{x}$ 的秩为 $1$，$\\boldsymbol{A}$ 的各行元素之和为 $3$，则 $f$ 在正交变换 $\\boldsymbol{x}=\\boldsymbol{Q}\\boldsymbol{y}$ 下的标准形为 \\_\\_\\_\\_.",
      answer: "$3y_1^2$。$\\boldsymbol{A}$ 各行元素之和为 $3$ 即 $\\boldsymbol{A}(1,1,1)^{\\mathrm{T}}=3(1,1,1)^{\\mathrm{T}}$，故 $3$ 是 $\\boldsymbol{A}$ 的特征值；又 $r(\\boldsymbol{A})=1$，二次型矩阵只有一个非零特征值，故特征值为 $3,0,0$。正交变换下标准形的系数即特征值，故标准形为 $3y_1^2$。",
      src: { file: "参考文件/真题/数学/5、【1987-2025年】考研数学三真题/3、2010-2022考研数学三真题.pdf", page: 46, no: "二(13)", note: "题面：合并册 p46 整页 m3-book-p46.png 及高清半页 w3h-2011-p46-top.png 逐字亲读（秩为 1、各行元素之和为 3、正交变换 x=Qy 下的标准形）；答案与 2011 解析册 p5 对拍（册上 3y₁²），独立重推一致（各行和 3 给出特征值 3，秩 1 给出另两个为 0）；数学三 OCR 文本层不作题面来源。" }
    },
    {
      id: "m3-2011-14", origin: "year", year: 2011, no: "二(14)", type: "estimate", star: 3, school: "全国硕士研究生入学统一考试-数学三 2011 年",
      tags: ["zt04","int23","tp02"],
      stem: "设二维随机变量 $(X,Y)$ 服从正态分布 $N(\\mu,\\mu;\\sigma^2,\\sigma^2;0)$，则 $E(XY^2)=$ \\_\\_\\_\\_.",
      answer: "$\\mu(\\mu^2+\\sigma^2)$。因相关系数 $\\rho=0$，二维正态分布下 $X$ 与 $Y$ 相互独立，故 $E(XY^2)=E(X)E(Y^2)=\\mu\\left[D(Y)+(E(Y))^2\\right]=\\mu(\\sigma^2+\\mu^2)$。",
      src: { file: "参考文件/真题/数学/5、【1987-2025年】考研数学三真题/3、2010-2022考研数学三真题.pdf", page: 46, no: "二(14)", note: "题面：合并册 p46 整页 m3-book-p46.png 及高清半页 w3h-2011-p46-top.png / w3h-2011-p46-bot.png 逐字亲读（五参数 N(μ,μ;σ²,σ²;0)，求 E(XY²)）；答案与 2011 解析册 p5 对拍（册上 μ(μ²+σ²)），独立重推一致（ρ=0 得独立，E(Y²)=σ²+μ²）；数学三 OCR 文本层不作题面来源。" }
    },
    {
      id: "m3-2011-15", origin: "year", year: 2011, no: "三(15)", type: "limit", star: 3, school: "全国硕士研究生入学统一考试-数学三 2011 年",
      tags: ["lim07","tay01","ext02"],
      stem: "求极限 $\\lim\\limits_{x\\to0}\\dfrac{\\sqrt{1+2\\sin x}-x-1}{x\\ln(1+x)}$.",
      answer: "$-\\dfrac12$。分母 $x\\ln(1+x)\\sim x^2$；由 $\\sin x=x+o(x)$，$\\sqrt{1+2\\sin x}=1+\\sin x-\\frac12\\sin^2x+o(\\sin^2x)=1+x-\\frac12x^2+o(x^2)$，故分子 $\\sqrt{1+2\\sin x}-x-1=-\\frac12x^2+o(x^2)$，于是原式 $=\\lim\\limits_{x\\to0}\\frac{-x^2/2}{x^2}=-\\frac12$。",
      traps: "分子须展开到 $x^2$ 阶：若只取 $\\sqrt{1+2\\sin x}\\approx1+\\sin x$，分子为 $o(x)$ 会误得 $0$；$\\sqrt{1+u}=1+\\frac u2-\\frac{u^2}{8}+o(u^2)$ 的二阶项给出 $-\\frac12x^2$。",
      src: { file: "参考文件/真题/数学/5、【1987-2025年】考研数学三真题/3、2010-2022考研数学三真题.pdf", page: 46, no: "三(15)", note: "题面：合并册 p46 整页 m3-book-p46.png 及高清半页 w3h-2011-p46-bot.png 逐字亲读（分子 √(1+2sin x)−x−1、分母 x ln(1+x)、x→0）；答案与 2011 解析册 p5 末–p6 对拍（册上 −1/2，用两次洛必达），独立重推一致（泰勒展开到二阶，分子 −x²/2、分母 ~x²）；数学三 OCR 文本层不作题面来源。" }
    },
    {
      id: "m3-2011-16", origin: "year", year: 2011, no: "三(16)", type: "multivar", star: 4, school: "全国硕士研究生入学统一考试-数学三 2011 年",
      tags: ["multi03","multi01","gx41"],
      stem: "已知函数 $f(u,v)$ 具有二阶连续偏导数，$f(1,1)=2$ 是 $f(u,v)$ 的极值，$z=f(x+y, f(x,y))$。求 $\\left.\\dfrac{\\partial^2 z}{\\partial x\\partial y}\\right|_{(1,1)}$.",
      answer: "$\\left.\\dfrac{\\partial^2 z}{\\partial x\\partial y}\\right|_{(1,1)}=f_{11}''(2,2)+f_{2}'(2,2)\\,f_{12}''(1,1)$。记 $u=x+y,\\ v=f(x,y)$，则 $\\dfrac{\\partial z}{\\partial x}=f_1'(u,v)+f_2'(u,v)\\,f_1'(x,y)$，再对 $y$ 求偏导并代入 $(1,1)$：此时 $u=2,\\ v=f(1,1)=2$，由极值必要条件 $f_1'(1,1)=f_2'(1,1)=0$，含这两个零因子的项全部消去，只剩 $f_{11}''(2,2)+f_2'(2,2)f_{12}''(1,1)$。",
      hint: "「$f(1,1)=2$ 是极值」给出 $f_1'(1,1)=f_2'(1,1)=0$；外层 $f$ 的自变量在 $(1,1)$ 处取值 $(u,v)=(2,2)$，内层 $f$ 的偏导在 $(1,1)$ 处取值，二者不要混。",
      src: { file: "参考文件/真题/数学/5、【1987-2025年】考研数学三真题/3、2010-2022考研数学三真题.pdf", page: 46, no: "三(16)", note: "题面：合并册 p46 整页 m3-book-p46.png 及高清半页 w3h-2011-p46-bot.png 逐字亲读（f(1,1)=2 是极值、z=f(x+y, f(x,y))、求 ∂²z/∂x∂y 在 (1,1)）；答案与 2011 解析册 p6 对拍（册上结论 f''₁₁(2,2)+f'₂(2,2)·f''₁₂(1,1)），独立重推一致（极值条件消项）；册上中间步骤把内层自变量误印为 f(x+y)（应为 f(x,y)），属排版笔误，不影响结论；数学三 OCR 文本层不作题面来源。" }
    },
    {
      id: "m3-2011-17", origin: "year", year: 2011, no: "三(17)", type: "integral", star: 3, school: "全国硕士研究生入学统一考试-数学三 2011 年",
      tags: ["int24","int23","wr03"],
      stem: "求不定积分 $\\displaystyle\\int\\dfrac{\\arcsin\\sqrt{x}+\\ln x}{\\sqrt{x}}\\,\\mathrm{d}x$.",
      answer: "$2\\sqrt{x}\\arcsin\\sqrt{x}+2\\sqrt{x}\\ln x+2\\sqrt{1-x}-4\\sqrt{x}+C$。令 $t=\\sqrt{x}$（$x=t^2,\\ \\mathrm{d}x=2t\\,\\mathrm{d}t$），则原式 $=2\\displaystyle\\int(\\arcsin t+\\ln t^2)\\,\\mathrm{d}t=2\\int(\\arcsin t+2\\ln t)\\,\\mathrm{d}t=2t\\arcsin t+2\\sqrt{1-t^2}+4t\\ln t-4t+C$，回代 $t=\\sqrt{x}$ 并用 $\\ln\\sqrt{x}=\\frac12\\ln x$ 即得。",
      src: { file: "参考文件/真题/数学/5、【1987-2025年】考研数学三真题/3、2010-2022考研数学三真题.pdf", page: 47, no: "三(17)", note: "题面：合并册 p47 整页 m3-book-p47.png 及高清半页 w3h-2011-p47-top.png 逐字亲读（分子 arcsin√x+ln x、分母 √x）；答案与 2011 解析册 p6 末–p7 对拍（册上 2√x·arcsin√x+2√x·ln x+2√(1−x)−4√x+C），独立重推一致（令 t=√x 化为 2∫(arcsin t+2ln t)dt）；数学三 OCR 文本层不作题面来源。" }
    },
    {
      id: "m3-2011-18", origin: "year", year: 2011, no: "三(18)", type: "proof", star: 4, school: "全国硕士研究生入学统一考试-数学三 2011 年",
      tags: ["ext11","mvt01","mvt02"],
      stem: "证明方程 $4\\arctan x-x+\\dfrac{4\\pi}{3}-\\sqrt{3}=0$ 恰有两个实根.",
      answer: "令 $f(x)=4\\arctan x-x+\\frac{4\\pi}{3}-\\sqrt3$，则 $f'(x)=\\frac{4}{1+x^2}-1=\\frac{(\\sqrt3-x)(\\sqrt3+x)}{1+x^2}$，驻点 $x=\\pm\\sqrt3$。当 $x<-\\sqrt3$ 时 $f'<0$（递减），$-\\sqrt3<x<\\sqrt3$ 时 $f'>0$（递增），$x>\\sqrt3$ 时 $f'<0$（递减）。又 $f(-\\sqrt3)=0$，且在 $(-\\infty,-\\sqrt3)\\cup(-\\sqrt3,\\sqrt3)$ 上 $f(x)>0$，故 $(-\\infty,\\sqrt3]$ 上仅 $x=-\\sqrt3$ 一个零点。而 $f(\\sqrt3)=\\frac{8\\pi}{3}-2\\sqrt3>0$，$\\lim\\limits_{x\\to+\\infty}f(x)=-\\infty<0$，由零点定理及 $(\\sqrt3,+\\infty)$ 上严格递减，存在唯一 $x_0\\in(\\sqrt3,+\\infty)$ 使 $f(x_0)=0$。故方程恰有两个实根。",
      traps: "$x=-\\sqrt3$ 本身就是一个根（$f(-\\sqrt3)=0$），不是「极小值点处相切但无根」；第二个根在 $(\\sqrt3,+\\infty)$，须用 $f(\\sqrt3)>0$ 与 $\\lim\\limits_{x\\to+\\infty}f=-\\infty$ 加单调性保证唯一。",
      src: { file: "参考文件/真题/数学/5、【1987-2025年】考研数学三真题/3、2010-2022考研数学三真题.pdf", page: 47, no: "三(18)", note: "题面：合并册 p47 整页 m3-book-p47.png 及高清半页 w3h-2011-p47-top.png 逐字亲读（4arctan x−x+4π/3−√3=0，恰有两个实根）；答案与 2011 解析册 p7 对拍（册上驻点 ±√3、f(−√3)=0、f(√3)=8π/3−2√3>0、x→+∞ 时 f→−∞），独立重推一致（单调性 + 零点定理）；数学三 OCR 文本层不作题面来源。" }
    },
    {
      id: "m3-2011-19", origin: "year", year: 2011, no: "三(19)", type: "dblint", star: 4, school: "全国硕士研究生入学统一考试-数学三 2011 年",
      tags: ["dbi01","ode02","zt03"],
      stem: "设函数 $f(x)$ 在区间 $[0,1]$ 上具有连续导数，$f(0)=1$，且满足 $\\displaystyle\\iint_{D_t}f'(x+y)\\,\\mathrm{d}x\\mathrm{d}y=\\iint_{D_t}f(t)\\,\\mathrm{d}x\\mathrm{d}y$，其中 $D_t=\\{(x,y)\\mid 0\\le y\\le t-x,\\ 0\\le x\\le t\\}\\ (0<t\\le1)$。求 $f(x)$ 的表达式.",
      answer: "$f(x)=\\dfrac{4}{(x-2)^2}\\ (0\\le x\\le1)$。$D_t$ 是直角边为 $t$ 的三角形，面积 $\\frac{t^2}{2}$，故右端 $=\\frac{t^2}{2}f(t)$；左端先对 $y$ 积分： $$\\iint_{D_t}f'(x+y)\\,\\mathrm{d}x\\mathrm{d}y=\\int_0^t\\!\\mathrm{d}x\\int_0^{t-x}f'(x+y)\\,\\mathrm{d}y=\\int_0^t\\big[f(t)-f(x)\\big]\\,\\mathrm{d}x=tf(t)-\\int_0^tf(x)\\,\\mathrm{d}x.$$ 由题设 $tf(t)-\\int_0^tf(x)\\,\\mathrm{d}x=\\frac{t^2}{2}f(t)$，两端对 $t$ 求导并整理得 $(2-t)f'(t)=2f(t)$，分离变量解得 $f(t)=\\frac{C}{(t-2)^2}$，由 $f(0)=1$ 得 $C=4$。",
      src: { file: "参考文件/真题/数学/5、【1987-2025年】考研数学三真题/3、2010-2022考研数学三真题.pdf", page: 47, no: "三(19)", note: "题面：合并册 p47 整页 m3-book-p47.png 及高清半页 w3h-2011-p47-top.png / w3h-2011-p47-bot.png 逐字亲读（左被积 f'(x+y)、右被积 f(t)、D_t={0≤y≤t−x,0≤x≤t},0<t≤1、f(0)=1）；答案与 2011 解析册 p7 末–p8 对拍（册上 (2−t)f'(t)=2f(t)、f(x)=4/(x−2)², 0≤x≤1），独立重推一致（面积 t²/2，左端 tf(t)−∫₀ᵗf，求导得 ODE）；数学三 OCR 文本层不作题面来源。" }
    },
    {
      id: "m3-2011-20", origin: "year", year: 2011, no: "三(20)", type: "linalg", star: 4, school: "全国硕士研究生入学统一考试-数学三 2011 年",
      tags: ["la17","tp09","ln05"],
      stem: "设向量组 $\\boldsymbol{\\alpha}_1=(1,0,1)^{\\mathrm{T}},\\ \\boldsymbol{\\alpha}_2=(0,1,1)^{\\mathrm{T}},\\ \\boldsymbol{\\alpha}_3=(1,3,5)^{\\mathrm{T}}$ 不能由向量组 $\\boldsymbol{\\beta}_1=(1,1,1)^{\\mathrm{T}},\\ \\boldsymbol{\\beta}_2=(1,2,3)^{\\mathrm{T}},\\ \\boldsymbol{\\beta}_3=(3,4,a)^{\\mathrm{T}}$ 线性表示。(I) 求 $a$ 的值；(II) 将 $\\boldsymbol{\\beta}_1,\\boldsymbol{\\beta}_2,\\boldsymbol{\\beta}_3$ 用 $\\boldsymbol{\\alpha}_1,\\boldsymbol{\\alpha}_2,\\boldsymbol{\\alpha}_3$ 线性表示.",
      answer: "$a=5$；$\\boldsymbol{\\beta}_1=2\\boldsymbol{\\alpha}_1+4\\boldsymbol{\\alpha}_2-\\boldsymbol{\\alpha}_3,\\ \\boldsymbol{\\beta}_2=\\boldsymbol{\\alpha}_1+2\\boldsymbol{\\alpha}_2,\\ \\boldsymbol{\\beta}_3=5\\boldsymbol{\\alpha}_1+10\\boldsymbol{\\alpha}_2-2\\boldsymbol{\\alpha}_3$。(I) 对 $(\\boldsymbol{\\beta}_1,\\boldsymbol{\\beta}_2,\\boldsymbol{\\beta}_3,\\boldsymbol{\\alpha}_1,\\boldsymbol{\\alpha}_2,\\boldsymbol{\\alpha}_3)$ 作初等行变换，第三行化为 $(0,0,a-5,\\ 2,-1,0)$，$\\boldsymbol{\\alpha}_1$ 不能由 $\\boldsymbol{\\beta}$ 组线性表示要求 $r(\\boldsymbol{\\beta}_1,\\boldsymbol{\\beta}_2,\\boldsymbol{\\beta}_3)=2<r(\\boldsymbol{\\beta}_1,\\boldsymbol{\\beta}_2,\\boldsymbol{\\beta}_3,\\boldsymbol{\\alpha}_1)=3$，故 $a-5=0$，即 $a=5$。(II) 对 $(\\boldsymbol{\\alpha}_1,\\boldsymbol{\\alpha}_2,\\boldsymbol{\\alpha}_3,\\boldsymbol{\\beta}_1,\\boldsymbol{\\beta}_2,\\boldsymbol{\\beta}_3)$ 行变换化为 $(\\boldsymbol{E}\\mid\\boldsymbol{C})$，读出 $\\boldsymbol{C}$ 的三列即得上述线性表示。",
      src: { file: "参考文件/真题/数学/5、【1987-2025年】考研数学三真题/3、2010-2022考研数学三真题.pdf", page: 47, no: "三(20)", note: "题面：合并册 p47 整页 m3-book-p47.png 及高清半页 w3h-2011-p47-bot.png 逐字亲读（α 与 β 六个向量逐元素、(I) 求 a、(II) β 用 α 表示）；答案与 2011 解析册 p8 对拍（册上 a=5、β₁=2α₁+4α₂−α₃、β₂=α₁+2α₂、β₃=5α₁+10α₂−2α₃），独立重推一致（逐项回代验证 2α₁+4α₂−α₃=(1,1,1)ᵀ 等，β₃ 定出 a=5）；数学三 OCR 文本层不作题面来源。" }
    },
    {
      id: "m3-2011-21", origin: "year", year: 2011, no: "三(21)", type: "eigen", star: 4, school: "全国硕士研究生入学统一考试-数学三 2011 年",
      tags: ["la14","la04","tp04"],
      stem: "设 $\\boldsymbol{A}$ 为 $3$ 阶实对称矩阵，$\\boldsymbol{A}$ 的秩为 $2$，且 $\\boldsymbol{A}\\begin{pmatrix}1&1\\\\0&0\\\\-1&1\\end{pmatrix}=\\begin{pmatrix}-1&1\\\\0&0\\\\1&1\\end{pmatrix}$。(I) 求 $\\boldsymbol{A}$ 的所有特征值与特征向量；(II) 求矩阵 $\\boldsymbol{A}$.",
      answer: "(I) 特征值为 $-1,1,0$，对应特征向量分别为 $k_1(1,0,-1)^{\\mathrm{T}},\\ k_2(1,0,1)^{\\mathrm{T}},\\ k_3(0,1,0)^{\\mathrm{T}}$（$k_i\\ne0$）。由等式第 1、2 列得 $\\boldsymbol{A}(1,0,-1)^{\\mathrm{T}}=-(1,0,-1)^{\\mathrm{T}}$、$\\boldsymbol{A}(1,0,1)^{\\mathrm{T}}=(1,0,1)^{\\mathrm{T}}$，故 $-1,1$ 为特征值；由 $r(\\boldsymbol{A})=2$ 知第三个特征值为 $0$。实对称矩阵不同特征值的特征向量正交，解 $\\begin{cases}x_1-x_3=0\\\\ x_1+x_3=0\\end{cases}$ 得 $\\lambda=0$ 的特征向量 $(0,1,0)^{\\mathrm{T}}$。(II) $\\boldsymbol{A}=\\begin{pmatrix}0&0&1\\\\0&0&0\\\\1&0&0\\end{pmatrix}$。将三个特征向量单位化按列排成 $\\boldsymbol{Q}=\\left(\\frac{1}{\\sqrt2}(1,0,-1)^{\\mathrm{T}},\\ \\frac{1}{\\sqrt2}(1,0,1)^{\\mathrm{T}},\\ (0,1,0)^{\\mathrm{T}}\\right)$，则 $\\boldsymbol{Q}^{\\mathrm{T}}\\boldsymbol{A}\\boldsymbol{Q}=\\mathrm{diag}(-1,1,0)$，故 $\\boldsymbol{A}=\\boldsymbol{Q}\\,\\mathrm{diag}(-1,1,0)\\,\\boldsymbol{Q}^{\\mathrm{T}}=\\begin{pmatrix}0&0&1\\\\0&0&0\\\\1&0&0\\end{pmatrix}$。",
      src: { file: "参考文件/真题/数学/5、【1987-2025年】考研数学三真题/3、2010-2022考研数学三真题.pdf", page: 48, no: "三(21)", note: "题面：合并册 p48 整页 m3-book-p48.png 及高清半页 w3h-2011-p48-top.png 逐字亲读（两个 3×2 矩阵逐元素、秩为 2、实对称、(I) 特征值与特征向量、(II) 求 A）；答案与 2011 解析册 p9–p10 对拍（册上 λ=−1,1,0，特征向量 k(1,0,−1)ᵀ、k(1,0,1)ᵀ、k(0,1,0)ᵀ，A=[[0,0,1],[0,0,0],[1,0,0]]），独立重推一致（Aξ₁=−ξ₁、Aξ₂=ξ₂、秩 2 得 λ₃=0，Q diag(−1,1,0) Qᵀ）；数学三 OCR 文本层不作题面来源。" }
    },
    {
      id: "m3-2011-22", origin: "year", year: 2011, no: "三(22)", type: "estimate", star: 4, school: "全国硕士研究生入学统一考试-数学三 2011 年",
      tags: ["zt04","int23","tp02"],
      stem: "设随机变量 $X$ 与 $Y$ 的概率分布分别为 $P\\{X=0\\}=\\frac13,\\ P\\{X=1\\}=\\frac23$ 与 $P\\{Y=-1\\}=P\\{Y=0\\}=P\\{Y=1\\}=\\frac13$，且 $P\\{X^2=Y^2\\}=1$。(I) 求二维随机变量 $(X,Y)$ 的概率分布；(II) 求 $Z=XY$ 的概率分布；(III) 求 $X$ 与 $Y$ 的相关系数 $\\rho_{XY}$.",
      answer: "(I) 由 $P\\{X^2=Y^2\\}=1$ 得 $P\\{X=0,Y=-1\\}=P\\{X=0,Y=1\\}=P\\{X=1,Y=0\\}=0$；再由边缘分布得 $P\\{X=0,Y=0\\}=P\\{X=0\\}=\\frac13$，$P\\{X=1,Y=-1\\}=P\\{Y=-1\\}=\\frac13$，$P\\{X=1,Y=1\\}=P\\{Y=1\\}=\\frac13$。即联合分布 $P(0,-1)=0,\\ P(0,0)=\\frac13,\\ P(0,1)=0,\\ P(1,-1)=\\frac13,\\ P(1,0)=0,\\ P(1,1)=\\frac13$。(II) $Z=XY$ 取值 $-1,0,1$，$P\\{Z=-1\\}=P\\{X=1,Y=-1\\}=\\frac13$，$P\\{Z=1\\}=P\\{X=1,Y=1\\}=\\frac13$，$P\\{Z=0\\}=1-\\frac13-\\frac13=\\frac13$，即三个值各占 $\\frac13$。(III) $\\rho_{XY}=0$。$E(XY)=E(Z)=0$，$E(Y)=0$，故 $\\mathrm{Cov}(X,Y)=E(XY)-E(X)E(Y)=0$，从而 $\\rho_{XY}=0$。",
      traps: "$\\rho_{XY}=0$ 只说明不相关，不能反推 $X,Y$ 独立——本题 $P\\{X^2=Y^2\\}=1$ 已强制二者依赖；$Z=0$ 只来自 $(0,0)$，不要把 $(1,0),(0,\\pm1)$ 算进去。",
      src: { file: "参考文件/真题/数学/5、【1987-2025年】考研数学三真题/3、2010-2022考研数学三真题.pdf", page: 48, no: "三(22)", note: "题面：合并册 p48 整页 m3-book-p48.png 及高清半页 w3h-2011-p48-top.png / w3h-2011-p48-bot.png 逐格亲读（X 表 0→1/3、1→2/3；Y 表 −1,0,1→各 1/3；P{X²=Y²}=1；(I)(II) Z=XY (III) ρ_XY），表格逐格等价化为等式；答案与 2011 解析册 p10–p11 对拍（册上六个联合概率、Z 三值各 1/3、ρ_XY=0），独立重推一致（|X|=|Y| 定零概率格，E(XY)=E(Y)=0）；数学三 OCR 文本层不作题面来源。" }
    },
    {
      id: "m3-2011-23", origin: "year", year: 2011, no: "三(23)", type: "estimate", star: 4, school: "全国硕士研究生入学统一考试-数学三 2011 年",
      tags: ["zt04","int23","tp02"],
      stem: "设二维随机变量 $(X,Y)$ 服从区域 $G$ 上的均匀分布，其中 $G$ 是由 $x-y=0,\\ x+y=2$ 与 $y=0$ 所围成的三角形区域。(I) 求 $X$ 的概率密度 $f_X(x)$；(II) 求条件概率密度 $f_{X|Y}(x|y)$.",
      answer: "$G$ 的顶点为 $(0,0),(2,0),(1,1)$，面积 $S=1$，故 $f(x,y)=1\\ (0<y<1,\\ y<x<2-y)$，其余为 $0$。(I) 对固定 $x$，$y$ 从 $0$ 积到 $x$（$0<x<1$）或 $2-x$（$1\\le x<2$），故 $$f_X(x)=\\begin{cases}x,&0<x<1,\\\\ 2-x,&1\\le x<2,\\\\ 0,&\\text{其他}.\\end{cases}$$(II) $f_Y(y)=\\int_y^{2-y}1\\,\\mathrm{d}x=2-2y\\ (0<y<1)$，故 $$f_{X|Y}(x|y)=\\begin{cases}\\dfrac{1}{2-2y},&y<x<2-y\\ (0<y<1),\\\\ 0,&\\text{其他}.\\end{cases}$$",
      traps: "$f_X(x)$ 须按 $x=1$ 分两段（三角形顶点 $(1,1)$ 处换边界）；条件密度是 $f_{X|Y}$（给定 $Y$ 下 $X$），须先除以 $f_Y(y)=2-2y$，且分母在 $y\\to1$ 时趋于 $0$。",
      src: { file: "参考文件/真题/数学/5、【1987-2025年】考研数学三真题/3、2010-2022考研数学三真题.pdf", page: 48, no: "三(23)", note: "题面：合并册 p48 整页 m3-book-p48.png 及高清半页 w3h-2011-p48-bot.png 逐字亲读（G 由 x−y=0、x+y=2、y=0 围成三角形；(I) f_X(x) (II) f_{X|Y}(x|y)）；答案与 2011 解析册 p11 对拍（册上 f(x,y)=1 (0<y<1, y<x<2−y)、f_X(x)=x (0<x<1)/2−x (1≤x<2)、f_{X|Y}=1/(2−2y)），独立重推一致（S=1，f_Y=2−2y）；数学三 OCR 文本层不作题面来源。" }
    },
    {
      id: "m3-2012-9", origin: "year", year: 2012, no: "二(9)", type: "limit", star: 3, school: "全国硕士研究生入学统一考试-数学三 2012 年",
      tags: ["zt06","lim09","tp01"],
      stem: "$\\lim\\limits_{x\\to\\frac{\\pi}{4}}(\\tan x)^{\\frac{1}{\\cos x-\\sin x}}=$ \\_\\_\\_\\_.",
      answer: "$e^{-\\sqrt{2}}$。这是 $1^{\\infty}$ 型极限，取对数后用洛必达法则：$$\\ln L=\\lim_{x\\to\\frac{\\pi}{4}}\\frac{\\ln\\tan x}{\\cos x-\\sin x}=\\lim_{x\\to\\frac{\\pi}{4}}\\frac{(\\ln\\tan x)'}{(\\cos x-\\sin x)'}=\\lim_{x\\to\\frac{\\pi}{4}}\\frac{\\frac{\\sec^2 x}{\\tan x}}{-\\sin x-\\cos x}=\\frac{2}{-\\sqrt{2}}=-\\sqrt{2},$$故原式 $=\\mathrm{e}^{-\\sqrt{2}}$。",
      src: { file: "参考文件/真题/数学/5、【1987-2025年】考研数学三真题/3、2010-2022考研数学三真题.pdf", page: 42, no: "二(9)", note: "题面：合并册 2012 卷（卷首 p41 页眉「2012 年全国硕士研究生招生考试试题」，全卷 p41–p44）p42 整页 w3h-2012-p42.png 与裁片 m3-1012-p42-top.png 亲读（$1^{\\infty}$ 型，指数为 $\\frac{1}{\\cos x-\\sin x}$，$x\\to\\frac{\\pi}{4}$）；答案与 2012 解析册 p4 对拍（册上 $e^{-\\sqrt{2}}$），独立取对数用洛必达重推 $\\ln L=-\\sqrt{2}$ 一致；OCR 文本层不作题面来源。" }
    },
    {
      id: "m3-2012-10", origin: "year", year: 2012, no: "二(10)", type: "deriv", star: 3, school: "全国硕士研究生入学统一考试-数学三 2012 年",
      tags: ["dr04","d04","gx13"],
      stem: "设函数 $f(x)=\\begin{cases}\\ln\\sqrt{x},&x\\ge1,\\\\2x-1,&x<1,\\end{cases}$，$y=f(f(x))$，则 $\\left.\\dfrac{\\mathrm{d}y}{\\mathrm{d}x}\\right|_{x=\\mathrm{e}}=$ \\_\\_\\_\\_.",
      answer: "$\\dfrac{1}{\\mathrm{e}}$。因 $f(\\mathrm{e})=\\ln\\sqrt{\\mathrm{e}}=\\frac{1}{2}<1$，$f(f(\\mathrm{e}))=f\\big(\\frac{1}{2}\\big)=2\\cdot\\frac{1}{2}-1=0$，且 $f'(x)=\\begin{cases}\\frac{1}{2x},&x>1,\\\\2,&x<1,\\end{cases}$ 由链式法则 $$\\left.\\frac{\\mathrm{d}y}{\\mathrm{d}x}\\right|_{x=\\mathrm{e}}=f'(f(\\mathrm{e}))\\,f'(\\mathrm{e})=f'\\Big(\\frac{1}{2}\\Big)\\cdot\\frac{1}{2\\mathrm{e}}=2\\cdot\\frac{1}{2\\mathrm{e}}=\\frac{1}{\\mathrm{e}}.$$",
      traps: "册上 X／重推 Y／原因：解析册 p5 把求导点误作 $x=0$（题干印成 $x=0$、答案 $4$，按 $f'(f(0))f'(0)=f'(-1)f'(0)=4$ 计算），题面册与通行真题均为 $x=\\mathrm{e}$；重推 $\\frac{1}{\\mathrm{e}}$；原因是两册求导点不一致，按题面册 $x=\\mathrm{e}$ 取答案。复合时必须先算 $f(\\mathrm{e})=\\frac{1}{2}$ 落在 $x<1$ 一支，再用 $f'(\\frac{1}{2})=2$ 与 $f'(\\mathrm{e})=\\frac{1}{2\\mathrm{e}}$，不能对 $\\ln\\sqrt{x}$ 直接连用两次。",
      src: { file: "参考文件/真题/数学/5、【1987-2025年】考研数学三真题/3、2010-2022考研数学三真题.pdf", page: 42, no: "二(10)", note: "题面：合并册 2012 卷 p42 整页 w3h-2012-p42.png、裁片 m3-1012-p42-top.png 与超高清 w3h-2012-p42-q10.png / w3h-2012-p42-q9-11.png 亲读，求导点下标为 $x=\\mathrm{e}$（分段函数 $\\ln\\sqrt{x}\\ (x\\ge1)$、$2x-1\\ (x<1)$，$y=f(f(x))$）；册上 X／重推 Y／原因：2012 解析册 p5 题干误印为 $x=0$、册上答案 $4$（按 $x=0$ 得 $f'(f(0))f'(0)=4$），题面册为 $x=\\mathrm{e}$，独立按链式法则重推得 $\\frac{1}{\\mathrm{e}}$（$f(\\mathrm{e})=\\frac{1}{2}$，$f'(\\frac{1}{2})=2$，$f'(\\mathrm{e})=\\frac{1}{2\\mathrm{e}}$），与通行真题答案一致；原因是解析册把 $\\mathrm{e}$ 误作 $0$ 的异版错解，按题面册为准。OCR 文本层不作题面来源。" }
    },
    {
      id: "m3-2012-11", origin: "year", year: 2012, no: "二(11)", type: "multivar", star: 3, school: "全国硕士研究生入学统一考试-数学三 2012 年",
      tags: ["multi01","gx17","dr08"],
      stem: "设连续函数 $z=f(x,y)$ 满足 $\\lim\\limits_{x\\to0,\\,y\\to1}\\dfrac{f(x,y)-2x+y-2}{\\sqrt{x^2+(y-1)^2}}=0$，则 $\\left.\\mathrm{d}z\\right|_{(0,1)}=$ \\_\\_\\_\\_.",
      answer: "$2\\,\\mathrm{d}x-\\mathrm{d}y$。记 $\\rho=\\sqrt{x^2+(y-1)^2}$。由极限为 $0$ 及 $f$ 连续，令 $(x,y)\\to(0,1)$ 得分子趋于 $f(0,1)+1-2=0$，故 $f(0,1)=1$。原式即 $$\\lim_{(x,y)\\to(0,1)}\\frac{f(x,y)-f(0,1)-\\big[2x-(y-1)\\big]}{\\rho}=0,$$由全微分定义知 $f$ 在 $(0,1)$ 可微，且 $f_x(0,1)=2$，$f_y(0,1)=-1$，故 $\\left.\\mathrm{d}z\\right|_{(0,1)}=2\\,\\mathrm{d}x-\\mathrm{d}y$。",
      src: { file: "参考文件/真题/数学/5、【1987-2025年】考研数学三真题/3、2010-2022考研数学三真题.pdf", page: 42, no: "二(11)", note: "题面：合并册 2012 卷 p42 整页 w3h-2012-p42.png、裁片 m3-1012-p42-top.png 与超高清 w3h-2012-p42-q9-11.png 亲读（分子 $f(x,y)-2x+y-2$，分母 $\\sqrt{x^2+(y-1)^2}$，$x\\to0,\\,y\\to1$）；答案与 2012 解析册 p5 对拍（册上 $2\\mathrm{d}x-\\mathrm{d}y$），独立按全微分定义重推一致（$f(0,1)=1$，$f_x=2$，$f_y=-1$）；OCR 文本层不作题面来源。" }
    },
    {
      id: "m3-2012-12", origin: "year", year: 2012, no: "二(12)", type: "integral", star: 3, school: "全国硕士研究生入学统一考试-数学三 2012 年",
      tags: ["int28","tp02","int23"],
      stem: "由曲线 $y=\\dfrac{4}{x}$ 和直线 $y=x$ 及 $y=4x$ 在第一象限中围成的平面图形的面积为\\_\\_\\_\\_.",
      answer: "$4\\ln 2$。三曲线在第一象限的交点为 $(0,0)$、$(2,2)$（$y=x$ 与 $y=\\frac{4}{x}$）、$(1,4)$（$y=4x$ 与 $y=\\frac{4}{x}$）。按 $y$ 分段积分 $$S=\\int_0^2\\!\\int_{y/4}^{y}\\mathrm{d}x\\,\\mathrm{d}y+\\int_2^4\\!\\int_{y/4}^{4/y}\\mathrm{d}x\\,\\mathrm{d}y=\\int_0^2\\frac{3y}{4}\\,\\mathrm{d}y+\\int_2^4\\Big(\\frac{4}{y}-\\frac{y}{4}\\Big)\\mathrm{d}y=\\frac{3}{2}+\\Big(4\\ln 2-\\frac{3}{2}\\Big)=4\\ln 2.$$",
      src: { file: "参考文件/真题/数学/5、【1987-2025年】考研数学三真题/3、2010-2022考研数学三真题.pdf", page: 42, no: "二(12)", note: "题面：合并册 2012 卷 p42 整页 w3h-2012-p42.png 与裁片 m3-1012-p42-top.png 亲读（$y=\\frac{4}{x}$、$y=x$、$y=4x$ 第一象限）；答案与 2012 解析册 p5 对拍（册上 $4\\ln2$），独立按 $y=2$ 分块积分重推一致（交点 $(1,4),(2,2)$，$\\int_0^2\\frac{3y}{4}dy+\\int_2^4(\\frac4y-\\frac y4)dy=4\\ln2$）；OCR 文本层不作题面来源。" }
    },
    {
      id: "m3-2012-13", origin: "year", year: 2012, no: "二(13)", type: "linalg", star: 3, school: "全国硕士研究生入学统一考试-数学三 2012 年",
      tags: ["la11","la01","kn35"],
      stem: "设 $\\boldsymbol{A}$ 为 $3$ 阶矩阵，$|\\boldsymbol{A}|=3$，$\\boldsymbol{A}^{*}$ 为 $\\boldsymbol{A}$ 的伴随矩阵，若交换 $\\boldsymbol{A}$ 的第 $1$ 行与第 $2$ 行得矩阵 $\\boldsymbol{B}$，则 $|\\boldsymbol{B}\\boldsymbol{A}^{*}|=$ \\_\\_\\_\\_.",
      answer: "$-27$。由 $A A^{*}=|A|E=3E$，交换 $A$ 的第 $1$、$2$ 行即左乘初等矩阵 $E_{12}$（$|E_{12}|=-1$），故 $B=E_{12}A$，$$B A^{*}=E_{12}A A^{*}=3E_{12},\\qquad |B A^{*}|=|3E_{12}|=3^{3}|E_{12}|=27\\times(-1)=-27.$$亦可 $|B|=-|A|=-3$，$|A^{*}|=|A|^{3-1}=9$，得 $|B A^{*}|=-27$。",
      src: { file: "参考文件/真题/数学/5、【1987-2025年】考研数学三真题/3、2010-2022考研数学三真题.pdf", page: 42, no: "二(13)", note: "题面：合并册 2012 卷 p42 整页 w3h-2012-p42.png 与裁片 m3-1012-p42-top.png 亲读（$|A|=3$，$A^{*}$ 伴随矩阵，交换第 1、2 行得 $B$，求 $|BA^{*}|$）；答案与 2012 解析册 p5 对拍（册上 $-27$），独立重推一致（$AA^{*}=|A|E=3E$，$B=E_{12}A$，$|3E_{12}|=27(-1)=-27$）；OCR 文本层不作题面来源。" }
    },
    {
      id: "m3-2012-14", origin: "year", year: 2012, no: "二(14)", type: "estimate", star: 2, school: "全国硕士研究生入学统一考试-数学三 2012 年",
      tags: ["zt04","int23","tp02"],
      stem: "设 $A,B,C$ 是随机事件，$A$ 与 $C$ 互不相容，$P(AB)=\\dfrac{1}{2}$，$P(C)=\\dfrac{1}{3}$，则 $P(AB\\,|\\,\\bar{C})=$ \\_\\_\\_\\_.",
      answer: "$\\dfrac{3}{4}$。因 $A$ 与 $C$ 互不相容，$AC=\\varnothing$，故 $ABC\\subset AC$ 得 $P(ABC)=0$。于是 $$P(AB\\bar{C})=P(AB)-P(ABC)=\\frac{1}{2},\\qquad P(\\bar{C})=1-P(C)=\\frac{2}{3},$$所以 $P(AB\\,|\\,\\bar{C})=\\dfrac{P(AB\\bar{C})}{P(\\bar{C})}=\\dfrac{1/2}{2/3}=\\dfrac{3}{4}$。",
      src: { file: "参考文件/真题/数学/5、【1987-2025年】考研数学三真题/3、2010-2022考研数学三真题.pdf", page: 42, no: "二(14)", note: "题面：合并册 2012 卷 p42 整页 w3h-2012-p42.png 与裁片 m3-1012-p42-top.png 亲读（$P(AB\\,|\\,\\bar{C})$ 条件概率，$A$ 与 $C$ 互不相容）；答案与 2012 解析册 p5–p6 对拍（册上 $\\frac{3}{4}$），独立重推一致（$P(ABC)=0$，$P(AB\\bar C)=\\frac12$，$P(\\bar C)=\\frac23$）；OCR 文本层不作题面来源。" }
    },
    {
      id: "m3-2012-15", origin: "year", year: 2012, no: "三(15)", type: "limit", star: 3, school: "全国硕士研究生入学统一考试-数学三 2012 年",
      tags: ["lim07","tay03","tp10"],
      stem: "求极限 $\\lim\\limits_{x\\to0}\\dfrac{\\mathrm{e}^{x^2}-\\mathrm{e}^{2-2\\cos x}}{x^4}$.",
      answer: "$\\dfrac{1}{12}$。提出 $\\mathrm{e}^{2-2\\cos x}$ 后用 $\\mathrm{e}^{u}-1\\sim u$：$$\\lim_{x\\to0}\\frac{\\mathrm{e}^{x^2}-\\mathrm{e}^{2-2\\cos x}}{x^4}=\\lim_{x\\to0}\\mathrm{e}^{2-2\\cos x}\\cdot\\lim_{x\\to0}\\frac{\\mathrm{e}^{x^2-2+2\\cos x}-1}{x^4}=\\lim_{x\\to0}\\frac{x^2-2+2\\cos x}{x^4}.$$由 $\\cos x=1-\\dfrac{x^2}{2}+\\dfrac{x^4}{24}+o(x^4)$ 得分子 $=\\dfrac{x^4}{12}+o(x^4)$，故原式 $=\\dfrac{1}{12}$。",
      traps: "分子两项都趋于 $1$，是 $\\frac{0}{0}$ 型；先提出 $\\mathrm{e}^{2-2\\cos x}\\to1$，再对 $\\mathrm{e}^{x^2-2+2\\cos x}-1$ 用等价无穷小（其中 $x^2-2+2\\cos x\\sim\\frac{x^4}{12}\\to0$），不能只把两项各展开到 $x^2$ 阶就相减，否则会漏掉决定答案的 $x^4$ 项。",
      src: { file: "参考文件/真题/数学/5、【1987-2025年】考研数学三真题/3、2010-2022考研数学三真题.pdf", page: 42, no: "三(15)", note: "题面：合并册 2012 卷 p42 整页 w3h-2012-p42.png 与裁片 m3-1012-p42-bot.png 亲读（分子 $\\mathrm{e}^{x^2}-\\mathrm{e}^{2-2\\cos x}$，分母 $x^4$，卷面用「求极限」）；答案与 2012 解析册 p6 对拍（册上 $\\frac{1}{12}$，用 $\\mathrm{e}^u-1\\sim u$ 加 $\\cos x$ 泰勒），独立重推一致；解析册题干作「计算」，按题面册取「求极限」；OCR 文本层不作题面来源。" }
    },
    {
      id: "m3-2012-18", origin: "year", year: 2012, no: "三(18)", type: "proof", star: 4, school: "全国硕士研究生入学统一考试-数学三 2012 年",
      tags: ["zt03","ext05","mvt05"],
      stem: "证明 $x\\ln\\dfrac{1+x}{1-x}+\\cos x\\ge1+\\dfrac{x^2}{2}\\ (-1<x<1)$.",
      answer: "设 $f(x)=x\\ln\\dfrac{1+x}{1-x}+\\cos x-1-\\dfrac{x^2}{2}\\ (-1<x<1)$，则 $f(0)=0$，且 $f$ 为偶函数。$f'(x)=\\ln\\dfrac{1+x}{1-x}+\\dfrac{2x}{1-x^2}-\\sin x-x=\\ln\\dfrac{1+x}{1-x}+\\dfrac{1+x^2}{1-x^2}x-\\sin x$，$f''(x)=\\dfrac{4}{(1-x^2)^2}-1-\\cos x$。当 $-1<x<1$ 时 $0<(1-x^2)^2\\le1$，故 $\\dfrac{4}{(1-x^2)^2}\\ge4$，而 $1+\\cos x\\le2$，于是 $f''(x)\\ge2>0$，$f'$ 严格单调增加。又 $f'(0)=0$，故 $-1<x<0$ 时 $f'(x)<0$、$0<x<1$ 时 $f'(x)>0$，$f(0)=0$ 是 $(-1,1)$ 上的最小值，即 $f(x)\\ge0$，亦即 $x\\ln\\dfrac{1+x}{1-x}+\\cos x\\ge1+\\dfrac{x^2}{2}$。",
      traps: "构造 $f$ 后须证明 $f''>0$（或分 $0<x<1$、$-1<x<0$ 讨论 $f'$ 符号），才能由 $f'(0)=0$ 断定 $x=0$ 是最小值点；$\\ln\\frac{1+x}{1-x}$ 与 $\\frac{2x}{1-x^2}$ 仅在 $|x|<1$ 内有定义，与题设区间一致。",
      src: { file: "参考文件/真题/数学/5、【1987-2025年】考研数学三真题/3、2010-2022考研数学三真题.pdf", page: 43, no: "三(18)", note: "题面：合并册 2012 卷 p43 整页 w3h-2012-p43.png 与裁片 m3-1012-p43-top.png 亲读（证明 $x\\ln\\frac{1+x}{1-x}+\\cos x\\ge1+\\frac{x^2}{2}$，$-1<x<1$）；答案与 2012 解析册 p8 对拍（册上构造 $f$、分 $0<x<1$ 与 $-1<x<0$ 讨论 $f'$ 符号得 $f\\ge0$），独立用二阶导数 $f''=\\frac{4}{(1-x^2)^2}-1-\\cos x\\ge2>0$ 重推，结论一致；OCR 文本层不作题面来源。" }
    },
    {
      id: "m3-2012-20", origin: "year", year: 2012, no: "三(20)", type: "linalg", star: 4, school: "全国硕士研究生入学统一考试-数学三 2012 年",
      tags: ["zb08","tp09","la17"],
      stem: "设 $\\boldsymbol{A}=\\begin{pmatrix}1&a&0&0\\\\0&1&a&0\\\\0&0&1&a\\\\a&0&0&1\\end{pmatrix}$，$\\boldsymbol{\\beta}=\\begin{pmatrix}1\\\\-1\\\\0\\\\0\\end{pmatrix}$。(I) 计算行列式 $|\\boldsymbol{A}|$；(II) 当实数 $a$ 为何值时，方程组 $\\boldsymbol{A}\\boldsymbol{x}=\\boldsymbol{\\beta}$ 有无穷多解，并求其通解.",
      answer: "(I) $|\\boldsymbol{A}|=1-a^{4}$；(II) $a=-1$，通解 $\\boldsymbol{x}=k(1,1,1,1)^{\\mathrm{T}}+(0,-1,0,0)^{\\mathrm{T}}$（$k$ 为任意常数）。按第一行展开得 $|A|=1-a\\cdot a^{3}=1-a^{4}$。对增广矩阵 $(A\\,|\\,\\beta)$ 作初等行变换，末行化为 $(0,0,0,1-a^{4}\\mid -a-a^{2})$，故有无穷多解须 $1-a^{4}=0$ 且 $-a-a^{2}=0$，得 $a=-1$（$a=1$ 时末行右端为 $-2\\ne0$，无解）。$a=-1$ 时方程组等价于 $x_1-x_2=1$，$x_2-x_3=-1$，$x_3-x_4=0$，$-x_1+x_4=0$，取 $x_4=k$ 为自由变量即得 $x_3=x_1=k$、$x_2=k-1$，故通解如上。",
      src: { file: "参考文件/真题/数学/5、【1987-2025年】考研数学三真题/3、2010-2022考研数学三真题.pdf", page: 43, no: "三(20)", note: "题面：合并册 2012 卷 p43 整页 w3h-2012-p43.png 与裁片 m3-1012-p43-bot.png 超高清亲读（$4\\times4$ 循环矩阵 $A$ 逐元素、$\\beta=(1,-1,0,0)^{\\mathrm T}$，(I) 求 $|A|$、(II) $Ax=\\beta$ 无穷多解求 $a$ 与通解）；答案与 2012 解析册 p9–p10 对拍（册上 $|A|=1-a^4$、$a=-1$、通解 $k(1,1,1,1)^{\\mathrm T}+(0,-1,0,0)^{\\mathrm T}$），独立行变换重推一致；解析册 p10 中段混入 2010 年第 20 题（含 $\\lambda$ 的 $3\\times3$ 矩阵）残段，与本卷无关，未采用；OCR 文本层不作题面来源。" }
    },
    {
      id: "m3-2012-21", origin: "year", year: 2012, no: "三(21)", type: "eigen", star: 4, school: "全国硕士研究生入学统一考试-数学三 2012 年",
      tags: ["zt02","tp04","la04","kn58"],
      stem: "已知 $\\boldsymbol{A}=\\begin{pmatrix}1&0&1\\\\0&1&1\\\\-1&0&a\\\\0&a&-1\\end{pmatrix}$，二次型 $f(x_1,x_2,x_3)=x^{\\mathrm{T}}(\\boldsymbol{A}^{\\mathrm{T}}\\boldsymbol{A})x$ 的秩为 $2$。(I) 求实数 $a$ 的值；(II) 求正交变换 $x=\\boldsymbol{Q}y$ 将 $f$ 化为标准形.",
      answer: "(I) $a=-1$；(II) 标准形 $2y_2^{2}+6y_3^{2}$。因 $r(A^{\\mathrm{T}}A)=r(A)$，对 $A$ 行变换：第三行加第一行得 $(0,0,a+1)$，第四行减 $a$ 倍第二行得 $(0,0,-(a+1))$，故 $r(A)=2\\iff a=-1$。此时 $$A^{\\mathrm{T}}A=\\begin{pmatrix}2&0&2\\\\0&2&2\\\\2&2&4\\end{pmatrix},\\qquad |\\lambda E-A^{\\mathrm{T}}A|=\\lambda(\\lambda-2)(\\lambda-6),$$特征值 $0,2,6$，对应特征向量 $(1,1,-1)^{\\mathrm{T}},(1,-1,0)^{\\mathrm{T}},(1,1,2)^{\\mathrm{T}}$ 两两正交，单位化后按列排成 $$Q=\\begin{pmatrix}\\frac{1}{\\sqrt3}&\\frac{1}{\\sqrt2}&\\frac{1}{\\sqrt6}\\\\\\frac{1}{\\sqrt3}&-\\frac{1}{\\sqrt2}&\\frac{1}{\\sqrt6}\\\\-\\frac{1}{\\sqrt3}&0&\\frac{2}{\\sqrt6}\\end{pmatrix},$$则正交变换 $x=Qy$ 把 $f$ 化为 $2y_2^{2}+6y_3^{2}$。",
      traps: "关键用 $r(A^{\\mathrm{T}}A)=r(A)$（即 $Ax=0$ 与 $A^{\\mathrm{T}}Ax=0$ 同解），把二次型的秩转成 $4\\times3$ 矩阵 $A$ 的秩；$A$ 的第 $3$ 行是 $(-1,0,a)$、第 $4$ 行是 $(0,a,-1)$，不要漏行；$Q$ 的列须与特征值 $0,2,6$ 顺序对应且单位化。",
      src: { file: "参考文件/真题/数学/5、【1987-2025年】考研数学三真题/3、2010-2022考研数学三真题.pdf", page: 44, no: "三(21)", note: "题面：合并册 2012 卷 p44 整页 w3h-2012-p44.png 与裁片 m3-1012-p44-top.png 亲读（$A$ 为 $4\\times3$ 矩阵，第 3 行 $(-1,0,a)$、第 4 行 $(0,a,-1)$，$f=x^{\\mathrm T}(A^{\\mathrm T}A)x$ 秩为 2）；册上 X／重推 Y／原因：2012 解析册 p10 题干误印为 $3\\times3$ 矩阵（$\\begin{pmatrix}1&0&1\\\\0&1&1\\\\-1&0&a\\end{pmatrix}$），但 p10–p11 解答给出的 $A^{\\mathrm T}A=\\begin{pmatrix}2&0&2\\\\0&2&2\\\\2&2&4\\end{pmatrix}$、特征值 $0,2,6$ 与正交矩阵 $Q$ 恰与题面册 $4\\times3$ 版本一致；独立重推：$r(A^{\\mathrm T}A)=r(A)=2\\Rightarrow a=-1$，再求特征值与单位特征向量，结论与册上解答一致；原因是解析册题干漏印第 4 行，按题面册为准。OCR 文本层不作题面来源。" }
    },
    {
      id: "m3-2012-22", origin: "year", year: 2012, no: "三(22)", type: "estimate", star: 3, school: "全国硕士研究生入学统一考试-数学三 2012 年",
      tags: ["zt04","int23","tp02"],
      stem: "设二维离散型随机变量 $(X,Y)$ 的概率分布为 $$\\begin{array}{c|ccc}X\\backslash Y&0&1&2\\\\0&\\frac{1}{4}&0&\\frac{1}{4}\\\\1&0&\\frac{1}{3}&0\\\\2&\\frac{1}{12}&0&\\frac{1}{12}\\end{array}$$（行标为 $X$，列标为 $Y$）。(I) 求 $P\\{X=2Y\\}$；(II) 求 $\\mathrm{Cov}(X-Y,Y)$.",
      answer: "(I) $\\dfrac{1}{4}$；(II) $-\\dfrac{2}{3}$。(I) $X=2Y$ 只可能 $(X,Y)=(0,0)$ 或 $(2,1)$，故 $P\\{X=2Y\\}=\\dfrac{1}{4}+0=\\dfrac{1}{4}$。(II) 由表中边缘分布 $E(X)=\\dfrac{2}{3}$，$E(Y)=1$，$E(XY)=1\\cdot\\dfrac{1}{3}+4\\cdot\\dfrac{1}{12}=\\dfrac{2}{3}$，故 $\\mathrm{Cov}(X,Y)=\\dfrac{2}{3}-\\dfrac{2}{3}\\cdot1=0$；又 $E(Y^2)=\\dfrac{5}{3}$，$D(Y)=\\dfrac{2}{3}$，所以 $$\\mathrm{Cov}(X-Y,Y)=\\mathrm{Cov}(X,Y)-D(Y)=0-\\frac{2}{3}=-\\frac{2}{3}.$$",
      src: { file: "参考文件/真题/数学/5、【1987-2025年】考研数学三真题/3、2010-2022考研数学三真题.pdf", page: 44, no: "三(22)", note: "题面：合并册 2012 卷 p44 整页 w3h-2012-p44.png 与裁片 m3-1012-p44-top.png / -bot.png 亲读（联合分布表九项 $\\frac14,0,\\frac14\\ /\\ 0,\\frac13,0\\ /\\ \\frac1{12},0,\\frac1{12}$，行 $X$、列 $Y$ 取 $0,1,2$）；答案与 2012 解析册 p11–p12 对拍（册上 $P(X=2Y)=\\frac14$、$\\mathrm{Cov}(X-Y,Y)=-\\frac23$），独立重推一致（$\\mathrm{Cov}(X,Y)=0$，$D(Y)=\\frac23$）；册上题干把联合分布拆成 $X$、$Y$、$XY$ 三个一维分布表，与题面册联合表等价，且多求 $\\rho_{XY}=0$，按题面册只录 (I)(II)；OCR 文本层不作题面来源。" }
    },
    {
      id: "m3-2012-23", origin: "year", year: 2012, no: "三(23)", type: "estimate", star: 4, school: "全国硕士研究生入学统一考试-数学三 2012 年",
      tags: ["zt04","int23","tp02"],
      stem: "设随机变量 $X$ 与 $Y$ 相互独立，且都服从参数为 $1$ 的指数分布。记 $U=\\max\\{X,Y\\}$，$V=\\min\\{X,Y\\}$。(I) 求 $V$ 的概率密度 $f_V(v)$；(II) 求 $E(U+V)$.",
      answer: "(I) $f_V(v)=\\begin{cases}2\\mathrm{e}^{-2v},&v>0,\\\\0,&\\text{其它};\\end{cases}$ (II) $2$。(I) $X,Y$ 独立同分布，$F(x)=1-\\mathrm{e}^{-x}\\ (x>0)$，故 $$F_V(v)=P\\{V\\le v\\}=1-P\\{X>v\\}P\\{Y>v\\}=1-[1-F(v)]^2=1-\\mathrm{e}^{-2v}\\quad(v>0),$$求导得 $f_V(v)=2\\mathrm{e}^{-2v}\\ (v>0)$，其余为 $0$。(II) 因 $U+V=X+Y$，故 $E(U+V)=E(X)+E(Y)=1+1=2$（亦可分别求 $EV=\\dfrac{1}{2}$、$EU=\\dfrac{3}{2}$）。",
      hint: "利用 $U+V=X+Y$（$\\max$ 与 $\\min$ 之和等于两数之和），$E(U+V)$ 不必分别求 $U$、$V$ 的分布，直接由期望可加性得 $1+1=2$。",
      src: { file: "参考文件/真题/数学/5、【1987-2025年】考研数学三真题/3、2010-2022考研数学三真题.pdf", page: 44, no: "三(23)", note: "题面：合并册 2012 卷 p44 整页 w3h-2012-p44.png 与裁片 m3-1012-p44-bot.png 亲读（$X,Y$ 独立同服从参数 1 的指数分布，$U=\\max\\{X,Y\\}$，$V=\\min\\{X,Y\\}$）；答案与 2012 解析册 p12–p13 对拍（册上 $f_V(v)=2\\mathrm{e}^{-2v}\\ (v>0)$、$E(U+V)=2$），独立重推一致（$F_V=1-[1-F]^2=1-\\mathrm{e}^{-2v}$；$U+V=X+Y$ 故期望 $1+1=2$）；OCR 文本层不作题面来源。" }
    },
    {
      id: "m3-2013-9", origin: "year", year: 2013, no: "二(9)", type: "limit", star: 3, school: "全国硕士研究生入学统一考试-数学三 2013 年",
      tags: ["ext01","gx15","tp01"],
      stem: "设曲线 $y=f(x)$ 与 $y=x^{2}-x$ 在点 $(1,0)$ 处有公共切线，则 $\\lim\\limits_{n\\to\\infty}nf\\left(\\dfrac{n}{n+2}\\right)=$______.",
      answer: "填 $-2$。由 $y=x^{2}-x$ 得 $y'(1)=2\\cdot1-1=1$，公共切线给出 $f(1)=0,\\ f'(1)=1$。注意 $\\dfrac{n}{n+2}=1-\\dfrac{2}{n+2}$，且 $f(1)=0$，于是\n$$\\lim_{n\\to\\infty}nf\\Big(\\frac{n}{n+2}\\Big)=\\lim_{n\\to\\infty}\\frac{f\\big(1-\\frac{2}{n+2}\\big)-f(1)}{\\frac{-2}{n+2}}\\cdot\\Big(\\frac{-2n}{n+2}\\Big)=f'(1)\\cdot(-2)=-2.$$",
      traps: "常见错：把 $\\frac{n}{n+2}$ 当作趋于 $0$，或把增量写成 $\\frac{2}{n+2}$ 却漏掉负号；必须凑成导数定义 $\\frac{f(1+\\Delta x)-f(1)}{\\Delta x}$，其中 $\\Delta x=-\\frac{2}{n+2}$，且 $f(1)=0$ 不能漏（否则 $nf(\\cdot)$ 发散）。",
      hint: "先把公共切线翻译成 $f(1)=0,\\ f'(1)=1$，再把 $f\\big(\\frac{n}{n+2}\\big)$ 写成 $f\\big(\\frac{n}{n+2}\\big)-f(1)$ 的差商，凑导数定义。",
      src: { file: "参考文件/真题/数学/5、【1987-2025年】考研数学三真题/3、2010-2022考研数学三真题.pdf", page: 38, no: "二(9)", note: "题面取自 crops/m3-1315-book-p38.png 逐字亲读（p37 页眉「2013 年全国硕士研究生招生考试试题」确认卷首，2013 卷 p37–p40）；答案与 2013 答案解析册 p4 对拍（册上 −2），独立重推一致。" }
    },
    {
      id: "m3-2013-10", origin: "year", year: 2013, no: "二(10)", type: "multivar", star: 3, school: "全国硕士研究生入学统一考试-数学三 2013 年",
      tags: ["multi02","ext14","gx19"],
      stem: "设函数 $z=z(x,y)$ 由方程 $(z+y)^{x}=xy$ 确定，则 $\\dfrac{\\partial z}{\\partial x}\\Big|_{(1,2)}=$______.",
      answer: "填 $2-2\\ln 2$。方程 $(z+y)^{x}=xy$ 两边取对数得 $x\\ln(z+y)=\\ln x+\\ln y$。先求该点函数值：令 $x=1,\\ y=2$ 代入原方程得 $z+2=2$，即 $z(1,2)=0$。对 $x$ 求偏导：\n$$\\ln(z+y)+x\\cdot\\frac{z_{x}}{z+y}=\\frac1x.$$\n代入 $x=1,\\ y=2,\\ z=0$ 得 $\\ln 2+\\dfrac{z_{x}}{2}=1$，故\n$$\\frac{\\partial z}{\\partial x}\\Big|_{(1,2)}=2(1-\\ln2)=2-2\\ln2.$$",
      traps: "幂指函数 $(z+y)^x$ 直接求偏导容易漏链式法则，先取对数（或写成 $\\mathrm{e}^{x\\ln(z+y)}$）最稳；别忘了先把 $(1,2)$ 处的 $z=0$ 求出来，否则 $\\ln(z+y)$ 无法代入。",
      hint: "对 $(z+y)^x=xy$ 取对数化为 $x\\ln(z+y)=\\ln x+\\ln y$，两边对 $x$ 求偏导后代入 $x=1,y=2$ 及该点 $z$ 值。",
      src: { file: "参考文件/真题/数学/5、【1987-2025年】考研数学三真题/3、2010-2022考研数学三真题.pdf", page: 38, no: "二(10)", note: "题面取自 crops/m3-1315-book-p38.png 逐字亲读（p37 页眉「2013 年全国硕士研究生招生考试试题」确认卷首，2013 卷 p37–p40）；答案与 2013 答案解析册 p5 对拍（册上 $2-2\\ln 2$），独立重推一致。" }
    },
    {
      id: "m3-2013-11", origin: "year", year: 2013, no: "二(11)", type: "integral", star: 3, school: "全国硕士研究生入学统一考试-数学三 2013 年",
      tags: ["int24","wr03","gx33"],
      stem: "$\\int_1^{+\\infty}\\dfrac{\\ln x}{(1+x)^{2}}\\mathrm{d}x=$______.",
      answer: "填 $\\ln 2$。分部积分，取 $u=\\ln x$，$\\mathrm{d}v=\\dfrac{\\mathrm{d}x}{(1+x)^{2}}$，则 $\\mathrm{d}u=\\dfrac{\\mathrm{d}x}{x}$，$v=-\\dfrac{1}{1+x}$：\n$$\\int_1^{+\\infty}\\frac{\\ln x}{(1+x)^2}\\mathrm{d}x=\\left[-\\frac{\\ln x}{1+x}\\right]_1^{+\\infty}+\\int_1^{+\\infty}\\frac{\\mathrm{d}x}{x(1+x)}.$$\n第一项在 $+\\infty$ 处极限为 $0$、在 $x=1$ 处为 $0$，故为 $0$；又 $\\dfrac{1}{x(1+x)}=\\dfrac1x-\\dfrac{1}{1+x}$，所以\n$$\\int_1^{+\\infty}\\Big(\\frac1x-\\frac{1}{1+x}\\Big)\\mathrm{d}x=\\left[\\ln\\frac{x}{1+x}\\right]_1^{+\\infty}=0-\\ln\\frac12=\\ln2.$$",
      traps: "两个易错：一是 $\\left[-\\frac{\\ln x}{1+x}\\right]_1^{+\\infty}$ 上端极限是 $0$（$\\ln x$ 增长慢于 $x$），不要当成发散；二是裂项后必须合并成 $\\ln\\frac{x}{1+x}$ 再取极限，不能把 $\\ln x$ 与 $\\ln(1+x)$ 分别代入 $+\\infty$。",
      hint: "分部积分把 $\\ln x$ 去掉，剩下 $\\frac1{x(1+x)}$ 裂项为 $\\frac1x-\\frac{1}{1+x}$，合并成 $\\ln\\frac{x}{1+x}$ 再取上下限。",
      src: { file: "参考文件/真题/数学/5、【1987-2025年】考研数学三真题/3、2010-2022考研数学三真题.pdf", page: 38, no: "二(11)", note: "题面取自 crops/m3-1315-book-p38.png 逐字亲读（p37 页眉「2013 年全国硕士研究生招生考试试题」确认卷首，2013 卷 p37–p40）；答案与 2013 答案解析册 p5 对拍（册上 $\\ln 2$），独立重推一致。" }
    },
    {
      id: "m3-2013-14", origin: "year", year: 2013, no: "二(14)", type: "estimate", star: 3, school: "全国硕士研究生入学统一考试-数学三 2013 年",
      tags: ["zt04","int23","tp02"],
      stem: "设随机变量 $X$ 服从标准正态分布 $N(0,1)$，则 $E(X\\mathrm{e}^{2X})=$______.",
      answer: "填 $2\\mathrm{e}^{2}$。$X\\sim N(0,1)$，由期望定义\n$$E(X\\mathrm{e}^{2X})=\\int_{-\\infty}^{+\\infty}x\\mathrm{e}^{2x}\\cdot\\frac{1}{\\sqrt{2\\pi}}\\mathrm{e}^{-\\frac{x^2}{2}}\\mathrm{d}x=\\frac{1}{\\sqrt{2\\pi}}\\int_{-\\infty}^{+\\infty}x\\,\\mathrm{e}^{-\\frac{x^2-4x}{2}}\\mathrm{d}x.$$\n配方 $-\\dfrac{x^{2}-4x}{2}=-\\dfrac{(x-2)^{2}}{2}+2$，故\n$$E(X\\mathrm{e}^{2X})=\\mathrm{e}^{2}\\int_{-\\infty}^{+\\infty}x\\cdot\\frac{1}{\\sqrt{2\\pi}}\\mathrm{e}^{-\\frac{(x-2)^2}{2}}\\mathrm{d}x=\\mathrm{e}^{2}\\cdot2=2\\mathrm{e}^{2},$$\n其中最后一个积分正是正态分布 $N(2,1)$ 的期望（均值）$2$。",
      traps: "别把 $E(X\\mathrm{e}^{2X})$ 拆成 $E(X)E(\\mathrm{e}^{2X})$（二者不独立）；配方后剩下的因子是 $N(2,1)$ 的密度，积分值为其均值 $2$，不是 $0$。",
      hint: "把 $\\mathrm{e}^{2x}\\mathrm{e}^{-x^2/2}$ 配方成 $\\mathrm{e}^{2}\\mathrm{e}^{-(x-2)^2/2}$，认出剩余积分是 $N(2,1)$ 的一阶原点矩。",
      src: { file: "参考文件/真题/数学/5、【1987-2025年】考研数学三真题/3、2010-2022考研数学三真题.pdf", page: 38, no: "二(14)", note: "题面取自 crops/m3-1315-book-p38.png 逐字亲读（p37 页眉「2013 年全国硕士研究生招生考试试题」确认卷首，2013 卷 p37–p40）；答案册 p5 只给结论 $2\\mathrm{e}^2$ 未给推导，p6 顶部补式跳跃（把含 $x$ 的积分直接写成不含 $x$ 的形式）；独立配方重推得 $2\\mathrm{e}^2$，与册上结论一致。" }
    },
    {
      id: "m3-2013-15", origin: "year", year: 2013, no: "三(15)", type: "limit", star: 3, school: "全国硕士研究生入学统一考试-数学三 2013 年",
      tags: ["inf08","zb13","tay03"],
      stem: "当 $x\\to0$ 时，$1-\\cos x\\cdot\\cos 2x\\cdot\\cos 3x$ 与 $ax^{n}$ 为等价无穷小，求 $n$ 与 $a$ 的值。",
      answer: "$n=2,\\ a=7$。用恒等式 $1-ABC=(1-A)+A(1-B)+AB(1-C)$ 拆开：\n$$1-\\cos x\\cos2x\\cos3x=(1-\\cos x)+\\cos x(1-\\cos2x)+\\cos x\\cos2x(1-\\cos3x).$$\n由 $1-\\cos u\\sim\\dfrac{u^{2}}{2}\\ (u\\to0)$，且 $\\cos x,\\cos2x\\to1$，得\n$$1-\\cos x\\cos2x\\cos3x\\sim\\frac{x^{2}}{2}+\\frac{(2x)^{2}}{2}+\\frac{(3x)^{2}}{2}=\\frac{1+4+9}{2}x^{2}=7x^{2}.$$\n由 $\\lim\\limits_{x\\to0}\\dfrac{7x^{2}}{ax^{n}}=1$ 得 $n=2,\\ a=7$。",
      traps: "不能把 $1-\\cos x\\cos2x\\cos3x$ 当成单个 $1-\\cos(\\cdot)$ 用一次等价无穷小；必须按 $1-ABC$ 拆成三项之和，每项各用一次 $1-\\cos u\\sim u^2/2$，系数为 $\\frac12(1^2+2^2+3^2)=7$。",
      hint: "用 $1-ABC=(1-A)+A(1-B)+AB(1-C)$ 拆开，再对 $1-\\cos kx$ 用等价无穷小 $\\frac{(kx)^2}{2}$。",
      src: { file: "参考文件/真题/数学/5、【1987-2025年】考研数学三真题/3、2010-2022考研数学三真题.pdf", page: 38, no: "三(15)", note: "题面取自 crops/m3-1315-book-p38.png 逐字亲读（p37 页眉「2013 年全国硕士研究生招生考试试题」确认卷首，2013 卷 p37–p40）；答案与 2013 答案解析册 p6 对拍（册上 $n=2,\\ a=7$），独立用等价无穷小重推一致。" }
    },
    {
      id: "m3-2013-16", origin: "year", year: 2013, no: "三(16)", type: "integral", star: 4, school: "全国硕士研究生入学统一考试-数学三 2013 年",
      tags: ["int29","zb31","int23"],
      stem: "设 $D$ 是由曲线 $y=x^{\\frac13}$、直线 $x=a\\ (a>0)$ 及 $x$ 轴所围成的平面图形，$V_x,V_y$ 分别是 $D$ 绕 $x$ 轴、$y$ 轴旋转一周所得旋转体的体积。若 $V_y=10V_x$，求 $a$ 的值。",
      answer: "$a=7\\sqrt{7}$。由 $y=x^{1/3}$，\n$$V_x=\\pi\\int_0^a y^2\\mathrm{d}x=\\pi\\int_0^a x^{2/3}\\mathrm{d}x=\\frac{3\\pi}{5}a^{5/3},$$\n$$V_y=2\\pi\\int_0^a x\\,y\\,\\mathrm{d}x=2\\pi\\int_0^a x^{4/3}\\mathrm{d}x=\\frac{6\\pi}{7}a^{7/3}$$\n（$V_y$ 用柱壳法）。由 $V_y=10V_x$：\n$$\\frac{6\\pi}{7}a^{7/3}=10\\cdot\\frac{3\\pi}{5}a^{5/3}=6\\pi a^{5/3}\\ \\Longrightarrow\\ a^{2/3}=7\\ \\Longrightarrow\\ a=7^{3/2}=7\\sqrt7.$$",
      traps: "$V_y$ 用柱壳法 $2\\pi\\int x y\\,\\mathrm{d}x$ 最简，若用圆环法需反解 $x=y^3$ 并注意 $y\\in[0,a^{1/3}]$；$V_x$ 的幂次是 $a^{5/3}$、$V_y$ 是 $a^{7/3}$，相除得 $a^{2/3}$，不要错约成 $a$。",
      hint: "分别写出 $V_x=\\pi\\int_0^a y^2\\mathrm{d}x$ 与 $V_y=2\\pi\\int_0^a xy\\,\\mathrm{d}x$，代入 $y=x^{1/3}$ 后由 $V_y=10V_x$ 解 $a$。",
      src: { file: "参考文件/真题/数学/5、【1987-2025年】考研数学三真题/3、2010-2022考研数学三真题.pdf", page: 38, no: "三(16)", note: "题面取自 crops/m3-1315-book-p38.png 逐字亲读（p37 页眉「2013 年全国硕士研究生招生考试试题」确认卷首，2013 卷 p37–p40）；答案册 p6 中间等式 $10\\cdot\\frac{3}{5}\\pi a^{5/3}$ 的指数因排版模糊（形似 $a^3$，若按 $a^3$ 则方程无解且与册上结论矛盾）；独立重推 $V_x=\\frac{3\\pi}{5}a^{5/3},\\ V_y=\\frac{6\\pi}{7}a^{7/3}$ 得 $a=7\\sqrt7$，与册上结论一致。" }
    },
    {
      id: "m3-2013-17", origin: "year", year: 2013, no: "三(17)", type: "dblint", star: 3, school: "全国硕士研究生入学统一考试-数学三 2013 年",
      tags: ["dbi01","tp08","gx43"],
      stem: "设平面区域 $D$ 由直线 $x=3y,\\ y=3x$ 及 $x+y=8$ 围成，计算 $\\displaystyle\\iint_D x^{2}\\mathrm{d}x\\mathrm{d}y$。",
      answer: "$\\dfrac{416}{3}$。三直线交点：$y=3x$ 与 $x+y=8$ 交于 $(2,6)$，$y=\\dfrac{x}{3}$ 与 $x+y=8$ 交于 $(6,2)$，另两线过原点。故按 $x$ 分两块：\n$$D:/ 0\\le x\\le2,\\ \\frac{x}{3}\\le y\\le3x;\\qquad 2\\le x\\le6,\\ \\frac{x}{3}\\le y\\le8-x.$$\n于是\n$$\\iint_D x^2\\mathrm{d}x\\mathrm{d}y=\\int_0^2x^2\\Big(3x-\\frac x3\\Big)\\mathrm{d}x+\\int_2^6x^2\\Big(8-x-\\frac x3\\Big)\\mathrm{d}x$$\n$$=\\frac83\\int_0^2x^3\\mathrm{d}x+\\int_2^6\\Big(8x^2-\\frac{4}{3}x^3\\Big)\\mathrm{d}x=\\frac{32}{3}+128=\\frac{416}{3}.$$",
      traps: "区域在 $x=2$ 处上边界由 $y=3x$ 切换为 $y=8-x$，必须在 $x=2$ 处分段，否则上界写错；另外 $x=3y$ 即 $y=x/3$ 是下界，不要与 $y=3x$ 混淆。",
      hint: "先求三直线交点确定分段点 $x=2$ 与 $x=6$，逐段写出 $y$ 的下限 $x/3$ 与上限，再化累次积分。",
      src: { file: "参考文件/真题/数学/5、【1987-2025年】考研数学三真题/3、2010-2022考研数学三真题.pdf", page: 39, no: "三(17)", note: "题面取自 crops/m3-1315-book-p39.png 逐字亲读（p37 页眉「2013 年全国硕士研究生招生考试试题」确认卷首，2013 卷 p37–p40）；答案与 2013 答案解析册 p7 对拍（册上 $\\frac{416}{3}$），独立分块积分重推一致。" }
    },
    {
      id: "m3-2013-20", origin: "year", year: 2013, no: "三(20)", type: "linalg", star: 4, school: "全国硕士研究生入学统一考试-数学三 2013 年",
      tags: ["ln05","tp09","zb20"],
      stem: "设 $A=\\begin{pmatrix}1&a\\\\1&0\\end{pmatrix},\\ B=\\begin{pmatrix}0&1\\\\1&b\\end{pmatrix}$。当 $a,b$ 为何值时，存在矩阵 $C$ 使得 $AC-CA=B$，并求所有矩阵 $C$。",
      answer: "$a=-1,\\ b=0$；所有 $C=\\begin{pmatrix}k_1+k_2+1&-k_1\\\\ k_1&k_2\\end{pmatrix}$（$k_1,k_2$ 为任意常数）。设 $C=\\begin{pmatrix}x_1&x_2\\\\x_3&x_4\\end{pmatrix}$，计算\n$$AC-CA=\\begin{pmatrix}ax_3-x_2&x_2+ax_4-ax_1\\\\ x_1-x_3-x_4&x_2-ax_3\\end{pmatrix}=\\begin{pmatrix}0&1\\\\1&b\\end{pmatrix},$$\n得四元线性方程组\n$$-x_2+ax_3=0,\\quad -ax_1+x_2+ax_4=1,\\quad x_1-x_3-x_4=1,\\quad x_2-ax_3=b.$$\n由第 1、4 式立得 $b=0$；第 2 式即 $a(x_3+x_4-x_1)=1$，而第 3 式给出 $x_3+x_4-x_1=-1$，故 $a=-1$。代回得 $x_2=-x_3$，令 $x_3=k_1,\\ x_4=k_2$，则 $x_1=1+k_1+k_2$，即得所求 $C$。",
      traps: "由 $x_2=ax_3$ 与 $x_2-ax_3=b$ 立刻得 $b=0$，这个条件常被漏掉而误以为 $b$ 自由；$a$ 由第 2、3 式联立定出为 $-1$，不是由某个行列式为零得出。",
      hint: "把 $C$ 设成四个未知元，逐元素写出 $AC-CA=B$ 的四元方程组，先由第 1、4 式定 $b$，再由第 2、3 式定 $a$，最后求通解。",
      src: { file: "参考文件/真题/数学/5、【1987-2025年】考研数学三真题/3、2010-2022考研数学三真题.pdf", page: 39, no: "三(20)", note: "题面取自 crops/m3-1315-book-p39.png 逐字亲读（p37 页眉「2013 年全国硕士研究生招生考试试题」确认卷首，2013 卷 p37–p40）；答案与 2013 答案解析册 p8 对拍（册上 $a=-1,b=0$，$C$ 含两个任意常数），独立重推一致。" }
    },
    {
      id: "m3-2013-22", origin: "year", year: 2013, no: "三(22)", type: "estimate", star: 4, school: "全国硕士研究生入学统一考试-数学三 2013 年",
      tags: ["zt04","int23","tp02"],
      stem: "设 $(X,Y)$ 是二维随机变量，$X$ 的边缘概率密度为\n$$f_X(x)=\\begin{cases}3x^{2},&0<x<1,\\\\0,&\\text{其它}.\\end{cases}$$\n在给定 $X=x\\ (0<x<1)$ 的条件下 $Y$ 的条件概率密度为\n$$f_{Y|X}(y|x)=\\begin{cases}\\dfrac{3y^{2}}{x^{3}},&0<y<x,\\\\0,&\\text{其它}.\\end{cases}$$\n（Ⅰ）求 $(X,Y)$ 的概率密度 $f(x,y)$；（Ⅱ）求 $Y$ 的边缘概率密度 $f_Y(y)$；（Ⅲ）求 $P\\{X>2Y\\}$。",
      answer: "(Ⅰ) $f(x,y)=\\begin{cases}\\dfrac{9y^{2}}{x},&0<x<1,\\ 0<y<x,\\\\0,&\\text{其它};\\end{cases}$\n(Ⅱ) $f_Y(y)=\\begin{cases}-9y^{2}\\ln y,&0<y<1,\\\\0,&\\text{其它};\\end{cases}$\n(Ⅲ) $P\\{X>2Y\\}=\\dfrac18$。\n\n(Ⅰ) 联合密度 = 条件密度 × 边缘密度：$\\dfrac{3y^{2}}{x^{3}}\\cdot3x^{2}=\\dfrac{9y^{2}}{x}$，支撑为 $0<y<x<1$。\n(Ⅱ) 对固定 $y\\in(0,1)$，$x$ 从 $y$ 积到 $1$：\n$$f_Y(y)=\\int_y^1\\frac{9y^{2}}{x}\\mathrm{d}x=9y^{2}(0-\\ln y)=-9y^2\\ln y.$$\n(Ⅲ) 在 $0<y<x<1$ 内附加 $y<\\frac x2$（因 $\\frac x2<x$，约束即 $0<y<\\frac x2$）：\n$$P\\{X>2Y\\}=\\int_0^1\\mathrm{d}x\\int_0^{x/2}\\frac{9y^2}{x}\\mathrm{d}y=\\int_0^1\\frac{9}{x}\\cdot\\frac{(x/2)^3}{3}\\mathrm{d}x=\\frac{3}{8}\\int_0^1x^2\\mathrm{d}x=\\frac18.$$",
      traps: "联合密度的支撑是三角形 $0<y<x<1$，求 $f_Y(y)$ 时 $x$ 的下限是 $y$ 而非 $0$；求 $P\\{X>2Y\\}$ 时约束 $y<x/2$ 强于 $y<x$，积分上限应取 $x/2$，否则会多算。",
      hint: "联合密度用 $f_{Y|X}\\cdot f_X$；边缘密度对 $x$ 从 $y$ 积到 $1$；概率化为 $\\iint_{x>2y}\\frac{9y^2}{x}\\,\\mathrm{d}y\\mathrm{d}x$。",
      src: { file: "参考文件/真题/数学/5、【1987-2025年】考研数学三真题/3、2010-2022考研数学三真题.pdf", page: 40, no: "三(22)", note: "题面取自 crops/m3-1315-book-p40.png 逐字亲读（p37 页眉「2013 年全国硕士研究生招生考试试题」确认卷首，2013 卷 p37–p40）；题面册 p40 明列 (Ⅰ)(Ⅱ)(Ⅲ) 三问；答案册 p9 只列 (Ⅰ)(Ⅱ) 两问，(Ⅲ) $P\\{X>2Y\\}$ 的题干与解答完全缺失。独立重推 (Ⅲ) 得 $\\frac18$（并验证 $\\int_0^1\\!\\int_0^x\\frac{9y^2}{x}dydx=1$ 归一）；(Ⅰ)(Ⅱ) 与册上 $\\frac{9y^2}{x}$、$-9y^2\\ln y$ 对拍一致。" }
    },
    {
      id: "m3-2014-9", origin: "year", year: 2014, no: "二(9)", type: "econ", star: 2, school: "全国硕士研究生入学统一考试-数学三 2014 年",
      tags: ["ext08","kn10","gx28"],
      stem: "设某商品的需求函数为 $Q=40-2P$（$P$ 为商品的价格），则该商品的边际收益为______.",
      answer: "填 $20-Q$。由 $Q=40-2P$ 反解 $P=20-\\dfrac{Q}{2}$，收益\n$$R(Q)=PQ=\\Big(20-\\frac Q2\\Big)Q=20Q-\\frac{Q^{2}}{2},$$\n故边际收益为 $R'(Q)=20-Q$。",
      traps: "边际收益是 $R$ 对需求量 $Q$ 的导数，不是对价格 $P$ 的导数；若先写 $R(P)=40P-2P^{2}$ 再对 $P$ 求导得 $40-4P$，须用 $\\frac{\\mathrm{d}Q}{\\mathrm{d}P}=-2$ 换算回 $Q$ 才是 $20-Q$。",
      hint: "把价格反解成 $Q$ 的函数 $P=20-\\frac{Q}{2}$，写 $R(Q)=PQ$ 再对 $Q$ 求导。",
      src: { file: "参考文件/真题/数学/5、【1987-2025年】考研数学三真题/3、2010-2022考研数学三真题.pdf", page: 33, no: "二(9)", note: "题面取自 crops/m3-1315-book-p33.png 逐字亲读（p33 页眉「2014 年全国硕士研究生招生考试试题」确认卷首，2014 卷 p33–p36）；答案与 2014 答案解析册 p2 对拍（册上 $R'(Q)=20-Q$），独立重推一致。" }
    },
    {
      id: "m3-2014-10", origin: "year", year: 2014, no: "二(10)", type: "integral", star: 3, school: "全国硕士研究生入学统一考试-数学三 2014 年",
      tags: ["int28","int23","tp02"],
      stem: "设 $D$ 是由曲线 $xy+1=0$ 与直线 $y+x=0$ 及 $y=2$ 围成的有界区域，则 $D$ 的面积为______.",
      answer: "填 $\\dfrac{3}{2}-\\ln 2$。边界写成 $x=-\\dfrac1y$、$x=-y$ 与 $y=2$；前两者交于 $y=1$（取 $y>0$ 的分支），故 $1\\le y\\le2$。当 $y>1$ 时 $-y<-\\frac1y$，左边界 $x=-y$、右边界 $x=-\\frac1y$，\n$$S=\\int_1^2\\Big[-\\frac1y-(-y)\\Big]\\mathrm{d}y=\\int_1^2\\Big(y-\\frac1y\\Big)\\mathrm{d}y=\\left[\\frac{y^{2}}2-\\ln y\\right]_1^2=\\frac32-\\ln2.$$",
      traps: "当 $y>1$ 时 $-y<-1/y$，面积须用「右减左」即 $-\\frac1y-(-y)=y-\\frac1y>0$，写反会得负值；两曲线交点是 $y=1$（另一根 $y=-1$ 不在此有界区域内）。",
      hint: "把三条边界都写成 $x$ 关于 $y$ 的函数，对 $y$ 从 $1$ 积到 $2$，右边界减左边界。",
      src: { file: "参考文件/真题/数学/5、【1987-2025年】考研数学三真题/3、2010-2022考研数学三真题.pdf", page: 33, no: "二(10)", note: "题面取自 crops/m3-1315-book-p33.png 逐字亲读（p33 页眉「2014 年全国硕士研究生招生考试试题」确认卷首，2014 卷 p33–p36）；答案与 2014 答案解析册 p2 对拍（册上 $\\frac32-\\ln2$），独立重推一致。" }
    },
    {
      id: "m3-2014-11", origin: "year", year: 2014, no: "二(11)", type: "integral", star: 3, school: "全国硕士研究生入学统一考试-数学三 2014 年",
      tags: ["int24","gx35","int23"],
      stem: "设 $\\int_0^{a}x\\mathrm{e}^{2x}\\mathrm{d}x=\\dfrac14$，则 $a=$______.",
      answer: "填 $\\dfrac12$。分部积分：\n$$\\int_0^{a}x\\mathrm{e}^{2x}\\mathrm{d}x=\\left[\\frac{\\mathrm{e}^{2x}}{4}(2x-1)\\right]_0^{a}=\\frac{\\mathrm{e}^{2a}}{4}(2a-1)+\\frac14.$$\n令其等于 $\\dfrac14$，得 $\\dfrac{\\mathrm{e}^{2a}}{4}(2a-1)=0$；因 $\\mathrm{e}^{2a}>0$，故 $2a-1=0$，即 $a=\\dfrac12$。",
      traps: "别漏掉下限代入产生的 $+\\frac14$；方程 $\\mathrm{e}^{2a}(2a-1)=0$ 只有 $a=\\frac12$ 一个解，$a=0$ 时积分为 $0\\ne\\frac14$，不是解。",
      hint: "先算出 $\\int_0^a x\\mathrm{e}^{2x}\\mathrm{d}x$ 的闭式（含下限常数 $\\frac14$），再解方程。",
      src: { file: "参考文件/真题/数学/5、【1987-2025年】考研数学三真题/3、2010-2022考研数学三真题.pdf", page: 34, no: "二(11)", note: "题面取自 crops/m3-1315-book-p34.png 逐字亲读（p33 页眉「2014 年全国硕士研究生招生考试试题」确认卷首，2014 卷 p33–p36）；答案与 2014 答案解析册 p2 对拍（册上 $a=\\frac12$），独立重推一致。" }
    },
    {
      id: "m3-2014-12", origin: "year", year: 2014, no: "二(12)", type: "dblint", star: 4, school: "全国硕士研究生入学统一考试-数学三 2014 年",
      tags: ["dbi03","dbi01","tp08"],
      stem: "二次积分 $\\int_0^{1}\\mathrm{d}y\\int_y^{1}\\left(\\dfrac{\\mathrm{e}^{x^{2}}}{x}-\\mathrm{e}^{y^{2}}\\right)\\mathrm{d}x=$______.",
      answer: "填 $\\dfrac{\\mathrm{e}-1}{2}$。交换积分次序（区域 $0\\le y\\le1,\\ y\\le x\\le1$ 即 $0\\le x\\le1,\\ 0\\le y\\le x$）：\n$$\\int_0^1\\!\\mathrm{d}y\\int_y^1\\frac{\\mathrm{e}^{x^{2}}}{x}\\mathrm{d}x=\\int_0^1\\!\\mathrm{d}x\\int_0^x\\frac{\\mathrm{e}^{x^{2}}}{x}\\mathrm{d}y=\\int_0^1\\mathrm{e}^{x^{2}}\\mathrm{d}x,$$\n$$\\int_0^1\\!\\mathrm{d}y\\int_y^1\\mathrm{e}^{y^{2}}\\mathrm{d}x=\\int_0^1\\mathrm{e}^{y^{2}}(1-y)\\mathrm{d}y=\\int_0^1\\mathrm{e}^{x^{2}}\\mathrm{d}x-\\int_0^1x\\mathrm{e}^{x^{2}}\\mathrm{d}x.$$\n两式相减，不可积的 $\\int_0^1\\mathrm{e}^{x^{2}}\\mathrm{d}x$ 恰好抵消：\n$$\\text{原式}=\\int_0^1x\\mathrm{e}^{x^{2}}\\mathrm{d}x=\\frac12\\mathrm{e}^{x^{2}}\\Big|_0^1=\\frac{\\mathrm{e}-1}{2}.$$",
      traps: "$\\int\\mathrm{e}^{x^{2}}\\mathrm{d}x$ 没有初等原函数，不要试图先算它；关键是交换次序后 $\\frac{\\mathrm{e}^{x^{2}}}{x}$ 乘上 $y$ 的区间长度 $x$ 变成 $\\mathrm{e}^{x^{2}}$，与另一项的 $\\mathrm{e}^{y^{2}}$ 抵消。",
      hint: "把两项积分都改成先对 $y$、后对 $x$ 的次序，合并后只剩 $\\int_0^1x\\mathrm{e}^{x^{2}}\\mathrm{d}x$。",
      src: { file: "参考文件/真题/数学/5、【1987-2025年】考研数学三真题/3、2010-2022考研数学三真题.pdf", page: 34, no: "二(12)", note: "题面取自 crops/m3-1315-book-p34.png 逐字亲读（p33 页眉「2014 年全国硕士研究生招生考试试题」确认卷首，2014 卷 p33–p36）；答案与 2014 答案解析册 p2 末–p3 对拍（册上 $\\frac{\\mathrm{e}-1}{2}$），独立交换次序重推一致。" }
    },
    {
      id: "m3-2014-13", origin: "year", year: 2014, no: "二(13)", type: "eigen", star: 3, school: "全国硕士研究生入学统一考试-数学三 2014 年",
      tags: ["ms03","kn68","zt02"],
      stem: "设二次型 $f(x_1,x_2,x_3)=x_1^{2}-x_2^{2}+2ax_1x_3+4x_2x_3$ 的负惯性指数为 $1$，则 $a$ 的取值范围是______.",
      answer: "填 $[-2,2]$。配方：\n$$f=(x_1+ax_3)^{2}-(x_2-2x_3)^{2}+(4-a^{2})x_3^{2}.$$\n三个平方项系数依次为 $1,\\ -1,\\ 4-a^{2}$。负惯性指数即负系数个数：已有 $-1$ 贡献一个负项，故须 $4-a^{2}\\ge0$（否则出现第二个负项），即 $-2\\le a\\le2$。",
      traps: "「负惯性指数为 1」要求 $4-a^{2}\\ge0$ 而非 $>0$——取等号时该项系数为 $0$，规范形只有两个平方项，负惯性指数仍是 1，故端点 $a=\\pm2$ 要取到，区间是闭区间 $[-2,2]$。",
      hint: "把二次型配成三个平方项之和，数负系数个数，令其恰为 1。",
      src: { file: "参考文件/真题/数学/5、【1987-2025年】考研数学三真题/3、2010-2022考研数学三真题.pdf", page: 34, no: "二(13)", note: "题面取自 crops/m3-1315-book-p34.png 逐字亲读（p33 页眉「2014 年全国硕士研究生招生考试试题」确认卷首，2014 卷 p33–p36）；答案与 2014 答案解析册 p3 对拍（册上 $[-2,2]$），独立配方重推一致。" }
    },
    {
      id: "m3-2014-14", origin: "year", year: 2014, no: "二(14)", type: "estimate", star: 3, school: "全国硕士研究生入学统一考试-数学三 2014 年",
      tags: ["zt04","int23","tp02"],
      stem: "设总体 $X$ 的概率密度为\n$$f(x;\\theta)=\\begin{cases}\\dfrac{2x}{3\\theta^{2}},&\\theta<x<2\\theta,\\\\0,&\\text{其他},\\end{cases}$$\n其中 $\\theta$ 是未知参数，$X_1,X_2,\\cdots,X_n$ 为来自总体 $X$ 的简单随机样本。若 $E\\left(c\\sum\\limits_{i=1}^{n}X_i^{2}\\right)=\\theta^{2}$，则 $c=$______.",
      answer: "填 $\\dfrac{2}{5n}$。先算\n$$E(X^{2})=\\int_\\theta^{2\\theta}x^{2}\\cdot\\frac{2x}{3\\theta^{2}}\\mathrm{d}x=\\frac{2}{3\\theta^{2}}\\cdot\\frac{x^{4}}{4}\\Big|_\\theta^{2\\theta}=\\frac{16\\theta^{4}-\\theta^{4}}{6\\theta^{2}}=\\frac{5}{2}\\theta^{2}.$$\n于是\n$$E\\Big(c\\sum_{i=1}^{n}X_i^{2}\\Big)=c\\sum_{i=1}^{n}E(X_i^{2})=cn\\cdot\\frac52\\theta^{2}=\\theta^{2}\\ \\Longrightarrow\\ c=\\frac{2}{5n}.$$",
      traps: "积分上下限是 $\\theta$ 到 $2\\theta$（不是 $0$ 到 $2\\theta$）；$E(\\sum X_i^{2})=nE(X^{2})$ 而非 $E(X^{2})$；结果含 $n$，不要漏。",
      hint: "先由密度算 $E(X^{2})=\\frac52\\theta^{2}$，再用期望的线性性质 $E(c\\sum X_i^{2})=cnE(X^{2})$ 解 $c$。",
      src: { file: "参考文件/真题/数学/5、【1987-2025年】考研数学三真题/3、2010-2022考研数学三真题.pdf", page: 34, no: "二(14)", note: "题面取自 crops/m3-1315-book-p34.png 逐字亲读（p33 页眉「2014 年全国硕士研究生招生考试试题」确认卷首，2014 卷 p33–p36）；答案与 2014 答案解析册 p3 对拍（册上 $c=\\frac{2}{5n}$），独立重推一致。" }
    },
    {
      id: "m3-2014-15", origin: "year", year: 2014, no: "三(15)", type: "limit", star: 4, school: "全国硕士研究生入学统一考试-数学三 2014 年",
      tags: ["int25","tay01","ext02"],
      stem: "求极限 $\\lim\\limits_{x\\to+\\infty}\\dfrac{\\int_1^{x}\\left[t^{2}\\left(\\mathrm{e}^{\\frac1t}-1\\right)-t\\right]\\mathrm{d}t}{x^{2}\\ln\\left(1+\\dfrac1x\\right)}$.",
      answer: "$\\dfrac12$。分母 $x^{2}\\ln\\big(1+\\frac1x\\big)\\sim x^{2}\\cdot\\frac1x=x\\ (x\\to+\\infty)$，故\n$$\\text{原式}=\\lim_{x\\to+\\infty}\\frac{\\int_1^{x}\\big[t^{2}(\\mathrm{e}^{1/t}-1)-t\\big]\\mathrm{d}t}{x}.$$\n这是 $\\frac{\\infty}{\\infty}$ 型，用洛必达（分子求导即被积函数在上限处的值）：\n$$=\\lim_{x\\to+\\infty}\\big[x^{2}(\\mathrm{e}^{1/x}-1)-x\\big].$$\n令 $u=\\frac1x\\to0^{+}$，并用 $\\mathrm{e}^{u}=1+u+\\frac{u^{2}}2+o(u^{2})$：\n$$=\\lim_{u\\to0^{+}}\\frac{\\mathrm{e}^{u}-1-u}{u^{2}}=\\lim_{u\\to0^{+}}\\frac{\\frac{u^{2}}2+o(u^{2})}{u^{2}}=\\frac12.$$",
      traps: "不要对原式直接洛必达（分母导数较繁）；先用 $\\ln(1+\\frac1x)\\sim\\frac1x$ 把分母换成 $x$ 最简。另外 $\\mathrm{e}^{1/x}-1$ 必须展开到二阶，只留 $\\frac1x$ 会得到 $0$。",
      hint: "先用等价无穷小把分母化为 $x$，再洛必达一次，最后令 $u=\\frac1x$ 用 $\\mathrm{e}^{u}-1-u\\sim\\frac{u^{2}}2$。",
      src: { file: "参考文件/真题/数学/5、【1987-2025年】考研数学三真题/3、2010-2022考研数学三真题.pdf", page: 34, no: "三(15)", note: "题面取自 crops/m3-1315-book-p34.png 逐字亲读（p33 页眉「2014 年全国硕士研究生招生考试试题」确认卷首，2014 卷 p33–p36）；答案与 2014 答案解析册 p3 对拍（册上 $\\frac12$），独立重推一致。" }
    },
    {
      id: "m3-2014-16", origin: "year", year: 2014, no: "三(16)", type: "dblint", star: 4, school: "全国硕士研究生入学统一考试-数学三 2014 年",
      tags: ["dbi02","ext27","tp08"],
      stem: "设平面区域 $D=\\{(x,y)\\mid 1\\le x^{2}+y^{2}\\le4,\\ x\\ge0,\\ y\\ge0\\}$，计算 $\\displaystyle\\iint_D\\frac{x\\sin\\left(\\pi\\sqrt{x^{2}+y^{2}}\\right)}{x+y}\\mathrm{d}x\\mathrm{d}y$.",
      answer: "$-\\dfrac{3}{4}$。用极坐标 $x=r\\cos\\theta,\\ y=r\\sin\\theta$，$1\\le r\\le2,\\ 0\\le\\theta\\le\\frac\\pi2$：\n$$\\iint_D\\frac{x\\sin(\\pi\\sqrt{x^{2}+y^{2}})}{x+y}\\mathrm{d}x\\mathrm{d}y=\\int_0^{\\pi/2}\\frac{\\cos\\theta}{\\cos\\theta+\\sin\\theta}\\mathrm{d}\\theta\\cdot\\int_1^{2}r\\sin(\\pi r)\\mathrm{d}r.$$\n第一个积分用区间再现（$\\theta\\mapsto\\frac\\pi2-\\theta$）：记 $I=\\int_0^{\\pi/2}\\frac{\\cos\\theta}{\\cos\\theta+\\sin\\theta}\\mathrm{d}\\theta$，同理 $I=\\int_0^{\\pi/2}\\frac{\\sin\\theta}{\\cos\\theta+\\sin\\theta}\\mathrm{d}\\theta$，相加得 $2I=\\frac\\pi2$，故 $I=\\frac\\pi4$。\n$$\\int_1^{2}r\\sin(\\pi r)\\mathrm{d}r=\\left[-\\frac{r\\cos\\pi r}{\\pi}+\\frac{\\sin\\pi r}{\\pi^{2}}\\right]_1^{2}=-\\frac2\\pi-\\frac1\\pi=-\\frac3\\pi.$$\n故原式 $=\\dfrac\\pi4\\cdot\\Big(-\\dfrac3\\pi\\Big)=-\\dfrac34$。",
      traps: "分母 $x+y$ 在极坐标下为 $r(\\cos\\theta+\\sin\\theta)$，与分子 $r\\cos\\theta$ 及面积元 $r$ 相消后剩一个 $r$；$\\int_1^2r\\sin(\\pi r)\\mathrm{d}r$ 为负（$\\sin\\pi r$ 在 $(1,2)$ 上为负），结果为负不要取绝对值。",
      hint: "化极坐标后分离变量；角向积分用 $\\theta\\mapsto\\frac\\pi2-\\theta$ 的对称性得 $\\frac\\pi4$，径向积分分部积分。",
      src: { file: "参考文件/真题/数学/5、【1987-2025年】考研数学三真题/3、2010-2022考研数学三真题.pdf", page: 34, no: "三(16)", note: "题面取自 crops/m3-1315-book-p34.png 逐字亲读（p33 页眉「2014 年全国硕士研究生招生考试试题」确认卷首，2014 卷 p33–p36）；答案与 2014 答案解析册 p3 末–p4 对拍（册上 $-\\frac34$），独立重推一致。" }
    },
    {
      id: "m3-2014-17", origin: "year", year: 2014, no: "三(17)", type: "ode", star: 3, school: "全国硕士研究生入学统一考试-数学三 2014 年",
      tags: ["multi05","ode02"],
      stem: "设函数 $f(u)$ 具有连续导数，且 $z=f(\\mathrm{e}^{x}\\cos y)$ 满足 $\\cos y\\dfrac{\\partial z}{\\partial x}-\\sin y\\dfrac{\\partial z}{\\partial y}=(4z+\\mathrm{e}^{x}\\cos y)\\mathrm{e}^{x}$。若 $f(0)=0$，求 $f(u)$ 的表达式。",
      answer: "$f(u)=\\dfrac{1}{16}\\big(\\mathrm{e}^{4u}-4u-1\\big)$。记 $u=\\mathrm{e}^{x}\\cos y$，由链式法则\n$$\\frac{\\partial z}{\\partial x}=f'(u)\\mathrm{e}^{x}\\cos y,\\qquad \\frac{\\partial z}{\\partial y}=-f'(u)\\mathrm{e}^{x}\\sin y.$$\n代入方程左边：\n$$\\cos y\\frac{\\partial z}{\\partial x}-\\sin y\\frac{\\partial z}{\\partial y}=f'(u)\\mathrm{e}^{x}(\\cos^{2}y+\\sin^{2}y)=f'(u)\\mathrm{e}^{x}.$$\n右边 $(4z+\\mathrm{e}^{x}\\cos y)\\mathrm{e}^{x}=(4f(u)+u)\\mathrm{e}^{x}$，故 $f'(u)-4f(u)=u$。一阶线性方程通解\n$$f(u)=\\mathrm{e}^{4u}\\Big(C+\\int u\\mathrm{e}^{-4u}\\mathrm{d}u\\Big)=C\\mathrm{e}^{4u}-\\frac u4-\\frac1{16}.$$\n由 $f(0)=0$ 得 $C=\\dfrac1{16}$，故 $f(u)=\\dfrac{1}{16}(\\mathrm{e}^{4u}-4u-1)$。",
      traps: "关键是左边两项合并时 $\\cos^{2}y+\\sin^{2}y=1$，把偏微分方程化成关于 $u$ 的 ODE；若把 $z$ 当一般二元函数直接积分会做不下去。$f$ 的自变量是 $u=\\mathrm{e}^{x}\\cos y$，不是 $x$。",
      hint: "把 $z=f(\\mathrm{e}^{x}\\cos y)$ 的两个偏导代入方程，利用 $\\cos^{2}y+\\sin^{2}y=1$ 得到 $f'(u)-4f(u)=u$，再用 $f(0)=0$ 定常数。",
      src: { file: "参考文件/真题/数学/5、【1987-2025年】考研数学三真题/3、2010-2022考研数学三真题.pdf", page: 35, no: "三(17)", note: "题面取自 crops/m3-1315-book-p35.png 逐字亲读（p33 页眉「2014 年全国硕士研究生招生考试试题」确认卷首，2014 卷 p33–p36）；答案与 2014 答案解析册 p4 对拍（册上 $f(u)=\\frac{1}{16}(\\mathrm{e}^{4u}-4u-1)$），独立重推一致。" }
    },
    {
      id: "m3-2014-18", origin: "year", year: 2014, no: "三(18)", type: "series", star: 3, school: "全国硕士研究生入学统一考试-数学三 2014 年",
      tags: ["ser10","zt07","gx53"],
      stem: "求幂级数 $\\sum\\limits_{n=0}^{\\infty}(n+1)(n+3)x^{n}$ 的收敛域及和函数。",
      answer: "收敛域 $(-1,1)$；和函数 $S(x)=\\dfrac{3-x}{(1-x)^{3}}$。系数 $a_n=(n+1)(n+3)$，由 $\\lim\\limits_{n\\to\\infty}\\left|\\frac{a_{n+1}}{a_n}\\right|=1$ 得收敛半径 $R=1$；$x=\\pm1$ 时通项不趋于 $0$，级数发散，故收敛域为 $(-1,1)$。\n在 $(-1,1)$ 内，由 $\\sum_{n=0}^{\\infty}x^{n}=\\frac1{1-x}$ 逐项求导得 $\\sum(n+1)x^{n}=\\frac1{(1-x)^{2}}$、$\\sum(n+1)(n+2)x^{n}=\\frac2{(1-x)^{3}}$。注意 $(n+1)(n+3)=(n+1)(n+2)+(n+1)$，故\n$$S(x)=\\frac{2}{(1-x)^{3}}+\\frac{1}{(1-x)^{2}}=\\frac{2+(1-x)}{(1-x)^{3}}=\\frac{3-x}{(1-x)^{3}},\\quad x\\in(-1,1).$$",
      traps: "收敛域要单独查端点：$x=1$ 时 $\\sum(n+1)(n+3)$ 发散，$x=-1$ 时通项 $(n+1)(n+3)(-1)^{n}$ 不趋于 $0$ 也发散，故是开区间 $(-1,1)$，不是 $[-1,1)$。",
      hint: "把 $(n+1)(n+3)$ 拆成 $(n+1)(n+2)+(n+1)$，分别用 $\\frac1{1-x}$ 的一阶、二阶导数对应的幂级数。",
      src: { file: "参考文件/真题/数学/5、【1987-2025年】考研数学三真题/3、2010-2022考研数学三真题.pdf", page: 35, no: "三(18)", note: "题面取自 crops/m3-1315-book-p35.png 逐字亲读（p33 页眉「2014 年全国硕士研究生招生考试试题」确认卷首，2014 卷 p33–p36）；答案与 2014 答案解析册 p4 对拍（册上收敛域 $(-1,1)$、$S(x)=\\frac{3-x}{(1-x)^3}$），独立重推一致。" }
    },
    {
      id: "m3-2014-19", origin: "year", year: 2014, no: "三(19)", type: "proof", star: 4, school: "全国硕士研究生入学统一考试-数学三 2014 年",
      tags: ["ms01","int23","tp03"],
      stem: "设函数 $f(x),g(x)$ 在区间 $[a,b]$ 上连续，且 $f(x)$ 单调增加，$0\\le g(x)\\le1$。证明：\n（Ⅰ）$0\\le\\int_a^{x}g(t)\\mathrm{d}t\\le x-a,\\ x\\in[a,b]$；\n（Ⅱ）$\\int_a^{a+\\int_a^{b}g(t)\\mathrm{d}t}f(x)\\mathrm{d}x\\le\\int_a^{b}f(x)g(x)\\mathrm{d}x$.",
      answer: "证明如下。\n（Ⅰ）由 $0\\le g(x)\\le1$，对 $x\\in[a,b]$ 有\n$$0=\\int_a^{x}0\\,\\mathrm{d}t\\le\\int_a^{x}g(t)\\mathrm{d}t\\le\\int_a^{x}1\\,\\mathrm{d}t=x-a.$$\n（Ⅱ）令 $F(x)=\\int_a^{a+\\int_a^{x}g(u)\\mathrm{d}u}f(t)\\mathrm{d}t-\\int_a^{x}f(t)g(t)\\mathrm{d}t$。由（Ⅰ）知 $a+\\int_a^{x}g(u)\\mathrm{d}u\\le x$，又 $f$ 单调增加、$g(x)\\ge0$，故\n$$F'(x)=\\Big[f\\Big(a+\\int_a^{x}g(u)\\mathrm{d}u\\Big)-f(x)\\Big]g(x)\\le0.$$\n故 $F$ 在 $[a,b]$ 上单调不增，而 $F(a)=0$，于是 $F(b)\\le0$，即\n$$\\int_a^{a+\\int_a^{b}g(t)\\mathrm{d}t}f(x)\\mathrm{d}x\\le\\int_a^{b}f(x)g(x)\\mathrm{d}x.$$",
      traps: "辅助函数的上限必须取随 $x$ 变的 $a+\\int_a^{x}g(u)\\mathrm{d}u$，否则求导后无法与 $\\int_a^{x}fg$ 配成 $F'(x)\\le0$；结论（Ⅰ）的 $a+\\int_a^{x}g\\le x$ 正是比较 $f$ 大小所需的。",
      hint: "构造 $F(x)=\\int_a^{a+\\int_a^{x}g}f-\\int_a^{x}fg$，用变上限积分求导与 $f$ 单调、$g\\ge0$ 证 $F'(x)\\le0$，再由 $F(a)=0$ 得 $F(b)\\le0$。",
      src: { file: "参考文件/真题/数学/5、【1987-2025年】考研数学三真题/3、2010-2022考研数学三真题.pdf", page: 35, no: "三(19)", note: "题面取自 crops/m3-1315-book-p35.png 逐字亲读（p33 页眉「2014 年全国硕士研究生招生考试试题」确认卷首，2014 卷 p33–p36）；答案与 2014 答案解析册 p4 末–p5 对拍（册上同一辅助函数 $F(x)$），独立重推一致。" }
    },
    {
      id: "m3-2014-20", origin: "year", year: 2014, no: "三(20)", type: "linalg", star: 4, school: "全国硕士研究生入学统一考试-数学三 2014 年",
      tags: ["la17","tp09","ln05"],
      stem: "设矩阵 $A=\\begin{pmatrix}1&-2&3&-4\\\\0&1&-1&1\\\\1&2&0&-3\\end{pmatrix}$，$E$ 为 $3$ 阶单位矩阵。\n（Ⅰ）求方程组 $A\\boldsymbol{x}=\\boldsymbol{0}$ 的一个基础解系；\n（Ⅱ）求满足 $AB=E$ 的所有矩阵 $B$.",
      answer: "（Ⅰ）一个基础解系为 $\\boldsymbol{\\alpha}=(-1,2,3,1)^{\\mathrm{T}}$。对 $A$ 作初等行变换：\n$$A\\longrightarrow\\begin{pmatrix}1&0&0&1\\\\0&1&0&-2\\\\0&0&1&-3\\end{pmatrix},$$\n同解方程组为 $x_1=-x_4,\\ x_2=2x_4,\\ x_3=3x_4$，取 $x_4=1$ 即得 $\\boldsymbol{\\alpha}$。\n（Ⅱ）记 $B=(\\boldsymbol{\\beta}_1,\\boldsymbol{\\beta}_2,\\boldsymbol{\\beta}_3)$，则 $A\\boldsymbol{\\beta}_j=\\boldsymbol{e}_j$。分别解三个非齐次方程组得特解\n$$\\boldsymbol{\\beta}_1^{(0)}=\\begin{pmatrix}2\\\\-1\\\\-1\\\\0\\end{pmatrix},\\quad \\boldsymbol{\\beta}_2^{(0)}=\\begin{pmatrix}6\\\\-3\\\\-4\\\\0\\end{pmatrix},\\quad \\boldsymbol{\\beta}_3^{(0)}=\\begin{pmatrix}-1\\\\1\\\\1\\\\0\\end{pmatrix},$$\n各自加上 $A\\boldsymbol{x}=\\boldsymbol{0}$ 的通解 $k_j\\boldsymbol{\\alpha}$，故\n$$B=\\begin{pmatrix}2&6&-1\\\\-1&-3&1\\\\-1&-4&1\\\\0&0&0\\end{pmatrix}+\\big(k_1\\boldsymbol{\\alpha},\\ k_2\\boldsymbol{\\alpha},\\ k_3\\boldsymbol{\\alpha}\\big),\\quad k_1,k_2,k_3\\ \\text{为任意常数}.$$",
      traps: "$B$ 是 $4\\times3$ 矩阵，每列分别是 $A\\boldsymbol{x}=\\boldsymbol{e}_j$ 的解，三个任意常数相互独立；只写一个 $k$ 或把 $B$ 写成 $3\\times4$ 是常见错。又 $r(A)=3$、未知量 $4$ 个，基础解系恰含 $1$ 个向量。",
      hint: "先对 $A$ 行化简求 $A\\boldsymbol{x}=\\boldsymbol{0}$ 的基础解系；再把 $AB=E$ 按列拆成三个 $A\\boldsymbol{x}=\\boldsymbol{e}_j$，各求一个特解后加 $k_j\\boldsymbol{\\alpha}$。",
      src: { file: "参考文件/真题/数学/5、【1987-2025年】考研数学三真题/3、2010-2022考研数学三真题.pdf", page: 35, no: "三(20)", note: "题面取自 crops/m3-1315-book-p35.png 逐字亲读（p33 页眉「2014 年全国硕士研究生招生考试试题」确认卷首，2014 卷 p33–p36）；答案与 2014 答案解析册 p5 对拍（册上基础解系 $(-1,2,3,1)^{\\mathrm{T}}$ 及 $B$ 的三个特解列），独立行变换重推一致。" }
    },
    {
      id: "m3-2014-21", origin: "year", year: 2014, no: "三(21)", type: "eigen", star: 4, school: "全国硕士研究生入学统一考试-数学三 2014 年",
      tags: ["la13","zb25","la04"],
      stem: "证明 $n$ 阶矩阵\n$$\\begin{pmatrix}1&1&\\cdots&1\\\\1&1&\\cdots&1\\\\\\vdots&\\vdots&&\\vdots\\\\1&1&\\cdots&1\\end{pmatrix}\\quad\\text{与}\\quad\\begin{pmatrix}0&\\cdots&0&1\\\\0&\\cdots&0&2\\\\\\vdots&&\\vdots&\\vdots\\\\0&\\cdots&0&n\\end{pmatrix}\\ \\text{相似}.$$",
      answer: "证明：记前者为 $A$（全 $1$ 矩阵），后者为 $B$（仅最后一列为 $1,2,\\dots,n$）。两者特征多项式相同：\n$$|\\lambda E-A|=(\\lambda-n)\\lambda^{n-1},\\qquad |\\lambda E-B|=(\\lambda-n)\\lambda^{n-1},$$\n故特征值同为 $\\lambda_1=n$ 与 $\\lambda_2=0$（$n-1$ 重）。$A$ 为实对称矩阵，必可相似对角化；又 $r(0\\cdot E-B)=r(B)=1$，故 $B$ 对应 $\\lambda=0$ 有 $n-1$ 个线性无关特征向量，连同 $\\lambda=n$ 的一个共 $n$ 个，$B$ 也可对角化。二者均相似于 $\\mathrm{diag}(n,0,\\dots,0)$，故 $A$ 与 $B$ 相似。",
      traps: "仅有相同特征值不足以推出相似，还须都可对角化；本题必须分别验证 $A$ 实对称、以及 $B$ 对 $\\lambda=0$ 的几何重数 $n-r(B)=n-1$，否则结论不成立。",
      hint: "算两者特征多项式得相同特征值，再用「实对称必可对角化」与「$r(B)=1$ 给出 $n-1$ 个零特征值特征向量」说明都相似于同一对角阵。",
      src: { file: "参考文件/真题/数学/5、【1987-2025年】考研数学三真题/3、2010-2022考研数学三真题.pdf", page: 36, no: "三(21)", note: "题面取自 crops/m3-1315-book-p36.png 逐字亲读（p33 页眉「2014 年全国硕士研究生招生考试试题」确认卷首，2014 卷 p33–p36）；答案与 2014 答案解析册 p5 末–p6 对拍（册上 $|\\lambda E-A|=(\\lambda-n)\\lambda^{n-1}$、$r(B)=1$ 的论证），独立重推一致。" }
    },
    {
      id: "m3-2014-22", origin: "year", year: 2014, no: "三(22)", type: "estimate", star: 3, school: "全国硕士研究生入学统一考试-数学三 2014 年",
      tags: ["zt04","int23","tp02"],
      stem: "设随机变量 $X$ 的概率分布为 $P\\{X=1\\}=P\\{X=2\\}=\\dfrac12$。在给定 $X=i$ 的条件下，随机变量 $Y$ 服从均匀分布 $U(0,i)\\ (i=1,2)$。\n（Ⅰ）求 $Y$ 的分布函数 $F_Y(y)$；（Ⅱ）求 $E(Y)$.",
      answer: "（Ⅰ）\n$$F_Y(y)=\\begin{cases}0,&y<0,\\\\[2pt] \\dfrac{3y}{4},&0\\le y<1,\\\\[4pt] \\dfrac12+\\dfrac{y}{4},&1\\le y<2,\\\\[4pt] 1,&y\\ge2.\\end{cases}$$\n（Ⅱ）$E(Y)=\\dfrac34$。\n\n（Ⅰ）由全概率公式\n$$F_Y(y)=\\tfrac12P\\{Y\\le y\\mid X=1\\}+\\tfrac12P\\{Y\\le y\\mid X=2\\},$$\n其中条件分布函数分别为 $y\\ (0\\le y<1)$ 与 $\\frac y2\\ (0\\le y<2)$，按 $y<0,\\ 0\\le y<1,\\ 1\\le y<2,\\ y\\ge2$ 四段合并即得上式。\n（Ⅱ）由 $F_Y$ 得密度 $f_Y(y)=\\frac34\\ (0<y<1)$、$\\frac14\\ (1\\le y<2)$，故\n$$E(Y)=\\int_0^1y\\cdot\\frac34\\,\\mathrm{d}y+\\int_1^2y\\cdot\\frac14\\,\\mathrm{d}y=\\frac38+\\frac38=\\frac34.$$",
      traps: "$Y$ 要按 $X=1,2$ 混合：密度在 $(0,1)$ 为 $\\frac12\\cdot1+\\frac12\\cdot\\frac12=\\frac34$，在 $(1,2)$ 只有 $\\frac12\\cdot\\frac12=\\frac14$，分段点 $y=1$ 处密度跳变，分布函数须分四段写。",
      hint: "用全概率公式 $F_Y(y)=\\frac12F_{Y|X=1}(y)+\\frac12F_{Y|X=2}(y)$ 分段写出，再积分求 $E(Y)$。",
      src: { file: "参考文件/真题/数学/5、【1987-2025年】考研数学三真题/3、2010-2022考研数学三真题.pdf", page: 36, no: "三(22)", note: "题面取自 crops/m3-1315-book-p36.png 逐字亲读（p33 页眉「2014 年全国硕士研究生招生考试试题」确认卷首，2014 卷 p33–p36）；答案与 2014 答案解析册 p6 对拍（册上四段 $F_Y(y)$ 与 $EY=\\frac34$），独立重推一致。" }
    },
    {
      id: "m3-2014-23", origin: "year", year: 2014, no: "三(23)", type: "estimate", star: 4, school: "全国硕士研究生入学统一考试-数学三 2014 年",
      tags: ["zt04","int23","tp02"],
      stem: "设随机变量 $X,Y$ 的概率分布相同，$X$ 的概率分布为 $P\\{X=0\\}=\\dfrac13,\\ P\\{X=1\\}=\\dfrac23$，且 $X$ 与 $Y$ 的相关系数 $\\rho_{XY}=\\dfrac12$。\n（Ⅰ）求 $(X,Y)$ 的概率分布；（Ⅱ）求 $P\\{X+Y\\le1\\}$.",
      answer: "（Ⅰ）联合分布为\n$$\\begin{array}{c|cc}X\\backslash Y&0&1\\\\\\hline 0&\\frac29&\\frac19\\\\ 1&\\frac19&\\frac59\\end{array}$$\n（Ⅱ）$P\\{X+Y\\le1\\}=\\dfrac49$。\n\n（Ⅰ）设 $P\\{X=0,Y=0\\}=a,\\ P\\{X=0,Y=1\\}=b,\\ P\\{X=1,Y=0\\}=c,\\ P\\{X=1,Y=1\\}=d$。由边缘分布与 $X,Y$ 同分布得\n$$a+b=\\tfrac13,\\quad c+d=\\tfrac23,\\quad a+c=\\tfrac13,\\quad b+d=\\tfrac23,$$\n且 $EX=EY=\\frac23,\\ DX=DY=\\frac23\\cdot\\frac13=\\frac29$。又\n$$\\mathrm{Cov}(X,Y)=E(XY)-EX\\cdot EY=d-\\frac49,\\qquad \\rho_{XY}=\\frac{d-\\frac49}{\\frac29}=\\frac12,$$\n解得 $d=\\frac59$，进而 $c=b=\\frac23-\\frac59=\\frac19,\\ a=\\frac13-\\frac19=\\frac29$。\n（Ⅱ）$X+Y>1$ 只对应 $(X,Y)=(1,1)$，故\n$$P\\{X+Y\\le1\\}=1-P\\{X=1,Y=1\\}=1-\\frac59=\\frac49.$$",
      traps: "由 $\\rho=\\frac12$ 只能定出 $d=P\\{X=1,Y=1\\}$，其余三个概率要靠四个边缘方程补齐；别误以为 $\\rho$ 直接确定整个联合分布，更不能假设独立（独立时 $\\rho=0$）。",
      hint: "设四个联合概率，用边缘分布列四个方程，再用 $\\rho_{XY}=\\frac{d-4/9}{2/9}=\\frac12$ 定 $d$，回代得全部。",
      src: { file: "参考文件/真题/数学/5、【1987-2025年】考研数学三真题/3、2010-2022考研数学三真题.pdf", page: 36, no: "三(23)", note: "题面取自 crops/m3-1315-book-p36.png 逐字亲读（p33 页眉「2014 年全国硕士研究生招生考试试题」确认卷首，2014 卷 p33–p36）；答案与 2014 答案解析册 p7 对拍（册上联合分布表与 $P=\\frac49$），独立重推一致。" }
    },
    {
      id: "m3-2015-13", origin: "year", year: 2015, no: "二(13)", type: "linalg", star: 3, school: "全国硕士研究生招生考试-数学三 2015 年",
      tags: ["la12","zb23","la04"],
      stem: "设 $3$ 阶矩阵 $A$ 的特征值为 $2,-2,1$，$B=A^{2}-A+E$，其中 $E$ 为 $3$ 阶单位矩阵，则行列式 $|B|=$______.",
      answer: "填 $21$。若 $\\lambda$ 是 $A$ 的特征值，则 $B=A^{2}-A+E$ 的对应特征值为 $\\lambda^{2}-\\lambda+1$。代入 $\\lambda=2,-2,1$：\n$$2^{2}-2+1=3,\\quad (-2)^{2}-(-2)+1=7,\\quad 1^{2}-1+1=1.$$\n故 $B$ 的特征值为 $3,7,1$，$|B|=3\\times7\\times1=21$。",
      traps: "别把 $B$ 的特征值算成 $\\lambda^{2}-\\lambda$（漏掉 $+E$ 贡献的 $1$）；$|B|$ 是特征值之积，不是特征值之和。",
      hint: "利用「矩阵多项式的特征值 = 特征值的同一多项式」，逐个代入 $A$ 的三个特征值再相乘。",
      src: { file: "参考文件/真题/数学/5、【1987-2025年】考研数学三真题/3、2010-2022考研数学三真题.pdf", page: 30, no: "二(13)", note: "题面取自 crops/m3-1315-book-p30.png 逐字亲读（p29 页眉「2015 年全国硕士研究生招生考试试题」确认卷首，2015 卷 p29–p32）；答案与 2015 答案解析册 p4 对拍（册上 $3\\times7\\times1=21$），独立重推一致。" }
    },
    {
      id: "m3-2015-14", origin: "year", year: 2015, no: "二(14)", type: "estimate", star: 3, school: "全国硕士研究生招生考试-数学三 2015 年",
      tags: ["zt04","int23","tp02"],
      stem: "设二维随机变量 $(X,Y)$ 服从正态分布 $N(1,0;1,1;0)$，则 $P\\{XY-Y<0\\}=$______.",
      answer: "填 $\\dfrac12$。$(X,Y)\\sim N(1,0;1,1;0)$，相关系数 $\\rho=0$，故 $X,Y$ 相互独立，且 $X\\sim N(1,1),\\ Y\\sim N(0,1)$，于是 $X-1\\sim N(0,1)$、$Y\\sim N(0,1)$。\n$$XY-Y<0\\ \\Longleftrightarrow\\ (X-1)Y<0,$$\n即 $X-1$ 与 $Y$ 异号，由对称性各自大于/小于 $0$ 的概率均为 $\\frac12$：\n$$P\\{X-1<0,Y>0\\}+P\\{X-1>0,Y<0\\}=\\tfrac12\\cdot\\tfrac12+\\tfrac12\\cdot\\tfrac12=\\tfrac12.$$",
      traps: "先把 $XY-Y$ 提取为 $(X-1)Y$；$N(1,1)$ 关于 $x=1$ 对称故 $P\\{X-1<0\\}=\\frac12$；二维正态下 $\\rho=0$ 意味着独立，可把联合概率拆成乘积。",
      hint: "提取 $(X-1)Y<0$，利用二维正态 $\\rho=0\\Rightarrow$ 独立及各变量关于均值的对称性拆成符号组合。",
      src: { file: "参考文件/真题/数学/5、【1987-2025年】考研数学三真题/3、2010-2022考研数学三真题.pdf", page: 30, no: "二(14)", note: "题面取自 crops/m3-1315-book-p30.png 逐字亲读（p29 页眉「2015 年全国硕士研究生招生考试试题」确认卷首，2015 卷 p29–p32）；答案与 2015 答案解析册 p4 对拍（册上 $\\frac12$），独立重推一致。" }
    },
    {
      id: "m3-2015-15", origin: "year", year: 2015, no: "三(15)", type: "limit", star: 3, school: "全国硕士研究生招生考试-数学三 2015 年",
      tags: ["tay04","tay02","zb13"],
      stem: "设函数 $f(x)=x+a\\ln(1+x)+bx\\sin x$，$g(x)=kx^{3}$，若 $f(x)$ 与 $g(x)$ 在 $x\\to0$ 时是等价无穷小，求 $a,b,k$ 的值。",
      answer: "$a=-1,\\ b=-\\dfrac12,\\ k=-\\dfrac13$。泰勒展开（$x\\to0$）：\n$$\\ln(1+x)=x-\\frac{x^{2}}2+\\frac{x^{3}}3+o(x^{3}),\\qquad x\\sin x=x^{2}+o(x^{3}),$$\n故\n$$f(x)=(1+a)x+\\Big(-\\frac a2+b\\Big)x^{2}+\\frac a3x^{3}+o(x^{3}).$$\n$f(x)\\sim kx^{3}$ 要求一次、二次项系数为 $0$ 且三次项系数等于 $k$：\n$$1+a=0,\\quad -\\frac a2+b=0,\\quad \\frac a3=k,$$\n解得 $a=-1,\\ b=-\\dfrac12,\\ k=-\\dfrac13$。",
      traps: "三个条件缺一不可：只令 $1+a=0$ 会得到 $f\\sim(\\frac12+b)x^{2}$，与 $kx^{3}$ 不同阶；必须把 $\\ln(1+x)$ 展到 $x^{3}$、$x\\sin x$ 展到 $x^{2}$。等价无穷小要求 $\\lim f/g=1$，不只是同阶。",
      hint: "把 $f$ 展开到 $x^{3}$，令 $x$、$x^{2}$ 项系数为零、$x^{3}$ 项系数等于 $k$。",
      src: { file: "参考文件/真题/数学/5、【1987-2025年】考研数学三真题/3、2010-2022考研数学三真题.pdf", page: 30, no: "三(15)", note: "题面取自 crops/m3-1315-book-p30.png 逐字亲读（p29 页眉「2015 年全国硕士研究生招生考试试题」确认卷首，2015 卷 p29–p32）；答案与 2015 答案解析册 p4 对拍（册上用多次洛必达得 $a=-1,b=-\\frac12,k=-\\frac13$），独立用泰勒展开重推一致。" }
    },
    {
      id: "m3-2015-16", origin: "year", year: 2015, no: "三(16)", type: "dblint", star: 4, school: "全国硕士研究生招生考试-数学三 2015 年",
      tags: ["dbi01","ext27","tp08"],
      stem: "计算二重积分 $\\displaystyle\\iint_D x(x+y)\\mathrm{d}x\\mathrm{d}y$，其中 $D=\\{(x,y)\\mid x^{2}+y^{2}\\le2,\\ y\\ge x^{2}\\}$。",
      answer: "$\\dfrac{\\pi}{4}-\\dfrac{2}{5}$。区域 $D$ 关于 $y$ 轴对称，而 $xy$ 关于 $x$ 为奇函数，故 $\\iint_Dxy\\,\\mathrm{d}x\\mathrm{d}y=0$，\n$$\\iint_D x(x+y)\\mathrm{d}x\\mathrm{d}y=\\iint_D x^{2}\\mathrm{d}x\\mathrm{d}y.$$\n两边界 $x^{2}+y^{2}=2$ 与 $y=x^{2}$ 交于 $x=\\pm1$（此时 $y=1$），由对称性取 $x\\ge0$ 加倍：\n$$=2\\int_0^{1}\\mathrm{d}x\\int_{x^{2}}^{\\sqrt{2-x^{2}}}x^{2}\\mathrm{d}y=2\\int_0^{1}x^{2}\\big(\\sqrt{2-x^{2}}-x^{2}\\big)\\mathrm{d}x.$$\n令 $x=\\sqrt2\\sin t$，$\\int_0^{1}x^{2}\\sqrt{2-x^{2}}\\mathrm{d}x=4\\int_0^{\\pi/4}\\sin^{2}t\\cos^{2}t\\,\\mathrm{d}t=\\frac12\\int_0^{\\pi/4}(1-\\cos4t)\\mathrm{d}t=\\frac\\pi8$，且 $\\int_0^{1}x^{4}\\mathrm{d}x=\\frac15$，故\n$$\\text{原式}=2\\Big(\\frac\\pi8-\\frac15\\Big)=\\frac\\pi4-\\frac25.$$",
      traps: "别漏掉对称性带来的 $\\iint_Dxy=0$；交点由 $x^{2}+x^{4}=2$ 得 $x^{2}=1$ 即 $x=\\pm1$，积分限 $y$ 从 $x^{2}$ 到 $\\sqrt{2-x^{2}}$；$\\int_0^1x^{2}\\sqrt{2-x^{2}}\\mathrm{d}x=\\frac\\pi8$ 而非 $\\frac\\pi4$。",
      hint: "先用对称性把被积函数化为 $x^{2}$，再化成先 $y$ 后 $x$ 的累次积分，对 $\\int x^{2}\\sqrt{2-x^{2}}\\mathrm{d}x$ 用 $x=\\sqrt2\\sin t$。",
      src: { file: "参考文件/真题/数学/5、【1987-2025年】考研数学三真题/3、2010-2022考研数学三真题.pdf", page: 30, no: "三(16)", note: "题面取自 crops/m3-1315-book-p30.png 逐字亲读（p29 页眉「2015 年全国硕士研究生招生考试试题」确认卷首，2015 卷 p29–p32）；答案与 2015 答案解析册 p4 末–p5 对拍（册上 $\\frac\\pi4-\\frac25$），独立重推一致。" }
    },
    {
      id: "m3-2015-17", origin: "year", year: 2015, no: "三(17)", type: "econ", star: 4, school: "全国硕士研究生招生考试-数学三 2015 年",
      tags: ["ext08","kn12","gx28"],
      stem: "为了实现利润最大化，厂商需要对某商品确定其定价模型。设 $Q$ 为该商品的需求量，$p$ 为价格，$MC$ 为边际成本，$\\eta$ 为需求弹性（$\\eta>0$）。\n（Ⅰ）证明定价模型为 $p=\\dfrac{MC}{1-\\dfrac1\\eta}$；\n（Ⅱ）若该商品的成本函数为 $C(Q)=1\\,600+Q^{2}$，需求函数为 $Q=40-p$，试由（Ⅰ）中的定价模型确定此商品的价格。",
      answer: "（Ⅰ）收益 $R=pQ$，对 $Q$ 求导：\n$$MR=\\frac{\\mathrm{d}R}{\\mathrm{d}Q}=p+Q\\frac{\\mathrm{d}p}{\\mathrm{d}Q}=p\\Big(1+\\frac{Q}{p}\\frac{\\mathrm{d}p}{\\mathrm{d}Q}\\Big)=p\\Big(1-\\frac1\\eta\\Big),\\qquad \\eta=-\\frac{p}{Q}\\frac{\\mathrm{d}Q}{\\mathrm{d}p}.$$\n利润最大要求 $MR=MC$，即 $p\\big(1-\\frac1\\eta\\big)=MC$，故 $p=\\dfrac{MC}{1-\\frac1\\eta}$。\n（Ⅱ）$p=30$。由 $C(Q)=1\\,600+Q^{2}$ 得 $MC=2Q$；$Q=40-p$ 得 $\\frac{\\mathrm{d}Q}{\\mathrm{d}p}=-1$，$\\eta=\\frac{p}{40-p}$，于是 $\\frac1\\eta=\\frac{40-p}{p}$。代入定价模型：\n$$p=\\frac{2(40-p)}{1-\\frac{40-p}{p}}=\\frac{2p(40-p)}{2p-40}\\ \\Longrightarrow\\ p(p-20)=p(40-p)\\ \\Longrightarrow\\ 2p=60,$$\n故 $p=30$（此时 $Q=10,\\ MC=20,\\ \\eta=3$，验证 $30\\times\\frac23=20=MC$ 成立）。",
      traps: "$\\eta=-\\frac{p}{Q}\\frac{\\mathrm{d}Q}{\\mathrm{d}p}$，代入时 $\\frac1\\eta=\\frac{40-p}{p}$ 而不是 $\\eta$ 本身；若把分母写成 $1-\\frac{p}{40-p}$ 会得到无实根的方程。弹性按 $\\eta>0$ 约定，$MR=MC$ 是利润最大化的必要条件。",
      hint: "先对 $R=pQ$ 求 $\\frac{\\mathrm{d}R}{\\mathrm{d}Q}$ 并用 $\\eta$ 化简得到定价模型，再把 $MC=2Q,\\ \\eta=\\frac{p}{40-p}$ 代入解 $p$。",
      src: { file: "参考文件/真题/数学/5、【1987-2025年】考研数学三真题/3、2010-2022考研数学三真题.pdf", page: 31, no: "三(17)", note: "题面取自 crops/m3-1315-book-p31.png 逐字亲读（p29 页眉「2015 年全国硕士研究生招生考试试题」确认卷首，2015 卷 p29–p32）；答案册 p5 (Ⅱ) 中间式写成 $p=\\frac{2(40-p)}{1-\\frac{p}{40-p}}$，把 $1/\\eta$ 误写成 $\\eta$（该式化简后判别式为负、无实根）；独立重推（分母应为 $1-\\frac{40-p}{p}$）得 $p=30$，与册上结论一致，册上中间式应为笔误。" }
    },
    {
      id: "m3-2015-18", origin: "year", year: 2015, no: "三(18)", type: "ode", star: 3, school: "全国硕士研究生招生考试-数学三 2015 年",
      tags: ["ode01","gx15"],
      stem: "设函数 $f(x)$ 在定义域 $I$ 上的导数大于零。若对任意的 $x_0\\in I$，曲线 $y=f(x)$ 在点 $(x_0,f(x_0))$ 处的切线与直线 $x=x_0$ 及 $x$ 轴所围成区域的面积恒为 $4$，且 $f(0)=2$，求 $f(x)$ 的表达式。",
      answer: "$f(x)=\\dfrac{8}{4-x}\\ (x\\in I)$。点 $(x_0,f(x_0))$ 处切线为 $y=f(x_0)+f'(x_0)(x-x_0)$，与 $x$ 轴交点为 $\\big(x_0-\\frac{f(x_0)}{f'(x_0)},0\\big)$。该切线、直线 $x=x_0$ 与 $x$ 轴围成直角三角形，面积\n$$\\frac12\\left|\\frac{f(x_0)}{f'(x_0)}\\right|\\cdot|f(x_0)|=4.$$\n由 $f'>0$ 且 $f(0)=2>0$（故 $f>0$）得 $f'=\\dfrac{f^{2}}8$。分离变量：\n$$-\\frac1f=\\frac x8+C\\ \\Longrightarrow\\ f(x)=-\\frac{8}{x+8C}.$$\n由 $f(0)=2$ 得 $8C=-4$，故 $f(x)=-\\dfrac{8}{x-4}=\\dfrac{8}{4-x}$。",
      traps: "面积中的高是 $|f(x_0)|$、底是 $\\left|\\frac{f(x_0)}{f'(x_0)}\\right|$，别把底写成 $x_0$；由 $f'>0$ 与 $f(0)=2$ 可保号去掉绝对值，否则会多出一支解；定义域 $I$ 须满足 $x<4$。",
      hint: "写出切线在 $x$ 轴上的截距，用三角形面积 $=4$ 得到 $f'=\\frac18f^{2}$，解可分离变量方程并用 $f(0)=2$ 定常数。",
      src: { file: "参考文件/真题/数学/5、【1987-2025年】考研数学三真题/3、2010-2022考研数学三真题.pdf", page: 31, no: "三(18)", note: "题面取自 crops/m3-1315-book-p31.png 逐字亲读（p29 页眉「2015 年全国硕士研究生招生考试试题」确认卷首，2015 卷 p29–p32）；答案与 2015 答案解析册 p5 对拍（册上 $f(x)=\\frac{8}{4-x}$），独立重推一致。" }
    },
    {
      id: "m3-2015-19", origin: "year", year: 2015, no: "三(19)", type: "proof", star: 3, school: "全国硕士研究生招生考试-数学三 2015 年",
      tags: ["dr02","ext01","dr09"],
      stem: "（Ⅰ）设函数 $u(x),v(x)$ 可导，利用导数定义证明 $[u(x)v(x)]'=u'(x)v(x)+u(x)v'(x)$；\n（Ⅱ）设函数 $u_1(x),u_2(x),\\cdots,u_n(x)$ 可导，$f(x)=u_1(x)u_2(x)\\cdots u_n(x)$，写出 $f(x)$ 的求导公式。",
      answer: "（Ⅰ）由 $u,v$ 可导，$\\lim\\limits_{\\Delta x\\to0}\\frac{u(x+\\Delta x)-u(x)}{\\Delta x}=u'(x)$、$\\lim\\limits_{\\Delta x\\to0}\\frac{v(x+\\Delta x)-v(x)}{\\Delta x}=v'(x)$，且可导必连续故 $\\lim\\limits_{\\Delta x\\to0}v(x+\\Delta x)=v(x)$。于是\n$$[u(x)v(x)]'=\\lim_{\\Delta x\\to0}\\frac{u(x+\\Delta x)v(x+\\Delta x)-u(x)v(x)}{\\Delta x}$$\n$$=\\lim_{\\Delta x\\to0}\\frac{[u(x+\\Delta x)-u(x)]v(x+\\Delta x)+u(x)[v(x+\\Delta x)-v(x)]}{\\Delta x}$$\n$$=u'(x)v(x)+u(x)v'(x).$$\n（Ⅱ）推广到 $n$ 个因子（每项只对其中一个因子求导）：\n$$f'(x)=u_1'(x)u_2(x)\\cdots u_n(x)+u_1(x)u_2'(x)\\cdots u_n(x)+\\cdots+u_1(x)u_2(x)\\cdots u_n'(x).$$",
      traps: "证明中必须加减同一项 $u(x)v(x+\\Delta x)$（或 $u(x+\\Delta x)v(x)$）才能拆成两个差商；还要用到「可导 ⇒ 连续」得到 $\\lim v(x+\\Delta x)=v(x)$，这一步常被漏掉。",
      hint: "在分子中插入并减去 $u(x)v(x+\\Delta x)$，拆成两个差商分别取极限，并用可导必连续处理 $v(x+\\Delta x)$。",
      src: { file: "参考文件/真题/数学/5、【1987-2025年】考研数学三真题/3、2010-2022考研数学三真题.pdf", page: 31, no: "三(19)", note: "题面取自 crops/m3-1315-book-p31.png 逐字亲读（p29 页眉「2015 年全国硕士研究生招生考试试题」确认卷首，2015 卷 p29–p32）；答案与 2015 答案解析册 p5 末–p6 对拍（册上同一差商拆项与 $n$ 因子公式），独立重推一致。" }
    },
    {
      id: "m3-2015-20", origin: "year", year: 2015, no: "三(20)", type: "linalg", star: 4, school: "全国硕士研究生招生考试-数学三 2015 年",
      tags: ["ln05","kn44","la10"],
      stem: "设矩阵 $A=\\begin{pmatrix}a&1&0\\\\1&a&-1\\\\0&1&a\\end{pmatrix}$，且 $A^{3}=O$。\n（Ⅰ）求 $a$ 的值；\n（Ⅱ）若矩阵 $X$ 满足 $X-XA^{2}-AX+AXA^{2}=E$，其中 $E$ 为 $3$ 阶单位矩阵，求 $X$。",
      answer: "（Ⅰ）$a=0$。（Ⅱ）$X=\\begin{pmatrix}3&1&-2\\\\1&1&-1\\\\2&1&-1\\end{pmatrix}$。\n\n（Ⅰ）$|A|=a(a^{2}+1)-a=a^{3}$，由 $A^{3}=O$ 得 $|A|^{3}=|A^{3}|=0$，故 $|A|=0$，即 $a=0$。\n（Ⅱ）方程可因式分解：\n$$X-XA^{2}-AX+AXA^{2}=(E-A)X(E-A^{2})=E,$$\n故 $X=(E-A)^{-1}(E-A^{2})^{-1}$。取 $a=0$，$A=\\begin{pmatrix}0&1&0\\\\1&0&-1\\\\0&1&0\\end{pmatrix}$，$A^{2}=\\begin{pmatrix}1&0&-1\\\\0&0&0\\\\1&0&-1\\end{pmatrix}$，\n$$E-A=\\begin{pmatrix}1&-1&0\\\\-1&1&1\\\\0&-1&1\\end{pmatrix},\\qquad E-A^{2}=\\begin{pmatrix}0&0&1\\\\0&1&0\\\\-1&0&2\\end{pmatrix}.$$\n两者均可逆（行列式均为 $1$），求得\n$$(E-A)^{-1}=\\begin{pmatrix}2&1&-1\\\\1&1&-1\\\\1&1&0\\end{pmatrix},\\qquad (E-A^{2})^{-1}=\\begin{pmatrix}2&0&-1\\\\0&1&0\\\\1&0&0\\end{pmatrix},$$\n相乘得 $X=(E-A)^{-1}(E-A^{2})^{-1}=\\begin{pmatrix}3&1&-2\\\\1&1&-1\\\\2&1&-1\\end{pmatrix}$。",
      traps: "关键是把 $X-XA^{2}-AX+AXA^{2}$ 因式分解成 $(E-A)X(E-A^{2})$；矩阵乘法不交换，两个因子分居 $X$ 左右不能合并；还需验证二者可逆（$|E-A|=|E-A^{2}|=1$）。",
      hint: "把方程写成 $(E-A)X(E-A^{2})=E$，先由 $|A|=a^{3}=0$ 定 $a=0$，再算 $A^{2}$ 与两个逆矩阵相乘。",
      src: { file: "参考文件/真题/数学/5、【1987-2025年】考研数学三真题/3、2010-2022考研数学三真题.pdf", page: 31, no: "三(20)", note: "题面取自 crops/m3-1315-book-p31.png 逐字亲读（p29 页眉「2015 年全国硕士研究生招生考试试题」确认卷首，2015 卷 p29–p32）；答案与 2015 答案解析册 p6 对拍（册上 $a=0$ 及 $X=(E-A)^{-1}(E-A^2)^{-1}$ 的三矩阵），独立重推一致。" }
    },
    {
      id: "m3-2015-21", origin: "year", year: 2015, no: "三(21)", type: "eigen", star: 4, school: "全国硕士研究生招生考试-数学三 2015 年",
      tags: ["zb25","la13","tp04"],
      stem: "设矩阵 $A=\\begin{pmatrix}0&2&-3\\\\-1&3&-3\\\\1&-2&a\\end{pmatrix}$ 相似于矩阵 $B=\\begin{pmatrix}1&-2&0\\\\0&b&0\\\\0&3&1\\end{pmatrix}$。\n（Ⅰ）求 $a,b$ 的值；\n（Ⅱ）求可逆矩阵 $P$，使 $P^{-1}AP$ 为对角矩阵。",
      answer: "（Ⅰ）$a=4,\\ b=5$。（Ⅱ）$P=\\begin{pmatrix}2&-3&-1\\\\1&0&-1\\\\0&1&1\\end{pmatrix}$，$P^{-1}AP=\\mathrm{diag}(1,1,5)$。\n\n（Ⅰ）$A\\sim B$ 故迹与行列式分别相等：\n$$\\mathrm{tr}(A)=3+a=2+b=\\mathrm{tr}(B),\\qquad |A|=2a-3=b=|B|,$$\n解得 $a=4,\\ b=5$。\n（Ⅱ）此时 $A=\\begin{pmatrix}0&2&-3\\\\-1&3&-3\\\\1&-2&4\\end{pmatrix}$，$|\\lambda E-A|=(\\lambda-1)^{2}(\\lambda-5)$，特征值 $1,1,5$。解 $(E-A)x=0$ 得 $\\xi_1=(2,1,0)^{\\mathrm{T}},\\ \\xi_2=(-3,0,1)^{\\mathrm{T}}$；解 $(5E-A)x=0$ 得 $\\xi_3=(-1,-1,1)^{\\mathrm{T}}$。令\n$$P=(\\xi_1,\\xi_2,\\xi_3)=\\begin{pmatrix}2&-3&-1\\\\1&0&-1\\\\0&1&1\\end{pmatrix},$$\n则 $P$ 可逆且 $P^{-1}AP=\\begin{pmatrix}1&0&0\\\\0&1&0\\\\0&0&5\\end{pmatrix}$。",
      traps: "由相似只能列出迹相等与行列式相等两个方程，恰好定出 $a,b$；$\\lambda=1$ 是二重根，必须找到两个线性无关特征向量（本题恰有两个，故可对角化），$P$ 的列按特征值顺序排列才与对角阵对应。",
      hint: "用 $\\mathrm{tr}A=\\mathrm{tr}B$、$|A|=|B|$ 解 $a,b$，再求 $A$ 的全部特征向量拼成 $P$。",
      src: { file: "参考文件/真题/数学/5、【1987-2025年】考研数学三真题/3、2010-2022考研数学三真题.pdf", page: 32, no: "三(21)", note: "题面取自 crops/m3-1315-book-p32.png 逐字亲读（p29 页眉「2015 年全国硕士研究生招生考试试题」确认卷首，2015 卷 p29–p32）；答案与 2015 答案解析册 p6 末–p7 对拍（册上 $a=4,b=5$、$P=(\\xi_1,\\xi_2,\\xi_3)$），独立验证三个特征向量并重推一致。" }
    },
    {
      id: "m3-2015-22", origin: "year", year: 2015, no: "三(22)", type: "estimate", star: 4, school: "全国硕士研究生招生考试-数学三 2015 年",
      tags: ["zt04","int23","tp02"],
      stem: "设随机变量 $X$ 的概率密度为\n$$f(x)=\\begin{cases}2^{-x}\\ln2,&x>0,\\\\0,&x\\le0.\\end{cases}$$\n对 $X$ 进行独立重复的观测，直到第 $2$ 个大于 $3$ 的观测值出现时停止，记 $Y$ 为观测次数。\n（Ⅰ）求 $Y$ 的概率分布；（Ⅱ）求 $E(Y)$。",
      answer: "（Ⅰ）$P\\{Y=k\\}=(k-1)\\left(\\dfrac78\\right)^{k-2}\\left(\\dfrac18\\right)^{2},\\ k=2,3,\\cdots$；（Ⅱ）$E(Y)=16$。\n\n（Ⅰ）单次观测值大于 $3$ 的概率\n$$p=P\\{X>3\\}=\\int_3^{+\\infty}2^{-x}\\ln2\\,\\mathrm{d}x=2^{-3}=\\frac18.$$\n$Y=k$ 表示第 $k$ 次观测恰为第 $2$ 个大于 $3$ 的值，且前 $k-1$ 次中恰有 $1$ 个大于 $3$：\n$$P\\{Y=k\\}=\\binom{k-1}{1}p(1-p)^{k-2}\\cdot p=(k-1)\\Big(\\frac78\\Big)^{k-2}\\Big(\\frac18\\Big)^{2},\\quad k=2,3,\\cdots.$$\n（Ⅱ）这是负二项分布（第 $r=2$ 次成功所需试验次数），$E(Y)=\\dfrac{r}{p}=\\dfrac{2}{1/8}=16$；直接求和 $E(Y)=\\sum_{k=2}^{\\infty}k(k-1)(\\frac78)^{k-2}(\\frac18)^{2}=16$ 亦同。",
      traps: "$p=\\int_3^{+\\infty}2^{-x}\\ln2\\,\\mathrm{d}x=2^{-3}=\\frac18$，别把 $\\int 2^{-x}\\mathrm{d}x$ 的系数弄错；组合数是 $\\binom{k-1}{1}=k-1$（最后一次固定为成功），不是 $\\binom{k}{2}$。",
      hint: "先算单次「成功」概率 $p=\\frac18$，$Y$ 服从第 $2$ 次成功所需试验次数的负二项分布，直接用 $E(Y)=r/p$。",
      src: { file: "参考文件/真题/数学/5、【1987-2025年】考研数学三真题/3、2010-2022考研数学三真题.pdf", page: 32, no: "三(22)", note: "题面取自 crops/m3-1315-book-p32.png 逐字亲读（p29 页眉「2015 年全国硕士研究生招生考试试题」确认卷首，2015 卷 p29–p32）；答案与 2015 答案解析册 p7 对拍（册上 $P\\{Y=k\\}=(k-1)(\\frac78)^{k-2}(\\frac18)^2$、$EY=16$），独立用负二项分布重推一致。" }
    },
    {
      id: "m3-2015-23", origin: "year", year: 2015, no: "三(23)", type: "estimate", star: 3, school: "全国硕士研究生招生考试-数学三 2015 年",
      tags: ["zt04","int23","tp02"],
      stem: "设总体 $X$ 的概率密度为\n$$f(x;\\theta)=\\begin{cases}\\dfrac{1}{1-\\theta},&\\theta\\le x\\le1,\\\\0,&\\text{其他},\\end{cases}$$\n其中 $\\theta$ 为未知参数。$X_1,X_2,\\cdots,X_n$ 为来自该总体的简单随机样本。\n（Ⅰ）求 $\\theta$ 的矩估计量；（Ⅱ）求 $\\theta$ 的最大似然估计量。",
      answer: "（Ⅰ）$\\hat\\theta=2\\bar X-1$；（Ⅱ）$\\hat\\theta=\\min\\{X_1,X_2,\\cdots,X_n\\}$。\n\n（Ⅰ）$X\\sim U[\\theta,1]$，$EX=\\dfrac{1+\\theta}{2}$。令 $EX=\\bar X$，解得 $\\hat\\theta=2\\bar X-1$。\n（Ⅱ）似然函数\n$$L(\\theta)=\\prod_{i=1}^{n}f(x_i;\\theta)=\\begin{cases}\\dfrac{1}{(1-\\theta)^{n}},&\\theta\\le\\min_i x_i\\le x_i\\le1,\\\\0,&\\text{其他}.\\end{cases}$$\n在可行域 $\\theta\\le\\min_i x_i$ 上 $L(\\theta)=\\frac1{(1-\\theta)^{n}}$ 关于 $\\theta$ 单调增加，故 $\\theta$ 取到上限 $\\min\\{x_1,\\cdots,x_n\\}$ 时 $L$ 最大，即 $\\hat\\theta=\\min\\{X_1,\\cdots,X_n\\}$。",
      traps: "最大似然估计不能令 $\\frac{\\mathrm{d}\\ln L}{\\mathrm{d}\\theta}=0$（$\\ln L=-n\\ln(1-\\theta)$ 在可行域内无驻点），必须由单调性在边界 $\\theta=\\min x_i$ 处取最大；矩估计用 $EX=\\frac{1+\\theta}{2}$。",
      hint: "矩估计令 $\\frac{1+\\theta}{2}=\\bar X$；最大似然写出 $L(\\theta)=\\frac{1}{(1-\\theta)^n}$ 在 $\\theta\\le\\min x_i$ 上单调递增，取边界。",
      src: { file: "参考文件/真题/数学/5、【1987-2025年】考研数学三真题/3、2010-2022考研数学三真题.pdf", page: 32, no: "三(23)", note: "题面取自 crops/m3-1315-book-p32.png 逐字亲读（p29 页眉「2015 年全国硕士研究生招生考试试题」确认卷首，2015 卷 p29–p32）；答案与 2015 答案解析册 p7 对拍（册上 $\\hat\\theta=2\\bar X-1$ 与 $\\hat\\theta=\\min\\{X_i\\}$），独立重推一致。" }
    },
    {
      id: "m3-2016-11", origin: "year", year: 2016, no: "二(11)", type: "multivar", star: 3, school: "全国硕士研究生招生考试-数学三 2016 年",
      tags: ["multi05","ext14","multi01"],
      stem: "设函数 $f(u,v)$ 可微，$z=z(x,y)$ 由方程 $(x+1)z-y^{2}=x^{2}f(x-z,y)$ 确定，则 $\\left.\\mathrm{d}z\\right|_{(0,1)}=$______.",
      answer: "填 $-\\mathrm{d}x+2\\mathrm{d}y$。先把 $x=0,\\ y=1$ 代入方程得 $z\\cdot1-1=0$，故 $z(0,1)=1$。\n方程两边分别对 $x,y$ 求偏导（视 $z=z(x,y)$）：\n$$z+(x+1)z_x=2xf(x-z,y)+x^{2}f_1'\\cdot(1-z_x),$$\n$$(x+1)z_y-2y=x^{2}\\left[f_1'\\cdot(-z_y)+f_2'\\right].$$\n代入 $x=0,\\ y=1,\\ z=1$（含 $x^{2}$ 的项全为零）：\n$$1+z_x=0,\\qquad z_y-2=0,$$\n故 $z_x=-1,\\ z_y=2$，\n$$\\left.\\mathrm{d}z\\right|_{(0,1)}=z_x\\mathrm{d}x+z_y\\mathrm{d}y=-\\mathrm{d}x+2\\mathrm{d}y.$$",
      traps: "求偏导时不要漏掉 $z$ 是 $x,y$ 的函数（$(x+1)z$ 对 $x$ 求导产生 $z+(x+1)z_x$）；须先由原方程定出 $z(0,1)=1$ 才能代入；$x=0$ 时含 $x^{2}$ 的复合项自动为零，无需知道 $f$ 的具体形式。",
      hint: "先代 $x=0,y=1$ 求 $z(0,1)=1$，再对方程两边分别求 $x,y$ 偏导并代入该点解出 $z_x,z_y$，最后写 $\\mathrm{d}z=z_x\\mathrm{d}x+z_y\\mathrm{d}y$。",
      src: { file: "参考文件/真题/数学/5、【1987-2025年】考研数学三真题/3、2010-2022考研数学三真题.pdf", page: 26, no: "二(11)", note: "题面取自 crops/m3-1617-book-p26.png（整页）与 crops/m3-1617-book-p26-zoomA.png（局部放大）逐字亲读；p25 页眉「2016 年全国硕士研究生招生考试试题」确认卷首，2016 卷范围 p25–p28。答案与《2016年数学三真题答案解析》p3 对拍（册上填 $-\\mathrm{d}x+2\\mathrm{d}y$），独立重推（先定 $z(0,1)=1$，再对 $x,y$ 求偏导得 $z_x=-1,\\ z_y=2$）一致。" }
    },
    {
      id: "m3-2016-12", origin: "year", year: 2016, no: "二(12)", type: "dblint", star: 3, school: "全国硕士研究生招生考试-数学三 2016 年",
      tags: ["dbi01","ext27","tp08"],
      stem: "设 $D=\\{(x,y)\\mid |x|\\leqslant y\\leqslant 1,\\ -1\\leqslant x\\leqslant 1\\}$，则 $\\displaystyle\\iint_D x^{2}\\mathrm{e}^{-y^{2}}\\mathrm{d}x\\mathrm{d}y=$______.",
      answer: "填 $\\dfrac13-\\dfrac{2}{3\\mathrm{e}}$。$D$ 关于 $y$ 轴对称，被积函数 $x^{2}\\mathrm{e}^{-y^{2}}$ 关于 $x$ 为偶函数，取 $D_1=\\{(x,y)\\mid 0\\leqslant x\\leqslant y,\\ 0\\leqslant y\\leqslant 1\\}$：\n$$\\iint_D x^{2}\\mathrm{e}^{-y^{2}}\\mathrm{d}x\\mathrm{d}y=2\\int_0^{1}\\mathrm{d}y\\int_0^{y}x^{2}\\mathrm{e}^{-y^{2}}\\mathrm{d}x=\\frac23\\int_0^{1}y^{3}\\mathrm{e}^{-y^{2}}\\mathrm{d}y.$$\n令 $t=y^{2}$，则 $\\frac23y^{3}\\mathrm{d}y=\\frac13t\\,\\mathrm{d}t$：\n$$=\\frac13\\int_0^{1}t\\mathrm{e}^{-t}\\mathrm{d}t=\\frac13\\left[-\\mathrm{e}^{-t}(t+1)\\right]_0^{1}=\\frac13-\\frac{2}{3\\mathrm{e}}.$$",
      traps: "先对 $x$ 积分（$x^{2}$ 好积、$\\mathrm{e}^{-y^{2}}$ 关于 $x$ 是常数），不要先对 $y$ 积分（$\\mathrm{e}^{-y^{2}}$ 无初等原函数）；区域由 $|x|\\le y\\le1$ 给出，固定 $y$ 时 $x\\in[-y,y]$，用对称性取 $2\\int_0^1\\mathrm{d}y\\int_0^y$；换元 $t=y^{2}$ 时 $\\frac23y^{3}\\mathrm{d}y=\\frac13t\\,\\mathrm{d}t$。",
      hint: "利用 $D$ 关于 $y$ 轴对称化为 $2\\int_0^1\\mathrm{d}y\\int_0^y x^{2}\\mathrm{e}^{-y^{2}}\\mathrm{d}x$，再令 $t=y^{2}$ 算 $\\int t\\mathrm{e}^{-t}\\mathrm{d}t$。",
      src: { file: "参考文件/真题/数学/5、【1987-2025年】考研数学三真题/3、2010-2022考研数学三真题.pdf", page: 26, no: "二(12)", note: "题面取自 crops/m3-1617-book-p26.png 与 crops/m3-1617-book-p26-zoomA.png 逐字亲读；p25 页眉确认 2016 卷首（卷 p25–p28）。答案与解析册 p3 对拍（册上 $\\frac13-\\frac{2}{3\\mathrm{e}}$），独立重推（对称性化为 $2\\int_0^1\\mathrm{d}y\\int_0^y x^{2}\\mathrm{e}^{-y^{2}}\\mathrm{d}x$，令 $t=y^{2}$ 得 $\\frac13\\int_0^1 t\\mathrm{e}^{-t}\\mathrm{d}t$）一致。" }
    },
    {
      id: "m3-2016-13", origin: "year", year: 2016, no: "二(13)", type: "linalg", star: 3, school: "全国硕士研究生招生考试-数学三 2016 年",
      tags: ["la08","ln03","ln04"],
      stem: "行列式 $\\begin{vmatrix}\\lambda&-1&0&0\\\\0&\\lambda&-1&0\\\\0&0&\\lambda&-1\\\\4&3&2&\\lambda+1\\end{vmatrix}=$______.",
      answer: "填 $\\lambda^{4}+\\lambda^{3}+2\\lambda^{2}+3\\lambda+4$。按第 $4$ 行展开（记 $D$ 为所求行列式，代数余子式符号依次为 $-,+,-,+$）：\n$$D=-4M_{41}+3M_{42}-2M_{43}+(\\lambda+1)M_{44}.$$\n四个余子式都是三角行列式，等于主对角线之积：\n$$M_{41}=\\begin{vmatrix}-1&0&0\\\\\\lambda&-1&0\\\\0&\\lambda&-1\\end{vmatrix}=-1,\\quad M_{42}=\\begin{vmatrix}\\lambda&0&0\\\\0&-1&0\\\\0&\\lambda&-1\\end{vmatrix}=\\lambda,$$\n$$M_{43}=\\begin{vmatrix}\\lambda&-1&0\\\\0&\\lambda&0\\\\0&0&-1\\end{vmatrix}=-\\lambda^{2},\\quad M_{44}=\\begin{vmatrix}\\lambda&-1&0\\\\0&\\lambda&-1\\\\0&0&\\lambda\\end{vmatrix}=\\lambda^{3}.$$\n故\n$$D=4+3\\lambda+2\\lambda^{2}+(\\lambda+1)\\lambda^{3}=\\lambda^{4}+\\lambda^{3}+2\\lambda^{2}+3\\lambda+4.$$",
      traps: "按第 $4$ 行展开时各代数余子式符号依次为 $-,+,-,+$；四个三阶余子式都是三角行列式，等于主对角线之积；别漏乘 $(\\lambda+1)M_{44}$，也别把最后一列的 $-1$ 误当作主对角线元素。",
      hint: "按含常数最多的第 $4$ 行展开，四个三阶余子式都是三角行列式，直接取对角线之积再按符号相加。",
      src: { file: "参考文件/真题/数学/5、【1987-2025年】考研数学三真题/3、2010-2022考研数学三真题.pdf", page: 26, no: "二(13)", note: "题面取自 crops/m3-1617-book-p26.png 与 crops/m3-1617-book-p26-zoomA.png 逐字亲读；p25 页眉确认 2016 卷首（卷 p25–p28）。答案与解析册 p3 对拍（册上按最后一行展开得 $\\lambda^{4}+\\lambda^{3}+2\\lambda^{2}+3\\lambda+4$），独立按第 4 行展开、逐个余子式重推一致。" }
    },
    {
      id: "m3-2016-14", origin: "year", year: 2016, no: "二(14)", type: "estimate", star: 3, school: "全国硕士研究生招生考试-数学三 2016 年",
      tags: ["zt04","tp02","int23"],
      stem: "设袋中有红、白、黑球各 $1$ 个，从中有放回地取球，每次取 $1$ 个，直到三种颜色的球都取到时停止，则取球次数恰好为 $4$ 的概率为______.",
      answer: "填 $\\dfrac{2}{9}$。每次取球有 $3$ 种等可能结果，前 $4$ 次共 $3^{4}=81$ 个等可能序列。「恰好第 $4$ 次集齐三种颜色」要求：前 $3$ 次恰好出现 $2$ 种颜色（且这 $2$ 种都至少出现一次），第 $4$ 次取到尚未出现的第 $3$ 种颜色。\n- 选第 $4$ 次的新颜色（即前 $3$ 次缺的那种）：$\\binom{3}{1}=3$ 种；\n- 前 $3$ 次只用另外 $2$ 种颜色且两种都出现：$2^{3}-2=6$ 种；\n故有利序列数 $3\\times6=18$，\n$$P=\\frac{18}{3^{4}}=\\frac{18}{81}=\\frac{2}{9}.$$",
      traps: "「恰好第 $4$ 次停止」要求前 $3$ 次尚未集齐（恰 $2$ 种颜色）且第 $4$ 次补上缺的那种；前 $3$ 次若只出现 $1$ 种颜色则第 $4$ 次最多 $2$ 种、不会停止，故须减去 $2$ 种全同的情形；有放回取球各颜色等概率 $\\frac13$，用古典概型数序列最稳妥。",
      hint: "数前 $4$ 次等可能序列：先定第 $4$ 次的新颜色，再数前 $3$ 次恰由另外 $2$ 种颜色且两种都出现的序列数 $2^3-2$，除以 $3^{4}$。",
      src: { file: "参考文件/真题/数学/5、【1987-2025年】考研数学三真题/3、2010-2022考研数学三真题.pdf", page: 26, no: "二(14)", note: "题面取自 crops/m3-1617-book-p26.png 与 crops/m3-1617-book-p26-zoomA.png 逐字亲读；p25 页眉确认 2016 卷首（卷 p25–p28）。答案与解析册 p3 对拍（册上 $P=\\frac{\\mathrm{C}_3^{1}\\mathrm{C}_3^{2}\\cdot2}{3^{4}}=\\frac29$）；册上组合式未展开计数依据（跳步），独立重推「前 3 次恰 2 色且都出现、第 4 次补缺色」得 $\\frac{3\\times6}{81}=\\frac29$，与册上结论一致。" }
    },
    {
      id: "m3-2016-15", origin: "year", year: 2016, no: "三(15)", type: "limit", star: 3, school: "全国硕士研究生招生考试-数学三 2016 年",
      tags: ["lim10","zt06","ext02"],
      stem: "求极限 $\\lim\\limits_{x\\to0}(\\cos 2x+2x\\sin x)^{\\frac{1}{x^{4}}}$.",
      answer: "$\\mathrm{e}^{\\frac13}$。这是 $1^{\\infty}$ 型，取对数：\n$$\\lim_{x\\to0}(\\cos2x+2x\\sin x)^{\\frac{1}{x^{4}}}=\\mathrm{e}^{L},\\qquad L=\\lim_{x\\to0}\\frac{\\ln(\\cos2x+2x\\sin x)}{x^{4}}.$$\n用 $\\cos2x=1-2x^{2}+\\frac23x^{4}+o(x^{4})$、$2x\\sin x=2x^{2}-\\frac13x^{4}+o(x^{4})$：\n$$\\cos2x+2x\\sin x=1+\\frac13x^{4}+o(x^{4}),$$\n$$\\ln(\\cos2x+2x\\sin x)\\sim\\frac13x^{4},$$\n故 $L=\\dfrac13$，原极限 $=\\mathrm{e}^{\\frac13}$。",
      traps: "指数是 $\\frac{1}{x^{4}}$ 不是 $\\frac{1}{x^{2}}$（底数趋于 $1$ 的阶是 $x^{4}$）；$\\cos2x$ 与 $2x\\sin x$ 的 $x^{2}$ 项恰好抵消，必须各自展到 $x^{4}$ 项；$\\ln(1+u)\\sim u$ 给出 $\\frac13x^{4}$，故极限为 $\\mathrm{e}^{1/3}$ 而非 $\\mathrm{e}^{0}=1$。",
      hint: "化为 $\\mathrm{e}^{L}$，$L=\\lim\\limits_{x\\to0}\\frac{\\ln(\\cos2x+2x\\sin x)}{x^{4}}$，把 $\\cos2x$、$2x\\sin x$ 展到 $x^{4}$ 后用 $\\ln(1+u)\\sim u$。",
      src: { file: "参考文件/真题/数学/5、【1987-2025年】考研数学三真题/3、2010-2022考研数学三真题.pdf", page: 26, no: "三(15)", note: "题面取自自渲染高分辨率裁片 crops/w3h-2016-p26-q15-hi.png（p26 第(15)题局部，dpi=420）逐字亲读，指数经高分辨率复核为 $\\frac{1}{x^{4}}$（既有低分辨率裁片 crops/m3-1617-book-p26-q15.png 字形易误读为 $x^{2}$）；p25 页眉确认 2016 卷首（卷 p25–p28）。答案与解析册 p3–p4 对拍（册上多次洛必达得 $\\mathrm{e}^{1/3}$），独立用泰勒展开 $\\cos2x+2x\\sin x=1+\\frac13x^{4}+o(x^{4})$ 重推 $\\ln(\\cdots)\\sim\\frac13x^{4}$，一致。" }
    },
    {
      id: "m3-2016-16", origin: "year", year: 2016, no: "三(16)", type: "econ", star: 4, school: "全国硕士研究生招生考试-数学三 2016 年",
      tags: ["ext08","kn12","gx28"],
      stem: "设某商品的最大需求量为 $1\\,200$ 件，该商品的需求函数 $Q=Q(p)$，需求弹性 $\\eta=\\dfrac{p}{120-p}$（$\\eta>0$），$p$ 为单价（万元）。\n（Ⅰ）求需求函数的表达式；\n（Ⅱ）求 $p=100$ 万元时的边际收益，并说明其经济意义。",
      answer: "（Ⅰ）$Q=1200-10p$；（Ⅱ）边际收益为 $80$ 万元，经济意义：销售第 $201$ 件商品所增加的收益约为 $80$ 万元。\n\n（Ⅰ）需求弹性 $\\eta=-\\dfrac{p}{Q}\\dfrac{\\mathrm{d}Q}{\\mathrm{d}p}=\\dfrac{p}{120-p}$，故\n$$\\frac{\\mathrm{d}Q}{Q}=-\\frac{\\mathrm{d}p}{120-p}\\ \\Longrightarrow\\ \\ln Q=\\ln(120-p)+\\ln C,$$\n即 $Q=C(120-p)$。$p=0$ 时需求量最大为 $1200$，得 $120C=1200$，即 $C=10$，故\n$$Q=10(120-p)=1200-10p.$$\n（Ⅱ）由 $p=120-\\dfrac{Q}{10}$，收益\n$$R(Q)=pQ=120Q-\\frac{Q^{2}}{10},\\qquad R'(Q)=120-\\frac{Q}{5}.$$\n$p=100$ 时 $Q=200$，故\n$$R'(200)=120-\\frac{200}{5}=80\\ (\\text{万元}),$$\n即在销量 $200$ 件的基础上再多销售第 $201$ 件商品，总收益约增加 $80$ 万元。",
      traps: "弹性定义 $\\eta=-\\frac{p}{Q}\\frac{\\mathrm{d}Q}{\\mathrm{d}p}$ 带负号，化简后得 $\\frac{\\mathrm{d}Q}{Q}=-\\frac{\\mathrm{d}p}{120-p}$，别漏负号；「最大需求量 $1200$」对应 $p=0$ 时 $Q=1200$，由此定 $C=10$；边际收益是 $R'(Q)$（对 $Q$ 求导）而非 $R'(p)$，需先把 $p$ 表成 $Q$ 的函数。",
      hint: "由 $\\eta=-\\frac{p}{Q}\\frac{\\mathrm{d}Q}{\\mathrm{d}p}=\\frac{p}{120-p}$ 解可分离变量方程并用 $Q(0)=1200$ 定常数；再写 $R=pQ$ 对 $Q$ 求导，代 $p=100\\Rightarrow Q=200$。",
      src: { file: "参考文件/真题/数学/5、【1987-2025年】考研数学三真题/3、2010-2022考研数学三真题.pdf", page: 26, no: "三(16)", note: "题面取自 crops/m3-1617-book-p26.png 与 crops/m3-1617-book-p26-zoomB.png 逐字亲读（弹性为 $\\eta=\\frac{p}{120-p}$）；p25 页眉确认 2016 卷首（卷 p25–p28）。答案与解析册 p4 对拍（册上 $Q=1200-10p$、$R'(200)=80$，经济意义为销售第 201 件收益 80 万元），独立重推（由 $\\eta$ 定义解可分离变量方程 $Q=C(120-p)$，$Q(0)=1200\\Rightarrow C=10$）一致。" }
    },
    {
      id: "m3-2016-17", origin: "year", year: 2016, no: "三(17)", type: "integral", star: 4, school: "全国硕士研究生招生考试-数学三 2016 年",
      tags: ["int23","ext07","int25"],
      stem: "设函数 $f(x)=\\displaystyle\\int_0^{1}|t^{2}-x^{2}|\\,\\mathrm{d}t\\ (x>0)$，求 $f'(x)$，并求 $f(x)$ 的最小值。",
      answer: "$$f'(x)=\\begin{cases}4x^{2}-2x,&0<x\\leqslant1,\\\\2x,&x>1,\\end{cases}\\qquad f_{\\min}=f\\Big(\\frac12\\Big)=\\frac14.$$\n\n当 $0<x\\leqslant1$ 时以 $t=x$ 分段去绝对值：\n$$f(x)=\\int_0^{x}(x^{2}-t^{2})\\mathrm{d}t+\\int_x^{1}(t^{2}-x^{2})\\mathrm{d}t=\\frac43x^{3}-x^{2}+\\frac13;$$\n当 $x>1$ 时 $t^{2}-x^{2}<0$ 恒成立：\n$$f(x)=\\int_0^{1}(x^{2}-t^{2})\\mathrm{d}t=x^{2}-\\frac13.$$\n在 $x=1$ 处左右导数均为 $2$，故 $f'(x)=4x^{2}-2x\\ (0<x\\le1)$、$f'(x)=2x\\ (x>1)$。\n令 $f'(x)=0$ 得唯一驻点 $x=\\dfrac12$（$x>1$ 时 $f'>0$），且 $f''\\big(\\frac12\\big)>0$，故最小值\n$$f\\Big(\\frac12\\Big)=\\frac43\\cdot\\frac18-\\frac14+\\frac13=\\frac14.$$",
      traps: "积分上限是常数 $1$、参数 $x$ 在被积函数里，须按 $0<x\\le1$ 与 $x>1$ 两段去绝对值；$x=1$ 处用左右导数（都为 $2$）确认可导；$x>1$ 时 $f(x)=x^{2}-\\frac13$ 单调增，最小值只可能落在 $(0,1]$ 内的驻点 $x=\\frac12$。",
      hint: "按 $t=x$ 把积分拆两段写出 $f(x)$ 的分段表达式，分别求导再令 $f'(x)=0$ 找最小值点。",
      src: { file: "参考文件/真题/数学/5、【1987-2025年】考研数学三真题/3、2010-2022考研数学三真题.pdf", page: 27, no: "三(17)", note: "题面取自 crops/m3-1617-book-p27.png 与 crops/m3-1617-book-p27-zoomA.png 逐字亲读（积分上限为常数 $1$、被积为 $|t^{2}-x^{2}|$，已放大核对）；p25 页眉确认 2016 卷首（卷 p25–p28）。答案与解析册 p4 对拍（册上 $f'(x)$ 分段与最小值 $f(\\frac12)=\\frac14$），独立分段去绝对值并验 $x=1$ 处左右导数重推一致。" }
    },
    {
      id: "m3-2016-18", origin: "year", year: 2016, no: "三(18)", type: "ode", star: 4, school: "全国硕士研究生招生考试-数学三 2016 年",
      tags: ["ode02","int25","ext09"],
      stem: "设函数 $f(x)$ 连续，且满足 $\\displaystyle\\int_0^{x}f(x-t)\\,\\mathrm{d}t=\\int_0^{x}(x-t)f(t)\\,\\mathrm{d}t+\\mathrm{e}^{-x}-1$，求 $f(x)$.",
      answer: "$f(x)=-\\dfrac12\\big(\\mathrm{e}^{x}+\\mathrm{e}^{-x}\\big)$。\n\n令 $u=x-t$，则 $\\int_0^{x}f(x-t)\\mathrm{d}t=\\int_0^{x}f(u)\\mathrm{d}u$；右端拆开：\n$$\\int_0^{x}f(u)\\mathrm{d}u=x\\int_0^{x}f(t)\\mathrm{d}t-\\int_0^{x}t f(t)\\mathrm{d}t+\\mathrm{e}^{-x}-1.$$\n两边对 $x$ 求导（$x f(x)$ 两项抵消）：\n$$f(x)=\\int_0^{x}f(t)\\mathrm{d}t-\\mathrm{e}^{-x},\\qquad f(0)=-1.$$\n再求导得一阶线性方程\n$$f'(x)-f(x)=\\mathrm{e}^{-x}.$$\n通解 $f(x)=C\\mathrm{e}^{x}-\\dfrac12\\mathrm{e}^{-x}$，由 $f(0)=-1$ 得 $C=-\\dfrac12$，故\n$$f(x)=-\\frac12\\big(\\mathrm{e}^{x}+\\mathrm{e}^{-x}\\big).$$",
      traps: "左端是卷积型 $\\int_0^x f(x-t)\\mathrm{d}t$，先换元 $u=x-t$ 化成 $\\int_0^x f(u)\\mathrm{d}u$ 才能求导；右端 $x\\int_0^xf(t)\\mathrm{d}t-\\int_0^x tf(t)\\mathrm{d}t$ 求导时 $x f(x)$ 两项抵消；由原式取 $x=0$ 得 $f(0)=-1$ 是定常数必需的初值，别漏。",
      hint: "换元化简左端，两边两次求导得到 $f'(x)-f(x)=\\mathrm{e}^{-x}$ 与初值 $f(0)=-1$，解一阶线性方程。",
      src: { file: "参考文件/真题/数学/5、【1987-2025年】考研数学三真题/3、2010-2022考研数学三真题.pdf", page: 27, no: "三(18)", note: "题面取自 crops/m3-1617-book-p27.png 与 crops/m3-1617-book-p27-zoomA.png 逐字亲读（右端为 $\\mathrm{e}^{-x}-1$，已放大核对）；p25 页眉确认 2016 卷首（卷 p25–p28）。答案与解析册 p4 对拍（册上 $f(x)=-\\frac12(\\mathrm{e}^{x}+\\mathrm{e}^{-x})$），独立重推（换元 $u=x-t$、两次求导得 $f'-f=\\mathrm{e}^{-x}$ 与 $f(0)=-1$，解一阶线性方程）一致。" }
    },
    {
      id: "m3-2016-19", origin: "year", year: 2016, no: "三(19)", type: "series", star: 4, school: "全国硕士研究生招生考试-数学三 2016 年",
      tags: ["ext17","ser12","zt07"],
      stem: "求幂级数 $\\displaystyle\\sum_{n=0}^{\\infty}\\frac{x^{2n+2}}{(n+1)(2n+1)}$ 的收敛域及和函数。",
      answer: "收敛域 $[-1,1]$；和函数\n$$S(x)=\\begin{cases}(1+x)\\ln(1+x)+(1-x)\\ln(1-x),&-1<x<1,\\\\2\\ln2,&x=\\pm1.\\end{cases}$$\n\n记 $u_n(x)=\\dfrac{x^{2n+2}}{(n+1)(2n+1)}$，由比值判别法\n$$\\lim_{n\\to\\infty}\\left|\\frac{u_{n+1}(x)}{u_n(x)}\\right|=x^{2},$$\n故 $|x|<1$ 绝对收敛、$|x|>1$ 发散；$x=\\pm1$ 时 $\\sum\\frac{1}{(n+1)(2n+1)}$ 收敛（通项 $\\sim\\frac{1}{2n^{2}}$），故收敛域为 $[-1,1]$。\n\n设 $S(x)=\\sum\\limits_{n=0}^{\\infty}\\dfrac{x^{2n+2}}{(n+1)(2n+1)}$，逐项求导两次：\n$$S'(x)=2\\sum_{n=0}^{\\infty}\\frac{x^{2n+1}}{2n+1},\\qquad S''(x)=2\\sum_{n=0}^{\\infty}x^{2n}=\\frac{2}{1-x^{2}},\\quad |x|<1.$$\n由 $S(0)=S'(0)=0$：\n$$S'(x)=\\int_0^{x}\\frac{2}{1-t^{2}}\\mathrm{d}t=\\ln(1+x)-\\ln(1-x),$$\n$$S(x)=\\int_0^{x}\\big[\\ln(1+t)-\\ln(1-t)\\big]\\mathrm{d}t=(1+x)\\ln(1+x)+(1-x)\\ln(1-x).$$\n由幂级数和函数在收敛域端点连续，$S(\\pm1)=\\lim\\limits_{x\\to\\pm1}S(x)=2\\ln2$。",
      traps: "这是缺项（只含偶次幂、从 $x^{2}$ 起）幂级数，收敛半径由比值法得 $R=1$，端点 $x=\\pm1$ 须单独判断（通项 $\\sim\\frac{1}{2n^{2}}$ 收敛），收敛域含端点；逐项求导后 $S''=\\frac{2}{1-x^{2}}$，积分两次要利用 $S(0)=S'(0)=0$ 定常数；端点值由连续性补为 $2\\ln2$，不能直接代入 $(1-x)\\ln(1-x)$（$0\\cdot\\infty$ 型须取极限）。",
      hint: "用比值法求收敛半径并验端点；设和函数 $S$，逐项求导两次得 $S''=\\frac{2}{1-x^{2}}$，再由 $S(0)=S'(0)=0$ 积分还原并用连续性补端点值。",
      src: { file: "参考文件/真题/数学/5、【1987-2025年】考研数学三真题/3、2010-2022考研数学三真题.pdf", page: 27, no: "三(19)", note: "题面取自 crops/m3-1617-book-p27.png 与 crops/m3-1617-book-p27-zoomB.png 逐字亲读；p25 页眉确认 2016 卷首（卷 p25–p28）。答案与解析册 p4 末–p5 对拍（册上收敛域 $[-1,1]$、和函数 $(1+x)\\ln(1+x)+(1-x)\\ln(1-x)$ 及端点 $2\\ln2$）；册上中间式 $f'(x)\\int_0^{x}f''(t)\\mathrm{d}t$ 为排版连写（实为 $f'(x)=\\int_0^{x}f''(t)\\mathrm{d}t$），独立重推逐项求导两次并积分还原，结论一致。" }
    },
    {
      id: "m3-2016-20", origin: "year", year: 2016, no: "三(20)", type: "linalg", star: 4, school: "全国硕士研究生招生考试-数学三 2016 年",
      tags: ["kn58","zb08","tp09"],
      stem: "设矩阵 $A=\\begin{pmatrix}1&1&1-a\\\\1&0&a\\\\a+1&1&a+1\\end{pmatrix}$，$\\beta=\\begin{pmatrix}0\\\\1\\\\2a-2\\end{pmatrix}$，且方程组 $Ax=\\beta$ 无解。\n（Ⅰ）求 $a$ 的值；\n（Ⅱ）求方程组 $A^{\\mathrm{T}}Ax=A^{\\mathrm{T}}\\beta$ 的通解。",
      answer: "（Ⅰ）$a=0$；（Ⅱ）$x=(1,-2,0)^{\\mathrm{T}}+k(0,-1,1)^{\\mathrm{T}}$（$k$ 为任意常数）。\n\n（Ⅰ）对增广矩阵作初等行变换：\n$$(A\\mid\\beta)=\\begin{pmatrix}1&1&1-a&\\vdots&0\\\\1&0&a&\\vdots&1\\\\a+1&1&a+1&\\vdots&2a-2\\end{pmatrix}\\to\\begin{pmatrix}1&1&1-a&\\vdots&0\\\\0&-1&2a-1&\\vdots&1\\\\0&0&-a^{2}+2a&\\vdots&a-2\\end{pmatrix}.$$\n$Ax=\\beta$ 无解要求 $r(A)=2<r(A\\mid\\beta)=3$，即 $-a^{2}+2a=0$ 且 $a-2\\ne0$，故 $a=0$。\n\n（Ⅱ）$a=0$ 时\n$$A=\\begin{pmatrix}1&1&1\\\\1&0&0\\\\1&1&1\\end{pmatrix},\\quad \\beta=\\begin{pmatrix}0\\\\1\\\\-2\\end{pmatrix},$$\n$$(A^{\\mathrm{T}}A\\mid A^{\\mathrm{T}}\\beta)=\\begin{pmatrix}3&2&2&\\vdots&-1\\\\2&2&2&\\vdots&-2\\\\2&2&2&\\vdots&-2\\end{pmatrix}\\to\\begin{pmatrix}1&0&0&\\vdots&1\\\\0&1&1&\\vdots&-2\\\\0&0&0&\\vdots&0\\end{pmatrix}.$$\n故同解方程组 $x_1=1,\\ x_2+x_3=-2$，令 $x_3=k$ 得通解\n$$x=\\begin{pmatrix}1\\\\-2\\\\0\\end{pmatrix}+k\\begin{pmatrix}0\\\\-1\\\\1\\end{pmatrix},\\quad k\\ \\text{为任意常数}.$$",
      traps: "「$Ax=\\beta$ 无解」等价于 $r(A)<r(A\\mid\\beta)$，即阶梯形最后一行系数全零而右端非零，须同时满足 $-a^{2}+2a=0$ 与 $a-2\\ne0$（排除 $a=2$）；$A^{\\mathrm{T}}Ax=A^{\\mathrm{T}}\\beta$ 恒有解且 $r(A^{\\mathrm{T}}A)=r(A)=2$，故通解含 $1$ 个自由变量；$\\beta$ 第三分量 $2a-2$ 在 $a=0$ 时为 $-2$。",
      hint: "对 $(A\\mid\\beta)$ 行变换，用「无解」定 $a$；再代入 $a$ 算 $(A^{\\mathrm{T}}A\\mid A^{\\mathrm{T}}\\beta)$ 的行最简形，写含一个任意常数的通解。",
      src: { file: "参考文件/真题/数学/5、【1987-2025年】考研数学三真题/3、2010-2022考研数学三真题.pdf", page: 27, no: "三(20)", note: "题面取自 crops/m3-1617-book-p27.png 与 crops/m3-1617-book-p27-zoomB.png 逐字亲读；p25 页眉确认 2016 卷首（卷 p25–p28）。答案与解析册 p5 对拍（册上 $a=0$、通解 $(1,-2,0)^{\\mathrm{T}}+k(0,-1,1)^{\\mathrm{T}}$），独立重推 $(A\\mid\\beta)$ 阶梯形末行 $[-a^{2}+2a\\mid a-2]$ 定 $a=0$，并核验 $A^{\\mathrm{T}}A$ 与 $A^{\\mathrm{T}}\\beta$ 的行最简形，一致。" }
    },
    {
      id: "m3-2016-21", origin: "year", year: 2016, no: "三(21)", type: "eigen", star: 5, school: "全国硕士研究生招生考试-数学三 2016 年",
      tags: ["la04","zb10","ln08"],
      stem: "已知矩阵 $A=\\begin{pmatrix}0&-1&1\\\\2&-3&0\\\\0&0&0\\end{pmatrix}$。\n（Ⅰ）求 $A^{99}$；\n（Ⅱ）设 $3$ 阶矩阵 $B=(\\alpha_1,\\alpha_2,\\alpha_3)$ 满足 $B^{2}=BA$，记 $B^{100}=(\\beta_1,\\beta_2,\\beta_3)$，将 $\\beta_1,\\beta_2,\\beta_3$ 分别表示为 $\\alpha_1,\\alpha_2,\\alpha_3$ 的线性组合。",
      answer: "（Ⅰ）\n$$A^{99}=\\begin{pmatrix}2^{99}-2&1-2^{99}&2-2^{98}\\\\2^{100}-2&1-2^{100}&2-2^{99}\\\\0&0&0\\end{pmatrix}.$$\n（Ⅱ）\n$$\\beta_1=(2^{99}-2)\\alpha_1+(2^{100}-2)\\alpha_2,\\quad \\beta_2=(1-2^{99})\\alpha_1+(1-2^{100})\\alpha_2,$$\n$$\\beta_3=(2-2^{98})\\alpha_1+(2-2^{99})\\alpha_2.$$\n\n（Ⅰ）$|\\lambda E-A|=\\lambda(\\lambda+1)(\\lambda+2)$，特征值 $-1,-2,0$，对应特征向量\n$$\\xi_1=(1,1,0)^{\\mathrm{T}},\\quad \\xi_2=(1,2,0)^{\\mathrm{T}},\\quad \\xi_3=(3,2,2)^{\\mathrm{T}}.$$\n令 $P=(\\xi_1,\\xi_2,\\xi_3)=\\begin{pmatrix}1&1&3\\\\1&2&2\\\\0&0&2\\end{pmatrix}$，则 $P^{-1}AP=\\mathrm{diag}(-1,-2,0)$，且\n$$P^{-1}=\\begin{pmatrix}2&-1&-2\\\\-1&1&\\frac12\\\\0&0&\\frac12\\end{pmatrix}.$$\n故\n$$A^{99}=P\\begin{pmatrix}-1&0&0\\\\0&-2^{99}&0\\\\0&0&0\\end{pmatrix}P^{-1}=\\begin{pmatrix}2^{99}-2&1-2^{99}&2-2^{98}\\\\2^{100}-2&1-2^{100}&2-2^{99}\\\\0&0&0\\end{pmatrix}.$$\n（Ⅱ）由 $B^{2}=BA$ 归纳得 $B^{m}=B^{m-1}A$，从而\n$$B^{100}=B^{98}B^{2}=B^{99}A=B^{97}B^{2}A=B^{98}A^{2}=\\cdots=BA^{99},$$\n即\n$$(\\beta_1,\\beta_2,\\beta_3)=(\\alpha_1,\\alpha_2,\\alpha_3)A^{99},$$\n按列读出即得上述三个线性组合（$\\alpha_3$ 的系数均为 $0$）。",
      traps: "$A$ 有特征值 $0$，$P^{-1}AP=\\mathrm{diag}(-1,-2,0)$ 的列次序要与 $P$ 一致；$(-2)^{99}=-2^{99}$ 不是 $2^{99}$；由 $B^{2}=BA$ 得 $B^{m}=B^{m-1}A$ 需归纳使用（$B^{100}=BA^{99}$），不可写成 $A^{99}B$（矩阵乘法不交换）；$(\\beta_1,\\beta_2,\\beta_3)=(\\alpha_1,\\alpha_2,\\alpha_3)A^{99}$ 是按列读系数，别取成转置。",
      hint: "（Ⅰ）用相似对角化 $A^{99}=P\\Lambda^{99}P^{-1}$；（Ⅱ）由 $B^{2}=BA$ 归纳出 $B^{100}=BA^{99}$，再用 $(\\beta_1,\\beta_2,\\beta_3)=(\\alpha_1,\\alpha_2,\\alpha_3)A^{99}$ 按列写出线性组合。",
      src: { file: "参考文件/真题/数学/5、【1987-2025年】考研数学三真题/3、2010-2022考研数学三真题.pdf", page: 28, no: "三(21)", note: "题面取自 crops/m3-1617-book-p28.png 与 crops/m3-1617-book-p28-zoomA.png 逐字亲读；p25 页眉确认 2016 卷首（卷 p25–p28）。答案与解析册 p5–p6 对拍（册上 $A^{99}$ 三行各元素及 $\\beta_1,\\beta_2,\\beta_3$ 的 $2$ 的指数 98/99/100 经 crops/m3-1617-ans2016-p6-A99.png 放大核对）；册上 $B^{100}=B^{98}B^{2}=\\cdots=BA^{99}$ 为归纳跳步，独立重推 $B^{m}=B^{m-1}A$ 并核验 $P^{-1}AP=\\mathrm{diag}(-1,-2,0)$ 与 $P\\Lambda^{99}P^{-1}$ 逐元素相乘，结论一致。" }
    },
    {
      id: "m3-2016-22", origin: "year", year: 2016, no: "三(22)", type: "estimate", star: 5, school: "全国硕士研究生招生考试-数学三 2016 年",
      tags: ["zt04","tp02","int23"],
      stem: "设二维随机变量 $(X,Y)$ 在区域 $D=\\{(x,y)\\mid 0<x<1,\\ x^{2}<y<\\sqrt{x}\\}$ 上服从均匀分布，令\n$$U=\\begin{cases}1,&X\\leqslant Y,\\\\0,&X>Y.\\end{cases}$$\n（Ⅰ）写出 $(X,Y)$ 的概率密度；\n（Ⅱ）问 $U$ 与 $X$ 是否相互独立？并说明理由；\n（Ⅲ）求 $Z=U+X$ 的分布函数 $F(z)$。",
      answer: "（Ⅰ）$S_D=\\int_0^{1}(\\sqrt{x}-x^{2})\\mathrm{d}x=\\frac13$，故\n$$f(x,y)=\\begin{cases}3,&(x,y)\\in D,\\\\0,&\\text{其他}.\\end{cases}$$\n（Ⅱ）不相互独立。取 $0<t<1$：\n$$P\\{U\\leqslant0,X\\leqslant t\\}=P\\{X>Y,X\\leqslant t\\}=\\int_0^{t}\\mathrm{d}x\\int_{x^{2}}^{x}3\\,\\mathrm{d}y=\\frac32t^{2}-t^{3},$$\n$$P\\{U\\leqslant0\\}=P\\{X>Y\\}=\\frac12,\\qquad P\\{X\\leqslant t\\}=\\int_0^{t}\\mathrm{d}x\\int_{x^{2}}^{\\sqrt{x}}3\\,\\mathrm{d}y=2t^{\\frac32}-t^{3}.$$\n因 $\\frac32t^{2}-t^{3}\\ne\\frac12\\big(2t^{\\frac32}-t^{3}\\big)$，故 $U$ 与 $X$ 不独立。\n（Ⅲ）\n$$F(z)=\\begin{cases}0,&z<0,\\\\\\dfrac32z^{2}-z^{3},&0\\leqslant z<1,\\\\\\dfrac12+2(z-1)^{\\frac32}-\\dfrac32(z-1)^{2},&1\\leqslant z<2,\\\\1,&z\\geqslant2.\\end{cases}$$\n推导：$Z=U+X$，$U\\in\\{0,1\\}$、$0<X<1$。当 $0\\le z<1$ 时 $U=1$ 不可能（$Z\\ge1$），故\n$$F(z)=P\\{U=0,X\\le z\\}=\\frac32z^{2}-z^{3};$$\n当 $1\\le z<2$ 时\n$$F(z)=P\\{U=0\\}+P\\{U=1,X\\le z-1\\}=\\frac12+\\int_0^{z-1}\\mathrm{d}x\\int_{x}^{\\sqrt{x}}3\\,\\mathrm{d}y=\\frac12+2(z-1)^{\\frac32}-\\frac32(z-1)^{2}.$$",
      traps: "区域 $D$ 面积 $=\\int_0^1(\\sqrt{x}-x^{2})\\mathrm{d}x=\\frac13$，故均匀分布密度为 $3$ 而非 $\\frac13$；$U$ 离散、$X$ 连续，判独立须验证 $P\\{U\\le0,X\\le t\\}=P\\{U\\le0\\}P\\{X\\le t\\}$；求 $F(z)$ 要按 $z<0,\\ 0\\le z<1,\\ 1\\le z<2,\\ z\\ge2$ 四段，$1\\le z<2$ 时 $U=0$ 部分已占概率 $\\frac12$、$U=1$ 部分积分上限是 $z-1$；$x\\in(0,1)$ 时 $x<\\sqrt{x}$。",
      hint: "（Ⅰ）先算面积定密度；（Ⅱ）用定义验证某个 $0<t<1$ 的联合概率是否等于边缘乘积；（Ⅲ）按 $U=0,1$ 分解 $P\\{U+X\\le z\\}$，分区间积分。",
      src: { file: "参考文件/真题/数学/5、【1987-2025年】考研数学三真题/3、2010-2022考研数学三真题.pdf", page: 28, no: "三(22)", note: "题面取自 crops/m3-1617-book-p28.png 与 crops/m3-1617-book-p28-zoomB.png 逐字亲读；p25 页眉确认 2016 卷首（卷 p25–p28）。答案与解析册 p6–p7 对拍（册上密度 $3$、$U$ 与 $X$ 不独立、$F(z)$ 四段；$1\\le z<2$ 段末项指数经 crops/m3-1617-ans2016-p7-Fz.png 放大核对为 $(z-1)^{2}$ 而非 $(z-1)^{3}$），独立重推区域面积、边缘概率与四段分布函数，一致。" }
    },
    {
      id: "m3-2016-23", origin: "year", year: 2016, no: "三(23)", type: "estimate", star: 4, school: "全国硕士研究生招生考试-数学三 2016 年",
      tags: ["zt04","tp02","int23"],
      stem: "设总体 $X$ 的概率密度为\n$$f(x;\\theta)=\\begin{cases}\\dfrac{3x^{2}}{\\theta^{3}},&0<x<\\theta,\\\\0,&\\text{其他},\\end{cases}$$\n其中 $\\theta\\in(0,+\\infty)$ 为未知参数，$X_1,X_2,X_3$ 为来自总体 $X$ 的简单随机样本，令 $T=\\max\\{X_1,X_2,X_3\\}$。\n（Ⅰ）求 $T$ 的概率密度；\n（Ⅱ）确定 $a$，使得 $E(aT)=\\theta$。",
      answer: "（Ⅰ）$f_T(z)=\\begin{cases}\\dfrac{9z^{8}}{\\theta^{9}},&0<z<\\theta,\\\\0,&\\text{其他}.\\end{cases}$；（Ⅱ）$a=\\dfrac{10}{9}$。\n\n（Ⅰ）总体分布函数\n$$F(x)=\\begin{cases}0,&x<0,\\\\\\dfrac{x^{3}}{\\theta^{3}},&0\\le x<\\theta,\\\\1,&x\\ge\\theta.\\end{cases}$$\n$T=\\max\\{X_1,X_2,X_3\\}$，故\n$$F_T(z)=[F(z)]^{3}=\\begin{cases}0,&z<0,\\\\\\dfrac{z^{9}}{\\theta^{9}},&0\\le z<\\theta,\\\\1,&z\\ge\\theta,\\end{cases}$$\n求导得\n$$f_T(z)=F_T'(z)=\\begin{cases}\\dfrac{9z^{8}}{\\theta^{9}},&0<z<\\theta,\\\\0,&\\text{其他}.\\end{cases}$$\n（Ⅱ）\n$$E(T)=\\int_0^{\\theta}z\\cdot\\frac{9z^{8}}{\\theta^{9}}\\mathrm{d}z=\\frac{9}{\\theta^{9}}\\cdot\\frac{\\theta^{10}}{10}=\\frac{9}{10}\\theta,$$\n故 $E(aT)=aE(T)=\\dfrac{9a}{10}\\theta$。令 $\\dfrac{9a}{10}\\theta=\\theta$ 得 $a=\\dfrac{10}{9}$。",
      traps: "$T=\\max\\{X_1,X_2,X_3\\}$ 的分布函数是 $[F(z)]^{3}$，不是 $1-[1-F(z)]^{3}$（那是最小值的）；密度 $f_T(z)=\\frac{9z^{8}}{\\theta^{9}}$ 只在 $(0,\\theta)$ 上非零，积分限取 $0$ 到 $\\theta$；$E(T)=\\frac{9}{10}\\theta<\\theta$，故须乘 $a=\\frac{10}{9}$ 才使 $E(aT)=\\theta$。",
      hint: "先求总体 $F(x)$，用 $F_T=[F]^3$ 再求导得 $f_T$，最后算 $E(T)=\\int_0^\\theta zf_T(z)\\mathrm{d}z$ 解 $aE(T)=\\theta$。",
      src: { file: "参考文件/真题/数学/5、【1987-2025年】考研数学三真题/3、2010-2022考研数学三真题.pdf", page: 28, no: "三(23)", note: "题面取自 crops/m3-1617-book-p28.png 与 crops/m3-1617-book-p28-zoomC.png 逐字亲读；p25 页眉确认 2016 卷首（卷 p25–p28）。答案与解析册 p7 对拍（册上 $f_T(z)=\\frac{9z^{8}}{\\theta^{9}}$、$E(T)=\\frac{9}{10}\\theta$、$a=\\frac{10}{9}$），独立重推 $F_T=[F]^{3}$ 与 $E(T)=\\int_0^{\\theta}zf_T(z)\\mathrm{d}z$，一致。" }
    },
    {
      id: "m3-2017-10", origin: "year", year: 2017, no: "二(10)", type: "ode", star: 3, school: "全国硕士研究生招生考试-数学三 2017 年",
      tags: ["ode04","ext19","tp07"],
      stem: "差分方程 $y_{t+1}-2y_t=2^{t}$ 的通解为 $y_t=$______.",
      answer: "填 $y_t=C2^{t}+t2^{t-1}$（$C$ 为任意常数）。齐次方程 $y_{t+1}-2y_t=0$ 的特征根为 $\\lambda=2$，齐次通解 $Y_t=C2^{t}$。\n设特解 $y_t^{*}=kt2^{t}$（右端 $2^{t}$ 与特征根重合，须乘 $t$），代入方程得\n$$k(t+1)2^{t+1}-2kt2^{t}=2k2^{t}=2^{t},$$\n故 $k=\\dfrac12$，$y_t^{*}=\\dfrac12 t2^{t}=t2^{t-1}$。由差分方程解的结构，通解为\n$$y_t=C2^{t}+t2^{t-1}.$$",
      traps: "非齐次项 $2^{t}$ 与齐次解 $C2^{t}$ 同底，特解须设为 $kt2^{t}$（乘 $t$），直接设 $k2^{t}$ 代入恒为 $0$；册上特解写 $t2^{t-1}$，与 $\\dfrac12 t2^{t}$ 等价。",
      hint: "先解齐次方程得 $C2^{t}$，再因右端与特征根 $\\lambda=2$ 重合设特解 $kt2^{t}$，最后由解的结构相加。",
      src: { file: "参考文件/真题/数学/5、【1987-2025年】考研数学三真题/3、2010-2022考研数学三真题.pdf", page: 22, no: "二(10)", note: "题面：合并册 p22 整页与同页放大裁片逐字亲读（m3-1617-book-p22*.png）；2017 卷首页 p21、卷范围 p21–p24 已亲读页眉确认（m3-1617-hdr-A.png、hdr-B.png、header-overview.png）。答案与《2017年数学三真题答案解析》p3 对拍，册上填 $A2^{t}+t2^{t-1}$（$A$ 为任意常数），并独立重推齐次解 $C2^{t}$ 与特解 $k=\\dfrac12$ 得 $t2^{t-1}$，一致。" }
    },
    {
      id: "m3-2017-11", origin: "year", year: 2017, no: "二(11)", type: "econ", star: 3, school: "全国硕士研究生招生考试-数学三 2017 年",
      tags: ["ext08","kn10","gx28"],
      stem: "设生产某产品的平均成本为 $\\overline{C}(Q)=1+\\mathrm{e}^{-Q}$，其中产量为 $Q$，则边际成本为______.",
      answer: "填 $1+(1-Q)\\mathrm{e}^{-Q}$。总成本为 $C(Q)=Q\\,\\overline{C}(Q)=Q+Q\\mathrm{e}^{-Q}$，边际成本是总成本对产量的导数\n$$C'(Q)=1+\\mathrm{e}^{-Q}-Q\\mathrm{e}^{-Q}=1+(1-Q)\\mathrm{e}^{-Q}.$$",
      traps: "边际成本是总成本 $C(Q)=Q\\overline{C}(Q)$ 的导数，不是平均成本 $\\overline{C}(Q)$ 的导数；对 $Q\\mathrm{e}^{-Q}$ 求导要用乘积法则，别漏 $-Q\\mathrm{e}^{-Q}$ 这一项。",
      hint: "先由平均成本乘产量还原总成本 $C(Q)=Q+Q\\mathrm{e}^{-Q}$，再对 $Q$ 求导得边际成本。",
      src: { file: "参考文件/真题/数学/5、【1987-2025年】考研数学三真题/3、2010-2022考研数学三真题.pdf", page: 22, no: "二(11)", note: "题面：合并册 p22 整页与同页放大裁片逐字亲读（m3-1617-book-p22*.png）；2017 卷首页 p21、卷范围 p21–p24 已亲读页眉确认（m3-1617-hdr-A.png、hdr-B.png、header-overview.png）。答案与《2017年数学三真题答案解析》p3 对拍，册上填 $1+(1-Q)\\mathrm{e}^{-Q}$，并独立重推 $C(Q)=Q+Q\\mathrm{e}^{-Q}$ 的导数，一致。" }
    },
    {
      id: "m3-2017-12", origin: "year", year: 2017, no: "二(12)", type: "multivar", star: 3, school: "全国硕士研究生招生考试-数学三 2017 年",
      tags: ["multi01","zb34"],
      stem: "设函数 $f(x,y)$ 具有一阶连续偏导数，且 $\\mathrm{d}f(x,y)=y\\mathrm{e}^{y}\\mathrm{d}x+x(1+y)\\mathrm{e}^{y}\\mathrm{d}y$，$f(0,0)=0$，则 $f(x,y)=$______.",
      answer: "填 $xy\\mathrm{e}^{y}$。由全微分读出 $f_x=y\\mathrm{e}^{y}$，$f_y=x(1+y)\\mathrm{e}^{y}$。先对 $x$ 偏积分（把 $y$ 看作常数）\n$$f(x,y)=\\int y\\mathrm{e}^{y}\\,\\mathrm{d}x=xy\\mathrm{e}^{y}+C(y).$$\n再对 $y$ 求偏导并与已知的 $f_y$ 比较\n$$f_y=x(1+y)\\mathrm{e}^{y}+C'(y)=x(1+y)\\mathrm{e}^{y}\\ \\Longrightarrow\\ C'(y)=0,$$\n故 $C(y)$ 为常数；由 $f(0,0)=0$ 得 $C=0$，所以 $f(x,y)=xy\\mathrm{e}^{y}$。",
      traps: "$\\mathrm{d}f$ 中 $\\mathrm{d}x$ 的系数是 $f_x$、$\\mathrm{d}y$ 的系数是 $f_y$，别弄反；对 $x$ 积分时「积分常数」是 $y$ 的函数 $C(y)$，必须用 $f_y$ 与 $f(0,0)=0$ 定出它，不能直接当常数 $0$。",
      hint: "由全微分读出两个偏导数，先对 $x$ 偏积分得 $f=xy\\mathrm{e}^{y}+C(y)$，再用 $f_y$ 与 $f(0,0)=0$ 定 $C(y)$。",
      src: { file: "参考文件/真题/数学/5、【1987-2025年】考研数学三真题/3、2010-2022考研数学三真题.pdf", page: 22, no: "二(12)", note: "题面：合并册 p22 整页与同页放大裁片逐字亲读（m3-1617-book-p22*.png）；2017 卷首页 p21、卷范围 p21–p24 已亲读页眉确认（m3-1617-hdr-A.png、hdr-B.png、header-overview.png）。答案与《2017年数学三真题答案解析》p3 对拍，册上填 $xy\\mathrm{e}^{y}$，并独立重推偏积分与 $C'(y)=0$，一致。" }
    },
    {
      id: "m3-2017-13", origin: "year", year: 2017, no: "二(13)", type: "linalg", star: 3, school: "全国硕士研究生招生考试-数学三 2017 年",
      tags: ["kn37","ln08","zb06"],
      stem: "设矩阵 $A=\\begin{pmatrix}1&0&1\\\\1&1&2\\\\0&1&1\\end{pmatrix}$，$\\alpha_1,\\alpha_2,\\alpha_3$ 为线性无关的 3 维列向量组，则向量组 $A\\alpha_1,A\\alpha_2,A\\alpha_3$ 的秩为______.",
      answer: "填 $2$。记 $P=(\\alpha_1,\\alpha_2,\\alpha_3)$，则 $(A\\alpha_1,A\\alpha_2,A\\alpha_3)=AP$。因 $\\alpha_1,\\alpha_2,\\alpha_3$ 线性无关，$P$ 可逆，右乘可逆矩阵不改变秩，故\n$$r(A\\alpha_1,A\\alpha_2,A\\alpha_3)=r(AP)=r(A).$$\n矩阵 $A$ 的第 3 列恰为前两列之和（$(1,2,1)^{\\mathrm{T}}=(1,1,0)^{\\mathrm{T}}+(0,1,1)^{\\mathrm{T}}$），故 $|A|=0$；又左上二阶子式 $\\begin{vmatrix}1&0\\\\1&1\\end{vmatrix}=1\\ne0$，故 $r(A)=2$，所求秩为 $2$。",
      traps: "$\\alpha_1,\\alpha_2,\\alpha_3$ 线性无关保证 $(\\alpha_1,\\alpha_2,\\alpha_3)$ 可逆，右乘可逆矩阵不改变秩，故秩只由 $A$ 决定；$A$ 第 3 列是前两列之和使 $\\det A=0$，但 $A\\ne O$，秩为 $2$ 不是 $1$。",
      hint: "把三个列向量拼成可逆矩阵 $P$，向量组即为 $AP$，秩等于 $r(A)$，再算 $A$ 的秩。",
      src: { file: "参考文件/真题/数学/5、【1987-2025年】考研数学三真题/3、2010-2022考研数学三真题.pdf", page: 22, no: "二(13)", note: "题面：合并册 p22 整页与同页放大裁片逐字亲读（m3-1617-book-p22*.png）；2017 卷首页 p21、卷范围 p21–p24 已亲读页眉确认（m3-1617-hdr-A.png、hdr-B.png、header-overview.png）。答案与《2017年数学三真题答案解析》p3 对拍，册上填 $2$；册上「易知 $r(A)=2$」为跳步／重推 $\\det A=0$（第 3 列 = 第 1 列 + 第 2 列）且左上二阶子式非零故 $r(A)=2$／原因：册上未给出秩的具体计算过程；结论一致。" }
    },
    {
      id: "m3-2017-14", origin: "year", year: 2017, no: "二(14)", type: "estimate", star: 3, school: "全国硕士研究生招生考试-数学三 2017 年",
      tags: ["zt04","tp02"],
      stem: "设随机变量 $X$ 的概率分布为 $P\\{X=-2\\}=\\dfrac{1}{2},P\\{X=1\\}=a,P\\{X=3\\}=b$，若 $E(X)=0$，则 $D(X)=$______.",
      answer: "填 $\\dfrac{9}{2}$。由概率归一性 $\\dfrac12+a+b=1$，又\n$$E(X)=-2\\cdot\\frac12+1\\cdot a+3\\cdot b=-1+a+3b=0,$$\n联立解得 $a=b=\\dfrac14$。于是\n$$E(X^{2})=(-2)^{2}\\cdot\\frac12+1^{2}\\cdot\\frac14+3^{2}\\cdot\\frac14=2+\\frac14+\\frac94=\\frac92,$$\n$$D(X)=E(X^{2})-[E(X)]^{2}=\\frac92-0=\\frac92.$$",
      traps: "先用 $\\sum p_i=1$ 与 $E(X)=0$ 两个方程解出 $a,b$（都得 $\\dfrac14$）；方差用 $D(X)=E(X^2)-[E(X)]^2$，本题因 $E(X)=0$ 恰等于 $E(X^2)$，但一般情形不能省去减去均值平方。",
      hint: "用分布律之和为 1 与期望为 0 定出 $a,b$，再算 $E(X^2)$ 并代入方差公式。",
      src: { file: "参考文件/真题/数学/5、【1987-2025年】考研数学三真题/3、2010-2022考研数学三真题.pdf", page: 22, no: "二(14)", note: "题面：合并册 p22 整页与同页放大裁片逐字亲读（m3-1617-book-p22*.png）；2017 卷首页 p21、卷范围 p21–p24 已亲读页眉确认（m3-1617-hdr-A.png、hdr-B.png、header-overview.png）。答案与《2017年数学三真题答案解析》p3–p4 对拍，册上填 $\\dfrac92$，并独立重推 $a=b=\\dfrac14$ 与 $E(X^{2})=\\dfrac92$，一致。" }
    },
    {
      id: "m3-2017-15", origin: "year", year: 2017, no: "三(15)", type: "limit", star: 4, school: "全国硕士研究生招生考试-数学三 2017 年",
      tags: ["int25","ext09","tp01"],
      stem: "求 $\\lim\\limits_{x\\to0^{+}}\\dfrac{\\displaystyle\\int_0^{x}\\sqrt{x-t}\\,\\mathrm{e}^{t}\\,\\mathrm{d}t}{\\sqrt{x^{3}}}$.",
      answer: "$\\dfrac{2}{3}$。被积函数含上限 $x$，先换元：令 $u=x-t$，则 $t=x-u$、$\\mathrm{d}t=-\\mathrm{d}u$，\n$$\\int_0^{x}\\sqrt{x-t}\\,\\mathrm{e}^{t}\\,\\mathrm{d}t=\\mathrm{e}^{x}\\int_0^{x}\\sqrt{u}\\,\\mathrm{e}^{-u}\\,\\mathrm{d}u.$$\n于是（$\\sqrt{x^{3}}=x^{3/2}$，$\\mathrm{e}^{x}\\to1$）\n$$\\lim_{x\\to0^{+}}\\frac{\\mathrm{e}^{x}\\int_0^{x}\\sqrt{u}\\mathrm{e}^{-u}\\mathrm{d}u}{x^{3/2}}=\\lim_{x\\to0^{+}}\\frac{\\int_0^{x}\\sqrt{u}\\mathrm{e}^{-u}\\mathrm{d}u}{x^{3/2}}.$$\n这是 $\\dfrac{0}{0}$ 型，用洛必达法则（变限积分求导）\n$$=\\lim_{x\\to0^{+}}\\frac{\\sqrt{x}\\,\\mathrm{e}^{-x}}{\\frac32\\sqrt{x}}=\\frac{2}{3}.$$",
      traps: "分子 $\\int_0^x\\sqrt{x-t}\\,\\mathrm{e}^{t}\\mathrm{d}t$ 的被积函数含 $x$，不能直接用变限积分求导公式，必须先换元 $u=x-t$ 把 $x$ 提出；$\\sqrt{x^3}=x^{3/2}$，洛必达后分母导数是 $\\dfrac32\\sqrt{x}$，别把分子的 $\\mathrm{e}^{-u}$ 漏掉。",
      hint: "换元 $u=x-t$ 化为 $\\mathrm{e}^{x}\\int_0^x\\sqrt{u}\\mathrm{e}^{-u}\\mathrm{d}u$，再用洛必达法则（或等价无穷小 $\\int_0^x\\sqrt{u}\\mathrm{e}^{-u}\\mathrm{d}u\\sim\\dfrac23x^{3/2}$）。",
      src: { file: "参考文件/真题/数学/5、【1987-2025年】考研数学三真题/3、2010-2022考研数学三真题.pdf", page: 22, no: "三(15)", note: "题面：合并册 p22 整页与同页放大裁片逐字亲读（m3-1617-book-p22*.png）；2017 卷首页 p21、卷范围 p21–p24 已亲读页眉确认（m3-1617-hdr-A.png、hdr-B.png、header-overview.png）。答案与《2017年数学三真题答案解析》p4 对拍，册上得 $\\dfrac23$，并独立重推换元及洛必达 $\\dfrac{\\sqrt{x}\\mathrm{e}^{-x}}{3\\sqrt{x}/2}\\to\\dfrac23$，一致。" }
    },
    {
      id: "m3-2017-16", origin: "year", year: 2017, no: "三(16)", type: "dblint", star: 4, school: "全国硕士研究生招生考试-数学三 2017 年",
      tags: ["dbi01","tp08","int23"],
      stem: "计算积分 $\\iint\\limits_{D}\\dfrac{y^{3}}{(1+x^{2}+y^{4})^{2}}\\,\\mathrm{d}x\\mathrm{d}y$，其中 $D$ 是第一象限中以曲线 $y=\\sqrt{x}$ 与 $x$ 轴为边界的无界区域.",
      answer: "$\\dfrac{2-\\sqrt2}{16}\\pi$。$D=\\{(x,y)\\mid x\\ge0,\\ 0\\le y\\le\\sqrt{x}\\}$（即 $y\\ge0,\\ x\\ge y^{2}$）。先对 $y$ 积分，令 $u=y^{4}$、$\\mathrm{d}u=4y^{3}\\mathrm{d}y$：\n$$\\int_0^{\\sqrt{x}}\\frac{y^{3}}{(1+x^{2}+y^{4})^{2}}\\mathrm{d}y=\\frac14\\int_0^{x^{2}}\\frac{\\mathrm{d}u}{(1+x^{2}+u)^{2}}=\\frac14\\left(\\frac{1}{1+x^{2}}-\\frac{1}{1+2x^{2}}\\right).$$\n再对 $x$ 积分\n$$\\iint_D=\\frac14\\int_0^{+\\infty}\\left(\\frac{1}{1+x^{2}}-\\frac{1}{1+2x^{2}}\\right)\\mathrm{d}x=\\frac14\\left(\\frac{\\pi}{2}-\\frac{\\pi}{2\\sqrt2}\\right)=\\frac{2-\\sqrt2}{16}\\pi.$$",
      traps: "$D$ 是无界区域，$y=\\sqrt{x}\\Leftrightarrow x=y^{2}$，按先 $y$ 后 $x$ 写成 $0\\le y\\le\\sqrt{x},\\ x\\ge0$；对 $y$ 积分用 $u=y^{4}$ 把 $y^{3}\\mathrm{d}y$ 凑成 $\\dfrac14\\mathrm{d}u$，上限 $(\\sqrt{x})^{4}=x^{2}$ 别代错；$\\int_0^\\infty\\dfrac{\\mathrm{d}x}{1+2x^{2}}=\\dfrac{\\pi}{2\\sqrt2}$ 有系数 $\\dfrac{1}{\\sqrt2}$。",
      hint: "把 $D$ 写成 $0\\le y\\le\\sqrt{x}$ 的累次积分，用 $u=y^{4}$ 先算内层，再对 $x$ 用 $\\arctan$ 求两个反常积分。",
      src: { file: "参考文件/真题/数学/5、【1987-2025年】考研数学三真题/3、2010-2022考研数学三真题.pdf", page: 22, no: "三(16)", note: "题面：合并册 p22 整页与同页放大裁片逐字亲读（m3-1617-book-p22*.png）；2017 卷首页 p21、卷范围 p21–p24 已亲读页眉确认（m3-1617-hdr-A.png、hdr-B.png、header-overview.png）。答案与《2017年数学三真题答案解析》p4 对拍，册上 $\\dfrac{2-\\sqrt2}{16}\\pi$，并独立重推内层 $\\dfrac14\\left(\\dfrac{1}{1+x^2}-\\dfrac{1}{1+2x^2}\\right)$ 与 $\\int_0^\\infty\\dfrac{\\mathrm{d}x}{1+2x^2}=\\dfrac{\\pi}{2\\sqrt2}$，一致。" }
    },
    {
      id: "m3-2017-17", origin: "year", year: 2017, no: "三(17)", type: "limit", star: 4, school: "全国硕士研究生招生考试-数学三 2017 年",
      tags: ["zb01","zt01","int24"],
      stem: "求 $\\lim\\limits_{n\\to\\infty}\\sum\\limits_{k=1}^{n}\\dfrac{k}{n^{2}}\\ln\\left(1+\\dfrac{k}{n}\\right)$.",
      answer: "$\\dfrac14$。把和式凑成定积分定义的黎曼和\n$$\\sum_{k=1}^{n}\\frac{k}{n^{2}}\\ln\\left(1+\\frac{k}{n}\\right)=\\frac1n\\sum_{k=1}^{n}\\frac{k}{n}\\ln\\left(1+\\frac{k}{n}\\right)\\xrightarrow[n\\to\\infty]{}\\int_0^{1}x\\ln(1+x)\\,\\mathrm{d}x.$$\n分部积分\n$$\\int_0^{1}x\\ln(1+x)\\mathrm{d}x=\\left.\\frac{x^{2}}{2}\\ln(1+x)\\right|_0^1-\\frac12\\int_0^{1}\\frac{x^{2}}{1+x}\\mathrm{d}x,$$\n而 $\\dfrac{x^{2}}{1+x}=x-1+\\dfrac{1}{1+x}$，故 $\\int_0^1\\dfrac{x^2}{1+x}\\mathrm{d}x=\\dfrac12-1+\\ln2=\\ln2-\\dfrac12$，代入得\n$$\\frac12\\ln2-\\frac12\\left(\\ln2-\\frac12\\right)=\\frac14.$$",
      traps: "$\\dfrac{k}{n^2}=\\dfrac{k}{n}\\cdot\\dfrac1n$，$\\dfrac1n$ 是步长、$\\dfrac{k}{n}$ 是积分变量，别把和式误认成 $\\int_0^1\\ln(1+x)\\mathrm{d}x$（漏掉因子 $x$）；分部积分后 $\\dfrac{x^2}{1+x}$ 要拆成 $x-1+\\dfrac1{1+x}$ 才能积出。",
      hint: "整理成 $\\dfrac1n\\sum\\dfrac{k}{n}\\ln(1+\\dfrac{k}{n})$ 用定积分定义化为 $\\int_0^1 x\\ln(1+x)\\mathrm{d}x$，再分部积分。",
      src: { file: "参考文件/真题/数学/5、【1987-2025年】考研数学三真题/3、2010-2022考研数学三真题.pdf", page: 23, no: "三(17)", note: "题面：合并册 p23 整页与同页放大裁片逐字亲读（m3-1617-book-p23*.png）；2017 卷首页 p21、卷范围 p21–p24 已亲读页眉确认（m3-1617-hdr-A.png、hdr-B.png、header-overview.png）。答案与《2017年数学三真题答案解析》p4–p5 对拍，册上得 $\\dfrac14$，并独立重推 $\\int_0^1 x\\ln(1+x)\\mathrm{d}x=\\dfrac14$，一致。" }
    },
    {
      id: "m3-2017-18", origin: "year", year: 2017, no: "三(18)", type: "deriv", star: 4, school: "全国硕士研究生招生考试-数学三 2017 年",
      tags: ["ext04","ext05","mvt05"],
      stem: "已知方程 $\\dfrac{1}{\\ln(1+x)}-\\dfrac{1}{x}=k$ 在区间 $(0,1)$ 内有实根，确定常数 $k$ 的取值范围.",
      answer: "$k\\in\\left(\\dfrac{1}{\\ln2}-1,\\ \\dfrac12\\right)$。记 $g(x)=\\dfrac{1}{\\ln(1+x)}-\\dfrac1x-k$，$x\\in(0,1]$，则\n$$g'(x)=\\frac{(1+x)\\ln^{2}(1+x)-x^{2}}{x^{2}(1+x)\\ln^{2}(1+x)}.$$\n令 $h(x)=(1+x)\\ln^{2}(1+x)-x^{2}$，有 $h'(x)=\\ln^{2}(1+x)+2\\ln(1+x)-2x$，$h''(x)=\\dfrac{2[\\ln(1+x)-x]}{1+x}<0\\ (x>0)$，故 $h'(x)<h'(0)=0$，$h(x)<h(0)=0$，从而 $g'(x)<0$，$g$ 在 $(0,1]$ 严格单调减少。\n又\n$$\\lim_{x\\to0^{+}}\\left(\\frac{1}{\\ln(1+x)}-\\frac1x\\right)=\\lim_{x\\to0^{+}}\\frac{x-\\ln(1+x)}{x\\ln(1+x)}=\\frac12,\\qquad g(1)=\\frac{1}{\\ln2}-1-k,$$\n即 $\\lim\\limits_{x\\to0^{+}}g(x)=\\dfrac12-k$。$g$ 连续且严格递减，故 $g(x)=0$ 在 $(0,1)$ 内有实根当且仅当\n$$\\frac12-k>0,\\qquad \\frac{1}{\\ln2}-1-k<0,$$\n即 $\\dfrac{1}{\\ln2}-1<k<\\dfrac12$。",
      traps: "$x\\to0^{+}$ 时 $\\dfrac{1}{\\ln(1+x)}-\\dfrac1x\\to\\dfrac12$（由 $\\ln(1+x)=x-\\dfrac{x^2}{2}+o(x^2)$ 或洛必达），不能直接代入；区间是开区间 $(0,1)$，端点条件必须取严格不等号（$>$ 与 $<$），不能取等号；证单调性须完整推出 $g'(x)<0$，不能只看一个点。",
      hint: "构造 $g(x)=\\dfrac{1}{\\ln(1+x)}-\\dfrac1x-k$，用 $h''<0$ 的链条证 $g'(x)<0$ 得严格递减，再由 $\\lim\\limits_{x\\to0^+}g(x)>0>g(1)$ 定出 $k$ 的范围。",
      src: { file: "参考文件/真题/数学/5、【1987-2025年】考研数学三真题/3、2010-2022考研数学三真题.pdf", page: 23, no: "三(18)", note: "题面：合并册 p23 整页与同页放大裁片逐字亲读（m3-1617-book-p23*.png）；2017 卷首页 p21、卷范围 p21–p24 已亲读页眉确认（m3-1617-hdr-A.png、hdr-B.png、header-overview.png）。答案与《2017年数学三真题答案解析》p5 对拍，册上 $k\\in\\left(\\dfrac{1}{\\ln2}-1,\\dfrac12\\right)$，并独立重推 $\\lim\\limits_{x\\to0^+}\\left(\\dfrac{1}{\\ln(1+x)}-\\dfrac1x\\right)=\\dfrac12$、$h''<0$ 的单调性链条与端点严格不等式，一致。" }
    },
    {
      id: "m3-2017-19", origin: "year", year: 2017, no: "三(19)", type: "series", star: 4, school: "全国硕士研究生招生考试-数学三 2017 年",
      tags: ["ser10","ser12","zt07"],
      stem: "若 $a_0=1,a_1=0,a_{n+1}=\\dfrac{1}{n+1}(na_n+a_{n-1})\\ (n=1,2,3,\\cdots)$，$S(x)$ 为幂级数 $\\sum\\limits_{n=0}^{\\infty}a_nx^{n}$ 的和函数。\n（Ⅰ）证明 $\\sum\\limits_{n=0}^{\\infty}a_nx^{n}$ 的收敛半径不小于 $1$；\n（Ⅱ）证明 $(1-x)S'(x)-xS(x)=0\\ (x\\in(-1,1))$，并求 $S(x)$ 的表达式.",
      answer: "（Ⅰ）由 $a_0=1,\\ a_1=0\\in[0,1]$，且当 $a_n,a_{n-1}\\in[0,1]$ 时\n$$a_{n+1}=\\frac{n}{n+1}a_n+\\frac{1}{n+1}a_{n-1}$$\n是 $a_n,a_{n-1}$ 的凸组合（两系数和为 $1$），故 $a_{n+1}\\in[0,1]$；归纳得 $0\\le a_n\\le1$。于是 $|x|<1$ 时 $|a_nx^{n}|\\le|x|^{n}$，而 $\\sum|x|^{n}$ 收敛，故 $\\sum a_nx^{n}$ 绝对收敛，收敛半径 $R\\ge1$。\n（Ⅱ）在 $(-1,1)$ 内逐项求导，$S'(x)=\\sum\\limits_{n=1}^{\\infty}na_nx^{n-1}=\\sum\\limits_{n=0}^{\\infty}(n+1)a_{n+1}x^{n}$。由递推 $(n+1)a_{n+1}=na_n+a_{n-1}$，\n$$(1-x)S'(x)-xS(x)=a_1+\\sum_{n=1}^{\\infty}\\big[(n+1)a_{n+1}-na_n-a_{n-1}\\big]x^{n}=0.$$\n解微分方程 $\\dfrac{S'(x)}{S(x)}=\\dfrac{x}{1-x}=-1+\\dfrac{1}{1-x}$，积分得 $\\ln S(x)=-x-\\ln(1-x)+C$，即 $S(x)=\\dfrac{C\\mathrm{e}^{-x}}{1-x}$。由 $S(0)=a_0=1$ 得 $C=1$，故\n$$S(x)=\\frac{\\mathrm{e}^{-x}}{1-x},\\qquad x\\in(-1,1).$$",
      traps: "（Ⅰ）$a_{n+1}$ 是 $a_n,a_{n-1}$ 的凸组合，须归纳才能断言 $0\\le a_n\\le1$，不能直接由递推式看出；（Ⅱ）逐项求导后要把下标对齐到 $x^{n}$，$xS(x)$ 与 $xS'(x)$ 的系数分别是 $a_{n-1}$ 与 $na_n$；解微分方程勿漏 $S(0)=a_0=1$ 定常数。",
      hint: "（Ⅰ）证 $0\\le a_n\\le1$ 后用比较判别法得 $R\\ge1$；（Ⅱ）逐项求导代入递推式验证恒等式，再解一阶方程 $\\dfrac{S'}{S}=\\dfrac{x}{1-x}$。",
      src: { file: "参考文件/真题/数学/5、【1987-2025年】考研数学三真题/3、2010-2022考研数学三真题.pdf", page: 23, no: "三(19)", note: "题面：合并册 p23 整页与同页放大裁片逐字亲读（m3-1617-book-p23*.png）；2017 卷首页 p21、卷范围 p21–p24 已亲读页眉确认（m3-1617-hdr-A.png、hdr-B.png、header-overview.png）。答案与《2017年数学三真题答案解析》p5 对拍，册上 $R\\ge1$、$S(x)=\\dfrac{\\mathrm{e}^{-x}}{1-x}$；册上（Ⅰ）「所以 $0\\le a_{n+1}\\le1$」为跳步／重推 $a_{n+1}$ 是 $a_n,a_{n-1}$ 的凸组合、由 $a_0,a_1\\in[0,1]$ 归纳得 $0\\le a_n\\le1$／原因：册上未写出归纳依据；并独立重推逐项求导恒等式与 $S(x)=\\dfrac{\\mathrm{e}^{-x}}{1-x}$，一致。" }
    },
    {
      id: "m3-2017-20", origin: "year", year: 2017, no: "三(20)", type: "linalg", star: 4, school: "全国硕士研究生招生考试-数学三 2017 年",
      tags: ["kn37","la12","zb08","tp09"],
      stem: "设 3 阶矩阵 $A=(\\alpha_1,\\alpha_2,\\alpha_3)$ 有 3 个不同的特征值，且 $\\alpha_3=\\alpha_1+2\\alpha_2$。\n（Ⅰ）证明 $r(A)=2$；\n（Ⅱ）若 $\\beta=\\alpha_1+\\alpha_2+\\alpha_3$，求方程组 $Ax=\\beta$ 的通解.",
      answer: "（Ⅰ）由 $\\alpha_3=\\alpha_1+2\\alpha_2$ 知 $\\alpha_1,\\alpha_2,\\alpha_3$ 线性相关，故 $r(A)\\le2$。又 $A$ 有 3 个不同的特征值，故 $A$ 可相似对角化，且 3 个特征值中至多一个为 $0$、至少 2 个非零，于是 $r(A)\\ge2$。所以 $r(A)=2$。\n（Ⅱ）由 $\\alpha_1+2\\alpha_2-\\alpha_3=0$ 得 $A(1,2,-1)^{\\mathrm{T}}=0$；因 $r(A)=2$，齐次方程 $Ax=0$ 的基础解系含 $3-2=1$ 个向量，故 $(1,2,-1)^{\\mathrm{T}}$ 即为一个基础解系。又\n$$\\beta=\\alpha_1+\\alpha_2+\\alpha_3=A(1,1,1)^{\\mathrm{T}},$$\n故 $(1,1,1)^{\\mathrm{T}}$ 是 $Ax=\\beta$ 的一个特解。由非齐次方程解的结构，通解为\n$$x=\\begin{pmatrix}1\\\\1\\\\1\\end{pmatrix}+k\\begin{pmatrix}1\\\\2\\\\-1\\end{pmatrix},$$\n其中 $k$ 为任意常数。",
      traps: "（Ⅰ）「$A$ 有 3 个不同特征值」要落到「$A$ 可对角化且非零特征值至少 2 个」才能给出 $r(A)\\ge2$；（Ⅱ）$\\beta=\\alpha_1+\\alpha_2+\\alpha_3=A(1,1,1)^{\\mathrm{T}}$ 给出的是特解，别误当齐次解；$r(A)=2$ 故基础解系恰含 1 个向量。",
      hint: "（Ⅰ）由列相关得 $r(A)\\le2$、由可对角化且非零特征值至少两个得 $r(A)\\ge2$；（Ⅱ）用 $\\alpha_1+2\\alpha_2-\\alpha_3=0$ 找齐次解、用 $\\beta=A(1,1,1)^{\\mathrm{T}}$ 找特解，再按解的结构相加。",
      src: { file: "参考文件/真题/数学/5、【1987-2025年】考研数学三真题/3、2010-2022考研数学三真题.pdf", page: 23, no: "三(20)", note: "题面：合并册 p23 整页与同页放大裁片逐字亲读（m3-1617-book-p23*.png）；2017 卷首页 p21、卷范围 p21–p24 已亲读页眉确认（m3-1617-hdr-A.png、hdr-B.png、header-overview.png）。答案与《2017年数学三真题答案解析》p5–p6 对拍，册上 $r(A)=2$ 及通解 $x=(1,1,1)^{\\mathrm{T}}+k(1,2,-1)^{\\mathrm{T}}$，并独立重推列相关、可对角化非零特征值计数与解的结构，一致。" }
    },
    {
      id: "m3-2017-21", origin: "year", year: 2017, no: "三(21)", type: "eigen", star: 4, school: "全国硕士研究生招生考试-数学三 2017 年",
      tags: ["la04","la14","tp04"],
      stem: "设二次型 $f(x_1,x_2,x_3)=2x_1^{2}-x_2^{2}+ax_3^{2}+2x_1x_2-8x_1x_3+2x_2x_3$ 在正交变换 $x=Qy$ 下的标准形为 $\\lambda_1y_1^{2}+\\lambda_2y_2^{2}$，求 $a$ 的值及一个正交矩阵 $Q$.",
      answer: "$a=2$，$Q=\\begin{pmatrix}\\frac{1}{\\sqrt3}&-\\frac{1}{\\sqrt2}&\\frac{1}{\\sqrt6}\\\\-\\frac{1}{\\sqrt3}&0&\\frac{2}{\\sqrt6}\\\\\\frac{1}{\\sqrt3}&\\frac{1}{\\sqrt2}&\\frac{1}{\\sqrt6}\\end{pmatrix}$。二次型的矩阵为\n$$A=\\begin{pmatrix}2&1&-4\\\\1&-1&1\\\\-4&1&a\\end{pmatrix}.$$\n标准形只含两项，说明 $A$ 有一个特征值为 $0$，故 $|A|=0$；而 $|A|=6-3a$，得 $a=2$。此时\n$$|\\lambda E-A|=\\lambda(\\lambda+3)(\\lambda-6),$$\n特征值为 $-3,6,0$。取对应的单位特征向量\n$$\\beta_1=\\frac{1}{\\sqrt3}(1,-1,1)^{\\mathrm{T}},\\quad \\beta_2=\\frac{1}{\\sqrt2}(-1,0,1)^{\\mathrm{T}},\\quad \\beta_3=\\frac{1}{\\sqrt6}(1,2,1)^{\\mathrm{T}},$$\n三者两两正交（实对称矩阵不同特征值的特征向量已正交），故 $Q=(\\beta_1,\\beta_2,\\beta_3)$ 为正交矩阵，$Q^{\\mathrm{T}}AQ=\\mathrm{diag}(-3,6,0)$，标准形为 $-3y_1^{2}+6y_2^{2}$。",
      traps: "标准形缺 $y_3^{2}$ 项 $\\Rightarrow$ $A$ 有零特征值 $\\Rightarrow |A|=0$，这是求 $a$ 的关键；交叉项 $2x_1x_2,-8x_1x_3,2x_2x_3$ 对应 $A$ 的非对角元 $1,-4,1$（系数取一半），别把 $-8$ 直接填进矩阵；三个特征值互异，特征向量自动正交，只需单位化后按列拼 $Q$。",
      hint: "由标准形项数知 $|A|=0$ 定 $a=2$，再求特征值与单位特征向量，按列拼成 $Q$。",
      src: { file: "参考文件/真题/数学/5、【1987-2025年】考研数学三真题/3、2010-2022考研数学三真题.pdf", page: 24, no: "三(21)", note: "题面：合并册 p24 整页与同页放大裁片逐字亲读（m3-1617-book-p24*.png）；2017 卷首页 p21、卷范围 p21–p24 已亲读页眉确认（m3-1617-hdr-A.png、hdr-B.png、header-overview.png）。答案与《2017年数学三真题答案解析》p6 对拍，册上 $a=2$ 及上述 $Q$；册上「由题设知 $|A|=0$」为跳步／重推 标准形 $\\lambda_1y_1^2+\\lambda_2y_2^2$ 秩为 2 故 $A$ 有零特征值、$|A|=6-3a=0$／原因：册上未说明标准形项数与 $|A|=0$ 的关系；并独立重推 $|\\lambda E-A|=\\lambda(\\lambda+3)(\\lambda-6)$ 与三组单位特征向量，一致。" }
    },
    {
      id: "m3-2017-22", origin: "year", year: 2017, no: "三(22)", type: "estimate", star: 4, school: "全国硕士研究生招生考试-数学三 2017 年",
      tags: ["zt05","tp02","int23"],
      stem: "设随机变量 $X,Y$ 相互独立，且 $X$ 的概率分布为 $P\\{X=0\\}=P\\{X=2\\}=\\dfrac{1}{2}$，$Y$ 的概率密度为 $f(y)=\\begin{cases}2y,&0<y<1,\\\\0,&\\text{其他}.\\end{cases}$\n（Ⅰ）求 $P\\{Y\\le E(Y)\\}$；\n（Ⅱ）求 $Z=X+Y$ 的概率密度.",
      answer: "（Ⅰ）$\\dfrac{4}{9}$。\n$$E(Y)=\\int_0^{1}y\\cdot2y\\,\\mathrm{d}y=\\frac23,\\qquad P\\{Y\\le E(Y)\\}=P\\left\\{Y\\le\\frac23\\right\\}=\\int_0^{2/3}2y\\,\\mathrm{d}y=\\left(\\frac23\\right)^{2}=\\frac49.$$\n（Ⅱ）记 $F_Y(t)=P\\{Y\\le t\\}=0\\ (t<0),\\ t^{2}\\ (0\\le t<1),\\ 1\\ (t\\ge1)$。由全概率公式（$X$ 与 $Y$ 独立）\n$$F_Z(z)=P\\{X+Y\\le z\\}=\\frac12 F_Y(z)+\\frac12 F_Y(z-2),$$\n即\n$$F_Z(z)=\\begin{cases}0,&z<0,\\\\\\dfrac{z^{2}}{2},&0\\le z<1,\\\\\\dfrac12,&1\\le z<2,\\\\\\dfrac12+\\dfrac{(z-2)^{2}}{2},&2\\le z<3,\\\\1,&z\\ge3.\\end{cases}$$\n逐段求导得 $Z$ 的概率密度\n$$f_Z(z)=\\begin{cases}z,&0<z<1,\\\\z-2,&2<z<3,\\\\0,&\\text{其他}.\\end{cases}$$",
      traps: "$E(Y)=\\dfrac23$ 是期望不是概率，$P\\{Y\\le E(Y)\\}$ 要按 $Y$ 的密度积分；$X$ 离散、$Y$ 连续，$Z=X+Y$ 的分布函数须按 $X=0,2$ 两类用全概率公式加权，密度是两段「平移叠加」，中间 $1\\le z<2$ 处密度为 $0$，别写成一段连通的密度。",
      hint: "（Ⅰ）先算 $E(Y)$ 再积分；（Ⅱ）由全概率公式写 $F_Z(z)=\\dfrac12F_Y(z)+\\dfrac12F_Y(z-2)$，分段求导。",
      src: { file: "参考文件/真题/数学/5、【1987-2025年】考研数学三真题/3、2010-2022考研数学三真题.pdf", page: 24, no: "三(22)", note: "题面：合并册 p24 整页与同页放大裁片逐字亲读（m3-1617-book-p24*.png）；2017 卷首页 p21、卷范围 p21–p24 已亲读页眉确认（m3-1617-hdr-A.png、hdr-B.png、header-overview.png）。答案与《2017年数学三真题答案解析》p6–p7 对拍，册上 $\\dfrac49$ 与 $f_Z(z)=z\\ (0<z<1),\\ z-2\\ (2<z<3)$，并独立重推 $E(Y)=\\dfrac23$ 与分段分布函数，一致。" }
    },
    {
      id: "m3-2017-23", origin: "year", year: 2017, no: "三(23)", type: "estimate", star: 4, school: "全国硕士研究生招生考试-数学三 2017 年",
      tags: ["int23","tp02","zt04"],
      stem: "某工程师为了解一台天平的精度，用该天平对一物体的质量做 $n$ 次测量，该物体的质量 $\\mu$ 是已知的，设 $n$ 次测量结果 $X_1,X_2,\\cdots,X_n$ 相互独立且均服从正态分布 $N(\\mu,\\sigma^{2})$。该工程师记录的是 $n$ 次测量的绝对误差 $Z_i=|X_i-\\mu|\\ (i=1,2,\\cdots,n)$，利用 $Z_1,Z_2,\\cdots,Z_n$ 估计 $\\sigma$。\n（Ⅰ）求 $Z_1$ 的概率密度；\n（Ⅱ）利用一阶矩求 $\\sigma$ 的矩估计量；\n（Ⅲ）求 $\\sigma$ 的最大似然估计量.",
      answer: "（Ⅰ）$X_1-\\mu\\sim N(0,\\sigma^{2})$。$z\\ge0$ 时\n$$F_{Z_1}(z)=P\\{|X_1-\\mu|\\le z\\}=2\\Phi\\!\\left(\\frac{z}{\\sigma}\\right)-1,$$\n$z<0$ 时 $F_{Z_1}(z)=0$。求导得\n$$f_{Z_1}(z)=\\begin{cases}\\dfrac{2}{\\sqrt{2\\pi}\\,\\sigma}\\mathrm{e}^{-\\frac{z^{2}}{2\\sigma^{2}}},&z\\ge0,\\\\0,&z<0.\\end{cases}$$\n（Ⅱ）$E(Z_1)=\\int_0^{+\\infty}z\\,\\dfrac{2}{\\sqrt{2\\pi}\\,\\sigma}\\mathrm{e}^{-z^{2}/(2\\sigma^{2})}\\mathrm{d}z=\\dfrac{2}{\\sqrt{2\\pi}\\,\\sigma}\\cdot\\sigma^{2}=\\sqrt{\\dfrac{2}{\\pi}}\\,\\sigma$，故 $\\sigma=\\dfrac{\\sqrt{2\\pi}}{2}E(Z_1)$。令 $\\overline{Z}=\\dfrac1n\\sum\\limits_{i=1}^{n}Z_i$，得矩估计量\n$$\\hat{\\sigma}=\\frac{\\sqrt{2\\pi}}{2}\\,\\overline{Z}.$$\n（Ⅲ）设 $z_1,\\cdots,z_n$ 为样本观测值，似然函数\n$$L(\\sigma)=\\prod_{i=1}^{n}f_{Z_1}(z_i)=\\left(\\frac{2}{\\sqrt{2\\pi}}\\right)^{n}\\sigma^{-n}\\exp\\left(-\\frac{1}{2\\sigma^{2}}\\sum_{i=1}^{n}z_i^{2}\\right),$$\n$$\\ln L=n\\ln\\frac{2}{\\sqrt{2\\pi}}-n\\ln\\sigma-\\frac{1}{2\\sigma^{2}}\\sum_{i=1}^{n}z_i^{2},\\qquad \\frac{\\mathrm{d}\\ln L}{\\mathrm{d}\\sigma}=-\\frac{n}{\\sigma}+\\frac{1}{\\sigma^{3}}\\sum_{i=1}^{n}z_i^{2}=0,$$\n解得最大似然估计量\n$$\\hat{\\sigma}=\\sqrt{\\frac1n\\sum_{i=1}^{n}Z_i^{2}}.$$",
      traps: "$Z_1=|X_1-\\mu|$ 是「折叠正态」，$z\\ge0$ 时密度是 $N(0,\\sigma^2)$ 密度的 2 倍（$\\pm z$ 两处贡献）；矩估计用一阶原点矩 $E(Z_1)=\\sqrt{2/\\pi}\\,\\sigma$ 反解，最大似然须基于 $Z_i$ 的密度写似然（不是直接套 $X_i$ 的正态似然），结果 $\\sqrt{\\dfrac1n\\sum Z_i^2}$ 不是 $\\dfrac1n\\sum Z_i$。",
      hint: "（Ⅰ）由 $X_1-\\mu\\sim N(0,\\sigma^2)$ 写 $|X_1-\\mu|$ 的分布函数再求导；（Ⅱ）算 $E(Z_1)$ 反解 $\\sigma$；（Ⅲ）写 $Z_i$ 的似然函数、取对数求导。",
      src: { file: "参考文件/真题/数学/5、【1987-2025年】考研数学三真题/3、2010-2022考研数学三真题.pdf", page: 24, no: "三(23)", note: "题面：合并册 p24 整页与同页放大裁片逐字亲读（m3-1617-book-p24*.png）；2017 卷首页 p21、卷范围 p21–p24 已亲读页眉确认（m3-1617-hdr-A.png、hdr-B.png、header-overview.png）。答案与《2017年数学三真题答案解析》p7 对拍，册上 $f_{Z_1}(z)=\\dfrac{2}{\\sqrt{2\\pi}\\,\\sigma}\\mathrm{e}^{-z^2/(2\\sigma^2)}\\ (z\\ge0)$、$\\hat\\sigma=\\dfrac{\\sqrt{2\\pi}}{2}\\overline{Z}$、$\\hat\\sigma=\\sqrt{\\dfrac1n\\sum Z_i^2}$，并独立重推 $E(Z_1)=\\sqrt{2/\\pi}\\,\\sigma$ 与似然方程，一致。" }
    },
    {
      id: "m3-2018-13", origin: "year", year: 2018, no: "二(13)", type: "linalg", star: 3, school: "全国硕士研究生招生考试-数学三 2018 年",
      tags: ["la01","la08","ln08"],
      stem: "设 $\\boldsymbol{A}$ 为 3 阶矩阵，$\\boldsymbol{\\alpha}_1,\\boldsymbol{\\alpha}_2,\\boldsymbol{\\alpha}_3$ 是线性无关的向量组。若 $\\boldsymbol{A}\\boldsymbol{\\alpha}_1=\\boldsymbol{\\alpha}_1+\\boldsymbol{\\alpha}_2$，$\\boldsymbol{A}\\boldsymbol{\\alpha}_2=\\boldsymbol{\\alpha}_2+\\boldsymbol{\\alpha}_3$，$\\boldsymbol{A}\\boldsymbol{\\alpha}_3=\\boldsymbol{\\alpha}_1+\\boldsymbol{\\alpha}_3$，则 $|\\boldsymbol{A}|=$______.",
      answer: "填 $2$。把三个等式按列拼成矩阵等式\n$$\\boldsymbol{A}(\\boldsymbol{\\alpha}_1,\\boldsymbol{\\alpha}_2,\\boldsymbol{\\alpha}_3)=(\\boldsymbol{\\alpha}_1,\\boldsymbol{\\alpha}_2,\\boldsymbol{\\alpha}_3)\\begin{pmatrix}1&0&1\\\\1&1&0\\\\0&1&1\\end{pmatrix}.$$\n记 $\\boldsymbol{P}=(\\boldsymbol{\\alpha}_1,\\boldsymbol{\\alpha}_2,\\boldsymbol{\\alpha}_3)$、$\\boldsymbol{C}=\\begin{pmatrix}1&0&1\\\\1&1&0\\\\0&1&1\\end{pmatrix}$，因 $\\boldsymbol{\\alpha}_1,\\boldsymbol{\\alpha}_2,\\boldsymbol{\\alpha}_3$ 线性无关故 $|\\boldsymbol{P}|\\ne0$，于是 $\\boldsymbol{A}=\\boldsymbol{P}\\boldsymbol{C}\\boldsymbol{P}^{-1}$，\n$$|\\boldsymbol{A}|=|\\boldsymbol{C}|=\\begin{vmatrix}1&0&1\\\\1&1&0\\\\0&1&1\\end{vmatrix}=2.$$",
      traps: "三个等式要按列拼成 $\\boldsymbol{A}\\boldsymbol{P}=\\boldsymbol{P}\\boldsymbol{C}$，$\\boldsymbol{C}$ 的第 $j$ 列是 $\\boldsymbol{A}\\boldsymbol{\\alpha}_j$ 在基 $\\boldsymbol{\\alpha}_1,\\boldsymbol{\\alpha}_2,\\boldsymbol{\\alpha}_3$ 下的坐标（注意别把 $\\boldsymbol{C}$ 写成转置，本题 $\\boldsymbol{C}$ 恰好对称易掩盖错误）。",
      hint: "由 $|\\boldsymbol{A}|=|\\boldsymbol{P}\\boldsymbol{C}\\boldsymbol{P}^{-1}|=|\\boldsymbol{C}|$，只需求出过渡矩阵的三阶行列式。",
      src: { file: "参考文件/真题/数学/5、【1987-2025年】考研数学三真题/3、2010-2022考研数学三真题.pdf", page: 18, no: "二(13)", note: "题面：合并册 p18 裁片逐字亲读（m3-1819-p18-hi1.png）；2018 卷首页 p17、卷范围 p17–p20 已亲读页眉确认。答案与《2018年数学三真题答案解析》p3 对拍（册上填 2），并独立重推 $|\\boldsymbol{C}|=1\\cdot(1-0)+1\\cdot(1-0)=2$，一致。" }
    },
    {
      id: "m3-2018-14", origin: "year", year: 2018, no: "二(14)", type: "estimate", star: 3, school: "全国硕士研究生招生考试-数学三 2018 年",
      tags: ["zt04","tp02"],
      stem: "随机事件 $A,B,C$ 相互独立，且 $P(A)=P(B)=P(C)=\\dfrac{1}{2}$，则 $P(AC\\mid A\\cup B)=$______.",
      answer: "填 $\\dfrac{1}{3}$。因 $AC\\subset A\\subset A\\cup B$，故 $AC\\cap(A\\cup B)=AC$，由条件概率与独立性\n$$P(AC\\mid A\\cup B)=\\frac{P\\big(AC\\cap(A\\cup B)\\big)}{P(A\\cup B)}=\\frac{P(AC)}{P(A)+P(B)-P(AB)}=\\frac{P(A)P(C)}{\\frac12+\\frac12-\\frac14}=\\frac{\\frac14}{\\frac34}=\\frac{1}{3}.$$",
      traps: "$AC\\cap(A\\cup B)=AC$，分子不要再乘一次 $P(A\\cup B)$；须「相互独立」才能把 $P(AC)=P(A)P(C)$、$P(AB)=P(A)P(B)$ 拆开，仅有两两独立不够。",
      hint: "用条件概率定义，分子借包含关系化简，分母用加法公式，再用独立性把联合概率拆成乘积。",
      src: { file: "参考文件/真题/数学/5、【1987-2025年】考研数学三真题/3、2010-2022考研数学三真题.pdf", page: 18, no: "二(14)", note: "题面：合并册 p18 裁片逐字亲读（m3-1819-p18-hi1.png）。答案与《2018年数学三真题答案解析》p3 对拍（册上填 1/3），并独立重推 $\\frac{1/4}{3/4}=1/3$，一致。" }
    },
    {
      id: "m3-2018-15", origin: "year", year: 2018, no: "三(15)", type: "limit", star: 3, school: "全国硕士研究生招生考试-数学三 2018 年",
      tags: ["tp01","ext02","tay01"],
      stem: "已知实数 $a,b$ 满足 $\\lim\\limits_{x\\to+\\infty}\\left[(ax+b)\\mathrm{e}^{\\frac{1}{x}}-x\\right]=2$，求 $a,b$。",
      answer: "$a=1,\\;b=1$。令 $t=\\dfrac{1}{x}\\to0^{+}$，则\n$$\\lim_{x\\to+\\infty}\\left[(ax+b)\\mathrm{e}^{1/x}-x\\right]=\\lim_{t\\to0^{+}}\\frac{(a+bt)\\mathrm{e}^{t}-1}{t}.$$\n分母趋于 0 而极限存在，分子须趋于 0：$(a+bt)\\mathrm{e}^{t}-1\\to a-1=0$，故 $a=1$。再拆项\n$$\\lim_{t\\to0^{+}}\\frac{(1+bt)\\mathrm{e}^{t}-1}{t}=\\lim_{t\\to0^{+}}\\left(\\frac{\\mathrm{e}^{t}-1}{t}+b\\,\\mathrm{e}^{t}\\right)=1+b=2,$$\n故 $b=1$。",
      traps: "不能直接把 $x\\to+\\infty$ 代入；必须换元 $t=1/x$ 化成 $\\frac{0}{0}$ 型，先由「分子趋于 0」定 $a=1$ 这一步会漏掉 $b$ 的信息，须再取一次极限。",
      hint: "换元 $t=1/x$ 后用 $\\lim_{t\\to0}\\frac{\\mathrm{e}^t-1}{t}=1$ 与 $\\mathrm{e}^t\\to1$，先定 $a$ 再定 $b$。",
      src: { file: "参考文件/真题/数学/5、【1987-2025年】考研数学三真题/3、2010-2022考研数学三真题.pdf", page: 18, no: "三(15)", note: "题面：合并册 p18 裁片逐字亲读（m3-1819-p18-hi1.png）。答案与《2018年数学三真题答案解析》p3 对拍（册上 $a=1,b=1$），并独立重推换元后的拆分极限，一致。" }
    },
    {
      id: "m3-2018-16", origin: "year", year: 2018, no: "三(16)", type: "dblint", star: 4, school: "全国硕士研究生招生考试-数学三 2018 年",
      tags: ["dbi01","tp08","int23"],
      stem: "设平面区域 $D$ 由曲线 $y=\\sqrt{3(1-x^{2})}$ 与直线 $y=\\sqrt{3}x$ 及 $y$ 轴围成。计算二重积分 $\\iint\\limits_{D}x^{2}\\,\\mathrm{d}x\\mathrm{d}y$.",
      answer: "$\\dfrac{\\sqrt3}{16}\\left(\\dfrac{\\pi}{2}-1\\right)$。由 $\\sqrt{3(1-x^{2})}=\\sqrt{3}x$ 得 $x^{2}=1-x^{2}$，即交点横坐标 $x=\\dfrac{1}{\\sqrt2}$，故 $D=\\{(x,y)\\mid0\\le x\\le\\frac{1}{\\sqrt2},\\ \\sqrt3 x\\le y\\le\\sqrt{3(1-x^{2})}\\}$，\n$$\\iint_D x^{2}\\,\\mathrm{d}x\\mathrm{d}y=\\int_0^{1/\\sqrt2}\\mathrm{d}x\\int_{\\sqrt3 x}^{\\sqrt{3(1-x^{2})}}x^{2}\\,\\mathrm{d}y=\\sqrt3\\int_0^{1/\\sqrt2}x^{2}\\left(\\sqrt{1-x^{2}}-x\\right)\\mathrm{d}x.$$\n令 $x=\\sin t$：$\\int_0^{1/\\sqrt2}x^{2}\\sqrt{1-x^{2}}\\,\\mathrm{d}x=\\int_0^{\\pi/4}\\sin^{2}t\\cos^{2}t\\,\\mathrm{d}t=\\frac{1}{8}\\int_0^{\\pi/4}(1-\\cos4t)\\,\\mathrm{d}t=\\frac{\\pi}{32}$，又 $\\int_0^{1/\\sqrt2}x^{3}\\,\\mathrm{d}x=\\frac{1}{16}$，故\n$$\\iint_D x^{2}\\,\\mathrm{d}x\\mathrm{d}y=\\sqrt3\\left(\\frac{\\pi}{32}-\\frac{1}{16}\\right)=\\frac{\\sqrt3}{16}\\left(\\frac{\\pi}{2}-1\\right).$$",
      traps: "上界曲线是上半椭圆 $y=\\sqrt{3(1-x^2)}$（不是圆），与 $y=\\sqrt3 x$ 的交点在 $x=1/\\sqrt2$；先对 $y$ 积分时 $x^2$ 当常数提出，别把 $\\sqrt3$ 漏在积分外。",
      hint: "先联立两曲线求交点定 $x$ 范围，化成先 $y$ 后 $x$ 的累次积分，再用三角换元算 $\\int x^2\\sqrt{1-x^2}\\,\\mathrm{d}x$。",
      src: { file: "参考文件/真题/数学/5、【1987-2025年】考研数学三真题/3、2010-2022考研数学三真题.pdf", page: 18, no: "三(16)", note: "题面：合并册 p18 裁片逐字亲读（m3-1819-p18-hi2.png）。答案与《2018年数学三真题答案解析》p3–p4 对拍（册上 $\\frac{\\sqrt3}{16}(\\frac{\\pi}{2}-1)$），并独立重推 $\\sqrt3(\\frac{\\pi}{32}-\\frac{1}{16})=\\frac{\\sqrt3(\\pi-2)}{32}$ 与册上值等价，一致。" }
    },
    {
      id: "m3-2018-17", origin: "year", year: 2018, no: "三(17)", type: "multivar", star: 4, school: "全国硕士研究生招生考试-数学三 2018 年",
      tags: ["multi04","tp06","ext07"],
      stem: "将长为 $2\\mathrm{m}$ 的铁丝分成三段，依次围成圆、正方形与正三角形。三个图形的面积之和是否存在最小值？若存在，求出最小值。",
      answer: "存在，最小值为 $\\dfrac{1}{\\pi+4+3\\sqrt3}\\ \\mathrm{m}^{2}$。设圆半径 $x$、正方形边长 $y$、正三角形边长 $z$，则约束 $2\\pi x+4y+3z=2\\ (x,y,z>0)$，目标\n$$f(x,y,z)=\\pi x^{2}+y^{2}+\\frac{\\sqrt3}{4}z^{2}.$$\n作 $L=\\pi x^{2}+y^{2}+\\frac{\\sqrt3}{4}z^{2}+\\lambda(2\\pi x+4y+3z-2)$，令\n$$L_x=2\\pi x+2\\pi\\lambda=0,\\quad L_y=2y+4\\lambda=0,\\quad L_z=\\frac{\\sqrt3}{2}z+3\\lambda=0,\\quad L_\\lambda=2\\pi x+4y+3z-2=0,$$\n解得（记 $D=\\pi+4+3\\sqrt3$）$x_0=\\dfrac{1}{D},\\ y_0=\\dfrac{2}{D},\\ z_0=\\dfrac{2\\sqrt3}{D}$，此时 $f(x_0,y_0,z_0)=\\dfrac{1}{D}$。\n边界情形（某个变量为 0）上的最小值为 $\\dfrac{1}{4+3\\sqrt3}>\\dfrac{1}{D}$（因 $\\pi>0$），故上述驻点给出全局最小值 $\\dfrac{1}{\\pi+4+3\\sqrt3}$。",
      traps: "三段长度分别是圆周 $2\\pi x$、正方形周长 $4y$、正三角形周长 $3z$，正三角形面积是 $\\frac{\\sqrt3}{4}z^{2}$；拉格朗日乘数法只给内部驻点，还须与边界（某段长度为 0）比较才能断言全局最小。",
      hint: "把「三段依次围成」翻成周长约束，写出三个面积之和，用拉格朗日乘数法求内部驻点，再与边界值比较。",
      src: { file: "参考文件/真题/数学/5、【1987-2025年】考研数学三真题/3、2010-2022考研数学三真题.pdf", page: 19, no: "三(17)", note: "题面：合并册 p19 裁片逐字亲读（m3-1819-p19-hi1.png，含「(17)（本题满分 10 分）」题号）。答案与《2018年数学三真题答案解析》p4 对拍（册上最小值 $\\frac{1}{\\pi+4+3\\sqrt3}$），并独立重推驻点 $x_0,y_0,z_0$ 及边界值比较，一致。" }
    },
    {
      id: "m3-2018-18", origin: "year", year: 2018, no: "三(18)", type: "series", star: 4, school: "全国硕士研究生招生考试-数学三 2018 年",
      tags: ["ext17","ser12","gx52"],
      stem: "已知 $\\cos 2x-\\dfrac{1}{(1+x)^{2}}=\\sum\\limits_{n=0}^{\\infty}a_n x^{n}\\ (-1<x<1)$，求 $a_n$.",
      answer: "$a_{2n}=\\dfrac{(-1)^{n}4^{n}}{(2n)!}-2n-1$，$a_{2n+1}=2n+2\\ (n=0,1,2,\\cdots)$。分别展开：\n$$\\cos2x=\\sum_{n=0}^{\\infty}\\frac{(-1)^{n}(2x)^{2n}}{(2n)!}=\\sum_{n=0}^{\\infty}\\frac{(-1)^{n}4^{n}x^{2n}}{(2n)!},\\qquad x\\in(-\\infty,+\\infty),$$\n$$\\frac{1}{(1+x)^{2}}=\\left(-\\frac{1}{1+x}\\right)'=-\\left(\\sum_{n=0}^{\\infty}(-1)^{n}x^{n}\\right)'=-\\sum_{n=0}^{\\infty}(-1)^{n+1}(n+1)x^{n},\\quad-1<x<1,$$\n故 $\\cos2x-\\dfrac{1}{(1+x)^{2}}=\\sum\\limits_{n=0}^{\\infty}\\dfrac{(-1)^{n}4^{n}x^{2n}}{(2n)!}+\\sum\\limits_{n=0}^{\\infty}(-1)^{n+1}(n+1)x^{n}$。比较同次幂系数：偶次项来自 $\\cos2x$ 的 $\\frac{(-1)^n4^n}{(2n)!}$ 加 $-(2n+1)$，奇次项来自 $(2n+2)$，即得结论。",
      traps: "$\\cos2x$ 只含偶次幂，$\\frac{1}{(1+x)^2}$ 含所有次幂，故 $a_n$ 必须按奇偶分两段写；$\\frac{1}{(1+x)^2}=\\left(-\\frac{1}{1+x}\\right)'$ 是对几何级数逐项求导，下标从 $n=1$ 起要整理回 $n=0$。",
      hint: "用 $\\cos$ 的麦克劳林展开与 $\\frac1{1+x}=\\sum(-1)^nx^n$ 逐项求导，再按 $n$ 的奇偶合并系数。",
      src: { file: "参考文件/真题/数学/5、【1987-2025年】考研数学三真题/3、2010-2022考研数学三真题.pdf", page: 19, no: "三(18)", note: "题面：合并册 p19 裁片逐字亲读（m3-1819-p19-hi1.png）。答案与《2018年数学三真题答案解析》p4–p5 对拍（册上 $a_{2n}=\\frac{(-1)^n4^n}{(2n)!}-2n-1$、$a_{2n+1}=2n+2$），并独立重推逐项求导与奇偶系数，一致。" }
    },
    {
      id: "m3-2018-19", origin: "year", year: 2018, no: "三(19)", type: "limit", star: 4, school: "全国硕士研究生招生考试-数学三 2018 年",
      tags: ["lim13","gx12","mvt02"],
      stem: "设数列 $\\{x_n\\}$ 满足：$x_1>0$，$x_n\\mathrm{e}^{x_{n+1}}=\\mathrm{e}^{x_n}-1\\ (n=1,2,\\cdots)$。证明 $\\{x_n\\}$ 收敛，并求 $\\lim\\limits_{n\\to\\infty}x_n$.",
      answer: "$\\lim\\limits_{n\\to\\infty}x_n=0$。由 $x_1>0$ 得 $\\mathrm{e}^{x_2}=\\dfrac{\\mathrm{e}^{x_1}-1}{x_1}$；由拉格朗日中值定理，存在 $\\xi\\in(0,x_1)$ 使 $\\dfrac{\\mathrm{e}^{x_1}-1}{x_1}=\\mathrm{e}^{\\xi}$，故 $\\mathrm{e}^{x_2}=\\mathrm{e}^{\\xi}$，即 $0<x_2<x_1$。\n归纳：设 $0<x_{n+1}<x_n$，同理存在 $\\eta\\in(0,x_{n+1})$ 使 $\\mathrm{e}^{x_{n+2}}=\\dfrac{\\mathrm{e}^{x_{n+1}}-1}{x_{n+1}}=\\mathrm{e}^{\\eta}$，故 $0<x_{n+2}<x_{n+1}$。于是 $\\{x_n\\}$ 单调减少且有下界 $0$，由单调有界准则收敛。\n设 $\\lim x_n=a\\ge0$，对 $x_n\\mathrm{e}^{x_{n+1}}=\\mathrm{e}^{x_n}-1$ 取极限得 $a\\mathrm{e}^{a}=\\mathrm{e}^{a}-1$。令 $f(t)=t\\mathrm{e}^{t}-\\mathrm{e}^{t}+1$，则 $f'(t)=t\\mathrm{e}^{t}>0\\ (t>0)$，$f$ 在 $[0,+\\infty)$ 严格单调增加且 $f(0)=0$，故 $a=0$ 是唯一解，$\\lim\\limits_{n\\to\\infty}x_n=0$。",
      traps: "证明单调性要用 $\\frac{\\mathrm{e}^{x}-1}{x}=\\mathrm{e}^{\\xi}\\ (0<\\xi<x)$ 这个中值定理结论，直接说「$\\mathrm{e}^x-1<x\\mathrm{e}^x$」虽对但要说清依据；极限方程 $a\\mathrm{e}^a=\\mathrm{e}^a-1$ 在 $[0,+\\infty)$ 上须说明解唯一。",
      hint: "用微分中值定理把递推写成 $\\mathrm{e}^{x_{n+1}}=\\mathrm{e}^{\\xi}$ 证单调有界，再对递推取极限并用单调性定唯一极限。",
      src: { file: "参考文件/真题/数学/5、【1987-2025年】考研数学三真题/3、2010-2022考研数学三真题.pdf", page: 19, no: "三(19)", note: "题面：合并册 p19 裁片逐字亲读（m3-1819-p19-hi1.png 与 p19-hi2.png）。答案与《2018年数学三真题答案解析》p5 对拍（册上收敛且极限为 0），并独立重推中值定理单调性与极限方程解的唯一性，一致。" }
    },
    {
      id: "m3-2018-20", origin: "year", year: 2018, no: "三(20)", type: "eigen", star: 4, school: "全国硕士研究生招生考试-数学三 2018 年",
      tags: ["ms03","la09","zt02"],
      stem: "设实二次型 $f(x_1,x_2,x_3)=(x_1-x_2+x_3)^{2}+(x_2+x_3)^{2}+(x_1+ax_3)^{2}$，其中 $a$ 是参数。\n（Ⅰ）求 $f(x_1,x_2,x_3)=0$ 的解；\n（Ⅱ）求 $f(x_1,x_2,x_3)$ 的规范形。",
      answer: "（Ⅰ）$f=0$ 当且仅当三个平方项同时为零：\n$$\\begin{cases}x_1-x_2+x_3=0,\\\\x_2+x_3=0,\\\\x_1+ax_3=0,\\end{cases}\\qquad \\begin{pmatrix}1&-1&1\\\\0&1&1\\\\1&0&a\\end{pmatrix}\\to\\begin{pmatrix}1&0&2\\\\0&1&1\\\\0&0&a-2\\end{pmatrix}.$$\n当 $a\\ne2$ 时只有零解 $x=0$；当 $a=2$ 时有无穷多解 $x=k(-2,-1,1)^{\\mathrm{T}}$（$k$ 为任意常数）。\n（Ⅱ）$a\\ne2$ 时 $f$ 正定，规范形为 $y_1^{2}+y_2^{2}+y_3^{2}$；当 $a=2$ 时\n$$f=2x_1^{2}+2x_2^{2}+6x_3^{2}-2x_1x_2+6x_1x_3=2\\left(x_1-\\frac{1}{2}x_2+\\frac{3}{2}x_3\\right)^{2}+\\frac{3}{2}(x_2+x_3)^{2},$$\n秩为 2、正惯性指数为 2，规范形为 $y_1^{2}+y_2^{2}$。",
      traps: "规范形要按参数 $a$ 分类：$a=2$ 时三个平方项线性相关，$f$ 只是半正定（秩 2），规范形少一个平方项；「规范形」系数只能是 $1,-1,0$，配方得到的 $2(\\cdots)^2+\\frac32(\\cdots)^2$ 是标准形不是规范形。",
      hint: "$f=0$ 等价于三个线性式同时为 0，解齐次方程组并按 $a=2$ 分类；规范形由正惯性指数（秩）决定。",
      src: { file: "参考文件/真题/数学/5、【1987-2025年】考研数学三真题/3、2010-2022考研数学三真题.pdf", page: 19, no: "三(20)", note: "题面：合并册 p19 裁片逐字亲读（m3-1819-p19-hi2.png）。答案与《2018年数学三真题答案解析》p5–p6 对拍（册上 $a\\ne2$ 时零解与规范形 $y_1^2+y_2^2+y_3^2$，$a=2$ 时通解 $k(-2,-1,1)^\\mathrm{T}$ 与规范形 $y_1^2+y_2^2$），并独立重推展开式与配方，一致。" }
    },
    {
      id: "m3-2018-21", origin: "year", year: 2018, no: "三(21)", type: "linalg", star: 4, school: "全国硕士研究生招生考试-数学三 2018 年",
      tags: ["ln05","zb09","tp09"],
      stem: "已知 $a$ 是常数，且矩阵 $\\boldsymbol{A}=\\begin{pmatrix}1&2&a\\\\1&3&0\\\\2&7&-a\\end{pmatrix}$ 可经初等列变换化为矩阵 $\\boldsymbol{B}=\\begin{pmatrix}1&a&2\\\\0&1&1\\\\-1&1&1\\end{pmatrix}$。\n（Ⅰ）求 $a$；\n（Ⅱ）求满足 $\\boldsymbol{A}\\boldsymbol{P}=\\boldsymbol{B}$ 的可逆矩阵 $\\boldsymbol{P}$.",
      answer: "（Ⅰ）$a=2$。初等列变换不改变秩，$r(\\boldsymbol{A})=2$（$\\boldsymbol{A}$ 第三行可由前两行线性表示）；而\n$$\\boldsymbol{B}\\to\\begin{pmatrix}1&0&0\\\\0&1&1\\\\0&0&2-a\\end{pmatrix},$$\n故 $r(\\boldsymbol{B})=2\\iff a=2$。\n（Ⅱ）$a=2$ 时对 $(\\boldsymbol{A}\\mid\\boldsymbol{B})$ 作初等行变换：\n$$(\\boldsymbol{A}\\mid\\boldsymbol{B})=\\begin{pmatrix}1&2&2&\\vdots&1&2&2\\\\1&3&0&\\vdots&0&1&1\\\\2&7&-2&\\vdots&-1&1&1\\end{pmatrix}\\to\\begin{pmatrix}1&0&6&\\vdots&3&4&4\\\\0&1&-2&\\vdots&-1&-1&-1\\\\0&0&0&\\vdots&0&0&0\\end{pmatrix}.$$\n记 $\\boldsymbol{B}=(\\boldsymbol{\\beta}_1,\\boldsymbol{\\beta}_2,\\boldsymbol{\\beta}_3)$，由 $\\boldsymbol{A}(-6,2,1)^{\\mathrm{T}}=\\boldsymbol{0}$、$\\boldsymbol{A}(3,-1,0)^{\\mathrm{T}}=\\boldsymbol{\\beta}_1$、$\\boldsymbol{A}(4,-1,0)^{\\mathrm{T}}=\\boldsymbol{\\beta}_2=\\boldsymbol{\\beta}_3$，得 $\\boldsymbol{A}\\boldsymbol{X}=\\boldsymbol{B}$ 的通解\n$$\\boldsymbol{P}=\\begin{pmatrix}3-6k_1&4-6k_2&4-6k_3\\\\-1+2k_1&-1+2k_2&-1+2k_3\\\\k_1&k_2&k_3\\end{pmatrix},\\qquad |\\boldsymbol{P}|=k_3-k_2,$$\n其中 $k_1,k_2,k_3$ 为任意常数且 $k_2\\ne k_3$（此时 $\\boldsymbol{P}$ 可逆）。",
      traps: "「初等列变换」$\\iff$ $\\boldsymbol{A},\\boldsymbol{B}$ 列等价 $\\iff$ 秩相同，据此定 $a$；$a=2$ 时 $\\boldsymbol{B}$ 的第 2、3 列相同，故 $\\boldsymbol{\\beta}_2=\\boldsymbol{\\beta}_3$，通解中这两列可独立取参数，但可逆性要求 $|\\boldsymbol{P}|=k_3-k_2\\ne0$。",
      hint: "先用秩相等定 $a$，再解矩阵方程 $\\boldsymbol{A}\\boldsymbol{X}=\\boldsymbol{B}$（对 $(\\boldsymbol{A}\\mid\\boldsymbol{B})$ 行变换），最后挑使 $|\\boldsymbol{P}|\\ne0$ 的参数。",
      src: { file: "参考文件/真题/数学/5、【1987-2025年】考研数学三真题/3、2010-2022考研数学三真题.pdf", page: 20, no: "三(21)", note: "题面：合并册 p20 裁片逐字亲读（m3-1819-p20-hi1.png）。答案与《2018年数学三真题答案解析》p6 对拍（册上 $a=2$ 及含 $k_1,k_2,k_3$ 且 $k_2\\ne k_3$ 的 $\\boldsymbol{P}$）；册上「由题设知 $a=2$」为跳步，独立重推 $r(\\boldsymbol{A})=2$、$r(\\boldsymbol{B})=2\\iff a=2$ 补足，并核验 $|\\boldsymbol{P}|=k_3-k_2$，结论一致。" }
    },
    {
      id: "m3-2018-22", origin: "year", year: 2018, no: "三(22)", type: "estimate", star: 4, school: "全国硕士研究生招生考试-数学三 2018 年",
      tags: ["zt05","tp02","int23"],
      stem: "设随机变量 $X$ 与 $Y$ 相互独立，$X$ 的概率分布为 $P\\{X=1\\}=P\\{X=-1\\}=\\dfrac{1}{2}$，$Y$ 服从参数为 $\\lambda$ 的泊松分布。令 $Z=XY$。\n（Ⅰ）求 $\\mathrm{Cov}(X,Z)$；\n（Ⅱ）求 $Z$ 的概率分布。",
      answer: "（Ⅰ）$\\mathrm{Cov}(X,Z)=\\lambda$。$E(X)=0$，$E(X^{2})=1$，$E(Y)=\\lambda$，$Z=XY$，由 $X,Y$ 独立\n$$E(XZ)=E(X^{2}Y)=E(X^{2})E(Y)=\\lambda,\\qquad E(Z)=E(X)E(Y)=0,$$\n$$\\mathrm{Cov}(X,Z)=E(XZ)-E(X)E(Z)=\\lambda.$$\n（Ⅱ）$Z$ 取值为全体整数：\n$$P\\{Z=0\\}=P\\{Y=0\\}=\\mathrm{e}^{-\\lambda},$$\n$$P\\{Z=n\\}=P\\left\\{X=\\frac{n}{|n|},\\,Y=|n|\\right\\}=\\frac{1}{2}\\cdot\\frac{\\lambda^{|n|}}{|n|!}\\mathrm{e}^{-\\lambda}=\\frac{\\lambda^{|n|}}{2\\,|n|!}\\,\\mathrm{e}^{-\\lambda},\\qquad n=\\pm1,\\pm2,\\cdots.$$\n（$n\\ne0$ 时 $Z=n$ 需 $X=\\operatorname{sgn}(n)$ 且 $Y=|n|$，由独立性相乘。）",
      traps: "$Z=XY$ 可取负值（$Y\\ge0$ 而 $X=\\pm1$），取值是全体整数而非非负整数；$P\\{Z=0\\}$ 只由 $Y=0$ 贡献，等于 $\\mathrm{e}^{-\\lambda}$，不能套 $n=0$ 进 $\\frac{\\lambda^{|n|}}{2|n|!}\\mathrm{e}^{-\\lambda}$（那样只得 $\\frac12\\mathrm{e}^{-\\lambda}$）。",
      hint: "协方差用 $\\mathrm{Cov}(X,Z)=E(X^2Y)-E(X)E(XY)$ 与独立性；分布按 $n=0$ 与 $n\\ne0$ 两类分别求概率。",
      src: { file: "参考文件/真题/数学/5、【1987-2025年】考研数学三真题/3、2010-2022考研数学三真题.pdf", page: 20, no: "三(22)", note: "题面：合并册 p20 裁片逐字亲读（m3-1819-p20-hi1.png 与 p20-hi2.png）。答案与《2018年数学三真题答案解析》p6 对拍（册上 $\\mathrm{Cov}(X,Z)=\\lambda$、$P\\{Z=0\\}=\\mathrm{e}^{-\\lambda}$、$P\\{Z=n\\}=\\frac{\\lambda^{|n|}}{2|n|!}\\mathrm{e}^{-\\lambda}$），并独立重推协方差与分布，一致。" }
    },
    {
      id: "m3-2018-23", origin: "year", year: 2018, no: "三(23)", type: "estimate", star: 4, school: "全国硕士研究生招生考试-数学三 2018 年",
      tags: ["int23","tp02","zt04"],
      stem: "设总体 $X$ 的概率密度为\n$$f(x;\\sigma)=\\frac{1}{2\\sigma}\\mathrm{e}^{-\\frac{|x|}{\\sigma}},\\quad-\\infty<x<+\\infty,$$\n其中 $\\sigma\\in(0,+\\infty)$ 为未知参数，$X_1,X_2,\\cdots,X_n$ 为来自总体 $X$ 的简单随机样本。记 $\\sigma$ 的最大似然估计量为 $\\hat{\\sigma}$。\n（Ⅰ）求 $\\hat{\\sigma}$；\n（Ⅱ）求 $E(\\hat{\\sigma})$，$D(\\hat{\\sigma})$.",
      answer: "（Ⅰ）$\\hat{\\sigma}=\\dfrac{1}{n}\\sum\\limits_{i=1}^{n}|X_i|$。似然函数\n$$L(\\sigma)=\\prod_{i=1}^{n}f(x_i;\\sigma)=\\frac{1}{2^{n}\\sigma^{n}}\\exp\\left(-\\frac{1}{\\sigma}\\sum_{i=1}^{n}|x_i|\\right),\\qquad \\ln L=-n\\ln2-n\\ln\\sigma-\\frac{1}{\\sigma}\\sum_{i=1}^{n}|x_i|,$$\n$$\\frac{\\mathrm{d}\\ln L}{\\mathrm{d}\\sigma}=-\\frac{n}{\\sigma}+\\frac{1}{\\sigma^{2}}\\sum_{i=1}^{n}|x_i|=0\\ \\Longrightarrow\\ \\hat{\\sigma}=\\frac{1}{n}\\sum_{i=1}^{n}|X_i|.$$\n（Ⅱ）$E(\\hat{\\sigma})=\\sigma$，$D(\\hat{\\sigma})=\\dfrac{\\sigma^{2}}{n}$。由偶函数积分（令 $x\\ge0$）\n$$E|X|=\\int_{-\\infty}^{+\\infty}|x|\\frac{1}{2\\sigma}\\mathrm{e}^{-|x|/\\sigma}\\,\\mathrm{d}x=\\frac{1}{\\sigma}\\int_0^{+\\infty}x\\,\\mathrm{e}^{-x/\\sigma}\\,\\mathrm{d}x=\\sigma,$$\n$$E|X|^{2}=E(X^{2})=\\frac{1}{\\sigma}\\int_0^{+\\infty}x^{2}\\mathrm{e}^{-x/\\sigma}\\,\\mathrm{d}x=2\\sigma^{2},\\qquad D(|X|)=2\\sigma^{2}-\\sigma^{2}=\\sigma^{2},$$\n故 $E(\\hat{\\sigma})=\\frac{1}{n}\\cdot n\\,E|X|=\\sigma$，$D(\\hat{\\sigma})=\\frac{1}{n^{2}}\\cdot n\\,D(|X|)=\\frac{\\sigma^{2}}{n}$。",
      traps: "密度含 $|x|$，写似然时保留 $|x_i|$ 不要丢绝对值；$\\hat{\\sigma}$ 是样本 $|X_i|$ 的均值（不是 $\\frac1n\\sum X_i^2$ 之类），$E(\\hat\\sigma)=\\sigma$ 说明它无偏；$D(\\hat\\sigma)$ 要除以 $n$ 而不是 $n^2$。",
      hint: "先写似然并取对数对 $\\sigma$ 求导；再用 $\\int_0^\\infty x^k\\mathrm{e}^{-x/\\sigma}\\mathrm{d}x=k!\\,\\sigma^{k+1}$ 求 $E|X|,E|X|^2$，最后用独立同分布求均值与方差。",
      src: { file: "参考文件/真题/数学/5、【1987-2025年】考研数学三真题/3、2010-2022考研数学三真题.pdf", page: 20, no: "三(23)", note: "题面：合并册 p20 裁片逐字亲读（m3-1819-p20-hi2.png）。答案与《2018年数学三真题答案解析》p7 对拍（册上 $\\hat\\sigma=\\frac1n\\sum|X_i|$、$E(\\hat\\sigma)=\\sigma$、$D(\\hat\\sigma)=\\frac{\\sigma^2}{n}$），并独立重推似然方程与 $E|X|=\\sigma$、$E|X|^2=2\\sigma^2$，一致。" }
    },
    {
      id: "m3-2019-13", origin: "year", year: 2019, no: "二(13)", type: "linalg", star: 3, school: "全国硕士研究生招生考试-数学三 2019 年",
      tags: ["zb08","tp09","kn37"],
      stem: "已知矩阵 $\\boldsymbol{A}=\\begin{pmatrix}1&0&-1\\\\1&1&-1\\\\0&1&a^{2}-1\\end{pmatrix}$，$\\boldsymbol{b}=\\begin{pmatrix}0\\\\1\\\\a\\end{pmatrix}$，若线性方程组 $\\boldsymbol{A}\\boldsymbol{x}=\\boldsymbol{b}$ 有无穷多解，则 $a=$______.",
      answer: "填 $1$。对增广矩阵作初等行变换：\n$$\\bar{\\boldsymbol{A}}=\\begin{pmatrix}1&0&-1&\\vdots&0\\\\1&1&-1&\\vdots&1\\\\0&1&a^{2}-1&\\vdots&a\\end{pmatrix}\\to\\begin{pmatrix}1&0&-1&\\vdots&0\\\\0&1&0&\\vdots&1\\\\0&0&a^{2}-1&\\vdots&a-1\\end{pmatrix}.$$\n要有无穷多解须 $r(\\boldsymbol{A})=r(\\bar{\\boldsymbol{A}})<3$。令 $a^{2}-1=a-1=0$ 得 $a=1$，此时 $r(\\boldsymbol{A})=r(\\bar{\\boldsymbol{A}})=2<3$。另验 $a=-1$ 时最后一行为 $(0,0,0\\mid-2)$，方程组无解，须舍去。故 $a=1$。",
      traps: "由 $a^{2}-1=0$ 会解出 $a=\\pm1$，但增广列须同步为零：$a=-1$ 时 $a-1=-2\\ne0$，属无解，不是无穷多解。",
      hint: "把增广矩阵化为行阶梯形，令系数矩阵秩 = 增广矩阵秩 < 未知数个数 3，并逐一检验根是否让增广列同为零。",
      src: { file: "参考文件/真题/数学/5、【1987-2025年】考研数学三真题/3、2010-2022考研数学三真题.pdf", page: 14, no: "二(13)", note: "题面：合并册 p14 裁片逐字亲读（m3-1819-p14-hi1.png）；2019 卷首页 p13、卷范围 p13–p16 已亲读页眉确认。答案与《2019年数学三真题答案解析》p3 对拍（册上填 1）；册上直接令 a²−1=a−1=0 得 a=1，属跳步，独立重推补验 a=−1 时无解，结论一致。" }
    },
    {
      id: "m3-2019-14", origin: "year", year: 2019, no: "二(14)", type: "estimate", star: 3, school: "全国硕士研究生招生考试-数学三 2019 年",
      tags: ["zt04","tp02","int23"],
      stem: "设随机变量 $X$ 的概率密度为 $f(x)=\\begin{cases}\\dfrac{x}{2},&0<x<2,\\\\0,&\\text{其他},\\end{cases}$ $F(x)$ 为 $X$ 的分布函数，$E(X)$ 为 $X$ 的数学期望，则 $P\\{F(X)>E(X)-1\\}=$______.",
      answer: "填 $\\dfrac{2}{3}$。由 $f(x)$ 积分得\n$$F(x)=\\begin{cases}0,&x<0,\\\\\\dfrac{x^{2}}{4},&0\\le x<2,\\\\1,&x\\ge2,\\end{cases}\\qquad E(X)=\\int_0^{2}x\\cdot\\frac{x}{2}\\,\\mathrm{d}x=\\frac{4}{3}.$$\n于是 $E(X)-1=\\dfrac{1}{3}$，且在 $(0,2)$ 上 $F(x)=\\dfrac{x^{2}}{4}$ 单调增，故\n$$P\\{F(X)>E(X)-1\\}=P\\left\\{\\frac{X^{2}}{4}>\\frac{1}{3}\\right\\}=P\\left\\{X>\\frac{2}{\\sqrt3}\\right\\}=\\int_{2/\\sqrt3}^{2}\\frac{x}{2}\\,\\mathrm{d}x=\\frac{2}{3}.$$",
      traps: "$F(X)$ 是随机变量（取值落在 $[0,1]$），不是把 $F(x)$ 当自变量代入；须借 $F$ 在 $(0,2)$ 上的单调性把不等式反解成 $X>\\frac{2}{\\sqrt3}$ 再积分。",
      hint: "先由密度积分求出 $F(x)$ 与 $E(X)$，再把关于 $F(X)$ 的概率不等式等价化为关于 $X$ 的区间并积分。",
      src: { file: "参考文件/真题/数学/5、【1987-2025年】考研数学三真题/3、2010-2022考研数学三真题.pdf", page: 14, no: "二(14)", note: "题面：合并册 p14 裁片逐字亲读（m3-1819-p14-hi1.png）。答案与《2019年数学三真题答案解析》p3 对拍（册上填 2/3），并独立重推 $F(x)$、$E(X)=4/3$ 与积分，一致。" }
    },
    {
      id: "m3-2019-15", origin: "year", year: 2019, no: "三(15)", type: "deriv", star: 4, school: "全国硕士研究生招生考试-数学三 2019 年",
      tags: ["gx19","ext05","gx13","zt04"],
      stem: "已知函数 $f(x)=\\begin{cases}x^{2x},&x>0,\\\\x\\mathrm{e}^{x}+1,&x\\le0.\\end{cases}$ 求 $f'(x)$，并求 $f(x)$ 的极值。",
      answer: "$f'(x)=\\begin{cases}2x^{2x}(\\ln x+1),&x>0,\\\\\\mathrm{e}^{x}(x+1),&x<0,\\end{cases}$ 且 $f'(0)$ 不存在。因 $\\lim\\limits_{x\\to0^{+}}\\dfrac{x^{2x}-1}{x}=\\lim\\limits_{x\\to0^{+}}\\dfrac{\\mathrm{e}^{2x\\ln x}-1}{x}=\\lim\\limits_{x\\to0^{+}}\\dfrac{2x\\ln x}{x}=-\\infty$，故 $f'(0)$ 不存在。\n令 $f'(x)=0$ 得驻点 $x=-1$ 与 $x=\\dfrac{1}{\\mathrm{e}}$。当 $x<-1$ 或 $0<x<\\frac{1}{\\mathrm{e}}$ 时 $f'(x)<0$，当 $-1<x<0$ 或 $x>\\frac{1}{\\mathrm{e}}$ 时 $f'(x)>0$，故 $f$ 在 $(-\\infty,-1)$、$(0,\\frac{1}{\\mathrm{e}})$ 单调减少，在 $(-1,0)$、$(\\frac{1}{\\mathrm{e}},+\\infty)$ 单调增加。\n极小值为 $f(-1)=1-\\dfrac{1}{\\mathrm{e}}$ 与 $f\\left(\\dfrac{1}{\\mathrm{e}}\\right)=\\mathrm{e}^{-2/\\mathrm{e}}$，极大值为 $f(0)=1$。",
      traps: "$x^{2x}=\\mathrm{e}^{2x\\ln x}$ 求导得 $2x^{2x}(\\ln x+1)$，系数 2 不能漏；$x=0$ 虽连续（$\\lim_{x\\to0^+}x^{2x}=1=f(0)$）但右导数发散，是不可导的极大值点，不能用 $f'(0)=0$ 去找它。",
      hint: "$x>0$ 段用对数求导，$x<0$ 段直接求导；分界点 $x=0$ 用导数定义单独判断，再把驻点与不可导点一起列入单调性分段。",
      src: { file: "参考文件/真题/数学/5、【1987-2025年】考研数学三真题/3、2010-2022考研数学三真题.pdf", page: 14, no: "三(15)", note: "题面：合并册 p14 裁片逐字亲读（m3-1819-p14-hi1.png 与 p14-hi2.png）。答案与《2019年数学三真题答案解析》p3–p4 对拍；册上 $f'(x)=2x^{2x}(\\ln x+1)$ 含系数 2（经放大裁片 m3-1819-ans-2019-p3-q15.png 复核，初读整页曾疑漏 2），独立重推一致；极值 $f(-1)=1-1/\\mathrm{e}$、$f(1/\\mathrm{e})=\\mathrm{e}^{-2/\\mathrm{e}}$、$f(0)=1$ 逐步复核一致。" }
    },
    {
      id: "m3-2019-16", origin: "year", year: 2019, no: "三(16)", type: "multivar", star: 4, school: "全国硕士研究生招生考试-数学三 2019 年",
      tags: ["multi05","gx61","ext13"],
      stem: "设函数 $f(u,v)$ 具有 2 阶连续偏导数，函数 $g(x,y)=xy-f(x+y,x-y)$。求 $\\dfrac{\\partial^{2}g}{\\partial x^{2}}+\\dfrac{\\partial^{2}g}{\\partial x\\partial y}+\\dfrac{\\partial^{2}g}{\\partial y^{2}}$.",
      answer: "记 $u=x+y,\\;v=x-y$，由链式法则（$f$ 二阶偏导连续故 $f_{uv}=f_{vu}$，下式各偏导均在 $(x+y,x-y)$ 处取值）：\n$$\\frac{\\partial g}{\\partial x}=y-f_u-f_v,\\qquad \\frac{\\partial g}{\\partial y}=x-f_u+f_v,$$\n$$\\frac{\\partial^{2}g}{\\partial x^{2}}=-f_{uu}-2f_{uv}-f_{vv},\\qquad \\frac{\\partial^{2}g}{\\partial x\\partial y}=1-f_{uu}+f_{vv},\\qquad \\frac{\\partial^{2}g}{\\partial y^{2}}=-f_{uu}+2f_{uv}-f_{vv}.$$\n三式相加，$f_{uv}$ 项恰好抵消，得\n$$\\frac{\\partial^{2}g}{\\partial x^{2}}+\\frac{\\partial^{2}g}{\\partial x\\partial y}+\\frac{\\partial^{2}g}{\\partial y^{2}}=1-3f_{uu}(x+y,x-y)-f_{vv}(x+y,x-y).$$",
      traps: "$v=x-y$ 对 $y$ 的偏导是 $-1$，故 $\\frac{\\partial g}{\\partial y}$ 中 $f_v$ 项变号成 $+f_v$，与 $\\frac{\\partial g}{\\partial x}$ 的 $-f_v$ 不同；三项相加后混合偏导 $f_{uv}$ 抵消，余下是 $f_{uu}$（系数 $-3$）与 $f_{vv}$（系数 $-1$），勿写成 $f_{uv}$。",
      hint: "固定中间变量 $u=x+y,\\;v=x-y$，先求一阶偏导再逐项求二阶，利用 $f_{uv}=f_{vu}$ 合并同类项。",
      src: { file: "参考文件/真题/数学/5、【1987-2025年】考研数学三真题/3、2010-2022考研数学三真题.pdf", page: 14, no: "三(16)", note: "题面：合并册 p14 裁片逐字亲读（m3-1819-p14-hi1.png 与 p14-hi2.png）。答案与《2019年数学三真题答案解析》p4 对拍（册上结果 $1-3f_{uu}-f_{vv}$）；初读整页疑末项为 $f_{uv}$，经放大裁片 m3-1819-ans-2019-p4-q16.png 复核并独立重推三个二阶偏导，确认 $f_{uv}$ 抵消、末项为 $-f_{vv}$，与册一致。" }
    },
    {
      id: "m3-2019-17", origin: "year", year: 2019, no: "三(17)", type: "ode", star: 4, school: "全国硕士研究生招生考试-数学三 2019 年",
      tags: ["ode02","int29","tp07"],
      stem: "设函数 $y(x)$ 是微分方程 $y'-xy=\\dfrac{1}{2\\sqrt{x}}\\mathrm{e}^{\\frac{x^{2}}{2}}$ 满足条件 $y(1)=\\sqrt{\\mathrm{e}}$ 的特解。\n（Ⅰ）求 $y(x)$；\n（Ⅱ）设平面区域 $D=\\{(x,y)\\mid1\\le x\\le2,\\;0\\le y\\le y(x)\\}$，求 $D$ 绕 $x$ 轴旋转所得旋转体的体积。",
      answer: "（Ⅰ）$y(x)=\\sqrt{x}\\,\\mathrm{e}^{x^{2}/2}$。由一阶线性方程通解公式\n$$y(x)=\\mathrm{e}^{\\int x\\,\\mathrm{d}x}\\left(C+\\int\\frac{1}{2\\sqrt{x}}\\mathrm{e}^{x^{2}/2}\\mathrm{e}^{-\\int x\\,\\mathrm{d}x}\\,\\mathrm{d}x\\right)=\\mathrm{e}^{x^{2}/2}\\left(C+\\int\\frac{\\mathrm{d}x}{2\\sqrt{x}}\\right)=\\mathrm{e}^{x^{2}/2}(\\sqrt{x}+C).$$\n代入 $y(1)=\\sqrt{\\mathrm{e}}$ 得 $\\mathrm{e}^{1/2}(1+C)=\\mathrm{e}^{1/2}$，故 $C=0$。\n（Ⅱ）$V=\\dfrac{\\pi}{2}(\\mathrm{e}^{4}-\\mathrm{e})$。由 $y^{2}(x)=x\\,\\mathrm{e}^{x^{2}}$，\n$$V=\\pi\\int_1^{2}y^{2}(x)\\,\\mathrm{d}x=\\pi\\int_1^{2}x\\,\\mathrm{e}^{x^{2}}\\,\\mathrm{d}x=\\frac{\\pi}{2}\\mathrm{e}^{x^{2}}\\Big|_1^{2}=\\frac{\\pi}{2}(\\mathrm{e}^{4}-\\mathrm{e}).$$",
      traps: "积分因子 $\\mathrm{e}^{\\int x\\mathrm{d}x}=\\mathrm{e}^{x^{2}/2}$ 与右端 $\\mathrm{e}^{x^{2}/2}$ 恰好约去，剩下 $\\int\\frac{\\mathrm{d}x}{2\\sqrt{x}}=\\sqrt{x}$；旋转体体积用 $V=\\pi\\int y^{2}\\mathrm{d}x$，$y^{2}=x\\mathrm{e}^{x^{2}}$（指数是 $x^{2}$ 不是 $x$）。",
      hint: "先按一阶线性方程通解公式求 $y(x)$ 并用初值定 $C$，再代入旋转体体积公式。",
      src: { file: "参考文件/真题/数学/5、【1987-2025年】考研数学三真题/3、2010-2022考研数学三真题.pdf", page: 14, no: "三(17)", note: "题面：合并册 p14 裁片逐字亲读（m3-1819-p14-hi2.png）。答案与《2019年数学三真题答案解析》p4 对拍（册上 $y=\\sqrt{x}\\mathrm{e}^{x^2/2}$、$V=\\frac{\\pi}{2}(\\mathrm{e}^4-\\mathrm{e})$），并独立重推通解与体积积分，一致。" }
    },
    {
      id: "m3-2019-18", origin: "year", year: 2019, no: "三(18)", type: "integral", star: 4, school: "全国硕士研究生招生考试-数学三 2019 年",
      tags: ["int28","wr03","ser03"],
      stem: "求曲线 $y=\\mathrm{e}^{-x}\\sin x\\ (x\\ge0)$ 与 $x$ 轴之间图形的面积。",
      answer: "$S=\\dfrac{\\mathrm{e}^{\\pi}+1}{2(\\mathrm{e}^{\\pi}-1)}$。因 $\\sin x$ 在 $[n\\pi,(n+1)\\pi]$ 上符号交替，面积须取绝对值：\n$$S=\\int_0^{+\\infty}\\mathrm{e}^{-x}|\\sin x|\\,\\mathrm{d}x=\\sum_{n=0}^{\\infty}(-1)^{n}\\int_{n\\pi}^{(n+1)\\pi}\\mathrm{e}^{-x}\\sin x\\,\\mathrm{d}x.$$\n由 $\\int\\mathrm{e}^{-x}\\sin x\\,\\mathrm{d}x=-\\frac{\\mathrm{e}^{-x}}{2}(\\sin x+\\cos x)$ 得 $\\int_{n\\pi}^{(n+1)\\pi}\\mathrm{e}^{-x}\\sin x\\,\\mathrm{d}x=\\frac{(-1)^{n}}{2}\\left[\\mathrm{e}^{-(n+1)\\pi}+\\mathrm{e}^{-n\\pi}\\right]$，故\n$$S=\\frac{1}{2}\\sum_{n=0}^{\\infty}\\left[\\mathrm{e}^{-n\\pi}+\\mathrm{e}^{-(n+1)\\pi}\\right]=\\frac{1}{2}\\cdot\\frac{1+\\mathrm{e}^{-\\pi}}{1-\\mathrm{e}^{-\\pi}}=\\frac{\\mathrm{e}^{\\pi}+1}{2(\\mathrm{e}^{\\pi}-1)}.$$",
      traps: "面积是对 $|\\sin x|$ 积分，$\\int_0^\\infty \\mathrm{e}^{-x}\\sin x\\,\\mathrm{d}x$ 只是交错和而非面积；每段积分的符号 $(-1)^n$ 与外层 $(-1)^n$ 相乘后全变正，最后是两个等比级数求和。",
      hint: "按 $\\sin x$ 的每个半周期分段，把反常积分写成级数，再对公比 $\\mathrm{e}^{-\\pi}$ 的等比级数求和。",
      src: { file: "参考文件/真题/数学/5、【1987-2025年】考研数学三真题/3、2010-2022考研数学三真题.pdf", page: 15, no: "三(18)", note: "题面：合并册 p15 裁片逐字亲读（m3-1819-p15-hi1.png）。答案与《2019年数学三真题答案解析》p4 对拍（册上 $S=\\frac{\\mathrm{e}^\\pi+1}{2(\\mathrm{e}^\\pi-1)}$），并独立重推分段积分与等比级数求和，一致。" }
    },
    {
      id: "m3-2019-19", origin: "year", year: 2019, no: "三(19)", type: "limit", star: 4, school: "全国硕士研究生招生考试-数学三 2019 年",
      tags: ["lim12","lim13","int24","zb02"],
      stem: "设 $a_n=\\int_0^{1}x^{n}\\sqrt{1-x^{2}}\\,\\mathrm{d}x\\ (n=0,1,2,\\cdots)$。\n（Ⅰ）证明数列 $\\{a_n\\}$ 单调递减，且 $a_n=\\dfrac{n-1}{n+2}a_{n-2}\\ (n=2,3,\\cdots)$；\n（Ⅱ）求 $\\lim\\limits_{n\\to\\infty}\\dfrac{a_n}{a_{n-1}}$.",
      answer: "（Ⅰ）$a_{n+1}-a_n=\\int_0^{1}x^{n}(x-1)\\sqrt{1-x^{2}}\\,\\mathrm{d}x<0$（被积函数在 $[0,1]$ 上 $\\le0$ 且不恒为 0），故 $\\{a_n\\}$ 单调递减。当 $n\\ge2$ 时，由 $\\mathrm{d}(1-x^{2})^{3/2}=-3x\\sqrt{1-x^{2}}\\,\\mathrm{d}x$ 分部积分：\n$$a_n=-\\frac{1}{3}x^{n-1}(1-x^{2})^{3/2}\\Big|_0^{1}+\\frac{n-1}{3}\\int_0^{1}x^{n-2}(1-x^{2})^{3/2}\\,\\mathrm{d}x=\\frac{n-1}{3}(a_{n-2}-a_n),$$\n整理得 $a_n=\\dfrac{n-1}{n+2}a_{n-2}$。（Ⅱ）$\\lim\\limits_{n\\to\\infty}\\dfrac{a_n}{a_{n-1}}=1$。由递推 $\\dfrac{a_n}{a_{n-1}}=\\dfrac{n-1}{n+2}\\cdot\\dfrac{a_{n-2}}{a_{n-1}}$，又 $a_n>0$ 且 $\\{a_n\\}$ 单调递减，故 $\\dfrac{n-1}{n+2}<\\dfrac{a_n}{a_{n-1}}<1$，由夹逼准则得极限为 $1$。",
      traps: "递推分部积分时把 $(1-x^{2})^{3/2}$ 拆成 $(1-x^{2})\\sqrt{1-x^{2}}$，才能化回 $a_{n-2}$ 与 $a_n$；求极限不必算出 $a_n$ 的闭式，用单调性夹逼即可。",
      hint: "单调性直接比较被积函数 $x^{n}(x-1)\\sqrt{1-x^2}$ 的符号；递推用分部积分；极限用 $\\frac{n-1}{n+2}<\\frac{a_n}{a_{n-1}}<1$ 夹逼。",
      src: { file: "参考文件/真题/数学/5、【1987-2025年】考研数学三真题/3、2010-2022考研数学三真题.pdf", page: 15, no: "三(19)", note: "题面：合并册 p15 裁片逐字亲读（m3-1819-p15-hi1.png）。答案与《2019年数学三真题答案解析》p5 对拍（册上递推 $a_n=\\frac{n-1}{n+2}a_{n-2}$、极限为 1），并独立重推分部积分与夹逼，一致。" }
    },
    {
      id: "m3-2019-20", origin: "year", year: 2019, no: "三(20)", type: "linalg", star: 4, school: "全国硕士研究生招生考试-数学三 2019 年",
      tags: ["zb07","kn27","zt05"],
      stem: "已知向量组 Ⅰ：$\\boldsymbol{\\alpha}_1=\\begin{pmatrix}1\\\\1\\\\4\\end{pmatrix},\\ \\boldsymbol{\\alpha}_2=\\begin{pmatrix}1\\\\0\\\\4\\end{pmatrix},\\ \\boldsymbol{\\alpha}_3=\\begin{pmatrix}1\\\\2\\\\a^{2}+3\\end{pmatrix}$ 与 Ⅱ：$\\boldsymbol{\\beta}_1=\\begin{pmatrix}1\\\\1\\\\a+3\\end{pmatrix},\\ \\boldsymbol{\\beta}_2=\\begin{pmatrix}0\\\\2\\\\1-a\\end{pmatrix},\\ \\boldsymbol{\\beta}_3=\\begin{pmatrix}1\\\\3\\\\a^{2}+3\\end{pmatrix}$。若向量组 Ⅰ 与 Ⅱ 等价，求 $a$ 的取值，并将 $\\boldsymbol{\\beta}_3$ 用 $\\boldsymbol{\\alpha}_1,\\boldsymbol{\\alpha}_2,\\boldsymbol{\\alpha}_3$ 线性表示。",
      answer: "$a\\ne-1$。等价须两组能互相线性表示。行变换得\n$$(\\boldsymbol{\\alpha}_1,\\boldsymbol{\\alpha}_2,\\boldsymbol{\\alpha}_3,\\boldsymbol{\\beta}_1,\\boldsymbol{\\beta}_2,\\boldsymbol{\\beta}_3)\\to\\begin{pmatrix}1&1&1&\\vdots&1&0&1\\\\0&-1&1&\\vdots&0&2&2\\\\0&0&a^{2}-1&\\vdots&a-1&1-a&a^{2}-1\\end{pmatrix},$$\n$$(\\boldsymbol{\\beta}_1,\\boldsymbol{\\beta}_2,\\boldsymbol{\\beta}_3,\\boldsymbol{\\alpha}_1,\\boldsymbol{\\alpha}_2,\\boldsymbol{\\alpha}_3)\\to\\begin{pmatrix}1&0&1&\\vdots&1&1&1\\\\0&2&2&\\vdots&0&-1&1\\\\0&0&a^{2}-1&\\vdots&1-a&\\frac{3}{2}(1-a)&\\frac{2a^{2}-a-1}{2}\\end{pmatrix}.$$\n$a=-1$ 时 $r(\\boldsymbol{\\alpha}_1,\\boldsymbol{\\alpha}_2,\\boldsymbol{\\alpha}_3)=2<r(\\boldsymbol{\\alpha}_1,\\boldsymbol{\\alpha}_2,\\boldsymbol{\\alpha}_3,\\boldsymbol{\\beta}_1,\\boldsymbol{\\beta}_2,\\boldsymbol{\\beta}_3)=3$，不等价；$a=1$ 时两组秩同为 2，$a\\ne\\pm1$ 时两组秩同为 3，均可互相线性表示。故等价 $\\iff a\\ne-1$。\n$\\boldsymbol{\\beta}_3$ 的表示：当 $a\\ne\\pm1$ 时 $\\boldsymbol{\\beta}_3=\\boldsymbol{\\alpha}_1-\\boldsymbol{\\alpha}_2+\\boldsymbol{\\alpha}_3$；当 $a=1$ 时 $\\boldsymbol{\\beta}_3=(3-2k)\\boldsymbol{\\alpha}_1+(k-2)\\boldsymbol{\\alpha}_2+k\\boldsymbol{\\alpha}_3$（$k$ 为任意常数）。",
      traps: "「等价」是双向的：既要 Ⅱ 可由 Ⅰ 表示，也要 Ⅰ 可由 Ⅱ 表示，须两个增广矩阵都判秩；$a=1$ 时 Ⅰ 线性相关，$\\boldsymbol{\\beta}_3$ 的表示不唯一，要带任意常数 $k$。",
      hint: "对 $(\\boldsymbol{\\alpha}_1,\\boldsymbol{\\alpha}_2,\\boldsymbol{\\alpha}_3\\mid\\boldsymbol{\\beta}_1,\\boldsymbol{\\beta}_2,\\boldsymbol{\\beta}_3)$ 与反过来的矩阵分别化行阶梯形，比较秩；再解 $(\\boldsymbol{\\alpha}_1,\\boldsymbol{\\alpha}_2,\\boldsymbol{\\alpha}_3)\\boldsymbol{x}=\\boldsymbol{\\beta}_3$。",
      src: { file: "参考文件/真题/数学/5、【1987-2025年】考研数学三真题/3、2010-2022考研数学三真题.pdf", page: 15, no: "三(20)", note: "题面：合并册 p15 裁片逐字亲读（m3-1819-p15-hi2.png）。答案与《2019年数学三真题答案解析》p5–p6 对拍（册上 $a\\ne-1$；$a\\ne\\pm1$ 时 $\\beta_3=\\alpha_1-\\alpha_2+\\alpha_3$，$a=1$ 时 $\\beta_3=(3-2k)\\alpha_1+(k-2)\\alpha_2+k\\alpha_3$），并独立验证 $\\alpha_1-\\alpha_2+\\alpha_3=(1,3,a^2+3)^\\mathrm{T}=\\beta_3$ 对任意 $a$ 恒成立、$a=1$ 时通解系数，一致。" }
    },
    {
      id: "m3-2019-21", origin: "year", year: 2019, no: "三(21)", type: "eigen", star: 4, school: "全国硕士研究生招生考试-数学三 2019 年",
      tags: ["zb25","la12","tp04"],
      stem: "已知矩阵 $\\boldsymbol{A}=\\begin{pmatrix}-2&-2&1\\\\2&x&-2\\\\0&0&-2\\end{pmatrix}$ 与 $\\boldsymbol{B}=\\begin{pmatrix}2&1&0\\\\0&-1&0\\\\0&0&y\\end{pmatrix}$ 相似。\n（Ⅰ）求 $x,y$；\n（Ⅱ）求可逆矩阵 $\\boldsymbol{P}$，使得 $\\boldsymbol{P}^{-1}\\boldsymbol{A}\\boldsymbol{P}=\\boldsymbol{B}$.",
      answer: "（Ⅰ）$x=3,\\;y=-2$。相似则迹与行列式相等：$\\mathrm{tr}(\\boldsymbol{A})=x-4=\\mathrm{tr}(\\boldsymbol{B})=y+1$，$|\\boldsymbol{A}|=4x-8=|\\boldsymbol{B}|=-2y$，解得 $x=3,\\,y=-2$。\n（Ⅱ）$\\boldsymbol{B}$（上三角）的特征值为 $2,-1,-2$，由相似 $\\boldsymbol{A}$ 同特征值。取特征向量\n$$\\boldsymbol{A}:\\;\\xi_1=(1,-2,0)^{\\mathrm{T}},\\ \\xi_2=(-2,1,0)^{\\mathrm{T}},\\ \\xi_3=(1,-2,-4)^{\\mathrm{T}};\\qquad \\boldsymbol{B}:\\;\\eta_1=(1,0,0)^{\\mathrm{T}},\\ \\eta_2=(1,-3,0)^{\\mathrm{T}},\\ \\eta_3=(0,0,1)^{\\mathrm{T}}.$$\n记 $\\boldsymbol{P}_1=(\\xi_1,\\xi_2,\\xi_3)$、$\\boldsymbol{P}_2=(\\eta_1,\\eta_2,\\eta_3)$，则 $\\boldsymbol{P}_1^{-1}\\boldsymbol{A}\\boldsymbol{P}_1=\\boldsymbol{P}_2^{-1}\\boldsymbol{B}\\boldsymbol{P}_2=\\mathrm{diag}(2,-1,-2)$，故取\n$$\\boldsymbol{P}=\\boldsymbol{P}_1\\boldsymbol{P}_2^{-1}=\\begin{pmatrix}1&-2&1\\\\-2&1&-2\\\\0&0&-4\\end{pmatrix}\\begin{pmatrix}1&\\frac13&0\\\\0&-\\frac13&0\\\\0&0&1\\end{pmatrix}=\\begin{pmatrix}1&1&1\\\\-2&-1&-2\\\\0&0&-4\\end{pmatrix},$$\n满足 $\\boldsymbol{P}^{-1}\\boldsymbol{A}\\boldsymbol{P}=\\boldsymbol{B}$（$\\boldsymbol{P}$ 不唯一）。",
      traps: "求 $x,y$ 用 $\\mathrm{tr}$ 与 $|\\cdot|$ 两个不变量即可，不必硬解特征多项式；第（Ⅱ）问要 $\\boldsymbol{P}^{-1}\\boldsymbol{A}\\boldsymbol{P}=\\boldsymbol{B}$ 而非对角阵，故须把 $\\boldsymbol{A},\\boldsymbol{B}$ 各自的特征向量阵按同一特征值顺序配成 $\\boldsymbol{P}_1\\boldsymbol{P}_2^{-1}$。",
      hint: "先由相似不变量定 $x,y$；再分别求 $\\boldsymbol{A},\\boldsymbol{B}$ 关于 $2,-1,-2$ 的特征向量，用 $\\boldsymbol{P}=\\boldsymbol{P}_1\\boldsymbol{P}_2^{-1}$ 过渡。",
      src: { file: "参考文件/真题/数学/5、【1987-2025年】考研数学三真题/3、2010-2022考研数学三真题.pdf", page: 16, no: "三(21)", note: "题面：合并册 p16 裁片逐字亲读（m3-1819-p16-hi1.png）。答案与《2019年数学三真题答案解析》p6 对拍（册上 $x=3,y=-2$ 及 $\\boldsymbol{P}=\\begin{pmatrix}1&1&1\\\\-2&-1&-2\\\\0&0&-4\\end{pmatrix}$），并独立求解特征向量、核验 $\\boldsymbol{A}\\boldsymbol{P}=\\boldsymbol{P}\\boldsymbol{B}$，一致。" }
    },
    {
      id: "m3-2019-22", origin: "year", year: 2019, no: "三(22)", type: "estimate", star: 4, school: "全国硕士研究生招生考试-数学三 2019 年",
      tags: ["int23","tp02","zt05"],
      stem: "设随机变量 $X$ 与 $Y$ 相互独立，$X$ 服从参数为 $1$ 的指数分布，$Y$ 的概率分布为 $P\\{Y=-1\\}=p$，$P\\{Y=1\\}=1-p\\ (0<p<1)$。令 $Z=XY$。\n（Ⅰ）求 $Z$ 的概率密度；\n（Ⅱ）$p$ 为何值时，$X$ 与 $Z$ 不相关；\n（Ⅲ）$X$ 与 $Z$ 是否相互独立？",
      answer: "（Ⅰ）$f_Z(z)=\\begin{cases}p\\,\\mathrm{e}^{z},&z<0,\\\\(1-p)\\mathrm{e}^{-z},&z\\ge0.\\end{cases}$ 由全概率公式（$X\\ge0$，参数为 1 的指数分布）：\n$$F_Z(z)=p\\,P\\{-X\\le z\\}+(1-p)P\\{X\\le z\\}=\\begin{cases}p\\,\\mathrm{e}^{z},&z<0,\\\\1-(1-p)\\mathrm{e}^{-z},&z\\ge0,\\end{cases}$$\n求导即得密度。（Ⅱ）$p=\\dfrac{1}{2}$。$E(X)=1,\\;D(X)=1,\\;E(X^{2})=2,\\;E(Y)=1-2p$，由独立性\n$$\\mathrm{Cov}(X,Z)=E(X^{2}Y)-E(X)E(XY)=E(X^{2})E(Y)-(E(X))^{2}E(Y)=D(X)\\,E(Y)=1-2p,$$\n令其为 0 得 $p=\\frac{1}{2}$。（Ⅲ）不相互独立。因 $P\\{X\\le1,\\;Z\\le-1\\}=P\\{X\\le1,\\;XY\\le-1\\}=0$，而 $P\\{X\\le1\\}>0$、$P\\{Z\\le-1\\}>0$，故联合概率不等于边缘概率之积。",
      traps: "$Z=XY$ 因 $Y$ 取 $\\pm1$ 而可正可负，密度是 $z<0$ 与 $z\\ge0$ 两段（$z<0$ 只可能来自 $Y=-1$，指数 $\\mathrm{e}^{z}$ 而非 $\\mathrm{e}^{-z}$）；不相关只需 $\\mathrm{Cov}=0$，与独立不等价。",
      hint: "用全概率公式按 $Y=-1,1$ 拆 $F_Z(z)$ 再求导；协方差用 $\\mathrm{Cov}(X,Z)=D(X)E(Y)$ 化简；独立性找一个联合概率为 0 而边缘概率均正的事件。",
      src: { file: "参考文件/真题/数学/5、【1987-2025年】考研数学三真题/3、2010-2022考研数学三真题.pdf", page: 16, no: "三(22)", note: "题面：合并册 p16 裁片逐字亲读（m3-1819-p16-hi1.png）。答案与《2019年数学三真题答案解析》p6–p7 对拍（册上 $f_Z(z)$ 两段、$p=1/2$、不独立），并独立重推 $F_Z$、$\\mathrm{Cov}=1-2p$ 与独立性的反例事件，一致。" }
    },
    {
      id: "m3-2019-23", origin: "year", year: 2019, no: "三(23)", type: "estimate", star: 4, school: "全国硕士研究生招生考试-数学三 2019 年",
      tags: ["int23","tp02","zt04"],
      stem: "设总体 $X$ 的概率密度为\n$$f(x;\\sigma^{2})=\\begin{cases}\\dfrac{A}{\\sigma}\\mathrm{e}^{-\\frac{(x-\\mu)^{2}}{2\\sigma^{2}}},&x\\ge\\mu,\\\\0,&x<\\mu,\\end{cases}$$\n其中 $\\mu$ 是已知参数，$\\sigma>0$ 是未知参数，$A$ 是常数。$X_1,X_2,\\cdots,X_n$ 是来自总体 $X$ 的简单随机样本。\n（Ⅰ）求 $A$；\n（Ⅱ）求 $\\sigma^{2}$ 的最大似然估计量。",
      answer: "（Ⅰ）$A=\\sqrt{\\dfrac{2}{\\pi}}$。由归一性，令 $t=\\dfrac{x-\\mu}{\\sigma}$：\n$$1=\\int_{\\mu}^{+\\infty}\\frac{A}{\\sigma}\\mathrm{e}^{-\\frac{(x-\\mu)^{2}}{2\\sigma^{2}}}\\,\\mathrm{d}x=A\\int_0^{+\\infty}\\mathrm{e}^{-t^{2}/2}\\,\\mathrm{d}t=A\\cdot\\frac{\\sqrt{2\\pi}}{2},$$\n故 $A=\\sqrt{2/\\pi}$。（Ⅱ）$\\widehat{\\sigma^{2}}=\\dfrac{1}{n}\\sum\\limits_{i=1}^{n}(X_i-\\mu)^{2}$。似然函数（$x_i\\ge\\mu$）\n$$L(\\sigma^{2})=\\left(\\frac{2}{\\pi}\\right)^{n/2}(\\sigma^{2})^{-n/2}\\exp\\left(-\\frac{1}{2\\sigma^{2}}\\sum_{i=1}^{n}(x_i-\\mu)^{2}\\right),\\qquad \\ln L=\\frac{n}{2}\\ln\\frac{2}{\\pi}-\\frac{n}{2}\\ln\\sigma^{2}-\\frac{1}{2\\sigma^{2}}\\sum_{i=1}^{n}(x_i-\\mu)^{2},$$\n$$\\frac{\\mathrm{d}\\ln L}{\\mathrm{d}\\sigma^{2}}=-\\frac{n}{2\\sigma^{2}}+\\frac{1}{2\\sigma^{4}}\\sum_{i=1}^{n}(x_i-\\mu)^{2}=0\\ \\Longrightarrow\\ \\widehat{\\sigma^{2}}=\\frac{1}{n}\\sum_{i=1}^{n}(X_i-\\mu)^{2}.$$",
      traps: "这是「半正态」型密度（只在 $x\\ge\\mu$ 非零），故 $\\int_0^\\infty \\mathrm{e}^{-t^2/2}\\mathrm{d}t=\\frac{\\sqrt{2\\pi}}{2}$ 而不是 $\\sqrt{2\\pi}$，$A=\\sqrt{2/\\pi}$；待估参数是 $\\sigma^{2}$，把 $\\sigma^{2}$ 整体当变量求导更省事。",
      hint: "先用 $\\int f=1$ 定 $A$（换元到标准正态半轴积分），再写似然、取对数、对 $\\sigma^{2}$ 求导令零。",
      src: { file: "参考文件/真题/数学/5、【1987-2025年】考研数学三真题/3、2010-2022考研数学三真题.pdf", page: 16, no: "三(23)", note: "题面：合并册 p16 裁片逐字亲读（m3-1819-p16-hi2.png）。答案与《2019年数学三真题答案解析》p7 对拍（册上 $A=\\sqrt{2/\\pi}$、$\\widehat{\\sigma^2}=\\frac1n\\sum(X_i-\\mu)^2$），并独立重推归一性积分与似然方程，一致。" }
    },
    {
      id: "m3-2026-1", origin: "year", year: 2026, no: "一(1)", type: "deriv", star: 3, school: "全国硕士研究生招生考试-数学三 2026 年",
      tags: ["ext06","gx56"],
      stem: "曲线 $y=x\\mathrm{e}^{\\frac{1}{x}}$（ ）",
      options: ["无水平渐近线，无铅直渐近线","有水平渐近线，有铅直渐近线","无水平渐近线，有铅直渐近线","有水平渐近线，无铅直渐近线"],
      answer: "选 C。\n① 水平渐近线：$x\\to\\pm\\infty$ 时 $\\dfrac1x\\to0$，$\\mathrm{e}^{1/x}\\to1$，故 $y\\sim x\\to\\pm\\infty$，没有水平渐近线。\n② 铅直渐近线：$x\\to0^{+}$ 时令 $t=\\dfrac1x\\to+\\infty$，则 $y=\\dfrac{\\mathrm{e}^{t}}{t}\\to+\\infty$，故 $x=0$ 是铅直渐近线（$x\\to0^{-}$ 时 $y\\to0$，只要单侧发散即为铅直渐近线）。\n综上：无水平渐近线、有铅直渐近线，选 C。",
      traps: "把 $x\\to0^{-}$ 时 $y\\to0$ 误判成「$x=0$ 不是渐近线」——铅直渐近线只要求单侧极限为无穷。另注意 $y\\sim x$ 说明的是**斜**渐近线方向发散，不能因此选「有水平渐近线」。",
      hint: "先算 $x\\to\\pm\\infty$ 的极限判水平渐近线，再算 $x\\to0^{\\pm}$ 的单侧极限判铅直渐近线。",
      src: { file: "参考文件/真题/数学/2026年考研数学三真题及答案解析.pdf", page: 1, no: "一(1)", note: "题面取自 w3k-pics/p01.png（170 dpi 整页亲读，选择题区四选项文字核对）；册页眉作「2026 年全国硕士研究生入学统一考试数学(三)试题」，school 按官方科目代码 303 与 2023–2025 口径统一记为「招生考试」（见 W3K-SLICE-SPEC.md §4.1）。答案与 2026 参考解析 p4（【答案】C；$\\lim_{x\\to\\pm\\infty}y=\\infty$ 故无水平渐近线，$\\lim_{x\\to0^{+}}y=\\infty$ 故 $x=0$ 为铅直渐近线）对拍，独立重推一致。" }
    },
    {
      id: "m3-2026-2", origin: "year", year: 2026, no: "一(2)", type: "multivar", star: 4, school: "全国硕士研究生招生考试-数学三 2026 年",
      tags: ["multi02","ext14"],
      stem: "设 $z=z(x,y)$ 由方程 $x-az=\\mathrm{e}^{y+az}$（$a$ 是非零常数）确定，则（ ）",
      options: ["$\\dfrac{\\partial z}{\\partial x}-\\dfrac{\\partial z}{\\partial y}=\\dfrac{1}{a}$","$\\dfrac{\\partial z}{\\partial x}+\\dfrac{\\partial z}{\\partial y}=\\dfrac{1}{a}$","$\\dfrac{\\partial z}{\\partial x}-\\dfrac{\\partial z}{\\partial y}=-\\dfrac{1}{a}$","$\\dfrac{\\partial z}{\\partial x}+\\dfrac{\\partial z}{\\partial y}=-\\dfrac{1}{a}$"],
      answer: "选 A。记 $F(x,y,z)=x-az-\\mathrm{e}^{y+az}$，则\n$$F_x=1,\\qquad F_y=-\\mathrm{e}^{y+az},\\qquad F_z=-a-a\\mathrm{e}^{y+az}=-a\\left(1+\\mathrm{e}^{y+az}\\right).$$\n由隐函数求偏导公式\n$$\\frac{\\partial z}{\\partial x}=-\\frac{F_x}{F_z}=\\frac{1}{a\\left(1+\\mathrm{e}^{y+az}\\right)},\\qquad \\frac{\\partial z}{\\partial y}=-\\frac{F_y}{F_z}=-\\frac{\\mathrm{e}^{y+az}}{a\\left(1+\\mathrm{e}^{y+az}\\right)}.$$\n相减得\n$$\\frac{\\partial z}{\\partial x}-\\frac{\\partial z}{\\partial y}=\\frac{1+\\mathrm{e}^{y+az}}{a\\left(1+\\mathrm{e}^{y+az}\\right)}=\\frac1a,$$\n选 A。",
      traps: "$F_z$ 里 $z$ 出现两次（$-az$ 与指数上的 $az$），必须合并成 $-a\\left(1+\\mathrm{e}^{y+az}\\right)$；漏掉指数项会得 $\\dfrac{\\partial z}{\\partial x}=-\\dfrac1a$ 而误选 C。$F_y$ 带负号，代公式时与 $-\\dfrac{F_y}{F_z}$ 的负号相消，别丢这个正负。",
      hint: "用隐函数求偏导公式 $z_x=-\\dfrac{F_x}{F_z}$、$z_y=-\\dfrac{F_y}{F_z}$，再把两式相减。",
      src: { file: "参考文件/真题/数学/2026年考研数学三真题及答案解析.pdf", page: 1, no: "一(2)", note: "题面取自 w3k-pics/p01.png 亲读（放大核对指数 $y+az$ 与「$a$ 是非零常数」）；答案与 2026 参考解析 p4（【答案】A，册上给出全微分法、隐函数公式法、两边求导法三条路径，均得 $z_x-z_y=\\dfrac1a$）对拍，独立重推一致。" }
    },
    {
      id: "m3-2026-3", origin: "year", year: 2026, no: "一(3)", type: "integral", star: 3, school: "全国硕士研究生招生考试-数学三 2026 年",
      tags: ["int25","dr05"],
      stem: "已知函数 $f(x)=\\displaystyle\\int_1^{x^{3}}\\frac{\\mathrm{e}^{t}}{1+t^{2}}\\,\\mathrm{d}t$，$g(x)$ 是 $f(x)$ 的反函数，则（ ）",
      options: ["$g(0)=1,\\ g'(0)=\\dfrac{3\\mathrm{e}}{2}$","$g(0)=1,\\ g'(0)=\\dfrac{2}{3\\mathrm{e}}$","$g(1)=0,\\ g'(1)=\\dfrac{3\\mathrm{e}}{2}$","$g(1)=0,\\ g'(1)=\\dfrac{2}{3\\mathrm{e}}$"],
      answer: "选 B。\n① 定对应点：$f(1)=\\displaystyle\\int_1^{1}\\frac{\\mathrm{e}^{t}}{1+t^{2}}\\mathrm{d}t=0$，故反函数满足 $g(0)=1$。\n② 求 $f'(1)$：变上限求导\n$$f'(x)=\\frac{\\mathrm{e}^{x^{3}}}{1+x^{6}}\\cdot3x^{2},\\qquad f'(1)=\\frac{3\\mathrm{e}}{2}.$$\n③ 反函数求导：$g'(0)=\\dfrac{1}{f'(1)}=\\dfrac{2}{3\\mathrm{e}}$，选 B。",
      traps: "反函数求导是取倒数 $g'(y_0)=\\dfrac{1}{f'(x_0)}$，直接把 $f'(1)=\\dfrac{3\\mathrm{e}}{2}$ 当答案会误选 A。变上限 $x^{3}$ 求导要乘链式因子 $3x^{2}$，漏掉会算出 $\\dfrac{\\mathrm{e}}{2}$ 一类的错值。",
      hint: "先由 $f(1)=0$ 定出 $g(0)=1$，再算 $f'(1)$ 并取倒数。",
      src: { file: "参考文件/真题/数学/2026年考研数学三真题及答案解析.pdf", page: 1, no: "一(3)", note: "题面取自 w3k-pics/p01.png 亲读（上限 $x^{3}$、被积函数 $\\dfrac{\\mathrm{e}^{t}}{1+t^{2}}$、下限 1 均放大核对）；答案与 2026 参考解析 p5（【答案】B；$f(1)=0$，$g'(0)=\\dfrac{1}{f'(1)}$，$f'(x)=3x^{2}\\dfrac{\\mathrm{e}^{x^{3}}}{1+x^{6}}$，$f'(1)=\\dfrac{3\\mathrm{e}}{2}$）对拍，独立重推一致。" }
    },
    {
      id: "m3-2026-4", origin: "year", year: 2026, no: "一(4)", type: "econ", star: 4, school: "全国硕士研究生招生考试-数学三 2026 年",
      tags: ["ext21","int24"],
      stem: "设 $t$ 时刻某证券的交易单价为 $p(t)$，某机构持有该证券的份额为 $q(t)$，若该机构在 $t\\in[0,T]$ 持续购入一定份额该证券，则这些证券的平均购入价格为（ ）",
      options: ["$\\dfrac{1}{T}\\displaystyle\\int_0^{T}p(t)\\,\\mathrm{d}t$","$\\dfrac{1}{q(T)-q(0)}\\displaystyle\\int_0^{T}p(t)\\,\\mathrm{d}t$","$\\dfrac{1}{T}\\displaystyle\\int_0^{T}p(t)q'(t)\\,\\mathrm{d}t$","$\\dfrac{1}{q(T)-q(0)}\\displaystyle\\int_0^{T}p(t)q'(t)\\,\\mathrm{d}t$"],
      answer: "选 D。在微元 $[t,t+\\mathrm{d}t]$ 内购入的份额为 $\\mathrm{d}q=q'(t)\\,\\mathrm{d}t$，付出金额为 $p(t)\\,\\mathrm{d}q=p(t)q'(t)\\,\\mathrm{d}t$。于是 $[0,T]$ 内\n$$\\text{总金额}=\\int_0^{T}p(t)q'(t)\\,\\mathrm{d}t,\\qquad \\text{总份额}=q(T)-q(0).$$\n平均购入价格＝总金额 ÷ 总份额，即\n$$\\bar{p}=\\frac{1}{q(T)-q(0)}\\int_0^{T}p(t)q'(t)\\,\\mathrm{d}t,$$\n选 D。",
      traps: "平均价格是「以买入份额为权」的加权平均，权重是 $\\mathrm{d}q$ 而不是 $\\mathrm{d}t$。把分母写成 $T$、把分子写成 $\\int_0^Tp(t)\\mathrm{d}t$（时间平均）会误选 A 或 C——注意 C 的分子是对的但分母错，是最强干扰项。",
      hint: "先写清微元内的「买入份额 $q'(t)\\mathrm{d}t$」与「付出金额 $p(t)q'(t)\\mathrm{d}t$」，再作「总金额 ÷ 总份额」。",
      src: { file: "参考文件/真题/数学/2026年考研数学三真题及答案解析.pdf", page: 1, no: "一(4)", note: "题面取自 w3k-pics/p01.png 亲读（四选项的分母 $T$ / $q(T)-q(0)$、被积式 $p(t)$ / $p(t)q'(t)$ 逐项放大核对）；答案与 2026 参考解析 p5（【答案】D；册上以 $\\Delta q$ 微元法推出同一式子）对拍，独立重推一致。" }
    },
    {
      id: "m3-2026-5", origin: "year", year: 2026, no: "一(5)", type: "linalg", star: 4, school: "全国硕士研究生招生考试-数学三 2026 年",
      tags: ["ln05","zb08","zb06"],
      stem: "设矩阵 $A=\\begin{pmatrix}0&0&1\\\\1&1&3\\\\1&1&1\\end{pmatrix}$，$C=\\begin{pmatrix}1&1\\\\1&1\\\\a&b\\end{pmatrix}$，若存在矩阵 $B$ 满足 $AB=C$，则（ ）",
      options: ["$a=-1,\\ b=-1$","$a=2,\\ b=2$","$a=-1,\\ b=2$","$a=2,\\ b=-1$"],
      answer: "选 A。$AB=C$ 有解 $\\Leftrightarrow$ $C$ 的每一列都可由 $A$ 的列向量组线性表示 $\\Leftrightarrow r(A)=r(A,C)$。\n记 $A$ 的三列为 $\\alpha_1=\\begin{pmatrix}0\\\\1\\\\1\\end{pmatrix}$、$\\alpha_2=\\begin{pmatrix}0\\\\1\\\\1\\end{pmatrix}$、$\\alpha_3=\\begin{pmatrix}1\\\\3\\\\1\\end{pmatrix}$，则 $\\alpha_1=\\alpha_2$，$\\alpha_1,\\alpha_3$ 不成比例，故 $r(A)=2$，列空间为 $\\mathrm{span}\\{\\alpha_1,\\alpha_3\\}$。\n设 $\\alpha\\alpha_1+\\beta\\alpha_3=\\begin{pmatrix}1\\\\1\\\\c\\end{pmatrix}$，则\n$$\\beta=1,\\qquad \\alpha+3\\beta=1\\ (\\alpha=-2),\\qquad \\alpha+\\beta=c\\ (c=-1).$$\n$C$ 的两列前两个分量都是 $\\begin{pmatrix}1\\\\1\\end{pmatrix}$，故 $a=b=-1$，选 A。",
      traps: "$A$ 的第 1、2 列完全相同，$r(A)=2<3$，既不能对 $A$ 求逆、也不能指望任意 $C$ 都使 $AB=C$ 有解；把三列当线性无关、用克莱姆法则硬解会得出与四选项都不符的荒谬值。",
      hint: "把 $AB=C$ 读成「$C$ 的每一列是 $A$ 的列向量的组合」，注意 $A$ 前两列相同，只需在 $\\mathrm{span}\\{\\alpha_1,\\alpha_3\\}$ 里解 $\\begin{pmatrix}1\\\\1\\\\c\\end{pmatrix}$。",
      src: { file: "参考文件/真题/数学/2026年考研数学三真题及答案解析.pdf", page: 1, no: "一(5)", note: "题面取自 w3k-pics/p01_low.png（330 dpi 放大），$A$ 为 $3\\times3$、$C$ 为 $3\\times2$、两矩阵逐元素核对（$A$ 第 1 行为 $(0,0,1)$、$C$ 第 3 行为 $(a,b)$）。答案与 2026 参考解析 p5（【答案】A；「$AB=C$ 有解，所以 $r(A)=r(A,C)$，初等行变换易得 $a=b=-1$」）对拍，独立重推一致。" }
    },
    {
      id: "m3-2026-6", origin: "year", year: 2026, no: "一(6)", type: "eigen", star: 3, school: "全国硕士研究生招生考试-数学三 2026 年",
      tags: ["la11","zb26"],
      stem: "已知 $A$ 为 3 阶非 $O$ 矩阵，且 $A^{*}=-2A$，求 $A^{2}=$（ ）",
      options: ["$\\begin{pmatrix}-4&&\\\\&-4&\\\\&&-4\\end{pmatrix}$","$\\begin{pmatrix}-4&&\\\\&-4&\\\\&&4\\end{pmatrix}$","$\\begin{pmatrix}-4&&\\\\&4&\\\\&&4\\end{pmatrix}$","$\\begin{pmatrix}4&&\\\\&4&\\\\&&4\\end{pmatrix}$"],
      answer: "选 D。\n① 先证 $A$ 可逆。若 $|A|=0$，则 $r(A)\\le2$，从而 $r\\left(A^{*}\\right)\\le1$；而 $A^{*}=-2A$ 使 $r\\left(A^{*}\\right)=r(A)$，于是 $r(A)\\le1$，此时三阶矩阵的伴随矩阵 $A^{*}=O$，进而 $A=O$，与 $A\\ne O$ 矛盾。故 $|A|\\ne0$。\n② 由 $A^{*}A=|A|E$ 与 $A^{*}=-2A$ 得 $-2A^{2}=|A|E$。\n③ 定 $|A|$：对 $A^{*}=-2A$ 两边取行列式，$|A|^{2}=|-2A|=(-2)^{3}|A|=-8|A|$，由 $|A|\\ne0$ 得 $|A|=-8$。\n④ 代回：$-2A^{2}=-8E$，即 $A^{2}=4E=\\begin{pmatrix}4&0&0\\\\0&4&0\\\\0&0&4\\end{pmatrix}$，选 D。",
      traps: "$|-2A|=(-2)^{3}|A|$，三阶矩阵提公因子要算 $-2$ 的**三次方**，误写成 $-2|A|$ 会解出 $|A|=-2$ 从而得到 $A^{2}=E$ 一类错值。另外 $A^{*}A=|A|E$ 只有在 $A$ 可逆时才等价于 $A^{*}=|A|A^{-1}$，用之前必须先说明可逆。",
      hint: "先用 $A^{*}A=|A|E$ 把 $A^{*}=-2A$ 化成 $-2A^{2}=|A|E$，再对 $A^{*}=-2A$ 取行列式定出 $|A|=-8$。",
      src: { file: "参考文件/真题/数学/2026年考研数学三真题及答案解析.pdf", page: 1, no: "一(6)", note: "题面取自 w3k-pics/p01_low.png 放大亲读（四选项均只画出对角线元素、非对角元留空，此处照录为空位）；答案与 2026 参考解析 p6（【答案】D；$A^{*}A=-2AA^{*}\\Rightarrow A^{2}=\\dfrac{|A|}{-2}E$，$|A^{*}|=|-2A|\\Rightarrow|A|^{2}=(-2)^{3}|A|\\Rightarrow|A|=-8$，故 $A^{2}=4E$）对拍，独立重推一致。" }
    },
    {
      id: "m3-2026-7", origin: "year", year: 2026, no: "一(7)", type: "eigen", star: 5, school: "全国硕士研究生招生考试-数学三 2026 年",
      tags: ["la12","la13","zb23"],
      stem: "设 $A,B$ 为三阶矩阵，满足 $AB+BA=A^{2}+B^{2}$，且 $A\\ne B$，则下列结论中错误的是（ ）",
      options: ["$(A-B)^{3}=0$","$A-B$ 仅有零特征值","$A,B$ 不全为对角矩阵","$A-B$ 只有一个线性无关的特征向量"],
      answer: "选 D。由 $AB+BA=A^{2}+B^{2}$ 移项得 $A^{2}-AB-BA+B^{2}=O$，即\n$$(A-B)^{2}=O.$$\nA：$(A-B)^{3}=(A-B)^{2}(A-B)=O$，正确。\nB：$(A-B)^{2}=O$ 说明 $A-B$ 幂零，幂零矩阵的特征值全为 $0$，正确。\nC：若 $A,B$ 同为对角矩阵，则 $AB=BA$，条件化为 $2AB=A^{2}+B^{2}$，即 $(A-B)^{2}=O$；而两个对角矩阵之差的平方是「对应元素差平方」构成的对角矩阵，它为零矩阵只能 $A=B$，与 $A\\ne B$ 矛盾。故 $A,B$ 不全为对角矩阵，正确。\nD：$A-B$ 是三阶非零幂零矩阵，其秩可以是 $1$ 也可以是 $2$——取 $A-B=\\begin{pmatrix}0&1&0\\\\0&0&0\\\\0&0&0\\end{pmatrix}$ 时 $(A-B)^{2}=O$、$r(A-B)=1$，线性无关特征向量有 $3-1=2$ 个，「只有一个」不成立。故错误的是 D。",
      traps: "$(A-B)^{2}=O$ 只给出「幂零」，不能推出 $r(A-B)=2$。三阶非零幂零矩阵的秩可以为 $1$（对应 $2$ 个线性无关特征向量）或 $2$（对应 $1$ 个），所以 D 的「只有一个」不是必然结论——这正是题目要选它的原因。C 的判定要用「对角矩阵可交换」加「对角矩阵平方为零只能是零矩阵」。",
      hint: "把条件移项成 $(A-B)^{2}=O$，逐项验证；对 D 构造 $r(A-B)=1$ 的幂零矩阵作反例。",
      src: { file: "参考文件/真题/数学/2026年考研数学三真题及答案解析.pdf", page: 2, no: "一(7)", note: "题面取自 w3k-pics/p02.png 亲读（四选项文字逐字核对，含「$A,B$ 不全为对角矩阵」）；答案与 2026 参考解析 p6（【答案】D；对 D 项原文「由 $(A-B)^{2}=0$ 且 $A-B\\ne0$ 知 $r(A-B)=1$，$A-B$ 存在两个线性无关特征向量」）对拍，独立重推一致（册上把反例的秩写死为 $1$，本题按「秩可为 $1$ 或 $2$ 故不必然」表述，结论相同）。" }
    },
    {
      id: "m3-2026-8", origin: "year", year: 2026, no: "一(8)", type: "estimate", star: 4, school: "全国硕士研究生招生考试-数学三 2026 年",
      tags: ["tp02","int23"],
      stem: "已知随机变量 $X,Y$ 独立且同分布，且 $X$ 的概率密度为 $f(x)=\\begin{cases}\\dfrac{1}{(1+x)^{2}},&x>0,\\\\0,&x\\le0,\\end{cases}$ 求 $P\\{XY\\le1\\}=$（ ）",
      options: ["$\\dfrac14$","$\\dfrac12$","$\\dfrac13$","$\\dfrac16$"],
      answer: "选 B。先求分布函数：$x>0$ 时 $F(x)=\\displaystyle\\int_0^{x}\\frac{\\mathrm{d}t}{(1+t)^{2}}=1-\\frac{1}{1+x}$。\n用「$1$ 减」算对立事件，并对 $X$ 的取值积分：\n$$P\\{XY>1\\}=\\int_0^{+\\infty}f(x)\\left[1-F\\left(\\frac1x\\right)\\right]\\mathrm{d}x=\\int_0^{+\\infty}\\frac{1}{(1+x)^{2}}\\cdot\\frac{x}{1+x}\\,\\mathrm{d}x.$$\n令 $u=1+x$：\n$$\\int_1^{+\\infty}\\frac{u-1}{u^{3}}\\,\\mathrm{d}u=\\left[-\\frac1u+\\frac{1}{2u^{2}}\\right]_1^{+\\infty}=0-\\left(-1+\\frac12\\right)=\\frac12.$$\n故 $P\\{XY\\le1\\}=1-\\dfrac12=\\dfrac12$，选 B。",
      traps: "密度是 $\\dfrac{1}{(1+x)^{2}}$ 而不是 $\\dfrac{1}{1+x^{2}}$（后者是柯西型，结论完全不同）；$1-F\\left(\\dfrac1x\\right)=\\dfrac{x}{1+x}$ 这一步把「$\\dfrac{1}{1+1/x}$」通分容易写反成 $\\dfrac{1}{1+x}$，那会得到 $\\dfrac13$ 而误选 C。",
      hint: "先积分得 $F(x)=1-\\dfrac{1}{1+x}$，再算 $P\\{XY>1\\}=\\int_0^{+\\infty}f(x)\\left[1-F\\left(\\frac1x\\right)\\right]\\mathrm{d}x$，最后换元 $u=1+x$。",
      src: { file: "参考文件/真题/数学/2026年考研数学三真题及答案解析.pdf", page: 2, no: "一(8)", note: "题面取自 w3k-pics/p02.png 亲读（分段密度 $(1+x)^{-2}$ 与 $x\\le0$ 归零、四选项分母 4/2/3/6 均放大核对）；答案与 2026 参考解析 p6（【答案】B；$f(x,y)=\\dfrac{1}{(1+x)^{2}(1+y)^{2}}$，$P\\{XY\\le1\\}=\\dfrac12$）对拍，独立重推一致。" }
    },
    {
      id: "m3-2026-9", origin: "year", year: 2026, no: "一(9)", type: "estimate", star: 4, school: "全国硕士研究生招生考试-数学三 2026 年",
      tags: ["zt04","tp02"],
      stem: "已知随机变量 $X,Y$ 独立，且 $X\\sim N(0,1)$，$Y\\sim B\\left(2,\\dfrac12\\right)$，求 $XY$ 与 $X+Y$ 的相关系数为（ ）",
      options: ["$\\dfrac34$","$\\dfrac{\\sqrt3}{2}$","$\\dfrac23$","$\\dfrac14$"],
      answer: "选 C。由 $X\\sim N(0,1)$ 得 $E(X)=0$、$D(X)=1$、$E\\left(X^{2}\\right)=1$；由 $Y\\sim B\\left(2,\\dfrac12\\right)$ 得\n$$E(Y)=2\\cdot\\frac12=1,\\qquad D(Y)=2\\cdot\\frac12\\cdot\\frac12=\\frac12,\\qquad E\\left(Y^{2}\\right)=D(Y)+E^{2}(Y)=\\frac32.$$\n① 协方差：由独立性 $E(XY)=E(X)E(Y)=0$，且\n$$E\\left[XY(X+Y)\\right]=E\\left(X^{2}Y\\right)+E\\left(XY^{2}\\right)=E\\left(X^{2}\\right)E(Y)+E(X)E\\left(Y^{2}\\right)=1\\cdot1+0=1,$$\n故 $\\mathrm{Cov}(XY,X+Y)=1-E(XY)E(X+Y)=1$。\n② 方差：$D(XY)=E\\left(X^{2}Y^{2}\\right)-E^{2}(XY)=E\\left(X^{2}\\right)E\\left(Y^{2}\\right)-0=\\dfrac32$；$D(X+Y)=D(X)+D(Y)=\\dfrac32$。\n③ 相关系数：\n$$\\rho=\\frac{\\mathrm{Cov}(XY,X+Y)}{\\sqrt{D(XY)}\\sqrt{D(X+Y)}}=\\frac{1}{\\sqrt{\\frac32}\\sqrt{\\frac32}}=\\frac23,$$\n选 C。",
      traps: "$E\\left[XY(X+Y)\\right]$ 必须拆成 $E\\left(X^{2}Y\\right)+E\\left(XY^{2}\\right)$ 再用独立性；$D(XY)$ 用的是 $E\\left(X^{2}\\right)E\\left(Y^{2}\\right)$ 而不是 $\\left[E(XY)\\right]^{2}$，把 $D(XY)$ 误写成 $0$ 会得到 $\\rho$ 不存在或 $\\rho=1$。",
      hint: "$E(X)=0$ 让问题只剩 $E\\left(X^{2}Y\\right)$、$E\\left(XY^{2}\\right)$、$E\\left(X^{2}Y^{2}\\right)$ 三个量，全部靠独立性拆成乘积。",
      src: { file: "参考文件/真题/数学/2026年考研数学三真题及答案解析.pdf", page: 2, no: "一(9)", note: "题面取自 w3k-pics/p02.png 亲读（$N(0,1)$、$B\\left(2,\\frac12\\right)$ 与四选项放大核对）；答案与 2026 参考解析 p7（【答案】C；$\\mathrm{Cov}=1$，$D(XY)=D(X+Y)=\\dfrac32$，$\\rho=\\dfrac23$）对拍，独立重推一致。" }
    },
    {
      id: "m3-2026-10", origin: "year", year: 2026, no: "一(10)", type: "estimate", star: 5, school: "全国硕士研究生招生考试-数学三 2026 年",
      tags: ["zt04","tp02"],
      stem: "已知随机变量 $X$ 的分布律为 $P\\{X=k\\}=\\dfrac{1}{2^{k+1}}+\\dfrac{1}{3^{k}}\\ (k=1,2,3,\\cdots)$，对于正整数 $m,n$，有（ ）",
      options: ["$P\\{X>m+n\\mid X>m\\}=P\\{X>m\\}$","$P\\{X>m+n\\mid X>m\\}=P\\{X>n\\}$","$P\\{X>m+n\\mid X>m\\}>P\\{X>m\\}$","$P\\{X>m+n\\mid X>m\\}>P\\{X>n\\}$"],
      answer: "选 D。**册上本题【答案】栏印的是 C，但同一册的解析末段证明的恰是 D，判为册上笔误**（详见本记录 src.note）。\n① 分布律合法：$\\sum\\limits_{k\\ge1}\\left(\\dfrac{1}{2^{k+1}}+\\dfrac{1}{3^{k}}\\right)=\\dfrac12+\\dfrac12=1$。\n② 尾概率：\n$$P\\{X>k\\}=\\sum_{i=k+1}^{+\\infty}\\left(\\frac{1}{2^{i+1}}+\\frac{1}{3^{i}}\\right)=\\frac{1}{2^{k+1}}+\\frac{1}{2\\cdot3^{k}}=\\frac12\\left(\\frac{1}{2^{k}}+\\frac{1}{3^{k}}\\right).$$\n③ 核心比较：记 $a=2^{-m},\\ b=3^{-m},\\ c=2^{-n},\\ d=3^{-n}$，则\n$$P\\{X>m+n\\}-P\\{X>m\\}P\\{X>n\\}=\\frac12\\left(ac+bd\\right)-\\frac14\\left(a+b\\right)\\left(c+d\\right)=\\frac14\\left(ac+bd-ad-bc\\right)=\\frac14(c-d)(a-b).$$\n因 $a>b>0$、$c>d>0$，故上式 $>0$，即 $P\\{X>m+n\\}>P\\{X>m\\}P\\{X>n\\}$。两边除以 $P\\{X>m\\}>0$ 得\n$$P\\{X>m+n\\mid X>m\\}=\\frac{P\\{X>m+n\\}}{P\\{X>m\\}}>P\\{X>n\\},$$\n对一切正整数 $m,n$ 成立，选 D。\n④ 排除 A、C：固定 $m$、令 $n\\to+\\infty$，则 $P\\{X>m+n\\}\\to0$，故 $P\\{X>m+n\\mid X>m\\}\\to0<P\\{X>m\\}$，二者均不成立。",
      traps: "本题是两条几何分布**混合**而成的分布，失效率随 $k$ 递减，几何分布「无记忆性」的直觉在这里失效，所以 B 的等号不成立。C 只在个别场合碰巧成立（$m=n=1$ 时 $\\dfrac{13}{30}>\\dfrac{5}{12}$），一般情形取 $m=1,n=5$ 即反例：$P\\{X>m+n\\mid X>m\\}=\\dfrac{35/432}{5/12}=\\dfrac{7}{36}\\approx0.194$，而 $P\\{X>m\\}=\\dfrac{5}{12}\\approx0.417$。另注意**不要把册上答案栏的 C 抄成正确答案**。",
      hint: "先算出 $P\\{X>k\\}=\\dfrac12\\left(2^{-k}+3^{-k}\\right)$，再作差并因式分解成 $\\dfrac14(c-d)(a-b)>0$；排除 A、C 用 $n\\to\\infty$ 的极限。",
      src: { file: "参考文件/真题/数学/2026年考研数学三真题及答案解析.pdf", page: 2, no: "一(10)", note: "题面取自 w3k-pics/p02.png 亲读（分布律 $\\dfrac{1}{2^{k+1}}+\\dfrac{1}{3^{k}}$ 与四选项放大核对，$k$ 从 1 起）。**册上答案与重推不一致**：册上 p7 标【答案】C，但同页解析先证「所以 AC 都不成立」，p8 解析末段原文「所以 $P\\{X>m+n\\mid X>m\\}>P\\{X>n\\}$ 是成立的，应选 D」，其因式分解结果 $\\dfrac{(3^{n}-2^{n})(3^{m}-2^{m})}{2}>0$ 与本次独立重推的 $\\dfrac14(c-d)(a-b)>0$ 完全同号同源。反证 $m=1,n=5$ 使 C 失败（$\\dfrac{7}{36}<\\dfrac{5}{12}$）。故取 D，并在此留痕（册上 C / 重推 D / 原因：册上答案栏与自身解析末段自相矛盾）。" }
    },
    {
      id: "m3-2026-11", origin: "year", year: 2026, no: "二(11)", type: "integral", star: 3, school: "全国硕士研究生招生考试-数学三 2026 年",
      tags: ["int23","int26"],
      stem: "$\\displaystyle\\int_0^1x(x-1)\\left(x-\\frac12\\right)\\mathrm{d}x=$______。",
      answer: "填 $0$。\n法一（展开）：$x(x-1)\\left(x-\\dfrac12\\right)=x\\left(x^{2}-\\dfrac32x+\\dfrac12\\right)=x^{3}-\\dfrac32x^{2}+\\dfrac12x$，故\n$$\\int_0^1\\left(x^{3}-\\frac32x^{2}+\\frac12x\\right)\\mathrm{d}x=\\frac14-\\frac32\\cdot\\frac13+\\frac12\\cdot\\frac12=\\frac14-\\frac12+\\frac14=0.$$\n法二（对称性）：令 $t=x-\\dfrac12$，则 $x=t+\\dfrac12$、$x-1=t-\\dfrac12$、$x-\\dfrac12=t$，被积函数化为\n$$t\\left(t+\\frac12\\right)\\left(t-\\dfrac12\\right)=t^{3}-\\frac14t,$$\n它是 $t$ 的奇函数，而积分区间变为 $\\left[-\\dfrac12,\\dfrac12\\right]$ 关于原点对称，故积分为 $0$。",
      traps: "$\\displaystyle\\int_0^1x^{3}\\mathrm{d}x$ 记成 $\\dfrac13$ 会得非零结果；三项系数 $\\dfrac14,-\\dfrac12,\\dfrac14$ 恰好两两抵消，任何一处算错都破坏这个结构。对称性做法的关键是认出三因子到 $t$ 的奇函数（区间必须同时变成对称区间）。",
      hint: "令 $t=x-\\dfrac12$，被积函数变成 $t^{3}-\\dfrac14t$（奇函数），在 $\\left[-\\frac12,\\frac12\\right]$ 上积分为 $0$。",
      src: { file: "参考文件/真题/数学/2026年考研数学三真题及答案解析.pdf", page: 2, no: "二(11)", note: "题面取自 w3k-pics/p02.png 亲读（三因子 $x(x-1)\\left(x-\\frac12\\right)$ 与积分限 $0\\to1$ 放大核对）；答案与 2026 参考解析 p8（【答案】0；展开积分得 $\\dfrac14-\\dfrac12+\\dfrac14=0$）对拍，独立重推两种方法均得 0。" }
    },
    {
      id: "m3-2026-12", origin: "year", year: 2026, no: "二(12)", type: "limit", star: 4, school: "全国硕士研究生招生考试-数学三 2026 年",
      tags: ["ext02","tay01","tp02"],
      stem: "$\\lim\\limits_{x\\to0}\\dfrac1x\\left(\\dfrac{\\sqrt{1+x^{2}}}{\\sin x}-\\dfrac{1}{\\tan x}\\right)=$______。",
      answer: "填 $1$。先通分：$\\dfrac{1}{\\tan x}=\\dfrac{\\cos x}{\\sin x}$，故原式为\n$$\\lim_{x\\to0}\\frac1x\\cdot\\frac{\\sqrt{1+x^{2}}-\\cos x}{\\sin x}.$$\n由 $\\sin x\\sim x$ 及泰勒展开\n$$\\sqrt{1+x^{2}}=1+\\frac{x^{2}}{2}+o\\left(x^{2}\\right),\\qquad \\cos x=1-\\frac{x^{2}}{2}+o\\left(x^{2}\\right),$$\n得 $\\sqrt{1+x^{2}}-\\cos x=x^{2}+o\\left(x^{2}\\right)$，于是\n$$\\text{原式}=\\lim_{x\\to0}\\frac{1}{x}\\cdot\\frac{x^{2}+o\\left(x^{2}\\right)}{x}=1.$$",
      traps: "两个分式必须通分到同一分母 $\\sin x$，再统一用 $\\sin x\\sim x$；若对两项分别等价替换 $\\dfrac{\\sqrt{1+x^{2}}}{\\sin x}\\sim\\dfrac{1+x^{2}/2}{x}$、$\\dfrac{1}{\\tan x}\\sim\\dfrac1x$ 再相减，会把 $\\cos x$ 的 $-\\dfrac{x^{2}}{2}$ 丢掉而得到 $0$。另注意 $\\sqrt{1+x^{2}}-\\cos x$ 的主项是 $x^{2}$（两项各自的 $\\pm\\dfrac{x^{2}}{2}$ 相加），不是 $\\dfrac{x^{2}}{2}$。",
      hint: "先通分成 $\\dfrac{\\sqrt{1+x^{2}}-\\cos x}{x\\sin x}$，分子用两段麦克劳林，主项 $x^{2}$ 与分母的 $x^{2}$ 约掉。",
      src: { file: "参考文件/真题/数学/2026年考研数学三真题及答案解析.pdf", page: 2, no: "二(12)", note: "题面取自 w3k-pics/p02.png 亲读（分母 $\\sin x$ 与 $\\tan x$ 的两项、整体乘以 $\\dfrac1x$ 均放大核对）；答案与 2026 参考解析 p8（【答案】1；法一用乘 $\\dfrac{\\cos x}{\\cos x}$ 通分、法二拆成 $\\dfrac12+\\dfrac12$）对拍，独立重推一致。" }
    },
    {
      id: "m3-2026-13", origin: "year", year: 2026, no: "二(13)", type: "integral", star: 4, school: "全国硕士研究生招生考试-数学三 2026 年",
      tags: ["int12","int27","wr03"],
      stem: "设 $p$ 为常数，若反常积分 $\\displaystyle\\int_0^{+\\infty}\\frac{\\arctan x}{x^{p}(x+1)}\\,\\mathrm{d}x$ 收敛，则 $p$ 的取值范围是______。",
      answer: "填 $0<p<2$。把积分拆成 $\\displaystyle\\int_0^{1}+\\int_1^{+\\infty}$ 两段分别判敛（$x=1$ 不是瑕点）。\n① $x\\to0^{+}$：$\\arctan x\\sim x$，$x+1\\to1$，故被积函数 $\\sim\\dfrac{x}{x^{p}}=x^{1-p}$；$\\displaystyle\\int_0^{1}x^{1-p}\\mathrm{d}x$ 收敛 $\\Leftrightarrow 1-p>-1\\Leftrightarrow p<2$。\n② $x\\to+\\infty$：$\\arctan x\\to\\dfrac{\\pi}{2}$，$x+1\\sim x$，故被积函数 $\\sim\\dfrac{\\pi}{2}\\cdot\\dfrac{1}{x^{p+1}}$；$\\displaystyle\\int_1^{+\\infty}\\frac{\\mathrm{d}x}{x^{p+1}}$ 收敛 $\\Leftrightarrow p+1>1\\Leftrightarrow p>0$。\n两段同时收敛，取交得 $0<p<2$。",
      traps: "$x\\to+\\infty$ 端分母是 $x^{p}(x+1)\\sim x^{p+1}$，指数是 $p+1$ 而不是 $p$——漏掉 $(x+1)$ 的贡献会把条件写成 $p>1$，从而多丢掉 $(0,1]$ 这一段。$x\\to0$ 端必须用 $\\arctan x\\sim x$ 把阶数减 $1$，直接用 $\\dfrac{1}{x^{p}}$ 判会得 $p<1$。",
      hint: "两端各取主项：$x\\to0$ 时被积函数 $\\sim x^{1-p}$（需 $p<2$），$x\\to\\infty$ 时 $\\sim\\dfrac{\\pi}{2}x^{-(p+1)}$（需 $p>0$）。",
      src: { file: "参考文件/真题/数学/2026年考研数学三真题及答案解析.pdf", page: 2, no: "二(13)", note: "题面取自 w3k-pics/p02.png 亲读（下限 0、上限 $+\\infty$、分母 $x^{p}(x+1)$ 与分子 $\\arctan x$ 放大核对）；答案与 2026 参考解析 p8（【答案】$(0,2)$；$p-1<1\\Rightarrow p<2$，$p+1>1\\Rightarrow p>0$）对拍，独立重推一致。" }
    },
    {
      id: "m3-2026-14", origin: "year", year: 2026, no: "二(14)", type: "ode", star: 3, school: "全国硕士研究生招生考试-数学三 2026 年",
      tags: ["ode03","ode05","kn14"],
      stem: "已知微分方程 $y''-2y'=\\mathrm{e}^{x}$，求满足 $y(0)=1,\\ y'(0)=1$ 的解 $y=$______。",
      answer: "填 $y=1+\\mathrm{e}^{2x}-\\mathrm{e}^{x}$。\n① 齐次方程 $y''-2y'=0$ 的特征方程 $r^{2}-2r=0$，特征根 $r_1=0,\\ r_2=2$，齐次通解\n$$Y=C_1+C_2\\mathrm{e}^{2x}.$$\n② 右端 $\\mathrm{e}^{x}$ 中 $\\lambda=1$ 不是特征根，设特解 $y^{*}=A\\mathrm{e}^{x}$，代入得 $A-2A=1$，即 $A=-1$，$y^{*}=-\\mathrm{e}^{x}$。\n③ 通解 $y=C_1+C_2\\mathrm{e}^{2x}-\\mathrm{e}^{x}$。由 $y(0)=C_1+C_2-1=1$、$y'(0)=2C_2-1=1$ 得 $C_2=1$、$C_1=1$。\n④ 故 $y=1+\\mathrm{e}^{2x}-\\mathrm{e}^{x}$。",
      traps: "特征根含 $r=0$，齐次解里那一项是**常数** $C_1$，容易漏写（只写 $C_2\\mathrm{e}^{2x}$ 就凑不出 $y(0)=1$）。特解系数方程是 $A-2A=1$（$\\lambda=1$ 不是特征根，不必乘 $x$），把 $\\lambda$ 当特征根乘 $x$ 会算错。",
      hint: "特征根 $0$ 与 $2$，特解设 $A\\mathrm{e}^{x}$ 并解 $A-2A=1$，最后用两个初值定 $C_1,C_2$。",
      src: { file: "参考文件/真题/数学/2026年考研数学三真题及答案解析.pdf", page: 2, no: "二(14)", note: "题面取自 w3k-pics/p02.png 亲读（方程 $y''-2y'=\\mathrm{e}^{x}$ 与 $y(0)=1$、$y'(0)=1$ 放大核对）；答案与 2026 参考解析 p9（【答案】$y=1+\\mathrm{e}^{2x}-\\mathrm{e}^{x}$；特征根 $r_1=0,r_2=2$，$y^{*}=-\\mathrm{e}^{x}$，$C_1=C_2=1$）对拍，独立重推一致。" }
    },
    {
      id: "m3-2026-15", origin: "year", year: 2026, no: "二(15)", type: "eigen", star: 4, school: "全国硕士研究生招生考试-数学三 2026 年",
      tags: ["ms03","la09","kn68"],
      stem: "设矩阵 $A=\\begin{pmatrix}1&b&-1\\\\a+2&3&-3a\\end{pmatrix}$，若二次型 $x^{T}\\left(AA^{T}\\right)x$ 的规范形为 $y_1^{2}$，则 $a+b=$______。",
      answer: "填 $2$。$A$ 是 $2\\times3$ 矩阵，$AA^{T}$ 是 $2$ 阶实对称半正定矩阵。规范形只有 $y_1^{2}$ 一项，说明正惯性指数为 $1$、其余为 $0$，即\n$$r\\left(AA^{T}\\right)=1\\ \\Longrightarrow\\ r(A)=1.$$\n于是 $A$ 的两行成比例。设 $(a+2,3,-3a)=k(1,b,-1)$，由第 1、3 分量得 $a+2=k$、$-3a=-k$，故 $k=3a$，代入 $a+2=3a$ 得 $a=1$、$k=3$；再由第 2 分量 $3=kb=3b$ 得 $b=1$。\n故 $a+b=2$。\n（验证：$A=\\begin{pmatrix}1&1&-1\\\\3&3&-3\\end{pmatrix}$，$AA^{T}=\\begin{pmatrix}3&9\\\\9&27\\end{pmatrix}$，特征值 $30$ 与 $0$，规范形确为 $y_1^{2}$。）",
      traps: "规范形只有 $y_1^{2}$ 表示秩为 $1$，**不是**正定（正定的规范形是 $y_1^{2}+y_2^{2}$）；把秩当成 $2$ 会解不出 $a,b$。另外 $r\\left(AA^{T}\\right)=r(A)$ 这条等式（对实矩阵恒成立）是本题的桥梁，直接去算 $AA^{T}$ 的 $2\\times2$ 行列式并令其为 $0$ 也可行但更繁。",
      hint: "规范形 $y_1^{2}$ $\\Rightarrow r\\left(AA^{T}\\right)=r(A)=1$ $\\Rightarrow$ $A$ 两行成比例，按分量列比例式解 $a,b$。",
      src: { file: "参考文件/真题/数学/2026年考研数学三真题及答案解析.pdf", page: 2, no: "二(15)", note: "题面取自 w3k-pics/p02_q15c.png（700 dpi 二次裁剪，逐元素核对：$A$ 为 $2\\times3$，第 1 行 $(1,b,-1)$、第 2 行 $(a+2,3,-3a)$；此处曾因 170 dpi 下 $3-3a$ 与 $-3a$ 难辨而三次放大）。答案与 2026 参考解析 p9（【答案】2；$r\\left(AA^{T}\\right)=1\\Rightarrow r(A)=1$，$\\dfrac{a+2}{1}=\\dfrac3b=\\dfrac{-3a}{-1}$，$a=b=1$）对拍，独立重推一致。" }
    },
    {
      id: "m3-2026-16", origin: "year", year: 2026, no: "二(16)", type: "estimate", star: 3, school: "全国硕士研究生招生考试-数学三 2026 年",
      tags: ["zt04","tp02"],
      stem: "设 $X\\sim P(1)$，$Y\\sim P(3)$，且 $X$ 与 $Y-X$ 相互独立，则 $E(XY)=$______。",
      answer: "填 $4$。由 $X$ 与 $Y-X$ 相互独立得\n$$E\\left[X(Y-X)\\right]=E(X)\\,E(Y-X).$$\n左边 $=E(XY)-E\\left(X^{2}\\right)$，右边 $=E(X)\\left[E(Y)-E(X)\\right]$。由 $X\\sim P(1)$ 得 $E(X)=D(X)=1$，故 $E\\left(X^{2}\\right)=D(X)+E^{2}(X)=2$；由 $Y\\sim P(3)$ 得 $E(Y)=3$。于是\n$$E(XY)-2=1\\cdot(3-1)=2\\ \\Longrightarrow\\ E(XY)=4.$$",
      traps: "$X$ 与 $Y-X$ 独立**不能**推出 $X$ 与 $Y$ 独立，所以不能写 $E(XY)=E(X)E(Y)=3$。正确路径是把 $XY$ 拆成 $X(Y-X)+X^{2}$，用「$X\\perp(Y-X)$ ⇒ 乘积期望可拆」这一条。另注意泊松分布 $E=D=\\lambda$，$E\\left(X^{2}\\right)=1+1=2$ 别写成 $1$。",
      hint: "把 $E(XY)$ 写成 $E\\left[X(Y-X)\\right]+E\\left(X^{2}\\right)$，前者用 $X$ 与 $Y-X$ 独立的乘积期望公式。",
      src: { file: "参考文件/真题/数学/2026年考研数学三真题及答案解析.pdf", page: 2, no: "二(16)", note: "题面取自 w3k-pics/p02.png 亲读（$P(1)$、$P(3)$ 与「$X$ 与 $Y-X$ 相互独立」放大核对）；答案与 2026 参考解析 p9（【答案】4；法一用 $E[X(Y-X)]$ 拆分、法二用 $\\mathrm{Cov}(X,Y-X)=0$）对拍，独立重推一致。" }
    },
    {
      id: "m3-2026-17", origin: "year", year: 2026, no: "三(17)", type: "series", star: 3, school: "全国硕士研究生招生考试-数学三 2026 年",
      tags: ["ext17","ser12","gx53"],
      stem: "已知 $f(x)$ 连续，且 $f(x)=\\dfrac{1}{(2-x)^{2}}-\\displaystyle\\int_0^{1}f(x)\\,\\mathrm{d}x$，将 $f(x)$ 展开成 $x$ 的幂级数。",
      answer: "① 定常数：$\\displaystyle\\int_0^{1}f(x)\\mathrm{d}x$ 是与 $x$ 无关的常数，记 $A=\\displaystyle\\int_0^{1}f(x)\\mathrm{d}x$，则 $f(x)=\\dfrac{1}{(2-x)^{2}}-A$。两边在 $[0,1]$ 上积分：\n$$A=\\int_0^{1}\\frac{\\mathrm{d}x}{(2-x)^{2}}-A=\\left[\\frac{1}{2-x}\\right]_0^{1}-A=\\left(1-\\frac12\\right)-A,$$\n故 $2A=\\dfrac12$，$A=\\dfrac14$，即\n$$f(x)=\\frac{1}{(2-x)^{2}}-\\frac14.$$\n② 展开：\n$$\\frac{1}{(2-x)^{2}}=\\frac14\\cdot\\frac{1}{\\left(1-\\frac{x}{2}\\right)^{2}}=\\frac14\\sum_{n=0}^{+\\infty}(n+1)\\left(\\frac{x}{2}\\right)^{n}=\\sum_{n=0}^{+\\infty}\\frac{(n+1)x^{n}}{2^{n+2}},$$\n其 $n=0$ 项为 $\\dfrac14$，与常数 $-\\dfrac14$ 相消，故\n$$f(x)=\\sum_{n=1}^{+\\infty}\\frac{n+1}{2^{n+2}}x^{n},\\qquad -2<x<2.$$\n（开区间，$x=\\pm2$ 处级数发散。）",
      traps: "$\\displaystyle\\int_0^{1}f(x)\\mathrm{d}x$ 是常数而非 $x$ 的函数，必须整体记成 $A$ 再解一次方程；漏掉这一步会把它当 $x$ 的项而无法展开。$\\dfrac{1}{(2-x)^{2}}$ 的 $n=0$ 项恰为 $\\dfrac14$，与 $-\\dfrac14$ 相消后级数从 $n=1$ 起——若不相消，说明 $A$ 算错了。收敛区间由 $\\left|\\dfrac x2\\right|<1$ 得，端点 $x=\\pm2$ 发散，写闭区间即错。",
      hint: "设 $A=\\int_0^1f$，两边积分解出 $A=\\dfrac14$；再用 $\\dfrac{1}{(1-t)^{2}}=\\sum\\limits_{n\\ge0}(n+1)t^{n}$（取 $t=\\dfrac x2$）。",
      src: { file: "参考文件/真题/数学/2026年考研数学三真题及答案解析.pdf", page: 3, no: "三(17)", note: "题面取自 w3k-pics/p03.png 与 p03_a.png（520 dpi 放大，核对 $\\dfrac{1}{(2-x)^{2}}$ 的分母指数 2 与积分限 $0\\to1$）；答案与 2026 参考解析 p9–p10（$A=\\dfrac14$，$f(x)=\\dfrac{1}{(2-x)^{2}}-\\dfrac14$，$f(x)=\\sum\\limits_{n=1}^{+\\infty}\\dfrac{n+1}{2^{n+2}}x^{n}$，收敛域 $-2<x<2$）对拍，独立重推一致。" }
    },
    {
      id: "m3-2026-18", origin: "year", year: 2026, no: "三(18)", type: "integral", star: 5, school: "全国硕士研究生招生考试-数学三 2026 年",
      tags: ["int25","int33","gx31"],
      stem: "已知函数 $g(x)$ 连续，设 $f(x)=\\displaystyle\\int_0^{x^{2}}g(xt)\\,\\mathrm{d}t$，求 $f'(x)$ 的表达式，并判断 $f'(x)$ 在 $x=0$ 处的连续性。",
      answer: "① 换元把参数 $x$ 移出被积函数。令 $u=xt$，则 $\\mathrm{d}u=x\\,\\mathrm{d}t$，$t:0\\to x^{2}$ 对应 $u:0\\to x^{3}$，得\n$$f(x)=\\frac1x\\int_0^{x^{3}}g(u)\\,\\mathrm{d}u\\qquad(x\\ne0).$$\n② 求 $f'(x)$（$x\\ne0$）：对 $\\dfrac1x$ 与上限用商的求导法则，\n$$f'(x)=-\\frac{1}{x^{2}}\\int_0^{x^{3}}g(u)\\mathrm{d}u+\\frac1x\\cdot g\\left(x^{3}\\right)\\cdot3x^{2}=3xg\\left(x^{3}\\right)-\\frac{1}{x^{2}}\\int_0^{x^{3}}g(u)\\mathrm{d}u.$$\n③ 求 $f'(0)$：$f(0)=\\displaystyle\\int_0^{0}g(0)\\mathrm{d}t=0$，故\n$$f'(0)=\\lim_{x\\to0}\\frac{f(x)-f(0)}{x}=\\lim_{x\\to0}\\frac{1}{x^{2}}\\int_0^{x^{3}}g(u)\\mathrm{d}u.$$\n由 $g$ 连续及积分中值，$\\displaystyle\\int_0^{x^{3}}g(u)\\mathrm{d}u=g(\\xi)\\cdot x^{3}$（$\\xi$ 在 $0$ 与 $x^{3}$ 之间），故该极限 $=\\lim\\limits_{x\\to0}g(\\xi)\\,x=0$，即 $f'(0)=0$。\n于是\n$$f'(x)=\\begin{cases}3xg\\left(x^{3}\\right)-\\dfrac{1}{x^{2}}\\displaystyle\\int_0^{x^{3}}g(u)\\mathrm{d}u,&x\\ne0,\\\\[2mm]0,&x=0.\\end{cases}$$\n④ 判连续：由 $\\displaystyle\\int_0^{x^{3}}g(u)\\mathrm{d}u=g(0)x^{3}+o\\left(x^{3}\\right)$ 得 $\\dfrac{1}{x^{2}}\\displaystyle\\int_0^{x^{3}}g(u)\\mathrm{d}u=g(0)x+o(x)\\to0$，又 $3xg\\left(x^{3}\\right)\\to0$，故\n$$\\lim_{x\\to0}f'(x)=0=f'(0),$$\n即 $f'(x)$ 在 $x=0$ 处**连续**。",
      traps: "被积函数是 $g(xt)$ 而不是 $g(t)$——$x$ 是藏在被积函数里的参数，必须先换元把它移出去才能用变上限求导；换元后上限变成 $x^{3}$（不是 $x^{2}$），且 $\\mathrm{d}t=\\dfrac{\\mathrm{d}u}{x}$ 会引入 $\\dfrac1x$ 因子。$x<0$ 时同一换元仍成立（$u$ 取负值、积分方向由换元自动处理），不必分段。判连续时不能只说「$f'$ 的表达式在 $0$ 处无定义」就下结论，要用导数定义把 $f'(0)$ 补出来再比极限。",
      hint: "先令 $u=xt$ 化为 $f(x)=\\dfrac1x\\int_0^{x^3}g(u)\\mathrm{d}u$，再用商的求导＋变上限公式；$x=0$ 处用导数定义配合积分中值。",
      src: { file: "参考文件/真题/数学/2026年考研数学三真题及答案解析.pdf", page: 3, no: "三(18)", note: "题面取自 w3k-pics/p03_a.png（520 dpi 放大，确认被积函数为 $g(xt)$、上限 $x^{2}$、下限 0）；答案与 2026 参考解析 p10（$f(x)=\\dfrac{1}{x}\\int_0^{x^{3}}g(u)\\mathrm{d}u$，$f'(x)=3xg(x^{3})-\\dfrac{1}{x^{2}}\\int_0^{x^{3}}g(u)\\mathrm{d}u$，$f'(0)=0$，$\\lim\\limits_{x\\to0}f'(x)=0=f'(0)$ 故连续）对拍，独立重推一致。" }
    },
    {
      id: "m3-2026-19", origin: "year", year: 2026, no: "三(19)", type: "multivar", star: 4, school: "全国硕士研究生招生考试-数学三 2026 年",
      tags: ["multi03","ext05","tp06"],
      stem: "求函数 $f(x,y)=\\left(2x^{2}-y^{2}\\right)\\mathrm{e}^{x}$ 的极值。",
      answer: "① 求驻点：\n$$f_x=4x\\mathrm{e}^{x}+\\left(2x^{2}-y^{2}\\right)\\mathrm{e}^{x}=\\mathrm{e}^{x}\\left(2x^{2}-y^{2}+4x\\right),\\qquad f_y=-2y\\mathrm{e}^{x}.$$\n由 $f_y=0$ 得 $y=0$；代入 $f_x=0$ 得 $2x^{2}+4x=0$，即 $x=0$ 或 $x=-2$。驻点为 $(0,0)$ 与 $(-2,0)$。\n② 二阶偏导：\n$$f_{xx}=\\mathrm{e}^{x}\\left(2x^{2}-y^{2}+8x+4\\right),\\qquad f_{xy}=-2y\\mathrm{e}^{x},\\qquad f_{yy}=-2\\mathrm{e}^{x}.$$\n③ 判别：\n在 $(0,0)$：$A=f_{xx}=4$，$B=f_{xy}=0$，$C=f_{yy}=-2$，$AC-B^{2}=-8<0$，故 $(0,0)$ 不是极值点。\n在 $(-2,0)$：$A=-4\\mathrm{e}^{-2}$，$B=0$，$C=-2\\mathrm{e}^{-2}$，$AC-B^{2}=8\\mathrm{e}^{-4}>0$ 且 $A<0$，故 $(-2,0)$ 是极大值点。\n④ 极大值：\n$$f(-2,0)=2\\cdot4\\cdot\\mathrm{e}^{-2}=\\frac{8}{\\mathrm{e}^{2}}.$$\n函数只有这一个极值（极大值 $\\dfrac{8}{\\mathrm{e}^{2}}$），无极小值。",
      traps: "$f_{xx}$ 要对 $\\mathrm{e}^{x}\\left(2x^{2}-y^{2}+4x\\right)$ 用乘积法则，结果 $\\mathrm{e}^{x}\\left(2x^{2}-y^{2}+8x+4\\right)$ 里的 $8x$ 来自「$4x\\mathrm{e}^{x}$ 求导得 $4\\mathrm{e}^{x}$」与「$2x^{2}$ 求导得 $4x$ 再乘 $\\mathrm{e}^{x}$」的合并，漏项会把 $A$ 算错。$AC-B^{2}>0$ 时还必须看 $A$ 的符号定极大（$A<0$）还是极小（$A>0$）。",
      hint: "先由 $f_y=0$ 定 $y=0$，再解 $2x^{2}+4x=0$ 得两个驻点；逐点算 $AC-B^{2}$ 与 $A$ 的符号。",
      src: { file: "参考文件/真题/数学/2026年考研数学三真题及答案解析.pdf", page: 3, no: "三(19)", note: "题面取自 w3k-pics/p03_a.png（520 dpi 放大，核对 $\\left(2x^{2}-y^{2}\\right)\\mathrm{e}^{x}$）；答案与 2026 参考解析 p11（$(0,0)$ 处 $AC-B^{2}=-8<0$ 非极值；$(-2,0)$ 处 $AC-B^{2}=\\dfrac{8}{\\mathrm{e}^{4}}>0$ 且 $A<0$ 为极大值点，极大值 $\\dfrac{8}{\\mathrm{e}^{2}}$）对拍，独立重推一致。" }
    },
    {
      id: "m3-2026-20", origin: "year", year: 2026, no: "三(20)", type: "dblint", star: 4, school: "全国硕士研究生招生考试-数学三 2026 年",
      tags: ["dbi01","tp08","int23"],
      stem: "设区域 $D=\\{(x,y)\\mid0\\le x\\le1,\\ 0\\le y\\le1\\}$，求二重积分 $\\displaystyle\\iint_D\\frac{y}{\\left(1+x^{2}+y^{2}\\right)^{\\frac32}}\\,\\mathrm{d}x\\mathrm{d}y$。",
      answer: "化为先 $y$ 后 $x$ 的累次积分：\n$$\\iint_D\\frac{y\\,\\mathrm{d}x\\mathrm{d}y}{\\left(1+x^{2}+y^{2}\\right)^{3/2}}=\\int_0^{1}\\mathrm{d}x\\int_0^{1}\\frac{y\\,\\mathrm{d}y}{\\left(1+x^{2}+y^{2}\\right)^{3/2}}.$$\n内层令 $u=1+x^{2}+y^{2}$，则 $\\displaystyle\\int y\\,u^{-3/2}\\mathrm{d}y=\\frac12\\int u^{-3/2}\\mathrm{d}u=-u^{-1/2}$，故\n$$\\int_0^{1}\\frac{y\\,\\mathrm{d}y}{\\left(1+x^{2}+y^{2}\\right)^{3/2}}=\\left[-\\frac{1}{\\sqrt{1+x^{2}+y^{2}}}\\right]_0^{1}=\\frac{1}{\\sqrt{1+x^{2}}}-\\frac{1}{\\sqrt{2+x^{2}}}.$$\n于是\n$$\\text{原式}=\\int_0^{1}\\left(\\frac{1}{\\sqrt{1+x^{2}}}-\\frac{1}{\\sqrt{2+x^{2}}}\\right)\\mathrm{d}x=\\Big[\\ln\\left(x+\\sqrt{1+x^{2}}\\right)-\\ln\\left(x+\\sqrt{2+x^{2}}\\right)\\Big]_0^{1}.$$\n代入 $x=1$ 得 $\\ln\\left(1+\\sqrt2\\right)-\\ln\\left(1+\\sqrt3\\right)$，代入 $x=0$ 得 $\\ln1-\\ln\\sqrt2=-\\dfrac12\\ln2$，相减得\n$$\\text{原式}=\\ln\\left(1+\\sqrt2\\right)-\\ln\\left(1+\\sqrt3\\right)+\\ln\\sqrt2=\\ln\\frac{2+\\sqrt2}{1+\\sqrt3}.$$",
      traps: "指数是 $\\dfrac32$，积分后是 $-\\dfrac{2}{2}u^{-1/2}=-u^{-1/2}$（$-\\dfrac12$ 与 $-2$ 相消），漏掉负号会把两项顺序写反。下限 $y=0$ 代入给 $-\\dfrac{1}{\\sqrt{1+x^{2}}}$，是减项，代上、下限时最容易漏。$\\displaystyle\\int\\frac{\\mathrm{d}x}{\\sqrt{a^{2}+x^{2}}}=\\ln\\left(x+\\sqrt{a^{2}+x^{2}}\\right)$ 别写成 $\\arcsin$ 形式。",
      hint: "先对 $y$ 积分（把 $1+x^{2}$ 当常数），得 $\\dfrac{1}{\\sqrt{1+x^{2}}}-\\dfrac{1}{\\sqrt{2+x^{2}}}$，再用 $\\int\\dfrac{\\mathrm{d}x}{\\sqrt{a^{2}+x^{2}}}=\\ln\\left(x+\\sqrt{a^{2}+x^{2}}\\right)$ 并认真代上下限。",
      src: { file: "参考文件/真题/数学/2026年考研数学三真题及答案解析.pdf", page: 3, no: "三(20)", note: "题面取自 w3k-pics/p03_20f.png（560 dpi 二次裁剪，确认分母指数为 $\\dfrac32$ 而非 3）；答案与 2026 参考解析 p12（原式 $=\\ln\\left(1+\\sqrt2\\right)-\\ln\\left(1+\\sqrt3\\right)+\\ln\\sqrt2=\\ln\\dfrac{2+\\sqrt2}{1+\\sqrt3}$）对拍，独立重推一致（册上末行把结果写成 $\\ln\\left(1+\\sqrt2\\right)-\\ln\\left(1+\\sqrt3\\right)+\\ln\\sqrt2$，与 $\\ln\\dfrac{2+\\sqrt2}{1+\\sqrt3}$ 等价）。" }
    },
    {
      id: "m3-2026-21", origin: "year", year: 2026, no: "三(21)", type: "linalg", star: 5, school: "全国硕士研究生招生考试-数学三 2026 年",
      tags: ["zb06","kn44","zb10"],
      stem: "已知向量 $\\alpha_1=\\begin{pmatrix}1\\\\0\\\\-1\\\\-1\\end{pmatrix}$，$\\alpha_2=\\begin{pmatrix}1\\\\-1\\\\0\\\\-2\\end{pmatrix}$，$\\alpha_3=\\begin{pmatrix}0\\\\-1\\\\1\\\\-1\\end{pmatrix}$，$\\alpha_4=\\begin{pmatrix}0\\\\1\\\\-1\\\\1\\end{pmatrix}$，记 $A=\\left(\\alpha_1,\\alpha_2,\\alpha_3,\\alpha_4\\right)$，$G=\\left(\\alpha_1,\\alpha_2\\right)$。\n(1) 证明：$\\alpha_1,\\alpha_2$ 是 $\\alpha_1,\\alpha_2,\\alpha_3,\\alpha_4$ 的极大线性无关组；\n(2) 求矩阵 $H$ 使得 $A=GH$，并求 $A^{10}$。",
      answer: "(1) 直接观察：\n$$\\alpha_3=\\alpha_2-\\alpha_1=\\begin{pmatrix}0\\\\-1\\\\1\\\\-1\\end{pmatrix},\\qquad \\alpha_4=\\alpha_1-\\alpha_2=\\begin{pmatrix}0\\\\1\\\\-1\\\\1\\end{pmatrix},$$\n故 $\\alpha_3,\\alpha_4$ 均可由 $\\alpha_1,\\alpha_2$ 线性表示。又 $\\alpha_1,\\alpha_2$ 的前两个分量 $(1,0)^{T}$ 与 $(1,-1)^{T}$ 不成比例，故 $\\alpha_1,\\alpha_2$ 线性无关。于是 $r\\left(\\alpha_1,\\alpha_2,\\alpha_3,\\alpha_4\\right)=2$，$\\alpha_1,\\alpha_2$ 是极大线性无关组。\n（初等行变换验证：$\\left(\\alpha_1,\\alpha_2,\\alpha_3,\\alpha_4\\right)=\\begin{pmatrix}1&1&0&0\\\\0&-1&-1&1\\\\-1&0&1&-1\\\\-1&-2&-1&1\\end{pmatrix}\\to\\begin{pmatrix}1&1&0&0\\\\0&1&1&-1\\\\0&0&0&0\\\\0&0&0&0\\end{pmatrix}$，秩为 $2$。）\n(2) 设 $A=GH$，其中 $G=\\left(\\alpha_1,\\alpha_2\\right)$ 为 $4\\times2$、$H=\\left(h_{ij}\\right)$ 为 $2\\times4$，则 $A$ 的第 $j$ 列 $=h_{1j}\\alpha_1+h_{2j}\\alpha_2$。由\n$$\\alpha_1=1\\cdot\\alpha_1+0\\cdot\\alpha_2,\\quad \\alpha_2=0\\cdot\\alpha_1+1\\cdot\\alpha_2,\\quad \\alpha_3=-1\\cdot\\alpha_1+1\\cdot\\alpha_2,\\quad \\alpha_4=1\\cdot\\alpha_1-1\\cdot\\alpha_2$$\n得\n$$H=\\begin{pmatrix}1&0&-1&1\\\\0&1&1&-1\\end{pmatrix}.$$\n又\n$$HG=\\begin{pmatrix}1&0&-1&1\\\\0&1&1&-1\\end{pmatrix}\\begin{pmatrix}1&1\\\\0&-1\\\\-1&0\\\\-1&-2\\end{pmatrix}=\\begin{pmatrix}1&-1\\\\0&1\\end{pmatrix},$$\n而 $\\begin{pmatrix}1&-1\\\\0&1\\end{pmatrix}^{k}=\\begin{pmatrix}1&-k\\\\0&1\\end{pmatrix}$（幂零对角块，二项式展开只有两项），故 $(HG)^{9}=\\begin{pmatrix}1&-9\\\\0&1\\end{pmatrix}$。于是\n$$A^{10}=(GH)^{10}=G(HG)^{9}H=\\begin{pmatrix}1&1\\\\0&-1\\\\-1&0\\\\-1&-2\\end{pmatrix}\\begin{pmatrix}1&-9\\\\0&1\\end{pmatrix}\\begin{pmatrix}1&0&-1&1\\\\0&1&1&-1\\end{pmatrix}=\\begin{pmatrix}1&-8&-9&9\\\\0&-1&-1&1\\\\-1&9&10&-10\\\\-1&7&8&-8\\end{pmatrix}.$$",
      traps: "$A^{10}\\ne G^{10}H^{10}$——$G$ 是 $4\\times2$、$H$ 是 $2\\times4$，都不是方阵，幂次无定义。必须结合成 $G(HG)^{9}H$，把幂次压到 $2$ 阶方阵 $HG$ 上。求 $H$ 时 $\\alpha_3,\\alpha_4$ 的系数符号容易写反（$\\alpha_3=\\alpha_2-\\alpha_1$ 对应第三列 $(-1,1)^{T}$，不是 $(1,-1)^{T}$）。$\\begin{pmatrix}1&-1\\\\0&1\\end{pmatrix}^{k}=\\begin{pmatrix}1&-k\\\\0&1\\end{pmatrix}$ 要作为结论直接引用，硬乘十次必错。",
      hint: "$\\alpha_3=\\alpha_2-\\alpha_1$、$\\alpha_4=\\alpha_1-\\alpha_2$ 一望即得 $H$；再算 $HG$（$2$ 阶），用 $A^{10}=G(HG)^{9}H$ 与 $\\begin{pmatrix}1&-1\\\\0&1\\end{pmatrix}^{k}$ 的公式。",
      src: { file: "参考文件/真题/数学/2026年考研数学三真题及答案解析.pdf", page: 3, no: "三(21)", note: "题面取自 w3k-pics/p03_21v.png（560 dpi 二次裁剪，四个列向量的 16 个分量逐个核对正负号，$A=\\left(\\alpha_1,\\alpha_2,\\alpha_3,\\alpha_4\\right)$、$G=\\left(\\alpha_1,\\alpha_2\\right)$）；答案与 2026 参考解析 p12–p14 对拍（$H=\\begin{pmatrix}1&0&-1&1\\\\0&1&1&-1\\end{pmatrix}$，$HG=\\begin{pmatrix}1&-1\\\\0&1\\end{pmatrix}$，$A^{10}=\\begin{pmatrix}1&-8&-9&9\\\\0&-1&-1&1\\\\-1&9&10&-10\\\\-1&7&8&-8\\end{pmatrix}$）完全一致，独立重推逐元素相符（并用「行和＝$G(HG)^9H\\mathbf{1}$」作交叉验算）。" }
    },
    {
      id: "m3-2026-22", origin: "year", year: 2026, no: "三(22)", type: "estimate", star: 4, school: "全国硕士研究生招生考试-数学三 2026 年",
      tags: ["zt04","tp02"],
      stem: "设某种原件的寿命服从指数分布，其均值为 $\\theta$（未知参数），为了估计 $\\theta$，取 $n$ 个这种原件同时做寿命试验，试验到出现 $k\\ (1\\le k\\le n)$ 个元件失效时停止工作。\n(1) 若 $k=1$，失效元件的寿命记为 $T$，①求 $T$ 的概率密度；②记 $\\hat{\\theta}=aT$，求常数 $a$，使得 $E\\left(\\hat{\\theta}\\right)=\\theta$，并求 $D\\left(\\hat{\\theta}\\right)$；\n(2) 已知 $k$ 个失效元件寿命值为 $t_1,t_2,\\cdots,t_k$，若 $t_1\\le t_2\\le\\cdots\\le t_k$，似然函数为 $L(\\theta)=\\dfrac{1}{\\theta^{k}}\\mathrm{e}^{-\\frac{1}{\\theta}\\left[\\sum\\limits_{i=1}^{k}t_i+(n-k)t_k\\right]}$，求 $\\theta$ 的最大似然估计值。",
      answer: "(1) ① 设 $X_1,X_2,\\cdots,X_n$ 为 $n$ 个元件的寿命，均值为 $\\theta$ 的指数分布密度为 $\\dfrac1\\theta\\mathrm{e}^{-x/\\theta}\\ (x>0)$。$k=1$ 时 $T=\\min\\left\\{X_1,\\cdots,X_n\\right\\}$，由独立性\n$$P\\{T>t\\}=\\prod_{i=1}^{n}P\\left\\{X_i>t\\right\\}=\\left(\\mathrm{e}^{-t/\\theta}\\right)^{n}=\\mathrm{e}^{-nt/\\theta}\\qquad(t\\ge0),$$\n故 $F_T(t)=1-\\mathrm{e}^{-nt/\\theta}$，求导得\n$$f_T(t)=\\begin{cases}\\dfrac{n}{\\theta}\\mathrm{e}^{-\\frac{nt}{\\theta}},&t\\ge0,\\\\[2mm]0,&t<0.\\end{cases}$$\n即 $T\\sim E\\left(\\dfrac{n}{\\theta}\\right)$，$E(T)=\\dfrac{\\theta}{n}$，$D(T)=\\dfrac{\\theta^{2}}{n^{2}}$。\n② 由无偏性 $E\\left(\\hat{\\theta}\\right)=aE(T)=\\dfrac{a\\theta}{n}=\\theta$ 得 $a=n$；此时\n$$D\\left(\\hat{\\theta}\\right)=D(nT)=n^{2}D(T)=n^{2}\\cdot\\frac{\\theta^{2}}{n^{2}}=\\theta^{2}.$$\n(2) 取对数：\n$$\\ln L(\\theta)=-k\\ln\\theta-\\frac{1}{\\theta}\\left[\\sum_{i=1}^{k}t_i+(n-k)t_k\\right].$$\n记 $S=\\sum\\limits_{i=1}^{k}t_i+(n-k)t_k$，令\n$$\\frac{\\mathrm{d}\\ln L}{\\mathrm{d}\\theta}=-\\frac{k}{\\theta}+\\frac{S}{\\theta^{2}}=0\\ \\Longrightarrow\\ \\hat{\\theta}=\\frac{S}{k}=\\frac{\\sum\\limits_{i=1}^{k}t_i+(n-k)t_k}{k}.$$\n又 $\\dfrac{\\mathrm{d}^{2}\\ln L}{\\mathrm{d}\\theta^{2}}=-\\dfrac{k}{\\hat{\\theta}^{2}}<0$，故确为最大值点，最大似然估计值即上式的观测值。",
      traps: "$T$ 是 $n$ 个指数寿命的**最小值**，参数由 $\\dfrac1\\theta$ 变为 $\\dfrac{n}{\\theta}$（均值 $\\dfrac{\\theta}{n}$）——漏掉 $n$ 会得 $a=1$。$D\\left(\\hat{\\theta}\\right)=a^{2}D(T)$，$a^{2}=n^{2}$ 与 $D(T)=\\dfrac{\\theta^{2}}{n^{2}}$ 恰好相消成 $\\theta^{2}$，别把 $D(nT)$ 写成 $nD(T)$。第 (2) 问的 $S$ 里 $n-k$ 个未失效元件只按 $t_k$ 计入（截尾试验），不是把 $n$ 个 $t_i$ 全加。",
      hint: "先用 $P\\{T>t\\}=\\left[P\\{X_1>t\\}\\right]^{n}$ 求 $T$ 的分布，再取 $a=n$ 做无偏；MLE 只需求解 $\\dfrac{\\mathrm{d}\\ln L}{\\mathrm{d}\\theta}=0$。",
      src: { file: "参考文件/真题/数学/2026年考研数学三真题及答案解析.pdf", page: 3, no: "三(22)", note: "题面取自 w3k-pics/p03.png 与 p03_c.png / p03_d.png（470 dpi 放大，核对截尾条件 $1\\le k\\le n$、似然函数指数部分 $\\sum\\limits_{i=1}^{k}t_i+(n-k)t_k$）；答案与 2026 参考解析 p14–p15（$f_T(t)=\\dfrac{n}{\\theta}\\mathrm{e}^{-\\frac{nt}{\\theta}}$，$a=n$，$D\\left(\\hat{\\theta}\\right)=\\theta^{2}$，$\\hat{\\theta}=\\dfrac{\\sum\\limits_{i=1}^{k}t_i+(n-k)t_k}{k}$）对拍，独立重推一致。" }
    },
  // ==== BEGIN GENERATED card-questions (t49) ====
    {
      id: "cv-m3-inf08", origin: 'card', year: 2025, school: "全国硕士研究生招生考试-数学三 2025 年", no: "未编号", type: "limit", star: 5,
      tags: ["inf08"],
      stem: "（2025 数三）当 $x\\to0^{+}$ 时，下列无穷小量中与 $x$ 等价的是：(A) $e^{-\\sin x}-1$；(B) $\\sqrt{x+1}-\\cos x$；(C) $1-\\cos\\sqrt{2x}$；(D) $1-\\dfrac{\\ln(1+x)}{x}$",
      answer: "由 $1-\\cos u\\sim\\dfrac{u^{2}}{2}$ 得 $1-\\cos\\sqrt{2x}\\sim\\dfrac{(\\sqrt{2x})^{2}}{2}=x$，故选 (C)。其余：$e^{-\\sin x}-1\\sim-\\sin x\\sim-x$；$\\sqrt{x+1}-\\cos x\\sim\\dfrac{x}{2}$；$1-\\dfrac{\\ln(1+x)}{x}\\sim\\dfrac{x}{2}$。",
      traps: "$1-\\cos u\\sim\\frac{u^2}{2}$ 中 $u$ 可为复合量，替换后要整体平方，勿丢系数或漏代入 $u$。",
      src: { card: "inf08", note: "卡片例题（data/math3.js 的 EXAMPLE[\"inf08\"][0]）来源原文：2025 年数三真题。traps 取自 PITFALL[inf08]。MNEM[inf08] 无条目 → 省略 hint 字段。" }
    },
    {
      id: "cv-m3-int25", origin: 'card', year: 2013, school: "全国硕士研究生入学统一考试-数学三 2013 年", no: "未编号", type: "integral", star: 5,
      tags: ["int25"],
      stem: "设 $F(x)=\\int_{x}^{x^{2}}\\frac{\\sin t}{t}\\,dt$，求 $F'(x)$（综合：变限积分求导与上下限均含 $x$）",
      answer: "由莱布尼茨公式：$$F'(x)=\\frac{\\sin(x^{2})}{x^{2}}\\cdot(x^{2})'-\\frac{\\sin x}{x}\\cdot(x)'=\\frac{\\sin(x^{2})}{x^{2}}\\cdot2x-\\frac{\\sin x}{x}=\\frac{2\\sin(x^{2})}{x}-\\frac{\\sin x}{x}$$",
      traps: "变限积分求导勿忘乘上限导数，且上下限都含 $x$ 时要拆成两段相减再求导。",
      hint: "变限积分求导：上限代入乘以上限导数，减下限代入乘以下限导数——「上导减下导」。",
      src: { card: "int25", note: "卡片例题（data/math3.js 的 EXAMPLE[\"int25\"][0]）来源原文：2013 年数三真题。traps 取自 PITFALL[int25]。hint 取自 MNEM[int25]。" }
    },
    {
      id: "cv-m3-tay01", origin: 'card', year: 2017, school: "全国硕士研究生招生考试-数学三 2017 年", no: "未编号", type: "limit", star: 5,
      tags: ["tay01"],
      stem: "求 $\\lim_{x\\to0}\\frac{e^{x}-1-x}{x^{2}}$",
      answer: "由 $e^{x}=1+x+\\dfrac{x^{2}}{2}+o(x^{2})$，得$$\\lim_{x\\to0}\\frac{e^{x}-1-x}{x^{2}}=\\frac{1}{2}$$",
      altAnswer: "两次洛必达：$$\\lim_{x\\to0}\\frac{e^x-1-x}{x^2}=\\lim_{x\\to0}\\frac{e^x-1}{2x}=\\lim_{x\\to0}\\frac{e^x}{2}=\\frac12$$（无需记忆 $e^x$ 展开式）",
      traps: "泰勒展开必须展开到与分母同阶：分母是 $x^k$ 时分子要展到 $x^k$ 并带 $o(x^k)$，否则截断误差致错。",
      hint: "$e^{x}$ 展开：「一阶一阶来，系数是阶乘倒数」：$1+x+\\frac{x^2}{2!}+\\frac{x^3}{3!}+\\cdots$。",
      src: { card: "tay01", note: "卡片例题（data/math3.js 的 EXAMPLE[\"tay01\"]）来源原文：2017 年数三真题。traps 取自 PITFALL[tay01]。hint 取自 MNEM[tay01]。" }
    },
    {
      id: "cv-m3-mvt02", origin: 'card', year: 2016, school: "全国硕士研究生招生考试-数学三 2016 年", no: "未编号", type: "proof", star: 5,
      tags: ["mvt02"],
      stem: "证明：当 $x>0$ 时，$\\dfrac{x}{1+x}<\\ln(1+x)<x$",
      answer: "对 $f(t)=\\ln(1+t)$ 在 $[0,x]$ 用拉格朗日中值定理：存在 $\\xi\\in(0,x)$ 使 $\\ln(1+x)=\\dfrac{x}{1+\\xi}$；由 $0<\\xi<x$ 得 $\\dfrac{x}{1+x}<\\dfrac{x}{1+\\xi}<x$，即证。",
      altAnswer: "用已知不等式 $\\ln(1+x)<x$；又 $1+x=\\dfrac{1}{1-\\frac{x}{1+x}}$，故 $\\ln(1+x)=-\\ln\\left(1-\\dfrac{x}{1+x}\\right)>\\dfrac{x}{1+x}$（用到 $-\\ln(1-u)>u$，$0<u<1$）。合起来即 $\\dfrac{x}{1+x}<\\ln(1+x)<x$，无需构造辅助函数。",
      src: { card: "mvt02", note: "卡片例题（data/math3.js 的 EXAMPLE[\"mvt02\"]）来源原文：2016 年数三真题。PITFALL[mvt02] 无条目 → 省略 traps 字段。MNEM[mvt02] 无条目 → 省略 hint 字段。" }
    },
    {
      id: "cv-m3-ser10", origin: 'card', year: 2009, school: "全国硕士研究生入学统一考试-数学三 2009 年", no: "未编号", type: "series", star: 5,
      tags: ["ser10"],
      stem: "求幂级数 $\\sum_{n=1}^{\\infty}\\frac{x^{n}}{n}$ 的收敛域，并在收敛域内求其和函数",
      answer: "$$R=\\lim_{n\\to\\infty}\\left|\\frac{a_{n}}{a_{n+1}}\\right|=\\lim_{n\\to\\infty}\\frac{n+1}{n}=1$$端点 $x=-1$ 为交错级数收敛，$x=1$ 为调和级数发散，故收敛域 $[-1,1)$。设和函数 $S(x)=\\sum_{n=1}^{\\infty}\\frac{x^{n}}{n}$，则$$S'(x)=\\sum_{n=1}^{\\infty}x^{n-1}=\\frac{1}{1-x}\\ (|x|<1)$$积分并由 $S(0)=0$ 得$$S(x)=-\\ln(1-x),\\quad x\\in[-1,1)$$",
      altAnswer: "由已知展开 $\\ln(1-x)=-\\sum_{n=1}^{\\infty}\\frac{x^n}{n}\\ (|x|<1)$ 直接得 $S(x)=-\\ln(1-x)$；端点 $x=-1$ 处为交错级数收敛，$x=1$ 处发散，故收敛域 $[-1,1)$。免去逐项求导再积分。",
      traps: "收敛半径求出后，区间端点的敛散性必须单独判定，勿直接写成闭区间。",
      src: { card: "ser10", note: "卡片例题（data/math3.js 的 EXAMPLE[\"ser10\"]）来源原文：2009 年数三真题。traps 取自 PITFALL[ser10]。MNEM[ser10] 无条目 → 省略 hint 字段。" }
    },
    {
      id: "cv-m3-ode02", origin: 'card', year: 2022, school: "全国硕士研究生招生考试-数学三 2022 年", no: "未编号", type: "ode", star: 5,
      tags: ["ode02"],
      stem: "求一阶线性方程 $y'+y=x$ 的通解",
      answer: "$$y=e^{-x}\\left[\\int x\\,e^{x}\\,dx+C\\right]=e^{-x}\\left[(x-1)e^{x}+C\\right]=(x-1)+Ce^{-x}$$",
      altAnswer: "设特解 $y^*=ax+b$（右端为一次多项式），代入 $y'+y=x$ 得 $a+ax+b=x$，比较系数 $a=1,\\ a+b=0\\Rightarrow b=-1$。齐次解 $Ce^{-x}$，故通解 $y=x-1+Ce^{-x}$，免去积分。",
      traps: "一阶线性公式 $e^{-\\int Pdx}$ 与括号内 $e^{+\\int Pdx}$ 指数符号相反，勿同号；漏放积分常数 $C$ 也是高频错。",
      src: { card: "ode02", note: "卡片例题（data/math3.js 的 EXAMPLE[\"ode02\"][0]）来源原文：2022 年数三真题。traps 取自 PITFALL[ode02]。MNEM[ode02] 无条目 → 省略 hint 字段。" }
    },
    {
      id: "cv-m3-multi03", origin: 'card', year: 2012, school: "全国硕士研究生入学统一考试-数学三 2012 年", no: "未编号", type: "multivar", star: 5,
      tags: ["multi03"],
      stem: "求 $f(x,y)=x^{3}+y^{3}-3xy$ 的极值（判断驻点是否为极值点）",
      answer: "由 $f_{x}=3x^{2}-3y=0,\\ f_{y}=3y^{2}-3x=0$ 得 $y=x^{2},\\ x=y^{2}$，故 $x^{4}=x$，驻点为 $(0,0)$ 与 $(1,1)$。$$f_{xx}=6x,\\ f_{xy}=-3,\\ f_{yy}=6y,\\ \\Delta=AC-B^{2}=36xy-9$$在 $(0,0)$：$\\Delta=-9<0$，为鞍点，非极值；在 $(1,1)$：$\\Delta=27>0$ 且 $A=6>0$，取极小值 $f(1,1)=1+1-3=-1$。",
      traps: "$\\Delta=AC-B^2=0$ 时判别式失效，需用定义或配方判断，勿误判为极值。",
      src: { card: "multi03", note: "卡片例题（data/math3.js 的 EXAMPLE[\"multi03\"][0]）来源原文：2012 年数三真题。traps 取自 PITFALL[multi03]。MNEM[multi03] 无条目 → 省略 hint 字段。" }
    },
    {
      id: "cv-m3-lim12", origin: 'card', year: 2003, school: "全国硕士研究生入学统一考试-数学三 2003 年", no: "未编号", type: "limit", star: 4,
      tags: ["lim12"],
      stem: "求 $\\lim_{n\\to\\infty}\\sqrt[n]{2^{n}+3^{n}}$",
      answer: "由 $3=\\sqrt[n]{3^{n}}\\le\\sqrt[n]{2^{n}+3^{n}}\\le\\sqrt[n]{2\\cdot3^{n}}=3\\sqrt[n]{2}\\to3$，夹逼得极限 $=3$。",
      altAnswer: "提取最大项：$$\\sqrt[n]{2^n+3^n}=3\\sqrt[n]{1+\\left(\\tfrac23\\right)^n}\\to3\\cdot1=3$$比构造双边夹逼更直接。",
      traps: "夹逼准则要求两边极限存在且相等；放缩过松使两边极限不等时夹逼失败，需换更紧的放缩。",
      src: { card: "lim12", note: "卡片例题（data/math3.js 的 EXAMPLE[\"lim12\"]）来源原文：2003 年数三真题。traps 取自 PITFALL[lim12]。MNEM[lim12] 无条目 → 省略 hint 字段。" }
    },
    {
      id: "cv-m3-inf01", origin: 'card', year: 2011, school: "全国硕士研究生入学统一考试-数学三 2011 年", no: "未编号", type: "limit", star: 5,
      tags: ["inf01"],
      stem: "（2011 数三）当 $x\\to0$ 时，$3\\sin x-\\sin 3x$ 与 $c x^{k}$ 为等价无穷小，求 $k$ 与 $c$ 的值。",
      answer: "由 $\\sin 3x=3\\sin x-4\\sin^{3}x$ 得$$3\\sin x-\\sin 3x=4\\sin^{3}x\\sim4x^{3}$$故与 $4x^{3}$ 等价，$k=3,\\ c=4$。",
      traps: "等价无穷小只能整体替换乘除因式；加减项不能分别替换（如 $\\sin x-\\tan x$ 不能换成 $x-x=0$）。",
      src: { card: "inf01", note: "卡片例题（data/math3.js 的 EXAMPLE[\"inf01\"]）来源原文：2011 年数三真题。traps 取自 PITFALL[inf01]。MNEM[inf01] 无条目 → 省略 hint 字段。" }
    },
    {
      id: "cv-m3-inf06", origin: 'card', year: 2021, school: "全国硕士研究生招生考试-数学三 2021 年", no: "未编号", type: "limit", star: 5,
      tags: ["inf06"],
      stem: "求 $\\lim_{x\\to0}\\frac{e^{x}-e^{\\sin x}}{x-\\sin x}$（综合：$e^{x}-1\\sim x$ 与 $\\sin x\\sim x$）",
      answer: "$$e^{x}-e^{\\sin x}=e^{\\sin x}\\left(e^{x-\\sin x}-1\\right)$$令 $t=x-\\sin x\\to0$，则 $e^{t}-1\\sim t$，故$$\\lim_{x\\to0}\\frac{e^{x}-e^{\\sin x}}{x-\\sin x}=\\lim_{x\\to0}e^{\\sin x}\\cdot\\frac{e^{x-\\sin x}-1}{x-\\sin x}=e^{0}\\cdot1=1$$",
      altAnswer: "对 $f(u)=e^u$ 在 $[\\sin x,x]$ 用拉格朗日中值：$$e^x-e^{\\sin x}=e^{\\xi}(x-\\sin x),\\quad \\xi\\ \\text{介于}\\ \\sin x\\ \\text{与}\\ x\\ \\text{之间}$$当 $x\\to0$ 时 $\\xi\\to0$，故$$\\lim_{x\\to0}\\frac{e^x-e^{\\sin x}}{x-\\sin x}=\\lim_{x\\to0}e^{\\xi}=1$$",
      traps: "$e^u-1\\sim u$ 要求 $u\\to0$；$e^{x-\\sin x}-1\\sim x-\\sin x$ 而非 $\\sim x$，先确认括号内趋于 0。",
      src: { card: "inf06", note: "卡片例题（data/math3.js 的 EXAMPLE[\"inf06\"]）来源原文：2021 年数三真题。traps 取自 PITFALL[inf06]。MNEM[inf06] 无条目 → 省略 hint 字段。" }
    },
    {
      id: "cv-m3-tay02", origin: 'card', year: 2002, school: "全国硕士研究生入学统一考试-数学三 2002 年", no: "未编号", type: "limit", star: 5,
      tags: ["tay02"],
      stem: "求 $\\lim_{x\\to0}\\frac{\\sin x-x}{x^{3}}$",
      answer: "由 $\\sin x=x-\\dfrac{x^{3}}{6}+o(x^{3})$，得$$\\lim_{x\\to0}\\frac{\\sin x-x}{x^{3}}=-\\frac{1}{6}$$",
      altAnswer: "三次洛必达：$$\\lim_{x\\to0}\\frac{\\sin x-x}{x^3}=\\lim_{x\\to0}\\frac{\\cos x-1}{3x^2}=\\lim_{x\\to0}\\frac{-\\sin x}{6x}=-\\frac16$$（中间步也可用 $1-\\cos x\\sim\\frac{x^2}{2}$ 加速）",
      src: { card: "tay02", note: "卡片例题（data/math3.js 的 EXAMPLE[\"tay02\"]）来源原文：2002 年数三真题。PITFALL[tay02] 无条目 → 省略 traps 字段。MNEM[tay02] 无条目 → 省略 hint 字段。" }
    },
    {
      id: "cv-m3-mvt01", origin: 'card', year: 2000, school: "全国硕士研究生入学统一考试-数学三 2000 年", no: "未编号", type: "proof", star: 4,
      tags: ["mvt01"],
      stem: "设 $f(x)$ 在 $[0,\\pi]$ 上连续，且 $\\int_{0}^{\\pi}f(x)\\cos x\\,dx=\\int_{0}^{\\pi}f(x)\\sin x\\,dx=0$，证明 $f(x)$ 在 $(0,\\pi)$ 内至少有两个零点。（2000 年数三真题）",
      answer: "反证：由 $\\int_{0}^{\\pi}f\\sin x\\,dx=0$ 且 $\\sin x>0$，知 $f$ 在 $(0,\\pi)$ 内至少有一个零点；设其恰有一个零点 $x_{0}$。令 $g(x)=f(x)\\sin(x-x_{0})$，则 $g$ 在 $(0,\\pi)$ 上不变号且不恒为零，故 $\\int_{0}^{\\pi}g\\,dx\\neq0$。但 $\\sin(x-x_{0})=\\sin x\\cos x_{0}-\\cos x\\sin x_{0}$，由题设两积分为 $0$ 得 $\\int_{0}^{\\pi}g\\,dx=0$，矛盾。故至少两个零点。",
      src: { card: "mvt01", note: "卡片例题（data/math3.js 的 EXAMPLE[\"mvt01\"]）来源原文：2000 年数三真题。PITFALL[mvt01] 无条目 → 省略 traps 字段。MNEM[mvt01] 无条目 → 省略 hint 字段。" }
    },
    {
      id: "cv-m3-ode01", origin: 'card', year: 2015, school: "全国硕士研究生招生考试-数学三 2015 年", no: "未编号", type: "ode", star: 5,
      tags: ["ode01"],
      stem: "（2015 数三）设函数 $y=f(x)$ 可导且 $f(0)=2$。曲线 $y=f(x)$ 在点 $(x_0,f(x_0))$ 处的切线与 $x$ 轴交于点 $\\left(x_0-\\dfrac{f(x_0)}{f'(x_0)},0\\right)$，且该切线与 $x$ 轴及直线 $x=x_0$ 所围三角形的面积为 $4$，求 $f(x)$。",
      answer: "三角形面积 $=\\dfrac12\\cdot\\left|\\dfrac{f(x_0)}{f'(x_0)}\\right|\\cdot|f(x_0)|=4$，即 $\\dfrac{f^{2}}{|f'|}=8$，取 $y'=\\dfrac{y^{2}}{8}$（符号由面积取绝对值吸收）。分离变量：$$\\frac{dy}{y^{2}}=\\frac{dx}{8}\\ \\Rightarrow\\ -\\frac{1}{y}=\\frac{x}{8}+C$$由 $f(0)=2$ 得 $C=-\\frac12$，故$$f(x)=\\frac{8}{4-x}$$",
      src: { card: "ode01", note: "卡片例题（data/math3.js 的 EXAMPLE[\"ode01\"]）来源原文：2015 年数三真题。PITFALL[ode01] 无条目 → 省略 traps 字段。MNEM[ode01] 无条目 → 省略 hint 字段。" }
    },
    {
      id: "cv-m3-dr09", origin: 'card', year: 2018, school: "全国硕士研究生招生考试-数学三 2018 年", no: "未编号", type: "deriv", star: 3,
      tags: ["dr09"],
      stem: "（2018 数三）设 $f(x)=\\cos\\sqrt{|x|}$，求 $f$ 在 $x=0$ 处的左、右导数，并判断 $f$ 在 $x=0$ 处是否可导。",
      answer: "用 $1-\\cos u\\sim\\frac{u^{2}}{2}$：$$f_+'(0)=\\lim_{x\\to0^{+}}\\frac{\\cos\\sqrt{x}-1}{x}=\\lim_{x\\to0^{+}}\\frac{-\\frac{x}{2}}{x}=-\\frac12,\\qquad f_-'(0)=\\lim_{x\\to0^{-}}\\frac{\\cos\\sqrt{-x}-1}{x}=\\lim_{x\\to0^{-}}\\frac{\\frac{x}{2}}{x}=\\frac12$$左右导数不相等，故 $f$ 在 $x=0$ 处不可导（即当年选择题的 D 选项）。",
      src: { card: "dr09", note: "卡片例题（data/math3.js 的 EXAMPLE[\"dr09\"]）来源原文：2018 年数三真题。PITFALL[dr09] 无条目 → 省略 traps 字段。MNEM[dr09] 无条目 → 省略 hint 字段。" }
    },
    {
      id: "cv-m3-ode04", origin: 'card', year: 2021, school: "全国硕士研究生招生考试-数学三 2021 年", no: "未编号", type: "ode", star: 4,
      tags: ["ode04"],
      stem: "求差分方程 $\\Delta y_{t}=t$（即 $y_{t+1}-y_{t}=t$）的通解",
      answer: "齐次方程 $y_{t+1}-y_{t}=0$ 的通解为 $y_{t}=C$。设非齐次特解 $y_{t}^{*}=At^{2}+Bt$，则$$\\Delta y_{t}^{*}=A[(t+1)^{2}-t^{2}]+B[(t+1)-t]=2At+(A+B)=t$$得 $A=\\frac12,\\ B=-\\frac12$，特解 $y_{t}^{*}=\\frac{t^{2}-t}{2}$。故通解$$y_{t}=C+\\frac{t(t-1)}{2}$$",
      src: { card: "ode04", note: "卡片例题（data/math3.js 的 EXAMPLE[\"ode04\"]）来源原文：2021 年数三真题。PITFALL[ode04] 无条目 → 省略 traps 字段。MNEM[ode04] 无条目 → 省略 hint 字段。" }
    },
    {
      id: "cv-m3-la10", origin: 'card', year: 2017, school: "全国硕士研究生招生考试-数学三 2017 年", no: "未编号", type: "linalg", star: 5,
      tags: ["la10"],
      stem: "设 $\\alpha$ 为 3 维单位列向量，$E$ 为 3 阶单位矩阵，判断 $E-\\alpha\\alpha^{T}$ 是否可逆",
      answer: "因 $\\alpha^{T}\\alpha=1$，秩为 $1$ 的矩阵 $\\alpha\\alpha^{T}$ 的三个特征值为 $1,0,0$（其迹 $\\mathrm{tr}(\\alpha\\alpha^{T})=\\alpha^{T}\\alpha=1$）。故 $E-\\alpha\\alpha^{T}$ 的三个特征值为 $0,1,1$，于是$$|E-\\alpha\\alpha^{T}|=0\\times1\\times1=0$$所以 $E-\\alpha\\alpha^{T}$ 不可逆。",
      altAnswer: "由 $\\alpha^T\\alpha=1$，得$$(E-\\alpha\\alpha^T)\\alpha=\\alpha-\\alpha(\\alpha^T\\alpha)=\\alpha-\\alpha=0$$即非零向量 $\\alpha$ 满足 $(E-\\alpha\\alpha^T)\\alpha=0$，故 $E-\\alpha\\alpha^T$ 有非零解、不可逆，一行即证。",
      src: { card: "la10", note: "卡片例题（data/math3.js 的 EXAMPLE[\"la10\"]）来源原文：2017 年数三真题。PITFALL[la10] 无条目 → 省略 traps 字段。MNEM[la10] 无条目 → 省略 hint 字段。" }
    },
    {
      id: "cv-m3-la14", origin: 'card', year: 2011, school: "全国硕士研究生入学统一考试-数学三 2011 年", no: "未编号", type: "eigen", star: 4,
      tags: ["la14"],
      stem: "（2011 数三）设 $A$ 为 3 阶实对称矩阵，$A$ 的各行元素之和为 $3$，且 $r(A)=1$，则二次型 $x^{T}Ax$ 在正交变换下的标准形为____",
      answer: "各行元素之和为 $3$，故 $A(1,1,1)^{T}=3(1,1,1)^{T}$，$3$ 是特征值。又 $r(A)=1$ 且 $A$ 为实对称矩阵，故另两个特征值为 $0,0$。正交变换下标准形的系数即特征值，故标准形为$$3y_{1}^{2}$$",
      src: { card: "la14", note: "卡片例题（data/math3.js 的 EXAMPLE[\"la14\"]）来源原文：2011 年数三真题。PITFALL[la14] 无条目 → 省略 traps 字段。MNEM[la14] 无条目 → 省略 hint 字段。" }
    },
    {
      id: "cv-m3-la17", origin: 'card', year: 2011, school: "全国硕士研究生入学统一考试-数学三 2011 年", no: "未编号", type: "linalg", star: 4,
      tags: ["la17"],
      stem: "（2011 数三）设 $A$ 为 3 阶非零矩阵，$\\eta_1,\\eta_2,\\eta_3$ 是 $Ax=\\beta\\ (\\beta\\ne0)$ 的三个线性无关的解，写出 $Ax=\\beta$ 的通解。",
      answer: "$\\eta_2-\\eta_1,\\ \\eta_3-\\eta_1$ 是 $Ax=0$ 的两个线性无关的解，故 $3-r(A)\\ge2$，得 $r(A)\\le1$；又 $A\\ne O$ 得 $r(A)=1$，故 $Ax=0$ 的基础解系恰含 $2$ 个向量。又 $\\dfrac{\\eta_2+\\eta_3}{2}$ 是 $Ax=\\beta$ 的特解，通解为$$x=\\frac{\\eta_2+\\eta_3}{2}+k_1(\\eta_2-\\eta_1)+k_2(\\eta_3-\\eta_1)\\quad(k_1,k_2\\in\\mathbb R)$$",
      traps: "基础解系含 $n-r(A)$ 个向量而非 $r(A)$ 个，勿把自由变量个数与秩混淆。",
      src: { card: "la17", note: "卡片例题（data/math3.js 的 EXAMPLE[\"la17\"]）来源原文：2011 年数三真题。traps 取自 PITFALL[la17]。MNEM[la17] 无条目 → 省略 hint 字段。" }
    },
    {
      id: "cv-m3-ineq04", origin: 'card', year: 2010, school: "全国硕士研究生入学统一考试-数学三 2010 年", no: "未编号", type: "proof", star: 4,
      tags: ["ineq04"],
      stem: "（2010 数三）设 $a_{n}=\\int_{0}^{1}\\bigl[\\ln(1+x)\\bigr]^{n}dx\\ (n=1,2,\\cdots)$。(Ⅰ) 证明 $0<a_{n}<\\dfrac{1}{n+1}$；(Ⅱ) 求 $\\lim_{n\\to\\infty}a_{n}$。",
      answer: "(Ⅰ) 当 $0<x<1$ 时由 $\\ln(1+x)<x$ 得 $0<[\\ln(1+x)]^{n}<x^{n}$，故$$0<a_{n}<\\int_{0}^{1}x^{n}dx=\\frac{1}{n+1}$$(Ⅱ) 由夹逼准则，$0<a_n<\\dfrac1{n+1}\\to0$，故 $\\lim_{n\\to\\infty}a_{n}=0$。",
      src: { card: "ineq04", note: "卡片例题（data/math3.js 的 EXAMPLE[\"ineq04\"]）来源原文：2010 年数三真题。PITFALL[ineq04] 无条目 → 省略 traps 字段。MNEM[ineq04] 无条目 → 省略 hint 字段。" }
    },
    {
      id: "cv-m3-lim16", origin: 'card', year: 2024, school: "全国硕士研究生招生考试-数学三 2024 年", no: "未编号", type: "limit", star: 3,
      tags: ["lim16"],
      stem: "设 $f(x)=\\lim_{n\\to\\infty}\\frac{1+x}{1+x^{2n}}$，讨论 $f(x)$ 在 $x=1$ 与 $x=-1$ 处的连续性",
      answer: "当 $|x|<1$ 时 $x^{2n}\\to0$，故 $f(x)=1+x$；当 $|x|>1$ 时 $x^{2n}\\to\\infty$，故 $f(x)=0$；且 $f(1)=1,\\ f(-1)=0$。在 $x=-1$ 处：$$\\lim_{x\\to-1^{-}}f(x)=0,\\quad\\lim_{x\\to-1^{+}}f(x)=\\lim_{x\\to-1^{+}}(1+x)=0=f(-1)$$故连续。在 $x=1$ 处：$$\\lim_{x\\to1^{-}}f(x)=2,\\quad\\lim_{x\\to1^{+}}f(x)=0$$左右极限不相等，故 $f(x)$ 在 $x=1$ 处不连续（跳跃间断点）。",
      src: { card: "lim16", note: "卡片例题（data/math3.js 的 EXAMPLE[\"lim16\"]）来源原文：2024 年数三真题。PITFALL[lim16] 无条目 → 省略 traps 字段。MNEM[lim16] 无条目 → 省略 hint 字段。" }
    },
    {
      id: "cv-m3-ext03", origin: 'card', year: 2022, school: "全国硕士研究生招生考试-数学三 2022 年", no: "未编号", type: "limit", star: 4,
      tags: ["ext03"],
      stem: "（2022 数三）设 $\\alpha(x),\\ \\beta(x)$ 是当 $x\\to0$ 时的无穷小，判断下列命题的正误：① $\\alpha\\sim\\beta\\Rightarrow\\alpha^{2}\\sim\\beta^{2}$；② $\\alpha^{2}\\sim\\beta^{2}\\Rightarrow\\alpha\\sim\\beta$；③ $\\alpha\\sim\\beta\\Rightarrow\\alpha-\\beta=o(\\alpha)$；④ $\\alpha-\\beta=o(\\alpha)\\Rightarrow\\alpha\\sim\\beta$。正确的是____",
      answer: "① 真：$\\dfrac{\\alpha^{2}}{\\beta^{2}}=\\left(\\dfrac{\\alpha}{\\beta}\\right)^{2}\\to1$。② 假：取 $\\alpha=x,\\ \\beta=-x$，$\\alpha^{2}\\sim\\beta^{2}$ 但 $\\alpha\\nsim\\beta$。③ 真：$\\dfrac{\\alpha-\\beta}{\\alpha}=1-\\dfrac{\\beta}{\\alpha}\\to0$。④ 真：$\\dfrac{\\alpha-\\beta}{\\alpha}\\to0\\Rightarrow\\dfrac{\\beta}{\\alpha}\\to1$。故正确的是 ①③④。",
      src: { card: "ext03", note: "卡片例题（data/math3.js 的 EXAMPLE[\"ext03\"]）来源原文：2022 年数三真题。PITFALL[ext03] 无条目 → 省略 traps 字段。MNEM[ext03] 无条目 → 省略 hint 字段。" }
    },
    {
      id: "cv-m3-ext05-2", origin: 'card', year: 2019, school: "全国硕士研究生招生考试-数学三 2019 年", no: "未编号", type: "deriv", star: 5,
      tags: ["ext05"],
      stem: "（2019 数三）曲线 $y=x\\sin x+2\\cos x$ 在 $\\left(-\\dfrac{3\\pi}{2},\\dfrac{3\\pi}{2}\\right)$ 内的拐点坐标为____",
      answer: "$$y'=\\sin x+x\\cos x-2\\sin x=x\\cos x-\\sin x,\\qquad y''=\\cos x-x\\sin x-\\cos x=-x\\sin x$$由 $y''=0$ 得 $x=0$ 或 $\\sin x=0$，即 $x=-\\pi,0,\\pi$。在 $x=\\pm\\pi$ 两侧 $y''=-x\\sin x$ 变号，为拐点；在 $x=0$ 附近 $-x\\sin x\\sim-x^{2}$，两侧同号（均小于 $0$），故 $(0,2)$ 不是拐点。于是拐点为 $(-\\pi,-2)$ 与 $(\\pi,-2)$。",
      src: { card: "ext05", note: "卡片例题（data/math3.js 的 EXAMPLE[\"ext05\"][1]）来源原文：2019 年数三真题。PITFALL[ext05] 无条目 → 省略 traps 字段。MNEM[ext05] 无条目 → 省略 hint 字段。" }
    },
    {
      id: "cv-m3-ext06-2", origin: 'card', year: 2026, school: "全国硕士研究生招生考试-数学三 2026 年", no: "未编号", type: "deriv", star: 5,
      tags: ["ext06"],
      stem: "（2026 数三）曲线 $y=xe^{1/x}$ 的渐近线（ ）(A) 无水平渐近线、无铅直渐近线；(B) 有水平渐近线、无铅直渐近线；(C) 无水平渐近线、有铅直渐近线；(D) 有水平渐近线、有铅直渐近线",
      answer: "当 $x\\to0^{+}$ 时 $e^{1/x}\\to+\\infty$，故 $xe^{1/x}\\to+\\infty$，$x=0$ 为铅直渐近线；当 $x\\to0^{-}$ 时 $e^{1/x}\\to0$，$xe^{1/x}\\to0$。又 $x\\to+\\infty$ 时 $e^{1/x}\\to1$，$y\\sim x$，存在斜渐近线 $y=x+1$，无水平渐近线。故选 (C)。",
      src: { card: "ext06", note: "卡片例题（data/math3.js 的 EXAMPLE[\"ext06\"][1]）来源原文：2026 年数三真题。PITFALL[ext06] 无条目 → 省略 traps 字段。MNEM[ext06] 无条目 → 省略 hint 字段。" }
    },
    {
      id: "cv-m3-ext13", origin: 'card', year: 2023, school: "全国硕士研究生招生考试-数学三 2023 年", no: "未编号", type: "multivar", star: 5,
      tags: ["ext13"],
      stem: "（2023 数三）设 $f(x,y)=\\ln(y+|x\\sin y|)$，则（ ）(A) $\\frac{\\partial f}{\\partial x}\\big|_{(0,1)}$ 不存在，$\\frac{\\partial f}{\\partial y}\\big|_{(0,1)}$ 存在；(B) 前者存在、后者不存在；(C) 均存在；(D) 均不存在",
      answer: "固定 $y=1$：$f(x,1)=\\ln(1+|x|\\sin1)$，在 $x=0$ 处含 $|x|$，左右导数分别为 $\\sin1$ 与 $-\\sin1$，故 $\\frac{\\partial f}{\\partial x}\\big|_{(0,1)}$ 不存在。固定 $x=0$：$f(0,y)=\\ln y$，$\\frac{\\partial f}{\\partial y}\\big|_{(0,1)}=\\frac1y\\big|_{y=1}=1$ 存在。故选 (A)。",
      traps: "偏导存在 $\\not\\Rightarrow$ 可微，可微 $\\not\\Rightarrow$ 偏导连续；判断可微必须验证全增量减线性近似是 $o(\\rho)$。",
      src: { card: "ext13", note: "卡片例题（data/math3.js 的 EXAMPLE[\"ext13\"]）来源原文：2023 年数三真题。traps 取自 PITFALL[ext13]。MNEM[ext13] 无条目 → 省略 hint 字段。" }
    },
    {
      id: "cv-m3-ext16", origin: 'card', year: 2023, school: "全国硕士研究生招生考试-数学三 2023 年", no: "未编号", type: "series", star: 5,
      tags: ["ext16"],
      stem: "（2023 数三）已知 $a_n<b_n$。若级数 $\\sum a_n$ 与 $\\sum b_n$ 均收敛，则「$\\sum a_n$ 绝对收敛」是「$\\sum b_n$ 绝对收敛」的（ ）(A) 充分必要条件 (B) 充分不必要 (C) 必要不充分 (D) 既不充分也不必要",
      answer: "令 $c_n=b_n-a_n>0$，则 $\\sum c_n=\\sum b_n-\\sum a_n$ 收敛且为正项级数，故绝对收敛。于是 $b_n=a_n+c_n$、$a_n=b_n-c_n$，分别有$$|b_n|\\le|a_n|+c_n,\\qquad |a_n|\\le|b_n|+c_n$$故 $\\sum|a_n|$ 收敛 $\\iff$ $\\sum|b_n|$ 收敛，选 (A)。",
      src: { card: "ext16", note: "卡片例题（data/math3.js 的 EXAMPLE[\"ext16\"]）来源原文：2023 年数三真题。PITFALL[ext16] 无条目 → 省略 traps 字段。MNEM[ext16] 无条目 → 省略 hint 字段。" }
    },
    {
      id: "cv-m3-ms02", origin: 'card', year: 2025, school: "全国硕士研究生招生考试-数学三 2025 年", no: "未编号", type: "integral", star: 4,
      tags: ["ms02"],
      stem: "（2025 数三）设 $f(x)=\\int_0^x e^{t^{2}}\\sin t\\,dt$，$g(x)=\\left(\\int_0^x e^{t^{2}}dt\\right)\\sin^{2}x$，则（ ）(A) $x=0$ 是 $f,g$ 的极值点；(B) $x=0$ 是 $f$ 的极值点，$(0,0)$ 是 $g$ 的拐点；(C) $x=0$ 是 $f$ 的极值点，$(0,0)$ 是 $f$ 的拐点；(D) $(0,0)$ 是 $f,g$ 的拐点",
      answer: "$f'(x)=e^{x^{2}}\\sin x$，在 $x=0$ 两侧 $f'$ 由负变正，故 $x=0$ 是 $f$ 的极小值点。又 $F(x)=\\int_0^x e^{t^{2}}dt\\sim x+\\dfrac{x^{3}}{3}$，$\\sin^{2}x\\sim x^{2}$，故 $g(x)=F(x)\\sin^{2}x\\sim x^{3}$（$x\\to0$），为奇函数型三次，$(0,0)$ 为 $g$ 的拐点。故选 (B)。",
      src: { card: "ms02", note: "卡片例题（data/math3.js 的 EXAMPLE[\"ms02\"]）来源原文：2025 年数三真题。PITFALL[ms02] 无条目 → 省略 traps 字段。MNEM[ms02] 无条目 → 省略 hint 字段。" }
    },
    {
      id: "cv-m3-int33", origin: 'card', year: 2025, school: "全国硕士研究生招生考试-数学三 2025 年", no: "未编号", type: "integral", star: 5,
      tags: ["int33"],
      stem: "（2025 数三）设 $f(x)=\\int_0^x e^{t^2}\\sin t\\,dt$，$g(x)=\\int_0^x e^{t^2}\\,dt\\cdot\\sin^2x$。判断 $x=0$ 是否为 $f$、$g$ 的极值点，点 $(0,0)$ 是否为曲线 $y=g(x)$ 的拐点。",
      answer: "$f'(x)=e^{x^2}\\sin x$：在 $x=0$ 两侧由负变正，故 $x=0$ 是 $f$ 的极小值点。\n$g'(x)=e^{x^2}\\sin^2x+2\\sin x\\cos x\\int_0^x e^{t^2}dt$，$g'(0)=0$；\n$g''(x)=2xe^{x^2}\\sin^2x+4e^{x^2}\\sin x\\cos x+2\\cos 2x\\int_0^x e^{t^2}dt$，$g''(0)=0$；\n$g'''(0)=4>0$，故 $g''$ 在 $x=0$ 附近由负变正 $\\Rightarrow$ $(0,0)$ 是 $g$ 的拐点，且 $g'(x)\\ge0$（两侧同号），$x=0$ 不是 $g$ 的极值点。\n方法：变限积分定义的函数判极值/拐点，先求 $f'(x_0)$，为零则逐阶求导看变号（高阶导数判别法）。",
      src: { card: "int33", note: "卡片例题（data/math3.js 的 EXAMPLE[\"int33\"]）来源原文：2025 年数三真题。PITFALL[int33] 无条目 → 省略 traps 字段。MNEM[int33] 无条目 → 省略 hint 字段。" }
    },
    {
      id: "cv-m3-gx26", origin: 'card', year: 2000, school: "全国硕士研究生入学统一考试-数学三 2000 年", no: "未编号", type: "proof", star: 5,
      tags: ["gx26"],
      stem: "（2000 数三）设 $f(x)$ 在 $[0,\\pi]$ 上连续，且 $\\int_{0}^{\\pi}f(x)\\cos x\\,dx=0$，$\\int_{0}^{\\pi}f(x)\\sin x\\,dx=0$，证明：存在 $\\xi\\in(0,\\pi)$ 使 $f'(\\xi)=0$ 类问题的辅助函数思想——对含 $f'\\cos x+f\\sin x$ 结构的结论，令 $F(x)=f(x)\\sin x$",
      answer: "构造 $F(x)=f(x)\\sin x$：$F'(x)=f'(x)\\sin x+f(x)\\cos x$。由两个积分条件与 $\\sin x$ 在 $(0,\\pi)$ 内恒正，用积分中值定理/罗尔原话可得 $F$ 在 $(0,\\pi)$ 内至少有三个零点，两次罗尔即得 $F''$ 的零点，进而完成证明——辅助函数的乘积结构正是 $f'\\sin x+f\\cos x$ 的来源。",
      src: { card: "gx26", note: "卡片例题（data/math3.js 的 EXAMPLE[\"gx26\"]）来源原文：2000 年数三真题。PITFALL[gx26] 无条目 → 省略 traps 字段。MNEM[gx26] 无条目 → 省略 hint 字段。" }
    },
    {
      id: "cv-m3-gx51", origin: 'card', year: 2023, school: "全国硕士研究生招生考试-数学三 2023 年", no: "未编号", type: "series", star: 4,
      tags: ["gx51"],
      stem: "（2023 数三）已知 $a_n<b_n$。若级数 $\\sum a_n$ 与 $\\sum b_n$ 均收敛，则「$\\sum(a_n+b_n)$ 与 $\\sum\\left|a_n-b_n\\right|$」的收敛性判断",
      answer: "考察条件收敛与绝对收敛的运算规则：两收敛级数的和必收敛，故 $\\sum(a_n+b_n)$ 收敛；$\\left|a_n-b_n\\right|\\le\\left|a_n\\right|+\\left|b_n\\right|$，若两级数**绝对**收敛则比较判别得 $\\sum\\left|a_n-b_n\\right|$ 收敛；但仅条件收敛时（正项部分发散）$\\sum\\left|a_n-b_n\\right|$ 可能发散——结论取决于敛散类型，需按绝对/条件分类讨论。",
      traps: "比值/根值判别法判出 Σ|uₙ| 发散时 |uₙ| 不趋于 0，原级数必发散——但比较判别法得出发散无此结论。",
      src: { card: "gx51", note: "卡片例题（data/math3.js 的 EXAMPLE[\"gx51\"]）来源原文：2023 年数三真题。traps 取自 PITFALL[gx51]。MNEM[gx51] 无条目 → 省略 hint 字段。" }
    },
    {
      id: "cv-m3-gx62", origin: 'card', year: 2023, school: "全国硕士研究生招生考试-数学三 2023 年", no: "未编号", type: "dblint", star: 3,
      tags: ["gx62"],
      stem: "（2023 数三）计算二重积分 $\\iint_{D}x\\,dx\\,dy$，其中 $D$ 由 $(x-1)^{2}+y^{2}\\le1$ 围成",
      answer: "区域是圆——选极坐标：圆的极坐标方程 $r=2\\cos\\theta$（$-\\frac\\pi2\\le\\theta\\le\\frac\\pi2$）。$\\iint_D x\\,dxdy=\\int_{-\\pi/2}^{\\pi/2}d\\theta\\int_0^{2\\cos\\theta}r\\cos\\theta\\cdot r\\,dr=\\int_{-\\pi/2}^{\\pi/2}\\frac{16}{3}\\cos^{4}\\theta\\,d\\theta=\\frac{16}{3}\\cdot\\frac{3\\pi\\cdot2}{16}=\\pi$（点火公式）。",
      src: { card: "gx62", note: "卡片例题（data/math3.js 的 EXAMPLE[\"gx62\"]）来源原文：2023 年数三真题。PITFALL[gx62] 无条目 → 省略 traps 字段。MNEM[gx62] 无条目 → 省略 hint 字段。" }
    },
    {
      id: "cv-m3-gx14", origin: 'card', year: 2018, school: "全国硕士研究生招生考试-数学三 2018 年", no: "一(1)", type: "deriv", star: 5,
      tags: ["gx14"],
      stem: "下列函数中，在 $x=0$ 处不可导的是（ ）\n选项：(A) $f(x)=|x|\\sin|x|$；(B) $f(x)=|x|\\sin\\sqrt{|x|}$；(C) $f(x)=\\cos|x|$；(D) $f(x)=\\cos\\sqrt{|x|}$。",
      answer: "(A) $|x|\\sin|x|=x\\sin x$、(C) $\\cos|x|=\\cos x$ 在 0 附近与可导函数相同，可导；(B) $\\frac{|x|\\sin\\sqrt{|x|}}{x}=\\frac{|x|^{3/2}}{x}\\to0$，可导；(D) $\\frac{\\cos\\sqrt{|x|}-1}{x}\\sim\\frac{-|x|/2}{x}$ 的左右极限分别为 $-\\frac12$ 与 $\\frac12$，左右导数不等，不可导。选 (D)。",
      traps: "f(x₀)=0 且 f'(x₀)≠0 时 |f| 在该点不可导（|x| 型）；f'(x₀)=0 时反而可导——两种\"零点情形\"结论相反。",
      src: { card: "gx14", note: "卡片例题（data/math3.js 的 EXAMPLE[\"gx14\"]）来源原文：2018 年数三 一(1)。traps 取自 PITFALL[gx14]。MNEM[gx14] 无条目 → 省略 hint 字段。" }
    },
    {
      id: "cv-m3-gx29", origin: 'card', year: 2020, school: "全国硕士研究生招生考试-数学三 2020 年", no: "一(3)", type: "integral", star: 5,
      tags: ["gx29"],
      stem: "设奇函数 $f(x)$ 在 $(-\\infty,+\\infty)$ 上具有连续导数，则（ ）\n选项：(A) $\\int_0^x[\\cos f(t)+f'(t)]\\mathrm dt$ 是奇函数；(B) $\\int_0^x[\\cos f(t)+f'(t)]\\mathrm dt$ 是偶函数；(C) $\\int_0^x[\\cos f'(t)+f(t)]\\mathrm dt$ 是奇函数；(D) $\\int_0^x[\\cos f'(t)+f(t)]\\mathrm dt$ 是偶函数。",
      answer: "$f$ 为奇函数 $\\Rightarrow f'$ 为偶函数，而 $\\cos f(t)$（内层为奇的复合）也是偶函数，故被积函数 $\\cos f(t)+f'(t)$ 为偶函数；其变限积分 $\\int_0^x$ 是奇函数，(A) 正确、(B) 错误。而 $\\cos f'(t)+f(t)$ 奇偶性不固定，(C)(D) 均错。选 (A)。",
      src: { card: "gx29", note: "卡片例题（data/math3.js 的 EXAMPLE[\"gx29\"]）来源原文：2020 年数三 一(3)。PITFALL[gx29] 无条目 → 省略 traps 字段。MNEM[gx29] 无条目 → 省略 hint 字段。" }
    },
    {
      id: "cv-m3-zb07", origin: 'card', year: 2013, school: "全国硕士研究生入学统一考试-数学三 2013 年", no: "一(5)", type: "linalg", star: 4,
      tags: ["zb07"],
      stem: "设 $A,B,C$ 均为 $n$ 阶矩阵. 若 $AB=C$，且 $B$ 可逆，则（ ）\n选项：(A) 矩阵 $C$ 的行向量组与矩阵 $A$ 的行向量组等价；(B) 矩阵 $C$ 的列向量组与矩阵 $A$ 的列向量组等价；(C) 矩阵 $C$ 的行向量组与矩阵 $B$ 的行向量组等价；(D) 矩阵 $C$ 的列向量组与矩阵 $B$ 的列向量组等价。",
      answer: "$C=AB$ 的每一列都是 $A$ 的列的线性组合 ⇒ $C$ 的列组可由 $A$ 的列组表示；又 $B$ 可逆给出 $A=CB^{-1}$ ⇒ $A$ 的列组也可由 $C$ 的列组表示。互相可表示即等价，选 (B)。（同秩是等价的必要条件而非充分条件。）",
      src: { card: "zb07", note: "卡片例题（data/math3.js 的 EXAMPLE[\"zb07\"]）来源原文：2013 年数三 一(5)。PITFALL[zb07] 无条目 → 省略 traps 字段。MNEM[zb07] 无条目 → 省略 hint 字段。" }
    },
  // ==== END GENERATED card-questions (t49) ====
  // ==== BEGIN GENERATED year-questions (t53) ====
    {
      id: "m3-2010-1", origin: 'year', year: 2010, no: "一(1)", type: "limit", star: 3,
      school: "全国硕士研究生入学统一考试-数学三 2010 年", tags: ["lim01", "ext02", "tay01"],
      stem: "若 $\\lim\\limits_{x\\to0}\\left[\\dfrac1x-\\left(\\dfrac1x-a\\right)e^x\\right]=1$，则 $a$ 等于（ ）",
      options: ["0", "1", "2", "3"],
      answer: "选 C。",
      src: { file: "参考文件/真题/数学/6、【1987-2025年】考研数学三真题答案及解析/2010年数学三真题答案解析.pdf", page: 1, no: "一(1)", note: "题面：真题册（合并册）PDF p49 裁片逐字亲读（2010_p49_b1.png sha256 1f040e3747df…，命令见 backup/scratch/bank-m3/crops.json）；单源：题面仅真题册裁片（解析册文字层碎裂/不可用，只用于交叉核对答案与结论，不作为题面来源）；字母答案：docs/refs/math3.json（t35 亲读回填，2010_p49.png）。" }
    },
    {
      id: "m3-2010-2", origin: 'year', year: 2010, no: "一(2)", type: "ode", star: 3,
      school: "全国硕士研究生入学统一考试-数学三 2010 年", tags: ["kn13", "kn14", "ext28"],
      stem: "设 $y_1,y_2$ 是一阶线性非齐次微分方程 $y'+p(x)y=q(x)$ 的两个特解，若常数 $\\lambda,\\mu$ 使 $\\lambda y_1+\\mu y_2$ 是该方程的解，$\\lambda y_1-\\mu y_2$ 是该方程对应的齐次方程的解，则（ ）",
      options: ["$\\lambda=\\dfrac{1}{2}$, $\\mu=\\dfrac{1}{2}$", "$\\lambda=-\\dfrac{1}{2}$, $\\mu=-\\dfrac{1}{2}$", "$\\lambda=\\dfrac{2}{3}$, $\\mu=\\dfrac{1}{3}$", "$\\lambda=\\dfrac{2}{3}$, $\\mu=\\dfrac{2}{3}$"],
      answer: "选 A。",
      src: { file: "参考文件/真题/数学/6、【1987-2025年】考研数学三真题答案及解析/2010年数学三真题答案解析.pdf", page: 1, no: "一(2)", note: "题面：真题册（合并册）PDF p49 裁片逐字亲读（2010_p49_b1.png sha256 1f040e3747df…，命令见 backup/scratch/bank-m3/crops.json）；单源：题面仅真题册裁片（解析册文字层碎裂/不可用，只用于交叉核对答案与结论，不作为题面来源）；字母答案：docs/refs/math3.json（t35 亲读回填，2010_p49.png）。" }
    },
    {
      id: "m3-2010-3", origin: 'year', year: 2010, no: "一(3)", type: "deriv", star: 3,
      school: "全国硕士研究生入学统一考试-数学三 2010 年", tags: ["ext05", "gx21", "kn39"],
      stem: "设函数 $f(x),g(x)$ 具有二阶导数，且 $g''(x)<0$. 若 $g(x_0)=a$ 是 $g(x)$ 的极值，则 $f(g(x))$ 在 $x_0$ 处取极大值的一个充分条件是（ ）",
      options: ["$f'(a)<0$", "$f'(a)>0$", "$f''(a)<0$", "$f''(a)>0$"],
      answer: "选 B。",
      src: { file: "参考文件/真题/数学/6、【1987-2025年】考研数学三真题答案及解析/2010年数学三真题答案解析.pdf", page: 1, no: "一(3)", note: "题面：真题册（合并册）PDF p49 裁片逐字亲读（2010_p49_b2.png sha256 f4887e267365…，命令见 backup/scratch/bank-m3/crops.json）；单源：题面仅真题册裁片（解析册文字层碎裂/不可用，只用于交叉核对答案与结论，不作为题面来源）；字母答案：docs/refs/math3.json（t35 亲读回填，2010_p49.png）。" }
    },
    {
      id: "m3-2010-4", origin: 'year', year: 2010, no: "一(4)", type: "limit", star: 2,
      school: "全国硕士研究生入学统一考试-数学三 2010 年", tags: ["lim07", "zt04"],
      stem: "设 $f(x)=\\ln^{10}x$，$g(x)=x$，$h(x)=e^{\\frac{x}{10}}$，则当 $x$ 充分大时有（ ）",
      options: ["$g(x)<h(x)<f(x)$", "$h(x)<g(x)<f(x)$", "$f(x)<g(x)<h(x)$", "$g(x)<f(x)<h(x)$"],
      answer: "选 C。",
      src: { file: "参考文件/真题/数学/6、【1987-2025年】考研数学三真题答案及解析/2010年数学三真题答案解析.pdf", page: 2, no: "一(4)", note: "题面：真题册（合并册）PDF p49 裁片逐字亲读（2010_p49_b2.png sha256 f4887e267365…，命令见 backup/scratch/bank-m3/crops.json）；单源：题面仅真题册裁片（解析册文字层碎裂/不可用，只用于交叉核对答案与结论，不作为题面来源）；字母答案：docs/refs/math3.json（t35 亲读回填，2010_p49.png）。" }
    },
    {
      id: "m3-2010-5", origin: 'year', year: 2010, no: "一(5)", type: "linalg", star: 3,
      school: "全国硕士研究生入学统一考试-数学三 2010 年", tags: ["kn25", "kn27", "zb07"],
      stem: "设向量组 Ⅰ：$\\alpha_1,\\alpha_2,\\cdots,\\alpha_r$ 可由向量组 Ⅱ：$\\beta_1,\\beta_2,\\cdots,\\beta_s$ 线性表示. 下列命题正确的是（ ）",
      options: ["若向量组 Ⅰ 线性无关,则 $r\\le s$", "若向量组 Ⅰ 线性相关,则 $r>s$", "若向量组 Ⅱ 线性无关,则 $r\\le s$", "若向量组 Ⅱ 线性相关,则 $r>s$"],
      answer: "选 A。",
      src: { file: "参考文件/真题/数学/6、【1987-2025年】考研数学三真题答案及解析/2010年数学三真题答案解析.pdf", page: 2, no: "一(5)", note: "题面：真题册（合并册）PDF p49 裁片逐字亲读（2010_p49_b3.png sha256 9b7fcf61e16b…，命令见 backup/scratch/bank-m3/crops.json）；单源：题面仅真题册裁片（解析册文字层碎裂/不可用，只用于交叉核对答案与结论，不作为题面来源）；字母答案：docs/refs/math3.json（t35 亲读回填，2010_p49.png）。" }
    },
    {
      id: "m3-2010-6", origin: 'year', year: 2010, no: "一(6)", type: "eigen", star: 4,
      school: "全国硕士研究生入学统一考试-数学三 2010 年", tags: ["la04", "la13", "la14"],
      stem: "设 $A$ 为 4 阶实对称矩阵，且 $A^2+A=O$. 若 $A$ 的秩为 3，则 $A$ 相似于（ ）",
      options: ["$\\begin{pmatrix}1&0&0&0\\\\0&1&0&0\\\\0&0&1&0\\\\0&0&0&0\\end{pmatrix}$", "$\\begin{pmatrix}1&0&0&0\\\\0&1&0&0\\\\0&0&-1&0\\\\0&0&0&0\\end{pmatrix}$", "$\\begin{pmatrix}1&0&0&0\\\\0&-1&0&0\\\\0&0&-1&0\\\\0&0&0&0\\end{pmatrix}$", "$\\begin{pmatrix}-1&0&0&0\\\\0&-1&0&0\\\\0&0&-1&0\\\\0&0&0&0\\end{pmatrix}$"],
      answer: "选 D。",
      src: { file: "参考文件/真题/数学/6、【1987-2025年】考研数学三真题答案及解析/2010年数学三真题答案解析.pdf", page: 2, no: "一(6)", note: "题面：真题册（合并册）PDF p49 裁片逐字亲读（2010_p49_b3.png sha256 9b7fcf61e16b…，命令见 backup/scratch/bank-m3/crops.json）；单源：题面仅真题册裁片（解析册文字层碎裂/不可用，只用于交叉核对答案与结论，不作为题面来源）；字母答案：docs/refs/math3.json（t35 亲读回填，2010_p49.png）。" }
    },
    {
      id: "m3-2010-7", origin: 'year', year: 2010, no: "一(7)", type: "estimate", star: 3,
      school: "全国硕士研究生入学统一考试-数学三 2010 年", tags: ["int25", "zt04"],
      stem: "设随机变量 $X$ 的分布函数 $F(x)=\\begin{cases}0,&x<0,\\\\\\dfrac12,&0\\le x<1,\\\\1-e^{-x},&x\\ge1,\\end{cases}$ 则 $P\\{X=1\\}=$（ ）",
      options: ["0", "$\\dfrac{1}{2}$", "$\\dfrac{1}{2}-\\mathrm{e}^{-1}$", "$1-\\mathrm{e}^{-1}$"],
      answer: "选 C。",
      src: { file: "参考文件/真题/数学/6、【1987-2025年】考研数学三真题答案及解析/2010年数学三真题答案解析.pdf", page: 2, no: "一(7)", note: "题面：真题册（合并册）PDF p50 裁片逐字亲读（2010_p50_b0.png sha256 21fa329851ce…，命令见 backup/scratch/bank-m3/crops.json）；单源：题面仅真题册裁片（解析册文字层碎裂/不可用，只用于交叉核对答案与结论，不作为题面来源）；字母答案：docs/refs/math3.json（t35 亲读回填，2010_p49.png）。" }
    },
    {
      id: "m3-2010-8", origin: 'year', year: 2010, no: "一(8)", type: "estimate", star: 3,
      school: "全国硕士研究生入学统一考试-数学三 2010 年", tags: ["int23", "zt04"],
      stem: "设 $f_1(x)$ 为标准正态分布的概率密度，$f_2(x)$ 为 $[-1,3]$ 上均匀分布的概率密度，若 $f(x)=\\begin{cases}af_1(x),&x\\le0,bf_2(x),&x>0\\end{cases}(a>0,b>0)$ 为概率密度，则 $a,b$ 应满足（ ）",
      options: ["$2a+3b=4$", "$3a+2b=4$", "$a+b=1$", "$a+b=2$"],
      answer: "选 A。",
      src: { file: "参考文件/真题/数学/6、【1987-2025年】考研数学三真题答案及解析/2010年数学三真题答案解析.pdf", page: 2, no: "一(8)", note: "题面：真题册（合并册）PDF p50 裁片逐字亲读（2010_p50_b1.png sha256 1f973be9d904…，命令见 backup/scratch/bank-m3/crops.json）；单源：题面仅真题册裁片（解析册文字层碎裂/不可用，只用于交叉核对答案与结论，不作为题面来源）；字母答案：docs/refs/math3.json（t35 亲读回填，2010_p49.png）。" }
    },
    {
      id: "m3-2011-1", origin: 'year', year: 2011, no: "一(1)", type: "limit", star: 3,
      school: "全国硕士研究生入学统一考试-数学三 2011 年", tags: ["zb13", "tay02", "kn08"],
      stem: "已知当 $x\\to0$ 时，函数 $f(x)=3\\sin x-\\sin 3x$ 与 $cx^k$ 是等价无穷小量，则（ ）",
      options: ["$k=1$, $c=4$", "$k=1$, $c=-4$", "$k=3$, $c=4$", "$k=3$, $c=-4$"],
      answer: "选 C。",
      src: { file: "参考文件/真题/数学/6、【1987-2025年】考研数学三真题答案及解析/2011年数学三真题答案解析.pdf", page: 1, no: "一(1)", note: "题面：真题册（合并册）PDF p45 裁片逐字亲读（2011_p45_b1.png sha256 8f64b4152d5c…，命令见 backup/scratch/bank-m3/crops.json）；单源：题面仅真题册裁片（解析册文字层碎裂/不可用，只用于交叉核对答案与结论，不作为题面来源）；字母答案：docs/refs/math3.json（t35 亲读回填，2011_p45.png）。" }
    },
    {
      id: "m3-2011-2", origin: 'year', year: 2011, no: "一(2)", type: "limit", star: 3,
      school: "全国硕士研究生入学统一考试-数学三 2011 年", tags: ["ext02", "kn08", "lim01"],
      stem: "设函数 $f(x)$ 在 $x=0$ 处可导，且 $f(0)=0$，则 $\\lim\\limits_{x\\to0}\\dfrac{x^2f(x)-2f(x^3)}{x^3}=$（ ）",
      options: ["$-2f'(0)$", "$-f'(0)$", "$f'(0)$", "0"],
      answer: "选 B。",
      src: { file: "参考文件/真题/数学/6、【1987-2025年】考研数学三真题答案及解析/2011年数学三真题答案解析.pdf", page: 1, no: "一(2)", note: "题面：真题册（合并册）PDF p45 裁片逐字亲读（2011_p45_b1.png sha256 8f64b4152d5c…，命令见 backup/scratch/bank-m3/crops.json）；单源：题面仅真题册裁片（解析册文字层碎裂/不可用，只用于交叉核对答案与结论，不作为题面来源）；字母答案：docs/refs/math3.json（t35 亲读回填，2011_p45.png）。" }
    },
    {
      id: "m3-2011-3", origin: 'year', year: 2011, no: "一(3)", type: "series", star: 4,
      school: "全国硕士研究生入学统一考试-数学三 2011 年", tags: ["ser01", "ser04", "ser08"],
      stem: "设 $\\{u_n\\}$ 是数列，则下列命题正确的是（ ）",
      options: ["若 $\\sum\\limits_{n=1}^{\\infty}u_n$ 收敛,则 $\\sum\\limits_{n=1}^{\\infty}(u_{2n-1}+u_{2n})$ 收敛", "若 $\\sum\\limits_{n=1}^{\\infty}(u_{2n-1}+u_{2n})$ 收敛,则 $\\sum\\limits_{n=1}^{\\infty}u_n$ 收敛", "若 $\\sum\\limits_{n=1}^{\\infty}u_n$ 收敛,则 $\\sum\\limits_{n=1}^{\\infty}(u_{2n-1}-u_{2n})$ 收敛", "若 $\\sum\\limits_{n=1}^{\\infty}(u_{2n-1}-u_{2n})$ 收敛,则 $\\sum\\limits_{n=1}^{\\infty}u_n$ 收敛"],
      answer: "选 A。",
      src: { file: "参考文件/真题/数学/6、【1987-2025年】考研数学三真题答案及解析/2011年数学三真题答案解析.pdf", page: 1, no: "一(3)", note: "题面：真题册（合并册）PDF p45 裁片逐字亲读（2011_p45_b1.png sha256 8f64b4152d5c…，命令见 backup/scratch/bank-m3/crops.json）；交叉核对：题干续在 p45 中带（选项 (A)(B) 在中带开头，(C)(D) 在后带开头）；字母答案：docs/refs/math3.json（t35 亲读回填，2011_p45.png）。" }
    },
    {
      id: "m3-2011-4", origin: 'year', year: 2011, no: "一(4)", type: "integral", star: 3,
      school: "全国硕士研究生入学统一考试-数学三 2011 年", tags: ["ms01", "int23", "zt04"],
      stem: "设 $I=\\int_0^{\\frac{\\pi}{4}}\\ln(\\sin x)\\,\\mathrm{d}x$，$J=\\int_0^{\\frac{\\pi}{4}}\\ln(\\cot x)\\,\\mathrm{d}x$，$K=\\int_0^{\\frac{\\pi}{4}}\\ln(\\cos x)\\,\\mathrm{d}x$，则 $I,J,K$ 的大小关系为（ ）",
      options: ["$I<J<K$", "$I<K<J$", "$J<I<K$", "$K<J<I$"],
      answer: "选 B。",
      src: { file: "参考文件/真题/数学/6、【1987-2025年】考研数学三真题答案及解析/2011年数学三真题答案解析.pdf", page: 2, no: "一(4)", note: "题面：真题册（合并册）PDF p45 裁片逐字亲读（2011_p45_b2.png sha256 fcbf2e89a3ea…，命令见 backup/scratch/bank-m3/crops.json）；单源：题面仅真题册裁片（解析册文字层碎裂/不可用，只用于交叉核对答案与结论，不作为题面来源）；字母答案：docs/refs/math3.json（t35 亲读回填，2011_p45.png）。" }
    },
    {
      id: "m3-2011-5", origin: 'year', year: 2011, no: "一(5)", type: "linalg", star: 3,
      school: "全国硕士研究生入学统一考试-数学三 2011 年", tags: ["kn35", "zb09", "tp09"],
      stem: "设 $A$ 为 3 阶矩阵，将 $A$ 的第 2 列加到第 1 列得矩阵 $B$，再交换 $B$ 的第 2 行与第 3 行得单位矩阵. 记 $P_1=\\begin{pmatrix}1&0&0\\\\1&1&0\\\\0&0&1\\end{pmatrix}$，$P_2=\\begin{pmatrix}1&0&0\\\\0&0&1\\\\0&1&0\\end{pmatrix}$，则 $A=$（ ）",
      options: ["$P_1P_2$", "$P_1^{-1}P_2$", "$P_2P_1$", "$P_2P_1^{-1}$"],
      answer: "选 D。",
      src: { file: "参考文件/真题/数学/6、【1987-2025年】考研数学三真题答案及解析/2011年数学三真题答案解析.pdf", page: 2, no: "一(5)", note: "题面：真题册（合并册）PDF p45 裁片逐字亲读（2011_p45_b2.png sha256 fcbf2e89a3ea…，命令见 backup/scratch/bank-m3/crops.json）；单源：题面仅真题册裁片（解析册文字层碎裂/不可用，只用于交叉核对答案与结论，不作为题面来源）；字母答案：docs/refs/math3.json（t35 亲读回填，2011_p45.png）。" }
    },
    {
      id: "m3-2011-6", origin: 'year', year: 2011, no: "一(6)", type: "linalg", star: 3,
      school: "全国硕士研究生入学统一考试-数学三 2011 年", tags: ["zb08", "la17", "tp09"],
      stem: "设 $A$ 为 $4\\times3$ 矩阵，$\\eta_1,\\eta_2,\\eta_3$ 是非齐次线性方程组 $Ax=\\beta$ 的 3 个线性无关的解，$k_1,k_2$ 为任意常数，则 $Ax=\\beta$ 的通解为（ ）",
      options: ["$\\dfrac{\\eta_2+\\eta_3}{2}+k_1(\\eta_2-\\eta_1)$", "$\\dfrac{\\eta_2-\\eta_3}{2}+k_1(\\eta_2-\\eta_1)$", "$\\dfrac{\\eta_2+\\eta_3}{2}+k_1(\\eta_2-\\eta_1)+k_2(\\eta_3-\\eta_1)$", "$\\dfrac{\\eta_2-\\eta_3}{2}+k_1(\\eta_2-\\eta_1)+k_2(\\eta_3-\\eta_1)$"],
      answer: "选 C。",
      src: { file: "参考文件/真题/数学/6、【1987-2025年】考研数学三真题答案及解析/2011年数学三真题答案解析.pdf", page: 2, no: "一(6)", note: "题面：真题册（合并册）PDF p45 裁片逐字亲读（2011_p45_b3.png sha256 cfea4381dea0…，命令见 backup/scratch/bank-m3/crops.json）；单源：题面仅真题册裁片（解析册文字层碎裂/不可用，只用于交叉核对答案与结论，不作为题面来源）；字母答案：docs/refs/math3.json（t35 亲读回填，2011_p45.png）。" }
    },
    {
      id: "m3-2011-7", origin: 'year', year: 2011, no: "一(7)", type: "estimate", star: 3,
      school: "全国硕士研究生入学统一考试-数学三 2011 年", tags: ["int23", "zt04", "tp02"],
      stem: "设 $F_1(x)$ 与 $F_2(x)$ 为两个分布函数，其相应的概率密度 $f_1(x)$ 与 $f_2(x)$ 是连续函数，则必为概率密度的是（ ）",
      options: ["$f_1(x)f_2(x)$", "$2f_2(x)F_1(x)$", "$f_1(x)F_2(x)$", "$f_1(x)F_2(x)+f_2(x)F_1(x)$"],
      answer: "选 D。",
      src: { file: "参考文件/真题/数学/6、【1987-2025年】考研数学三真题答案及解析/2011年数学三真题答案解析.pdf", page: 3, no: "一(7)", note: "题面：真题册（合并册）PDF p45 裁片逐字亲读（2011_p45_b3.png sha256 cfea4381dea0…，命令见 backup/scratch/bank-m3/crops.json）；单源：题面仅真题册裁片（解析册文字层碎裂/不可用，只用于交叉核对答案与结论，不作为题面来源）；字母答案：docs/refs/math3.json（t35 亲读回填，2011_p45.png）。" }
    },
    {
      id: "m3-2011-8", origin: 'year', year: 2011, no: "一(8)", type: "estimate", star: 4,
      school: "全国硕士研究生入学统一考试-数学三 2011 年", tags: ["zt04", "int25", "tp02"],
      stem: "设总体 $X$ 服从参数为 $\\lambda(\\lambda>0)$ 的泊松分布，$X_1,X_2,\\cdots,X_n(n\\ge2)$ 为来自该总体的简单随机样本，则对于统计量 $T_1=\\dfrac1n\\sum\\limits_{i=1}^{n}X_i$ 和 $T_2=\\dfrac{1}{n-1}\\sum\\limits_{i=1}^{n-1}X_i+\\dfrac1nX_n$，有（ ）",
      options: ["$E(T_1)>E(T_2)$, $D(T_1)>D(T_2)$", "$E(T_1)>E(T_2)$, $D(T_1)<D(T_2)$", "$E(T_1)<E(T_2)$, $D(T_1)>D(T_2)$", "$E(T_1)<E(T_2)$, $D(T_1)<D(T_2)$"],
      answer: "选 D。",
      src: { file: "参考文件/真题/数学/6、【1987-2025年】考研数学三真题答案及解析/2011年数学三真题答案解析.pdf", page: 3, no: "一(8)", note: "题面：真题册（合并册）PDF p46 裁片逐字亲读（2011_p46_b0.png sha256 65fee1f392d3…，命令见 backup/scratch/bank-m3/crops.json）；单源：题面仅真题册裁片（解析册文字层碎裂/不可用，只用于交叉核对答案与结论，不作为题面来源）；字母答案：docs/refs/math3.json（t35 亲读回填，2011_p45.png）。" }
    },
    {
      id: "m3-2012-3", origin: 'year', year: 2012, no: "一(3)", type: "dblint", star: 4,
      school: "全国硕士研究生入学统一考试-数学三 2012 年", tags: ["dbi01", "int25", "tp02"],
      stem: "设函数 $f(t)$ 连续，则二次积分 $\\int_0^{\\frac{\\pi}{2}}\\mathrm{d}\\theta\\int_{2\\cos\\theta}^{2}f(r^2)r\\,\\mathrm{d}r=$（ ）",
      options: ["$\\int_0^2\\mathrm{d}x\\int_{\\sqrt{2x-x^2}}^{\\sqrt{4-x^2}}\\sqrt{x^2+y^2}f(x^2+y^2)\\mathrm{d}y$", "$\\int_0^2\\mathrm{d}x\\int_{\\sqrt{2x-x^2}}^{\\sqrt{4-x^2}}f(x^2+y^2)\\mathrm{d}y$", "$\\int_0^2\\mathrm{d}y\\int_{1+\\sqrt{1-y^2}}^{\\sqrt{4-y^2}}\\sqrt{x^2+y^2}f(x^2+y^2)\\mathrm{d}x$", "$\\int_0^2\\mathrm{d}y\\int_{1+\\sqrt{1-y^2}}^{\\sqrt{4-y^2}}f(x^2+y^2)\\mathrm{d}x$"],
      answer: "选 B。",
      src: { file: "参考文件/真题/数学/6、【1987-2025年】考研数学三真题答案及解析/2012年数学三真题答案解析.pdf", page: 1, no: "一(3)", note: "题面：真题册（合并册）PDF p41 裁片逐字亲读（2012_p41_full110.png sha256 4a0a6e57a187…，命令见 backup/scratch/bank-m3/crops.json）；单源：题面仅真题册裁片（解析册文字层碎裂/不可用，只用于交叉核对答案与结论，不作为题面来源）；字母答案：docs/refs/math3.json（t35 亲读回填，2012_p41.png）。" }
    },
    {
      id: "m3-2012-4", origin: 'year', year: 2012, no: "一(4)", type: "series", star: 4,
      school: "全国硕士研究生入学统一考试-数学三 2012 年", tags: ["ser01", "ser02", "ser04"],
      stem: "已知级数 $\\sum\\limits_{n=1}^{\\infty}(-1)^n\\sqrt{n}\\sin\\dfrac{1}{n^{\\alpha}}$ 绝对收敛，级数 $\\sum\\limits_{n=1}^{\\infty}\\dfrac{(-1)^n}{n^{2-\\alpha}}$ 条件收敛，则（ ）",
      options: ["$0<\\alpha\\le\\dfrac{1}{2}$", "$\\dfrac{1}{2}<\\alpha\\le1$", "$1<\\alpha\\le\\dfrac{3}{2}$", "$\\dfrac{3}{2}<\\alpha<2$"],
      answer: "选 D。",
      src: { file: "参考文件/真题/数学/6、【1987-2025年】考研数学三真题答案及解析/2012年数学三真题答案解析.pdf", page: 2, no: "一(4)", note: "题面：真题册（合并册）PDF p41 裁片逐字亲读（2012_p41_full110.png sha256 4a0a6e57a187…，命令见 backup/scratch/bank-m3/crops.json）；单源：题面仅真题册裁片（解析册文字层碎裂/不可用，只用于交叉核对答案与结论，不作为题面来源）；字母答案：docs/refs/math3.json（t35 亲读回填，2012_p41.png）。" }
    },
    {
      id: "m3-2012-5", origin: 'year', year: 2012, no: "一(5)", type: "linalg", star: 3,
      school: "全国硕士研究生入学统一考试-数学三 2012 年", tags: ["kn25", "kn27", "zb07"],
      stem: "设 $\\alpha_1=\\begin{pmatrix}0\\\\0\\\\c_1\\end{pmatrix}$，$\\alpha_2=\\begin{pmatrix}0\\\\1\\\\c_2\\end{pmatrix}$，$\\alpha_3=\\begin{pmatrix}1\\\\-1\\\\c_3\\end{pmatrix}$，$\\alpha_4=\\begin{pmatrix}-1\\\\1\\\\c_4\\end{pmatrix}$，其中 $c_1,c_2,c_3,c_4$ 为任意常数，则下列向量组线性相关的为（ ）",
      options: ["$\\alpha_1,\\alpha_2,\\alpha_3$", "$\\alpha_1,\\alpha_2,\\alpha_4$", "$\\alpha_1,\\alpha_3,\\alpha_4$", "$\\alpha_2,\\alpha_3,\\alpha_4$"],
      answer: "选 C。",
      src: { file: "参考文件/真题/数学/6、【1987-2025年】考研数学三真题答案及解析/2012年数学三真题答案解析.pdf", page: 2, no: "一(5)", note: "题面：真题册（合并册）PDF p41 裁片逐字亲读（2012_p41_full110.png sha256 4a0a6e57a187…，命令见 backup/scratch/bank-m3/crops.json）；单源：题面仅真题册裁片（解析册文字层碎裂/不可用，只用于交叉核对答案与结论，不作为题面来源）；字母答案：docs/refs/math3.json（t35 亲读回填，2012_p41.png）。" }
    },
    {
      id: "m3-2012-6", origin: 'year', year: 2012, no: "一(6)", type: "eigen", star: 4,
      school: "全国硕士研究生入学统一考试-数学三 2012 年", tags: ["la13", "la14", "kn35"],
      stem: "设 $A$ 为 3 阶矩阵，$P$ 为 3 阶可逆矩阵，且 $P^{-1}AP=\\begin{pmatrix}1&0&0\\\\0&1&0\\\\0&0&2\\end{pmatrix}$. 若 $P=(\\alpha_1,\\alpha_2,\\alpha_3)$，$Q=(\\alpha_1+\\alpha_2,\\alpha_2,\\alpha_3)$，则 $Q^{-1}AQ=$（ ）",
      options: ["$\\begin{pmatrix}1&0&0\\\\0&2&0\\\\0&0&1\\end{pmatrix}$", "$\\begin{pmatrix}1&0&0\\\\0&1&0\\\\0&0&2\\end{pmatrix}$", "$\\begin{pmatrix}2&0&0\\\\0&1&0\\\\0&0&2\\end{pmatrix}$", "$\\begin{pmatrix}2&0&0\\\\0&2&0\\\\0&0&1\\end{pmatrix}$"],
      answer: "选 B。",
      src: { file: "参考文件/真题/数学/6、【1987-2025年】考研数学三真题答案及解析/2012年数学三真题答案解析.pdf", page: 2, no: "一(6)", note: "题面：真题册（合并册）PDF p41 裁片逐字亲读（2012_p41_full110.png sha256 4a0a6e57a187…，命令见 backup/scratch/bank-m3/crops.json）；单源：题面仅真题册裁片（解析册文字层碎裂/不可用，只用于交叉核对答案与结论，不作为题面来源）；字母答案：docs/refs/math3.json（t35 亲读回填，2012_p41.png）。" }
    },
    {
      id: "m3-2012-7", origin: 'year', year: 2012, no: "一(7)", type: "estimate", star: 3,
      school: "全国硕士研究生入学统一考试-数学三 2012 年", tags: ["dbi01", "int23", "zt04"],
      stem: "设随机变量 $X$ 与 $Y$ 相互独立，且都服从区间 $(0,1)$ 上的均匀分布，则 $P\\{X^2+Y^2\\le1\\}=$（ ）",
      options: ["$\\dfrac{1}{4}$", "$\\dfrac{1}{2}$", "$\\dfrac{\\pi}{8}$", "$\\dfrac{\\pi}{4}$"],
      answer: "选 D。",
      src: { file: "参考文件/真题/数学/6、【1987-2025年】考研数学三真题答案及解析/2012年数学三真题答案解析.pdf", page: 3, no: "一(7)", note: "题面：真题册（合并册）PDF p41 裁片逐字亲读（2012_p41_full110.png sha256 4a0a6e57a187…，命令见 backup/scratch/bank-m3/crops.json）；单源：题面仅真题册裁片（解析册文字层碎裂/不可用，只用于交叉核对答案与结论，不作为题面来源）；字母答案：docs/refs/math3.json（t35 亲读回填，2012_p41.png）。" }
    },
    {
      id: "m3-2012-8", origin: 'year', year: 2012, no: "一(8)", type: "estimate", star: 4,
      school: "全国硕士研究生入学统一考试-数学三 2012 年", tags: ["zt04", "tp02", "int23"],
      stem: "设 $X_1,X_2,X_3,X_4$ 为来自总体 $N(1,\\sigma^2)(\\sigma>0)$ 的简单随机样本，则统计量 $\\dfrac{X_1-X_2}{|X_3+X_4-2|}$ 的分布为（ ）",
      options: ["$N(0,1)$", "$t(1)$", "$\\chi^2(1)$", "$F(1,1)$"],
      answer: "选 B。",
      src: { file: "参考文件/真题/数学/6、【1987-2025年】考研数学三真题答案及解析/2012年数学三真题答案解析.pdf", page: 3, no: "一(8)", note: "题面：真题册（合并册）PDF p42 裁片逐字亲读（2012_p42_b0.png sha256 8090723f1c3f…，命令见 backup/scratch/bank-m3/crops.json）；单源：题面仅真题册裁片（解析册文字层碎裂/不可用，只用于交叉核对答案与结论，不作为题面来源）；字母答案：docs/refs/math3.json（t35 亲读回填，2012_p41.png）。" }
    },
    {
      id: "m3-2013-3", origin: 'year', year: 2013, no: "一(3)", type: "dblint", star: 3,
      school: "全国硕士研究生入学统一考试-数学三 2013 年", tags: ["dbi01", "dbi02", "zt04"],
      stem: "设 $D_k$ 是圆域 $D=\\{(x,y)\\mid x^2+y^2\\le1\\}$ 位于第 $k$ 象限的部分. 记 $I_k=\\iint\\limits_{D_k}(y-x)\\,\\mathrm{d}x\\mathrm{d}y\\ (k=1,2,3,4)$，则（ ）",
      options: ["$I_1>0$", "$I_2>0$", "$I_3>0$", "$I_4>0$"],
      answer: "选 B。",
      src: { file: "参考文件/真题/数学/6、【1987-2025年】考研数学三真题答案及解析/2013年数学三真题答案解析.pdf", page: 2, no: "一(3)", note: "题面：真题册（合并册）PDF p37 裁片逐字亲读（2013_p37_full110.png sha256 7f740873935b…，命令见 backup/scratch/bank-m3/crops.json）；单源：题面仅真题册裁片（解析册文字层碎裂/不可用，只用于交叉核对答案与结论，不作为题面来源）；字母答案：docs/refs/math3.json（t35 亲读回填，2013_p37.png）。" }
    },
    {
      id: "m3-2013-4", origin: 'year', year: 2013, no: "一(4)", type: "series", star: 4,
      school: "全国硕士研究生入学统一考试-数学三 2013 年", tags: ["ser01", "ser04", "zt04"],
      stem: "设 $\\{a_n\\}$ 为正项数列，下列选项正确的是（ ）",
      options: ["若 $a_n>a_{n+1}$,则 $\\sum\\limits_{n=1}^{\\infty}(-1)^{n-1}a_n$ 收敛", "若 $\\sum\\limits_{n=1}^{\\infty}(-1)^{n-1}a_n$ 收敛,则 $a_n>a_{n+1}$", "若 $\\sum\\limits_{n=1}^{\\infty}a_n$ 收敛,则存在常数 $p>1$,使 $\\lim\\limits_{n\\to\\infty}n^pa_n$ 存在", "若存在常数 $p>1$,使 $\\lim\\limits_{n\\to\\infty}n^pa_n$ 存在,则 $\\sum\\limits_{n=1}^{\\infty}a_n$ 收敛"],
      answer: "选 D。",
      src: { file: "参考文件/真题/数学/6、【1987-2025年】考研数学三真题答案及解析/2013年数学三真题答案解析.pdf", page: 2, no: "一(4)", note: "题面：真题册（合并册）PDF p37 裁片逐字亲读（2013_p37_full110.png sha256 7f740873935b…，命令见 backup/scratch/bank-m3/crops.json）；单源：题面仅真题册裁片（解析册文字层碎裂/不可用，只用于交叉核对答案与结论，不作为题面来源）；字母答案：docs/refs/math3.json（t35 亲读回填，2013_p37.png）。" }
    },
    {
      id: "m3-2013-5", origin: 'year', year: 2013, no: "一(5)", type: "linalg", star: 3,
      school: "全国硕士研究生入学统一考试-数学三 2013 年", tags: ["zb07", "kn25", "kn27"],
      stem: "设 $A,B,C$ 均为 $n$ 阶矩阵. 若 $AB=C$，且 $B$ 可逆，则（ ）",
      options: ["矩阵 $C$ 的行向量组与矩阵 $A$ 的行向量组等价", "矩阵 $C$ 的列向量组与矩阵 $A$ 的列向量组等价", "矩阵 $C$ 的行向量组与矩阵 $B$ 的行向量组等价", "矩阵 $C$ 的列向量组与矩阵 $B$ 的列向量组等价"],
      answer: "选 B。",
      src: { file: "参考文件/真题/数学/6、【1987-2025年】考研数学三真题答案及解析/2013年数学三真题答案解析.pdf", page: 2, no: "一(5)", note: "题面：真题册（合并册）PDF p37 裁片逐字亲读（2013_p37_full110.png sha256 7f740873935b…，命令见 backup/scratch/bank-m3/crops.json）；单源：题面仅真题册裁片（解析册文字层碎裂/不可用，只用于交叉核对答案与结论，不作为题面来源）；字母答案：docs/refs/math3.json（t35 亲读回填，2013_p37.png）。" }
    },
    {
      id: "m3-2013-6", origin: 'year', year: 2013, no: "一(6)", type: "eigen", star: 4,
      school: "全国硕士研究生入学统一考试-数学三 2013 年", tags: ["la13", "la14", "la04"],
      stem: "矩阵 $\\begin{pmatrix}1&a&1\\\\a&b&a\\\\1&a&1\\end{pmatrix}$ 与 $\\begin{pmatrix}2&0&0\\\\0&b&0\\\\0&0&0\\end{pmatrix}$ 相似的充分必要条件为（ ）",
      options: ["$a=0$, $b=2$", "$a=0$, $b$ 为任意常数", "$a=2$, $b=0$", "$a=2$, $b$ 为任意常数"],
      answer: "选 B。",
      src: { file: "参考文件/真题/数学/6、【1987-2025年】考研数学三真题答案及解析/2013年数学三真题答案解析.pdf", page: 3, no: "一(6)", note: "题面：真题册（合并册）PDF p37 裁片逐字亲读（2013_p37_full110.png sha256 7f740873935b…，命令见 backup/scratch/bank-m3/crops.json）；单源：题面仅真题册裁片（解析册文字层碎裂/不可用，只用于交叉核对答案与结论，不作为题面来源）；字母答案：docs/refs/math3.json（t35 亲读回填，2013_p37.png）。" }
    },
    {
      id: "m3-2013-7", origin: 'year', year: 2013, no: "一(7)", type: "estimate", star: 3,
      school: "全国硕士研究生入学统一考试-数学三 2013 年", tags: ["zt04", "int23", "tp02"],
      stem: "设 $X_1,X_2,X_3$ 是随机变量，且 $X_1\\sim N(0,1)$，$X_2\\sim N(0,2^2)$，$X_3\\sim N(5,3^2)$，$p_i=P\\{-2\\le X_i\\le2\\}(i=1,2,3)$，则（ ）",
      options: ["$p_1>p_2>p_3$", "$p_2>p_1>p_3$", "$p_3>p_1>p_2$", "$p_1>p_3>p_2$"],
      answer: "选 A。",
      src: { file: "参考文件/真题/数学/6、【1987-2025年】考研数学三真题答案及解析/2013年数学三真题答案解析.pdf", page: 3, no: "一(7)", note: "题面：真题册（合并册）PDF p37 裁片逐字亲读（2013_p37_full110.png sha256 7f740873935b…，命令见 backup/scratch/bank-m3/crops.json）；单源：题面仅真题册裁片（解析册文字层碎裂/不可用，只用于交叉核对答案与结论，不作为题面来源）；字母答案：docs/refs/math3.json（t35 亲读回填，2013_p37.png）。" }
    },
    {
      id: "m3-2013-8", origin: 'year', year: 2013, no: "一(8)", type: "estimate", star: 3,
      school: "全国硕士研究生入学统一考试-数学三 2013 年", tags: ["zt04", "int23", "tp02"],
      stem: "设随机变量 $X$ 和 $Y$ 相互独立，且 $X$ 和 $Y$ 的概率分布分别为：$X$ 取 $0,1,2,3$ 的概率依次为 $\\dfrac12,\\dfrac14,\\dfrac18,\\dfrac18$；$Y$ 取 $-1,0,1$ 的概率均为 $\\dfrac13$，则 $P\\{X+Y=2\\}=$（ ）",
      options: ["$\\dfrac{1}{12}$", "$\\dfrac{1}{8}$", "$\\dfrac{1}{6}$", "$\\dfrac{1}{2}$"],
      answer: "选 C。",
      src: { file: "参考文件/真题/数学/6、【1987-2025年】考研数学三真题答案及解析/2013年数学三真题答案解析.pdf", page: 4, no: "一(8)", note: "题面：真题册（合并册）PDF p38 裁片逐字亲读（2013_p38_b0.png sha256 bd2c7f06dbae…，命令见 backup/scratch/bank-m3/crops.json）；单源：题面仅真题册裁片（解析册文字层碎裂/不可用，只用于交叉核对答案与结论，不作为题面来源）；字母答案：docs/refs/math3.json（t35 亲读回填，2013_p37.png）。" }
    },
    {
      id: "m3-2014-1", origin: 'year', year: 2014, no: "一(1)", type: "limit", star: 3,
      school: "全国硕士研究生入学统一考试-数学三 2014 年", tags: ["lim01", "ext02", "zt04"],
      stem: "$\\lim\\limits_{n\\to\\infty}a_n=a$，且 $a\\ne0$，则当 $n$ 充分大时有（ ）",
      options: ["$|a_n|>\\dfrac{|a|}{2}$", "$|a_n|<\\dfrac{|a|}{2}$", "$a_n>a-\\dfrac{1}{n}$", "$a_n<a+\\dfrac{1}{n}$"],
      answer: "选 A。",
      src: { file: "参考文件/真题/数学/6、【1987-2025年】考研数学三真题答案及解析/2014年数学三真题答案解析.pdf", page: 1, no: "一(1)", note: "题面：真题册（合并册）PDF p33 裁片逐字亲读（2014_p33_full110.png sha256 156db487c4b1…，命令见 backup/scratch/bank-m3/crops.json）；单源：题面仅真题册裁片（解析册文字层碎裂/不可用，只用于交叉核对答案与结论，不作为题面来源）；字母答案：docs/refs/math3.json（t35 亲读回填，2014_p33.png）。" }
    },
    {
      id: "m3-2014-2", origin: 'year', year: 2014, no: "一(2)", type: "deriv", star: 2,
      school: "全国硕士研究生入学统一考试-数学三 2014 年", tags: ["ext06", "lim07", "zt04"],
      stem: "下列曲线中有渐近线的是（ ）",
      options: ["$y=x+\\sin x$", "$y=x^2+\\sin x$", "$y=x+\\sin\\dfrac{1}{x}$", "$y=x^2+\\sin\\dfrac{1}{x}$"],
      answer: "选 C。",
      src: { file: "参考文件/真题/数学/6、【1987-2025年】考研数学三真题答案及解析/2014年数学三真题答案解析.pdf", page: 1, no: "一(2)", note: "题面：真题册（合并册）PDF p33 裁片逐字亲读（2014_p33_full110.png sha256 156db487c4b1…，命令见 backup/scratch/bank-m3/crops.json）；单源：题面仅真题册裁片（解析册文字层碎裂/不可用，只用于交叉核对答案与结论，不作为题面来源）；字母答案：docs/refs/math3.json（t35 亲读回填，2014_p33.png）。" }
    },
    {
      id: "m3-2014-3", origin: 'year', year: 2014, no: "一(3)", type: "limit", star: 3,
      school: "全国硕士研究生入学统一考试-数学三 2014 年", tags: ["tay01", "zb13", "ext02"],
      stem: "设 $p(x)=a+bx+cx^2+dx^3$. 当 $x\\to0$ 时，若 $p(x)-\\tan x$ 是比 $x^3$ 高阶的无穷小量，则下列选项中错误的是（ ）",
      options: ["$a=0$", "$b=1$", "$c=0$", "$d=\\dfrac{1}{6}$"],
      answer: "选 D。",
      src: { file: "参考文件/真题/数学/6、【1987-2025年】考研数学三真题答案及解析/2014年数学三真题答案解析.pdf", page: 1, no: "一(3)", note: "题面：真题册（合并册）PDF p33 裁片逐字亲读（2014_p33_full110.png sha256 156db487c4b1…，命令见 backup/scratch/bank-m3/crops.json）；单源：题面仅真题册裁片（解析册文字层碎裂/不可用，只用于交叉核对答案与结论，不作为题面来源）；字母答案：docs/refs/math3.json（t35 亲读回填，2014_p33.png）。" }
    },
    {
      id: "m3-2014-4", origin: 'year', year: 2014, no: "一(4)", type: "deriv", star: 3,
      school: "全国硕士研究生入学统一考试-数学三 2014 年", tags: ["ext05", "ext06", "gx21"],
      stem: "设函数 $f(x)$ 具有 2 阶导数，$g(x)=f(0)(1-x)+f(1)x$，则在区间 $[0,1]$ 上（ ）",
      options: ["当 $f'(x)\\ge 0$ 时，$f(x)\\ge g(x)$", "当 $f'(x)\\ge 0$ 时，$f(x)\\le g(x)$", "当 $f''(x)\\ge 0$ 时，$f(x)\\ge g(x)$", "当 $f''(x)\\ge 0$ 时，$f(x)\\le g(x)$"],
      answer: "选 D。",
      src: { file: "参考文件/真题/数学/6、【1987-2025年】考研数学三真题答案及解析/2014年数学三真题答案解析.pdf", page: 1, no: "一(4)", note: "题面：真题册（合并册）PDF p33 裁片逐字亲读（2014_p33_full110.png sha256 156db487c4b1…，命令见 backup/scratch/bank-m3/crops.json）；单源：题面仅真题册裁片（解析册文字层碎裂/不可用，只用于交叉核对答案与结论，不作为题面来源）；字母答案：docs/refs/math3.json（t35 亲读回填，2014_p33.png）。" }
    },
    {
      id: "m3-2014-5", origin: 'year', year: 2014, no: "一(5)", type: "linalg", star: 3,
      school: "全国硕士研究生入学统一考试-数学三 2014 年", tags: ["la08", "kn31", "kn32"],
      stem: "行列式 $\\begin{vmatrix}0&a&b&0\\\\a&0&0&b\\\\0&c&d&0\\\\c&0&0&d\\end{vmatrix}=$（ ）",
      options: ["$(ad-bc)^2$", "$-(ad-bc)^2$", "$a^2d^2-b^2c^2$", "$b^2c^2-a^2d^2$"],
      answer: "选 B。",
      src: { file: "参考文件/真题/数学/6、【1987-2025年】考研数学三真题答案及解析/2014年数学三真题答案解析.pdf", page: 1, no: "一(5)", note: "题面：真题册（合并册）PDF p33 裁片逐字亲读（2014_p33_full110.png sha256 156db487c4b1…，命令见 backup/scratch/bank-m3/crops.json）；单源：题面仅真题册裁片（解析册文字层碎裂/不可用，只用于交叉核对答案与结论，不作为题面来源）；字母答案：docs/refs/math3.json（t35 亲读回填，2014_p33.png）。" }
    },
    {
      id: "m3-2014-6", origin: 'year', year: 2014, no: "一(6)", type: "linalg", star: 4,
      school: "全国硕士研究生入学统一考试-数学三 2014 年", tags: ["kn25", "kn27", "zb07"],
      stem: "设 $\\alpha_1,\\alpha_2,\\alpha_3$ 均为 3 维向量，则对任意常数 $k,l$，向量组 $\\alpha_1+k\\alpha_3,\\alpha_2+l\\alpha_3$ 线性无关是向量组 $\\alpha_1,\\alpha_2,\\alpha_3$ 线性无关的（ ）",
      options: ["必要非充分条件", "充分非必要条件", "充分必要条件", "既非充分也非必要条件"],
      answer: "选 A。",
      src: { file: "参考文件/真题/数学/6、【1987-2025年】考研数学三真题答案及解析/2014年数学三真题答案解析.pdf", page: 1, no: "一(6)", note: "题面：真题册（合并册）PDF p33 裁片逐字亲读（2014_p33_full110.png sha256 156db487c4b1…，命令见 backup/scratch/bank-m3/crops.json）；单源：题面仅真题册裁片（解析册文字层碎裂/不可用，只用于交叉核对答案与结论，不作为题面来源）；字母答案：docs/refs/math3.json（t35 亲读回填，2014_p33.png）。" }
    },
    {
      id: "m3-2014-7", origin: 'year', year: 2014, no: "一(7)", type: "estimate", star: 2,
      school: "全国硕士研究生入学统一考试-数学三 2014 年", tags: ["zt04", "int23", "tp02"],
      stem: "设随机事件 $A$ 与 $B$ 相互独立，且 $P(B)=0.5$，$P(A-B)=0.3$，则 $P(B-A)=$（ ）",
      options: ["0.1", "0.2", "0.3", "0.4"],
      answer: "选 B。",
      src: { file: "参考文件/真题/数学/6、【1987-2025年】考研数学三真题答案及解析/2014年数学三真题答案解析.pdf", page: 2, no: "一(7)", note: "题面：真题册（合并册）PDF p33 裁片逐字亲读（2014_p33_full110.png sha256 156db487c4b1…，命令见 backup/scratch/bank-m3/crops.json）；单源：题面仅真题册裁片（解析册文字层碎裂/不可用，只用于交叉核对答案与结论，不作为题面来源）；字母答案：docs/refs/math3.json（t35 亲读回填，2014_p33.png）。" }
    },
    {
      id: "m3-2014-8", origin: 'year', year: 2014, no: "一(8)", type: "estimate", star: 4,
      school: "全国硕士研究生入学统一考试-数学三 2014 年", tags: ["zt04", "tp02", "int23"],
      stem: "设 $X_1,X_2,X_3$ 为来自正态总体 $N(0,\\sigma^2)$ 的简单随机样本，则统计量 $S=\\dfrac{X_1-X_2}{\\sqrt2\\,|X_3|}$ 服从的分布为（ ）",
      options: ["$F(1,1)$", "$F(2,1)$", "$t(1)$", "$t(2)$"],
      answer: "选 C。",
      src: { file: "参考文件/真题/数学/6、【1987-2025年】考研数学三真题答案及解析/2014年数学三真题答案解析.pdf", page: 2, no: "一(8)", note: "题面：真题册（合并册）PDF p33 裁片逐字亲读（2014_p33_full110.png sha256 156db487c4b1…，命令见 backup/scratch/bank-m3/crops.json）；单源：题面仅真题册裁片（解析册文字层碎裂/不可用，只用于交叉核对答案与结论，不作为题面来源）；字母答案：docs/refs/math3.json（t35 亲读回填，2014_p33.png）。" }
    },
    {
      id: "m3-2015-1", origin: 'year', year: 2015, no: "一(1)", type: "limit", star: 3,
      school: "全国硕士研究生招生考试-数学三 2015 年", tags: ["lim01", "ext02", "zt04"],
      stem: "设 $\\{x_n\\}$ 是数列. 下列命题中不正确的是（ ）",
      options: ["若 $\\lim\\limits_{n\\to\\infty}x_n=a$,则 $\\lim\\limits_{n\\to\\infty}x_{2n}=\\lim\\limits_{n\\to\\infty}x_{2n+1}=a$", "若 $\\lim\\limits_{n\\to\\infty}x_{2n}=\\lim\\limits_{n\\to\\infty}x_{2n+1}=a$,则 $\\lim\\limits_{n\\to\\infty}x_n=a$", "若 $\\lim\\limits_{n\\to\\infty}x_n=a$,则 $\\lim\\limits_{n\\to\\infty}x_{3n}=\\lim\\limits_{n\\to\\infty}x_{3n+1}=a$", "若 $\\lim\\limits_{n\\to\\infty}x_{3n}=\\lim\\limits_{n\\to\\infty}x_{3n+1}=a$,则 $\\lim\\limits_{n\\to\\infty}x_n=a$"],
      answer: "选 D。",
      src: { file: "参考文件/真题/数学/6、【1987-2025年】考研数学三真题答案及解析/2015年数学三真题答案解析.pdf", page: 1, no: "一(1)", note: "题面：真题册（合并册）PDF p29 裁片逐字亲读（2015_p29_full110.png sha256 47af0052fb32…，命令见 backup/scratch/bank-m3/crops.json）；单源：题面仅真题册裁片（解析册文字层碎裂/不可用，只用于交叉核对答案与结论，不作为题面来源）；字母答案：docs/refs/math3.json（t35 亲读回填，2015_p29.png）。" }
    },
    {
      id: "m3-2015-2", origin: 'year', year: 2015, no: "一(2)", type: "deriv", star: 3,
      school: "全国硕士研究生招生考试-数学三 2015 年", tags: ["ext06", "ext05", "gx21"],
      stem: "设函数 $f(x)$ 在 $(-\\infty,+\\infty)$ 内连续，其 2 阶导函数 $f''(x)$ 的图形如右图所示，则曲线 $y=f(x)$ 的拐点个数为（ ）",
      options: ["0", "1", "2", "3"],
      answer: "选 C。",
      src: { file: "参考文件/真题/数学/6、【1987-2025年】考研数学三真题答案及解析/2015年数学三真题答案解析.pdf", page: 1, no: "一(2)", note: "题面：真题册（合并册）PDF p29 裁片逐字亲读（2015_p29_full110.png sha256 47af0052fb32…，命令见 backup/scratch/bank-m3/crops.json）；单源：题面仅真题册裁片（解析册文字层碎裂/不可用，只用于交叉核对答案与结论，不作为题面来源）；字母答案：docs/refs/math3.json（t35 亲读回填，2015_p29.png）。" }
    },
    {
      id: "m3-2015-3", origin: 'year', year: 2015, no: "一(3)", type: "dblint", star: 4,
      school: "全国硕士研究生招生考试-数学三 2015 年", tags: ["dbi01", "dbi02", "tp02"],
      stem: "设 $D=\\{(x,y)\\mid x^2+y^2\\le2x,x^2+y^2\\le2y\\}$，函数 $f(x,y)$ 在 $D$ 上连续，则 $\\iint\\limits_{D}f(x,y)\\,\\mathrm{d}x\\mathrm{d}y=$（ ）",
      options: ["$\\int_0^{\\frac{\\pi}{4}}\\mathrm{d}\\theta\\int_0^{2\\cos\\theta}f(r\\cos\\theta,r\\sin\\theta)r\\mathrm{d}r+\\int_{\\frac{\\pi}{4}}^{\\frac{\\pi}{2}}\\mathrm{d}\\theta\\int_0^{2\\sin\\theta}f(r\\cos\\theta,r\\sin\\theta)r\\mathrm{d}r$", "$\\int_0^{\\frac{\\pi}{4}}\\mathrm{d}\\theta\\int_0^{2\\sin\\theta}f(r\\cos\\theta,r\\sin\\theta)r\\mathrm{d}r+\\int_{\\frac{\\pi}{4}}^{\\frac{\\pi}{2}}\\mathrm{d}\\theta\\int_0^{2\\cos\\theta}f(r\\cos\\theta,r\\sin\\theta)r\\mathrm{d}r$", "$2\\int_0^1\\mathrm{d}x\\int_{1-\\sqrt{1-x^2}}^{x}f(x,y)\\mathrm{d}y$", "$2\\int_0^1\\mathrm{d}x\\int_x^{\\sqrt{2x-x^2}}f(x,y)\\mathrm{d}y$"],
      answer: "选 B。",
      src: { file: "参考文件/真题/数学/6、【1987-2025年】考研数学三真题答案及解析/2015年数学三真题答案解析.pdf", page: 1, no: "一(3)", note: "题面：真题册（合并册）PDF p29 裁片逐字亲读（2015_p29_full110.png sha256 47af0052fb32…，命令见 backup/scratch/bank-m3/crops.json）；单源：题面仅真题册裁片（解析册文字层碎裂/不可用，只用于交叉核对答案与结论，不作为题面来源）；字母答案：docs/refs/math3.json（t35 亲读回填，2015_p29.png）。" }
    },
    {
      id: "m3-2015-4", origin: 'year', year: 2015, no: "一(4)", type: "series", star: 3,
      school: "全国硕士研究生招生考试-数学三 2015 年", tags: ["ser01", "ser02", "ser04"],
      stem: "下列级数中发散的是（ ）",
      options: ["$\\sum\\limits_{n=1}^{\\infty}\\dfrac{n}{3^n}$", "$\\sum\\limits_{n=1}^{\\infty}\\dfrac{1}{\\sqrt n}\\ln\\left(1+\\dfrac{1}{n}\\right)$", "$\\sum\\limits_{n=2}^{\\infty}\\dfrac{(-1)^n+1}{\\ln n}$", "$\\sum\\limits_{n=1}^{\\infty}\\dfrac{n!}{n^n}$"],
      answer: "选 C。",
      src: { file: "参考文件/真题/数学/6、【1987-2025年】考研数学三真题答案及解析/2015年数学三真题答案解析.pdf", page: 1, no: "一(4)", note: "题面：真题册（合并册）PDF p29 裁片逐字亲读（2015_p29_full110.png sha256 47af0052fb32…，命令见 backup/scratch/bank-m3/crops.json）；单源：题面仅真题册裁片（解析册文字层碎裂/不可用，只用于交叉核对答案与结论，不作为题面来源）；字母答案：docs/refs/math3.json（t35 亲读回填，2015_p29.png）。" }
    },
    {
      id: "m3-2015-5", origin: 'year', year: 2015, no: "一(5)", type: "linalg", star: 4,
      school: "全国硕士研究生招生考试-数学三 2015 年", tags: ["zb08", "la17", "tp09"],
      stem: "设矩阵 $A=\\begin{pmatrix}1&1&1\\\\1&2&a\\\\1&4&a^2\\end{pmatrix}$，$b=\\begin{pmatrix}1\\\\d\\\\d^2\\end{pmatrix}$. 若集合 $\\Omega=\\{1,2\\}$，则线性方程组 $Ax=b$ 有无穷多解的充分必要条件为（ ）",
      options: ["$a\\notin\\Omega$, $d\\notin\\Omega$", "$a\\notin\\Omega$, $d\\in\\Omega$", "$a\\in\\Omega$, $d\\notin\\Omega$", "$a\\in\\Omega$, $d\\in\\Omega$"],
      answer: "选 D。",
      src: { file: "参考文件/真题/数学/6、【1987-2025年】考研数学三真题答案及解析/2015年数学三真题答案解析.pdf", page: 2, no: "一(5)", note: "题面：真题册（合并册）PDF p29 裁片逐字亲读（2015_p29_full110.png sha256 47af0052fb32…，命令见 backup/scratch/bank-m3/crops.json）；单源：题面仅真题册裁片（解析册文字层碎裂/不可用，只用于交叉核对答案与结论，不作为题面来源）；字母答案：docs/refs/math3.json（t35 亲读回填，2015_p29.png）。" }
    },
    {
      id: "m3-2015-6", origin: 'year', year: 2015, no: "一(6)", type: "eigen", star: 4,
      school: "全国硕士研究生招生考试-数学三 2015 年", tags: ["la13", "la14", "la04"],
      stem: "设二次型 $f(x_1,x_2,x_3)$ 在正交变换 $x=Py$ 下的标准形为 $2y_1^2+y_2^2-y_3^2$，其中 $P=(e_1,e_2,e_3)$. 若 $Q=(e_1,-e_3,e_2)$，则 $f(x_1,x_2,x_3)$ 在正交变换 $x=Qy$ 下的标准形为（ ）",
      options: ["$2y_1^2-y_2^2+y_3^2$", "$2y_1^2+y_2^2-y_3^2$", "$2y_1^2-y_2^2-y_3^2$", "$2y_1^2+y_2^2+y_3^2$"],
      answer: "选 A。",
      src: { file: "参考文件/真题/数学/6、【1987-2025年】考研数学三真题答案及解析/2015年数学三真题答案解析.pdf", page: 2, no: "一(6)", note: "题面：真题册（合并册）PDF p29 裁片逐字亲读（2015_p30_full110.png sha256 29666b02c0dd…，命令见 backup/scratch/bank-m3/crops.json）；单源：题面仅真题册裁片（解析册文字层碎裂/不可用，只用于交叉核对答案与结论，不作为题面来源）；字母答案：docs/refs/math3.json（t35 亲读回填，2015_p29.png）。" }
    },
    {
      id: "m3-2015-7", origin: 'year', year: 2015, no: "一(7)", type: "estimate", star: 3,
      school: "全国硕士研究生招生考试-数学三 2015 年", tags: ["zt04", "int23", "tp02"],
      stem: "若 $A,B$ 为任意两个随机事件，则（ ）",
      options: ["$P(AB)\\le P(A)P(B)$", "$P(AB)\\ge P(A)P(B)$", "$P(AB)\\le\\dfrac{P(A)+P(B)}{2}$", "$P(AB)\\ge\\dfrac{P(A)+P(B)}{2}$"],
      answer: "选 C。",
      src: { file: "参考文件/真题/数学/6、【1987-2025年】考研数学三真题答案及解析/2015年数学三真题答案解析.pdf", page: 2, no: "一(7)", note: "题面：真题册（合并册）PDF p30 裁片逐字亲读（2015_p30_full110.png sha256 29666b02c0dd…，命令见 backup/scratch/bank-m3/crops.json）；单源：题面仅真题册裁片（解析册文字层碎裂/不可用，只用于交叉核对答案与结论，不作为题面来源）；字母答案：docs/refs/math3.json（t35 亲读回填，2015_p29.png）。" }
    },
    {
      id: "m3-2015-8", origin: 'year', year: 2015, no: "一(8)", type: "estimate", star: 4,
      school: "全国硕士研究生招生考试-数学三 2015 年", tags: ["zt04", "tp02", "int23"],
      stem: "设总体 $X\\sim B(m,\\theta)$，$X_1,X_2,\\cdots,X_n$ 为来自该总体的简单随机样本，$\\overline{X}$ 为样本均值，则 $E\\left[\\sum\\limits_{i=1}^{n}(X_i-\\overline{X})^2\\right]=$（ ）",
      options: ["$(m-1)n\\theta(1-\\theta)$", "$m(n-1)\\theta(1-\\theta)$", "$(m-1)(n-1)\\theta(1-\\theta)$", "$mn\\theta(1-\\theta)$"],
      answer: "选 B。",
      src: { file: "参考文件/真题/数学/6、【1987-2025年】考研数学三真题答案及解析/2015年数学三真题答案解析.pdf", page: 3, no: "一(8)", note: "题面：真题册（合并册）PDF p30 裁片逐字亲读（2015_p30_full110.png sha256 29666b02c0dd…，命令见 backup/scratch/bank-m3/crops.json）；单源：题面仅真题册裁片（解析册文字层碎裂/不可用，只用于交叉核对答案与结论，不作为题面来源）；字母答案：docs/refs/math3.json（t35 亲读回填，2015_p29.png）。" }
    },
    {
      id: "m3-2015-10", origin: 'year', year: 2015, no: "二(10)", type: "integral", star: 3,
      school: "全国硕士研究生招生考试-数学三 2015 年", tags: ["int25", "int23", "tp02"],
      stem: "设函数 $f(x)$ 连续，$\\varphi(x)=\\int_0^{x^2}xf(t)\\,\\mathrm{d}t$. 若 $\\varphi(1)=1$，$\\varphi'(1)=5$，则 $f(1)=$______.",
      answer: "2",
      src: { file: "参考文件/真题/数学/6、【1987-2025年】考研数学三真题答案及解析/2015年数学三真题答案解析.pdf", page: 3, no: "二(10)", note: "题面：真题册（合并册）PDF p30 裁片逐字亲读（2015_p30_full110.png sha256 29666b02c0dd…，命令见 backup/scratch/bank-m3/crops.json）；单源：题面仅真题册裁片（解析册文字层碎裂/不可用，只用于交叉核对答案与结论，不作为题面来源）；答案：docs/refs/math3.json 逐字（jx2015_p3.png）。" }
    },
    {
      id: "m3-2015-11", origin: 'year', year: 2015, no: "二(11)", type: "multivar", star: 3,
      school: "全国硕士研究生招生考试-数学三 2015 年", tags: ["multi01", "wr01", "zt04"],
      stem: "若函数 $z=z(x,y)$ 由方程 $e^{x+2y+3z}+xyz=1$ 确定，则 $\\mathrm{d}z\\big|_{(0,0)}=$______.",
      answer: "−(1/3)dx−(2/3)dy",
      src: { file: "参考文件/真题/数学/6、【1987-2025年】考研数学三真题答案及解析/2015年数学三真题答案解析.pdf", page: 3, no: "二(11)", note: "题面：真题册（合并册）PDF p30 裁片逐字亲读（2015_p30_full110.png sha256 29666b02c0dd…，命令见 backup/scratch/bank-m3/crops.json）；单源：题面仅真题册裁片（解析册文字层碎裂/不可用，只用于交叉核对答案与结论，不作为题面来源）；答案：docs/refs/math3.json 逐字（jx2015_p3.png）。" }
    },
    {
      id: "m3-2015-12", origin: 'year', year: 2015, no: "二(12)", type: "ode", star: 3,
      school: "全国硕士研究生招生考试-数学三 2015 年", tags: ["ode03", "kn13", "ext05"],
      stem: "设函数 $y=y(x)$ 是微分方程 $y''+y'-2y=0$ 的解，且在 $x=0$ 处 $y(x)$ 取得极值 3，则 $y(x)=$______.",
      answer: "$2e^x+e^{−2x}$",
      src: { file: "参考文件/真题/数学/6、【1987-2025年】考研数学三真题答案及解析/2015年数学三真题答案解析.pdf", page: 3, no: "二(12)", note: "题面：真题册（合并册）PDF p30 裁片逐字亲读（2015_p30_full110.png sha256 29666b02c0dd…，命令见 backup/scratch/bank-m3/crops.json）；单源：题面仅真题册裁片（解析册文字层碎裂/不可用，只用于交叉核对答案与结论，不作为题面来源）；答案：docs/refs/math3.json 逐字（jx2015_p3.png）。" }
    },
    {
      id: "m3-2015-9", origin: 'year', year: 2015, no: "二(9)", type: "limit", star: 2,
      school: "全国硕士研究生招生考试-数学三 2015 年", tags: ["lim01", "tay01", "ext02"],
      stem: "$\\lim\\limits_{x\\to0}\\dfrac{\\ln(\\cos x)}{x^2}=$______.",
      answer: "−1/2",
      src: { file: "参考文件/真题/数学/6、【1987-2025年】考研数学三真题答案及解析/2015年数学三真题答案解析.pdf", page: 3, no: "二(9)", note: "题面：真题册（合并册）PDF p30 裁片逐字亲读（2015_p30_full110.png sha256 29666b02c0dd…，命令见 backup/scratch/bank-m3/crops.json）；单源：题面仅真题册裁片（解析册文字层碎裂/不可用，只用于交叉核对答案与结论，不作为题面来源）；答案：docs/refs/math3.json 逐字（jx2015_p3.png）。" }
    },
    {
      id: "m3-2016-1", origin: 'year', year: 2016, no: "一(1)", type: "deriv", star: 3,
      school: "全国硕士研究生招生考试-数学三 2016 年", tags: ["ext06", "ext05", "gx21"],
      stem: "设函数 $f(x)$ 在 $(-\\infty,+\\infty)$ 内连续，其导函数的图形如图所示，则（ ）",
      options: ["函数 $f(x)$ 有 2 个极值点,曲线 $y=f(x)$ 有 2 个拐点", "函数 $f(x)$ 有 2 个极值点,曲线 $y=f(x)$ 有 3 个拐点", "函数 $f(x)$ 有 3 个极值点,曲线 $y=f(x)$ 有 1 个拐点", "函数 $f(x)$ 有 3 个极值点,曲线 $y=f(x)$ 有 2 个拐点"],
      answer: "选 B。",
      src: { file: "参考文件/真题/数学/6、【1987-2025年】考研数学三真题答案及解析/2016年数学三真题答案解析.pdf", page: 4, no: "一(1)", note: "题面：真题册（合并册）PDF p25 裁片逐字亲读（2016_p25_full110.png sha256 b8fb28a4dc3f…，命令见 backup/scratch/bank-m3/crops.json）；单源：题面仅真题册裁片（解析册文字层碎裂/不可用，只用于交叉核对答案与结论，不作为题面来源）；字母答案：docs/refs/math3.json（t35 亲读回填，2016_p25.png）。" }
    },
    {
      id: "m3-2016-2", origin: 'year', year: 2016, no: "一(2)", type: "multivar", star: 3,
      school: "全国硕士研究生招生考试-数学三 2016 年", tags: ["multi01", "wr01", "ext27"],
      stem: "已知函数 $f(x,y)=\\dfrac{e^x}{x-y}$，则（ ）",
      options: ["$f'_x-f'_y=0$", "$f'_x+f'_y=0$", "$f'_x-f'_y=f$", "$f'_x+f'_y=f$"],
      answer: "选 D。",
      src: { file: "参考文件/真题/数学/6、【1987-2025年】考研数学三真题答案及解析/2016年数学三真题答案解析.pdf", page: 1, no: "一(2)", note: "题面：真题册（合并册）PDF p25 裁片逐字亲读（2016_p25_full110.png sha256 b8fb28a4dc3f…，命令见 backup/scratch/bank-m3/crops.json）；单源：题面仅真题册裁片（解析册文字层碎裂/不可用，只用于交叉核对答案与结论，不作为题面来源）；字母答案：docs/refs/math3.json（t35 亲读回填，2016_p25.png）。" }
    },
    {
      id: "m3-2016-3", origin: 'year', year: 2016, no: "一(3)", type: "dblint", star: 4,
      school: "全国硕士研究生招生考试-数学三 2016 年", tags: ["dbi01", "tp04", "d13"],
      stem: "设 $J_i=\\iint\\limits_{D_i}\\sqrt[3]{x-y}\\,\\mathrm{d}x\\mathrm{d}y\\;(i=1,2,3)$，其中 $D_1=\\{(x,y)\\mid 0\\le x\\le1,0\\le y\\le1\\}$，$D_2=\\{(x,y)\\mid 0\\le x\\le1,0\\le y\\le\\sqrt{x}\\}$，$D_3=\\{(x,y)\\mid 0\\le x\\le1,x^2\\le y\\le1\\}$，则（ ）",
      options: ["$J_1<J_2<J_3$", "$J_3<J_1<J_2$", "$J_2<J_3<J_1$", "$J_2<J_1<J_3$"],
      answer: "选 B。",
      src: { file: "参考文件/真题/数学/6、【1987-2025年】考研数学三真题答案及解析/2016年数学三真题答案解析.pdf", page: 1, no: "一(3)", note: "题面：真题册（合并册）PDF p25 裁片逐字亲读（2016_p25_full110.png sha256 b8fb28a4dc3f…，命令见 backup/scratch/bank-m3/crops.json）；单源：题面仅真题册裁片（解析册文字层碎裂/不可用，只用于交叉核对答案与结论，不作为题面来源）；字母答案：docs/refs/math3.json（t35 亲读回填，2016_p25.png）。" }
    },
    {
      id: "m3-2016-4", origin: 'year', year: 2016, no: "一(4)", type: "series", star: 3,
      school: "全国硕士研究生招生考试-数学三 2016 年", tags: ["ser02", "ser04", "tp01"],
      stem: "级数 $\\sum\\limits_{n=1}^{\\infty}\\left(\\dfrac{1}{\\sqrt{n}}-\\dfrac{1}{\\sqrt{n+1}}\\right)\\sin(n+k)$（$k$ 为常数）（ ）",
      options: ["绝对收敛", "条件收敛", "发散", "收敛性与 $k$ 有关"],
      answer: "选 A。",
      src: { file: "参考文件/真题/数学/6、【1987-2025年】考研数学三真题答案及解析/2016年数学三真题答案解析.pdf", page: 1, no: "一(4)", note: "题面：真题册（合并册）PDF p25 裁片逐字亲读（2016_p25_full110.png sha256 b8fb28a4dc3f…，命令见 backup/scratch/bank-m3/crops.json）；单源：题面仅真题册裁片（解析册文字层碎裂/不可用，只用于交叉核对答案与结论，不作为题面来源）；字母答案：docs/refs/math3.json（t35 亲读回填，2016_p25.png）。" }
    },
    {
      id: "m3-2016-5", origin: 'year', year: 2016, no: "一(5)", type: "linalg", star: 3,
      school: "全国硕士研究生招生考试-数学三 2016 年", tags: ["la13", "la04", "la14"],
      stem: "设 $A,B$ 是可逆矩阵，且 $A$ 与 $B$ 相似，则下列结论错误的是（ ）",
      options: ["$A^{\\mathrm{T}}$ 与 $B^{\\mathrm{T}}$ 相似", "$A^{-1}$ 与 $B^{-1}$ 相似", "$A+A^{\\mathrm{T}}$ 与 $B+B^{\\mathrm{T}}$ 相似", "$A+A^{-1}$ 与 $B+B^{-1}$ 相似"],
      answer: "选 C。",
      src: { file: "参考文件/真题/数学/6、【1987-2025年】考研数学三真题答案及解析/2016年数学三真题答案解析.pdf", page: 2, no: "一(5)", note: "题面：真题册（合并册）PDF p25 裁片逐字亲读（2016_p25_full110.png sha256 b8fb28a4dc3f…，命令见 backup/scratch/bank-m3/crops.json）；单源：题面仅真题册裁片（解析册文字层碎裂/不可用，只用于交叉核对答案与结论，不作为题面来源）；字母答案：docs/refs/math3.json（t35 亲读回填，2016_p25.png）。" }
    },
    {
      id: "m3-2016-6", origin: 'year', year: 2016, no: "一(6)", type: "eigen", star: 4,
      school: "全国硕士研究生招生考试-数学三 2016 年", tags: ["la15", "la16", "tp09"],
      stem: "设二次型 $f(x_1,x_2,x_3)=a(x_1^2+x_2^2+x_3^2)+2x_1x_2+2x_2x_3+2x_1x_3$ 的正、负惯性指数分别为 $1,2$，则（ ）",
      options: ["$a>1$", "$a<-2$", "$-2<a<1$", "$a=1$ 或 $a=-2$"],
      answer: "选 C。",
      src: { file: "参考文件/真题/数学/6、【1987-2025年】考研数学三真题答案及解析/2016年数学三真题答案解析.pdf", page: 2, no: "一(6)", note: "题面：真题册（合并册）PDF p25 裁片逐字亲读（2016_p25_full110.png sha256 b8fb28a4dc3f…，命令见 backup/scratch/bank-m3/crops.json）；单源：题面仅真题册裁片（解析册文字层碎裂/不可用，只用于交叉核对答案与结论，不作为题面来源）；字母答案：docs/refs/math3.json（t35 亲读回填，2016_p25.png）。" }
    },
    {
      id: "m3-2016-7", origin: 'year', year: 2016, no: "一(7)", type: "estimate", star: 3,
      school: "全国硕士研究生招生考试-数学三 2016 年", tags: ["zt04", "tp02", "int23"],
      stem: "设 $A,B$ 为两个随机事件，且 $0<P(A)<1$，$0<P(B)<1$，如果 $P(A\\mid B)=1$，则（ ）",
      options: ["$P(\\bar B\\mid\\bar A)=1$", "$P(A\\mid\\bar B)=0$", "$P(A\\cup B)=1$", "$P(B\\mid A)=1$"],
      answer: "选 A。",
      src: { file: "参考文件/真题/数学/6、【1987-2025年】考研数学三真题答案及解析/2016年数学三真题答案解析.pdf", page: 2, no: "一(7)", note: "题面：真题册（合并册）PDF p25 裁片逐字亲读（2016_p25_full110.png sha256 b8fb28a4dc3f…，命令见 backup/scratch/bank-m3/crops.json）；单源：题面仅真题册裁片（解析册文字层碎裂/不可用，只用于交叉核对答案与结论，不作为题面来源）；字母答案：docs/refs/math3.json（t35 亲读回填，2016_p25.png）。" }
    },
    {
      id: "m3-2016-8", origin: 'year', year: 2016, no: "一(8)", type: "estimate", star: 3,
      school: "全国硕士研究生招生考试-数学三 2016 年", tags: ["zt04", "int23", "tp02"],
      stem: "设随机变量 $X$ 与 $Y$ 相互独立，且 $X\\sim N(1,2)$，$Y\\sim N(1,4)$，则 $D(XY)=$（ ）",
      options: ["6", "8", "14", "15"],
      answer: "选 C。",
      src: { file: "参考文件/真题/数学/6、【1987-2025年】考研数学三真题答案及解析/2016年数学三真题答案解析.pdf", page: 2, no: "一(8)", note: "题面：真题册（合并册）PDF p25 裁片逐字亲读（2016_p25_full110.png sha256 b8fb28a4dc3f…，命令见 backup/scratch/bank-m3/crops.json）；单源：题面仅真题册裁片（解析册文字层碎裂/不可用，只用于交叉核对答案与结论，不作为题面来源）；字母答案：docs/refs/math3.json（t35 亲读回填，2016_p25.png）。" }
    },
    {
      id: "m3-2016-10", origin: 'year', year: 2016, no: "二(10)", type: "integral", star: 3,
      school: "全国硕士研究生招生考试-数学三 2016 年", tags: ["int01", "int23", "wr02"],
      stem: "极限 $\\lim\\limits_{n\\to\\infty}\\dfrac{1}{n^2}\\left(\\sin\\dfrac{1}{n}+2\\sin\\dfrac{2}{n}+\\cdots+n\\sin\\dfrac{n}{n}\\right)=$______.",
      answer: "sin1−cos1",
      src: { file: "参考文件/真题/数学/6、【1987-2025年】考研数学三真题答案及解析/2016年数学三真题答案解析.pdf", page: 2, no: "二(10)", note: "题面：真题册（合并册）PDF p26 裁片逐字亲读（2016_p26_b0.png sha256 b1c3909d673c…，命令见 backup/scratch/bank-m3/crops.json）；单源：题面仅真题册裁片（解析册文字层碎裂/不可用，只用于交叉核对答案与结论，不作为题面来源）；答案：docs/refs/math3.json 逐字（jx2016_p2.png）。" }
    },
    {
      id: "m3-2016-9", origin: 'year', year: 2016, no: "二(9)", type: "limit", star: 3,
      school: "全国硕士研究生招生考试-数学三 2016 年", tags: ["lim01", "tay01", "ext02"],
      stem: "已知函数 $f(x)$ 满足 $\\lim\\limits_{x\\to0}\\dfrac{\\sqrt{1+f(x)\\sin 2x}-1}{e^{3x}-1}=2$，则 $\\lim\\limits_{x\\to0}f(x)=$______.",
      answer: "6",
      src: { file: "参考文件/真题/数学/6、【1987-2025年】考研数学三真题答案及解析/2016年数学三真题答案解析.pdf", page: 2, no: "二(9)", note: "题面：真题册（合并册）PDF p25 裁片逐字亲读（2016_p25_full110.png sha256 b8fb28a4dc3f…，命令见 backup/scratch/bank-m3/crops.json）；单源：题面仅真题册裁片（解析册文字层碎裂/不可用，只用于交叉核对答案与结论，不作为题面来源）；答案：docs/refs/math3.json 逐字（jx2016_p2.png）。" }
    },
    {
      id: "m3-2017-1", origin: 'year', year: 2017, no: "一(1)", type: "limit", star: 3,
      school: "全国硕士研究生招生考试-数学三 2017 年", tags: ["lim01", "tay01", "ext02"],
      stem: "若函数 $f(x)=\\begin{cases}\\dfrac{1-\\cos\\sqrt{x}}{ax},&x>0\\\\ b,&x\\le0\\end{cases}$，在 $x=0$ 处连续，则（ ）",
      options: ["$ab=\\dfrac{1}{2}$", "$ab=-\\dfrac{1}{2}$", "$ab=0$", "$ab=2$"],
      answer: "选 A。",
      src: { file: "参考文件/真题/数学/6、【1987-2025年】考研数学三真题答案及解析/2017年数学三真题答案解析.pdf", page: 1, no: "一(1)", note: "题面：真题册（合并册）PDF p21 裁片逐字亲读（2017_p21_full110.png sha256 edf7b28ead55…，命令见 backup/scratch/bank-m3/crops.json）；单源：题面仅真题册裁片（解析册文字层碎裂/不可用，只用于交叉核对答案与结论，不作为题面来源）；字母答案：docs/refs/math3.json（t35 亲读回填，2017_p21.png）。" }
    },
    {
      id: "m3-2017-2", origin: 'year', year: 2017, no: "一(2)", type: "multivar", star: 3,
      school: "全国硕士研究生招生考试-数学三 2017 年", tags: ["multi02", "multi03", "tp03"],
      stem: "二元函数 $z=xy(3-x-y)$ 的极值点是（ ）",
      options: ["$(0,0)$", "$(0,3)$", "$(3,0)$", "$(1,1)$"],
      answer: "选 D。",
      src: { file: "参考文件/真题/数学/6、【1987-2025年】考研数学三真题答案及解析/2017年数学三真题答案解析.pdf", page: 1, no: "一(2)", note: "题面：真题册（合并册）PDF p21 裁片逐字亲读（2017_p21_full110.png sha256 edf7b28ead55…，命令见 backup/scratch/bank-m3/crops.json）；单源：题面仅真题册裁片（解析册文字层碎裂/不可用，只用于交叉核对答案与结论，不作为题面来源）；字母答案：docs/refs/math3.json（t35 亲读回填，2017_p21.png）。" }
    },
    {
      id: "m3-2017-3", origin: 'year', year: 2017, no: "一(3)", type: "deriv", star: 3,
      school: "全国硕士研究生招生考试-数学三 2017 年", tags: ["d01", "ext05", "gx22"],
      stem: "设函数 $f(x)$ 可导，且 $f(x)f'(x)>0$，则（ ）",
      options: ["$f(1)>f(-1)$", "$f(1)<f(-1)$", "$|f(1)|>|f(-1)|$", "$|f(1)|<|f(-1)|$"],
      answer: "选 C。",
      src: { file: "参考文件/真题/数学/6、【1987-2025年】考研数学三真题答案及解析/2017年数学三真题答案解析.pdf", page: 1, no: "一(3)", note: "题面：真题册（合并册）PDF p21 裁片逐字亲读（2017_p21_full110.png sha256 edf7b28ead55…，命令见 backup/scratch/bank-m3/crops.json）；单源：题面仅真题册裁片（解析册文字层碎裂/不可用，只用于交叉核对答案与结论，不作为题面来源）；字母答案：docs/refs/math3.json（t35 亲读回填，2017_p21.png）。" }
    },
    {
      id: "m3-2017-4", origin: 'year', year: 2017, no: "一(4)", type: "series", star: 4,
      school: "全国硕士研究生招生考试-数学三 2017 年", tags: ["ser02", "tay02", "lim03"],
      stem: "若级数 $\\sum\\limits_{n=2}^{\\infty}\\left[\\sin\\dfrac{1}{n}-k\\ln\\left(1-\\dfrac{1}{n}\\right)\\right]$ 收敛，则 $k=$（ ）",
      options: ["1", "2", "$-1$", "$-2$"],
      answer: "选 C。",
      src: { file: "参考文件/真题/数学/6、【1987-2025年】考研数学三真题答案及解析/2017年数学三真题答案解析.pdf", page: 1, no: "一(4)", note: "题面：真题册（合并册）PDF p21 裁片逐字亲读（2017_p21_full110.png sha256 edf7b28ead55…，命令见 backup/scratch/bank-m3/crops.json）；单源：题面仅真题册裁片（解析册文字层碎裂/不可用，只用于交叉核对答案与结论，不作为题面来源）；字母答案：docs/refs/math3.json（t35 亲读回填，2017_p21.png）。" }
    },
    {
      id: "m3-2017-5", origin: 'year', year: 2017, no: "一(5)", type: "linalg", star: 3,
      school: "全国硕士研究生招生考试-数学三 2017 年", tags: ["la05", "zb01", "la15"],
      stem: "设 $\\alpha$ 为 $n$ 维单位列向量，$E$ 为 $n$ 阶单位矩阵，则（ ）",
      options: ["$E-\\alpha\\alpha^{\\mathrm{T}}$ 不可逆", "$E+\\alpha\\alpha^{\\mathrm{T}}$ 不可逆", "$E+2\\alpha\\alpha^{\\mathrm{T}}$ 不可逆", "$E-2\\alpha\\alpha^{\\mathrm{T}}$ 不可逆"],
      answer: "选 A。",
      src: { file: "参考文件/真题/数学/6、【1987-2025年】考研数学三真题答案及解析/2017年数学三真题答案解析.pdf", page: 1, no: "一(5)", note: "题面：真题册（合并册）PDF p21 裁片逐字亲读（2017_p21_full110.png sha256 edf7b28ead55…，命令见 backup/scratch/bank-m3/crops.json）；单源：题面仅真题册裁片（解析册文字层碎裂/不可用，只用于交叉核对答案与结论，不作为题面来源）；字母答案：docs/refs/math3.json（t35 亲读回填，2017_p21.png）。" }
    },
    {
      id: "m3-2017-6", origin: 'year', year: 2017, no: "一(6)", type: "linalg", star: 4,
      school: "全国硕士研究生招生考试-数学三 2017 年", tags: ["la13", "la14", "tp09"],
      stem: "已知矩阵 $A=\\begin{pmatrix}2&0&0\\\\0&2&1\\\\0&0&1\\end{pmatrix}$，$B=\\begin{pmatrix}2&1&0\\\\0&2&0\\\\0&0&1\\end{pmatrix}$，$C=\\begin{pmatrix}1&0&0\\\\0&2&0\\\\0&0&2\\end{pmatrix}$，则（ ）",
      options: ["$A$ 与 $C$ 相似,$B$ 与 $C$ 相似", "$A$ 与 $C$ 相似,$B$ 与 $C$ 不相似", "$A$ 与 $C$ 不相似,$B$ 与 $C$ 相似", "$A$ 与 $C$ 不相似,$B$ 与 $C$ 不相似"],
      answer: "选 B。",
      src: { file: "参考文件/真题/数学/6、【1987-2025年】考研数学三真题答案及解析/2017年数学三真题答案解析.pdf", page: 1, no: "一(6)", note: "题面：真题册（合并册）PDF p21 裁片逐字亲读（2017_p21_full110.png sha256 edf7b28ead55…，命令见 backup/scratch/bank-m3/crops.json）；单源：题面仅真题册裁片（解析册文字层碎裂/不可用，只用于交叉核对答案与结论，不作为题面来源）；字母答案：docs/refs/math3.json（t35 亲读回填，2017_p21.png）。" }
    },
    {
      id: "m3-2017-7", origin: 'year', year: 2017, no: "一(7)", type: "estimate", star: 4,
      school: "全国硕士研究生招生考试-数学三 2017 年", tags: ["zt04", "tp02", "int23"],
      stem: "设 $A,B,C$ 为三个随机事件，且 $A$ 与 $C$ 相互独立，$B$ 与 $C$ 相互独立，则 $A\\cup B$ 与 $C$ 相互独立的充分必要条件是（ ）",
      options: ["$A$ 与 $B$ 相互独立", "$A$ 与 $B$ 互不相容", "$AB$ 与 $C$ 相互独立", "$AB$ 与 $C$ 互不相容"],
      answer: "选 C。",
      src: { file: "参考文件/真题/数学/6、【1987-2025年】考研数学三真题答案及解析/2017年数学三真题答案解析.pdf", page: 2, no: "一(7)", note: "题面：真题册（合并册）PDF p21 裁片逐字亲读（2017_p21_full110.png sha256 edf7b28ead55…，命令见 backup/scratch/bank-m3/crops.json）；单源：题面仅真题册裁片（解析册文字层碎裂/不可用，只用于交叉核对答案与结论，不作为题面来源）；字母答案：docs/refs/math3.json（t35 亲读回填，2017_p21.png）。" }
    },
    {
      id: "m3-2017-8", origin: 'year', year: 2017, no: "一(8)", type: "estimate", star: 4,
      school: "全国硕士研究生招生考试-数学三 2017 年", tags: ["zt05", "tp05", "int23"],
      stem: "设 $X_1,X_2,\\cdots,X_n\\,(n\\ge2)$ 为来自总体 $N(\\mu,1)$ 的简单随机样本，记 $\\overline{X}=\\dfrac{1}{n}\\sum\\limits_{i=1}^{n}X_i$，则下列结论中不正确的是（ ）",
      options: ["$\\sum\\limits_{i=1}^{n}(X_i-\\mu)^2$ 服从 $\\chi^2$ 分布", "$2(X_n-X_1)^2$ 服从 $\\chi^2$ 分布", "$\\sum\\limits_{i=1}^{n}(X_i-\\bar X)^2$ 服从 $\\chi^2$ 分布", "$n(\\bar X-\\mu)^2$ 服从 $\\chi^2$ 分布"],
      answer: "选 B。",
      src: { file: "参考文件/真题/数学/6、【1987-2025年】考研数学三真题答案及解析/2017年数学三真题答案解析.pdf", page: 2, no: "一(8)", note: "题面：真题册（合并册）PDF p21 裁片逐字亲读（2017_p21_full110.png sha256 edf7b28ead55…，命令见 backup/scratch/bank-m3/crops.json）；单源：题面仅真题册裁片（解析册文字层碎裂/不可用，只用于交叉核对答案与结论，不作为题面来源）；字母答案：docs/refs/math3.json（t35 亲读回填，2017_p21.png）。" }
    },
    {
      id: "m3-2017-9", origin: 'year', year: 2017, no: "二(9)", type: "integral", star: 3,
      school: "全国硕士研究生招生考试-数学三 2017 年", tags: ["int29", "int23", "tp02"],
      stem: "$\\int_{-\\pi}^{\\pi}\\left(\\sin^3 x+\\sqrt{\\pi^2-x^2}\\right)\\mathrm{d}x=$______.",
      answer: "π³/2",
      src: { file: "参考文件/真题/数学/6、【1987-2025年】考研数学三真题答案及解析/2017年数学三真题答案解析.pdf", page: 2, no: "二(9)", note: "题面：真题册（合并册）PDF p22 裁片逐字亲读（2017_p22_b0.png sha256 04b4011a851b…，命令见 backup/scratch/bank-m3/crops.json）；单源：题面仅真题册裁片（解析册文字层碎裂/不可用，只用于交叉核对答案与结论，不作为题面来源）；答案：docs/refs/math3.json 逐字（jx2017_p2.png）。" }
    },
    {
      id: "m3-2018-1", origin: 'year', year: 2018, no: "一(1)", type: "deriv", star: 3,
      school: "全国硕士研究生招生考试-数学三 2018 年", tags: ["d01", "ext05", "tp02"],
      stem: "下列函数中，在 $x=0$ 处不可导的是（ ）",
      options: ["$f(x)=|x|\\sin|x|$", "$f(x)=|x|\\sin\\sqrt{|x|}$", "$f(x)=\\cos|x|$", "$f(x)=\\cos\\sqrt{|x|}$"],
      answer: "选 D。",
      src: { file: "参考文件/真题/数学/6、【1987-2025年】考研数学三真题答案及解析/2018年数学三真题答案解析.pdf", page: 1, no: "一(1)", note: "题面：真题册（合并册）PDF p17 裁片逐字亲读（2018_p17_full110.png sha256 40343156cda3…，命令见 backup/scratch/bank-m3/crops.json）；单源：题面仅真题册裁片（解析册文字层碎裂/不可用，只用于交叉核对答案与结论，不作为题面来源）；字母答案：docs/refs/math3.json（t35 亲读回填，2018_p17.png）。" }
    },
    {
      id: "m3-2018-2", origin: 'year', year: 2018, no: "一(2)", type: "integral", star: 4,
      school: "全国硕士研究生招生考试-数学三 2018 年", tags: ["int23", "mvt05", "tp02"],
      stem: "设函数 $f(x)$ 在 $[0,1]$ 上二阶可导，且 $\\int_0^1 f(x)\\,\\mathrm{d}x=0$，则（ ）",
      options: ["当 $f'(x)<0$ 时,$f\\left(\\dfrac{1}{2}\\right)<0$", "当 $f''(x)<0$ 时,$f\\left(\\dfrac{1}{2}\\right)<0$", "当 $f'(x)>0$ 时,$f\\left(\\dfrac{1}{2}\\right)<0$", "当 $f''(x)>0$ 时,$f\\left(\\dfrac{1}{2}\\right)<0$"],
      answer: "选 D。",
      src: { file: "参考文件/真题/数学/6、【1987-2025年】考研数学三真题答案及解析/2018年数学三真题答案解析.pdf", page: 1, no: "一(2)", note: "题面：真题册（合并册）PDF p17 裁片逐字亲读（2018_p17_full110.png sha256 40343156cda3…，命令见 backup/scratch/bank-m3/crops.json）；单源：题面仅真题册裁片（解析册文字层碎裂/不可用，只用于交叉核对答案与结论，不作为题面来源）；字母答案：docs/refs/math3.json（t35 亲读回填，2018_p17.png）。" }
    },
    {
      id: "m3-2018-3", origin: 'year', year: 2018, no: "一(3)", type: "integral", star: 4,
      school: "全国硕士研究生招生考试-数学三 2018 年", tags: ["int29", "int23", "tp02"],
      stem: "设 $M=\\int_{-\\frac{\\pi}{2}}^{\\frac{\\pi}{2}}\\dfrac{(1+x)^2}{1+x^2}\\mathrm{d}x$，$N=\\int_{-\\frac{\\pi}{2}}^{\\frac{\\pi}{2}}\\dfrac{1+x}{e^x}\\mathrm{d}x$，$K=\\int_{-\\frac{\\pi}{2}}^{\\frac{\\pi}{2}}\\left(1+\\sqrt{\\cos x}\\right)\\mathrm{d}x$，则（ ）",
      options: ["$M>N>K$", "$M>K>N$", "$K>M>N$", "$K>N>M$"],
      answer: "选 C。",
      src: { file: "参考文件/真题/数学/6、【1987-2025年】考研数学三真题答案及解析/2018年数学三真题答案解析.pdf", page: 1, no: "一(3)", note: "题面：真题册（合并册）PDF p17 裁片逐字亲读（2018_p17_full110.png sha256 40343156cda3…，命令见 backup/scratch/bank-m3/crops.json）；单源：题面仅真题册裁片（解析册文字层碎裂/不可用，只用于交叉核对答案与结论，不作为题面来源）；字母答案：docs/refs/math3.json（t35 亲读回填，2018_p17.png）。" }
    },
    {
      id: "m3-2018-4", origin: 'year', year: 2018, no: "一(4)", type: "econ", star: 3,
      school: "全国硕士研究生招生考试-数学三 2018 年", tags: ["ext08", "kn10", "gx28"],
      stem: "设某产品的成本函数 $C(Q)$ 可导，其中 $Q$ 为产量. 若产量为 $Q_0$ 时平均成本最小，则（ ）",
      options: ["$C'(Q_0)=0$", "$C'(Q_0)=C(Q_0)$", "$C'(Q_0)=Q_0C(Q_0)$", "$Q_0C'(Q_0)=C(Q_0)$"],
      answer: "选 D。",
      src: { file: "参考文件/真题/数学/6、【1987-2025年】考研数学三真题答案及解析/2018年数学三真题答案解析.pdf", page: 1, no: "一(4)", note: "题面：真题册（合并册）PDF p17 裁片逐字亲读（2018_p17_full110.png sha256 40343156cda3…，命令见 backup/scratch/bank-m3/crops.json）；单源：题面仅真题册裁片（解析册文字层碎裂/不可用，只用于交叉核对答案与结论，不作为题面来源）；字母答案：docs/refs/math3.json（t35 亲读回填，2018_p17.png）。" }
    },
    {
      id: "m3-2018-5", origin: 'year', year: 2018, no: "一(5)", type: "linalg", star: 3,
      school: "全国硕士研究生招生考试-数学三 2018 年", tags: ["la13", "la14", "tp09"],
      stem: "下列矩阵中，与矩阵 $\\begin{pmatrix}1&1&0\\\\0&1&1\\\\0&0&1\\end{pmatrix}$ 相似的为（ ）",
      options: ["$\\begin{pmatrix}1&1&-1\\\\0&1&1\\\\0&0&1\\end{pmatrix}$", "$\\begin{pmatrix}1&0&-1\\\\0&1&1\\\\0&0&1\\end{pmatrix}$", "$\\begin{pmatrix}1&1&-1\\\\0&1&0\\\\0&0&1\\end{pmatrix}$", "$\\begin{pmatrix}1&0&-1\\\\0&1&0\\\\0&0&1\\end{pmatrix}$"],
      answer: "选 A。",
      src: { file: "参考文件/真题/数学/6、【1987-2025年】考研数学三真题答案及解析/2018年数学三真题答案解析.pdf", page: 1, no: "一(5)", note: "题面：真题册（合并册）PDF p17 裁片逐字亲读（2018_p17_full110.png sha256 40343156cda3…，命令见 backup/scratch/bank-m3/crops.json）；单源：题面仅真题册裁片（解析册文字层碎裂/不可用，只用于交叉核对答案与结论，不作为题面来源）；字母答案：docs/refs/math3.json（t35 亲读回填，2018_p17.png）。" }
    },
    {
      id: "m3-2018-6", origin: 'year', year: 2018, no: "一(6)", type: "linalg", star: 3,
      school: "全国硕士研究生招生考试-数学三 2018 年", tags: ["la17", "la05", "tp09"],
      stem: "设 $A,B$ 为 $n$ 阶矩阵，记 $r(X)$ 为矩阵 $X$ 的秩，$(X,Y)$ 表示分块矩阵，则（ ）",
      options: ["$r(A,AB)=r(A)$", "$r(A,BA)=r(A)$", "$r(A,B)=\\max\\{r(A),r(B)\\}$", "$r(A,B)=r(A^{\\mathrm{T}},B^{\\mathrm{T}})$"],
      answer: "选 A。",
      src: { file: "参考文件/真题/数学/6、【1987-2025年】考研数学三真题答案及解析/2018年数学三真题答案解析.pdf", page: 1, no: "一(6)", note: "题面：真题册（合并册）PDF p17 裁片逐字亲读（2018_p17_full110.png sha256 40343156cda3…，命令见 backup/scratch/bank-m3/crops.json）；单源：题面仅真题册裁片（解析册文字层碎裂/不可用，只用于交叉核对答案与结论，不作为题面来源）；字母答案：docs/refs/math3.json（t35 亲读回填，2018_p17.png）。" }
    },
    {
      id: "m3-2018-7", origin: 'year', year: 2018, no: "一(7)", type: "estimate", star: 3,
      school: "全国硕士研究生招生考试-数学三 2018 年", tags: ["zt04", "int23", "tp02"],
      stem: "设随机变量 $X$ 的概率密度 $f(x)$ 满足 $f(1+x)=f(1-x)$，且 $\\int_0^2 f(x)\\,\\mathrm{d}x=0.6$，则 $P\\{X<0\\}=$（ ）",
      options: ["0.2", "0.3", "0.4", "0.5"],
      answer: "选 A。",
      src: { file: "参考文件/真题/数学/6、【1987-2025年】考研数学三真题答案及解析/2018年数学三真题答案解析.pdf", page: 2, no: "一(7)", note: "题面：真题册（合并册）PDF p17 裁片逐字亲读（2018_p17_full110.png sha256 40343156cda3…，命令见 backup/scratch/bank-m3/crops.json）；单源：题面仅真题册裁片（解析册文字层碎裂/不可用，只用于交叉核对答案与结论，不作为题面来源）；字母答案：docs/refs/math3.json（t35 亲读回填，2018_p17.png）。" }
    },
    {
      id: "m3-2018-8", origin: 'year', year: 2018, no: "一(8)", type: "estimate", star: 4,
      school: "全国硕士研究生招生考试-数学三 2018 年", tags: ["zt05", "tp05", "int23"],
      stem: "设 $X_1,X_2,\\cdots,X_n\\,(n\\ge2)$ 为来自总体 $N(\\mu,\\sigma^2)$（$\\sigma>0$）的简单随机样本. 令 $\\overline{X}=\\dfrac{1}{n}\\sum\\limits_{i=1}^{n}X_i$，$S=\\sqrt{\\dfrac{1}{n-1}\\sum\\limits_{i=1}^{n}(X_i-\\overline{X})^2}$，$S^*=\\sqrt{\\dfrac{1}{n}\\sum\\limits_{i=1}^{n}(X_i-\\mu)^2}$，则（ ）",
      options: ["$\\dfrac{\\sqrt{n}(\\bar X-\\mu)}{S}\\sim t(n)$", "$\\dfrac{\\sqrt{n}(\\bar X-\\mu)}{S}\\sim t(n-1)$", "$\\dfrac{\\sqrt{n}(\\bar X-\\mu)}{S^*}\\sim t(n)$", "$\\dfrac{\\sqrt{n}(\\bar X-\\mu)}{S^*}\\sim t(n-1)$"],
      answer: "选 B。",
      src: { file: "参考文件/真题/数学/6、【1987-2025年】考研数学三真题答案及解析/2018年数学三真题答案解析.pdf", page: 2, no: "一(8)", note: "题面：真题册（合并册）PDF p17 裁片逐字亲读（2018_p17_full110.png sha256 40343156cda3…，命令见 backup/scratch/bank-m3/crops.json）；单源：题面仅真题册裁片（解析册文字层碎裂/不可用，只用于交叉核对答案与结论，不作为题面来源）；字母答案：docs/refs/math3.json（t35 亲读回填，2018_p17.png）。" }
    },
    {
      id: "m3-2018-10", origin: 'year', year: 2018, no: "二(10)", type: "integral", star: 4,
      school: "全国硕士研究生招生考试-数学三 2018 年", tags: ["int33", "int24", "tp02"],
      stem: "$\\int e^x\\arcsin\\sqrt{1-e^{2x}}\\,\\mathrm{d}x=$______.",
      answer: "$e^x·arcsin√(1−e^{2x})−√(1−e^{2x})+C$",
      src: { file: "参考文件/真题/数学/6、【1987-2025年】考研数学三真题答案及解析/2018年数学三真题答案解析.pdf", page: 2, no: "二(10)", note: "题面：真题册（合并册）PDF p18 裁片逐字亲读（2018_p18_b0.png sha256 6cac2710c463…，命令见 backup/scratch/bank-m3/crops.json）；单源：题面仅真题册裁片（解析册文字层碎裂/不可用，只用于交叉核对答案与结论，不作为题面来源）；答案：docs/refs/math3.json 逐字（jx2018_p2.png）。" }
    },
    {
      id: "m3-2018-11", origin: 'year', year: 2018, no: "二(11)", type: "ode", star: 4,
      school: "全国硕士研究生招生考试-数学三 2018 年", tags: ["ode07", "ode01", "ext05"],
      stem: "差分方程 $\\Delta^2 y_t-y_t=5$ 的通解为______.",
      answer: "$C2^x−5$",
      src: { file: "参考文件/真题/数学/6、【1987-2025年】考研数学三真题答案及解析/2018年数学三真题答案解析.pdf", page: 2, no: "二(11)", note: "题面：真题册（合并册）PDF p18 裁片逐字亲读（2018_p18_b0.png sha256 6cac2710c463…，命令见 backup/scratch/bank-m3/crops.json）；单源：题面仅真题册裁片（解析册文字层碎裂/不可用，只用于交叉核对答案与结论，不作为题面来源）；答案：docs/refs/math3.json 逐字（jx2018_p2.png）。" }
    },
    {
      id: "m3-2018-12", origin: 'year', year: 2018, no: "二(12)", type: "deriv", star: 4,
      school: "全国硕士研究生招生考试-数学三 2018 年", tags: ["d01", "ode02", "ext05"],
      stem: "设函数 $f(x)$ 满足 $f(x+\\Delta x)-f(x)=2xf(x)\\Delta x+o(\\Delta x)$（$\\Delta x\\to0$），且 $f(0)=2$，则 $f(1)=$______.",
      answer: "2e",
      src: { file: "参考文件/真题/数学/6、【1987-2025年】考研数学三真题答案及解析/2018年数学三真题答案解析.pdf", page: 2, no: "二(12)", note: "题面：真题册（合并册）PDF p18 裁片逐字亲读（2018_p18_b0.png sha256 6cac2710c463…，命令见 backup/scratch/bank-m3/crops.json）；单源：题面仅真题册裁片（解析册文字层碎裂/不可用，只用于交叉核对答案与结论，不作为题面来源）；答案：docs/refs/math3.json 逐字（jx2018_p2.png）。" }
    },
    {
      id: "m3-2018-9", origin: 'year', year: 2018, no: "二(9)", type: "deriv", star: 3,
      school: "全国硕士研究生招生考试-数学三 2018 年", tags: ["d06", "gx21", "ext06"],
      stem: "曲线 $y=x^2+2\\ln x$ 在其拐点处的切线方程是______.",
      answer: "$y=4x−3$",
      src: { file: "参考文件/真题/数学/6、【1987-2025年】考研数学三真题答案及解析/2018年数学三真题答案解析.pdf", page: 2, no: "二(9)", note: "题面：真题册（合并册）PDF p18 裁片逐字亲读（2018_p18_b0.png sha256 6cac2710c463…，命令见 backup/scratch/bank-m3/crops.json）；单源：题面仅真题册裁片（解析册文字层碎裂/不可用，只用于交叉核对答案与结论，不作为题面来源）；答案：docs/refs/math3.json 逐字（jx2018_p2.png）。" }
    },
    {
      id: "m3-2019-1", origin: 'year', year: 2019, no: "一(1)", type: "limit", star: 3,
      school: "全国硕士研究生招生考试-数学三 2019 年", tags: ["lim01", "tay01", "ext02"],
      stem: "当 $x\\to0$ 时，若 $x-\\tan x$ 与 $x^k$ 是同阶无穷小，则 $k=$（ ）",
      options: ["1", "2", "3", "4"],
      answer: "选 C。",
      src: { file: "参考文件/真题/数学/6、【1987-2025年】考研数学三真题答案及解析/2019年数学三真题答案解析.pdf", page: 1, no: "一(1)", note: "题面：真题册（合并册）PDF p13 裁片逐字亲读（2019_p13_full110.png sha256 fa109f8c6f81…，命令见 backup/scratch/bank-m3/crops.json）；单源：题面仅真题册裁片（解析册文字层碎裂/不可用，只用于交叉核对答案与结论，不作为题面来源）；字母答案：docs/refs/math3.json（t35 亲读回填，2019_p13.png）。" }
    },
    {
      id: "m3-2019-2", origin: 'year', year: 2019, no: "一(2)", type: "deriv", star: 3,
      school: "全国硕士研究生招生考试-数学三 2019 年", tags: ["ext06", "gx21", "mvt05"],
      stem: "已知方程 $x^5-5x+k=0$ 有 3 个不同的实根，则 $k$ 的取值范围是（ ）",
      options: ["$(-\\infty,-4)$", "$(4,+\\infty)$", "$\\{-4,4\\}$", "$(-4,4)$"],
      answer: "选 D。",
      src: { file: "参考文件/真题/数学/6、【1987-2025年】考研数学三真题答案及解析/2019年数学三真题答案解析.pdf", page: 1, no: "一(2)", note: "题面：真题册（合并册）PDF p13 裁片逐字亲读（2019_p13_full110.png sha256 fa109f8c6f81…，命令见 backup/scratch/bank-m3/crops.json）；单源：题面仅真题册裁片（解析册文字层碎裂/不可用，只用于交叉核对答案与结论，不作为题面来源）；字母答案：docs/refs/math3.json（t35 亲读回填，2019_p13.png）。" }
    },
    {
      id: "m3-2019-3", origin: 'year', year: 2019, no: "一(3)", type: "ode", star: 3,
      school: "全国硕士研究生招生考试-数学三 2019 年", tags: ["ode03", "ode01", "ext05"],
      stem: "已知微分方程 $y''+ay'+by=ce^x$ 的通解为 $y=(C_1+C_2x)e^{-x}+e^x$，则 $a,b,c$ 依次为（ ）",
      options: ["1, 0, 1", "1, 0, 2", "2, 1, 3", "2, 1, 4"],
      answer: "选 D。",
      src: { file: "参考文件/真题/数学/6、【1987-2025年】考研数学三真题答案及解析/2019年数学三真题答案解析.pdf", page: 1, no: "一(3)", note: "题面：真题册（合并册）PDF p13 裁片逐字亲读（2019_p13_full110.png sha256 fa109f8c6f81…，命令见 backup/scratch/bank-m3/crops.json）；单源：题面仅真题册裁片（解析册文字层碎裂/不可用，只用于交叉核对答案与结论，不作为题面来源）；字母答案：docs/refs/math3.json（t35 亲读回填，2019_p13.png）。" }
    },
    {
      id: "m3-2019-4", origin: 'year', year: 2019, no: "一(4)", type: "series", star: 4,
      school: "全国硕士研究生招生考试-数学三 2019 年", tags: ["ser02", "ser04", "tp01"],
      stem: "若 $\\sum\\limits_{n=1}^{\\infty}nu_n$ 绝对收敛，$\\sum\\limits_{n=1}^{\\infty}\\dfrac{v_n}{n}$ 条件收敛，则（ ）",
      options: ["$\\sum\\limits_{n=1}^{\\infty}u_nv_n$ 条件收敛", "$\\sum\\limits_{n=1}^{\\infty}u_nv_n$ 绝对收敛", "$\\sum(u_n+v_n)$ 收敛", "$\\sum(u_n+v_n)$ 发散"],
      answer: "选 B。",
      src: { file: "参考文件/真题/数学/6、【1987-2025年】考研数学三真题答案及解析/2019年数学三真题答案解析.pdf", page: 1, no: "一(4)", note: "题面：真题册（合并册）PDF p13 裁片逐字亲读（2019_p13_full110.png sha256 fa109f8c6f81…，命令见 backup/scratch/bank-m3/crops.json）；单源：题面仅真题册裁片（解析册文字层碎裂/不可用，只用于交叉核对答案与结论，不作为题面来源）；字母答案：docs/refs/math3.json（t35 亲读回填，2019_p13.png）。" }
    },
    {
      id: "m3-2019-5", origin: 'year', year: 2019, no: "一(5)", type: "linalg", star: 4,
      school: "全国硕士研究生招生考试-数学三 2019 年", tags: ["la17", "zb08", "tp09"],
      stem: "设 $A$ 是 4 阶矩阵，$A^*$ 是 $A$ 的伴随矩阵，若线性方程组 $Ax=0$ 的基础解系中只有 2 个向量，则 $r(A^*)=$（ ）",
      options: ["0", "1", "2", "3"],
      answer: "选 A。",
      src: { file: "参考文件/真题/数学/6、【1987-2025年】考研数学三真题答案及解析/2019年数学三真题答案解析.pdf", page: 1, no: "一(5)", note: "题面：真题册（合并册）PDF p13 裁片逐字亲读（2019_p13_full110.png sha256 fa109f8c6f81…，命令见 backup/scratch/bank-m3/crops.json）；单源：题面仅真题册裁片（解析册文字层碎裂/不可用，只用于交叉核对答案与结论，不作为题面来源）；字母答案：docs/refs/math3.json（t35 亲读回填，2019_p13.png）。" }
    },
    {
      id: "m3-2019-6", origin: 'year', year: 2019, no: "一(6)", type: "eigen", star: 4,
      school: "全国硕士研究生招生考试-数学三 2019 年", tags: ["la15", "la16", "tp09"],
      stem: "设 $A$ 是 3 阶实对称矩阵，$E$ 是 3 阶单位矩阵. 若 $A^2+A=2E$，且 $|A|=4$，则二次型 $x^{\\mathrm{T}}Ax$ 的规范形为（ ）",
      options: ["$y_1^2+y_2^2+y_3^2$", "$y_1^2+y_2^2-y_3^2$", "$y_1^2-y_2^2-y_3^2$", "$-y_1^2-y_2^2-y_3^2$"],
      answer: "选 C。",
      src: { file: "参考文件/真题/数学/6、【1987-2025年】考研数学三真题答案及解析/2019年数学三真题答案解析.pdf", page: 1, no: "一(6)", note: "题面：真题册（合并册）PDF p13 裁片逐字亲读（2019_p13_full110.png sha256 fa109f8c6f81…，命令见 backup/scratch/bank-m3/crops.json）；单源：题面仅真题册裁片（解析册文字层碎裂/不可用，只用于交叉核对答案与结论，不作为题面来源）；字母答案：docs/refs/math3.json（t35 亲读回填，2019_p13.png）。" }
    },
    {
      id: "m3-2019-7", origin: 'year', year: 2019, no: "一(7)", type: "estimate", star: 3,
      school: "全国硕士研究生招生考试-数学三 2019 年", tags: ["zt04", "tp02", "int23"],
      stem: "设 $A,B$ 为随机事件，则 $P(A)=P(B)$ 的充分必要条件是（ ）",
      options: ["$P(A\\cup B)=P(A)+P(B)$", "$P(AB)=P(A)P(B)$", "$P(A\\bar B)=P(B\\bar A)$", "$P(AB)=P(\\bar A\\bar B)$"],
      answer: "选 C。",
      src: { file: "参考文件/真题/数学/6、【1987-2025年】考研数学三真题答案及解析/2019年数学三真题答案解析.pdf", page: 2, no: "一(7)", note: "题面：真题册（合并册）PDF p13 裁片逐字亲读（2019_p13_full110.png sha256 fa109f8c6f81…，命令见 backup/scratch/bank-m3/crops.json）；单源：题面仅真题册裁片（解析册文字层碎裂/不可用，只用于交叉核对答案与结论，不作为题面来源）；字母答案：docs/refs/math3.json（t35 亲读回填，2019_p13.png）。" }
    },
    {
      id: "m3-2019-8", origin: 'year', year: 2019, no: "一(8)", type: "estimate", star: 4,
      school: "全国硕士研究生招生考试-数学三 2019 年", tags: ["zt05", "int23", "tp05"],
      stem: "设随机变量 $X$ 与 $Y$ 相互独立，且都服从正态分布 $N(\\mu,\\sigma^2)$，则 $P\\{|X-Y|<1\\}$（ ）",
      options: ["与 $\\mu$ 无关,而与 $\\sigma^2$ 有关", "与 $\\mu$ 有关,而与 $\\sigma^2$ 无关", "与 $\\mu,\\sigma^2$ 都有关", "与 $\\mu,\\sigma^2$ 都无关"],
      answer: "选 A。",
      src: { file: "参考文件/真题/数学/6、【1987-2025年】考研数学三真题答案及解析/2019年数学三真题答案解析.pdf", page: 2, no: "一(8)", note: "题面：真题册（合并册）PDF p13 裁片逐字亲读（2019_p13_full110.png sha256 fa109f8c6f81…，命令见 backup/scratch/bank-m3/crops.json）；单源：题面仅真题册裁片（解析册文字层碎裂/不可用，只用于交叉核对答案与结论，不作为题面来源）；字母答案：docs/refs/math3.json（t35 亲读回填，2019_p13.png）。" }
    },
    {
      id: "m3-2019-10", origin: 'year', year: 2019, no: "二(10)", type: "deriv", star: 3,
      school: "全国硕士研究生招生考试-数学三 2019 年", tags: ["d06", "gx21", "ext06"],
      stem: "曲线 $y=x\\sin x+2\\cos x\\left(-\\dfrac{\\pi}{2}<x<\\dfrac{3\\pi}{2}\\right)$ 的拐点坐标为______.",
      answer: "(π,−2)",
      src: { file: "参考文件/真题/数学/6、【1987-2025年】考研数学三真题答案及解析/2019年数学三真题答案解析.pdf", page: 2, no: "二(10)", note: "题面：真题册（合并册）PDF p13 裁片逐字亲读（2019_p13_full110.png sha256 fa109f8c6f81…，命令见 backup/scratch/bank-m3/crops.json）；单源：题面仅真题册裁片（解析册文字层碎裂/不可用，只用于交叉核对答案与结论，不作为题面来源）；答案：docs/refs/math3.json 逐字（jx2019_p2.png）。" }
    },
    {
      id: "m3-2019-11", origin: 'year', year: 2019, no: "二(11)", type: "integral", star: 4,
      school: "全国硕士研究生招生考试-数学三 2019 年", tags: ["int25", "int23", "tp02"],
      stem: "已知函数 $f(x)=\\int_1^{x}\\sqrt{1+t^4}\\,\\mathrm{d}t$，则 $\\int_0^1 x^2f(x)\\,\\mathrm{d}x=$______.",
      answer: "(1/18)(1−2√2)",
      src: { file: "参考文件/真题/数学/6、【1987-2025年】考研数学三真题答案及解析/2019年数学三真题答案解析.pdf", page: 2, no: "二(11)", note: "题面：真题册（合并册）PDF p13 裁片逐字亲读（2019_p13_full110.png sha256 fa109f8c6f81…，命令见 backup/scratch/bank-m3/crops.json）；单源：题面仅真题册裁片（解析册文字层碎裂/不可用，只用于交叉核对答案与结论，不作为题面来源）；答案：docs/refs/math3.json 逐字（jx2019_p2.png）。" }
    },
    {
      id: "m3-2019-9", origin: 'year', year: 2019, no: "二(9)", type: "limit", star: 4,
      school: "全国硕士研究生招生考试-数学三 2019 年", tags: ["lim01", "int23", "tay01"],
      stem: "$\\lim\\limits_{n\\to\\infty}\\left[\\dfrac{1}{1\\cdot2}+\\dfrac{1}{2\\cdot3}+\\cdots+\\dfrac{1}{n(n+1)}\\right]^n=$______.",
      answer: "$e^{−1}$",
      src: { file: "参考文件/真题/数学/6、【1987-2025年】考研数学三真题答案及解析/2019年数学三真题答案解析.pdf", page: 2, no: "二(9)", note: "题面：真题册（合并册）PDF p13 裁片逐字亲读（2019_p13_full110.png sha256 fa109f8c6f81…，命令见 backup/scratch/bank-m3/crops.json）；单源：题面仅真题册裁片（解析册文字层碎裂/不可用，只用于交叉核对答案与结论，不作为题面来源）；答案：docs/refs/math3.json 逐字（jx2019_p2.png）。" }
    },
    {
      id: "m3-2020-1", origin: 'year', year: 2020, no: "一(1)", type: "limit", star: 3,
      school: "全国硕士研究生招生考试-数学三 2020 年", tags: ["lim01", "ext02", "d01"],
      stem: "设 $\\lim\\limits_{x\\to a}\\dfrac{f(x)-a}{x-a}=b$，则 $\\lim\\limits_{x\\to a}\\dfrac{\\sin f(x)-\\sin a}{x-a}=$（ ）",
      options: ["$b\\sin a$", "$b\\cos a$", "$b\\sin f(a)$", "$b\\cos f(a)$"],
      answer: "选 B。",
      src: { file: "参考文件/真题/数学/6、【1987-2025年】考研数学三真题答案及解析/2020年数学三真题答案解析.pdf", page: 1, no: "一(1)", note: "题面：真题册（合并册）PDF p10 裁片逐字亲读（2020_p10_full110.png sha256 825c56aa786a…，命令见 backup/scratch/bank-m3/crops.json）；单源：题面仅真题册裁片（解析册文字层碎裂/不可用，只用于交叉核对答案与结论，不作为题面来源）；字母答案：docs/refs/math3.json（t35 亲读回填）。" }
    },
    {
      id: "m3-2020-2", origin: 'year', year: 2020, no: "一(2)", type: "deriv", star: 4,
      school: "全国硕士研究生招生考试-数学三 2020 年", tags: ["ext06", "ext05", "gx21"],
      stem: "函数 $f(x)=\\dfrac{\\mathrm e^{\\frac{1}{x-1}}\\ln|1+x|}{(\\mathrm e^x-1)(x-2)}$ 的第二类间断点的个数为（ ）",
      options: ["1 个", "2 个", "3 个", "4 个"],
      answer: "选 C。",
      src: { file: "参考文件/真题/数学/6、【1987-2025年】考研数学三真题答案及解析/2020年数学三真题答案解析.pdf", page: 1, no: "一(2)", note: "题面：真题册（合并册）PDF p10 裁片逐字亲读（2020_p10_full110.png sha256 825c56aa786a…，命令见 backup/scratch/bank-m3/crops.json）；交叉核对：一(2) 分子指数为 $\\frac{1}{x-1}$（dpi165 放大片 2020_p10_q2zoom165.png 复核）；字母答案：docs/refs/math3.json（t35 亲读回填）。" }
    },
    {
      id: "m3-2020-3", origin: 'year', year: 2020, no: "一(3)", type: "integral", star: 3,
      school: "全国硕士研究生招生考试-数学三 2020 年", tags: ["int29", "int23", "tp02"],
      stem: "设奇函数 $f(x)$ 在 $(-\\infty,+\\infty)$ 上具有连续导数，则（ ）",
      options: ["$\\int_0^x[\\cos f(t)+f'(t)]\\mathrm dt$ 是奇函数", "$\\int_0^x[\\cos f(t)+f'(t)]\\mathrm dt$ 是偶函数", "$\\int_0^x[\\cos f'(t)+f(t)]\\mathrm dt$ 是奇函数", "$\\int_0^x[\\cos f'(t)+f(t)]\\mathrm dt$ 是偶函数"],
      answer: "选 A。",
      src: { file: "参考文件/真题/数学/6、【1987-2025年】考研数学三真题答案及解析/2020年数学三真题答案解析.pdf", page: 1, no: "一(3)", note: "题面：真题册（合并册）PDF p10 裁片逐字亲读（2020_p10_full110.png sha256 825c56aa786a…，命令见 backup/scratch/bank-m3/crops.json）；单源：题面仅真题册裁片（解析册文字层碎裂/不可用，只用于交叉核对答案与结论，不作为题面来源）；字母答案：docs/refs/math3.json（t35 亲读回填）。" }
    },
    {
      id: "m3-2020-4", origin: 'year', year: 2020, no: "一(4)", type: "series", star: 4,
      school: "全国硕士研究生招生考试-数学三 2020 年", tags: ["ser02", "ser04", "tp01"],
      stem: "设幂级数 $\\sum\\limits_{n=1}^{\\infty}na_n(x-2)^n$ 的收敛区间为 $(-2,6)$，则 $\\sum\\limits_{n=1}^{\\infty}a_n(x+1)^{2n}$ 的收敛区间为（ ）",
      options: ["(-2,6)", "(-3,1)", "(-5,3)", "(-17,15)"],
      answer: "选 B。",
      src: { file: "参考文件/真题/数学/6、【1987-2025年】考研数学三真题答案及解析/2020年数学三真题答案解析.pdf", page: 1, no: "一(4)", note: "题面：真题册（合并册）PDF p10 裁片逐字亲读（2020_p10_full110.png sha256 825c56aa786a…，命令见 backup/scratch/bank-m3/crops.json）；单源：题面仅真题册裁片（解析册文字层碎裂/不可用，只用于交叉核对答案与结论，不作为题面来源）；字母答案：docs/refs/math3.json（t35 亲读回填）。" }
    },
    {
      id: "m3-2020-5", origin: 'year', year: 2020, no: "一(5)", type: "linalg", star: 4,
      school: "全国硕士研究生招生考试-数学三 2020 年", tags: ["la17", "zb08", "tp09"],
      stem: "设 4 阶矩阵 $A=(a_{ij})$ 不可逆，$a_{12}$ 的代数余子式 $A_{12}\\ne0$，$\\alpha_1,\\alpha_2,\\alpha_3,\\alpha_4$ 为矩阵 $A$ 的列向量组，$A^*$ 为 $A$ 的伴随矩阵，则方程组 $A^*x=0$ 的通解为（ ）",
      options: ["$x=k_1\\alpha_1+k_2\\alpha_2+k_3\\alpha_3$", "$x=k_1\\alpha_1+k_2\\alpha_2+k_3\\alpha_4$", "$x=k_1\\alpha_1+k_2\\alpha_3+k_3\\alpha_4$", "$x=k_1\\alpha_2+k_2\\alpha_3+k_3\\alpha_4$"],
      answer: "选 C。",
      src: { file: "参考文件/真题/数学/6、【1987-2025年】考研数学三真题答案及解析/2020年数学三真题答案解析.pdf", page: 1, no: "一(5)", note: "题面：真题册（合并册）PDF p10 裁片逐字亲读（2020_p10_full110.png sha256 825c56aa786a…，命令见 backup/scratch/bank-m3/crops.json）；单源：题面仅真题册裁片（解析册文字层碎裂/不可用，只用于交叉核对答案与结论，不作为题面来源）；字母答案：docs/refs/math3.json（t35 亲读回填）。" }
    },
    {
      id: "m3-2020-6", origin: 'year', year: 2020, no: "一(6)", type: "eigen", star: 4,
      school: "全国硕士研究生招生考试-数学三 2020 年", tags: ["la13", "la14", "la04"],
      stem: "设 $A$ 为 3 阶矩阵，$\\alpha_1,\\alpha_2$ 为 $A$ 的属于特征值 1 的线性无关的特征向量，$\\alpha_3$ 为 $A$ 的属于特征值 $-1$ 的特征向量，则满足 $P^{-1}AP=\\begin{pmatrix}1&0&0\\\\0&-1&0\\\\0&0&1\\end{pmatrix}$ 的可逆矩阵 $P$ 可为（ ）",
      options: ["$(\\alpha_1+\\alpha_3,\\alpha_2,-\\alpha_3)$", "$(\\alpha_1+\\alpha_2,\\alpha_2,-\\alpha_3)$", "$(\\alpha_1+\\alpha_3,-\\alpha_3,\\alpha_2)$", "$(\\alpha_1+\\alpha_2,-\\alpha_3,\\alpha_2)$"],
      answer: "选 D。",
      src: { file: "参考文件/真题/数学/6、【1987-2025年】考研数学三真题答案及解析/2020年数学三真题答案解析.pdf", page: 2, no: "一(6)", note: "题面：真题册（合并册）PDF p10 裁片逐字亲读（2020_p10_full110.png sha256 825c56aa786a…，命令见 backup/scratch/bank-m3/crops.json）；单源：题面仅真题册裁片（解析册文字层碎裂/不可用，只用于交叉核对答案与结论，不作为题面来源）；字母答案：docs/refs/math3.json（t35 亲读回填）。" }
    },
    {
      id: "m3-2020-7", origin: 'year', year: 2020, no: "一(7)", type: "estimate", star: 3,
      school: "全国硕士研究生招生考试-数学三 2020 年", tags: ["zt04", "tp02", "int23"],
      stem: "设 $A,B,C$ 为三个随机事件，且 $P(A)=P(B)=P(C)=\\dfrac14$，$P(AB)=0$，$P(AC)=P(BC)=\\dfrac1{12}$，则 $A,B,C$ 中恰有一个事件发生的概率为（ ）",
      options: ["3/4", "2/3", "1/2", "5/12"],
      answer: "选 D。",
      src: { file: "参考文件/真题/数学/6、【1987-2025年】考研数学三真题答案及解析/2020年数学三真题答案解析.pdf", page: 2, no: "一(7)", note: "题面：真题册（合并册）PDF p10 裁片逐字亲读（2020_p10_full110.png sha256 825c56aa786a…，命令见 backup/scratch/bank-m3/crops.json）；单源：题面仅真题册裁片（解析册文字层碎裂/不可用，只用于交叉核对答案与结论，不作为题面来源）；字母答案：docs/refs/math3.json（t35 亲读回填）。" }
    },
    {
      id: "m3-2020-8", origin: 'year', year: 2020, no: "一(8)", type: "estimate", star: 4,
      school: "全国硕士研究生招生考试-数学三 2020 年", tags: ["zt05", "int23", "tp05"],
      stem: "设随机变量 $(X,Y)$ 服从二维正态分布 $N(0,0;1,4;-\\frac12)$，则下列随机变量中服从标准正态分布且与 $X$ 独立的是（ ）",
      options: ["$\\frac{\\sqrt5}{5}(X+Y)$", "$\\frac{\\sqrt5}{5}(X-Y)$", "$\\frac{\\sqrt3}{3}(X+Y)$", "$\\frac{\\sqrt3}{3}(X-Y)$"],
      answer: "选 C。",
      src: { file: "参考文件/真题/数学/6、【1987-2025年】考研数学三真题答案及解析/2020年数学三真题答案解析.pdf", page: 2, no: "一(8)", note: "题面：真题册（合并册）PDF p10 裁片逐字亲读（2020_p10_full110.png sha256 825c56aa786a…，命令见 backup/scratch/bank-m3/crops.json）；单源：题面仅真题册裁片（解析册文字层碎裂/不可用，只用于交叉核对答案与结论，不作为题面来源）；字母答案：docs/refs/math3.json（t35 亲读回填）。" }
    },
    {
      id: "m3-2020-15", origin: 'year', year: 2020, no: "三(15)", type: "limit", star: 4,
      school: "全国硕士研究生招生考试-数学三 2020 年", tags: ["lim01", "tay01", "tay02"],
      stem: "已知 $a$，$b$ 为常数，若 $\\left(1+\\dfrac1n\\right)^n-\\mathrm{e}$ 与 $\\dfrac{b}{n^a}$ 在 $n\\to+\\infty$ 时是等价无穷小，求 $a$，$b$.",
      answer: "$a=1,\\ b=-\\dfrac{\\mathrm e}{2}$",
      src: { file: "参考文件/真题/数学/6、【1987-2025年】考研数学三真题答案及解析/2020年数学三真题答案解析.pdf", page: 4, no: "三(15)", note: "题面：真题册（合并册）PDF p11 裁片逐字亲读（2020_p11_full110.png sha256 4e8d283243a0…，命令见 backup/scratch/bank-m3/crops.json）；单源：题面仅真题册裁片（解析册文字层碎裂/不可用，只用于交叉核对答案与结论，不作为题面来源）；答案：docs/refs/math3.json 逐字（解析册 PDF p4 文字层/裁片）。" }
    },
    {
      id: "m3-2020-16", origin: 'year', year: 2020, no: "三(16)", type: "multivar", star: 3,
      school: "全国硕士研究生招生考试-数学三 2020 年", tags: ["multi02", "multi03", "tp03"],
      stem: "求函数 $f(x,y)=x^3+8y^3-xy$ 的极值.",
      answer: "$f\\left(\\dfrac16,\\dfrac1{12}\\right)=-\\dfrac1{216}$",
      src: { file: "参考文件/真题/数学/6、【1987-2025年】考研数学三真题答案及解析/2020年数学三真题答案解析.pdf", page: 4, no: "三(16)", note: "题面：真题册（合并册）PDF p11 裁片逐字亲读（2020_p11_full110.png sha256 4e8d283243a0…，命令见 backup/scratch/bank-m3/crops.json）；单源：题面仅真题册裁片（解析册文字层碎裂/不可用，只用于交叉核对答案与结论，不作为题面来源）；答案：docs/refs/math3.json 逐字（解析册 PDF p4 文字层/裁片）。" }
    },
    {
      id: "m3-2020-17", origin: 'year', year: 2020, no: "三(17)", type: "ode", star: 4,
      school: "全国硕士研究生招生考试-数学三 2020 年", tags: ["ode03", "ode02", "ext05"],
      stem: "设函数 $y=f(x)$ 满足 $y''+2y'+5y=0$，$f(0)=1$，$f'(0)=-1$.(Ⅰ) 求 $f(x)$ 的表达式.(Ⅱ) 设 $a_n=\\int_{n\\pi}^{+\\infty}f(x)\\,\\mathrm{d}x$，求 $\\sum\\limits_{n=1}^{\\infty}a_n$.",
      answer: "$f(x)=\\mathrm e^{-x}\\cos 2x;\\ \\sum_{n=1}^{\\infty}a_n=\\dfrac{1}{5(\\mathrm e^{\\pi}-1)}$",
      src: { file: "参考文件/真题/数学/6、【1987-2025年】考研数学三真题答案及解析/2020年数学三真题答案解析.pdf", page: 4, no: "三(17)", note: "题面：真题册（合并册）PDF p11 裁片逐字亲读（2020_p11_full110.png sha256 4e8d283243a0…，命令见 backup/scratch/bank-m3/crops.json）；单源：题面仅真题册裁片（解析册文字层碎裂/不可用，只用于交叉核对答案与结论，不作为题面来源）；答案：docs/refs/math3.json 逐字（解析册 PDF p4 文字层/裁片）。" }
    },
    {
      id: "m3-2020-18", origin: 'year', year: 2020, no: "三(18)", type: "dblint", star: 4,
      school: "全国硕士研究生招生考试-数学三 2020 年", tags: ["dbi01", "dbi02", "tp02"],
      stem: "设 $D=\\{(x,y)\\mid x^2+y^2\\le1,y\\ge0\\}$，连续函数 $f(x,y)$ 满足 $f(x,y)=y\\sqrt{1-x^2}+x\\iint\\limits_{D}f(x,y)\\,\\mathrm{d}x\\mathrm{d}y$，求 $\\iint\\limits_{D}xf(x,y)\\,\\mathrm{d}x\\mathrm{d}y$.",
      answer: "$\\dfrac{3\\pi^2}{128}$",
      src: { file: "参考文件/真题/数学/6、【1987-2025年】考研数学三真题答案及解析/2020年数学三真题答案解析.pdf", page: "4-5", no: "三(18)", note: "题面：真题册（合并册）PDF p11 裁片逐字亲读（2020_p11_full110.png sha256 4e8d283243a0…，命令见 backup/scratch/bank-m3/crops.json）；单源：题面仅真题册裁片（解析册文字层碎裂/不可用，只用于交叉核对答案与结论，不作为题面来源）；答案：docs/refs/math3.json 逐字（解析册 PDF p4-5 文字层/裁片）。" }
    },
    {
      id: "m3-2020-19", origin: 'year', year: 2020, no: "三(19)", type: "proof", star: 4,
      school: "全国硕士研究生招生考试-数学三 2020 年", tags: ["mvt01", "mvt05", "tp02"],
      stem: "设函数 $f(x)$ 在区间 $[0,2]$ 上具有连续导数，$f(0)=f(2)=0$，$M=\\max\\limits_{x\\in[0,2]}|f(x)|$. 证明：(Ⅰ) 存在 $\\xi\\in(0,2)$，使 $|f'(\\xi)|\\ge M$.(Ⅱ) 若对任意 $x\\in(0,2)$，$|f'(x)|\\le M$，则 $M=0$.",
      answer: "$\\text{见证明}$",
      src: { file: "参考文件/真题/数学/6、【1987-2025年】考研数学三真题答案及解析/2020年数学三真题答案解析.pdf", page: 5, no: "三(19)", note: "题面：真题册（合并册）PDF p11 裁片逐字亲读（2020_p11_full110.png sha256 4e8d283243a0…，命令见 backup/scratch/bank-m3/crops.json）；单源：题面仅真题册裁片（解析册文字层碎裂/不可用，只用于交叉核对答案与结论，不作为题面来源）；答案：docs/refs/math3.json 逐字（解析册 PDF p5 文字层/裁片）。" }
    },
    {
      id: "m3-2020-20", origin: 'year', year: 2020, no: "三(20)", type: "eigen", star: 4,
      school: "全国硕士研究生招生考试-数学三 2020 年", tags: ["la15", "la16", "la04"],
      stem: "设二次型 $f(x_1,x_2)=x_1^2-4x_1x_2+4x_2^2$ 经过正交变换 $\\begin{pmatrix}x_1\\\\x_2\\end{pmatrix}=Q\\begin{pmatrix}y_1\\\\y_2\\end{pmatrix}$ 化为二次型 $g(y_1,y_2)=ay_1^2+4y_1y_2+by_2^2$，其中 $a\\ge b$.(Ⅰ) 求 $a$，$b$ 的值.(Ⅱ) 求正交矩阵 $Q$.",
      answer: "$a=4,b=1;\\ Q=\\begin{pmatrix}0&1\\\\-1&0\\end{pmatrix}$",
      src: { file: "参考文件/真题/数学/6、【1987-2025年】考研数学三真题答案及解析/2020年数学三真题答案解析.pdf", page: 5, no: "三(20)", note: "题面：真题册（合并册）PDF p11 裁片逐字亲读（2020_p11_full110.png sha256 4e8d283243a0…，命令见 backup/scratch/bank-m3/crops.json）；单源：题面仅真题册裁片（解析册文字层碎裂/不可用，只用于交叉核对答案与结论，不作为题面来源）；答案：docs/refs/math3.json 逐字（解析册 PDF p5 文字层/裁片）。" }
    },
    {
      id: "m3-2020-21", origin: 'year', year: 2020, no: "三(21)", type: "linalg", star: 4,
      school: "全国硕士研究生招生考试-数学三 2020 年", tags: ["la13", "la04", "la14"],
      stem: "设 $A$ 为 2 阶矩阵，$P=(\\alpha,A\\alpha)$，其中 $\\alpha$ 是非零向量且不是 $A$ 的特征向量.(Ⅰ) 证明 $P$ 为可逆矩阵.(Ⅱ) 若 $A^2\\alpha+A\\alpha-6\\alpha=0$，求 $P^{-1}AP$，并判断 $A$ 是否相似于对角矩阵.",
      answer: "$P^{-1}AP=\\begin{pmatrix}0&6\\\\1&-1\\end{pmatrix};\\ A\\ \\text{可对角化}$",
      src: { file: "参考文件/真题/数学/6、【1987-2025年】考研数学三真题答案及解析/2020年数学三真题答案解析.pdf", page: 6, no: "三(21)", note: "题面：真题册（合并册）PDF p11 裁片逐字亲读（2020_p11_full110.png sha256 4e8d283243a0…，命令见 backup/scratch/bank-m3/crops.json）；单源：题面仅真题册裁片（解析册文字层碎裂/不可用，只用于交叉核对答案与结论，不作为题面来源）；答案：docs/refs/math3.json 逐字（解析册 PDF p6 文字层/裁片）。" }
    },
    {
      id: "m3-2020-22", origin: 'year', year: 2020, no: "三(22)", type: "estimate", star: 4,
      school: "全国硕士研究生招生考试-数学三 2020 年", tags: ["zt04", "dbi01", "int23"],
      stem: "设二维随机变量 $(X,Y)$ 在区域 $D=\\{(x,y)\\mid0<y<\\sqrt{1-x^2}\\}$ 上服从均匀分布，令 $Z_1=\\begin{cases}1,&X-Y>0\\\\0,&X-Y\\le0\\end{cases}$，$Z_2=\\begin{cases}1,&X+Y>0\\\\0,&X+Y\\le0\\end{cases}$.(Ⅰ) 求二维随机变量 $(Z_1,Z_2)$ 的概率分布.(Ⅱ) 求 $Z_1$ 与 $Z_2$ 的相关系数.",
      answer: "$P(0,0)=\\dfrac14,P(0,1)=\\dfrac12,P(1,0)=0,P(1,1)=\\dfrac14;\\ \\rho=\\dfrac13$",
      src: { file: "参考文件/真题/数学/6、【1987-2025年】考研数学三真题答案及解析/2020年数学三真题答案解析.pdf", page: "6-7", no: "三(22)", note: "题面：真题册（合并册）PDF p11 裁片逐字亲读（2020_p11_full110.png sha256 4e8d283243a0…，命令见 backup/scratch/bank-m3/crops.json）；单源：题面仅真题册裁片（解析册文字层碎裂/不可用，只用于交叉核对答案与结论，不作为题面来源）；答案：docs/refs/math3.json 逐字（解析册 PDF p6-7 文字层/裁片）。" }
    },
    {
      id: "m3-2020-23", origin: 'year', year: 2020, no: "三(23)", type: "estimate", star: 4,
      school: "全国硕士研究生招生考试-数学三 2020 年", tags: ["zt05", "int25", "tp05"],
      stem: "设某种元件的使用寿命 $T$ 的分布函数为 $F(t)=\\begin{cases}1-\\mathrm{e}^{-(t/\\theta)^m},&t\\ge0\\\\0,&其他.\\end{cases}$ 其中 $\\theta$，$m$ 为参数且均大于零.(Ⅰ) 求概率 $P\\{T>t\\}$ 与 $P\\{T>s+t\\mid T>s\\}$，其中 $s>0$，$t>0$.(Ⅱ) 任取 $n$ 个这种元件做寿命试验，测得它们的寿命分别为 $t_1$，$t_2$，$\\cdots$，$t_n$，若 $m$ 已知，求 $\\theta$ 的最大似然估计值 $\\hat\\theta$.",
      answer: "$P\\{T>t\\}=\\mathrm e^{-(t/\\theta)^m};\\ P\\{T>s+t\\mid T>s\\}=\\mathrm e^{-((s+t)/\\theta)^m+(s/\\theta)^m};\\ \\hat\\theta=\\sqrt[m]{\\frac1n\\sum t_i^m}$",
      src: { file: "参考文件/真题/数学/6、【1987-2025年】考研数学三真题答案及解析/2020年数学三真题答案解析.pdf", page: 7, no: "三(23)", note: "题面：真题册（合并册）PDF p12 裁片逐字亲读（2020_p12_full110.png sha256 30f89fd5a808…，命令见 backup/scratch/bank-m3/crops.json）；单源：题面仅真题册裁片（解析册文字层碎裂/不可用，只用于交叉核对答案与结论，不作为题面来源）；答案：docs/refs/math3.json 逐字（解析册 PDF p7 文字层/裁片）。" }
    },
    {
      id: "m3-2020-10", origin: 'year', year: 2020, no: "二(10)", type: "multivar", star: 3,
      school: "全国硕士研究生招生考试-数学三 2020 年", tags: ["multi01", "wr01", "ext27"],
      stem: "曲线 $x+y+\\mathrm{e}^{2xy}=0$ 在 $(0,-1)$ 处的切线方程为______.",
      answer: "$y=x-1$",
      src: { file: "参考文件/真题/数学/6、【1987-2025年】考研数学三真题答案及解析/2020年数学三真题答案解析.pdf", page: 2, no: "二(10)", note: "题面：真题册（合并册）PDF p11 裁片逐字亲读（2020_p11_full110.png sha256 4e8d283243a0…，命令见 backup/scratch/bank-m3/crops.json）；单源：题面仅真题册裁片（解析册文字层碎裂/不可用，只用于交叉核对答案与结论，不作为题面来源）；答案：docs/refs/math3.json 逐字（解析册 PDF p2 文字层/裁片）。" }
    },
    {
      id: "m3-2020-11", origin: 'year', year: 2020, no: "二(11)", type: "econ", star: 4,
      school: "全国硕士研究生招生考试-数学三 2020 年", tags: ["ext08", "kn11", "gx28"],
      stem: "设某厂家某产品的产量为 $Q$，成本 $C(Q)=100+13Q$，设产品的单价为 $P$，需求量 $Q(P)=\\dfrac{800}{P+3}-2$，则该厂家获得最大利润时的产量为______.",
      answer: "8",
      src: { file: "参考文件/真题/数学/6、【1987-2025年】考研数学三真题答案及解析/2020年数学三真题答案解析.pdf", page: 3, no: "二(11)", note: "题面：真题册（合并册）PDF p11 裁片逐字亲读（2020_p11_full110.png sha256 4e8d283243a0…，命令见 backup/scratch/bank-m3/crops.json）；单源：题面仅真题册裁片（解析册文字层碎裂/不可用，只用于交叉核对答案与结论，不作为题面来源）；答案：docs/refs/math3.json 逐字（解析册 PDF p3 文字层/裁片）。" }
    },
    {
      id: "m3-2020-12", origin: 'year', year: 2020, no: "二(12)", type: "integral", star: 4,
      school: "全国硕士研究生招生考试-数学三 2020 年", tags: ["int23", "int29", "tp02"],
      stem: "设平面区域 $D=\\left\\{(x,y)\\left|\\dfrac x2\\le y\\le\\dfrac{1}{1+x^2},0\\le x\\le1\\right.\\right\\}$，则 $D$ 绕 $y$ 轴旋转所成的旋转体的体积为______.",
      answer: "$\\pi\\ln 2-\\dfrac{\\pi}{3}$",
      src: { file: "参考文件/真题/数学/6、【1987-2025年】考研数学三真题答案及解析/2020年数学三真题答案解析.pdf", page: 3, no: "二(12)", note: "题面：真题册（合并册）PDF p11 裁片逐字亲读（2020_p11_full110.png sha256 4e8d283243a0…，命令见 backup/scratch/bank-m3/crops.json）；单源：题面仅真题册裁片（解析册文字层碎裂/不可用，只用于交叉核对答案与结论，不作为题面来源）；答案：docs/refs/math3.json 逐字（解析册 PDF p3 文字层/裁片）。" }
    },
    {
      id: "m3-2020-13", origin: 'year', year: 2020, no: "二(13)", type: "linalg", star: 4,
      school: "全国硕士研究生招生考试-数学三 2020 年", tags: ["la02", "la05", "tp09"],
      stem: "行列式 $\\begin{vmatrix}a&0&-1&1\\\\0&a&1&-1\\\\-1&1&a&0\\\\1&-1&0&a\\end{vmatrix}=$______.",
      answer: "$a^2(a^2-4)$",
      src: { file: "参考文件/真题/数学/6、【1987-2025年】考研数学三真题答案及解析/2020年数学三真题答案解析.pdf", page: 3, no: "二(13)", note: "题面：真题册（合并册）PDF p11 裁片逐字亲读（2020_p11_full110.png sha256 4e8d283243a0…，命令见 backup/scratch/bank-m3/crops.json）；单源：题面仅真题册裁片（解析册文字层碎裂/不可用，只用于交叉核对答案与结论，不作为题面来源）；答案：docs/refs/math3.json 逐字（解析册 PDF p3 文字层/裁片）。" }
    },
    {
      id: "m3-2020-14", origin: 'year', year: 2020, no: "二(14)", type: "estimate", star: 4,
      school: "全国硕士研究生招生考试-数学三 2020 年", tags: ["zt04", "int23", "tp02"],
      stem: "设随机变量 $X$ 的概率分布为 $P\\{X=k\\}=\\dfrac{1}{2^k},k=1,2,3,\\cdots$，$Y$ 表示 $X$ 被 3 除的余数，则 $E(Y)=$______.",
      answer: "$\\dfrac{8}{7}$",
      src: { file: "参考文件/真题/数学/6、【1987-2025年】考研数学三真题答案及解析/2020年数学三真题答案解析.pdf", page: 3, no: "二(14)", note: "题面：真题册（合并册）PDF p11 裁片逐字亲读（2020_p11_full110.png sha256 4e8d283243a0…，命令见 backup/scratch/bank-m3/crops.json）；单源：题面仅真题册裁片（解析册文字层碎裂/不可用，只用于交叉核对答案与结论，不作为题面来源）；答案：docs/refs/math3.json 逐字（解析册 PDF p3 文字层/裁片）。" }
    },
    {
      id: "m3-2020-9", origin: 'year', year: 2020, no: "二(9)", type: "multivar", star: 3,
      school: "全国硕士研究生招生考试-数学三 2020 年", tags: ["multi01", "wr01", "zt04"],
      stem: "设 $z=\\arctan[xy+\\sin(x+y)]$，则 $\\mathrm{d}z\\big|_{(0,\\pi)}=$______.",
      answer: "$(\\pi-1)\\mathrm dx-\\mathrm dy$",
      src: { file: "参考文件/真题/数学/6、【1987-2025年】考研数学三真题答案及解析/2020年数学三真题答案解析.pdf", page: 2, no: "二(9)", note: "题面：真题册（合并册）PDF p11 裁片逐字亲读（2020_p11_full110.png sha256 4e8d283243a0…，命令见 backup/scratch/bank-m3/crops.json）；单源：题面仅真题册裁片（解析册文字层碎裂/不可用，只用于交叉核对答案与结论，不作为题面来源）；答案：docs/refs/math3.json 逐字（解析册 PDF p2 文字层/裁片）。" }
    },
    {
      id: "m3-2021-1", origin: 'year', year: 2021, no: "一(1)", type: "limit", star: 3,
      school: "全国硕士研究生招生考试-数学三 2021 年", tags: ["lim01", "tay01", "int25"],
      stem: "当 $x\\to0$ 时，$\\int_0^{x^2}(e^{t^3}-1)\\,\\mathrm{d}t$ 是 $x^7$ 的（ ）",
      options: ["低阶无穷小", "等价无穷小", "高阶无穷小", "同阶但非等价无穷小"],
      answer: "选 C。",
      src: { file: "参考文件/真题/数学/6、【1987-2025年】考研数学三真题答案及解析/2021年数学三真题答案解析.pdf", page: 1, no: "一(1)", note: "题面：真题册（合并册）PDF p6 裁片逐字亲读（2021_p6_full110.png sha256 0290a5a1f95e…，命令见 backup/scratch/bank-m3/crops.json）；单源：题面仅真题册裁片（解析册文字层碎裂/不可用，只用于交叉核对答案与结论，不作为题面来源）；字母答案：docs/refs/math3.json（t35 亲读回填）。" }
    },
    {
      id: "m3-2021-10", origin: 'year', year: 2021, no: "一(10)", type: "estimate", star: 4,
      school: "全国硕士研究生招生考试-数学三 2021 年", tags: ["zt05", "int23", "tp05"],
      stem: "设总体 $X$ 的概率分布为 $P\\{X=1\\}=\\dfrac{1-\\theta}{2}$，$P\\{X=2\\}=P\\{X=3\\}=\\dfrac{1+\\theta}{4}$，利用来自总体的样本值 $1,3,2,2,1,3,1,2$ 可得 $\\theta$ 的最大似然估计值为（ ）",
      options: ["1/4", "3/8", "1/2", "5/8"],
      answer: "选 A。",
      src: { file: "参考文件/真题/数学/6、【1987-2025年】考研数学三真题答案及解析/2021年数学三真题答案解析.pdf", page: 4, no: "一(10)", note: "题面：真题册（合并册）PDF p7 裁片逐字亲读（2021_p7_full110.png sha256 bc7d5a975c95…，命令见 backup/scratch/bank-m3/crops.json）；单源：题面仅真题册裁片（解析册文字层碎裂/不可用，只用于交叉核对答案与结论，不作为题面来源）；字母答案：docs/refs/math3.json（t35 亲读回填）。" }
    },
    {
      id: "m3-2021-2", origin: 'year', year: 2021, no: "一(2)", type: "deriv", star: 3,
      school: "全国硕士研究生招生考试-数学三 2021 年", tags: ["ext06", "ext05", "gx22"],
      stem: "函数 $f(x)=\\begin{cases}\\dfrac{e^x-1}{x},&x\\ne0\\\\1,&x=0\\end{cases}$，在 $x=0$ 处（ ）",
      options: ["连续且取极大值", "连续且取极小值", "可导且导数为零", "可导且导数不为零"],
      answer: "选 D。",
      src: { file: "参考文件/真题/数学/6、【1987-2025年】考研数学三真题答案及解析/2021年数学三真题答案解析.pdf", page: 1, no: "一(2)", note: "题面：真题册（合并册）PDF p6 裁片逐字亲读（2021_p6_full110.png sha256 0290a5a1f95e…，命令见 backup/scratch/bank-m3/crops.json）；单源：题面仅真题册裁片（解析册文字层碎裂/不可用，只用于交叉核对答案与结论，不作为题面来源）；字母答案：docs/refs/math3.json（t35 亲读回填）。" }
    },
    {
      id: "m3-2021-3", origin: 'year', year: 2021, no: "一(3)", type: "deriv", star: 4,
      school: "全国硕士研究生招生考试-数学三 2021 年", tags: ["ext06", "gx21", "mvt05"],
      stem: "设函数 $f(x)=ax-b\\ln x\\ (a>0)$ 有两个零点，则 $\\dfrac ba$ 的取值范围是（ ）",
      options: ["(e,+∞)", "(0,e)", "(0,1/e)", "(1/e,+∞)"],
      answer: "选 A。",
      src: { file: "参考文件/真题/数学/6、【1987-2025年】考研数学三真题答案及解析/2021年数学三真题答案解析.pdf", page: 1, no: "一(3)", note: "题面：真题册（合并册）PDF p6 裁片逐字亲读（2021_p6_full110.png sha256 0290a5a1f95e…，命令见 backup/scratch/bank-m3/crops.json）；单源：题面仅真题册裁片（解析册文字层碎裂/不可用，只用于交叉核对答案与结论，不作为题面来源）；字母答案：docs/refs/math3.json（t35 亲读回填）。" }
    },
    {
      id: "m3-2021-4", origin: 'year', year: 2021, no: "一(4)", type: "multivar", star: 4,
      school: "全国硕士研究生招生考试-数学三 2021 年", tags: ["multi01", "wr01", "ext27"],
      stem: "设函数 $f(x,y)$ 可微，且 $f(x+1,e^x)=x(x+1)^2$，$f(x,x^2)=2x^2\\ln x$，则 $\\mathrm{d}f(1,1)=$（ ）",
      options: ["dx+dy", "dx−dy", "dy", "−dy"],
      answer: "选 C。",
      src: { file: "参考文件/真题/数学/6、【1987-2025年】考研数学三真题答案及解析/2021年数学三真题答案解析.pdf", page: 1, no: "一(4)", note: "题面：真题册（合并册）PDF p6 裁片逐字亲读（2021_p6_full110.png sha256 0290a5a1f95e…，命令见 backup/scratch/bank-m3/crops.json）；单源：题面仅真题册裁片（解析册文字层碎裂/不可用，只用于交叉核对答案与结论，不作为题面来源）；字母答案：docs/refs/math3.json（t35 亲读回填）。" }
    },
    {
      id: "m3-2021-5", origin: 'year', year: 2021, no: "一(5)", type: "eigen", star: 3,
      school: "全国硕士研究生招生考试-数学三 2021 年", tags: ["la15", "la16", "tp09"],
      stem: "二次型 $f(x_1,x_2,x_3)=(x_1+x_2)^2+(x_2+x_3)^2-(x_3-x_1)^2$ 的正惯性指数与负惯性指数依次为（ ）",
      options: ["2,0", "1,1", "2,1", "1,2"],
      answer: "选 B。",
      src: { file: "参考文件/真题/数学/6、【1987-2025年】考研数学三真题答案及解析/2021年数学三真题答案解析.pdf", page: 2, no: "一(5)", note: "题面：真题册（合并册）PDF p6 裁片逐字亲读（2021_p6_full110.png sha256 0290a5a1f95e…，命令见 backup/scratch/bank-m3/crops.json）；单源：题面仅真题册裁片（解析册文字层碎裂/不可用，只用于交叉核对答案与结论，不作为题面来源）；字母答案：docs/refs/math3.json（t35 亲读回填）。" }
    },
    {
      id: "m3-2021-6", origin: 'year', year: 2021, no: "一(6)", type: "linalg", star: 4,
      school: "全国硕士研究生招生考试-数学三 2021 年", tags: ["zb01", "la05", "la17"],
      stem: "设 $A=(\\alpha_1,\\alpha_2,\\alpha_3,\\alpha_4)$ 为 4 阶正交矩阵，$B=\\begin{pmatrix}\\alpha_1^{\\mathrm T}\\\\\\alpha_2^{\\mathrm T}\\\\\\alpha_3^{\\mathrm T}\\end{pmatrix}$，$\\beta=\\begin{pmatrix}1\\\\1\\\\1\\end{pmatrix}$，$k$ 表示任意常数，则线性方程组 $Bx=\\beta$ 的通解 $x=$（ ）",
      options: ["α₂+α₃+α₄+kα₁", "α₁+α₃+α₄+kα₂", "α₁+α₂+α₄+kα₃", "α₁+α₂+α₃+kα₄"],
      answer: "选 D。",
      src: { file: "参考文件/真题/数学/6、【1987-2025年】考研数学三真题答案及解析/2021年数学三真题答案解析.pdf", page: 2, no: "一(6)", note: "题面：真题册（合并册）PDF p6 裁片逐字亲读（2021_p6_full110.png sha256 0290a5a1f95e…，命令见 backup/scratch/bank-m3/crops.json）；单源：题面仅真题册裁片（解析册文字层碎裂/不可用，只用于交叉核对答案与结论，不作为题面来源）；字母答案：docs/refs/math3.json（t35 亲读回填）。" }
    },
    {
      id: "m3-2021-7", origin: 'year', year: 2021, no: "一(7)", type: "linalg", star: 4,
      school: "全国硕士研究生招生考试-数学三 2021 年", tags: ["la02", "la05", "la04"],
      stem: "已知矩阵 $A=\\begin{pmatrix}1&0&-1\\\\2&-1&1\\\\-1&2&-5\\end{pmatrix}$，若存在下三角可逆矩阵 $P$ 和上三角可逆矩阵 $Q$，使 $PAQ$ 为对角矩阵，则 $P,Q$ 可以分别取（ ）",
      options: ["P=单位阵, Q=[[1,0,1],[0,1,3],[0,0,1]]", "P=[[1,0,0],[2,−1,0],[−3,2,1]], Q=单位阵", "P=[[1,0,0],[2,−1,0],[−3,2,1]], Q=[[1,0,1],[0,1,3],[0,0,1]]", "P=单位阵, Q=[[1,2,−3],[0,−1,2],[0,0,1]]"],
      answer: "选 C。",
      src: { file: "参考文件/真题/数学/6、【1987-2025年】考研数学三真题答案及解析/2021年数学三真题答案解析.pdf", page: 3, no: "一(7)", note: "题面：真题册（合并册）PDF p7 裁片逐字亲读（2021_p7_full110.png sha256 bc7d5a975c95…，命令见 backup/scratch/bank-m3/crops.json）；单源：题面仅真题册裁片（解析册文字层碎裂/不可用，只用于交叉核对答案与结论，不作为题面来源）；字母答案：docs/refs/math3.json（t35 亲读回填）。" }
    },
    {
      id: "m3-2021-8", origin: 'year', year: 2021, no: "一(8)", type: "estimate", star: 4,
      school: "全国硕士研究生招生考试-数学三 2021 年", tags: ["zt04", "tp02", "int23"],
      stem: "设 $A,B$ 为随机事件，且 $0<P(B)<1$，下列命题中为假命题的是（ ）",
      options: ["若 P(A|B)=P(A)，则 P(A|B̄)=P(A)", "若 P(A|B)>P(A)，则 P(A|B̄)>... ", "若 P(A|B)>P(A|B̄)，则 P(A|B)>P(A)", "若 P(A|A∪B)>P(Ā|A∪B)，则 P(A)>P(B)"],
      answer: "选 D。",
      src: { file: "参考文件/真题/数学/6、【1987-2025年】考研数学三真题答案及解析/2021年数学三真题答案解析.pdf", page: 3, no: "一(8)", note: "题面：真题册（合并册）PDF p7 裁片逐字亲读（2021_p7_full110.png sha256 bc7d5a975c95…，命令见 backup/scratch/bank-m3/crops.json）；单源：题面仅真题册裁片（解析册文字层碎裂/不可用，只用于交叉核对答案与结论，不作为题面来源）；字母答案：docs/refs/math3.json（t35 亲读回填）。" }
    },
    {
      id: "m3-2021-9", origin: 'year', year: 2021, no: "一(9)", type: "estimate", star: 4,
      school: "全国硕士研究生招生考试-数学三 2021 年", tags: ["zt05", "int23", "tp05"],
      stem: "设 $(X_1,Y_1),(X_2,Y_2),\\cdots,(X_n,Y_n)$ 为来自总体 $N(\\mu_1,\\mu_2;\\sigma_1^2,\\sigma_2^2;\\rho)$ 的简单随机样本，令 $\\theta=\\mu_1-\\mu_2$，$\\overline X=\\dfrac1n\\sum\\limits_{i=1}^{n}X_i$，$\\overline Y=\\dfrac1n\\sum\\limits_{i=1}^{n}Y_i$，$\\hat\\theta=\\overline X-\\overline Y$，则（ ）",
      options: ["E(θ̂)=θ, D=(σ₁²+σ₂²)/n", "E(θ̂)=θ, D=(σ₁²+σ₂²−2ρσ₁σ₂)/n", "E(θ̂)≠θ, D=(σ₁²+σ₂²)/n", "E(θ̂)≠θ, D=(σ₁²+σ₂²−2ρσ₁σ₂)/n"],
      answer: "选 B。",
      src: { file: "参考文件/真题/数学/6、【1987-2025年】考研数学三真题答案及解析/2021年数学三真题答案解析.pdf", page: 4, no: "一(9)", note: "题面：真题册（合并册）PDF p7 裁片逐字亲读（2021_p7_full110.png sha256 bc7d5a975c95…，命令见 backup/scratch/bank-m3/crops.json）；单源：题面仅真题册裁片（解析册文字层碎裂/不可用，只用于交叉核对答案与结论，不作为题面来源）；字母答案：docs/refs/math3.json（t35 亲读回填）。" }
    },
    {
      id: "m3-2021-17", origin: 'year', year: 2021, no: "三(17)", type: "limit", star: 4,
      school: "全国硕士研究生招生考试-数学三 2021 年", tags: ["lim01", "ext02", "lim03"],
      stem: "已知 $\\lim\\limits_{x\\to0}\\left[a\\arctan\\dfrac1x+(1+|x|)^{\\frac1x}\\right]$ 存在，求 $a$ 的值.",
      answer: "$\\alpha=\\dfrac1\\pi\\Big(\\dfrac1{\\mathrm e}-\\mathrm e\\Big)$",
      src: { file: "参考文件/真题/数学/6、【1987-2025年】考研数学三真题答案及解析/2021年数学三真题答案解析.pdf", page: 5, no: "三(17)", note: "题面：真题册（合并册）PDF p8 裁片逐字亲读（2021_p8_full110.png sha256 bd4f8957e2d1…，命令见 backup/scratch/bank-m3/crops.json）；单源：题面仅真题册裁片（解析册文字层碎裂/不可用，只用于交叉核对答案与结论，不作为题面来源）；答案：docs/refs/math3.json 逐字（解析册 PDF p5 文字层/裁片）。" }
    },
    {
      id: "m3-2021-18", origin: 'year', year: 2021, no: "三(18)", type: "multivar", star: 4,
      school: "全国硕士研究生招生考试-数学三 2021 年", tags: ["multi02", "multi03", "ext06"],
      stem: "求函数 $f(x,y)=2\\ln|x|+\\dfrac{(x-1)^2+y^2}{2x^2}$ 的极值.",
      answer: "$(-1,0)\\ \\text{极小值}\\ 2;\\ \\left(\\dfrac12,0\\right)\\ \\text{极小值}\\ \\dfrac12-2\\ln2$",
      src: { file: "参考文件/真题/数学/6、【1987-2025年】考研数学三真题答案及解析/2021年数学三真题答案解析.pdf", page: 6, no: "三(18)", note: "题面：真题册（合并册）PDF p8 裁片逐字亲读（2021_p8_full110.png sha256 bd4f8957e2d1…，命令见 backup/scratch/bank-m3/crops.json）；单源：题面仅真题册裁片（解析册文字层碎裂/不可用，只用于交叉核对答案与结论，不作为题面来源）；答案：docs/refs/math3.json 逐字（解析册 PDF p6 文字层/裁片）。" }
    },
    {
      id: "m3-2021-19", origin: 'year', year: 2021, no: "三(19)", type: "dblint", star: 4,
      school: "全国硕士研究生招生考试-数学三 2021 年", tags: ["dbi01", "dbi02", "tp02"],
      stem: "设有界区域 $D$ 是圆 $x^2+y^2=1$ 和直线 $y=x$ 以及 $x$ 轴在第一象限围成的部分，计算二重积分 $\\iint\\limits_{D}e^{(x+y)^2}(x^2-y^2)\\,\\mathrm dx\\mathrm dy$.",
      answer: "$\\dfrac18\\mathrm e^2-\\dfrac14\\mathrm e+\\dfrac18$",
      src: { file: "参考文件/真题/数学/6、【1987-2025年】考研数学三真题答案及解析/2021年数学三真题答案解析.pdf", page: 6, no: "三(19)", note: "题面：真题册（合并册）PDF p8 裁片逐字亲读（2021_p8_full110.png sha256 bd4f8957e2d1…，命令见 backup/scratch/bank-m3/crops.json）；单源：题面仅真题册裁片（解析册文字层碎裂/不可用，只用于交叉核对答案与结论，不作为题面来源）；答案：docs/refs/math3.json 逐字（解析册 PDF p6 文字层/裁片）。" }
    },
    {
      id: "m3-2021-20", origin: 'year', year: 2021, no: "三(20)", type: "ode", star: 4,
      school: "全国硕士研究生招生考试-数学三 2021 年", tags: ["ode02", "ser02", "ser04"],
      stem: "设 $n$ 为正整数，$y=y_n(x)$ 是微分方程 $xy'-(n+1)y=0$ 的满足条件 $y_n(1)=\\dfrac{1}{n(n+1)}$ 的解.(Ⅰ) 求 $y_n(x)$；(Ⅱ) 求级数 $\\sum\\limits_{n=1}^{\\infty}y_n(x)$ 的收敛域及和函数.",
      answer: "$y_n(x)=\\dfrac{x^{n+1}}{n(n+1)};\\ [-1,1];\\ S(x)=(1-x)\\ln(1-x)+x\\ (x\\in[-1,1)),\\ S(1)=1$",
      src: { file: "参考文件/真题/数学/6、【1987-2025年】考研数学三真题答案及解析/2021年数学三真题答案解析.pdf", page: 7, no: "三(20)", note: "题面：真题册（合并册）PDF p9 裁片逐字亲读（2021_p9_full110.png sha256 61caa444b843…，命令见 backup/scratch/bank-m3/crops.json）；单源：题面仅真题册裁片（解析册文字层碎裂/不可用，只用于交叉核对答案与结论，不作为题面来源）；答案：docs/refs/math3.json 逐字（解析册 PDF p7 文字层/裁片）。" }
    },
    {
      id: "m3-2021-21", origin: 'year', year: 2021, no: "三(21)", type: "eigen", star: 4,
      school: "全国硕士研究生招生考试-数学三 2021 年", tags: ["la13", "la14", "la04"],
      stem: "设矩阵 $A=\\begin{pmatrix}2&1&0\\\\1&2&0\\\\1&a&b\\end{pmatrix}$ 仅有两个不同的特征值，若 $A$ 相似于对角矩阵，求 $a,b$ 的值，并求可逆矩阵 $P$，使 $P^{-1}AP$ 为对角矩阵.",
      answer: "$(a,b)=(-1,3)\\ \\text{或}\\ (1,1);\\ P\\ \\text{与}\\ P^{-1}AP$",
      src: { file: "参考文件/真题/数学/6、【1987-2025年】考研数学三真题答案及解析/2021年数学三真题答案解析.pdf", page: 7, no: "三(21)", note: "题面：真题册（合并册）PDF p9 裁片逐字亲读（2021_p9_full110.png sha256 61caa444b843…，命令见 backup/scratch/bank-m3/crops.json）；单源：题面仅真题册裁片（解析册文字层碎裂/不可用，只用于交叉核对答案与结论，不作为题面来源）；答案：docs/refs/math3.json 逐字（解析册 PDF p7 文字层/裁片）。" }
    },
    {
      id: "m3-2021-22", origin: 'year', year: 2021, no: "三(22)", type: "estimate", star: 4,
      school: "全国硕士研究生招生考试-数学三 2021 年", tags: ["zt04", "int25", "tp02"],
      stem: "在区间 $(0,2)$ 上随机取一点，将该区间分成两段，较短一段的长度记为 $X$，较长一段的长度记为 $Y$，令 $Z=\\dfrac YX$.(Ⅰ) 求 $X$ 的概率密度；(Ⅱ) 求 $Z$ 的概率密度；(Ⅲ) 求 $E\\left(\\dfrac XY\\right)$.",
      answer: "$f_X(x)=1\\ (0<x<1);\\ f_Z(z)=\\dfrac{2}{(z+1)^2}\\ (z\\ge1);\\ E\\left(\\dfrac XY\\right)=-1+2\\ln2$",
      src: { file: "参考文件/真题/数学/6、【1987-2025年】考研数学三真题答案及解析/2021年数学三真题答案解析.pdf", page: 8, no: "三(22)", note: "题面：真题册（合并册）PDF p9 裁片逐字亲读（2021_p9_full110.png sha256 61caa444b843…，命令见 backup/scratch/bank-m3/crops.json）；单源：题面仅真题册裁片（解析册文字层碎裂/不可用，只用于交叉核对答案与结论，不作为题面来源）；答案：docs/refs/math3.json 逐字（解析册 PDF p8 文字层/裁片）。" }
    },
    {
      id: "m3-2021-11", origin: 'year', year: 2021, no: "二(11)", type: "deriv", star: 3,
      school: "全国硕士研究生招生考试-数学三 2021 年", tags: ["d01", "dr01", "ext05"],
      stem: "若 $y=\\cos e^{-\\sqrt x}$，则 $\\dfrac{\\mathrm dy}{\\mathrm dx}\\Big|_{x=1}=$______.",
      answer: "$\\dfrac{\\sin\\frac1{\\mathrm e}}{2\\mathrm e}$",
      src: { file: "参考文件/真题/数学/6、【1987-2025年】考研数学三真题答案及解析/2021年数学三真题答案解析.pdf", page: 4, no: "二(11)", note: "题面：真题册（合并册）PDF p7 裁片逐字亲读（2021_p7_full110.png sha256 bc7d5a975c95…，命令见 backup/scratch/bank-m3/crops.json）；单源：题面仅真题册裁片（解析册文字层碎裂/不可用，只用于交叉核对答案与结论，不作为题面来源）；答案：docs/refs/math3.json 逐字（解析册 PDF p4 文字层/裁片）。" }
    },
    {
      id: "m3-2021-12", origin: 'year', year: 2021, no: "二(12)", type: "integral", star: 3,
      school: "全国硕士研究生招生考试-数学三 2021 年", tags: ["int29", "int24", "tp02"],
      stem: "$\\int_{\\sqrt5}^{5}\\dfrac{x}{\\sqrt{|x^2-9|}}\\,\\mathrm dx=$______.",
      answer: "6",
      src: { file: "参考文件/真题/数学/6、【1987-2025年】考研数学三真题答案及解析/2021年数学三真题答案解析.pdf", page: 4, no: "二(12)", note: "题面：真题册（合并册）PDF p7 裁片逐字亲读（2021_p7_full110.png sha256 bc7d5a975c95…，命令见 backup/scratch/bank-m3/crops.json）；单源：题面仅真题册裁片（解析册文字层碎裂/不可用，只用于交叉核对答案与结论，不作为题面来源）；答案：docs/refs/math3.json 逐字（解析册 PDF p4 文字层/裁片）。" }
    },
    {
      id: "m3-2021-13", origin: 'year', year: 2021, no: "二(13)", type: "integral", star: 3,
      school: "全国硕士研究生招生考试-数学三 2021 年", tags: ["int23", "wr02", "tp02"],
      stem: "设平面区域 $D$ 由曲线 $y=\\sqrt x\\sin\\pi x\\ (0\\le x\\le1)$ 与 $x$ 轴围成，则 $D$ 绕 $x$ 轴旋转所成的旋转体的体积为______.",
      answer: "$\\dfrac{\\pi}{4}$",
      src: { file: "参考文件/真题/数学/6、【1987-2025年】考研数学三真题答案及解析/2021年数学三真题答案解析.pdf", page: 4, no: "二(13)", note: "题面：真题册（合并册）PDF p7 裁片逐字亲读（2021_p7_full110.png sha256 bc7d5a975c95…，命令见 backup/scratch/bank-m3/crops.json）；单源：题面仅真题册裁片（解析册文字层碎裂/不可用，只用于交叉核对答案与结论，不作为题面来源）；答案：docs/refs/math3.json 逐字（解析册 PDF p4 文字层/裁片）。" }
    },
    {
      id: "m3-2021-14", origin: 'year', year: 2021, no: "二(14)", type: "ode", star: 3,
      school: "全国硕士研究生招生考试-数学三 2021 年", tags: ["ode07", "ode01", "ext05"],
      stem: "差分方程 $\\Delta y_t=t$ 的通解为 $y_t=$______.",
      answer: "$y_t=\\dfrac12t^2-\\dfrac12t+C$",
      src: { file: "参考文件/真题/数学/6、【1987-2025年】考研数学三真题答案及解析/2021年数学三真题答案解析.pdf", page: 5, no: "二(14)", note: "题面：真题册（合并册）PDF p7 裁片逐字亲读（2021_p7_full110.png sha256 bc7d5a975c95…，命令见 backup/scratch/bank-m3/crops.json）；单源：题面仅真题册裁片（解析册文字层碎裂/不可用，只用于交叉核对答案与结论，不作为题面来源）；答案：docs/refs/math3.json 逐字（解析册 PDF p5 文字层/裁片）。" }
    },
    {
      id: "m3-2021-15", origin: 'year', year: 2021, no: "二(15)", type: "linalg", star: 4,
      school: "全国硕士研究生招生考试-数学三 2021 年", tags: ["la02", "la05", "tp09"],
      stem: "多项式 $f(x)=\\begin{vmatrix}x&x&1&2x\\\\1&x&2&-1\\\\2&1&x&1\\\\2&-1&1&x\\end{vmatrix}$ 中 $x^3$ 项的系数为______.",
      answer: "-5",
      src: { file: "参考文件/真题/数学/6、【1987-2025年】考研数学三真题答案及解析/2021年数学三真题答案解析.pdf", page: 5, no: "二(15)", note: "题面：真题册（合并册）PDF p7 裁片逐字亲读（2021_p7_full110.png sha256 bc7d5a975c95…，命令见 backup/scratch/bank-m3/crops.json）；单源：题面仅真题册裁片（解析册文字层碎裂/不可用，只用于交叉核对答案与结论，不作为题面来源）；答案：docs/refs/math3.json 逐字（解析册 PDF p5 文字层/裁片）。" }
    },
    {
      id: "m3-2021-16", origin: 'year', year: 2021, no: "二(16)", type: "estimate", star: 4,
      school: "全国硕士研究生招生考试-数学三 2021 年", tags: ["zt04", "int23", "tp02"],
      stem: "甲、乙两个盒子中各装有 2 个红球和 2 个白球，先从甲盒中任取一球，观察颜色后放入乙盒中，再从乙盒中任取一个球，令 $X,Y$ 分别表示从甲盒和乙盒中取到的红球个数，则 $X$ 与 $Y$ 的相关系数为______.",
      answer: "$\\dfrac15$",
      src: { file: "参考文件/真题/数学/6、【1987-2025年】考研数学三真题答案及解析/2021年数学三真题答案解析.pdf", page: 5, no: "二(16)", note: "题面：真题册（合并册）PDF p8 裁片逐字亲读（2021_p8_full110.png sha256 bd4f8957e2d1…，命令见 backup/scratch/bank-m3/crops.json）；单源：题面仅真题册裁片（解析册文字层碎裂/不可用，只用于交叉核对答案与结论，不作为题面来源）；答案：docs/refs/math3.json 逐字（解析册 PDF p5 文字层/裁片）。" }
    },
    {
      id: "m3-2022-1", origin: 'year', year: 2022, no: "一(1)", type: "limit", star: 4,
      school: "全国硕士研究生招生考试-数学三 2022 年", tags: ["lim01", "lim02", "ext02"],
      stem: "若当 $x\\to0$ 时，$\\alpha(x),\\beta(x)$ 是非零无穷小量，则以下的命题中，① 若 $\\alpha(x)\\sim\\beta(x)$，则 $\\alpha^2(x)\\sim\\beta^2(x)$；② 若 $\\alpha^2(x)\\sim\\beta^2(x)$，则 $\\alpha(x)\\sim\\beta(x)$；③ 若 $\\alpha(x)\\sim\\beta(x)$，则 $\\alpha(x)-\\beta(x)=o(\\alpha(x))$；④ 若 $\\alpha(x)-\\beta(x)=o(\\alpha(x))$，则 $\\alpha(x)\\sim\\beta(x)$，真命题的序号为（ ）",
      options: ["①③", "①④", "①③④", "②③④"],
      answer: "选 C。",
      src: { file: "参考文件/真题/数学/6、【1987-2025年】考研数学三真题答案及解析/2022年数学三真题答案解析.pdf", page: 1, no: "一(1)", note: "题面：真题册（合并册）PDF p2 裁片逐字亲读（2022_p2_full110.png sha256 eb98b5a259bf…，命令见 backup/scratch/bank-m3/crops.json）；单源：题面仅真题册裁片（解析册文字层碎裂/不可用，只用于交叉核对答案与结论，不作为题面来源）；字母答案：docs/refs/math3.json（t35 亲读回填）。" }
    },
    {
      id: "m3-2022-10", origin: 'year', year: 2022, no: "一(10)", type: "estimate", star: 4,
      school: "全国硕士研究生招生考试-数学三 2022 年", tags: ["zt04", "int23", "tp02"],
      stem: "设二维随机变量 $(X,Y)$ 的概率分布为 $X$ 取 $-1,1$，$Y$ 取 $0,1,2$，其中 $P\\{X=-1,Y=0\\}=0.1$，$P\\{X=-1,Y=1\\}=0.1$，$P\\{X=-1,Y=2\\}=b$，$P\\{X=1,Y=0\\}=a$，$P\\{X=1,Y=1\\}=0.1$，$P\\{X=1,Y=2\\}=0.1$，若事件 $\\{\\max\\{X,Y\\}=2\\}$ 与事件 $\\{\\min\\{X,Y\\}=1\\}$ 相互独立，则 $\\mathrm{Cov}(X,Y)=$（ ）",
      options: ["−0.6", "−0.36", "0", "0.48"],
      answer: "选 B。",
      src: { file: "参考文件/真题/数学/6、【1987-2025年】考研数学三真题答案及解析/2022年数学三真题答案解析.pdf", page: 13, no: "一(10)", note: "题面：真题册（合并册）PDF p3 裁片逐字亲读（2022_p3_full110.png sha256 9f5098ba5287…，命令见 backup/scratch/bank-m3/crops.json）；单源：题面仅真题册裁片（解析册文字层碎裂/不可用，只用于交叉核对答案与结论，不作为题面来源）；字母答案：docs/refs/math3.json（t35 亲读回填）。" }
    },
    {
      id: "m3-2022-2", origin: 'year', year: 2022, no: "一(2)", type: "limit", star: 4,
      school: "全国硕士研究生招生考试-数学三 2022 年", tags: ["lim02", "ext02", "lim01"],
      stem: "已知 $a_n=\\sqrt[n]{n}-\\dfrac{(-1)^n}{n}\\ (n=1,2,\\cdots)$，则 $\\{a_n\\}$（ ）",
      options: ["有最大值，有最小值", "有最大值，没有最小值", "没有最大值，有最小值", "没有最大值，没有最小值"],
      answer: "选 A。",
      src: { file: "参考文件/真题/数学/6、【1987-2025年】考研数学三真题答案及解析/2022年数学三真题答案解析.pdf", page: 2, no: "一(2)", note: "题面：真题册（合并册）PDF p2 裁片逐字亲读（2022_p2_full110.png sha256 eb98b5a259bf…，命令见 backup/scratch/bank-m3/crops.json）；单源：题面仅真题册裁片（解析册文字层碎裂/不可用，只用于交叉核对答案与结论，不作为题面来源）；字母答案：docs/refs/math3.json（t35 亲读回填）。" }
    },
    {
      id: "m3-2022-3", origin: 'year', year: 2022, no: "一(3)", type: "multivar", star: 4,
      school: "全国硕士研究生招生考试-数学三 2022 年", tags: ["multi01", "wr01", "int29"],
      stem: "已知 $f(t)$ 连续，令 $F(x,y)=\\int_0^{x-y}(x-y-t)f(t)\\,\\mathrm dt$，则（ ）",
      options: ["∂F/∂x=∂F/∂y, ∂²F/∂x²=∂²F/∂y²", "∂F/∂x=∂F/∂y, ∂²F/∂x²=−∂²F/∂y²", "∂F/∂x=−∂F/∂y, ∂²F/∂x²=∂²F/∂y²", "∂F/∂x=−∂F/∂y, ∂²F/∂x²=−∂²F/∂y²"],
      answer: "选 C。",
      src: { file: "参考文件/真题/数学/6、【1987-2025年】考研数学三真题答案及解析/2022年数学三真题答案解析.pdf", page: 4, no: "一(3)", note: "题面：真题册（合并册）PDF p2 裁片逐字亲读（2022_p2_full110.png sha256 eb98b5a259bf…，命令见 backup/scratch/bank-m3/crops.json）；单源：题面仅真题册裁片（解析册文字层碎裂/不可用，只用于交叉核对答案与结论，不作为题面来源）；字母答案：docs/refs/math3.json（t35 亲读回填）。" }
    },
    {
      id: "m3-2022-4", origin: 'year', year: 2022, no: "一(4)", type: "integral", star: 4,
      school: "全国硕士研究生招生考试-数学三 2022 年", tags: ["int23", "tp02", "int01"],
      stem: "若 $I_1=\\int_0^1\\dfrac{x}{2(1+\\cos x)}\\,\\mathrm dx$，$I_2=\\int_0^1\\dfrac{\\ln(1+x)}{1+\\cos x}\\,\\mathrm dx$，$I_3=\\int_0^1\\dfrac{2x}{1+\\sin x}\\,\\mathrm dx$，则（ ）",
      options: ["I₁<I₂<I₃", "I₂<I₁<I₃", "I₁<I₃<I₂", "I₃<I₂<I₁"],
      answer: "选 A。",
      src: { file: "参考文件/真题/数学/6、【1987-2025年】考研数学三真题答案及解析/2022年数学三真题答案解析.pdf", page: 5, no: "一(4)", note: "题面：真题册（合并册）PDF p2 裁片逐字亲读（2022_p2_full110.png sha256 eb98b5a259bf…，命令见 backup/scratch/bank-m3/crops.json）；单源：题面仅真题册裁片（解析册文字层碎裂/不可用，只用于交叉核对答案与结论，不作为题面来源）；字母答案：docs/refs/math3.json（t35 亲读回填）。" }
    },
    {
      id: "m3-2022-5", origin: 'year', year: 2022, no: "一(5)", type: "eigen", star: 4,
      school: "全国硕士研究生招生考试-数学三 2022 年", tags: ["la13", "la04", "la08"],
      stem: "设 $A$ 为 3 阶矩阵，$A=\\begin{pmatrix}1&0&0\\\\0&-1&0\\\\0&0&0\\end{pmatrix}$，则 $A$ 的特征值为 $1,-1,0$ 的充分必要条件是（ ）",
      options: ["存在可逆矩阵 P,Q，使得 A=PAQ", "存在可逆矩阵 P，使得 A=PAP⁻¹", "存在正交矩阵 Q，使得 A=QAQ⁻¹", "存在可逆矩阵 P，使得 A=PAPᵀ"],
      answer: "选 B。",
      src: { file: "参考文件/真题/数学/6、【1987-2025年】考研数学三真题答案及解析/2022年数学三真题答案解析.pdf", page: 5, no: "一(5)", note: "题面：真题册（合并册）PDF p2 裁片逐字亲读（2022_p2_full110.png sha256 eb98b5a259bf…，命令见 backup/scratch/bank-m3/crops.json）；单源：题面仅真题册裁片（解析册文字层碎裂/不可用，只用于交叉核对答案与结论，不作为题面来源）；字母答案：docs/refs/math3.json（t35 亲读回填）。" }
    },
    {
      id: "m3-2022-6", origin: 'year', year: 2022, no: "一(6)", type: "linalg", star: 4,
      school: "全国硕士研究生招生考试-数学三 2022 年", tags: ["la05", "la02", "zb01"],
      stem: "设矩阵 $A=\\begin{pmatrix}1&1&1\\\\1&a&a^2\\\\1&b&b^2\\end{pmatrix}$，$b=\\begin{pmatrix}1\\\\2\\\\4\\end{pmatrix}$，则线性方程组 $Ax=b$ 的解的情况为（ ）",
      options: ["无解", "有解", "有无穷多解或无解", "有唯一解或无解"],
      answer: "选 D。",
      src: { file: "参考文件/真题/数学/6、【1987-2025年】考研数学三真题答案及解析/2022年数学三真题答案解析.pdf", page: 8, no: "一(6)", note: "题面：真题册（合并册）PDF p2 裁片逐字亲读（2022_p2_full110.png sha256 eb98b5a259bf…，命令见 backup/scratch/bank-m3/crops.json）；单源：题面仅真题册裁片（解析册文字层碎裂/不可用，只用于交叉核对答案与结论，不作为题面来源）；字母答案：docs/refs/math3.json（t35 亲读回填）。" }
    },
    {
      id: "m3-2022-7", origin: 'year', year: 2022, no: "一(7)", type: "linalg", star: 4,
      school: "全国硕士研究生招生考试-数学三 2022 年", tags: ["la05", "la02", "la06"],
      stem: "设 $\\alpha_1=(\\lambda,1,1)^{\\mathrm T}$，$\\alpha_2=(1,\\lambda,1)^{\\mathrm T}$，$\\alpha_3=(1,1,\\lambda)^{\\mathrm T}$，$\\alpha_4=(1,\\lambda,\\lambda^2)^{\\mathrm T}$，若 $\\alpha_1,\\alpha_2,\\alpha_3$ 与 $\\alpha_1,\\alpha_2,\\alpha_4$ 等价，则 $\\lambda$ 的取值范围是（ ）",
      options: ["{0,1}", "{λ | λ∈R, λ≠−2}", "{λ | λ∈R, λ≠−1, λ≠−2}", "{λ | λ∈R, λ≠−1}"],
      answer: "选 C。",
      src: { file: "参考文件/真题/数学/6、【1987-2025年】考研数学三真题答案及解析/2022年数学三真题答案解析.pdf", page: 9, no: "一(7)", note: "题面：真题册（合并册）PDF p3 裁片逐字亲读（2022_p3_full110.png sha256 9f5098ba5287…，命令见 backup/scratch/bank-m3/crops.json）；单源：题面仅真题册裁片（解析册文字层碎裂/不可用，只用于交叉核对答案与结论，不作为题面来源）；字母答案：docs/refs/math3.json（t35 亲读回填）。" }
    },
    {
      id: "m3-2022-8", origin: 'year', year: 2022, no: "一(8)", type: "estimate", star: 3,
      school: "全国硕士研究生招生考试-数学三 2022 年", tags: ["zt04", "int23", "tp02"],
      stem: "设随机变量 $X\\sim N(0,4)$，随机变量 $Y\\sim B\\left(3,\\dfrac13\\right)$，且 $X,Y$ 不相关，则 $D(X-3Y+1)=$（ ）",
      options: ["2", "4", "6", "10"],
      answer: "选 D。",
      src: { file: "参考文件/真题/数学/6、【1987-2025年】考研数学三真题答案及解析/2022年数学三真题答案解析.pdf", page: 10, no: "一(8)", note: "题面：真题册（合并册）PDF p3 裁片逐字亲读（2022_p3_full110.png sha256 9f5098ba5287…，命令见 backup/scratch/bank-m3/crops.json）；单源：题面仅真题册裁片（解析册文字层碎裂/不可用，只用于交叉核对答案与结论，不作为题面来源）；字母答案：docs/refs/math3.json（t35 亲读回填）。" }
    },
    {
      id: "m3-2022-9", origin: 'year', year: 2022, no: "一(9)", type: "estimate", star: 4,
      school: "全国硕士研究生招生考试-数学三 2022 年", tags: ["zt05", "int25", "tp02"],
      stem: "设随机变量序列 $X_1,X_2,\\cdots,X_n,\\cdots$ 独立同分布，且 $X_1$ 的概率密度为 $f(x)=\\begin{cases}1-|x|,&|x|<1\\\\0,&\\text{其他}\\end{cases}$，则当 $n\\to\\infty$ 时，$\\dfrac1n\\sum\\limits_{i=1}^{n}X_i^2$ 依概率收敛于（ ）",
      options: ["1/8", "1/6", "1/3", "1/2"],
      answer: "选 B。",
      src: { file: "参考文件/真题/数学/6、【1987-2025年】考研数学三真题答案及解析/2022年数学三真题答案解析.pdf", page: 11, no: "一(9)", note: "题面：真题册（合并册）PDF p3 裁片逐字亲读（2022_p3_full110.png sha256 9f5098ba5287…，命令见 backup/scratch/bank-m3/crops.json）；单源：题面仅真题册裁片（解析册文字层碎裂/不可用，只用于交叉核对答案与结论，不作为题面来源）；字母答案：docs/refs/math3.json（t35 亲读回填）。" }
    },
    {
      id: "m3-2022-17", origin: 'year', year: 2022, no: "三(17)", type: "ode", star: 4,
      school: "全国硕士研究生招生考试-数学三 2022 年", tags: ["ode01", "lim04", "ext06"],
      stem: "设函数 $y(x)$ 是微分方程 $y'+\\dfrac{1}{2\\sqrt x}y=2+\\sqrt x$ 的满足条件 $y(1)=3$ 的解，求曲线 $y=y(x)$ 的渐近线.",
      answer: "$y=2x$",
      src: { file: "参考文件/真题/数学/6、【1987-2025年】考研数学三真题答案及解析/2022年数学三真题答案解析.pdf", page: 19, no: "三(17)", note: "题面：真题册（合并册）PDF p4 裁片逐字亲读（2022_p4_full110.png sha256 ae8fa6c659e0…，命令见 backup/scratch/bank-m3/crops.json）；单源：题面仅真题册裁片（解析册文字层碎裂/不可用，只用于交叉核对答案与结论，不作为题面来源）；答案：docs/refs/math3.json 逐字（解析册 PDF p19 文字层/裁片）。" }
    },
    {
      id: "m3-2022-18", origin: 'year', year: 2022, no: "三(18)", type: "econ", star: 4,
      school: "全国硕士研究生招生考试-数学三 2022 年", tags: ["ext27", "ext08", "kn10"],
      stem: "设某产品的产量 $Q$ 由资本投入量 $x$ 和劳动投入量 $y$ 决定，生产函数 $Q=12x^{\\frac12}y^{\\frac16}$，该产品的销售单价 $P$ 与产量 $Q$ 的关系为 $P=1160-1.5Q$.若单位资本投入和单位劳动投入的价格分别为 6 和 8，求利润最大时的产量.",
      answer: "$Q=384$",
      src: { file: "参考文件/真题/数学/6、【1987-2025年】考研数学三真题答案及解析/2022年数学三真题答案解析.pdf", page: 20, no: "三(18)", note: "题面：真题册（合并册）PDF p4 裁片逐字亲读（2022_p4_full110.png sha256 ae8fa6c659e0…，命令见 backup/scratch/bank-m3/crops.json）；单源：题面仅真题册裁片（解析册文字层碎裂/不可用，只用于交叉核对答案与结论，不作为题面来源）；答案：docs/refs/math3.json 逐字（解析册 PDF p20 文字层/裁片）。" }
    },
    {
      id: "m3-2022-19", origin: 'year', year: 2022, no: "三(19)", type: "dblint", star: 4,
      school: "全国硕士研究生招生考试-数学三 2022 年", tags: ["dbi03", "dbi02", "tp02"],
      stem: "已知平面区域 $D=\\{(x,y)\\mid y-2\\le x\\le\\sqrt{4-y^2},0\\le y\\le2\\}$，计算 $I=\\iint\\limits_{D}\\dfrac{(x-y)^2}{x^2+y^2}\\,\\mathrm dx\\mathrm dy$.",
      answer: "$2\\pi-2$",
      src: { file: "参考文件/真题/数学/6、【1987-2025年】考研数学三真题答案及解析/2022年数学三真题答案解析.pdf", page: 21, no: "三(19)", note: "题面：真题册（合并册）PDF p4 裁片逐字亲读（2022_p4_full110.png sha256 ae8fa6c659e0…，命令见 backup/scratch/bank-m3/crops.json）；单源：题面仅真题册裁片（解析册文字层碎裂/不可用，只用于交叉核对答案与结论，不作为题面来源）；答案：docs/refs/math3.json 逐字（解析册 PDF p21 文字层/裁片）。" }
    },
    {
      id: "m3-2022-20", origin: 'year', year: 2022, no: "三(20)", type: "series", star: 4,
      school: "全国硕士研究生招生考试-数学三 2022 年", tags: ["ser02", "ser04", "ser01"],
      stem: "求幂级数 $\\sum\\limits_{n=0}^{\\infty}\\dfrac{(-4)^n+1}{4^n(2n+1)}x^{2n}$ 的收敛域及和函数 $S(x)$.",
      answer: "$[-1,1];\\ S(x)=\\dfrac{\\arctan x}{x}+\\dfrac1x\\ln\\dfrac{2+x}{2-x}\\ (x\\in[-1,0)\\cup(0,1]),\\ S(0)=2$",
      src: { file: "参考文件/真题/数学/6、【1987-2025年】考研数学三真题答案及解析/2022年数学三真题答案解析.pdf", page: 22, no: "三(20)", note: "题面：真题册（合并册）PDF p5 裁片逐字亲读（2022_p5_full110.png sha256 900e0eefbc36…，命令见 backup/scratch/bank-m3/crops.json）；单源：题面仅真题册裁片（解析册文字层碎裂/不可用，只用于交叉核对答案与结论，不作为题面来源）；答案：docs/refs/math3.json 逐字（解析册 PDF p22 文字层/裁片）。" }
    },
    {
      id: "m3-2022-21", origin: 'year', year: 2022, no: "三(21)", type: "eigen", star: 4,
      school: "全国硕士研究生招生考试-数学三 2022 年", tags: ["la15", "la16", "la12"],
      stem: "已知二次型 $f(x_1,x_2,x_3)=3x_1^2+4x_2^2+3x_3^2+2x_1x_3$.(Ⅰ) 求正交矩阵 $Q$，使正交变换 $x=Qy$ 将二次型 $f(x_1,x_2,x_3)$ 化为标准形；(Ⅱ) 证明 $\\min\\limits_{x\\ne0}\\dfrac{f(x)}{x^{\\mathrm T}x}=2$.",
      answer: "$Q=\\begin{pmatrix}1/\\sqrt2&0&-1/\\sqrt2\\\\0&1&0\\\\1/\\sqrt2&0&1/\\sqrt2\\end{pmatrix};\\ 4y_1^2+4y_2^2+2y_3^2;\\ \\min=2$",
      src: { file: "参考文件/真题/数学/6、【1987-2025年】考研数学三真题答案及解析/2022年数学三真题答案解析.pdf", page: 24, no: "三(21)", note: "题面：真题册（合并册）PDF p5 裁片逐字亲读（2022_p5_full110.png sha256 900e0eefbc36…，命令见 backup/scratch/bank-m3/crops.json）；单源：题面仅真题册裁片（解析册文字层碎裂/不可用，只用于交叉核对答案与结论，不作为题面来源）；答案：docs/refs/math3.json 逐字（解析册 PDF p24 文字层/裁片）。" }
    },
    {
      id: "m3-2022-22", origin: 'year', year: 2022, no: "三(22)", type: "estimate", star: 4,
      school: "全国硕士研究生招生考试-数学三 2022 年", tags: ["zt05", "int25", "tp05"],
      stem: "设 $X_1,X_2,\\cdots,X_n$ 为来自均值为 $\\theta$ 的指数分布总体的简单随机样本，$Y_1,Y_2,\\cdots,Y_m$ 为来自均值为 $2\\theta$ 的指数分布总体的简单随机样本，且两样本相互独立，其中 $\\theta(\\theta>0)$ 是未知参数.利用样本 $X_1,X_2,\\cdots,X_n,Y_1,Y_2,\\cdots,Y_m$，求 $\\theta$ 的最大似然估计量 $\\hat\\theta$，并求 $D(\\hat\\theta)$.",
      answer: "$\\hat\\theta=\\dfrac{2\\sum X_i+\\sum Y_j}{2(m+n)},\\ D(\\hat\\theta)=\\dfrac{\\theta^{2}}{m+n}$",
      src: { file: "参考文件/真题/数学/6、【1987-2025年】考研数学三真题答案及解析/2022年数学三真题答案解析.pdf", page: 25, no: "三(22)", note: "题面：真题册（合并册）PDF p5 裁片逐字亲读（2022_p5_full110.png sha256 900e0eefbc36…，命令见 backup/scratch/bank-m3/crops.json）；单源：题面仅真题册裁片（解析册文字层碎裂/不可用，只用于交叉核对答案与结论，不作为题面来源）；答案：docs/refs/math3.json 逐字（解析册 PDF p25 文字层/裁片）。" }
    },
    {
      id: "m3-2022-11", origin: 'year', year: 2022, no: "二(11)", type: "limit", star: 3,
      school: "全国硕士研究生招生考试-数学三 2022 年", tags: ["lim01", "lim03", "ext02"],
      stem: "$\\lim\\limits_{x\\to0}\\left(\\dfrac{1+e^x}{2}\\right)^{\\cot x}=$______.",
      answer: "$\\sqrt{\\mathrm e}$",
      src: { file: "参考文件/真题/数学/6、【1987-2025年】考研数学三真题答案及解析/2022年数学三真题答案解析.pdf", page: 14, no: "二(11)", note: "题面：真题册（合并册）PDF p3 裁片逐字亲读（2022_p3_full110.png sha256 9f5098ba5287…，命令见 backup/scratch/bank-m3/crops.json）；单源：题面仅真题册裁片（解析册文字层碎裂/不可用，只用于交叉核对答案与结论，不作为题面来源）；答案：docs/refs/math3.json 逐字（解析册 PDF p14 文字层/裁片）。" }
    },
    {
      id: "m3-2022-12", origin: 'year', year: 2022, no: "二(12)", type: "integral", star: 3,
      school: "全国硕士研究生招生考试-数学三 2022 年", tags: ["int24", "int23", "tp02"],
      stem: "$\\int_0^2\\dfrac{2x-4}{x^2+2x+4}\\,\\mathrm dx=$______.",
      answer: "$\\ln 3-\\dfrac{\\sqrt3}{3}\\pi$",
      src: { file: "参考文件/真题/数学/6、【1987-2025年】考研数学三真题答案及解析/2022年数学三真题答案解析.pdf", page: 14, no: "二(12)", note: "题面：真题册（合并册）PDF p3 裁片逐字亲读（2022_p3_full110.png sha256 9f5098ba5287…，命令见 backup/scratch/bank-m3/crops.json）；单源：题面仅真题册裁片（解析册文字层碎裂/不可用，只用于交叉核对答案与结论，不作为题面来源）；答案：docs/refs/math3.json 逐字（解析册 PDF p14 文字层/裁片）。" }
    },
    {
      id: "m3-2022-13", origin: 'year', year: 2022, no: "二(13)", type: "deriv", star: 3,
      school: "全国硕士研究生招生考试-数学三 2022 年", tags: ["dr01", "d01", "ext05"],
      stem: "已知函数 $f(x)=e^{\\sin x}+e^{-\\sin x}$，则 $f'''(2\\pi)=$______.",
      answer: "0",
      src: { file: "参考文件/真题/数学/6、【1987-2025年】考研数学三真题答案及解析/2022年数学三真题答案解析.pdf", page: 16, no: "二(13)", note: "题面：真题册（合并册）PDF p3 裁片逐字亲读（2022_p3_full110.png sha256 9f5098ba5287…，命令见 backup/scratch/bank-m3/crops.json）；单源：题面仅真题册裁片（解析册文字层碎裂/不可用，只用于交叉核对答案与结论，不作为题面来源）；答案：docs/refs/math3.json 逐字（解析册 PDF p16 文字层/裁片）。" }
    },
    {
      id: "m3-2022-14", origin: 'year', year: 2022, no: "二(14)", type: "integral", star: 4,
      school: "全国硕士研究生招生考试-数学三 2022 年", tags: ["int25", "int23", "tp02"],
      stem: "已知函数 $f(x)=\\begin{cases}e^x,&0\\le x\\le1\\\\0,&\\text{其他}\\end{cases}$，则 $\\int_{-\\infty}^{+\\infty}\\mathrm dx\\int_{-\\infty}^{+\\infty}f(x)f(y-x)\\,\\mathrm dy=$______.",
      answer: "$\\mathrm e^{2}-2\\mathrm e+1$",
      src: { file: "参考文件/真题/数学/6、【1987-2025年】考研数学三真题答案及解析/2022年数学三真题答案解析.pdf", page: 17, no: "二(14)", note: "题面：真题册（合并册）PDF p3 裁片逐字亲读（2022_p3_full110.png sha256 9f5098ba5287…，命令见 backup/scratch/bank-m3/crops.json）；单源：题面仅真题册裁片（解析册文字层碎裂/不可用，只用于交叉核对答案与结论，不作为题面来源）；答案：docs/refs/math3.json 逐字（解析册 PDF p17 文字层/裁片）。" }
    },
    {
      id: "m3-2022-15", origin: 'year', year: 2022, no: "二(15)", type: "linalg", star: 4,
      school: "全国硕士研究生招生考试-数学三 2022 年", tags: ["la02", "la04", "la05"],
      stem: "设 $A$ 为 3 阶矩阵，交换 $A$ 的第 2 行和第 3 行，再将第 2 列的 $-1$ 倍加到第 1 列，得到矩阵 $\\begin{pmatrix}-2&1&-1\\\\1&-1&0\\\\-1&0&0\\end{pmatrix}$，则 $A^{-1}$ 的迹 $\\mathrm{tr}(A^{-1})=$______.",
      answer: "-1",
      src: { file: "参考文件/真题/数学/6、【1987-2025年】考研数学三真题答案及解析/2022年数学三真题答案解析.pdf", page: 18, no: "二(15)", note: "题面：真题册（合并册）PDF p3 裁片逐字亲读（2022_p3_full110.png sha256 9f5098ba5287…，命令见 backup/scratch/bank-m3/crops.json）；单源：题面仅真题册裁片（解析册文字层碎裂/不可用，只用于交叉核对答案与结论，不作为题面来源）；答案：docs/refs/math3.json 逐字（解析册 PDF p18 文字层/裁片）。" }
    },
    {
      id: "m3-2022-16", origin: 'year', year: 2022, no: "二(16)", type: "estimate", star: 4,
      school: "全国硕士研究生招生考试-数学三 2022 年", tags: ["zt04", "int23", "tp02"],
      stem: "设 $A,B,C$ 为随机事件，且 $A$ 与 $B$ 互不相容，$A$ 与 $C$ 互不相容，$B$ 与 $C$ 相互独立，$P(A)=P(B)=P(C)=\\dfrac13$，则 $P(B\\cup C\\mid A\\cup B\\cup C)=$______.",
      answer: "$\\dfrac58$",
      src: { file: "参考文件/真题/数学/6、【1987-2025年】考研数学三真题答案及解析/2022年数学三真题答案解析.pdf", page: 18, no: "二(16)", note: "题面：真题册（合并册）PDF p3 裁片逐字亲读（2022_p3_full110.png sha256 9f5098ba5287…，命令见 backup/scratch/bank-m3/crops.json）；单源：题面仅真题册裁片（解析册文字层碎裂/不可用，只用于交叉核对答案与结论，不作为题面来源）；答案：docs/refs/math3.json 逐字（解析册 PDF p18 文字层/裁片）。" }
    },
  // ==== END GENERATED year-questions (t53) ====



  ];

  window.BANK = window.BANK || {};
  window.BANK.math3 = {
    id: 'math3',
    name: '考研数学三',
    subjectId: 'math3',
    sourceNote: 'POC 24 题取自 2012/2013/2019/2023/2024/2025 年数学三真题（2012、2013、2019 依据 参考文件/真题/数学/6、【1987-2025年】考研数学三真题答案及解析/ 的逐年解析册，题干与答案可在来源中逐字定位，其中 2012、2013 解析册文字层完整可读，2019 年第 12 题由真题汇总与解析册双向印证）。2023/2024/2025 的 9 道选择题为 2026-02 补充：这三年的真题册与解析册均为扫描件（PDF 无文本层），每题的 src.note 给出可核查证据链 —— 题面 = 真题册对应页 + 参考文件/_extract/ 内同名 PP-OCRv4 抽取文本的逐题行号，答案 = 解析册（2025 年为参考解析册）对应页 + 抽取文本行号 + 我本人用 read_image 读的 PyMuPDF 200 dpi 裁片（backup/scratch/bank-fix2/src-img/）；2025 年第 3 题另有存档网络答案图 backup/scratch/bank-vision/web/xdf2025_2.png 作第三源；2024 年第 6 题题干因抽取文本矩阵符号碎裂，如实标注为单源。原 16 题中 2019 年第 6 题（题干实为 2013 年第 5 题、题源标注不实且内容重复）与第 13 题（矩阵元素在来源文字层中无法还原）已按内容准确性要求移除，核验记录见 backup/scratch/bank-audit/audit.md。2026-02 再按「逐字对源」要求订正 2023 年第 1 题（题干首词「已知函数」、选项 (C)(D) 作「均存在/均不存在」）与第 2 题题干（删去来源中不存在的「设」「则」），并补入 2025 年第 3 题（级数敛散性判别，新增题型键 series，三源一致），记录见 backup/scratch/bank-fix2/。2026-02 来源标注清理：删除遗留的不可核查视觉复核措辞，来源与证据一律改为上述可 stat 的路径与行号，校验脚本见 backup/scratch/bank-fix3/verify_citations.cjs。',
    types: TYPES,
    questions: DATA
  };
})();