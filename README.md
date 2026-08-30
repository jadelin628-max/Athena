# Athena · 考研知识点记忆

北大光华金融硕士 431（微观经济学 + 数理统计）、考研数学三、思想政治理论的知识点卡片记忆应用。基于主动回忆与间隔重复（FSRS-6 调度）。

## 运行

- **本地**：双击 `index.html`，或用 `serve.ps1` 启动本地服务器（启用 PWA 离线）。
- **移动端**：部署后经 HTTPS 访问，可「添加到主屏幕」离线使用。

## 技术栈

- 纯静态：`index.html` + `style.css` + `app.js` + `sw.js`（无构建、无依赖）
- 数学渲染：KaTeX（本地 `katex/`）
- 记忆算法：FSRS-6（21 参数官方默认权重）
- 数据：`data/` 下按学科拆分的 JS 文件

## 数据与校验

内容以真实真题为例题，卡片数据在 `data/*.js`。改完代码或数据后跑校验（零 npm 依赖）：

```bash
node tools/check_data.mjs      # 数据完整性 + 内容不变量
node tools/check_render.mjs    # headless 渲染不变量（需本机 Chrome/Edge）
node tools/check_version.mjs   # 版本标记一致性
```

详见 `tools/README.md`。
