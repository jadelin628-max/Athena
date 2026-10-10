# DATA_SCHEMA — 内容与学习库结构

> 写卡、改科、动 DB 字段前读本文。事实源：`data/*.js` 的 return 形状 + `src/store.mjs` 的 `defaultCard` / `defaultWrongCard` / `normalizeDB`。渲染写法见文末；算法与内容范围见 `AGENTS.md`。

## 学科模块形状（`data/<file>.js`）

每个文件注册 `window.SUBJECTS.<id> = (function () { … return {…} })();`。

### return 字段

| 字段 | 必需 | 类型 | 含义 |
|---|---|---|---|
| `id` | 是 | string | 学科 id，如 `py` / `math3` |
| `name` | 是 | string | 全名 |
| `short` | 是 | string | 短名（选择器） |
| `icon` | 是 | string | emoji 图标 |
| `group` | 是 | `'acad' \| 'skill' \| 'lang' \| 'hobby'` | 主页分组 |
| `kind` | 否 | `'formula' \| 'qa'`（默认 formula） | 公式科 vs 背诵科 UI |
| `CATS` | 是 | `{ [catKey]: 显示名 }` | 章节 |
| `DATA` | 是 | Card[] | 知识卡 |
| `META` | 是 | `{ [id]: [importance 1-5, 检索短语] }` | 每张 DATA 卡必须有 |
| `ORDER` | 是 | string[] | 章节推荐顺序（catKey） |
| `REL` | 否 | `{ [id]: {to, tag}[] }` | 关联；tag 常用 `同类/对比/相关/前置/延伸/应用` |
| `EXAMPLE` | 否 | `{ [id]: Ex \| Ex[] }` | 真题例题（仅 formula 类有） |
| `PITFALL` | 否 | `{ [id]: string }` | 陷阱短文 |
| `MNEM` | 否 | `{ [id]: string }` | 记忆口诀 |
| `HELP` | 否 | `{ id, title, body }[]` | 帮助栏文章（**不**进学习队列） |
| `SENTENCES` | 否 | 语言每日一句 | 仅 lang 科 |
| `BEGINNER` | 否 | string[] | 初学者模式默认章（catKey） |

`check_data` 强制：`META` 覆盖每张 `DATA` 卡；`REL`/`EXAMPLE`/`PITFALL`/`MNEM` 的 key 与 `to` 必须存在；`cat` 必须在 `CATS`。

### Card（`F(id, cat, title, front, back)`）

| 字段 | 含义 |
|---|---|
| `id` | 科内唯一，风格如 `ba01` / `lim09`（2–4 字母 + 数字） |
| `cat` | `CATS` 的 key |
| `title` | 卡片标题 |
| `front` | 正面问题（主动回忆提示） |
| `back` | 背面答案 |

可选：`archived: true`（重构归档，不参与展示与调度）。

### Ex（例题）

```js
{ q, a, src, a2? }
// q 题干 / a 解析 / src「2025 年数三真题」/ a2 另一解
// EXAMPLE[id] 可以是单个 Ex 或 Ex[]
```

**仅真实真题**；无真题不配例题；一道真题可跨卡复用。

### 文件头惯例

- 大文件用 `const R = String.raw` + `R\`…\`` 写含反斜杠/TeX 的正文。
- 工厂：`const F = (id, cat, title, front, back) => ({ id, cat, title, front, back });`
- `index.html` 与 `tools/check_data.mjs` 的 `FILES` 列表都登记了全部数据文件——**新增学科要改两处**。

当前 25 科 id：`math3 econ stats politics corp inv music poem py mon fsa sishu acct clang cppl java js rust ai social jp kr fr es wujing`。

## 题库数据（`data/bank_*.js` · `window.BANK`）

题库是**独立于学科数据**的第二套静态内容（POC 首批 47 题 → t19 逐题溯源审计后 45 题：修正 28 题、移除 2 题因题源标注不实/文字层不可还原，详见 `backup/scratch/bank-audit/audit.md`；t27 经 `read_image` 视觉转写补入 2023/2024/2025 三年 9 道选择题（54 题，见 `backup/scratch/bank-vision/audit-vision.md`）；t30 订正 2023 第 1/2 题、补入 2025 第 3 题 → **现行 55 题**，见 `backup/scratch/bank-fix2/t30-report.md`、复核 `backup/scratch/verify-vision2/t31-report.md`）：`data/bank_math3.js` / `data/bank_econ.js` / `data/bank_stats.js`，各自写入 `window.BANK.<subj>`（与 `window.SUBJECTS.<id>` 并列，互不污染）。读取方是 `src/bank.mjs`；加载与预缓存要**两处同改**：`index.html` 的 `data/bank_*.js` 段（`index.html:131-133`，紧跟各科数据、在 `app.js` 之前）与 `sw.js:41-43`。

### 顶层形状

`window.BANK.<subj> = { id, name, subjectId, sourceNote, types[], questions[] }`

| 字段 | 必需 | 类型 | 含义 |
|---|---|---|---|
| `id` | 是 | string | 必须等于文件名里的 `<subj>`（`bank_math3.js` → `math3`），`check_data` 强制 |
| `name` | 是 | string | 全名，如 `考研数学三` |
| `subjectId` | 是 | string | 对应的 `window.SUBJECTS` 科 id（知识点标签反查用） |
| `sourceNote` | 是 | string | 题源说明（取自哪几本真题册/解析册、文字层可读性、未入库年份及原因） |
| `types` | 是 | Type[] | 题型字典，非空 |
| `questions` | 是 | Question[] | 真题，非空 |

当前三科口径（t32 落定后实测，`node backup/scratch/bank-cv/print-stats.mjs`）：合计 **225 题** —— `math3` **24 题 / 12 题型**（2012、2013、2019、2023、2024、2025；题型分布 `evalAns` 4 · `econ` 3 · `linalg` 3 · `ode` 3 · `deriv` 2 · `eigen` 2 · `integral` 2 · `dblint`/`estimate`/`limit`/`proof`/`series` 各 1；其中 `integral`（积分与变限积分）与 `series`（级数敛散性判别，t30 新增）为 t27/t30 补题带出的新题型键；库内难度 2★×4 / 3★×9 / 4★×9 / 5★×2，14 题带 `options`（选择题）、10 题不带）；`econ` 15 题 / 6 题型（2016–2020；`externality` 3 · `intertemporal` 3 · `oligopoly` 3 · `consumer` 2 · `frontier` 2 · `market` 2；3★×2 / 4★×9 / 5★×4）；`stats` **186 题 / 11 题型**（手写 16 + **卡片派生 170**；题型分布 `estimate` 38 · `testing` 28 · `dist` 24 · `regress` 23 · `numchar` 17 · `multi` 15 · `sampdist` 13 · `prob` 11 · `limit` 8 · `chi` 5 · `corr` 4；难度 3★×25 / 4★×97 / 5★×64；年份 2001–2026）。**math3 / econ 目前仍是手写题**（卡片例题入库待统计试点通过独立验证后再铺开）；统计的 170 条卡片派生题来自 `data/stats.js` 的 `EXAMPLE`，见下「卡片派生题」。

### Type（题型）

`{ key, name, def, judge, sample }`——`key` 科内唯一（`check_data` 强制），且必须被至少一道题命中；`def` 定义 / `judge` 判据 / `sample` 示例题号（如 `2013-Q1`）。**题型频率（自带五星）不写进数据**：由题库模块按库内实际频次统计（`bankTypeStars`：占比 ≥0.18 → 5★、≥0.13 → 4★、否则 3★）。

### Question（每题）

| 字段 | 必需 | 含义 |
|---|---|---|
| `id` | 是 | 科内唯一。手写真题风格 `<科前缀>-<年>-<序>`，如 `m3-2019-12` / `ec-2016-1` / `st-2016-1`（t19 移除了 `m3-2019-6`、`m3-2019-13`，勿再复用这两个 id）；卡片派生题风格 `cv-st-<卡片 id>[-<序>]`，如 `cv-st-pb01`、`cv-st-pb01-2`（同卡第二条例题）——`cv-` 前缀保证跨科重名安全且与手写真题形态零相撞 |
| `origin?` | 否 | `'year'`（缺省，手写真题）或 `'card'`（卡片派生题，见下）。`check_data` 校验枚举；缺省一律按 `'year'` 处理 ⇒ 既有手写题零改动 |
| `year` / `no` | 是 | 年份 / 题号（如 `二(13)`）；卡片派生题的 `no` 形如 `卡片 pb01`（同卡第二条例题 `卡片 pb01-2`），`year` 由该例题 `src` 里的四位年份解析而来——**解析不出年份的例题不入库**（不许编造） |
| `type` | 是 | 必须是本文件 `types[].key`（`check_data` 强制） |
| `tags` | 是 | 知识点标签，**只放「现有知识点的 id」**——名字与自带难度在运行时由 `src/bank.mjs` 从 `window.SUBJECTS.<subjectId>` 反查，不复制、不改写知识点数据 |
| `star` | 是 | 库内难度 1–5 整数（**不是**知识点自带五星） |
| `stem` | 是 | 题干（LaTeX；源 PDF 文字层残损处按题号与解析上下文复原，依据写在 `src.note`，不虚构条件与结论） |
| `options?` | 否 | 选择题选项——**选择题恰 4 项、填空/解答题不得有选项**，由 `tests/bank.test.mjs` 按期望答案表逐题断言（见「校验归属」）。数据里**只存选项文本**：界面上的 `(A)`–`(D)` 前缀、答案区「答案：X」标识与正确项 `.is-answer` 全部由 `answer` 运行时派生（见下「选择题的字母与答案标识」） |
| `answer` | 是 | 答案与解析 |
| `altAnswer?` | 否 | 另一解（卡片派生题专用）：来源卡片例题带 `a2` 时原样写入，**不另立题目、也不并入 `answer`**；界面上渲染为独立「另解」块（`div.bank-alt-answer`） |
| `traps` | 条件必需 | 陷阱。`origin !== 'card'` 时必填；卡片派生题允许缺省（来源卡片的 `PITFALL` 无条目时**整个字段省略**，不得写空串、不得编造） |
| `hint` | 条件必需 | 提示，口径同 `traps`（来源为 `MNEM`） |
| `school` | 是 | 题源院校/科目（t19 起），取自来源册的题块标题、**不得猜测或泛指**，且必须含 `year` 四位数字——如 `北京大学光华-431 金融学统计 2016 年`、`全国硕士研究生入学统一考试-数学三 2012 年`（数学三 2019 / 2023 / 2024 / 2025 年题为 `全国硕士研究生招生考试-数学三 …`，2012 / 2013 年题为 `全国硕士研究生入学统一考试-数学三 …`）。卡片派生题把例题 `src` 原文里的年份移到尾部（`2026 复旦大学 432 统计学真题` → `复旦大学 432 统计学真题 2026 年`），以保持「来源简称＝去掉尾部年份的前缀」这一既有口径。`check_data` 强制非空 + 与 `year` 一致 + 与 `src.file` 同源（规则表见下）；另有**题源一致性**校验：同一 `(subjectId, year, 规范化 school)` 组里不得出现两种原始写法（先规范化全角/空白/连接符/「入学统一考试」↔「招生考试」等变体再分组），同年同卷只允许一种写法——2025 数学三曾有两种写法，t21 已按试题册封面统一为「招生考试」；t32 起统计学科同一年真实存在多份不同来源的卷子（2016 年 9 种），它们规范化后互不相同，属合法形态 |
| `src` | 是 | 出处，`origin === 'card'` 时为 `{ card, note }`（`card` = 来源卡片 id，必须属本学科真实卡片池；`note` 记例题 `src` 原文与缺失字段说明），否则为 `{ file, page, no, note }`——真题出处，`file` 与 `no` 必填（**仅真实真题**，无真题不入库）；`page` 为来源 txt/PDF 页号，`note` 记录文字层残损处的复原依据 |

`school` 的渲染口径：题库徽标「院校 · 年度 · 题号」由 `src/bank.mjs` 的 `bankSchoolLabel(q)` 产出——`q.school`（`trim()` 后非空）→ 兜底 `q.subjectLabel` → `BANK_SUBJECT_META[subject].label` → `q.subject`；`school` 字符串本身已含年份，徽标随后仍单列 `year · no`（如 `…-数学三 2012 年` + `2012 · 一(1)`）。

### 年份/卷筛选的取值编码（t14 起）

状态键是 `src/learn.mjs:528` 的 `bankYear`（`''` = 全部；只存三种形态：`''` / 裸年份 / `年份|来源`），选项与匹配都在 `src/bank.mjs` 的纯函数里，数据文件不存任何筛选态：

- **该年只有一种来源** → 值就是**裸年份**（如 `'2013'`，但统计 2013 年已有 3 种来源故实为 `'2013|…'`），选项文案「2013 年 · 8 题」。
- **该年有多种来源** → 值是 `'<年份>|<完整 school>'`，选项文案用来源简称：`bankYearSourceLabel`（`src/bank.mjs:379`）去掉尾部年份，故显示「2016 年 · 复旦大学 432 统计学真题 · 5 题」。**t32 起统计学科多来源年成为常态**（卡片派生题带入 72 个来源串，13 个年份有多份来源，最多 2021 年 9 种），math3 / econ 仍是单来源年；两种编码都由 `tests/bank.test.mjs` 的年份/来源口径用例逐项对拍。
- 派生：`bankYearOptions`（`:418`）从题目聚合出选项（聚合器 `bankYearRows`，`:388`，年份降序 / 同年来源升序），首项恒为 `{ value: 'all', label: '全部年份' }`；匹配走 `bankYearSelected`（`:369`，含 `|` 时年份 + 来源双匹配）。
- 切换与复位：选项点击派发 `handleAction('bankFilter', 'year=' + v)`（动作分支 `src/actions.mjs:176`，`'all'` 写入 `''`）；切科后残留的旧年份不在新学科选项里 → `bankNormalizeYearFilter`（`:438`，`bankListPage` 在 `:632` 调用）渲染前自愈回全选态；`bankReset`（`:220`）与 `resetSessionState`（`src/learn.mjs:536`，题库四键复位在 `:543`）一并复位。

### 选择题的字母与答案标识（界面派生、不落盘）

- 字母来自 `bankChoiceLetter(q)`（`src/bank.mjs:494`）对 `answer` 的三条正则（`BANK_CHOICE_RES`，`:493`：`选 X` / `答案[：:] X` / 括号 `(X)`），与 `tests/bank.test.mjs` 期望表护栏的 `letterOf()`（`:364`）同口径；解析不出返回 `null`，界面**不渲染空标识**（无 `options` 的题也不显示）。
- `data/bank_*.js` 里没有任何字母字段：字母一律运行时派生，改题只需改 `answer` 散文，护栏用例会同时校验字母与填空/解答题的结论锚点。
- 渲染结构：选项 `div.bank-option[data-option-letter]`（`span.bank-option-letter` 纯文本 `(A)` + `span.bank-option-text` 经 KaTeX），命中答案字母的那项加 `.is-answer`；答案区额外一行 `div.bank-answer-letter[data-answer-letter]`「答案：X」。CSS 由 `style.css` 的 `.bank-option-letter` / `.bank-option-text` / `.bank-option.is-answer` / `.bank-answer-letter` 承担。

### 卡片派生题（`origin: 'card'`，t32 起统计试点）

来源是学科数据文件里卡片所附的例题：`data/stats.js` 的 `EXAMPLE`（键＝卡片 `DATA[].id`，值可能是**单条目对象**也可能是**条目数组**，必须判型展平）、`PITFALL`（陷阱）与 `MNEM`（提示）。映射规则：

| 题库字段 | 来源 | 实测（stats 试点） |
|---|---|---|
| `id` | `cv-st-<卡片 id>[-<序>]`（同卡多条例题加序号） | 170 条入库，id 与卡片一一可回溯 |
| `stem` / `answer` | `EXAMPLE[cardId].q` / `.a` 原样 | 空值 0 |
| `altAnswer?` | `EXAMPLE[cardId].a2`（存在才写） | 12 条 |
| `tags` | `[cardId]`（**码 space**，不复制 `META` 的中文标签名） | 全部单元素 |
| `star` | `META[cardId][0]`（1–5） | `META` 199 张全齐，无缺口 |
| `traps?` / `hint?` | `PITFALL[cardId]` / `MNEM[cardId]`，**无条目就整个字段省略**（不写空串、不编造） | 33 / 7 条（二者都有 5 条） |
| `year` | 该条例题 `src` 文本里的四位年份 | 170 条全部解析成功 |
| `school` | 例题 `src` 原文（来源以原 `src` 为准，仅做空白/连接符规范化，不改年份与卷名），年份移到尾部 | 72 个来源串，跨 18 个年份 |
| `no` | `卡片 <cardId>[-<序>]` | — |
| `src` | `{ card, note }`（`note` 含例题 `src` 原文 + `traps`/`hint` 缺失说明） | 溯源主体 |

- **排除清单**（不许编造年份/来源）：`EXAMPLE` 166 键展平 177 条中，**7 条无四位年份**（`pb06`/`pb07`/`rv10`/`rv11`/`nc07`/`nc09`/`ll04`，`src` 均为「考研数学真题（…）」）→ 不入库，逐条登记在 `backup/scratch/bank-cv/excluded.md`。
- **生成通道**（唯一可复算入口）：`node backup/scratch/bank-cv/build-bank-cv.mjs`（干跑打印计划）/ `--write`（落盘）。脚本只重写 `data/bank_stats.js` 里 `// ==== BEGIN/END GENERATED card-questions (t32) ====` 哨兵块内的 `TYPES`/`DATA` 增量与 `sourceNote`，哨兵块外的手写内容（文件头注释、手写 16 题）原样保留；连跑两次 sha256 相同（幂等）。对拍脚本 `check-card-questions.mjs` 从 `data/stats.js` 现算期望值并与入库结果逐字段比对。
- **题型归类**：按卡片 `cat` 映射（`prob` 11 · `dist` 24 · `multi` 15 · `numchar` 17 · `limit` 8 为 t32 新增键，各 ≥5 题；`corr`/`sampdist`/`estimate`/`testing`/`chi`/`regress` 复用既有键，其中「列联表/拟合优度/卡方/独立性检验」类标题归 `chi`；`numchar` 里标题含「相关」的归 `corr`（其余仍是数值特征）。
- **界面口径**：缺 `traps`/`hint`/`altAnswer` 的题在详情页**整段跳过**（标题与正文一起省略，不渲染空行或 `undefined`）；缺 `year`/`no` 的题跳过「年度 · 题号」徽标；`altAnswer` 渲染为独立「另解」块；年份徽标与列表排序对缺 `year` 的题不误判（`tests/bank.test.mjs` 的「缺省字段渲染契约」用例锁定）。

## 学习库 DB（每科一份）

`localStorage['<subjId>_formula_srs_v1']`，顶层：

```js
{
  schemaVersion: 1,
  cards: { [cardId]: CardState },   // 内置+自建知识卡调度
  settings: { … },
  log: { … },
  wrongs: { [wid]: WrongCard },
  custom: { [cid]: CustomCard },
  cardOverrides: { [cardId]: Override },  // 编辑/隐藏内置卡
  customRel: { [cid]: { to, tag }[] },
  updatedAt: number
}
```

### CardState（`defaultCard`）

| 字段 | 含义 |
|---|---|
| `reps` | 复习次数 |
| `ivl` | 当前间隔（天） |
| `due` | 下次到期（epoch ms） |
| `lapses` | 遗忘次数 |
| `state` | `'new' \| 'learning' \| 'relearning' \| 'review'` |
| `grad` / `step` | 学习步进进度 |
| `diff` | FSRS 难度 D（1–10），算法维护值；**与自测筛选用的「知识卡难度标签 ★1–★5」不是同一维度**（后者取自卡片 `META` 星标，t19 起自测只按星标筛，D 既不参与筛选也不在界面展示） |
| `stab` | FSRS 稳定度 S（天） |
| `fsrsInit` | 0/1，是否已初始化 D/S |
| `notes` | 用户笔记 |
| `hist` | `[{ t, m, ivl? }]` 趋势点 |
| `lastR` | 最近评分时刻（跨端合并选边键） |
| `ivlR` | 与 lastR 配套的间隔侧写 |

### WrongCard（`defaultWrongCard`）

与 CardState **同构的调度字段**（`reps/ivl/due/lapses/state/grad/step/diff/stab/fsrsInit/hist/lastR/ivlR`），**无** `notes`。内容字段：

| 字段 | 含义 |
|---|---|
| `kind` | 固定 `'错题'`（`难题` 已废除） |
| `q` / `a` / `a2` | 题干 / 解析 / 另一解 |
| `src` | 来源 |
| `linked` | 关联知识卡 id 数组 |
| `linkedMastery` | **关联知识点联动开关**：`1` 开（错题评分影响关联知识卡掌握度）/ `0` 关（只走错题卡自身调度）。默认 `1`；`sanitizeWrongCard` 只在显式 `=== 0` 时保留 0，其余一律收敛为 1——**旧数据缺字段按 1 处理**（历史得降级行为不回滚，新评分按新规则） |
| `errType` | 错误类型标签 |
| `lastSolveMs` | 上次重做用时 |

`linkedMastery = 0` 目前只有一处自动写入：例题入错题（`wrong.mjs` 的 `markAsWrong`）——例题只进错题本、只按自身调度复习，不再改动关联知识点；手动录入的错题（`saveWrongInput`）保持默认 `1`，行为与既往一致。降级调用点在 `demoteLinked(w, rating)`（`r <= 1` 时触发），三道早退：`linkedMastery === 0`、无 `linked` 关联、`rating > 1`。云同步与导入导出**整卡透传**，不做字段级改写。

### settings

| 字段 | 默认 | 含义 |
|---|---|---|
| `dailyNew` | 10 | 每日新卡上限（0=暂停） |
| `targetS` | 90 | 毕业目标稳定度（天） |
| `targetLinkExam` | true | 与考试日挂钩 |
| `fdr` | 0.9 | 期望保留率（0.80–0.98） |
| `goalTitle` | `'考研'` | 倒计时目标名 |
| `bareRecall` | false | 裸回忆（隐藏分类徽标） |
| `beginner` | — | `{ on: boolean, cats: catKey[], sid?: string }` 初学者模式与勾选章节；`sid` 为配置归属学科，切科/导入时用 `resolveBeginner` 对齐当前科 CATS（过期键自愈，跨科残留丢弃） |
| `quizCfg` | `{ cards: {…}, wrong: {…} }` | **自测配置**，按来源分开存（知识卡 / 错题）。每份 `{ count, cats, diff, mastery }`，缺省 `{ count: 10, cats: [], diff: [1, 5], mastery: [0, 100] }`：`count` 取整夹 1–50；`cats` 只保留非空字符串并去重（分类白名单属学科层知识，store 层不校验，读取侧 `quizSanitizeConfig` 会用当前科 `CATS` 再净化一次）；**`diff` 是知识卡难度标签 ★1–★5 的区间**（t19 起，不再是 FSRS 记忆难度 D）：写入侧夹 1–5（`src/quiz.mjs:247-248` 的 `QUIZ_DIFF_MIN`/`QUIZ_DIFF_MAX`，缺省 `QUIZ_DEFAULT_DIFF = 3` 见 `:251`），读取/导入侧 `src/store.mjs:296-301`/`:305-323` 同样夹 1–5 并按 `storedQuizRange(…, 1, 5, [1, 5])` 补齐——**旧档按新上界夹取迁移**（`[1, 10]` → `[1, 5]`、`[3, 7]` → `[3, 5]`），`normalizeDB` 与 `importDB` 共用同一净化器、结果一致；`mastery` 夹 0–100，区间逆序自动交换。形状由 `storeQuizCfg` / `storeQuizCfgOne` 定义 |

`targetH` 已迁移为 `targetS`（勿再写入）。

### log

| 字段 | 含义 |
|---|---|
| `counts` | `{ [YYYY-MM-DD]: { n, r, w, intro, q } }`：n 新学 / r 复习 / w 错题重做 / intro 当日引入新卡数 / **q 当日自测题数**（与 n/r/w/a 同层，由 `quizSaveRecord` 累加本场 `total`） |
| `revlogs` | 评分日志数组（FSRS 训练地基，上限 4 万裁最旧；只增） |
| `quiz` | **自测记录数组**（`quizSaveRecord` 写入；上限 200 条、超出裁最旧。写入侧常量是 `src/quiz.mjs` 的 `QUIZ_MAX_RECORDS`，读取/导入侧是 `src/store.mjs` 的 `STORED_QUIZ_MAX_RECORDS`，云同步侧是 `src/sync.mjs` 的 `SYNC_QUIZ_MAX`——三处同值 200，改一处必须三处同改）。单条见下 |
| `daily` | 每日计数（`{ [date]: number }`） |
| `studyTime` | `{ [date]: 毫秒 }` 前台学习时长（**不是分钟**；展示时 `/60000`） |
| `detail` | 逐日逐卡计数 |
| `checkins` | 打卡日 |
| `mastery` / `metrics` | 当日快照 |
| `newIntro` | `{ ids: string[] }` **已引入新卡并集**（非「今日」；今日引入数在 `counts[date].intro`） |

`revlogs` 单条（`pushRevlog`）：`{ t, cid, r, st, ivl, k }`——时间戳 / 卡 id / 评分 1–4 / 评分前状态编码（new=0, learning=1, review=2, relearning=3）/ 本次间隔 / 类型 `k`：知识卡 `'k'`、错题重做 `'w'`。对齐 FSRS 优化器复习日志。

`quiz` 单条（`quizSaveRecord`）：`{ t, mode, total, correct, pct, ms, msAvg, predicted, gap, verdict, byCat, weak, queued, diff, mastery, cats }`——本场开始时刻 / 来源 `'cards' | 'wrong'` / 题数 / 答对 / 正确率 % / 总用时 ms / 每题均时 / 预测掌握度 % / 差距 `pct - predicted` / 档位 / 逐章 `[{ c, n, ok }]` / 表现差入队 id / 入队张数 / 本场配置（难度区间＝知识卡星标 ★1–★5 · 掌握度区间 · 章节；`diff` 记的是**本场筛选区间**，历史记录保留写入当时的旧值、不被迁移回写）。

- **存储层只校验、不解释**：`storedQuizRecordValid` 只要求「普通对象且 `t` 为有限数」（时间戳是云同步去重键），其余字段一律原样保留——存储层二次解释只会在将来加字段时静默丢数据。
- 加载与导入两条路径都过 `storeQuizRecords`：非法元素**单独丢弃**（不整块清空）、逐条深拷贝（导入后不与来源共享引用）、超限只留最新。

### normalizeDB 自愈规则（读旧数据必知）

- 缺字段补默认；数值字段非有限 → 丢弃/拒收。
- 学习/重学卡 `due` 缺失或写到 >1h 之后 → 改为「即刻到期」。
- 静态 `DATA` 中已不存在的 `cards` id → 删除（孤儿）。
- 规范化回写 **保留** 原 `updatedAt`。

## 行动模块存储（独立于学习库）

规格与规则以 [`ACT.md`](ACT.md) 为准。键 `athena_act_v1`（可拆 `athena_habit_v1`）：

```js
{
  // 计划主干 = WOOP；旧 ifThen / envAudit 加载与 mergeActModule 时丢弃
  woops: [{
    id, wish, outcome, obstacle,
    planIf, planThen,
    cues?: [{ text, action: 'remove'|'adapt', note? }],  // 外部提示（原环境审计并入障碍步）
    createdAt, updatedAt
  }],
  habits: [{
    id, title, parentId: string|null, tag?: string,
    toleranceDays: number, missCount: number,
    doneDates: string[],           // YYYY-MM-DD
    createdAt, updatedAt, removedAt?: string
  }]
}
```

- **不写入**各科 `*_formula_srs_v1`；同步合并若扩展须另表，禁止刷新学习库 `updatedAt`。
- 习惯树判定纯函数建议 `evaluateHabitDay`（级联移除 / 容忍天数 / 标签组保护）— 测试在 `tests/habit.test.mjs`。
- 合并 `mergeActModule` 只并 `woops` + `habits`；默认载荷 `{ woops: [], habits: [] }`。

## 云同步合并（摘要）

见 `docs/ARCHITECTURE.md`。逐段口径：

| 段 | 合并规则 |
|---|---|
| `cards` / `wrongs` | 并集；同卡按 `lastR` 等选边，仅一侧存在则整份采用 |
| `custom` / `cardOverrides` / `customRel` | 并集，冲突本地优先 |
| `log.daily` / `log.studyTime` | 逐日取大（同时段两端学习取 max，**不相加**） |
| `log.counts` / `log.detail` | 逐日（逐字段 / 逐卡）取大 |
| `log.checkins` | 取「或」 |
| `log.mastery` / `log.metrics` | 取当日 `studyTime` 较长一侧的快照 |
| `log.newIntro.ids` | 并集（本地在前） |
| `log.revlogs` | 按 `t|cid|r` 去重并集、`t` 升序、超 4 万裁最旧 |
| `log.quiz` | 按 `String(t)` 去重并集（本地在前 → 同 `t` 以本地记录为准）、`t` 升序、超 200 留最新 |
| `settings` | 本地优先（正在使用的设备）；`updatedAt` / `schemaVersion` 取大 |

- **合并不刷新 `updatedAt`**：`updatedAt` 取两端 max，去重键是内容本身（时间戳），不是计数器——写回时不得刷新（见 `ARCHITECTURE.md` §云同步）。
- **畸形载荷防御**：`mergeDb` 起手用 `syncSafeMap`（非对象 → `{}`）/ `syncSafeList`（非数组 → `[]`）把外层容器降级，按「该侧没有这段数据」继续；口径是**只守外层容器、不深度净化日值**（曾净化 `counts` 日值，把 `counts: { d2: 4 }` 洗成 `{}`，已回退）。修复后 `out.log.revlogs` 恒为数组。

## 导出格式

| 格式 | 形状 |
|---|---|
| 单科 | `{ format: 'formula-memory', version: 2, subject, db }` |
| 全科 | `{ format: 'athena-all-backup', version: 1, subjects: { [sid]: db } }` |

## 渲染文本约定（卡面）

| 写法 | 结果 |
|---|---|
| `$..$` / `$$..$$` | KaTeX 数学 |
| `**…**` | 加粗 |
| `\textbf{…}` / `\underline{…}` | 加粗 / 下划线（标题含公式时用 `R\`…\``） |
| `~~~lang` … `~~~` | 等宽代码块（原样，不经数学/加粗） |
| `①②③…` / 全角 `（n）` | 长答案分点 |

### 校验归属（勿混淆）

| 约束 | 工具 | 级别 |
|---|---|---|
| 内部卡片编号泄漏进 title/front/back | `check_data` | **ERR**（exit 1） |
| 结构：重复 id / META 缺失 / REL·EXAMPLE 断裂 / 非法 cat | `check_data` | **ERR** |
| 散文 `**` / `$` 未成对（剥 `~~~` 后） | `check_data` | **WARN**（不致 exit 1） |
| 渲染后 katex-error / 残留 `\textbf`·`\n` 等命令 / 字面 `**` | `check_render` | **ERR** |
| 题库：`BANK_FILES` 未挂载 `window.BANK.<subj>` / `id` 与文件名不符 / 缺 `name`·`sourceNote` / `types`·`questions` 为空 | `check_data`（`BANK_FILES` 见 `tools/check_data.mjs:27`） | **ERR** |
| 题库：题目 id 重复；缺 `stem`/`answer`/`traps`/`hint`/`year`/`no`/`type`/`tags`/`school`/`src`；`star` 非 1–5 整数；`type` 不在 `types` 内；`tags` 不是真实卡 id；`src.file`·`src.no` 缺失 | `check_data`（标签池 = 该科真实卡 id，故要求 `window.SUBJECTS` 先加载） | **ERR** |
| 题库：`school` 缺失/空、`school` 不含 `year`、`school` 与 `src.file` 不同源（`SRC_SCHOOL_RULES`：JYSG 真题册 → 必含「光华」+「431」；数学三解析册 → 必含「数学三」） | `check_data`（`SRC_SCHOOL_RULES` 见 `tools/check_data.mjs:32-35`；同源关键词只取自来源册题块标题，不容许猜测/泛指） | **ERR** |
| 题库：`src.file` 未被同源规则覆盖；`school` 年份与 `src.file` 四位年份不一致 | `check_data` | **WARN**（不致 exit 1） |
| 题库：同一年同一份卷子出现两种 `school` 写法（先规范化全角/空白/连接符与「入学统一考试↔招生考试」，再按 `(sid, year, 规范化 school)` 分组，同组 ≥2 种原文即 ERR 并打印两种原文与各自题 id） | `check_data`（「题源一致性」段；反证可把 `ATHENA_DATA_DIR` 指向临时副本） | **ERR**（exit 1） |
| 题库：题型 key 重复、题型缺 `name`·`def`·`judge`·`sample` | `check_data` | **ERR** |
| 题库：某题型无任何题目命中 | `check_data` | **WARN**（不致 exit 1） |
| 题库：题干·解析·陷阱·提示泄漏内部编号 / `**`·`$` 未成对 | `check_data` | **ERR** / **WARN** |
| 题库：数学三答案被改写（选择题字母与期望表不符 / 填空·解答题的结论锚点丢失）、新增或删除 math3 题未同步补期望表、选择题选项数不为 4、填空/解答题带了选项 | `tests/bank.test.mjs`（期望表 `tests/fixtures/bank-answer-manifest.json`，守卫 `:373-408`；`letterOf()` 正则 `:364`） | **ERR**（`node --test` 失败） |
| 题库：界面选项字母 / 「答案：X」标识与 `answer` 派生结果不一致（含无 `options` 的题不得出现标识） | `tests/bank.test.mjs`（渲染管线贯通 `:1269`、选择题标识 `:1339`） | **ERR**（`node --test` 失败） |
| 题库：题量掉到下限以下（math3 < 24 / econ < 15 / stats < 186 / 合计 < 225） | `tests/bank.test.mjs`（`MIN_QUESTIONS` `:64`、`MIN_TOTAL` `:65`） | **ERR**（2.2.0 全量入库后应上调） |
| 加粗 `\textbf{}` 与 `**…**` 勿混用 | 风格约定（`AGENTS.md`） | 无工具强制 |

新增/修改字段时：更新本文 + `normalizeDB`/`sanitize*` + 同步合并 + 导入导出，并补 `tests/` 若行为可测。

**答案护栏的期望表是第二个事实源**：`tests/fixtures/bank-answer-manifest.json` 逐题记 `kind`（`choice` → 字母 / `fill` → 锚点）+ 转录出处（`src`），`_meta.provenance` 明写「手工逐题转录、不得由脚本从数据生成」，`_meta.evidence` 指到文本层行号；因此改 `data/bank_math3.js` 的答案必须**同时**改期望表并给出处，否则 `node --test tests/bank.test.mjs` 转红。表目前只覆盖 `math3` 24 题（`econ`/`stats` 31 题待 2.2.0 按同一口径扩表）。


## 行动侧其它键（与学习库隔离）

| 键 | 内容 | 云同步 |
|---|---|---|
| `athena_habit_groups_v1` | 习惯组 minK 等 | ✅ 载荷 `habitGroups` |
| `athena_habit_state_v1` | 每日检查/结算状态 | ❌ 不参与（打卡日志在 `habits[].doneDates` 内随行动键同步） |
| `athena_focus_v1` | 专注链 · 单元 · 判例 · 编制 | ✅ 载荷 `focus` |
| `athena_mile_v1` | 里程碑 Hit 记录 | ✅ **已接入云同步**：载荷 `mile.hits`，按 `defId` 去重、同 `defId` 取 `at` 较新并集；Def 是代码常量 `MILESTONE_DEFS`，不入云 |
| `athena_act_cfg_v1` | 行动设置 | ✅ 载荷 `settings`（设置本地优先） |
| `athena_global_prefs_v1` | 全局偏好（可重叠项） | ❌ 不参与 |

- 行动设置键 `athena_act_cfg_v1`：专注链那一份只由白名单字段构成——`sanitize` 逐字段构造输出（`flavor` / `typeNames` / `levelNames`），已下线键（如 `showLevelTag`）即使旧数据里存在也被**静默忽略**、不输出也不抛错（`src/settings.mjs:86-96`，注释 `src/settings.mjs:93`）；保存写回 `src/settings.mjs:147` 的 `saveActSettings`，专注链段落盘为 `athena_focus_v1.settings`（`src/settings.mjs:174`）。

行动侧同步载荷字段：`act`（`athena_act_v1`）/ `habitGroups` / `focus` / `mile` / `settings`；`updatedAt` 为组装时刻（`Date.now()`），合并取两端 max。老云端载荷缺少 `mile` 字段时按空结构 `{ hits: [] }` 处理（不抛错），完全下载时与其他行动键同语义单向覆盖。

详见 ACT.md。