/* Athena 题库 · 考研数学三（POC：2012/2013/2019/2023/2024/2025 真题，共 23 题）
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
    { key: 'estimate', name: '参数估计（矩估计/最大似然）', def: '由总体概率密度求矩估计量与最大似然估计量。', judge: '题干出现「矩估计量/最大似然估计量」。', sample: '2013-Q23' }
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