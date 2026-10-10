# ARCHITECTURE — 模块与数据流

> 配合 `AGENTS.md` 使用。字段/卡面约定见 `DATA_SCHEMA.md`，协作纪律见 `WORKFLOW.md`。

## 总览

```mermaid
flowchart LR
  subgraph 静态内容
    D["data/*.js\nwindow.SUBJECTS\n+ data/bank_*.js\nwindow.BANK"]
  end
  subgraph 构建
    B["tools/build.mjs"]
    S["src/*.mjs"]
    A["app.js 生成物"]
    T["tools/build-tauri.mjs\n→ dist/"]
    S --> B --> A
    B --> T
  end
  subgraph 运行时
    A --> ST["store: localStorage 主\nIndexedDB 备份"]
    A --> UI["home/learn/wrong/\nbrowse/quiz/bank/\nstats/map/settings"]
    A --> ACT["act.mjs + habit.mjs + focus.mjs\n行动：计划/习惯树/专注链"]
    A --> SY["sync.mjs\nGitHub 私仓"]
    A --> R["render.mjs + KaTeX"]
  end
  D --> UI
  ST <--> SY
  ACT --> UI
```

- **零 npm 运行时依赖**：浏览器直接加载 `index.html` → `data/*.js` → `app.js`。
- **源码拼接**：`src/*.mjs` 不是 ESM 运行单元，而是 IIFE 内片段；带 `export` 的纯函数模块在拼接时剥离 `export` 行（见 `tools/build.mjs` 的 `stripExports`），以便 `tests/*.mjs` 以 ESM 方式单独 import 对拍。
- **构建工具契约**：`tools/build.mjs` 是纯函数模块（`buildProduct` / `buildBody` / `runCli`），`import` 它零副作用，仅在做主模块时执行 CLI（`invokedDirectly` 守卫）；`tests/build.test.mjs` 因此可直接 import 拼装逻辑做对拍。
- **生成物**：`app.js`、`CHANGELOG.md`、`dist/` 不可手改。
- **行动模块规格**：`docs/ACT.md`（WOOP 主干计划 / 习惯树 / 专注链 / 过程反馈红线）。

## 设计系统（2.0 · 自 V2_PLAN 内化）

| Token | 亮色 | 用途 |
|---|---|---|
| `--bg` / `--bg-elevated` / `--bg-sunken` | `#F7F8FA` / `#FFF` / `#EEF0F3` | 层级 |
| `--accent` / `--accent-2` | `#3B82F6` 蓝 / `#D4537E` 粉 | 学习 / 行动·里程碑 |
| 字体 | 系统栈 + PingFang SC（`fonts/inter-*.woff2` 拉丁） | UI 13–14 / 正文 15 |

布局：桌面左侧栏；iOS 底栏 + safe-area；Today 双栏；`Ctrl/⌘+K` 命令面板。空态插画 `assets/empty-*.webp`。

## `src/` 拼接顺序（`tools/build.mjs` `ORDER`）

| # | 模块 | 职责 |
|---|---|---|
| 1 | `config.mjs` | 全局常量：`GOAL_DEFAULT` / `TARGET_S_DEFAULT` / `DAY` / `dayStart`（须最先） |
| 2 | `app.mjs` | IIFE 开头、`VERSION`、`CHANGELOG` 数组、`bootKatex` / `splitAnswerBlocks`（卡面分段） |
| 3 | `fsrs-core.mjs` | FSRS-6 公式层：权重 `FW`、R(t,S)、间隔、D/S 更新（export 供对拍） |
| 4 | `sched.mjs` | 学习/重学/复习步进状态机 `applySchedRating`（知识卡；export） |
| 5 | `interleave.mjs` | 交错/辨析聚类 `interleaveRelated`（export） |
| 6 | `store.mjs` | 学科切换、DB 读写、sanitize、导入导出、自建卡/覆盖 |
| 7 | `render.mjs` | `renderTex` / `renderProse` / KaTeX 与代码块 `~~~` |
| 8 | `learn.mjs` | **共享学习核心**（文件名易误导）：会话键、掌握度/毕业、评分 `applyRating`、记忆模块 `memoryBox`、`renderApp`/`renderSubnav`/`renderDock` 壳层 |
| 9 | `browse.mjs` | **知识卡学习页 + 卡面编辑**（易误导）：`buildSession`/`renderLearn`/`renderLearnCard`/`doRate`、内置卡编辑弹窗 |
| 10 | `wrong.mjs` | 错题本（录入、重做、浏览、统计）；错题调度 export |
| 11 | `quiz.mjs` | **帮助 + 浏览列表 + 自测**（易误导）：`renderHelp` / `renderBrowse` / `renderQuiz` |
| 12 | `bank.mjs` | **题库 POC**：真题浏览（范围恒等于全局学科选择器；题型/知识点/难度（≥）/年份·卷**四组自绘下拉** + 关键字筛选）与详情、徽标「院校 · 年度 · 题号」、选项 (A)–(D) 与「答案：X」标识、一键入错题；徽标/标签/筛选器选项/选项/答案一律经 `texEl`（KaTeX）渲染；数据读 `window.BANK.<subj>`（export 纯函数 `bank*`） |
| 13 | `settings.mjs` | 设置、初学者章节、更新日志 UI |
| 14 | `stats.mjs` | 统计、负载预测、考试日展望（export） |
| 15 | `map.mjs` | 原理页（学习科学 + 认知科学）+ 知识图谱 |
| 16 | `home.mjs` | **Today 主页**：双栏（左今日复习 due / 右习惯·专注摘要）、里程碑 1 条、快捷入口、学科网格、每日精选 |
| 17 | `sync.mjs` | GitHub 云同步合并 `mergeDb`/`runSync`（export） |
| 18 | `act.mjs` | **行动·计划**：WOOP 主干（P=如果-那么，外部提示并入障碍）、RSIP 设计手册帮助（export 纯校验可测） |
| 19 | `habit.mjs` | **行动·习惯树**：RSIP 层级/每日检查/组 minK/内化/强化（export `evaluateHabitDay` 等） |
| 20 | `focus.mjs` | **行动·专注链**：CTDP 神圣座位 `#N`/下必为例/预约 15 分/侦查/继位；四级（unit→group→corps→army）严格逐级归属、番号最小空缺复用、层级由**树杈引导 + 番号 + 名称**表达（t41 起无彩色/字号/文字标层级规则，风味开启时番号升级为中文序数层级名）、剩余时间悬浮提醒（export 纯函数） |
| 21 | `mile.mjs` | **行动·里程碑**：条件 + 解锁时间 +「这说明…」+ 深链；Def 是代码常量、Hit 记录进云（export 纯函数） |
| 22 | `actions.mjs` | 事件总线 `handleAction`、主题/抽屉/学科下拉、导入导出、`initApp`；键盘刷卡：Space/Enter 显示答案、1-4 评分、←/→ 切卡（learn→goback/gofront，wrong→wgoback/wgofront，输入框焦点不触发） |

**文件名 ≠ 职责**（历史命名）：改知识卡学习 UI 去 `browse.mjs`；改掌握度/评分入口/应用壳层去 `learn.mjs`；改浏览列表或帮助或自测去 `quiz.mjs`；改题库（真题筛选/详情/入错题）去 `bank.mjs`。找错文件是本仓最常见的浪费。

`stripExports`（拼接时去掉 `export`，便于 tests 以 ESM 导入）：`fsrs-core` `interleave` `sched` `store` `wrong` `sync` `stats` `act` `habit` `focus` `mile` `bank`（共 12 项）。

改顺序或增删模块时，必须同步：`tools/build.mjs` `ORDER`、`stripExports` 列表（若需测试导出）、以及本文表格。

**漏登记的后果（2.1.0 的真实起因）**：新模块若只加文件、不登记进 `ORDER`，产物里就缺这段代码；若登记了 `ORDER` 却漏进 `stripExports`，产物里会**残留顶层 `export` 行**——浏览器按普通脚本解析时直接 `SyntaxError`，整站白屏（`app.js` 是普通 `<script>`，不是 `type="module"`）。所以「新增模块」= 文件 + `ORDER` + `stripExports` + 本文表格 + `index.html`（若是数据文件）四处同改。

## 内容加载

`index.html` 按固定列表加载 25 个 `data/*.js`（`math3`…`wujing`，全清单见 `DATA_SCHEMA.md`），最后加载 `app.js`。每个数据文件写入 `window.SUBJECTS.<id>`。

- **题库数据另成一套**：`index.html:131-133` 在 `app.js` 之前追加 `data/bank_math3.js` / `data/bank_econ.js` / `data/bank_stats.js`，各自写入 `window.BANK.<subj>`（与 `window.SUBJECTS.<id>` 并列，互不污染；形状见 `DATA_SCHEMA.md`）。这三个文件同时在 `sw.js:41-43` 的预缓存清单里——新增题库文件要**两处同改**（`index.html` + `sw.js`）。
- `store.setSubject(id)` 切换当前科：绑定 `CATS` / `DATA` / `META` / `EXAMPLE` / `REL` / …，写 `localStorage` 记住上次科目。
- `refreshData()` 把静态卡 + 用户覆盖（`cardOverrides`，可 hidden）+ 自建卡（`custom`）合成当前展示用 `DATA`；`archived` 卡与孤儿 id 会被排除/清理。

## 存储

| 键 | 内容 |
|---|---|
| `<subjId>_formula_srs_v1` | 该科学习库 DB（主存 localStorage） |
| `<subjId>_formula_session_v2` | 学习会话（队列游标等） |
| `ms3_formula_theme` | 明暗主题 |
| `athena_act_v1` | 行动·计划 + 习惯节点（WOOP / habits；旧 ifThen/envAudit 丢弃；见 `ACT.md`；**独立于学习库**） |
| `athena_habit_groups_v1` | 习惯树组配置（minK 等；与学习库、act 隔离，避免被 `actSanitize` 剥掉） |
| `athena_focus_v1` | 专注链 CTDP 状态（链/判例/预约；与学习库及 `athena_act_v1` 隔离） |
| `athena_mile_v1` | 里程碑 Hit 记录（`MILE_KEY`；Def 是 `mile.mjs` 的代码常量，不入存储、不入云） |

**键隔离红线**：`athena_act_v1` / `athena_habit_groups_v1` / `athena_focus_v1` / `athena_mile_v1` 一律**不得**写入 `*_formula_srs_v1`（云同步、导入导出亦只认学习库键）。

IndexedDB `kv` 作为同 key 备份；加载时 `localStorage` 优先，缺失则回退 IDB。写入走 `saveDB` → 100ms 合并 `flushSave`。规范化（`normalizeDB`）会补默认字段、拒收 NaN、修远期 due、删孤儿卡，并以 `saveDB(true)` 回写（**不**刷新 `updatedAt`，避免污染云同步新旧判断）。

## 云同步（`sync.mjs`）

- 通道：用户 GitHub 私仓 `athena-sync/` 目录，明文 JSON。
- 启动拉取；评分落盘约 30s 后防抖上传；回前台超 5 分钟自动同步。
- **合并**：卡片/错题并集，同卡比 `lastR` 等选边；日志逐日取大/取或；自定义内容冲突本地优先；设置本地优先；覆盖前只在「对侧有本机未见变化」时归档（`archive/` 每科保留最近 10 份）。
- **自测记录**（`log.quiz`）：按 `t` 去重并集（本地在前 → 同 `t` 以本地记录为准）、`t` 升序、超上限只留最新（`SYNC_QUIZ_MAX = 200`）；合并不推进 `updatedAt`（去重键是时间戳，不是计数器）。
- **畸形载荷防御**：`mergeDb` 起手用 `syncSafeMap` / `syncSafeList` 把「非对象 / 非数组」的容器降级为空对象 / 空数组，按「该侧没有这段数据」继续合并，不因 `TypeError` 中断整条同步链路（修复后 `out.log.revlogs` 恒为数组）。口径是**只守外层容器、不深度净化日值**：曾尝试净化 `counts` 日值，会把 `counts: { d2: 4 }` 洗成 `{}`，已回退。
- **行动模块**（`athena-sync/data/_act.json`）：载荷 `{ act, habitGroups, focus, mile, settings }` 一并同步（`runSync` / `forceUploadAll` / `forceDownloadAll` 三条路径共用同一组装/写回漏斗）；里程碑只同步 Hit 记录（`defId` 去重、同 `defId` 取 `at` 较新并集），Def 是代码常量不入云；老云端载荷无 `mile` 字段按空结构 `{ hits: [] }` 处理。
- 同一设备同步请求串行；PUT 遇 409 自动重拉合并重试。

## 调度（勿与 FSRS 公式层混淆）

- **公式层** `fsrs-core.mjs`：对齐 FSRS-6 官方，无自创封顶。
- **状态机** `sched.mjs`：Anki 式学习步进（分钟级 steps）+ 复习阶段 FSRS 更新。四档：0 Again / 1 Hard / 2 Good / 3 Easy → G=1..4。
- **毕业/掌握度**：稳定度 S 对目标 `targetS` 的对数压缩（自创展示指标，标 ⚠️）。
- **提前复习接口** `sched.mjs` 的 `markCardDueNow(c, now)`：只把到期时间移到「现在」、**不动记忆历史**（export 供对拍；自测入队与浏览页「立即重学」都走它）。
- **错题卡** `wrong.mjs`：v1.16.0 起纯复习态 FSRS（添加即视为当日遗忘）；失败可降级关联知识卡（受 `linkedMastery` 开关约束，见下）。

### 错题卡 ↔ 知识点联动（`linkedMastery`）

- 字段：错题卡 `linkedMastery`（`store.mjs` `defaultWrongCard()` 默认 **1**；`sanitizeWrongCard` 只在显式 `=== 0` 时保留 0，其余一律收敛为 1）。语义：`1` = 错题评分影响关联知识卡掌握度；`0` = 只按错题卡自身调度，**不**改关联知识点。
- 例题来源自动为 `0`：`wrong.mjs` 的 `markAsWrong(ex, linkedId)` 写 `w.linkedMastery = 0`（例题只看自己）；手动录入的错题（`saveWrongInput`）保持 `1`，行为与既往一致。
- 降级发生在 `demoteLinked(w, rating)`，由 `doWrongRate` 在 `r <= 1`（Again/Hard）时调用；三道早退：`linkedMastery === 0`、无 `linked` 关联、`rating > 1`。
- **旧数据缺字段按 1 处理**（历史得降级行为不回滚）；整卡透传，云同步/导入导出不做字段级改写。

## 自测（`quiz.mjs` · 一期）

- **结构**：`src/quiz.mjs:239-535` 是 `BEGIN/END TESTABLE quiz core helpers` 纯函数块（配置净化、筛题、组卷、判定、报告、日志聚合、候选、入队），其后是接 DB 与 DOM 的适配层、配置面板与视图（配置页 `:703-712`、题头 `:771-777`、报告 `:896-913`）。纯函数一律穿过适配层读写 `DB`，所以测试可脱离浏览器对拍。
- **四维配置**：`count`（1–50）/ `cats`（章节）/ `diff`（**知识卡难度标签 ★1–★5**：`QUIZ_DIFF_MIN = 1`、`QUIZ_DIFF_MAX = 5`，`:247-248`；缺省空档位 `QUIZ_DEFAULT_DIFF = 3`，`:251`）/ `mastery`（掌握度 %，0–100）；按来源（知识卡 `cards` / 错题 `wrong`）分别落 `DB.settings.quizCfg.{cards,wrong}`，读写即 `storeQuizCfg` 的不动点（见 `DATA_SCHEMA.md`）。
- **难度口径（t19 起）**：`diff` 取知识卡星标——`quizStarNorm`（`:284-288`）与 `learn.mjs` 的 `starText` 同规则；知识卡走 `quizCardCandidates` 的 `starOf`（`:478`），错题取关联卡 `wrongs[].linked[0]` 的星标、未关联按 `QUIZ_DEFAULT_DIFF` 兜底（`quizWrongCandidates`，`:499`）。FSRS 记忆难度 D **既不参与筛选、也不在卡面展示**（题头只留「难度 ★★☆☆☆ · 掌握 x%」，`:776`；t20 删掉了 D 参考行）；配置页难度行写作「难度范围（★）」+ 提示「知识卡难度标签（★1–★5，取自卡片星标）」（`:731-735`），报告筛选范围行同口径（`:912-913`）。
- **组卷与判定**：`quizBuildQueue(entries, cfg, rnd, fallback)` 组卷、`quizWeakIds(answers, pct)` 选重学、`quizVerdict(pct)` 定档；表现差线 `QUIZ_WEAK_ACC = 60`——整场正确率 < 60% 时全场题目进重学队列。
- **报告四项**（`quizBuildReport(rec)`）：自测成绩（`pct` + `verdict`）/ 章节表现 `byCat`（逐章 n·ok·pct）/ 所用时间 `ms`·`msAvg` / 预测掌握度差距（`predicted` 与 `pct` 之差 `gap`）。
- **入队复用提前复习接口** `markCardDueNow`（`quizEnqueue(ids, retriever, dueNow)`，只提前到期、不动记忆历史）。
- **未到期卡的「立即重学」入口在 `browse.mjs`（不在 `quiz.mjs`）**：`browseRelearnEligible(c)` 判 `review`/`learning`/`relearning` 且 `due` 在未来；`decorateBrowseRelearn(list)` 给每张合格卡补一行 `⏰ 立即重学`（原定时间提示 + 提前复习不重置记忆历史），并包装 `buildBrowseList` 使初级视图与局部重绘都走同一路径；装饰抛错时只丢入口，绝不让浏览列表整体崩掉。

## 题库（`bank.mjs` · POC）

- 数据：`data/bank_math3.js` / `bank_econ.js` / `bank_stats.js` → `window.BANK.<subj>`（形状与 `school` 口径见 `DATA_SCHEMA.md`）；`bank.mjs` 只读不写，知识点标签复用 `window.SUBJECTS.<subj>` 的 id（运行时反查，不复制数据）。t19 逐题溯源审计后 45 题（`math3` 14 / `econ` 15 / `stats` 16）；t27 经视觉转写补入 2023–2025 三年选择题、t30 订正 2023 第 1/2 题并补入 2025 第 3 题后，三科共 **55 题**（`math3` **24 题 / 12 题型** / `econ` 15 / `stats` 16）。`math3` 年份覆盖 2012 / 2013 / 2019 / 2023 / 2024 / 2025，**仍缺 2020–2022 三年**（汇总册该段为扫描件、无可用文本层）；三科题量均有下限护栏（`tests/bank.test.mjs:62-63`：`math3 ≥24`、`econ ≥15`、`stats ≥15`、合计 ≥55），`math3` 答案另有手工转录期望表护栏（见「校验闸门」）。
- 常量：`BANK_SUBJECT_META`（`:21-26`，科 → label/short/subject）、`BANK_SUBJECT_ORDER = ['math3','econ','stats']`（`:27`）。
- 纯函数块：`src/bank.mjs:30-501` 的 `BEGIN/END TESTABLE bank-helpers`（星级/题型频率/标签归类/匹配/筛选/数据访问/选项/徽标/查重/年份与字母解析），`export` 清单在 `:957-974`。
- **题库范围恒等于全局学科选择器**（t17 起）：`bankCurrentSubjectId()`（`:37`）只认 `math3`/`econ`/`stats`，页内科目卡（`.bank-subjects`）与 `subject=` 参数已整体下线；三科之外的学科渲染空状态 `bankSubjectEmpty()`（`:593`，`.bank-empty.bank-empty-subject`，提示用顶部学科选择器切到三科之一），不抛错、不残留上一科题目。`bankOpenFromWrong()`（`:572`）从错题入口进题库时，科目不符会先 `switchSubject(q.subject)` 再写 `bankOpen`（顺序不能反，否则被 `resetSessionState()` 清掉）。
- **会话状态不在 `bank.mjs`**：`bankType`/`bankTag`/`bankStar`/`bankYear`/`bankQuery`/`bankOpen`/`bankOnlyWrong` 声明在 `src/learn.mjs:525-531`（全部 `src/*.mjs` 拼进同一 IIFE，重复声明会语法错误），新增状态必须同步补进 `resetSessionState()`（`src/learn.mjs:536-545`，题库四键的复位在 `:543`）。
- **导航接线**：二级导航 `learn.mjs` 的 `renderSubnav`（`:631` 导航项含 `['bank','题库']`、`:636` 图标 `bank: 'bank'`，图标本体是 `src/home.mjs:176` 的 `UI_ICONS.bank`）；视图派发 `src/browse.mjs:7` 的 `else if (currentView === 'bank') renderBank();`；`src/actions.mjs:45` 的 nav 分支把 `bank` 归到 `currentModule = 'cards'`。
- **六个动作**（`src/actions.mjs`）：`bankFilter`（`:164`，解析 `key=value` 的 **type/tag/star/year/query**；页内科目与频率维度已下线、切科不复位筛选，改筛选清 `bankOpen`）、`bankOpen`（`:183`）、`bankStep`（`:190`，先 `bankFilteredQuestions()` 再退化 `bankAllQuestions()`）、`bankBack`（`:209`）、`bankAddWrong`（`:213`，入错题后自行 `renderApp()`）、`bankReset`（`:220`，四组筛选与关键字一并复位，含「已重置题库筛选」toast）。
- **四组自绘下拉筛选**（t7 定稿结构 · t20 落视觉 · t14 加年份；不再是原生 `select`）：`bankFilters()`（`:806`）渲染容器 `.bank-filters`（四块 `.bank-filter`：题型 / 知识点 / 难度（≥）/ 年份·卷，顺序固定，年份追加在难度之后），每块 = `label.bank-filter-label` + **触发按钮** `button.bank-select.bank-select-<key>`（`data-bank-facet` / `data-arg` / `aria-haspopup="listbox"` / `aria-expanded`，内含 `span.bank-select-text`（经 `texEl` 渲染当前值）+ `span.bank-select-caret('▾')`）+ **弹层** `div.bank-select-menu[role="listbox"][data-bank-menu=<key>][aria-hidden]`，选项是 `button.bank-select-option[role="option"][data-value][data-arg=<key>=<v>][data-action="bankFilter"][aria-selected]`（选中项加 `.is-selected`），超限禁用项是 `div.bank-select-option.bank-select-option-more[aria-disabled]`。构件工厂 `bankFilterField(labelText, key, options, current)`（`:749`）；展开/收起 `bankOpenSelect`（`:720`），收起走 `bankCloseSelect`（`:708`，点选项即收起），点外部关闭 / Esc 关闭（并 focus 触发按钮）由文档级 `bankBindSelectDismiss`（`:729`，只绑一次）负责，同一时刻只展开一个（`bankSelectOpen`，`:693`；`renderBank`（`:615`）开头清空）。
- **为什么不用原生 `select`**（t7 的根因）：原生 `<option>` 只能承载纯文本，知识点标签里的公式会以 `$…$` 明文出现；自绘下拉的选项文本经 `texEl`（`src/learn.mjs:555`）进 KaTeX 渲染管线，且能携带随值变化的 `data-arg`——选项点击直接派发 `handleAction('bankFilter', key + '=' + v)`（全局 `[data-action]` 委托在 `src/actions.mjs:332`；动作名与 `type=`/`tag=`/`star=`/`year=` 语义不变）。选项由纯函数 `bankTypeOptions()`（`:260`）/ `bankTagOptions()`（`:308`，超过 `BANK_TAG_OPTION_LIMIT = 60`（`:257`）时附禁用项「其余 N 个知识点（缩小筛选后可见）」）/ `bankStarOptions()`（`:337`，★5→★1）/ `bankYearOptions()`（`:418`）产出；题型频率维度（`.bank-facet-freq`、`typeStar=`）已整体下线，历史参数静默忽略。
- **年份/卷筛选（t14 起）**：状态键 `bankYear`（`src/learn.mjs:528`，`''` = 全部）。取值编码：该年只有一种来源 → **裸年份**（如 `'2013'`）；同一年多来源 → `'年份|来源'`（来源 = `bankSchoolLabel(q)`）。派生与匹配：`bankYearRows`（`:388`，按 (year, school) 聚合出 `{year, school, count}`，年份降序 / 同年来源升序）、`bankYearOptions`（`:418`，首项「全部年份」，选项文案「2013 年 · 8 题」，多来源时「2013 年 · 来源简称 · N 题」——简称由 `bankYearSourceLabel`（`:380`）去掉尾部年份）、`bankYearSelected`（`:370`，含 `|` 时年份 + 来源双匹配）、渲染前自愈 `bankNormalizeYearFilter`（`:438`，`bankListPage` 在 `:638` 调用：切科后残留的旧年份不在本学科选项里就回全选态）。动作分支写状态在 `src/actions.mjs:176`（`'all'` → `''`），复位在 `bankReset`（`:220`）。值编码与校验口径见 `DATA_SCHEMA.md`。
- **概览与命中数是两条口径**：`.bank-count`（`bankScopeText`，`:246`）恒为「本科目总量」——「全部三科 · 共 55 题」/「数学三 · 共 24 题 · 12 类题型」，不随筛选塌陷；`.bank-hit`（`bankHitLine`，`:674` → `bankHitText`，`:239`）是当前筛选命中数的活数行，未筛选时与总量相等（此时不加 `.is-filtered`）。
- **徽标与详情（一律经渲染管线）**：列表卡与详情页顶部同一套徽标 =「院校 · 年度 · 题号」（`bankSchoolLabel(q)`，`:352`：`q.school` → `q.subjectLabel` → `BANK_SUBJECT_META` 兜底）+ `.bank-badge-year`（`year + ' · ' + no`）+ 题型 `bankTypeName`（`:513`）+ 题型频率星级 `bankTypeStars`（`:57`）+ 库内难度星级；列表卡的徽标与标签 chip（含「+N」）在 `bankItemNode`（`:823`）、详情页同款在 `bankDetailNode`（`:880`）——**全部经 `texEl`（KaTeX）渲染**，含公式的标签（math3 13 条 / econ 3 条 / stats 4 条）渲染后节点文本里不再有明文 `$`（修复前是纯文本 `el()`）。详情页的「来源」整块已移除（t17，`src/bank.mjs:940-941` 注释留痕），`q.src` 只供数据侧审计（`check_data` / t19 溯源表）与 2.2.0 全量入库。
- **选择题字母与答案标识（t7 起，纯派生、不落盘）**：有 `options` 的题（math3 现 14 题）选项逐项加 `(A)`–`(D)` 前缀——`div.bank-option[data-option-letter]` > `span.bank-option-letter`（**纯文本** `'(A)'`，不渲染） + `span.bank-option-text`（`texEl`），与答案字母一致的那一项加 `.is-answer`；答案区在散文前多一行 `div.bank-answer-letter`「答案：X」（带 `data-answer-letter`），解析不出字母则不渲染这一行。字母由纯函数 `bankChoiceLetter(q)`（`:494`）从 `answer` 派生，三条正则 `BANK_CHOICE_RES`（`:493`）与 `tests/bank.test.mjs` 期望表护栏的 `letterOf()`（`:275`）同口径；无 `options` 的题、以及解析不出字母的题一律不显示标识（界面不出现空「答案：」）。
- **入错题查重与错题本同源**：`bankSameQuestion`（`:463`）的口径是「题干 `trim()` 后严格相等」（不做全半角/大小写/内部空白归一），与 `src/wrong.mjs:364` 逐字镜像；`bankLookupWrongEntry`（`:470`）/ `bankWrongState`（`:483`）委托该判定，列表卡按钮与详情页按钮据此显示「已在错题本」（点按定位到错题本），第二次点击由 `markAsWrong` 的同类查重兜住、不会产生重复错题。

## 错题模块二级导航（错题自测 · t18）

- **二级项 = 重做 → 自测 → 浏览 → 统计**（t18 起）：`src/learn.mjs:628` 的 items `[['wrong','重做'],['wrongQuiz','自测'],['wrongBrowse','浏览'],['wrongStats','统计']]`，图标表 `:633`（`wrongQuiz` 复用与卡片模块自测同一枚 `pencil`）；**页内「错题自测」按钮已在 t28 整体删除**（原 `wrongQuizEntry()` 函数与三处调用一并移除，只留说明注释 `src/wrong.mjs:144-148`），二级栏是唯一入口。
- **功能入口清单与死链护栏**：导图两处功能清单都已补「错题自测」（`src/map.mjs:26`「注意三网络」与 `:467`「专注链 · CTDP」的同一条目 `{ label: '错题自测', nav: 'wrongQuiz' }`，紧随「错题本」）；`tests/map.test.mjs`（5 用例）把 map 里的 `nav` 取值与 `src/actions.mjs` 的 `case 'nav'` / `case 'module'` 取值集合对齐——map 里出现取不到的死值就转红（可用 `ATHENA_MAP_FILE` / `ATHENA_ACTIONS_FILE` 指向临时副本反证），`package.json` 的 `test` 脚本已把该文件列进 17 个测试文件。
- **高亮按「模块 + 视图」判定**：`src/learn.mjs:639` 的 `activeKey = (currentModule === 'wrong' && currentView === 'quiz') ? 'wrongQuiz' : currentView`——视图值 `quiz` 在两个模块共用，必须先按模块判定，否则错题自测会被高亮成卡片自测。
- **导航键 `wrongQuiz` → 视图值 `quiz`**：`renderApp` 没有 `wrongQuiz` 分支，故 `src/actions.mjs:43` 的 nav 分支 `currentView = (arg === 'wrongQuiz') ? 'quiz' : arg;`，`:44` 把 `wrongQuiz` 归进错题组（`currentModule = 'wrong'`）；`case 'module'`（`:54`/`:55`）同改写。
- **进入前的会话守卫 `enterWrongQuiz()`**（`src/actions.mjs:33-35`；nav 在 `:48`、module 在 `:56` 调用）：只在「没有进行中的错题自测会话」时清 `quiz`——`quiz.mode === 'wrong'` 的会话（二级项在自测进行中可见，误点不丢进度）与 `mode === 'cards'` 的卡片会话都保留，清掉卡片会话是为了避免错题自测视图里出现知识卡题。**页内入口已删**（t28）：原先 `src/wrong.mjs` 的「重开一场」按钮（`wrongQuizEntry()` 函数 + 调用点 `:165`/`:410`/`:511`）整体移除，因此「重开一场」现在等价于从二级栏重新进入（进行中的会话按上面的守卫保留，要真正重开先退出自测视图）。

## 行动模块导航（顺序与默认视图）

- **二级导航顺序 = 专注链 → 计划 → 习惯树 → 帮助**（t18 起）：`src/learn.mjs:630` 的 items `[['actFocus','专注链'],['actPlan','计划'],['actHabit','习惯树'],['actHelp','帮助']]`，图标表在 `src/learn.mjs:635`（`actFocus`/`actPlan` → `act`、`actHabit` → `habit`、`actHelp` → `help`）——改顺序时两处同改。
- **打开「行动」默认落 `actFocus`**：`src/actions.mjs:55` 的 `currentView = (arg === 'wrong') ? 'wrong' : (arg === 'wrongQuiz') ? 'quiz' : (arg === 'act') ? 'actFocus' : 'learn';`；命令面板四条行动条目同序（`src/actions.mjs:679-682`）。
- **跳转指向**：导图三处「专注链」芯片（`src/map.mjs:258` 注意三网络 / `:345` 专注链 · CTDP / `:498` 功能 ↔ 科学依据）均为 `nav: 'actFocus'`（“环境审计”类标签仍指 `actPlan`，因其内容已并入计划页）；帮助页顶部目录 `.act-help-toc` 与三枚「去专注链 / 去计划 / 去习惯树 →」入口由 `actHelpNavChip`（`src/act.mjs:478`）生成，分别指向 `actFocus`/`actPlan`/`actHabit`；帮助页小节物理顺序 = 专注链 → 计划 → 习惯树（攻略 + 规则）→ 详见知识库，由 `src/act.mjs:614` 的 `[sec2, sec3, sec1, sec4, sec5].forEach(...)` 追加序决定。
- **切科不丢视图**：`switchSubject()`（`src/actions.mjs:536`）在切换前捕获 `const wasBank = currentView === 'bank'`（`:540`），加载完成后 `currentView = wasBank ? 'bank' : 'learn'`（`:547`）——题库页切全局学科后仍停留题库并渲染新学科的题，其它视图仍落学习页。

## 专注链视觉与悬浮提醒（`focus.mjs`）

- **结构契约**：任务树 `#focusTree` 由 `focusTreeRows`（`src/focus.mjs:2055`）出**行视图**，行元素在 `src/focus.mjs:3110` 构造：`data-id` / `data-kind` / `data-depth`（`src/focus.mjs:3112-3114`）+ `data-indent`（`src/focus.mjs:3116`）+ `data-level`（`src/focus.mjs:3122`）+ `focus-level-*` 类（`src/focus.mjs:3123`）+ 树杈引导 span（`src/focus.mjs:3132`）+ 多选框（`src/focus.mjs:3142-3151`）+ 行尾折叠键（`src/focus.mjs:3176`）+ 主行（`src/focus.mjs:3191`）。**行即展开开关**：`focusBindRowExpand`（`src/focus.mjs:3006`）给行加 `role=button` / `tabindex`（`src/focus.mjs:3009-3010`，交互判定在 `focusRowInteractive` `src/focus.mjs:2999`），Enter/Space 等价点击；展开态由 `focusIsExpanded`（`src/focus.mjs:2988`）与 `focusToggleExpanded`（`src/focus.mjs:2991`）管理。
- **层级表达（t41 起）**：层级**不再用颜色**，也不再有「层级文字标 / 层次徽标」元素——`focusLevelBadge` / `focusLevelBadgeEl` 与其 CSS 已整体删除（删除依据注释 `src/focus.mjs:965-967`；死代码守卫 `tests/focus.test.mjs:1550-1583`），只剩三样：**树杈引导线**（同层列宽一致、按 `depth` 递进）、**层级番号**、**名称**。缩进唯一真源是 `FOCUS_TREE_INDENT_PX = 14`（`src/focus.mjs:891`），渲染端只读容器上的 `--focus-tree-indent` 变量（`src/focus.mjs:2966-2967`），不再硬编码像素。
- **树杈引导（t27）**：纯函数 `focusTreeGuides(rows, indentPx)`（`src/focus.mjs:920`）返回每行要画的字锥；字符表是渲染端常量（`src/focus.mjs:883-886`），列宽 = `depth × FOCUS_TREE_INDENT_PX`（契约注释 `src/focus.mjs:888-891`）；单行拼接在 `focusTreeGuideLine`（`src/focus.mjs:897`）；引导 span 带 `aria-hidden`（`src/focus.mjs:3133-3138`）。
- **行回收与折叠键**：`focusTreeFoldDefaults`（`src/focus.mjs:2978`）在初始化 `--focus-tree-indent` / `data-indent-step` 后补写折叠状态，**用 `focusCssDeclared`（`src/focus.mjs:2647`）做「CSS 里已有这条规则就早退」的死代码守卫**（`src/focus.mjs:2979`）；折叠键独立类名 `.focus-tree-fold-level`（`src/focus.mjs:3182` 挂载 / `:3176` 构造），状态用 `aria-expanded`（`src/focus.mjs:3179`）+ `data-collapsed`（`src/focus.mjs:3181`）。
- **层级名口径（风味两态 · t41）**：`focusSeqLabel`（`src/focus.mjs:451`）只给「符号 + 序号」（符号表 `FOCUS_SEQ_KEYS` `src/focus.mjs:18`）；`focusUnitLabel`（`src/focus.mjs:488`）风味关＝`#82 · 名称`、风味开＝`第82任务单元 · 名称`（阿拉伯数字）；`focusOrgLabel`（`src/focus.mjs:506`）风味关＝`◆1 总目标`、风味开＝**中文序数 + 层级名 + ` · ` + 自定义名**（`第一任务集团 · 总目标`，风味开**不再输出番号符号**）；中文序数由 `focusChineseNumber`（`src/focus.mjs:459`，1..9999，非法返回空串）与 `focusSeqOrdinalOk`（`src/focus.mjs:480`）给出；序号非法/缺失时降级为不带「第 N 」的层级名（用例 `tests/focus.test.mjs:626-643`）。`focusWorkLabel`（`src/focus.mjs:538`）是单元「形态」文案（`focusPlanNodeFields` `src/focus.mjs:799` 消费）。
- **单元类型标签（t41 建 · t42 视觉）**：`focusUnitTypeTagEl(unit, depth, settings)`（`src/focus.mjs:3096`）渲染 `.focus-unit-type-tag` 元素，挂载在该单元行**上方**（`src/focus.mjs:3277` 先于 `src/focus.mjs:3278` 的行挂载），带 `data-id` / `data-type` / `data-depth` / `data-indent`（`src/focus.mjs:3099-3102`）与 `title`；文本取 `settings.typeNames[typeKey]`，`typeKey` 由 `focusUnitTypeKey`（`src/focus.mjs:522`）按 `FOCUS_TYPE_KEYS`（`src/focus.mjs:14`）白名单归一（白名单外归 `focus`），取不到/为空时由 `focusUnitTypeLabel`（`src/focus.mjs:528`）回退内置「专注」；标签**始终显示**（与风味开关无关，用例 `tests/focus.test.mjs:664-665`）、**不可拖拽**（不设 `draggable`）、**不绑任何监听**（点它不改变展开/选中状态，契约用例 `tests/focus.test.mjs:668-682`）；视觉规则 `style.css:2560-2572`（落地说明与死规则清理记录 `style.css:2538-2582`）。
- **两段式面板**：`focusTreeExpandKey`（`src/focus.mjs:972`）给出行膨胀键（`kind:id`）；第一段 `focusTreeExpandFields`（`src/focus.mjs:999`）＝状态 + 形态 + 归属（字段与顺序有逐字契约 `src/focus.mjs:977-998`），单元段 `src/focus.mjs:1007-1016`（「状态」取自 `focusOrgStateLabel` `src/focus.mjs:651`），编制段 `src/focus.mjs:1040-1047`（含 `是否计划中` / `计划截止日期`，来自 `focusPlanNodeFields` `src/focus.mjs:799`）；第二段 `focusExpandTagViews`（`src/focus.mjs:1058`，数据来自 `focusTemplateTriad` `src/focus.mjs:2009`，契约注释 `src/focus.mjs:1053-1056`）＝「判例 / 易混 / 记念」三模块，编制另有 `focusExpandModuleViews`（`src/focus.mjs:1087`）＝编制完成度（`focusOrgAggregates` `src/focus.mjs:1946`）/ 下一级完成情况（`focusNextLevelCount` `src/focus.mjs:1907`）/ 成员 / 截止与提醒。面板由 `focusTreeExpandPanelEl`（`src/focus.mjs:3033`）渲染：头部含独立**番号** `src/focus.mjs:3040` / **层次名** `src/focus.mjs:3041` / 标题 `src/focus.mjs:3042`，判例三模块 `src/focus.mjs:3046-3057`，编制模块 `src/focus.mjs:3062-3067`，底部归属行 `src/focus.mjs:3074`（**全仓唯一「归属 」前缀拼接点**；`focusParentAttribution`（`src/focus.mjs:1113`）返回实体，`parentLabel` / `text` 都不含前缀，`src/focus.mjs:1133`）。
- **番号与层级名**：`focusTreeLabelEl`（`src/focus.mjs:3081`）拼「番号 + 名称」；取号 `focusNextSeq`（`src/focus.mjs:711`）、上限 `focusMaxSeq`（`src/focus.mjs:732`）；`focusNextLevelCount`（`src/focus.mjs:1907`）t41 后只供面板「下一级完成情况」，不再有行内徽标消费方。
- **转正入口与门槛**：行内转正小字由 `focusFormalizeHint`（`src/focus.mjs:698`）给；判定链 `focusCombineReadiness`（`src/focus.mjs:658`）→ `focusIncompleteUnder`（`src/focus.mjs:672`）→ `focusUnitDone`（`src/focus.mjs:633`）/ `focusOrgPending`（`src/focus.mjs:638`）/ `focusNodeDone`（`src/focus.mjs:643`）；编制侧 `focusOrgCanFormalize`（`src/focus.mjs:1975`）/ `focusFormalizeOrg`（`src/focus.mjs:1994`）；多选与拖放挂载点 `src/focus.mjs:3142-3151` / `src/focus.mjs:3155-3170`。
- **悬浮提醒**：`focusReminderInfo`（`src/focus.mjs:1142`）从计划节点算「未完成 / 已过期」清单；提醒箱状态 `focusReminderUiState`（`src/focus.mjs:2672`，读 `src/focus.mjs:2676`）以 `FOCUS_REMINDER_UI_KEY`（`src/focus.mjs:2667`）持久化「已关闭」标记（写入 `src/focus.mjs:2688`，独立保存器 `focusReminderSaveUi` `src/focus.mjs:2685`）；`focusReminderClear`（`src/focus.mjs:2845`）清掉定时器与 `#focusReminder`，`focusReminderStart`（`src/focus.mjs:2854`）起 1s `setInterval`（`src/focus.mjs:2858-2860`）；计时器变量 `focusReminderTimer`（`src/focus.mjs:2669`）、元素 `focusReminderEl`（`src/focus.mjs:2668`）；首挂载由 `focusReminderEnsure`（`src/focus.mjs:2692`）→ `focusReminderSync`（`src/focus.mjs:2803`，`show` 分支 `src/focus.mjs:2808`）。UX 约束：提醒箱 `position: fixed` 锚右上（`style.css:2013`），不遮页头（锚定规则注释 `style.css:2006-2011`）；样式 `style.css:2012-2021`（`head` / `level` / `title` / `.focus-reminder-fold` / `.focus-reminder-close` / `.focus-reminder-clock` / `meta` 分别在 `style.css:2022` / `style.css:2023` / `style.css:2028` / `style.css:2033` / `style.css:2040` / `style.css:2041` / `style.css:2047`）、收起与过期两态 `style.css:2052-2054` / `style.css:2055-2056`、窄屏收紧 `style.css:2080-2081`、已删样式说明 `style.css:2057-2062`。
- **接线**：`src/learn.mjs` 在「错题」之外的主页视图渲染后统一调 `syncFocusReminder`（早退分支 `src/learn.mjs:624`、正常分支 `src/learn.mjs:655`；实现 `src/learn.mjs:658`）；`handleAction('focusCombine' / 'focusFormalize' / 'focusCreateOrg' / 'focusDeleteOrg' / 'focusToggle' / 'focusTick')` 都从 `src/actions.mjs:37` 进（`src/actions.mjs` 只透传参数，不碰树结构）；建编制弹窗的「截止日期」与「可转正最低下一级任务数」两个可选输入在 `src/focus.mjs:3857-3868`（下限 `FOCUS_MIN_CHILD_MIN` `src/focus.mjs:22` / 上限 `FOCUS_MIN_CHILD_MAX` `src/focus.mjs:23`），提交走 `focusCombineNodes`（`src/focus.mjs:1840`，来自计划时 `fromPlan=true`）；显式建/删编制入口 `focusCreateOrg`（`src/focus.mjs:1735`）/ `focusDeleteOrg`（`src/focus.mjs:1784`）。
- **层级视觉样式位置（t23/t24/t42 后现状）**：层级视觉注释块 `style.css:1986-2000`；基础树杈引导规则 `style.css:2003`、视觉切片 `style.css:2409-2414`；层级折叠键规则 `style.css:2420-2427`（注释 `style.css:2416-2419`）；t42 死规则纯减法说明 `style.css:2384-2391`、`.focus-tree-state` `style.css:2392-2398`；t29 树 UI 切片段 `style.css:2346-2499`（含窄屏媒体 `style.css:2495-2499`）。
- **设置侧（风味开关）**：默认值由 `actDefaultFocusSettings` 给（`src/settings.mjs:50`，`flavor: false` 在 `src/settings.mjs:58`）；sanitize 逐字段构造输出（`actSanitizeFocusSettings` `src/settings.mjs:82` / `src/settings.mjs:86-96`），保存写回 `saveActSettings`（`src/settings.mjs:147`）；风味行由 `flavor` 给出（`src/settings.mjs:577`）＝「显示中文序数层级名（第一任务集团 / 第82任务单元）；关闭时只留番号（◆1 总目标 / #82 名称）」；原「层次徽标」开关设置行已删除（`src/settings.mjs:585` 注，设置段只剩 `flavor` / `typeNames` / `levelNames` 三个开关），旧数据携带的 `showLevelTag` 键被 `flavor` 静默忽略（`src/settings.mjs:93`，回归用例与 `focusUnitTypeLabel` / `focusOrgLabel` 同一批：`tests/focus.test.mjs:684-690`）。

## 校验闸门

| 工具 | 拦什么 | 何时 |
|---|---|---|
| `build.mjs --check` | `app.js` 与 `src/` 不同步 | CI / 提交前 |
| `check_data.mjs` | 重复 id、REL/META/EXAMPLE 断裂、非法 cat、id 泄漏、`**`/`$` 未闭合、题库 `window.BANK.<subj>`（结构/题型 key/标签是否真实卡 id/来源字段 `src` 与 `school` 同源）、题源一致性（同一卷子不得两种写法） | 改 `data/`（含 `bank_*.js`） |
| `check_render.mjs` | 真实 KaTeX 渲染后 katex-error / 残留命令 / 字面 `**` | 改 data 或 render |
| `check_version.mjs` | 版本七处一致 | 升版 |
| `changelog.mjs --check` | `CHANGELOG.md` 与 `src/app.mjs` 同步 | 改日志 |
| `node --test tests/…` | FSRS 对拍、交错、调度状态机、错题、同步、预测、习惯/专注/里程碑、题库、自测、构建产物（`package.json` 的 `test` 脚本列全 17 个文件，含 `tests/map.test.mjs`） | 改调度/同步/题库/自测/构建 |
| `node --test tests/bank.test.mjs`（题库答案护栏） | 数学三答案被悄悄改写（选择题字母不一致 / 填空与解答题结论锚点丢失）、新增 math3 题没同步补进期望表、选择题选项数不为 4 | 改 `data/bank_math3.js` 或增删 math3 题 |

**版本七处（现行 2.1.1）**：
- 应用源：`VERSION` 在 `src/app.mjs:8`（`const VERSION = '2.1.1';`）；`CHANGELOG` 数组开在 `src/app.mjs:11`、`v` 首条在 `src/app.mjs:12`。
- 缓存戳：`index.html:11-13` 的 `manifest.webmanifest` / `icons/favicon.png` / `icons/apple-touch-icon.png` 三处 `?v=75`（须一致；`style.css` 无戳）。
- 离线缓存：`VERSION` 在 `sw.js:5`（`ms3-v114`）——与应用版本是两套体系，不作强相等判定。
- 元数据：`version` 在 `package.json:3` 与 `src-tauri/tauri.conf.json:4`（均 `2.1.1`）。
- 日志与规则：`CHANGELOG.md` 首条 `## v2.1.1（2026-10）`（全 112 条，由 `tools/changelog.mjs` 生成）；枚举七处见 `tools/check_version.mjs:6-12`、内部一致性规则见 `tools/check_version.mjs:16-18`。
- 产物：`app.js` 与 `dist/` 由唯一权威构建（T116 / t43）同步——文档任务不跑 `npm run build`、不改版本七处。

**题库答案护栏（t30 起）**：`tests/fixtures/bank-answer-manifest.json` 是一份**人工逐题转录**的数学三期望答案表（`_meta.provenance` 明确「手工转录、不得由脚本从数据生成」；`_meta.sources` 7 份来源册、`evidence` 8 条含 `backup/scratch/bank-fix2/text/*.txt:行`），24 条期望 = `kind: 'choice'` 14 条记字母 + `kind: 'fill'` 10 条记源解析末式/关键结论锚点。守卫在 `tests/bank.test.mjs:373-408`，三条断言：① 期望表 id 集合与 `BANK.math3.questions` 的 id 集合 `deepEqual`（新增/删除题必须显式补表，否则转红）；② `choice` → `assert.equal(options.length, 4)` 且正文答案字母（`letterOf()`，`:364` 三条正则，与界面侧 `bankChoiceLetter`（`src/bank.mjs:494`）同口径）与期望表一致；③ `fill` → `assert.equal(options.length, 0)` 且 `answer` 含期望锚点（`indexOf(want.anchor) >= 0`）。负向对照（改 1 题字母 / 改锚点必红；仅内容类改动放行）见 `backup/scratch/bank-fix2/`，独立复核见 `backup/scratch/verify-vision2/t31-report.md`。**表只覆盖 math3 24 题**，`econ`/`stats` 31 题待 2.2.0 按同一口径扩表。

CI（`.github/workflows/ci.yml`）= 上述闸门的无渲染子集。

## 桌面版

`tools/build-tauri.mjs` 把静态前端同步到 `dist/`；`src-tauri` WebView 加载 `dist/index.html`。细节见 `docs/DESKTOP.md`。`frontendDist` 为 `../dist`，不是仓库根。
