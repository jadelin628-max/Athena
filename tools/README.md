# tools/ —— 工程校验工具

零 npm 依赖（Node ≥18；渲染校验需本机装有 Chrome 或 Edge）。

| 脚本 | 作用 | 命令 |
|---|---|---|
| `check_data.mjs` | 数据完整性 & 内容不变量（结构 + 正文泄漏内部编号 + `**`/`$` 未闭合） | `node tools/check_data.mjs` |
| `check_render.mjs` | 渲染不变量：headless Chrome 跑真实 `renderTex`+KaTeX，断言 0 katex-error / 0 字面 `**` / 0 残留 LaTeX 命令 | `node tools/check_render.mjs` |
| `check_version.mjs` | 版本标记一致性七处（app.js VERSION+CHANGELOG / sw.js / index.html ?v= / package.json / tauri.conf.json / dist/app.js） | `node tools/check_version.mjs` |
| `build.mjs` | 零依赖构建：按固定顺序拼接 `src/*.mjs` → 根目录 `app.js`；`--check` 只校验同步、不写盘 | `node tools/build.mjs` / `npm run build:check` |
| `build-tauri.mjs` | 把运行时文件同步到 `dist/`，供 Tauri 桌面版打包（`npm run build` 已串接） | `node tools/build-tauri.mjs` |
| `changelog.mjs` | 由 `src/app.mjs` 的 `CHANGELOG` 数组生成根目录 `CHANGELOG.md`；`--check` 校验一致性 | `node tools/changelog.mjs` |
| `bank-cv.mjs` | 卡片 `EXAMPLE` → 题库派生块的**哨兵原位替换**生成通道（T141 取代 t32/t49/t62 三段一次性生成器）；改 `EXAMPLE` 后必跑，见 `docs/CARD-STANDARD.md` §4 | `node tools/bank-cv.mjs --subject <sid> --write --allow-workspace-write` |
| `athena-cli.mjs` | 终端数据编辑 CLI（阶段 A：Git 即数据库） | `node tools/athena-cli.mjs` |
| `refs-extract.mjs` / `refs-vision.py` | 参考资料取证流水线：扫描版 PDF → 可检索文本 + 质量报告 / 读图裁定裁片（离线取证用，不参与日常闸门） | 见各脚本头部注释 |

（历史一次性脚本 `check_math3.py` 已删除——被 `check_data.mjs` 取代，且写死了本机旧路径；`backup/scratch/bank-cv{,2,3}/build-*.mjs` 已由 `bank-cv.mjs` 取代，仅留档、不可重跑。）

## 何时跑

- **改任何 `data/*.js` 之后**：`node tools/check_data.mjs` + `node tools/check_render.mjs`
- **改 `app.js` 渲染逻辑之后**：`node tools/check_render.mjs`
- **升版本号之后**：`node tools/check_version.mjs`

三者全绿才算改完。

## 原理（为什么要"不变量"而非"枚举规则"）

- `check_data.mjs` 的**结构检查**（重复 id / 关系断裂 / 缺元数据 / 非法 cat）是**通用不变量**，不依赖"犯过哪种错"。
- `check_render.mjs` 直接跑**生产渲染管线**，断言"渲染后无 katex-error、散文里无残留 `\xxx` 命令、无字面 `**`"。这是**可提取性不变量**：将来内容出现任何新写法，只要破坏渲染就报错，**无需预先想到具体错误**。
- 注意：KaTeX 渲染的 DOM 里，`.katex-mathml` 的 `<annotation>` 本就含原始 TeX 源码，所以不能简单用 `textContent` 判残留——脚本只检查**散文文本节点**（排除 `.katex` 子树）。

## 备份归档

数据文件的历史备份统一放 `../backup/`，不再散落在 `data/` 里。
