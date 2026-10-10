# 统计教材族 · 读图裁定记录（stats-textbook）

本文件是「统计教材族」的读图裁定记录，格式遵循 `docs/refs/README.md` §3。**编号仅在本文件内有效**（其它族文件 `rulings/*.md` 各自从 R1 起编）。

## §0 本族统一口径

1. **材料三件**：
   - 茆诗松《概率论与数理统计教程》第三版 → `参考文件/教材讲义/统计/茆诗松+概率论与数理统计教程 第三版.pdf`（490 页，OCR，低产页 40）
   - 计量经济学讲义 → `参考文件/教材讲义/统计/计量经济学讲义0321.pdf`（45 页，OCR，低产页 17）
   - 强化专题一~十四 → `参考文件/教材讲义/统计/专题X …pdf`（共 14 册 106 页，文本层，低产页 5）
2. **裁片方式**：本族裁定**一律整页裁片**（不加 `--box`，`--box` 缺省即整页），故所有记录中的 `--box` 均为「未使用（整页）」。理由：茆诗松正文页在 150 dpi 下整页 1052~1056 × 1633~1656 px，中文正文与行间公式逐字清晰可读（已实测，见 R1）；无需标定坐标即可取证，同时避免裁切截断风险。
3. **页码口径**：`--page` 一律写 **PDF 物理页码（1 基）**；茆诗松正文另有印刷页码，两者换算 **印刷页 = PDF 物理页 − 22**，逐条在「页码」栏并列写出。
4. **命令写法**：`生成命令` 栏给出**我实际执行的完整命令**（含 `参考文件/_venv/Scripts/python.exe`）。工具自身打印的 `等效命令` 会把 `--python` 补成绝对路径，二者同参同 sha256，可互换。
5. **通道**：全部裁片用自带 `read_image` 亲读；**未使用 modlens**；`参考文件/_extract/*.txt` 的 OCR 文本仅用于定位页/行，不作为公式或题面依据。
6. **命名**：茆诗松裁片落 `backup/scratch/refs-vision/茆诗松/`，计量落 `backup/scratch/refs-vision/计量/`，专题落 `backup/scratch/refs-vision/专题/`。`backup/` 被 `.gitignore:19` 忽略 → 裁片不入库，凭「命令 + sha256」重建。

---

## R1 超几何分布样本点计数与 N=9,M=3,n=4 的概率表（茆诗松 p39）

- **材料**: `参考文件/教材讲义/统计/茆诗松+概率论与数理统计教程 第三版.pdf`
- **页码**: PDF 第 39 页（印刷第 17 页）
- **生成命令**:
```bash
参考文件/_venv/Scripts/python.exe tools/refs-vision.py --pdf "参考文件/教材讲义/统计/茆诗松+概率论与数理统计教程 第三版.pdf" --page 39 --dpi 150 --out "backup/scratch/refs-vision/茆诗松/p39_full.png"
```
  （未使用 `--box`，即整页；页尺寸 506.9 × 794.9 pt，rotation=0）
- **裁片**: `backup/scratch/refs-vision/茆诗松/p39_full.png`（1056 × 1656 px, 306569 B, sha256 `94042022ce5811e4c1f3a847a937aca903821f6d57e6bf31a683d8a8ab8b6af0`）
- **亲读原文**: 「所以根据乘法原理，$A_1$ 中共有 $\dbinom{M}{1}\dbinom{N-M}{n-1}$ 个样本点。故 $A_1$ 的概率为 $P(A_1)=\dfrac{\binom{M}{1}\binom{N-M}{n-1}}{\binom{N}{n}}$。…… $A_m$ 含有 $\dbinom{M}{m}\dbinom{N-M}{n-m}$ 个样本点，由此得 $A_m$ 的概率为 $P(A_m)=\dfrac{\binom{M}{m}\binom{N-M}{n-m}}{\binom{N}{n}},\quad m=0,1,2,\cdots,r,\quad r=\min\{n,M\}.$（1.2.6）注意，在此应有 $m\leqslant n,\ m\leqslant M$，所以 $m\leqslant\min\{n,M\}$，否则其概率为 0。如果取 $N=9,M=3,n=4$，则有 $P(A_0)=\dfrac{\binom{6}{4}}{\binom{9}{4}}=\dfrac{15}{126}=\dfrac{5}{42},\ P(A_1)=\dfrac{\binom{6}{3}\binom{3}{1}}{\binom{9}{4}}=\dfrac{60}{126}=\dfrac{20}{42},\ P(A_2)=\dfrac{\binom{6}{2}\binom{3}{2}}{\binom{9}{4}}=\dfrac{45}{126}=\dfrac{15}{42},\ P(A_3)=\dfrac{\binom{6}{1}\binom{3}{3}}{\binom{9}{4}}=\dfrac{6}{126}=\dfrac{2}{42}.$ …… **表 1.2.4 事件 $A_m$ 的概率**：$m=0,1,2,3$ 对应 $P(A_m)=\frac{5}{42},\frac{20}{42},\frac{15}{42},\frac{2}{42}$。」
- **结论**: 本体是 §1.2 古典方法中的**超几何（不放回抽样）概率公式**，教材编号 **(1.2.6)**，并给出 $N=9,M=3,n=4$ 的完整数值算例与表 1.2.4；与结构索引 `1.2`（p33–49）条目对齐，是「古典概型 + 组合计数」可直接引用的原文公式。
- **置信度**: high
- **对照**: OCR 文本（`参考文件/_extract/…茆诗松….txt` 第 39 页块）作 `81.2概率的定义及其确定方法`、`PC`、`（nl`、`((()=01491` 等碎片，**公式全毁**；裁片逐字清晰，故本条公式以裁片为准，可升为「可直接引用」。
- **转写不确定项**: 无（$\dbinom{}{}$ 记为 `\binom{}{}`）。

---

## R2 彩票模型：p1–p7 七项组合式概率与 P(中奖)（茆诗松 p42）

- **材料**: `参考文件/教材讲义/统计/茆诗松+概率论与数理统计教程 第三版.pdf`
- **页码**: PDF 第 42 页（印刷第 20 页）
- **生成命令**:
```bash
参考文件/_venv/Scripts/python.exe tools/refs-vision.py --pdf "参考文件/教材讲义/统计/茆诗松+概率论与数理统计教程 第三版.pdf" --page 42 --dpi 150 --out "backup/scratch/refs-vision/茆诗松/p42_full.png"
```
  （整页）
- **裁片**: `backup/scratch/refs-vision/茆诗松/p42_full.png`（1056 × 1650 px, 316141 B, sha256 `f8ec32b7e05ceb1e1dc1e3fe34da0202a4324785324abf300e14aaa543dca18c`）
- **亲读原文**: 「$p_1=\dfrac{\binom{7}{7}\binom{1}{0}\binom{27}{0}}{\binom{35}{7}}=\dfrac{1}{6\,724\,520}=0.149\times10^{-6}$，$p_2=\dfrac{\binom{7}{6}\binom{1}{1}\binom{27}{0}}{\binom{35}{7}}=\dfrac{7}{6\,724\,520}=1.04\times10^{-6}$，$p_3=\dfrac{\binom{7}{6}\binom{1}{0}\binom{27}{1}}{\binom{35}{7}}=\dfrac{189}{6\,724\,520}=28.106\times10^{-6}$，$p_4=\dfrac{\binom{7}{5}\binom{1}{1}\binom{27}{1}}{\binom{35}{7}}=\dfrac{567}{6\,724\,520}=84.318\times10^{-6}$，$p_5=\dfrac{\binom{7}{5}\binom{1}{0}\binom{27}{2}}{\binom{35}{7}}=\dfrac{7\,371}{6\,724\,520}=1.096\times10^{-3}$，$p_6=\dfrac{\binom{7}{4}\binom{1}{1}\binom{27}{2}}{\binom{35}{7}}=\dfrac{12\,285}{6\,724\,520}=1.827\times10^{-3}$，$p_7=\dfrac{\binom{7}{4}\binom{1}{0}\binom{27}{3}+\binom{7}{3}\binom{1}{1}\binom{27}{3}}{\binom{35}{7}}=\dfrac{204\,750}{6\,724\,520}=30.448\times10^{-3}$。若记 $A$ 为事件"中奖"，则 $\bar A$ 为事件"不中奖"，且由 $P(A)+P(\bar A)=P(\Omega)=1$ 可得 $P(\text{中奖})=P(A)=p_1+p_2+p_3+p_4+p_5+p_6+p_7=\dfrac{225\,170}{6\,724\,520}=0.033\,485$，$P(\text{不中奖})=P(\bar A)=1-P(A)=0.966\,515$。」
- **结论**: §1.2 古典方法的**彩票模型（35 选 7 + 特别号）**完整分项计算，$P(\text{中奖})\approx3.35\%$、头奖 $0.149\times10^{-6}$；可用于「古典概型/组合计数」题的证据源与数值核对基准。
- **置信度**: high
- **对照**: OCR 文本作 `((()=01491`、`71`、`((28.061`、`84318x1`、`)()08`，$p_1$–$p_7$ 与分子分母**全部不可用**；裁片给出逐字可读的分子分母与小数结果，本条以裁片为准。独立复核：$\binom{35}{7}=6\,724\,520$ ✓；$\sum p_i$ 分数分子 $1+7+189+567+7371+12285+204750=225\,170$ ✓。
- **转写不确定项**: 无。

---

## R3 第五章末页：习题 5.5 第 20 题 + 本章小结（空正文）（茆诗松 p288）

- **材料**: `参考文件/教材讲义/统计/茆诗松+概率论与数理统计教程 第三版.pdf`
- **页码**: PDF 第 288 页（印刷第 266 页）
- **生成命令**:
```bash
参考文件/_venv/Scripts/python.exe tools/refs-vision.py --pdf "参考文件/教材讲义/统计/茆诗松+概率论与数理统计教程 第三版.pdf" --page 288 --dpi 150 --out "backup/scratch/refs-vision/茆诗松/p288_full.png"
```
  （整页）
- **裁片**: `backup/scratch/refs-vision/茆诗松/p288_full.png`（1052 × 1646 px, 58058 B, sha256 `4768678673ffdde0b3897143c2b2f73f9e2376d531e458c10deb0ffaac04f064`）
- **亲读原文**: 「20. 设随机变量 $Y_i\sim N(\beta_0+\beta_1x_i,\sigma^2)$，$i=1,2,\cdots,n$，诸 $Y_i$ 独立，$x_1,x_2,\cdots,x_n$ 是已知常数，证明 $\left(\sum_{i=1}^{n}Y_i,\ \sum_{i=1}^{n}x_iY_i,\ \sum_{i=1}^{n}Y_i^2\right)$ 是充分统计量。」（其后为「**本章小结**」图标 + 标题，本页无正文，下方整页空白）
- **结论**: 这是一条**章末页结构事实**：第五章（统计量及其分布）正文结束于印刷 266 页；习题 5.5 共 20 题；其后的「本章小结」**只有标题没有正文**。与结构索引「5.5 p281–288」条目对齐。
- **置信度**: high（原文逐字清晰）；对「小结正文为何缺失」的判定为 medium（见下）
- **对照**: OCR 文本作 `（∑Y，∑xY，∑Y²是充分统计量.` / `=1 1`，下标与求和上限错位；裁片读作 $\sum_{i=1}^{n}Y_i,\sum_{i=1}^{n}x_iY_i,\sum_{i=1}^{n}Y_i^2$。
- **转写不确定项**: 「本章小结」正文缺失——本页确为空白，且**后续页 PDG 289（印刷 267）已是第六章开篇正文**（"在上一章中，我们主要讲述了几个常用统计量的抽样分布及充分统计量……从本章开始，我们将讨论参数的估计和检验问题"），故印刷 267 页并非第五章小结正文页。第五章小结正文在本 PDF 中确实不存在；同一现象在第二章（p146）、第四章（p244）、第七章（p394）重复出现，见 R7/R11/R12 与 §公式清单注 3。

---

## R4 二元正态在椭圆区域上的概率（茆诗松 p156）

- **材料**: `参考文件/教材讲义/统计/茆诗松+概率论与数理统计教程 第三版.pdf`
- **页码**: PDF 第 156 页（印刷第 134 页）
- **生成命令**:
```bash
参考文件/_venv/Scripts/python.exe tools/refs-vision.py --pdf "参考文件/教材讲义/统计/茆诗松+概率论与数理统计教程 第三版.pdf" --page 156 --dpi 150 --out "backup/scratch/refs-vision/茆诗松/p156_full.png"
```
  （整页）
- **裁片**: `backup/scratch/refs-vision/茆诗松/p156_full.png`（1054 × 1650 px, 256261 B, sha256 `485e4bec99936e9901d1c59069c14bee482bd0a7fd221a5ef117159209f21ac3`）
- **亲读原文**: 「解 所求概率为 $p=\dfrac{1}{2\pi\sigma_1\sigma_2\sqrt{1-\rho^2}}\displaystyle\iint_D \exp\left\{-\dfrac{1}{2(1-\rho^2)}\left[\left(\dfrac{x-\mu_1}{\sigma_1}\right)^2-2\rho\dfrac{(x-\mu_1)(y-\mu_2)}{\sigma_1\sigma_2}+\left(\dfrac{y-\mu_2}{\sigma_2}\right)^2\right]\right\}dxdy.$ 作变换 $\begin{cases}u=\dfrac{x-\mu_1}{\sigma_1}-\rho\dfrac{y-\mu_2}{\sigma_2},\\[4pt] v=\dfrac{y-\mu_2}{\sigma_2}\sqrt{1-\rho^2}.\end{cases}$ 则可得 $J^{-1}=\dfrac{\partial(u,v)}{\partial(x,y)}=\begin{vmatrix}\dfrac{1}{\sigma_1}&-\dfrac{\rho}{\sigma_2}\\[4pt]0&\dfrac{\sqrt{1-\rho^2}}{\sigma_2}\end{vmatrix}=\dfrac{\sqrt{1-\rho^2}}{\sigma_1\sigma_2}$，由此得 $p=\dfrac{1}{2\pi(1-\rho^2)}\displaystyle\iint_{u^2+v^2\leqslant\lambda^2}\exp\left\{-\dfrac{u^2+v^2}{2(1-\rho^2)}\right\}dudv.$ 再作极坐标变换 $\begin{cases}u=r\sin\alpha,\\ v=r\cos\alpha,\end{cases}$ …… $J^{-1}=\begin{vmatrix}\sin\alpha&r\cos\alpha\\ \cos\alpha&-r\sin\alpha\end{vmatrix}=-r(\sin^2\alpha+\cos^2\alpha)=-r$，最后得 $p=\dfrac{1}{2\pi(1-\rho^2)}\displaystyle\int_0^{2\pi}d\alpha\int_0^{\lambda}r\exp\left\{-\dfrac{r^2}{2(1-\rho^2)}\right\}dr=\displaystyle\int_0^{\lambda}\exp\left\{-\dfrac{r^2}{2(1-\rho^2)}\right\}d\left(\dfrac{r^2}{2(1-\rho^2)}\right)=\left.-\exp\left\{-\dfrac{r^2}{2(1-\rho^2)}\right\}\right|_0^{\lambda}=1-\exp\left\{-\dfrac{\lambda^2}{2(1-\rho^2)}\right\}.$」 其后紧接「**习 题 3.1** 1. 100 件产品中有 50 件一等品、30 件二等品、20 件三等品。从中任取 5 件，以 $X,Y$ 分别表示取出的 5 件中一等品、二等品的件数，在以下情况下求 $(X,Y)$ 的联合分布列：（1）不放回抽取；（2）有放回抽取。」
- **结论**: 二元正态分布**椭圆区域概率公式** $P((X,Y)\in D)=1-\exp\{-\lambda^2/[2(1-\rho^2)]\}$ 的完整推导（含两次雅可比行列式计算），是本教材三维正态题的标准解法来源；同时确认习题 3.1 第 1 题题面（多元超几何 vs 多项分布）。与结构索引 `3.2`（p158 起为 3.2，本页属 3.1 末）对齐。
- **置信度**: high
- **对照**: OCR 文本（p156）作 `P=2mg√-x-2（1-)[(）`、`2(-)-μ+()}`、`u=——-p—，`、`=-μ2√1-p²`，公式**全毁**；裁片逐字可读，本条以裁片为准。独立复核：由 $r$ 变换得 $\int_0^\lambda e^{-r^2/[2(1-\rho^2)]}\,d\!\left(\frac{r^2}{2(1-\rho^2)}\right)=1-e^{-\lambda^2/[2(1-\rho^2)]}$ ✓。
- **转写不确定项**: 无。

---

## R5 §3.3.4 变量变换法：雅可比公式 (3.3.19)(3.3.20) 与例 3.3.10（茆诗松 p174）

- **材料**: `参考文件/教材讲义/统计/茆诗松+概率论与数理统计教程 第三版.pdf`
- **页码**: PDF 第 174 页（印刷第 152 页）
- **生成命令**:
```bash
参考文件/_venv/Scripts/python.exe tools/refs-vision.py --pdf "参考文件/教材讲义/统计/茆诗松+概率论与数理统计教程 第三版.pdf" --page 174 --dpi 150 --out "backup/scratch/refs-vision/茆诗松/p174_full.png"
```
  （整页）
- **裁片**: `backup/scratch/refs-vision/茆诗松/p174_full.png`（1054 × 1633 px, 274641 B, sha256 `f2f1633adca260f98c13d885cd83155be6df3225c2e964e6a7d50b084464c110`）
- **亲读原文**: 「**一、变量变换法** 设二维随机变量 $(X,Y)$ 的联合密度函数为 $p(x,y)$，如果函数 $\begin{cases}u=g_1(x,y),\\ v=g_2(x,y)\end{cases}$ 有连续偏导数，且存在唯一的反函数 $\begin{cases}x=x(u,v),\\ y=y(u,v),\end{cases}$ 其变换的雅可比行列式 $J=\dfrac{\partial(x,y)}{\partial(u,v)}=\begin{vmatrix}\dfrac{\partial x}{\partial u}&\dfrac{\partial x}{\partial v}\\[4pt]\dfrac{\partial y}{\partial u}&\dfrac{\partial y}{\partial v}\end{vmatrix}=\left(\dfrac{\partial(u,v)}{\partial(x,y)}\right)^{-1}=\begin{vmatrix}\dfrac{\partial u}{\partial x}&\dfrac{\partial u}{\partial y}\\[4pt]\dfrac{\partial v}{\partial x}&\dfrac{\partial v}{\partial y}\end{vmatrix}^{-1}\neq 0.$（3.3.19）…… 则 $(U,V)$ 的联合密度函数为 $p(u,v)=p\big(x(u,v),y(u,v)\big)\,|J|.$（3.3.20）…… **例 3.3.10** 设随机变量 $X$ 与 $Y$ 独立同分布，都服从正态分布 $N(\mu,\sigma^2)$。记 $\begin{cases}U=X+Y,\\ V=X-Y.\end{cases}$ 试求 $(U,V)$ 的联合密度函数，且问 $U$ 与 $V$ 是否独立？解 因为 $\begin{cases}u=x+y,\\ v=x-y\end{cases}$ 的反函数为 $\begin{cases}x=\dfrac{u+v}{2},\\[4pt] y=\dfrac{u-v}{2},\end{cases}$ 则 $J=\begin{vmatrix}\dfrac{\partial x}{\partial u}&\dfrac{\partial x}{\partial v}\\[4pt]\dfrac{\partial y}{\partial u}&\dfrac{\partial y}{\partial v}\end{vmatrix}=\begin{vmatrix}\dfrac{1}{2}&\dfrac{1}{2}\\[4pt]\dfrac{1}{2}&-\dfrac{1}{2}\end{vmatrix}=-\dfrac{1}{2}.$ 所以得 $(U,V)$ 的联合密度函数为 $p(u,v)=p\big(x(u,v),y(u,v)\big)|J|=p_X\!\left(\dfrac{u+v}{2}\right)p_Y\!\left(\dfrac{u-v}{2}\right)\left|-\dfrac{1}{2}\right|$」
- **结论**: §3.3.4「变量变换法」的**两个编号公式 (3.3.19) 雅可比行列式、(3.3.20) 密度变换式**，以及例 3.3.10（$X,Y$ i.i.d. $N(\mu,\sigma^2)$，$U=X+Y,\ V=X-Y$）的推导起点。与结构索引 `3.3.4 p173–176` 对齐；公式可直接引用。
- **置信度**: high
- **对照**: OCR 文本作 `[u=g（x,y），`、`[v=g2（x,y)`、`Px(x)={4，`，公式碎片化；裁片逐字可读。独立复核：$\det\begin{pmatrix}1/2&1/2\\1/2&-1/2\end{pmatrix}=-1/4-1/4=-1/2$ ✓。
- **转写不确定项**: 无。

---

## R6 例 3.4.10 续：边缘密度、一/二阶矩、Var 与 E(XY)（茆诗松 p188）

- **材料**: `参考文件/教材讲义/统计/茆诗松+概率论与数理统计教程 第三版.pdf`
- **页码**: PDF 第 188 页（印刷第 166 页）
- **生成命令**:
```bash
参考文件/_venv/Scripts/python.exe tools/refs-vision.py --pdf "参考文件/教材讲义/统计/茆诗松+概率论与数理统计教程 第三版.pdf" --page 188 --dpi 150 --out "backup/scratch/refs-vision/茆诗松/p188_full.png"
```
  （整页）
- **裁片**: `backup/scratch/refs-vision/茆诗松/p188_full.png`（1052 × 1644 px, 287867 B, sha256 `659c4b5a1ef4877c6ba9615771c9c21c65cf17c4e561c404a5340863bf96cf51`）
- **亲读原文**: 「所以得 $X$ 的边际密度函数为 $p_X(x)=\begin{cases}\dfrac{8}{3}x,&0<x<0.5,\\[4pt]\dfrac{4}{3},&0.5<x<1,\\[4pt]0,&\text{其他}.\end{cases}$ …… 所以得 $Y$ 的边际密度函数为 $p_Y(y)=\begin{cases}\dfrac{4}{3},&0<y<0.5,\\[4pt]\dfrac{8}{3}(1-y),&0.5<y<1,\\[4pt]0,&\text{其他}.\end{cases}$ 然后分别计算 $X$ 与 $Y$ 的一、二阶矩 $E(X)=\displaystyle\int_0^{0.5}\dfrac{8}{3}x^2dx+\int_{0.5}^{1}\dfrac{4}{3}xdx=\dfrac{11}{18}$，$E(Y)=\displaystyle\int_0^{0.5}\dfrac{4}{3}ydy+\int_{0.5}^{1}\dfrac{8}{3}y(1-y)dy=\dfrac{7}{18}$，$E(X^2)=\displaystyle\int_0^{0.5}\dfrac{8}{3}x^3dx+\int_{0.5}^{1}\dfrac{4}{3}x^2dx=\dfrac{31}{72}$，$E(Y^2)=\displaystyle\int_0^{0.5}\dfrac{4}{3}y^2dy+\int_{0.5}^{1}\dfrac{8}{3}y^2(1-y)dy=\dfrac{5}{24}.$ 由此可得 $X$ 与 $Y$ 各自的方差 $\operatorname{Var}(X)=\dfrac{31}{72}-\left(\dfrac{11}{18}\right)^2=\dfrac{37}{648}$，$\operatorname{Var}(Y)=\dfrac{5}{24}-\left(\dfrac{7}{18}\right)^2=\dfrac{37}{648}.$ 最后还需要计算 $E(XY)$，它只能从联合密度函数导出。$E(XY)=\displaystyle\int_0^{0.5}\!\!\int_0^{x}\dfrac{8}{3}xydydx+\int_{0.5}^{1}\!\!\int_{x-0.5}^{x}\dfrac{8}{3}xydydx=\int_0^{0.5}\dfrac{4}{3}x^3dx+\int_{0.5}^{1}\dfrac{4}{3}x\left(x-\dfrac{1}{4}\right)dx=\dfrac{1}{48}+\dfrac{7}{18}-\dfrac{1}{8}=\dfrac{41}{144}.$」 右上角插图题注「**图 3.4.2 例 3.4.10 中 $p(x,y)$ 的非零区域**」（$y=x$ 与 $y=x-0.5$ 之间的带状区域）。
- **结论**: 例 3.4.10（联合密度 $p(x,y)=8/3$ 在带状区域上）的全部数值结论：$E(X)=11/18,\ E(Y)=7/18,\ E(X^2)=31/72,\ E(Y^2)=5/24,\ \operatorname{Var}(X)=\operatorname{Var}(Y)=37/648,\ E(XY)=41/144$。是「多维随机变量特征数 + 协方差/相关系数」章节的可直接引用算例；图 3.4.2 的非零区域形状也已确认。
- **置信度**: high
- **对照**: OCR 文本作 `Px(x)={4，0.5<x<1,图3.4.2例3.4.10中p(x,y)的`、`3非零区域`，分式全部塌成单行；裁片逐字可读。独立复核：$31/72-(11/18)^2=31/72-121/324=(279-242)/648=37/648$ ✓；$1/48+7/18-1/8=(3+56-18)/144=41/144$ ✓。
- **转写不确定项**: 无。

---

## R7 §5.4 三大抽样分布：$Z$ 与 $F$ 的密度函数推导 + 图 5.4.2（茆诗松 p275）

- **材料**: `参考文件/教材讲义/统计/茆诗松+概率论与数理统计教程 第三版.pdf`
- **页码**: PDF 第 275 页（印刷第 253 页）
- **生成命令**:
```bash
参考文件/_venv/Scripts/python.exe tools/refs-vision.py --pdf "参考文件/教材讲义/统计/茆诗松+概率论与数理统计教程 第三版.pdf" --page 275 --dpi 150 --out "backup/scratch/refs-vision/茆诗松/p275_full.png"
```
  （整页）
- **裁片**: `backup/scratch/refs-vision/茆诗松/p275_full.png`（1052 × 1637 px, 262009 B, sha256 `0f77b4a8d3a4784d34572105ce5bfcf91d8ce5c35894777e5772b949aad5f222`）
- **亲读原文**: 「$=\dfrac{z^{\frac{m}{2}-1}}{\Gamma\!\left(\frac{m}{2}\right)\Gamma\!\left(\frac{n}{2}\right)2^{\frac{m+n}{2}}}\displaystyle\int_0^{\infty}x_2^{\frac{m+n}{2}-1}e^{-\frac{x_2}{2}(1+z)}dx_2,$ 运用变换 $u=\dfrac{x_2}{2}(1+z)$，可得 $p_Z(z)=\dfrac{z^{\frac{m}{2}-1}(1+z)^{-\frac{m+n}{2}}}{\Gamma\!\left(\frac{m}{2}\right)\Gamma\!\left(\frac{n}{2}\right)}\displaystyle\int_0^{\infty}u^{\frac{m+n}{2}-1}e^{-u}du,$ 最后的定积分为伽马函数 $\Gamma\!\left(\dfrac{m+n}{2}\right)$，从而 $p_Z(z)=\dfrac{\Gamma\!\left(\frac{m+n}{2}\right)}{\Gamma\!\left(\frac{m}{2}\right)\Gamma\!\left(\frac{n}{2}\right)}z^{\frac{m}{2}-1}(1+z)^{-\frac{m+n}{2}},\quad z\geqslant 0.$ 第二步，我们导出 $F=\dfrac{n}{m}Z$ 的密度函数，设 $F$ 的取值为 $y$，对 $y\geqslant 0$，有 $p_F(y)=p_Z\!\left(\dfrac{m}{n}y\right)\cdot\dfrac{m}{n}=\dfrac{\Gamma\!\left(\frac{m+n}{2}\right)}{\Gamma\!\left(\frac{m}{2}\right)\Gamma\!\left(\frac{n}{2}\right)}\left(\dfrac{m}{n}y\right)^{\frac{m}{2}-1}\left(1+\dfrac{m}{n}y\right)^{-\frac{m+n}{2}}\cdot\dfrac{m}{n}=\dfrac{\Gamma\!\left(\frac{m+n}{2}\right)}{\Gamma\!\left(\frac{m}{2}\right)\Gamma\!\left(\frac{n}{2}\right)}\left(\dfrac{m}{n}\right)^{\frac{m}{2}}y^{\frac{m}{2}-1}\left(1+\dfrac{m}{n}y\right)^{-\frac{m+n}{2}}.$ 这就是自由度为 $m$ 与 $n$ 的 $F$ 分布的密度函数。该密度函数的图像是一个只取非负值的偏态分布（见图 5.4.2）。」 图注「**图 5.4.2 $F$ 分布的密度函数**」，曲线族标注 $F(4,4000)$、$F(4,10)$、$F(4,4)$、$F(4,1)$，纵轴 0~0.8、横轴 0~4。
- **结论**: $F$ 分布密度函数的**完整推导链**（$Z$ 的密度 → 变换 $F=\frac{n}{m}Z$）与最终公式；配套图 5.4.2 的四条曲线参数已确认。属「三大抽样分布」核心公式，可直接引用。
- **置信度**: high
- **对照**: OCR 文本作 `Pa（z）`、`Pa(=- 2 =0.`、`运用变换u=（1+z），,可得2`，公式**全毁**（分式、$\Gamma$ 参数全丢）；裁片逐字可读。独立复核：由 $F=\frac{n}{m}Z$ 密度变换 $p_F(y)=p_Z(\frac{m}{n}y)\frac{m}{n}$ 与线性变换公式一致 ✓。
- **转写不确定项**: 无。

---

## R8 §7.5 正态性检验：正态概率纸作图步骤与修正频率表 7.5.1（茆诗松 p375）

- **材料**: `参考文件/教材讲义/统计/茆诗松+概率论与数理统计教程 第三版.pdf`
- **页码**: PDF 第 375 页（印刷第 353 页）
- **生成命令**:
```bash
参考文件/_venv/Scripts/python.exe tools/refs-vision.py --pdf "参考文件/教材讲义/统计/茆诗松+概率论与数理统计教程 第三版.pdf" --page 375 --dpi 150 --out "backup/scratch/refs-vision/茆诗松/p375_full.png"
```
  （整页）
- **裁片**: `backup/scratch/refs-vision/茆诗松/p375_full.png`（1054 × 1649 px, 765147 B, sha256 `800110429b85fb1fde226812c7e5814b16b9acae16978bda67fb0b108b3ee73a`）
- **亲读原文**: 「**图 7.5.1 正态概率纸**（整幅网格图，纵轴为百分率刻度 0.01、0.05、0.1、0.2、0.5、1、2、5、10、20、30、40、50、60、70、80、90、95、98、99、99.8、99.9、99.99） 数据：9.4 8.8 9.6 10.2 10.1 7.2 11.1 8.2 8.6 9.8。在正态概率纸上作图步骤如下：（1）首先将数据按从小到大的次序排列：$x_{(1)}\leqslant x_{(2)}\leqslant\cdots\leqslant x_{(n)}$，具体数据为 7.2 8.2 8.6 8.8 9.4 9.6 9.8 10.1 10.2 11.1；（2）对每一个 $i$，计算修正频率 $\dfrac{i-0.375}{n+0.25}\ (i=1,2,\cdots,n)$，结果见表 7.5.1。**表 7.5.1 $x_{(i)}$ 取值及其修正频率**：$i=1,\ x_{(i)}=7.2,\ 0.061$；$2,\ 8.2,\ 0.159$；$3,\ 8.6,\ 0.256$；$4,\ 8.8,\ 0.354$；$5,\ 9.4,\ 0.451$；$6,\ 9.6,\ 0.549$；$7,\ 9.8,\ 0.646$；$8,\ 10.1,\ 0.744$；$9,\ 10.2,\ 0.841$；$10,\ 11.1,\ 0.939$。」
- **结论**: §7.5.1「正态概率纸」的**完整操作步骤与修正频率公式 $(i-0.375)/(n+0.25)$**，以及表 7.5.1 的 10 行数据（$n=10$）。这是「正态性检验（图示法）」可直接引用的方法与数据源；图 7.5.1 为大幅网格图（占全页约 45% 高度），OCR 完全无法还原，只有裁片可用。
- **置信度**: high
- **对照**: OCR 文本作 `%A`、`图7.5.1正态概率纸`、`9.48.89.610.210.17.211.18.28.69.8`、`（1）首先将数据按从小到大的次序`，**修正频率公式与表 7.5.1 完全缺失**；裁片补齐。独立复核：$(1-0.375)/10.25=0.06098\to0.061$ ✓；$(5-0.375)/10.25=0.45122\to0.451$ ✓；$(10-0.375)/10.25=0.93902\to0.939$ ✓。
- **转写不确定项**: 无。

---

## R9 第七章末页：习题 7.6 第 8 题（精神压力血压成对数据）（茆诗松 p394）

- **材料**: `参考文件/教材讲义/统计/茆诗松+概率论与数理统计教程 第三版.pdf`
- **页码**: PDF 第 394 页（印刷第 372 页）
- **生成命令**:
```bash
参考文件/_venv/Scripts/python.exe tools/refs-vision.py --pdf "参考文件/教材讲义/统计/茆诗松+概率论与数理统计教程 第三版.pdf" --page 394 --dpi 150 --out "backup/scratch/refs-vision/茆诗松/p394_full.png"
```
  （整页）
- **裁片**: `backup/scratch/refs-vision/茆诗松/p394_full.png`（1054 × 1637 px, 98265 B, sha256 `ed17fc7b3ceafb709f1e5ae089fa8d3d4d2d9b4c833eeb9fbf248eb8a92c2924`）
- **亲读原文**: 「8. 测试在有精神压力和没有精神压力时血压的差别，10 个志愿者进行了相应的试验。结果为（单位：mmHg）：无精神压力 **107 108 122 119 116 118 121 111 114 108**；有精神压力 **127 119 123 113 125 132 121 131 116 124**。该数据是否表明有精神压力下的血压有所增加？」（其后为「**本章小结**」图标 + 标题，本页无正文，下方整页空白）
- **结论**: 第七章习题 7.6 第 8 题的**完整成对数据（20 个数值，逐字可读）**，是「非参数检验 / 成对数据符号检验 / 符号秩和检验」的题面来源；同时确认第七章以该题结束（印刷 372 页），其「本章小结」同样只有标题。
- **置信度**: high
- **对照**: OCR 文本作 `无精神压力107 108 122 119 116 118`，后续数据被截断在 chars=182，两行数值**未完整**；裁片给出完整 20 个数值。
- **转写不确定项**: 无。

---

## R10 定理 8.4.3（$S_e/\sigma^2\sim\chi^2(n-2)$ 等）及其正交矩阵证明（茆诗松 p425）

- **材料**: `参考文件/教材讲义/统计/茆诗松+概率论与数理统计教程 第三版.pdf`
- **页码**: PDF 第 425 页（印刷第 403 页）
- **生成命令**:
```bash
参考文件/_venv/Scripts/python.exe tools/refs-vision.py --pdf "参考文件/教材讲义/统计/茆诗松+概率论与数理统计教程 第三版.pdf" --page 425 --dpi 150 --out "backup/scratch/refs-vision/茆诗松/p425_full.png"
```
  （整页）
- **裁片**: `backup/scratch/refs-vision/茆诗松/p425_full.png`（1054 × 1637 px, 234534 B, sha256 `4b38c93a0e2b0155ddfea18ece836cf8a134d235a2e757cb9d641dcecfaba540`）
- **亲读原文**: 「$=(1+n-4)\sigma^2+\dfrac{1}{l_{xx}}\sum(x_i-\bar x)^2\sigma^2=(n-2)\sigma^2,$ 这就完成了证明。进一步，有关 $S_R$ 和 $S_e$ 的分布，有如下定理。**定理 8.4.3** 设 $y_1,y_2,\cdots,y_n$ 相互独立，且 $y_i\sim N(\beta_0+\beta_1x_i,\sigma^2),\ i=1,2,\cdots,n$，则在上述记号下，有（1）$S_e/\sigma^2\sim\chi^2(n-2)$；（2）若 $H_0$ 成立，则有 $S_R/\sigma^2\sim\chi^2(1)$；（3）$S_R$ 与 $S_e,\bar y$ 独立（或 $\hat\beta_1$ 与 $S_e,\bar y$ 独立）。**证明** 取 $n\times n$ 正交矩阵 $A$ 具有如下形式：$A=\begin{pmatrix}a_{11}&a_{12}&\cdots&a_{1n}\\ \vdots&\vdots&&\vdots\\ a_{n-2,1}&a_{n-2,2}&\cdots&a_{n-2,n}\\ \dfrac{x_1-\bar x}{\sqrt{l_{xx}}}&\dfrac{x_2-\bar x}{\sqrt{l_{xx}}}&\cdots&\dfrac{x_n-\bar x}{\sqrt{l_{xx}}}\\ \dfrac{1}{\sqrt{n}}&\dfrac{1}{\sqrt{n}}&\cdots&\dfrac{1}{\sqrt{n}}\end{pmatrix},$ 由正交性，可得如下一些约束条件：$\sum_j a_{ij}=0,\ \sum_j a_{ij}x_j=0,\ \sum_j a_{ij}^2=1,\ i=1,2,\cdots,n-2,\ \sum_k a_{ik}a_{jk}=0,\ 1\leqslant i<j\leqslant n-2,$ 这里矩阵 $A$ 共有 $n(n-2)$ 个未知参数，约束条件有 $3(n-2)+\dbinom{n-2}{2}=(n-2)(n+3)/2$ 个，只要 $n\geqslant 3$，未知参数个数就不少于约束条件数，因此正交矩阵 $A$ 必存在。令 $Z=\begin{pmatrix}z_1\\z_2\\\vdots\\z_n\end{pmatrix}=AY=A\begin{pmatrix}y_1\\y_2\\\vdots\\y_n\end{pmatrix}=\begin{pmatrix}\sum_j a_{1j}y_j\\ \vdots\\ \sum_j a_{n-2,j}y_j\\ \sum_j \dfrac{x_j-\bar x}{\sqrt{l_{xx}}}y_j\\ \sum_j \dfrac{1}{\sqrt{n}}y_j\end{pmatrix},$ 其中」
- **结论**: 一元线性回归**定理 8.4.3 的三条结论 + 正交变换证明的开头**（含 $A$ 的构造、约束条件计数 $(n-2)(n+3)/2$、$Z=AY$ 的显式表达）。属「方差分析与回归分析」章核心定理，可直接引用；也是 2.2.0 写回归推断卡片的权威依据。
- **置信度**: high
- **对照**: OCR 文本作 `=（1+n-4)g²+-∑（x-x)²o²=（n-2)o²，`、`定理8.4.3设y,y2,",y,相`，$\chi^2$、下标、矩阵全毁；裁片逐字可读。独立复核：约束条件数 $3(n-2)+\binom{n-2}{2}=(n-2)\dfrac{n+3}{2}$ ✓（$3+\frac{n-3}{2}=\frac{n+3}{2}$）。
- **转写不确定项**: 无。

---

## R11 第四章末页：习题 4.4 第 25–27 题 + 本章小结（空正文）（茆诗松 p244）

- **材料**: `参考文件/教材讲义/统计/茆诗松+概率论与数理统计教程 第三版.pdf`
- **页码**: PDF 第 244 页（印刷第 222 页）
- **生成命令**:
```bash
参考文件/_venv/Scripts/python.exe tools/refs-vision.py --pdf "参考文件/教材讲义/统计/茆诗松+概率论与数理统计教程 第三版.pdf" --page 244 --dpi 150 --out "backup/scratch/refs-vision/茆诗松/p244_full.png"
```
  （整页）
- **裁片**: `backup/scratch/refs-vision/茆诗松/p244_full.png`（1054 × 1647 px, 109189 B, sha256 `103bfd789964110de2973788658fd6f51b8e5aa244e440e75244f3094a6773a8`）
- **亲读原文**: 「问 $n$ 至少为多大才能保证 $m/n$ 与 $p$ 的差异小于 0.01 的概率大于 $95\%$。25. 设 $X\sim Ga(n,1)$，试问 $n$ 应该多大，才能满足 $P\left(\left|\dfrac{X}{n}-1\right|>0.1\right)<0.01.$ 26. 设 $\{X_n\}$ 为一独立同分布的随机变量序列，已知 $E(X_1^k)=\alpha_k,\ k=1,2,3,4$。试证明：当 $n$ 充分大时，$Y_n=\dfrac{1}{n}\sum_{i=1}^{n}X_i^2$ 近似服从正态分布，并指出此正态分布的参数。27. 用概率论的方法证明：$\lim\limits_{n\to\infty}\left(1+n+\dfrac{n^2}{2!}+\cdots+\dfrac{n^n}{n!}\right)e^{-n}=\dfrac{1}{2}.$」（其后为「**本章小结**」图标 + 标题，本页无正文）
- **结论**: 第四章（大数定律与中心极限定理）末页题面：第 25 题（伽马分布大样本）、第 26 题（CLT 应用，矩法求渐近正态参数）、第 27 题（用概率论方法证明含 $e^{-n}$ 的极限）三道完整题面。属「大数定律与中心极限定理」章可直接引用的习题来源；确认第四章结束于印刷 222 页，本章小结只有标题。
- **置信度**: high
- **对照**: OCR 文本作 `P(-1>0.1)<0.0`、`25.设X~Ga（n，1），试问n应该多大，才能满足`，公式残缺；裁片逐字可读。
- **转写不确定项**: 第 25 题 $P(|X/n-1|>0.1)<0.01$ 中「0.1」与「0.01」在裁片上清晰区分（数学上也自洽：$X/n\to_p1$）。

---

## R12 第二章末页：习题 2.7 第 13 题 + 本章小结（空正文）（茆诗松 p146）

- **材料**: `参考文件/教材讲义/统计/茆诗松+概率论与数理统计教程 第三版.pdf`
- **页码**: PDF 第 146 页（印刷第 124 页）
- **生成命令**:
```bash
参考文件/_venv/Scripts/python.exe tools/refs-vision.py --pdf "参考文件/教材讲义/统计/茆诗松+概率论与数理统计教程 第三版.pdf" --page 146 --dpi 150 --out "backup/scratch/refs-vision/茆诗松/p146_full.png"
```
  （整页）
- **裁片**: `backup/scratch/refs-vision/茆诗松/p146_full.png`（1054 × 1652 px, 76909 B, sha256 `ead7bbf467bbdb26e794b3b47d71db74b6edf2318ac43eba5bc89e0dabf9e57a`）
- **亲读原文**: 「$5\,000$ 小时，$t_{0.8}=65\,000$ 小时，求 $\mu$ 和 $\sigma$。13. 某厂决定按过去生产状况对月生产额最高的 $5\%$ 的工人发放高产奖。已知过去每人每月生产额 $X$（单位：千克）服从正态分布 $N(4\,000,60^2)$，试问高产奖发放标准应把生产额定为多少？」（其后为「**本章小结**」图标 + 标题，本页无正文）
- **结论**: 第二章（随机变量及其分布）末页题面：习题 2.7 第 13 题完整题面（正态分布上 $5\%$ 分位数的实际应用），并确认第二章结束于印刷 124 页、其「本章小结」只有标题。与结构索引 `2.7 p138–146` 对齐。
- **置信度**: high
- **对照**: OCR 文本作 `5000小时，to.8=65000小时，求μ和g`（$t_{0.8}$ 讹作 `to.8`、$\sigma$ 讹作 `g`），以及 `（单位：千克）` 后数据被截断（chars=137）；裁片逐字可读，$t_{0.8}$ 与 $\sigma$ 以裁片为准。
- **转写不确定项**: 无。

---

## R13 §8.5 一元非线性回归：图 8.5.2「部分常见的曲线函数的图形」全表（茆诗松 p437）

- **材料**: `参考文件/教材讲义/统计/茆诗松+概率论与数理统计教程 第三版.pdf`
- **页码**: PDF 第 437 页（印刷第 415 页）
- **生成命令**:
```bash
参考文件/_venv/Scripts/python.exe tools/refs-vision.py --pdf "参考文件/教材讲义/统计/茆诗松+概率论与数理统计教程 第三版.pdf" --page 437 --dpi 150 --out "backup/scratch/refs-vision/茆诗松/p437_full.png"
```
  （整页）
- **裁片**: `backup/scratch/refs-vision/茆诗松/p437_full.png`（1056 × 1639 px, 271432 B, sha256 `78f78eef928548e40a7cbe0ff1c9ff782038663c430e87f266f9be33c1787f4f`）
- **亲读原文**: 表头「**函数名称｜函数表达式｜图像｜线性化方法**」，六行内容依次为：「**双曲线函数** $\dfrac{1}{y}=a+\dfrac{b}{x}$（图像分 $a>0,b<0$ 与 $a>0,b>0$ 两支）｜$v=\dfrac{1}{y},\ u=\dfrac{1}{x}$」「**幂函数** $y=ax^b$（图像标注 $b>1$、$b=1$、$0<b<1$ 与 $b<-1$、$b=-1$、$-1<b<0$）｜$v=\ln y,\ u=\ln x$」「**指数函数** $y=ae^{bx}$（$b>0$／$b<0$）｜$v=\ln y,\ u=x$」「**指数函数** $y=ae^{b/x}$（$b<0$／$b>0$）｜$v=\ln y,\ u=\dfrac{1}{x}$」「**对数函数** $y=a+b\ln x$（$b>0$／$b<0$）｜$v=y,\ u=\ln x$」「**$S$ 形曲线** $y=\dfrac{1}{a+be^{-x}}$｜$v=\dfrac{1}{y},\ u=e^{-x}$」 表下题注「**图 8.5.2 部分常见的曲线函数的图形**」。
- **结论**: §8.5「一元非线性回归」的**六类可线性化曲线总表（含线性化变量代换）**，是「方差分析与回归分析」章非线性回归部分的权威清单，可直接引用；本页整页为表格 + 8 幅插图，OCR 完全不可用。
- **置信度**: high
- **对照**: OCR 文本（p437, chars=269, 89 行）作 `函数名称函数表达式图像线性化方法`、`<一`、`双曲线一=a+-b bia =y`、`函数x ao u=—一`、`oba x >`、`b>1/ b=`，**六行内容与全部代换式均被撕碎**；裁片逐字可读。
- **转写不确定项**: 无（图像内曲线标注文字（$b$ 取值范围）逐字可读，已按上列抄录）。

---

## R14 §1.3 计量经济学的数据类型（计量讲义 p6）

- **材料**: `参考文件/教材讲义/统计/计量经济学讲义0321.pdf`
- **页码**: PDF 第 6 页（页眉右侧页码「6」，与物理页一致）
- **生成命令**:
```bash
参考文件/_venv/Scripts/python.exe tools/refs-vision.py --pdf "参考文件/教材讲义/统计/计量经济学讲义0321.pdf" --page 6 --dpi 150 --out "backup/scratch/refs-vision/计量/p6_full.png"
```
  （整页；页尺寸 595.3 × 841.9 pt，rotation=0）
- **裁片**: `backup/scratch/refs-vision/计量/p6_full.png`（1241 × 1754 px, 210351 B, sha256 `ae9cdfbfddb967c963004069eee8c69bfc27530803b1d7d68b85cf7ee9917c9a`）
- **亲读原文**: 「**1.3 计量经济学的数据类型** 1. 截面数据：$x_i,\ i=1,2,\cdots,n$。如：2009 年我国各省份的 GDP；2024 各院校第一名学员的身高。2. 时间序列数据：$x_t,\ t=1,2,\cdots,T$。如：北京市 2000-2022 年 GDP；2020-2024 大师兄清华第一名学员的身高。3. 面板数据：$x_{it},\ i=1,2,\cdots,n,\ t=1,2,\cdots,T$。如：我国各省份 2000-2022 年 GDP；2020-2024 大师兄各院校第一名学员的身高。在面板数据中，给定 $t_0$，切一刀，得到截面数据；在面板数据中，给定 $i_0$，按时间排序，得到时间序列数据。」
- **结论**: 讲义 §1.3 三类数据（截面／时间序列／面板）的**完整定义与记号**，以及面板数据切片的两种退化方式。体例事实：本讲义**页眉左侧为节标题、右上角为页码、正文覆盖斜向水印「大师兄统计」**。
- **置信度**: high
- **对照**: OCR 文本作 `1.3计量经济学的数据类型`、`1．截面数据：c;,i=1,2,.·,n．`（$x_i$ 讹作 `c;`）、`2024各院校第一名学员的身高，`，公式记号被毁；裁片逐字可读。独立复核：水印为「大师兄统计」重复斜排，不构成正文。
- **转写不确定项**: 无。

---

## R15 §1.4 作业题（第一章 5 道）（计量讲义 p7）

- **材料**: `参考文件/教材讲义/统计/计量经济学讲义0321.pdf`
- **页码**: PDF 第 7 页
- **生成命令**:
```bash
参考文件/_venv/Scripts/python.exe tools/refs-vision.py --pdf "参考文件/教材讲义/统计/计量经济学讲义0321.pdf" --page 7 --dpi 150 --out "backup/scratch/refs-vision/计量/p7_full.png"
```
  （整页）
- **裁片**: `backup/scratch/refs-vision/计量/p7_full.png`（1241 × 1754 px, 172245 B, sha256 `bd3877d759c14708aa72edb6830939a60d7d66c1793513d446d63411d7c96e94`）
- **亲读原文**: 「**1.4 作业题** 1. 叙述下述模型如何用最小二乘法估计：(1) $Y=\dfrac{c}{X}$，$c$ 是参数；(2) $Y=X^{\beta_1}Z^{\beta_2}$，$\beta_1,\beta_2$ 是参数；(3) $Y=X^\beta+Z$，$\beta$ 是参数。2. 证明：如果估计量 $\hat\theta$ 满足：$E(\hat\theta)\to\theta$，且 $Var(\hat\theta)\to0$，则它是 $\theta$ 的相合估计。3. 证明方差恒等式：$Var(Y)=E[Var(Y|X)]+Var(E[Y|X])$。4. 设有多元正态 $X\sim N(\mu,\Sigma)$，问 $Y=AX$ 服从什么分布。5. 叙述并写出分块矩阵求逆公式。」
- **结论**: 第一章作业题 5 道完整题面（非线性模型的最小二乘化、相合估计的充分条件、全方差公式、多元正态线性变换分布、分块矩阵求逆）。可直接作为「回归/估计理论」题目来源。
- **置信度**: high
- **对照**: OCR 文本作 `(1)Y=，c是参数;(2)Y=Xz²2,β,β2是参数;(3)Y=X+Z,β是参数.`——把 $Y=c/X$ 讹作 `Y=`、$X^{\beta_1}Z^{\beta_2}$ 讹作 `Xz²2`、$X^\beta$ 讹作 `X`；裁片逐字可读，本条以裁片为准。
- **转写不确定项**: 无。

---

## R16 §2.3 拟合优度与 $F$ 检验（含 $R^2$ 与 $F$ 的等价式）（计量讲义 p12）

- **材料**: `参考文件/教材讲义/统计/计量经济学讲义0321.pdf`
- **页码**: PDF 第 12 页
- **生成命令**:
```bash
参考文件/_venv/Scripts/python.exe tools/refs-vision.py --pdf "参考文件/教材讲义/统计/计量经济学讲义0321.pdf" --page 12 --dpi 150 --out "backup/scratch/refs-vision/计量/p12_full.png"
```
  （整页）
- **裁片**: `backup/scratch/refs-vision/计量/p12_full.png`（1241 × 1754 px, 281527 B, sha256 `00a62fffa68c56121e4b68d12c010ebe3b3ae01be669c3bcc3abcee46b49ff3c`）
- **亲读原文**: 「**2.3 拟合优度与 $F$ 检验** 我们知道，总平方和 $\sum_{i=1}^{n}(Y_i-\bar Y)^2$ 可以分解，分解为 $\sum_{i=1}^{n}(Y_i-\bar Y)^2=\sum_{i=1}^{n}(\hat Y_i-\bar Y)^2+\sum_{i=1}^{n}(\hat Y_i-Y_i)^2,$ 其中回归平方和占总平方和越多，则说明解释变量对被解释变量的解释力度更显著，称之为拟合优度，定义为 $R^2=\dfrac{\sum_{i=1}^{n}(\hat Y_i-\bar Y)^2}{\sum_{i=1}^{n}(Y_i-\bar Y)^2}.$ 正常来说，如果 $R^2\geqslant0.7$，那么回归结果是非常好的…… 考虑到 $\sum_{i=1}^{n}(\hat Y_i-Y_i)^2\sim\sigma^2\chi^2(n-2),\quad \sum_{i=1}^{n}(\hat Y_i-\bar Y)^2\sim\sigma^2\chi^2(1),$ 故有 $F=\dfrac{\sum_{i=1}^{n}(\hat Y_i-\bar Y)^2}{\sum_{i=1}^{n}(\hat Y_i-Y_i)^2/(n-2)}=\dfrac{R^2\cdot SST}{(1-R^2)\cdot SST/(n-2)}=\dfrac{R^2}{(1-R^2)/(n-2)}\sim F(1,n-2),$ 观测到 $F_0$ 后，计算 p 值 $P=(F>F_0)$，如果该值小于等于 0.05，则说方程是显著的，也意味着解释变量对被解释变量的解释力度显著。」
- **结论**: 一元回归**平方和分解、$R^2$ 定义、经验判据 $R^2\geqslant0.7$、$F$ 的三种等价写法与 $F\sim F(1,n-2)$、p 值判别阈值 0.05**。与茆诗松 `定理 8.4.3`（见 R10：$S_e/\sigma^2\sim\chi^2(n-2)$、$S_R/\sigma^2\sim\chi^2(1)$）**完全一致**，两份材料互为正交叉核对证据。
- **置信度**: high
- **对照**: OCR 文本作 `(x-P=(-)²+(x-=1 =1 =1`、`其中回归平方和占总平方和越多，则说明`，公式全毁；裁片逐字可读。独立复核：$F=\frac{R^2}{1-R^2}(n-2)=\frac{R^2/(1-R^2)}{1/(n-2)}=\frac{R^2}{(1-R^2)/(n-2)}$ ✓；且与茆诗松 $\chi^2$ 自由度结论一致 ✓。
- **转写不确定项**: 无。

---

## R17 §2.4 建模案例＝占位节（计量讲义 p13）

- **材料**: `参考文件/教材讲义/统计/计量经济学讲义0321.pdf`
- **页码**: PDF 第 13 页
- **生成命令**:
```bash
参考文件/_venv/Scripts/python.exe tools/refs-vision.py --pdf "参考文件/教材讲义/统计/计量经济学讲义0321.pdf" --page 13 --dpi 150 --out "backup/scratch/refs-vision/计量/p13_full.png"
```
  （整页）
- **裁片**: `backup/scratch/refs-vision/计量/p13_full.png`（1241 × 1754 px, 88122 B, sha256 `a08a41c5048d2960280427d6e6612eebe38915bfab4a0a3748adf1d066074e61`）
- **亲读原文**: 「**2.4 建模案例** 课上讲.」（页眉左「2.4 建模案例」、右上页码「13」；正文仅此一行，其余为水印）
- **结论**: **占位节**：§2.4「建模案例」在本讲义中没有书面内容，只有「课上讲.」三字。同类占位节另有 §3.6（p23，R24）、§3.11（p29，R27）。**这些节在 2.2.0 里不可作为知识点支撑来源**。
- **置信度**: high
- **对照**: OCR 文本作 `2.4建模案例13`、`课上讲`，一致（无讹字）。
- **转写不确定项**: 无。

---

## R18 §2.5 无截距项的回归（计量讲义 p14）

- **材料**: `参考文件/教材讲义/统计/计量经济学讲义0321.pdf`
- **页码**: PDF 第 14 页
- **生成命令**:
```bash
参考文件/_venv/Scripts/python.exe tools/refs-vision.py --pdf "参考文件/教材讲义/统计/计量经济学讲义0321.pdf" --page 14 --dpi 150 --out "backup/scratch/refs-vision/计量/p14_full.png"
```
  （整页）
- **裁片**: `backup/scratch/refs-vision/计量/p14_full.png`（1241 × 1754 px, 148047 B, sha256 `eeee80bd543826c35e6e92875feb31012715d3763f86fb68fb6b54b7f3fd7e0e`）
- **亲读原文**: 「**2.5 无截距项的回归** 如果考虑模型 $Y_i=\beta X_i+\varepsilon_i,\quad i=1,2,\cdots,n,$ 一般来说，只有当我们非常确信 $X,Y$ 具有完全的正比例关系时，才去掉截距项建立模型。该模型的 OLS 是 $\hat\beta=\dfrac{\sum_{i=1}^{n}X_iY_i}{\sum_{i=1}^{n}X_i^2}.$ 以及有 $\dfrac{SSE}{\sigma^2}=\dfrac{\sum_{i=1}^{n}\left(Y_i-\hat Y_i\right)^2}{\sigma^2}\sim\chi^2(n-1).$」
- **结论**: 过原点回归的**最小二乘估计式**与**残差平方和的分布 $\chi^2(n-1)$**（对比有截距时为 $\chi^2(n-2)$，见 R16/R10）。可直接引用。
- **置信度**: high
- **对照**: OCR 文本作 `如果考虑模型Y=βX;+e,=1,2,..,n,`、`一般来说，只有当我们非常确信X,Y具有完全的正比例关系时`，公式下标丢失；裁片逐字可读。
- **转写不确定项**: 无。

---

## R19 §2.6 作业题（第二章 5 题，含四类 E[Y|X]）（计量讲义 p15）

- **材料**: `参考文件/教材讲义/统计/计量经济学讲义0321.pdf`
- **页码**: PDF 第 15 页
- **生成命令**:
```bash
参考文件/_venv/Scripts/python.exe tools/refs-vision.py --pdf "参考文件/教材讲义/统计/计量经济学讲义0321.pdf" --page 15 --dpi 150 --out "backup/scratch/refs-vision/计量/p15_full.png"
```
  （整页）
- **裁片**: `backup/scratch/refs-vision/计量/p15_full.png`（1241 × 1754 px, 264540 B, sha256 `cfa3d83ddf2561c773d2c8c8c25d9e36c86bbc2447ecd5a84da68034e0dc27b9`）
- **亲读原文**: 「**2.6 作业题** 1. 证明：对于随机变量 $X,Y$，有 $E[(Y-E[Y|X])g(X)]=0$ 对任意函数 $g$ 成立。2. 求解以下总体回归问题：(1)(线性假设) 设 $Y=a+bX+\varepsilon$，其中 $\varepsilon$ 与 $X$ 不相关，是零均值，方差为 $\sigma_\varepsilon^2$；又已知 $E(Y)=\mu_Y,\ D(Y)=\sigma_Y^2,\ E(X)=\mu_X,\ D(X)=\sigma_X^2,\ Corr(X,Y)=\rho_{XY}$，求 $a,b$。(2)(正态情形) 设 $(X,Y)\sim N(\mu_X,\mu_Y;\sigma_X^2,\sigma_Y^2;\rho_{XY})$，求 $E[Y|X]$。(3)(指数分布情形) 设 $X,Z$ 独立同服从参数为 1 的指数分布，且 $Y=X+Z$，求 $E[Y|X]$。(4)(泊松分布情形) 设 $Y,Z$ 独立同服从参数为 $\lambda$ 的泊松分布，且 $X=Y+Z$，求 $E[Y|X]$。3. 如果 $E[\varepsilon_i|X_i]=0$，证明：$Cov(\varepsilon_i,X_i)=0$。4. 设 $X$ 和 $Y$ 的样本相关系数是 $r$，证明：$r^2=\dfrac{\sum_{i=1}^{n}\left(\hat Y_i-\bar Y\right)^2}{\sum_{i=1}^{n}\left(Y_i-\bar Y\right)^2}.$ 5. 李子奈《计量经济学学习指南与练习（第 4 版）》第二章例题与习题（建模题不做）。」
- **结论**: 第二章作业题 5 道完整题面；其中第 4 题正是 $R^2=r^2$ 的证明（与 R16 的 $R^2$ 定义、茆诗松 §3.4.4「相关系数」直接呼应）。
- **置信度**: high
- **对照**: OCR 文本作 `E[(Y-E[Y|X])g(X)]=0对任意函数g成立.`（此行反而正确）、`D(Y)=σ²`、`r²` 前公式残缺；裁片逐字可读。
- **转写不确定项**: 无。

---

## R20 §3.2 OLS 的求解方法-矩阵表达（计量讲义 p17）

- **材料**: `参考文件/教材讲义/统计/计量经济学讲义0321.pdf`
- **页码**: PDF 第 17 页
- **生成命令**:
```bash
参考文件/_venv/Scripts/python.exe tools/refs-vision.py --pdf "参考文件/教材讲义/统计/计量经济学讲义0321.pdf" --page 17 --dpi 150 --out "backup/scratch/refs-vision/计量/p17_full.png"
```
  （整页）
- **裁片**: `backup/scratch/refs-vision/计量/p17_full.png`（1241 × 1754 px, 192727 B, sha256 `4f07e0fb78959e2e69816dd980ecf474e8f34760fbc990d4bba1bac22c75908f`）
- **亲读原文**: 「**3.2 OLS 的求解方法-矩阵表达** 根据最小二乘原理，需寻找一组参数估计值 $\hat\beta$，使得残差平方和 $Q=\sum_{i=1}^{n}\varepsilon_i^2=\varepsilon^\top\varepsilon=(Y-X\hat\beta)^\top(Y-X\hat\beta)$ 最小，即参数估计值应该是方程组 $\dfrac{\partial}{\partial\hat\beta}\left(Y-X\hat\beta\right)^\top\left(Y-X\hat\beta\right)=\mathbf{0}$ 的解。求解过程如下：$\dfrac{\partial}{\partial\hat\beta}\left(Y^\top Y-\hat\beta^\top X^\top Y-Y^\top X\hat\beta+\hat\beta^\top X^\top X\hat\beta\right)=0$；$\dfrac{\partial}{\partial\hat\beta}\left(Y^\top Y-2YX\hat\beta+\hat\beta^\top X^\top X\hat\beta\right)=0$；$-X^\top Y+X^\top X\hat\beta=0$，即得到 $X^\top Y=X^\top X\hat\beta$，于是，参数的最小二乘估计值为 $\hat\beta=(X^\top X)^{-1}X^\top Y$。」
- **结论**: OLS 的**矩阵推导全过程**（含矩阵求导的四个中间步与正规方程 $X^\top Y=X^\top X\hat\beta$）与最终估计式 $\hat\beta=(X^\top X)^{-1}X^\top Y$。可直接引用（注意：原讲义第二步把 $Y^\top X\hat\beta$ 写成 $YX\hat\beta$，属记法省略转置，不影响结果）。
- **置信度**: high
- **对照**: OCR 文本作 `Q==cTe=(Y-xB)T(Y-XB)Q==cT`、`根据最小二乘原理,需寻找一组参数估计值β，使得残差平方和`，公式全毁；裁片逐字可读。独立复核：$\frac{\partial}{\partial\hat\beta}(\hat\beta^\top X^\top X\hat\beta)=2X^\top X\hat\beta$，与 $-X^\top Y+X^\top X\hat\beta=0$ 一致 ✓。
- **转写不确定项**: 第二步 `-2YX\hat\beta` 在裁片上确为 `2YXβ̂`（缺转置符），照原样抄录。

---

## R21 §3.3 OLS 的求解方法-代数表达（克拉默法则解二元正规方程）（计量讲义 p19）

- **材料**: `参考文件/教材讲义/统计/计量经济学讲义0321.pdf`
- **页码**: PDF 第 19 页
- **生成命令**:
```bash
参考文件/_venv/Scripts/python.exe tools/refs-vision.py --pdf "参考文件/教材讲义/统计/计量经济学讲义0321.pdf" --page 19 --dpi 150 --out "backup/scratch/refs-vision/计量/p19_full.png"
```
  （整页）
- **裁片**: `backup/scratch/refs-vision/计量/p19_full.png`（1241 × 1754 px, 134657 B, sha256 `05f889182b80aa6c6f4f3e1737483de551ce74382965041f96db42dcf7601274`）
- **亲读原文**: 「即 $\hat b l_{xx}+\hat c l_{xz}=l_{xy}$，同理由第三个式子得 $\hat b l_{xz}+\hat c l_{zz}=l_{zy}$。即有线性方程组 $\begin{cases}l_{xx}\cdot\hat b+l_{xz}\cdot\hat c=l_{xy}\\ l_{xz}\cdot\hat b+l_{zz}\cdot\hat c=l_{zy}\end{cases}$ 根据克拉默法则，解得 $\hat b=\dfrac{l_{xy}l_{zz}-l_{xz}l_{zy}}{l_{xx}l_{zz}-l_{xz}^2},\quad \hat c=\dfrac{l_{xx}l_{zy}-l_{xy}l_{xz}}{l_{xx}l_{zz}-l_{xz}^2},$ 代入得 $\hat a=\bar y-\hat b\bar x-\hat c\bar z.$」
- **结论**: 二元回归 OLS 的**代数解（克拉默法则）**：两正规方程、$\hat b,\hat c$ 的显式解与 $\hat a$。可直接引用。
- **置信度**: high
- **对照**: OCR 文本作 `即blax+z=lzy，同理由第三个式子得blxz+lz=lzy.即有线性方程组`、`Mrm-+a-C=ry`、`le6+le·cay`、`根据克拉默法则`，$l$ 下标全部错乱；裁片逐字可读。独立复核：二元正规方程系数矩阵行列式 $l_{xx}l_{zz}-l_{xz}^2$，与解式一致 ✓。
- **转写不确定项**: 无。

---

## R22 §3.4 其他求点估计的方法（3.4.1 MLE / 3.4.2 MM）（计量讲义 p20）

- **材料**: `参考文件/教材讲义/统计/计量经济学讲义0321.pdf`
- **页码**: PDF 第 20 页
- **生成命令**:
```bash
参考文件/_venv/Scripts/python.exe tools/refs-vision.py --pdf "参考文件/教材讲义/统计/计量经济学讲义0321.pdf" --page 20 --dpi 150 --out "backup/scratch/refs-vision/计量/p20_full.png"
```
  （整页）
- **裁片**: `backup/scratch/refs-vision/计量/p20_full.png`（1241 × 1754 px, 291209 B, sha256 `42544775f4baaf96258e7837f4bd8cf6c9204d572dc8cdff9149e6ed1f51fbaa`）
- **亲读原文**: 「**3.4 其他求点估计的方法 3.4.1 MLE** 如果加上正态分布的假设，我们可以求出其 MLE。此时，根据多元正态分布理论，似然函数是 $L(\beta,\sigma^2)=P(Y_1,Y_2,\cdots,Y_n)=\dfrac{1}{(2\pi)^{\frac{n}{2}}\sigma^n}e^{-\frac{1}{2\sigma^2}\sum_i\left[Y_i-(\beta_0+\beta_1X_{i1}+\beta_2X_{i2}+\cdots+\beta_kX_{ik})\right]^2}=\dfrac{1}{(2\pi)^{\frac{n}{2}}\sigma^n}e^{-\frac{1}{2\sigma^2}(Y-X\beta)'(Y-X\beta)},$ 对应的对数似然函数是 $\ln L=-n\ln(\sqrt{2\pi}\sigma)-\dfrac{1}{2\sigma^2}(Y-X\beta)'(Y-X\beta),$ 最大化对数似然函数又意味着最小化残差平方和，因此 $\hat\beta=(X'X)^{-1}X'Y$ …… 容易得出多元线性回归下随机干扰项方差的 MLE 如下：$\hat\sigma^2=\dfrac{(Y-X\hat\beta)'(Y-X\hat\beta)}{n}=\dfrac{\sum\hat\varepsilon_i^2}{n}.$ 将分母修正为 $n-(k+1)$ 即为无偏估计。$\hat\sigma^2=\dfrac{(Y-X\hat\beta)'(Y-X\hat\beta)}{n-(k+1)}=\dfrac{\sum\hat\varepsilon_i^2}{n-(k+1)}.$ **3.4.2 MM** 类似一元情形，我们也可以求矩估计，有 $E\left(X_i^\top\varepsilon_i\right)=0\quad\Rightarrow\quad \dfrac{1}{n}\sum_{i=1}^{n}X_i^\top\left(Y_i-X_i\hat\beta\right)=0,$ 这等价于 $X^\top\left(Y-X\hat\beta\right)=0,$ 又解得 $\hat\beta=(X'X)^{-1}X'Y.$」
- **结论**: **MLE 与矩估计（MM）两条路径都回到同一个 OLS 估计式**；$\sigma^2$ 的 MLE 分母为 $n$、无偏修正分母为 $n-(k+1)$。这是讲义里「估计方法等价性」的关键结论，可直接引用。注意：结构索引中该页原标为「3.4.1 MLE」，**实际节标题为 §3.4 其他求点估计的方法**（3.4.1 MLE / 3.4.2 MM 为其子节）。
- **置信度**: high
- **对照**: OCR 文本作 `L(3,o²)=P`、`如果加上正态分布的假设，我们可以求出其MLE.此时，根据多元正态分布理论`，似然函数与两条结论全部缺失或被截断（chars=320）；裁片逐字可读。
- **转写不确定项**: 无。

---

## R23 §3.5 OLS 估计的结论：$Y_0$ 的预测区间（计量讲义 p22）

- **材料**: `参考文件/教材讲义/统计/计量经济学讲义0321.pdf`
- **页码**: PDF 第 22 页
- **生成命令**:
```bash
参考文件/_venv/Scripts/python.exe tools/refs-vision.py --pdf "参考文件/教材讲义/统计/计量经济学讲义0321.pdf" --page 22 --dpi 150 --out "backup/scratch/refs-vision/计量/p22_full.png"
```
  （整页）
- **裁片**: `backup/scratch/refs-vision/计量/p22_full.png`（1241 × 1754 px, 95352 B, sha256 `c83b6d9522cf678bef540a9f1f35babd8073cc66619b24eec7d857c62e0be0ee`）
- **亲读原文**: 「$Y_0$ 的预测区间是 $Y_0\in X_0\hat\beta\pm t_{1-\frac{\alpha}{2}}\hat\sigma\sqrt{1+X_0(X^\top X)^{-1}X_0^\top}.$」（页眉左「3.5 OLS 估计的结论」、右上页码「22」，本页仅此一行公式，其余空白）
- **结论**: 多元回归**单个新观测的预测区间**公式（含 $\sqrt{1+X_0(X^\top X)^{-1}X_0^\top}$ 的「预测」而非「均值」形式）。可直接引用；是 §3.5 的核心结论（该节主体在 p21，本页为其收尾）。
- **置信度**: high
- **对照**: OCR 文本作 `Y的预测区间是`、`YoeXoB±ta√1+Xo(XTx)-1xJ.`，分式 $t_{1-\alpha/2}$ 讹作 `ta`、$X_0^\top$ 讹作 `xJ`；裁片逐字可读，本条以裁片为准。
- **转写不确定项**: $t$ 的下标在裁片上为 $1-\frac{\alpha}{2}$（与教材常用 $t_{1-\alpha/2}(n-k-1)$ 记号一致，本页未写自由度）。

---

## R24 §3.6 建模案例＝占位节（计量讲义 p23）

- **材料**: `参考文件/教材讲义/统计/计量经济学讲义0321.pdf`
- **页码**: PDF 第 23 页
- **生成命令**:
```bash
参考文件/_venv/Scripts/python.exe tools/refs-vision.py --pdf "参考文件/教材讲义/统计/计量经济学讲义0321.pdf" --page 23 --dpi 150 --out "backup/scratch/refs-vision/计量/p23_full.png"
```
  （整页）
- **裁片**: `backup/scratch/refs-vision/计量/p23_full.png`（1241 × 1754 px, 88888 B, sha256 `fc41ee623d8900dcf5d58f7be1a2f9f8d951ba80e1e0e05c1a1baee867231fa0`）
- **亲读原文**: 「**3.6 建模案例** 课上讲.」（页眉左「3.6 建模案例」、右上页码「23」）
- **结论**: **占位节**（无书面内容），与 R17（§2.4）、R27（§3.11）同类。
- **置信度**: high
- **对照**: OCR 文本作 `3.6建模案例23`、`课上讲`，一致。
- **转写不确定项**: 无。

---

## R25 §3.9 邹至庄稳定性检验（Chow test）（计量讲义 p26）

- **材料**: `参考文件/教材讲义/统计/计量经济学讲义0321.pdf`
- **页码**: PDF 第 26 页
- **生成命令**:
```bash
参考文件/_venv/Scripts/python.exe tools/refs-vision.py --pdf "参考文件/教材讲义/统计/计量经济学讲义0321.pdf" --page 26 --dpi 150 --out "backup/scratch/refs-vision/计量/p26_full.png"
```
  （整页）
- **裁片**: `backup/scratch/refs-vision/计量/p26_full.png`（1241 × 1754 px, 320444 B, sha256 `bf87962d4968ffb763c01f1148455b9c760744a7b61eb234bad4a44ce2a42378`）
- **亲读原文**: 「**3.9 邹至庄稳定性检验** 对两个不同的组各自对应的样本 $(1,2,\cdots,n_1)$ 与 $(1,2,\cdots,n_2)$，相应的模型分别为 $Y=\beta_0+\beta_1X_1+\cdots+\beta_kX_k+\varepsilon_1$，$Y=\alpha_0+\alpha_1X_1+\cdots+\alpha_kX_k+\varepsilon_2$。合并两个样本的大样本为 $(1,2,\cdots,n_1,n_1+1,\cdots,n_1+n_2)$，则可写出如下无约束回归模型：$\begin{pmatrix}Y_1\\Y_2\end{pmatrix}=\begin{pmatrix}X_1&\mathbf{0}\\\mathbf{0}&X_2\end{pmatrix}\begin{pmatrix}\beta\\\alpha\end{pmatrix}+\begin{pmatrix}\varepsilon_1\\\varepsilon_2\end{pmatrix},$ 其中，$\beta,\alpha$ 分别是两样本组对应模型中的参数列向量…… 如果 $\beta=\alpha$，表示两个组别在回归函数上无差别，因此可针对如下假设进行检验：$H_0:\beta=\alpha$。施加该约束条件后变换为受约束回归模型 $\begin{pmatrix}Y_1\\Y_2\end{pmatrix}=\begin{pmatrix}X_1\\X_2\end{pmatrix}\beta+\begin{pmatrix}\mu_1\\\mu_2\end{pmatrix}$。因此，仍可用如下 $F$ 统计量进行检验：$F=\dfrac{(SSE_R-SSE_U)/(k+1)}{SSE_U/\left[n_1+n_2-2(k+1)\right]}\sim F\left[k+1,\ n_1+n_2-2(k+1)\right].$ 注意，这里无约束模型中，参数个数是 $2(k+1)$，而约束模型中，仅是 $k+1$，因此分子自由度是 $k+1$，分母自由度是 $n-2(k+1)$。」
- **结论**: 邹至庄（Chow）稳定性检验的**完整模型设定、原假设 $H_0:\beta=\alpha$、无约束/受约束模型的矩阵形式与 $F$ 统计量及其自由度**。可直接引用。
- **置信度**: high（模型与 $F$ 式逐字清晰）
- **对照**: OCR 文本作 `3.9邹至庄稳定性检验`（此标题 OCR 正确）、`对两个不同的组各自对应的样本（1,2,·,n1）与（1,2,···,n2)`，但矩阵块与 $F$ 式全部塌成单行；裁片逐字可读。
- **转写不确定项**: 末句「分母自由度是 $n-2(k+1)$」**原文如此**（与上一式写作 $n_1+n_2-2(k+1)$ 不一致，疑漏写下标 $1,2$）。按「逐字抄录」原则保持原样，并在 §公式清单中标注为「原文疑似笔误」。

---

## R26 §3.10 投影理论（遗漏变量偏差极限）（计量讲义 p28）

- **材料**: `参考文件/教材讲义/统计/计量经济学讲义0321.pdf`
- **页码**: PDF 第 28 页
- **生成命令**:
```bash
参考文件/_venv/Scripts/python.exe tools/refs-vision.py --pdf "参考文件/教材讲义/统计/计量经济学讲义0321.pdf" --page 28 --dpi 150 --out "backup/scratch/refs-vision/计量/p28_full.png"
```
  （整页）
- **裁片**: `backup/scratch/refs-vision/计量/p28_full.png`（1241 × 1754 px, 265857 B, sha256 `d54ea418fd395df792487dec838a674b858d4c7a24fc34344c2606344ef616c0`）
- **亲读原文**: 「$Proof.$ 对于一元回归，显然有 $\hat\beta_1=\dfrac{\sum_{i=1}^{n}X_{i1}Y_i}{\sum_{i=1}^{n}X_{i1}^2}$。对于二元回归，列出正规方程组 $\begin{cases}\left(\sum X_{i1}^2\right)\hat b_1+\left(\sum X_{i1}X_{i2}\right)\hat b_2=\sum X_{i1}Y_i,\\ \left(\sum X_{i1}X_{i2}\right)\hat b_1+\left(\sum X_{i2}^2\right)\hat b_2=\sum X_{i2}Y_i,\end{cases}$ 利用克拉默法则，解得 $\hat b_1=\dfrac{\left(\sum X_{i1}Y_i\right)\left(\sum X_{i2}^2\right)-\left(\sum X_{i1}X_{i2}\right)\left(\sum X_{i2}Y_i\right)}{\left(\sum X_{i1}^2\right)\left(\sum X_{i2}^2\right)-\left(\sum X_{i1}X_{i2}\right)^2},$ 如果我们分别引入记号 $l_{11},l_{12},l_{22},l_{yy},l_{1y},l_{2y}$，那么 $\hat b_1=\dfrac{l_{1y}l_{22}-l_{12}l_{2y}}{l_{11}l_{22}-l_{12}^2}=\dfrac{\frac{l_{1y}}{l_{11}}l_{22}-l_{2y}\frac{l_{12}}{l_{11}}}{l_{22}-l_{12}\frac{l_{12}}{l_{11}}}=\dfrac{\hat\beta_1l_{22}-l_{2y}\hat\alpha}{l_{22}-l_{12}\hat\alpha},$ 其中 $\hat\alpha$ 是方程 $X_{i2}=\alpha X_{i1}+e_i$ 的估计量。因此有 $D=\hat b_1-\hat\beta_1=\dfrac{\left(l_{12}\hat\beta_1-l_{2y}\right)\hat\alpha}{l_{22}-l_{12}\hat\alpha},$ 考虑其极限，有 $D=\dfrac{\left(l_{12}\hat\beta_1-l_{2y}\right)\hat\alpha}{l_{22}-l_{12}\hat\alpha}\xrightarrow{P}\dfrac{\left(\rho_{12}\sigma_1\sigma_2\beta_1-\rho_{2y}\sigma_2\sigma_y\right)\alpha}{\sigma_2^2-\rho_{12}\sigma_1\sigma_2\alpha}.$ 如果理论模型中，$X_2$ 不能由 $X_1$ 解释，那么 $\alpha$ 的真值是 $0$，即 $D\xrightarrow{P}0$。如果理论模型中，$X_2$ 能由 $X_1$ 解释，那么我们将 $\alpha$ 写为 $\alpha=\dfrac{Cov(X_1,X_2)}{Var(X_1)}=\dfrac{\rho_{12}\sigma_2}{\sigma_1}$，同时 $\beta_1=\dfrac{\rho_{1y}\sigma_y}{\sigma_1}$，因此有 $D\xrightarrow{P}\dfrac{\left(\rho_{12}\rho_{1y}-\rho_{2y}\right)\rho_{12}\sigma_y}{\left(1-\rho_{12}^2\right)\sigma_1}.$」
- **结论**: **遗漏变量偏差的极限表达式**：一元回归系数 $\hat b_1$ 与二元回归中 $\hat\beta_1$ 之差的概率极限，以及 $\alpha=0$（$X_2$ 不能由 $X_1$ 解释）时 $D\to0$ 的判定。属「投影理论/遗漏变量偏差」核心结论，可直接引用。
- **置信度**: high
- **对照**: OCR 文本作 `Prof.对于一元回归，显然有B=。对于二元回归，列出正规方程组`、`(∑x²)b+(∑XuXx2)b2=XaY,`，公式下标全毁；裁片逐字可读。独立复核：$\frac{l_{1y}l_{22}-l_{12}l_{2y}}{l_{11}l_{22}-l_{12}^2}$ 分子分母同除 $l_{11}$ 得 $\frac{(l_{1y}/l_{11})l_{22}-l_{2y}(l_{12}/l_{11})}{l_{22}-l_{12}^2/l_{11}}$ ✓。
- **转写不确定项**: `Proof.` 与 `Prof.` 的取舍——裁片上为斜体 `Proof.`（OCR 讹作 `Prof.`）。

---

## R27 §3.11 拟最大似然估计（QMLE）＝占位节（计量讲义 p29）

- **材料**: `参考文件/教材讲义/统计/计量经济学讲义0321.pdf`
- **页码**: PDF 第 29 页
- **生成命令**:
```bash
参考文件/_venv/Scripts/python.exe tools/refs-vision.py --pdf "参考文件/教材讲义/统计/计量经济学讲义0321.pdf" --page 29 --dpi 150 --out "backup/scratch/refs-vision/计量/p29_full.png"
```
  （整页）
- **裁片**: `backup/scratch/refs-vision/计量/p29_full.png`（1241 × 1754 px, 99167 B, sha256 `b8dbbfdb048a91409de41f53bf0485ea28ab397440a29941a25aff847049532e`）
- **亲读原文**: 「**3.11 拟最大似然估计（QMLE）** 课上讲.」（页眉左「3.11 拟最大似然估计（QMLE）」、右上页码「29」）
- **结论**: **占位节**（无书面内容），与 R17（§2.4）、R24（§3.6）同类。**注意：§3.11 标题中的 OCR 讹字「3.11擬…」不存在，裁片为「拟最大似然估计（QMLE）」**。
- **置信度**: high
- **对照**: OCR 文本作 `3.11拟最大似然估计（QMLE）29`、`课上讲．`，一致。
- **转写不确定项**: 无。

---

## R28 §3.12 作业题（第三章 5 题）（计量讲义 p30）

- **材料**: `参考文件/教材讲义/统计/计量经济学讲义0321.pdf`
- **页码**: PDF 第 30 页
- **生成命令**:
```bash
参考文件/_venv/Scripts/python.exe tools/refs-vision.py --pdf "参考文件/教材讲义/统计/计量经济学讲义0321.pdf" --page 30 --dpi 150 --out "backup/scratch/refs-vision/计量/p30_full.png"
```
  （整页）
- **裁片**: `backup/scratch/refs-vision/计量/p30_full.png`（1241 × 1754 px, 189541 B, sha256 `4b8e9705069d50a9bdbb13cd3d67348fcea1b904f9dd6b014d21ac85954fdaaf`）
- **亲读原文**: 「**3.12 作业题** 1. 自行回顾矩阵求导，熟练推导多元线性回归模型的 OLS 求解过程。2. 给定约束 $\begin{pmatrix}1&0&1\\0&1&2\\0&0&0\end{pmatrix}\begin{pmatrix}\beta_0\\\beta_1\\\beta_2\end{pmatrix}=\begin{pmatrix}0\\0\\0\end{pmatrix},$ 求 $SSE_U-SSE_R$ 的自由度。3. 设定 $Y_i=C+AR_i\cos(\omega_0\theta_i+\varphi)+\varepsilon_i$，叙述如何求 $(C,A,\varphi)$ 的 OLS。4. 对于原假设 $H_0:\beta_j=1$，构造对应的检验拒绝域。5. 李子奈《计量经济学学习指南与练习（第 4 版）》第三章例题与习题（建模题不做）。」
- **结论**: 第三章作业题 5 道完整题面（约束矩阵、$SSE_U-SSE_R$ 自由度、非线性参数线性化、单参数假设的拒绝域）。**注意标题的 OCR 讹字「3.12關作业题」中的「關」不存在**；裁片为「3.12 作业题」。
- **置信度**: high
- **对照**: OCR 文本作 `3.12關作业题30`、`2．给定约束0 2求SSEu－SSER的自由度`——约束矩阵被 OCR 撕成 `0 2`；裁片给出完整 3×3 矩阵。
- **转写不确定项**: 无。

---

## R29 §4.4 作业题（异方差／WLS 3 题）（计量讲义 p43）

- **材料**: `参考文件/教材讲义/统计/计量经济学讲义0321.pdf`
- **页码**: PDF 第 43 页
- **生成命令**:
```bash
参考文件/_venv/Scripts/python.exe tools/refs-vision.py --pdf "参考文件/教材讲义/统计/计量经济学讲义0321.pdf" --page 43 --dpi 150 --out "backup/scratch/refs-vision/计量/p43_full.png"
```
  （整页）
- **裁片**: `backup/scratch/refs-vision/计量/p43_full.png`（1241 × 1754 px, 176319 B, sha256 `03baf7caa60b8272104037440710b28ad2d764f88defb37370d9d844f57d1bab`）
- **亲读原文**: 「**4.4 作业题** 1. 设 $Y=X\beta+\varepsilon$，其中 $\varepsilon$ 零均值，有协方差矩阵 $\Omega=\mathrm{diag}\{\sigma_1^2,\cdots,\sigma_n^2\}$，写出拟对数似然函数。2. 多元回归模型中，若 $Var(\varepsilon_i\,|\,X)=\sigma^2\exp\{\alpha_0+\alpha_1X_{i1}+\cdots+\alpha_kX_{ik}\}$，试确定 WLS 的权重。3. 回归模型 $Y_i=\beta_0+\beta_1X_i+\varepsilon_i$ 中，若 $Var(\varepsilon_i\,|\,X)=X_i^2\sigma^2$，试确定 WLS 的权重，写出 WLS 估计量。4. 李子奈《计量经济学学习指南与练习（第 4 版）》第四章例题与习题（建模题不做）。」
- **结论**: 第四章（异方差）作业题 4 道完整题面：一般协方差阵的拟对数似然、指数型异方差下的 WLS 权重、$X_i^2\sigma^2$ 异方差下的 WLS 权重与估计量。可直接引用。
- **置信度**: high
- **对照**: OCR 文本作 `1.设Y=Xβ+ε,其中ε零均值,有协方差矩阵Ω=diag{o²,··,o2}`、`2.多元回归模型中,若Var(ei|X)=o²e`（指数部分被截断）；裁片逐字可读。
- **转写不确定项**: 无。

---

## R30 作业题解答：第三章 2–4 题 + 第四章 1–3 题（WLS 权重与估计量）（计量讲义 p45）

- **材料**: `参考文件/教材讲义/统计/计量经济学讲义0321.pdf`
- **页码**: PDF 第 45 页
- **生成命令**:
```bash
参考文件/_venv/Scripts/python.exe tools/refs-vision.py --pdf "参考文件/教材讲义/统计/计量经济学讲义0321.pdf" --page 45 --dpi 150 --out "backup/scratch/refs-vision/计量/p45_full.png"
```
  （整页）
- **裁片**: `backup/scratch/refs-vision/计量/p45_full.png`（1241 × 1754 px, 284833 B, sha256 `b15e35efff98bbe54615090d5563620f1bfcedc328ad292181f5d9647c8a43dc`）
- **亲读原文**: 「**第三章** 1. 略. 2. $\mathrm{rank}(A)=2$，说明只有一个自由参数，即 $k_R+1=1$，(注意一般 $k_R+1$ 才表示自由参数的个数)，而无约束的 $k+1=3$，故 $SSE_U-SSE_R\sim\sigma^2\chi^2(k-k_R).$ 3. 将方程写为 $Y_i=C+(A\cos\varphi)\cdot R_i\cos(\omega_0\theta_i)+(-A\sin\varphi)\cdot R_i\sin(\omega_0\theta_i)=\beta_0+\beta_1X_{i1}+\beta_2X_{i2},$ 其中 $\begin{cases}C=\beta_0,\\ A\cos\varphi=\beta_1,\\ -A\sin\varphi=\beta_2,\end{cases}$ 先解出右边的 OLS，再代回去解出左边的 OLS。4. 利用检验统计量 $T=\dfrac{\hat\beta_j-1}{std_{\hat\beta_j}}=\dfrac{\hat\beta_j-1}{\hat\sigma\sqrt{c_{jj}}}\sim t(n-(k+1))$，有拒绝域 $W=\left\{|T|>t_{1-\frac{\alpha}{2}}(n-(k+1))\right\}.$ **第四章** 1. 拟对数似然函数是 $\ln L(\theta)=-\dfrac{n}{2}\ln(2\pi)-\dfrac{1}{2}\sum_{i=1}^{n}\ln\left(\sigma_i^2\right)-\dfrac{1}{2}\sum_{i=1}^{n}\dfrac{(Y_i-X_i\beta)^2}{2\sigma_i^2}.$ 2. WLS 的权重与方差的倒数成正比，即取 $w_i=\dfrac{1}{\exp\{\alpha_0+\alpha_1X_{i1}+\cdots+\alpha_kX_{ik}\}}.$ 3. WLS 的权重与方差的倒数成正比，即取 $w_i=\dfrac{1}{X_i^2}$，得 $Q(\beta)=\sum_{i=1}^{n}\dfrac{1}{X_i^2}\left(Y_i-\beta_0-\beta_1X_i\right)^2=\sum_{i=1}^{n}\left(\dfrac{Y_i}{X_i}-\beta_0\dfrac{1}{X_i}-\beta_1\right)^2=\sum_{i=1}^{n}\left(Z_i-\beta_0W_i-\beta_1\right)^2,$ 这实际说明 $\hat\beta_0=\dfrac{l_{wz}}{l_{ww}}=\dfrac{\sum_{i=1}^{n}\left(W_i-\bar W\right)\left(Z_i-\bar Z\right)}{\sum_{i=1}^{n}\left(W_i-\bar W\right)^2},\quad \hat\beta_1=\bar Z-\beta_0\bar W.$」
- **结论**: 第三/四章作业的**官方解答**：约束回归的 $\chi^2$ 自由度 $k-k_R$、三角函数模型线性化、单参数检验拒绝域；以及**WLS 权重的两种取法（$1/\exp\{\cdot\}$、$1/X_i^2$）与加权最小二乘估计量显式解**。这些是「异方差 = 加权最小二乘 (WLS)」知识点可直接引用的原文依据；与茆诗松 §8.4 的最小二乘框架互补。
- **置信度**: high
- **对照**: OCR 文本作 `2.rank(A）=2，说明只有一个自由参数`、`故SSEu-SS`（截断）、`第三章` 与 `1.略。` 顺序错乱；裁片逐字可读。独立复核：$Var(X_i^2\sigma^2)$ 下 $w_i=1/X_i^2$ 与 $Q(\beta)$ 的 $Z,W$ 重参数化一致 ✓。
- **转写不确定项**: 第四章第 1 题末项 $-\frac{1}{2}\sum\frac{(Y_i-X_i\beta)^2}{2\sigma_i^2}$ **原文如此**（分母多了一个 2，疑笔误）；逐字抄录并在 §公式清单标注「原文疑似笔误」。

---

## R31 专题八末页：指数分布尺度参数的枢轴量（专题八 常用分布族 p6）

- **材料**: `参考文件/教材讲义/统计/专题八 常用分布族.pdf`
- **页码**: PDF 第 6 页（共 6 页，末页；页脚居中「6」）
- **生成命令**:
```bash
参考文件/_venv/Scripts/python.exe tools/refs-vision.py --pdf "参考文件/教材讲义/统计/专题八 常用分布族.pdf" --page 6 --dpi 150 --out "backup/scratch/refs-vision/专题/z8_p6_full.png"
```
  （整页；页尺寸 595.3 × 841.9 pt，rotation=0）
- **裁片**: `backup/scratch/refs-vision/专题/z8_p6_full.png`（1241 × 1754 px, 21344 B, sha256 `6dd806b63bbf7537e6f813f6cea22e2ff47480a31185253fb5ff647834283429`）
- **亲读原文**: 「$\dfrac{X_n}{\lambda}\Big/ \dfrac{X_1}{\lambda}=\dfrac{Y_n}{Y_1}$ 的分布不依赖于参数.（其中 $Y_n/\lambda$、$Y_1/\lambda$ 上下相除）$\dfrac{X_{(n)}}{X_{(1)}}$ 同理.」
  逐字版：「$\frac{\frac{X_n}{\lambda}}{\frac{X_1}{\lambda}}=\frac{Y_n}{Y_1}$ 的分布不依赖于参数. $\frac{X_{(n)}}{X_{(1)}}$ 同理.」
- **结论**: 指数分布样本的**比值枢轴量**：$X_n/X_1$（及次序统计量 $X_{(n)}/X_{(1)}$）的分布与尺度参数 $\lambda$ 无关，是构造 $\lambda$ 的置信区间/检验的关键（指数分布族的位置—尺度结构）。**本页是专题八 6 页里的低产页（chars=52），但正文内容完整且公式可读**——属「页内内容少」而非「OCR 失败」。
- **置信度**: high
- **对照**: OCR 文本作 `Xn / X1 = / Yn / λ / Y1 / λ / = Yn / Y1 的分布不依赖于参数. / X(n) / X(1) 同理. / 6`——**分母行被拆散**（`Xn/X1` 与 `Yn/Y1` 之间的两个分号结构丢失），裁片显示为「分数除以分数」的复合分式；以裁片为准。
- **转写不确定项**: 无（裁片上两个分式层次清晰）。

---

## R32 专题十三末页：Bonferroni 同时置信区间数值例（专题十三 方差分析 p9）

- **材料**: `参考文件/教材讲义/统计/专题十三 方差分析.pdf`
- **页码**: PDF 第 9 页（共 9 页，末页；页脚居中「9」）
- **生成命令**:
```bash
参考文件/_venv/Scripts/python.exe tools/refs-vision.py --pdf "参考文件/教材讲义/统计/专题十三 方差分析.pdf" --page 9 --dpi 150 --out "backup/scratch/refs-vision/专题/z13_p9_full.png"
```
  （整页）
- **裁片**: `backup/scratch/refs-vision/专题/z13_p9_full.png`（1241 × 1754 px, 41545 B, sha256 `58f902ae8755c419635b80d42dbc33b9b4e5b054521340ee1f9ee4ddf4bde084`）
- **亲读原文**: 「$\mu_2-\mu_1$ 的置信区间为 $\bar y_{2\cdot}-\bar y_{1\cdot}\pm s_p\sqrt{\dfrac{1}{r_2}+\dfrac{1}{r_1}}t_{1-\frac{\gamma}{2}}(n-s),$ 即 $1041-1055\pm\sqrt{206.2}\sqrt{\dfrac{1}{10}+\dfrac{1}{10}}t_{0.975}(27)=[-27.18,-0.82]$ 于是 $\begin{cases}\mu_3-\mu_2\in[33.82,60.18]\\ \mu_2-\mu_1\in[-27.18,-0.82]\end{cases}$ 可作为它们一个 $0.9$ 水平的同时置信区间.」
- **结论**: 单因素方差分析中**两两均值差的置信区间公式**（$s_p$ 为合并标准差、$n-s$ 为误差自由度）与一个完整的**同时置信区间算例**（第 3 组与第 2 组、第 2 组与第 1 组在 0.9 水平下同时置信）。可直接引用，与茆诗松 §8.2.4「多重比较」（附表 8 $q$ 分布分位数表）互补。
- **置信度**: high
- **对照**: OCR 文本作 `µ2 −µ1 的置信区间为¯y2· −¯y1· ± sp / √ / 1 / r2 + 1 / r1 t1−γ / 2 (n −s), 即`——**结构正确但分式被拆行**；数值行 `1041 −1055 ± / √ / 206.2 / √ / 1 / 10 + 1 / 10t0.975 (27) = [−27.18, −0.82]` 与裁片一致。独立复核：$1055-1041=14$；$t_{0.975}(27)\approx2.052$，$2.052\times\sqrt{206.2}\times\sqrt{0.2}=2.052\times14.36\times0.4472\approx13.18$，得 $[-27.18,-0.82]$ ✓。
- **转写不确定项**: 无。

---

## R33 专题五「随机变量函数的分布」例题 3.3／3.4／3.5（专题五 p6）

- **材料**: `参考文件/教材讲义/统计/专题五 随机变量函数的分布.pdf`
- **页码**: PDF 第 6 页（共 7 页；页脚居中「6」）
- **生成命令**:
```bash
参考文件/_venv/Scripts/python.exe tools/refs-vision.py --pdf "参考文件/教材讲义/统计/专题五 随机变量函数的分布.pdf" --page 6 --dpi 150 --out "backup/scratch/refs-vision/专题/z5_p6_full.png"
```
  （整页）
- **裁片**: `backup/scratch/refs-vision/专题/z5_p6_full.png`（1241 × 1754 px, 123750 B, sha256 `88073bd3c737e9159dade714eb6c25d4bf28837a564dceca1e1cc55a5a434106`）
- **亲读原文**: 「**例题 3.3:** 设 $X$ 和 $Y$ 是一对独立的伽玛随机变量，参数分别为 $(r,1)$ 和 $(s,1)$ 证明 $Z_1=X+Y$ 与 $Z_2=X/(X+Y)$ 独立，并求它们各自的分布（$Z_1,Z_2$ 分别服从伽玛分布和贝塔分布）.**例题 3.4:** 设 $X$ 和 $Y$ 是两个独立随机变量，且分别服从参数为 $\lambda$ 和 $\mu$ 的指数分布.我们无法直接观测 $X$ 和 $Y$ 的值，但却可以观测 $Z$ 和 $W,$ 其中 $Z=\min\{X,Y\}$ 且 $W=\begin{cases}1,&\text{若}Z=X\\0,&\text{若}Z=Y\end{cases}$（这种情况在医学试验中很普遍，此时 $X$ 和 $Y$ 往往是删失后得到的数据）(a) 求 $Z$ 和 $W$ 的联合分布;(b) 证明 $Z$ 与 $W$ 独立.**例题 3.5:** 设 $X_1,\cdots,X_n$ 为 i.i.d. 服从双参数指数分布 $E(a,\theta)$ 的随机变量，其中 $a\in\mathcal{R}$ 且 $\theta>0.$ 证明最小次序统计量 $X_{(1)}$ 服从指数分布 $E(a,\theta/n),2\sum_{i=1}^{n}\left(X_i-X_{(1)}\right)/\theta$ 服从卡方分布 $\chi^2_{2n-2}.$」
- **结论**: 专题五后半的三道例题（伽玛/贝塔分解、指数分布竞争的 $\min$ 与指示变量独立性、双参数指数分布最小次序统计量的分布与 $\chi^2_{2n-2}$ 基线）。**可直接引用**；例题 3.5 的 $2\sum(X_i-X_{(1)})/\theta\sim\chi^2_{2n-2}$ 与茆诗松第五章「三大抽样分布」、附表 3 直接衔接。
- **置信度**: high
- **对照**: OCR 文本作 `设X 和Y 是一对独立的伽玛随机变量，参数分别为(r, 1) 和(s, 1) 证明Z1 = X + Y 与 Z2 = X/(X + Y ) 独立`——**此段 OCR 正确**；但 $\min\{X,Y\}$ 与 $W$ 的分段定义在 OCR 中只剩 `和Y 的值，但却可以观测Z 和W, 其中Z = min{X, Y }` 之后即中断（分段函数整体丢失），且例题 3.5 正文完全未出现在 chars=436 的窗口内；裁片给出完整三道题。以裁片为准。
- **转写不确定项**: 例题 3.5 中「$a\in\mathcal{R}$」的集合符号在裁片上为手写体 $\mathcal{R}$（实数集），照抄为 $\mathcal{R}$。

---

## R34 专题五第 7 页与第 6 页为**逐字节相同的重复页**（专题五 p7）

- **材料**: `参考文件/教材讲义/统计/专题五 随机变量函数的分布.pdf`
- **页码**: PDF 第 7 页（共 7 页，末页；页脚居中「6」——**注意页脚仍印 6**）
- **生成命令**:
```bash
参考文件/_venv/Scripts/python.exe tools/refs-vision.py --pdf "参考文件/教材讲义/统计/专题五 随机变量函数的分布.pdf" --page 7 --dpi 150 --out "backup/scratch/refs-vision/专题/z5_p7_full.png"
```
  （整页）
- **裁片**: `backup/scratch/refs-vision/专题/z5_p7_full.png`（1241 × 1754 px, 123750 B, sha256 `88073bd3c737e9159dade714eb6c25d4bf28837a564dceca1e1cc55a5a434106`）
- **亲读原文**: 与 R33 完全一致（例题 3.3／3.4／3.5 三道题同版面、同文字、同页脚「6」）。
- **结论**: **工具确定性承诺的实证**：p6 与 p7 两条独立命令产出的 PNG **字节数与 sha256 完全相同**（123750 B / `88073d…4106`），证明工具在「同 PDF + 不同 page 但内容相同」时同样给出可复现结果。同时这是一个**材料缺陷结论**：专题五.pdf 的第 7 页是第 6 页的重复渲染（内容页脚都写「6」），**结构索引里必须把专题五的后两页合并为一个内容区段，p7 不产生新知识点**；这也解释了 index.json 为何把专题五的第 6、7 页同时记为低产（两页 chars 均为 436，文本完全相同）。
- **置信度**: high（两条命令输出逐字节一致，非目测判断）
- **对照**: OCR 文本：p6 与 p7 的 `text` 字段**逐字相同**（`例题3.3: / 设X 和Y 是一对独立的伽玛随机变量…`），与裁片一致。
- **转写不确定项**: 无。

---

## R35 专题十四末页：单变量显著性检验（定义 2.6）与拟合优度/复相关系数（定义 2.7）（专题十四 线性回归 p13）

- **材料**: `参考文件/教材讲义/统计/专题十四 线性回归.pdf`
- **页码**: PDF 第 13 页（共 13 页，末页；页脚居中「13」）
- **生成命令**:
```bash
参考文件/_venv/Scripts/python.exe tools/refs-vision.py --pdf "参考文件/教材讲义/统计/专题十四 线性回归.pdf" --page 13 --dpi 150 --out "backup/scratch/refs-vision/专题/z14_p13_full.png"
```
  （整页）
- **裁片**: `backup/scratch/refs-vision/专题/z14_p13_full.png`（1241 × 1754 px, 105678 B, sha256 `7168b33ec222dd00d1b7e5030fefdbcc28b3406518d8f0de555a54c4a6638d32`）
- **亲读原文**: 「**定义 2.6: 单变量的显著性检验** 有时候我们只想研究单个变量是否与应变量显著相关, 即考虑假设检验问题: $H_0:\beta_k=c\ vs\ H_1:\beta_k\neq c$ **解** 由于 $\hat\beta\sim N\left(\beta,\sigma^2\left(X^TX\right)^{-1}\right)$ 于是 $\hat\beta_k\sim N\left(\beta_k,v_{kk}\sigma^2\right),$ 这里 $v_{kk}$ 是 $\left(X^TX\right)^{-1}$ 的主对角线上的第 $k$ 个元素.可构造检验统计量 $t=\dfrac{\hat\beta_k-c}{\hat\sigma\sqrt{v_{kk}}}\overset{H_0}{\sim}t\left(n-p\right)$ 其中 $\hat\sigma^2=\dfrac{SS_e}{n-p},$ 当 $|t|\geqslant t_{1-\frac{\alpha}{2}}\left(n-p\right)$ 时拒绝原假设.**定义 2.7: 拟合优度与复相关系数** 多元线性回归中依旧有拟合优度这个概念, 它的定义与一元线性回归中类似 $R^2=\dfrac{SS_R}{SS_T}$ 而其算数平方根称为复相关系数, 用于表示回归自变量对应变量的解释能力.」
- **结论**: **定义 2.6（单个回归系数的 $t$ 检验：$\hat\beta$ 的协方差阵为 $\sigma^2(X^TX)^{-1}$、$\hat\sigma^2=SS_e/(n-p)$、拒绝域 $|t|\geqslant t_{1-\alpha/2}(n-p)$）与定义 2.7（多元拟合优度 $R^2=SS_R/SS_T$、复相关系数）**。可直接引用；与计量讲义 R20（$\hat\beta=(X^\top X)^{-1}X^\top Y$）、R30（$T=(\hat\beta_j-1)/(\hat\sigma\sqrt{c_{jj}})$）三处互为正交叉核对。
- **置信度**: high
- **对照**: OCR 文本作 `定义2.6: 单变量的显著性检验`、`H0 : βk = c vs H1 : βk̸ = c`（`≠` 讹作 `̸`）、`ˆβ ∼N ( / β,σ2 ( / XT X / )−1)`、`t = / ˆβk −c / ˆσ√vkk / H0 / ∼`（$t(n-p)$ 之后的自由度被截断）、`R2 = SS_R/SS_T` 段落**完全未出现**（chars=358 截断）；裁片逐字可读。独立复核：$\hat\beta\sim N(\beta,\sigma^2(X^TX)^{-1})$ ⇒ 第 $k$ 个分量 $\hat\beta_k\sim N(\beta_k,v_{kk}\sigma^2)$ ✓。
- **转写不确定项**: 无。注意「$p$」为参数个数记号（与计量讲义用 $k+1$ 同类），**两套材料记号不同但含义一致**。

---

## R36 封面（茆诗松 p1）

- **材料**: `参考文件/教材讲义/统计/茆诗松+概率论与数理统计教程 第三版.pdf`
- **页码**: PDF 第 1 页（封面，无印刷页码）
- **生成命令**:
```bash
参考文件/_venv/Scripts/python.exe tools/refs-vision.py --pdf "参考文件/教材讲义/统计/茆诗松+概率论与数理统计教程 第三版.pdf" --page 1 --dpi 150 --out "backup/scratch/refs-vision/茆诗松/p1_full.png"
```
  （整页）
- **裁片**: `backup/scratch/refs-vision/茆诗松/p1_full.png`（1093 × 1536 px, 1766314 B, sha256 `af4f7e8307c0a102d2eb1142ad45b0905ab72c20ea7c99ea342d62d8ef3b8eea`）
- **亲读原文**: 「“十二五”普通高等教育本科国家级规划教材 **概率论与数理统计教程 第三版** 茆诗松 程依明 濮晓龙 编著 高等教育出版社」（深绿几何网格底纹 + 橙色横条）
- **结论**: 材料身份确认：**茆诗松、程依明、濮晓龙编著《概率论与数理统计教程》第三版，高等教育出版社**。这是本族主材料的版本锚点（第三版 = 2018 修订版，见 R40）。
- **置信度**: high
- **对照**: OCR 文本（chars=0，`_pages` 中 p1 记为低产页）──**裁片是唯一证据**，OCR 完全未产出文字。
- **转写不确定项**: 无。

---

## R37 封底：ISBN 与定价（茆诗松 p2）

- **材料**: `参考文件/教材讲义/统计/茆诗松+概率论与数理统计教程 第三版.pdf`
- **页码**: PDF 第 2 页（封底；**不是版权页**）
- **生成命令**:
```bash
参考文件/_venv/Scripts/python.exe tools/refs-vision.py --pdf "参考文件/教材讲义/统计/茆诗松+概率论与数理统计教程 第三版.pdf" --page 2 --dpi 150 --out "backup/scratch/refs-vision/茆诗松/p2_full.png"
```
  （整页）
- **裁片**: `backup/scratch/refs-vision/茆诗松/p2_full.png`（1093 × 1536 px, 1565471 B, sha256 `f0c6cf9f297758591bcfbd1c4bbf9e716b82abb275f7f87078f165eab85709d8`）
- **亲读原文**: 「**数字课程网站** 网址：`http://abook.hep.com.cn/1225539`　`http://abook.hep.edu.cn/1225539` 数字课程账号 使用说明详见书内数字课程说明页」；右侧条码框内「**ISBN 978-7-04-051148-2**　`9 787040 511482 >`　**定价 59.00 元**」
- **结论**: 材料身份的第二个锚点：**ISBN 978-7-04-051148-2，定价 59.00 元，高等教育出版社数字课程编号 1225539**。**结构索引里 PDF p2 应标注为「封底」而非「版权页」**（版权页另在 p6/p7 附近，本族未裁定）。
- **置信度**: high
- **对照**: OCR 文本（chars=0）──裁片是唯一证据。
- **转写不确定项**: 无。

---

## R38 题献页（茆诗松 p3）

- **材料**: `参考文件/教材讲义/统计/茆诗松+概率论与数理统计教程 第三版.pdf`
- **页码**: PDF 第 3 页（题献页）
- **生成命令**:
```bash
参考文件/_venv/Scripts/python.exe tools/refs-vision.py --pdf "参考文件/教材讲义/统计/茆诗松+概率论与数理统计教程 第三版.pdf" --page 3 --dpi 150 --out "backup/scratch/refs-vision/茆诗松/p3_full.png"
```
  （整页）
- **裁片**: `backup/scratch/refs-vision/茆诗松/p3_full.png`（1042 × 1640 px, 31126 B, sha256 `b87a7ff7f20a0a582774c20aa75efe65df2d37e13d70464a7b0a7aa4c613c6e5`）
- **亲读原文**: 「**谨以此书纪念魏宗舒教授**」（单行居中，其余整页空白）
- **结论**: PDF p3 是**题献页**，唯一内容为对魏宗舒教授的纪念题献。属非知识点页，结构索引标为 `chapter="前置·题献"`、`topic="题献"`、`concepts=[]`、`formulas=[]`。
- **置信度**: high
- **对照**: OCR 文本（chars=0）──裁片是唯一证据。
- **转写不确定项**: 无。

---

## R39 内封（书名页）（茆诗松 p5）

- **材料**: `参考文件/教材讲义/统计/茆诗松+概率论与数理统计教程 第三版.pdf`
- **页码**: PDF 第 5 页（内封）
- **生成命令**:
```bash
参考文件/_venv/Scripts/python.exe tools/refs-vision.py --pdf "参考文件/教材讲义/统计/茆诗松+概率论与数理统计教程 第三版.pdf" --page 5 --dpi 150 --out "backup/scratch/refs-vision/茆诗松/p5_full.png"
```
  （整页）
- **裁片**: `backup/scratch/refs-vision/茆诗松/p5_full.png`（1056 × 1640 px, 492161 B, sha256 `dcf9c2ba63964358cde22bf37f8b42064a134740af9170c556bdd05d88ad5dc4`）
- **亲读原文**: 「“十二五”普通高等教育本科国家级规划教材 **概率论与数理统计教程 第三版** 茆诗松 程依明 濮晓龙 编著 **高等教育出版社·北京**」
- **结论**: PDF p5 为**内封（书名页）**，与封面（R36）信息一致，出版地标注「北京」。用于结构索引前置区的版式定位。
- **置信度**: high
- **对照**: OCR 文本（chars=0）──裁片是唯一证据。
- **转写不确定项**: 无。

---

## R40 第三版前言（成书与修订分工）（茆诗松 p9）

- **材料**: `参考文件/教材讲义/统计/茆诗松+概率论与数理统计教程 第三版.pdf`
- **页码**: PDF 第 9 页（「第三版前言」第 1 页）
- **生成命令**:
```bash
参考文件/_venv/Scripts/python.exe tools/refs-vision.py --pdf "参考文件/教材讲义/统计/茆诗松+概率论与数理统计教程 第三版.pdf" --page 9 --dpi 150 --out "backup/scratch/refs-vision/茆诗松/p9_full.png"
```
  （整页）
- **裁片**: `backup/scratch/refs-vision/茆诗松/p9_full.png`（1056 × 1646 px, 160696 B, sha256 `b509937c331945ac45e5d5e82752b4d716744ff51a09ea90d34d09ea827431aa`）
- **亲读原文**: 「**第三版前言** 本书是概率论与数理统计的入门书，在选材和编写上尽量使之适合初学者阅读和教师讲解。本版仍保留前两版的特色，修改的重点放在概念和结论的叙述、解释及应用上，对一些过时的叙述和例题（包括习题）做了适当的更新和修改。本书前四章由程依明负责修改，后四章由濮晓龙负责修改，全书由茆诗松统稿。修改中听取了不少同行的意见，复旦大学徐勤丰老师提了不少好的建议，我们对此特别感谢。还望广大教师和学生不断提出意见，使本书不断改进，更好地为教学服务。**茆诗松、程依明、濮晓龙 2018 年 6 月**」
- **结论**: **版本与修订分工的权威陈述**：本书为**入门书**定位（对 2.2.0 的取材口径有直接影响：教材覆盖到的是本科一年级—二年级水平）；**前四章（概率论：随机事件与概率／随机变量及其分布／多维随机变量／大数定律与中心极限定理）由程依明修订，后四章（数理统计：统计量及其分布／参数估计／假设检验／方差分析与回归分析）由濮晓龙修订**；前言签署日期 **2018 年 6 月**。
- **置信度**: high
- **对照**: OCR 文本（chars=0，p9 为低产页）──裁片是唯一证据。独立复核：与 R36/R37 的「第三版 / ISBN 978-7-04-051148-2 / 2018」链条自洽 ✓。
- **转写不确定项**: 无。

---

## R41 习题参考答案：习题 2.1（茆诗松 p472）

- **材料**: `参考文件/教材讲义/统计/茆诗松+概率论与数理统计教程 第三版.pdf`
- **页码**: PDF 第 472 页（印刷第 **450** 页，页脚「450」；页眉「❙❙❙ 习题参考答案」）
- **生成命令**:
```bash
参考文件/_venv/Scripts/python.exe tools/refs-vision.py --pdf "参考文件/教材讲义/统计/茆诗松+概率论与数理统计教程 第三版.pdf" --page 472 --dpi 150 --out "backup/scratch/refs-vision/茆诗松/p472_full.png"
```
  （整页）
- **裁片**: `backup/scratch/refs-vision/茆诗松/p472_full.png`（1060 × 1636 px, 176909 B, sha256 `7110407b3ebe9b6e41fffd3392d76d1f30b1b94f806ebdfb9776c956e4e81003`）
- **亲读原文**: 「本的 $\dfrac{b}{2^{n+m-1}}.$　22. 0.668　2.　23—25. 略. **习 题 2.1** 1.(1) $\begin{array}{c|ccc}X&3&4&5\\\hline P&0.1&0.3&0.6\end{array}$;(2) $F(x)=\begin{cases}0,&x<3,\\0.1,&3\leqslant x<4,\\0.4,&4\leqslant x<5,\\1,&5\leqslant x.\end{cases}$ 2.(1) $X$ 取 $1,\cdots,6$，$P=\frac{11}{36},\frac{9}{36},\frac{7}{36},\frac{5}{36},\frac{3}{36},\frac{1}{36}$;(2) $Y$ 取 $0,\cdots,5$，$P=\frac{3}{18},\frac{5}{18},\frac{4}{18},\frac{3}{18},\frac{2}{18},\frac{1}{18}.$ 3.(1) $P=\frac{7}{10},\frac{7}{30},\frac{7}{120},\frac{1}{120}$;(2) $P=\frac{7}{10},\frac{6}{25},\frac{27}{500},\frac{3}{500}.$ 4.(1) $P=\frac{5}{30},\frac{15}{30},\frac{9}{30},\frac{1}{30}$;(2) $\frac{1}{3}.$ 5. $P=0.4823,0.3858,0.1157,0.0154,0.0008.$ 6. $P(X=k)=\dfrac{\binom{39}{5-k}\binom{13}{k}}{\binom{52}{5}},\ k=0,1,2,3,4,5.$ 7.(1) $P(X=k)=\dfrac{\mathrm{C}_{90}^{5-k}\mathrm{C}_{10}^{k}}{\mathrm{C}_{100}^{5}},k=0,1,2,3,4,5$;(2) 0.4162. 8. $P=\frac{1}{4},\frac{1}{12},\frac{1}{6},\frac{1}{2}$；$\frac{1}{3},\frac{1}{2},\frac{2}{3},\frac{3}{4}.$ 9. $\ln2,1,\ln1.25.$」
- **结论**: **习题 2.1 全部 9 题官方答案**（分布列、分布函数分段、超几何/组合概率）。**这是「第二章-随机变量及其分布」题目答案的权威出处**：2.1 答案在印刷 450 页 = PDF 472。与结构索引「习题答案区 p468/469–487」对齐，并实证了**印刷页 = PDF 物理页 − 22**（472−22=450，与页脚完全一致）。
- **置信度**: high
- **对照**: OCR 文本（chars<450，低产页）──数字表格与分式在 OCR 中全部塌坏，裁片逐字可读。独立复核：2.(1) 六项和 $\frac{11+9+7+5+3+1}{36}=1$ ✓；4.(1) $\frac{5+15+9+1}{30}=1$ ✓；5. 五项和 $=0.4823+0.3858+0.1157+0.0154+0.0008=1.0000$ ✓。
- **转写不确定项**: 第 7 题在裁片上为 $\mathrm{C}_{90}^{5-k}\mathrm{C}_{10}^{k}/\mathrm{C}_{100}^{5}$（组合数记号用 C，与第 6 题的括号记号混用），照原样抄录。

---

## R42 习题参考答案：习题 6.1／6.2／6.3（茆诗松 p482）

- **材料**: `参考文件/教材讲义/统计/茆诗松+概率论与数理统计教程 第三版.pdf`
- **页码**: PDF 第 482 页（印刷第 **460** 页，页脚「460」）
- **生成命令**:
```bash
参考文件/_venv/Scripts/python.exe tools/refs-vision.py --pdf "参考文件/教材讲义/统计/茆诗松+概率论与数理统计教程 第三版.pdf" --page 482 --dpi 150 --out "backup/scratch/refs-vision/茆诗松/p482_full.png"
```
  （整页）
- **裁片**: `backup/scratch/refs-vision/茆诗松/p482_full.png`（1058 × 1631 px, 189687 B, sha256 `8fa9d2329c8072b960b372270afa9de6005d012a70125e7163ada3580605ca89`）
- **亲读原文**: 「**习 题 6.1** 1. $\hat\mu_3$ 有效性最差. 2. 不是. 3. 略. 4. $\dfrac{1}{2(n-1)}.$ 5. $\dfrac{1}{2}(x_{(1)}+x_{(n)})$ 较有效. 6. $\dfrac{4}{3}x_{(3)}$ 较有效. 7. $a=\dfrac{n_1}{n_1+n_2},b=\dfrac{n_2}{n_1+n_2}.$ 8. 略. 9. $a_i=\dfrac{1}{\sigma_i^2}\Big/\sum_{j=1}^{n}\dfrac{1}{\sigma_j^2},i=1,2,\cdots,n.$ 10. 略. 11. $C_1=\sqrt{\dfrac{n\pi}{2(n-1)}},C_2=\dfrac{\sqrt{\pi}}{2}.$ **习 题 6.2** 1. 114　3.75, 96.056 2. 2. 2.68. 3.(1) $2\bar x$;(2) $\dfrac{2}{\bar x}.$ 4.(1) $3\bar x$;(2) $\dfrac{1-2\bar x}{\bar x-1}$;(3) $\left(\dfrac{\bar x}{1-\bar x}\right)^2$;(4) $\hat\theta=s,\hat\mu=\bar x-s.$ 5. $u_{k/n}.$ 6.(1) $\dfrac{ab}{c}$;(2) $\dfrac{ab}{c}-a-b+c.$ 7. $\hat m=\left[\dfrac{\bar x^2}{\bar x-s_n^2}\right],\hat p=1-\dfrac{s_n^2}{\bar x}.$ **习 题 6.3** 1.(1) $\left(\dfrac{1}{n}\sum_{i=1}^{n}\ln x_i\right)^{-2}$;(2) $\left(\dfrac{1}{n}\sum_{i=1}^{n}\ln x_i-\ln c\right)^{-1}.$ 2.(1) $x_{(1)}$;(2) $\hat\mu=x_{(1)},\hat\theta=\bar x-x_{(1)}$;(3) $\dfrac{x_{(n)}}{k+1}.$ 3.(1) $\dfrac{1}{n}\sum_{i=1}^{n}|x_i|$;(2) 可取 $\left(x_{(n)}-\dfrac{1}{2},x_{(1)}+\dfrac{1}{2}\right)$ 中的任意值;(3) $\hat\theta_1=x_{(1)},\hat\theta_2=x_{(n)}.$ 4. 0.499. 5. $\dfrac{2(\bar x-1)}{\bar x}.$ 6. 28.305 3. 7.(1) 略;(2) 不是无偏估计，是相合估计. 8.(1) 是相合估计，不是无偏估计;(2) 是相合估计，是无偏估计. 9. 15 000. 10. 略.」
- **结论**: **第六章（参数估计）习题 6.1（估计量的优劣/有效性/一致最小方差）、6.2（矩估计）、6.3（极大似然估计与无偏性/相合性）全部官方答案**。这是「参数估计」知识点在教材侧的可引用答案源（印刷 460 页 = PDF 482）。
- **置信度**: high
- **对照**: OCR 文本（chars<450，低产页）──全部公式在 OCR 中塌坏；裁片逐字可读。独立复核：6.1 第 9 题 $a_i=\frac{1/\sigma_i^2}{\sum_j1/\sigma_j^2}$ 是**最优加权（逆方差加权）**，求和为 1 ✓；6.3 第 2(3) 题 $x_{(n)}/(k+1)$ 与均匀分布 $U(0,\theta)$ 的 MLE 结构一致（此处参数为 $k$ 的指数族）✓。
- **转写不确定项**: 第 7 题 $\hat m=\left[\dfrac{\bar x^2}{\bar x-s_n^2}\right]$ 的方括号在裁片上为向下取整/取整记号，照原样抄录为方括号。

---

## R43 习题参考答案：习题 8.1／8.2／8.3／8.4（方差分析表）（茆诗松 p486）

- **材料**: `参考文件/教材讲义/统计/茆诗松+概率论与数理统计教程 第三版.pdf`
- **页码**: PDF 第 486 页（印刷第 **464** 页，页脚「464」）
- **生成命令**:
```bash
参考文件/_venv/Scripts/python.exe tools/refs-vision.py --pdf "参考文件/教材讲义/统计/茆诗松+概率论与数理统计教程 第三版.pdf" --page 486 --dpi 150 --out "backup/scratch/refs-vision/茆诗松/p486_full.png"
```
  （整页）
- **裁片**: `backup/scratch/refs-vision/茆诗松/p486_full.png`（1058 × 1647 px, 229932 B, sha256 `de8cce85b0b2038eb1d5d08c93a35385e3c2929b77af0b27b04b10706a09af6e`）
- **亲读原文**: 「4.（方差分析表）来源｜平方和｜自由度｜均方和｜$F$ 比 → 因子 $A$｜4.2｜2｜2.1｜7.5；误差 $e$｜2.5｜9｜0.28；和 $T$｜6.7｜11。显著. 5. 显著. 6. 显著. 7.(1) 有显著影响;(2) $[7.173,8.787],[5.593,7.207],[8.313,9.927].$ 8.(1) 显著;(2) 第五组，$[25.6711,30.3003].$ **习 题 8.2** 1. 水平 1、3 之间无显著差异，它们与水平 2 有显著差异. 2. 水平 5 与水平 1,3,4 之间以及水平 2 与水平 4 之间有显著差异，其他无显著差异. 3.(1) 不显著;(2) $[6.3232,6.9910].$ 4.（方差分析表）因子 $A$｜20.125｜2｜10.063｜15.72；误差 $e$｜15.362｜24｜0.640；和 $T$｜35.487｜26。显著，各个水平间均有显著差异. **习 题 8.3** 1. 接受. 2. 接受. 3. 接受. 4. 接受. 5. 接受. 6. 接受. **习 题 8.4** 1.(1) $\hat\beta=\dfrac{\sum_{i=1}^{n}x_iy_i}{\sum_{i=1}^{n}x_i^2},\hat\sigma^2=\dfrac{1}{n-1}\sum_{i=1}^{n}(y_i-\hat\beta x_i)^2$;(2) $\dfrac{x_0^2\sigma^2}{\sum_{i=1}^{n}x_i^2}.$」
- **结论**: **第八章（方差分析与回归分析）习题 8.1–8.4 官方答案**，含**两张完整方差分析表**（含平方和/自由度/均方和/$F$ 比四列数值）与**多重比较的置信区间数值**。可直接引用为「方差分析表怎么列」「多重比较怎么报」的样例；一元回归（过原点）的 $\hat\beta,\hat\sigma^2$ 与预测方差 $x_0^2\sigma^2/\sum x_i^2$ 也在本页。
- **置信度**: high
- **对照**: OCR 文本（chars<450，低产页）──两张表在 OCR 中全部塌坏；裁片逐字可读。独立复核：第一张表 $F=2.1/0.28=7.5$ ✓，自由度 $2+9=11$ ✓，平方和 $4.2+2.5=6.7$ ✓；第二张表 $F=10.063/0.640=15.72$ ✓，$20.125+15.362=35.487$ ✓，$2+24=26$ ✓。**三处闭合，证明裁片数值可靠**。
- **转写不确定项**: 无。

---

## R44 附表区的版式事实：附表 1 泊松分布函数，横向（旋转）排版、标题竖排在页左（茆诗松 p442）

- **材料**: `参考文件/教材讲义/统计/茆诗松+概率论与数理统计教程 第三版.pdf`
- **页码**: PDF 第 442 页（印刷第 **420** 页，页脚「420」；附表区首页）
- **生成命令**（三段裁片，用于定位标题所在方位）:
```bash
参考文件/_venv/Scripts/python.exe tools/refs-vision.py --pdf "参考文件/教材讲义/统计/茆诗松+概率论与数理统计教程 第三版.pdf" --page 442 --dpi 150 --box 40,40,556,300 --out "backup/scratch/refs-vision/茆诗松/p442_band.png"
参考文件/_venv/Scripts/python.exe tools/refs-vision.py --pdf "参考文件/教材讲义/统计/茆诗松+概率论与数理统计教程 第三版.pdf" --page 442 --dpi 150 --box 20,0,506.88,150 --out "backup/scratch/refs-vision/茆诗松/p442_head.png"
参考文件/_venv/Scripts/python.exe tools/refs-vision.py --pdf "参考文件/教材讲义/统计/茆诗松+概率论与数理统计教程 第三版.pdf" --page 442 --dpi 150 --box 20,600,506.88,785 --out "backup/scratch/refs-vision/茆诗松/p442_tail.png"
```
- **裁片**:
  - `backup/scratch/refs-vision/茆诗松/p442_band.png`（973 × 542 px, 200790 B, sha256 `753f5919bbd53cf6085f5a32e98c255550c4be5972882cbdedfd30f633fac1bf`）
  - `backup/scratch/refs-vision/茆诗松/p442_head.png`（1014 × 312 px, 52906 B, sha256 `6679478a865610931f639bc2a83d0761f2ad7ae85549f553244d6c97caf571c3`）
  - `backup/scratch/refs-vision/茆诗松/p442_tail.png`（1014 × 385 px, 116499 B, sha256 `40a0e8c5538c1b8f4beb626c589eb65c21a9fdf34a942d63f7013bdc77ad4de4`）
- **亲读原文**: **页面左缘竖排（自下向上）**「**表 1 泊松分布函数**」；表体为横向表头「$\lambda$｜$0$｜$1$｜$2$｜…」，行首 $\lambda=0.1,0.2,0.3,0.4,0.5,0.6,0.7,0.8,0.9,1.0,1.1,1.2,1.3,1.4,1.5,1.6,1.7,1.8,1.9,2.0$，数值如 $\lambda=0.1$ 行 $0.905\;0.995\;1.000$、$\lambda=0.5$ 行 $0.607\;0.910\;0.986$、$\lambda=1.0$ 行 $0.368\;0.736\;0.920$、$\lambda=2.0$ 行 $0.135\;0.406\;0.677$。
- **结论**: **附表区的关键版式结论**：附表不是常见的「表名在页顶」，而是**整页横向排版、表名竖排在页左缘、表体自左向右为 $\lambda$ 与 $k=0,1,2,\dots$，数值为 $\sum_{i\le k}p(i;\lambda)$（累计）**。因此 ①`--box` 取「页顶横带」在本区**取不到表名**（本页 y=0–300 pt 的横带内没有任何表名，见 p442_band/p442_head 裁片）；②要以「命令 + 裁片」取证附表编号，必须裁**左缘竖带**或整页；③这解释了 OCR 为何在本区产出 `傲电8794562個3個…` 一类纯噪声（竖排标题 + 密集数字表）。
- **置信度**: high
- **对照**: OCR 文本作 `傲电8794562個3個2個m000000000000000电19999000000091%010000000099998869o要990000o00000900电000电0。`（chars=190）──**纯噪声，无任何可用字符**；裁片给出真实结构。独立复核：$\lambda=1$ 泊松分布 $P(X\le0)=e^{-1}=0.368$、$P(X\le1)=e^{-1}(1+1)=0.736$、$P(X\le2)=0.920$ —— 与裁片数值**逐位一致** ✓。
- **转写不确定项**: 表名在裁片上是「表 1」（阿拉伯数字 1，非罗马数字「I」）——OCR 作 `附表I`，**以裁片为准**。