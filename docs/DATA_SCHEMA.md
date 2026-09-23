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
| `diff` | FSRS 难度 D（1–10） |
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
| `errType` | 错误类型标签 |
| `lastSolveMs` | 上次重做用时 |

### settings

| 字段 | 默认 | 含义 |
|---|---|---|
| `dailyNew` | 10 | 每日新卡上限（0=暂停） |
| `targetS` | 90 | 毕业目标稳定度（天） |
| `targetLinkExam` | true | 与考试日挂钩 |
| `fdr` | 0.9 | 期望保留率（0.80–0.98） |
| `goalTitle` | `'考研'` | 倒计时目标名 |
| `bareRecall` | false | 裸回忆（隐藏分类徽标） |
| `beginner` | — | `{ on: boolean, cats: catKey[] }` 初学者模式与勾选章节 |

`targetH` 已迁移为 `targetS`（勿再写入）。

### log

| 字段 | 含义 |
|---|---|
| `counts` | `{ [YYYY-MM-DD]: { n, r, w, intro } }`：n 新学 / r 复习 / w 错题重做 / intro 当日引入新卡数 |
| `revlogs` | 评分日志数组（FSRS 训练地基，上限 4 万裁最旧；只增） |
| `daily` | 每日计数（`{ [date]: number }`） |
| `studyTime` | `{ [date]: 毫秒 }` 前台学习时长（**不是分钟**；展示时 `/60000`） |
| `detail` | 逐日逐卡计数 |
| `checkins` | 打卡日 |
| `mastery` / `metrics` | 当日快照 |
| `newIntro` | `{ ids: string[] }` **已引入新卡并集**（非「今日」；今日引入数在 `counts[date].intro`） |

`revlogs` 单条（`pushRevlog`）：`{ t, cid, r, st, ivl, k }`——时间戳 / 卡 id / 评分 1–4 / 评分前状态编码（new=0, learning=1, review=2, relearning=3）/ 本次间隔 / 类型 `k`：知识卡 `'k'`、错题重做 `'w'`。对齐 FSRS 优化器复习日志。

### normalizeDB 自愈规则（读旧数据必知）

- 缺字段补默认；数值字段非有限 → 丢弃/拒收。
- 学习/重学卡 `due` 缺失或写到 >1h 之后 → 改为「即刻到期」。
- 静态 `DATA` 中已不存在的 `cards` id → 删除（孤儿）。
- 规范化回写 **保留** 原 `updatedAt`。

## 云同步合并（摘要）

见 `docs/ARCHITECTURE.md`。要点：`cards`/`wrongs` 并集按卡选边；`revlogs` 按「时间+卡片+评分」去重并集；日志逐日取大；设置本地优先。

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
| 加粗 `\textbf{}` 与 `**…**` 勿混用 | 风格约定（`AGENTS.md`） | 无工具强制 |

新增/修改字段时：更新本文 + `normalizeDB`/`sanitize*` + 同步合并 + 导入导出，并补 `tests/` 若行为可测。
