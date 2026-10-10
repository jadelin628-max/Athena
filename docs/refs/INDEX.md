# 参考资料四族基线 · 索引（INDEX）

> 任务：t6 [refs-plan] · 生成者：refs-lead · 口径修订：见 `docs/BOARD.md` T82 与船长 t6 派单
> 本文是**只读索引**：只汇总四族已交付基线的入口、规模、复算命令与已知边界，不重算、不手改任何族内数字。
> 数据文件（`data/*.js`）与 `docs/COVERAGE.md` 在本任务中**零改动**；本文件与 `docs/refs/2.2.0-PLAN.md` 是唯一的两个新增文档。

---

## 0. 这个索引解决什么问题

2.2.0「内容全覆盖 + 题库全量」要同时指挥三条流水线：**卡片补写/重写**（对照教材讲义知识点）、**题库增量**（卡片例题 + 真题）、**结构与口径整治**。三者的输入分散在四份族基线（统计教材族 / 微观族 / 数学三真题族 / 统计真题族）与一份派生比对（t30 统计卡片覆盖）里。本文把它们**串成一张可回读、可复算的关系图**，并写明每个数字的权威文件与命令；批次如何排、哪些能立刻开工、哪些必须先由用户定夺，见 [`docs/refs/2.2.0-PLAN.md`](2.2.0-PLAN.md)。

---

## 1. 四族基线总览

| 族 | 任务/作者 | 材料（口径：PDF 物理页） | 交付物（字节数） | 规模与关键数字 | 裁定 | 复算门槛（当前状态） |
| --- | --- | --- | --- | --- | --- | --- |
| **统计教材族** | t2 / stat-eng | 16 份共 **641 页**：茆诗松 490 + 14 专题 106 + 计量讲义 45 | `docs/refs/stats-textbook.md`（58348）、`.json`（683756）、`rulings/stats.md`（97177） | `entries` 192、`knowledgeMapping` 9 行、`theoremIndex` 110、`verifiedFormulas` 38、`rerunFormulas` 12、**`holes` 0** | **44 条** | 族内自检脚本见族文档 §6；`holes=0` 为族级闸门 |
| **微观族** | t3 / micro-eng | 3 份共 **630 页**：十八讲 417（无文本层）+ 修订版 64 + 答案册 149（薄文本层） | `docs/refs/micro.md`（176983）、`micro.json`（544097）、`rulings/micro.md`（327657） | **18 讲 + 后记（19 行）**、6 族、`j18_pages` 417、`formulasDirect` 25 / `formulasRederive` 11、`figures` 10；真题题面 **rev 461 / ans 409**（31 年 1995–2026） | **141 条** / **49 页待裁定**（B1 答案册 2、B2 修订版 10、B3 十八讲 37） | 待裁定页清单 `micro.json → batch.totals`（`pending_total 49`） |
| **数学三真题族** | t4 / math-eng | 真题册 `3、2010-2022考研数学三真题.pdf`（52 页，页↔年表见 `math3.md` §1）+ 逐年解析册 | `docs/refs/math3.md`（65347）、`math3.json`（464182）、`rulings/math3.md`（109675） | **13 年 297 题**（2010–2020 各 23、2021–2022 各 22）、选择题 108、`answer_manifest` **161 = choice 108 + fill 53** | **60 条** + 低产页抽样 28 = 88 | `node backup/scratch/refs-math3/check-index.mjs` → **3438 PASS / exit 0** |
| **统计真题族** | t5 / refs-lead | 3 份共 **977 页**：JYSG 真题册 241 + 解析册 708 + 合集 28 | `docs/refs/statq.md`（19040）、`statq.json`（303992）、`rulings/statq.md`（64301） | **113 章 / 13 院校组 / 556 题**、合集 14 卷次、`chapterByYear` 2016–2026（2016–2022 各 11，2023 12，2024 10，2025 7，2026 7） | **49 条** + 结构性裁定 S1–S10（文本层证据，不冒充读图） | `参考文件\_venv\Scripts\python.exe backup/scratch/refs-statq/check_statq.py` → **41 PASS / exit 0** |
| **统计卡片覆盖比对（派生）** | t30 / refs-cards-stats | 输入＝统计教材族 + `data/stats.js` 卡片 | `docs/refs/card-coverage-stats.md`（61152）、`.json`（190349） | 行级 **182 行（分母 175）**：有讲义有卡片 134 / 讲义有而卡片无 27 / 双方都有但需重写 7 / 覆盖不足 7；**建议补写 27 张**（纯缺口 16 + 补强 11）；`cardOnly` 12；页回读失败 0 | —（非裁定族，是派生比对） | `docs/refs/card-coverage-stats.md` 由 `backup/scratch/refs-cards-stats/gen-cards-md.mjs` 派生，**禁止手改** |

补充口径：
- 各族**裁定记录格式**（材料｜页码｜生成命令｜裁片路径+指纹｜亲读原文｜结论｜置信度）与**读图通道**（主通道 = 自带 `read_image`；禁用 `modlens`）见 [`docs/refs/README.md`](README.md)。
- 读图取证工具：`tools/refs-vision.py`（`--pdf/--page/--dpi/--box/--out/--python/--verify`，确定性 sha256、退出码 0/1/2/3）。
- 四个族的裁定材质都落在 `.gitignore` 覆盖的 `backup/scratch/`（`refs-vision/`、`refs-statq/`、`refs-math3/`、`refs-micro/`…），可凭命令重建。
- **快照与漂移**：上表与本索引/PLAN 的全部数字是 **t6 清点时点**的快照，**清点时点的文件指纹以不可变基线 `backup/scratch/refs-plan/inventory-baseline.json → fingerprints` 为准**（`inventory.json → fingerprints` 是最近一次运行的实时值，会被复跑覆盖）；漂移记录见 `check-plan-report.json → drift`。清点后由**队友在途任务**引起的漂移已登记：`docs/refs/README.md`（14643 → 15538 B）、`docs/refs/math3.md`（65347 → 68176 B）、`docs/refs/math3.json`（464182 → 约 54–57 万 B，**仍在被 t35 写入**：实测 569393 → 544616）——原因是 **t35（T109）数学三选择题选项回填**生效（`coverage.choice_with_4_options` 已 = 108、空选项 0）。凡「尚未完成边界」的行，均以**执行批次的当时状态**为准，本索引只负责给出可回读的起点。

---

## 2. 相互引用关系（谁是谁的输入）

```text
参考文件/（教材讲义 + 真题，gitignored、零改动）
├── 教材讲义/统计/  ──► 统计教材族 (t2)  ─┬─► t30 统计卡片覆盖比对 (派生) ──► PLAN 卡片批次 C1/C2
│                                        └─► 题库「卡片例题」池（EXAMPLE）──► PLAN 题库批次 Q1
├── 教材讲义/微观 + 真题/微观/ ─► 微观族 (t3) ─┬─► 题库「卡片例题」池 ──────► PLAN 题库批次 Q2
│                                             ├─► 微观真题增量（rev 461）──► PLAN 题库批次 Q5
│                                             └─► 49 页待裁定 ─────────────► PLAN「已可执行」P0 读图批次
├── 真题/数学/5、1987-2025 数学三真题 ─► 数学三真题族 (t4) ─┬─► 297 题增量池 ─► PLAN 题库批次 Q3
│                                                          └─► 80 道选择题选项空 ─► t35（T109）P0 回填
└── 真题/统计/ ─────────────────────► 统计真题族 (t5) ────► 556 题增量池（2021–2026 空档）─► PLAN 题库批次 Q4

data/stats.js · math3.js · econ.js（卡片 + EXAMPLE）与 data/bank_*.js（题库）──只读──► t6 清点/矩阵：
  backup/scratch/refs-plan/inventory.mjs → inventory.json（卡片/题库/例题/四族规模指纹）
  backup/scratch/refs-plan/matrix.mjs    → matrix.json（三科覆盖矩阵 + 三类增量池，可复算）
docs/COVERAGE.md ── 对齐锚点（§1/§3/§4/§5/§6/§9/§10），**本任务不得修改**
```

引用方向约定：**族基线 → 派生比对 → 计划**；禁止反向（计划不得成为任何族数字的来源）。凡下游文档引用四族数字，必须同时给出「材料 + 页码/题号 + JSON 键路径」三要素，便于回读。

---

## 3. 页码口径与别名（跨族比对时最容易出错的地方）

| 材料 | 换算 | 证据 |
| --- | --- | --- |
| 茆诗松《概率论与数理统计教程》第三版 | 印刷页 = PDF 页 − **22** | `docs/refs/card-coverage-stats.md` §1.1 / `stats-textbook.json` |
| 14 个专题讲义 | PDF 页 = 讲义内页 | 同上 |
| 计量经济学讲义（45 页） | PDF 页 = 讲义内页（§1.1 按节） | 同上 |
| 微观十八讲 | 印刷页 = PDF 页 − **8**（PDF p9 = 书内 1），6 页裁片互验 | `micro.json → page_offsets` |
| 光华历年真题·修订版 / 答案册 | PDF 页 = 印刷页 + **1** | `micro.json → page_offsets` |
| 数学三 2010–2022 真题册 | 52 页页↔年表见 `docs/refs/math3.md` §1 | `math3.json → _meta` |
| JYSG 真题册 / 解析册 / 合集 | **一律 PDF 物理页**（无印刷页偏移） | `statq.md` §1 |
| 十八讲低产页阈值差异 | 本族自定 ≤450 字（43 页）；派单旧口径「38 页」为另一阈值 | `micro.json → limits` |

其他必须记住的口径：`t30` 的「例题/习题/真题/课外题」**不计入覆盖率**（`EXAMPLE` 只作附注）；「教材中的例题」入题库时忽略、卡片所附 `EXAMPLE` 才入题库；`docs/COVERAGE.md` §5 的数学三矩阵是**考纲章级 8 行**（覆盖 19 考纲章），而 t30 是**统计节内知识点行**，两者粒度不同、不可互相求和。

---

## 4. 引用与复算命令（工作目录 = 仓库根）

```powershell
# t6 清点 + 矩阵（本索引 §1 与 PLAN 全部数字的来源，只读 data/*.js 与 docs/refs/*.json）
node backup/scratch/refs-plan/inventory.mjs      # → backup/scratch/refs-plan/inventory.json
node backup/scratch/refs-plan/matrix.mjs         # → backup/scratch/refs-plan/matrix.json
node backup/scratch/refs-plan/make_baseline.mjs  # → inventory-baseline.json（t6 清点时点指纹，仅在需要重建基线时跑）
node backup/scratch/refs-plan/check_plan.mjs     # 校验 INDEX/PLAN 的条目数、缺口数与回读锚点 → check-plan-report.json（含漂移）

# 族级闸门
node backup/scratch/refs-math3/check-index.mjs                                   # t4: 3438 PASS
& '参考文件\_venv\Scripts\python.exe' backup/scratch/refs-statq/check_statq.py    # t5: 41 PASS
node backup/scratch/refs-cards-stats/gen-cards-md.mjs                            # t30 派生文档（禁止手改派生输出）

# 读图取证（主通道 = 自带 read_image 亲读；禁用 modlens）
& '参考文件\_venv\Scripts\python.exe' tools/refs-vision.py --pdf <PDF> --page <N> --dpi 150 --box x0,y0,x1,y1
```

---

## 5. 已知边界与风险登记（2.2.0 开工前必须知情）

| # | 风险/边界 | 证据 | 影响 |
| --- | --- | --- | --- |
| R1 | 数学三真题 2010–2019 的 **80 道选择题选项为空** | `math3.json → coverage`；已立 **t35（T109）**，P0 先清 40 道 | **清点时点描述**：t35 回填已在 `math3.json` 生效（`choice_with_4_options = 108`、空选项 0，见 §1「快照与漂移」），后续批次以 t35 结果为准，**禁止重复回填** |
| R2 | 数学三非选择题答案 **136 条未亲读**（填空 46 = P0、解答 90 = P2） | 船长 t6 口径 / `math3.md` §2 | 答案就绪量 161 → 清空后 ~207 |
| R3 | 微观 **49 页待裁定**（答案册 2 / 修订版 10 / 十八讲 37） | `micro.json → batch.totals` | 微观真题题面与解答不可整卷入库 |
| R4 | 答案册手写解答是**草稿**（并存矛盾推导、算术笔误） | `micro.json → limits` | 入库前必须重推，不得直接照抄 |
| R5 | 统计真题族 **556 题**与已入库 170 条卡片例题**同源**，未逐题去重 | `increment.realQuestions.stats.note` | 净增量不得直接用 556；去重前只能写「上界」 |
| R6 | 合集 **p12–p14 与 p9–p11 同文重复**收录 | `statq.md` §3.2 | 统计真题题面去重要按正文比对，不能按页码 |
| R7 | 无年份 `src` 的卡片例题 **8 条**（stats 7 + econ 1）一律排除 | `matrix.json → increment.cardExamples.bySubject[*].noYearKeys` | 入库计数分母须显式减去 |
| R8 | `math3` 线代 84 张同属单一 cat `linalg`，无法分章统计；另有 **21 张卡（trig 14 + inequality 7）未归入任一考纲行** | `matrix.json → math3.cardCatReconciliation` | 覆盖矩阵对账差额 21，需结构决策 |
| R9 | 微观卡片口径差：`data/econ.js` 实测 **288 张**（按卡自身 cat）vs t3 表 **271 张** | `inventory.json → cards.econ.cards` vs `micro.json → cards_total` | 差 17 张；引用时必须注明口径 |
| R10 | `data/bank_math3.js:1` 头注释「共 23 题」vs 实际 **24 题**；`src.note` 仍留 modlens 措辞 | `docs/COVERAGE.md:237`（M4 ④） | 已单开数据侧任务，本计划只登记 |

---

## 6. 相关文件

- 计划与批次表：[`docs/refs/2.2.0-PLAN.md`](2.2.0-PLAN.md)（含三科覆盖矩阵与「仍需用户决策」栏）
- 格式与通道约定：[`docs/refs/README.md`](README.md) · 工具：[`tools/refs-vision.py`](../../tools/refs-vision.py)
- 覆盖矩阵（权威、禁改）：[`docs/COVERAGE.md`](../COVERAGE.md) · 团队看板：[`docs/BOARD.md`](../BOARD.md)
- 本索引的可复算证据：`backup/scratch/refs-plan/inventory.json`、`matrix.json`、`check_plan.mjs`