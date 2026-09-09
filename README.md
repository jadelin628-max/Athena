# Athena

基于认知科学原理开发的卡片记忆与学习应用。

## 使用

- **网页 / PWA**：双击 `index.html`，或用 `serve.ps1` 起本地服务器；部署到 HTTPS 静态托管后可「添加到主屏幕」离线使用。
- **桌面版**：用 Tauri 打包为 Windows / macOS / Linux 原生应用，见 `TAURI.md`。

## 技术栈

- 纯静态前端：`index.html` + `style.css` + `app.js` + `sw.js`，零 npm 依赖
- 公式渲染：KaTeX（本地 `katex/`）
- 记忆算法：FSRS-6（官方 21 参数默认权重）
- 数据：`data/` 下按学科拆分的 JS 文件

## 开发与校验

`app.js` 由 `src/` 拼接生成（需 Node ≥ 18，零 npm 依赖）。推荐用 npm 脚本（`package.json` 仅作任务入口，无需 `npm install`）：

```bash
npm run build         # 重新生成 app.js 并同步桌面版 dist/（等价 node tools/build.mjs + build-tauri）
npm test              # 单元测试（FSRS 对拍 / 交错 / 调度状态机 / 错题调度）
npm run check         # 数据完整性 + 版本一致性（含 tauri/dist）+ CHANGELOG/app.js 同步校验
npm run check:render  # 渲染不变量（需 Chrome/Edge）
```

等价的底层命令与工具说明见 `tools/README.md`。推送/PR 时 GitHub Actions 会自动跑构建同步校验、测试与各道闸门（`.github/workflows/ci.yml`）。

## 许可证

[MIT](LICENSE)
