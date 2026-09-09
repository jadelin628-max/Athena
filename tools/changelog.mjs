#!/usr/bin/env node
/*
 * tools/changelog.mjs —— 从 src/app.mjs 的 CHANGELOG 数组生成根目录 CHANGELOG.md
 *
 * 应用内更新日志（设置页展示）是唯一数据源，CHANGELOG.md 为生成产物：
 * 避免两处手工维护漂移。GitHub 会渲染 CHANGELOG.md。
 *
 * 用法：  node tools/changelog.mjs           重新生成 CHANGELOG.md
 *         node tools/changelog.mjs --check  只校验 CHANGELOG.md 是否最新（不写盘，CI 用）
 * 退出码：0 = 一致；1 = 需要重新生成（--check 模式）
 */

import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SRC = path.join(ROOT, 'src', 'app.mjs');
const OUT = path.join(ROOT, 'CHANGELOG.md');
const CHECK = process.argv.includes('--check');

const appSrc = fs.readFileSync(SRC, 'utf8');
// 提取 `const CHANGELOG = [ ... ];` 数组字面量并在隔离沙箱中求值（与 check_data.mjs 同一思路）
const m = appSrc.match(/const CHANGELOG = (\[[\s\S]*?\]);\s*\n/);
if (!m) { console.error('未在 src/app.mjs 中找到 CHANGELOG 数组'); process.exit(1); }
const changelog = vm.runInNewContext('(' + m[1] + ')', {});
if (!Array.isArray(changelog) || !changelog.length) { console.error('CHANGELOG 数组为空或格式不正确'); process.exit(1); }

let md = '# 更新日志\n\n';
md += '> 本文件由 `tools/changelog.mjs` 从 `src/app.mjs` 的 CHANGELOG 自动生成（应用内「设置 → 更新日志」同步展示），请勿手改；改日志后运行 `node tools/changelog.mjs` 重新生成。\n\n';
for (const entry of changelog) {
  md += `## v${entry.v}（${entry.date}）\n\n`;
  for (const item of entry.items) md += `- ${item}\n`;
  md += '\n';
}

if (CHECK) {
  const current = fs.existsSync(OUT) ? fs.readFileSync(OUT, 'utf8') : '';
  if (current !== md) {
    console.error('CHANGELOG.md 与应用内更新日志不同步——请运行 node tools/changelog.mjs 重新生成');
    process.exit(1);
  }
  console.log('CHANGELOG.md 与应用内更新日志一致');
} else {
  fs.writeFileSync(OUT, md, 'utf8');
  console.log('generated CHANGELOG.md (' + changelog.length + ' 个版本条目)');
}
