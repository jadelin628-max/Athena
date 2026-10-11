# 数学三非选择题答案亲读裁定（2010–2019 · T138 / t70）

> 口径：**文本层只用于定位，答案一律以解析册裁片亲读为准**；每条同时给出「题面源页」与「答案源页」，
> 并与独立复算对拍。裁片不入库（`backup/` 被 `.gitignore` 整目录忽略），凭「等效命令 + sha256」可重建。
> 覆盖 136/136 条（填空 46 + 解答 90），
> 口径与 `docs/refs/README.md` §3 七字段一致。生成：`node backup/scratch/refs-math3-ans/build-answers.mjs`（幂等）。

## 1. 汇总

- 覆盖：**136/136**（填空 46 + 解答 90），未裁定 0 条；
- 三源一致：all = 136、partial = 0、none = 0；
- 置信度：high = 136、medium = 0、low = 0；
- 裁片：62 张（计划内 59 页 + 计划外补渲 31 张），全部 ≤1400 px / ≤400 KB；
- 并入答案清单后 `docs/refs/math3.json` → `answer_manifest` 就绪量 **297 → 433** 条；
- 源书与独立复算不一致：`m3-2012-17`（逐条见 §4）

## 2. 逐年索引

| 年 | 计划条数 | 已亲读 | 填空 | 解答 | 涉及答案页 | 未裁定 |
| --- | --- | --- | --- | --- | --- | --- |
| 2010 | 15 | 15 | 6 | 9 | 7 | 0 |
| 2011 | 15 | 15 | 6 | 9 | 8 | 0 |
| 2012 | 15 | 15 | 6 | 9 | 10 | 0 |
| 2013 | 15 | 15 | 6 | 9 | 7 | 0 |
| 2014 | 15 | 15 | 6 | 9 | 6 | 0 |
| 2015 | 11 | 11 | 2 | 9 | 4 | 0 |
| 2016 | 13 | 13 | 4 | 9 | 5 | 0 |
| 2017 | 14 | 14 | 5 | 9 | 5 | 0 |
| 2018 | 11 | 11 | 2 | 9 | 5 | 0 |
| 2019 | 12 | 12 | 3 | 9 | 5 | 0 |

### 2.1 逐题答案表（136 条）

| id | 年 | 题号 | 题型 | 答案（亲读） | 答案源页 | 三源 | 置信度 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `m3-2010-10` | 2010 | 二(10) | 填空 | $\dfrac{\pi^2}{4}$ | p3 | all | high |
| `m3-2010-11` | 2010 | 二(11) | 填空 | $p\cdot e^{\frac13(p^3-1)}$ | p3 | all | high |
| `m3-2010-12` | 2010 | 二(12) | 填空 | $b=3$ | p3 | all | high |
| `m3-2010-13` | 2010 | 二(13) | 填空 | $3$ | p4 | all | high |
| `m3-2010-14` | 2010 | 二(14) | 填空 | $\sigma^2+\mu^2$ | p4 | all | high |
| `m3-2010-15` | 2010 | 三(15) | 解答 | $e^{-1}$ | p4 | all | high |
| `m3-2010-16` | 2010 | 三(16) | 解答 | $\dfrac{14}{15}$ | p4 | all | high |
| `m3-2010-17` | 2010 | 三(17) | 解答 | $u_{\max}=5\sqrt5$，$u_{\min}=-5\sqrt5$ | p4 | all | high |
| `m3-2010-18` | 2010 | 三(18) | 解答 | $\lim\limits_{n\to\infty}u_n=0$ | p5 | all | high |
| `m3-2010-19` | 2010 | 三(19) | 解答 | 证明题（存在 $\xi\in(0,3)$ 使 $f''(\xi)=0$） | p5 | all | high |
| `m3-2010-20` | 2010 | 三(20) | 解答 | $\lambda=-1$，$a=-2$ | p6 | all | high |
| `m3-2010-21` | 2010 | 三(21) | 解答 | $a=-1$（$A$ 的特征值 $2,-4,5$） | p7 | all | high |
| `m3-2010-22` | 2010 | 三(22) | 解答 | $A=\pi^{-1}$，$f_X(x)=\frac{1}{\sqrt\pi}e^{-x^2}$，$f_{Y\|X}(y\|x)=\frac{1}{\sqrt\pi}e^{-(x-y)^2}$ | p8 | all | high |
| `m3-2010-23` | 2010 | 三(23) | 解答 | 联合分布如上；$\mathrm{Cov}(X,Y)=-\frac{4}{45}$ | p9 | all | high |
| `m3-2010-9` | 2010 | 二(9) | 填空 | $-1$ | p3 | all | high |
| `m3-2011-10` | 2011 | 二(10) | 填空 | $(1+2\ln 2)(\mathrm dx-\mathrm dy)$ | p4 | all | high |
| `m3-2011-11` | 2011 | 二(11) | 填空 | $y=-2x$ | p4 | all | high |
| `m3-2011-12` | 2011 | 二(12) | 填空 | $\dfrac{4}{3}\pi$ | p4 | all | high |
| `m3-2011-13` | 2011 | 二(13) | 填空 | $3y_1^2$ | p5 | all | high |
| `m3-2011-14` | 2011 | 二(14) | 填空 | $\mu(\mu^2+\sigma^2)$ | p5 | all | high |
| `m3-2011-15` | 2011 | 三(15) | 解答 | $-\dfrac12$ | p5 | all | high |
| `m3-2011-16` | 2011 | 三(16) | 解答 | $\frac{\partial^2z}{\partial x\partial y}\big\|_{(1,1)}=f_{11}''(2,2)+f_2'(2,2)f_{12}''(1,1)$ | p6 | all | high |
| `m3-2011-17` | 2011 | 三(17) | 解答 | $2\sqrt x\arcsin\sqrt x+2\sqrt x\ln x+2\sqrt{1-x}-4\sqrt x+C$ | p6 | all | high |
| `m3-2011-18` | 2011 | 三(18) | 解答 | 方程 $4\arctan x-x+\frac{4\pi}{3}-\sqrt3=0$ 恰有两个实根 | p7 | all | high |
| `m3-2011-19` | 2011 | 三(19) | 解答 | $f(x)=\dfrac{4}{(x-2)^2}$（$0\le x\le1$） | p7 | all | high |
| `m3-2011-20` | 2011 | 三(20) | 解答 | $a=5$；$\beta_1=2\alpha_1+4\alpha_2-\alpha_3$，$\beta_2=\alpha_1+2\alpha_2$，$\beta_3=5\alpha_1+10\alpha_2-2\alpha_3$ | p8 | all | high |
| `m3-2011-21` | 2011 | 三(21) | 解答 | $\lambda_1=-1,\lambda_2=1,\lambda_3=0$；$Q=(\beta_1,\beta_2,\beta_3)$，$A=\begin{pmatrix}0&0&1\\0&0&0\\1&0&0\end{pmatrix}$ | p9 | all | high |
| `m3-2011-22` | 2011 | 三(22) | 解答 | 联合分布三格各 $\frac13$；$Z=XY$ 分布三值各 $\frac13$；$\rho_{XY}=0$ | p10 | all | high |
| `m3-2011-23` | 2011 | 三(23) | 解答 | $f_X(x)=x\,(0<x<1)$、$2-x\,(1\le x<2)$；$f_Y(y)=2-2y\,(0<y<1)$；$f_{X\|Y}(x\|y)=\dfrac{1}{2-2y}\,(y<x<2-y)$ | p11 | all | high |
| `m3-2011-9` | 2011 | 二(9) | 填空 | $e^{3x}(1+3x)$ | p4 | all | high |
| `m3-2012-10` | 2012 | 二(10) | 填空 | $4$ | p5 | all | high |
| `m3-2012-11` | 2012 | 二(11) | 填空 | $2\mathrm dx-\mathrm dy$ | p5 | all | high |
| `m3-2012-12` | 2012 | 二(12) | 填空 | $4\ln2$ | p5 | all | high |
| `m3-2012-13` | 2012 | 二(13) | 填空 | $-27$ | p5 | all | high |
| `m3-2012-14` | 2012 | 二(14) | 填空 | $\dfrac34$ | p5 | all | high |
| `m3-2012-15` | 2012 | 三(15) | 解答 | $\dfrac{1}{12}$ | p6 | all | high |
| `m3-2012-16` | 2012 | 三(16) | 解答 | $\dfrac12$ | p7 | all | high |
| `m3-2012-17` | 2012 | 三(17) | 解答 | $C(x,y)=20x+\dfrac{x^2}{4}+6y+\dfrac{y^2}{2}+10000$；$x=24,y=26$ 时 $C_{\min}=11118$；边际成本 $C_x'(24,26)=32$（万元/件） | p8 | all | high |
| `m3-2012-18` | 2012 | 三(18) | 解答 | 证明 $x\ln\dfrac{1+x}{1-x}+\cos x\ge1+\dfrac{x^2}{2}$（$-1<x<1$） | p8 | all | high |
| `m3-2012-19` | 2012 | 三(19) | 解答 | $f(x)=e^x$；曲线 $y=f(x^2)\int_0^xe^{-t^2}dt$ 的唯一拐点为 $(0,0)$ | p9 | all | high |
| `m3-2012-20` | 2012 | 三(20) | 解答 | $\|A\|=1-a^4$；$a=-1$；通解 $x=k(1,1,1,1)^T+(0,-1,0,0)^T$ | p10 | all | high |
| `m3-2012-21` | 2012 | 三(21) | 解答 | $a=-1$；$f=2x_1^2+2x_2^2+4x_3^2+4x_1x_2+4x_2x_3$，矩阵 $B=\begin{pmatrix}2&0&2\\0&2&2\\2&2&4\end{pmatrix}$，特征值 $0,2,6$，标准形 $2y_2^2+6y_3^2$，$Q=(\alpha_1,\alpha_2,\alpha_3)$ | p11 | all | high |
| `m3-2012-22` | 2012 | 三(22) | 解答 | $P\{X=2Y\}=\dfrac14$；$\mathrm{cov}(X-Y,Y)=-\dfrac23$，$\rho_{XY}=0$ | p12 | all | high |
| `m3-2012-23` | 2012 | 三(23) | 解答 | $f_V(v)=2e^{-2v}\,(v>0)$；$E(U+V)=2$ | p13 | all | high |
| `m3-2012-9` | 2012 | 二(9) | 填空 | $e^{-\sqrt2}$ | p4 | all | high |
| `m3-2013-10` | 2013 | 二(10) | 填空 | $2-2\ln 2$ | p5 | all | high |
| `m3-2013-11` | 2013 | 二(11) | 填空 | $\ln 2$ | p5 | all | high |
| `m3-2013-12` | 2013 | 二(12) | 填空 | $e^{\frac x2}(C_1x+C_2)$ | p5 | all | high |
| `m3-2013-13` | 2013 | 二(13) | 填空 | $-1$ | p5 | all | high |
| `m3-2013-14` | 2013 | 二(14) | 填空 | $2e^2$ | p5 | all | high |
| `m3-2013-15` | 2013 | 三(15) | 解答 | $n=2$，$a=7$ | p6 | all | high |
| `m3-2013-16` | 2013 | 三(16) | 解答 | $a=7\sqrt{7}$ | p6 | all | high |
| `m3-2013-17` | 2013 | 三(17) | 解答 | $\dfrac{416}{3}$ | p7 | all | high |
| `m3-2013-18` | 2013 | 三(18) | 解答 | $I=40Q-\dfrac{Q^2}{1000}-6000$，边际利润 $I'=40-\dfrac{Q}{500}$；$P=50$ 时边际利润为 20；利润最大的定价 $P=40$ | p7 | all | high |
| `m3-2013-19` | 2013 | 三(19) | 解答 | 证明：(Ⅰ) 存在 $a>0$ 使 $f(a)=1$；(Ⅱ) 对 (Ⅰ) 中的 $a$ 存在 $\xi\in(0,a)$ 使 $f'(\xi)=\dfrac1a$ | p7 | all | high |
| `m3-2013-20` | 2013 | 三(20) | 解答 | $a=-1$，$b=0$；$C=\begin{pmatrix}k_1+k_2+1&-k_1\\k_1&k_2\end{pmatrix}$（$k_1,k_2$ 任意） | p8 | all | high |
| `m3-2013-21` | 2013 | 三(21) | 解答 | (Ⅰ) $f$ 的矩阵为 $2\alpha\alpha^T+\beta\beta^T$；(Ⅱ) 正交变换下标准形为 $2y_1^2+y_2^2$ | p9 | all | high |
| `m3-2013-22` | 2013 | 三(22) | 解答 | $f(x,y)=\dfrac{9y^2}{x}$（$0<x<1,\,0<y<x$）；$f_Y(y)=-9y^2\ln y$（$0<y<1$） | p9 | all | high |
| `m3-2013-23` | 2013 | 三(23) | 解答 | 矩估计 $\hat\theta=\bar X$；最大似然估计 $\hat\theta=\dfrac{2n}{\sum_{i=1}^n\frac{1}{x_i}}$ | p10 | all | high |
| `m3-2013-9` | 2013 | 二(9) | 填空 | $-2$ | p4 | all | high |
| `m3-2014-10` | 2014 | 二(10) | 填空 | $\dfrac32-\ln 2$ | p2 | all | high |
| `m3-2014-11` | 2014 | 二(11) | 填空 | $a=\dfrac12$ | p2 | all | high |
| `m3-2014-12` | 2014 | 二(12) | 填空 | $\dfrac{e-1}{2}$ | p2 | all | high |
| `m3-2014-13` | 2014 | 二(13) | 填空 | $[-2,2]$ | p3 | all | high |
| `m3-2014-14` | 2014 | 二(14) | 填空 | $\dfrac{2}{5n}$ | p3 | all | high |
| `m3-2014-15` | 2014 | 三(15) | 解答 | $\dfrac12$ | p3 | all | high |
| `m3-2014-16` | 2014 | 三(16) | 解答 | $-\dfrac34$ | p4 | all | high |
| `m3-2014-17` | 2014 | 三(17) | 解答 | $f(u)=\dfrac{1}{16}(e^{4u}-4u-1)$ | p4 | all | high |
| `m3-2014-18` | 2014 | 三(18) | 解答 | 收敛域 $(-1,1)$；$S(x)=\dfrac{3-x}{(1-x)^3}$ | p4 | all | high |
| `m3-2014-19` | 2014 | 三(19) | 解答 | 证明：(Ⅰ) $0\le\int_a^xg(t)dt\le x-a$；(Ⅱ) $\int_a^{a+\int_a^bg(t)dt}f(x)dx\le\int_a^bf(x)g(x)dx$ | p5 | all | high |
| `m3-2014-20` | 2014 | 三(20) | 解答 | $\alpha=(-1,2,3,1)^T$；$B=\begin{pmatrix}2&6&-1\\-1&-3&1\\-1&-4&1\\0&0&0\end{pmatrix}+(k_1\alpha,k_2\alpha,k_3\alpha)$（$k_i$ 任意） | p5 | all | high |
| `m3-2014-21` | 2014 | 三(21) | 解答 | 证明 $A$ 与 $B$ 相似：$\|\lambda E-A\|=\|\lambda E-B\|=(\lambda-n)\lambda^{n-1}$ | p6 | all | high |
| `m3-2014-22` | 2014 | 三(22) | 解答 | $F_Y(y)=\begin{cases}0,&y<0\\\frac{3y}{4},&0\le y<1\\\frac12+\frac y4,&1\le y<2\\1,&y\ge2\end{cases}$；$f_Y(y)=\frac34\,(0<y<1),\ \frac14\,(1\le y<2)$；$EY=\frac34$ | p6 | all | high |
| `m3-2014-23` | 2014 | 三(23) | 解答 | 联合分布 $\frac29,\frac19$ / $\frac19,\frac59$；$P\{X+Y\le1\}=\frac49$ | p7 | all | high |
| `m3-2014-9` | 2014 | 二(9) | 填空 | $20-Q$ | p2 | all | high |
| `m3-2015-13` | 2015 | 二(13) | 填空 | $21$ | p4 | all | high |
| `m3-2015-14` | 2015 | 二(14) | 填空 | $\dfrac12$ | p4 | all | high |
| `m3-2015-15` | 2015 | 三(15) | 解答 | $a=-1,\ b=-\dfrac12,\ k=-\dfrac13$ | p4 | all | high |
| `m3-2015-16` | 2015 | 三(16) | 解答 | $\dfrac{\pi}{4}-\dfrac25$ | p4 | all | high |
| `m3-2015-17` | 2015 | 三(17) | 解答 | （Ⅰ）$MR=p\left(1-\dfrac1\eta\right)$，定价模型 $p=\dfrac{MC}{1-\dfrac1\eta}$；（Ⅱ）$p=30$ | p5 | all | high |
| `m3-2015-18` | 2015 | 三(18) | 解答 | $f(x)=\dfrac{8}{4-x},\ x\in I$ | p5 | all | high |
| `m3-2015-19` | 2015 | 三(19) | 解答 | 证明：$[u(x)v(x)]'=u'v+uv'$；$(u_1u_2\cdots u_n)'=\sum_i u_1\cdots u_i'\cdots u_n$ | p5 | all | high |
| `m3-2015-20` | 2015 | 三(20) | 解答 | $a=0$；$X=\begin{pmatrix}3&1&-2\\1&1&-1\\2&1&-1\end{pmatrix}$ | p6 | all | high |
| `m3-2015-21` | 2015 | 三(21) | 解答 | $a=4,\ b=5$；$P=\begin{pmatrix}2&-3&-1\\1&0&-1\\0&1&1\end{pmatrix}$，$P^{-1}AP=\begin{pmatrix}1&&\\&1&\\&&5\end{pmatrix}$ | p6 | all | high |
| `m3-2015-22` | 2015 | 三(22) | 解答 | $P\{Y=k\}=(k-1)\left(\dfrac78\right)^{k-2}\left(\dfrac18\right)^2\ (k=2,3,\cdots)$；$EY=16$ | p7 | all | high |
| `m3-2015-23` | 2015 | 三(23) | 解答 | $\hat\theta=2\bar X-1$；$\hat\theta=\min\{X_1,\cdots,X_n\}$ | p7 | all | high |
| `m3-2016-11` | 2016 | 二(11) | 填空 | $-\mathrm dx+2\mathrm dy$ | p3 | all | high |
| `m3-2016-12` | 2016 | 二(12) | 填空 | $\dfrac13-\dfrac{2}{3e}$ | p3 | all | high |
| `m3-2016-13` | 2016 | 二(13) | 填空 | $\lambda^4+\lambda^3+2\lambda^2+3\lambda+4$ | p3 | all | high |
| `m3-2016-14` | 2016 | 二(14) | 填空 | $\dfrac29$ | p3 | all | high |
| `m3-2016-15` | 2016 | 三(15) | 解答 | $e^{\frac13}$ | p3 | all | high |
| `m3-2016-16` | 2016 | 三(16) | 解答 | （Ⅰ）$Q=1200-10p$；（Ⅱ）$R'(Q)=120-\dfrac15Q$，$p=100$ 时边际收益 $R'(200)=80$（销售第 201 件商品所得收益 80 万元） | p4 | all | high |
| `m3-2016-17` | 2016 | 三(17) | 解答 | $f(x)=\begin{cases}\frac43x^3-x^2+\frac13,&0<x\le1\\x^2-\frac13,&x>1\end{cases}$；最小值为 $f\left(\frac12\right)=\frac14$ | p4 | all | high |
| `m3-2016-18` | 2016 | 三(18) | 解答 | $f(x)=-\dfrac12\left(e^x+e^{-x}\right)$ | p4 | all | high |
| `m3-2016-19` | 2016 | 三(19) | 解答 | 收敛域 $[-1,1]$；$f(x)=(1+x)\ln(1+x)+(1-x)\ln(1-x)$（$-1<x<1$），$f(\pm1)=2\ln2$ | p4 | all | high |
| `m3-2016-20` | 2016 | 三(20) | 解答 | $a=0$；通解 $x=\begin{pmatrix}1\\-2\\0\end{pmatrix}+k\begin{pmatrix}0\\-1\\1\end{pmatrix}$（$k$ 任意常数） | p5 | all | high |
| `m3-2016-21` | 2016 | 三(21) | 解答 | 特征值 $-1,-2,0$；$P=\begin{pmatrix}1&1&3\\1&2&2\\0&0&2\end{pmatrix}$，$P^{-1}AP=\mathrm{diag}(-1,-2,0)$；$A^{99}=\begin{pmatrix}2^{99}-2&1-2^{99}&2-2^{98}\\2^{100}-2&1-2^{100}&2-2^{99}\\0&0&0\end{pmatrix}$；$B^{100}=BA^{99}$，$\beta_1=(2^{99}-2)\alpha_1+(2^{100}-2)\alpha_2$、$\beta_2=(1-2^{99})\alpha_1+(1-2^{100})\alpha_2$、$\beta_3=(2-2^{98})\alpha_1+(2-2^{99})\alpha_2$ | p5 | all | high |
| `m3-2016-22` | 2016 | 三(22) | 解答 | （Ⅰ）$f(x,y)=3$（$(x,y)\in D$）；（Ⅱ）$U$ 与 $X$ 不相互独立；（Ⅲ）$F(z)=\begin{cases}0,&z<0\\\frac32z^2-z^3,&0\le z<1\\\frac12+2(z-1)^{\frac32}-\frac32(z-1)^2,&1\le z<2\\1,&z\ge2\end{cases}$ | p6 | all | high |
| `m3-2016-23` | 2016 | 三(23) | 解答 | $f_T(z)=\dfrac{9z^8}{\theta^9}$（$0<z<\theta$）；$E(T)=\dfrac9{10}\theta$，$a=\dfrac{10}{9}$ | p7 | all | high |
| `m3-2017-10` | 2017 | 二(10) | 填空 | $A2^t+t2^{t-1}$ | p3 | all | high |
| `m3-2017-11` | 2017 | 二(11) | 填空 | $1+(1-Q)e^{-Q}$ | p3 | all | high |
| `m3-2017-12` | 2017 | 二(12) | 填空 | $xye^{y}$ | p3 | all | high |
| `m3-2017-13` | 2017 | 二(13) | 填空 | $2$ | p3 | all | high |
| `m3-2017-14` | 2017 | 二(14) | 填空 | $\dfrac92$ | p3 | all | high |
| `m3-2017-15` | 2017 | 三(15) | 解答 | $\dfrac23$ | p4 | all | high |
| `m3-2017-16` | 2017 | 三(16) | 解答 | $\dfrac{(2-\sqrt2)\pi}{16}$ | p4 | all | high |
| `m3-2017-17` | 2017 | 三(17) | 解答 | $\dfrac14$ | p4 | all | high |
| `m3-2017-18` | 2017 | 三(18) | 解答 | $k$ 的取值范围为 $\left(\dfrac1{\ln 2}-1,\ \dfrac12\right)$ | p5 | all | high |
| `m3-2017-19` | 2017 | 三(19) | 解答 | （Ⅰ）$R\ge1$，幂级数在 $(-1,1)$ 内绝对收敛；（Ⅱ）$S(x)=\dfrac{e^{-x}}{1-x}$ | p5 | all | high |
| `m3-2017-20` | 2017 | 三(20) | 解答 | $r(A)=2$；$Ax=\beta$ 的通解 $x=\begin{pmatrix}1\\1\\1\end{pmatrix}+k\begin{pmatrix}1\\2\\-1\end{pmatrix}$（$k$ 任意常数） | p5 | all | high |
| `m3-2017-21` | 2017 | 三(21) | 解答 | $a=2$；特征值 $-3,6,0$；正交矩阵 $Q=(\beta_1,\beta_2,\beta_3)=\begin{pmatrix}\frac1{\sqrt3}&-\frac1{\sqrt2}&\frac1{\sqrt6}\\-\frac1{\sqrt3}&0&\frac2{\sqrt6}\\\frac1{\sqrt3}&\frac1{\sqrt2}&\frac1{\sqrt6}\end{pmatrix}$ | p6 | all | high |
| `m3-2017-22` | 2017 | 三(22) | 解答 | （Ⅰ）$EY=\dfrac23$，$P\{Y\le EY\}=\dfrac49$；（Ⅱ）$f_Z(z)=\begin{cases}z,&0<z<1\\z-2,&2<z<3\\0,&其他\end{cases}$ | p6 | all | high |
| `m3-2017-23` | 2017 | 三(23) | 解答 | （Ⅰ）$f(z)=\begin{cases}\frac{2}{\sqrt{2\pi}\sigma}e^{-\frac{z^2}{2\sigma^2}},&z\ge0\\0,&z<0\end{cases}$；（Ⅱ）矩估计 $\hat\sigma=\frac{\sqrt{2\pi}}2\bar Z$；（Ⅲ）最大似然估计 $\hat\sigma=\sqrt{\frac1n\sum_{i=1}^nZ_i^2}$ | p7 | all | high |
| `m3-2018-13` | 2018 | 二(13) | 填空 | $2$ | p3 | all | high |
| `m3-2018-14` | 2018 | 二(14) | 填空 | $\dfrac13$ | p3 | all | high |
| `m3-2018-15` | 2018 | 三(15) | 解答 | $a=1,\ b=1$ | p3 | all | high |
| `m3-2018-16` | 2018 | 三(16) | 解答 | $\dfrac{\sqrt3}{16}\left(\dfrac{\pi}{2}-1\right)$ | p3 | all | high |
| `m3-2018-17` | 2018 | 三(17) | 解答 | $x_0=\dfrac1{\pi+4+3\sqrt3}$，$y_0=\dfrac2{\pi+4+3\sqrt3}$，$z_0=\dfrac{2\sqrt3}{\pi+4+3\sqrt3}$；最小值 $\dfrac1{\pi+4+3\sqrt3}$ | p4 | all | high |
| `m3-2018-18` | 2018 | 三(18) | 解答 | $a_{2n}=\dfrac{(-1)^n4^n}{(2n)!}-2n-1$，$a_{2n+1}=2n+2$（$n=0,1,2,\cdots$） | p4 | all | high |
| `m3-2018-19` | 2018 | 三(19) | 解答 | 证明 $\{x_n\}$ 单调减少且有下界，从而 $\lim\limits_{n\to\infty}x_n=0$ | p5 | all | high |
| `m3-2018-20` | 2018 | 三(20) | 解答 | $a\ne2$ 时 $f=0$ 只有零解 $x=0$，$f$ 正定，规范形 $y_1^2+y_2^2+y_3^2$；$a=2$ 时通解 $x=k(-2,-1,1)^{\mathrm T}$，规范形 $y_1^2+y_2^2$ | p5 | all | high |
| `m3-2018-21` | 2018 | 三(21) | 解答 | $a=2$；$X=\begin{pmatrix}3-6k_1&4-6k_2&4-6k_3\\-1+2k_1&-1+2k_2&-1+2k_3\\k_1&k_2&k_3\end{pmatrix}$；满足 $AP=B$ 的可逆矩阵 $P$ 需 $k_2\ne k_3$（$\|X\|=k_3-k_2$） | p6 | all | high |
| `m3-2018-22` | 2018 | 三(22) | 解答 | （Ⅰ）$EX=0$，$\mathrm{Cov}(X,Z)=\lambda$；（Ⅱ）$P\{Z=n\}=\dfrac{e^{-\lambda}\lambda^{\|n\|}}{2\|n\|!}$（$n=\pm1,\pm2,\cdots$），$P\{Z=0\}=e^{-\lambda}$ | p6 | all | high |
| `m3-2018-23` | 2018 | 三(23) | 解答 | $\hat\sigma=\dfrac1n\sum\limits_{i=1}^n\|X_i\|$；$E\hat\sigma=\sigma$，$D\hat\sigma=\dfrac{\sigma^2}{n}$ | p7 | all | high |
| `m3-2019-12` | 2019 | 二(12) | 填空 | $0.4$ | p3 | all | high |
| `m3-2019-13` | 2019 | 二(13) | 填空 | $1$ | p3 | all | high |
| `m3-2019-14` | 2019 | 二(14) | 填空 | $\dfrac23$ | p3 | all | high |
| `m3-2019-15` | 2019 | 三(15) | 解答 | $f'(x)=\begin{cases}2x^{2x}(\ln x+1),&x>0\\e^x(x+1),&x<0\end{cases}$，$f'(0)$ 不存在；极小值 $f(-1)=1-\frac1e$、$f\left(\frac1e\right)=e^{-\frac2e}$；极大值 $f(0)=1$ | p3 | all | high |
| `m3-2019-16` | 2019 | 三(16) | 解答 | $\dfrac{\partial^2g}{\partial x^2}+\dfrac{\partial^2g}{\partial x\partial y}+\dfrac{\partial^2g}{\partial y^2}=1-3f_{uu}(x+y,x-y)-f_{vv}(x+y,x-y)$ | p4 | all | high |
| `m3-2019-17` | 2019 | 三(17) | 解答 | （Ⅰ）$y(x)=\sqrt x\,e^{\frac{x^2}2}$；（Ⅱ）$V=\frac{\pi}{2}(e^4-e)$ | p4 | all | high |
| `m3-2019-18` | 2019 | 三(18) | 解答 | $S=\dfrac{e^{\pi}+1}{2(e^{\pi}-1)}$ | p4 | all | high |
| `m3-2019-19` | 2019 | 三(19) | 解答 | （Ⅰ）$\{a_n\}$ 单调减少，且 $a_n=\dfrac{n-1}{n+2}a_{n-2}\ (n\ge2)$；（Ⅱ）$\lim\limits_{n\to\infty}\dfrac{a_n}{a_{n-1}}=1$ | p5 | all | high |
| `m3-2019-20` | 2019 | 三(20) | 解答 | 当 $a\ne-1$ 时两向量组可相互线性表示；$a\ne1$ 时 $\beta_3=\alpha_1-\alpha_2+\alpha_3$；$a=1$ 时 $\beta_3=(3-2k)\alpha_1+(k-2)\alpha_2+k\alpha_3\ (k\in\mathbf R)$ | p5 | all | high |
| `m3-2019-21` | 2019 | 三(21) | 解答 | $x=3,\ y=-2$；特征值 $2,-1,-2$；$P=\begin{pmatrix}1&1&1\\-2&-1&-2\\0&0&-4\end{pmatrix}$，$P^{-1}AP=B$ | p6 | all | high |
| `m3-2019-22` | 2019 | 三(22) | 解答 | （Ⅰ）$f_Z(z)=\begin{cases}pe^z,&z<0\\(1-p)e^{-z},&z\ge0\end{cases}$；（Ⅱ）$\mathrm{Cov}(X,Z)=1-2p$，$p=\frac12$ 时 $X$ 与 $Z$ 不相关；（Ⅲ）$X$ 与 $Z$ 不相互独立 | p6 | all | high |
| `m3-2019-23` | 2019 | 三(23) | 解答 | （Ⅰ）$A=\sqrt{\frac2\pi}$；（Ⅱ）$\hat\sigma^2=\frac1n\sum\limits_{i=1}^n(X_i-\mu)^2$ | p7 | all | high |

## 3. 裁定明细（七字段）

### m3-2010-10 ｜ 二(10) ｜ 填空

- **材料**：2010 年数学三真题答案解析册（`参考文件/真题/数学/6、【1987-2025年】考研数学三真题答案及解析/2010年数学三真题答案解析.pdf`），题面见真题册 PDF p50；
- **页码**：解析册 PDF p3（整页）；
- **生成命令**：`参考文件/_venv/Scripts/python.exe tools/refs-vision.py --pdf "参考文件/真题/数学/6、【1987-2025年】考研数学三真题答案及解析/2010年数学三真题答案解析.pdf" --page 3 --dpi 110 --out "backup/scratch/refs-math3-ans/crops/2010_ans_p3.png"`
- **裁片**：`backup/scratch/refs-math3-ans/crops/2010_ans_p3.png`（910×1287 px / 107982 B / sha256 `611bb93ffee2f923a4d4499175a7e541c78002639481a8a5727efc65d4dc7794`）
- **亲读原文**：「(10)【答案】$\frac{\pi^2}{4}$。【解析】根据绕 $x$ 轴旋转公式，有 $V=\int_e^{+\infty}\pi y^2dx=\int_e^{+\infty}\pi\frac{dx}{x(1+\ln^2x)}=\pi\int_e^{+\infty}\frac{d\ln x}{1+\ln^2x}=\pi\left[\arctan(\ln x)\right]_e^{+\infty}=\pi(\frac{\pi}{2}-\frac{\pi}{4})=\frac{\pi^2}{4}$。」
- **结论**：答案 $\dfrac{\pi^2}{4}$（kind=`fill`，锚点 `\dfrac{\pi^2}{4}`）；三源一致性 = all（题面 真题册 p50 + 解析册 p3 亲读 + 独立复算）；
  - 独立复算：独立复算同值：$\int_e^\infty\frac{dx}{x(1+\ln^2x)}=\arctan(\ln x)|_e^\infty=\frac\pi2-\frac\pi4=\frac\pi4$，乘 $\pi$ 得 $\pi^2/4$。
- **置信度**：high；

### m3-2010-11 ｜ 二(11) ｜ 填空

- **材料**：2010 年数学三真题答案解析册（`参考文件/真题/数学/6、【1987-2025年】考研数学三真题答案及解析/2010年数学三真题答案解析.pdf`），题面见真题册 PDF p50；
- **页码**：解析册 PDF p3（整页）；
- **生成命令**：`参考文件/_venv/Scripts/python.exe tools/refs-vision.py --pdf "参考文件/真题/数学/6、【1987-2025年】考研数学三真题答案及解析/2010年数学三真题答案解析.pdf" --page 3 --dpi 110 --out "backup/scratch/refs-math3-ans/crops/2010_ans_p3.png"`
- **裁片**：`backup/scratch/refs-math3-ans/crops/2010_ans_p3.png`（910×1287 px / 107982 B / sha256 `611bb93ffee2f923a4d4499175a7e541c78002639481a8a5727efc65d4dc7794`）
- **亲读原文**：「(11)【答案】$p\cdot e^{\frac{1}{3}(p^3-1)}$。【解析】由弹性的定义，得 $\frac{dR}{dp}\cdot\frac{p}{R}=1+p^3$，所以 $\frac{dR}{R}=\left(\frac{1}{p}+p^2\right)dp$，即 $\ln R=\ln p+\frac{1}{3}p^2+C$，又 $R(1)=1$，所以 $C=-\frac{1}{3}$。」
- **结论**：答案 $p\cdot e^{\frac13(p^3-1)}$（kind=`fill`，锚点 `p\cdot\mathrm e^{\frac13(p^3-1)}`）；三源一致性 = all（题面 真题册 p50 + 解析册 p3 亲读 + 独立复算）；
  - 独立复算：独立复算同值：$\ln R=\ln p+\frac13(p^3-1)\Rightarrow R=p e^{\frac13(p^3-1)}$，且 $R(1)=1$ 与题设相符。
- **置信度**：high；

### m3-2010-12 ｜ 二(12) ｜ 填空

- **材料**：2010 年数学三真题答案解析册（`参考文件/真题/数学/6、【1987-2025年】考研数学三真题答案及解析/2010年数学三真题答案解析.pdf`），题面见真题册 PDF p50；
- **页码**：解析册 PDF p3（整页）；
- **生成命令**：`参考文件/_venv/Scripts/python.exe tools/refs-vision.py --pdf "参考文件/真题/数学/6、【1987-2025年】考研数学三真题答案及解析/2010年数学三真题答案解析.pdf" --page 3 --dpi 110 --out "backup/scratch/refs-math3-ans/crops/2010_ans_p3.png"`
- **裁片**：`backup/scratch/refs-math3-ans/crops/2010_ans_p3.png`（910×1287 px / 107982 B / sha256 `611bb93ffee2f923a4d4499175a7e541c78002639481a8a5727efc65d4dc7794`）
- **亲读原文**：「(12)【答案】$b=3$。【解析】函数为 $y=x^3+ax^2+bx+1$，它的一阶导数为 $y'=3x^2+2ax+b$；二阶导数为 $y''=6x+2a$，又因为 $(-1,0)$ 是拐点，所以 $y''|_{x=-1}=0$，得 $-\frac{a}{3}=-1$，所以 $a=3$，又因为曲线过点 $(-1,0)$，所以将 $x=-1,y=0$ 代入曲线方程，得 $b=3$。」
- **结论**：答案 $b=3$（kind=`fill`，锚点 `b=3`）；三源一致性 = all（题面 真题册 p50 + 解析册 p3 亲读 + 独立复算）；
  - 独立复算：独立复算同值：$y''(-1)=0\Rightarrow a=3$；代入 $(-1,0)$：$-1+3-b+1=0\Rightarrow b=3$。
- **置信度**：high；

### m3-2010-13 ｜ 二(13) ｜ 填空

- **材料**：2010 年数学三真题答案解析册（`参考文件/真题/数学/6、【1987-2025年】考研数学三真题答案及解析/2010年数学三真题答案解析.pdf`），题面见真题册 PDF p50；
- **页码**：解析册 PDF p4（整页）；
- **生成命令**：`参考文件/_venv/Scripts/python.exe tools/refs-vision.py --pdf "参考文件/真题/数学/6、【1987-2025年】考研数学三真题答案及解析/2010年数学三真题答案解析.pdf" --page 4 --dpi 110 --out "backup/scratch/refs-math3-ans/crops/2010_ans_p4.png"`
- **裁片**：`backup/scratch/refs-math3-ans/crops/2010_ans_p4.png`（910×1287 px / 100515 B / sha256 `4c4f0cedd39ebd8779166661a6c3e03dd2d05a6dfabb66a125127796150dcea4`）
- **亲读原文**：「(13)【答案】3。【解析】由于 $A(A^{-1}+B)B^{-1}=(E+AB)B^{-1}=B^{-1}+A$，所以 $|A+B^{-1}|=|A(A^{-1}+B)B^{-1}|=|A||A^{-1}+B||B^{-1}|$。因为 $|B|=2$，所以 $|B^{-1}|=|B|^{-1}=\frac{1}{2}$，因此 $|A+B^{-1}|=|A||A^{-1}+B||B^{-1}|=3\times2\times\frac{1}{2}=3$。」
- **结论**：答案 $3$（kind=`fill`，锚点 `3`）；三源一致性 = all（题面 真题册 p50 + 解析册 p4 亲读 + 独立复算）；
  - 独立复算：独立复算同值：$|A^{-1}+B|=|A^{-1}(E+AB)|$ 路线同样得 $|A||B||A^{-1}+B||B^{-1}|$，数值 $3\cdot2\cdot\frac12=3$。
- **置信度**：high；

### m3-2010-14 ｜ 二(14) ｜ 填空

- **材料**：2010 年数学三真题答案解析册（`参考文件/真题/数学/6、【1987-2025年】考研数学三真题答案及解析/2010年数学三真题答案解析.pdf`），题面见真题册 PDF p50；
- **页码**：解析册 PDF p4（整页）；
- **生成命令**：`参考文件/_venv/Scripts/python.exe tools/refs-vision.py --pdf "参考文件/真题/数学/6、【1987-2025年】考研数学三真题答案及解析/2010年数学三真题答案解析.pdf" --page 4 --dpi 110 --out "backup/scratch/refs-math3-ans/crops/2010_ans_p4.png"`
- **裁片**：`backup/scratch/refs-math3-ans/crops/2010_ans_p4.png`（910×1287 px / 100515 B / sha256 `4c4f0cedd39ebd8779166661a6c3e03dd2d05a6dfabb66a125127796150dcea4`）
- **亲读原文**：「(14)【答案】$\sigma^2+\mu^2$。【解析】$E(T)=E\left(\frac{1}{n}\sum_{i=1}^nX_i^2\right)=\frac{1}{n}E\left(\sum_{i=1}^nX_i^2\right)=\frac{1}{n}nE(X^2)=E(X^2)=\sigma^2+\mu^2$。」
- **结论**：答案 $\sigma^2+\mu^2$（kind=`fill`，锚点 `\sigma^2+\mu^2`）；三源一致性 = all（题面 真题册 p50 + 解析册 p4 亲读 + 独立复算）；
  - 独立复算：独立复算同值：$E(X^2)=D(X)+[E(X)]^2=\sigma^2+\mu^2$。
- **置信度**：high；

### m3-2010-15 ｜ 三(15) ｜ 解答

- **材料**：2010 年数学三真题答案解析册（`参考文件/真题/数学/6、【1987-2025年】考研数学三真题答案及解析/2010年数学三真题答案解析.pdf`），题面见真题册 PDF p50；
- **页码**：解析册 PDF p4（整页）；
- **生成命令**：`参考文件/_venv/Scripts/python.exe tools/refs-vision.py --pdf "参考文件/真题/数学/6、【1987-2025年】考研数学三真题答案及解析/2010年数学三真题答案解析.pdf" --page 4 --dpi 110 --out "backup/scratch/refs-math3-ans/crops/2010_ans_p4.png"`
- **裁片**：`backup/scratch/refs-math3-ans/crops/2010_ans_p4.png`（910×1287 px / 100515 B / sha256 `4c4f0cedd39ebd8779166661a6c3e03dd2d05a6dfabb66a125127796150dcea4`）
- **亲读原文**：「(15)【解析】$\lim_{x\to+\infty}\left(\frac{1}{x^2}-1\right)^{\frac{1}{\ln x}}=\lim_{x\to+\infty}e^{\frac{\ln(\frac{1}{x^2}-1)}{\ln x}}=\dots$ 其中 $\lim_{x\to+\infty}\frac{\ln(e^{\frac{\ln x}{x}}-1)}{\ln x}=-1$，故原式 $=e^{-1}$。」
- **结论**：答案 $e^{-1}$（kind=`solution`，锚点 `\mathrm e^{-1}`）；三源一致性 = all（题面 真题册 p50 + 解析册 p4 亲读 + 独立复算）；
  - 独立复算：独立复算同值：$\ln(\frac1{x^2}-1)\approx\ln(e^{\frac{\ln x}{x}}-1)$，取对数极限 $=-1$，故原极限 $e^{-1}$。
- **置信度**：high；

### m3-2010-16 ｜ 三(16) ｜ 解答

- **材料**：2010 年数学三真题答案解析册（`参考文件/真题/数学/6、【1987-2025年】考研数学三真题答案及解析/2010年数学三真题答案解析.pdf`），题面见真题册 PDF p51；
- **页码**：解析册 PDF p4（整页）；
- **生成命令**：`参考文件/_venv/Scripts/python.exe tools/refs-vision.py --pdf "参考文件/真题/数学/6、【1987-2025年】考研数学三真题答案及解析/2010年数学三真题答案解析.pdf" --page 4 --dpi 110 --out "backup/scratch/refs-math3-ans/crops/2010_ans_p4.png"`
- **裁片**：`backup/scratch/refs-math3-ans/crops/2010_ans_p4.png`（910×1287 px / 100515 B / sha256 `4c4f0cedd39ebd8779166661a6c3e03dd2d05a6dfabb66a125127796150dcea4`）
- **亲读原文**：「(16)【解析】积分区域 $D=D_1\cup D_2$，其中 $D_1=\{(x,y)|0\le y\le1,\sqrt{2y}\le x\le\sqrt{1+y^2}\}$。因为区域 $D$ 关于 $x$ 轴对称，被积函数 $3x^2y+y^3$ 是 $y$ 的奇函数，所以 $\iint_D(3x^2y+y^3)dxdy=0$，最终 $\iint_D(x+y)^3dxdy=2\int_0^1\left(-\frac{9}{4}y^4+2y^2+\frac{1}{4}\right)dy=\frac{14}{15}$。」
- **结论**：答案 $\dfrac{14}{15}$（kind=`solution`，锚点 `\dfrac{14}{15}`）；三源一致性 = all（题面 真题册 p51 + 解析册 p4 亲读 + 独立复算）；
  - 独立复算：独立复算同值：奇对称项归零，剩 $\iint_D(x^3+3xy^2)$，化为累次积分得 $2\left(-\frac{9}{20}+\frac{2}{3}+\frac14\right)=\frac{14}{15}$。
- **置信度**：high；

### m3-2010-17 ｜ 三(17) ｜ 解答

- **材料**：2010 年数学三真题答案解析册（`参考文件/真题/数学/6、【1987-2025年】考研数学三真题答案及解析/2010年数学三真题答案解析.pdf`），题面见真题册 PDF p51；
- **页码**：解析册 PDF p4（整页）；
- **生成命令**：`参考文件/_venv/Scripts/python.exe tools/refs-vision.py --pdf "参考文件/真题/数学/6、【1987-2025年】考研数学三真题答案及解析/2010年数学三真题答案解析.pdf" --page 4 --dpi 110 --out "backup/scratch/refs-math3-ans/crops/2010_ans_p4.png"`
- **裁片**：`backup/scratch/refs-math3-ans/crops/2010_ans_p4.png`（910×1287 px / 100515 B / sha256 `4c4f0cedd39ebd8779166661a6c3e03dd2d05a6dfabb66a125127796150dcea4`）
- **亲读原文**：「(17)【解析】令 $F(x,y,z,\lambda)=xy+2yz+\lambda(x^2+y^2+z^2-10)$，用拉格朗日乘数法得 $F'_x=y+2\lambda x=0,F'_y=x+2z+2\lambda y=0,F'_z=2y+2\lambda z=0,F'_\lambda=x^2+y^2+z^2-10=0$，求解得六个点 $A(1,\sqrt5,2),B(-1,-\sqrt5,-2),C(1,-\sqrt5,2),D(-1,\sqrt5,-2),E(2\sqrt2,0,-\sqrt2),F(-2\sqrt2,0,\sqrt2)$（续 p5）…由于在点 $A$ 与 $B$ 处 $u=5\sqrt5$；在点 $C$ 与 $D$ 处 $u=-5\sqrt5$；在点 $E$ 与 $F$ 处 $u=0$…所以 $u_{\max}=5\sqrt5,u_{\min}=-5\sqrt5$。」
- **结论**：答案 $u_{\max}=5\sqrt5$，$u_{\min}=-5\sqrt5$（kind=`solution`，锚点 `u_{\max}=5\sqrt5,\ u_{\min}=-5\sqrt5`）；三源一致性 = all（题面 真题册 p51 + 解析册 p4 亲读 + 独立复算）；
  - 独立复算：独立复算同值：方程组给出 $\lambda=-\frac12$ 分支的六个驻点，代入 $u=xy+2yz$ 得 $\pm5\sqrt5$ 与 $0$，闭球面必取到最值。
- **置信度**：high；

### m3-2010-18 ｜ 三(18) ｜ 解答

- **材料**：2010 年数学三真题答案解析册（`参考文件/真题/数学/6、【1987-2025年】考研数学三真题答案及解析/2010年数学三真题答案解析.pdf`），题面见真题册 PDF p51；
- **页码**：解析册 PDF p5（整页）；
- **生成命令**：`参考文件/_venv/Scripts/python.exe tools/refs-vision.py --pdf "参考文件/真题/数学/6、【1987-2025年】考研数学三真题答案及解析/2010年数学三真题答案解析.pdf" --page 5 --dpi 110 --out "backup/scratch/refs-math3-ans/crops/2010_ans_p5.png"`
- **裁片**：`backup/scratch/refs-math3-ans/crops/2010_ans_p5.png`（910×1287 px / 112229 B / sha256 `8185d7d494d52496e0bac6598c32f81d5ab20c28c82de666f1a249b9f1fb0866`）
- **亲读原文**：「(18)【解析】(Ⅰ) 当 $0<x<1$ 时 $0<\ln(1+x)<x$，故 $[\ln(1+t)]^n<t^n$，所以 $|\ln t|[\ln(1+t)]^n<|\ln t|t^n$，则 $\int_0^1|\ln t|[\ln(1+t)]^ndt<\int_0^1|\ln t|t^ndt$。(Ⅱ) $\int_0^1|\ln t|t^ndt=\frac{1}{(n+1)^2}$，故由 $0<u_n<\int_0^1|\ln t|t^ndt=\frac{1}{(n+1)^2}$，根据夹逼定理得 $\lim_{n\to\infty}u_n=0$。」
- **结论**：答案 $\lim\limits_{n\to\infty}u_n=0$（kind=`solution`，锚点 `\lim\limits_{n\to\infty}u_n=0`）；三源一致性 = all（题面 真题册 p51 + 解析册 p5 亲读 + 独立复算）；
  - 独立复算：独立复算同值：$\int_0^1(-\ln t)t^ndt=\frac{1}{(n+1)^2}\to0$，夹逼给出 $u_n\to0$。
- **置信度**：high；

### m3-2010-19 ｜ 三(19) ｜ 解答

- **材料**：2010 年数学三真题答案解析册（`参考文件/真题/数学/6、【1987-2025年】考研数学三真题答案及解析/2010年数学三真题答案解析.pdf`），题面见真题册 PDF p51；
- **页码**：解析册 PDF p5（整页）；
- **生成命令**：`参考文件/_venv/Scripts/python.exe tools/refs-vision.py --pdf "参考文件/真题/数学/6、【1987-2025年】考研数学三真题答案及解析/2010年数学三真题答案解析.pdf" --page 5 --dpi 110 --out "backup/scratch/refs-math3-ans/crops/2010_ans_p5.png"`
- **裁片**：`backup/scratch/refs-math3-ans/crops/2010_ans_p5.png`（910×1287 px / 112229 B / sha256 `8185d7d494d52496e0bac6598c32f81d5ab20c28c82de666f1a249b9f1fb0866`）
- **亲读原文**：「(19)【解析】(Ⅰ) 因为 $2f(0)=\int_0^2f(x)dx$，又因为 $f(x)$ 在 $[0,2]$ 上连续，所以由积分中值定理得，至少有一点 $\eta\in[0,2]$，使得 $\int_0^2f(x)dx=f(\eta)\cdot(2-0)$，即 $2f(0)=2f(\eta)$，所以存在 $\eta\in[0,2]$，使得 $f(\eta)=f(0)$。(Ⅱ) 因为 $f(2)+f(3)=2f(0)$…由罗尔中值定理知，$\exists\xi_1\in(0,2)$ 有 $f'(\xi_1)=0$…至少有一点 $\xi\in(0,3)$，使得 $f''(\xi)=0$（续 p6）。」
- **结论**：答案 证明题（存在 $\xi\in(0,3)$ 使 $f''(\xi)=0$）（kind=`solution`，锚点 `\exists\xi\in(0,3),\ f''(\xi)=0`）；三源一致性 = all（题面 真题册 p51 + 解析册 p5 亲读 + 独立复算）；
  - 独立复算：独立复核同结论：积分中值给出 $\eta$ 使 $f(\eta)=f(0)$；再由 $f(2)+f(3)=2f(0)$ 与介值/罗尔两次应用得 $f''(\xi)=0$。
- **置信度**：high；

### m3-2010-20 ｜ 三(20) ｜ 解答

- **材料**：2010 年数学三真题答案解析册（`参考文件/真题/数学/6、【1987-2025年】考研数学三真题答案及解析/2010年数学三真题答案解析.pdf`），题面见真题册 PDF p52；
- **页码**：解析册 PDF p6（整页）；
- **生成命令**：`参考文件/_venv/Scripts/python.exe tools/refs-vision.py --pdf "参考文件/真题/数学/6、【1987-2025年】考研数学三真题答案及解析/2010年数学三真题答案解析.pdf" --page 6 --dpi 110 --out "backup/scratch/refs-math3-ans/crops/2010_ans_p6.png"`
- **裁片**：`backup/scratch/refs-math3-ans/crops/2010_ans_p6.png`（910×1287 px / 107870 B / sha256 `f5e90048d5c609a9147a89b283776f9b7ece231490f05cb033ef13990de992a9`）
- **亲读原文**：「(20)【解析】因为方程组有两个不同的解，所以可以判断方程组增广矩阵的秩小于 3…方法 1：已知 $Ax=b$ 有 2 个不同的解，故 $r(A)=r(\overline{A})<3$，对增广矩阵进行初等行变换…当 $\lambda=1$ 时，$r(A)\ne r(\overline{A})$，故 $Ax=b$ 无解（舍去）。当 $\lambda=-1$ 时，由于 $r(A)=r(\overline{A})<3$，所以 $a=-2$，故 $\lambda=-1$，$a=-2$。方法 2：…$|A|=\begin{vmatrix}\lambda&1&1\\0&\lambda-1&0\\1&1&\lambda\end{vmatrix}=(\lambda-1)^2(\lambda+1)=0$。」
- **结论**：答案 $\lambda=-1$，$a=-2$（kind=`solution`，锚点 `\lambda=-1,\ a=-2`）；三源一致性 = all（题面 真题册 p52 + 解析册 p6 亲读 + 独立复算）；
  - 独立复算：独立复算同值：$|A|=(\lambda-1)^2(\lambda+1)$，$\lambda=1$ 时 $r(A)\ne r(\overline A)$ 无解，$\lambda=-1$ 时须 $a=-2$ 才有无穷多解。
- **置信度**：high；

### m3-2010-21 ｜ 三(21) ｜ 解答

- **材料**：2010 年数学三真题答案解析册（`参考文件/真题/数学/6、【1987-2025年】考研数学三真题答案及解析/2010年数学三真题答案解析.pdf`），题面见真题册 PDF p52；
- **页码**：解析册 PDF p7（横带）；
- **生成命令**：`参考文件/_venv/Scripts/python.exe tools/refs-vision.py --pdf "参考文件/真题/数学/6、【1987-2025年】考研数学三真题答案及解析/2010年数学三真题答案解析.pdf" --page 7 --dpi 110 --box 83.9,399.3,511.4,823.9 --out "backup/scratch/refs-math3-ans/crops/2010_ans_p7_band.png"`
- **裁片**：`backup/scratch/refs-math3-ans/crops/2010_ans_p7_band.png`（653×649 px / 44898 B / sha256 `acbdda022165a7fc8803a68987a1020c08ef5a81b5fe6fd20b5e399631946f31`）
- **亲读原文**：「(21)【解析】由于 $A=\begin{pmatrix}0&-1&4\\-1&3&a\\4&a&0\end{pmatrix}$，存在正交矩阵 $Q$…且 $Q$ 的第一列为 $\frac{1}{\sqrt6}(1,2,1)^T$，故 $A$ 对应于 $\lambda_1$ 的特征向量为 $\xi_1=\frac{1}{\sqrt6}(1,2,1)^T$…由此可得 $a=-1,\lambda_1=2$。由 $|\lambda E-A|=\begin{vmatrix}\lambda&1&-4\\1&\lambda-3&1\\-4&1&\lambda\end{vmatrix}=(\lambda+4)(\lambda-2)(\lambda-5)=0$，可得 $A$ 的特征值为 $\lambda_1=2,\lambda_2=-4,\lambda_3=5$。」
- **结论**：答案 $a=-1$（$A$ 的特征值 $2,-4,5$）（kind=`solution`，锚点 `a=-1;\ \lambda_1=2,\lambda_2=-4,\lambda_3=5`）；三源一致性 = all（题面 真题册 p52 + 解析册 p7 亲读 + 独立复算）；
  - 独立复算：独立复算同值：由 $A\xi_1=\lambda_1\xi_1$ 分量比对得 $a=-1,\lambda_1=2$；特征多项式 $(\lambda+4)(\lambda-2)(\lambda-5)$ 与迹 $=3$、行列式 $=40$ 均自洽。
- **置信度**：high；

### m3-2010-22 ｜ 三(22) ｜ 解答

- **材料**：2010 年数学三真题答案解析册（`参考文件/真题/数学/6、【1987-2025年】考研数学三真题答案及解析/2010年数学三真题答案解析.pdf`），题面见真题册 PDF p52；
- **页码**：解析册 PDF p8（横带）；
- **生成命令**：`参考文件/_venv/Scripts/python.exe tools/refs-vision.py --pdf "参考文件/真题/数学/6、【1987-2025年】考研数学三真题答案及解析/2010年数学三真题答案解析.pdf" --page 8 --dpi 110 --box 83.9,455.9,511.4,823.9 --out "backup/scratch/refs-math3-ans/crops/2010_ans_p8_band.png"`
- **裁片**：`backup/scratch/refs-math3-ans/crops/2010_ans_p8_band.png`（653×562 px / 55784 B / sha256 `00da8a8e060b4b6fa80fa124b112514d8b563328b89d3c5123d4b32bd7b4da14`）
- **亲读原文**：「(22)【解析】当给出二维正态随机变量的概率密度 $f(x,y)$ 后，要求条件概率密度 $f_{Y|X}(y|x)$，可以根据条件概率公式 $f_{Y|X}(y|x)=\frac{f(x,y)}{f_X(x)}$ 来进行计算…$f_X(x)=\int_{-\infty}^{+\infty}f(x,y)dy=A\sqrt\pi e^{-x^2}$…根据概率密度性质有 $1=\int_{-\infty}^{+\infty}f_X(x)dx=A\pi$，即 $A=\pi^{-1}$，故 $f_X(x)=\frac{1}{\sqrt\pi}e^{-x^2}$，当 $-\infty<x<+\infty$ 时，有条件概率密度 $f_{Y|X}(y|x)=\frac{1}{\sqrt\pi}e^{-(x-y)^2}$。」
- **结论**：答案 $A=\pi^{-1}$，$f_X(x)=\frac{1}{\sqrt\pi}e^{-x^2}$，$f_{Y|X}(y|x)=\frac{1}{\sqrt\pi}e^{-(x-y)^2}$（kind=`solution`，锚点 `A=\pi^{-1};\ f_X(x)=\dfrac{1}{\sqrt\pi}\mathrm e^{-x^2};\ f_{Y|X}(y|x)=\dfrac{1}{\sqrt\pi}\mathrm e^{-(x-y)^2}`）；三源一致性 = all（题面 真题册 p52 + 解析册 p8 亲读 + 独立复算）；
  - 独立复算：独立复算同值：$\int_{\mathbb R}e^{-2x^2+2xy-y^2}dy=\sqrt{\frac\pi2}e^{-\frac{y^2}2}$ 路径同样得 $A=1/\pi$ 与 $f_{Y|X}=\frac1{\sqrt\pi}e^{-(x-y)^2}$。
- **置信度**：high；

### m3-2010-23 ｜ 三(23) ｜ 解答

- **材料**：2010 年数学三真题答案解析册（`参考文件/真题/数学/6、【1987-2025年】考研数学三真题答案及解析/2010年数学三真题答案解析.pdf`），题面见真题册 PDF p52；
- **页码**：解析册 PDF p9（整页）；
- **生成命令**：`参考文件/_venv/Scripts/python.exe tools/refs-vision.py --pdf "参考文件/真题/数学/6、【1987-2025年】考研数学三真题答案及解析/2010年数学三真题答案解析.pdf" --page 9 --dpi 110 --out "backup/scratch/refs-math3-ans/crops/2010_ans_p9.png"`
- **裁片**：`backup/scratch/refs-math3-ans/crops/2010_ans_p9.png`（910×1287 px / 87986 B / sha256 `fd759a90facec568ac4ddb0971a63214f0095d53e28972f6813a8bae406c5913`）
- **亲读原文**：「(23)【解析】(Ⅰ) $X$ 的所有可能取值为 $0,1$，$Y$ 的所有可能取值为 $0,1,2$。$P\{X=0,Y=0\}=\frac{C_3^2}{C_6^2}=\frac{3}{15}=\frac15$…$P\{X=1,Y=2\}=\frac{0}{C_6^2}=0$，因此二维离散型随机变量 $(X,Y)$ 的概率分布为…(Ⅱ) $\mathrm{Cov}(X,Y)=E(XY)-E(X)E(Y)$，$E(XY)=1\times1\times\frac{2}{15}=\frac{2}{15}$，$E(X)=\frac23$，$E(Y)=0\times\frac25+1\times\frac{8}{15}+2\times\frac{1}{15}=\frac{8}{15}$，$\mathrm{Cov}(X,Y)=\frac{2}{15}-\frac{2}{3}\times\frac{8}{15}=-\frac{4}{45}$。」
- **结论**：答案 联合分布如上；$\mathrm{Cov}(X,Y)=-\frac{4}{45}$（kind=`solution`，锚点 `\mathrm{Cov}(X,Y)=-\dfrac{4}{45}`）；三源一致性 = all（题面 真题册 p52 + 解析册 p9 亲读 + 独立复算）；
  - 独立复算：独立复算同值：六个格点概率 $\{1/5,2/5,1/15,1/5,2/15,0\}$ 合计 1；$E(XY)=2/15$，$E(X)=2/3$，$E(Y)=8/15$，协方差 $=-4/45$。
- **置信度**：high；

### m3-2010-9 ｜ 二(9) ｜ 填空

- **材料**：2010 年数学三真题答案解析册（`参考文件/真题/数学/6、【1987-2025年】考研数学三真题答案及解析/2010年数学三真题答案解析.pdf`），题面见真题册 PDF p50；
- **页码**：解析册 PDF p3（整页）；
- **生成命令**：`参考文件/_venv/Scripts/python.exe tools/refs-vision.py --pdf "参考文件/真题/数学/6、【1987-2025年】考研数学三真题答案及解析/2010年数学三真题答案解析.pdf" --page 3 --dpi 110 --out "backup/scratch/refs-math3-ans/crops/2010_ans_p3.png"`
- **裁片**：`backup/scratch/refs-math3-ans/crops/2010_ans_p3.png`（910×1287 px / 107982 B / sha256 `611bb93ffee2f923a4d4499175a7e541c78002639481a8a5727efc65d4dc7794`）
- **亲读原文**：「(9)【答案】−1。【解析】$\int_0^{x+y}e^{-t^2}dt=x\int_0^x\sin t^2dt$，令 $x=0$ 得 $y=0$，等式两端对 $x$ 求导得 $e^{-(x+y)^2}(1+\frac{dy}{dx})=\int_0^x\sin t^2dt+x\sin x^2$。将 $x=0,y=0$ 代入，得 $1+\frac{dy}{dx}\Big|_{x=0}=0$，所以 $\frac{dy}{dx}\Big|_{x=0}=-1$。」
- **结论**：答案 $-1$（kind=`fill`，锚点 `-1`）；三源一致性 = all（题面 真题册 p50 + 解析册 p3 亲读 + 独立复算）；
  - 独立复算：独立复算同值：对 $x$ 求导得 $e^{-(x+y)^2}\cdot(1+y')=\int_0^x\sin t^2dt+x\sin x^2$，代入 $(0,0)$ 得 $1+y'(0)=0\Rightarrow y'(0)=-1$。
- **置信度**：high；

### m3-2011-10 ｜ 二(10) ｜ 填空

- **材料**：2011 年数学三真题答案解析册（`参考文件/真题/数学/6、【1987-2025年】考研数学三真题答案及解析/2011年数学三真题答案解析.pdf`），题面见真题册 PDF p46；
- **页码**：解析册 PDF p4（整页）；
- **生成命令**：`参考文件/_venv/Scripts/python.exe tools/refs-vision.py --pdf "参考文件/真题/数学/6、【1987-2025年】考研数学三真题答案及解析/2011年数学三真题答案解析.pdf" --page 4 --dpi 110 --out "backup/scratch/refs-math3-ans/crops/2011_ans_p4.png"`
- **裁片**：`backup/scratch/refs-math3-ans/crops/2011_ans_p4.png`（797×1127 px / 84311 B / sha256 `6780f43e8409f89bf47cb970f4bb6b689140eb97eb3b65aa66c8df854f4783fe`）
- **亲读原文**：「(10)【答案】$(1+2\ln2)(dx-dy)$。【解析】$z=\left(1+\frac{x}{y}\right)^{\frac{x}{y}}=e^{\frac{x}{y}\ln(1+\frac{x}{y})}$，$\frac{dz}{dx}=(1+\frac{x}{y})^{\frac{x}{y}}\frac{1}{y}\ln(1+\frac{x}{y})+\dots$，所以 $\frac{\partial z}{\partial x}\Big|_{(1,1)}=2\ln2+1$，$\frac{\partial z}{\partial y}\Big|_{(1,1)}=-1-2\ln 2$，从而 $dz|_{(1,1)}=(1+2\ln2)(dx-dy)$。」
- **结论**：答案 $(1+2\ln 2)(\mathrm dx-\mathrm dy)$（kind=`fill`，锚点 `(1+2\ln2)(\mathrm dx-\mathrm dy)`）；三源一致性 = all（题面 真题册 p46 + 解析册 p4 亲读 + 独立复算）；
  - 独立复算：独立复算同值：全微分系数 $z_x(1,1)=1+2\ln2$，$z_y(1,1)=-(1+2\ln2)$，故 $dz=(1+2\ln2)(dx-dy)$。
- **置信度**：high；

### m3-2011-11 ｜ 二(11) ｜ 填空

- **材料**：2011 年数学三真题答案解析册（`参考文件/真题/数学/6、【1987-2025年】考研数学三真题答案及解析/2011年数学三真题答案解析.pdf`），题面见真题册 PDF p46；
- **页码**：解析册 PDF p4（整页）；
- **生成命令**：`参考文件/_venv/Scripts/python.exe tools/refs-vision.py --pdf "参考文件/真题/数学/6、【1987-2025年】考研数学三真题答案及解析/2011年数学三真题答案解析.pdf" --page 4 --dpi 110 --out "backup/scratch/refs-math3-ans/crops/2011_ans_p4.png"`
- **裁片**：`backup/scratch/refs-math3-ans/crops/2011_ans_p4.png`（797×1127 px / 84311 B / sha256 `6780f43e8409f89bf47cb970f4bb6b689140eb97eb3b65aa66c8df854f4783fe`）
- **亲读原文**：「(11)【答案】$y=-2x$。【解析】方程 $\tan\left(x+y+\frac{\pi}{4}\right)=e^y$ 的两端对 $x$ 求导，有 $\sec^2\left(x+y+\frac{\pi}{4}\right)\cdot(1+y')=e^y y'$，将 $x=0,y=0$ 代入上式，有 $\frac{1}{\cos^2\frac{\pi}{4}}(1+y')=y'$，解得 $y'\big|_{(0,0)}=-2$，故切线方程为 $y=-2x$。」
- **结论**：答案 $y=-2x$（kind=`fill`，锚点 `y=-2x`）；三源一致性 = all（题面 真题册 p46 + 解析册 p4 亲读 + 独立复算）；
  - 独立复算：独立复算同值：$2(1+y')=y'\Rightarrow y'(0,0)=-2$，切线 $y=-2x$。
- **置信度**：high；

### m3-2011-12 ｜ 二(12) ｜ 填空

- **材料**：2011 年数学三真题答案解析册（`参考文件/真题/数学/6、【1987-2025年】考研数学三真题答案及解析/2011年数学三真题答案解析.pdf`），题面见真题册 PDF p46；
- **页码**：解析册 PDF p4（整页）；
- **生成命令**：`参考文件/_venv/Scripts/python.exe tools/refs-vision.py --pdf "参考文件/真题/数学/6、【1987-2025年】考研数学三真题答案及解析/2011年数学三真题答案解析.pdf" --page 4 --dpi 110 --out "backup/scratch/refs-math3-ans/crops/2011_ans_p4.png"`
- **裁片**：`backup/scratch/refs-math3-ans/crops/2011_ans_p4.png`（797×1127 px / 84311 B / sha256 `6780f43e8409f89bf47cb970f4bb6b689140eb97eb3b65aa66c8df854f4783fe`）
- **亲读原文**：「(12)【答案】$\frac{4}{3}\pi$。【解析】如图 2 所示：$V=\pi\int_1^2y^2dx=\pi\int_1^2(x^2-1)dx=\frac{4}{3}\pi$。」
- **结论**：答案 $\dfrac{4}{3}\pi$（kind=`fill`，锚点 `\dfrac{4}{3}\pi`）；三源一致性 = all（题面 真题册 p46 + 解析册 p4 亲读 + 独立复算）；
  - 独立复算：独立复算同值：$\pi\int_1^2(x^2-1)dx=\pi(\frac83-\frac13-1)=\frac{4\pi}{3}$。
- **置信度**：high；

### m3-2011-13 ｜ 二(13) ｜ 填空

- **材料**：2011 年数学三真题答案解析册（`参考文件/真题/数学/6、【1987-2025年】考研数学三真题答案及解析/2011年数学三真题答案解析.pdf`），题面见真题册 PDF p46；
- **页码**：解析册 PDF p5（整页）；
- **生成命令**：`参考文件/_venv/Scripts/python.exe tools/refs-vision.py --pdf "参考文件/真题/数学/6、【1987-2025年】考研数学三真题答案及解析/2011年数学三真题答案解析.pdf" --page 5 --dpi 110 --out "backup/scratch/refs-math3-ans/crops/2011_ans_p5.png"`
- **裁片**：`backup/scratch/refs-math3-ans/crops/2011_ans_p5.png`（797×1127 px / 92295 B / sha256 `e2c18050d3fa09098d5c81ed9e97d6530dd40bfc69466535b7c52bdae55c8098`）
- **亲读原文**：「(13)【答案】$3y_1^2$。【解析】因为 $A$ 的各行元素之和为 3，所以 $A\begin{pmatrix}1\\1\\1\end{pmatrix}=3\begin{pmatrix}1\\1\\1\end{pmatrix}$，故 3 为矩阵 $A$ 的特征值。由 $r(A)=1$ 知矩阵 $A$ 有两个特征值为零，从而 $\lambda_1=3,\lambda_2=\lambda_3=0$。…所以二次型在正交变换下的标准形为 $3y_1^2$。」
- **结论**：答案 $3y_1^2$（kind=`fill`，锚点 `3y_1^2`）；三源一致性 = all（题面 真题册 p46 + 解析册 p5 亲读 + 独立复算）；
  - 独立复算：独立复算同值：行和为 3 ⇒ 特征值 3；秩 1 ⇒ 另两个特征值 0；正交标准形 $3y_1^2$。
- **置信度**：high；

### m3-2011-14 ｜ 二(14) ｜ 填空

- **材料**：2011 年数学三真题答案解析册（`参考文件/真题/数学/6、【1987-2025年】考研数学三真题答案及解析/2011年数学三真题答案解析.pdf`），题面见真题册 PDF p46；
- **页码**：解析册 PDF p5（整页）；
- **生成命令**：`参考文件/_venv/Scripts/python.exe tools/refs-vision.py --pdf "参考文件/真题/数学/6、【1987-2025年】考研数学三真题答案及解析/2011年数学三真题答案解析.pdf" --page 5 --dpi 110 --out "backup/scratch/refs-math3-ans/crops/2011_ans_p5.png"`
- **裁片**：`backup/scratch/refs-math3-ans/crops/2011_ans_p5.png`（797×1127 px / 92295 B / sha256 `e2c18050d3fa09098d5c81ed9e97d6530dd40bfc69466535b7c52bdae55c8098`）
- **亲读原文**：「(14)【答案】$\mu(\mu^2+\sigma^2)$。【解析】根据题意，二维随机变量 $(X,Y)$ 服从 $N(\mu,\mu;\sigma^2,\sigma^2;0)$。因为 $\rho_{xy}=0$，所以由二维正态分布的性质知随机变量 $X,Y$ 独立，所以 $X,Y^2$…从而有 $E(XY^2)=E(X)E(Y^2)=\mu\left[D(Y)+E^2(Y)\right]=\mu(\mu^2+\sigma^2)$。」
- **结论**：答案 $\mu(\mu^2+\sigma^2)$（kind=`fill`，锚点 `\mu(\mu^2+\sigma^2)`）；三源一致性 = all（题面 真题册 p46 + 解析册 p5 亲读 + 独立复算）；
  - 独立复算：独立复算同值：独立 ⇒ $E(XY^2)=E(X)E(Y^2)=\mu(\sigma^2+\mu^2)$。
- **置信度**：high；

### m3-2011-15 ｜ 三(15) ｜ 解答

- **材料**：2011 年数学三真题答案解析册（`参考文件/真题/数学/6、【1987-2025年】考研数学三真题答案及解析/2011年数学三真题答案解析.pdf`），题面见真题册 PDF p46；
- **页码**：解析册 PDF p5（整页）；
- **生成命令**：`参考文件/_venv/Scripts/python.exe tools/refs-vision.py --pdf "参考文件/真题/数学/6、【1987-2025年】考研数学三真题答案及解析/2011年数学三真题答案解析.pdf" --page 5 --dpi 110 --out "backup/scratch/refs-math3-ans/crops/2011_ans_p5.png"`
- **裁片**：`backup/scratch/refs-math3-ans/crops/2011_ans_p5.png`（797×1127 px / 92295 B / sha256 `e2c18050d3fa09098d5c81ed9e97d6530dd40bfc69466535b7c52bdae55c8098`）
  - 续页补渲：`backup/scratch/refs-math3-ans/crops/2011_ans_p6.png`（797×1127 px / 74873 B / sha256 `38e2b37570401a2b278cec1c0ed7bd2a7a0b330a40f20db0ccfebcad7cc1bae3`）
- **亲读原文**：「(15)（本题满分 10 分）【解析】$\lim_{x\to0}\frac{\sqrt{1+2\sin x}-x-1}{x\ln(1+x)}=\dots=\lim_{x\to0}\frac{-\sin x-\frac{\cos x}{\sqrt{1+2\sin x}}}{2}=-\lim_{x\to0}\frac{\cos x}{2\sqrt{1+2\sin x}}=-\frac12$（解续 p6）。」
- **结论**：答案 $-\dfrac12$（kind=`solution`，锚点 `-\dfrac12`）；三源一致性 = all（题面 真题册 p46 + 解析册 p5 亲读 + 独立复算）；
  - 独立复算：独立复算同值：分子展开 $\sqrt{1+2\sin x}\approx1+x-\frac{x^2}{2}-\frac{x^3}{6}$，分母 $x\ln(1+x)\approx x^2$，比值 $\to-\frac12$。
- **置信度**：high；

### m3-2011-16 ｜ 三(16) ｜ 解答

- **材料**：2011 年数学三真题答案解析册（`参考文件/真题/数学/6、【1987-2025年】考研数学三真题答案及解析/2011年数学三真题答案解析.pdf`），题面见真题册 PDF p46；
- **页码**：解析册 PDF p6（整页）；
- **生成命令**：`参考文件/_venv/Scripts/python.exe tools/refs-vision.py --pdf "参考文件/真题/数学/6、【1987-2025年】考研数学三真题答案及解析/2011年数学三真题答案解析.pdf" --page 6 --dpi 110 --out "backup/scratch/refs-math3-ans/crops/2011_ans_p6.png"`
- **裁片**：`backup/scratch/refs-math3-ans/crops/2011_ans_p6.png`（797×1127 px / 74873 B / sha256 `38e2b37570401a2b278cec1c0ed7bd2a7a0b330a40f20db0ccfebcad7cc1bae3`）
- **亲读原文**：「(16)（本题满分 10 分）【解析】$\frac{\partial z}{\partial x}=f_1'[(x+y),f(x,y)]+f_2'[(x+y),f(x,y)]\cdot f_1'(x,y)$，$\frac{\partial^2z}{\partial x\partial y}=f_{11}''[(x+y),f(x+y)]\cdot1+f_{12}''[(x+y),f(x+y)]f_2'(x,y)+\dots$。由于 $f(1,1)=2$ 为 $f(u,v)$ 的极值，故 $f_1'(1,1)=f_2'(1,1)=0$，所以 $\frac{\partial^2z}{\partial x\partial y}=f_{11}''(2,2)+f_2'(2,2)\cdot f_{12}''(1,1)$。」
- **结论**：答案 $\frac{\partial^2z}{\partial x\partial y}\big|_{(1,1)}=f_{11}''(2,2)+f_2'(2,2)f_{12}''(1,1)$（kind=`solution`，锚点 `f_{11}''(2,2)+f_2'(2,2)f_{12}''(1,1)`）；三源一致性 = all（题面 真题册 p46 + 解析册 p6 亲读 + 独立复算）；
  - 独立复算：独立复核同式：内层函数极值条件使 $f_1',f_2'(1,1)=0$，链式展开后仅剩 $f_{11}''+f_2'f_{12}''$ 两项。
- **置信度**：high；

### m3-2011-17 ｜ 三(17) ｜ 解答

- **材料**：2011 年数学三真题答案解析册（`参考文件/真题/数学/6、【1987-2025年】考研数学三真题答案及解析/2011年数学三真题答案解析.pdf`），题面见真题册 PDF p47；
- **页码**：解析册 PDF p6（整页）；
- **生成命令**：`参考文件/_venv/Scripts/python.exe tools/refs-vision.py --pdf "参考文件/真题/数学/6、【1987-2025年】考研数学三真题答案及解析/2011年数学三真题答案解析.pdf" --page 6 --dpi 110 --out "backup/scratch/refs-math3-ans/crops/2011_ans_p6.png"`
- **裁片**：`backup/scratch/refs-math3-ans/crops/2011_ans_p6.png`（797×1127 px / 74873 B / sha256 `38e2b37570401a2b278cec1c0ed7bd2a7a0b330a40f20db0ccfebcad7cc1bae3`）
- **亲读原文**：「(17)（本题满分 10 分）【解析】令 $t=\sqrt x$，则 $x=t^2,dx=2tdt$，所以 $\int\frac{\arcsin\sqrt x+\ln x}{\sqrt x}dx=\int\frac{\arcsin t+\ln t^2}{t}\cdot2tdt=2\int(\arcsin t+\ln t^2)dt$ $=2t\arcsin t-2\int\frac{t}{\sqrt{1-t^2}}dt+2t\ln t^2-2\int t\frac{2t}{t^2}dt$，最终 $=2\sqrt x\arcsin\sqrt x+2\sqrt x\ln x+2\sqrt{1-x}-4\sqrt x+C$。」
- **结论**：答案 $2\sqrt x\arcsin\sqrt x+2\sqrt x\ln x+2\sqrt{1-x}-4\sqrt x+C$（kind=`solution`，锚点 `2\sqrt x\arcsin\sqrt x+2\sqrt x\ln x+2\sqrt{1-x}-4\sqrt x+C`）；三源一致性 = all（题面 真题册 p47 + 解析册 p6 亲读 + 独立复算）；
  - 独立复算：独立复算同值：换元后分部积分得 $2t\arcsin t+2\sqrt{1-t^2}+2t\ln t^2-4t+C$，回代 $t=\sqrt x$ 即得。
- **置信度**：high；

### m3-2011-18 ｜ 三(18) ｜ 解答

- **材料**：2011 年数学三真题答案解析册（`参考文件/真题/数学/6、【1987-2025年】考研数学三真题答案及解析/2011年数学三真题答案解析.pdf`），题面见真题册 PDF p47；
- **页码**：解析册 PDF p7（整页）；
- **生成命令**：`参考文件/_venv/Scripts/python.exe tools/refs-vision.py --pdf "参考文件/真题/数学/6、【1987-2025年】考研数学三真题答案及解析/2011年数学三真题答案解析.pdf" --page 7 --dpi 110 --out "backup/scratch/refs-math3-ans/crops/2011_ans_p7.png"`
- **裁片**：`backup/scratch/refs-math3-ans/crops/2011_ans_p7.png`（797×1127 px / 87320 B / sha256 `712866189111ee6dbd5317aae7d24cd9d0118a6df9d48122262d4c8a9cd38dc2`）
- **亲读原文**：「(18)（本题满分 10 分）【解析】设 $f(x)=4\arctan x-x+\frac{4\pi}{3}-\sqrt3$，则 $f'(x)=\frac{4}{1+x^2}-1=\frac{(\sqrt3-x)(\sqrt3+x)}{1+x^2}$，令 $f'(x)=0$，解得驻点 $x_1=\sqrt3,x_2=-\sqrt3$…又 $f(\sqrt3)=\frac{8\pi}{3}-2\sqrt3>0$，$\lim_{x\to+\infty}f(x)=-\infty<0$，由零点定理可知，存在 $x_0\in(\sqrt3,+\infty)$，使 $f(x_0)=0$；所以，方程 $4\arctan x-x+\frac{4\pi}{3}-\sqrt3=0$ 恰有两实根。」
- **结论**：答案 方程 $4\arctan x-x+\frac{4\pi}{3}-\sqrt3=0$ 恰有两个实根（kind=`solution`，锚点 `恰有两实根`）；三源一致性 = all（题面 真题册 p47 + 解析册 p7 亲读 + 独立复算）；
  - 独立复算：独立复算同结论：$f(-\sqrt3)=0$ 且 $x>-\sqrt3$ 段单调递增，$x>\sqrt3$ 段单调递减且 $f(\sqrt3)>0,\lim_{x\to\infty}f=-\infty$ ⇒ 两根。
- **置信度**：high；

### m3-2011-19 ｜ 三(19) ｜ 解答

- **材料**：2011 年数学三真题答案解析册（`参考文件/真题/数学/6、【1987-2025年】考研数学三真题答案及解析/2011年数学三真题答案解析.pdf`），题面见真题册 PDF p47；
- **页码**：解析册 PDF p7（整页）；
- **生成命令**：`参考文件/_venv/Scripts/python.exe tools/refs-vision.py --pdf "参考文件/真题/数学/6、【1987-2025年】考研数学三真题答案及解析/2011年数学三真题答案解析.pdf" --page 7 --dpi 110 --out "backup/scratch/refs-math3-ans/crops/2011_ans_p7.png"`
- **裁片**：`backup/scratch/refs-math3-ans/crops/2011_ans_p7.png`（797×1127 px / 87320 B / sha256 `712866189111ee6dbd5317aae7d24cd9d0118a6df9d48122262d4c8a9cd38dc2`）
  - 续页补渲：`backup/scratch/refs-math3-ans/crops/2011_ans_p8.png`（797×1127 px / 78355 B / sha256 `7b946d1f813c5382dd9ceea9328c3a7aa0f8c984ef1237384091e1465ee96a25`）
- **亲读原文**：「(19)（本题满分 10 分）【解析】$\iint_{D_t}f(t)dxdy=\frac12t^2f(t)$，$\iint_{D_t}f'(x+y)dxdy=\int_0^t dx\int_0^{t-x}f'(x+y)dy=\int_0^t(f(t)-f(x))dx=tf(t)-\int_0^tf(x)dx$，由题设有 $tf(t)-\int_0^tf(x)dx=\frac12t^2f(t)$，上式两端求导，整理得 $(2-t)f'(t)=2f(t)$（解续 p8）…解得 $f(t)=\frac{C}{(t-2)^2}$，带入 $f(0)=1$，得 $C=4$。所以 $f(x)=\frac{4}{(x-2)^2},0\le x\le1$。」
- **结论**：答案 $f(x)=\dfrac{4}{(x-2)^2}$（$0\le x\le1$）（kind=`solution`，锚点 `f(x)=\dfrac{4}{(x-2)^2},\ 0\le x\le1`）；三源一致性 = all（题面 真题册 p47 + 解析册 p7 亲读 + 独立复算）；
  - 独立复算：独立复算同值：化为微分方程 $(2-t)f'=2f$ ⇒ $f=C/(t-2)^2$；$f(0)=1\Rightarrow C=4$。
- **置信度**：high；

### m3-2011-20 ｜ 三(20) ｜ 解答

- **材料**：2011 年数学三真题答案解析册（`参考文件/真题/数学/6、【1987-2025年】考研数学三真题答案及解析/2011年数学三真题答案解析.pdf`），题面见真题册 PDF p47；
- **页码**：解析册 PDF p8（整页）；
- **生成命令**：`参考文件/_venv/Scripts/python.exe tools/refs-vision.py --pdf "参考文件/真题/数学/6、【1987-2025年】考研数学三真题答案及解析/2011年数学三真题答案解析.pdf" --page 8 --dpi 110 --out "backup/scratch/refs-math3-ans/crops/2011_ans_p8.png"`
- **裁片**：`backup/scratch/refs-math3-ans/crops/2011_ans_p8.png`（797×1127 px / 78355 B / sha256 `7b946d1f813c5382dd9ceea9328c3a7aa0f8c984ef1237384091e1465ee96a25`）
- **亲读原文**：「(20)（本题满分 11 分）【解析】(Ⅰ) 由于 $\alpha_1,\alpha_2,\alpha_3$ 不能由 $\beta_1,\beta_2,\beta_3$ 线性表示，对 $(\beta_1,\beta_2,\beta_3,\alpha_1,\alpha_2,\alpha_3)$ 进行初等行变换…当 $a=5$ 时，$r(\beta_1,\beta_2,\beta_3)=2\ne r(\beta_1,\beta_2,\beta_3,\alpha_1)=3$，此时 $\alpha_1$ 不能由 $\beta_1,\beta_2,\beta_3$ 线性表示…(Ⅱ)…故 $\beta_1=2\alpha_1+4\alpha_2-\alpha_3$，$\beta_2=\alpha_1+2\alpha_2$，$\beta_3=5\alpha_1+10\alpha_2-2\alpha_3$。」
- **结论**：答案 $a=5$；$\beta_1=2\alpha_1+4\alpha_2-\alpha_3$，$\beta_2=\alpha_1+2\alpha_2$，$\beta_3=5\alpha_1+10\alpha_2-2\alpha_3$（kind=`solution`，锚点 `\beta_1=2\alpha_1+4\alpha_2-\alpha_3,\ \beta_2=\alpha_1+2\alpha_2,\ \beta_3=5\alpha_1+10\alpha_2-2\alpha_3`）；三源一致性 = all（题面 真题册 p47 + 解析册 p8 亲读 + 独立复算）；
  - 独立复算：独立复算同值：行变换得 $r$ 跳变发生在 $a-5=0$；解线性表示方程组的解即上述系数。
- **置信度**：high；

### m3-2011-21 ｜ 三(21) ｜ 解答

- **材料**：2011 年数学三真题答案解析册（`参考文件/真题/数学/6、【1987-2025年】考研数学三真题答案及解析/2011年数学三真题答案解析.pdf`），题面见真题册 PDF p48；
- **页码**：解析册 PDF p9（整页）；
- **生成命令**：`参考文件\_venv\Scripts\python.exe tools/refs-vision.py --pdf "参考文件/真题/数学/6、【1987-2025年】考研数学三真题答案及解析/2011年数学三真题答案解析.pdf" --page 9 --dpi 110 --out "backup/scratch/refs-math3-ans/crops/2011_ans_p9.png"`
- **裁片**：`backup/scratch/refs-math3-ans/crops/2011_ans_p9.png`（797×1127 px / 82808 B / sha256 `af1ea03baf53b07054290d6a8464387ce410f8a7342e3b6291ec8f8746aed78d`）
  - 续页补渲：`backup/scratch/refs-math3-ans/crops/2011_ans_p8.png`（797×1127 px / 78355 B / sha256 `7b946d1f813c5382dd9ceea9328c3a7aa0f8c984ef1237384091e1465ee96a25`）
- **亲读原文**：「(21)【解析】(Ⅰ) 由于 $A\begin{pmatrix}1&1\\0&0\\-1&1\end{pmatrix}=\begin{pmatrix}-1&1\\0&0\\1&1\end{pmatrix}$，设 $\alpha_1=(1,0,-1)^T,\alpha_2=(1,0,1)^T$，则 $A(\alpha_1,\alpha_2)=(-\alpha_1,\alpha_2)$，即 $A\alpha_1=-\alpha_1,A\alpha_2=\alpha_2$…知 $A$ 的特征值为 $\lambda_1=-1,\lambda_2=1$…由于 $r(A)=2$，故 $|A|=0$，所以 $\lambda_3=0$…(Ⅱ) 由于不同特征值对应的特征向量已经正交，只需单位化：$\beta_1=\frac{\alpha_1}{\|\alpha_1\|}=\frac{1}{\sqrt2}(1,0,-1)^T,\beta_2=\frac{1}{\sqrt2}(1,0,1)^T,\beta_3=(0,1,0)^T$。令 $Q=(\beta_1,\beta_2,\beta_3)$，则 $Q^TAQ=\Lambda$（解续 p10，$A=Q\Lambda Q^T=\begin{pmatrix}0&0&1\\0&0&0\\1&0&0\end{pmatrix}$）。」
- **结论**：答案 $\lambda_1=-1,\lambda_2=1,\lambda_3=0$；$Q=(\beta_1,\beta_2,\beta_3)$，$A=\begin{pmatrix}0&0&1\\0&0&0\\1&0&0\end{pmatrix}$（kind=`solution`，锚点 `\lambda_1=-1,\lambda_2=1,\lambda_3=0;\ A=\begin{pmatrix}0&0&1\\0&0&0\\1&0&0\end{pmatrix}`）；三源一致性 = all（题面 真题册 p48 + 解析册 p9 亲读 + 独立复算）；
  - 独立复算：独立复算同值：$A$ 对称、$A\alpha_1=-\alpha_1$、$A\alpha_2=\alpha_2$、$r(A)=2$ 唯一定出 $A=\begin{pmatrix}0&0&1\\0&0&0\\1&0&0\end{pmatrix}$，其特征值为 $\pm1,0$。
- **置信度**：high；

### m3-2011-22 ｜ 三(22) ｜ 解答

- **材料**：2011 年数学三真题答案解析册（`参考文件/真题/数学/6、【1987-2025年】考研数学三真题答案及解析/2011年数学三真题答案解析.pdf`），题面见真题册 PDF p48；
- **页码**：解析册 PDF p10（整页）；
- **生成命令**：`参考文件/_venv/Scripts/python.exe tools/refs-vision.py --pdf "参考文件/真题/数学/6、【1987-2025年】考研数学三真题答案及解析/2011年数学三真题答案解析.pdf" --page 10 --dpi 110 --out "backup/scratch/refs-math3-ans/crops/2011_ans_p10.png"`
- **裁片**：`backup/scratch/refs-math3-ans/crops/2011_ans_p10.png`（797×1127 px / 72378 B / sha256 `0be87596c5c3b393e5bf832fe11664fac8e321c7a28e48ce17639c2529923990`）
  - 续页补渲：`backup/scratch/refs-math3-ans/crops/2011_ans_p11.png`（797×1127 px / 73733 B / sha256 `8589a152a136610cdd648145a2efa8bdd7f7800e245c3b6a39111948bca7c762`）
- **亲读原文**：「(22)（本题满分 11 分）【解析】(Ⅰ) 因为 $P\{X^2=Y^2\}=1$，所以 $P\{X^2\ne Y^2\}=1-P\{X^2=Y^2\}=0$…得到 $P\{X=0,Y=0\}=P\{X=0\}-P\{X=0,Y=-1\}-P\{X=0,Y=1\}=\frac13$…(Ⅱ) $Z$ 的所有可能取值为 $-1,0,1$，$P\{Z=-1\}=P\{X=1,Y=-1\}=\frac13$，$P\{Z=1\}=\frac13$，$P\{Z=0\}=\frac13$。(Ⅲ) 因为 $\rho_{XY}=\frac{\mathrm{Cov}(XY)}{\sqrt{D(X)}\sqrt{D(Y)}}=\frac{E(XY)-E(X)E(Y)}{\sqrt{D(X)}\sqrt{D(Y)}}$…所以 $E(XY)-E(X)E(Y)=0$，即 $X,Y$ 的相关系数 $\rho_{XY}=0$。」
- **结论**：答案 联合分布三格各 $\frac13$；$Z=XY$ 分布三值各 $\frac13$；$\rho_{XY}=0$（kind=`solution`，锚点 `\rho_{XY}=0`）；三源一致性 = all（题面 真题册 p48 + 解析册 p10 亲读 + 独立复算）；
  - 独立复算：独立复算同值：边界分布 $P(X=0)=P(X=1)=\frac12$ 与对角条件给出三格各 $\frac13$；$E(XY)=E(Y)=0$ ⇒ $\rho=0$。
- **置信度**：high；

### m3-2011-23 ｜ 三(23) ｜ 解答

- **材料**：2011 年数学三真题答案解析册（`参考文件/真题/数学/6、【1987-2025年】考研数学三真题答案及解析/2011年数学三真题答案解析.pdf`），题面见真题册 PDF p48；
- **页码**：解析册 PDF p11（整页）；
- **生成命令**：`参考文件/_venv/Scripts/python.exe tools/refs-vision.py --pdf "参考文件/真题/数学/6、【1987-2025年】考研数学三真题答案及解析/2011年数学三真题答案解析.pdf" --page 11 --dpi 110 --out "backup/scratch/refs-math3-ans/crops/2011_ans_p11.png"`
- **裁片**：`backup/scratch/refs-math3-ans/crops/2011_ans_p11.png`（797×1127 px / 73733 B / sha256 `8589a152a136610cdd648145a2efa8bdd7f7800e245c3b6a39111948bca7c762`）
- **亲读原文**：「(23)（本题满分 11 分）【解析】二维连续型随机变量 $(X,Y)$ 的概率密度为 $f(x,y)=\begin{cases}1,0<y<1,y<x<2-y,\\0,其它.\end{cases}$ (Ⅰ) 当 $0<x<1$ 时，$f_X(x)=\int_{-\infty}^{+\infty}f(x,y)dy=\int_0^x1dy=x$；当 $1\le x<2$ 时，$f_X(x)=\int_0^{2-x}1dy=2-x$。(Ⅱ) 当 $0<y<1$ 时，$Y$ 的边缘概率密度为 $f_Y(y)=\int_y^{2-y}1dx=2-2y$；$f_{X|Y}(x|y)=\frac{f(x,y)}{f_Y(y)}=\begin{cases}\frac{1}{2-2y},&y<x<2-y,\\0,&其它.\end{cases}$」
- **结论**：答案 $f_X(x)=x\,(0<x<1)$、$2-x\,(1\le x<2)$；$f_Y(y)=2-2y\,(0<y<1)$；$f_{X|Y}(x|y)=\dfrac{1}{2-2y}\,(y<x<2-y)$（kind=`solution`，锚点 `f_{X|Y}(x|y)=\dfrac{1}{2-2y},\ y<x<2-y`）；三源一致性 = all（题面 真题册 p48 + 解析册 p11 亲读 + 独立复算）；
  - 独立复算：独立复算同值：区域 $\{0<y<1,y<x<2-y\}$ 的面积积分给出两条边缘密度，条件密度为常数 $1/(2-2y)$。
- **置信度**：high；

### m3-2011-9 ｜ 二(9) ｜ 填空

- **材料**：2011 年数学三真题答案解析册（`参考文件/真题/数学/6、【1987-2025年】考研数学三真题答案及解析/2011年数学三真题答案解析.pdf`），题面见真题册 PDF p46；
- **页码**：解析册 PDF p4（整页）；
- **生成命令**：`参考文件/_venv/Scripts/python.exe tools/refs-vision.py --pdf "参考文件/真题/数学/6、【1987-2025年】考研数学三真题答案及解析/2011年数学三真题答案解析.pdf" --page 4 --dpi 110 --out "backup/scratch/refs-math3-ans/crops/2011_ans_p4.png"`
- **裁片**：`backup/scratch/refs-math3-ans/crops/2011_ans_p4.png`（797×1127 px / 84311 B / sha256 `6780f43e8409f89bf47cb970f4bb6b689140eb97eb3b65aa66c8df854f4783fe`）
- **亲读原文**：「二、填空题(9~14 小题，每小题 4 分，共 24 分，请将答案写在答题纸指定位置上．) (9)【答案】$e^{3x}(1+3x)$。【解析】因为 $f(x)=\lim_{t\to0}x(1+3t)^{\frac{x}{t}}=x\lim_{t\to0}\left[(1+3t)^{\frac{1}{3t}}\right]^{3x}=x\cdot e^{3x}$，所以 $f'(x)=e^{3x}(1+3x)$。」
- **结论**：答案 $e^{3x}(1+3x)$（kind=`fill`，锚点 `\mathrm e^{3x}(1+3x)`）；三源一致性 = all（题面 真题册 p46 + 解析册 p4 亲读 + 独立复算）；
  - 独立复算：独立复算同值：内层极限 $\lim_t(1+3t)^{1/(3t)}=e$，故 $f=x e^{3x}$，$f'=e^{3x}(1+3x)$。
- **置信度**：high；

### m3-2012-10 ｜ 二(10) ｜ 填空

- **材料**：2012 年数学三真题答案解析册（`参考文件/真题/数学/6、【1987-2025年】考研数学三真题答案及解析/2012年数学三真题答案解析.pdf`），题面见真题册 PDF p42；
- **页码**：解析册 PDF p5（整页）；
- **生成命令**：`参考文件/_venv/Scripts/python.exe tools/refs-vision.py --pdf "参考文件/真题/数学/6、【1987-2025年】考研数学三真题答案及解析/2012年数学三真题答案解析.pdf" --page 5 --dpi 110 --out "backup/scratch/refs-math3-ans/crops/2012_ans_p5.png"`
- **裁片**：`backup/scratch/refs-math3-ans/crops/2012_ans_p5.png`（910×1287 px / 110254 B / sha256 `c68ae28d4cdbada578821e28895fd900fe8e7d3d2dc1c496f1db1929a39bafd4`）
- **亲读原文**：「(10) 设函数 $f(x)=\begin{cases}\ln\sqrt x,&x\ge1,\\2x-1,&x<1,\end{cases}y=f(f(x))$，求 $\frac{dy}{dx}\Big|_{x=0}$____。【答案】4。【解析】$\frac{dy}{dx}\Big|_{x=0}=f'(f(x))f'(x)\big|_{x=0}=f'(f(0))f'(0)=f'(-1)f'(0)$，由 $f(x)$ 的表达式可知 $f'(0)=f'(-1)=2$，可知 $\frac{dy}{dx}\big|_{x=0}=4$。」
- **结论**：答案 $4$（kind=`fill`，锚点 `4`）；三源一致性 = all（题面 真题册 p42 + 解析册 p5 亲读 + 独立复算）；
  - 独立复算：独立复算同值：$f(0)=-1$，$f'(-1)=f'(0)=2$，链式相乘得 4。
- **置信度**：high；

### m3-2012-11 ｜ 二(11) ｜ 填空

- **材料**：2012 年数学三真题答案解析册（`参考文件/真题/数学/6、【1987-2025年】考研数学三真题答案及解析/2012年数学三真题答案解析.pdf`），题面见真题册 PDF p42；
- **页码**：解析册 PDF p5（整页）；
- **生成命令**：`参考文件/_venv/Scripts/python.exe tools/refs-vision.py --pdf "参考文件/真题/数学/6、【1987-2025年】考研数学三真题答案及解析/2012年数学三真题答案解析.pdf" --page 5 --dpi 110 --out "backup/scratch/refs-math3-ans/crops/2012_ans_p5.png"`
- **裁片**：`backup/scratch/refs-math3-ans/crops/2012_ans_p5.png`（910×1287 px / 110254 B / sha256 `c68ae28d4cdbada578821e28895fd900fe8e7d3d2dc1c496f1db1929a39bafd4`）
- **亲读原文**：「(11) 函数 $z=f(x,y)$ 满足 $\lim_{\substack{x\to0\\y\to1}}\frac{f(x,y)-2x+y-2}{\sqrt{x^2+(y-1)^2}}=0$，则 $dz|_{(0,1)}=$____。【答案】$2dx-dy$。【解析】由题意可知分子应为分母的高阶无穷小，即 $f(x,y)=2x-y+2+o(\sqrt{x^2+(y-1)^2})$，所以 $\frac{\partial z}{\partial x}\big|_{(0,1)}=2$，$\frac{\partial z}{\partial y}\big|_{(0,1)}=-1$，故 $dz|_{(0,1)}=2dx-dy$。」
- **结论**：答案 $2\mathrm dx-\mathrm dy$（kind=`fill`，锚点 `2\mathrm dx-\mathrm dy`）；三源一致性 = all（题面 真题册 p42 + 解析册 p5 亲读 + 独立复算）；
  - 独立复算：独立复算同值：可微 + 沿任意方向 $o(\rho)$ ⇒ 切平面即 $z=2x-y+2$，故 $z_x=2,z_y=-1$。
- **置信度**：high；

### m3-2012-12 ｜ 二(12) ｜ 填空

- **材料**：2012 年数学三真题答案解析册（`参考文件/真题/数学/6、【1987-2025年】考研数学三真题答案及解析/2012年数学三真题答案解析.pdf`），题面见真题册 PDF p42；
- **页码**：解析册 PDF p5（整页）；
- **生成命令**：`参考文件/_venv/Scripts/python.exe tools/refs-vision.py --pdf "参考文件/真题/数学/6、【1987-2025年】考研数学三真题答案及解析/2012年数学三真题答案解析.pdf" --page 5 --dpi 110 --out "backup/scratch/refs-math3-ans/crops/2012_ans_p5.png"`
- **裁片**：`backup/scratch/refs-math3-ans/crops/2012_ans_p5.png`（910×1287 px / 110254 B / sha256 `c68ae28d4cdbada578821e28895fd900fe8e7d3d2dc1c496f1db1929a39bafd4`）
- **亲读原文**：「(12) 由曲线 $y=\frac4x$ 和直线 $y=x$ 及 $y=4x$ 在第一象限中所围图形的面积为？【答案】$4\ln2$。【解析】被积函数为 1 的二重积分来求，$S=\int_0^2dy\int_{y/4}^{y}dx+\int_2^4dy\int_{y/4}^{4/y}dx=\frac32+4\ln2-\frac32=4\ln2$。」
- **结论**：答案 $4\ln2$（kind=`fill`，锚点 `4\ln2`）；三源一致性 = all（题面 真题册 p42 + 解析册 p5 亲读 + 独立复算）；
  - 独立复算：独立复算同值：三段面积 $\frac12\cdot2\cdot1.5=1.5$、$\frac12(2\cdot2-\frac{2}{4}\cdot\frac12)=1.875$? 直接积分 $\int_{1}^{2}(4x-x)dx+\int_2^4(\frac4x-x)dx=3+4\ln2-6+1.5=4\ln2$ ✓。
- **置信度**：high；

### m3-2012-13 ｜ 二(13) ｜ 填空

- **材料**：2012 年数学三真题答案解析册（`参考文件/真题/数学/6、【1987-2025年】考研数学三真题答案及解析/2012年数学三真题答案解析.pdf`），题面见真题册 PDF p42；
- **页码**：解析册 PDF p5（整页）；
- **生成命令**：`参考文件/_venv/Scripts/python.exe tools/refs-vision.py --pdf "参考文件/真题/数学/6、【1987-2025年】考研数学三真题答案及解析/2012年数学三真题答案解析.pdf" --page 5 --dpi 110 --out "backup/scratch/refs-math3-ans/crops/2012_ans_p5.png"`
- **裁片**：`backup/scratch/refs-math3-ans/crops/2012_ans_p5.png`（910×1287 px / 110254 B / sha256 `c68ae28d4cdbada578821e28895fd900fe8e7d3d2dc1c496f1db1929a39bafd4`）
- **亲读原文**：「(13) 设 $A$ 为 3 阶矩阵，$|A|=3$，$A^*$ 为 $A$ 的伴随矩阵，若交换 $A$ 的第一行与第二行得到矩阵 $B$，则 $|BA^*|=$____。【答案】-27。【解析】由于 $B=E_{12}A$，故 $BA^*=E_{12}A\cdot A^*=|A|E_{12}=3E_{12}$，所以 $|BA^*|=|3E_{12}|=3^3|E_{12}|=27\cdot(-1)=-27$。」
- **结论**：答案 $-27$（kind=`fill`，锚点 `-27`）；三源一致性 = all（题面 真题册 p42 + 解析册 p5 亲读 + 独立复算）；
  - 独立复算：独立复算同值：$AA^*=|A|E=3E$；$|E_{12}|=-1$；$|BA^*|=|E_{12}|\,|3E|=-27$。
- **置信度**：high；

### m3-2012-14 ｜ 二(14) ｜ 填空

- **材料**：2012 年数学三真题答案解析册（`参考文件/真题/数学/6、【1987-2025年】考研数学三真题答案及解析/2012年数学三真题答案解析.pdf`），题面见真题册 PDF p42；
- **页码**：解析册 PDF p5（整页）；
- **生成命令**：`参考文件/_venv/Scripts/python.exe tools/refs-vision.py --pdf "参考文件/真题/数学/6、【1987-2025年】考研数学三真题答案及解析/2012年数学三真题答案解析.pdf" --page 5 --dpi 110 --out "backup/scratch/refs-math3-ans/crops/2012_ans_p5.png"`
- **裁片**：`backup/scratch/refs-math3-ans/crops/2012_ans_p5.png`（910×1287 px / 110254 B / sha256 `c68ae28d4cdbada578821e28895fd900fe8e7d3d2dc1c496f1db1929a39bafd4`）
  - 续页补渲：`backup/scratch/refs-math3-ans/crops/2012_ans_p6.png`（910×1287 px / 90239 B / sha256 `cb12240a0736be8fd3925154c49924d62650909feae122436068ec00331a6fba`）
- **亲读原文**：「(14) 设 $A,B,C$ 是随机事件，$A,C$ 互不相容，$P(AB)=\frac12,P(C)=\frac13$，则 $P(AB|\bar C)=$____。【答案】$\frac34$。【解析】由条件概率的定义…其中 $P(\bar C)=1-P(C)=\frac23$，$P(AB\bar C)=P(AB)-P(ABC)=\frac12-P(ABC)$，由于 $A,C$ 互不相容，即 $AC=\phi,P(AC)=0$，又 $ABC\subset AC$，得 $P(ABC)=0$，代入得 $P(AB\bar C)=\frac12$，故 $P(AB|\bar C)=\frac34$。」
- **结论**：答案 $\dfrac34$（kind=`fill`，锚点 `\dfrac34`）；三源一致性 = all（题面 真题册 p42 + 解析册 p5 亲读 + 独立复算）；
  - 独立复算：独立复算同值：$ABC\subseteq AC=\varnothing$ ⇒ $P(AB\bar C)=P(AB)=\frac12$；除以 $P(\bar C)=\frac23$ 得 $\frac34$。
- **置信度**：high；

### m3-2012-15 ｜ 三(15) ｜ 解答

- **材料**：2012 年数学三真题答案解析册（`参考文件/真题/数学/6、【1987-2025年】考研数学三真题答案及解析/2012年数学三真题答案解析.pdf`），题面见真题册 PDF p42；
- **页码**：解析册 PDF p6（整页）；
- **生成命令**：`参考文件/_venv/Scripts/python.exe tools/refs-vision.py --pdf "参考文件/真题/数学/6、【1987-2025年】考研数学三真题答案及解析/2012年数学三真题答案解析.pdf" --page 6 --dpi 110 --out "backup/scratch/refs-math3-ans/crops/2012_ans_p6.png"`
- **裁片**：`backup/scratch/refs-math3-ans/crops/2012_ans_p6.png`（910×1287 px / 90239 B / sha256 `cb12240a0736be8fd3925154c49924d62650909feae122436068ec00331a6fba`）
- **亲读原文**：「(15)（本题满分 10 分）计算 $\lim_{x\to0}\frac{e^{x^2}-e^{2-2\cos x}}{x^4}$。【解析】$=\lim_{x\to0}e^{2-2\cos x}\lim_{x\to0}\frac{e^{x^2-2+2\cos x}-1}{x^4}=\lim_{x\to0}\frac{x^2-2+2\cos x}{x^4}$ $=\lim_{x\to0}\frac{x^2-2+2\left(1-\frac{x^2}{2}+\frac{x^4}{4!}+o(x^2)\right)}{x^4}=\lim_{x\to0}\frac{\frac{x^4}{12}+o(x^2)}{x^4}=\frac{1}{12}$。」
- **结论**：答案 $\dfrac{1}{12}$（kind=`solution`，锚点 `\dfrac{1}{12}`）；三源一致性 = all（题面 真题册 p42 + 解析册 p6 亲读 + 独立复算）；
  - 独立复算：独立复算同值：$x^2-2+2\cos x=\frac{x^4}{12}+o(x^4)$，比值 $\to\frac1{12}$。
- **置信度**：high；

### m3-2012-16 ｜ 三(16) ｜ 解答

- **材料**：2012 年数学三真题答案解析册（`参考文件/真题/数学/6、【1987-2025年】考研数学三真题答案及解析/2012年数学三真题答案解析.pdf`），题面见真题册 PDF p42；
- **页码**：解析册 PDF p7（整页）；
- **生成命令**：`参考文件/_venv/Scripts/python.exe tools/refs-vision.py --pdf "参考文件/真题/数学/6、【1987-2025年】考研数学三真题答案及解析/2012年数学三真题答案解析.pdf" --page 7 --dpi 110 --out "backup/scratch/refs-math3-ans/crops/2012_ans_p7.png"`
- **裁片**：`backup/scratch/refs-math3-ans/crops/2012_ans_p7.png`（910×1287 px / 111119 B / sha256 `6c21a78fcf146b0027aa3617f033e900be64846f0e47d2a7b0e6f833e30aa9f1`）
  - 续页补渲：`backup/scratch/refs-math3-ans/crops/2012_ans_p6.png`（910×1287 px / 90239 B / sha256 `cb12240a0736be8fd3925154c49924d62650909feae122436068ec00331a6fba`）
- **亲读原文**：「(16)（本题满分 10 分）计算二重积分 $\iint_D e^x xy\,dxdy$，其中 $D$ 为由曲线 $y=\sqrt x$ 与 $y=\frac{1}{\sqrt x}$ 所围区域。【解析】由题意知，区域 $D=\left\{(x,y)\left|0<x\le1,\sqrt x<y<\frac{1}{\sqrt x}\right.\right\}$，所以 $\iint_D e^x xy\,dxdy=\lim_{x\to0}\int_0^1dx\int_{\sqrt x}^{\frac{1}{\sqrt x}}e^x xy\,dy=\dots=\frac12\lim_{x\to0}(-1+2(e-(e-1)))=\frac12$。」
- **结论**：答案 $\dfrac12$（kind=`solution`，锚点 `\dfrac12`）；三源一致性 = all（题面 真题册 p42 + 解析册 p7 亲读 + 独立复算）；
  - 独立复算：独立复算同值：内层积分得 $\frac{e^x}{2}x(y^2)$ 差 $=\frac12e^x(\frac1x-x)$，拆项积分后 $\to\frac12$。
- **置信度**：high；

### m3-2012-17 ｜ 三(17) ｜ 解答

- **材料**：2012 年数学三真题答案解析册（`参考文件/真题/数学/6、【1987-2025年】考研数学三真题答案及解析/2012年数学三真题答案解析.pdf`），题面见真题册 PDF p42；
- **页码**：解析册 PDF p8（整页）；
- **生成命令**：`参考文件/_venv/Scripts/python.exe tools/refs-vision.py --pdf "参考文件/真题/数学/6、【1987-2025年】考研数学三真题答案及解析/2012年数学三真题答案解析.pdf" --page 8 --dpi 110 --out "backup/scratch/refs-math3-ans/crops/2012_ans_p8.png"`
- **裁片**：`backup/scratch/refs-math3-ans/crops/2012_ans_p8.png`（910×1287 px / 85918 B / sha256 `c0425b64a46f20a99249c58336fdcc505a4d9184fe1f97bf328e53eeb75d18db`）
  - 续页补渲：`backup/scratch/refs-math3-ans/crops/2012_ans_p7.png`（910×1287 px / 111119 B / sha256 `6c21a78fcf146b0027aa3617f033e900be64846f0e47d2a7b0e6f833e30aa9f1`）
- **亲读原文**：「(17)（本题满分 10 分）… 2）若 $x+y=50$，则 $y=50-x(0\le x\le50)$… $C(x)=20x+\frac{x^2}{4}+6(50-x)+\frac12(50-x)^2+10000=\frac34x^2-36x+11550$，所以，令 $C'(x)=\frac32x-36=0$，得 $x=24,y=26$，这时总成本最小 $C(24,26)=11118$；3）总产量为 50 件且总成本最小时甲产品的边际成本为 $C_x'(24,26)=32$，表示在要求总产量为 50 件时，在甲产品为 24 件，这时要改变一个单位的产量，成本会发生 32 万元的改变。」
- **结论**：答案 $C(x,y)=20x+\dfrac{x^2}{4}+6y+\dfrac{y^2}{2}+10000$；$x=24,y=26$ 时 $C_{\min}=11118$；边际成本 $C_x'(24,26)=32$（万元/件）（kind=`solution`，锚点 `C(x,y)=20x+\dfrac{x^2}{4}+6y+\dfrac{y^2}{2}+10000;\ C_{\min}=11118`）；三源一致性 = all（题面 真题册 p42 + 解析册 p8 亲读 + 独立复算）；
  - 独立复算：独立复算同值：$C(24,26)=\frac34\cdot576-864+11550=11118$；$C_x'=20+x/2\Rightarrow C_x'(24,26)=32$。
  - **不一致登记**：other_source: 早先 t4 记录（源自 参考文件/_extract OCR 文本）称『源末值印 11524』；ruling: 以解析册裁片为准：本页两处均印 11118；reason: 独立复算 C(24,26)=11118，与裁片一致；11524 系 OCR 讹字（1/1/5/2/4 与 1/1/1/1/8 字形相近）
- **置信度**：high；

### m3-2012-18 ｜ 三(18) ｜ 解答

- **材料**：2012 年数学三真题答案解析册（`参考文件/真题/数学/6、【1987-2025年】考研数学三真题答案及解析/2012年数学三真题答案解析.pdf`），题面见真题册 PDF p43；
- **页码**：解析册 PDF p8（整页）；
- **生成命令**：`参考文件/_venv/Scripts/python.exe tools/refs-vision.py --pdf "参考文件/真题/数学/6、【1987-2025年】考研数学三真题答案及解析/2012年数学三真题答案解析.pdf" --page 8 --dpi 110 --out "backup/scratch/refs-math3-ans/crops/2012_ans_p8.png"`
- **裁片**：`backup/scratch/refs-math3-ans/crops/2012_ans_p8.png`（910×1287 px / 85918 B / sha256 `c0425b64a46f20a99249c58336fdcc505a4d9184fe1f97bf328e53eeb75d18db`）
- **亲读原文**：「(18)（本题满分 10 分）证明：$x\ln\frac{1+x}{1-x}+\cos x\ge1+\frac{x^2}{2},-1<x<1$。【解析】令 $f(x)=x\ln\frac{1+x}{1-x}+\cos x-1-\frac{x^2}{2}$，可得 $f'(x)=\ln\frac{1+x}{1-x}+\frac{2x}{1-x^2}-\sin x-x=\ln\frac{1+x}{1-x}+\frac{1+x^2}{1-x^2}x-\sin x$，当 $0<x<1$ 时…故 $f'(x)\ge0$，而 $f(0)=0$，即得…；当 $-1<x<0$ 时…故 $f'(x)\ge0$，即得…可知 $x\ln\frac{1+x}{1-x}+\cos x\ge1+\frac{x^2}{2},-1<x<1$。」
- **结论**：答案 证明 $x\ln\dfrac{1+x}{1-x}+\cos x\ge1+\dfrac{x^2}{2}$（$-1<x<1$）（kind=`solution`，锚点 `x\ln\dfrac{1+x}{1-x}+\cos x\ge1+\dfrac{x^2}{2}`）；三源一致性 = all（题面 真题册 p43 + 解析册 p8 亲读 + 独立复算）；
  - 独立复算：独立复核同结论：$f'(x)$ 在 $(0,1)$ 与 $(-1,0)$ 均 $\ge0$（由 $\ln\frac{1+x}{1-x}\ge0$、$\frac{1+x^2}{1-x^2}>1$、$x-\sin x$ 的符号），$f(0)=0$ 为最小值 ⇒ 不等式成立。
- **置信度**：high；

### m3-2012-19 ｜ 三(19) ｜ 解答

- **材料**：2012 年数学三真题答案解析册（`参考文件/真题/数学/6、【1987-2025年】考研数学三真题答案及解析/2012年数学三真题答案解析.pdf`），题面见真题册 PDF p43；
- **页码**：解析册 PDF p9（整页）；
- **生成命令**：`参考文件/_venv/Scripts/python.exe tools/refs-vision.py --pdf "参考文件/真题/数学/6、【1987-2025年】考研数学三真题答案及解析/2012年数学三真题答案解析.pdf" --page 9 --dpi 110 --out "backup/scratch/refs-math3-ans/crops/2012_ans_p9.png"`
- **裁片**：`backup/scratch/refs-math3-ans/crops/2012_ans_p9.png`（910×1287 px / 107832 B / sha256 `405c56b1fc11c848a746522b24c83e2d774e981a50663b56e27a7910df76d7e9`）
- **亲读原文**：「(19)（本题满分 10 分）… 1）特征方程为 $r^2+r-2=0$，特征根为 $r_1=1,r_2=-2$，齐次微分方程的通解为 $f(x)=C_1e^x+C_2e^{-2x}$，再由 $f'(x)+f(x)=2e^x$ 得 $2C_1e^x-C_2e^{-2x}=2e^x$，可知 $C_1=1,C_2=0$。故 $f(x)=e^x$。2）… 令 $y''=0$ 得 $x=0$… 可知 $x=0$ 是 $y''=0$ 唯一的解…可知 $(0,0)$ 点是曲线唯一的拐点。」
- **结论**：答案 $f(x)=e^x$；曲线 $y=f(x^2)\int_0^xe^{-t^2}dt$ 的唯一拐点为 $(0,0)$（kind=`solution`，锚点 `f(x)=\mathrm e^{x};\ \text{拐点}(0,0)`）；三源一致性 = all（题面 真题册 p43 + 解析册 p9 亲读 + 独立复算）；
  - 独立复算：独立复算同值：特征根 1,−2；由 $f'+f=2e^x$ 定出 $f=e^x$；$y''=2x+2(1+2x^2)e^{x^2}\int_0^xe^{-t^2}dt$ 仅零点 0 且两侧凹凸反号。
- **置信度**：high；

### m3-2012-20 ｜ 三(20) ｜ 解答

- **材料**：2012 年数学三真题答案解析册（`参考文件/真题/数学/6、【1987-2025年】考研数学三真题答案及解析/2012年数学三真题答案解析.pdf`），题面见真题册 PDF p43；
- **页码**：解析册 PDF p10（整页）；
- **生成命令**：`参考文件\_venv\Scripts\python.exe tools/refs-vision.py --pdf "参考文件/真题/数学/6、【1987-2025年】考研数学三真题答案及解析/2012年数学三真题答案解析.pdf" --page 10 --dpi 110 --out "backup/scratch/refs-math3-ans/crops/2012_ans_p10.png"`
- **裁片**：`backup/scratch/refs-math3-ans/crops/2012_ans_p10.png`（910×1287 px / 98760 B / sha256 `5e495ce36d6e41d95dca78de3c174c6a8daf25bb0ec03d347bc1b7c98cb5d9ee`）
  - 续页补渲：`backup/scratch/refs-math3-ans/crops/2012_ans_p9.png`（910×1287 px / 107832 B / sha256 `405c56b1fc11c848a746522b24c83e2d774e981a50663b56e27a7910df76d7e9`）
- **亲读原文**：「(20)（本题满分 10 分）… （Ⅰ）$|A|=\begin{vmatrix}1&a&0&0\\0&1&a&0\\0&0&1&a\\a&0&0&1\end{vmatrix}=1-a^4$。（Ⅱ）… 可知当要使得原线性方程组有无穷多解，则有 $1-a^4=0$ 及 $-a-a^2=0$，可知 $a=-1$。此时，原线性方程组增广矩阵为…进一步化为行最简形得…可知导出组的基础解系为 $(1,1,1,1)^T$，非齐次方程的特解为 $(0,-1,0,0)^T$，故其通解为 $k(1,1,1,1)^T+(0,-1,0,0)^T$。」
- **结论**：答案 $|A|=1-a^4$；$a=-1$；通解 $x=k(1,1,1,1)^T+(0,-1,0,0)^T$（kind=`solution`，锚点 `|A|=1-a^4;\ a=-1;\ x=k(1,1,1,1)^{T}+(0,-1,0,0)^{T}`）；三源一致性 = all（题面 真题册 p43 + 解析册 p10 亲读 + 独立复算）；
  - 独立复算：独立复算同值：展开得 $1-a^4$；$r(A)=r(\bar A)<4$ 需 $a^4=1$ 且 $-a-a^2=0$ ⇒ $a=-1$；回代得 $x_1=x_2=x_3=x_4$，特解 $(0,-1,0,0)^T$。
- **置信度**：high；

### m3-2012-21 ｜ 三(21) ｜ 解答

- **材料**：2012 年数学三真题答案解析册（`参考文件/真题/数学/6、【1987-2025年】考研数学三真题答案及解析/2012年数学三真题答案解析.pdf`），题面见真题册 PDF p44；
- **页码**：解析册 PDF p11（整页）；
- **生成命令**：`参考文件\_venv\Scripts\python.exe tools/refs-vision.py --pdf "参考文件/真题/数学/6、【1987-2025年】考研数学三真题答案及解析/2012年数学三真题答案解析.pdf" --page 11 --dpi 110 --out "backup/scratch/refs-math3-ans/crops/2012_ans_p11.png"`
- **裁片**：`backup/scratch/refs-math3-ans/crops/2012_ans_p11.png`（910×1287 px / 73136 B / sha256 `bad2652b4ab4627000b9370c7f1b01cb7f743b2a0d09c4129bdd9a0ce10c1dfe`）
  - 续页补渲：`backup/scratch/refs-math3-ans/crops/2012_ans_p10.png`（910×1287 px / 98760 B / sha256 `5e495ce36d6e41d95dca78de3c174c6a8daf25bb0ec03d347bc1b7c98cb5d9ee`）
- **亲读原文**：「(21)（本题满分 10 分）…【解析】1）由 $r(A^TA)=r(A)=2$ 可得，$\begin{vmatrix}1&0&1\\0&1&1\\-1&0&a\end{vmatrix}=a+1=0\Rightarrow a=-1$。2）$f=x^TA^TAx=(x_1,x_2,x_3)\begin{pmatrix}2&0&2\\0&2&2\\2&2&4\end{pmatrix}\begin{pmatrix}x_1\\x_2\\x_3\end{pmatrix}=2x_1^2+2x_2^2+4x_3^2+4x_1x_2+4x_2x_3$，则矩阵 $B=\begin{pmatrix}2&0&2\\0&2&2\\2&2&4\end{pmatrix}$，$|\lambda E-B|=\lambda(\lambda-2)(\lambda-6)=0$，解得 $B$ 矩阵的特征值为 $\lambda_1=0;\lambda_2=2;\lambda_3=6$；…将 $\eta_1,\eta_2,\eta_3$ 单位化可得 $\alpha_1=\frac{1}{\sqrt3}(1,1,-1)^T,\alpha_2=\frac{1}{\sqrt2}(1,-1,0)^T,\alpha_3=\frac{1}{\sqrt6}(1,1,2)^T$，$Q=(\alpha_1,\alpha_2,\alpha_3)$。」
- **结论**：答案 $a=-1$；$f=2x_1^2+2x_2^2+4x_3^2+4x_1x_2+4x_2x_3$，矩阵 $B=\begin{pmatrix}2&0&2\\0&2&2\\2&2&4\end{pmatrix}$，特征值 $0,2,6$，标准形 $2y_2^2+6y_3^2$，$Q=(\alpha_1,\alpha_2,\alpha_3)$（kind=`solution`，锚点 `a=-1;\ \text{标准形}\ 2y_2^2+6y_3^2`）；三源一致性 = all（题面 真题册 p44 + 解析册 p11 亲读 + 独立复算）；
  - 独立复算：独立复算同值：$a=-1$（$r(A)=2$）；$A^TA$ 的特征值 0,2,6，对应特征向量 (1,1,−1),(1,−1,0),(1,1,2) 正交，故正交变换下标准形为 $2y_2^2+6y_3^2$（裁片由特征值与 Q 给出，标准形式子由我按特征值写出）。
- **置信度**：high；

### m3-2012-22 ｜ 三(22) ｜ 解答

- **材料**：2012 年数学三真题答案解析册（`参考文件/真题/数学/6、【1987-2025年】考研数学三真题答案及解析/2012年数学三真题答案解析.pdf`），题面见真题册 PDF p44；
- **页码**：解析册 PDF p12（整页）；
- **生成命令**：`参考文件\_venv\Scripts\python.exe tools/refs-vision.py --pdf "参考文件/真题/数学/6、【1987-2025年】考研数学三真题答案及解析/2012年数学三真题答案解析.pdf" --page 12 --dpi 110 --out "backup/scratch/refs-math3-ans/crops/2012_ans_p12.png"`
- **裁片**：`backup/scratch/refs-math3-ans/crops/2012_ans_p12.png`（910×1287 px / 91189 B / sha256 `d8ee1b3eb3b87447dd43b338460bc4457a8fa742f6b4099bcf2f608716e0d879`）
- **亲读原文**：「（22）（本题满分 10 分）已知随机变量 $X,Y$ 以及 $XY$ 的分布律如下表所示…求：（1）$P(X=2Y)$；（2）$\mathrm{cov}(X-Y,Y)$ 与 $\rho_{XY}$。【解析】（1）$P(X=2Y)=P(X=0,Y=0)+P(X=2,Y=1)=\frac14+0=\frac14$。（2）$\mathrm{cov}(X-Y,Y)=\mathrm{cov}(X,Y)-\mathrm{cov}(Y,Y)$，$\mathrm{cov}(X,Y)=EXY-EXEY$，其中 $EX=\frac23,EX^2=1,EY=1,EY^2=\frac53,DX=\frac59,DY=\frac23,EXY=\frac23$，所以 $\mathrm{cov}(X,Y)=0$，$\mathrm{cov}(Y,Y)=DY=\frac23$，$\mathrm{cov}(X-Y,Y)=-\frac23,\rho_{XY}=0$。」
- **结论**：答案 $P\{X=2Y\}=\dfrac14$；$\mathrm{cov}(X-Y,Y)=-\dfrac23$，$\rho_{XY}=0$（kind=`solution`，锚点 `P(X=2Y)=\dfrac14;\ \mathrm{cov}(X-Y,Y)=-\dfrac23,\ \rho_{XY}=0`）；三源一致性 = all（题面 真题册 p44 + 解析册 p12 亲读 + 独立复算）；
  - 独立复算：独立复算同值：$EX=2/3,EX^2=1$（分布 1/2,1/3,1/6）；$EY=1,EY^2=5/3$；$EXY=2/3$ ⇒ $\mathrm{cov}(X,Y)=0$，故 $\mathrm{cov}(X-Y,Y)=-2/3$、$\rho=0$。
- **置信度**：high；

### m3-2012-23 ｜ 三(23) ｜ 解答

- **材料**：2012 年数学三真题答案解析册（`参考文件/真题/数学/6、【1987-2025年】考研数学三真题答案及解析/2012年数学三真题答案解析.pdf`），题面见真题册 PDF p44；
- **页码**：解析册 PDF p13（整页）；
- **生成命令**：`参考文件\_venv\Scripts\python.exe tools/refs-vision.py --pdf "参考文件/真题/数学/6、【1987-2025年】考研数学三真题答案及解析/2012年数学三真题答案解析.pdf" --page 13 --dpi 110 --out "backup/scratch/refs-math3-ans/crops/2012_ans_p13.png"`
- **裁片**：`backup/scratch/refs-math3-ans/crops/2012_ans_p13.png`（910×1287 px / 37313 B / sha256 `f0d1355c4bc14d321355059e4219ca344d01e843b0ce4a63b27866030fcd924b`）
  - 续页补渲：`backup/scratch/refs-math3-ans/crops/2012_ans_p12.png`（910×1287 px / 91189 B / sha256 `d8ee1b3eb3b87447dd43b338460bc4457a8fa742f6b4099bcf2f608716e0d879`）
- **亲读原文**：「（23）（本题满分 10 分）设随机变量 $X$ 和 $Y$ 相互独立，且均服从参数为 1 的指数分布，$V=\min(X,Y),U=\max(X,Y)$。求（1）随机变量 $V$ 的概率密度；（2）$E(U+V)$。【解析】（1）…由 $V=\min(X,Y)$，$F_V(v)=P\{V\le v\}=P\{\min(X,Y)\le v\}=1-P\{X>v,Y>v\}$…$=1-[1-F(v)]^2=\begin{cases}1-e^{-2v},&v>0,\\0,&其它.\end{cases}$ 故 $f_V(v)=F_V'(v)=\begin{cases}2e^{-2v},&v>0,\\0,&其它.\end{cases}$（2）同理，$U$ 的概率密度为 $f_U(u)=\begin{cases}2(1-e^{-u})e^{-u},&u>0,\\0,&其它.\end{cases}$ $EU=\int_0^{+\infty}u2(1-e^{-u})e^{-u}du=\frac32$，$EV=\int_0^{+\infty}v2e^{-2v}dv=\frac12$，所以 $E(U+V)=EU+EV=\frac32+\frac12=2$。」
- **结论**：答案 $f_V(v)=2e^{-2v}\,(v>0)$；$E(U+V)=2$（kind=`solution`，锚点 `f_V(v)=2\mathrm e^{-2v}\ (v>0);\ E(U+V)=2`）；三源一致性 = all（题面 真题册 p44 + 解析册 p13 亲读 + 独立复算）；
  - 独立复算：独立复算同值：$F_V=1-e^{-2v}$ ⇒ 密度 $2e^{-2v}$；$EU=EX+EY-EV=\frac32$；$E(U+V)=E(X+Y)=2$。
- **置信度**：high；

### m3-2012-9 ｜ 二(9) ｜ 填空

- **材料**：2012 年数学三真题答案解析册（`参考文件/真题/数学/6、【1987-2025年】考研数学三真题答案及解析/2012年数学三真题答案解析.pdf`），题面见真题册 PDF p42；
- **页码**：解析册 PDF p4（整页）；
- **生成命令**：`参考文件/_venv/Scripts/python.exe tools/refs-vision.py --pdf "参考文件/真题/数学/6、【1987-2025年】考研数学三真题答案及解析/2012年数学三真题答案解析.pdf" --page 4 --dpi 110 --out "backup/scratch/refs-math3-ans/crops/2012_ans_p4.png"`
- **裁片**：`backup/scratch/refs-math3-ans/crops/2012_ans_p4.png`（910×1287 px / 80860 B / sha256 `419f8aab069afdee98d662f8dcc805f24cbe95f78b1a3fbe0e8912aa25916e1c`）
- **亲读原文**：「(9) $\lim_{x\to\frac\pi4}(\tan x)^{\frac{1}{\cos x-\sin x}}$____。【答案】$e^{-\sqrt2}$。【解析】$\lim(\tan x)^{\frac{1}{\cos x-\sin x}}=e^{\lim\frac{\tan x-1}{\cos x-\sin x}}$…$=\lim_{x\to\frac\pi4}\frac{(x-\frac\pi4)(1+\tan x\tan\frac\pi4)}{-\sqrt2(x-\frac\pi4)}=\frac{2}{-\sqrt2}=-\sqrt2$，所以 $\lim=e^{-\sqrt2}$。」
- **结论**：答案 $e^{-\sqrt2}$（kind=`fill`，锚点 `\mathrm e^{-\sqrt2}`）；三源一致性 = all（题面 真题册 p42 + 解析册 p4 亲读 + 独立复算）；
  - 独立复算：独立复算同值：$\tan x-1\sim2(x-\frac\pi4)$，$\cos x-\sin x\sim-\sqrt2(x-\frac\pi4)$，指数极限 $-\sqrt2$，故原式 $e^{-\sqrt2}$。
- **置信度**：high；

### m3-2013-10 ｜ 二(10) ｜ 填空

- **材料**：2013 年数学三真题答案解析册（`参考文件/真题/数学/6、【1987-2025年】考研数学三真题答案及解析/2013年数学三真题答案解析.pdf`），题面见真题册 PDF p38；
- **页码**：解析册 PDF p5（整页）；
- **生成命令**：`参考文件/_venv/Scripts/python.exe tools/refs-vision.py --pdf "参考文件/真题/数学/6、【1987-2025年】考研数学三真题答案及解析/2013年数学三真题答案解析.pdf" --page 5 --dpi 110 --out "backup/scratch/refs-math3-ans/crops/2013_ans_p5.png"`
- **裁片**：`backup/scratch/refs-math3-ans/crops/2013_ans_p5.png`（910×1287 px / 90885 B / sha256 `ab724579bedcf285e48ed3e268939568538bd299ad6bd22de11fce87f148a500`）
- **亲读原文**：「(10) 设函数 $z=z(x,y)$ 由方程 $(z+y)^x=xy$ 确定，则 $\frac{\partial z}{\partial x}\Big|_{(1,2)}=$____。【答案】$2-2\ln2$。【解析】原式为 $e^{x\ln(z+y)}=xy$，左右两边求导得：$xy[\ln(z+y)+x\cdot\frac{z_x}{z+y}]=y$，令 $x=1,y=2$ 得 $z=0,z_x=2(1-\ln2)$。」
- **结论**：答案 $2-2\ln 2$（kind=`fill`，锚点 `2-2\ln2`）；三源一致性 = all（题面 真题册 p38 + 解析册 p5 亲读 + 独立复算）；
  - 独立复算：独立复算同值：$x=1,y=2\Rightarrow (z+2)^1=2\Rightarrow z=0$；隐函数求导 $\ln(z+y)+x\frac{z_x}{z+y}=\frac1x$ 代入得 $\ln2+\frac{z_x}{2}=1$，$z_x=2-2\ln2$。
- **置信度**：high；

### m3-2013-11 ｜ 二(11) ｜ 填空

- **材料**：2013 年数学三真题答案解析册（`参考文件/真题/数学/6、【1987-2025年】考研数学三真题答案及解析/2013年数学三真题答案解析.pdf`），题面见真题册 PDF p38；
- **页码**：解析册 PDF p5（整页）；
- **生成命令**：`参考文件/_venv/Scripts/python.exe tools/refs-vision.py --pdf "参考文件/真题/数学/6、【1987-2025年】考研数学三真题答案及解析/2013年数学三真题答案解析.pdf" --page 5 --dpi 110 --out "backup/scratch/refs-math3-ans/crops/2013_ans_p5.png"`
- **裁片**：`backup/scratch/refs-math3-ans/crops/2013_ans_p5.png`（910×1287 px / 90885 B / sha256 `ab724579bedcf285e48ed3e268939568538bd299ad6bd22de11fce87f148a500`）
- **亲读原文**：「(11) 求 $\int_1^{+\infty}\frac{\ln x}{(1+x)^2}dx$____。【答案】$\ln2$。【解析】$\int\frac{\ln x}{(1+x)^2}dx=\int\ln x\,d(-\frac{1}{1+x})=-\frac{\ln x}{1+x}+\int\frac{1}{x(1+x)}dx=-\frac{\ln x}{1+x}+\ln\frac{x}{1+x}$，$\int_1^{+\infty}\frac{\ln x}{(1+x)^2}dx=\lim_{x\to+\infty}\left(-\frac{\ln x}{1+x}+\ln\frac{x}{1+x}\right)-\left(-\frac{\ln x}{1+x}+\ln\frac{x}{1+x}\right)\Big|_{x=1}=\ln2$。」
- **结论**：答案 $\ln 2$（kind=`fill`，锚点 `\ln2`）；三源一致性 = all（题面 真题册 p38 + 解析册 p5 亲读 + 独立复算）；
  - 独立复算：独立复算同值：分部积分后原函数 $-\frac{\ln x}{1+x}+\ln\frac{x}{1+x}$，在 $\infty$ 处极限 0、在 1 处 $0-\ln\frac12=\ln2$。
- **置信度**：high；

### m3-2013-12 ｜ 二(12) ｜ 填空

- **材料**：2013 年数学三真题答案解析册（`参考文件/真题/数学/6、【1987-2025年】考研数学三真题答案及解析/2013年数学三真题答案解析.pdf`），题面见真题册 PDF p38；
- **页码**：解析册 PDF p5（整页）；
- **生成命令**：`参考文件/_venv/Scripts/python.exe tools/refs-vision.py --pdf "参考文件/真题/数学/6、【1987-2025年】考研数学三真题答案及解析/2013年数学三真题答案解析.pdf" --page 5 --dpi 110 --out "backup/scratch/refs-math3-ans/crops/2013_ans_p5.png"`
- **裁片**：`backup/scratch/refs-math3-ans/crops/2013_ans_p5.png`（910×1287 px / 90885 B / sha256 `ab724579bedcf285e48ed3e268939568538bd299ad6bd22de11fce87f148a500`）
- **亲读原文**：「(12) 微分方程 $y''-y'+\frac14y=0$ 通解为 $y=$____。【答案】$e^{\frac12x}(C_1x+C_2)$。【解析】特征方程为 $\lambda^2-\lambda+\frac14=0,\lambda=\frac12$（二重根），所以通解为 $y=e^{\frac12x}(C_1x+C_2)$。」
- **结论**：答案 $e^{\frac x2}(C_1x+C_2)$（kind=`fill`，锚点 `\mathrm e^{\frac x2}(C_1x+C_2)`）；三源一致性 = all（题面 真题册 p38 + 解析册 p5 亲读 + 独立复算）；
  - 独立复算：独立复算同值：特征方程 $(\lambda-\frac12)^2=0$，二重根 ⇒ $e^{x/2}(C_1x+C_2)$。
- **置信度**：high；

### m3-2013-13 ｜ 二(13) ｜ 填空

- **材料**：2013 年数学三真题答案解析册（`参考文件/真题/数学/6、【1987-2025年】考研数学三真题答案及解析/2013年数学三真题答案解析.pdf`），题面见真题册 PDF p38；
- **页码**：解析册 PDF p5（整页）；
- **生成命令**：`参考文件/_venv/Scripts/python.exe tools/refs-vision.py --pdf "参考文件/真题/数学/6、【1987-2025年】考研数学三真题答案及解析/2013年数学三真题答案解析.pdf" --page 5 --dpi 110 --out "backup/scratch/refs-math3-ans/crops/2013_ans_p5.png"`
- **裁片**：`backup/scratch/refs-math3-ans/crops/2013_ans_p5.png`（910×1287 px / 90885 B / sha256 `ab724579bedcf285e48ed3e268939568538bd299ad6bd22de11fce87f148a500`）
- **亲读原文**：「(13) 设 $A=(a_{ij})$ 是三阶非零矩阵，$|A|$ 为 $A$ 的行列式，$A_{ij}$ 为 $a_{ij}$ 的代数余子式，若 $a_{ij}+A_{ij}=0\ (i,j=1,2,3)$，则 $|A|=$____。【答案】-1。【解析】由 $a_{ij}+A_{ij}=0$ 可知，$A^T=-A^*$，$|A|=-\sum_{j=1}^3a_{ij}^2=-\sum_{i=1}^3a_{ij}^2<0$，从而有 $|A|=|A^T|=|-A^*|=-|A|^2$，故 $|A|=-1$。」
- **结论**：答案 $-1$（kind=`fill`，锚点 `-1`）；三源一致性 = all（题面 真题册 p38 + 解析册 p5 亲读 + 独立复算）；
  - 独立复算：独立复算同值：$A^T=-A^*\Rightarrow |A|=|-A^*|=-|A|^2$ ⇒ $|A|(|A|+1)=0$，又 $|A|<0$ ⇒ $|A|=-1$。
- **置信度**：high；

### m3-2013-14 ｜ 二(14) ｜ 填空

- **材料**：2013 年数学三真题答案解析册（`参考文件/真题/数学/6、【1987-2025年】考研数学三真题答案及解析/2013年数学三真题答案解析.pdf`），题面见真题册 PDF p38；
- **页码**：解析册 PDF p5（整页）；
- **生成命令**：`参考文件/_venv/Scripts/python.exe tools/refs-vision.py --pdf "参考文件/真题/数学/6、【1987-2025年】考研数学三真题答案及解析/2013年数学三真题答案解析.pdf" --page 5 --dpi 110 --out "backup/scratch/refs-math3-ans/crops/2013_ans_p5.png"`
- **裁片**：`backup/scratch/refs-math3-ans/crops/2013_ans_p5.png`（910×1287 px / 90885 B / sha256 `ab724579bedcf285e48ed3e268939568538bd299ad6bd22de11fce87f148a500`）
  - 续页补渲：`backup/scratch/refs-math3-ans/crops/2013_ans_p6.png`（910×1287 px / 119706 B / sha256 `0a93f227cbba610ade0409a9acb2f12a0c33a4607fd35407c991e197d01f9d19`）
- **亲读原文**：「(14) 设随机变量 $X$ 服从标准正态分布 $X\sim N(0,1)$，则 $E(Xe^{2X})=$____。【答案】$2e^2$。【解析】由 $X\sim N(0,1)$ 及随机变量函数的期望公式知 $E(Xe^{2X})=\int_{-\infty}^{+\infty}xe^{2x}\frac{1}{\sqrt{2\pi}}e^{-\frac{x^2}{2}}dx=\frac{1}{\sqrt{2\pi}}\int_{-\infty}^{+\infty}xe^{-\frac12[(x-2)^2-4]}dx=2e^2$。」
- **结论**：答案 $2e^2$（kind=`fill`，锚点 `2\mathrm e^2`）；三源一致性 = all（题面 真题册 p38 + 解析册 p5 亲读 + 独立复算）；
  - 独立复算：独立复算同值：$E(Xe^{2X})=M'(2)$，$M(t)=e^{t^2/2}$，$M'(2)=2e^2$。
- **置信度**：high；

### m3-2013-15 ｜ 三(15) ｜ 解答

- **材料**：2013 年数学三真题答案解析册（`参考文件/真题/数学/6、【1987-2025年】考研数学三真题答案及解析/2013年数学三真题答案解析.pdf`），题面见真题册 PDF p38；
- **页码**：解析册 PDF p6（整页）；
- **生成命令**：`参考文件/_venv/Scripts/python.exe tools/refs-vision.py --pdf "参考文件/真题/数学/6、【1987-2025年】考研数学三真题答案及解析/2013年数学三真题答案解析.pdf" --page 6 --dpi 110 --out "backup/scratch/refs-math3-ans/crops/2013_ans_p6.png"`
- **裁片**：`backup/scratch/refs-math3-ans/crops/2013_ans_p6.png`（910×1287 px / 119706 B / sha256 `0a93f227cbba610ade0409a9acb2f12a0c33a4607fd35407c991e197d01f9d19`）
- **亲读原文**：「(15)（本题满分 10 分）当 $x\to0$ 时，$1-\cos x\cdot\cos2x\cdot\cos3x$ 与 $ax^n$ 为等价无穷小，求 $n$ 和 $a$ 的值。【解析】… $1-\cos x\cdot\cos2x\cdot\cos3x=1-\cos x+\cos x(1-\cos2x)+\cos x\cdot\cos2x(1-\cos3x)$… $=\lim_{x\to0}(\frac{\frac12x^2+o(x^2)}{ax^n}+\frac{\cos x\cdot\frac12(2x)^2+o(x^2)}{ax^n}+\frac{\cos x\cos2x\cdot\frac12(3x)^2+o(x^2)}{ax^n})$ 所以 $n=2$ 且 $\frac{1}{2a}+\frac{4}{2a}+\frac{9}{2a}=1\Rightarrow a=7$。」
- **结论**：答案 $n=2$，$a=7$（kind=`solution`，锚点 `n=2,\ a=7`）；三源一致性 = all（题面 真题册 p38 + 解析册 p6 亲读 + 独立复算）；
  - 独立复算：独立复算同值：$1-\cos x\cos2x\cos3x\sim\frac12(1+4+9)x^2=7x^2$ ⇒ $n=2,a=7$。
- **置信度**：high；

### m3-2013-16 ｜ 三(16) ｜ 解答

- **材料**：2013 年数学三真题答案解析册（`参考文件/真题/数学/6、【1987-2025年】考研数学三真题答案及解析/2013年数学三真题答案解析.pdf`），题面见真题册 PDF p38；
- **页码**：解析册 PDF p6（整页）；
- **生成命令**：`参考文件/_venv/Scripts/python.exe tools/refs-vision.py --pdf "参考文件/真题/数学/6、【1987-2025年】考研数学三真题答案及解析/2013年数学三真题答案解析.pdf" --page 6 --dpi 110 --out "backup/scratch/refs-math3-ans/crops/2013_ans_p6.png"`
- **裁片**：`backup/scratch/refs-math3-ans/crops/2013_ans_p6.png`（910×1287 px / 119706 B / sha256 `0a93f227cbba610ade0409a9acb2f12a0c33a4607fd35407c991e197d01f9d19`）
- **亲读原文**：「(16)（本题满分 10 分）设 $D$ 是由曲线 $y=x^{\frac13}$，直线 $x=a\ (a>0)$ 及 $x$ 轴所围成的平面图形，$V_x,V_y$ 分别是 $D$ 绕 $x$ 轴、$y$ 轴旋转一周所得旋转体的体积，若 $V_y=10V_x$，求 $a$ 的值。【解析】由题意可得：$V_x=\pi\int_0^a(x^{\frac13})^2dx=\frac35\pi a^{\frac53}$，$V_y=2\pi\int_0^a x\cdot x^{\frac13}dx=\frac{6\pi}{7}a^{\frac73}$，因为 $V_y=10V_x$，所以 $\frac{6\pi}{7}a^{\frac73}=10\cdot\frac35\pi a^{\frac53}\Rightarrow a=7\sqrt7$。」
- **结论**：答案 $a=7\sqrt{7}$（kind=`solution`，锚点 `a=7\sqrt7`）；三源一致性 = all（题面 真题册 p38 + 解析册 p6 亲读 + 独立复算）；
  - 独立复算：独立复算同值：$V_x=\frac35\pi a^{5/3}$，$V_y=\frac67\pi a^{7/3}$；相除得 $\frac{10}{7}a^{2/3}=6\Rightarrow a^{2/3}=4.2$？ 逐项核：$V_y/V_x=\frac{6/7}{3/5}a^{2/3}=\frac{10}{7}a^{2/3}=10\Rightarrow a^{2/3}=7\Rightarrow a=7^{3/2}=7\sqrt7$ ✓。
- **置信度**：high；

### m3-2013-17 ｜ 三(17) ｜ 解答

- **材料**：2013 年数学三真题答案解析册（`参考文件/真题/数学/6、【1987-2025年】考研数学三真题答案及解析/2013年数学三真题答案解析.pdf`），题面见真题册 PDF p39；
- **页码**：解析册 PDF p7（整页）；
- **生成命令**：`参考文件/_venv/Scripts/python.exe tools/refs-vision.py --pdf "参考文件/真题/数学/6、【1987-2025年】考研数学三真题答案及解析/2013年数学三真题答案解析.pdf" --page 7 --dpi 110 --out "backup/scratch/refs-math3-ans/crops/2013_ans_p7.png"`
- **裁片**：`backup/scratch/refs-math3-ans/crops/2013_ans_p7.png`（910×1287 px / 122270 B / sha256 `61d2ebcfdf89e762b398542e283efaf9cf30b44203fb5ff71a31bb8e5ce87c1d`）
- **亲读原文**：「设平面内区域 $D$ 由直线 $x=3y,y=3x$ 及 $x+y=8$ 围成，计算 $\iint_D x^2dxdy$。【解析】$\iint_Dx^2dxdy=\iint_{D_1}x^2dxdy+\iint_{D_2}x^2dxdy=\int_0^2x^2dx\int_{\frac x3}^{3x}dy+\int_2^6x^2dx\int_{\frac x3}^{8-x}dy=\frac{416}{3}$。」
- **结论**：答案 $\dfrac{416}{3}$（kind=`solution`，锚点 `\dfrac{416}{3}`）；三源一致性 = all（题面 真题册 p39 + 解析册 p7 亲读 + 独立复算）；
  - 独立复算：独立复算同值：$\int_0^2x^2\cdot\frac{8x}{3}dx+\int_2^6x^2(8-\frac{4x}{3})dx=\frac{32}{3}+128=\frac{416}{3}$ ✓。
- **置信度**：high；

### m3-2013-18 ｜ 三(18) ｜ 解答

- **材料**：2013 年数学三真题答案解析册（`参考文件/真题/数学/6、【1987-2025年】考研数学三真题答案及解析/2013年数学三真题答案解析.pdf`），题面见真题册 PDF p39；
- **页码**：解析册 PDF p7（整页）；
- **生成命令**：`参考文件/_venv/Scripts/python.exe tools/refs-vision.py --pdf "参考文件/真题/数学/6、【1987-2025年】考研数学三真题答案及解析/2013年数学三真题答案解析.pdf" --page 7 --dpi 110 --out "backup/scratch/refs-math3-ans/crops/2013_ans_p7.png"`
- **裁片**：`backup/scratch/refs-math3-ans/crops/2013_ans_p7.png`（910×1287 px / 122270 B / sha256 `61d2ebcfdf89e762b398542e283efaf9cf30b44203fb5ff71a31bb8e5ce87c1d`）
- **亲读原文**：「(18)（本题满分 10 分）设生产某产品的固定成本为 6000 元，可变成本为 20 元/件，价格函数为 $P=60-\frac{Q}{1000}$…【解析】(Ⅰ) 设利润为 $I$，则 $I=PQ-(20Q+6000)=40Q-\frac{Q^2}{1000}-6000$，边际利润 $I'=40-\frac{Q}{500}$（Ⅱ）当 $P=50$ 时，边际利润为 20，经济意义为：当 $P=50$ 时，销量每增加一个，利润增加 20 (Ⅲ) 令 $I'=0$，得 $Q=20000$，此时 $P=60-\frac{Q}{1000}=40$。」
- **结论**：答案 $I=40Q-\dfrac{Q^2}{1000}-6000$，边际利润 $I'=40-\dfrac{Q}{500}$；$P=50$ 时边际利润为 20；利润最大的定价 $P=40$（kind=`solution`，锚点 `I'=40-\dfrac{Q}{500};\ \text{最大利润定价}\ P=40`）；三源一致性 = all（题面 真题册 p39 + 解析册 p7 亲读 + 独立复算）；
  - 独立复算：独立复算同值：$I(Q)=Q(60-\frac Q{1000})-20Q-6000$；$I'(20000)=0$ ⇒ $P=40$；$P=50\Rightarrow Q=10000$，$I'=40-20=20$ ✓。
- **置信度**：high；

### m3-2013-19 ｜ 三(19) ｜ 解答

- **材料**：2013 年数学三真题答案解析册（`参考文件/真题/数学/6、【1987-2025年】考研数学三真题答案及解析/2013年数学三真题答案解析.pdf`），题面见真题册 PDF p39；
- **页码**：解析册 PDF p7（整页）；
- **生成命令**：`参考文件/_venv/Scripts/python.exe tools/refs-vision.py --pdf "参考文件/真题/数学/6、【1987-2025年】考研数学三真题答案及解析/2013年数学三真题答案解析.pdf" --page 7 --dpi 110 --out "backup/scratch/refs-math3-ans/crops/2013_ans_p7.png"`
- **裁片**：`backup/scratch/refs-math3-ans/crops/2013_ans_p7.png`（910×1287 px / 122270 B / sha256 `61d2ebcfdf89e762b398542e283efaf9cf30b44203fb5ff71a31bb8e5ce87c1d`）
- **亲读原文**：「(19)（本题满分 10 分）设函数 $f(x)$ 在 $[0,+\infty)$ 上可导，$f(0)=0$ 且 $\lim_{x\to+\infty}f(x)=2$，证明（1）存在 $a>0$，使得 $f(a)=1$（2）对（1）中的 $a$，存在 $\xi\in(0,a)$，使得 $f'(\xi)=\frac1a$。【答案】(Ⅰ) 证明：$\lim_{x\to+\infty}f(x)=2,\therefore\exists X$，当 $x>X$ 时，有 $f(x)>\frac32$，$f(x)$ 在 $[0,X]$ 上连续，根据连续函数介值定理，存在 $a\in[0,X]$，使得 $f(a)=1$（Ⅱ）$f(x)$ 在 $[0,a]$ 上连续且可导，根据拉格朗日中值定理，$f(a)-f(0)=f'(\xi)a=1,\xi\in(0,a)$，故 $\exists\xi\in(0,a)$，使得 $f'(\xi)=\frac1a$。」
- **结论**：答案 证明：(Ⅰ) 存在 $a>0$ 使 $f(a)=1$；(Ⅱ) 对 (Ⅰ) 中的 $a$ 存在 $\xi\in(0,a)$ 使 $f'(\xi)=\dfrac1a$（kind=`solution`，锚点 `\exists\xi\in(0,a),\ f'(\xi)=\dfrac1a`）；三源一致性 = all（题面 真题册 p39 + 解析册 p7 亲读 + 独立复算）；
  - 独立复算：独立复核同结论：介值定理给出 $a$（因 $f(0)=0<1<\frac32<f(X)$）；中值定理给出 $f'(\xi)=\frac{f(a)-f(0)}{a}=\frac1a$。
- **置信度**：high；

### m3-2013-20 ｜ 三(20) ｜ 解答

- **材料**：2013 年数学三真题答案解析册（`参考文件/真题/数学/6、【1987-2025年】考研数学三真题答案及解析/2013年数学三真题答案解析.pdf`），题面见真题册 PDF p39；
- **页码**：解析册 PDF p8（整页）；
- **生成命令**：`参考文件\_venv\Scripts\python.exe tools/refs-vision.py --pdf "参考文件/真题/数学/6、【1987-2025年】考研数学三真题答案及解析/2013年数学三真题答案解析.pdf" --page 8 --dpi 110 --out "backup/scratch/refs-math3-ans/crops/2013_ans_p8.png"`
- **裁片**：`backup/scratch/refs-math3-ans/crops/2013_ans_p8.png`（910×1287 px / 95982 B / sha256 `4401600a35422d90b79b31d7caeaeb735d45e8e23006ea36a4f3e5858a87afa1`）
- **亲读原文**：「设 $A=\begin{pmatrix}1&a\\1&0\end{pmatrix},B=\begin{pmatrix}0&1\\1&b\end{pmatrix}$，当 $a,b$ 为何值时，存在矩阵 $C$ 使得 $AC-CA=B$，并求所有矩阵 $C$。【解析】…由 $AC-CA=B$ 可得线性方程组：$-x_2+ax_3=0$，$-ax_1+x_2+ax_4=1$，$x_1-x_3-x_4=1$，$x_2-ax_3=b$…由于方程组（1）有解，故有 $1+a=0,b-1-a=0$，即 $a=-1,b=0$，从而有 $\begin{cases}x_1=k_1+k_2+1\\x_2=-k_1\\x_3=k_1\\x_4=k_2\end{cases}$，其中 $k_1,k_2$ 任意。从而有 $C=\begin{pmatrix}k_1+k_2+1&-k_1\\k_1&k_2\end{pmatrix}$。」
- **结论**：答案 $a=-1$，$b=0$；$C=\begin{pmatrix}k_1+k_2+1&-k_1\\k_1&k_2\end{pmatrix}$（$k_1,k_2$ 任意）（kind=`solution`，锚点 `a=-1,b=0;\ C=\begin{pmatrix}k_1+k_2+1&-k_1\\k_1&k_2\end{pmatrix}`）；三源一致性 = all（题面 真题册 p39 + 解析册 p8 亲读 + 独立复算）；
  - 独立复算：独立复算同值：解 $AC-CA=B$ 的 4 元线性方程组，有解条件 $a=-1,b=0$，解空间 2 维，通解如上。
- **置信度**：high；

### m3-2013-21 ｜ 三(21) ｜ 解答

- **材料**：2013 年数学三真题答案解析册（`参考文件/真题/数学/6、【1987-2025年】考研数学三真题答案及解析/2013年数学三真题答案解析.pdf`），题面见真题册 PDF p40；
- **页码**：解析册 PDF p9（整页）；
- **生成命令**：`参考文件\_venv\Scripts\python.exe tools/refs-vision.py --pdf "参考文件/真题/数学/6、【1987-2025年】考研数学三真题答案及解析/2013年数学三真题答案解析.pdf" --page 9 --dpi 110 --out "backup/scratch/refs-math3-ans/crops/2013_ans_p9.png"`
- **裁片**：`backup/scratch/refs-math3-ans/crops/2013_ans_p9.png`（910×1287 px / 129208 B / sha256 `2b446d4ae19e6f749c553dfe0645e085c8236e4f77bde5d52c68704b09ee0062`）
  - 续页补渲：`backup/scratch/refs-math3-ans/crops/2013_ans_p8.png`（910×1287 px / 95982 B / sha256 `4401600a35422d90b79b31d7caeaeb735d45e8e23006ea36a4f3e5858a87afa1`）
- **亲读原文**：「(21)（本题满分 11 分）设二次型 $f(x_1,x_2,x_3)=2(a_1x_1+a_2x_2+a_3x_3)^2+(b_1x_1+b_2x_2+b_3x_3)^2$…（Ⅰ）证明二次型 $f$ 对应的矩阵为 $2\alpha\alpha^T+\beta\beta^T$；（Ⅱ）若 $\alpha,\beta$ 正交且均为单位向量，证明二次型 $f$ 在正交变化下的标准形为二次型 $2y_1^2+y_2^2$。【解析】…则 $f$ 的矩阵为 $\begin{pmatrix}2a_1^2+b_1^2&2a_1a_2+b_1b_2&2a_1a_3+b_1b_3\\2a_1a_2+b_1b_2&2a_2^2+b_2^2&2a_2a_3+b_2b_3\\2a_1a_3+b_1b_3&2a_2a_3+b_2b_3&2a_3^2+b_3^2\end{pmatrix}=2\begin{pmatrix}a_1^2&a_1a_2&a_1a_3\\a_1a_2&a_2^2&a_2a_3\\a_1a_3&a_2a_3&a_3^2\end{pmatrix}+\begin{pmatrix}b_1^2&b_1b_2&b_1b_3\\b_1b_2&b_2^2&b_2b_3\\b_1b_3&b_2b_3&b_3^2\end{pmatrix}=2\alpha\alpha^T+\beta\beta^T$。（2）令 $A=2\alpha\alpha^T+\beta\beta^T$，则 $A\alpha=2\alpha,A\beta=\beta$，则 1,2 均为 $A$ 的特征值，又由于 $r(A)=r(2\alpha\alpha^T+\beta\beta^T)\le r(\alpha\alpha^T)+r(\beta\beta^T)=2$，故 0 为 $A$ 的特征值，则三阶矩阵 $A$ 的特征值为 2,1,0，故 $f$ 在正交变换下的标准形为 $2y_1^2+y_2^2$。」
- **结论**：答案 (Ⅰ) $f$ 的矩阵为 $2\alpha\alpha^T+\beta\beta^T$；(Ⅱ) 正交变换下标准形为 $2y_1^2+y_2^2$（kind=`solution`，锚点 `2y_1^2+y_2^2`）；三源一致性 = all（题面 真题册 p40 + 解析册 p9 亲读 + 独立复算）；
  - 独立复算：独立复核同结论：$A=2\alpha\alpha^T+\beta\beta^T$ 对称；$\alpha\perp\beta$、单位 ⇒ 特征值 2,1,0 ⇒ 标准形 $2y_1^2+y_2^2$。
- **置信度**：high；

### m3-2013-22 ｜ 三(22) ｜ 解答

- **材料**：2013 年数学三真题答案解析册（`参考文件/真题/数学/6、【1987-2025年】考研数学三真题答案及解析/2013年数学三真题答案解析.pdf`），题面见真题册 PDF p40；
- **页码**：解析册 PDF p9（整页）；
- **生成命令**：`参考文件\_venv\Scripts\python.exe tools/refs-vision.py --pdf "参考文件/真题/数学/6、【1987-2025年】考研数学三真题答案及解析/2013年数学三真题答案解析.pdf" --page 9 --dpi 110 --out "backup/scratch/refs-math3-ans/crops/2013_ans_p9.png"`
- **裁片**：`backup/scratch/refs-math3-ans/crops/2013_ans_p9.png`（910×1287 px / 129208 B / sha256 `2b446d4ae19e6f749c553dfe0645e085c8236e4f77bde5d52c68704b09ee0062`）
- **亲读原文**：「(22)（本题满分 11 分）设 $(X,Y)$ 是二维随机变量，$X$ 的边缘概率密度为 $f_X(x)=\begin{cases}3x^2,&0<x<1,\\0,&其他,\end{cases}$，在给定 $X=x\ (0<x<1)$ 的条件下，$Y$ 的条件概率密度 $f_{Y|X}(y|x)=\begin{cases}\frac{3y^2}{x^3},&0<y<x,\\0,&其他.\end{cases}$（1）求 $(X,Y)$ 的概率密度 $f(x,y)$；（2）$Y$ 的边缘概率密度 $f_Y(y)$。【答案】（1）$f(x,y)=f_{Y|X}(y|x)f_X(x)=\begin{cases}\frac{9y^2}{x},&0<x<1,0<y<x,\\0,&其他.\end{cases}$（2）$f_Y(y)=\int_{-\infty}^{+\infty}f(x,y)dx=\begin{cases}-9y^2\ln y,&0<y<1,\\0,&其他.\end{cases}$」
- **结论**：答案 $f(x,y)=\dfrac{9y^2}{x}$（$0<x<1,\,0<y<x$）；$f_Y(y)=-9y^2\ln y$（$0<y<1$）（kind=`solution`，锚点 `f_Y(y)=-9y^2\ln y\ (0<y<1)`）；三源一致性 = all（题面 真题册 p40 + 解析册 p9 亲读 + 独立复算）；
  - 独立复算：独立复算同值：$f=3x^2\cdot\frac{3y^2}{x^3}=\frac{9y^2}{x}$；对 $x$ 从 $y$ 到 1 积分得 $-9y^2\ln y$。
- **置信度**：high；

### m3-2013-23 ｜ 三(23) ｜ 解答

- **材料**：2013 年数学三真题答案解析册（`参考文件/真题/数学/6、【1987-2025年】考研数学三真题答案及解析/2013年数学三真题答案解析.pdf`），题面见真题册 PDF p40；
- **页码**：解析册 PDF p10（整页）；
- **生成命令**：`参考文件\_venv\Scripts\python.exe tools/refs-vision.py --pdf "参考文件/真题/数学/6、【1987-2025年】考研数学三真题答案及解析/2013年数学三真题答案解析.pdf" --page 10 --dpi 110 --out "backup/scratch/refs-math3-ans/crops/2013_ans_p10.png"`
- **裁片**：`backup/scratch/refs-math3-ans/crops/2013_ans_p10.png`（910×1287 px / 33097 B / sha256 `bf155a1726e7c15ca74eec228fd31e962b5c39b5d0bf83634b8fc32d608eb1c9`）
  - 续页补渲：`backup/scratch/refs-math3-ans/crops/2013_ans_p9.png`（910×1287 px / 129208 B / sha256 `2b446d4ae19e6f749c553dfe0645e085c8236e4f77bde5d52c68704b09ee0062`）
- **亲读原文**：「(23)（本题满分 11 分）设总体 $X$ 的概率密度为 $f(x)=\begin{cases}\frac{\theta^2}{x^3}e^{-\frac\theta x},&x>0,\\0,&其它,\end{cases}$ 其中 $\theta$ 为未知参数且大于零，$X_1,X_2,\cdots X_N$ 为来自总体 $X$ 的简单随机样本。（1）求 $\theta$ 的矩估计量；（2）求 $\theta$ 的最大似然估计量。【答案】(1) $EX=\int_{-\infty}^{+\infty}xf(x)dx=\int_0^{+\infty}\frac{\theta^2}{x^3}e^{-\frac\theta x}xdx=\int_0^{+\infty}\frac{\theta}{x}e^{-\frac\theta x}d(-\frac\theta x)=\theta$，令 $EX=\bar X$，故 $\theta$ 矩估计量为 $\bar X$。(2) $L(\theta)=\prod_{i=1}^n\frac{\theta^2}{x_i^3}e^{-\frac{\theta}{x_i}}=\theta^{2n}\prod_{i=1}^n\frac{1}{x_i^3}e^{-\theta\sum\frac{1}{x_i}}$，$\ln L(\theta)=2n\ln\theta-3\sum\ln x_i-\theta\sum\frac{1}{x_i}$，令 $\frac{d\ln L(\theta)}{d\theta}=\frac{2n}{\theta}-\sum_{i=1}^n\frac{1}{x_i}=0$，得 $\theta=\frac{2n}{\sum_{i=1}^n\frac{1}{x_i}}$，所以得 $\theta$ 极大似然估计量 $\hat\theta=\frac{2n}{\sum_{i=1}^n\frac{1}{x_i}}$。」
- **结论**：答案 矩估计 $\hat\theta=\bar X$；最大似然估计 $\hat\theta=\dfrac{2n}{\sum_{i=1}^n\frac{1}{x_i}}$（kind=`solution`，锚点 `\hat\theta=\dfrac{2n}{\sum_{i=1}^n\frac{1}{x_i}}`）；三源一致性 = all（题面 真题册 p40 + 解析册 p10 亲读 + 独立复算）；
  - 独立复算：独立复算同值：$EX=\theta$；似然方程 $\frac{2n}{\theta}=\sum\frac1{x_i}$ ⇒ $\hat\theta=2n/\sum\frac1{x_i}$。
- **置信度**：high；

### m3-2013-9 ｜ 二(9) ｜ 填空

- **材料**：2013 年数学三真题答案解析册（`参考文件/真题/数学/6、【1987-2025年】考研数学三真题答案及解析/2013年数学三真题答案解析.pdf`），题面见真题册 PDF p38；
- **页码**：解析册 PDF p4（整页）；
- **生成命令**：`参考文件\_venv\Scripts\python.exe tools/refs-vision.py --pdf "参考文件/真题/数学/6、【1987-2025年】考研数学三真题答案及解析/2013年数学三真题答案解析.pdf" --page 4 --dpi 110 --out "backup/scratch/refs-math3-ans/crops/2013_ans_p4.png"`
- **裁片**：`backup/scratch/refs-math3-ans/crops/2013_ans_p4.png`（910×1287 px / 109410 B / sha256 `162b9dbfe405edc26725d1392200d5f323d3785cfa6bcce6c2d2e347c0350984`）
- **亲读原文**：「(9) 设曲线 $y=f(x)$ 和 $y=x^2-x$ 在点 $(0,1)$ 处有公共的切线，则 $\lim_{n\to\infty}nf\left(\frac{n}{n+2}\right)=$____。【答案】-2。【解析】$y=x^2-x$ 在 $(1,0)$ 处的导数是 $y'(1)=1$，故 $f'(1)=1,f(1)=0$，$\lim_{n\to\infty}nf(\frac{n}{n+2})=\lim_{n\to\infty}\frac{f(1-\frac{2}{n+2})-f(1)}{-\frac{2n}{n+2}}\times\left(-\frac{2n}{n+2}\right)=f'(1)\times(-2)=-2$。」
- **结论**：答案 $-2$（kind=`fill`，锚点 `-2`）；三源一致性 = all（题面 真题册 p38 + 解析册 p4 亲读 + 独立复算）；
  - 独立复算：独立复算同值：$\frac{n}{n+2}=1-\frac{2}{n+2}$，$f\approx f(1)+f'(1)(-\frac2{n+2})$，乘 $n$ 取极限得 $f'(1)\cdot(-2)=-2$（切线斜率 $f'(1)=1$）。
- **置信度**：high；

### m3-2014-10 ｜ 二(10) ｜ 填空

- **材料**：2014 年数学三真题答案解析册（`参考文件/真题/数学/6、【1987-2025年】考研数学三真题答案及解析/2014年数学三真题答案解析.pdf`），题面见真题册 PDF p33；
- **页码**：解析册 PDF p2（整页）；
- **生成命令**：`参考文件/_venv/Scripts/python.exe tools/refs-vision.py --pdf "参考文件/真题/数学/6、【1987-2025年】考研数学三真题答案及解析/2014年数学三真题答案解析.pdf" --page 2 --dpi 130 --out "backup/scratch/refs-math3-ans/crops/2014_ans_p2.png"`
- **裁片**：`backup/scratch/refs-math3-ans/crops/2014_ans_p2.png`（932×1331 px / 131027 B / sha256 `34ff07fb762eb158259fdf86adafa7acf3f92b04d4a05c8452c46b8c277749e3`）
- **亲读原文**：「(10) $\frac32-\ln2$ 解 区域 $D$ 的图形如右图所示，面积 $S=\int_1^2\left[-\frac1y-(-y)\right]dy=\left(\frac{y^2}{2}-\ln y\right)\Big|_1^2=\frac32-\ln2$。」
- **结论**：答案 $\dfrac32-\ln 2$（kind=`fill`，锚点 `\dfrac32-\ln2`）；三源一致性 = all（题面 真题册 p33 + 解析册 p2 亲读 + 独立复算）；
  - 独立复算：独立复算同值：$xy+1=0\Rightarrow x=-\frac1y$ 与 $y=-x$ 交于 $y=1$；$\int_1^2(y-\frac1y)dy=\frac32-\ln2$。
- **置信度**：high；

### m3-2014-11 ｜ 二(11) ｜ 填空

- **材料**：2014 年数学三真题答案解析册（`参考文件/真题/数学/6、【1987-2025年】考研数学三真题答案及解析/2014年数学三真题答案解析.pdf`），题面见真题册 PDF p34；
- **页码**：解析册 PDF p2（整页）；
- **生成命令**：`参考文件/_venv/Scripts/python.exe tools/refs-vision.py --pdf "参考文件/真题/数学/6、【1987-2025年】考研数学三真题答案及解析/2014年数学三真题答案解析.pdf" --page 2 --dpi 130 --out "backup/scratch/refs-math3-ans/crops/2014_ans_p2.png"`
- **裁片**：`backup/scratch/refs-math3-ans/crops/2014_ans_p2.png`（932×1331 px / 131027 B / sha256 `34ff07fb762eb158259fdf86adafa7acf3f92b04d4a05c8452c46b8c277749e3`）
- **亲读原文**：「(11) $\frac12$ 解 由于 $\int_0^axe^{2x}dx=\frac{e^{2x}}{4}(2x-1)\Big|_0^a=\frac{e^{2a}}4(2a-1)+\frac14\overset{令}{=}\frac14$，得 $a=\frac12$。」
- **结论**：答案 $a=\dfrac12$（kind=`fill`，锚点 `a=\dfrac12`）；三源一致性 = all（题面 真题册 p34 + 解析册 p2 亲读 + 独立复算）；
  - 独立复算：独立复算同值：$\int_0^axe^{2x}dx=\frac{e^{2a}(2a-1)+1}{4}=\frac14\Rightarrow e^{2a}(2a-1)=0\Rightarrow a=\frac12$。
- **置信度**：high；

### m3-2014-12 ｜ 二(12) ｜ 填空

- **材料**：2014 年数学三真题答案解析册（`参考文件/真题/数学/6、【1987-2025年】考研数学三真题答案及解析/2014年数学三真题答案解析.pdf`），题面见真题册 PDF p34；
- **页码**：解析册 PDF p2（整页）；
- **生成命令**：`参考文件/_venv/Scripts/python.exe tools/refs-vision.py --pdf "参考文件/真题/数学/6、【1987-2025年】考研数学三真题答案及解析/2014年数学三真题答案解析.pdf" --page 2 --dpi 130 --out "backup/scratch/refs-math3-ans/crops/2014_ans_p2.png"`
- **裁片**：`backup/scratch/refs-math3-ans/crops/2014_ans_p2.png`（932×1331 px / 131027 B / sha256 `34ff07fb762eb158259fdf86adafa7acf3f92b04d4a05c8452c46b8c277749e3`）
  - 续页补渲：`backup/scratch/refs-math3-ans/crops/2014_ans_p3.png`（932×1331 px / 126039 B / sha256 `ede110607377b2132893c2f03343e47b8b0401c7e5d672223e6c721f94b705fa`）
- **亲读原文**：「(12) $\frac{e-1}{2}$ 解 如右图所示，则 $\int_0^1dy\int_y^1\left(\frac{e^{x^2}}{x}-e^{y^2}\right)dx=\int_0^1dy\int_y^1\frac{e^{x^2}}{x}dx-\int_0^1dy\int_y^1e^{y^2}dx=\int_0^1dx\int_0^x\frac{e^{x^2}}{x}dy-\int_0^1e^{y^2}(1-y)dy=\int_0^1e^{x^2}dx-\int_0^1e^{y^2}dy+\int_0^1ye^{y^2}dy=\frac12e^{y^2}\Big|_0^1=\frac12(e-1)$。」
- **结论**：答案 $\dfrac{e-1}{2}$（kind=`fill`，锚点 `\dfrac{\mathrm e-1}{2}`）；三源一致性 = all（题面 真题册 p34 + 解析册 p2 亲读 + 独立复算）；
  - 独立复算：独立复算同值：交换次序后前两项相消，仅剩 $\int_0^1ye^{y^2}dy=\frac12(e-1)$。
- **置信度**：high；

### m3-2014-13 ｜ 二(13) ｜ 填空

- **材料**：2014 年数学三真题答案解析册（`参考文件/真题/数学/6、【1987-2025年】考研数学三真题答案及解析/2014年数学三真题答案解析.pdf`），题面见真题册 PDF p34；
- **页码**：解析册 PDF p3（整页）；
- **生成命令**：`参考文件/_venv/Scripts/python.exe tools/refs-vision.py --pdf "参考文件/真题/数学/6、【1987-2025年】考研数学三真题答案及解析/2014年数学三真题答案解析.pdf" --page 3 --dpi 130 --out "backup/scratch/refs-math3-ans/crops/2014_ans_p3.png"`
- **裁片**：`backup/scratch/refs-math3-ans/crops/2014_ans_p3.png`（932×1331 px / 126039 B / sha256 `ede110607377b2132893c2f03343e47b8b0401c7e5d672223e6c721f94b705fa`）
- **亲读原文**：「(13) $[-2,2]$ 解 由配方法可知 $f(x_1,x_2,x_3)=x_1^2-x_2^2+2ax_1x_3+4x_2x_3=(x_1+ax_3)^2-(x_2-2x_3)^2+(4-a^2)x_3^2$。由于负惯性指数为 1，则 $4-a^2\ge0$，所以 $a$ 的取值范围是 $[-2,2]$。」
- **结论**：答案 $[-2,2]$（kind=`fill`，锚点 `[-2,2]`）；三源一致性 = all（题面 真题册 p34 + 解析册 p3 亲读 + 独立复算）；
  - 独立复算：独立复算同值：配方后仅 $-(x_2-2x_3)^2$ 为负项，要求第三项 $\ge0$ 即 $4-a^2\ge0$。
- **置信度**：high；

### m3-2014-14 ｜ 二(14) ｜ 填空

- **材料**：2014 年数学三真题答案解析册（`参考文件/真题/数学/6、【1987-2025年】考研数学三真题答案及解析/2014年数学三真题答案解析.pdf`），题面见真题册 PDF p34；
- **页码**：解析册 PDF p3（整页）；
- **生成命令**：`参考文件/_venv/Scripts/python.exe tools/refs-vision.py --pdf "参考文件/真题/数学/6、【1987-2025年】考研数学三真题答案及解析/2014年数学三真题答案解析.pdf" --page 3 --dpi 130 --out "backup/scratch/refs-math3-ans/crops/2014_ans_p3.png"`
- **裁片**：`backup/scratch/refs-math3-ans/crops/2014_ans_p3.png`（932×1331 px / 126039 B / sha256 `ede110607377b2132893c2f03343e47b8b0401c7e5d672223e6c721f94b705fa`）
- **亲读原文**：「(14) $\frac{2}{5n}$ 解 $E(X^2)=\int_{-\infty}^{+\infty}x^2f(x)dx=\int_\theta^{2\theta}x^2\cdot\frac{2x}{3\theta^2}dx=\frac{2}{3\theta^2}\int_\theta^{2\theta}x^3dx=\frac52\theta^2$，则 $E\left(c\sum_{i=1}^nX_i^2\right)=c\sum_{i=1}^nE(X_i^2)=c\cdot n\cdot\frac52\theta^2\overset{令}{=}\theta^2$。所以 $c=\frac{2}{5n}$。」
- **结论**：答案 $\dfrac{2}{5n}$（kind=`fill`，锚点 `\dfrac{2}{5n}`）；三源一致性 = all（题面 真题册 p34 + 解析册 p3 亲读 + 独立复算）；
  - 独立复算：独立复算同值：$E(X^2)=\frac52\theta^2$；$cn\frac52\theta^2=\theta^2\Rightarrow c=\frac{2}{5n}$。
- **置信度**：high；

### m3-2014-15 ｜ 三(15) ｜ 解答

- **材料**：2014 年数学三真题答案解析册（`参考文件/真题/数学/6、【1987-2025年】考研数学三真题答案及解析/2014年数学三真题答案解析.pdf`），题面见真题册 PDF p34；
- **页码**：解析册 PDF p3（整页）；
- **生成命令**：`参考文件/_venv/Scripts/python.exe tools/refs-vision.py --pdf "参考文件/真题/数学/6、【1987-2025年】考研数学三真题答案及解析/2014年数学三真题答案解析.pdf" --page 3 --dpi 130 --out "backup/scratch/refs-math3-ans/crops/2014_ans_p3.png"`
- **裁片**：`backup/scratch/refs-math3-ans/crops/2014_ans_p3.png`（932×1331 px / 126039 B / sha256 `ede110607377b2132893c2f03343e47b8b0401c7e5d672223e6c721f94b705fa`）
- **亲读原文**：「(15) 解 $\lim_{x\to+\infty}\frac{\int_1^x[t^2(e^{\frac1t}-1)-t]dt}{x^2\ln(1+\frac1x)}=\lim_{x\to+\infty}\frac{\int_1^x[t^2(e^{\frac1t}-1)-t]dt}{x}=\lim_{x\to+\infty}[x^2(e^{\frac1x}-1)-x]\overset{令u=\frac1x}{=}\lim_{u\to0^+}\frac{e^u-1-u}{u^2}=\lim_{u\to0^+}\frac{e^u-1}{2u}=\frac12$。」
- **结论**：答案 $\dfrac12$（kind=`solution`，锚点 `\dfrac12`）；三源一致性 = all（题面 真题册 p34 + 解析册 p3 亲读 + 独立复算）；
  - 独立复算：独立复算同值：$x^2(e^{1/x}-1)-x \to \frac{1}{2}$（$e^u=1+u+u^2/2+o(u^2)$）。
- **置信度**：high；

### m3-2014-16 ｜ 三(16) ｜ 解答

- **材料**：2014 年数学三真题答案解析册（`参考文件/真题/数学/6、【1987-2025年】考研数学三真题答案及解析/2014年数学三真题答案解析.pdf`），题面见真题册 PDF p34；
- **页码**：解析册 PDF p4（整页）；
- **生成命令**：`参考文件/_venv/Scripts/python.exe tools/refs-vision.py --pdf "参考文件/真题/数学/6、【1987-2025年】考研数学三真题答案及解析/2014年数学三真题答案解析.pdf" --page 4 --dpi 130 --out "backup/scratch/refs-math3-ans/crops/2014_ans_p4.png"`
- **裁片**：`backup/scratch/refs-math3-ans/crops/2014_ans_p4.png`（932×1331 px / 150696 B / sha256 `cea49f9b2c86bad5082abc65980057e21d5461f75c1e89e3b612977993a12b04`）
  - 续页补渲：`backup/scratch/refs-math3-ans/crops/2014_ans_p3.png`（932×1331 px / 126039 B / sha256 `ede110607377b2132893c2f03343e47b8b0401c7e5d672223e6c721f94b705fa`）
- **亲读原文**：「(16) 解 $\iint_D\frac{x\sin(\pi\sqrt{x^2+y^2})}{x+y}dxdy=\int_0^{\frac\pi2}\frac{\cos\theta}{\cos\theta+\sin\theta}d\theta\cdot\int_1^2r\sin\pi r\,dr$。由于 $\int_0^{\frac\pi2}\frac{\cos\theta}{\cos\theta+\sin\theta}d\theta=\int_0^{\frac\pi2}\frac{\sin\theta}{\cos\theta+\sin\theta}d\theta=\frac12\int_0^{\frac\pi2}d\theta=\frac\pi4$，$\int_1^2r\sin\pi r\,dr=\frac1\pi\left(-r\cos\pi r+\frac1\pi\sin\pi r\right)\Big|_1^2=-\frac3\pi$，故 $\iint_D\frac{x\sin(\pi\sqrt{x^2+y^2})}{x+y}dxdy=-\frac34$。」
- **结论**：答案 $-\dfrac34$（kind=`solution`，锚点 `-\dfrac34`）；三源一致性 = all（题面 真题册 p34 + 解析册 p4 亲读 + 独立复算）；
  - 独立复算：独立复算同值：角向积分 $\frac\pi4$，径向 $\int_1^2r\sin\pi r dr=-\frac3\pi$，乘积 $-\frac34$。
- **置信度**：high；

### m3-2014-17 ｜ 三(17) ｜ 解答

- **材料**：2014 年数学三真题答案解析册（`参考文件/真题/数学/6、【1987-2025年】考研数学三真题答案及解析/2014年数学三真题答案解析.pdf`），题面见真题册 PDF p35；
- **页码**：解析册 PDF p4（整页）；
- **生成命令**：`参考文件/_venv/Scripts/python.exe tools/refs-vision.py --pdf "参考文件/真题/数学/6、【1987-2025年】考研数学三真题答案及解析/2014年数学三真题答案解析.pdf" --page 4 --dpi 130 --out "backup/scratch/refs-math3-ans/crops/2014_ans_p4.png"`
- **裁片**：`backup/scratch/refs-math3-ans/crops/2014_ans_p4.png`（932×1331 px / 150696 B / sha256 `cea49f9b2c86bad5082abc65980057e21d5461f75c1e89e3b612977993a12b04`）
- **亲读原文**：「(17) 解 因为 $\frac{\partial z}{\partial x}=f'(e^x\cos y)e^x\cos y,\frac{\partial z}{\partial y}=-f'(e^x\cos y)e^x\sin y$，所以 $\cos y\frac{\partial z}{\partial x}-\sin y\frac{\partial z}{\partial y}=(4z+e^x\cos y)e^x$ 化为 $f'(e^x\cos y)e^x=[4f(e^x\cos y)+e^x\cos y]e^x$，即函数 $f(u)$ 满足方程 $f'(u)-4f(u)=u$，该方程的通解为 $f(u)=Ce^{4u}-\frac u4-\frac1{16}$。又 $f(0)=0$，得 $C=\frac1{16}$，故 $f(u)=\frac1{16}(e^{4u}-4u-1)$。」
- **结论**：答案 $f(u)=\dfrac{1}{16}(e^{4u}-4u-1)$（kind=`solution`，锚点 `f(u)=\dfrac1{16}(\mathrm e^{4u}-4u-1)`）；三源一致性 = all（题面 真题册 p35 + 解析册 p4 亲读 + 独立复算）；
  - 独立复算：独立复算同值：$f'-4f=u$ 特解 $-\frac u4-\frac1{16}$；$f(0)=0\Rightarrow C=\frac1{16}$。
- **置信度**：high；

### m3-2014-18 ｜ 三(18) ｜ 解答

- **材料**：2014 年数学三真题答案解析册（`参考文件/真题/数学/6、【1987-2025年】考研数学三真题答案及解析/2014年数学三真题答案解析.pdf`），题面见真题册 PDF p35；
- **页码**：解析册 PDF p4（整页）；
- **生成命令**：`参考文件/_venv/Scripts/python.exe tools/refs-vision.py --pdf "参考文件/真题/数学/6、【1987-2025年】考研数学三真题答案及解析/2014年数学三真题答案解析.pdf" --page 4 --dpi 130 --out "backup/scratch/refs-math3-ans/crops/2014_ans_p4.png"`
- **裁片**：`backup/scratch/refs-math3-ans/crops/2014_ans_p4.png`（932×1331 px / 150696 B / sha256 `cea49f9b2c86bad5082abc65980057e21d5461f75c1e89e3b612977993a12b04`）
- **亲读原文**：「(18) 解 幂级数的系数 $a_n=(n+1)(n+3)$。因为 $\lim_{n\to\infty}\left|\frac{a_{n+1}}{a_n}\right|=\lim_{n\to\infty}\frac{(n+2)(n+4)}{(n+1)(n+3)}=1$，所以收敛半径 $R=1$。当 $x=\pm1$ 时，级数 $\sum_{n=0}^\infty(n+1)(n+3)$ 及 $\sum_{n=0}^\infty(n+1)(n+3)(-1)^n$ 发散，故收敛域为 $(-1,1)$。设 $S(x)=\sum_{n=0}^\infty(n+1)(n+3)x^n$… 所以 $S(x)=\left(\frac{2x-x^2}{(1-x)^2}\right)'+\left(\frac{x}{1-x}\right)'=\frac{3-x}{(1-x)^3},x\in(-1,1)$。」
- **结论**：答案 收敛域 $(-1,1)$；$S(x)=\dfrac{3-x}{(1-x)^3}$（kind=`solution`，锚点 `S(x)=\dfrac{3-x}{(1-x)^3}`）；三源一致性 = all（题面 真题册 p35 + 解析册 p4 亲读 + 独立复算）；
  - 独立复算：独立复算同值：$a_n\sim n^2$ ⇒ $R=1$，端点通项不趋于 0 ⇒ 发散；两次求导法给出 $S=(3-x)/(1-x)^3$（$x=0$ 处 $S=3$ ✓）。
- **置信度**：high；

### m3-2014-19 ｜ 三(19) ｜ 解答

- **材料**：2014 年数学三真题答案解析册（`参考文件/真题/数学/6、【1987-2025年】考研数学三真题答案及解析/2014年数学三真题答案解析.pdf`），题面见真题册 PDF p35；
- **页码**：解析册 PDF p5（整页）；
- **生成命令**：`参考文件/_venv/Scripts/python.exe tools/refs-vision.py --pdf "参考文件/真题/数学/6、【1987-2025年】考研数学三真题答案及解析/2014年数学三真题答案解析.pdf" --page 5 --dpi 130 --out "backup/scratch/refs-math3-ans/crops/2014_ans_p5.png"`
- **裁片**：`backup/scratch/refs-math3-ans/crops/2014_ans_p5.png`（932×1331 px / 126866 B / sha256 `187c4751a0831481d5ea5980c1f5e8e07608ac93c1176b6f6ba48e77482bcf16`）
  - 续页补渲：`backup/scratch/refs-math3-ans/crops/2014_ans_p4.png`（932×1331 px / 150696 B / sha256 `cea49f9b2c86bad5082abc65980057e21d5461f75c1e89e3b612977993a12b04`）
- **亲读原文**：「(19) 证 （Ⅰ）因为 $0\le g(x)\le1$，所以当 $x\in[a,b]$ 时，有 $\int_a^x0dt\le\int_a^xg(t)dt\le\int_a^x1dt$，即 $0\le\int_a^xg(t)dt\le x-a$。（Ⅱ）令 $F(x)=\int_a^{a+\int_a^xg(u)du}f(t)dt-\int_a^xf(t)g(t)dt,x\in[a,b]$… $F'(x)=\left[f\left(a+\int_a^xg(u)du\right)-f(x)\right]g(x)$… 所以 $F'(x)\le0$，从而 $F(x)$ 在 $[a,b]$ 上单调减少。又 $F(a)=0$，故 $F(b)\le0$，即 $\int_a^{a+\int_a^bg(t)dt}f(x)dx\le\int_a^bf(x)g(x)dx$。」
- **结论**：答案 证明：(Ⅰ) $0\le\int_a^xg(t)dt\le x-a$；(Ⅱ) $\int_a^{a+\int_a^bg(t)dt}f(x)dx\le\int_a^bf(x)g(x)dx$（kind=`solution`，锚点 `\int_a^{a+\int_a^bg(t)dt}f(x)\mathrm dx\le\int_a^bf(x)g(x)\mathrm dx`）；三源一致性 = all（题面 真题册 p35 + 解析册 p5 亲读 + 独立复算）；
  - 独立复算：独立复核同结论：$a+\int_a^xg\le x$ 且 $f$ 单调增 ⇒ $F'\le0$；$F(a)=0$ ⇒ $F(b)\le0$ 即所证不等式。
- **置信度**：high；

### m3-2014-20 ｜ 三(20) ｜ 解答

- **材料**：2014 年数学三真题答案解析册（`参考文件/真题/数学/6、【1987-2025年】考研数学三真题答案及解析/2014年数学三真题答案解析.pdf`），题面见真题册 PDF p35；
- **页码**：解析册 PDF p5（整页）；
- **生成命令**：`参考文件/_venv/Scripts/python.exe tools/refs-vision.py --pdf "参考文件/真题/数学/6、【1987-2025年】考研数学三真题答案及解析/2014年数学三真题答案解析.pdf" --page 5 --dpi 130 --out "backup/scratch/refs-math3-ans/crops/2014_ans_p5.png"`
- **裁片**：`backup/scratch/refs-math3-ans/crops/2014_ans_p5.png`（932×1331 px / 126866 B / sha256 `187c4751a0831481d5ea5980c1f5e8e07608ac93c1176b6f6ba48e77482bcf16`）
- **亲读原文**：「(20) 解 （Ⅰ）对矩阵 $A$ 施以初等行变换 $A=\begin{pmatrix}1&-2&3&-4\\0&1&-1&1\\1&2&0&-3\end{pmatrix}\to\begin{pmatrix}1&0&0&1\\0&1&0&-2\\0&0&1&-3\end{pmatrix}$，则方程组 $Ax=0$ 的一个基础解系为 $\alpha=\begin{pmatrix}-1\\2\\3\\1\end{pmatrix}$。（Ⅱ）对矩阵 $(A\vdots E)$ 施以初等行变换… 于是，所求矩阵为 $B=\begin{pmatrix}2&6&-1\\-1&-3&1\\-1&-4&1\\0&0&0\end{pmatrix}+(k_1\alpha,k_2\alpha,k_3\alpha)$，$k_1,k_2,k_3$ 为任意常数。」
- **结论**：答案 $\alpha=(-1,2,3,1)^T$；$B=\begin{pmatrix}2&6&-1\\-1&-3&1\\-1&-4&1\\0&0&0\end{pmatrix}+(k_1\alpha,k_2\alpha,k_3\alpha)$（$k_i$ 任意）（kind=`solution`，锚点 `B=\begin{pmatrix}2&6&-1\\-1&-3&1\\-1&-4&1\\0&0&0\end{pmatrix}+(k_1\alpha,k_2\alpha,k_3\alpha)`）；三源一致性 = all（题面 真题册 p35 + 解析册 p5 亲读 + 独立复算）；
  - 独立复算：独立复算同值：$Ax=0$ 基础解系 $(-1,2,3,1)^T$；$AX=E$ 的三列特解由行最简形右块读出，加上零空间平移即通解。
- **置信度**：high；

### m3-2014-21 ｜ 三(21) ｜ 解答

- **材料**：2014 年数学三真题答案解析册（`参考文件/真题/数学/6、【1987-2025年】考研数学三真题答案及解析/2014年数学三真题答案解析.pdf`），题面见真题册 PDF p36；
- **页码**：解析册 PDF p6（整页）；
- **生成命令**：`参考文件/_venv/Scripts/python.exe tools/refs-vision.py --pdf "参考文件/真题/数学/6、【1987-2025年】考研数学三真题答案及解析/2014年数学三真题答案解析.pdf" --page 6 --dpi 130 --out "backup/scratch/refs-math3-ans/crops/2014_ans_p6.png"`
- **裁片**：`backup/scratch/refs-math3-ans/crops/2014_ans_p6.png`（932×1331 px / 110712 B / sha256 `26009d3158102f42c888813c5f4aa0345ab1d7b37bf60c728f391c5aa9aea270`）
  - 续页补渲：`backup/scratch/refs-math3-ans/crops/2014_ans_p5.png`（932×1331 px / 126866 B / sha256 `187c4751a0831481d5ea5980c1f5e8e07608ac93c1176b6f6ba48e77482bcf16`）
- **亲读原文**：「(21) 证 设 $A=\begin{pmatrix}1&1&\cdots&1\\1&1&\cdots&1\\\vdots&\vdots&&\vdots\\1&1&\cdots&1\end{pmatrix},B=\begin{pmatrix}0&\cdots&0&1\\0&\cdots&0&2\\\vdots&&\vdots&\vdots\\0&\cdots&0&n\end{pmatrix}$。因为 $|\lambda E-A|=\begin{vmatrix}\lambda-1&-1&\cdots&-1\\-1&\lambda-1&\cdots&-1\\\vdots&\vdots&&\vdots\\-1&-1&\cdots&\lambda-1\end{vmatrix}=(\lambda-n)\lambda^{n-1}$，$|\lambda E-B|=\begin{vmatrix}\lambda&0&\cdots&-1\\0&\lambda&\cdots&-2\\\vdots&\vdots&&\vdots\\0&0&\cdots&\lambda-n\end{vmatrix}=(\lambda-n)\lambda^{n-1}$，所以 $A$ 与 $B$ 有相同的特征值 $\lambda_1=n,\lambda_2=0\ (n-1$ 重$)$。由于 $A$ 为实对称矩阵，所以 $A$ 相似于对角矩阵… 因为 $r(\lambda_2E-B)=r(B)=1$，所以 $B$ 对应于特征值 $\lambda_2=0$ 有 $n-1$ 个线性无关的特征向量，于是 $B$ 也相似于 $A$。故 $A$ 与 $B$ 相似。」
- **结论**：答案 证明 $A$ 与 $B$ 相似：$|\lambda E-A|=|\lambda E-B|=(\lambda-n)\lambda^{n-1}$（kind=`solution`，锚点 `|\lambda E-A|=|\lambda E-B|=(\lambda-n)\lambda^{n-1}`）；三源一致性 = all（题面 真题册 p36 + 解析册 p6 亲读 + 独立复算）；
  - 独立复算：独立复核同结论：两者特征多项式同为 $(\lambda-n)\lambda^{n-1}$；$A$ 实对称可对角化，$B$ 零特征值几何重数 $n-1$，故同对角阵 ⇒ 相似。
- **置信度**：high；

### m3-2014-22 ｜ 三(22) ｜ 解答

- **材料**：2014 年数学三真题答案解析册（`参考文件/真题/数学/6、【1987-2025年】考研数学三真题答案及解析/2014年数学三真题答案解析.pdf`），题面见真题册 PDF p36；
- **页码**：解析册 PDF p6（整页）；
- **生成命令**：`参考文件/_venv/Scripts/python.exe tools/refs-vision.py --pdf "参考文件/真题/数学/6、【1987-2025年】考研数学三真题答案及解析/2014年数学三真题答案解析.pdf" --page 6 --dpi 130 --out "backup/scratch/refs-math3-ans/crops/2014_ans_p6.png"`
- **裁片**：`backup/scratch/refs-math3-ans/crops/2014_ans_p6.png`（932×1331 px / 110712 B / sha256 `26009d3158102f42c888813c5f4aa0345ab1d7b37bf60c728f391c5aa9aea270`）
- **亲读原文**：「(22) 解 （Ⅰ）$F_Y(y)=P\{Y\le y\}=P\{X=1\}P\{Y\le y|X=1\}+P\{X=2\}P\{Y\le y|X=2\}=\frac12P\{Y\le y|X=1\}+\frac12P\{Y\le y|X=2\}$。当 $y<0$ 时，$F_Y(y)=0$；当 $0\le y<1$ 时，$F_Y(y)=\frac{3y}{4}$；当 $1\le y<2$ 时，$F_Y(y)=\frac12+\frac y4$；当 $y\ge2$ 时，$F_Y(y)=1$…（Ⅱ）随机变量 $Y$ 的概率密度为 $f_Y(y)=\begin{cases}\frac34,&0<y<1,\\\frac14,&1\le y<2,\\0,&其他.\end{cases}$ $EY=\int_{-\infty}^{+\infty}yf_Y(y)dy=\int_0^1\frac34ydy+\int_1^2\frac14ydy=\frac34$。」
- **结论**：答案 $F_Y(y)=\begin{cases}0,&y<0\\\frac{3y}{4},&0\le y<1\\\frac12+\frac y4,&1\le y<2\\1,&y\ge2\end{cases}$；$f_Y(y)=\frac34\,(0<y<1),\ \frac14\,(1\le y<2)$；$EY=\frac34$（kind=`solution`，锚点 `EY=\dfrac34`）；三源一致性 = all（题面 真题册 p36 + 解析册 p6 亲读 + 独立复算）；
  - 独立复算：独立复算同值：$X=1$ 时 $Y\sim U(0,1)$、$X=2$ 时 $Y\sim U(0,2)$，各半权重 ⇒ $F_Y(y)=\frac12 y+\frac12\cdot\frac y2=\frac{3y}4\,(0\le y<1)$、$\frac12+\frac y4\,(1\le y<2)$；$EY=\frac12(\frac12+1)=\frac34$。
- **置信度**：high；

### m3-2014-23 ｜ 三(23) ｜ 解答

- **材料**：2014 年数学三真题答案解析册（`参考文件/真题/数学/6、【1987-2025年】考研数学三真题答案及解析/2014年数学三真题答案解析.pdf`），题面见真题册 PDF p36；
- **页码**：解析册 PDF p7（整页）；
- **生成命令**：`参考文件/_venv/Scripts/python.exe tools/refs-vision.py --pdf "参考文件/真题/数学/6、【1987-2025年】考研数学三真题答案及解析/2014年数学三真题答案解析.pdf" --page 7 --dpi 130 --out "backup/scratch/refs-math3-ans/crops/2014_ans_p7.png"`
- **裁片**：`backup/scratch/refs-math3-ans/crops/2014_ans_p7.png`（932×1331 px / 67466 B / sha256 `62a663e966e57143b12dcb41e574ffe303e0e893dfcc31481e9b01526f9297e2`）
- **亲读原文**：「(23) 解 （Ⅰ）设 $(X,Y)$ 的概率分布为…由题设条件知 $EX=EY=\frac23,DX=DY=\frac23(1-\frac23)=\frac29$。$\mathrm{Cov}(X,Y)=E(XY)-EX\cdot EY=P\{X=1,Y=1\}-\frac49$。由 $\rho_{XY}=\frac{\mathrm{Cov}(X,Y)}{\sqrt{DX}\sqrt{DY}}=\frac{P\{X=1,Y=1\}-\frac49}{\frac29}=\frac12$，解得 $d=P\{X=1,Y=1\}=\frac19+\frac49=\frac59$。由此可得 $c=b=\frac23-d=\frac19,a=\frac13-b=\frac29$…（Ⅱ）$P\{X+Y\le1\}=1-P\{X+Y>1\}=1-P\{X=1,Y=1\}=\frac49$。」
- **结论**：答案 联合分布 $\frac29,\frac19$ / $\frac19,\frac59$；$P\{X+Y\le1\}=\frac49$（kind=`solution`，锚点 `P\{X+Y\le1\}=\dfrac49`）；三源一致性 = all（题面 真题册 p36 + 解析册 p7 亲读 + 独立复算）；
  - 独立复算：独立复算同值：题设 $P\{X=1\}=P\{Y=1\}=\frac23$（即 $EX=EY=\frac23$）、$\rho_{XY}=\frac12$；由 $\rho=\frac{P\{X=1,Y=1\}-\frac49}{\frac29}=\frac12$ 解得 $d=\frac59$，再由行和 $\frac23$、列和 $\frac23$ 得 $b=c=\frac19,\ a=\frac29$；$P\{X+Y\le1\}=1-P\{X=1,Y=1\}=\frac49$。
- **置信度**：high；

### m3-2014-9 ｜ 二(9) ｜ 填空

- **材料**：2014 年数学三真题答案解析册（`参考文件/真题/数学/6、【1987-2025年】考研数学三真题答案及解析/2014年数学三真题答案解析.pdf`），题面见真题册 PDF p33；
- **页码**：解析册 PDF p2（整页）；
- **生成命令**：`参考文件/_venv/Scripts/python.exe tools/refs-vision.py --pdf "参考文件/真题/数学/6、【1987-2025年】考研数学三真题答案及解析/2014年数学三真题答案解析.pdf" --page 2 --dpi 130 --out "backup/scratch/refs-math3-ans/crops/2014_ans_p2.png"`
- **裁片**：`backup/scratch/refs-math3-ans/crops/2014_ans_p2.png`（932×1331 px / 131027 B / sha256 `34ff07fb762eb158259fdf86adafa7acf3f92b04d4a05c8452c46b8c277749e3`）
- **亲读原文**：「(9) $20-Q$ 解 收益函数 $R(Q)=PQ=20Q-\frac12Q^2$，所以边际收益为 $R'(Q)=20-Q$。」
- **结论**：答案 $20-Q$（kind=`fill`，锚点 `20-Q`）；三源一致性 = all（题面 真题册 p33 + 解析册 p2 亲读 + 独立复算）；
  - 独立复算：独立复算同值：$Q=40-2P\Rightarrow P=20-\frac Q2$；$R=20Q-\frac{Q^2}2$，$R'=20-Q$。
- **置信度**：high；

### m3-2015-13 ｜ 二(13) ｜ 填空

- **材料**：2015 年数学三真题答案解析册（`参考文件/真题/数学/6、【1987-2025年】考研数学三真题答案及解析/2015年数学三真题答案解析.pdf`），题面见真题册 PDF p30；
- **页码**：解析册 PDF p4（整页）；
- **生成命令**：`参考文件/_venv/Scripts/python.exe tools/refs-vision.py --pdf "参考文件/真题/数学/6、【1987-2025年】考研数学三真题答案及解析/2015年数学三真题答案解析.pdf" --page 4 --dpi 130 --out "backup/scratch/refs-math3-ans/crops/2015_ans_p4.png"`
- **裁片**：`backup/scratch/refs-math3-ans/crops/2015_ans_p4.png`（932×1331 px / 128753 B / sha256 `c7afa7cf1a212029a143b9ee4c750a9e4099e1f070583437f09b354b72fe7b94`）
- **亲读原文**：「(13) 21 解 由 $A$ 的特征值为 $2,-2,1$ 及 $B=A^2-A+E$，则 $B$ 的特征值为 $3,7,1$，从而 $|B|=3\times7\times1=21$。」
- **结论**：答案 $21$（kind=`fill`，锚点 `21`）；三源一致性 = all（题面 真题册 p30 + 解析册 p4 亲读 + 独立复算）；
  - 独立复算：独立复算同值：$B=A^2-A+E$ 的特征值 $\lambda^2-\lambda+1$ 在 $\lambda=2,-2,1$ 处取 $3,7,1$，故 $|B|=21$。
- **置信度**：high；

### m3-2015-14 ｜ 二(14) ｜ 填空

- **材料**：2015 年数学三真题答案解析册（`参考文件/真题/数学/6、【1987-2025年】考研数学三真题答案及解析/2015年数学三真题答案解析.pdf`），题面见真题册 PDF p30；
- **页码**：解析册 PDF p4（整页）；
- **生成命令**：`参考文件/_venv/Scripts/python.exe tools/refs-vision.py --pdf "参考文件/真题/数学/6、【1987-2025年】考研数学三真题答案及解析/2015年数学三真题答案解析.pdf" --page 4 --dpi 130 --out "backup/scratch/refs-math3-ans/crops/2015_ans_p4.png"`
- **裁片**：`backup/scratch/refs-math3-ans/crops/2015_ans_p4.png`（932×1331 px / 128753 B / sha256 `c7afa7cf1a212029a143b9ee4c750a9e4099e1f070583437f09b354b72fe7b94`）
- **亲读原文**：「(14) $\frac12$ 解 由于相关系数为 0，所以 $X,Y$ 都服从正态分布，即 $X\sim N(1,1),Y\sim N(0,1)$，且 $X$ 和 $Y$ 相互独立。由 $X\sim N(1,1)$，可得 $X-1\sim N(0,1)$，所以 $P\{XY-Y<0\}=P\{(X-1)Y<0\}=P\{X-1<0,Y>0\}+P\{X-1>0,Y<0\}=\frac12\times\frac12+\frac12\times\frac12=\frac12$。」
- **结论**：答案 $\dfrac12$（kind=`fill`，锚点 `\dfrac12`）；三源一致性 = all（题面 真题册 p30 + 解析册 p4 亲读 + 独立复算）；
  - 独立复算：独立复算同值：二维正态 $N(1,0;1,1;0)$ 中 $\rho=0$ ⇒ $X,Y$ 独立；$(X-1)$ 与 $Y$ 各自关于 0 对称 ⇒ $P\{(X-1)Y<0\}=\frac12$。
- **置信度**：high；

### m3-2015-15 ｜ 三(15) ｜ 解答

- **材料**：2015 年数学三真题答案解析册（`参考文件/真题/数学/6、【1987-2025年】考研数学三真题答案及解析/2015年数学三真题答案解析.pdf`），题面见真题册 PDF p30；
- **页码**：解析册 PDF p4（整页）；
- **生成命令**：`参考文件/_venv/Scripts/python.exe tools/refs-vision.py --pdf "参考文件/真题/数学/6、【1987-2025年】考研数学三真题答案及解析/2015年数学三真题答案解析.pdf" --page 4 --dpi 130 --out "backup/scratch/refs-math3-ans/crops/2015_ans_p4.png"`
- **裁片**：`backup/scratch/refs-math3-ans/crops/2015_ans_p4.png`（932×1331 px / 128753 B / sha256 `c7afa7cf1a212029a143b9ee4c750a9e4099e1f070583437f09b354b72fe7b94`）
- **亲读原文**：「(15) 解 因为 $\lim_{x\to0}f'(x)=\lim_{x\to0}\left[1+\frac{a}{1+x}+b(\sin x+x\cos x)\right]=1+a$，$\lim_{x\to0}g'(x)=\lim_{x\to0}3kx^2=0$，所以当 $1+a\ne0$ 时，$\lim_{x\to0}\frac{f(x)}{g(x)}=\lim_{x\to0}\frac{f'(x)}{g'(x)}=\infty$，与题设矛盾。故 $1+a=0$，即 $a=-1$。又 $\lim_{x\to0}f''(x)=\lim_{x\to0}\left[-\frac{a}{(1+x)^2}+b(2\cos x-x\sin x)\right]=-a+2b=1+2b$，$\lim_{x\to0}g''(x)=\lim_{x\to0}6kx=0$，由题设同理可知 $1+2b=0$，即 $b=-\frac12$。由于 $\lim_{x\to0}\frac{f'''(x)}{g'''(x)}=\lim_{x\to0}\frac{\frac{2a}{(1+x)^3}-b(3\sin x+x\cos x)}{6k}=\frac{a}{3k}=-\frac1{3k}$，且 $\lim_{x\to0}\frac{f(x)}{g(x)}=1$，所以 $-\frac1{3k}=1$，即 $k=-\frac13$。」
- **结论**：答案 $a=-1,\ b=-\dfrac12,\ k=-\dfrac13$（kind=`solution`，锚点 `a=-1,\ b=-\dfrac12,\ k=-\dfrac13`）；三源一致性 = all（题面 真题册 p30 + 解析册 p4 亲读 + 独立复算）；
  - 独立复算：独立复算同值：$f'(0)=1+a$；$f''(0)=1+2b$（用 $a=-1$）；$f'''(0)=2a-0=2a$、$g'''(0)=6k$ ⇒ 比值 $a/(3k)$。由 $f\sim g$ 逐阶得 $a=-1,b=-\frac12,k=-\frac13$。
- **置信度**：high；

### m3-2015-16 ｜ 三(16) ｜ 解答

- **材料**：2015 年数学三真题答案解析册（`参考文件/真题/数学/6、【1987-2025年】考研数学三真题答案及解析/2015年数学三真题答案解析.pdf`），题面见真题册 PDF p30；
- **页码**：解析册 PDF p4（整页）；
- **生成命令**：`参考文件/_venv/Scripts/python.exe tools/refs-vision.py --pdf "参考文件/真题/数学/6、【1987-2025年】考研数学三真题答案及解析/2015年数学三真题答案解析.pdf" --page 4 --dpi 130 --out "backup/scratch/refs-math3-ans/crops/2015_ans_p4.png"`
- **裁片**：`backup/scratch/refs-math3-ans/crops/2015_ans_p4.png`（932×1331 px / 128753 B / sha256 `c7afa7cf1a212029a143b9ee4c750a9e4099e1f070583437f09b354b72fe7b94`）
  - 续页补渲：`backup/scratch/refs-math3-ans/crops/2015_ans_p5.png`（932×1331 px / 121808 B / sha256 `fe4d0dde751d7d32310a3434c033f4b03c358c7ce896b959f55953fc931a1020`）
- **亲读原文**：「(16) 解 因为区域 $D$ 关于 $y$ 轴对称，所以 $\iint_Dxy\,\mathrm dx\mathrm dy=0$，$\iint_Dx(x+y)\mathrm dx\mathrm dy=\iint_Dx^2\mathrm dx\mathrm dy=2\int_0^1\mathrm dx\int_{x^2}^{\sqrt{2-x^2}}x^2\mathrm dy=2\int_0^1x^2(\sqrt{2-x^2}-x^2)\mathrm dx$…令 $x=\sqrt2\sin t$，则 $\int_0^1x^2\sqrt{2-x^2}\,\mathrm dx=\int_0^{\frac\pi4}4\sin^2t\cos^2t\,\mathrm dt=\frac12\int_0^{\frac\pi4}(1-\cos4t)\mathrm dt=\frac\pi8$，又 $\int_0^1x^4\mathrm dx=\frac15$，所以 $\iint_Dx(x+y)\mathrm dx\mathrm dy=\frac\pi4-\frac25$。」
- **结论**：答案 $\dfrac{\pi}{4}-\dfrac25$（kind=`solution`，锚点 `\dfrac{\pi}{4}-\dfrac25`）；三源一致性 = all（题面 真题册 p30 + 解析册 p4 亲读 + 独立复算）；
  - 独立复算：独立复算同值：$2(\frac\pi8-\frac15)=\frac\pi4-\frac25$。
- **置信度**：high；

### m3-2015-17 ｜ 三(17) ｜ 解答

- **材料**：2015 年数学三真题答案解析册（`参考文件/真题/数学/6、【1987-2025年】考研数学三真题答案及解析/2015年数学三真题答案解析.pdf`），题面见真题册 PDF p31；
- **页码**：解析册 PDF p5（整页）；
- **生成命令**：`参考文件/_venv/Scripts/python.exe tools/refs-vision.py --pdf "参考文件/真题/数学/6、【1987-2025年】考研数学三真题答案及解析/2015年数学三真题答案解析.pdf" --page 5 --dpi 130 --out "backup/scratch/refs-math3-ans/crops/2015_ans_p5.png"`
- **裁片**：`backup/scratch/refs-math3-ans/crops/2015_ans_p5.png`（932×1331 px / 121808 B / sha256 `fe4d0dde751d7d32310a3434c033f4b03c358c7ce896b959f55953fc931a1020`）
- **亲读原文**：「(17) 解 （Ⅰ）由收益 $R=pQ$，得边际收益 $MR=\frac{\mathrm dR}{\mathrm dQ}=p+Q\frac{\mathrm dp}{\mathrm dQ}=p\left(1-\frac1\eta\right)$。欲使利润最大，应有 $MR=MC$，即 $p\left(1-\frac1\eta\right)=MC$，所以定价模型为 $p=\frac{MC}{1-\frac1\eta}$。（Ⅱ）由题设知 $MC=2Q,\eta=-\frac pQ\frac{\mathrm dQ}{\mathrm dp}=\frac p{40-p}$。由（Ⅰ）有 $p=\frac{2(40-p)}{1-\frac{40-p}{p}}$，解得 $p=30$。所以此商品的价格为 $p=30$。」
- **结论**：答案 （Ⅰ）$MR=p\left(1-\dfrac1\eta\right)$，定价模型 $p=\dfrac{MC}{1-\dfrac1\eta}$；（Ⅱ）$p=30$（kind=`solution`，锚点 `p=\dfrac{MC}{1-\frac1\eta}`）；三源一致性 = all（题面 真题册 p31 + 解析册 p5 亲读 + 独立复算）；
  - 独立复算：独立复算同值：$Q=40-p$ ⇒ $\eta=\frac p{40-p}$；$p(1-\frac1\eta)=p-(40-p)=2p-40$ 令其 $=MC=2(40-p)$ 得 $4p=120$ ⇒ $p=30$。
- **置信度**：high；

### m3-2015-18 ｜ 三(18) ｜ 解答

- **材料**：2015 年数学三真题答案解析册（`参考文件/真题/数学/6、【1987-2025年】考研数学三真题答案及解析/2015年数学三真题答案解析.pdf`），题面见真题册 PDF p31；
- **页码**：解析册 PDF p5（整页）；
- **生成命令**：`参考文件/_venv/Scripts/python.exe tools/refs-vision.py --pdf "参考文件/真题/数学/6、【1987-2025年】考研数学三真题答案及解析/2015年数学三真题答案解析.pdf" --page 5 --dpi 130 --out "backup/scratch/refs-math3-ans/crops/2015_ans_p5.png"`
- **裁片**：`backup/scratch/refs-math3-ans/crops/2015_ans_p5.png`（932×1331 px / 121808 B / sha256 `fe4d0dde751d7d32310a3434c033f4b03c358c7ce896b959f55953fc931a1020`）
- **亲读原文**：「(18) 解 曲线 $y=f(x)$ 在点 $(x_0,f(x_0))$ 处的切线方程为 $y=f(x_0)+f'(x_0)(x-x_0)$，该切线与 $x$ 轴的交点为 $\left(x_0-\frac{f(x_0)}{f'(x_0)},0\right)$。根据题设条件可知 $\frac12\left|\frac{f(x_0)}{f'(x_0)}\right|\cdot|f(x_0)|=4$，即 $y=f(x)$ 满足方程 $y'=\frac18y^2$。解得 $y=-\frac8{8C+x}$。因为 $f(0)=2$，所以 $C=-\frac12$。故 $f(x)=\frac8{4-x},x\in I$。」
- **结论**：答案 $f(x)=\dfrac{8}{4-x},\ x\in I$（kind=`solution`，锚点 `f(x)=\dfrac{8}{4-x}`）；三源一致性 = all（题面 真题册 p31 + 解析册 p5 亲读 + 独立复算）；
  - 独立复算：独立复算同值：$\frac12\cdot\frac{|f|}{|f'|}\cdot|f|=4\Rightarrow f'=\frac{f^2}{8}$；解得 $f=\frac{8}{4-x}$（$f(0)=2$ ✓，$f'=\frac{8}{(4-x)^2}=\frac{f^2}8$ ✓）。
- **置信度**：high；

### m3-2015-19 ｜ 三(19) ｜ 解答

- **材料**：2015 年数学三真题答案解析册（`参考文件/真题/数学/6、【1987-2025年】考研数学三真题答案及解析/2015年数学三真题答案解析.pdf`），题面见真题册 PDF p31；
- **页码**：解析册 PDF p5（整页）；
- **生成命令**：`参考文件/_venv/Scripts/python.exe tools/refs-vision.py --pdf "参考文件/真题/数学/6、【1987-2025年】考研数学三真题答案及解析/2015年数学三真题答案解析.pdf" --page 5 --dpi 130 --out "backup/scratch/refs-math3-ans/crops/2015_ans_p5.png"`
- **裁片**：`backup/scratch/refs-math3-ans/crops/2015_ans_p5.png`（932×1331 px / 121808 B / sha256 `fe4d0dde751d7d32310a3434c033f4b03c358c7ce896b959f55953fc931a1020`）
  - 续页补渲：`backup/scratch/refs-math3-ans/crops/2015_ans_p6.png`（932×1331 px / 120953 B / sha256 `ff4f47209d680a2f4eded85b9d29c2a7f88983f6702333fb45b053e5b4fc61c3`）
- **亲读原文**：「(19) 解 （Ⅰ）因为函数 $u(x),v(x)$ 可导，所以 $\lim_{\Delta x\to0}\frac{u(x+\Delta x)-u(x)}{\Delta x}=u'(x),\lim_{\Delta x\to0}\frac{v(x+\Delta x)-v(x)}{\Delta x}=v'(x)$，且 $\lim_{\Delta x\to0}v(x+\Delta x)=v(x)$。从而 $[u(x)v(x)]'=\lim_{\Delta x\to0}\frac{u(x+\Delta x)v(x+\Delta x)-u(x)v(x)}{\Delta x}=\lim_{\Delta x\to0}\left[\frac{u(x+\Delta x)-u(x)}{\Delta x}v(x+\Delta x)+u(x)\frac{v(x+\Delta x)-v(x)}{\Delta x}\right]=u'(x)v(x)+u(x)v'(x)$。（Ⅱ）$f'(x)=u_1'(x)u_2(x)\cdots u_n(x)+u_1(x)u_2'(x)\cdots u_n(x)+\cdots+u_1(x)u_2(x)\cdots u_n'(x)$。」
- **结论**：答案 证明：$[u(x)v(x)]'=u'v+uv'$；$(u_1u_2\cdots u_n)'=\sum_i u_1\cdots u_i'\cdots u_n$（kind=`solution`，锚点 `[u(x)v(x)]'=u'(x)v(x)+u(x)v'(x)`）；三源一致性 = all（题面 真题册 p31 + 解析册 p5 亲读 + 独立复算）；
  - 独立复算：独立复核同结论：拆项后分别取极限（$v$ 在 $x$ 连续），得乘积法则；对 $n$ 个因子由归纳即得（Ⅱ）。
- **置信度**：high；

### m3-2015-20 ｜ 三(20) ｜ 解答

- **材料**：2015 年数学三真题答案解析册（`参考文件/真题/数学/6、【1987-2025年】考研数学三真题答案及解析/2015年数学三真题答案解析.pdf`），题面见真题册 PDF p31；
- **页码**：解析册 PDF p6（整页）；
- **生成命令**：`参考文件/_venv/Scripts/python.exe tools/refs-vision.py --pdf "参考文件/真题/数学/6、【1987-2025年】考研数学三真题答案及解析/2015年数学三真题答案解析.pdf" --page 6 --dpi 130 --out "backup/scratch/refs-math3-ans/crops/2015_ans_p6.png"`
- **裁片**：`backup/scratch/refs-math3-ans/crops/2015_ans_p6.png`（932×1331 px / 120953 B / sha256 `ff4f47209d680a2f4eded85b9d29c2a7f88983f6702333fb45b053e5b4fc61c3`）
- **亲读原文**：「(20) 解 （Ⅰ）由于 $A^3=O$，所以 $|A|=\begin{vmatrix}a&1&0\\1&a&-1\\0&1&a\end{vmatrix}=a^3=0$，于是 $a=0$。（Ⅱ）由于 $X-XA^2-AX+AXA^2=E$，所以 $(E-A)X(E-A^2)=E$。由（Ⅰ）知 $E-A=\begin{pmatrix}1&-1&0\\-1&1&1\\0&-1&1\end{pmatrix},E-A^2=\begin{pmatrix}0&0&1\\0&1&0\\-1&0&2\end{pmatrix}$，因为 $E-A,E-A^2$ 均可逆，所以 $X=(E-A)^{-1}(E-A^2)^{-1}=\begin{pmatrix}2&1&-1\\1&1&-1\\1&1&0\end{pmatrix}\begin{pmatrix}2&0&-1\\0&1&0\\1&0&0\end{pmatrix}=\begin{pmatrix}3&1&-2\\1&1&-1\\2&1&-1\end{pmatrix}$。」
- **结论**：答案 $a=0$；$X=\begin{pmatrix}3&1&-2\\1&1&-1\\2&1&-1\end{pmatrix}$（kind=`solution`，锚点 `X=\begin{pmatrix}3&1&-2\\1&1&-1\\2&1&-1\end{pmatrix}`）；三源一致性 = all（题面 真题册 p31 + 解析册 p6 亲读 + 独立复算）；
  - 独立复算：独立复算同值：$a=0$ 时 $A^3=O$ ✓；$(E-A)^{-1}=\begin{pmatrix}2&1&-1\\1&1&-1\\1&1&0\end{pmatrix}$、$(E-A^2)^{-1}=\begin{pmatrix}2&0&-1\\0&1&0\\1&0&0\end{pmatrix}$，乘积逐行核为 $(3,1,-2),(1,1,-1),(2,1,-1)$ ✓。
- **置信度**：high；

### m3-2015-21 ｜ 三(21) ｜ 解答

- **材料**：2015 年数学三真题答案解析册（`参考文件/真题/数学/6、【1987-2025年】考研数学三真题答案及解析/2015年数学三真题答案解析.pdf`），题面见真题册 PDF p32；
- **页码**：解析册 PDF p6（整页）；
- **生成命令**：`参考文件/_venv/Scripts/python.exe tools/refs-vision.py --pdf "参考文件/真题/数学/6、【1987-2025年】考研数学三真题答案及解析/2015年数学三真题答案解析.pdf" --page 6 --dpi 130 --out "backup/scratch/refs-math3-ans/crops/2015_ans_p6.png"`
- **裁片**：`backup/scratch/refs-math3-ans/crops/2015_ans_p6.png`（932×1331 px / 120953 B / sha256 `ff4f47209d680a2f4eded85b9d29c2a7f88983f6702333fb45b053e5b4fc61c3`）
  - 续页补渲：`backup/scratch/refs-math3-ans/crops/2015_ans_p7.png`（932×1331 px / 115331 B / sha256 `26b454271c104d45798de4e7b865f8ccdad67426b631782dcb6f2cb8cadf6bca`）
- **亲读原文**：「(21) 解 （Ⅰ）由于矩阵 $A$ 与矩阵 $B$ 相似，所以 $\mathrm{tr}(A)=\mathrm{tr}(B),|A|=|B|$，于是 $3+a=2+b,2a-3=b$，解得 $a=4,b=5$。（Ⅱ）由（Ⅰ）知 $A=\begin{pmatrix}0&2&-3\\-1&3&-3\\1&-2&4\end{pmatrix}$。由于矩阵 $A$ 与矩阵 $B$ 相似，所以 $|\lambda E-A|=|\lambda E-B|=(\lambda-1)^2(\lambda-5)$，故 $A$ 的特征值为 $\lambda_1=\lambda_2=1,\lambda_3=5$。当 $\lambda_1=\lambda_2=1$ 时，由方程组 $(E-A)x=0$，得线性无关的特征向量 $\xi_1=\begin{pmatrix}2\\1\\0\end{pmatrix},\xi_2=\begin{pmatrix}-3\\0\\1\end{pmatrix}$… $\xi_3=\begin{pmatrix}-1\\-1\\1\end{pmatrix}$。令 $P=(\xi_1,\xi_2,\xi_3)=\begin{pmatrix}2&-3&-1\\1&0&-1\\0&1&1\end{pmatrix}$，则 $P^{-1}AP=\begin{pmatrix}1&0&0\\0&1&0\\0&0&5\end{pmatrix}$，故 $P$ 为所求可逆矩阵。」
- **结论**：答案 $a=4,\ b=5$；$P=\begin{pmatrix}2&-3&-1\\1&0&-1\\0&1&1\end{pmatrix}$，$P^{-1}AP=\begin{pmatrix}1&&\\&1&\\&&5\end{pmatrix}$（kind=`solution`，锚点 `P=\begin{pmatrix}2&-3&-1\\1&0&-1\\0&1&1\end{pmatrix}`）；三源一致性 = all（题面 真题册 p32 + 解析册 p6 亲读 + 独立复算）；
  - 独立复算：独立复算同值：迹与行列式条件 $3+a=2+b,\ 2a-3=b$ ⇒ $a=4,b=5$；$\lambda=1$ 重根有 2 个线性无关特征向量 (2,1,0),(−3,0,1)，$\lambda=5$ 对应 (−1,−1,1) ✓。
- **置信度**：high；

### m3-2015-22 ｜ 三(22) ｜ 解答

- **材料**：2015 年数学三真题答案解析册（`参考文件/真题/数学/6、【1987-2025年】考研数学三真题答案及解析/2015年数学三真题答案解析.pdf`），题面见真题册 PDF p32；
- **页码**：解析册 PDF p7（整页）；
- **生成命令**：`参考文件/_venv/Scripts/python.exe tools/refs-vision.py --pdf "参考文件/真题/数学/6、【1987-2025年】考研数学三真题答案及解析/2015年数学三真题答案解析.pdf" --page 7 --dpi 130 --out "backup/scratch/refs-math3-ans/crops/2015_ans_p7.png"`
- **裁片**：`backup/scratch/refs-math3-ans/crops/2015_ans_p7.png`（932×1331 px / 115331 B / sha256 `26b454271c104d45798de4e7b865f8ccdad67426b631782dcb6f2cb8cadf6bca`）
- **亲读原文**：「(22) 解 （Ⅰ）每次观测中，观测值大于 3 的概率为 $P\{X>3\}=\int_3^{+\infty}f(x)\mathrm dx=\int_3^{+\infty}2^{-x}\ln2\,\mathrm dx=\frac18$，故 $Y$ 的概率分布为 $P\{Y=k\}=(k-1)\left(\frac78\right)^{k-2}\left(\frac18\right)^2,k=2,3,\cdots$。（Ⅱ）$EY=\sum_{k=2}^{\infty}k(k-1)\left(\frac78\right)^{k-2}\left(\frac18\right)^2=\left(\frac18\right)^2\left(\sum_{k=2}^{\infty}x^k\right)''\Big|_{x=\frac78}=\left(\frac18\right)^2\frac{2}{(1-x)^3}\Big|_{x=\frac78}=16$。」
- **结论**：答案 $P\{Y=k\}=(k-1)\left(\dfrac78\right)^{k-2}\left(\dfrac18\right)^2\ (k=2,3,\cdots)$；$EY=16$（kind=`solution`，锚点 `EY=16`）；三源一致性 = all（题面 真题册 p32 + 解析册 p7 亲读 + 独立复算）；
  - 独立复算：独立复算同值：$P\{X>3\}=2^{-3}=\frac18$；$Y$ 服从「第 2 次成功所需试验次数」的负二项分布，$EY=2/p=16$ ✓（与级数求和一致）。
- **置信度**：high；

### m3-2015-23 ｜ 三(23) ｜ 解答

- **材料**：2015 年数学三真题答案解析册（`参考文件/真题/数学/6、【1987-2025年】考研数学三真题答案及解析/2015年数学三真题答案解析.pdf`），题面见真题册 PDF p32；
- **页码**：解析册 PDF p7（整页）；
- **生成命令**：`参考文件/_venv/Scripts/python.exe tools/refs-vision.py --pdf "参考文件/真题/数学/6、【1987-2025年】考研数学三真题答案及解析/2015年数学三真题答案解析.pdf" --page 7 --dpi 130 --out "backup/scratch/refs-math3-ans/crops/2015_ans_p7.png"`
- **裁片**：`backup/scratch/refs-math3-ans/crops/2015_ans_p7.png`（932×1331 px / 115331 B / sha256 `26b454271c104d45798de4e7b865f8ccdad67426b631782dcb6f2cb8cadf6bca`）
- **亲读原文**：「(23) 解 （Ⅰ）由于总体 $X$ 服从区间 $[\theta,1]$ 上的均匀分布，所以 $EX=\frac{1+\theta}{2}$。令 $\frac{1+\theta}{2}=\bar X$，其中 $\bar X$ 为样本均值，得 $\theta$ 的矩估计量 $\hat\theta=2\bar X-1$。（Ⅱ）记 $x_1,x_2,\cdots,x_n$ 为样本 $X_1,X_2,\cdots,X_n$ 的观测值，则似然函数为 $L(\theta)=\prod_{i=1}^nf(x_i;\theta)=\begin{cases}\frac1{(1-\theta)^n},&\theta\le x_i\le1\ (i=1,2,\cdots,n),\\0,&其他\end{cases}=\begin{cases}\frac1{(1-\theta)^n},&\theta\le\min\{x_1,x_2,\cdots,x_n\},\\0,&其他.\end{cases}$ 由此可知，当 $\theta=\min\{x_1,x_2,\cdots,x_n\}$ 时，$L(\theta)$ 达到最大，故 $\theta$ 的最大似然估计量 $\hat\theta=\min\{X_1,X_2,\cdots,X_n\}$。」
- **结论**：答案 $\hat\theta=2\bar X-1$；$\hat\theta=\min\{X_1,\cdots,X_n\}$（kind=`solution`，锚点 `\hat\theta=\min\{X_1,\cdots,X_n\}`）；三源一致性 = all（题面 真题册 p32 + 解析册 p7 亲读 + 独立复算）；
  - 独立复算：独立复算同值：$X\sim U[\theta,1]$ ⇒ $EX=\frac{1+\theta}2$ ⇒ 矩估计 $2\bar X-1$；似然 $(1-\theta)^{-n}$ 关于 $\theta$ 单调增，约束 $\theta\le\min x_i$ ⇒ MLE 取 $\min X_i$。
- **置信度**：high；

### m3-2016-11 ｜ 二(11) ｜ 填空

- **材料**：2016 年数学三真题答案解析册（`参考文件/真题/数学/6、【1987-2025年】考研数学三真题答案及解析/2016年数学三真题答案解析.pdf`），题面见真题册 PDF p26；
- **页码**：解析册 PDF p3（整页）；
- **生成命令**：`参考文件/_venv/Scripts/python.exe tools/refs-vision.py --pdf "参考文件/真题/数学/6、【1987-2025年】考研数学三真题答案及解析/2016年数学三真题答案解析.pdf" --page 3 --dpi 130 --out "backup/scratch/refs-math3-ans/crops/2016_ans_p3.png"`
- **裁片**：`backup/scratch/refs-math3-ans/crops/2016_ans_p3.png`（932×1331 px / 141964 B / sha256 `e13b0390539f6100dcf8e1a7f799822d16632e4f7d6a16d787d68c1ae3cb1ebf`）
- **亲读原文**：「(11) $-\mathrm dx+2\mathrm dy$ 解 等式 $(x+1)z-y^2=x^2f(x-z,y)$ 两边分别关于 $x,y$ 求导，得 $z+(x+1)z_x'=2xf(x-z,y)+x^2f_1'(x-z,y)\cdot(1-z_x')$；$(x+1)z_y'-2y=x^2[f_1'(x-z,y)\cdot(-z_y')+f_2'(x-z,y)]$。再将 $x=0,y=1$ 代入原式，可得 $z=1$。将 $x=0,y=1,z=1$ 代入上述两式，得 $z_x'=-1,z_y'=2$。故 $\mathrm dz|_{(0,1)}=z_x'\mathrm dx+z_y'\mathrm dy=-\mathrm dx+2\mathrm dy$。」
- **结论**：答案 $-\mathrm dx+2\mathrm dy$（kind=`fill`，锚点 `-\mathrm dx+2\mathrm dy`）；三源一致性 = all（题面 真题册 p26 + 解析册 p3 亲读 + 独立复算）；
  - 独立复算：独立复算同值：$x=0,y=1\Rightarrow z-1=0\Rightarrow z=1$；对 $x$ 求导 $z+(x+1)z_x'=2xf+x^2f_1'(1-z_x')$，代入 $x=0$ 得 $z_x'=-z=-1$；对 $y$ 求导 $(x+1)z_y'-2y=x^2(\cdots)$，代入得 $z_y'=2$。
- **置信度**：high；

### m3-2016-12 ｜ 二(12) ｜ 填空

- **材料**：2016 年数学三真题答案解析册（`参考文件/真题/数学/6、【1987-2025年】考研数学三真题答案及解析/2016年数学三真题答案解析.pdf`），题面见真题册 PDF p26；
- **页码**：解析册 PDF p3（整页）；
- **生成命令**：`参考文件/_venv/Scripts/python.exe tools/refs-vision.py --pdf "参考文件/真题/数学/6、【1987-2025年】考研数学三真题答案及解析/2016年数学三真题答案解析.pdf" --page 3 --dpi 130 --out "backup/scratch/refs-math3-ans/crops/2016_ans_p3.png"`
- **裁片**：`backup/scratch/refs-math3-ans/crops/2016_ans_p3.png`（932×1331 px / 141964 B / sha256 `e13b0390539f6100dcf8e1a7f799822d16632e4f7d6a16d787d68c1ae3cb1ebf`）
- **亲读原文**：「(12) $\frac13-\frac2{3e}$ 解 积分区域 $D$ 如右图所示，$D$ 关于 $y$ 轴对称，记 $D_1=\{(x,y)|0\le x\le1,x\le y\le1\}$，由对称性知 $\iint_Dx^2e^{-y^2}\mathrm dx\mathrm dy=2\iint_{D_1}x^2e^{-y^2}\mathrm dx\mathrm dy=2\int_0^1\mathrm dy\int_0^yx^2e^{-y^2}\mathrm dx=\frac23\int_0^1y^3e^{-y^2}\mathrm dy\overset{令y^2=t}{=}\frac13\int_0^1te^{-t}\mathrm dt=-\frac13\int_0^1t\mathrm de^{-t}=-\frac13te^{-t}\Big|_0^1+\frac13\int_0^1e^{-t}\mathrm dt=\frac13-\frac2{3e}$。」
- **结论**：答案 $\dfrac13-\dfrac{2}{3e}$（kind=`fill`，锚点 `\dfrac13-\dfrac{2}{3\mathrm e}`）；三源一致性 = all（题面 真题册 p26 + 解析册 p3 亲读 + 独立复算）；
  - 独立复算：独立复算同值：$\frac13\int_0^1te^{-t}dt=\frac13(1-2/e)=\frac13-\frac2{3e}$。
- **置信度**：high；

### m3-2016-13 ｜ 二(13) ｜ 填空

- **材料**：2016 年数学三真题答案解析册（`参考文件/真题/数学/6、【1987-2025年】考研数学三真题答案及解析/2016年数学三真题答案解析.pdf`），题面见真题册 PDF p26；
- **页码**：解析册 PDF p3（整页）；
- **生成命令**：`参考文件/_venv/Scripts/python.exe tools/refs-vision.py --pdf "参考文件/真题/数学/6、【1987-2025年】考研数学三真题答案及解析/2016年数学三真题答案解析.pdf" --page 3 --dpi 130 --out "backup/scratch/refs-math3-ans/crops/2016_ans_p3.png"`
- **裁片**：`backup/scratch/refs-math3-ans/crops/2016_ans_p3.png`（932×1331 px / 141964 B / sha256 `e13b0390539f6100dcf8e1a7f799822d16632e4f7d6a16d787d68c1ae3cb1ebf`）
- **亲读原文**：「(13) $\lambda^4+\lambda^3+2\lambda^2+3\lambda+4$ 解 按最后一行展开，得 $(-1)^{4+1}\times4\begin{vmatrix}-1&0&0\\\lambda&-1&0\\0&\lambda&-1\end{vmatrix}+(-1)^{4+2}\times3\begin{vmatrix}\lambda&0&0\\0&-1&0\\0&\lambda&-1\end{vmatrix}+(-1)^{4+3}\times2\begin{vmatrix}\lambda&-1&0\\0&\lambda&0\\0&0&-1\end{vmatrix}+(-1)^{4+4}(\lambda+1)\begin{vmatrix}\lambda&-1&0\\0&\lambda&-1\\0&0&\lambda\end{vmatrix}=\lambda^4+\lambda^3+2\lambda^2+3\lambda+4$。」
- **结论**：答案 $\lambda^4+\lambda^3+2\lambda^2+3\lambda+4$（kind=`fill`，锚点 `\lambda^4+\lambda^3+2\lambda^2+3\lambda+4`）；三源一致性 = all（题面 真题册 p26 + 解析册 p3 亲读 + 独立复算）；
  - 独立复算：独立复算同值：按末行展开 $(4,3,2,\lambda+1)$ 与余子式：$4\cdot(1)+3\lambda^3+2\lambda^2+(\lambda+1)\lambda^3$…整理得 $\lambda^4+\lambda^3+2\lambda^2+3\lambda+4$。
- **置信度**：high；

### m3-2016-14 ｜ 二(14) ｜ 填空

- **材料**：2016 年数学三真题答案解析册（`参考文件/真题/数学/6、【1987-2025年】考研数学三真题答案及解析/2016年数学三真题答案解析.pdf`），题面见真题册 PDF p26；
- **页码**：解析册 PDF p3（整页）；
- **生成命令**：`参考文件/_venv/Scripts/python.exe tools/refs-vision.py --pdf "参考文件/真题/数学/6、【1987-2025年】考研数学三真题答案及解析/2016年数学三真题答案解析.pdf" --page 3 --dpi 130 --out "backup/scratch/refs-math3-ans/crops/2016_ans_p3.png"`
- **裁片**：`backup/scratch/refs-math3-ans/crops/2016_ans_p3.png`（932×1331 px / 141964 B / sha256 `e13b0390539f6100dcf8e1a7f799822d16632e4f7d6a16d787d68c1ae3cb1ebf`）
- **亲读原文**：「(14) $\frac29$ 解 取球次数恰好为 4 次，说明第 4 次有一种颜色，前 3 次有两种颜色。由古典概率公式，得 $P=\frac{C_3^1\cdot C_3^2\cdot2}{3^4}=\frac29$。」
- **结论**：答案 $\dfrac29$（kind=`fill`，锚点 `\dfrac29`）；三源一致性 = all（题面 真题册 p26 + 解析册 p3 亲读 + 独立复算）；
  - 独立复算：独立复算同值：$\frac{3\times3\times2}{81}=\frac{18}{81}=\frac29$（前三次恰用两色、第四次为第三色，逐段计数得 18 个有利样本点）。
- **置信度**：high；

### m3-2016-15 ｜ 三(15) ｜ 解答

- **材料**：2016 年数学三真题答案解析册（`参考文件/真题/数学/6、【1987-2025年】考研数学三真题答案及解析/2016年数学三真题答案解析.pdf`），题面见真题册 PDF p26；
- **页码**：解析册 PDF p3（整页）；
- **生成命令**：`参考文件/_venv/Scripts/python.exe tools/refs-vision.py --pdf "参考文件/真题/数学/6、【1987-2025年】考研数学三真题答案及解析/2016年数学三真题答案解析.pdf" --page 3 --dpi 130 --out "backup/scratch/refs-math3-ans/crops/2016_ans_p3.png"`
- **裁片**：`backup/scratch/refs-math3-ans/crops/2016_ans_p3.png`（932×1331 px / 141964 B / sha256 `e13b0390539f6100dcf8e1a7f799822d16632e4f7d6a16d787d68c1ae3cb1ebf`）
  - 续页补渲：`backup/scratch/refs-math3-ans/crops/2016_ans_p4.png`（932×1331 px / 153028 B / sha256 `4b2081e42010911c1f83864ea1fe317ed71012b93166e83e8b9f36fbc05e011f`）
- **亲读原文**：「(15) 解 因为 $\lim_{x\to0}(\cos2x+2x\sin x)^{\frac1{x^4}}=e^{\lim_{x\to0}\frac{\ln(\cos2x+2x\sin x)}{x^4}}$，且 $\lim_{x\to0}\frac{\ln(\cos2x+2x\sin x)}{x^4}=\lim_{x\to0}\frac1{\cos2x+2x\sin x}\cdot\frac{-2\sin2x+2\sin x+2x\cos x}{4x^3}=\lim_{x\to0}\frac{-2\cos2x+2\cos x-x\sin x}{6x^2}=\lim_{x\to0}\frac{4\sin2x-3\sin x-x\cos x}{12x}=\frac13$，所以 $\lim_{x\to0}(\cos2x+2x\sin x)^{\frac1{x^4}}=e^{\frac13}$。」
- **结论**：答案 $e^{\frac13}$（kind=`solution`，锚点 `\mathrm e^{\frac13}`）；三源一致性 = all（题面 真题册 p26 + 解析册 p3 亲读 + 独立复算）；
  - 独立复算：独立复算同值：$\cos2x=1-2x^2+\frac23x^4+\cdots$，$2x\sin x=2x^2-\frac13x^4+\cdots$ ⇒ 和 $=1+\frac13x^4+O(x^6)$ ⇒ 极限 $e^{1/3}$。
- **置信度**：high；

### m3-2016-16 ｜ 三(16) ｜ 解答

- **材料**：2016 年数学三真题答案解析册（`参考文件/真题/数学/6、【1987-2025年】考研数学三真题答案及解析/2016年数学三真题答案解析.pdf`），题面见真题册 PDF p26；
- **页码**：解析册 PDF p4（整页）；
- **生成命令**：`参考文件/_venv/Scripts/python.exe tools/refs-vision.py --pdf "参考文件/真题/数学/6、【1987-2025年】考研数学三真题答案及解析/2016年数学三真题答案解析.pdf" --page 4 --dpi 130 --out "backup/scratch/refs-math3-ans/crops/2016_ans_p4.png"`
- **裁片**：`backup/scratch/refs-math3-ans/crops/2016_ans_p4.png`（932×1331 px / 153028 B / sha256 `4b2081e42010911c1f83864ea1fe317ed71012b93166e83e8b9f36fbc05e011f`）
- **亲读原文**：「(16) 解 （Ⅰ）由题设 $-\frac pQ\cdot\frac{\mathrm dQ}{\mathrm dp}=\frac p{120-p}$，所以 $\int\frac{\mathrm dQ}{Q}=-\int\frac1{120-p}\mathrm dp$，可得 $\ln Q=\ln(120-p)+\ln C$，即 $Q=C(120-p)$。又最大需求量为 1200，故 $C=10$，所以需求函数 $Q=1200-10p$。（Ⅱ）由（Ⅰ）知，收益函数 $R=120Q-\frac1{10}Q^2$，边际收益 $R'(Q)=120-\frac15Q$。当 $p=100$ 时，$Q=200$，故当 $p=100$ 万元时的边际收益 $R'(200)=80$，其经济意义为：销售第 201 件商品所得的收益为 80 万元。」
- **结论**：答案 （Ⅰ）$Q=1200-10p$；（Ⅱ）$R'(Q)=120-\dfrac15Q$，$p=100$ 时边际收益 $R'(200)=80$（销售第 201 件商品所得收益 80 万元）（kind=`solution`，锚点 `Q=1200-10p`）；三源一致性 = all（题面 真题册 p26 + 解析册 p4 亲读 + 独立复算）；
  - 独立复算：独立复算同值：由弹性条件解得 $Q=C(120-p)$，$p\to0$ 时 $Q_{\max}=120C=1200$ ⇒ $C=10$；$R=pQ=\frac{(1200-Q)Q}{10}=120Q-\frac{Q^2}{10}$ ✓；$R'(200)=120-40=80$ ✓。
- **置信度**：high；

### m3-2016-17 ｜ 三(17) ｜ 解答

- **材料**：2016 年数学三真题答案解析册（`参考文件/真题/数学/6、【1987-2025年】考研数学三真题答案及解析/2016年数学三真题答案解析.pdf`），题面见真题册 PDF p27；
- **页码**：解析册 PDF p4（整页）；
- **生成命令**：`参考文件/_venv/Scripts/python.exe tools/refs-vision.py --pdf "参考文件/真题/数学/6、【1987-2025年】考研数学三真题答案及解析/2016年数学三真题答案解析.pdf" --page 4 --dpi 130 --out "backup/scratch/refs-math3-ans/crops/2016_ans_p4.png"`
- **裁片**：`backup/scratch/refs-math3-ans/crops/2016_ans_p4.png`（932×1331 px / 153028 B / sha256 `4b2081e42010911c1f83864ea1fe317ed71012b93166e83e8b9f36fbc05e011f`）
- **亲读原文**：「(17) 解 当 $0<x\le1$ 时，$f(x)=\int_0^x|t^2-x^2|\mathrm dt+\int_x^1|t^2-x^2|\mathrm dt=\int_0^x(x^2-t^2)\mathrm dt+\int_x^1(t^2-x^2)\mathrm dt=\frac43x^3-x^2+\frac13$；当 $x>1$ 时，$f(x)=\int_0^1(x^2-t^2)\mathrm dt=x^2-\frac13$…由 $f'(x)=0$ 求得唯一驻点 $x=\frac12$，又 $f''\left(\frac12\right)>0$，从而 $x=\frac12$ 为 $f(x)$ 的最小值点，最小值为 $f\left(\frac12\right)=\frac14$。」
- **结论**：答案 $f(x)=\begin{cases}\frac43x^3-x^2+\frac13,&0<x\le1\\x^2-\frac13,&x>1\end{cases}$；最小值为 $f\left(\frac12\right)=\frac14$（kind=`solution`，锚点 `f\left(\dfrac12\right)=\dfrac14`）；三源一致性 = all（题面 真题册 p27 + 解析册 p4 亲读 + 独立复算）；
  - 独立复算：独立复算同值：$f(\frac12)=\frac43\cdot\frac18-\frac14+\frac13=\frac16-\frac14+\frac13=\frac14$ ✓；$f'(x)=4x^2-2x=0\Rightarrow x=\frac12$（合并处 $f'_-(1)=f'_+(1)=2$ 可导）。
- **置信度**：high；

### m3-2016-18 ｜ 三(18) ｜ 解答

- **材料**：2016 年数学三真题答案解析册（`参考文件/真题/数学/6、【1987-2025年】考研数学三真题答案及解析/2016年数学三真题答案解析.pdf`），题面见真题册 PDF p27；
- **页码**：解析册 PDF p4（整页）；
- **生成命令**：`参考文件/_venv/Scripts/python.exe tools/refs-vision.py --pdf "参考文件/真题/数学/6、【1987-2025年】考研数学三真题答案及解析/2016年数学三真题答案解析.pdf" --page 4 --dpi 130 --out "backup/scratch/refs-math3-ans/crops/2016_ans_p4.png"`
- **裁片**：`backup/scratch/refs-math3-ans/crops/2016_ans_p4.png`（932×1331 px / 153028 B / sha256 `4b2081e42010911c1f83864ea1fe317ed71012b93166e83e8b9f36fbc05e011f`）
- **亲读原文**：「(18) 解 令 $u=x-t$，则 $\int_0^xf(x-t)\mathrm dt=\int_0^xf(u)\mathrm du$。由题设 $\int_0^xf(u)\mathrm du=x\int_0^xf(t)\mathrm dt-\int_0^xtf(t)\mathrm dt+e^{-x}-1$，求导得 $f(x)=\int_0^xf(t)\mathrm dt-e^{-x}$，且 $f(0)=-1$。因此 $f'(x)-f(x)=e^{-x}$，从而 $f(x)=e^{\int\mathrm dx}\left(C+\int e^{-x}e^{-\int\mathrm dx}\mathrm dx\right)=Ce^x-\frac{e^{-x}}2$。由 $f(0)=-1$，得 $C=-\frac12$，所以 $f(x)=-\frac12(e^x+e^{-x})$。」
- **结论**：答案 $f(x)=-\dfrac12\left(e^x+e^{-x}\right)$（kind=`solution`，锚点 `f(x)=-\dfrac12\left(\mathrm e^x+\mathrm e^{-x}\right)`）；三源一致性 = all（题面 真题册 p27 + 解析册 p4 亲读 + 独立复算）；
  - 独立复算：独立复算同值：$f=\int_0^xf-e^{-x}$ ⇒ $f'=f-e^{-x}$ ⇒ $(fe^{-x})'=-e^{-2x}$ ⇒ $fe^{-x}=\frac{e^{-2x}}2+C$ ⇒ $f=\frac{e^{-x}}2+Ce^x$；$f(0)=-1$ ⇒ $C=-\frac12$ ⇒ $f=-\frac12(e^x+e^{-x})$（代回验证 $f'-f=e^{-x}$ ✓）。
- **置信度**：high；

### m3-2016-19 ｜ 三(19) ｜ 解答

- **材料**：2016 年数学三真题答案解析册（`参考文件/真题/数学/6、【1987-2025年】考研数学三真题答案及解析/2016年数学三真题答案解析.pdf`），题面见真题册 PDF p27；
- **页码**：解析册 PDF p4（整页）；
- **生成命令**：`参考文件/_venv/Scripts/python.exe tools/refs-vision.py --pdf "参考文件/真题/数学/6、【1987-2025年】考研数学三真题答案及解析/2016年数学三真题答案解析.pdf" --page 4 --dpi 130 --out "backup/scratch/refs-math3-ans/crops/2016_ans_p4.png"`
- **裁片**：`backup/scratch/refs-math3-ans/crops/2016_ans_p4.png`（932×1331 px / 153028 B / sha256 `4b2081e42010911c1f83864ea1fe317ed71012b93166e83e8b9f36fbc05e011f`）
  - 续页补渲：`backup/scratch/refs-math3-ans/crops/2016_ans_p5.png`（788×1126 px / 125452 B / sha256 `447cd60dcd22ad53d167c9d36a8e7f1780aa01aa7785a6385838736872288476`）
- **亲读原文**：「(19) 解 因为 $\lim_{n\to\infty}\left|\frac{\frac{x^{2n+4}}{(n+2)(2n+3)}}{\frac{x^{2n+2}}{(n+1)(2n+1)}}\right|=x^2$，所以当 $|x|<1$ 时，幂级数绝对收敛；当 $|x|>1$ 时，幂级数发散。又当 $x=\pm1$ 时，级数 $\sum_{n=0}^{\infty}\frac1{(n+1)(2n+1)}$ 收敛，所以幂级数的收敛域为 $[-1,1]$。记 $f(x)=\sum_{n=0}^{\infty}\frac{x^{2n+2}}{(n+1)(2n+1)},x\in[-1,1]$，则 $f'(x)=2\sum_{n=0}^{\infty}\frac{x^{2n+1}}{2n+1},f''(x)=2\sum_{n=0}^{\infty}x^{2n}=\frac2{1-x^2},x\in(-1,1)$…$f(x)=\int_0^xf'(t)\mathrm dt=\int_0^x\ln(1+t)\mathrm dt-\int_0^x\ln(1-t)\mathrm dt=(1+x)\ln(1+x)+(1-x)\ln(1-x)$。又 $f(1)=\lim_{x\to1^-}f(x)=2\ln2,f(-1)=\lim_{x\to-1^+}f(x)=2\ln2$，所以 $f(x)=\begin{cases}(1+x)\ln(1+x)+(1-x)\ln(1-x),&-1<x<1,\\2\ln2,&x=\pm1.\end{cases}$」
- **结论**：答案 收敛域 $[-1,1]$；$f(x)=(1+x)\ln(1+x)+(1-x)\ln(1-x)$（$-1<x<1$），$f(\pm1)=2\ln2$（kind=`solution`，锚点 `f(x)=(1+x)\ln(1+x)+(1-x)\ln(1-x)`）；三源一致性 = all（题面 真题册 p27 + 解析册 p4 亲读 + 独立复算）；
  - 独立复算：独立复算同值：$f''=\frac{2}{1-x^2}$ ⇒ $f'=\ln\frac{1+x}{1-x}$ ⇒ $f=(1+x)\ln(1+x)+(1-x)\ln(1-x)$（$f(0)=0$ ✓）；端点级数 $\sum\frac1{(n+1)(2n+1)}$ 收敛 ⇒ 收敛域 $[-1,1]$，端点值 $2\ln2$ ✓。
- **置信度**：high；

### m3-2016-20 ｜ 三(20) ｜ 解答

- **材料**：2016 年数学三真题答案解析册（`参考文件/真题/数学/6、【1987-2025年】考研数学三真题答案及解析/2016年数学三真题答案解析.pdf`），题面见真题册 PDF p27；
- **页码**：解析册 PDF p5（整页）；
- **生成命令**：`参考文件\_venv\Scripts\python.exe tools/refs-vision.py --pdf "参考文件/真题/数学/6、【1987-2025年】考研数学三真题答案及解析/2016年数学三真题答案解析.pdf" --page 5 --dpi 110 --out "backup/scratch/refs-math3-ans/crops/2016_ans_p5.png"`
- **裁片**：`backup/scratch/refs-math3-ans/crops/2016_ans_p5.png`（788×1126 px / 125452 B / sha256 `447cd60dcd22ad53d167c9d36a8e7f1780aa01aa7785a6385838736872288476`）
- **亲读原文**：「(20) 解 （Ⅰ）对矩阵 $(A\vdots\beta)$ 施以初等行变换 $(A\vdots\beta)=\begin{pmatrix}1&1&1-a\\1&0&a\\a+1&1&a+1\end{pmatrix}\begin{matrix}0\\1\\2a-2\end{matrix}\to\begin{pmatrix}1&1&1-a\\0&-1&2a-1\\0&0&-a^2+2a\end{pmatrix}\begin{matrix}0\\1\\a-2\end{matrix}$，由方程组无解知，秩 $(A\vdots\beta)>$ 秩 $A$，即 $-a^2+2a=0$，且 $a-2\ne0$，解得 $a=0$。（Ⅱ）对矩阵 $(A^{\mathrm T}A\vdots A^{\mathrm T}\beta)$ 施以初等行变换 $(A^{\mathrm T}A\vdots A^{\mathrm T}\beta)=\begin{pmatrix}3&2&2\\2&2&2\\2&2&2\end{pmatrix}\begin{matrix}-1\\-2\\-2\end{matrix}\to\begin{pmatrix}1&0&0\\0&1&1\\0&0&0\end{pmatrix}\begin{matrix}1\\-2\\0\end{matrix}$，所以，方程组 $A^{\mathrm T}Ax=A^{\mathrm T}\beta$ 的通解 $x=\begin{pmatrix}1\\-2\\0\end{pmatrix}+k\begin{pmatrix}0\\-1\\1\end{pmatrix}$（$k$ 为任意常数）。」
- **结论**：答案 $a=0$；通解 $x=\begin{pmatrix}1\\-2\\0\end{pmatrix}+k\begin{pmatrix}0\\-1\\1\end{pmatrix}$（$k$ 任意常数）（kind=`solution`，锚点 `x=(1,-2,0)^{\mathrm T}+k(0,-1,1)^{\mathrm T}`）；三源一致性 = all（题面 真题册 p27 + 解析册 p5 亲读 + 独立复算）；
  - 独立复算：独立复算同值：无解要求 $r(A\vdots\beta)>r(A)$ ⇒ $-a^2+2a=0$ 且 $a\ne2$ ⇒ $a=0$；$A^{\mathrm T}A$ 行最简形给出 $x_1=1,x_2+x_3=-2$ ⇒ 通解如上 ✓。
- **置信度**：high；

### m3-2016-21 ｜ 三(21) ｜ 解答

- **材料**：2016 年数学三真题答案解析册（`参考文件/真题/数学/6、【1987-2025年】考研数学三真题答案及解析/2016年数学三真题答案解析.pdf`），题面见真题册 PDF p28；
- **页码**：解析册 PDF p5（整页）；
- **生成命令**：`参考文件\_venv\Scripts\python.exe tools/refs-vision.py --pdf "参考文件/真题/数学/6、【1987-2025年】考研数学三真题答案及解析/2016年数学三真题答案解析.pdf" --page 5 --dpi 110 --out "backup/scratch/refs-math3-ans/crops/2016_ans_p5.png"`
- **裁片**：`backup/scratch/refs-math3-ans/crops/2016_ans_p5.png`（788×1126 px / 125452 B / sha256 `447cd60dcd22ad53d167c9d36a8e7f1780aa01aa7785a6385838736872288476`）
  - 续页补渲：`backup/scratch/refs-math3-ans/crops/2016_ans_p6.png`（788×1126 px / 82902 B / sha256 `a670a17550340be694fe42976eb1b58653db1a36755506b9eab5ff2ec6800b3a`）
- **亲读原文**：「(21) 解 （Ⅰ）因为 $|\lambda E-A|=\begin{vmatrix}\lambda&1&-1\\-2&\lambda+3&0\\0&0&\lambda\end{vmatrix}=\lambda(\lambda+1)(\lambda+2)$，所以 $A$ 的特征值为 $\lambda_1=-1,\lambda_2=-2,\lambda_3=0$。当 $\lambda_1=-1$ 时，得特征向量 $\xi_1=(1,1,0)^{\mathrm T}$；当 $\lambda_2=-2$ 时得 $\xi_2=(1,2,0)^{\mathrm T}$；当 $\lambda_3=0$ 时得 $\xi_3=(3,2,2)^{\mathrm T}$。令 $P=(\xi_1,\xi_2,\xi_3)=\begin{pmatrix}1&1&3\\1&2&2\\0&0&2\end{pmatrix}$，则 $P^{-1}AP=\begin{pmatrix}-1&0&0\\0&-2&0\\0&0&0\end{pmatrix}$，所以 $A^{99}=P\begin{pmatrix}(-1)^{99}&0&0\\0&(-2)^{99}&0\\0&0&0\end{pmatrix}P^{-1}=\begin{pmatrix}1&1&3\\1&2&2\\0&0&2\end{pmatrix}\begin{pmatrix}(-1)^{99}&0&0\\0&(-2)^{99}&0\\0&0&0\end{pmatrix}\begin{pmatrix}2&-1&-2\\-1&1&\frac12\\0&0&\frac12\end{pmatrix}=\begin{pmatrix}2^{99}-2&1-2^{99}&2-2^{98}\\2^{100}-2&1-2^{100}&2-2^{99}\\0&0&0\end{pmatrix}$。（Ⅱ）因为 $B^2=BA$，所以 $B^{100}=B^{98}B^2=B^{99}A=B^{97}B^2A=B^{98}A^2=\cdots=BA^{99}$，即 $(\beta_1,\beta_2,\beta_3)=(\alpha_1,\alpha_2,\alpha_3)\begin{pmatrix}2^{99}-2&1-2^{99}&2-2^{98}\\2^{100}-2&1-2^{100}&2-2^{99}\\0&0&0\end{pmatrix}$，所以 $\beta_1=(2^{99}-2)\alpha_1+(2^{100}-2)\alpha_2$，$\beta_2=(1-2^{99})\alpha_1+(1-2^{100})\alpha_2$，$\beta_3=(2-2^{98})\alpha_1+(2-2^{99})\alpha_2$。」
- **结论**：答案 特征值 $-1,-2,0$；$P=\begin{pmatrix}1&1&3\\1&2&2\\0&0&2\end{pmatrix}$，$P^{-1}AP=\mathrm{diag}(-1,-2,0)$；$A^{99}=\begin{pmatrix}2^{99}-2&1-2^{99}&2-2^{98}\\2^{100}-2&1-2^{100}&2-2^{99}\\0&0&0\end{pmatrix}$；$B^{100}=BA^{99}$，$\beta_1=(2^{99}-2)\alpha_1+(2^{100}-2)\alpha_2$、$\beta_2=(1-2^{99})\alpha_1+(1-2^{100})\alpha_2$、$\beta_3=(2-2^{98})\alpha_1+(2-2^{99})\alpha_2$（kind=`solution`，锚点 `A^{99}=\begin{pmatrix}2^{99}-2&1-2^{99}&2-2^{98}\\2^{100}-2&1-2^{100}&2-2^{99}\\0&0&0\end{pmatrix}`）；三源一致性 = all（题面 真题册 p28 + 解析册 p5 亲读 + 独立复算）；
  - 独立复算：独立复算同值：特征多项式 $\lambda(\lambda+1)(\lambda+2)$ ✓；$B^{100}=BA^{99}$ ✓；$A^{99}$ 逐元核（如 $A^{99}_{11}=(-1)^{99}\cdot2+(-2)^{99}\cdot1=2^{99}-2$ ✓）。
- **置信度**：high；

### m3-2016-22 ｜ 三(22) ｜ 解答

- **材料**：2016 年数学三真题答案解析册（`参考文件/真题/数学/6、【1987-2025年】考研数学三真题答案及解析/2016年数学三真题答案解析.pdf`），题面见真题册 PDF p28；
- **页码**：解析册 PDF p6（整页）；
- **生成命令**：`参考文件\_venv\Scripts\python.exe tools/refs-vision.py --pdf "参考文件/真题/数学/6、【1987-2025年】考研数学三真题答案及解析/2016年数学三真题答案解析.pdf" --page 6 --dpi 110 --out "backup/scratch/refs-math3-ans/crops/2016_ans_p6.png"`
- **裁片**：`backup/scratch/refs-math3-ans/crops/2016_ans_p6.png`（788×1126 px / 82902 B / sha256 `a670a17550340be694fe42976eb1b58653db1a36755506b9eab5ff2ec6800b3a`）
  - 续页补渲：`backup/scratch/refs-math3-ans/crops/2016_ans_p7.png`（932×1331 px / 74486 B / sha256 `6117ee7910d68b8d30cef14af7c8a515932ec715f702f47f134c222bf177f909`）
- **亲读原文**：「(22) 解 （Ⅰ）$(X,Y)$ 的概率密度为 $f(x,y)=\begin{cases}3,&(x,y)\in D,\\0,&其他.\end{cases}$（Ⅱ）对于 $0<t<1$，$P\{U\le0,X\le t\}=P\{X>Y,X\le t\}=\int_0^t\mathrm dx\int_{x^2}^x3\mathrm dy=\frac32t^2-t^3$，$P\{U\le0\}=P\{X>Y\}=\frac12$，$P\{X\le t\}=\int_0^t\mathrm dx\int_{x^2}^{\sqrt x}3\mathrm dy=2t^{\frac32}-t^3$。由于 $P\{U\le0,X\le t\}\ne P\{U\le0\}P\{X\le t\}$，所以 $U$ 与 $X$ 不相互独立。（Ⅲ）当 $z<0$ 时，$F(z)=0$；当 $0\le z<1$ 时，$F(z)=P\{Z\le z\}=P\{U+X\le z\}=P\{U=0,X\le z\}=P\{X>Y,X\le z\}=\frac32z^2-z^3$；当 $1\le z<2$ 时，$F(z)=P\{U+X\le z\}=P\{U=0,X\le z\}+P\{U=1,X\le z-1\}=\frac12+2(z-1)^{\frac32}-\frac32(z-1)^2$；当 $z\ge2$ 时，$F(z)=1$。所以 $F(z)=\begin{cases}0,&z<0,\\\frac32z^2-z^3,&0\le z<1,\\\frac12+2(z-1)^{\frac32}-\frac32(z-1)^2,&1\le z<2,\\1,&z\ge2.\end{cases}$」
- **结论**：答案 （Ⅰ）$f(x,y)=3$（$(x,y)\in D$）；（Ⅱ）$U$ 与 $X$ 不相互独立；（Ⅲ）$F(z)=\begin{cases}0,&z<0\\\frac32z^2-z^3,&0\le z<1\\\frac12+2(z-1)^{\frac32}-\frac32(z-1)^2,&1\le z<2\\1,&z\ge2\end{cases}$（kind=`solution`，锚点 `F(z)=\begin{cases}0,&z<0\\\frac32z^2-z^3,&0\le z<1\\\frac12+2(z-1)^{\frac32}-\frac32(z-1)^2,&1\le z<2\\1,&z\ge2\end{cases}`）；三源一致性 = all（题面 真题册 p28 + 解析册 p6 亲读 + 独立复算）；
  - 独立复算：独立复算同值：$D$ 上均匀分布、面积 $\int_0^1(\sqrt y-y^2)dy=\frac13$ ⇒ 密度 3 ✓；$P\{X\le t\}=2t^{3/2}-t^3$，$\frac12P\{X\le t\}=t^{3/2}-\frac{t^3}2\ne\frac32t^2-t^3$（$t$ 小时前者 $\sim t^{3/2}$）⇒ 不独立 ✓；分段函数在 $z=1$ 处两侧值均为 $\frac12$ ✓。
- **置信度**：high；

### m3-2016-23 ｜ 三(23) ｜ 解答

- **材料**：2016 年数学三真题答案解析册（`参考文件/真题/数学/6、【1987-2025年】考研数学三真题答案及解析/2016年数学三真题答案解析.pdf`），题面见真题册 PDF p28；
- **页码**：解析册 PDF p7（整页）；
- **生成命令**：`参考文件/_venv/Scripts/python.exe tools/refs-vision.py --pdf "参考文件/真题/数学/6、【1987-2025年】考研数学三真题答案及解析/2016年数学三真题答案解析.pdf" --page 7 --dpi 130 --out "backup/scratch/refs-math3-ans/crops/2016_ans_p7.png"`
- **裁片**：`backup/scratch/refs-math3-ans/crops/2016_ans_p7.png`（932×1331 px / 74486 B / sha256 `6117ee7910d68b8d30cef14af7c8a515932ec715f702f47f134c222bf177f909`）
- **亲读原文**：「(23) 解 （Ⅰ）总体 $X$ 的分布函数为 $F(x)=\begin{cases}0,&x<0,\\\frac{x^3}{\theta^3},&0\le x<\theta,\\1,&x\ge\theta.\end{cases}$ 从而 $T$ 的分布函数为 $F_T(z)=[F(z)]^3=\begin{cases}0,&z<0,\\\frac{z^9}{\theta^9},&0\le z<\theta,\\1,&z\ge\theta.\end{cases}$ 所以 $T$ 的概率密度为 $f_T(z)=\begin{cases}\frac{9z^8}{\theta^9},&0<z<\theta,\\0,&其他.\end{cases}$（Ⅱ）$E(T)=\int_{-\infty}^{+\infty}zf_T(z)\mathrm dz=\int_0^\theta\frac{9z^9}{\theta^9}\mathrm dz=\frac9{10}\theta$，从而 $E(aT)=\frac9{10}a\theta$。令 $E(aT)=\theta$，得 $a=\frac{10}9$。所以当 $a=\frac{10}9$ 时，$E(aT)=\theta$。」
- **结论**：答案 $f_T(z)=\dfrac{9z^8}{\theta^9}$（$0<z<\theta$）；$E(T)=\dfrac9{10}\theta$，$a=\dfrac{10}{9}$（kind=`solution`，锚点 `a=\dfrac{10}{9}`）；三源一致性 = all（题面 真题册 p28 + 解析册 p7 亲读 + 独立复算）；
  - 独立复算：独立复算同值：$T=\max\{X_1,X_2,X_3\}$ ⇒ 分布函数立方 ⇒ $f_T=9z^8/\theta^9$ ✓；$E(T)=\frac9{10}\theta$ ⇒ $a=\frac{10}9$ ✓。
- **置信度**：high；

### m3-2017-10 ｜ 二(10) ｜ 填空

- **材料**：2017 年数学三真题答案解析册（`参考文件/真题/数学/6、【1987-2025年】考研数学三真题答案及解析/2017年数学三真题答案解析.pdf`），题面见真题册 PDF p22；
- **页码**：解析册 PDF p3（整页）；
- **生成命令**：`参考文件/_venv/Scripts/python.exe tools/refs-vision.py --pdf "参考文件/真题/数学/6、【1987-2025年】考研数学三真题答案及解析/2017年数学三真题答案解析.pdf" --page 3 --dpi 130 --out "backup/scratch/refs-math3-ans/crops/2017_ans_p3.png"`
- **裁片**：`backup/scratch/refs-math3-ans/crops/2017_ans_p3.png`（932×1331 px / 153187 B / sha256 `6f0370bd9d54e24476bc5a5b9a400a2d11e69265c4f61fdee188841999d9dca3`）
- **亲读原文**：「(10) $A2^t+t2^{t-1}$ 解 $y_{t+1}-2y_t=2^t$ 对应的齐次方程为 $y_{t+1}-2y_t=0$，特征方程为 $\lambda^{t+1}-2\lambda^t=0$，特征根为 $\lambda=2$。因 $y_{t+1}-2y_t=0$ 的通解为 $Y_t=A2^t$，再设 $y_t^*=kt2^t$ 为 $y_{t+1}-2y_t=2^t$ 的解，代入方程得 $k(t+1)2^{t+1}-2kt2^t=2^t$，解得 $k=\frac12$。所以 $y_t^*=\frac12t2^t=t2^{t-1}$。由差分方程解的结构定理得，原方程的通解为 $y_t=Y_t+y_t^*=A2^t+t2^{t-1}$。」
- **结论**：答案 $A2^t+t2^{t-1}$（kind=`fill`，锚点 `A2^t+t2^{t-1}`）；三源一致性 = all（题面 真题册 p22 + 解析册 p3 亲读 + 独立复算）；
  - 独立复算：独立复算同值：特解设 $kt2^t$ 代入 ⇒ $2k=1$ ⇒ $k=\frac12$ ⇒ $y_t^*=t2^{t-1}$，通解 $A2^t+t2^{t-1}$。
- **置信度**：high；

### m3-2017-11 ｜ 二(11) ｜ 填空

- **材料**：2017 年数学三真题答案解析册（`参考文件/真题/数学/6、【1987-2025年】考研数学三真题答案及解析/2017年数学三真题答案解析.pdf`），题面见真题册 PDF p22；
- **页码**：解析册 PDF p3（整页）；
- **生成命令**：`参考文件/_venv/Scripts/python.exe tools/refs-vision.py --pdf "参考文件/真题/数学/6、【1987-2025年】考研数学三真题答案及解析/2017年数学三真题答案解析.pdf" --page 3 --dpi 130 --out "backup/scratch/refs-math3-ans/crops/2017_ans_p3.png"`
- **裁片**：`backup/scratch/refs-math3-ans/crops/2017_ans_p3.png`（932×1331 px / 153187 B / sha256 `6f0370bd9d54e24476bc5a5b9a400a2d11e69265c4f61fdee188841999d9dca3`）
- **亲读原文**：「(11) $1+(1-Q)e^{-Q}$ 解 平均成本 $\bar C(Q)=1+e^{-Q}$，成本为 $C(Q)=Q\bar C(Q)=Q+Qe^{-Q}$。边际成本为 $C'(Q)=1+e^{-Q}-Qe^{-Q}=1+(1-Q)e^{-Q}$。故应填 $1+(1-Q)e^{-Q}$。」
- **结论**：答案 $1+(1-Q)e^{-Q}$（kind=`fill`，锚点 `1+(1-Q)\mathrm e^{-Q}`）；三源一致性 = all（题面 真题册 p22 + 解析册 p3 亲读 + 独立复算）；
  - 独立复算：独立复算同值：$C=Q+Qe^{-Q}$ ⇒ $C'=1+e^{-Q}-Qe^{-Q}$ ✓。
- **置信度**：high；

### m3-2017-12 ｜ 二(12) ｜ 填空

- **材料**：2017 年数学三真题答案解析册（`参考文件/真题/数学/6、【1987-2025年】考研数学三真题答案及解析/2017年数学三真题答案解析.pdf`），题面见真题册 PDF p22；
- **页码**：解析册 PDF p3（整页）；
- **生成命令**：`参考文件/_venv/Scripts/python.exe tools/refs-vision.py --pdf "参考文件/真题/数学/6、【1987-2025年】考研数学三真题答案及解析/2017年数学三真题答案解析.pdf" --page 3 --dpi 130 --out "backup/scratch/refs-math3-ans/crops/2017_ans_p3.png"`
- **裁片**：`backup/scratch/refs-math3-ans/crops/2017_ans_p3.png`（932×1331 px / 153187 B / sha256 `6f0370bd9d54e24476bc5a5b9a400a2d11e69265c4f61fdee188841999d9dca3`）
- **亲读原文**：「(12) $xye^y$ 解 由题意 $f_x'(x,y)=ye^y,f_y'(x,y)=x(1+y)e^y$。所以有 $f(x,y)=\int f_x'(x,y)\mathrm dx=\int ye^y\mathrm dx=xye^y+C(y)$。$f_y'(x,y)=[xye^y+C(y)]'=x(1+y)e^y+C'(y)=x(1+y)e^y$，$\therefore C'(y)=0\Rightarrow C(y)=C$。因此 $f(x,y)=xye^y+C$，又 $f(0,0)=0$，所以 $C=0$。故 $f(x,y)=xye^y$。」
- **结论**：答案 $xye^{y}$（kind=`fill`，锚点 `xy\mathrm e^{y}`）；三源一致性 = all（题面 真题册 p22 + 解析册 p3 亲读 + 独立复算）；
  - 独立复算：独立复算同值：积分 $f=\int ye^y dx = xye^y+C(y)$，再由 $f_y$ 定出 $C'(y)=0$；$f(0,0)=0$ ⇒ $C=0$。
- **置信度**：high；

### m3-2017-13 ｜ 二(13) ｜ 填空

- **材料**：2017 年数学三真题答案解析册（`参考文件/真题/数学/6、【1987-2025年】考研数学三真题答案及解析/2017年数学三真题答案解析.pdf`），题面见真题册 PDF p22；
- **页码**：解析册 PDF p3（整页）；
- **生成命令**：`参考文件/_venv/Scripts/python.exe tools/refs-vision.py --pdf "参考文件/真题/数学/6、【1987-2025年】考研数学三真题答案及解析/2017年数学三真题答案解析.pdf" --page 3 --dpi 130 --out "backup/scratch/refs-math3-ans/crops/2017_ans_p3.png"`
- **裁片**：`backup/scratch/refs-math3-ans/crops/2017_ans_p3.png`（932×1331 px / 153187 B / sha256 `6f0370bd9d54e24476bc5a5b9a400a2d11e69265c4f61fdee188841999d9dca3`）
- **亲读原文**：「(13) $2$ 解 $(A\alpha_1,A\alpha_2,A\alpha_3)=A(\alpha_1,\alpha_2,\alpha_3)$，因为 $\alpha_1,\alpha_2,\alpha_3$ 线性无关，故矩阵 $(\alpha_1,\alpha_2,\alpha_3)$ 可逆，所以 $r(A\alpha_1,A\alpha_2,A\alpha_3)=r(A)$，易知 $r(A)=2$。故应填 2。」
- **结论**：答案 $2$（kind=`fill`，锚点 `2`）；三源一致性 = all（题面 真题册 p22 + 解析册 p3 亲读 + 独立复算）；
  - 独立复算：独立复算同值：右乘可逆阵不改变秩 ⇒ $r(A\alpha_i$ 组$)=r(A)=2$ ✓。
- **置信度**：high；

### m3-2017-14 ｜ 二(14) ｜ 填空

- **材料**：2017 年数学三真题答案解析册（`参考文件/真题/数学/6、【1987-2025年】考研数学三真题答案及解析/2017年数学三真题答案解析.pdf`），题面见真题册 PDF p22；
- **页码**：解析册 PDF p3（整页）；
- **生成命令**：`参考文件/_venv/Scripts/python.exe tools/refs-vision.py --pdf "参考文件/真题/数学/6、【1987-2025年】考研数学三真题答案及解析/2017年数学三真题答案解析.pdf" --page 3 --dpi 130 --out "backup/scratch/refs-math3-ans/crops/2017_ans_p3.png"`
- **裁片**：`backup/scratch/refs-math3-ans/crops/2017_ans_p3.png`（932×1331 px / 153187 B / sha256 `6f0370bd9d54e24476bc5a5b9a400a2d11e69265c4f61fdee188841999d9dca3`）
  - 续页补渲：`backup/scratch/refs-math3-ans/crops/2017_ans_p4.png`（932×1331 px / 91368 B / sha256 `46462e2a019ee5363760d0b4795f8d18301b8690f5c57c0ca01ab7bfed7bda73`）
- **亲读原文**：「(14) $\frac92$ 解 由分布律的归一性可知 $\sum_kP_k=1$，即 $\frac12+a+b=1$，又因为 $EX=0$，即 $-2\times\frac12+a+3b=0$。解得 $a=b=\frac14$。而 $E(X^2)=(-2)^2\times\frac12+1^2\times\frac14+3^2\times\frac14=\frac92$。所以 $DX=E(X^2)-(EX)^2=\frac92$。」
- **结论**：答案 $\dfrac92$（kind=`fill`，锚点 `\dfrac92`）；三源一致性 = all（题面 真题册 p22 + 解析册 p3 亲读 + 独立复算）；
  - 独立复算：独立复算同值：$\frac12+a+b=1$ 与 $-1+a+3b=0$ ⇒ $a=b=\frac14$；$E(X^2)=2+\frac14+\frac94=\frac92$，$EX=0$ ⇒ $DX=\frac92$ ✓。
- **置信度**：high；

### m3-2017-15 ｜ 三(15) ｜ 解答

- **材料**：2017 年数学三真题答案解析册（`参考文件/真题/数学/6、【1987-2025年】考研数学三真题答案及解析/2017年数学三真题答案解析.pdf`），题面见真题册 PDF p22；
- **页码**：解析册 PDF p4（整页）；
- **生成命令**：`参考文件/_venv/Scripts/python.exe tools/refs-vision.py --pdf "参考文件/真题/数学/6、【1987-2025年】考研数学三真题答案及解析/2017年数学三真题答案解析.pdf" --page 4 --dpi 130 --out "backup/scratch/refs-math3-ans/crops/2017_ans_p4.png"`
- **裁片**：`backup/scratch/refs-math3-ans/crops/2017_ans_p4.png`（932×1331 px / 91368 B / sha256 `46462e2a019ee5363760d0b4795f8d18301b8690f5c57c0ca01ab7bfed7bda73`）
- **亲读原文**：「(15) 解 令 $x-t=u$，则 $t=x-u,\mathrm dt=-\mathrm du$。$\lim_{x\to0^+}\frac{\int_0^x\sqrt{x-t}\,e^t\mathrm dt}{\sqrt{x^3}}=\lim_{x\to0^+}\frac{e^x\int_0^x\sqrt u\,e^{-u}\mathrm du}{\sqrt{x^3}}=\lim_{x\to0^+}\frac{\int_0^x\sqrt u\,e^{-u}\mathrm du}{\sqrt{x^3}}=\lim_{x\to0^+}\frac{\sqrt x\,e^{-x}}{\frac32\sqrt x}=\frac23$。」
- **结论**：答案 $\dfrac23$（kind=`solution`，锚点 `\dfrac23`）；三源一致性 = all（题面 真题册 p22 + 解析册 p4 亲读 + 独立复算）；
  - 独立复算：独立复算同值：换元后分子 $\sim \frac23x^{3/2}$ ⇒ 极限 $\frac23$ ✓。
- **置信度**：high；

### m3-2017-16 ｜ 三(16) ｜ 解答

- **材料**：2017 年数学三真题答案解析册（`参考文件/真题/数学/6、【1987-2025年】考研数学三真题答案及解析/2017年数学三真题答案解析.pdf`），题面见真题册 PDF p22；
- **页码**：解析册 PDF p4（整页）；
- **生成命令**：`参考文件/_venv/Scripts/python.exe tools/refs-vision.py --pdf "参考文件/真题/数学/6、【1987-2025年】考研数学三真题答案及解析/2017年数学三真题答案解析.pdf" --page 4 --dpi 130 --out "backup/scratch/refs-math3-ans/crops/2017_ans_p4.png"`
- **裁片**：`backup/scratch/refs-math3-ans/crops/2017_ans_p4.png`（932×1331 px / 91368 B / sha256 `46462e2a019ee5363760d0b4795f8d18301b8690f5c57c0ca01ab7bfed7bda73`）
- **亲读原文**：「(16) 解 $\iint_D\frac{y^3}{(1+x^2+y^4)^2}\mathrm dx\mathrm dy=\int_0^{+\infty}\mathrm dx\int_0^{\sqrt x}\frac{y^3}{(1+x^2+y^4)^2}\mathrm dy=\frac14\int_0^{+\infty}\frac{-1}{1+x^2+y^4}\Big|_0^{\sqrt x}\mathrm dx=\frac14\int_0^{+\infty}\left(\frac1{1+x^2}-\frac1{1+2x^2}\right)\mathrm dx=\frac14\left(\arctan x\Big|_0^{+\infty}-\frac{\sqrt2}{2}\arctan\sqrt2x\Big|_0^{+\infty}\right)=\frac{2-\sqrt2}{16}\pi$。」
- **结论**：答案 $\dfrac{(2-\sqrt2)\pi}{16}$（kind=`solution`，锚点 `\dfrac{(2-\sqrt2)\pi}{16}`）；三源一致性 = all（题面 真题册 p22 + 解析册 p4 亲读 + 独立复算）；
  - 独立复算：独立复算同值：内层积分为 $\frac14(\frac1{1+x^2}-\frac1{1+2x^2})$；$\int_0^\infty\frac{\mathrm dx}{1+2x^2}=\frac{\pi}{2\sqrt2}$，故 $\frac14(\frac\pi2-\frac{\pi}{2\sqrt2})=\frac{(2-\sqrt2)\pi}{16}$ ✓。
- **置信度**：high；

### m3-2017-17 ｜ 三(17) ｜ 解答

- **材料**：2017 年数学三真题答案解析册（`参考文件/真题/数学/6、【1987-2025年】考研数学三真题答案及解析/2017年数学三真题答案解析.pdf`），题面见真题册 PDF p23；
- **页码**：解析册 PDF p4（整页）；
- **生成命令**：`参考文件/_venv/Scripts/python.exe tools/refs-vision.py --pdf "参考文件/真题/数学/6、【1987-2025年】考研数学三真题答案及解析/2017年数学三真题答案解析.pdf" --page 4 --dpi 130 --out "backup/scratch/refs-math3-ans/crops/2017_ans_p4.png"`
- **裁片**：`backup/scratch/refs-math3-ans/crops/2017_ans_p4.png`（932×1331 px / 91368 B / sha256 `46462e2a019ee5363760d0b4795f8d18301b8690f5c57c0ca01ab7bfed7bda73`）
  - 续页补渲：`backup/scratch/refs-math3-ans/crops/2017_ans_p5.png`（932×1331 px / 154870 B / sha256 `8a1158813161feea4312208adaee952dfa252d99dbc8d2092d7b1db72392bdd3`）
- **亲读原文**：「(17) 解 $\lim_{n\to\infty}\sum_{k=1}^n\frac kn^2\ln\left(1+\frac kn\right)=\lim_{n\to\infty}\sum_{k=1}^n\frac kn\ln\left(1+\frac kn\right)\cdot\frac1n=\int_0^1x\ln(1+x)\mathrm dx=\frac12x^2\ln(1+x)\Big|_0^1-\frac12\int_0^1\frac{x^2}{1+x}\mathrm dx=\frac12\ln2-\frac12\int_0^1\left(x-1+\frac1{1+x}\right)\mathrm dx=\frac12\ln2-\frac14(x-1)^2\Big|_0^1-\frac12\ln(1+x)\Big|_0^1=\frac14$。」
- **结论**：答案 $\dfrac14$（kind=`solution`，锚点 `\dfrac14`）；三源一致性 = all（题面 真题册 p23 + 解析册 p4 亲读 + 独立复算）；
  - 独立复算：独立复算同值：$\int_0^1x\ln(1+x)\mathrm dx=\frac12\ln2-\frac12(\ln2-\frac12)=\frac14$ ✓（黎曼和化为定积分）。
- **置信度**：high；

### m3-2017-18 ｜ 三(18) ｜ 解答

- **材料**：2017 年数学三真题答案解析册（`参考文件/真题/数学/6、【1987-2025年】考研数学三真题答案及解析/2017年数学三真题答案解析.pdf`），题面见真题册 PDF p23；
- **页码**：解析册 PDF p5（整页）；
- **生成命令**：`参考文件/_venv/Scripts/python.exe tools/refs-vision.py --pdf "参考文件/真题/数学/6、【1987-2025年】考研数学三真题答案及解析/2017年数学三真题答案解析.pdf" --page 5 --dpi 130 --out "backup/scratch/refs-math3-ans/crops/2017_ans_p5.png"`
- **裁片**：`backup/scratch/refs-math3-ans/crops/2017_ans_p5.png`（932×1331 px / 154870 B / sha256 `8a1158813161feea4312208adaee952dfa252d99dbc8d2092d7b1db72392bdd3`）
- **亲读原文**：「(18) 解 记 $f(x)=\frac1{\ln(1+x)}-\frac1x-k,x\in(0,1]$，则 $f'(x)=\frac{(1+x)\ln^2(1+x)-x^2}{x^2(1+x)\ln^2(1+x)}$。记 $g(x)=(1+x)\ln^2(1+x)-x^2$，则 $g'(x)=\ln^2(1+x)+2\ln(1+x)-2x$，$g''(x)=\frac{2[\ln(1+x)-x]}{1+x}$。当 $x\in(0,1]$ 时，$g''(x)<0$，所以 $g'(x)<g'(0)$。又 $g'(0)=0$，所以当 $x\in(0,1]$ 时，$g'(x)<0$，从而 $g(x)<g(0)=0$。综上可知 $f'(x)<0$，即 $f(x)$ 单调递减。由于 $\lim_{x\to0^+}f(x)=\lim_{x\to0^+}\left(\frac1{\ln(1+x)}-\frac1x-k\right)=\frac12-k$，$f(1)=\frac1{\ln2}-1-k$，所以方程 $f(x)=0$ 在区间 $(0,1)$ 内有实根当且仅当 $\begin{cases}\frac12-k>0,\\\frac1{\ln2}-1-k<0.\end{cases}$ 故常数 $k$ 的取值范围为 $\left(\frac1{\ln2}-1,\frac12\right)$。」
- **结论**：答案 $k$ 的取值范围为 $\left(\dfrac1{\ln 2}-1,\ \dfrac12\right)$（kind=`solution`，锚点 `k\in\left(\dfrac1{\ln 2}-1,\dfrac12\right)`）；三源一致性 = all（题面 真题册 p23 + 解析册 p5 亲读 + 独立复算）；
  - 独立复算：独立复算同值：$\frac1{\ln(1+x)}-\frac1x\to\frac12$（$x\to0^+$，用 $\ln(1+x)=x-\frac{x^2}2+O(x^3)$）；端点符号条件给出 $\frac1{\ln2}-1<k<\frac12$ ✓。
- **置信度**：high；

### m3-2017-19 ｜ 三(19) ｜ 解答

- **材料**：2017 年数学三真题答案解析册（`参考文件/真题/数学/6、【1987-2025年】考研数学三真题答案及解析/2017年数学三真题答案解析.pdf`），题面见真题册 PDF p23；
- **页码**：解析册 PDF p5（整页）；
- **生成命令**：`参考文件/_venv/Scripts/python.exe tools/refs-vision.py --pdf "参考文件/真题/数学/6、【1987-2025年】考研数学三真题答案及解析/2017年数学三真题答案解析.pdf" --page 5 --dpi 130 --out "backup/scratch/refs-math3-ans/crops/2017_ans_p5.png"`
- **裁片**：`backup/scratch/refs-math3-ans/crops/2017_ans_p5.png`（932×1331 px / 154870 B / sha256 `8a1158813161feea4312208adaee952dfa252d99dbc8d2092d7b1db72392bdd3`）
- **亲读原文**：「(19) 解 （Ⅰ）因为 $a_0=1,a_1=0,a_{n+1}=\frac1{n+1}(na_n+a_{n-1})$，所以 $0\le a_{n+1}\le1$。记 $R$ 为幂级数 $\sum_{n=0}^{\infty}a_nx^n$ 的收敛半径。当 $|x|<1$ 时，因为 $|a_nx^n|\le|x|^n$ 且级数 $\sum_{n=0}^{\infty}x^n$ 收敛，所以幂级数 $\sum_{n=0}^{\infty}a_nx^n$ 绝对收敛，于是 $(-1,1)\subseteq(-R,R)$，故 $R\ge1$。（Ⅱ）因为 $S(x)=\sum_{n=0}^{\infty}a_nx^n$，所以 $S'(x)=\sum_{n=1}^{\infty}na_nx^{n-1}=\sum_{n=0}^{\infty}(n+1)a_{n+1}x^n$，于是 $(1-x)S'(x)-xS(x)=0$。解方程 $(1-x)S'(x)-xS(x)=0$ 得 $S(x)=\frac{Ce^{-x}}{1-x}$。由 $S(0)=a_0=1$ 得 $C=1$，故 $S(x)=\frac{e^{-x}}{1-x}$。」
- **结论**：答案 （Ⅰ）$R\ge1$，幂级数在 $(-1,1)$ 内绝对收敛；（Ⅱ）$S(x)=\dfrac{e^{-x}}{1-x}$（kind=`solution`，锚点 `S(x)=\dfrac{\mathrm e^{-x}}{1-x}`）；三源一致性 = all（题面 真题册 p23 + 解析册 p5 亲读 + 独立复算）；
  - 独立复算：独立复算同值：$S'/S=\frac x{1-x}\Rightarrow \ln S=-x-\ln(1-x)+C\Rightarrow S=\frac{Ce^{-x}}{1-x}$，$S(0)=1\Rightarrow C=1$ ✓。
- **置信度**：high；

### m3-2017-20 ｜ 三(20) ｜ 解答

- **材料**：2017 年数学三真题答案解析册（`参考文件/真题/数学/6、【1987-2025年】考研数学三真题答案及解析/2017年数学三真题答案解析.pdf`），题面见真题册 PDF p23；
- **页码**：解析册 PDF p5（整页）；
- **生成命令**：`参考文件/_venv/Scripts/python.exe tools/refs-vision.py --pdf "参考文件/真题/数学/6、【1987-2025年】考研数学三真题答案及解析/2017年数学三真题答案解析.pdf" --page 5 --dpi 130 --out "backup/scratch/refs-math3-ans/crops/2017_ans_p5.png"`
- **裁片**：`backup/scratch/refs-math3-ans/crops/2017_ans_p5.png`（932×1331 px / 154870 B / sha256 `8a1158813161feea4312208adaee952dfa252d99dbc8d2092d7b1db72392bdd3`）
  - 续页补渲：`backup/scratch/refs-math3-ans/crops/2017_ans_p6.png`（932×1331 px / 131954 B / sha256 `506ec81569d48c58004981ca7b0a72030694f13190528b5bdc238a744ed52899`）
- **亲读原文**：「(20) 解 （Ⅰ）由 $\alpha_3=\alpha_1+2\alpha_2$，知 $\alpha_1,\alpha_2,\alpha_3$ 线性相关，故 $r(A)\le2$。又因为 $A$ 有 3 个不同的特征值，所以 $A$ 至少有 2 个不为零的特征值，从而 $r(A)\ge2$。故 $r(A)=2$。（Ⅱ）由 $\alpha_1+2\alpha_2-\alpha_3=0$，知 $A\begin{pmatrix}1\\2\\-1\end{pmatrix}=0$，故 $\begin{pmatrix}1\\2\\-1\end{pmatrix}$ 为方程组 $Ax=0$ 的一个解。又 $r(A)=2$，所以 $\begin{pmatrix}1\\2\\-1\end{pmatrix}$ 为 $Ax=0$ 的一个基础解系。因为 $\beta=\alpha_1+\alpha_2+\alpha_3=A\begin{pmatrix}1\\1\\1\end{pmatrix}$，所以 $\begin{pmatrix}1\\1\\1\end{pmatrix}$ 为方程组 $Ax=\beta$ 的一个特解。故 $Ax=\beta$ 的通解为 $x=\begin{pmatrix}1\\1\\1\end{pmatrix}+k\begin{pmatrix}1\\2\\-1\end{pmatrix}$，其中 $k$ 为任意常数。」
- **结论**：答案 $r(A)=2$；$Ax=\beta$ 的通解 $x=\begin{pmatrix}1\\1\\1\end{pmatrix}+k\begin{pmatrix}1\\2\\-1\end{pmatrix}$（$k$ 任意常数）（kind=`solution`，锚点 `x=(1,1,1)^{\mathrm T}+k(1,2,-1)^{\mathrm T}`）；三源一致性 = all（题面 真题册 p23 + 解析册 p5 亲读 + 独立复算）；
  - 独立复算：独立复算同值：$\alpha_3=\alpha_1+2\alpha_2\Rightarrow A(1,2,-1)^{\mathrm T}=0$；$\beta=A(1,1,1)^{\mathrm T}$ 特解 ✓；$3-r(A)=1$ 个自由参数 ✓。
- **置信度**：high；

### m3-2017-21 ｜ 三(21) ｜ 解答

- **材料**：2017 年数学三真题答案解析册（`参考文件/真题/数学/6、【1987-2025年】考研数学三真题答案及解析/2017年数学三真题答案解析.pdf`），题面见真题册 PDF p24；
- **页码**：解析册 PDF p6（整页）；
- **生成命令**：`参考文件/_venv/Scripts/python.exe tools/refs-vision.py --pdf "参考文件/真题/数学/6、【1987-2025年】考研数学三真题答案及解析/2017年数学三真题答案解析.pdf" --page 6 --dpi 130 --out "backup/scratch/refs-math3-ans/crops/2017_ans_p6.png"`
- **裁片**：`backup/scratch/refs-math3-ans/crops/2017_ans_p6.png`（932×1331 px / 131954 B / sha256 `506ec81569d48c58004981ca7b0a72030694f13190528b5bdc238a744ed52899`）
- **亲读原文**：「(21) 解 二次型 $f$ 的矩阵为 $A=\begin{pmatrix}2&1&-4\\1&-1&1\\-4&1&a\end{pmatrix}$。由题设知 $|A|=0$，又 $|A|=6-3a$，于是 $a=2$。矩阵 $A$ 的特征多项式为 $|\lambda E-A|=\lambda(\lambda+3)(\lambda-6)$，所以特征值为 $-3,6,0$。矩阵 $A$ 属于特征值 $\lambda_1=-3$ 的单位特征向量为 $\beta_1=\frac1{\sqrt3}(1,-1,1)^{\mathrm T}$；属于特征值 $\lambda_2=6$ 的单位特征向量为 $\beta_2=\frac1{\sqrt2}(-1,0,1)^{\mathrm T}$；属于特征值 $\lambda_3=0$ 的单位特征向量为 $\beta_3=\frac1{\sqrt6}(1,2,1)^{\mathrm T}$。故所求的一个正交矩阵为 $Q=(\beta_1,\beta_2,\beta_3)$。」
- **结论**：答案 $a=2$；特征值 $-3,6,0$；正交矩阵 $Q=(\beta_1,\beta_2,\beta_3)=\begin{pmatrix}\frac1{\sqrt3}&-\frac1{\sqrt2}&\frac1{\sqrt6}\\-\frac1{\sqrt3}&0&\frac2{\sqrt6}\\\frac1{\sqrt3}&\frac1{\sqrt2}&\frac1{\sqrt6}\end{pmatrix}$（kind=`solution`，锚点 `Q=(\beta_1,\beta_2,\beta_3)`）；三源一致性 = all（题面 真题册 p24 + 解析册 p6 亲读 + 独立复算）；
  - 独立复算：独立复算同值：$|A|=6-3a=0\Rightarrow a=2$；$\lambda(\lambda+3)(\lambda-6)$ 给出 $-3,6,0$；三个单位特征向量两两正交（如 $\beta_1\cdot\beta_3=(1-2+1)/\sqrt{18}=0$）✓。
- **置信度**：high；

### m3-2017-22 ｜ 三(22) ｜ 解答

- **材料**：2017 年数学三真题答案解析册（`参考文件/真题/数学/6、【1987-2025年】考研数学三真题答案及解析/2017年数学三真题答案解析.pdf`），题面见真题册 PDF p24；
- **页码**：解析册 PDF p6（整页）；
- **生成命令**：`参考文件/_venv/Scripts/python.exe tools/refs-vision.py --pdf "参考文件/真题/数学/6、【1987-2025年】考研数学三真题答案及解析/2017年数学三真题答案解析.pdf" --page 6 --dpi 130 --out "backup/scratch/refs-math3-ans/crops/2017_ans_p6.png"`
- **裁片**：`backup/scratch/refs-math3-ans/crops/2017_ans_p6.png`（932×1331 px / 131954 B / sha256 `506ec81569d48c58004981ca7b0a72030694f13190528b5bdc238a744ed52899`）
  - 续页补渲：`backup/scratch/refs-math3-ans/crops/2017_ans_p7.png`（932×1331 px / 122122 B / sha256 `dfe5f00db844c1d04c4a0c1e5b3f55b2fd2217cc64c09ae7a1f3bbca9af6bd19`）
- **亲读原文**：「(22) 解 （Ⅰ）$EY=\int_{-\infty}^{+\infty}yf(y)\mathrm dy=\int_0^1y\cdot2y\mathrm dy=\frac23$，$P\{Y\le EY\}=P\{Y\le\frac23\}=\int_0^{\frac23}2y\mathrm dy=\frac49$。（Ⅱ）$Z$ 的分布函数记为 $F_Z(z)$，那么 $F_Z(z)=P\{Z\le z\}=P\{X+Y\le z\}=P\{X=0\}P\{X+Y\le z|X=0\}+P\{X=2\}P\{X+Y\le z|X=2\}=\frac12P\{Y\le z\}+\frac12P\{Y\le z-2\}$… 所以 $Z$ 的概率密度为 $f_Z(z)=\begin{cases}z,&0<z<1,\\z-2,&2<z<3,\\0,&其他.\end{cases}$」
- **结论**：答案 （Ⅰ）$EY=\dfrac23$，$P\{Y\le EY\}=\dfrac49$；（Ⅱ）$f_Z(z)=\begin{cases}z,&0<z<1\\z-2,&2<z<3\\0,&其他\end{cases}$（kind=`solution`，锚点 `f_Z(z)=\begin{cases}z,&0<z<1\\z-2,&2<z<3\\0,&其他\end{cases}`）；三源一致性 = all（题面 真题册 p24 + 解析册 p6 亲读 + 独立复算）；
  - 独立复算：独立复算同值：$Y\sim f_Y=2y\,(0<y<1)$ ⇒ $EY=\frac23$、$P\{Y\le\frac23\}=\frac49$ ✓；$X=0,2$ 各 $\frac12$ ⇒ $F_Z=\frac12F_Y(z)+\frac12F_Y(z-2)$ ⇒ $f_Z=z\ (0<z<1)$、$z-2\ (2<z<3)$ ✓。
- **置信度**：high；

### m3-2017-23 ｜ 三(23) ｜ 解答

- **材料**：2017 年数学三真题答案解析册（`参考文件/真题/数学/6、【1987-2025年】考研数学三真题答案及解析/2017年数学三真题答案解析.pdf`），题面见真题册 PDF p24；
- **页码**：解析册 PDF p7（整页）；
- **生成命令**：`参考文件/_venv/Scripts/python.exe tools/refs-vision.py --pdf "参考文件/真题/数学/6、【1987-2025年】考研数学三真题答案及解析/2017年数学三真题答案解析.pdf" --page 7 --dpi 130 --out "backup/scratch/refs-math3-ans/crops/2017_ans_p7.png"`
- **裁片**：`backup/scratch/refs-math3-ans/crops/2017_ans_p7.png`（932×1331 px / 122122 B / sha256 `dfe5f00db844c1d04c4a0c1e5b3f55b2fd2217cc64c09ae7a1f3bbca9af6bd19`）
- **亲读原文**：「(23) 解 （Ⅰ）$Z_1$ 的分布函数为 $F(z)=P\{Z_1\le z\}=P\{|X_1-\mu|\le z\}=\begin{cases}2\Phi\left(\frac z\sigma\right)-1,&z\ge0,\\0,&z<0,\end{cases}$ 所以 $Z_1$ 的概率密度为 $f(z)=\begin{cases}\frac2{\sqrt{2\pi}\sigma}e^{-\frac{z^2}{2\sigma^2}},&z\ge0,\\0,&z<0.\end{cases}$（Ⅱ）$EZ_1=\int_{-\infty}^{+\infty}zf(z)\mathrm dz=\frac2{\sqrt{2\pi}\sigma}\int_0^{+\infty}ze^{-\frac{z^2}{2\sigma^2}}\mathrm dz=\frac2{\sqrt{2\pi}}\sigma$。$\sigma=\frac{\sqrt{2\pi}}2EZ_1$，令 $\bar Z=\frac1n\sum_{i=1}^nZ_i$，得 $\sigma$ 的矩估计量为 $\hat\sigma=\frac{\sqrt{2\pi}}2\bar Z$。（Ⅲ）记 $z_1,z_2,\cdots,z_n$ 为样本的观测值，则似然函数为 $L(\sigma)=\prod_{i=1}^nf(z_i)=\left(\frac2{\sqrt{2\pi}}\right)^n\sigma^{-n}e^{-\frac1{2\sigma^2}\sum z_i^2}$，对数似然函数为 $\ln L(\sigma)=n\ln\frac2{\sqrt{2\pi}}-n\ln\sigma-\frac1{2\sigma^2}\sum_{i=1}^nz_i^2$。令 $\frac{\mathrm d\ln L(\sigma)}{\mathrm d\sigma}=-\frac n\sigma+\frac1{\sigma^3}\sum_{i=1}^nz_i^2=0$，得 $\sigma$ 的最大似然估计值为 $\hat\sigma=\sqrt{\frac1n\sum_{i=1}^nz_i^2}$，所以 $\sigma$ 的最大似然估计量为 $\hat\sigma=\sqrt{\frac1n\sum_{i=1}^nZ_i^2}$。」
- **结论**：答案 （Ⅰ）$f(z)=\begin{cases}\frac{2}{\sqrt{2\pi}\sigma}e^{-\frac{z^2}{2\sigma^2}},&z\ge0\\0,&z<0\end{cases}$；（Ⅱ）矩估计 $\hat\sigma=\frac{\sqrt{2\pi}}2\bar Z$；（Ⅲ）最大似然估计 $\hat\sigma=\sqrt{\frac1n\sum_{i=1}^nZ_i^2}$（kind=`solution`，锚点 `\hat\sigma=\sqrt{\dfrac1n\sum_{i=1}^nZ_i^2}`）；三源一致性 = all（题面 真题册 p24 + 解析册 p7 亲读 + 独立复算）；
  - 独立复算：独立复算同值：$|X-\mu|$ 的密度为半正态 $\frac{2}{\sqrt{2\pi}\sigma}e^{-z^2/(2\sigma^2)}$；$EZ_1=\sqrt{\frac2\pi}\sigma$ ⇒ $\hat\sigma=\frac{\sqrt{2\pi}}2\bar Z$（$\sqrt{\pi/2}=\sqrt{2\pi}/2$）；MLE 由 $-n/\sigma+\sigma^{-3}\sum z_i^2=0$ 得 $\hat\sigma=\sqrt{\frac1n\sum z_i^2}$ ✓。
- **置信度**：high；

### m3-2018-13 ｜ 二(13) ｜ 填空

- **材料**：2018 年数学三真题答案解析册（`参考文件/真题/数学/6、【1987-2025年】考研数学三真题答案及解析/2018年数学三真题答案解析.pdf`），题面见真题册 PDF p18；
- **页码**：解析册 PDF p3（整页）；
- **生成命令**：`参考文件/_venv/Scripts/python.exe tools/refs-vision.py --pdf "参考文件/真题/数学/6、【1987-2025年】考研数学三真题答案及解析/2018年数学三真题答案解析.pdf" --page 3 --dpi 130 --out "backup/scratch/refs-math3-ans/crops/2018_ans_p3.png"`
- **裁片**：`backup/scratch/refs-math3-ans/crops/2018_ans_p3.png`（932×1331 px / 123601 B / sha256 `9e74778cac4c3fbaa2a664c003305bb45aa6bd68eeefa3831d1543afd5e3a914`）
- **亲读原文**：「(13) 2 解 由题意得 $A(\alpha_1,\alpha_2,\alpha_3)=(\alpha_1,\alpha_2,\alpha_3)\begin{pmatrix}1&0&1\\1&1&0\\0&1&1\end{pmatrix}$，而 $\alpha_1,\alpha_2,\alpha_3$ 线性无关，则 $|(\alpha_1,\alpha_2,\alpha_3)|\ne0$。则 $|A|=\begin{vmatrix}1&0&1\\1&1&0\\0&1&1\end{vmatrix}=2$。故应填 2。」
- **结论**：答案 $2$（kind=`fill`，锚点 `2`）；三源一致性 = all（题面 真题册 p18 + 解析册 p3 亲读 + 独立复算）；
  - 独立复算：独立复算同值：$AP=PM$ 且 $P$ 可逆 ⇒ $|A|=|M|=1(1−0)−0+1(1−0)=2$ ✓。
- **置信度**：high；

### m3-2018-14 ｜ 二(14) ｜ 填空

- **材料**：2018 年数学三真题答案解析册（`参考文件/真题/数学/6、【1987-2025年】考研数学三真题答案及解析/2018年数学三真题答案解析.pdf`），题面见真题册 PDF p18；
- **页码**：解析册 PDF p3（整页）；
- **生成命令**：`参考文件/_venv/Scripts/python.exe tools/refs-vision.py --pdf "参考文件/真题/数学/6、【1987-2025年】考研数学三真题答案及解析/2018年数学三真题答案解析.pdf" --page 3 --dpi 130 --out "backup/scratch/refs-math3-ans/crops/2018_ans_p3.png"`
- **裁片**：`backup/scratch/refs-math3-ans/crops/2018_ans_p3.png`（932×1331 px / 123601 B / sha256 `9e74778cac4c3fbaa2a664c003305bb45aa6bd68eeefa3831d1543afd5e3a914`）
- **亲读原文**：「(14) $\frac13$ 解 $P(AC|A\cup B)=\frac{P(AC\cap(A\cup B))}{P(A\cup B)}=\frac{P(AC\cup ABC)}{P(A)+P(B)-P(AB)}=\frac{P(AC)}{P(A)+P(B)-P(AB)}=\frac13$。故应填 $\frac13$。」
- **结论**：答案 $\dfrac13$（kind=`fill`，锚点 `\dfrac13`）；三源一致性 = all（题面 真题册 p18 + 解析册 p3 亲读 + 独立复算）；
  - 独立复算：独立复算同值：$P(AC)=\frac14$，$P(A\cup B)=1-\frac14=\frac34$ ⇒ 条件概率 $=\frac{1/4}{3/4}=\frac13$ ✓。
- **置信度**：high；

### m3-2018-15 ｜ 三(15) ｜ 解答

- **材料**：2018 年数学三真题答案解析册（`参考文件/真题/数学/6、【1987-2025年】考研数学三真题答案及解析/2018年数学三真题答案解析.pdf`），题面见真题册 PDF p18；
- **页码**：解析册 PDF p3（整页）；
- **生成命令**：`参考文件/_venv/Scripts/python.exe tools/refs-vision.py --pdf "参考文件/真题/数学/6、【1987-2025年】考研数学三真题答案及解析/2018年数学三真题答案解析.pdf" --page 3 --dpi 130 --out "backup/scratch/refs-math3-ans/crops/2018_ans_p3.png"`
- **裁片**：`backup/scratch/refs-math3-ans/crops/2018_ans_p3.png`（932×1331 px / 123601 B / sha256 `9e74778cac4c3fbaa2a664c003305bb45aa6bd68eeefa3831d1543afd5e3a914`）
  - 题面核对裁片：`backup/scratch/refs-math3-ans/crops/zhen2018_p18_full110.png`（910×1287 px / 105726 B / sha256 `3c17d3fa2982f8bf891f9018070f4af50c7d758c51299922ca9ec5e8f117430f`）
- **亲读原文**：「(15) 解 令 $t=\frac1x$，则 $\lim_{x\to+\infty}[(ax+b)e^{\frac1x}-x]=\lim_{t\to0^+}\frac{(a+bt)e^t-1}{t}$。由题设及 $\lim_{t\to0^+}[(a+bt)e^t-1]=a-1$ 可得 $a-1=0$，即 $a=1$。又因为 $\lim_{t\to0^+}\frac{(a+bt)e^t-1}{t}=\lim_{t\to0^+}\frac{(1+bt)e^t-1}{t}=\lim_{t\to0^+}\left(be^t+\frac{e^t-1}{t}\right)=b+1$，从而由题设得 $b=1$。」
  - 题面亲读：「（15）（本题满分 10 分）已知实数 $a,b$ 满足 $\lim_{x\to+\infty}[(ax+b)e^{\frac1x}-x]=2$，求 $a,b$。（真题册 PDF p18 裁片亲读，910×1287 / 105726 B / sha256 3c17d3fa2982f8bf891f9018070f4af50c7d758c51299922ca9ec5e8f117430f）」
- **结论**：答案 $a=1,\ b=1$（kind=`solution`，锚点 `a=1,\ b=1`）；三源一致性 = all（题面 真题册 p18 + 解析册 p3 亲读 + 独立复算）；
  - 独立复算：独立复算同值：题面极限为 2；分子极限须为 0 ⇒ $a=1$；$(1+bt)e^t-1=(b+1)t+o(t)$ ⇒ $b+1=2$ ⇒ $b=1$ ✓。
- **置信度**：high；

### m3-2018-16 ｜ 三(16) ｜ 解答

- **材料**：2018 年数学三真题答案解析册（`参考文件/真题/数学/6、【1987-2025年】考研数学三真题答案及解析/2018年数学三真题答案解析.pdf`），题面见真题册 PDF p18；
- **页码**：解析册 PDF p3（整页）；
- **生成命令**：`参考文件/_venv/Scripts/python.exe tools/refs-vision.py --pdf "参考文件/真题/数学/6、【1987-2025年】考研数学三真题答案及解析/2018年数学三真题答案解析.pdf" --page 3 --dpi 130 --out "backup/scratch/refs-math3-ans/crops/2018_ans_p3.png"`
- **裁片**：`backup/scratch/refs-math3-ans/crops/2018_ans_p3.png`（932×1331 px / 123601 B / sha256 `9e74778cac4c3fbaa2a664c003305bb45aa6bd68eeefa3831d1543afd5e3a914`）
  - 续页补渲：`backup/scratch/refs-math3-ans/crops/2018_ans_p4.png`（932×1331 px / 147668 B / sha256 `01c40450c93840a533b8b81018dc11a12aa9b93d8f36d4cddd157b646f74c7fd`）
- **亲读原文**：「(16) 解 $\iint_Dx^2\mathrm dx\mathrm dy=\int_0^{\frac1{\sqrt2}}\mathrm dx\int_{\sqrt3x}^{\sqrt{3(1-x^2)}}x^2\mathrm dy=\sqrt3\int_0^{\frac1{\sqrt2}}x^2(\sqrt{1-x^2}-x)\mathrm dx=\sqrt3\int_0^{\frac1{\sqrt2}}x^2\sqrt{1-x^2}\mathrm dx-\sqrt3\int_0^{\frac1{\sqrt2}}x^3\mathrm dx$。令 $x=\sin t$，则 $\int_0^{\frac1{\sqrt2}}x^2\sqrt{1-x^2}\mathrm dx=\int_0^{\frac\pi4}\sin^2t\cos^2t\,\mathrm dt=\frac18\int_0^{\frac\pi4}(1-\cos4t)\mathrm dt=\frac{\pi}{32}$，又 $\int_0^{\frac1{\sqrt2}}x^3\mathrm dx=\frac1{16}$，所以 $\iint_Dx^2\mathrm dx\mathrm dy=\frac{\sqrt3}{16}\left(\frac\pi2-1\right)$。」
- **结论**：答案 $\dfrac{\sqrt3}{16}\left(\dfrac{\pi}{2}-1\right)$（kind=`solution`，锚点 `\dfrac{\sqrt3}{16}\left(\dfrac{\pi}{2}-1\right)`）；三源一致性 = all（题面 真题册 p18 + 解析册 p3 亲读 + 独立复算）；
  - 独立复算：独立复算同值：$\sqrt3(\frac\pi{32}-\frac1{16})=\frac{\sqrt3}{16}(\frac\pi2-1)$ ✓。
- **置信度**：high；

### m3-2018-17 ｜ 三(17) ｜ 解答

- **材料**：2018 年数学三真题答案解析册（`参考文件/真题/数学/6、【1987-2025年】考研数学三真题答案及解析/2018年数学三真题答案解析.pdf`），题面见真题册 PDF p19；
- **页码**：解析册 PDF p4（整页）；
- **生成命令**：`参考文件/_venv/Scripts/python.exe tools/refs-vision.py --pdf "参考文件/真题/数学/6、【1987-2025年】考研数学三真题答案及解析/2018年数学三真题答案解析.pdf" --page 4 --dpi 130 --out "backup/scratch/refs-math3-ans/crops/2018_ans_p4.png"`
- **裁片**：`backup/scratch/refs-math3-ans/crops/2018_ans_p4.png`（932×1331 px / 147668 B / sha256 `01c40450c93840a533b8b81018dc11a12aa9b93d8f36d4cddd157b646f74c7fd`）
- **亲读原文**：「(17) 解 设圆的半径为 $x$，正方形与正三角形的边长分别为 $y$ 和 $z$，则问题化为：函数 $f(x,y,z)=\pi x^2+y^2+\frac{\sqrt3}4z^2$ 在条件 $2\pi x+4y+3z=2\ (x>0,y>0,z>0)$ 下是否存在最小值。令 $L(x,y,z,\lambda)=\pi x^2+y^2+\frac{\sqrt3}4z^2+\lambda(2\pi x+4y+3z-2)$，考虑方程组 $\frac{\partial L}{\partial x}=2\pi x+2\pi\lambda=0,\frac{\partial L}{\partial y}=2y+4\lambda=0,\frac{\partial L}{\partial z}=\frac{\sqrt3}2z+3\lambda=0,\frac{\partial L}{\partial\lambda}=2\pi x+4y+3z-2=0$。解得 $x_0=\frac1{\pi+4+3\sqrt3},y_0=\frac2{\pi+4+3\sqrt3},z_0=\frac{2\sqrt3}{\pi+4+3\sqrt3}$。$f(x_0,y_0,z_0)=\frac1{\pi+4+3\sqrt3}$…所以三个图形的面积之和存在最小值，最小值为 $f(x_0,y_0,z_0)=\frac1{\pi+4+3\sqrt3}$（单位：$\mathrm m^2$）。」
- **结论**：答案 $x_0=\dfrac1{\pi+4+3\sqrt3}$，$y_0=\dfrac2{\pi+4+3\sqrt3}$，$z_0=\dfrac{2\sqrt3}{\pi+4+3\sqrt3}$；最小值 $\dfrac1{\pi+4+3\sqrt3}$（kind=`solution`，锚点 `\dfrac1{\pi+4+3\sqrt3}`）；三源一致性 = all（题面 真题册 p19 + 解析册 p4 亲读 + 独立复算）；
  - 独立复算：独立复算同值：$\lambda=-x,y=2x,z=2\sqrt3x$；约束给出 $x(\pi+4+3\sqrt3)=1$；最小值 $\pi x^2+y^2+\frac{\sqrt3}4z^2=x^2(\pi+4+3\sqrt3)=\frac1{\pi+4+3\sqrt3}$ ✓。
- **置信度**：high；

### m3-2018-18 ｜ 三(18) ｜ 解答

- **材料**：2018 年数学三真题答案解析册（`参考文件/真题/数学/6、【1987-2025年】考研数学三真题答案及解析/2018年数学三真题答案解析.pdf`），题面见真题册 PDF p19；
- **页码**：解析册 PDF p4（整页）；
- **生成命令**：`参考文件/_venv/Scripts/python.exe tools/refs-vision.py --pdf "参考文件/真题/数学/6、【1987-2025年】考研数学三真题答案及解析/2018年数学三真题答案解析.pdf" --page 4 --dpi 130 --out "backup/scratch/refs-math3-ans/crops/2018_ans_p4.png"`
- **裁片**：`backup/scratch/refs-math3-ans/crops/2018_ans_p4.png`（932×1331 px / 147668 B / sha256 `01c40450c93840a533b8b81018dc11a12aa9b93d8f36d4cddd157b646f74c7fd`）
  - 续页补渲：`backup/scratch/refs-math3-ans/crops/2018_ans_p5.png`（932×1331 px / 172473 B / sha256 `ab43be277e3bed86f2dd3e7a222a24a7c5a39f6f6ed934470f62013777b7e03e`）
- **亲读原文**：「(18) 解 因为 $\cos2x=\sum_{n=0}^{\infty}\frac{(-1)^n(2x)^{2n}}{(2n)!}=\sum_{n=0}^{\infty}\frac{(-1)^n4^nx^{2n}}{(2n)!},x\in(-\infty,+\infty)$，$\frac1{(1+x)^2}=\left(-\frac1{1+x}\right)'=-\left(\sum_{n=0}^{\infty}(-1)^nx^n\right)'=-\sum_{n=1}^{\infty}(-1)^nnx^{n-1}=-\sum_{n=0}^{\infty}(-1)^{n+1}(n+1)x^n,-1<x<1$，所以 $\cos2x-\frac1{(1+x)^2}=\sum_{n=0}^{\infty}\frac{(-1)^n4^nx^{2n}}{(2n)!}+\sum_{n=0}^{\infty}(-1)^{n+1}(n+1)x^n,-1<x<1$。由题设知 $\sum_{n=0}^{\infty}a_nx^n=\sum_{n=0}^{\infty}\frac{(-1)^n4^nx^{2n}}{(2n)!}+\sum_{n=0}^{\infty}(-1)^{n+1}(n+1)x^n(-1<x<1)$。故 $\begin{cases}a_{2n}=\frac{(-1)^n4^n}{(2n)!}-2n-1,\\a_{2n+1}=2n+2,\end{cases}(n=0,1,2,\cdots)$。」
- **结论**：答案 $a_{2n}=\dfrac{(-1)^n4^n}{(2n)!}-2n-1$，$a_{2n+1}=2n+2$（$n=0,1,2,\cdots$）（kind=`solution`，锚点 `a_{2n}=\dfrac{(-1)^n4^n}{(2n)!}-2n-1`）；三源一致性 = all（题面 真题册 p19 + 解析册 p4 亲读 + 独立复算）；
  - 独立复算：独立复算同值：偶次幂系数取 $\frac{(-1)^n4^n}{(2n)!}$ 与 $-(2n+1)$ 之和；奇次幂系数仅来自 $-\sum(-1)^{n+1}(n+1)x^n$，即 $2n+2$ ✓。
- **置信度**：high；

### m3-2018-19 ｜ 三(19) ｜ 解答

- **材料**：2018 年数学三真题答案解析册（`参考文件/真题/数学/6、【1987-2025年】考研数学三真题答案及解析/2018年数学三真题答案解析.pdf`），题面见真题册 PDF p19；
- **页码**：解析册 PDF p5（整页）；
- **生成命令**：`参考文件/_venv/Scripts/python.exe tools/refs-vision.py --pdf "参考文件/真题/数学/6、【1987-2025年】考研数学三真题答案及解析/2018年数学三真题答案解析.pdf" --page 5 --dpi 130 --out "backup/scratch/refs-math3-ans/crops/2018_ans_p5.png"`
- **裁片**：`backup/scratch/refs-math3-ans/crops/2018_ans_p5.png`（932×1331 px / 172473 B / sha256 `ab43be277e3bed86f2dd3e7a222a24a7c5a39f6f6ed934470f62013777b7e03e`）
- **亲读原文**：「(19) 解 由于 $x_1\ne0$，所以 $e^{x_2}=\frac{e^{x_1}-1}{x_1}$。根据微分中值定理，存在 $\xi\in(0,x_1)$，使得 $\frac{e^{x_1}-1}{x_1}=e^\xi$。所以 $e^{x_2}=e^\xi$，故 $0<x_2<x_1$。假设 $0<x_{n+1}<x_n$，则 $e^{x_{n+2}}=\frac{e^{x_{n+1}}-1}{x_{n+1}}=e^\eta(0<\eta<x_{n+1})$，所以 $0<x_{n+2}<x_{n+1}$。故 $\{x_n\}$ 是单调减少的数列，且有下界，从而 $\{x_n\}$ 收敛。设 $\lim_{n\to\infty}x_n=a$，得 $ae^a=e^a-1$。易知 $a=0$ 为其解。令 $f(x)=xe^x-e^x+1$，则 $f'(x)=xe^x$。当 $x>0$ 时，$f'(x)>0$，函数 $f(x)$ 在 $[0,+\infty)$ 上单调增加，所以 $a=0$ 是方程 $ae^a=e^a-1$ 在 $[0,+\infty)$ 上的唯一的解，故 $\lim_{n\to\infty}x_n=0$。」
- **结论**：答案 证明 $\{x_n\}$ 单调减少且有下界，从而 $\lim\limits_{n\to\infty}x_n=0$（kind=`solution`，锚点 `\lim_{n\to\infty}x_n=0`）；三源一致性 = all（题面 真题册 p19 + 解析册 p5 亲读 + 独立复算）；
  - 独立复算：独立复算同结论：由中值定理 $x_{n+1}\in(0,x_n)$ ⇒ 单调减且有下界 0 ⇒ 收敛；极限方程 $ae^a=e^a−1$ 在 $[0,\infty)$ 上唯一解 $a=0$ ⇒ $\lim x_n=0$ ✓。
- **置信度**：high；

### m3-2018-20 ｜ 三(20) ｜ 解答

- **材料**：2018 年数学三真题答案解析册（`参考文件/真题/数学/6、【1987-2025年】考研数学三真题答案及解析/2018年数学三真题答案解析.pdf`），题面见真题册 PDF p19；
- **页码**：解析册 PDF p5（整页）；
- **生成命令**：`参考文件/_venv/Scripts/python.exe tools/refs-vision.py --pdf "参考文件/真题/数学/6、【1987-2025年】考研数学三真题答案及解析/2018年数学三真题答案解析.pdf" --page 5 --dpi 130 --out "backup/scratch/refs-math3-ans/crops/2018_ans_p5.png"`
- **裁片**：`backup/scratch/refs-math3-ans/crops/2018_ans_p5.png`（932×1331 px / 172473 B / sha256 `ab43be277e3bed86f2dd3e7a222a24a7c5a39f6f6ed934470f62013777b7e03e`）
  - 续页补渲：`backup/scratch/refs-math3-ans/crops/2018_ans_p6.png`（932×1331 px / 161284 B / sha256 `86e54e37c276285e31a236d1195910de014609cb28837f824df90e10bd8eff33`）
- **亲读原文**：「(20) 解 （Ⅰ）$f(x_1,x_2,x_3)=0$ 当且仅当 $\begin{cases}x_1-x_2+x_3=0,\\x_2+x_3=0,\\x_1+ax_3=0,\end{cases}$ 对方程组的系数矩阵施以初等变换得 $\begin{pmatrix}1&-1&1\\0&1&1\\1&0&a\end{pmatrix}\to\begin{pmatrix}1&0&2\\0&1&1\\0&0&a-2\end{pmatrix}$。当 $a\ne2$ 时，方程组只有零解，故 $f(x_1,x_2,x_3)=0$ 的解为 $x=0$；当 $a=2$ 时，方程组有无穷多解，通解为 $x=k\begin{pmatrix}-2\\-1\\1\end{pmatrix}$，$k$ 为任意常数…（Ⅱ）由（Ⅰ）知，当 $a\ne2$ 时，$f(x_1,x_2,x_3)$ 正定，$f$ 的规范形为 $y_1^2+y_2^2+y_3^2$；当 $a=2$ 时，$f(x_1,x_2,x_3)=2x_1^2+2x_2^2+6x_3^2-2x_1x_2+6x_1x_3=2\left(x_1-\frac12x_2+\frac32x_3\right)^2+\frac32(x_2+x_3)^2$，所以 $f$ 的规范形为 $y_1^2+y_2^2$。」
- **结论**：答案 $a\ne2$ 时 $f=0$ 只有零解 $x=0$，$f$ 正定，规范形 $y_1^2+y_2^2+y_3^2$；$a=2$ 时通解 $x=k(-2,-1,1)^{\mathrm T}$，规范形 $y_1^2+y_2^2$（kind=`solution`，锚点 `y_1^2+y_2^2+y_3^2`）；三源一致性 = all（题面 真题册 p19 + 解析册 p5 亲读 + 独立复算）；
  - 独立复算：独立复算同值：系数矩阵化为 $\begin{pmatrix}1&0&2\\0&1&1\\0&0&a-2\end{pmatrix}$ ⇒ $a\ne2$ 时只有零解且正定；$a=2$ 时配方给出 $2(\cdot)^2+\frac32(\cdot)^2$（秩 2、正惯性指数 2）⇒ 规范形 $y_1^2+y_2^2$ ✓。
- **置信度**：high；

### m3-2018-21 ｜ 三(21) ｜ 解答

- **材料**：2018 年数学三真题答案解析册（`参考文件/真题/数学/6、【1987-2025年】考研数学三真题答案及解析/2018年数学三真题答案解析.pdf`），题面见真题册 PDF p20；
- **页码**：解析册 PDF p6（整页）；
- **生成命令**：`参考文件/_venv/Scripts/python.exe tools/refs-vision.py --pdf "参考文件/真题/数学/6、【1987-2025年】考研数学三真题答案及解析/2018年数学三真题答案解析.pdf" --page 6 --dpi 130 --out "backup/scratch/refs-math3-ans/crops/2018_ans_p6.png"`
- **裁片**：`backup/scratch/refs-math3-ans/crops/2018_ans_p6.png`（932×1331 px / 161284 B / sha256 `86e54e37c276285e31a236d1195910de014609cb28837f824df90e10bd8eff33`）
- **亲读原文**：「(21) 解 （Ⅰ）对矩阵 $A,B$ 分别施以初等行变换得 $A=\begin{pmatrix}1&2&a\\1&3&0\\2&7&-a\end{pmatrix}\to\begin{pmatrix}1&0&3a\\0&1&-a\\0&0&0\end{pmatrix}$，$B=\begin{pmatrix}1&a&2\\0&1&1\\-1&1&1\end{pmatrix}\to\begin{pmatrix}1&0&0\\0&1&1\\0&0&2-a\end{pmatrix}$。由题设知 $a=2$。（Ⅱ）由（Ⅰ）知 $a=2$，对矩阵 $(A\vdots B)$ 施以初等行变换 $(A\vdots B)=\begin{pmatrix}1&2&2&\vdots&1&2&2\\1&3&0&\vdots&0&1&1\\2&7&-2&\vdots&-1&1&1\end{pmatrix}\to\begin{pmatrix}1&0&6&\vdots&3&4&4\\0&1&-2&\vdots&-1&-1&-1\\0&0&0&\vdots&0&0&0\end{pmatrix}$…故 $AX=B$ 的解为 $X=\begin{pmatrix}3-6k_1&4-6k_2&4-6k_3\\-1+2k_1&-1+2k_2&-1+2k_3\\k_1&k_2&k_3\end{pmatrix}$，其中 $k_1,k_2,k_3$ 为任意常数。由于 $|X|=k_3-k_2$，所以满足 $AP=B$ 的可逆矩阵为 $P$（同 $X$，其中 $k_2\ne k_3$）。」
- **结论**：答案 $a=2$；$X=\begin{pmatrix}3-6k_1&4-6k_2&4-6k_3\\-1+2k_1&-1+2k_2&-1+2k_3\\k_1&k_2&k_3\end{pmatrix}$；满足 $AP=B$ 的可逆矩阵 $P$ 需 $k_2\ne k_3$（$|X|=k_3-k_2$）（kind=`solution`，锚点 `|X|=k_3-k_2`）；三源一致性 = all（题面 真题册 p20 + 解析册 p6 亲读 + 独立复算）；
  - 独立复算：独立复算同值：$A$ 与 $B$ 秩条件给出 $a=2$；行最简形特解 $(3,4,4;−1,−1,−1)^T$ 加零空间 $(6,−2,1)^T$ 组合；可逆性等价于 $k_3−k_2\ne0$ ✓。
- **置信度**：high；

### m3-2018-22 ｜ 三(22) ｜ 解答

- **材料**：2018 年数学三真题答案解析册（`参考文件/真题/数学/6、【1987-2025年】考研数学三真题答案及解析/2018年数学三真题答案解析.pdf`），题面见真题册 PDF p20；
- **页码**：解析册 PDF p6（整页）；
- **生成命令**：`参考文件/_venv/Scripts/python.exe tools/refs-vision.py --pdf "参考文件/真题/数学/6、【1987-2025年】考研数学三真题答案及解析/2018年数学三真题答案解析.pdf" --page 6 --dpi 130 --out "backup/scratch/refs-math3-ans/crops/2018_ans_p6.png"`
- **裁片**：`backup/scratch/refs-math3-ans/crops/2018_ans_p6.png`（932×1331 px / 161284 B / sha256 `86e54e37c276285e31a236d1195910de014609cb28837f824df90e10bd8eff33`）
- **亲读原文**：「(22) 解 （Ⅰ）由题设可得 $EX=(-1)\cdot\frac12+1\cdot\frac12=0$，$E(XZ)=E(X^2Y)=EX^2\cdot EY=\lambda$。所以 $\mathrm{Cov}(X,Z)=E(XZ)-EX\cdot EZ=\lambda$。（Ⅱ）$Z$ 的所有可能取值为全体整数值，且 $P\{Z=0\}=P\{Y=0\}=e^{-\lambda}$；对于 $n=\pm1,\pm2,\cdots$，有 $P\{Z=n\}=P\{XY=n\}=P\left\{X=\frac n{|n|},Y=|n|\right\}=P\left\{X=\frac n{|n|}\right\}P\{Y=|n|\}=e^{-\lambda}\frac{\lambda^{|n|}}{2\cdot|n|!}$。」
- **结论**：答案 （Ⅰ）$EX=0$，$\mathrm{Cov}(X,Z)=\lambda$；（Ⅱ）$P\{Z=n\}=\dfrac{e^{-\lambda}\lambda^{|n|}}{2|n|!}$（$n=\pm1,\pm2,\cdots$），$P\{Z=0\}=e^{-\lambda}$（kind=`solution`，锚点 `\mathrm{Cov}(X,Z)=\lambda`）；三源一致性 = all（题面 真题册 p20 + 解析册 p6 亲读 + 独立复算）；
  - 独立复算：独立复算同值：$EX^2=1$，$EY=\lambda$ ⇒ $E(XZ)=\lambda$，$EX=0$ ⇒ $\mathrm{Cov}=\lambda$；$Z=n\ne0$ 唯一实现为 $(X=\pm1,Y=|n|)$，概率 $\frac12\cdot\frac{\lambda^{|n|}e^{-\lambda}}{|n|!}$ ✓。
- **置信度**：high；

### m3-2018-23 ｜ 三(23) ｜ 解答

- **材料**：2018 年数学三真题答案解析册（`参考文件/真题/数学/6、【1987-2025年】考研数学三真题答案及解析/2018年数学三真题答案解析.pdf`），题面见真题册 PDF p20；
- **页码**：解析册 PDF p7（整页）；
- **生成命令**：`参考文件/_venv/Scripts/python.exe tools/refs-vision.py --pdf "参考文件/真题/数学/6、【1987-2025年】考研数学三真题答案及解析/2018年数学三真题答案解析.pdf" --page 7 --dpi 130 --out "backup/scratch/refs-math3-ans/crops/2018_ans_p7.png"`
- **裁片**：`backup/scratch/refs-math3-ans/crops/2018_ans_p7.png`（932×1331 px / 101819 B / sha256 `ab4d789ee988c3b2d7e60da78c154441993381e36f9dc5f25d374aaa16a59376`）
- **亲读原文**：「(23) 解 （Ⅰ）设 $x_1,x_2,\cdots,x_n$ 为样本观测值，似然函数为 $L(\sigma)=\prod_{i=1}^nf(x_i;\sigma)=\frac1{2^n\sigma^n}e^{-\frac1\sigma\sum_{i=1}^n|x_i|}$，则 $\ln L(\sigma)=-n\ln2-n\ln\sigma-\frac1\sigma\sum_{i=1}^n|x_i|$。令 $\frac{\mathrm d\ln L(\sigma)}{\mathrm d\sigma}=-\frac n\sigma+\frac1{\sigma^2}\sum_{i=1}^n|x_i|=0$，解得 $\sigma=\frac1n\sum_{i=1}^n|x_i|$。所以 $\hat\sigma=\frac1n\sum_{i=1}^n|X_i|$。（Ⅱ）由于 $E|X|=\int_{-\infty}^{+\infty}|x|f(x;\sigma)\mathrm dx=\int_{-\infty}^{+\infty}|x|\frac1{2\sigma}e^{-\frac{|x|}{\sigma}}\mathrm dx=\frac1\sigma\int_0^{+\infty}xe^{-\frac x\sigma}\mathrm dx=\sigma$，所以 $E\hat\sigma=\frac1n\sum_{i=1}^nE|X_i|=E|X|=\sigma$。又因为 $E|X|^2=EX^2=\int_{-\infty}^{+\infty}x^2f(x;\sigma)\mathrm dx=\frac1\sigma\int_0^{+\infty}x^2e^{-\frac x\sigma}\mathrm dx=2\sigma^2$，$D(|X|)=E(|X|^2)-(E|X|)^2=\sigma^2$，所以 $D\hat\sigma=\frac1{n^2}\sum_{i=1}^nD(|X_i|)=\frac{D(|X|)}{n}=\frac{\sigma^2}{n}$。」
- **结论**：答案 $\hat\sigma=\dfrac1n\sum\limits_{i=1}^n|X_i|$；$E\hat\sigma=\sigma$，$D\hat\sigma=\dfrac{\sigma^2}{n}$（kind=`solution`，锚点 `\hat\sigma=\dfrac1n\sum_{i=1}^n|X_i|`）；三源一致性 = all（题面 真题册 p20 + 解析册 p7 亲读 + 独立复算）；
  - 独立复算：独立复算同值：$f(x;\sigma)=\frac1{2\sigma}e^{-|x|/\sigma}$，$\ln L$ 求导 ⇒ $\hat\sigma=\frac1n\sum|X_i|$；$E|X|=\sigma$、$E|X|^2=2\sigma^2$ ⇒ $D|X|=\sigma^2$ ⇒ $D\hat\sigma=\sigma^2/n$ ✓。
- **置信度**：high；

### m3-2019-12 ｜ 二(12) ｜ 填空

- **材料**：2019 年数学三真题答案解析册（`参考文件/真题/数学/6、【1987-2025年】考研数学三真题答案及解析/2019年数学三真题答案解析.pdf`），题面见真题册 PDF p14；
- **页码**：解析册 PDF p3（整页）；
- **生成命令**：`参考文件/_venv/Scripts/python.exe tools/refs-vision.py --pdf "参考文件/真题/数学/6、【1987-2025年】考研数学三真题答案及解析/2019年数学三真题答案解析.pdf" --page 3 --dpi 130 --out "backup/scratch/refs-math3-ans/crops/2019_ans_p3.png"`
- **裁片**：`backup/scratch/refs-math3-ans/crops/2019_ans_p3.png`（932×1331 px / 134774 B / sha256 `45b85ccd8ce4578d71806b2b7b73aa2b342b67259bcd194a762c6eb5103e2378`）
- **亲读原文**：「(12) 0.4 解 当 $P_B=20$ 时，$Q_A=500-P_A^2-20P_A+2\cdot20^2=1300-20P_A-P_A^2$，则 $\eta_{AA}=-\frac{P_A}{Q_A}\frac{\mathrm dQ_A}{\mathrm dP_A}=-\frac{P_A}{1300-20P_A-P_A^2}\cdot(-20-2P_A)=\frac{2P_A(P_A+10)}{1300-20P_A-P_A^2}$，所以 $\eta_{AA}\big|_{P_A=10}=0.4$。故应填 0.4。」
- **结论**：答案 $0.4$（kind=`fill`，锚点 `0.4`）；三源一致性 = all（题面 真题册 p14 + 解析册 p3 亲读 + 独立复算）；
  - 独立复算：独立复算同值：$P_A=10$ 时 $Q_A=1300-200-100=1000$，$\eta_{AA}=\frac{2\cdot10\cdot20}{1000}=0.4$ ✓。
- **置信度**：high；

### m3-2019-13 ｜ 二(13) ｜ 填空

- **材料**：2019 年数学三真题答案解析册（`参考文件/真题/数学/6、【1987-2025年】考研数学三真题答案及解析/2019年数学三真题答案解析.pdf`），题面见真题册 PDF p14；
- **页码**：解析册 PDF p3（整页）；
- **生成命令**：`参考文件/_venv/Scripts/python.exe tools/refs-vision.py --pdf "参考文件/真题/数学/6、【1987-2025年】考研数学三真题答案及解析/2019年数学三真题答案解析.pdf" --page 3 --dpi 130 --out "backup/scratch/refs-math3-ans/crops/2019_ans_p3.png"`
- **裁片**：`backup/scratch/refs-math3-ans/crops/2019_ans_p3.png`（932×1331 px / 134774 B / sha256 `45b85ccd8ce4578d71806b2b7b73aa2b342b67259bcd194a762c6eb5103e2378`）
- **亲读原文**：「(13) 1 解 由题意得 $\overline A=\begin{pmatrix}1&0&-1&\vdots&0\\1&1&-1&\vdots&1\\0&1&a^2-1&\vdots&a\end{pmatrix}\to\begin{pmatrix}1&0&-1&\vdots&0\\0&1&0&\vdots&1\\0&1&a^2-1&\vdots&a\end{pmatrix}\to\begin{pmatrix}1&0&-1&\vdots&0\\0&1&0&\vdots&1\\0&0&a^2-1&\vdots&a-1\end{pmatrix}$。要使 $Ax=b$ 有无穷多解，则应使 $r(A)=r(\overline A)<3$，当 $a^2-1=a-1=0$，即 $a=1$ 时，$r(A)=r(\overline A)=2<3$。故应填 1。」
- **结论**：答案 $1$（kind=`fill`，锚点 `1`）；三源一致性 = all（题面 真题册 p14 + 解析册 p3 亲读 + 独立复算）；
  - 独立复算：独立复算同值：无穷多解需 $a^2-1=0$ 且 $a-1=0$ ⇒ $a=1$（$a=-1$ 时增广末行 $a-1=-2\ne0$ 无解）✓。
- **置信度**：high；

### m3-2019-14 ｜ 二(14) ｜ 填空

- **材料**：2019 年数学三真题答案解析册（`参考文件/真题/数学/6、【1987-2025年】考研数学三真题答案及解析/2019年数学三真题答案解析.pdf`），题面见真题册 PDF p14；
- **页码**：解析册 PDF p3（整页）；
- **生成命令**：`参考文件/_venv/Scripts/python.exe tools/refs-vision.py --pdf "参考文件/真题/数学/6、【1987-2025年】考研数学三真题答案及解析/2019年数学三真题答案解析.pdf" --page 3 --dpi 130 --out "backup/scratch/refs-math3-ans/crops/2019_ans_p3.png"`
- **裁片**：`backup/scratch/refs-math3-ans/crops/2019_ans_p3.png`（932×1331 px / 134774 B / sha256 `45b85ccd8ce4578d71806b2b7b73aa2b342b67259bcd194a762c6eb5103e2378`）
- **亲读原文**：「(14) $\frac23$ 解 由随机变量 $X$ 的概率密度 $f(x)=\begin{cases}\frac x2,&0<x<2,\\0,&其他,\end{cases}$ 可知 $X$ 的分布函数 $F(X)=\begin{cases}0,&x<0,\\\frac{x^2}4,&0\le x<2,\\1,&x\ge2,\end{cases}$ $EX=\int_0^2xf(x)\mathrm dx=\int_0^2x\cdot\frac x2\mathrm dx=\frac43$，$P\{F(X)>EX-1\}=P\left\{F(X)>\frac43-1\right\}=P\left\{\frac{X^2}4>\frac13\right\}=P\left\{X>\frac2{\sqrt3}\right\}=\int_{\frac2{\sqrt3}}^2\frac x2\mathrm dx=\frac23$。故应填 $\frac23$。」
- **结论**：答案 $\dfrac23$（kind=`fill`，锚点 `\dfrac23`）；三源一致性 = all（题面 真题册 p14 + 解析册 p3 亲读 + 独立复算）；
  - 独立复算：独立复算同值：$EX=\frac43$，$F(X)=\frac{X^2}4$ ⇒ 阈值 $X>2/\sqrt3$ ⇒ 概率 $\frac14(4-\frac43)=\frac23$ ✓。
- **置信度**：high；

### m3-2019-15 ｜ 三(15) ｜ 解答

- **材料**：2019 年数学三真题答案解析册（`参考文件/真题/数学/6、【1987-2025年】考研数学三真题答案及解析/2019年数学三真题答案解析.pdf`），题面见真题册 PDF p14；
- **页码**：解析册 PDF p3（整页）；
- **生成命令**：`参考文件/_venv/Scripts/python.exe tools/refs-vision.py --pdf "参考文件/真题/数学/6、【1987-2025年】考研数学三真题答案及解析/2019年数学三真题答案解析.pdf" --page 3 --dpi 130 --out "backup/scratch/refs-math3-ans/crops/2019_ans_p3.png"`
- **裁片**：`backup/scratch/refs-math3-ans/crops/2019_ans_p3.png`（932×1331 px / 134774 B / sha256 `45b85ccd8ce4578d71806b2b7b73aa2b342b67259bcd194a762c6eb5103e2378`）
  - 续页补渲：`backup/scratch/refs-math3-ans/crops/2019_ans_p4.png`（932×1331 px / 137314 B / sha256 `56fa455e920615f67cf1c07e48622dc1e8fef526e48430bfa811a2fe1e417de2`）
- **亲读原文**：「(15) 解 当 $x>0$ 时，$f'(x)=2x^{2x}(\ln x+1)$；当 $x<0$ 时，$f'(x)=e^x(x+1)$。因为 $\lim_{x\to0^+}\frac{x^{2x}-1}{x}=\lim_{x\to0^+}\frac{e^{2x\ln x}-1}{x}=\lim_{x\to0^+}\frac{2x\ln x}{x}=-\infty$，所以 $f'(0)$ 不存在。综上 $f'(x)=\begin{cases}2x^{2x}(\ln x+1),&x>0,\\e^x(x+1),&x<0.\end{cases}$ 令 $f'(x)=0$，得驻点 $x=-1,x=\frac1e$。当 $x<-1$ 或 $0<x<\frac1e$ 时，$f'(x)<0$；当 $-1<x<0$ 或 $x>\frac1e$ 时，$f'(x)>0$。所以 $f(x)$ 在区间 $(-\infty,-1)$ 和 $(0,\frac1e)$ 内单调减少，在区间 $(-1,0)$ 和 $(\frac1e,+\infty)$ 内单调增加，从而 $f(x)$ 的极小值为 $f(-1)=1-\frac1e,f\left(\frac1e\right)=e^{-\frac2e}$，极大值为 $f(0)=1$。」
- **结论**：答案 $f'(x)=\begin{cases}2x^{2x}(\ln x+1),&x>0\\e^x(x+1),&x<0\end{cases}$，$f'(0)$ 不存在；极小值 $f(-1)=1-\frac1e$、$f\left(\frac1e\right)=e^{-\frac2e}$；极大值 $f(0)=1$（kind=`solution`，锚点 `f(-1)=1-\dfrac1{\mathrm e}`）；三源一致性 = all（题面 真题册 p14 + 解析册 p3 亲读 + 独立复算）；
  - 独立复算：独立复算同值：$x>0$ 时 $f=x^{2x}$，$f'=f\cdot2(\ln x+1)$ ⇒ 驻点 $x=\frac1e$，$f(\frac1e)=e^{−2/e}$；$x<0$ 时 $f=e^x(x+1)$ ⇒ 驻点 $x=-1$，$f(-1)=1-\frac1e$；$f(0)=1$ 为极大值 ✓。
- **置信度**：high；

### m3-2019-16 ｜ 三(16) ｜ 解答

- **材料**：2019 年数学三真题答案解析册（`参考文件/真题/数学/6、【1987-2025年】考研数学三真题答案及解析/2019年数学三真题答案解析.pdf`），题面见真题册 PDF p14；
- **页码**：解析册 PDF p4（整页）；
- **生成命令**：`参考文件/_venv/Scripts/python.exe tools/refs-vision.py --pdf "参考文件/真题/数学/6、【1987-2025年】考研数学三真题答案及解析/2019年数学三真题答案解析.pdf" --page 4 --dpi 130 --out "backup/scratch/refs-math3-ans/crops/2019_ans_p4.png"`
- **裁片**：`backup/scratch/refs-math3-ans/crops/2019_ans_p4.png`（932×1331 px / 137314 B / sha256 `56fa455e920615f67cf1c07e48622dc1e8fef526e48430bfa811a2fe1e417de2`）
- **亲读原文**：「(16) 解 因为 $\frac{\partial g}{\partial x}=y-f_u(x+y,x-y)-f_v(x+y,x-y)$，$\frac{\partial g}{\partial y}=x-f_u(x+y,x-y)+f_v(x+y,x-y)$，$\frac{\partial^2g}{\partial x^2}=-f_{uu}(x+y,x-y)-2f_{uv}(x+y,x-y)-f_{vv}(x+y,x-y)$，$\frac{\partial^2g}{\partial x\partial y}=1-f_{uu}(x+y,x-y)+f_{vv}(x+y,x-y)$，$\frac{\partial^2g}{\partial y^2}=-f_{uu}(x+y,x-y)+2f_{uv}(x+y,x-y)-f_{vv}(x+y,x-y)$，所以 $\frac{\partial^2g}{\partial x^2}+\frac{\partial^2g}{\partial x\partial y}+\frac{\partial^2g}{\partial y^2}=1-3f_{uu}(x+y,x-y)-f_{vv}(x+y,x-y)$。」
- **结论**：答案 $\dfrac{\partial^2g}{\partial x^2}+\dfrac{\partial^2g}{\partial x\partial y}+\dfrac{\partial^2g}{\partial y^2}=1-3f_{uu}(x+y,x-y)-f_{vv}(x+y,x-y)$（kind=`solution`，锚点 `1-3f_{uu}(x+y,x-y)-f_{vv}(x+y,x-y)`）；三源一致性 = all（题面 真题册 p14 + 解析册 p4 亲读 + 独立复算）；
  - 独立复算：独立复算同值：$g=xy-f(x+y,x-y)$，令 $u=x+y,v=x-y$ 逐项求偏导，$f_{uv}$ 项在相加时抵消（$-2+0+2=0$），得 $1-3f_{uu}-f_{vv}$ ✓。
- **置信度**：high；

### m3-2019-17 ｜ 三(17) ｜ 解答

- **材料**：2019 年数学三真题答案解析册（`参考文件/真题/数学/6、【1987-2025年】考研数学三真题答案及解析/2019年数学三真题答案解析.pdf`），题面见真题册 PDF p14；
- **页码**：解析册 PDF p4（整页）；
- **生成命令**：`参考文件/_venv/Scripts/python.exe tools/refs-vision.py --pdf "参考文件/真题/数学/6、【1987-2025年】考研数学三真题答案及解析/2019年数学三真题答案解析.pdf" --page 4 --dpi 130 --out "backup/scratch/refs-math3-ans/crops/2019_ans_p4.png"`
- **裁片**：`backup/scratch/refs-math3-ans/crops/2019_ans_p4.png`（932×1331 px / 137314 B / sha256 `56fa455e920615f67cf1c07e48622dc1e8fef526e48430bfa811a2fe1e417de2`）
- **亲读原文**：「(17) 解 （Ⅰ）由一阶线性微分方程的通解公式，得 $y(x)=e^{\int x\mathrm dx}\left(C+\int\frac1{2\sqrt x}e^{\frac{x^2}2}e^{-\int x\mathrm dx}\mathrm dx\right)=e^{\frac{x^2}2}(\sqrt x+C)$。因为 $y(1)=\sqrt e$，所以 $C=0$。从而 $y(x)=\sqrt xe^{\frac{x^2}2}$。（Ⅱ）$D$ 绕 $x$ 轴旋转所得旋转体的体积为 $V=\int_1^2\pi y^2(x)\mathrm dx=\int_1^2\pi xe^{x^2}\mathrm dx=\frac\pi2e^{x^2}\Big|_1^2=\frac\pi2(e^4-e)$。」
- **结论**：答案 （Ⅰ）$y(x)=\sqrt x\,e^{\frac{x^2}2}$；（Ⅱ）$V=\frac{\pi}{2}(e^4-e)$（kind=`solution`，锚点 `y(x)=\sqrt x\,\mathrm e^{\frac{x^2}2}`）；三源一致性 = all（题面 真题册 p14 + 解析册 p4 亲读 + 独立复算）；
  - 独立复算：独立复算同值：$y'=xy+\frac1{2\sqrt x}e^{x^2/2}$ ⇒ $y=e^{x^2/2}(\sqrt x+C)$，$y(1)=\sqrt e$ ⇒ $C=0$；$V=\pi\int_1^2xe^{x^2}dx=\frac\pi2(e^4-e)$ ✓。
- **置信度**：high；

### m3-2019-18 ｜ 三(18) ｜ 解答

- **材料**：2019 年数学三真题答案解析册（`参考文件/真题/数学/6、【1987-2025年】考研数学三真题答案及解析/2019年数学三真题答案解析.pdf`），题面见真题册 PDF p15；
- **页码**：解析册 PDF p4（整页）；
- **生成命令**：`参考文件/_venv/Scripts/python.exe tools/refs-vision.py --pdf "参考文件/真题/数学/6、【1987-2025年】考研数学三真题答案及解析/2019年数学三真题答案解析.pdf" --page 4 --dpi 130 --out "backup/scratch/refs-math3-ans/crops/2019_ans_p4.png"`
- **裁片**：`backup/scratch/refs-math3-ans/crops/2019_ans_p4.png`（932×1331 px / 137314 B / sha256 `56fa455e920615f67cf1c07e48622dc1e8fef526e48430bfa811a2fe1e417de2`）
- **亲读原文**：「(18) 解 由题意，所求面积为 $S=\int_0^{+\infty}e^{-x}|\sin x|\mathrm dx=\sum_{n=0}^{\infty}(-1)^n\int_{n\pi}^{(n+1)\pi}e^{-x}\sin x\mathrm dx$，因为 $\int_{n\pi}^{(n+1)\pi}e^{-x}\sin x\mathrm dx=-e^{-x}\cos x\Big|_{n\pi}^{(n+1)\pi}-\int_{n\pi}^{(n+1)\pi}e^{-x}\cos x\mathrm dx=(-1)^n[e^{-(n+1)\pi}+e^{-n\pi}]-\int_{n\pi}^{(n+1)\pi}e^{-x}\sin x\mathrm dx$，得 $\int_{n\pi}^{(n+1)\pi}e^{-x}\sin x\mathrm dx=\frac{(-1)^n}2[e^{-(n+1)\pi}+e^{-n\pi}]$。所以 $S=\frac12\sum_{n=0}^{\infty}[e^{-n\pi}+e^{-(n+1)\pi}]=\frac{e^{\pi}+1}{2(e^{\pi}-1)}$。」
- **结论**：答案 $S=\dfrac{e^{\pi}+1}{2(e^{\pi}-1)}$（kind=`solution`，锚点 `\dfrac{\mathrm e^{\pi}+1}{2(\mathrm e^{\pi}-1)}`）；三源一致性 = all（题面 真题册 p15 + 解析册 p4 亲读 + 独立复算）；
  - 独立复算：独立复算同值：$S=\frac12(1+e^{-\pi})\sum_{n\ge0}e^{-n\pi}=\frac12\frac{1+e^{-\pi}}{1-e^{-\pi}}=\frac{e^{\pi}+1}{2(e^{\pi}-1)}$ ✓。
- **置信度**：high；

### m3-2019-19 ｜ 三(19) ｜ 解答

- **材料**：2019 年数学三真题答案解析册（`参考文件/真题/数学/6、【1987-2025年】考研数学三真题答案及解析/2019年数学三真题答案解析.pdf`），题面见真题册 PDF p15；
- **页码**：解析册 PDF p5（整页）；
- **生成命令**：`参考文件/_venv/Scripts/python.exe tools/refs-vision.py --pdf "参考文件/真题/数学/6、【1987-2025年】考研数学三真题答案及解析/2019年数学三真题答案解析.pdf" --page 5 --dpi 130 --out "backup/scratch/refs-math3-ans/crops/2019_ans_p5.png"`
- **裁片**：`backup/scratch/refs-math3-ans/crops/2019_ans_p5.png`（932×1331 px / 163496 B / sha256 `25c2e64698befc208b79fcf95763409e971d276459f39c4a47746125d24dba62`）
- **亲读原文**：「(19) 解 （Ⅰ）$a_{n+1}-a_n=\int_0^1x^n(x-1)\sqrt{1-x^2}\mathrm dx$。因为在积分区间 $[0,1]$ 上，$x^n(x-1)\sqrt{1-x^2}\le0$ 且不恒等于 0，所以 $a_{n+1}-a_n<0$，即 $\{a_n\}$ 单调减少。当 $n\ge2$ 时，因为 $a_n=\int_0^1x^n\sqrt{1-x^2}\mathrm dx=-\frac13x^{n-1}(1-x^2)^{\frac32}\Big|_0^1+\frac{n-1}3\int_0^1x^{n-2}(1-x^2)^{\frac32}\mathrm dx=\frac{n-1}3a_{n-2}-\frac{n-1}3a_n$，所以 $a_n=\frac{n-1}{n+2}a_{n-2}(n=2,3,\cdots)$。（Ⅱ）$\frac{a_n}{a_{n-1}}=\frac{n-1}{n+2}\frac{a_{n-2}}{a_{n-1}}$。因为 $\{a_n\}$ 单调减少且 $a_n>0$，所以 $\frac{n-1}{n+2}<\frac{a_n}{a_{n-1}}<1$，从而 $\lim_{n\to\infty}\frac{a_n}{a_{n-1}}=1$。」
- **结论**：答案 （Ⅰ）$\{a_n\}$ 单调减少，且 $a_n=\dfrac{n-1}{n+2}a_{n-2}\ (n\ge2)$；（Ⅱ）$\lim\limits_{n\to\infty}\dfrac{a_n}{a_{n-1}}=1$（kind=`solution`，锚点 `\lim_{n\to\infty}\dfrac{a_n}{a_{n-1}}=1`）；三源一致性 = all（题面 真题册 p15 + 解析册 p5 亲读 + 独立复算）；
  - 独立复算：独立复算同结论：（Ⅰ）被积函数 $x^n(x-1)\sqrt{1-x^2}\le0$ ⇒ 单调减；分部积分得递推 $a_n=\frac{n-1}{n+2}a_{n-2}$ ✓；（Ⅱ）夹逼 $\frac{n-1}{n+2}<\frac{a_n}{a_{n-1}}<1$ ⇒ 极限 1 ✓。
- **置信度**：high；

### m3-2019-20 ｜ 三(20) ｜ 解答

- **材料**：2019 年数学三真题答案解析册（`参考文件/真题/数学/6、【1987-2025年】考研数学三真题答案及解析/2019年数学三真题答案解析.pdf`），题面见真题册 PDF p15；
- **页码**：解析册 PDF p5（整页）；
- **生成命令**：`参考文件/_venv/Scripts/python.exe tools/refs-vision.py --pdf "参考文件/真题/数学/6、【1987-2025年】考研数学三真题答案及解析/2019年数学三真题答案解析.pdf" --page 5 --dpi 130 --out "backup/scratch/refs-math3-ans/crops/2019_ans_p5.png"`
- **裁片**：`backup/scratch/refs-math3-ans/crops/2019_ans_p5.png`（932×1331 px / 163496 B / sha256 `25c2e64698befc208b79fcf95763409e971d276459f39c4a47746125d24dba62`）
  - 续页补渲：`backup/scratch/refs-math3-ans/crops/2019_ans_p6.png`（932×1331 px / 166933 B / sha256 `cf5c15ee20ff8154d957346887d9a699439be1a181334aebc1c58eee8be04471`）
- **亲读原文**：「(20) 解 由等价的定义可知：$\beta_1,\beta_2,\beta_3$ 都能由 $\alpha_1,\alpha_2,\alpha_3$ 线性表示，则有 $r(\alpha_1,\alpha_2,\alpha_3)=r(\alpha_1,\alpha_2,\alpha_3,\beta_1,\beta_2,\beta_3)$，对 $(\alpha_1,\alpha_2,\alpha_3,\beta_1,\beta_2,\beta_3)$ 作初等行变换可得 $\begin{pmatrix}1&1&1&\vdots&1&0&1\\1&0&2&\vdots&1&2&3\\4&4&a^2+3&\vdots&a+3&1-a&a^2+3\end{pmatrix}\to\begin{pmatrix}1&1&1&\vdots&1&0&1\\0&-1&1&\vdots&0&2&2\\0&0&a^2-1&\vdots&a-1&1-a&a^2-1\end{pmatrix}$…当 $a=-1$ 时，有 $r(\alpha_1,\alpha_2,\alpha_3)<r(\alpha_1,\alpha_2,\alpha_3,\beta_1,\beta_2,\beta_3)$；当 $a=1$ 时，有 $r(\alpha_1,\alpha_2,\alpha_3)=r(\alpha_1,\alpha_2,\alpha_3,\beta_1,\beta_2,\beta_3)=2$；可知 $a\ne1$ 且 $a\ne-1$ 时，此时 $r(\alpha_1,\alpha_2,\alpha_3)=r(\alpha_1,\alpha_2,\alpha_3,\beta_1,\beta_2,\beta_3)=3$，则有 $a=1$ 或者 $a\ne1$ 且 $a\ne-1$ 时，$\beta_1,\beta_2,\beta_3$ 可由 $\alpha_1,\alpha_2,\alpha_3$ 线性表示…综上所述：当 $a\ne-1$ 时，向量组 $\alpha_1,\alpha_2,\alpha_3$ 与向量组 $\beta_1,\beta_2,\beta_3$ 可相互线性表示。当 $a\ne1$ 时，$\beta_3=\alpha_1-\alpha_2+\alpha_3$。当 $a=1$ 时，$(\alpha_1,\alpha_2,\alpha_3,\beta_3)\to\begin{pmatrix}1&0&2&\vdots&3\\0&1&-1&\vdots&-2\\0&0&0&\vdots&0\end{pmatrix}$，基础解系为 $k\begin{pmatrix}-2\\1\\1\end{pmatrix}+\begin{pmatrix}3\\-2\\0\end{pmatrix}(k\in\mathbf R)$，则 $\beta_3=(3-2k)\alpha_1+(k-2)\alpha_2+k\alpha_3$。」
- **结论**：答案 当 $a\ne-1$ 时两向量组可相互线性表示；$a\ne1$ 时 $\beta_3=\alpha_1-\alpha_2+\alpha_3$；$a=1$ 时 $\beta_3=(3-2k)\alpha_1+(k-2)\alpha_2+k\alpha_3\ (k\in\mathbf R)$（kind=`solution`，锚点 `a\ne-1`）；三源一致性 = all（题面 真题册 p15 + 解析册 p5 亲读 + 独立复算）；
  - 独立复算：独立复算同结论：秩条件 $r(\alpha)=r(\alpha,\beta)$ 与 $r(\beta)=r(\beta,\alpha)$ 同时成立 ⇔ $a\ne-1$；并解出 $\beta_3$ 在 $a\ne1$ 与 $a=1$ 两种情形下的表示式 ✓。
- **置信度**：high；

### m3-2019-21 ｜ 三(21) ｜ 解答

- **材料**：2019 年数学三真题答案解析册（`参考文件/真题/数学/6、【1987-2025年】考研数学三真题答案及解析/2019年数学三真题答案解析.pdf`），题面见真题册 PDF p16；
- **页码**：解析册 PDF p6（整页）；
- **生成命令**：`参考文件/_venv/Scripts/python.exe tools/refs-vision.py --pdf "参考文件/真题/数学/6、【1987-2025年】考研数学三真题答案及解析/2019年数学三真题答案解析.pdf" --page 6 --dpi 130 --out "backup/scratch/refs-math3-ans/crops/2019_ans_p6.png"`
- **裁片**：`backup/scratch/refs-math3-ans/crops/2019_ans_p6.png`（932×1331 px / 166933 B / sha256 `cf5c15ee20ff8154d957346887d9a699439be1a181334aebc1c58eee8be04471`）
- **亲读原文**：「(21) 解 （Ⅰ）因为矩阵 $A$ 与 $B$ 相似，所以 $\mathrm{tr}(A)=\mathrm{tr}(B),|A|=|B|$，即 $\begin{cases}x-4=y+1,\\4x-8=-2y,\end{cases}$ 解得 $x=3,y=-2$。（Ⅱ）矩阵 $B$ 的特征多项式为 $|\lambda E-B|=(\lambda-2)(\lambda+1)(\lambda+2)$，所以 $B$ 的特征值为 $2,-1,-2$。由于 $A$ 与 $B$ 相似，所以 $A$ 的特征值也为 $2,-1,-2$。$A$ 的属于特征值 2 的特征向量为 $\xi_1=(1,-2,0)^{\mathrm T}$；属于特征值 $-1$ 的特征向量为 $\xi_2=(-2,1,0)^{\mathrm T}$；属于特征值 $-2$ 的特征向量为 $\xi_3=(1,-2,-4)^{\mathrm T}$。记 $P_1=(\xi_1,\xi_2,\xi_3)$，于是 $P_1^{-1}AP_1=\begin{pmatrix}2&0&0\\0&-1&0\\0&0&-2\end{pmatrix}$…由 $P_1^{-1}AP_1=P_2^{-1}BP_2$，得 $(P_1P_2^{-1})^{-1}A(P_1P_2^{-1})=B$。令 $P=P_1P_2^{-1}=\begin{pmatrix}1&-2&1\\-2&1&-2\\0&0&-4\end{pmatrix}\begin{pmatrix}1&\frac13&0\\0&-\frac13&0\\0&0&1\end{pmatrix}=\begin{pmatrix}1&1&1\\-2&-1&-2\\0&0&-4\end{pmatrix}$，则 $P^{-1}AP=B$。」
- **结论**：答案 $x=3,\ y=-2$；特征值 $2,-1,-2$；$P=\begin{pmatrix}1&1&1\\-2&-1&-2\\0&0&-4\end{pmatrix}$，$P^{-1}AP=B$（kind=`solution`，锚点 `P=\begin{pmatrix}1&1&1\\-2&-1&-2\\0&0&-4\end{pmatrix}`）；三源一致性 = all（题面 真题册 p16 + 解析册 p6 亲读 + 独立复算）；
  - 独立复算：独立复算同值：迹与行列式条件 $\begin{cases}x-4=y+1\\4x-8=-2y\end{cases}$ ⇒ $x=3,y=-2$；$P=P_1P_2^{-1}$ 逐元核为 $\begin{pmatrix}1&1&1\\-2&-1&-2\\0&0&-4\end{pmatrix}$ ✓。
- **置信度**：high；

### m3-2019-22 ｜ 三(22) ｜ 解答

- **材料**：2019 年数学三真题答案解析册（`参考文件/真题/数学/6、【1987-2025年】考研数学三真题答案及解析/2019年数学三真题答案解析.pdf`），题面见真题册 PDF p16；
- **页码**：解析册 PDF p6（整页）；
- **生成命令**：`参考文件/_venv/Scripts/python.exe tools/refs-vision.py --pdf "参考文件/真题/数学/6、【1987-2025年】考研数学三真题答案及解析/2019年数学三真题答案解析.pdf" --page 6 --dpi 130 --out "backup/scratch/refs-math3-ans/crops/2019_ans_p6.png"`
- **裁片**：`backup/scratch/refs-math3-ans/crops/2019_ans_p6.png`（932×1331 px / 166933 B / sha256 `cf5c15ee20ff8154d957346887d9a699439be1a181334aebc1c58eee8be04471`）
  - 续页补渲：`backup/scratch/refs-math3-ans/crops/2019_ans_p7.png`（932×1331 px / 131937 B / sha256 `1e506ebf33118d48a3359f89a2b78fa8b47d650ccd45fa707e70c38beee09bec`）
- **亲读原文**：「(22) 解 （Ⅰ）$Z$ 的分布函数为 $F_Z(z)=P\{Z\le z\}=P\{XY\le z|Y=-1\}P\{Y=-1\}+P\{XY\le z|Y=1\}P\{Y=1\}=pP\{-X\le z\}+(1-p)P\{X\le z\}$…当 $z<0$ 时，$F_Z(z)=pP\{X\ge-z\}+(1-p)\cdot0=pe^z$；当 $z\ge0$ 时，$F_Z(z)=p\cdot1+(1-p)P\{X\le z\}=1-(1-p)e^{-z}$。所以 $Z$ 的概率密度为 $f_Z(z)=F_Z'(z)=\begin{cases}pe^z,&z<0,\\(1-p)e^{-z},&z\ge0.\end{cases}$（Ⅱ）$\mathrm{Cov}(X,Z)=E(XZ)-EX\cdot EZ=E(X^2Y)-EX\cdot E(XY)=E(X^2)\cdot E(Y)-(EX)^2\cdot E(Y)=DX\cdot EY=1-2p$，令 $\mathrm{Cov}(X,Z)=0$，得 $p=\frac12$。所以 $p=\frac12$ 时，$X$ 与 $Z$ 不相关。（Ⅲ）因为 $P\{X\le1,Z\le-1\}=P\{X\le1,XY\le-1\}=0$，$P\{X\le1\}>0,P\{Z\le-1\}>0$，所以 $P\{X\le1,Z\le-1\}\ne P\{X\le1\}P\{Z\le-1\}$。故 $X$ 与 $Z$ 不相互独立。」
- **结论**：答案 （Ⅰ）$f_Z(z)=\begin{cases}pe^z,&z<0\\(1-p)e^{-z},&z\ge0\end{cases}$；（Ⅱ）$\mathrm{Cov}(X,Z)=1-2p$，$p=\frac12$ 时 $X$ 与 $Z$ 不相关；（Ⅲ）$X$ 与 $Z$ 不相互独立（kind=`solution`，锚点 `\mathrm{Cov}(X,Z)=1-2p`）；三源一致性 = all（题面 真题册 p16 + 解析册 p6 亲读 + 独立复算）；
  - 独立复算：独立复算同值：$X\sim E(1)$（$EX=DX=1$），$EY=1-2p$，$Z=XY$ ⇒ $\mathrm{Cov}=DX\cdot EY=1-2p$ ⇒ $p=\frac12$；且 $\{X\le1,Z\le-1\}=\varnothing$ 而边缘概率非零 ⇒ 不独立 ✓。
- **置信度**：high；

### m3-2019-23 ｜ 三(23) ｜ 解答

- **材料**：2019 年数学三真题答案解析册（`参考文件/真题/数学/6、【1987-2025年】考研数学三真题答案及解析/2019年数学三真题答案解析.pdf`），题面见真题册 PDF p16；
- **页码**：解析册 PDF p7（整页）；
- **生成命令**：`参考文件/_venv/Scripts/python.exe tools/refs-vision.py --pdf "参考文件/真题/数学/6、【1987-2025年】考研数学三真题答案及解析/2019年数学三真题答案解析.pdf" --page 7 --dpi 130 --out "backup/scratch/refs-math3-ans/crops/2019_ans_p7.png"`
- **裁片**：`backup/scratch/refs-math3-ans/crops/2019_ans_p7.png`（932×1331 px / 131937 B / sha256 `1e506ebf33118d48a3359f89a2b78fa8b47d650ccd45fa707e70c38beee09bec`）
- **亲读原文**：「(23) 解 （Ⅰ）由 $\int_{-\infty}^{+\infty}f(x;\sigma^2)\mathrm dx=1$，得 $1=\int_\mu^{+\infty}\frac A\sigma e^{-\frac{(x-\mu)^2}{2\sigma^2}}\mathrm dx=A\int_0^{+\infty}e^{-\frac{t^2}2}\mathrm dt=A\cdot\frac{\sqrt{2\pi}}2\int_{-\infty}^{+\infty}\frac1{\sqrt{2\pi}}e^{-\frac{t^2}2}\mathrm dt=\frac{\sqrt{2\pi}}2A$，所以 $A=\sqrt{\frac2\pi}$。（Ⅱ）设 $x_1,x_2,\cdots,x_n$ 为样本观测值，则似然函数为 $L(\sigma^2)=\prod_{i=1}^nf(x_i;\sigma^2)=\begin{cases}\left(\frac2\pi\right)^{\frac n2}(\sigma^2)^{-\frac n2}e^{-\frac1{2\sigma^2}\sum_{i=1}^n(x_i-\mu)^2},&x_1,x_2,\cdots,x_n\ge\mu,\\0,&其他,\end{cases}$ 对数似然函数为 $\ln L(\sigma^2)=\frac n2\ln\frac2\pi-\frac n2\ln\sigma^2-\frac1{2\sigma^2}\sum_{i=1}^n(x_i-\mu)^2$，$\frac{\mathrm d\ln L(\sigma^2)}{\mathrm d\sigma^2}=-\frac n{2\sigma^2}+\frac1{2\sigma^4}\sum_{i=1}^n(x_i-\mu)^2$，令 $\frac{\mathrm d\ln L(\sigma^2)}{\mathrm d\sigma^2}=0$，得 $\sigma^2$ 的最大似然估计值为 $\hat\sigma^2=\frac1n\sum_{i=1}^n(x_i-\mu)^2$，所以 $\sigma^2$ 的最大似然估计量为 $\hat\sigma^2=\frac1n\sum_{i=1}^n(X_i-\mu)^2$。」
- **结论**：答案 （Ⅰ）$A=\sqrt{\frac2\pi}$；（Ⅱ）$\hat\sigma^2=\frac1n\sum\limits_{i=1}^n(X_i-\mu)^2$（kind=`solution`，锚点 `A=\sqrt{\dfrac2\pi}`）；三源一致性 = all（题面 真题册 p16 + 解析册 p7 亲读 + 独立复算）；
  - 独立复算：独立复算同值：$\int_0^\infty e^{-t^2/2}dt=\sqrt{\pi/2}$ ⇒ $A=\sqrt{2/\pi}$；对数似然求导 $-\frac n{2\sigma^2}+\frac1{2\sigma^4}\sum(x_i-\mu)^2=0$ ⇒ $\hat\sigma^2=\frac1n\sum(X_i-\mu)^2$ ✓。
- **置信度**：high；

## 4. 三源一致与不一致登记

| id | 年 | 题号 | 三源 | 不一致内容（以哪源为准 + 理由） |
| --- | --- | --- | --- | --- |
| `m3-2012-17` | 2012 | 三(17) | all | other_source: 早先 t4 记录（源自 参考文件/_extract OCR 文本）称『源末值印 11524』；ruling: 以解析册裁片为准：本页两处均印 11118；reason: 独立复算 C(24,26)=11118，与裁片一致；11524 系 OCR 讹字（1/1/5/2/4 与 1/1/1/1/8 字形相近） |

## 5. 覆盖审计（与 crop-plan 对拍，无空洞）

- 计划 136 targets 与亲读 136 条**逐个 id 命中**：计划外 0 条、漏读 0 条、重复 0 条；
- 计划 kind 分布 fill 46 / solution 90，与亲读归一后一致（亲读文件里 8 条写 `solve`、8 条写 `proof`，
  本文件按 crop-plan 的 kind 归一为 `solution`，不改变答案与锚点）；
- 全部条目均带 `anchor`（非空）与 ≥20 字亲读原文，可被 `build-bank-*` 与 manifest 直接消费；
- 未裁定条目：0（2010–2019 全部非选择题 46 填空 + 90 解答）；
- 生成日期：2026-10-11；生成器：`backup/scratch/refs-math3-ans/build-answers.mjs`（重跑逐字节幂等）。

### 5.1 计划外补渲登记（计划内 band 偏窄 / 小开本解析册不足以取全答案时补渲）

| 裁片 | 页 | 尺寸 | 字节 | sha256 | 引用 | 补渲原因 |
| --- | --- | --- | --- | --- | --- | --- |
| `2011_ans_p9.png` | p9 | 797×1127 | 82808 | `af1ea03baf53…` | 1 条：m3-2011-21 | crop-plan 把 2011 三(21) 归到 p8（题头在页脚），实际解答在 p9；补渲以取全 (21) 的解 |
| `2012_ans_p10.png` | p10 | 910×1287 | 98760 | `5e495ce36d6e…` | 2 条：m3-2012-20、m3-2012-21（续页） | crop-plan 该页只渲了 2012 三(21) 题头起的窄带，缺 三(20)(Ⅱ) 的通解与 (21) 上半；补渲整页 |
| `2012_ans_p11.png` | p11 | 910×1287 | 73136 | `bad2652b4ab4…` | 1 条：m3-2012-21 | 计划内 2012_ans_p11_band 太窄（12971 B），未含 (21) 完整解答；补渲整页 |
| `2012_ans_p12.png` | p12 | 910×1287 | 91189 | `d8ee1b3eb3b8…` | 2 条：m3-2012-22、m3-2012-23（续页） | 计划内 band 只覆盖 (22) 的分布表与解析开头，未含 (23)；补渲整页 |
| `2012_ans_p13.png` | p13 | 910×1287 | 37313 | `f0d1355c4bc1…` | 1 条：m3-2012-23 | 2012 解析册共 13 页；(23) 的解续到末页，计划未含此页 |
| `2013_ans_p4.png` | p4 | 910×1287 | 109410 | `162b9dbfe405…` | 1 条：m3-2013-9 | 计划内 2013_ans_p4_band 仅 36231 B（只覆盖 (9) 题面），补渲整页取 (9) 完整解答 |
| `2013_ans_p8.png` | p8 | 910×1287 | 95982 | `4401600a3542…` | 2 条：m3-2013-20、m3-2013-21（续页） | 计划内 2013_ans_p8_band 仅 40749 B（缺 (20) 上半）；补渲整页 |
| `2013_ans_p9.png` | p9 | 910×1287 | 129208 | `2b446d4ae19e…` | 3 条：m3-2013-21、m3-2013-22、m3-2013-23（续页） | 计划内 2013_ans_p9_band 缺 (21)(Ⅱ) 与 (22) 的答案表；补渲整页 |
| `2013_ans_p10.png` | p10 | 910×1287 | 33097 | `bf155a1726e7…` | 1 条：m3-2013-23 | 2013 解析册末页，(23)(Ⅱ) 极大似然估计续到此页，计划未含 |
| `2016_ans_p5.png` | p5 | 788×1126 | 125452 | `447cd60dcd22…` | 3 条：m3-2016-19（续页）、m3-2016-20、m3-2016-21 | 计划内 2016_ans_p5_band 仅 47650 B（窄带）；补渲整页取 (21) 完整解答 |
| `2016_ans_p6.png` | p6 | 788×1126 | 82902 | `a670a1755034…` | 2 条：m3-2016-21（续页）、m3-2016-22 | 计划内 2016_ans_p6_band 仅 43442 B（窄带）；补渲整页取 (22)(23) 完整解答 |
| `zhen2018_p18_full110.png` | p18 | 910×1287 | 105726 | `3c17d3fa2982…` | 1 条：m3-2018-15（题面核对） | 题面三源核对：2018 二(9)–(14) 与 三(15)(16) 题面亲读（(15) 须确认题设极限为 2 才能定 b=1） |

- 计划内裁片 59 页（含 band），计划外补渲 12 张；本批实际引用 63 张，全部 ≤1400 px / ≤400 KB；
- 「未裁定页」不存在：所有 136 条答案都在计划内的整页或续页裁片上取到，凡计划内 band 偏窄的页一律补渲整页（见上表 why 栏）。
