# BOARD — 多对话派单与回报信箱

> **定位**：主对话 ↔ 切片对话之间唯一的落盘交接面。约定正文在 `WORKFLOW.md` §7；本文件只放**活任务**与收口报告。  
> **原则**：任务题面与报告必须在盘上；聊天只做通知。验收后任务迁出，**规则头永远保留、禁止清空**。

## 权限（谁能写什么）

| 角色 | 可写 | 禁止 |
|---|---|---|
| **主对话**（编排/验收） | 新建任务块、改题面/状态/验收结论、**执行归档**、修订本规则头 | 不在此写实现过程 |
| **切片对话**（执行） | **仅**在自己任务块的 `### 报告` 下**一次追加**完整收口报告 | 不改题面/状态/验收；不写别人的块；不归档；不改规则头 |
| **只读**（调研/会诊） | 无 | 不写 |

**文件锁**：任一时刻最多一个执行者向本文件写入（做完一次性追加报告后立刻停笔）。主对话在验收前不与执行者交错写同一任务块。与 `WORKFLOW.md` §7.3 一致。

## 生命周期与归档

```
主对话建块 → 状态: open → 派发后: in-progress → 执行者追加报告
    → 主对话验收（抽 diff/复跑闸门）→ 状态: accepted
    → 主对话归档：整块剪切到 backup/docs-archive/board/YYYY-MM-DD-<id>.md，本文件删除该块
```

- **验收前禁止归档**；验收失败 → 状态 `blocked` 并在验收行写原因，留在盘上继续，**不删报告**。
- 归档文件名：`backup/docs-archive/board/YYYY-MM-DD-<id>.md`（一天多块可加后缀 `-b`）。归档目录可 gitignore（跟 `backup/`）。
- 升版/CHANGELOG 等收口仍走主对话与既有闸门，**不**在本文件替代 `WORKFLOW.md` §5–6。
- 大特性（多切片、要设计）仍优先 `docs/compose/spec/<feature>.md`；本文件仅作短切片信箱，Spec 链接写在任务块的 `依据` 行。

## 任务块模板（主对话粘贴改写）

```markdown
---
### T<编号> <一句话标题>
- 状态: open | in-progress | blocked | accepted
- 负责: 切片对话（会话标题或「未命名」）
- 文件集: 仅 <路径列表>
- 依据: AGENTS.md + docs/WORKFLOW.md §7<+ Spec 链接>
- 依赖: T<无|编号>
- 验收:
  1. <可观察结果>
  2. <必跑命令 → PASS>
- 升版: 待升版 | 不升 | 已在主对话完成 x.y.z

#### 派单摘要（可直接粘贴为切片开场，含三句话）
（见 WORKFLOW §7.2；必须含：工作区绝对路径、先读 AGENTS 禁止整仓通读、本块文件集+验收）

### 报告
<!-- 执行者一次追加；格式 WORKFLOW §7.4：改了什么 → 闸门 PASS/FAIL → 未做项 -->
```

## 活动区

<!-- ↓↓↓ 新任务加在此行之下；按 T 编号递增 ↓↓↓ -->

### T170 bank-wave3 三科真题准确化与第二批入库（W3-a…f）
- 状态: accepted（波次未完，W3-g+ 见 `docs/compose/spec/bank-wave3.md` §6）
- 负责: 主对话 + 四个取证切片（m3-2324 / m3-2025 / econ-2013 / stats-gh-2021）
- 规格: `docs/compose/spec/bank-wave3.md`（唯一活文档）；审计: `backup/scratch/bank-wave3/audit.md`
- 文件集: `data/bank_math3.js`、`data/bank_econ.js`、`data/bank_stats.js`、`data/math3.js`、`tests/bank.test.mjs`、`tests/fixtures/bank-answer-manifest.json`、`docs/{ARCHITECTURE,DATA_SCHEMA,ACT}.md`
- 升版: 不升（用户裁定「暂不推送升版本」）

#### 报告

**交付**：math3 2023–2025 三卷 56 题（18+19+19，满卷 22×3）、econ 2013 整卷 5 题、stats 光华 2021 缺题 3 题，合计 +64；`subOf` 压制 8 组 / 13 张卡（派生题 182 → 169）。全库 1069 → **1120** 题（手写真题 589 / 卡片派生 531）。

**审计结论（与用户描述对齐）**：
1. 「重复」全部在卡片派生题之间（math3 15 组 / econ 6 组 / stats 0），`year` 真题彼此零重复；另 1 组 card↔year（`m3-2025-15`）在本轮入库后暴露。22 组中 8 组已压，余 14 组因「无 year 题可指」留后续。
2. 「缺漏」比描述更重：math3 除 1987–2009 整年缺外，**2010–2019 卷内缺 126 题**（每年只入库 6–14 题，卷面 23 题）；econ 缺 2014/2015/2021–2025，且 1995–2012 的 159 条答案仍是「待批」占位；stats 光华卷每年只入库 1–5 题，仍缺 30–40 题。
3. 数据缺陷：24 条 POC 真题缺 `origin:'year'`（含 2023/2024/2025 的 10 条），按 origin 字面统计会漏计 —— 已补齐。
4. 闸门盲区：`coverRatio` 对 gram<8 的短公式题干恒返回 0，`$\lim…\ln(\cos x)/x^2$` 这类逐字相同的填空判不出重复。本轮给 subOf 校验加「精确同文放行」（归一化全等即视为同题），其余仍要求 ≥0.25 且必须是全库最相似。

**答案侧**：2024 三(21) 答案册把特解印成 $(1,0,0,0)^T$，重推为 $(1,1,0,0)^T$（代入三行全对），已按「册上 X / 重推 Y」记入 `src.note`；econ 2013 答案册该段**只有题面没有解答**，5 题全独立重推；stats 光华 2021 三题与解析册结论一致，仅补了归一化校验与 $F_U$。

**闸门**：`check_data` 全绿（1120 题 / 531 派生 / 40 压制 / 题源 171 组 0 冲突）· `npm test` 439/439 · `npm run check` exit 0 · `check:render` exit 0（3562 卡 / 0 问题）· `verify-refs` exit 0 · `check_plan` 仍 59 PASS / 2 FAIL（G1/G3，2.3.0 起已知历史红，已裁定不刷新）。版本七处仍 `2.3.0 / ms3-v126 / ?v=87`，未 commit、未 push。

**未做项**：math3 1987–2009（23 年）与 2010–2019 补 126 题；econ 7 年题面 + 159 条占位答案；stats 光华 30–40 题；econ 6 组 / math3 3 组无 year 题可指者的重复压制。均排入 W3-g+。

---

### T171 bank-wave3 W3-h：math3 2010–2019 补 126 题 + 统计/微观缺题
- 状态: accepted
- 负责: 主对话 + 10 个取证切片（math3 2010–2019 共 10 年 / econ 9 个缺年 / stats 9 个光华卷）
- 规格: `docs/compose/spec/bank-wave3.md` §6/§10；公共切片规范 `backup/scratch/bank-wave3/SLICE-SPEC.md`；片段自检器 `validate-part.mjs`
- 用户裁决（2026-11-05）：**先做 2010–2019 补 126 题，补统计微观的缺题，2010 以前数学真题暂缓**
- 文件集: `data/bank_*.js`、`tests/bank.test.mjs`、`tests/fixtures/bank-answer-manifest.json`、`tools/check_data.mjs`、`docs/{ARCHITECTURE,DATA_SCHEMA,ACT}.md`、`docs/BOARD.md`、`docs/compose/spec/bank-wave3.md`
- 升版: 不升（沿用「暂不推送升版本」）

#### 报告

**交付**：math3 2010–2019 十年卷内缺题 **126 条**（15+15+12+9+15+11+13+14+11+11，逐年补齐到卷面 23 题）、econ 光华 2014/2015/2019–2025 缺年题面 **38 条**、stats 光华「统计部分真题」逐年比对后补 **18 条**（2017/2021 已完整故无新增），合计 **+182**；全库 1120 → **1302** 题（手写真题 771 / 卡片派生 531）。

**取证与口径**：数学三按题面合并册 `3、2010-2022考研数学三真题.pdf` 原页裁片逐页亲读（OCR 文本层不作题面来源），逐年解析册对拍；econ 答案册 2014/2015/2019–2025 段**全段只有题面复述、无印刷解答**，38 题全部独立重推并与 JYSG 解析册对拍；stats 只收「统计部分真题」，微观部分归 econ、精算/金融数学题按 T161 口径排除。`SLICE-SPEC.md` §3 的 `school` 口径经逐年实测订正为 **2010–2014「入学统一考试」/ 2015+「招生考试」**（原写 2014+ 招生考试，与库内 2014 既有条目不符）。

**两处裁决（2026-11-05，用户选定推荐项）**：
1. `m3-2019-13` 原审计因 OCR 丢失矩阵 $A,\boldsymbol b$ 判「不可还原、不得回流」；本轮已按合并册 p14 原页亲读逐字复原，比照同文件 `m3-2019-6` 先例，把禁令改为「若存在必须是亲读复原的真实矩阵题」的正向内容断言，126 题完整入库。
2. 新题 `src.file` 的父目录「【1987-2025年】」被 `check_data` 年份正则误判为单份文件名，刷 126 条假 WARN；按脚本原有注释「范围文件名不适用」修正取年份前先剔除 `【…】`，WARN 归零且让 2023–2025 逐年卷真正纳入校验（口径变严）。

**同步**：`tests/bank.test.mjs` 的 `MIN_QUESTIONS` 406/340/374 → **532/378/392**、`yearRows` 589 → **771**、`T49_CARDS.poc` 237/179 → **363/217**、stats 手写量 173 → **191**；期望答案表 237 → **363** 条（新增 126 条 `fill` 锚点，据亲读片段转录、未读取题库数据）；三份文档行号锚点与题量下限同步；三个题库文件头题量注释同步。回滚点 `backup/bank_*.js.pre-bank-wave3-w3h`。

**闸门**：`check_data` ✅ 全绿（1302 题 / 531 派生 / 40 压制 / 题源 171 组 0 冲突）· `node --test tests/bank.test.mjs` 47/47 · `npm test` 439/439 · `npm run check` exit 0 · `check:render` exit 0（3562 卡 / 0 问题）· `verify-refs` exit 0 · `check_plan` 仍 59 PASS / 2 FAIL（G1/G3 为 2.3.0 起已知历史红，已裁定不刷新）。版本七处仍 `2.3.0 / ms3-v126 / ?v=87`，未 commit、未 push。

**未做项（按裁定/排期）**：math3 1987–2009 共 23 年（用户裁定暂缓，W3-j）；econ 1995–2012 共 159 条「答案待批」占位重推（W3-i）；econ 6 组 / math3 3 组无 `year` 题可指的重复压制；`stats` 光华 2016–2020 共 16 条老真题缺 `origin` 字段（测试按「缺省视为 year」兼容，本轮未改数据）。


<!-- 已归档：T168 / T169（2026-11-05 待办清理波次：T143 收口、D1–D11 历史快照、秩相关不补裁定、全库闸门）→ backup/docs-archive/board/2026-11-05-T168-T169.md -->

<!-- 已归档：T138–T167（2.2.0 第二波 → 2.3.0 公考两科，含状态订正说明）→ backup/docs-archive/board/2026-11-05-T138-T167.md -->

<!-- 已归档：T122–T137 Athena 2.1.2 / 2.2.0 第一波（题库扩至 767 题、卡片补写 40 张、微观 49 页闭合与重取证、跨来源判重、生成器防护与闸门换代）→ backup/docs-archive/board/2026-10-11-V2.1.2-T122-T137.md -->

<!-- 已归档：T77–T121 Athena 2.1.1 / 2.2.0 前置（题库渲染与筛选、自测星标、专注链 UI 与组合语义、错题入口、四族转录基线）→ backup/docs-archive/board/2026-10-10-V2.1.1-T77-T121.md -->

<!-- 已归档：T45–T76 Athena 2.1.0（题库/自测/专注链三修复/层级视觉/悬浮提醒/未到期重学/例题联动下线）→ backup/docs-archive/board/2026-10-09-V2.1-T45-T76.md -->

<!-- 已归档：T39–T44 专注链两 bug + 里程碑云同步 + 习惯树拖拽 → backup/docs-archive/board/2026-10-07-T39-T44.md -->

<!-- 已归档：T1 js 教材化 → backup/docs-archive/board/2026-09-28-T1-js-textbook.md -->
<!-- 已归档：T2 clang K&R → backup/docs-archive/board/2026-09-28-T2-clang-kr.md -->
<!-- 已归档：T3 math3 线代笔记 → backup/docs-archive/board/2026-09-28-T3-math3-linalg.md -->
<!-- 已归档：T4 cppl C++ Primer → backup/docs-archive/board/2026-09-28-T4-cppl-primer.md -->
<!-- 已归档：T5 java HFJ → backup/docs-archive/board/2026-09-28-T5-java-hfj.md -->
<!-- 已归档：T6 jp 标日深化 → backup/docs-archive/board/2026-09-28-T6-jp-shinnyo.md -->
### T172 bank-wave3 W3-i：全库去重 + econ 同题小问合并
- 状态: **accepted**（去重部分已完成并收口；W3-i 占位答案重推为后续批次）
- 负责: 主对话（只读审计 → 用户裁决 → 数据落地 → 护栏同步 → 全闸门）
- 规格: `docs/compose/spec/bank-wave3.md` §12（唯一活文档）；审计: `backup/scratch/bank-wave3/dup-audit.json` / `dup-plan.json`
- 文件集: `data/bank_{math3,econ,stats}.js`、`data/{math3,econ,stats}.js`、`tools/{bank-cv,dup-key}.mjs`、`tests/{bank.test,bank-cv.test}.mjs`、`docs/{ARCHITECTURE,DATA_SCHEMA,ACT,BOARD}.md`、`backup/scratch/refs-plan/check_plan.mjs`
- 升版: 不升（沿用「暂不推送升版本」）

#### 报告
**裁决**：① 派生题侧处理 14 组逐字同题 + 34 条复述 year 真题，year 真题一条不删；② econ 同一大题的不同小问合并成一条整题；③ 先去重定稿同步护栏，再重推占位答案。

**交付**：全库 **1302 → 1239 题**（math3 492 / econ 356 / stats 391）。
- 14 组精确同题：新建 `tools/dup-key.mjs`，生成器 `expectedRows` 与单测 `cardEntriesOf` 同源接入「按 EXAMPLE 顺序只收首条」，−14 条。
- 34 条复述真题：在 `data/*.js` EXAMPLE 登记 `subOf`（−34 条）；两条短公式同题用 `coreStem` 补放行，34 对全部合法。
- econ 8 簇小问：合并为 8 条整题（−15 条），母题段只留一份、各小问问句逐字保留并编号；占位答案 159 → 144。

**同步**：`MIN_QUESTIONS`、`T49_CARDS`、`yearRows`/`cardRows`、T149 占位数、三科文件头、4 份文档行号锚点、生成器副本沙盒依赖、`check_plan` C2/C4 公式（新增 `deduplicated` 项）。

**闸门**：`check_data` ✅ 全绿（1239 题 / 零泄漏 / 题源 0 冲突）· `bank.test` 47/47 · `npm test` 439/439 · `check` / `check:render` / `verify-refs` exit 0 · `check_plan` 59 PASS / 2 FAIL（G1/G3 为 2.3.0 起已知历史红，已裁定不刷新）。

**遗留**：econ 144 条 `【答案待批】` 中 1995 首批 3 条已重推（见 T173），余 **141 条**待按答案册手写批注亲读重推；12 对 card↔card 近似按裁决保留；stats 光华 2016–2020 共 16 条老真题缺 `origin`（测试兼容）；1987–2009 数学真题暂缓。

**回滚**：`backup/bank-wave3-w3i/`（8 文件）。版本七处仍 `2.3.0 / ms3-v126 / ?v=87`，HEAD `c158cf7`，未 commit、未 push。

<!-- 已归档：T7 kr 延世 → backup/docs-archive/board/2026-09-28-T7-kr-yonsei.md -->
<!-- 已归档：T8 fr 简明法 → backup/docs-archive/board/2026-09-28-T8-fr-mingjian.md -->
<!-- 已归档：T9 es 现西 → backup/docs-archive/board/2026-09-28-T9-es-xiandai.md -->
<!-- 已归档：T10 rust The Book → backup/docs-archive/board/2026-09-28-T10-rust-book.md -->
<!-- 已归档：T11 math3 一卡一知识点 → backup/docs-archive/board/2026-09-28-T11-math3-split.md -->
<!-- 已归档：T12 初学者模式修复 → backup/docs-archive/board/2026-09-28-T12-beginner-fix.md -->
<!-- 已归档：T13 热力图色阶 → backup/docs-archive/board/2026-09-28-T13-heatmap-scale.md -->
<!-- 已归档：T14 完全上传下载 → backup/docs-archive/board/2026-09-28-T14-force-sync.md -->
<!-- 已归档：T15 学科选择器角标 → backup/docs-archive/board/2026-09-28-T15-subject-badge.md -->
<!-- 已归档：T16 卡面展示分段 → backup/docs-archive/board/2026-09-28-T16-card-segment.md -->
<!-- 已归档：T17 句末多句细切 → backup/docs-archive/board/2026-09-28-T17-prose-split.md -->
<!-- 已归档：T18 行动·计划 → backup/docs-archive/board/2026-10-T18-act-plan.md -->
<!-- 已归档：T19 习惯树 → backup/docs-archive/board/2026-10-T19-habit-tree.md -->
<!-- 已归档：T20 原理认知科学 → backup/docs-archive/board/2026-10-T20-map-cogsci.md -->
<!-- 已归档：T21 习惯树修复 → backup/docs-archive/board/2026-10-T21-habit-fix.md -->
<!-- 已归档：T22 行动帮助与主页 → backup/docs-archive/board/2026-10-T22-act-help-home.md -->
<!-- 已归档：T23–T29 V2 → backup/docs-archive/board/2026-10-V2-t23-t29.md -->
<!-- 已归档：T30–T34 H 波 → backup/docs-archive/board/2026-10-H-wave-t30-t34.md -->
<!-- 已归档：T35 专注链 UI 重构 → backup/docs-archive/board/2026-10-05-T35-focus-ui.md -->
<!-- 已归档：T36 设计/字体/图表 → backup/docs-archive/board/2026-10-T36-design-typography-charts.md -->
<!-- 已归档：T37 里程碑 → backup/docs-archive/board/2026-10-T37-milestones.md -->
<!-- 已归档：T37b 里程碑风味名扩展 → backup/docs-archive/board/2026-10-05-T37b-mile-flavor.md -->
<!-- 已归档：T38 空态插画 → backup/docs-archive/board/2026-10-T38-empty-illustrations.md -->

### T173 bank-wave3 W3-i 后续：econ 141 条占位答案重推（6 个切片）
- 状态: **accepted**
- 负责: 主对话统一合并；切片按 `backup/scratch/bank-wave3/W3I-SLICE-SPEC.md` §3 划分，只写 `parts/`
- 规格: `docs/compose/spec/bank-wave3.md` §13 + `backup/scratch/bank-wave3/W3I-SLICE-SPEC.md`（唯一活文档）
- 文件集: `data/bank_econ.js`（主对话独占）、`tests/bank.test.mjs`（T149 占位数）、`docs/{BOARD,compose/spec/bank-wave3}.md`、本地日志
- 升版: 不升（沿用「暂不推送升版本」）

#### 进度
- ✅ 只读摸底：答案册 149 页文本层仅题面复述，解答为手写批注；卷首页逐年映射已提取；1995 三页渲染亲读验证清晰可读。
- ✅ 1995 首批 3 条（`ec-1995-1/2/3`）已重推入库，占位 144 → **141**；T149 护栏、文件头、日志同步。
- ✅ 公共规范 `W3I-SLICE-SPEC.md` 与共享自检器 `validate-w3i.mjs` 已落盘。
- ✅ S1 1996–1999 (15) / S2 2000–2002 (20) / S3 2003–2004 (24) / S4 2005–2006 (29) / S5 2007–2008 (22) / S6 2009–2012 (31) 六片全部交付，`validate-w3i.mjs` 141 条 / 0 错误 PASS。
- ✅ `merge-w3i.mjs` 合并入库（回滚点 `backup/bank_econ.js.pre-w3i-all`），econ 占位答案 **141 → 0**，题量 356 不变。

#### 交付
答案册手写批注按 170 dpi 渲染亲读（局部 300–600 dpi 复核），逐题用经济学独立重推对拍；**60 条**册上留空 / 跳步 / 笔误由独立重推补齐，`src.note` 逐条注明「册上 X / 重推 Y / 原因」。代表订正：

| id | 册上 | 重推 |
| --- | --- | --- |
| `ec-1998-1` | $P=8$ 却写 $Q=30000$ | 需求侧与供给侧代入同为 $60000$，判笔误；每家 600、盈利 2100 |
| `ec-2002-4` | $\ln 95=4.543$ | $4.5539$（第 1 问 4.54 系截断，实为 4.5494） |
| `ec-2004-11` | $\partial\pi/\partial q=(1-x)x-2q$ | $(1-x)x-q=0\Rightarrow q=1/4$（与册上最终结论一致，求导笔误） |
| `ec-2005-9` | $P_d=1.75$、$P_s=2.25$ | 消费者价/生产者价标反，应为 $P_d=9/4$、$P_s=7/4$ |
| `ec-2008-8` | $w_1^B+w_2^B\le400$ | 漏状态 1 权重 3，应为 $3w_{B1}+w_{B2}\le400$ |
| `ec-2008-13` | 两段最优反应写反 | 反例 $q_2=40$ 下真最优反应 40、册上式给 25；补每家区间 |
| `ec-2011-7/8/9` | 仅「回忆有误，无法完成」 | 供给函数、$\min AC=4\alpha\beta$、$N$ 家与 $N\to\infty$ 两种口径、唯一均衡条件全部重推 |
| `ec-2012-10/11/12` | 确定拥堵时间按 $\frac12+\frac12$ 加权致系数减半（5000/2500/12.5） | 2500 / 1250 / $F=171.875$ |

8 簇合并整题（`ec-2003-8`、`ec-2004-8`、`ec-2007-4/7/13`、`ec-2008-13`、`ec-2012-4/8`）的 `answer` 均一次覆盖全部小问。

统计侧同批收口：`data/bank_stats.js` 中光华 2016–2020 共 **16 条**老真题补上显式 `origin: 'year'`（此前靠测试「缺省视为 year」兼容），现算 `year 191 / card 200`、总数 391 不变，`yearRows 756` / `cardRows 483` 不受影响。

#### 验收
`validate-w3i.mjs` 141/0 PASS；合并后闸门：`check_data` 全绿（1239 题 / subOf 压制 74 / 零泄漏）、`bank.test` 47/47、`npm test` 439/439、`npm run check` 全绿、`check:render` 全绿、`verify-refs` 全通过、`check_plan` 59 PASS / 2 FAIL（G1/G3 已裁定历史红）。版本 `2.3.0 / ms3-v126 / ?v=87`、HEAD `c158cf7` 不变，不 commit、不 push。

### T174 bank-wave3 W3-j：数学三逐年题量标准（23/22）+ 题库按题号排序
- 状态: **accepted**
- 来源: 用户 2026-11-06「数学仍存在着重复与缺失问题，2020 年及以前到 2010 年每年 23 道题，此后每年直到 2026 年 22 道题，应该以一次标准来判断」「题库筛选年份后排列应默认按题号顺序」
- 规格: `docs/compose/spec/bank-wave3.md` §14
- 升版: 不升（沿用「暂不推送升版本」）

#### 审计
真题侧（`origin: 'year'`）已完全合规：2010–2020 每年 23 题、2021–2025 每年 22 题，且题号恰为 1..N 的排列（无重复号、无缺号）；精确同文重复 0 组、`year↔year` 近似重复 0 对。

「重复 / 缺失」的真实来源是**卡片派生题带着真题年份混进年份维度**：2019 显示 34 题（23 + 11 例题）、2025 显示 40 题（22 + 18）、2026 显示 10 题但全是例题。另查出 4 对**卡片↔卡片同题**（旧 0.9 阈值抓不到）。

#### 交付
- `src/bank.mjs`：`bankYearRows()` 与 `bankMatch()` 年份维度只认真题；`bankFilteredQuestions()` 改为「真题在前 → 年份降序 → **题号数值**升序 → id」；新增纯函数 `bankNoOrder(q)` 取题号序号。
- 压制 5 条卡片同题（`subOf`）：`ser12`/`gx59` → `m3-2023-13`、`dbi02` → `m3-2023-19`、`ext06-3`/`gx01` → `m3-2025-11`；回滚点 `backup/math3.js.pre-w3j-subof`。
- 数据：math3 492 → **487**（派生 129 → 124，真题 363 未删）；全库 1239 → **1234**；`subOf` 74 → 79。
- 新增两条护栏：**逐年题量=标准且题号 1..N 排列**、**列表按题号数值排序**（含字符串比较反证）。
- 同步：`MIN_QUESTIONS.math3`、`T49_CARDS`、`cardRows`、三条年份用例改为只认真题口径、`data/bank_math3.js` 文件头、`docs/{ARCHITECTURE,DATA_SCHEMA,ACT}.md` 36 处锚点。

#### 验收
`check_data` 全绿（1234 题 / subOf 79 / 零泄漏）· `bank.test` 49/49 · `npm test` 441/441 · `check` / `check:render` / `verify-refs` exit 0 · `check_plan` 59 PASS / 2 FAIL（G1/G3 历史红）。版本 `2.3.0 / ms3-v126 / ?v=87`、HEAD `c158cf7` 不变，不 commit、不 push。

#### 遗留
- ~~**2026 年数学三 22 题缺材料**~~ → **T175（W3-k）已补齐并销号**。
- 约 100 条标注 2010–2025 的卡片例题与当年真题同源，年份维度已不计入；是否整批压制需裁决（部分改写与真题相似度 < 0.25，`subOf` 校验会拒绝）。

### T175 bank-wave3 W3-k：数学三 2026 卷 22 题入库
- 状态: **accepted**
- 来源: 用户 2026-11-06 提供 `参考文件/真题/数学/2026年考研数学三真题及答案解析.pdf`（「1、已提供」），销 T174 的 2026 缺口
- 规格: `docs/compose/spec/bank-wave3.md` §15 / `backup/scratch/bank-wave3/W3K-SLICE-SPEC.md`
- 升版: 不升（沿用「暂不推送升版本」）

#### 材料与取证
15 页 PDF，题面 p1–p3、解析 p4–p15。**文本层公式严重碎片化**（`1 | x | y | xe |` 一类），全部改为 170 dpi 整页渲染亲读，矩阵/选项按 `get_text('blocks')` 坐标二次裁剪 330–700 dpi 复核（裁片 `backup/scratch/bank-wave3/w3k-pics/`）。曾在第 15 题把 `-3a` 与 `3-3a` 混淆，三次放大后才定稿——这类歧义是本卷必须亲读的直接原因。

#### 答案对拍
22 题全部独立重推，21 题与册上一致；**一(10) 册上有笔误**：p7 标【答案】C，但同页解析先证「所以 AC 都不成立」，p8 解析末段原文「应选 D」，其 $\frac{(3^n-2^n)(3^m-2^m)}{2}>0$ 与重推的 $\frac14(c-d)(a-b)>0$ 同源。取 D，并在 `src.note` 与期望表双处留痕（册上 C / 重推 D / 原因）。反证：$m=1,n=5$ 时 $P\{X>m+n\mid X>m\}=\frac{7}{36}<\frac{5}{12}$，C 不成立。

#### 交付
- `data/bank_math3.js` 手写真题区追加 22 条（`m3-2026-1` … `m3-2026-22`，题号 一(1)–三(22)），回滚点 `backup/bank_math3.js.pre-w3k`；文件头题量 487 → 509 与 W3-k 沿革段。
- 数据：math3 手写真题 363 → **385**，全库 1234 → **1256**（math3 **509** / econ 356 / stats 391）；派生 124、`subOf` 79 不变；math3 选择题 138 → **148**。
- 期望答案表追加 22 条（choice 10 + fill 12），choice 合计 138 → 148、全表 363 → 385，`_meta.provenance` / `sources` 补 W3-k 与 2026 册。
- 护栏：2026 缺口断言 `0` → `22` 并加题号 1..22 排列断言；`MIN_QUESTIONS.math3` 487→509；`T49_CARDS.math3` poc 363→385；`yearRows` 756→778；选择题条数 138→148；排序循环年份补 `'2026'`。
- 文档：`DATA_SCHEMA` 题量下限 509/1256 + 沿革；`ARCHITECTURE` 期望表 385 条 / choice 148 条 / 守卫块 `:729-769` / `letterOf` `:715` / `LETTER_RES` `:714`；Spec §14 遗留销号 + 新增 §15；本板。

#### 验收
`check_data` 全绿（1256 题 / subOf 79 / 零泄漏 / 170 组题源一致 0 组多写法）· `npm test` **441/441** · `bank-cv --dry-run --allow-math3-reorder`「无变化（772585 B）」· `check_version` 一致 · `check_render` 0 问题 · `verify-refs` exit 0。版本 `2.3.0 / ms3-v126 / ?v=87`、HEAD `c158cf7` 不变，不 commit、不 push。

#### 遗留
- **题库无概率统计卡片**：`data/math3.js` 398 张卡全属微积分/线代 14 类，而 `estimate` 类真题已 90 条。本卷 5 条概率统计题（一(8)/一(9)/一(10)/二(16)/三(22)）的 `tags` 只能挂 `zt04`/`tp02`/`int23` 方法套路卡——沿用既有做法，未新立卡片。若要做对，需先补一层概率统计知识卡（属独立任务）。
- 约 100 条标注 2010–2025 的卡片例题与当年真题同源（简化改写），年份维度已不计入、列表已排在真题之后；是否整批 `subOf` 压制仍需裁决（部分改写与真题相似度 < 0.25，当前 `subOf` 校验会拒绝）。**2026 卷入库后，`cv-m3-ode05↔cv-m3-wr02` 这对 2026 例题已有同年真题可指，可一并裁决。**

### T176 bank-wave3 W3-l：两种题合并（按 0.25 口径全量压制派生重复题）
- 状态: **accepted**
- 来源: 用户 2026-11-06「2、能否将两种题合并」；三档口径呈报后裁定「按 0.25 口径全量压制」
- 规格: `docs/compose/spec/bank-wave3.md` §16 / `backup/scratch/bank-wave3/apply-w3l-subof.mjs`
- 升版: 不升（沿用「暂不推送升版本」）

#### 关键发现
卡片派生题的 `stem` 逐字照搬 `EXAMPLE[key].q`，而例题把四个选项**内联在题干里**（`…则（ ） 选项：(A) …`），真题记录则把选项拆进 `options`。这层格式差异让 math3 有 **18 条与同年真题逐字同题** 的派生题，在「全量 stem」口径下的相似度只有 0.5–0.8，一直被 W3-i/W3-j 的 0.9 阈值漏掉——这是「题库仍存在严重重复」投诉的直接来源。改用 `normStem`（剥 LaTeX 命令、分母取例题自身 gram 数）的真实口径后全部显形。

#### 交付
- `apply-w3l-subof.mjs` 按真实 `coverRatio` 口径逐条算出最相似 year 题，满足 `exactSame || r ≥ 0.25` 即在 `EXAMPLE` 条目登记 `subOf`；回滚点 `backup/{math3,econ,stats}.js.pre-w3l`。
- **两遍压制**（压制会改变 `dupKey` 去重首位归属）：第一遍 math3 91 / econ 15 / stats 54；第二遍把浮出的 5 + 1 条继续压制，直到 `bank-cv --dry-run` 报「无变化」。
- 数据：派生 **478 → 318**（math3 124→33 / econ 154→139 / stats 200→146）；题库 **1256 → 1096**（math3 418 / econ 341 / stats 337）；`year` 真题 **778 一条未删**；`subOf` 79 → **245**。
- `tools/bank-cv.mjs` 自检 4 放宽为「生成块 + 真题侧 ≥5」（否则 math3 的 `multivar` 块内仅剩 2 条会报红，压制越多越红，与目标冲突）。
- 同步：`MIN_QUESTIONS` / `MIN_TOTAL`、`T49_CARDS.math3` kept 33 / skip 173、`T49_CARDS.econ` floor 139、`cardRows` 318、三科题库文件头、`DATA_SCHEMA` 下限 1096 + 沿革、`ARCHITECTURE`/`DATA_SCHEMA` 锚点（`letterOf` `:717` 等 6 处）、Spec §16、本板。

#### 契约影响
t49「卡片例题全量入库」只剩 318 条。**例题本身一条没丢**：`EXAMPLE` 完整保留，卡片详情照旧展示；被压掉的只是「题库里与某道真题重复的可练副本」，即用户要的「题库内只保留一道相同的题」。

#### 验收
`check_data` 全绿（1096 题 / subOf 245 / 派生 318 / 零泄漏 / 154 组题源一致 0 组多写法）· `npm test` **441/441** · `bank-cv --dry-run` 三科「无变化」· `check_version` 一致 · `check_render` 0 问题 · `verify-refs` exit 0。版本 `2.3.0 / ms3-v126 / ?v=87`、HEAD `c158cf7` 不变，不 commit、不 push。

#### 遗留
- 剩余 318 条派生题与真题相似度均 < 0.25，属「同主题不同题」，保留合理；进一步收紧需改 `coverRatio` 下限与「全库最相似」校验，护栏会变弱，须另行裁定。
