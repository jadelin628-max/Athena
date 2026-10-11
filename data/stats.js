/*
 * 统计学 · 关键公式数据库（考研专业课水平：概率论 + 数理统计）
 * 结构与其他学科一致：id / cat / title / front / back + META[星级, 常考题型]
 */
window.SUBJECTS = window.SUBJECTS || {};
window.SUBJECTS.stats = (function () {
  const R = String.raw;

  const CATS = {
    prob_basic: '随机事件与概率',
    dist: '随机变量及分布',
    multidim: '多维随机变量',
    numchar: '数字特征',
    limit: '大数定律与中心极限定理',
    sampling: '抽样分布',
    estimation: '参数估计',
    testing: '假设检验',
    regress: '方差分析与回归'
  };

  const F = (id, cat, title, front, back) => ({ id, cat, title, front, back });

  const DATA = [
    // ============ 随机事件与概率 ============
    F('pb01', 'prob_basic', '样本空间与随机事件',
      R`什么是样本空间？什么是随机事件？`,
      R`样本空间 $\Omega$：一次试验中\textbf{所有可能结果}的集合（每个结果称为一个样本点 $\omega$）。随机事件是 $\Omega$ 的\textbf{子集}（某些样本点的集合），事件发生当且仅当试验结果属于该子集。
- 基本事件：单个样本点（不可再分）；必然事件：$\Omega$；不可能事件：$\varnothing$。
- 事件运算（集合运算）：交 $AB$（同时发生）、并 $A\cup B$（至少一个发生）、差 $A-B$（$A$ 发生而 $B$ 不发生）、对立 $\bar A$（$A$ 不发生）。
- 关系：$A\subset B$（$A$ 发生必有 $B$ 发生）；$AB=\varnothing$ 称 $A,B$ \textbf{互斥（不相容）}；若 $A\cup B=\Omega$ 且 $AB=\varnothing$ 则称\textbf{对立}。
- 对偶律（德摩根律）：$\overline{A\cup B}=\bar A\bar B$、$\overline{AB}=\bar A\cup\bar B$——「至少一个发生」的对立是「都不发生」，求并的对立转成对立的交。
易混：对立必互斥，但互斥未必对立——互斥只要求“不能同时发生”，对立还要求两者合起来覆盖全部结果。`),
    F('pb02', 'prob_basic', '古典概型',
      R`古典概型的概率计算公式`,
      R`$$P(A)=\frac{m}{n}$$（$m$ 为 $A$ 包含的基本事件数，$n$ 为基本事件总数）
\underline{适用条件}：① 样本空间由\textbf{有限}个等可能结果组成；② 每个基本事件发生的可能性相同。\underline{易混}：\textbf{不是}“等可能”时不能套用——应改用全概率或加权；$\frac{m}{n}$ 若无法直接数出，可用\textbf{排列组合}先数 $m$、$n$（注意“有序/无序”“放回/不放回”）。\underline{应用}：抽球/排队/取数、$n$ 个排列中含某特征的概率。`),
    F('pb03', 'prob_basic', '加法公式',
      R`写出概率的加法公式`,
      R`$$P(A\cup B)=P(A)+P(B)-P(AB)$$
\underline{适用}：任意两个事件（\textbf{不必互斥}）。\underline{易混}：\textbf{仅当 $A,B$ 互斥}（$AB=\varnothing$）时才退化为 $P(A)+P(B)$；若 $A,B$ 有交集而省略 $-P(AB)$ 会\textbf{重复计数}。三事件：$P(A\cup B\cup C)=P(A)+P(B)+P(C)-P(AB)-P(AC)-P(BC)+P(ABC)$（+交互项，符号交替）。\underline{应用}：“至少一个发生”类问题，或先取对立事件 $1-P(\bar A\bar B)$ 简化。`),
    F('pb04', 'prob_basic', '条件概率',
      R`条件概率的定义`,
      R`$$P(B\,|\,A)=\frac{P(AB)}{P(A)}\quad(P(A)>0)$$`),
    F('pb05', 'prob_basic', '乘法公式',
      R`写出概率的乘法公式`,
      R`$$P(AB)=P(A)\cdot P(B\,|\,A)$$`),
    F('pb06', 'prob_basic', '全概率公式',
      R`写出全概率公式`,
      R`若 $A_{1},\dots,A_{n}$ 为完备事件组，则$$P(B)=\sum_{i=1}^{n}P(A_{i})P(B\,|\,A_{i})$$`),
    F('pb07', 'prob_basic', '贝叶斯公式',
      R`写出贝叶斯公式`,
      R`$$P(A_{i}\,|\,B)=\frac{P(A_{i})P(B\,|\,A_{i})}{\sum_{j=1}^{n}P(A_{j})P(B\,|\,A_{j})}$$`),
    F('pb08', 'prob_basic', '事件的独立性',
      R`事件独立的定义`,
      R`$$P(AB)=P(A)P(B)$$（一个事件发生不影响另一个的概率）
- 推论：若 $A,B$ 独立，则 $A$ 与 $\bar B$、$\bar A$ 与 $B$、$\bar A$ 与 $\bar B$ 也都独立。
- 三个事件的独立性见「相互独立与两两独立」卡——两两独立不蕴含相互独立。`),
    F('pb09', 'prob_basic', '对立事件',
      R`对立事件的概率`,
      R`$$P(\bar{A})=1-P(A)$$`),
    F('pb10', 'prob_basic', '互斥事件',
      R`互斥（互不相容）事件的加法`,
      R`若 $AB=\varnothing$，则$$P(A\cup B)=P(A)+P(B)$$`),
    F('pb11', 'prob_basic', '概率的公理化性质',
      R`概率的三条公理`,
      R`非负性 $P(A)\ge0$；规范性 $P(\Omega)=1$；可列可加性。`),

    // ============ 随机变量及分布 ============
    F('rv01', 'dist', '分布函数',
      R`分布函数的定义`,
      R`$$F(x)=P(X\le x)$$
\underline{性质}：单调不减、左连续（$F(x-)=F(x)$）\textbf{右连续}、$F(-\infty)=0$、$F(+\infty)=1$、$0\le F(x)\le1$。\underline{用途}：由 $F$ 可求概率 $P(a<X\le b)=F(b)-F(a)$；$F$ 在 $x$ 处跳跃量 $F(x)-F(x-)=P(X=x)$（离散密度即“概率质量”）；连续型 $F'(x)=f(x)$。\underline{易混}：连续型 $P(X=x)=0$，但密度 $f(x)$ 可 $>1$；分布函数与密度是一对一变换关系，二者不独立。\underline{应用}：由 $X$ 分布函数 $F$ 求 $Y=g(X)$ 分布时常用 $F_Y(y)=P(g(X)\le y)$（分布函数法之入口）。`),
    F('rv02', 'dist', '分布函数性质',
      R`分布函数的性质`,
      R`单调不减、$F(-\infty)=0$、$F(+\infty)=1$、右连续。`),
    F('rv03', 'dist', '离散型分布律',
      R`离散型随机变量的分布律及其性质`,
      R`若 $X$ 取离散值 $x_{1},x_{2},\dots$，则分布律为$$P(X=x_{k})=p_{k},\qquad k=1,2,\dots$$
\underline{性质}：① $p_{k}\ge0$；② $\sum_{k}p_{k}=1$（归一性）；③ 分布函数 $F(x)=\sum_{x_{k}\le x}p_{k}$ 是右连续的分段常值（阶梯）函数，在 $x_{k}$ 处跳变 $p_{k}$。
\underline{常见分布律}：$0\text{-}1$：$P(X=1)=p$；二项 $B(n,p)$：$C_{n}^{k}p^{k}(1-p)^{n-k}$；泊松 $P(\lambda)$：$\dfrac{\lambda^{k}}{k!}e^{-\lambda}$；几何 $G(p)$：$(1-p)^{k-1}p$。
易混：分布律是“逐点概率”，只对\textbf{离散}变量定义；连续型变量用\textbf{密度} $f(x)$（逐点概率为 0），二者不可混用。`),
    F('rv04', 'dist', '连续型密度函数',
      R`连续型随机变量的密度函数`,
      R`$$P(a<X\le b)=\int_{a}^{b}f(x)\,dx,\qquad \int_{-\infty}^{+\infty}f(x)\,dx=1$$`),
    F('rv05', 'dist', R`$0\text{-}1$ 分布`,
      R`0-1 分布的分布律与数字特征`,
      R`$$P(X=1)=p,\ P(X=0)=1-p,\quad E=p,\ D=p(1-p)$$`),
    F('rv06', 'dist', '二项分布',
      R`二项分布 $X\sim B(n,p)$ 的分布律与数字特征`,
      R`$$P(X=k)=C_{n}^{k}p^{k}(1-p)^{n-k},\quad E=np,\ D=np(1-p)$$`),
    F('rv07', 'dist', '泊松分布',
      R`泊松分布 $X\sim P(\lambda)$ 的分布律与数字特征`,
      R`$$P(X=k)=\frac{\lambda^{k}}{k!}e^{-\lambda},\quad E=\lambda,\ D=\lambda$$`),
    F('rv08', 'dist', '几何分布',
      R`几何分布 $X\sim G(p)$ 的分布律与数字特征`,
      R`$$P(X=k)=(1-p)^{k-1}p,\quad E=\frac{1}{p},\ D=\frac{1-p}{p^{2}}$$
- \textbf{无记忆性}：$P(X>s+t\mid X>s)=P(X>t)$——已失败 $s$ 次，再等 $t$ 次才成功的概率与从头等待相同（离散版；连续版是指数分布的无记忆性）。
- 与负二项分布的关系：负二项是「第 $r$ 次成功所需的试验数」，$r=1$ 时即几何分布。`),
    F('rv09', 'dist', '均匀分布',
      R`均匀分布 $U(a,b)$ 的密度与数字特征`,
      R`$$f(x)=\frac{1}{b-a}\ (a<x<b),\quad E=\frac{a+b}{2},\ D=\frac{(b-a)^{2}}{12}$$`),
    F('rv10', 'dist', '指数分布',
      R`指数分布 $E(\lambda)$ 的密度与数字特征`,
      R`$$f(x)=\lambda e^{-\lambda x}\ (x>0),\quad E=\frac{1}{\lambda},\ D=\frac{1}{\lambda^{2}}$$`),
    F('rv11', 'dist', '正态分布',
      R`正态分布 $N(\mu,\sigma^{2})$ 的密度与数字特征`,
      R`$$f(x)=\frac{1}{\sqrt{2\pi}\,\sigma}e^{-\frac{(x-\mu)^{2}}{2\sigma^{2}}},\quad E=\mu,\ D=\sigma^{2}$$`),
    F('rv12', 'dist', '正态标准化',
      R`写出正态分布的标准化`,
      R`若 $X\sim N(\mu,\sigma^{2})$，则$$\frac{X-\mu}{\sigma}\sim N(0,1)$$`),
    F('rv13', 'dist', '标准正态分布',
      R`标准正态分布的密度`,
      R`$$f(x)=\frac{1}{\sqrt{2\pi}}e^{-x^{2}/2}$$`),
    F('rv14', 'dist', '离散型函数分布',
      R`离散型随机变量函数的分布`,
      R`若 $Y=g(X)$，则$$P(Y=y)=\sum_{g(x)=y}P(X=x)$$`),
    F('rv15', 'dist', '连续型函数分布',
      R`连续型随机变量函数的分布`,
      R`用分布函数法：$F_{Y}(y)=P(g(X)\le y)$，再求导得密度 $f_{Y}(y)$。`),
    F('rv16', 'dist', '正态分布线性性质',
      R`正态分布的线性变换`,
      R`若 $X\sim N(\mu,\sigma^{2})$，则$$aX+b\sim N(a\mu+b,\ a^{2}\sigma^{2})$$`),

    // ============ 多维随机变量 ============
    F('mv01', 'multidim', '联合分布函数',
      R`二维分布函数的定义与性质`,
      R`$$F(x,y)=P(X\le x,\ Y\le y)$$
- 性质：对每个变量单调不减、右连续；$F(-\infty,y)=F(x,-\infty)=0$、$F(+\infty,+\infty)=1$。
- \textbf{矩形概率公式}：$P(a<X\le b,\ c<Y\le d)=F(b,d)-F(a,d)-F(b,c)+F(a,c)$——四个顶点函数值交替加减。
- 离散型更常用\textbf{联合分布律} $P(X=x_i,\ Y=y_j)$ 的表格形式：边缘分布律按行/列求和，条件分布律用联合除以边缘。`),
    F('mv02', 'multidim', '边缘分布',
      R`二维连续型随机变量的边缘密度`,
      R`$$f_{X}(x)=\int_{-\infty}^{+\infty}f(x,y)\,dy,\qquad f_{Y}(y)=\int_{-\infty}^{+\infty}f(x,y)\,dx$$`),
    F('mv03', 'multidim', '条件分布',
      R`离散型的条件分布`,
      R`$$P(Y=y\,|\,X=x)=\frac{P(X=x,\ Y=y)}{P(X=x)}$$`),
    F('mv04', 'multidim', '随机变量独立',
      R`随机变量 $X,Y$ 相互独立的判定`,
      R`$X,Y$ 独立 $\iff F(x,y)=F_{X}(x)F_{Y}(y)\iff f(x,y)=f_{X}(x)f_{Y}(y)$。`),
    F('mv05', 'multidim', '二维正态分布',
      R`二维正态分布及其独立条件`,
      R`$$(X,Y)\sim N(\mu_{1},\mu_{2},\sigma_{1}^{2},\sigma_{2}^{2},\rho)$$独立当且仅当 $\rho=0$。`),
    F('mv06', 'multidim', '卷积公式',
      R`独立连续变量和的密度（卷积公式）`,
      R`$$f_{X+Y}(z)=\int_{-\infty}^{+\infty}f_{X}(x)f_{Y}(z-x)\,dx$$`),
    F('mv07', 'multidim', '极值分布',
      R`独立随机变量极大值、极小值的分布`,
      R`$$F_{\max}(z)=\prod_{i}F_{i}(z),\qquad F_{\min}(z)=1-\prod_{i}\left[1-F_{i}(z)\right]$$`),
    F('mv08', 'multidim', '二维均匀分布',
      R`区域 $D$ 上的二维均匀分布`,
      R`$$f(x,y)=\frac{1}{S_{D}},\quad (x,y)\in D$$`),
    F('mv09', 'multidim', '二维函数期望',
      R`二维随机变量函数的期望`,
      R`$$E[g(X,Y)]=\iint g(x,y)f(x,y)\,dx\,dy$$`),

    // ============ 数字特征 ============
    F('nc01', 'numchar', '期望的定义',
      R`期望的定义`,
      R`$$E(X)=\sum_{k}x_{k}p_{k}\quad\text{或}\quad E(X)=\int_{-\infty}^{+\infty}x f(x)\,dx$$`),
    F('nc02', 'numchar', '期望的线性性质',
      R`写出期望的线性性质`,
      R`$$E(aX+b)=aE(X)+b,\qquad E(X+Y)=E(X)+E(Y)$$`),
    F('nc03', 'numchar', '方差的定义',
      R`方差的定义`,
      R`$$D(X)=E\left[X-E(X)\right]^{2}$$`),
    F('nc04', 'numchar', '方差计算式',
      R`写出方差 $D(X)$ 的计算公式`,
      R`$$D(X)=E(X^{2})-[E(X)]^{2}$$`),
    F('nc05', 'numchar', '方差的性质',
      R`写出方差的性质`,
      R`$$D(aX+b)=a^{2}D(X)$$$$D(X\pm Y)=D(X)+D(Y)\pm 2\,\mathrm{Cov}(X,Y)$$（独立时 $\mathrm{Cov}=0$）`),
    F('nc06', 'numchar', '协方差',
      R`协方差的定义与计算公式`,
      R`$$\mathrm{Cov}(X,Y)=E(XY)-E(X)E(Y)$$`),
    F('nc07', 'numchar', '相关系数',
      R`相关系数 $\rho$ 的公式`,
      R`$$\rho=\frac{\mathrm{Cov}(X,Y)}{\sqrt{D(X)\,D(Y)}}$$`),
    F('nc08', 'numchar', '原点矩与中心矩',
      R`原点矩与中心矩`,
      R`原点矩 $\alpha_{k}=E(X^{k})$；中心矩 $\mu_{k}=E[(X-E(X))^{k}]$。`),
    F('nc09', 'numchar', '切比雪夫不等式',
      R`写出切比雪夫不等式`,
      R`$$P\{|X-E(X)|\ge\varepsilon\}\le\frac{D(X)}{\varepsilon^{2}}$$
\underline{适用}：对\textbf{任意}随机变量 $X$（不需知道分布），只要 $E(X)$、$D(X)$ 存在取有限值。\underline{说明}：\textbf{对任何分布都成立}的\textbf{粗}上界，通常给出很松的界，用于\textbf{理论证明}（如证相合性、大数定律），而非精确数值。\underline{等价}：$P\{|X-\mu|<\varepsilon\}\ge1-\frac{\sigma^2}{\varepsilon^2}$。\underline{易混}：这是\textbf{上界}，不是精确概率；分母是 $\varepsilon^2$，分子是方差 $\sigma^2$（不是标准差）；$\varepsilon$ 应以“距离 $E(X)$ 的范围”为准。\underline{应用}：证明样本均值 $\bar X$ 依概率收敛于 $\mu$（切比雪夫大数定律），或估“投币频率偏离概率”的概率界。`),
    F('nc10', 'numchar', '独立与不相关',
      R`独立与不相关的关系`,
      R`独立 $\Rightarrow$ 不相关（$\rho=0$）；不相关不一定独立（二维正态除外）。`),
    F('nc11', 'numchar', '条件期望',
      R`条件期望的定义`,
      R`$$E(Y\,|\,X=x)=\int_{-\infty}^{+\infty}y\,f(y\,|\,x)\,dy$$`),
    F('nc12', 'numchar', '协方差性质',
      R`协方差的性质`,
      R`$$\mathrm{Cov}(aX+b,\ cY+d)=ac\,\mathrm{Cov}(X,Y)$$`),
    F('nc13', 'numchar', '常见分布期望方差',
      R`常用分布的期望与方差汇总`,
      R`0-1：$p,\ p(1-p)$；二项：$np,\ np(1-p)$；泊松：$\lambda,\ \lambda$；均匀：$\frac{a+b}{2},\ \frac{(b-a)^{2}}{12}$；指数：$\frac1\lambda,\ \frac1{\lambda^{2}}$；正态：$\mu,\ \sigma^{2}$。`),

    // ============ 大数定律与中心极限定理 ============
    F('ll01', 'limit', '切比雪夫大数定律',
      R`切比雪夫大数定律的条件与结论式是什么？它与辛钦、马尔可夫大数定律有何区别？`,
      R`**切比雪夫大数定律**：设 $\{X_n\}$ **两两不相关**且方差**一致有界**（$D(X_n)\le C$ 对一切 $n$），则
$$\frac1n\sum_{i=1}^{n}X_i-\frac1n\sum_{i=1}^{n}E(X_i)\ \xrightarrow{\ P\ }\ 0;$$
特别地，$X_i$ 独立同分布时 $\bar X\xrightarrow{P}\mu$。
**证明骨架**：$D(\bar X)=\frac{1}{n^{2}}\sum_i D(X_i)\le\frac{C}{n}\to0$，再由切比雪夫不等式 $P(|\bar X-E\bar X|\ge\varepsilon)\le\frac{D(\bar X)}{\varepsilon^{2}}\to0$。
**与相邻定律的边界**：① **马尔可夫**（条件最弱）：只需 $\frac{1}{n^{2}}D(\sum X_i)\to0$；② **辛钦**（i.i.d. 且 $E|X_1|<\infty$）：**不需要方差存在**；③ **伯努利**：频率依概率收敛到概率；④ 把结论加强为「几乎必然收敛」的是**强大数定律**（另见卡）。
**常见考法**：给出序列的相关结构（如 $\rho_{ij}=$ 只与 $|i-j|$ 有关）判断是否满足某定律；用 $P(|X_n=\pm n^{\delta})=\frac12$ 型例求 $\delta$ 范围（马尔可夫条件 $\sum D(X_n)/n^{2}<\infty$）。
**适用**：只需均值型结论（相合性、频率稳定性）且方差信息可用时；条件为「两两不相关 + 方差一致有界」，不要求同分布。
**易混**：与辛钦大数定律分辨：切比雪夫型不要求同分布但要有限方差一致有界，辛钦型要求 i.i.d. 但**不要求**方差存在；结论都是依概率收敛，不是几乎必然收敛。`),
    F('ll02', 'limit', '辛钦大数定律',
      R`叙述辛钦大数定律`,
      R`若 $X_{1},\dots,X_{n}$ 独立同分布且 $E(X_{i})=\mu$，则$$\frac{1}{n}\sum_{i=1}^{n}X_{i}\ \overset{P}{\longrightarrow}\ \mu$$`),
    F('ll03', 'limit', '伯努利大数定律',
      R`伯努利大数定律`,
      R`频率依概率收敛于概率：$$\frac{n_{A}}{n}\ \overset{P}{\longrightarrow}\ p$$`),
    F('ll04', 'limit', '独立同分布中心极限定理',
      R`叙述独立同分布中心极限定理`,
      R`若 $X_{1},\dots,X_{n}$ 独立同分布，$E(X_{i})=\mu,\ D(X_{i})=\sigma^{2}$，则$$\frac{\sum_{i=1}^{n}X_{i}-n\mu}{\sqrt{n}\,\sigma}\ \overset{d}{\longrightarrow}\ N(0,1)$$`),
    F('ll05', 'limit', '棣莫弗-拉普拉斯定理',
      R`棣莫弗-拉普拉斯中心极限定理`,
      R`二项分布 $B(n,p)$ 当 $n$ 充分大时近似于 $N(np,\ np(1-p))$。`),
    F('ll06', 'limit', '大数定律与中心极限区别',
      R`大数定律与中心极限定理在考察对象、结论类型、适用条件上如何对照？`,
      R`**大数定律（LLN）**：结论是「平均值的稳定性」——$\frac1n\sum X_i-\frac1n\sum EX_i\xrightarrow{P}0$（依概率收敛到**常数**）；条件可弱到「i.i.d. + $E|X_1|<\infty$」（辛钦），研究的是**极限位置**。
**中心极限定理（CLT，i.i.d.）**：$E X_i=\mu$、$D X_i=\sigma^{2}\in(0,\infty)$ 时
$$\frac{\sum_{i=1}^{n}X_i-n\mu}{\sqrt n\,\sigma}\ \xrightarrow{\ d\ }\ N(0,1),\qquad\text{即}\quad \bar X\ \text{近似}\ N\Big(\mu,\ \frac{\sigma^{2}}{n}\Big).$$
刻画的是**分布形状与波动尺度**（$\bar X$ 的波动量级为 $\sigma/\sqrt n$，而 LLN 只说它趋于 0）。
**对照要点**：① 标准化尺度不同——LLN 看 $\bar X-\mu$，CLT 看 $\sqrt n(\bar X-\mu)$（后者**不趋于 0** 而趋于分布）；② 结论类型不同——依概率收敛 vs 依分布收敛；③ CLT 需要**有限方差**，LLN 的辛钦形式不需要；④ CLT 成立时 LLN 自动成立（依分布收敛到常数蕴含依概率收敛），反之不成立。
**用法**：CLT 用于近似计算概率（大样本 $P(\sum X_i\in[a,b])$，离散时加连续性校正 $\pm\frac12$），LLN 用于说明估计量相合、频率稳定等定性结论。
**口诀**：LLN 管位置（趋近常数），CLT 管形状（$\sqrt n$ 标准化后出正态）——看见 $\sqrt n(\bar X-\mu)$ 找 CLT，看见 $\bar X-\mu$ 趋 0 找 LLN。
**适用**：LLN 用于说明相合性、频率稳定等定性结论；CLT 用于**近似计算**大样本概率（离散情形加连续性校正 $\pm\frac12$）与构造近似区间。
**易混**：LLN 说的是 $\bar X$ 向常数收敛（波动尺度 $O(1)$），CLT 说的是 $\sqrt n$ 标准化后服从正态（波动尺度 $\sqrt n$）——一个是「趋近位置」、一个是「形状」；CLT 要求有限方差，且「$n$ 大 ⇒ 原数据正态」是常见误读。`),
    F('ll07', 'limit', '切比雪夫不等式用途',
      R`切比雪夫不等式的形式、使用条件与等号成立情形分别是什么？有哪些高频用法？`,
      R`**形式**（$\varepsilon>0$）：$$P\big(|X-E(X)|\ge\varepsilon\big)\ \le\ \frac{D(X)}{\varepsilon^{2}},\qquad\text{等价}\quad P\big(|X-E(X)|<\varepsilon\big)\ \ge\ 1-\frac{D(X)}{\varepsilon^{2}}.$$
（来自马尔可夫不等式 $P(|Y|\ge a)\le E|Y|/a$：取 $Y=(X-EX)^{2}$、$a=\varepsilon^{2}$。）
**使用条件**：只需**方差存在**——不要求知道分布、不要求独立、不要求连续性，这也是它的价值（分布未知时的万能上界）。
**等号成立情形**：仅当 $X$ 取两个值、且两个值恰为均值两侧等距极端值时（二点分布 $P(X=\pm\varepsilon)=\frac12$：$D(X)=\varepsilon^{2}$ 且 $P(|X-EX|\ge\varepsilon)=1$）成立；一般分布为严格小于，故它给的是**上界而非近似**。
**高频用法**：① 上界估计：$P(|X-\mu|\ge k\sigma)\le 1/k^{2}$（正态实际值 $k=3$ 为 0.0027，远小于 0.111——提醒「界很松」）；② 求样本量：$P(|\bar X-\mu|\ge\varepsilon)\le\frac{\sigma^{2}}{n\varepsilon^{2}}\le\alpha\Rightarrow n\ge\frac{\sigma^{2}}{\alpha\varepsilon^{2}}$；③ 证明切比雪夫大数定律（两两不相关 + 方差一致有界）；④ 与已知分布真实概率对比、判断某个上界估计是否可用。
**适用**：分布未知、只知 $D(X)$ 存在，需要粗估尾部概率上界时；区间须关于 $EX$ **对称**（$|X-EX|\ge\varepsilon$），也可用来证大数定律（对 $\bar X$ 施用）。
**易混**：切比雪夫不等式是马尔可夫不等式对 $(X-EX)^2$ 的推论：$P(|X-EX|\ge\varepsilon)\le D(X)/\varepsilon^2$；等号在两点分布处取得，故它是**可达到的**上界而非粗糙估计；它给上界不给下界。`),

    // ============ 抽样分布 ============
    F('sm01', 'sampling', '总体与样本',
      R`总体与简单随机样本`,
      R`样本 $X_{1},\dots,X_{n}$ 相互独立且与总体同分布。`),
    F('sm02', 'sampling', '样本均值',
      R`样本均值的定义`,
      R`$$\bar{X}=\frac{1}{n}\sum_{i=1}^{n}X_{i}$$`),
    F('sm03', 'sampling', '样本方差',
      R`样本方差的定义`,
      R`$$S^{2}=\frac{1}{n-1}\sum_{i=1}^{n}(X_{i}-\bar{X})^{2}$$`),
    F('sm04', 'sampling', '样本均值的分布',
      R`正态总体样本均值的分布`,
      R`若 $X\sim N(\mu,\sigma^{2})$，则$$\bar{X}\sim N\left(\mu,\ \frac{\sigma^{2}}{n}\right)$$`),
    F('sm05', 'sampling', '卡方分布',
      R`$\chi^{2}$ 分布的定义`,
      R`若 $Z_{1},\dots,Z_{n}\overset{iid}{\sim}N(0,1)$，则$$\sum_{i=1}^{n}Z_{i}^{2}\sim\chi^{2}(n)$$`),
    F('sm06', 'sampling', '样本方差与卡方',
      R`样本方差与 $\chi^{2}$ 分布的关系`,
      R`若 $X\sim N(\mu,\sigma^{2})$，则$$\frac{(n-1)S^{2}}{\sigma^{2}}\sim\chi^{2}(n-1)$$`),
    F('sm07', 'sampling', R`$t$ 分布`,
      R`$t$ 分布的定义`,
      R`若 $Z\sim N(0,1)$，$V\sim\chi^{2}(n)$ 独立，则$$T=\frac{Z}{\sqrt{V/n}}\sim t(n)$$`),
    F('sm08', 'sampling', R`$F$ 分布`,
      R`$F$ 分布的定义与性质`,
      R`若 $U\sim\chi^{2}(m)$、$V\sim\chi^{2}(n)$ 且相互\textbf{独立}，则$$F=\frac{U/m}{V/n}\sim F(m,n)$$
其中第一自由度 $m$ 对应分子、第二自由度 $n$ 对应分母（\textbf{顺序不可颠倒}）。
\underline{性质}：① $F>0$；② $\dfrac1F\sim F(n,m)$（倒数互换自由度），故 $F_{1-\alpha}(m,n)=\dfrac{1}{F_{\alpha}(n,m)}$；③ 若 $T\sim t(n)$，则 $T^{2}\sim F(1,n)$。
\underline{应用}：两正态总体方差比 $F=\dfrac{S_{1}^{2}/\sigma_{1}^{2}}{S_{2}^{2}/\sigma_{2}^{2}}$；单因素方差分析 $F=\dfrac{SSA/(k-1)}{SSE/(n-k)}\sim F(k-1,\ n-k)$。`),
    F('sm09', 'sampling', '上侧分位数',
      R`上侧分位数的定义`,
      R`$z_{\alpha}$ 满足 $P(Z>z_{\alpha})=\alpha$；$t_{\alpha}$、$\chi^{2}_{\alpha}$、$F_{\alpha}$ 同理。`),
    F('sm10', 'sampling', '三大抽样分布关系',
      R`三大抽样分布的关系`,
      R`标准正态平方和 $\to\chi^{2}$；正态与 $\sqrt{\chi^{2}/n}$ 之商 $\to t$；两个 $\chi^{2}$ 之比 $\to F$。`),

    // ============ 参数估计 ============
    F('est01', 'estimation', '点估计与估计量',
      R`点估计与估计量`,
      R`用样本统计量 $\hat{\theta}(X_{1},\dots,X_{n})$ 估计总体参数 $\theta$。`),
    F('est02', 'estimation', '无偏性',
      R`无偏性`,
      R`$$E(\hat{\theta})=\theta$$`),
    F('est03', 'estimation', '有效性',
      R`无偏估计的「有效性」如何定义？有效估计、UMVUE 与渐近有效有什么区别？`,
      R`**定义（同无偏比方差）**：设 $\hat\theta_1,\hat\theta_2$ 都是 $\theta$ 的无偏估计，若
$$D(\hat\theta_1)\ \le\ D(\hat\theta_2)\quad(\text{对一切 }\theta\in\Theta)$$
则称 $\hat\theta_1$ 比 $\hat\theta_2$ **有效**。
**三个层次**：① **一致最小方差无偏估计（UMVUE）**＝所有无偏估计中方差一致最小者（若存在则唯一，两个 UMVUE 几乎必然相等）；② **有效估计**＝方差达到 C-R 下界 $\frac{1}{nI(\theta)}$ 的无偏估计，此时它必是 UMVUE；有效率 $e(\hat\theta)=\frac{1/(nI(\theta))}{D(\hat\theta)}\le1$；③ **渐近有效**＝大样本下渐近方差达到下界（极大似然估计的典型性质）。
**比较与注意**：方差相同则再比较 MSE、相合性等；**有偏**估计不能只比方差，用 $MSE(\hat\theta)=D(\hat\theta)+b^{2}(\theta)$ 综合比较（同 MSE 时方差小者优）。
**例（正态，$\mu$ 已知）**：$\hat\sigma_1^{2}=\frac1n\sum(X_i-\mu)^{2}$ 是无偏估计且方差达到 C-R 下界（有效），而 $\frac1n\sqrt{\frac{\pi}{2}}\sum|X_i-\mu|$ 是 $\sigma$ 的无偏估计但效率小于 1（不有效）。
**适用**：在同为无偏的估计量之间比优劣（$D(\hat\theta_1)\le D(\hat\theta_2)$ 则 $\hat\theta_1$ 更有效），或用相对有效性 $e=D(\hat\theta_2)/D(\hat\theta_1)$ 量化。
**易混**：有效性比较必须**同为无偏**；跨类比较要用 MSE（偏差换方差的情形下 MSE 小的未必「更有效」）；UMVUE 是所有无偏估计中方差最小者，在单参数指数族下「有效」与「UMVUE」一致，其他场合未必。`),
    F('est04', 'estimation', '一致性',
      R`一致性（相合性）`,
      R`$$\hat{\theta}_{n}\ \overset{P}{\longrightarrow}\ \theta$$`),
    F('est05', 'estimation', '矩估计',
      R`叙述矩估计的基本思想`,
      R`令样本矩等于总体矩，建立方程解得参数的估计量。\underline{步骤}：设有 $k$ 个未知参数，取总体 $E(X)$、$E(X^2)$、…、$E(X^k)$，令其分别等于样本原点矩 $A_1=\bar X$、$A_2=\frac1n\sum X_i^2$、…，解出 $\hat\theta$。\underline{特点}：计算简单、通常\textbf{相合}；但可能\textbf{无解/多解/不唯一}，且不一定有效。\underline{易混}：矩估计与最大似然结果\textbf{常不相同}（如二阶矩估计用 $A_2$ 时样本方差用 $\frac1n\sum(X_i-\bar X)^2$ 而非 $S^2=\frac{1}{n-1}\sum$）；低阶矩信息少，高阶矩含更多分布信息但噪声大。\underline{应用}：先求 $E(X)$、$E(X^2)$（或利用方差等式）建立若干方程，再联立解参。`),
    F('est06', 'estimation', '最大似然估计',
      R`叙述最大似然估计的基本思想与求解步骤`,
      R`思想：选择使已观测样本出现概率最大的 $\hat{\theta}$——使似然函数 $L(\theta)=\prod_{i=1}^{n}f(x_{i};\theta)$ 达到最大的参数值。
求解步骤：① 写出 $L(\theta)$；② 取对数 $\ln L$（连乘化连加）；③ 对 $\theta$ 求导并令其为 0（似然方程）；④ 解出驻点并确认最大。离散/含区间参数等场合求导失效时，直接分析 $L$ 的最大值位置。`),
    F('est07', 'estimation', '置信区间',
      R`置信区间与置信水平`,
      R`$$P(\theta_{1}<\theta<\theta_{2})=1-\alpha$$（$1-\alpha$ 为置信水平）`),
    F('est08', 'estimation', '均值区间（方差已知）',
      R`正态总体均值区间（$\sigma^{2}$ 已知）`,
      R`$$\bar{X}\pm z_{\alpha/2}\,\frac{\sigma}{\sqrt{n}}$$`),
    F('est09', 'estimation', '均值区间（方差未知）',
      R`正态总体均值区间（$\sigma^{2}$ 未知）`,
      R`$$\bar{X}\pm t_{\alpha/2}(n-1)\,\frac{S}{\sqrt{n}}$$`),
    F('est10', 'estimation', '方差区间',
      R`正态总体方差的置信区间`,
      R`$$\left(\frac{(n-1)S^{2}}{\chi^{2}_{\alpha/2}(n-1)},\ \frac{(n-1)S^{2}}{\chi^{2}_{1-\alpha/2}(n-1)}\right)$$`),
    F('est11', 'estimation', '样本均值与方差独立',
      R`正态总体中 $\bar{X}$ 与 $S^{2}$ 的关系`,
      R`$X\sim N(\mu,\sigma^{2})$ 时，$\bar{X}$ 与 $S^{2}$ 相互独立。`),
    F('est12', 'estimation', '似然函数',
      R`似然函数的定义`,
      R`$$L(\theta)=\prod_{i=1}^{n}f(x_{i};\theta)$$`),
    F('est13', 'estimation', '估计量评选标准',
      R`评价估计量的三个标准`,
      R`无偏性、有效性、一致性。
- 无偏：$E(\hat\theta)=\theta$（靶心不偏）；有效：同为无偏则方差小者好（落点集中）；一致（相合）：$n\to\infty$ 时 $\hat\theta\overset{P}{\to}\theta$（大样本必然准）。
- 更精细的取舍用\textbf{均方误差}：MSE = 方差 + 偏差平方，允许「略偏但更集中」。`),

    // ============ 假设检验 ============
    F('test01', 'testing', '假设检验思想',
      R`假设检验的基本思想`,
      R`小概率原理：先假定 $H_{0}$ 成立，若样本结果是小概率事件则拒绝 $H_{0}$。`),
    F('test02', 'testing', '原假设与备择假设',
      R`原假设与备择假设`,
      R`$H_{0}$ 原假设（待检验的假设），$H_{1}$ 备择假设。`),
    F('test03', 'testing', '两类错误',
      R`假设检验的两类错误`,
      R`第一类（弃真）：$P(\text{拒 }H_{0}\,|\,H_{0}\text{ 真})=\alpha$；第二类（取伪）：$\beta$。`),
    F('test04', 'testing', '显著性水平',
      R`显著性水平 $\alpha$ 的含义与取值`,
      R`显著性水平 $\alpha$ 是\textbf{允许犯第一类错误（弃真）的概率上限}，即 $P(\text{拒绝 }H_{0}\,|\,H_{0}\text{ 真})\le\alpha$。常取 $0.05$，也可取 $0.01$ 或 $0.10$。
- 检验规则：当 $p$ 值 $<\alpha$，或检验统计量落入拒绝域，则\textbf{拒绝} $H_{0}$（结果“显著”）；否则“不显著”。
- $\alpha$ 越小越保守（不易拒绝 $H_{0}$），但同时\textbf{增大}第二类错误 $\beta$、降低功效 $1-\beta$——两者此消彼长。
易混：① $\alpha$ 是犯第一类错误的“上限”，\textbf{不是}实际犯错概率，也\textbf{不等于} $p$ 值；② $\alpha$ 与置信水平 $1-\alpha$ 互为余数；③“显著”不等于“差异大或重要”，只说明差异不太可能由随机误差造成。`),
    F('test05', 'testing', '单侧与双侧检验',
      R`单侧检验与双侧检验`,
      R`双侧 $H_{1}:\mu\ne\mu_{0}$；单侧 $H_{1}:\mu>\mu_{0}$ 或 $H_{1}:\mu<\mu_{0}$。`),
    F('test06', 'testing', R`$Z$ 检验`,
      R`Z 检验（$\sigma^{2}$ 已知的均值检验）`,
      R`$$Z=\frac{\bar{X}-\mu_{0}}{\sigma/\sqrt{n}}\sim N(0,1)$$`),
    F('test07', 'testing', R`$t$ 检验`,
      R`t 检验（$\sigma^{2}$ 未知的均值检验）`,
      R`$$T=\frac{\bar{X}-\mu_{0}}{S/\sqrt{n}}\sim t(n-1)$$`),
    F('test08', 'testing', '方差检验',
      R`$\chi^{2}$ 检验（方差检验）`,
      R`$$\chi^{2}=\frac{(n-1)S^{2}}{\sigma_{0}^{2}}\sim\chi^{2}(n-1)$$`),
    F('test09', 'testing', R`$p$ 值`,
      R`p 值的含义`,
      R`在 $H_{0}$ 下得到当前或更极端结果的概率；$p<\alpha$ 时拒绝 $H_{0}$。`),
    F('test10', 'testing', '拒绝域',
      R`拒绝域`,
      R`使 $H_{0}$ 被拒绝的检验统计量的取值范围。`),
    F('test11', 'testing', '两样本均值检验',
      R`两正态总体均值差检验（方差已知）`,
      R`$$Z=\frac{\bar{X}-\bar{Y}}{\sqrt{\dfrac{\sigma_{1}^{2}}{n_{1}}+\dfrac{\sigma_{2}^{2}}{n_{2}}}}\sim N(0,1)$$`),

    // ============ 方差分析与回归 ============
    F('reg01', 'regress', '单因素方差分析',
      R`单因素方差分析的目的与基本假定`,
      R`目的：检验多个正态总体均值是否相等：$H_{0}:\mu_{1}=\mu_{2}=\cdots=\mu_{k}$。
\textbf{三个基本假定}：① 各水平下观测相互独立；② 各总体服从正态分布；③ 各总体方差相等（方差齐性）。
逻辑：若 $H_0$ 真，组间波动与组内波动都只反映随机误差，$F=\dfrac{SSA/(k-1)}{SSE/(n-k)}$ 接近 1；$H_0$ 假时组间波动含处理效应，$F$ 显著大于 1。假定不满足时考虑非参数方法或数据变换。`),
    F('reg02', 'regress', '平方和分解',
      R`方差分析的平方和分解`,
      R`$$SST=SSA+SSE$$（总平方和 = 组间 + 组内）`),
    F('reg03', 'regress', R`$F$ 统计量`,
      R`方差分析的 F 统计量`,
      R`$$F=\frac{SSA/(k-1)}{SSE/(n-k)}\sim F(k-1,\ n-k)$$`),
    F('reg04', 'regress', '一元线性回归模型',
      R`一元线性回归模型`,
      R`$$y=\alpha+\beta x+\varepsilon,\qquad \varepsilon\sim N(0,\sigma^{2})$$`),
    F('reg05', 'regress', '最小二乘估计',
      R`最小二乘估计的斜率`,
      R`$$\hat{\beta}=\frac{\sum(x_{i}-\bar{x})(y_{i}-\bar{y})}{\sum(x_{i}-\bar{x})^{2}}$$`),
    F('reg06', 'regress', '判定系数',
      R`判定系数 $R^{2}$`,
      R`$$R^{2}=\frac{SSR}{SST}=1-\frac{SSE}{SST}$$（回归可解释的变异占总变异的比例）
\underline{取值}：$0\le R^{2}\le1$，越接近 1 拟合越好。\underline{适用}：一元回归/多元回归皆可，但只度量\textbf{线性}拟合，\textbf{不}能说明因果关系。\underline{易混}：① 增加自变量 $R^2$ \textbf{单调不减}（至少不降），需用\textbf{调整} $\bar R^2=1-(1-R^2)\frac{n-1}{n-p-1}$（$p$ 为自变量个数）比较变量数不同的模型；② $R^2$ 与相关系数 $r$ 的关系（一元）：$R^2=r^2$；③ 无截距或检验整体显著性应配合 $F$ 检验。\underline{应用}：判断模型解释力，配合 $F$ 检验判断“回归整体是否显著”。`),

    // ============ 补充：分布（茆诗松） ============
    F('rv17', 'dist', '超几何分布',
      R`超几何分布的分布律与期望`,
      R`$$P(X=k)=\frac{C_{M}^{k}\,C_{N-M}^{n-k}}{C_{N}^{n}},\qquad E(X)=n\frac{M}{N}$$`),
    F('rv18', 'dist', '负二项分布',
      R`负二项（帕斯卡）分布的分布律`,
      R`$$P(X=k)=C_{k-1}^{r-1}\,p^{r}(1-p)^{k-r}\quad(k=r,r+1,\dots)$$`),
    F('rv19', 'dist', '伽马分布',
      R`伽马分布的密度与数字特征`,
      R`$$f(x)=\frac{\lambda^{\alpha}}{\Gamma(\alpha)}x^{\alpha-1}e^{-\lambda x}\ (x>0),\quad E=\frac{\alpha}{\lambda},\ D=\frac{\alpha}{\lambda^{2}}$$`),
    F('rv20', 'dist', '泊松定理',
      R`二项分布的泊松近似（泊松定理）`,
      R`当 $n\to\infty$ 且 $np=\lambda$ 时，$$C_{n}^{k}p^{k}(1-p)^{n-k}\to\frac{\lambda^{k}}{k!}e^{-\lambda}$$`),

    // ============ 补充：多维随机变量 ============
    F('mv10', 'multidim', '连续型条件密度',
      R`连续型条件密度的公式`,
      R`$$f(y\,|\,x)=\frac{f(x,y)}{f_{X}(x)}$$`),
    F('mv11', 'multidim', '离散型和的分布',
      R`独立离散变量和的分布`,
      R`$$P(X+Y=k)=\sum_{i}P(X=i)\,P(Y=k-i)$$`),

    // ============ 补充：数字特征 ============
    F('nc14', 'numchar', '马尔可夫不等式',
      R`马尔可夫不等式`,
      R`若 $X\ge0$，则对任意 $\varepsilon>0$，$$P(X\ge\varepsilon)\le\frac{E(X)}{\varepsilon}$$`),
    F('nc15', 'numchar', '特征函数',
      R`特征函数的定义`,
      R`$$\varphi(t)=E(e^{itX})$$`),
    F('nc16', 'numchar', '矩母函数',
      R`矩母函数的定义`,
      R`$$M(t)=E(e^{tX})$$`),

    // ============ 补充：抽样分布 ============
    F('sm11', 'sampling', '样本均值的数字特征',
      R`样本均值的期望与方差`,
      R`$$E(\bar{X})=\mu,\qquad D(\bar{X})=\frac{\sigma^{2}}{n}$$`),

    // ============ 补充：参数估计（茆诗松） ============
    F('est14', 'estimation', '充分统计量',
      R`充分统计量的含义`,
      R`统计量 $T$ 若包含样本中关于参数 $\theta$ 的全部信息（条件分布与 $\theta$ 无关），则为充分统计量。`),
    F('est15', 'estimation', '因子分解定理',
      R`因子分解定理（求充分统计量）`,
      R`$$f(x;\theta)=g(T(x),\theta)\cdot h(x)$$（样本联合分布可分解为只含 $T$ 与 $\theta$ 的部分和只含样本的部分）`),
    F('est16', 'estimation', '枢轴量法',
      R`枢轴量法的步骤`,
      R`构造分布与参数无关的枢轴量（如 $\frac{\bar X-\mu}{\sigma/\sqrt n}$），由分位数反解出参数的置信区间。`),
    F('est17', 'estimation', '两均值差区间（方差已知）',
      R`两正态总体均值差区间（方差已知）`,
      R`$$\bar{X}-\bar{Y}\pm z_{\alpha/2}\sqrt{\frac{\sigma_{1}^{2}}{n_{1}}+\frac{\sigma_{2}^{2}}{n_{2}}}$$`),
    F('est18', 'estimation', '两均值差区间（方差未知但相等）',
      R`两正态总体均值差区间（方差未知但相等）`,
      R`$$\bar{X}-\bar{Y}\pm t_{\alpha/2}(n_{1}+n_{2}-2)\,S_{w}\sqrt{\frac{1}{n_{1}}+\frac{1}{n_{2}}}$$`),
    F('est19', 'estimation', '两方差比区间',
      R`两正态总体方差比的置信区间`,
      R`$$\left(\frac{S_{1}^{2}/S_{2}^{2}}{F_{\alpha/2}(n_{1}-1,n_{2}-1)},\ \frac{S_{1}^{2}}{S_{2}^{2}}\cdot F_{\alpha/2}(n_{2}-1,n_{1}-1)\right)$$`),
    F('est20', 'estimation', '费希尔信息量',
      R`费希尔信息量的定义`,
      R`$$I(\theta)=E\left[\left(\frac{\partial}{\partial\theta}\ln f(X;\theta)\right)^{2}\right]$$`),
    F('est21', 'estimation', '克拉默-拉奥下界',
      R`克拉默-拉奥不等式（无偏估计方差下界）`,
      R`$$D(\hat{\theta})\ge\frac{1}{nI(\theta)}$$`),

    // ============ 补充：假设检验 ============
    F('test12', 'testing', R`两均值差 $t$ 检验`,
      R`两正态总体均值差检验（方差未知但相等）`,
      R`$$T=\frac{\bar{X}-\bar{Y}}{S_{w}\sqrt{\dfrac{1}{n_{1}}+\dfrac{1}{n_{2}}}}\sim t(n_{1}+n_{2}-2)$$`),
    F('test13', 'testing', R`两方差比 $F$ 检验`,
      R`两正态总体方差比检验`,
      R`$$F=\frac{S_{1}^{2}}{S_{2}^{2}}\sim F(n_{1}-1,\ n_{2}-1)$$`),
    F('test14', 'testing', '拟合优度检验',
      R`$\chi^{2}$ 拟合优度检验`,
      R`$$\chi^{2}=\sum_{i}\frac{(n_{i}-np_{i})^{2}}{np_{i}}\sim\chi^{2}(k-1)$$`),
    F('test15', 'testing', '检验功效',
      R`检验的功效（势）`,
      R`$$\text{功效}=1-\beta=P(\text{拒绝 }H_{0}\,|\,H_{1}\text{ 为真})$$`),
    F('test16', 'testing', '正态性检验',
      R`正态性检验有哪些方法？正态概率纸、Q-Q 图、$S$-$W$ 与偏度峰度检验各怎么判定？`,
      R`**① 正态概率纸（作图法）**：数据排序 $x_{(1)}\le\dots\le x_{(n)}$，纵轴取**修正频率** $\frac{i-0.375}{n+0.25}$（亦有 $\frac{i-0.5}{n}$ 口径），横轴取 $x_{(i)}$ 描点；点近似落在一条**直线**上则支持正态，明显弯曲表示偏态/厚尾（对应纵轴刻度非均匀的专用纸）。
**② Q-Q 图（分位数-分位数图）**：样本分位数 $x_{(i)}$ 对理论分位数 $\Phi^{-1}\big(\frac{i-0.375}{n+0.25}\big)$ 描点，直线性即正态性；上凸/下凹分别提示右/左偏，尾部离群提示厚尾。相比概率纸更通用（可对其他分布做同样检验）。
**③ Shapiro-Wilk（$S$-$W$）**：$W=\frac{\big(\sum_i a_i x_{(i)}\big)^{2}}{\sum_i (x_i-\bar x)^{2}}$（$a_i$ 由正态顺序统计量的协方差给出，$W\in(0,1]$），$W$ 越接近 1 越支持正态；$n\lesssim50$ 时首选，查 $W$ 临界值表。
**④ 偏度-峰度检验**：样本偏度 $g_1=\frac{1}{n}\sum(x_i-\bar x)^{3}/s^{3}$，样本峰度 $g_2=\frac{1}{n}\sum(x_i-\bar x)^{4}/s^{4}-3$；标准化后与 $N(0,1)$ 临界值比较（大样本近似，$H_0$：正态），正态时两者期望为 0。
**选择口径**：小样本用 $S$-$W$；大样本可用 Q-Q 图与偏度-峰度；概率纸/Q-Q 属**图示法**（只作佐证、不给精确 $p$ 值），需要精确结论时用 $K$-$S$ 等通用分布检验。
**适用**：小样本用 $W$ 检验（Shapiro–Wilk）或正态概率纸（修正频率 $\frac{i-0.375}{n+0.25}$，讲义表 7.5.1 给出 10 组数值），大样本用偏度峰度或 $\chi^2$ 分箱拟合优度。
**易混**：正态性检验属于**拟合优度**型检验，与 $t/F$ 检验的假设对象不同；概率纸靠「近似落在直线上」是目视判据，不能当作严格证明；$p$ 值小于水平才拒绝正态；与「正态概率图」卡分工为「作图法 vs 检验法」。`),

    // ============ 补充：回归分析 ============
    F('reg07', 'regress', '回归系数显著性检验',
      R`回归系数 $\beta$ 的显著性检验`,
      R`$$t=\frac{\hat{\beta}}{s(\hat{\beta})}\sim t(n-2)$$`),
    F('reg08', 'regress', '回归方程显著性检验',
      R`回归方程整体显著性的 F 检验`,
      R`$$F=\frac{SSR/1}{SSE/(n-2)}\sim F(1,\ n-2)$$`),
    F('reg09', 'regress', '回归预测区间',
      R`一元回归在 $x=x_{0}$ 处的预测区间`,
      R`$$\hat{y}_{0}\pm t_{\alpha/2}(n-2)\,s\sqrt{1+\frac{1}{n}+\frac{(x_{0}-\bar{x})^{2}}{\sum(x_{i}-\bar{x})^{2}}}$$`),
    F('reg10', 'regress', '相关系数检验',
      R`相关系数的显著性检验`,
      R`$$t=\frac{r\sqrt{n-2}}{\sqrt{1-r^{2}}}\sim t(n-2)$$`),

    // ============ 补充：真题补卡（统计真题缺口知识点） ============
    F('sx01', 'testing', '两变量相关性检验',
      R`如何检验两个变量（如两只股票的日回报）是否线性相关？`,
      R`计算样本相关系数 $r=\dfrac{\sum(x_i-\bar x)(y_i-\bar y)}{\sqrt{\sum(x_i-\bar x)^2\sum(y_i-\bar y)^2}}$，检验 $H_0:\rho=0$ 对 $H_1:\rho\ne0$，统计量$$t=\frac{r\sqrt{n-2}}{\sqrt{1-r^2}}\sim t(n-2)$$当 $|t|>t_{\alpha/2}(n-2)$ 时拒绝 $H_0$，认为两变量显著相关。`),
    F('sx02', 'dist', '贝塔分布',
      R`贝塔分布 $\mathrm{Beta}(\alpha,\beta)$ 的密度与数字特征`,
      R`$$f(x)=\frac{x^{\alpha-1}(1-x)^{\beta-1}}{B(\alpha,\beta)}\quad(0<x<1),\qquad B(\alpha,\beta)=\frac{\Gamma(\alpha)\Gamma(\beta)}{\Gamma(\alpha+\beta)}$$$$E=\frac{\alpha}{\alpha+\beta},\qquad D=\frac{\alpha\beta}{(\alpha+\beta)^2(\alpha+\beta+1)}$$性质：若 $U\sim\chi^2(a)$、$V\sim\chi^2(b)$ 独立，则 $\dfrac{U}{U+V}\sim\mathrm{Beta}\left(\dfrac a2,\dfrac b2\right)$。`),
    F('sx03', 'estimation', '充分统计量与 C-R 不等式',
      R`C-R（克拉默-拉奥）不等式的内容与使用条件是什么？充分统计量在其中的作用是什么？`,
      R`**充分统计量（简）**：给定 $T=T(X)$ 后样本的条件分布与 $\theta$ 无关，则 $T$ 含 $\theta$ 的全部信息；判定工具是因子分解定理 $f(x;\theta)=g(T(x),\theta)\,h(x)$（判定步骤与指数族结论见「充分统计量判定与因子分解定理」卡）。
**C-R 不等式**：正则条件下（参数支撑与 $\theta$ 无关、求导与积分可交换、Fisher 信息 $I(\theta)\in(0,\infty)$），对 $\theta$ 的**无偏**估计 $\hat\theta$，
$$D(\hat\theta)\ \ge\ \frac{1}{nI(\theta)},\qquad I(\theta)=E\Big[\Big(\frac{\partial}{\partial\theta}\ln f(X;\theta)\Big)^{2}\Big]=-E\Big[\frac{\partial^{2}}{\partial\theta^{2}}\ln f(X;\theta)\Big].$$
有偏情形推广为 $D(\hat\theta)\ge\frac{[1+b'(\theta)]^{2}}{nI(\theta)}$（$b(\theta)=E\hat\theta-\theta$）。
**有效估计**：等号成立时称 $\hat\theta$ 为有效估计，其方差达到下界，此时也必是 UMVUE；等号成立当且仅当 $\frac{\partial}{\partial\theta}\ln L(\theta;x)=a(\theta)\,[\hat\theta-\theta]$（指数族是典型场景）。
**正则条件不可省**：均匀分布 $U(0,\theta)$ 的支撑含 $\theta$，C-R 不适用，此时 $\hat\theta=X_{(n)}$ 无有效估计，须改用充分完全统计量 + Rao-Blackwell/Lehmann-Scheffé 求 UMVUE。
**适用**：需要给无偏估计的方差定下界（判断某估计量是否「够好」）、或用 C-R 达界条件构造/识别 UMVUE 时：$D(\hat\theta)\ge\frac{1}{nI(\theta)}$（有偏时含 $[1+b'(\theta)]^2$）。
**易混**：C-R 给出的是**下界**（不保证存在达界的无偏估计）；信息量务必用样本信息 $nI(\theta)$；达界的充要条件含有「$f$ 属指数族且得分函数是 $T(X)-E T$ 的线性函数」，不是「任何无偏估计都能达界」；充分统计量本身的定义与判定另见「充分统计量」专卡。`),
    F('sx04', 'estimation', '先验分布与后验分布',
      R`写出贝叶斯方法中后验分布与先验分布、似然函数的关系`,
      R`$$\pi(\theta\,|\,x)=\frac{\pi(\theta)\,L(\theta;x)}{\int\pi(\theta)\,L(\theta;x)\,d\theta}\ \propto\ \pi(\theta)\,L(\theta;x)$$后验 $\propto$ 先验 $\times$ 似然。常用共轭先验：正态-正态、Beta-二项、Gamma-泊松。
- \textbf{贝叶斯估计}：平方损失下取后验均值 $\hat\theta=E(\theta\,|\,x)$（共轭场合有显式解，如 Beta-二项下是「成功次数 + 先验」的加权平均）；绝对值损失取后验中位数。
- 频率派与贝叶斯派的分野：频率派视 $\theta$ 为未知常数（用置信区间表述不确定性），贝叶斯派视 $\theta$ 为随机变量（用先验吸收既有知识）。`),
    F('sy01', 'estimation', '泊松分布的置信区间',
      R`设 $X\sim P(\lambda)$，$x_1,\dots,x_n$ 为简单随机样本，求 $\lambda$ 的置信区间`,
      R`$\lambda$ 的 MLE 为 $\bar X$，且 $E(\bar X)=\lambda$、$D(\bar X)=\lambda/n$。由中心极限定理 $\sqrt n(\bar X-\lambda)/\sqrt{\lambda}\overset{d}{\to}N(0,1)$，用 $\bar X$ 估计方差得近似区间$$\bar X\pm z_{\alpha/2}\sqrt{\frac{\bar X}{n}}$$`),
    F('sy02', 'estimation', '总体比例的置信区间与检验',
      R`大样本下总体比例 $p$ 的置信区间、假设检验与样本量`,
      R`$\hat p=X/n$，近似 $\hat p\ \dot\sim\ N\left(p,\ \dfrac{p(1-p)}{n}\right)$。置信区间$$\hat p\pm z_{\alpha/2}\sqrt{\frac{\hat p(1-\hat p)}{n}}$$检验 $H_0:p=p_0$ 用$$Z=\frac{\hat p-p_0}{\sqrt{p_0(1-p_0)/n}}\sim N(0,1)$$误差 $d$ 下样本量 $n\ge\dfrac{z_{\alpha/2}^{2}\,p(1-p)}{d^{2}}$`),
    F('sy03', 'regress', '对数线性模型与弹性',
      R`给定模型 $\ln y=\alpha+\beta\ln x+\varepsilon$，解释 $\beta$ 的经济学含义并给出估计`,
      R`$\beta$ 是 $y$ 对 $x$ 的弹性：$x$ 每变动 $1\%$，$y$ 平均变动 $\beta\%$。令 $\tilde y=\ln y,\ \tilde x=\ln x$，OLS 估计$$\hat\beta=\frac{\sum(\tilde x_i-\bar{\tilde x})(\tilde y_i-\bar{\tilde y})}{\sum(\tilde x_i-\bar{\tilde x})^2}$$当 $E(\varepsilon\,|\,\ln x)=0$（严格外生）时 $\hat\beta$ 无偏。`),
    F('sy04', 'sampling', '经验分布函数',
      R`经验分布函数的定义与用途`,
      R`$$F_n(x)=\frac{1}{n}\sum_{i=1}^{n}I\{X_i\le x\}$$它是总体分布函数 $F(x)$ 的一致估计（格里文科定理）。样本取某值的频率即为其经验概率。`),
    F('sy05', 'numchar', '泊松分布的 Stein 等式',
      R`设 $X\sim P(\lambda)$，证明 $E[X\,g(X)]=\lambda\,E[g(X+1)]$，并求 $E[X^3],E[X^4]$`,
      R`$$E[Xg(X)]=\sum_{k=1}^{\infty}k\,g(k)\frac{\lambda^k}{k!}e^{-\lambda}=\lambda\sum_{j=0}^{\infty}g(j+1)\frac{\lambda^j}{j!}e^{-\lambda}=\lambda E[g(X+1)]$$由此 $E[X^3]=\lambda^3+3\lambda^2+\lambda$，$E[X^4]=\lambda^4+6\lambda^3+7\lambda^2+\lambda$。`),
    F('sy06', 'dist', '泊松分布的可加性',
      R`独立泊松随机变量之和的分布；$2X_1$ 是否仍为泊松？`,
      R`若 $X_1\sim P(\mu_1),\,X_2\sim P(\mu_2)$ 独立，则$$X_1+X_2\sim P(\mu_1+\mu_2)$$但 $2X_1$ 不是泊松分布：它只在偶数点取值（$P(2X_1=1)=0$），而泊松分布在每个非负整数上概率均大于 0。`),
    F('sy07', 'estimation', '均值区间估计的样本量确定',
      R`正态总体均值区间估计的样本量公式`,
      R`给定置信水平 $1-\alpha$ 与误差 $d$，样本量$$n\ge\left(\frac{z_{\alpha/2}\,\sigma}{d}\right)^{2}$$（$\sigma$ 已知时向上取整）。`),
    F('sy08', 'numchar', '单边切比雪夫不等式',
      R`设 $E\xi=0,\ D\xi=\sigma^2<\infty$，证明 $P(\xi\ge a)\le\dfrac{\sigma^2}{\sigma^2+a^2}$`,
      R`对任意 $t>0$，$P(\xi\ge a)=P(\xi+t\ge a+t)\le\dfrac{E(\xi+t)^2}{(a+t)^2}=\dfrac{\sigma^2+t^2}{(a+t)^2}$。令 $t=\dfrac{\sigma^2}{a}$ 得最小上界$$\frac{\sigma^2+\sigma^4/a^2}{(a+\sigma^2/a)^2}=\frac{\sigma^2}{\sigma^2+a^2}$$（坎特利不等式）。`),
    F('sy09', 'dist', '两标准正态之比的分布',
      R`$X,Y\overset{iid}{\sim}N(0,1)$，求 $\dfrac{X}{Y}$ 的分布`,
      R`$X/Y$ 服从标准柯西分布，密度$$f(z)=\frac{1}{\pi(1+z^2)},\quad z\in\mathbb R$$（等价于 $t(1)$ 分布）。`),

    // ============ 补充：扩展知识点卡 ============
    F('xr01', 'dist', '指数分布的无记忆性',
      R`指数分布为什么“无记忆”？写出无记忆性并说明其含义与用途`,
      R`若 $X\sim E(\lambda)$（密度 $f(x)=\lambda e^{-\lambda x},\ x>0$），则对任意 $s,t>0$ 有
$$P(X>s+t\,|\,X>s)=P(X>t)$$
即“已知已使用了 $s$ 小时后、还能再用 $t$ 小时的概率，与从零开始用 $t$ 小时相同”——过去的寿命\textbf{不影响}剩余寿命，故称“无记忆”。
\underline{证明}：$P(X>x)=e^{-\lambda x}$，故
$$P(X>s+t\,|\,X>s)=\frac{P(X>s+t)}{P(X>s)}=\frac{e^{-\lambda(s+t)}}{e^{-\lambda s}}=e^{-\lambda t}=P(X>t)$$
\underline{含义与用途}：指数分布是\textbf{唯一}具有无记忆性的连续型分布（几何分布是其离散版本）；常用于描述寿命、等待时间、排队服务时间等，可靠性问题中常由无记忆性直接推出“剩余寿命分布不变”。
易混：无记忆性是条件概率 $P(X>s+t\,|\,X>s)$，\textbf{不是} $P(X>s+t)=P(X>s)+P(X>t)$，后者对指数同样不成立。`),
    F('xr02', 'testing', '似然比检验',
      R`什么是似然比检验？写出检验统计量并说明其分布与用法`,
      R`设检验 $H_{0}:\theta\in\Theta_{0}$ 对 $H_{1}:\theta\in\Theta_{1}$（$\Theta=\Theta_{0}\cup\Theta_{1}$）。似然比统计量为
$$\Lambda=\frac{\sup_{\theta\in\Theta_{0}}L(\theta)}{\sup_{\theta\in\Theta}L(\theta)}=\frac{L(\hat\theta_{0})}{L(\hat\theta)}\in[0,1]$$
其中 $\hat\theta$ 为全参数空间上的 MLE，$\hat\theta_{0}$ 为 $H_{0}$ 约束下的 MLE。$\Lambda$ 越小，样本越不利于 $H_{0}$，故\textbf{拒绝域}为 $\Lambda<c$（$c$ 由显著性水平 $\alpha$ 定）。
\underline{渐近分布}：在正则条件下，当 $n$ 充分大时$$-2\ln\Lambda\ \overset{d}{\longrightarrow}\ \chi^{2}(r),\qquad r=\dim\Theta-\dim\Theta_{0}$$（$r$ 为 $H_{0}$ 下被约束掉的自由参数个数。）
\underline{要点}：无需构造特定枢轴量或正态统计量，适用于一般复合假设；是 Neyman-Pearson 引理在复合假设下的推广——简单对简单时即为最优势（MP）检验，复合情况常据此构造一致最优（UMP）检验。
易混：$\Lambda$ 是“$H_{0}$ 下似然最大值与全空间似然最大值之比”，恒 $\le1$；做近似分布时用 $-2\ln\Lambda$ 而非 $\Lambda$ 本身。`),

    // ============ 解题模板（方法论） ============
    F('xr03', 'estimation', '区间估计与假设检验的公式选型',
      R`面对一个区间估计/假设检验题，如何快速判断该用哪个公式（z/t/χ²/F）？`,
      R`按“待估（待检）对象 × 已知条件”两步定位。
\underline{一、定对象}：单总体均值 / 单总体方差 / 两总体均值差 / 两总体方差比。
\underline{二、定已知}（方差是否已知、是否配对）：
① 单均值 $\mu$：$\sigma^{2}$ 已知 $\Rightarrow\dfrac{\bar X-\mu_{0}}{\sigma/\sqrt n}\sim N(0,1)$（$z$ 型）；$\sigma^{2}$ 未知 $\Rightarrow\dfrac{\bar X-\mu_{0}}{S/\sqrt n}\sim t(n-1)$。
② 单方差 $\sigma^{2}$：$\dfrac{(n-1)S^{2}}{\sigma_{0}^{2}}\sim\chi^{2}(n-1)$。
③ 两均值差 $\mu_{1}-\mu_{2}$：方差已知 $\Rightarrow z$ 型 $\dfrac{\bar X-\bar Y}{\sqrt{\sigma_{1}^{2}/n_{1}+\sigma_{2}^{2}/n_{2}}}$；方差未知且相等 $\Rightarrow t(n_{1}+n_{2}-2)$（合并方差 $S_{p}^{2}$）；\textbf{配对数据} $\Rightarrow$ 对差值 $d_{i}=X_{i}-Y_{i}$ 用单样本 $t(n-1)$。
④ 两方差比 $\sigma_{1}^{2}/\sigma_{2}^{2}$：$\dfrac{S_{1}^{2}}{S_{2}^{2}}\sim F(n_{1}-1,\ n_{2}-1)$。
\underline{记忆口诀}：\textbf{均值知（方差已知）用 $z$，均值未知用 $t$；方差用 $\chi^{2}$；方差比用 $F$；配对先作差。}区间估计与假设检验共用同一枢轴量——前者反解参数写区间，后者代入 $H_{0}$ 下的参数值比较。`),

    F('ts01', 'prob_basic', '概率计算与分布识别流程',
      R`拿到一道概率题，你按什么流程识别分布并计算？`,
      R`① 识别随机试验与变量类型（离散型看分布律、连续型看密度）；② 判定事件结构：独立 / 互斥 / 条件；③ 选公式：古典概型、加（乘）法、全概率 / 贝叶斯、分布律或密度积分；④ 若为已知分布，直接套用其数字特征与标准化；⑤ 检验结果（概率在 $[0,1]$、密度积分归 $1$）。`),
    F('ts02', 'numchar', '数字特征计算流程',
      R`求期望、方差、协方差、相关系数的标准流程？`,
      R`① 先写清分布 / 密度（含定义域）；② 期望：定义式 $\sum x_k p_k$ 或 $\int x f(x)\,dx$，善用线性性 $E(aX+b)$；③ 方差：优先 $D(X)=E(X^2)-[E(X)]^2$，或 $D(aX+b)=a^2D(X)$；④ 协方差：$\mathrm{Cov}=E(XY)-E(X)E(Y)$，可用双线性；⑤ 相关系数：$\rho=\mathrm{Cov}/\sqrt{D(X)D(Y)}$；⑥ 复合函数用 $E[g(X)]$ 定义式或矩母函数。`),
    F('ts03', 'estimation', '参数估计（矩估计 / MLE）流程',
      R`求矩估计与最大似然估计的完整步骤？`,
      R`矩估计：① 求总体原点矩 $E(X^k)$（含参数）；② 令样本矩 $\dfrac1n\sum X_i^k$ 等于总体矩；③ 解方程得 $\hat\theta$（注意可能多解、无解）。MLE：① 写似然 $L(\theta)=\prod f(x_i;\theta)$；② 取对数 $\ln L$；③ 对 $\theta$ 求导令 $0$；④ 验证为极大且检查定义域端点 / 边界解（勿漏 $\hat\theta$ 的支撑集约束）；⑤ 说明唯一性。`),
    F('ts04', 'testing', '假设检验完整流程',
      R`一道假设检验题的标准解题步骤？`,
      R`① 提出 $H_0$ 与 $H_1$（区分单双侧，把“欲证”放备择）；② 选检验统计量：均值 $\sigma^2$ 已知用 $Z$、未知用 $t$、方差用 $\chi^2$、方差比用 $F$；③ 定显著性水平 $\alpha$ 与拒绝域 / 临界值；④ 由样本算统计量（或 $p$ 值）；⑤ 比较下结论：拒绝 $H_0$（显著）或未拒绝（不显著），用统计语言表述。`),
    F('ts05', 'estimation', '区间估计（枢轴量法）流程',
      R`求参数置信区间的步骤？`,
      R`① 确定待估参数与置信水平 $1-\alpha$；② 构造枢轴量 $G$（含参数但分布已知且与参数无关）；③ 由分位数写出 $P(a\le G\le b)=1-\alpha$；④ 反解不等式得参数范围 $(\theta_L,\ \theta_U)$；⑤ 代入样本值写区间端点。常见枢轴量：$\dfrac{\bar X-\mu}{\sigma/\sqrt n}\sim N(0,1)$、$\dfrac{\bar X-\mu}{S/\sqrt n}\sim t(n-1)$、$\dfrac{(n-1)S^2}{\sigma^2}\sim\chi^2(n-1)$。`),
    F('ts06', 'regress', '回归与方差分析流程',
      R`方差分析与回归分析的标准流程？`,
      R`方差分析：① 提 $H_0$：各水平均值相等；② 平方和分解 $SST=SSA+SSE$；③ 算 $F=\dfrac{SSA/(k-1)}{SSE/(n-k)}$；④ 与 $F_\alpha(k-1,n-k)$ 比较下结论。回归：① 建模 $y=\alpha+\beta x+\varepsilon$；② OLS 估 $\hat\beta=\dfrac{\sum(x_i-\bar x)(y_i-\bar y)}{\sum(x_i-\bar x)^2}$、$\hat\alpha=\bar y-\hat\beta\bar x$；③ 显著性检验（系数 $t$ 检验、方程整体 $F$ 检验）；④ 拟合优度 $R^2$ 与预测区间。`),
    F('ts07', 'dist', '常用分布识别与计算流程',
      R`拿到分布题，如何识别常用分布并套用其性质？`,
      R`① 离散型：$0\text{-}1$ 分布、二项 $B(n,p)$（$n$ 重伯努利）、泊松 $P(\lambda)$、几何 $G(p)$，先写出分布律。② 连续型：均匀 $U(a,b)$、指数 $E(\lambda)$、正态 $N(\mu,\sigma^2)$，先写出密度与定义域。③ 套用数字特征：二项 $E=np,\ D=npq$；泊松 $E=D=\lambda$；均匀 $E=\frac{a+b}2,\ D=\frac{(b-a)^2}{12}$；指数 $E=\frac1\lambda,\ D=\frac1{\lambda^2}$；正态 $E=\mu,\ D=\sigma^2$。④ 标准化：$X\sim N(\mu,\sigma^2)\Rightarrow\frac{X-\mu}{\sigma}\sim N(0,1)$。⑤ 特殊性质：指数无记忆性；正态线性变换仍正态；泊松可加性。`),
    F('ts08', 'multidim', '二维变量（边缘/条件/独立）流程',
      R`求二维随机变量的边缘、条件分布与独立性判定的流程？`,
      R`① 求边缘：离散型行（列）相加，$P(X=x_i)=\sum_j p_{ij}$；连续型对另一变量积分，$f_X(x)=\int f(x,y)\,dy$。② 条件分布：$f(y|x)=\frac{f(x,y)}{f_X(x)}$（或 $P(Y=y_j|X=x_i)=\frac{p_{ij}}{p_{i\cdot}}$）。③ 独立性判定：$f(x,y)=f_X(x)f_Y(y)$ 对一切 $(x,y)$ 成立（或 $F(x,y)=F_X(x)F_Y(y)$）。④ 联合分布函数 $F(x,y)=\int_{-\infty}^{x}\int_{-\infty}^{y}f(u,v)\,du\,dv$。⑤ 由边缘求联合：需额外条件（独立或给定相关结构），否则不唯一。`),
    F('ts09', 'limit', '大数定律/中心极限定理应用流程',
      R`用大数定律与中心极限定理做近似计算的流程？`,
      R`① 切比雪夫不等式：$P(|X-\mu|\ge\varepsilon)\le\frac{\sigma^2}{\varepsilon^2}$（只需方差存在，用于粗估）。② 大数定律：$\bar X\xrightarrow{P}\mu$，样本均值稳定于期望。③ 中心极限定理：$X_i$ iid 且方差有限，$n$ 大时 $\frac{\sum X_i-n\mu}{\sqrt n\,\sigma}\xrightarrow{d}N(0,1)$，即 $\sum X_i\approx N(n\mu,n\sigma^2)$、$\bar X\approx N(\mu,\frac{\sigma^2}{n})$。④ 应用：标准化后查标准正态表求概率。⑤ 二项分布 $B(n,p)$ 用棣莫弗-拉普拉斯：$\frac{X-np}{\sqrt{npq}}\approx N(0,1)$（$n$ 大）。`),

    // ============ 补充：真题补卡（xt 前缀·次序统计量/完备统计/UMVUE/特征函数/泊松过程/大数定律/多种现实计量/非参数/分布拟合） ============
    F('xt01', 'multidim', '次序统计量的分布与联合分布',
      R`设总体分布函数为 $F$、密度为 $f$，样本 $X_1,\dots,X_n$ i.i.d.，求次序统计量 $X_{(k)}$ 与 $(X_{(1)},\dots,X_{(n)})$ 的密度`,
      R`第 $k$ 个次序统计量 $X_{(k)}$ 的密度：
$$f_{X_{(k)}}(x)=\frac{n!}{(k-1)!\,(n-k)!}\,f(x)\,[F(x)]^{k-1}\,[1-F(x)]^{n-k}$$
全体次序统计量 $(X_{(1)},\dots,X_{(n)})$ 的\textbf{联合密度}为
$$f(x_{(1)},\dots,x_{(n)})=n!\prod_{i=1}^{n}f(x_{(i)}),\qquad x_{(1)}<\cdots<x_{(n)}$$
任意两个 $(X_{(i)},X_{(j)})$（$i<j$）的联合密度：
$$f_{ij}(u,v)=\frac{n!}{(i-1)!(j-i-1)!(n-j)!}f(u)f(v)\,[F(u)]^{i-1}\,[F(v)-F(u)]^{j-i-1}\,[1-F(v)]^{n-j}$$
核心：次序统计量把“无序样本”变成“有序结构”，密度公式里 $n!$ 来源于 $n$ 个样本的全排列；由联合密度可求边缘、条件与各类次序统计量的期望。`),
    F('xt02', 'multidim', '均匀分布次序统计量与贝塔分布',
      R`设 $X_1,\dots,X_n$ i.i.d. $\sim U(0,1)$，求 $X_{(k)}$ 的分布、期望与方差`,
      R`$X_{(k)}\sim\mathrm{Beta}(k,\ n-k+1)$，即
$$f_{X_{(k)}}(x)=\frac{n!}{(k-1)!(n-k)!}x^{k-1}(1-x)^{n-k},\qquad 0<x<1$$
$$E(X_{(k)})=\frac{k}{n+1},\qquad \mathrm{Var}(X_{(k)})=\frac{k(n-k+1)}{(n+1)^{2}(n+2)}$$
关键事实：对\textbf{任意}连续总体 $X$，$F(X)\sim U(0,1)$，故 $F(X_{(k)})\sim\mathrm{Beta}(k,\ n-k+1)$——均匀分布次序统计量是研究一般连续总体次序统计量的“标尺”。
$X_{(n)}=X_{(n)}-X_{(1)}$ 相关结论：$U_{(n)}-U_{(1)}\sim\mathrm{Beta}(n-1,\ 2)$；均匀分布次序统计量常与极值、截尾寿命问题相连。`),
    F('xt03', 'multidim', '次序统计量之比与次序统计量的独立性',
      R`对连续总体 $X$，证明 $\dfrac{X_{(i)}}{X_{(j)}}$ 与 $X_{(j)}$（$i<j$）相互独立`,
      R`由 $(X_{(i)},X_{(j)})$ 联合密度，作变量变换 $Z=\dfrac{X_{(i)}}{X_{(j)}}$、$V=X_{(j)}$，雅可比 $|J|=\dfrac{\partial(X_{(i)},X_{(j)})}{\partial(Z,V)}=V$，可把联合密度分离为 $f_{Z}(z)\cdot f_{V}(v)$，故 $Z$ 与 $V=X_{(j)}$ 独立。
\underline{常用结论}（$X\sim U(0,1)$）：对 $1\le i\le n$，$X_{(i)}\sim\mathrm{Beta}(i,n-i+1)$；比值 $\dfrac{X_{(i)}}{X_{(j)}}$ 与 $X_{(j)}$ 独立；$X_{(n)}-X_{(1)}\sim\mathrm{Beta}(n-1,2)$；对 $0<i_1<\cdots<i_r\le n$，$\dfrac{X_{(i_1)}}{X_{(i_2)}},\ \dfrac{X_{(i_2)}}{X_{(i_3)}},\dots$ 相互独立。
该独立性是处理“乘积形式／比值形式次序统计量”与截尾样本推断的核心技巧。`),
    F('xt04', 'estimation', '充分统计量与因子分解定理（叙述与应用）',
      R`如何用因子分解定理判断一个统计量是否充分？指数族与最小充分统计量的结论是什么？`,
      R`**定义**：$T=T(X)$ 是 $\theta$ 的充分统计量 $\iff$ 给定 $T$ 后样本的条件分布与 $\theta$ 无关（$T$ 含样本中关于 $\theta$ 的**全部**信息）。充分统计量**不唯一**，其单值函数仍充分；其中「压到最简」的是**最小充分统计量**（由因子分解得到的 $T$ 再取单值函数即得，如 $T=\sum X_i$ 与 $T=\bar X$ 等价）。
**因子分解定理**：$T$ 充分 $\iff$ 联合密度可分解
$$f(x;\theta)=g\big(T(x),\theta\big)\cdot h(x)$$
（$g$ 只依赖 $T$ 与 $\theta$，$h$ 不含 $\theta$）。
**判定步骤**：① 写联合密度 $\prod_i f(x_i;\theta)$；② 把含 $\theta$ 的因子整理成「$T(x)$ 与 $\theta$ 的乘积」$g$；③ 其余与 $\theta$ 无关者归入 $h$。
**指数族结论**：单参指数族 $f(x;\theta)=h(x)c(\theta)\exp\{\pi(\theta)t(x)\}$ ⇒ $T=\sum_i t(x_i)$ 充分；指数族还给出**完全充分**统计量（完全性用于证明 UMVUE 的唯一性）。
**例**：$f(x;\theta)=\theta(1-\theta)^{x}\,(x=0,1,2,\dots)$，联合密度 $=\theta^{n}(1-\theta)^{\sum x_i}\cdot1$ ⇒ $T=\sum_i X_i$ 是 $\theta$ 的充分统计量（也可验证 $T$ 是完备的）。
**适用**：判断某统计量是否把参数信息「压缩干净」：因子分解 $f(x;\theta)=g(T;\theta)h(x)$ 是唯一判据；配合完全性可证 UMVUE 的唯一性与独立性（Basu）。
**易混**：充分 ≠ 完全：完全性用来保证 UMVUE 唯一，二者不是一回事；充分统计量不唯一（它的一一变换仍充分）；最小充分统计量要按「函数关系」判断，不能只比维数。`),
    F('xt05', 'estimation', '完备统计量',
      R`什么是完备统计量？如何用指数族判定完备性？它与充分统计量如何配合得到 UMVUE？`,
      R`统计量 $T$ 称为\textbf{完备}（complete）的，若对任意函数 $g$，由 $E_{\theta}[g(T)]=0$ 对一切 $\theta$ 成立，能推出 $g(T)\equiv0$（a.s.）。
\underline{指数族判定}：单参指数族 $f(x;\theta)=h(x)e^{c(\theta)T(x)+d(\theta)}$（$c(\theta)$ 的值域为\textbf{开区间}、含非平凡区间）的 $T=\sum T(x_i)$ 同时是\textbf{充分且完备}的。
\underline{意义}：完备性排除“$T$ 的不能提供任何信息的函数”。若 $T$ \textbf{充分且完备}，则由 \textbf{Lehmann-Scheffé 定理}：设 $\hat\theta$ 是 $g(\theta)$ 的无偏估计且是 $T$ 的函数，则 $\hat\theta$ 是 $g(\theta)$ 的唯一 UMVUE。
常见：$P(\lambda)$ 的 $\sum X_i$、$B(n,p)$ 的 $\sum X_i$、$Exp(\lambda)$ 的 $\bar X$、$U(0,\theta)$ 的 $X_{(n)}$ 均充分完备。`),
    F('xt06', 'estimation', 'UMVUE 与 Lehmann-Scheffé 定理',
      R`求 $\theta$ 的一致最小方差无偏估计（UMVUE）的常用方法`,
      R`\underline{方法一（Lehmann-Scheffé）}：求 $\theta$ 的\textbf{充分}且\textbf{完备}统计量 $T$；再找一个 $g(\theta)$ 的无偏估计 $\hat\theta$ 且它是 $T$ 的函数，则 $\hat\theta$ 为 UMVUE（唯一）。
（等价地：对任一基于 $T$ 的无偏估计，取其在 $T$ 下的\textbf{条件期望}得到 UMVUE。）
\underline{方法二（C-R 下界）}：在正则条件下，若 $\hat\theta$ 无偏且 $\mathrm{Var}(\hat\theta)=\dfrac{1}{nI(\theta)}$ 达到 C-R 下界，则它必为 UMVUE。
\underline{方法三（充分性判别）}：$T$ 是 $\theta$ 的 UMVUE $\iff$ 对任意零的无偏估计 $U$，$\mathrm{Cov}(T,U)=0$。
典型：$B(1,p)$ 中 $p(1-p)$ 的 UMVUE 为 $\dfrac{n}{n-1}\bar X(1-\bar X)$；$P(\lambda)$ 中 $\lambda^3$ 的 UMVUE 为 $\dfrac{T(T-1)(T-2)}{n^{3}}$（$T=\sum X_i$）。`),
    F('xt07', 'numchar', '特征函数与矩母函数的一致性及可加性',
      R`特征函数 $\varphi(t)$ 与矩母函数 $M(t)$ 的性质如何对照？怎样用它们证明可加性与辨识分布？`,
      R`**存在性对照**：$\varphi_X(t)=E(e^{itX})$ 对任何随机变量**恒存在**；$M_X(t)=E(e^{tX})$ 只在 $t$ 的某邻域内可能不存在（如 Cauchy、对数正态）。故「普适工具」是特征函数。
**性质对照**：① $\varphi(0)=1$，$|\varphi(t)|\le1$，共轭对称 $\varphi(-t)=\overline{\varphi(t)}$；$M(0)=1$，$M$ 存在则 $M(t)>0$。② 求矩：$E(X^{k})=i^{-k}\varphi^{(k)}(0)=M^{(k)}(0)$。③ 唯一性：$\varphi$（或 0 邻域存在的 $M$）唯一决定分布。④ 独立可加：$X,Y$ 独立 $\Rightarrow \varphi_{X+Y}=\varphi_X\varphi_Y$、$M_{X+Y}=M_XM_Y$。
**证可加性／辨识分布的三步模板**：① 写出各自的 $\varphi$（常用族的 $\varphi$ 与 $M$ 对照表见特征函数、矩母函数两张基础卡）；② 由独立性相乘（或代入和、极值、线性组合的自变量）；③ 与已知族的 $\varphi$ 比对，由唯一性立得分布族——**不必求密度**。
**用特征函数判独立要谨慎**：$\varphi_{X+Y}=\varphi_X\varphi_Y$ **推不出** $X,Y$ 独立（反例 $X=Y\sim\mathrm{Cauchy}(0,1)$，$e^{-2|t|}=e^{-|t|}e^{-|t|}$ 但二者不独立）；判独立须用**联合**特征函数 $\varphi_{X,Y}(s,t)=\varphi_X(s)\varphi_Y(t)$。本卡只保留「性质 + 模板 + 易混」，常用 $\varphi$ 明细不在此重复。
**适用**：求独立随机变量和的分布（用 $\varphi$ 相乘或 $M$ 相乘）、证可加性（正态/泊松/伽马），以及用 $\varphi^{(k)}(0)=i^kEX^k$ 算矩；与「特征函数定义」「矩母函数」「唯一性定理」三张卡分工，本卡只管**性质与判定工具**。
**易混**：位移公式 $\varphi_{aX+b}(t)=e^{ibt}\varphi_X(at)$ 的相位因子 $e^{ibt}$ 最易丢；$\varphi_{-X}(t)=\overline{\varphi_X(t)}$ 共轭关系别写成相等；只有**独立**时才有 $\varphi_{X+Y}=\varphi_X\varphi_Y$。`),
    F('xt08', 'dist', '泊松过程',
      R`什么是强度为 $\lambda$ 的泊松过程 $\{N(t),t\ge0\}$？求 $E[N(s)\,|\,N(t)]$ 与 $N(t)\,|\,N(s)=n$ 的条件分布`,
      R`计数过程 $\{N(t),t\ge0\}$ 为强度 $\lambda$ 的泊松过程：
① $N(0)=0$；② \textbf{独立增量}；③ 任一增量 $N(s)-N(t)\sim P(\lambda(s-t))$（$0\le t<s$）。
由独立增量与增量分布：
$$E[N(s)\,|\,N(t)]=N(t)+\lambda(s-t)$$
当 $0<t<s$ 且给定 $N(s)=n$ 时，$N(t)\,|\,N(s)=n$ 服从\textbf{二项分布}
$$N(t)\,|\,N(s)=n\ \sim\ B\!\left(n,\ \frac{t}{s}\right)$$
（$[0,s]$ 内各到达时刻独立均匀分布在 $[0,s]$ 上，落入 $[0,t]$ 的概率为 $\dfrac{t}{s}$。）
\underline{性质}：两独立泊松过程之和仍为泊松过程（强度相加）；相邻到达间隔 $\sim Exp(\lambda)$，到达时刻 $\tau_n\sim\Gamma(n,\lambda)$。`),
    F('xt09', 'limit', '大数定律不同形式与马尔可夫大数定律',
      R`大数定律有哪些常见形式？叙述马尔可夫大数定律；怎样刻画“某一序列服从大数定律”`,
      R`\underline{常见形式}：伯努利（频率 $\to$ 概率）、切比雪夫（独立且方差有界）、辛钦（i.i.d. 且期望存在）、马尔可夫（放宽独立性）、柯尔莫哥洛夫（强大数定律）。
\underline{马尔可夫大数定律}：若 $\dfrac{1}{n^{2}}\mathrm{Var}\!\left(\sum_{i=1}^{n}X_i\right)\to0$（不要求独立），则
$$\frac{1}{n}\sum_{i=1}^{n}X_i-\frac{1}{n}\sum_{i=1}^{n}E(X_i)\ \overset{P}{\longrightarrow}\ 0$$
（切比雪夫大数定律是其特例：独立 + 方差一致有界时 $\mathrm{Var}\left(\frac{1}{n}\sum X_i\right)\le\frac{C}{n}\to0$。）
\underline{充要刻画}：记 $Y_n=\frac1n\sum X_i$、$a_n=E(Y_n)$，则 $\{X_n\}$ 服从大数定律 $\iff$
$$\lim_{n\to\infty}E\left[\frac{(Y_n-a_n)^{2}}{1+(Y_n-a_n)^{2}}\right]=0$$
此式对方差无穷（只有一阶矩）的情形也适用。`),
    F('xt10', 'regress', R`多元线性回归模型与 $\mathrm{Var}(\hat\beta)$`,
      R`多元回归 $Z=Y\beta+e$ 中 $E(e)=0$、$\mathrm{Var}(e)=\sigma^{2}I_n$ 且 $Y$ 列满秩，证明 $\mathrm{Var}(\hat\beta)=\sigma^{2}(Y^{T}Y)^{-1}$ 与 $E[Q(\hat\beta)]=(n-d)\sigma^{2}$`,
      R`$\hat\beta=(Y^{T}Y)^{-1}Y^{T}Z$。由 $\mathrm{Var}(Z)=\sigma^{2}I_n$：
$$\mathrm{Var}(\hat\beta)=(Y^{T}Y)^{-1}Y^{T}\,\mathrm{Var}(Z)\,Y(Y^{T}Y)^{-1}=\sigma^{2}(Y^{T}Y)^{-1}$$
又 $E[Z^{T}Z]=\dots$，而残差平方和 $Q(\hat\beta)=\|Z-Y\hat\beta\|^{2}$，投影阵 $H=Y(Y^{T}Y)^{-1}Y^{T}$ 幂等且 $\mathrm{rank}(H)=d$，故
$$E[Q(\hat\beta)]=\sigma^{2}\,\mathrm{tr}(I_n-H)=\sigma^{2}(n-d)$$
即 $\hat\sigma^{2}=\dfrac{Q(\hat\beta)}{n-d}$ 为 $\sigma^{2}$ 的无偏估计。配合调整 $R^{2}=1-\dfrac{SSE/(n-k-1)}{SST/(n-1)}$ 评价多解释变量的拟合优度。`),
    F('xt11', 'regress', '多重共线性',
      R`什么是多重共线性？如何判断与消除？`,
      R`\underline{定义}：回归模型中某些自变量之间存在（近似）线性关系，使得 $X^{T}X$ 接近奇异（列向量高度相关）。
\underline{后果}：OLS 估计仍\textbf{无偏}，但 $\hat\beta$ 方差被放大、估计不稳定、符号可能反常，$t$ 检验失效。
\underline{判断}：① 自变量两两相关系数高；② \textbf{方差膨胀因子} $VIF_j=\dfrac{1}{1-R_j^{2}}$（$R_j^{2}$ 为 $x_j$ 对其余自变量回归的判定系数），一般 $VIF>10$ 视为严重；③ $X^{T}X$ 最小特征值接近 0；④ 模型整体 $F$ 显著但各系数 $t$ 均不显著。
\underline{消除}：删除／合并高相关变量；逐步回归筛选；主成分回归；岭回归（Ridge）；增加样本量。`),
    F('xt12', 'regress', '异方差与 White 检验',
      R`线性回归中什么是异方差？简述 White（怀特）检验的步骤与用途`,
      R`异方差指扰动项方差非常数：$E(\varepsilon_i^{2})=\sigma_i^{2}\ne\cdots$，违背同方差假设（$E(\varepsilon^{2})=\sigma^{2}$）与无自相关（$\mathrm{Cov}(\varepsilon_i,\varepsilon_j)=0$）。
\underline{后果}：OLS 仍\textbf{无偏、一致}，但 $\hat\beta$ 的方差估计有偏，$t/F$ 检验失效。
\underline{White 检验}（检验 $H_0$：同方差）：① OLS 回归得残差 $\hat e_i$；② 以 $\hat e_i^{2}$ 对一切解释变量及其平方、交叉项作辅助回归；③ 用辅助回归判定系数 $R^{2}$ 构造 $W=nR^{2}\sim\chi^{2}(p)$（$p$ 为辅助回归自变量个数），$W>\chi^{2}_{\alpha}(p)$ 则拒绝同方差。
\underline{处理}：方差形式已知用加权最小二乘（WLS/GLS）；未知用 White 一致稳健标准误（或可行 GLS）。特例：线性概率模型 $y\in\{0,1\}$ 必有异方差。`),
    F('xt13', 'testing', '非参数检验：秩和检验（Wilcoxon）',
      R`叙述非参数检验的含义；给出 Wilcoxon 秩和（Mann-Whitney U）检验的步骤与统计量`,
      R`\underline{非参数检验}：不依赖总体分布具体形式（如正态）的推断，利用样本秩、符号等序信息，对分布形态稳健。
\underline{Wilcoxon 秩和检验}（两总体同分布 $H_0:F_X=F_Y$）：
① 合并两样本 $Z=\{X_1,\dots,X_{n_1},Y_1,\dots,Y_{n_2}\}$ 升序排列，赋秩 $R_i$（相等取平均秩）；② 计算第一组秩和 $W_X=\sum_{i=1}^{n_1}R(X_i)$；③ 原假设下
$$E(W_X)=\frac{n_1(n_1+n_2+1)}{2},\qquad \mathrm{Var}(W_X)=\frac{n_1n_2(n_1+n_2+1)}{12}$$
④ 大样本时 $Z=\dfrac{W_X-E(W_X)}{\sqrt{\mathrm{Var}(W_X)}}\sim N(0,1)$，$|Z|>z_{\alpha/2}$ 拒绝 $H_0$。
\underline{对比}：秩和检验\textbf{不需要正态假设}，对偏峰、异常值稳健；但在数据近似正态时，配对 $t$ 检验更有效（利用更多数值信息），秩和检验只利用相对次序、会损失部分信息。`),
    F('xt14', 'testing', R`分布拟合检验：$K$-$S$ 检验与 $\chi^{2}$ 拟合`,
      R`如何检验样本是否来自某已知分布（分布拟合检验）？给出 $K$-$S$ 与 $\chi^{2}$ 两种方法`,
      R`\underline{$K$-$S$（Kolmogorov-Smirnov）检验}：比较经验分布函数 $F_n(x)$ 与理论分布 $F_0(x)$ 的最大距离
$$D_n=\sup_{x}\left|F_n(x)-F_0(x)\right|$$
$H_0:F=F_0$（且 $F_0$ \textbf{参数已知}）。$D_n$ 大则拒绝。优点：无需分组、对任意 $x$ 敏感、优于 $\chi^{2}$（尤其小样本）；缺点：$F_0$ 需完全已知，若参数需估计则用 \textbf{Lilliefors} 修正。
\underline{$\chi^{2}$ 拟合优度检验}：把数据分成 $k$ 组，统计量
$$\chi^{2}=\sum_{i=1}^{k}\frac{(n_i-np_i)^{2}}{np_i}\sim\chi^{2}(k-1-r)$$
（$r$ 为估计的参数个数），适合大样本、分类（离散）数据。
\underline{共用}：$F_n(x)=\frac1n\sum_{i=1}^{n}I\{X_i\le x\}$（经验分布函数），由 Glivenko-Cantelli 定理 $\sup_x|F_n(x)-F(x)|\to0$ a.s.，故经验分布是分布函数的强相合估计。`),
    F('xt15', 'testing', R`列联表独立性检验（$2\times2$ 与 $r\times c$）`,
      R`叙述 $2\times2$（及 $r\times c$）列联表独立性检验的原理与统计量`,
      R`\underline{设定}：两个分类变量 $X,Y$ 分别取 $m,n$ 种值，观测频数 $N_{ij}$（$i=1..m,j=1..n$），行合计 $N_{i\cdot}$、列合计 $N_{\cdot j}$、总 $N$。$H_0$：$X$ 与 $Y$ 独立。
\underline{原理}：独立时应有 $\dfrac{N_{ij}}{N}\approx\dfrac{N_{i\cdot}}{N}\cdot\dfrac{N_{\cdot j}}{N}$，即期望频数 $\hat e_{ij}=\dfrac{N_{i\cdot}N_{\cdot j}}{N}$。以 $\dfrac{1}{N_{i\cdot}N_{\cdot j}}$ 为权重标准化偏离，得统计量
$$\chi^{2}=\sum_{i=1}^{m}\sum_{j=1}^{n}\frac{(N_{ij}-\hat e_{ij})^{2}}{\hat e_{ij}}\sim\chi^{2}((m-1)(n-1))$$
$\chi^{2}>\chi^{2}_{\alpha}((m-1)(n-1))$ 则拒绝 $H_0$，认为 $X,Y$ 不独立。
\underline{$2\times2$ 特例}：自由度 $=1$；可计算关联强度 $\varphi=\sqrt{\chi^{2}/N}$，且用连续性校正（Yates）$\chi^{2}=\sum\dfrac{(|N_{ij}-\hat e_{ij}|-\tfrac12)^{2}}{\hat e_{ij}}$。\underline{注意}：期望频数不宜太小（一般要求 $\hat e_{ij}\ge5$），否则需合并类或改用 Fisher 精确检验。`),

    // ============ 套路卡（ys） ============
    F('ys01', 'dist', '求随机变量函数的分布：套路',
      R`求随机变量函数的分布，总体思路与关键步骤是什么？`,
      R`分“一维”与“多维”两条主线。
\underline{一维}：\textbf{① 分布函数法}（通用）：先求 $F_Y(y)=P(g(X)\le y)=P\big(X\in g^{-1}(-\infty,y]\big)$，再对 $y$ 求导得 $f_Y(y)=F'_Y(y)$。\textbf{② 公式法}（$y=g(x)$ 单调可导）：$f_Y(y)=f_X\big(g^{-1}(y)\big)\big|(g^{-1}(y))'\big|$；线性 $Y=aX+b$ 直接 $f_Y(y)=\frac1{|a|}f_X\big(\frac{y-b}{a}\big)$。
\underline{多维}：\textbf{① 求 $Z=g(X,Y)$ 的分布}：分布函数法 $F_Z(z)=P(g(X,Y)\le z)$；\textbf{② 卷积}（独立和）：$f_{X+Y}(z)=\int f_X(x)f_Y(z-x)\,dx$；\textbf{③ 雅可比}（可逆变换 $(X,Y)\to(U,V)$）：$f_{U,V}=f_{X,Y}(x,y)\,|J|$。
\underline{关键}：① 先定 $y$ 的\textbf{取值支撑集}（分段写）；② 把 $P(g(X)\le y)$ 化成关于 $X$ 的事件；③ 求导勿漏链式法则与雅可比绝对值；④ 非线性变换奇偶/分段处理。`),
    F('ys02', 'estimation', '矩估计 vs 极大似然：选型套路',
      R`给定参数估计问题，如何选择矩估计还是极大似然估计？`,
      R`\textbf{① 看题问}：“用样本矩替换总体矩”$\Rightarrow$ 矩估计；“求 MLE / 最大似然估计”$\Rightarrow$ 极大似然。\textbf{② 看分布}：参数少、$E(X),E(X^2)$ 易算 $\Rightarrow$ 矩估计快捷（指数、泊松）；总体为\textbf{指数族}或要求“相合且有效（达 C-R 下界）”$\Rightarrow$ 极大似然。
\underline{矩估计}：列 $E(X)=\bar X$、$E(X^2)=A_2$ 等解出 $\hat\theta$。优：简单、一定\textbf{相合}；缺：可能\textbf{无解/多解/不唯一}、不一定有效。
\underline{极大似然}：$L(\theta)=\prod f(x_i;\theta)$，取对数求导为 0；\textbf{注意边界/支撑集}（如 $U(0,\theta)$ 的 MLE 是 $X_{(n)}$）。优：相合、渐近正态、达 C-R 下界；缺：计算繁、依赖分布假设。
\underline{易混}：两者常不同；有充分完备统计量时，MLE 是充分统计量的函数，且常为 UMVUE。`),
    F('ys03', 'estimation', '区间估计：z / t / χ² 判断套路',
      R`区间估计时，如何判断用 z、t 还是 χ² 分布？`,
      R`先问“估什么、已知什么”。\textbf{估 $\mu$}：$\sigma^2$ \textbf{已知}$\Rightarrow z=\frac{\bar X-\mu}{\sigma/\sqrt n}\sim N(0,1)$，区间 $\bar X\pm z_{\alpha/2}\frac{\sigma}{\sqrt n}$；$\sigma^2$ \textbf{未知}$\Rightarrow t=\frac{\bar X-\mu}{S/\sqrt n}\sim t(n-1)$，区间 $\bar X\pm t_{\alpha/2}(n-1)\frac{S}{\sqrt n}$。\textbf{估 $\sigma^2$}：$\frac{(n-1)S^2}{\sigma^2}\sim\chi^2(n-1)$，区间 $\big(\frac{(n-1)S^2}{\chi^2_{\alpha/2}(n-1)},\ \frac{(n-1)S^2}{\chi^2_{1-\alpha/2}(n-1)}\big)$。
\underline{判断口诀}：均值看方差知否（知 $z$、不知 $t$）；方差一律 $\chi^2$；非正态/大样本用中心极限定理的 $z$ 近似。
\underline{易混}：自由度 $n-1$（单样本），勿写成 $n$；双侧用 $\alpha/2$ 分位；方差区间\textbf{两端分位数顺序要反}。`),
    F('ys04', 'testing', '假设检验：单双尾与统计量选型套路',
      R`假设检验如何判断单尾/双尾，并选择统计量？`,
      R`\textbf{① 定单双尾}（看 $H_1$ 方向）：$H_1:\mu\ne\mu_0$ $\Rightarrow$ 双侧 $|T|>t_{\alpha/2}$；$H_1:\mu>\mu_0$ $\Rightarrow$ 右单侧 $T>t_\alpha$；$H_1:\mu<\mu_0$ $\Rightarrow$ 左单侧 $T<-t_\alpha$。
\textbf{② 选统计量}：单均值、$\sigma$ 已知 $\Rightarrow z$ 检验；$\sigma$ 未知 $\Rightarrow t$ 检验；单方差 $\Rightarrow \chi^2$ 检验；两均值（$\sigma$ 已知）$\Rightarrow z$；两均值（$\sigma$ 未知但相等）$\Rightarrow$ 合并方差 $t$；两方差比 $\Rightarrow F$ 检验。
\textbf{③ 判定}：算 $p$ 值与 $\alpha$ 比，或看统计量是否落入拒绝域；\underline{两类错误} $\alpha=P(\text{拒真})$、$\beta=P(\text{取伪})$，$\alpha\downarrow\Rightarrow\beta\uparrow$。
\underline{易混}：单侧 $p$ 值通常是双侧之半；\textbf{配对样本}用差值 $d_i=X_i-Y_i$ 做 $t$ 检验，勿与两独立样本混用。`),
    F('ys05', 'regress', '一元回归建模与诊断套路',
      R`一元线性回归建模与诊断的完整流程是什么？`,
      R`\textbf{① 建模}：$Y=\beta_0+\beta_1X+\varepsilon$，$E(\varepsilon)=0,\ \mathrm{Var}(\varepsilon)=\sigma^2,\ \mathrm{Cov}(\varepsilon_i,\varepsilon_j)=0$；OLS：$\hat\beta_1=\frac{\sum(x_i-\bar x)(y_i-\bar y)}{\sum(x_i-\bar x)^2}$，$\hat\beta_0=\bar y-\hat\beta_1\bar x$。
\textbf{② 显著性检验}：系数 $t=\frac{\hat\beta_1}{\hat\sigma/\sqrt{S_{xx}}}$（$H_0:\beta_1=0$）；整体 $F=\frac{\mathrm{SSR}/1}{\mathrm{SSE}/(n-2)}$；\textbf{一元时 $t^2=F$（等价）}。
\textbf{③ 拟合优度}：$R^2=\mathrm{SSR}/\mathrm{SST}=1-\mathrm{SSE}/\mathrm{SST}$。
\textbf{④ 诊断}：残差图 $\Rightarrow$ 异方差/非线性；DW 检验 $\Rightarrow$ 自相关；相关系数/VIF $\Rightarrow$ 共线性；White 检验 $\Rightarrow$ 异方差。
\textbf{⑤ 改进}：异方差$\Rightarrow$ WLS/GLS 或稳健标准误；自相关$\Rightarrow$ 广义差分；共线性$\Rightarrow$ 剔变量/岭回归；非线性$\Rightarrow$ 加二次项/变量变换。`),

    // ============ 广度/计量补全（jj） ============
    F('jj01', 'prob_basic', '几何概型',
      R`几何概型的适用条件与概率计算公式`,
      R`当试验结果与\textbf{可测区域（长度/面积/体积）}一一对应、样本点在 $\Omega$ 上\textbf{均匀}（等可能）分布时，
$$P(A)=\frac{m(A)}{m(\Omega)}=\frac{\text{$A$ 的长度(面积/体积)}}{\text{$\Omega$ 的长度(面积/体积)}}$$
\underline{适用条件}：① 样本点\textbf{连续}且\textbf{均匀分布}（等可能）；② 结果集为\textbf{有界可测区域}。\underline{常见}：会面问题、投针（Buffon）、线段分段、随机取点。
\underline{易混}：古典概型用\textbf{计数}（可数、等可能），几何概型用\textbf{测度}（连续、均匀）；若取点\textbf{非均匀}（如密度 $f$ 非常数），不能简单用面积比，需按 $P(A)=\int_A f\,d\mu$。`),
    F('jj02', 'multidim', '二维随机变量的变换（雅可比法）',
      R`二维随机向量 $(X,Y)$ 经可逆变换到 $(U,V)$，如何求其联合密度？`,
      R`设 $(X,Y)\sim f_{X,Y}(x,y)$，$u=g_1(x,y),\ v=g_2(x,y)$ 为\textbf{双射}（可逆），逆函数 $x=h_1(u,v),\ y=h_2(u,v)$，则
$$f_{U,V}(u,v)=f_{X,Y}\big(h_1(u,v),h_2(u,v)\big)\cdot|J|$$
其中 $J=\dfrac{\partial(x,y)}{\partial(u,v)}=\begin{vmatrix}\frac{\partial x}{\partial u}&\frac{\partial x}{\partial v}\\\frac{\partial y}{\partial u}&\frac{\partial y}{\partial v}\end{vmatrix}$。
\underline{关键}：① 取 $|J|$（绝对值）；② 逆变换须\textbf{唯一}，否则对多个原像分支\textbf{求和}；③ 新变量\textbf{支撑集}由原支撑集映射并\textbf{分段}写出；④ 只求 $Z=g(X,Y)$ 时，可先引入辅助变量凑成一维可逆变换、再对辅助变量积分。
\underline{易混}：$J$ 是“x,y 对 u,v 的偏导”，与 $\frac{\partial(u,v)}{\partial(x,y)}$ 互为倒数，勿写反。`),
    F('jj03', 'estimation', '成对样本的区间估计与检验',
      R`成对（配对）样本的均值差如何做区间估计与假设检验？`,
      R`对配对观测 $(X_1,Y_1),\dots,(X_n,Y_n)$，令 $D_i=X_i-Y_i$，视 $D_1,\dots,D_n$ 为来自 $N(\mu_D,\sigma_D^2)$ 的样本（$\mu_D=\mu_X-\mu_Y$）。
\underline{区间估计}：$\bar D=\frac1n\sum D_i$，$S_D^2=\frac{1}{n-1}\sum(D_i-\bar D)^2$，则 $\mu_D$ 的 $1-\alpha$ 置信区间
$$\bar D\pm t_{\alpha/2}(n-1)\frac{S_D}{\sqrt n}$$
\underline{检验}：$H_0:\mu_D=0$，$t=\dfrac{\bar D}{S_D/\sqrt n}\sim t(n-1)$，$|t|>t_{\alpha/2}(n-1)$ 拒绝。
\underline{适用}：两样本\textbf{不独立}、来自同一对象或匹配对象（前后对照、双胞胎、A/H 上市），配对可\textbf{消除个体差异}、提高功效。
\underline{易混}：把\textbf{配对样本当两独立样本}合并方差是常见错误；配对 $t$ 要求差值 $D_i$ 近似正态（大样本放宽）。`),
    F('jj04', 'testing', '符号检验（非参数）',
      R`符号检验的原理与步骤`,
      R`\textbf{适用}：成对样本比较（或检验分位数），\textbf{不要求分布正态}、只利用正负号。
\underline{配对}：对 $(X_i,Y_i)$ 记 $D_i=X_i-Y_i$，$N_+=\#\{D_i>0\}$，$N_-=\#\{D_i<0\}$（$D_i=0$ 剔除），有效数 $n=N_++N_-$。$H_0$：中位数差 $=0$，则 $N_+\sim B(n,\tfrac12)$。统计量取 $S=\min(N_+,N_-)$（或较大者）。
\underline{小样本}：查二项分布临界值（$S$ 过小则拒绝）；\underline{大样本}：$Z=\dfrac{N_+-n/2}{\sqrt{n/4}}=\dfrac{2N_+-n}{\sqrt n}\sim N(0,1)$（可用连续性校正）。
\underline{优点}：稳健、对离群值不敏感、无需正态；\underline{缺点}：只用符号、信息量低，功效\textbf{低于}秩和/参数检验。`),
    F('jj05', 'testing', '游程检验（非参数）',
      R`游程检验的原理与步骤`,
      R`\textbf{检验随机性}：判断一组样本是否随机排列（或两总体分布是否相同）。
\underline{定义}：把样本按二分类（如“高于/低于中位数”）排成一列，\textbf{连续相同符号的一段为一个“游程”}。设游程总数 $R$，两类元素分别 $n_1,n_2$ 个。
\underline{分布}：$H_0$（随机）下 $E(R)=1+\frac{2n_1n_2}{n_1+n_2}$，$\mathrm{Var}(R)=\frac{2n_1n_2(2n_1n_2-n_1-n_2)}{(n_1+n_2)^2(n_1+n_2-1)}$。
\underline{判定}：$R$ \textbf{过小} $\Rightarrow$ 元素聚集（非随机）；$R$ \textbf{过大} $\Rightarrow$ 元素交替过频（也非随机）。大样本 $Z=\frac{R-E(R)}{\sqrt{\mathrm{Var}(R)}}\sim N(0,1)$，$|Z|>z_{\alpha/2}$ 拒绝。
\underline{易混}：游程检验检验\textbf{随机性}；与秩和（比较位置）、符号（比较正负）不同。`),
    F('jj06', 'regress', '高斯-马尔可夫定理',
      R`高斯-马尔可夫（Gauss-Markov）定理的内容与条件`,
      R`对 $Y_i=\beta_0+\beta_1x_i+\varepsilon_i$，\textbf{条件}：① $E(\varepsilon_i\mid X)=0$（外生/无内生性）；② $\mathrm{Var}(\varepsilon_i)=\sigma^2$（\textbf{同方差}）；③ $\mathrm{Cov}(\varepsilon_i,\varepsilon_j)=0$（$i\ne j$，\textbf{无自相关}）；④ $x$ 非随机或与 $\varepsilon$ 不相关。则 OLS 估计 $\hat\beta$ 是 $\beta$ 的\textbf{BLUE}（最优线性无偏估计）：在所有\textbf{线性、无偏}估计中\textbf{方差最小}。
\underline{注意}：① 定理\textbf{不要求正态性}（正态只用于区间/假设检验）；② 只要求“不相关（外生）”而非独立；③ “最优”仅在\textbf{线性无偏类}内，非线性无偏可能方差更小；④ 条件②③失效（异方差/自相关）时 OLS 仍\textbf{无偏}但\textbf{不再有效}，需用 GLS/稳健标准误；⑤ 内生性（$E(\varepsilon\mid X)\ne0$）则 OLS \textbf{有偏且不一致}。`),
    F('jj07', 'regress', '多元回归：调整 R² 与拟合优度',
      R`什么是调整判定系数 $\bar R^2$？与 $R^2$ 有何区别？`,
      R`$$R^{2}=\frac{\mathrm{SSR}}{\mathrm{SST}}=1-\frac{\mathrm{SSE}}{\mathrm{SST}}=1-\frac{\sum(y_i-\hat y_i)^{2}}{\sum(y_i-\bar y)^{2}}$$
$R^2$ 度量拟合优度，但\textbf{自变量越多 $R^2$ 单调不减}（至少不降），无法跨模型比较。\textbf{调整} $R^2$ 惩罚参数个数：
$$\bar R^{2}=1-\frac{\mathrm{SSE}/(n-p-1)}{\mathrm{SST}/(n-1)}=1-(1-R^{2})\frac{n-1}{n-p-1}$$
其中 $p$ 为自变量个数。\underline{性质}：$\bar R^2$ \textbf{可能为负}、比 $R^2$ 更严格、\textbf{未必}随变量增多而增大，用于比较变量数不同的模型。\underline{注意}：二者都只度量\textbf{线性}拟合，不能仅凭它判优劣；模型整体显著性应看 $F$ 检验，单个变量看 $t$ 检验。`),
    F('jj08', 'regress', '异方差的诊断与 GLS/WLS',
      R`如何诊断异方差？存在异方差时如何修正估计？`,
      R`\underline{诊断}：\textbf{a) 残差图}：绘 $e_i$ 对 $\hat y_i$（或 $x_i$）散点，若呈“漏斗形/喇叭形”发散则疑异方差。\textbf{b) White 检验}：辅助回归 $e_i^2$ 对 $x,x^2,$ 交叉项，$W=nR^2\sim\chi^2(p)$，显著则拒绝“同方差”。\textbf{c) 其他}：Goldfeld-Quandt、BP 检验。
\underline{后果}：OLS 仍\textbf{无偏}，但标准误估计有偏（$t$/$F$ 失效），\textbf{不再有效}。
\underline{修正}：\textbf{WLS/GLS}——若 $\mathrm{Var}(\varepsilon_i)=\sigma^2 w_i$ 已知，两端除以 $\sqrt{w_i}$ 后做 OLS，等价于最小化 $\sum\frac{(y_i-\beta_0-\beta_1x_i)^{2}}{w_i}$；若方差形式未知，用\textbf{稳健（White）标准误}或 FGLS。
\underline{易混}：异方差不破坏无偏/一致性，只破坏\textbf{有效性}与\textbf{标准误}；WLS 权重是 $\frac{1}{w_i}$（方差之倒数），勿写成 $w_i$。`),
    F('jj09', 'regress', '自相关与 DW 检验',
      R`什么是自相关（序列相关）？如何用 DW 检验诊断？`,
      R`\underline{定义}：$\mathrm{Cov}(\varepsilon_i,\varepsilon_j)\ne0$（$i\ne j$），常见于时间序列；$\varepsilon_i$ 与 $\varepsilon_j$ 相关。后果：OLS 仍\textbf{无偏}但\textbf{不有效}，标准误估计失准，$t$/$F$ 检验失效。\underline{常见}：AR(1) $\varepsilon_i=\rho\varepsilon_{i-1}+u_i$。
\underline{DW（Durbin-Watson）检验}（诊断一阶自相关）：
$$d=\frac{\sum_{i=2}^{n}(e_i-e_{i-1})^{2}}{\sum_{i=1}^{n}e_i^{2}}\approx2(1-\hat\rho)$$
$d\in[0,4]$：$d\approx2$ 无自相关；$d<2$（且小于下界 $d_L$）\textbf{正}自相关；$d>2$（大于 $4-d_L$）\textbf{负}自相关。\underline{局限}：只查\textbf{一阶}，且模型含\textbf{滞后因变量}时失效。
\underline{修正}：广义差分法、Cochrane-Orcutt、加入滞后变量、Newey-West 稳健标准误。`),
    F('jj10', 'regress', '内生性与工具变量 / 2SLS',
      R`什么是内生性？如何用工具变量（IV）与 2SLS 解决？`,
      R`\underline{内生性}：$x$ 与误差 $\varepsilon$ 相关（$\mathrm{Cov}(x,\varepsilon)\ne0$），破坏 Gauss-Markov 外生条件，OLS \textbf{有偏且不一致}。来源：遗漏变量、联立方程、测量误差、反向因果。
\underline{工具变量条件}：$Z$ 须满足 ① \textbf{相关性} $\mathrm{Cov}(Z,x)\ne0$；② \textbf{外生性} $\mathrm{Cov}(Z,\varepsilon)=0$；③ 不能直接作解释变量。
\underline{2SLS（两阶段最小二乘）}：第一阶段用 $Z$ 对 $x$ 回归取拟合 $\hat x$（滤掉与 $\varepsilon$ 相关的部分）；第二阶段用 $\hat x$ 对 $y$ 回归得一致估计 $\hat\beta_{2SLS}$。单变量单工具时 $\hat\beta_{IV}=\frac{\mathrm{Cov}(Z,Y)}{\mathrm{Cov}(Z,X)}$。
\underline{注意}：工具变量数 $\ge$ 内生变量数（可识别）；\textbf{弱工具变量}导致严重偏差；可用 Sargan/Hansen 过度识别检验、Hausman 内生性检验。`),
    F('jj11', 'regress', '虚拟变量与交互项',
      R`如何在回归中使用虚拟变量（定性变量）与交互项，并解释系数？`,
      R`\underline{虚拟变量}：把定性变量转成 0/1。若分 $k$ 类，只设 $k-1$ 个虚拟变量（\textbf{基准类取 0}），以免完全共线。系数 $\beta_D$ 表示“该类别相对基准类，均值差 $\beta_D$”。\underline{交互项}：$X\cdot D$体现不同组\textbf{斜率差异}；$X_1\cdot X_2$ 体现\textbf{交叉影响}。
\underline{模型}：$Y=\beta_0+\beta_1X+\beta_2D+\beta_3(X\cdot D)+\varepsilon$。
① $D=0$（基准）：$Y=\beta_0+\beta_1X$；② $D=1$：$Y=(\beta_0+\beta_2)+(\beta_1+\beta_3)X$。
故 $\beta_2$=两组\textbf{截距}之差，$\beta_3$=两组\textbf{斜率}之差。
\underline{注意}：加入交互后 $\beta_1$ 是\textbf{基准组}（$D=0$）的斜率，\textbf{不是}全体平均效果；交互项显著才说明组间斜率/影响不同。`),
    F('jj12', 'regress', '模型设定与变量选择',
      R`建立多元回归模型时为什么要进行变量选择？向前/向后/逐步选择各是什么？`,
      R`\underline{必要性}：加入多余变量会损失自由度、增大方差、可能造成共线性且 $R^2$ 虚高；\textbf{遗漏重要变量}则产生\textbf{遗漏变量偏差}（估计有偏）。需在“解释力”与“简洁”间权衡。
\underline{前向选择 Forward}：从常数项起，逐次加入\textbf{最显著}变量，直到无可加显著变量。
\underline{后向选择 Backward}：从全变量起，逐次剔除\textbf{最不显著}变量，直到留下的都显著。
\underline{逐步选择 Stepwise}：前向+后向结合（可进可出），每加一个显著变量后再检验并剔除变得不显著的。
\underline{判据}：调整 $\bar R^2$、AIC/BIC、$F$ 检验、$p$ 值、VIF（共线性）。\underline{易混}：逐步回归是\textbf{数据驱动}、可能过拟合，不同准则结果不同；模型设定应以\textbf{理论}为先。`),
    F('test17', 'testing', '两类错误与样本量的确定',
      R`简述假设检验的两类错误及其概率关系；若要同时控制显著性水平 $\alpha$ 并把犯 Ⅱ 类错误的概率压到 $\beta$，应如何确定样本量？`,
      R`\textbf{两类错误}：Ⅰ 类错误——$H_0$ 为真却拒绝，$P(\text{Ⅰ 类})=\alpha$（显著性水平）；Ⅱ 类错误——$H_0$ 不真却不拒绝，$P(\text{Ⅱ 类})=\beta$（$1-\beta$ 称检验功效）。
\underline{关系}：$n$ 固定时 $\alpha$ 与 $\beta$ 此消彼长（$\alpha$ 越小临界值越靠外，越难拒绝、$\beta$ 越大）；同时压低两者的唯一途径是\underline{增大样本量} $n$。
\underline{样本量公式}（正态总体、单侧检验、可检测差异 $\delta$）：$$n=\left[\dfrac{(z_\alpha+z_\beta)\,\sigma}{\delta}\right]^{2}\quad(\text{双侧用 } z_{\alpha/2})$$ 例：$\alpha=0.05$、$\beta=0.10$、$\sigma=1$、$\delta=0.5$ 时 $n=\left[\dfrac{1.645+1.282}{0.5}\right]^2\approx34.3$，故 $n\ge35$。
\textbf{易混}：$p$ 值是在给定数据下犯 Ⅰ 类错误的条件度量，与 $\beta$ 无关；功效分析要在收集数据前做。`),
    // ============ 补充：茆诗松教材补全（v1.35.0） ============
    F('pb12', 'prob_basic', '概率的统计定义（频率与概率）',
      R`什么是频率？概率的统计定义是什么？`,
      R`频率：$f_n(A)=\dfrac{n_A}{n}$（$n_A$ 为 $n$ 次重复试验中 $A$ 发生的次数）。
频率随试验批次波动，但当 $n$ 增大时呈现出\textbf{稳定性}——稳定于某个常数。概率的统计定义：该稳定值就是事件 $A$ 的概率 $P(A)$。
- 频率满足非负性、规范性、有限可加性（与概率公理一致），故频率可作为概率的估计（蒙特卡洛方法的理论基础）。
- 理论支撑：伯努利大数定律——频率\textbf{依概率}收敛于概率。`),
    F('pb13', 'prob_basic', '相互独立与两两独立',
      R`相互独立与两两独立的区别`,
      R`\textbf{两两独立}：$P(AB)=P(A)P(B)$、$P(AC)=P(A)P(C)$、$P(BC)=P(B)P(C)$ 三式成立。
\textbf{相互独立}：以上三式\textbf{再加} $P(ABC)=P(A)P(B)P(C)$，共四式。
相互独立 $\Rightarrow$ 两两独立，\textbf{反之不成立}。经典反例：掷两枚均匀硬币，$A$=第一枚正面、$B$=第二枚正面、$C$=两枚结果相同——两两独立，但 $P(ABC)=\frac14\ne\frac18=\frac12\cdot\frac12\cdot\frac12$。
- 两两独立时 $P(ABC)$ 可能大于、小于或等于 $P(A)P(B)P(C)$——必须单独验证。
- 实际推断常默认「相互独立」：题目说「独立重复」即指相互独立。`),
    F('ll08', 'limit', '依概率收敛与按分布收敛',
      R`依概率收敛与按分布收敛的定义及关系`,
      R`\textbf{依概率收敛}：$\forall\varepsilon>0$，$P(|X_n-X|\ge\varepsilon)\to 0\ (n\to\infty)$，记 $X_n\overset{P}{\longrightarrow}X$——$X_n$ 大幅偏离 $X$ 的可能性随 $n$ 消失。
\textbf{按分布收敛}（弱收敛）：$X_n$ 的分布函数在 $X$ 的每个连续点处收敛于 $F(x)$，记 $X_n\overset{d}{\longrightarrow}X$——只看分布形状。
- 关系：依概率收敛 $\Rightarrow$ 按分布收敛，反之\textbf{不成立}（$X$ 与 $-X$ 同分布即可作反例）。
- 两大极限定理的严格语言：大数定律 = $\bar X_n\overset{P}{\to}\mu$（依概率）；中心极限定理 = 标准化和 $\overset{d}{\to}N(0,1)$（按分布）。
- 依概率收敛的证明主力工具是切比雪夫不等式。`),
    F('ll09', 'limit', '李雅普诺夫中心极限定理',
      R`不同分布下的中心极限定理（李雅普诺夫）`,
      R`设 $X_1,\dots,X_n$ \textbf{相互独立但可不同分布}，期望与方差都存在且方差一致有界，则当 $n$ 充分大：$$\frac{\sum_{i=1}^{n}X_i-\sum_{i=1}^{n}E(X_i)}{\sqrt{\sum_{i=1}^{n}D(X_i)}}\ \overset{\text{近似}}{\sim}\ N(0,1)$$
- 与林德伯格-列维定理（独立同分布）的区别：李雅普诺夫\textbf{不要求同分布}——只要每个 $X_i$ 的方差在总方差中占比都不大（无单项主导），标准化和仍近似正态。
- 直觉：多种来源的独立微小干扰叠加（测量误差 = 仪器误差 + 环境误差 + 人为误差……），总效应趋于正态。
- 应用：不同分布独立变量之和的概率计算——分别算出总期望与总方差后直接套用。`),
    F('sm12', 'sampling', '两正态总体的抽样分布',
      R`两个正态总体下常用统计量的分布（抽样分布定理）`,
      R`设 $X_1,\dots,X_m$ 与 $Y_1,\dots,Y_n$ 分别来自 $N(\mu_1,\sigma_1^2)$、$N(\mu_2,\sigma_2^2)$，两样本相互独立：
① \textbf{均值差}：$\bar X-\bar Y\sim N\!\left(\mu_1-\mu_2,\ \dfrac{\sigma_1^2}{m}+\dfrac{\sigma_2^2}{n}\right)$；
② \textbf{方差相等}（$\sigma_1^2=\sigma_2^2$）时：$$t=\frac{(\bar X-\bar Y)-(\mu_1-\mu_2)}{S_w\sqrt{\dfrac1m+\dfrac1n}}\sim t(m+n-2),\qquad S_w^2=\frac{(m-1)S_1^2+(n-1)S_2^2}{m+n-2}$$（$S_w^2$ 称合并方差/加权平均）
③ \textbf{方差比}：$\dfrac{S_1^2/\sigma_1^2}{S_2^2/\sigma_2^2}\sim F(m-1,\ n-1)$。
是两均值差检验与两方差比检验的抽样分布基础。`),
    F('sm13', 'sampling', '样本中位数与样本极差',
      R`样本中位数与样本极差的定义与用途`,
      R`由次序统计量 $X_{(1)}\le X_{(2)}\le\cdots\le X_{(n)}$ 定义：
\textbf{样本中位数} $Me$：$n$ 为奇数取 $X_{\left(\frac{n+1}{2}\right)}$；$n$ 为偶数取 $\frac{1}{2}\left(X_{\left(\frac n2\right)}+X_{\left(\frac n2+1\right)}\right)$。
\textbf{样本极差} $R$：$X_{(n)}-X_{(1)}$（最大减最小）。
- 中位数对\textbf{离群值稳健}——数据重尾或含异常点时比 $\bar X$ 更能代表中心；正态对称下两者接近。
- 极差是波动的快估计：质量管理中 $\hat\sigma\approx R/d_2$（$d_2$ 查表）；对样本量敏感（$n$ 大时极差高估波动）。
- 与 $\bar X$、$S$ 相比：计算快、稳健，但统计效率低（同等 $n$ 下信息利用不足）。`),
    F('sm14', 'sampling', '频数频率表与直方图',
      R`如何由样本数据作频率直方图？`,
      R`步骤：① 由 $x_{(1)},x_{(n)}$ 确定数据范围；② 等宽分组（组数经验取 $k\approx\sqrt n$ 或斯特古斯公式）；③ 数各组的频数 $n_i$，算频率 $f_i=n_i/n$ 与「频率/组距」；④ 以组距为宽、「频率/组距」为高画矩形。
- \textbf{纵轴必须是频率/组距}：这样各矩形面积 = 组内频率，全部矩形面积之和为 1——直方图整体近似\textbf{密度曲线} $f(x)$（面积法估计分布）。
- 纵轴若用频率，图形形状相同但面积不归一，不能当作密度估计。
- 茎叶图：把每个数据拆成「茎（高位）+ 叶（末位）」按行排列——等价于保留原始数字的直方图，样本量小时信息不丢失。`),
    F('sm15', 'sampling', '箱线图',
      R`箱线图如何构造？如何判别异常值？`,
      R`\textbf{五数概括}：$x_{(1)}$（最小值）、$Q_1$（下四分位数）、$Me$（中位数）、$Q_3$（上四分位数）、$x_{(n)}$（最大值）。
画法：箱体从 $Q_1$ 到 $Q_3$（中位数线在箱内）；\textbf{箱界}（内栏）为 $Q_1-1.5\,\mathrm{IQR}$ 与 $Q_3+1.5\,\mathrm{IQR}$，其中 $\mathrm{IQR}=Q_3-Q_1$（四分位差）；须线自箱体延伸至\textbf{箱界内的最远观测值}；超出箱界的观测逐一描点——视为\textbf{疑似异常值}。
- 解读：中位线在箱中的位置反映对称性（居中≈对称，偏一侧≈偏态）；箱长≈中间 50% 数据的散布。
- 优点：稳健（分位数不受极端值影响）、适合多组并列比较。`),
    F('sm16', 'sampling', '正态概率图',
      R`正态概率图（Q-Q 图）的原理与判读`,
      R`\textbf{原理}：把样本分位数与正态分布的理论分位数配对描点——若数据来自 $N(\mu,\sigma^2)$，则各点近似落在一条\textbf{直线}上（斜率 $\approx\sigma$，截距 $\approx\mu$）。
作法：将次序统计量 $x_{(i)}$ 对正态分数 $\Phi^{-1}\!\left(\dfrac{i-0.375}{n+0.25}\right)$（$i=1,\dots,n$）描点。
- 判读：点近似直线 $\Rightarrow$ 不拒绝正态；两端点偏离直线且右尾上翘 $\Rightarrow$ 右偏；S 形弯曲 $\Rightarrow$ 偏态；两端同时离开直线 $\Rightarrow$ 峰度异常（尖峰或平峰）。
- 是检验正态性的\textbf{直观图形}方法（看具体形态）；正式的假设检验用正态性检验统计量（如 Shapiro-Wilk）。`),
    F('nc17', 'numchar', '变异系数',
      R`变异系数的定义与用途`,
      R`$$CV=\frac{\sigma(X)}{E(X)}\qquad(E(X)>0)$$
无量纲的\textbf{相对}波动度量——标准差与均值之比（常写成百分数）。
- 用途：比较\textbf{量纲不同或量级悬殊}的数据的离散程度——如身高（cm）与体重（kg）谁更「整齐」；同样的 5 kg 绝对差异，对婴儿体重比对成年人体重重要得多。
- 与标准差的区别：标准差有量纲、受量级影响（把单位从米换成厘米，标准差数值×100）；CV 消除了量纲与量级的影响。
- 正态分布的 $CV=\sigma/\mu$ 与 $\sigma^2/\mu^2$ 有对应关系——泊松分布 $CV=1/\sqrt\lambda$（$\lambda$ 越大相对越稳定）。`),
    F('nc18', 'numchar', '偏度与峰度',
      R`偏度系数与峰度系数的定义与解读`,
      R`\textbf{偏度}（三阶标准化矩）：$$\mathrm{Sk}=\frac{E[(X-\mu)^3]}{\sigma^3}$$ 衡量\textbf{不对称性}：右偏（右尾长、峰在左）为正；左偏为负；对称分布为 0（正态 $\mathrm{Sk}=0$）。
\textbf{峰度}（四阶标准化矩减 3）：$$\mathrm{Kur}=\frac{E[(X-\mu)^4]}{\sigma^4}-3$$ 衡量\textbf{尾部厚度}（以正态为 0 基准）：$\mathrm{Kur}>0$ 尖峰厚尾（如 $t$ 分布、拉普拉斯分布）；$\mathrm{Kur}<0$ 平峰薄尾（如均匀分布）。
- 快速判断偏态方向：均值与中位数比较——右偏时 $\bar X>Me$（长尾把均值拉向右侧）。
- 样本偏度/样本峰度（用三、四阶样本中心矩代入）是正态性初判的常用统计量。
- \textbf{减 3} 是把正态分布定为 0 基准——有的软件不减（正态报 3），比较数值前先确认定义。`),
    F('nc19', 'numchar', '协方差矩阵',
      R`二维随机变量的协方差矩阵`,
      R`把 $(X,Y)$ 的四个二阶中心矩排成矩阵：$$\Sigma=\begin{pmatrix}\mathrm{Var}(X) & \mathrm{Cov}(X,Y)\\ \mathrm{Cov}(Y,X) & \mathrm{Var}(Y)\end{pmatrix}$$
- 性质：\textbf{对称}、\textbf{半正定}——对任意常向量 $a$，$\mathrm{Var}(a^\top X)=a^\top\Sigma a\ge 0$（线性组合的方差非负）。
- 二维正态的五个参数 $(\mu_1,\mu_2;\sigma_1^2,\sigma_2^2;\rho)$ 中 $\mathrm{Cov}(X,Y)=\rho\,\sigma_1\sigma_2$——由均值向量 + 协方差矩阵完全刻画。
- $n$ 维正态的重要性质：各分量相互独立 $\Leftrightarrow$ $\Sigma$ 为对角阵（两两不相关即独立）——只对正态成立。
- 线性变换：$Y=AX$（$A$ 常数矩阵）时 $\mathrm{Cov}(Y)=A\Sigma A^\top$。`),
    F('nc20', 'numchar', '全方差公式',
      R`全方差公式（方差分解）`,
      R`$$\mathrm{Var}(X)=E\big[\mathrm{Var}(X\mid Y)\big]+\mathrm{Var}\big[E(X\mid Y)\big]$$
方差 = 「组内方差的平均」 + 「组间方差」。
- 记忆锚：与全概率公式的期望版 $E(X)=E\big[E(X\mid Y)\big]$ 配对——「条件期望的期望」与「条件方差的期望 + 条件期望的方差」。
- 证明思路：把 $\mathrm{Var}(X)=E(X^2)-[E(X)]^2$ 按条件分布分层展开。
- 应用：分层/聚类数据的方差分解（总波动有多少来自组间差异）；刻画「对 $Y$ 的了解程度如何削减 $X$ 的不确定性」。
- 独立时 $\mathrm{Var}(X\mid Y)=\mathrm{Var}(X)$、$E(X\mid Y)$ 为常数——两项退化为 $\mathrm{Var}(X)+0$，自洽。`),
    F('est22', 'estimation', '均方误差准则',
      R`均方误差准则；有偏估计可能更优吗？`,
      R`$$\mathrm{MSE}(\hat\theta)=E\big[(\hat\theta-\theta)^2\big]=\mathrm{Var}(\hat\theta)+b^2(\theta)\qquad(b(\theta)=E(\hat\theta)-\theta \text{ 为偏差})$$
\textbf{MSE = 方差 + 偏差平方}——落点围绕靶心的散布分解为「散得开不开」与「偏不偏」两部分。
- 无偏估计未必 MSE 最小：方差很小的有偏估计整体可以更准。经典例子：估计 $N(\mu,\sigma^2)$ 的 $\sigma^2$ 时，$\frac{1}{n}\sum(X_i-\bar X)^2$ 有偏（偏差 $-\sigma^2/n$）但 MSE 小于无偏估计 $\frac{1}{n-1}\sum(X_i-\bar X)^2$。
- 「以偏换方差」的思想在现代统计中处处可见（岭回归、正则化）——牺牲少量无偏性换取大幅方差缩减。
- 评选路线：先看无偏性 → 同为无偏比方差（有效性）→ 跨无偏界限比 MSE（本卡）。`),
    F('est23', 'estimation', '极大似然估计的不变性原则',
      R`极大似然估计的不变性原则`,
      R`若 $\hat\theta$ 是 $\theta$ 的 MLE，则 $g(\theta)$ 的 MLE 就是 $g(\hat\theta)$（$g$ 为任意函数；多对一对应时取使 $L$ 达到最大的那个像点）。
- 免去对 $g(\theta)$ 重新构造似然与求导的麻烦——「先估参数，再代函数」。
- 例：$N(\mu,\sigma^2)$ 中 $\sigma^2$ 的 MLE 为 $\hat\sigma^2=\frac1n\sum(x_i-\bar x)^2$，故标准差 $\sigma$ 的 MLE 即 $\hat\sigma=\sqrt{\hat\sigma^2}$（有偏但 MLE）；$\lambda$ 的 MLE 为 $\bar x$ 时，$e^{-\lambda}$（泊松零概率）的 MLE 即 $e^{-\bar x}$。
- 注意：不变性保证 MLE，\textbf{不}保证无偏——$g(\hat\theta)$ 的期望一般不等于 $g(\theta)$。`),
    F('est24', 'estimation', '单侧置信限',
      R`单侧置信下限与单侧置信上限`,
      R`实际问题常只需「不低于 / 不高于」一端：
① \textbf{单侧置信下限} $\underline\theta$：$P(\theta\ge\underline\theta)=1-\alpha$——如灯泡寿命、合格率的下限；
② \textbf{单侧置信上限} $\bar\theta$：$P(\theta\le\bar\theta)=1-\alpha$——如废品率、有害物含量的上限。
构造：与双侧区间用\textbf{同一个枢轴量}，区别只在把 $\alpha/2$ 换成 $\alpha$。正态 $\sigma^2$ 已知时，$\mu$ 的 $1-\alpha$ 单侧置信下限为 $\bar x-z_{\alpha}\dfrac{\sigma}{\sqrt n}$（双侧区间用 $z_{\alpha/2}$）。
- 与检验的对偶：单侧置信限与同侧的单侧假设检验（水平 $\alpha$）一一对应——下限在 $\mu_0$ 之右 $\Leftrightarrow$ 拒绝 $H_0:\mu\le\mu_0$。`),
    F('reg13', 'regress', '多重比较',
      R`方差分析显著后为什么要做多重比较？LSD 法怎么做？`,
      R`ANOVA 的 $F$ 显著只说明「均值\textbf{不全}相等」，不指明哪两个不同——需逐对比较，即\textbf{多重比较}。
\textbf{LSD 法}（最小显著差）：用 $S_w^2$（ANOVA 的组内方差估计）替代各对样本方差，第 $i,j$ 两水平均值的比较临界值为 $$t_{\alpha/2}(n-k)\,\sqrt{S_w^2\left(\frac1{n_i}+\frac1{n_j}\right)}$$ 两样本均值之差的绝对值超过该值即判定显著不同。
- 优点：简单、沿用 ANOVA 的自由度与 $S_w^2$；缺点：比较次数 $m$ 多时，整体犯 Ⅰ 类错误的概率累积膨胀（远超 $\alpha$）。
- 严格场合的校正：\textbf{Tukey HSD}（基于学生化极差分布，控制所有成对比较的整体错误率）、\textbf{Bonferroni}（每对用 $\alpha/m$）。
- 方差齐性假定由 ANOVA 继承——比较用的是共同的 $S_w^2$。`),
    F('reg14', 'regress', '一元非线性回归',
      R`常见可线性化的一元非线性回归曲线`,
      R`散点呈曲线形态时：选曲线类型 $\to$ \textbf{变量替换}化为线性 $\to$ 最小二乘 $\to$ 反解回原变量。常见曲线：
① 双曲线 $\dfrac1y=a+\dfrac bx$（令 $y'=\dfrac1y,\ x'=\dfrac1x$）；
② 对数曲线 $y=a+b\ln x$（令 $x'=\ln x$）；
③ 指数曲线 $y=ae^{bx}$（两边取对数：$\ln y=\ln a+bx$）；
④ 幂函数曲线 $y=ax^b$（取对数：$\ln y=\ln a+b\ln x$）。
- 选型依据：散点图形态 + 业务机理（如增长饱和选对数、复利式增长选指数）。
- 注意：线性化后拟合的 $R^2$ 是「替换后变量」的判定系数，\textbf{不能}与原尺度的 $R^2$ 直接比较；最终以残差图与业务合理性定案。
- 与对数线性模型（弹性解释）衔接：幂函数取对数后系数 $b$ 即弹性。`),

    // ===== 2.2.0 C1+C2 统计补写（t50） =====
    // ---- pb14 事件域（σ-域）与事件列极限 ----
    F('pb14', 'prob_basic', '事件域（σ-域）与事件列极限',
      R`事件域（$\sigma$-域）的定义是什么？事件列的上、下极限如何定义？`,
      R`**事件域（$\sigma$-域）**：样本空间 $\Omega$ 上的集族 $\mathcal{F}$ 满足三条件——① $\Omega\in\mathcal{F}$；② $A\in\mathcal{F}\Rightarrow\bar A=\Omega\setminus A\in\mathcal{F}$（余封闭）；③ $A_1,A_2,\dots\in\mathcal{F}\Rightarrow\bigcup_{n=1}^{\infty}A_n\in\mathcal{F}$（**可列并**封闭）。由①②③可推出：对可列交、有限并/交、差封闭，且 $\varnothing\in\mathcal{F}$。
注意「可列」不能放宽为「任意」（否则与概率的可列可加性不匹配）。
**事件列的上、下极限**：
$$\varlimsup_{n}A_n=\bigcap_{n=1}^{\infty}\bigcup_{k=n}^{\infty}A_k=\{\omega:\omega\ \text{属于无穷多个}\ A_n\},\qquad \varliminf_{n}A_n=\bigcup_{n=1}^{\infty}\bigcap_{k=n}^{\infty}A_k=\{\omega:\omega\ \text{至多不属于有限个}\ A_n\}$$
恒有 $\varliminf A_n\subset\varlimsup A_n$；二者相等时称事件列**有极限**，记 $\lim_{n}A_n$（单调列必收敛：$A_n\uparrow\Rightarrow\lim A_n=\bigcup_n A_n$）。
**概率空间**：$(\Omega,\mathcal{F},P)$ 三者配套——只有 $A\in\mathcal{F}$ 才谈 $P(A)$；概率的**连续性**（依 ①②③可证）：$A_n\uparrow A\Rightarrow P(A_n)\uparrow P(A)$，$A_n\downarrow A\Rightarrow P(A_n)\downarrow P(A)$。
**适用**：判定集族是否为事件域、处理「无穷多次发生」型事件、以及使用概率连续性（$A_n\uparrow A\Rightarrow P(A_n)\uparrow P(A)$）时；只有落在 $\mathcal{F}$ 内的集合才可谈概率。
**易混**：σ-域的第③条是可列并而非任意并——「可列」不能放宽；$\varliminf A_n\subset\varlimsup A_n$ 的方向别写反；单调列的极限分别是 $\bigcup_n A_n$（升）与 $\bigcap_n A_n$（降）。
（茆诗松 1.1 事件域与 1.3 概率的性质，PDF p23 / p50）`),
    // ---- pb15 可测空间与 Borel σ-域 ----
    F('pb15', 'prob_basic', '可测空间与 Borel σ-域',
      R`什么是可测空间？$\sigma(\mathcal{A})$ 与 Borel $\sigma$-域 $\mathcal{B}(\mathbb{R})$ 如何构造？常见例子有哪些？`,
      R`**可测空间**：$(\Omega,\mathcal{F})$ ＝样本空间 + $\sigma$-域；$\mathcal{F}$ 中的集合称为**可测集**（概率论中即事件）。概率是可测空间上的测度：$P:\mathcal{F}\to[0,1]$，可列可加、$P(\Omega)=1$。
**生成 $\sigma$-域**：对任意集族 $\mathcal{A}$，令 $\sigma(\mathcal{A})=\bigcap\{\mathcal{G}:\mathcal{G}\ \text{是}\ \sigma\text{-域},\ \mathcal{A}\subset\mathcal{G}\}$，即包含 $\mathcal{A}$ 的**最小** $\sigma$-域（所有覆盖者之交仍是 $\sigma$-域）。
**常见例子**：① 由 $\Omega$ 的**有限划分** $\{B_1,\dots,B_m\}$ 生成的 $\sigma$-域＝诸 $B_i$ 的并的全体（共 $2^{m}$ 个事件）；② $\mathbb{R}$ 上由全体开区间（等价地由 $(-\infty,x]$ 或 $(a,b]$）生成的 $\sigma$-域称为 **Borel $\sigma$-域** $\mathcal{B}(\mathbb{R})$，其元素（Borel 集）包含一切开集、闭集、可列集以及它们经可列并/交/余得到的结果；③ 平凡 $\sigma$-域 $\{\varnothing,\Omega\}$（最小）与幂集 $2^{\Omega}$（最大）；④ 若 $\mathcal{F}=\sigma(X)$（由随机变量 $X$ 生成），则 $X$ **可测**$\iff$对一切 $x$ 有 $\{X\le x\}\in\mathcal{F}$。
**意义**：把「能算概率的事件」与「不能算」的集合区分开（如 Vitali 型不可测集的存在），是公理化体系的基础。
**适用**：为概率空间 $(\Omega,\mathcal{F},P)$ 提供公理化骨架；$\mathbb{R}$ 上取 $\mathcal{B}=\sigma(\text{开集})$，讨论区间事件与连续型随机变量的可测性时用它。
**易混**：Borel σ-域是「包含全部开集的**最小** σ-域」，不是幂集 $\mathcal{P}(\Omega)$；幂集虽也是 σ-域，但过大以致存在不可测集，故概率论取 Borel。
（专题三 公理化体系 §2，PDF p2）`),
    // ---- pb16 事件列上下极限与概率连续性 ----
    F('pb16', 'prob_basic', '事件列上下极限与概率连续性',
      R`事件列的上/下极限与概率连续性有哪些常用结论？Borel-Cantelli 型推理怎么用？`,
      R`记 $\varlimsup A_n=\{\omega:\omega\ \text{属于无穷多个}\ A_n\}$（记作 $A_n\ \mathrm{i.o.}$）、$\varliminf A_n=\{\omega:\omega\ \text{至多不属于有限个}\ A_n\}$（$A_n\ \mathrm{a.a.}$）。
**连续性（单调列）**：$A_n\uparrow\Rightarrow P\big(\bigcup_n A_n\big)=\lim_{n}P(A_n)$；$A_n\downarrow\Rightarrow P\big(\bigcap_n A_n\big)=\lim_{n}P(A_n)$。这是「概率作为测度」的基本性质，也是可列可加性的等价表述。
**一般事件列不等式**：$P(\varliminf A_n)\ \le\ \varliminf P(A_n)\ \le\ \varlimsup P(A_n)\ \le\ P(\varlimsup A_n)$。
**Borel-Cantelli 型结论**：①（无需独立）若 $\sum_{n}P(A_n)<\infty$，则 $P(\varlimsup A_n)=0$，即几乎必然只发生有限次；②（须独立且 $\sum_n P(A_n)=\infty$）则 $P(\varlimsup A_n)=1$，即几乎必然发生无穷多次。
**典型用法**：① 证「几乎必然」型结论——先估 $P(\{|X_n-X|>\varepsilon\})$ 的级数收敛，由 ① 得 $P(\{|X_n-X|>\varepsilon\}\ \mathrm{i.o.})=0$ 再取 $\varepsilon=\frac1k$ 的可列并；② 由 $\varlimsup$ 定义把「事件序列无穷次出现」转成概率为 0/1 的判定；③ 与概率连续性联用，把有限情形的结论过渡到可列情形。
**适用**：求「无穷多次发生 / 至多有限次不发生」的概率、铺垫 Borel–Cantelli 与强大数定律；遇到 $\limsup$ 型题目先把集合表达式写清再取概率。
**易混**：$\varlimsup_n A_n=\bigcap_n\bigcup_{k\ge n}A_k$（交外并内），顺序写反就把「无穷多次」写成「最终恒发生」；概率连续性是 $A_n\uparrow A\Rightarrow P(A_n)\uparrow P(A)$，与单调性不是同一件事。
（专题三 公理化体系 §4，PDF p6）`),
    // ---- nc21 特征函数唯一性定理与反演公式 ----
    F('nc21', 'numchar', '特征函数唯一性定理与反演公式',
      R`特征函数的唯一性定理与反演公式是什么？怎样用它辨识分布族？`,
      R`**唯一性定理**：分布函数由特征函数唯一确定——若 $X,Y$ 的特征函数相同（$\varphi_X(t)\equiv\varphi_Y(t)$），则 $X\overset{d}{=}Y$。这是「用 $\varphi$ 辨识分布」的理论依据。
**反演公式**：在 $F$ 的连续点 $a<b$，
$$F(b)-F(a)=\frac{1}{2\pi}\lim_{T\to\infty}\int_{-T}^{T}\frac{e^{-ita}-e^{-itb}}{it}\,\varphi(t)\,\mathrm{d}t;$$
当 $\varphi$ 绝对可积（$\int|\varphi|<\infty$）时分布有密度且
$$f(x)=\frac{1}{2\pi}\int_{-\infty}^{\infty}e^{-itx}\varphi(t)\,\mathrm{d}t.$$
**连续性定理（逆转工具）**：若 $\varphi_n(t)\to\varphi(t)$ 对每个 $t$ 成立，且 $\varphi$ 在 $t=0$ 处连续，则 $F_n\Rightarrow F$（依分布收敛）——中心极限定理的证明正是先证特征函数收敛、再用此定理。
**辨识/证明分布的三步套路**：① 求出（或查表得）$\varphi$；② 与已知族比对——$N(0,1)$：$e^{-t^{2}/2}$、$N(\mu,\sigma^{2})$：$e^{i\mu t-\frac12\sigma^{2}t^{2}}$、$P(\lambda)$：$e^{\lambda(e^{it}-1)}$、$\Gamma(\alpha,\beta)$：$(1-\frac{it}{\beta})^{-\alpha}$、$B(1,p)$：$1-p+pe^{it}$；③ 由唯一性直接判定分布族，避免求密度的繁重积分。
**适用**：证两个分布族相同、辨识极限分布（先证 $\varphi_n(t)\to\varphi(t)$ 再用连续性定理）、判定随机变量和的可加性；$\varphi$ 绝对可积时可直接反演求密度。
**易混**：唯一性定理只说「同 $\varphi$ ⇒ 同分布」，不能反推别的信息；连续性定理要求极限 $\varphi$ 在 $t=0$ **连续**（否则可能退化到无分布）；$\varphi_X(t)$ 与矩母函数 $M_X(t)=\varphi_X(-it)$ 的自变量替换方向别写反。
（茆诗松 4.2 特征函数（含定理 4.2.1–4.2.6），PDF p214）`),
    // ---- est25 EM 算法的 E 步与 M 步 ----
    F('est25', 'estimation', 'EM 算法的 E 步与 M 步',
      R`EM 算法解决什么问题？E 步与 M 步各做什么，$Q$ 函数如何定义？`,
      R`**问题**：观测数据 $Y$ 之外还有**缺失数据/隐变量** $Z$，直接最大化观测似然 $L(\theta;Y)$ 的积分（或求和）难以处理；EM 算法用迭代绕过积分。
记完全数据 $(Y,Z)$ 的对数似然 $\ell_c(\theta)=\ln f(Y,Z;\theta)$，当前参数 $\theta^{(t)}$。
**E 步（期望）**：求完全数据对数似然在给定观测与当前参数下的条件期望
$$Q(\theta\mid\theta^{(t)})=E_{\theta^{(t)}}\big[\ln f(Y,Z;\theta)\ \big|\ Y\big];$$
**M 步（最大化）**：$\theta^{(t+1)}=\arg\max_{\theta}Q(\theta\mid\theta^{(t)})$；两步交替直到收敛（$Q$ 或对数似然变化小于阈值）。
**为什么有效（单调性）**：由 Jensen 不等式可得 $L(\theta^{(t+1)};Y)\ge L(\theta^{(t)};Y)$，即每次迭代**不降低**观测似然；因此 EM 是「保证上升」的算法，但只收敛到**局部**极大（初值敏感，实务上多初值重启）。
**特点**：只用到「$Q$ 可算」与「M 步可解」，不需要显式后验；收敛速度线性，对参数强相关的问题可能很慢。
**适用**：观测似然含难以处理的积分/求和（缺失数据、隐变量、混合模型），而完全数据似然容易最大化时；迭代保证 $\ell(\theta^{(t+1)})\ge\ell(\theta^{(t)})$（单调不减）。
**易混**：Q 函数是完全数据对数似然在隐变量条件分布（用**当前** $\theta^{(t)}$）下的期望，不是观测似然；EM 只保证收敛到局部最大或鞍点，初值与多起点会影响结果。
（茆诗松 6.3 最大似然估计与 EM 算法，PDF p299）`),
    // ---- est26 EM 示例：两分量正态混合的 M 步 ----
    F('est26', 'estimation', 'EM 示例：两分量正态混合的 M 步',
      R`两分量正态混合模型的 E 步责任度与 M 步闭式解怎么写？`,
      R`模型：$Y_i$ 以概率 $\pi$ 来自 $N(\mu_1,\sigma^{2})$、以 $1-\pi$ 来自 $N(\mu_2,\sigma^{2})$（方差同构），参数 $\theta=(\pi,\mu_1,\mu_2,\sigma^{2})$，隐变量 $Z_i\in\{1,2\}$。
**E 步（责任度）**：记 $\phi$ 为标准正态密度，
$$w_i=\frac{\pi\,\phi\big((y_i-\mu_1)/\sigma\big)}{\pi\,\phi\big((y_i-\mu_1)/\sigma\big)+(1-\pi)\,\phi\big((y_i-\mu_2)/\sigma\big)}\quad(w_i=P(Z_i=1\mid y_i,\theta^{(t)}))$$
**M 步（加权闭式）**：令 $W=\sum_i w_i$、$n$ 为样本量，则
$$\hat\pi=\frac{W}{n},\qquad \hat\mu_1=\frac{\sum_i w_iy_i}{W},\qquad \hat\mu_2=\frac{\sum_i (1-w_i)y_i}{\ n-W\ },\qquad \hat\sigma^{2}=\frac{1}{n}\Big[\sum_i w_i(y_i-\hat\mu_1)^{2}+\sum_i (1-w_i)(y_i-\hat\mu_2)^{2}\Big]$$
（方差同构时合并为一个估计；方差不同构则分别估计。）
**注意**：混合模型的似然是**多峰**且**无界**的（如取 $\mu_1=y_1$、$\sigma\to0$ 会使似然发散），实务上固定 $\sigma$ 的正下界、或用多组初值选取最优解；$w_i$ 反映「该观测归属哪一分量的后验概率」，与判别分析/聚类有直接联系。
**适用**：两分量正态混合 $pN(\mu_1,\sigma_1^2)+(1-p)N(\mu_2,\sigma_2^2)$ 的迭代求解；责任度 $\gamma_{ik}$ 充当「软标签」，M 步即加权最小二乘。
**易混**：M 步的 $\mu_k$ 是**责任度加权**均值（不是按硬分组求均值），$\sigma_k^2$ 与 $p$ 同理（$p=$ 平均责任度）；两分量互换标签不改变似然（label switching），报告参数时须固定标签。
（茆诗松 6.3 混合模型例子，PDF p299）`),
    // ---- reg15 方差齐性检验（Fmax/Bartlett） ----
    F('reg15', 'regress', '方差齐性检验（Fmax/Bartlett）',
      R`方差齐性检验有哪三种方法？$F_{\max}$ 与 Bartlett 统计量怎么写、怎么判？`,
      R`设 $s$ 个水平、每水平 $r$ 次重复（平衡），水平内样本方差 $s_i^{2}$、自由度 $f=r-1$。
**① Hartley $F_{\max}$ 检验**：$F_{\max}=\dfrac{\max_{i}s_i^{2}}{\min_{i}s_i^{2}}$，查 $F_{\max}(s,f)$ 表的上侧分位数；$F_{\max}\ge F_{\max,1-\alpha}(s,f)$ 则拒绝方差齐性。要求**各水平重复数相同**（不平衡时不能直接用）。
**② Bartlett 检验（近似 $\chi^{2}$）**：$\chi^{2}=\dfrac{2.3026}{C}\Big[f\ln\Big(\frac{1}{s}\sum_i s_i^{2}\Big)-\sum_i f_i\ln s_i^{2}\Big]$，其中 $f=s(r-1)$、
$$C=1+\frac{1}{3(s-1)}\Big[\sum_{i=1}^{s}\frac{1}{f_i}-\frac{1}{\sum_i f_i}\Big]$$
（$2.3026=\ln 10$，用于把自然对数结果换算成常用对数形式；$f_i$ 为各水平残差自由度）。当各 $f_i=r-1$ 时 $\chi^{2}\approx\chi^{2}(s-1)$，$\chi^{2}\ge\chi^{2}_{1-\alpha}(s-1)$ 拒绝。
**③ 修正 Bartlett**：各水平重复数不等（$r_i$ 不同）时的加权形式，把 $C$ 中的 $f_i$ 逐水平代入即可。
**用途与局限**：方差齐性是两样本 $t$ 检验与单因素方差分析 ANOVA 的**前置假设**；拒绝时改用 Welch $t$ / Welch ANOVA / 秩检验。$F_{\max}$ 对非正态极敏感（分布尾部差异会伪装成方差不齐），$s\le5$ 且样本量相近时较稳妥；Bartlett 在正态性成立时功效高。
**适用**：两样本 $t$ 检验与方差分析前检验「多个正态总体方差相等」这一前提；样本量相等时用 $F_{\max}=s_{\max}^2/s_{\min}^2$ 查 Hartley 表，样本量不等或较大时用 Bartlett / 修正 Bartlett。
**易混**：$F_{\max}$ 要求各样本量**相等**且只能查表（分布依赖组数 $k$ 与自由度 $m$）；Bartlett 用 $\chi^2(k-1)$ 近似且对非正态极敏感；方差齐性检验（多组）不等于两方差比的 $F$ 检验。
（茆诗松 8.3 方差齐性检验，PDF p412 / 印刷 p390）`),
    // ---- pb17 直线上的随机游动与反射原理 ----
    F('pb17', 'prob_basic', '直线上的随机游动与反射原理',
      R`对称随机游动的位置分布、反射原理、最大值分布与首次到达分布怎么写？`,
      R`设 $S_n=\sum_{k=1}^{n}X_k$，$X_k$ 独立且 $P(X_k=\pm1)=\frac12$（$S_0=0$，直线上的对称随机游动）。
**位置分布**：$P(S_n=m)=\dbinom{n}{(n+m)/2}\Big(\dfrac12\Big)^{n}$（$|m|\le n$，$n+m$ 为偶数；奇数则概率为 0）。
**反射原理**：若 $b<a$，则「$n$ 步后到达 $b$、且途中曾达到 $a$」的路径数等于「$n$ 步后到达 $2a-b$」的路径数；等价地
$$P\big(M_n\ge a,\ S_n=b\big)=P(S_n=2a-b)\quad(b<a),$$
而 $b\ge a$ 时 $\{S_n=b\}\subset\{M_n\ge a\}$（终点已经在 $a$ 之上，途中必经过），此时该概率就是 $P(S_n=b)$。
**最大值分布**：对 $a>0$，$P(M_n\ge a)=P(S_n\ge a)+P(S_n>a)$（对称情形；由上式对 $b$ 求和得到）。
**首次到达（首达）分布**：$\tau_a=\min\{n:S_n=a\}$，则
$$P(\tau_a=n)=\frac{a}{n}\,P(S_n=a)=\frac{a}{n}\dbinom{n}{(n+a)/2}\Big(\frac12\Big)^{n}\quad(n\ge a,\ n+a\ \text{偶}),$$
且 $P(\tau_a<\infty)=1$（一维对称游动必到达任意水平，$\tau_a$ 的期望却为 $\infty$）。
**用法**：把「先到某点/净胜 $a$ 场/首次超越阈值」的古典概型画成折线，用反射原理把「曾到达」换成「终点落点」再数路径数；对 $n\le8,\ a\le4$ 我已用穷举复核这些式子的计数一致。
**适用**：等概率或带漂移的随机游动中求首达、最大值超界、返回原点与赌徒破产概率；也可用于排队与极值型计数。
**易混**：反射原理是**路径计数**对应（终点 $b$、曾达 $a$ 的路径 ↔ 终点 $2a-b$ 的路径），此式只在 $b<a$ 成立（独立重推：$b<a$ 全对，$b\ge a$ 会错）；另外 $P(M_n\ge a)=P(S_n\ge a)+P(S_n>a)$（$a>0$）、$P(\tau_a=n)=\frac{a}{n}P(S_n=a)$ 两式别混用。
（专题二 常见离散问题，PDF p1–5）`),
    // ---- pb18 示性函数法与概率恒等式 ----
    F('pb18', 'prob_basic', '示性函数法与概率恒等式',
      R`示性函数法怎么用？有哪些常用恒等式与「随机个数」的期望方差公式？`,
      R`对事件 $A$ 定义**示性函数** $I_A(\omega)=\begin{cases}1,&\omega\in A\\0,&\omega\notin A\end{cases}$，则 $P(A)=E(I_A)$，且 $I_A^{2}=I_A$。
**运算恒等式**：$I_{\bar A}=1-I_A$；$I_{A\cap B}=I_AI_B$；$I_{A\cup B}=I_A+I_B-I_AI_B$；两两不交时 $I_{\bigcup_n A_n}=\sum_n I_{A_n}$；独立时 $E(I_AI_B)=E I_A\cdot E I_B=P(A)P(B)$。
**证明概率恒等式的套路**：把「至少一个发生 / 恰好 $k$ 个发生 / 恰好一个发生」用示性函数的**和或积**表示，再取期望——因为期望是线性的，$E(\sum)=\sum E$，概率问题立刻变成计数与乘积问题，避免容斥的复杂度（如「恰好一个发生」$=\sum_i I_{A_i}\prod_{j\ne i}(1-I_{A_j})$，取期望展开即得）。
**「随机个数」的期望与方差**：令 $N=\sum_{i=1}^{n}I_{A_i}$（发生的事件个数），则
$$E(N)=\sum_{i}P(A_i),\qquad D(N)=\sum_{i}P(A_i)\big(1-P(A_i)\big)+2\sum_{i<j}\big[P(A_iA_j)-P(A_i)P(A_j)\big].$$
**典型场景**：配对问题（信封/座位）、生日问题、「至少出现一次」的概率、随机变量的线性组合方差——示性函数把「依赖结构的联合概率」压缩为成对项，是 432/431 证明题的通用手段。
**适用**：证集合恒等式与概率恒等式（求和的分解式）、把容斥/并交运算转成 $0/1$ 代数；处理「至少一个发生」与计数型期望时最省力。
**易混**：$I_{A\cup B}=I_A+I_B-I_AI_B$（并集必须减交叉项），而 $I_{A\cap B}=I_AI_B$；$I_{\bar A}=1-I_A$；对可列并/交取极限时注意 $\sum$ 与 $\lim$ 的交换条件。
（专题四 概率恒等式及不等式 §1，PDF p2）`),
    // ---- est27 指数族（标准形式与归属） ----
    F('est27', 'estimation', '指数族（标准形式与归属）',
      R`指数族的标准形式是什么？常见分布如何归入指数族？指数族有什么好处？`,
      R`**标准形式**（单参）：$f(x;\theta)=h(x)\,c(\theta)\,\exp\{\pi(\theta)\,t(x)\}$；多参：$f(x;\theta)=h(x)\,c(\theta)\exp\big\{\sum_{i=1}^{k}\pi_i(\theta)\,t_i(x)\big\}$，其中 $t(x)$（及 $T=\sum_j t(x_j)$）是充分统计量，$\pi_i(\theta)$ 称为自然参数。
**常见归属**：① $B(1,p)$：$p^{x}(1-p)^{1-x}=(1-p)\exp\{x\ln\frac{p}{1-p}\}$；② $P(\lambda)$：$e^{-\lambda}\frac{1}{x!}\exp\{x\ln\lambda\}$（$h(x)=\frac1{x!}$）；③ 正态 $N(\mu,\sigma^{2})$（$\sigma^{2}$ 已知）：$=\frac{1}{\sqrt{2\pi}\sigma}\exp(-\frac{\mu^{2}}{2\sigma^{2}})\exp\{-\frac{x^{2}}{2\sigma^{2}}+\frac{\mu x}{\sigma^{2}}\}$（二维族，$T=(\sum X_i^{2},\sum X_i)$）；④ $\Gamma(\alpha,\beta)$、$E(\lambda)$、多项分布同理（$\theta$ 为尺度参时用 $\theta$ 的反数作自然参数）。
**好处**：① 由因子分解定理，$\sum_j t(x_j)$ **总是充分统计量**；② 指数族给出**完全**充分统计量，配合 Rao-Blackwell/Lehmann-Scheffé 可求 UMVUE；③ 对数似然对自然参数呈线性（凹），MLE 有良好的相合与渐近正态性；④ 方差函数与均值一一对应（$E t(X)=\mu(\theta)$、$D t(X)=V(\theta)$），便于构造广义线性模型。
**反例**：均匀分布 $U(0,\theta)$ 不是指数族（支撑含 $\theta$），故不存在「充分统计量的光滑性」与 C-R 下界的保障。
**适用**：把分布写成 $f(x;\theta)=h(x)c(\theta)\exp\{\sum_i\pi_i(\theta)t_i(x)\}$ 以读出充分统计量 $T=(t_1,\dots)$、讨论完全性并构造 UMVUE；也可用来判断分布族是否具备正则性。
**易混**：自然参数 $\eta_i=\pi_i(\theta)$ 与原始参数 $\theta$ 不是一套（求信息要用雅可比换算）；$c(\theta)$ 的归一化常数最易漏；支撑依赖参数的族（如 $U(0,\theta)$）**不属于**指数族。
（专题八 常用分布族 §1，PDF p1）`),
    // ---- est28 位置族、尺度族与枢轴量 ----
    F('est28', 'estimation', '位置族、尺度族与枢轴量',
      R`位置族、尺度族、位置-尺度族如何定义？为什么它们的统计量能构造枢轴量？`,
      R`设 $Z$ 为标准变量（分布已知），$X$ 与 $Z$ 差一个参数变换。
**① 位置族**：$X=\mu+Z$（密度 $f(x-\mu)$，$\mu$ 为位置参数）——$Z=X-\mu$ 是**枢轴量**；多项式有 $T(X+c)=T(X)+c$ 型同变性。
**② 尺度族**：$X=\theta Z$（密度 $\frac{1}{\theta}f(x/\theta)$，$\theta>0$ 为尺度参数）——$Z=X/\theta$ 是枢轴量；同变性 $T(cX)=c\,T(X)$（如 $\bar X$、$X_{(n)}$）。
**③ 位置-尺度族**：$X=\mu+\sigma Z$（$\mu\in\mathbb{R},\sigma>0$）——$Z=\frac{X-\mu}{\sigma}$ 是枢轴量；一般地，任何刻度同变的统计量标准化后分布与参数无关，例如 $\frac{X_{(i)}-\mu}{\sigma}$、$\frac{X_{(n)}-X_{(1)}}{\sigma}$、$\frac{\bar X-\mu}{S}$。
**用途**：由「分布不依赖参数」直接得到枢轴量 → 置信区间/检验（正态的 $t$ 统计量即位置-尺度枢轴量；指数分布的 $X_{(n)}/X_{(1)}$ 与 $\frac{2\sum(X_i-X_{(1)})}{\theta}\sim\chi^{2}_{2n-2}$ 是尺度族枢轴量的经典例子，专题五已单独裁定）。
**判别口诀**：看分布函数能否写成 $G\big(\frac{x-\mu}{\sigma}\big)$（位置-尺度共用）、$G(x/\theta)$（纯尺度）、$G(x-\mu)$（纯位置）。
**适用**：用位置/尺度变换 $X=\mu+\sigma Z$ 识别族并构造枢轴量（$Z=(X-\mu)/\sigma$ 的分布与参数无关），从而做区间估计、检验与参数不变性论证。
**易混**：位置族平移不变、尺度族缩放不变、位置-尺度族两者兼有；枢轴量要求其分布**完全不依赖参数**——$X-\mu$ 依赖 $\sigma$、$X/\sigma$ 依赖 $\mu$，都只是半枢轴量。
（专题八 常用分布族 §2，PDF p3）`),
    // ---- est29 辅助统计量与 Basu 定理 ----
    F('est29', 'estimation', '辅助统计量与 Basu 定理',
      R`什么是辅助统计量？Basu 定理的条件与结论是什么？如何用它证独立性？`,
      R`**辅助统计量**：$A=A(X)$ 的分布**不依赖于** $\theta$（对一切 $\theta$ 相同），即它不含 $\theta$ 的信息，与充分统计量恰好互补（充分＝信息全在它里面，辅助＝一点信息都没有）。
**Basu 定理**：若 $T$ 是 $\theta$ 的**完全充分统计量**，$A$ 是**辅助统计量**，则 $T$ 与 $A$ **相互独立**（要求联合分布满足一般的正则/可测性条件）。
**使用套路**：① 用因子分解/指数族确认 $T$ 充分且**完全**（指数族自动完全，这是最常用的入口）；② 证明 $A$ 的分布与 $\theta$ 无关（常用位置-尺度变换、或 $A$ 关于参数的函数形式相消）；③ 由 Basu 立得独立——**不必**计算联合密度或条件分布。
**经典例子**：① 正态 $N(\mu,\sigma^{2})$：$\bar X$ 是 $\mu$（或 $(\mu,\sigma^{2})$）的完全充分统计量，$S^{2}/\sigma^{2}$、极差/最大最小之差的缩放是辅助统计量 ⇒ $\bar X$ 与 $S^{2}$ 独立（这正是 $t$ 检验分布的基础）；② 均匀 $U(0,\theta)$：$X_{(n)}$ 完全充分，$A=\frac{X_{(1)}}{X_{(n)}}$ 辅助 ⇒ $X_{(n)}$ 与 $X_{(1)}/X_{(n)}$ 独立；③ 指数尺度族：$\sum X_i$（完全充分）与 $\frac{X_{(1)}}{\sum X_i}$ 独立。
**边界**：非完全充分时不成立（如 $U(\theta,\theta+1)$ 的位置族中 $(X_{(1)},X_{(n)})$ 充分但不完全，需要用别的办法）。
**适用**：证统计量之间的独立性（$\bar X$ 与 $s^2$、$X_{(1)}$ 与 $X_{(n)}-X_{(1)}$ 等），或说明某统计量不含参数信息；Basu：完全充分统计量 + 辅助统计量 ⇒ 独立。
**易混**：辅助统计量「分布不含参数」并不自动推出与充分统计量独立——Basu 需要**完全性**这一额外条件；此外「辅助」不等于「无用」，它可能正是构造检验统计量的零件。
（专题九 数据缩减原理 §3，PDF p5）`),
    // ---- jj13 计量数据类型：截面/时序/面板 ----
    F('jj13', 'regress', '计量数据类型：截面/时序/面板',
      R`计量经济学三类数据（截面、时间序列、面板）各是什么？如何相互换算？`,
      R`**① 截面数据（cross-section）**：$x_i,\ i=1,\dots,n$——同一**时点**、不同个体；如 2009 年我国各省份 GDP、2024 各院校第一名学员的身高。样本一般假定独立。
**② 时间序列数据（time series）**：$x_t,\ t=1,\dots,T$——同一**个体**、不同时点；如北京市 2000–2022 年 GDP、2020–2024 清华第一名学员的身高。样本通常**自相关**。
**③ 面板数据（panel）**：$x_{it},\ i=1,\dots,n,\ t=1,\dots,T$——个体与时间的二维结构；如我国各省份 2000–2022 年 GDP。$n$ 为个体维、$T$ 为时间维（长面板/短面板）。
**换算关系**：在面板数据中**给定 $t_0$ 切一刀**（固定时间）得到**截面数据**；**给定 $i_0$ 按时间排序**得到**时间序列数据**。
**对建模/推断的影响**：截面样本量＝$n$（独立同分布假设常用）；时序样本量＝$T$ 但需处理自相关与趋势（GM4 同方差无自相关假设常被违反）；面板可用个体固定效应（FE）或随机效应（RE）吸收不可观测异质性，样本量＝$n\times T$。
**适用**：识别数据结构以选方法：面板用固定/随机效应，时序要处理自相关与单位根，截面关注异方差与样本独立性；写模型前先标清下标含义与维度。
**易混**：面板「切一刀」（固定 $t_0$）得截面、「按时间排序」（固定 $i$）得时间序列，两个方向不可互换；面板的下标是 $(i,t)$ 双维度，别与分块样本或重复测量混同。
（计量经济学讲义 1.3，PDF p6）`),
    // ---- jj14 无截距项的回归 ----
    F('jj14', 'regress', '无截距项的回归',
      R`模型 $Y_i=\beta X_i+\varepsilon_i$ 的 OLS 解与残差平方和分布是什么？什么时候才该去掉截距？`,
      R`**模型**：$Y_i=\beta X_i+\varepsilon_i,\ i=1,\dots,n$（过原点，无截距项）。
**OLS 解**：最小化 $\sum_i (Y_i-\beta X_i)^{2}$，正规方程 $\sum_i X_i(Y_i-\hat\beta X_i)=0$，得
$$\hat\beta=\frac{\sum_{i=1}^{n}X_iY_i}{\sum_{i=1}^{n}X_i^{2}},\qquad D(\hat\beta)=\frac{\sigma^{2}}{\sum_i X_i^{2}}$$
（注意分母是**未中心化**的平方和，与含截距时的 $l_{xx}=\sum(X_i-\bar X)^{2}$ 不同）。
**残差平方和分布**：$\dfrac{SSE}{\sigma^{2}}=\dfrac{\sum_i (Y_i-\hat\beta X_i)^{2}}{\sigma^{2}}\sim\chi^{2}(n-1)$——自由度是 $n-1$（含截距时为 $n-2$）；因为无截距时残差不再满足 $\sum e_i=0$，但满足 $\sum X_ie_i=0$ 这一个约束。
**何时可以去掉截距**：只有当理论上确信 $X,Y$ **完全正比例**（$X=0$ 必有 $Y=0$）时才去掉；否则截距处的系统性偏置会被强行塞进斜率（$\hat\beta$ 有偏且不一致，除非 $\bar Y=0$ 或真实截距为 0）。此外去截距后 $R^{2}$ 的定义 $1-SSE/\sum(Y_i-\bar Y)^{2}$ 与含截距情形**不可比**（可能为负），需要慎用拟合优度比较。
**适用**：确信 $Y$ 与 $X$ **完全正比例**（理论上有 $E(Y|X=0)=0$）时才去掉截距；此时 $\hat\beta=\sum X_iY_i/\sum X_i^2$、$SSE/\sigma^2\sim\chi^2(n-1)$。
**易混**：去截距后残差自由度是 $n-1$ 而非 $n-2$；$R^2$ 的定义改变甚至可能为负（不能再解释为「解释掉均值的比例」）；不能因为 $R^2$ 更高就随手删截距。
（计量经济学讲义 2.5 无截距项的回归，PDF p14）`),
    // ---- jj15 邹至庄稳定性检验 ----
    F('jj15', 'regress', '邹至庄稳定性检验',
      R`邹至庄（Chow）稳定性检验的模型设定、假设与 $F$ 统计量怎么写？`,
      R`**背景**：样本可分为两段（如政策变更前/后、两个地区），要检验两段的回归函数是否有**结构变点**。
两段各自模型：$Y=X\beta+\varepsilon_1$（$n_1$ 个观测）与 $Y=X\alpha+\varepsilon_2$（$n_2$ 个观测），$k$ 个解释变量。
**无约束模型（合并样本）**：
$$\begin{pmatrix}Y_1\\Y_2\end{pmatrix}=\begin{pmatrix}X_1&0\\0&X_2\end{pmatrix}\begin{pmatrix}\beta\\\alpha\end{pmatrix}+\begin{pmatrix}\varepsilon_1\\\varepsilon_2\end{pmatrix};$$
**假设**：$H_0:\beta=\alpha$（两组回归函数无差别）↔ 施加约束后得**受约束模型** $\begin{pmatrix}Y_1\\Y_2\end{pmatrix}=\begin{pmatrix}X_1\\X_2\end{pmatrix}\beta+\begin{pmatrix}\mu_1\\\mu_2\end{pmatrix}$。
**统计量**：
$$F=\frac{(SSE_R-SSE_U)/(k+1)}{SSE_U/\,\big[n_1+n_2-2(k+1)\big]}\ \sim\ F\big(k+1,\ n_1+n_2-2(k+1)\big).$$
**自由度口径**：无约束模型参数个数 $2(k+1)$、受约束后 $k+1$，故约束个数（分子自由度）为 $k+1$；分母为无约束残差自由度 $n_1+n_2-2(k+1)$。
**判读与推广**：$F\ge F_{1-\alpha}$ 拒绝 $H_0$，说明存在结构变点（可进一步只看部分系数是否变化——这时 $q$ 减少）；多个候选断点逐个检验（实际应用常先看图/递归残差，再定断点位置，以免断点数据挖掘偏差）。
**适用**：判断两个样本是否来自同一回归关系（政策前后、结构变点）；$F=\frac{(SSE_R-SSE_U)/(k+1)}{SSE_U/[n_1+n_2-2(k+1)]}\sim F(k+1,\,n_1+n_2-2(k+1))$。
**易混**：$SSE_R$ 是施加 $\beta=\alpha$ 约束后**合并样本**的残差平方和（受约束模型），$SSE_U$ 是两组各自回归的残差平方和之和；分子自由度含截距（$k+1$），只算 $k$ 是最常见错误。
（计量经济学讲义 3.9 邹至庄稳定性检验，PDF p26）`),
    // ---- jj16 投影理论与遗漏变量偏误 ----
    F('jj16', 'regress', '投影理论与遗漏变量偏误',
      R`OLS 的投影（几何）解释是什么？遗漏变量偏误的极限式怎么推？符号怎么看？`,
      R`**① 投影解释**：设 $X$ 为 $n\times(k+1)$ 设计矩阵，$P_X=X(X'X)^{-1}X'$ 是向 $\mathrm{span}(X)$ 的**正交投影阵**（$P_X^{2}=P_X$、$P_X'=P_X$），则
$$\hat Y=P_XY,\qquad e=Y-\hat Y=(I-P_X)Y,\qquad X'e=0;$$
即 OLS 是把 $Y$ 垂直投影到 $X$ 张成的子空间，$R^{2}$ 是投影长度平方占 $\|Y-\bar Y\|^{2}$ 的比例；把 $X$ 分成 $X_{1},X_{2}$ 时分块投影给出偏回归（Frisch-Waugh）解释。
**② 二元情形解（克拉默法则）**：$\hat\beta_1=\dfrac{l_{1y}l_{22}-l_{12}l_{2y}}{l_{11}l_{22}-l_{12}^{2}}$，$\hat\beta_2=\dfrac{l_{2y}l_{11}-l_{12}l_{1y}}{l_{11}l_{22}-l_{12}^{2}}$（$l$ 为离差交叉积）。
**③ 遗漏变量偏误**：真实模型含 $X_1,X_2$，而只把 $Y$ 回归到 $X_1$ 上；令 $\hat\alpha$ 为辅助回归 $X_{i2}=\alpha X_{i1}+e_i$ 的系数，则偏差
$$D=\hat\beta_1-\hat\beta_1=\frac{(l_{12}\hat\beta_1-l_{2y})\,\hat\alpha}{l_{22}-l_{12}\hat\alpha}\ \xrightarrow{\ P\ }\ \frac{(\rho_{12}\sigma_1\sigma_2\beta_1-\rho_{2y}\sigma_2\sigma_y)\,\alpha}{\sigma_2^{2}-\rho_{12}\sigma_1\sigma_2\,\alpha}.$$
**读法与方向律**：当 $X_2$ **不能**被 $X_1$ 解释（$\alpha\to0$）时 $D\xrightarrow{P}0$（无偏误，这解释了「加入与 $X_1$ 正交的控制变量不影响斜率估计」）；偏误符号＝（$X_2$ 对 $Y$ 的净效应符号）×（$X_1,X_2$ 的相关符号）——这也是「遗漏变量导致高估或低估」的判断口诀，并可直接推广到多重共线性诊断与内生性（遗漏项含于误差项→与 $X_1$ 相关）的偏差方向分析。
**适用**：理解 OLS 的几何（$X\hat\beta$ 是 $Y$ 在 $X$ 列空间上的投影）并推导遗漏变量偏误的方向：$\mathrm{plim}\,D=\frac{(\rho_{12}\rho_{1y}-\rho_{2y})\rho_{12}\sigma_y}{(1-\rho_{12}^2)\sigma_1}$。
**易混**：投影矩阵 $P=X(X^TX)^{-1}X^T$ 与 $M=I-P$ 都幂等且 $MX=0$；「多放无关变量」只损失效率仍无偏，「漏掉相关变量」才产生偏误——两类错误方向完全不同。
（计量经济学讲义 3.10 投影理论，PDF p27–28）`),
    // ---- est30 共轭先验族 ----
    F('est30', 'estimation', '共轭先验族',
      R`什么是共轭先验？正态-正态、Beta-二项、Gamma-泊松三对共轭的后验怎么写？`,
      R`**定义**：若先验 $\pi(\theta)$ 与后验 $\pi(\theta\mid x)$ 属于同一分布族，则称该先验为该似然的**共轭先验**（后验＝先验核 × 似然核，只需求核的指数与系数）。
**① Beta–二项**：$\theta\sim Be(a,b)$，$X\mid\theta\sim B(n,\theta)$，观测成功 $x$ 次 ⇒ $\theta\mid x\sim Be(a+x,\ b+n-x)$，后验均值 $=\frac{a+x}{a+b+n}$。
**② Gamma–泊松**：$\lambda\sim Ga(\alpha,\beta)$（密度 $\propto\lambda^{\alpha-1}e^{-\beta\lambda}$），$X_1,\dots,X_n\mid\lambda\ \text{i.i.d.}\sim P(\lambda)$ ⇒ $\lambda\mid x\sim Ga\big(\alpha+\sum_i x_i,\ \beta+n\big)$；指数分布（尺度参 $1/\lambda$）的共轭形式相同。
**③ 正态–正态（方差 $\sigma^{2}$ 已知）**：$\mu\sim N(\mu_0,\tau^{2})$，$\bar X\mid\mu\sim N(\mu,\sigma^{2}/n)$ ⇒
$$\mu\mid x\ \sim\ N\Bigg(\frac{\dfrac{\mu_0}{\tau^{2}}+\dfrac{n\bar x}{\sigma^{2}}}{\dfrac{1}{\tau^{2}}+\dfrac{n}{\sigma^{2}}},\ \Big(\frac{1}{\tau^{2}}+\frac{n}{\sigma^{2}}\Big)^{-1}\Bigg)$$
即**精度（方差倒数）相加、均值按精度加权**；$\tau^{2}\to\infty$（无信息先验）时后验均值趋于 $\bar x$。
**④ 其他常见对**：正态–逆 Gamma（方差未知）、Dirichlet–多项分布、Beta–几何。
**要点**：共轭只保证计算方便，不代表先验「正确」；先验越强（$\tau^{2}$ 越小）后验越被拉向先验均值，小样本时影响显著。
**适用**：需要解析的后验更新时选共轭族：正态-正态、Beta-二项、Gamma-泊松、Dirichlet-多项；后验参数 = 先验参数 + 数据的充分统计量。
**易混**：共轭是「先验族对某似然」的性质，不是对一切似然成立（均匀先验未必共轭）；超参数与数据计数相加时别忘归一化常数；Jeffreys 先验是另一套选择准则，不等价于共轭。
（茆诗松 6.5 贝叶斯估计（共轭先验），PDF p316 / 印刷 p294）`),
    // ---- est31 贝叶斯估计与后验区间 ----
    F('est31', 'estimation', '贝叶斯估计与后验区间',
      R`贝叶斯点估计怎么定义？后验均值、后验中位数、最大后验估计有何区别？怎样给后验区间？`,
      R`**框架**：把 $\theta$ 视为随机变量，先验 $\pi(\theta)$ + 样本 $x$ ⇒ 后验 $\pi(\theta\mid x)\propto\pi(\theta)L(\theta;x)$。
**贝叶斯点估计＝使后验期望损失最小**：① 取**平方损失** $(\hat\theta-\theta)^{2}$ ⇒ 后验均值 $\hat\theta=E(\theta\mid x)$（最常用）；② 取**绝对损失** $|\hat\theta-\theta|$ ⇒ 后验**中位数**；③ 取 0-1 损失 ⇒ 后验**众数**（最大后验估计，常与 MLE 形式相近，多一个先验项）。
**与频率派的区别**：$\theta$ 随机、结论用后验分布表述；小样本也可给出概率语句（频率派小样本下无此便利）。
**后验（可信）区间**：由后验分位数 $[\theta_{\alpha/2},\theta_{1-\alpha/2}]$ 给出，含义是「$\theta$ 落入该区间的后验概率为 $1-\alpha$」——**与置信区间的频率解释不同**（后者的「$1-\alpha$」说的是重复抽样下区间覆盖参数的频率）。
**闭式例子**：① Beta–二项：$\theta\mid x\sim Be(a+x,b+n-x)$，用 Beta 分位数；② 正态–正态：$\mu\mid x\sim N(\hat\mu_{\text{post}},\sigma^{2}_{\text{post}})$，区间为 $\hat\mu_{\text{post}}\pm z_{1-\alpha/2}\sigma_{\text{post}}$。
**共轭先验链**：先验→后验的解析形式依赖共轭对，实践中最常用的三对（正态-正态、Beta-二项、Gamma-泊松）见共轭先验卡。
**适用**：用后验均值/中位数/众数作点估计（平方损失→均值、绝对损失→中位数、0–1 损失→众数），用后验分位数给可信区间。
**易混**：可信区间说的是「参数落在区间内的后验概率」，与置信区间的频率解释不同；小样本下先验影响显著；求分位数要用**后验**分布而不是似然。
（茆诗松 6.5 贝叶斯估计，PDF p316 / 印刷 p294）`),
    // ---- xr04 NP 引理与一致最优势检验 ----
    F('xr04', 'testing', 'NP 引理与一致最优势检验',
      R`Neyman-Pearson 引理怎么构造最优势检验？一致最优势检验（UMP）在什么条件下存在？`,
      R`**设定**：简单假设 $H_0:\theta=\theta_0$ 对 $H_1:\theta=\theta_1$，似然比 $\Lambda(x)=\dfrac{f(x;\theta_1)}{f(x;\theta_0)}$。
**NP 引理**：给定水平 $\alpha$，最优势（最大功效）检验的拒绝域形如 $\{x:\Lambda(x)\ge k\}$，其中 $k$ 由 $P_{\theta_0}(\Lambda\ge k)\le\alpha$ 定（离散分布时用**随机化**检验补足水平：在 $\Lambda=k$ 处以概率 $\gamma$ 拒绝）。
即：存在 $\phi^{*}$ 使 $\phi^{*}(x)=1$（$\Lambda>k$）、$=\gamma$（$\Lambda=k$）、$=0$（$\Lambda<k$），且 $E_{\theta_0}\phi^{*}=\alpha$，则 $\phi^{*}$ 是水平 $\alpha$ 的最优势检验。
**UMP（一致最优势）**：对复合假设，若同一检验在 $H_1$ 的**每个** $\theta$ 上功效都不小于任意同水平检验，则称一致最优势检验。
**存在性**：① 单参**指数族**、单侧假设（$H_0:\theta\le\theta_0$ 对 $H_1:\theta>\theta_0$）在**单调似然比（MLR）**性质下存在 UMP，拒绝域形如 $\{T(x)\ge c\}$（$T=\sum t(x_i)$ 充分统计量）；② 双边假设一般**不存在** UMP（因为 $H_1$ 两侧要求相反的拒绝方向），改用**无偏检验（UMPU）**或似然比检验；③ 非指数族/多参问题常无 UMP。
**操作要点**：先写出 $\Lambda$，再化简为熟悉统计量的单调函数（如 $\bar X$、$\sum X_i$、$X_{(n)}$），最后定临界值。
**适用**：简单对简单检验用 NP 引理（似然比阈值型拒绝域给出最大势），单调似然比族中求一致最优势检验（单参数指数族最常见）。
**易混**：NP 引理只保证「简单对简单」的最优势；UMP 要求对一切 $\theta_1\in\Theta_1$ 在同水平下最优（逐点最优的合集），MLR 只是充分条件；别把「一致最优势」与「局部最优」混为一谈。
（茆诗松 7.4 似然比检验与分布拟合检验，PDF p363 / 印刷 p341）`),
    // ---- xr05 似然比检验与拒绝域 ----
    F('xr05', 'testing', '似然比检验与拒绝域',
      R`广义似然比统计量怎么定义？如何得到拒绝域与渐近分布（Wilks 定理）？`,
      R`**广义似然比统计量**：
$$\lambda(x)=\frac{\sup_{\theta\in\Theta_0}L(\theta;x)}{\sup_{\theta\in\Theta}L(\theta;x)}\in[0,1],$$
$H_0$ 的拒绝域为 $\{\lambda(x)\le\lambda_0\}$（比值越小越倾向拒绝 $H_0$；等价取 $LR=\sup_{\Theta_0}L/\sup_{\Theta}L$ 或 $-2\ln\lambda$ 都一样）。
**构造四步**：① 求全空间 MLE $\hat\theta$；② 求 $H_0$ 约束下的 MLE $\hat\theta_0$；③ 代入得 $\lambda$ 并化简为某统计量的单调函数（正态均值检验可化简到 $|\bar X-\mu_0|$，方差检验化简到 $\sum(X_i-\bar X)^{2}$）；④ 用原分布或用**渐近**结果定临界值。
**Wilks 定理**：正则条件下，当 $H_0$ 成立时
$$-2\ln\lambda(x)\ \xrightarrow{\ d\ }\ \chi^{2}(r),$$
$r=$ 约束个数＝全参数空间维数 − $H_0$ 下的自由参数个数（即约束数）；大样本下用 $\chi^{2}_{1-\alpha}(r)$ 定拒绝域。
**与 NP 的关系**：简单对简单时似然比检验即最优势检验；对正态总体，似然比检验导出熟悉的 $t$、$\chi^{2}$、$F$ 检验（所以这些经典检验都可以看成 LR 的特例）；拟合优度检验（$K$-$S$、$\chi^{2}$ 独立性/同质性）也由 LR 思想构造。
**注意**：Wilks 定理给出的临界值需要「$H_0$ 在参数空间内部」（边界上的原假设，如 $\sigma^{2}=0$，分布会变成 $\chi^{2}$ 的混合，不能直接用）。
**适用**：复合假设的一般构造：$\Lambda=\sup_{\Theta_0}L/\sup_{\Theta}L$，$\Lambda\le c$ 拒绝；大样本下 $-2\ln\Lambda\overset{d}{\to}\chi^2$（Wilks）用于定临界值。
**易混**：Wilks 的 $\chi^2$ 自由度是**参数空间维数之差**（约束个数），不是样本量；$\Lambda$ 取的是上确界而非某个固定点的似然；它与分布拟合的 $\chi^2$ 统计量不是同一个量。
（茆诗松 7.4 似然比检验，PDF p363 / 印刷 p341）`),
    // ---- reg16 多重比较：T 法（Tukey） ----
    F('reg16', 'regress', '多重比较：T 法（Tukey）',
      R`多重比较的 T 法（Tukey）同时置信区间怎么写？为什么不能拿 $t$ 检验两两硬比？`,
      R`**设定**（平衡情形）：$s$ 个水平、每水平 $r$ 次重复，误差均方 $MS_e$，水平均值 $\bar y_{i\cdot}$。
**T 法同时置信区间**：
$$\mu_i-\mu_j\ \in\ \Big[\bar y_{i\cdot}-\bar y_{j\cdot}\ \pm\ q_{1-\alpha}(s,\ f)\sqrt{\frac{MS_e}{r}}\Big],\qquad f=s(r-1),$$
$q_{1-\alpha}(s,f)$ 是**学生化极差**（studentized range）分布的上侧分位数，由 $\max_i|\bar y_{i\cdot}-\mu_i|$ 的极差分布定出；整套 $\binom{s}{2}$ 个区间作为一个整体的置信水平为 $1-\alpha$。
**为什么不能多次 $t$ 检验**：$\binom{s}{2}$ 次独立 $t$ 检验的第一类错误会膨胀到 $\approx1-(1-\alpha)^{\binom{s}{2}}$（$s=5$ 时 10 次比较，$\alpha=0.05$ 的名义水平下实际错判率约 40%）。T 法用**同一条宽度**（把 $\sqrt{2}\,t$ 换成 $q/\sqrt2$ 的等价形式）保证整体水平。
**不平衡数据**：用 Tukey–Kramer 形式，宽度改为 $\frac{q_{1-\alpha}(s,f)}{\sqrt2}\sqrt{MS_e\big(\frac{1}{r_i}+\frac{1}{r_j}\big)}$。
**例**（专题十三已裁定的数值）：$\mu_2-\mu_1\in[-27.18,-0.82]$、$\mu_3-\mu_2\in[33.82,60.18]$（0.9 水平同时置信区间，由 $1041-1055\pm\sqrt{206.2}\sqrt{\frac1{10}+\frac1{10}}\;t_{0.975}(27)$ 算出）。
**选择口径**：只关心**所有两两**比较 → T 法；关心任意线性组合或事后数据探索 → S 法（Scheffé），后者更保守。
**适用**：各水平**重复数相等**时对所有两两差 $\mu_i-\mu_j$ 给同时置信区间：$|\bar y_i-\bar y_j|\ge q_{1-\alpha}(s,f)\sqrt{MSe/r}$ 即拒绝。
**易混**：Tukey 的 $q$ 是学生化极差（studentized range）分位数，不是 $t$ 分位数；重复数不等须换 Tukey–Kramer；同时置信区间保证**整体**水平 $1-\alpha$，与逐对做 $t$ 检验不可混用。
（茆诗松 8.2 多重比较，PDF p407 / 印刷 p385）`),
    // ---- reg17 多重比较：S 法（Scheffé） ----
    F('reg17', 'regress', '多重比较：S 法（Scheffé）',
      R`S 法（Scheffé）的同时置信区间怎么写？什么时候该用 S 法而不是 T 法？`,
      R`**设定**：$s$ 个水平，第 $i$ 水平重复 $r_i$ 次，$\hat c=\sum_i c_i\bar y_{i\cdot}$ 是任意**对比** $c=\sum_i c_i\mu_i$（要求 $\sum_i c_i=0$）的估计，误差均方 $MS_e$、残差自由度 $f=\sum_i(r_i-1)$。
**S 法同时置信区间**：
$$c\ \in\ \Big[\hat c\ \pm\ \sqrt{(s-1)\,F_{1-\alpha}(s-1,\ f)\cdot MS_e\sum_{i=1}^{s}\frac{c_i^{2}}{r_i}}\ \Big],$$
（平衡时 $r_i\equiv r$，$\sum_i c_i^{2}/r_i=\frac{1}{r}\sum_i c_i^{2}$。）整套「所有可能的对比」同时置信水平为 $1-\alpha$。
**与 $F$ 检验的关系**：区间不含 0 $\iff$ 该对比的 $F=\frac{MS_{\text{对比}}}{MS_e}\ge (s-1)F_{1-\alpha}(s-1,f)$，即 S 法与方差分析的 $F$ 检验**完全一致**（这是它「一次控制全部对比」的来源，也解释了为何它比 T 法宽）。
**适用判断**：① 水平数 $s$ 大、只关心**少数几个**对比（含事后数据探索式比较）→ S 法安全；② 只关心**所有两两**比较 → T 法（Tukey）区间更窄、功效更高；③ 只关心预先指定的 $m$ 个对比 → Bonferroni（$\alpha/m$）通常更紧；④ $s=2$ 时 S 法、T 法、$t$ 检验在数值上一致。
**报数规范**：同时置信区间必须写明「同时水平」而非「单个区间水平」，否则会被误读为 T 法/Tukey 的结果。
**适用**：对**任意线性对比** $c^T\mu$（含事后从数据里挑出来的对比）给同时置信区间，非两两比较时首选 S 法。
**易混**：Scheffé 在两两比较上偏保守（区间比 T 法宽）；用的是 $F$ 分位数、自由度 $(s-1,f)$；对比系数必须满足 $\sum_i c_i=0$，否则不是「对比」。
（茆诗松 8.2 多重比较，PDF p407 / 印刷 p385）`),
    // ---- ll11 Slutsky 定理与收敛的四则运算 ----
    F('ll11', 'limit', 'Slutsky 定理与收敛的四则运算',
      R`Slutsky 定理的内容是什么？依分布收敛下的加减乘除怎么算？如何用它处理随机分母？`,
      R`**Slutsky 定理**：设 $X_n\xrightarrow{d}X$，而 $Y_n\xrightarrow{P}c$（**常数**），则
$$X_n+Y_n\xrightarrow{d}X+c,\qquad X_nY_n\xrightarrow{d}cX,\qquad \frac{X_n}{Y_n}\xrightarrow{d}\frac{X}{c}\ (c\ne0).$$
（$c=0$ 时乘积极限为退化在 0 的分布；除法须 $c\ne0$ 且分母远离 0。）
**为什么重要**：它允许把「随机分母/随机尺度」换成常数，是 $t$ 统计量、Wald 统计量、$\chi^{2}$ 型统计量渐近分布的理论支撑。
**标准用法（把统计量写成「主项 + 小项」）**：如正态样本中
$$\frac{\sqrt n(\bar X-\mu)}{S_n}=\frac{\sqrt n(\bar X-\mu)}{\sigma}\cdot\frac{\sigma}{S_n},\qquad \frac{\sigma}{S_n}\xrightarrow{P}1,$$
由 CLT（前者 $\xrightarrow{d}N(0,1)$）与 Slutsky 立得 $\frac{\sqrt n(\bar X-\mu)}{S_n}\xrightarrow{d}N(0,1)$——即 $t$ 统计量在大样本下近似正态（学生 $t$ 分布随自由度趋于 $N(0,1)$ 是其特例）。
**边界**：Slutsky 要求「一个依分布收敛 + 一个依概率收敛到**常数**」；若两者都只依分布收敛，需要 Cramér 定理/连续映射定理，不能直接套 Slutsky（例如 $Y_n$ 依分布收敛到非退化随机变量时，$X_n/Y_n$ 不能用上式直接得）。
**适用**：把依概率收敛的估计量「代入」依分布收敛的统计量：$X_n\overset{d}{\to}X$、$Y_n\overset{P}{\to}c$ 时 $X_n+Y_n\overset{d}{\to}X+c$、$X_nY_n\overset{d}{\to}cX$、$X_n/Y_n\overset{d}{\to}X/c$（$c\ne0$）。
**易混**：Slutsky 要求 $Y_n$ 收敛到**常数**（依概率），两个都只有依分布收敛时不能相加；它处理的是四则运算，函数型变换归连续映射定理。
（专题七 概率极限理论 §1，PDF p3）`),
    // ---- ll12 Δ 方法（渐近方差传播） ----
    F('ll12', 'limit', 'Δ 方法（渐近方差传播）',
      R`Δ（delta）方法在一阶、二阶各给出什么结论？怎样用它求渐近方差与方差稳定变换？`,
      R`**设定**：$\sqrt n\,(X_n-\theta)\xrightarrow{d}N(0,\sigma^{2})$，函数 $g$ 在 $\theta$ 处可导。
**一阶 Δ 方法（$g'(\theta)\ne0$）**：
$$\sqrt n\,\big(g(X_n)-g(\theta)\big)\ \xrightarrow{d}\ N\big(0,\ [g'(\theta)]^{2}\sigma^{2}\big)\quad\Longleftrightarrow\quad g(X_n)\ \text{近似}\ N\Big(g(\theta),\ \frac{[g'(\theta)]^{2}\sigma^{2}}{n}\Big).$$
**渐近方差＝（导数平方）× 原渐近方差**，即 $\mathrm{Var}(g(X_n))\approx[g'(\theta)]^{2}\mathrm{Var}(X_n)$（与误差传播公式同形，但此处是概率意义下的严格结论）。
**二阶 Δ 方法（$g'(\theta)=0$，一阶退化）**：需展开到二阶，
$$n\,\big(g(X_n)-g(\theta)\big)\ \xrightarrow{d}\ \frac{g''(\theta)\,\sigma^{2}}{2}\,\chi^{2}_{1},$$
极限不再是正态（这不影响区间构造——此种情形说明 $g(X_n)$ 收敛更快，用二阶量做推断）。
**常见用途**：① 求变换后统计量的标准误（如 $\hat\sigma^{2}$、$\ln\hat\theta$、$1/\hat\theta$，注意 $\ln$ 的导数是 $1/\theta$，故 $D(\ln\hat\theta)\approx\frac{D(\hat\theta)}{\theta^{2}}$）；② 求 MLE 函数的渐近方差（$\hat\theta$ 渐近正态 + $g(\hat\theta)$ 用 Δ 方法），或反过来做**方差稳定变换**：选 $g$ 使 $[g'(\theta)]^{2}\sigma^{2}(\theta)$ 与 $\theta$ 无关（如泊松方差不稳定：$\mathrm{Var}(X)=\mu$，取 $g(x)=\sqrt x$ 后有 $D(\sqrt{\bar X})\approx\frac{1}{4n}$）；③ 构造 Wald 型检验/区间。
**适用**：已知 $\sqrt n(\hat\theta-\theta)\overset{d}{\to}N(0,\sigma^2)$ 时求 $g(\hat\theta)$ 的渐近分布：$\sqrt n(g(\hat\theta)-g(\theta))\overset{d}{\to}N(0,[g^{\prime}(\theta)]^2\sigma^2)$；用于对数/平方根等方差稳定变换。
**易混**：若 $g^{\prime}(\theta)=0$，一阶 Δ 方法退化（需二阶展开，极限变成 $\chi^2$ 型），不能照套公式；Δ 方法常与 Slutsky 配合使用而非相互替代；样本方差与渐近方差不是同一个量。
（专题七 概率极限理论 §1，PDF p3）`),
    // ---- ll13 几乎必然收敛与强大数定律 ----
    F('ll13', 'limit', '几乎必然收敛与强大数定律',
      R`几乎必然收敛怎么定义与判定？它与依概率收敛、弱/强大数定律的关系是什么？`,
      R`**几乎必然收敛（$a.s.$）**：$X_n\xrightarrow{a.s.}X\iff P\big(\lim_{n\to\infty}X_n=X\big)=1\iff$ 对任意 $\varepsilon>0$，
$$P\Big(\bigcap_{n}\bigcup_{k\ge n}\big\{|X_k-X|\ge\varepsilon\big\}\Big)=0\iff P\big(|X_n-X|\ge\varepsilon\ \mathrm{i.o.}\big)=0,$$
即 $|X_n-X|\ge\varepsilon$ 只发生**有限次**。
**判定（Borel-Cantelli）**：若对每个 $\varepsilon>0$ 有 $\sum_{n}P(|X_n-X|\ge\varepsilon)<\infty$，则 $X_n\xrightarrow{a.s.}X$（用得最多的充分条件；独立情形下该级数发散则几乎必然不收敛）。
**与其它收敛的关系**：$a.s.\Rightarrow\xrightarrow{P}$（依概率），反之不成立；$L^{p}$ 收敛与 $a.s.$ 收敛互不包含（需对尾部有额外控制）；若 $\sum_n E|X_n-X|^{p}<\infty$ 可由 Borel-Cantelli + 马尔可夫不等式推出 $a.s.$ 收敛。
**弱大数定律（LLN）**：$\frac1n\sum X_i\xrightarrow{P}\mu$（辛钦：只需 i.i.d. 与 $E|X_1|<\infty$；切比雪夫形式：两两不相关 + 方差一致有界）。
**强大数定律（Kolmogorov）**：i.i.d. 且 $E|X_1|<\infty$ $\Rightarrow \frac1n\sum X_i\xrightarrow{a.s.}E X_1$（条件恰好是「期望有限」，i.i.d. 而无期望时（Cauchy）不能 $a.s.$ 收敛——这是强、弱 LLN 条件差异的经典例证）。
**做题口径**：要求「依概率」用切比雪夫/特征函数；要求「概率为 1」用 Borel-Cantelli 或三级数定理。
**适用**：讨论「轨道级」收敛（几乎必然）与强大数定律 $P(\lim_{n}\bar X_n=\mu)=1$；a.s. 收敛可直接推出依概率收敛。
**易混**：a.s. 收敛要求同一条轨道几乎处处收敛，严格强于依概率收敛（反之不成立）；辛钦/柯尔莫哥洛夫型强大数定律只需 i.i.d. 与有限均值，结论比弱大数定律强。
（专题七 概率极限理论 §2，PDF p4）`),
    // ---- est32 MLE 的渐近性质 ----
    F('est32', 'estimation', 'MLE 的渐近性质',
      R`极大似然估计的相合性、渐近正态性与渐近有效性分别是什么？核心公式怎么写？`,
      R`**正则条件**：参数空间开、密度对 $\theta$ 三次可导、支撑与 $\theta$ 无关、Fisher 信息 $0<I(\theta)<\infty$ 连续。
**① 相合性**：$\hat\theta_n\xrightarrow{P}\theta$（由大数定律 + 信息不等式/EM 单调性可证）。
**② 渐近正态（核心式）**：
$$\sqrt n\,\big(\hat\theta_n-\theta\big)\ \xrightarrow{d}\ N\Big(0,\ I^{-1}(\theta)\Big)\quad\Longleftrightarrow\quad \hat\theta_n\ \text{近似}\ N\Big(\theta,\ \frac{1}{nI(\theta)}\Big),$$
其中 **Fisher 信息**（单样本）
$$I(\theta)=E\Big[\Big(\frac{\partial}{\partial\theta}\ln f(X;\theta)\Big)^{2}\Big]=-E\Big[\frac{\partial^{2}}{\partial\theta^{2}}\ln f(X;\theta)\Big]$$
（第二式在正则条件下等价，实际计算常用二阶导形式；$n$ 个独立样本的信息量为 $nI(\theta)$）。
**③ 渐近有效性**：其渐近方差恰为 C-R 下界 $\frac{1}{nI(\theta)}$，即在所有正则的渐近无偏估计中达到最小渐近方差（与「有效估计」的区别是后者要求对每个 $n$ 达到下界）。
**④ 不变性**：若 $\hat\theta$ 是 $\theta$ 的 MLE，则 $g(\hat\theta)$ 是 $g(\theta)$ 的 MLE（多参数亦然），其渐近方差用 Δ 方法 $[g'(\theta)]^{2}/(nI(\theta))$。
**⑤ 用法**：大样本推断直接用 Wald 区间/检验 $\hat\theta\pm z_{1-\alpha/2}\frac{1}{\sqrt{n\,I(\hat\theta)}}$；比较两个估计量的渐近效率时比 $I$ 或渐近方差即可。
**反例提醒**：均匀 $U(0,\theta)$ 的 MLE $\hat\theta=X_{(n)}$ 不满足渐近正态（支撑依赖 $\theta$），需用 $n(\theta-X_{(n)})\xrightarrow{d}E(\theta)$ 型结论——正则条件不可省。
**适用**：大样本下用 $\hat\theta\overset{P}{\to}\theta$ 与 $\sqrt n(\hat\theta-\theta)\overset{d}{\to}N(0,I^{-1}(\theta))$ 构造近似置信区间与检验；MLE 达到 C-R 下界即渐近有效。
**易混**：「渐近有效」不等于小样本最优（小样本偏差为 $O(1/n)$）；单样本信息 $I(\theta)$ 与样本信息 $nI(\theta)$ 易混；支撑依赖参数或不可交换求导与积分时渐近正态可不成立。
（专题十一 极大似然估计；另见茆诗松 6.3，PDF p299）`),
    // ---- jj17 约束回归与线性约束 F 检验 ----
    F('jj17', 'regress', '约束回归与线性约束 F 检验',
      R`线性约束回归怎么检验？$SSE_U-SSE_R$ 的自由度怎么算？与邹至庄检验什么关系？`,
      R`**一般线性约束**：$H_0:R\beta=r$，其中 $R$ 为 $q\times(k+1)$ 矩阵、$\mathrm{rank}(R)=q$（$k$ 为解释变量个数，含截距共 $k+1$ 个参数），$q$ 为约束个数。
**受约束估计**：在约束下最小化 $SSE$（用 Lagrange 乘子法或代入消元）得 $\hat\beta_R$ 与 $SSE_R(\hat\beta_R)$；无约束 OLS 给 $SSE_U$。
**检验统计量**：
$$F=\frac{(SSE_R-SSE_U)/q}{SSE_U/(n-k-1)}\ \sim\ F(q,\ n-k-1),$$
（要求无约束模型为正态误差；$H_0$ 成立时 $SSE_R-SSE_U$ 与 $SSE_U$ 独立，比值服从 $F$。）
**自由度口径（易错点）**：分子自由度＝**约束个数** $q=k_U-k_R$，其中 $k_U$ 为无约束自由参数个数、$k_R$ 为受约束后自由参数个数；$\mathrm{rank}(R)$ 就是 $q$（作业题例：$R$ 是 $3\times3$ 矩阵且 $\mathrm{rank}(A)=2$ ⇒ 只有 1 个自由参数，故 $SSE_U-SSE_R\sim\sigma^{2}\chi^{2}(k-k_R)$）；分母自由度＝无约束模型残差自由度 $n-(k+1)$。
**特例**：① $q=1$（单个系数等于给定值）时 $F=t^{2}$，与 $t$ 检验完全一致；② $H_0:\beta_1=\dots=0$（全部斜率）时就是回归方程的**整体显著性 $F$ 检验**，此时 $SSE_R=SST$、$F=\frac{R^{2}/k}{(1-R^{2})/(n-k-1)}$；③ **邹至庄稳定性检验**是「两段样本系数相等」的约束检验实例（$q=k+1$）。
**适用**：检验线性约束 $H_0:R\beta=r$（$R$ 为 $q\times(k+1)$、$\mathrm{rank}(R)=q$）：$F=\frac{(SSE_R-SSE_U)/q}{SSE_U/(n-k-1)}\sim F(q,n-k-1)$。
**易混**：分子自由度是**约束个数** $q$，不是参数个数 $k+1$；恒有 $SSE_R\ge SSE_U$，故统计量非负；受约束估计用受约束 OLS（拉格朗日乘子或代入消元），不是简单删掉某个解释变量。
（计量经济学讲义 3.8 约束回归，PDF p25；自由度口径见 3.12 作业题 2）`),
  ];

  const META = {
    pb01: [4, '概率基本概念'],
    pb02: [4, '古典概型计算'],
    pb03: [5, '概率计算'],
    pb04: [5, '条件概率计算'],
    pb05: [5, '概率计算（乘法公式）'],
    pb06: [5, '全概率公式应用'],
    pb07: [5, '贝叶斯公式应用'],
    pb08: [4, '事件独立性判定'],
    pb09: [4, '对立事件概率'],
    pb10: [4, '互斥事件概率'],
    pb11: [3, '概率公理'],
    rv01: [5, '分布函数'],
    rv02: [4, '分布函数性质'],
    rv03: [5, '离散型分布律'],
    rv04: [5, '连续型密度'],
    rv05: [4, '0-1 分布'],
    rv06: [5, '二项分布概率计算'],
    rv07: [5, '泊松分布概率计算'],
    rv08: [3, '几何分布'],
    rv09: [5, '均匀分布计算'],
    rv10: [5, '指数分布计算'],
    rv11: [5, '正态分布计算'],
    rv12: [5, '正态标准化'],
    rv13: [4, '标准正态分布'],
    rv14: [4, '离散型函数分布'],
    rv15: [5, '连续型函数分布（分布函数法）'],
    rv16: [4, '正态线性性质'],
    mv01: [5, '二维分布函数'],
    mv02: [5, '边缘分布计算'],
    mv03: [4, '条件分布'],
    mv04: [5, '随机变量独立性'],
    mv05: [4, '二维正态分布'],
    mv06: [5, '卷积公式'],
    mv07: [4, '极值分布'],
    mv08: [4, '二维均匀分布'],
    mv09: [4, '二维函数期望'],
    nc01: [5, '期望计算'],
    nc02: [5, '期望线性性质'],
    nc03: [5, '方差定义'],
    nc04: [5, '方差计算'],
    nc05: [5, '方差性质'],
    nc06: [5, '协方差计算'],
    nc07: [5, '相关系数计算'],
    nc08: [4, '矩的计算'],
    nc09: [4, '概率不等式估计'],
    nc10: [4, '独立与不相关'],
    nc11: [3, '条件期望'],
    nc12: [3, '协方差性质'],
    nc13: [5, '分布数字特征汇总'],
    ll01: [4, '切比雪夫大数定律'],
    ll02: [4, '辛钦大数定律'],
    ll03: [4, '伯努利大数定律'],
    ll04: [5, '中心极限定理近似计算'],
    ll05: [4, '二项分布正态近似'],
    ll06: [3, '大数定律与中心极限区别'],
    ll07: [3, '切比雪夫不等式应用'],
    sm01: [4, '总体与样本'],
    sm02: [5, '样本均值'],
    sm03: [5, '样本方差'],
    sm04: [5, '样本均值分布'],
    sm05: [5, '卡方分布'],
    sm06: [5, '样本方差与卡方'],
    sm07: [5, 't 分布'],
    sm08: [4, 'F 分布'],
    sm09: [4, '分位数'],
    sm10: [4, '抽样分布关系'],
    est01: [4, '点估计概念'],
    est02: [5, '无偏性'],
    est03: [4, '有效性'],
    est04: [4, '一致性'],
    est05: [5, '矩估计'],
    est06: [5, '最大似然估计'],
    est07: [5, '置信区间'],
    est08: [5, '均值区间（方差已知）'],
    est09: [5, '均值区间（方差未知）'],
    est10: [4, '方差区间'],
    est11: [4, '样本均值与方差独立'],
    est12: [4, '似然函数'],
    est13: [4, '估计量评选标准'],
    test01: [5, '假设检验思想'],
    test02: [5, '原假设与备择假设'],
    test03: [5, '两类错误'],
    test04: [4, '显著性水平'],
    test05: [4, '单侧与双侧'],
    test06: [5, 'Z 检验'],
    test07: [5, 't 检验'],
    test08: [4, '方差检验'],
    test09: [4, 'p 值'],
    test10: [4, '拒绝域'],
    test11: [4, '两样本均值检验'],
    reg01: [4, '单因素方差分析'],
    reg02: [4, '平方和分解'],
    reg03: [4, 'F 统计量'],
    reg04: [4, '一元线性回归模型'],
    reg05: [5, '最小二乘估计'],
    reg06: [4, '判定系数'],
    rv17: [3, '超几何分布'],
    rv18: [3, '负二项分布'],
    rv19: [3, '伽马分布'],
    rv20: [4, '二项分布的泊松近似'],
    mv10: [4, '连续型条件密度'],
    mv11: [4, '离散型和的分布'],
    nc14: [4, '马尔可夫不等式'],
    nc15: [3, '特征函数'],
    nc16: [3, '矩母函数'],
    sm11: [5, '样本均值的数字特征'],
    est14: [4, '充分统计量'],
    est15: [4, '因子分解定理'],
    est16: [5, '枢轴量法'],
    est17: [4, '两均值差区间（方差已知）'],
    est18: [4, '两均值差区间（方差未知相等）'],
    est19: [3, '两方差比区间'],
    est20: [3, '费希尔信息量'],
    est21: [3, '克拉默-拉奥下界'],
    test12: [5, '两均值差 t 检验'],
    test13: [4, '两方差比 F 检验'],
    test14: [4, '拟合优度检验'],
    test15: [3, '检验功效'],
    test16: [3, '正态性检验'],
    test17: [4, '假设检验与样本量'],
    pb12: [3, '概率的统计定义'], pb13: [4, '相互独立与两两独立'],
    ll08: [4, '依概率收敛'], ll09: [3, '李雅普诺夫CLT'],
    sm12: [5, '两正态总体抽样分布'], sm13: [3, '中位数与极差'], sm14: [3, '直方图'], sm15: [3, '箱线图'], sm16: [2, '正态概率图'],
    nc17: [3, '变异系数'], nc18: [3, '偏度与峰度'], nc19: [4, '协方差矩阵'], nc20: [4, '全方差公式'],
    est22: [4, '均方误差准则'], est23: [3, 'MLE不变性'], est24: [3, '单侧置信限'],
    reg13: [3, '多重比较'], reg14: [3, '非线性回归'],
    reg07: [4, '回归系数显著性检验'],
    reg08: [4, '回归方程显著性检验'],
    reg09: [3, '回归预测区间'],
    reg10: [4, '相关系数检验'],
    sx01: [4, '两变量相关性检验'],
    sx02: [3, '贝塔分布计算'],
    sx03: [4, '充分统计量与 C-R 不等式'],
    sx04: [3, '贝叶斯先验后验'],
    sy01: [4, '泊松分布置信区间'],
    sy02: [5, '总体比例区间估计与检验'],
    sy03: [4, '对数线性模型（弹性）'],
    sy04: [4, '经验分布函数'],
    sy05: [4, '泊松Stein等式与矩'],
    sy06: [4, '泊松分布可加性'],
    sy07: [4, '样本量确定'],
    sy08: [3, '单边切比雪夫不等式'],
    sy09: [3, '两正态比（柯西分布）'],
    ts01: [5, '解题方法论'],
    ts02: [5, '解题方法论'],
    ts03: [5, '解题方法论'],
    ts04: [5, '解题方法论'],
    ts05: [5, '解题方法论'],
    ts06: [5, '解题方法论'],
    ts07: [5, '解题方法论'],
    ts08: [5, '解题方法论'],
    ts09: [5, '解题方法论'],
    xr01: [4, '指数分布性质'],
    xr02: [4, '似然比检验'],
    xr03: [5, '解题方法论'],
    xt01: [4, '次序统计量密度'],
    xt02: [4, '均匀次序统计量（Beta）'],
    xt03: [4, '次序统计量之比/独立性'],
    xt04: [4, '充分统计量与因子分解'],
    xt05: [4, '完备统计量'],
    xt06: [5, 'UMVUE 与 C-R 下界'],
    xt07: [4, '特征函数与矩母函数'],
    xt08: [4, '泊松过程'],
    xt09: [4, '大数定律形式判定'],
    xt10: [4, '多元回归矩阵形式'],
    xt11: [4, '多重共线性'],
    xt12: [4, '异方差与 White 检验'],
    xt13: [4, '非参数检验（秩和）'],
    xt14: [4, '分布拟合检验（K-S/χ²）'],
    xt15: [4, '列联表独立性检验'],
    ys01: [5, '解题方法论'], ys02: [5, '解题方法论'], ys03: [5, '解题方法论'], ys04: [5, '解题方法论'], ys05: [5, '解题方法论'],
    jj01: [4, '几何概型计算'], jj02: [4, '二维变换'], jj03: [4, '成对样本区间估计'], jj04: [3, '非参数检验（符号）'], jj05: [3, '非参数检验（游程）'],
    jj06: [4, '高斯-马尔可夫定理'], jj07: [4, '多元回归拟合优度'], jj08: [4, '异方差与 GLS'], jj09: [4, '自相关与 DW'],
    jj10: [4, '工具变量/2SLS'], jj11: [4, '虚拟变量与交互'], jj12: [4, '模型设定与变量选择'],
    pb14: [4, '事件域与事件列极限'],
    pb15: [4, '可测空间与 Borel σ-域'],
    pb16: [4, '事件列上下极限'],
    nc21: [4, '特征函数唯一性定理'],
    est25: [4, 'EM 算法（E/M 步）'],
    est26: [4, 'EM 混合模型 M 步'],
    reg15: [4, '方差齐性检验'],
    pb17: [4, '随机游动与反射原理'],
    pb18: [4, '示性函数法'],
    est27: [4, '指数族'],
    est28: [4, '位置/尺度族枢轴量'],
    est29: [4, '辅助统计量与 Basu'],
    jj13: [4, '数据类型（截面/时序/面板）'],
    jj14: [4, '无截距项回归'],
    jj15: [4, '邹至庄稳定性检验'],
    jj16: [4, '投影理论与遗漏变量偏误'],
    est30: [4, '共轭先验'],
    est31: [4, '贝叶斯估计与后验区间'],
    xr04: [4, 'NP 引理与 UMP 检验'],
    xr05: [4, '似然比检验与 Wilks'],
    reg16: [4, '多重比较 T 法（Tukey）'],
    reg17: [3, '多重比较 S 法（Scheffé）'],
    ll11: [4, 'Slutsky 定理'],
    ll12: [4, 'Δ 方法'],
    ll13: [3, '强大数定律'],
    est32: [4, 'MLE 渐近性质'],
    jj17: [4, '约束回归 F 检验'],
  };

  // ============ 经典例题 ============
  const EXAMPLE = {
    "pb01": {"q":"考虑一个包含三个孩子的家庭。假设每个孩子的性别取值服从参数为 $p=\\frac12$ 的伯努利分布（生男、生女的概率均为 $\\frac12$），且各次生育相互独立。求：(1) 该家庭中最多有 1 个女孩的概率；(2) 三个孩子既有男孩又有女孩的概率","a":"样本空间 $\\Omega=\\{BBB,\\ BBG,\\ BGB,\\ GBB,\\ BGG,\\ GBG,\\ GGB,\\ GGG\\}$，$|\\Omega|=2^{3}=8$（古典概型，每个基本事件概率 $\\frac18$）。\n(1) 设 $X$ 为女孩个数，事件 $\\{X\\le1\\}=\\{X=0\\}\\cup\\{X=1\\}$ 是两个互斥事件之并，由加法公式\n$$P(X\\le1)=P(X=0)+P(X=1)=\\frac18+\\frac38=\\frac12$$\n(2) “既有男孩又有女孩”的对立事件是“全是男孩或全是女孩”：\n$$P(B)=1-P(B^{c})=1-\\frac28=\\frac34$$","src":"2026 复旦大学 432 统计学真题"},
    "pb02": {"q":"从 $1,2,\\dots,10$ 中不放回地随机取 3 个数字。求：(1) 最小数字是 5 的概率；(2) 最大数字是 5 的概率","a":"样本点总数 $C_{10}^{3}=120$。\n(1) 最小为 5：必取 5，另两个取自 $\\{6,7,8,9,10\\}$，$P=\\dfrac{C_{5}^{2}}{C_{10}^{3}}=\\dfrac{10}{120}=\\dfrac{1}{12}$。\n(2) 最大为 5：必取 5，另两个取自 $\\{1,2,3,4\\}$，$P=\\dfrac{C_{4}^{2}}{C_{10}^{3}}=\\dfrac{6}{120}=\\dfrac{1}{20}$。","src":"2018 复旦大学 432 统计学真题"},
    "pb03": {"q":"设事件 $A,B,C$ 两两独立，$P(A)=P(B)=P(C)=p<0.5$，$ABC=\\varnothing$，且 $P(A\\cup B\\cup C)=\\frac{9}{16}$。求 $p$","a":"由加法公式（容斥原理）：\n$$P(A\\cup B\\cup C)=P(A)+P(B)+P(C)-P(AB)-P(AC)-P(BC)+P(ABC)$$\n两两独立给出 $P(AB)=P(AC)=P(BC)=p^{2}$，且 $P(ABC)=0$，故\n$$\\frac{9}{16}=3p-3p^{2}\\ \\Rightarrow\\ p=\\frac14\\ \\text{或}\\ \\frac34$$\n由 $p<0.5$ 得 $p=\\dfrac14$。","src":"2017 中国科学技术大学 432 统计学真题"},
    "pb04": {"q":"一家有两个孩子（每个孩子为男或女的概率均为 $\\frac12$，且相互独立）。求：(1) 已知第一个孩子是女孩，第二个孩子也是女孩的概率；(2) 已知至少有一个是女孩，另一个也是女孩的概率","a":"设 $A=$“第一个是女孩”，$B=$“第二个是女孩”。\n(1) 两孩性别独立，$P(B\\,|\\,A)=P(B)=\\dfrac12$。\n(2) “至少一个女孩”有 $\\{$女女, 男女, 女男$\\}$ 三种等可能情形，其中“两个都是女孩”占 1 种，故 $P=\\dfrac13$。\n（用条件概率：$P(\\text{两女}\\,|\\,\\text{至少一女})=\\dfrac{P(\\text{两女})}{P(\\text{至少一女})}=\\dfrac{1/4}{3/4}=\\dfrac13$。）","src":"2020 复旦大学 432 统计学真题"},
    "pb05": {"q":"有一堆球：2 红、3 黑、4 白。随机摸一个球，若为黑色则赢；若为其他颜色则有放回地继续摸，直至重复出现该颜色或黑色为止——若出现第一次摸到的颜色则赢，否则输。求赢的概率","a":"设 $A_k$ 为第 $k$ 次摸球获胜，则 $P(\\text{赢})=\\sum_{k\\ge1}P(A_k)$。第一次摸到黑直接赢：$P(A_1)=\\frac39=\\frac13$。\n第 $k$ 次（$k>1$）赢，由乘法公式需：第一次摸到红或白（且非黑），中间 $k-2$ 次既非黑也非初始色，第 $k$ 次摸回初始色：\n$$P(A_k)=P(R)P(A_k\\,|\\,R)+P(W)P(A_k\\,|\\,W)=\\frac29\\left(\\frac49\\right)^{k-2}\\frac29+\\frac49\\left(\\frac29\\right)^{k-2}\\frac49$$\n故\n$$P(\\text{赢})=\\frac13+\\sum_{k\\ge2}P(A_k)=\\frac13+\\frac{4/81}{1-4/9}+\\frac{16/81}{1-2/9}=\\frac13+\\frac{4}{45}+\\frac{16}{63}=\\frac{71}{105}$$","src":"2018 复旦大学 432 统计学真题"},
    "pb06": {"q":"某工厂甲、乙、丙三个车间生产同一种产品，产量依次占全厂的 45%、35%、20%，各车间次品率分别为 4%、2%、5%。从全厂产品中任取 1 件，求取到次品的概率","a":"由全概率公式：\n$$P(\\text{次品})=0.45\\times0.04+0.35\\times0.02+0.20\\times0.05=0.018+0.007+0.010=0.035$$","src":"考研数学真题（全概率公式）"},
    "pb07": {"q":"接上题，从全厂产品中任取 1 件已知是次品，求它来自甲车间的概率","a":"由贝叶斯公式：\n$$P(\\text{甲}\\,|\\,\\text{次})=\\frac{P(\\text{甲})P(\\text{次}\\,|\\,\\text{甲})}{P(\\text{次})}=\\frac{0.45\\times0.04}{0.035}\\approx0.5143$$","src":"考研数学真题（贝叶斯公式）"},
    "pb08": {"q":"三个人独立地同时破译同一密码，三人能破译的概率分别为 $\\frac15,\\ \\frac13,\\ \\frac14$。求此密码能够被破译的概率","a":"密码被破译 = 至少一人破译。利用独立性取对立事件：\n$$P(\\text{被破译})=1-P(\\text{三人均未破译})=1-\\left(1-\\frac15\\right)\\left(1-\\frac13\\right)\\left(1-\\frac14\\right)=1-\\frac45\\cdot\\frac23\\cdot\\frac34=1-\\frac25=\\frac35$$","src":"2016 复旦大学 432 统计学真题","a2":"💡巧解（容斥/加法公式）：设 $A,B,C$ 为三人各自破译成功，所求\n$$P(A\\cup B\\cup C)=P(A)+P(B)+P(C)-P(AB)-P(AC)-P(BC)+P(ABC)$$\n由独立性 $=\\dfrac15+\\dfrac13+\\dfrac14-\\dfrac1{15}-\\dfrac1{20}-\\dfrac1{12}+\\dfrac1{60}=\\dfrac35$。"},
    "pb09": {"q":"设 $P(A)=0.3$，且 $A,B$ 互不相容，$P(B)=0.4$，求 $P(B\\,|\\,\\bar{A})$","a":"由 $A,B$ 互不相容，$AB=\\varnothing$，故 $B\\bar{A}=B$。利用对立事件 $\\bar{A}$：\n$$P(B\\,|\\,\\bar{A})=\\frac{P(B\\bar{A})}{P(\\bar{A})}=\\frac{P(B)}{1-P(A)}=\\frac{0.4}{0.7}=\\frac47$$","src":"2022 南开大学 432 统计学真题"},
    "pb10": {"q":"$A,B,C$ 都是事件，下列关于事件运算的表达式，正确的是（  ）\\\\\nA. $(A-B)-C=A-(B-C)$　B. 若 $AC=\\varnothing,\\ B\\subset A$，则 $BC=\\varnothing$\\\\\nC. $(A\\cup B)-B=A$　D. $(A-B)+B=A$","a":"选 B。因 $B\\subset A$ 且 $AC=\\varnothing$，故 $BC\\subset AC=\\varnothing$，即 $BC=\\varnothing$（互斥关系的传递性）。\n反例排除：C 中 $(A\\cup B)-B=A-B\\ne A$；D 中 $(A-B)+B=A\\cup B\\ne A$；A 一般不成立。","src":"2023 上海财经大学 432 统计学真题"},
    "pb11": {"q":"在自然数集 $\\mathbb{N}$ 上定义概率测度：$P(\\{n\\})=\\dfrac{6}{\\pi^{2}n^{2}}$。\\\\\n(1) 对 $p\\in\\mathbb{N}^{+}$，定义 $p\\mathbb{N}^{+}=\\{pk:k\\in\\mathbb{N}^{+}\\}$，求 $P(p\\mathbb{N}^{+})$；\\\\\n(2) 若 $p,q$ 为不相等的质数，证明事件 $p\\mathbb{N}^{+}$ 与 $q\\mathbb{N}^{+}$ 相互独立","a":"(1) 由可列可加性（概率公理）：\n$$P(p\\mathbb{N}^{+})=\\sum_{k=1}^{\\infty}\\frac{6}{\\pi^{2}(pk)^{2}}=\\frac{6}{\\pi^{2}p^{2}}\\sum_{k=1}^{\\infty}\\frac{1}{k^{2}}=\\frac{6}{\\pi^{2}p^{2}}\\cdot\\frac{\\pi^{2}}{6}=\\frac{1}{p^{2}}$$\n(2) $p,q$ 为不同质数时 $p\\mathbb{N}^{+}\\cap q\\mathbb{N}^{+}=pq\\mathbb{N}^{+}$，故\n$$P(p\\mathbb{N}^{+}\\cap q\\mathbb{N}^{+})=P(pq\\mathbb{N}^{+})=\\frac{1}{p^{2}q^{2}}=P(p\\mathbb{N}^{+})\\,P(q\\mathbb{N}^{+})$$\n即两事件相互独立。","src":"2026 复旦大学 432 统计学真题"},
    "rv01": {"q":"设 $\\xi\\sim N(0,1)$，$\\eta\\sim b(1,\\frac12)$，且 $\\xi,\\eta$ 相互独立，$Z=\\xi+\\eta$。(1) 判别 $Z$ 是否为连续型随机变量并证明；(2) 求 $Z$ 的分布函数 $F_Z(z)$","a":"(1) 对任意 $z_0$，$P(Z=z_0)=\\frac12P(\\xi=z_0)+\\frac12P(\\xi=z_0-1)=0$，故 $Z$ 为连续型随机变量（绝对连续测度与任意概率测度的卷积仍绝对连续）。\n(2) 由全概率公式：\n$$F_Z(z)=P(Z\\le z)=\\frac12P(\\xi\\le z)+\\frac12P(\\xi+1\\le z)=\\frac12\\Phi(z)+\\frac12\\Phi(z-1)$$\n其中 $\\Phi$ 为标准正态分布函数。","src":"2026 复旦大学 432 统计学真题"},
    "rv02": {"q":"以下哪条不是概率的公理化定义中概率函数的性质？\\\\\nA. 有限可加性　B. 次可加性　C. 单调性　D. 右连续性","a":"选 D。概率函数的性质有次可加性、单调性、有限可加性、连续性（上/下连续）等；右连续性是\\textbf{分布函数}的性质（单调不减、$F(-\\infty)=0$、$F(+\\infty)=1$、右连续），并非概率函数独有的性质。","src":"2018 中山大学 432 统计学真题"},
    "rv03": {"q":"$X_0,X_1,\\dots$ 是 i.i.d. 的服从 $U(0,1)$ 的随机变量，记 $N=\\inf\\{n\\ge1:X_n>X_0\\}$，求 $N$ 的分布律","a":"给定 $X_0=x$ 时（条件几何型）：\n$$P(N=k\\,|\\,X_0=x)=P(X_1\\le x,\\dots,X_{k-1}\\le x,\\ X_k>x)=x^{k-1}(1-x)$$\n由全概率公式（对 $x$ 积分）：\n$$P(N=k)=\\int_0^1 x^{k-1}(1-x)\\,dx=\\frac{1}{k(k+1)},\\qquad k=1,2,\\dots$$\n且 $\\sum_{k\\ge1}\\frac{1}{k(k+1)}=1$，确为一条分布律。","src":"2021 复旦大学 432 统计学真题"},
    "rv04": {"q":"设 $X_1,X_2$ i.i.d. $\\sim Exp(1)$，求 $W=\\dfrac{X_1}{X_1+X_2}$ 的密度函数","a":"作变换 $U=X_1/(X_1+X_2)$，$V=X_1+X_2$，则 $X_1=UV,\\ X_2=V(1-U)$，雅可比 $|J|=V$。联合密度\n$$f_{U,V}(u,v)=e^{-uv}\\,e^{-v(1-u)}\\cdot v=v\\,e^{-v},\\qquad u\\in(0,1),\\ v>0$$\n对 $v$ 积分得\n$$f_W(u)=\\int_0^{\\infty}v\\,e^{-v}\\,dv=1,\\qquad 0<u<1$$\n即 $W\\sim U(0,1)$（贝塔分布 $Beta(1,1)$），且 $\\int_0^1 1\\,du=1$ 验证了归一化。","src":"2017 复旦大学 432 统计学真题"},
    "rv05": {"q":"设 $X\\sim N(0,1)$，$Y\\sim B(1,p)$，且 $X,Y$ 相互独立，求 $X+Y$ 的概率分布","a":"$Y$ 为 0-1 分布：$P(Y=0)=1-p,\\ P(Y=1)=p$。由全概率公式，$Z=X+Y$ 的分布函数\n$$F_Z(z)=(1-p)P(X\\le z)+p\\,P(X\\le z-1)=(1-p)\\Phi(z)+p\\,\\Phi(z-1)$$\n其密度为\n$$f_Z(z)=(1-p)\\,\\varphi(z)+p\\,\\varphi(z-1),\\qquad \\varphi(z)=\\frac{1}{\\sqrt{2\\pi}}e^{-z^{2}/2}$$\n（两个高斯波包的线性叠加），且 $\\int_{-\\infty}^{+\\infty}f_Z(z)\\,dz=(1-p)+p=1$。","src":"2023 复旦大学 432 统计学真题"},
    "rv06": {"q":"甲有 21 个硬币，乙有 20 个硬币，两人同时抛出所有硬币，求甲朝上的硬币数多于乙的概率","a":"设 $X\\sim B(21,\\frac12)$，$Y\\sim B(20,\\frac12)$ 相互独立。令 $X'=21-X\\sim B(21,\\frac12)$，$Y'=20-Y\\sim B(20,\\frac12)$，则\n$$P(X>Y)=P(21-X'<21-Y)=P(X'\\le Y')$$\n由 $(X',Y')$ 与 $(X,Y)$ 同分布，$P(X'>Y')=P(X>Y)$，而 $P(X>Y)+P(X\\le Y)=1$，故 $P(X>Y)=\\dfrac12$。","src":"2020 复旦大学 432 统计学真题"},
    "rv07": {"q":"某昆虫产在一片树叶上的虫卵数 $X$ 服从参数为 $\\lambda$ 的泊松分布，但只有虫卵数非零时才被记录。用 $Y$ 表示观察到的虫卵数，即 $P(Y=i)=P(X=i\\,|\\,X>0)$。求 $P(Y\\text{为偶数})$ 和 $E(Y)$","a":"$P(X>0)=1-e^{-\\lambda}$，故 $P(Y=i)=\\dfrac{\\lambda^{i}e^{-\\lambda}}{i!(1-e^{-\\lambda})}\\ (i=1,2,\\dots)$。\n$$E(Y)=E(X\\,|\\,X>0)=\\frac{E(X)}{P(X>0)}=\\frac{\\lambda}{1-e^{-\\lambda}}$$\n$P(Y\\text{为偶数})=\\dfrac{\\sum_{k\\ge1}P(X=2k)}{1-e^{-\\lambda}}=\\dfrac{e^{-\\lambda}(\\cosh\\lambda-1)}{1-e^{-\\lambda}}=\\dfrac{1-e^{-\\lambda}}{2}$。","src":"2013 年人大 805 统计学真题"},
    "rv08": {"q":"打怪物会爆出装备 1 和装备 2：爆出装备 1 的概率为 0.2，爆出装备 2 的概率为 0.2，什么都不爆的概率为 0.6。设 $\\tau$ 为集齐两件装备所用的次数，求 $E\\tau$ 与 $Var\\,\\tau$","a":"记 $\\xi_1$ 为收集到第一件装备所需次数，$\\xi_1\\sim Ge(0.4)$（每把获得任一装备的概率为 $0.2+0.2=0.4$）；记 $\\xi_2$ 为收集到第一件后获得另一件所需次数，$\\xi_2\\sim Ge(0.2)$。由几何分布 $E\\xi=\\frac1p,\\ Var\\xi=\\frac{1-p}{p^2}$：\n$$E\\tau=E\\xi_1+E\\xi_2=\\frac{1}{0.4}+\\frac{1}{0.2}=2.5+5=7.5$$\n$$Var\\,\\tau=Var\\,\\xi_1+Var\\,\\xi_2=\\frac{0.6}{0.16}+\\frac{0.8}{0.04}=3.75+20=23.75$$","src":"2025 复旦大学 432 统计学真题"},
    "rv09": {"q":"$X_1,X_2,X_3$ 是 i.i.d. 的服从 $U(0,1)$ 的随机变量，求次序统计量 $X_{(1)}=\\min\\{X_1,X_2,X_3\\}$ 的分布函数与期望","a":"由极值分布公式：\n$$F_{X_{(1)}}(x)=1-[1-F(x)]^{3}=1-(1-x)^{3},\\qquad 0<x<1$$\n密度 $f_{X_{(1)}}(x)=3(1-x)^{2}$，故\n$$E[X_{(1)}]=\\int_0^1 3x(1-x)^{2}\\,dx=\\frac14$$\n（一般地 $X_{(1)}\\sim Beta(1,3)$，$E=\\frac{1}{1+3}=\\frac14$。）","src":"2016 复旦大学 432 统计学真题"},
    "rv10": {"q":"某种型号灯泡的寿命 $X$ 服从指数分布，平均寿命为 5000 小时。求 3 个这种灯泡使用了 1000 小时后至少有 2 个仍可继续使用的概率","a":"平均寿命 $5000\\Rightarrow E(X)=\\frac1\\lambda=5000\\Rightarrow\\lambda=\\frac1{5000}$。单个灯泡使用 1000 小时后仍正常：$p=P(X>1000)=e^{-0.2}\\approx0.8187$。设 $Y\\sim B(3,p)$，所求\n$$P(Y\\ge2)=C_{3}^{2}p^{2}(1-p)+p^{3}=3p^{2}-2p^{3}\\approx0.9133$$","src":"考研数学真题（指数分布）"},
    "rv11": {"q":"设 $X\\sim N(3,4)$。求：(1) $P(2<X\\le5)$；(2) $P(|X|>2)$","a":"(1) $P(2<X\\le5)=\\Phi\\left(\\frac{5-3}{2}\\right)-\\Phi\\left(\\frac{2-3}{2}\\right)=\\Phi(1)-\\Phi(-0.5)=\\Phi(1)+\\Phi(0.5)-1=0.8413+0.6915-1=0.5328$。\n(2) $P(|X|>2)=P(X>2)+P(X<-2)=[1-\\Phi(-0.5)]+\\Phi(-2.5)=\\Phi(0.5)+1-\\Phi(2.5)=0.6915+1-0.9938=0.6977$。","src":"考研数学真题（正态分布）"},
    "rv12": {"q":"设 $X\\sim N(\\mu,\\sigma^{2})$，当 $\\sigma$ 增大时，概率 $P(|X-\\mu|<\\sigma)$ 如何变化？\\\\\nA. 增大　B. 减小　C. 不变　D. 无法确定","a":"选 C。标准化后与参数无关：\n$$P(|X-\\mu|<\\sigma)=P\\left(\\left|\\frac{X-\\mu}{\\sigma}\\right|<1\\right)=P(|Z|<1)\\approx0.6827$$\n其中 $Z\\sim N(0,1)$，故 $\\sigma$ 增大时概率不变。","src":"2016 北京师范大学 432 统计学真题"},
    "rv13": {"q":"$X_1,X_2,X_3$ i.i.d. $\\sim N(0,1)$，求：(1) $P(X_1>X_2>X_3)$；(2) $P(X_1>X_2,\\ X_1>X_3)$","a":"(1) 由 $X_1,X_2,X_3$ 独立同分布且为连续型，其大小排序的 $3!=6$ 种情形等可能，故\n$$P(X_1>X_2>X_3)=\\frac{1}{3!}=\\frac16$$\n(2) 每个变量成为最大值的概率相等，故\n$$P(X_1>X_2,\\ X_1>X_3)=P(X_1\\ \\text{为最大值})=\\frac13$$","src":"2017 复旦大学 432 统计学真题"},
    "rv14": {"q":"设 $X$ 取 $-1,0,1$ 的概率分别为 $\\frac14,\\frac12,\\frac14$，求 $Z=X^{2}+1$ 的分布函数","a":"$Z$ 的分布律：$P(Z=2)=P(X=\\pm1)=\\frac14+\\frac14=\\frac12$，$P(Z=1)=P(X=0)=\\frac12$。故\n$$F_Z(z)=\\begin{cases}0,&z<1\\\\[2pt]\\frac12,&1\\le z<2\\\\[2pt]1,&z\\ge2\\end{cases}$$\n（在 $z=1,2$ 处右连续。）","src":"2016 南开大学 432 统计学真题"},
    "rv15": {"q":"设 $X\\sim N(0,1)$，求 $Y=X^{2}$ 的密度函数","a":"对 $y>0$，$F_Y(y)=P(X^2\\le y)=P(-\\sqrt y\\le X\\le\\sqrt y)=2\\Phi(\\sqrt y)-1$。求导：\n$$f_Y(y)=2\\cdot\\frac{1}{\\sqrt{2\\pi}}e^{-y/2}\\cdot\\frac{1}{2\\sqrt y}=\\frac{1}{\\sqrt{2\\pi y}}\\,e^{-y/2},\\quad y>0$$\n即 $Y\\sim\\chi^{2}(1)$（自由度为 1 的卡方分布）。","src":"2016 复旦大学 432 统计学真题","a2":"💡巧解（卡方定义）：$X\\sim N(0,1)$ 时，由 $\\chi^2$ 分布定义直接得 $Y=X^2\\sim\\chi^2(1)$，密度为\n$$f_Y(y)=\\frac{1}{\\sqrt{2\\pi y}}\\,e^{-y/2}\\quad(y>0)$$\n免去分布函数法求导，一步到位。"},
    "rv16": {"q":"设随机向量 $\\xi=(X,Y)^{T}\\sim N(0,\\Sigma)$，其中 $\\Sigma=\\begin{pmatrix}1&\\rho\\\\ \\rho&1\\end{pmatrix}$。考虑变换 $Z=\\dfrac{Y-\\rho X}{\\sqrt{1-\\rho^{2}}}$。(1) 求 $Z$ 的边缘分布；(2) 证明 $X$ 与 $Z$ 相互独立","a":"(1) $Z$ 是 $X,Y$ 的线性组合，正态线性变换仍为正态。$E(Z)=\\frac{0-\\rho\\cdot0}{\\sqrt{1-\\rho^{2}}}=0$，\n$$Var(Z)=\\frac{Var(Y)-2\\rho\\,Cov(X,Y)+\\rho^{2}Var(X)}{1-\\rho^{2}}=\\frac{1-2\\rho^{2}+\\rho^{2}}{1-\\rho^{2}}=1$$\n故 $Z\\sim N(0,1)$。\n(2) $Cov(X,Z)=\\dfrac{Cov(X,Y)-\\rho\\,Var(X)}{\\sqrt{1-\\rho^{2}}}=\\dfrac{\\rho-\\rho}{\\sqrt{1-\\rho^{2}}}=0$，而 $(X,Z)$ 服从二维正态分布，不相关即独立，故 $X$ 与 $Z$ 相互独立。","src":"2026 复旦大学 432 统计学真题"},
    "rv17": {"q":"有 2 个五分硬币、3 个二分硬币和 5 个一分硬币，随机抽取 5 个（不放回），求总和大于一角的概率","a":"不放回抽取属于超几何型计数。总和大于一角（$\\ge10$ 分）的可能情况：2 枚五分 + 3 枚其他；1 枚五分 + 3 枚二分 + 1 枚一分；1 枚五分 + 2 枚二分 + 2 枚一分。故\n$$P=\\frac{C_{2}^{2}C_{8}^{3}+C_{2}^{1}C_{3}^{3}C_{5}^{1}+C_{2}^{1}C_{3}^{2}C_{5}^{2}}{C_{10}^{5}}=\\frac{56+10+60}{252}=\\frac{126}{252}=\\frac12$$","src":"2016 南开大学 432 统计学真题"},
    "rv18": {"q":"独立地多次抛掷一枚硬币，每次正面朝上的概率为 $p$，当出现连续 2 次正面朝上时停止抛掷。记 $n$ 为正整数，求抛掷过程中正面朝上的次数大于 $n$ 的概率","a":"设 $X$ 为停止时正面朝上的次数。停止发生在首次出现 $HH$ 时；若首次 $HH$ 是第 $j$ 个与第 $j+1$ 个正面，则 $X=j+1$，故 $X>n\\iff j\\ge n$，即第 $n$ 个正面之后紧跟着出现正面（而前 $n-1$ 个正面之后均跟反面）。由几何分布求和（负二项分布的正则性）：\n$$P(X>n)=\\sum_{j\\ge n}(1-p)^{j-1}p=(1-p)^{n-1}$$","src":"2024 中国科学技术大学 812 概率论与数理统计真题"},
    "rv19": {"q":"设 $X,Y$ 独立，均服从伽马分布 $\\Gamma(2,4)$，则 $X+Y$ 服从的分布是（  ）\\\\\nA. $\\Gamma(4,8)$　B. $\\Gamma(4,4)$　C. $\\Gamma(2,8)$　D. $\\Gamma(2,4)$","a":"选 B。伽马分布具有可加性：若 $X_i\\sim\\Gamma(\\alpha_i,\\lambda)$ 相互独立（比率参数 $\\lambda$ 相同），则\n$$\\sum_i X_i\\sim\\Gamma\\left(\\sum_i\\alpha_i,\\ \\lambda\\right)$$\n故 $X+Y\\sim\\Gamma(2+2,\\,4)=\\Gamma(4,4)$（形状参数相加，比率参数不变）。","src":"2023 中山大学 432 统计学真题"},
    "rv20": {"q":"设 $X_1,\\dots,X_{20}$ 为来自总体 $B(1,0.1)$ 的简单随机样本，$T=\\sum_{i=1}^{20}X_i$。利用泊松分布近似二项分布的方法，求 $P\\{T\\le1\\}$ 的近似值（  ）\\\\\nA. $\\frac1{e^{2}}$　B. $\\frac2{e^{2}}$　C. $\\frac3{e^{2}}$　D. $\\frac4{e^{2}}$","a":"$T\\sim B(20,0.1)$，$n=20$ 大、$p=0.1$ 小，$np=2$。由泊松定理，$T\\ \\dot\\sim\\ P(2)$，故\n$$P(T\\le1)=P(T=0)+P(T=1)\\approx e^{-2}+2e^{-2}=\\frac{3}{e^{2}}$$\n选 C。","src":"2025 考研数学三真题"},
    "mv01": {"q":"以下选项中，不是联合分布函数 $F_{X,Y}(x,y)$ 的性质的是（  ）\\\\\nA. 非负性　B. 单调性　C. 有界性　D. 左连续性","a":"选 D。二维分布函数 $F(x,y)$ 具有：单调不减性、有界性（$0\\le F\\le1$，且 $F(-\\infty,-\\infty)=0$，$F(+\\infty,+\\infty)=1$）、右连续性；而\\textbf{不是}左连续性。","src":"2023 上海财经大学 432 统计学真题"},
    "mv02": {"q":"设二维随机变量 $(X,Y)$ 的联合密度为 $f(x,y)=kxy,\\ 0\\le y\\le x\\le1$（其余为 0）。求：(1) 常数 $k$；(2) 联合分布函数 $F(x,y)$；(3) 边缘密度 $f_X(x)$ 与 $f_Y(y)$","a":"(1) $1=\\int_0^1\\int_0^x kxy\\,dy\\,dx=k\\int_0^1 x\\cdot\\frac{x^2}{2}\\,dx=\\frac{k}{2}\\cdot\\frac14=\\frac k8$，故 $k=8$。\n(2) 当 $0\\le y\\le x\\le1$ 时$$F(x,y)=\\int_0^y\\int_v^x 8uv\\,du\\,dv=2x^2y^2-y^4$$当 $0\\le x<y\\le1$ 时 $F(x,y)=F_X(x)=x^4$；当 $x>1$ 时 $F(x,y)=F_Y(y)=2y^2-y^4\\ (0\\le y\\le1)$；$F(1,1)=1$。\n(3) $f_X(x)=\\int_0^x 8xy\\,dy=4x^3\\ (0<x<1)$；$f_Y(y)=\\int_y^1 8xy\\,dx=4y(1-y^2)\\ (0<y<1)$。","src":"2026 北大光华 431 统计真题"},
    "mv03": {"q":"设 $X,Y$ 相互独立，均服从参数为 $p$ 的几何分布，记 $Z=\\max\\{X,Y\\}$。(1) 求 $(Z,X)$ 的联合分布；(2) 求 $X$ 关于 $Z$ 的条件分布","a":"几何分布 $P(X=k)=p(1-p)^{k-1}$，$P(X\\le z)=1-(1-p)^{z}$。\n(1) 当 $x<z$ 时，$Z=z$ 且 $X=x$ 需 $Y=z$：\n$$P(Z=z,\\ X=x)=P(X=x)P(Y=z)=p^{2}(1-p)^{x+z-2}$$\n当 $x=z$ 时：\n$$P(Z=z,\\ X=z)=P(X=z)P(Y\\le z)=p(1-p)^{z-1}\\left[1-(1-p)^{z}\\right]$$\n(2) 条件分布 $P(X=x\\,|\\,Z=z)=\\dfrac{P(Z=z,\\ X=x)}{P(Z=z)}$，其中\n$$P(Z=z)=1-P(X\\le z-1)P(Y\\le z-1)=1-\\left[1-(1-p)^{z-1}\\right]^{2}$$","src":"2020 复旦大学 861 概率论与数理统计真题"},
    "mv04": {"q":"(1) 什么是随机变量 $X$ 和 $Y$ 的相关性？(2) 什么是 $X$ 和 $Y$ 的独立性？(3) 如果 $X$ 和 $Y$ 不相关，那么 $X$ 和 $Y$ 是否独立？请具体论述","a":"(1) 相关性指线性相关程度，用相关系数 $\\rho=\\dfrac{\\mathrm{Cov}(X,Y)}{\\sqrt{D(X)D(Y)}}$ 度量。\n(2) 独立性指一个变量的取值不影响另一个的分布：$F(x,y)=F_X(x)F_Y(y)$（连续型为 $f(x,y)=f_X(x)f_Y(y)$）。\n(3) 不相关不一定独立。独立 $\\Rightarrow$ 不相关（$\\mathrm{Cov}=0$），反之不成立：如 $X\\sim N(0,1)$，$Y=X^{2}$，则 $\\mathrm{Cov}(X,Y)=E(X^{3})=0$ 故不相关，但 $Y$ 完全由 $X$ 决定，二者不独立（仅二维正态分布等特殊场合两者等价）。","src":"2018 北大光华 431 统计真题"},
    "mv05": {"q":"设 $(X,Y)$ 服从二维正态分布 $N(\\mu_1,\\mu_2,\\sigma_1^{2},\\sigma_2^{2},\\rho)$。证明：$X$ 与 $Y$ 相互独立的充要条件是相关系数 $\\rho=0$","a":"二维正态联合密度为\n$$f(x,y)=\\frac{1}{2\\pi\\sigma_1\\sigma_2\\sqrt{1-\\rho^{2}}}\\exp\\left\\{-\\frac{1}{2(1-\\rho^{2})}\\left[\\frac{(x-\\mu_1)^{2}}{\\sigma_1^{2}}-2\\rho\\frac{(x-\\mu_1)(y-\\mu_2)}{\\sigma_1\\sigma_2}+\\frac{(y-\\mu_2)^{2}}{\\sigma_2^{2}}\\right]\\right\\}$$\n当 $\\rho=0$ 时交叉项消失，$f(x,y)=f_X(x)f_Y(y)$，故 $X,Y$ 独立；反之若 $X,Y$ 独立则 $\\mathrm{Cov}(X,Y)=0$，即 $\\rho=0$。","src":"2013 年人大 805 统计学真题","a2":"💡巧解（协方差矩阵 / 特征函数）：二维正态的联合特征函数\n$$\\varphi(s,t)=\\exp\\left\\{i(s\\mu_1+t\\mu_2)-\\tfrac12(s^2\\sigma_1^2+2\\rho st\\sigma_1\\sigma_2+t^2\\sigma_2^2)\\right\\}$$\n当 $\\rho=0$ 时 $\\varphi(s,t)=\\varphi_X(s)\\varphi_Y(t)$，由特征函数唯一性即得 $X,Y$ 独立（等价地：协方差矩阵 $\\Sigma$ 为对角阵）。"},
    "mv06": {"q":"设 $(X,Y)$ 的联合密度为 $f(x,y)=2(x+y),\\ 0\\le x\\le y\\le1$（其余为 0）。求 $Z=X+Y$ 的密度函数","a":"由卷积公式（注意 $0\\le x\\le z-x\\le1$，即 $x\\le\\frac z2$ 且 $x\\ge z-1$）：\n当 $0<z<1$：$f_Z(z)=\\int_0^{z/2}2z\\,dx=z^2$；\n当 $1\\le z<2$：$f_Z(z)=\\int_{z-1}^{z/2}2z\\,dx=2z\\left(1-\\frac z2\\right)=2z-z^2$。\n故\n$$f_Z(z)=\\begin{cases}z^2,&0<z<1\\\\z-z^2,&1\\le z<2\\\\0,&\\text{其他}\\end{cases}$$","src":"2021 北大光华 431 统计真题"},
    "mv07": {"q":"设 $X,Y$ 独立同分布于 $N(0,1)$，求 $E[\\max\\{X,Y\\}]$","a":"由 $\\max\\{X,Y\\}=\\dfrac{X+Y+|X-Y|}{2}$ 及 $E(X)=E(Y)=0$：\n$$E[\\max\\{X,Y\\}]=\\frac12 E|X-Y|$$\n$X-Y\\sim N(0,2)$，$E|X-Y|=\\sqrt2\\sqrt{\\dfrac2\\pi}=\\dfrac2{\\sqrt\\pi}$，故$$E[\\max\\{X,Y\\}]=\\frac{1}{\\sqrt\\pi}$$","src":"2024 北大光华 431 统计真题"},
    "mv08": {"q":"从 $(0,1)$ 中随机地取两个数 $x,y$，求其积不小于 $\\frac3{16}$ 且其和不大于 $1$ 的概率","a":"$(x,y)$ 在单位正方形上均匀分布，所求为区域 $\\{xy\\ge\\frac3{16},\\ x+y\\le1\\}$ 的面积。曲线 $xy=\\frac3{16}$ 与 $x+y=1$ 交于 $x=\\frac14,\\frac34$：\n$$P=\\int_{1/4}^{3/4}\\int_{3/(16x)}^{1-x}dy\\,dx=\\int_{1/4}^{3/4}\\left(1-x-\\frac{3}{16x}\\right)dx=\\left[x-\\frac{x^2}{2}-\\frac{3}{16}\\ln x\\right]_{1/4}^{3/4}=\\frac14-\\frac{3}{16}\\ln 3\\approx0.044$$","src":"2016 复旦大学 432 统计学真题"},
    "mv09": {"q":"设 $X_1,X_2$ i.i.d. $\\sim N(\\mu,\\sigma^{2})$，求 $E[\\max\\{X_1,X_2\\}]$","a":"利用 $\\max\\{X_1,X_2\\}=\\dfrac{X_1+X_2+|X_1-X_2|}{2}$：\n$$E[\\max\\{X_1,X_2\\}]=\\frac{E(X_1)+E(X_2)+E|X_1-X_2|}{2}=\\mu+\\frac12E|X_1-X_2|$$\n$X_1-X_2\\sim N(0,2\\sigma^{2})$，令 $Z=\\dfrac{X_1-X_2}{\\sqrt2\\,\\sigma}\\sim N(0,1)$，$E|Z|=\\sqrt{\\frac2\\pi}$，故\n$$E[\\max\\{X_1,X_2\\}]=\\mu+\\frac12\\cdot\\sqrt2\\,\\sigma\\cdot\\sqrt{\\frac2\\pi}=\\mu+\\frac{\\sigma}{\\sqrt\\pi}$$","src":"2019 复旦大学 432 统计学真题"},
    "mv10": {"q":"$(X,Y)$ 服从由 $1<x<e^{2}$ 与 $0<y<\\frac1x$ 围成区域上的均匀分布，求 $f_{Y|X=3}(y)$","a":"区域面积 $S_D=\\int_1^{e^2}\\frac1x\\,dx=2$，故联合密度 $f(x,y)=\\frac12$。边缘密度\n$$f_X(x)=\\int_0^{1/x}\\frac12\\,dy=\\frac{1}{2x},\\qquad 1<x<e^{2}$$\n由条件密度公式：\n$$f_{Y|X}(y\\,|\\,x)=\\frac{f(x,y)}{f_X(x)}=\\frac{1/2}{1/(2x)}=x,\\qquad 0<y<\\frac1x$$\n代入 $x=3$ 得 $f_{Y|X=3}(y)=3,\\ 0<y<\\frac13$。","src":"2022 南开大学 432 统计学真题"},
    "mv11": {"q":"随机变量 $X_1,X_2$ 相互独立，分别服从 $P(\\lambda_1),P(\\lambda_2)$，求 $E(X_1\\,|\\,X_1+X_2=n)$","a":"由泊松分布的可加性 $X_1+X_2\\sim P(\\lambda_1+\\lambda_2)$，且给定 $X_1+X_2=n$ 时\n$$X_1\\,|\\,(X_1+X_2=n)\\sim B\\left(n,\\ \\frac{\\lambda_1}{\\lambda_1+\\lambda_2}\\right)$$\n（和的条件下条件分布为二项分布），故\n$$E(X_1\\,|\\,X_1+X_2=n)=n\\cdot\\frac{\\lambda_1}{\\lambda_1+\\lambda_2}$$","src":"2023 上海财经大学 432 统计学真题"},
    "nc01": {"q":"设 $X\\sim N(0,1)$，求 $E[X^{3}\\,|\\,X\\ge0]$","a":"由期望定义（条件期望）：\n$$E[X^{3}\\,|\\,X\\ge0]=\\frac{\\int_0^{\\infty}x^{3}\\varphi(x)\\,dx}{P(X\\ge0)}=\\frac{\\frac{1}{\\sqrt{2\\pi}}\\int_0^{\\infty}x^{3}e^{-x^{2}/2}\\,dx}{\\frac12}$$\n令 $t=x^{2}/2$（$x^{3}dx=2t\\,dt$），$\\int_0^{\\infty}x^{3}e^{-x^{2}/2}dx=2\\int_0^{\\infty}t\\,e^{-t}dt=2$，故\n$$E[X^{3}\\,|\\,X\\ge0]=\\frac{\\frac{1}{\\sqrt{2\\pi}}\\cdot2}{1/2}=\\frac{4}{\\sqrt{2\\pi}}=2\\sqrt{\\frac2\\pi}$$","src":"2023 北大光华 431 统计真题"},
    "nc02": {"q":"8 个男生、7 个女生坐成一排。设 $X_i=1$ 表示第 $i$ 个位置与第 $i+1$ 个位置坐的是异性，$X_i=0$ 表示同性，$\\xi=\\sum_{i=1}^{14}X_i$，求 $E\\xi$","a":"由期望的线性性质：\n$$E\\xi=\\sum_{i=1}^{14}E(X_i)=14\\,P(\\text{第 }i,i+1\\text{ 位为异性})$$\n$P(\\text{异性相邻})=\\frac{8}{15}\\cdot\\frac{7}{14}+\\frac{7}{15}\\cdot\\frac{8}{14}=\\frac{8}{15}$，故\n$$E\\xi=14\\times\\frac{8}{15}=\\frac{112}{15}$$","src":"2020 复旦大学 432 统计学真题"},
    "nc03": {"q":"离散型随机变量 $X$ 的分布列为 $P(X=a)=P(X=b)=P(X=a+1)=\\frac13$，其中 $a<b<a+1$，求 $D(X)$ 的取值范围","a":"方差平移不变，令 $c=b-a\\in(0,1)$，则 $X$ 取 $0,c,1$ 各 $\\frac13$：\n$$E(X)=\\frac{c+1}{3},\\qquad E(X^{2})=\\frac{c^{2}+1}{3}$$\n$$D(X)=E(X^{2})-[E(X)]^{2}=\\frac{2}{9}\\left[\\left(c-\\frac12\\right)^{2}+\\frac34\\right]\\in\\left[\\frac16,\\ \\frac29\\right)$$\n（最小值在 $c=\\frac12$ 时取到；$c\\to0$ 或 $1$ 时趋近 $\\frac29$ 但不取到。）","src":"2022 复旦大学 432 统计学真题"},
    "nc04": {"q":"设 $X$ 的密度函数为 $f(x)=c(1-x^2),\\ |x|\\le1$（其余为 0）。求：(1) 常数 $c$；(2) $E(X)$ 与 $D(X)$","a":"(1) $1=\\int_{-1}^{1}c(1-x^2)\\,dx=c\\cdot\\frac43$，故 $c=\\frac34$。\n(2) 由对称性 $E(X)=0$；$E(X^2)=\\int_{-1}^{1}\\frac34 x^2(1-x^2)\\,dx=\\frac34\\left(\\frac23-\\frac25\\right)=\\frac15$。\n故 $D(X)=E(X^2)-[E(X)]^2=\\frac15$。","src":"2022 北大光华 431 统计真题"},
    "nc05": {"q":"设 $E(X)=-2,\\ E(X^{2})=5$，则 $Var(100-3X)=$（  ）\\\\\nA. 9　B. 3　C. 1　D. 2","a":"由方差性质 $D(aX+b)=a^{2}D(X)$：\n$$Var(100-3X)=9\\,Var(X)=9\\left[E(X^{2})-[E(X)]^{2}\\right]=9(5-4)=9$$\n选 A。","src":"2023 上海财经大学 432 统计学真题"},
    "nc06": {"q":"设 $X\\sim U(0,1)$，$Z\\sim U(0,\\frac1{10})$，且 $X$ 与 $Z$ 相互独立，令 $Y=X+Z$。求 $\\mathrm{Cov}(X,Y)$ 与 $\\mathrm{Corr}(X,Y)$","a":"$D(X)=\\frac1{12}$，$D(Z)=\\frac{(1/10)^2}{12}=\\frac1{1200}$，且 $X,Z$ 独立。\n$$\\mathrm{Cov}(X,Y)=\\mathrm{Cov}(X,X+Z)=D(X)+\\mathrm{Cov}(X,Z)=\\frac1{12}$$\n$D(Y)=D(X)+D(Z)=\\frac1{12}+\\frac1{1200}=\\frac{101}{1200}$，故\n$$\\mathrm{Corr}(X,Y)=\\frac{\\mathrm{Cov}(X,Y)}{\\sqrt{D(X)D(Y)}}=\\frac{1/12}{\\sqrt{\\frac1{12}\\cdot\\frac{101}{1200}}}=\\frac{10}{\\sqrt{101}}\\approx0.995$$","src":"2026 北大光华 431 统计真题","a2":"💡巧解（协方差定义直接算）：$\\mathrm{Cov}(X,Y)=E(XY)-E(X)E(Y)$。由 $Y=X+Z$ 与 $X,Z$ 独立：\n$$E(XY)=E(X^2+XZ)=E(X^2)+E(X)E(Z)=\\frac13+\\frac12\\cdot\\frac1{20}=\\frac{43}{120}$$\n$E(X)=\\frac12$，$E(Y)=\\frac12+\\frac1{20}=\\frac{11}{20}$，故 $\\mathrm{Cov}=\\frac{43}{120}-\\frac12\\cdot\\frac{11}{20}=\\frac{10}{120}=\\frac1{12}$，与协方差线性性结果一致。"},
    "nc07": {"q":"设随机变量 $X$ 与 $Y$ 的相关系数为 $0.5$，且 $E(X)=E(Y)=0$，$E(X^{2})=E(Y^{2})=2$。求 $E[(X+Y)^{2}]$","a":"由 $E(X)=E(Y)=0$，$D(X)=E(X^{2})=2$，$D(Y)=2$。$\\mathrm{Cov}(X,Y)=\\rho\\sqrt{D(X)D(Y)}=0.5\\times2=1$，且 $E(XY)=\\mathrm{Cov}(X,Y)+E(X)E(Y)=1$。\n$$E[(X+Y)^{2}]=E(X^{2})+E(Y^{2})+2E(XY)=2+2+2=6$$","src":"考研数学真题（相关系数）"},
    "nc08": {"q":"设随机变量 $X$ 的概率密度为 $f(x)=6x(1-x),\\ 0<x<1$，则 $X$ 的三阶中心矩 $E(X-EX)^{3}=$（  ）\\\\\nA. $-\\frac1{32}$　B. 0　C. $\\frac1{10}$　D. $\\frac12$","a":"$E(X)=\\int_0^1 6x^{2}(1-x)\\,dx=6\\left(\\frac13-\\frac14\\right)=\\frac12$，且密度 $f(x)$ 关于 $x=\\frac12$ 对称。\n三阶中心矩 $\\mu_3=E[(X-\\frac12)^{3}]$，而 $(x-\\frac12)^{3}$ 为关于 $x=\\frac12$ 的奇函数，故\n$$E(X-EX)^{3}=0$$\n选 B。","src":"2024 考研数学三真题"},
    "nc09": {"q":"设随机变量 $X$ 服从参数为 $2$ 的泊松分布，用切比雪夫不等式估计 $P\\{|X-2|\\ge2\\}$ 的上界","a":"泊松分布 $E(X)=D(X)=\\lambda=2$。\n$$P\\{|X-2|\\ge2\\}\\le\\frac{D(X)}{2^{2}}=\\frac{2}{4}=\\frac12$$","src":"考研数学真题（切比雪夫不等式）","a2":"💡巧解（精确计算对比）：泊松分布可直接精确算出\n$$P\\{|X-2|\\ge2\\}=1-P(X=1)-P(X=2)-P(X=3)=1-\\frac{16}{3}e^{-2}\\approx0.278$$\n可见切比雪夫上界 $\\tfrac12$ 较为宽松。"},
    "nc10": [{"q":"设 $(X_1,\\dots,X_n)$ 服从 $n$ 维正态分布。证明：各分量相互独立的充要条件是它们两两互不相关","a":"独立 $\\Rightarrow$ 不相关显然。反之，若两两不相关，则协方差矩阵 $\\Sigma$ 为对角阵，其逆 $\\Sigma^{-1}$ 亦为对角阵，联合密度 $f(\\mathbf{x})$ 的二次型中不含交叉项，可分解为各边缘正态密度之积，故各分量相互独立。","src":"2013 年人大 805 统计学真题"},{"q":"对于两个都只取两个值的随机变量 $X,Y$，证明：$X$ 与 $Y$ 相互独立当且仅当它们不相关","a":"独立 $\\Rightarrow$ 不相关显然。反之，设 $X\\in\\{x_1,x_2\\}$、$Y\\in\\{y_1,y_2\\}$，记示性函数 $I_X=\\dfrac{X-x_1}{x_2-x_1}$、$I_Y=\\dfrac{Y-y_1}{y_2-y_1}$。$X,Y$ 都是其示性变量的线性函数，故 $\\mathrm{Cov}(X,Y)=0\\Rightarrow\\mathrm{Cov}(I_X,I_Y)=0\\Rightarrow P(X=x_2,Y=y_2)=P(X=x_2)P(Y=y_2)$；其余三种组合同理成立，故 $X,Y$ 独立。","src":"2016 复旦大学 432 统计学真题"}],
    "nc11": {"q":"设 $X,Y$ 为两个相关的随机变量且二阶矩存在。验证条件方差分解公式 $\\mathrm{Var}(Y)=E[\\mathrm{Var}(Y\\,|\\,X)]+\\mathrm{Var}[E(Y\\,|\\,X)]$，并说明其含义","a":"由全期望公式 $E(Y)=E[E(Y|X)]$、$E(Y^{2})=E[E(Y^{2}|X)]$：\n$$E[\\mathrm{Var}(Y|X)]=E\\{E(Y^{2}|X)-[E(Y|X)]^{2}\\}=E(Y^{2})-E\\{[E(Y|X)]^{2}\\}$$\n$$\\mathrm{Var}[E(Y|X)]=E\\{[E(Y|X)]^{2}\\}-[E(Y)]^{2}$$\n两式相加得 $\\mathrm{Var}(Y)=E(Y^{2})-[E(Y)]^{2}$。含义：总方差 = 组内（条件）方差的期望 + 组间（条件期望的）方差。","src":"2013 年人大 805 统计学真题"},
    "nc12": {"q":"设 $X\\sim N(-1,1)$，$Y\\sim N(1,2)$，若 $X$ 与 $X+2Y$ 不相关，则 $X$ 与 $X-Y$ 的相关系数为（  ）\\\\\nA. $\\frac13$　B. $\\frac12$　C. $\\frac23$　D. $\\frac34$","a":"由协方差的线性性（双线性）：\n$$\\mathrm{Cov}(X,X+2Y)=D(X)+2\\mathrm{Cov}(X,Y)=0\\ \\Rightarrow\\ \\mathrm{Cov}(X,Y)=-\\frac12$$\n$$\\mathrm{Cov}(X,X-Y)=D(X)-\\mathrm{Cov}(X,Y)=1+\\frac12=\\frac32$$\n$$D(X-Y)=D(X)+D(Y)-2\\mathrm{Cov}(X,Y)=1+2+1=4$$\n$$\\rho(X,X-Y)=\\frac{3/2}{\\sqrt{1\\times4}}=\\frac34$$\n选 D。","src":"2025 考研数学三真题"},
    "nc13": {"q":"求二项分布、$(a,b)$ 上均匀分布、伽马分布的期望和方差","a":"二项分布 $B(n,p)$：$E=np$，$D=np(1-p)$；\n均匀分布 $U(a,b)$：$E=\\dfrac{a+b}{2}$，$D=\\dfrac{(b-a)^{2}}{12}$；\n伽马分布 $Ga(\\alpha,\\lambda)$（密度 $f(x)=\\frac{\\lambda^{\\alpha}}{\\Gamma(\\alpha)}x^{\\alpha-1}e^{-\\lambda x}$）：$E=\\dfrac{\\alpha}{\\lambda}$，$D=\\dfrac{\\alpha}{\\lambda^{2}}$。","src":"2018 复旦大学 432 统计学真题"},
    "nc14": {"q":"设 $Y$ 是非负随机变量，且 $0<Var(Y)<\\infty$，证明：$P(Y>0)\\ge\\dfrac{(EY)^{2}}{E(Y^{2})}$","a":"对 $Y\\cdot I\\{Y>0\\}$ 用柯西-施瓦茨不等式：\n$$EY=E[Y\\cdot I\\{Y>0\\}]\\le\\sqrt{E(Y^{2})}\\cdot\\sqrt{E[I\\{Y>0\\}^{2}]}=\\sqrt{E(Y^{2})\\,P(Y>0)}$$\n两边平方即得\n$$P(Y>0)\\ge\\frac{(EY)^{2}}{E(Y^{2})}$$\n（恰为马尔可夫型（帕莱-齐格蒙德）不等式的变形。）","src":"2023 复旦大学 432 统计学真题"},
    "nc15": {"q":"设 $X\\sim N(\\mu,\\sigma^{2})$，求 $X$ 的特征函数","a":"由特征函数定义 $\\varphi(t)=E(e^{itX})$，对正态密度直接积分（指数配方）得\n$$\\varphi(t)=e^{i\\mu t-\\frac{\\sigma^{2}t^{2}}{2}}$$\n特例：$X\\sim N(0,1)$ 时 $\\varphi(t)=e^{-t^{2}/2}$。","src":"2022 南开大学 432 统计学真题"},
    "nc16": {"q":"设 $X$ 是标准正态随机变量，对 $t\\in\\mathbb{R}$ 定义 $g(x)=e^{tx}$。(1) 计算 $E(g(X))$；(2) 证明 $E(Xg(X))=E(g'(X))$","a":"(1) 由矩母函数定义 $M(t)=E(e^{tX})$，对 $X\\sim N(0,1)$ 指数配方：\n$$E(g(X))=E(e^{tX})=\\int_{-\\infty}^{\\infty}\\frac1{\\sqrt{2\\pi}}e^{tx-x^{2}/2}\\,dx=e^{t^{2}/2}$$\n(2) 对 $t$ 求导（或直接计算）：\n$$E(Xe^{tX})=\\frac{d}{dt}E(e^{tX})=\\frac{d}{dt}e^{t^{2}/2}=t\\,e^{t^{2}/2}=E(t\\,e^{tX})=E(g'(X))$$\n即 Stein 引理 $E[Xg(X)]=E[g'(X)]$ 在 $g(x)=e^{tx}$ 情形的验证。","src":"2024 中国科学技术大学 812 概率论与数理统计真题"},
    "ll01": {"q":"设独立随机变量序列满足 $P(\\xi_n=\\pm n^{\\delta})=\\frac12$。(1) 给出 $\\{\\xi_n\\}$ 服从大数定律的充要条件（即 $\\delta$ 的范围）；(2) 证明结论","a":"(1) 充要条件：$\\delta<\\frac12$。\n(2) $E(\\xi_n)=0$，$Var(\\xi_n)=n^{2\\delta}$。由马尔可夫条件（切比雪夫大数定律的一般形式），\n$$\\sum_{n=1}^{\\infty}\\frac{Var(\\xi_n)}{n^{2}}=\\sum_{n=1}^{\\infty}n^{2\\delta-2}$$\n收敛当且仅当 $2\\delta-2<-1$，即 $\\delta<\\frac12$。此时 $\\frac1n\\sum_{i=1}^{n}\\xi_i\\overset{P}{\\longrightarrow}0$（服从大数定律）；当 $\\delta\\ge\\frac12$ 时级数发散，大数定律不成立。","src":"2024 复旦大学 432 统计学真题"},
    "ll02": {"q":"设 $X_1,X_2,\\dots$ 是 i.i.d. 的二阶矩存在的随机变量，$Y_n=\\sum_{i=1}^{n}X_i$。问 $\\left\\{\\dfrac{Y_n}{n^{2}}\\right\\}$ 是否服从大数定律？","a":"服从。由辛钦大数定律（二阶矩存在故期望存在），$\\dfrac{Y_n}{n}\\overset{P}{\\longrightarrow}E(X_1)$（实际上几乎必然收敛），于是\n$$\\frac{Y_n}{n^{2}}=\\frac1n\\cdot\\frac{Y_n}{n}\\overset{P}{\\longrightarrow}0\\cdot E(X_1)=0$$\n即 $\\left\\{\\frac{Y_n}{n^{2}}\\right\\}$ 依概率收敛于常数 $0$，服从大数定律。","src":"2022 复旦大学 432 统计学真题"},
    "ll03": {"q":"设 $X_1,X_2,\\dots,X_n$ i.i.d. $\\sim F(x)$，记 $Y_n(x)=\\sum_{i=1}^{n}I\\{X_i\\le x\\}$，求 $\\lim_{n\\to\\infty}\\dfrac{Y_n(x)}{n}$","a":"对固定的 $x$，$I\\{X_i\\le x\\}$ 为 i.i.d. 的 0-1 变量（伯努利试验），$P(I\\{X_i\\le x\\}=1)=F(x)$。由伯努利大数定律（频率依概率收敛于概率）：\n$$\\frac{Y_n(x)}{n}\\ \\overset{P}{\\longrightarrow}\\ F(x)$$\n即经验分布函数依概率收敛于总体分布函数（格里文科定理的逐点版本）。","src":"2017 复旦大学 432 统计学真题"},
    "ll04": {"q":"某单位有 200 台电话分机，每台分机有 5% 的时间要使用外线，且各分机是否使用外线相互独立。问总机至少需装多少条外线，才能以 90% 的概率保证分机使用外线时不需等候（$z_{0.10}=1.28$）","a":"设使用外线的分机数 $X\\sim B(200,0.05)$，$E(X)=10$，$D(X)=9.5$。由中心极限定理，$\\dfrac{X-10}{\\sqrt{9.5}}$ 近似 $N(0,1)$。设需 $m$ 条外线，要求\n$$P(X\\le m)\\approx\\Phi\\left(\\frac{m-10}{\\sqrt{9.5}}\\right)\\ge0.90\\Rightarrow\\frac{m-10}{\\sqrt{9.5}}\\ge1.28\\Rightarrow m\\ge13.95$$\n故至少需装 $14$ 条外线。","src":"考研数学真题（中心极限定理）","a2":"💡巧解（泊松近似）：$n=200$ 大、$p=0.05$ 小、$np=10$，由泊松定理 $X\\ \\dot\\sim\\ P(10)$。查表 $P(X\\le13)=0.8645<0.90$，$P(X\\le14)=0.9165\\ge0.90$，故同样得至少 $14$ 条外线，与正态近似一致。"},
    "ll05": {"q":"某调查员调查该地区成年人中购买某商品的比率 $\\theta$，随机调查 $n$ 个顾客（$n$ 较大），购买记为 $x_i=1$，否则 $x_i=0$。求样本比例 $\\bar{x}$ 的近似分布","a":"设 $X=\\sum_{i=1}^n x_i\\sim B(n,\\theta)$，由棣莫弗-拉普拉斯中心极限定理，当 $n$ 充分大时\n$$\\frac{\\bar x-\\theta}{\\sqrt{\\theta(1-\\theta)/n}}=\\frac{X-n\\theta}{\\sqrt{n\\theta(1-\\theta)}}\\ \\overset{d}{\\longrightarrow}\\ N(0,1)$$\n即 $\\bar{x}\\ \\dot\\sim\\ N\\left(\\theta,\\ \\dfrac{\\theta(1-\\theta)}{n}\\right)$。","src":"2020 北大光华 431 统计真题"},
    "ll06": {"q":"举出一个期望趋于正无穷，却依概率收敛到 0 的随机变量序列 $\\{X_n\\}$","a":"取 $X_n=\\begin{cases}n^{2},& \\text{概率 }\\frac1n\\\\ 0,& \\text{概率 }1-\\frac1n\\end{cases}$。则\n$$E(X_n)=n^{2}\\cdot\\frac1n+0\\cdot\\left(1-\\frac1n\\right)=n\\to+\\infty$$\n而对任意 $\\varepsilon>0$，$P(|X_n-0|\\ge\\varepsilon)=P(X_n=n^{2})=\\frac1n\\to0$，故 $X_n\\overset{P}{\\longrightarrow}0$。\n这说明“期望趋于无穷”与“依概率收敛”刻画的是不同层面的性质（大数定律研究收敛性，与期望的大小无必然关系）。","src":"2020 复旦大学 432 统计学真题"},
    "ll07": {"q":"设 $X\\sim P(\\lambda)$，以下判断正确的是（  ）\\\\\nA. $P(X>2\\lambda)\\le1-\\frac1\\lambda$　B. $P(X>2\\lambda)\\le\\frac1\\lambda$\\\\\nC. $P(X>2\\lambda)\\ge\\frac1\\lambda$　D. $P(X>2\\lambda)\\ge1-\\frac1\\lambda$","a":"选 B。泊松分布 $E(X)=D(X)=\\lambda$，由切比雪夫不等式（只需方差存在即可估计概率上界）：\n$$P(X>2\\lambda)=P(X-\\lambda>\\lambda)\\le P(|X-\\lambda|>\\lambda)\\le\\frac{D(X)}{\\lambda^{2}}=\\frac1\\lambda$$","src":"2023 上海财经大学 432 统计学真题"},
    "sm01": {"q":"调查镜片的曲率，据调查 500 个镜片的平均曲率为 0.5。则调查的总体是（  ）\\\\\nA. 抽查的 500 个镜片　B. 最近 500 个镜片\\\\\nC. 今天销售的所有镜片　D. 该厂生产的所有镜片","a":"选 D。总体是研究对象的全体（该厂生产的所有镜片的曲率），样本是其中被抽取观测的 500 个镜片；样本是总体的一个子集，二者不可混淆。","src":"2023 上海财经大学 432 统计学真题"},
    "sm02": {"q":"根据沪深 300 指数 2020 年和 2023 年的年化日指数收益率：2020 年 $n_1=244$，均值 $26.5\\%$，标准差 $22.3\\%$；2023 年 $n_2=242$，均值 $-11.2\\%$，标准差 $10.1\\%$。将这两年的样本合并，求合并后的均值、标准差","a":"合并均值（按样本量加权）：\n$$\\bar{x}=\\frac{n_1\\bar{x}_1+n_2\\bar{x}_2}{n_1+n_2}=\\frac{244\\times0.265+242\\times(-0.112)}{486}\\approx0.077=7.7\\%$$\n合并标准差：$s^{2}=\\dfrac{(n_1-1)s_1^{2}+(n_2-1)s_2^{2}+n_1(\\bar{x}_1-\\bar{x})^{2}+n_2(\\bar{x}_2-\\bar{x})^{2}}{n_1+n_2-1}\\approx0.0656$，故 $s\\approx0.256=25.6\\%$。","src":"2025 北大光华 431 统计真题"},
    "sm03": {"q":"名词解释：样本均值、样本方差","a":"样本均值 $\\bar{X}=\\dfrac1n\\sum_{i=1}^{n}X_i$——样本观测值的算术平均，是总体均值 $\\mu$ 的估计；\n样本方差 $S^{2}=\\dfrac{1}{n-1}\\sum_{i=1}^{n}(X_i-\\bar{X})^{2}$——用 $n-1$ 作分母（自由度修正）使其成为总体方差 $\\sigma^{2}$ 的无偏估计：$E(S^{2})=\\sigma^{2}$。","src":"2017 复旦大学 432 统计学真题"},
    "sm04": {"q":"某校学生的成绩服从正态分布 $X\\sim N(\\mu,36)$，在显著性水平 $\\alpha=0.05$ 下，要使估计 $\\mu$ 的测量误差控制在 $\\pm1$ 之内，需要多大的样本量（  ）\\\\\nA. 139　B. 2238　C. 48　D. 934","a":"由 $\\bar{X}\\sim N(\\mu,\\frac{36}{n})$，误差 $\\pm1$ 对应置信区间半宽 $z_{0.025}\\dfrac{6}{\\sqrt n}=1$：\n$$\\sqrt n=1.96\\times6=11.76\\ \\Rightarrow\\ n\\approx138.3$$\n向上取整得 $n=139$，选 A。","src":"2016 北京师范大学 432 统计学真题"},
    "sm05": {"q":"设 $X_1,\\dots,X_n$ 独立同分布于 $N(\\mu,\\sigma^2)$，$F$ 为其分布函数。求 $-2\\sum_{i=1}^{n}\\ln F(X_i)$ 的分布","a":"连续型随机变量经分布函数变换后均匀：$F(X_i)\\sim U(0,1)$。又 $-2\\ln U\\sim\\chi^2(2)$，故\n$$-2\\ln F(X_i)\\sim\\chi^2(2),\\qquad -2\\sum_{i=1}^{n}\\ln F(X_i)\\sim\\chi^2(2n)$$","src":"2022 复旦大学 432 统计学真题"},
    "sm06": {"q":"设 $X_1,\\dots,X_{2n}$ 为来自总体 $X\\sim N(\\mu,\\sigma^2)$ 的样本，$\\bar X$ 为样本均值。求 $E\\left[\\sum_{i=1}^{n}\\left(X_i+X_{n+i}-2\\bar X\\right)^2\\right]$","a":"令 $Y_i=X_i+X_{n+i}$，则 $Y_1,\\dots,Y_n$ 独立同分布于 $N(2\\mu,2\\sigma^2)$，且 $\\bar Y=\\frac1n\\sum_{i=1}^n Y_i=2\\bar X$。于是\n$$\\sum_{i=1}^{n}\\left(X_i+X_{n+i}-2\\bar X\\right)^2=\\sum_{i=1}^{n}(Y_i-\\bar Y)^2=(n-1)S_Y^2$$\n由 $E\\left[(n-1)S_Y^2\\right]=(n-1)\\cdot(2\\sigma^2)$，得所求期望为 $2(n-1)\\sigma^2$。","src":"2016 复旦大学 432 统计学真题"},
    "sm07": {"q":"设 $X_1,\\dots,X_n\\overset{iid}{\\sim}N(0,1)$，$S^2$ 为样本方差。求统计量 $T=\\dfrac{\\sqrt n\\,\\bar X}{S}$ 的分布","a":"$\\bar X\\sim N(0,\\frac1n)$，故 $\\sqrt n\\,\\bar X\\sim N(0,1)$；又 $\\dfrac{(n-1)S^2}{1}\\sim\\chi^2(n-1)$ 且与 $\\bar X$ 独立。由 $t$ 分布定义：\n$$T=\\frac{\\sqrt n\\,\\bar X}{S}=\\frac{\\sqrt n\\,\\bar X}{\\sqrt{\\dfrac{(n-1)S^2}{n-1}}}\\sim t(n-1)$$","src":"2025 北大光华 431 统计真题"},
    "sm08": {"q":"随机变量 $X\\sim F(n,n)$，求 $P(X<1)$","a":"若 $X\\sim F(n,n)$，则 $\\dfrac1X\\sim F(n,n)$（分子分母自由度互换后仍同分布），故\n$$P(X<1)=P\\left(\\frac1X>1\\right)=P(X>1)$$\n又 $P(X<1)+P(X>1)=1$（$X>0$），因此 $P(X<1)=\\dfrac12$。","src":"2017 南开大学 432 统计学真题"},
    "sm09": {"q":"$X_1,\\dots,X_n$ 为来自正态分布 $N(\\mu,1)$ 的简单随机样本。记 $z_{\\alpha}$ 为标准正态分布的 $100\\alpha\\%$ 分位数，则由此样本所构造的置信水平分别为 95% 与 90% 的双侧置信区间长度之比为（  ）","a":"$N(\\mu,1)$ 的\\textbf{单均值}（$\\sigma=1$ 已知）双侧置信区间长度为 $2z_{\\alpha/2}\\cdot\\dfrac{1}{\\sqrt n}$。\n95% 区间长 $=\\dfrac{2z_{0.975}}{\\sqrt n}$，90% 区间长 $=\\dfrac{2z_{0.95}}{\\sqrt n}$，故两者之比为\n$$\\frac{2z_{0.975}/\\sqrt n}{2z_{0.95}/\\sqrt n}=\\frac{z_{0.975}}{z_{0.95}}$$\n即选项 B。关键：区间长度比仅由分位数决定，与样本量 $n$ 无关。","src":"2016 中山大学 432 统计学真题"},
    "sm10": {"q":"下列关于统计学常用分布的判断中，错误的是（  ）\\\\\nA. 若 $Z\\sim F(n_1,n_2)$，则 $\\frac1Z\\sim F(n_2,n_1)$\\\\\nB. 若 $T\\sim t(n)$，则 $T^{2}\\sim F(1,n)$\\\\\nC. 若 $X\\sim N(0,1)$，则 $X^{2}\\sim\\chi^{2}(1)$\\\\\nD. 若 $X\\sim N(0,1)$，$Y\\sim\\chi^{2}(n)$，则 $\\frac{X}{Y}\\sim t(n)$","a":"选 D。$t$ 分布的定义要求 $\\dfrac{X}{\\sqrt{Y/n}}\\sim t(n)$（需 $X,Y$ 独立且 $Y$ 除以自由度后开方），而不是 $X/Y$。A、B、C 均正确：\n$$F(n_1,n_2)\\ \\text{的倒数}\\ \\sim F(n_2,n_1);\\qquad T\\sim t(n)\\Rightarrow T^{2}\\sim F(1,n);\\qquad N(0,1)^{2}\\sim\\chi^{2}(1)$$","src":"2020 中山大学 432 统计学真题"},
    "sm11": {"q":"设有来自方差为 $\\sigma^{2}$ 的总体的随机样本 $X_1,\\dots,X_n$，定义样本均值 $\\bar X$，则 $Var(X_1-\\bar X)=$（  ）","a":"$Var(\\bar X)=\\dfrac{\\sigma^{2}}{n}$，且 $Cov(X_1,\\bar X)=\\dfrac{1}{n}Cov(X_1,X_1)=\\dfrac{\\sigma^{2}}{n}$，故\n$$Var(X_1-\\bar X)=Var(X_1)+Var(\\bar X)-2Cov(X_1,\\bar X)=\\sigma^{2}+\\frac{\\sigma^{2}}{n}-2\\frac{\\sigma^{2}}{n}=\\frac{n-1}{n}\\sigma^{2}$$\n选 D。核心：样本均值是各 $X_i$ 的线性组合，$Cov(X_i,\\bar X)=\\sigma^{2}/n$、$Var(\\bar X)=\\sigma^{2}/n$。","src":"2017 北京师范大学 432 统计学真题"},
    "est01": {"q":"下列说法正确的是（  ）\\\\\nA. 样本量的增加可以提高检验的显著水平\\\\\nB. 经验分布函数是单调增函数\\\\\nC. 样本容量越大，样本方差越小\\\\\nD. 统计量是样本的函数","a":"选 D（官方答案 D 或 BD）。统计量是根据样本数据计算得到的量，是样本的函数，这是点估计的基础（用统计量 $\\hat\\theta(X_1,\\dots,X_n)$ 估计总体参数）。\nA 错：样本量增大提高的是检验功效，显著性水平由研究者设定；C 错：方差反映数据的离散程度，不随样本量必然减小；B 有歧义：经验分布函数为非减右连续函数。","src":"2025 北大光华 431 统计真题"},
    "est02": {"q":"$X_1,\\dots,X_n$ 为总体分布的简单随机样本，下列是总体均值 $\\mu$ 的无偏估计的有（  ）（不定项）\\\\\nA. $X_1$　B. $\\bar{X}$　C. $X_1-X_2+X_n$　D. $10X_1-9X_n$","a":"无偏性要求 $E(\\hat\\theta)=\\mu$：\nA：$E(X_1)=\\mu$ ✓；B：$E(\\bar X)=\\mu$ ✓；C：$E(X_1-X_2+X_n)=\\mu-\\mu+\\mu=\\mu$ ✓；D：$E(10X_1-9X_n)=10\\mu-9\\mu=\\mu$ ✓。\n故 A、B、C、D 均为 $\\mu$ 的无偏估计（线性无偏估计中系数之和为 1 即可）。","src":"2025 北大光华 431 统计真题"},
    "est03": [{"q":"设 $X_1,\\dots,X_n$ i.i.d. $\\sim N(\\mu,\\sigma^{2})$，$\\mu$ 已知。证明：(1) $\\dfrac1n\\sum_{i=1}^{n}(X_i-\\mu)^{2}$ 是 $\\sigma^{2}$ 的有效估计；(2) $\\dfrac1n\\sqrt{\\dfrac{\\pi}{2}}\\sum_{i=1}^{n}|X_i-\\mu|$ 是 $\\sigma$ 的无偏估计但不有效","a":"(1) 令 $Z_i=(X_i-\\mu)/\\sigma\\sim N(0,1)$，$\\hat\\sigma_1^{2}=\\frac{\\sigma^{2}}{n}\\sum Z_i^{2}$。$E(\\hat\\sigma_1^{2})=\\sigma^{2}$，$Var(\\hat\\sigma_1^{2})=\\frac{\\sigma^{4}}{n^{2}}\\cdot 2n=\\frac{2\\sigma^{4}}{n}$，达到 C-R 下界 $\\frac{2\\sigma^{4}}{n}$，故有效。\n(2) $E|Z_i|=\\sqrt{\\frac2\\pi}$，故 $E\\left[\\frac1n\\sqrt{\\frac\\pi2}\\sum|X_i-\\mu|\\right]=\\sqrt{\\frac\\pi2}\\cdot\\sigma\\sqrt{\\frac2\\pi}=\\sigma$ 无偏；但其方差大于 C-R 下界，故不有效。","src":"2019 复旦大学 432 统计学真题"},{"q":"对于下述两个命题：命题 A：$\\hat\\theta$ 是 $\\theta$ 的有效估计；命题 B：$\\hat\\theta$ 是 $\\theta$ 的 UMVUE。下列结论正确的是（  ）","a":"有效估计 = 无偏且\\textbf{方差达到 C-R 下界}的估计量，故其方差在所有无偏估计中最小 $\\Rightarrow$ 必为 UMVUE，即 $A\\Rightarrow B$。\n反之，UMVUE 方差最小但不一定达到 C-R 下界（可因信息量未充分利用或非正则情形），故 $B\\not\\Rightarrow A$。选 (b) $A\\Rightarrow B,\\ B\\not\\Rightarrow A$。","src":"2021 南开大学 432 统计学真题"}],
    "est04": {"q":"有来自二阶矩存在总体 $X$ 的随机样本 $X_1,\\dots,X_n$，设 $S^{2}=\\frac{1}{n-1}\\sum(X_i-\\bar{X})^{2}$，则 $S$ 一定是总体标准差 $\\sigma$ 的（  ）\\\\\nA. UMVUE　B. 相合估计　C. 无偏估计　D. MLE","a":"选 B。$S^{2}$ 是 $\\sigma^{2}$ 的相合估计（$S^{2}\\overset{P}{\\to}\\sigma^{2}$），由相合性的连续性（$g$ 连续时 $g(\\hat\\theta_n)\\overset{P}{\\to}g(\\theta)$），$S=\\sqrt{S^{2}}$ 是 $\\sigma$ 的相合估计。但一般 $E(S)\\ne\\sigma$（不是无偏的），也不一定是 UMVUE 或 MLE。","src":"2016 南开大学 432 统计学真题"},
    "est05": [{"q":"设 $Y_1,\\dots,Y_n$ 独立同分布，密度 $f(y;\\theta)=\\dfrac1\\theta\\ (0\\le y\\le\\theta)$，$\\theta>0$ 未知。求 $\\theta$ 的矩估计量，并计算其均方误差（MSE）","a":"$E(Y)=\\dfrac\\theta2$，令 $\\bar Y=\\dfrac\\theta2$，得矩估计 $\\hat\\theta_1=2\\bar Y$。\n$E(\\hat\\theta_1)=2E(\\bar Y)=\\theta$（无偏），$D(\\hat\\theta_1)=4D(\\bar Y)=\\dfrac4n\\cdot\\dfrac{\\theta^{2}}{12}=\\dfrac{\\theta^{2}}{3n}$。\n$$\\mathrm{MSE}(\\hat\\theta_1)=D(\\hat\\theta_1)=\\dfrac{\\theta^{2}}{3n}$$","src":"2021 复旦大学 861 概率论与数理统计真题","a2":"💡巧解（二阶矩法）：$E(Y^2)=\\dfrac{\\theta^2}{3}$，令样本二阶矩 $\\dfrac1n\\sum Y_i^2=\\dfrac{\\theta^2}{3}$，得另一矩估计 $\\hat\\theta=\\sqrt{\\dfrac3n\\sum Y_i^2}$，说明矩估计随所取矩的阶数不同而不同、不唯一。"},{"q":"设 $X_1,\\dots,X_n$ 来自总体 $X\\sim f(x)=\\theta x^{\\theta-1}\\,I\\{0<x<1\\}$，求 $\\theta$ 的矩估计","a":"$E(X)=\\int_0^1 x\\cdot\\theta x^{\\theta-1}\\,dx=\\frac{\\theta}{\\theta+1}$。令样本一阶矩等于总体一阶矩：\n$$\\bar X=\\frac{\\theta}{\\theta+1}\\ \\Rightarrow\\ \\hat\\theta_{M}=\\frac{\\bar X}{1-\\bar X}$$","src":"2020 复旦大学 432 统计学真题"}],
    "est06": [{"q":"设 $Y_1,\\dots,Y_n$ 独立同分布，密度 $f(y;\\theta)=\\dfrac1\\theta\\ (0\\le y\\le\\theta)$，$\\theta>0$ 未知。求 $\\theta$ 的最大似然估计量，并计算其 MSE","a":"似然 $L(\\theta)=\\prod_{i=1}^{n}\\dfrac1\\theta=\\dfrac1{\\theta^{n}}$（需 $0\\le y_i\\le\\theta$，即 $\\theta\\ge y_{(n)}$）。$L$ 关于 $\\theta$ 递减，故 $\\hat\\theta_2=Y_{(n)}=\\max_{1\\le i\\le n}Y_i$。\n$Y_{(n)}$ 的密度 $f(z)=\\dfrac{n z^{n-1}}{\\theta^{n}}\\ (0\\le z\\le\\theta)$，故 $E(Y_{(n)})=\\dfrac{n}{n+1}\\theta$，$E(Y_{(n)}^{2})=\\dfrac{n}{n+2}\\theta^{2}$。\n$$\\mathrm{MSE}(\\hat\\theta_2)=D+\\mathrm{Bias}^{2}=\\dfrac{n}{(n+2)(n+1)^{2}}\\theta^{2}+\\left(\\dfrac{\\theta}{n+1}\\right)^{2}=\\dfrac{2\\theta^{2}}{(n+1)(n+2)}$$","src":"2021 复旦大学 861 概率论与数理统计真题"},{"q":"设 $X_1,\\dots,X_n$ 来自总体 $X\\sim f(x)=\\theta x^{\\theta-1}\\,I\\{0<x<1\\}$。求 $\\theta$ 的 MLE 并验证无偏性","a":"似然 $L(\\theta)=\\prod_{i=1}^{n}\\theta x_i^{\\theta-1}=\\theta^{n}\\left(\\prod x_i\\right)^{\\theta-1}$，对数似然\n$$\\ln L=n\\ln\\theta+(\\theta-1)\\sum_{i=1}^{n}\\ln x_i\\ \\Rightarrow\\ \\frac{\\partial\\ln L}{\\partial\\theta}=\\frac{n}{\\theta}+\\sum\\ln x_i=0$$\n得 $\\hat\\theta_{MLE}=-\\dfrac{n}{\\sum_{i=1}^{n}\\ln X_i}$。\n无偏性：$-\\ln X\\sim Exp(\\theta)$，故 $-\\sum_{i=1}^{n}\\ln X_i\\sim\\Gamma(n,\\theta)$，$E\\!\\left(\\dfrac{n}{-\\sum\\ln X_i}\\right)=\\dfrac{n\\theta}{n-1}\\ne\\theta$，即 $\\hat\\theta_{MLE}$ 有偏（偏差随 $n$ 增大趋于 0）。","src":"2020 复旦大学 432 统计学真题"}],
    "est07": {"q":"以下关于区间估计的说法正确的是（  ）\\\\\nA. 区间估计是指用一个区间来估计总体参数的真值\\\\\nB. 区间估计是指用一个点来估计总体参数的真值\\\\\nC. 区间估计是指用一个区间来估计样本统计量的真值\\\\\nD. 区间估计是指用一个点来估计样本统计量的真值","a":"选 A。区间估计在点估计的基础上，给出包含未知总体参数真值的一个区间 $(\\hat\\theta_1,\\hat\\theta_2)$，并配以置信水平 $1-\\alpha$（$P(\\hat\\theta_1<\\theta<\\hat\\theta_2)=1-\\alpha$）；它估计的是总体参数而非样本统计量。","src":"2023 上海财经大学 432 统计学真题"},
    "est08": [{"q":"从正态总体 $X\\sim N(\\mu,\\sigma^{2})$ 中抽得容量 $n=36$ 的样本，总体标准差 $\\sigma=6$ 已知，样本均值 $\\bar{x}=50$。求 $\\mu$ 的 95% 置信区间（$z_{0.025}=1.96$）","a":"$$\\bar{x}\\pm z_{\\alpha/2}\\frac{\\sigma}{\\sqrt{n}}=50\\pm1.96\\cdot\\frac{6}{6}=50\\pm1.96=(48.04,\\ 51.96)$$","src":"2013 年中央财经 432 统计学真题"},{"q":"某股票 100 天的数据，年化对数收益率为 15%，标准差为 9%。(1) 求年化对数收益率 95% 的置信区间；(2) 若当前股价为 10 元，求股价 95% 的置信区间","a":"(1) $\\mu$ 的 95% 置信区间：$0.15\\pm1.96\\cdot\\dfrac{0.09}{\\sqrt{100}}=0.15\\pm0.01764=(0.13236,\\ 0.16764)$，即 $(13.24\\%,\\ 16.76\\%)$。\n(2) 未来股价 $P=10\\,e^{r}$（$r$ 为对数收益率），故股价区间为 $(10e^{0.1324},\\ 10e^{0.1676})\\approx(11.42,\\ 11.82)$ 元。","src":"2013 北大光华 431 统计真题"}],
    "est09": {"q":"为检验声波是否对心率有影响，对 9 位测试者测得有声波与无声波时的心率差 $d_i$（有声波－无声波）为 $6,7,-1,13,-5,13,6,2,4$。求心率差均值的 95% 置信区间（$t_{0.975}(8)=2.306$），并判断声波对心率是否有显著影响","a":"$\\bar d=\\frac{45}{9}=5$，$S_d^2=\\frac{280}{8}=35$（$S_d=\\sqrt{35}\\approx5.916$）。\n$$\\bar d\\pm t_{0.975}(8)\\frac{S_d}{\\sqrt n}=5\\pm2.306\\times\\frac{\\sqrt{35}}{3}\\approx5\\pm4.55=(0.45,\\ 9.55)$$\n区间不包含 $0$，故在 $\\alpha=0.05$ 下声波对心率有显著影响。","src":"2021 北大光华 431 统计真题"},
    "est10": {"q":"设 $X_1,\\dots,X_n$ 是 i.i.d. 的 $N(\\mu,\\sigma^{2})$，其中 $\\mu$ 已知、$\\sigma^{2}$ 未知。(1) 试用两种方法给出 $\\sigma^{2}$ 的置信区间；(2) 给出 $\\sigma^{4}$ 的置信区间","a":"(1) 方法一（用样本方差）：$\\dfrac{(n-1)S^{2}}{\\sigma^{2}}\\sim\\chi^{2}(n-1)$，得\n$$\\left(\\frac{(n-1)S^{2}}{\\chi^{2}_{\\alpha/2}(n-1)},\\ \\frac{(n-1)S^{2}}{\\chi^{2}_{1-\\alpha/2}(n-1)}\\right)$$\n方法二（$\\mu$ 已知）：$\\dfrac{\\sum_{i=1}^{n}(X_i-\\mu)^{2}}{\\sigma^{2}}\\sim\\chi^{2}(n)$，得\n$$\\left(\\frac{\\sum(X_i-\\mu)^{2}}{\\chi^{2}_{\\alpha/2}(n)},\\ \\frac{\\sum(X_i-\\mu)^{2}}{\\chi^{2}_{1-\\alpha/2}(n)}\\right)$$\n(2) 由 $a<\\sigma^{2}<b\\iff a^{2}<\\sigma^{4}<b^{2}$，将 (1) 中区间端点平方即可。","src":"2021 北京师范大学 432 统计学真题"},
    "est11": {"q":"设 $X_1,\\dots,X_n$ 是从正态总体 $N(\\mu,\\sigma^{2})$ 中抽出的随机样本，证明样本方差 $S^{2}$ 与样本均值 $\\bar X$ 相互独立","a":"令 $\\bar X=\\frac1n\\sum X_i$，$S^{2}=\\frac{1}{n-1}\\sum(X_i-\\bar X)^{2}$。取正交阵 $A$（第一行 $A_{1\\cdot}=\\frac{1}{\\sqrt n}(1,\\dots,1)$），作变换 $Z=AX$，则 $Z_1=\\sqrt n\\,\\bar X$，且 $\\sum_{i=1}^{n}Z_i^{2}=\\sum_{i=1}^{n}X_i^{2}=\\sum_{i=1}^{n}(X_i-\\bar X)^{2}+n\\bar X^{2}=(n-1)S^{2}+Z_1^{2}$。\n由 $X_i$ 独立正态 $\\Rightarrow$ 正交变换下 $Z_1,\\dots,Z_n$ 相互独立。而 $\\sum_{i=2}^{n}Z_i^{2}=(n-1)S^{2}$，故 $Z_1=\\sqrt n\\bar X$ 与 $S^{2}$ 独立。这是后续 $t$、$F$ 分布等抽样分布推导的根基。","src":"2017 中国科学技术大学 432 统计学真题"},
    "est12": {"q":"$X_1,\\dots,X_n$ 为 $F(X,\\theta)$ 的简单随机样本，下列说法正确的是（  ）（不定项）\\\\\nA. 似然函数是 $\\theta$ 的函数\\\\\nB. 似然函数是 $X_1,\\dots,X_n$ 的函数\\\\\nC. $g(\\theta)$ 的极大似然估计是 $g(\\hat\\theta)$，其中 $\\hat\\theta$ 为 $\\theta$ 的 MLE\\\\\nD. 最大似然估计是似然函数的最大值","a":"选 A、C。A：给定样本后 $L(\\theta)=\\prod f(x_i;\\theta)$ 是参数 $\\theta$ 的函数，正确；B 错（是 $\\theta$ 的函数而非样本的函数）；C：MLE 的不变性（$g$ 连续时 $\\widehat{g(\\theta)}=g(\\hat\\theta)$），正确；D 错：最大似然估计是使似然函数取最大值的参数 $\\theta$ 的值，而非似然函数的最大值本身。","src":"2025 北大光华 431 统计真题"},
    "est13": {"q":"有来自总体 $U(\\theta,2\\theta)$ 的随机样本 $X_1,\\dots,X_n$，求 $\\theta$ 的矩估计和 MLE，并验证无偏性和相合性","a":"矩估计：$E(X)=\\frac{3\\theta}{2}$，令 $\\bar X=\\frac{3\\theta}{2}$，得 $\\hat\\theta_M=\\frac{2}{3}\\bar X$。$E(\\hat\\theta_M)=\\theta$ 无偏；由辛钦大数定律 $\\bar X\\overset{P}{\\to}\\frac{3\\theta}{2}$，故 $\\hat\\theta_M\\overset{P}{\\to}\\theta$ 相合。\nMLE：$L(\\theta)=\\frac{1}{\\theta^{n}}$，约束 $\\theta\\le X_{(1)}\\le X_{(n)}\\le 2\\theta$，即 $\\frac{X_{(n)}}{2}\\le\\theta\\le X_{(1)}$。$L(\\theta)=\\theta^{-n}$ 关于 $\\theta$ 单调递减，故 $\\theta$ 取**最小值**时为 MLE，即 $\\hat\\theta_{MLE}=\\frac{X_{(n)}}{2}$。令 $Y_i=\\frac{X_i-\\theta}{\\theta}\\sim U(0,1)$，则 $Y_{(n)}\\sim\\mathrm{Beta}(n,1)$、$E(Y_{(n)})=\\frac{n}{n+1}$，故 $E(\\hat\\theta_{MLE})=\\frac{2n+1}{2n+2}\\theta\\ne\\theta$ 有偏（渐近无偏）；又 $Y_{(n)}\\overset{P}{\\to}1$ 即 $X_{(n)}\\overset{P}{\\to}2\\theta$，故 $\\hat\\theta_{MLE}\\overset{P}{\\to}\\theta$ 相合。","src":"2019 复旦大学 432 统计学真题"},
    "est14": {"q":"有来自总体 $N(\\mu,1)$ 的 $n$ 个随机样本 $X_1,\\dots,X_n$，证明：$\\bar{X}$ 是充分统计量","a":"样本联合密度\n$$f(x_1,\\dots,x_n;\\mu)=\\frac{1}{(2\\pi)^{n/2}}\\exp\\left\\{-\\frac{1}{2}\\sum_{i=1}^{n}(x_i-\\mu)^{2}\\right\\}$$\n分解为\n$$=\\underbrace{\\frac{1}{(2\\pi)^{n/2}}e^{-\\frac12\\sum(x_i-\\bar x)^{2}}}_{h(x)}\\cdot\\underbrace{e^{-\\frac{n}{2}(\\bar x-\\mu)^{2}}}_{g(\\bar x,\\,\\mu)}$$\n由因子分解定理，$\\bar{X}$ 是 $\\mu$ 的充分统计量（给定 $\\bar X$ 后样本的条件分布与 $\\mu$ 无关）。","src":"2021 复旦大学 432 统计学真题"},
    "est15": {"q":"设有来自 $U(-\\theta,\\theta)$ 的简单随机样本 $X_1,\\dots,X_n$（$\\theta>0$）。(1) 证明 $T=\\max\\{|X_1|,\\dots,|X_n|\\}$ 是 $\\theta$ 的充分统计量；(2) 求 $\\theta$ 的 MLE","a":"(1) 联合密度\n$$f(x_1,\\dots,x_n;\\theta)=\\frac{1}{(2\\theta)^{n}}\\prod_{i=1}^{n}I\\{|x_i|\\le\\theta\\}=\\underbrace{\\frac{1}{(2\\theta)^{n}}I\\{\\max|x_i|\\le\\theta\\}}_{g(T,\\theta)}\\cdot 1$$\n由因子分解定理，$T=\\max\\{|X_i|\\}$ 是 $\\theta$ 的充分统计量。\n(2) 似然 $\\frac{1}{(2\\theta)^n}$ 关于 $\\theta$ 递减且约束 $\\theta\\ge T$，故 $\\hat\\theta_{MLE}=T=\\max\\{|X_1|,\\dots,|X_n|\\}$。","src":"2024 复旦大学 432 统计学真题"},
    "est16": {"q":"$X_1,\\dots,X_n$ 是来自参数为 $\\lambda$ 的指数分布总体的随机样本（密度 $f(x)=\\lambda e^{-\\lambda x},\\ x>0$）。(1) 求 $G=2\\lambda\\sum_{i=1}^{n}X_i$ 的分布；(2) 基于枢轴量 $G$ 给出 $\\lambda$ 的 $1-\\alpha$ 置信水平的置信区间","a":"(1) $\\lambda X_i\\sim Exp(1)$，且 $2\\lambda X_i\\sim\\chi^{2}(2)$，故 $G=2\\lambda\\sum X_i\\sim\\chi^{2}(2n)$。\n(2) $G$ 为枢轴量（分布与 $\\lambda$ 无关）。由 $\\chi^{2}_{1-\\alpha/2}(2n)\\le G\\le\\chi^{2}_{\\alpha/2}(2n)$ 反解 $\\lambda$：\n$$\\frac{\\chi^{2}_{1-\\alpha/2}(2n)}{2\\sum X_i}\\le\\lambda\\le\\frac{\\chi^{2}_{\\alpha/2}(2n)}{2\\sum X_i}$$\n即 $\\lambda$ 的 $1-\\alpha$ 置信区间为 $\\left(\\dfrac{\\chi^{2}_{1-\\alpha/2}(2n)}{2\\sum X_i},\\ \\dfrac{\\chi^{2}_{\\alpha/2}(2n)}{2\\sum X_i}\\right)$。","src":"2020 复旦大学 861 概率论与数理统计真题"},
    "est17": {"q":"设总体 $X\\sim N(\\mu_1,\\sigma_0^{2})$、$Y\\sim N(\\mu_2,\\sigma_1^{2})$ 相互独立，$\\sigma_0^{2}$ 已知，样本量分别为 $n_1,n_2$。若 $\\sigma_0^{2}=\\sigma_1^{2}$，写出 $\\mu_1-\\mu_2$ 的 $1-\\alpha$ 置信区间","a":"两均值差且\\textbf{方差异已知} $\\Rightarrow$ 用 $z$ 型枢轴量\n$$Z=\\frac{\\bar X-\\bar Y-(\\mu_1-\\mu_2)}{\\sqrt{\\sigma_0^{2}/n_1+\\sigma_1^{2}/n_2}}\\sim N(0,1)$$\n故 $\\mu_1-\\mu_2$ 的 $1-\\alpha$ 置信区间为\n$$\\bar X-\\bar Y\\pm z_{\\alpha/2}\\sqrt{\\frac{\\sigma_0^{2}}{n_1}+\\frac{\\sigma_1^{2}}{n_2}}=\\bar X-\\bar Y\\pm z_{\\alpha/2}\\,\\sigma_0\\sqrt{\\frac1{n_1}+\\frac1{n_2}}$$","src":"2017 上海交通大学 432 统计学真题"},
    "est18": [{"q":"设 $X_1,\\dots,X_n$ 与 $Y_1,\\dots,Y_m$ 分别是来自正态总体 $N(\\mu_x,\\sigma_x^{2})$ 与 $N(\\mu_y,\\sigma_y^{2})$ 的随机样本，当 $\\sigma_x,\\sigma_y$ 未知时，给出 $\\mu_x-\\mu_y$ 的 95% 置信区间","a":"方差未知（视为相等）时用合并方差 $S_p^{2}=\\dfrac{(n-1)S_x^{2}+(m-1)S_y^{2}}{n+m-2}$，枢轴量\n$$T=\\frac{\\bar X-\\bar Y-(\\mu_x-\\mu_y)}{S_p\\sqrt{\\frac1n+\\frac1m}}\\sim t(n+m-2)$$\n故 $\\mu_x-\\mu_y$ 的 95% 置信区间为\n$$\\bar X-\\bar Y\\pm t_{0.025}(n+m-2)\\,S_p\\sqrt{\\frac1n+\\frac1m}$$","src":"2002 北京大学光华 统计学真题"},{"q":"为估计两种方法组装产品所需时间的差异，分别给两种方法各随机安排 $12$ 名工人。方法一用时：$28.3,30.1,29.0,37.6,32.1,28.8,36.0,37.2,38.5,34.4,28.0,30.0$；方法二用时：$27.6,22.2,31.0,33.8,20.0,30.2,31.7,26.0,32.0,31.2,33.4,26.5$。假定两组均服从正态分布且方差相等。(1) 以 95% 置信水平建立两种方法平均时间之差的置信区间；(2) 两种方法有无显著差别","a":"$\\bar x=32.5$，$\\sum(x-\\bar x)^{2}=175.96$；$\\bar y=28.8$，$\\sum(y-\\bar y)^{2}=212.94$。合并方差\n$$S_p^{2}=\\frac{175.96+212.94}{12+12-2}=17.68,\\qquad S_p\\approx4.205$$\n均值差 $\\bar x-\\bar y=3.7$，$S_p\\sqrt{\\frac1{12}+\\frac1{12}}=4.205\\sqrt{\\frac16}\\approx1.72$，$df=22$，$t_{0.025}(22)=2.074$。\n(1) 95% 置信区间：$3.7\\pm2.074\\times1.72=(0.14,\\ 7.26)$。\n(2) $t=\\dfrac{3.7}{1.72}=2.156>t_{0.025}(22)=2.074$，拒绝 $H_0:\\mu_1=\\mu_2$，认为两种方法组装时间有显著差别（方法一更慢）。","src":"2021 上海交通大学 432 统计学真题"}],
    "est19": {"q":"$X_1,\\dots,X_6$ 是来自 $N(0,\\sigma_1^{2})$ 的样本，$Y_1,\\dots,Y_9$ 是来自 $N(0,\\sigma_2^{2})$ 的独立样本，$\\sigma_1^{2},\\sigma_2^{2}$ 未知。已知 $\\sum_{i=1}^{6}X_i^{2}/\\sum_{j=1}^{9}Y_j^{2}=1.94$。在 $\\alpha=0.05$ 下检验 $H_0:\\sigma_1^{2}\\le\\sigma_2^{2}$ 对 $H_1:\\sigma_1^{2}>\\sigma_2^{2}$","a":"两总体\\textbf{方差比}用 $F$：$\\dfrac{\\sum X_i^{2}}{\\sigma_1^{2}}\\sim\\chi^{2}(6)$、$\\dfrac{\\sum Y_j^{2}}{\\sigma_2^{2}}\\sim\\chi^{2}(9)$，当 $\\sigma_1^{2}=\\sigma_2^{2}$ 时\n$$F=\\frac{\\sum X_i^{2}/6}{\\sum Y_j^{2}/9}=\\frac{1.94\\times9}{6}=2.91\\sim F(6,9)$$\n拒绝域 $F>F_{0.05}(6,9)$。由 $F$ 分布表 $F_{0.05}(6,9)\\approx3.37$，因 $2.91<3.37$，不拒绝 $H_0$，无充分证据表明 $\\sigma_1^{2}>\\sigma_2^{2}$。","src":"2017 中国科学技术大学 432 统计学真题"},
    "est20": {"q":"设有来自 $f(x;\\theta)=\\theta x^{\\theta-1}\\ (0<x<1)$ 的 i.i.d. 样本 $X_1,\\dots,X_n$。(1) 求 $g(\\theta)=\\frac1\\theta$ 的 MLE；(2) 该 MLE 是否为有效估计？","a":"(1) 由 $\\hat\\theta_{MLE}=-\\frac{n}{\\sum\\ln X_i}$ 及 MLE 的不变性，$\\hat g_{MLE}=\\dfrac1{\\hat\\theta_{MLE}}=-\\dfrac{\\sum_{i=1}^{n}\\ln X_i}{n}$。\n(2) 计算费希尔信息量：$\\ln f=\\ln\\theta+(\\theta-1)\\ln x$，$\\frac{\\partial\\ln f}{\\partial\\theta}=\\frac1\\theta+\\ln x$，而 $-\\ln X\\sim Exp(\\theta)$ 故 $E(\\ln X)=-\\frac1\\theta$、$Var(\\ln X)=\\frac{1}{\\theta^{2}}$，所以\n$$I(\\theta)=E\\left[\\left(\\frac1\\theta+\\ln X\\right)^{2}\\right]=Var(\\ln X)=\\frac{1}{\\theta^{2}}$$\n$E(\\hat g)=\\frac1\\theta$ 无偏，$Var(\\hat g)=\\frac{1}{n}Var(-\\ln X)=\\frac{1}{n\\theta^{2}}=\\dfrac{1}{nI(\\theta)}$ 达到 C-R 下界，故为有效估计。","src":"2023 复旦大学 432 统计学真题"},
    "est21": {"q":"叙述 C-R 不等式","a":"在正则条件下（$\\frac{\\partial}{\\partial\\theta}\\ln f(x;\\theta)$ 存在、积分与求导可交换等），设 $X_1,\\dots,X_n$ 为来自 $f(x;\\theta)$ 的样本，$\\hat\\theta$ 为 $\\theta$ 的任一无偏估计，则\n$$D(\\hat\\theta)\\ge\\frac{1}{n\\,I(\\theta)},\\qquad I(\\theta)=E\\left[\\left(\\frac{\\partial}{\\partial\\theta}\\ln f(X;\\theta)\\right)^{2}\\right]=-E\\left[\\frac{\\partial^{2}}{\\partial\\theta^{2}}\\ln f(X;\\theta)\\right]$$\n达到下界的无偏估计称为有效估计。","src":"2021 复旦大学 432 统计学真题"},
    "test01": [{"q":"设随机变量 $X$ 的概率密度为 $f(x;\\theta)=\\theta x^{\\theta-1}\\ (0<x<1)$，$X_1,X_2$ 为来自该总体的样本。考虑假设检验问题 $H_0:\\theta=1$ 对 $H_1:\\theta=2$，否定域 $W=\\{(X_1,X_2)\\,|\\,X_1X_2>\\frac34\\}$，求第一、二类错误的概率","a":"第一类错误（弃真）：$\\theta=1$ 时 $X\\sim U(0,1)$，\n$$\\alpha=P\\left(X_1X_2>\\frac34\\right)=\\int_{3/4}^{1}\\int_{3/(4x_1)}^{1}dx_2\\,dx_1=\\frac14+\\frac34\\ln\\frac34\\approx0.034$$\n第二类错误（取伪）：$\\theta=2$ 时 $f(x)=2x$，\n$$\\beta=P\\left(X_1X_2\\le\\frac34\\right)=\\int_0^{3/4}2x_1\\,dx_1+\\int_{3/4}^{1}\\frac{9}{8x_1}\\,dx_1=\\frac{9}{16}-\\frac98\\ln\\frac34\\approx0.886$$\n（小概率原理：$\\alpha$ 很小，样本落入否定域即拒绝 $H_0$。）","src":"2025 复旦大学 432 统计学真题"},{"q":"有来自总体 $P(\\theta)$（泊松）的 $n$ 个随机样本，考虑检验问题 $H_0:\\theta=2$ 对 $H_1:\\theta=3$，拒绝域 $W=\\{\\bar x\\ge2.8\\}$。(1) $n=5$ 时求两类错误的概率；(2) $n\\to\\infty$ 时两类错误将如何变化","a":"(1) 由泊松可加性 $\\sum_{i=1}^{n}X_i\\sim P(n\\theta)$。\n第一类错误（$\\theta=2$）：$\\alpha=P(\\bar X\\ge2.8\\,|\\,\\theta=2)=P(\\sum X_i\\ge14\\ |\\ \\sum X_i\\sim P(10))$；\n第二类错误（$\\theta=3$）：$\\beta=P(\\bar X<2.8\\,|\\,\\theta=3)=P(\\sum X_i\\le13\\ |\\ \\sum X_i\\sim P(15))$（用泊松分布表或递推求值，$\\bar X\\ge2.8\\iff\\sum X_i\\ge14$）。\n(2) 由大数定律 $\\bar X\\overset{P}{\\to}\\theta$，随 $n\\to\\infty$，$\\alpha\\to0$、$\\beta\\to0$（样本越大两类错误都趋于 0，二者的权衡随 $n$ 增大而消失）。","src":"2021 复旦大学 432 统计学真题"}],
    "test02": [{"q":"收集同一公司两个市场 A、B 的日回报率 $(x_1,\\dots,x_n)$、$(y_1,\\dots,y_n)$。请描述如何检验 A 的回报率是否比 B 的高","a":"同一公司同日的 A、B 市场回报构成配对数据，令 $d_i=x_i-y_i$。提出假设\n$$H_0:\\mu_d\\le0\\quad\\text{对}\\quad H_1:\\mu_d>0$$\n（把“欲证”的 A 比 B 高放在备择假设）。用配对 $t$ 检验：\n$$t=\\frac{\\bar d}{S_d/\\sqrt n}\\sim t(n-1)$$\n当 $t>t_{\\alpha}(n-1)$ 时拒绝 $H_0$，认为 A 市场回报率显著高于 B。","src":"2016 北京大学光华 431 统计真题"},{"q":"甲化肥是某厂研制的畅销款，现研制出改进品种乙化肥，为探究乙化肥是否优于甲化肥。第一组选取 $13$ 块稻田施甲化肥，亩产均值 $12.3$、样本方差 $10$；第二组选取 $11$ 块稻田施乙化肥，亩产均值 $14.4$、样本方差 $7.8$。假设亩产服从正态分布，在 $\\alpha=0.1$ 下：(1) 能否认为两组方差相等？(2) 能否认为乙化肥的均值高于甲化肥？","a":"(1) 两总体方差比用 $F$：$H_0:\\sigma_1^{2}=\\sigma_2^{2}$，$F=\\dfrac{S_1^{2}}{S_2^{2}}=\\dfrac{10}{7.8}\\approx1.28\\sim F(12,10)$。取 $F_{0.05}(12,10)$ 与 $F_{0.95}(12,10)$ 为双侧临界值，$1.28$ 落在其中，不拒绝 $H_0$，可认为方差相等。\n(2) 方差相等（合并）作\\textbf{单侧} $t$ 检验：$H_0:\\mu_1\\ge\\mu_2$ 对 $H_1:\\mu_1<\\mu_2$（欲证“乙更高”）。合并方差\n$$S_p^{2}=\\frac{12\\times10+10\\times7.8}{13+11-2}=\\frac{198}{22}=9.0,\\qquad t=\\frac{\\bar x_1-\\bar x_2}{S_p\\sqrt{\\frac1{13}+\\frac1{11}}}=\\frac{12.3-14.4}{3.0\\times0.4097}\\approx-1.71$$\n$df=22$，$t_{0.1}(22)\\approx1.32$，因 $t=-1.71<-1.32$，拒绝 $H_0$，有理由认为乙化肥亩产均值高于甲。","src":"2021 中国科学技术大学 432 统计学真题"}],
    "test03": {"q":"设 $X_1,\\dots,X_n$ 来自 $N(\\mu,1)$，检验 $H_0:\\mu=1$ 对 $H_1:\\mu=2$，拒绝域 $W=\\{\\bar X>1.6\\}$。求：(1) 两类错误的概率 $\\alpha,\\beta$；(2) 要求 $\\beta\\le0.01$，求样本量 $n$ 的范围","a":"(1) $\\alpha=P(\\bar X>1.6\\,|\\,\\mu=1)=1-\\Phi\\left(\\frac{1.6-1}{1/\\sqrt n}\\right)=1-\\Phi(0.6\\sqrt n)$；\n$$\\beta=P(\\bar X\\le1.6\\,|\\,\\mu=2)=\\Phi\\left(\\frac{1.6-2}{1/\\sqrt n}\\right)=\\Phi(-0.4\\sqrt n)$$\n(2) 要求 $\\Phi(-0.4\\sqrt n)\\le0.01$，即 $0.4\\sqrt n\\ge z_{0.01}=2.326$，得 $n\\ge\\left(\\frac{2.326}{0.4}\\right)^2\\approx33.8$，故 $n\\ge34$。","src":"2019 复旦大学 432 统计学真题"},
    "test04": {"q":"设 $X_1,\\dots,X_n$ 是来自均匀分布 $U(0,\\theta)$ 的简单随机样本，检验 $H_0:\\theta\\le\\frac12$ 对 $H_1:\\theta>\\frac12$，拒绝域 $W=\\{x_{(n)}>c\\}$。(1) 求该检验的功效函数；(2) 找出最小的常数 $c$，使得该检验犯第一类错误的概率不超过 0.05","a":"(1) 功效函数 $\\rho(\\theta)=P_{\\theta}(x_{(n)}>c)=1-\\left(\\dfrac{\\min(c,\\theta)}{\\theta}\\right)^{n}$，即 $\\theta>c$ 时 $\\rho(\\theta)=1-(c/\\theta)^{n}$，$\\theta\\le c$ 时 $\\rho(\\theta)=0$。\n(2) 显著性水平 $\\alpha=\\sup_{\\theta\\le1/2}\\rho(\\theta)$。$\\rho(\\theta)$ 在 $\\theta\\in(c,\\frac12]$ 上关于 $\\theta$ 单调增，故最大值在 $\\theta=\\frac12$ 处取得：要求 $1-(2c)^{n}\\le0.05$，即 $c\\ge\\frac12\\cdot(0.95)^{1/n}$，最小的 $c=\\frac12(0.95)^{1/n}$。","src":"2018 复旦大学 861 概率论与数理统计真题"},
    "test05": {"q":"某调查员想检验一种 coffee 包装是否少于 500g，那么他采取的假设检验应该为（  ）\\\\\nA. 双侧检验　B. 单侧且备择假设为小于 500g\\\\\nC. 单侧且备择假设为大于 500g　D. 单双侧检验均可","a":"选 B。调查员关心的是“是否少于 500g”，即怀疑 $\\mu<500$，故用单侧检验，把欲证结论放在备择假设：\n$$H_0:\\mu\\ge500\\quad\\text{对}\\quad H_1:\\mu<500$$\n（若用双侧 $H_1:\\mu\\ne500$ 则不够针对问题、功效较低。）","src":"2023 上海财经大学 432 统计学真题"},
    "test06": {"q":"某产品尺寸 $X\\sim N(4.55,0.108^2)$，抽查 $n=9$ 件得平均尺寸 $\\bar x=4.84$。若方差未改变，在 $\\alpha=0.05$ 下检验 $H_0:\\mu=4.55$ 对 $H_1:\\mu\\ne4.55$（$z_{0.025}=1.96$）","a":"$Z=\\dfrac{\\bar x-\\mu_0}{\\sigma/\\sqrt n}=\\dfrac{4.84-4.55}{0.108/3}=\\dfrac{0.29}{0.036}\\approx8.06$。因 $|Z|=8.06>z_{0.025}=1.96$，落入拒绝域，拒绝 $H_0$，认为现在生产的产品平均尺寸已显著异于 4.55。","src":"2023 上海财经大学 432 统计学真题","a2":"💡巧解（$p$ 值法）：双侧 $p$ 值 $=2P(Z>|8.06|)=2[1-\\Phi(8.06)]\\approx0$。因 $p\\ll\\alpha=0.05$，拒绝 $H_0$，结论与临界值法一致。"},
    "test07": {"q":"某培训对 10 位分析师预测误差（培训前－培训后）的影响，差值 $d_i$ 为 $0.5,0.3,0.3,0.4,0.2,0.3,0.2,0.4,0.4,0.4$。在 $\\alpha=0.05$ 下用配对 $t$ 检验判断培训是否显著降低预测误差（$t_{0.025}(9)=2.262$）","a":"$\\bar d=0.34$，$S_d^2=\\dfrac{\\sum d_i^2-(\\sum d_i)^2/n}{n-1}=\\dfrac{1.24-1.156}{9}=0.00933$（$S_d\\approx0.0966$）。\n$$t=\\frac{\\bar d}{S_d/\\sqrt n}=\\frac{0.34}{0.0966/\\sqrt{10}}\\approx11.13$$\n因 $|t|=11.13>t_{0.025}(9)=2.262$，拒绝 $H_0$，培训显著降低了预测误差。","src":"2024 北大光华 431 统计真题","a2":"💡巧解（置信区间法）：$d$ 的 95% 置信区间为\n$$\\bar d\\pm t_{0.025}(9)\\frac{S_d}{\\sqrt n}=0.34\\pm2.262\\times\\frac{0.0966}{\\sqrt{10}}\\approx(0.271,\\ 0.409)$$\n区间不含 $0$，故在 $\\alpha=0.05$ 下拒绝 $H_0$，与 $t$ 检验结论一致。"},
    "test08": {"q":"经调查，健康成年男子脉搏服从正态分布 $N(72,11^{2})$，现测得 16 位慢性铅中毒患者脉搏平均为 67、标准差为 7。在 0.05 置信水平下检验与正常男子脉搏是否有差异（对均值与方差均作检验）。（$t_{0.025}(15)=2.131$，$\\chi^{2}_{0.975}(15)=6.262$，$\\chi^{2}_{0.025}(15)=27.488$）","a":"先检验方差 $H_0:\\sigma=11$ 对 $H_1:\\sigma\\ne11$：\n$$\\chi^{2}=\\frac{(n-1)s^{2}}{\\sigma_0^{2}}=\\frac{15\\times7^{2}}{11^{2}}=\\frac{735}{121}\\approx6.07$$\n拒绝域 $\\chi^{2}>27.488$ 或 $\\chi^{2}<6.262$。因 $6.07<6.262$，拒绝 $H_0$，认为方差有差异。\n再检验均值（方差未知用 $t$ 检验）$H_0:\\mu=72$ 对 $H_1:\\mu\\ne72$：\n$$t=\\frac{\\sqrt n(\\bar x-\\mu_0)}{s}=\\frac{4(67-72)}{7}\\approx-2.857$$\n$|t|=2.857>t_{0.025}(15)=2.131$，拒绝 $H_0$，认为脉搏均值也有差异。","src":"2024 中国科学技术大学 432 统计学真题"},
    "test09": {"q":"对单个总体均值的 $t$ 检验，软件给出 $p$ 值 0.074。(1) 解释 $p$ 值的含义；(2) 若样本均值 $\\bar x>\\mu_0$，如何判断总体均值是否也大于 $\\mu_0$？能得出什么结论？","a":"(1) 0.074 表示在 $H_0:\\mu=\\mu_0$ 成立时，得到当前或更极端（双侧）结果的概率。\n(2) 判断 $\\mu>\\mu_0$ 需用单侧检验：由 $\\bar x>\\mu_0$ 知 $t>0$，单侧 $p$ 值 $=\\dfrac{0.074}{2}=0.037$。在 $\\alpha=0.05$ 下 $0.037<0.05$，拒绝 $H_0$，有充分理由认为 $\\mu>\\mu_0$。","src":"2001 北京大学光华 统计学真题"},
    "test10": {"q":"设 $X\\sim N(\\mu,1)$，考虑假设检验问题 $H_0:\\mu=1$ 对 $H_1:\\mu=2$，拒绝域为 $W=\\{\\bar x>c\\}$，则下列说法不正确的是（  ）\\\\\nA. 功效函数随 $\\mu$ 单调增　B. 功效函数随 $c$ 单调增\\\\\nC. 第一类错误的概率等于 $1-\\Phi(\\sqrt n(c-1))$　D. 第二类错误的概率等于 $\\Phi(\\sqrt n(c-2))$","a":"选 B。功效函数 $\\rho(\\mu)=P_{\\mu}(\\bar X>c)=1-\\Phi(\\sqrt n(c-\\mu))$：随 $\\mu$ 增大而增大（A 对）；随 $c$ 增大而\\textbf{减小}（B 错）。\n$\\alpha=1-\\Phi(\\sqrt n(c-1))$（C 对）；$\\beta=\\Phi(\\sqrt n(c-2))$（D 对）。","src":"2023 上海财经大学 432 统计学真题"},
    "test11": {"q":"设两组独立样本 $x_1,\\dots,x_n\\sim N(\\mu_1,\\sigma_1^{2})$、$y_1,\\dots,y_m\\sim N(\\mu_2,\\sigma_2^{2})$，$\\sigma_1,\\sigma_2$ 已知，记 $\\theta=\\mu_1-\\mu_2$。求：(1) $\\theta$ 的 MLE；(2) 总样本量 $N=n+m$ 固定时使 $\\hat\\theta$ 均方误差最小的 $n,m$；(3) 检验 $H_0:\\theta=0$ 对 $H_1:\\theta\\ne0$ 在水平 $\\alpha$ 下的拒绝域","a":"(1) $\\hat\\theta=\\bar x-\\bar y$，其方差（均方误差）为 $\\dfrac{\\sigma_1^{2}}{n}+\\dfrac{\\sigma_2^{2}}{m}$。\n(2) 令 $m=N-n$，对 $n$ 求导并令 0：$\\dfrac{\\sigma_1^{2}}{n^{2}}=\\dfrac{\\sigma_2^{2}}{(N-n)^{2}}\\Rightarrow\\dfrac{n}{m}=\\dfrac{\\sigma_1}{\\sigma_2}$（按标准差之比分配样本，即内曼分配）。\n(3) 统计量 $Z=\\dfrac{\\bar x-\\bar y}{\\sqrt{\\sigma_1^{2}/n+\\sigma_2^{2}/m}}\\sim N(0,1)$，拒绝域 $|Z|>z_{\\alpha/2}$。","src":"2023 北京大学光华 431 统计真题"},
    "test12": {"q":"公司甲同时在 A 股、H 股上市，$X_i,Y_i$ 为两市场过去一年每天的回报观测。(1) 给出两种检验方法检验两市场回报均值是否相等；(2) 讨论两种检验的假设条件，哪种更合理？","a":"(1) 方法一（配对 $t$ 检验）：令 $d_i=X_i-Y_i$，$H_0:\\mu_d=0$，$$t=\\frac{\\bar d}{S_d/\\sqrt n}\\sim t(n-1)$$方法二（两独立样本 $t$ 检验）：视 $X,Y$ 为独立样本且方差相等，$$t=\\frac{\\bar X-\\bar Y}{S_p\\sqrt{1/n+1/n}}\\sim t(2n-2)$$\n(2) 配对检验需两市场数据成对且 $d_i$ 独立正态；两样本检验需两总体独立、方差齐。同一公司同一日的两市场回报受共同市场因素影响，配对检验利用了成对结构、消除了共同因素干扰，功效更高，更合理。","src":"2017 北大光华 431 统计真题"},
    "test13": [{"q":"甲乙两台机床加工同种零件，直径分别服从 $N(\\mu_1,\\sigma_1^{2})$ 与 $N(\\mu_2,\\sigma_2^{2})$。各抽样本得 $n_1=10,\\ s_1^{2}=0.96$；$n_2=8,\\ s_2^{2}=0.30$。在 $\\alpha=0.05$ 下检验 $H_0:\\sigma_1^{2}=\\sigma_2^{2}$ 对 $H_1:\\sigma_1^{2}\\ne\\sigma_2^{2}$（$F_{0.025}(9,7)=4.82$）","a":"统计量 $F=\\dfrac{s_1^{2}}{s_2^{2}}=\\dfrac{0.96}{0.30}=3.2\\sim F(9,7)$。拒绝域 $F>F_{0.025}(9,7)=4.82$ 或 $F<F_{0.975}(9,7)$。因 $3.2<4.82$，不拒绝 $H_0$，无充分证据表明两总体方差不等。","src":"2010 年北大光华金融硕士统计真题"},{"q":"根据沪深 300 指数 2020 年和 2023 年的日指数收益率数据（$n_1=244,\\ s_1=22.3\\%$；$n_2=242,\\ s_2=10.1\\%$），说明如何检验这两年的日指数收益率的标准差是否存在显著差异","a":"两正态总体方差比用 $F$ 检验：$H_0:\\sigma_1^{2}=\\sigma_2^{2}$ 对 $H_1:\\sigma_1^{2}\\ne\\sigma_2^{2}$，统计量\n$$F=\\frac{S_1^{2}}{S_2^{2}}=\\left(\\frac{0.223}{0.101}\\right)^{2}\\approx4.87\\sim F(n_1-1,\\ n_2-1)=F(243,241)$$\n当 $F>F_{\\alpha/2}(243,241)$ 或 $F<F_{1-\\alpha/2}(243,241)$ 时拒绝 $H_0$，认为两年日收益率的标准差存在显著差异。","src":"2025 北大光华 431 统计真题"}],
    "test14": [{"q":"用 $\\chi^{2}$ 检验判断两个分类变量是否独立（列联表独立性检验）。对 $r\\times c$ 列联表写出检验统计量、自由度与拒绝域","a":"统计量 $\\chi^{2}=\\sum_{i=1}^{r}\\sum_{j=1}^{c}\\dfrac{(n_{ij}-\\hat e_{ij})^{2}}{\\hat e_{ij}}$，期望频数 $\\hat e_{ij}=\\dfrac{n_{i\\cdot}\\,n_{\\cdot j}}{n}$。自由度 $(r-1)(c-1)$。当 $\\chi^{2}>\\chi^{2}_{\\alpha}((r-1)(c-1))$ 时拒绝独立性假设 $H_0$。","src":"2010 年北大光华金融硕士统计真题"},{"q":"某公司调查 210 名员工对奖励制度的满意度，按性别整理：男 30 满意、70 不满（共 100），女 45 满意、65 不满（共 110）。在 $\\alpha=0.05$ 下分析男女看法是否有显著差异（$\\chi^2_{0.05}(1)=3.84$）","a":"期望频数：男满意 $\\dfrac{100\\times75}{210}=35.71$、男不满 $64.29$、女满意 $39.29$、女不满 $70.71$。\n$$\\chi^2=\\frac{(30-35.71)^2}{35.71}+\\frac{(70-64.29)^2}{64.29}+\\frac{(45-39.29)^2}{39.29}+\\frac{(65-70.71)^2}{70.71}\\approx2.71$$\n$2.71<\\chi^2_{0.05}(1)=3.84$，不拒绝 $H_0$，无充分证据表明男女对奖励制度的看法存在显著差异。","src":"2019 北大光华 431 统计真题"}],
    "test15": [{"q":"关于假设检验中的概念，以下说法正确的是（  ）\\\\\nA. 第一类错误是指 $H_0$ 为假时接受备择假设\\\\\nB. 第二类错误是指 $H_1$ 为假时接受原假设\\\\\nC. 检验功效是指 $H_0$ 为假时，假设检验拒绝原假设的概率\\\\\nD. 检验功效是指 $H_1$ 为假时，假设检验接受原假设的概率","a":"选 C。检验功效（势）$=1-\\beta=P(\\text{拒绝 }H_0\\,|\\,H_0\\text{ 假})$，即 $H_0$ 为假（$H_1$ 为真）时正确拒绝原假设的概率。\nA、B 对两类错误的表述混乱：第一类错误是 $H_0$ 为真时拒绝 $H_0$（弃真），第二类错误是 $H_0$ 为假时接受 $H_0$（取伪）。","src":"2023 上海财经大学 432 统计学真题"},{"q":"设总体 $X$ 的概率密度为 $f(x;\\theta)=\\theta x^{\\theta-1}\\ (0<x<1)$。又设 $X_1,X_2$ 是取自该总体的简单样本，考虑假设检验 $H_0:\\theta=1$ 对 $H_1:\\theta=2$，其否定域为 $\\{(X_1,X_2):3X_1\\le4X_2\\}$。求此检验的功效函数及两类错误的概率","a":"功效函数 $\\rho(\\theta)=P_{\\theta}(3X_1\\le4X_2)$。\n$H_0$（$\\theta=1$，$X\\sim U(0,1)$）：$\\alpha=\\rho(1)=\\displaystyle\\int_0^{3/4}\\frac{4x_2}{3}\\,dx_2+\\int_{3/4}^{1}1\\,dx_2=\\frac{5}{8}$。\n$H_1$（$\\theta=2$，$f(x)=2x$）：$\\rho(2)=4\\displaystyle\\int_0^{3/4}\\frac{(4x_2/3)^{2}}{2}\\,x_2\\,dx_2+4\\int_{3/4}^{1}\\frac{x_2}{2}\\,dx_2=\\frac{23}{32}$，故 $\\beta=1-\\frac{23}{32}=\\frac{9}{32}$。\n即 $\\rho(1)=\\frac58$、$\\rho(2)=\\frac{23}{32}$；第一类错误 $\\alpha=\\frac58$，第二类错误 $\\beta=\\frac{9}{32}$。","src":"2016 中国科学技术大学 432 统计学真题"}],
    "test16": {"q":"根据沪深 300 指数 2020 年与 2023 年的年化日指数收益率（2020：$n=244$，均值 $26.5\\%$，标准差 $22.3\\%$，偏度 $-0.84$；2023：$n=242$，均值 $-11.2\\%$，标准差 $10.1\\%$，偏度 $0.34$），简要说明这两年日指数收益率分布的差异","a":"分布形态：2020 年偏度为 $-0.84$（明显左偏、厚左尾），2023 年偏度为 $0.34$（略右偏、接近对称）。由偏度系数（正态分布的偏度为 0）可初步判断两年收益率均不严格服从正态分布，且 2020 年偏离对称性更远。\n数值特征：2020 年均值（$26.5\\%$）与标准差（$22.3\\%$）均大于 2023 年（$-11.2\\%$、$10.1\\%$），说明 2020 年收益率整体更高但波动也更大。（可进一步用偏度-峰度检验或 Q-Q 图作正态性检验。）","src":"2025 北大光华 431 统计真题"},
    "reg01": {"q":"为研究三种饲料配方的增肥效果，各喂养 10 只母雏鸡并于 60 天后观测重量（三种饲料各 10 个数据，共 30 个观测）。请对本例进行方差分析，在 $\\alpha=0.05$ 的前提下给出你的结论。（$F_{0.95}(2,27)=3.35$）","a":"单因素方差分析：$H_0:\\mu_1=\\mu_2=\\mu_3$（三种饲料增肥效果无差异）对 $H_1$：不全相等。平方和分解 $SST=SSA+SSE$，计算得 $SSA=11675$、$SSE=5568$、$df_A=2$、$df_E=27$：\n$$F=\\frac{SSA/2}{SSE/27}=\\frac{5837.5}{206.2}\\approx28.3$$\n因 $F=28.3>F_{0.95}(2,27)=3.35$，拒绝 $H_0$，认为三种饲料配方对鸡增肥的效果存在显著差异。","src":"2018 上海交通大学 432 统计学真题"},
    "reg02": {"q":"现有三组数据进行方差分析，样本量均为 $n$，试用每一组的样本方差 $S_i^{2}\\ (i=1,2,3)$、组内均值 $\\bar Y_i$ 与总均值 $\\bar{\\bar Y}$ 给出组内均方 (MSW) 和组间均方 (MSB) 的表达式","a":"组内平方和 $SSW=\\sum_{i=1}^{3}\\sum_{j=1}^{n}(Y_{ij}-\\bar Y_i)^{2}=(n-1)\\sum_{i=1}^{3}S_i^{2}$，自由度 $df_W=3n-3$，故\n$$MSW=\\frac{SSW}{3n-3}=\\frac{(n-1)\\sum S_i^{2}}{3(n-1)}=\\frac{S_1^{2}+S_2^{2}+S_3^{2}}{3}$$\n组间平方和 $SSB=n\\sum_{i=1}^{3}(\\bar Y_i-\\bar{\\bar Y})^{2}$，自由度 $df_B=3-1=2$，故\n$$MSB=\\frac{n\\sum_{i=1}^{3}(\\bar Y_i-\\bar{\\bar Y})^{2}}{2}$$\n（平方和分解 $SST=SSB+SSW$。）","src":"2023 中山大学 432 统计学真题"},
    "reg03": {"q":"单因素方差分析中 $k$ 个水平的样本量分别为 $n_1,\\dots,n_k$（共 $n$ 个观测）。写出组间、组内平方和及检验 $H_0:\\mu_1=\\cdots=\\mu_k$ 的 $F$ 统计量","a":"$SSA=\\sum_{j}n_j(\\bar x_j-\\bar x)^{2}$（组间），$SSE=\\sum_{j}\\sum_{i}(x_{ij}-\\bar x_j)^{2}$（组内），$SST=SSA+SSE$。\n$$F=\\frac{SSA/(k-1)}{SSE/(n-k)}\\sim F(k-1,\\ n-k)$$\n当 $F$ 显著大时拒绝 $H_0$，认为各总体均值不全相等。","src":"2011 年北大光华金融硕士统计真题"},
    "reg04": {"q":"一元线性回归 $y_i=\\alpha+\\beta x_i+\\varepsilon_i$ 中，若存在异方差且 $\\mathrm{Var}(\\varepsilon_i)=\\sigma^{2}x_i$（比例形式、已知）。说明如何用加权最小二乘（GLS）估计 $\\beta$","a":"取权重 $w_i=1/x_i$，最小化 $\\sum w_i(y_i-\\alpha-\\beta x_i)^{2}$，即对变换模型\n$$\\frac{y_i}{\\sqrt{x_i}}=\\alpha\\frac{1}{\\sqrt{x_i}}+\\beta\\sqrt{x_i}+\\frac{\\varepsilon_i}{\\sqrt{x_i}}$$\n做 OLS，此时 $\\mathrm{Var}(\\varepsilon_i/\\sqrt{x_i})=\\sigma^{2}$ 满足同方差。方差形式未知时可用怀特（White）检验诊断异方差。","src":"2011 年北大光华金融硕士统计真题"},
    "reg05": {"q":"对一元线性回归 $y_i=\\alpha+\\beta x_i+\\varepsilon_i\\ (\\varepsilon_i\\overset{iid}{\\sim}N(0,\\sigma^{2}))$，用最小二乘法求 $\\alpha,\\beta$ 的估计，并给出 $\\hat\\beta$ 的期望与方差","a":"最小化 $\\sum(y_i-\\alpha-\\beta x_i)^{2}$，令偏导为 0 得\n$$\\hat{\\beta}=\\frac{\\sum(x_i-\\bar{x})(y_i-\\bar{y})}{\\sum(x_i-\\bar{x})^{2}},\\qquad \\hat{\\alpha}=\\bar{y}-\\hat{\\beta}\\bar{x}$$\n$\\hat\\beta$ 为 $y_i$ 的线性组合且 $\\sum(x_i-\\bar{x})=0$，故 $E(\\hat\\beta)=\\beta$，$D(\\hat\\beta)=\\dfrac{\\sigma^{2}}{\\sum(x_i-\\bar{x})^{2}}$。","src":"2010 年北大光华金融硕士统计真题"},
    "reg06": {"q":"研究者用 50 家公司数据估计 CEO 年薪回归模型 $y=\\beta_0+\\beta_1x_1+\\cdots+\\beta_5x_5+\\varepsilon$，得 $\\hat\\beta_1=0.3$，相应 $t$ 统计量为 1.5。若进一步随机收集到更多数据共 200 家并重新估计，请判断系数的估计值是否会改变、$t$ 统计量大概会是多少、模型的调整 $R^{2}$ 是否会改变，若改变给出变化关系","a":"估计值会改变：新样本对应新的最小二乘解，$\\hat\\beta$ 一般不同。\n$t$ 统计量：$t=\\frac{\\hat\\beta}{s(\\hat\\beta)}$，而 $s(\\hat\\beta)\\approx\\frac{\\sigma}{\\sqrt{\\sum(x_i-\\bar x)^2}}\\propto\\frac1{\\sqrt n}$（新样本与旧样本分布相似时），样本量由 50 增至 200（约 4 倍），$t$ 统计量约增大 $\\sqrt4=2$ 倍，即约 $t\\approx3$。\n调整 $R^{2}$：$\\bar R^{2}=1-\\frac{SSE/(n-k-1)}{SST/(n-1)}$，样本量增大主要减小估计的方差而非改变拟合优度，$\\bar R^{2}$ 变化不大（新增数据同分布时趋于稳定）。","src":"2017 北大光华 431 统计真题"},
    "reg07": {"q":"设模型 $y_i=b x_i+\\varepsilon_i$（无截距），$\\varepsilon_i\\overset{iid}{\\sim}N(0,\\sigma^2)$（$\\sigma^2$ 未知）。求：(1) $b$ 的最小二乘估计 $\\hat b$；(2) $\\hat b$ 的期望、方差与分布；(3) 检验 $H_0:b=0$ 对 $H_1:b>0$ 的检验法","a":"(1) 最小化 $\\sum(y_i-bx_i)^2$ 得 $\\hat b=\\dfrac{\\sum x_i y_i}{\\sum x_i^2}$。\n(2) $E(\\hat b)=b$，$D(\\hat b)=\\dfrac{\\sigma^2}{\\sum x_i^2}$，$\\hat b\\sim N\\left(b,\\dfrac{\\sigma^2}{\\sum x_i^2}\\right)$。\n(3) 用 $t$ 检验：$t=\\dfrac{\\hat b}{s/\\sqrt{\\sum x_i^2}}\\sim t(n-1)$，其中 $s^2=\\dfrac{\\sum(y_i-\\hat b x_i)^2}{n-1}$；当 $t>t_{\\alpha}(n-1)$ 时拒绝 $H_0$。","src":"2018 北大光华 431 统计真题"},
    "reg08": {"q":"对回归模型 $grade=\\alpha_0+\\alpha_1 CGPA+\\alpha_2 Skipped+\\varepsilon$，样本量 $n=141$，$R^2=0.234$。在显著性水平 1% 下检验 $H_0:\\alpha_1=\\alpha_2=0$（即 CGPA 与 Skipped 同时无影响）","a":"整体显著性用 $F$ 检验（$k=2$ 个解释变量）：\n$$F=\\frac{R^2/k}{(1-R^2)/(n-k-1)}=\\frac{0.234/2}{0.766/138}\\approx21.1\\sim F(2,138)$$\n因 $F\\approx21.1>F_{0.01}(2,138)\\approx4.79$，拒绝 $H_0$，认为 CGPA 与 Skipped 对 grade 的影响不全为零（单个系数在 1% 下可能不显著，但联合检验显著）。","src":"2016 北大光华 431 统计真题"},
    "reg09": {"q":"对于线性回归模型 $y_i=\\beta x_i+\\varepsilon_i$，其中 $\\varepsilon_i$ 独立同服从 $N(0,\\sigma^{2})$。现有 $n$ 个观测数据。(1) 求 $\\beta$ 的最小二乘估计 $\\hat\\beta$ 及 $\\sigma^{2}$ 的无偏估计；(2) 求 $\\beta$ 的 $1-\\alpha$ 置信区间；(3) 给定 $x_0$，求 $y_0$ 的预测区间","a":"(1) $\\hat\\beta=\\dfrac{\\sum x_i y_i}{\\sum x_i^{2}}$，$E(\\hat\\beta)=\\beta$，$Var(\\hat\\beta)=\\dfrac{\\sigma^{2}}{\\sum x_i^{2}}$；$\\sigma^{2}$ 的无偏估计 $\\hat\\sigma^{2}=\\dfrac{1}{n-1}\\sum_{i}(y_i-\\hat\\beta x_i)^{2}$。\n(2) $\\dfrac{\\hat\\beta-\\beta}{\\hat\\sigma/\\sqrt{\\sum x_i^{2}}}\\sim t(n-1)$，故 $\\beta$ 的 $1-\\alpha$ 置信区间为 $\\hat\\beta\\pm t_{\\alpha/2}(n-1)\\,\\hat\\sigma/\\sqrt{\\sum x_i^{2}}$。\n(3) 对 $x_0$，预测值 $\\hat y_0=\\hat\\beta x_0$，$y_0-\\hat y_0\\sim N(0,\\sigma^{2}(1+\\frac{x_0^{2}}{\\sum x_i^{2}}))$，故 $y_0$ 的 $1-\\alpha$ \\textbf{预测}区间为\n$$\\hat y_0\\pm t_{\\alpha/2}(n-1)\\,\\hat\\sigma\\sqrt{1+\\frac{x_0^{2}}{\\sum x_i^{2}}}$$（比置信区间多出“$+1$”的个体随机项，故更宽。）","src":"2022 北京大学叉院 849 统计学真题"},
    "reg10": {"q":"设 $(X_i,Y_i)^{T}$ i.i.d. 服从二元正态 $N_2(\\mu,\\Sigma)$，$i=1,\\dots,n$，$\\Sigma=\\begin{pmatrix}\\sigma_1^{2}&\\rho\\sigma_1\\sigma_2\\\\\\rho\\sigma_1\\sigma_2&\\sigma_2^{2}\\end{pmatrix}$。(1) 考虑检验问题 $H_0:\\rho=0$，给出其似然比检验并指出检验统计量 $T$；(2) 基于 $T$ 构造水平为 $\\alpha$ 的拒绝域","a":"$H_0:\\rho=0$ 即两变量独立。二元正态的极大似然估计给出 $\\hat\\rho=r$（样本相关系数），似然比检验等价于对 $r$ 检验。在 $H_0$ 下\n$$T=\\frac{r\\sqrt{n-2}}{\\sqrt{1-r^{2}}}\\sim t(n-2)$$\n(2) $T$ 是 $r$ 的单调递增函数，故拒绝域为 $|T|>t_{\\alpha/2}(n-2)$（等价于 $|r|>r_{\\alpha}$；亦可用 Fisher 变换 $z=\\frac12\\ln\\frac{1+r}{1-r}\\approx N(0,\\frac{1}{n-3})$ 作近似正态检验）。","src":"2024 北京大学数院 431 金融学综合真题"},
    "sx01": {"q":"收集同一公司两个市场 A、B 的日回报率，$(x_1,\\dots,x_n)$ 为 A 市场回报率，$(y_1,\\dots,y_n)$ 为 B 市场回报率。如何检验 A 与 B 的股票日回报是否相关？","a":"计算样本相关系数 $r=\\dfrac{\\sum(x_i-\\bar x)(y_i-\\bar y)}{\\sqrt{\\sum(x_i-\\bar x)^2\\sum(y_i-\\bar y)^2}}$，检验 $H_0:\\rho=0$ 对 $H_1:\\rho\\ne0$。在 $H_0$ 下$$t=\\frac{r\\sqrt{n-2}}{\\sqrt{1-r^2}}\\sim t(n-2)$$若 $|t|>t_{\\alpha/2}(n-2)$ 则拒绝 $H_0$，认为两市场日回报显著相关。（也可用 Fisher $z$ 变换 $z=\\frac12\\ln\\frac{1+r}{1-r}$ 构造近似正态检验。）","src":"2016 北京大学光华 431 统计真题"},
    "sx02": {"q":"两只股票收益率 $\\varepsilon\\sim N(\\mu_1,\\sigma^2)$、$\\theta\\sim N(\\mu_2,\\sigma^2)$ 独立且方差相等，样本为 $(\\varepsilon_1,\\dots,\\varepsilon_n)$、$(\\theta_1,\\dots,\\theta_m)$。求 $\\dfrac{\\sum_{i=1}^{n}(\\varepsilon_i-\\bar\\varepsilon)^2}{\\sum_{i=1}^{n}(\\varepsilon_i-\\bar\\varepsilon)^2+\\sum_{j=1}^{m}(\\theta_j-\\bar\\theta)^2}$ 的概率分布。","a":"令 $U=\\dfrac{\\sum_{i}(\\varepsilon_i-\\bar\\varepsilon)^2}{\\sigma^2}\\sim\\chi^2(n-1)$，$V=\\dfrac{\\sum_{j}(\\theta_j-\\bar\\theta)^2}{\\sigma^2}\\sim\\chi^2(m-1)$，且 $U,V$ 独立。故$$\\frac{\\sum_i(\\varepsilon_i-\\bar\\varepsilon)^2}{\\sum_i(\\varepsilon_i-\\bar\\varepsilon)^2+\\sum_j(\\theta_j-\\bar\\theta)^2}=\\frac{U}{U+V}\\sim\\mathrm{Beta}\\left(\\frac{n-1}{2},\\ \\frac{m-1}{2}\\right)$$","src":"2016 北京大学光华 431 统计真题"},
    "sx03": {"q":"(1) 叙述充分统计量的定义；(2) 设 $X_1,\\dots,X_n$ 为来自 $f(x;\\theta)=\\theta(1-\\theta)^x\\ (x=0,1,\\dots)$ 的 i.i.d. 样本，判断 $T=\\sum_{k=1}^{n}X_k$ 是否为充分统计量。","a":"(1) 若给定 $T$ 后样本的条件分布与 $\\theta$ 无关，则 $T$ 为充分统计量。(2) 联合分布$$f(x_1,\\dots,x_n;\\theta)=\\theta^n(1-\\theta)^{\\sum x_i}=\\underbrace{\\theta^n(1-\\theta)^T}_{g(T,\\theta)}\\cdot\\underbrace{1}_{h(x)}$$由因子分解定理，$T=\\sum_{k=1}^n X_k$ 是 $\\theta$ 的充分统计量。","src":"2023 复旦大学 432 统计学真题"},
    "sx04": {"q":"设总体 $X\\sim U(\\theta,\\theta+1)$，$\\theta$ 的先验分布为 $U(5,8)$，现有观测值 $6.1,6.5,6.7,6.9$。求 $\\theta$ 的后验分布。","a":"似然：需 $\\theta\\le x_i\\le\\theta+1$（$i=1,\\dots,4$），即 $\\theta\\le\\min x_i=6.1$ 且 $\\theta\\ge\\max x_i-1=6.9-1=5.9$，故 $\\theta\\in[5.9,6.1]$ 时似然为常数、否则为 0。先验 $U(5,8)$ 密度为 $\\frac13$。后验$$\\pi(\\theta\\,|\\,x)\\propto \\pi(\\theta)\\,L(\\theta;x)\\propto I_{[5.9,6.1]}(\\theta)$$故 $\\theta\\,|\\,x\\sim U(5.9,\\ 6.1)$。","src":"2023 复旦大学 432 统计学真题"},
    "sy01": {"q":"设 $X\\sim P(\\lambda)$，$x_1,\\dots,x_n$ 为简单随机样本，求 $\\lambda$ 的 95% 置信水平下的置信区间","a":"由中心极限定理 $\\dfrac{\\bar X-\\lambda}{\\sqrt{\\lambda/n}}\\ \\dot\\sim\\ N(0,1)$，用 $\\bar X$ 估计方差，$\\lambda$ 的近似 95% 置信区间为$$\\bar X\\pm 1.96\\sqrt{\\frac{\\bar X}{n}}$$","src":"2014 北大光华 431 统计真题"},
    "sy02": {"q":"一家连锁店向其 100 名信用卡顾客分发赠券，结果 13 人使用。(1) 求赠券使用率的 90% 置信区间；(2) 若使用率超过 10% 认为促销成功，在 $\\alpha=0.05$ 下是否应全国推广？（$z_{0.05}=1.645$）","a":"$\\hat p=\\frac{13}{100}=0.13$。\n(1) $0.13\\pm1.645\\sqrt{\\frac{0.13\\times0.87}{100}}=0.13\\pm0.055\\approx(0.075,\\ 0.185)$。\n(2) $H_0:p\\le0.10$ 对 $H_1:p>0.10$，$Z=\\frac{0.13-0.10}{\\sqrt{0.10\\times0.90/100}}=\\frac{0.03}{0.03}=1<z_{0.05}=1.645$，不拒绝 $H_0$，暂无充分证据认为使用率超过 10%，不宜贸然全国推广。","src":"2019 北大光华 431 统计真题"},
    "sy03": {"q":"给定模型 $\\ln y=\\alpha+\\beta\\ln x+\\varepsilon$ 和观测 $(x_i,y_i)_{i=1}^n$。(1) 给出 $\\beta$ 的经济学含义；(2) 给出 $\\beta$ 的一个估计；(3) 验证其无偏性（需给出假设条件）","a":"(1) $\\beta$ 为 $y$ 对 $x$ 的弹性：$x$ 增加 $1\\%$，$y$ 平均增加 $\\beta\\%$。\n(2) 令 $\\tilde x_i=\\ln x_i,\\ \\tilde y_i=\\ln y_i$，$\\hat\\beta=\\dfrac{\\sum(\\tilde x_i-\\bar{\\tilde x})(\\tilde y_i-\\bar{\\tilde y})}{\\sum(\\tilde x_i-\\bar{\\tilde x})^2}$。\n(3) 在 $E(\\varepsilon\\,|\\,\\tilde x)=0$ 且 $\\tilde x$ 与 $\\varepsilon$ 不相关（外生）条件下，$\\hat\\beta$ 是 $y$ 的线性组合且 $E(\\hat\\beta)=\\beta$，故无偏。","src":"2017 北大光华 431 统计真题"},
    "sy04": {"q":"设取值为非负整数的总体，样本容量 $n=800$，取值 $0,1,2,3,4,5$ 的频数分别为 $250,200,180,100,50,20$。(1) 求经验分布函数；(2) 求 $P(X=0)$ 与 $P(2<X\\le4)$","a":"(1) $F_n(x)=\\dfrac{1}{800}\\sum_{i=1}^{800}I\\{X_i\\le x\\}$，在 $0,1,2,3,4,5$ 处依次取值 $0.3125,0.5625,0.7875,0.9125,0.975,1$。\n(2) $P(X=0)=\\dfrac{250}{800}=0.3125$；$P(2<X\\le4)=\\dfrac{100+50}{800}=0.1875$。","src":"2025 北大光华 431 统计真题"},
    "sy05": {"q":"设 $X\\sim P(\\lambda)$。(1) 对期望存在的 $g$，证明 $E[X\\,g(X)]=\\lambda E[g(X+1)]$；(2) 求 $E[X^3]$ 与 $E[X^4]$","a":"(1) $E[Xg(X)]=\\sum_{k\\ge1}k g(k)\\frac{\\lambda^k}{k!}e^{-\\lambda}=\\lambda\\sum_{j\\ge0}g(j+1)\\frac{\\lambda^j}{j!}e^{-\\lambda}=\\lambda E[g(X+1)]$。\n(2) $E[X^2]=\\lambda^2+\\lambda$，$E[X^3]=\\lambda E[(X+1)^2]=\\lambda(\\lambda^2+3\\lambda+1)=\\lambda^3+3\\lambda^2+\\lambda$；$E[X^4]=\\lambda E[(X+1)^3]=\\lambda[(\\lambda^3+3\\lambda^2+\\lambda)+3(\\lambda^2+\\lambda)+3\\lambda+1]=\\lambda^4+6\\lambda^3+7\\lambda^2+\\lambda$。","src":"2026 北大光华 431 统计真题","a2":"💡巧解（矩母函数）：$X\\sim P(\\lambda)$ 的矩母函数 $M(t)=e^{\\lambda(e^t-1)}$。逐阶求导：\n$$E[X]=M'(0)=\\lambda,\\quad E[X^2]=M''(0)=\\lambda^2+\\lambda,\\quad E[X^3]=\\lambda^3+3\\lambda^2+\\lambda,\\quad E[X^4]=\\lambda^4+6\\lambda^3+7\\lambda^2+\\lambda$$\n与 Stein 等式递推结果一致，且更便于机械化求高阶矩。"},
    "sy06": {"q":"$X_1,X_2$ 独立同分布的泊松随机变量，均值分别为 $\\mu_1,\\mu_2$。(1) 写出 $X_1$ 的分布列；(2) 写出 $X_1+X_2$ 的分布列；(3) $2X_1$ 还服从泊松分布吗？","a":"(1) $P(X_1=k)=\\dfrac{\\mu_1^k}{k!}e^{-\\mu_1},\\ k=0,1,\\dots$\n(2) $X_1+X_2\\sim P(\\mu_1+\\mu_2)$，$P(X_1+X_2=k)=\\dfrac{(\\mu_1+\\mu_2)^k}{k!}e^{-(\\mu_1+\\mu_2)}$。\n(3) 不是。$2X_1$ 只在偶数点取值，$P(2X_1=1)=0$，不满足泊松分布。","src":"2020 北大光华 431 统计真题"},
    "sy07": {"q":"灯泡寿命 $X\\sim N(\\mu,1000^2)$。(1) 使 95% 置信区间误差控制在 $\\pm200$ 小时，需多少样本？(2) 置信水平改为 99%；(3) 误差改为 $\\pm100$ 小时（$z_{0.025}=1.96,\\ z_{0.005}=2.576$）","a":"$n\\ge\\left(\\dfrac{z_{\\alpha/2}\\sigma}{d}\\right)^2$。\n(1) $n\\ge\\left(\\dfrac{1.96\\times1000}{200}\\right)^2=9.8^2=96.04$，取 $n=97$。\n(2) $n\\ge\\left(\\dfrac{2.576\\times1000}{200}\\right)^2=12.88^2=165.9$，取 $n=166$。\n(3) $n\\ge\\left(\\dfrac{1.96\\times1000}{100}\\right)^2=19.6^2=384.2$，取 $n=385$。","src":"2022 北大光华 431 统计真题"},
    "sy08": {"q":"设 $\\xi$ 为随机变量，$E\\xi=0,\\ D\\xi=\\sigma^2<\\infty$，证明对任意 $a>0$，$P\\{\\xi\\ge a\\}\\le\\dfrac{\\sigma^2}{\\sigma^2+a^2}$","a":"对 $t>0$，由马尔可夫不等式：\n$$P(\\xi\\ge a)=P(\\xi+t\\ge a+t)\\le\\frac{E(\\xi+t)^2}{(a+t)^2}=\\frac{\\sigma^2+t^2}{(a+t)^2}$$\n取 $t=\\dfrac{\\sigma^2}{a}$，得\n$$P(\\xi\\ge a)\\le\\frac{\\sigma^2+\\sigma^4/a^2}{(a+\\sigma^2/a)^2}=\\frac{\\sigma^2}{\\sigma^2+a^2}$$","src":"2026 复旦大学 432 统计学真题"},
    "sy09": {"q":"$X_1,X_2\\overset{iid}{\\sim}N(0,1)$，求 $\\dfrac{X_1}{X_2}$ 的概率分布","a":"作变换 $u=x_1,\\ v=x_1/x_2$（则 $x_2=u/v$），雅可比 $|J|=\\dfrac{|u|}{v^2}$，联合密度变为 $\\dfrac{1}{2\\pi}e^{-u^2(1+1/v^2)/2}\\cdot\\dfrac{|u|}{v^2}$。对 $u$ 积分（$\\int_{-\\infty}^{+\\infty}|u|e^{-a u^2}du=\\dfrac1a$，$a=\\dfrac{1+1/v^2}{2}$）得\n$$f(v)=\\frac{1}{\\pi(1+v^2)}$$\n即 $\\dfrac{X_1}{X_2}\\sim\\mathrm{Cauchy}(0,1)$（等价于 $t(1)$ 分布）。","src":"2017 复旦大学 432 统计学真题"},
    "ts01": {"q":"设二维随机变量 $(X,Y)$ 的联合密度为 $f(x,y)=A\\,e^{-(2x+3y)}\\,I\\{x>0,\\ y>0\\}$。求：(1) 常数 $A$；(2) $P(X<2,\\ Y<1)$；(3) $X$ 的边缘密度；(4) $P(X<3\\,|\\,Y<1)$；(5) 条件密度 $f(x\\,|\\,y)$","a":"识别分布：$f(x,y)=(2e^{-2x})(3e^{-3y})$ 恰为两独立指数密度之积，故 $X\\sim E(2)$、$Y\\sim E(3)$ 且相互独立。\n(1) 归一化：$1=\\int_0^\\infty\\int_0^\\infty A e^{-2x}e^{-3y}\\,dx\\,dy=A\\cdot\\frac12\\cdot\\frac13=\\frac A6$，故 $A=6$。\n(2) $P(X<2,Y<1)=P(X<2)P(Y<1)=(1-e^{-4})(1-e^{-3})$。\n(3) $f_X(x)=\\int_0^\\infty 6e^{-2x}e^{-3y}\\,dy=2e^{-2x}\\ (x>0)$。\n(4) 由独立性 $P(X<3\\,|\\,Y<1)=P(X<3)=1-e^{-6}$。\n(5) 由独立性 $f(x\\,|\\,y)=f_X(x)=2e^{-2x}\\ (x>0)$。","src":"2019 复旦大学 432 统计学真题"},
    "ts02": {"q":"记 $(0,1),(1,0),(0,0)$ 三点围成的区域为 $D$，$(X,Y)$ 服从 $D$ 上的均匀分布。求：(1) $E(X+Y)$ 与 $\\mathrm{Var}(X+Y)$；(2) $X,Y$ 的相关系数","a":"区域 $D=\\{x\\ge0,\\ y\\ge0,\\ x+y\\le1\\}$，面积 $S=\\frac12$，故 $f(x,y)=2$。\n$E(X)=2\\int_0^1 x(1-x)\\,dx=\\frac13$，同理 $E(Y)=\\frac13$，故 $E(X+Y)=\\frac23$。\n$E(X^2)=2\\int_0^1 x^2(1-x)\\,dx=\\frac16$，同理 $E(Y^2)=\\frac16$；$E(XY)=2\\int_0^1\\int_0^{1-x}xy\\,dy\\,dx=\\int_0^1 x(1-x)^2\\,dx=\\frac1{12}$。\n故 $E[(X+Y)^2]=E(X^2)+2E(XY)+E(Y^2)=\\frac16+\\frac16+\\frac16=\\frac12$，\n$$\\mathrm{Var}(X+Y)=E[(X+Y)^2]-[E(X+Y)]^2=\\frac12-\\frac49=\\frac1{18}$$\n$\\mathrm{Cov}(X,Y)=E(XY)-E(X)E(Y)=\\frac1{12}-\\frac19=-\\frac1{36}$；$\\mathrm{Var}(X)=\\frac16-\\frac19=\\frac1{18}$，同理 $\\mathrm{Var}(Y)=\\frac1{18}$。\n$$\\rho=\\frac{\\mathrm{Cov}(X,Y)}{\\sqrt{\\mathrm{Var}(X)\\,\\mathrm{Var}(Y)}}=\\frac{-1/36}{1/18}=-\\frac12$$","src":"2016 复旦大学 432 统计学真题"},
    "ts03": {"q":"设总体为 $(a,b)$ 上的均匀分布（$a<b$），$X_1,\\dots,X_n$ 为该总体的简单随机样本，$a,b$ 为未知参数。(1) 求 $a,b$ 的矩估计；(2) 求 $a,b$ 的极大似然估计；(3) 关于 $a$ 的两个估计量是否无偏？若不是，说明是否存在无偏估计","a":"$E(X)=\\dfrac{a+b}{2}$，$D(X)=\\dfrac{(b-a)^2}{12}$。\n(1) 令 $\\bar X=\\dfrac{a+b}{2}$、$S^2=\\dfrac{(b-a)^2}{12}$（$S$ 为样本标准差），解得$$\\hat a_M=\\bar X-\\sqrt3\\,S,\\qquad \\hat b_M=\\bar X+\\sqrt3\\,S$$\n(2) 似然 $L(a,b)=\\dfrac{1}{(b-a)^n}$，需满足支撑集约束 $a\\le X_{(1)}\\le X_{(n)}\\le b$。$L$ 关于 $b-a$ 递减，故 $b-a$ 取最小：$$\\hat a_{MLE}=X_{(1)},\\qquad \\hat b_{MLE}=X_{(n)}$$\n(3) $E(X_{(1)})=a+\\dfrac{b-a}{n+1}\\ne a$，故 $\\hat a_{MLE}=X_{(1)}$ 有偏；$\\hat a_M=\\bar X-\\sqrt3\\,S$ 一般也有偏。但存在无偏估计$$\\tilde a=\\frac{nX_{(1)}-X_{(n)}}{n-1}$$其期望 $=\\dfrac{n\\left(a+\\frac{b-a}{n+1}\\right)-\\left(b-\\frac{b-a}{n+1}\\right)}{n-1}=a$。","src":"2025 北大光华 431 统计真题"},
    "ts04": {"q":"某电视台考虑缩短广告时间以节约成本，但担心影响广告效果，收集数据如下（$n=200$）：20s 广告有印象 16 人、无印象 44 人；25s 广告有印象 32 人、无印象 38 人；30s 广告有印象 12 人、无印象 58 人。(1) 写出 $H_0$ 与 $H_1$；(2) 求各单元格期望频数；(3) 给出检验结果（$\\chi^2_{0.05}(2)=5.99$）；(4) 给出建议","a":"(1) $H_0$：广告时长与是否有印象相互独立（无关）；$H_1$：两者不独立（有关）。\n(2) 期望频数 $\\hat e_{ij}=\\dfrac{\\text{行合计}\\times\\text{列合计}}{n}$：有印象 60、无印象 140；20s 合计 60、25s 合计 70、30s 合计 70。\n20s 有印象 $18$、无印象 $42$；25s 有印象 $21$、无印象 $49$；30s 有印象 $21$、无印象 $49$。\n(3) $$\\chi^2=\\sum\\frac{(n_{ij}-\\hat e_{ij})^2}{\\hat e_{ij}}=\\frac{(16-18)^2}{18}+\\frac{(44-42)^2}{42}+\\frac{(32-21)^2}{21}+\\frac{(38-49)^2}{49}+\\frac{(12-21)^2}{21}+\\frac{(58-49)^2}{49}\\approx14.06$$\n自由度 $df=(3-1)(2-1)=2$，因 $14.06>\\chi^2_{0.05}(2)=5.99$，拒绝 $H_0$，广告时长与印象显著相关。\n(4) 建议：25s 广告有印象比例最高（$32/70\\approx45.7\\%$），缩短广告时间可能明显降低广告效果，应结合成本与效果权衡后再决定是否缩短。","src":"2021 北大光华 431 统计真题"},
    "ts05": {"q":"从 Wind 资讯随机选取 16 家同时在 A 股、H 股上市的公司股价，经计算 16 家公司 A 股均价为 12.88 元、标准差 10.15 元；H 股均价 10.33 元、标准差 8.36 元。求两个市场股票价格均值的 95% 置信区间（$t_{0.025}(15)=2.131$）","a":"方差未知，用 $t$ 分布，自由度 $df=n-1=15$，枢轴量 $\\dfrac{\\bar X-\\mu}{S/\\sqrt n}\\sim t(15)$。\nA 股：$12.88\\pm2.131\\times\\dfrac{10.15}{\\sqrt{16}}=12.88\\pm5.41$，即 $(7.47,\\ 18.29)$。\nH 股：$10.33\\pm2.131\\times\\dfrac{8.36}{\\sqrt{16}}=10.33\\pm4.45$，即 $(5.88,\\ 14.78)$。\n两区间重叠较大，仅从均值区间看不足以断言两市场定价存在显著差异（严格判断需作两样本或配对均值检验）。","src":"2017 北大光华 431 统计真题"},
    "ts06": {"q":"政府收集 20 个省市的数据研究居民生活水平的影响因素，得到模型 $Y=0.5+0.0976\\,\\mathrm{Income}+0.056\\,\\mathrm{Interest}$（括号内为标准误 $(0.0034)\\ (0.0067)$），$R^2=0.7$。(1) 在显著性水平 10% 下对 Income 的系数作显著性检验；(2) 检验 Income 与 Interest 是否同时为 0（$t_{0.05}(17)=1.740$，$F_{0.10}(2,17)\\approx2.64$）","a":"(1) $H_0:\\beta_{\\mathrm{Income}}=0$ 对 $H_1:\\beta_{\\mathrm{Income}}\\ne0$。$$t=\\frac{0.0976}{0.0034}\\approx28.7$$自由度 $df=n-k-1=20-2-1=17$，因 $|t|=28.7>t_{0.05}(17)=1.740$，拒绝 $H_0$，Income 对 Y 有显著影响。\n(2) $H_0:\\beta_{\\mathrm{Income}}=\\beta_{\\mathrm{Interest}}=0$（联合检验）对 $H_1$：至少一个不为 0。$$F=\\frac{R^2/k}{(1-R^2)/(n-k-1)}=\\frac{0.7/2}{0.3/17}\\approx19.8$$因 $19.8>F_{0.10}(2,17)\\approx2.64$，拒绝 $H_0$，Income 与 Interest 对 Y 的影响不全为零。","src":"2015 北京大学光华 431 统计真题"},
    "ts07": {"q":"(1) 写出 $P(\\lambda)$ 的分布列；(2) 证明 $P(\\lambda)$ 的可加性；(3) 利用中心极限定理证明：$\\lim_{n\\to\\infty}e^{-n}\\sum_{k=0}^{n}\\frac{n^{k}}{k!}=\\frac12$","a":"(1) $P(X=k)=\\dfrac{\\lambda^{k}}{k!}e^{-\\lambda}$，$k=0,1,2,\\dots$，$E(X)=D(X)=\\lambda$。\n(2) 设 $X\\sim P(\\lambda_1)$，$Y\\sim P(\\lambda_2)$ 独立，由卷积：\n$$P(X+Y=k)=\\sum_{i=0}^{k}\\frac{\\lambda_1^{i}}{i!}e^{-\\lambda_1}\\cdot\\frac{\\lambda_2^{k-i}}{(k-i)!}e^{-\\lambda_2}=\\frac{e^{-(\\lambda_1+\\lambda_2)}}{k!}\\sum_{i=0}^{k}C_k^i\\lambda_1^{i}\\lambda_2^{k-i}=\\frac{(\\lambda_1+\\lambda_2)^{k}}{k!}e^{-(\\lambda_1+\\lambda_2)}$$\n即 $X+Y\\sim P(\\lambda_1+\\lambda_2)$。\n(3) 设 $X_1,\\dots,X_n$ i.i.d. $\\sim P(1)$，则 $S_n=\\sum X_i\\sim P(n)$，$P(S_n\\le n)=e^{-n}\\sum_{k=0}^{n}\\frac{n^k}{k!}$。由中心极限定理 $\\frac{S_n-n}{\\sqrt n}\\overset{d}{\\to}N(0,1)$：\n$$\\lim_{n\\to\\infty}e^{-n}\\sum_{k=0}^{n}\\frac{n^{k}}{k!}=\\lim_{n\\to\\infty}P(S_n\\le n)=\\Phi(0)=\\frac12$$","src":"2023 复旦大学 432 统计学真题"},
    "ts08": {"q":"给定二元函数 $f(x,y)=c\\left(e^{-\\frac{x^{2}+y^{2}}{2}}+xy(x^{2}-y^{2})\\sqrt e\\ I_D(x,y)\\right)$，其中 $D=\\{(x,y)\\,|\\,x^{2}+y^{2}\\le1\\}$，$c>0$。(1) 证明 $f(x,y)>0$；(2) 设 $(X,Y)$ 的联合密度为 $f(x,y)$，求 $c$；(3) 求 $X,Y$ 的边缘分布、$Cov(X,Y)$，并判断 $X,Y$ 是否独立","a":"(1) 在 $D$ 外 $f>0$；在 $D$ 内令 $x=\\rho\\cos\\theta,\\ y=\\rho\\sin\\theta$，则 $xy(x^{2}-y^{2})=\\rho^{4}\\cdot\\frac14\\sin4\\theta$：\n$$f/c=e^{-\\rho^{2}/2}+\\frac{\\rho^{4}}{4}\\sin4\\theta\\,\\sqrt e\\ge e^{-\\rho^{2}/2}-\\frac{\\rho^{4}\\sqrt e}{4}>1-\\frac{\\rho^{2}}{2}-\\frac{\\rho^{4}\\sqrt e}{4}\\ge1-\\frac12-\\frac{\\sqrt e}{4}>0$$\n(2) $xy(x^{2}-y^{2})$ 关于各变量为奇函数，$\\iint_D xy(x^{2}-y^{2})\\,dx\\,dy=0$，故\n$$1=c\\int_{\\mathbb R^2}e^{-\\frac{x^{2}+y^{2}}{2}}dx\\,dy=c\\cdot2\\pi\\ \\Rightarrow\\ c=\\frac1{2\\pi}$$\n(3) 边缘密度 $f_X(x)=\\frac{1}{\\sqrt{2\\pi}}e^{-x^{2}/2}$，$f_Y(y)=\\frac{1}{\\sqrt{2\\pi}}e^{-y^{2}/2}$（标准正态）；但 $f(x,y)\\ne f_X(x)f_Y(y)$，故 $X,Y$ 不独立。又 $E(XY)=\\iint xy\\,f(x,y)\\,dx\\,dy=0$（奇函数）、$E(X)=E(Y)=0$，故 $Cov(X,Y)=0$（不相关但不独立）。","src":"2025 复旦大学 432 统计学真题"},
    "ts09": {"q":"设 $EX=0,\\ Var(X)=\\sigma^{2}$，证明对任意 $\\varepsilon>0$：(1) $P(|X|>\\varepsilon)\\le\\dfrac{\\sigma^{2}}{\\varepsilon^{2}}$；(2) $P(X>\\varepsilon)\\le\\dfrac{\\sigma^{2}}{\\sigma^{2}+\\varepsilon^{2}}$","a":"(1) 切比雪夫不等式（马尔可夫不等式取 $g(x)=x^{2}$）：\n$$P(|X|>\\varepsilon)=P(X^{2}>\\varepsilon^{2})\\le\\frac{E(X^{2})}{\\varepsilon^{2}}=\\frac{\\sigma^{2}}{\\varepsilon^{2}}$$\n(2) 单边切比雪夫（坎特利不等式）：对 $t>0$，由 $X>\\varepsilon\\iff X+t>\\varepsilon+t$，\n$$P(X>\\varepsilon)=P(X+t>\\varepsilon+t)\\le\\frac{E(X+t)^{2}}{(\\varepsilon+t)^{2}}=\\frac{\\sigma^{2}+t^{2}}{(\\varepsilon+t)^{2}}$$\n取 $t=\\frac{\\sigma^{2}}{\\varepsilon}$ 使右端最小，得 $P(X>\\varepsilon)\\le\\dfrac{\\sigma^{2}}{\\sigma^{2}+\\varepsilon^{2}}$。","src":"2019 复旦大学 432 统计学真题"},
    "xr01": {"q":"$X_1,X_2,X_3$ 是取自期望为 $\\alpha$ 的指数分布的随机样本。求：(1) $P(X_1<X_2<X_3)$；(2) $X_{(1)}$ 的概率密度","a":"(1) 对 i.i.d. 连续型随机变量，三者次序等可能，故 $P(X_1<X_2<X_3)=\\frac{1}{3!}=\\frac16$。\n(2) 期望为 $\\alpha$ 的指数分布 $X\\sim Exp(\\frac1\\alpha)$，其生存函数 $P(X>x)=e^{-x/\\alpha}$。最小次序统计量 $X_{(1)}$：\n$$P(X_{(1)}>x)=\\left[P(X>x)\\right]^{3}=e^{-3x/\\alpha}$$\n故 $X_{(1)}\\sim Exp(\\frac3\\alpha)$，密度 $f_{X_{(1)}}(x)=\\frac3\\alpha e^{-3x/\\alpha}\\ (x>0)$。","src":"2018 复旦大学 432 统计学真题"},
    "xr02": {"q":"设有来自总体 $B(1,\\theta)$ 的 $2n$ 个独立样本 $X_1,\\dots,X_{2n}$，其中 $\\theta\\in[\\frac12,1)$。用似然比检验法给出假设检验问题 $H_0:\\theta=\\frac12$ 对 $H_1:\\theta>\\frac12$ 的拒绝域","a":"令 $T=\\sum_{i=1}^{2n}X_i$，则 $T\\sim B(2n,\\theta)$，似然\n$$L(\\theta)=\\theta^{T}(1-\\theta)^{2n-T}$$\n$H_0$ 下 $\\hat\\theta_0=\\frac12$；全空间（$\\theta\\ge\\frac12$）下 $\\hat\\theta=\\max\\{\\frac12,\\ \\bar X\\}$（$\\bar X=\\frac{T}{2n}$）。似然比为\n$$\\Lambda=\\frac{L(\\frac12)}{L(\\hat\\theta)}=\\frac{(1/2)^{2n}}{\\hat\\theta^{T}(1-\\hat\\theta)^{2n-T}}\\le1$$\n$\\Lambda$ 是 $\\bar X$ 的单调下降函数，故拒绝域 $\\Lambda<c$ 等价于 $\\bar X>c'$（似然比单峰族，由单调似然比性质为一致最优）。渐近地\n$$-2\\ln\\Lambda\\ \\overset{d}{\\longrightarrow}\\ \\chi^{2}(1)$$\n故也可取拒绝域 $\\{-2\\ln\\Lambda>\\chi^{2}_{\\alpha}(1)\\}$，即 $\\bar X$ 足够大时拒绝 $H_0:\\theta=\\frac12$。","src":"2021 清华大学 432 统计学真题"},
    "xr03": {"q":"测量一个物体的重量，测量值服从 $N(\\mu,\\sigma^{2})$。独立测量 $10$ 次得样本均值 $\\bar x=10.48$、样本标准差 $s=1.36$。求：(1) 该物体重量 $\\mu$ 的 90% 置信区间；(2) 测量标准差 $\\sigma$ 的 95% 置信区间","a":"$\\sigma^{2}$ 未知，求\\textbf{单均值} $\\mu$ 的区间 $\\Rightarrow$ 用 $t$：枢轴量 $\\dfrac{\\bar X-\\mu}{S/\\sqrt n}\\sim t(n-1)$，$n-1=9$，$t_{0.05}(9)=1.833$。\n$$\\bar x\\pm t_{0.05}(9)\\frac{s}{\\sqrt{10}}=10.48\\pm1.833\\times\\frac{1.36}{\\sqrt{10}}\\approx10.48\\pm0.79=(9.69,\\ 11.27)$$\n求\\textbf{方差/标准差}区间 $\\Rightarrow$ 用 $\\chi^{2}$：$\\dfrac{(n-1)S^{2}}{\\sigma^{2}}\\sim\\chi^{2}(n-1)$，$\\chi^{2}_{0.975}(9)=2.70$、$\\chi^{2}_{0.025}(9)=19.02$：\n$$\\left(\\frac{9\\times1.36^{2}}{19.02},\\ \\frac{9\\times1.36^{2}}{2.70}\\right)\\approx(0.875,\\ 6.17)\\ \\Rightarrow\\ \\sigma\\in(0.94,\\ 2.48)$$\n口诀：\\textbf{均值用 $t$、方差用 $\\chi^{2}$}，二者共用同一“枢轴量反解参数”的流程。","src":"2017 中国科学技术大学 432 统计学真题"},
    "xt01": {"q":"设总体的分布是 $f(x)=3x^{2},\\ 0<x<1$，从中抽取 i.i.d. 样本 $x_1,\\dots,x_n$。求 $(x_{(1)},\\dots,x_{(n)})$ 即次序统计量的密度函数","a":"样本联合密度 $f(x_1,\\dots,x_n)=3^{n}\\prod_{i=1}^{n}x_i^{2}$。由次序统计量密度公式（$n!$ 因子来自全排列）：\n$$p(x_{(1)},\\dots,x_{(n)})=n!\\,3^{n}\\prod_{i=1}^{n}x_{(i)}^{2},\\qquad 0<x_{(1)}<\\cdots<x_{(n)}<1$$","src":"2023 中国科学技术大学 812 概率论与数理统计真题"},
    "xt02": {"q":"设总体的分布函数 $F(x)$ 连续单增，$X_{(1)},\\dots,X_{(n)}$ 是来自该总体的随机样本的次序统计量，$Y_i=F(X_{(i)})$。求 $E(Y_i)$、$\\mathrm{Var}(Y_i)$ 与 $(Y_1,\\dots,Y_n)^{T}$ 的协方差矩阵","a":"因 $F(X)\\sim U(0,1)$，故 $Y_i=F(X_{(i)})$ 恰为 $U(0,1)$ 样本的第 $i$ 个次序统计量，$Y_i\\sim\\mathrm{Beta}(i,\\ n-i+1)$：\n$$E(Y_i)=\\frac{i}{n+1},\\qquad \\mathrm{Var}(Y_i)=\\frac{i(n-i+1)}{(n+1)^{2}(n+2)}$$\n$(Y_i,Y_j)$（$i<j$）的联合密度为 $f_{ij}(x,y)=\\dfrac{n!}{(i-1)!(j-i-1)!(n-j)!}x^{i-1}(y-x)^{j-i-1}(1-y)^{n-j}$，据此积分得协方差矩阵元素。","src":"2019 复旦大学 432 统计学真题"},
    "xt03": {"q":"设总体分布为 $f(x)=3x^{2},\\ 0<x<1$，样本 i.i.d.。证明：$\\dfrac{X_{(i)}}{X_{(j)}}$ 与 $X_{(j)}$ 相互独立，其中 $1\\le i<j\\le n$","a":"由次序统计量公式，$(X_{(i)},X_{(j)})$ 的联合密度为\n$$p_{ij}(u,v)=C\\,u^{3i-1}v^{2}(v^{3}-u^{3})^{j-i-1}(1-v^{3})^{n-j},\\quad 0<u<v<1$$\n作变换 $Z=\\dfrac{u}{v}$、$V=v$（雅可比 $=V$），化简后密度可分离为 $f_Z(z)\\cdot f_V(v)$，其中 $f_V$ 即 $X_{(j)}$ 的边缘密度，故 $Z$ 与 $V=X_{(j)}$ 独立。","src":"2023 中国科学技术大学 812 概率论与数理统计真题"},
    "xt04": {"q":"设 $X_1,\\dots,X_n$ 为来自总体 $f(x;\\theta)$ 的简单随机样本。叙述充分统计量的定义，并判断 $T=\\sum_{k=1}^{n}X_k$ 是否为 $\\theta$ 的充分统计量（其中 $f(x;\\theta)=\\theta(1-\\theta)^{x},\\ x=0,1,\\dots$）","a":"充分统计量：若给定 $T$ 后样本的条件分布与 $\\theta$ 无关，则 $T$ 为充分统计量。\n$f(x;\\theta)=\\theta(1-\\theta)^{x}$ 的样本联合分布：\n$$f(x_1,\\dots,x_n;\\theta)=\\theta^{n}(1-\\theta)^{\\sum x_i}=\\underbrace{\\theta^{n}(1-\\theta)^{T}}_{g(T,\\theta)}\\cdot\\underbrace{1}_{h(x)}$$\n由因子分解定理，$T=\\sum_{k=1}^{n}X_k$ 是 $\\theta$ 的充分统计量。","src":"2023 复旦大学 432 统计学真题"},
    "xt05": {"q":"设 $X_1,X_2,X_3$ 是取自 $f(x;\\theta)=\\theta x^{\\theta-1}\\ (0<x<1)$ 的简单随机样本，$T=\\sum_{i=1}^{n}\\ln X_i$。叙述并运用充分完备统计量判断（或求 UMVUE）","a":"$X\\sim\\mathrm{Beta}(\\theta,1)$ 为指数族，故 $T'=\\sum\\ln X_i$（等价地 $-\\sum\\ln X_i$）是充分完备统计量。又 $Y=-\\ln X\\sim Exp(\\theta)$，$\\sum Y_i\\sim\\Gamma(n,\\theta)$，可由此构造 $\\theta$ 的无偏、基于充分完备统计量的估计，由 Lehmann-Scheffé 定理即得其 UMVUE。","src":"2024 复旦大学 432 统计学真题","a2":"💡巧解（指数族结论直接判完备）：凡形如 $f(x;\\theta)=h(x)\\exp\\{c(\\theta)T(x)+d(\\theta)\\}$ 的单参指数族，其 $T=\\sum T(x_i)$ 自动满足“充分 $+$ 完备”，无需从头证完备性。"},
    "xt06": {"q":"设 $X_1,\\dots,X_n$ 是从参数 $\\lambda$ 的 Poisson 分布总体中抽取的一组随机样本，$\\lambda$ 未知。(1) 求 $\\lambda$ 的充分完备统计量；(2) 求 $g_1(\\lambda)=\\lambda^{3}$ 的最小方差无偏估计（UMVUE）","a":"(1) $X\\sim P(\\lambda)$ 为指数族，$T=\\sum_{i=1}^{n}X_i$ 是 $\\lambda$ 的充分完备统计量（且 $T\\sim P(n\\lambda)$）。\n(2) 由 $E\\left[\\frac{T(T-1)(T-2)}{n^{3}}\\right]=\\lambda^{3}$（利用 $E[T^{(3)}]=(n\\lambda)^{3}$ 阶乘矩），故\n$$\\hat g_1(T)=\\frac{T(T-1)(T-2)}{n^{3}}$$\n是基于充分完备统计量的无偏估计，由 Lehmann-Scheffé 定理为 $\\lambda^{3}$ 的 UMVUE。","src":"2018 中国科学技术大学 812 概率论与数理统计真题"},
    "xt07": {"q":"已知命题 $p$：随机变量 $X$ 与 $Y$ 相互独立；命题 $q$：$X+Y$ 的特征函数是 $X$ 与 $Y$ 特征函数的乘积。则（  ）\\\\\nA. $p$ 成立可推出 $q$ 成立，但反之不行\\\\\nB. $q$ 成立可推出 $p$ 成立，但反之不行\\\\\nC. 它们互为充要条件\\\\\nD. 以上说法都不对","a":"选 A。\n$p\\Rightarrow q$ 显然：独立时 $\\varphi_{X+Y}(t)=\\varphi_X(t)\\varphi_Y(t)$。\n但 $q\\not\\Rightarrow p$：取 $X=Y\\sim\\mathrm{Cauchy}(0,1)$，则 $\\varphi_{X+Y}(t)=e^{-2|t|}=\\varphi_X(t)\\varphi_Y(t)$，而 $X,Y$ 显然不独立。判断独立性须用\\textbf{联合}特征函数 $\\varphi_{X,Y}(s,t)=\\varphi_X(s)\\varphi_Y(t)$。","src":"2021 南开大学 432 统计学真题"},
    "xt08": {"q":"$\\{N(t),t\\ge0\\}$ 是强度为 $\\lambda$ 的泊松过程，当 $0<t<s$ 时，计算 $E[N(s)\\,|\\,N(t)]$ 以及当 $N(s)=n$ 时 $N(t)$ 的条件分布","a":"由独立增量性与增量分布 $N(s)-N(t)\\sim P(\\lambda(s-t))$：\n$$E[N(s)\\,|\\,N(t)]=E[N(t)+N(s)-N(t)\\,|\\,N(t)]=N(t)+\\lambda(s-t)$$\n（条件期望中 $N(t)$ 已知、增量期望为 $\\lambda(s-t)$。）\n$N(t)\\,|\\,N(s)=n\\ \\sim\\ B\\!\\left(n,\\ \\frac{t}{s}\\right)$，因为 $[0,s]$ 内 $n$ 个到达时刻独立均匀分布，落入 $[0,t]$ 的概率为 $\\dfrac{t}{s}$。","src":"2018 北京大学数院 431 金融学综合真题","a2":"💡巧解（条件分布二项）：把 $N(t)$ 看作 $N(s)$ 个点中落入前 $t$ 段的个数，逐点独立同概率 $p=t/s$，故 $N(t)\\,|\\,N(s)=n\\sim B(n,t/s)$。"},
    "xt09": {"q":"有随机变量序列 $\\{X_n\\}$，记 $Y_n=\\frac{1}{n}\\sum_{i=1}^{n}X_i$，$a_n=E(Y_n)$。证明：$\\{X_n\\}$ 服从大数定律的充要条件是 $\\lim_{n\\to\\infty}E\\left[\\dfrac{(Y_n-a_n)^{2}}{1+(Y_n-a_n)^{2}}\\right]=0$","a":"令 $\\Delta_n=Y_n-a_n$。大数定律即 $\\Delta_n\\overset{P}{\\to}0$。\n必要性：若 $\\Delta_n\\overset{P}{\\to}0$，因为 $\\dfrac{\\Delta_n^{2}}{1+\\Delta_n^{2}}\\le1$ 且收敛到 $0$，由控制收敛定理极限为 $0$。\n充分性：$<\\Delta_n^{2}/(1+\\Delta_n^{2})\\to0$ 蕴含依概率收敛（该有界函数刻画“$\\Delta_n$ 不趋 0”的概率趋于 $0$），即 $\\Delta_n\\overset{P}{\\to}0$。此式对$\\mathrm{Var}$ 无穷（仅一阶矩）的情形也适用。","src":"2021 南开大学 432 统计学真题"},
    "xt10": {"q":"考虑多元回归模型 $Z=Y\\beta+e$，其中 $Y=(Y_1^{T},\\dots,Y_n^{T})^{T}$，$Y_i\\in\\mathbb R^{d}$，$E(e)=0$，$\\mathrm{Var}(e)=\\sigma^{2}I_n$，$Y$ 已知且列满秩。若 $\\hat\\beta$ 是 $\\beta$ 的最小二乘估计。(1) 证明 $\\mathrm{Var}(\\hat\\beta)=\\sigma^{2}(Y^{T}Y)^{-1}$；(2) 证明残差平方和 $Q(\\hat\\beta)$ 的期望为 $(n-d)\\sigma^{2}$","a":"(1) $\\hat\\beta=(Y^{T}Y)^{-1}Y^{T}Z$，由 $\\mathrm{Var}(Z)=\\sigma^{2}I_n$：\n$$\\mathrm{Var}(\\hat\\beta)=(Y^{T}Y)^{-1}Y^{T}\\mathrm{Var}(Z)Y(Y^{T}Y)^{-1}=\\sigma^{2}(Y^{T}Y)^{-1}$$\n(2) 残差 $Z-Y\\hat\\beta=(I_n-H)Z$，$H=Y(Y^{T}Y)^{-1}Y^{T}$ 为幂等投影阵且 $\\mathrm{tr}(H)=d$，故 $E\\left[Q(\\hat\\beta)\\right]=\\sigma^{2}\\mathrm{tr}(I_n-H)=\\sigma^{2}(n-d)$。","src":"2024 北京大学数院 431 金融学综合真题"},
    "xt11": {"q":"叙述题：(1) 叙述多重共线性的定义；(2) 如何判断多重共线性；(3) 如何消除多重共线性","a":"(1) 多元回归中自变量间存在（近似）线性相关，使 $X^{T}X$ 接近奇异、$\\hat\\beta$ 方差被放大。\n(2) 判断：自变量两两相关系数高；$VIF_j=\\frac{1}{1-R_j^{2}}>10$；$X^{T}X$ 最小特征值接近 0；整体 $F$ 显著但各系数 $t$ 不显著。\n(3) 消除：删除/合并高相关变量；逐步回归筛选；主成分回归；岭回归；增加样本量。","src":"2023 中国科学技术大学 432 统计学真题"},
    "xt12": {"q":"假设 $y_1,\\dots,y_n$ 独立同服从下述异方差线性回归模型：$y_i=\\beta_0+\\beta_1x_i+\\varepsilon_i$，其中 $\\varepsilon_i\\sim N(0,i^{2})$，$x_1,\\dots,x_n$ 是已知数。(1) 求对数似然函数；(2) 写出 $(\\beta_0,\\beta_1)$ 极大似然估计的数学公式（等价于加权最小二乘）","a":"$\\varepsilon_i\\sim N(0,i^{2})$，$\\mathrm{Var}(\\varepsilon_i)=i^{2}$ 为异方差。对数似然\n$$\\ell(\\beta_0,\\beta_1)=-\\frac{n}{2}\\ln 2\\pi-\\sum_{i=1}^{n}\\ln i-\\frac{1}{2}\\sum_{i=1}^{n}\\frac{(y_i-\\beta_0-\\beta_1x_i)^{2}}{i^{2}}$$\n对 $\\beta$ 求导为 0，得 MLE（即加权最小二乘，权重 $w_i=1/i^{2}$）满足\n$$\\sum\\frac{y_i-\\hat\\beta_0-\\hat\\beta_1x_i}{i^{2}}=0,\\quad \\sum\\frac{x_i(y_i-\\hat\\beta_0-\\hat\\beta_1x_i)}{i^{2}}=0$$\n即对变换 $\\dfrac{y_i}{i}=\\beta_0\\frac1i+\\beta_1\\frac{x_i}{i}+\\dfrac{\\varepsilon_i}{i}$ 做 OLS。","src":"2011 北京大学光华 431 金融学综合真题","a2":"💡巧解（White 检验对应）：若方差具体形式 $\\mathrm{Var}(\\varepsilon_i)=i^{2}$ 已知，直接用 WLS（等价 GLS）；若未知，则用 White 检验 $W=nR^{2}\\sim\\chi^{2}(p)$ 诊断异方差后取稳健标准误。"},
    "xt13": {"q":"公司甲同时在大陆 A 股及香港 H 股上市，现有它在 A 股市场和 H 股市场上过去一年每天的回报观测 $X_i,Y_i$。请给出两种检验方法，检验该股票在 A 股和 H 股上的回报均值（分布）是否相等，并讨论其假设条件","a":"方法一：\\textbf{配对样本 $t$ 检验}。令 $D_i=X_i-Y_i$，$H_0:\\mu_D=0$，$t=\\dfrac{\\bar D}{S_D/\\sqrt n}\\sim t(n-1)$。\n方法二：$n_1,n_2$ 较大时。方法三（\\textbf{非参数——Wilcoxon 秩和检验}，不要求正态）：合并两样本升序排秩 $R_i$，$W_X=\\sum R(X_i)$，\n$$E(W_X)=\\frac{n_1(n_1+n_2+1)}{2},\\quad \\mathrm{Var}(W_X)=\\frac{n_1n_2(n_1+n_2+1)}{12},\\quad Z=\\frac{W_X-E(W_X)}{\\sqrt{\\mathrm{Var}(W_X)}}\\dot\\sim N(0,1)$$\n$|Z|>z_{\\alpha/2}$ 拒绝 $H_0$。\\textbf{讨论}：配对 $t$ 需差 $D_i$ 正态；秩和检验不需要正态（更稳健），但只利用相对次序、损失部分数值信息。本例为明显配对样本，配对 $t$ 检验利用成对结构消除共同因素、更合理。","src":"2017 北京大学光华 431 金融学综合真题"},
    "xt14": {"q":"设总体 $X$ 的概率分布为：$P(X=-1)=2p$，$P(X=0)=1-5p$，$P(X=1)=3p$，其中 $p>0$ 为未知参数。现有一样本容量 $n=60$ 的简单随机样本，其中 0 出现了 30 次，1 和 -1 均出现 15 次。(1) 求 $p$ 的极大似然估计 $\\hat p$；(2) 在显著性水平 $\\alpha=0.05$ 下，用 $\\hat p$ 和拟合优度检验判断该组样本是否来自总体 $X$","a":"(1) 似然 $L(p)\\propto(3p)^{15}(1-5p)^{30}(2p)^{15}$，$\\ln L=30\\ln p+30\\ln(1-5p)+\\text{const}$，令 $\\frac{d}{dp}=0$：\n$$\\frac{30}{p}-\\frac{150}{1-5p}=0\\Rightarrow\\hat p=\\frac{1}{10}=0.1$$\n（$1-5p=0.5\\ge0$ 成立）。\n(2) $\\chi^{2}$ 拟合优度检验：期望频数 $np_i$ 为 $(2\\hat p\\cdot60,\\ (1-5\\hat p)\\cdot60,\\ 3\\hat p\\cdot60)=(12,30,18)$，观测为 $(15,30,15)$：\n$$\\chi^{2}=\\frac{(15-12)^{2}}{12}+\\frac{(30-30)^{2}}{30}+\\frac{(15-18)^{2}}{18}=\\frac{9}{12}+\\frac{9}{18}=1.25$$\n自由度 $=3-1-1=1$（估计了 $p$），$\\chi^{2}_{0.05}(1)=3.84$，因 $1.25<3.84$，\\textbf{不拒绝} $H_0$，可以认为该组样本来自总体 $X$。","src":"2016 中国科学技术大学 812 概率论与数理统计真题","a2":"💡巧解（K-S/经验分布印证）：拟合优度亦可比较经验分布 $F_n$ 与理论分布 $F_0$（$K$-$S$ 统计量 $D_n=\\sup|F_n-F_0|$），此处用 $\\chi^{2}$ 组合更简单高效。"},
    "xt15": {"q":"叙述 $2\\times2$ 的列联表独立性检验原理","a":"设有两个分类变量 $X,Y$，各取 $m,n$ 种值，观测频数 $N_{ij}$，行合计 $N_{i\\cdot}$、列合计 $N_{\\cdot j}$、总 $N$。$H_0$：$X$ 与 $Y$ 相互独立。\n独立时 $\\dfrac{N_{ij}}{N}\\approx\\dfrac{N_{i\\cdot}}{N}\\cdot\\dfrac{N_{\\cdot j}}{N}$，即期望频数 $\\hat e_{ij}=\\dfrac{N_{i\\cdot}N_{\\cdot j}}{N}$。以 $\\dfrac{1}{N_{i\\cdot}N_{\\cdot j}}$ 为权重标准化偏离，得\n$$\\chi^{2}=\\sum_{i=1}^{m}\\sum_{j=1}^{n}\\frac{(N_{ij}-\\hat e_{ij})^{2}}{\\hat e_{ij}}\\sim\\chi^{2}((m-1)(n-1))$$\n$\\chi^{2}>\\chi^{2}_{\\alpha}((m-1)(n-1))$ 则拒绝 $H_0$，认为 $X,Y$ 不独立。对 $2\\times2$ 表自由度 $=1$，可用 Yates 连续性校正：$\\chi^{2}_{c}=\\sum\\dfrac{(|N_{ij}-\\hat e_{ij}|-\\frac12)^{2}}{\\hat e_{ij}}$。","src":"2020 中国科学技术大学 432 统计学真题"},
    "jj01": {"q":"一条线段随机分成三段，求能组成三角形的概率。","a":"等价于在 $[0,1]$ 上取两个均匀随机点（将其排序后得到三段），即三段长度 $(X_1,X_2,X_3)$、$X_1+X_2+X_3=1$ 在\\textbf{单纯形}上均匀分布。能成三角形 $\\Leftrightarrow$ 最长段 $<\\frac12$，即\\textbf{同时} $X_1,X_2,X_3<\\frac12$。\n在单纯形中 $\\{X_1\\ge\\frac12\\}$ 的“面积”占 $\\frac14$（三个角各 $\\frac14$），故\n$$P(\\text{能成三角形})=1-3\\times\\frac14=\\frac14$$\n答案：$\\frac14$（B）。","src":"南开大学-432 统计学-2021 年"},
    "jj06": {"q":"考虑一元线性回归模型 $Y_i=\\beta x_i+\\varepsilon_i$，$i=1,\\dots,n$，其中 $E(\\varepsilon_i)=0$，$\\mathrm{Var}(\\varepsilon_i)=\\sigma^2$，$\\mathrm{Cov}(\\varepsilon_i,\\varepsilon_j)=0\\ (i\\ne j)$。求 $\\beta$ 的最小二乘估计 $\\hat\\beta$，并证明 $\\hat\\beta$ 为 $\\beta$ 的无偏估计。","a":"OLS：最小化 $\\sum(Y_i-\\beta x_i)^2$，对 $\\beta$ 求导并令为 0：\n$$\\hat\\beta=\\frac{\\sum x_iY_i}{\\sum x_i^2}$$\n无偏性：由 $E(Y_i)=\\beta x_i$，$E(\\hat\\beta)=\\frac{\\sum x_iE(Y_i)}{\\sum x_i^2}=\\frac{\\sum x_i\\cdot\\beta x_i}{\\sum x_i^2}=\\beta$，故 $\\hat\\beta$ 是 $\\beta$ 的无偏估计。又 $\\mathrm{Var}(\\hat\\beta)=\\frac{\\sigma^2}{\\sum x_i^2}$；在题给的“同方差、无自相关、外生（$E(\\varepsilon_i)=0$）”条件下，由 Gauss-Markov 定理知 $\\hat\\beta$ 是 $\\beta$ 的 BLUE。","src":"中国科学技术大学-432 统计学-2016 年"},
    "jj11": {"q":"为研究旅游购物金额 $Y$（美元）与性别 $D$ 的关系，同时纳入月收入 $X$ 及交互项 $X:D$，回归结果（$D=1$ 女、$D=0$ 男，$\\alpha=0.05$，各系数均显著）：Intercept=$57.61$，$X$=$0.0118$，$D$=$31.87$，$X:D$=$-0.0088$。(1) 解释 $D$ 的回归系数；(2) 解释 $X:D$ 的回归系数。","a":"模型 $\\hat Y=57.61+0.0118X+31.87D-0.0088(X\\cdot D)$。\n男（$D=0$）：$\\hat Y=57.61+0.0118X$；女（$D=1$）：$\\hat Y=89.48+0.0030X$。\n(1) $D$ 的系数 $31.87$：女性比男性的基础购物支出（截距）高 $31.87$ 美元；$|t|=8.32>t_{0.025}$，显著，说明性别在截距上有显著差异。\n(2) $X:D$ 的系数 $-0.0088$：收入的边际影响在女性中比男性低 $0.0088$——每增加 1 美元收入，男性购物增加 $0.0118$，女性仅增加 $0.0118-0.0088=0.0030$；$|t|=6.69>t_{0.025}$，显著，说明组间斜率有系统差异（交互效应存在）。","src":"上海交通大学-432 统计学-2020 年"},
  };

  // ============ 知识点关系标签 ============
  const REL = {
  pb13: [ { to: 'pb08', tag: '前置' }, { to: 'pb10', tag: '相关' } ],
  pb12: [ { to: 'll03', tag: '应用' }, { to: 'pb02', tag: '相关' } ],
  ll08: [ { to: 'nc09', tag: '前置' }, { to: 'll01', tag: '应用' }, { to: 'll04', tag: '相关' } ],
  ll09: [ { to: 'll04', tag: '同类' }, { to: 'll05', tag: '同类' } ],
  sm12: [ { to: 'sm07', tag: '前置' }, { to: 'sm08', tag: '前置' }, { to: 'test11', tag: '应用' }, { to: 'test12', tag: '应用' }, { to: 'test13', tag: '应用' } ],
  sm13: [ { to: 'xt01', tag: '前置' }, { to: 'sm02', tag: '相关' } ],
  sm14: [ { to: 'rv04', tag: '相关' }, { to: 'sm01', tag: '前置' } ],
  sm15: [ { to: 'sm13', tag: '前置' }, { to: 'sm14', tag: '同类' } ],
  sm16: [ { to: 'test16', tag: '相关' }, { to: 'rv11', tag: '相关' } ],
  nc17: [ { to: 'nc03', tag: '前置' }, { to: 'nc13', tag: '应用' } ],
  nc18: [ { to: 'nc08', tag: '前置' }, { to: 'test16', tag: '相关' } ],
  nc19: [ { to: 'nc06', tag: '前置' }, { to: 'mv05', tag: '应用' } ],
  nc20: [ { to: 'nc11', tag: '前置' }, { to: 'nc03', tag: '前置' } ],
  est22: [ { to: 'est02', tag: '相关' }, { to: 'est03', tag: '相关' } ],
  est23: [ { to: 'est06', tag: '前置' }, { to: 'est02', tag: '相关' } ],
  est24: [ { to: 'est16', tag: '前置' }, { to: 'est08', tag: '相关' }, { to: 'test05', tag: '相关' } ],
  reg13: [ { to: 'reg03', tag: '前置' }, { to: 'reg01', tag: '前置' } ],
  reg14: [ { to: 'reg04', tag: '前置' }, { to: 'sy03', tag: '相关' } ],
  pb01: [ { to: 'pb02', tag: '前置' }, { to: 'pb11', tag: '相关' }, { to: 'pb11', tag: '同类' } ],
  pb02: [ { to: 'pb01', tag: '前置' }, { to: 'pb03', tag: '相关' }, { to: 'rv17', tag: '相关' }, { to: 'jj01', tag: '同类' } ],
  pb03: [ { to: 'pb10', tag: '特例' }, { to: 'pb04', tag: '相关' }, { to: 'pb05', tag: '相关' }, { to: 'pb04', tag: '同类' } ],
  pb04: [ { to: 'pb05', tag: '前置' }, { to: 'pb06', tag: '前置' }, { to: 'pb08', tag: '相关' }, { to: 'pb05', tag: '同类' } ],
  pb05: [ { to: 'pb04', tag: '前置' }, { to: 'pb06', tag: '前置' } ],
  pb06: [ { to: 'pb07', tag: '前置' }, { to: 'pb04', tag: '前置' }, { to: 'pb07', tag: '同类' } ],
  pb07: [ { to: 'pb06', tag: '前置' }, { to: 'pb04', tag: '前置' } ],
  pb08: [ { to: 'pb05', tag: '特例' }, { to: 'mv04', tag: '相关' }, { to: 'pb04', tag: '相关' }, { to: 'pb09', tag: '同类' } ],
  pb09: [ { to: 'pb03', tag: '相关' }, { to: 'pb10', tag: '相关' }, { to: 'pb10', tag: '同类' } ],
  pb10: [ { to: 'pb03', tag: '特例' }, { to: 'pb09', tag: '相关' } ],
  pb11: [ { to: 'pb01', tag: '相关' }, { to: 'pb03', tag: '相关' } ],
  rv01: [ { to: 'rv02', tag: '相关' }, { to: 'rv03', tag: '相关' }, { to: 'rv02', tag: '同类' } ],
  rv02: [ { to: 'rv01', tag: '前置' }, { to: 'rv04', tag: '相关' } ],
  rv03: [ { to: 'rv01', tag: '相关' }, { to: 'nc01', tag: '相关' }, { to: 'rv04', tag: '同类' } ],
  rv04: [ { to: 'rv01', tag: '相关' }, { to: 'nc01', tag: '相关' } ],
  rv05: [ { to: 'rv06', tag: '特例' }, { to: 'nc13', tag: '相关' }, { to: 'rv06', tag: '同类' } ],
  rv06: [ { to: 'rv05', tag: '推广' }, { to: 'rv20', tag: '相关' }, { to: 'll05', tag: '相关' }, { to: 'rv07', tag: '同类' } ],
  rv07: [ { to: 'rv20', tag: '相关' }, { to: 'rv06', tag: '相关' }, { to: 'nc09', tag: '应用' }, { to: 'rv08', tag: '同类' } ],
  rv08: [ { to: 'rv18', tag: '特例' }, { to: 'nc13', tag: '相关' } ],
  rv09: [ { to: 'nc13', tag: '相关' }, { to: 'rv10', tag: '相关' }, { to: 'rv15', tag: '应用' }, { to: 'rv10', tag: '同类' } ],
  rv10: [ { to: 'rv19', tag: '特例' }, { to: 'nc13', tag: '相关' }, { to: 'rv11', tag: '同类' } ],
  rv11: [ { to: 'rv13', tag: '特例' }, { to: 'rv12', tag: '前置' }, { to: 'sm04', tag: '结论' }, { to: 'mv05', tag: '相关' }, { to: 'rv12', tag: '同类' } ],
  rv12: [ { to: 'rv11', tag: '前置' }, { to: 'sm04', tag: '相关' }, { to: 'rv16', tag: '相关' }, { to: 'rv13', tag: '同类' } ],
  rv13: [ { to: 'rv11', tag: '特例' }, { to: 'sm05', tag: '前置' } ],
  rv14: [ { to: 'rv15', tag: '相关' }, { to: 'rv03', tag: '前置' }, { to: 'rv15', tag: '同类' } ],
  rv15: [ { to: 'rv14', tag: '相关' }, { to: 'mv06', tag: '相关' }, { to: 'mv07', tag: '相关' }, { to: 'ys01', tag: '同类' } ],
  rv16: [ { to: 'rv11', tag: '前置' }, { to: 'nc02', tag: '相关' }, { to: 'rv17', tag: '同类' } ],
  rv17: [ { to: 'rv06', tag: '相关' }, { to: 'nc13', tag: '相关' }, { to: 'rv18', tag: '同类' } ],
  rv18: [ { to: 'rv08', tag: '推广' }, { to: 'nc13', tag: '相关' }, { to: 'rv19', tag: '同类' } ],
  rv19: [ { to: 'rv10', tag: '推广' }, { to: 'rv17', tag: '相关' } ],
  rv20: [ { to: 'rv07', tag: '相关' }, { to: 'rv06', tag: '相关' }, { to: 'sx02', tag: '同类' } ],
  mv01: [ { to: 'mv02', tag: '前置' }, { to: 'rv01', tag: '相关' }, { to: 'mv02', tag: '同类' } ],
  mv02: [ { to: 'mv01', tag: '前置' }, { to: 'mv03', tag: '前置' }, { to: 'mv03', tag: '同类' } ],
  mv03: [ { to: 'mv01', tag: '前置' }, { to: 'mv10', tag: '相关' }, { to: 'mv04', tag: '同类' } ],
  mv04: [ { to: 'mv01', tag: '前置' }, { to: 'pb08', tag: '相关' } ],
  mv05: [ { to: 'mv04', tag: '相关' }, { to: 'rv11', tag: '相关' }, { to: 'mv08', tag: '同类' } ],
  mv06: [ { to: 'mv11', tag: '相关' }, { to: 'rv15', tag: '相关' }, { to: 'mv11', tag: '同类' } ],
  mv07: [ { to: 'mv01', tag: '前置' }, { to: 'rv15', tag: '方法' }, { to: 'xt01', tag: '同类' } ],
  mv08: [ { to: 'mv01', tag: '前置' }, { to: 'mv09', tag: '相关' } ],
  mv09: [ { to: 'mv01', tag: '前置' }, { to: 'nc01', tag: '相关' } ],
  mv10: [ { to: 'mv03', tag: '相关' }, { to: 'mv02', tag: '前置' } ],
  mv11: [ { to: 'mv06', tag: '相关' }, { to: 'mv01', tag: '前置' } ],
  nc01: [ { to: 'nc02', tag: '前置' }, { to: 'nc03', tag: '前置' }, { to: 'nc03', tag: '同类' } ],
  nc02: [ { to: 'nc01', tag: '前置' }, { to: 'nc05', tag: '相关' }, { to: 'nc12', tag: '相关' }, { to: 'nc05', tag: '同类' } ],
  nc03: [ { to: 'nc04', tag: '相关' }, { to: 'nc01', tag: '前置' }, { to: 'nc09', tag: '应用' } ],
  nc04: [ { to: 'nc03', tag: '相关' }, { to: 'nc05', tag: '相关' }, { to: 'nc01', tag: '前置' } ],
  nc05: [ { to: 'nc03', tag: '前置' }, { to: 'nc06', tag: '相关' }, { to: 'nc07', tag: '相关' }, { to: 'nc12', tag: '同类' } ],
  nc06: [ { to: 'nc07', tag: '前置' }, { to: 'nc12', tag: '相关' }, { to: 'nc07', tag: '同类' } ],
  nc07: [ { to: 'nc06', tag: '前置' }, { to: 'nc10', tag: '相关' }, { to: 'reg10', tag: '应用' }, { to: 'nc10', tag: '同类' } ],
  nc08: [ { to: 'nc01', tag: '相关' }, { to: 'nc03', tag: '相关' }, { to: 'nc13', tag: '同类' } ],
  nc09: [ { to: 'nc03', tag: '前置' }, { to: 'll07', tag: '相关' }, { to: 'nc14', tag: '同类' } ],
  nc10: [ { to: 'nc07', tag: '相关' }, { to: 'mv04', tag: '相关' }, { to: 'mv05', tag: '相关' } ],
  nc11: [ { to: 'mv03', tag: '相关' }, { to: 'nc01', tag: '相关' }, { to: 'nc15', tag: '同类' } ],
  nc12: [ { to: 'nc06', tag: '相关' }, { to: 'nc05', tag: '相关' } ],
  nc13: [ { to: 'nc01', tag: '前置' }, { to: 'nc03', tag: '前置' } ],
  nc14: [ { to: 'nc09', tag: '相关' }, { to: 'nc01', tag: '前置' } ],
  nc15: [ { to: 'nc16', tag: '同类' }, { to: 'nc08', tag: '相关' } ],
  nc16: [ { to: 'nc15', tag: '同类' }, { to: 'nc08', tag: '相关' } ],
  ll01: [ { to: 'll02', tag: '同类' }, { to: 'll03', tag: '同类' } ],
  ll02: [ { to: 'll01', tag: '同类' }, { to: 'll04', tag: '相关' }, { to: 'll03', tag: '同类' } ],
  ll03: [ { to: 'll01', tag: '同类' }, { to: 'll05', tag: '相关' } ],
  ll04: [ { to: 'll05', tag: '相关' }, { to: 'rv11', tag: '相关' }, { to: 'sm04', tag: '相关' }, { to: 'll05', tag: '同类' } ],
  ll05: [ { to: 'll04', tag: '相关' }, { to: 'rv06', tag: '前置' }, { to: 'rv20', tag: '相关' } ],
  ll06: [ { to: 'll02', tag: '相关' }, { to: 'll04', tag: '相关' }, { to: 'll07', tag: '同类' } ],
  ll07: [ { to: 'nc09', tag: '相关' }, { to: 'll01', tag: '相关' } ],
  sm01: [ { to: 'sm02', tag: '前置' }, { to: 'sm03', tag: '前置' }, { to: 'sm02', tag: '同类' } ],
  sm02: [ { to: 'sm01', tag: '前置' }, { to: 'sm11', tag: '相关' }, { to: 'sm03', tag: '同类' } ],
  sm03: [ { to: 'sm01', tag: '前置' }, { to: 'sm06', tag: '相关' } ],
  sm04: [ { to: 'rv11', tag: '前置' }, { to: 'sm02', tag: '前置' }, { to: 'll04', tag: '相关' }, { to: 'sm11', tag: '同类' } ],
  sm05: [ { to: 'sm06', tag: '前置' }, { to: 'sm10', tag: '相关' }, { to: 'sm06', tag: '同类' } ],
  sm06: [ { to: 'sm05', tag: '前置' }, { to: 'sm03', tag: '前置' }, { to: 'est10', tag: '应用' }, { to: 'sm07', tag: '同类' } ],
  sm07: [ { to: 'sm05', tag: '前置' }, { to: 'sm08', tag: '相关' }, { to: 'est09', tag: '应用' }, { to: 'test07', tag: '应用' }, { to: 'sm08', tag: '同类' } ],
  sm08: [ { to: 'sm05', tag: '前置' }, { to: 'sm07', tag: '相关' }, { to: 'reg03', tag: '应用' }, { to: 'test13', tag: '应用' } ],
  sm09: [ { to: 'sm04', tag: '相关' }, { to: 'est08', tag: '相关' }, { to: 'test06', tag: '应用' }, { to: 'sm10', tag: '同类' } ],
  sm10: [ { to: 'sm05', tag: '前置' }, { to: 'sm07', tag: '前置' } ],
  sm11: [ { to: 'sm02', tag: '相关' }, { to: 'nc01', tag: '前置' } ],
  est01: [ { to: 'est02', tag: '前置' }, { to: 'est05', tag: '相关' }, { to: 'est13', tag: '同类' } ],
  est02: [ { to: 'est01', tag: '前置' }, { to: 'est13', tag: '相关' }, { to: 'est03', tag: '同类' } ],
  est03: [ { to: 'est02', tag: '相关' }, { to: 'est13', tag: '相关' }, { to: 'est04', tag: '同类' } ],
  est04: [ { to: 'est02', tag: '相关' }, { to: 'est13', tag: '相关' } ],
  est05: [ { to: 'est01', tag: '相关' }, { to: 'est06', tag: '同类' } ],
  est06: [ { to: 'est05', tag: '同类' }, { to: 'est12', tag: '前置' }, { to: 'ys02', tag: '同类' } ],
  est07: [ { to: 'est08', tag: '前置' }, { to: 'est16', tag: '方法' }, { to: 'est08', tag: '同类' } ],
  est08: [ { to: 'est07', tag: '前置' }, { to: 'sm04', tag: '前置' }, { to: 'test06', tag: '相关' }, { to: 'est09', tag: '同类' } ],
  est09: [ { to: 'est08', tag: '相关' }, { to: 'sm07', tag: '前置' }, { to: 'test07', tag: '相关' }, { to: 'est10', tag: '同类' } ],
  est10: [ { to: 'est08', tag: '相关' }, { to: 'sm06', tag: '前置' }, { to: 'test08', tag: '相关' } ],
  est11: [ { to: 'sm04', tag: '相关' }, { to: 'sm06', tag: '相关' } ],
  est12: [ { to: 'est06', tag: '前置' }, { to: 'est14', tag: '相关' } ],
  est13: [ { to: 'est02', tag: '前置' }, { to: 'est03', tag: '前置' } ],
  est14: [ { to: 'est15', tag: '相关' }, { to: 'est01', tag: '相关' }, { to: 'est15', tag: '同类' } ],
  est15: [ { to: 'est14', tag: '相关' }, { to: 'est12', tag: '相关' }, { to: 'xt04', tag: '同类' } ],
  est16: [ { to: 'est07', tag: '方法' }, { to: 'est08', tag: '应用' }, { to: 'ts05', tag: '同类' } ],
  est17: [ { to: 'est08', tag: '推广' }, { to: 'test11', tag: '相关' }, { to: 'est18', tag: '同类' } ],
  est18: [ { to: 'est17', tag: '相关' }, { to: 'sm07', tag: '前置' }, { to: 'est19', tag: '同类' } ],
  est19: [ { to: 'est10', tag: '相关' }, { to: 'sm08', tag: '前置' } ],
  est20: [ { to: 'est21', tag: '前置' }, { to: 'est12', tag: '相关' }, { to: 'est21', tag: '同类' } ],
  est21: [ { to: 'est20', tag: '前置' }, { to: 'est03', tag: '相关' }, { to: 'est02', tag: '相关' } ],
  test01: [ { to: 'test02', tag: '前置' }, { to: 'test03', tag: '相关' }, { to: 'test02', tag: '同类' } ],
  test02: [ { to: 'test01', tag: '前置' }, { to: 'test05', tag: '相关' } ],
  test03: [ { to: 'test04', tag: '相关' }, { to: 'test15', tag: '相关' }, { to: 'test04', tag: '同类' } ],
  test04: [ { to: 'test03', tag: '相关' }, { to: 'test09', tag: '相关' } ],
  test05: [ { to: 'test02', tag: '相关' }, { to: 'test10', tag: '相关' }, { to: 'test06', tag: '同类' } ],
  test06: [ { to: 'test07', tag: '同类' }, { to: 'sm04', tag: '前置' }, { to: 'est08', tag: '相关' } ],
  test07: [ { to: 'test06', tag: '同类' }, { to: 'sm07', tag: '前置' }, { to: 'est09', tag: '相关' }, { to: 'test08', tag: '同类' } ],
  test08: [ { to: 'test06', tag: '相关' }, { to: 'sm06', tag: '前置' }, { to: 'est10', tag: '相关' } ],
  test09: [ { to: 'test04', tag: '相关' }, { to: 'test01', tag: '相关' }, { to: 'test10', tag: '同类' } ],
  test10: [ { to: 'test05', tag: '相关' }, { to: 'test09', tag: '相关' } ],
  test11: [ { to: 'test12', tag: '同类' }, { to: 'est17', tag: '相关' } ],
  test12: [ { to: 'test11', tag: '同类' }, { to: 'test07', tag: '前置' }, { to: 'test13', tag: '同类' } ],
  test13: [ { to: 'test08', tag: '相关' }, { to: 'sm08', tag: '前置' } ],
  test14: [ { to: 'test08', tag: '相关' }, { to: 'sm05', tag: '前置' }, { to: 'xt14', tag: '同类' } ],
  test15: [ { to: 'test03', tag: '相关' }, { to: 'test04', tag: '相关' }, { to: 'test16', tag: '同类' } ],
  test16: [ { to: 'test08', tag: '相关' }, { to: 'sm05', tag: '相关' } ],
  reg01: [ { to: 'reg02', tag: '前置' }, { to: 'reg03', tag: '前置' }, { to: 'reg02', tag: '同类' } ],
  reg02: [ { to: 'reg01', tag: '前置' }, { to: 'reg03', tag: '前置' }, { to: 'reg03', tag: '同类' } ],
  reg03: [ { to: 'reg02', tag: '前置' }, { to: 'sm08', tag: '前置' } ],
  reg04: [ { to: 'reg05', tag: '前置' }, { to: 'reg07', tag: '前置' }, { to: 'reg05', tag: '同类' } ],
  reg05: [ { to: 'reg04', tag: '前置' }, { to: 'reg06', tag: '相关' }, { to: 'reg07', tag: '前置' } ],
  reg06: [ { to: 'reg02', tag: '相关' }, { to: 'reg05', tag: '相关' }, { to: 'reg07', tag: '同类' } ],
  reg07: [ { to: 'reg04', tag: '前置' }, { to: 'sm07', tag: '前置' }, { to: 'reg08', tag: '同类' } ],
  reg08: [ { to: 'reg03', tag: '相关' }, { to: 'reg06', tag: '相关' }, { to: 'reg09', tag: '同类' } ],
  reg09: [ { to: 'reg05', tag: '前置' }, { to: 'reg07', tag: '相关' }, { to: 'reg10', tag: '同类' } ],
  reg10: [ { to: 'nc07', tag: '相关' }, { to: 'reg07', tag: '相关' }, { to: 'reg08', tag: '相关' } ],
  sx01: [ { to: 'reg10', tag: '同类' }, { to: 'nc07', tag: '前置' } ],
  sx02: [ { to: 'rv19', tag: '相关' }, { to: 'sm05', tag: '相关' } ],
  sx03: [ { to: 'est14', tag: '相关' }, { to: 'est15', tag: '相关' }, { to: 'est21', tag: '相关' } ],
  sx04: [ { to: 'pb07', tag: '相关' }, { to: 'est12', tag: '相关' } ],
  sy01: [ { to: 'est08', tag: '相关' }, { to: 'rv07', tag: '前置' }, { to: 'll04', tag: '前置' } ],
  sy02: [ { to: 'll05', tag: '前置' }, { to: 'est08', tag: '相关' }, { to: 'test06', tag: '应用' } ],
  sy03: [ { to: 'reg05', tag: '前置' }, { to: 'reg04', tag: '相关' } ],
  sy04: [ { to: 'sm01', tag: '前置' }, { to: 'll03', tag: '相关' } ],
  sy05: [ { to: 'rv07', tag: '前置' }, { to: 'nc08', tag: '相关' } ],
  sy06: [ { to: 'rv07', tag: '前置' }, { to: 'mv11', tag: '相关' } ],
  sy07: [ { to: 'est08', tag: '前置' }, { to: 'est09', tag: '相关' } ],
  sy08: [ { to: 'nc09', tag: '相关' }, { to: 'nc14', tag: '前置' } ],
  sy09: [ { to: 'sm07', tag: '相关' }, { to: 'rv11', tag: '前置' } ],
  ts01: [ { to: 'pb02', tag: '方法' }, { to: 'pb06', tag: '方法' }, { to: 'rv01', tag: '方法' } ],
  ts02: [ { to: 'nc01', tag: '方法' }, { to: 'nc04', tag: '方法' }, { to: 'nc06', tag: '方法' } ],
  ts03: [ { to: 'est05', tag: '方法' }, { to: 'est06', tag: '方法' }, { to: 'est12', tag: '前置' } ],
  ts04: [ { to: 'test01', tag: '方法' }, { to: 'test06', tag: '方法' }, { to: 'test07', tag: '方法' } ],
  ts05: [ { to: 'est07', tag: '方法' }, { to: 'est16', tag: '方法' }, { to: 'est08', tag: '应用' }, { to: 'ys03', tag: '同类' } ],
  ts06: [ { to: 'reg01', tag: '方法' }, { to: 'reg03', tag: '方法' }, { to: 'reg05', tag: '方法' } ],
  ts07: [ { to: 'rv06', tag: '方法' }, { to: 'rv07', tag: '方法' }, { to: 'rv10', tag: '方法' }, { to: 'rv12', tag: '方法' } ],
  ts08: [ { to: 'mv02', tag: '方法' }, { to: 'mv03', tag: '方法' }, { to: 'mv04', tag: '方法' }, { to: 'mv01', tag: '前置' } ],
  ts09: [ { to: 'll01', tag: '方法' }, { to: 'll04', tag: '方法' }, { to: 'll05', tag: '方法' }, { to: 'nc09', tag: '前置' } ],
  xr01: [ { to: 'rv10', tag: '前置' }, { to: 'nc13', tag: '相关' }, { to: 'rv19', tag: '相关' } ],
  xr02: [ { to: 'est12', tag: '前置' }, { to: 'est06', tag: '相关' }, { to: 'test15', tag: '相关' } ],
  xr03: [ { to: 'est08', tag: '方法' }, { to: 'est09', tag: '方法' }, { to: 'est10', tag: '方法' }, { to: 'test06', tag: '方法' }, { to: 'test07', tag: '方法' }, { to: 'test13', tag: '方法' } ],
  xt01: [ { to: 'xt02', tag: '相关' }, { to: 'mv07', tag: '方法' }, { to: 'xt03', tag: '相关' }, { to: 'xt02', tag: '同类' } ],
  xt02: [ { to: 'xt01', tag: '相关' }, { to: 'sx02', tag: '相关' }, { to: 'mv07', tag: '方法' }, { to: 'xt03', tag: '同类' } ],
  xt03: [ { to: 'xt01', tag: '前置' }, { to: 'xt02', tag: '相关' } ],
  xt04: [ { to: 'est14', tag: '同类' }, { to: 'est15', tag: '方法' }, { to: 'xt05', tag: '前置' }, { to: 'xt05', tag: '同类' } ],
  xt05: [ { to: 'xt06', tag: '前置' }, { to: 'est14', tag: '相关' }, { to: 'est21', tag: '相关' } ],
  xt06: [ { to: 'xt05', tag: '前置' }, { to: 'est21', tag: '相关' }, { to: 'sx03', tag: '相关' } ],
  xt07: [ { to: 'nc15', tag: '同类' }, { to: 'nc16', tag: '同类' }, { to: 'll04', tag: '应用' } ],
  xt08: [ { to: 'rv07', tag: '前置' }, { to: 'rv19', tag: '相关' }, { to: 'mv11', tag: '相关' } ],
  xt09: [ { to: 'll01', tag: '相关' }, { to: 'll02', tag: '同类' }, { to: 'll03', tag: '同类' }, { to: 'nc09', tag: '应用' } ],
  xt10: [ { to: 'reg05', tag: '推广' }, { to: 'reg06', tag: '相关' }, { to: 'reg08', tag: '相关' }, { to: 'jj06', tag: '同类' } ],
  xt11: [ { to: 'reg04', tag: '相关' }, { to: 'xt12', tag: '相关' }, { to: 'sy03', tag: '相关' }, { to: 'xt12', tag: '同类' } ],
  xt12: [ { to: 'reg04', tag: '相关' }, { to: 'xt11', tag: '相关' }, { to: 'reg07', tag: '应用' }, { to: 'jj08', tag: '同类' } ],
  xt13: [ { to: 'test12', tag: '同类' }, { to: 'test07', tag: '相关' }, { to: 'test16', tag: '相关' }, { to: 'jj04', tag: '同类' } ],
  xt14: [ { to: 'test14', tag: '同类' }, { to: 'sy04', tag: '前置' }, { to: 'sm09', tag: '应用' } ],
  xt15: [ { to: 'test14', tag: '同类' }, { to: 'sm05', tag: '前置' }, { to: 'mv04', tag: '相关' } ],
  ys01: [ { to: 'rv15', tag: '方法' }, { to: 'mv06', tag: '方法' }, { to: 'jj02', tag: '方法' }, { to: 'mv07', tag: '相关' } ],
  ys02: [ { to: 'est05', tag: '方法' }, { to: 'est06', tag: '方法' }, { to: 'est12', tag: '前置' }, { to: 'est21', tag: '相关' } ],
  ys03: [ { to: 'est08', tag: '方法' }, { to: 'est09', tag: '方法' }, { to: 'est10', tag: '方法' }, { to: 'est16', tag: '方法' } ],
  ys04: [ { to: 'test06', tag: '方法' }, { to: 'test07', tag: '方法' }, { to: 'test08', tag: '方法' }, { to: 'test12', tag: '方法' } ],
  ys05: [ { to: 'reg05', tag: '方法' }, { to: 'reg07', tag: '方法' }, { to: 'reg08', tag: '方法' }, { to: 'xt12', tag: '方法' } ],
  jj01: [ { to: 'pb02', tag: '同类' }, { to: 'pb01', tag: '前置' }, { to: 'rv09', tag: '相关' } ],
  jj02: [ { to: 'mv06', tag: '方法' }, { to: 'mv01', tag: '前置' }, { to: 'mv04', tag: '相关' } ],
  jj03: [ { to: 'test12', tag: '相关' }, { to: 'est18', tag: '相关' }, { to: 'xt13', tag: '相关' } ],
  jj04: [ { to: 'xt13', tag: '同类' }, { to: 'test12', tag: '相关' }, { to: 'jj05', tag: '相关' }, { to: 'jj05', tag: '同类' } ],
  jj05: [ { to: 'jj04', tag: '同类' }, { to: 'xt13', tag: '同类' }, { to: 'test16', tag: '相关' } ],
  jj06: [ { to: 'reg05', tag: '前置' }, { to: 'reg04', tag: '前置' }, { to: 'reg07', tag: '相关' }, { to: 'xt10', tag: '相关' }, { to: 'jj07', tag: '同类' } ],
  jj07: [ { to: 'reg06', tag: '相关' }, { to: 'reg04', tag: '前置' }, { to: 'reg08', tag: '相关' } ],
  jj08: [ { to: 'xt12', tag: '同类' }, { to: 'reg05', tag: '前置' }, { to: 'jj09', tag: '相关' }, { to: 'jj09', tag: '同类' } ],
  jj09: [ { to: 'xt11', tag: '相关' }, { to: 'reg04', tag: '前置' }, { to: 'jj08', tag: '相关' } ],
  jj10: [ { to: 'jj06', tag: '相关' }, { to: 'reg04', tag: '前置' }, { to: 'reg05', tag: '相关' }, { to: 'jj11', tag: '同类' } ],
  jj11: [ { to: 'reg05', tag: '前置' }, { to: 'reg04', tag: '相关' }, { to: 'jj07', tag: '相关' }, { to: 'jj12', tag: '同类' } ],
  jj12: [ { to: 'jj07', tag: '相关' }, { to: 'reg08', tag: '相关' }, { to: 'reg04', tag: '相关' } ],
  };

  const PITFALL = {
    pb03: R`求 $P(A\cup B)$ 当 $A,B$ 不相交时才省略 $-P(AB)$；有交集时必须减去交叉项，避免重复计数。`,
    pb04: R`条件概率分母是“条件事件”的概率：$P(B|A)$ 分母为 $P(A)$，勿把 $P(AB)$ 与 $P(B|A)$ 混淆。`,
    pb06: R`全概率公式要求 $A_i$ 构成完备事件组（互斥且并集为 $\Omega$）；缺项或重叠都会出错。`,
    pb07: R`贝叶斯分母是全概率 $P(B)$ 而非 $P(A_i)$；分子分母的先后顺序（先验与似然）别写反。`,
    rv06: R`“至少 $k$ 次 / 至多 $k$ 次”优先取对立事件；$C_n^k$ 与 $p^k(1-p)^{n-k}$ 的指数别写反。`,
    rv11: R`标准化要除以 $\sigma$（不是 $\sigma^2$）；$\Phi(-x)=1-\Phi(x)$；$P(a<X<b)=\Phi(\tfrac{b-\mu}{\sigma})-\Phi(\tfrac{a-\mu}{\sigma})$。`,
    rv15: R`分布函数法求导时勿漏链式法则（$g(X)\le y$ 的界对 $y$ 求导）；密度定义域要分段写出。`,
    mv02: R`边缘密度积分限由“另一变量”决定，不是常数区间；积分域没画对是最常见错误。`,
    nc04: R`方差 $D(X)=E(X^2)-[E(X)]^2$，勿忘减去期望的平方；$E(X^2)\ne[E(X)]^2$。`,
    nc07: R`相关系数只刻画线性相关，$\rho=0$ 不代表独立；$\mathrm{Cov}$ 有量纲而 $\rho$ 无量纲。`,
    ll04: R`中心极限定理标准化：分子减 $n\mu$、分母除 $\sqrt n\,\sigma$；离散型求概率时常需连续性校正。`,
    sm06: R`样本方差与卡方的自由度是 $n-1$（不是 $n$）；除以的是总体方差 $\sigma^2$ 不是 $S^2$。`,
    sm07: R`$t$ 分布中 $S^2$ 与 $\bar X$ 独立仅对正态总体成立；非正态总体不可直接套用。`,
    est05: R`矩估计用低阶矩最简，但可能无解或多解；选择不同阶矩会得到不同的估计量。`,
    est06: R`对数似然求导后勿漏定义域/边界解（如均匀分布 $U(0,\theta)$ 的 MLE 是 $Y_{(n)}$ 而非使导数为 0 的点）；似然在支撑集外为 0。`,
    est08: R`方差已知用 $z$、未知才用 $t$；别忘除以 $\sqrt n$；分位数用 $z_{\alpha/2}$（双侧）。`,
    est09: R`方差未知的均值区间用 $t$ 分布、自由度 $n-1$；误用 $z$ 或自由度写成 $n$ 是高频错误。`,
    test06: R`区分单双侧：双侧拒绝域 $|Z|>z_{\alpha/2}$，单侧用 $z_\alpha$ 且方向要与 $H_1$ 一致；$p$ 值与显著性水平 $\alpha$ 别混淆。`,
    test12: R`配对样本与两独立样本检验别混用：配对用差值的 $t$ 检验（$d_i=X_i-Y_i$），两独立等方差才合并方差 $S_p^2$。`,
    pb01: R`对立事件 $\bar A$ 必与 $A$ 互斥且 $A\cup\bar A=\Omega$；但互斥只需 $AB=\varnothing$，未必对立（如二者合起来不是全部结果）。勿把“互斥”当“对立”。`,
    rv03: R`分布律须同时满足 $p_k\ge0$ 与 $\sum_k p_k=1$；它只对离散变量定义。连续型用密度 $f(x)$，逐点概率为 0，不能把 $f(x)$ 当概率。`,
    sm08: R`$F$ 分布两个自由度顺序不可颠倒：$F=\dfrac{U/m}{V/n}\sim F(m,n)$。左尾分位数用倒数关系 $F_{1-\alpha}(m,n)=\dfrac{1}{F_{\alpha}(n,m)}$ 求得。`,
    test04: R`$\alpha$ 是犯第一类错误的概率上限，与第二类错误 $\beta$（及功效 $1-\beta$）此消彼长；它与 $p$ 值、置信水平 $1-\alpha$ 均不是一回事。`,
    est10: R`方差置信区间用 $\chi^{2}$ 分布，\textbf{两端分位数顺序要反}：$\left(\dfrac{(n-1)S^{2}}{\chi^{2}_{\alpha/2}(n-1)},\ \dfrac{(n-1)S^{2}}{\chi^{2}_{1-\alpha/2}(n-1)}\right)$，较小分位数放在分母较大的一端。`,
    test09: R`$p$ 值是 $H_{0}$ 为真时得到当前或更极端结果的概率，\textbf{不是} $H_{0}$ 为真的概率；单侧检验的 $p$ 值通常是双侧 $p$ 值之半，且与“发生的概率”无关。`,
    nc10: R`不相关（$\rho=0$）只说明无\textbf{线性}关系，\textbf{不等于}独立；独立必不相关，反之不成立。判定独立看联合分布是否分解 $f(x,y)=f_X(x)f_Y(y)$，而非相关系数。`,
    xt01: R`次序统计量密度公式易漏 $n!$ 因子；且须在 $x_{(1)}<\cdots<x_{(n)}$ 的\textbf{有序}区域上写，区间序写错（如写成 $x_{(1)}>x_{(2)}$）会直接出错。`,
    xt02: R`$U(0,1)$ 的第 $k$ 个次序统计量是 $\mathrm{Beta}(k,\ n-k+1)$，\textbf{不是} $\mathrm{Beta}(k,\ n-k)$；期望 $E=\frac{k}{n+1}$ 而非 $\frac{k}{n}$。`,
    xt04: R`因子分解定理注意 $g$ 与 $h$ 的划分：$g$ 只能是“$T$ 与 $\theta$”的函数、$h$ 是“仅样本、不含 $\theta$”的函数，二者别放反。`,
    xt07: R`$\varphi_{X+Y}=\varphi_X\varphi_Y$ \textbf{推不出} $X,Y$ 独立（反例 $X=Y\sim$ Cauchy）；真正判定独立须用\textbf{联合}特征函数 $\varphi_{X,Y}(s,t)=\varphi_X(s)\varphi_Y(t)$。`,
    xt12: R`White 检验统计量是 $W=nR^{2}\sim\chi^{2}(p)$（$R^{2}$ 为残差平方对解释变量及其平方/交叉的辅助回归判定系数），别把 $R^{2}$ 当原回归判定系数；异方差下 OLS 依然\textbf{无偏}，只是方差估计有偏。`,
    xt14: R`$\chi^{2}$ 拟合优度自由度是 $k-1-r$（$r$ 为\textbf{估计的}参数个数），不是 $k-1$；$K$-$S$ 检验要求 $F_0$ 参数完全已知，参数需估计时必需 Lilliefors 修正。`,
    jj01: R`几何概型要求样本点在 $\Omega$ 上\textbf{均匀/等可能}；若取点密度 $f$ 非常数（非均匀），不能直接用面积比，须按 $P(A)=\int_A f\,d\mu$。且“线段分成三段”、“圆周取点”等须先化为均匀等价模型。`,
    jj02: R`雅可比法必须取 $|J|$（绝对值）；$J=\frac{\partial(x,y)}{\partial(u,v)}$ 是“$x,y$ 对 $u,v$”的偏导（与 $\frac{\partial(u,v)}{\partial(x,y)}$ 互为倒数，勿写反）；逆变换不唯一时需对多个分支求和，且新变量支撑集须重新映射分段写。`,
    jj06: R`Gauss-Markov 定理\textbf{不要求正态性}；“最优”仅在\textbf{线性无偏}类内（BLUE）。若内生（$E(\varepsilon|X)\ne0$）则 OLS $\Rightarrow$ 有偏不一致；若异方差/自相关则仍无偏但\textbf{不有效}。`,
    jj07: R`$\bar R^2=1-(1-R^2)\frac{n-1}{n-p-1}$，\textbf{可能为负}，且\textbf{未必}随变量增多而增大；它只度量线性拟合，模型优劣应配合 $F$ 检验，勿单凭 $\bar R^2$ 判定。`,
    jj09: R`DW 近似 $\approx2(1-\hat\rho)$，只检验\textbf{一阶}自相关；模型含\textbf{滞后因变量}时 DW 失效。$d$ 靠近 0（正相关）或 4（负相关）才说明显著自相关，$d\approx2$ 无自相关。`,
    jj10: R`工具变量须\textbf{同时}满足“相关性 $\mathrm{Cov}(Z,x)\ne0$”与“外生性 $\mathrm{Cov}(Z,\varepsilon)=0$”；**弱工具变量**会造成严重偏差；工具变量个数须 $\ge$ 内生变量个数才可识别。`,
    pb13: R`两两独立（三式）不蕴含相互独立（四式）——差 $P(ABC)=P(A)P(B)P(C)$ 一式；三事件只验证两两独立是不够的。`,
    nc20: R`全方差公式两项勿交换：$E[\mathrm{Var}(X\mid Y)]$（组内）在前、$\mathrm{Var}[E(X\mid Y)]$（组间）在后——写反了量纲虽对但数值错。`,
    nc18: R`峰度「减 3」才以正态为 0 基准——不同软件/教材定义可能不减 3（正态报 3），跨工具比较先对齐定义。`,
    sm12: R`方差比 $F$ 的自由度顺序：$S_1^2/\sigma_1^2$ 在分子则自由度 $(m-1,\ n-1)$——分子自由度在前；F 分布取倒数时自由度也要倒置。`,
    est24: R`同一置信水平：单侧限用 $z_\alpha$、双侧区间用 $z_{\alpha/2}$——临界值分位不同，勿混用。`,
    reg13: R`比较次数多时 LSD 的整体 Ⅰ 类错误累积膨胀（10 次成对比较远超 5%）——多次比较需 Tukey/Bonferroni 校正。`,
    reg14: R`线性化后的 $R^2$ 是替换后变量的判定系数，与原尺度 $R^2$ 不可直接比较——选型要配合残差图与业务含义。`,
    pb14: R`$\sigma$-域只对**可列**并封闭，不能当成「对任意并封闭」（后者是「$\sigma$-代数」之外的强条件，与可列可加性不匹配）；另外注意上极限含「无穷多个」、下极限含「至多有限个」，两者不要写反。`,
    pb16: R`Borel-Cantelli 的**第二**结论（$P(\varlimsup A_n)=1$）必须要求 $A_n$ **独立**且 $\sum P(A_n)=\infty$，缺一不可；只用 $\sum P(A_n)=\infty$ 而无独立性时结论不成立。`,
    pb17: R`反射原理把「曾到达 $a$」换成「终点 $2a-b$」只在 $b<a$ 时是**等式**；$b\ge a$ 时终点已在水平之上，概率就是 $P(S_n=b)$，不要把两个情形混用。`,
    est25: R`EM 只保证观测似然**不下降**，收敛到的是**局部**极大（初值敏感、可能很慢）；不要声称「收敛到全局最优」。`,
    est26: R`混合模型的似然是**无界**的（取某观测为单点分量使 $\sigma\to0$ 时似然发散），故 M 步必须加方差正下界或用多组初值挑选最优解，不能直接迭代到「似然最大」。`,
    reg15: R`Hartley 的 $F_{\max}$ 要求**各水平重复数相同**（不平衡别硬套）；它和 Bartlett 都对**非正态**敏感——尾部差异会被误判为方差不齐。`,
    est27: R`均匀分布 $U(0,\theta)$ **不是**指数族（支撑依赖参数），因此对它不能用「指数族⇒完全充分⇒C-R 可达」这套推理。`,
    est29: R`Basu 定理要求 $T$ 是**完全**充分统计量：只充分而不完全（如 $U(\theta,\theta+1)$ 位置族的 $(X_{(1)},X_{(n)})$）时结论不成立。`,
    ll11: R`Slutsky 定理的另一项必须依概率收敛到**常数**；两项都只依分布收敛时不能直接相加/相乘/相除（需 Cramér 定理或连续映射定理）。`,
    ll12: R`一阶 Δ 方法要求 $g'(\theta)\ne0$：若一阶导为 0，渐近方差为 0 的说法是错的，必须用**二阶**展开（极限服从 $\chi^{2}_{1}$ 型分布）。`,
    ll13: R`强大数定律的条件是「i.i.d. **且** $E|X_1|<\infty$」：期望不存在（如 Cauchy）时 $\frac1n\sum X_i$ 不收敛（连弱 LLN 都不成立），不能只写「i.i.d. 就够了」。`,
    est32: R`渐近正态需要支撑与 $\theta$ 无关等正则条件：$U(0,\theta)$ 的 MLE 是 $X_{(n)}$，$\sqrt n(\hat\theta-\theta)$ 不服从正态（要用 $n(\theta-X_{(n)})$ 型极限），不能把「MLE 必渐近正态」当定理用。`,
    jj16: R`遗漏变量偏误的方向律是「$X_2$ 对 $Y$ 的净效应符号 × $X_1,X_2$ 的相关符号」；同时注意 $\alpha=0$（辅助回归系数为 0）时偏误消失——**正交**的控制变量不改变斜率估计，但会改标准误。`,
    reg16: R`做多重比较时不能把 $\binom{s}{2}$ 个两两 $t$ 检验当独立检验（整体第一类错误会膨胀到约 $1-(1-\alpha)^{\binom{s}{2}}$），必须用 T 法/S 法的**同时**区间。`,
    xr04: R`双边假设下一般**不存在**一致最优势检验；只有指数族+单侧（或 MLR 结构）才有 UMP，别把单侧结论套到双边（后者需 UMPU 或无偏检验）。`,
    xr05: R`Wilks 定理（$-2\ln\lambda\sim\chi^{2}(r)$）要求原假设在参数空间**内部**；边界上的原假设（如 $\sigma^{2}=0$、混合比例在边界）极限分布是 $\chi^{2}$ 的混合，不能直接用 $\chi^{2}(r)$。`,
  };

  // ============ 助记（MNEM，可选） ============
  const MNEM = {
    pb04: R`条件概率分母是「条件事件」的概率：$P(B|A)$ 分母为 $P(A)$——「谁在竖线后面，谁做分母」。`,
    pb06: R`全概率=「先分完备组，再按组加权求和」：$P(B)=\sum P(A_i)P(B|A_i)$。`,
    pb07: R`贝叶斯=「先验×似然 / 全概率」：分子是其中一条路，分母是全部路加起来。`,
    rv06: R`二项分布记「$C_n^k$ 选 k 次成功，$p^k$ 成功、$(1-p)^{n-k}$ 失败」。`,
    rv11: R`正态密度记「$\frac{1}{\sqrt{2\pi}\sigma}$ 壳、$-\frac{(x-\mu)^2}{2\sigma^2}$ 芯」。`,
    xt01: R`次序统计量 = 「排列数 × 落在 x 附近一个 × 左边 $k-1$ 个、右边 $n-k$ 个」：$\frac{n!}{(k-1)!1!(n-k)!}F^{k-1}(1-F)^{n-k}f$。`,
    xt05: R`指数族「充分+完备」：形如 $h(x)e^{c(\theta)T(x)+d(\theta)}$，其 $T=\sum T(x_i)$ 自动既充分又完备，免去冗长证明。`,
    xt06: R`UMVUE 三招：① 充分完备统计量 $+$ L-S 定理（首选）；② 方差达 C-R 下界；③ 与一切零无偏估计不相关。`,
    xt14: R`拟合优度选型：分布已知、小样本、连续 → $K$-$S$；大样本、分类、含估计参数 → $\chi^{2}$（自由度 $k-1-r$）。`,
    ys03: R`均值区间：方差“知 $z$、不知 $t$”；方差区间一律 $\chi^{2}$。判定“估什么、已知什么”再选分布。`,
    jj06: R`Gauss-Markov = 「线性无偏里最省方差」：外生 + 同方差 + 无自相关 ⇒ OLS 是 BLUE，且\textbf{不需要正态}。`,
    jj08: R`WLS 权重 = 「方差之倒数」$\frac{1}{w_i}$；异方差不坏无偏性、只坏有效性（与标准误），故用 GLS/稳健标准误。`,
    jj13: R`「面板切一刀得截面，按时间排序得时序」——个体维 $i$ 与时间维 $t$ 分别固定一个即可降维。`,
    reg16: R`「两两全比用 T 法，任意对比用 S 法；预先少比用 Bonferroni」。`,
  };

  return { id: 'stats', group: 'acad', name: '统计学', short: '统计', icon: '📊', CATS: CATS, DATA: DATA, META: META, EXAMPLE: EXAMPLE, REL: REL, PITFALL: PITFALL, MNEM: MNEM, ORDER: ['prob_basic', 'dist', 'multidim', 'numchar', 'limit', 'sampling', 'estimation', 'testing', 'regress'] };
})();
