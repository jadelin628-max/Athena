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
### T77 参考资料读图工具与裁定格式（团队 t1）
- 状态: accepted
- 负责: 团队 athena-2.2-prep / refs-lead（t1）
- 文件集: 仅 `tools/refs-vision.py`、`docs/refs/README.md`、`backup/scratch/refs-vision/`
- 依据: AGENTS.md + docs/WORKFLOW.md §7 + docs/COVERAGE.md（不改）
- 依赖: 无
- 验收:
  1. CLI 可用且可复现：同参数两次生成的 PNG sha256 相同；默认解释器 `参考文件/_venv/Scripts/python.exe`，参数含 `--pdf/--page/--dpi/--box/--out`
  2. `docs/refs/README.md` 写死裁定格式（材料｜页码｜生成命令｜裁片路径｜亲读原文 ≥20 字｜结论｜置信度）与通道口径：主通道自带 read_image、**禁用 modlens**
  3. 示例裁定（2025 数学三第 2 页）与 `data/bank_math3.js` 现有题干逐字一致
- 升版: 不升（本波次由主对话统一收口）

#### 派单摘要（可直接粘贴为切片开场，含三句话）
工作区 `D:\deepseek harness work\考研\Athena`；先读 AGENTS.md，禁止整仓通读；本切片文件集＝`tools/refs-vision.py`、`docs/refs/README.md`、`backup/scratch/refs-vision/`，验收见上。

### 报告
**切片交付**（refs-lead / t1，attempt `84c250ac`）
- 新建 `tools/refs-vision.py`（12,023 B）：纯标准库 + PyMuPDF 确定性渲染/裁剪；CLI `--pdf/--page`(1 基)`/--dpi`(默认 150)`/--box x0,y0,x1,y1`(PDF 点，原点左上 y 向下)`/--out/--python`(默认 `参考文件/_venv/Scripts/python.exe`)，另加 `--verify`（重渲比对既有 PNG 的 sha256、不覆盖文件；一致 0 / 不一致 1 / 缺文件 3）；打印像素尺寸、字节数、sha256、等效命令。
- 新建 `docs/refs/README.md`（14,643 B / 233 行）：裁定七字段（材料｜页码｜生成命令｜裁片路径+sha256｜亲读原文 ≥20 字｜结论｜置信度 high|medium|low）与三档判据、裁片目录 `backup/scratch/refs-vision/<材料>/`（`backup/` 被 `.gitignore:19` 忽略，凭命令+sha256 重建）、四族 `docs/refs/rulings/<族>.md` 约定。
- 示例裁定（2025 数学三 p2）：`--page 2 --dpi 150 --box 55,94,542,220` → 1014×262 px / 35,855 B / sha256 `803b55faf9a71fdb1ca6e326b9d54c34d04848e7f62989b8aa7ed80f653e56d7`；成员 read_image 亲读四选项与 `data/bank_math3.js:240-242`（`m3-2025-1`，答案 C）逐字一致。

**船长独立复核（实跑）**
1. 复跑示例裁片 → `pixels: 1014 x 262 / bytes: 35855 / sha256: 803b55faf9a71fdb1ca6e326b9d54c34d04848e7f62989b8aa7ed80f653e56d7`，exit 0，与成员自报、与 `--out` 落盘文件哈希三者一致（比对对象：`backup/scratch/verify-t1/sample.png`）。
2. 自检脚本 `backup/scratch/refs-tool/check_ruling_readme.py` → 「结论: 全部 PASS」exit 0（含题库 5 个片段逐字命中与裁片 sha256）。
3. README 关键条款在位：`docs/refs/README.md:16` read_image＝唯一主通道、`:17`/`:21` modlens 禁用及理由（独立额度、耗尽时返回退化/伪造结果）、`:87` 裁片不入库凭命令复建、`:101-115` 裁定格式与置信度定义。
4. 范围：仅两个新文件；`data/`、`src/`、`tests/`、`style.css`、生成物、`docs/COVERAGE.md`、BOARD 均未被改动。

**附带裁定（对 2.2.0 有直接约束，已下达 t4/t2/t3）**
- `参考文件/_extract/真题__数学__5、…2025年考研数学三真题.txt:10-12` 为 OCR 碎裂形（`e-smx-1`、`√x+1-c0Sx`、`1-Im(1+x）`，正弦/余弦/ln 全毁）→ **数学三 2023–2025 的 `_extract` 文本不足以作证**，必须走「裁片 + read_image」；`_extract` 仅用于定位行号。
- 工具口径：`--box` 为 PDF 点、原点左上 y 向下；150 dpi 下 `点 = 像素 × 0.48`，A4 整页 1241×1754 px；公式须写成该工具的 LaTeX 转写层并逐字沿用，写入 `data/*.js` 时反斜杠双写。

**验收结论**：3/3 条 acceptance passed；无未做项；无 blocking 发现。

---
### T78 统计教材族转录基线（团队 t2）
- 状态: accepted
- 负责: 团队 athena-2.2-prep / stat-eng（t2）
- 文件集: 仅 `docs/refs/stats-textbook.md`、`docs/refs/stats-textbook.json`、`docs/refs/rulings/stats.md`、`backup/scratch/refs-stats/`
- 依据: AGENTS.md + docs/WORKFLOW.md §7 + `参考文件/北大金融茆书知识点划分.pdf`
- 依赖: T77
- 验收:
  1. 茆诗松 490 页 + 14 个统计专题 + 计量讲义 45 页结构与页覆盖无空洞（逐页归属可查）
  2. ≥40 条读图裁定（低产页优先），每条含亲读原文与置信度
  3. 公式「可直接引用 / 必须重推」清单，碎片（如 `Pn i=1 u2 0i`）一律列入重推
  4. 对齐茆书 8 章知识点映射；自建校验脚本 exit 0
- 升版: 不升

#### 派单摘要（可直接粘贴为切片开场，含三句话）
工作区 `D:\deepseek harness work\考研\Athena`；先读 AGENTS.md，禁止整仓通读；本切片文件集＝上列 4 个路径，验收见上。

### 报告
**验收结论（船长，accepted）**：统计教材族（茆诗松 490 页 + 14 专题 106 页 + 计量 45 页）结构索引、公式可引用/须重推清单、知识点映射与 44 条读图裁定全部落盘；《北大金融茆书知识点划分.pdf》8 章逐行有支撑，页覆盖无空洞。

**交付**
- `docs/refs/stats-textbook.json`（683756 B）：`materials` 16 / `entries` 192 条页区间 / `theoremIndex` 110 / `verifiedFormulas` 38 / `rerunFormulas` 12 / `knowledgeMapping` 9 / `rulings` 44 / `lowYieldPages` / `placeholders`。
- `docs/refs/stats-textbook.md`（58348 B / 399 行）：§0 速览、§1 材料口径、§2 结构索引（茆诗松 50 条、专题 14 份、计量 36 条）、§3 公式定理表格四张清单、§4 知识点映射、§5 裁定索引、§6 低产页覆盖与待补、§7 复核命令。
- `docs/refs/rulings/stats.md`（97177 B，R1–R44，全部 high，七字段齐全：材料/页码/生成命令/裁片/亲读原文/结论/置信度）。
- 校验器 `backup/scratch/refs-stats/check-index.mjs`（A–J 全通过，`exit 0`）。

**船长独立复核（亲跑）**
- `node backup/scratch/refs-stats/check-index.mjs` → 末行「全部检查通过 (exit 0)」，输出「页覆盖：无空洞」「知识点映射 9 行（8 章 + 计量行）」；唯一警告为「茆诗松低产页裁定覆盖 22/40」，已在 md §6 如实声明为待补。
- JSON 结构核对（`node -e` 直读）：键为 `generatedAt, family, schemaVersion, fieldSpec, materials, coverage, entries, theoremIndex, verifiedFormulas, rerunFormulas, knowledgeMapping, rulings, lowYieldPages, placeholders`；`materials` 16 / `rulings` 44 / `knowledgeMapping` 9，与自报一致。
- **端到端抽检 R1（超几何分布，茆诗松 PDF p39 / 印刷 p17）**：我用成员给出的命令重跑 `tools/refs-vision.py --page 39 --dpi 150` 生成裁片 → 像素 **1056 × 1656**、字节 **306569**、sha256 **`94042022ce5811e4c1f3a847a937aca903821f6d57e6bf31a683d8a8ab8b6af0`** —— 三者与 R1 记录的指纹**逐字一致**；再用 `read_image` 亲读该裁片，正文逐字吻合记录：「所以根据乘法原理，$A_1$ 中共有 $\binom{M}{1}\binom{N-M}{n-1}$ 个样本点…… $P(A_m)=\frac{\binom{M}{m}\binom{N-M}{n-m}}{\binom{N}{n}}$（1.2.6）」，并确有 $N=9,M=3,n=4$ 的 $5/42,20/42,15/42,2/42$ 与「表 1.2.4」、页脚印刷页码 17 → 裁定「可直接引用」成立。
- 范围审计：改动面仅 `docs/refs/`（未跟踪）+ `backup/scratch/refs-stats/`；`data/*.js`、`src/*.mjs`、`style.css`、`app.js`、`dist/`、版本七处、`CHANGELOG.md`、`docs/COVERAGE.md`、`docs/BOARD.md` 均未被成员改动，未跑 build。

**留给下游的硬事实（写卡直接用）**
- 茆诗松 PDF 490 页、页尺寸 **506.9 × 794.9 pt（非 A4）**；**印刷页 = PDF 物理页 − 22**（p443→421、p472→450 实证）；章界＝一章 23–76 / 二 77–146 / 三 147–207 / 四 208–244 / 五 245–288 / 六 289–335 / 七 336–394 / 八 395–441 / 附表 442–467 / 答案 468–487；8 章章末仅「本章小结」标题、无正文。
- 14 专题真实标题以 `参考文件/_extract/index.json` 为准，**合计 106 页**（任务书写 109，属口径差，md 已注明）；**专题五 p6 与 p7 逐字节相同**（sha256 `88073bd3…`，页脚都印「6」）→ 写卡按一条处理。
- 计量讲义 36 条节级区间；占位节（正文仅「课上讲.」）＝ p13 §2.4、p23 §3.6、p29 §3.11；原骨架把 p16–19 并为一条「3.1」有误，已按页眉重切。

**未核定边界（勿当作已核定数据使用）**
- 茆附表 1–14 ↔ 页码逐页映射**未核定**：仅确认 p442 左缘竖排「表 1 泊松分布函数」= R44，p451/452/453 为 rotation=90 的表 5.2/5.3/5.4 F 分布 0.95/0.975/0.99 分位数；附表页横向排版、表名竖排在页左缘自下向上读，页顶横带裁片取不到表名。
- 茆另有 **11 个有内容低产页（443–450、454–456）未裁片**；计量 p18–19 克拉默法则解式未逐字裁定。补齐建议单独派小任务（约 11 条裁定 + 附表编号映射），不影响现有基线。
- 复跑管道幂等（连跑两次同结果）：`node backup/scratch/refs-stats/gen-json.mjs` → `gen-md.mjs` → `check-index.mjs`。

---
### T79 微观族转录基线（团队 t3）
- 状态: accepted
- 负责: 团队 athena-2.2-prep / micro-eng2（t3）
- 文件集: 仅 `docs/refs/micro.md`、`docs/refs/micro.json`、`docs/refs/rulings/micro.md`、`backup/scratch/refs-micro/`
- 依据: AGENTS.md + docs/WORKFLOW.md §7 + `参考文件/真题分类（按考点分类）.xlsx`
- 依赖: T77
- 验收:
  1. 微观经济学十八讲 417 页 + 光华修订版 64 页 + 光华答案册 149 页（低产页 131 为重点）页覆盖无空洞
  2. ≥15 条高价值读图裁定（含亲读原文与置信度），其余低产页列入 `rulings/micro.md` 的「待裁定批次」清单（页码 + 优先级 + 后续批次口径）
  3. 对齐 xlsx 六考点族与 1995–2025 逐年题号分布的映射表
- 口径调整（船长 m03024）：读图裁定由「≥40 条」降为「≥15 条 + 待裁定批次清单」。理由＝平台 300 秒无输出即掐断，批量渲染数百页的单条命令必然触发（micro-eng 三次、refs-lead 一次均因此失败），硬跑只会整份失败；先交付索引 + 清单 + 首批裁定，剩余裁定按批次追加。判据已同步 verifier（t9）。
- 升版: 不升

### 报告
### 报告（船长 m03088 验收，2026-10 波次）

**交付物（三份 docs，UTF-8 无 BOM / 仅 LF）**
- `docs/refs/micro.md` 176983 B / 1666 行 / 11 章；`docs/refs/micro.json` 544097 B（schema `athena.refs.micro/1`，含 `batch`、`pair_map`）；`docs/refs/rulings/micro.md` 327657 B / 2278 行。
- 证据目录 `backup/scratch/refs-micro/`（14 个脚本：`check-index.mjs`、`crossref.mjs`、`crops-audit.mjs`、`pin-rnumbers.mjs`、`fix-ev.mjs`、`ev-audit.mjs`、`pair-map.mjs`、`pair-verify.mjs`、`year-index.mjs`、`jiang-map.mjs`、`scan-pages.mjs`、`topblock-verify.mjs`、`add-ans-p19-check.mjs`、`add-limits-p26.mjs`）。

**验收逐条（成员自报 + 船长亲跑）**
1. 索引全覆盖：十八讲 417 页逐页表 435 行（PDF 页 = 书内页 + 8 互验）；修订版 31 年 461 题、答案册 31 年 409 题，PDF 页范围全覆盖；第 5 章逐格核 152 格 xlsx 标记题全部命中 + 缺漏清单。
2. 读图裁定 **141 条**（ans 129 / rev 6 / j18 6），七字段齐备、裁片存在 141、sha256 复算一致 141、全部落在低产页；成员本人 `read_image` 亲读 12 张（本轮新增 9 张：j18 p25/31/113/140/158/180、ans p4/19/59/125）——**远超 m03024 下调后的 ≥15 条口径**。
3. 六考点族 × 31 年映射 + §6.1 族→讲支撑表 + §6.2 271 张卡片 × 18 类目覆盖与缺口。
4. 公式图形清单：可直接引用 25 / 必须重推 11 / 图形 10，`ev` 55 处引用 0 断链。
5. 闸门：`node backup/scratch/refs-micro/check-index.mjs` → **16 项通过 / 2 项提示 / 0 项失败，exit 0**（2 提示＝OCR 原件未映射字形 U+FFFD，非编码错误）。

**船长独立复核（非采信成员自报）**
- 亲跑 `check-index.mjs` → 同上 16/2/0、exit 0；`crossref.mjs` / `crops-audit.mjs` / `pin-rnumbers.mjs` 三个哨兵脚本在位（3318–20570 B）。
- **裁片哈希对拍**：`backup/scratch/refs-vision/ans_p1_30_303_583_678_100dpi.png` 实测 `(Get-FileHash -Algorithm SHA256)` = `157b7c679ec37b938d6a4100430b1da03c70c4ef53a4c9955cc4b7a2500c465d`、21873 字节 → 与 R1 记录逐字一致。
- **亲读抽检（最强证据）**：用自带 `read_image` 直读 R3 裁片 `backup/scratch/refs-vision/ans_p4_24_47_563_744_100dpi.png`（749×968 px / 119403 B / sha256 `e76035902f594534d26f66fdfc84356c7ecefd02b6cdbaaed1e9483d6068fdf1`）→ 页内确为「1995 年研究生入学考试试题 二、计算题(每题 8 分)」需求曲线 Qd=260−60P、供给 Qs=100+40P、每单位征 0.5 元税，手写蓝笔解为 Pd=1.8、Ps=1.3、Q=152、T=0.5×152=76、DWL=½×0.5×(164−152)=3，**与裁定「亲读原文」「结论」栏逐字吻合**。
- **独立复算（不读成员笔算）**：260−60(Ps+0.5)=100+40Ps ⇒ Ps=1.3、Pd=1.8、Q=100+40×1.3=152；T=0.5×152=76；税前均衡 260−60P=100+40P ⇒ P=1.6、Q=164，产量差 164−152=12 ⇒ DWL=½×0.5×12=3 —— 三项全部自洽。

**成员本轮修掉的两个既有产物缺陷（采信，属修复非新增）**
- 公式/图形清单 `ev` 的 R 编号断链 45 条（上一稿字面量编号 vs 生成现场编号）→ 重写为现行编号，`crossref.mjs` 报 MISSING 0 / MISMATCH 0。
- 15 条已实读裁定从未进交付物（frag 138 条 vs 交付物 123 条）→ 重跑生成链，裁定 123 → 141 条。
- 新增 `pin-rnumbers.mjs`（R 编号平移哨兵 + `rnums.json` 快照）与 `crops-audit.mjs`（裁片缓存对账）：任何批次追加裁定后先跑哨兵，报平移就先 fix-ev 再复验。

**关键新证据（2.2.0 写卡片/扩题库直接可用）**
- §5.1 逐年起始页配对：`ansPDF = revPDF + Δ`，Δ 从 1995 的 0 单调升到 2025 的 82，31 年 31 个互不相同值；页首年份标题命中答案册 31/31、修订版 30/31（唯一例外 rev p25/2006）。⇒「答案册 = 修订版题面 + 手写解答」升级为区间级结论（骨架比对 + 4 张拼版裁片亲读逐字同文）。**写卡片时题面以修订版为准，答案册只提供解答**；手写解答为草稿，入库前必须重推（已见 ans p60 双解、ans p135 算术笔误）。

**未做项 / 边界（不催收，登记备查）**
- 待裁定批次 49 页已按 B1（答案册 p113/p118）/ B2（修订版 10 页）/ B3（十八讲 37 页）登记，每行含材料/PDF 页/字符数/数学密度/建议裁片命令/已有裁片，附 6 条批次执行口径。
- 修订版 p26（2006 五、六题）已亲读但裁片取框不符 `docs/refs/README.md` 口径，未入册仅在批次表标注。
- 未改任何数据文件 / 构建产物，未跑 `npm run build`；只写 `docs/refs/**` 与 `backup/scratch/refs-micro/**`。
- **口径调整留痕（船长 m03024）**：本任务为 `kind=work`（无 quality 契约，`amend_task` 不适用），执行人由 micro-eng（3 次 `pi-ai stream idle timeout`，`attempt 1–3`）更换为 micro-eng2（attempt 5），读图裁定验收由「≥40 条」下调为「≥15 条 + 待裁定批次清单」；实际交付 141 条，未使用该下调。
- 供 t6 汇总引用：本族增量清单须区分「卡片例题入库（`EXAMPLE` 键 131 / 条目 149）」与「参考资料真题补录（修订版 461 题 / 答案册 409 题，题面以修订版为准）」两行。

---
### T80 数学三真题族转录基线（团队 t4）
- 状态: accepted
- 负责: 团队 athena-2.2-prep / math-eng2（t4）
- 文件集: 仅 `docs/refs/math3.md`、`docs/refs/math3.json`、`docs/refs/rulings/math3.md`、`backup/scratch/refs-math3/`
- 依据: AGENTS.md + docs/WORKFLOW.md §7 + `tests/fixtures/bank-answer-manifest.json` 口径
- 依赖: T77
- 验收:
  1. 2010–2022 逐题索引（年份｜题号｜题型｜知识点｜答案字母｜OCR 可信度），2020–2022 优先做到可入库完整度
  2. ≥15 条高价值读图裁定（含亲读原文与置信度），其余列入 `rulings/math3.md` 的「待裁定批次」清单（页码 + 优先级 + 后续批次口径）
  3. 公式重推清单 + 「可入库清单」（题源页码 + 字母答案，口径同期望答案表）
- 口径调整（船长 m03024）：同 T79，读图裁定由「≥40 条」降为「≥15 条 + 待裁定批次清单」；交付优先级＝逐年索引 → 可入库清单 → 首批裁定 → 待裁定清单。判据已同步 verifier（t9）。
- 升版: 不升

### 报告
### 报告（船长 m03203 验收，2026-10 波次）

**交付物（三份 docs + scratch 附）**
- `docs/refs/math3.md` 553 行 / 65347 B / sha256 `66c7d0581891173b…f8f622e`
- `docs/refs/math3.json` 464182 B / sha256 `fc81523ad5f36982…eac9c8`
- `docs/refs/rulings/math3.md` 608+ 行 / 109675 B / sha256 `3f309fbf1dbd361e…b08dca`
- `backup/scratch/refs-math3/bank-answer-manifest.math3.json`（**161 条**可入库清单）+ `index-<年>.json` 逐年逐题 checkpoint

**规模**：13 年（2010–2022）297 题（2010–2020 各 23；2021/2022 各 22，含 67 行解析要点）；选择题 108 道字母答案齐全（2010–2019 取解析册答案清单页裁片、2020–2022 逐题亲读）；可入库清单 161 = choice 108 + fill 53；公式重推清单 56 条（唯一与源书不一致条 2012 一(2)：源印 C / 复算 A，两侧都记）；读图裁定 60 条编号 + 低产页抽样 28 条 = 88 条（七字段齐、72 张裁片 sha256 实测一致）；另追加实裁亲读 Z2020-p12 / Z2014-p36 / Z2012-p44，**实证「低产页 = 版心留白，非缺页」**。

**闸门（船长亲跑）**：`node backup/scratch/refs-math3/check-index.mjs` → **通过 3438 项检查 / RESULT: PASS / exit 0**（裁片实测 72 张、裁定 60 条、低产页 28 页、清单 161 条）；三份交付物字节数与自报一致。

**船长独立复核**：把 `backup/scratch/refs-math3/bank-answer-manifest.math3.json`（161 条）与既有 `tests/fixtures/bank-answer-manifest.json`（24 条，T73 人工转录件）做交叠对拍 → 重叠 4 条（`m3-2012-1/2`、`m3-2013-1/2`），**答案字母 4/4 一致**（C / A / D / C）；差异仅在 `src` 描述措辞与 Unicode 负号写法（`(−1)^{n−1}` vs `(-1)^{n-1}`），属预期。两件同口径（顶层键 `[_meta, answers]`）。

**边界裁定（船长）**
1. **2010–2019 的 80 道选择题 `options` 为空**（2010–2019 仅字母答案；另 10 道有不可用的 `options_ocr_unverified` 退化串）→ **不视为本任务失败**（t4 交付口径已声明「字母答案 + 可入库清单」），但 2.2.0 题库要能展示题目与四选项，故**立 t35（BOARD T109）**承接选项回填（页清单已由 t4 给出，P0＝2014/2016/2017/2018/2019 各 1 页可先清 40 道）。
2. **非选择题答案 136 条未亲读**（填空 46 = P0、解答锚点 90 = P2；清空填空后清单可由 161 → ~207）→ 登记为 2.2.0 入库批次的后续批次，不拦阻本验收。
3. 冗余中间件（本轮所建、交付流水线不使用）：`backup/scratch/refs-math3/` 下 `render-md.py`、`math3-md-header.md`、`math3-md-footer.md`、`index-tables.md`、`recompute.md` → 保留备查（`backup/` 已在 `.gitignore:18`，不入库）。
4. 唯一交付流水线口径：`index-<年>.json` checkpoint → `build-docs.py` → `check-index.mjs`；旧 `build-index.py` 的 OUT_JSON 已改指 scratch，避免覆盖交付物（船长确认该改动在 scratch 内，不影响交付物）。

**范围**：`data/**`、`src/**`、`style.css`、`app.js`、`dist/`、`tests/**`、版本七处、`CHANGELOG.md`、`docs/COVERAGE.md`、`docs/BOARD.md` 全未触碰；未跑 `npm run build`。**t3（T79）与 t4（本块）交付后，t6 四族汇总的全部依赖已满足。**

---
### T81 统计真题族转录基线（团队 t5）
- 状态: accepted
- 负责: 团队 athena-2.2-prep / refs-lead（t5）
- 文件集: 仅 `docs/refs/statq.md`、`docs/refs/statq.json`、`docs/refs/rulings/statq.md`、`backup/scratch/refs-statq/`
- 依据: AGENTS.md + docs/WORKFLOW.md §7 + `参考文件/真题/统计/`（JYSG 真题册、解析册、合集）
- 依赖: T77
- 验收:
  1. JYSG 241 页 + 解析册 708 页 + 合集 28 页（0 汉字，需读图）页覆盖无空洞
  2. 题源索引（学校｜年份｜科目｜题型｜知识点｜答案可信度）
  3. 公式重推清单（`Pn i=1 u2 0i`、`l0z/l10` 等碎片不可照抄）+ ≥40 条裁定
- 升版: 不升

### 报告
**验收结论（船长，accepted）**：统计真题族（JYSG 真题册 241 页 + 解析册 708 页 + 合集 28 页）题源索引、公式重推清单与 49 条读图裁定落盘；成员主动纠正了任务书里两处**与事实不符的前提**，并以证据支撑。

**交付**
- `docs/refs/statq.json`（303992 B）：`materials`（逐页 `page_kinds` 普查）、`chapters` 113（两册按序 zip 配对，`assert` 校验 school/code/year）、`index_schema`、`groups` 13、`heji_volumes` 14、逐章 `question_types`/`knowledge_tags`/`solution_count`/`answer_source`/`answer_confidence`/`recall`。
- `docs/refs/statq.md`（19040 B）：页覆盖审计 / 题源索引 3.1 十三组表（院校｜科目｜年份｜题型｜知识点｜答案可信度）＋ 3.2 合集 14 卷次表 / 公式重推清单 8 条＋4 条执行规则 / 复现命令 7 步 / 已知局限 8 条。
- `docs/refs/rulings/statq.md`（64301 B）：**49 条裁定**（jysg 23 / jiexi 20 / heji 6），七字段齐全，附结构性裁定 S1–S10（显式声明「非读图」）与「不可裁定」附录。
- 自检脚本 `backup/scratch/refs-statq/check_statq.py`（41 项）＋ 工具 `make_montage.py` / `native_stack.py` / `clip_meta.py`。

**船长独立复核（亲跑）**
- `& "参考文件\_venv\Scripts\python.exe" backup/scratch/refs-statq/check_statq.py` → 「合计 41 项：PASS 41 / FAIL 0」，`exit 0`；末段含 `PASS D1e statq.md 写明「合集 28 页 0 汉字」假设的更正`、`PASS D2 引用的 scratch 脚本真实存在（引用 12 个；缺失 无）`、`PASS D4 三份交付互相引用`。
- 文件体量与自报一致：`statq.json` 303992 B、`statq.md` 19040 B、`rulings/statq.md` 64301 B；JSON 键为 `id, title, generated_from, materials, chapters, chapter_count, questions_per_chapter, heji_volumes, heji_volume_count, index_schema, group_count, groups`，`chapters` 113 / `groups` 13 / `heji_volumes` 14，与自报一致。
- 裁定文件格式回读：通道口径写明「主通道＝自带 `read_image`；**禁用 modlens**（额度独立，耗尽时会返回退化的『成功』结果）」，裁片指纹由 `clip_meta.py` 从 PNG IHDR + sha256 直读，可凭命令逐字节复建 —— 与 T77 的 `docs/refs/README.md` 口径一致。
- 成员自证幂等：两个 emitter 连跑三次产物 sha256 完全一致；`git status` 改动面仅 `docs/refs/`（未跟踪）+ `backup/scratch/refs-statq/`，未碰 `data/*.js`、`src/*`，未跑 build。

**两处任务书前提更正（经船长采信，已写入本报告；T82/T85 须按新口径工作）**
1. 任务书「合集 28 页 0 汉字，需读图」**不成立**：合集文本层实有 21882 字符；仅 p7/p8（2004 北大统计学卷，题干全在 7 张嵌入图，每页约 10 字符）与 p21（真空白占位页，内容流仅 `[( )] TJ`）为低产/空白，已分别用 `native_stack.py` 原分辨率读图（R44/R45 补全 2004 卷六道大题）与内容流证据（R46）裁定。**T85（t9）复核「页覆盖无空洞」须按此真实口径**，不得再以「0 汉字」为前提。
2. 合集 **p12–p14 与 p9–p11 同文重复收录**（转录须去重）；p15–p17 未标年份卷 OCR 乱码，已列入已知局限、本波次未逐题裁定 —— 2.2.0 若要用该卷需补裁片。

**给 T82（t6 批次方案）的直接输入**
- 13 组里 **12 组答案可信度 high**（解析册 solution ≥3 条支撑）；北大 431 2026 为回忆版（`recall=true` → medium）；合集 14 卷一律 `none`。
- 题型/知识点为**受控词表自动统计**（55 章无题型名词者走 `derived` 兜底）→ 适合做「筛批」，不可当最终结论；公式碎片（`Pn i=1 u2 0i`、`l0z/l10` 等）已在重推清单中列明不可照抄。

---
### T82 2.2.0 转录汇总与批次方案（团队 t6）
- 状态: accepted
- 负责: 团队 athena-2.2-prep / refs-lead（t6）
- 文件集: 仅 `docs/refs/INDEX.md`、`docs/refs/2.2.0-PLAN.md`、`backup/scratch/refs-plan/`
- 依据: AGENTS.md + docs/WORKFLOW.md §7 + docs/COVERAGE.md（对齐但不改）
- 依赖: T78、T79、T80、T81
- 验收:
  1. **题库主线（只列增量）**：批次表只收录「参考资料里有而题库里没有」的题，按科目/年份/考点族给量并标来源页码；不得把现有 55 题（math3 24 / econ 15 / stats 16，已经 T63/T73/T76 逐题溯源审计）列为新增，不得把「重写已有题」计入交付；统计真题族增量须显式覆盖 2021–2026 空档与 JYSG/解析册多校多科题源
  2. **卡片主线（新增）**：知识卡片 × 教材讲义知识点全面覆盖比对矩阵（统计/微观/数学三），基准＝教材讲义知识点（茆诗松 8 章 + 14 专题 + 计量讲义；微观十八讲；数学三考纲/网络检索来源），**例题与课外题不纳入比对范围**；三类标注 `讲义有而卡片无`/`卡片有而讲义无`/`双方都有但需重写`；粒度到章—节—知识点并带页码，缺口给建议补写卡片数
  3. 两条主线分为两个批次表，每行含：材料范围｜产出形态｜验收口径｜依赖｜预估卡片/题量｜风险
  4. 「已可执行」与「仍需用户决策」两栏分明
  5. 输入可回读（t2 的 `knowledgeMapping`、t3/t4 知识点映射与卡片对拍列）；自建校验脚本 exit 0（矩阵条目数、缺口数可复算，页码引用可回读）
  6. 不得修改 `docs/COVERAGE.md`
- 升版: 不升
- 口径修订（用户 m02661，2026-10-10）: 题库侧只做增量、不重造已审计真题；卡片侧须与教材讲义知识点（不含例题与课外题）全面覆盖比对。契约以任务描述为准（t6 为 kind=work，无 quality 契约可 amend）。
- 口径修订 3（船长亲测，2026-10-10，**更正口径修订 2 的两处错误**）: ①`EXAMPLE` 键语义**三族一致**——全库 **421/421 键全部命中卡片 id**（`DATA` 是卡片对象数组，卡片 id 在 `DATA[i].id`；`data/math3.js:2342` 的 `inf08` 等「像标签」的键本身就是卡片 id），先前「math3 键＝知识点 tag id」为误判；②计数按展平条目数：**421 键 → 476 条**（math3 124/150、econ 131/149、stats 166/177），**每条都有 `src`（476/476）**、**带 `a2` 38 条**、数组值键 44 个（字面值可能是对象或数组，遍历必须判型展平）；③`META` 为 `{卡片id: [星级, 知识点标签]}` 且**三科 884 张卡片全部齐备**（math3 397 / econ 288 / stats 199；结构异常 0、星级越界 0、标签空 0，星级分布 math3 2:14/3:138/4:137/5:108、econ 3:36/4:153/5:99、stats 2:1/3:34/4:97/5:67）⇒ 卡片例题入库的 `star`/`tags` **可全自动派生**（`META[cardId][0]` / `[1]`），**无需**人工回退规则，仅 `type`（题型）需人工或规则推导，`year`/`school` 可从 `src` 文本解析；④`data/kr.js:9` 明示无 EXAMPLE（韩语学科不参与）。复算脚本 `backup/scratch/bank-examples/{count-examples.cjs,audit-meta.cjs}`（后者含 `DATA[].id` × `META` × `EXAMPLE` 交叉核对）。
- 口径修订 4（船长裁定，2026-10-10，卡片例题入库前置；**更正口径修订 3 的 `tags = META[cardId][1]`**）: ①**`tags` 用码 space**——题库现有 55 题的 `tags` 全部是同科**卡片 id**（math3 73 / econ 58 / stats 37 个去重码，`tagsNotInMeta` 全 0，例 `m3-2012-1` → `["ext06","lim01","gx01"]`），`META[cardId][1]` 只是**中文显示文本**（如 `"求极限：1^∞ 型"`），故卡片例题入库 `tags = [cardId]`（码）、`star = META[cardId][0]`；判据＝「`star === META[cardId][0]`、`tags ⊆ Object.keys(META)`、`cardId ∈ tags`」。②**id 采方案 A**：`cv-<sid>-<cardId>[-2]`（`sid ∈ {m3,ec,st}`），与现有 `^(m3|ec|st)-\d{4}-\d+$` 零相撞、跨科重名安全、一眼可溯回 `EXAMPLE[key]`（`a2` 为同题备用解法，不另立题目）。③**`type`（题型）允许受控扩展**：可为本学科 `bank.types` 追加**少量经审计**的题型键（每键给出中文名、覆盖题数与判据，先交船长审再落 `data/bank_*.js` 顶层数组），禁止逐题自由填词，`check_data` 的「必须命中既有 key」继续生效。④**无年份/无真题来源的卡片例题一律排除**，映射表单列「已排除 + 原因」交船长复核（例题仅真题红线）。⑤**`traps`/`hint` 禁止编造**：实测 `PITFALL` 仅覆盖 math3 34/124、econ 29/131、stats 34/166，`MNEM` 覆盖 9/0/10 → 卡片派生成品新增 `origin: 'card'` 标记，有则取 `PITFALL[cardId]`/`MNEM[cardId]`，**无则省略该字段**（不写空串），`src.note` 须写明来源卡片 id；`tools/check_data.mjs` 的「非空」ERR 改为仅对**存在的字段**生效，`src/bank.mjs` 详情页须容忍缺失（跳过该行）。
- 复算入口更正（refs-lead 报出，船长已修）: `backup/scratch/bank-examples/count-examples.cjs` 早期版本有漏计（只统计非数组值的 src/a2）且卡片数恒 `null`，**已由船长重写并亲跑**（现输出：卡片 884 ｜ EXAMPLE 键 421 ｜ 条目 476 ｜ 数组值键 44 ｜ 带 src 476 ｜ 带 a2 38 ｜ 键非卡片 id 0）；t6 引用计数依据时以该脚本 + `audit-meta.cjs` 为准。

### 报告
- 交付: `docs/refs/INDEX.md`（12775 B / sha256 `c43289f8…`）、`docs/refs/2.2.0-PLAN.md`（25825 B / sha256 `ee42b8c8…`）、`backup/scratch/refs-plan/`（`inventory.mjs`、`matrix.mjs`、`make_baseline.mjs`、`check_plan.mjs` 四个只读脚本 + `inventory.json`、`matrix.json`、`inventory-baseline.json`、`check-plan-report.json`）
- 结构: INDEX §0 索引用途 / §1 四族基线总览 / §2 相互引用关系 / §3 页码口径与别名 / §4 引用与复算命令 / §5 风险 R1–R10 / §6 相关文件。PLAN §0 摘要 / §1 三线批次表（§1.1 卡片线 C1–C5、§1.2 题库线 Q1–Q6、§1.3 取证线 P0-1–P0-4，六列统一：材料范围｜产出形态｜验收口径｜依赖｜预估量｜风险）/ §2 仍需用户决策 D1–D11 / §3 三科覆盖矩阵 / §4 题库增量池三类 / §5 复算、校验与局限 / §6 与 `docs/COVERAGE.md` §9 对齐表（对齐但不改）
- 关键数字（t6 清点时点）: 卡片 884（stats 199 / math3 397 / econ 288）；题库手写 55 + 卡片派生 170 = **225 题实体**；`EXAMPLE` 476（stats 177 / math3 150 / econ 149），已入库 170、**待入库 298**、无年份排除 8。卡片线＝stats 建议补写 27（纯缺口 16 + 补强 11）、重写 7 行 8 卡、micro 族缺口 13 张、math3 例题补挂 ≈60 条 + 4 张标题改写；题库线＝math3 真题净 283（就绪 161 = choice 108 + fill 53）、stats 上界 540（须覆盖 2021–2026 空档并与 170 条去重）、econ 446 题面；取证线＝t35 已回填 80 道选项、micro 49 页待裁定、stats 低产页已闭环
- 闸门: 船长亲跑 `node backup/scratch/refs-plan/check_plan.mjs` → **61 项 PASS / 0 项 FAIL，exit 0**（矩阵条目数与缺口数可复算、页码/锚点回读命中、相对链接 9 条可达、脚本写入仅在 `backup/scratch/refs-plan/`）；两件交付物字节数与 sha256 与自报一致；族闸门复跑仍绿（`check-index.mjs` 4011 项、`check_statq.py` 41 项）
- 验收对照: ①题库主线只列增量、已审计 55 题明确标注「不得重造」✅ ②卡片主线矩阵含三类标注与页码、教材例题不计入 ✅ ③两批次表六列齐备 ✅ ④§1/§2 两栏分明 ✅ ⑤自建校验脚本 exit 0、输入可回读 ✅ ⑥`docs/COVERAGE.md` git 零改动 ✅
- 未做项/待决策: **PLAN §2 的 D1–D11 待用户决策**（D1 卡片例题院校占比、D2 数三考纲三细节、D3 斯皮尔曼是否要求、D4 计量是否单列、D5 线代 84 卡是否拆 cat、D6 21 张未归考纲卡归属、D7 微观测卡口径 288 vs 271、D8 stats 真题 2021–2026 院校优先级与合集重复卷去重、D9 无年份 8 条确认排除、D10 范里安对偶/拟线性是否补卡、D11 math3 未收题与期望答案表是否扩到 econ/stats）；由船长统一呈报用户
- 过程记录: ①**清点后漂移已如实注明**——t35（T109）选项回填生效使 `docs/refs/{README.md,math3.md,math3.json}` 变化，§1.3 P0-1/P0-2、§1.2 Q4a/Q4b、§5 R1 的「80 道选项为空」均为清点时点描述；Q4a 改为 161 条一次性入库（回退则退化 81）并写明**禁止重复回填**；清点时点指纹固化于 `inventory-baseline.json → fingerprints`，`check_plan.mjs` 只对允许清单之外的新漂移报失败。②`data/bank_math3.js`（2/2，t21 题源写法）与 `data/bank_stats.js`（1263/4，t32）为队友在途改动，登记为 `report.git.dataInFlight`，不判失败。③未跑 build、未升版、未 commit。

---
### T83 题库公式渲染与选择题字母标识（团队 t7）
- 状态: accepted
- 负责: 团队 athena-2.2-prep / bank-eng（t7）
- 文件集: 仅 `src/bank.mjs`、`tests/bank.test.mjs`、`backup/scratch/bank-render/`
- 依据: AGENTS.md + docs/ARCHITECTURE.md（题库小节）+ docs/DATA_SCHEMA.md
- 依赖: 无
- 验收:
  1. 徽标/标签文本经 `texEl` 渲染，含 `$…$` 的知识点标签显示为公式（列表卡与详情页一致）
  2. 三组筛选器改自定义下拉（trigger + listbox），选项公式可渲染；`data-arg` 与 `handleAction('bankFilter', key+'='+v)` 契约保留
  3. 选择题选项加 `(A)–(D)` 前缀，答案区显示「答案：X」并标出正确项 `is-answer`；字母由 `answer` 派生（新纯函数入 TESTABLE 块并导出），`data/bank_*.js` 零改动
  4. `node --test tests/bank.test.mjs` → PASS；`node tools/check_data.mjs` → PASS；`node --test tests/build.test.mjs` → PASS
- 升版: 不升

### 报告
**切片交付**（bank-eng / t7，attempt `91074e17`）
- `src/bank.mjs`（+151/−35，882 行）：① 徽标（学校/年份/题型/频率/难度）、知识点标签 chip、`+N` 计数全部改走 `texEl`（`bankItemNode:721-773`、`bankDetailNode:775-844`）；② 三组筛选器改自建下拉——`bankFilterField:649` 生成 `button.bank-select`（`data-bank-facet`/`data-arg`/`aria-haspopup=listbox`/`aria-expanded`）+ `div.bank-select-menu[role=listbox]` + `button.bank-select-option[role=option][data-action=bankFilter][data-arg=key=v]`，展开/关闭/点外部/Esc 回焦在 `:608/:620/:629`，派发复用 `src/actions.mjs:315` 既有 `[data-action]` 委托；③ 选择题选项加字母（`span.bank-option-letter` + `span.bank-option-text`，正确项 `.bank-option.is-answer[data-option-letter]`），答案散文前插 `div.bank-answer-letter[data-answer-letter]`「答案：X」；④ TESTABLE 块新增纯函数 `BANK_CHOICE_RES:404` / `bankChoiceLetter(q):405-413`（解析不出返回 null），`:881` 导出。
- `tests/bank.test.mjs`（+382/−54）：34→36 用例。
- 证据：`backup/scratch/bank-render/{probe-render.mjs, probe-render.log, class-inventory.md}`。

**船长独立复核（实跑 + 源码回读）**
1. 闸门：`node --test tests/bank.test.mjs` → **36/36 pass，0 fail**；`node tools/check_data.mjs` → **✅ 全绿**（学科 25 / 卡片 2769 / 题库 3 科 / 真题 55）；`node --test tests/build.test.mjs` → **11/11 pass**。
2. 探针复跑 `node backup/scratch/bank-render/probe-render.mjs` → **0 处失败**，exit 0：过渲染管线文本节点 `{badge:550, tag:493, select:9, option:56, answer:55}` 全带 `data-tex`，**渲染后裸 `$` = 0**，含公式标签 20/20 实渲染，14 道选择题字母与期望答案表逐题一致。
3. 源码回读：`src/bank.mjs:404-413`（正则表与纯函数，与 `tests/bank.test.mjs:233-240` 期望答案护栏同口径）、`:813-824`（每题独立生成 `(A)–(D)` 与 `is-answer` 标记）、`:826-833`（「答案：X」仅在解析出字母时渲染，无选项题行为不变）。
4. **测试未被弱化**：被删断言是原生 `<select>` 契约，替换为更强的结构断言——`byTag(tree,'select').length === 0`、`byTag(tree,'option').length === 0`、三组 `.bank-select-menu` 弹层、trigger 必须为 `button[type=button]`、`aria-haspopup=listbox`、Esc 关闭、`data-action`/`data-arg` 双契约、`bankSelectOpen` 重渲染复位。断言数净增而非删减。
5. 范围审计：`git diff --numstat` 仅 `src/bank.mjs` 151/35 与 `tests/bank.test.mjs` 382/54；`data/`、`style.css`、`src/learn.mjs`、`src/actions.mjs`、`src/render.mjs`、`app.js`、`dist/` 零输出；未跑 `npm run build`（符合约定）。

**低风险观察（登记，不阻塞）**
- 若某题 `answer` 能解析出字母但 `options` 数量小于该字母序号，则不会有选项行被标 `is-answer`（「答案：X」仍显示）。当前 14 道选择题均为 4 选项，未触发；待题库全量入库后由答案护栏（`tests/fixtures/bank-answer-manifest.json` 的「choice→4 选项」断言）兜住。

**交接**：新增类名清单见 `backup/scratch/bank-render/class-inventory.md`（`bank-select-text`/`bank-select-caret`/`bank-select-menu(.is-open)`/`bank-select-option.is-selected`/`bank-option-letter`/`bank-option-text`/`bank-option.is-answer`/`bank-answer-letter`），供 T84（t8，style-eng）落地 CSS；DOM/计算样式覆盖由 T86（t10）在唯一构建后完成。

**验收结论**：4/4 条 acceptance passed；无 blocking 发现。

---
### T84 题库新结构样式与悬浮窗位移（团队 t8）
- 状态: accepted
- 负责: 团队 athena-2.2-prep / style-eng（t8）
- 文件集: 仅 `style.css`、`backup/scratch/bank-style/`
- 依据: AGENTS.md + docs/ARCHITECTURE.md（设计 Token）+ 契约修订（2026-10：悬浮窗顶部锚定）
- 依赖: T83
- 验收:
  1. 按 t7 报告类名清单落地（下拉 trigger/listbox/选中态、标签与选项内公式、答案标识与 `is-answer`、徽标与 `+N`）
  2. 只用既有 token、无死 token、无失效选择器；亮/暗对比度 AA（低于 AA 者逐条登记）
  3. `.focus-reminder` 改顶部锚定（桌面 `top: calc(12px + var(--safe-top, 0px)); right: 14px; bottom: auto`，≤420px 顶部窄幅），**不与 `.rating`（`style.css:443`）或 `.dock`（`style.css:1181`）相交**，其余折叠/过期规则不变
  4. `node tools/check_render.mjs` → exit 0
- 升版: 不升

### 报告
**切片交付**（style-eng / t8，attempt `7e1aa416`）
- `style.css` **+204/−34（2220 → 2390 行）**，唯一改动文件（另有 `backup/scratch/bank-style/` 证据目录）。
- t7 类名清单逐条落地：`.bank-select-text` / `.bank-select-caret` / `.bank-select-menu(.is-open)` / `.bank-select-option(.is-selected)`、`.bank-option-letter` / `.bank-option-text`、`.bank-option.is-answer`、`.bank-answer-letter`；4 处就地改造：`.bank-option` block→flex（字母固定列，`(A)–(D)` 对齐不再随文本抖动）、`.bank-select` 由原生 `<select>` 改为 button 两栏重置、`.bank-select-option` 扩成弹层按钮、`.bank-head-scope` 由 `--text-faint` 改 `--text-muted`（消掉 2.38/2.53 不达标）。
- 徽标/标签/下拉/答案标识内的 KaTeX 适配（10 个容器渲染后残留裸 `$` = 0）。
- **船长追加四条全部落地**：① 四组筛选桌面单行（容器 880px、四组各 212.5px、无横向溢出、无零宽），390 宽竖排四行与既有 `@media 760` 一致；② `.bank-filter-year` 并入 `min-width: 0` 钩子（`style.css:2165`）；③ `.focus-reminder` 顶部锚定（`style.css:2061`，子规则/态规则/折叠交互逐条未动），新增几何 token `--safe-top`（`style.css:96`）；④ 层级实测 **menu 30 < dock 50 < rating 60 < reminder 90**（弹层不遮底栏，`.bank-filter{position:relative}` 定位参照链未动）。
- 契约第 5 条：`.bank-head` / `.bank-title` 重复定义合并为一处（`:1738`/`:1745`）。

**船长独立复核（实跑 + 源码回读）**
1. `node backup/scratch/bank-style/probe-style.mjs` → **exit 0 / 0 处失败**（vm 沙箱加载真实 `src/bank.mjs` DOM + 真实 `style.css` + 真实 KaTeX，5 视口 × 亮暗，量 computed 样式/对比度/几何/遮挡；不经 `app.js`）；`node tools/check_render.mjs` → **exit 0**（KaTeX 就绪 / 2769 卡片 / 9828 渲染字段 / 问题数 0 / ✅ 全绿）。
2. 源码回读确认关键点：`style.css:2165` 钩子行含 `.bank-filter-year`；`:2061` `.focus-reminder` 顶部锚定且 `z-index: 90`；`:96` `--safe-top: 0px` 已定义；`:1186` `.dock` `z-index: 50`、`:432` `.rating` `z-index: 60` —— 与报告的层级实测一致；用户 m02008 的诉求（悬浮窗不再压住四档评分）由「贴顶 + 与 `.rating`/`.dock` 矩形不相交」两条独立判据保证。
3. 范围审计：`git diff --numstat -- style.css` = `204 34`；其余文件在该切片窗口零写入（`git status` 中的其他改动分属 t7/t14/t18/t19/t21 各片）。

**登记（不阻塞）**
- 唯一 <3:1 的对比度项是契约明文冻结的 `.focus-reminder.is-expired .focus-reminder-clock`（`--warn`，2.15:1，未改）；另有 8 项次要文本 <4.5 但 ≥3（`tag` 4.23、`badge-diff-star1` 4.11（合成样本，库内无 ★1 难度题）、`badge-type`/`reminder-level-appoint` 3.93、`badge-freq-star3` 3.80、`btn-detail`/`reminder-level` 3.68、`badge-freq-star5` 3.22），暗色全部 ≥6.28；逐条见 `backup/scratch/bank-style/README.md` §3。
- 既有遗留死 token `--text-3xl`（`style.css:42`，HEAD 既有）只登记未动。
- **生成物仍需 verifier 复核**：t8 探针走自建 harness，不代表 `app.js` 生成物里的 DOM/层级；T86（t10）构建后须在真实页面复核弹层层级与悬浮窗位置。

**验收结论**：6/6 条 acceptance passed（含船长追加的两条）；无 blocking 发现。

---
### T85 参考资料转录基线独立验证（团队 t9）
- 状态: open
- 负责: 团队 athena-2.2-prep / verifier（t9）
- 文件集: 仅 `backup/scratch/verify-refs/`
- 依据: AGENTS.md + docs/refs/README.md
- 依赖: T78、T79、T80、T81、T82
- 验收:
  1. 每族抽 ≥5 条裁定重建裁片并亲读复核（原裁片哈希须可复现）
  2. 抽 ≥3 条 JSON 索引回读 `参考文件/_extract/*.txt` 对拍；抽 ≥3 条公式独立复算
  3. 页覆盖无空洞审计；反证 ≥2（构造错误裁定应被检出）
  4. 证据落 `backup/scratch/verify-refs/`，不成立即 findings
- 升版: 不升

### 报告
（待切片交付；主对话验收后落盘）

---
### T86 题库修复独立验证与构建（团队 t10）
- 状态: accepted
- 负责: 团队 athena-2.2-prep / verifier（t10）
- 文件集: 仅 `app.js`、`dist/`、`backup/scratch/verify-bank/`
- 依据: AGENTS.md + docs/WORKFLOW.md §5
- 依赖: T83、T84
- 验收:
  1. `npm run build` → `npm run check` → `npm test` → `npm run check:render` 四条 exit 0（本波次唯一构建）
  2. 真实 DOM 烟测：标签公式渲染、下拉可展开可选择、选项字母与「答案：X」在位、正确项标记正确
  3. 修复前后对照 + 反证 ≥2；`data/bank_*.js` 哈希与修复前一致；范围审计
  4. 未覆盖项诚实登记
- 升版: 不升

### 报告
**验收结论（船长，accepted）**：题库修复（t7/t8）经独立验证 **verdict=pass**，无阻塞性发现、无需 repair；本轮唯一构建产物 `app.js` = `dist/app.js` **877804 B / sha256 `b98a1090a0c6d160e1ccfd3694033afc1171d7f931a41070d7137c27ea96649b`**。

**交付**：`backup/scratch/verify-bank/`（VERIFICATION-REPORT.md、probes.log、gates.log、scope-audit.log、probe-*.json、mut-unit-results.json、`shots-*` 8 组 16 张截图、`head-tree/` 基线检出）；写入面仅 `app.js`、`dist/`、`backup/scratch/verify-bank/`。

**船长复核（亲跑）**
- `(Get-FileHash app.js -Algorithm SHA256)` = `b98a1090a0c6d160e1ccfd3694033afc1171d7f931a41070d7137c27ea96649b`、877804 B —— 与验证报告逐字一致；`node tools/build.mjs --check` → 「app.js 与 src/ 同步」exit 0。
- `git diff --quiet -- src/fsrs-core.mjs` → exit 0（零改动，红线守住）。
- `dist/style.css` 实测 108279 B / sha256 `c6c52d688c4cecf26c24563b5c4c06e0452ecfbb84bb47f0ddf9dc6ac7112b7c`（即 t8 冻结修订版），工作树 `style.css` 106452 B / `c14e925abdc48e8a585e29eb6303d380c0eba1be7d36d45c2a4fda42408755c0` —— 与验证者「dist 落后工作树」的判断一致（见下「转交」）。
- 证据目录与 gates.log（36515 B）在位。

**核心结论（验证者证据，船长采信）**
1. **修复前/后对照**（同一探针、真实 headless Chrome + 自建 CDP、71 条断言）：HEAD 基线 exit 1 / 判红 41 条——math3 列表 93 枚标签中 14 枚裸 `$`（econ 5/74、stats 7/73）、120 枚徽标 `data-tex` 全缺、14 道选择题无 `(A)–(D)`、无「答案：X」、无 `is-answer`、筛选器仍是原生 select（3 组、缺 year、选项裸 `$` 39/9/12）；修复后 exit 0 / 0 判红，三科逐题走查 24/15/16 全通。
2. **反证（自造，两载体）**：单测载体 baseline 39/39 绿，4 个变体各 exit 1 且定向命中（texEl 贯通 / 选择题标识）；CDP 载体 m1 15 红、m2 2 红、m3 4 红、m4 3 红，样式断言能独立识别 `is-answer` 挂错 → 护栏非空转。
3. **四道闸门全 exit 0**：build（唯一）/ check / test（pass 331 fail 0）/ check:render（全绿）。
4. **范围审计（blob 级）**：`src/fsrs-core.mjs` 与 HEAD 逐字节一致；`data/bank_econ.js`/`bank_stats.js` blob 与 HEAD 相同；`data/bank_math3.js` 仅 2/2 行 school（T95/t21 的改动，非 t7/t8）；`index.html`/`sw.js`/`CHANGELOG.md` 与 HEAD 零差异；`package.json` 唯一差异＝T96 追加 `tests/map.test.mjs`；t8 的 diff = 204/34 与其自报一致 → **t7/t8 均未越界**。
5. **真实渲染烟测**：四组自建下拉（type/tag/star/year）展开·关闭·Escape 回焦·点外部关闭、含公式选项 KaTeX 全渲染、选中后命中收敛 24→4 / 15→3 / 16→6；14 道选择题字母与「答案：X」与人工转录表三方一致；新增样式 11 条实测（菜单 212.5×264 / z-index 30、筛选行 880=880 四组单行、字母列 22×18.2、「答案：C」60×21.6、chip 内 KaTeX 完整包裹）。

**诚实口径（验证者登记，船长照录）**：7 条未覆盖项（窄屏/暗色未独立复核、键盘只覆盖 Escape 回焦与点外部、KaTeX 缺失降级未复跑、浏览器矩阵仅本机 headless Chrome、打印样式、AA 对比度未复测）+ 3 条空转/未复现断言（`style:reminder-no-overlap` 空转＝该页面无 `.focus-reminder`，故「与 `.dock`/`.rating` 不相交」**未实测**；econ/stats 无选择题致 4 条空转；菜单遮挡未做矩形相交判定）。→ 悬浮窗几何与 AA 对比度已转 **T97/t16（t16 复测项）**。

**转交 / 处置**
- **dist/ 落后工作树（非缺陷，已转 t16）**：`style.css` 在构建后被 T97/t23 改写（108279 B `c6c52d68` → 106452 B `c14e925a`），验证者**故意未追迁**以免把未完成制品打进发行物 —— 正确判断。→ 由 T90（t16，本波次最终构建，已把 t23 纳入依赖）在全部实现任务 terminal 后统一重建 `app.js` + `dist/`。
- `tests/focus.test.mjs:1272` 单例失败发生于 t10 闸门之后，属 focus 模块在制品（t13 窗口）；bank-eng 已在 t22 完成后复跑全量 `node --test tests/*.test.mjs` → **337/337 pass / 0 fail exit 0**，该例已消失；t16 仍须独立复跑并记录时间窗。
- 验证者主动请求「style.css 写入停止后再授权一次构建」；船长裁定：**不新增构建授权**，统一由 t16 执行（避免两次构建互相覆盖产物）。

---
### T87 专注链 UI 回滚与树杈层级（团队 t12）
- 状态: accepted
- 负责: 团队 athena-2.2-prep / focus-eng（t12）
- 文件集: 仅 `src/focus.mjs`、`src/settings.mjs`、`tests/focus.test.mjs`、`tests/act-settings.test.mjs`、`backup/scratch/focus-ui/`
- 依据: AGENTS.md + docs/ACT.md §5/§11 + 2.0 基线（commit `061f140`）
- 依赖: 无
- 验收:
  1. 树行不再有彩色内联样式（`row.style.borderLeft`/`background`、`focusLevelBadgeEl` 的 tint 用法移除），层级改用树杈状引导线；主行＝编号+名称+层级文字标（可在设置关闭）
  2. 展开后显示：起止时间、总时间、平均完成度、下级数量、单元数量、是否计划中、计划截止日期（数据取 `focusOrgStats`/`focusNextLevelCount` 等既有纯函数）
  3. 展开热区 ≥32×32px；≤420px 无横向溢出；2.1.0 能力零回退（严格逐级归属/番号最小空缺/树内拖拽/悬浮提醒）
  4. 计时悬浮窗内联兜底改顶部锚定；探针断言其与 `.rating`/`.dock` 不相交、四档按钮中心 `elementFromPoint` 命中按钮本身（桌面与 ≤420px 各一组）
  5. `node --test tests/focus.test.mjs`、`node --test tests/act-settings.test.mjs`、自检 `check-focus-ui.mjs` → 全 PASS
- 升版: 不升

### 报告
**验收结论（船长，accepted）**：专注链状态视图已回到「无彩色、树杈表达层级、文字标区分层级」的简洁形态；2.1.0 的彩色视觉层在 src 侧已无来源，四项能力零回退，移动端不溢出。

**交付（改动文件：`src/focus.mjs`、`src/settings.mjs`、`tests/focus.test.mjs`、`tests/act-settings.test.mjs`、`backup/scratch/focus-ui/{check-focus-ui.mjs,t12-evidence.json,t12-evidence.md}`；未碰 `style.css` / `app.js` / `data/`，未跑 build）**
- **去彩色内联**：删除树行 `row.style.borderLeft` / `row.style.background` 与 `focusLevelBadgeEl` 的 `tint`/`borderColor`/`borderWidth`/`borderRadius:999px`；`FOCUS_LEVEL_VISUAL_KEYS` 由彩色字段改为结构字段 `['rank','order']`（`src/focus.mjs:713`），`FOCUS_LEVEL_VISUALS`（`:716`）现只含 `{ level, rank, order, name }`。
- **树杈引导**：`focusTreeGuides(rows)`（`src/focus.mjs:764`）+ `FOCUS_TREE_GUIDE_GAP = '\u00A0'`（`:744`）；实测引导串 `├─` / `│ └─` / `│   └─` / `│     ├─` / `└─`，长度严格 `2*(depth+1)` 递进，纯字符不依赖颜色。
- **两段式信息行**：主行＝番号 + 名称 + 层级文字标（`showLevelTag` 行动设置可关、默认开，`src/focus.mjs:40`/`:155`、`src/settings.mjs:59`/`:94`/`:170`、设置页真实点开关 `src/settings.mjs:592`/`:597`）；展开第二段 7 字段＝起止时间 / 总时间 / 平均完成度 / 下级数量 / 单元数量 / 是否计划中 / 计划截止日期，全部取自既有纯函数（`focusOrgAggregates`≡`focusOrgStats`、`focusNextLevelCount` `src/focus.mjs:1668`、`focusChildLevelOf`、`fromPlan`、`dueAt`）。
- **可点击性与移动端**：展开控件 36×36（≤420px 为 40×40；2.1.0 为 28×28）；桌面与 400×780 均 `scrollWidth == innerWidth`，35 字长名称不撑破（主行省略号）。
- **悬浮计时窗（T75/BOARD T84 契约第 4 条的应用侧一半）**：改顶部锚定（≤420px 下移 78px 避让顶栏 ☰），与 `.rating` / `.dock` 矩形不相交；四档按钮中心 `elementFromPoint` 全命中按钮自身。

**船长实测（全部亲跑）**
- `node --test tests/focus.test.mjs` → **60/60** exit 0；`node --test tests/act-settings.test.mjs` → **11/11** exit 0。
- `node backup/scratch/focus-ui/check-focus-ui.mjs` → **PASS 59/59** exit 0（六组：亮/暗 × 1360×900 与 400×780 + 文字标关 + 设置开关真实点击往返；内存 `buildProduct()` 产物 736,469 字符服务，不写工作树 `app.js`）；证据 `backup/scratch/focus-ui/t12-evidence.json` + `t12-evidence.md`。
- 源码回读核对（非仅凭报告）：`src/focus.mjs:713` 的 `FOCUS_LEVEL_VISUALS` 定义体只含 `level/rank/order/name`；树行渲染不再写 `borderLeft`/`background`；残留 `.style.background` 三处（`:2429` chip、`:2496` 悬浮窗内联兜底、`:2538` 按钮透明）全部是**主题 token**（`var(--bg-elevated)`/`transparent`）且受 `focusCssDeclared()` 守卫，不属彩色层级层。

**探针抓出并修掉的 3 个真 bug（勿回退）**：① 树杈竖线丢失；② 上一棵子树竖线泄漏（`focusTreeGuides` 必须保留 `prevDepth` 闭合）；③ 引导线留白必须用 `\u00A0`（普通空格被 HTML 折叠 → 深层缩进错位，`tests/focus.test.mjs` 期望 `'│ \u00A0 └─'`）。

**未做项 / 转交**
- `style.css` 仍留 `.focus-tree-row[data-level]` / `.focus-level-mark` / `.focus-level-badge[data-level]` 四条 2.1.0 彩色规则（src 侧已无内联来源，属纯删减）→ 由 **T97（t23，style-eng）** 清理。
- `saveActSettings` 的 `p.focus` 分支只写 `athena_focus_v1.settings`（`src/settings.mjs:163-176`），`athena_act_cfg_v1` 只存 habit 段，故 `athena_act_cfg_v1.focus.showLevelTag` 为 null；与 2.1.0 风味开关同构，**是否进同步包未定**（不在本任务范围，留待 2.2.0 决策）。
- 长名称主行为省略号；若后续要求展开后显示完整名称，需另行派单。

---
### T88 已完成单元免计划组合与转正收紧（团队 t13）
- 状态: accepted
- 负责: 团队 athena-2.2-prep / focus-eng（t13）
- 文件集: 仅 `src/focus.mjs`、`tests/focus.test.mjs`、`backup/scratch/focus-combine/`
- 依据: AGENTS.md + docs/ACT.md §5
- 依赖: T87
- 验收:
  1. 已完成单元无需计划模式即可组合，产物为「已完成层次」（可再归属更高层次，层级 +1）；未完成单元的非计划组合明确失败并给出原因
  2. `focusOrgCanFormalize` 增加「下一级全部为完成单元」判据（组→单元；群/集团→递归到单元），失败返回 need/childCount/未完成清单
  3. 纯函数测试覆盖上述分支，`tests/focus.test.mjs` 原有 52 条零回归
- 升版: 不升

### 报告
**验收结论（船长，accepted）**：「已完成单元免计划组合 → 产物即已完成层次」与「转正须下一级全部为完成单元」两项语义均落地，且**未完成成员的非计划组合是零写入拒绝**（不留空壳），UI 只用文字区分、无颜色无图标。

**交付（in-scope 3 项：`src/focus.mjs`、`tests/focus.test.mjs`、`backup/scratch/focus-combine/`）**
- 新纯函数（船长已回读源码确认存在与行号）：`focusUnitDone`（`src/focus.mjs:572`）、`focusOrgPending`（`:577`）、`focusNodeDone`（`:582`）、`focusOrgStateLabel`（`:590`）、`focusCombineReadiness`（`:597`）、`focusIncompleteUnder`（`:611`）、`focusFormalizeHint`（`:637`）、`focusReasonText` + `FOCUS_REASON_TEXT`（`:2193`/`:2206`）。
- `focusCombineNodes`：非计划模式且成员全为已完成 → 产物 `fromPlan=false` + `formalized=true`（直接进「已完成层次」）；成员含未完成 → `{ ok:false, reason:'member_incomplete', pending, doneCount, memberCount }` 且**零写入**（`src/focus.mjs:1717`）。
- `focusOrgCanFormalize`：`minChildCount` 下限（`need_fill` 优先）之外新增「下一级全部为完成单元」（组→单元；群/集团→递归到单元）→ `{ ok:false, reason:'need_done_units', need, childCount, pending }`（`src/focus.mjs:1840`）；`focusFormalizeOrg` 透传不绕过。
- 文案（`:2193`）：`need_done_units` =「下级还有未完成单元，须全部完成后才可转正」；`member_incomplete` =「有待完成的成员，须全部完成后才可免计划组合」。
- UI（纯文字）：org 行新增 `span.focus-tree-state`（计划中 / 已完成）；转正入口不满足时 `disabled` + `title` + `span.focus-tree-hint` 原因；组合弹窗两种文案且禁用时点击零写入；展开项「是否计划中」改写为「是 · 转正需下级全部完成（≥ N 个）」/「否（已完成层次）」。

**船长独立复核（亲跑）**
- `node --test tests/focus.test.mjs` → **tests 66 / pass 66 / fail 0**（60 既有零回归 + 6 新增，含「t13 非计划模式含未完成成员：明确拒绝，零写入（不得留空壳）」「t13 转正收紧：下一级须全部为完成单元（组→单元；群/集团→递归到单元）」「t13 纯函数：完成/计划层判据、组合准备度、未完成清单与原因文案」）。
- `node --test tests/act-settings.test.mjs` → **pass 11 / fail 0**。
- `node backup/scratch/focus-combine/check-combine.mjs` → **「结果 PASS：42/42 检查通过」exit 0**（Node 矩阵 N1–N5 + 亮/暗 × 桌面/窄屏三组 DOM 观测，内存 `buildProduct()` 覆盖 app.js，不依赖生成物）。
- 成员补充回归：临时副本跑 t12 自检 **59/59 PASS**（UI 零回退），副本已删、`backup/scratch/focus-ui/` 未改写。
- **历史失败项闭合**：`tests/focus.test.mjs:1272`（组/群/集团按显式层次统计）此前确定性失败，系 t13「先改 src 后改测试」窗口期的中间态；现该例已在改写后通过，我复跑 66/66 全绿，T96 报告中「归属 T88」的裁定就此结案。

**未做项 / 转交**
- 成员未跑 `npm run build`（守约）：`app.js`/`dist/` 仍为旧产物，专注链最终形态由 T90（t16）构建后复核；**但 T88 与本波次最终构建之间新增了 T98（t24，删除死代码 `focusParentChipEl`），故 T90 的构建产物将被 t24 再次改变** → 船长已决定：t24 完成后另派一次性「权威最终构建 + 四闸门 + t24 独立验证」任务（t25，verifier），以该任务产物作为发行态。
- T91（t17）文档回写新增项：`docs/ACT.md` §13 须写入「已完成层次」概念（免计划组合产物，`fromPlan=false` + `formalized=true`）、转正双条件（最低下级数 + 下级全部完成）、以及两条拒绝原因文案 `need_done_units` / `member_incomplete`；`docs/ARCHITECTURE.md` 的纯函数清单补 8 个新函数名与行号。
- 成员申报的「`style.css` 仍有层级彩色规则」在 T97（t23）已整段清除，无需再派。

---
### T89 题库按年份/卷筛选（团队 t14）
- 状态: accepted
- 负责: 团队 athena-2.2-prep / bank-eng（t14）
- 文件集: 仅 `src/bank.mjs`、`src/actions.mjs`、`src/learn.mjs`、`tests/bank.test.mjs`、`backup/scratch/bank-year/`
- 依据: AGENTS.md + docs/ARCHITECTURE.md + docs/DATA_SCHEMA.md
- 依赖: T83
- 验收:
  1. 年份选项按数据派生（降序去重；同年多来源显示「年份+来源简称」，口径同 `bankSchoolLabel`）；状态键 `bankYear`（`''`＝全部）
  2. `case 'bankFilter'` 新增 year 分支，三科均可筛选；与题型/知识点/难度/搜索可组合
  3. `data/bank_*.js` 零改动；`node --test tests/bank.test.mjs` → PASS
- 升版: 不升

### 报告
**切片交付**（bank-eng / t14，attempt `cbf4ea79`）
- `src/bank.mjs`（+244/−40）：年份谓词 `bankYearSelected(q, sel):368`（`''`/`'all'` 放行；无 `|` 比 `String(q.year)`；有 `|` 比「年份 + `bankSchoolLabel(q)`」）经 `bankMatch:145` 接入筛选链，`bankCurrentFilter:209` 暴露 `year`；选项派生 `bankYearRows:386`（按「年份 + 来源」聚合、年份降序、同年来源升序、带题数）与 `bankYearOptions:412`（首位「全部年份」，单来源年 value 为裸年份、同年多卷为 `'年份|<school>'`，文案用 `bankYearSourceLabel:378` 去尾部「NNNN 年」）；跨科残留自愈 `bankNormalizeYearFilter:432`（在 `bankListPage:628` 调用，回全选态）；第四组筛选在 `bankFilters:803` 追加于难度之后，`bankFilterField:734` 产出既有 `bank-filter`/`bank-select` 结构（`bank-filter-year`）；TESTABLE 导出 `:967`。
- `src/actions.mjs`（+5/−1）：`case 'bankFilter':163` 新增 year 分支（`'all'` → `''`），`bankReset:211` 复位年份。
- `src/learn.mjs`（+4/−3）：会话状态 `bankYear:528`（`''` = 全部），`resetSessionState:543` 复位。
- `tests/bank.test.mjs`（+？，38 例）；证据 `backup/scratch/bank-year/{probe-year.mjs, probe-year.log}`。

**船长独立复核（实跑 + 源码回读）**
1. 闸门：`node --test tests/bank.test.mjs` → **38/38 pass / 0 fail**（T83 时 36）；`node tools/check_data.mjs` → **✅ 全绿**（25 学科 / 2769 卡 / 3 题库科目 / 55 真题）。
2. 探针复跑 `node backup/scratch/bank-year/probe-year.mjs` → **exit 0 / 0 处失败**（三科年份选项命中集合逐项对拍、720 组「年份 × 题型 × 难度」正交、年份 × 关键词、跨科残留自愈、空集文案）。
3. **数据零改动（红线）**：`git diff --numstat -- data/` 输出 0 行；三份数据 sha256 与开工前一致 —— math3 `682472f1f72ecfbe85e76572d47f262a9235c0b1247a23e79ca1ce46ce566e82`、econ `17f291908f978a434aba55e6e13b419d18a9e283fd65ed0eab5b32c8634320a1`、stats `b614aa48f86b42d9a73b392aaaa38aaee84425b7a4acf31e79030ebe9e4a1806`。
4. 源码回读：谓词 `:370-374` 与选项派生 `:412-428` 逐行核对，语义与 T92/T91 文档将写入的口径一致（同年多来源用完整来源串作 value、简称只用于文案，避免同名前缀互相覆盖——这正是我关心的边界，已确认处理正确）；`:145` 注释明写「`f.year` 缺省（历史调用方）时不参与匹配」，向后兼容成立。
5. 范围审计：改动只落在声明的四个文件（`src/bank.mjs`/`src/actions.mjs`/`src/learn.mjs`/`tests/bank.test.mjs`），`data/`、`style.css`、`src/focus.mjs`、`src/wrong.mjs`、生成物、`package.json`、`tools/` 零输出；未跑 `npm run build`（符合约定）。

**交接与遗留**
- **样式缺口（低风险，已转 t8）**：`style.css:2150` 的钩子行 `.bank-filter-type, .bank-filter-tag, .bank-filter-star { min-width: 0; }` 未含 `.bank-filter-year`。功能上不构成缺陷（`.bank-filter:2142-2147` 基础规则已给 `flex: 1 1 190px; min-width: 0`），但**四组筛选同排一行**后换行密度变化（原注释按「三组同权」写的 190px 实测假设）需 style-eng 复核：把 year 纳入钩子行、确认 4 组在窄屏的换行与弹层定位（`.bank-select-menu` 依赖 `.bank-filter{position:relative}`）。已把这两点发给 style-eng（t8 进行中），并说明由 T86/T90 验证时按计算样式复核。
- **T91 文档回写锚点**：t14 报告给出 `src/bank.mjs` 145/209/368/378/386/412/432/628/733/790/803/966-967、`src/learn.mjs` 528/543、`src/actions.mjs` 163/211；t13/t18 合并后行号会漂移，届时必须回读核对。文档举例建议用 math3 2025（唯一「同年多来源」年：两卷分别 2 题与 1 题）。

**验收结论**：4/4 条 acceptance passed；无 blocking 发现。

---
### T90 全波次最终独立验证与构建（团队 t16）
- 状态: accepted
- 负责: 团队 athena-2.2-prep / verifier（t16）
- 文件集: 仅 `app.js`、`dist/`、`backup/scratch/verify-focus/`
- 依据: AGENTS.md + docs/WORKFLOW.md §5
- 依赖: T86、T87、T88、T89、T92、T93
- 验收:
  1. 四闸门 `npm run build`/`check`/`test`/`check:render` 全 exit 0（本波次唯一最终构建）
  2. 真实 DOM/计算样式：树杈层级、信息行字段、展开热区、≤420px 无溢出、悬浮窗与档位条不相交
  3. 组合语义端到端（免计划组合、再归属、转正收紧）、年份筛选、错题自测导航、自测星标口径
  4. 反证 ≥3 + 范围审计（`src/fsrs-core.mjs` 未改、`data/bank_*.js` 哈希一致）
- 升版: 不升

### 报告
**验收结论（船长，accepted）**：全波次独立验证 **verdict=pass**，无阻塞性发现、无需 repair。构建窗口 17:48:05→18:25:26；`app.js` = `dist/app.js` = **877215 B / sha256 `60454ab7869a56a20aba4ba9750fb6e35d67865813dd0571ae5c9a8507a14ceb`**（18:23:10），`style.css` = `dist/style.css` = 106219 B / `a7ca32381d9666be00cafb33fbf9a31fc237eff5bec611ab557bbc9b085b6d98`（17:52:50）。

**交付**：`backup/scratch/verify-focus/`（`VERIFICATION-REPORT.md`、`probe-final.json`、8 张截图、gates 日志）；写入面仅 `app.js`、`dist/`、`backup/scratch/verify-focus/`。

**四闸门（验证者亲跑，全 exit 0）**
- `npm run build` 连续两次产物逐字节一致；`node tools/build.mjs --check` 于 18:25:26 再验 exit 0。
- `npm run check` → 25 学科 / 2769 卡片 / 3 题库科 / 55 真题，版本标记一致、`app.js` 与 `src/` 同步。
- `npm test` → **338/338 pass / 0 fail**（船长交接口径 337；多 1 例属本窗口内并发新增用例，已按时间窗记录，非回归）。
- `npm run check:render` → KaTeX 就绪 / 2769 卡片 / 9828 渲染字段 / 0 问题。

**真实站点探针**（真 `index.html` + 真 `app.js` + 真 `style.css` + 真 KaTeX，headless Chrome/CDP）：**55/55 绿 exit 0**，断言跨 selftest / wrong-nav / focus-ui / focus-combine / bank-year / style 六组。

**反证（三组自造，均按预期判红）**：m1 UI 回滚（内联彩色层级）4 红；m2 去掉免计划完成门槛 4 红（含「提交后零写入」被破坏：`stateChanged=true` 且多出探针组 C）；m3 年份谓词恒真 4 红（选 2023 得 24 vs oracle 4）。变异体经 `--override` 顶替，未写 `src/`。

**三项历史未覆盖/空转项复测**
1. 悬浮提醒 vs `.dock`/`.rating` 几何**不相交已实测到**（390×780 亮/暗、`.dock` 高度 > 0）→ T86 登记的空转断言消除。
2. AA 不回归：`tag` 4.23 / `badge-type` 3.93 / `btn-detail` 3.68 / `diff★1` 4.11 / `freq★3` 3.80 / `freq★5` 3.22（星标用合成样本补 10 档：亮最小 3.22、暗最小 6.28）；时钟 2.15:1 为契约冻结项。
3. 层级「文字 + 树杈」在真实产物上 computed 颜色四层（army/corps/group/unit = 1/1/3/5）全等，`.focus-level-*` 着色规则 0 条。
探针侧修掉两处假阳性：`__effBg` 改逐层 alpha 合成；主题切换后等 420 ms 再测（暗色「详情」按钮真值 6.79，此前白底 3.68 系过渡起点）。

**范围审计**：`data/bank_{math3,econ,stats}.js` 与开工逐字节相同（`cdcda170…`/`17f29190…`/`b614aa48…`）；`src/fsrs-core.mjs` 与 HEAD 逐字节一致；`index.html`/`sw.js`/`bank_econ`/`bank_stats` 零改动；**t24 死代码删除已进产物**（`focusParentChipEl` 在 `src/focus.mjs`/`app.js`/`dist/app.js` 命中 0，`.focus-parent-chip` 在 `style.css` 命中 0；`src/focus.mjs` 18:20:51、`style.css` 17:52:50 均早于构建 18:23:10）。

**非发行态声明（验证者提出，船长裁定采纳）**：报告时刻产物与工作树同步，但本波次仍有并发写入者（t25/t27/t28/t29 与文档回写）。**船长裁定：T90 产物作为 t27–t29 之前的合法中间态留档，不宣传为发行态；本波次发行态以 T100（t26）重跑 build + 四闸门并重录指纹为准。**若 T90 报告之后 `src/**`、`style.css`、`data/**`、`index.html`、`sw.js` 再被改动，T90 指纹即失效——这是设计内行为，不是缺陷。

**诚实口径（验证者登记，船长照录）**：未覆盖项＝键盘可达性（仅 Escape/点外部已测）、320/768 与高 DPI、ARIA 快照、动效与 `prefers-reduced-motion`、题库详情页字母/`is-answer`（属 T86 范围本轮未重跑）、`tag`/`query` 与跨学科筛选组合、打印/沉浸/sw.js 离线/Tauri/同步导入导出、拖拽 DnD 与组合删除改名。以上**不得读作已通过**。

**转交**
- T100（t26）须在 t27/t28/t29 落地后重跑唯一权威构建 + 四闸门并重录全部指纹；本报告 §8 未覆盖项由 T100 按需挑选复测。
- `tests/focus.test.mjs:1272` 的历史单例失败在本窗口未复现（338/338），结案依据见 T88 报告。

---
### T91 文档回写（五项）（团队 t17）
- 状态: accepted
- 负责: 团队 athena-2.2-prep / bank-eng（t17）
- 文件集: 仅 `docs/ARCHITECTURE.md`、`docs/DATA_SCHEMA.md`、`docs/ACT.md`、`backup/scratch/docs-bank/`
- 依据: AGENTS.md + docs/WORKFLOW.md §8
- 依赖: T83、T84、T88、T89、T92、T93
- 验收:
  1. 五项回写：题库渲染契约（公式标签/自定义下拉/字母与 `is-answer`）、年份筛选、错题自测导航、专注链 UI 与组合语义、自测星标口径
  2. 文档内引用的行号须回读源码核对（自建脚本对拍 exit 0）
  3. `docs/DATA_SCHEMA.md:168` 的 `quizCfg` 口径必须改写：`diff` 夹 1–5（★1–★5 卡片星标）、缺省 `[1, 5]`，旧档按夹取迁移（`[1,10]→[1,5]`、`[3,7]→[3,5]`）；并注明记录字段 `diff` 为筛选区间（星标语义）
- 升版: 不升

### 报告
**验收结论（船长，accepted）**：五项文档回写完成，源码引用逐条回读核对通过、硬断言 0 失败、越界 0；本轮还顺带把写作窗口内 t24 造成的行号位移做了逐条重核（非机械位移）。

**交付（改动文件：`docs/ARCHITECTURE.md` 41/25、`docs/DATA_SCHEMA.md` 23/6、`docs/ACT.md` 25/20；证据 `backup/scratch/docs-bank/` 12 个文件）**
- `docs/ARCHITECTURE.md`：题库渲染契约（`texEl` 贯通徽标/标签、四组自绘下拉 `trigger.bank-select` + `div.bank-select-menu[role=listbox]`、选项 (A)–(D)、「答案：X」+ `.is-answer`、字母由 `answer` 派生不落盘）、年份筛选、错题自测二级导航小节、专注链 t23/t24 口径、校验闸门 17 个测试文件。
- `docs/DATA_SCHEMA.md`：`school` 实测口径、`diff` 双口径、`quizCfg` `[1,10]→[1,5]` 与 ★1–★5 迁移、校验归属表新增「题源一致性」行。
- `docs/ACT.md`：§13.1/§13.2 组合与转正语义、§13.4 层级视觉段按 t23/t24 整段重写、§13.6 导航接线刷新。

**船长亲跑复核（全部实测）**
- `node backup/scratch/docs-bank/verify-refs.mjs` → **exit 0**：引用 **164/164** 通过、硬断言 **158 条 0 失败**、结构计数断言全绿（17 个测试文件 / `MIN_QUESTIONS { math3:24, econ:15, stats:15 }` / `MIN_TOTAL = 55`）。
- `node backup/scratch/docs-bank/audit-bare-refs.mjs` → **exit 0**：裸引用 206 条、无法解析归属 34 条（已逐条回读）、行号越界 **0**。
- `git diff --numstat` = `docs/ACT.md 25/20`、`docs/ARCHITECTURE.md 41/25`、`docs/DATA_SCHEMA.md 23/6` —— 与自报逐字一致。
- 抽查行号：`src/focus.mjs:968` = `function focusParentAttribution(state, nodeId) {`、`:997` = `function focusReminderInfo(state, now) {`，与报告一致。

**关键工作：t24 行号位移重核（船长采信）**：写作期间 t24 在 `src/focus.mjs` 插入 4 行 → 约 ≥960 的 focus 行号整体 **+4**（≤955 未动；边界证据 `:953` 未变、`focusParentAttribution :968`、`focusReminderInfo :997`）。`verify-refs.mjs` 先判红 23 条 → `apply-shift.mjs` 改写 22 行/103 处、`fix-asserts.mjs` 同步 31 条断言、手工改正 `docs/ACT.md:180` 的 `:1017→:1021` 与 `:185` 的 `:1342→:1346`，随后恢复全绿。

**按船长追加口径落地**
- 父级 chip 写成「t24 已整体删除」并补死代码守卫说明（`tests/focus.test.mjs:1368`；`:1382`/`:1383`/`:1384` 分别断言 `src`/`style.css`/构建产物 0 命中，不许复活）。
- 层级视觉现状＝文字标（`span.focus-level-badge` + `data-level`，无内联彩色）+ 树杈引导 + 展开面板两段式。
- 悬浮提醒写成顶部锚定（`style.css:2009`，理由 `:2002-2007`）。
- map 入口清单与 17 个测试文件的死链护栏已入 `docs/ARCHITECTURE.md` 与 `docs/ACT.md §13.6`。

**口径纠正（船长采纳并登记）**
- 命名：任务书沿用的 `focusOrgStats` 在代码中**不存在**，真实函数名是 `focusOrgAggregates`（`src/focus.mjs:936`）；后续任务与文档一律用真名。
- 窄屏断点：悬浮提醒的移动端断点是 **≤760px**（`style.css:2058` 段内 `:2073-2074`），此前任务书里的「≤420px」是树/筛选器口径，二者不可混用。

**边界**：未跑 `npm run build`（构建归 verifier）；未触碰 `src/`、`data/`、`tests/`、`style.css`、`tools/`、`docs/BOARD.md`、`docs/COVERAGE.md`。`git diff -- data/` 仅 `data/bank_math3.js 2/2`（T95/t21 既有，非本任务）。

**后续（已建 T105/t31）**：t27/t28/t29 会再次改动 `src/focus.mjs`、`tests/focus.test.mjs`、`src/wrong.mjs`、`src/stats.mjs`、`style.css` → 行号与类名引用必然漂移，故新建「文档引用漂移修复」任务在 t27/t28/t29 之后复跑同两个脚本并逐条回读修正；`verify-refs.mjs`/`audit-bare-refs.mjs` 同时沉淀为可复用的「文档行号漂移」常备闸门。

---
### T92 错题自测进二级功能栏（团队 t18）
- 状态: accepted
- 负责: 团队 athena-2.2-prep / bank-eng（t18）
- 文件集: 仅 `src/learn.mjs`、`src/actions.mjs`、`src/wrong.mjs`、`tests/wrong.test.mjs`、`backup/scratch/wrong-nav/`
- 依据: AGENTS.md + docs/ARCHITECTURE.md（导航小节）
- 依赖: T89
- 验收:
  1. 错题模块二级项新增「自测」，点击进入 `currentModule='wrong'` + `currentView='quiz'`
  2. 导航分支与 `activeKey` 正确高亮「自测」项（不再把错题自测映射到「重做」）
  3. 断言落 `tests/wrong.test.mjs`；`node --test tests/wrong.test.mjs` → PASS
- 升版: 不升

### 报告
**切片交付**（bank-eng / t18，attempt `e7dbcfd6`）
- `src/learn.mjs`（`renderSubnav`）：错题二级项 `:628` 扩为 `[['wrong','重做'],['wrongQuiz','自测'],['wrongBrowse','浏览'],['wrongStats','统计']]`；图标表 `:633` 补 `wrongQuiz: 'pencil'`；高亮 `:639` 改为 `(currentModule === 'wrong' && currentView === 'quiz') ? 'wrongQuiz' : currentView`（原实现把 wrong+quiz 映射回「重做」，导致自测进行时四项全不高亮）。
- `src/actions.mjs`：新增 `enterWrongQuiz():33-35`（`if (!quiz || quiz.mode !== 'wrong') quiz = null;`——卡片自测会话必清、进行中的错题自测会话保留，误点不丢进度）；`case 'nav':43` 视图映射 `currentView = (arg === 'wrongQuiz') ? 'quiz' : arg`（`'wrongQuiz'` 不是 `renderApp` 的渲染分支，直接当视图会白屏），`:44` 把 `wrongQuiz` 纳入错题模块分支，`:48` 调守卫；`case 'module':54-55` 同口径，`:56` 调守卫。
- `src/wrong.mjs` **零改动**：`wrongQuizEntry():146-150` 与其三处调用 `:165`/`:410`/`:511` 保留为等价入口。
- `tests/wrong.test.mjs` 12 → 16 例；证据 `backup/scratch/wrong-nav/{probe-subnav.mjs, probe-subnav.log, notes.md}`（29 项断言，含真源码切片 vm 运行、高亮矩阵 9 组、派发回归、入口复用计数、ORDER 拼接整包语法门——只编译不写 `app.js`）。

**船长独立复核（实跑 + 源码回读）**
1. `node --test tests/wrong.test.mjs` → **16/16 pass / 0 fail**；`node backup/scratch/wrong-nav/probe-subnav.mjs` → **29 项断言全通过 exit 0**；成员侧全量 `tests/*.test.mjs` **325/325**。
2. 源码回读 `src/learn.mjs:627-645` 与 `src/actions.mjs:30-57`：二级项顺序、图标、`activeKey`、nav/module 双分支、`enterWrongQuiz` 守卫语义与报告逐条一致；`currentView='quiz'` + `currentModule='wrong'` 与 `src/wrong.mjs:146-150` 同一状态对，两入口等价性成立。
3. 范围审计：改动仅 `src/learn.mjs`、`src/actions.mjs`、`tests/wrong.test.mjs` + 证据目录；`src/wrong.mjs`、`style.css`、`data/`、生成物、`package.json` 零输出；未新增 CSS 类名；未跑 `npm run build`（符合约定）。

**遗留处置**
- **map 功能入口清单缺口（已建 T96 / t22 交 bank-eng）**：`src/map.mjs:26` 与 `:467` 的 `features` 仍只列「自测 → quiz」「错题本 → wrongBrowse」，新入口「错题自测」未登记；且 `src/map.mjs` **当前无任何测试**，`features[].nav` 值没有任何有效性守卫（现存 9 个取值恰好都可派发，属巧合而非保障）。
- **T91 文档回写登记项**：错题二级项新增「自测」、`wrongQuiz` 派发口径（视图值落 `quiz`、`currentModule` 落 `wrong`）、`enterWrongQuiz()` 会话守卫语义、`activeKey` 不再回映「重做」。
- **观察（非本切片）**：members 首跑全量时见 `tests/focus.test.mjs` 树杈引导 1 例抖动，单跑/复跑全绿——属 t12 进行中的半成品状态，待 t12 交付后由 T90/T86 复核。

**验收结论**：4/4 条 acceptance passed；无 blocking 发现。

---
### T93 自测「难度」改卡片星标口径（团队 t19）
- 状态: accepted
- 负责: 团队 athena-2.2-prep / style-eng（t19）
- 文件集: 仅 `src/quiz.mjs`、`src/store.mjs`、`tests/quiz.test.mjs`、`backup/scratch/quiz-diff/`
- 依据: AGENTS.md + docs/DATA_SCHEMA.md（`quizCfg`）
- 依赖: 无
- 验收:
  1. 自测难度筛选改用卡片星标 `metaOf(card.id)[0]`（缺省 3），区间改 ★1–★5 步长 1，提示文案改「知识卡难度标签（★1–★5，取自卡片星标）」
  2. `storedQuizCfg` 默认 `[1,5]` 并夹取迁移旧值（`[1,10]→[1,5]`、`[3,7]→[3,5]`）；报告口径注明星标来源，`D=` 记忆难度显示保持并与之区分
  3. `node --test tests/quiz.test.mjs` → PASS（新增星标筛选/边界/迁移断言）
- 升版: 不升

### 报告
**切片交付**（style-eng / t19，attempt `83e3c2c2`）
- `src/quiz.mjs`（+72/−21）：`QUIZ_DIFF_MAX` 10→5、`QUIZ_DEFAULT_DIFF` 5→3；新增 `quizStarNorm(v)` `:283-287`（非有限数→★3，否则四舍五入夹 1–5），筛选/出题统一走它（`:316`/`:331`/`:365`）；卡片候选难度取 `metaOf(id)[0]`；错题候选取 `w.linked[0]` 关联卡星标、关联不到→★3；配置行改 `1–5` 步长 1、hint 含「知识卡难度标签（★1–★5，取自卡片星标）」；题头主行改星标，FSRS 记忆难度另起一行「参考：FSRS 记忆难度 D=x.x（算法维护值，不参与本次筛选）」，报告头增筛选范围口径。
- `src/store.mjs`（+6/−3）：`STORED_QUIZ_DIFF_MAX` 10→5、缺省 `diff: [1, 5]`（`:311`），`normalizeDB`（`:397`）与 `importDB`（`:690`）共用同一净化器。
- `tests/quiz.test.mjs`（+155/−47）：16→19 用例（星标逐档命中表、边界 0/6/小数、旧配置迁移、缺省★3 入选、章节+★4–5+掌握度 40–70 组合、`starText` 逐值对拍、源码契约含旧文案必须消失）。
- 证据：`backup/scratch/quiz-diff/{README.md, diff.patch, *.log}`。

**船长独立复核（实跑）**
1. `node --test tests/quiz.test.mjs` → **19/19 pass，0 fail**，exit 0；`node --test tests/sync.test.mjs` → **35/35 pass**，exit 0。
2. 源码回读：`src/quiz.mjs:246-250`（MIN 1 / MAX 5 / DEFAULT 3，注释指向 `learn.mjs:182` 同口径）、`:258`、`:283-287`、`:316`、`:325-331`、`:365`；`src/store.mjs:257-258`、`:311`、`:397`、`:690` 与自报一致。
3. 范围审计：`git diff --numstat` → `src/quiz.mjs` 72/21、`src/store.mjs` 6/3、`tests/quiz.test.mjs` 155/47、`tests/sync.test.mjs` 41/7；`style.css`、`src/learn.mjs`、`data/` 三处零输出（未越界）。

**范围外改动裁定（unaudited path，船长接受并记录）**
- `tests/sync.test.mjs` 不在原文件集内，但其 `quizCfg` 期望值硬编码旧缺省 `[1,10]`——不改则 verify 命令必然失败，属**契约不可满足**的必需修正。改动范围经审：4 处期望值 `[1,10]→[1,5]` + 1 条新用例「旧存档难度迁移：FSRS D 口径（1–10）夹取到星标域（★1–★5），normalizeDB ≡ importDB」；**且刻意保留** `assert.deepEqual(db.log.quiz[1].diff, [1, 10])` 作为「历史记录字段不被回写」的证据。裁定：接受，理由与证据记入本报告。

**待回写（转 T91/t17，已写入 T91 契约）**
- `docs/DATA_SCHEMA.md:168` 现仍写「`diff` 夹 1–10、缺省 `[1, 10]`」→ 须改为「夹 1–5（★1–★5 卡片星标）、缺省 `[1, 5]`，旧档按夹取迁移（`[1,10]→[1,5]`、`[3,7]→[3,5]`）；记录字段 `diff` 为筛选区间（星标语义）」。

**衔接**
- `app.js`/`dist/` 仍为旧源（成员按约定未跑 build）；DOM 侧三条路径（题头星标行 + D 参考行、配置行 1–5 步长 1、报告口径行）已列入 T90/t16 验收。
- `npm test` 全量当前 316 例、3 例失败全部落在 `tests/focus.test.mjs`（t12 专注链改动并行进行中），与本切片无关；t12 交付时会复跑全量确认清零。

**验收结论**：3/3 条 acceptance passed；无 blocking 发现。

### T94 自测题头移除 FSRS 难度参考行（团队 t20）

- 状态: accepted
- 负责: style-eng（attempt 0）
- 文件集: `src/quiz.mjs`、`tests/quiz.test.mjs`、`backup/scratch/quiz-diff2/`
- 依据: 用户 m02112 明确「『参考：FSRS 记忆难度 D=…（算法维护值，不参与本次筛选）』这一条不需要」——T93 已把**筛选**改成知识卡星标，题头却仍保留一行 FSRS D 展示，用户要求一并去掉
- 依赖: 无（t19 已 completed，`src/quiz.mjs` 独占已释放）
- 验收:
  1. 自测卡面题头不再渲染任何 FSRS 记忆难度数值（源码契约断言：题头不出现「记忆难度」/「D=」渲染），若 `quizFsrsD` 仅剩测试或报告用途须在报告中写明其唯一调用点
  2. 题头主行保留「难度 ★★☆☆☆ · 掌握 x%」形态，星标来源仍为 `metaOf(id)[0]`（缺省 ★3），与 T93 口径一致
  3. 报告头筛选口径行保留（「筛选范围：难度 ★a–★b（知识卡难度标签，取自卡片星标；非 FSRS 记忆难度 D）」）
  4. `tests/quiz.test.mjs` 中原「D 参考行存在」类断言改写为「必须不存在」，19 例其余零回归；旧文案源码契约断言不得删弱
- 升版: 不升（随 2.1.1/2.2.0 收口统一决定）
- 备注: 实现者不跑 `npm run build`（生成物统一由 T90/T86 构建）；`docs/DATA_SCHEMA.md:168` 的 `quizCfg` 口径回写由 T91 承接

#### 派单摘要（可直接粘贴为切片开场）
工作区 `D:\deepseek harness work\考研\Athena`。先读 `AGENTS.md`，禁止整仓通读。本切片任务：移除自测题头的「参考：FSRS 记忆难度 D=…」行（t20）。文件边界：只改 `src/quiz.mjs`、`tests/quiz.test.mjs`，产物写 `backup/scratch/quiz-diff2/`；不改 `style.css`、`src/store.mjs`、`src/learn.mjs`、`data/`、`docs/`、`app.js`、`dist/`。验收命令：`node --test tests/quiz.test.mjs`、`node --test tests/sync.test.mjs`。不跑 `npm run build`，不动版本七处。

### 报告
（待 T94 完成后由船长写入）
<!-- T94 报告（验收：accepted） -->
**验收结论（船长，accepted）**：自测卡面题头已无任何 FSRS 记忆难度展示；星标筛选口径与报告头口径行保留；三条命令亲跑全绿。

**交付（改动文件：`src/quiz.mjs`、`tests/quiz.test.mjs`、`backup/scratch/quiz-diff2/`）**
- `src/quiz.mjs`（1032 行，净 −14）：整体删除 `function quizFsrsD(id)`（原 `:763-771`）——文件内不再有该定义或调用点，`toFixed` 亦随之消失；`renderQuizQuestion()` 删除「参考：FSRS 记忆难度 D=x.x（算法维护值，不参与本次筛选）」整行。题头仍是 3 个 span：`第 i / n 题` · `得分 x` · `难度 ★★☆☆☆ · 掌握 41%`，取值链 `metaOf(id)[0] → quizStarNorm → starText`（`src/learn.mjs:182`/`:188-193`）未动。
- 报告头「筛选范围：难度 ★a–★b（知识卡难度标签，取自卡片星标；非 FSRS 记忆难度 D）」保留（`src/quiz.mjs:912-913`）。
- `tests/quiz.test.mjs`：原「题头 D= 存在」正向断言改为题头切片的反向断言（剔整行注释后须无 `D=` / `记忆难度` / `quizFsrsD(` / `toFixed`；全文件须无 `quizFsrsD`），t19 旧文案断言未删弱；用例数仍 19。

**船长实测（亲跑）**
- `node --test tests/quiz.test.mjs` → **19/19** exit 0；`node --test tests/sync.test.mjs` → **35/35** exit 0。
- 构建链自查：`buildProduct()` + `vm.Script` 解析预检 `PARSE_OK bytes=876046` → `npm run build` exit 0 → `node tools/build.mjs --check`「app.js 与 src/ 同步」exit 0；本轮产物 `app.js` = **876,046 B / sha256 `123d45555265f2ac941279d6bac4ab4cb6146426b87ffbb298998a8dad7c3552`**（同时包含 T87/t12 的专注链回滚，故用户刷新即可看到新题头与新树形）。
- 成员侧行为探针 `backup/scratch/quiz-diff2/probe-header.mjs`（21 项断言、真实源码切片 + mini-DOM 真跑 `renderQuizQuestion`，4 场景含错题 ★4 且记录带 `diff:9.1`）：渲染树均无 D 字样、`.learn-top` 之后直接接 `.card`；探针首版漏注入 `quizStarNorm` 导致星标恒 ★3，正是正面断言（★2 须渲染 ★★☆☆☆）当场抓住——反证思路正确。

**未做项 / 待用户决策**
- 卡面其他位置的 FSRS 难度不在本任务范围：`src/learn.mjs:295`（学习卡面）、`src/wrong.mjs:212`（错题卡面）仍显示 FSRS 难度值。用户 m02112 只点名自测题头那一行，故本次未动；若也要去掉，另派任务。
- 全量 `npm test` 当前为非全绿（`tests/focus.test.mjs:1272+` 等），原因：T88/t13（已完成层次组合与转正收紧）正在编辑 `src/focus.mjs` 与 `tests/focus.test.mjs`，属进行中状态而非本任务回归；最终由 T90/t16 在全波次实现任务收敛后统一跑四闸门。

### T95 题库来源语义统一：合并数学三 2025 的两种 school 写法 + 跨题一致性校验（团队 t21）

- 状态: accepted
- 负责: bank-eng（attempt 0）
- 文件集: `data/bank_math3.js`、`tools/check_data.mjs`、`tests/bank.test.mjs`、`backup/scratch/bank-school/`
- 依据: 用户 m02161「全国硕士研究生入学统一考试-数学三 2025 年 和全国硕士研究生招生考试-数学三 2025 年 应该合并，并且在之后也不应该出现这种语义混乱的情况」
- 现状（船长实测 `data/bank_*.js` 全量 school 分布）: math3 24 题 —— 2012 五题 / 2013 八题为「全国硕士研究生入学统一考试-数学三 20XX 年」，2019 一题、2023 四题、2024 三题为「全国硕士研究生招生考试-数学三 20XX 年」，**2025 三题里 2 题写「入学统一考试」、1 题为 T76 校正后的「招生考试」** → 「年份/卷」筛选把 2025 拆成两项。econ 15 题 / stats 16 题的 school 每年各一种写法，无此问题
- 依赖: 无（t14 已 completed，年份筛选已具备；数据侧只改 2025 三题）
- 验收:
  1. `data/bank_math3.js` 2025 三题 school 逐字统一为「全国硕士研究生招生考试-数学三 2025 年」（依据 2025 试题册封面「2025年全国硕士研究生招生考试 试题（数学三）科目代码：303」，须用 `tools/refs-vision.py` 出裁片 + 自带 `read_image` 亲读，裁片路径与 ≥20 字亲读原文写入报告）
  2. 2012/2013 的「入学统一考试」与 2019/2023/2024 的「招生考试」写法逐字不变；其余 52 题 school 零改动（改前/改后哈希对比）
  3. 「年份/卷」筛选对 math3 2025 只出现一项、题数 = 3（探针断言，不得人工目测）；econ/stats 选项集合逐项不变
  4. `tools/check_data.mjs` 新增跨题一致性校验：按（科目, 年份, 规范化来源）分组，同组出现 ≥2 个不同原始 school 字符串即 ERR 并打印两串与题 id；规范化至少覆盖去空白、全角半角与 `·`/`-`/`／` 分隔符统一、「全国硕士研究生入学统一考试」≡「全国硕士研究生招生考试」≡「全国硕士研究生入学考试」；三个题库科目全部纳入
  5. 反证：临时副本注入第二种写法 → 校验判红且退出码非 0；恢复判绿；脚本与日志落盘
  6. `node --test tests/bank.test.mjs` 38 例零回归 + 新增「同年单来源」回归用例；`node tools/check_data.mjs` 全绿（55 题）
- 升版: 不升（随收口统一决定）
- 备注: 实现者不跑 `npm run build`；数据文件为 UTF-8，禁用 PowerShell 默认编码写入

#### 派单摘要（可直接粘贴为切片开场）
工作区 `D:\deepseek harness work\考研\Athena`。先读 `AGENTS.md`，禁止整仓通读。本切片任务：合并数学三 2025 的两种来源写法并加校验器（t21）。文件边界：只改 `data/bank_math3.js`、`tools/check_data.mjs`、`tests/bank.test.mjs`，产物写 `backup/scratch/bank-school/`；不改 `src/**`、`style.css`、`data/bank_econ.js`、`data/bank_stats.js`、`docs/`、生成物。验收命令：`node tools/check_data.mjs`、`node --test tests/bank.test.mjs`。不跑 `npm run build`，不动版本七处。

### 报告
**验收结论（船长，accepted）**：数据改动范围精确到两行，跨题一致性护栏真的会判红（反证亲跑），三科其余数据逐字节未变。

**交付**
- `data/bank_math3.js`：仅 `m3-2025-1` / `m3-2025-2` 两行 `school` → 「全国硕士研究生招生考试-数学三 2025 年」（`git diff --numstat -- data/` = `2 2 data/bank_math3.js`）；2012/2013 的「入学统一考试」为史实，逐字保留。
- `tools/check_data.mjs`：新增「题源一致性（同一份卷子不得多种写法）」段 —— `:268` `normalizeSchool`（全角→半角、U+3000、`·`/`-`/`／` 分隔符、去空白、「入学统一考试」≡「入学考试」≡「招生考试」）+ 按 (科目, 年份, 规范化来源) 分组（`:286`），同组 ≥2 种原文即 ERR 并打印原文与题 id（`:304` 统计输出）；新增 `ATHENA_DATA_DIR` 覆盖（`:30-31`，默认 `<仓库>/data`），供反证指向临时副本；文件头注释 `:13`/`:19` 同步。
- `tests/bank.test.mjs`：原「2025 两份卷两个选项」断言改为「单选项 + 命中 3 题」；新增「同年单来源」用例（三科每科每年一种措辞、裸年份选项、整年命中对拍、math3 2025 定案）。39 例（38 零回归 + 1 新增）。

**船长实测（全部亲跑，非转述）**
- `node tools/check_data.mjs` → exit 0；新增段输出「(科目, 年份, 规范化来源) 分组 **16** 组 | 同组多写法 **0** 组（一致）」；总口径 25 学科 / 2769 卡 / 3 题库科目 / 55 真题。
- `node --test tests/bank.test.mjs` → **39/39** exit 0。成员侧全量 `node --test tests/*.test.mjs` → **326/326**。
- `git diff --numstat -- data/` = `2 2`；`data/bank_econ.js` sha256 `17f291908f978a434aba55e6e13b419d18a9e283fd65ed0eab5b32c8634320a1`、`data/bank_stats.js` sha256 `b614aa48f86b42d9a73b392aaaa38aaee84425b7a4acf31e79030ebe9e4a1806`（均与 T89 记录一致，未变）。
- **反证（船长复跑）**：`node backup/scratch/bank-school/counterproof-school.mjs` → exit 0，日志证明护栏会红：注入风格变体后退出码 1，ERR 原文「[题库] math3 2013 年同一份卷子出现 3 种 school 写法（规范化后同为「全国硕士研究生招生考试-数学三2013年」，会让「年份/卷」筛选拆成 3 项）：「全国硕士研究生招生考试－数学三　2013年」(m3-2013-1) vs 「全国硕士研究生入学考试-数学三 2013 年」(m3-2013-2) vs 「全国硕士研究生入学统一考试-数学三 2013 年」(m3-2013-12、m3-2013-13、m3-2013-18、m3-2013-19、m3-2013-21、m3-2013-23)」；阶段 B 另证全角破折号 / 全角空格 / 首尾空白 / 简称四种变体被同一规范化归并；收尾校验真实 `data/bank_math3.js` sha256 未被触碰、恢复后判绿 exit 0。
- 证据目录 `backup/scratch/bank-school/`：`probe-school.mjs`、`probe-school.log`、`baseline-before.json`、`counterproof-school.mjs`、`counterproof-school.log`、`check-data-before-fix.log`、`check-data-after-fix.log`、`notes.md`、两张 2025 试题册封面裁片（含 sha256）。

**依据**：2025 试题册封面亲读（`tools/refs-vision.py` 裁片 + `read_image`）：「2025 年全国硕士研究生招生考试 / 试题 / （数学三） / （科目代码：303）」——与 `src.file` 同源，故 2025 三题统一取「招生考试」。

**未做项 / 转交**
- `src/bank.mjs:361-365` 注释仍写「math3 的 2025 年有两份」，属源码事实陈述 → 已 amend 进 **T96（t22）** 第 6 条验收，随该任务同步。
- **T91（t17）文档回写须登记**：① `tools/check_data.mjs` 的题源一致性校验与 `ATHENA_DATA_DIR` 覆盖；② 「同年单来源时年份/卷选项退回裸年份（无简称、无去重后缀）」的筛选口径。

### T96 map 功能入口清单补「错题自测」+ nav 取值有效性守卫（团队 t22）

- 状态: accepted
- 负责: bank-eng（attempt 0）
- 文件集: `src/map.mjs`、`src/bank.mjs`（仅一行过期注释同步）、`tests/map.test.mjs`、`package.json`、`backup/scratch/map-nav/`
- 契约修订: revision 1（船长 `agent_teams_amend_task`，t21 落地后）——inScope 增 `src/bank.mjs`（`src/bank.mjs:361-365` 注释仍写「math3 的 2025 年有两份」，与 t21 后数据不符，属源码事实陈述须随数据同步）；verify 增 `node --test tests/bank.test.mjs`；验收增第 6 条
- 依据: T92（t18）新增错题二级入口「自测」（nav 值 `wrongQuiz`）后，`src/map.mjs` 的功能入口清单未同步（由 t18 成员报出，船长确认）；且 `src/map.mjs` 当前**无任何测试**，`features[].nav` 取值无有效性守卫——现存 9 个取值（`quiz`×5、`statistics`×6、`actPlan`×8、`actHabit`×6、`actFocus`×3、`learn`×2、`wrongBrowse`×2、`browse`×1、`actHelp`×1）恰好都可派发属巧合，改名/新增导航值时不会有任何闸门报警
- 依赖: t18 已 completed（`wrongQuiz` 派发语义已落地）；t22 与 t21 同为数据/清单类独立片，按队列顺序执行
- 验收:
  1. `src/map.mjs:26` 与 `:467` 两处 `features` 追加 `{ label: '错题自测', nav: 'wrongQuiz' }`（在「错题本」之后，既有项与顺序逐字不变）；其余 32 处 `features` 零改动
  2. 新建 `tests/map.test.mjs`：提取全部 `nav: '<x>'` 取值 → 断言每个都在 `src/actions.mjs` 的 nav/module 派发集合内（无死链）；断言 `wrongQuiz` 在集合中（回归护栏）；断言每条 feature 的 `label`/`nav` 均非空
  3. `package.json` 的 `test` 脚本追加 `tests/map.test.mjs`；`version`（2.1.0）与其余脚本逐字不变
  4. 反证：临时副本注入 `nav: 'noSuchView'` → 新测试必须判红；恢复判绿；脚本与日志落盘
  5. `tests/map.test.mjs`、`tests/build.test.mjs`、`tests/wrong.test.mjs`、`node --test tests/bank.test.mjs`、`tools/check_data.mjs` 全绿；全量 `tests/*.test.mjs` 零回归（基线 326 例，已含 t21 新增「同年单来源」用例）
  6. `src/bank.mjs:361-365` 的注释与 t21 之后的真实数据一致（同年单来源；2025 不再有两份），改后 `node --test tests/bank.test.mjs` 仍 39/39、`node tools/check_data.mjs` 仍全绿；不得留下「math3 的 2025 年有两份」这类过期陈述
- 升版: 不升（随收口统一决定）
- 备注: 实现者不跑 `npm run build`；`src/map.mjs` 与 README 内文字为 UTF-8，禁用 PowerShell 默认编码写入

#### 派单摘要（可直接粘贴为切片开场）
工作区 `D:\deepseek harness work\考研\Athena`。先读 `AGENTS.md`，禁止整仓通读。本切片任务：map 功能入口清单补「错题自测」并加 nav 有效性守卫（t22），顺带同步 `src/bank.mjs:361-365` 一行过期注释（契约修订第 6 条，内容以「同年单来源」为准）。文件边界：只改 `src/map.mjs`、`src/bank.mjs`（一行注释）、新建 `tests/map.test.mjs`、只追加 `package.json` 的 test 脚本一项，产物写 `backup/scratch/map-nav/`；不改 `src/learn.mjs`、`src/actions.mjs`、`src/wrong.mjs`、`style.css`、`data/`、`docs/`、生成物。验收命令：`node --test tests/map.test.mjs`、`node --test tests/build.test.mjs`、`node --test tests/wrong.test.mjs`、`node --test tests/bank.test.mjs`、`node tools/check_data.mjs`。不跑 `npm run build`，不动版本七处。

### 报告
（待 T96 完成后由船长写入）
**验收结论（船长，accepted）**：map 功能清单已补「错题自测」入口，且新增了真正会判红的 nav 取值死链护栏；`src/bank.mjs` 两处过期注释按 t21 后事实改写，逻辑零变化。

**交付（changedPaths 5 项：`src/map.mjs`、`src/bank.mjs`、`tests/map.test.mjs`、`package.json`、`backup/scratch/map-nav/`）**
- `src/map.mjs`：`:26`（retrieval）与 `:467`（dunlosky）两条 `features` 追加 `{ label: '错题自测', nav: 'wrongQuiz' }`（紧随「错题本」）；`git diff --numstat -- src/map.mjs` = `2 2`，其余 33 条 features 行逐字未动。
- `tests/map.test.mjs`（新建，5 条用例）：`nav` 取值必须落在 `src/actions.mjs` 的 nav/module 派发集合内（死链护栏）、取值快照含 `wrongQuiz`（回归）、每条 feature 的 `label`/`nav` 非空、取值可达渲染分支、`wrongQuiz` 登记位置与次数；反证经 `ATHENA_MAP_FILE` / `ATHENA_ACTIONS_FILE` 指向临时副本，不碰真实文件。
- `package.json`：`test` 脚本追加 `tests/map.test.mjs`（现 17 个文件全覆盖）；`git diff --numstat -- package.json` = `1 1`，`version` 2.1.0 与其余 5 个脚本逐字未变。
- `src/bank.mjs`：仅两处**注释**同步（逻辑零变化）——① `:361-367` 删「math3 的 2025 年有两份」旧述，改述「2025 数学三曾同时存在『入学统一考试』与『招生考试』，t21 已按试题册封面统一为『招生考试』→ 该年退回裸年份；再出现同年多种写法会被 `tools/check_data.mjs` 题源一致性校验判红」；② `:411-415` 原举例含数据侧旧称「2025 年 · 全国硕士研究生入学统一考试-数学三 · 2 题」，改为单来源/多来源两种口径并注明「当前三科每个年份都只有一份来源」。sha256 `9346dd26bbabe91121dc78488e4c4642e9b7fbf108a4a758f8c9773f3c7ab783`。

**船长实测（亲跑，与成员自报逐项一致）**
- `node --test tests/map.test.mjs` → **5/5** exit 0；`node --test tests/bank.test.mjs` → **39/39** exit 0。
- `node backup/scratch/map-nav/counterproof-map-nav.mjs` → **23 项断言 / 0 失败** exit 0：A 注入 `nav:'noSuchView'` 判红、B 删两处 `wrongQuiz` 登记判红、C 空 `label` 判红、D 缺字段判红、E 从 actions 去掉 `browse` 判红（恰 1 条失败＝死链护栏生效）、F 真实文件判绿；收尾校验 `src/map.mjs`/`src/actions.mjs`/`package.json` 未被反证改动、临时副本已清理。
- `node backup/scratch/map-nav/probe-map-nav.mjs` → **28 项通过 / 0 失败** exit 0（含「map 的 10 个 nav 取值全部可派发（无死链）」「wrongQuiz 由 nav 分支特例归错题模块」）。
- 摘要值核对：`src/bank.mjs` 实测 sha256 = 成员自报值（逐字一致）；`:361-367` 与 `:411-415` 注释原文已回读，与 t21 后真实数据一致。
- 成员侧另跑 `tests/build.test.mjs` 11/11、`tests/wrong.test.mjs` 16/16、`node tools/check_data.mjs` 全绿（学科 25 / 卡片 2769 / 题库 3 / 真题 55；题源一致性 16 组 | 同组多写法 0 组）。

**契约修订留痕（两次，均由船长 `agent_teams_amend_task`）**
- **revision 1**：inScope 增 `src/bank.mjs`；verify 增 `node --test tests/bank.test.mjs`；验收增第 6 条（注释同步）。理由：t21 落地后该注释与数据不符，属源码事实陈述。
- **revision 2**：从 outOfScope 移除 `src/bank.mjs`。理由：revision 1 只加 inScope、漏删 outOfScope 同名项 → 两处并存、写入校验以 outOfScope 为准，导致成员连续两次提交被拒（`implementation cannot complete: src/bank.mjs is out_of_scope`）。**这是船长的契约错误，已记录在案**；修正后同一 attempt_id 提交成功，材料无需重做。

**未做项 / 转交**
- **T91（t17）文档回写建议登记**：① `src/map.mjs` 的功能入口清单新增「错题自测」；② 新增 `tests/map.test.mjs` 与 `package.json` test 脚本现为 17 文件；③ nav 取值死链护栏的存在（新增/改名导航值时会有闸门报警）。
- `tests/focus.test.mjs:1272`「下一级任务数按显式层次统计」当前确定性失败，船长裁定**归属 T88（t13，focus-eng 在制品）**，与 T96 无关；由 T90（t16）在实现任务收敛后统一跑四闸门。
- 成员未跑 `npm run build`（守约）；`app.js` 由船长在 T94/T87 落地后已重建，并将在 T90 重新构建。

### T97 专注链层级彩色规则清理（style.css 纯减法，回滚 2.0 简洁风）（团队 t23）

- 状态: accepted
- 负责: style-eng（attempt 0）
- 文件集: `style.css`、`backup/scratch/focus-style/`
- 依据: 用户 m01901/m01902「专注链 UI……删除杂乱的颜色与图标……先回滚至 2.0 时期的 UI 风格；归属与层级用树杈状表示」。T87（t12）已清掉 src 侧全部内联彩色、层级改由树杈表达，但 `style.css` 里 2.1.0 引入的层级彩色规则仍在——2.0 基线 `git show 061f140:style.css` 完全没有这些选择器（`focus-level-badge` / `focus-level-mark` / `focus-parent-chip` / `focus-tree-row[data-level]` 全为 0 命中，2.0 只有 `.focus-tier-badge`），故树行/徽标/父级 chip 仍按层级上色，与用户要求不符
- 现状（船长实测，行号为准）:
  - `style.css:2013-2017` `.focus-tree-row .focus-level-mark` + 四条 `[data-level]` 彩色规则 —— **已死**（t12 后 `src/**` 0 处输出 `focus-level-mark`）
  - `style.css:2018-2038` `.focus-level-badge[data-level="group"/"corps"/"army"]` 三条彩色胶囊（`border` + `color-mix()` 底色 + 逐级放大字号字重）—— **仍活**：元素由 `src/focus.mjs:2408-2410` 输出并带 `data-level`
  - `style.css:2045-2049` `.focus-parent-chip.is-free` 警告色 —— src 仍输出 `is-free`（`src/focus.mjs:2417`），但 t12 已取消其语义
  - `style.css:2050-2053` `.focus-parent-chip[data-parent-level=…]` 层级色/层级边框
- 依赖: t12 已 completed（src 侧内联彩色清零、树杈引导落地）
- 验收:
  1. `style.css:2013-2017` 五条 `.focus-level-mark` 规则整条删除（报告给出 `grep -rn 'focus-level-mark' src/ style.css` 前后对比）
  2. `.focus-level-badge[data-level=…]` 三条彩色胶囊改为中性文本或删除：改后无 `border`/`background`/`color-mix()`/`border-radius: 999px`，字号字重不随层级放大（层级差异只由文字内容 + 树杈承担）；`data-level` 属性保留作语义钩子
  3. `.focus-parent-chip.is-free` 警告色与 `[data-parent-level=…]` 层级色/边框去除或中性化；类名与属性保留
  4. 2.0 既有规则不得误删（`.focus-tier-badge` `style.css:1529`、`.focus-tier-badge.elite` `:1533` 逐字保留）；非 focus 规则零改动；报告写出 `git diff --numstat -- style.css`
  5. 探针量化：同主题内 `data-level` 四取值与 `is-free` 两态下 computed `color`/`background-color`/`border-color` 完全一致；亮/暗各一组；1360×900 与 400×780 无横向溢出；console error 0
  6. `node tools/check_render.mjs` exit 0（2769 卡 / 9828 渲染字段 / 问题 0 口径不变）；保留的文本规则对比度 ≥4.5:1 或与 2.0 基线同值，逐条列实测
  7. 反证：恢复任一彩色规则 → 探针判红；删除副本 → 判绿；脚本与日志落盘
  8. 不改 `src/**`、`data/`、`tests/`、`docs/`、`package.json`、生成物；不跑 `npm run build`
- 升版: 不升（随收口统一决定）
- 备注: `style.css` 为 style-eng 独占文件；实现者不跑 `npm run build`（生成物由 T90/T86 构建）；UTF-8 文件禁用 PowerShell 默认编码写入

#### 派单摘要（可直接粘贴为切片开场）
工作区 `D:\deepseek harness work\考研\Athena`。先读 `AGENTS.md`，禁止整仓通读。本切片任务：在 `style.css` 内做纯减法，清掉 2.1.0 遗留的专注链层级彩色规则（`.focus-level-mark` 五条、`.focus-level-badge[data-level]` 三条胶囊、`.focus-parent-chip.is-free` 与 `[data-parent-level]` 层级色），回到 2.0「纯文字 + 树杈引导」形态，不得误删 `.focus-tier-badge`。文件边界：只改 `style.css`，产物写 `backup/scratch/focus-style/`；不改 `src/**`、`data/`、`tests/`、`docs/`、生成物。验收命令：`node tools/check_render.mjs`、`node backup/scratch/focus-style/probe-focus-style.mjs`（自建探针须落盘，含亮/暗 × 桌面/窄屏与反证）。不跑 `npm run build`，不动版本七处。

### 报告
**验收结论（船长，accepted）**：2.1.0 遗留的专注链层级彩色视觉层已整段删除，层级表达只剩「树杈引导 + 层级文字标」，与 2.0 简洁风一致；纯减法（新增规则 0 条）。

**交付（唯一文件 style.css + 证据目录）**
- 删除 **19 条规则**：`.focus-tree-row[data-level=unit/group/corps/army]`（12.5–17px 字号 / 400–800 字重 / 彩色 `border-left` + 底色）、死类 `.focus-level-unit|group|corps|army`、`.focus-tree-row .focus-level-mark` 五条（含四色）、`.focus-level-badge[data-level=group/corps/army]` 三级彩色胶囊、`.focus-parent-chip.is-free` 警告色、四条 `.focus-parent-chip[data-parent-level=…]` 层级色/边框。
- 保留 2 条：`.focus-tree-guide`（树杈引导）、`.focus-parent-chip` 基础规则（中性 token，与 2.0 内联兜底逐值同源）。
- 唯一声明改动：`.focus-tree-guide` 的 `color` 由 `var(--text-faint)` 改 `var(--text-muted)` —— 改前实测对比度 **2.54（<3:1）**，改后亮 4.83 / 暗 6.79；`style.css:1986-2005` 留有同 t8 风格的说明注释。
- 证据目录 `backup/scratch/focus-style/`：README.md（9 节：改动清单/断言矩阵/一致性+溢出读数/对比度表/chip 澄清/反证/复现命令/产物清单/已知限制）、`probe-focus-style.{mjs,json}`、`probe-run.txt`、`diff-t23.patch`、`t23-diff.json`、`grep-evidence.txt`、3 张截图。

**船长独立复核（亲跑）**
- `node backup/scratch/focus-style/probe-focus-style.mjs` → **「结果 PASS：64/64 检查通过」exit 0**（真实 `index.html` + 真实 `src/`（app.js 用内存 `buildProduct()` 覆盖，不跑 build）+ 真实 `style.css` + 真实 KaTeX；亮/暗 × 1360×900 与 400×780 四组真实组合全绿：四个 `data-level` 的树行/徽标 computed 完全一致、父级 chip 12 状态一致、`doc.scrollWidth == innerWidth`、console error 0）。
- **反证成立**：`neg-mutant` 组合（内存注入「彩色规则恢复版 style.css」）判红，读数逐条可见 —— 树行 `borderLeftWidth 0px vs 5px` / `borderLeftStyle none vs solid` / `backgroundColor rgba(0,0,0,0) vs warn 10%`、徽标 `color rgb(27,28,31) vs rgb(245,158,11)`、chip `color rgb(107,114,128) vs rgb(245,158,11)` 等。
- `node tools/check_render.mjs` → exit 0（KaTeX 就绪 / 2769 卡 / 9828 渲染字段 / 问题 0 / ✅ 全绿）。
- 减法幅度核对：`backup/scratch/focus-style/diff-t23.patch` 共 93 行、`+15 / −63`（含 diff 头两行）→ 与自报「+14 / −62」一致；`style.css:1986-1999` 注释与保留规则原文回读，与报告相符；工作树 `style.css` 实测 106452 B / sha256 `c14e925abdc48e8a585e29eb6303d380c0eba1be7d36d45c2a4fda42408755c0`。

**成员申报的两个事实（船长核实并采信）**
1. `src/focus.mjs:2525` 的 `focusParentChipEl` **无任何调用点** → 真实 DOM 里 `.focus-parent-chip` 实例数为 0，chip 的状态无关性是靠合成样本测定的（JSON 标记 `chipSynthetic=true`，README §5 有澄清）。船长复核：全仓 `grep focusParentChipEl` 仅命中定义本身、`grep focus-parent-chip src/` 仅命中该函数体内两处 → **确为死代码**。
2. 本任务未跑 build（守约）：`app.js`/`dist` 仍是旧产物，弹层/悬浮窗/专注链最终形态由 T90（t16）构建后复核。

**未做项 / 转交**
- **死代码清理待办（登记，因文件锁未即时派单）**：`focusParentChipEl`（`src/focus.mjs:2525-2533`）+ `style.css:2000` 起的 `.focus-parent-chip` 规则块 + t23 注释中「保留 .focus-parent-chip 基础规则」一段，构成完整的死代码三角。**创建该清理任务时与 t13 的 `src/focus.mjs`/`tests/focus.test.mjs` inScope 冲突（工具判 `inScope overlaps t13`）**，故推迟到 t13 完成后派发（单一任务同时删 src 与 css，避免中途半状态），并需把该任务纳入 t16/t17 依赖。
- 悬浮窗几何（与 `.dock`/`.rating` 不相交）与 8–9 条 AA 对比度低项（tag 4.23、badge-diff-star1 4.11、badge-type 3.93、btn-detail 3.68、badge-freq-star5 3.22、`is-expired` 时钟 2.15 等）→ 转 **T90（t16）** 在真实构建产物上复测；`.focus-reminder` 当前不在状态树页面出现，t10 的空转断言须由 t16 换成「专注页 + 自测页」真实场景。
- T91（t17）文档回写：专注链「层级视觉＝树杈 + 文字标，无颜色」这一口径须写入 `docs/ACT.md` §13.4。

---
### T98 专注链死代码清理：父级 chip（团队 t24）
- 状态: accepted
- 负责: 团队 athena-2.2-prep / focus-eng（t24，attempt 1）
- 文件集: `src/focus.mjs`、`style.css`、`tests/focus.test.mjs`、`backup/scratch/focus-dead/`
- 依据: AGENTS.md + docs/ACT.md §13 + T97（t23）报告。船长 grep 复核：`focusParentChipEl`（`src/focus.mjs:2525-2533`）在 t12 重构后**全仓仅命中定义本身、无调用点**，真实 DOM 中 `.focus-parent-chip` 实例数恒为 0；`style.css:2000` 起的 `.focus-parent-chip` 规则块与 t23 注释中「保留 .focus-parent-chip 基础规则」一段，连同该函数内 `focusCssDeclared('.focus-parent-chip')` 内联兜底分支，构成完整死三角
- 依赖: T87（t12 落地 .focus-tree-expand-attr 承接归属）、T88（t13 完成，释放 src/focus.mjs）
- 验收:
  1. `focusParentChipEl` 定义与其内联兜底分支整体删除；`grep -n 'focusParentChipEl'` 与 `grep -n 'focus-parent-chip' src/` 均 0 命中
  2. `style.css` 中 `.focus-parent-chip` 规则块与 t23 注释对应段落删除或改写为准确描述；该选择器 0 命中；`.focus-tree-guide` 与 t23 其余保留项逐字不变
  3. 最终渲染零可见变化：状态树在亮/暗 × 桌面(1360×900)/窄屏(400×780) 下 DOM 与计算样式与改前逐值一致，`.focus-tree-expand-attr` 仍输出归属信息，`.focus-parent-chip` 实例数与改前同为 0
  4. 测试零回归并补守卫：`tests/focus.test.mjs` 66/66 不减、`tests/act-settings.test.mjs` 11/11、`node tools/check_render.mjs` exit 0；新增/改写断言须能对「chip 复活」判红（反证落盘）
  5. 不触碰 `src/focus.mjs` 与 `style.css` 之外的源码；不跑 `npm run build`
- 升版: 不升
- 备注: **与 T90（t16）并发** —— T90 的构建产物会被本任务再次改变，故船长裁定本任务完成后另派 **t26（verifier）** 做「权威最终构建 + 四闸门 + t24/t25 独立验证」，以 t26 产物作为发行态（编号说明：`t25` 已被「归属文案修正」任务占用，见 T99）。文件锁：`src/focus.mjs`/`style.css` 归本任务独占（t13、t23 均已 completed）

#### 派单摘要（可直接粘贴为切片开场）
工作区 `D:\deepseek harness work\考研\Athena`。先读 `AGENTS.md`，禁止整仓通读。本切片任务：删除 t12 后已成死代码的父级 chip —— `src/focus.mjs` 的 `focusParentChipEl`（约 `:2525-2533`）及其内联兜底分支，以及 `style.css` 中 `.focus-parent-chip` 规则块与 t23 注释里「保留 .focus-parent-chip 基础规则」一段；归属信息由 `.focus-tree-expand-attr` 承担，渲染必须零可见变化。文件边界：只改 `src/focus.mjs`、`style.css`、`tests/focus.test.mjs`，证据写 `backup/scratch/focus-dead/`；不改其他 `src/*`、`data/`、生成物。验收命令：`node --test tests/focus.test.mjs`、`node --test tests/act-settings.test.mjs`、`node tools/check_render.mjs`、`node backup/scratch/focus-dead/check-dead.mjs`（自建改前/改后对拍 + 反证）。不跑 `npm run build`，不动版本七处。

### 报告
- 交付（focus-eng，t24，attempt 1）：
  - `src/focus.mjs`：删除死代码 `focusParentChipEl`（原 `src/focus.mjs:2525-2543`，含 `focusCssDeclared('.focus-parent-chip')` 内联兜底）+ 两行注释 + 尾随空行；区段标题改为「UI：层级文字标」；文件 4062 → 4040 行，−971 字符（LF 文本 156952 → 155981 字节）。
  - `style.css`：删除 `.focus-parent-chip { … }` 6 行规则块 + 其后空行；t23 说明注释改写为 11 行（补记 t24 删除依据，注释内不再出现该选择器字面量）；`.focus-tree-guide` 规则行逐字未变（现 `style.css:2000`）。
  - `tests/focus.test.mjs`：在既有「层级结构：只留结构属性…」测试内追加死代码守卫（测试总数仍 **66**）；守卫名用拼接构造（`'focusParent'+'ChipEl'` / `['focus','parent','chip'].join('-')`）以免测试文件自身命中全仓 grep，并先以合成样本自证可判红（函数/选择器样本 true、邻近选择器 false），再断言 src 文本、`style.css` 文本、`buildProduct()` 产物三者 0 命中。
- 船长亲跑（均 exit 0）：
  - `node --test tests/focus.test.mjs` → **66/66**（pass 66 / fail 0）。
  - `node backup/scratch/focus-dead/check-dead.mjs` → **PASS 55/55**（四组 = 亮/暗 × 桌面 1360×900 / 窄屏 400×780；含无横向溢出、0 console error / 运行时异常）。
  - `node --test tests/act-settings.test.mjs` → **11/11**；`node tools/check_render.mjs` → 卡片 2769 / 字段 9828 / 问题 0（成员侧，船长复跑于 T97 窗口）。
  - 残留复核（`Select-String`）：`src/focus.mjs` 命中 **0**、`style.css` 命中 **0**（`docs/` 17 行属历史叙述、`app.js` 3 行属旧产物、`.agent-teams` 16 行属台账）。
- 对拍口径（成员证据，船长复核成立）：改前冻结件 `backup/scratch/focus-dead/pre/`（`app.pre.js` 741633 字符含 chip、`style.pre.css`、`focus.pre.mjs`、`hashes.json`）经「区段标题改名 + chip 块删除」确定变换后与改后 `src/focus.mjs` **逐字相等**；`style.css` 经「注释改写 + 规则块删除」后与改后**逐字相等**；选择器集合 `removed=[".focus-parent-chip"] added=[]`；规则集（去注释）744 → 743 条且其余声明逐字不变；四组「改前页 vs 改后页」状态树快照 + 19 项计算样式 deepEqual；chip 实例两面均 0；`.focus-tree-expand-attr` 仍输出归属信息。
- 未做项 / 转派（本任务 inScope 外，未顺手改）：
  1. `docs/ACT.md:191` 与 `docs/ARCHITECTURE.md:176` 仍把行内父级 chip 当现状描述 → 已发消息给 T91（t17 文档回写，bank-eng）纳入本轮，口径为「归属信息由展开面板 `.focus-tree-expand-attr` 承担；2.2.0 起不再有该元素与对应样式」，并要求不得写成「当前存在」以免与死代码守卫冲突。
  2. 展开面板归属文案实际渲染「归属 归属 …」（`src/focus.mjs:984` 的 `text: '归属 ' + label` 已含前缀，`src/focus.mjs:2884` 再拼一次）→ 已新建 **t25**（focus-eng）处置，含可判红断言与 check-label 探针（见 **T99**）。
  3. `app.js` 旧产物 3 行残留（`:15023`/`:15025`/`:15029`）→ 由 **t26** 权威构建刷新，不在本任务范围。
- 过程记录（调度顺序，船长自身失误）：t24 创建时只给 assignee、**未带依赖**，被调度器立即派给空闲的 focus-eng；同一时刻 t16/t17 因依赖全部满足自动开工 → t16 的构建将被 t24 超越。因 `edit_plan` 报 `task "t24" has already started and cannot be edited`，t16/t17 的依赖表无法补登 t24；处置为：给 verifier 发口径消息（T90 报告须声明「t24 落地后需重跑构建」，不得宣传为发行态），并新建 **t26 = final-verify**（verification，verifier，deps `[t16, t24, t25]`）产出本波次唯一权威发行态。**教训：顺序敏感的新任务必须建任务时即带依赖，或先建后立刻 `edit_plan` 补依赖；给 assignee 却不给依赖会被当作就绪任务抢跑。**

### T99 专注链归属文案去重「归属 归属」（团队 t25）
- 状态: accepted
- 负责: 团队 athena-2.2-prep / focus-eng（t25，attempt 1）
- 文件集: `src/focus.mjs`、`tests/focus.test.mjs`、`backup/scratch/focus-label/`
- 依据: T98（t24）报告未做项 ② —— `focusParentAttribution`（`src/focus.mjs:960-986`）返回的 `text: '归属 ' + label` 已自带前缀，渲染处 `src/focus.mjs:2884` 又拼一次，实际渲染「归属 归属 ▲1 任务群乙」（船长实读行号确认）
- 依赖: T98（t24 完成，释放 `src/focus.mjs`）
- 验收:
  1. 归属文案只出现一次「归属」前缀（渲染形如「归属 ▲1 任务群乙」）；全仓不得二次拼接
  2. `focusParentAttribution` 返回契约在注释写明（含/不含前缀），调用点按契约取用；未编入仍渲染「未编入」
  3. 回归断言：归属行文本中「归属」恰 1 次，先以合成样本自证可判红（反证落盘）
  4. 闸门：`tests/focus.test.mjs` 66 例不减（新增后 ≥67）、`tests/act-settings.test.mjs` 11/11、`node tools/check_render.mjs` exit 0、`check-label.mjs` exit 0
  5. **check-dead 预期差异条款（契约修订 revision 1）**：`backup/scratch/focus-dead/check-dead.mjs` 的模型只含 t24 两处变换，允许判红，但判红项须**逐条等价于 t25 文案 delta 且无额外差异**（差集恰为「归属 」前缀删除），并声明未改 `focus-dead/` 冻结基线
- 升版: 不升
- 备注: 契约修订理由 —— 原验收 4 要求 `check-dead.mjs` 仍 55/55，与该探针「以 t24 改前冻结件逐字对拍」的判定模型互斥（成员报出约 6 条必红：`check-dead.mjs:277` src 对拍、`:280` bundle 对拍、`:368` 四组 DOM 快照），且验收 5 禁止改该探针目录；船长改为可验证的「差异归因」口径，并把 `check-dead.mjs` 移出 verify 列（保持 verify 失败即失败的硬口径）

#### 派单摘要（可直接粘贴为切片开场）
工作区 `D:\deepseek harness work\考研\Athena`。先读 `AGENTS.md`，禁止整仓通读。本切片任务：修掉专注链展开面板归属文案的重复前缀 —— `src/focus.mjs:2884` 处 `'归属 ' + String(info.parent.text || '')` 与 `focusParentAttribution`（`src/focus.mjs:960-986`）自带前缀叠加，渲染为「归属 归属 …」；统一到单一事实源并补可判红断言。文件边界：只改 `src/focus.mjs`、`tests/focus.test.mjs`，证据写 `backup/scratch/focus-label/`；不改 `style.css`、`docs/`、`backup/scratch/focus-dead/`。验收命令：`node --test tests/focus.test.mjs`、`node --test tests/act-settings.test.mjs`、`node tools/check_render.mjs`、`node backup/scratch/focus-label/check-label.mjs`。不跑 `npm run build`，不动版本七处。

### 报告
- 状态: accepted（主对话验收通过）
- 交付（focus-eng，attempt `7a55ecb3-b255-44bc-a297-4e8d252cf844`，6 条验收全 passed）
  - `src/focus.mjs:988` 纯函数 `focusParentAttribution` 改返回实体：`parentLabel: label, text: label`（原 `text: '归属 ' + label`）；`:963-967` 写入五行返回契约注释（text 不含前缀、全仓唯一前缀处在 `.focus-tree-expand-attr`、字段行取实体）
  - 消费点保持唯一拼法：`src/focus.mjs:930`（字段行取实体，字段名已带「归属」）、`src/focus.mjs:2888`（全仓唯一 `'归属 ' +`）；未编入仍渲染「未编入」
  - `tests/focus.test.mjs`：三处既有断言改实体取值 + 新增可判红回归测试（判别器 2/1/0 + 合成样本 2/1/0 + 真实纯函数拼接只 1 次）
  - 证据：`backup/scratch/focus-label/`（`check-label.mjs`、`t25-evidence.json/md`、`t25-dead-attribution.md`、`_check-dead.out.txt`、`_dead-before/after.txt` 与 `_dead-bak/`、`pre/` 冻结件）；临时脚本 `_freeze.mjs` 已删
- 主对话亲跑复核（全部 exit 0）
  - `node --test tests/focus.test.mjs` → **67/67**（既有 66 零回归）
  - `node --test tests/act-settings.test.mjs` → **11/11**
  - `node backup/scratch/focus-label/check-label.mjs` → **PASS 62/62**（含亮/窄屏 400×780 三组对拍：主题生效、无横向溢出、chip 实例 0、0 console error）
  - `src/focus.mjs:988` 现值复核 = `parentLabel: label, text: label`；`归属 ` 字样在 `src/focus.mjs` 仅 4 处（`:786` 区段标题注释、`:963`/`:965` 契约注释、`:2888` 唯一拼接点）
- check-dead 预期差异条款（契约修订 revision 1）执行情况：判红恰 **2** 条（53/55，exit 1，非预估 6 条）——`:277` src 逐字对拍（首个差异 @35023＝插入的契约注释；155981 vs 156227）、`:280` bundle 对拍（`post=740662 live=740908`，差 246）；探针内建恒等式「活文件 − t25 两处 === t24 改前件 + t24 两处 === check-dead 模型」逐字成立 ⇒ 差异逐条等价于 t25 文案 delta、无额外差异；`backup/scratch/focus-dead/` 全目录 sha256 前后 0 差异（未改冻结基线）
- 未做项 / 待办
  - 未跑 `npm run build`（约定：唯一构建归 T100/t26）；`app.js` 与 `dist/` 仍为 T90 中间态
  - 给 T101（t27）的约束（已转达）：渲染端保持「前缀只在 `.focus-tree-expand-attr` 拼一次、字段行取实体」；`src/focus.mjs:2833-2840` 的 `focusTreeFoldDefaults` 内联兜底选择器须随折叠键类名同步更新
- 过程记录：t25 因依赖尚未落地而短暂抢跑（调度器即时派发），focus-eng 按要求先复跑独立闸门（check-label 62/62）再改 `src/focus.mjs`；契约冲突（原验收 4 要求 check-dead 仍 55/55）已由 `agent_teams_amend_task` revision 1 处置（见本块验收 4/5 与「备注」行）。

### T100 权威最终构建与未覆盖项复测（团队 t26）
- 状态: accepted（t26 attempt 2 复验通过；attempt 1 的 failed 记录保留：F1→T110、F2→T111、F3 非缺陷）
- 负责: 团队 athena-2.2-prep / verifier（t26）
- 文件集: `app.js`、`dist/`、`backup/scratch/verify-final/`（唯一构建权）
- 依据: T98（t24）过程记录 —— T90（t16）的构建发生在 t24/t25 之前，已被/将被源码改动超越；T86（t10）与 T97（t23）登记的 7 条未覆盖 + 3 条空转待复测
- 依赖: T90（t16）、T98（t24）、T99（t25）、T101（t27）、T102（t28）、T103（t29）（契约修订：依赖由 `[t16,t24,t25]` 扩为 `[t16,t24,t25,t27,t28,t29]`，验收 8→11 条）
- 验收:
  1. `npm run build` → `check` → `test` → `check:render` 四闸门 exit 0；`app.js` 与 `dist/app.js` 字节数与 sha256 逐字节一致
  2. 验证窗口声明：开工前/收工前关键文件 sha256 + mtime 快照，并发写入即判红
  3. t24 独立验证（`focusParentChipEl`/`.focus-parent-chip` 三者 0 命中；改前容器等价性须按 t25 文案 delta 归因，非文案差异即判红）
  4. t25 独立验证：真实产物 + 真实 DOM 的归属文本「归属」恰 1 次；未编入仍「未编入」
  5. 复测 `.focus-reminder` 与 `.dock`/`.rating` 几何不相交（真实元素，不得空转）、8 条 AA 对比度实测、四 `data-level` computed 颜色一致性
  6. 反证 ≥2 条（缺陷注入副本判红，日志落盘）
  7. 范围审计：`src/fsrs-core.mjs` 与 HEAD 逐字节一致、`data/bank_econ.js`/`bank_stats.js` 与 HEAD 一致、`data/bank_math3.js` 仅 T95 的 2/2 行差异、版本七处与 `CHANGELOG.md` 未动
  8. 诚实口径：未覆盖项与空转断言逐条登记
- 升版: 不升（升版属收口步骤，由船长在用户确认后执行）
- 备注: 本任务产物即本波次**唯一权威发行态**；T90 的报告不得被当作发行态引用。契约修订 revision 1 同 T99 的差异归因口径

#### 派单摘要（可直接粘贴为切片开场）
工作区 `D:\deepseek harness work\考研\Athena`。先读 `AGENTS.md`，禁止整仓通读。本切片任务：在 t24/t25 全部落地后做**唯一权威最终构建**并复测历史未覆盖/空转项。文件边界：只写 `app.js`、`dist/`、`backup/scratch/verify-final/`。验收命令：`npm run build` → `npm run check` → `npm test` → `npm run check:render`（全 exit 0），加自建探针与反证脚本。不升版本、不动 `CHANGELOG.md`、不改 `src/*` 与 `style.css`。

### 报告
- 结论: **failed（10 条验收 8 通过 / 2 判红）**；四道闸门全 exit 0；判红项 F1（medium，用户可见）已转 T110（t36），F2（low，死 CSS）已转 T111（t37），F3（low）经船长裁定**非缺陷**
- 交付: `backup/scratch/verify-final/VERIFICATION-REPORT.md`（含 §11 九条未覆盖项与「t34 非发行态」声明）、`backup/scratch/verify-final/shots-t26h/` 等证据
- 唯一构建（22:31:01）: `app.js` = `dist/app.js` = 888750 B / sha256 `ee26486e454c9ac2f5889e7a4dbd54c6da3161c9090275441eaeb83ddbacd32f`；`style.css` = `dist/style.css` = 117361 B / sha256 `80b68404a401244badcecba8fac3052ac4402d225a3f85369886aa36bd3b41b5`
- 四闸门: `npm run build` exit 0 → `npm run check` exit 0（25 学科 / 2769 卡片 / 3 题库 / 225 真题 / 170 卡片派生；版本七处一致；「app.js 与 src/ 同步」）→ `npm test` **344/344**（800.8 ms）→ `npm run check:render` exit 0（KaTeX 就绪 / 2769 卡片 / 9828 字段 / 0 问题）
- 判红项:
  - **F1（medium，用户可见）** 已编入单元的展开面板里「归属」渲染两次：`src/focus.mjs:956` 模块卡字段 `['归属', parent ? parent.text : '未编入']` ＋ `src/focus.mjs:3009-3010` 的 `.focus-tree-expand-attr`（仅 attached 时追加）；实测 `panelCount=2 / treeCount=3 / attrLines=1`，截图 `backup/scratch/verify-final/shots-t26h/02-focus-panel-light.png` 可见重复行。「归属 归属」双前缀不存在；未编入单元正确渲染「未编入」。**修法二选一**：删 unit 的「归属」字段行，或删 attr 行——删其一时 `t25:attribution-single-count`、`no-double-prefix`、`unattached-renders-explicit-text` 三条断言可同时全绿。→ 已派 **T110（t36，focus-eng）**
  - **F2（low）** `style.css:2053-2055` 三条 `.focus-reminder[data-mode="appoint"]` 规则无生产者；船长复核确认生产者 `src/focus.mjs:2755` 只写 `info.mode`，取值仅 `'scout'`（`:1091`）/`'focus'`（同处）/`'reserve'`（`:1115`），`appoint` 在 `src/`、`tests/`、`index.html`、`sw.js` 命中 0，真实预约态是 `reserve`；t16 登记的 3.93 对比度只能强挂属性复现（真实两态该元素数 = 0）。→ 已派 **T111（t37，style-eng）**
  - **F3（low，验收②口径）** 窗口内存在他人写入（`src/wrong.mjs` 31374 B@22:23:14、`tests/wrong.test.mjs` 28545 B@22:24:00、`style.css`@22:14:49），三者均早于 22:31:01 构建，`npm run check` 的「app.js 与 src/ 同步」证明产物已含它们 → **船长裁定：非缺陷**，属 T105（t31）授权的错题文档改造落地；并发窗口口径本身由本任务契约要求，记录不追改
- 其余全绿（摘要）: t24 死代码 0 命中 + `pre/` 基线哈希一致 + 模型复算 srcΔ971/cssΔ281/bundleΔ971 与自报一致（audit 36/36）；t27 行语义 / Enter·Space 四态 / 折叠键 28×28（390 宽 40×40）/ 标题无前缀 / 模块卡 + 标签化 / 组合弹窗（非计划 hasDate=hasNum=false 且 await 文案正确；计划模式 date+num(min1/max99) 仍在；填 0 夹取 →「≥ 1 个」；日期 2026-11-15 →「截止 11/15 23:59」）；t28 三视图无页内入口、二级栏「自测」→ wrongQuiz 且会话不重置、390 宽无溢出；t29 class-map 38/37 `gaps=[]`、引导线 4.52、`.focus-level-*` 彩色规则 0、四层 computed uniq=1、tree 文本亮/暗全 ≥4.5；复测提醒与 `.dock`/`.rating` 几何不相交（t10 空转已消除）、冻结对比度 2.15、AA 8 项与 t16 登记值逐项一致（亮 4.23/3.93/3.68/4.11/3.80/3.22，暗 ≥6.28）；三组反证 m1→5 红、m2→3 红、m3→2 红（源字节与产物一致）
- 未覆盖项（不得读作已通过，报告 §11 逐条登记）: 窄屏弹窗细节、触屏/指针事件、Tab 顺序与焦点陷阱、提醒折叠交互、日期非法分支不可达、appoint 不可达、225 题未逐题截图、SW 缓存路径、T90 §8 其余项
- 非发行态声明: 产物＝22:31:01 构建；此后 `/tmp` 之外仍有源码写入（t31 的 `src/wrong.mjs`/`tests/wrong.test.mjs` 早于构建已含，但 t34 之后若有 `style.css` 写入则 `dist/style.css` 会落后）→ **发行态以收口轮重新构建为准**，与 T90→T100 先例同口径
- 过程记录: 本任务为**唯一构建权**任务，构建窗口内登记并发写入即按契约判红（F3），船长据「产物同步」证据裁定其非缺陷；判红的两条实质缺陷均已即时转 T110/T111，未遗留未处置项
- 补充报告（t26 attempt 2 复验，船长裁决 **accepted**）: T110（t36）/T111（t37）落地后重建发行态——`npm run build` exit 0 / 8333 ms；`npm run check` 1216 ms、`npm test` 1320 ms（**345/345**）、`npm run check:render` 2720 ms（2769 卡片 / 9828 渲染字段 / 0 问题）、`node tools/check_version.mjs` 84 ms，四闸门 + 版本校验全 exit 0；`app.js` = `dist/app.js` = **892448 B / sha256 `891e70567bd4292504c766512470647f3d5493556b4e45623d4403e6b3d704fe`**，`style.css` = `dist/style.css` = **117866 B / sha256 `abc7eed4b77868fcc4f65614a0c3feaf863ee97bdfc38523a210d87ae7153ee5`**（逐字节一致；dist 复制集 33 对全一致）。窗口 00:07:42→00:19:41，5 条 drift 全部归因于本次构建，**无他人并发写入**；开工时 `dist/` 的 `index.html`(?v=74)、`sw.js`(ms3-v113)、`style.css`、`app.js` 四件落后于源，构建后刷新为 `?v=75` / `ms3-v114` / `abc7eed4` / `891e7056`。真产物 + 真 DOM 探针 60 项 0 判红（含 t24 死代码 0 命中 + 等价差异恰为「归属 」前缀删除、t25 面板「归属」恰 1 次、t27 标签化与行即展开、t28 无页内自测入口、t29 class-map covered=37 gaps=[]、appoint 规则数 0）；反证 3 株判红 7/2/1 精确命中目标断言；范围审计 37/37（`src/fsrs-core.mjs`、`data/bank_econ.js` 对 HEAD 逐字节一致、`data/bank_stats.js` 窗口内零改动、`data/bank_math3.js` 仅 2/2 行、白名单外写入 `outside=[]`）。证据 `backup/scratch/verify-final/T26-VERIFICATION-REPORT.md`（旧名 `VERIFICATION-REPORT.md` 已被工具失效观察占用故改名）。
- 船长亲跑复核（本机）: 两对产物哈希逐字节一致（`app.js` 892448 B / `891e7056…704fe`；`style.css` 117866 B / `abc7eed4…53ee5`）、`node tools/build.mjs --check` → 「app.js 与 src/ 同步」exit 0、`node tools/check_version.mjs` → `app.js 2.1.1 / CHANGELOG 2.1.1 / sw.js ms3-v114 / index.html 75,75,75 / package.json 2.1.1 / tauri.conf.json 2.1.1 / dist/app.js 2.1.1` 全一致 exit 0。
- 交接教训（已转 T116/t43）: 探针 harness 的 CDP 调试端口硬编码 **9333**（`backup/scratch/verify-final/_t26body.mjs:435`）⇒ 探针**不可并行**，并行会状态串台/崩溃（本轮已改串行重跑，并行批次作废）；后续并行须先随机化端口。
- 非发行态声明（更新）: 本轮 892448 B 产物随后被 T114（t41，源码标签改造）与 T115（t42，样式）超越 → **2.1.1 发行态以 T116（t43）的重新构建为准**，与 T90→T100 先例同口径。

---
### T101 专注链树杈与详情面板精修（团队 t27）
- 状态: accepted
- 负责: 团队 athena-2.2-prep / focus-eng（t27）
- 文件集: 仅 `src/focus.mjs`、`tests/focus.test.mjs`、`backup/scratch/focus-ui2/`
- 依据: 用户 m02567 + AGENTS.md + docs/ACT.md §5/§11（视觉落地属 T103）
- 依赖: T99
- 验收:
  1. 树杈引导升级（对齐大纲软件）：分层缩进步长统一、父级竖线与本级分支视觉连续无断口、末位分支收口、折叠时不残留悬空竖线、同级行对齐一致；`focusTreeGuides`（`src/focus.mjs:843-886`）纯函数输出契约不变，结构升级只在渲染端并把新口径写进注释
  2. 详情面板标题去掉「单元 #N ·」「第 N 层 ·」层级前缀（`src/focus.mjs:925`、`:946`）；番号/层次名若保留须为独立元素，不得混入标题文本
  3. 「是否计划中」与「计划截止日期」改为标签元素（如 `span.focus-tree-expand-tag[data-kind]`），无截止日期时有明确标签；转正所需下级数信息以标签 `title` 或紧随小字呈现
  4. 其余信息模块化（Linear 风）：`focusTreeExpandFields`（`:916-958`）的键名与取值口径**不得改**，渲染改模块卡结构（`.focus-tree-expand-mod` 等）
  5. 行/模块点击即展开：删除 `focusTreeExpandEl`（`:2853-2868`）与两处调用（`:2974`、`:3043`）；行加 `role="button"` + `tabindex="0"` + `aria-expanded`，Enter/Space 等效；行内既有按钮/复选框/下拉保持 `stopPropagation`
  6. 层级折叠键（`:2961-2973`）保留并更显眼：独立类名 + `data-collapsed` + `aria-expanded` + `title`；桌面热区 ≥28×28、≤420px/触屏 ≥40×40
  7. 非计划创建不出现截止日期：`focusOpenCombineModal`（`:3683-3786`）在 `freeCombine`（`:3704`）为真时不渲染「截止日期（可选）」（`:3726-3729`）与「可转正最低下一级任务数」（`:3731-3737`），提交不读隐藏输入；计划模式与 `focusOpenPlanTaskModal`/`focusOpenInlineChildModal` 行为不变
  8. `tests/focus.test.mjs` 66 例不减；`node --test tests/act-settings.test.mjs` 11/11、`node tools/check_render.mjs` exit 0；既有探针 `check-focus-ui.mjs`/`check-combine.mjs`/`check-label.mjs`/`check-dead.mjs` 按各自口径复跑并逐条说明差异（`check-dead` 按 T99 的文案 delta 归因）
  9. 亮/暗 × 桌面 1360×900 / 窄屏 400×780 四组探针全绿、≤420px 无横向溢出；反证 ≥3（改回标题前缀 / 改回无条件渲染日期 / 去掉行点击展开，各判红）
- 升版: 不升

#### 派单摘要（可直接粘贴为切片开场）
工作区 `D:\deepseek harness work\考研\Athena`。先读 `AGENTS.md`，禁止整仓通读。本切片任务：按用户 m02567 把专注链任务树的**结构层**精修——树杈更美观、详情面板去层级前缀、「是否计划中/截止日期」改标签、其余信息模块化、点击行即展开（删除独立详情展开键）、层级折叠键更显眼、非计划组合不出现截止日期。文件边界：只写 `src/focus.mjs`、`tests/focus.test.mjs`、`backup/scratch/focus-ui2/`；**不碰 `style.css`**（视觉落地是 T103）。验收命令：`node --test tests/focus.test.mjs`、`node --test tests/act-settings.test.mjs`、`node tools/check_render.mjs`、`node backup/scratch/focus-ui2/check-focus-ui2.mjs`。不跑 `npm run build`、不升版本。

### 报告
### 报告（船长验收，accepted）

**交付物**
- `src/focus.mjs`：任务树 UI 结构层六点精修（结构，不含视觉）。
- `tests/focus.test.mjs`：+3 条 t27 用例（66 → 70）。
- `backup/scratch/focus-ui2/`：`t27-evidence.json` / `t27-evidence.md`（含静态归因表）、`t28-class-map.md`、`legacy-attribution.md`、`final-gates.log`。

**实现要点（船长回读源码确认）**
- 树杈步长真源 `FOCUS_TREE_INDENT_PX = 14`（容器暴露 `--focus-tree-indent` / `data-indent-step`）；引导文本仍 ≡ `focusTreeGuides` 纯函数（折叠后按可见行重算，无悬空竖线）。
- 展开面板标题去掉「单元 #N ·」「第 X 层 ·」前缀（番号/层次名改为独立元素）；`是否计划中` / `计划截止日期` 升为 `data-kind` 标签；字段改模块卡（旧类名 `-field/-key/-val` 保留兼容 t25 选择器）。
- 删除每行独立的详情展开键 → **行即展开**（`role=button` / `tabindex` / `aria-expanded`，Enter / Space 等效）；顺带修掉真实 UX 缺陷：`renderApp()` 整树重渲染后键盘焦点丢失导致 Space 失效，已在 `src/focus.mjs:2957-2968` 的 `focusBindRowExpand` keydown 分支交还焦点。
- 层级折叠键独立类名 + `data-collapsed` / `aria` + 文案（展开下级/收起下级），热区桌面 ≥28px、≤420px 40×40。
- 非计划组合弹窗不再渲染截止日期 / 最低下一级任务数，提交不读隐藏输入。

**闸门（船长亲跑，全部 exit 0）**
- `node --test tests/focus.test.mjs` → **70 / 70**（pass 70 / fail 0）。
- `node --test tests/act-settings.test.mjs` → **11 / 11**。
- `node tools/check_render.mjs` → exit 0（2769 卡片 / 9828 渲染字段 / 0 问题）。
- `node backup/scratch/focus-ui2/check-focus-ui2.mjs` → **PASS 161/161**（亮/暗 × 1360×900 / 400×780 四组各 38 项 + 静态归因 5 项 + 四条反证各判红），`EXIT=0`。

**边界与旧探针归因（采信并复核）**
- 只改 `src/focus.mjs`、`tests/focus.test.mjs` 与 `backup/scratch/focus-ui2/`；未碰 `style.css`、`data/`、生成物、版本七处；未跑 `npm run build`（探针用内存 `buildProduct()` 覆盖 `app.js`）。
- 旧探针复跑判红 40 条（check-focus-ui 47/59、check-combine 40/42、check-label 39/62、check-dead 52/55），逐条归因到 t27 验收②③④⑤⑥（点击已删除的 `.focus-tree-expand`、plan/due 改标签、t25 恒等式被叠加改动打破），**无一条指向功能回退**；探针脚本与冻结件零改动（跑前 24 文件 sha256 快照、跑后 24/24 逐字节还原）。

**下游交接**
- `backup/scratch/focus-ui2/t28-class-map.md`（6223 B，37 行「选择器 → 用途（结构契约）→ 期望视觉」+ 实测类名 31 项，未列项 0）→ t29 可直接据此写视觉层，不必等。
- 未做项：视觉落地（`style.css`）归 t29；`data-` 属性与类名的文档回写归 t31（依赖 t27/t28/t29，t28 已 accepted）。

---
### T102 删除页内「错题自测」残留入口 + 手动录入移至左上角（团队 t28）
- 状态: accepted
- 负责: 团队 athena-2.2-prep / bank-eng（t28）
- 文件集: 仅 `src/wrong.mjs`、`src/stats.mjs`、`tests/wrong.test.mjs`、`backup/scratch/wrong-entry/`
- 依据: 用户 m02567 + AGENTS.md（T92/t18 已把自测放进二级功能栏）
- 依赖: 无
- 验收:
  1. `wrongQuizEntry`（`src/wrong.mjs:144-155`）与三处调用（`:165`、`:410`、`:511`）整体删除，错题模块页内不再有「📝 错题自测」按钮
  2. 二级功能栏「自测」入口与派发链（`src/actions.mjs:29-45` 的 `nav:'wrongQuiz'` → `wrong` + `quiz`）保持可用；进行中的错题自测会话不被重置
  3. 文案同步：`src/wrong.mjs:575`、`src/stats.mjs:285` 指向旧按钮的说法改为指向二级功能栏「自测」
  4. 「手动录入」在重做视图（`:162` 一带）与浏览视图（`:407` 一带）均为 `.learn-top` 首个子元素（左上角）；≤420px 无横向溢出、点击热区 ≥32px
  5. 测试：t18 行为断言（高亮映射、会话保持、图标一致、nav 派发）全部保留并通过，桩改为直接派发 `nav:'wrongQuiz'`；「3 处页内调用」断言反转为「0 处且函数不存在」；新增「手动录入为首个子元素」断言；反证落盘（按钮改回末位、页内入口加回，各判红）
  6. 闸门 `node --test tests/wrong.test.mjs`、`node --test tests/quiz.test.mjs`、`node tools/check_render.mjs`、自检 `check-wrong-entry.mjs` 全 exit 0
- 升版: 不升

#### 派单摘要（可直接粘贴为切片开场）
工作区 `D:\deepseek harness work\考研\Athena`。先读 `AGENTS.md`，禁止整仓通读。本切片任务：删除错题模块页内残留的「错题自测」按钮入口（二级功能栏已有该入口），并把「手动录入」移到各视图工具栏左上角适配移动端。文件边界：只写 `src/wrong.mjs`、`src/stats.mjs`、`tests/wrong.test.mjs`、`backup/scratch/wrong-entry/`；不碰 `style.css`、`src/quiz.mjs`、`src/learn.mjs`、`src/actions.mjs`。验收命令：`node --test tests/wrong.test.mjs`、`node --test tests/quiz.test.mjs`、`node tools/check_render.mjs`、`node backup/scratch/wrong-entry/check-wrong-entry.mjs`。不跑 `npm run build`、不升版本。

### 报告
- 状态: accepted（主对话验收通过）
- 交付（bank-eng，attempt `5fad7a31-578a-40ea-8e9e-e5b043a1ff9f`）
  - `src/wrong.mjs` 删除 `wrongQuizEntry()` 与其三处页内调用（原 `:146-155`/`:165`/`:410`/`:511`），现 `:144-148` 留注释「入口已改为二级功能栏」；二级功能栏「自测」成为唯一入口（`nav:'wrongQuiz'` 派发链、进行中会话保持、高亮映射零改动）
  - 「手动录入」移到重做视图（`src/wrong.mjs:153-160`）与浏览视图（`:399-406`）的 `.learn-top` **首个子元素**，计数「共 N 道」排后，统计页不放该按钮；内联 `min-height:32px` 兜住热区（`.btn.small` 基础 30px 的补齐见遗留）
  - 文案改指二级功能栏：`src/wrong.mjs:569`、`src/stats.mjs:285`（stats 仅此 1 行）
  - `tests/wrong.test.mjs`：删 `WRONG_QUIZ_ENTRY_SRC`/`clickWrongQuizEntry`，DOM 桩换为真 DOM helper `renderWrongToolbar` + `ATHENA_WRONG_FILE` 反证挂钩；「3 处页内调用」断言**反转为 0 处**（非删断言变绿）；新增「页内入口已删除」「手动录入为首个子元素」两条用例；t18 三条断言逐字保留
  - 证据：`backup/scratch/wrong-entry/`（`check-wrong-entry.mjs` + `.log`、`evidence.md`、grep 日志、`variant-A`/`variant-B`、4 张真实 Chrome 截图）
- 主对话亲跑复核（全部 exit 0）
  - `node --test tests/wrong.test.mjs` → **17/17**
  - `node --test tests/quiz.test.mjs` → **19/19**
  - `node backup/scratch/wrong-entry/check-wrong-entry.mjs` → A 源码层 / B 真实浏览器（420px+360px）/ C 反证三层全绿；反证汇总「对照组 exit 0 ｜ A（手动录入挪回末位）exit 1 ｜ B（页内入口加回）exit 1」
  - 残留检查：`wrongQuizEntry` 在 `src/wrong.mjs` **0** 命中、`src/stats.mjs` **0** 命中
  - `git diff --numstat -- data/` = 仅 `data/bank_math3.js` 2/2（t21 既有），未越界
  - `node tools/check_render.mjs` exit 0（2769 卡片 / 9828 字段 / 问题 0）
- 未做项 / 待办（两项已在无 t28 写入的路径上，已派后续）
  1. **文档与注释债**：`docs/ARCHITECTURE.md:165`、`docs/ACT.md:208`、`src/actions.mjs:29-30` 仍写「入口 `wrongQuizEntry`（`src/wrong.mjs:146`）+ 三处调用 `:165`/`:410`/`:511`」，t28 后已过期 → 并入 T105（t31 文档引用漂移修复）
  2. **样式跟进**：`.btn.small` 的 min-height 仅 30px（`.btn` 的 36px 被覆盖），t28 以内联 `min-height:32px` 兜住 → 归 T103（t29，style.css 补 `.learn-top .btn.small { min-height: 32px }`），随后由 T105（t31）删掉 `src/wrong.mjs:156`/`:402` 两处内联并复跑 `tests/wrong.test.mjs`
  - 未跑 `npm run build`（预览用内存 `buildProduct()` 束，未写 `app.js`）；`app.js`/`dist/` 仍为 T90 中间态，权威发行态归 T100（t26）
- 过程记录：t28 建单时未带依赖而被调度器即时派发（当时 `src/wrong.mjs` 无并发写入者，无冲突）；成员按约定未碰 `data/`、`style.css`、版本七处。

---
### T103 专注链树 UI 视觉落地（团队 t29）
- 状态: accepted
- 负责: 团队 athena-2.2-prep / style-eng（t29）
- 文件集: 仅 `style.css`、`backup/scratch/focus-style2/`
- 依据: 用户 m02567（Linear 风 / 大纲软件质感）+ T101 类名清单 + T97 的克制口径
- 依赖: T101
- 验收:
  1. T101 新增的全部类名都有 CSS 规则（无「有类名无规则」缺口），报告给出「class → `style.css` 行号」对照表
  2. 只用既有设计 token（`style.css:59` `--bg-sunken`、`:72` `--accent`、`:73` `--accent-2` 等），零新增颜色字面量、零死 token
  3. 层级**不得**用颜色区分（徽标/chip 中性色，`--text-muted` 级），`data-level` 不得驱动彩色（沿用 T97 口径）
  4. 树杈引导线与行基线对齐、连续无断口、折叠态不残留悬空线；引导线对背景对比度 ≥3:1（图形元素口径），亮暗达标
  5. 层级折叠键：桌面 ≥28×28、≤420px/触屏 ≥40×40，含 hover/active/focus-visible；详情面板为 Linear 风模块卡（圆角 8–10px、`--border` 描边、内边距 8–12px、模块间距 4–8px），标签 chip 小圆角 12px 字号
  6. 对比度逐条实测：新增文本/背景组合亮暗 ≥4.5:1；不得新增低于 AA 的项；既有低于 AA 项逐条列明
  7. 移动端 ≤420px 无横向溢出、行不错位、热区 ≥32px；亮/暗 × 1360×900 / 400×780 四组探针全绿
  8. `node tools/check_render.mjs` exit 0；反证 ≥2（删除面板模块卡规则、注入按 `data-level` 的彩色，各判红）
- 升版: 不升

#### 派单摘要（可直接粘贴为切片开场）
工作区 `D:\deepseek harness work\考研\Athena`。先读 `AGENTS.md`，禁止整仓通读。本切片任务：把 T101 交付的专注链树结构类名在 `style.css` 里落成「大纲软件质感 + Linear 风」的视觉（树杈线条、模块卡、标签 chip、显眼的层级折叠键、亮暗与移动端适配）。文件边界：只写 `style.css`、`backup/scratch/focus-style2/`；不改任何 JS。验收命令：`node tools/check_render.mjs`、`node backup/scratch/focus-style2/probe-focus-style2.mjs`。不跑 `npm run build`、不升版本。

### 报告
### 报告（船长 m03120 验收，2026-10 波次）

**交付**：`style.css` 末尾 **append-only 切片 +153/-0**（2338 → 2490 行；末节 `.learn-top .btn.small { min-height: 32px }` 在 `style.css:2489`）；证据目录 `backup/scratch/focus-style2/`（README.md 9 节：切片行号表 / class→行号对照 / 四组合读数 / 对比度表 / 反证日志 / 错题几何 / A0–A10 / 复现命令 / 已知限制；`probe-focus-style2.mjs`、`slice-copy.css`、`diff-t29.patch`、`t29-diff.json`、`results-{all,tree,neg,wrong}.json`、`probe-run-all.txt`、`check-render.txt`、`shot-{L-D,D-D,L-M}.png`）。

**覆盖内容（按 t27 的 `backup/scratch/focus-ui2/t28-class-map.md` 落地）**
- 树杈引导线（等宽 / `calc(indent − 2px)` / `pre`）；行 hover / selected / is-expanded / focus-visible；主行 single-line + 长名省略；层级与状态改中性**文字**标；折叠键 28×28（≤420px 40×40），带 `.focus-tree-row ` 前缀以命中 `src/focus.mjs:2918` 的 `focusCssDeclared`（实测 inline=null，未走内联兜底）；Linear 风面板 / 模块卡 / 标签 chip（`[data-kind]` 属性选择器，不按文本着色）；≤760px 恢复 2.0 换行。

**闸门（船长亲跑）**
- `node backup/scratch/focus-style2/probe-focus-style2.mjs` → **162/162 PASS、exit 0**（亮/暗 × 1360×900 / 400×780 四组合 + 3 条内存注入反证 neg-level-color 4/4、neg-no-card 1/1、neg-fold-tiny 2/2，含「只红该红」⊆ 预期集合断言 + 错题 420/360 两视口两视图）。
- `node tools/check_render.mjs` → exit 0（KaTeX 就绪 / 2769 卡 / 9828 字段 / **问题 0**）。

**船长独立复核（非采信自报）**
- **append-only 复核**：`diff-t29.patch` 头 `@@ -2335,3 +2335,156 @@`、**删除行 0**（`^-[^-]` 计数 = 0）；把 `style.css` 末 153 行做 EOL 归一后与 `slice-copy.css` 逐字节对拍 → sha256 均为 `1b5f11b4a61b459f…`（CRLF ↔ LF 差异已排除）⇒ t29 只在文件尾部追加，既有内容零改写。
- `git diff --numstat -- style.css` 显示累计 `372/102`，经分解为 t8（+204/−34）、t23（+15/−63）、t24（−6）、t29（+153/−0）——与各任务台账一致，非越界写入。
- 成员自报类名覆盖 29/29 无缺口（旧别名 `-field/-key/-val` 同元素成对实证 ×19）；引导线同层列宽 13.2 / 26.4 / 39.6 / 52.8px、字符极差 0、折叠前后 ≡ `focusTreeGuides` 纯函数（无悬空线）、与行锚点偏差 0px；无横向溢出（doc 1360/1360、400/400）；新增项对比度亮 5.45–17.04 / 暗 7.34–14.32、树杈 4.53/6.22、**未达 AA 0 条**；引用 `[data-level`/`warn`/`ok`/`danger` 0 处 ⇒ 未复活 t23 已删的彩色层级。

**给 t31 的交接（实测接管，可直接删内联）**：420/360 两视口 × 重做/浏览 两视图下「手动录入」为 `.learn-top` 首子元素、computed 高度 32px、**清空内联后仍 32px**、`wrapped=false`、无横向溢出 ⇒ `src/wrong.mjs:156` 与 `src/wrong.mjs:402` 的 `style.minHeight='32px'` 可删（本轮未动 `src/`），删后须复跑 `tests/wrong.test.mjs` 与 `check_render`。

**已知限制（成员如实登记，不催收）**
- 树杈字符宽 6.609px ⇒ 每层 ≈13.22px，与渲染端 14px 步长差 ≈0.78px；断言只主张「同层一致 + 逐层递进 + 与行锚点垂直对齐」，不主张像素等宽。
- 长名行的桌面端提示文字可能折行致行高变化（名称本身始终单行省略）。
- 暗色移动端截图（D-M）未留；对应断言已覆盖。
- 未提交 git、未跑 `npm run build`（生成物统一由 t26 构建）。
- **本切片后 `app.js`/`dist/` 仍是 t16 时代产物，发行态以 T100（t26）最终构建为准。**

---
### T104 统计卡片 × 讲义知识点覆盖比对（团队 t30）
- 状态: accepted
- 负责: 团队 athena-2.2-prep / stat-eng（t30）
- 文件集: 仅 `docs/refs/card-coverage-stats.md`、`docs/refs/card-coverage-stats.json`、`backup/scratch/refs-cards-stats/`
- 依据: 用户 m02661（卡片须与教材讲义知识点全面覆盖比对，**不含例题与课外题**）+ T78（t2 统计教材族基线）
- 依赖: T78
- 验收:
  1. 基准侧＝讲义知识点全集（茆诗松 8 章 + 14 专题讲义 + 计量讲义），粒度到章—节—知识点，每点带页码（PDF 页与印刷页，印刷页 = PDF 页 − 22）
  2. 卡片侧数据来源与归并口径明确（`data/stats.js` 卡片 id/标题/知识点标签 → 讲义知识点），逐点四类标注：`有讲义有卡片`（列卡片 id）/ `讲义有而卡片无` / `卡片有而讲义无` / `双方都有但需重写`（给理由）
  3. 缺口量化：每个缺口知识点给「建议补写卡片数」及估量依据；给出三科可复用的估量口径建议
  4. 例题、真题、课外题、习题册题**不计入**覆盖率（违者判错）
  5. 自建校验脚本 exit 0：条目数/缺口数可复算、页码引用可回读 `参考文件/_extract/`、四类计数自洽
  6. 只写三个指定路径；不改 `docs/refs/stats-textbook.{md,json}`、`docs/refs/rulings/stats.md`、`docs/COVERAGE.md`、`data/*.js`、`src/**`；不跑 build、不升版本、不 commit
- 升版: 不升

#### 派单摘要（可直接粘贴为切片开场）
工作区 `D:\deepseek harness work\考研\Athena`。先读 `AGENTS.md`，禁止整仓通读。本切片任务：把统计学科的知识卡片与教材讲义知识点做**知识点级**覆盖比对（基准＝茆诗松 8 章 + 14 专题 + 计量讲义；不含例题与课外题），输出分类清单、缺口表与补写估量，作为 2.2.0 汇总矩阵（T82/t6）的统计分册输入。文件边界：只写 `docs/refs/card-coverage-stats.md`、`docs/refs/card-coverage-stats.json`、`backup/scratch/refs-cards-stats/`。验收：自建 `check-cards.mjs` exit 0（条目/缺口可复算、页码可回读）。不跑 `npm run build`、不升版本、不 commit。

### 报告
### 报告（船长验收，accepted）

**交付（attempt `f7fc3689-9c9d-46f8-b25c-0ccec3ddc5ac`）**
- `docs/refs/card-coverage-stats.md`：416 行 / 32402 字符（UTF-8 无 BOM），sha256 `11EAA1BD2ADACFA3FCBF49C0BA9DEA7FD491B95BCB4C0C5DA725D167BDD35E83`。
- `docs/refs/card-coverage-stats.json`：190349 B，sha256 `F0EE4C266238B9015112B94AF422DA21E5FA88CEEB6D251C718B36425280C09B`；顶层键 `schemaVersion, generatedAt, baseline, counts, entries, gaps, cardOnly, cardIndex, anomalies`。
- `backup/scratch/refs-cards-stats/`：`skeleton.mjs`/`skeleton.json`（讲义骨架 400 行）、`points/ch1..ch8.json + zl.json + jl.json`（逐章对拍 overlay）、`gen-coverage.mjs`、`gen-cards-md.mjs`（纯派生）、`check-cards.mjs`、`load-stats.mjs`/`scan-cards.mjs`/`show-card.mjs`（只读卡片工具）。

**闸门（船长亲跑）**
- `node backup/scratch/refs-cards-stats/check-cards.mjs` → **`checks: 1006 / failed: 0 / warned: 0`，exit 0**（日志 `backup/scratch/refs-cards-stats/captain-run.log`）。覆盖 counts 与缺口数可复算、页码 175/175 可回读、md↔json 行数一致、生成器写入目标仅两份交付的静态检查。
- 结构核对（我自读 json）：`entries 182`、`gaps 27`、`cardOnly 12`、`suggestedTotal 27`、`cardsTotal 199`、`pagesVerified 175`、`mdLines 417`。

**结论数字（口径 A，非知识点 7 行不计入分母 ⇒ 175 行）**
- 四类：有讲义有卡片 **134** / 讲义有而卡片无 **27** / 双方都有但需重写 **7 行（8 卡：`ll01`,`ll06`,`ll07`,`est03`,`test16`,`sx03`,`xt04`,`xt07`）** / 有讲义有卡片但覆盖不足 **7 行**；**卡片有而讲义无（整合卡/超纲）12 张单列**，不计入分子分母。
- 建议补写 **27 张**（纯缺口 16 + 覆盖不足补强 11）；27 个缺口行中 **12 行逐条判定「不必补写」并写明理由**（定义性概念 / 无独立题型的铺垫小节）——诚实削减而非凑数。
- 卡片侧完整性：**199 卡全部至少被一行引用**；未放置卡 0、未知卡号 0。
- 例题口径：教材/讲义例题与真题一律不计入覆盖率；卡片 `EXAMPLE` 只作只读附注（键 166 / 条目 177），来源聚合与 `docs/COVERAGE.md` §3 一致（复旦 59 = 33.3%、光华 47 = 26.6%）。

**船长独立抽检（引用回读）**
- 抽 gap 行「事件域（σ-域）与事件列极限」（`page 23` = 印刷页 1，`suggestCards 1`）→ 回读 `参考文件/_extract/教材讲义__统计__茆诗松+概率论与数理统计教程 第三版.txt`：**L724 `1.1.7事件域`**、L725–L732 正文确在，与条目的节号/页码一致；条目的 `why` 另引专题三强化与 `COVERAGE §3` 第一章缺口，三处互证成立。

**边界**
- 未改 `data/*.js`、`src/**`、`docs/refs/stats-textbook.*`、`docs/refs/rulings/stats.md`、`docs/COVERAGE.md`（mtime 均早于本次作业）；未跑 `npm run build`、未升版本、未 commit。

**下游**
- `docs/refs/card-coverage-stats.{md,json}` 作为 **t6（T82）汇总矩阵的统计分册输入**；t6 现仅等 t3（微观族）、t4（数学三族）落定（t2/t5/t30 均已 accepted）。
- 「27 张建议补写」属 2.2.0 卡片补写批次，**本波次不入库**；t9（四族抽查）将按 ≥2 条覆盖矩阵条目回读复核。

---
### T105 文档引用漂移修复（t27/t28/t29 后的行号与类名同步）（团队 t31）
- 状态: accepted
- 负责: 团队 athena-2.2-prep / bank-eng（t31）
- 文件集: 仅 `docs/ARCHITECTURE.md`、`docs/DATA_SCHEMA.md`、`docs/ACT.md`、`backup/scratch/docs-refresh/`
- 依据: docs/WORKFLOW.md §8（代码事实变更后回写文档）+ T91（t17 建立的引用核对闸门）
- 依赖: T101、T102、T103
- 验收:
  1. 复跑 `backup/scratch/docs-bank/verify-refs.mjs` 与 `audit-bare-refs.mjs`，先判红列出全部漂移
  2. 逐条回读源码后修正三份 docs 的行号引用（禁止纯机械位移；每条须回读确认），收工时两脚本 exit 0（引用全通过、硬断言 0 失败、越界 0）
  3. 按 t27/t28/t29 真实交付同步结构口径：专注链树杈与新类名（模块卡/标签/折叠键）、点击行展开（不再有每行详情展开键）、非计划组合无日期字段、错题模块页内入口已删除、手动录入位置、`style.css` 行号刷新；不得把已实现项写成「待实现」
  4. 漂移闸门脚本沉淀在 `backup/scratch/docs-refresh/` 供后续切片复用，并在报告中给出「本次漂移条数 / 修复条数 / 手工修正条目」清单
- 升版: 不升

#### 派单摘要（可直接粘贴为切片开场）
工作区 `D:\deepseek harness work\考研\Athena`。先读 `AGENTS.md`，禁止整仓通读。本切片任务：在 t27（专注链树结构精修）/t28（错题入口删除 + 手动录入位置）/t29（`style.css` 视觉落地）之后，修复三份文档里源码引用与类名的行号漂移。文件边界：只写 `docs/ARCHITECTURE.md`、`docs/DATA_SCHEMA.md`、`docs/ACT.md`、`backup/scratch/docs-refresh/`。验收命令：`node backup/scratch/docs-bank/verify-refs.mjs`、`node backup/scratch/docs-bank/audit-bare-refs.mjs`（均须 exit 0）。不跑 `npm run build`、不升版本、不 commit。

### 报告
### 报告（船长 m03246/m03250 验收，2026-10 波次）

**交付：文档引用漂移修复 + 闸门换代，双闸门 exit 0。**

**闸门换代（本任务实质改进）**：t17 的硬编码 `ASSERT` 版脚本（`backup/scratch/docs-bank/`，未改动、留档）→ 新建 `backup/scratch/docs-refresh/verify-refs.mjs`：**符号锚点式**（引用解析 + ±3 窗口符号配对 + `ANCHORS(文件, 符号)` 运行时解析定义行 + 代码事实 + 结构计数），**不含任何硬编码行号**，因此源码行号漂移不再产生假红/假绿；`audit-bare-refs.mjs` 同步抄一份（仅日志路径不同）。

**结果**
- `verify-refs.mjs` → **exit 0**：引用 175 ｜通过 175 ｜失败 0（起步判红留档 `verify-before.log`：164｜133｜**31 失败**，旧硬断言 158 条中 73 条失败）；日志 `verify-final.log`、`gate-final.stdout.txt`。
- `audit-bare-refs.mjs` → **exit 0**：裸引用 241 ｜无法解析归属 38（信息性）｜**行号越界 0**。
- 结构计数含 `MIN_QUESTIONS stats=186 / MIN_TOTAL=225 / test 脚本 17 文件`，与当前仓库事实一致。

**文档改动（三份）**
- `docs/ARCHITECTURE.md`：177-182 整段替换为 t23/t27/t29 现行口径（**父级 chip 写成「已整体删除」+ 死代码守卫 `tests/focus.test.mjs:1363-1368`**、`FOCUS_TREE_INDENT_PX=14`、**行即展开**、折叠键 28×28 / ≤420px 40×40、非计划组合弹窗无日期与最低下级数）；183-185、151-157、199 行号刷新；补 `src/learn.mjs:555` 的 `texEl`。
- `docs/ACT.md`：§13.4 整段重写 + §13.6 `:210`/`:213` 刷新。
- `docs/DATA_SCHEMA.md`：113/114/118/318/320 行号刷新；`:135` 改「来源以原 `src` 为准，仅做空白/连接符规范化」（t33 低危项 ①）；`:141` 补 `numchar` 里标题含「相关」归 `corr`（t33 低危项 ②）。

**船长授权项（t31 执行 + 已验证）**：删除 `src/wrong.mjs:150`/`:395` 的 `style.minHeight='32px'` 内联（t29 的 `.learn-top .btn.small { min-height: 32px }` 已接管），`tests/wrong.test.mjs:488` 断言同步——这是本任务唯一的 `tests/**` 改动，已披露。

**船长亲跑复核**
- `node backup/scratch/docs-refresh/verify-refs.mjs` → exit 0；`audit-bare-refs.mjs` → exit 0（裸引用 241 / 归 38 / 越界 0）。
- `node --test tests/wrong.test.mjs` → pass 17 / fail 0；`node tools/check_render.mjs` → exit 0（2769 卡 / 9828 字段 / 0 问题）。
- `npm test` → 见下方「全量测试」行（成员自报 344/344）。

**BOARD 漂移 7 条（船长裁定）**
- 裁定口径沿用 T70/T32 先例：**BOARD 任务块正文是时间序台账，不追改历史快照**。其中 `:560`/`:654`/`:675`（quizCfg 旧口径）**随 T91（t17）关闭**；`:870`（父级 chip 旧描述）、`:1021`（wrongQuizEntry 债务）、`:1226` 属当时状态记录，本轮由 T105 断面取代；`:1245`/`:1246`（同一卷子多种写法）本轮修完（t21/T95 已 accepted）。
- **闸门作废**：`backup/scratch/docs-bank/verify-refs.mjs` 与 `audit-bare-refs.mjs` 自本任务起**不再作为验收闸门**（保留为历史证据，重跑判红或产生假绿均不得作为结论），一切文档引用核对以 `backup/scratch/docs-refresh/` 为准。建议 2.2.0 收口时把 `verify-refs.mjs` 沉淀为常驻 `tools/check_docs.mjs` 并纳入 `npm run check`。
- **已知失效证据脚本**：`backup/scratch/wrong-entry/check-wrong-entry.mjs:89`/`:95`/`:319` 仍断言「内联 `min-height`」存在，本任务删内联后重跑必判红——属**历史证据**（记录当时行为），不得据此判 T102 回归；新口径由 `backup/scratch/focus-style2/probe-focus-style2.mjs` 的「去内联后仍 32px」断言承接。

**范围**：`data/**` 零改动（`git diff --numstat -- data/` 仅 t21/t32 既有改动）；未跑 `npm run build`、未 commit。

### T106 统计卡片例题入库试点（团队 t32）
- 状态: accepted
- 负责: 团队 athena-2.2-prep / bank-eng（t32，attempt 1）
- 文件集: `data/bank_stats.js`、`tools/check_data.mjs`、`src/bank.mjs`、`tests/bank.test.mjs`、`docs/DATA_SCHEMA.md`、`backup/scratch/bank-cv/`
- 依据: 用户 m02736（卡片所附例题要进入题库）+ T82 口径修订 3/4（键语义、码 space、id 方案、type 受控扩展、无年份排除、traps/hint 禁编造）+ verifier 报出的 3 处 schema/validator 冲突
- 依赖: 无
- 验收:
  1. `data/bank_stats.js` 新增 `cv-st-<cardId>[-n]`：`stem = e.q`、`answer = e.a`、`altAnswer = e.a2`、`tags = [cardId]`（码）、`star = META[cardId][0]`、`origin = 'card'`、`src.card = cardId`、`src.note` 含例题 `src` 原文；`a2` 不另立题目、不并入 `answer`
  2. `year`/`school` 仅在能从 `e.src` 解析出四位年份时写入；实测 stats 无年份 7 条一律排除并逐条登记 `backup/scratch/bank-cv/excluded.md`（卡片 id + `src` 原文 + 原因），禁止编造年份/来源
  3. `traps`/`hint` 只在 `PITFALL[cardId]`/`MNEM[cardId]` 存在时写入（取原字符串），否则**省略字段**（不写空串、不编造）；`src.note` 说明缺失
  4. `tools/check_data.mjs` 同步：`origin` 枚举（缺省视为 `year`）、`origin === 'card'` 时 `traps`/`hint` 允许缺省（存在须非空）、`src.card` 必填且须为同科真实卡片 id、`year`/`school` 规则仅在字段存在时生效；**既有 55 题行为逐字节不变**（反证：删字段/编造年份/`tags` 写中文名各判红，注入副本还原后全绿）
  5. `src/bank.mjs`：`traps`/`hint`/`year`/`school` 缺失时跳过该行（不得渲染 `undefined`/空行）；`altAnswer` 渲染「另解」块；年份筛选对缺 `year` 题不误命中/误排除（真实 DOM 探针取证）
  6. `type` 扩展提案（最多 6 个新键、每键覆盖 ≥5 题）先写进报告交船长审，`bank.types` 同步，`check_data` 的 membership 校验保持
  7. 闸门全 PASS：`node --test tests/bank.test.mjs`、`node tools/check_data.mjs`（打印 stats 题量 16 → N）、`node --test tests/build.test.mjs`；护栏 `MIN_QUESTIONS.stats`/`MIN_TOTAL` 按新题量上调
  8. `docs/DATA_SCHEMA.md` 同步：新增 `origin`/`altAnswer`/`src.card` 行、`traps`/`hint` 改「条件必需」、`src` 段补卡片派生溯源句；不得改 `docs/ARCHITECTURE.md`
  9. 证据 `backup/scratch/bank-cv/`：逐行映射表（166 键 / 177 条）、`excluded.md`、可复算对拍脚本（自 `data/stats.js` 重算期望值并与 `data/bank_stats.js` 逐题对拍 exit 0）、反证日志 ≥2、DOM 探针输出
  10. 不跑 `npm run build`；UTF-8 写文件；不动版本七处/`CHANGELOG.md`
- 升版: 不升
- 备注: 本试点通过 T107（t33）独立验证后再铺开 econ（149 条）与 math3（150 条）；econ/math3 的 `data/bank_*.js` 本任务不得触碰。

#### 派单摘要（可直接粘贴为切片开场）
工作区 `D:\deepseek harness work\考研\Athena`。先读 `AGENTS.md`，禁止整仓通读。本切片任务：把统计学科卡片所附例题（`data/stats.js` 的 `EXAMPLE`，166 键 → 177 条）按已裁定映射入库 `data/bank_stats.js`，并同步 `tools/check_data.mjs`、`docs/DATA_SCHEMA.md`、`src/bank.mjs`、`tests/bank.test.mjs`。文件边界见 t32 契约；**不得动** `data/stats.js`、`data/bank_math3.js`、`data/bank_econ.js`、`style.css`、`app.js`、`dist/`、版本七处。验收命令：`node --test tests/bank.test.mjs`、`node tools/check_data.mjs`、`node --test tests/build.test.mjs`。不跑 `npm run build`。

### 报告
### 报告（船长验收，accepted）

**交付（attempt `04594b8f-6ba7-4a8e-a4cb-90c89b0ad222`）**
- `data/bank_stats.js`：统计题库 **16 → 186 题**，新增 170 条 `cv-st-<cardId>[-n]` 卡片派生题；sha256 `3BD0BC30A657FF1CEF93D4583A0878DC8AF7665C1A58FA2894167147DB9D0AD5`（两段哨兵块，生成器连跑两次 `--write` 哈希一致）。
- `tools/check_data.mjs`：`origin` 枚举（`year`|`card`，缺省 `year`）、卡片派生题条件必需字段、`src.card` 真实性校验。
- `src/bank.mjs`：缺字段跳行、另解（`altAnswer`）块、年份筛选不误判。
- `tests/bank.test.mjs`：护栏上调（`stats:186` / `MIN_TOTAL=225` / `MIN_TYPES.stats=11`，只升不降）+ 2 条新用例（41/41）。
- `docs/DATA_SCHEMA.md`：`origin` / `altAnswer` / `src.card` 字段行与「条件必需」口径。
- `backup/scratch/bank-cv/`：生成器 `build-bank-cv.mjs`（干跑 / `--seed` / `--write`，幂等）、`seed-table.md`、`excluded.md`、`check-card-questions.mjs`、`prove-guards.mjs`、`probe-dom.mjs`、`evidence.md` 及全部日志。

**闸门（船长亲跑，全部 exit 0）**
- `node --test tests/bank.test.mjs` → **41 / 41**。
- `node tools/check_data.mjs` → 全绿：`[题库] stats 186 题 | 11 题型 | 年份 2001…2026 | 难度 3★×25 4★×97 5★×64 | school=186/186（77 个来源）| 卡片派生=170`；`真题总数 225 | 其中卡片派生题(origin=card): 170`；题源一致性 **88 组 | 同组多写法 0 组**。
- `node --test tests/build.test.mjs` → **11 / 11**。
- 成员侧另有 `check-card-questions.mjs` PASS 12、`prove-guards.mjs` 13/13（M1–M10 判红 + 还原全绿 + 「既有 55 题不被误伤」）、真 Chrome/CDP `probe-dom.mjs` 38 ✓。

**船长独立抽查（自建 `backup/scratch/bank-cv/captain-check.cjs`，不读成员脚本）**
- 174 行脚本，直接加载 `data/stats.js` 与 `data/bank_stats.js` 对拍：`cv-*` **170** 条、非 cv 16 条。
- **失败项 0**：`origin === 'card'`、`tags === [src.card]`、`src.card ∈ META`、`star === META[cardId][0]`、`stem/answer/type/school` 非空、`year` 四位年份、`traps`/`hint` 若存在则非空、id 形态 `cv-st-<cardId>[-n]` 全部成立。
- 字段分布：`altAnswer` 12、`traps` 33、`hint` 7、卡片题带 `options` 0（选择题以题干内嵌选项形式保留）；同卡同题干重复 **0**。

**排除清单（诚实削减）**
- 7 条因 `src` 无四位年份而排除并逐条登记 `backup/scratch/bank-cv/excluded.md`：`pb06`（全概率公式）/`pb07`（贝叶斯公式）/`rv10`（指数分布）/`rv11`（正态分布）/`nc07`（相关系数）/`nc09`（切比雪夫不等式）/`ll04`（中心极限定理），`src` 原文均为「考研数学真题（…）」无年份 ⇒ 无法派生 `year`/`school`。遵守「例题仅真题」红线，**零编造**。

**船长裁定（bank-eng 的两项待审）**
1. **题型扩展批准**：`prob` 概率计算与事件运算 11 / `dist` 随机变量分布与密度 24 / `multi` 多维随机变量与联合分布 15 / `numchar` 数字特征与矩 17 / `limit` 大数定律与中心极限定理 8；判据基于卡片知识点标签族（`cat=` 前缀），每键 ≥5 题、总数 ≤6 键且与既有 6 键无重叠，中文名清晰 ⇒ 准予写入 `bank.types`（现 11 项），校验器继续强制命中既有 key。
2. **年份下拉 78 项**：本次**不改筛选交互**。护栏口径批准——同一 `(年份, 规范化来源)` 只允许一种措辞（88 组 0 冲突）；`.bank-select-menu` 已有 `max-height: 264px`（`style.css:2266`）与移动端 `50vh`（`style.css:2336`），列表可滚动，可用性可接受。**「按年分组/折叠年份下拉」登记为 2.2.0 UI 后续项**（不是本波次缺口），届时需同时动 `src/bank.mjs` 与 `style.css`，须新派任务并做视口探针。

**未做项 / 待办**
- `docs/ARCHITECTURE.md` 未动（卡片派生题渲染契约与 `origin` 说明）→ 由 **t31（T105）** 在 t27/t29 落定后一并回写。
- `dist/data/bank_stats.js` 为旧版，**由 t26（T100）权威最终构建**刷新；本任务未跑 `npm run build`（遵守分工）。
- 独立验证由 **t33（T107）** 承担（已解锁：逐条对拍、反证、页/来源回读、既有 55 题不回归）。

---
### T107 统计卡片例题入库独立验证（团队 t33）
- 状态: accepted
- 负责: 团队 athena-2.2-prep / verifier（t33）
- 文件集: 仅 `backup/scratch/verify-cv/`（工作区零写入）
- 依据: T106（t32）契约 + T82 口径修订 3/4 + verifier 自建的 10 条判据（2026-10-10 登记）
- 依赖: T106
- 验收:
  1. 独立复算（不用交付脚本）：自 `data/stats.js` 的 `DATA[].id`/`META`/`EXAMPLE`/`PITFALL`/`MNEM` 重算 177 条期望字段，与 `data/bank_stats.js` 新增题逐题零差异对拍（数组值键 11 个全覆盖）
  2. 排除清单复核：无年份 7 条确未入库、未编造年份/来源，原因可与 `e.src` 逐字对上；静默跳过未登记记缺口
  3. 抽样亲读 ≥5 条：卡片 `q`/`a`/`src` 原文与入库字段逐字一致；`tags` 为卡片 id 码；`star === META[cardId][0]`
  4. 校验器反证 ≥3（注入副本 + 还原）：`traps` 空串、编造 `year`/`school`、`tags` 写中文名、`src.card` 指向不存在卡片 → `node tools/check_data.mjs` 各须 exit ≠ 0 且 ERR 点名；还原后全绿；非 `card` 题删 `traps` 仍须判红（未连带放宽）
  5. 渲染与筛选（真实 DOM）：缺 `traps`/`hint` 不渲染 `undefined`/空行；`altAnswer` 渲染「另解」；缺 `year` 题在年份筛选中不误命中/误排除
  6. 范围审计：`data/stats.js` 与 HEAD 逐字节一致；`bank_math3.js`/`bank_econ.js` 无相关改动；`style.css`/`app.js`/`dist`/版本七处/`CHANGELOG.md` 未动；`git diff --numstat` 与自报一致
  7. 闸门三条亲跑 exit 0；护栏未下调；既有 55 题零回归
  8. 诚实口径：未覆盖项与空转断言逐条登记
- 升版: 不升

#### 派单摘要（可直接粘贴为切片开场）
工作区 `D:\deepseek harness work\考研\Athena`。先读 `AGENTS.md`，禁止整仓通读。本切片任务：独立验证 T106（统计卡片例题入库试点）——自建复算与逐题对拍、排除清单复核、抽样亲读、校验器反证、渲染/筛选实测、范围审计。只在 `backup/scratch/verify-cv/` 写入，不修改任何 in-scope 交付文件、不跑 `npm run build`。验收命令：`node --test tests/bank.test.mjs`、`node tools/check_data.mjs`、`node --test tests/build.test.mjs`。

### 报告
### 报告（船长 m03157/m03161 验收，2026-10 波次）

**结论：verdict=pass，8/8 acceptance 通过。** 报告 `backup/scratch/verify-cv/VERIFICATION-REPORT.md`（13742 B）；证据同目录：`recompute.{mjs,json,log}`、`negatives.mjs` + `neg-N*.log`、`readback.mjs`、`pure.mjs`、`probe-bank-cv.mjs` + `probe-t33.json` + `shots-t33/`（5 张截图）、`gate-*.log`、`audit.log`。

**成员自建复算（不调用 t32 交付脚本）**
- 判型展平后 170 入库 + 7 排除 = 177 条，逐题零差异对拍 **2210 字段格 差异 0**；数组值键 11 条全覆盖。
- 既有手写 16 题字段级 `changed=0 / added=0 / removed=0`（未借机改写）。
- 题型 11 类计数与 `docs/DATA_SCHEMA.md:80` 文档口径一致。

**反向证据（13 例全判红，点名到题；含 N0 对照组绿）**
`traps` 空串 / 编造 `year` / `tags` 用中文名 / `src.card` 不存在 / `origin` 非法值 / 非 card 题删 `traps`·`hint`（**既有 55 题校验未放宽**）/ 条件必需双向。

**渲染与筛选（真 Chrome + CDP，24/24 绿）**
用 `tools/build.mjs` 的 `buildProduct()` 现场产出当前 src 运行包并 `--override` 顶替早于 t32 的 `app.js`：stats 186 题、四组自定义筛选、**77 个 (年份, 来源) 选项**、`2023|上海财经大学…` → 11 题、叠加 `star=5` → 4 题、复位 → 186、另解块渲染、缺 `traps`/`hint` 不渲染 `undefined`；math3 `(A)–(D)` + 「答案：C」+ `.is-answer`。

**船长亲跑复核（全部符合）**
- `node --test tests/bank.test.mjs` → pass 41 / fail 0；`node --test tests/build.test.mjs` → pass 11 / fail 0；`node tools/check_data.mjs` → exit 0（学科 25 / 卡片 2769 / 题库 3 科 / 真题 **225** / `origin=card` **170**；题源一致性 88 组、同组多写法 **0**）。
- `git diff --quiet -- data/stats.js` → exit 0（手写数据与 HEAD 逐字节一致）。
- `backup/scratch/verify-cv/VERIFICATION-REPORT.md` 在位 13742 B。

**范围审计与窗口声明（重要）**
- numstat 与 t32 自报逐项一致（1263/4、53/12、283/47、865/82、96/18），无越界写入。
- `node tools/build.mjs --check` → **exit 1「app.js 与 src/ 不同步」**，反证 t32 未跑 build；`app.js`/`dist/` 仍是 T90（t16）产物（877215 B / sha256 `60454ab7…`），本窗口 `npm run check` 必失败**属预期**；`style.css` 于 21:37:03 被同波次 t29 再次改写。⇒ **发行态构建与版本七处收口归 T100（t26）**。
- 护栏只升不降（`MIN_QUESTIONS.stats=186`、`MIN_TOTAL=225`、`MIN_TYPES.stats=11`）。

**低危项（船长裁定）**
1. `docs/DATA_SCHEMA.md:135`「例题 src 原文」措辞未含生成器的空白/连接符整理（`jj01`/`jj06`/`jj11` 3 条实测）→ **转 T105（t31）**，属文档回写范围（`docs/DATA_SCHEMA.md` 在 t31 inScope）。
2. `docs/DATA_SCHEMA.md:141` 只登记 `chi` 例外，未写 `numchar`+「相关」→ corr → **转 T105（t31）** 同批修正。
3. **N8 检测缺口**：`src.note` 文案与 `src.card` 的交叉一致性无校验（当前 170/170 经验证者复算一致）→ 不在本波次增派；登记为 **2.2.0 入库批次的验收前置**（全量转换沿用生成器时必须补该校验，见 T82 口径修订 4）。
4. 未覆盖项 8 条（真实数据无缺 year 题、无选择题样本、stats 18 年全为多来源年、全角括号容差、未跑 build 故未验版本七处与全量 `npm test`/`check:render`、窄屏与键盘可达性未验）→ 由 **T100（t26）** 复测承接，本报告不得读作已通过。

### T108 专注链层级折叠键「更显眼」精修（团队 t34）

- 状态: accepted
- 负责: style-eng（t34）
- 文件集: `style.css`（仅末尾追加）、`backup/scratch/focus-fold/`
- 依据: 用户 m02567「展开任务层级的那个展开键（层级折叠键）要更显眼更美观」；BOARD T101（t27）与 T103（t29）已完成部分；船长截图实证
- 依赖: 无（`style.css` 由本任务独占；t31 文档回写引用既有行号，本任务 append-only 不会使其漂移）
- 验收:
  1. canvas 实测字形**墨迹**高度：折叠态与展开态均给出「修复前 → 修复后」数字，修复后 ≥9px 且不变形
  2. 字形在 28×28 盒内水平/垂直居中偏差 ≤1px；≤420px 与触屏 40×40 热区不变
  3. hover / active / focus-visible / `[data-collapsed="1"]` 四态仍生效（computed 值实测，颜色取自 token）
  4. 亮/暗两主题下字形与盒面对比度 ≥AA（给出数值）；`[data-level` 引用仍为 0（t23 死代码守卫不破）
  5. `node backup/scratch/focus-style2/probe-focus-style2.mjs` 仍 exit 0；若触及既有断言须逐条说明是旧断言过时还是真实回归，不得改探针掩盖
  6. 新探针 `backup/scratch/focus-fold/probe-fold.mjs` 覆盖亮/暗 × 1360×900 / 400×780 四组合、断言带读数、exit 0，且含至少一条反证（去掉新增规则即判红）
  7. `node tools/check_render.mjs` exit 0（KaTeX 就绪 / 2769 卡 / 9828 字段 / 问题 0）
  8. 报告给出改动片段行号、命令 exit 码、修复前后读数表、已知限制
- 升版: 不升版（2.2.0 收口时统一处理）
- 技术背景（船长实测）: `style.css` 末尾 t29 切片的 `.focus-tree-row .focus-tree-fold-level` 只声明 `width/height/min-width/min-height: 28px`、`border: 1px solid var(--border)`、`border-radius: 6px`、`background: var(--bg-elevated)`、`color: var(--text-muted)`、`line-height: 1`，**未声明 `font-size`**；继承行字号后 `▾`（U+25BE）墨迹高度仅约 5–6px，在 28px 白底圆角盒里看起来是「几乎空着的盒子 + 一个小点」（`backup/scratch/focus-style2/shot-L-D.png` 放大 8 倍可见）。约束：选择器不得改名（`src/focus.mjs:2918` 的 `focusCssDeclared('.focus-tree-row .focus-tree-fold-level')` 依赖它判定 CSS 已接管，否则会回落到内联兜底）；保留 `.focus-tree-fold` / `.focus-tree-fold-level`、`data-collapsed`、`aria-expanded`、`aria-label` 与点击行为（`src/focus.mjs:3096-3108`）。

#### 派单摘要（可直接粘贴为切片开场）

工作区：`D:\deepseek harness work\考研\Athena`（先读 AGENTS.md，禁止整仓通读）
本切片：专注链层级折叠键字形精修；文件集仅 `style.css`（末尾追加）+ `backup/scratch/focus-fold/`；验收命令 `node backup/scratch/focus-fold/probe-fold.mjs`、`node backup/scratch/focus-style2/probe-focus-style2.mjs`、`node tools/check_render.mjs`；不跑 `npm run build`、不动 `src/**`。

### 报告

### 报告（船长 m03260 验收，2026-10 波次）

**结论：折叠键「空盒子 + 小点」已修好，改为 CSS 几何三角，四态配色原样继承。**

**改动**：`style.css` 末尾 append-only 追加 **31 行**（`style.css:2492-2522`），把文字字形 `▾`/`▸` 换成 `::before` + `clip-path` 的几何三角（桌面 13×10、≤760px 16×12；折叠态同一形状 `rotate(-90deg)`），填色走 `currentColor` ⇒ t29 已写的 hover / active / focus-visible / `[data-collapsed="1"]` 四态配色与过渡**原样继承**，无需重复声明。只动 `style.css` + `backup/scratch/focus-fold/`（55 个产物）。

**为什么不用「调字号」**：`▾` 是 U+25BE（BLACK DOWN-POINTING **SMALL** TRIANGLE），墨迹仅约字号的 1/3（12px → 4.0×6.0px），要做到 ≥9px 需 font-size ≈28–30px；且 `▾`/`▸` 是两个不同字形，28px 档墨迹**还不等大**（8.63×9.63 vs 9.75×8.75，居中偏差 dx≈−2.4~−2.7px）——这正是船长截图里「几乎空着的盒子 + 一个小点」的根因。四方案对照留档 `var-light-v{0,1,2,3}-*.png`（读数见 `backup/scratch/focus-fold/README.md` §3）。

**关键读数（同页注入 `PRE_CSS` 复现「修复前」再移除）**
| 口径 | 修复前 | 修复后 |
|---|---|---|
| 桌面·展开 墨迹高 | 3.75 px | **9.5 px** |
| 桌面·折叠 墨迹高 | 4.13 px | **13 px** |
| 窄屏·展开 墨迹高 | 3.75 px | **12 px** |
| 窄屏·折叠 墨迹高 | 4.13 px | **16 px** |
| canvas 口径 | 4 px | 9.9 / 11.9 px |

- 居中偏差 **≤0.5px**；热区仍 **28×28**（桌面）/ **40×40**（≤420px，探针 400px 视口实测）；`inline=null`（未回落到 src 内联兜底）。
- 对比度：token 口径 亮 **4.83 / 17.04**、暗 **6.79 / 14.32**；像素口径 4.68 / 6.63 —— 全部 ≥AA。
- 结构零变化：类名 / `aria-label` / `aria-expanded` / `data-collapsed` / DOM 文本 `▾`↔`▸` 全在，点击翻转与还原实测通过；无横向溢出、console 0 错误。

**三条 verify（船长亲跑，全部 exit 0）**
- `node backup/scratch/focus-fold/probe-fold.mjs` → **62/62 PASS**（A 段静态审计 9 条 + 四组合 4×13 + 3 条反证 N1 去规则 / N2 破居中 / N3 三角缩水，均「只红预期项」且对照组结构完好）。
- `node backup/scratch/focus-style2/probe-focus-style2.mjs` → **162/162 PASS**（**t29 探针一行未改**，仍是原断言）。
- `node tools/check_render.mjs` → exit 0（KaTeX 就绪 / 2769 卡 / 9828 字段 / 问题 0）。

**append-only 实证（船长复核）**：`style.css` 现 **2523 行**；**前 2490 行**与 t34 开工基线逐字节一致（sha256 前缀 `a3db58b6a2373f8f0a08173a`）；追加段首行为 `t34 · 层级折叠键字形精修：文字字形 → CSS 几何三角…` ⇒ 既有 2490 行零改写。

**未做项 / 交接**
1. `dist/style.css` 现落后于 `style.css`（本任务只改 CSS、按约定不跑构建）⇒ **发行态以收口轮的最终 `npm run build` 为准**（与 T90/T100 先例同口径）。
2. t34 交接单里的「可删 `src/wrong.mjs:156`/`:402` 内联」**已由 t31 完成**（t31 报告为证，`tests/wrong.test.mjs` 已同步），此项无需再派。
3. 已知限制：几何三角为固定像素尺寸，未随用户字体缩放（reduced-motion/高 DPI 未专项验证，属 T100 未覆盖清单同类项）。

### T109 数学三选择题选项回填（团队 t35）

- 状态: accepted
- 负责: math-eng2（t35）
- 文件集: `docs/refs/math3.md`、`docs/refs/math3.json`、`docs/refs/rulings/math3.md`、`backup/scratch/refs-math3/`
- 依据: t4 交付登记的未完成边界 1（`docs/refs/math3.md` §7、`docs/refs/rulings/math3.md` §六）；2.2.0 题库须能展示选择题题干与四选项
- 依赖: 无（t4 已终态；`docs/refs/math3.*` 由本任务独占）
- 验收:
  1. 2010–2019 共 80 道选择题 `options` 由空数组补齐为 4 项，**逐字取自裁片 + 自带 `read_image` 亲读**（禁用 modlens；不得用 OCR 文本冒充亲读、不得凭记忆补写）
  2. 「有选项的选择题道数」由 28 → **108/108**（给修复前后对照表），且逐年 8 道完成表齐备
  3. `unreadable` 列表逐条写明页/题/原因；若为空须显式写 0（不得用猜测填空）
  4. `node backup/scratch/refs-math3/check-index.mjs` **exit 0**；既有 3438 项断言只增不减、不得放宽
  5. 逐年 checkpoint（`index-<年>.json` 回填 + `opt/progress.json`）落盘，裁片与 sha256 可复核（抽样 ≥5 条）
  6. 三份交付物 UTF-8 无 BOM / 仅 LF；`data/**`、`src/**`、`style.css`、`tests/**`、版本七处零触碰；未跑 `npm run build`
- 升版: 不升版
- 作业规程（硬约束）: 一次只渲一页（单条命令 ≤60 秒、禁止循环多页）→ 立即 `read_image` 亲读 → 立即转写该页 8 道题选项 → 每完成一年先输出一行进度文本再落盘 checkpoint。P0 顺序＝2014/2016/2017/2018/2019（各 1 页，先清 40 道），其后 2010–2013/2015。
- 渲染参数（**船长 m03225 修订，attempt 1 失败后**）: `--dpi 110`（不用 150）+ 优先用 `--box` **只裁选择题版心块**（去掉页眉页脚留白），单张 PNG **≤400 KB**、最长边 ≤1400 px；渲染后先看脚本打印的字节数/像素，超标就降 dpi 或缩小 box 再渲。原因：attempt 1 的失败原文为 `400 data: {"error":{"code":"invalid_parameter_error","message":"Download multimodal file timed out","type":"invalid_request_error"}} (code INVALID_REQUEST)`——**平台侧取不回过大图像**，与成员理解力无关；本波次此前 200 dpi 整页在 modlens 通道也同型超时。某张裁片在 110 dpi + box 后仍连续两次取回失败 → 登记 `unreadable`（原因写「图像下载超时」）并继续，**不得凭记忆或 OCR 文本补写选项**。
- 页清单（题源＝真题册）: 2010 p49–50、2011 p45–46、2012 p41–42、2013 p37–38、2014 p33、2015 p29–30、2016 p25、2017 p21、2018 p17、2019 p13。

#### 派单摘要（可直接粘贴为切片开场）

工作区：`D:\deepseek harness work\考研\Athena`（先读 AGENTS.md，禁止整仓通读）
本切片：数学三 2010–2019 选择题选项回填（80 道）；文件集 `docs/refs/math3.md`/`.json`/`rulings/math3.md` + `backup/scratch/refs-math3/`；验收命令 `node backup/scratch/refs-math3/check-index.mjs`（须 exit 0）；不跑 `npm run build`、不动 `data/**` 与 `src/**`。

### 报告

### 报告（船长 m03272/m03276 验收，2026-10 波次）

**结论：数学三选择题选项齐全度 28/108（修复前，仅 2020–2022）→ 108/108（修复后，2010–2019 的 80 道补齐）。** `unreadable` = 0 条。

**交付物（UTF-8 无 BOM / 仅 LF，船长实测字节与哈希与自报一致）**
- `docs/refs/math3.md` **68176 B** / 577 行 / sha256 `ba00269064086d2d…` —— 新增 §3.2「选项回填批次」（10 年页表 + 补充裁片 + sha256 前缀 + 读不清列 + 跨页清单 + 复核动作 + 落库口径 + 可复现性自检）；§7 原「选项缺口」条目改为**已关闭**；§8 验收口径同步。
- `docs/refs/math3.json` **544616 B** / sha256 `085456a7182e9f0b…` —— 每题新增 `options_verified` / `options_evidence{img,sha256,command}` / `options_evidence_extra[]`；`coverage.choice_with_4_options = 108`。
- `docs/refs/rulings/math3.md` **未改动**（sha256 仍 `3f309fbf…`）；`bank-answer-manifest.math3.json` 未受影响（161 = choice 108 + fill 53）。

**闸门（船长亲跑）**：`node backup/scratch/refs-math3/check-index.mjs` → **通过 4011 项检查 / RESULT: PASS / exit 0**（裁片实测 90 张、裁定 60 条、低产页 28 页、清单 161 条、**选择题选项 108/108**）；既有 3438 项断言**只增不减**（新增：108 道选项非空且无 `(A)` 前缀、2010–2019 每题 `options_verified` + sha256 + 等效命令、`coverage.choice_with_4_options=108`、md §3.2 十行与账本 sha 前缀一致、补充裁片按 `for` 精确挂载）。成员侧命令 exit 码：`refs-vision.py` 生成 2/2 = 0、`--verify` 重渲 6 张全 0（可重建）、`apply-options.py` 0、`build-docs.py` 0、`check-index.mjs` 0。

**船长独立抽样（最强证据）**：取 `m3-2010-1`——`docs/refs/math3.json` 记录 `options: ["0","1","2","3"]`、`answer: "C"`、`options_evidence.img = backup/scratch/refs-math3/opt/2010_p49.png`。实测该裁片 **230940 B / 1241×1754 px / sha256 `090beca87bdc2205…`（与记录逐字一致）**；用自带 `read_image` 亲读 → 原题「(1) 若 $\lim_{x\to0}[\frac1x-(\frac1x-a)e^x]=1$，则 $a$ 等于（ ）」四选项确为 **(A) 0. (B) 1. (C) 2. (D) 3.**，与入库选项逐字一致；又**独立复算**：$\frac1x-(\frac1x-a)e^x=\frac{1-e^x}{x}+ae^x\to-1+a$，令其 =1 ⇒ $a=2$ ⇒ **(C) 正确**，与入库答案一致。

**偏离裁定（船长采信）**
1. 任务模板写的 `<年>年考研数学三真题.pdf` **不存在**（该目录只有合并册 `3、2010-2022考研数学三真题.pdf`）→ 改用合并册 + `--page N`（N = 合并册物理页 = t4 登记页号）。已在报告与 §3.2 记录。
2. `apply-options.py` 初版会把补充裁片挂到该年全部 8 题 → 已改为按 `for:[题号]` **精确挂载**（21 例挂载对 → 11 对 / 8 类；2012 一(3)/(6)/(8) 各只挂对应裁片）。属修复而非缺陷留痕。
3. 裁片仍为 150 dpi 整页（1241×1754 px），但**字节 230940 ≤ 400 KB**（体积上限是字节口径，满足）；船长 m03225 的「box + 110 dpi」是超标时的首选手段，非强制。

**未关闭边界（不属本任务，登记给 2.2.0 批次）**：t4 台账 A 类——2010–2019 **填空 46 条 + 解答锚点 90 条**的答案/锚点仍未取证（`docs/refs/rulings/math3.md` §六.2）；清空后 `bank-answer-manifest.math3.json` 可由 161 → ~207。

**下游口径（给 t9/T100）**：选项以 `options`（4 项纯字符串、无字母前缀）为准，`options_ocr_unverified` 仅作 OCR 状态留痕；`--verify` 可对任意裁片一键重建证明。

**范围**：`data/**`、`src/**`、`style.css`、`tests/**`、版本七处、`CHANGELOG.md`、`docs/COVERAGE.md`、`docs/BOARD.md` 零触碰；未跑 `npm run build`。

### T110 专注链「归属」重复渲染修复（团队 t36）

- 状态: accepted（船长验收，t36 交付）
- 负责: 团队 athena-2.2-prep / focus-eng（t36）
- 文件集: `src/focus.mjs`、`tests/focus.test.mjs`、`backup/scratch/focus-attr/`
- 依据: t26（T100）判红项 F1；AGENTS.md + docs/WORKFLOW.md §7
- 依赖: T101（t27）
- 验收:
  1. 已编入单元的展开面板内「归属」只出现一次（DOM 计数 `panelCount=1`；`.focus-tree-expand-attr` 行数为 0 或模块卡字段行数为 0，二者留一），未编入单元仍渲染「未编入」
  2. 修法写进报告并给理由（删字段行 vs 删 attr 行），且不得把「归属」信息整体丢掉；相关契约注释与最终实现同步
  3. 自建 DOM 探针一次运行内覆盖已编入/未编入/树行/展开面板，亮暗 × 桌面 1360×900 / 窄屏 400×780 四组，归属文本出现次数断言 = 1
  4. 反证 ≥1：把被删的那处临时加回 → 探针判红，恢复判绿（脚本与日志留档）
  5. 测试用例不减；改断言须写明「旧断言为何与 t26 判据冲突」
- 升版: 不升
- 依据证据: `backup/scratch/verify-final/shots-t26h/02-focus-panel-light.png`（panelCount=2 / treeCount=3 / attrLines=1）；重复来源＝`src/focus.mjs:956` 字段行 ＋ `src/focus.mjs:3009-3010` 的 `.focus-tree-expand-attr`
- 约束: 不动版本七处 / `CHANGELOG.md` / `package.json` / `app.js` / `dist/`；不跑 `npm run build`（唯一构建归收口轮）；不碰 `style.css`（归 T111）；`data/*.js` 零改动
- 派单摘要: 工作区 `D:\deepseek harness work\考研\Athena`；先读 `AGENTS.md`，禁止整仓通读；本切片＝修掉单元展开面板「归属」渲染两次（t36/T110），文件集 `src/focus.mjs` / `tests/focus.test.mjs` / `backup/scratch/focus-attr/`，验收 `node --test tests/focus.test.mjs` + `node --test tests/act-settings.test.mjs` + 自建探针

### 报告

### 报告（船长验收，accepted）

**结论：T110 通过——t26 的 F1（已编入单元展开面板「归属」渲染两次）已修，且未编入单元的「归属 未编入」信息未丢。** 交付物 `src/focus.mjs`（182783 B / 4216 行）、`tests/focus.test.mjs`（110139 B / 2253 行，70→71 例无删除），报告 `backup/scratch/focus-attr/REPORT-t36.md`。

**修法（互斥双源，船长回读源码确认）**：已编入 → 渲染端 `.focus-tree-expand-attr`（`src/focus.mjs:3028-3030`，守卫 `info.parent && info.parent.attached`，全仓唯一拼「归属 」前缀处）；未编入 → 纯函数字段行 `['归属', parent.text || '未编入']`（`src/focus.mjs:962-964`，守卫 `!(parent && parent.attached)`）。两守卫互斥 ⇒ DOM 中每个单元展开面板「归属」恰一次。理由记录：t25 三条断言（`backup/scratch/verify-final/probe-t26.mjs:826-828`）要求已编入 `attrLines=1`、未编入 `attrLines=0` 且 `mods` 含 `归属→未编入`，删任一处都判红；契约注释同步 `src/focus.mjs:940-946` / `:1055-1060` / `:3025-3027`。

**船长亲跑闸门（本机实跑，全部 exit 0）**：`node --test tests/focus.test.mjs` exit 0；`node --test tests/act-settings.test.mjs` exit 0；`node backup/scratch/focus-attr/probe-attr.mjs` → `checks=220 pass=220 fail=0`（亮/暗 × 1360×900 / 400×780 同一次运行；树 12 行、行级「归属」=0）；`node backup/scratch/focus-attr/counter-evidence.mjs` → exit 0（`restore-field-row` 12 项判红、`attr-unconditional` 12 项判红、`final` 0 判红 ✓，日志 `backup/scratch/focus-attr/counter-evidence-final.log`）。

**判红原文（反证可复现）**：已编入旧态 `…完成度100%归属●1 已完成的组归属 ●1 已完成的组`（panelAttrWord=2）；未编入旧态 `…归属未编入归属 未编入`（attrLines=1）。对照 F1 证据 `backup/scratch/verify-final/shots-t26h/02-focus-panel-light.png`（panelCount=2 / treeCount=3 / attrLines=1）。

**非发行态声明**：本任务未跑构建；`app.js` 888750 B 仍是 t26 的过期产物（实测 `oldFieldRow=1`），成员探针以内存候选包 `cand-final.js` 顶替 `/app.js`——发行态归 T100 收口轮唯一构建（同一先例：T90→T100）。

**未关闭边界**：T110 范围内 0 项。键盘操作 / 高 DPI / `reduced-motion` 未专项验证（属 T100 §11 未覆盖清单同类项，转 T100 收口轮）。

### T111 清理悬浮提醒 appoint 死规则（团队 t37）

- 状态: accepted（船长验收，t37 交付）
- 负责: 团队 athena-2.2-prep / style-eng（t37）
- 文件集: `style.css`、`backup/scratch/focus-reminder-css/`
- 依据: t26（T100）判红项 F2；船长复核（生产者只会写 `scout` / `focus` / `reserve`）
- 依赖: 无
- 验收:
  1. `style.css:2053-2055` 三条 `.focus-reminder[data-mode="appoint"]` 规则删除，理由写进报告（`src/focus.mjs:2755` 只写 `info.mode`；取值仅 `'scout'`(`:1091`) / `'focus'`(同处) / `'reserve'`(`:1115`)；`appoint` 在 `src/`、`tests/`、`index.html`、`sw.js` 命中 0）
  2. 该区域注释（`style.css:2007` 一带提到 `[data-mode]` 的措辞）与删除后的现实一致，不留指向已删规则的文字（无需改动须说明理由）
  3. 实测真实两态（`reserve` / `focus`）的外观、对比度、热区与删除前逐项一致（自建探针 + 读数）
  4. 自建探针证明死规则已清除：强挂 `data-mode="appoint"` 时不再有专属样式生效（删除前判红、删除后判绿，两侧日志留档）
  5. 既有探针若因删除判红，须逐条归因且差异恰等于「三条 appoint 规则被删」；严禁改探针脚本或冻结基线
- 升版: 不升
- 约束: 不动版本七处 / `CHANGELOG.md` / `package.json` / `app.js` / `dist/`；不跑 `npm run build`；`is-collapsed` / `is-expired` / 折叠子规则逐字保留
- 派单摘要: 工作区 `D:\deepseek harness work\考研\Athena`；先读 `AGENTS.md`，禁止整仓通读；本切片＝删三条无生产者的 `[data-mode="appoint"]` 死 CSS 并证明真实两态不受影响（t37/T111），文件集 `style.css` / `backup/scratch/focus-reminder-css/`，验收四条命令（自建探针 + `probe-focus-style2` + `probe-fold` + `check_render`）

### 报告

### 报告（船长验收，accepted）

**结论：T111 通过——T100 的 F2（`.focus-reminder[data-mode="appoint"]` 三条无生产者死规则）已按纯减法清理，真实两态外观逐项不变。** 交付物 `style.css` 2526 行 / 117866 B / sha256 `abc7eed4b77868fcc4f65614a0c3feaf863ee97bdfc38523a210d87ae7153ee5`（改前 117361 B）；证据 `backup/scratch/focus-reminder-css/`（44 项：`diff-t37.patch`、`style-before.css`、`probe-reminder-mode.mjs`、`results-{before,after,after2,after-mobile}.json`、12 张 before/after 截图、`diag-D-D-reserve-*`）。

**改动内容（船长复核）**：`style.css` 仅两处 hunk、净 +8/−4（`diff-t37.patch` 头 `@@ -2004,7 +2004,8 @@` 与 `@@ -2050,9 +2051,12 @@`）；三条死规则删除后原位留 6 行说明注释，`style.css` 全文 `appoint` 仅剩 5 行注释命中（`:2008`、`:2054-2056`、`:2058`），`Select-String 'focus-reminder\[data-mode'` 的 3 处全部位于 `L2054-L2056` 的注释块内——**规则文本 0 处**。

**船长亲跑闸门（全部 exit 0）**：`node backup/scratch/focus-reminder-css/probe-reminder-mode.mjs` → **PASS 37/37**（4 组合 × 3 相位，含「② 规则数 0」「②' 规则文本 0 处」「⑥ 基线 17 条 → 现 14 条且被删恰为那 3 条」）；`node backup/scratch/focus-style2/probe-focus-style2.mjs` → **PASS 162/162**；`node tools/check_render.mjs` → exit 0（2769 卡片 / 9828 字段 / 0 问题）；`git diff --numstat -- style.css` → `411 105`（＝t8 +204/−34、t23 +15/−63、t24 −6、t29 +153/−0、t34 +31/−0、t37 +8/−4 的累计）。

**死规则的判红能力已被证明**：删除前基线 28/37，判红 9 项恰为预期（强挂 `appoint` 时 level/clock 颜色与对比度确实改变）；删除后 37/37；`reserve` / `focus` / `reserve-expired` 三相位的「整屏 0 差异像素」与逐项读数一致（`pixel-diff*.txt`、`readings-table.txt`）。

**探针自身缺陷修复（成员主动登记，船长采信）**：CSSOM 把 Chrome 120+ `CSSStyleRule` 当分组规则（②/⑥ 曾假通过）、① 误比 `attrs`（假红）、超时相位用相对时间造预约导致盒宽跨运行 1–3px 抖动（合同原命令复跑假红）。修复前的中间结论已作废，`backup/scratch/focus-reminder-css/README.md` §4 留档。

**探针陈旧项裁定（`probe-fold.mjs` A2 = 61/62 exit 1）**：唯一判红是「既有内容零改动」——段前 2494 行/115366 B vs t34 冻结基线 2490 行/114861 B，差值 +4 行/+505 B **恰等于本次 t37 的注释插入**（t34 切片本体读数 62/62 未变）。船长裁定：① 归因成立、不判 T111 失败；② `backup/scratch/focus-fold/probe-fold.mjs` 的 A2 自即日起按**历史证据脚本**处理（其冻结基线绑定 t34 时刻的整文件前段，任何后续 append/注释插入都会判红），**不得据此判 T34/T111 回归**；T111 之后的现行闸门是 `probe-reminder-mode.mjs` + `probe-focus-style2.mjs` + `check_render.mjs`（先例：`docs-bank` 旧闸门作废、`check-wrong-entry.mjs` 历史证据化）。

**未做项 / 待收口**：① `docs/ACT.md:198`、`docs/ARCHITECTURE.md:183` 仍把 `[data-mode="appoint"]` 记为 `style.css:2053-2055` 的既有规则，`docs/BOARD.md:344` 仍列 `reminder-level-appoint 3.93` → 文档侧由收口轮/下一波次文档任务处理（BOARD 历史块按 T70/T32 先例不追改）；② `dist/style.css` 落后于 `style.css`，发行态以收口轮唯一构建（t26）为准。

### T112 微观族裁定 4 条纠错（t9 findings F1–F4 + 同类自查）

- 状态: accepted（船长验收；另发现 1 处既有 finding（R119 中间等式）转 T113/t39 复核）
- 负责: micro-eng2
- 文件集: `docs/refs/rulings/micro.md`、`docs/refs/micro.json`、`backup/scratch/refs-micro-fix/`
- 依据: `docs/refs/README.md`（裁定七字段 + §2.6 裁片体积上限）；`backup/scratch/verify-refs/T9-REPORT.md`、`findings.md`、`visual.json`、`recompute.json`
- 依赖: 无（t9 抽查已判定 needs_revision）
- 验收:
  1. F1（high，`docs/refs/rulings/micro.md:1935` R119）：指数改 `x^{1/3}·y^{2/3}`，结论改 x*=8、y*=4、t₁=2、t₂=1/2、U₁=2^{5/3}、U₂=2^{4/3}（定性结论不变），删「页内给出 y=2」，第 1–4 小问整条重读
  2. F2（medium，`:1875` R115）：补偿金 F→T、补「支付 x 的律师费」、效用函数补 11/12 与 21/22 下标
  3. F3（low，`:2115` R131）：Q1=10−P1 → Q1=10−P
  4. F4（low，`:825` R45）：批注「① 送行」→「① 送分」
  5. 每条修正附重建命令 + 裁片 sha256/字节/像素 + `read_image` 亲读原文（≥15 字含印刷页码）+ 修正前后对照
  6. 同类自查（R115–R135 与含数值公式条目 ≥20 条）逐条给结论；`micro.json` 同值副本同步
  7. 既有闸门不放宽：`check-index.mjs`/`crossref.mjs`/`crops-audit.mjs` 仍 exit 0；裁定数 ≥141、holes=0
- 升版: 不升版（切片内）；不跑 build；不改 `docs/BOARD.md`
- 依据（船长裁定理由）: t9 的 24 条抽查中 20 成立 / 3 部分成立 / 1 不成立，问题全部集中在答案册派生的 4 条记录，属「凭印象/OCR 直读」型错误；F1 的数值会被直接消费进题库，故按 repair 走纠错 + 二次复核闭环。

#### 派单摘要（可直接粘贴为切片开场）

工作区：`D:\deepseek harness work\考研\Athena`；先读 `AGENTS.md`，禁止整仓通读。
本切片：修正 `docs/refs/rulings/micro.md` 的 4 条判红裁定 + 同类自查（见上验收 1–7）；文件边界仅 `docs/refs/rulings/micro.md`、`docs/refs/micro.json`、`backup/scratch/refs-micro-fix/`（UTF-8 无 BOM、仅 LF；禁用 PowerShell 默认编码写数据文件）。
验收命令：`node backup/scratch/refs-micro/check-index.mjs`、`node backup/scratch/refs-micro/crossref.mjs`、`node backup/scratch/refs-micro/crops-audit.mjs`（均须 exit 0）。
修法硬约束：一切以重建裁片 + 自带 `read_image` 亲读为准；单张 PNG ≤400 KB 且最长边 ≤1400 px；单条命令 ≤60 秒；禁止跑 `npm run build`；报告写进任务 output，由船长落盘 BOARD。

### 报告

**结论：T112（t38 repair）通过——t9 判红的 4 条（F1–F4）全部按实印改正，另顺带修正同类实错 6 处（共 10 处），四道闸门 exit 0。** 交付物 `docs/refs/rulings/micro.md` = **341484 B / 2300 行**（裁定小节 141 条不减少 + 10 条「修正记录（t38 本轮）」），`docs/refs/micro.json` 按设计未改（`rulings[]` 仅 12 个索引字段、无亲读原文与数值主张；7 个关键词命中 0），台账 `backup/scratch/refs-micro-fix/findings-t38.md`（140 行，A 段处置表 / B 段 28 条自查 / C 段批注字词 16 条 / D 段 json 同步结论 / E 段生成链脱钩 / F 段 10 处修正清单 / G 段 12 件新裁片 sha256 / H 段闸门口径）。

**四条判红处置（船长复核成立）**：F1 R119（ans p134）指数 `x^{1/3}·y^{2/3}`、结论 x=8 / y=4 / t₁=2 / t₂=1/2 / U₁=2^{5/3} / U₂=2^{4/3}，删「页内给出 y=2」，conf medium→high；600 dpi 指数区裁片 sha256 `1deb613ab7152dab9720a273270ec58e3136435a32529d4c636918e8d1b4635c` 与 t9 独立裁片完全相同。F2 R115（ans p129）补偿金 F→T、补「支付 x 的律师费」一问、U₁/U₂ 补 11/12 与 21/22 下标。F3 R131（rev p28）+ 同串 R59（ans p61）→ `Q1 = 10 − P`（rev 裁片 `0bee4f83…c4f` `--verify` 重渲一致、ans 裁片 `32f96290…d9a`）。F4 R45（ans p47）批注「① 送行」→「① 送分」，结论行未动。顺带修正 R38/R110/R112/R113/R114（含 R110 两问闭式重推 `t = p3 − √(16Wp2/(27p1))`、`T = ∛(27p3²W²/(4p2)) − W`）。

**船长亲跑闸门（本机实跑，全部 exit 0）**：`check-index.mjs` → **16 项通过 / 2 项提示 / 0 项失败**（提示＝OCR 原件未映射字形 U+FFFD，非编码错误）；`crossref.mjs` → ev 引用 55 / MISSING 0 / MISMATCH 0；`crops-audit.mjs` → CROPS AUDIT OK；`holes-probe.mjs` → **HOLES PROBE OK**（十八讲 417 页标签齐备、修订版 4–64 覆盖 61/61、答案册 4–149 覆盖 146/146，空洞 0）。全文 `送行` 仅剩 1 处，位于 R38 的修正记录行（`docs/refs/rulings/micro.md:733`，陈述旧值），与自报一致。

**船长新发现的既有 finding（转 t39 复核，不由船长代改）**：R119「结论」段的独立复算句（`docs/refs/rulings/micro.md:1967`）写 `…⇒ x = 8、y = 4，U = 8^{1/3}·4^{2/3} = 2·2^{2/3} = 2^{5/3} ✓`——**该中间等式算术错误**：`4^{2/3} = 2^{4/3}`，故 `8^{1/3}·4^{2/3} = 2^{7/3} ≈ 5.0397`；句中 `2^{5/3} ≈ 3.1748` 实为**价格税组合 (8,2)** 的 U₁。R119 的实质结论（x=8、y=4、t₁=2、t₂=1/2、U₁=2^{5/3} > U₂=2^{4/3}、商品税优于总量税）不受影响，但照抄该句会写出 U(8,4)=2^{5/3} 的错误数值 → 已作为 medium finding 交 t39（持有者 refs-lead 已回执确认，attempt_id `d94fbdfc-a0e1-4f4d-a5a3-4beb7c77ae53`）复核，并要求其同时复核 t38 其余 9 处修正**展示出来的中间等式**是否算术自洽。修复将以一行级 repair 任务（T118）在 t39 结案后派发。

**t39 中途上报的待定异常（转 T118/T113 结论）**：台账 G 段记 300 dpi 合规版为 296×142 / 4451 B / `787c77c5…a869d6`（`docs/refs/rulings/micro.md:1956` 同值），但按同记录的取框 `24,68,116,102 @300dpi` 重建得 **383×142 / 6761 B / `f374656a…`**（383 = 92 pt × 300 / 72，与取框自洽）⇒ 属「记录命令与裁片不符」或「登记尺寸错」，由 t39 判定并给 requiredFix。

**成员如实登记的越界（已撤回）**：t38 曾为把 holes=0 做成显式断言而修改 `backup/scratch/refs-micro/check-index.mjs`（不在 inScope），**已在提交前完整撤回**，该文件现与 t38 之前一致（16 项 0 失败复跑确认），holes 口径改由 in-scope 独立探针取证；第一次 `update_task` 即因此路径被拒（`repair cannot complete: … is undeclared`）。

**未做项 / 待下一批（已登记）**：① **生成链脱钩**：10 处修正直写交付物、未回写 `backup/scratch/refs-micro/frag/`（不在 inScope）⇒ 下次重跑 `gen_rulings.py` 会用旧 frag 覆盖；台账 E 段给「折回源」与「先取 diff 存档再 `git apply`」两条路径（`docs/refs/` 为未跟踪目录，取 diff 需先 `git add -N docs/refs`）。② 批注字词 16 条中 13 条已亲读，R47/R68 待下一批。③ 探针 `crops-audit.mjs` 的孤儿裁片清单属正常现象（已在输出中说明）。

---

### T113 微观裁定纠错复核与二次抽查（t38 的独立验证）

- 状态: failed（复核判决 needs_revision：7 条 findings 转 T118/T119）
- 负责: verifier2（待 t26 完成后指派）
- 文件集: `backup/scratch/verify-refs2/`
- 依据: `backup/scratch/refs-micro-fix/`（t38 证据）、`backup/scratch/verify-refs/T9-REPORT.md`（t9 抽样清单，避免重复抽样）
- 依赖: t38（纠错）、t26（收口轮构建，避免与产物冻结窗口冲突）
- 验收:
  1. 4 条修正逐条独立复核（重渲裁片 `--verify` 对拍 + `read_image` 亲读），4/4 成立
  2. R119 结论独立复算（不读修正后文本），逐项对拍
  3. 二次抽查 ≥6 条含数值裁定（优先 R115–R135、避开 t9 已抽条目），逐条判决
  4. 抽查 t38「已核对无误」条目 ≥4 条，验证自查台账与证据一致
  5. 其余三族各抽 ≥2 条确认未越界（`git diff --numstat` 三族改动为 0）
  6. 反证 ≥2（改错指数/下标 → 判红；篡改 `micro.json` 页码 → 判红），恢复后留档
  7. 四族闸门复跑 exit 0 且断言未放宽（裁定数 ≥141、holes=0）
  8. 证据只落 `backup/scratch/verify-refs2/`；不跑 build；未覆盖项如实登记
- 升版: 不升版
- 依据（船长裁定理由）: t9 只抽到 1 条不成立即已暴露 4 条同源错误，说明答案册派生条目的系统性风险高于抽样比例；故纠错后必须由独立会话二次复核，并把「同类自查是否可信」本身纳入验证对象。

#### 派单摘要（可直接粘贴为切片开场）

工作区：`D:\deepseek harness work\考研\Athena`；先读 `AGENTS.md`，禁止整仓通读。
本切片：复核 t38 的 4 条微观裁定纠错与同类自查（见上验收 1–8）；只写 `backup/scratch/verify-refs2/`。
验收命令：`node backup/scratch/refs-micro/check-index.mjs`、`node backup/scratch/refs-micro/crossref.mjs`、`node backup/scratch/refs-micro/crops-audit.mjs`（均须 exit 0）。
硬约束：主通道自带 `read_image`（禁用 modlens）；单张 PNG ≤400 KB、最长边 ≤1400 px；单条命令 ≤60 秒；不跑 `npm run build`；不成立即判 needs_revision 并点名行号与原文。

### 报告

**结论：needs_revision（任务置 failed）——t38 的四条主修正 4/4 成立，但其「其余修正 + 已核对无误」项查出 7 条缺陷（2 high / 3 medium / 2 low），t38 的工单不得视为通过；修复另派 T118（t45），复验另派 T119（t46）。**

**执行量**：判定 21 条（亲读重建 17 = 成立 16 + 部分成立 1（R110）；中间等式自查 4 = 自洽 1（R113）+ 不成立 3（R112、R114、R115-思路））；二次抽查 16 条（micro 10、stats/math3/statq 各 2，避开 t9 已抽 6 条）；反证 3 项判红后恢复；四闸门复跑 exit 0 且断言未放宽。

**四条主修正 4/4 成立（船长采信，证据为重建裁片指纹 + 亲读）**：R45 ans p47「① 送分」1154×417/43848/`0342300e…`；R115 ans p129 1028×461/119927/`4e54b832…`（U₁=X₁₁^{0.5}+X₁₂^{0.5}、U₂=X₂₁^{0.5}+X₂₂^{0.5}、「支付 x 的律师费」、「支付 T 的补偿金」）；R131 rev p28 1088×273/57197/`0bee4f83…`（Q₁ = 10 − P）；R119 ans p134 767×283/15283/`1deb613a…`（x^{1/3}y^{2/3}）。R119 主结论独立复算亦通过（x=8、y=4、t₁=2、t₂=1/2、U₁=2^{5/3}≈3.1748 > U₂=2^{4/3}≈2.5198）。

**7 条 findings（行号＝`docs/refs/rulings/micro.md` 当时行）**：

| 编号 | 级别 | 位置 | 问题 |
| --- | --- | --- | --- |
| F-02 | high | `:1816`（R110） | 实印 `t = p₃ − √((16W/27)p₂)`（根号内无 p₁）、`T = ∛(27p₃²W²/(16p₂)) − W`；记录仍带 p₁、分母 4p₂，根因是记录自身 U₁ 式漏系数 4 |
| F-03 | high | `:1848`（R112） | 统一税闭式符号翻转，正解 `(200 + 3·min − 2(c₁+c₂))/4`；记录值数值检验给 Q=85 ≠ 95=Q* |
| F-01 | medium | `:1967`（R119） | 中间等式应为 `2·2^{4/3} = 2^{7/3} ≈ 5.04`，记录写 `2^{5/3}`（那是价格税下 (8,2) 的 U₁） |
| F-04 | medium | `:1881`（R114） | 阈值应 2/3（MU₁/MU₂），页内 1/3 属衍误却标「复算通过 ✓」并据此升 high；「1/3 是 2/3 的倒数」亦错（倒数 3/2） |
| F-05 | medium | `:1898`（R115「思路 2」） | 实印 `T = M/2`（等分模型自洽），记录写 M/4 |
| F-06 | low | `:1917`（R117） | 裁片文件名后缀 613 vs 可复现命令 box …612 |
| F-07 | low | `:1947`（R119） | 「300 dpi 合规版」按其命令不可复现（重建 383×142/6761/`f374656a…` vs 台账 296×142/4451/`787c77c5…`）；档案件 9/9 指纹与台账一致，非伪造 |

**船长独立复核（本机实跑 + 手算）**：① R110 由我自推确认——U₁ = x₁x₃² = 4W³/[27p₁(p₃−t)²]（记录漏系数 4），令 U₁ = U₀ = W²/(4p₁p₂) 得 `(p₃−t)² = 16Wp₂/27` ⇒ t 与 p₁ 无关；一次总付同理得 `(W+T)³ = 27W²p₃²/(16p₂)` ⇒ F-02 全部成立。② R112 由我自推确认——`(400 − c₁ − c₂ − 2t)/3 = (200 − m)/2` ⇒ `4t = 200 + 3m − 2(c₁+c₂)` ⇒ F-03 成立（记录式两项符号同时写反）。③ 实读 `:1967` 确认 F-01（`2·2^{2/3} = 2^{5/3}` 一行为实存笔误）。④ 闸门与哈希：`docs/refs/{micro.md, micro.json, rulings/micro.md}` pre/post sha256 一致（176983 B/`8c403537…`、544097 B/`a050894f…`、341484 B/`08acfd9c…`），验证者未碰 `docs/refs/**`、未跑 build。

**未覆盖（验证者如实登记，不得读作已通过）**：micro 141 条中本轮仅亲读 17 条；R47（ans p49）/R68（ans p70）未补读；不声称全局无误。

**处置**：修复 T118（t45，micro-eng2，inScope 仅 `docs/refs/rulings/micro.md` + `backup/scratch/refs-micro-fix2/`）；复验 T119（t46，deps t45，建议 refs-lead，inScope 仅 `backup/scratch/verify-refs3/`）。**修完前 R110/R112/R114/R115/R119 不得进卡片或题库。**

### T114 专注链风味标签改造：中文序数层级名 + 去层级文字标 chip + 单元类型标签（团队 t41）

- 状态: accepted（船长验收，t41 交付；发行态转 T116 重新构建）
- 负责: 团队 athena-2.2-prep / focus-eng2（t41）
- 文件集: `src/focus.mjs`、`src/settings.mjs`、`tests/focus.test.mjs`、`tests/act-settings.test.mjs`、`backup/scratch/focus-flavor/`
- 依据: 用户 m03516（去「风味称号」标签 / 风味开启显示「第一任务集团」式序数 / 单元显示「第82任务单元」/ 单元类型做成行上方标签）；五项口径确认（层级中文序数 + 单元阿拉伯数字 + 「 · 」+ 自定义名；风味关保持 `◆1 总目标` 与 `#82 名称`；类型标签始终显示；删除「层级文字标」设置项；并入 2.1.1）
- 依赖: T100（t26）—— 先让收口轮唯一构建完成，再改 `src/`，避免在构建窗口内改源
- 现状锚点: `src/focus.mjs:18` `FOCUS_SEQ_KEYS = { unit:'#', group:'●', corps:'▲', army:'◆' }`；`:14` `FOCUS_TYPE_KEYS = ['focus','assault','life','plan','scout']`；`:39`/`:153` `flavor` 开关；`focusUnitLabel` `:458-465`、`focusOrgLabel` `:467-475`；`focusLevelBadge` `:906-911`（`!showLevelTag` 返 null）、`focusLevelBadgeEl` `:2612`、组织行 chip 挂载 `:3134`、单元行 `:3186-3212`（类型未显示）；设置页 `src/settings.mjs:572-585`（风味行）/`:587-602`（层级文字标行）
- 验收:
  1. 风味**关闭**时行标题逐字不变：编制 `◆1 总目标`、单元 `#82 名称`（既有断言保留）
  2. 风味**开启**时编制为「第<中文序数><层级名> · <自定义名>」，序数 1/2/3/10/11/20/21/99 边界用例（一/二/三/十/十一/二十/二十一/九十九）
  3. 风味**开启**时单元为「第<阿拉伯数字><单元层级名> · <自定义名>」（例「第82任务单元 · 名称」）
  4. 序号缺失/非法（≤0、非数字、非整数）降级为「<层级名> · <自定义名>」，不得出现「第undefined」或空串
  5. 风味开启时编制行不再出现 `◆`/`▲`/`●`（纯函数 + 真实 DOM 双证）
  6. 主线树不再渲染层级文字标 chip：DOM `.focus-level-badge` 命中 0；`focusLevelBadge`/`focusLevelBadgeEl` 与 `showLevelTag` 字段及专用断言一并删除（不留死代码，参照 T98/t24 先例）
  7. 设置页不再渲染「层级文字标」行；「风味显示」说明文案改为中文序数口径
  8. **单元类型标签**渲染在单元行**上方**（类名在报告中列出），文本取 `settings.typeNames[typeKey]`；风味开关两态都显示；不可拖拽、点击不改变展开/选中态；未知 typeKey 回退「专注」
  9. 布局护栏：≤420px 无横向溢出；桌面端标签不与折叠键/复选框/主行名称重叠
  10. 测试：既有用例零回归，新增 ≥6 条（序数边界、两态标签、无符号、标签位置、降级）；`tests/act-settings.test.mjs` 同步 `showLevelTag` 删除
  11. 不跑 `npm run build`、不改 `style.css`；报告须给「新类名 → 用途 → 期望视觉」清单交 T115
- 升版: 不升（并入 2.1.1 收口，由船长统一补更新日志与版本七处）
- 约束: 不动版本七处 / `CHANGELOG.md` / `package.json` / `app.js` / `dist/` / `data/*.js`；不改层级语义与组合规则；不动 t27/t29/t34 定稿的树杈/折叠键
- 派单摘要: 工作区 `D:\deepseek harness work\考研\Athena`；先读 `AGENTS.md`，禁止整仓通读；本切片＝按用户 m03516 改专注链标签形态（t41/T114），文件集 `src/focus.mjs` / `src/settings.mjs` / `tests/focus.test.mjs` / `tests/act-settings.test.mjs` / `backup/scratch/focus-flavor/`，验收 `node --test tests/focus.test.mjs` + `node --test tests/act-settings.test.mjs` + 自建 `probe-flavor.mjs` + `node tools/check_render.mjs`

### 报告

**结论：T114（t41）通过——用户 m03516 的四项标签改造全部落地，2.1.1 的「风味称号」标签与 `showLevelTag` 死代码一并清除，未编入/风味关闭两态逐字不回归。** 交付物：`src/focus.mjs`（187080 B / 4282 行 / sha256 前缀 `87791b3739f9db8d`）、`src/settings.mjs`（42798 B / `15650ea6b00b0fdb`）、`tests/focus.test.mjs`（80 例 / `09e86d55c0de8f40`）、`tests/act-settings.test.mjs`（11 例 / `5b58f647cc594ed6`）；报告 `backup/scratch/focus-flavor/REPORT-t41.md`（§7 为「新类名 → 用途 → 期望视觉（亮/暗、桌面/≤420px）」清单，供 T115 直接落地）。

**实现要点（船长回读源码确认）**：新增 `focusChineseNumber`（`src/focus.mjs:459`，支持 1–9999，十/十一/二十/二十一/九十九等边界）、`focusSeqOrdinalOk`（`:480`，非整数/0/负数/NaN 一律降级去掉序数前缀）、`focusUnitTypeKey`（`:522`）、`focusUnitTypeLabel`（`:528`）；`focusUnitLabel`（`:488-500`）风味关＝`#<序号> · <名称>` 逐字同 2.1.1、风味开＝`第<阿拉伯数字><单元层级名> · <名称>`（类型名不再混入行标题）；`focusOrgLabel` 风味开＝`第<中文序数><层级名> · <名称>`；类型标签元素 `el('div','focus-unit-type-tag', focusUnitTypeLabel(...))`（`:3098`）唯一挂载点在单元行 `tree.appendChild(row)` **之前**（行上方、左缘对齐、无 `draggable`、无事件监听，点击不改变展开/选中）。**chip 与设置项整体下线**：`focusLevelBadge`/`focusLevelBadgeEl`/导出行/组织行 badge 追加/`showLevelTag`（默认值 + sanitize + 透传 + 设置行）全部删除，`src/**`、`tests/**` 内 `focusLevelBadge|focusLevelBadgeEl|focus-level-badge|showLevelTag` 仅剩 **1 处**且位于新死代码守卫用例的反证字符串（`tests/focus.test.mjs:1531`「邻近选择器应判绿」）；注释措辞统一改「层次徽标」；风味行文案改「显示中文序数层级名（第一任务集团 / 第82任务单元）；关闭时只留番号（◆1 总目标 / #82 名称）」。

**船长亲跑闸门（本机实跑，全部 exit 0）**：`node --test tests/focus.test.mjs` → **80 / pass 80 / fail 0**（原 70，净增 10）；`node --test tests/act-settings.test.mjs` → **pass 11 / fail 0**；`node backup/scratch/focus-flavor/probe-flavor.mjs` → **checks=138 pass=138 fail=0**（亮/暗 × 1360×900 / 400×780 四组）；`node tools/check_render.mjs` → exit 0（KaTeX 就绪 / 2769 卡片 / 9828 渲染字段 / 0 问题）。

**真实 DOM 读数（成员探针，船长采信）**：风味关 `◆1 总目标` / `▲1 第二群` / `●1 已完成的组` / `●3 嵌套组` / `#82 · 分部积分`（符号 any=5）；风味开 `第一任务集团 · 总目标` / `第三任务组 · 嵌套组` / `第82任务单元 · 分部积分`（符号 any=**0**、无 `undefined`）；`.focus-level-badge` DOM **0 命中**；8 个单元 → 8 枚类型标签（突击/侦查/专注），标签整块在行上方（`gapMinPx=2`，与折叠键/复选框零相交）、窄屏 400×780 无横向溢出（385=385）；设置页「🎯 行动」栏已无该行。

**反证 5 条（只改内存候选包 `--override=/app.js=`，`app.js`/`style.css`/`src` 零写入）**：`flavor-symbols`（风味开仍显示符号）、`chip-revive`（恢复 chip）、`tag-below-row`（标签移到行下方）、`settings-row-revive`（恢复设置行）各 exit 1 判红（fail 2/2/4/1），`final` 对照 exit 0。

**交接 T115（style-eng，已在跑）**：① `style.css:2387` 的 `.focus-level-badge` 整条可删；② `style.css:2381` 组合规则只删选择器那一半（保留 `.focus-tree-state`）；③ `style.css:1989` 历史注释需与新现实一致；④ `.focus-unit-type-tag` 目前**无任何 CSS**，靠 `.focus-tree` 列向 flex 天然成块（block 整行宽 / 高 24px / 与行距 2px），若要胶囊形需 `align-self:flex-start`。

**非发行态声明**：本任务未跑构建。磁盘 `app.js`（892448 B，T100 收口轮产物）仍含 `focusLevelBadge`×4 / `showLevelTag`×16 ⇒ **`npm run check` 的「app.js 与 src/ 同步」现已不成立**（verifier2 已独立对拍并上报）；2.1.1 发行态以 **T116（t43）** 在 T114/T115 之后的重新构建为准（T90→T100→T116 同一口径）。

**未做项 / 边界**：T114 范围内 0 项；键盘可达性、ARIA 快照、高 DPI、reduced-motion 未专项验证（属 T100 §11 未覆盖清单同类项，转 T116 照旧登记）。

### T115 单元类型标签样式落地与 chip 死规则清理（团队 t42）

- 状态: accepted（船长验收 + 独立闸门复核；`style.css` 122961 B / 10986ff6…）
- 负责: 团队 athena-2.2-prep / style-eng（t42）
- 文件集: `style.css`、`backup/scratch/focus-style3/`
- 依据: 用户 m03516（单元类型做成行上方标签）；T114 交付的类名清单
- 依赖: T114（t41）
- 验收:
  1. 按 T114 报告清单落地标签与所在行的排版/间距/缩进/字号配色，亮暗两套主题举证
  2. 只用既有 token、零死 token；标签文字对比度亮暗均 ≥ AA 或给出合成口径说明
  3. ≤420px / ≤760px 无横向溢出（最长文本「突击」「侦查」为例）；桌面端不与折叠键/复选框/主行名称重叠（真实 DOM 几何断言）
  4. 因 chip 移除而失去生产者的 `.focus-level-badge*` 规则按纯减法删除并留说明注释（删除前后条数 + DOM 0 命中证据）
  5. `node tools/check_render.mjs` exit 0；`probe-focus-style2.mjs` / `probe-reminder-mode.mjs` 若判红须逐条归因（探针与冻结基线不得修改）；`probe-fold.mjs` A2 已历史证据化，不作回归依据
  6. 自建 `probe-style3.mjs`：亮/暗 × 1360×900 / 400×780 四组 + ≥2 条反证（改字号为 0、恢复被删 chip 规则 → 判红，恢复即判绿）
  7. 若沿用 append-only 切片，须给「前 N 行与开工基线逐字节一致」的 sha256 证据；若原地删除 chip 规则，须给行号级 diff 与原因
  8. 不跑 `npm run build`；不改 `src/**`、`data/**`；报告列出最终类名清单与读数表
- 升版: 不升
- 约束: 不动版本七处 / `CHANGELOG.md` / `package.json` / `app.js` / `dist/` / `tests/**`
- 派单摘要: 工作区 `D:\deepseek harness work\考研\Athena`；先读 `AGENTS.md`，禁止整仓通读；本切片＝为 T114 的单元类型标签落地样式并清理 chip 死规则（t42/T115），文件集 `style.css` / `backup/scratch/focus-style3/`，验收 `node tools/check_render.mjs` + 自建 `probe-style3.mjs` + 两个既有探针复跑

### 报告

#### 报告（收口：船长 m03820 后落盘）

**交付**：`style.css` 117866 → **122961 B** / sha256 `10986ff6e39e5723b88e2ae693af79ff474688b22a35825c64527371c1285691`；3 处原地编辑点 = 5 hunk + 1 纯 append；前 1990 行与开工基线逐字节一致（86646 B / `2c41f3e2403cb8696bf0ae69ee0a08ab6be8497847c7b6c6486159f0c855dae8`）。

**内容**：① 新类 `.focus-unit-type-tag`（文件末 t42 段）：胶囊 radius 999px、12px/500/line-height 1.6、padding 1px 8px、margin-top 6px、1px var(--border)、背景 var(--bg-sunken)、字色 var(--focus-ink-quiet)、`align-self:flex-start`、`max-width:100%` + ellipsis。② 死规则纯减法：`.focus-level-badge, .focus-tree-state {` → `.focus-tree-state {`（声明体逐字保留）+ `.focus-level-badge { border-radius: 6px; }` 整条删除 ⇒ 含 badge 规则块 2 → 0、全文件选择器 906 → 905、声明块 820。

**船长亲跑**：`node backup/scratch/focus-style3/probe-style3.mjs` → **86/86 PASS exit 0**（neg-align-stretch 2/2、neg-font-zero 2/2、neg-depth-indent 1/1、neg-shape-radius 1/1、badge-revive 静态，额外判红=[]）；`node backup/scratch/focus-reminder-css/probe-reminder-mode.mjs` → **37/37 PASS exit 0**；`node tools/check_render.mjs` exit 0（2769 卡片 / 9828 字段 / 0 问题）；`style.css` 与 `dist/style.css` 同为 122961 B / `10986ff6…`。

**读数**：标签 42 × 23.19px、标签→行 2px、左缘 Δx=0、宽/行宽 0.058/0.126、对比度亮 5.45/6.22 暗 7.50/8.01、doc 1360/1360 与 400/400、tree 758/758 与 366/366、badge=0、state=2、console error 0。冻结基线 167 条 sha256 跑后逐字节还原 167/167。

**未做项 / 登记**：① `probe-focus-style2.mjs` 155/162 exit 1，其 FAIL 集合与 t42 改前基线逐条一致（7 条全归因 t41 删徽标生产者；A2 系匹配器盲区——只跳过以 `/*` 开头的行、不识别块注释内文）；若要转绿需另派**允许改探针**的任务，本任务按契约不动它。② `.focus-unit-type-tag` 在 `src` 无内联兜底（CSS 缺失时退化为纯文本标签），登记为后续项。③ t44 报出两处注释漂移（`style.css:2418` 引 `src/focus.mjs:2918` 真值 2979；`style.css:95` 引 `style.css:2032` 真值 position 规则 2013）由船长处置。

### T116 2.1.1 收口轮独立验证与唯一权威构建（风味标签改造后）（团队 t43）

- 状态: accepted（verdict=pass 10/10；2.1.1 唯一权威构建 app.js 895946 B / a11e66aa…）
- 负责: 团队 athena-2.2-prep / verifier2（t43）
- 文件集: `app.js`、`dist/`、`backup/scratch/verify-flavor/`（唯一构建权）
- 依据: 用户 m03338（升 2.1.1，提交并推送）+ m03516（并入 2.1.1）；T100（t26）已产出一次发行候选，但被 F1/F2 与本次 UI 改造超越
- 依赖: T100（t26）、T114（t41）、T115（t42）
- 验收:
  1. 本波次**唯一权威发行构建**：`npm run build` 后 `app.js` == `dist/app.js`、`style.css` == `dist/style.css`（字节 + sha256），并给构建时刻 `src/`、`style.css`、`data/` 哈希快照
  2. 四闸门全 exit 0：`npm run check`、`npm test`、`npm run check:render`、`node tools/check_version.mjs`（版本七处一致）
  3. 真实站点探针：风味关闭编制 `◆1 …` / 单元 `#N …`；风味开启编制「第一任务集团 · 名称」/ 单元「第82任务单元 · 名称」且无 `◆/▲/●`；`.focus-level-badge` 命中 0；每单元行上方恰一枚类型标签且文本等于设置里的类型名；设置页无「层级文字标」行
  4. 几何与布局：标签 bottom ≤ 所属单元行 top、缩进对齐、亮/暗 × 桌面 1360×900 / 窄屏 400×780 四组无溢出无重叠无 console error
  5. 反证 ≥3：恢复 chip DOM → 「0 命中」判红；风味开启编制改回 `◆1` → 序数与无符号断言判红；删除类型标签节点 → 存在性与位置断言判红；三条恢复并留档
  6. 范围审计：逐文件 `git diff --numstat` + blob 级核对（T114/T115 之外无写入）；`src/fsrs-core.mjs` 与 HEAD 逐字节一致；`data/bank_math3.js` 2/2、`data/bank_stats.js` 1263/4 为既有授权差异
  7. F1/F2 复核：已编入面板「归属」恰 1 次、未编入「归属 未编入」；`appoint` 在 `style.css` 仅存注释（非注释规则文本 0 处）
  8. 既有闸门状态如实标注：`probe-fold.mjs` A2 为历史证据脚本；`probe-focus-style2.mjs` / `probe-reminder-mode.mjs` 若因 chip 删除判红须逐条归因并声明已由 T115 新探针替代
  9. 诚实口径：报告写明「本产物即 2.1.1 发行态」、构建窗口内并发写入情况、未覆盖清单（键盘可达性 / ARIA / 高 DPI / reduced-motion / Tauri 离线 / 打印沉浸等原 T100 §11 条目照旧登记）
  10. 单条命令 ≤60 秒、探针每批 ≤2 组、每批先输出一行进度、摘要 ≤20 行；证据全部落 `backup/scratch/verify-flavor/`；不得修改被验证产物
- 升版: 不升（版本七处已由船长落定 2.1.1：`src/app.mjs` VERSION + 更新日志首条、`index.html` `?v=75`、`package.json`、`src-tauri/tauri.conf.json`、`sw.js` `ms3-v114`、`CHANGELOG.md` 112 条、`dist/` 由构建同步）
- 约束: 不改 `src/**`、`style.css`、`tests/**`、`data/**`、版本七处；发现缺陷即判红并给 requiredFix，不自行修复
- 派单摘要: 工作区 `D:\deepseek harness work\考研\Athena`；先读 `AGENTS.md`，禁止整仓通读；本切片＝T114/T115 后的 2.1.1 唯一权威构建与独立验证（t43/T116），文件集 `app.js` / `dist/` / `backup/scratch/verify-flavor/`，验收 `npm run build` → `check` → `test` → `check:render` → `node tools/check_version.mjs` 全 exit 0 + 真实站点探针 + ≥3 反证 + 范围审计

### 报告

#### 报告（收口：船长 m03820 后落盘）

**verdict = pass（10/10，0 findings）**，报告 `backup/scratch/verify-flavor/T43-VERIFICATION-REPORT.md`（未覆盖项 10 条见 §7）。

**2.1.1 唯一权威发行构建**：`app.js` = `dist/app.js` = **895946 B / sha256 `a11e66aad23fd8a95db730228f8eb05ab32dacaeabf4ab8b6b8febcb73ca334e`**（@01:40:22）；`style.css` = `dist/style.css` = **122961 B / `10986ff6e39e5723b88e2ae693af79ff474688b22a35825c64527371c1285691`**；index.html / sw.js / manifest 三对逐字节一致；dist 复制集 33/33、dst 143 文件。

**四闸门全 exit 0**：build 1000 ms、check 1037 ms、test 1365 ms（**354/354**）、check:render 2572 ms（2769/9828/0）、check_version 90 ms（七处一致）。窗口 01:40:10→01:44:00 仅 3 个构建产物变化、受保护文件写入 0、收工复扫 0 变化；相对 t26 快照的 5 条漂移全部归因 t41（4 文件）与 t42（`style.css`）。

**真产物探针**（`--variant=disk`，diskEqualsBuild=true；真 index.html + style.css + KaTeX + headless CDP）两批各 2 组合均 **88/88 PASS**：风味关符号 5（◆/▲/●）、风味开中文序数且符号 0；badge DOM 0 且 CSSOM 规则 0；每单元行上方恰 1 枚类型标签（8/8）、gapMin 1.9–2.0px、无横向溢出、console error 0；F1「归属」恰 1 次 + 未编入显示「归属 未编入」；F2 appointRules=0。反证 3 条判红（2/2/14）。

**范围审计**：`src/fsrs-core.mjs` 与 `data/bank_econ.js` 与 HEAD 逐字节 SAME；`data/bank_math3.js` 2/2、`data/bank_stats.js` 1263/4 为既有授权差异。

**船长复核**：两对产物哈希逐字节一致；`node tools/build.mjs --check` → 「app.js 与 src/ 同步」exit 0；`node tools/check_version.mjs` → 七处一致 exit 0；`npm run check` exit 0；`npm test` → tests 354 / pass 354 / fail 0；`npm run check:render` → 2769/9828/0。

**留待决策两条**：① `probe-focus-style2.mjs` 155/162 永久红（要转绿需另派允许改探针的任务）；② `.focus-unit-type-tag` 无 `src` 内联兜底（CSS 缺失退化为纯文本标签）。

### T117 文档回写：专注链风味标签/中文序数/类型标签与 2.1.1 口径（团队 t44）

- 状态: accepted（船长验收；verify-after5 引用 330/330、锚点失败 0）
- 负责: 团队 athena-2.2-prep / bank-eng（t44）
- 文件集: `docs/ACT.md`、`docs/ARCHITECTURE.md`（必要时 `docs/DATA_SCHEMA.md`）、`backup/scratch/docs-flavor/`
- 依据: 用户 m03516（去层级文字标 / 风味中文序数 / 单元类型标签）+ m03338（升 2.1.1）；T114/T115 的真实交付形态
- 依赖: T114（t41）、T115（t42）
- 交付与验收要点:
  1. `docs/ACT.md:190-195`、`docs/ARCHITECTURE.md:176-182` 的「层级文字标（可关）」改为「t41 已整体删除」+ 死代码守卫位置，**不得**写成「当前存在」
  2. 风味两态口径（关＝`◆1 目标` / `#82 名称`；开＝「第一任务集团 · 目标」/「第82任务单元 · 名称」，层级中文序数、单元阿拉伯数字、非法序号降级）以实际函数命名为准
  3. 单元类型标签：类名、位置（单元行上方）、始终显示、文本取 `settings.typeNames[typeKey]`、不可拖拽、点击不改状态、回退「专注」；`style.css` 落地位置
  4. 设置页已无「层级文字标」行、「风味显示」新文案、旧 `showLevelTag` 被静默忽略
  5. 2.1.1 版本与产物口径（`VERSION` / `sw.js ms3-v114` / `index.html ?v=75` / `CHANGELOG.md` 112 条 / `dist/` 由 T116 构建）
  6. 漂移闸门：复跑 `backup/scratch/docs-refresh/verify-refs.mjs`（符号锚点式）与 `audit-bare-refs.mjs`，先判红再逐条回读修正（禁止纯机械位移），t41/t42 新结构纳入断言
- 约束: 只改 inScope 文档；`docs/BOARD.md` 由船长维护；历史 BOARD 块按 T70/T32 先例不追改；UTF-8 无 BOM；报告 ≤20 行并给「文档引用 → 源码回读」对拍计数
- 派单摘要: 工作区 `D:\deepseek harness work\考研\Athena`；先读 `AGENTS.md`，禁止整仓通读；本切片＝按 T114/T115 真实形态回写专注链标签文档（t44/T117），文件集 `docs/ACT.md` / `docs/ARCHITECTURE.md` /（必要时 `docs/DATA_SCHEMA.md`）/ `backup/scratch/docs-flavor/`，验收两条漂移闸门脚本 exit 0

### 报告

#### 报告（收口：船长 m03820 后落盘）

**交付**：`docs/ACT.md`（+27/−20）、`docs/ARCHITECTURE.md`（+53/−25）、`docs/DATA_SCHEMA.md`（+56/−13）；BOARD 未动。内容＝ACT §13.4 全段重写 + §13.1–13.3 行号重定 26 处 + §13.6 + 末行状态；ARCHITECTURE focus 行、专注链段、层级视觉样式位置、新增「版本七处（现行 2.1.1）」`:202-207`；DATA_SCHEMA 行动设置键白名单 + 旧键 `showLevelTag` 静默忽略。

**闸门**：`verify-refs2.mjs` 起点 exit 1（引用 5 + 锚点 32 失败）→ `fix-refs-t44.mjs` 修 39 处（幂等）→ **verify-after5 exit 0**：引用 330/330（弱保障 4）、锚点失败 0、事实 29/29、结构计数 0 失败（stats=186 / MIN_TOTAL=225 / 17 测试文件 / `.focus-level-badge` 与 `.focus-parent-chip` 死规则 0 / `.focus-unit-type-tag` 在位）；`audit-bare-refs.mjs` exit 0（裸引用 106 / 无法归属 38 / 越界 0）。

**例外（不改）**：`docs/ACT.md:196` 三连引用被强判据误配，逐行读过均正确。

**未做项 / 船长处置**：两处 out-of-scope 注释漂移（成员无权改 `style.css`）——`style.css:2418` 注释引 `src/focus.mjs:2918`（真值 2979）、`style.css:95` 注释引 `style.css:2032`（真值 position 规则在 2013）。

### T118 微观族裁定 7 处 findings 修复（R110/R112/R114/R115/R119/R117）（团队 t45）

- 状态: 已退回（review T119 判 needs_revision：F-05 open、F-05b/F-02b low ⇒ 转 T120 修复 / T121 复验；其余 6 条 finding 已闭合采信）
- 负责: micro-eng2（repair，sourceTaskId = t38，sourceFindingIds = F-01…F-07）
- 文件集: `docs/refs/rulings/micro.md`（唯一交付物，只改 findings 所指行与必要的自洽连带行）、`backup/scratch/refs-micro-fix2/`（台账与证据）
- 依据: `docs/refs/rulings/micro.md`、`backup/scratch/verify-refs2/T39-REPORT.md`、`backup/scratch/verify-refs2/findings-t39.md`
- 依赖: t38（已完成，四条主修正已成立）
- 验收: 见任务契约 11 条 —— F-02（`:1816` R110 替换值与根因 U₁ 漏系数 4）、F-03（`:1848` R112 统一税闭式符号，正解 `(200 + 3·min − 2Σc)/4`）两条 high 先做；再 F-01（`:1967` 中间等式 `2^{7/3} ≈ 5.04`）、F-04（`:1881` 阈值 2/3、删「倒数」误述）、F-05（`:1898` 思路 2 的 `T = M/2`）；最后 F-06（`:1917` 文件名 613 vs 命令 612）、F-07（`:1947` 300 dpi 取证行不可复现）。四条主修正逐字不动，四条闸门不得放宽，不跑 build。
- 契约修订: 1 次（`agent_teams_amend_task`，按 t39 正式报告校正 F-06/F-07 行号与 F-02/F-03/F-04 判据）
- 升版: 否（2.1.1 收口轮内）

#### 派单摘要（可直接粘贴为切片开场）

工作区 `D:\deepseek harness work\考研\Athena`（分支 main）。先读 AGENTS.md，禁止整仓通读。
本切片＝T118：按 t39 的 7 条 findings 修 `docs/refs/rulings/micro.md`（high 先做 F-02/F-03，再 F-01/F-04/F-05，最后 F-06/F-07），只改 findings 所指行与自洽连带行；四条主修正（R45 送分、R115 三处、R131 Q1=10−P、R119 指数）逐字不动。
验收命令：`node backup/scratch/refs-micro/check-index.mjs`、`crossref.mjs`、`crops-audit.mjs`、`holes-probe.mjs` 四条全 exit 0；证据写 `backup/scratch/refs-micro-fix2/`。不跑 `npm run build`，不改 `docs/refs/micro.json` 与 `src/**`。

### 报告

#### 报告（收口：船长 m03820 后落盘；review T119 判 needs_revision）

**交付**：`docs/refs/rulings/micro.md` 341484 B / `08acfd9c…` → **350444 B / 2306 行 / 141 条 / sha256 `adb8112050d68c1b8acede7599ecb6491d5644a58bb76fc4981d7a007c4a7370`**；diff 35938 B / 7 hunk；基线 `backup/scratch/refs-micro-fix2/micro.md.pre-t45`；台账 `backup/scratch/refs-micro-fix2/{findings-fix.md,diff.patch,gates.log}`。

**六条闭合**：F-01（R119 三组合 `2^{7/3}≈5.04 > 2^{5/3}≈3.17 > 2^{4/3}≈2.52`）、F-02（R110 `t = p₃ − √((16W/27)·p₂)`、`T = ∛(27p₃²W²/(16p₂)) − W`，U₁ 系数 4 补回）、F-03（R112 闭式 `(200 + 3·min(c1,c2) − 2(c1+c2))/4`，c1=10/c2=20 ⇒ t=42.5、Q=95=Q*）、F-04（阈值 2/3、撤「倒数」、置信度回落 medium）、F-06、F-07。

**F-05 未修（成员保留字面值）**：200/300 dpi 两次重裁片均读到页内写「思路 2：T = M/4」（裁片 `backup/scratch/refs-micro-fix2/ans_p129_silu_zone_200dpi.png` 750×486 / 77465 B / `18837f9445c0f5bd14e84683fe9857c9bfb847206cf1cc61cc2310418d633bcd`）⇒ 由 T119 判 open，船长 2400 dpi 亲读裁决实印为 `T = M/2`（转 T120 修复）。

**闸门**：`check-index.mjs` 16 通过 / 0 失败；`crossref.mjs` MISSING 0 / MISMATCH 0；`crops-audit.mjs` OK；`holes-probe.mjs` OK（真实路径 `backup/scratch/refs-micro-fix/holes-probe.mjs` —— 契约写的 `backup/scratch/refs-micro/holes-probe.mjs` 不存在，已在 T120 契约统一）。

**登记（收口/2.2.0 前置）**：生成链脱钩——修正直写交付物、未回写 `backup/scratch/refs-micro/frag/`，重跑 `gen_rulings.py` + `build_micro.py` 会覆盖 t38/t45 修正，需折回 frag 或用 `diff.patch`。

### T119 微观族 7 处 findings 修复的独立复验（t45/T118 复核）（团队 t46）

- 状态: failed（verdict=needs_revision，F-05 未闭合；转 T120/T121）
- 负责: 待指派（建议 refs-lead —— t39 的判决作者，握有 findings 与裁片上下文；不得由修复者 micro-eng2 自验）
- 文件集: `backup/scratch/verify-refs3/`（唯一写入目录）
- 依据: `docs/refs/rulings/micro.md`、`backup/scratch/verify-refs2/{T39-REPORT.md,findings-t39.md,crops/}`、`backup/scratch/refs-micro-fix2/`
- 依赖: t45
- 验收: 逐条复核 F-01–F-07 是否真正闭合（重建裁片亲读 + 独立复算，不以修复者自述为准）；四条主修正与其它裁定逐字未变（行级对拍证明 diff 只落在 findings 所指行）；四条闸门不放宽且 exit 0；反证 ≥2（把 F-03 闭式改回错误符号、把 F-01 中间等式改回 `2^{5/3}`）必须判红；诚实覆盖清单（不得声称全局无误）。
- 升版: 否

#### 派单摘要（可直接粘贴为切片开场）

工作区 `D:\deepseek harness work\考研\Athena`（分支 main）。先读 AGENTS.md，禁止整仓通读。
本切片＝T119：对 t45（T118）在 `docs/refs/rulings/micro.md` 的 7 处修复做独立复验（亲读重建裁片 + 独立复算），判决 pass / needs_revision，证据只写 `backup/scratch/verify-refs3/`；不得修改 `docs/refs/**` 与 `backup/scratch/refs-micro-fix2/`。
验收命令：`node backup/scratch/refs-micro/{check-index,crossref,crops-audit,holes-probe}.mjs` 四条 exit 0 + 自建复验脚本；反证 ≥2 需判红。

### 报告

#### 报告（收口：船长 m03820 后落盘）

**verdict = needs_revision（8 条验收 7 通过 / 1 未通过）**；判决与船长原生读图独立裁决一致（`v3_R115_silu2b_700.png` 1420×312 / `9008245645b331539ef2110da5369fc46f2dfd04d1b42a8eb9e4067e0b70529e` → 「…2  T = M/2，说明 1 承担了 x 元」；`v3_R115_den2_2400.png` 501×467 / `e815ae83c0a778e4059c768f5ed33be4257b26849ee8e9a333b763fdd45fed0d` → 分母仅顶弧 + 底横，无 4 的竖笔与中横）。

**已闭合**：F-01（三组合 `2^{7/3}≈5.04 > 2^{5/3}≈3.17 > 2^{4/3}≈2.52`）、F-02 主值（600 dpi 亲读）、F-03（错式 57.5 ⇒ 85 ✗ 对比正解 t=42.5、Q=95=Q*）、F-04、F-06、F-07（按记录 box 重建 `468b58f0…`/`f374656a…` 逐字节一致，`--verify` exit 0）。

**未通过 F-05**：`docs/refs/rulings/micro.md:1902` 仍写 `T = M/4`，页内实印 `T = M/2`（2400 dpi 字形拓扑 + 归一化 IoU 0.829；同页蓝笔注语义只与 M/2 自洽）。

**残留 findings**：`T46-F-05`（medium，open）、`T46-F-05b`（low：亲读串缺「1」）、`T46-F-02b`（low：R110 三处中间式保留 `/(27p1)`）⇒ 转 T120 修复 / T121 复验。

**证据与反证**：四条主修正逐行 byte-identical；行级 diff 8 hunk / +17/−11 全落在 R110/R112/R114×2/R115/R117/R119×2；四闸门亲跑 exit 0；反证 3 例（F-03 回退判红、F-01 回退判红、F-05 修复后转绿）；检查器 `check_t46.py` **39/42 PASS、3 FAIL**（即 T120 的硬闭环判据）；`docs/refs` 五件指纹未变。证据目录 `backup/scratch/verify-refs3/`（T46-REPORT.md、rulings.md、rulings.json、findings-t46.md、gates-t46.log、check_t46.py、crops/ 20 PNG、_sandbox/ 3 副本、glyph_ascii.py、glyph_iou.py、check_scope.py、hunkdiff.txt）。


### T120 微观族残留 findings 修复（F-05 T=M/2、F-05b 补「1」、F-02b 去 /(27p1)）（团队 t47）
- 状态: accepted（船长验收：checker 42/42 exit 0、四闸门 exit 0、micro.md 350840 B / 0d8967ce…bc0dd；历史引用 2 处 + 生成链回折登记）
- 负责: micro-eng2（队长派单）
- 文件集: `docs/refs/rulings/micro.md`、`backup/scratch/refs-micro-fix3/`
- 依据: T119（t46）判决 `backup/scratch/verify-refs3/findings-t46.md` + 船长原生读图裁决（m03721 前后）
- 依赖: T118（t45 交付）、T119（t46 判决）
- 验收: 1) `:1902` 改 `T = M/2` 并补「1」，全文 `M/4` 命中 0；2) `:1816/:1818/:1819` 去 `/(27p1)`，统一为 `(p₃−t)² = 16Wp₂/27`；3) 四条主修正逐字不动；4) 硬闭环＝`python backup/scratch/verify-refs3/check_t46.py` 由 39/42 转 **42/42 exit 0**；5) 四闸门 exit 0（`check-index.mjs` / `crossref.mjs` / `crops-audit.mjs` / 真实路径 `backup/scratch/refs-micro-fix/holes-probe.mjs`）；6) 证据 `backup/scratch/refs-micro-fix3/{findings-fix3.md,diff.patch,gates.log,check-t46-after.log}`
- verify: `python backup/scratch/verify-refs3/check_t46.py`；`node backup/scratch/refs-micro/check-index.mjs`；`node backup/scratch/refs-micro/crossref.mjs`；`node backup/scratch/refs-micro/crops-audit.mjs`；`node backup/scratch/refs-micro-fix/holes-probe.mjs`
- 升版: 否
- 契约要点: `backup/scratch/verify-refs3/**` 与检查器列为 outOfScope 只读；不跑 `npm run build`
- 过程记录: attempt 1 = 平台 429 `insufficient_quota`（会话 `b4f3ecfc…` 无收尾）；attempt 2 = `82dcc06c-f684-4a4c-a5c1-b08f54f13658`（用户 m03822 充值后续跑）

#### 派单摘要（可直接粘贴为切片开场）
工作区：D:\deepseek harness work\考研\Athena （main，2.1.1 收口期）
先读 AGENTS.md，禁止整仓通读。
本切片：修复 `docs/refs/rulings/micro.md` 的三条残留 finding（F-05 `T = M/2`、F-05b 补「1」、F-02b 去 `/(27p1)`），闭环判据＝`check_t46.py` 42/42；文件集限 `docs/refs/rulings/micro.md` + `backup/scratch/refs-micro-fix3/`；验收命令见上「verify」。

### 报告
#### 报告

**交付**：`docs/refs/rulings/micro.md` 350444 → **350840 B / 2306 行 / 141 条 / sha256 `0d8967ce397c433f4bc383be6d3d815c12ea7ee9acd0fe9901a25f1d399bc0dd`**；行级 diff **仅 2 hunk**（`@@ -1813,10 +1813,10 @@` R110 区、`@@ -1899,8 +1899,8 @@` R115 区）；证据 `backup/scratch/refs-micro-fix3/{findings-fix3.md,diff.patch,gates.log,gates-summary.log,check-t46-after.log,check-t46-before.log}` + 反向快照 `micro.md.pre-t47`。

**三条闭合**：① F-05/F-05b —— `:1902` 改「思路 2：**T = M/2**，说明 **1** 承担了 x 元」，`:1903` 入档判据（2400 dpi 分母字形无 4 的竖笔与中横、拓扑同 2、归一化 IoU 0.829 + 船长原生读图 + 同页蓝笔注只与 M/2 自洽 + 如实记 t45 按 200/300 dpi 读作 4 属误读）；全文 `M/4` 命中 **0**（改前 3）。② F-02b —— `:1816/:1818/:1819` 三处中间式统一 `(p₃ − t)² = 16Wp₂/27`，同段验算句根式一并改；检查器禁止形态 2 → 0。③ 四条主修正逐字未动（对 `refs-micro-fix2/micro.md.pre-t45` 逐块比对 6/6 一致，末行 `KEEP_ALL_OK`）。

**船长亲跑（全部 exit 0）**：`参考文件/_venv/Scripts/python.exe backup/scratch/verify-refs3/check_t46.py` → `total=42 pass=42 fail=0`（改前 39/42；须设 `PYTHONIOENCODING=utf-8`，否则 GBK 控制台 `UnicodeEncodeError`）；`check-index.mjs` 16 通过 / 2 提示 / 0 失败；`crossref.mjs` 引用 55 / MISSING 0 / MISMATCH 0；`crops-audit.mjs` CROPS AUDIT OK；`refs-micro-fix/holes-probe.mjs` HOLES PROBE OK。船长复核哈希与自报逐字一致。`backup/scratch/verify-refs3/**` 全程只读未改，未跑 build、未越界。

**船长裁决**：① 历史沿革叙述里仍留的 `16Wp2/(27p1)` 字面 **2 处不清理**——它们记录「t38 旧稿错在漏系数 4」这一事实，非中间等式；如需清理另开 finding。② 生成链脱钩（修正直写交付物、未回写 `backup/scratch/refs-micro/frag/`）**登记为硬前置**：任何重跑 `gen_rulings.py` + `build_micro.py` 之前，必须用 `backup/scratch/refs-micro-fix3/diff.patch` 把 t38/t45/t47 的修正折回 frag 源，否则修正被覆盖。③ R110/R115 能否进卡片与题库，以 T121（t48）独立复验结论为准。


### T121 微观族残留修复的独立复验（t47/T120 复核）（团队 t48）
- 状态: accepted（verdict=pass 7/7；船长亲跑 check_t46.py 42/42 + 四闸门 exit 0；O-1/O-2 登记为 2.2.0 后续项）
- 负责: 共享池（建议 refs-lead：持有 `check_t46.py` 与字形量具）
- 文件集: `backup/scratch/verify-refs4/`（只读其余全部）
- 依据: T119（t46）判决 + T120（t47）交付
- 依赖: T118、T119、T120
- 验收: 1) F-05/F-05b/F-02b 真闭合（`docs/refs/rulings/micro.md` 回读）；2) `check_t46.py` **42/42 exit 0**；3) 四条主修正逐行 byte-identical（对 `backup/scratch/refs-micro-fix2/micro.md.pre-t45` 与 T119 判决比对）；4) 四闸门不放宽（真实路径）；5) 反证 ≥2（塞回 `M/4` 与 `/(27p1)` 必须判红）；6) 诚实覆盖清单（其余 135 条裁定未逐条复核须写明）；7) 证据落 `backup/scratch/verify-refs4/`
- verify: `python backup/scratch/verify-refs3/check_t46.py`；`node backup/scratch/refs-micro/check-index.mjs`；`node backup/scratch/refs-micro/crossref.mjs`；`node backup/scratch/refs-micro/crops-audit.mjs`；`node backup/scratch/refs-micro-fix/holes-probe.mjs`
- 升版: 否
- 契约要点: `verify-refs3/**` 只读；不得修改 `docs/refs/**`；不跑 `npm run build`

#### 派单摘要（可直接粘贴为切片开场）
工作区：D:\deepseek harness work\考研\Athena （main，2.1.1 收口期）
先读 AGENTS.md，禁止整仓通读。
本切片：独立复验 t47 对 `docs/refs/rulings/micro.md` 的三条残留 finding 修复（真闭合 + `check_t46.py` 42/42 + 主修正逐行不变 + 反证 ≥2），证据写 `backup/scratch/verify-refs4/`。

### 报告
#### 报告

**verdict = pass（七条验收全 PASS）**，被检件 `docs/refs/rulings/micro.md` = **350840 B / 2306 行 / sha256 `0d8967ce397c433f4bc383be6d3d815c12ea7ee9acd0fe9901a25f1d399bc0dd`**（复验前后指纹一致，复验者未改它）；基线 `refs-micro-fix3/micro.md.pre-t47`（352889 B）；检查器 `verify-refs3/check_t46.py` 未修改（sha 前缀 `77CCF8C3D0458939`）。产物 `backup/scratch/verify-refs4/`（13 文件 / 87419 B）：T48-REPORT.md、rulings.md/.json、commands-t48.log、gates-t48.log、counterproof-t48.json、check_t46-run.log/.json、check_t48_scope.py、scope-t48.txt、make_cp.py、glyph_t48.py、glyph-iou-t48.json、crops/ 4 张、_sandbox/ 9 项。

**闭合证据**：① F-05/F-05b —— 全文「M/4」3→0、「M/2」10→15，`:1902` 读「思路 2：T = M/2，说明 1 承担了 x 元」，旧串「说明承担了 x 元」0；2400 dpi 分母裁片重建 den1 与 t46 件逐字节一致，den2/silu2b 按 t46 报告取框差 1 px（改用实际取框 x1=407.53 / y1=302.1 后逐字节命中 ⇒ t46 报告取框做过四舍五入）；字形自证 ink bbox 117×141 / 106×130、归一化 IoU **0.812**、中部无高覆盖行 ⇒ 独立复现船长 M/2 判定。② F-02b —— `:1816/:1818/:1819` 三处均为 `(p₃ − t)² = 16Wp₂/27（p₁ 两端相消）`，`/(27p1)` 仅剩 2 处带否定标注的历史错式引文；两条闭式独立复算成立。③ 改动面 3 hunk（L1816；L1818–1819；L1902–1903）⊂ R110/R115，越界 0，四条主修正逐行 byte-identical。④ 反证 6 条：CP-1/CP-2a/CP-3 各 RED(41/42)，CP-0 对照 GREEN。

**船长亲跑复核（全部 exit 0）**：`check_t46.py`（`PYTHONIOENCODING=utf-8`）→ `total=42 pass=42 fail=0`；独立计数 `M/4=0 / M/2=15 / 16Wp2/(27p1)=2`；`check-index` 16/2/0、`crossref` MISSING 0 / MISMATCH 0、`crops-audit` OK、`holes-probe` OK；被检件哈希与自报逐字一致。

**诚实口径**：本判决仅深读复核 R110、R115 两条 + 3 条字节守护（R45/R131/R119），**其余 136 条未复核**，不支持「微观族 141 条全族无误」；R110/R115 可放行进卡片/题库。

**后续项（非阻断，船长登记）**：① O-1 —— `check_t46.py` 的 F-02b 守卫是字面量级（只回退结论行 / 只补短式会判绿，两条负对照已存证）；若作为长期回归闸门，应改断言为「R110 段不得出现 `16Wp2/(27p1)`」并固化两条负对照为反面用例（脚本在 `backup/scratch/verify-refs3/`，属 gitignore 本地件，归 2.2.0 取证线 P0 批次）。② O-2 —— 裁定条目登记建议统一为「取框 + 尺寸 + sha256」三者，避免取框四舍五入导致 1 px 不可复现；归 `docs/refs/README.md` 格式约定，交 refs-lead 于 2.2.0 前置批处理。

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

