# Tauri 桌面版

把 Athena 打包成本地桌面应用（Windows / macOS / Linux），复用现有静态前端，数据落在应用自己的目录、不会被浏览器清掉。

## 前置依赖

1. 安装 [Rust](https://rustup.rs/)（含 Cargo）。
2. 安装 Tauri CLI：`cargo install tauri-cli --version "^2"`。
3. 各平台系统依赖（Windows 需 WebView2，通常已自带；macOS/Linux 见 Tauri 官方文档）。

## 打包步骤

```bash
# 1) 生成 app.js 并同步 dist/（npm run build 等价；改过 src/ 后任意构建都会自动同步桌面版）
npm run build

# 2) 生成桌面图标集（首次）：用一张 1024×1024 PNG 生成全套图标
cargo tauri icon icons/icon-512.png

# 3) 打包（产物在 src-tauri/target/release/bundle/）
cargo tauri build
```

开发调试：`cargo tauri dev`。

## 说明

- **前端零改动**：Tauri 的 WebView 直接加载 `dist/index.html`，localStorage / IndexedDB 照常可用，只是数据存在应用自己的数据目录（不受浏览器清理影响）。
- **数据迁移**：从浏览器版迁到桌面版，用「设置 → 导出全部」生成 JSON，再到桌面版「导入全部」即可。
- **frontendDist** 指向 `../dist`（由 `tools/build-tauri.mjs` 生成），不要把整个仓库根目录当作前端目录。
- 首次 `cargo tauri icon` 会把 `icons/icon-512.png` 转成 `src-tauri/icons/` 下全套图标；换正式 Logo 后重跑一次即可。
