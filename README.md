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

`app.js` 由 `src/` 拼接生成；改完代码或数据后运行（需 Node ≥ 18，零 npm 依赖）：

```bash
node tools/build.mjs                                        # 重新生成 app.js
node --test tests/fsrs.test.mjs tests/interleave.test.mjs   # 纯函数对拍
node tools/check_data.mjs                                   # 数据完整性
node tools/check_render.mjs                                 # 渲染不变量（需 Chrome/Edge）
node tools/check_version.mjs                                # 版本一致性
```

详见 `tools/README.md`。

## 许可证

[MIT](LICENSE)
