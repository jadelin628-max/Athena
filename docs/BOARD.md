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
<!-- 已归档：T36 设计/字体/图表 → backup/docs-archive/board/2026-10-T36-design-typography-charts.md -->

---
### T35 专注链 UI 重构（去链状态/主链/计划并入状态/树内操作）
- 状态: in-progress
- 负责: 切片对话（主对话亲派）
- 文件集: 仅 `src/focus.mjs`、`tests/focus.test.mjs`、`style.css`
- 依据: 主对话亲派六条 + V2_PLAN §10.2–10.3
- 依赖: 无
- 验收:
  1. 专注模块去链状态；计划并入「状态」；精锐→主链（唯一，可继承）；风味/三三制仅设置；树内多选/拖放组合+计划转正；单元/高层信息与聚合；完成度询问+日均完成度趋势
  2. `npm run build` + `node --check app.js` + `npm test` → PASS
- 升版: 不升（保持 2.0.0）

### 报告
<!-- 执行者一次追加；格式 WORKFLOW §7.4：改了什么 → 闸门 PASS/FAIL → 未做项 -->
- **改了什么**（六条对照）:
  1. **链状态面板已去除**（专注页仅保留判例区）
  2. **计划模式并入「状态」tab**（原 编制/计划 合并；tab=专注|状态|统计）
  3. **精锐链→主链** `tier:'main'`（旧 `elite` 自动迁移）；同一时间仅一条（`focusCreateMainChain`：重新创建|从普通链继承）；主链崩溃→最强普通链继位
  4. **风味/三三制仅设置项**，模块内无开关（`focusSetFlavor`/`focusSetStructure` 留 T33 设置栏）
  5. **状态树内可视化操作**：多选 checkbox+拖放组合（`focusAssignUnits`/`focusReparentOrgs`）、行内＋子级/改名/转正/删；**高层次创建须计划模式**；计划节点须≥1 下级才可 `focusFormalizeOrg` 转正
  6. **单元可改名**（`focusSetUnitName`）+完成度/时长/起止；**高层聚合** `focusOrgAggregates`（子树总起止/总时长/均完成度）
  7. **完成度询问实装**：计时到点自动弹窗（达成+0–100%+可选名）；**日均完成度** `focusDailyAvgCompletion` 进趋势图（柱=分钟，点=均完成度）
- **闸门**: `npm run build` + `node --check app.js` + `build:check` + `npm test` **143/143 PASS**（focus 25/25）
- **未做项**: commit/push（**仍不推送**）；**不升版本**（2.0.0）；设置栏 UI 归 T33
<!-- 已归档：T37 里程碑 → backup/docs-archive/board/2026-10-T37-milestones.md -->
<!-- 已归档：T38 空态插画 → backup/docs-archive/board/2026-10-T38-empty-illustrations.md -->

---
### T37b 里程碑风味名扩展（50 条 · Steam 成就腔）
- 状态: in-progress
- 负责: 切片对话（T37 续作，主对话口头追加）
- 文件集: 仅 `src/mile.mjs`、`tests/mile.test.mjs`
- 依据: T37 归档件 + V2_PLAN §12 · ACT §12；主对话口述「约 50 条 + 有趣风味名」
- 依赖: T37（已归档）
- 验收:
  1. `MILESTONE_DEFS` 扩至约 50 条；title 为 Steam 式风味名；hint/meaning 仍是条件+「这说明…」
  2. 原 9 条 id 保留（Hit 兼容）；规则纯函数可测
  3. `npm run build` + `node --check app.js` + `npm test` + `npm run check` PASS
- 升版: 不升（保持 2.0.0）

### 报告
<!-- 执行者一次追加；格式 WORKFLOW §7.4：改了什么 → 闸门 PASS/FAIL → 未做项 -->
- **改了什么**:
  1. **9 → 50 条**（习惯 17 / 专注 18 / 学习 15）；title 全部换 Steam 式风味名（示例：定式已成 / 七日之约 / 破土而出 / 继位大典 / 侦察兵转正 / 肝帝觉醒 / 千锤百炼 / 今日功成 / 时间领主）
  2. **结构不变**：`hint` 仍是可核对条件，`meaning` 仍以「这说明」开头，`go` 深链习惯/专注/学习；无积分/排行/兑换/连击惩罚/失败羞辱
  3. **原 9 条 id 保留**（`mile_habit_full` 等），已落盘 Hit 不丢；仅 title 换风味名
  4. **快照扩容**（`mileEmptySnapshot`）：习惯 treeCount/libraryCount/maxLevel/maxDoneCount/midInternalize/tagCount/oldestTreeDays；专注 totalUnits/totalMinutes/precedents/scoutPromoted/perfectUnits/typeCount/focusStreak；学习 totalReviews/subjectsStarted/subjectsCleared/maxDailyReviews/maxDailyStudyMin/allClearToday。`mileCollectSnapshot` 仍只读 habit/focus/学习公开状态
  5. **测试 23/23**：边界（49/50、99/100、1199/1200…）、满条件一次 50 条、风味名唯一契约、原 id 兼容
- **闸门**: `npm run build` + `node --check app.js` + `npm test` **178/178 PASS**（mile 23/23）+ `npm run check` 全绿
- **未做项**: commit/push（**仍不推送**）；**不升版本**（2.0.0）；云同步合并 mile 归后续
