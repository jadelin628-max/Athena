# AGENTS.md — Athena AI 协作入口

> 新会话冷启动只读本文件即可开工；细节按需点开深文档。**不要整仓通读**。

Athena：考研/技能/语言卡片记忆应用。FSRS-6 调度 + 交错练习 + 错题本 + GitHub 云同步。纯静态前端（零 npm 依赖），可选 Tauri 桌面版。

## 必读地图

| 要做什么 | 先读 | 再读 |
|---|---|---|
| 任意改动 | 本文件 | `docs/WORKFLOW.md` |
| 派单 / 收口 / 看活任务 | `docs/BOARD.md` | `docs/WORKFLOW.md` §7 |
| 改模块 / 排查逻辑 | `docs/ARCHITECTURE.md` | 对应 `src/*.mjs` |
| 改卡片 / 学科数据 | `docs/DATA_SCHEMA.md` | 同科 `data/<id>.js` 抽样 |
| 改工具 / 校验失败 | `tools/README.md` | 对应 `tools/*.mjs` |
| 打包桌面版 | `docs/DESKTOP.md` | — |
| 用户向说明 | `README.md` | — |
| 版本历史语义 | `src/app.mjs` 的 `CHANGELOG` | `CHANGELOG.md`（生成物） |

算法红线与内容范围见下文「内容与算法」；原 `开发标准.md` 已合并入库并归档。

## 命令速查（Node ≥ 18，无需 npm install）

```bash
npm run build          # src/ → app.js + 同步 dist/（改 src 后必跑）
npm run build:check    # 仅校验 app.js 与 src/ 是否同步
npm run build:tauri    # 同 npm run build（显式别名）
npm test               # 单元测试
npm run check          # 数据 + 版本 + CHANGELOG + 构建同步（总闸）
npm run check:render   # 渲染不变量（需 Chrome/Edge）
npm run changelog      # 由 src/app.mjs 的 CHANGELOG 生成 CHANGELOG.md
```

分项：

```bash
node tools/check_data.mjs      # 改 data/*.js 后
node tools/check_render.mjs    # 改 data/*.js 或渲染逻辑后
node tools/check_version.mjs   # 升版本后（七处一致）
node tools/changelog.mjs       # 改 src/app.mjs CHANGELOG 后生成 CHANGELOG.md
node tools/changelog.mjs --check
```

## 仓库骨架

```
index.html          # 入口：先加载 data/*.js，再加载 app.js
style.css / sw.js   # 样式 / Service Worker（缓存版本跟发版走）
app.js              # 【生成物】tools/build.mjs 拼接 src/，禁止手改
src/*.mjs           # 源模块（固定顺序拼接，见 ARCHITECTURE）
data/<subj>.js      # 25 学科卡片库（window.SUBJECTS）
tools/              # 构建与校验闸门
tests/              # node:test
docs/               # 架构 / 数据 schema / 工作流（活文档；历史归档 backup/docs-archive/）
dist/ src-tauri/    # 桌面版（构建同步，目标产物 gitignore）
backup/             # 数据与文档归档（gitignore）
```

## 内容与算法

**算法**：FSRS-6 核心（难度/稳定度/可提取性、遗忘曲线、间隔、短时记忆）一律对齐官方 ts-fsrs/fsrs-rs v6.x（21 权重）。非官方/自创必须标 ⚠️ 并先请示。已标 ⚠️ 的自创：掌握度 = 稳定度 S 到目标 S_N 的对数压缩。

**内容范围（北大光华 431 + 数三 + 通识）**：

- 431 = 微观经济学 + 数理统计（含计量）；**无宏观/金融**。数三 = 高数 + 线代（概率统计归「统计」科）。
- 教材锚点：统计 = 茆诗松/何书元/陈家鼎 + 古扎拉蒂/伍德里奇；微观 = 平新乔十八讲/范里安；数三 = 考纲。
- 例题**仅真实真题**；无真题不配例题（严禁编造）；一道真题可跨知识点复用。
- 卡面写法与校验归属见 `docs/DATA_SCHEMA.md`（加粗 `\textbf{}` 与 `**…**` 勿混用）。

**技能 / 语言科（教材化 · 面向初学者）**：

| 科 | 教材锚点（目录=章节骨架） | 科 | 教材锚点 |
|---|---|---|---|
| Python | 《Python 编程：从入门到实践》（已完成） | 日语 | 《标准日本语》初级 |
| C | K&R《C 程序设计语言》 | 韩语 | 《延世韩国语》1–2 |
| C++ | 《C++ Primer》 | 法语 | 《简明法语教程》 |
| Java | 《Head First Java》 | 西语 | 《现代西班牙语》 |
| JavaScript | 《JavaScript 高级程序设计》 | AI | 自建「原则与实践」（无单一经典） |
| Rust | The Book | | |

- **技能卡三段**：概念定义 → `~~~` 最小可运行示例（含教学注释）→ 要点/陷阱。  
- **语言卡三段**：规则 → 例句（原文+中文翻译）→ 活用限制；朗读走 SENTENCES/🔊。  
- 描述/答疑进 `HELP`，不进学习队列；`CATS`/`ORDER`/`BEGINNER` 对齐教材章序。  
- **整科重构 = 整科重置**：新卡 id，学习进度重置（Python v1.41 先例）；只扩不改骨架可保留 id。重构报告必须写明进度策略。


## 硬禁区

1. **禁止手改 `app.js`、`CHANGELOG.md`、`dist/`**——均为生成物；改源后跑对应生成命令。
2. **FSRS-6 公式不得自创**——核心以官方 ts-fsrs/fsrs-rs v6.x（21 权重）为准；非官方改动标 ⚠️ 并先请示。
3. **例题仅真实真题**——严禁编造；无真题不配例题。
4. **UTF-8 数据文件禁用 PowerShell 默认 GBK 读写**——用写入工具或 Python utf-8；备份到 `backup/`；子代理不并行改同一文件。
5. **正文不得泄漏内部卡片 id**（如 `（cu26）`）——`check_data` **ERR**；`**`/`$` 未成对是 **WARN**（仍应修）；渲染残留命令由 `check_render` 拦。
6. **不引入 npm 运行时依赖**；测试用 `node --test`；构建零依赖。
7. **未明确要求不 commit / 不 push**；不在 `data/*.js` 里改学习进度数据。

## 改 X 跑 Y

| 改了 | 必跑 |
|---|---|
| `src/*.mjs` | `npm run build` → `npm test` |
| `src/render*.mjs` 或卡面文案结构 | 另加 `npm run check:render` |
| `data/*.js` | `node tools/check_data.mjs` + `node tools/check_render.mjs` |
| 版本号（七处） | `node tools/check_version.mjs` |
| `src/app.mjs` 内 `CHANGELOG` | `node tools/changelog.mjs` |
| 发版 / 合并前 | `npm run check` + `npm test` |

版本七处：`src/app.mjs` `VERSION`（构建进 `app.js`，`check_version` 读的是 `app.js`） · `CHANGELOG` 条目 · `sw.js` 缓存版本 · `index.html` `?v=` · `package.json` · `src-tauri/tauri.conf.json` · `dist/`（由 build 同步）。SemVer：patch=修，minor=功能，major=破坏。

## Vibe coding 纪律（摘要）

完整约定见 `docs/WORKFLOW.md`。硬规则：

- **先查文档再读代码**；文档与代码冲突时以代码为准，并回写文档。
- **禁止臆造**文件名、字段、命令、API——不确定就 grep/读文件，不写进回复当事实。
- **一次会话一个可验收切片**；大需求先列 3–8 条任务再动手，完成一条勾一条。
- **上下文不堆长对话**：结论、决策、schema 落盘到文档/Spec；会话只保留当前切片。
- **改完必过闸门**；测试失败先复现根因，禁止连续盲改（两次失败停手重推）。
- **多对话协作**见 `docs/WORKFLOW.md` §7 与 [`docs/BOARD.md`](docs/BOARD.md)：共享层=文档/任务/diff 而非聊天记录；同文件禁止两路并行写；切片开场三句话；升版只在主对话；**派单与收口报告写入 BOARD**（执行者只追加自己块的报告，验收后由主对话归档，规则头永不清理）。
