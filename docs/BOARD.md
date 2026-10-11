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
---
### T122 2.2.0 题库线 Q2+Q3：卡片例题入库（数学三 150 条 + 微观 148 条）
- 状态: accepted
- 负责: bank-eng（任务 t49）
- 文件集: 仅 `data/bank_math3.js`、`data/bank_econ.js`、`tests/bank.test.mjs`、`tools/check_data.mjs`、`backup/scratch/bank-cv2/`
- 依据: AGENTS.md + docs/WORKFLOW.md §7 + `docs/refs/2.2.0-PLAN.md` §1.2 Q2/Q3（+ t32 统计科同款先例）
- 依赖: T无（t32 的 `data/bank_stats.js` + `backup/scratch/bank-cv/build-bank-cv.mjs` 为模板，只读）
- 验收:
  1. 数学三 150 条（124 键）、微观 148 条（排除无年份的 `mk31` 并逐条登记）入库；id `cv-m3-<cardId>[-n]` / `cv-ec-<cardId>[-n]`
  2. `origin:'card'`、`tags:[cardId]`、`star === META[cardId][0]`、`src.card`、`traps`/`hint` 条件必需；生成器连跑两次逐字节相同；既有手写题零改动
  3. `node --test tests/bank.test.mjs` → PASS；`node tools/check_data.mjs` → PASS
- 升版: 不升（2.2.0 收口轮统一）

#### 派单摘要（可直接粘贴为切片开场，含三句话）
工作区 `D:\deepseek harness work\考研\Athena`。先读 `AGENTS.md`，禁止整仓通读。本切片只碰上述文件集；改 `src` 后不要跑 `npm run build`（生成物由收口轮统一构建），闸门＝`node --test tests/bank.test.mjs` + `node tools/check_data.mjs`。

### 报告
#### 报告（t49 / bank-eng，2026-10-10）
- **交付**：`data/bank_math3.js` **174 题**（手写 24 + 卡片派生 150）、`data/bank_econ.js` **163 题**（手写 15 + 派生 148；排除 `data/econ.js` 无四年份的 `mk31[0]`，登记 `backup/scratch/bank-cv2/excluded.md`）；全库真题 **523**（手写 55 + 派生 468）。口径与 t32 统计科同构：`origin:'card'`、id `cv-m3-<cardId>[-n]` / `cv-ec-<cardId>[-n]`、`tags=[cardId]`、`star === META[cardId][0]`、`src.card` + `src.note`、`traps`/`hint` 有则逐字写、无则省略。校名统一为「全国硕士研究生(入学统一考试|招生考试)-数学三 <year> 年」（math3）与来源机构 + 年份（econ），「（改编）」只进 `src.note`。
- **成员闸门**：`node --test tests/bank.test.mjs` exit 0（**43/43**，护栏上调 `MIN_QUESTIONS` math3 174 / econ 163、`MIN_TOTAL` 523、`MIN_TYPES` 13/10/11，新增逐题对拍块与 id 命名参数化用例）；`node tools/check_data.mjs` exit 0（ERR=0 WARN=1）；反证 `prove-guards.mjs` **10/10**（注入 star/id/answer/origin/src.card/删条全判红，基线与还原全绿）；生成器幂等（两次 `--write` sha256 逐字节相同：math3 `E0D0FBF0…2E9C`、econ `986EFBFC…28DB`）；结构审计 `diff-outside-sentinel.mjs` exit 0（哨兵块外仅头部注释与数组末元素补逗号 1/2 处，0 行未归类）；8 批 checkpoint 全绿。
- **船长验收（亲跑）**：`node --test tests/bank.test.mjs` → `tests 43 / pass 43 / fail 0` exit 0；`node tools/check_data.mjs` → `学科 25 | 卡片 2769 | 题库 3 | 真题 523 | origin=card 468`、题源一致性 **116 组 / 同组多写法 0**、`ERR=0 WARN=1` exit 0；`data/math3.js` 的 `EXAMPLE.int29[1].a` 实测 `$` 计数 **13（奇）**、尾部 `…\right)$$`，与成员 WARN 归因一致。
- **船长裁定 ①：题型受控扩展批准**——math3 `multivar`（13 条，多元函数微分与极值）；econ `demand`（9）、`producer`（17）、`welfare`（7）、`information`（6）。判据与该批全部来自卡片派生题、每键 ≥5 题，与 t32 统计科 5 键批准的同一口径；判据与 sample 见 `backup/scratch/bank-cv2/report.md` §5。三个科目题型键自此为 math3 13 / econ 10 / stats 11，须由 T129 写回 `docs/DATA_SCHEMA.md` 与 `docs/ARCHITECTURE.md`。
- **船长裁定 ②：唯一 WARN 转上游修复任务 T130（t57）**——根因在 `data/math3.js` 的 `EXAMPLE.int29[1].a`（单 `$` 开、`$$` 收），本任务 answer 须逐字取源故无法在题库侧消除；成员用计数白名单 `KNOWN_ODD_DOLLARS` 钉住是正确处置（新增缺陷仍判红、上游修好后不复现也判红）。已建 T130 并指派 bank-eng，依赖 T126/T127（三任务都要写 `data/bank_math3.js` 与 `tests/bank.test.mjs`，必须串行）。
- **未做项（后续批次）**：Q4a/Q4b math3 真题 161 条入库（T126）、Q5 stats 真题增量（T127）、Q4c 非选择题答案亲读 136 条、Q6 econ 真题题面 446 条、期望答案表扩展到 econ/stats；`tools/check_data.mjs` 本任务未改动（现有校验已覆盖，未放宽）；未跑 `npm run build`。
- **台账说明**：`git diff --numstat` 中 `docs/BOARD.md`（155/0）为船长写入 T122–T130 任务块所致，非成员改动；成员改动为 `data/bank_math3.js`、`data/bank_econ.js`、`tests/bank.test.mjs`（+195/−23）与 `backup/scratch/bank-cv2/`。

---
### T123 2.2.0 卡片线 C1+C2+C3：统计卡片补写 27 张 + 重写 8 张
- 状态: accepted
- 负责: stat-eng（任务 t50）
- 文件集: 仅 `data/stats.js`、`backup/scratch/cards-stats/`
- 依据: AGENTS.md + docs/WORKFLOW.md §7 + `docs/refs/2.2.0-PLAN.md` §1.1 C1–C3 + `docs/refs/card-coverage-stats.md`（页码依据）+ `docs/refs/rulings/stats.md`
- 依赖: T无（T104/t30 的覆盖率产物为输入，只读）
- 验收:
  1. 新增 27 张（纯缺口 16 + 补强 11，覆盖 15 行）+ 重写 7 行 8 卡（`ll07`/`xt07`/`ll01`/`ll06`/`sx03`/`xt04`/`est03`/`test16`），映射表与页码依据随报告
  2. 既有 199 张 id 集合不变；除 8 张重写外既有字段零改动；新卡 META 齐备、例题仅真题、禁止教材例题
  3. `node tools/check_data.mjs` → PASS；`node tools/check_render.mjs` → PASS（渲染问题 0）
- 升版: 不升

#### 派单摘要（可直接粘贴为切片开场，含三句话）
工作区 `D:\deepseek harness work\考研\Athena`。先读 `AGENTS.md`，禁止整仓通读。本切片只碰 `data/stats.js` 与 `backup/scratch/cards-stats/`；读图用 `tools/refs-vision.py`（一次一页、裁片 ≤400 KB / ≤1400 px，主通道为自带读图能力）；闸门＝`node tools/check_data.mjs` + `node tools/check_render.mjs`。

### 报告
交付：`data/stats.js` 卡片 **199 → 226**（补写 **27**＝C1 纯缺口 16 张覆盖 15 行 + C2 覆盖不足补强 11 张覆盖 7 行；原地重写 **8**＝`ll07` 切比雪夫不等式、`xt07` 特征函数性质、`ll01` 切比雪夫大数定律、`ll06` 大数定律与中心极限区别、`sx03` C-R 不等式、`xt04` 充分统计量+因子分解、`est03` 有效性、`test16` 正态性检验；id 与 cat 不变）。新卡一律 ★4（`reg17`/`ll13` 为 ★3）、一律不带 EXAMPLE（真题池 166 键/177 条已全挂既有卡，★5 升级留题库线批次）、新增 PITFALL 16 条 / MNEM 2 条、无占位。未跑 build；未改 `data/bank_*.js`、`src/`、`style.css`、`app.js`、`dist/`。

船长独立复核（自建脚本 `backup/scratch/captain-verify-t50/check-stats-cards.cjs`，不调用成员任何脚本）：新增 **27** / 删除 **0** / 重复 id **0**；既有卡中内容变化**恰好 8 张**，`changedList` 与目标 8 张**完全一致**（`targetMissing` 空）；`META` 键 226、缺失 0、空值 0；`EXAMPLE` 键 **166** / 条目 **177**（未变）；27 张新卡 id、星标、标签、标题长度逐条核对通过，`hasExample` 全 false。成员证据采信：`check-cards-new.mjs` 44 项 exit 0、`diff-proof.mjs`（新增 27 + 重写 8，无删除、无未分类改动）、`verify-formulas2.mjs` A 28/28、B 40/40、C 117/117 MATCH。

闸门：`node tools/check_data.mjs` → 学科 25 / 卡片 2809 / 题库科目 3 / 真题总数 680 / origin=card 468；逐科 `[统计学] 226 卡 | id泄漏=0 **奇=0 $奇=0`。`node tools/check_render.mjs` **exit 0**（卡片 2809 / 渲染字段 9979 / 问题数 0）。

时点说明（诚实口径，船长跑闸门的时点）：主树结果行为 `❌ ERR=1 WARN=1 exit=1`——ERR 唯一一条是 **t53 在途**的 `[题库] math3 m3-2022-18 题型不在 types 内: ext`，WARN 唯一一条是 **T130 目标** `cv-m3-int29-2.answer $ 未成对 (13 个)`；两条均不属本批（统计科逐项干净）。成员自报的「中段被并发任务拉红」归因成立，其隔离语料复跑（四文件换回 HEAD 字节 + `ATHENA_DATA_DIR=临时目录`）结论采信。

未闭合（转后续批次，不阻断本任务）：① 茆诗松附表 1–14 页码映射；② ★5 例题批次（统计科 177 条真题的星标升级）；③ PLAN §1.1 中 12 行「不必补写」里的小改卡补句。

---
### T124 2.2.0 卡片线 C4：微观卡片补写 13 张（6 族缺口）
- 状态: in-progress
- 负责: micro-eng2（任务 t51）
- 文件集: 仅 `data/econ.js`、`backup/scratch/cards-micro/`
- 依据: AGENTS.md + docs/WORKFLOW.md §7 + `docs/refs/2.2.0-PLAN.md` §1.1 C4 + `docs/refs/micro.md`/`micro.json` + `docs/refs/rulings/micro.md`
- 依赖: T无（T79/t3 与 T118–T121 的微观产物为输入，只读）
- 验收:
  1. 13 张按族缺口 A2/B1/C2/D2/E2/F4 落地；例题 `src` 含四位年份并与 `micro.json` 题号/页码可回读对应
  2. 答案独立重推（答案册解答为草稿）；既有 288 张 id 集合不变、字段零改动；新卡 META 齐备
  3. `node tools/check_data.mjs` → PASS；`node tools/check_render.mjs` → PASS
- 升版: 不升
- 在途窗口提示（船长 m04140，来自 T128 预检实测）：`data/econ.js` 266720 → **318940（sha 前缀 `bb9d7bd2`）** 已落盘 13 张新卡卡体（EXAMPLE 键 131/149 不变），但**主树 `node tools/check_data.mjs` 当时为 `❌ ERR=39 WARN=9 exit=1`，其中 13×3 ERR 全属 `[微观经济学]`（`META 缺失` / `PITFALL 引用不存在的` / `REL 源`）**——按验收 2「新卡 META 齐备」与验收 3 的闸门，收尾前这三处接线必须齐备、ERR 必须清零；如收尾时仍红，本任务不能结案。

#### 派单摘要（可直接粘贴为切片开场，含三句话）
工作区 `D:\deepseek harness work\考研\Athena`。先读 `AGENTS.md`，禁止整仓通读。本切片只碰 `data/econ.js` 与 `backup/scratch/cards-micro/`；现行正确式为 `T = M/2` 与 `16Wp₂/27`（R110/R115/R119 已修正）；闸门＝`node tools/check_data.mjs` + `node tools/check_render.mjs`。

### 报告
<!-- 执行者一次追加；格式 WORKFLOW §7.4：改了什么 → 闸门 PASS/FAIL → 未做项 -->

---
### T125 2.2.0 取证线 P0-3：微观 49 页待裁定页闭合
- 状态: accepted
- 负责: refs-lead（任务 t52）
- 文件集: 仅 `docs/refs/rulings/micro.md`、`docs/refs/micro.json`、`backup/scratch/refs-micro-p0/`
- 依据: AGENTS.md + docs/WORKFLOW.md §7 + `docs/refs/2.2.0-PLAN.md` §1.3 P0-3 + `docs/refs/README.md` §2/§2.6
- 依赖: T无（t38/t45/t47 的裁定修正为输入，只读；生成链回折为硬前置）
- 验收:
  1. 49 页逐页有处置（答案册 2 / 修订版 10 / 十八讲 37）；每条裁定七字段齐、裁片登记「取框+尺寸+字节+sha256」
  2. `node backup/scratch/refs-micro/check-index.mjs`、`crossref.mjs`、`crops-audit.mjs` → PASS；`batch.pending` 归零
  3. 报告中重申：重跑 `gen_rulings.py`/`build_micro.py` 前必须先把 t38/t45/t47 修正折回 `backup/scratch/refs-micro/frag/`（diff 见 `backup/scratch/refs-micro-fix3/diff.patch`）
- 升版: 不升

#### 派单摘要（可直接粘贴为切片开场，含三句话）
工作区 `D:\deepseek harness work\考研\Athena`。先读 `AGENTS.md`，禁止整仓通读。本切片只碰 `docs/refs/rulings/micro.md` 与 `docs/refs/micro.json`；主通道为自带读图能力，全程禁用 modlens；闸门＝`check-index.mjs` + `crossref.mjs` + `crops-audit.mjs`（真实路径见 `backup/scratch/refs-micro/`）。

### 报告
<!-- 执行者一次追加；格式 WORKFLOW §7.4：改了什么 → 闸门 PASS/FAIL → 未做项 -->
**船长验收（accepted，t52 / refs-lead，attempt 2 = `e13c500e-257b-4739-8e22-ee6c0acdf8d3`）**
- 改了什么：`docs/refs/rulings/micro.md` **522162 B / sha256 `13a1184613884b344c5d20141bc8f59d3ad187c3e965b52d3d419db89abc5772`**（裁定 141 → **190**，R142–R190 新增、R1–R141 编号未平移）；`docs/refs/micro.md` **169154 B / `5412222c8a795eef7affaf61c72eb477b6f8f4df32c555bbe51109e5260daa8b`**；`docs/refs/micro.json` **580421 B / `e39c43c7b2cdcb8c7f27d97bbbad0257045a63ad9c73fd7d2f67d1186d0641ad`**（`.gitignore:28` 有意忽略的本地产物）。三份哈希与成员自报逐字一致。
- **微观 49/49 页闭合**：`batch.pending` 三册全空（ans/rev/j18 均为 `[]`），`counts` = `low_total 190 / covered_total 190 / pending_total 0`（ans 131 / rev 16 / j18 43）；三段式账目 **j18 37 / rev 10 / ans 2 = 49**，剩余 0、无未裁定原因；栏 A 组「重渲后作废的旧读数」20 张、栏 B「仍不可读页」0。
- **合并令五条落实（船长逐条复核）**：① R154–R173 **20/20 段**均引用 `backup/scratch/refs-micro-hi18` 的 hi-res 片（全文 84 处引用），旧片追溯 **20/20**（19 处 `@48dpi` + R154 封面 `@30dpi`，措辞比契约更精确），旧片统一降级「仅定位」；② 两处更正在册：R155 段「社标」3 处、R156 段「1986」4 处，未见静默替换；③ 两处 band 偏离（p18 带起点 1180.5→1140、p35/p60 上沿→y=110）与 R164 p60 页眉口径均写进「取框计划偏离 / 与旧读差异」栏；④ 账目见上；⑤ `crops[].sha256` 作权威值，**t65（T133）产物未被改写**——我复核 46 张裁片哈希 **0 不符**。
- **生成链缺陷修复（船长实核）**：`backup/scratch/refs-micro/legacy-sections.json` **141 键（R1–R141 逐字冻结）** + `fix-notes.json` **13 条目 / 10 键**（`ans p40/p47/p61/p120×2/p123×2/p125/p128×2/p129/p134`、`rev p28`）+ `rnums.json`，用于防止「修复文本只在产物、重跑即回退」。注：报告正文写的路径是 `refs-micro-p0/`，实际位于 `backup/scratch/refs-micro/`，属**措辞偏差**、非缺失（三件均已核实存在且计数与自报一致）。
- 成员自检采信（其中 ① 由我亲跑）：① `verify_t52.py` → **34 PASS / 0 FAIL exit 0**（输出含 `F1 read-t52.json 49 页`、`F2 id 恰为 R142..R190`）；② `check-index.mjs` 16 通过 / 2 提示 / 0 失败；③ `crossref.mjs` ev 55 / MISSING 0 / MISMATCH 0；④ `crops-audit.mjs` 缓存 201 / 裁定 190 / 孤儿 14 / 待裁定批次页 0；⑤ 两轮生成产物 sha256 稳定。
- **船长刻意未做**：不重跑 `gen_rulings → build_micro`（避免「验收时重跑生成器」造成第二次事故，见 T134 事故记录），只做只读复核——产物哈希、结构计数、文本检索、t65 产物对拍。若要复核重跑稳定性，应另立一个专门任务并在沙盒副本上进行。
- 未做项 / 交接：① `node backup/scratch/refs-plan/inventory.mjs` 当前 **exit 1**，根因是 `data/bank_math3.js` 的语法回归（船长事故）→ 已建 **t66（T134）** 恢复 t57 交付态并加守卫，修复后该脚本须转绿；② 文档口径更新（`docs/refs/INDEX.md` R3、`docs/refs/2.2.0-PLAN.md` 取证线 P0 的「微观 49 页待裁定」→「已闭合 49/49、裁定 190 条（j18 37 / rev 10 / ans 2）」，十八讲口径→「裁定依据 ≥95 dpi，48 dpi 仅定位」）已转达 **t64（stat-eng）**。

---
### T126 2.2.0 题库线 Q4a：数学三真题 161 条入库（选择 108 + 填空 53）
- 状态: accepted
- 负责: math-eng2（任务 t53）
- 文件集: 仅 `data/bank_math3.js`、`tests/fixtures/bank-answer-manifest.json`、`tests/bank.test.mjs`、`backup/scratch/bank-m3/`
- 依据: AGENTS.md + docs/WORKFLOW.md §7 + `docs/refs/2.2.0-PLAN.md` §1.2 Q4a/Q4b + `docs/refs/math3.json`/`rulings/math3.md`
- 依赖: T122
- 验收:
  1. 161 条入库，`id m3-<year>-<题号>`；题面（含四选项）逐字取自 `docs/refs/math3.json`，禁止凭记忆补写
  2. 答案与 `tests/fixtures/bank-answer-manifest.json` 一致（choice 字母 + 4 选项 + `is-answer`；fill 文本 + 锚点）；manifest 同步扩到 161 条
  3. Q4b：80 道选择题已含在 161 内，禁止重复入库（重复题面 0）；既有手写 24 题与 T122 卡片派生题逐字节不变
  4. `node --test tests/bank.test.mjs` → PASS；`node tools/check_data.mjs` → PASS（题源一致性 0 冲突）
- 升版: 不升
- 口径修订（船长 m04064/m04077 裁定，依据成员实测事实；验收 1/2 按下列替换）:
  1. **净新增 157 条**：`m3-2012-1`、`m3-2012-2`、`m3-2013-1`、`m3-2013-2` 与既有手写题**同 id 同题** → 不重复插入；库内 math3 非卡片题 = 24 + 157 = **181**，全库 = 523 + 157 = **680**；`tests/fixtures/bank-answer-manifest.json` 同步为 **181 条**（2010–2022 子集仍 161 = choice 108 + fill 53，既有 20 条逐字保留），`tests/bank.test.mjs` 的 id deepEqual 由此自洽。护栏 MIN_QUESTIONS / MIN_TOTAL / MIN_TYPES 按上述真值设。
  2. **题面口径改为「裁片逐字亲读」**：`docs/refs/math3.json` 无题面字段（单题键仅 `stem_brief`/`note`/`knowledge`/`options`/`answer`/`answer_display`/`*_evidence`/`stem_page`/`analysis_page`/`rulings`/`confidence`），原验收 1 的字面要求作废 → 从 `stem_evidence`/`options_evidence` 指向的裁片**亲读转写**（主通道＝原生读图能力，**全程禁用 modlens**），逐题登记「裁片路径 + sha256 + 等效命令」到 `backup/scratch/bank-m3/`；解析册文字层仅作交叉核对，**单源题须在 `src.note` 写明单源**（T73/T76 先例）；**裁片体积硬上限 ≤400 KB / 最长边 ≤1400 px**（超限改 `--dpi 110`、`--box` 或重渲版心横带），同一题连续两次取回失败 → 登记 `unreadable` 并继续，**不得凭记忆或 OCR 文本补写题面**；题干内不得含 `(A)–(D)` 选项（选项进 `options`）；解答题答案须亲读答案页。
  3. **`traps`/`hint` 改「条件必需」**（有源则填且逐字可溯源，无源则省略字段，不得空串、不得编造）：校验器与文档由 **t58（BOARD T131，bank-eng）** 落地——`tools/check_data.mjs` 的 `origin !== 'card'` 强制项改为「缺则跳过、存在即非空」，并同步 `docs/DATA_SCHEMA.md`；t58 落地前 `node tools/check_data.mjs` 对无源题刷 ERR 属**规则未同步**，不计入 t53 缺陷。

#### 派单摘要（可直接粘贴为切片开场，含三句话）
工作区 `D:\deepseek harness work\考研\Athena`。先读 `AGENTS.md`，禁止整仓通读。本切片只碰上述文件集，且必须在 T122 交付后才开工；闸门＝`node --test tests/bank.test.mjs` + `node tools/check_data.mjs`。

### 报告
交付：`data/bank_math3.js` **331 题**＝手写 24 + 卡片派生 150 + **t53 新增 157**（计划 161，去重 4 条撞车 id：`m3-2012-1`、`m3-2012-2`、`m3-2013-1`、`m3-2013-2` 与库内手写题同 id 同题，逐条比对后不重复插入）；期望答案表 `tests/fixtures/bank-answer-manifest.json` 扩为 **181 条**（choice 118 + fill 63）；题型键 **0 新增**（`ext` 已撤下），13 键沿用既有；来源 21 个。全库真题 680。

船长亲跑（exit 0）：`node backup/scratch/bank-m3/check-t53.mjs` → **通过 7/7，RESULT: PASS**；`node tools/check_data.mjs` → `❌ ERR=0 WARN=1`，math3 行 `331 题 | 13 题型 | school=331/331（21 个来源）| 卡片派生=150 | id泄漏=0`，唯一 WARN＝`cv-m3-int29-2.answer $ 未成对`（上游 `data/math3.js` 既有，归 T130/t57）；8 条 `m3-2010-* school 与 src.file 年份不一致` WARN 随 src.file 改指解析册消失。

船长独立复算（自建 `backup/scratch/captain-verify-t53/check-bank-m3.cjs`，不调用成员脚本）：`total 331`、`byOrigin {year:181, card:150}`、重复 id **0**、`school` 与 `year` 同源违规 **0**、`typeNotInTypes` **0**、年份分布 2010:8 / 2011:8 / 2012:11 / 2013:14 / 2014:8 / 2015:12 / 2016:10 / 2017:9 / 2018:12 / 2019:12 / 2020:23 / 2021:22 / 2022:22（+2023:4 / 2024:3 / 2025:3 属既有），期望表结构 `{_meta, answers}` 的 `counts.total 181 / choice 118 / fill 63` 与自报一致。

**题型键裁定**：`ext` 撤下（0 新增）采信；`econ` 键**保留不动（选项 a）**——全库 `econ` 类型题实测 **6 条**（3 手写 + 3 新增），已达「每键 ≥5 题」阈值，且它是 t49 前既有的受控键，不因新增侧仅 3 条而降级合并。

**在途事实与归因（不属 t53 缺陷）**：船长复核时 `node --test tests/bank.test.mjs` 为 **42/43（fail 1）**——失败断言在 `tests/bank.test.mjs:407`：`AssertionError: econ 卡片例题（src 带四位年份）条数应为 148`，`actual: 161`。成因是 **t51 在 `data/econ.js` 追加 13 张卡（13 条带年份例题）**，卡片线长出新例题而题库线未同步入库（t53 完成时该护栏确为 43/43，其自报属实）。按 2.2.0 口径「卡片所附例题必须全部进题库」，正确修法是**增量入库 + 期望从源派生**，已建 **T132/t62**（bank-eng，依赖 t54/t57，等 `tests/bank.test.mjs` 写面串行）处置。

证据：`backup/scratch/bank-m3/`（`build-bank-m3.mjs` 幂等装配、`check-t53.mjs`、`plan-161.json`、`crops.json` 43 条裁片登记 + `crops/` 44 张 PNG 全部 ≤1400 px / ≤400 KB、`years/2010..2022.json` 逐年 checkpoint）；**155/157 为单源**（题面仅真题册裁片亲读，`src.note` 逐条写明裁片 + sha256 前 12 位），2 题标「交叉核对」。

未入库清单（相对 `docs/refs/math3.json` 297 题，转后续批次）：解答题 111 条（需公式级复核）、选项不全选择题 20 条（OCR 掉选项）、填空锚点缺失 33 条（2010–2021 OCR 退化）；本批已按口径收敛为「选择字母 97 + 填空 63」。未跑 build。

---
### T127 2.2.0 题库线 Q5：统计真题增量入库（优先 2021–2026 空档）
- 状态: accepted
- 负责: stat-eng（任务 t54）
- 文件集: `data/bank_stats.js`、`tests/bank.test.mjs`、`tools/check_data.mjs`、`docs/DATA_SCHEMA.md`、`backup/scratch/bank-statq/`（后两项由船长 m04256 裁定加入）
- 依据: AGENTS.md + docs/WORKFLOW.md §7 + `docs/refs/2.2.0-PLAN.md` §1.2 Q5 + `docs/refs/statq.json`/`rulings/statq.md`
- 依赖: T122、T126
- 验收:
  1. 新增 ≥60 条，2021–2026 每年至少 1 条（材料缺失须登记原因）；逐组依据 `statq.json` 的 13 院校组
  2. 三层去重（既有手写 16 题、170 条卡片例题、批内）重复 0 且由断言守护；公式重推不得照抄碎片
  3. id 唯一规则写明并落断言；`school` 与 `src.file` 同源；既有手写题与卡片派生题逐字节不变
  4. `node --test tests/bank.test.mjs` → PASS；`node tools/check_data.mjs` → PASS（题源一致性 0 冲突、WARN 不得新增）
  5. 题源同源规则扩展（船长 m04256 裁定，选项 a）：`SRC_SCHOOL_RULES` 的 JYSG 规则由「单一光华-431」扩为「13 院校组之一（`oneOf`：院校关键词 + 专业代码必须同时命中）」，组清单内联在 `tools/check_data.mjs`（注明源自 `docs/refs/statq.json` 的 groups；该 JSON 被 .gitignore 忽略，禁止运行时读）；数学三规则原样不动；反证＝13 组正证 + 编造院校/错配代码/泛指写法各判红
- 升版: 不升
- 口径修订（船长 m04256，成员实测触发）:
  1. **冲突事实**：`tools/check_data.mjs:40-43` 的题源规则只为单一院校而写（`fileMatch /JYSG真题册/` → `need ['光华','431']`），而 statq.json 的 13 个院校组全在同一本 JYSG 真题册（p7–241）内 → 非光华题按实标注 `school` 会每题一条 ERR。裁定走选项 a：**扩规则**（不假标注、不靠 WARN 噪声）。
  2. **id 口径批准**：沿用 `^st-\d{4}-\d+$`，`<n>` 为**年内全局序号**，优先级 北大光华-431 → 复旦-432 → 其余按 statq.json 组序；同年多校不重排、后续批次取 `max(n)+1` 续编不回溯改号；**不加院校后缀**；唯一性与格式由断言守护。
  3. **契约留痕**：t54 已 amend 两次（revision 2）——inScope 加 `tools/check_data.mjs`、`docs/DATA_SCHEMA.md`；outOfScope 中宽泛的 `docs/` 拆成具体文档路径（避免完成校验把 `docs/DATA_SCHEMA.md` 判越界，T55 先例）。
  4. **窗口提示**：`tests/bank.test.mjs` 现为 42/43，失败断言 `:407`「econ 卡片例题（src 带四位年份）条数应为 148，actual 161」＝t51 新增 13 张卡的例题所致，已建 **T132** 处置；t54 不得顺手改 econ 期望值（三路写同文件）。

#### 派单摘要（可直接粘贴为切片开场，含三句话）
工作区 `D:\deepseek harness work\考研\Athena`。先读 `AGENTS.md`，禁止整仓通读。本切片只碰 `data/bank_stats.js`、`tests/bank.test.mjs`、`tools/check_data.mjs`、`docs/DATA_SCHEMA.md`、`backup/scratch/bank-statq/`；优先北大光华-431 → 复旦-432 → 其余（按 statq.json 组序）；闸门＝`node --test tests/bank.test.mjs` + `node tools/check_data.mjs`。

### 报告
<!-- 执行者一次追加；格式 WORKFLOW §7.4：改了什么 → 闸门 PASS/FAIL → 未做项 -->
**船长验收（accepted，t54 / stat-eng，attempt 1）**
- 改了什么：`data/bank_stats.js` 186 → **262 题**（新增 76 条 `origin:'year'`、id `st-<年>-<n>`，2021–2026 覆盖 9/25/7/13/13/9；既有 186 题逐字节不变、TYPES 未动）；`tools/check_data.mjs` 新增 `JYSG_SCHOOL_GROUPS`（13 组内联）+ `oneOf` 语义；`docs/DATA_SCHEMA.md` 4 处同步（:102 / :313 / :321 / :80 = 331 + 163 + 262 = 756）。三层去重复算：转写 111 → 判重 35 → 装配 76。
- 闸门：`node tools/check_data.mjs` **exit 0**（ERR=0 / WARN=1＝T130 的 math3 `$`）、题库行 `stats 262 题 | 11 题型 | school=262/262（90 个来源）| 卡片派生=170`、全库真题 **756**；`check-bank-statq.mjs` 30 项 0 失败；`check-src-rule.mjs` 17/17（13 正证 + 4 判红）。
- 船长独立复算 `backup/scratch/captain-verify-t54/check-bank-stats.cjs`：total 262 / byOrigin {year 92, card 170} / dupes 0 / typeMissing 空 / newCount 76 / distinctNewSchools 13 / JYSG 同源违规 0 / 字段缺项 0 / 新题 id 与年份不符 0（脚本 `badIdCount: 170` 系正则只匹配 `st-*` 的误报，非数据缺陷）。
- 口径裁定：`node --test tests/bank.test.mjs` 实测 **42/43 exit 1**，唯一失败 `tests/bank.test.mjs:407`（econ 期望 148 vs 161，t51 引入、归 T132/t62，先于本任务存在）；成员 `commandsRun` 记 passed 与实际不符，船长按「诚实记录 + 由后继任务转绿」放行、不作失败登记，并已给 t54 追加 `evidence_note`（T122/T123 先例）。
- 未做项：stats `school` 三套写法并存（登记后续清理）；护栏 331/262/756 随 T132 后统一复测（归 T128/t63）；三份未入库清单（35 条重复对照 / 10 组未转写院校 / 上交 2022 卷 20 单选 + 2 简答）转后续批次，详见 `backup/scratch/bank-statq/REPORT-t54.md`。

---
### T128 2.2.0 第一波独立验证（题库线 + 卡片线 + 取证线，含 T132 派生线）
- 状态: accepted（**verdict=pass，9/9 验收成立**；t63 于 2026-10-11T03:07:50+08:00 取时点；报告 `backup/scratch/verify-wave-a/T63-VERIFICATION-REPORT.md`）
- 负责: verifier2（任务 **t63**）——原任务 t55 已取消（依赖缺 t57 与 t52）；第一次重建的 t60 亦已取消：其依赖清单缺 **t62（T132）**，而 t62 会与 t60 同时就绪，若 t60 先跑 `tests/bank.test.mjs:407` 的 econ 期望仍红，会对合法中间态误判失败。`agent_teams_edit_plan` 在本团队不可用（历史任务引用已移除成员名 `style-eng`），故一律按「取消未开工 pending + 原契约重建」处置
- 契约继承与扩容: t63 的 objective/acceptance 在前版基础上补——① econ 派生线（148 → 161、全库 769、`MIN_TOTAL` 756 → 769）判据；② `school` 与 `src.file` 年份必须同源（预检曾抓 8 条 `m3-2010-*`）；③ `$ 未成对 WARN=0` 的判定口径＝「`✅ 全绿` 横幅 + 零 `[WARN]` 行 + 逐科 `$奇=0`」三者同时成立（`check_data` 成功路径不打印 ERR/WARN 计数）；④ 反证注入（派生题 star 改错 / 新增题 school 不同源 / econ 期望回退 148）各判红
- 文件集: 仅 `backup/scratch/verify-wave-a/`
- 依据: AGENTS.md + docs/WORKFLOW.md §5/§7 + 本波次七个任务块的验收行 + T128 预检报告（`backup/scratch/verify-wave-a/T130-PRECHECK-INDEPENDENT.md`）
- 依赖: T122、T123、T124、T125、T126、T127、T130
- 验收:
  1. 自建复算（不调用成员脚本）逐条核对：卡片派生题 298 条字段、math3 161 条与 manifest、统计增量与 `statq.json` 及三层去重、卡片线 27+8+13 张与缺口表对应
  2. 既有手写题与既有卡 id 集合零回归；注入反证 ≥3 判红并点名到题/卡
  3. 闸门 `node tools/check_data.mjs`、`npm test`、`npm run check:render` 全 PASS（本轮不做发行构建）
  4. 范围审计（受保护文件与各数据文件 sha256、越界 0）+ 诚实未覆盖清单
- 升版: 不升

#### 派单摘要（可直接粘贴为切片开场，含三句话）
工作区 `D:\deepseek harness work\考研\Athena`。先读 `AGENTS.md`，禁止整仓通读。本切片只写 `backup/scratch/verify-wave-a/`，被检文件只读；headless 探针端口 9333 硬编码，不可并行；闸门＝`node tools/check_data.mjs` + `npm test` + `npm run check:render`。

### 报告
<!-- 执行者一次追加；格式 WORKFLOW §7.4：改了什么 → 闸门 PASS/FAIL → 未做项 -->
- **结论：verdict=pass，9/9 验收成立**（verifier2 / t63 attempt 2 = `c1e361a2-0949-46fc-a266-51ac207b3faa`；取时点 2026-10-11T03:07:36–03:07:50+08:00；报告 `backup/scratch/verify-wave-a/T63-VERIFICATION-REPORT.md`）。
- **改了什么**：无（inScope 仅 `backup/scratch/verify-wave-a/`，被检文件只读）。自建复算脚本与产物：`recompute-a.mjs/.json`（28/28）、`recompute-b.mjs/.json`（10/10）、`adversarial-wave.mjs/.json`（10/10）、`head-blob.mjs`（自建 HEAD blob，sha1 自校验）、`precheck*.mjs`、`T63-VERIFICATION-REPORT.md`。
- **四条入库线复核**：卡片派生 **481**（math3 150 / econ 161 / stats 170）字段齐备（origin、tags、`star===META[0]`、`src.card`、EXAMPLE 逐字、`altAnswer===a2`、年份同源、note 索引）；math3 非卡片 **181** = choice 118 + fill 63 与 `tests/fixtures/bank-answer-manifest.json` missing 0 / extra 0；统计新增 **76** 覆盖 2021–2026（9/25/7/13/13/9）且逐条对齐 `docs/refs/statq.json` **13 院校组**（unmatched 0，13 组探针 13/13 唯一命中）；卡片线 **27 + 重写 8** 与覆盖表全等、微观 **13** 与 t51 表 id+cat 逐条一致、缺口行逐行计数与 `suggestCards` 全等。
- **零回归**：对自建 HEAD blob 逐题 `missing 0 / changed 0`；手写 55 与既有卡 199/288 不变；`school ↔ src.file` 同源 bad=0（8 条 `m3-2010-*` 已归零并由 `check_data` 守护）；范围审计 `src/fsrs-core.mjs` 与 HEAD 逐字节一致、越界 0。
- **反证 5 条**（基线 4 项全绿）：`cv-m3-lim09` star 改错 → 红；`m3-2010-1` school 改年 → 红（官方校验器同时 ERR=1，双通道）；删 13 条 econ 派生题（161→148）→ `bank.test` 3 例红；对**原白名单 id** `cv-m3-int29-2` 与**非白名单 id** `cv-m3-lim09` 各注入 1 个 `$` → 均红（`未成对(15 个)` @ `tests/bank.test.mjs:795`）⇒ 白名单撤除后判据**非选择性收紧**。
- **闸门（带时间戳）**：`node tools/check_data.mjs` exit 0（`✅ 全绿`、`[WARN]` 0 行 / `[ERR]` 0 行、逐科 `$奇=0`、真题 **769** / 派生 **481**）；`npm test` **356/356 pass**（fail 0 / skip 0 / todo 0）；`npm run check:render` 问题 0。三闸门时点内的 `data/bank_math3.js` = 恢复态 386972 B / `fa607b3f…`（事故窗口 386968 B / `bbdaa76c…` 不计入裁定）。
- **内容侧发现（不阻塞本轮，已转任务）**：**F1**（medium）`st-2025-12` ↔ `cv-st-test01` 同源重复（同校「复旦大学 432」同年 2025，J=0.541；t54 去重只覆盖批内与手写题，未与卡片派生题交叉）→ 已建 **T135（t67）**；**F2**（low）`st-2021-8`↔`cv-st-est13`（0.525）、`st-2021-9`↔`cv-st-est03`（0.462）同校异年近似 → T135 内登记不删。
- **未做项/口径**：本轮不做发行构建（`app.js`/`dist` 仍为波次前旧产物，收口轮统一构建）；若后续再改 `data/**`、`tests/bank.test.mjs`、`tools/check_data.mjs`，本轮闸门只对 03:07:50 时点成立，须重取时点；8 条未覆盖项见报告 §9（含 L2：`docs/BOARD.md`/`docs/COVERAGE.md` 由 t64 在途变更，不在产物判据内）。

---
### T129 2.2.0 第一波文档与边界回写（含 T132 终值）
- 状态: accepted（t64 交付并经船长验收；执行人为 **stat-eng2**——原 stat-eng 会话上下文耗尽，换新会话从断点续跑，在途改动保留）
- 负责: stat-eng2（任务 **t64**，attempt 3 = `38c92960-c7ef-4b4d-8330-c09bbe56d221`）——原任务 t56 已取消（依赖缺 t52 的 49 页结论与 t57 的 WARN 口径）；第一次重建的 t61 亦已取消：依赖缺 **t62（T132）**，T132 会让 econ 派生题 148 → 161、全库 756 → 769，若 t61 先跑会写出过期数字。第二次重建指派 stat-eng（t54 已由其实改 `docs/DATA_SCHEMA.md`，口径最熟；bank-eng 正按序做 t57 → t62，避免排队冲突）
- 文件集: 仅 `docs/COVERAGE.md`、`docs/ARCHITECTURE.md`、`docs/DATA_SCHEMA.md`、`docs/ACT.md`、`docs/refs/2.2.0-PLAN.md`、`backup/scratch/docs-wave-a/`
- 依据: AGENTS.md + docs/WORKFLOW.md §7/§8 + T91/T105 既有闸门（`backup/scratch/docs-refresh/`）
- 依赖: T122、T123、T124、T125、T126、T127、T130、**T132**
- 验收:
  1. 题量/卡片数与沿革链更新为第一波真实终值（题库 **769** = math3 331 + econ 176 + stats 262；卡片数逐科回读 `data/*.js` 实测），沿革链 47→45→54→55→225→523→680→756→769 保留；批次完成状态与剩余边界刷新（C5、Q4c/Q6、P0 其余、**O-1/O-2**、T125 微观 49 页结论）——注：**O-1/O-2 不是 PLAN 批次代号**，出自 T121（t48）报告「后续项（非阻断，船长登记）」，台账原文在 `backup/scratch/verify-refs4/rulings.json:142-143`：O-1＝`check_t46.py` 的 F-02b 守卫是字面量级（只回退结论行或只补短式都会判绿，应改结构式判据），O-2＝t46 登记的 den2/silu2b 取框（407.5/302）比实际使用（407.53/302.1）偏小；二者属取证线（P0）闸门增强项
  2. `DATA_SCHEMA` 字段口径（`origin`/`src.card`/`altAnswer`/id 规则/条件必需/无年份排除/JYSG 13 院校组 `oneOf`/`school` 与 `src.file` 同源）与 `tools/check_data.mjs` 实际校验一致
  3. `node backup/scratch/docs-refresh/verify-refs.mjs`、`audit-bare-refs.mjs`、`node backup/scratch/refs-plan/check_plan.mjs` → PASS（漂移逐条归因，不得机械位移）
- 升版: 不升
- 口径修订（船长 m04596，成员实测触发）: 成员跑基线闸门报出**闸门脚本自身过期**，船长实核后裁定（t64 为 kind=work，无契约可 amend，按消息授权 + 本台账记录，同 t3/t4 先例）：
  1. **授权原地更新 `backup/scratch/docs-refresh/verify-refs.mjs`**：三个锚点已死（`focusLevelBadgeEl` / `focusLevelBadge` / `showLevelTag` 全仓 **0 命中**，t41/t42 专注链 UI 重构所致）→ 换为现存符号（实核候选：`src/focus.mjs:3096 focusUnitTypeTagEl`、`src/focus.mjs:528 focusUnitTypeLabel`；settings 项须在 `src/settings.mjs` 内真正解析到，找不到就删锚点并写明由谁承担，**禁止锚到不存在的符号上假装通过**）。
  2. **结构计数改派生式**（原硬编 `math3:24 / econ:15 / stats:186`、`MIN_TOTAL=225`，见脚本 `L263/L265/L299`）→ 闸门自行 vm 载入 `data/bank_{math3,econ,stats}.js` 派生三科题量与总数，再断言与 `tests/bank.test.mjs` 的 `MIN_QUESTIONS`/`MIN_TOTAL` 一致（T69/t25 先例）；**不得改写成新的死值**。
  3. **授权原地更新 `backup/scratch/refs-plan/check_plan.mjs`** 的过期基线（`L82 B11` 49 → 0 且断言 rulings 190、`L115 C1` 421/476 → 434/489、`L116 C2` 468/8 → 481/8、F6 指纹白名单）；要求 `.before` 备份、旧值以 `_history` 注释留痕并注明「何时由谁因何更新」、B11 标题同步改名；报告注明该脚本原属 refs-lead 的 T82 交付物、本次由 stat-eng 在船长授权下刷新。
  4. **文件集扩充（船长授权）**: `docs/refs/INDEX.md`（R3 按 m02091 口径写「微观已闭合 49/49、裁定 190 条（j18 37 / rev 10 / ans 2）」）、`backup/scratch/docs-refresh/verify-refs.mjs`、`backup/scratch/refs-plan/check_plan.mjs`。
  5. **反证（必做，沙盒副本，日志进报告）**: ① 文档引用行号 +5 → 判红；② 锚点指向不存在符号 → 判红（证明未变永真）；③ `data/bank_math3.js` 副本删一题 → 派生式计数判红；④ `micro.json` 副本 `pending_total` 改回 49 → 判红。
  6. 最终口径：四脚本结果给「命令 → exit 码 → 失败项数 → 归因」四列；终值以绿窗口实测为准（学科 25 / 卡片 **2809** / 题库 **769** / 派生 **481**）。
  7. 教训：闸门「硬编符号名 + 硬编基线数字」本次双双击穿 → 已并入 T134 的验收纪律（验收只做只读复核，生成与闸门重跑一律在沙盒副本上）。

#### 派单摘要（可直接粘贴为切片开场，含三句话）
工作区 `D:\deepseek harness work\考研\Athena`。先读 `AGENTS.md`，禁止整仓通读。本切片只碰上述五份文档与 `backup/scratch/docs-wave-a/`，不改 `docs/BOARD.md`；引用行号必须回读核对；闸门＝`verify-refs.mjs` + `audit-bare-refs.mjs` + `check_plan.mjs`。

### 报告
<!-- 执行者一次追加；格式 WORKFLOW §7.4：改了什么 → 闸门 PASS/FAIL → 未做项 -->
- **改了什么**：`docs/COVERAGE.md`、`docs/ARCHITECTURE.md`、`docs/DATA_SCHEMA.md`、`docs/ACT.md`、`docs/refs/2.2.0-PLAN.md` 五份文档的终值/边界刷新；闸门换代＝`backup/scratch/docs-refresh/verify-refs.mjs`（三条死锚点换活符号 + 结构计数改派生式）与 `backup/scratch/refs-plan/check_plan.mjs`（十项过期断言换代 + `_history` 留痕），旧版各留 `.before`；证据与报告 `backup/scratch/docs-wave-a/REPORT-t64.md`（10 节，含逐条 acceptanceResults / commandsRun / 归因表 / 残余项）。未碰 `docs/BOARD.md`（其 +411 行台账属他人）、`data/*`、`src/**`、`style.css`、`dist`、版本七处；未跑 build。
- **终值（逐科回读 `data/*.js` 现算）**：卡片 **2809** = math3 397 / econ 301 / stats 226（验收里的「econ 301+？」已核实为 301）；题库 **769** = math3 331 + econ 176 + stats 262，卡片派生 150/161/170，真题侧 288 / 派生 **481**；沿革链 47→45→54→55→225→523→680→756→769 三处保留（`docs/COVERAGE.md:50`、`docs/ARCHITECTURE.md:144`、`docs/refs/2.2.0-PLAN.md:17`）。
- **边界刷新**：C5 未开工；Q4c、Q6 未开工（写明剩余量）；**O-1/O-2** 登记（来源见本块口径修订 7）+ 本轮新增 **O-3**；T125 微观 49 页 = t52 全闭合（`pending 0/0/0`、裁定 190）。
- **闸门（船长亲跑复核）**：`node tools/check_data.mjs` **exit 0**（学科 25 / 卡片 2809 / 题库 3 / 真题 769 / 派生 481，三科 `$奇=0`）；`node backup/scratch/docs-refresh/verify-refs.mjs` **exit 0**（引用 **335/335**、锚点失败 0、事实 14 条 ok、结构计数**派生式**：题库现算 ↔ `tests/bank.test.mjs` 护栏逐科相等）；`node backup/scratch/refs-plan/check_plan.mjs` **61 PASS / 0 FAIL**。基线 10 / 0 / 9 项失败逐条归因（B11←t52、B18·B19·C5←t53/t54/t62、C1·C2←t50/t51、F1←文档行移、F6←t52 三产物、G1·G3←T129 授权面），无机械位移。
- **闸门换代（船长授权）**：三条死锚点（t41 删除的 `focusLevelBadgeEl`/`focusLevelBadge`/`showLevelTag`）→ 活符号 **`focusUnitTypeTagEl`（`src/focus.mjs:3096`）/ `focusUnitTypeLabel`（`src/focus.mjs:528`）/ `actSanitizeFocusSettings`（`src/settings.mjs:82`）**（船长已逐一回读定义行确认）；「禁止复活」改由 FACTS 期望 `false` 守；结构计数改派生式（不再硬编 math3/econ/stats 题量与 `MIN_TOTAL`）。
- **反证（沙盒 cp/root，19 项 + 引用闭包）**：六类单点变异全判红——refs5 / deadanchor / factrevive / delq / pending49 / guardbump，restore 后复跑全绿 ⇒ **判据未被改松**。引用回读修正 5 处真漂移（`tools/check_data.mjs` :27→:35、:202-206→:220-224、:40-56→:54；`src/bank.mjs` :940-941→:968-969；`src/wrong.mjs` :364→:357）。
- **未做项/残余（non-blocking，登记于 `docs/refs/2.2.0-PLAN.md` §1.3 与报告 §8）**：O-1/O-2/O-3 均 low；`data/bank_math3.js:1` 头注释仍写「共 174 题」与实际 331 不符（**已由船长 amend 进 T135/t67 验收 9 一并清理**）；C5 / Q4c / Q6 未开工。

---
### T130 2.2.0 上游数据修复：EXAMPLE.int29 答案定界符未成对（check_data 唯一 WARN）
- 状态: accepted
- 负责: bank-eng（任务 t57）
- 文件集: 仅 `data/math3.js`、`data/bank_math3.js`、`tests/bank.test.mjs`、`backup/scratch/upstream-fix/`
- 依据: AGENTS.md + docs/WORKFLOW.md §7 + T122 报告的唯一 WARN（船长实测 `data/math3.js` 的 `EXAMPLE.int29[1].a` 美元符号计数 = 13，奇数）
- 依赖: T126、T127
- 验收:
  1. 上游 `EXAMPLE.int29[1].a` 定界符成对（数学内容不变）；重算后 `cv-m3-int29-2.answer` 与上游逐字一致、生成器幂等
  2. `node tools/check_data.mjs` 的 `$ 未成对` WARN 归零（ERR=0 WARN=0）；`KNOWN_ODD_DOLLARS` 白名单撤除或更新
  3. `node --test tests/bank.test.mjs` → PASS 且用例数不减；其余题库条目逐字节不变
- 升版: 不升
- 独立预检（T128 前置，verifier2 于 14:39:52Z / 14:38–14:47Z 两趟，证据 `backup/scratch/verify-wave-a/T130-PRECHECK-INDEPENDENT.md` + `precheck.json` / `precheck-t2.json` / `sandbox-mutation.json`，自建 6 脚本未调用 bank-eng 任何脚本）:
  1. **准备阶段结论独立复现 11/11 PASS**：三源 `$` 奇数 math3 **1** / econ 0 / stats 0（唯一 `int29[1].a`，自建状态机报 `inline closed by run(2) @495` + `unclosed inline at EOF`）；修法 A 复核＝源文件差异**恰 1 行 @L2367 / 首差列 844 / Δ+1，插入片段就是 `$`**，`(Ⅱ) $V=` 在主树恰 1 命中；修复态 sandbox `check_data` **✅ 全绿（零 `[WARN]` 行）**、`bank.test` 43/43；`cv-m3-int29-2.answer` 与修好上游逐字一致（修复态 14↔14；主树 13↔13 亦逐字一致 ⇒ 题库是上游忠实镜像，WARN 源于上游而非入库改写）。
  2. **白名单「不得残留放行」运行期反证**：3 个整目录副本（`sandbox-ref/`、`sandbox-mut-known/`、`sandbox-mut-other/`，`upstream-fix/**` 零改动）各在目标答案首个 `$` 后只插 1 个 `$` → 基线 43/43 绿；注入曾入册的 `cv-m3-int29-2` → **fail 2**（`AssertionError: math3 cv-m3-int29-2.answer 的 $ 未成对（15 个）` @ `tests/bank.test.mjs:772`）；注入从未入册的 `m3-2025-1` → **fail 1** 同处判红 ⇒ 撤除是真撤除、断言非选择性收紧（`noResidualPermissivePath=true`）。主树白名单仍在册（t57 未执行），故 t60 验收 4 只能在 t57 之后成立。
  3. **口径修正（已并入 T128/t60 验收 4）**：`check_data` 成功路径**只打印 `✅ 全绿` 横幅、不打印 ERR/WARN 计数** ⇒ 「WARN=0」须由「横幅绿 + 零 `[WARN]` 行 + 逐科 `$奇=0`」三者共同成立。
  4. **时点（T2）**：t50/t51 已落地、t53 仍在写——`data/econ.js` 266720 → **318940 `bb9d7bd2`**（t51，13 张新卡；EXAMPLE 键 131/149 不变 ⇒ 增的是卡体）、`data/stats.js` 258820 → **315026 `1de65e60`**（t50，同理 166/177 不变）、`data/bank_math3.js` 221390 → 229457 → **229588 `e4bd9b03`**、`tests/bank.test.mjs` 132525 `13b451f7`、`tools/check_data.mjs` 19788 → 19785 `a8b42cb2`。t50/t51 新写卡片**未**引入奇数 `$`。
  5. **主树闸门在 T2 转红（窗口中间态，非 t57 缺陷）**：`❌ ERR=39 WARN=9 exit=1`——ERR 13×3 全属 `[微观经济学] econ`（`META 缺失` / `PITFALL 引用不存在的` / `REL 源`，＝t51 的 13 张新卡在途半成品）；WARN＝1× `cv-m3-int29-2` 奇数项（t57 目标）＋ **8× `m3-2010-1..8 school 与 src.file 年份不一致: …数学三 2010 年 vs 2025`**（t53 部分插入，math3 题数 174→182）。同一校验器下 sandbox 仍 ✅ 全绿 exit 0。船长已就此向 math-eng2（t53）与 micro-eng2（t51）发出收尾前必须清零的要求。
  6. **未覆盖**（预检层面）：未执行 t57 本体、未跑 `npm test` 全量/未跑 build、未核修法 A 的题面语义是否与纸质真题一致、sandbox 是 14:0x 副本（其 econ/bank_math3 仍为老版本，故相关判定只证副本自洽）。

#### 派单摘要（可直接粘贴为切片开场，含三句话）
工作区 `D:\deepseek harness work\考研\Athena`。先读 `AGENTS.md`，禁止整仓通读。本切片只碰 `data/math3.js`、`data/bank_math3.js`、`tests/bank.test.mjs` 与 `backup/scratch/upstream-fix/`，且必须在 T126、T127 交付后开工；T128 前置预检结论（修法 A 恰 1 行 1 字符、白名单须做运行期反证、`check_data` 成功路径不打印计数）已在任务块内，开工前请复读；闸门＝`node tools/check_data.mjs` + `node --test tests/bank.test.mjs`。

### 报告
<!-- 执行者一次追加；格式 WORKFLOW §7.4：改了什么 → 闸门 PASS/FAIL → 未做项 -->
**船长验收（accepted，t57 / bank-eng，attempt 1，完成时点 2026-10-11 01:20:23 +08:00）**
- 改了什么：① `data/math3.js` 的 `EXAMPLE.int29[1].a` 由 `(Ⅱ) $V=` 改为 `(Ⅱ) $$V=`（**只插 1 个 `$`**，数学内容零改动；修法血统：同题 (Ⅰ) 段已是 `故$$S=…$$`、`int29[0]` 同风格）；② `data/bank_math3.js` 经既有生成器重算哨兵块；③ `tests/bank.test.mjs` 的 `KNOWN_ODD_DOLLARS` 白名单 4 处补丁**整体撤除**（残留 0，用例数 43 不减）。
- 关键处置（留证）：`build-bank-cv2.mjs` 的注入点在 DATA 数组末尾，与 t53 真题块同处末尾 ⇒ 直接重跑会把 t49 卡片块整段搬走（约 1100 行无语义位移）。生成器不在 inScope，故新增**保序包装** `backup/scratch/upstream-fix/regen-math3.mjs`（snapshot → lift → 生成器 `--write` → restore → verify），t53 段按基线摘出的同一段字节放回。
- 闸门：`node tools/check_data.mjs` → **exit 0 / ERR=0 / WARN=0**（本波次首次 WARN 归零；三科 `$奇=0`；math3 331/13/150、econ 163/10/148、stats 262/11/170、真题 756、origin=card 468）；`node --test tests/bank.test.mjs` → **42/43 exit 1**，唯一红项 `tests/bank.test.mjs:409` 的 econ 期望值（kept 148 vs 现状 161）。
- 船长独立取证（不调用成员脚本）：`data/math3.js` 321316 B `530f8ba30413614fad689fdd42b515f26b70d15b77a137a5f1dff51fd4303209`、`data/bank_math3.js` 386972 B `fa607b3f46887c69c0da31cafaaae26f6d297083af26e8c785725876f39547e9`、`tests/bank.test.mjs` 132816 B `cae540a41635b7faf01c4300ab6d55896c0abdeed437df5bcad6af820f1e46e6`；自写逐行 diff 对 `baseline/{math3.before.js,bank_math3.before.js}`（3041/2613 行）→ **各恰 1 行差异**（`@2367` `$` 45→46；`@567`）；`(Ⅱ) $$V=` 在 `data/math3.js` 恰 1 命中；载入题库实测 total 331、`cv-m3-int29-2.answer` `$`=14（偶）、末尾 `…\right)$$`；`KNOWN_ODD_DOLLARS` 在 `tests/*.test.mjs` 残留 0；复跑成员 `regen-math3.mjs verify` → 差异行 1、题数 330→330、id 数 332→332、✅ 通过。
- 口径裁定：契约验收 3 的「`bank.test` PASS」在交付时点为 42/43，唯一红项属 **T132（t62）** 且与 t57 正交（成员改动前同红同用例名、已如实披露）→ 按 T122/T123/T127 先例**作窗口态放行，t57 不作失败登记**，已给 t57 追加 `evidence_note` 记录该条记录与实测差异。
- 未做项 / 移交：econ 侧两文件的同步（派生 148 → 161、期望值派生、`MIN_QUESTIONS.econ`/`MIN_TOTAL` 到 756 → 769）归 **T132（t62）**；`regen-math3.mjs` 保序包装留给后续需要重算 math3 的任务复用。

---
### T131 题库校验：traps/hint 改「条件必需」并同步文档口径
- 状态: accepted
- 负责: bank-eng（任务 t58；kind=work 的维护型任务，验收按下列硬执行，不因 kind 而降级）
- 文件集: 仅 `tools/check_data.mjs`、`docs/DATA_SCHEMA.md`、`backup/scratch/bank-validator/`
- 依据: 船长裁定 m04064/m04077（见 T126「口径修订 3」）+ `docs/DATA_SCHEMA.md` 既有自述「条件必需（存在即非空）」与校验器实现（`tools/check_data.mjs:203-209` 对 `origin !== 'card'` 强制非空）不一致
- 依赖: 无（先于 T130/t57 执行；t57 也依赖同一校验器的 WARN 口径）
- 验收:
  1. `origin:'year'` 不再强制 `traps`/`hint`：字段**缺失**合法；**存在但为空串/非字符串**判红；覆盖全部 origin（含 `card`）
  2. 反证 ≥3 条，逐条给改动前后退出码与 ERROR 文本：① year 题缺 `traps` → 合法；② year 题 `traps:''` → 判红且点名该题；③ card 题 `hint:''` → 判红；注入在临时副本上进行，不改正式 `data/*.js`
  3. `git diff -- tools/check_data.mjs` 证明只动 `traps`/`hint` 分支，其它字段（`stem`/`answer`/`options`/`tags`/`star`/`origin`/`src.card`/`school` 等）校验逐字未改；改动前后 `node tools/check_data.mjs` 均 exit 0
  4. `docs/DATA_SCHEMA.md` 的 `traps`/`hint` 两行口径同步为「条件必需：源有则必填非空、无则省略字段（适用全部 origin）」，引用行号必须回读源码核对
  5. 闸门 `node tools/check_data.mjs` + `node --test tests/bank.test.mjs`（43 条不减）exit 0；不改 `tests/`、`src/`、任何 `data/*.js`
- 升版: 不升

#### 派单摘要（可直接粘贴为切片开场，含三句话）
工作区 `D:\deepseek harness work\考研\Athena`。先读 `AGENTS.md`，禁止整仓通读。本切片只碰 `tools/check_data.mjs`、`docs/DATA_SCHEMA.md` 与 `backup/scratch/bank-validator/`；闸门＝`node tools/check_data.mjs` + `node --test tests/bank.test.mjs`。

### 报告
**改了什么**
- `tools/check_data.mjs`（5/8）：`traps`/`hint` 判定去掉「`origin !== 'card'` 时缺字段判红」分支 → `if (q[fld] == null) continue;` + 存在即必须为非空字符串；契约注释同步为「两族统一为条件必需（t58）」。
- `docs/DATA_SCHEMA.md`（6/5）：`:100`/`:101` 字段行写明「t58 起对全部 origin 一致（含 year/card）」、`:133` 卡片表同口径、`:311` 缺字段 ERR 行移出 `traps`/`hint`、新增 `:312`「存在但为空串/非字符串」ERR 行（引 `tools/check_data.mjs:202-206`）、`:321` 过期题量下限修正为 t49 实测值（引 `tests/bank.test.mjs:67`/`:68`）。

**船长亲跑闸门**
- `node tools/check_data.mjs` → **exit 0**，`ERR=0 WARN=1`（唯一 WARN 仍是 `cv-m3-int29-2.answer` 的 `$` 未成对 13 个，归 T130/t57）；学科 25 / 卡片 2769 / 题库 3 科（math3 174、econ 163、stats 186）/ 真题总数 523 / origin=card 468 / 题源一致性 116 组 0 多写法。
- `node --test tests/bank.test.mjs` → **exit 0（43/43，用例数未减）**。
- `git diff -U2 -- tools/check_data.mjs` 船长逐行复核：仅 `traps`/`hint` 分支与两处注释变化，`stem`/`answer`/`options`/`tags`/`star`/`origin`/`src.card`/`school`/题源一致性/输出格式逐字未改；`git diff --numstat` = check_data `5/8`、DATA_SCHEMA `6/5`，与自报一致。
- 边界复核：`data/bank_math3.js` sha256 `E0D0FBF05ECB2A2121D26B9D4422B0B19D842027F1F3B67004C9112B944A2E9C`、`data/bank_econ.js` `986EFBFC397798247C7A2FBA37992A46EB0C1F6E3C4797B4D58AFE5A11BA28DB`（与 t49 落盘值逐字一致，未越界）。

**成员侧证据（采信，未独立重跑）**
`backup/scratch/bank-validator/`：`prove-conditional.mjs` 6/6（A `year` 缺 `traps` exit 1→0 为唯一行为变化；B `year traps:''`、C `card hint:''`、E `traps:42` 改动前后均 exit 1 且点名该题；D `card` 缺 `hint` 前后均 0；基线前后均 0），临时副本注入 + HEAD 版校验器对照；`diff-guard.mjs` 13 行 +/- 全在目标分支；`boundary-check.mjs` 8/8；`read-back-lines.mjs` 26 条行号断言 0 失败（成员自纠 5 处凭记忆行号）。

**未做项/待主对话决策**
- 未跑 `npm run build`（按本波次约定，构建归收口轮）。
- 本报告的数据/哈希时点为 **t53 交付前**；t53 入库净新增 157 条后须重跑 `node tools/check_data.mjs` 与 `node --test tests/bank.test.mjs`（已记入 T126）。
- `docs/DATA_SCHEMA.md` 的二次核对（含本次改动与全波次事实对齐）留给 T129（t56）。

### T132 微观新增 13 张卡的例题入库 + 期望值派生（解 t51 引入的 bank.test 护栏红）
- 状态: accepted
- 负责: bank-eng（任务 t62）
- 文件集: 仅 `data/bank_econ.js`、`tests/bank.test.mjs`、`backup/scratch/bank-cv3/`
- 依据: AGENTS.md + docs/WORKFLOW.md §7 + 用户口径 m02736（卡片所附例题必须全部进题库）+ `backup/scratch/cards-micro/t51-report.md`
- 依赖: T127（t54，统计真题入库）、T130（t57，上游 `$` 修复）——三者共写 `tests/bank.test.mjs`，必须串行
- 验收:
  1. `data/bank_econ.js` 派生题 **148 → 161**（`origin:'card'`，id 按既有派生规则 `cv-ec-<cardId>` / 同卡第 2、3 条 `-2`/`-3`），非卡片手写题 15 条逐字不变，全库题量 **756 → 769**
  2. `tests/bank.test.mjs` 中 econ 期望条数改为**从 `data/econ.js` 派生**（消除硬编 148），但必须原样保留该用例六条硬断言（id 一一对应 / 无年份不入库 / 手写题保留 / 题干答案逐字同源 / traps·hint 条件必需 / tags=[卡片 id] 且 star=META[0]），不得删除、放宽或 skip
  3. 下限护栏同步（`MIN_QUESTIONS.econ` 163 → 176、`MIN_TOTAL` **756 → 769**，勿回退 t53/t54 已推到的 331/262/756）；无新增 ERR/WARN（T130 落地后应为 0）
  4. 幂等（脚本连跑两次逐字节相同）＋自建复算 `backup/scratch/bank-cv3/check-cv3.mjs`（不调用生成器）exit 0；无年份排除项逐条登记 `backup/scratch/bank-cv3/excluded.md`
  5. `node --test tests/bank.test.mjs` 43/43、`node tools/check_data.mjs` exit 0，报告贴两条命令的结果行原文与时间戳；**不跑 `npm run build`**
- 升版: 不升
- 契约修订（船长，revision 1）: 原验收写的「全库 680 → 693 / `MIN_TOTAL` 680 → 693」是 T132 建块时的口径，已被 t53（math3 331）与 t54（stats 262、全库 756）超越 → 改为 756 → 769 系；另补「无年份排除登记」「不跑 build」「不改版本七处」三条；verify 收敛为 `node --test tests/bank.test.mjs` + `node tools/check_data.mjs`。
- 触发事实（船长 m04256 复核时实测）: `tests/bank.test.mjs:407` `AssertionError: econ 卡片例题（src 带四位年份）条数应为 148`，`actual: 161`——t51 在 `data/econ.js` 追加 13 张卡（nx06/nx07/te10/gm21/gm22/fl16/fl17/we15/we16/ad11/ad12/ad13/ad14）并修复 EXAMPLE 嵌套后，顶层 EXAMPLE 键 131 → 144、带年份条目 148 → 161，而题库线未同步入库。t53 完成时该护栏确为 43/43（自报属实），红是在 t51 落地后才出现的窗口态，不属 t53 缺陷。

#### 派单摘要（可直接粘贴为切片开场，含三句话）
工作区 `D:\deepseek harness work\考研\Athena`。先读 `AGENTS.md`，禁止整仓通读。本切片只碰 `data/bank_econ.js`、`tests/bank.test.mjs`、`backup/scratch/bank-cv3/`；既有入库口径与生成器见 t49 的 `backup/scratch/bank-cv2/`；闸门＝`node --test tests/bank.test.mjs` + `node tools/check_data.mjs`。

### 报告
<!-- 执行者一次追加；格式 WORKFLOW §7.4：改了什么 → 闸门 PASS/FAIL → 未做项 -->
**船长验收（accepted，t62 / bank-eng，attempt 1，完成时点 2026-10-11T01:32+08:00）**
- 改了什么：`data/bank_econ.js` 163 → **176 题**（手写 15 逐字节不变 + 卡片派生 148 → **161**，13 张 t51 新卡各 1 题：nx06 2024 / nx07 2009 / te10 2009 / gm21 2024 / gm22 2009 / fl16 2025 / fl17 2025 / we15 2011 / we16 2012 / ad11 2011 / ad12 2025 / ad13 2025 / ad14 2021）；`tests/bank.test.mjs` 的 econ 期望改为**从 `data/econ.js` 现算**（`ECON_CARD_PARTS` :397-401）+ 新增下限 `floor: 161`（:419-424），护栏 `MIN_QUESTIONS.econ` 163 → 176（:72）、`MIN_TOTAL` 756 → 769（:73），六条硬断言未删未放宽（43 用例 / skip 0 / todo 0）；唯一无年份排除项 `mk31` 第 1 条登记 `backup/scratch/bank-cv3/excluded.md`。
- 闸门（船长亲跑，均 exit 0）：`node --test tests/bank.test.mjs` → **43/43**（`ℹ tests 43 / pass 43 / fail 0`），t57 时点的唯一红项（econ 期望 148 vs 161）已转绿；`node tools/check_data.mjs` → **exit 0 / ERR=0 / WARN=0 / ✅ 全绿**，`econ 176 题 | 10 题型 | school=176/176（21 个来源）| 卡片派生=161`，全库 `真题总数 769 | origin=card 481`。
- 船长独立复算 `backup/scratch/captain-verify-t62/check-bank-econ.cjs`（不调用成员脚本）：total 176 / byOrigin `{year 15, card 161}` / dupes 0；161 条派生题的 `tags === [src.card]`、`star === META[cardId][0]`、卡片存在性 → **问题 0**；**手写 15 题与 `git show HEAD:data/bank_econ.js`（2.1.1 发布态）逐条 JSON 对拍差异 0**。
- 幂等复现（船长亲跑）：`backup/scratch/bank-cv3/build-bank-cv3.mjs` 与 t49 生成器 `build-bank-cv2.mjs` **sha256 逐字节相同**（`3a75dd86d77d7145c91fcf24ceb9862e0aa88f221f52ff2df8331bd9070571c0`）；我快照后重跑 `--write` → 输出「新增 161 题，排除 1 条」exit 0，`data/bank_econ.js` 仍 **266136 B / `4630a701bbab74e89d09f1eb97f7569b887ddf20cb067067caf83417a1d5bb30`**（逐字节不变，证明文件确为生成器产物且幂等）。
- 成员证据采信：`check-cv3.mjs` 独立复算 1364 项断言 exit 0（含手写区 `ee2e95ca…`、尾部 `ca8877e3…`）；`prove-cv3.mjs` 沙盒缺陷注入 5 例全判红（answer 42/43、drop 40/43、year 42/43、star 42/43、shrink 40/43，基线 43/43），其中 shrink 证明「期望值现算」未留后门。
- 边界：未跑 `npm run build`；outOfScope 零改动（`data/econ.js` `5e741db2…` 未变、`src/**` / `style.css` / 版本七处 / `docs/BOARD.md` 未碰）。报告 `backup/scratch/bank-cv3/report.md`。
- 后续：T132 完成即解锁 **T128（t63）** 与 **T129（t64）**——两者现只受 **T125（t52 微观 49 页裁定）** 阻塞；全库终值 **769 = math3 331 + econ 176 + stats 262**。

---

### T133 微观十八讲 20 条既有裁定的可读分辨率重新取证（R154–R173）
- 状态: accepted
- 负责: micro-eng2（任务 t65）——由船长指派：refs-lead（t52）受 `AgentTeams member delegation limit (0)` 限制无法自行派子代理，只能串行；为不拖住 T125 的 17 页新页进度，20 页重渲取证单独派单
- 文件集: 仅 `backup/scratch/refs-micro-hi18/`（`crops/`、`frag/`、`INDEX.md`）；**只读**复用 `backup/scratch/refs-micro-p0/band_plan.json`
- 依据: AGENTS.md + docs/WORKFLOW.md §7 + `docs/refs/README.md` §2/§2.6（裁片体积上限）+ 船长 m04345 质量口径（48 dpi 栏带只可定位，裁定依据须 ≥100 dpi 或单字墨迹 ≥12 px 且 ≤400 KB / ≤1400 px）
- 依赖: T125（t52）只读——不阻塞；二者产物在 T125 收尾时合并
- 触发事实: refs-lead 自查报出「已落的 20 条 j18 裁定（R154–R173）只有 48 dpi 依据」，不满足新增标准；页表＝1,2,4,5,17,18,32,35,38,50,60,100,103,109,112,115,116,130,164,168
- 验收:
  1. 20 页逐页有 `frag/hi-j18-p<NNN>.json`，字段齐（id/key/page/year/sec/fam/conf/sources/crops[]/read ≥20 字/concl/conf_note/supersedes/fresh_read_match）；每页裁片 ≤400 KB 且最长边 ≤1400 px，登记含 box + dpi + 像素 + 字节 + sha256 + 完整命令
  2. `INDEX.md` 20 行（页 → id → 裁片数 → match → sha256 前 12 位）；`supersedes` 一律写 `R<旧编号>@48dpi`
  3. 主通道自带读图、全程禁用 modlens；与旧 48 dpi 读数不符时以新裁片为准并写 `fresh_read_match:false` + `diff_note`；取图连续两次失败登记 `unreadable` + 原因，不得凭印象补写
  4. 不写 `backup/scratch/refs-micro-p0/`、`docs/refs/rulings/micro.md`、`docs/refs/micro.json`（合并归 refs-lead）
- 升版: 不升

#### 派单摘要（可直接粘贴为切片开场，含三句话）
工作区 `D:\deepseek harness work\考研\Athena`。先读 `AGENTS.md`，禁止整仓通读。本切片只写 `backup/scratch/refs-micro-hi18/`（裁片 + 一页一 frag + INDEX.md），只读复用 `backup/scratch/refs-micro-p0/band_plan.json` 的 95 dpi 取框计划；主通道为自带读图能力、全程禁用 modlens；闸门＝自建 INDEX 与裁片体积/尺寸核对（≤400 KB / ≤1400 px）。

### 报告
<!-- 执行者一次追加；格式 WORKFLOW §7.4：改了什么 → 闸门 PASS/FAIL → 未做项 -->
**船长验收（accepted，t65 / micro-eng2，attempt 1 = `eab5e074-f2a2-4dc2-8539-05248de14c43`）**
- 改了什么（全部在 `backup/scratch/refs-micro-hi18/`，未碰 `backup/scratch/refs-micro-p0/` 与 `docs/refs/**`）：`frag/hi-j18-p<NNN>.json` **20 份**（页 1、2、4、5、17、18、32、35、38、50、60、100、103、109、112、115、116、130、164、168 → id R154–R173；字段 id/key/page/year/sec/fam/conf/sources/crops[](box+dpi+像素+字节+sha256+完整命令)/read/concl/conf_note/`supersedes`/`fresh_read_match`）；`crops/` **46 张** 95 dpi 裁片；`INDEX.md`（20 行：页→旧编号→裁片数→fresh_read_match→sha256 前 12 位→文件）；`VERIFY.md` 与自检脚本 `verify_hi18.py`。
- **两处实印与旧 48/30 dpi 旧读不符（以新片为准，frag 内已写 `diff_note`、`fresh_read_match:false`）**：① R155（p2 书名页）旧读称页脚有「北京大学出版社社标」，新片未见（应在 PDF 第 3 页版权页）→ 属旧读**页际归属**错误；② R156（p4 作者简介）旧读「**1985**—1989 年在北大经济管理系任讲师」，实印为「**1986**—1989 年」（1985 年是获硕士并留校）→ 旧读**年份起点**错误。其余 **18 页逐字吻合**（`match_true=18`）。
- 两处 `band_plan` 必要偏离（未改 `band_plan.json`，frag 内记录）：p18 的 b 带起点 1180.5 会切断 (1.20) 式 ⇒ 上移到 1140 重渲（旧 sha 作废），另加 140/300 dpi 放大片核对 `MRS_{i,j}=p_i/p_j` 下标；p35/p60 带上沿扩到 y=110 以纳入页眉印刷页码（27 / 52）；封面与书名页按标题行拆 4/6 带守住 400 KB 上限。
- **船长独立取证（不调用成员脚本）**：自写审计逐份回读 JSON 并重算裁片哈希 → `frags 20 / crops_onDisk 46 / referenced 46 / orphans 0 / hashMismatch 0 / noSupersedes 0 / shortRead 0 / missingFiles 0 / match {true 18, false 2}`；体积与像素上限 → 最大 **383.5 KB**（>400 KB 者 0）、最长边 >1400 px 者 **0**；确定性 → 我按 frag 内 `cmd` 亲自重渲 `p050_a`（`参考文件/_venv/Scripts/python.exe tools/refs-vision.py --pdf "参考文件/教材讲义/微观/微观经济学十八讲.pdf" --page 50 --dpi 95 --box 232,225,1287,1191`）得 **297041 B / sha256 `497381607cba7bf62240ac61ccae39ecf9880d2e9d202fd3c9025a1719d446f1`**，与登记逐字节一致（产物留在 `backup/scratch/captain-verify-t65/`）；`read_image` 亲读该片：正文与 R163 的 `read` 逐字吻合（(3.34) −D_a(p,a)/D_p(p,a) = 1/D = 1/q、(3.35) ε_a/ε_p = a/(pq)、「第四节 价格变化的福利效应与消费者剩余的测量」），**证据质量达标**。
- 成员自检采信：`verify_hi18.py` exit 0（frags=20 crops=46 on_disk=46 orphans=0 match_true=18 fail=0 warn=0）；`tools/refs-vision.py --verify` 对 p50_a/p130_a/p168_b 重渲同值。
- 边界：未跑 `npm run build`；`git status` 无 inScope 外新增（`backup/` 已 gitignore）；无 `unreadable` 页。
- 未做项 / 移交：**合并归 refs-lead（T125/t52）**——20 条 R154–R173 的证据须换为 hi-res 裁片，`supersedes` 与 `diff_note` 须落入 rulings 文本；两处 `fresh_read_match:false` 必须在最终交付里**显式写明「已更正」**（不得静默替换）。
- 过程记录（调度）：T133 不在 T128（t63）/T129（t64）的依赖清单内（`agent_teams_edit_plan` 在本团队永久不可用，无法追加）⇒ 改以消息要求 refs-lead 在 t52 收尾**之前**完成合并，船长在 t52 交付时补核该合并是否落地。

---

### T134 修复 data/bank_math3.js 语法回归（缺行尾逗号）并恢复 t57 交付态
- 状态: pending（bank-eng 任务 t66，attempt 2，attempt_id `9a0ca6b5-74c9-4f13-9fa6-26acbdf01d54`）
- 负责: bank-eng（任务 t66）——题库数据侧负责人；由船长 `reassign_task` 指派（`edit_plan` 在本团队永久不可用）
- 文件集: `data/bank_math3.js`（唯一数据文件）；新增 `backup/scratch/bank-fix4/`（证据）；工具守卫 `backup/scratch/bank-cv3/build-bank-cv3.mjs`、`backup/scratch/bank-cv2/build-bank-cv2.mjs`、`backup/scratch/upstream-fix/notes.md`
- 依据: refs-lead 在 T125 交付时报出的外部阻塞 + 船长实测
- 依赖: 无（最高优先级）
- 验收:
  1. `data/bank_math3.js` 恢复为 t57 交付态 **sha256 `fa607b3f46887c69c0da31cafaaae26f6d297083af26e8c785725876f39547e9` / 386972 B**（可用 `backup/scratch/upstream-fix/sandbox/data/bank_math3.js` 或 `backup/scratch/bank-cv3/tmp/sandbox/data/bank_math3.js` 两份独立副本恢复；**以哈希对拍收口**，不接受逐行手补后声称等价）
  2. 结构闸门：`node --check data/bank_math3.js` exit 0；vm 载入 `window.BANK.math3.questions.length === 331`；id 无重复；`cv-m3-int29-2.answer` 的 `$` 计数为偶数（14）且末尾 `\right)$$`
  3. 四闸门全 exit 0：`node --test tests/bank.test.mjs`（43/43）、`node tools/check_data.mjs`（ERR=0 / WARN=0 / `✅ 全绿`）、`node --test tests/build.test.mjs`（11/11）、`node backup/scratch/refs-plan/inventory.mjs`（refs-lead 报出的失败调用点，须转绿）
  4. 防复发守卫：两份原始生成器在 `--write` 且 subject 含 math3 时**默认拒绝**并打印指向 `regen-math3.mjs` 的提示，除非显式 `--allow-math3-reorder`；`upstream-fix/notes.md` 补「事故记录 + math3 正确入口」
  5. 证据落盘 `backup/scratch/bank-fix4/`：恢复命令、恢复前后 sha256/字节、四闸门原始输出、守卫反证日志（不带放行参数时必须非 0 退出且不动文件）
  6. 边界：不改 `data/bank_econ.js`、`data/bank_stats.js`、`data/math3.js`、`tests/**`、`tools/**`、`src/**`、`style.css`、`docs/**`；不跑 `npm run build`
- 升版: 否（波次内不 commit）
- **事故记录（船长自述，2026-10-11）**: 船长在 t62 验收时误跑 `node backup/scratch/bank-cv3/build-bank-cv3.mjs --write`——该脚本默认 `--subject all`，把 math3 也交给**原始生成器**重新生成；该生成器对 math3 会破坏/重排 t53 真题块与 t49 卡片块（t57 早已记录此危险并另做保序包装 `regen-math3.mjs`）。结果 `data/bank_math3.js`（mtime `2026-10-11T01:35:58+08:00`、386968 B、sha256 `bbdaa76cf5367df0…`）在 `:273` 缺行尾逗号，`node --check` 报 `SyntaxError: Unexpected token '{'`、`check_data` exit 1、vm 载入失败。坏文件已留证 `backup/scratch/captain-incident-1011/bank_math3.damaged.js`。窗口内受影响任务：**t63（verifier2，独立验证）** 与 **t64（stat-eng，文档回写）**——已分别发消息要求按事故口径登记（不计入 T122–T133 交付缺陷）并在 t66 落地后补跑对拍。
- 派单摘要（可直接粘贴为切片开场）:
  > 工作区 D:\deepseek harness work\考研\Athena。先读 AGENTS.md，禁止整仓通读。本切片任务＝t66（T134）：恢复 `data/bank_math3.js` 到 t57 交付态（sha256 `fa607b3f…` / 386972 B，用 `backup/scratch/upstream-fix/sandbox/data/bank_math3.js` 或 `backup/scratch/bank-cv3/tmp/sandbox/data/bank_math3.js` 恢复），给两份原始生成器加 math3 守卫，跑四闸门并留证 `backup/scratch/bank-fix4/`。文件边界＝`data/bank_math3.js` + 上述 scratch 三件；不跑 `npm run build`、不改 econ/stats/src/tests/tools/docs。
- **派单竞态记录（船长处置，2026-10-11）**: `create_task` 建 t66 时先落入共享池 → 调度器**瞬时**把它自动派给了当时空闲的 **refs-lead**（attempt 1），随后我 `reassign_task` 改派 bank-eng（attempt 2，attempt_id `9a0ca6b5-74c9-4f13-9fa6-26acbdf01d54`）。refs-lead 按「不认领非本人任务」边界**未执行任何动作**（未碰数据文件/生成器/证据目录），仅报备，处置正确；无需追责或补账。**规程教训**：需要指定执行人的新任务，应在同一个静默窗口内完成「创建 → reassign」，避免空闲成员抢跑（本项目已第二次出现同类竞态）。
### 报告
<!-- 执行者一次追加；格式 WORKFLOW §7.4：改了什么 → 闸门 PASS/FAIL → 未做项 -->
**船长验收（accepted，t66 / bank-eng，attempt 2 = `9a0ca6b5-74c9-4f13-9fa6-26acbdf01d54`，完成 2026-10-11T02:43:33→02:43:36 +08:00）**
- **恢复对拍（船长亲跑）**：`data/bank_math3.js` 386968 B / `bbdaa76c…`（事故态，`node --check` :275 SyntaxError）→ **386972 B / `fa607b3f46887c69c0da31cafaaae26f6d297083af26e8c785725876f39547e9`**，与 t57 交付态**逐字节一致**（两份独立副本先自检哈希再整体复制，坏文件留档 `backup/scratch/bank-fix4/bank_math3.broken.js`，无逐行手补）。
- **结构闸门（船长亲跑）**：`node --check data/bank_math3.js` exit 0；vm 载入 `questions=331 / dupIds=0 / types=13`；`cv-m3-int29-2.answer` 的 `$` 计数 **14（偶）**、末尾 `\right)$$`（独立复算脚本 `backup/scratch/captain-verify-t66/check-int29.cjs`）。
- **四闸门（船长亲跑，全 exit 0）**：`node --test tests/bank.test.mjs` → **43/43**；`node tools/check_data.mjs` → **`✅ 全绿`（ERR=0 / WARN=0）**，`[题库] math3 331 题 | 13 题型 | school=331/331（21 个来源）| 卡片派生=150`、`学科数 25 / 卡片总数 2809 / 题库科目 3 / 真题总数 769 / origin=card 481`；`node --test tests/build.test.mjs` → 11/11；`node backup/scratch/refs-plan/inventory.mjs` → **exit 0**（末行「写出 `backup/scratch/refs-plan/inventory.json`」，refs-lead 报出的失败调用点已转绿）。
- **守卫反证（船长亲跑，独立于成员日志）**：`node backup/scratch/bank-cv3/build-bank-cv3.mjs --write` → **exit 2**、打印指向 `regen-math3.mjs` 与 `notes.md §8` 的六步提示，且 `data/bank_math3.js` 哈希**保持不变**（`before === after`）；`node backup/scratch/bank-cv2/build-bank-cv2.mjs --write --subject math3` → 同样 **exit 2**。两份生成器补丁后仍逐字节相同（`045570647de8ca84f78d498536bc6b0b1e8348c8ffc69b74e4392b59ac187054`）⇒ **事故入口在工具层被封死**。
- **inScope 外落盘的两点披露（船长核查后接受）**：① `backup/scratch/bank-cv3/excluded.md` 曾被守卫试跑的干跑重写成 math3+econ 双段 → 已按 `--subject econ` 重跑并照原文重建 t62 复核说明、删除新建的 math3 旁产物；我抽查确认现文本仅含 `mk31` 第 1 条排除项 + t62 时点说明（与 t49/t62 口径一致）；② `backup/scratch/refs-plan/inventory.json` 由闸门按设计刷新（该文件本就是闸门产物）。两点均为**如实披露**，不影响数据文件边界。
- 边界：`data/` 六文件在 t66 起点哈希逐一致（`data/econ.js` / `data/stats.js` / `data/math3.js` / `data/bank_econ.js` / `data/bank_stats.js` 未动）、`tests/bank.test.mjs` 仍 `f655a36c…`；未跑 `npm run build`。报告 `backup/scratch/bank-fix4/report.md`。
- 事故留证（船长）：`backup/scratch/captain-incident-1011/bank_math3.damaged.js`（386968 B / `bbdaa76c…`）保留作过程证据。
- 后续影响：t63（verifier2 独立验证）与 t64（stat-eng 文档回写）现可在**绿窗口**复跑最终闸门；《船长验收纪律》新增一条并已在工具层强制——**验收期间不重跑生成器**，需要重跑一律在沙盒副本上进行。

### T135 统计题库跨来源交叉判重（F1 同源重复处置 + F2 登记）
- 状态: accepted（t67 交付并经船长独立复核；执行期由船长 amend 增加验收 9「头注释漂移清理」并把 `data/bank_math3.js` 移入 inScope）
- 负责: bank-eng（任务 **t67**）
- 文件集: `data/bank_stats.js`、`tests/bank.test.mjs`、`docs/DATA_SCHEMA.md`、`docs/COVERAGE.md`、`docs/refs/2.2.0-PLAN.md`、`backup/scratch/bank-dedup2/`
- 依据: T128（t63）验证报告 §F1/F2（`backup/scratch/verify-wave-a/T63-VERIFICATION-REPORT.md`）+ T127/t54 的三层去重口径（R1 J≥0.45、R2 J≥0.20+稀有数字≥2）
- 依赖: T129（t64 文档回写，避免并行写同一批文档）
- 验收:
  1. 交叉判重覆盖完整：统计科 76 条 `origin:'year'` 题 × 全部统计卡片派生题（170 条）逐对比较，产物 `backup/scratch/bank-dedup2/cross-dedup.md` 逐行列「id 对 → J → 同校/同年 → 裁定（保留/删除/存疑）」并给出扫描总数与命中数
  2. F1 处置基于**逐字比对**（非仅相似度）：`st-2025-12` ↔ `cv-st-test01` 若确为同题（复旦大学 432 2025 年）→ 删 **year 题**、保留卡片派生题为规范条目，理由与证据写入 `excluded.md`；题量按实测更新（预期 stats 262→261、全库 769→768，差异须写明原因）；若判定「同校同年不同题」则保留两题并写明不删理由
  3. F2（`st-2021-8`↔`cv-st-est13` 0.525、`st-2021-9`↔`cv-st-est03` 0.462）**仅登记、一律保留**（同校异年属不同年份卷）
  4. 零回归：既有卡片派生题（stats 170）与手写题（全库 55）逐题对拍 missing 0 / changed 0；`data/bank_{math3,econ}.js`、`data/{math3,econ,stats}.js` 逐字节不变（给 sha256）
  5. 护栏同步：`tests/bank.test.mjs` 下限与期望改**派生式**或按实测更新（不删断言、不放宽六条硬断言、skip/todo 保持 0），`MIN_QUESTIONS.stats` 与 `MIN_TOTAL` 与实际终值一致
  6. 文档同步：`docs/DATA_SCHEMA.md`、`docs/COVERAGE.md`、`docs/refs/2.2.0-PLAN.md` 的统计题量与全库总数改为实测终值并保留沿革链（…→756→769→终值）；**不动** `docs/BOARD.md`
  7. 确定性与可复算：判重脚本两次运行输出哈希一致；自建校验脚本 exit 0
  8. 边界：不跑 `npm run build`（收口轮统一构建）、不改 `src/**`/`style.css`/`data/{math3,econ,stats}.js`/`data/bank_{math3,econ}.js`/版本七处
- 升版: 不升
- 口径（船长 m04627）: **卡片派生题为规范条目**（其 `EXAMPLE` 是卡片正式附属内容且携带 tags/star）；与 year 题同题时删 year 题，符合用户口径「题库已有真题不必重复收录，着力补充题库没有的题」。相似度只作筛选器，删除必须逐字比对并留证。

#### 派单摘要（可直接粘贴为切片开场，含三句话）
工作区 `D:\deepseek harness work\考研\Athena`。先读 `AGENTS.md`，禁止整仓通读。本切片只写 `data/bank_stats.js`、`tests/bank.test.mjs`、`docs/DATA_SCHEMA.md`、`docs/COVERAGE.md`、`docs/refs/2.2.0-PLAN.md`、`backup/scratch/bank-dedup2/`；卡片派生题为规范条目、删除须逐字比对留证、同校异年一律保留；闸门＝`node --test tests/bank.test.mjs` + `node tools/check_data.mjs`（不跑 build）。

### 报告
<!-- 执行者一次追加；格式 WORKFLOW §7.4：改了什么 → 闸门 PASS/FAIL → 未做项 -->
- **改了什么**：`data/bank_stats.js`（删 2 条与卡片派生题同题的 year 题）、`data/bank_math3.js`（**仅首行注释**）、`tests/bank.test.mjs`（护栏随终值调整）、`docs/DATA_SCHEMA.md` / `docs/COVERAGE.md` / `docs/refs/2.2.0-PLAN.md`（终值与沿革链 →767）；证据与脚本 `backup/scratch/bank-dedup2/`（`cross-dedup.mjs/.md/.json`、`excluded.md`、`baseline/`、`patch-headers.mjs`、`check-dedup2.mjs`、`check-clean.mjs`、`report.md`）。
- **判重结果**：扫描 **12920 对**（76×170 全量；同族 3208、同年 238），契约判据 `J≥0.45` 命中 **0**；并集候选池 **23 对**逐对读全文 ⇒ **删 2 / 保留 21**（含小问级重合 4 对）。
  - **F1**：`st-2025-12` ↔ `cv-st-test01`（复旦大学 432 2025 同题）→ 删 year 题，保留卡片派生题为规范条目。
  - **F3（本轮新发现，任务书未列）**：`st-2025-2` ↔ `cv-st-sy04`（北大光华 2025 同卷、同数据表、同两问）——J 仅 **0.1466**，靠「共享稀有数字 ≥3」进候选池 + 逐字比对检出 ⇒ **这是与任务书预期 261/768 存在差异的唯一原因**（终值 260/767）。
  - **F2**：`st-2021-8`↔`cv-st-est13`、`st-2021-9`↔`cv-st-est03` 同校异年 ⇒ **一律保留**（未为凑数字删题）。
- **F1 漏网根因（已复现 + 反证）**：`backup/scratch/bank-statq/dedup.mjs:80` 人工表写 `no:'第11题'`、切片产出 `no:'十一'`，而 `normNo`（`:95`）**不做中文数字换算** ⇒ 人工表**静默失效**，退回 R1 阈值时 J 0.4375 差 0.0125 未达 0.45 而漏网。另：t63 报的 0.541/0.525/0.462 与 t54 口径 0.4375/0.3019/0.2059 及三种变体均不吻合，产物 §3 列四口径对照表（**以 t54 口径为准**，结论不依赖阈值）。
- **验收 9（头注释漂移）**：`data/bank_math3.js` 首行 174 → **331**（写明 24 手写 + 150 卡片派生(t49) + 157 真题册入库(t53)），386972 B `fa607b3f…` → 387101 B `977e43fb…`；`data/bank_stats.js` 首行 262 → **260**（16 手写 + 170 卡片派生 + 74 真题册入库，注明 t67 删 2 条同题者），391415 B `439002fd…` → 391494 B `ed2f24e2…`；`data/bank_econ.js` 首行 176 本来就对 ⇒ 未改。**证明**：差异行集合恰为 `[0]`（math3 其余 2612 行、stats 其余 2181 行逐字节相同；math3 回写旧首行即复现基线 sha256；vm 题目数组逐条 JSON 全等）。
- **闸门（船长亲跑复核）**：`node --test tests/bank.test.mjs` **43/43 exit 0**；`node tools/check_data.mjs` **exit 0 / ERR=0 / WARN=0**（math3 331 · econ 176 · stats **260**、全库 **767**、派生 481，三科 `$奇=0`）；被删两题实测不在（`st-2025-12`/`st-2025-2` = false，`cv-st-test01`/`cv-st-sy04` = true）；`origin` 分布 `{year 90 = 74 真题册 + 16 手写, card 170}` 与自报一致；成员侧 `check-dedup2.mjs` 30 项 exit 0、`cross-dedup.mjs` 连跑两次逐字节相同（md `8671cb18…` / json `977e64bf…`）。未跑 build。
- **未做项/转后续**：①`cv-st-est13` 的 MLE 结论可疑（取 X₍₁₎，疑应为 X₍ₙ₎/2）、②`cv-st-est12` 与 `st-2025-1` 第 3 小问判据冲突（AC vs ABC）、③合卷题 `st-2025-1`/`st-2026-2` 小问级重合建议拆分、④t54 人工表 `no` 的中/阿拉伯数字统一、⑤`docs/ARCHITECTURE.md:144`（沿革链缺 `→767`）与 `:154`（文案示例「共 769 题」）、`docs/refs/INDEX.md:111`（R10 登记行）仍留旧值 —— **①②③④⑤ 全部已转 T136（t68）**。
- **口径裁定（船长 m04703）**：跨来源同题一律以**卡片派生题为规范条目**、删 year 题；**相似度只作筛选器**（F3 证明低 J 也可能是同题、高 J 也可能只是同族），最终判定必须逐字比对并留证；同校异年一律保留。

### T136 统计题库遗留内容修正（est13/est12 判据）+ 判重工具归一化 + 文档终值补齐
- 状态: accepted（t68 交付并经船长独立复核；三项越界已转 T137）
- 负责: stat-eng2（任务 **t68**）
- 文件集: `data/stats.js`、`data/bank_stats.js`、`docs/ARCHITECTURE.md`、`docs/refs/INDEX.md`、`docs/refs/2.2.0-PLAN.md`、`tests/bank.test.mjs`、`backup/scratch/bank-statq/dedup.mjs`、`backup/scratch/bank-fix5/`
- 依据: T135 报告「未做项/转后续」五条（`backup/scratch/bank-dedup2/report.md`）+ 用户红线「保证题目的绝对准确与正确」（m00934 第 6 条）+ 用户口径「卡片所附例题默认正确、不重写」（m02736，属默认假设而非禁止纠错）
- 依赖: T135（t67）
- 验收:
  1. **①`cv-st-est13`**：独立复算 L(θ) 单调方向（写明为何取 X₍ₙ₎ 或 X₍₁₎ /2），以来源证据（`data/stats.js` 的 `EXAMPLE.est13` 原文 + 讲义裁片或 `参考文件/_extract/*.txt` 可回读行号）佐证；确错则改 `data/stats.js` 并同步 `data/bank_stats.js` 的镜像题 `cv-st-est13`，正确则写明推导与不改理由
  2. **②`cv-st-est12` 与 `st-2025-1` 第 3 小问判据冲突（AC vs ABC）**：以来源为准判定（`st-2025-1` 给 JYSG/解析册页码与逐字原文可回读；`est12` 给 EXAMPLE 原文），修正错的一方；证据不足则登记「待人工裁定」并写明缺什么证据，**不得凭印象改**
  3. **③合卷题拆分**（`st-2025-1`/`st-2026-2` 小问级重合）登记到 `docs/refs/2.2.0-PLAN.md` 后续项（给批次归属与理由），本任务不改题面结构
  4. **④`backup/scratch/bank-statq/dedup.mjs` 的 `normNo` 中/阿拉伯数字互通**：使人工表 `no:'第11题'` 与切片产出 `no:'十一'` 匹配；附 ≥3 组等价/非等价自证用例，并给出「修复前静默失效 → 修复后命中」的差异日志
  5. **⑤文档终值补齐**：`docs/ARCHITECTURE.md:144` 沿革链补 `→767`、`:154` 示例文案改终值、`docs/refs/INDEX.md:111` 的 R10 登记行按实际状态改写（不得含糊）；引用行号须回读核对
  6. **零回归**：`node --test tests/bank.test.mjs` 43/43（或按需调整断言后仍全绿且不删断言）、`node tools/check_data.mjs` ✅ 全绿 ERR=0 WARN=0；题库终值 `math3 331 / econ 176 / stats 260`、全库 **767**、派生 481 不变（若某项修正意外改变计数须写明原因并同步护栏与文档）
  7. **改动最小化**：除①②修正项与必要注释外 `data/stats.js`、`data/bank_stats.js` 其余内容逐字节不变（给 diff 行集合与 sha256 对拍）；不跑 `npm run build`；不改 `src/**`、`style.css`、`data/{math3,econ}.js`、`data/bank_{math3,econ}.js`、`docs/BOARD.md`、版本七处
  8. 报告给「命令 → exit 码 → 结果」与未做项清单；证据（裁片/原文摘录/复算脚本/日志）落 `backup/scratch/bank-fix5/`
- 升版: 不升
- 口径（船长 m04703）: 读图主通道＝自带 `read_image`（禁用 modlens），裁片 **≤400 KB / 最长边 ≤1400 px**、一次一页、失败两次即登记 `unreadable` 并继续，不得凭记忆补写。

#### 派单摘要（可直接粘贴为切片开场，含三句话）
工作区 `D:\deepseek harness work\考研\Athena`。先读 `AGENTS.md`，禁止整仓通读。本切片只写 `data/stats.js`、`data/bank_stats.js`、`docs/ARCHITECTURE.md`、`docs/refs/INDEX.md`、`docs/refs/2.2.0-PLAN.md`、`tests/bank.test.mjs`、`backup/scratch/bank-statq/dedup.mjs`、`backup/scratch/bank-fix5/`；①②只在「来源证据 + 独立复算」双重支持下才改、证据不足就登记；闸门＝`node --test tests/bank.test.mjs` + `node tools/check_data.mjs`（不跑 build）。

### 报告
<!-- 执行者一次追加；格式 WORKFLOW §7.4：改了什么 → 闸门 PASS/FAIL → 未做项 -->
- **改了什么**：`data/stats.js`（`est13` 的 MLE 结论取错端点）、`data/bank_stats.js`（镜像题 `cv-st-est13` + `st-2025-1` 的 `answer`/`traps`/`src`）、`docs/ARCHITECTURE.md`、`docs/refs/INDEX.md`、`docs/refs/2.2.0-PLAN.md`（Q7 合卷题拆分登记）、`backup/scratch/bank-statq/dedup.mjs`（`normNo` 中文数字归一化）；证据 `backup/scratch/bank-fix5/`（`report.md` + `check-*.mjs` + 日志 + `regen-sandbox/`）。
- **①`cv-st-est13` 裁定「确有错」并修正**：$X\sim U(\theta,2\theta)$ ⇒ $L(\theta)=\theta^{-n}\cdot I\{X_{(n)}/2\le\theta\le X_{(1)}\}$ 单调递减 ⇒ **$\hat\theta_{MLE}=X_{(n)}/2$**（旧文取右端点 $X_{(1)}$，与卡内「递减」自相矛盾）。来源：`参考文件/真题/统计/解析册_2026_02_01 (1).txt:11130-11142`（第 131–132 页）「…单调递减，故 θ 取最小值时为 MLE，即 θ̂_L = X(n)/2」+ `:11905-11933` 同款 + 库内同模式 `cv-st-est15`。船长实读 `data/stats.js:1605` 答案尾部 =「…$X_{(n)}\overset{P}{\to}2\theta$，故 $\hat\theta_{MLE}\overset{P}{\to}\theta$ 相合」。
- **②`cv-st-est12` ↔ `st-2025-1` 判据冲突裁定**：`cv-st-est12`（**AC 对**）、`st-2025-1` 第 3 小问（**ABC 错**）——官方解 `解析册:7619`「Solution:AC」、`:7621`「B…错误」（第 92 页）⇒ 已改 bank 侧 `st-2025-1`，卡片题未动。船长实读 `st-2025-1.answer` 尾部 =「…答案：AC．」。
- **③④⑤**：合卷题拆分登记 `docs/refs/2.2.0-PLAN.md:55` Q7（未实施）；`normNo` 修好（自证 20 PASS / 0 FAIL，旧实现失配 6/7；真实切片人工表命中 29→31、dedup 净新增 2→1）；文档终值 `docs/ARCHITECTURE.md:144`（沿革链补 `→767`）/`:154`（769→767）/`:156`/`:210`、`docs/refs/INDEX.md:111`（R10 改「已闭环（t67 验收 9）」）。
- **闸门（船长亲跑复核，均 exit 0）**：`node tools/check_data.mjs` → **✅ 全绿**（math3 331 · econ 176 · stats 260、真题 **767**、派生 481、卡片 2809）；`node --test tests/bank.test.mjs` → **43/43**；成员侧文档闸门 verify-refs exit 0（334/334、锚点 0 失败）、audit-bare-refs exit 0（112/42/0）。
- **最小改动证明**：`data/stats.js` diff=[`1605`]（330729 B `B4E4664C…` → 331054 B `878BBBD0…`）；`data/bank_stats.js` diff=[`820`,`1975`,`1976`,`1978`]（391494 B `ED2F24E2…` → 392208 B `32C39822…`），4 处字段机械反写后 sha256 **精确回到 `ED2F24E2…`**。未跑 `npm run build`。
- **三项越界（成员未改，船长裁定后合并为 T137/t69）**：①`backup/scratch/refs-plan/check_plan.mjs` 复跑 **exit 1 / C5**——仍写 t64 期常量（手写 92/181/15 = 288、合计 769，而闸门现算 767/481）⇒ 期望改**派生式**；②`docs/DATA_SCHEMA.md:118`/`:319` 引用漂移（`letterOf()` `:519` 实为 **`:524`**、期望表守卫 `:533-574` 实为 **`:538-578`**，船长已回读源文件确认）；③**t32 统计生成器 `backup/scratch/bank-cv/build-bank-cv.mjs` 已不可安全重跑**（把卡片块搬到 t54 块之后 + 吞元素间逗号 → `SyntaxError`，复现点 `backup/scratch/bank-fix5/regen-sandbox/data/bank_stats.js:186`）⇒ 按「**哨兵原位替换**」登记 2.2.0 backlog，**不在收口轮实施**（避免发行前动生成器）。
- **未做项**：T137 三项（见上）；`docs/ACT.md` mtime 为 03:35（t64 期），本轮未改。

### T137 收口前小修：check_plan C5 派生式同步 + DATA_SCHEMA 引用漂移 + 生成器哨兵化登记
- 状态: accepted（t69 交付并经船长复核：check_plan 61/0、check-doc-refs 26/0、check_data ✅、bank.test 43/43 全 exit 0；三项越界已全部落地）
- 负责: stat-eng2（任务 **t69**）
- 文件集: `backup/scratch/refs-plan/check_plan.mjs`、`docs/DATA_SCHEMA.md`、`docs/refs/2.2.0-PLAN.md`、`backup/scratch/bank-fix6/`
- 依据: T136（t68）报告的三项越界登记（`backup/scratch/bank-fix5/report.md`）+ 船长回读确认（`tests/bank.test.mjs:524` 为 `letterOf()` 实际行号；`check_plan.mjs` C5 复跑 exit 1）
- 依赖: T136（t68）
- 验收:
  1. `backup/scratch/refs-plan/check_plan.mjs` 复跑 **exit 0（0 FAIL）**：C5 的真题侧手写题量期望改为**从 `data/bank_{math3,econ,stats}.js` 现算**（或与 `tools/check_data.mjs` 的 bankStats 现算值对拍），**不得改写成新的硬编死值**；其余 t64 期硬编数字一并改派生式或加 `_history` 注释说明来源
  2. `docs/DATA_SCHEMA.md:118` 与 `:319` 引用漂移修正：`letterOf()` `:519` → **`:524`**；期望表守卫 `:533-574` → 实测起止行（须回读 `tests/bank.test.mjs` 确认后填写，不得照抄任务书）
  3. `docs/refs/2.2.0-PLAN.md` 登记两条 backlog（写明触发场景与建议做法）：①`backup/scratch/bank-cv/build-bank-cv.mjs`（t32 统计生成器）**不可安全重跑**——重跑把卡片块搬到 t54 块之后并吞元素间逗号导致 `SyntaxError`（复现点 `backup/scratch/bank-fix5/regen-sandbox/data/bank_stats.js:186`）⇒ 建议改**哨兵原位替换**；②闸门基线（`check_plan.mjs`）随内容变更的刷新流程（谁负责、何时、如何留 `.before` 与 `_history`）
  4. 零回归：`node tools/check_data.mjs` exit 0（学科 25 / 卡片 2809 / math3 331 · econ 176 · stats 260 / 真题 767 / 派生 481 不变）、`node --test tests/bank.test.mjs` 43/43、`check_plan.mjs` exit 0、`backup/scratch/docs-refresh/` 的两个文档闸门 exit 0（行号修正若引起引用回读变化须逐条修到全绿，不得放宽判据）
  5. 反证 ≥2 且须判红：①C5 期望改回 769/92 旧值 → `check_plan.mjs` exit ≠ 0；②`docs/DATA_SCHEMA.md` 行号改回 `:519`/`:533-574` → 文档闸门判红（或等价可复现证据）；反证脚本/日志落 `backup/scratch/bank-fix6/`
  6. 改动最小化：`git diff --numstat` 只涉及上述三文件（+ `backup/scratch/bank-fix6/` 新增）；不跑 `npm run build`；不改 `src/**`、`style.css`、`data/**`、`tools/**`、`tests/**`、`docs/BOARD.md`、版本七处、`CHANGELOG.md`、`app.js`、`dist/**`
  7. 报告给「命令 → exit 码 → 结果」表 + 未做项清单；写明 C5 现算值（手写 90 · 派生 481 · 合计 767 或实测值）与 `check_plan.mjs` 最终输出原文
- 升版: 不升
- 口径（船长 m04738）: 闸门数字一律**派生式**（从数据/护栏现算），禁止把期望改写成新的硬编常量；行号引用必须回读源文件确认后填写。

#### 派单摘要（可直接粘贴为切片开场，含三句话）
工作区 `D:\deepseek harness work\考研\Athena`。先读 `AGENTS.md`，禁止整仓通读。本切片只写 `backup/scratch/refs-plan/check_plan.mjs`、`docs/DATA_SCHEMA.md`、`docs/refs/2.2.0-PLAN.md`、`backup/scratch/bank-fix6/`；C5 期望改派生式不得写死、文档行号须回读确认；闸门＝`node backup/scratch/refs-plan/check_plan.mjs` + `node tools/check_data.mjs` + `node --test tests/bank.test.mjs`（不跑 build）。

### 报告
<!-- 执行者一次追加；格式 WORKFLOW §7.4：改了什么 → 闸门 PASS/FAIL → 未做项 -->
- **改了什么**：`backup/scratch/refs-plan/check_plan.mjs`（C/G 组改**现算派生** + `_history` 段）、`docs/DATA_SCHEMA.md`（4 处行号引用）、`docs/refs/2.2.0-PLAN.md`（新增 §7 backlog + `:179` 数字订正）；证据与量具 `backup/scratch/bank-fix6/`（`report.md`、新增 `check-doc-refs.mjs`、`cp-t69.mjs`、`cp/postfix` 快照）。注意 `backup/` 被 `.gitignore:19` 忽略，故 `git diff --numstat` 只列两份文档（行集合佐证见报告）。
- **①`check_plan.mjs` 换代 → exit 0 / 61 PASS / 0 FAIL**：`C1` 改为「`require` 直载 ↔ vm 量具 `cardStats()`」两套独立口径对拍；`C2/C4` 取 `bankStats()`/`cardStats()` 现算；**`C5` 重写为「手写 = 合计 − 派生」+ 三方对拍**（vm 量具 ↔ 文本层计数 `stripComments`，因三份 bank 文件头注释各含一处 `origin: 'card'` 会污染计数 ↔ `tests/bank.test.mjs` 的 `MIN_QUESTIONS`/`MIN_TOTAL` **现读**，行号文本定位不写死、下限语义 `>=`）。C5 现算值：**手写 stats 90 / math3 181 / econ 15 = 286 · 派生 481 · 合计 767**；`inventory` 快照（手写 288 / 合计 769）**降级为「只登记不判」**；B18/B19 里把快照量误标成「实时手写」的措辞一并订正。
- **②`docs/DATA_SCHEMA.md` 引用回读修正 4 处**（均先逐行回读、未照抄任务书）：`:118` `letterOf()` `:519`→**`:524`**（+ 正则表 `LETTER_RES` `:523`）；`:319` 守卫 `:533-574`→**`:538-578`**（口径注释 `:533-537`）；`:320` `:1597`/`:1667`→**`:1602`/`:1672`**（同源 +5 漂移）；`:326` 对拍块 `:325`/`:404`→**`:329`/`:409`**，并把 stats 手写 92→**90**。新增量具 `check-doc-refs.mjs`（行号锚点表 + 区间分型 test/comment + 5 REQUIRED / 7 FORBIDDEN）→ **26 PASS / 0 FAIL**。
- **③`docs/refs/2.2.0-PLAN.md` 新增 §7「收口 backlog（登记，未排期）」**：7.1 t32 生成器不可安全重跑 ⇒ **哨兵原位替换**（复现点、补 1 个逗号即通过、改造前「手改 + `check-regen.mjs` 对拍、禁止 `--write`」纪律齐全）；7.2 闸门基线刷新流程（谁改计数谁负责同批刷新三处期望、留 `.before` + `_history`、一律现算派生）；另订正 `:179` 残留「288」→**286**。
- **反证（船长复核）**：**M1** C5 注入 t64 期期望 `769/92` → `check_plan` **exit 1**（60 PASS / 1 FAIL，`C5[CP-M1…]`）；**M2** `DATA_SCHEMA` 换回修前快照 → `check-doc-refs.mjs` **exit 1**（4 PASS / 19 FAIL）。M2 顺带**实证**：同一 M2 态下 `verify-refs.mjs` 仍 exit 0（±3 窗口兜底会掩盖行号漂移 = PLAN O-3）——这正是新增该量具的理由。两轮均已还原，`cp-t69.mjs verify` 三份文件 sha256 与 `cp/postfix` 快照一致。
- **船长亲跑（本次）**：`node backup/scratch/refs-plan/check_plan.mjs` **exit 0**；`node backup/scratch/bank-fix6/check-doc-refs.mjs` **exit 0**；`node tools/check_data.mjs` **exit 0**；`node --test tests/bank.test.mjs` **43/43**；`git diff --numstat` = `docs/DATA_SCHEMA.md` 25/24、`docs/refs/2.2.0-PLAN.md` 57/16（与自报一致）。
- **未做项（成员登记 5 条）**：未改 t32 生成器本体（按 PLAN §7.1 留待排期）；B 组冻结产物未换代；非 `tests/bank.test.mjs` 的其它引用未逐条回读；未动 `docs/BOARD.md`、未提交；`inventory`/`matrix` 未重跑。

<!-- 已归档：T77–T121 Athena 2.1.1 / 2.2.0 前置（题库渲染与筛选、自测星标、专注链 UI 与组合语义、错题入口、四族转录基线）→ backup/docs-archive/board/2026-10-10-V2.1.1-T77-T121.md -->

<!-- 已归档：T45–T76 Athena 2.1.0（题库/自测/专注链三修复/层级视觉/悬浮提醒/未到期重学/例题联动下线）→ backup/docs-archive/board/2026-10-09-V2.1-T45-T76.md -->

<!-- 已归档：T39–T44 专注链两 bug + 里程碑云同步 + 习惯树拖拽 → backup/docs-archive/board/2026-10-07-T39-T44.md -->

<!-- 已归档：T1 js 教材化 → backup/docs-archive/board/2026-09-28-T1-js-textbook.md -->
<!-- 已归档：T2 clang K&R → backup/docs-archive/board/2026-09-28-T2-clang-kr.md -->
<!-- 已归档：T3 math3 线代笔记 → backup/docs-archive/board/2026-09-28-T3-math3-linalg.md -->
<!-- 已归档：T4 cppl C++ Primer → backup/docs-archive/board/2026-09-28-T4-cppl-primer.md -->
<!-- 已归档：T5 java HFJ → backup/docs-archive/board/2026-09-28-T5-java-hfj.md -->
<!-- 已归档：T6 jp 标日深化 → backup/docs-archive/board/2026-09-28-T6-jp-shinnyo.md -->
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

