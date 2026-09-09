#!/usr/bin/env node
// 零依赖构建：把 src/ 下的模块按固定顺序拼成根目录 app.js。
// 用法：node tools/build.mjs            重新生成 app.js
//       node tools/build.mjs --check   只校验 app.js 与 src/ 是否同步（不写盘，CI 用）
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
  'sched.mjs',
  'interleave.mjs',
  'store.mjs',
  'render.mjs',
  'learn.mjs',
  'browse.mjs',
  'wrong.mjs',
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
  // 仅用于自带 ESM 导出的可测试纯函数模块：剥离 export 行，使其成为浏览器 IIFE 内的普通声明。
  return text
    .split('\n')
    .filter((line) => !/^\s*export\s*\{[^}]*\}\s*;?\s*$/.test(line))
    .join('\n');
}

const banner = '/* 本文件由 tools/build.mjs 自动生成，请勿手改；修改 src/ 后运行 node tools/build.mjs 重新生成。 */\n';

const body = ORDER
  .map((rel) => ((rel === 'fsrs-core.mjs' || rel === 'interleave.mjs' || rel === 'sched.mjs' || rel === 'wrong.mjs') ? stripExports(read(rel)) : read(rel)))
  .join('\n');

const out = banner + body + '\n';

// --check：只对比不写盘（CI 里拦截「改了 src/ 忘跑构建」）
if (process.argv.includes('--check')) {
  const current = fs.existsSync(OUT) ? fs.readFileSync(OUT, 'utf8') : '';
  if (current !== out) {
    console.error('app.js 与 src/ 不同步——请运行 node tools/build.mjs 重新生成');
    process.exit(1);
  }
  console.log('app.js 与 src/ 同步');
} else {
  fs.writeFileSync(OUT, out, 'utf8');
  console.log('built', path.relative(ROOT, OUT), 'from', ORDER.join(', '));
}
