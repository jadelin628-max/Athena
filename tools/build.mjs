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
  'home.mjs',
  'sync.mjs',
  'act.mjs',
  'habit.mjs',
  'focus.mjs',
  'mile.mjs',
  'actions.mjs'
];

// 统一 LF：Windows 工作区可能是 CRLF/混合行尾；stripExports 的 ^/$ 在 CRLF 下
// 会从 \r 后截断，导致本地构建结果与 CI（纯 LF 检出）不一致。
function normalizeEol(text) {
  return text.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
}

function read(rel) {
  return normalizeEol(fs.readFileSync(path.join(SRC, rel), 'utf8'));
}

function stripExports(text) {
  // 剥离 ESM 导出，使模块成为浏览器 IIFE 内的普通声明。
  // 兼容：单行 `export { a, b };` 与多行 `export {\n a,\n b,\n};`
  // 以及 `export function foo` / `export const foo`（转为普通声明）。
  let out = text.replace(/^\s*export\s*\{[\s\S]*?\}\s*;?\s*$/gm, '');
  out = out.replace(/^\s*export\s+(function|const|let|var|class)\s+/gm, '$1 ');
  return out;
}

const banner = '/* 本文件由 tools/build.mjs 自动生成，请勿手改；修改 src/ 后运行 node tools/build.mjs 重新生成。 */\n';

const STRIP = new Set(['fsrs-core.mjs', 'interleave.mjs', 'sched.mjs', 'wrong.mjs', 'sync.mjs', 'stats.mjs', 'act.mjs', 'habit.mjs', 'focus.mjs', 'mile.mjs']);
const body = ORDER
  .map((rel) => (STRIP.has(rel) ? stripExports(read(rel)) : read(rel)))
  .join('\n');

const out = banner + body + '\n';

// --check：只对比不写盘（CI 里拦截「改了 src/ 忘跑构建」）
if (process.argv.includes('--check')) {
  // 对比前统一 LF，避免 autocrlf 检出的 CRLF 造成假阴性/假阳性
  const current = fs.existsSync(OUT) ? normalizeEol(fs.readFileSync(OUT, 'utf8')) : '';
  if (current !== out) {
    console.error('app.js 与 src/ 不同步——请运行 node tools/build.mjs 重新生成');
    process.exit(1);
  }
  console.log('app.js 与 src/ 同步');
} else {
  fs.writeFileSync(OUT, out, 'utf8');
  console.log('built', path.relative(ROOT, OUT), 'from', ORDER.join(', '));
}
