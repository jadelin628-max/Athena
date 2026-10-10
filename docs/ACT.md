# ACT — 行动模块规格（WOOP 计划 / 习惯树 / 专注链）

> 产品向「自我提升」扩展的行动层规格。科学依据来自《认知科学行动指南》与《认知科学实操行动手册》（本地 PDF，2026-10）；**实现必须对齐本文规则**，证据强度照录，不写鸡汤、不编造研究。  
> 与 FSRS 解耦：**不改调度公式**。协作仍走 `WORKFLOW.md` §7 + `BOARD.md`。

## 1. 范围与非目标

**做（本规格）**

| 块 | 功能 | 证据 |
|---|---|---|
| 计划 | **WOOP 主干**（P 步=如果-那么） | 🟢 Gollwitzer & Sheeran 2006；Oettingen |
| 计划 | **外部提示**并入障碍步（原环境审计） | 🟢 Wood & Neal 2007 |
| 计划 | **环境审计**（提示→移除/改造，数字/物理/路线） | 🟢 Wood & Neal 2007；Graybiel 2008 |
| 习惯 | **习惯树**（层级 + 每日履行 + 容忍天数 + 标签组） | 🟢 Lally 2010；Graybiel 2008 |
| 原理 | 原理页补充认知科学章节 | 依据报告分级 |

**不做**：情绪日记、正念计时器、社交打卡、物质/娱乐「奖励兑换」、连击惩罚、改动 FSRS。

## 2. 计划模块（WOOP 主干）

**唯一记录形态是 WOOP**（见 §3）。如果-那么校验规则作用于 **P 步**，不再单列「计划库」。

**P 步格式**：`如果 [具体情境]，那么我将 [具体动作]`

- **「如果」必须是外部情境**（时间 / 地点 / 前序行为），**禁止**纯内心状态（「如果我有动力」不合格）。
- **「那么」必须是无需再决策的动作**（「打开 Anki 复习 10 张」合格；「学习一会儿」不合格）。
- UI：WOOP 列表 + 四步向导（可编辑/删除）；不要做成复杂推送系统。

## 3. WOOP

四步顺序固定：**W 愿望 → O 结果（最佳画面）→ O 障碍（内心障碍「因为我……」）→ P 计划（如果-那么）**。

- 障碍必须是**内心**障碍，不是外部困难（手册强调多数人跳过此步）。
- **外部提示**清单挂在障碍步（原环境审计：数字/物理/路线 → 移除/改造）；P 步即如果-那么。
- 旧独立 `ifThen` / `envAudit` 加载（`actSanitize`）与同步（`mergeActModule`）时**丢弃**；`woops` 保留并升级（`cues[]` + `updatedAt`）。
- 字段：`id, wish, outcome, obstacle, planIf, planThen, cues?, createdAt, updatedAt`。
- **无「升格为习惯」**；计划产出仅作记录，习惯树另行维护。

## 4. 环境审计（并入 WOOP 障碍步 · 知识保留）

- 在 **WOOP 障碍步**列出外部提示（时间/地点/情绪/前序动作/App 通知）→ 对每个提示 **移除** 或 **改造**。
- 三类：数字（删/隐藏 App、关通知、手机离卧室）/ 物理（零食不进家、运动服放床边）/ 路线（绕开触发点）。
- 核心认知文案：**移除提示 ≫ 在提示面前抵抗**。
- 不再是独立三 Tab / 独立存储字段。

## 5. 习惯树（B4 + 日节奏合并）

### 5.1 模型

```text
HabitNode {
  id, title, parentId|null,
  tag?,                    // 标签，用于分组
  toleranceDays,           // 可编辑容错天数（0 = 当日未履行即判失败）
  missCount,               // 连续/累计未履行计数（见 5.2）
  doneDates: string[],     // 履行日（YYYY-MM-DD），用于展示
  createdAt, updatedAt, removedAt?
}
```

- **树**：父子层级；可随时新增/删除/移动（调整父节点）。
- **删除节点 = 移除该节点及其全部子孙**（级联）。
- 展示模块化：节点卡片可折叠、可拖拽或「改父级」下拉（交互从简，**可编辑优先**）。
- **与专注链的区别**：习惯树的 `parentId` **层级不限、可跨层挂**（本节只约束检查与容忍），是「想养成的行为」的清单；专注链是**固定四级**（unit→group→corps→army）且**只有相邻层级可归属**，是「要交付的任务」的编制树。两棵树各自独立存储，规则见 §13。

### 5.2 每日检查（核心规则）

1. 每日（或用户点「今日检查」）对树上**未移除**习惯判定是否履行。
2. **未履行**：`missCount += 1`；若 `missCount > toleranceDays` → **移除该节点**（`removedAt`）。
3. **已履行**：`missCount = 0`，记入 `doneDates`。
4. **父节点被移除 → 全部子孙移除**（即使子孙本身 miss 未超标）。
5. **树模块化**：检查逻辑与 UI 分离，便于单测（纯函数 `evaluateHabitDay(nodes, doneSet, date)` 建议 export）。

### 5.3 标签组（同 tag）

- 同一 `tag` 的未移除习惯视为一个**组**。
- **组内存活保护**：若组内仍有成员「维持」（当日已履行，或 miss ≤ tolerance），则组内其他未履行成员**不因本次检查被移除**，仅累加 miss；若组内**全部**成员均达到移除条件，则组与成员一并移除。
- 与树级联叠加：父节点移除仍会级联清掉子节点，无论组保护。

### 5.4 与「日节奏」关系

- 不单列复杂「日程引擎」；习惯树节点即可承载「早晨 X / 睡前 Y」类节奏项（title + 每日检查）。
- **禁止**连击（streak）惩罚；展示用**累计次数 / 近 7 日点阵**即可（过程反馈，非交易奖励）。

### 5.5 文案红线

- 引用 Lally：形成中位数 **66 天**（18–254），**不说 21 天**。
- 引用 Graybiel：坏习惯**替换**而非消灭；移除提示优先。
- 漏一天可容忍（tolerance），连续失败再移除——与树规则一致。

## 6. 过程反馈（非奖励）

| 允许 | 禁止 |
|---|---|
| 完成勾选、次数、进度条、今日已做 | 「做完才能玩」兑换 |
| 轻量视觉肯定 | 物质奖励、连击惩罚、羞辱文案 |

## 7. UI / 主页适配

- **一级入口「行动」**（与知识卡/错题本并列；图标风格对齐现有线稿）。
- 行动内二级导航顺序：`专注链` → `计划`（WOOP） → `习惯树` → `帮助`（专注链为**首位**，且从一级入口「行动」进入时的**默认视图**就是专注链 `actFocus`；命令面板四条行动条目同序）。t18 定稿，见 §13.6。
- **主页**：今日习惯待检数 / 完成数摘要，点击进入行动；**不**抢学习 KPI 位。
- 深浅色、移动端可滚动编辑树；无障碍：触控目标 ≥ 40px。

## 8. 存储（与学习库隔离）

| 键 | 内容 |
|---|---|
| `athena_act_v1` | `{ woops[], habits[] }（旧 ifThen/envAudit 丢弃）` 或拆 `athena_habit_v1` |
| 不进 | 各科 `*_formula_srs_v1`、FSRS 字段 |

- 导出/导入与云同步：**v1 可不接**（报告写明）；若接，禁止污染学习 DB 的 `updatedAt` 判定。

## 9. 原理页补充（`src/map.mjs`）

在「原理 · 学习科学」中增补章节（目录可检索），**照录报告分级** 🟢/🟡/⚠️：

- 多巴胺：RPE、想要 vs 喜欢（行动：过程里程碑、冲动时问「想要还是喜欢」）
- 习惯：回路/永不消失/66 天/环境提示
- 动机：SDT 三需要、过度辩护（**为何不做物质奖励**）
- 情绪：认知重评 > 压抑、冷却期（低路/高路）
- 注意：Posner 三网络、正念预期（小而真实）
- 学习：间隔/提取/交错/睡眠（与 FSRS 叙事衔接）；证伪：学习风格、21 天、自我损耗
- 自我改变：执行意图 d=0.65、WOOP

## 10. 验收闸门

- 改 `src/*`：`npm run build` + `npm test`；改 `map.mjs`/卡面类文案另加 `npm run check:render`（若涉及卡面）。
- 习惯树逻辑建议 `tests/habit.test.mjs`（纯函数对拍：级联、容忍、组保护）。
- **不**升版/commit 于切片内；主对话统一收口。


## 11. UI / 布局（2.0 内化自 V2_PLAN）

- 亮色默认；蓝 `#3B82F6` / 粉 `#D4537E`；桌面侧栏、iOS 底栏+safe-area。
- 行动：专注链 / 计划(WOOP) / 习惯树 / 帮助（专注链置首且为默认视图，见 §13.6）；Today 双栏 + 里程碑最多 1 条。
- ⌘K 模块跳转。设计 Token 与壳细节见 `ARCHITECTURE.md` §设计。

## 12. H 波 · 今日结算与编制树（2026-10 讨论定稿）

### 11.1 习惯树结算
- **禁止 miss**：未检查=未完成；全员检完 →「今日结算」+ 确认框 → 综合判定（minK/强化/内化）。
- 零点自动结算；单习惯 UI 仅完成/未完成+编辑删除；组 minK 只在组列表。

### 11.2 强化
- 自动：内化 50/100 → +1/+2（可配置）。
- 手动：每日 1 次、1 习惯、**内化×0.5**，须更严表述。

### 11.3 专注单元与编制
- 计时结束才完成；内容+达成+完成度；侦查可转正（重选类型）。
- 番号：`#N` 单元；`●N` 组；`▲N` 群；`◆N` 集团。竖列树归属。
- 计划模式：确认；到期提醒；未满整链清空。
- 设置「行动」集中可调数值/名称/风味。

详见 `V2_PLAN.md` §10；本波次已落盘的四级归属、计划参数与番号复用规则见 **§13**。

## 12. 里程碑模块（新）

- 名：里程碑；键 `athena_mile_v1`；无积分/排行/物质奖励。
- 条件+时间+说明+深链；主页最多 1 条。
- 规则纯函数可测；与习惯/专注/学习统计解耦（观察者读公开状态）。
- **`athena_mile_v1` 已纳入云同步**：参与合并、本地优先（口径见 `DATA_SCHEMA.md` §云同步合并）；里程碑定义本身是代码常量（三类谓词 `habit`/`focus`/`learn`），不入存储、不入云。

## 13. 专注链层级与节点规则（本波次落盘）

### 13.1 层级语义（四级 · 仅相邻归属）

- 四级固定顺序 **`unit` 单元 → `group` 组 → `corps` 群 → `army` 集团**，秩由 `FOCUS_LEVEL_RANK = { unit: 0, group: 1, corps: 2, army: 3 }`（`src/focus.mjs:20`）给出；层键合法性看 `focusIsLevelKey`（`src/focus.mjs:577`）、是否编制层看 `focusIsOrgLevel`（`src/focus.mjs:581`），未知键秩为 -1（`focusLevelRank` `src/focus.mjs:585`，反查 `focusLevelAtRank` `src/focus.mjs:590`）。
- **只有相邻层级可归属**：`focusCanAttach(childLevel, parentLevel)` 的判据是 `c >= 0 && p >= 1 && p === c + 1`（`src/focus.mjs:608`）——单元只能挂组、组只能挂群、群只能挂集团，**集团不能再有父级**（顶层）；故 `focusParentLevelOf`（`src/focus.mjs:597`）对集团/未知返回 `null`、`focusChildLevelOf`（`src/focus.mjs:602`）对单元返回 `null`。越级挂靠、自环、把自己拖进自身子孙一律拒绝（`focusAttachNodes` `src/focus.mjs:813`，`:824-830` 逐 id 跳过并计入 `skipped`，原因 `empty_selection` / `bad_parent`），**拒绝时零写入**。
- **组合（多选合并）后的层次 = 成员最高层 + 1**：`focusCombineLevelOf`（`src/focus.mjs:622`）取成员秩最大值 +1 后反查层键；成员最高层已是集团 → 返回 `null` → 拒绝，原因 `no_level_up`（`src/focus.mjs:1850`）；成员层级不一致（混层）→ `member_level_mismatch`（`src/focus.mjs:1853`、`:1886`）；父级非法 → `bad_parent`（`src/focus.mjs:1857-1858`）。`focusCombineNodes`（`src/focus.mjs:1840` 起）任一拒绝分支都不落盘。
- **免计划模式组合 = 产物恒为「已完成层次」（t13 起）**：`focusCombineNodes` 在**非计划模式**且未传 `force` 时先过 `focusCombineReadiness`（`src/focus.mjs:658`）——成员含未完成 → `{ ok:false, reason:'member_incomplete', pending, doneCount, memberCount }`（`src/focus.mjs:1866`；弹窗文案见 `:3935`/`:3981`）且**零写入、不建空壳**；成员全为已完成 → 免计划组合（`const fromPlan = next.planMode ? (f.fromPlan == null ? true : !!f.fromPlan) : false;`，`src/focus.mjs:1873`），创建时写 `formalized: !fromPlan`（`:1755`）即 `fromPlan:false → formalized:true`，产物是**已完成层次**、可继续被归属到更高层；计划模式内保持既有「计划层 → 待转正」语义。
- 新建编制节点 `focusCreateOrg`（`src/focus.mjs:1735`）只在**计划模式**下可用；其父级判定同样走 `focusCanAttach`（`src/focus.mjs:608` → `bad_parent`）。

### 13.2 计划参数（任意层级都可设「最低下一级任务数」与「截止日期」）

- 顶层「＋计划任务」、树内「＋子级」与组合入口**共用同一套字段**：名称 + 最低下一级任务数 + 截止日期；三处提交都走 `focusPlanNodeFields(raw, dfltMinChildCount)`（`src/focus.mjs:799`，调用点 `:3808` / `:3874` / `:3991`），返回 `{ ok:true, name, dueAt, minChildCount }` 或 `{ ok:false, reason:'bad_due' }`。
- **最低下一级任务数**：`focusNormalizeMinChildCount(v, dflt)`（`src/focus.mjs:750`）——空值/非法值回退默认（三个入口的默认值都是 1），否则取整并夹在 `FOCUS_MIN_CHILD_MIN = 1` ~ `FOCUS_MIN_CHILD_MAX = 99`（`src/focus.mjs:22-23`）；配套校验 `focusMinChildCountValid`（`src/focus.mjs:761`）。
- **截止日期**：`focusNormalizeDueAt(v)`（`src/focus.mjs:769`）接受 Date / 大于 0 的时间戳 / ≥10 位数字串 / `YYYY-MM-DD` 文本，日期一律**归一为当日 23:59:59**（`new Date(y, mo-1, d, 23, 59, 59, 0)`）。**非法日期被拒**：除格式外还回读年月日比对（`dt.getFullYear() !== y || dt.getMonth() !== mo-1 || dt.getDate() !== d`），因此 `2024-02-31` 这类不存在的日期不会被静默顺延，直接判 `bad_due`。空值是**合法**输入（`focusDueDateValid` `src/focus.mjs:793`，截止日期可选）。
- 计划模板新建（`focusTemplateTriad` `src/focus.mjs:2009`，其中 `:2029-2032` 依次调用 `focusNormalizeMinChildCount` / `focusNormalizeDueAt` / `focusNextSeq`）与完成预览的取号复用同一组函数（`src/focus.mjs:1166`、`:2629`、`:3648` 用 `focusNextSeq(st, 'unit')` 出文案），保证「模板 / 手建 / 补齐」三条路径口径一致。

### 13.3 番号复用（同层取最小空缺号）

- 取号规则：`focusNextSeq(state, level)`（`src/focus.mjs:711`）在**同层现有号**里从 1 递增取**最小空缺号**——单元看 `units[].seq`，编制层只看同 `level` 的 `orgs[].seq`。于是**已有号不变、同层不重号**，删掉中间节点后新建的节点会**补缺**而不是顺延到最大号之后。
- 取号调用点：新建单元 `src/focus.mjs:1491`、新建编制节点 `src/focus.mjs:1769`（`org.seq = focusNextSeq(next, level)`，随后 `:1770` 抬高同层计数器）、计划模板 `src/focus.mjs:2032`；**级联删除**（`focusDeleteOrg` `src/focus.mjs:1784`，删除节点连同其全部子孙）之后，各级按 `focusMaxSeq`（`src/focus.mjs:732`）把**同层计数器归位**（`src/focus.mjs:1806` `next.seq[lv] = focusMaxSeq(next, lv)`），不留虚高计数。
- 历史数据里虚高的计数器由 `focusSanitizeState`（`src/focus.mjs:309`，读入路径 `:418` 与 `:2212`）在读入时收敛，避免旧号段把新号顶到很大的数字（旧数据不会因取号规则变化而改号）。

### 13.4 层级视觉与悬浮提醒（UI · t23 去彩色 + t27 结构精修 + t29 视觉落地 + t41 风味层级名 / 类型标签 + t42 标签视觉）

- **层级不许由颜色、字号、文字标承担**：`focusLevelVisual`（`src/focus.mjs:865`）只产出与层级相关的 `data-level` / `focus-level-*` 类名，t23 已删掉全部层级彩色与字号规则；t41 又把「层次徽标 / 层级文字标」（`focusLevelBadge` / `focusLevelBadgeEl` 及 CSS）**整体删除**，层级表达只剩三样：树杈引导线、层级番号、名称（删除依据注释 `src/focus.mjs:965-967`；死代码守卫 `tests/focus.test.mjs:1550-1583`）。层级视觉的取值表 `FOCUS_LEVEL_VISUAL_KEYS`（`src/focus.mjs:853`）与 `FOCUS_LEVEL_VISUALS`（`src/focus.mjs:856`）仍是对拍基准；delta 口径 `focusLevelVisualDelta`（`src/focus.mjs:870`）的对拍用例在 `tests/focus.test.mjs:1505-1519`。
- **树杈引导（t27）**：`focusTreeGuides`（`src/focus.mjs:920`）按行视图出字锥，列宽 = `depth × FOCUS_TREE_INDENT_PX`（`src/focus.mjs:891`）——容器变量 `--focus-tree-indent` 是缩进唯一真源（`src/focus.mjs:2966-2967`），单行拼接 `focusTreeGuideLine`（`src/focus.mjs:897`），引导 span 对读屏隐藏（`src/focus.mjs:3133-3138`）。
- **层级名两态（风味开关 · t41）**：关闭（`flavor` 默认 false，`src/settings.mjs:58`）＝番号符号 + 序号：编制 `◆1 总目标`、单元 `#82 · 名称`（`focusOrgLabel` `src/focus.mjs:506` / `focusUnitLabel` `src/focus.mjs:488`，序号串由 `focusSeqLabel` `src/focus.mjs:451` 与符号表 `src/focus.mjs:18` 给）；开启＝编制「中文序数 + 层级名 + ` · ` + 自定义名」（`第一任务集团 · 总目标`，**不再输出番号符号**）、单元「阿拉伯数字 + 层级名 + ` · ` + 名称」（`第82任务单元 · 名称`）。中文序数 `focusChineseNumber`（`src/focus.mjs:459`，1..9999，非法返回空串）与可判定性 `focusSeqOrdinalOk`（`src/focus.mjs:480`）决定是否输出「第 N 」：序号非法/缺失/超界时降级为不带序数的层级名（用例 `tests/focus.test.mjs:626-643`）。
- **单元类型标签（t41 建 · t42 视觉）**：每个单元行**上方**一行 `.focus-unit-type-tag` 胶囊（构造 `focusUnitTypeTagEl` `src/focus.mjs:3096`，挂载 `src/focus.mjs:3277` 先于行 `src/focus.mjs:3278`），**始终显示、与风味开关无关**；文本取 `settings.typeNames[typeKey]`（`focusUnitTypeLabel` `src/focus.mjs:528`），类型键由 `focusUnitTypeKey`（`src/focus.mjs:522`）按 `FOCUS_TYPE_KEYS`（`src/focus.mjs:14`）白名单归一（白名单外归 `focus`），取不到/为空回退内置「专注」；标签**不可拖拽、不绑任何监听**，点击它不改变行的展开/选中状态（契约用例 `tests/focus.test.mjs:646-682`，视觉规则 `style.css:2560-2572`）。
- **状态文字与归属**：行内状态用中性小标（`.focus-tree-state` `style.css:2392-2398`），文本由 `focusOrgStateLabel`（`src/focus.mjs:651`）给；展开面板的「归属」只有 `.focus-tree-expand-attr` 一个拼接点（`src/focus.mjs:3074`），`focusParentAttribution`（`src/focus.mjs:1113`）返回的实体不含前缀（`src/focus.mjs:1133`）。
- **两段式面板**：第一段字段由 `focusTreeExpandFields`（`src/focus.mjs:999`）给（状态 + 形态 + 归属；单元段 `src/focus.mjs:1007-1016`、编制段 `src/focus.mjs:1040-1047`，其中「是否计划中 / 计划截止日期」来自 `focusPlanNodeFields` `src/focus.mjs:799`），第二段三模块由 `focusExpandTagViews`（`src/focus.mjs:1058`，模板来自 `focusTemplateTriad` `src/focus.mjs:2009`）给；面板头部把**番号**（`src/focus.mjs:3040`）与**层次名**（`src/focus.mjs:3041`）拆成独立元素，不再并进标题（`:3042`）。
- **转正入口与门槛**：行内提示由 `focusFormalizeHint`（`src/focus.mjs:698`）给；判定链 `focusCombineReadiness`（`src/focus.mjs:658`）→ `focusIncompleteUnder`（`src/focus.mjs:672`）→ `focusUnitDone` / `focusOrgPending` / `focusNodeDone`（`src/focus.mjs:633` / `src/focus.mjs:638` / `src/focus.mjs:643`）；编制侧 `focusOrgCanFormalize`（`src/focus.mjs:1975`）/ `focusFormalizeOrg`（`src/focus.mjs:1994`）。**非计划组合（免计划）**的弹窗只渲染真正会被提交的字段——「截止日期」与「可转正最低下一级任务数」的输入在 `src/focus.mjs:3857-3868`（下限/上限 `src/focus.mjs:22` / `src/focus.mjs:23`），提交走 `focusCombineNodes`（`src/focus.mjs:1840`，来自计划时 `fromPlan=true`）。
- **让位机制与死代码守卫**：折叠键与行展开开关的样式「谁生效」由 `focusTreeFoldDefaults`（`src/focus.mjs:2978`）的死代码守卫决定——`focusCssDeclared`（`src/focus.mjs:2647`）查到 CSS 已声明 `.focus-tree-row .focus-tree-fold-level` 时立即早退（`src/focus.mjs:2979`），渲染端不再内联注入兜底样式；行展开态用 `aria-expanded`（`src/focus.mjs:3179`）+ `data-collapsed`（`src/focus.mjs:3181`）双写。
- **悬浮提醒**：清单由 `focusReminderInfo`（`src/focus.mjs:1142`）给；「已关闭」记忆键 `FOCUS_REMINDER_UI_KEY`（`src/focus.mjs:2667`），状态读写 `focusReminderUiState`（`src/focus.mjs:2672`，读 `src/focus.mjs:2676`；独立保存器 `focusReminderSaveUi` `src/focus.mjs:2685`，写 `src/focus.mjs:2688`）；`focusReminderClear`（`src/focus.mjs:2845`）清定时器与 `#focusReminder`，`focusReminderStart`（`src/focus.mjs:2854`）起 1s 心跳（`src/focus.mjs:2858-2860`），首挂载 `focusReminderEnsure`（`src/focus.mjs:2692`）→ `focusReminderSync`（`src/focus.mjs:2803`，`show` 分支 `src/focus.mjs:2808`）；箱体 `position: fixed` 锚右上（`style.css:2013`，不遮页头的锚定注释 `style.css:2006-2011`），样式与两态 `style.css:2012-2021` / `style.css:2052-2054` / `style.css:2055-2056`，窄屏收紧 `style.css:2080-2081`。
- **接线与设置侧**：`syncFocusReminder` 由 `src/learn.mjs` 在「错题」之外的主页视图渲染后调用（早退分支 `src/learn.mjs:624`、正常分支 `src/learn.mjs:655`，实现 `src/learn.mjs:658`）；行动设置里**已无**原「层次徽标」开关行（`src/settings.mjs:585` 注），风味行由 `flavor` 给出（`src/settings.mjs:577`）文案「显示中文序数层级名（第一任务集团 / 第82任务单元）；关闭时只留番号（◆1 总目标 / #82 名称）」；旧数据里携带的 `showLevelTag` 键被 `flavor` 静默忽略、不输出也不抛错（`src/settings.mjs:93`，守卫用例与 `focusUnitTypeLabel` / `focusOrgLabel` 同一批：`tests/focus.test.mjs:684-690`）。

### 13.5 里程碑与存储

- 里程碑数据键 `athena_mile_v1`（`src/mile.mjs:7` `MILE_KEY`）**已接入云同步**（参与合并、本地优先；字段口径见 `DATA_SCHEMA.md`，实现见 `ARCHITECTURE.md` §云同步）。里程碑定义是**代码常量**（三类谓词 `MILE_KINDS = ['habit', 'focus', 'learn']`，`src/mile.mjs:8`），不入存储、不入云。
- 红线不变（本波次未新增任何奖惩）：里程碑与行动模块**无积分、无物质兑换、无排行、无连击惩罚、无失败羞辱**（`src/mile.mjs:1-5`）；例题只入真实真题；层级与视觉改动不引入新的奖励或惩罚机制。

### 13.6 专注链置首与默认视图（导航接线 · t18 / t22）

- **专注链是行动模块首位、也是默认视图**：二级导航顺序 = `专注链` → `计划` → `习惯树` → `帮助`（`src/learn.mjs:630` 的 items；图标表 `src/learn.mjs:635`——改顺序必须两处同改）；从一级入口「行动」进入时默认落 `actFocus`（`src/actions.mjs:55` 的 `currentView = (arg === 'wrong') ? 'wrong' : (arg === 'wrongQuiz') ? 'quiz' : (arg === 'act') ? 'actFocus' : 'learn';`）；命令面板四条行动条目同序（`src/actions.mjs:679-682`）。
- **入口指向不许错位**：导图三处「专注链」芯片（`src/map.mjs:258` 注意三网络 / `:345` 专注链 · CTDP / `:498` 功能 ↔ 科学依据）都是 `nav: 'actFocus'`（t22 修正，原误指 `actPlan`）；「环境审计」类标签仍指 `actPlan`，因为环境审计内容已并入计划页的障碍步（`src/act.mjs:256` 注释）。帮助页顶部目录 `.act-help-toc`（`src/act.mjs:490-498`）与三枚「去专注链 / 去计划 / 去习惯树 →」入口（`actHelpNavChip`，`src/act.mjs:478`）分别落 `actFocus`/`actPlan`/`actHabit`。
- **错题自测入口（t18 建 · t28 收敛为唯一入口）**：**页内「错题自测」按钮已整体删除**（t28 纯减法：`wrongQuizEntry()` 函数与三处调用 `:165`/`:410`/`:511` 一并移除，`src/wrong.mjs` 只留 `:144-148` 的说明注释），唯一入口是错题模块二级功能栏的「自测」项；`wrongQuiz → quiz` 的视图改写、进入前会话守卫见 `ARCHITECTURE.md` 的「错题模块二级导航（错题自测 · t18）」节。导图两处功能清单也含该入口（`src/map.mjs:26`、`:467` 的 `{ label: '错题自测', nav: 'wrongQuiz' }`）；map 的 `nav` 取值与 `src/actions.mjs` 的 `case 'nav'`/`case 'module'` 取值集合由 `tests/map.test.mjs` 对账（死链转红，可用 `ATHENA_MAP_FILE`/`ATHENA_ACTIONS_FILE` 反证）。
- **帮助页小节顺序 = 二级导航顺序**：专注链 → 计划 → 习惯树（攻略 + 规则）→ 详见知识库，由 `src/act.mjs:614` 的 `[sec2, sec3, sec1, sec4, sec5].forEach(function (p) { wrap.appendChild(p); });` 追加序决定（构造仍是 sec1…sec5）；五个小节各有锚点 id：`#act-help-focus`（sec2）/ `#act-help-plan`（sec3）/ `#act-help-habit`（sec1）/ `#act-help-habit-rules`（sec4）/ `#act-help-kb`（sec5），目录项点击走 `scrollIntoView({ block: 'start' })`。
- **切科不丢视图**：`switchSubject()`（`src/actions.mjs:536` 起）在切换前捕获 `const wasBank = currentView === 'bank'`（`:540`），加载完成后 `currentView = wasBank ? 'bank' : 'learn'`（`:547`）——题库页切全局学科后仍停留题库，其它视图仍落学习页；避免行动/题库入口互踢。
- 状态回写（t13 / t18 / t22 / t23 / t25 / t27 / t28 / t29 / t31 / t32 / t41 / t42）：§13.1 的免计划组合与转正门槛、§13.3 的取号调用点与读入路径、§13.4 的层级视觉（去彩色 · 树杈引导步长 · 行即展开 · 状态标签 · 折叠键 · 归属行 · 提醒交互）、§13.6 的导航接线与错题自测唯一入口，均已按实际实现逐条回读核对；本文件引到的每个 `文件:行号` 可用 `node backup/scratch/docs-flavor/verify-refs2.mjs` 复核（在 docs-refresh 版符号锚点闸门之上加 t41/t42 新结构断言：风味层级名两态、单元类型标签位置、层次徽标 0 命中、旧键 showLevelTag 静默忽略；脚本重新解析符号锚点、打印真实行文本，行号漂移即转红），原始版见 `node backup/scratch/docs-refresh/verify-refs.mjs`（脚本重新解析符号锚点、打印真实行文本，行号漂移即转红），裸引用（`:123` 这种省略文件名的写法）另有 `node backup/scratch/docs-refresh/audit-bare-refs.mjs` 逐条打印归属与真实行。