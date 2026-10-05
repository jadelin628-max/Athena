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
<!-- 已归档：T35 专注链 UI 重构 → backup/docs-archive/board/2026-10-05-T35-focus-ui.md -->
<!-- 已归档：T36 设计/字体/图表 → backup/docs-archive/board/2026-10-T36-design-typography-charts.md -->
<!-- 已归档：T37 里程碑 → backup/docs-archive/board/2026-10-T37-milestones.md -->
<!-- 已归档：T37b 里程碑风味名扩展 → backup/docs-archive/board/2026-10-05-T37b-mile-flavor.md -->
<!-- 已归档：T38 空态插画 → backup/docs-archive/board/2026-10-T38-empty-illustrations.md -->

