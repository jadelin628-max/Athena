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

- 四级固定顺序 **`unit` 单元 → `group` 组 → `corps` 群 → `army` 集团**，秩由 `FOCUS_LEVEL_RANK = { unit: 0, group: 1, corps: 2, army: 3 }`（`src/focus.mjs:20`）给出；层键合法性看 `focusIsLevelKey`（`src/focus.mjs:513`）、是否编制层看 `focusIsOrgLevel`（`src/focus.mjs:517`），未知键秩为 -1（`focusLevelRank` `src/focus.mjs:521`，反查 `focusLevelAtRank` `src/focus.mjs:526`）。
- **只有相邻层级可归属**：`focusCanAttach(childLevel, parentLevel)` 的判据是 `c >= 0 && p >= 1 && p === c + 1`（`src/focus.mjs:544-548`）——单元只能挂组、组只能挂群、群只能挂集团，**集团不能再有父级**（顶层）；故 `focusParentLevelOf`（`src/focus.mjs:533`）对集团/未知返回 `null`、`focusChildLevelOf`（`src/focus.mjs:538`）对单元返回 `null`。越级挂靠、自环、把自己拖进自身子孙一律拒绝（`focusAttachNodes` `src/focus.mjs:670`，原因 `empty_selection` / `bad_parent`），**拒绝时零写入**。
- **组合（多选合并）后的层次 = 成员最高层 + 1**：`focusCombineLevelOf`（`src/focus.mjs:558-565`）取成员秩最大值 +1 后反查层键；成员最高层已是集团 → 返回 `null` → 拒绝，原因 `no_level_up`（`src/focus.mjs:1499`）；成员层级不一致（混层）→ 原因 `member_level_mismatch`（`src/focus.mjs:1502`）；父级非法 → `bad_parent`（`src/focus.mjs:1507`）。`focusCombineNodes`（`src/focus.mjs:1489-1509`）任一拒绝分支都不落盘。
- 新建编制节点 `focusCreateOrg`（`src/focus.mjs:1384-1422`）只在**计划模式**下可用；其父级判定同样走 `focusCanAttach`（`src/focus.mjs:1415` → `bad_parent`）。

### 13.2 计划参数（任意层级都可设「最低下一级任务数」与「截止日期」）

- 顶层「＋计划任务」（`src/focus.mjs:3279-3280`）、树内「＋子级」（`src/focus.mjs:3368-3369`）与组合入口（`src/focus.mjs:3443-3444`）**共用同一套字段**：名称 + 最低下一级任务数 + 截止日期；提交统一走 `focusPlanNodeFields(raw, dfltMinChildCount)`（`src/focus.mjs:656-666`），返回 `{ ok:true, name, dueAt, minChildCount }` 或 `{ ok:false, reason:'bad_due' }`。
- **最低下一级任务数**：`focusNormalizeMinChildCount(v, dflt)`（`src/focus.mjs:607-622`）——空值/非法值回退默认（两个新建入口的默认值都是 1），否则取整并夹在 `FOCUS_MIN_CHILD_MIN = 1` ~ `FOCUS_MIN_CHILD_MAX = 99`（`src/focus.mjs:22-23`；表单 `min`/`max` 同值，`src/focus.mjs:3279-3280`）；配套校验 `focusMinChildCountValid`（`src/focus.mjs:618`）。
- **截止日期**：`focusNormalizeDueAt(v)`（`src/focus.mjs:626-648`）接受 Date / 大于 0 的时间戳 / ≥10 位数字串 / `YYYY-MM-DD` 文本，日期一律**归一为当日 23:59:59**（`new Date(y, mo-1, d, 23, 59, 59, 0)`）。**非法日期被拒**：除格式外还回读年月日比对（`dt.getFullYear() !== y || dt.getMonth() !== mo-1 || dt.getDate() !== d`），因此 `2024-02-31` 这类不存在的日期不会被静默顺延，直接判 `bad_due`。空值是**合法**输入（`focusDueDateValid` `src/focus.mjs:650-653`，截止日期可选）。
- 计划模板新建（`focusTemplateTriad` `src/focus.mjs:1637`，其中 `src/focus.mjs:1657-1660` 调用 `focusNormalizeDueAt` / `focusNormalizeMinChildCount` / `focusNextSeq`）与完成预览的取号复用同一组函数（`src/focus.mjs:1140`、`src/focus.mjs:2246`、`src/focus.mjs:3151` 用 `focusNextSeq(st, 'unit')`），保证「模板 / 手建 / 补齐」三条路径口径一致。

### 13.3 番号复用（同层取最小空缺号）

- 取号规则：`focusNextSeq(state, level)`（`src/focus.mjs:568-586`）在**同层现有号**里从 1 递增取**最小空缺号**——单元看 `units[].seq`，编制层只看同 `level` 的 `orgs[].seq`。于是**已有号不变、同层不重号**，删掉中间节点后新建的节点会**补缺**而不是顺延到最大号之后。
- 新建编制节点时即取号（`focusCreateOrg` `src/focus.mjs:1418` `org.seq = focusNextSeq(next, level)`）；**级联删除**（`focusDeleteOrg` `src/focus.mjs:1433-1458`，删除节点连同其全部子孙）之后，各级按 `focusMaxSeq`（`src/focus.mjs:589-602`）把**同层计数器归位**（`src/focus.mjs:1453-1456` `next.seq[lv] = focusMaxSeq(next, lv)`），不留虚高计数。
- 历史数据里虚高的计数器由 `focusSanitizeState`（`src/focus.mjs:307`，读入路径 `src/focus.mjs:416`、`src/focus.mjs:1840`）在读入时收敛，避免旧号段把新号顶到很大的数字（旧数据不会因取号规则变化而改号）。

### 13.4 层级视觉与悬浮提醒（UI）

- 层级**视觉标识**：番号前缀沿用 §11.3（`#N` 单元 / `●N` 组 / `▲N` 群 / `◆N` 集团），挂在 `.focus-tree-row[data-level=…]`（`src/focus.mjs:2616`）与 `.focus-level-mark`（`src/focus.mjs:2628`）上；四级逐级加重——字号 12.5 / 14 / 15.5 / 17px、字重 400 / 600 / 700 / 800、左边框 2 / 3 / 4 / 5px（`style.css:2059-2078`），取色单元 `--text-muted`、组 `--accent`、群 `--accent-2`、集团 `--warn`（`style.css:2082-2085`）。
- **归属可见**：行内父级 chip `.focus-parent-chip`（`src/focus.mjs:2306`，`style.css:2107-2121`）显示当前父级（`data-parent-level` / `data-parent-id`，边框色随父层级），**未编入任何父级**时用 `.is-free` 变体；层级徽章 `.focus-level-badge`（`src/focus.mjs:2286`）；树内引导线 `.focus-tree-guide`（`src/focus.mjs:2638`，`style.css:2080`）。
- **样式让位机制**：以上选择器一律先经 `focusCssDeclared(selector)`（`src/focus.mjs:2264`）判断 `style.css` 是否已声明；**已声明就不注入行内样式**（样式全部落在 `style.css`），未声明才由行内兜底。后续改这套视觉**优先改 `style.css`**，行内只保留必要项。
- **剩余时间悬浮提醒**：专注与预约的剩余时间提醒挂在 `#focusReminder.focus-reminder`（`style.css:2124-2171`），由 `focusReminderEl` / `focusReminderUi` / `focusReminderSync`（`src/focus.mjs:2323-2501`）维护，用**独立 1s 定时器**（`setInterval(…, 1000)` `src/focus.mjs:2489-2495`），与既有的 `focusTickTimer` 分离、互不拖累，**任意视图可见**。可折叠（折叠状态写入 `FOCUS_REMINDER_UI_KEY` 持久化，`src/focus.mjs:2343`）；关闭**仅本次**（`closedKey` `src/focus.mjs:2397`，不写成永久关闭）。预约用 `data-mode="appoint"`（`--accent-2` 取色，`style.css:2169-2171`）与专注区分，超时态 `.is-expired`（`style.css:2167-2168`）。
- 接线：`src/learn.mjs` 的 `renderSubnav` 在**两条出口**都调用 `syncFocusReminder()`（`src/learn.mjs:623-624` 的早退分支与 `src/learn.mjs:654` 的正常分支；实现 `src/learn.mjs:657-661`，内部 try/catch），因此切到主页/设置/原理/里程碑等不渲染树的视图时提醒仍照常刷新。

### 13.5 里程碑与存储

- 里程碑数据键 `athena_mile_v1`（`src/mile.mjs:7` `MILE_KEY`）**已接入云同步**（参与合并、本地优先；字段口径见 `DATA_SCHEMA.md`，实现见 `ARCHITECTURE.md` §云同步）。里程碑定义是**代码常量**（三类谓词 `MILE_KINDS = ['habit', 'focus', 'learn']`，`src/mile.mjs:8`），不入存储、不入云。
- 红线不变（本波次未新增任何奖惩）：里程碑与行动模块**无积分、无物质兑换、无排行、无连击惩罚、无失败羞辱**（`src/mile.mjs:1-5`）；例题只入真实真题；层级与视觉改动不引入新的奖励或惩罚机制。

### 13.6 专注链置首与默认视图（导航接线 · t18 / t22）

- **专注链是行动模块首位、也是默认视图**：二级导航顺序 = `专注链` → `计划` → `习惯树` → `帮助`（`src/learn.mjs:629` 的 items；图标表 `src/learn.mjs:634`——改顺序必须两处同改）；从一级入口「行动」进入时默认落 `actFocus`（`src/actions.mjs:43` 的 `currentView = (arg === 'wrong') ? 'wrong' : (arg === 'act') ? 'actFocus' : 'learn';`）；命令面板四条行动条目同序（`src/actions.mjs:662-665`）。
- **入口指向不许错位**：导图三处「专注链」芯片（`src/map.mjs:258` 注意三网络 / `:345` 专注链 · CTDP / `:498` 功能 ↔ 科学依据）都是 `nav: 'actFocus'`（t22 修正，原误指 `actPlan`）；「环境审计」类标签仍指 `actPlan`，因为环境审计内容已并入计划页的障碍步（`src/act.mjs:256` 注释）。帮助页顶部目录 `.act-help-toc`（`src/act.mjs:490-498`）与三枚「去专注链 / 去计划 / 去习惯树 →」入口（`actHelpNavChip`，`src/act.mjs:478`）分别落 `actFocus`/`actPlan`/`actHabit`。
- **帮助页小节顺序 = 二级导航顺序**：专注链 → 计划 → 习惯树（攻略 + 规则）→ 详见知识库，由 `src/act.mjs:614` 的 `[sec2, sec3, sec1, sec4, sec5].forEach(function (p) { wrap.appendChild(p); });` 追加序决定（构造仍是 sec1…sec5）；五个小节各有锚点 id：`#act-help-focus`（sec2）/ `#act-help-plan`（sec3）/ `#act-help-habit`（sec1）/ `#act-help-habit-rules`（sec4）/ `#act-help-kb`（sec5），目录项点击走 `scrollIntoView({ block: 'start' })`。
- **切科不丢视图**：`switchSubject()`（`src/actions.mjs:523` 捕获 `wasBank`、`:530` 写回）——题库页切全局学科后仍停留题库，其它视图仍落学习页；避免行动/题库入口互踢。
- §13.4 的层级视觉与悬浮提醒条目本轮**只核对口径、未改动**：`focusCssDeclared`（`src/focus.mjs:2264`）、层级视觉（`style.css:2059-2121`）、悬浮提醒 `#focusReminder.focus-reminder`（`style.css:2124-2171`，独立 1s 定时器 `src/focus.mjs:2489-2495`）、接线两条出口（`src/learn.mjs:623-624` / `:654`）逐条与源码一致。