#!/usr/bin/env node
// 零依赖构建：把 src/ 下的模块按固定顺序拼成根目录 app.js。
// 用法：node tools/build.mjs
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SRC = path.join(ROOT, 'src');
const OUT = path.join(ROOT, 'app.js');

const ORDER = [
  'config.mjs',
  'app.mjs',
  'fsrs-core.mjs',
  'store.mjs',
  'render.mjs',
  'learn.mjs',
  'browse.mjs',
  'quiz.mjs',
  'settings.mjs',
  'stats.mjs',
  'map.mjs',
  'actions.mjs'
];

function read(rel) {
  return fs.readFileSync(path.join(SRC, rel), 'utf8');
}

function stripExports(text) {
  // 仅用于 fsrs-core.mjs：剥离 ESM 导出，使其成为浏览器 IIFE 内的普通声明。
  return text
    .split('\n')
    .filter((line) => !/^\s*export\s*\{[^}]*\}\s*;?\s*$/.test(line))
    .join('\n');
}

const banner = '/* 本文件由 tools/build.mjs 自动生成，请勿手改；修改 src/ 后运行 node tools/build.mjs 重新生成。 */\n';

const body = ORDER
  .map((rel) => (rel === 'fsrs-core.mjs' ? stripExports(read(rel)) : read(rel)))
  .join('\n');

fs.writeFileSync(OUT, banner + body + '\n', 'utf8');
console.log('built', path.relative(ROOT, OUT), 'from', ORDER.join(', '));
