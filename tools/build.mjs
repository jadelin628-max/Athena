#!/usr/bin/env node
// 零依赖构建：把 src/ 下的模块按固定顺序拼成根目录 app.js。
// 用法：node tools/build.mjs            重新生成 app.js
//       node tools/build.mjs --check   只校验 app.js 与 src/ 是否同步（不写盘，CI 用）
//
// 可测试性：规则全部拆成可导入的纯函数（ORDER / STRIP / stripExports / buildBody /
// buildProduct / runCli），导入本模块零副作用——不写盘、无输出；只有作为主模块直接
// 运行时才执行 CLI。tests/build.test.mjs 靠这一点做「模块漏登记」回归守卫。
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
export const SRC = path.join(ROOT, 'src');
export const OUT = path.join(ROOT, 'app.js');

// 拼接顺序：函数声明会提升到整个 IIFE 作用域，所以顺序只影响顶层语句的执行次序
// （var/let/const 初始化、模块级副作用）。新模块必须登记进这里，否则永远进不了 app.js。
export const ORDER = [
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
  'bank.mjs',
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

// 需要剥离 ESM 导出的模块：这些模块带「单测可测」的 TESTABLE 导出块。
// 浏览器里 app.js 是单个 IIFE，残留顶层 export 会直接 SyntaxError
// —— v2.1.0 的 store.mjs 事故就是这么来的（首屏 0 个子节点）。
// 判定依据是「谁必须被剥离」，不是「谁写了 export」：
// tests/build.test.mjs 会对 ORDER 里每个模块做扫描，含顶层 export 却不在 STRIP 里 → 测试失败。
export const STRIP = new Set([
  'fsrs-core.mjs',
  'interleave.mjs',
  'sched.mjs',
  'store.mjs',
  'wrong.mjs',
  'sync.mjs',
  'stats.mjs',
  'act.mjs',
  'habit.mjs',
  'focus.mjs',
  'mile.mjs',
  'bank.mjs'
]);

export const BANNER = '/* 本文件由 tools/build.mjs 自动生成，请勿手改；修改 src/ 后运行 node tools/build.mjs 重新生成。 */\n';

// 统一 LF：Windows 工作区可能是 CRLF/混合行尾；stripExports 的 ^/$ 在 CRLF 下
// 会从 \r 后截断，导致本地构建结果与 CI（纯 LF 检出）不一致。
export function normalizeEol(text) {
  return text.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
}

export function readModule(rel) {
  return normalizeEol(fs.readFileSync(path.join(SRC, rel), 'utf8'));
}

export function stripExports(text) {
  // 剥离 ESM 导出，使模块成为浏览器 IIFE 内的普通声明。
  // 兼容：单行 `export { a, b };` 与多行 `export {\n a,\n b,\n};`
  // 以及 `export function foo` / `export const foo`（转为普通声明）。
  let out = text.replace(/^\s*export\s*\{[\s\S]*?\}\s*;?\s*$/gm, '');
  out = out.replace(/^\s*export\s+(function|const|let|var|class)\s+/gm, '$1 ');
  return out;
}

// 扫描顶层 ESM 语句（注释除外）：返回 [{ line, text }]，空数组 = 干净。
// 注释感知：跳过 // 行注释与 /* … */ 块注释（含跨行），避免把文档里的示例误判为真实语句。
export function topLevelEsmLines(text) {
  const lines = normalizeEol(text).split('\n');
  const hits = [];
  let inBlock = false;
  for (let i = 0; i < lines.length; i++) {
    let line = lines[i];
    if (inBlock) {
      const end = line.indexOf('*/');
      if (end === -1) continue;
      line = line.slice(end + 2);
      inBlock = false;
    }
    // 同行先出现 /* … */ 的，取其后半段继续判定
    const inlineBlock = /^\s*\/\*[\s\S]*?\*\/\s*(.*)$/.exec(line);
    if (inlineBlock) {
      line = inlineBlock[1];
    } else if (/^\s*\/\*/.test(line)) {
      inBlock = true;
      continue;
    }
    if (/^\s*\/\//.test(line)) continue;
    if (/^\s*(export|import)\b/.test(line)) hits.push({ line: i + 1, text: lines[i].trim() });
  }
  return hits;
}

export function buildBody() {
  return ORDER
    .map((rel) => (STRIP.has(rel) ? stripExports(readModule(rel)) : readModule(rel)))
    .join('\n');
}

export function buildProduct() {
  return BANNER + buildBody() + '\n';
}

export function outputLabel(outFile = OUT) {
  return path.relative(ROOT, outFile) || outFile;
}

// CLI 主体：IO 全部可注入（tests/build.test.mjs 用临时输出文件 + 捕获 log/error/exit 直接驱动），
// 默认行为与历史版本完全一致：
//   无参数   → 写 app.js，打印 `built app.js from <ORDER>`
//   --check  → 只比对（不写盘）；不一致 → stderr 提示 + exit 1
export function runCli(argv = process.argv.slice(2), io = {}) {
  const outFile = io.outFile || OUT;
  const log = io.log || ((...args) => console.log(...args));
  const error = io.error || ((...args) => console.error(...args));
  const exit = io.exit || ((code) => process.exit(code));
  const label = outputLabel(outFile);
  const product = buildProduct();

  // --check：只对比不写盘（CI 里拦截「改了 src/ 忘跑构建」）
  if (argv.includes('--check')) {
    // 对比前统一 LF，避免 autocrlf 检出的 CRLF 造成假阴性/假阳性
    const current = fs.existsSync(outFile) ? normalizeEol(fs.readFileSync(outFile, 'utf8')) : '';
    if (current !== product) {
      error(label + ' 与 src/ 不同步——请运行 node tools/build.mjs 重新生成');
      exit(1);
      return { label, wrote: false, exitCode: 1 };
    }
    log(label + ' 与 src/ 同步');
    return { label, wrote: false, exitCode: 0 };
  }

  fs.writeFileSync(outFile, product, 'utf8');
  log('built', label, 'from', ORDER.join(', '));
  return { label, wrote: true, exitCode: 0 };
}

// 只有 `node tools/build.mjs` 这种直接调用才跑 CLI；import 时零副作用。
const invokedDirectly = (() => {
  try {
    return !!process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
  } catch (e) {
    return false;
  }
})();

if (invokedDirectly) runCli();