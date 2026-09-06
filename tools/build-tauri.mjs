#!/usr/bin/env node
// 把运行时文件复制到 dist/，供 Tauri 桌面版打包。
// 用法：node tools/build-tauri.mjs  （改完 app.js 或 data 后、打包前运行）
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DIST = path.join(ROOT, 'dist');

const FILES = ['index.html', 'app.js', 'style.css', 'sw.js', 'manifest.webmanifest'];
const DIRS = ['data', 'katex', 'icons'];

function copyDir(src, dst) {
  fs.mkdirSync(dst, { recursive: true });
  for (const name of fs.readdirSync(src)) {
    const s = path.join(src, name), d = path.join(dst, name);
    if (fs.statSync(s).isDirectory()) copyDir(s, d);
    else fs.copyFileSync(s, d);
  }
}

fs.rmSync(DIST, { recursive: true, force: true });
fs.mkdirSync(DIST, { recursive: true });
for (const f of FILES) fs.copyFileSync(path.join(ROOT, f), path.join(DIST, f));
for (const d of DIRS) copyDir(path.join(ROOT, d), path.join(DIST, d));
console.log('已复制运行时文件到 dist/（index.html + app.js + data/ + katex/ + icons/）');
