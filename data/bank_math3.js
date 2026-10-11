/* Athena 题库 · 考研数学三（共 331 题 ＝ 手写 24（POC 首批：2012/2013/2019/2023/2024/2025 数学三真题） + 卡片派生 150（t49 追加） + 真题册入库 157（t53 追加，2010–2022，净增 157 ＝ 计划 161 − 4 条与库内手写题同题撞车））
 *
 * 数据形态（可扩展）：
 *   window.BANK.<subj> = { id, name, sourceNote, types[], questions[] }
 *   question = { id, year, no, type, tags[], star, stem, options?, answer, traps, hint, src }
 *
 * 与既有 data/*.js 一致的加载范式：本文件是普通脚本，靠 <script> 标签在 app.js 之前加载，
 * 挂在 window.BANK 命名空间下（与 window.SUBJECTS.<id> 并列，互不污染）。
 *
 * 关键约定：
 *   1) tags 只放「现有知识点的 id」（data/math3.js 中已有 id，共 397 个）——
 *      标签名与「自带五星难度」在运行时由题库模块从 window.SUBJECTS.math3 反查，
 *      本文件不复制、不改写知识点数据。
 *   2) type 必须是本文件 types[] 的 key；「题型频率（五星）」由题库模块按库内真题实际统计得出。
 *   3) stem 忠实于「真题答案解析册」文本层的可读内容；数学符号在源 PDF 文字层中残损，
 *      此处按题号与解析上下文复原为规范 LaTeX（复原依据见每题 src.note，不虚构条件与结论）。
 * t49 卡片派生题（origin: 'card'，id 形如 cv-m3-<卡片id>，见 BEGIN GENERATED 哨兵块）：
 *   由 data/math3.js 的 EXAMPLE（124 键 / 150 条）按已裁定映射生成，**不要手改**——改 data/math3.js 后
 *   重跑 `node backup/scratch/bank-cv2/build-bank-cv2.mjs --subject math3 --write` 即可复算；字段口径见 docs/DATA_SCHEMA.md。
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
      judge: "卡片章节 cat=multi（多元函数微分学，题干不含二重积分记号）：求偏导/全微分/极值，或判定可微性与连续-偏导关系。", sample: "multi03、multi01、multi02" },
  // ==== END GENERATED card-questions (t49) ====

  ];

  var DATA = [
    {
      id: 'm3-2012-1', year: 2012, no: '一(1)', type: 'deriv', star: 2,school: '全国硕士研究生入学统一考试-数学三 2012 年', 
      tags: ['ext06', 'lim01', 'gx01'],
      stem: '曲线 $y=\\dfrac{x^{2}+x}{x^{2}-1}$ 渐近线的条数为（ ）',
      options: ['0', '1', '2', '3'],
      answer: '选 C。两条渐近线：$x=1$ 为垂直渐近线（$x\\to1$ 时 $y\\to\\infty$）；$y=1$ 为水平渐近线（$x\\to\\infty$ 时 $y\\to1$）。因已有水平渐近线，同侧不存在斜渐近线，故共 2 条。',
      traps: '把 $x=-1$ 也算作渐近线——$x=-1$ 处分子分母同趋于 0 是可去间断点（约分后 $y=\\frac{x}{x-1}$），并非垂直渐近线；另外「有水平渐近线时同侧无斜渐近线」是常被忽略的排他关系。',
      hint: '先求垂直渐近线（看分母为零且分子不为零的点），再分别看 $x\\to\\pm\\infty$ 的极限判断水平/斜渐近线。',
      src: { file: '参考文件/真题/数学/6、【1987-2025年】考研数学三真题答案及解析/2012年数学三真题答案解析.pdf', page: 1, no: '一(1)', note: '题干与【答案】C 取自 `参考文件/真题/数学/6、【1987-2025年】考研数学三真题答案及解析/2012年数学三真题答案解析.pdf` 第 1 页（文字层可读）。' }
    },
    {
      id: 'm3-2012-2', year: 2012, no: '一(2)', type: 'deriv', star: 4,school: '全国硕士研究生入学统一考试-数学三 2012 年', 
      tags: ['dr01', 'dr02', 'dr07', 'ext01', 'd01'],
      stem: '设函数 $f(x)=(\\mathrm{e}^{x}-1)(\\mathrm{e}^{2x}-2)\\cdots(\\mathrm{e}^{nx}-n)$，其中 $n$ 为正整数，则 $f\'(0)=$（ ）',
      options: ['$(-1)^{n-1}(n-1)!$', '$(-1)^{n}(n-1)!$', '$(-1)^{n-1}n!$', '$(-1)^{n}n!$'],
      answer: '选 A，$f\'(0)=(-1)^{n-1}(n-1)!$。记第 $k$ 个因子 $u_k=\\mathrm{e}^{kx}-k$，由乘积求导法则 $f\'(x)=\\sum_{k=1}^{n}\\Big(\\prod_{j\\ne k}u_j(x)\\Big)u_k\'(x)$；在 $x=0$ 处 $u_j(0)=\\mathrm{e}^{0}-j=1-j$，其中 $u_1(0)=0$，故除 $k=1$ 以外的每一项都含零因子 $u_1(0)$，全部为 0，只剩 $k=1$ 的一项：\n$$f\'(0)=\\Big(\\prod_{j=2}^{n}u_j(0)\\Big)u_1\'(0)=\\prod_{j=2}^{n}(1-j)\\cdot1=(-1)^{n-1}(n-1)!\\,.$$\n（数值验证：$n=2$ 时 $f\'(0)=-1$，$n=3$ 时为 $2$，$n=4$ 时为 $-6$，均与选项 A 一致。）',
      traps: '忘记 $u_1(0)=0$ 让除 $k=1$ 之外的全部项归零（只需保留 $k=1$ 那一项，其余不必逐项计算）；把 $\\prod_{j=2}^{n}(1-j)$ 的符号数错（共 $n-1$ 个负因子，故 $(-1)^{n-1}$）；把阶乘写成 $n!$（应为 $(n-1)!$）。注意来源解析册该题【答案】栏印作 C，但其自身展开的首项已是 $\\prod_{j=2}^{n}(1-j)$，按乘积求导法则应选 A。',
      hint: '乘积在一点的导数，只在「零因子位置」存活：先找出哪个因子在 $x=0$ 为 0（是 $u_1$），再算该项 = 该因子的导数 × 其余因子在 $x=0$ 的取值。',
      src: { file: '参考文件/真题/数学/6、【1987-2025年】考研数学三真题答案及解析/2012年数学三真题答案解析.pdf', page: 1, no: '一(2)', note: '题干与四选项取自 `参考文件/真题/数学/6、【1987-2025年】考研数学三真题答案及解析/2012年数学三真题答案解析.pdf` 第 1 页（文字层可读）；答案按乘积求导法则与复步长数值复核确定为 A（来源【答案】栏疑误）。' }
    },
    {
      id: 'm3-2012-16', year: 2012, no: '三(16)', type: 'dblint', star: 2,school: '全国硕士研究生入学统一考试-数学三 2012 年', 
      tags: ['dbi01', 'dbi02', 'int02', 'tp08'],
      stem: '计算二重积分 $\\displaystyle\\iint_D \\mathrm{e}^{x}xy\\,\\mathrm{d}x\\mathrm{d}y$，其中 $D$ 是以曲线 $y=\\sqrt{x}$、$y=\\dfrac{1}{\\sqrt{x}}$ 及 $y$ 轴为边界的无界区域。',
      answer: '区域写作 $D=\\{(x,y)\\mid 0<x\\le 1,\\ \\sqrt{x}\\le y\\le 1/\\sqrt{x}\\}$（两条曲线交于 $(1,1)$，$y$ 轴即 $x=0$；$x\\to0^{+}$ 时 $y=1/\\sqrt{x}\\to+\\infty$，故 $D$ 无界）。化为先 $y$ 后 $x$ 的累次积分：\n$$\\iint_D\\mathrm{e}^{x}xy\\,\\mathrm{d}x\\mathrm{d}y=\\int_0^1\\mathrm{e}^{x}x\\Big[\\frac{y^2}{2}\\Big]_{\\sqrt{x}}^{1/\\sqrt{x}}\\mathrm{d}x=\\frac12\\int_0^1\\mathrm{e}^{x}x\\Big(\\frac1x-x\\Big)\\mathrm{d}x=\\frac12\\int_0^1\\mathrm{e}^{x}(1-x^2)\\,\\mathrm{d}x.$$\n而 $\\int_0^1\\mathrm{e}^{x}\\mathrm{d}x=\\mathrm{e}-1$、$\\int_0^1x^2\\mathrm{e}^{x}\\mathrm{d}x=\\big[x^2\\mathrm{e}^x-2x\\mathrm{e}^x+2\\mathrm{e}^x\\big]_0^1=\\mathrm{e}-2$，故原式 $=\\dfrac12\\big[(\\mathrm{e}-1)-(\\mathrm{e}-2)\\big]=\\dfrac12$。',
      traps: '被积函数漏掉因子 $x$（是 $\\mathrm{e}^{x}xy$，不是 $\\mathrm{e}^{x}y$）；忘记 $D$ 的无界性（$x=0$ 是边界，$x\\to0^{+}$ 时上边界 $1/\\sqrt{x}$ 发散），把积分限写成有界区域的形状；$\\int_0^1x^2\\mathrm{e}^{x}\\mathrm{d}x$ 的分部积分算错（结果 $\\mathrm{e}-2$）。',
      hint: '先画 $D$：两曲线交于 $(1,1)$，在 $(0,1)$ 上 $\\sqrt{x}<1/\\sqrt{x}$，故按 X 型区域从 $\\sqrt{x}$ 积到 $1/\\sqrt{x}$；对 $y$ 积完后再用分部积分处理 $\\int x^2\\mathrm{e}^{x}\\mathrm{d}x$。',
      src: { file: '参考文件/真题/数学/6、【1987-2025年】考研数学三真题答案及解析/2012年数学三真题答案解析.pdf', page: 6, no: '三(16)', note: '题干取自 `参考文件/真题/数学/6、【1987-2025年】考研数学三真题答案及解析/2012年数学三真题答案解析.pdf` 第 6-7 页（并见 `参考文件/_extract/真题__数学__5、【1987-2025年】考研数学三真题__3、2010-2022考研数学三真题.txt` 第 916 行）；被积函数与定限按解析原文复原。' }
    },
    {
      id: 'm3-2012-17', year: 2012, no: '三(17)', type: 'econ', star: 3,school: '全国硕士研究生入学统一考试-数学三 2012 年', 
      tags: ['ext21', 'ext08', 'multi04', 'gx22', 'kn11'],
      stem: '某企业为生产甲、乙两种型号的产品，投入的固定成本为 10000（万元）。设该企业生产甲、乙两种产品的产量分别为 $x$（件）与 $y$（件），且两种产品的边际成本分别为 $\\dfrac{x}{2}+20$（万元/件）与 $y+6$（万元/件）。\n1）求生产甲、乙两种产品的总成本函数 $C(x,y)$（万元）；\n2）当总产量为 50 件时，甲、乙两种的产量各为多少可以使总成本最小？求最小成本；\n3）求总产量为 50 件且总成本最小时甲产品的边际成本，并解释其经济意义。',
      answer: '1）由 $\\partial C/\\partial x=x/2+20$ 对 $x$ 积分得 $C(x,y)=\\frac{x^2}{4}+20x+D(y)$；再由 $\\partial C/\\partial y=D\'(y)=y+6$ 积分得 $D(y)=\\frac{y^2}{2}+6y+c$，结合 $C(0,0)=10000$ 得 $c=10000$，故 $C(x,y)=\\frac{x^2}{4}+20x+\\frac{y^2}{2}+6y+10000$。\n2）令 $y=50-x$（$0\\le x\\le50$）代入得 $C(x)=\\frac{x^2}{4}+20x+\\frac{(50-x)^2}{2}+6(50-x)+10000$，求导 $C\'(x)=\\frac{x}{2}+20-(50-x)-6=\\frac{3x}{2}-36=0$，得 $x=24$、$y=26$，最小成本 $C=\\frac{576}{4}+480+\\frac{676}{2}+156+10000=11118$（万元）。\n3）此时甲的边际成本 $C_x(24,26)=\\frac{24}{2}+20=32$（万元/件）。经济意义：在总产量 50 件且成本最小的安排下，再多生产 1 件甲产品（相应少生产 1 件乙产品）会使总成本增加 32 万元/件。',
      traps: '把边际成本当作平均成本去乘产量；或在第 2）问忘了「总产量 50 件」是约束（$y=50-x$）而分别对 $x$、$y$ 求导；第 3）问的边际成本是偏导数 $\\partial C/\\partial x$ 在最优点的取值，不是平均成本。',
      hint: '第 1）问用「偏积分 + 初始条件」复原总成本；第 2）问把约束代入化为一元最优化；第 3）问先写 $\\partial C/\\partial x$ 再代点。',
      src: { file: '参考文件/真题/数学/6、【1987-2025年】考研数学三真题答案及解析/2012年数学三真题答案解析.pdf', page: 7, no: '三(17)', note: '题干原文完整可读（`参考文件/真题/数学/6、【1987-2025年】考研数学三真题答案及解析/2012年数学三真题答案解析.pdf` 第 7-8 页）；最小成本与边际成本按解析的积分结果复算。' }
    },
    {
      id: 'm3-2012-19', year: 2012, no: '三(19)', type: 'ode', star: 4,school: '全国硕士研究生入学统一考试-数学三 2012 年', 
      tags: ['ode01', 'ode02', 'ext20', 'mvt01'],
      stem: '已知函数 $f(x)$ 满足方程 $f\'\'(x)+f\'(x)-2f(x)=0$ 及 $f\'(x)+f(x)=2\\mathrm{e}^{x}$。\n1）求表达式 $f(x)$；\n2）求曲线 $y=f(x^{2})\\displaystyle\\int_0^{x}f(-t^{2})\\,\\mathrm{d}t$ 的拐点。',
      answer: '1）特征方程 $r^2+r-2=0$ 的根为 $r_1=1$、$r_2=-2$，故齐次方程通解 $f(x)=C_1\\mathrm{e}^{x}+C_2\\mathrm{e}^{-2x}$。代入 $f\'(x)+f(x)=2\\mathrm{e}^{x}$：$2C_1\\mathrm{e}^{x}-C_2\\mathrm{e}^{-2x}=2\\mathrm{e}^{x}$，比较系数得 $C_1=1$、$C_2=0$，故 $f(x)=\\mathrm{e}^{x}$。\n2）此时 $f(x^2)=\\mathrm{e}^{x^2}$、$f(-t^2)=\\mathrm{e}^{-t^2}$，曲线为 $y=\\mathrm{e}^{x^{2}}\\displaystyle\\int_0^{x}\\mathrm{e}^{-t^{2}}\\,\\mathrm{d}t$。由乘积求导与变限积分求导：\n$$y\'=\\mathrm{e}^{x^2}\\cdot\\mathrm{e}^{-x^2}+2x\\mathrm{e}^{x^{2}}\\int_0^{x}\\mathrm{e}^{-t^{2}}\\mathrm{d}t=1+2x\\mathrm{e}^{x^{2}}\\int_0^{x}\\mathrm{e}^{-t^{2}}\\mathrm{d}t,$$\n$$y\'\'=2\\mathrm{e}^{x^{2}}\\int_0^{x}\\mathrm{e}^{-t^{2}}\\mathrm{d}t+2x\\cdot2x\\mathrm{e}^{x^{2}}\\int_0^{x}\\mathrm{e}^{-t^{2}}\\mathrm{d}t+2x\\mathrm{e}^{x^{2}}\\mathrm{e}^{-x^{2}}=2x+2(1+2x^{2})\\mathrm{e}^{x^{2}}\\int_0^{x}\\mathrm{e}^{-t^{2}}\\mathrm{d}t.$$\n当 $x=0$ 时 $\\int_0^{0}\\mathrm{e}^{-t^{2}}\\mathrm{d}t=0$，故 $y\'\'(0)=0$；当 $x>0$ 时 $2x>0$ 且 $2(1+2x^{2})\\mathrm{e}^{x^{2}}\\int_0^{x}\\mathrm{e}^{-t^{2}}\\mathrm{d}t>0$，两项同号为正，$y\'\'>0$；当 $x<0$ 时两项同为负，$y\'\'<0$。即 $x=0$ 两侧 $y\'\'$ 变号，且 $x\\ne0$ 时 $y\'\'\\ne0$（两项同号不可能抵消），故曲线有唯一拐点 $x=0$，$y(0)=\\mathrm{e}^{0}\\times0=0$，即拐点 $(0,0)$。',
      traps: '第 1）问代入 $f\'+f=2\\mathrm{e}^{x}$ 定常数时漏掉 $C_2\\mathrm{e}^{-2x}$ 的负号；第 2）问把曲线看成两个函数的差（来源是乘积 $f(x^2)\\int_0^xf(-t^2)\\mathrm{d}t$），或漏掉乘积求导中的变限积分项；只由 $y\'\'(0)=0$ 就断言拐点（还须两侧变号）。',
      hint: '第 1 问「特征方程 → 通解 → 附加条件定常数」；第 2 问注意曲线是两个含 $x$ 的因子的**乘积**，求 $y\'\'$ 时既要对 $\\mathrm{e}^{x^2}$ 求导也要对积分上限求导，最后用「两项同号」判定变号点。',
      src: { file: '参考文件/真题/数学/6、【1987-2025年】考研数学三真题答案及解析/2012年数学三真题答案解析.pdf', page: 9, no: '三(19)', note: '题干与解析取自 `参考文件/真题/数学/6、【1987-2025年】考研数学三真题答案及解析/2012年数学三真题答案解析.pdf` 第 9 页（并见 `参考文件/_extract/真题__数学__5、【1987-2025年】考研数学三真题__3、2010-2022考研数学三真题.txt` 第 934 行）；被积函数在上限处的形式按解析复原。' }
    },
    {
      id: 'm3-2013-1', year: 2013, no: '一(1)', type: 'limit', star: 3,school: '全国硕士研究生入学统一考试-数学三 2013 年', 
      tags: ['inf01', 'inf02', 'inf05', 'lim01', 'zb13', 'kn08'],
      stem: '当 $x\\to0$ 时，用 $o(x)$ 表示比 $x$ 高阶的无穷小，则下列式子中错误的是（ ）',
      options: ['$x\\cdot o(x^{2})=o(x^{3})$', '$o(x)\\cdot o(x^{2})=o(x^{3})$', '$o(x^{2})+o(x^{2})=o(x^{2})$', '$o(x)+o(x^{2})=o(x^{2})$'],
      answer: '选 D。$o(x)+o(x^{2})=o(x)$（相加取**较低阶**那一项），故写成 $o(x^{2})$ 错误。A 项 $x\\cdot o(x^{2})=o(x^{3})$ 正确（因 $o(x^{2})$ 乘上 $x$ 后量级降一阶）；B 项 $o(x)\\cdot o(x^{2})=o(x^{3})$ 正确（无穷小相乘阶数相加）；C 项 $o(x^{2})+o(x^{2})=o(x^{2})$ 正确。',
      traps: '误以为 $o(x)+o(x^{2})$ 取**较高阶**（正确是取较低阶 $o(x)$）——记牢 $o(x^m)+o(x^n)=o(x^{\\min(m,n)})$ 而 $o(x^m)\\cdot o(x^n)=o(x^{m+n})$；把选项 (D) 记成 $o(x^{2})+o(x^{3})=o(x^{3})$ 这类同阶幂的加法（对加法而言它反而是错的写法）。',
      hint: '把 $o(x^k)$ 想成「量级比 $x^k$ 更小」：加法保留更小的指数（更粗的量级），乘法指数相加。',
      src: { file: '参考文件/真题/数学/6、【1987-2025年】考研数学三真题答案及解析/2013年数学三真题答案解析.pdf', page: 1, no: '一(1)', note: '题干与四选项取自 `参考文件/真题/数学/6、【1987-2025年】考研数学三真题答案及解析/2013年数学三真题答案解析.pdf` 第 1 页（选项 (D) 与【答案】D、【解析】$o(x)+o(x^{2})=o(x)$ 均可读），并见 `参考文件/_extract/真题__数学__5、【1987-2025年】考研数学三真题__3、2010-2022考研数学三真题.txt` 第 782-784 行。' }
    },
    {
      id: 'm3-2013-2', year: 2013, no: '一(2)', type: 'evalAns', star: 3,school: '全国硕士研究生入学统一考试-数学三 2013 年', 
      tags: ['lim01', 'lim17', 'lim16', 'lim04'],
      stem: '函数 $f(x)=\\dfrac{|x|^{x}-1}{x(x+1)\\ln|x|}$ 的可去间断点的个数为（ ）',
      options: ['0', '1', '2', '3'],
      answer: '选 C，2 个。间断点来自分母零点与对数无定义：$x=0$、$x=-1$（分母中的 $x$ 与 $x+1$）以及 $x=\\pm1$（$\\ln|x|=0$），即 $x=0,\\ \\pm1$。\n在 $x=0$ 处：$|x|^{x}-1=\\mathrm{e}^{x\\ln|x|}-1\\sim x\\ln|x|$，故 $f(x)\\to\\dfrac{x\\ln|x|}{x(x+1)\\ln|x|}=\\dfrac{1}{x+1}\\to1$，极限存在 → 可去间断点。\n在 $x=1$ 处：$|x|^{x}-1\\sim\\ln x$（$x\\to1$ 时 $\\ln x\\to0$），故 $f(x)\\to\\dfrac{\\ln x}{x(x+1)\\ln|x|}=\\dfrac{1}{x(x+1)}\\to\\dfrac12$，极限存在 → 可去间断点。\n在 $x=-1$ 处：同法 $|x|^{x}-1\\sim x\\ln|x|$（$x\\to-1$），$f(x)\\to\\dfrac{1}{x+1}\\to\\infty$，极限不存在 → 无穷间断点，不可去。\n故可去间断点共 2 个（$x=0$ 与 $x=1$）。',
      traps: '把分母记错（来源是 $x(x+1)\\ln|x|$，不是 $(x-1)\\ln|x|$），从而把 $x=1$ 与 $x=-1$ 的间断点类型搞反；忘记 $|x|^{x}$ 要写成 $\\mathrm{e}^{x\\ln|x|}$ 来求极限而直接当作 1；遗漏 $x=-1$（$x+1=0$ 与 $\\ln|x|=0$ 同时成立）这一间断点。',
      hint: '先把全部间断点找齐（分母为零、对数无定义），再对每个点用 $a^b=\\mathrm{e}^{b\\ln a}$ 与等价无穷小 $\\mathrm{e}^{u}-1\\sim u$ 化成可约形式求极限。',
      src: { file: '参考文件/真题/数学/6、【1987-2025年】考研数学三真题答案及解析/2013年数学三真题答案解析.pdf', page: 1, no: '一(2)', note: '题干与【答案】C 取自 `参考文件/真题/数学/6、【1987-2025年】考研数学三真题答案及解析/2013年数学三真题答案解析.pdf` 第 1 页（解析中的极限推导可读：$\\lim_{x\\to0}f=1$、$\\lim_{x\\to1}f=1/2$、$\\lim_{x\\to-1}f=\\infty$）。' }
    },
    {
      id: 'm3-2013-12', year: 2013, no: '二(12)', type: 'ode', star: 2,school: '全国硕士研究生入学统一考试-数学三 2013 年', 
      tags: ['ode03', 'gx47', 'ode01', 'ext20', 'wr02'],
      stem: '微分方程 $y\'\'-y\'+\\dfrac14 y=0$ 的通解为 $y=$ ______ 。',
      answer: '$y=\\mathrm{e}^{x/2}(C_1 x+C_2)$。特征方程 $\\lambda^2-\\lambda+\\frac14=0$，判别式 $1-1=0$，得二重根 $\\lambda=\\frac12$，故通解为 $y=\\mathrm{e}^{x/2}(C_1x+C_2)$。',
      traps: '判别式为零（重根）时忘记乘 $x$：写成 $y=C_1\\mathrm{e}^{x/2}+C_2\\mathrm{e}^{x/2}$（实为同一解，丢掉线性无关的另一解）；或把重根误判为两个不同根 $\\lambda=1/2,1/2$ 而漏乘 $x$。',
      hint: '先写特征方程 $\\lambda^2+p\\lambda+q=0$；$\\Delta>0$ 两不同实根、$\\Delta=0$ 重根（乘 $x$）、$\\Delta<0$ 共轭复根。',
      src: { file: '参考文件/真题/数学/6、【1987-2025年】考研数学三真题答案及解析/2013年数学三真题答案解析.pdf', page: 5, no: '二(12)', note: '题干与【答案】取自 `参考文件/真题/数学/6、【1987-2025年】考研数学三真题答案及解析/2013年数学三真题答案解析.pdf` 第 5 页。' }
    },
    {
      id: 'm3-2013-13', year: 2013, no: '二(13)', type: 'linalg', star: 3,school: '全国硕士研究生入学统一考试-数学三 2013 年', 
      tags: ['la02', 'la11', 'la10', 'ln03'],
      stem: '设 $A=(a_{ij})$ 是三阶非零矩阵，$|A|$ 为 $A$ 的行列式，$A_{ij}$ 为 $a_{ij}$ 的代数余子式。若 $a_{ij}+A_{ij}=0\\ (i,j=1,2,3)$，则 $|A|=$ ______ 。',
      answer: '$|A|=-1$。由 $a_{ij}+A_{ij}=0$ 得 $A^*=-A^{\\mathsf T}$，两边取行列式：$|A^*|=|-A^{\\mathsf T}|=(-1)^3|A|=-|A|$；又 $|A^*|=|A|^{3-1}=|A|^2$，故 $|A|^2=-|A|$，$|A|(|A|+1)=0$。$A$ 非零且 $A^*=-A^{\\mathsf T}$ 使 $|A|=0$ 不成立（解析给出 $|A|\\ne0$ 的论证），故 $|A|=-1$。',
      traps: '忘记 $|A^*|=|A|^{n-1}$（三阶即 $|A|^2$）而直接写成 $|A|$；以及 $-A^{\\mathsf T}$ 的行列式中 $(-1)^3$ 的符号（$n=3$ 为奇次）。另外必须排除 $|A|=0$ 这一支。',
      hint: '把条件翻译成矩阵等式 $A^*=-A^{\\mathsf T}$，再用 $AA^*=|A|E$ 或 $|A^*|=|A|^{n-1}$ 建立关于 $|A|$ 的方程。',
      src: { file: '参考文件/真题/数学/6、【1987-2025年】考研数学三真题答案及解析/2013年数学三真题答案解析.pdf', page: 5, no: '二(13)', note: '题干与【答案】取自 `参考文件/真题/数学/6、【1987-2025年】考研数学三真题答案及解析/2013年数学三真题答案解析.pdf` 第 5 页（含 $A^*=-A^{\\mathsf T}$、$|A|^2=-|A|$ 推导）。' }
    },
    {
      id: 'm3-2013-18', year: 2013, no: '三(18)', type: 'econ', star: 3,school: '全国硕士研究生入学统一考试-数学三 2013 年', 
      tags: ['ext21', 'ext08', 'gx22', 'kn11', 'kn12'],
      stem: '设生产某产品的固定成本为 6000 元，可变成本为 20 元/件，价格函数为 $P=60-\\dfrac{Q}{1000}$（$P$ 是单价，单位：元；$Q$ 是销量，单位：件），已知产销平衡，求：\n（1）该商品的边际利润；\n（2）当 $P=50$ 时的边际利润，并解释其经济意义；\n（3）使得利润最大的定价 $P$。',
      answer: '（1）设利润为 $l$，$l=PQ-(20Q+6000)=Q\\big(60-\\frac{Q}{1000}\\big)-20Q-6000=40Q-\\frac{Q^2}{1000}-6000$，边际利润 $l\'=40-\\frac{Q}{500}$。\n（2）$P=50$ 时由 $50=60-\\frac{Q}{1000}$ 得 $Q=10000$，边际利润 $l\'=40-20=20$。经济意义：此时销量每增加 1 件，利润增加 20 元。\n（3）令 $l\'=0$ 得 $Q=20000$，此时 $P=60-\\frac{20000}{1000}=40$（元），即利润最大的定价为 40 元。',
      traps: '把「边际利润」误当作「利润」或「边际收益」$PQ$ 的导数（$MR=60-\\frac{Q}{500}$ 与 $l\'$ 不同，因含可变成本 20）；第（3）问须用 $Q^*$ 反解 $P^*$（不是直接把 $P$ 当自变量求导）；「产销平衡」意味着 $Q$ 即销量。',
      hint: '先把利润写成只含 $Q$ 的二次函数，再求导；第（2）问先由价格函数反解出对应销量，再代边际利润式。',
      src: { file: '参考文件/真题/数学/6、【1987-2025年】考研数学三真题答案及解析/2013年数学三真题答案解析.pdf', page: 7, no: '三(18)', note: '题干与解析（价格函数 $P=60-Q/1000$、$l\'=40-Q/500$、$P=40$）取自 `参考文件/真题/数学/6、【1987-2025年】考研数学三真题答案及解析/2013年数学三真题答案解析.pdf` 第 7 页。' }
    },
    {
      id: 'm3-2013-19', year: 2013, no: '三(19)', type: 'proof', star: 4,school: '全国硕士研究生入学统一考试-数学三 2013 年', 
      tags: ['ext04', 'mvt01', 'mvt02', 'tp03'],
      stem: '设函数 $f(x)$ 在 $[0,+\\infty)$ 上可导，$f(0)=0$ 且 $\\lim\\limits_{x\\to+\\infty}f(x)=2$。证明：\n（1）存在 $a>0$，使得 $f(a)=1$；\n（2）对（1）中的 $a$，存在 $\\xi\\in(0,a)$，使得 $f\'(\\xi)=\\dfrac1a$。',
      answer: '（1）由 $\\lim\\limits_{x\\to+\\infty}f(x)=2$ 知存在 $X>0$，当 $x>X$ 时 $f(x)>\\frac32>1$；又 $f(x)$ 在 $[0,X]$ 上连续且 $f(0)=0<1<f(X)$，由连续函数介值定理，存在 $a\\in(0,X)$ 使 $f(a)=1$。\n（2）$f(x)$ 在 $[0,a]$ 上连续、在 $(0,a)$ 内可导，由拉格朗日中值定理：$f\'(\\xi)=\\dfrac{f(a)-f(0)}{a-0}=\\dfrac{1-0}{a}=\\dfrac1a$，其中 $\\xi\\in(0,a)$。',
      traps: '第（1）问直接引用介值定理却未先用极限说明「存在 $X$ 使 $f(X)>1$」（缺了构造区间这一步，条件不完整）；第（2）问忘记验证 $[0,a]$ 上连续、$(0,a)$ 内可导（中值定理的前提），或把端点 $a$ 也含进开区间。',
      hint: '存在性证明先「用极限造出比 1 大的函数值」，再用介值定理；第二问就是在 $[0,a]$ 上用拉格朗日中值定理，右端恰为 $1/a$。',
      src: { file: '参考文件/真题/数学/6、【1987-2025年】考研数学三真题答案及解析/2013年数学三真题答案解析.pdf', page: 7, no: '三(19)', note: '题干与解答要点取自 `参考文件/真题/数学/6、【1987-2025年】考研数学三真题答案及解析/2013年数学三真题答案解析.pdf` 第 7 页（含「$\\lim f(x)=2$」「$f(0)=0$」等可读表述）。' }
    },
    {
      id: 'm3-2013-21', year: 2013, no: '三(21)', type: 'eigen', star: 5,school: '全国硕士研究生入学统一考试-数学三 2013 年', 
      tags: ['zt02', 'tp04', 'kn66', 'kn67', 'la04'],
      stem: '设二次型 $f(x_1,x_2,x_3)=2\\big(a_1x_1+a_2x_2+a_3x_3\\big)^2+\\big(b_1x_1+b_2x_2+b_3x_3\\big)^2$，记 $\\boldsymbol{\\alpha}=\\begin{pmatrix}a_1\\\\a_2\\\\a_3\\end{pmatrix}$，$\\boldsymbol{\\beta}=\\begin{pmatrix}b_1\\\\b_2\\\\b_3\\end{pmatrix}$。\n（Ⅰ）证明二次型 $f$ 对应的矩阵为 $2\\boldsymbol{\\alpha}\\boldsymbol{\\alpha}^{\\mathsf T}+\\boldsymbol{\\beta}\\boldsymbol{\\beta}^{\\mathsf T}$；\n（Ⅱ）若 $\\boldsymbol{\\alpha},\\boldsymbol{\\beta}$ 正交且均为单位向量，证明二次型 $f$ 在正交变换下的标准形为二次型 $2y_1^2+y_2^2$。',
      answer: '（Ⅰ）记 $\\boldsymbol{x}=(x_1,x_2,x_3)^{\\mathsf T}$，则 $a_1x_1+a_2x_2+a_3x_3=\\boldsymbol{\\alpha}^{\\mathsf T}\\boldsymbol{x}$、$b_1x_1+b_2x_2+b_3x_3=\\boldsymbol{\\beta}^{\\mathsf T}\\boldsymbol{x}$，于是 $f=2(\\boldsymbol{\\alpha}^{\\mathsf T}\\boldsymbol{x})^2+(\\boldsymbol{\\beta}^{\\mathsf T}\\boldsymbol{x})^2=\\boldsymbol{x}^{\\mathsf T}\\big(2\\boldsymbol{\\alpha}\\boldsymbol{\\alpha}^{\\mathsf T}+\\boldsymbol{\\beta}\\boldsymbol{\\beta}^{\\mathsf T}\\big)\\boldsymbol{x}$。因 $2\\boldsymbol{\\alpha}\\boldsymbol{\\alpha}^{\\mathsf T}+\\boldsymbol{\\beta}\\boldsymbol{\\beta}^{\\mathsf T}$ 为实对称矩阵，故它就是 $f$ 的矩阵（二次型与对称矩阵一一对应）。\n（Ⅱ）$A=2\\boldsymbol{\\alpha}\\boldsymbol{\\alpha}^{\\mathsf T}+\\boldsymbol{\\beta}\\boldsymbol{\\beta}^{\\mathsf T}$，由 $\\|\\boldsymbol{\\alpha}\\|=\\|\\boldsymbol{\\beta}\\|=1$、$\\boldsymbol{\\alpha}^{\\mathsf T}\\boldsymbol{\\beta}=0$ 得 $A\\boldsymbol{\\alpha}=2\\boldsymbol{\\alpha}$、$A\\boldsymbol{\\beta}=\\boldsymbol{\\beta}$、$A\\boldsymbol{\\gamma}=\\boldsymbol{0}$（$\\boldsymbol{\\gamma}=\\boldsymbol{\\alpha}\\times\\boldsymbol{\\beta}$）。取 $\\boldsymbol{\\alpha},\\boldsymbol{\\beta},\\boldsymbol{\\gamma}$ 单位正交化后的正交矩阵 $Q$，正交变换 $\\boldsymbol{x}=Q\\boldsymbol{y}$ 下 $f=\\boldsymbol{y}^{\\mathsf T}Q^{\\mathsf T}AQ\\boldsymbol{y}=2y_1^2+y_2^2$。',
      traps: '（Ⅰ）忘记说明「矩阵必须实对称」才能作为二次型的矩阵（否则不唯一）；（Ⅱ）把 $A\\boldsymbol{\\alpha}=2\\boldsymbol{\\alpha}$ 的系数算错（$2\\boldsymbol{\\alpha}\\boldsymbol{\\alpha}^{\\mathsf T}\\boldsymbol{\\alpha}=2\\boldsymbol{\\alpha}$ 用了单位性），或漏掉第三个特征值 0 与对应向量 $\\boldsymbol{\\gamma}$ 的构造，导致正交矩阵凑不出。',
      hint: '把 $(\\boldsymbol{\\alpha}^{\\mathsf T}\\boldsymbol{x})^2$ 写成 $\\boldsymbol{x}^{\\mathsf T}\\boldsymbol{\\alpha}\\boldsymbol{\\alpha}^{\\mathsf T}\\boldsymbol{x}$ 即可看出矩阵；第二问直接验算 $A$ 作用在 $\\boldsymbol{\\alpha},\\boldsymbol{\\beta}$ 上得到特征值 2 与 1，再用正交补得 0。',
      src: { file: '参考文件/真题/数学/6、【1987-2025年】考研数学三真题答案及解析/2013年数学三真题答案解析.pdf', page: 8, no: '三(21)', note: '题干取自 `参考文件/真题/数学/6、【1987-2025年】考研数学三真题答案及解析/2013年数学三真题答案解析.pdf` 第 8-9 页（含二次型与 $\\boldsymbol{\\alpha},\\boldsymbol{\\beta}$ 定义、标准形 $2y_1^2+y_2^2$）。' }
    },
    {
      id: 'm3-2013-23', year: 2013, no: '三(23)', type: 'estimate', star: 3,school: '全国硕士研究生入学统一考试-数学三 2013 年', 
      tags: ['tp02', 'int04', 'ext21', 'gx27'],
      stem: '设总体 $X$ 的概率密度为\n$$f(x)=\\begin{cases}\\theta^{2}x^{-3}\\mathrm{e}^{-\\theta/x},&x>0,\\\\0,&\\text{其它,}\\end{cases}$$\n其中 $\\theta$ 为未知参数且大于零，$X_1,X_2,\\cdots,X_N$ 为来自总体 $X$ 的简单随机样本。\n（1）求 $\\theta$ 的矩估计量；\n（2）求 $\\theta$ 的最大似然估计量。',
      answer: '（1）$E(X)=\\displaystyle\\int_0^{+\\infty}x\\cdot\\theta^{2}x^{-3}\\mathrm{e}^{-\\theta/x}\\,\\mathrm{d}x$。令 $t=\\dfrac{\\theta}{x}$（$x=\\dfrac{\\theta}{t}$、$\\mathrm{d}x=-\\dfrac{\\theta}{t^{2}}\\mathrm{d}t$）代入得 $E(X)=\\displaystyle\\int_0^{+\\infty}\\theta\\mathrm{e}^{-t}\\,\\mathrm{d}t=\\theta$。令 $E(X)=\\bar X$ 得 $\\theta$ 的矩估计量 $\\hat\\theta=\\bar X$。\n（2）似然函数 $L(\\theta)=\\displaystyle\\prod_{i=1}^{N}\\theta^{2}X_i^{-3}\\mathrm{e}^{-\\theta/X_i}=\\theta^{2N}\\Big(\\prod_{i=1}^{N}X_i^{-3}\\Big)\\mathrm{e}^{-\\theta\\sum 1/X_i}$，对数似然\n$$\\ln L=2N\\ln\\theta-3\\sum_{i=1}^{N}\\ln X_i-\\theta\\sum_{i=1}^{N}\\frac{1}{X_i}.$$\n令 $\\dfrac{\\mathrm{d}\\ln L}{\\mathrm{d}\\theta}=\\dfrac{2N}{\\theta}-\\displaystyle\\sum_{i=1}^{N}\\dfrac{1}{X_i}=0$，得 $\\theta$ 的最大似然估计量 $\\hat\\theta=\\dfrac{2N}{\\sum_{i=1}^{N}\\dfrac{1}{X_i}}$。',
      traps: '把 $f(x)=\\theta^{2}x^{-3}\\mathrm{e}^{-\\theta/x}$ 误认成指数分布 $f=\\frac1\\theta\\mathrm{e}^{-x/\\theta}$（均值 $\\theta$）或伽马型 $\\frac{x}{\\theta^2}\\mathrm{e}^{-x/\\theta}$（均值 $2\\theta$）——本题是逆伽马型，均值恰为 $\\theta$，矩估计量为 $\\bar X$ 而非 $\\frac{\\bar X}{2}$；最大似然求导时把 $\\sum\\frac{1}{X_i}$ 写成 $\\sum X_i$（分子是 $x$ 的负一次幂）。',
      hint: '矩估计先做换元 $t=\\theta/x$ 把 $E(X)$ 积出来，再令它等于样本均值；最大似然直接对 $\\ln L$ 求导，注意含 $\\theta$ 的那一项是 $\\theta\\sum(1/X_i)$。',
      src: { file: '参考文件/真题/数学/6、【1987-2025年】考研数学三真题答案及解析/2013年数学三真题答案解析.pdf', page: 9, no: '三(23)', note: '题干与【解析】取自 `参考文件/真题/数学/6、【1987-2025年】考研数学三真题答案及解析/2013年数学三真题答案解析.pdf` 第 9-10 页（含 $\\theta^{2}x^{-3}\\mathrm{e}^{-\\theta/x}$、$EX=\\theta$、$\\hat\\theta=X\\,$ 与 $\\,\\hat\\theta=2N/\\sum(1/X_i)$）。' }
    },
    {
      id: 'm3-2019-12', year: 2019, no: '二(12)', type: 'econ', star: 4,school: '全国硕士研究生招生考试-数学三 2019 年', 
      tags: ['ext08', 'kn12', 'ext21', 'gx27', 'gx28'],
      stem: '以 $P_A$、$P_B$ 分别表示 A、B 两个商品的价格，设商品 A 的需求函数 $Q_A=500-P_A^{2}-P_AP_B+2P_B^{2}$，则当 $P_A=10$、$P_B=20$ 时，商品 A 的需求量对自身价格的弹性 $\\eta_{AA}$（$\\eta_{AA}>0$）= ______ 。',
      answer: '当 $P_B=20$ 时，$Q_A=500-P_A^{2}-20P_A+2\\times20^{2}=1300-20P_A-P_A^{2}$，$\\dfrac{\\mathrm{d}Q_A}{\\mathrm{d}P_A}=-20-2P_A$。\n由点弹性定义 $\\eta_{AA}=-\\dfrac{P_A}{Q_A}\\dfrac{\\mathrm{d}Q_A}{\\mathrm{d}P_A}=\\dfrac{2P_A(P_A+10)}{1300-20P_A-P_A^{2}}$。\n代入 $P_A=10$：$Q_A=1300-200-100=1000$、$\\dfrac{\\mathrm{d}Q_A}{\\mathrm{d}P_A}=-40$，故\n$$\\eta_{AA}=-\\dfrac{10}{1000}\\times(-40)=0.4,$$\n即应填 0.4。',
      traps: '点弹性公式漏掉 $\\dfrac{P_A}{Q_A}$ 的系数（只写 $\\dfrac{\\mathrm{d}Q_A}{\\mathrm{d}P_A}$）或漏掉负号；没有先把 $P_B=20$ 代入化简就直接对 $P_B$ 求偏导；把需求函数记错（漏掉 $P_A^{2}$ 或交叉项 $P_AP_B$）；忘记题目已声明 $\\eta_{AA}>0$（只需给出正值）。',
      hint: '先用 $P_B=20$ 把需求函数化为一元式，再按 $\\eta=-\\frac{P}{Q}\\frac{\\mathrm{d}Q}{\\mathrm{d}P}$ 代入，最后按题目要求取正值。',
      src: { file: '参考文件/真题/数学/6、【1987-2025年】考研数学三真题答案及解析/2019年数学三真题答案解析.pdf', page: 3, no: '二(12)', note: '题面取自 `参考文件/_extract/真题__数学__5、【1987-2025年】考研数学三真题__3、2010-2022考研数学三真题.txt` 第 303-304 行；解答取自 `参考文件/真题/数学/6、【1987-2025年】考研数学三真题答案及解析/2019年数学三真题答案解析.pdf` 第 3 页（「当 PB=20 时 QA=500−PA²−20PA+2·20²=1300−20PA−PA²…故应填 0.4」）。' }
    },
{
      id: 'm3-2023-1', year: 2023, no: '一(1)', type: 'evalAns', star: 4,school: '全国硕士研究生招生考试-数学三 2023 年', 
      tags: ['ext13', 'gx17', 'gx40'],
      stem: '已知函数 $f(x,y)=\\ln\\left(y+|x\\sin y|\\right)$，则（ ）',
      options: ['$\\left.\\dfrac{\\partial f}{\\partial x}\\right|_{(0,1)}$ 不存在，$\\left.\\dfrac{\\partial f}{\\partial y}\\right|_{(0,1)}$ 存在', '$\\left.\\dfrac{\\partial f}{\\partial x}\\right|_{(0,1)}$ 存在，$\\left.\\dfrac{\\partial f}{\\partial y}\\right|_{(0,1)}$ 不存在', '$\\left.\\dfrac{\\partial f}{\\partial x}\\right|_{(0,1)}$、$\\left.\\dfrac{\\partial f}{\\partial y}\\right|_{(0,1)}$ 均存在', '$\\left.\\dfrac{\\partial f}{\\partial x}\\right|_{(0,1)}$、$\\left.\\dfrac{\\partial f}{\\partial y}\\right|_{(0,1)}$ 均不存在'],
      answer: '选 A。在点 $(0,1)$ 处按定义求偏导：\n$$\\left.\\frac{\\partial f}{\\partial x}\\right|_{(0,1)}=\\lim_{x\\to0}\\frac{f(x,1)-f(0,1)}{x}=\\lim_{x\\to0}\\frac{\\ln\\left(1+|x\\sin 1|\\right)}{x}=\\sin1\\cdot\\lim_{x\\to0}\\frac{|x|}{x},$$\n其中 $\\lim\\limits_{x\\to0}\\dfrac{|x|}{x}$ 不存在（左极限 $-1$、右极限 $1$），故 $\\partial f/\\partial x|_{(0,1)}$ 不存在。\n再看 $x=0$ 处：$f(0,y)=\\ln y$，于是\n$$\\left.\\frac{\\partial f}{\\partial y}\\right|_{(0,1)}=\\lim_{y\\to1}\\frac{\\ln y-\\ln 1}{y-1}=\\lim_{y\\to1}\\frac{\\ln y}{y-1}=1,$$\n即 $\\partial f/\\partial y|_{(0,1)}$ 存在。故选 A。',
      traps: '误选 D（都「不存在」）：$\\partial f/\\partial y$ 只留下 $\\ln y$，就是一元 $\\ln y$ 在 $y=1$ 处的导数，存在且为 1。另一处易错是把 $\\lim\\limits_{x\\to0}\\dfrac{\\ln(1+|x\\sin1|)}{x}$ 直接算成 $\\sin1$，漏掉 $|x|/x$ 的符号跳变。',
      hint: '求一点的偏导用定义：先固定另一个变量（$y=1$ 或 $x=0$）化成一元函数，再用导数定义；注意 $|x|$ 在 0 处左右符号不同，极限不存在。',
      src: { file: '参考文件/真题/数学/6、【1987-2025年】考研数学三真题答案及解析/2023年数学三真题答案解析.pdf', page: 1, no: '一(1)', note: '题面取自 `参考文件/真题/数学/5、【1987-2025年】考研数学三真题/2023年考研数学三真题.pdf` 第 2 页（扫描件，无文本层）；题干与选项的抽取文本为 `参考文件/_extract/真题__数学__5、【1987-2025年】考研数学三真题__2023年考研数学三真题.txt` 第 23 行（题干）与第 24-25 行（选项，(C)(D) 作「均存在/均不存在」），与该册第 2 页扫描页一致（裁片 `backup/scratch/bank-fix2/src-img/zt2023_p2_top.png`，我本人用 read_image 读图）。答案 A 取自 `2023年数学三真题答案解析.pdf` 第 1 页；抽取文本 `参考文件/_extract/真题__数学__6、【1987-2025年】考研数学三真题答案及解析__2023年数学三真题答案解析.txt` 第 5 行「（1）【答案】A」与第 9 行「答案选（A）」，裁片 `backup/scratch/bank-fix2/src-img/jx2023_p1_top.png`（我本人用 read_image 读图）。' }
    },
    {
      id: 'm3-2023-2', year: 2023, no: '一(2)', type: 'integral', star: 4,school: '全国硕士研究生招生考试-数学三 2023 年', 
      tags: ['gx29', 'int24', 'gx31'],
      stem: '函数 $f(x)=\\begin{cases}\\dfrac{1}{\\sqrt{1+x^{2}}}, & x\\le 0,\\\\ (x+1)\\cos x, & x>0,\\end{cases}$ 的一个原函数为（ ）',
      options: ['$F(x)=\\begin{cases}\\ln\\left(\\sqrt{1+x^{2}}-x\\right), & x\\le 0,\\\\ (x+1)\\cos x-\\sin x, & x>0\\end{cases}$', '$F(x)=\\begin{cases}\\ln\\left(\\sqrt{1+x^{2}}-x\\right)+1, & x\\le 0,\\\\ (x+1)\\cos x-\\sin x, & x>0\\end{cases}$', '$F(x)=\\begin{cases}\\ln\\left(\\sqrt{1+x^{2}}+x\\right), & x\\le 0,\\\\ (x+1)\\sin x+\\cos x, & x>0\\end{cases}$', '$F(x)=\\begin{cases}\\ln\\left(\\sqrt{1+x^{2}}+x\\right)+1, & x\\le 0,\\\\ (x+1)\\sin x+\\cos x, & x>0\\end{cases}$'],
      answer: '选 D。分段积分：\n- $x\\le0$ 时 $\\displaystyle\\int\\frac{\\mathrm{d}x}{\\sqrt{1+x^{2}}}=\\ln\\left(x+\\sqrt{1+x^{2}}\\right)+C_1$；\n- $x>0$ 时 $\\displaystyle\\int(x+1)\\cos x\\,\\mathrm{d}x=(x+1)\\sin x-\\int\\sin x\\,\\mathrm{d}x=(x+1)\\sin x+\\cos x+C_2$。\n原函数必须处处连续，在 $x=0$ 处比较两侧极限：左极限 $\\ln 1+C_1=C_1$，右极限 $(0+1)\\cdot0+1+C_2=1+C_2$，故 $C_1=1+C_2$。取 $C_2=0$ 得 $C_1=1$，即 $F(x)$ 在 $x\\le0$ 段为 $\\ln\\left(x+\\sqrt{1+x^{2}}\\right)+1$、在 $x>0$ 段为 $(x+1)\\sin x+\\cos x$，选 D。（选项 C 左段为 $\\ln\\left(\\sqrt{1+x^{2}}+x\\right)$，在 $x=0$ 处左极限 $0$、右极限 $1$，不连续，故不是原函数。）',
      traps: '只分段积分而不检验「原函数在分段点连续」：右段只有 $(x+1)\\sin x+\\cos x$ 与 $(x+1)\\cos x-\\sin x$ 两种形状，前者是原函数；再靠 $x=0$ 处连续性在「$+1$ 与否」中二选一。另外 $\\ln\\left(x+\\sqrt{1+x^{2}}\\right)$ 与 $\\ln\\left(\\sqrt{1+x^{2}}-x\\right)$ 互为相反数，容易写错符号。',
      hint: '两段分别积分，再强制原函数在分界点 $x=0$ 连续：比较左右极限得到 $C_1=1+C_2$，据此在四个选项里择优。',
      src: { file: '参考文件/真题/数学/6、【1987-2025年】考研数学三真题答案及解析/2023年数学三真题答案解析.pdf', page: 1, no: '一(2)', note: '题面取自 `参考文件/真题/数学/5、【1987-2025年】考研数学三真题/2023年考研数学三真题.pdf` 第 2 页（扫描件，无文本层）；题干与四选项的抽取文本为 `参考文件/_extract/真题__数学__5、【1987-2025年】考研数学三真题__2023年考研数学三真题.txt` 第 27 行（题干，无「设」「则」）与第 29-36 行（四选项）。答案 D 取自 `2023年数学三真题答案解析.pdf` 第 1 页；抽取文本 `参考文件/_extract/真题__数学__6、【1987-2025年】考研数学三真题答案及解析__2023年数学三真题答案解析.txt` 第 12 行「（2）【答案】D」与第 17 行「答案选（D）」，裁片 `backup/scratch/bank-fix2/src-img/jx2023_p1_bot.png`（我本人用 read_image 读图）。' }
    },
    {
      id: 'm3-2023-3', year: 2023, no: '一(3)', type: 'ode', star: 4,school: '全国硕士研究生招生考试-数学三 2023 年', 
      tags: ['ode03', 'tp07'],
      stem: '若微分方程 $y\'\'+ay\'+by=0$ 的解在 $(-\\infty,+\\infty)$ 上有界，则（ ）',
      options: ['$a<0,\\ b>0$', '$a>0,\\ b>0$', '$a=0,\\ b>0$', '$a=0,\\ b<0$'],
      answer: '选 C。特征方程为 $\\lambda^{2}+a\\lambda+b=0$，按判别式讨论：\n- 当 $a\\ne0$ 时，无论实根还是复根，特征根的实部都是 $-\\dfrac{a}{2}\\ne0$，通解含因子 $\\mathrm{e}^{-\\frac{a}{2}x}$，$x\\to\\pm\\infty$ 时必有一侧无界；\n- 当 $a=0,\\ b>0$ 时，$\\lambda=\\pm\\mathrm{i}\\sqrt{b}$，通解 $y=C_1\\cos\\sqrt{b}x+C_2\\sin\\sqrt{b}x$，在全实轴上有界；\n- 当 $b<0$ 时，$\\lambda=\\pm\\sqrt{|b|}$ 为实根，通解含 $\\mathrm{e}^{\\sqrt{|b|}x}$，$x\\to+\\infty$ 无界；\n- 当 $a=0,\\ b=0$ 时 $y=C_1+C_2x$ 也无界。\n故只有 $a=0,\\ b>0$ 满足条件，选 C。',
      traps: '把「有界」当成「趋于 0」（后者才是 $a>0$ 的稳定情形）；忽略 $a\\ne0$ 时复根也有实部 $-a/2$，从而误以为只要 $b>0$ 就有界。',
      hint: '写特征方程 $\\lambda^{2}+a\\lambda+b=0$，分实根/复根讨论；全实轴有界要求所有特征根实部为 0，且不能出现 $x$ 乘常数之一类增长项。',
      src: { file: '参考文件/真题/数学/6、【1987-2025年】考研数学三真题答案及解析/2023年数学三真题答案解析.pdf', page: 1, no: '一(3)', note: '题面取自 `参考文件/真题/数学/5、【1987-2025年】考研数学三真题/2023年考研数学三真题.pdf` 第 2 页起（扫描件，无文本层；题干首行见裁片 `backup/scratch/bank-fix2/src-img/zt2023_p2_top.png`，我本人用 read_image 读图）；题干与四选项的抽取文本为 `参考文件/_extract/真题__数学__5、【1987-2025年】考研数学三真题__2023年考研数学三真题.txt` 第 37 行（题干）与第 38-39 行（四选项）。答案 C 取自 `2023年数学三真题答案解析.pdf` 第 1-2 页（「(3)【答案】 C.」与「因此答案选(C).」）；抽取文本 `参考文件/_extract/真题__数学__6、【1987-2025年】考研数学三真题答案及解析__2023年数学三真题答案解析.txt` 第 18 行与第 30 行，裁片 `backup/scratch/bank-fix2/src-img/jx2023_p1_bot.png`、`backup/scratch/bank-fix2/src-img/jx2023_p2_top.png`（我本人用 read_image 读图）。' }
    },
    {
      id: 'm3-2023-4', year: 2023, no: '一(4)', type: 'evalAns', star: 3,school: '全国硕士研究生招生考试-数学三 2023 年', 
      tags: ['ext16', 'kn51', 'gx51'],
      stem: '已知 $a_n<b_n\\ (n=1,2,\\cdots)$。若级数 $\\sum\\limits_{n=1}^{\\infty}a_n$ 与 $\\sum\\limits_{n=1}^{\\infty}b_n$ 均收敛，则「$\\sum\\limits_{n=1}^{\\infty}a_n$ 绝对收敛」是「$\\sum\\limits_{n=1}^{\\infty}b_n$ 绝对收敛」的（ ）',
      options: ['充分必要条件', '充分不必要条件', '必要不充分条件', '既不充分也不必要条件'],
      answer: '选 A。由 $a_n<b_n$ 知 $b_n-a_n>0$，而 $\\sum\\limits_{n=1}^{\\infty}(b_n-a_n)=\\sum\\limits_{n=1}^{\\infty}b_n-\\sum\\limits_{n=1}^{\\infty}a_n$ 为两个收敛级数之差，故收敛，且作为正项级数它绝对收敛。于是\n$$\\sum_{n=1}^{\\infty}|b_n|=\\sum_{n=1}^{\\infty}\\left|a_n+(b_n-a_n)\\right|\\le\\sum_{n=1}^{\\infty}|a_n|+\\sum_{n=1}^{\\infty}(b_n-a_n),$$\n即「$\\sum a_n$ 绝对收敛」$\\Rightarrow$「$\\sum b_n$ 绝对收敛」；同理 $\\sum|a_n|\\le\\sum|b_n|+\\sum(b_n-a_n)$ 给出反向蕴含。两向都成立，故为充分必要条件，选 A。',
      traps: '把 $a_n<b_n$ 误当作 $|a_n|<|b_n|$（只有正项级数才可能，此处 $a_n$ 可为负）；或试图举反例否定充分性，但任何反例都会破坏「$\\sum(b_n-a_n)$ 收敛」这一前提。',
      hint: '把两收敛级数之差 $\\sum(b_n-a_n)$ 当成一个收敛的正项级数，再用三角不等式 $|a_n+(b_n-a_n)|\\le|a_n|+(b_n-a_n)$ 双向夹逼。',
      src: { file: '参考文件/真题/数学/6、【1987-2025年】考研数学三真题答案及解析/2023年数学三真题答案解析.pdf', page: 2, no: '一(4)', note: '题面取自 `参考文件/真题/数学/5、【1987-2025年】考研数学三真题/2023年考研数学三真题.pdf` 第 2 页（扫描件，无文本层）；题干与四选项的抽取文本为 `参考文件/_extract/真题__数学__5、【1987-2025年】考研数学三真题__2023年考研数学三真题.txt` 第 40-41 行（题干）与第 43-44 行（四选项）。答案 A 取自 `2023年数学三真题答案解析.pdf` 第 2 页「(4)【答案】 A.」；抽取文本 `参考文件/_extract/真题__数学__6、【1987-2025年】考研数学三真题答案及解析__2023年数学三真题答案解析.txt` 第 32 行与第 42 行「答案选（A）」，裁片 `backup/scratch/bank-fix2/src-img/jx2023_p2_top.png`（我本人用 read_image 读图）。' }
    },
    {
      id: 'm3-2024-5', year: 2024, no: '一(5)', type: 'eigen', star: 3,school: '全国硕士研究生招生考试-数学三 2024 年', 
      tags: ['la04', 'ln10', 'zt02'],
      stem: '已知 $f(x_1,x_2,x_3)=\\boldsymbol{X}^{\\mathrm{T}}\\boldsymbol{A}\\boldsymbol{X}$ 经正交变换化为 $y_1^{2}-2y_2^{2}+3y_3^{2}$，则二次型对应的矩阵 $\\boldsymbol{A}$ 的行列式和迹分别为（ ）',
      options: ['$-6,\\ -2$', '$6,\\ -2$', '$-6,\\ 2$', '$6,\\ 2$'],
      answer: '选 C。二次型经正交变换化为标准形时，标准形系数就是矩阵 $\\boldsymbol{A}$ 的特征值（正交变换是相似变换，特征值不变），故 $\\boldsymbol{A}$ 的特征值为 $1,\\ -2,\\ 3$。于是\n$$|\\boldsymbol{A}|=1\\cdot(-2)\\cdot3=-6,\\qquad \\operatorname{tr}(\\boldsymbol{A})=1+(-2)+3=2,$$\n选 C。',
      traps: '把标准形的系数直接当成主对角元（误以为 $\\operatorname{tr}\\boldsymbol{A}=1-2+3=2$ 就万事大吉），或用「二次型的正负惯性指数」代替特征值——惯性指数只能定符号个数，不能给出 $|\\boldsymbol{A}|$ 的具体数值所需的特征值。',
      hint: '正交变换不改变特征值：$f$ 的标准形系数即 $\\boldsymbol{A}$ 的特征值；再用 $|\\boldsymbol{A}|=\\prod\\lambda_i$、$\\operatorname{tr}\\boldsymbol{A}=\\sum\\lambda_i$。',
      src: { file: '参考文件/真题/数学/6、【1987-2025年】考研数学三真题答案及解析/2024年数学三真题答案解析.pdf', page: 1, no: '一(5)', note: '题面取自 `参考文件/真题/数学/5、【1987-2025年】考研数学三真题/2024年考研数学三真题.pdf` 第 1 页起（扫描件，无文本层）；题干与四选项的抽取文本为 `参考文件/_extract/真题__数学__5、【1987-2025年】考研数学三真题__2024年考研数学三真题.txt` 第 26-27 行（题干）与第 28-34 行（四选项）。答案 C 取自 `2024年数学三真题答案解析.pdf` 第 1 页「5. 答 应选 C」及其特征值解析；抽取文本 `参考文件/_extract/真题__数学__6、【1987-2025年】考研数学三真题答案及解析__2024年数学三真题答案解析.txt` 第 23 行「5.答应选C」，裁片 `backup/scratch/bank-fix2/src-img/jx2024_p1_bot.png`（我本人用 read_image 读图）。' }
    },
    {
      id: 'm3-2024-6', year: 2024, no: '一(6)', type: 'linalg', star: 4,school: '全国硕士研究生招生考试-数学三 2024 年', 
      tags: ['kn35', 'la02', 'zb09'],
      stem: '设 $\\boldsymbol{A}$ 为三阶矩阵，$\\boldsymbol{P}=\\begin{pmatrix}1&0&0\\\\0&1&0\\\\1&0&1\\end{pmatrix}$，若 $\\boldsymbol{P}^{\\mathrm{T}}\\boldsymbol{A}\\boldsymbol{P}^{2}=\\begin{pmatrix}a+2c&0&c\\\\0&b&0\\\\2c&0&c\\end{pmatrix}$，则 $\\boldsymbol{A}=$（ ）',
      options: ['$\\begin{pmatrix}c&0&0\\\\0&a&0\\\\0&0&b\\end{pmatrix}$', '$\\begin{pmatrix}b&0&0\\\\0&c&0\\\\0&0&a\\end{pmatrix}$', '$\\begin{pmatrix}a&0&0\\\\0&b&0\\\\0&0&c\\end{pmatrix}$', '$\\begin{pmatrix}c&0&0\\\\0&b&0\\\\0&0&a\\end{pmatrix}$'],
      answer: '选 C。记 $\\boldsymbol{B}=\\boldsymbol{P}^{\\mathrm{T}}\\boldsymbol{A}\\boldsymbol{P}^{2}$。注意 $\\boldsymbol{P}=\\begin{pmatrix}1&0&0\\\\0&1&0\\\\1&0&1\\end{pmatrix}$ 是初等矩阵 $\\boldsymbol{E}_{31}(1)$（第 3 行加第 1 行），故 $\\boldsymbol{P}^{\\mathrm{T}}=\\boldsymbol{E}_{13}(1)$。两边左乘 $(\\boldsymbol{P}^{\\mathrm{T}})^{-1}$、右乘 $(\\boldsymbol{P}^{2})^{-1}$：\n$$\\boldsymbol{A}=(\\boldsymbol{P}^{\\mathrm{T}})^{-1}\\boldsymbol{B}(\\boldsymbol{P}^{2})^{-1},\\qquad (\\boldsymbol{P}^{\\mathrm{T}})^{-1}=\\begin{pmatrix}1&0&-1\\\\0&1&0\\\\0&0&1\\end{pmatrix},\\ \\ \\boldsymbol{P}^{2}=\\begin{pmatrix}1&0&0\\\\0&1&0\\\\2&0&1\\end{pmatrix},\\ (\\boldsymbol{P}^{2})^{-1}=\\begin{pmatrix}1&0&0\\\\0&1&0\\\\-2&0&1\\end{pmatrix}.$$\n先左乘（第 1 行减第 3 行，$c-c=0$）：$$\\begin{pmatrix}1&0&-1\\\\0&1&0\\\\0&0&1\\end{pmatrix}\\begin{pmatrix}a+2c&0&c\\\\0&b&0\\\\2c&0&c\\end{pmatrix}=\\begin{pmatrix}a&0&0\\\\0&b&0\\\\2c&0&c\\end{pmatrix};$$\n再右乘（第 1 列减 2 倍第 3 列，$2c-2c=0$）：$$\\boldsymbol{A}=\\begin{pmatrix}a&0&0\\\\0&b&0\\\\0&0&c\\end{pmatrix}=\\operatorname{diag}(a,b,c),$$ 选 C。',
      traps: '把 $\\boldsymbol{P}^{2}$ 当成 $\\boldsymbol{P}$（两者不相等，$\\boldsymbol{P}^{2}=\\begin{pmatrix}1&0&0\\\\0&1&0\\\\2&0&1\\end{pmatrix}$），或把 $\\boldsymbol{P}^{\\mathrm{T}}$ 与 $\\boldsymbol{P}^{-1}$ 混淆；也容易忽略「左乘 $\\boldsymbol{P}$ 是行变换、右乘 $\\boldsymbol{P}$ 是列变换」而直接得出 $\\boldsymbol{A}=\\boldsymbol{B}$。',
      hint: '认出 $\\boldsymbol{P}$ 是初等矩阵 $\\boldsymbol{E}_{31}(1)$，写 $\\boldsymbol{A}=(\\boldsymbol{P}^{\\mathrm{T}})^{-1}\\boldsymbol{B}(\\boldsymbol{P}^{2})^{-1}$，用「左乘＝行变换、右乘＝列变换」把 $c$ 消掉。',
      src: { file: '参考文件/真题/数学/6、【1987-2025年】考研数学三真题答案及解析/2024年数学三真题答案解析.pdf', page: 1, no: '一(6)', note: '题面取自 `参考文件/真题/数学/5、【1987-2025年】考研数学三真题/2024年考研数学三真题.pdf` 第 2 页（扫描件，无文本层）；该题含分块矩阵，抽取文本 `参考文件/_extract/真题__数学__5、【1987-2025年】考研数学三真题__2024年考研数学三真题.txt` 第 35-47 行为矩阵符号碎裂（不足以还原题干），题干文字以该册第 2 页扫描页为单源（无第二文本通道）。答案 C 取自 `2024年数学三真题答案解析.pdf` 第 1 页「6. 答 应选 C」及该页解答；抽取文本 `参考文件/_extract/真题__数学__6、【1987-2025年】考研数学三真题答案及解析__2024年数学三真题答案解析.txt` 第 26 行「6.答应选C」，裁片 `backup/scratch/bank-fix2/src-img/jx2024_p1_bot.png`（我本人用 read_image 读图）。' }
    },
    {
      id: 'm3-2024-7', year: 2024, no: '一(7)', type: 'linalg', star: 5,school: '全国硕士研究生招生考试-数学三 2024 年', 
      tags: ['ln03', 'la08', 'la02'],
      stem: '设 $\\boldsymbol{A}=\\begin{pmatrix}a+1&b&3\\\\a&\\dfrac{b}{2}&1\\\\1&1&2\\end{pmatrix}$，$M_{ij}$ 为 $a_{ij}$ 的余子式，若 $|\\boldsymbol{A}|=-\\dfrac{1}{2}$ 且 $-M_{21}+M_{22}-M_{23}=0$，则（ ）',
      options: ['$a=1$ 或 $a=-\\dfrac{3}{2}$', '$a=0$ 或 $a=\\dfrac{3}{2}$', '$b=1$ 或 $b=-\\dfrac{1}{2}$', '$b=-1$ 或 $a=\\dfrac{1}{2}$'],
      answer: '选 B。先翻译余子式条件：$A_{ij}=(-1)^{i+j}M_{ij}$，故 $-M_{21}+M_{22}-M_{23}=A_{21}+A_{22}+A_{23}=0$。而「某行代数余子式之和」等于把该行换成全 1 后所得行列式，于是\n$$A_{21}+A_{22}+A_{23}=\\begin{vmatrix}a+1&b&3\\\\1&1&1\\\\1&1&2\\end{vmatrix}=(a+1)(2-1)-b(2-1)+3(1-1)=a+1-b=0,$$\n得 $b=a+1$。\n再由 $|\\boldsymbol{A}|=-\\dfrac{1}{2}$ 按第 1 行展开：\n$$|\\boldsymbol{A}|=(a+1)\\left(\\frac{b}{2}\\cdot2-1\\right)-b(2a-1)+3\\left(a-\\frac{b}{2}\\right)=\\left(a+1\\right)\\left(b-1\\right)-2ab+b+3a-\\frac{3}{2}b=-ab+2a+\\frac{1}{2}b-1,$$\n由 $|\\boldsymbol{A}|=-\\dfrac{1}{2}$ 得 $-ab+2a+\\dfrac{1}{2}b=\\dfrac{1}{2}$，即\n$$b(1-2a)=1-4a.$$\n代入 $b=a+1$：$(a+1)(1-2a)=1-4a\\Rightarrow -2a^{2}+3a=0\\Rightarrow a=0$ 或 $a=\\dfrac{3}{2}$（对应 $b=1$ 或 $b=\\dfrac{5}{2}$），与选项 B 一致，故选 B。',
      traps: '符号陷阱：$M_{21}$ 与 $M_{23}$ 前的负号把条件变成 $A_{21}+A_{22}+A_{23}=0$，漏符号会得到 $a-b-1=0$ 一类错误等式。选项 (C)(D) 只用 $b$ 表述，$b=1$ 虽真实出现，但 $b=-\\dfrac{1}{2}$ 是代回 $b=a+1$ 得到的 $a=-\\dfrac{3}{2}$ 才配对的值，不满足方程。',
      hint: '先把余子式方程用「代数余子式之和＝把该行换 1」写成一个三阶行列式，解出 $b=a+1$；再把它代入按行展开得到的 $|\\boldsymbol{A}|$ 表达式解一元二次方程。',
      src: { file: '参考文件/真题/数学/6、【1987-2025年】考研数学三真题答案及解析/2024年数学三真题答案解析.pdf', page: 2, no: '一(7)', note: '题面取自 `参考文件/真题/数学/5、【1987-2025年】考研数学三真题/2024年考研数学三真题.pdf` 第 2 页（扫描件，无文本层）；题干与四选项的抽取文本为 `参考文件/_extract/真题__数学__5、【1987-2025年】考研数学三真题__2024年考研数学三真题.txt` 第 49-51 行（题干）与第 52-55 行（四选项）。答案 B 取自 `2024年数学三真题答案解析.pdf` 第 2 页「7. 答 应选 B」；抽取文本 `参考文件/_extract/真题__数学__6、【1987-2025年】考研数学三真题答案及解析__2024年数学三真题答案解析.txt` 第 36 行「7.答应选B」，裁片 `backup/scratch/bank-fix2/src-img/jx2024_p2_top.png`（我本人用 read_image 读图）。' }
    },
    {
      id: 'm3-2025-1', year: 2025, no: '一(1)', type: 'evalAns', star: 2,school: '全国硕士研究生招生考试-数学三 2025 年', 
      tags: ['inf08', 'inf12', 'inf06', 'zb13'],
      stem: '当 $x\\to0^{+}$ 时，下列无穷小量中，与 $x$ 等价的是（ ）',
      options: ['$\\mathrm{e}^{-\\sin x}-1$', '$\\sqrt{x+1}-\\cos x$', '$1-\\cos\\sqrt{2x}$', '$1-\\dfrac{\\ln(1+x)}{x}$'],
      answer: '选 C。逐项求与 $x$ 的比值（等价即极限为 1）：\n- (A) $\\mathrm{e}^{-\\sin x}-1\\sim-\\sin x\\sim-x$，比值为 $-1$；\n- (B) $\\sqrt{x+1}-\\cos x=\\left(\\sqrt{x+1}-1\\right)+\\left(1-\\cos x\\right)\\sim\\dfrac{x}{2}+\\dfrac{x^{2}}{2}$，比值为 $\\dfrac{1}{2}$；\n- (C) $1-\\cos\\sqrt{2x}\\sim\\dfrac{1}{2}\\left(\\sqrt{2x}\\right)^{2}=\\dfrac{1}{2}\\cdot2x=x$，比值为 $1$ ✓；\n- (D) $1-\\dfrac{\\ln(1+x)}{x}=\\dfrac{x-\\ln(1+x)}{x}\\sim\\dfrac{x^{2}/2}{x}=\\dfrac{x}{2}$，比值为 $\\dfrac{1}{2}$。\n故只有 (C) 与 $x$ 等价，选 C。',
      traps: '把「同阶」当成「等价」：(A) 与 $x$ 同阶但相差符号（比值 $-1$），(B)(D) 的比值都是 $\\dfrac{1}{2}$，只有 (C) 的比值为 1。(D) 还容易只看 $\\dfrac{\\ln(1+x)}{x}\\to1$ 就误判为一阶。',
      hint: '把每一项除以 $x$ 求极限；(B)(D) 先凑出 $\\sqrt{x+1}-1$、$x-\\ln(1+x)$ 的标准等价无穷小（$\\dfrac{x}{2}$、$\\dfrac{x^{2}}{2}$）。',
      src: { file: '参考文件/真题/数学/6、【1987-2025年】考研数学三真题答案及解析/2025年数学三真题参考解析.pdf', page: 1, no: '一(1)', note: '题面取自 `参考文件/真题/数学/5、【1987-2025年】考研数学三真题/2025年考研数学三真题.pdf` 第 2 页（扫描件，无文本层）；题干与四选项的抽取文本为 `参考文件/_extract/真题__数学__5、【1987-2025年】考研数学三真题__2025年考研数学三真题.txt` 第 10-12 行（题干与 (A)(B)(C)(D)）。答案 C 取自 `2025年数学三真题参考解析.pdf` 第 1 页与抽取文本 `参考文件/_extract/真题__数学__6、【1987-2025年】考研数学三真题答案及解析__2025年数学三真题参考解析.txt` 第 8 行「【答案】（C）」；同一答案另见该真题册第 6 页答案页「(1)【答案】（C）」（抽取文本 `参考文件/_extract/真题__数学__5、【1987-2025年】考研数学三真题__2025年考研数学三真题.txt` 第 101 行），裁片 `backup/scratch/bank-fix2/src-img/zt2025_p6_ans_top.png`（我本人用 read_image 读图）。' }
    },
    {
      id: 'm3-2025-2', year: 2025, no: '一(2)', type: 'integral', star: 3,school: '全国硕士研究生招生考试-数学三 2025 年', 
      tags: ['int33', 'ms02', 'int25'],
      stem: '已知函数 $f(x)=\\displaystyle\\int_{0}^{x}\\mathrm{e}^{t^{2}}\\sin t\\,\\mathrm{d}t$，$g(x)=\\displaystyle\\int_{0}^{x}\\mathrm{e}^{t^{2}}\\mathrm{d}t\\cdot\\sin^{2}x$，则（ ）',
      options: ['$x=0$ 是 $f(x)$ 的极值点，也是 $g(x)$ 的极值点', '$x=0$ 是 $f(x)$ 的极值点，$(0,0)$ 是曲线 $y=g(x)$ 的拐点', '$x=0$ 是 $f(x)$ 的极值点，$(0,0)$ 是 $f(x)$ 的拐点', '$(0,0)$ 是 $f(x)$ 的拐点，也是 $g(x)$ 的拐点'],
      answer: '选 B。分别看两个函数在 $x=0$ 附近的性态：\n- $f\'(x)=\\mathrm{e}^{x^{2}}\\sin x$：$x<0$ 时 $f\'<0$、$x>0$ 时 $f\'>0$，导数在 $x=0$ 两侧变号，故 $x=0$ 是 $f(x)$ 的极小值点（$f$ 不是拐点）；\n- 把 $g$ 定阶：$\\displaystyle\\int_{0}^{x}\\mathrm{e}^{t^{2}}\\mathrm{d}t=x+\\dfrac{x^{3}}{3}+O(x^{5})$，$\\sin^{2}x=x^{2}+O(x^{4})$，故 $g(x)=x^{3}+O(x^{5})$。于是 $g\'\'(x)=6x+O(x^{3})$ 在 $x=0$ 两侧变号，$(0,0)$ 是曲线 $y=g(x)$ 的拐点 ✓；而 $g\'(x)=3x^{2}+O(x^{4})\\ge0$ 在 0 两侧不变号，$x=0$ 不是 $g$ 的极值点。\n故选 B。',
      traps: '两个函数要分开判断：$f$ 用一阶导变号（极值点），$g$ 必须定阶后用二阶导变号（拐点）。若误把 $g$ 的一阶导在 0 处的零值当成极值信号，会选 A；若忘了 $f$ 在 0 处确实变号，会选 D。',
      hint: '先写 $f\'=\\mathrm{e}^{x^{2}}\\sin x$ 判断极值；再把 $g$ 展开到 $x^{3}$ 量级（$\\int_0^x\\mathrm{e}^{t^2}\\mathrm{d}t\\approx x$、$\\sin^2x\\approx x^2$），用 $g\'\'$ 的符号变化判断拐点。',
      src: { file: '参考文件/真题/数学/6、【1987-2025年】考研数学三真题答案及解析/2025年数学三真题参考解析.pdf', page: 1, no: '一(2)', note: '题面取自 `参考文件/真题/数学/5、【1987-2025年】考研数学三真题/2025年考研数学三真题.pdf` 第 2 页（扫描件，无文本层）；题干与四选项的抽取文本为 `参考文件/_extract/真题__数学__5、【1987-2025年】考研数学三真题__2025年考研数学三真题.txt` 第 13 行（题干）与第 14-17 行（四选项）。答案 B 取自 `2025年数学三真题参考解析.pdf` 第 1 页与抽取文本 `参考文件/_extract/真题__数学__6、【1987-2025年】考研数学三真题答案及解析__2025年数学三真题参考解析.txt` 第 22 行「【答案】（B）」；同一答案另见该真题册第 6 页答案页「(2)【答案】(B) x=0 是 f(x) 的极值点，(0,0) 是曲线 y=g(x) 的拐点」（抽取文本 `参考文件/_extract/真题__数学__5、【1987-2025年】考研数学三真题__2025年考研数学三真题.txt` 第 102 行），裁片 `backup/scratch/bank-fix2/src-img/zt2025_p6_ans_top.png`（我本人用 read_image 读图）。' }
    },
    {
      id: 'm3-2025-3', year: 2025, no: '一(3)', type: 'series', star: 4,school: '全国硕士研究生招生考试-数学三 2025 年', 
      tags: ['ser18', 'ser05', 'ser04', 'ser02'],
      stem: '已知 $k$ 为常数，则级数 $\\sum\\limits_{n=1}^{\\infty}(-1)^{n}\\left[\\dfrac{1}{n}-\\ln\\left(1+\\dfrac{k}{n^{2}}\\right)\\right]$（ ）',
      options: ['绝对收敛', '条件收敛', '发散', '敛散性与 $k$ 的取值相关'],
      answer: '选 B。记 $a_n=\\dfrac{1}{n}-\\ln\\left(1+\\dfrac{k}{n^{2}}\\right)$，对固定的常数 $k$ 作展开：\n$$\\ln\\left(1+\\dfrac{k}{n^{2}}\\right)=\\dfrac{k}{n^{2}}-\\dfrac{k^{2}}{2n^{4}}+O\\left(\\dfrac{1}{n^{6}}\\right),\\qquad a_n=\\dfrac{1}{n}-\\dfrac{k}{n^{2}}+O\\left(\\dfrac{1}{n^{4}}\\right)\\sim\\dfrac{1}{n}\\ (n\\to\\infty),$$\n故 $n$ 充分大时 $a_n>0$、$a_n\\to0$ 且单调递减。于是\n- 由莱布尼茨判别法，交错级数 $\\sum\\limits_{n=1}^{\\infty}(-1)^{n}a_n$ 收敛；\n- 但 $\\sum\\limits_{n=1}^{\\infty}|a_n|=\\sum\\limits_{n=1}^{\\infty}a_n$ 与调和级数同阶（$a_n\\sim\\dfrac1n$）而发散。\n故原级数条件收敛，选 B。（$k$ 为任意常数时结论不变：$k$ 只改变通项中 $1/n^{2}$ 阶的项，不改变 $a_n\\sim1/n$ 的主阶，故不选 D。）',
      traps: '把 $\\ln\\left(1+\\dfrac{k}{n^{2}}\\right)$ 只当成 $\\dfrac{k}{n^{2}}$，误以为通项是 $\\dfrac1n$ 减去一个二阶小量就可以绝对收敛而选 A；只看括号内两项相减就以为通项趋于 0 更快、忽略主阶仍是 $\\dfrac1n$；或误以为敛散性依赖 $k$ 而选 D —— $k$ 只影响 $1/n^{2}$ 阶项，不影响 $a_n\\sim1/n$ 的定阶结论。',
      hint: '先用泰勒展开给 $\\ln\\left(1+\\dfrac{k}{n^{2}}\\right)$ 定阶，得到 $a_n\\sim\\dfrac1n$ 且 $a_n>0$；再用莱布尼茨判别法判收敛、用 $\\sum a_n$ 与调和级数比较判「不绝对收敛」，两步合起来就是条件收敛。',
      src: { file: '参考文件/真题/数学/5、【1987-2025年】考研数学三真题/2025年考研数学三真题.pdf', page: 2, no: '一(3)', note: '题面取自本册（`参考文件/真题/数学/5、【1987-2025年】考研数学三真题/2025年考研数学三真题.pdf`）第 2 页（扫描件，无文本层）；题面四选项的抽取文本为 `参考文件/_extract/真题__数学__5、【1987-2025年】考研数学三真题__2025年考研数学三真题.txt` 第 18-20 行，裁片 `backup/scratch/bank-fix2/src-img/zt2025_p2_q3.png`（我本人用 read_image 读图，逐字为 (A) 绝对收敛 (B) 条件收敛 (C) 发散 (D) 敛散性与 k 的取值相关）。答案 B 见同册第 6 页答案页「(3)【答案】(B)条件收敛」（抽取文本同前文件第 103 行；裁片 `backup/scratch/bank-fix2/src-img/zt2025_p6_ans_top.png`，我本人用 read_image 读图），并与 `2025年数学三真题参考解析.pdf`（抽取文本 `参考文件/_extract/真题__数学__6、【1987-2025年】考研数学三真题答案及解析__2025年数学三真题参考解析.txt` 第 36、38、42 行）一致；第三源为存档网络答案图 `backup/scratch/bank-vision/web/xdf2025_2.png`（题面 (C)(D) 与「[答案] B」，我本人用 read_image 读图）。抽取文本探针记录见 `backup/scratch/bank-fix2/probe_src_t30.log`。' }
    },
  // ==== BEGIN GENERATED card-questions (t49) ====
    {
      id: "cv-m3-lim09", origin: 'card', year: 2012, school: "全国硕士研究生入学统一考试-数学三 2012 年", no: "卡片 lim09", type: "limit", star: 5,
      tags: ["lim09"],
      stem: "求 $\\lim_{x\\to\\frac{\\pi}{4}}(\\tan x)^{\\frac{1}{\\cos x-\\sin x}}$",
      answer: "这是 $1^{\\infty}$ 型极限。令 $t=x-\\frac{\\pi}{4}\\to0$，则 $\\tan x=\\tan\\left(\\frac{\\pi}{4}+t\\right)\\sim1+2t$，且 $\\cos x-\\sin x=\\sqrt2\\cos\\left(x+\\frac{\\pi}{4}\\right)=-\\sqrt2\\sin t\\sim-\\sqrt2\\,t$。故$$\\frac{\\ln\\tan x}{\\cos x-\\sin x}\\sim\\frac{\\tan x-1}{\\cos x-\\sin x}\\sim\\frac{2t}{-\\sqrt2\\,t}=-\\sqrt2$$所以原式 $=e^{-\\sqrt2}$。",
      altAnswer: "$\\tan x-1=\\dfrac{\\sin x-\\cos x}{\\cos x}=-\\dfrac{\\cos x-\\sin x}{\\cos x}$，故$$\\frac{\\ln\\tan x}{\\cos x-\\sin x}\\sim\\frac{\\tan x-1}{\\cos x-\\sin x}=-\\frac{1}{\\cos x}\\to-\\sqrt2$$于是原式 $=e^{-\\sqrt2}$（无需换元 $t=x-\\frac\\pi4$）。",
      traps: "$1^\\infty$ 型化成 $e^{\\lim v\\ln u}$ 后，常见错误是只算出 $\\lim v\\ln u$ 就停笔、忘记写回 $e$ 指数。",
      src: { card: "lim09", note: "卡片例题（data/math3.js 的 EXAMPLE[\"lim09\"]）来源原文：2012 年数三真题。traps 取自 PITFALL[lim09]。MNEM[lim09] 无条目 → 省略 hint 字段。" }
    },
    {
      id: "cv-m3-lim07", origin: 'card', year: 2012, school: "全国硕士研究生入学统一考试-数学三 2012 年", no: "卡片 lim07", type: "limit", star: 4,
      tags: ["lim07"],
      stem: "（2012 数三）求极限 $\\lim_{x\\to0}\\dfrac{e^{x^{2}}-e^{2-2\\cos x}}{x^{4}}$",
      answer: "令 $u=x^{2},\\ v=2-2\\cos x$，则 $u,v\\to0$，故$$e^{u}-e^{v}=e^{v}\\left(e^{u-v}-1\\right)\\sim u-v=x^{2}-(2-2\\cos x)=x^{2}-2(1-\\cos x)$$由 $1-\\cos x=\\dfrac{x^{2}}{2}-\\dfrac{x^{4}}{24}+o(x^{4})$，得 $2(1-\\cos x)=x^{2}-\\dfrac{x^{4}}{12}+o(x^{4})$，故分子 $x^{2}-2(1-\\cos x)\\sim\\dfrac{x^{4}}{12}$。于是$$\\lim_{x\\to0}\\frac{e^{x^{2}}-e^{2-2\\cos x}}{x^{4}}=\\frac{1}{12}$$",
      src: { card: "lim07", note: "卡片例题（data/math3.js 的 EXAMPLE[\"lim07\"]）来源原文：2012 年数三真题。PITFALL[lim07] 无条目 → 省略 traps 字段。MNEM[lim07] 无条目 → 省略 hint 字段。" }
    },
    {
      id: "cv-m3-inf08", origin: 'card', year: 2025, school: "全国硕士研究生招生考试-数学三 2025 年", no: "卡片 inf08", type: "limit", star: 5,
      tags: ["inf08"],
      stem: "（2025 数三）当 $x\\to0^{+}$ 时，下列无穷小量中与 $x$ 等价的是：(A) $e^{-\\sin x}-1$；(B) $\\sqrt{x+1}-\\cos x$；(C) $1-\\cos\\sqrt{2x}$；(D) $1-\\dfrac{\\ln(1+x)}{x}$",
      answer: "由 $1-\\cos u\\sim\\dfrac{u^{2}}{2}$ 得 $1-\\cos\\sqrt{2x}\\sim\\dfrac{(\\sqrt{2x})^{2}}{2}=x$，故选 (C)。其余：$e^{-\\sin x}-1\\sim-\\sin x\\sim-x$；$\\sqrt{x+1}-\\cos x\\sim\\dfrac{x}{2}$；$1-\\dfrac{\\ln(1+x)}{x}\\sim\\dfrac{x}{2}$。",
      traps: "$1-\\cos u\\sim\\frac{u^2}{2}$ 中 $u$ 可为复合量，替换后要整体平方，勿丢系数或漏代入 $u$。",
      src: { card: "inf08", note: "卡片例题（data/math3.js 的 EXAMPLE[\"inf08\"][0]）来源原文：2025 年数三真题。traps 取自 PITFALL[inf08]。MNEM[inf08] 无条目 → 省略 hint 字段。" }
    },
    {
      id: "cv-m3-inf08-2", origin: 'card', year: 2013, school: "全国硕士研究生入学统一考试-数学三 2013 年", no: "卡片 inf08-2", type: "limit", star: 5,
      tags: ["inf08"],
      stem: "（2013 数三）当 $x\\to0$ 时，$1-\\cos x\\cdot\\cos 2x\\cdot\\cos 3x$ 与 $a x^{n}$ 为等价无穷小，求 $n$ 与 $a$ 的值。",
      answer: "裂项并用 $1-\\cos u\\sim\\dfrac{u^{2}}{2}$：$$1-\\cos x\\cos2x\\cos3x=(1-\\cos x)+\\cos x(1-\\cos2x)+\\cos x\\cos2x(1-\\cos3x)$$$$\\sim\\frac{x^{2}}{2}+\\frac{(2x)^{2}}{2}+\\frac{(3x)^{2}}{2}=7x^{2}$$故 $n=2,\\ a=7$。",
      traps: "$1-\\cos u\\sim\\frac{u^2}{2}$ 中 $u$ 可为复合量，替换后要整体平方，勿丢系数或漏代入 $u$。",
      src: { card: "inf08", note: "卡片例题（data/math3.js 的 EXAMPLE[\"inf08\"][1]）来源原文：2013 年数三真题。traps 取自 PITFALL[inf08]。MNEM[inf08] 无条目 → 省略 hint 字段。" }
    },
    {
      id: "cv-m3-d14", origin: 'card', year: 2020, school: "全国硕士研究生招生考试-数学三 2020 年", no: "卡片 d14", type: "deriv", star: 5,
      tags: ["d14"],
      stem: "（2020 数三）设 $z=\\arctan\\bigl[xy+\\sin(x+y)\\bigr]$，则 $dz\\big|_{(0,\\pi)}=$____",
      answer: "由 $(\\arctan u)'=\\dfrac{u'}{1+u^{2}}$，在 $(0,\\pi)$ 处 $xy+\\sin(x+y)=0$：$$z_x=\\frac{y+\\cos(x+y)}{1+[xy+\\sin(x+y)]^{2}}\\Big|_{(0,\\pi)}=\\pi-1,\\qquad z_y=\\frac{x+\\cos(x+y)}{1+[xy+\\sin(x+y)]^{2}}\\Big|_{(0,\\pi)}=-1$$故$$dz\\big|_{(0,\\pi)}=(\\pi-1)dx-dy$$",
      traps: "$(\\arctan u)'=\\frac{u'}{1+u^2}$，勿漏内层导数：$(\\arctan2x)'=\\frac{2}{1+4x^2}$。",
      src: { card: "d14", note: "卡片例题（data/math3.js 的 EXAMPLE[\"d14\"]）来源原文：2020 年数三真题。traps 取自 PITFALL[d14]。MNEM[d14] 无条目 → 省略 hint 字段。" }
    },
    {
      id: "cv-m3-int16", origin: 'card', year: 2025, school: "全国硕士研究生招生考试-数学三 2025 年", no: "卡片 int16", type: "integral", star: 5,
      tags: ["int16"],
      stem: "（2025 数三）计算 $\\int_{0}^{1}\\dfrac{1}{(x+1)(x^{2}-2x+2)}\\,dx$",
      answer: "设 $\\dfrac{1}{(x+1)(x^{2}-2x+2)}=\\dfrac{A}{x+1}+\\dfrac{Bx+C}{x^{2}-2x+2}$，解得 $A=\\dfrac15,\\ B=-\\dfrac15,\\ C=\\dfrac35$。故$$\\int_{0}^{1}\\frac{1}{(x+1)(x^{2}-2x+2)}dx=\\frac15\\int_{0}^{1}\\frac{dx}{x+1}+\\frac15\\int_{0}^{1}\\frac{-x+3}{x^{2}-2x+2}dx$$由 $x^{2}-2x+2=(x-1)^{2}+1$，令 $u=x-1$ 得 $\\dfrac{-x+3}{x^{2}-2x+2}=\\dfrac{2-u}{u^{2}+1}$，故$$\\int\\frac{-x+3}{x^{2}-2x+2}dx=2\\arctan(x-1)-\\frac12\\ln(x^{2}-2x+2)$$于是原式 $=\\dfrac15\\left[\\ln(x+1)+2\\arctan(x-1)-\\dfrac12\\ln(x^{2}-2x+2)\\right]_{0}^{1}=\\dfrac{3}{10}\\ln 2+\\dfrac{\\pi}{10}$。",
      src: { card: "int16", note: "卡片例题（data/math3.js 的 EXAMPLE[\"int16\"]）来源原文：2025 年数三真题。PITFALL[int16] 无条目 → 省略 traps 字段。MNEM[int16] 无条目 → 省略 hint 字段。" }
    },
    {
      id: "cv-m3-int24", origin: 'card', year: 2016, school: "全国硕士研究生招生考试-数学三 2016 年", no: "卡片 int24", type: "integral", star: 5,
      tags: ["int24"],
      stem: "求 $\\lim_{n\\to\\infty}\\frac{1}{n^{2}}\\left(\\sin\\frac{1}{n}+2\\sin\\frac{2}{n}+\\cdots+n\\sin\\frac{n}{n}\\right)$",
      answer: "由定积分定义：$$\\lim_{n\\to\\infty}\\sum_{k=1}^{n}\\frac{k}{n^{2}}\\sin\\frac{k}{n}=\\int_{0}^{1}x\\sin x\\,dx$$再由分部积分：$$\\int_{0}^{1}x\\sin x\\,dx=-x\\cos x\\Big|_{0}^{1}+\\int_{0}^{1}\\cos x\\,dx=\\left[-x\\cos x+\\sin x\\right]_{0}^{1}=\\sin1-\\cos1$$",
      traps: "分部积分选 $u$ 按\"反对幂指三\"优先顺序：$\\int x\\,e^xdx$ 中 $u=x$，勿把 $e^x$ 当 $u$。",
      hint: "分部积分「反对幂指三」：按此顺序选 $u$（反三角、对数、幂、指数、三角），剩下的是 $dv$。",
      src: { card: "int24", note: "卡片例题（data/math3.js 的 EXAMPLE[\"int24\"]）来源原文：2016 年数三真题。traps 取自 PITFALL[int24]。hint 取自 MNEM[int24]。" }
    },
    {
      id: "cv-m3-int25", origin: 'card', year: 2013, school: "全国硕士研究生入学统一考试-数学三 2013 年", no: "卡片 int25", type: "integral", star: 5,
      tags: ["int25"],
      stem: "设 $F(x)=\\int_{x}^{x^{2}}\\frac{\\sin t}{t}\\,dt$，求 $F'(x)$（综合：变限积分求导与上下限均含 $x$）",
      answer: "由莱布尼茨公式：$$F'(x)=\\frac{\\sin(x^{2})}{x^{2}}\\cdot(x^{2})'-\\frac{\\sin x}{x}\\cdot(x)'=\\frac{\\sin(x^{2})}{x^{2}}\\cdot2x-\\frac{\\sin x}{x}=\\frac{2\\sin(x^{2})}{x}-\\frac{\\sin x}{x}$$",
      traps: "变限积分求导勿忘乘上限导数，且上下限都含 $x$ 时要拆成两段相减再求导。",
      hint: "变限积分求导：上限代入乘以上限导数，减下限代入乘以下限导数——「上导减下导」。",
      src: { card: "int25", note: "卡片例题（data/math3.js 的 EXAMPLE[\"int25\"][0]）来源原文：2013 年数三真题。traps 取自 PITFALL[int25]。hint 取自 MNEM[int25]。" }
    },
    {
      id: "cv-m3-int25-2", origin: 'card', year: 2026, school: "全国硕士研究生招生考试-数学三 2026 年", no: "卡片 int25-2", type: "integral", star: 5,
      tags: ["int25"],
      stem: "（2026 数三）设 $f(x)=\\int_{1}^{x^{3}}\\dfrac{e^{t}}{1+t^{2}}\\,dt$，$g(x)$ 为 $f(x)$ 的反函数，则 $g'(0)=$____",
      answer: "由 $f(1)=\\int_1^1=0$ 知 $g(0)=1$。由变限积分求导：$$f'(x)=\\frac{e^{x^{3}}}{1+x^{6}}\\cdot 3x^{2}$$故 $f'(1)=\\dfrac{3e}{2}$。由反函数求导公式 $g'(0)=\\dfrac{1}{f'(g(0))}=\\dfrac{1}{f'(1)}=\\dfrac{2}{3e}$。",
      traps: "变限积分求导勿忘乘上限导数，且上下限都含 $x$ 时要拆成两段相减再求导。",
      hint: "变限积分求导：上限代入乘以上限导数，减下限代入乘以下限导数——「上导减下导」。",
      src: { card: "int25", note: "卡片例题（data/math3.js 的 EXAMPLE[\"int25\"][1]）来源原文：2026 年数三真题。traps 取自 PITFALL[int25]。hint 取自 MNEM[int25]。" }
    },
    {
      id: "cv-m3-int28", origin: 'card', year: 2011, school: "全国硕士研究生入学统一考试-数学三 2011 年", no: "卡片 int28", type: "integral", star: 4,
      tags: ["int28"],
      stem: "求 $y=x^{2}$ 与 $y=x$ 所围平面图形的面积，并求该图形绕 $x$ 轴旋转所得旋转体的体积",
      answer: "交点 $x=0,1$。面积：$$S=\\int_{0}^{1}(x-x^{2})\\,dx=\\left[\\frac{x^{2}}{2}-\\frac{x^{3}}{3}\\right]_{0}^{1}=\\frac{1}{6}$$体积（圆环法）：$$V=\\pi\\int_{0}^{1}\\left[x^{2}-(x^{2})^{2}\\right]dx=\\pi\\int_{0}^{1}(x^{2}-x^{4})\\,dx=\\pi\\left(\\frac13-\\frac15\\right)=\\frac{2\\pi}{15}$$",
      src: { card: "int28", note: "卡片例题（data/math3.js 的 EXAMPLE[\"int28\"]）来源原文：2011 年数三真题。PITFALL[int28] 无条目 → 省略 traps 字段。MNEM[int28] 无条目 → 省略 hint 字段。" }
    },
    {
      id: "cv-m3-tay01", origin: 'card', year: 2017, school: "全国硕士研究生招生考试-数学三 2017 年", no: "卡片 tay01", type: "limit", star: 5,
      tags: ["tay01"],
      stem: "求 $\\lim_{x\\to0}\\frac{e^{x}-1-x}{x^{2}}$",
      answer: "由 $e^{x}=1+x+\\dfrac{x^{2}}{2}+o(x^{2})$，得$$\\lim_{x\\to0}\\frac{e^{x}-1-x}{x^{2}}=\\frac{1}{2}$$",
      altAnswer: "两次洛必达：$$\\lim_{x\\to0}\\frac{e^x-1-x}{x^2}=\\lim_{x\\to0}\\frac{e^x-1}{2x}=\\lim_{x\\to0}\\frac{e^x}{2}=\\frac12$$（无需记忆 $e^x$ 展开式）",
      traps: "泰勒展开必须展开到与分母同阶：分母是 $x^k$ 时分子要展到 $x^k$ 并带 $o(x^k)$，否则截断误差致错。",
      hint: "$e^{x}$ 展开：「一阶一阶来，系数是阶乘倒数」：$1+x+\\frac{x^2}{2!}+\\frac{x^3}{3!}+\\cdots$。",
      src: { card: "tay01", note: "卡片例题（data/math3.js 的 EXAMPLE[\"tay01\"]）来源原文：2017 年数三真题。traps 取自 PITFALL[tay01]。hint 取自 MNEM[tay01]。" }
    },
    {
      id: "cv-m3-tay04", origin: 'card', year: 2024, school: "全国硕士研究生招生考试-数学三 2024 年", no: "卡片 tay04", type: "series", star: 5,
      tags: ["tay04"],
      stem: "设幂级数 $\\sum_{n=0}^{\\infty}a_{n}x^{n}$ 的和函数为 $\\ln(2+x)$，求 $\\sum_{n=0}^{\\infty}n\\,a_{2n}$",
      answer: "$$\\ln(2+x)=\\ln 2+\\ln\\left(1+\\frac{x}{2}\\right)=\\ln 2+\\sum_{n=1}^{\\infty}\\frac{(-1)^{n-1}}{n}\\left(\\frac{x}{2}\\right)^{n}$$故 $a_{0}=\\ln 2$，$a_{n}=\\dfrac{(-1)^{n-1}}{n\\cdot2^{n}}\\ (n\\ge1)$。于是$$a_{2n}=\\frac{(-1)^{2n-1}}{2n\\cdot2^{2n}}=-\\frac{1}{2n\\cdot4^{n}}\\quad(n\\ge1)$$所以$$\\sum_{n=0}^{\\infty}n\\,a_{2n}=\\sum_{n=1}^{\\infty}n\\left(-\\frac{1}{2n\\cdot4^{n}}\\right)=-\\frac{1}{2}\\sum_{n=1}^{\\infty}\\frac{1}{4^{n}}=-\\frac{1}{2}\\cdot\\frac{1/4}{1-1/4}=-\\frac{1}{6}$$",
      altAnswer: "令 $S(x)=\\ln(2+x)=\\sum a_nx^n$。由偶部 $\\frac{S(x)+S(-x)}{2}=\\sum a_{2n}x^{2n}$，两边求导并令 $x=1$：$$2\\sum n\\,a_{2n}=\\frac{S'(1)-S'(-1)}{2}=\\frac{\\frac13-1}{2}=-\\frac13$$故 $\\sum n\\,a_{2n}=-\\frac16$，不必逐项求 $a_{2n}$。",
      traps: "$\\ln(1+x)$ 展开收敛域为 $(-1,1]$：$x=-1$ 发散、$x=1$ 收敛（交错调和，和为 $\\ln2$）；与 $\\frac1{1-x}$ 的收敛域 $|x|<1$ 不同，勿混记。",
      src: { card: "tay04", note: "卡片例题（data/math3.js 的 EXAMPLE[\"tay04\"]）来源原文：2024 年数三真题。traps 取自 PITFALL[tay04]。MNEM[tay04] 无条目 → 省略 hint 字段。" }
    },
    {
      id: "cv-m3-mvt02", origin: 'card', year: 2016, school: "全国硕士研究生招生考试-数学三 2016 年", no: "卡片 mvt02", type: "proof", star: 5,
      tags: ["mvt02"],
      stem: "证明：当 $x>0$ 时，$\\dfrac{x}{1+x}<\\ln(1+x)<x$",
      answer: "对 $f(t)=\\ln(1+t)$ 在 $[0,x]$ 用拉格朗日中值定理：存在 $\\xi\\in(0,x)$ 使 $\\ln(1+x)=\\dfrac{x}{1+\\xi}$；由 $0<\\xi<x$ 得 $\\dfrac{x}{1+x}<\\dfrac{x}{1+\\xi}<x$，即证。",
      altAnswer: "用已知不等式 $\\ln(1+x)<x$；又 $1+x=\\dfrac{1}{1-\\frac{x}{1+x}}$，故 $\\ln(1+x)=-\\ln\\left(1-\\dfrac{x}{1+x}\\right)>\\dfrac{x}{1+x}$（用到 $-\\ln(1-u)>u$，$0<u<1$）。合起来即 $\\dfrac{x}{1+x}<\\ln(1+x)<x$，无需构造辅助函数。",
      src: { card: "mvt02", note: "卡片例题（data/math3.js 的 EXAMPLE[\"mvt02\"]）来源原文：2016 年数三真题。PITFALL[mvt02] 无条目 → 省略 traps 字段。MNEM[mvt02] 无条目 → 省略 hint 字段。" }
    },
    {
      id: "cv-m3-ser10", origin: 'card', year: 2009, school: "全国硕士研究生入学统一考试-数学三 2009 年", no: "卡片 ser10", type: "series", star: 5,
      tags: ["ser10"],
      stem: "求幂级数 $\\sum_{n=1}^{\\infty}\\frac{x^{n}}{n}$ 的收敛域，并在收敛域内求其和函数",
      answer: "$$R=\\lim_{n\\to\\infty}\\left|\\frac{a_{n}}{a_{n+1}}\\right|=\\lim_{n\\to\\infty}\\frac{n+1}{n}=1$$端点 $x=-1$ 为交错级数收敛，$x=1$ 为调和级数发散，故收敛域 $[-1,1)$。设和函数 $S(x)=\\sum_{n=1}^{\\infty}\\frac{x^{n}}{n}$，则$$S'(x)=\\sum_{n=1}^{\\infty}x^{n-1}=\\frac{1}{1-x}\\ (|x|<1)$$积分并由 $S(0)=0$ 得$$S(x)=-\\ln(1-x),\\quad x\\in[-1,1)$$",
      altAnswer: "由已知展开 $\\ln(1-x)=-\\sum_{n=1}^{\\infty}\\frac{x^n}{n}\\ (|x|<1)$ 直接得 $S(x)=-\\ln(1-x)$；端点 $x=-1$ 处为交错级数收敛，$x=1$ 处发散，故收敛域 $[-1,1)$。免去逐项求导再积分。",
      traps: "收敛半径求出后，区间端点的敛散性必须单独判定，勿直接写成闭区间。",
      src: { card: "ser10", note: "卡片例题（data/math3.js 的 EXAMPLE[\"ser10\"]）来源原文：2009 年数三真题。traps 取自 PITFALL[ser10]。MNEM[ser10] 无条目 → 省略 hint 字段。" }
    },
    {
      id: "cv-m3-ode02", origin: 'card', year: 2022, school: "全国硕士研究生招生考试-数学三 2022 年", no: "卡片 ode02", type: "ode", star: 5,
      tags: ["ode02"],
      stem: "求一阶线性方程 $y'+y=x$ 的通解",
      answer: "$$y=e^{-x}\\left[\\int x\\,e^{x}\\,dx+C\\right]=e^{-x}\\left[(x-1)e^{x}+C\\right]=(x-1)+Ce^{-x}$$",
      altAnswer: "设特解 $y^*=ax+b$（右端为一次多项式），代入 $y'+y=x$ 得 $a+ax+b=x$，比较系数 $a=1,\\ a+b=0\\Rightarrow b=-1$。齐次解 $Ce^{-x}$，故通解 $y=x-1+Ce^{-x}$，免去积分。",
      traps: "一阶线性公式 $e^{-\\int Pdx}$ 与括号内 $e^{+\\int Pdx}$ 指数符号相反，勿同号；漏放积分常数 $C$ 也是高频错。",
      src: { card: "ode02", note: "卡片例题（data/math3.js 的 EXAMPLE[\"ode02\"][0]）来源原文：2022 年数三真题。traps 取自 PITFALL[ode02]。MNEM[ode02] 无条目 → 省略 hint 字段。" }
    },
    {
      id: "cv-m3-ode02-2", origin: 'card', year: 2023, school: "全国硕士研究生招生考试-数学三 2023 年", no: "卡片 ode02-2", type: "ode", star: 5,
      tags: ["ode02"],
      stem: "（2023 数三）设某公司在 $t$ 时刻的资产为 $f(t)$，从 $0$ 时刻到 $t$ 时刻的平均资产等于 $\\dfrac{f(t)}{t}-t$。已知 $f(t)$ 连续且 $f(0)=0$，则 $f(t)=$____",
      answer: "由 $\\dfrac{1}{t}\\int_{0}^{t}f(s)ds=\\dfrac{f(t)}{t}-t$ 得 $\\int_{0}^{t}f(s)ds=f(t)-t^{2}$，两边求导：$$f(t)=f'(t)-2t\\ \\Rightarrow\\ f'-f=2t$$一阶线性方程，通解 $f=e^{t}\\left(C+\\int 2te^{-t}dt\\right)=Ce^{t}-2t-2$。由 $f(0)=0$ 得 $C=2$，故$$f(t)=2e^{t}-2t-2$$",
      traps: "一阶线性公式 $e^{-\\int Pdx}$ 与括号内 $e^{+\\int Pdx}$ 指数符号相反，勿同号；漏放积分常数 $C$ 也是高频错。",
      src: { card: "ode02", note: "卡片例题（data/math3.js 的 EXAMPLE[\"ode02\"][1]）来源原文：2023 年数三真题。traps 取自 PITFALL[ode02]。MNEM[ode02] 无条目 → 省略 hint 字段。" }
    },
    {
      id: "cv-m3-ode02-3", origin: 'card', year: 2016, school: "全国硕士研究生招生考试-数学三 2016 年", no: "卡片 ode02-3", type: "ode", star: 5,
      tags: ["ode02"],
      stem: "（2016 数三）设函数 $f(x)$ 在 $[0,+\\infty)$ 上连续，且满足 $\\int_{0}^{x}f(x-t)\\,dt=\\int_{0}^{x}(x-t)f(t)\\,dt+e^{-x}-1$，求 $f(x)$ 的表达式。",
      answer: "令 $u=x-t$，左边 $=\\int_{0}^{x}f(u)du$；右边 $\\int_{0}^{x}(x-t)f(t)dt=x\\int_{0}^{x}f(t)dt-\\int_{0}^{x}tf(t)dt$。两边求导得$$f(x)=\\int_{0}^{x}f(t)dt-e^{-x}$$再求导：$f'(x)=f(x)+e^{-x}$，即 $f'-f=e^{-x}$。由公式得$$f(x)=e^{x}\\left(C+\\int e^{-x}e^{-x}dx\\right)=Ce^{x}-\\frac{e^{-x}}{2}$$又由原式取 $x=0$ 得 $f(0)=-1$，故 $C=-\\frac12$，$$f(x)=-\\frac{e^{x}+e^{-x}}{2}$$",
      traps: "一阶线性公式 $e^{-\\int Pdx}$ 与括号内 $e^{+\\int Pdx}$ 指数符号相反，勿同号；漏放积分常数 $C$ 也是高频错。",
      src: { card: "ode02", note: "卡片例题（data/math3.js 的 EXAMPLE[\"ode02\"][2]）来源原文：2016 年数三真题。traps 取自 PITFALL[ode02]。MNEM[ode02] 无条目 → 省略 hint 字段。" }
    },
    {
      id: "cv-m3-dbi02", origin: 'card', year: 2023, school: "全国硕士研究生招生考试-数学三 2023 年", no: "卡片 dbi02", type: "dblint", star: 5,
      tags: ["dbi02"],
      stem: "计算二重积分 $\\iint_{D}x\\,dxdy$，其中 $D$ 由 $(x-1)^{2}+y^{2}\\le 1$ 围成",
      answer: "区域为以 $(1,0)$ 为圆心、半径 $1$ 的圆：$(x-1)^{2}+y^{2}\\le1\\iff x^{2}+y^{2}\\le 2x$。极坐标下 $r\\le 2\\cos\\theta$，$\\theta\\in\\left[-\\frac{\\pi}{2},\\frac{\\pi}{2}\\right]$，$x=r\\cos\\theta$，故$$\\iint_{D}x\\,dxdy=\\int_{-\\pi/2}^{\\pi/2}d\\theta\\int_{0}^{2\\cos\\theta}r\\cos\\theta\\cdot r\\,dr=\\frac{8}{3}\\int_{-\\pi/2}^{\\pi/2}\\cos^{4}\\theta\\,d\\theta=\\frac{8}{3}\\cdot\\frac{3\\pi}{8}=\\pi$$",
      altAnswer: "区域 $D$ 是圆心在 $(1,0)$、半径 $1$ 的圆，面积 $S=\\pi$，形心横坐标 $\\bar x=1$。由$$\\iint_D x\\,d\\sigma=\\bar x\\cdot S(D)=1\\cdot\\pi=\\pi$$一步得解，无需极坐标积分。",
      traps: "极坐标面积元是 $r\\,dr\\,d\\theta$，勿漏乘 $r$——这是极坐标二重积分第一大错。",
      src: { card: "dbi02", note: "卡片例题（data/math3.js 的 EXAMPLE[\"dbi02\"]）来源原文：2023 年数三真题。traps 取自 PITFALL[dbi02]。MNEM[dbi02] 无条目 → 省略 hint 字段。" }
    },
    {
      id: "cv-m3-la04", origin: 'card', year: 2010, school: "全国硕士研究生入学统一考试-数学三 2010 年", no: "卡片 la04", type: "eigen", star: 5,
      tags: ["la04"],
      stem: "求矩阵 $A=\\begin{pmatrix}2&1\\\\1&2\\end{pmatrix}$ 的特征值与特征向量，并求可逆矩阵 $P$ 使 $P^{-1}AP$ 为对角阵",
      answer: "$$|\\lambda E-A|=\\begin{vmatrix}\\lambda-2&-1\\\\-1&\\lambda-2\\end{vmatrix}=(\\lambda-2)^{2}-1=0\\Rightarrow \\lambda_{1}=1,\\ \\lambda_{2}=3$$对 $\\lambda=1$：解 $(A-E)x=0$ 得特征向量 $\\alpha_{1}=(1,-1)^{T}$；对 $\\lambda=3$：解 $(A-3E)x=0$ 得 $\\alpha_{2}=(1,1)^{T}$。取$$P=\\begin{pmatrix}1&1\\\\-1&1\\end{pmatrix}\\Rightarrow P^{-1}AP=\\begin{pmatrix}1&0\\\\0&3\\end{pmatrix}$$",
      altAnswer: "$A$ 为实对称矩阵，特征值满足$$\\lambda_1+\\lambda_2=\\operatorname{tr}A=4,\\qquad \\lambda_1\\lambda_2=|A|=3$$解得 $\\lambda_1=1,\\lambda_2=3$，省去解特征方程；实对称矩阵不同特征值的特征向量自动正交，直接取 $\\alpha_1=(1,-1)^T,\\alpha_2=(1,1)^T$。",
      traps: "特征向量必须非零；求 $(\\lambda E-A)x=0$ 得的是基础解系（特征向量），重根要找齐对应个数的线性无关特征向量。",
      src: { card: "la04", note: "卡片例题（data/math3.js 的 EXAMPLE[\"la04\"]）来源原文：2010 年数三真题。traps 取自 PITFALL[la04]。MNEM[la04] 无条目 → 省略 hint 字段。" }
    },
    {
      id: "cv-m3-multi03", origin: 'card', year: 2012, school: "全国硕士研究生入学统一考试-数学三 2012 年", no: "卡片 multi03", type: "multivar", star: 5,
      tags: ["multi03"],
      stem: "求 $f(x,y)=x^{3}+y^{3}-3xy$ 的极值（判断驻点是否为极值点）",
      answer: "由 $f_{x}=3x^{2}-3y=0,\\ f_{y}=3y^{2}-3x=0$ 得 $y=x^{2},\\ x=y^{2}$，故 $x^{4}=x$，驻点为 $(0,0)$ 与 $(1,1)$。$$f_{xx}=6x,\\ f_{xy}=-3,\\ f_{yy}=6y,\\ \\Delta=AC-B^{2}=36xy-9$$在 $(0,0)$：$\\Delta=-9<0$，为鞍点，非极值；在 $(1,1)$：$\\Delta=27>0$ 且 $A=6>0$，取极小值 $f(1,1)=1+1-3=-1$。",
      traps: "$\\Delta=AC-B^2=0$ 时判别式失效，需用定义或配方判断，勿误判为极值。",
      src: { card: "multi03", note: "卡片例题（data/math3.js 的 EXAMPLE[\"multi03\"][0]）来源原文：2012 年数三真题。traps 取自 PITFALL[multi03]。MNEM[multi03] 无条目 → 省略 hint 字段。" }
    },
    {
      id: "cv-m3-multi03-2", origin: 'card', year: 2020, school: "全国硕士研究生招生考试-数学三 2020 年", no: "卡片 multi03-2", type: "multivar", star: 5,
      tags: ["multi03"],
      stem: "（2020 数三）求函数 $f(x,y)=x^{3}+8y^{3}-xy$ 的极值。",
      answer: "由 $f_{x}=3x^{2}-y=0,\\ f_{y}=24y^{2}-x=0$ 得 $y=3x^{2},\\ x=24y^{2}$，故 $x=216x^{4}$，即 $x=0$ 或 $x=\\frac16$，驻点为 $(0,0)$ 与 $\\left(\\frac16,\\frac{1}{12}\\right)$。$$f_{xx}=6x,\\ f_{xy}=-1,\\ f_{yy}=48y,\\quad \\Delta=AC-B^{2}=288xy-1$$在 $(0,0)$：$\\Delta=-1<0$，非极值；在 $\\left(\\frac16,\\frac{1}{12}\\right)$：$\\Delta=3>0$ 且 $A=1>0$，取极小值 $f\\left(\\frac16,\\frac{1}{12}\\right)=\\frac{1}{216}+\\frac{1}{216}-\\frac{1}{72}=-\\frac{1}{216}$。",
      traps: "$\\Delta=AC-B^2=0$ 时判别式失效，需用定义或配方判断，勿误判为极值。",
      src: { card: "multi03", note: "卡片例题（data/math3.js 的 EXAMPLE[\"multi03\"][1]）来源原文：2020 年数三真题。traps 取自 PITFALL[multi03]。MNEM[multi03] 无条目 → 省略 hint 字段。" }
    },
    {
      id: "cv-m3-multi03-3", origin: 'card', year: 2024, school: "全国硕士研究生招生考试-数学三 2024 年", no: "卡片 multi03-3", type: "multivar", star: 5,
      tags: ["multi03"],
      stem: "（2024 数三）函数 $z=2x^{3}-9x^{2}-6y^{4}+12x+24y$ 的极值点是____",
      answer: "$z_{x}=6x^{2}-18x+12=6(x-1)(x-2)$，$z_{y}=-24y^{3}+24=-24(y^{3}-1)$。令 $z_{x}=z_{y}=0$ 得 $x=1,2,\\ y=1$，驻点为 $(1,1),(2,1)$。$$z_{xx}=12x-18,\\quad z_{xy}=0,\\quad z_{yy}=-72y^{2},\\quad \\Delta=z_{xx}z_{yy}$$在 $(1,1)$：$z_{xx}=-6,\\ z_{yy}=-72$，$\\Delta=432>0$ 且 $z_{xx}<0$，为极大值点。在 $(2,1)$：$z_{xx}=6,\\ z_{yy}=-72$，$\\Delta=-432<0$，非极值点。故极值点为 $(1,1)$。",
      traps: "$\\Delta=AC-B^2=0$ 时判别式失效，需用定义或配方判断，勿误判为极值。",
      src: { card: "multi03", note: "卡片例题（data/math3.js 的 EXAMPLE[\"multi03\"][2]）来源原文：2024 年数三真题。traps 取自 PITFALL[multi03]。MNEM[multi03] 无条目 → 省略 hint 字段。" }
    },
    {
      id: "cv-m3-lim05", origin: 'card', year: 2017, school: "全国硕士研究生招生考试-数学三 2017 年", no: "卡片 lim05", type: "limit", star: 4,
      tags: ["lim05"],
      stem: "（2017 数三）设 $f(x)=\\begin{cases}\\dfrac{1-\\cos\\sqrt{x}}{ax},&x>0\\\\b,&x\\le0\\end{cases}$ 在 $x=0$ 处连续，则 $ab=$____",
      answer: "由 $1-\\cos\\sqrt{x}\\sim\\dfrac{x}{2}$ 得$$\\lim_{x\\to0^{+}}f(x)=\\lim_{x\\to0^{+}}\\frac{1-\\cos\\sqrt{x}}{ax}=\\frac{1}{2a}$$连续要求 $\\lim_{x\\to0^{+}}f(x)=f(0)=b$，故 $\\dfrac{1}{2a}=b$，即 $ab=\\dfrac12$。",
      traps: "$1-\\cos x\\sim\\frac{x^2}{2}$ 的系数 $\\frac12$ 常被漏掉，写成 $\\sim x^2$ 就错。",
      src: { card: "lim05", note: "卡片例题（data/math3.js 的 EXAMPLE[\"lim05\"]）来源原文：2017 年数三真题。traps 取自 PITFALL[lim05]。MNEM[lim05] 无条目 → 省略 hint 字段。" }
    },
    {
      id: "cv-m3-lim11", origin: 'card', year: 2011, school: "全国硕士研究生入学统一考试-数学三 2011 年", no: "卡片 lim11", type: "limit", star: 4,
      tags: ["lim11"],
      stem: "（2011 数三）设 $f(x)=\\lim_{t\\to0}x(1+3t)^{\\frac{x}{t}}$，则 $f'(x)=$____",
      answer: "由第二重要极限 $(1+\\frac{a}{u})^{u}\\to e^{a}$ 得 $\\lim_{t\\to0}(1+3t)^{\\frac{1}{t}}=e^{3}$，故$$f(x)=x\\,e^{3x}$$于是$$f'(x)=e^{3x}+3x\\,e^{3x}=e^{3x}(1+3x)$$",
      src: { card: "lim11", note: "卡片例题（data/math3.js 的 EXAMPLE[\"lim11\"]）来源原文：2011 年数三真题。PITFALL[lim11] 无条目 → 省略 traps 字段。MNEM[lim11] 无条目 → 省略 hint 字段。" }
    },
    {
      id: "cv-m3-lim12", origin: 'card', year: 2003, school: "全国硕士研究生入学统一考试-数学三 2003 年", no: "卡片 lim12", type: "limit", star: 4,
      tags: ["lim12"],
      stem: "求 $\\lim_{n\\to\\infty}\\sqrt[n]{2^{n}+3^{n}}$",
      answer: "由 $3=\\sqrt[n]{3^{n}}\\le\\sqrt[n]{2^{n}+3^{n}}\\le\\sqrt[n]{2\\cdot3^{n}}=3\\sqrt[n]{2}\\to3$，夹逼得极限 $=3$。",
      altAnswer: "提取最大项：$$\\sqrt[n]{2^n+3^n}=3\\sqrt[n]{1+\\left(\\tfrac23\\right)^n}\\to3\\cdot1=3$$比构造双边夹逼更直接。",
      traps: "夹逼准则要求两边极限存在且相等；放缩过松使两边极限不等时夹逼失败，需换更紧的放缩。",
      src: { card: "lim12", note: "卡片例题（data/math3.js 的 EXAMPLE[\"lim12\"]）来源原文：2003 年数三真题。traps 取自 PITFALL[lim12]。MNEM[lim12] 无条目 → 省略 hint 字段。" }
    },
    {
      id: "cv-m3-inf01", origin: 'card', year: 2011, school: "全国硕士研究生入学统一考试-数学三 2011 年", no: "卡片 inf01", type: "limit", star: 5,
      tags: ["inf01"],
      stem: "（2011 数三）当 $x\\to0$ 时，$3\\sin x-\\sin 3x$ 与 $c x^{k}$ 为等价无穷小，求 $k$ 与 $c$ 的值。",
      answer: "由 $\\sin 3x=3\\sin x-4\\sin^{3}x$ 得$$3\\sin x-\\sin 3x=4\\sin^{3}x\\sim4x^{3}$$故与 $4x^{3}$ 等价，$k=3,\\ c=4$。",
      traps: "等价无穷小只能整体替换乘除因式；加减项不能分别替换（如 $\\sin x-\\tan x$ 不能换成 $x-x=0$）。",
      src: { card: "inf01", note: "卡片例题（data/math3.js 的 EXAMPLE[\"inf01\"]）来源原文：2011 年数三真题。traps 取自 PITFALL[inf01]。MNEM[inf01] 无条目 → 省略 hint 字段。" }
    },
    {
      id: "cv-m3-inf06", origin: 'card', year: 2021, school: "全国硕士研究生招生考试-数学三 2021 年", no: "卡片 inf06", type: "limit", star: 5,
      tags: ["inf06"],
      stem: "求 $\\lim_{x\\to0}\\frac{e^{x}-e^{\\sin x}}{x-\\sin x}$（综合：$e^{x}-1\\sim x$ 与 $\\sin x\\sim x$）",
      answer: "$$e^{x}-e^{\\sin x}=e^{\\sin x}\\left(e^{x-\\sin x}-1\\right)$$令 $t=x-\\sin x\\to0$，则 $e^{t}-1\\sim t$，故$$\\lim_{x\\to0}\\frac{e^{x}-e^{\\sin x}}{x-\\sin x}=\\lim_{x\\to0}e^{\\sin x}\\cdot\\frac{e^{x-\\sin x}-1}{x-\\sin x}=e^{0}\\cdot1=1$$",
      altAnswer: "对 $f(u)=e^u$ 在 $[\\sin x,x]$ 用拉格朗日中值：$$e^x-e^{\\sin x}=e^{\\xi}(x-\\sin x),\\quad \\xi\\ \\text{介于}\\ \\sin x\\ \\text{与}\\ x\\ \\text{之间}$$当 $x\\to0$ 时 $\\xi\\to0$，故$$\\lim_{x\\to0}\\frac{e^x-e^{\\sin x}}{x-\\sin x}=\\lim_{x\\to0}e^{\\xi}=1$$",
      traps: "$e^u-1\\sim u$ 要求 $u\\to0$；$e^{x-\\sin x}-1\\sim x-\\sin x$ 而非 $\\sim x$，先确认括号内趋于 0。",
      src: { card: "inf06", note: "卡片例题（data/math3.js 的 EXAMPLE[\"inf06\"]）来源原文：2021 年数三真题。traps 取自 PITFALL[inf06]。MNEM[inf06] 无条目 → 省略 hint 字段。" }
    },
    {
      id: "cv-m3-dr02", origin: 'card', year: 2012, school: "全国硕士研究生入学统一考试-数学三 2012 年", no: "卡片 dr02", type: "deriv", star: 5,
      tags: ["dr02"],
      stem: "设 $f(x)=(e^{x}-1)(e^{2x}-2)\\cdots(e^{nx}-n)$，其中 $n$ 为正整数，求 $f'(0)$",
      answer: "由乘积求导法则，$f'(0)$ 为各项分别求导后其余项取 $x=0$ 的值之和。当 $x=0$ 时 $e^{kx}-k=1-k$，故除第一项 $(e^{x}-1)$（其值为 $0$）外，其余各项求导产生的乘积都含因子 $(e^{x}-1)\\big|_{x=0}=0$。故$$f'(0)=(e^{x})'\\big|_{x=0}\\cdot(1-2)(1-3)\\cdots(1-n)=(-1)^{n-1}(n-1)!$$",
      altAnswer: "由定义 $f'(0)=\\lim_{x\\to0}\\frac{f(x)-f(0)}{x}$，而 $f(0)=0$（首因子 $(e^x-1)|_{x=0}=0$）。故$$f'(0)=\\lim_{x\\to0}\\frac{e^x-1}{x}\\cdot(e^{2x}-2)\\cdots(e^{nx}-n)=1\\cdot(1-2)\\cdots(1-n)=(-1)^{n-1}(n-1)!$$",
      src: { card: "dr02", note: "卡片例题（data/math3.js 的 EXAMPLE[\"dr02\"]）来源原文：2012 年数三真题。PITFALL[dr02] 无条目 → 省略 traps 字段。MNEM[dr02] 无条目 → 省略 hint 字段。" }
    },
    {
      id: "cv-m3-int02", origin: 'card', year: 2026, school: "全国硕士研究生招生考试-数学三 2026 年", no: "卡片 int02", type: "integral", star: 5,
      tags: ["int02"],
      stem: "（2026 数三）$\\int_{0}^{1}x(x-1)\\left(x-\\dfrac{1}{2}\\right)dx=$____",
      answer: "令 $u=x-\\dfrac12$，则 $x=u+\\dfrac12,\\ x-1=u-\\dfrac12,\\ x-\\dfrac12=u$，故$$I=\\int_{-1/2}^{1/2}u\\left(u+\\frac12\\right)\\left(u-\\frac12\\right)du=\\int_{-1/2}^{1/2}u\\left(u^{2}-\\frac14\\right)du$$被积函数 $u^{3}-\\frac14 u$ 为奇函数，在对称区间上积分为 $0$。故 $I=0$。",
      src: { card: "int02", note: "卡片例题（data/math3.js 的 EXAMPLE[\"int02\"]）来源原文：2026 年数三真题。PITFALL[int02] 无条目 → 省略 traps 字段。MNEM[int02] 无条目 → 省略 hint 字段。" }
    },
    {
      id: "cv-m3-int03", origin: 'card', year: 2025, school: "全国硕士研究生招生考试-数学三 2025 年", no: "卡片 int03", type: "integral", star: 5,
      tags: ["int03"],
      stem: "（2025 数三）设 $\\int_{1}^{+\\infty}\\dfrac{a}{x(2x+a)}\\,dx=\\ln 2$，则 $a=$ ____",
      answer: "由 $\\dfrac{a}{x(2x+a)}=\\dfrac{1}{x}-\\dfrac{2}{2x+a}$，得$$\\int_{1}^{+\\infty}\\left(\\frac{1}{x}-\\frac{2}{2x+a}\\right)dx=\\left[\\ln x-\\ln(2x+a)\\right]_{1}^{+\\infty}=\\left[\\ln\\frac{x}{2x+a}\\right]_{1}^{+\\infty}=\\ln\\frac12-\\ln\\frac{1}{2+a}=\\ln\\frac{2+a}{2}$$令其 $=\\ln 2$，得 $\\dfrac{2+a}{2}=2$，故 $a=2$。",
      traps: "$\\int\\frac1x dx=\\ln|x|+C$ 必须加绝对值；解微分方程或定积分时漏掉绝对值号会丢解或出错。",
      src: { card: "int03", note: "卡片例题（data/math3.js 的 EXAMPLE[\"int03\"]）来源原文：2025 年数三真题。traps 取自 PITFALL[int03]。MNEM[int03] 无条目 → 省略 hint 字段。" }
    },
    {
      id: "cv-m3-int23", origin: 'card', year: 2024, school: "全国硕士研究生招生考试-数学三 2024 年", no: "卡片 int23", type: "integral", star: 5,
      tags: ["int23"],
      stem: "（2024 数三）当 $x\\to0$ 时，$\\int_{0}^{x}\\dfrac{(1+t^{2})\\sin t^{2}}{1+\\cos^{2}t}\\,dt$ 与 $x^{k}$ 是同阶无穷小，则 $k=$____",
      answer: "当 $t\\to0$ 时 $\\sin t^{2}\\sim t^{2}$，$\\dfrac{1+t^{2}}{1+\\cos^{2}t}\\to\\dfrac12$，故被积函数 $\\sim\\dfrac{t^{2}}{2}$，于是$$\\int_{0}^{x}\\frac{(1+t^{2})\\sin t^{2}}{1+\\cos^{2}t}dt\\sim\\int_{0}^{x}\\frac{t^{2}}{2}dt=\\frac{x^{3}}{6}$$与 $x^{3}$ 同阶，$k=3$。",
      hint: "牛-莱公式：先找原函数，再「上限代入减下限代入」——$F(b)-F(a)$。",
      src: { card: "int23", note: "卡片例题（data/math3.js 的 EXAMPLE[\"int23\"][0]）来源原文：2024 年数三真题。PITFALL[int23] 无条目 → 省略 traps 字段。hint 取自 MNEM[int23]。" }
    },
    {
      id: "cv-m3-int23-2", origin: 'card', year: 2016, school: "全国硕士研究生招生考试-数学三 2016 年", no: "卡片 int23-2", type: "integral", star: 5,
      tags: ["int23"],
      stem: "（2016 数三）设函数 $f(x)=\\int_{0}^{1}|t^{2}-x^{2}|\\,dt$（$x>0$），求 $f(x)$ 的最小值点与最小值。",
      answer: "当 $0<x\\le1$ 时：$$f(x)=\\int_{0}^{x}(x^{2}-t^{2})dt+\\int_{x}^{1}(t^{2}-x^{2})dt=\\frac{4}{3}x^{3}-x^{2}+\\frac{1}{3}$$当 $x>1$ 时：$f(x)=\\int_{0}^{1}(x^{2}-t^{2})dt=x^{2}-\\dfrac13$。对 $0<x<1$：$f'(x)=4x^{2}-2x=2x(2x-1)$，驻点 $x=\\dfrac12$，且 $f''(x)=8x-2>0$；$x>1$ 时 $f'(x)=2x>0$。故 $x=\\dfrac12$ 为最小值点，最小值 $f\\left(\\dfrac12\\right)=\\dfrac{4}{3}\\cdot\\dfrac18-\\dfrac14+\\dfrac13=\\dfrac14$。",
      hint: "牛-莱公式：先找原函数，再「上限代入减下限代入」——$F(b)-F(a)$。",
      src: { card: "int23", note: "卡片例题（data/math3.js 的 EXAMPLE[\"int23\"][1]）来源原文：2016 年数三真题。PITFALL[int23] 无条目 → 省略 traps 字段。hint 取自 MNEM[int23]。" }
    },
    {
      id: "cv-m3-int26", origin: 'card', year: 2017, school: "全国硕士研究生招生考试-数学三 2017 年", no: "卡片 int26", type: "integral", star: 4,
      tags: ["int26"],
      stem: "（2017 数三）计算 $\\int_{-\\pi}^{\\pi}\\left(\\sin^{3}x+\\sqrt{\\pi^{2}-x^{2}}\\right)dx$",
      answer: "$\\sin^{3}x$ 是奇函数，在对称区间上积分为 $0$；$\\sqrt{\\pi^{2}-x^{2}}$ 表示上半圆，其面积为 $\\dfrac12\\pi\\cdot\\pi^{2}=\\dfrac{\\pi^{3}}{2}$，故$$\\int_{-\\pi}^{\\pi}\\left(\\sin^{3}x+\\sqrt{\\pi^{2}-x^{2}}\\right)dx=\\frac{\\pi^{3}}{2}$$",
      traps: "对称区间奇函数积分为 0 以积分存在为前提（反常积分先判敛）；偶函数才可翻倍。",
      src: { card: "int26", note: "卡片例题（data/math3.js 的 EXAMPLE[\"int26\"]）来源原文：2017 年数三真题。traps 取自 PITFALL[int26]。MNEM[int26] 无条目 → 省略 hint 字段。" }
    },
    {
      id: "cv-m3-int27", origin: 'card', year: 2026, school: "全国硕士研究生招生考试-数学三 2026 年", no: "卡片 int27", type: "integral", star: 4,
      tags: ["int27"],
      stem: "设 $p$ 为常数，求反常积分 $\\int_{0}^{+\\infty}\\frac{\\arctan x}{x^{p}(1+x)}\\,dx$ 收敛时 $p$ 的取值范围",
      answer: "分为 $[0,1]$ 与 $[1,+\\infty)$ 两段。当 $x\\to0^{+}$ 时，$\\arctan x\\sim x$，被积函数 $\\sim\\frac{x}{x^{p}}=\\frac{1}{x^{p-1}}$，由瑕积分 $\\int_{0}^{1}\\frac{dx}{x^{q}}$ 收敛 $\\iff q<1$，得 $p-1<1$，即 $p<2$。当 $x\\to+\\infty$ 时，$\\arctan x\\to\\frac{\\pi}{2}$，被积函数 $\\sim\\frac{\\pi/2}{x^{p+1}}$，由 $\\int_{1}^{+\\infty}\\frac{dx}{x^{q}}$ 收敛 $\\iff q>1$，得 $p+1>1$，即 $p>0$。综上 $0<p<2$。",
      traps: "无穷积分 $\\int_1^{+\\infty}\\frac{dx}{x^p}$ 收敛 $\\iff p>1$，瑕积分 $\\int_0^1\\frac{dx}{x^p}$ 收敛 $\\iff p<1$，方向相反勿混淆。",
      src: { card: "int27", note: "卡片例题（data/math3.js 的 EXAMPLE[\"int27\"]）来源原文：2026 年数三真题。traps 取自 PITFALL[int27]。MNEM[int27] 无条目 → 省略 hint 字段。" }
    },
    {
      id: "cv-m3-int29", origin: 'card', year: 2021, school: "全国硕士研究生招生考试-数学三 2021 年", no: "卡片 int29", type: "integral", star: 4,
      tags: ["int29"],
      stem: "设平面区域 $D$ 由曲线 $y=\\sqrt{x}\\sin(\\pi x)\\ (0\\le x\\le1)$ 与 $x$ 轴围成，求 $D$ 绕 $x$ 轴旋转所得旋转体的体积",
      answer: "$$V=\\pi\\int_{0}^{1}\\left[\\sqrt{x}\\sin(\\pi x)\\right]^{2}dx=\\pi\\int_{0}^{1}x\\sin^{2}(\\pi x)\\,dx$$由 $\\sin^{2}(\\pi x)=\\frac{1-\\cos(2\\pi x)}{2}$，得$$\\int_{0}^{1}x\\sin^{2}(\\pi x)\\,dx=\\frac12\\int_{0}^{1}x\\,dx-\\frac12\\int_{0}^{1}x\\cos(2\\pi x)\\,dx=\\frac14-0=\\frac14$$故$$V=\\frac{\\pi}{4}$$",
      src: { card: "int29", note: "卡片例题（data/math3.js 的 EXAMPLE[\"int29\"][0]）来源原文：2021 年数三真题。PITFALL[int29] 无条目 → 省略 traps 字段。MNEM[int29] 无条目 → 省略 hint 字段。" }
    },
    {
      id: "cv-m3-int29-2", origin: 'card', year: 2023, school: "全国硕士研究生招生考试-数学三 2023 年", no: "卡片 int29-2", type: "integral", star: 4,
      tags: ["int29"],
      stem: "（2023 数三）设平面区域 $D=\\{(x,y)\\mid 0\\le y\\le\\dfrac{1}{x\\sqrt{1+x^{2}}},\\ x\\ge1\\}$。(Ⅰ) 求 $D$ 的面积；(Ⅱ) 求 $D$ 绕 $x$ 轴旋转所得旋转体的体积。",
      answer: "(Ⅰ) $S=\\int_{1}^{+\\infty}\\dfrac{dx}{x\\sqrt{1+x^{2}}}$。令 $x=\\tan\\theta$，则 $S=\\int\\csc\\theta\\,d\\theta=\\ln\\frac{\\sqrt{1+x^{2}}-1}{x}$，故$$S=\\left[\\ln\\frac{\\sqrt{1+x^{2}}-1}{x}\\right]_{1}^{+\\infty}=0-\\ln(\\sqrt2-1)=\\ln(\\sqrt2+1)$$(Ⅱ) $$V=\\pi\\int_{1}^{+\\infty}\\dfrac{dx}{x^{2}(1+x^{2})}=\\pi\\int_{1}^{+\\infty}\\left(\\dfrac{1}{x^{2}}-\\dfrac{1}{1+x^{2}}\\right)dx=\\pi\\left[-\\frac1x-\\arctan x\\right]_{1}^{+\\infty}=\\pi\\left(-\\frac{\\pi}{2}\\right)-\\pi\\left(-1-\\frac{\\pi}{4}\\right)=\\pi\\left(1-\\frac{\\pi}{4}\\right)$$",
      src: { card: "int29", note: "卡片例题（data/math3.js 的 EXAMPLE[\"int29\"][1]）来源原文：2023 年数三真题。PITFALL[int29] 无条目 → 省略 traps 字段。MNEM[int29] 无条目 → 省略 hint 字段。" }
    },
    {
      id: "cv-m3-tay02", origin: 'card', year: 2002, school: "全国硕士研究生入学统一考试-数学三 2002 年", no: "卡片 tay02", type: "limit", star: 5,
      tags: ["tay02"],
      stem: "求 $\\lim_{x\\to0}\\frac{\\sin x-x}{x^{3}}$",
      answer: "由 $\\sin x=x-\\dfrac{x^{3}}{6}+o(x^{3})$，得$$\\lim_{x\\to0}\\frac{\\sin x-x}{x^{3}}=-\\frac{1}{6}$$",
      altAnswer: "三次洛必达：$$\\lim_{x\\to0}\\frac{\\sin x-x}{x^3}=\\lim_{x\\to0}\\frac{\\cos x-1}{3x^2}=\\lim_{x\\to0}\\frac{-\\sin x}{6x}=-\\frac16$$（中间步也可用 $1-\\cos x\\sim\\frac{x^2}{2}$ 加速）",
      src: { card: "tay02", note: "卡片例题（data/math3.js 的 EXAMPLE[\"tay02\"]）来源原文：2002 年数三真题。PITFALL[tay02] 无条目 → 省略 traps 字段。MNEM[tay02] 无条目 → 省略 hint 字段。" }
    },
    {
      id: "cv-m3-mvt01", origin: 'card', year: 2000, school: "全国硕士研究生入学统一考试-数学三 2000 年", no: "卡片 mvt01", type: "proof", star: 4,
      tags: ["mvt01"],
      stem: "设 $f(x)$ 在 $[0,\\pi]$ 上连续，且 $\\int_{0}^{\\pi}f(x)\\cos x\\,dx=\\int_{0}^{\\pi}f(x)\\sin x\\,dx=0$，证明 $f(x)$ 在 $(0,\\pi)$ 内至少有两个零点。（2000 年数三真题）",
      answer: "反证：由 $\\int_{0}^{\\pi}f\\sin x\\,dx=0$ 且 $\\sin x>0$，知 $f$ 在 $(0,\\pi)$ 内至少有一个零点；设其恰有一个零点 $x_{0}$。令 $g(x)=f(x)\\sin(x-x_{0})$，则 $g$ 在 $(0,\\pi)$ 上不变号且不恒为零，故 $\\int_{0}^{\\pi}g\\,dx\\neq0$。但 $\\sin(x-x_{0})=\\sin x\\cos x_{0}-\\cos x\\sin x_{0}$，由题设两积分为 $0$ 得 $\\int_{0}^{\\pi}g\\,dx=0$，矛盾。故至少两个零点。",
      src: { card: "mvt01", note: "卡片例题（data/math3.js 的 EXAMPLE[\"mvt01\"]）来源原文：2000 年数三真题。PITFALL[mvt01] 无条目 → 省略 traps 字段。MNEM[mvt01] 无条目 → 省略 hint 字段。" }
    },
    {
      id: "cv-m3-ser01", origin: 'card', year: 2019, school: "全国硕士研究生招生考试-数学三 2019 年", no: "卡片 ser01", type: "integral", star: 5,
      tags: ["ser01"],
      stem: "（2019 数三）求曲线 $y=e^{-x}\\sin x\\ (x\\ge0)$ 与 $x$ 轴之间图形的面积。",
      answer: "分部积分得 $\\int e^{-x}\\sin x\\,dx=-\\dfrac{e^{-x}}2(\\sin x+\\cos x)+C$。在 $[n\\pi,(n+1)\\pi]$ 上 $|\\sin x|=(-1)^{n}\\sin x$，故第 $n$ 段面积为 $\\dfrac12\\left(e^{-n\\pi}+e^{-(n+1)\\pi}\\right)$。总面积是两个公比 $e^{-\\pi}$ 的几何级数之和：$$S=\\sum_{n=0}^{\\infty}\\frac12\\left(e^{-n\\pi}+e^{-(n+1)\\pi}\\right)=\\frac12\\left(\\frac{1}{1-e^{-\\pi}}+\\frac{e^{-\\pi}}{1-e^{-\\pi}}\\right)=\\frac{e^{\\pi}+1}{2(e^{\\pi}-1)}$$",
      src: { card: "ser01", note: "卡片例题（data/math3.js 的 EXAMPLE[\"ser01\"]）来源原文：2019 年数三真题。PITFALL[ser01] 无条目 → 省略 traps 字段。MNEM[ser01] 无条目 → 省略 hint 字段。" }
    },
    {
      id: "cv-m3-ode01", origin: 'card', year: 2015, school: "全国硕士研究生招生考试-数学三 2015 年", no: "卡片 ode01", type: "ode", star: 5,
      tags: ["ode01"],
      stem: "（2015 数三）设函数 $y=f(x)$ 可导且 $f(0)=2$。曲线 $y=f(x)$ 在点 $(x_0,f(x_0))$ 处的切线与 $x$ 轴交于点 $\\left(x_0-\\dfrac{f(x_0)}{f'(x_0)},0\\right)$，且该切线与 $x$ 轴及直线 $x=x_0$ 所围三角形的面积为 $4$，求 $f(x)$。",
      answer: "三角形面积 $=\\dfrac12\\cdot\\left|\\dfrac{f(x_0)}{f'(x_0)}\\right|\\cdot|f(x_0)|=4$，即 $\\dfrac{f^{2}}{|f'|}=8$，取 $y'=\\dfrac{y^{2}}{8}$（符号由面积取绝对值吸收）。分离变量：$$\\frac{dy}{y^{2}}=\\frac{dx}{8}\\ \\Rightarrow\\ -\\frac{1}{y}=\\frac{x}{8}+C$$由 $f(0)=2$ 得 $C=-\\frac12$，故$$f(x)=\\frac{8}{4-x}$$",
      src: { card: "ode01", note: "卡片例题（data/math3.js 的 EXAMPLE[\"ode01\"]）来源原文：2015 年数三真题。PITFALL[ode01] 无条目 → 省略 traps 字段。MNEM[ode01] 无条目 → 省略 hint 字段。" }
    },
    {
      id: "cv-m3-ode03", origin: 'card', year: 2019, school: "全国硕士研究生招生考试-数学三 2019 年", no: "卡片 ode03", type: "ode", star: 5,
      tags: ["ode03"],
      stem: "已知微分方程 $y''+ay'+by=ce^{x}$ 的通解为 $y=(C_{1}+C_{2}x)e^{-x}+e^{x}$，求 $a,b,c$",
      answer: "齐次通解 $(C_{1}+C_{2}x)e^{-x}$ 表明 $-1$ 是特征方程 $r^{2}+ar+b=0$ 的二重根，故特征方程为 $(r+1)^{2}=r^{2}+2r+1=0$，得 $a=2,\\ b=1$。又 $y^{*}=e^{x}$ 是非齐次方程的特解，代入 $y''+2y'+y$ 得 $(1+2+1)e^{x}=4e^{x}$，故 $c=4$。",
      traps: "特征方程重根时通解要乘 $x$（$y=(C_1+C_2x)e^{rx}$）；复根 $\\alpha\\pm\\beta i$ 对应 $e^{\\alpha x}(C_1\\cos\\beta x+C_2\\sin\\beta x)$，勿忘 $e^{\\alpha x}$。",
      src: { card: "ode03", note: "卡片例题（data/math3.js 的 EXAMPLE[\"ode03\"][0]）来源原文：2019 年数三真题。traps 取自 PITFALL[ode03]。MNEM[ode03] 无条目 → 省略 hint 字段。" }
    },
    {
      id: "cv-m3-ode03-2", origin: 'card', year: 2020, school: "全国硕士研究生招生考试-数学三 2020 年", no: "卡片 ode03-2", type: "ode", star: 5,
      tags: ["ode03"],
      stem: "（2020 数三）设函数 $y=f(x)$ 满足 $y''+2y'+5y=0$，$f(0)=1,\\ f'(0)=-1$，求 $f(x)$ 的表达式。",
      answer: "特征方程 $r^{2}+2r+5=0$，解得 $r=-1\\pm2i$，故$$f(x)=e^{-x}(C_{1}\\cos2x+C_{2}\\sin2x)$$由 $f(0)=C_{1}=1$。$f'(x)=e^{-x}\\left[(-C_{1}+2C_{2})\\cos2x+(-C_{2}-2C_{1})\\sin2x\\right]$，由 $f'(0)=-C_{1}+2C_{2}=-1$ 得 $-1+2C_{2}=-1$，即 $C_{2}=0$。故$$f(x)=e^{-x}\\cos2x$$",
      traps: "特征方程重根时通解要乘 $x$（$y=(C_1+C_2x)e^{rx}$）；复根 $\\alpha\\pm\\beta i$ 对应 $e^{\\alpha x}(C_1\\cos\\beta x+C_2\\sin\\beta x)$，勿忘 $e^{\\alpha x}$。",
      src: { card: "ode03", note: "卡片例题（data/math3.js 的 EXAMPLE[\"ode03\"][1]）来源原文：2020 年数三真题。traps 取自 PITFALL[ode03]。MNEM[ode03] 无条目 → 省略 hint 字段。" }
    },
    {
      id: "cv-m3-ode05", origin: 'card', year: 2026, school: "全国硕士研究生招生考试-数学三 2026 年", no: "卡片 ode05", type: "ode", star: 5,
      tags: ["ode05"],
      stem: "求微分方程 $y''-2y'=e^{x}$ 满足 $y(0)=1,\\ y'(0)=1$ 的特解",
      answer: "特征方程 $r^{2}-2r=0$ 得 $r_{1}=0,\\ r_{2}=2$，齐次通解 $y=C_{1}+C_{2}e^{2x}$。设特解 $y^{*}=Ae^{x}$，代入得 $-Ae^{x}=e^{x}\\Rightarrow A=-1$，故通解 $y=C_{1}+C_{2}e^{2x}-e^{x}$。由 $y(0)=1$ 得 $C_{1}+C_{2}-1=1$；由 $y'(0)=1$ 得 $2C_{2}-1=1\\Rightarrow C_{2}=1,\\ C_{1}=1$。故$$y=1+e^{2x}-e^{x}$$",
      traps: "非齐次特解设 $x^k$ 时 $k$ 是 $\\lambda$ 作为特征根的重数；$k$ 取错会导致待定系数消不掉、求不出解。",
      src: { card: "ode05", note: "卡片例题（data/math3.js 的 EXAMPLE[\"ode05\"]）来源原文：2026 年数三真题。traps 取自 PITFALL[ode05]。MNEM[ode05] 无条目 → 省略 hint 字段。" }
    },
    {
      id: "cv-m3-multi01", origin: 'card', year: 2023, school: "全国硕士研究生招生考试-数学三 2023 年", no: "卡片 multi01", type: "multivar", star: 5,
      tags: ["multi01"],
      stem: "（2023 数三）已知函数 $f(x,y)$ 满足 $df(x,y)=\\dfrac{x\\,dy-y\\,dx}{x^{2}+y^{2}}$，$f(1,1)=\\dfrac{\\pi}{4}$，则 $f(\\sqrt3,3)=$ ____",
      answer: "由 $\\dfrac{x\\,dy-y\\,dx}{x^{2}+y^{2}}=d\\left(\\arctan\\dfrac{y}{x}\\right)$，故 $f(x,y)=\\arctan\\dfrac{y}{x}+C$。由 $f(1,1)=\\arctan1+C=\\dfrac{\\pi}{4}+C=\\dfrac{\\pi}{4}$ 得 $C=0$。于是$$f(\\sqrt3,3)=\\arctan\\frac{3}{\\sqrt3}=\\arctan\\sqrt3=\\frac{\\pi}{3}$$",
      src: { card: "multi01", note: "卡片例题（data/math3.js 的 EXAMPLE[\"multi01\"]）来源原文：2023 年数三真题。PITFALL[multi01] 无条目 → 省略 traps 字段。MNEM[multi01] 无条目 → 省略 hint 字段。" }
    },
    {
      id: "cv-m3-multi02", origin: 'card', year: 2023, school: "全国硕士研究生招生考试-数学三 2023 年", no: "卡片 multi02", type: "multivar", star: 5,
      tags: ["multi02"],
      stem: "已知可导函数 $y=y(x)$ 由方程 $a\\,e^{x}+y^{2}+y-\\ln(1+x)\\cos y+b=0$ 确定，且 $y(0)=0,\\ y'(0)=0$。(1) 求 $a,b$ 的值；(2) 判断 $x=0$ 是否为 $y(x)$ 的极值点",
      answer: "(1) 将 $x=0,y=0$ 代入方程得 $a+b=0$。方程两边对 $x$ 求导：$$a e^{x}+2yy'+y'-\\frac{\\cos y}{1+x}+\\ln(1+x)\\cdot y'\\sin y=0$$代入 $x=0,y=0,y'=0$ 得 $a-1=0$，故 $a=1,\\ b=-1$。(2) 再对 $x$ 求导，代入 $x=0,y=0,y'=0$ 并利用 $a=1$，得 $1+y''(0)+1=0$（两个 $1$ 分别来自 $e^{x}$ 项与 $\\frac{\\cos y}{1+x}$ 求导项），故 $y''(0)=-2<0$。由极值的第二充分条件，$x=0$ 为 $y(x)$ 的极大值点。",
      src: { card: "multi02", note: "卡片例题（data/math3.js 的 EXAMPLE[\"multi02\"]）来源原文：2023 年数三真题。PITFALL[multi02] 无条目 → 省略 traps 字段。MNEM[multi02] 无条目 → 省略 hint 字段。" }
    },
    {
      id: "cv-m3-dbi01", origin: 'card', year: 2026, school: "全国硕士研究生招生考试-数学三 2026 年", no: "卡片 dbi01", type: "dblint", star: 5,
      tags: ["dbi01"],
      stem: "设 $D=\\{(x,y)\\mid 0\\le x\\le1,\\ 0\\le y\\le1\\}$，计算 $\\iint_{D}\\frac{y}{(1+x^{2}+y^{2})^{3/2}}\\,dxdy$",
      answer: "化为累次积分并先对 $y$ 积分：$$\\iint_{D}\\frac{y}{(1+x^{2}+y^{2})^{3/2}}dxdy=\\int_{0}^{1}dx\\int_{0}^{1}\\frac{y}{(1+x^{2}+y^{2})^{3/2}}dy$$内层 $\\int\\frac{y}{(1+x^{2}+y^{2})^{3/2}}dy=-(1+x^{2}+y^{2})^{-1/2}$，故原式$$=\\int_{0}^{1}\\left[\\frac{1}{\\sqrt{1+x^{2}}}-\\frac{1}{\\sqrt{2+x^{2}}}\\right]dx=\\left[\\ln\\left(x+\\sqrt{1+x^{2}}\\right)-\\ln\\left(x+\\sqrt{2+x^{2}}\\right)\\right]_{0}^{1}=\\ln\\frac{2+\\sqrt2}{1+\\sqrt3}$$",
      src: { card: "dbi01", note: "卡片例题（data/math3.js 的 EXAMPLE[\"dbi01\"]）来源原文：2026 年数三真题。PITFALL[dbi01] 无条目 → 省略 traps 字段。MNEM[dbi01] 无条目 → 省略 hint 字段。" }
    },
    {
      id: "cv-m3-la01", origin: 'card', year: 2020, school: "全国硕士研究生招生考试-数学三 2020 年", no: "卡片 la01", type: "linalg", star: 5,
      tags: ["la01"],
      stem: "（2020 数三）行列式 $\\begin{vmatrix}a&0&-1&1\\\\0&a&1&-1\\\\-1&1&a&0\\\\1&-1&0&a\\end{vmatrix}=$____",
      answer: "把第 2 行加到第 1 行、第 3 行加到第 4 行：$$\\begin{vmatrix}a&0&-1&1\\\\0&a&1&-1\\\\-1&1&a&0\\\\1&-1&0&a\\end{vmatrix}=\\begin{vmatrix}a&a&0&0\\\\0&a&1&-1\\\\-1&1&a&0\\\\0&0&a&a\\end{vmatrix}$$按第一行展开并化简（两 $3\\times3$ 行列式）得 $a^{2}(a^{2}-4)$。",
      traps: "$|AB|=|A||B|$ 只对方阵成立；$|kA|=k^n|A|$（$n$ 阶），$|A+B|\\neq|A|+|B|$。",
      src: { card: "la01", note: "卡片例题（data/math3.js 的 EXAMPLE[\"la01\"][0]）来源原文：2020 年数三真题。traps 取自 PITFALL[la01]。MNEM[la01] 无条目 → 省略 hint 字段。" }
    },
    {
      id: "cv-m3-la01-2", origin: 'card', year: 2025, school: "全国硕士研究生招生考试-数学三 2025 年", no: "卡片 la01-2", type: "linalg", star: 5,
      tags: ["la01"],
      stem: "（2025 数三）已知 $f(x)=\\begin{vmatrix}2x+1&3&2x+1&1\\\\2x&-3&4x&-2\\\\2x+1&2&2x+1&1\\\\2x&-4&4x&-2\\end{vmatrix}$，$g(x)=\\begin{vmatrix}2x+1&1&2x+1&3\\\\5x+1&-2&4x&-3\\\\0&1&2x+1&2\\\\2x&-2&4x&-4\\end{vmatrix}$，则方程 $f(x)=g(x)$ 的不同的根的个数为____",
      answer: "对 $f(x)$：$r_1-r_3=(0,1,0,0)$，按第 1 行展开后剩下的 $3\\times3$ 行列式第 1、3 行相同，故 $f(x)\\equiv0$。对 $g(x)$：$r_1-r_3=(2x+1,0,0,1)$，按第 1 行展开得$$g(x)=(2x+1)\\begin{vmatrix}-2&4x&-3\\\\1&2x+1&2\\\\-2&4x&-4\\end{vmatrix}-\\begin{vmatrix}5x+1&-2&4x\\\\0&1&2x+1\\\\2x&-2&4x\\end{vmatrix}=-2x(4x+1)$$故 $f(x)=g(x)\\iff -2x(4x+1)=0$，有两个不同的根 $x=0,\\ x=-\\frac14$。",
      traps: "$|AB|=|A||B|$ 只对方阵成立；$|kA|=k^n|A|$（$n$ 阶），$|A+B|\\neq|A|+|B|$。",
      src: { card: "la01", note: "卡片例题（data/math3.js 的 EXAMPLE[\"la01\"][1]）来源原文：2025 年数三真题。traps 取自 PITFALL[la01]。MNEM[la01] 无条目 → 省略 hint 字段。" }
    },
    {
      id: "cv-m3-la01-3", origin: 'card', year: 2023, school: "全国硕士研究生招生考试-数学三 2023 年", no: "卡片 la01-3", type: "linalg", star: 5,
      tags: ["la01"],
      stem: "（2023 数三）已知线性方程组 $\\begin{cases}ax_1+x_3=1\\\\x_1+ax_2+x_3=0\\\\x_1+2x_2+ax_3=0\\\\ax_1+bx_2=2\\end{cases}$ 有解。若 $\\begin{vmatrix}a&0&1\\\\1&a&1\\\\1&2&a\\end{vmatrix}=4$，则 $\\begin{vmatrix}1&a&1\\\\1&2&a\\\\a&b&0\\end{vmatrix}=$____",
      answer: "记 $D_1=\\begin{vmatrix}a&0&1\\\\1&a&1\\\\1&2&a\\end{vmatrix}=(a-1)^{2}(a+2)=4$，得 $a=2$ 或 $a=-1$。由方程组有解，第 4 行是前 3 行的线性组合 $r_4=2r_1+\\beta r_2+\\gamma r_3$（右端 $2=2\\cdot1+0+0$），解得 $b=-4$（$a=2$）或 $b=\\dfrac72$（$a=-1$），代入$$\\begin{vmatrix}1&a&1\\\\1&2&a\\\\a&b&0\\end{vmatrix}=a^{3}-2a+b(1-a)$$两种情况均得 $8$。",
      traps: "$|AB|=|A||B|$ 只对方阵成立；$|kA|=k^n|A|$（$n$ 阶），$|A+B|\\neq|A|+|B|$。",
      src: { card: "la01", note: "卡片例题（data/math3.js 的 EXAMPLE[\"la01\"][2]）来源原文：2023 年数三真题。traps 取自 PITFALL[la01]。MNEM[la01] 无条目 → 省略 hint 字段。" }
    },
    {
      id: "cv-m3-la13", origin: 'card', year: 2022, school: "全国硕士研究生招生考试-数学三 2022 年", no: "卡片 la13", type: "eigen", star: 4,
      tags: ["la13"],
      stem: "设 $A$ 为 3 阶矩阵，$\\Lambda=\\operatorname{diag}(1,-1,0)$，则 $A$ 的特征值为 $1,-1,0$ 的充分必要条件是什么？",
      answer: "充分必要条件：$A$ 与 $\\Lambda$ 相似，即存在可逆矩阵 $P$，使 $A=P\\Lambda P^{-1}$。理由：3 阶矩阵 $A$ 有 3 个互异特征值 $1,-1,0$，故有 3 个线性无关的特征向量，从而可对角化，且相似于以其特征值为对角元的对角阵 $\\Lambda$；反之相似矩阵有相同特征值。注意：存在可逆 $P,Q$ 使 $A=P\\Lambda Q$ 是\"等价\"，存在可逆 $P$ 使 $A=P\\Lambda P^{T}$ 是\"合同\"，均非特征值条件。",
      src: { card: "la13", note: "卡片例题（data/math3.js 的 EXAMPLE[\"la13\"][0]）来源原文：2022 年数三真题。PITFALL[la13] 无条目 → 省略 traps 字段。MNEM[la13] 无条目 → 省略 hint 字段。" }
    },
    {
      id: "cv-m3-la13-2", origin: 'card', year: 2025, school: "全国硕士研究生招生考试-数学三 2025 年", no: "卡片 la13-2", type: "eigen", star: 4,
      tags: ["la13"],
      stem: "（2025 数三）「$A^{3}-A^{2}$ 可对角化」是「$A$ 可对角化」的（ ）(A) 充分不必要 (B) 必要不充分 (C) 充分必要 (D) 既不充分也不必要",
      answer: "若 $A$ 可对角化，则 $A$ 的多项式 $A^{3}-A^{2}=A^{2}(A-E)$ 也可对角化，故是必要条件。反之，取幂零 Jordan 块 $A=\\begin{pmatrix}0&1\\\\0&0\\end{pmatrix}$，则 $A^{2}=O$，$A^{3}-A^{2}=O$ 可对角化，但 $A$ 不可对角化，故不充分。选 (B)。",
      src: { card: "la13", note: "卡片例题（data/math3.js 的 EXAMPLE[\"la13\"][1]）来源原文：2025 年数三真题。PITFALL[la13] 无条目 → 省略 traps 字段。MNEM[la13] 无条目 → 省略 hint 字段。" }
    },
    {
      id: "cv-m3-dr09", origin: 'card', year: 2018, school: "全国硕士研究生招生考试-数学三 2018 年", no: "卡片 dr09", type: "deriv", star: 3,
      tags: ["dr09"],
      stem: "（2018 数三）设 $f(x)=\\cos\\sqrt{|x|}$，求 $f$ 在 $x=0$ 处的左、右导数，并判断 $f$ 在 $x=0$ 处是否可导。",
      answer: "用 $1-\\cos u\\sim\\frac{u^{2}}{2}$：$$f_+'(0)=\\lim_{x\\to0^{+}}\\frac{\\cos\\sqrt{x}-1}{x}=\\lim_{x\\to0^{+}}\\frac{-\\frac{x}{2}}{x}=-\\frac12,\\qquad f_-'(0)=\\lim_{x\\to0^{-}}\\frac{\\cos\\sqrt{-x}-1}{x}=\\lim_{x\\to0^{-}}\\frac{\\frac{x}{2}}{x}=\\frac12$$左右导数不相等，故 $f$ 在 $x=0$ 处不可导（即当年选择题的 D 选项）。",
      src: { card: "dr09", note: "卡片例题（data/math3.js 的 EXAMPLE[\"dr09\"]）来源原文：2018 年数三真题。PITFALL[dr09] 无条目 → 省略 traps 字段。MNEM[dr09] 无条目 → 省略 hint 字段。" }
    },
    {
      id: "cv-m3-int06", origin: 'card', year: 2024, school: "全国硕士研究生招生考试-数学三 2024 年", no: "卡片 int06", type: "integral", star: 5,
      tags: ["int06"],
      stem: "（2024 数三）设 $I=\\int_{\\alpha}^{\\alpha+k\\pi}|\\sin x|\\,dx$，$k$ 为整数，则 $I$ 的值（ ）(A) 只与 $\\alpha$ 有关；(B) 只与 $k$ 有关；(C) 与 $\\alpha$ 和 $k$ 均有关；(D) 与 $\\alpha$ 和 $k$ 均无关",
      answer: "$|\\sin x|$ 是以 $\\pi$ 为周期的函数，且 $\\int_{0}^{\\pi}|\\sin x|\\,dx=\\int_{0}^{\\pi}\\sin x\\,dx=2$。任意长度为 $k\\pi$ 的区间（无论起点如何）上 $|\\sin x|$ 的积分都等于 $k\\cdot2=2k$，仅取决于 $k$。故选 (B)。",
      src: { card: "int06", note: "卡片例题（data/math3.js 的 EXAMPLE[\"int06\"]）来源原文：2024 年数三真题。PITFALL[int06] 无条目 → 省略 traps 字段。MNEM[int06] 无条目 → 省略 hint 字段。" }
    },
    {
      id: "cv-m3-int18", origin: 'card', year: 2022, school: "全国硕士研究生招生考试-数学三 2022 年", no: "卡片 int18", type: "integral", star: 4,
      tags: ["int18"],
      stem: "（2022 数三）计算 $\\int_{0}^{2}\\dfrac{2x-4}{x^{2}+2x+4}\\,dx$",
      answer: "$2x-4=(2x+2)-6$，故$$\\int\\frac{2x-4}{x^{2}+2x+4}dx=\\ln(x^{2}+2x+4)-6\\int\\frac{dx}{(x+1)^{2}+3}=\\ln(x^{2}+2x+4)-2\\sqrt3\\arctan\\frac{x+1}{\\sqrt3}$$代入上下限：$$\\text{原式}=\\ln\\frac{12}{4}-2\\sqrt3\\left(\\arctan\\sqrt3-\\arctan\\frac{1}{\\sqrt3}\\right)=\\ln3-2\\sqrt3\\cdot\\frac{\\pi}{6}=\\ln3-\\frac{\\sqrt3\\,\\pi}{3}$$",
      src: { card: "int18", note: "卡片例题（data/math3.js 的 EXAMPLE[\"int18\"]）来源原文：2022 年数三真题。PITFALL[int18] 无条目 → 省略 traps 字段。MNEM[int18] 无条目 → 省略 hint 字段。" }
    },
    {
      id: "cv-m3-int19", origin: 'card', year: 2024, school: "全国硕士研究生招生考试-数学三 2024 年", no: "卡片 int19", type: "integral", star: 4,
      tags: ["int19"],
      stem: "（2024 数三）计算 $\\int_{2}^{+\\infty}\\dfrac{5}{x^{4}+3x^{2}-4}\\,dx$",
      answer: "$x^{4}+3x^{2}-4=(x^{2}-1)(x^{2}+4)$，设 $\\dfrac{5}{(x^{2}-1)(x^{2}+4)}=\\dfrac{A}{x^{2}-1}+\\dfrac{B}{x^{2}+4}$，解得 $A=1,\\ B=-1$。故$$\\int_{2}^{+\\infty}\\frac{5}{x^{4}+3x^{2}-4}dx=\\int_{2}^{+\\infty}\\frac{dx}{x^{2}-1}-\\int_{2}^{+\\infty}\\frac{dx}{x^{2}+4}=\\left[\\frac12\\ln\\frac{x-1}{x+1}-\\frac12\\arctan\\frac{x}{2}\\right]_{2}^{+\\infty}=\\frac12\\ln3-\\frac{\\pi}{8}$$",
      src: { card: "int19", note: "卡片例题（data/math3.js 的 EXAMPLE[\"int19\"]）来源原文：2024 年数三真题。PITFALL[int19] 无条目 → 省略 traps 字段。MNEM[int19] 无条目 → 省略 hint 字段。" }
    },
    {
      id: "cv-m3-int21", origin: 'card', year: 2023, school: "全国硕士研究生招生考试-数学三 2023 年", no: "卡片 int21", type: "integral", star: 4,
      tags: ["int21"],
      stem: "设 $f(x)=\\begin{cases}(x+1)\\cos x,&x>0\\\\ \\frac{1}{\\sqrt{1+x^{2}}},&x\\le0\\end{cases}$，求 $f(x)$ 的一个连续原函数 $F(x)$",
      answer: "当 $x>0$ 时，$$\\int(x+1)\\cos x\\,dx=(x+1)\\sin x+\\cos x+C_{2}$$当 $x\\le0$ 时，$$\\int\\frac{1}{\\sqrt{1+x^{2}}}\\,dx=\\ln\\left(x+\\sqrt{1+x^{2}}\\right)+C_{1}$$由原函数在 $x=0$ 处连续：$F(0^{-})=C_{1}$，$F(0^{+})=1+C_{2}$，故 $C_{1}=1+C_{2}$。取 $C_{2}=0,\\ C_{1}=1$，得$$F(x)=\\begin{cases}(x+1)\\sin x+\\cos x,&x>0\\\\ \\ln\\left(x+\\sqrt{1+x^{2}}\\right)+1,&x\\le0\\end{cases}$$",
      src: { card: "int21", note: "卡片例题（data/math3.js 的 EXAMPLE[\"int21\"]）来源原文：2023 年数三真题。PITFALL[int21] 无条目 → 省略 traps 字段。MNEM[int21] 无条目 → 省略 hint 字段。" }
    },
    {
      id: "cv-m3-tay03", origin: 'card', year: 2023, school: "全国硕士研究生招生考试-数学三 2023 年", no: "卡片 tay03", type: "limit", star: 5,
      tags: ["tay03"],
      stem: "（2023 数三）求 $\\lim_{x\\to\\infty}x^{2}\\left(2-x\\sin\\dfrac{1}{x}-\\cos\\dfrac{1}{x}\\right)$",
      answer: "令 $t=\\dfrac1x\\to0$，用 $\\sin t=t-\\dfrac{t^{3}}{6}+o(t^{3})$、$\\cos t=1-\\dfrac{t^{2}}{2}+o(t^{2})$：$$2-x\\sin\\frac1x-\\cos\\frac1x=2-\\frac{\\sin t}{t}-\\cos t=2-\\left(1-\\frac{t^{2}}{6}\\right)-\\left(1-\\frac{t^{2}}{2}\\right)+o(t^{2})=\\frac23 t^{2}+o(t^{2})$$故$$\\lim_{x\\to\\infty}x^{2}\\left(2-x\\sin\\frac1x-\\cos\\frac1x\\right)=\\lim_{t\\to0}\\frac{\\frac23 t^{2}+o(t^{2})}{t^{2}}=\\frac23$$",
      src: { card: "tay03", note: "卡片例题（data/math3.js 的 EXAMPLE[\"tay03\"]）来源原文：2023 年数三真题。PITFALL[tay03] 无条目 → 省略 traps 字段。MNEM[tay03] 无条目 → 省略 hint 字段。" }
    },
    {
      id: "cv-m3-ser05", origin: 'card', year: 2025, school: "全国硕士研究生招生考试-数学三 2025 年", no: "卡片 ser05", type: "series", star: 4,
      tags: ["ser05"],
      stem: "（2025 数三）已知 $k$ 为常数，判断级数 $\\sum_{n=1}^{\\infty}(-1)^{n}\\left[\\dfrac{1}{n}-\\ln\\left(1+\\dfrac{k}{n^{2}}\\right)\\right]$ 的敛散性（绝对收敛 / 条件收敛 / 发散）",
      answer: "当 $n\\to\\infty$ 时 $\\ln\\left(1+\\dfrac{k}{n^{2}}\\right)\\sim\\dfrac{k}{n^{2}}$，故原级数 $=\\sum_{n=1}^{\\infty}\\dfrac{(-1)^{n}}{n}-k\\sum_{n=1}^{\\infty}\\dfrac{(-1)^{n}}{n^{2}}$。其中 $\\sum\\dfrac{(-1)^{n}}{n}$ 条件收敛（莱布尼茨），$\\sum\\dfrac{(-1)^{n}}{n^{2}}$ 绝对收敛（$p=2>1$），二者之和条件收敛，与 $k$ 取值无关。",
      traps: "莱布尼茨判别法需同时满足 $u_n$ 单调递减且 $\\lim u_n=0$，两者缺一不可（单调性只需从某一项起成立）；它是充分条件，条件不满足时交错级数仍可能收敛，需另换方法。",
      src: { card: "ser05", note: "卡片例题（data/math3.js 的 EXAMPLE[\"ser05\"]）来源原文：2025 年数三真题。traps 取自 PITFALL[ser05]。MNEM[ser05] 无条目 → 省略 hint 字段。" }
    },
    {
      id: "cv-m3-ser12", origin: 'card', year: 2023, school: "全国硕士研究生招生考试-数学三 2023 年", no: "卡片 ser12", type: "series", star: 4,
      tags: ["ser12"],
      stem: "求幂级数 $\\sum_{n=0}^{\\infty}\\frac{x^{2n}}{(2n)!}$ 的和函数",
      answer: "由 $e^{x}=\\sum_{n=0}^{\\infty}\\frac{x^{n}}{n!}$ 与 $e^{-x}=\\sum_{n=0}^{\\infty}\\frac{(-x)^{n}}{n!}$，两式相加奇次项抵消：$$e^{x}+e^{-x}=2\\sum_{n=0}^{\\infty}\\frac{x^{2n}}{(2n)!}$$故$$\\sum_{n=0}^{\\infty}\\frac{x^{2n}}{(2n)!}=\\frac{e^{x}+e^{-x}}{2}=\\cosh x$$收敛半径 $R=+\\infty$。",
      src: { card: "ser12", note: "卡片例题（data/math3.js 的 EXAMPLE[\"ser12\"]）来源原文：2023 年数三真题。PITFALL[ser12] 无条目 → 省略 traps 字段。MNEM[ser12] 无条目 → 省略 hint 字段。" }
    },
    {
      id: "cv-m3-ode04", origin: 'card', year: 2021, school: "全国硕士研究生招生考试-数学三 2021 年", no: "卡片 ode04", type: "ode", star: 4,
      tags: ["ode04"],
      stem: "求差分方程 $\\Delta y_{t}=t$（即 $y_{t+1}-y_{t}=t$）的通解",
      answer: "齐次方程 $y_{t+1}-y_{t}=0$ 的通解为 $y_{t}=C$。设非齐次特解 $y_{t}^{*}=At^{2}+Bt$，则$$\\Delta y_{t}^{*}=A[(t+1)^{2}-t^{2}]+B[(t+1)-t]=2At+(A+B)=t$$得 $A=\\frac12,\\ B=-\\frac12$，特解 $y_{t}^{*}=\\frac{t^{2}-t}{2}$。故通解$$y_{t}=C+\\frac{t(t-1)}{2}$$",
      src: { card: "ode04", note: "卡片例题（data/math3.js 的 EXAMPLE[\"ode04\"]）来源原文：2021 年数三真题。PITFALL[ode04] 无条目 → 省略 traps 字段。MNEM[ode04] 无条目 → 省略 hint 字段。" }
    },
    {
      id: "cv-m3-multi04", origin: 'card', year: 2010, school: "全国硕士研究生入学统一考试-数学三 2010 年", no: "卡片 multi04", type: "multivar", star: 4,
      tags: ["multi04"],
      stem: "求函数 $u=xy+2yz$ 在约束条件 $x^{2}+y^{2}+z^{2}=10$ 下的最大值与最小值",
      answer: "构造 $L=xy+2yz+\\lambda(x^{2}+y^{2}+z^{2}-10)$，令各偏导为零：$$L_{x}=y+2\\lambda x=0,\\quad L_{y}=x+2z+2\\lambda y=0,\\quad L_{z}=2y+2\\lambda z=0$$联立 $x^{2}+y^{2}+z^{2}=10$ 解得驻点，如 $(1,\\sqrt5,2)$、$(-1,-\\sqrt5,2)$、$(1,\\sqrt5,-2)$、$(-1,-\\sqrt5,-2)$、$(2\\sqrt2,0,-\\sqrt2)$、$(-2\\sqrt2,0,\\sqrt2)$，对应 $u$ 值分别为 $\\pm5\\sqrt5$ 与 $0$。由实际问题必存在最值，故最大值 $5\\sqrt5$，最小值 $-5\\sqrt5$。",
      src: { card: "multi04", note: "卡片例题（data/math3.js 的 EXAMPLE[\"multi04\"]）来源原文：2010 年数三真题。PITFALL[multi04] 无条目 → 省略 traps 字段。MNEM[multi04] 无条目 → 省略 hint 字段。" }
    },
    {
      id: "cv-m3-multi05", origin: 'card', year: 2021, school: "全国硕士研究生招生考试-数学三 2021 年", no: "卡片 multi05", type: "multivar", star: 4,
      tags: ["multi05"],
      stem: "（2021 数三）设函数 $f(x,y)$ 可微，且 $f(x+1,e^{x})=x(x+1)^{2}$，$f(x,x^{2})=2x^{2}\\ln x$，则 $df(1,1)=$（ ）(A) $dx+dy$ (B) $dx-dy$ (C) $dy$ (D) $-dy$",
      answer: "两式分别对 $x$ 求导（复合函数链式法则）：$$f_1(x+1,e^x)+e^{x}f_2(x+1,e^x)=(x+1)^2+2x(x+1)$$$$f_1(x,x^2)+2x f_2(x,x^2)=4x\\ln x+2x$$分别取 $x=0$ 与 $x=1$（两处都涉及 $f(1,1)$）：$$f_1(1,1)+f_2(1,1)=1,\\qquad f_1(1,1)+2f_2(1,1)=2$$解得 $f_1(1,1)=0,\\ f_2(1,1)=1$，故 $df(1,1)=dy$，选 (C)。",
      src: { card: "multi05", note: "卡片例题（data/math3.js 的 EXAMPLE[\"multi05\"][0]）来源原文：2021 年数三真题。PITFALL[multi05] 无条目 → 省略 traps 字段。MNEM[multi05] 无条目 → 省略 hint 字段。" }
    },
    {
      id: "cv-m3-multi05-2", origin: 'card', year: 2016, school: "全国硕士研究生招生考试-数学三 2016 年", no: "卡片 multi05-2", type: "multivar", star: 4,
      tags: ["multi05"],
      stem: "（2016 数三）设 $z=z(x,y)$ 由方程 $(x+1)z-y^{2}=x^{2}f(x-z,y)$ 确定，其中 $f$ 具有连续偏导数，求 $dz\\big|_{(0,1)}$。",
      answer: "由原方程取 $x=0,y=1$ 得 $z(0,1)=1$。两边分别对 $x,y$ 求偏导：$$z+(x+1)z_x=2xf+x^{2}f_1'(1-z_x),\\qquad (x+1)z_y-2y=x^{2}\\bigl[-f_1'z_y+f_2'\\bigr]$$代入 $x=0,y=1,z=1$ 得 $z_x(0,1)=-1,\\ z_y(0,1)=2$，故$$dz\\big|_{(0,1)}=-dx+2dy$$",
      src: { card: "multi05", note: "卡片例题（data/math3.js 的 EXAMPLE[\"multi05\"][1]）来源原文：2016 年数三真题。PITFALL[multi05] 无条目 → 省略 traps 字段。MNEM[multi05] 无条目 → 省略 hint 字段。" }
    },
    {
      id: "cv-m3-dbi03", origin: 'card', year: 2025, school: "全国硕士研究生招生考试-数学三 2025 年", no: "卡片 dbi03", type: "dblint", star: 5,
      tags: ["dbi03"],
      stem: "设 $f(x)$ 连续，交换 $\\int_{0}^{1}dy\\int_{0}^{y}f(x)\\,dx$ 的积分次序并计算",
      answer: "积分区域为 $0\\le x\\le y\\le1$，交换次序：$$\\int_{0}^{1}dy\\int_{0}^{y}f(x)\\,dx=\\int_{0}^{1}dx\\int_{x}^{1}f(x)\\,dy=\\int_{0}^{1}(1-x)f(x)\\,dx$$",
      src: { card: "dbi03", note: "卡片例题（data/math3.js 的 EXAMPLE[\"dbi03\"]）来源原文：2025 年数三真题。PITFALL[dbi03] 无条目 → 省略 traps 字段。MNEM[dbi03] 无条目 → 省略 hint 字段。" }
    },
    {
      id: "cv-m3-la08", origin: 'card', year: 2024, school: "全国硕士研究生招生考试-数学三 2024 年", no: "卡片 la08", type: "linalg", star: 5,
      tags: ["la08"],
      stem: "（2024 数三）设 $A=\\begin{pmatrix}a+1&b&3\\\\a&\\frac{b}{2}&1\\\\1&1&2\\end{pmatrix}$，$M_{ij}$ 为 $a_{ij}$ 的余子式，若 $|A|=-\\dfrac12$ 且 $-M_{21}+M_{22}-M_{23}=0$，则（ ）(A) $a=1$ 或 $a=-\\dfrac32$；(B) $a=0$ 或 $a=\\dfrac32$；(C) $b=1$ 或 $b=-\\dfrac12$；(D) $b=-1$ 或 $a=\\dfrac12$",
      answer: "代数余子式 $A_{ij}=(-1)^{i+j}M_{ij}$，故 $-M_{21}+M_{22}-M_{23}=A_{21}+A_{22}+A_{23}$，它等于把 $A$ 的第 2 行换成 $(1,1,1)$ 后按第 2 行展开的行列式：$$\\begin{vmatrix}a+1&b&3\\\\1&1&1\\\\1&1&2\\end{vmatrix}=\\begin{vmatrix}a+1&b&3\\\\1&1&1\\\\0&0&1\\end{vmatrix}=a+1-b=0$$故 $b=a+1$。对 $|A|$ 先作 $r_{1}-r_{2}$ 再作 $r_{1}-r_{3}$：$$|A|=\\begin{vmatrix}a+1&b&3\\\\a&\\frac b2&1\\\\1&1&2\\end{vmatrix}=\\begin{vmatrix}0&\\frac b2-1&0\\\\a&\\frac b2&1\\\\1&1&2\\end{vmatrix}=-\\left(\\frac b2-1\\right)(2a-1)=-\\frac12$$即 $\\left(\\dfrac b2-1\\right)(2a-1)=\\dfrac12$。代入 $b=a+1$ 得 $\\dfrac{a-1}{2}(2a-1)=\\dfrac12$，即 $2a^{2}-3a=0$，故 $a=0$ 或 $a=\\dfrac32$，选 (B)。",
      src: { card: "la08", note: "卡片例题（data/math3.js 的 EXAMPLE[\"la08\"]）来源原文：2024 年数三真题。PITFALL[la08] 无条目 → 省略 traps 字段。MNEM[la08] 无条目 → 省略 hint 字段。" }
    },
    {
      id: "cv-m3-la10", origin: 'card', year: 2017, school: "全国硕士研究生招生考试-数学三 2017 年", no: "卡片 la10", type: "linalg", star: 5,
      tags: ["la10"],
      stem: "设 $\\alpha$ 为 3 维单位列向量，$E$ 为 3 阶单位矩阵，判断 $E-\\alpha\\alpha^{T}$ 是否可逆",
      answer: "因 $\\alpha^{T}\\alpha=1$，秩为 $1$ 的矩阵 $\\alpha\\alpha^{T}$ 的三个特征值为 $1,0,0$（其迹 $\\mathrm{tr}(\\alpha\\alpha^{T})=\\alpha^{T}\\alpha=1$）。故 $E-\\alpha\\alpha^{T}$ 的三个特征值为 $0,1,1$，于是$$|E-\\alpha\\alpha^{T}|=0\\times1\\times1=0$$所以 $E-\\alpha\\alpha^{T}$ 不可逆。",
      altAnswer: "由 $\\alpha^T\\alpha=1$，得$$(E-\\alpha\\alpha^T)\\alpha=\\alpha-\\alpha(\\alpha^T\\alpha)=\\alpha-\\alpha=0$$即非零向量 $\\alpha$ 满足 $(E-\\alpha\\alpha^T)\\alpha=0$，故 $E-\\alpha\\alpha^T$ 有非零解、不可逆，一行即证。",
      src: { card: "la10", note: "卡片例题（data/math3.js 的 EXAMPLE[\"la10\"]）来源原文：2017 年数三真题。PITFALL[la10] 无条目 → 省略 traps 字段。MNEM[la10] 无条目 → 省略 hint 字段。" }
    },
    {
      id: "cv-m3-la12", origin: 'card', year: 2019, school: "全国硕士研究生招生考试-数学三 2019 年", no: "卡片 la12", type: "eigen", star: 4,
      tags: ["la12"],
      stem: "设 $A$ 是 3 阶实对称矩阵，$E$ 为 3 阶单位矩阵，若 $A^{2}+A=2E$ 且 $|A|=4$，求二次型 $x^{T}Ax$ 的规范形",
      answer: "设 $\\lambda$ 为 $A$ 的特征值，由 $A^{2}+A=2E$ 得 $\\lambda^{2}+\\lambda=2$，即 $\\lambda=1$ 或 $-2$。又三个特征值之积 $=|A|=4$，故三个特征值只能为 $1,-2,-2$。于是二次型 $x^{T}Ax$ 的正惯性指数为 $1$、负惯性指数为 $2$，规范形为$$y_{1}^{2}-y_{2}^{2}-y_{3}^{2}$$",
      hint: "特征值三性质：迹=特征值之和、行列式=特征值之积、$A$ 可逆则特征值全非零。",
      src: { card: "la12", note: "卡片例题（data/math3.js 的 EXAMPLE[\"la12\"]）来源原文：2019 年数三真题。PITFALL[la12] 无条目 → 省略 traps 字段。hint 取自 MNEM[la12]。" }
    },
    {
      id: "cv-m3-la14", origin: 'card', year: 2011, school: "全国硕士研究生入学统一考试-数学三 2011 年", no: "卡片 la14", type: "eigen", star: 4,
      tags: ["la14"],
      stem: "（2011 数三）设 $A$ 为 3 阶实对称矩阵，$A$ 的各行元素之和为 $3$，且 $r(A)=1$，则二次型 $x^{T}Ax$ 在正交变换下的标准形为____",
      answer: "各行元素之和为 $3$，故 $A(1,1,1)^{T}=3(1,1,1)^{T}$，$3$ 是特征值。又 $r(A)=1$ 且 $A$ 为实对称矩阵，故另两个特征值为 $0,0$。正交变换下标准形的系数即特征值，故标准形为$$3y_{1}^{2}$$",
      src: { card: "la14", note: "卡片例题（data/math3.js 的 EXAMPLE[\"la14\"]）来源原文：2011 年数三真题。PITFALL[la14] 无条目 → 省略 traps 字段。MNEM[la14] 无条目 → 省略 hint 字段。" }
    },
    {
      id: "cv-m3-la17", origin: 'card', year: 2011, school: "全国硕士研究生入学统一考试-数学三 2011 年", no: "卡片 la17", type: "linalg", star: 4,
      tags: ["la17"],
      stem: "（2011 数三）设 $A$ 为 3 阶非零矩阵，$\\eta_1,\\eta_2,\\eta_3$ 是 $Ax=\\beta\\ (\\beta\\ne0)$ 的三个线性无关的解，写出 $Ax=\\beta$ 的通解。",
      answer: "$\\eta_2-\\eta_1,\\ \\eta_3-\\eta_1$ 是 $Ax=0$ 的两个线性无关的解，故 $3-r(A)\\ge2$，得 $r(A)\\le1$；又 $A\\ne O$ 得 $r(A)=1$，故 $Ax=0$ 的基础解系恰含 $2$ 个向量。又 $\\dfrac{\\eta_2+\\eta_3}{2}$ 是 $Ax=\\beta$ 的特解，通解为$$x=\\frac{\\eta_2+\\eta_3}{2}+k_1(\\eta_2-\\eta_1)+k_2(\\eta_3-\\eta_1)\\quad(k_1,k_2\\in\\mathbb R)$$",
      traps: "基础解系含 $n-r(A)$ 个向量而非 $r(A)$ 个，勿把自由变量个数与秩混淆。",
      src: { card: "la17", note: "卡片例题（data/math3.js 的 EXAMPLE[\"la17\"]）来源原文：2011 年数三真题。traps 取自 PITFALL[la17]。MNEM[la17] 无条目 → 省略 hint 字段。" }
    },
    {
      id: "cv-m3-ineq04", origin: 'card', year: 2010, school: "全国硕士研究生入学统一考试-数学三 2010 年", no: "卡片 ineq04", type: "proof", star: 4,
      tags: ["ineq04"],
      stem: "（2010 数三）设 $a_{n}=\\int_{0}^{1}\\bigl[\\ln(1+x)\\bigr]^{n}dx\\ (n=1,2,\\cdots)$。(Ⅰ) 证明 $0<a_{n}<\\dfrac{1}{n+1}$；(Ⅱ) 求 $\\lim_{n\\to\\infty}a_{n}$。",
      answer: "(Ⅰ) 当 $0<x<1$ 时由 $\\ln(1+x)<x$ 得 $0<[\\ln(1+x)]^{n}<x^{n}$，故$$0<a_{n}<\\int_{0}^{1}x^{n}dx=\\frac{1}{n+1}$$(Ⅱ) 由夹逼准则，$0<a_n<\\dfrac1{n+1}\\to0$，故 $\\lim_{n\\to\\infty}a_{n}=0$。",
      src: { card: "ineq04", note: "卡片例题（data/math3.js 的 EXAMPLE[\"ineq04\"]）来源原文：2010 年数三真题。PITFALL[ineq04] 无条目 → 省略 traps 字段。MNEM[ineq04] 无条目 → 省略 hint 字段。" }
    },
    {
      id: "cv-m3-lim06", origin: 'card', year: 2015, school: "全国硕士研究生招生考试-数学三 2015 年", no: "卡片 lim06", type: "limit", star: 4,
      tags: ["lim06"],
      stem: "（2015 数三）求极限 $\\lim_{x\\to0}\\dfrac{\\ln(\\cos x)}{x^{2}}$",
      answer: "用 $\\ln(1+u)\\sim u$ 与 $1-\\cos x\\sim\\dfrac{x^{2}}{2}$：$$\\ln(\\cos x)=\\ln\\bigl[1+(\\cos x-1)\\bigr]\\sim\\cos x-1\\sim-\\frac{x^{2}}{2}$$故$$\\lim_{x\\to0}\\frac{\\ln(\\cos x)}{x^{2}}=-\\frac{1}{2}$$",
      src: { card: "lim06", note: "卡片例题（data/math3.js 的 EXAMPLE[\"lim06\"]）来源原文：2015 年数三真题。PITFALL[lim06] 无条目 → 省略 traps 字段。MNEM[lim06] 无条目 → 省略 hint 字段。" }
    },
    {
      id: "cv-m3-lim08", origin: 'card', year: 2011, school: "全国硕士研究生入学统一考试-数学三 2011 年", no: "卡片 lim08", type: "limit", star: 4,
      tags: ["lim08"],
      stem: "（2011 数三）求极限 $\\lim_{x\\to0}\\dfrac{\\sqrt{1+2\\sin x}-1-x}{x\\ln(1+x)}$",
      answer: "展开：$$\\sqrt{1+2\\sin x}=1+\\frac{1}{2}(2\\sin x)-\\frac{1}{8}(2\\sin x)^{2}+o(x^{2})=1+\\sin x-\\frac{\\sin^{2}x}{2}+o(x^{2})$$故 $\\sqrt{1+2\\sin x}-1-x=\\sin x-\\dfrac{\\sin^{2}x}{2}-x=-\\dfrac{x^{2}}{2}+o(x^{2})$。又 $\\ln(1+x)\\sim x$，所以$$\\lim_{x\\to0}\\frac{\\sqrt{1+2\\sin x}-1-x}{x\\ln(1+x)}=\\lim_{x\\to0}\\frac{-\\frac{x^{2}}{2}+o(x^{2})}{x^{2}}=-\\frac{1}{2}$$",
      traps: "$(1+x)^{\\alpha}-1\\sim\\alpha x$ 中 $\\alpha$ 可为分数或负（如 $\\sqrt{1+x}-1\\sim\\frac{x}{2}$），替换后勿丢 $\\alpha$；且等价替换只用于乘除因式，加减式中含它的项不能分别替换。",
      hint: "$(1+x)^{\\alpha}-1\\sim\\alpha x$：把「1 的幂」看成「加 x 再开方/乘方」，指数 $\\alpha$ 直接提到前面。",
      src: { card: "lim08", note: "卡片例题（data/math3.js 的 EXAMPLE[\"lim08\"]）来源原文：2011 年数三真题。traps 取自 PITFALL[lim08]。hint 取自 MNEM[lim08]。" }
    },
    {
      id: "cv-m3-lim10", origin: 'card', year: 2016, school: "全国硕士研究生招生考试-数学三 2016 年", no: "卡片 lim10", type: "limit", star: 5,
      tags: ["lim10"],
      stem: "（2016 数三）求极限 $\\lim_{x\\to0}(\\cos 2x+2x\\sin x)^{\\frac{1}{x^{4}}}$",
      answer: "这是 $1^{\\infty}$ 型。由 $\\cos2x=1-2x^{2}+\\dfrac{2}{3}x^{4}+o(x^{4})$、$2x\\sin x=2x^{2}-\\dfrac{1}{3}x^{4}+o(x^{4})$ 得$$\\cos2x+2x\\sin x=1+\\frac{x^{4}}{3}+o(x^{4})$$故 $\\ln(\\cos2x+2x\\sin x)\\sim\\dfrac{x^{4}}{3}$，原式 $=e^{\\frac13}$。",
      src: { card: "lim10", note: "卡片例题（data/math3.js 的 EXAMPLE[\"lim10\"][0]）来源原文：2016 年数三真题。PITFALL[lim10] 无条目 → 省略 traps 字段。MNEM[lim10] 无条目 → 省略 hint 字段。" }
    },
    {
      id: "cv-m3-lim10-2", origin: 'card', year: 2022, school: "全国硕士研究生招生考试-数学三 2022 年", no: "卡片 lim10-2", type: "limit", star: 5,
      tags: ["lim10"],
      stem: "（2022 数三）求极限 $\\lim_{x\\to0}\\left(\\dfrac{1+e^{x}}{2}\\right)^{\\cot x}$",
      answer: "这是 $1^{\\infty}$ 型。由 $e^{x}-1\\sim x$：$$\\ln\\frac{1+e^{x}}{2}=\\ln\\left(1+\\frac{e^{x}-1}{2}\\right)\\sim\\frac{e^{x}-1}{2}\\sim\\frac{x}{2}$$又 $\\cot x\\sim\\dfrac1x$，故对数极限 $=\\dfrac12$，原式 $=e^{\\frac12}=\\sqrt{e}$。",
      src: { card: "lim10", note: "卡片例题（data/math3.js 的 EXAMPLE[\"lim10\"][1]）来源原文：2022 年数三真题。PITFALL[lim10] 无条目 → 省略 traps 字段。MNEM[lim10] 无条目 → 省略 hint 字段。" }
    },
    {
      id: "cv-m3-lim16", origin: 'card', year: 2024, school: "全国硕士研究生招生考试-数学三 2024 年", no: "卡片 lim16", type: "limit", star: 3,
      tags: ["lim16"],
      stem: "设 $f(x)=\\lim_{n\\to\\infty}\\frac{1+x}{1+x^{2n}}$，讨论 $f(x)$ 在 $x=1$ 与 $x=-1$ 处的连续性",
      answer: "当 $|x|<1$ 时 $x^{2n}\\to0$，故 $f(x)=1+x$；当 $|x|>1$ 时 $x^{2n}\\to\\infty$，故 $f(x)=0$；且 $f(1)=1,\\ f(-1)=0$。在 $x=-1$ 处：$$\\lim_{x\\to-1^{-}}f(x)=0,\\quad\\lim_{x\\to-1^{+}}f(x)=\\lim_{x\\to-1^{+}}(1+x)=0=f(-1)$$故连续。在 $x=1$ 处：$$\\lim_{x\\to1^{-}}f(x)=2,\\quad\\lim_{x\\to1^{+}}f(x)=0$$左右极限不相等，故 $f(x)$ 在 $x=1$ 处不连续（跳跃间断点）。",
      src: { card: "lim16", note: "卡片例题（data/math3.js 的 EXAMPLE[\"lim16\"]）来源原文：2024 年数三真题。PITFALL[lim16] 无条目 → 省略 traps 字段。MNEM[lim16] 无条目 → 省略 hint 字段。" }
    },
    {
      id: "cv-m3-lim17", origin: 'card', year: 2020, school: "全国硕士研究生招生考试-数学三 2020 年", no: "卡片 lim17", type: "limit", star: 4,
      tags: ["lim17"],
      stem: "（2020 数三）设 $f(x)=\\dfrac{e^{\\frac{1}{x+1}}\\ln|1+x|}{(e^{x}-1)(x-2)}$，则 $f(x)$ 的第二类间断点的个数为（ ）(A) 1 (B) 2 (C) 3 (D) 4",
      answer: "间断点只可能是 $x=-1,0,2$（$x=1$ 处除数分母均非零，$f(1)$ 有定义，非间断点）。$x=-1$：$e^{1/(x+1)}\\to\\infty$，$\\ln|1+x|\\to-\\infty$，$f\\to-\\infty$，第二类；$x=0$：由 $e^{x}-1\\sim x$、$\\ln(1+x)\\sim x$ 得 $\\lim_{x\\to0}f(x)=\\lim_{x\\to0}\\dfrac{e\\cdot x}{(x)(-2)}=-\\dfrac{e}{2}$，为可去间断点（第一类）；$x=2$：分母趋于 $0$ 而分子 $e^{1/3}\\ln3$ 有限非零，$f\\to\\infty$，第二类。故第二类间断点有 $2$ 个，选 (B)。",
      src: { card: "lim17", note: "卡片例题（data/math3.js 的 EXAMPLE[\"lim17\"]）来源原文：2020 年数三真题。PITFALL[lim17] 无条目 → 省略 traps 字段。MNEM[lim17] 无条目 → 省略 hint 字段。" }
    },
    {
      id: "cv-m3-inf09", origin: 'card', year: 2016, school: "全国硕士研究生招生考试-数学三 2016 年", no: "卡片 inf09", type: "limit", star: 5,
      tags: ["inf09"],
      stem: "已知 $\\lim_{x\\to0}\\frac{\\sqrt{1+f(x)\\sin 2x}-1}{e^{3x}-1}=2$，求 $\\lim_{x\\to0}f(x)$",
      answer: "当 $x\\to0$ 时，$\\sqrt{1+u}-1\\sim\\frac12 u$，故 $\\sqrt{1+f(x)\\sin2x}-1\\sim\\frac12 f(x)\\sin2x$；又 $\\sin2x\\sim2x$、$e^{3x}-1\\sim3x$。故$$2=\\lim_{x\\to0}\\frac{\\frac12 f(x)\\cdot2x}{3x}=\\lim_{x\\to0}\\frac{f(x)}{3}\\ \\Rightarrow\\ \\lim_{x\\to0}f(x)=6$$",
      src: { card: "inf09", note: "卡片例题（data/math3.js 的 EXAMPLE[\"inf09\"]）来源原文：2016 年数三真题。PITFALL[inf09] 无条目 → 省略 traps 字段。MNEM[inf09] 无条目 → 省略 hint 字段。" }
    },
    {
      id: "cv-m3-inf10", origin: 'card', year: 2026, school: "全国硕士研究生招生考试-数学三 2026 年", no: "卡片 inf10", type: "limit", star: 4,
      tags: ["inf10"],
      stem: "（2026 数三）$\\lim_{x\\to0}\\dfrac{1}{x}\\left(\\dfrac{\\sqrt{1+x^{2}}}{\\sin x}-\\dfrac{1}{\\tan x}\\right)=$____",
      answer: "$$\\frac{\\sqrt{1+x^{2}}}{\\sin x}-\\frac{1}{\\tan x}=\\frac{\\sqrt{1+x^{2}}-\\cos x}{\\sin x}$$用 $\\sqrt{1+x^{2}}=1+\\frac{x^{2}}{2}+o(x^{2})$、$\\cos x=1-\\frac{x^{2}}{2}+o(x^{2})$ 得分子 $\\sqrt{1+x^{2}}-\\cos x=x^{2}+o(x^{2})$，又 $\\sin x\\sim x$，故$$\\text{原式}=\\lim_{x\\to0}\\frac{x^{2}+o(x^{2})}{x\\cdot x}=1$$",
      src: { card: "inf10", note: "卡片例题（data/math3.js 的 EXAMPLE[\"inf10\"]）来源原文：2026 年数三真题。PITFALL[inf10] 无条目 → 省略 traps 字段。MNEM[inf10] 无条目 → 省略 hint 字段。" }
    },
    {
      id: "cv-m3-inf11", origin: 'card', year: 2019, school: "全国硕士研究生招生考试-数学三 2019 年", no: "卡片 inf11", type: "limit", star: 3,
      tags: ["inf11"],
      stem: "当 $x\\to0$ 时，$x-\\tan x$ 与 $x^{k}$ 是同阶无穷小，求 $k$",
      answer: "由 $\\tan x=x+\\frac{x^{3}}{3}+o(x^{3})$ 得 $x-\\tan x=-\\frac{x^{3}}{3}+o(x^{3})\\sim-\\frac{x^{3}}{3}$，故 $x-\\tan x$ 与 $x^{3}$ 同阶，$k=3$。",
      src: { card: "inf11", note: "卡片例题（data/math3.js 的 EXAMPLE[\"inf11\"]）来源原文：2019 年数三真题。PITFALL[inf11] 无条目 → 省略 traps 字段。MNEM[inf11] 无条目 → 省略 hint 字段。" }
    },
    {
      id: "cv-m3-mvt04", origin: 'card', year: 2023, school: "全国硕士研究生招生考试-数学三 2023 年", no: "卡片 mvt04", type: "proof", star: 4,
      tags: ["mvt04"],
      stem: "（2023 数三）设函数 $f(x)$ 在 $[-a,a]$ 上具有 2 阶连续导数，证明：(Ⅰ) 若 $f(0)=0$，则存在 $\\xi\\in(-a,a)$，使 $f''(\\xi)=\\dfrac{1}{a^{2}}[f(a)+f(-a)]$；(Ⅱ) 若 $f(x)$ 在 $(-a,a)$ 内取得极值，则存在 $\\eta\\in(-a,a)$，使 $|f''(\\eta)|\\ge\\dfrac{1}{2a^{2}}|f(a)-f(-a)|$",
      answer: "(Ⅰ) 由泰勒公式（$f(0)=0$）：$$f(a)=f'(0)a+\\frac{f''(\\xi_{1})}{2}a^{2},\\qquad f(-a)=-f'(0)a+\\frac{f''(\\xi_{2})}{2}a^{2}$$其中 $\\xi_{1}\\in(0,a),\\ \\xi_{2}\\in(-a,0)$。两式相加得 $f(a)+f(-a)=\\dfrac{f''(\\xi_{1})+f''(\\xi_{2})}{2}a^{2}$。因 $f''$ 连续，由介值定理存在 $\\xi\\in(\\xi_{2},\\xi_{1})$ 使 $f''(\\xi)=\\dfrac{f''(\\xi_{1})+f''(\\xi_{2})}{2}=\\dfrac{f(a)+f(-a)}{a^{2}}$。(Ⅱ) 设 $f$ 在 $x_{0}\\in(-a,a)$ 取极值，则 $f'(x_{0})=0$。由泰勒公式：$$f(a)=f(x_{0})+\\frac{f''(\\xi_{1})}{2}(a-x_{0})^{2},\\qquad f(-a)=f(x_{0})+\\frac{f''(\\xi_{2})}{2}(a+x_{0})^{2}$$相减得 $f(a)-f(-a)=\\dfrac12\\left[f''(\\xi_{1})(a-x_{0})^{2}-f''(\\xi_{2})(a+x_{0})^{2}\\right]$。取 $|f''(\\eta)|=\\max\\{|f''(\\xi_{1})|,|f''(\\xi_{2})|\\}$，则$$|f(a)-f(-a)|\\le\\frac{|f''(\\eta)|}{2}\\left[(a-x_{0})^{2}+(a+x_{0})^{2}\\right]=|f''(\\eta)|(a^{2}+x_{0}^{2})\\le2a^{2}|f''(\\eta)|$$故 $|f''(\\eta)|\\ge\\dfrac{1}{2a^{2}}|f(a)-f(-a)|$。",
      src: { card: "mvt04", note: "卡片例题（data/math3.js 的 EXAMPLE[\"mvt04\"]）来源原文：2023 年数三真题。PITFALL[mvt04] 无条目 → 省略 traps 字段。MNEM[mvt04] 无条目 → 省略 hint 字段。" }
    },
    {
      id: "cv-m3-ser09", origin: 'card', year: 2019, school: "全国硕士研究生招生考试-数学三 2019 年", no: "卡片 ser09", type: "series", star: 3,
      tags: ["ser09"],
      stem: "（2019 数三）$\\lim_{n\\to\\infty}\\left(\\dfrac{1}{1\\cdot2}+\\dfrac{1}{2\\cdot3}+\\cdots+\\dfrac{1}{n(n+1)}\\right)=$____",
      answer: "裂项 $\\dfrac{1}{k(k+1)}=\\dfrac1k-\\dfrac1{k+1}$，前 $N$ 项和$$S_{N}=\\left(1-\\frac12\\right)+\\left(\\frac12-\\frac13\\right)+\\cdots+\\left(\\frac1N-\\frac1{N+1}\\right)=1-\\frac{1}{N+1}$$故 $\\lim_{n\\to\\infty}S_{n}=1$。",
      src: { card: "ser09", note: "卡片例题（data/math3.js 的 EXAMPLE[\"ser09\"]）来源原文：2019 年数三真题。PITFALL[ser09] 无条目 → 省略 traps 字段。MNEM[ser09] 无条目 → 省略 hint 字段。" }
    },
    {
      id: "cv-m3-ser11", origin: 'card', year: 2020, school: "全国硕士研究生招生考试-数学三 2020 年", no: "卡片 ser11", type: "series", star: 3,
      tags: ["ser11"],
      stem: "（2020 数三）设幂级数 $\\sum_{n=1}^{\\infty}n a_{n}(x-2)^{n}$ 的收敛区间为 $(-2,6)$，则 $\\sum_{n=1}^{\\infty}a_{n}(x+1)^{2n}$ 的收敛区间为（ ）(A) $(-2,6)$ (B) $(-3,1)$ (C) $(-5,3)$ (D) $(-17,15)$",
      answer: "$\\sum na_n(x-2)^n$ 的中心为 $2$、半径为 $4$，故 $\\sum a_n u^n$ 的收敛半径 $R=4$（乘因子 $n$ 不改变半径）。令 $u=(x+1)^{2}$：$|(x+1)^{2}|<4\\Rightarrow |x+1|<2\\Rightarrow -3<x<1$，收敛区间 $(-3,1)$，选 (B)。",
      src: { card: "ser11", note: "卡片例题（data/math3.js 的 EXAMPLE[\"ser11\"]）来源原文：2020 年数三真题。PITFALL[ser11] 无条目 → 省略 traps 字段。MNEM[ser11] 无条目 → 省略 hint 字段。" }
    },
    {
      id: "cv-m3-la07", origin: 'card', year: 2025, school: "全国硕士研究生招生考试-数学三 2025 年", no: "卡片 la07", type: "linalg", star: 3,
      tags: ["la07"],
      stem: "（2025 数三）已知 $A$ 是 $m\\times n$ 矩阵，$\\beta$ 是 $m$ 维非零向量。若 $A$ 有 $k$ 阶非零子式，则（ ）(A) 当 $k=m$ 时 $Ax=\\beta$ 有解；(B) 当 $k=m$ 时 $Ax=\\beta$ 无解；(C) 当 $k<m$ 时 $Ax=\\beta$ 有解；(D) 当 $k<m$ 时 $Ax=\\beta$ 无解",
      answer: "非零子式的最高阶数即矩阵的秩，故 $k$ 阶非零子式意味着 $r(A)\\ge k$。当 $k=m$ 时，$r(A)=m$（$m\\times n$ 矩阵的秩不超过行数 $m$），即 $A$ 行满秩，增广矩阵 $(A\\mid\\beta)$ 的秩也等于 $m=r(A)$，故 $Ax=\\beta$ 必有解，选 (A)。",
      src: { card: "la07", note: "卡片例题（data/math3.js 的 EXAMPLE[\"la07\"]）来源原文：2025 年数三真题。PITFALL[la07] 无条目 → 省略 traps 字段。MNEM[la07] 无条目 → 省略 hint 字段。" }
    },
    {
      id: "cv-m3-la09", origin: 'card', year: 2025, school: "全国硕士研究生招生考试-数学三 2025 年", no: "卡片 la09", type: "eigen", star: 4,
      tags: ["la09"],
      stem: "（2025 数三）设 $A=\\begin{pmatrix}1&2\\\\-2&-a\\end{pmatrix}$，$B=\\begin{pmatrix}1&0\\\\1&a\\end{pmatrix}$，若 $f(x,y)=|xA+yB|$ 是正定二次型，则 $a$ 的取值范围是（ ）",
      answer: "$$xA+yB=\\begin{pmatrix}x+y&2x\\\\-2x+y&-ax+ay\\end{pmatrix}$$故$$f(x,y)=\\begin{vmatrix}x+y&2x\\\\-2x+y&a(y-x)\\end{vmatrix}=(4-a)x^{2}-2xy+a\\,y^{2}$$对应对称矩阵 $\\begin{pmatrix}4-a&-1\\\\-1&a\\end{pmatrix}$ 正定：$4-a>0$ 且 $(4-a)a-1>0$，即 $a<4$ 且 $a^{2}-4a+1<0$，解得 $a\\in(2-\\sqrt3,\\ 2+\\sqrt3)$。",
      src: { card: "la09", note: "卡片例题（data/math3.js 的 EXAMPLE[\"la09\"]）来源原文：2025 年数三真题。PITFALL[la09] 无条目 → 省略 traps 字段。MNEM[la09] 无条目 → 省略 hint 字段。" }
    },
    {
      id: "cv-m3-la11", origin: 'card', year: 2019, school: "全国硕士研究生招生考试-数学三 2019 年", no: "卡片 la11", type: "linalg", star: 3,
      tags: ["la11"],
      stem: "设 $A$ 是 4 阶矩阵，$A^{*}$ 是 $A$ 的伴随矩阵，若线性方程组 $Ax=0$ 的基础解系中只有 2 个向量，求 $r(A^{*})$",
      answer: "由 $Ax=0$ 的基础解系含 $n-r(A)=2$ 个向量，得 $r(A)=4-2=2$。因 $r(A)=2<3=n-1$，此时 $A$ 的所有 $n-1$ 阶子式全为 $0$，故 $A^{*}=O$，即$$r(A^{*})=0$$",
      src: { card: "la11", note: "卡片例题（data/math3.js 的 EXAMPLE[\"la11\"]）来源原文：2019 年数三真题。PITFALL[la11] 无条目 → 省略 traps 字段。MNEM[la11] 无条目 → 省略 hint 字段。" }
    },
    {
      id: "cv-m3-la16", origin: 'card', year: 2023, school: "全国硕士研究生招生考试-数学三 2023 年", no: "卡片 la16", type: "linalg", star: 4,
      tags: ["la16"],
      stem: "（2023 数三）已知 $\\alpha_{1}=\\begin{pmatrix}1\\\\2\\\\3\\end{pmatrix}$，$\\alpha_{2}=\\begin{pmatrix}2\\\\1\\\\1\\end{pmatrix}$，$\\beta_{1}=\\begin{pmatrix}2\\\\5\\\\9\\end{pmatrix}$，$\\beta_{2}=\\begin{pmatrix}1\\\\0\\\\1\\end{pmatrix}$。若 $\\gamma$ 既可由 $\\alpha_{1},\\alpha_{2}$ 线性表示，也可由 $\\beta_{1},\\beta_{2}$ 线性表示，则 $\\gamma=$（ ）(A) $k(3,3,4)^{T}$；(B) $k(3,5,10)^{T}$；(C) $k(-1,1,2)^{T}$；(D) $k(1,5,8)^{T}$",
      answer: "设 $\\gamma=x_{1}\\alpha_{1}+x_{2}\\alpha_{2}=x_{3}\\beta_{1}+x_{4}\\beta_{2}$，即 $x_{1}\\alpha_{1}+x_{2}\\alpha_{2}-x_{3}\\beta_{1}-x_{4}\\beta_{2}=0$。对 $(\\alpha_{1},\\alpha_{2},-\\beta_{1},-\\beta_{2})=\\begin{pmatrix}1&2&-2&-1\\\\2&1&-5&0\\\\3&1&-9&-1\\end{pmatrix}$ 作行变换得行最简形 $\\begin{pmatrix}1&0&0&3\\\\0&1&0&-1\\\\0&0&1&1\\end{pmatrix}$，通解 $x_{1}=-3x_{4},\\ x_{2}=x_{4},\\ x_{3}=-x_{4}$。故$$\\gamma=x_{1}\\alpha_{1}+x_{2}\\alpha_{2}=k(1,5,8)^{T}\\ (k\\in\\mathbb R)$$选 (D)。",
      src: { card: "la16", note: "卡片例题（data/math3.js 的 EXAMPLE[\"la16\"]）来源原文：2023 年数三真题。PITFALL[la16] 无条目 → 省略 traps 字段。MNEM[la16] 无条目 → 省略 hint 字段。" }
    },
    {
      id: "cv-m3-ext01", origin: 'card', year: 2020, school: "全国硕士研究生招生考试-数学三 2020 年", no: "卡片 ext01", type: "deriv", star: 5,
      tags: ["ext01"],
      stem: "（2020 数三）设 $\\lim_{x\\to a}\\dfrac{f(x)-a}{x-a}=b$，则 $\\lim_{x\\to a}\\dfrac{\\sin f(x)-\\sin a}{x-a}=$（ ）(A) $b\\sin a$ (B) $b\\cos a$ (C) $b\\sin f(a)$ (D) $b\\cos f(a)$",
      answer: "由题设 $f(x)-a=b(x-a)+o(x-a)$，故 $f(x)\\to a$。用 $\\sin f(x)-\\sin a=\\cos a\\,[f(x)-a]+o(f(x)-a)$：$$\\lim_{x\\to a}\\frac{\\sin f(x)-\\sin a}{x-a}=\\cos a\\cdot\\lim_{x\\to a}\\frac{f(x)-a}{x-a}=b\\cos a$$选 (B)。",
      src: { card: "ext01", note: "卡片例题（data/math3.js 的 EXAMPLE[\"ext01\"]）来源原文：2020 年数三真题。PITFALL[ext01] 无条目 → 省略 traps 字段。MNEM[ext01] 无条目 → 省略 hint 字段。" }
    },
    {
      id: "cv-m3-ext03", origin: 'card', year: 2022, school: "全国硕士研究生招生考试-数学三 2022 年", no: "卡片 ext03", type: "limit", star: 4,
      tags: ["ext03"],
      stem: "（2022 数三）设 $\\alpha(x),\\ \\beta(x)$ 是当 $x\\to0$ 时的无穷小，判断下列命题的正误：① $\\alpha\\sim\\beta\\Rightarrow\\alpha^{2}\\sim\\beta^{2}$；② $\\alpha^{2}\\sim\\beta^{2}\\Rightarrow\\alpha\\sim\\beta$；③ $\\alpha\\sim\\beta\\Rightarrow\\alpha-\\beta=o(\\alpha)$；④ $\\alpha-\\beta=o(\\alpha)\\Rightarrow\\alpha\\sim\\beta$。正确的是____",
      answer: "① 真：$\\dfrac{\\alpha^{2}}{\\beta^{2}}=\\left(\\dfrac{\\alpha}{\\beta}\\right)^{2}\\to1$。② 假：取 $\\alpha=x,\\ \\beta=-x$，$\\alpha^{2}\\sim\\beta^{2}$ 但 $\\alpha\\nsim\\beta$。③ 真：$\\dfrac{\\alpha-\\beta}{\\alpha}=1-\\dfrac{\\beta}{\\alpha}\\to0$。④ 真：$\\dfrac{\\alpha-\\beta}{\\alpha}\\to0\\Rightarrow\\dfrac{\\beta}{\\alpha}\\to1$。故正确的是 ①③④。",
      src: { card: "ext03", note: "卡片例题（data/math3.js 的 EXAMPLE[\"ext03\"]）来源原文：2022 年数三真题。PITFALL[ext03] 无条目 → 省略 traps 字段。MNEM[ext03] 无条目 → 省略 hint 字段。" }
    },
    {
      id: "cv-m3-ext04", origin: 'card', year: 2013, school: "全国硕士研究生入学统一考试-数学三 2013 年", no: "卡片 ext04", type: "limit", star: 4,
      tags: ["ext04"],
      stem: "（2013 数三）设函数 $f(x)$ 在 $[0,+\\infty)$ 上可导，$f(0)=0$，且 $\\lim_{x\\to+\\infty}f(x)=2$。证明：(Ⅰ) 存在 $a>0$，使得 $f(a)=1$；(Ⅱ) 对 (Ⅰ) 中的 $a$，存在 $\\xi\\in(0,a)$，使得 $f'(\\xi)=\\dfrac1a$。",
      answer: "(Ⅰ) 因 $\\lim_{x\\to+\\infty}f(x)=2>1$，存在 $X>0$ 使 $f(X)>1$；又 $f(0)=0<1$，$f$ 在 $[0,X]$ 上连续，由介值定理存在 $a\\in(0,X)$ 使 $f(a)=1$。(Ⅱ) $f$ 在 $[0,a]$ 上满足拉格朗日中值定理条件：存在 $\\xi\\in(0,a)$ 使$$f'(\\xi)=\\frac{f(a)-f(0)}{a-0}=\\frac{1-0}{a}=\\frac1a$$",
      src: { card: "ext04", note: "卡片例题（data/math3.js 的 EXAMPLE[\"ext04\"]）来源原文：2013 年数三真题。PITFALL[ext04] 无条目 → 省略 traps 字段。MNEM[ext04] 无条目 → 省略 hint 字段。" }
    },
    {
      id: "cv-m3-ext05", origin: 'card', year: 2019, school: "全国硕士研究生招生考试-数学三 2019 年", no: "卡片 ext05", type: "deriv", star: 5,
      tags: ["ext05"],
      stem: "（2019 数三）设 $f(x)=\\begin{cases}x^{2x},&x>0\\\\xe^{x}+1,&x\\le0\\end{cases}$，求 $f'(x)$ 并求 $f(x)$ 的极值。",
      answer: "$x>0$：$f'(x)=2x^{2x}(\\ln x+1)$；$x<0$：$f'(x)=e^{x}(x+1)$。由 $\\lim_{x\\to0^{+}}\\dfrac{x^{2x}-1}{x}=\\lim\\dfrac{2x\\ln x}{x}=-\\infty$，$f'(0)$ 不存在。令 $f'(x)=0$ 得驻点 $x=-1$ 与 $x=\\frac1e$。极小值 $f(-1)=1-\\frac1e$、$f\\left(\\frac1e\\right)=e^{-\\frac2e}$，极大值 $f(0)=1$。",
      src: { card: "ext05", note: "卡片例题（data/math3.js 的 EXAMPLE[\"ext05\"][0]）来源原文：2019 年数三真题。PITFALL[ext05] 无条目 → 省略 traps 字段。MNEM[ext05] 无条目 → 省略 hint 字段。" }
    },
    {
      id: "cv-m3-ext05-2", origin: 'card', year: 2019, school: "全国硕士研究生招生考试-数学三 2019 年", no: "卡片 ext05-2", type: "deriv", star: 5,
      tags: ["ext05"],
      stem: "（2019 数三）曲线 $y=x\\sin x+2\\cos x$ 在 $\\left(-\\dfrac{3\\pi}{2},\\dfrac{3\\pi}{2}\\right)$ 内的拐点坐标为____",
      answer: "$$y'=\\sin x+x\\cos x-2\\sin x=x\\cos x-\\sin x,\\qquad y''=\\cos x-x\\sin x-\\cos x=-x\\sin x$$由 $y''=0$ 得 $x=0$ 或 $\\sin x=0$，即 $x=-\\pi,0,\\pi$。在 $x=\\pm\\pi$ 两侧 $y''=-x\\sin x$ 变号，为拐点；在 $x=0$ 附近 $-x\\sin x\\sim-x^{2}$，两侧同号（均小于 $0$），故 $(0,2)$ 不是拐点。于是拐点为 $(-\\pi,-2)$ 与 $(\\pi,-2)$。",
      src: { card: "ext05", note: "卡片例题（data/math3.js 的 EXAMPLE[\"ext05\"][1]）来源原文：2019 年数三真题。PITFALL[ext05] 无条目 → 省略 traps 字段。MNEM[ext05] 无条目 → 省略 hint 字段。" }
    },
    {
      id: "cv-m3-ext06", origin: 'card', year: 2022, school: "全国硕士研究生招生考试-数学三 2022 年", no: "卡片 ext06", type: "deriv", star: 5,
      tags: ["ext06"],
      stem: "（2022 数三）设 $y(x)$ 是微分方程 $y'+\\dfrac{1}{2\\sqrt{x}}y=2+\\sqrt{x}$ 满足 $y(1)=3$ 的解，求曲线 $y=y(x)$ 的渐近线。",
      answer: "由一阶线性通解公式：$$y=e^{-\\sqrt{x}}\\left[\\int(2+\\sqrt{x})\\,e^{\\sqrt{x}}\\,dx+C\\right]$$令 $u=\\sqrt{x}$，则 $\\int(2+u)e^{u}\\cdot2u\\,du=2u^{2}e^{u}+C$，故$$y=e^{-\\sqrt{x}}\\left(2x\\,e^{\\sqrt{x}}+C\\right)=2x+Ce^{-\\sqrt{x}}$$由 $y(1)=3$ 得 $C=e$，即 $y=2x+e^{1-\\sqrt{x}}$。因 $\\lim_{x\\to+\\infty}[y-2x]=\\lim e^{1-\\sqrt{x}}=0$，故斜渐近线为 $y=2x$（无铅直、水平渐近线）。",
      src: { card: "ext06", note: "卡片例题（data/math3.js 的 EXAMPLE[\"ext06\"][0]）来源原文：2022 年数三真题。PITFALL[ext06] 无条目 → 省略 traps 字段。MNEM[ext06] 无条目 → 省略 hint 字段。" }
    },
    {
      id: "cv-m3-ext06-2", origin: 'card', year: 2026, school: "全国硕士研究生招生考试-数学三 2026 年", no: "卡片 ext06-2", type: "deriv", star: 5,
      tags: ["ext06"],
      stem: "（2026 数三）曲线 $y=xe^{1/x}$ 的渐近线（ ）(A) 无水平渐近线、无铅直渐近线；(B) 有水平渐近线、无铅直渐近线；(C) 无水平渐近线、有铅直渐近线；(D) 有水平渐近线、有铅直渐近线",
      answer: "当 $x\\to0^{+}$ 时 $e^{1/x}\\to+\\infty$，故 $xe^{1/x}\\to+\\infty$，$x=0$ 为铅直渐近线；当 $x\\to0^{-}$ 时 $e^{1/x}\\to0$，$xe^{1/x}\\to0$。又 $x\\to+\\infty$ 时 $e^{1/x}\\to1$，$y\\sim x$，存在斜渐近线 $y=x+1$，无水平渐近线。故选 (C)。",
      src: { card: "ext06", note: "卡片例题（data/math3.js 的 EXAMPLE[\"ext06\"][1]）来源原文：2026 年数三真题。PITFALL[ext06] 无条目 → 省略 traps 字段。MNEM[ext06] 无条目 → 省略 hint 字段。" }
    },
    {
      id: "cv-m3-ext06-3", origin: 'card', year: 2025, school: "全国硕士研究生招生考试-数学三 2025 年", no: "卡片 ext06-3", type: "deriv", star: 5,
      tags: ["ext06"],
      stem: "（2025 数三）设 $g(x)$ 是 $f(x)=\\dfrac{1}{2}\\ln\\dfrac{3+x}{3-x}$ 的反函数，则曲线 $y=g(x)$ 的渐近线方程为____",
      answer: "令 $y=f(x)$，则 $2y=\\ln\\dfrac{3+x}{3-x}$，解得 $x=\\dfrac{3(e^{2y}-1)}{e^{2y}+1}$，故$$g(x)=\\frac{3(e^{2x}-1)}{e^{2x}+1}$$当 $x\\to+\\infty$ 时 $e^{2x}\\to+\\infty$，$g(x)\\to3$；当 $x\\to-\\infty$ 时 $e^{2x}\\to0$，$g(x)\\to-3$。故 $y=g(x)$ 的水平渐近线为$$y=3\\quad\\text{与}\\quad y=-3$$",
      src: { card: "ext06", note: "卡片例题（data/math3.js 的 EXAMPLE[\"ext06\"][2]）来源原文：2025 年数三真题。PITFALL[ext06] 无条目 → 省略 traps 字段。MNEM[ext06] 无条目 → 省略 hint 字段。" }
    },
    {
      id: "cv-m3-ext07", origin: 'card', year: 2024, school: "全国硕士研究生招生考试-数学三 2024 年", no: "卡片 ext07", type: "deriv", star: 5,
      tags: ["ext07"],
      stem: "（2024 数三）某商品价格 $P=\\begin{cases}25-0.25Q,&Q\\le20\\\\35-0.75Q,&Q>20\\end{cases}$，总成本 $C=150+5Q+0.25Q^{2}$，求利润最大值。",
      answer: "$Q\\le20$：利润 $L=(25-0.25Q)Q-C=20Q-0.5Q^{2}-150$，$L'=20-Q=0\\Rightarrow Q=20$，$L(20)=50$。$Q>20$：$L=(35-0.75Q)Q-C=30Q-Q^{2}-150$，$L'=30-2Q<0$（当 $Q>20$），故在 $(20,+\\infty)$ 递减。所以最大利润 $=50$ 万元。",
      src: { card: "ext07", note: "卡片例题（data/math3.js 的 EXAMPLE[\"ext07\"][0]）来源原文：2024 年数三真题。PITFALL[ext07] 无条目 → 省略 traps 字段。MNEM[ext07] 无条目 → 省略 hint 字段。" }
    },
    {
      id: "cv-m3-ext07-2", origin: 'card', year: 2022, school: "全国硕士研究生招生考试-数学三 2022 年", no: "卡片 ext07-2", type: "deriv", star: 5,
      tags: ["ext07"],
      stem: "（2022 数三）设某产品的产量 $Q$ 由资本投入量 $x$ 和劳动投入量 $y$ 决定，生产函数 $Q=12x^{\\frac12}y^{\\frac16}$，该产品的销售单价 $P$ 与产量 $Q$ 的关系为 $P=1160-1.5Q$。若单位资本投入和单位劳动投入的价格分别为 $6$ 和 $8$，求利润最大时的产量。",
      answer: "成本 $C=6x+8y$，收益 $R=PQ=(1160-1.5Q)Q$，故利润$$L=13920\\,x^{\\frac12}y^{\\frac16}-216\\,x\\,y^{\\frac13}-6x-8y$$$$L_x=6960\\,x^{-\\frac12}y^{\\frac16}-216\\,y^{\\frac13}-6,\\qquad L_y=2320\\,x^{\\frac12}y^{-\\frac56}-72\\,x\\,y^{-\\frac23}-8$$令 $L_x=L_y=0$ 解得唯一驻点 $(x,y)=(256,64)$（实际问题最大利润必在驻点取得）。此时$$Q=12\\sqrt{256}\\cdot\\sqrt[6]{64}=12\\times16\\times2=384$$",
      src: { card: "ext07", note: "卡片例题（data/math3.js 的 EXAMPLE[\"ext07\"][1]）来源原文：2022 年数三真题。PITFALL[ext07] 无条目 → 省略 traps 字段。MNEM[ext07] 无条目 → 省略 hint 字段。" }
    },
    {
      id: "cv-m3-ext07-3", origin: 'card', year: 2024, school: "全国硕士研究生招生考试-数学三 2024 年", no: "卡片 ext07-3", type: "deriv", star: 5,
      tags: ["ext07"],
      stem: "（2024 数三）设 $t>0$，平面区域 $D$ 由曲线 $y=xe^{-2x}$ 与直线 $x=t,\\ x=2t$ 及 $x$ 轴围成，面积为 $S(t)$，求 $S(t)$ 的最大值。",
      answer: "$$S(t)=\\int_{t}^{2t}xe^{-2x}dx$$由 $\\int xe^{-2x}dx=-\\dfrac{e^{-2x}}{4}(2x+1)$，得$$S(t)=\\frac{e^{-2t}}{4}(2t+1)-\\frac{e^{-4t}}{4}(4t+1)$$$$S'(t)=te^{-4t}(4-e^{2t})$$令 $S'(t)=0$ 得 $e^{2t}=4$，即 $t=\\ln2$。当 $0<t<\\ln2$ 时 $S'>0$；当 $t>\\ln2$ 时 $S'<0$，故 $t=\\ln2$ 为最大值点，$$S_{\\max}=S(\\ln2)=\\frac{4\\ln2+3}{64}$$",
      src: { card: "ext07", note: "卡片例题（data/math3.js 的 EXAMPLE[\"ext07\"][2]）来源原文：2024 年数三真题。PITFALL[ext07] 无条目 → 省略 traps 字段。MNEM[ext07] 无条目 → 省略 hint 字段。" }
    },
    {
      id: "cv-m3-ext08", origin: 'card', year: 2019, school: "全国硕士研究生招生考试-数学三 2019 年", no: "卡片 ext08", type: "deriv", star: 5,
      tags: ["ext08"],
      stem: "（2019 数三）商品 $A$ 的需求量 $Q_{A}=500-P_{A}^{2}-P_{A}P_{B}+2P_{B}^{2}$，当 $P_{A}=10,\\ P_{B}=20$ 时，$A$ 的需求量对自身价格的弹性 $\\eta_{AA}$ 为____",
      answer: "$$\\eta_{AA}=-\\frac{P_A}{Q_A}\\cdot\\frac{\\partial Q_A}{\\partial P_A}=-\\frac{10}{1000}\\cdot(-2P_A-P_B)\\Big|_{P_A=10,\\,P_B=20}=\\frac{10}{1000}\\times40=0.4$$",
      src: { card: "ext08", note: "卡片例题（data/math3.js 的 EXAMPLE[\"ext08\"]）来源原文：2019 年数三真题。PITFALL[ext08] 无条目 → 省略 traps 字段。MNEM[ext08] 无条目 → 省略 hint 字段。" }
    },
    {
      id: "cv-m3-ext10", origin: 'card', year: 2019, school: "全国硕士研究生招生考试-数学三 2019 年", no: "卡片 ext10", type: "integral", star: 4,
      tags: ["ext10"],
      stem: "（2019 数三）设 $a_{n}=\\int_{0}^{1}x^{n}\\sqrt{1-x^{2}}\\,dx\\ (n=0,1,2,\\cdots)$。(Ⅰ) 证明数列 $\\{a_{n}\\}$ 单调递减，且 $a_{n}=\\dfrac{n-1}{n+2}\\,a_{n-2}\\ (n\\ge2)$；(Ⅱ) 求 $\\lim_{n\\to\\infty}\\dfrac{a_{n}}{a_{n-1}}$。",
      answer: "(Ⅰ) 在 $(0,1)$ 内 $x^{n+1}\\sqrt{1-x^{2}}<x^{n}\\sqrt{1-x^{2}}$，故 $a_{n+1}<a_{n}$，$\\{a_n\\}$ 单调递减。对 $a_{n}$ 分部积分（$u=x^{n-1},\\ dv=x\\sqrt{1-x^{2}}dx$）：$$a_{n}=\\frac{n-1}{3}\\int_{0}^{1}x^{n-2}(1-x^{2})^{3/2}dx=\\frac{n-1}{3}(a_{n-2}-a_{n})$$解得 $a_{n}=\\dfrac{n-1}{n+2}a_{n-2}$。(Ⅱ) 因 $\\{a_n\\}$ 单调递减，$a_{n}\\le a_{n-1}$；又 $a_{n-1}\\le a_{n-2}=\\dfrac{n+2}{n-1}a_{n}$，故$$\\frac{n-1}{n+2}\\le\\frac{a_{n}}{a_{n-1}}\\le1$$由夹逼准则，$\\lim_{n\\to\\infty}\\dfrac{a_{n}}{a_{n-1}}=1$。",
      hint: "华里士（点火）公式：$\\int_0^{\\pi/2}\\sin^n x\\,dx$，$n$ 奇=$\\frac{(n-1)!!}{n!!}$，$n$ 偶再乘 $\\frac{\\pi}{2}$。",
      src: { card: "ext10", note: "卡片例题（data/math3.js 的 EXAMPLE[\"ext10\"]）来源原文：2019 年数三真题。PITFALL[ext10] 无条目 → 省略 traps 字段。hint 取自 MNEM[ext10]。" }
    },
    {
      id: "cv-m3-ext13", origin: 'card', year: 2023, school: "全国硕士研究生招生考试-数学三 2023 年", no: "卡片 ext13", type: "multivar", star: 5,
      tags: ["ext13"],
      stem: "（2023 数三）设 $f(x,y)=\\ln(y+|x\\sin y|)$，则（ ）(A) $\\frac{\\partial f}{\\partial x}\\big|_{(0,1)}$ 不存在，$\\frac{\\partial f}{\\partial y}\\big|_{(0,1)}$ 存在；(B) 前者存在、后者不存在；(C) 均存在；(D) 均不存在",
      answer: "固定 $y=1$：$f(x,1)=\\ln(1+|x|\\sin1)$，在 $x=0$ 处含 $|x|$，左右导数分别为 $\\sin1$ 与 $-\\sin1$，故 $\\frac{\\partial f}{\\partial x}\\big|_{(0,1)}$ 不存在。固定 $x=0$：$f(0,y)=\\ln y$，$\\frac{\\partial f}{\\partial y}\\big|_{(0,1)}=\\frac1y\\big|_{y=1}=1$ 存在。故选 (A)。",
      traps: "偏导存在 $\\not\\Rightarrow$ 可微，可微 $\\not\\Rightarrow$ 偏导连续；判断可微必须验证全增量减线性近似是 $o(\\rho)$。",
      src: { card: "ext13", note: "卡片例题（data/math3.js 的 EXAMPLE[\"ext13\"]）来源原文：2023 年数三真题。traps 取自 PITFALL[ext13]。MNEM[ext13] 无条目 → 省略 hint 字段。" }
    },
    {
      id: "cv-m3-ext14", origin: 'card', year: 2026, school: "全国硕士研究生招生考试-数学三 2026 年", no: "卡片 ext14", type: "multivar", star: 5,
      tags: ["ext14"],
      stem: "设 $z=z(x,y)$ 由方程 $x-az=e^{y+az}$（$a$ 为非零常数）确定，求 $\\frac{\\partial z}{\\partial x}-\\frac{\\partial z}{\\partial y}$",
      answer: "令 $F=x-az-e^{y+az}=0$，则$$F_{x}=1,\\quad F_{y}=-e^{y+az},\\quad F_{z}=-a-ae^{y+az}=-a(1+e^{y+az})$$由隐函数求偏导公式：$$\\frac{\\partial z}{\\partial x}=-\\frac{F_{x}}{F_{z}}=\\frac{1}{a(1+e^{y+az})},\\qquad \\frac{\\partial z}{\\partial y}=-\\frac{F_{y}}{F_{z}}=-\\frac{e^{y+az}}{a(1+e^{y+az})}$$故$$\\frac{\\partial z}{\\partial x}-\\frac{\\partial z}{\\partial y}=\\frac{1+e^{y+az}}{a(1+e^{y+az})}=\\frac{1}{a}$$",
      src: { card: "ext14", note: "卡片例题（data/math3.js 的 EXAMPLE[\"ext14\"][0]）来源原文：2026 年数三真题。PITFALL[ext14] 无条目 → 省略 traps 字段。MNEM[ext14] 无条目 → 省略 hint 字段。" }
    },
    {
      id: "cv-m3-ext14-2", origin: 'card', year: 2024, school: "全国硕士研究生招生考试-数学三 2024 年", no: "卡片 ext14-2", type: "multivar", star: 5,
      tags: ["ext14"],
      stem: "（2024 数三）设 $z=z(x,y)$ 由 $z+e^{x}-y\\ln(1+z^{2})=0$ 确定，求 $\\left(\\dfrac{\\partial^{2}z}{\\partial x^{2}}+\\dfrac{\\partial^{2}z}{\\partial y^{2}}\\right)\\Big|_{(0,0)}$",
      answer: "令 $F=z+e^{x}-y\\ln(1+z^{2})=0$。代入 $x=y=0$ 得 $z(0,0)=-1$。$$F_{x}=e^{x},\\quad F_{y}=-\\ln(1+z^{2}),\\quad F_{z}=1-\\frac{2yz}{1+z^{2}}$$在 $(0,0,-1)$：$F_{z}=1$，故 $z_{x}=-1,\\ z_{y}=\\ln2$。再由 $F_{x}+F_{z}z_{x}=0$ 对 $x$ 求导：$F_{xx}+2F_{xz}z_{x}+F_{zz}z_{x}^{2}+F_{z}z_{xx}=0$，代入 $F_{xx}=1,\\ F_{xz}=0,\\ F_{zz}=0$ 得 $z_{xx}=-1$。同理对 $F_{y}+F_{z}z_{y}=0$ 对 $y$ 求导，代入 $F_{yy}=0,\\ F_{yz}=\\frac{-2z}{1+z^{2}}=1,\\ F_{zz}=0$ 得 $z_{yy}=-2\\ln2$。故原式 $=-(1+2\\ln2)$。",
      src: { card: "ext14", note: "卡片例题（data/math3.js 的 EXAMPLE[\"ext14\"][1]）来源原文：2024 年数三真题。PITFALL[ext14] 无条目 → 省略 traps 字段。MNEM[ext14] 无条目 → 省略 hint 字段。" }
    },
    {
      id: "cv-m3-ext14-3", origin: 'card', year: 2025, school: "全国硕士研究生招生考试-数学三 2025 年", no: "卡片 ext14-3", type: "multivar", star: 5,
      tags: ["ext14"],
      stem: "（2025 数三）设 $z=z(x,y)$ 由 $z+\\ln z-\\int_{y}^{x}x e^{-t^{2}}dt=1$ 确定，求 $\\dfrac{\\partial^{2}z}{\\partial x^{2}}\\Big|_{(1,1)}$。",
      answer: "代入 $x=y=1$：$z+\\ln z-\\int_1^1=1$，得 $z(1,1)=1$。令 $F=z+\\ln z-\\int_{y}^{x}x e^{-t^{2}}dt-1=0$。对 $x$ 求偏导：$$z_{x}\\left(1+\\frac1z\\right)-\\left[\\int_{y}^{x}e^{-t^{2}}dt+x e^{-x^{2}}\\right]=0$$在 $(1,1,1)$：$\\int_1^1=0$，得 $2z_{x}-e^{-1}=0$，故 $z_{x}=\\dfrac{1}{2e}$。再对 $x$ 求偏导：$$z_{xx}\\left(1+\\frac1z\\right)-\\frac{z_{x}^{2}}{z^{2}}-\\left(2e^{-x^{2}}-2x^{2}e^{-x^{2}}\\right)=0$$在 $(1,1,1)$：$z_{x}=\\dfrac{1}{2e}$，括号内 $=2e^{-1}-2e^{-1}=0$，得$$2z_{xx}-\\frac{1}{4e^{2}}=0\\quad\\Rightarrow\\quad z_{xx}=\\frac{1}{8e^{2}}$$",
      src: { card: "ext14", note: "卡片例题（data/math3.js 的 EXAMPLE[\"ext14\"][2]）来源原文：2025 年数三真题。PITFALL[ext14] 无条目 → 省略 traps 字段。MNEM[ext14] 无条目 → 省略 hint 字段。" }
    },
    {
      id: "cv-m3-ext16", origin: 'card', year: 2023, school: "全国硕士研究生招生考试-数学三 2023 年", no: "卡片 ext16", type: "series", star: 5,
      tags: ["ext16"],
      stem: "（2023 数三）已知 $a_n<b_n$。若级数 $\\sum a_n$ 与 $\\sum b_n$ 均收敛，则「$\\sum a_n$ 绝对收敛」是「$\\sum b_n$ 绝对收敛」的（ ）(A) 充分必要条件 (B) 充分不必要 (C) 必要不充分 (D) 既不充分也不必要",
      answer: "令 $c_n=b_n-a_n>0$，则 $\\sum c_n=\\sum b_n-\\sum a_n$ 收敛且为正项级数，故绝对收敛。于是 $b_n=a_n+c_n$、$a_n=b_n-c_n$，分别有$$|b_n|\\le|a_n|+c_n,\\qquad |a_n|\\le|b_n|+c_n$$故 $\\sum|a_n|$ 收敛 $\\iff$ $\\sum|b_n|$ 收敛，选 (A)。",
      src: { card: "ext16", note: "卡片例题（data/math3.js 的 EXAMPLE[\"ext16\"]）来源原文：2023 年数三真题。PITFALL[ext16] 无条目 → 省略 traps 字段。MNEM[ext16] 无条目 → 省略 hint 字段。" }
    },
    {
      id: "cv-m3-ext17", origin: 'card', year: 2016, school: "全国硕士研究生招生考试-数学三 2016 年", no: "卡片 ext17", type: "series", star: 5,
      tags: ["ext17"],
      stem: "（2016 数三）求幂级数 $\\sum_{n=0}^{\\infty}\\frac{x^{2n+2}}{(n+1)(2n+1)}$ 的收敛域及和函数。",
      answer: "由比值判别法：$\\dfrac{u_{n+1}}{u_n}\\to x^{2}$，故 $|x|<1$ 收敛、$|x|>1$ 发散；$x=\\pm1$ 时级数为 $\\sum\\dfrac{1}{(n+1)(2n+1)}$，与 $\\sum\\dfrac{1}{n^{2}}$ 同敛散，收敛。收敛域 $[-1,1]$。设 $S(x)=\\sum_{n=0}^{\\infty}\\dfrac{x^{2n+2}}{(n+1)(2n+1)}$，则$$S''(x)=2\\sum_{n=0}^{\\infty}x^{2n}=\\frac{2}{1-x^{2}}$$由 $S'(0)=S(0)=0$ 积分两次：$$S'(x)=\\ln(1+x)-\\ln(1-x),\\quad S(x)=(1+x)\\ln(1+x)+(1-x)\\ln(1-x)$$",
      src: { card: "ext17", note: "卡片例题（data/math3.js 的 EXAMPLE[\"ext17\"][0]）来源原文：2016 年数三真题。PITFALL[ext17] 无条目 → 省略 traps 字段。MNEM[ext17] 无条目 → 省略 hint 字段。" }
    },
    {
      id: "cv-m3-ext17-2", origin: 'card', year: 2022, school: "全国硕士研究生招生考试-数学三 2022 年", no: "卡片 ext17-2", type: "series", star: 5,
      tags: ["ext17"],
      stem: "（2022 数三）求幂级数 $\\sum_{n=0}^{\\infty}\\frac{(-4)^{n}+1}{4^{n}(2n+1)}x^{2n}$ 的收敛域及和函数。",
      answer: "比值判别：$\\left|\\dfrac{u_{n+1}}{u_n}\\right|\\to x^{2}$，故 $|x|<1$ 收敛；$x=\\pm1$ 时分别为 $\\sum\\dfrac{(-1)^n}{2n+1}$ 与 $\\sum\\dfrac{1}{2n+1}$ 的收敛组合，均收敛。收敛域 $[-1,1]$。记$$S(x)=S_1(x)+S_2(x),\\quad S_1=\\sum_{n=0}^{\\infty}\\frac{(-1)^{n}x^{2n}}{2n+1},\\quad S_2=\\sum_{n=0}^{\\infty}\\frac{x^{2n}}{4^{n}(2n+1)}$$由 $\\sum(-1)^{n}\\dfrac{x^{2n+1}}{2n+1}=\\arctan x$、$\\sum\\dfrac{x^{2n}}{4^n}=\\dfrac{1}{1-x^{2}/4}$，得$$S(x)=\\frac{\\arctan x}{x}+\\frac{1}{x}\\ln\\frac{2+x}{2-x}\\ (x\\ne0),\\qquad S(0)=2$$",
      src: { card: "ext17", note: "卡片例题（data/math3.js 的 EXAMPLE[\"ext17\"][1]）来源原文：2022 年数三真题。PITFALL[ext17] 无条目 → 省略 traps 字段。MNEM[ext17] 无条目 → 省略 hint 字段。" }
    },
    {
      id: "cv-m3-ext17-3", origin: 'card', year: 2014, school: "全国硕士研究生入学统一考试-数学三 2014 年", no: "卡片 ext17-3", type: "series", star: 5,
      tags: ["ext17"],
      stem: "（2014 数三）求幂级数 $\\sum_{n=0}^{\\infty}(n+1)(n+3)x^{n}$ 的收敛域及和函数。",
      answer: "比值判别：$\\dfrac{(n+2)(n+4)}{(n+1)(n+3)}\\to1$，故 $R=1$；$x=\\pm1$ 时通项不趋于 $0$，发散。收敛域 $(-1,1)$。设 $S(x)=\\sum(n+1)(n+3)x^{n}$，则$$\\int_{0}^{x}S(t)dt=\\sum(n+3)x^{n+1}=\\sum(n+2)x^{n+1}+\\sum x^{n+1}=\\left(\\frac{x^{2}}{1-x}\\right)'+\\frac{x}{1-x}=\\frac{3x-2x^{2}}{(1-x)^{2}}$$求导得$$S(x)=\\left(\\frac{3x-2x^{2}}{(1-x)^{2}}\\right)'=\\frac{3-x}{(1-x)^{3}}$$",
      src: { card: "ext17", note: "卡片例题（data/math3.js 的 EXAMPLE[\"ext17\"][2]）来源原文：2014 年数三真题。PITFALL[ext17] 无条目 → 省略 traps 字段。MNEM[ext17] 无条目 → 省略 hint 字段。" }
    },
    {
      id: "cv-m3-ext19", origin: 'card', year: 2017, school: "全国硕士研究生招生考试-数学三 2017 年", no: "卡片 ext19", type: "ode", star: 5,
      tags: ["ext19"],
      stem: "（2017 数三）差分方程 $y_{t+1}-2y_{t}=2^{t}$ 的通解为____",
      answer: "齐次方程 $y_{t+1}-2y_t=0$ 的通解为 $Y_t=A\\cdot2^t$。因右端 $2^{t}$ 与齐次解同形，设特解 $y_t^*=k\\,t\\,2^{t}$，代入得$$k(t+1)2^{t+1}-2k\\,t\\,2^{t}=2^{t}\\ \\Rightarrow\\ k=\\frac12$$故通解$$y_t=A\\cdot2^{t}+\\frac{t}{2}2^{t}=A\\cdot2^{t}+t\\cdot2^{t-1}$$",
      src: { card: "ext19", note: "卡片例题（data/math3.js 的 EXAMPLE[\"ext19\"]）来源原文：2017 年数三真题。PITFALL[ext19] 无条目 → 省略 traps 字段。MNEM[ext19] 无条目 → 省略 hint 字段。" }
    },
    {
      id: "cv-m3-ms01", origin: 'card', year: 2022, school: "全国硕士研究生招生考试-数学三 2022 年", no: "卡片 ms01", type: "integral", star: 3,
      tags: ["ms01"],
      stem: "（2022 数三）设 $I_1=\\int_0^1\\dfrac{\\ln(1+x)}{2(1+\\cos x)}\\,dx$，$I_2=\\int_0^1\\dfrac{2x}{1+\\cos x}\\,dx$，$I_3=\\int_0^1\\dfrac{2x}{1+\\sin x}\\,dx$，则（ ）(A) $I_1<I_2<I_3$；(B) $I_2<I_1<I_3$；(C) $I_1<I_3<I_2$；(D) $I_3<I_2<I_1$",
      answer: "在 $(0,1)$ 内 $\\ln(1+x)<x$，故 $\\dfrac{\\ln(1+x)}{2(1+\\cos x)}<\\dfrac{x}{1+\\cos x}<\\dfrac{2x}{1+\\cos x}$，即 $I_1<I_2$。又 $\\cos x>\\sin x$，故 $1+\\cos x>1+\\sin x$，从而 $\\dfrac{2x}{1+\\cos x}<\\dfrac{2x}{1+\\sin x}$，即 $I_2<I_3$。故 $I_1<I_2<I_3$，选 (A)。",
      src: { card: "ms01", note: "卡片例题（data/math3.js 的 EXAMPLE[\"ms01\"]）来源原文：2022 年数三真题。PITFALL[ms01] 无条目 → 省略 traps 字段。MNEM[ms01] 无条目 → 省略 hint 字段。" }
    },
    {
      id: "cv-m3-ms02", origin: 'card', year: 2025, school: "全国硕士研究生招生考试-数学三 2025 年", no: "卡片 ms02", type: "integral", star: 4,
      tags: ["ms02"],
      stem: "（2025 数三）设 $f(x)=\\int_0^x e^{t^{2}}\\sin t\\,dt$，$g(x)=\\left(\\int_0^x e^{t^{2}}dt\\right)\\sin^{2}x$，则（ ）(A) $x=0$ 是 $f,g$ 的极值点；(B) $x=0$ 是 $f$ 的极值点，$(0,0)$ 是 $g$ 的拐点；(C) $x=0$ 是 $f$ 的极值点，$(0,0)$ 是 $f$ 的拐点；(D) $(0,0)$ 是 $f,g$ 的拐点",
      answer: "$f'(x)=e^{x^{2}}\\sin x$，在 $x=0$ 两侧 $f'$ 由负变正，故 $x=0$ 是 $f$ 的极小值点。又 $F(x)=\\int_0^x e^{t^{2}}dt\\sim x+\\dfrac{x^{3}}{3}$，$\\sin^{2}x\\sim x^{2}$，故 $g(x)=F(x)\\sin^{2}x\\sim x^{3}$（$x\\to0$），为奇函数型三次，$(0,0)$ 为 $g$ 的拐点。故选 (B)。",
      src: { card: "ms02", note: "卡片例题（data/math3.js 的 EXAMPLE[\"ms02\"]）来源原文：2025 年数三真题。PITFALL[ms02] 无条目 → 省略 traps 字段。MNEM[ms02] 无条目 → 省略 hint 字段。" }
    },
    {
      id: "cv-m3-ms03", origin: 'card', year: 2021, school: "全国硕士研究生招生考试-数学三 2021 年", no: "卡片 ms03", type: "eigen", star: 4,
      tags: ["ms03"],
      stem: "（2021 数三）二次型 $f(x_1,x_2,x_3)=(x_1+x_2)^{2}+(x_2+x_3)^{2}-(x_3-x_1)^{2}$ 的正惯性指数与负惯性指数依次为（ ）(A) $2,0$；(B) $1,1$；(C) $2,1$；(D) $1,2$",
      answer: "$f$ 对应的对称矩阵为$$A=\\begin{pmatrix}0&1&1\\\\1&2&1\\\\1&1&0\\end{pmatrix}$$由 $|\\lambda E-A|=-(\\lambda-3)\\lambda(\\lambda+1)$ 得特征值 $3,0,-1$，故正惯性指数 $1$、负惯性指数 $1$，选 (B)。",
      src: { card: "ms03", note: "卡片例题（data/math3.js 的 EXAMPLE[\"ms03\"]）来源原文：2021 年数三真题。PITFALL[ms03] 无条目 → 省略 traps 字段。MNEM[ms03] 无条目 → 省略 hint 字段。" }
    },
    {
      id: "cv-m3-tp01", origin: 'card', year: 2020, school: "全国硕士研究生招生考试-数学三 2020 年", no: "卡片 tp01", type: "limit", star: 5,
      tags: ["tp01"],
      stem: "（2020 数三）已知 $a,b$ 为常数，若 $\\left(1+\\dfrac1n\\right)^{n}-e$ 与 $\\dfrac{b}{n^{a}}$ 在 $n\\to+\\infty$ 时是等价无穷小，求 $a,b$。",
      answer: "令 $x=\\dfrac1n\\to0$，则 $\\left(1+\\dfrac1n\\right)^{n}=(1+x)^{1/x}=e^{\\frac{\\ln(1+x)}{x}}$。由 $\\ln(1+x)=x-\\dfrac{x^{2}}{2}+o(x^{2})$ 得 $\\dfrac{\\ln(1+x)}{x}=1-\\dfrac{x}{2}+o(x)$，故$$(1+x)^{1/x}=e\\cdot e^{-x/2+o(x)}=e\\left(1-\\frac{x}{2}+o(x)\\right)=e-\\frac{e}{2}x+o(x)$$于是 $\\left(1+\\dfrac1n\\right)^{n}-e=-\\dfrac{e}{2n}+o\\left(\\dfrac1n\\right)$。与 $\\dfrac{b}{n^{a}}$ 等价，得 $a=1,\\ b=-\\dfrac{e}{2}$。",
      src: { card: "tp01", note: "卡片例题（data/math3.js 的 EXAMPLE[\"tp01\"]）来源原文：2020 年数三真题。PITFALL[tp01] 无条目 → 省略 traps 字段。MNEM[tp01] 无条目 → 省略 hint 字段。" }
    },
    {
      id: "cv-m3-tp02", origin: 'card', year: 2019, school: "全国硕士研究生招生考试-数学三 2019 年", no: "卡片 tp02", type: "integral", star: 5,
      tags: ["tp02"],
      stem: "（2019 数三）求曲线 $y=e^{-x}\\sin x\\ (x\\ge0)$ 与 $x$ 轴之间图形的面积。",
      answer: "分部积分两次得$$\\int e^{-x}\\sin x\\,dx=-\\frac{e^{-x}}{2}(\\sin x+\\cos x)+C$$在 $[n\\pi,(n+1)\\pi]$ 上 $|\\sin x|=(-1)^{n}\\sin x$，故$$\\int_{n\\pi}^{(n+1)\\pi}e^{-x}|\\sin x|\\,dx=(-1)^{n}\\int_{n\\pi}^{(n+1)\\pi}e^{-x}\\sin x\\,dx=\\frac12\\left(e^{-n\\pi}+e^{-(n+1)\\pi}\\right)$$于是总面积（几何级数求和）$$S=\\sum_{n=0}^{\\infty}\\frac12\\left(e^{-n\\pi}+e^{-(n+1)\\pi}\\right)=\\frac12\\cdot\\frac{1+e^{-\\pi}}{1-e^{-\\pi}}=\\frac{e^{\\pi}+1}{2(e^{\\pi}-1)}$$",
      src: { card: "tp02", note: "卡片例题（data/math3.js 的 EXAMPLE[\"tp02\"]）来源原文：2019 年数三真题。PITFALL[tp02] 无条目 → 省略 traps 字段。MNEM[tp02] 无条目 → 省略 hint 字段。" }
    },
    {
      id: "cv-m3-tp03", origin: 'card', year: 2025, school: "全国硕士研究生招生考试-数学三 2025 年", no: "卡片 tp03", type: "proof", star: 5,
      tags: ["tp03"],
      stem: "（2025 数三）设 $f(x)$ 在 $(a,b)$ 内可导。证明：$f'(x)$ 在 $(a,b)$ 内严格单调增加 ⟺ 对任意 $a<x_1<x_2<x_3<b$，有 $\\dfrac{f(x_2)-f(x_1)}{x_2-x_1}<\\dfrac{f(x_3)-f(x_2)}{x_3-x_2}$。",
      answer: "（Ⅰ）设 $f'$ 严格增加。对任意 $x_1<x_2<x_3$，由拉格朗日中值定理，存在 $\\xi_1\\in(x_1,x_2),\\ \\xi_2\\in(x_2,x_3)$ 使$$\\frac{f(x_2)-f(x_1)}{x_2-x_1}=f'(\\xi_1),\\qquad \\frac{f(x_3)-f(x_2)}{x_3-x_2}=f'(\\xi_2)$$因 $x_1<\\xi_1<x_2<\\xi_2<x_3$ 且 $f'$ 严格增，故 $f'(\\xi_1)<f'(\\xi_2)$，即证。\n\n（Ⅱ）设不等式对一切 $x_1<x_2<x_3$ 成立。对任意 $u<v$，取 $h>0$ 使 $u<u+h<v<v+h<b$，分别对 $(u,u+h,v)$ 与 $(u,v,v+h)$ 用题设得$$\\frac{f(u+h)-f(u)}{h}<\\frac{f(v)-f(u+h)}{v-u-h},\\qquad \\frac{f(v)-f(u)}{v-u}<\\frac{f(v+h)-f(v)}{h}$$令 $h\\to0^{+}$，由可导性得 $f'(u)\\le\\dfrac{f(v)-f(u)}{v-u}\\le f'(v)$，故 $f'$ 单调不减。若 $f'$ 不严格增，则存在 $c<d$ 使 $f'(c)=f'(d)$，由单调不减知 $f'$ 在 $[c,d]$ 上恒为常数，从而 $f$ 在 $[c,d]$ 上为线性函数；取 $c<x_1<x_2<x_3<d$，两割线斜率相等，与题设严格不等式矛盾。故 $f'$ 严格增加。",
      src: { card: "tp03", note: "卡片例题（data/math3.js 的 EXAMPLE[\"tp03\"]）来源原文：2025 年数三真题。PITFALL[tp03] 无条目 → 省略 traps 字段。MNEM[tp03] 无条目 → 省略 hint 字段。" }
    },
    {
      id: "cv-m3-tp04", origin: 'card', year: 2023, school: "全国硕士研究生招生考试-数学三 2023 年", no: "卡片 tp04", type: "eigen", star: 5,
      tags: ["tp04"],
      stem: "（2023 数三）设矩阵 $A$ 满足：对任意 $x_1,x_2,x_3$ 有 $A\\begin{pmatrix}x_1\\\\x_2\\\\x_3\\end{pmatrix}=\\begin{pmatrix}x_1+x_2+x_3\\\\2x_1-x_2+x_3\\\\x_2-x_3\\end{pmatrix}$。(Ⅰ) 求 $A$；(Ⅱ) 求可逆矩阵 $P$ 与对角矩阵 $\\Lambda$，使 $P^{-1}AP=\\Lambda$。",
      answer: "(Ⅰ) 分别取 $(x_1,x_2,x_3)=e_1,e_2,e_3$，得各列为 $Ae_1=(1,2,0)^{T},\\ Ae_2=(1,-1,1)^{T},\\ Ae_3=(1,1,-1)^{T}$，故$$A=\\begin{pmatrix}1&1&1\\\\2&-1&1\\\\0&1&-1\\end{pmatrix}$$\n\n(Ⅱ) $|\\lambda E-A|=\\begin{vmatrix}\\lambda-1&-1&-1\\\\-2&\\lambda+1&-1\\\\0&-1&\\lambda+1\\end{vmatrix}=(\\lambda-2)(\\lambda+1)(\\lambda+2)$，特征值为 $\\lambda_1=2,\\ \\lambda_2=-1,\\ \\lambda_3=-2$（互异，必可对角化）。解 $(\\lambda_i E-A)x=0$：$$\\lambda=2:\\ \\alpha_1=(4,3,1)^{T};\\qquad \\lambda=-1:\\ \\alpha_2=(1,0,-2)^{T};\\qquad \\lambda=-2:\\ \\alpha_3=(0,1,-1)^{T}$$取$$P=\\begin{pmatrix}4&1&0\\\\3&0&1\\\\1&-2&-1\\end{pmatrix}\\ \\Longrightarrow\\ P^{-1}AP=\\operatorname{diag}(2,-1,-2)$$",
      src: { card: "tp04", note: "卡片例题（data/math3.js 的 EXAMPLE[\"tp04\"]）来源原文：2023 年数三真题。PITFALL[tp04] 无条目 → 省略 traps 字段。MNEM[tp04] 无条目 → 省略 hint 字段。" }
    },
    {
      id: "cv-m3-tp05", origin: 'card', year: 2021, school: "全国硕士研究生招生考试-数学三 2021 年", no: "卡片 tp05", type: "series", star: 5,
      tags: ["tp05"],
      stem: "（2021 数三）设 $n$ 为正整数，$y=y_n(x)$ 是微分方程 $xy'-(n+1)y=0$ 的满足 $y_n(1)=\\dfrac{1}{n(n+1)}$ 的解。(Ⅰ) 求 $y_n(x)$；(Ⅱ) 求级数 $\\sum_{n=1}^{\\infty}y_n(x)$ 的收敛域及和函数。",
      answer: "(Ⅰ) 分离变量 $\\dfrac{dy}{y}=\\dfrac{n+1}{x}dx$，得 $y=Cx^{n+1}$；由 $y_n(1)=\\dfrac1{n(n+1)}$ 得 $C=\\dfrac1{n(n+1)}$，故 $y_n(x)=\\dfrac{x^{n+1}}{n(n+1)}$。\n\n(Ⅱ) 设 $S(x)=\\sum_{n=1}^{\\infty}\\dfrac{x^{n+1}}{n(n+1)}$。由比值判别法收敛半径 $R=1$；端点 $x=1$ 时 $\\sum\\dfrac1{n(n+1)}=1$ 收敛，$x=-1$ 时 $\\sum\\dfrac{(-1)^{n+1}}{n(n+1)}$ 绝对收敛，故收敛域 $[-1,1]$。由 $\\dfrac1{n(n+1)}=\\dfrac1n-\\dfrac1{n+1}$：$$S(x)=\\sum_{n=1}^{\\infty}\\frac{x^{n+1}}{n}-\\sum_{n=1}^{\\infty}\\frac{x^{n+1}}{n+1}=x\\sum_{n=1}^{\\infty}\\frac{x^n}{n}-\\left[\\sum_{n=1}^{\\infty}\\frac{x^n}{n}-x\\right]$$由 $-\\ln(1-x)=\\sum_{n=1}^{\\infty}\\dfrac{x^n}{n}\\ (|x|<1)$ 得$$S(x)=-x\\ln(1-x)+\\ln(1-x)+x=(1-x)\\ln(1-x)+x\\ (|x|<1)$$由 $S$ 在 $[-1,1]$ 连续，$S(1)=\\lim_{x\\to1^{-}}S(x)=1$，$S(-1)=2\\ln2-1$。故$$S(x)=\\begin{cases}(1-x)\\ln(1-x)+x,&x\\in[-1,1)\\\\1,&x=1\\end{cases}$$",
      src: { card: "tp05", note: "卡片例题（data/math3.js 的 EXAMPLE[\"tp05\"]）来源原文：2021 年数三真题。PITFALL[tp05] 无条目 → 省略 traps 字段。MNEM[tp05] 无条目 → 省略 hint 字段。" }
    },
    {
      id: "cv-m3-tp06", origin: 'card', year: 2021, school: "全国硕士研究生招生考试-数学三 2021 年", no: "卡片 tp06", type: "multivar", star: 5,
      tags: ["tp06"],
      stem: "（2021 数三）求函数 $f(x,y)=2\\ln|x|+\\dfrac{(x-1)^{2}+y^{2}}{2x^{2}}$ 的极值。",
      answer: "$$f_{x}=\\frac{2x^{2}+x-1-y^{2}}{x^{3}},\\qquad f_{y}=\\frac{y}{x^{2}}$$由 $f_y=0$ 得 $y=0$；代入 $f_x=0$ 得 $(2x-1)(x+1)=0$，驻点为 $(-1,0)$ 与 $(\\tfrac12,0)$。$$A=f_{xx}=\\frac{-2x^{2}-2x+3+3y^{2}}{x^{4}},\\quad B=f_{xy}=-\\frac{2y}{x^{3}},\\quad C=f_{yy}=\\frac{1}{x^{2}}$$在 $(-1,0)$：$A=3,\\ B=0,\\ C=1$，$\\Delta=AC-B^{2}=3>0$ 且 $A>0$，极小值 $f(-1,0)=2$；在 $(\\tfrac12,0)$：$A=24,\\ B=0,\\ C=4$，$\\Delta=96>0$ 且 $A>0$，极小值 $f(\\tfrac12,0)=\\dfrac12-2\\ln2$。",
      src: { card: "tp06", note: "卡片例题（data/math3.js 的 EXAMPLE[\"tp06\"]）来源原文：2021 年数三真题。PITFALL[tp06] 无条目 → 省略 traps 字段。MNEM[tp06] 无条目 → 省略 hint 字段。" }
    },
    {
      id: "cv-m3-tp07", origin: 'card', year: 2025, school: "全国硕士研究生招生考试-数学三 2025 年", no: "卡片 tp07", type: "ode", star: 5,
      tags: ["tp07"],
      stem: "（2025 数三）微分方程 $xy'-y+x^{2}e^{x}=0$ 满足 $y(1)=-e$ 的解为 $y=$____",
      answer: "方程化为 $y'-\\dfrac1x y=-x\\,e^{x}$（一阶线性）。由通解公式：$$y=e^{\\int\\frac1x dx}\\left[\\int(-x\\,e^{x})\\,e^{-\\int\\frac1x dx}\\,dx+C\\right]=x\\left[\\int(-e^{x})\\,dx+C\\right]=x\\left(-e^{x}+C\\right)$$由 $y(1)=-e+C=-e$ 得 $C=0$，故 $y=-x\\,e^{x}$。（快捷法：原方程即 $\\left(\\dfrac yx\\right)'=\\dfrac{xy'-y}{x^{2}}=-e^{x}$，积分得 $\\dfrac yx=-e^{x}+C$，同得 $y=-xe^{x}$。）",
      src: { card: "tp07", note: "卡片例题（data/math3.js 的 EXAMPLE[\"tp07\"]）来源原文：2025 年数三真题。PITFALL[tp07] 无条目 → 省略 traps 字段。MNEM[tp07] 无条目 → 省略 hint 字段。" }
    },
    {
      id: "cv-m3-tp08", origin: 'card', year: 2024, school: "全国硕士研究生招生考试-数学三 2024 年", no: "卡片 tp08", type: "dblint", star: 5,
      tags: ["tp08"],
      stem: "（2024 数三）设 $D$ 由 $xy=\\frac13,\\ xy=3,\\ y=\\frac{x}{3},\\ y=3x$ 围成，计算 $\\iint_{D}(1+x-y)\\,dxdy$。",
      answer: "区域 $D$ 关于直线 $y=x$ 对称，被积函数中 $x-y$ 为反对称，故 $\\iint_D(x-y)dxdy=0$，只需算 $D$ 的面积。令 $u=xy,\\ v=\\dfrac yx$，则 $u\\in[\\frac13,3],\\ v\\in[\\frac13,3]$，且$$\\frac{\\partial(x,y)}{\\partial(u,v)}=\\frac{1}{2v}$$故$$\\iint_D(1+x-y)dxdy=\\iint_D dxdy=\\int_{1/3}^{3}du\\int_{1/3}^{3}\\frac{dv}{2v}=\\frac{8}{3}\\cdot\\frac{1}{2}\\cdot2\\ln3=\\frac{8}{3}\\ln3$$",
      src: { card: "tp08", note: "卡片例题（data/math3.js 的 EXAMPLE[\"tp08\"][0]）来源原文：2024 年数三真题。PITFALL[tp08] 无条目 → 省略 traps 字段。MNEM[tp08] 无条目 → 省略 hint 字段。" }
    },
    {
      id: "cv-m3-tp08-2", origin: 'card', year: 2024, school: "全国硕士研究生招生考试-数学三 2024 年", no: "卡片 tp08-2", type: "dblint", star: 5,
      tags: ["tp08"],
      stem: "（2024 数三）设 $f(x,y)$ 连续，则 $\\int_{\\pi/6}^{\\pi/2}dx\\int_{\\sin x}^{1}f(x,y)\\,dy=$（ ）(A) $\\int_{1/2}^{1}dy\\int_{\\pi/6}^{\\arcsin y}f(x,y)\\,dx$ (B) $\\int_{1/2}^{1}dy\\int_{\\arcsin y}^{\\pi/2}f(x,y)\\,dx$ (C) $\\int_{0}^{1/2}dy\\int_{\\pi/6}^{\\arcsin y}f(x,y)\\,dx$ (D) $\\int_{0}^{1/2}dy\\int_{\\arcsin y}^{\\pi/2}f(x,y)\\,dx$",
      answer: "区域为 $\\pi/6\\le x\\le\\pi/2,\\ \\sin x\\le y\\le1$，即 $\\dfrac12\\le y\\le1,\\ \\pi/6\\le x\\le\\arcsin y$，故$$\\int_{\\pi/6}^{\\pi/2}dx\\int_{\\sin x}^{1}f(x,y)dy=\\int_{1/2}^{1}dy\\int_{\\pi/6}^{\\arcsin y}f(x,y)\\,dx$$选 (A)。",
      src: { card: "tp08", note: "卡片例题（data/math3.js 的 EXAMPLE[\"tp08\"][1]）来源原文：2024 年数三真题。PITFALL[tp08] 无条目 → 省略 traps 字段。MNEM[tp08] 无条目 → 省略 hint 字段。" }
    },
    {
      id: "cv-m3-tp08-3", origin: 'card', year: 2013, school: "全国硕士研究生入学统一考试-数学三 2013 年", no: "卡片 tp08-3", type: "dblint", star: 5,
      tags: ["tp08"],
      stem: "（2013 数三）设平面区域 $D$ 由直线 $y=\\frac{x}{3},\\ y=3x$ 及 $x+y=8$ 围成，计算 $\\iint_{D}x^{2}\\,dxdy$。",
      answer: "$D=\\{(x,y)\\mid 0\\le x\\le2,\\ x/3\\le y\\le3x\\}\\cup\\{(x,y)\\mid 2\\le x\\le6,\\ x/3\\le y\\le8-x\\}$，故$$\\iint_D x^{2}dxdy=\\int_{0}^{2}x^{2}\\left(3x-\\frac{x}{3}\\right)dx+\\int_{2}^{6}x^{2}\\left(8-x-\\frac{x}{3}\\right)dx$$$$=\\frac{8}{3}\\int_{0}^{2}x^{3}dx+\\left[\\frac{8x^{3}}{3}-\\frac{x^{4}}{3}\\right]_{2}^{6}=\\frac{32}{3}+(144-16)=\\frac{416}{3}$$",
      src: { card: "tp08", note: "卡片例题（data/math3.js 的 EXAMPLE[\"tp08\"][2]）来源原文：2013 年数三真题。PITFALL[tp08] 无条目 → 省略 traps 字段。MNEM[tp08] 无条目 → 省略 hint 字段。" }
    },
    {
      id: "cv-m3-tp08-4", origin: 'card', year: 2025, school: "全国硕士研究生招生考试-数学三 2025 年", no: "卡片 tp08-4", type: "dblint", star: 5,
      tags: ["tp08"],
      stem: "（2025 数三）设 $D=\\{(x,y)\\mid y^{2}\\le x,\\ x^{2}\\le y\\}$，计算 $\\iint_{D}(x-y+1)^{2}\\,dxdy$。",
      answer: "区域由 $x=y^{2}$ 与 $y=x^{2}$ 围成，即 $0\\le x\\le1,\\ x^{2}\\le y\\le\\sqrt{x}$。$$\\iint_{D}(x-y+1)^{2}dxdy=\\int_{0}^{1}dx\\int_{x^{2}}^{\\sqrt{x}}(x-y+1)^{2}dy$$对 $y$ 积分 $\\int(x-y+1)^{2}dy=-\\dfrac{(x-y+1)^{3}}{3}$，代入上下限再对 $x$ 积分（展开 $x$ 的多项式幂并逐项积分）得$$\\iint_{D}(x-y+1)^{2}dxdy=\\frac{71}{210}$$",
      src: { card: "tp08", note: "卡片例题（data/math3.js 的 EXAMPLE[\"tp08\"][3]）来源原文：2025 年数三真题。PITFALL[tp08] 无条目 → 省略 traps 字段。MNEM[tp08] 无条目 → 省略 hint 字段。" }
    },
    {
      id: "cv-m3-tp09", origin: 'card', year: 2024, school: "全国硕士研究生招生考试-数学三 2024 年", no: "卡片 tp09", type: "linalg", star: 5,
      tags: ["tp09"],
      stem: "（2024 数三）设 $A=\\begin{pmatrix}1&-1&0&-1\\\\1&1&0&3\\\\2&1&2&6\\end{pmatrix}$，$B=\\begin{pmatrix}1&0&1&2\\\\1&-1&a&a-1\\\\2&-3&2&-2\\end{pmatrix}$，$\\alpha=(0,2,3)^{T}$，$\\beta=(1,0,-1)^{T}$。(Ⅰ) 证明 $Ax=\\alpha$ 的解都是 $Bx=\\beta$ 的解；(Ⅱ) 若 $Ax=\\alpha$ 与 $Bx=\\beta$ 有不同的解，求 $a$。",
      answer: "(Ⅰ) 解 $Ax=\\alpha$：由 $x_1-x_2-x_4=0,\\ x_1+x_2+3x_4=2,\\ 2x_1+x_2+2x_3+6x_4=3$ 得通解 $x=(1,1,0,0)^{T}+t(-1,-2,-1,1)^{T}$。代入 $Bx$：$B(1,1,0,0)^{T}=(1,0,-1)^{T}=\\beta$，且 $B(-1,-2,-1,1)^{T}=(0,0,0)^{T}$，故 $Ax=\\alpha$ 的解均满足 $Bx=\\beta$。(Ⅱ) 对增广矩阵 $(B\\mid\\beta)$ 作行变换：当 $a\\ne1$ 时两方程组同解；当 $a=1$ 时 $r(A\\mid\\alpha)\\ne r(B\\mid\\beta)$，解集不同。故 $a=1$。",
      src: { card: "tp09", note: "卡片例题（data/math3.js 的 EXAMPLE[\"tp09\"]）来源原文：2024 年数三真题。PITFALL[tp09] 无条目 → 省略 traps 字段。MNEM[tp09] 无条目 → 省略 hint 字段。" }
    },
    {
      id: "cv-m3-tp10", origin: 'card', year: 2025, school: "全国硕士研究生招生考试-数学三 2025 年", no: "卡片 tp10", type: "limit", star: 5,
      tags: ["tp10"],
      stem: "（2025 数三）设函数 $f(x)$ 在 $x=0$ 处连续，且 $\\lim_{x\\to0}\\dfrac{xf(x)-e^{2\\sin x}+1}{\\ln(1+x)+\\ln(1-x)}=-3$。证明 $f(x)$ 在 $x=0$ 处可导，并求 $f'(0)$。",
      answer: "$\\ln(1+x)+\\ln(1-x)=\\ln(1-x^{2})\\sim-x^{2}$，故分母是 $2$ 阶无穷小，分子 $N(x)=xf(x)-e^{2\\sin x}+1$ 必为 $2$ 阶无穷小，$N(x)\\sim3x^{2}$。由$$e^{2\\sin x}=1+2\\sin x+2\\sin^{2}x+o(x^{2})=1+2x+2x^{2}+o(x^{2})$$得 $xf(x)\\sim2x+5x^{2}$，即 $f(x)\\sim2+5x$。由连续性 $f(0)=2$，且$$f'(0)=\\lim_{x\\to0}\\frac{f(x)-f(0)}{x}=\\lim_{x\\to0}\\frac{5x+o(x)}{x}=5$$",
      src: { card: "tp10", note: "卡片例题（data/math3.js 的 EXAMPLE[\"tp10\"]）来源原文：2025 年数三真题。PITFALL[tp10] 无条目 → 省略 traps 字段。MNEM[tp10] 无条目 → 省略 hint 字段。" }
    },
    {
      id: "cv-m3-wr02", origin: 'card', year: 2026, school: "全国硕士研究生招生考试-数学三 2026 年", no: "卡片 wr02", type: "ode", star: 4,
      tags: ["wr02"],
      stem: "（2026 数三）微分方程 $y''-2y'=e^{x}$ 满足 $y(0)=1,\\ y'(0)=1$，则解 $y=$____",
      answer: "这是缺 $y$ 型可降阶方程。令 $p=y'$，则 $y''=p'$，方程化为 $p'-2p=e^{x}$（一阶线性）。由通解公式：$$p=e^{2x}\\Bigl[\\int e^{x}e^{-2x}dx+C\\Bigr]=e^{2x}\\bigl(-e^{-x}+C\\bigr)=-e^{x}+Ce^{2x}$$代入 $p(0)=y'(0)=1$ 得 $-1+C=1$，故 $C=2$，$y'=-e^{x}+2e^{2x}$。再积分：$$y=\\int\\bigl(-e^{x}+2e^{2x}\\bigr)dx=-e^{x}+e^{2x}+C_1$$由 $y(0)=1$ 得 $-1+1+C_1=1$，即 $C_1=1$。故$$y=1-e^{x}+e^{2x}$$",
      src: { card: "wr02", note: "卡片例题（data/math3.js 的 EXAMPLE[\"wr02\"]）来源原文：2026 年数三真题。PITFALL[wr02] 无条目 → 省略 traps 字段。MNEM[wr02] 无条目 → 省略 hint 字段。" }
    },
    {
      id: "cv-m3-wr03", origin: 'card', year: 2026, school: "全国硕士研究生招生考试-数学三 2026 年", no: "卡片 wr03", type: "integral", star: 5,
      tags: ["wr03"],
      stem: "（2026 数三）设 $p$ 为常数，反常积分 $\\int_{0}^{+\\infty}\\dfrac{\\arctan x}{x^{p}(x+1)}\\,dx$ 收敛，则 $p$ 的取值范围是____",
      answer: "需同时讨论 $x\\to0^{+}$ 与 $x\\to+\\infty$ 两端，故拆成 $\\int_0^1+\\int_1^{+\\infty}$。当 $x\\to0^{+}$ 时 $\\arctan x\\sim x$，被积函数 $\\sim\\dfrac{x}{x^{p}(x+1)}\\sim\\dfrac{1}{x^{p-1}}$，由瑕积分 $\\int_0^1\\frac{dx}{x^{q}}$ 收敛 $\\iff q<1$，得 $p-1<1$ 即 $p<2$。当 $x\\to+\\infty$ 时 $\\arctan x\\to\\frac{\\pi}{2}$，被积函数 $\\sim\\dfrac{\\pi/2}{x^{p+1}}$，由无穷积分收敛 $\\iff p+1>1$ 即 $p>0$。综上 $0<p<2$。",
      src: { card: "wr03", note: "卡片例题（data/math3.js 的 EXAMPLE[\"wr03\"]）来源原文：2026 年数三真题。PITFALL[wr03] 无条目 → 省略 traps 字段。MNEM[wr03] 无条目 → 省略 hint 字段。" }
    },
    {
      id: "cv-m3-zt01", origin: 'card', year: 2016, school: "全国硕士研究生招生考试-数学三 2016 年", no: "卡片 zt01", type: "limit", star: 5,
      tags: ["zt01"],
      stem: "求 $\\lim_{n\\to\\infty}\\frac{1}{n^{2}}\\left(\\sin\\frac{1}{n}+2\\sin\\frac{2}{n}+\\cdots+n\\sin\\frac{n}{n}\\right)$",
      answer: "由定积分定义：$$\\lim_{n\\to\\infty}\\sum_{k=1}^{n}\\frac{k}{n^{2}}\\sin\\frac{k}{n}=\\int_{0}^{1}x\\sin x\\,dx$$再由分部积分：$$\\int_{0}^{1}x\\sin x\\,dx=-x\\cos x\\Big|_{0}^{1}+\\int_{0}^{1}\\cos x\\,dx=\\left[-x\\cos x+\\sin x\\right]_{0}^{1}=\\sin1-\\cos1$$",
      src: { card: "zt01", note: "卡片例题（data/math3.js 的 EXAMPLE[\"zt01\"]）来源原文：2016 年数三真题。PITFALL[zt01] 无条目 → 省略 traps 字段。MNEM[zt01] 无条目 → 省略 hint 字段。" }
    },
    {
      id: "cv-m3-zt02", origin: 'card', year: 2025, school: "全国硕士研究生招生考试-数学三 2025 年", no: "卡片 zt02", type: "eigen", star: 5,
      tags: ["zt02"],
      stem: "（2025 数三）设 $A=\\begin{pmatrix}1&2\\\\-2&-a\\end{pmatrix}$，$B=\\begin{pmatrix}1&0\\\\1&a\\end{pmatrix}$，若 $f(x,y)=|xA+yB|$ 是正定二次型，则 $a$ 的取值范围是（ ）",
      answer: "$$xA+yB=\\begin{pmatrix}x+y&2x\\\\-2x+y&-ax+ay\\end{pmatrix}$$故$$f(x,y)=\\begin{vmatrix}x+y&2x\\\\-2x+y&a(y-x)\\end{vmatrix}=(4-a)x^{2}-2xy+a\\,y^{2}$$对应对称矩阵 $\\begin{pmatrix}4-a&-1\\\\-1&a\\end{pmatrix}$ 正定：$4-a>0$ 且 $(4-a)a-1>0$，即 $a<4$ 且 $a^{2}-4a+1<0$，解得 $a\\in(2-\\sqrt3,\\ 2+\\sqrt3)$。",
      traps: "二次型的矩阵必须对称：交叉项系数要对称地写成 $\\frac{a_{ij}}{2}$（$A_{ij}=A_{ji}$）。正定用顺序主子式全 $>0$ 判定；规范形平方项系数只取 $1,-1,0$。",
      src: { card: "zt02", note: "卡片例题（data/math3.js 的 EXAMPLE[\"zt02\"]）来源原文：2025 年数三真题。traps 取自 PITFALL[zt02]。MNEM[zt02] 无条目 → 省略 hint 字段。" }
    },
    {
      id: "cv-m3-zt03", origin: 'card', year: 2016, school: "全国硕士研究生招生考试-数学三 2016 年", no: "卡片 zt03", type: "proof", star: 4,
      tags: ["zt03"],
      stem: "证明：当 $x>0$ 时，$\\dfrac{x}{1+x}<\\ln(1+x)<x$",
      answer: "对 $f(t)=\\ln(1+t)$ 在 $[0,x]$ 用拉格朗日中值定理：存在 $\\xi\\in(0,x)$ 使 $\\ln(1+x)=\\dfrac{x}{1+\\xi}$；由 $0<\\xi<x$ 得 $\\dfrac{x}{1+x}<\\dfrac{x}{1+\\xi}<x$，即证。",
      src: { card: "zt03", note: "卡片例题（data/math3.js 的 EXAMPLE[\"zt03\"]）来源原文：2016 年数三真题。PITFALL[zt03] 无条目 → 省略 traps 字段。MNEM[zt03] 无条目 → 省略 hint 字段。" }
    },
    {
      id: "cv-m3-zt04", origin: 'card', year: 2019, school: "全国硕士研究生招生考试-数学三 2019 年", no: "卡片 zt04", type: "deriv", star: 5,
      tags: ["zt04"],
      stem: "（2019 数三）设 $f(x)=\\begin{cases}x^{2x},&x>0\\\\xe^{x}+1,&x\\le0\\end{cases}$，求 $f'(x)$ 并求 $f(x)$ 的极值。",
      answer: "$x>0$：$f'(x)=2x^{2x}(\\ln x+1)$；$x<0$：$f'(x)=e^{x}(x+1)$。由 $\\lim_{x\\to0^{+}}\\dfrac{x^{2x}-1}{x}=\\lim\\dfrac{2x\\ln x}{x}=-\\infty$，$f'(0)$ 不存在。令 $f'(x)=0$ 得驻点 $x=-1$ 与 $x=\\frac1e$。极小值 $f(-1)=1-\\frac1e$、$f\\left(\\frac1e\\right)=e^{-\\frac2e}$，极大值 $f(0)=1$。",
      traps: "判断拐点要看 $f''$ 在 $x_0$ 两侧是否变号（$f''(x_0)=0$ 只是必要条件，如 $f(x)=x^4$ 在 $0$ 处 $f''=0$ 但非拐点）；最值要比较端点、驻点与不可导点。",
      src: { card: "zt04", note: "卡片例题（data/math3.js 的 EXAMPLE[\"zt04\"]）来源原文：2019 年数三真题。traps 取自 PITFALL[zt04]。MNEM[zt04] 无条目 → 省略 hint 字段。" }
    },
    {
      id: "cv-m3-zt05", origin: 'card', year: 2023, school: "全国硕士研究生招生考试-数学三 2023 年", no: "卡片 zt05", type: "linalg", star: 5,
      tags: ["zt05"],
      stem: "（2023 数三）已知 $\\alpha_{1}=\\begin{pmatrix}1\\\\2\\\\3\\end{pmatrix}$，$\\alpha_{2}=\\begin{pmatrix}2\\\\1\\\\1\\end{pmatrix}$，$\\beta_{1}=\\begin{pmatrix}2\\\\5\\\\9\\end{pmatrix}$，$\\beta_{2}=\\begin{pmatrix}1\\\\0\\\\1\\end{pmatrix}$。若 $\\gamma$ 既可由 $\\alpha_{1},\\alpha_{2}$ 线性表示，也可由 $\\beta_{1},\\beta_{2}$ 线性表示，则 $\\gamma=$（ ）(A) $k(3,3,4)^{T}$；(B) $k(3,5,10)^{T}$；(C) $k(-1,1,2)^{T}$；(D) $k(1,5,8)^{T}$",
      answer: "设 $\\gamma=x_{1}\\alpha_{1}+x_{2}\\alpha_{2}=x_{3}\\beta_{1}+x_{4}\\beta_{2}$，即 $x_{1}\\alpha_{1}+x_{2}\\alpha_{2}-x_{3}\\beta_{1}-x_{4}\\beta_{2}=0$。对 $(\\alpha_{1},\\alpha_{2},-\\beta_{1},-\\beta_{2})=\\begin{pmatrix}1&2&-2&-1\\\\2&1&-5&0\\\\3&1&-9&-1\\end{pmatrix}$ 作行变换得行最简形 $\\begin{pmatrix}1&0&0&3\\\\0&1&0&-1\\\\0&0&1&1\\end{pmatrix}$，通解 $x_{1}=-3x_{4},\\ x_{2}=x_{4},\\ x_{3}=-x_{4}$。故$$\\gamma=x_{1}\\alpha_{1}+x_{2}\\alpha_{2}=k(1,5,8)^{T}\\ (k\\in\\mathbb R)$$选 (D)。",
      traps: "向量组相关/无关看 $r(A)$ 与向量个数的关系；找极大无关组用\"主元列\"；向量组等价要 $r(A)=r(B)=r(A\\cup B)$，仅 $r(A)\\le r(B)$ 不等于等价。",
      src: { card: "zt05", note: "卡片例题（data/math3.js 的 EXAMPLE[\"zt05\"]）来源原文：2023 年数三真题。traps 取自 PITFALL[zt05]。MNEM[zt05] 无条目 → 省略 hint 字段。" }
    },
    {
      id: "cv-m3-zt06", origin: 'card', year: 2022, school: "全国硕士研究生招生考试-数学三 2022 年", no: "卡片 zt06", type: "limit", star: 5,
      tags: ["zt06"],
      stem: "（2022 数三）求极限 $\\lim_{x\\to0}\\left(\\dfrac{1+e^{x}}{2}\\right)^{\\cot x}$",
      answer: "这是 $1^{\\infty}$ 型。由 $e^{x}-1\\sim x$：$$\\ln\\frac{1+e^{x}}{2}=\\ln\\left(1+\\frac{e^{x}-1}{2}\\right)\\sim\\frac{e^{x}-1}{2}\\sim\\frac{x}{2}$$又 $\\cot x\\sim\\dfrac1x$，故对数极限 $=\\dfrac12$，原式 $=e^{\\frac12}=\\sqrt{e}$。",
      traps: "$1^\\infty$ 型把 $\\ln u$ 用 $\\ln u\\sim u-1$（$u\\to1$）替换成 $\\lim v(u-1)$；取对数后勿忘最后写回 $e$ 指数。$0^0$、$\\infty^0$ 型同样先取对数。",
      hint: "幂指 $u^{v}$ 一律先取对数 $=e^{v\\ln u}$；$1^\\infty$ 型快捷：$\\lim u^{v}=e^{\\lim v(u-1)}$。",
      src: { card: "zt06", note: "卡片例题（data/math3.js 的 EXAMPLE[\"zt06\"]）来源原文：2022 年数三真题。traps 取自 PITFALL[zt06]。hint 取自 MNEM[zt06]。" }
    },
    {
      id: "cv-m3-zt07", origin: 'card', year: 2022, school: "全国硕士研究生招生考试-数学三 2022 年", no: "卡片 zt07", type: "series", star: 4,
      tags: ["zt07"],
      stem: "（2022 数三）求幂级数 $\\sum_{n=0}^{\\infty}\\frac{(-4)^{n}+1}{4^{n}(2n+1)}x^{2n}$ 的收敛域及和函数。",
      answer: "比值判别：$\\left|\\dfrac{u_{n+1}}{u_n}\\right|\\to x^{2}$，故 $|x|<1$ 收敛；$x=\\pm1$ 时分别为 $\\sum\\dfrac{(-1)^n}{2n+1}$ 与 $\\sum\\dfrac{1}{2n+1}$ 的收敛组合，均收敛。收敛域 $[-1,1]$。记$$S(x)=S_1(x)+S_2(x),\\quad S_1=\\sum_{n=0}^{\\infty}\\frac{(-1)^{n}x^{2n}}{2n+1},\\quad S_2=\\sum_{n=0}^{\\infty}\\frac{x^{2n}}{4^{n}(2n+1)}$$由 $\\sum(-1)^{n}\\dfrac{x^{2n+1}}{2n+1}=\\arctan x$、$\\sum\\dfrac{x^{2n}}{4^n}=\\dfrac{1}{1-x^{2}/4}$，得$$S(x)=\\frac{\\arctan x}{x}+\\frac{1}{x}\\ln\\frac{2+x}{2-x}\\ (x\\ne0),\\qquad S(0)=2$$",
      traps: "幂级数求和：分母有 $n$／$(2n+1)$ 先导后积，分子有 $n$ 先积后导；先积后导勿漏 $S(0)$ 常数。",
      hint: "幂级数求和目标：凑成 $\\frac{1}{1-x}$、$\\ln(1-x)$、$\\arctan x$ 等已知展开；\"分母有 n 先求导、分子有 n 先积分\"。",
      src: { card: "zt07", note: "卡片例题（data/math3.js 的 EXAMPLE[\"zt07\"]）来源原文：2022 年数三真题。traps 取自 PITFALL[zt07]。hint 取自 MNEM[zt07]。" }
    },
    {
      id: "cv-m3-int33", origin: 'card', year: 2025, school: "全国硕士研究生招生考试-数学三 2025 年", no: "卡片 int33", type: "integral", star: 5,
      tags: ["int33"],
      stem: "（2025 数三）设 $f(x)=\\int_0^x e^{t^2}\\sin t\\,dt$，$g(x)=\\int_0^x e^{t^2}\\,dt\\cdot\\sin^2x$。判断 $x=0$ 是否为 $f$、$g$ 的极值点，点 $(0,0)$ 是否为曲线 $y=g(x)$ 的拐点。",
      answer: "$f'(x)=e^{x^2}\\sin x$：在 $x=0$ 两侧由负变正，故 $x=0$ 是 $f$ 的极小值点。\n$g'(x)=e^{x^2}\\sin^2x+2\\sin x\\cos x\\int_0^x e^{t^2}dt$，$g'(0)=0$；\n$g''(x)=2xe^{x^2}\\sin^2x+4e^{x^2}\\sin x\\cos x+2\\cos 2x\\int_0^x e^{t^2}dt$，$g''(0)=0$；\n$g'''(0)=4>0$，故 $g''$ 在 $x=0$ 附近由负变正 $\\Rightarrow$ $(0,0)$ 是 $g$ 的拐点，且 $g'(x)\\ge0$（两侧同号），$x=0$ 不是 $g$ 的极值点。\n方法：变限积分定义的函数判极值/拐点，先求 $f'(x_0)$，为零则逐阶求导看变号（高阶导数判别法）。",
      src: { card: "int33", note: "卡片例题（data/math3.js 的 EXAMPLE[\"int33\"]）来源原文：2025 年数三真题。PITFALL[int33] 无条目 → 省略 traps 字段。MNEM[int33] 无条目 → 省略 hint 字段。" }
    },
    {
      id: "cv-m3-ser18", origin: 'card', year: 2025, school: "全国硕士研究生招生考试-数学三 2025 年", no: "卡片 ser18", type: "series", star: 5,
      tags: ["ser18"],
      stem: "（2025 数三）判断级数 $\\sum_{n=1}^{\\infty}(-1)^n\\left[\\frac1n-\\ln\\left(1+\\frac{k}{n^2}\\right)\\right]$（$k$ 为常数）的敛散性。",
      answer: "（2025 数三真题）记 $u_n=\\frac1n-\\ln\\left(1+\\frac{k}{n^2}\\right)$。\n① 绝对收敛？$n\\to\\infty$ 时 $\\ln\\left(1+\\frac{k}{n^2}\\right)\\sim\\frac{k}{n^2}$ 是比 $\\frac1n$ 高阶的无穷小，故 $u_n\\sim\\frac1n$，$\\sum|u_n|$ 与调和级数同阶、发散。\n② 原级数：$u_n\\to0^+$，且 $n$ 充分大后 $u_n$ 单调递减（$\\frac{d}{dx}\\left[\\frac1x-\\ln\\left(1+\\frac{k}{x^2}\\right)\\right]=-\\frac{1}{x^2}+\\frac{2k}{x^2(x^2+k)}$，当 $x^2>2k$ 时为负），由莱布尼茨判别法收敛。\n③ 结论：条件收敛，与 $k$ 无关（$k$ 只影响收敛快慢）。关键：高阶无穷小不改变与 $\\frac1n$ 的同阶性。",
      src: { card: "ser18", note: "卡片例题（data/math3.js 的 EXAMPLE[\"ser18\"]）来源原文：2025 年数三真题。PITFALL[ser18] 无条目 → 省略 traps 字段。MNEM[ser18] 无条目 → 省略 hint 字段。" }
    },
    {
      id: "cv-m3-gx01", origin: 'card', year: 2025, school: "全国硕士研究生招生考试-数学三 2025 年", no: "卡片 gx01", type: "limit", star: 3,
      tags: ["gx01"],
      stem: "（2025 数三）设 $g(x)$ 是函数 $f(x)=\\frac{1}{2}\\ln\\dfrac{3+x}{3-x}$ 的反函数，求曲线 $y=g(x)$ 的渐近线方程",
      answer: "由 $y=f(x)=\\frac12\\ln\\frac{3+x}{3-x}$ 解出 $x$：$e^{2y}=\\frac{3+x}{3-x}$，得 $x=3\\cdot\\frac{e^{2y}-1}{e^{2y}+1}$，故 $g(x)=3\\cdot\\frac{e^{2x}-1}{e^{2x}+1}$。$\\lim_{x\\to+\\infty}g(x)=3$、$\\lim_{x\\to-\\infty}g(x)=-3$，曲线有两条水平渐近线 $y=3$ 与 $y=-3$。",
      src: { card: "gx01", note: "卡片例题（data/math3.js 的 EXAMPLE[\"gx01\"]）来源原文：2025 年数三真题。PITFALL[gx01] 无条目 → 省略 traps 字段。MNEM[gx01] 无条目 → 省略 hint 字段。" }
    },
    {
      id: "cv-m3-gx10", origin: 'card', year: 2003, school: "全国硕士研究生入学统一考试-数学三 2003 年", no: "卡片 gx10", type: "limit", star: 4,
      tags: ["gx10"],
      stem: "求 $\\lim_{n\\to\\infty}\\sqrt[n]{2^{n}+3^{n}}$",
      answer: "提出最大项：$\\sqrt[n]{3^{n}\\left[\\left(\\frac23\\right)^{n}+1\\right]}=3\\cdot\\sqrt[n]{1+\\left(\\frac23\\right)^{n}}\\to3\\cdot1=3$（抓大头公式：极限等于最大项 3）。",
      src: { card: "gx10", note: "卡片例题（data/math3.js 的 EXAMPLE[\"gx10\"]）来源原文：2003 年数三真题。PITFALL[gx10] 无条目 → 省略 traps 字段。MNEM[gx10] 无条目 → 省略 hint 字段。" }
    },
    {
      id: "cv-m3-gx13", origin: 'card', year: 2018, school: "全国硕士研究生招生考试-数学三 2018 年", no: "卡片 gx13", type: "deriv", star: 5,
      tags: ["gx13"],
      stem: "（2018 数三）设 $f(x)=\\cos\\sqrt{|x|}$，求 $f$ 在 $x=0$ 处的左、右导数，并判断 $f$ 在 $x=0$ 处是否可导",
      answer: "$f_{+}{}'(0)=\\lim_{h\\to0^{+}}\\frac{\\cos\\sqrt{h}-1}{h}=\\lim\\frac{-\\frac12(\\sqrt h)^{2}}{h}=-\\frac12$；$f_{-}{}'(0)=\\lim_{h\\to0^{-}}\\frac{\\cos\\sqrt{-h}-1}{h}=\\lim\\frac{-\\frac12(-h)}{h}=\\frac12$。左右导数存在但不相等，故 $f$ 在 $x=0$ 处不可导。",
      src: { card: "gx13", note: "卡片例题（data/math3.js 的 EXAMPLE[\"gx13\"]）来源原文：2018 年数三真题。PITFALL[gx13] 无条目 → 省略 traps 字段。MNEM[gx13] 无条目 → 省略 hint 字段。" }
    },
    {
      id: "cv-m3-gx17", origin: 'card', year: 2018, school: "全国硕士研究生招生考试-数学三 2018 年", no: "卡片 gx17", type: "deriv", star: 3,
      tags: ["gx17"],
      stem: "（2018 数三）设函数 $f(x)$ 满足 $f(x+\\Delta x)-f(x)=2x\\,f(x)\\,\\Delta x+o(\\Delta x)$（$\\Delta x\\to0$），且 $f(0)=2$，求 $f(1)$",
      answer: "由可微定义，$\\Delta y=2xf(x)\\Delta x+o(\\Delta x)$ 表明 $f$ 可微且 $f'(x)=2xf(x)$——可分离变量方程。解得 $\\frac{df}{f}=2x\\,dx\\Rightarrow\\ln f=x^{2}+C$，$f=Ce^{x^{2}}$；由 $f(0)=2$ 得 $C=2$，故 $f(1)=2e$。",
      src: { card: "gx17", note: "卡片例题（data/math3.js 的 EXAMPLE[\"gx17\"]）来源原文：2018 年数三真题。PITFALL[gx17] 无条目 → 省略 traps 字段。MNEM[gx17] 无条目 → 省略 hint 字段。" }
    },
    {
      id: "cv-m3-gx22", origin: 'card', year: 2018, school: "全国硕士研究生招生考试-数学三 2018 年", no: "卡片 gx22", type: "deriv", star: 4,
      tags: ["gx22"],
      stem: "（2018 数三）曲线 $y=x^{2}+2\\ln x$ 在其拐点处的切线方程是____",
      answer: "$y'=2x+\\frac2x$，$y''=2-\\frac{2}{x^{2}}=0\\Rightarrow x=1$（$x>0$）。$x<1$ 时 $y''<0$ 凸、$x>1$ 时 $y''>0$ 凹，$(1,1)$ 是拐点；$y'(1)=4$，切线 $y-1=4(x-1)$，即 $y=4x-3$。",
      src: { card: "gx22", note: "卡片例题（data/math3.js 的 EXAMPLE[\"gx22\"]）来源原文：2018 年数三真题。PITFALL[gx22] 无条目 → 省略 traps 字段。MNEM[gx22] 无条目 → 省略 hint 字段。" }
    },
    {
      id: "cv-m3-gx23", origin: 'card', year: 2016, school: "全国硕士研究生招生考试-数学三 2016 年", no: "卡片 gx23", type: "deriv", star: 5,
      tags: ["gx23"],
      stem: "（2016 数三）设函数 $f(x)$ 在 $(-\\infty,+\\infty)$ 内连续，其导函数的图形已知（含若干零点与不变号区间），判断 $f$ 的极值点个数与曲线 $y=f(x)$ 的拐点个数",
      answer: "方法：导函数图形的每个**变号零点**对应一个极值点（正变负极大、负变正极小，不变号则非极值）；$f'$ 的每个**变号零点**同时也是 $f''$ 的零点——其两侧 $f''$（即 $f'$ 的增减）变号处为拐点，此外 $f'$ 的**无穷型间断/不可导点**处若 $f'$ 变号也产生拐点。逐点清点即得（本题答案为 3 个极值点、2 个拐点，选 D）。",
      traps: "计数公式只对多项式成立：k₁+2k₂+k₃−1 与 k₁+2k₂+3k₃−2——重数 n=1 计入 k₁，勿漏单根。",
      src: { card: "gx23", note: "卡片例题（data/math3.js 的 EXAMPLE[\"gx23\"]）来源原文：2016 年数三真题。traps 取自 PITFALL[gx23]。MNEM[gx23] 无条目 → 省略 hint 字段。" }
    },
    {
      id: "cv-m3-gx26", origin: 'card', year: 2000, school: "全国硕士研究生入学统一考试-数学三 2000 年", no: "卡片 gx26", type: "proof", star: 5,
      tags: ["gx26"],
      stem: "（2000 数三）设 $f(x)$ 在 $[0,\\pi]$ 上连续，且 $\\int_{0}^{\\pi}f(x)\\cos x\\,dx=0$，$\\int_{0}^{\\pi}f(x)\\sin x\\,dx=0$，证明：存在 $\\xi\\in(0,\\pi)$ 使 $f'(\\xi)=0$ 类问题的辅助函数思想——对含 $f'\\cos x+f\\sin x$ 结构的结论，令 $F(x)=f(x)\\sin x$",
      answer: "构造 $F(x)=f(x)\\sin x$：$F'(x)=f'(x)\\sin x+f(x)\\cos x$。由两个积分条件与 $\\sin x$ 在 $(0,\\pi)$ 内恒正，用积分中值定理/罗尔原话可得 $F$ 在 $(0,\\pi)$ 内至少有三个零点，两次罗尔即得 $F''$ 的零点，进而完成证明——辅助函数的乘积结构正是 $f'\\sin x+f\\cos x$ 的来源。",
      src: { card: "gx26", note: "卡片例题（data/math3.js 的 EXAMPLE[\"gx26\"]）来源原文：2000 年数三真题。PITFALL[gx26] 无条目 → 省略 traps 字段。MNEM[gx26] 无条目 → 省略 hint 字段。" }
    },
    {
      id: "cv-m3-gx34", origin: 'card', year: 2024, school: "全国硕士研究生招生考试-数学三 2024 年", no: "卡片 gx34", type: "integral", star: 4,
      tags: ["gx34"],
      stem: "（2024 数三）计算 $\\int_{2}^{+\\infty}\\dfrac{5}{x^{4}+3x^{2}-4}\\,dx$",
      answer: "因式分解 $x^{4}+3x^{2}-4=(x^{2}+4)(x-1)(x+1)$，部分分式拆项后逐项积分，取极限得收敛值——有理函数积分的标准流程（分解→拆分→积分→取极限）。",
      src: { card: "gx34", note: "卡片例题（data/math3.js 的 EXAMPLE[\"gx34\"]）来源原文：2024 年数三真题。PITFALL[gx34] 无条目 → 省略 traps 字段。MNEM[gx34] 无条目 → 省略 hint 字段。" }
    },
    {
      id: "cv-m3-gx36", origin: 'card', year: 2017, school: "全国硕士研究生招生考试-数学三 2017 年", no: "卡片 gx36", type: "integral", star: 5,
      tags: ["gx36"],
      stem: "（2017 数三）计算 $\\int_{-\\pi}^{\\pi}\\left(\\sin^{3}x+\\sqrt{\\pi^{2}-x^{2}}\\right)dx$",
      answer: "奇函数 $\\sin^{3}x$ 在对称区间积分为 0；$\\sqrt{\\pi^{2}-x^{2}}$ 是上半圆 $y=\\sqrt{\\pi^{2}-x^{2}}$，积分即半圆面积 $\\frac12\\pi\\cdot\\pi^{2}=\\frac{\\pi^{3}}{2}$。总积分 $=\\frac{\\pi^{3}}{2}$——奇偶对称与几何意义联用。",
      traps: "区间再现只换被积函数不换区间长度——用 f(x)+f(a+b−x) 简化时别忘了除以 2。",
      src: { card: "gx36", note: "卡片例题（data/math3.js 的 EXAMPLE[\"gx36\"]）来源原文：2017 年数三真题。traps 取自 PITFALL[gx36]。MNEM[gx36] 无条目 → 省略 hint 字段。" }
    },
    {
      id: "cv-m3-gx38", origin: 'card', year: 2022, school: "全国硕士研究生招生考试-数学三 2022 年", no: "卡片 gx38", type: "integral", star: 4,
      tags: ["gx38"],
      stem: "（2022 数三）设 $I_1=\\int_0^1\\frac{\\ln(1+x)}{2(1+\\cos x)}dx$，$I_2=\\int_0^1\\frac{\\ln(1+x)}{1+\\cos x}dx$，$I_3=\\int_0^1\\frac{2x}{1+\\sin x}dx$，比较大小",
      answer: "被积函数同号时逐对比较：$\\frac{\\ln(1+x)}{2(1+\\cos x)}<\\frac{\\ln(1+x)}{1+\\cos x}$（分母减半）故 $I_1<I_2$；又 $\\ln(1+x)<x$ 且 $1+\\cos x<1+\\sin x$ 不恒成立——改用 $\\frac{\\ln(1+x)}{1+\\cos x}$ 与 $\\frac{x}{1+\\sin x}$ 逐点比较，$\\ln(1+x)<x$、$1+\\cos x\\le 2$ 联合放缩得 $I_2<I_3$。综上 $I_1<I_2<I_3$，选 A。",
      src: { card: "gx38", note: "卡片例题（data/math3.js 的 EXAMPLE[\"gx38\"]）来源原文：2022 年数三真题。PITFALL[gx38] 无条目 → 省略 traps 字段。MNEM[gx38] 无条目 → 省略 hint 字段。" }
    },
    {
      id: "cv-m3-gx49", origin: 'card', year: 2019, school: "全国硕士研究生招生考试-数学三 2019 年", no: "卡片 gx49", type: "series", star: 3,
      tags: ["gx49"],
      stem: "（2019 数三）设 $a_n=\\int_{0}^{1}x^{n}\\sqrt{1-x^{2}}\\,dx$（$n=0,1,2,\\cdots$），证明 $\\sum_{n=0}^{\\infty}a_n$ 收敛",
      answer: "对被积函数放缩：$0\\le x^{n}\\sqrt{1-x^{2}}\\le x^{n}\\le\\frac{1}{n+1}$？改用 $x^n\\le x^{n/2}\\cdot x^{n/2}$ 结构——更直接：$0\\le a_n\\le\\int_0^1 x^n dx=\\frac{1}{n+1}$，而 $\\sum\\frac{1}{n+1}$ 发散，此路不通；改放缩 $a_n\\le\\int_0^1 x^{2n}dx=\\frac{1}{2n+1}$？仍发散。正解：$x^{n}\\sqrt{1-x^{2}}\\le x^{n}(1-x^{2})^{0}$ 于 $[0,1/2]$ 与 $[1/2,1]$ 分段估计——$[1/2,1]$ 段 $x^{n}\\le(1/2)^{n}$，$[0,1/2]$ 段 $\\sqrt{1-x^2}\\le\\frac{\\sqrt3}{2}x$（凹性）得 $a_n\\le\\frac{\\sqrt3}{2}\\int_0^{1/2}x^{n+1}dx\\le C\\left(\\frac12\\right)^{n}$，几何级数收敛，比较判别法即证。",
      src: { card: "gx49", note: "卡片例题（data/math3.js 的 EXAMPLE[\"gx49\"]）来源原文：2019 年数三真题。PITFALL[gx49] 无条目 → 省略 traps 字段。MNEM[gx49] 无条目 → 省略 hint 字段。" }
    },
    {
      id: "cv-m3-gx51", origin: 'card', year: 2023, school: "全国硕士研究生招生考试-数学三 2023 年", no: "卡片 gx51", type: "series", star: 4,
      tags: ["gx51"],
      stem: "（2023 数三）已知 $a_n<b_n$。若级数 $\\sum a_n$ 与 $\\sum b_n$ 均收敛，则「$\\sum(a_n+b_n)$ 与 $\\sum\\left|a_n-b_n\\right|$」的收敛性判断",
      answer: "考察条件收敛与绝对收敛的运算规则：两收敛级数的和必收敛，故 $\\sum(a_n+b_n)$ 收敛；$\\left|a_n-b_n\\right|\\le\\left|a_n\\right|+\\left|b_n\\right|$，若两级数**绝对**收敛则比较判别得 $\\sum\\left|a_n-b_n\\right|$ 收敛；但仅条件收敛时（正项部分发散）$\\sum\\left|a_n-b_n\\right|$ 可能发散——结论取决于敛散类型，需按绝对/条件分类讨论。",
      traps: "比值/根值判别法判出 Σ|uₙ| 发散时 |uₙ| 不趋于 0，原级数必发散——但比较判别法得出发散无此结论。",
      src: { card: "gx51", note: "卡片例题（data/math3.js 的 EXAMPLE[\"gx51\"]）来源原文：2023 年数三真题。traps 取自 PITFALL[gx51]。MNEM[gx51] 无条目 → 省略 hint 字段。" }
    },
    {
      id: "cv-m3-gx52", origin: 'card', year: 2020, school: "全国硕士研究生招生考试-数学三 2020 年", no: "卡片 gx52", type: "series", star: 3,
      tags: ["gx52"],
      stem: "（2020 数三）设幂级数 $\\sum_{n=1}^{\\infty}n\\,a_{n}(x-2)^{n}$ 的收敛区间为 $(-1,5)$，求 $\\sum a_nx^{n}$ 的收敛半径",
      answer: "$(x-2)^{n}$ 表明展开点为 2、收敛区间 $(-1,5)$ 关于 2 对称、半径 $R_1=3$。逐项积分使收敛半径不变：$\\sum n\\,a_n(x-2)^{n-1}$ 与 $\\sum a_n(x-2)^{n}$ 收敛半径同为 3（$n\\,a_n$ 是 $a_n$ 逐项求导的系数，半径不变）。故 $\\sum a_nx^{n}$（展开点平移到 0）收敛半径 $R=3$。",
      src: { card: "gx52", note: "卡片例题（data/math3.js 的 EXAMPLE[\"gx52\"]）来源原文：2020 年数三真题。PITFALL[gx52] 无条目 → 省略 traps 字段。MNEM[gx52] 无条目 → 省略 hint 字段。" }
    },
    {
      id: "cv-m3-gx59", origin: 'card', year: 2023, school: "全国硕士研究生招生考试-数学三 2023 年", no: "卡片 gx59", type: "series", star: 3,
      tags: ["gx59"],
      stem: "（2023 数三）求幂级数 $\\sum_{n=0}^{\\infty}\\frac{x^{2n}}{(2n)!}$ 的和函数",
      answer: "逐项求导得 $S'(x)=\\sum\\frac{x^{2n-1}}{(2n-1)!}$，则 $S'(x)+S(x)=e^{x}$、$S(x)-S(-x)=2\\sinh x$——联立解得 $S(x)=\\frac{e^{x}+e^{-x}}{2}=\\cosh x$（双曲余弦）。",
      src: { card: "gx59", note: "卡片例题（data/math3.js 的 EXAMPLE[\"gx59\"]）来源原文：2023 年数三真题。PITFALL[gx59] 无条目 → 省略 traps 字段。MNEM[gx59] 无条目 → 省略 hint 字段。" }
    },
    {
      id: "cv-m3-gx62", origin: 'card', year: 2023, school: "全国硕士研究生招生考试-数学三 2023 年", no: "卡片 gx62", type: "dblint", star: 3,
      tags: ["gx62"],
      stem: "（2023 数三）计算二重积分 $\\iint_{D}x\\,dx\\,dy$，其中 $D$ 由 $(x-1)^{2}+y^{2}\\le1$ 围成",
      answer: "区域是圆——选极坐标：圆的极坐标方程 $r=2\\cos\\theta$（$-\\frac\\pi2\\le\\theta\\le\\frac\\pi2$）。$\\iint_D x\\,dxdy=\\int_{-\\pi/2}^{\\pi/2}d\\theta\\int_0^{2\\cos\\theta}r\\cos\\theta\\cdot r\\,dr=\\int_{-\\pi/2}^{\\pi/2}\\frac{16}{3}\\cos^{4}\\theta\\,d\\theta=\\frac{16}{3}\\cdot\\frac{3\\pi\\cdot2}{16}=\\pi$（点火公式）。",
      src: { card: "gx62", note: "卡片例题（data/math3.js 的 EXAMPLE[\"gx62\"]）来源原文：2023 年数三真题。PITFALL[gx62] 无条目 → 省略 traps 字段。MNEM[gx62] 无条目 → 省略 hint 字段。" }
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