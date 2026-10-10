# 数学三真题族读图裁定（2010–2022 真题册 / 2020–2022 解析册）

本文件按 `docs/refs/README.md` §3 的七字段格式记录逐条读图裁定：**材料｜页码｜生成命令｜裁片路径+sha256｜亲读原文（≥20 字）｜结论｜置信度**。
- 主通道＝DeepSeek Harness 自带 `read_image`（禁用 modlens，理由见 `docs/refs/README.md` §1）；裁片由 `tools/refs-vision.py` 生成，落 `backup/scratch/refs-math3/img/`（`backup/` 被 `.gitignore:19` 忽略，不入库；凭命令 + sha256 可重建）。
- 页码一律为 **PDF 物理页（1 基）**；解析册另有印刷页码，写作「PDF pN（印刷页 M）」。
- 命令约定：`参考文件/_venv/Scripts/python.exe tools/refs-vision.py --pdf "<PDF>" --page <1基> --dpi 150 [--box x0,y0,x1,y1（PDF 点，原点左上，y 向下）] --out "<裁片>"`；150 dpi 下 `点 = 像素 × 0.48`。
- 示例裁定（t1 交付）不在本文件重复，见 `docs/refs/README.md` §4（2025 数学三第 1 题）。
- 材料 A＝`参考文件/真题/数学/5、【1987-2025年】考研数学三真题/3、2010-2022考研数学三真题.pdf`（52 页，504.6×725.7 pt/页）。
- 材料 B＝`参考文件/真题/数学/6、【1987-2025年】考研数学三真题答案及解析/2022年数学三真题答案解析.pdf`（26 页，503.4×724.6 pt/页；PDF p1 = 印刷页 5，PDF p15 = 印刷页 19）。
- 材料 C＝`参考文件/真题/数学/6、【1987-2025年】考研数学三真题答案及解析/2021年数学三真题答案解析.pdf`（9 页）。
- 材料 D＝`参考文件/真题/数学/6、【1987-2025年】考研数学三真题答案及解析/2020年数学三真题答案解析.pdf`（7 页）。

## 一、2022 年（真题册 PDF p2–p5；解析册 26 页）

### M3-2022-R01
- **材料**：A（2022 年试题，PDF p2）
- **生成命令**：`参考文件/_venv/Scripts/python.exe tools/refs-vision.py --pdf "参考文件/真题/数学/5、【1987-2025年】考研数学三真题/3、2010-2022考研数学三真题.pdf" --page 2 --dpi 150 --out "backup/scratch/refs-math3/img/zt2022_p2.png"`
- **裁片**：`backup/scratch/refs-math3/img/zt2022_p2.png`（1052×1512 px / 241266 B / sha256 `bcb2b76f15e2a800fd075d5fa7cf0b449e8d7ca99fb733b446a86b4968484b06`）
- **亲读原文**：「（1）若当 $x\to0$ 时, $\alpha(x),\beta(x)$ 是非零无穷小量, 则以下的命题中, ① 若 $\alpha(x)\sim\beta(x)$, 则 $\alpha^{2}(x)\sim\beta^{2}(x)$; ② 若 $\alpha^{2}(x)\sim\beta^{2}(x)$, 则 $\alpha(x)\sim\beta(x)$; ③ 若 $\alpha(x)\sim\beta(x)$, 则 $\alpha(x)-\beta(x)=o(\alpha(x))$; ④ 若 $\alpha(x)-\beta(x)=o(\alpha(x))$, 则 $\alpha(x)\sim\beta(x)$, 真命题的序号为（ ）(A)①③. (B)①④. (C)①③④. (D)②③④.」
- **结论**：2022 一(1)–(6) 题面与四选项逐字确认：①～④ 四命题、$\{a_n\}$ 最值题（$a_n=\sqrt[n]{n}-\frac{(-1)^n}{n}$，四选项「有/没有最大值、有/没有最小值」）、$F(x,y)=\int_0^{x-y}(x-y-t)f(t)\mathrm{d}t$ 的二阶偏导比较（四选项为 $\partial F/\partial x=\pm\partial F/\partial y$、$\partial^2F/\partial x^2=\pm\partial^2F/\partial y^2$ 四种组合）、三积分 $I_1,I_2,I_3$ 大小比较、$A=\mathrm{diag}(1,-1,0)$ 特征值为 $1,-1,0$ 的充要条件（四选项：$A=PAQ$／$A=PAP^{-1}$／$A=QAQ^{-1}$／$A=PAP^{\mathrm{T}}$）、$A=\begin{pmatrix}1&1&1\\1&a&a^2\\1&b&b^2\end{pmatrix},\ \boldsymbol b=(1,2,4)^{\mathrm T}$ 的方程组解情况。
- **置信度**：high

### M3-2022-R02
- **材料**：A（2022 年试题，PDF p3）
- **生成命令**：`…refs-vision.py --pdf "参考文件/真题/数学/5、【1987-2025年】考研数学三真题/3、2010-2022考研数学三真题.pdf" --page 3 --dpi 150 --out "backup/scratch/refs-math3/img/zt2022_p3.png"`
- **裁片**：`backup/scratch/refs-math3/img/zt2022_p3.png`（1052×1512 px / 201819 B / sha256 `46fb084a84e4caf1b2d6ba13512f135f3c46f2a7570781dcf0d4cc3f7f3bfb5a`）
- **亲读原文**：「（7）设 $\boldsymbol\alpha_1=(\lambda,1,1)^{\mathrm T},\boldsymbol\alpha_2=(1,\lambda,1)^{\mathrm T},\boldsymbol\alpha_3=(1,1,\lambda)^{\mathrm T},\boldsymbol\alpha_4=(1,\lambda,\lambda^{2})^{\mathrm T}$, 若 $\boldsymbol\alpha_1,\boldsymbol\alpha_2,\boldsymbol\alpha_3$ 与 $\boldsymbol\alpha_1,\boldsymbol\alpha_2,\boldsymbol\alpha_4$ 等价, 则 $\lambda$ 的取值范围是（ ）(A)$\{0,1\}$. (B)$\{\lambda\mid\lambda\in\mathbf R,\lambda\ne-2\}$. (C)$\{\lambda\mid\lambda\in\mathbf R,\lambda\ne-1,\lambda\ne-2\}$. (D)$\{\lambda\mid\lambda\in\mathbf R,\lambda\ne-1\}$.」
- **结论**：2022 一(7)–(10) 与二(11)–(16) 全部题面确认：$X\sim N(0,4),Y\sim B(3,\frac13)$ 不相关求 $D(X-3Y+1)$；$X_1$ 的密度 $f(x)=1-|x|\ (|x|<1)$ 求 $\frac1n\sum X_i^2$ 依概率收敛值；二维 $X{-}Y$ 表（$X=-1$ 行 $0.1,0.1,b$；$X=1$ 行 $a,0.1,0.1$）与 $\{\max=2\},\{\min=1\}$ 独立求 $\mathrm{Cov}(X,Y)$；填空 (11)–(16) 依次为 $\lim_{x\to0}\big(\frac{1+\mathrm e^x}{2}\big)^{\cot x}$、$\int_0^2\frac{2x-4}{x^2+2x+4}\mathrm dx$、$f(x)=\mathrm e^{\sin x}+\mathrm e^{-\sin x}$ 求 $f'''(2\pi)$、分段 $f(x)=\mathrm e^x\ (0\le x\le1)$ 的二重积分、交换第 2/3 行并把第 2 列的 $-1$ 倍加到第 1 列后得的矩阵求 $\mathrm{tr}(A^{-1})$、三事件条件概率 $P(B\cup C\mid A\cup B\cup C)$。
- **置信度**：high

### M3-2022-R03
- **材料**：A（2022 年试题，PDF p3，仅 (13) 行局部放大）
- **生成命令**：`…refs-vision.py --pdf "参考文件/真题/数学/5、【1987-2025年】考研数学三真题/3、2010-2022考研数学三真题.pdf" --page 3 --dpi 150 --box 25,438,490,488 --out "backup/scratch/refs-math3/img/zt2022_p3_q13.png"`
- **裁片**：`backup/scratch/refs-math3/img/zt2022_p3_q13.png`（969×104 px / 20377 B / sha256 `78146136401fc800e34ac84ed78842c7731415fde61a2a8dae82ac3160e70f17`）
- **亲读原文**：「（13）已知函数 $f(x)=\mathrm e^{\sin x}+\mathrm e^{-\sin x}$, 则 $f'''(2\pi)=$ ______ ．（14）已知函数 $f(x)=\begin{cases}\mathrm e^x,&0\le x\le1,\\0,&其他,\end{cases}$ 则 $\int_{-\infty}^{+\infty}\mathrm dx\int_{-\infty}^{+\infty}f(x)f(y-x)\mathrm dy=$ ______ ．」
- **结论**：(13) 的导数阶数是**三重撇 $f'''(2\pi)$**（不是两重撇），局部放大后逐字确认；该题答案 0 的前提即「偶函数 → 三阶导为奇函数」（见 M3-2022-R18）。
- **置信度**：high

### M3-2022-R04
- **材料**：A（2022 年试题，PDF p4）
- **生成命令**：`…refs-vision.py --pdf "…/3、2010-2022考研数学三真题.pdf" --page 4 --dpi 150 --out "backup/scratch/refs-math3/img/zt2022_p4.png"`
- **裁片**：`backup/scratch/refs-math3/img/zt2022_p4.png`（1052×1512 px / 105801 B / sha256 `40548bf8d83801ba79e595f1d86cc5c1022ad48d49857d7e008469052c30cceb`）
- **亲读原文**：「（17）（本题满分 10 分）设函数 $y(x)$ 是微分方程 $y'+\frac{1}{2\sqrt x}y=2+\sqrt x$ 的满足条件 $y(1)=3$ 的解, 求曲线 $y=y(x)$ 的渐近线.」「（18）（本题满分 12 分）设某产品的产量 $Q$ 由资本投入量 $x$ 和劳动投入量 $y$ 决定, 生产函数 $Q=12x^{\frac12}y^{\frac16}$, 该产品的销售单价 $P$ 与产量 $Q$ 的关系为 $P=1160-1.5Q$. 若单位资本投入和单位劳动投入的价格分别为 6 和 8, 求利润最大时的产量.」「（19）（本题满分 12 分）已知平面区域 $D=\{(x,y)\mid y-2\le x\le\sqrt{4-y^2},0\le y\le2\}$, 计算 $I=\iint_D\frac{(x-y)^2}{x^2+y^2}\mathrm dx\mathrm dy$.」
- **结论**：2022 三(17)(18)(19) 题面逐字确认（含函数 $Q=12x^{1/2}y^{1/6}$、$P=1160-1.5Q$、单价 6 与 8、区域 $y-2\le x\le\sqrt{4-y^2},0\le y\le2$）。
- **置信度**：high

### M3-2022-R05
- **材料**：A（2022 年试题，PDF p5）
- **生成命令**：`…refs-vision.py --pdf "…/3、2010-2022考研数学三真题.pdf" --page 5 --dpi 150 --out "backup/scratch/refs-math3/img/zt2022_p5.png"`
- **裁片**：`backup/scratch/refs-math3/img/zt2022_p5.png`（1052×1512 px / 96093 B / sha256 `0af3fc0924a337a8a5c1fd4010c3d5445c836fa31393fba2b04d099371f72b2f`）
- **亲读原文**：「（20）（本题满分 12 分）求幂级数 $\sum_{n=0}^{\infty}\frac{(-4)^n+1}{4^n(2n+1)}x^{2n}$ 的收敛域及和函数 $S(x)$.」「（22）（本题满分 12 分）设 $X_1,X_2,\cdots,X_n$ 为来自均值为 $\theta$ 的指数分布总体的简单随机样本, $Y_1,Y_2,\cdots,Y_m$ 为来自均值为 $2\theta$ 的指数分布总体的简单随机样本, 且两样本相互独立, 其中 $\theta(\theta>0)$ 是未知参数. 利用样本 $X_1,\cdots,X_n,Y_1,\cdots,Y_m$, 求 $\theta$ 的最大似然估计量 $\hat\theta$, 并求 $D(\hat\theta)$.」
- **结论**：2022 三(20)(21)(22) 题面逐字确认：幂级数系数 $[(-4)^n+1]/[4^n(2n+1)]$；(21) $f=3x_1^2+4x_2^2+3x_3^2+2x_1x_3$ 求正交矩阵 $Q$ 化标准形、并证 $\min_{x\ne0}\frac{f(x)}{x^{\mathrm T}x}=2$；(22) 两指数总体（均值 $\theta$ 与 $2\theta$）求 MLE 与方差。
- **置信度**：high

### M3-2022-R06
- **材料**：B（2022 年解析，PDF p1）
- **生成命令**：`…refs-vision.py --pdf "参考文件/真题/数学/6、【1987-2025年】考研数学三真题答案及解析/2022年数学三真题答案解析.pdf" --page 1 --dpi 150 --out "backup/scratch/refs-math3/img/jx2022_p1.png"`
- **裁片**：`backup/scratch/refs-math3/img/jx2022_p1.png`（1049×1510 px / 797274 B / sha256 `ffc432ba5cd2f375913176ffacfc21b758a24c804a28d34d1f8f383b22e3e8e0`）
- **亲读原文**：「**答案** C.」「**分析** 本题主要考查无穷小量的概念.」「命题 ② 不是真命题. 由 $\alpha^2(x)\sim\beta^2(x)$ 并不能得到 $\alpha(x)\sim\beta(x)$. 考虑 $\beta(x)=-\alpha(x)$, 则 $\lim_{x\to0}\frac{\alpha^2(x)}{\beta^2(x)}=\lim_{x\to0}\frac{\alpha^2(x)}{\alpha^2(x)}=1$」
- **结论**：2022 一(1) 【答案】C（与 OCR `答案C.` 一致）；解析给出反例 $\beta=-\alpha$ 证明命题 ② 不真、命题 ①③④ 为真。
- **置信度**：high

### M3-2022-R07
- **材料**：B（2022 年解析，PDF p2 上部）
- **生成命令**：`…refs-vision.py --pdf "…/2022年数学三真题答案解析.pdf" --page 2 --dpi 150 --box 20,130,490,330 --out "backup/scratch/refs-math3/img/jx2022_p2_a.png"`
- **裁片**：`backup/scratch/refs-math3/img/jx2022_p2_a.png`（979×417 px / 290773 B / sha256 `21e427665854cd86a0ebd3d6514fc7c7b7321ff84abb4279f54e1410435502ff`）
- **亲读原文**：「**2** 已知 $a_n=\sqrt[n]{n}-\frac{(-1)^n}{n}(n=1,2,\cdots)$, 则 $\{a_n\}$（ ）（A）有最大值,有最小值.（B）有最大值,没有最小值.（C）没有最大值,有最小值.（D）没有最大值,没有最小值.」「**答案** A.」「数列 $\{a_n\}$ 具有极限 1, 且存在比 1 大的项 $a_1=2$, 比 1 小的项 $a_2=\sqrt2-\frac12$.」
- **结论**：2022 一(2) 【答案】A（与 OCR 一致）；四选项文字逐字确认；解析要点：极限为 1 且 $a_1=2>1$、$a_2=\sqrt2-\frac12<1$，故既取到最大值也取到最小值。
- **置信度**：high

### M3-2022-R08
- **材料**：B（2022 年解析，PDF p4 上部）
- **生成命令**：`…refs-vision.py --pdf "…/2022年数学三真题答案解析.pdf" --page 4 --dpi 150 --box 20,90,490,300 --out "backup/scratch/refs-math3/img/jx2022_p4_a.png"`
- **裁片**：`backup/scratch/refs-math3/img/jx2022_p4_a.png`（979×437 px / 247637 B / sha256 `9a36bd887dc63f5a0576ce6977c1d0849576e8a25bcd784e33d534e536239a7a`）
- **亲读原文**：「**3** 已知 $f(t)$ 连续, 令 $F(x,y)=\int_0^{x-y}(x-y-t)f(t)\mathrm dt$, 则（ ）…（D）$\frac{\partial F}{\partial x}=-\frac{\partial F}{\partial y},\ \frac{\partial^2F}{\partial x^2}=-\frac{\partial^2F}{\partial y^2}$.」「**答案** C.」「**分析** 本题主要考查变限积分求偏导数.」
- **结论**：2022 一(3) 【答案】C（与 OCR 一致）；四选项公式逐字确认（C 为 $\partial F/\partial x=-\partial F/\partial y$、$\partial^2F/\partial x^2=\partial^2F/\partial y^2$）。
- **置信度**：high

### M3-2022-R09
- **材料**：B（2022 年解析，PDF p5 上部）
- **生成命令**：`…refs-vision.py --pdf "…/2022年数学三真题答案解析.pdf" --page 5 --dpi 150 --box 20,60,490,260 --out "backup/scratch/refs-math3/img/jx2022_p5_a.png"`
- **裁片**：`backup/scratch/refs-math3/img/jx2022_p5_a.png`（979×417 px / 249846 B / sha256 `698279fa40fb9843871c4c902172b2b87e4fc90c346888766738b2abd3ad0473`）
- **亲读原文**：「（A）$I_1<I_2<I_3$. （B）$I_2<I_1<I_3$. （C）$I_1<I_3<I_2$. （D）$I_3<I_2<I_1$.」「**答案** A.」「令 $f(x)=\ln(1+x)-\frac{x}{2}$, 则 $f(0)=0$, $f'(x)=\frac{1}{1+x}-\frac12$. 当 $x\in(0,1)$ 时, $f'(x)>0$」
- **结论**：2022 一(4) 【答案】A（与 OCR 一致）；解析要点：比较 $\frac{x}{2}$ 与 $\ln(1+x)$ 得 $I_2>I_1$，再证 $I_3$ 最大。
- **置信度**：high

### M3-2022-R10
- **材料**：B（2022 年解析，PDF p5 下部）
- **生成命令**：`…refs-vision.py --pdf "…/2022年数学三真题答案解析.pdf" --page 5 --dpi 150 --box 20,400,490,570 --out "backup/scratch/refs-math3/img/jx2022_p5_b.png"`
- **裁片**：`backup/scratch/refs-math3/img/jx2022_p5_b.png`（979×355 px / 236570 B / sha256 `ade43f8d682a25818a1413ec34d4704e7267f4973462fc4adcebe616c320713b`）
- **亲读原文**：「（B）存在可逆矩阵 $\boldsymbol P$, 使得 $\boldsymbol A=\boldsymbol P\boldsymbol A\boldsymbol P^{-1}$. …（D）存在可逆矩阵 $\boldsymbol P$, 使得 $\boldsymbol A=\boldsymbol P\boldsymbol A\boldsymbol P^{\mathrm T}$.」「**答案** B.」「3 阶矩阵 $\boldsymbol A$ 的特征值为 $1,-1,0$ 意味着 $\boldsymbol A$ 有 3 个不同的特征值, 从而相似于与它具有相同特征值的对角矩阵」
- **结论**：2022 一(5) 【答案】B（与 OCR 一致）；解析要点：三个互异特征值 ⟹ 可对角化（相似），故在四选项里只有「$A=PAP^{-1}$」是充要条件（$A=PAQ$ 是等价、$A=QAQ^{-1}$ 与 $A=PAP^{\mathrm T}$ 不是特征值的充要条件）。
- **置信度**：high

### M3-2022-R11
- **材料**：B（2022 年解析，PDF p8 下部）
- **生成命令**：`…refs-vision.py --pdf "…/2022年数学三真题答案解析.pdf" --page 8 --dpi 150 --box 20,340,490,540 --out "backup/scratch/refs-math3/img/jx2022_p8_a.png"`
- **裁片**：`backup/scratch/refs-math3/img/jx2022_p8_a.png`（979×417 px / 219571 B / sha256 `4016c136da131dc5f6d33e1ca05423f2caadf6e7df97355d78090cd05e67a848`）
- **亲读原文**：「$(\boldsymbol A,\boldsymbol b)=\begin{pmatrix}1&1&1&1\\1&a&a^2&2\\1&b&b^2&4\end{pmatrix}\to\begin{pmatrix}1&1&1&1\\0&a-1&a^2-1&1\\0&b-1&b^2-1&3\end{pmatrix}$」「当 $a=b=1$ 时, $r(\boldsymbol A)=1,r(\boldsymbol A,\boldsymbol b)=2$, 方程组无解.」「综上所述, 方程组 $\boldsymbol A\boldsymbol x=\boldsymbol b$ 的解的情况只有两种可能, 有唯一解或无解. 应选 D.」
- **结论**：2022 一(6) 结论 **D**（该题无「【答案】」标签框，答案在解析收尾句「应选 D」；与 OCR 一致）；解析要点：增广矩阵初等行变换，$a=1$／$b=1$／$a=b$ 三类均无解，其余唯一解。
- **置信度**：high

### M3-2022-R12
- **材料**：B（2022 年解析，PDF p9 上部）
- **生成命令**：`…refs-vision.py --pdf "…/2022年数学三真题答案解析.pdf" --page 9 --dpi 150 --box 20,100,490,370 --out "backup/scratch/refs-math3/img/jx2022_p9_a.png"`
- **裁片**：`backup/scratch/refs-math3/img/jx2022_p9_a.png`（979×563 px / 342278 B / sha256 `7018ad1fcdca75eb259924b1529a5b443f3e9bf0d1712633132fef7e018d1122`）
- **亲读原文**：「**7** 设 $\boldsymbol\alpha_1=(\lambda,1,1)^{\mathrm T},\boldsymbol\alpha_2=(1,\lambda,1)^{\mathrm T},\boldsymbol\alpha_3=(1,1,\lambda)^{\mathrm T},\boldsymbol\alpha_4=(1,\lambda,\lambda^2)^{\mathrm T}$, 若 $\boldsymbol\alpha_1,\boldsymbol\alpha_2,\boldsymbol\alpha_3$ 与 $\boldsymbol\alpha_1,\boldsymbol\alpha_2,\boldsymbol\alpha_4$ 等价, 则 $\lambda$ 的取值范围是（ ）」「**答案** C.」「向量组 $\boldsymbol\alpha_1,\boldsymbol\alpha_2,\boldsymbol\alpha_3$ 与 $\boldsymbol\alpha_1,\boldsymbol\alpha_2,\boldsymbol\alpha_4$ 等价的充分必要条件是 $r(\boldsymbol\alpha_1,\boldsymbol\alpha_2,\boldsymbol\alpha_3)=r(\boldsymbol\alpha_1,\boldsymbol\alpha_2,\boldsymbol\alpha_4)=r(\boldsymbol\alpha_1,\boldsymbol\alpha_2,\boldsymbol\alpha_3,\boldsymbol\alpha_4)$」
- **结论**：2022 一(7) 【答案】C（与 OCR 一致）；同页上方为 2015 年数一/二/三真题例（$\boldsymbol A,\boldsymbol b$ 参数方程组的 4 选项，答案 D），**不得**当作 2022 题号答案。
- **置信度**：high

### M3-2022-R13
- **材料**：B（2022 年解析，PDF p10 中部）
- **生成命令**：`…refs-vision.py --pdf "…/2022年数学三真题答案解析.pdf" --page 10 --dpi 150 --box 20,380,490,560 --out "backup/scratch/refs-math3/img/jx2022_p10_a.png"`
- **裁片**：`backup/scratch/refs-math3/img/jx2022_p10_a.png`（979×375 px / 194459 B / sha256 `b18b7dc751b8b8fa97580f8653f2dd73da864aa992c44eb444e6a9fa2685f00a`）
- **亲读原文**：「（A）2. （B）4. （C）6. （D）10.」「**答案** D.」「由于 $X\sim N(0,4)$, $Y\sim B\big(3,\frac13\big)$, 故 $X$ 的方差 $D(X)=4$, $Y$ 的方差 $D(Y)=3\times\frac13\times\big(1-\frac13\big)=\frac23$.」
- **结论**：2022 一(8) 【答案】D（与 OCR 一致）；解析要点：$D(X)=4,\ D(Y)=2/3$，不相关故 $\mathrm{Cov}=0$，$D(X-3Y+1)=4+9\cdot\frac23=10$（与选项 D 一致）。
- **置信度**：high

### M3-2022-R14
- **材料**：B（2022 年解析，PDF p11 下部）
- **生成命令**：`…refs-vision.py --pdf "…/2022年数学三真题答案解析.pdf" --page 11 --dpi 150 --box 20,520,490,700 --out "backup/scratch/refs-math3/img/jx2022_p11_a.png"`
- **裁片**：`backup/scratch/refs-math3/img/jx2022_p11_a.png`（979×375 px / 197073 B / sha256 `aba4e5e2e9c588a99eae07bacbb46fc1162a9bdd7b59790366041906de9a2ceb`）
- **亲读原文**：「**9** 设随机变量序列 $X_1,X_2,\cdots,X_n,\cdots$ 独立同分布, 且 $X_1$ 的概率密度为 $f(x)=\begin{cases}1-|x|,&|x|<1\\0,&其他,\end{cases}$ 则当 $n\to\infty$ 时, $\frac1n\sum_{i=1}^n X_i^2$ 依概率收敛于（ ）（A）$\frac18$.（B）$\frac16$.（C）$\frac13$.（D）$\frac12$.」「**答案** B.」
- **结论**：2022 一(9) 【答案】B（与 OCR 一致）；解析要点：辛钦大数定律，$E(X_1^2)=\int_{-1}^1 x^2(1-|x|)\mathrm dx=1/6$。
- **置信度**：high

### M3-2022-R15
- **材料**：B（2022 年解析，PDF p13 中部）
- **生成命令**：`…refs-vision.py --pdf "…/2022年数学三真题答案解析.pdf" --page 13 --dpi 150 --box 20,170,490,350 --out "backup/scratch/refs-math3/img/jx2022_p13_a.png"`
- **裁片**：`backup/scratch/refs-math3/img/jx2022_p13_a.png`（979×375 px / 194872 B / sha256 `399ba4db074dca08d4d00eb9109e784dd298a2b5902b0a6cc804fdbb0a413163`）
- **亲读原文**：「**10** 设二维随机变量 $(X,Y)$ 的概率分布为（表：$X=-1$ 行 $0.1,0.1,b$；$X=1$ 行 $a,0.1,0.1$）若事件 $\{\max\{X,Y\}=2\}$ 与事件 $\{\min\{X,Y\}=1\}$ 相互独立, 则 $\mathrm{Cov}(X,Y)=$（ ）（A）$-0.6$.（B）$-0.36$.（C）0.（D）0.48.」「**答案** B.」
- **结论**：2022 一(10) 【答案】B（与 OCR 一致）；解析要点：由独立性定出 $a,b$ 后算协方差得 $-0.36$。
- **置信度**：high

### M3-2022-R16
- **材料**：B（2022 年解析，PDF p14 中部）
- **生成命令**：`…refs-vision.py --pdf "…/2022年数学三真题答案解析.pdf" --page 14 --dpi 150 --box 20,300,490,480 --out "backup/scratch/refs-math3/img/jx2022_p14_a.png"`
- **裁片**：`backup/scratch/refs-math3/img/jx2022_p14_a.png`（979×375 px / 181787 B / sha256 `4a39880d84684c72ebe4618865b8d71648548b27b833bcc63b1afda3e691c624`）
- **亲读原文**：「**答案** 应填 $\sqrt{\mathrm e}$.」「$\lim_{x\to0}\Big(\frac{1+\mathrm e^x}{2}\Big)^{\cot x}=\lim_{x\to0}\mathrm e^{\cot x\ln\frac{1+\mathrm e^x}{2}}=\mathrm e^{\lim_{x\to0}\cot x\ln\frac{1+\mathrm e^x}{2}}$」
- **结论**：2022 二(11) 答案 $\sqrt{\mathrm e}$（= $\mathrm e^{1/2}$）；OCR `答案）应填√e.` 与之逐字一致；独立复算：$\ln L=\cot x\ln\big(\frac{1+\mathrm e^x}{2}\big)\to\frac1x\cdot\frac{\mathrm e^x-1}{2}\to\frac12$，故 $L=\sqrt{\mathrm e}$ ✓。
- **置信度**：high

### M3-2022-R17
- **材料**：B（2022 年解析，PDF p16 上部）
- **生成命令**：`…refs-vision.py --pdf "…/2022年数学三真题答案解析.pdf" --page 16 --dpi 150 --box 20,40,490,250 --out "backup/scratch/refs-math3/img/jx2022_p16_a.png"`
- **裁片**：`backup/scratch/refs-math3/img/jx2022_p16_a.png`（979×438 px / 637838 B / sha256 `0b9bac5c02569b817924b147869cca769d43a2996f2933f972ef9ffb5e224de5`）
- **亲读原文**：「答案 $\frac12\ln(x^2-6x+13)+4\arctan\frac{x-3}{2}+C$, 其中 $C$ 为任意常数.」「此外, 以下题目也属于类似的有理函数积分.」「**【例】** $\int_{-\infty}^{1}\frac{1}{x^2+2x+5}\mathrm dx=$ ______．(2014 年数学二试题) 答案 $\frac{3\pi}{8}$.」
- **结论**：该页上部为「类似题/例」块的答案（1997 数二 $\pi/8$、2014 数二 $3\pi/8$、2021 数一 $\pi/4$），**不是** 2022 题号的答案；2022 二(12) 的答案在同册 PDF p14 末（见 M3-2022-R18 与 `math3.md` 的 OCR 对照栏）。
- **置信度**：high

### M3-2022-R18
- **材料**：B（2022 年解析，PDF p19 下部）
- **生成命令**：`…refs-vision.py --pdf "…/2022年数学三真题答案解析.pdf" --page 19 --dpi 150 --box 20,330,490,560 --out "backup/scratch/refs-math3/img/jx2022_p19_a.png"`
- **裁片**：`backup/scratch/refs-math3/img/jx2022_p19_a.png`（979×479 px / 291109 B / sha256 `151ea1116b08f7e23b5701a1cf8c297ab5c5a15fd4fb89bc164f88ecb3a14e2d`）
- **亲读原文**：「$\lim_{x\to+\infty}\big[y(x)-2x\big]=\lim_{x\to+\infty}\mathrm e^{1-\sqrt x}=0$.」「因此, $y=2x$ 为曲线 $y=2x+\mathrm e^{1-\sqrt x}$ 的斜渐近线, 也是唯一的渐近线.」「**18** 设某产品的产量 $Q$ 由资本投入量 $x$ 和劳动投入量 $y$ 决定, 生产函数 $Q=12x^{\frac12}y^{\frac16}$」
- **结论**：2022 三(17) 结果 $y=2x+\mathrm e^{1-\sqrt x}$，唯一渐近线 $y=2x$；独立复算：积分因子 $\mathrm e^{\sqrt x}$ 得 $y=2x+C\mathrm e^{-\sqrt x}$，由 $y(1)=3$ 得 $C=\mathrm e$ ✓。
- **置信度**：high

### M3-2022-R19
- **材料**：B（2022 年解析，PDF p20 上部）
- **生成命令**：`…refs-vision.py --pdf "…/2022年数学三真题答案解析.pdf" --page 20 --dpi 150 --box 20,300,490,520 --out "backup/scratch/refs-math3/img/jx2022_p20_a.png"`
- **裁片**：`backup/scratch/refs-math3/img/jx2022_p20_a.png`（979×458 px / 362030 B / sha256 `e038b348daa6df0f8689db0b2291999503dee70bc88f795a8ddc62246fbec34a`）
- **亲读原文**：「$12\times\sqrt{256}\times\sqrt[6]{64}=12\times16\times2=384$. 因此, 当利润最大时, 产量 $Q=384$.」「**注** ① 本题的计算量较大. 用求根公式计算根时, $\sqrt{1+4\times36\times580}=\sqrt{83521}$, 开方时, 可以采用试根的方法.」「②（1）式形如 $\frac{580}{z}-36z=1$」
- **结论**：2022 三(18) 结果 $Q=384$（解析提示令 $z=x^{1/3}$ 化为一元二次方程）；独立复算：驻点条件给出 $y=x/4$ 与 $6(1160-3Q)^2=Q$，得 $1160-3Q=8$，$Q=384$ ✓。
- **置信度**：high

### M3-2022-R20
- **材料**：B（2022 年解析，PDF p21 中部）
- **生成命令**：`…refs-vision.py --pdf "…/2022年数学三真题答案解析.pdf" --page 21 --dpi 150 --box 20,150,490,430 --out "backup/scratch/refs-math3/img/jx2022_p21_a.png"`
- **裁片**：`backup/scratch/refs-math3/img/jx2022_p21_a.png`（979×584 px / 207845 B / sha256 `4caecdcccca47395a84571754114827d08fe1862f690b9de4110784a4023bd8d`）
- **亲读原文**：「$D_1=\{(r,\theta)\mid 0\le r\le2,0\le\theta\le\frac{\pi}{2}\}$」「$D_2=\{0\le r\le\frac{2}{\sin\theta-\cos\theta},\frac{\pi}{2}\le\theta\le\pi\}$」「$=2\big(\frac{\pi}{2}-\sin^2\theta\Big|_0^{\frac{\pi}{2}}\big)+\int_{\frac{\pi}{2}}^{\pi}(\cos\theta-\sin\theta)^2\cdot\frac{2}{(\sin\theta-\cos\theta)^2}\mathrm d\theta=\pi-2+2\times\big(\pi-\frac{\pi}{2}\big)=2\pi-2.$」
- **结论**：2022 三(19) 结果 $I=2\pi-2$；解析用极坐标把区域拆成 $D_1\cup D_2$；独立复算：同拆分得 $\pi-2+\pi=2\pi-2$ ✓。
- **置信度**：high

### M3-2022-R21
- **材料**：B（2022 年解析，PDF p24 上部）
- **生成命令**：`…refs-vision.py --pdf "…/2022年数学三真题答案解析.pdf" --page 24 --dpi 150 --box 20,30,490,300 --out "backup/scratch/refs-math3/img/jx2022_p24_a.png"`
- **裁片**：`backup/scratch/refs-math3/img/jx2022_p24_a.png`（979×562 px / 278739 B / sha256 `7bb5bea6776d7f5b156399e5c2a53733d6c6d89502bbdade2f9d9c3729d42c1e`）
- **亲读原文**：「$\boldsymbol\varepsilon_1=\frac{\boldsymbol\xi_1}{\|\boldsymbol\xi_1\|}=\frac{1}{\sqrt2}\begin{pmatrix}1\\0\\1\end{pmatrix},\ \boldsymbol\varepsilon_2=\begin{pmatrix}0\\1\\0\end{pmatrix},\ \boldsymbol\varepsilon_3=\frac{1}{\sqrt2}\begin{pmatrix}-1\\0\\1\end{pmatrix}$」「标准形 $4y_1^2+4y_2^2+2y_3^2$」「因此, $\min_{x\ne0}\frac{f(x)}{x^{\mathrm T}x}=2.$」
- **结论**：2022 三(21) 正交矩阵 $Q=(\boldsymbol\varepsilon_1,\boldsymbol\varepsilon_2,\boldsymbol\varepsilon_3)$、标准形 $4y_1^2+4y_2^2+2y_3^2$、$\min=2$；独立复算：$A=\begin{pmatrix}3&0&1\\0&4&0\\1&0&3\end{pmatrix}$ 的特征值为 $4,4,2$（$[[3,1],[1,3]]$ 的特征值 $4,2$）✓。
- **置信度**：high

### M3-2022-R22
- **材料**：B（2022 年解析，PDF p25 上部）
- **生成命令**：`…refs-vision.py --pdf "…/2022年数学三真题答案解析.pdf" --page 25 --dpi 150 --box 20,30,490,300 --out "backup/scratch/refs-math3/img/jx2022_p25_a.png"`
- **裁片**：`backup/scratch/refs-math3/img/jx2022_p25_a.png`（979×562 px / 214375 B / sha256 `5f68371991611a5807484f891c97c6598713a29a6d42585e0b3004cdaac165a1`）
- **亲读原文**：「$L(\theta)=\begin{cases}\frac{1}{2^m\theta^{m+n}}\mathrm e^{-\frac{\sum_{i=1}^n x_i}{\theta}-\frac{\sum_{j=1}^m y_j}{2\theta}},&x_i>0,y_j>0\\0,&其他.\end{cases}$」「$\ln L(\theta)=-m\ln2-(m+n)\ln\theta-\frac{\sum_{i=1}^n x_i}{\theta}-\frac{\sum_{j=1}^m y_j}{2\theta}$」
- **结论**：2022 三(22) 似然函数与对数似然逐字确认（系数 $2^{-m}\theta^{-(m+n)}$、指数 $-\frac{\sum x_i}{\theta}-\frac{\sum y_j}{2\theta}$）；由 $\mathrm d\ln L/\mathrm d\theta=0$ 得 $\hat\theta=\dfrac{2\sum X_i+\sum Y_j}{2(m+n)}$（见 M3-2022-R23）。
- **置信度**：high

### M3-2022-R23
- **材料**：B（2022 年解析，PDF p26，答案速查页）
- **生成命令**：`…refs-vision.py --pdf "…/2022年数学三真题答案解析.pdf" --page 26 --dpi 150 --box 20,30,490,520 --out "backup/scratch/refs-math3/img/jx2022_p26_a.png"`
- **裁片**：`backup/scratch/refs-math3/img/jx2022_p26_a.png`（979×1020 px / 371148 B / sha256 `f091ea628ae39795d1caa910bf3f14368894fb509fdce8e52f4949323ac4038c`）
- **亲读原文**：「**2022 年全国硕士研究生招生考试数学（三）答案速查**」「一、选择题 (1) C. (2) A. (3) C. (4) A. (5) B. (6) D. (7) C. (8) D. (9) B. (10) B.」「二、填空题 (11) $\sqrt{\mathrm e}$. (12) $\ln3-\frac{\sqrt3}{3}\pi$. (13) 0. (14) $\mathrm e^2-2\mathrm e+1$. (15) $-1$. (16) $\frac58$.」「三、解答题 (17) $y=2x$ 为曲线 $y=2x+\mathrm e^{1-\sqrt x}$ 的斜渐近线…(18) 利润最大时的产量 $Q=384$. (19) $I=2\pi-2$.」「(22) $\hat\theta=\frac{2\sum_{i=1}^n X_i+\sum_{j=1}^m Y_j}{2(m+n)},\ D(\hat\theta)=\frac{\theta^2}{m+n}$」
- **结论**：2022 全 22 题答案的一次性权威来源（**答案速查页**，PDF p26 = 该册最后一页）：选择 $C,A,C,A,B,D,C,D,B,B$；填空 $\sqrt{\mathrm e},\ \ln3-\frac{\sqrt3}{3}\pi,\ 0,\ \mathrm e^2-2\mathrm e+1,\ -1,\ \frac58$；解答 (17) $y=2x$、(18) $Q=384$、(19) $2\pi-2$、(20) 收敛域 $[-1,1]$ 与 $S(x)$、(21) $Q$ 与 $4y_1^2+4y_2^2+2y_3^2$、(22) $\hat\theta$ 与 $D(\hat\theta)=\frac{\theta^2}{m+n}$。逐条与 M3-2022-R06…R22 的正文裁片一致。
- **置信度**：high

### M3-2022-R24
- **材料**：B（2022 年解析，PDF p22 上部）
- **生成命令**：`…refs-vision.py --pdf "…/2022年数学三真题答案解析.pdf" --page 22 --dpi 150 --box 20,30,490,430 --out "backup/scratch/refs-math3/img/jx2022_p22_a.png"`
- **裁片**：`backup/scratch/refs-math3/img/jx2022_p22_a.png`（979×833 px / 372566 B / sha256 `4352d3b153a5c94866e861fcf26d2ff0e6eb067b961b57ae04a45603122d5199`）
- **亲读原文**：「由比值审敛法可知, 当 $|x|<1$ 时, 原幂级数收敛; 当 $|x|>1$ 时, 原幂级数发散, 从而收敛半径为 1, 收敛区间为 $(-1,1)$.」「原幂级数 $=\sum_{n=0}^{\infty}\frac{(-1)^n}{2n+1}+\sum_{n=0}^{\infty}\frac{1}{4^n(2n+1)}$, 而级数 $\sum_{n=0}^{\infty}\frac{(-1)^n}{2n+1}$ 和 $\sum_{n=0}^{\infty}\frac{1}{4^n(2n+1)}$ 均收敛, 故原幂级数收敛. 因此, 原幂级数的收敛域为 $[-1,1]$.」「$[xS_1(x)]'=\Big[\sum_{n=0}^{\infty}\frac{(-1)^n}{2n+1}x^{2n+1}\Big]'=\sum_{n=0}^{\infty}(-1)^nx^{2n}=\frac{1}{1+x^2}$」
- **结论**：2022 三(20) 收敛域 $[-1,1]$ **含端点**（端点处拆成 Leibniz 级数 $\sum(-1)^n/(2n+1)$ 与几何型级数 $\sum 1/(4^n(2n+1))$，二者均收敛）；和函数 $S(x)=\frac{\arctan x}{x}+\frac1x\ln\frac{2+x}{2-x}\ (x\in[-1,0)\cup(0,1])$，$S(0)=2$；独立复算：$S_1=\frac{\arctan x}{x}$、$S_2=\frac1x\ln\frac{2+x}{2-x}$，$x=1/2$ 时级数 $2.025903$ 与公式 $2.025907$ 一致 ✓。
- **置信度**：high

## 二、2021 年（真题册 PDF p6–p9；解析册 9 页全为原生文本层 PDF，但排版碎裂）

> 2021 真题册页面尺寸 486.9×722.1 pt（**比 2022 的 504.6×725.7 pt 窄**），150 dpi 整页 = 1015×1505 px。
> 2021 解析册页面 A4 595.3×841.9 pt，150 dpi 整页 = 1241×1754 px；**无蓝底「答案」标签框**（`find_ansbox.py` 在 p4–p8 均报「未找到蓝色标签」），故全部用整页裁片取证。
> 2021 解析册无「答案速查」页（末页 p9 只是 (22)(3) 的解析尾部），答案只能逐题从正文【答案】行取。

### M3-2021-R01
- **材料**：A（2010-2022 数学三真题册，PDF p6 = 2021 试题第 1 页）
- **生成命令**：`参考文件/_venv/Scripts/python.exe tools/refs-vision.py --pdf "参考文件/真题/数学/5、【1987-2025年】考研数学三真题/3、2010-2022考研数学三真题.pdf" --page 6 --dpi 150 --out "backup/scratch/refs-math3/img/zt2021_p6.png"`
- **裁片**：`backup/scratch/refs-math3/img/zt2021_p6.png`（1015×1505 px / 335659 B / sha256 `4a8b30c6cb7e86a77f725e0fca71dcbd0fc1c201f5c90b7236e6429fa8ae106d`）
- **亲读原文**：「2021 全国硕士研究生入学统一考试 数学（三）（科目代码：303）」「一、选择题(1~10 小题,每小题 5 分,共 50 分.)」「(1) 当 $x\to0$ 时,$\int_0^{x^2}(\mathrm e^{t^3}-1)\mathrm dt$ 是 $x^7$ 的（ ）(A) 低阶无穷小 (B) 等价无穷小 (C) 高阶无穷小 (D) 同阶但非等价无穷小」「(5) 二次型 $f(x_1,x_2,x_3)=(x_1+x_2)^2+(x_2+x_3)^2-(x_3-x_1)^2$ 的正惯性指数与负惯性指数依次为（ ）(A)2,0 (B)1,1 (C)2,1 (D)1,2」「页脚：2021 年数学（三）试题 第 1 页（共 4 页）」
- **结论**：2021 一(1)–(6) 题面与四选项取证（含 (6) $A=(\boldsymbol\alpha_1,\boldsymbol\alpha_2,\boldsymbol\alpha_3,\boldsymbol\alpha_4)$ 4 阶正交矩阵、$B=\begin{pmatrix}\boldsymbol\alpha_1^{\mathrm T}\\\boldsymbol\alpha_2^{\mathrm T}\\\boldsymbol\alpha_3^{\mathrm T}\end{pmatrix}$、$\boldsymbol\beta=(1,1,1)^{\mathrm T}$ 求 $BX=\boldsymbol\beta$ 通解）。**真题册 2021 部分页脚为「第 N 页（共 4 页）」，据此确认 p6–p9 即 2021 全卷**。
- **置信度**：high

### M3-2021-R02
- **材料**：A（真题册 PDF p7 = 2021 试题第 2 页）
- **生成命令**：`…refs-vision.py --pdf "…/3、2010-2022考研数学三真题.pdf" --page 7 --dpi 150 --out "backup/scratch/refs-math3/img/zt2021_p7.png"`
- **裁片**：`backup/scratch/refs-math3/img/zt2021_p7.png`（1015×1505 px / 392730 B / sha256 `23d165a7307fe0c0ed992688e0fcbf1314f833725b93b0f912b9ba072eb93c28`）
- **亲读原文**：「(7) 已知矩阵 $A=\begin{pmatrix}1&0&-1\\2&-1&1\\-1&2&-5\end{pmatrix}$,若存在下三角可逆矩阵 $P$ 和上三角可逆矩阵 $Q$,使 $PAQ$ 为对角矩阵,则 $P,Q$ 可以分别取（ ）」「(11) 若 $y=\cos\mathrm e^{-\sqrt x}$,则 $\frac{\mathrm dy}{\mathrm dx}\Big|_{x=1}=$ ______.」「(12) $\int_{\sqrt5}^{5}\frac{x}{\sqrt{|x^2-9|}}\mathrm dx=$ ______.」「(13) 设平面区域 $D$ 由曲线 $y=\sqrt x\sin\pi x\ (0\le x\le1)$ 与 $x$ 轴围成,则 $D$ 绕 $x$ 轴旋转所成的旋转体的体积为 ______.」
- **结论**：2021 一(7)–(10) 与 二(11)–(15) 题面取证（(15) 为 4 阶行列式 $\begin{vmatrix}x&x&1&2x\\1&x&2&-1\\2&1&x&1\\2&-1&1&x\end{vmatrix}$ 中 $x^3$ 的系数）。
- **置信度**：high

### M3-2021-R03
- **材料**：A（真题册 PDF p8 = 2021 试题第 3 页）
- **生成命令**：`…refs-vision.py --pdf "…/3、2010-2022考研数学三真题.pdf" --page 8 --dpi 150 --out "backup/scratch/refs-math3/img/zt2021_p8.png"`
- **裁片**：`backup/scratch/refs-math3/img/zt2021_p8.png`（1015×1505 px / 187879 B / sha256 `267099ce5ebac1f8a6cc8a0660033b68f2b5a1e17602c7eb5c14918f839e113b`）
- **亲读原文**：「(16) 甲,乙两个盒子中各装有 2 个红球和 2 个白球,先从甲盒中任取一球,观察颜色后放入乙盒中,再从乙盒中任取一个球,令 $X,Y$ 分别表示从甲盒和乙盒中取到的红球个数,则 $X$ 与 $Y$ 的相关系数为 ______.」「(17)（本题满分 10 分）已知 $\lim_{x\to0}\Big[a\arctan\frac1x+(1+|x|)^{\frac1x}\Big]$ 存在,求 $a$ 的值.」「(18) 求函数 $f(x,y)=2\ln|x|+\frac{(x-1)^2+y^2}{2x^2}$ 的极值.」「(19) 设有界区域 $D$ 是圆 $x^2+y^2=1$ 和直线 $y=x$ 以及 $x$ 轴在第一象限围成的部分,计算二重积分 $\iint\limits_D\mathrm e^{(x+y)^2}(x^2-y^2)\mathrm dx\,\mathrm dy$.」
- **结论**：2021 二(16) 与 三(17)(18)(19) 题面取证。
- **置信度**：high

### M3-2021-R04
- **材料**：A（真题册 PDF p9 = 2021 试题第 4 页）
- **生成命令**：`…refs-vision.py --pdf "…/3、2010-2022考研数学三真题.pdf" --page 9 --dpi 150 --out "backup/scratch/refs-math3/img/zt2021_p9.png"`
- **裁片**：`backup/scratch/refs-math3/img/zt2021_p9.png`（1015×1505 px / 183018 B / sha256 `566d6c8e576af9a893372aef9af418a3f2ba5c60ce984bfc74c1b5a687730228`）
- **亲读原文**：「(20)（本题满分 12 分）设 $n$ 为正整数,$y=y_n(x)$ 是微分方程 $xy'-(n+1)y=0$ 的满足条件 $y_n(1)=\frac{1}{n(n+1)}$ 的解.（Ⅰ）求 $y_n(x)$；（Ⅱ）求级数 $\sum_{n=1}^{\infty}y_n(x)$ 的收敛域及和函数.」「(21) 设矩阵 $A=\begin{pmatrix}2&1&0\\1&2&0\\1&a&b\end{pmatrix}$ 仅有两个不同的特征值,若 $A$ 相似于对角矩阵,求 $a,b$ 的值,并求可逆矩阵 $P$,使 $P^{-1}AP$ 为对角矩阵.」「(22) 在区间 $(0,2)$ 上随机取一点,将该区间分成两段,较短一段的长度记为 $X$,较长一段的长度记为 $Y$,令 $Z=\frac YX$.（Ⅰ）求 $X$ 的概率密度；（Ⅱ）求 $Z$ 的概率密度；（Ⅲ）求 $E\big(\frac XY\big)$.」
- **结论**：2021 三(20)(21)(22) 题面取证（全卷 22 题题面闭合）。
- **置信度**：high

### M3-2021-R05
- **材料**：B（2021 年解析，PDF p1）
- **生成命令**：`参考文件/_venv/Scripts/python.exe tools/refs-vision.py --pdf "参考文件/真题/数学/6、【1987-2025年】考研数学三真题答案及解析/2021年数学三真题答案解析.pdf" --page 1 --dpi 150 --out "backup/scratch/refs-math3/img/jx2021_p1.png"`
- **裁片**：`backup/scratch/refs-math3/img/jx2021_p1.png`（1241×1754 px / 194587 B / sha256 `681de770fc491eb2fb972a8f5788d6bb3adfefba8e2edfd10060f57be6da06ed`）
- **亲读原文**：「【答案】C.」…「因为当 $x\to0$ 时,$\Big[\int_0^{x^2}(\mathrm e^{t^3}-1)\mathrm dt\Big]'=2x(\mathrm e^{x^6}-1)\sim2x^7$,所以 $\int_0^{x^2}(\mathrm e^{t^3}-1)\mathrm dt$ 是 $x^7$ 高阶无穷小,正确答案为 C.」「【答案】D.」「因为 $\lim_{x\to0}\frac{f(x)-f(0)}{x-0}=\lim_{x\to0}\frac{\mathrm e^x-1-x}{x^2}=\frac12$,故 $f'(0)=\frac12$,正确答案为 D.」「【答案】A.」「$f(\frac ba)=a\cdot\frac ba-b\cdot\ln\frac ba<0$,从而 $\ln\frac ba>1$,可得 $\frac ba>\mathrm e$,正确答案为 A.」「【答案】C.」「联立可得 $f_1'(1,1)=0,\ f_2'(1,1)=1$, $\mathrm df(1,1)=\mathrm dy$,故正确答案为 C.」
- **结论**：2021 一(1)(2)(3)(4) 答案 **C、D、A、C** 与解析要点逐字确认。
- **置信度**：high

### M3-2021-R06
- **材料**：B（2021 年解析，PDF p2）
- **生成命令**：`…refs-vision.py --pdf "…/2021年数学三真题答案解析.pdf" --page 2 --dpi 150 --out "backup/scratch/refs-math3/img/jx2021_p2.png"`
- **裁片**：`backup/scratch/refs-math3/img/jx2021_p2.png`（1241×1754 px / 180872 B / sha256 `06104469c2c53e130329872d26bf412c0d26eeea028213194c233d1eefe65ed2`）
- **亲读原文**：「(5) 二次型 $f(x_1,x_2,x_3)=(x_1+x_2)^2+(x_2+x_3)^2-(x_3-x_1)^2$…【答案】B.」「$f(x_1,x_2,x_3)=2x_2^2+2x_1x_2+2x_2x_3+2x_1x_3$，所以 $A=\begin{pmatrix}0&1&1\\1&2&1\\1&1&0\end{pmatrix}$」「$|\lambda E-A|=\begin{vmatrix}\lambda&-1&-1\\-1&\lambda-2&-1\\-1&-1&\lambda\end{vmatrix}=(\lambda+1)(\lambda-3)\lambda$，故特征值为 $-1,3,0$，故该二次型的正惯性指数为 1，负惯性指数为 1.」「(6)…【答案】D.」「因为 $A=(\boldsymbol\alpha_1,\boldsymbol\alpha_2,\boldsymbol\alpha_3,\boldsymbol\alpha_4)$ 为 4 阶正交矩阵…$B\boldsymbol\alpha_4=\begin{pmatrix}\boldsymbol\alpha_1^{\mathrm T}\\\boldsymbol\alpha_2^{\mathrm T}\\\boldsymbol\alpha_3^{\mathrm T}\end{pmatrix}\boldsymbol\alpha_4=\boldsymbol0$，所以齐次线性方程组 $BX=\boldsymbol0$ 的通解为 $k\boldsymbol\alpha_4$.」「$B(\boldsymbol\alpha_1+\boldsymbol\alpha_2+\boldsymbol\alpha_3)=\begin{pmatrix}1\\1\\1\end{pmatrix}=\boldsymbol\beta$」
- **结论**：2021 一(5) 答案 **B**、一(6) 答案 **D** 取证；**(5) 的二次型矩阵确为 $A=\begin{pmatrix}0&1&1\\1&2&1\\1&1&0\end{pmatrix}$** —— 修正了我在 OCR 阶段的错误记忆（曾误记含 $-1$ 元素为 $\begin{pmatrix}0&1&-1\\1&2&1\\-1&1&0\end{pmatrix}$），特征值 $-1,3,0$ → 正、负惯性指数各 1；(6) 与我的独立推导（取 $X_0=\boldsymbol\alpha_1+\boldsymbol\alpha_2+\boldsymbol\alpha_3$ 为特解、$k\boldsymbol\alpha_4$ 为齐次解）一致。
- **置信度**：high

### M3-2021-R07
- **材料**：B（2021 年解析，PDF p3）
- **生成命令**：`…refs-vision.py --pdf "…/2021年数学三真题答案解析.pdf" --page 3 --dpi 150 --out "backup/scratch/refs-math3/img/jx2021_p3.png"`
- **裁片**：`backup/scratch/refs-math3/img/jx2021_p3.png`（1241×1754 px / 162024 B / sha256 `ecae53148deb978f7a71efa9782ac8ba644bea8c6fd5b364b12c6f57037c6a4f`）
- **亲读原文**：「(7)…【答案】C.」「$(A,E)=\begin{pmatrix}1&0&-1&1&0&0\\2&-1&1&0&1&0\\-1&2&-5&0&0&1\end{pmatrix}\to\begin{pmatrix}1&0&-1&1&0&0\\0&-1&3&-2&1&0\\0&2&-6&1&0&1\end{pmatrix}\to\begin{pmatrix}1&0&-1&1&0&0\\0&1&-3&2&-1&0\\0&0&0&-3&2&1\end{pmatrix}$」「$=(F,P)$,则 $P=\begin{pmatrix}1&0&0\\2&-1&0\\-3&2&1\end{pmatrix}$」「$\begin{pmatrix}F\\E\end{pmatrix}\to\cdots=(\Lambda,Q)$,则 $Q=\begin{pmatrix}1&0&1\\0&1&3\\0&0&1\end{pmatrix}$.故应选 C.」「(8)…【答案】D.」「$P(A|A\cup B)=\frac{P(A)}{P(A)+P(B)-P(AB)}$，$P(\overline A|A\cup B)=\frac{P(B)-P(AB)}{P(A)+P(B)-P(AB)}$，因为 $P(A|A\cup B)>P(\overline A|A\cup B)$，固有 $P(A)>P(B)-P(AB)$，故正确答案为 D.」
- **结论**：2021 一(7) 答案 **C**（$P,Q$ 矩阵逐字取证）、一(8) 答案 **D**（由条件只能推出 $P(A)>P(B)-P(AB)$，不能推出 $P(A)>P(B)$，故 D 为假命题）。
- **置信度**：high

### M3-2021-R08
- **材料**：B（2021 年解析，PDF p4）
- **生成命令**：`…refs-vision.py --pdf "…/2021年数学三真题答案解析.pdf" --page 4 --dpi 150 --out "backup/scratch/refs-math3/img/jx2021_p4.png"`
- **裁片**：`backup/scratch/refs-math3/img/jx2021_p4.png`（1241×1754 px / 175150 B / sha256 `569de228ebbb0ead07ccc519874efe7bb56b8f47aa72c90d628ebad1e0adaca2`）
- **亲读原文**：「（B）$E(\hat\theta)=\theta,\ D(\hat\theta)=\frac{\sigma_1^2+\sigma_2^2-2\rho\sigma_1\sigma_2}{n}$…【答案】B」「$D(\hat\theta)=D(\overline X-\overline Y)=D(\overline X)+D(\overline Y)-\mathrm{cov}(\overline X,\overline Y)=\frac{\sigma_1^2+\sigma_2^2-2\rho\sigma_1\sigma_2}{n}$，故正确答案为 B.」「(10)…【答案】A.」「似然函数 $L(\theta)=(\frac{1-\theta}{2})^3(\frac{1+\theta}{4})^5$」「求导 $\frac{\mathrm d\ln L(\theta)}{\mathrm d\theta}=0$，得 $\theta=\frac14$.」「(11) 若 $y=\cos\mathrm e^{-\sqrt x}$，则 $\frac{\mathrm dy}{\mathrm dx}\Big|_{x=1}=$ ______.【答案】$\frac{\sin\frac1e}{2\mathrm e}$.」「(12)…【答案】6.」「(13)…【答案】$\frac\pi4$.」
- **结论**：2021 一(9) 答案 **B**、一(10) 答案 **A**；二(11) 答案 **$\frac{1}{2\mathrm e}\sin\frac1e$**（**修正 OCR 阶段误读的「$\frac12\mathrm e\sin\mathrm e$」**：正确为 $\frac{1}{2\mathrm e}\sin\frac1e$，与我的独立复算 $y'=\frac{\sin(\mathrm e^{-\sqrt x})\mathrm e^{-\sqrt x}}{2\sqrt x}\big|_{x=1}=\frac{\sin(1/\mathrm e)}{2\mathrm e}$ 一致）；二(12) **6**；二(13) **$\frac\pi4$**。
- **置信度**：high

### M3-2021-R09
- **材料**：B（2021 年解析，PDF p5）
- **生成命令**：`…refs-vision.py --pdf "…/2021年数学三真题答案解析.pdf" --page 5 --dpi 150 --out "backup/scratch/refs-math3/img/jx2021_p5.png"`
- **裁片**：`backup/scratch/refs-math3/img/jx2021_p5.png`（1241×1754 px / 182086 B / sha256 `8e35a516bd814aa6a9b5f13692dbbff3766a19ccf872a6b6222d862ef0ed3685`）
- **亲读原文**：「【解析】$V=\pi\int_0^1(\sqrt x\sin\pi x)^2\mathrm dx=\pi\int_0^1x\sin^2\pi x\mathrm dx\xlongequal{\pi x=t}\frac12\int_0^{\pi}\sin^2t\,\mathrm dt=\frac\pi4.$」「(14)…【答案】$y=y^*+\overline y=\frac12t^2-\frac12t+C$，$C$ 为任意常数.」「(15)…【答案】-5.」「所以展开式中含 $x^3$ 项的有 $-x^3,-4x^3$，即 $x^3$ 项的系数为 -5.」「(16)…【答案】$\frac15$.」「【解答】联合分布率 $(X,Y)\sim\begin{pmatrix}(0,0)&(0,1)&(1,0)&(1,1)\\\frac3{10}&\frac15&\frac15&\frac3{10}\end{pmatrix}$」「$\mathrm{cov}(X,Y)=\frac1{20},\ DX=\frac14,DY=\frac14$，即 $\rho_{XY}=\frac15$.」「(17)…【答案】$\alpha=\frac1\pi(\frac1e-\mathrm e)$.」「又由于 $\lim_{x\to0^+}\Big[\alpha\arctan\frac1x+(1+|x|)^{\frac1x}\Big]=\frac\pi2\alpha+\mathrm e$」
- **结论**：2021 二(14) 通解 **$y=\frac12t^2-\frac12t+C$**、二(15) **-5**、二(16) 相关系数 **$\frac15$**（**修正 OCR 阶段误读的 $\frac12$**：文本层只印出「1」，分数线与分母 5 被拆行丢失）、三(17) **$\alpha=\frac1\pi(\frac1e-\mathrm e)$**；独立复算：抽球联合分布 $(\frac3{10},\frac15,\frac15,\frac3{10})$ 得 $\rho=1/5$ ✓，$\alpha\pi/2+\mathrm e=-\alpha\pi/2+1/\mathrm e$ 得 $\alpha$ ✓。
- **置信度**：high

### M3-2021-R10
- **材料**：B（2021 年解析，PDF p6）
- **生成命令**：`…refs-vision.py --pdf "…/2021年数学三真题答案解析.pdf" --page 6 --dpi 150 --out "backup/scratch/refs-math3/img/jx2021_p6.png"`
- **裁片**：`backup/scratch/refs-math3/img/jx2021_p6.png`（1241×1754 px / 159606 B / sha256 `a2920bf2133ae673f97c16fbea7864ffa950ed99d0ed2afaf00d79bbfdb848d6`）
- **亲读原文**：「(18)…【答案】$(-1,0)$ 处取极小值 2；$(\frac12,0)$ 处取极小值 $\frac12-2\ln2$.」「得驻点 $(-1,0)$，$(\frac12,0)$」「驻点 $(-1,0)$ 处，$A=3,B=0,C=1,\ AC-B^2=3>0,\ A>0$，故 $f(x,y)$ 在 $(-1,0)$ 处取极小值 2」「(19)…【答案】$\frac18\mathrm e^2-\frac14\mathrm e+\frac18$.」「$\iint\limits_D\mathrm e^{(x+y)^2}(x^2-y^2)\mathrm d\sigma=\frac12\int_0^{\frac\pi4}\cos2\theta\,\mathrm d\theta\int_0^1\mathrm e^{r^2(\cos\theta+\sin\theta)^2}r^2\mathrm dr$」
- **结论**：2021 三(18) 两个极小值点 $(-1,0)\to2$、$(\frac12,0)\to\frac12-2\ln2$；三(19) 答案 $\frac18\mathrm e^2-\frac14\mathrm e+\frac18$；独立复算：$f(-1,0)=2$ ✓、$f(\frac12,0)=\frac12-2\ln2$ ✓、二重积分网格 $0.3690784$ vs $(e^2-2e+1)/8=0.3690616$ ✓。
- **置信度**：high

### M3-2021-R11
- **材料**：B（2021 年解析，PDF p7）
- **生成命令**：`…refs-vision.py --pdf "…/2021年数学三真题答案解析.pdf" --page 7 --dpi 150 --out "backup/scratch/refs-math3/img/jx2021_p7.png"`
- **裁片**：`backup/scratch/refs-math3/img/jx2021_p7.png`（1241×1754 px / 181469 B / sha256 `c499bf378de712a0f6e6891c852da553663bdf13c1c7c30d8185ae3790b849f4`）
- **亲读原文**：「∴原式$=\frac{\mathrm e^2}{8}-\frac{\mathrm e}{4}+\frac18\int_1^{\sqrt2}u^{-3}\mathrm du=\frac18\mathrm e^2-\frac14\mathrm e+\frac18.$」「(20)…【答案】(1) $y_n(x)=\frac{1}{n(n+1)}x^{n+1}$；(2) 收敛域 $[-1,1]$，$S(x)=\begin{cases}(1-x)\ln(1-x)+x,&x\in[-1,1)\\1,&x=1\end{cases}$」「设 $S(x)=\sum_{n=1}^{\infty}\frac{1}{n(n+1)}x^{n+1}=\sum_{n=1}^{\infty}\frac{x^{n+1}}{n}-\sum_{n=1}^{\infty}\frac{x^{n+1}}{n+1}=(1-x)\ln(1-x)+x$」「(21)…由 $|\lambda E-A|=\begin{vmatrix}\lambda-2&-1&0\\-1&\lambda-2&0\\-1&-a&\lambda-b\end{vmatrix}=(\lambda-b)(\lambda-3)(\lambda-1)=0$」
- **结论**：2021 三(20)：$y_n(x)=\frac{x^{n+1}}{n(n+1)}$、收敛域 $[-1,1]$、和函数 $S(x)=(1-x)\ln(1-x)+x\ (x\in[-1,1))$、$S(1)=1$；**注意解析【答案】框写 $x\in(-1,1)$，而解析正文结论写 $x\in[-1,1)$** —— 以解析正文与我复算为准（$S(-1)=2\ln2-1$ 与闭式一致，$x=-1$ 应含）。三(21) 特征多项式 $|\lambda E-A|=(\lambda-b)(\lambda-3)(\lambda-1)$。
- **置信度**：high

### M3-2021-R12
- **材料**：B（2021 年解析，PDF p8）
- **生成命令**：`…refs-vision.py --pdf "…/2021年数学三真题答案解析.pdf" --page 8 --dpi 150 --out "backup/scratch/refs-math3/img/jx2021_p8.png"`
- **裁片**：`backup/scratch/refs-math3/img/jx2021_p8.png`（1241×1754 px / 158148 B / sha256 `320271badfc7b723b412458b7671c83b6f2457719a63c7193e10ed52bdcd55f1`）
- **亲读原文**：「此时，$\lambda_1=\lambda_2=3$ 所对应特征向量为 $\boldsymbol\alpha_1=\begin{pmatrix}1\\1\\0\end{pmatrix},\boldsymbol\alpha_2=\begin{pmatrix}0\\0\\1\end{pmatrix}$，$\lambda_3=1$ 所对应的特征向量为 $\boldsymbol\alpha_3=\begin{pmatrix}-1\\1\\1\end{pmatrix}$，则 $P^{-1}AP=\begin{pmatrix}3&&\\&3&\\&&1\end{pmatrix}$」「当 $b=1$ 时…$(E-A)=\begin{pmatrix}-1&-1&0\\-1&-1&0\\-1&-a&0\end{pmatrix}$，知 $a=1$」「此时，$\lambda_1=\lambda_2=1$ 所对应特征向量为 $\boldsymbol\beta_1=\begin{pmatrix}-1\\1\\0\end{pmatrix},\boldsymbol\beta_2=\begin{pmatrix}0\\0\\1\end{pmatrix}$，$\lambda_3=3$ 所对应的特征向量为 $\boldsymbol\alpha_3=\begin{pmatrix}1\\1\\1\end{pmatrix}$，则 $P^{-1}AP=\begin{pmatrix}1&&\\&1&\\&&3\end{pmatrix}$」「(22)…【答案】(1) $x\sim f(x)=\begin{cases}1,&0<x<1\\0,&其他\end{cases}$；(2) $f_Z(z)=(F_Z(z))'=\begin{cases}\frac{2}{(z+1)^2},&z\ge1\\0,&其他\end{cases}$；(3) $-1+2\ln2$.」
- **结论**：2021 三(21) 两组解 $(a,b)=(-1,3)$ 与 $(1,1)$ 及特征向量/对角化矩阵取证；三(22) 答案：$f_X(x)=1\ (0<x<1)$、$f_Z(z)=\frac{2}{(z+1)^2}\ (z\ge1)$、$E(\frac XY)=-1+2\ln2$；独立复算：$\int_0^1\frac{x}{2-x}\mathrm dx=-1+2\ln2$ ✓。
- **置信度**：high

### M3-2021-R13
- **材料**：B（2021 年解析，PDF p9）
- **生成命令**：`…refs-vision.py --pdf "…/2021年数学三真题答案解析.pdf" --page 9 --dpi 150 --out "backup/scratch/refs-math3/img/jx2021_p9.png"`
- **裁片**：`backup/scratch/refs-math3/img/jx2021_p9.png`（1241×1754 px / 18796 B / sha256 `37f0d1af02035976f6f7235770e71cbd1490dae3ceefc820435ccbe9b282b788`）
- **亲读原文**：「(3) $E\big(\frac XY\big)=E\big(\frac{X}{2-X}\big)=\int_0^1\frac{x}{2-x}\mathrm dx=-1+2\ln2$」（页面上仅此一小段，(22) 解析尾部）
- **结论**：2021 三(22)(Ⅲ) 结论 $-1+2\ln2$ 与解析积分式逐字确认；该册末页即解析结尾，**不存在答案速查页**。
- **置信度**：high

### M3-2021-R14
- **材料**：OCR 对照（`参考文件/_extract/真题__数学__6、【1987-2025年】考研数学三真题答案及解析__2021年数学三真题答案解析.txt`，3757 行；页边界：p1=L1、p2=L367、p3=L857、p4=L1550、p5=L1933、p6=L2325、p7=L2781、p8=L3317、p9=L3720）
- **生成命令**：不适用（纯文本对照）。对应裁片见 M3-2021-R05…R13。
- **亲读原文（OCR 讹字样本）**：「【答案】」（L1812 / L1983 / L2283 / L2586 / L3005 / L3518 六处【答案】行**内容为空**）；「【答案】4」（L1930，真值 $\frac\pi4$，分数线与 π 丢失）；「【答案】1」（L2176，真值 $\frac15$，分母 5 丢失）；「【答案】-5.」（L2088 ✓ 可用）；「【答案】6 .」（L1859 ✓ 可用）；「.故正确答案为A .」（L1797）；「确答案为C.」（L71）
- **结论**：2021 解析册虽有原生文本层（10601 字），但为**排版碎裂版**：公式被拆成单字符/单符号行，**分数、根号、上下标大量丢失**（(11) 真值 $\frac{\sin(1/\mathrm e)}{2\mathrm e}$、(16) 真值 $\frac15$、(13) 真值 $\frac\pi4$ 均被破坏）。故 2021 全部答案与公式**只用裁片/read_image 取证**，文本层仅用于定位行号；本次据此修正了两处 OCR 阶段误读（(11) 与 (16)）。
- **置信度**：high（对「文本层不可作依据」这一判断本身）

## 三、2020 年（真题册 PDF p10–p12；解析册 7 页纯扫描件，无文本层）

> 口径说明：2020 全卷结构为 一、选择 (1)–(8)（每题 4 分共 32）+ 二、填空 (9)–(14)（每题 4 分共 24）+ 三、解答 (15)–(23)（共 94 分），与 2021/2022 的 10+6+6 结构不同。**2020 解析册 7 页全部为扫描图（文本层仅 13 字）**，所有答案与关键式子均以裁片亲读取证；真题册 2020 三页为 A4（595.3×841.9 pt），与 2021 试题页（486.9×722.1 pt）不同，**换年必须重新标定页面尺寸**（见 M3-2020-R12）。

### M3-2020-R01
- **材料**：A（`参考文件/真题/数学/5、【1987-2025年】考研数学三真题/3、2010-2022考研数学三真题.pdf`，PDF p10 = 2020 试题第 1 页）
- **生成命令**：`参考文件/_venv/Scripts/python.exe tools/refs-vision.py --pdf "参考文件/真题/数学/5、【1987-2025年】考研数学三真题/3、2010-2022考研数学三真题.pdf" --page 10 --dpi 150 --out "backup/scratch/refs-math3/img/zt2020_p10.png"`；局部：`…--page 10 --dpi 150 --box 30,470,566,640 --out "backup/scratch/refs-math3/img/zt2020_p10_q5.png"`
- **裁片**：`backup/scratch/refs-math3/img/zt2020_p10.png`（1241×1754 px / 215002 B / sha256 `dd5c1fd0a2d53c8b856d66820c3ca0fea9697f92236edb448dac29288d220126`）；`backup/scratch/refs-math3/img/zt2020_p10_q5.png`（1116×354 px / 56326 B / sha256 `330601d9ece48a0607af963faa70063a58109faa0004095a6bfd135b475a023d`）
- **亲读原文**：「**2020 年数三真题** 一、选择题 (1) 设 $\lim_{x\to a}\frac{f(x)-a}{x-a}=b$，则 $\lim_{x\to a}\frac{\sin f(x)-\sin a}{x-a}=$（ ）(A)$b\sin a$ (B)$b\cos a$ (C)$b\sin f(a)$ (D)$b\cos f(a)$」「(2) 函数 $f(x)=\frac{\mathrm e^{\frac1{x-1}}\ln|1+x|}{(\mathrm e^x-1)(x-2)}$ 的第二类间断点的个数为（ ）(A)1 个 (B)2 个 (C)3 个 (D)4 个」「(3) 设奇函数 $f(x)$ 在 $(-\infty,+\infty)$ 上具有连续导数，则（ ）(A)$\int_0^x[\cos f(t)+f'(t)]\mathrm dt$ 是奇函数 (B)…是偶函数 (C)$\int_0^x[\cos f'(t)+f(t)]\mathrm dt$ 是奇函数 (D)…是偶函数」「(4) 设幂级数 $\sum_{n=1}^{\infty}na_n(x-2)^n$ 的收敛区间为 $(-2,6)$，则 $\sum_{n=1}^{\infty}a_n(x+1)^{2n}$ 的收敛区间为（ ）(A)$(-2,6)$ (B)$(-3,1)$ (C)$(-5,3)$ (D)$(-17,15)$」「(5) 设 4 阶矩阵 $A=(a_{ij})$ 不可逆，$a_{12}$ 的代数余子式 $A_{12}\ne0$，$\alpha_1,\alpha_2,\alpha_3,\alpha_4$ 为 $A$ 的列向量组，$A^*$ 为 $A$ 的伴随矩阵，则方程组 $A^*x=0$ 的通解为（ ）(A)$x=k_1\alpha_1+k_2\alpha_2+k_3\alpha_3$ (B)$x=k_1\alpha_1+k_2\alpha_2+k_3\alpha_4$ (C)$x=k_1\alpha_1+k_2\alpha_3+k_3\alpha_4$ (D)$x=k_1\alpha_2+k_2\alpha_3+k_3\alpha_4$」「(6) 设 $A$ 为 3 阶矩阵，$\alpha_1,\alpha_2$ 为 $A$ 的属于特征值 1 的线性无关的特征向量，$\alpha_3$ 为 $A$ 的属于特征值 $-1$ 的特征向量，则满足 $P^{-1}AP=\begin{pmatrix}1&0&0\\0&-1&0\\0&0&1\end{pmatrix}$ 的可逆矩阵 $P$ 可为（ ）(A)$(\alpha_1+\alpha_3,\alpha_2,-\alpha_3)$ (B)$(\alpha_1+\alpha_2,\alpha_2,-\alpha_3)$ (C)$(\alpha_1+\alpha_3,-\alpha_3,\alpha_2)$ (D)$(\alpha_1+\alpha_2,-\alpha_3,\alpha_2)$」「(7) 设 $A,B,C$ 为三个随机事件，且 $P(A)=P(B)=P(C)=\frac14,P(AB)=0,P(AC)=P(BC)=\frac1{12}$，则 $A,B,C$ 中恰有一个事件发生的概率为（ ）(A)$\frac34$ (B)$\frac23$ (C)$\frac12$ (D)$\frac5{12}$」「(8) 设随机变量 $(X,Y)$ 服从二维正态分布 $N(0,0;1,4;-\frac12)$，则下列随机变量中服从标准正态分布且与 $X$ 独立的是（ ）(A)$\frac{\sqrt5}{5}(X+Y)$ (B)$\frac{\sqrt5}{5}(X-Y)$ (C)$\frac{\sqrt3}{3}(X+Y)$ (D)$\frac{\sqrt3}{3}(X-Y)$」
- **结论**：2020 一(1)–(8) 题面与四选项全部取证；正确字母 **(1)B (2)C (3)A (4)B (5)C (6)D (7)D (8)C**（字母由 M3-2020-R04/R05 解析裁片逐字确认）。**修正一处第一遍读图错误**：一(5) 的 (B) 项是 $x=k_1\alpha_1+k_2\alpha_2+k_3\alpha_4$（我第一遍误记为 $k_1\alpha_1+k_2\alpha_3+k_3\alpha_4$），正确项 **(C)** 才是 $k_1\alpha_1+k_2\alpha_3+k_3\alpha_4$ —— 与解析「$\alpha_1,\alpha_3,\alpha_4$ 线性无关」一致，故专为此再裁 `zt2020_p10_q5.png` 逐字复核。
- **置信度**：high（题面整页 + (5) 局部两级裁片互核）

### M3-2020-R02
- **材料**：A（真题册 PDF p11 = 2020 试题第 2 页）
- **生成命令**：`…refs-vision.py --pdf "…/3、2010-2022考研数学三真题.pdf" --page 11 --dpi 150 --out "backup/scratch/refs-math3/img/zt2020_p11.png"`
- **裁片**：`backup/scratch/refs-math3/img/zt2020_p11.png`（1241×1754 px / 221217 B / sha256 `d71dad17257d193d70c2543b8134f0ed200e15ab4b666cbf930458fc2f82a5ca`）
- **亲读原文**：「二、填空题 (9) 设 $z=\arctan[xy+\sin(x+y)]$，则 $\mathrm dz|_{(0,\pi)}=$ ______.」「(10) 曲线 $x+y+\mathrm e^{2xy}=0$ 在 $(0,-1)$ 处的切线方程为 ______.」「(11) 设某厂家某产品的产量为 $Q$，成本 $C(Q)=100+13Q$，设产品的单价为 $P$，需求量 $Q(P)=\frac{800}{P+3}-2$，则该厂家获得最大利润时的产量为 ______.」「(12) 设平面区域 $D=\{(x,y)\mid\frac x2\le y\le\frac1{1+x^2},0\le x\le1\}$，则 $D$ 绕 $y$ 轴旋转所成的旋转体的体积为 ______.」「(13) 行列式 $\begin{vmatrix}a&0&-1&1\\0&a&1&-1\\-1&1&a&0\\1&-1&0&a\end{vmatrix}=$ ______.」「(14) 设随机变量 $X$ 的概率分布为 $P\{X=k\}=\frac1{2^k},k=1,2,3,\cdots$，$Y$ 表示 $X$ 被 3 除的余数，则 $E(Y)=$ ______.」「三、解答题 (15) 已知 $a,b$ 为常数，若 $(1+\frac1n)^n-\mathrm e$ 与 $\frac b{n^a}$ 在 $n\to+\infty$ 时是等价无穷小，求 $a,b$.」「(16) 求函数 $f(x,y)=x^3+8y^3-xy$ 的极值.」「(17) 设函数 $y=f(x)$ 满足 $y''+2y'+5y=0,f(0)=1,f'(0)=-1$.(I) 求 $f(x)$ 的表达式.(II) 设 $a_n=\int_{n\pi}^{+\infty}f(x)\mathrm dx$，求 $\sum_{n=1}^{\infty}a_n$.」「(18) 设 $D=\{(x,y)|x^2+y^2\le1,y\ge0\}$，连续函数 $f(x,y)$ 满足 $f(x,y)=y\sqrt{1-x^2}+x\iint_Df(x,y)\mathrm dx\mathrm dy$，求 $\iint_Dxf(x,y)\mathrm dx\mathrm dy$.」「(19) 设函数 $f(x)$ 在区间 $[0,2]$ 上具有连续导数，$f(0)=f(2)=0$，$M=\max_{x\in[0,2]}|f(x)|$.证明：(I) 存在 $\xi\in(0,2)$，使 $|f'(\xi)|\ge M$.(II) 若对任意 $x\in(0,2)$，$|f'(x)|\le M$，则 $M=0$.」「(20) 设二次型 $f(x_1,x_2)=x_1^2-4x_1x_2+4x_2^2$ 经过正交变换 $\begin{pmatrix}x_1\\x_2\end{pmatrix}=Q\begin{pmatrix}y_1\\y_2\end{pmatrix}$ 化为二次型 $g(y_1,y_2)=ay_1^2+4y_1y_2+by_2^2$，其中 $a\ge b$.(I) 求 $a,b$ 的值.(II) 求正交矩阵 $Q$.」「(21) 设 $A$ 为 2 阶矩阵，$P=(\alpha,A\alpha)$，其中 $\alpha$ 是非零向量且不是 $A$ 的特征向量.(I) 证明 $P$ 为可逆矩阵.(II) 若 $A^2\alpha+A\alpha-6\alpha=0$，求 $P^{-1}AP$，并判断 $A$ 是否相似于对角矩阵.」「(22) 设二维随机变量 $(X,Y)$ 在区域 $D=\{(x,y)|0<y<\sqrt{1-x^2}\}$ 上服从均匀分布，令 $Z_1=\begin{cases}1,&X-Y>0\\0,&X-Y\le0\end{cases}$，$Z_2=\begin{cases}1,&X+Y>0\\0,&X+Y\le0\end{cases}$.(I) 求二维随机变量 $(Z_1,Z_2)$ 的概率分布.」
- **结论**：2020 二(9)–(14) 与三(15)–(22)(I) 题面取证完成。**关键词串已确认**：$(1+\frac1n)^n-\mathrm e$（**英文正体 e，非 $e$ 变量**）、$D=\{\frac x2\le y\le\frac1{1+x^2}\}$（**不是** $y\le\frac1{1+x^2}$ 之外的写法）、$Q(P)=\frac{800}{P+3}-2$、$y''+2y'+5y=0$、$a_n=\int_{n\pi}^{+\infty}f(x)\mathrm dx$、$f(x,y)=y\sqrt{1-x^2}+x\iint_Df$、$M=\max_{x\in[0,2]}|f(x)|$、$g=ay_1^2+4y_1y_2+by_2^2$（$a\ge b$）、$P=(\alpha,A\alpha)$、$D=\{0<y<\sqrt{1-x^2}\}$。
- **置信度**：high

### M3-2020-R03
- **材料**：A（真题册 PDF p12 = 2020 试题第 3 页；本页文本层仅 220 字，属低产页）
- **生成命令**：`…refs-vision.py --pdf "…/3、2010-2022考研数学三真题.pdf" --page 12 --dpi 150 --out "backup/scratch/refs-math3/img/zt2020_p12.png"`
- **裁片**：`backup/scratch/refs-math3/img/zt2020_p12.png`（1241×1754 px / 55430 B / sha256 `c5c6d248678f55274109185e4d42a9faa6e3a13f5e295ea3d52355845686e6ed`）
- **亲读原文**：「(II) 求 $Z_1$ 与 $Z_2$ 的相关系数.」「(23) 设某种元件的使用寿命 $T$ 的分布函数为 $F(t)=\begin{cases}1-\mathrm e^{-(\frac t\theta)^m},&t\ge0\\0,&其他\end{cases}$ 其中 $\theta,m$ 为参数且均大于零.(I) 求概率 $P\{T>t\}$ 与 $P\{T>s+t\mid T>s\}$，其中 $s>0,t>0$.(II) 任取 $n$ 个这种元件做寿命试验，测得它们的寿命分别为 $t_1,t_2,\cdots,t_n$，若 $m$ 已知，求 $\theta$ 的最大似然估计值 $\hat\theta$.」
- **结论**：2020 三(22)(II) 与三(23) 题面取证完成；整册试题共 3 页（p10–p12），**2020 卷为 23 题制**（与 2021/2022 的 22 题制不同，逐题索引须按 23 题建）。
- **置信度**：high

### M3-2020-R04
- **材料**：B（`参考文件/真题/数学/6、【1987-2025年】考研数学三真题答案及解析/2020年数学三真题答案解析.pdf`，PDF p1 = 印刷页 5）
- **生成命令**：`…refs-vision.py --pdf "…/2020年数学三真题答案解析.pdf" --page 1 --dpi 150 --out "backup/scratch/refs-math3/img/jx2020_p1.png"`
- **裁片**：`backup/scratch/refs-math3/img/jx2020_p1.png`（1241×1755 px / 653730 B / sha256 `ad77743b550442a710bc9dcc6a6b1e7b6a6bfcda38f7877056b4cf297192843c`）
- **亲读原文**：「**2020 年考研数三真题解析** 一、选择题 (1)【答案】B 【解析】$\lim_{x\to a}\frac{\sin f(x)-\sin a}{x-a}=\lim_{x\to a}\frac{\cos\xi\cdot[f(x)-a]}{x-a}$（$\xi$ 在 $f(x)$ 和 $a$ 之间）（拉格朗日定理）$=\cos a\lim_{x\to a}\frac{f(x)-a}{x-a}=b\cos a$ 故应选(B).」「(2)【答案】C 【解析】…$f(x)$ 共有四个间断点，分别为 $x=-1$；$\lim_{x\to-1}f(x)=\infty$，则 $x=-1$ 为第二类间断点；$x=0$：$\lim_{x\to0}f(x)=\lim_{x\to0}\frac{\mathrm e^{\frac1{x-1}}\ln(1+x)}{(\mathrm e^x-1)(x-2)}=\lim_{x\to0}\frac{\mathrm e^{\frac1{x-1}}\cdot x}{x(x-2)}=-\frac1{2\mathrm e}$，$x=0$ 为可去间断点；$x=1$：…$x=2$：$\lim_{x\to2}f(x)=\infty$ 故应选(C).」「(3)【答案】A 【解析】由于 $f(t)$ 可导且为奇函数，则 $f'(t),\cos f(t)$ 都是偶函数…则 $\int_0^x[\cos f(t)+f'(t)]\mathrm dt$ 是奇函数，故应选(A).」「(4)【答案】B 【解析】$\sum_{n=1}^{\infty}na_n(x-2)^n$ 的收敛半径为 $\frac{6-(-2)}2=4$…进而 $\sum_{n=1}^{\infty}a_n(x+1)^{2n}$ 的收敛半径为 2.所以幂级数 $\sum_{n=1}^{\infty}a_n(x+1)^{2n}$ 的收敛区间为 $(-3,1)$.答案为(B).」「(5)【答案】C 【解析】选择题的 4 个选项，已经告诉你 $A^*x=0$ 的基础解系由 $A$ 的 3 个列向量所构成.因此只要判断 $A$ 的哪 3 个列向量是线性无关的…$A_{12}=-\begin{vmatrix}a_{21}&a_{23}&a_{24}\\a_{31}&a_{33}&a_{34}\\a_{41}&a_{43}&a_{44}\end{vmatrix}\ne0$ 意味 $(a_{21},a_{31},a_{41})^{\mathrm T},(a_{23},a_{33},a_{43})^{\mathrm T},(a_{24},a_{34},a_{44})^{\mathrm T}$ 线性无关，那么必有 $\alpha_1,\alpha_3,\alpha_4$ 线性无关…故应选(C).」
- **结论**：2020 一(1)–(5) 答案 **B C A B C** 逐字取证；**修正我从 OCR 阶段带入的一处内容错误**：一(2) 中 $x=0$ 处的极限是 $-\frac1{2\mathrm e}$，不是 OCR 转写的「$-2$」（裁片原文为 $\lim_{x\to0}\frac{\mathrm e^{\frac1{x-1}}\cdot x}{x(x-2)}=-\frac1{2\mathrm e}$）；(4) 的「收敛半径为 2」是对 $(x+1)$ 而言（对 $z=(x+1)^2$ 半径为 4），结论 $(-3,1)$ 与我独立复算一致。
- **置信度**：high

### M3-2020-R05
- **材料**：B（2020 解析，PDF p2 = 印刷页 6）
- **生成命令**：`…refs-vision.py --pdf "…/2020年数学三真题答案解析.pdf" --page 2 --dpi 150 --out "backup/scratch/refs-math3/img/jx2020_p2.png"`
- **裁片**：`backup/scratch/refs-math3/img/jx2020_p2.png`（1241×1755 px / 725780 B / sha256 `68c6f29874d09f0c552267fb0115734e828b890cb9606f6097f62665dadb9090`）
- **亲读原文**：「(6)【答案】D 【解析】…于是 $\alpha_1+\alpha_3$ 不是 $A$ 的特征向量，排除(A)，(C)，又对角矩阵 $A=\begin{pmatrix}1&&\\&-1&\\&&1\end{pmatrix}$，故 $P$ 中特征向量应当是 $\lambda=1,\lambda=-1,\lambda=1$ 的顺序，排除(B).(D)$(\alpha_1+\alpha_2,-\alpha_3,\alpha_2)$ 中 $\alpha_1+\alpha_2$ 与 $\alpha_2$ 是 $\lambda=1$ 的线性无关的特征向量，$-\alpha_3$ 是 $\lambda=-1$ 的特征向量，故应选(D).」「(7)【答案】D 【解析】…$P((A\cup B\cup C)-(BC\cup AC))=P(A)+P(B)+P(C)-P(BC)-P(AC)-P(BC)-P(AC)=\frac14+\frac14+\frac14-\frac1{12}-\frac1{12}-\frac1{12}-\frac1{12}=\frac5{12}$ 答案选(D).」「(8)【答案】C 【解析】$(X,Y)\sim N(0,0;1,4;-\frac12)$，则 $X\sim N(0,1),Y\sim N(0,4)$. $\frac{\mathrm{Cov}(X,Y)}{\sqrt{DX}\sqrt{DY}}=\rho=-\frac12,\sqrt{DX}=1,\sqrt{DY}=2$，所以 $\mathrm{Cov}(X,Y)=-1$. $D(X+Y)=DX+DY+2\mathrm{Cov}(X,Y)=1+4-2=3$，$D(X-Y)=DX+DY-2\mathrm{Cov}(X,Y)=1+4+2=7$…(C)$D[\frac{\sqrt3}{3}(X+Y)]=1$ 答案选(C).」「(9)【答案】$(\pi-1)\mathrm dx-\mathrm dy$ 【解析】$\frac{\partial z}{\partial x}\Big|_{(0,\pi)}=\frac{y+\cos(x+y)}{1+[xy+\sin(x+y)]^2}\Big|_{(0,\pi)}=\pi-1$，$\frac{\partial z}{\partial y}\Big|_{(0,\pi)}=\frac{x+\cos(x+y)}{1+[xy+\sin(x+y)]^2}\Big|_{(0,\pi)}=-1$」「(10)【答案】$y=x-1$ 【解析】等式 $x+y+\mathrm e^{2xy}=0$ 两端对 $x$ 求导得 $1+y'+\mathrm e^{2xy}\cdot2(y+xy')=0$」
- **结论**：2020 一(6)(7)(8) 答案 **D D C**、二(9)(10) 答案 **$(\pi-1)\mathrm dx-\mathrm dy$** 与 **$y=x-1$** 逐字取证；独立复算：(7) 恰有一个事件 $\frac34-2\cdot\frac16=\frac5{12}$ ✓；(8) $\mathrm{Cov}=-1$、$D(X\pm Y)=3,7$、$\frac{\sqrt3}{3}(X+Y)$ 方差 1 且 $\mathrm{Cov}(X,X+Y)=0$ ✓；(9) $\partial_x=\pi-1,\partial_y=-1$ ✓；(10) $y'(0)=1\Rightarrow y=x-1$ ✓。
- **置信度**：high

### M3-2020-R06
- **材料**：B（2020 解析，PDF p3 = 印刷页 7）
- **生成命令**：`…refs-vision.py --pdf "…/2020年数学三真题答案解析.pdf" --page 3 --dpi 150 --out "backup/scratch/refs-math3/img/jx2020_p3.png"`
- **裁片**：`backup/scratch/refs-math3/img/jx2020_p3.png`（1241×1755 px / 595858 B / sha256 `15eb2db58c0a438aa6483e85598b59257c053c83364ce9743508bd68e54dafd4`）
- **亲读原文**：「(11)【答案】8 【解析】由 $Q(P)=\frac{800}{P+3}-2$，可得 $P=\frac{800}{Q+2}-3$. 利润函数 $L(Q)=PQ-C(Q)=(\frac{800}{Q+2}-3)Q-(100+13Q)=-\frac{1600}{Q+2}-16Q+700$ $L'(Q)=\frac{1600}{(Q+2)^2}-16=0$ 解得 $Q=8,L''(Q)=\frac{-3200}{(Q+2)^3},L''(8)<0$，当 $Q=8$ 时，$L(Q)$ 最大.」「(12)【答案】$\pi\ln2-\frac\pi3$ 【解析】$V=2\pi\iint_Dx\sigma=2\pi\iint_Dx\mathrm d\sigma=2\pi\int_0^1\mathrm dx\int_{\frac x2}^{\frac1{1+x^2}}x\mathrm dy=2\pi\int_0^1[\frac x{1+x^2}-\frac{x^2}2]\mathrm dx=2\pi[\frac12\ln(1+x^2)-\frac{x^3}6]\Big|_0^1=\pi\ln2-\frac\pi3$」「(13)【答案】$a^2(a^2-4)$ 【解析】由行列式性质恒等变形，例如把 2 行加到 1 行，3 行加到 4 行…$=a^2\begin{vmatrix}a&2\\2&a\end{vmatrix}=a^2(a^2-4)$」「(14)【答案】$\frac87$ 【解析】$P\{Y=1\}=\sum_{n=0}^{\infty}\frac12\times\frac1{8^n}=\frac47$，$P\{Y=2\}=\frac12\times\frac47=\frac27$，$P\{Y=0\}=\frac14\times\frac47=\frac17$ … $EY=1\times\frac47+2\times\frac27=\frac87$」
- **结论**：2020 二(11)–(14) 答案 **8**、**$\pi\ln2-\frac\pi3$**、**$a^2(a^2-4)$**、**$\frac87$** 逐字取证。**这三条正是 OCR 文本层读不出来的值**（见 M3-2020-R11）：(12) 文本层无【答案】行、(14)【答案】后为空。独立复算：$L'$ 得 $Q=8$ ✓；$V=2\pi[\frac12\ln2-\frac16]=\pi\ln2-\frac\pi3$ ✓；(14) 几何级数 $\frac{1/2}{1-1/8}=\frac47$、$\frac{1/4}{1-1/8}=\frac27$、$\frac{1/8}{1-1/8}=\frac17$，$EY=\frac{4+4}7=\frac87$ ✓。
- **置信度**：high

### M3-2020-R07
- **材料**：B（2020 解析，PDF p4 = 印刷页 8）
- **生成命令**：`…refs-vision.py --pdf "…/2020年数学三真题答案解析.pdf" --page 4 --dpi 150 --out "backup/scratch/refs-math3/img/jx2020_p4.png"`
- **裁片**：`backup/scratch/refs-math3/img/jx2020_p4.png`（1241×1755 px / 562561 B / sha256 `7d8fb177a1aaa995fedc7c346982928d064585061293f4c550a0a40a66b293b7`）
- **亲读原文**：「(15)【解】（方法一）$\mathrm e^{n\ln(1+\frac1n)}-\mathrm e=\mathrm e[\mathrm e^{n\ln(1+\frac1n)-1}-1]\sim\mathrm e[n\ln(1+\frac1n)-1]=\mathrm e n[\ln(1+\frac1n)-\frac1n]\sim\mathrm e n(-\frac1{2n^2})=-\frac{\mathrm e}{2n}$ 由题设知 $-\frac{\mathrm e}{2n}\sim\frac b{n^a}$，则 $a=1,b=-\frac{\mathrm e}2$.」「(16)【解】由 $\begin{cases}f'_x=3x^2-y=0\\f'_y=24y^2-x=0\end{cases}$ 得驻点为 $(0,0),(\frac16,\frac1{12})$.…$\Delta=AC-B^2=288xy-1$. 在 $(0,0)$ 点处，$\Delta=-1<0$，不是极值点；在 $(\frac16,\frac1{12})$ 点处，$\Delta=3>0$ 且 $A=1>0$，取极小值为 $f(\frac16,\frac1{12})=-\frac1{216}$.」「(17)【解】（I）特征方程 $\lambda^2+2\lambda+5=0$，得 $\lambda_{1,2}=-1\pm2\mathrm i$，则 $f(x)=(C_1\cos2x+C_2\sin2x)\mathrm e^{-x}$. 由 $f(0)=1,f'(0)=-1$ 得 $C_1=1,C_2=0$. 有 $f(x)=\mathrm e^{-x}\cos2x$.（II）…所以 $\int\mathrm e^{-x}\cos2x\mathrm dx=\frac15(2\sin2x-\cos2x)\mathrm e^{-x}+C$ 有 $a_n=\frac15(2\sin2x-\cos2x)\mathrm e^{-x}\Big|_{n\pi}^{+\infty}=\frac15\mathrm e^{-n\pi}$ 得 $\sum_{n=1}^{\infty}a_n=\frac15\cdot\frac{\mathrm e^{-\pi}}{1-\mathrm e^{-\pi}}=\frac15\cdot\frac1{\mathrm e^{\pi}-1}$.」「(18)【解】令 $A=\iint_Df(x,y)\mathrm dx\mathrm dy$，则 $f(x,y)=y\sqrt{1-x^2}+Ax$. 两边求二重积分 $A=\iint_Df(x,y)\mathrm dx\mathrm dy=\iint_Dy\sqrt{1-x^2}\mathrm dx\mathrm dy+A\iint_Dx\mathrm dx\mathrm dy=\iint_Dy\sqrt{1-x^2}\mathrm dx\mathrm dy=2\int_0^1\sqrt{1-x^2}\mathrm dx\int_0^{\sqrt{1-x^2}}y\mathrm dy$」
- **结论**：2020 三(15) **$a=1,\ b=-\frac{\mathrm e}2$**（OCR 阶段的「$b=-$…」补全）；三(16) 驻点 $(0,0)$ 与 $(\frac16,\frac1{12})$，**极小值 $f(\frac16,\frac1{12})=-\frac1{216}$**（**修正 OCR 阶段带入的「$-216$」**）；三(17) $f(x)=\mathrm e^{-x}\cos2x$、$\sum a_n=\frac1{5(\mathrm e^\pi-1)}$；三(18) 的 $A=\iint_Dy\sqrt{1-x^2}$（因 $\iint_Dx=0$）。独立复算：$f(\frac16,\frac1{12})=\frac1{216}+\frac1{216}-\frac3{216}=-\frac1{216}$ ✓；$\sum_{n\ge1}\frac15\mathrm e^{-n\pi}=\frac1{5(\mathrm e^\pi-1)}$ ✓。
- **置信度**：high

### M3-2020-R08
- **材料**：B（2020 解析，PDF p5 = 印刷页 9）
- **生成命令**：`…refs-vision.py --pdf "…/2020年数学三真题答案解析.pdf" --page 5 --dpi 150 --out "backup/scratch/refs-math3/img/jx2020_p5.png"`
- **裁片**：`backup/scratch/refs-math3/img/jx2020_p5.png`（1241×1755 px / 522721 B / sha256 `d70f14678368c9bbe1ccc9995de5b2d1dcc1b595774ea661336d4f5b110a8f74`）
- **亲读原文**：「$=\int_0^1(1-x^2)^{\frac32}\mathrm dx\xlongequal{x=\sin t}\int_0^{\frac\pi2}\cos^4t\mathrm dt=\frac3{16}\pi$ 得 $f(x,y)=y\sqrt{1-x^2}+\frac3{16}\pi x$. 有 $\iint_Dxf(x,y)\mathrm dx\mathrm dy=\iint_Dxy\sqrt{1-x^2}\mathrm dx\mathrm dy+\frac3{16}\pi\iint_Dx^2\mathrm dx\mathrm dy=\frac3{16}\pi\iint_Dx^2\mathrm dx\mathrm dy=\frac3{16}\pi\int_0^{\pi}\mathrm d\theta\int_0^1r^2\cos^2\theta\cdot r\mathrm dr=\frac3{64}\pi\int_0^{\pi}\cos^2\theta\mathrm d\theta=\frac3{128}\pi^2$」「(19)【证明】（I）设 $|f(c)|=M$. 若 $c\in(0,1)$，由拉格朗日定理知存在 $\xi\in(0,c)$，使 $f'(\xi)=\frac{f(c)-f(0)}{c-0}=\frac{f(c)}c$ 从而有 $|f'(\xi)|=\frac{M}c\ge M$.…（II）…$M=|f(c)|=|f(c)-f(0)|=|f'(\xi)|c\le Mc$ 由于 $0\le c<1$，则 $M=0$.…若 $c=1$，且 $M>0$ $M=|f(1)|=|\int_0^1f'(x)\mathrm dx|\le\int_0^1|f'(x)|\mathrm dx<M$ 矛盾，则 $M=0$.」「(20)【解】（I）…$A=\begin{pmatrix}1&-2\\-2&4\end{pmatrix},B=\begin{pmatrix}a&2\\2&b\end{pmatrix}$ 因 $A\sim B$，于是 $\sum a_{ii}=\sum b_{ii}$，$|A|=|B|$，即 $\begin{cases}a+b=5\\ab=4\end{cases}$ 又因 $a\ge b$，故 $a=4,b=1$.（II）…$\begin{cases}x_1=y_2\\x_2=-y_1\end{cases}$…$Q=\begin{pmatrix}0&1\\-1&0\end{pmatrix}$ 是正交矩阵合于所求.」
- **结论**：2020 三(18) 答案 **$\frac3{128}\pi^2$**（$A=\frac{3\pi}{16}$、$\iint_Dx^2=\frac\pi8$）；三(19) 证明完成（两段 Lagrange + 积分不等式）；三(20) **$a=4,b=1$**、**$Q=\begin{pmatrix}0&1\\-1&0\end{pmatrix}$**。独立复算：$\int_0^1(1-x^2)^{3/2}\mathrm dx=\frac{3\pi}{16}$ ✓、$\iint_{D}x^2=\frac\pi8$ ✓、$\frac{3\pi}{16}\cdot\frac\pi8=\frac{3\pi^2}{128}$ ✓。
- **置信度**：high

### M3-2020-R09
- **材料**：B（2020 解析，PDF p6 = 印刷页 10）
- **生成命令**：`…refs-vision.py --pdf "…/2020年数学三真题答案解析.pdf" --page 6 --dpi 150 --out "backup/scratch/refs-math3/img/jx2020_p6.png"`
- **裁片**：`backup/scratch/refs-math3/img/jx2020_p6.png`（1241×1755 px / 680062 B / sha256 `81b8e8ecd2cc42900cd3369fd186838090e098d60e0e89ef6823b9cda1791b93`）
- **亲读原文**：「(21)【解】（I）因 $\alpha\ne0$ 且 $\alpha$ 不是 $A$ 的特征向量，于是 $A\alpha\ne k\alpha$，从而 $\alpha$ 与 $A\alpha$ 不共线，即 $\alpha,A\alpha$ 线性无关，故 $P=(\alpha,A\alpha)$ 可逆.…（II）（方法一）由 $A^2\alpha+A\alpha-6\alpha=0$ 有 $A^2\alpha=6\alpha-A\alpha$ $AP=A(\alpha,A\alpha)=(A\alpha,A^2\alpha)=(A\alpha,6\alpha-A\alpha)=(\alpha,A\alpha)\begin{pmatrix}0&6\\1&-1\end{pmatrix}$ 因 $P$ 可逆，于是 $P^{-1}AP=\begin{pmatrix}0&6\\1&-1\end{pmatrix}$ 记 $B=\begin{pmatrix}0&6\\1&-1\end{pmatrix}$，而 $|\lambda E-B|=\begin{vmatrix}\lambda&-6\\-1&\lambda+1\end{vmatrix}=\lambda^2+\lambda-6$ 特征值 $2,-3$. 于是 $A$ 有 2 个不同特征值从而 $A$ 可相似对角化.」「(22)【解】（I）$(X,Y)$ 在 $D$ 上均匀分布…$P\{Z_1=1\}=P\{X-Y>0\}=P\{(X,Y)\in D_1\}=\frac14$，故 …$P\{Z_2=1\}=P\{X+Y>0\}=P\{(X,Y)\in D_2\}=\frac34$，故」
- **结论**：2020 三(21) **$P^{-1}AP=\begin{pmatrix}0&6\\1&-1\end{pmatrix}$**（$A$ 有特征值 $2,-3$，**可相似对角化**）；三(22)(I) $P\{Z_1=1\}=\frac14$、$P\{Z_2=1\}=\frac34$。独立复算（极坐标楔形面积法）：$P(Z_1=1)=\frac{\pi/8}{\pi/2}=\frac14$ ✓、$P(Z_2=1)=\frac{3\pi/8}{\pi/2}=\frac34$ ✓。
- **置信度**：high

### M3-2020-R10
- **材料**：B（2020 解析，PDF p7 = 印刷页 11，本册末页）
- **生成命令**：`…refs-vision.py --pdf "…/2020年数学三真题答案解析.pdf" --page 7 --dpi 150 --out "backup/scratch/refs-math3/img/jx2020_p7.png"`
- **裁片**：`backup/scratch/refs-math3/img/jx2020_p7.png`（1241×1755 px / 447442 B / sha256 `4c30108d5cc315597dcca06c05d56a8abc2dabc167353eee45be5d58fe708036`）
- **亲读原文**：「总之 $(Z_1,Z_2)$ 的分布 所以 进一步有」+ 三张联合分布表，最终表为 $\begin{array}{c|cc}Z_1\backslash Z_2&0&1\\\hline0&\frac14&\frac12&\frac34\\1&0&\frac14&\frac14\\\hline&\frac14&\frac34\end{array}$；「$P\{Z_1=1,Z_2=1\}=P\{(X,Y)\in D_1\cap D_2\}=\frac14$」「（II）$Z_1$ 与 $Z_2$ 的相关系数 $\rho_{Z_1Z_2}=\frac{\mathrm{Cov}(Z_1,Z_2)}{\sqrt{DZ_1}\sqrt{DZ_2}}$ $DZ_1=pq=\frac34\times\frac14=\frac3{16},DZ_2=\frac14\times\frac34=\frac3{16},EZ_1=\frac14,EZ_2=\frac34$ $\mathrm{Cov}(Z_1,Z_2)=E(Z_1Z_2)-EZ_1EZ_2=1\times\frac14-\frac14\times\frac34=\frac14-\frac3{16}=\frac1{16}$ $\rho_{Z_1Z_2}=\frac{1/16}{\sqrt{3/16}\sqrt{3/16}}=\frac13$」「(23)【解】$F(t)=\begin{cases}1-\mathrm e^{-(\frac t\theta)^m},&t\ge0\\0,&t<0\end{cases}$，$f(x)=F'(x)=\begin{cases}m(\frac t\theta)^{m-1}\cdot\frac1\theta\mathrm e^{-(\frac t\theta)^m},&t\ge0\\0,&t<0\end{cases}$（I）$P\{T>t\}=F(+\infty)-F(t)=\mathrm e^{-(\frac t\theta)^m},t>0$. $P\{T>s+t\mid T>s\}=\frac{P\{T>s+t\}}{P\{T>s\}}=\frac{\mathrm e^{-(\frac{s+t}\theta)^m}}{\mathrm e^{-(\frac s\theta)^m}}=\mathrm e^{-(\frac{s+t}\theta)^m+(\frac s\theta)^m}$（II）…$L(\theta)=m^n\prod_{i=1}^n\frac{t_i^{m-1}}{\theta^m}\mathrm e^{-(\frac{t_i}\theta)^m}$ $\ln L(\theta)=n\ln m+\sum_{i=1}^n(m-1)\ln t_i-mn\ln\theta-\sum_{i=1}^n\frac{t_i^m}{\theta^m}$ 令 $\frac{\mathrm d\ln L(\theta)}{\mathrm d\theta}=-mn\frac1\theta+\sum_{i=1}^n\frac{t_i^m}{\theta^{m+1}}=0$ 解得 $\theta^m=\frac1n\sum_{i=1}^nt_i^m$，不难验证为最大值. 最大似然估计值 $\hat\theta=\sqrt[m]{\frac1n\sum_{i=1}^nt_i^m}$.」
- **结论**：2020 三(22)(II) **$\rho_{Z_1Z_2}=\frac13$**，且 $(Z_1,Z_2)$ 联合分布 $P(0,0)=\frac14,P(0,1)=\frac12,P(1,0)=0,P(1,1)=\frac14$（OCR 阶段只读出「四格之一碎裂」）；三(23)(I) $P\{T>t\}=\mathrm e^{-(t/\theta)^m}$、$P\{T>s+t\mid T>s\}=\mathrm e^{-((s+t)/\theta)^m+(s/\theta)^m}$（**注意不是记忆无性的 $\mathrm e^{-(t/\theta)^m}$**，(II) **$\hat\theta=\sqrt[m]{\frac1n\sum t_i^m}$**（**修正 OCR 阶段猜写的「$\sqrt[m]{m/n\cdot\sum t_i^m}$」形式，正确无额外 $m$ 因子**）。独立复算：四格概率按极坐标楔形 $\theta\in(0,\frac\pi4),(\frac\pi4,\frac{3\pi}4),(\frac{3\pi}4,\pi)$ 得 $\frac14,\frac12,0,\frac14$（和 = 1 ✓）；$\mathrm{Cov}=\frac14-\frac3{16}=\frac1{16}$、$\rho=\frac13$ ✓；MLE 由 $\theta^m=\frac1n\sum t_i^m$ ✓。
- **置信度**：high

### M3-2020-R11
- **材料**：OCR 对照（`参考文件/_extract/真题__数学__6、【1987-2025年】考研数学三真题答案及解析__2020年数学三真题答案解析.txt`，216 行）
- **生成命令**：不适用（纯文本对照）。对应裁片见 M3-2020-R04…R10。
- **亲读原文（OCR 样本）**：页边界行 L1「========== 第 1 页 ==========」、L36 第 2 页、L73 第 3 页、L99 第 4 页、L129 第 5 页、L159 第 6 页、L194 第 7 页；L4「（1）【答案】B」、L10「（2）【答案】C」、L17「（3）【答案】A」、L21「（4）【答案】B」、L25「敛半径为2.所以幂级数a（x+1）²"的收敛区间为（一3，1）.答案为（B)」、L26「（5）【答案】C」、L38「（6）【答案】D」、L46「（7)【答案】D」、L53「答案选（D)：」、L54「（8）【答案】C」、L61「答案选（C））」、L63「（9）【答案】（π一1）dx一dy」、L69「（10）【答案】y=x一1」、L75「（11）【答案】8」、L83「（13）【答案】a²（a²-4）」、**L90「（14）【答案】」（其后无值）**、**L82 附近无（12）的【答案】行**。
- **结论**：2020 解析册文本层共 13 字级别（题面与公式全为图像），**21 处「答案」行中 L90（14 题）答案值缺失、(12) 完全没有【答案】行**；L25「a（x+1）²"」把 $a_n$ 与 $2n$ 指数讹成散文、L63 把「−」讹成「一」。故 2020 二(12)、(14) 与全部解答题答案**只能读图**（本次由 M3-2020-R06/R10 补齐：$\pi\ln2-\frac\pi3$、$\frac87$、$\frac3{128}\pi^2$、$\rho=\frac13$、$\hat\theta=\sqrt[m]{\frac1n\sum t_i^m}$）。该 OCR 文件仅用于定位行号，**不作题面/公式依据**。
- **置信度**：high（对「文本层不可作依据」这一判断本身）

### M3-2020-R12
- **材料**：A + B 的版式/装订事实（`refs-vision.py` 输出的像素尺寸 + 裁片页脚亲读）
- **生成命令**：见 M3-2020-R01…R10（同 PDF、`--dpi 150`、无 `--box`）
- **裁片**：`zt2020_p10/11/12.png`（各 **1241×1754 px** → 页面 **595.3×841.9 pt**，即 A4）；`jx2020_p1…p7.png`（各 **1241×1755 px**）
- **亲读原文**：「• 5 •」（jx2020_p1 页脚）、「• 6 •」…「• 11 •」（jx2020_p7 页脚）；真题页脚「1」「2」「3」（zt2020_p10/11/12 页脚）；真题册标题「2020 年数三真题」，解析册标题「2020 年考研数三真题解析」
- **结论**：① 真题册内**各年页面尺寸不同**（2021 试题 486.9×722.1 pt / 2020 试题 595.3×841.9 pt），`--box` 标定**必须按年重做**；② 2020 解析册页脚印刷页码从 **5** 开始（PDF p1 = 印刷页 5），说明该册由合订本裁出，**引用页码时须写清「PDF 页」**（本文件一律写 PDF 页）；③ 2020 解析册**没有答案速查页**（末页 p11 是 (23) 解析结尾），答案分散在各题蓝底「答案」标签里，与 2022 解析册（PDF p26 有整页答案速查）不同；④ 2020 试题共 3 页（p10–p12）、解析共 7 页（p1–p7）。
- **置信度**：high

## 四、2010–2019：解析册答案清单页（选择题字母与填空答案取证）

**本节共同口径**（以下条目不再重复）
- 材料 A ＝ `参考文件/真题/数学/5、【1987-2025年】考研数学三真题/3、2010-2022考研数学三真题.pdf`（真题册，共 52 页）；材料 B⟨年⟩ ＝ `参考文件/真题/数学/6、【1987-2025年】考研数学三真题答案及解析/⟨年⟩年数学三真题答案解析.pdf`（该年解析册）。
- 命令模板：`参考文件/_venv/Scripts/python.exe tools/refs-vision.py --pdf "参考文件/真题/数学/6、【1987-2025年】考研数学三真题答案及解析/⟨年⟩年数学三真题答案解析.pdf" --page ⟨N⟩ --dpi 150 --out "backup/scratch/refs-math3/img/jx⟨年⟩_p⟨N⟩.png"`（整页、无 `--box`）。
- **页码一律写 PDF 物理页（1 基）**；裁片目录 `backup/scratch/refs-math3/img/`（`backup/` 被 `.gitignore` 整目录忽略，裁片不入库，凭命令 + sha256 重建）。
- 置信度：裁片亲读＝high；未亲读、仅由文本层【答案】行抽取＝medium；文本层答案行缺失或与裁片冲突＝low。
- 2010–2019 选择题字母的最终值见 `docs/refs/math3.md` 逐题索引与 `backup/scratch/refs-math3/index-2010-2019.json`（每题带 `letter_evidence`）。

### M3-JX2010-R01（2010 解析册答案清单首段）
- **材料**：B2010（分析册 9 页，文本层 10251 字）
- **页码**：PDF p1
- **裁片**：`backup/scratch/refs-math3/img/jx2010_p1.png`，1241×1754 px / 153838 B / sha256 `0bc78fe220cb568c42f2cf0e7ef074744e8ad9934729acda88f97abd74dc5d3f`
- **亲读原文**：「一、选择题 (1)【答案】（C）.【解析】lim_{x→0}[1/x − (1/x − a)e^x] = … = −1 + a = 1，所以 a = 2.」「(2)【答案】（A）.」「(3)【答案】（B）.」
- **结论**：2010 一(1) = **C**、一(2) = **A**、一(3) = **B**（与 `_extract/…__2010年数学三真题答案解析.txt` L5/L112/L333 的【答案】行一致）；一(4)–(8) 未在本页，取文本层双通道（medium）：(4)C (5)A (6)D (7)C (8)A ⇒ 全卷 **CABCADCA**。
- **置信度**：high（前 3 题）／medium（其余 5 题）

### M3-JX2011-R01（2011 解析册答案清单首段）
- **材料**：B2011（11 页，文本层 10253 字）｜**页码**：PDF p1
- **裁片**：`jx2011_p1.png`，1087×1536 px / 164589 B / sha256 `5db25e00c7412d0b5e2734c8d93efdc5f3b517c3f30b94a211e3a31b491cc56f`
- **亲读原文**：「一、选择题(1～8 小题，每小题 4 分，共 32 分)…(1)【答案】（C）.…所以 c = 4, k = 3，故答案选(C).」「(2)【答案】（B）.…= f′(0) − 2f′(0) = −f′(0). 故答案选(B).」「(3)【答案】（A）.」
- **结论**：2011 一(1)=**C** (2)=**B** (3)=**A**；其余 (4)B (5)D (6)C (7)D (8)D 取文本层双通道 ⇒ **CBABDCDD**。注：首版抽取曾把一(1) 误取为 A（命中后文「正确答案为(A)」），已限定「字母只能来自题号行或【答案】行」，修正后与裁片一致。
- **置信度**：high（前 3 题）／medium（其余）

### M3-JX2012-R01（2012 解析册 p1）
- **材料**：B2012（13 页，文本层 11760 字）｜**页码**：PDF p1
- **裁片**：`jx2012_p1.png`，1241×1754 px / 150747 B / sha256 `0136a7cacb34f522bcd2e791c000d89a7ddc2fce9991dc750f47f17c77f487be`
- **亲读原文**：「（1）曲线 y = (x²+x)/(x²−1) 的渐近线的条数为（）…【答案】：C…故两条选 C」「（2）设函数 f(x) = (e^x−1)(e^{2x}−2)…(e^{nx}−n)…则 f′(0) = …【答案】：C…所以 f′(0) = (−1)^{n−1}n!」
- **结论**：2012 一(1)=**C** (2)=**C**（源书印 (C) = $(−1)^{n−1}n!$）；其余 (3)B (4)D (5)C (6)B (7)D (8)B ⇒ **CCBDCBDB**。**源疑误**：一(2) 源印 C，但按题面展开应为 $f'(0)=(−1)^{n−1}(n−1)!$ 即选项 (A)，与 `tests/fixtures/bank-answer-manifest.json` 既有 notes 一致（m3-2012-2：源印 C、独立复算 A），此处如实记录两侧。
- **置信度**：high（前 2 题）／medium（其余）；源书答案与独立复算冲突处：medium

### M3-JX2013-R01（2013 解析册 p1）
- **材料**：B2013（10 页，文本层 9942 字）｜**页码**：PDF p1
- **裁片**：`jx2013_p1.png`，1241×1754 px / 154539 B / sha256 `acf1c0c107d639a388df4ec14359af94ff1958d311e78c3fc0772313846b4be3`
- **亲读原文**：「（1）当 x→0 时，用 o(x) 表示比 x 高阶的无穷小，则下列式子中错误的是（）…【答案】D【解析】o(x)+o(x²)=o(x)，故 D 错误。」「（2）函数 f(x) = (|x|^x − 1)/(x(x+1)ln|x|) 的可去间断点的个数为（）…【答案】C…故 f(x) 的可去间断点有 2 个。」
- **结论**：2013 一(1)=**D** (2)=**C**；其余 (3)B (4)D (5)B (6)B (7)A (8)C 取文本层双通道 ⇒ **DCBDBBAC**。
- **置信度**：high（前 2 题）／medium（其余）

### M3-JX2014-R01（2014 解析册 p1–p2，选择全 8 题亲读）
- **材料**：B2014（7 页；**p1 PDF 标记 rotation=90，但渲染结果正立**）｜**页码**：PDF p1、p2
- **裁片**：`jx2014_p1.png` 1075×1535 px / 263319 B / sha256 `43e441c2eb17fd28ab945dbb083b762dcb70a3d06e5fe5b8e51745ef5c564b02`；`jx2014_p2.png` 1075×1535 px / 158252 B / sha256 `5e1c8336fa0593dc51f0615088cfa5299f8bac99edc2dfe9e93a4bef7cd6ebbe`
- **亲读原文**：p1「2014 年 数学(三) 参考答案 一、选择题 (1) A …故应选 A. (2) C …所以 y = x 是 y = x + sin(1/x) 的斜渐近线.故应选 C. (3) D … (4) D …故应选 D. (5) B …= −(ad − bc)² … (6) A」；p2「(7) B …故应选 B.」「(8) C …故应选 C.」
- **结论**：2014 一(1) A、(2) C、(3) D、(4) D、(5) B、(6) A、(7) B、(8) C ⇒ **ACDDBABC**（8/8 亲读，与文本层单通道抽取 8/8 完全一致）。
- **置信度**：high

### M3-JX2015-R01（2015 解析册 p1–p3，选择全 8 题 + 填空 (9)–(12) 亲读）
- **材料**：B2015（7 页）｜**页码**：PDF p1、p2、p3
- **裁片**：`jx2015_p1.png` 1075×1535 / 356009 B / sha256 `de9cbc07a0969a84705a0e2781e514809553671a81fb0696ec92ebb0e864b918`；`jx2015_p2.png` 190709 B / sha256 `3a5313e9c574cd09dd4945056fc9a5f0867779f4fdb164f55182870419d6c7d5`；`jx2015_p3.png` 174010 B / sha256 `8cc70edf986291c49a371fb3eb3488263b2a3d529b9cc051f05d9649f4a200f9`
- **亲读原文**：p1「2015年 数学(三) 参考答案 一、选择题 (1) D …故应选 D. (2) C …故 y=f(x) 有两个拐点. (3) B … (4) C …」；p2「(5) D …故应选 D. (6) A …故应选 A. (7) C …故应选 C.」；p3「(8) B …故应选 B. 二、填空题 (9) −1/2 (10) 2 (11) −(1/3)dx − (2/3)dy (12) 2e^x + e^{−2x}」
- **结论**：2015 一(1) D、(2) C、(3) B、(4) C、(5) D、(6) A、(7) C、(8) B ⇒ **DCBCDACB**（8/8 亲读）；填空 (9) = −1/2、(10) = 2、(11) = −(1/3)dx − (2/3)dy、(12) = 2e^x + e^{−2x}（亲读）。
- **置信度**：high

### M3-JX2016-R01（2016 解析册 p1–p2，选择全 8 题 + 填空 (9)(10) 亲读）
- **材料**：B2016（7 页）｜**页码**：PDF p1、p2
- **裁片**：`jx2016_p1.png` 1075×1535 / 261674 B / sha256 `e25d4b20ce8c630ea2bf2079cde0c70b9076bc8ac62809147afa97f1971f7248`；`jx2016_p2.png` 174447 B / sha256 `3145b99672623f37862147121dd60ed42cf22172916847dc185bf42f99b781dd`
- **亲读原文**：p1「2016年 数学(三) 参考答案 一、选择题 (1) B …故应选 B. (2) D … (3) B … (4) A …」；p2「(5) C …故应选 C. (6) C …故应选 C. (7) A …故应选 A. (8) C …故应选 C. 二、填空题 (9) 6 …所以 lim f(x) = 6 (10) sin1 − cos1 …= sin1 − cos1.」
- **结论**：2016 一(1) B、(2) D、(3) B、(4) A、(5) C、(6) C、(7) A、(8) C ⇒ **BDBACCAC**；填空 (9) = 6、(10) = sin1 − cos1。
- **置信度**：high

### M3-JX2017-R01（2017 解析册 p1–p2，选择全 8 题 + 填空 (9) 亲读）
- **材料**：B2017（7 页）｜**页码**：PDF p1、p2
- **裁片**：`jx2017_p1.png` 1075×1535 / 173402 B / sha256 `a75c3ad7e553840cf1335c5ab93089055db2a075b753da08d3ce027ef8ec8f69`；`jx2017_p2.png` 181392 B / sha256 `1a6730cb7a3013ebf9d0596fae75bb65dc96b31d2b7ecc6da28f39973f058783`
- **亲读原文**：p1「2017年 数学(三) 参考答案 一、选择题 (1) A …所以 ab = 1/2.故应选 A. (2) D …故应选 D. (3) C …故应选 C. (4) C …故应选 C. (5) A …故应选 A. (6) B」；p2「…故应选 B. (7) C …故应选 C. (8) B …故应选 B. 二、填空题 (9) π³/2」
- **结论**：2017 一(1) A、(2) D、(3) C、(4) C、(5) A、(6) B、(7) C、(8) B ⇒ **ADCCABCB**；填空 (9) = π³/2。
- **置信度**：high

### M3-JX2018-R01（2018 解析册 p1–p2，选择全 8 题 + 填空 (9)–(12) 亲读）
- **材料**：B2018（7 页；**仅 PDF p1 有 875 字文本层，p2 起为扫描**）｜**页码**：PDF p1、p2
- **裁片**：`jx2018_p1.png` 1075×1535 / 187990 B / sha256 `fc7fe14697a39eecb9ceb4b0a67011ae3bff0566be4be2308a7bad02ae775b0e`；`jx2018_p2.png` 233508 B / sha256 `005d82a68e72b25f97376f4f647d7d339219eaa3266cf3337960133a5ff7ce5c`
- **亲读原文**：p1「2018年 数学(三) 参考答案 一、选择题 (1) D …故应选 D. (2) D …排除 B.故应选 D. (3) C …所以 K > M > N.故应选 C. (4) D …故应选 D. (5) A …故应选 A. (6) A」；p2「故应选 A. (7) A …故应选 A. (8) B …故应选 B. 二、填空题 (9) y = 4x − 3 (10) e^x arcsin√(1−e^{2x}) − √(1−e^{2x}) + C (11) C2^x − 5 (12) 2e」
- **结论**：2018 一(1) D、(2) D、(3) C、(4) D、(5) A、(6) A、(7) A、(8) B ⇒ **DDCDAAAB**；填空 (9) y = 4x − 3、(10) e^x·arcsin√(1−e^{2x}) − √(1−e^{2x}) + C、(11) C2^x − 5、(12) 2e。
- **置信度**：high

### M3-JX2019-R01（2019 解析册 p1–p2，选择全 8 题 + 填空 (9)–(11) 亲读）
- **材料**：B2019（7 页；文本层 7096 字，**排版碎裂：题号被讹成 `Cl)`/`CZ)`**）｜**页码**：PDF p1、p2
- **裁片**：`jx2019_p1.png` 1075×1535 / 230681 B / sha256 `9d43eb16683b92400b7cd312eafa3a2d975472c6cf2240b24ffd4590127743e7`；`jx2019_p2.png` 190407 B / sha256 `cd9e9aa3d3fca19be6fb82fa8a01d6f398322066f7afbe89c1b4f413818ee91b`
- **亲读原文**：p1「2019年 数学(三) 参考答案 一、选择题 (1) C …则 k = 3.故应选 C. (2) D …则 −4 < k < 4.故应选 D. (3) D …故应选 D. (4) B …故应选 B. (5) A …故应选 A. (6) C …」；p2「故二次型 xᵀAx 的规范形为 y₁²−y₂²−y₃².故应选 C. (7) C …故应选 C. (8) A …故应选 A. 二、填空题 (9) e^{−1} (10) (π,−2) (11) (1/18)(1−2√2)」
- **结论**：2019 一(1) C、(2) D、(3) D、(4) B、(5) A、(6) C、(7) C、(8) A ⇒ **CDDBACCA**；填空 (9) e^{−1}、(10) (π,−2)、(11) (1/18)(1−2√2)。
- **重要订正**：本项目早期压缩摘要曾记「2019 选择 C A A D B A D B」，其来源是一次被截断的行号 grep，**属错误记录**；以本裁片亲读 + 文本层双通道（`Cl) C` / `CZ) D` / `(3) D` / `(4) B` / `(5) A` / `(6) C`）为准。
- **置信度**：high

## 五、真题册低产页抽样 28 页（PDF 文本层字符数 < 80 的页）

**抽样口径**：我实测真题册 PDF 文本层 `< 80` 字的页共 **38 页**（p1 封面 24 字、p16 = 2019 第 4 页 0 字、p17–p52 = 2018–2010 各年试题页全 0 字）；任务书写的「28 低产页」按另一套统计口径，本文件按 **28 页抽样**执行：p1 + p16 + 2018–2010 各年前三页（2018 p17–19、2017 p21–23、2016 p25–27、2015 p29–31、2014 p33–35、2013 p37–39、2012 p41–43、2011 p45–47、2010 p49–50）＝ 1 + 1 + 26 = **28 页**。
**共同材料与命令**：材料 A；命令模板 `参考文件/_venv/Scripts/python.exe tools/refs-vision.py --pdf "参考文件/真题/数学/5、【1987-2025年】考研数学三真题/3、2010-2022考研数学三真题.pdf" --page ⟨N⟩ --dpi 150 --box 40,40,560,280 --out "backup/scratch/refs-math3/img/low_page_⟨N⟩.png"`（**上部条带**，1084×500 px，裁片目录 `backup/scratch/refs-math3/img/`）；下列 28 条各为一页。

| # | PDF 页 | 裁片 / 字节 | sha256（全 64 位见下注） | 亲读原文（≥20 字） | 结论 | 置信度 |
|---|---|---|---|---|---|---|
| R01 | p1 | `low_page_1.png` / 69511 | `04545fc69863f9ae69812cb7205c6cb138ee33ca0643c87af83021f9b3fef8d6` | 「考研数学」「历年真题汇总」（蓝色引号装饰） | 封面页，无题目；与文本层 24 字一致 | high |
| R02 | p16 | `low_page_16.png` / 39164 | `573fdb3b8245cdeda3ee72b62f5924d3b9191c8e7ec77e67bb1d271f92fd747c` | 「已知矩阵 A=[[−2,−2,1],[2,x,−2],[0,0,−2]] 与 B=[[2,1,0],[0,−1,0],[0,0,y]] 相似.(I) 求 x,y;(II) 求可逆矩阵 P,使得 P⁻¹AP=B.」 | 2019 试题第 4 页（三(21) 题面 + 三(22) 开头），**无页眉年份**，靠内容归属 | high |
| R03 | p17 | `low_page_17.png` / 84657 | `dec9cc75438a4e29ed496d0a36ed2a5e37930ef84e9d5c83fe6cea0ba3d5177a` | 「2018 年全国硕士研究生招生考试试题」「选择题(本题共 8 小题,每小题 4 分,共 32 分)…下列函数中,在 x=0 处不可导的是（）(A)f(x)=|x|sin|x|.(B)f(x)=|x|sin√|x|.(C)f(x)=cos|x|.(D)f(x)=cos√|x|」 | 2018 第 1 页；卷首含年份页眉 | high |
| R04 | p18 | `low_page_18.png` / 76335 | `302e067a32756d17ade26ad0d4d2b37434019e5961b6f6748b6e207f6cfdb21b` | 「填空题(本题共 6 小题,每小题 4 分,共 24 分,把答案填在题中横线上.)曲线 y=x²+2ln x 在其拐点处的切线方程是___」 | 2018 第 2 页（填空 (9) 起） | high |
| R05 | p19 | `low_page_19.png` / 29399 | `3ff4c1403ce68355222a5ce9c9edaabc052d305ae81f22f3f6b84ab54afd5f67` | 「将长为 2l 的铁丝分成三段,依次围成圆、正方形与正三角形,三个图形的面积之和是否存在最小值?若存在,求出最小值.」「(本题满分 10 分) 已知 cos2x − 1/(1+x)² = Σaₙxⁿ(−1<x<1),求 aₙ.」 | 2018 第 3 页（三(17)(18) 题面） | high |
| R06 | p21 | `low_page_21.png` / 72555 | `8dd27c2e9fa487e747bba644ecc14dcf6b631c483474d4630620621496926230` | 「2017 年全国硕士研究生招生考试试题」「若函数 f(x)={(1−cos√x)/(ax), x>0; b, x≤0} 在 x=0 处连续,则（）(A)ab=1/2.(B)ab=−1/2.(C)ab=0.(D)ab=2.」「二元函数 z=xy(3−x−y) 的极值点是（）」 | 2017 第 1 页；与解析册 2017 一(1)=A 相互印证 | high |
| R07 | p22 | `low_page_22.png` / 75782 | `aee39b427931329a11f124b60db33ae8fbf6e2fd160b57b64e04724fd84f0a6b` | 「(9)∫_{−π}^{π}(sin³x+√(π²−x²))dx=___」「(10)差分方程 y_{t+1}−2y_t=2^t 的通解为 y_t=___」「(11)设生产某产品的平均成本 C̄(Q)=1+e^{−Q},则边际成本为___」「(14)设随机变量 X 的概率分布为 P{X=−2}=1/2,P{X=1}=a,P{X=3}=b,若 E(X)=0,则 D(X)=___」 | 2017 第 2 页（填空 (9)–(14) 题面原文） | high |
| R08 | p23 | `low_page_23.png` / 27392 | `555fc60688cd51f21379dd119880f7a7da5f1deacbe354f90ab255c46330050b` | 「求 lim_{n→∞}Σ_{k=1}^n (k/n²)ln(1+k/n).」「(本题满分 10 分) 已知方程 1/ln(1+x) − 1/x = k 在区间 (0,1) 内有实根,确定常数 k 的取值范围.」 | 2017 第 3 页（三(15)(16) 题面） | high |
| R09 | p25 | `low_page_25.png` / 102084 | `4c9578a9df61112e3054adebd52bdb372003f493fda05364a8418e983d0d83c2` | 「2016 年全国硕士研究生招生考试试题」「设函数 f(x) 在(−∞,+∞) 内连续,其导函数的图形如图所示,则（）(A)函数 f(x) 有 2 个极值点,曲线 y=f(x) 有 2 个拐点.…」 | 2016 第 1 页；(1) 答案 B 与解析册一致 | high |
| R10 | p26 | `low_page_26.png` / 78059 | `1e81cd8cc1e6c4a6838c997fa608505fe7f6984d23b611ca9a0d1569d6bf5bc0` | 「(10)设函数 f(u,v) 可微,z=z(x,y) 由方程 (x+1)z−y²=x²f(x−z,y) 确定,则 dz|_(0,1)=___」「(13)设袋中有红、白、黑球各 1 个,从中有放回地取球,每次取 1 个,直到三种颜色的球都取到时停止,则取球次数恰好为 4 的概率为___」 | 2016 第 2 页（填空+解答题起始） | high |
| R11 | p27 | `low_page_27.png` / 32924 | `c7501639d8e18f240fe9f03978ab2939af33ea90fcaf343ee25c036362633f72` | 「设函数 f(x)=∫₀^x |t²−x²|dt(x>0),求 f′(x),并求 f(x) 的最小值.」「设函数 f(x) 连续,且满足 ∫₀^x f(x−t)dt = ∫₀^x (x−t)f(t)dt + e^{−x} −1,求 f(x).」 | 2016 第 3 页（三(16)(17) 题面） | high |
| R12 | p29 | `low_page_29.png` / 90096 | `ebbcbc7dc11bd0652f805cbb01f911844ab0b6c963914189311e218808f1b2c3` | 「2015 年全国硕士研究生招生考试试题」「设 {xₙ} 是数列.下列命题中不正确的是（）(A)若 lim xₙ=a,则 lim x_{2n}=lim x_{2n+1}=a.…(D)若 lim x_{3n}=lim x_{3n+1}=a,则 lim xₙ=a.」 | 2015 第 1 页；(1) 答案 D 与解析册一致 | high |
| R13 | p30 | `low_page_30.png` / 71083 | `da7b01662f98a535d0623a13d42b95c04baa45dc2a1070d648ce62a51d6c5ce1` | 「(C)P(AB) ≤ (P(A)+P(B))/2.」「(8)设总体 X~B(m,θ),X₁,X₂,…,Xₙ 为来自该总体的简单随机样本,X̄ 为样本均值,E[Σ(Xᵢ−X̄)²]=（）」「二、填空题 (9)lim_{x→0} ln(cos x)/x² = ___」 | 2015 第 2 页；(7)=C (8)=B (9)=−1/2 与解析册裁片一致 | high |
| R14 | p31 | `low_page_31.png` / 53230 | `c5ad975645a307362af0ecc3e938a44c81fa01ae8ecc5b5d1790eecfc2616f61` | 「(I)证明定价模型为 p = MC/(1 − 1/η);(II)若该商品的成本函数为 C(Q)=1600+Q²,需求函数为 Q=40−p,试由(I)中的定价模型确定此商品的价格.」 | 2015 第 3 页（三(16) 经济应用题） | high |
| R15 | p33 | `low_page_33.png` / 74664 | `e8503eb3ff627f490af7bd7e87f297df86377ad12336a63b59ccffad902c915d` | 「2014 年全国硕士研究生招生考试试题」「lim_{n→∞}aₙ=a,且 a≠0,则当 n 充分大时有（）(A)|aₙ|>|a|/2.(B)|aₙ|<|a|/2.(C)aₙ>a−1/n.(D)aₙ<a+1/n.」「下列曲线中有渐近线的是（）(A)y=x+sin x.(B)y=x²+sin x.(C)y=x+sin(1/x).(D)y=x²+sin(1/x).」 | 2014 第 1 页；(1)=A (2)=C 与解析册裁片一致 | high |
| R16 | p34 | `low_page_34.png` / 71279 | `37192ce651c29701c6bb626481fa74517e2c3f15d5cc6bbb662ee2c8a92c769e` | 「(12)二次积分 ∫₀¹dy∫_y¹((e^{x²}/x) − e^{y²})dx = ___」「(13)设二次型 f(x₁,x₂,x₃)=x₁²−x₂²+2ax₁x₃+4x₂x₃ 的负惯性指数为 1,则 a 的取值范围是___」「(14)设总体 X 的概率密度为 f(x;θ)={(2x)/(3θ²), θ<x<2θ;0,其他}」 | 2014 第 2 页（填空 (12)–(14) 题面） | high |
| R17 | p35 | `low_page_35.png` / 38422 | `841fb683a99f87b4244bf7a2a219e619881eb17f4035da967baac55d28bc8b94` | 「设函数 f(u) 具有连续导数,且 z=f(e^x cos y) 满足 cos y ∂z/∂x − sin y ∂z/∂y = (4z+e^x cos y)e^x.若 f(0)=0,求 f(u) 的表达式.」「求幂级数 Σ_{n=0}^∞ (n+1)(n+3)xⁿ 的收敛域及和函数.」 | 2014 第 3 页（三(17)(18) 题面） | high |
| R18 | p37 | `low_page_37.png` / 85942 | `888d99aa8a0e8a9e16cff3d8d300bf7a010cd12cf6a509744f872dd347d34f3a` | 「2013 年全国硕士研究生招生考试试题」「当 x→0 时,用「o(x)」表示比 x 高阶的无穷小量,则下列式子中错误的是（）(A)x·o(x²)=o(x³).(B)o(x)·o(x²)=o(x³).(C)o(x²)+o(x²)=o(x²).(D)o(x)+o(x²)=o(x²).」 | 2013 第 1 页；(1)=D (2)=C 与解析册裁片一致 | high |
| R19 | p38 | `low_page_38.png` / 56045 | `64f1845f515399d9b928a60ce828cc726da687184c27af64830e9705849ac571` | 「则 P{X+Y=2} = （）(A)1/12.(B)1/8.(C)1/6.(D)1/2.」「二、填空题 (9)设曲线 y=f(x) 与 y=x²−x 在点(1,0) 处有公共切线,则 lim_{n→∞} n f(n/(n+2)) = ___」 | 2013 第 2 页（(6) 概率表格题 + 填空 (9)） | high |
| R20 | p39 | `low_page_39.png` / 61312 | `b4c351065c9ec482406a550915d0b60164abc501e8dcbc5288c63e98f82e1497` | 「设平面区域 D 由直线 x=3y,y=3x 及 x+y=8 围成,计算 ∬_D x²dxdy.」「设生产某商品的固定成本为 60 000 元,可变成本为 20 元/件,价格函数为 p = 60 − Q/1000」 | 2013 第 3 页（三(16)(17) 题面） | high |
| R21 | p41 | `low_page_41.png` / 75567 | `88e8ba599c5ba5d59e2492c35e60e7a6a1f8ef8c500bf3cfb7abdb8e9b508663` | 「2012 年全国硕士研究生招生考试试题」「曲线 y=(x²+x)/(x²−1) 的渐近线的条数为（）(A)0.(B)1.(C)2.(D)3.」「设函数 f(x)=(e^x−1)(e^{2x}−2)…(e^{nx}−n),其中 n 为正整数,则 f′(0)=（）(A)(−1)^{n−1}(n−1)!.(B)(−1)^n(n−1)!.(C)(−1)^{n−1}n!.(D)(−1)^n n!.」 | 2012 第 1 页；**m3-2012-2 选项原文取证**：(A) 才等于 (−1)^{n−1}(n−1)!，源印 (C) 属源书可疑 | high |
| R22 | p42 | `low_page_42.png` / 69294 | `9aa901467934cb7d6b52c365f56015a5b33d58be0c853a174b4cccb2e416b5f9` | 「(9)lim_{x→π/4}(tan x)^{1/(cos x − sin x)} = ___」「(10)设函数 f(x)={ln√x, x≥1; 2x−1, x<1},y=f(f(x)),则 dy/dx|_{x=e} = ___」「(11)设连续函数 z=f(x,y) 满足 lim_{x→0,y→1}(f(x,y)−2x+y−2)/√(x²+(y−1)²)=0,则 dz|_(0,1)=___」 | 2012 第 2 页（填空 (9)–(11) 题面） | high |
| R23 | p43 | `low_page_43.png` / 49936 | `74bf6896f4c94b32ed3afe864db9c57fa8d2965b490a7668cc90cc15ca9321df` | 「(I)求甲、乙两种产品的总成本函数 C(x,y)(万元);(II)当总产量为 50 件时,甲、乙两种产品的产量各为多少时可使总成本最小?…(III)求总产量为 50 件且总成本最小时甲产品的边际成本,并解释其经济意义.」「证明 x ln((1+x)/(1−x)) + cos x ≥ 1 + x²/2 (−1<x<1).」 | 2012 第 3 页（三(16)(17) 题面） | high |
| R24 | p45 | `low_page_45.png` / 85825 | `437cf240d1e68f9c7ac971b340016d2d80969ab92c96ee165a00738c00f1e075` | 「2011 年全国硕士研究生招生考试试题」「已知当 x→0 时,函数 f(x)=3sin x − sin 3x 与 cx^k 是等价无穷小量,则（）(A)k=1,c=4.(B)k=1,c=−4.(C)k=3,c=4.(D)k=3,c=−4.」「设函数 f(x) 在 x=0 处可导,且 f(0)=0,则 lim_{x→0}(x²f(x) − 2f(x³))/x³ =（）」 | 2011 第 1 页；(1)=C (2)=B (3)=A 与解析册裁片一致 | high |
| R25 | p46 | `low_page_46.png` / 67345 | `f845ab6e66ce7cb5d4ba4ebb867db9f90bf228e634ff8d763673118b94865b30` | 「(A)E(T₁)>E(T₂),D(T₁)>D(T₂).…则对于统计量 T₁=(1/n)ΣXᵢ 和 T₂=(1/(n−1))Σ_{i<n}Xᵢ + (1/n)Xₙ,有（）」「二、填空题 (9)设 f(x)=lim_{t→0} x(1+3t)^{x/t},则 f′(x)=___」 | 2011 第 2 页（(8) 统计量比较题） | high |
| R26 | p47 | `low_page_47.png` / 24141 | `550098acd741faa7d257186f9bb63a64034e46c4ffd28bde42c34fd760846ab2` | 「求不定积分 ∫(arcsin√x + ln x)/√x dx.」「(本题满分 10 分) 证明方程 4arctan x − x + 4π/3 − √3 = 0 恰有两个实根.」 | 2011 第 3 页（三(16)(17) 题面） | high |
| R27 | p49 | `low_page_49.png` / 86164 | `300101c37b3579abf81601d4a532a79a33f47efd79faac07dfdd04000deba5c1` | 「2010 年全国硕士研究生招生考试试题」「若 lim_{x→0}[1/x − (1/x − a)e^x] = 1,则 a 等于（）(A)0.(B)1.(C)2.(D)3.」「设 y₁,y₂ 是一阶线性非齐次微分方程 y′+p(x)y=q(x) 的两个特解,若常数 λ,μ 使 λy₁+μy₂ 是该方程的解,λy₁−μy₂ 是该方程对应的齐次方程的解,则（）」 | 2010 第 1 页；(1)=C (2)=A 与解析册裁片一致 | high |
| R28 | p50 | `low_page_50.png` / 75352 | `d70d2bd65d53e5ce067cdbf9149c0797db9af84bcfb4f3a03374dbdd600d5b49` | 「设随机变量 X 的分布函数 F(x)={…1/2, 0≤x<1; 1−e^{−x}, x≥1},则 P{X=1}=（）(A)0.(B)1/2.(C)1/2−e^{−1}.(D)1−e^{−1}.」「设 f₁(x) 为标准正态分布的概率密度,f₂(x) 为[−1,3] 上均匀分布的概率密度,若 f(x)={a f₁(x), x≤0; b f₂(x), x>0}(a>0,b>0) 为概率密度,则 a,b 应满足（）」 | 2010 第 2 页（(7)(8) 概率题） | high |

**注**：表中 28 条 sha256 均为 64 位全值（`refs-vision.py` 输出原样誊入）；裁片像素一律 1084×500 px（`--box 40,40,560,280`、`--dpi 150`）。**结论汇总**：28 页全部为「真题册排版页」，页眉/页脚给出年份与卷别（p17/p21/p25/p29/p33/p37/p41/p45/p49 为各年卷首），内容与解析册的答案清单**不矛盾**；p1 为封面、p16 无页眉年份（靠题面内容归属 2019 三(21)(22)），是本组唯二的例外。

---

## 六、待裁定批次清单（页码 + 优先级 + 后续批次口径）

### 6.1 口径与本轮已关闭项

一条「待裁定」＝下列三类之一：
- **A 类**：非选择题（填空/解答）**答案未取证** —— 本基线只收录**已由裁片亲读**的项（2015–2019 共 14 项 + 2020/2021/2022 全部），解析册文本层排版碎裂者一律不猜；
- **B 类**：选择题**选项文本未入库**（`options: []`）—— 字母答案已齐，但**题面不得入库**；
- **C 类**：低产页中**尚未实裁**的页（用于确认「低产 = 版面留白」还是「低产 = 缺题」）。

**本轮已关闭**（不再列入下表）：2022 全部 22 题（§一）、2021 全部 22 题（§二）、2020 全部 23 题（§三）、2014/2015/2016 选择题 11 题的字母（§四 `M3-JX2014-R01`/`M3-JX2015-R01`/`M3-JX2016-R01`）、2010–2019 全部 8×10=80 个选择题字母（§四）、低产页 28 页抽样（§五）。

### 6.2 A 类：非选择题答案（**136 条**；A1 = 填空 46 条，A2 = 解答 90 条）

批次 A1（**P0，先做**，46 条 —— 一年只要 1–2 张解析册页即可整年清空填空）：

| 年 | 条数 | 待裁定题号 | 真题册页 | 要裁的解析册页（物理页） |
|---|---|---|---|---|
| 2010 | 6 | 二(9)–(14) | p50 | p3（(9)–(12)）、p4（(13)(14)） |
| 2011 | 6 | 二(9)–(14) | p46 | p4（(9)–(12)）、p5（(13)(14)） |
| 2012 | 6 | 二(9)–(14) | p42 | p4（(9)）、p5（(10)–(14)） |
| 2013 | 6 | 二(9)–(14) | p38 | p4（(9)）、p5（(10)–(14)） |
| 2014 | 6 | 二(9)–(14) | p33–p34 | p2（(9)–(12)）、p3（(13)(14)） |
| 2015 | 2 | 二(13)(14) | p30 | p4 |
| 2016 | 4 | 二(11)–(14) | p26 | p3 |
| 2017 | 5 | 二(10)–(14) | p22 | p3 |
| 2018 | 2 | 二(13)(14) | p18 | p3 |
| 2019 | 3 | 二(12)(13)(14) | p14 | p3 |

批次 A2（**P2，可延后**，90 条 —— 解答题锚点；注意**解答题入库不依赖锚点**，只影响「定论句」字段）：
2010/2011/2012/2013/2014 各 9 条（三(15)–(23)，各自解析册 p3–p12）、2015/2016/2017/2018/2019 各 9 条（三(15)–(23)，各自解析册 p3–p7）。共 10 年 × 9 = **90 条**。

### 6.3 B 类：选项文本未入库的选择题（**80 道 = 2010–2019 各 8 道**；2020–2022 无）

> **已废表（勿用）**：本节初稿曾按 `backup/scratch/refs-math3/ocr-analysis.json`（**本次任务自建的 scratch OCR 解析器**，非交付物）的 `optionMissing` 口径，列出「8 道四选项全空选择题 + 12 道缺 1–3 项选择题」两张表。该口径与交付索引 `docs/refs/math3.json` **不一致**（scratch 解析器读的是真题册 OCR 散文，2020–2022 段本就是死文本，而交付索引那三年是逐题读图回填的），现已删除，以本节下方**权威表**为准。

> **口径更正（2026-10-09 复核）**：交付索引的实际状态（用 `docs/refs/math3.json` 实测）——
> **2020–2022 的 28 道选择题 `options` 逐题齐全**（4 项文本，逐题亲读；`check-index.mjs` 断言「恰 4 个选项 + 选项非空」全过），**这三年无一道属 B 类**；
> **B 类 = 2010–2019 全部 80 道选择题**，其 `options` 为空数组，其中 10 道另有 `options_ocr_unverified`（真题册文本层退化串，如 2012 一(1) 的 `0 / 1 / 2 / 3`，**不可用、不得据以建题**）。
>
> **B 类权威表（按交付索引实测；80 道 = 10 年 × 8 道）**：
>
> | 年 | 题号 | 真题册页 | 备注 |
> |---|---|---|---|
> | 2010 | 一(1)–(8) | p49–p50 | 一(2)(6)(7) 另有退化串 `options_ocr_unverified` |
> | 2011 | 一(1)–(8) | p45–p46 | 1 道有退化串 |
> | 2012 | 一(1)–(8) | p41–p42 | 3 道有退化串；一(5)(7) 文本层选项区整段为空 |
> | 2013 | 一(1)–(8) | p37–p38 | 5 道有退化串 |
> | 2014 | 一(1)–(8) | p33 | 无退化串（真值即空） |
> | 2015 | 一(1)–(8) | p29–p30 | 一(3)(4)(5) 文本层选项区整段为空 |
> | 2016 | 一(1)–(8) | p25 | 一(1) 依赖导函数图形 |
> | 2017 | 一(1)–(8) | p21 | 一(6) 文本层选项区整段为空 |
> | 2018 | 一(1)–(8) | p17 | 一(5) 矩阵块退化 |
> | 2019 | 一(1)–(8) | p13–p16（选择题在 p13） | — |
>
> 裁片口径（每页整页）：`--pdf "参考文件/真题/数学/5、【1987-2025年】考研数学三真题/3、2010-2022考研数学三真题.pdf" --page <上表页> --dpi 150 --out "backup/scratch/refs-vision/refs-math3/Z<年>-p<页>.png"`；2010–2019 卷页为 A4（595.3×841.9 pt → 1240×1754 px），可直接整页读取选项区。**优先级**：P0 = 2014/2016/2017/2018/2019（各仅 1 页即可覆盖全年 8 道），P1 = 2010/2011/2012/2013/2015（跨 2 页）。

### 6.4 C 类：低产页补裁

- §五 已实裁 28 页（`--box 40,40,560,280`），结论「低产 = 版面留白，非缺题」。
- 本轮**追加**实裁 3 页（另一套裁片目录 `backup/scratch/refs-vision/refs-math3/`，由 `make-crops.py` 批次 B5 生成，命令 `--box 0,0,595.3,841.9 --dpi 150` → 1240×1754 px；sha256 为本轮实测全值）：
  - `Z2020-p12.png`（55422 B，sha256 `8ed3b9627ff8764690abb2af1b881ba05dc8905fbd50f83db2bf84163e02f8f9`）＝真题册 p12（2020 第 3 页）。亲读原文：「(II) 求 Z₁ 与 Z₂ 的相关系数. (23) 设某种元件的使用寿命 T 的分布函数为 F(t) = 1 − e^{−(t/θ)^m}, t ≥ 0, 其中 θ, m 为参数且均大于零. (I) 求概率 P{T>t} 与 P{T>s+t | T>s}…」→ 该页在 PDF 文本层近乎空白、却印有完整两题，**实证「低产 = 版心留白，非缺页」**。
  - `Z2014-p36.png`（103020 B，sha256 `f4b6d2b3f121e5a94bc9e17c9b4c27cdfdf3cf0f3706fbbc3234ee1c763eedd5`）＝真题册 p36（2014 第 4 页）。亲读原文：「(21)（本题满分 11 分）证明 n 阶矩阵 [1 1 … 1; 1 1 … 1; ⋮; 1 1 … 1] 与 [0 … 0 1; 0 … 0 2; ⋮; 0 … 0 n] 相似.」「(22) 设随机变量 X 的概率分布为 P{X=1}=P{X=2}=1/2…」→ 2014 三(21)–(23) 题面完整。
  - `Z2012-p44.png`（109496 B，sha256 `dbe71b1a65d6c02cafaaed90a29355f945c1cfbe7e6dbb7fa29555f2638b268d`）＝真题册 p44（2012 第 4 页），同为解答题末页，页面完整。
- 剩余未实裁的低产页（真题册 p32/p34/p35/p39/p40/p43/p47/p48/p51/p52 等）：**P2**，仅需确认版式，可按批一次裁完（每页 1240×1754 px，`--box 0,0,595.3,841.9`）。

### 6.5 后续批次口径（照此执行即可）

1. **批次划分**：`P0 = A1（46 条填空答案）+ B 类单页可覆盖的年份（2014/2016/2017/2018/2019，各 1 页 = 全年 8 道选项）`；`P1 = B 类跨 2 页的年份（2010/2011/2012/2013/2015）+ A2 的 2017–2019 部分`；`P2 = A2 其余解答锚点 + C 类剩余低产页`。
2. **裁片命令**（每年解析册页尺寸不同，须按年标定；公式见 `docs/refs/README.md` §2）：
   `参考文件/_venv/Scripts/python.exe tools/refs-vision.py --pdf "参考文件\真题\数学\6、【1987-2025年】考研数学三真题答案及解析\<年>年数学三真题答案解析.pdf" --page <页> --dpi 150 --box 0,0,<宽>,<高>`
   真题册整页示例：`--pdf "参考文件\真题\数学\5、【1987-2025年】考研数学三真题\3、2010-2022考研数学三真题.pdf" --page 49 --dpi 150 --box 0,0,595.3,841.9`（595.3×841.9 pt → 1240×1754 px）。
3. **取证要求**：每条裁定仍按 `docs/refs/README.md` §3 七字段书写（材料｜页码｜生成命令｜裁片路径+像素+字节+sha256｜亲读原文 ≥20 字｜结论｜置信度），**只认自带 `read_image` 亲读，禁用 modlens**。
4. **回填位置**：答案回填到 `backup/scratch/refs-math3/index-<年>.json` 的对应题（填空 → `answer_value_verified`；解答 → 锚点字段），重跑 `build-docs.py` → `check-index.mjs`（必须 exit 0）。
5. **验收**：A1 清空后可把 `math3.md` §5「可入库清单」由 161 条推到 ~207 条；B 类（2010–2019 的 80 道选择题选项）回填后可让这 80 道的**题面**入库（字母答案本就已齐）。