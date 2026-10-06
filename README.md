# Athena

**综合自我提升平台**：记忆内核 + 行动系统。用 FSRS-6 把知识记牢，用习惯树 / 专注链 / WOOP 把日子过稳。

- **记忆内核**：FSRS-6 调度、交错练习、错题本、25 学科知识卡（考研 / 技能 / 语言 / 通识）
- **行动系统**：习惯树（RSIP）· 专注链（CTDP）· WOOP 计划 · 里程碑成就
- **知识库**：原理页五分类可检索，条目标注研究者 / 年份 / 证据等级 🟢🟡⚠️
- **多端**：PWA 离线可用 + 可选 Tauri 桌面版 + GitHub 云同步

## 使用

- **网页 / PWA**：双击 `index.html`，或用 `serve.ps1` 起本地服务器；部署到 HTTPS 静态托管后可「添加到主屏幕」离线使用。
- **桌面版**：用 Tauri 打包为 Windows / macOS / Linux 原生应用，见 [`docs/DESKTOP.md`](docs/DESKTOP.md)。
- **多端同步**：设置页配置 GitHub 私仓 Token 后，手机 / 电脑学习数据自动保持一致（本地优先，断网可用；覆盖前自动归档，不丢数据）。

## 功能一览

| 模块 | 做什么 |
|---|---|
| **知识卡** | FSRS-6 间隔重复；交错辨析；掌握度与考试日预期；每日新卡上限 / 初学者路径 |
| **错题本** | 真题错题按记忆重现；失败联动降级关联知识点；键盘刷卡与回看 |
| **习惯树** | 层级习惯 + 每日检查 / 今日结算；容忍天数与标签组；SVG 思维导图 |
| **专注链** | 任务单元计时；编制树番号（# ● ▲ ◆）；判例与侦查转正；主链 |
| **计划** | WOOP 四步；如果-那么执行意图；环境审计 |
| **里程碑** | 叙事向成就（无积分 / 排行 / 连击惩罚）；主页最多露出 1 条 |
| **原理** | 学习科学 / 习惯 / 动机 / 注意 / 情绪…可检索知识库 |
| **统计** | 掌握度趋势、热力图、学习报告、未来负载预测 |

## 技术栈

- 纯静态前端：`index.html` + `style.css` + `app.js` + `sw.js`，零 npm 依赖
- 公式渲染：KaTeX（本地 `katex/`）
- 记忆算法：FSRS-6（官方 21 参数默认权重）
- 数据：`data/` 下按学科拆分的 JS 文件；行动数据键与学习库隔离

## 开发与校验

> AI 协作入口见 [`AGENTS.md`](AGENTS.md)（命令速查、禁区、文档地图）；架构 / 数据结构 / 工作流见 [`docs/`](docs/)。

`app.js` 由 `src/` 拼接生成（需 Node ≥ 18，零 npm 依赖）。推荐用 npm 脚本（`package.json` 仅作任务入口，无需 `npm install`）：

```bash
npm run build         # 重新生成 app.js 并同步桌面版 dist/（等价 node tools/build.mjs + build-tauri）
npm test              # 单元测试（FSRS 对拍 / 交错 / 调度状态机 / 错题调度 / 云同步 / 负载预测）
npm run check         # 数据完整性 + 版本一致性（含 tauri/dist）+ CHANGELOG/app.js 同步校验
npm run check:render  # 渲染不变量（需 Chrome/Edge）
```

等价的底层命令与工具说明见 `tools/README.md`。推送/PR 时 GitHub Actions 会自动跑构建同步校验、测试与各道闸门（`.github/workflows/ci.yml`）。

## 版本

当前 **v2.0.0**。完整变更见 [`CHANGELOG.md`](CHANGELOG.md)；2.0 发行介绍见 [`docs/RELEASE-2.0.0.md`](docs/RELEASE-2.0.0.md)。

## 许可证

[MIT](LICENSE)
