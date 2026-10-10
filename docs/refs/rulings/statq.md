# 统计真题族 · 读图裁定记录（statq）

本文件是 `docs/refs/statq.md` 的逐条取证附录：每一条裁定都给出**材料、页码、生成命令、裁片、亲读原文、结论、置信度**七字段，
裁片的像素尺寸/字节数/sha256 由 `backup/scratch/refs-statq/clip_meta.py` 从 PNG 文件直接读出（PNG IHDR + sha256），
因此同一命令重跑后可用指纹逐字节复核。

通道口径（与 `docs/refs/README.md` 一致）：
- **主通道 = 自带 `read_image`**：把裁片 PNG 交给自己读，逐字转写，不依赖任何外部识别服务。
- **禁用 `modlens`**：其额度独立于主通道，额度耗尽时会返回退化/伪造的"成功"结果，把失败伪装成通过。
- 裁片目录 `backup/scratch/refs-statq/clips/` 与 `backup/scratch/refs-vision/` 均在 `.gitignore` 覆盖范围内（`backup/` 整目录忽略），
  可凭命令重建、不进入版本库。
- 工具脚本（scratch，不属交付面）：`make_montage.py`（按页+目标文本定位并纵向拼贴）、`native_stack.py`（把一页嵌入图按原生分辨率拼贴）、
  `clip_meta.py`（列出裁片指纹）。单条整页/裁片通道亦可用已交付的 `tools/refs-vision.py`（`--box` 按 PDF 点裁剪、`--verify` 复核 sha256）。

复现全部裁片指纹：

```
& "参考文件\_venv\Scripts\python.exe" backup\scratch\refs-statq\clip_meta.py
```

说明：拼贴图每片左上角的红色 `label pdf-pN` 行是工具绘制的标注，**不属于页面内容**，读图时应忽略。


裁定条目共 49 条，覆盖三册（真题册 23 / 解析册 20 / 合集 6）。


## JYSG 真题册（jysg）

### R01 · pdf p7，书内 p5

- **材料**：`参考文件/真题/统计/JYSG真题册_2026_02_01 (1).pdf`（JYSG 真题册（jysg））
- **页码**：PDF 第 7 页（书内 p5）
- **生成命令**：
  ```
  & "参考文件/_venv/Scripts/python.exe" backup\scratch\refs-statq\make_montage.py "参考文件/真题/统计/JYSG真题册_2026_02_01 (1).pdf" "backup/scratch/refs-statq/clips/clip_j_01.png" backup/scratch/refs-statq/spec_j_01.json
  ```
- **裁片**：`backup/scratch/refs-statq/clips/clip_j_01.png`（796×906 px，91943 B，sha256 `fa7a89ac8db28a4477f99e0fb6a2de13938970c39912a176813d9fe9fad21c98`）
- **亲读原文**：北京大学光华-431 金融学统计／北京大学-431 金融学综合-2016／2016 统计部分真题；一、收集同一个公司两个市场的日回报率，其中 (x1,x2,x3,…,xn) 为 A 市场…为 B 市场的股票的回报率；(1) 描述如何检验 A 的回报率是否比 B 的高。
- **结论**：2016 章头三行与题面完整可读，章头 school=北京大学光华 / code=431 / year=2016 与 statq.json 第 1 章一致；该页是正文起点（pdf p7 = 书内 p5），前置页 1–6 为目录与封面。
- **置信度**：**high**

### R02 · pdf p10，书内 p8

- **材料**：`参考文件/真题/统计/JYSG真题册_2026_02_01 (1).pdf`（JYSG 真题册（jysg））
- **页码**：PDF 第 10 页（书内 p8）
- **生成命令**：
  ```
  & "参考文件/_venv/Scripts/python.exe" backup\scratch\refs-statq\make_montage.py "参考文件/真题/统计/JYSG真题册_2026_02_01 (1).pdf" "backup/scratch/refs-statq/clips/clip_j_01.png" backup/scratch/refs-statq/spec_j_01.json
  ```
- **裁片**：`backup/scratch/refs-statq/clips/clip_j_01.png`（796×906 px，91943 B，sha256 `fa7a89ac8db28a4477f99e0fb6a2de13938970c39912a176813d9fe9fad21c98`）
- **亲读原文**：北京大学-431 金融学综合-2017／2017 统计部分真题；一、(15 分) 公司甲同时在大陆 A 股及香港 H 股上市，现有它在 A 股…的回报预测值 Xi,Yi；(1) 请给出两种检验方法，检验该股票在 A 股和 H 股上的回报均值是否相同（后接 (2) 讨论这两种检验隐含的假设条件）。
- **结论**：2017 章头可辨，题面以 PDF 文本层繁体/异体字符呈现（“股”等），OCR 抽取不会照抄。第 2 章 year=2017 由章头行直接确认。
- **置信度**：**high**

### R03 · pdf p19，书内 p17

- **材料**：`参考文件/真题/统计/JYSG真题册_2026_02_01 (1).pdf`（JYSG 真题册（jysg））
- **页码**：PDF 第 19 页（书内 p17）
- **生成命令**：
  ```
  & "参考文件/_venv/Scripts/python.exe" backup\scratch\refs-statq\make_montage.py "参考文件/真题/统计/JYSG真题册_2026_02_01 (1).pdf" "backup/scratch/refs-statq/clips/clip_j_02.png" backup/scratch/refs-statq/spec_j_02.json
  ```
- **裁片**：`backup/scratch/refs-statq/clips/clip_j_02.png`（925×907 px，153608 B，sha256 `2ebdbf73327f141024ef15d7a122a42ab843eb05feb165378753a35b2c76d085`）
- **亲读原文**：北京大学-431 金融学综合-2021／2021 统计部分真题；一、(20 分) 设 (X,Y) 的密度函数是 f(x,y)=2(x+y)，0≤x≤y≤1。(1)(10 分) 求 X,Y 的边际分布；(2)(10 分) 求 X+Y 的分布。
- **结论**：2021 章头与题干、两小问分值（10+10=20）逐字确认；该题二重积分区域 0≤x≤y≤1 是文本层无法可靠还原的关键约束（抽取易丢 ≤）。
- **置信度**：**high**

### R04 · pdf p17，书内 p15

- **材料**：`参考文件/真题/统计/JYSG真题册_2026_02_01 (1).pdf`（JYSG 真题册（jysg））
- **页码**：PDF 第 17 页（书内 p15）
- **生成命令**：
  ```
  & "参考文件/_venv/Scripts/python.exe" backup\scratch\refs-statq\make_montage.py "参考文件/真题/统计/JYSG真题册_2026_02_01 (1).pdf" "backup/scratch/refs-statq/clips/clip_j_02.png" backup/scratch/refs-statq/spec_j_02.json
  ```
- **裁片**：`backup/scratch/refs-statq/clips/clip_j_02.png`（925×907 px，153608 B，sha256 `2ebdbf73327f141024ef15d7a122a42ab843eb05feb165378753a35b2c76d085`）
- **亲读原文**：2020 微观部分真题；五、(15 分) 假设 X1 和 X2 都是独立同分布的泊松随机变量，均值分别为 μ1 和 μ2…；一、(15 分) B 城市的市民有两种出行方式：公共交通和私家车…贴补力度为原价格的 50%…市民从出行中获得的效用为 u(x1,x2)=x1^0.2 x2^0.8。
- **结论**：2020 卷同时含统计与微观两个部分（同一章）；效用函数幂次在 PDF 文本层被写成 `x0.2 1 x0.8 2`，必须读图才能确认为 x1^0.2·x2^0.8 —— 典型「碎片公式不可照抄」例证。
- **置信度**：**high**

### R05 · pdf p23，书内 p21

- **材料**：`参考文件/真题/统计/JYSG真题册_2026_02_01 (1).pdf`（JYSG 真题册（jysg））
- **页码**：PDF 第 23 页（书内 p21）
- **生成命令**：
  ```
  & "参考文件/_venv/Scripts/python.exe" backup\scratch\refs-statq\make_montage.py "参考文件/真题/统计/JYSG真题册_2026_02_01 (1).pdf" "backup/scratch/refs-statq/clips/clip_j_03.png" backup/scratch/refs-statq/spec_j_03.json
  ```
- **裁片**：`backup/scratch/refs-statq/clips/clip_j_03.png`（796×906 px，80053 B，sha256 `4d831f7c2e9473603068aec1c1c7a078648719e46c74ff5b3225c1077f78d91a`）
- **亲读原文**：北京大学-431 金融学综合-2023／2023 统计部分真题；一、(15 分) 设 X~N(0,1)，求 E[X³|X≥0]；二、(20 分) 某品牌商…购买某商品的比率 p…（xi=1 否则 xi=0）；(1)(8 分) 给定置信水平 90%，给出 p 的置信区间。
- **结论**：2023 章头与两题题干确认；E[X³|X≥0] 的条件期望符号与上下标在文本层碎裂，读图为准。
- **置信度**：**high**

### R06 · pdf p27，书内 p25

- **材料**：`参考文件/真题/统计/JYSG真题册_2026_02_01 (1).pdf`（JYSG 真题册（jysg））
- **页码**：PDF 第 27 页（书内 p25）
- **生成命令**：
  ```
  & "参考文件/_venv/Scripts/python.exe" backup\scratch\refs-statq\make_montage.py "参考文件/真题/统计/JYSG真题册_2026_02_01 (1).pdf" "backup/scratch/refs-statq/clips/clip_j_03.png" backup/scratch/refs-statq/spec_j_03.json
  ```
- **裁片**：`backup/scratch/refs-statq/clips/clip_j_03.png`（796×906 px，80053 B，sha256 `4d831f7c2e9473603068aec1c1c7a078648719e46c74ff5b3225c1077f78d91a`）
- **亲读原文**：北京大学-431 金融学综合-2025／2025 统计部分真题；一、不定项选择题（多选，少选，错选均不得分）。(16 分，每题 4 分) 1. X1,…,Xn i.i.d.~N(0,1) 下列说法正确的是：( ) A. x̄~N(0,1/n²) B. √n·x̄/s ~ t(n−1) C. Σ Xi² ~ χ²(n)。
- **结论**：2025 卷题型为不定项选择题（4 题 × 4 分 = 16 分）；该页只出现选项 A/B/C，D 项在下一页，说明章节切分以章头为界而非页边界。
- **置信度**：**high**

### R07 · pdf p30，书内 p28

- **材料**：`参考文件/真题/统计/JYSG真题册_2026_02_01 (1).pdf`（JYSG 真题册（jysg））
- **页码**：PDF 第 30 页（书内 p28）
- **生成命令**：
  ```
  & "参考文件/_venv/Scripts/python.exe" backup\scratch\refs-statq\make_montage.py "参考文件/真题/统计/JYSG真题册_2026_02_01 (1).pdf" "backup/scratch/refs-statq/clips/clip_j_04.png" backup/scratch/refs-statq/spec_j_04.json
  ```
- **裁片**：`backup/scratch/refs-statq/clips/clip_j_04.png`（1104×906 px，71362 B，sha256 `042b8a4026337e774d2854633b405a92bc489e7ed89da38cdcf26f3b9b03daf3`）
- **亲读原文**：北京大学-431 金融学综合-2026／• 2026 统计部分真题；一、证明以下命题。1 (5') 设 X,Y 为连续随机变量，证明全期望公式：E[E[X|Y]] = E[X]；2 (10') 证明贝叶斯公式…
- **结论**：2026 章确为**回忆版**：分值写成 (5')/(10')、以证明题开篇；此前脚本统计「题号行 0 条」属排版特征而非缺内容 —— 页级字符数正常（非低产页）。
- **置信度**：**high**

### R08 · pdf p209，书内 p207

- **材料**：`参考文件/真题/统计/JYSG真题册_2026_02_01 (1).pdf`（JYSG 真题册（jysg））
- **页码**：PDF 第 209 页（书内 p207）
- **生成命令**：
  ```
  & "参考文件/_venv/Scripts/python.exe" backup\scratch\refs-statq\make_montage.py "参考文件/真题/统计/JYSG真题册_2026_02_01 (1).pdf" "backup/scratch/refs-statq/clips/clip_j_04.png" backup/scratch/refs-statq/spec_j_04.json
  ```
- **裁片**：`backup/scratch/refs-statq/clips/clip_j_04.png`（1104×906 px，71362 B，sha256 `042b8a4026337e774d2854633b405a92bc489e7ed89da38cdcf26f3b9b03daf3`）
- **亲读原文**：8. Xi~N(μ,σ²) i=1,2,3,…,n，其中 μ 为已知常数，则 σ² 的充分无偏估计是( )。A. (1/10)Σ₁¹⁰(Xi−X̄)² B. (1/10)Σ₁¹⁰(Xi−μ)² C. (1/9)Σ₁¹⁰(Xi−μ)² D. (1/9)Σ₁⁹(Xi−μ)²
- **结论**：该页是碎片公式最密页（25 行 Σ 计为 `Pn i=1`）：四个选项的求和下标/上标与分母 10/9 必须读图；选项 B/C 的区别只在求和区间与分母，文本层无法区分。
- **置信度**：**high**

### R09 · pdf p174，书内 p172

- **材料**：`参考文件/真题/统计/JYSG真题册_2026_02_01 (1).pdf`（JYSG 真题册（jysg））
- **页码**：PDF 第 174 页（书内 p172）
- **生成命令**：
  ```
  & "参考文件/_venv/Scripts/python.exe" backup\scratch\refs-statq\make_montage.py "参考文件/真题/统计/JYSG真题册_2026_02_01 (1).pdf" "backup/scratch/refs-statq/clips/clip_j_05.png" backup/scratch/refs-statq/spec_j_05.json
  ```
- **裁片**：`backup/scratch/refs-statq/clips/clip_j_05.png`（1104×907 px，150932 B，sha256 `aaff0c23a2465d07b7f08279880e0d4d41623f35bda931ebd0efc22568653743`）
- **亲读原文**：15. 设样本 X1,…,Xn(n≥2) 来自参数为 θ(>0) 的泊松(Poisson)分布，概率分布列为 f(x;θ)=θ^x e^{−θ}/x!, x=0,1,2,…。令 X̄=Σᵢ₌₁ⁿXi/n 为样本均值，S²=Σ(Xi−X̄)²/(n−1) 为样本方差，若 Y=aX̄+(1−a)S², 0≤a≤1 为 θ 的无偏估计，则（）(A) a=0 (B) a=1 …
- **结论**：题干与样本均值/样本方差定义确认；泊松分布 θ^x e^{−θ}/x! 的上标与阶乘在文本层碎成 5 段，读图后与解析册 p573 的解答（R32）互相校验通过。
- **置信度**：**high**

### R10 · pdf p170，书内 p168

- **材料**：`参考文件/真题/统计/JYSG真题册_2026_02_01 (1).pdf`（JYSG 真题册（jysg））
- **页码**：PDF 第 170 页（书内 p168）
- **生成命令**：
  ```
  & "参考文件/_venv/Scripts/python.exe" backup\scratch\refs-statq\make_montage.py "参考文件/真题/统计/JYSG真题册_2026_02_01 (1).pdf" "backup/scratch/refs-statq/clips/clip_j_06.png" backup/scratch/refs-statq/spec_j_06.json
  ```
- **裁片**：`backup/scratch/refs-statq/clips/clip_j_06.png`（1104×906 px，114983 B，sha256 `fdcdd30b92e4fc717b43a797650ac025021c5139cf911484e05dd9aec65fe26b`）
- **亲读原文**：17. X1,…,Xn 为来自正态分布 N(μ,1) 的简单随机样本。令 X̄ 为其样本均值，若 (X̄−Cα, X̄+Cα) 为 μ 的 1−α 水平的置信区间，其中 0<α<1，Cα>0 为常数。若从总体 N(μ,1) 中新增一独立样品 Xn+1，则 Xn+1 落在此置信区间的概率（）(A) 等于 1−α (B) 小于 1−α (C) 大于 1−α (D) 与 1−α 的大小关系不能确定。
- **结论**：第 17 题四个选项完整；「新增独立样品 Xn+1」是关键条件（区间由前 n 个样本构造）。
- **置信度**：**high**

### R11 · pdf p170，书内 p168

- **材料**：`参考文件/真题/统计/JYSG真题册_2026_02_01 (1).pdf`（JYSG 真题册（jysg））
- **页码**：PDF 第 170 页（书内 p168）
- **生成命令**：
  ```
  & "参考文件/_venv/Scripts/python.exe" backup\scratch\refs-statq\make_montage.py "参考文件/真题/统计/JYSG真题册_2026_02_01 (1).pdf" "backup/scratch/refs-statq/clips/clip_j_06.png" backup/scratch/refs-statq/spec_j_06.json
  ```
- **裁片**：`backup/scratch/refs-statq/clips/clip_j_06.png`（1104×906 px，114983 B，sha256 `fdcdd30b92e4fc717b43a797650ac025021c5139cf911484e05dd9aec65fe26b`）
- **亲读原文**：18. X1,X2,X3 为来自正态分布 N(0,σ²) 的简单随机样本。记 Q1=Σᵢ₌₁³Xi², Q2=Σᵢ₌₁³(Xi−X̄)²，χ²_α(r) 为自由度为 r 的 χ² 分布的 100α% 分位数，则下面哪个不是 σ² 的 95% 的置信区间（）
- **结论**：第 18 题确认 Q1、Q2 的定义与「不是 95% 置信区间」的否定式设问；文本层记作 `记Q1 = P3`，上标 3 与下标 i=1 由读图还原。
- **置信度**：**high**

### R12 · pdf p215，书内 p213

- **材料**：`参考文件/真题/统计/JYSG真题册_2026_02_01 (1).pdf`（JYSG 真题册（jysg））
- **页码**：PDF 第 215 页（书内 p213）
- **生成命令**：
  ```
  & "参考文件/_venv/Scripts/python.exe" backup\scratch\refs-statq\make_montage.py "参考文件/真题/统计/JYSG真题册_2026_02_01 (1).pdf" "backup/scratch/refs-statq/clips/clip_j_05.png" backup/scratch/refs-statq/spec_j_05.json
  ```
- **裁片**：`backup/scratch/refs-statq/clips/clip_j_05.png`（1104×907 px，150932 B，sha256 `aaff0c23a2465d07b7f08279880e0d4d41623f35bda931ebd0efc22568653743`）
- **亲读原文**：9. 设 X1,X2,…Xn1 是来自正态总体 N(μ1,σ1²) 的一个样本，设 Y1,Y2,…,Yn2 是来自正态总体 N(μ2,σ2²) 的样本，且 Xi 与 Yi 相互独立，已知 n1n2S1²S2²…F_{α/2}(n1,n2)…则方差之比 σ1²/σ2² 的置信区间为( )（A–D 四个分式区间）。
- **结论**：第 9 题四个候选区间只在分位数自由度组合上不同，读图后与解析册 p630（R31）逐字比对通过。
- **置信度**：**high**

### R13 · pdf p215，书内 p213

- **材料**：`参考文件/真题/统计/JYSG真题册_2026_02_01 (1).pdf`（JYSG 真题册（jysg））
- **页码**：PDF 第 215 页（书内 p213）
- **生成命令**：
  ```
  & "参考文件/_venv/Scripts/python.exe" backup\scratch\refs-statq\make_montage.py "参考文件/真题/统计/JYSG真题册_2026_02_01 (1).pdf" "backup/scratch/refs-statq/clips/clip_j_05.png" backup/scratch/refs-statq/spec_j_05.json
  ```
- **裁片**：`backup/scratch/refs-statq/clips/clip_j_05.png`（1104×907 px，150932 B，sha256 `aaff0c23a2465d07b7f08279880e0d4d41623f35bda931ebd0efc22568653743`）
- **亲读原文**：10. 多变量数据的图示中，用于展示三个变量之间关系的是（）A. 散点图 B. 气泡图 C. 雷达图。
- **结论**：第 10 题为概念题，三选项可辨；该页与第 9 题同页，是「一页多题」的典型。
- **置信度**：**high**

### R14 · pdf p199，书内 p197

- **材料**：`参考文件/真题/统计/JYSG真题册_2026_02_01 (1).pdf`（JYSG 真题册（jysg））
- **页码**：PDF 第 199 页（书内 p197）
- **生成命令**：
  ```
  & "参考文件/_venv/Scripts/python.exe" backup\scratch\refs-statq\make_montage.py "参考文件/真题/统计/JYSG真题册_2026_02_01 (1).pdf" "backup/scratch/refs-statq/clips/clip_j_06.png" backup/scratch/refs-statq/spec_j_06.json
  ```
- **裁片**：`backup/scratch/refs-statq/clips/clip_j_06.png`（1104×906 px，114983 B，sha256 `fdcdd30b92e4fc717b43a797650ac025021c5139cf911484e05dd9aec65fe26b`）
- **亲读原文**：上海交通大学-432 统计学-2017 年；一．选择题（10 小题，每小题 6 分，共 60 分）1. 分布中位数小于平均数，则一般来说，该分布（）A. 左偏 B. 右偏 C. 正偏 …
- **结论**：上交 2017 章头与分值（10×6=60 分）确认；「中位数<平均数 ⇒ 右偏」是本题判分要点，选项 A/B/C 顺序必须读图。
- **置信度**：**high**

### R15 · pdf p78，书内 p76

- **材料**：`参考文件/真题/统计/JYSG真题册_2026_02_01 (1).pdf`（JYSG 真题册（jysg））
- **页码**：PDF 第 78 页（书内 p76）
- **生成命令**：
  ```
  & "参考文件/_venv/Scripts/python.exe" backup\scratch\refs-statq\make_montage.py "参考文件/真题/统计/JYSG真题册_2026_02_01 (1).pdf" "backup/scratch/refs-statq/clips/clip_j_07.png" backup/scratch/refs-statq/spec_j_07.json
  ```
- **裁片**：`backup/scratch/refs-statq/clips/clip_j_07.png`（1061×907 px，129636 B，sha256 `bd714a793b74a8559ce5b1da95fe84edd40142f96941fc6ca21c73d9f167b8ac`）
- **亲读原文**：3. …概率地输入 AAAA,BBBB,CCCC，且观测到 ACBA，问输入是 AAAA 的概率为___；4. 检验的 p 值是否为统计量?___。
- **结论**：填空题可辨：第 3 题是贝叶斯/最大后验型填空（信息序列 AAAA/ACBA 为记忆力信道题），第 4 题问 p 值是否为统计量 —— 两题作答均为填空、无选项。
- **置信度**：**high**

### R16 · pdf p78，书内 p76

- **材料**：`参考文件/真题/统计/JYSG真题册_2026_02_01 (1).pdf`（JYSG 真题册（jysg））
- **页码**：PDF 第 78 页（书内 p76）
- **生成命令**：
  ```
  & "参考文件/_venv/Scripts/python.exe" backup\scratch\refs-statq\make_montage.py "参考文件/真题/统计/JYSG真题册_2026_02_01 (1).pdf" "backup/scratch/refs-statq/clips/clip_j_07.png" backup/scratch/refs-statq/spec_j_07.json
  ```
- **裁片**：`backup/scratch/refs-statq/clips/clip_j_07.png`（1061×907 px，129636 B，sha256 `bd714a793b74a8559ce5b1da95fe84edd40142f96941fc6ca21c73d9f167b8ac`）
- **亲读原文**：5. 下列说法正确的个数是___：(1) R² 越小说明方程拟合越好；(2) R² 越大说明方程拟合越好；(3) 残差 e=ŷ−y 越大说明方程拟合越好；(4) 残差分析图中，点的分布越平稳说明方程的拟合越好，且点分布带状图越窄，说明拟合精度越高。6. 对任意三角形 ABC 内部取一点 P，在 BC 上取 Q，则直线 PQ 与 AB 相交的概率是___。
- **结论**：第 5 题四条说法（含 (3) 的 e=ŷ−y 记法）与第 6 题几何概率题干确认；该页碎片 13 行，对照解析册可定四个说法的真假计数。
- **置信度**：**high**

### R17 · pdf p236，书内 p234

- **材料**：`参考文件/真题/统计/JYSG真题册_2026_02_01 (1).pdf`（JYSG 真题册（jysg））
- **页码**：PDF 第 236 页（书内 p234）
- **生成命令**：
  ```
  & "参考文件/_venv/Scripts/python.exe" backup\scratch\refs-statq\make_montage.py "参考文件/真题/统计/JYSG真题册_2026_02_01 (1).pdf" "backup/scratch/refs-statq/clips/clip_j_07.png" backup/scratch/refs-statq/spec_j_07.json
  ```
- **裁片**：`backup/scratch/refs-statq/clips/clip_j_07.png`（1061×907 px，129636 B，sha256 `bd714a793b74a8559ce5b1da95fe84edd40142f96941fc6ca21c73d9f167b8ac`）
- **亲读原文**：上海财经大学大学-432 统计学／上海财经大学-432 统计学-2023 年；一、选择题（每题 2 分，共 20 题，总 40 分）1、盒中共有 a 个白球，b 个黑球以及 c 个红球，现无放回摸球，则白球比黑球先被摸到的概率为 A. a/(a+b) …
- **结论**：上财 2023 章头**两行并存**且首行含衍字「上海财经大学大学」（真题册与解析册 p695 两处一致），判为原书排版/编校瑕疵，转录时保留原样并在索引中归一为 上海财经大学-432。
- **置信度**：**high**

### R18 · pdf p139，书内 p137

- **材料**：`参考文件/真题/统计/JYSG真题册_2026_02_01 (1).pdf`（JYSG 真题册（jysg））
- **页码**：PDF 第 139 页（书内 p137）
- **生成命令**：
  ```
  & "参考文件/_venv/Scripts/python.exe" backup\scratch\refs-statq\make_montage.py "参考文件/真题/统计/JYSG真题册_2026_02_01 (1).pdf" "backup/scratch/refs-statq/clips/clip_j_08.png" backup/scratch/refs-statq/spec_j_08.json
  ```
- **裁片**：`backup/scratch/refs-statq/clips/clip_j_08.png`（852×906 px，43072 B，sha256 `84b5dd8aef0547801f145d89292623e8c9b32f4fdf06711f2af420cf480351ca`）
- **亲读原文**：北大叉院-849 统计学-2023 年；一、灯泡 A1,A2 串联，它们的寿命分别是期望为 1/λ1,1/λ2 的指数分布。求…与期望。二、(X,Y) 的联合密度是 f(x,y)= c|xy|, |x|+|y|<1；0, 其他。
- **结论**：叉院 849 章头与两题题干确认；分段定义式（带花括号两支）与绝对值 |xy|、区域 |x|+|y|<1 必须读图，文本层无法区分大小于号。
- **置信度**：**high**

### R19 · pdf p157，书内 p155

- **材料**：`参考文件/真题/统计/JYSG真题册_2026_02_01 (1).pdf`（JYSG 真题册（jysg））
- **页码**：PDF 第 157 页（书内 p155）
- **生成命令**：
  ```
  & "参考文件/_venv/Scripts/python.exe" backup\scratch\refs-statq\make_montage.py "参考文件/真题/统计/JYSG真题册_2026_02_01 (1).pdf" "backup/scratch/refs-statq/clips/clip_j_08.png" backup/scratch/refs-statq/spec_j_08.json
  ```
- **裁片**：`backup/scratch/refs-statq/clips/clip_j_08.png`（852×906 px，43072 B，sha256 `84b5dd8aef0547801f145d89292623e8c9b32f4fdf06711f2af420cf480351ca`）
- **亲读原文**：（整页仅一行正文，居中下方）(2) 基于 θ̂ 给出 θ 的 1−α 最短置信区间.
- **结论**：低产页判定为**段末续行页**（上一页题干的第 (2) 问单独落到本页），非空白页；该页位列 low 类（<60 字符）但内容有效，已在页覆盖审计中登记。
- **置信度**：**high**

### R20 · pdf p240，书内 p238

- **材料**：`参考文件/真题/统计/JYSG真题册_2026_02_01 (1).pdf`（JYSG 真题册（jysg））
- **页码**：PDF 第 240 页（书内 p238）
- **生成命令**：
  ```
  & "参考文件/_venv/Scripts/python.exe" backup\scratch\refs-statq\make_montage.py "参考文件/真题/统计/JYSG真题册_2026_02_01 (1).pdf" "backup/scratch/refs-statq/clips/clip_j_09.png" backup/scratch/refs-statq/spec_j_09.json
  ```
- **裁片**：`backup/scratch/refs-statq/clips/clip_j_09.png`（1104×3534 px，376518 B，sha256 `cc375b54534b819626094487b3821e46714623e01fb75f2b12099e15499ed42a`）
- **亲读原文**：（整页除对角水印「公众号: 大师兄统计」与页眉外无任何正文）
- **结论**：**全页空白页**：判为排版留白（书末空页），不是缺页/漏页；页覆盖审计中记为 blank 类有效页。
- **置信度**：**high**

### R21 · pdf p241，书内 p239

- **材料**：`参考文件/真题/统计/JYSG真题册_2026_02_01 (1).pdf`（JYSG 真题册（jysg））
- **页码**：PDF 第 241 页（书内 p239）
- **生成命令**：
  ```
  & "参考文件/_venv/Scripts/python.exe" backup\scratch\refs-statq\make_montage.py "参考文件/真题/统计/JYSG真题册_2026_02_01 (1).pdf" "backup/scratch/refs-statq/clips/clip_j_09.png" backup/scratch/refs-statq/spec_j_09.json
  ```
- **裁片**：`backup/scratch/refs-statq/clips/clip_j_09.png`（1104×3534 px，376518 B，sha256 `cc375b54534b819626094487b3821e46714623e01fb75f2b12099e15499ed42a`）
- **亲读原文**：页眉 + 页心居中一张 500×360 图片，图像为彩色「九阳神功」四字 logo，无题面、无二维码信息。
- **结论**：末页判为**装饰页**（宣传图），非题目页；因此真题册正文实际止于 p239，p240–241 为尾部装饰。
- **置信度**：**high**

### R22 · pdf p31，书内 p29

- **材料**：`参考文件/真题/统计/JYSG真题册_2026_02_01 (1).pdf`（JYSG 真题册（jysg））
- **页码**：PDF 第 31 页（书内 p29）
- **生成命令**：
  ```
  & "参考文件/_venv/Scripts/python.exe" backup\scratch\refs-statq\make_montage.py "参考文件/真题/统计/JYSG真题册_2026_02_01 (1).pdf" "backup/scratch/refs-statq/clips/clip_ex_j.png" backup/scratch/refs-statq/spec_ex_j.json
  ```
- **裁片**：`backup/scratch/refs-statq/clips/clip_ex_j.png`（1261×3580 px，529752 B，sha256 `1de0009e29b9ff66d185f21cc8ac7da38310da79c30dd3d74691819789e44d62`）
- **亲读原文**：六、已知企业的边际成本 MC=10。国内市场消费者购买 x 单位商品获得的效用为 26x−2x²…七、已知某企业的产出函数为 y=16k−2k²…政府对生产要素进行征税，税率为 τ。假设政府的效用函数为 U=τk−0.25τ²…八、(1)(5') 尽管单场马拉松比赛的综合收益往往是亏损的，为何各地政府仍热衷于举办马拉松比赛?…九、假设小明的效用函数为 U(W)=60W−W²，其中 W 代表财富水平，定义域为 0≤W≤30。小明的初始财富为 W0=20。现有一张彩票，其收益分布为：以 50% 的概率获得 10 元，以 50% 的概率获得 0 元…
- **结论**：2026 章后半为微观经济学部分（第六–九大题），说明该章跨统计+微观两大科目；效用函数 U=60W−W² 与彩票参数（50%/10 元/0 元）是解析册 p119（R42）的输入，两侧判据一致。
- **置信度**：**high**

### R23 · pdf p44，书内 p42

- **材料**：`参考文件/真题/统计/JYSG真题册_2026_02_01 (1).pdf`（JYSG 真题册（jysg））
- **页码**：PDF 第 44 页（书内 p42）
- **生成命令**：
  ```
  & "参考文件/_venv/Scripts/python.exe" backup\scratch\refs-statq\make_montage.py "参考文件/真题/统计/JYSG真题册_2026_02_01 (1).pdf" "backup/scratch/refs-statq/clips/clip_ex_j.png" backup/scratch/refs-statq/spec_ex_j.json
  ```
- **裁片**：`backup/scratch/refs-statq/clips/clip_ex_j.png`（1261×3580 px，529752 B，sha256 `1de0009e29b9ff66d185f21cc8ac7da38310da79c30dd3d74691819789e44d62`）
- **亲读原文**：北京师范大学-432 统计学／北京师范大学-432 统计学-2016 年；一、选择题（15 分）1. 下面关于箱线图和算术平均数正确的是 ( )（箱线图：横轴 0–30，箱体约 12–18，中位线约 13.5）A. 平均数大于 15 B. 平均数等于 15 C. 平均数小于 15 D. 无法判断；2. 技术人员对某生产线上的产品每隔 100 件抽样一次，他使用的抽样方法是 ( )…5. 某校学生的成绩服从正态分布 X~N(μ,36)，在显著性水平 α=0.05 的情况下，则要使得估计 μ 的测量误差控制在 ±0.1 之内，需要多少样本量？A. 139 B. 2238 C. 48 D. 934。二、问答题 1. (10 分) 抽样调查的主要优点有哪些？2. (15 分) 某篮球队员工年龄为 37,35,32,28,27,27,24,22,19，写出这组数据的分析报告。3. (15 分) 一个罐子里有黑球和白球，有放回地抽取一个样本容量为 n 的样本，其中有 k 个白球，问：罐子里黑球和白球数之比 R 的极大似然估计量如何？
- **结论**：北师大 432 章头与选择题 1–5、问答题 1–3 全部可辨；箱线图是**纯图形题**（须读图判中位数与均值位置），第 5 题样本量由 1.96²×36/0.1²≈13829.76 ⇒ A.139 的估算链在该卷中成立。
- **置信度**：**high**


## 解析册（jiexi）

### R24 · pdf p7，书内 p5

- **材料**：`参考文件/真题/统计/解析册_2026_02_01 (1).pdf`（解析册（jiexi））
- **页码**：PDF 第 7 页（书内 p5）
- **生成命令**：
  ```
  & "参考文件/_venv/Scripts/python.exe" backup\scratch\refs-statq\make_montage.py "参考文件/真题/统计/解析册_2026_02_01 (1).pdf" "backup/scratch/refs-statq/clips/clip_x_01.png" backup/scratch/refs-statq/spec_x_01.json
  ```
- **裁片**：`backup/scratch/refs-statq/clips/clip_x_01.png`（796×906 px，86479 B，sha256 `338de138e9563e1ad3b3facb5d9a691e4ab8d0690c6691f3c8747c62058823d9`）
- **亲读原文**：北京大学光华-431 金融学统计／北京大学-431 金融学综合-2016／• 2016 统计部分解析；一、收集同一个公司两个市场的日回报率，其中 (x1,x2,…,xn) 为 A 市场…（页脚：书内页码 5）
- **结论**：解析册与真题册的章头同序同格式（仅「真题/解析」二字不同），且解析册 p7 = 书内 p5；两册按序配对（113/113 assert 通过）由此得到页级证据。
- **置信度**：**high**

### R25 · pdf p30，书内 p28

- **材料**：`参考文件/真题/统计/解析册_2026_02_01 (1).pdf`（解析册（jiexi））
- **页码**：PDF 第 30 页（书内 p28）
- **生成命令**：
  ```
  & "参考文件/_venv/Scripts/python.exe" backup\scratch\refs-statq\make_montage.py "参考文件/真题/统计/解析册_2026_02_01 (1).pdf" "backup/scratch/refs-statq/clips/clip_x_01.png" backup/scratch/refs-statq/spec_x_01.json
  ```
- **裁片**：`backup/scratch/refs-statq/clips/clip_x_01.png`（796×906 px，86479 B，sha256 `338de138e9563e1ad3b3facb5d9a691e4ab8d0690c6691f3c8747c62058823d9`）
- **亲读原文**：北京大学-431 金融学综合-2018／2018 统计部分解析；一、(15 分) 解释或回答以下概念及问题：(1)(5 分) 随机变量 X 和 Y 的相关性。(2)(5 分) 随机变量 X 和 Y 的独立性。(3)(5 分) 如果 X 和 Y 不相关，那么 X 和 Y 是否独立？请具体论述。
- **结论**：2018 章头与三小问分值（5+5+5=15）确认；解析册章头年份与真题册同章严格一致。
- **置信度**：**high**

### R26 · pdf p56，书内 p54

- **材料**：`参考文件/真题/统计/解析册_2026_02_01 (1).pdf`（解析册（jiexi））
- **页码**：PDF 第 56 页（书内 p54）
- **生成命令**：
  ```
  & "参考文件/_venv/Scripts/python.exe" backup\scratch\refs-statq\make_montage.py "参考文件/真题/统计/解析册_2026_02_01 (1).pdf" "backup/scratch/refs-statq/clips/clip_x_02.png" backup/scratch/refs-statq/spec_x_02.json
  ```
- **裁片**：`backup/scratch/refs-statq/clips/clip_x_02.png`（1002×907 px，104559 B，sha256 `207213dea8312cffb680ed5d71a934bedf17f58e3ac460e9d4ff4d9f23ad869a`）
- **亲读原文**：北京大学-431 金融学综合-2021／2021 统计部分解析；一、(20 分) 设 (X,Y) 的密度函数是 f(x,y)=2(x+y)，0≤x≤y≤1。(1)(10 分) 求 X,Y 的边际分布；(2)(10 分) 求 X+Y 的分布。
- **结论**：解析册复现真题册 p19（R03）题面完全一致 —— 两册同题面互为转录校验，是该族最强一致性证据。
- **置信度**：**high**

### R27 · pdf p637，书内 p635

- **材料**：`参考文件/真题/统计/解析册_2026_02_01 (1).pdf`（解析册（jiexi））
- **页码**：PDF 第 637 页（书内 p635）
- **生成命令**：
  ```
  & "参考文件/_venv/Scripts/python.exe" backup\scratch\refs-statq\make_montage.py "参考文件/真题/统计/解析册_2026_02_01 (1).pdf" "backup/scratch/refs-statq/clips/clip_x_02.png" backup/scratch/refs-statq/spec_x_02.json
  ```
- **裁片**：`backup/scratch/refs-statq/clips/clip_x_02.png`（1002×907 px，104559 B，sha256 `207213dea8312cffb680ed5d71a934bedf17f58e3ac460e9d4ff4d9f23ad869a`）
- **亲读原文**：…并按多数人的意见做出决策，则做出正确决策的概率是（）(A) 0.5 (B) 0.6 (C) 2/3 (D) 0.7。Solution: A；当有两个以上的顾问做出正确决策的时候，最终做出正确决策 P = 0.5³ + C₃²×0.5²×(1−0.5) = 0.5，A 正确。二、简答题 1. 有来自 U(0,θ) 的简单随机样本，试求样本极差 Rn=x(n)−x(1) 的分布。Solution: 总体的密度函数是 f(x)=(1/θ)I(0,θ)，分布函数是 F(x)={0, x<0; x/θ, 0≤x<θ}，则 (x(1),x(n))…
- **结论**：选项与官方答案（A、0.5）确认；三顾问多数投票的 0.5³+C₃²·0.5²·0.5 计算式与结论自洽；简答题极差分布给出序统计量联合密度路径。
- **置信度**：**high**

### R28 · pdf p51，书内 p49

- **材料**：`参考文件/真题/统计/解析册_2026_02_01 (1).pdf`（解析册（jiexi））
- **页码**：PDF 第 51 页（书内 p49）
- **生成命令**：
  ```
  & "参考文件/_venv/Scripts/python.exe" backup\scratch\refs-statq\make_montage.py "参考文件/真题/统计/解析册_2026_02_01 (1).pdf" "backup/scratch/refs-statq/clips/clip_x_03.png" backup/scratch/refs-statq/spec_x_03.json
  ```
- **裁片**：`backup/scratch/refs-statq/clips/clip_x_03.png`（944×907 px，152204 B，sha256 `b2ed49ccc0d2583b8dfac22d860095115e140c62352a1749f5b9f9c7ca8997ac`）
- **亲读原文**：· 2020 微观部分解析；一、(15 分) B 城市的市民有两种出行方式：公共交通和私家车…市民从出行中获得的效用为 u(x1,x2)=x1^0.2 x2^0.8。现在专家提出，为缓解高峰时段公共交通运力不足，建议取消公共交通价格补贴，使得价格…
- **结论**：解析册 p51 与真题册 p17（R04）为同题两面：真题册给出参数（p1、p2、50%），解析册给出建模方向，合并可完整转录该题。
- **置信度**：**high**

### R29 · pdf p124，书内 p122

- **材料**：`参考文件/真题/统计/解析册_2026_02_01 (1).pdf`（解析册（jiexi））
- **页码**：PDF 第 124 页（书内 p122）
- **生成命令**：
  ```
  & "参考文件/_venv/Scripts/python.exe" backup\scratch\refs-statq\make_montage.py "参考文件/真题/统计/解析册_2026_02_01 (1).pdf" "backup/scratch/refs-statq/clips/clip_x_03.png" backup/scratch/refs-statq/spec_x_03.json
  ```
- **裁片**：`backup/scratch/refs-statq/clips/clip_x_03.png`（944×907 px，152204 B，sha256 `b2ed49ccc0d2583b8dfac22d860095115e140c62352a1749f5b9f9c7ca8997ac`）
- **亲读原文**：因此 fU,V(u,v) = v·fX,Y(uv,(1−u)v) = u^{m/2−1}(1−u)^{n/2−1}/(Γ(m/2)Γ(n/2))·(1/2)^{m/2+n/2−1}·e^{−v/2}，故 fV(u) = ∫₀^{+∞} fU,V(u,v)dv = Γ((m+n)/2)/(Γ(m/2)Γ(n/2))·u^{m/2−1}(1−u)^{n/2−1} ~ Beta(m/2, n/2)。三、(20 分) X1,X2 i.i.d.~N(0,1)，求 X1/X2 的概率分布。Solution: 记 U=X1²+X2², V=X1/X2，⇔ u=x1²+x2², v=x1/x2；反函数有 2 支 x1=v√(u/(1+v²)), x2=√(u/(1+v²))（或取负）。
- **结论**：F 分布推导链（Beta 密度与卷积上限 +∞）与 X1/X2 变量变换的双支反函数确认；此题在文本层碎片极密（p124 共 29 行碎片），必须读图，重推清单第 4 项据此建立。
- **置信度**：**high**

### R30 · pdf p471，书内 p469

- **材料**：`参考文件/真题/统计/解析册_2026_02_01 (1).pdf`（解析册（jiexi））
- **页码**：PDF 第 471 页（书内 p469）
- **生成命令**：
  ```
  & "参考文件/_venv/Scripts/python.exe" backup\scratch\refs-statq\make_montage.py "参考文件/真题/统计/解析册_2026_02_01 (1).pdf" "backup/scratch/refs-statq/clips/clip_x_04.png" backup/scratch/refs-statq/spec_x_04.json
  ```
- **裁片**：`backup/scratch/refs-statq/clips/clip_x_04.png`（959×907 px，110892 B，sha256 `d1c8d07f3fa1e5a801ef4d7b531742f6a40b5c5a3eb237bd7e526c3fa5088d6f`）
- **亲读原文**：因此 Cov(Σᵢ₌₁^{X0} Xi, Σᵢ₌₁^{X0} X_{X0+i}) = (2−p)/p⁴ − 1/p⁴ = (1−p)/p⁴。十、(15 分) 设随机变量 X 服从 [θ−ρ, θ+ρ] 上的均匀分布，试求 θ 和 ρ 的极大似然估计，并说明其极大似然估计是否为无偏估计，并证明你的结论。Solution: 作一一变换 {a=θ−ρ, b=θ+ρ}，则 {θ=(a+b)/2, ρ=(b−a)/2}，且总体 X~U(a,b)，于是似然函数 L(a,b)=1/(b−a)ⁿ·I{x(0)≥a}·I{x(n)≤b}…
- **结论**：协方差计算式与 MLE 变换路径确认；指示函数 I{·} 与序统计量下标在文本层碎裂，读图后重建。
- **置信度**：**high**

### R31 · pdf p630，书内 p628

- **材料**：`参考文件/真题/统计/解析册_2026_02_01 (1).pdf`（解析册（jiexi））
- **页码**：PDF 第 630 页（书内 p628）
- **生成命令**：
  ```
  & "参考文件/_venv/Scripts/python.exe" backup\scratch\refs-statq\make_montage.py "参考文件/真题/统计/解析册_2026_02_01 (1).pdf" "backup/scratch/refs-statq/clips/clip_x_04.png" backup/scratch/refs-statq/spec_x_04.json
  ```
- **裁片**：`backup/scratch/refs-statq/clips/clip_x_04.png`（959×907 px，110892 B，sha256 `d1c8d07f3fa1e5a801ef4d7b531742f6a40b5c5a3eb237bd7e526c3fa5088d6f`）
- **亲读原文**：（第 9 题四选项）B. S1²/S2² / F_{α/2}(n1−1,n2−1) ≤ σ1²/σ2² ≤ S1²/S2² · F_{α/2}(n2−1,n1−1)。Solution: B；注意这里用的应是上分位数，根据 F 分布的对称性，置信区间应为 [S1²/S2² / F_{α/2}(n1−1,n2−1), S1²/S2² · F_{α/2}(n2−1,n1−1)]。
- **结论**：官方答案 B 与真题册 p215（R12）四选项逐一对应，两册交叉确认该题正确答案；「上分位数 + F 分布对称性」的注释是重推清单第 6 项的依据。
- **置信度**：**high**

### R32 · pdf p573，书内 p571

- **材料**：`参考文件/真题/统计/解析册_2026_02_01 (1).pdf`（解析册（jiexi））
- **页码**：PDF 第 573 页（书内 p571）
- **生成命令**：
  ```
  & "参考文件/_venv/Scripts/python.exe" backup\scratch\refs-statq\make_montage.py "参考文件/真题/统计/解析册_2026_02_01 (1).pdf" "backup/scratch/refs-statq/clips/clip_x_05.png" backup/scratch/refs-statq/spec_x_05.json
  ```
- **裁片**：`backup/scratch/refs-statq/clips/clip_x_05.png`（1079×907 px，110423 B，sha256 `21923d6e8ecaf02e76d38af00880b417735f7305f0ca08f914fe7a00f41fccf9`）
- **亲读原文**：E(X̄)+(1−a)E(S²) = aθ+(1−a)θ = θ，于是 Y 恒为 θ 的无偏估计，与 a 的取值无关，所以选…；16. X1,…,Xn 为来自均值为 0、方差为 σ² 的总体的简单随机样本，令 Y=Σᵢ₌₁ⁿXi², Q=Σᵢ₌₁ⁿ(Xi−X̄)²…(A) Q/n 是 σ² 的最大似然估计 (B) Y/n 是 σ² 的最大似然估计 (C) Q/n 是 σ² 的无偏估计 (D) Y/n 是 σ² 的无偏估计。
- **结论**：第 15 题（真题册 p174 = R09）的解答与第 16 题的四个选项均确认；Y 对任意 a 恒为无偏是「被除项抵消」的机制，可据两册合并成完整题目+答案。
- **置信度**：**high**

### R33 · pdf p647，书内 p645

- **材料**：`参考文件/真题/统计/解析册_2026_02_01 (1).pdf`（解析册（jiexi））
- **页码**：PDF 第 647 页（书内 p645）
- **生成命令**：
  ```
  & "参考文件/_venv/Scripts/python.exe" backup\scratch\refs-statq\make_montage.py "参考文件/真题/统计/解析册_2026_02_01 (1).pdf" "backup/scratch/refs-statq/clips/clip_x_05.png" backup/scratch/refs-statq/spec_x_05.json
  ```
- **裁片**：`backup/scratch/refs-statq/clips/clip_x_05.png`（1079×907 px，110423 B，sha256 `21923d6e8ecaf02e76d38af00880b417735f7305f0ca08f914fe7a00f41fccf9`）
- **亲读原文**：Solution: C；容易计算 (82+87)/2 = 84.5。6. 下列描述分布离散程度的统计量中，哪一个具有稳健性（）A. 标准差 B. 四分位差 C. 极差 D. 变异系数。Solution: B；四分位差受极端值影响最小，类似于中位数。7. 在某公司进行的英语水平测试中，新员工的平均得分是 80 分，标准差是 5 分，中位数是 85 分…
- **结论**：答案 C/B 与理由确认；「四分位差稳健」与「均值<中位数⇒左偏」的判定链可直接用于选择题答案校对。
- **置信度**：**high**

### R34 · pdf p657，书内 p655

- **材料**：`参考文件/真题/统计/解析册_2026_02_01 (1).pdf`（解析册（jiexi））
- **页码**：PDF 第 657 页（书内 p655）
- **生成命令**：
  ```
  & "参考文件/_venv/Scripts/python.exe" backup\scratch\refs-statq\make_montage.py "参考文件/真题/统计/解析册_2026_02_01 (1).pdf" "backup/scratch/refs-statq/clips/clip_x_06.png" backup/scratch/refs-statq/spec_x_06.json
  ```
- **裁片**：`backup/scratch/refs-statq/clips/clip_x_06.png`（1086×907 px，136550 B，sha256 `48810685eed68303d631c7f4a597456867aec3fa13f57ccf99ed9e4142047c38`）
- **亲读原文**：7. 区间估计中 95% 的置信水平是指（）A. 总体参数落在一个特定的样本所构造的区间内的概率为 95% B. 总体参数落在一个特定的样本所构造的区间内的概率为 5% C. 在用同样方法构造的总体参数的多个区间中，包含总体参数的区间比例为 95% D. 在用同样方法构造的总体参数的多个区间中，包含总体参数的区间比例为 5%。Solution: C；A 的错误在于特定样本，当样本给定时，区间不具有随机性，则要么包含真实参数，要么不包含。8. 假设检验中使用 p 值进行决策的优势是（）…
- **结论**：置信水平频率解释的官方答案 C 与错误项诊断（区间随机性）确认 —— 这是本族最常见的概念易错点，可直接作为概念题答案基准。
- **置信度**：**high**

### R35 · pdf p422，书内 p420

- **材料**：`参考文件/真题/统计/解析册_2026_02_01 (1).pdf`（解析册（jiexi））
- **页码**：PDF 第 422 页（书内 p420）
- **生成命令**：
  ```
  & "参考文件/_venv/Scripts/python.exe" backup\scratch\refs-statq\make_montage.py "参考文件/真题/统计/解析册_2026_02_01 (1).pdf" "backup/scratch/refs-statq/clips/clip_x_06.png" backup/scratch/refs-statq/spec_x_06.json
  ```
- **裁片**：`backup/scratch/refs-statq/clips/clip_x_06.png`（1086×907 px，136550 B，sha256 `48810685eed68303d631c7f4a597456867aec3fa13f57ccf99ed9e4142047c38`）
- **亲读原文**：北京大学数院-431 金融学综合-2017 年；一、(10 分) 事件 A,B 独立，P(A−B)=1/4, P(B−A)=1/6，求 P(A),P(B)。Solution: 根据题意，有 P(A−B)=P(A)−P(AB)=1/4；P(B−A)=P(B)−P(AB)=1/6；又 AB 独立…故 P(A)=1/3, P(B)=1/4，或 P(A)=3/4, P(B)=2/3。
- **结论**：北大数院 431 章头确认；该题有**两组解**（对称性导致），转录必须保留两组答案，否则答案判分会漏。
- **置信度**：**high**

### R36 · pdf p508，书内 p506

- **材料**：`参考文件/真题/统计/解析册_2026_02_01 (1).pdf`（解析册（jiexi））
- **页码**：PDF 第 508 页（书内 p506）
- **生成命令**：
  ```
  & "参考文件/_venv/Scripts/python.exe" backup\scratch\refs-statq\make_montage.py "参考文件/真题/统计/解析册_2026_02_01 (1).pdf" "backup/scratch/refs-statq/clips/clip_x_07.png" backup/scratch/refs-statq/spec_x_07.json
  ```
- **裁片**：`backup/scratch/refs-statq/clips/clip_x_07.png`（1104×906 px，104023 B，sha256 `5747b677fc80d97af8a3ae5d5fc6568ffd3b002410a871a267e05cacae329d5f`）
- **亲读原文**：Solution: 0 因为 X 和 Y 的边际密度函数在对称区间上为偶函数，则 X 和 Y 的期望为 0；所以 Cov(X,Y)=EXY=(1/π)∫∫xy dx dy=0，即 X 和 Y 的相关系数为 0。6. 已知双参数指数分布随机变量 X 具有密度函数 f(x)=λe^{−λ(x−a)}，其中 x>a，则 EX=___，Var(X)=___。Solution: 1/λ+a；1/λ²。X−a 服从参数为 λ 的单参数指数分布…EX=a+1/λ, Var(X)=1/λ²。
- **结论**：协方差为 0 的机制（偶函数边际）与双参数指数分布的平移不变性确认；填空答案 1/λ+a、1/λ² 明确。
- **置信度**：**high**

### R37 · pdf p225，书内 p223

- **材料**：`参考文件/真题/统计/解析册_2026_02_01 (1).pdf`（解析册（jiexi））
- **页码**：PDF 第 225 页（书内 p223）
- **生成命令**：
  ```
  & "参考文件/_venv/Scripts/python.exe" backup\scratch\refs-statq\make_montage.py "参考文件/真题/统计/解析册_2026_02_01 (1).pdf" "backup/scratch/refs-statq/clips/clip_x_07.png" backup/scratch/refs-statq/spec_x_07.json
  ```
- **裁片**：`backup/scratch/refs-statq/clips/clip_x_07.png`（1104×906 px，104023 B，sha256 `5747b677fc80d97af8a3ae5d5fc6568ffd3b002410a871a267e05cacae329d5f`）
- **亲读原文**：北京师范大学-432 统计学-2026 年；一、(20) 设 X 为非负取值连续型随机变量，f(x) 为其密度函数…仅收集到以下信息（其中 n1,n2,n3,n4 及 a>0 均为已知常数）：(1) 据此给出 f(x) 的一种估计 f̂(x)；(2) 若 Y 的密度恰好为 f̂(x)，计算 Y 的期望和众数。表格：取值范围 [0,a) [a,2a) [2a,4a) [4a,5a)／观测频数 n1 n2 n3 n4。
- **结论**：北师大 2026 章头与分组表格确认；直方图估计题依赖区间端点（2a/4a/5a）读图还原，是重推清单第 7 项（分段密度 + 期望/众数）的依据。
- **置信度**：**high**

### R38 · pdf p695，书内 p693

- **材料**：`参考文件/真题/统计/解析册_2026_02_01 (1).pdf`（解析册（jiexi））
- **页码**：PDF 第 695 页（书内 p693）
- **生成命令**：
  ```
  & "参考文件/_venv/Scripts/python.exe" backup\scratch\refs-statq\make_montage.py "参考文件/真题/统计/解析册_2026_02_01 (1).pdf" "backup/scratch/refs-statq/clips/clip_x_08.png" backup/scratch/refs-statq/spec_x_08.json
  ```
- **裁片**：`backup/scratch/refs-statq/clips/clip_x_08.png`（813×906 px，44366 B，sha256 `0edb2b29da6c4886cff386beca8a70de3926772d30b4c8cb0f16c7b1fe69ce47`）
- **亲读原文**：上海财经大学大学-432 统计学／上海财经大学-432 统计学-2023 年；一、选择题（每题 2 分，共 20 题，总 40 分）1、盒中共有 a 个白球，b 个黑球以及 c 个红球，现无放回摸球，则白球比黑球…A. a/(a+b) B. b/(a+b)。
- **结论**：解析册与真题册（R17）同现两行章头与衍字「大学大学」，两册一致 ⇒ 判为原书问题而非扫描噪点，转录时保留原样并在索引层归一。
- **置信度**：**high**

### R39 · pdf p135，书内 p133

- **材料**：`参考文件/真题/统计/解析册_2026_02_01 (1).pdf`（解析册（jiexi））
- **页码**：PDF 第 135 页（书内 p133）
- **生成命令**：
  ```
  & "参考文件/_venv/Scripts/python.exe" backup\scratch\refs-statq\make_montage.py "参考文件/真题/统计/解析册_2026_02_01 (1).pdf" "backup/scratch/refs-statq/clips/clip_x_08.png" backup/scratch/refs-statq/spec_x_08.json
  ```
- **裁片**：`backup/scratch/refs-statq/clips/clip_x_08.png`（813×906 px，44366 B，sha256 `0edb2b29da6c4886cff386beca8a70de3926772d30b4c8cb0f16c7b1fe69ce47`）
- **亲读原文**：（整页仅末行一段，其余区域全空）即标准柯西分布.
- **结论**：低产页判为**段末续行页**（X1/X2 服从标准柯西分布的结论句落到本页），非空白；与真题册 p157（R19）同属「单行续页」类。
- **置信度**：**high**

### R40 · pdf p707，书内 p705

- **材料**：`参考文件/真题/统计/解析册_2026_02_01 (1).pdf`（解析册（jiexi））
- **页码**：PDF 第 707 页（书内 p705）
- **生成命令**：
  ```
  & "参考文件/_venv/Scripts/python.exe" backup\scratch\refs-statq\make_montage.py "参考文件/真题/统计/解析册_2026_02_01 (1).pdf" "backup/scratch/refs-statq/clips/clip_x_09.png" backup/scratch/refs-statq/spec_x_09.json
  ```
- **裁片**：`backup/scratch/refs-statq/clips/clip_x_09.png`（1104×3534 px，376476 B，sha256 `711608b0c1e4fb4b807476f8a0c8766bac3de15b961465168ce69c59540c8111`）
- **亲读原文**：（整页除对角水印「公众号: 大师兄统计」与页眉外无任何正文）
- **结论**：**全页空白页**（解析册书末留白），页覆盖审计记为 blank 类有效页。
- **置信度**：**high**

### R41 · pdf p708，书内 p706

- **材料**：`参考文件/真题/统计/解析册_2026_02_01 (1).pdf`（解析册（jiexi））
- **页码**：PDF 第 708 页（书内 p706）
- **生成命令**：
  ```
  & "参考文件/_venv/Scripts/python.exe" backup\scratch\refs-statq\make_montage.py "参考文件/真题/统计/解析册_2026_02_01 (1).pdf" "backup/scratch/refs-statq/clips/clip_x_09.png" backup/scratch/refs-statq/spec_x_09.json
  ```
- **裁片**：`backup/scratch/refs-statq/clips/clip_x_09.png`（1104×3534 px，376476 B，sha256 `711608b0c1e4fb4b807476f8a0c8766bac3de15b961465168ce69c59540c8111`）
- **亲读原文**：页眉 + 页心居中一张 500×360 图片，图像为彩色「九阳神功」logo。
- **结论**：解析册末页同为装饰页；与真题册 p241（R21）成对，说明两册尾部两页均非题目内容。
- **置信度**：**high**

### R42 · pdf p119，书内 p117

- **材料**：`参考文件/真题/统计/解析册_2026_02_01 (1).pdf`（解析册（jiexi））
- **页码**：PDF 第 119 页（书内 p117）
- **生成命令**：
  ```
  & "参考文件/_venv/Scripts/python.exe" backup\scratch\refs-statq\make_montage.py "参考文件/真题/统计/解析册_2026_02_01 (1).pdf" "backup/scratch/refs-statq/clips/clip_ex_x.png" backup/scratch/refs-statq/spec_ex_x.json
  ```
- **裁片**：`backup/scratch/refs-statq/clips/clip_ex_x.png`（1261×3580 px，411513 B，sha256 `cdc8dae95331b42fb1f94b938dbe975cc93e973b81698d1f2c015c0f0f6af9d5`）
- **亲读原文**：Risk Premium = E[彩票] − P_s；绝对风险规避系数 R_A(W) = −U''(W)/U'(W)；本题中的效用函数 U(W)=60W−W²，代入可得 R_A(W) = 1/(30−W)；对该系数关于财富 W 求导：R_A'(W) = 1/(30−W)² > 0；P_s = E[彩票] − Risk Premium…
- **结论**：2026 微观部分解析（北大 431）与真题册 p31（R22）的彩票题一一对应；解析给出财富增加型绝对风险规避（R_A' > 0）与保留价格关系，两侧判据一致。
- **置信度**：**high**

### R43 · pdf p232，书内 p230

- **材料**：`参考文件/真题/统计/解析册_2026_02_01 (1).pdf`（解析册（jiexi））
- **页码**：PDF 第 232 页（书内 p230）
- **生成命令**：
  ```
  & "参考文件/_venv/Scripts/python.exe" backup\scratch\refs-statq\make_montage.py "参考文件/真题/统计/解析册_2026_02_01 (1).pdf" "backup/scratch/refs-statq/clips/clip_ex_x.png" backup/scratch/refs-statq/spec_ex_x.json
  ```
- **裁片**：`backup/scratch/refs-statq/clips/clip_ex_x.png`（1261×3580 px，411513 B，sha256 `cdc8dae95331b42fb1f94b938dbe975cc93e973b81698d1f2c015c0f0f6af9d5`）
- **亲读原文**：中国科学技术大学-432 统计学／中国科学技术大学-432 统计学-2016 年；一、(每小题 8 分，共 56 分) 1. 设 P(X1=−1)=P(X1=1)=1/4, P(X1=0)=1/2, i=1,2，且 P(X1X2=0)=1，求 P(X1=X2)。Solution: 写出 (X1,X2) 的联合分布列…于是可得 P(X1=X2)=ΣᵢP(X1=i,X2=i)=0 (i=−1,0,1)。2. 设 A 与 B 为两个随机事件，满足 P(A)=1/4, P(B|A)=1/3 和 P(A|B)=1/2。定义 X=1 若 A 发生…求 (X,Y) 的分布律。3. 设三维随机向量 (X1,X2,X3) 的协方差矩阵为 (9 1 −2; 1 20 3; −2 3 12)，定义 Y1=2X1+3X2+X3, Y2=X1−2X2+5X3, Y3=X2−X3，求 (Y1,Y2,Y3) 的协方差矩阵。
- **结论**：中科大 432 章头与前三题（含联合分布列表格、条件概率反解 P(AB)=1/12、协方差矩阵线性变换）确认；矩阵元素与变换系数必须读图，文本层会把矩阵压成一行。
- **置信度**：**high**


## 合集（heji）

### R44 · pdf p7

- **材料**：`参考文件/真题/统计/合集-00-15-统计-部分有答案.pdf`（合集（heji））
- **页码**：PDF 第 7 页
- **生成命令**：
  ```
  & "参考文件/_venv/Scripts/python.exe" backup\scratch\refs-statq\native_stack.py "参考文件/真题/统计/合集-00-15-统计-部分有答案.pdf" 7 "backup/scratch/refs-statq/clips/native_h_p7.png"
  ```
- **裁片**：`backup/scratch/refs-statq/clips/native_h_p7.png`（1088×1701 px，353363 B，sha256 `5264c2bed4c9d4515520ae9fce727277affd494ff2ca2f0c9077fedf7284db0b`）
- **亲读原文**：启用前机密　北京大学 2004 年硕士研究生入学考试试题／考试科目：统计学　考试时间：1 月 11 日下午／招生专业：统计学／（答案一律写在答题纸上，否则不计分）…一、简要回答以下问题(每小题 5 分，共计 30 分)：(1) 增加值和净产值的区别与联系；(2) 据统计我国恩格尔系数有下降的趋势，这说明什么问题?…(3) 什么是时点数?什么是时期数?…(4) 在编制组距数列时，应考虑哪些问题?…二、(20 分) 某公司新推出一种营养型豆奶…三、(20 分) 请你编制三个组距变量数列…四、(15 分) 设总体 X 服从正态分布 N(μ,0.3²)…五、(15 分) X1,X2,…,Xn 是独立同分布的 Poisson(λ) 变量…六、(10 分) 假设 X1,…,Xn 和 Y1,…,Ym 是两组独立同方差的正态…H0: 2μX = 3μY　H1: 2μX ≠ 3μY。
- **结论**：**2004 年北大统计学卷全文只存在于 p7/p8 的 7 张嵌入图里**（文本层该页仅 10 字符）：必须用 native_stack.py 按原生分辨率拼贴才能读全；p7 含第一–六题（含右上角水印「光华人 向上的精神 www.gsmer.net」）。
- **置信度**：**high**

### R45 · pdf p8

- **材料**：`参考文件/真题/统计/合集-00-15-统计-部分有答案.pdf`（合集（heji））
- **页码**：PDF 第 8 页
- **生成命令**：
  ```
  & "参考文件/_venv/Scripts/python.exe" backup\scratch\refs-statq\native_stack.py "参考文件/真题/统计/合集-00-15-统计-部分有答案.pdf" 8 "backup/scratch/refs-statq/clips/native_h_p8.png"
  ```
- **裁片**：`backup/scratch/refs-statq/clips/native_h_p8.png`（968×1167 px，289553 B，sha256 `e72cdb711416c812be59dd799fc4c777cbc0ab11849e64ddca5b426e22b6fa2b`）
- **亲读原文**：七、(10 分) 考虑如下线性模型：yi = αxi² + xiεi, i=1,…,n，其中 xi>0 而且 εi 是独立同分布的 N(0,σ²)…八、(10 分) Scott 公司进行了一项市场份额的研究。在过去的一年里，公司 A 的市场份额稳定在 30%，公司 B 在 50%，公司 C 在 20%…结果 48 人选择了 A，98 人选择了 B，54 人选择了 C…九、(20 分) 设总体的分布为 N(0,θ), 0<θ<∞…(1) 试求 θ 的最大似然估计 θ̂；(2) 讨论 θ̂ 的无偏性；(3) 试求 θ̂ 的方差；(4) 试求时 n→∞ 时 θ̂ 的抽样分布。考试中可能用到的分位数：z_{0.025}=1.96…χ²_{0.05}(2)=5.991，χ²_{0.05}(3)=7.815。
- **结论**：2004 卷后半（第七–九题 + 分位数表）同样只存在于嵌入图；p7+p8 合并后该卷 9 题完整，可整卷入库（答案页在解析册中无对应，需单独标注「无官方答案」）。
- **置信度**：**high**

### R46 · pdf p21

- **材料**：`参考文件/真题/统计/合集-00-15-统计-部分有答案.pdf`（合集（heji））
- **页码**：PDF 第 21 页
- **生成命令**：
  ```
  & "参考文件/_venv/Scripts/python.exe" backup\scratch\refs-statq\make_montage.py "参考文件/真题/统计/合集-00-15-统计-部分有答案.pdf" "backup/scratch/refs-statq/clips/clip_h_02.png" backup/scratch/refs-statq/spec_h_02.json
  ```
- **裁片**：`backup/scratch/refs-statq/clips/clip_h_02.png`（1261×2243 px，48777 B，sha256 `56f6d5d649ba2b4755b1b80bba900e8a91a1f97ecb5cda840e0b89312d24a68e`）
- **亲读原文**：（拼贴第 1 片整页为白；PDF 页面对象 /Contents 145 0 R 共 123 字节，内容流仅 `[( )] TJ`，字体表已注册 Times New Roman F1 但无任何绘制文字）
- **结论**：p21 判为**PDF 空白占位页**（非缺页、非扫描丢失）；拼贴图中的红色 label 行是本工具绘制的标注，不属于页面内容，读图时须忽略。
- **置信度**：**high**

### R47 · pdf p1

- **材料**：`参考文件/真题/统计/合集-00-15-统计-部分有答案.pdf`（合集（heji））
- **页码**：PDF 第 1 页
- **生成命令**：
  ```
  & "参考文件/_venv/Scripts/python.exe" backup\scratch\refs-statq\make_montage.py "参考文件/真题/统计/合集-00-15-统计-部分有答案.pdf" "backup/scratch/refs-statq/clips/clip_h_02.png" backup/scratch/refs-statq/spec_h_02.json
  ```
- **裁片**：`backup/scratch/refs-statq/clips/clip_h_02.png`（1261×2243 px，48777 B，sha256 `56f6d5d649ba2b4755b1b80bba900e8a91a1f97ecb5cda840e0b89312d24a68e`）
- **亲读原文**：北京大学 2000 年研究生入学考试统计学试题；1、设简单随机样本 (X1,Y1),(X2,Y2),…,(Xn,Yn) 满足等式 Σᵢ₌₁ⁿXi = Σᵢ₌₁ⁿYi = 0；Σᵢ₌₁ⁿXi² = Σᵢ₌₁ⁿYi² = 0，而且 X 和 Y 之间的样本相关系数为 r，试写出 Y 对 X 的回归方程。（10 分）
- **结论**：合集 p1 = 2000 年北大学硕卷首题；该页文本层 Σ 以真 ∑ 呈现（与 JYSG 两册的 `Pn i=1` 不同），说明两批文件的 PDF 生成链不同，转录时不可统一假设。
- **置信度**：**high**

### R48 · pdf p10

- **材料**：`参考文件/真题/统计/合集-00-15-统计-部分有答案.pdf`（合集（heji））
- **页码**：PDF 第 10 页
- **生成命令**：
  ```
  & "参考文件/_venv/Scripts/python.exe" backup\scratch\refs-statq\make_montage.py "参考文件/真题/统计/合集-00-15-统计-部分有答案.pdf" "backup/scratch/refs-statq/clips/clip_ex_h.png" backup/scratch/refs-statq/spec_ex_h.json
  ```
- **裁片**：`backup/scratch/refs-statq/clips/clip_ex_h.png`（1261×3581 px，521667 B，sha256 `d53ded2aed1f2e68a88d9f63b89607230ef2a26253f4783ce30c56ec55d3158e`）
- **亲读原文**：…{ p(X=1)=θ^{n−1}; p(X=k)=(1−θ)θ^{k−2}, k=2,…,n, 0≤θ≤1 }…当 l<m 时，似然函数 L=(1−θ)^{m−l}θ^{Σ+(n−2)l}…得到似然方程 Σ+(n−2)l/θ − (m−l)/(1−θ) = 0，进而 θ̂ = (m−l)/(m+Σ+(n−3)l)。五、假定随机变量 Y 满足 Y=βx+ε…要求证明最小二乘法估计出的线性回归参数 b=l_xy/l_xx 是 β 的无偏估计；…统计量 Z=(1/n)Σ(yi/xi)…D(b)=σ²/Σxi²；D(Z)=(1/n²)Σσ²/xi²；根据柯西不等式…Σxi²·Σ1/xi² ≥ n²，因此 D(Z) > D(b)。
- **结论**：p10 是碎片最密页之一（20 行 Σ 被拆）；读图后确认 MLE 解与回归估计有效性比较的完整推导，其中 D(Z)>D(b) 的柯西不等式判据是重推清单第 5 项。
- **置信度**：**high**

### R49 · pdf p5

- **材料**：`参考文件/真题/统计/合集-00-15-统计-部分有答案.pdf`（合集（heji））
- **页码**：PDF 第 5 页
- **生成命令**：
  ```
  & "参考文件/_venv/Scripts/python.exe" backup\scratch\refs-statq\make_montage.py "参考文件/真题/统计/合集-00-15-统计-部分有答案.pdf" "backup/scratch/refs-statq/clips/clip_ex_h.png" backup/scratch/refs-statq/spec_ex_h.json
  ```
- **裁片**：`backup/scratch/refs-statq/clips/clip_ex_h.png`（1261×3581 px，521667 B，sha256 `d53ded2aed1f2e68a88d9f63b89607230ef2a26253f4783ce30c56ec55d3158e`）
- **亲读原文**：2003 年硕士研究生入学考试试题；1、(25 分) 按照要求回答下面各个问题：(1) (10 分) 在统计调查方案的制定过程中应考虑哪些问题(按序排列)…(3) (5 分) 如果机构厂有四个流水作业的车间…第一车间制品合格率为 98%…求车间平均产品的合格率。2、(15 分) 已知某厂下列资料（月初工人数 2000/2200/2200/2200，增加值(万元) 220/252/292/326）…3、(15 分) MPS 核算中的社会总产值和 SNA 核算中的国内生产总值…4、(15 分) 写出“拉斯贝尔价格指数”“派许价格指数”和“费希尔价格理想指数”的计算公式…5、(12 分) 设 X1,X2,…,Xn 是来自正态分布 N(μ,1) 的一个简单随机样本…请你说出下面四个随机变量各服从什么分布：1) Σ(Xi−μ)² 2) Σ(Xi−X̄)² 3) (√n/S)(X̄−μ) 4) S²/(n(X̄−μ)²)…7、(15 分) 某市欲考察顾客…样本的平均值是 29.44 元，标准差是 20 元。1) 请你写出顾客一次消费平均金额的 95% 置信区间？…8、(15 分) …f(x;a) = { (1/a)x^{(1−a)/a}, 0<x<1; 0, 其他 }…9、(15 分) 一只袋子中装有红、白两种颜色的球，为了检验假设：H0: 袋子中红球、白球的个数相等…
- **结论**：2003 卷 1–9 题（含经济统计概念题、指数公式、抽样分布四问、MLE 与假设检验）读图确认；该卷题型跨度大（统计学原理 + 概率统计），排名/表格数据必须以读图为准。
- **置信度**：**high**


## 附：结构性裁定（依据文本层普查与页面对象，非读图）

下列结论由 `backup/scratch/refs-statq/pages_*.json`（逐页 `get_text()` 字符数 + `get_images()` 计数）与
`diag_targets.py`（关键词定位 exact/frag/MISS）产出，**未使用读图**，故不计入上表的读图裁定条数：

| # | 材料 | 页/范围 | 证据 | 结论 | 置信度 |
|---|------|---------|------|------|--------|
| S1 | jysg | 1–241 | 逐页 chars 全非空或已裁定；正文 7–241、前置 1–6 | 页覆盖无空洞 | high |
| S2 | jiexi | 1–708 | 逐页 chars 全非空或已裁定；正文 7–708、前置 1–6 | 页覆盖无空洞 | high |
| S3 | heji | 1–28 | 逐页 chars；仅 p7/p8/p21 为 10 字符 | 页覆盖无空洞 | high |
| S4 | jysg | 碎片公式 | 393 行命中碎片（整行长度 ≤6 且含单字符上下标）；最密 p209=25、p215=21、p174=19、p170=18 | 求和/积分/上下标被拆行，禁止从 .txt 照抄公式 | high |
| S5 | jiexi | 碎片公式 | 2795 行命中；最密 p39=95、p49=76、p38=32、p124=29、p471=27 | 同上，且解析册碎片密度约为真题册的 7 倍 | high |
| S6 | heji | 碎片公式 | 51 行命中；p10=20、p13=20 | 2001 卷两页公式拆行最重 | high |
| S7 | heji | p23–p26 | 各含 1×1 占位图（xref 268，重复出现）+ 矢量文字 1123/845/1067/916 字符 | 文本层完好，**无需读图**；占位图不构成图片页 | high |
| S8 | heji | p7/p8 | 文本层各 10 字符，嵌入图 4+3 张（1072×590 / 954×375 / 942×398 / 924×206 / 929×375 / 945×341 / 952×349） | 2004 卷题干只在图里，须 native_stack 读图（见 R44/R45） | high |
| S9 | heji | p2/p3/p4/p5/p6 | 抽取文本行号：2000 卷 L5（p1）、2001 卷 L152（p3）、2002 卷 L341（p4）、2003 卷 L556（p5）；**2004 卷无任何行** | 2000–2003 卷文本层可用；2004 卷缺失 | high |
| S10 | jysg/jiexi | 章头配对 | 113 章按序 zip 配对，`assert` 校验 school/code/year 一致 | 两册章序严格一致，可互为转录校验 | high |

## 附：不可裁定 / 需人工复核

- **无官方答案的卷**：合集（heji）全册为题目汇编（文件名即「部分有答案」），2000–2004 卷在解析册中无对应解答；
  本族因此不对这些题标注 answer，需后续按解析册之外的来源单独裁定。
- **回忆版卷**：jysg p30（北大 431 2026 统计部分）为回忆版（分值记为 `5'`/`10'`），题目完整度低于正式版，
  入库时应标记 `recall: true`。
- **原书衍字**：上财 2023 章头「上海财经大学大学」（R17/R38）两册一致，保留原文并在索引层归一。
