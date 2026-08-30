#!/usr/bin/env node
/*
 * tools/check_data.mjs —— 数据完整性 & 内容不变量校验
 *
 * 零依赖（Node ≥18）。加载 data/ 下所有学科脚本，静态校验：
 *   结构：重复 id / REL 目标存在 / META 覆盖 / cat 合法 / EXAMPLE·DEPTH·PITFALL·MNEM key 存在
 *   内容：面向用户文本（title/front/back）里不得泄漏「内部卡片编号」（如（cu26））
 *         markdown `**` 必须成对、数学定界 `$` 必须成对（奇偶校验，通用不变量）
 *
 * 用法：  node tools/check_data.mjs
 * 退出码：0 = 全绿；1 = 发现错误
 */

import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DATA_DIR = path.join(ROOT, 'data');
const FILES = ['math3.js', 'econ.js', 'stats.js', 'politics.js'];

// —— 加载：在隔离 vm 里执行每个数据文件，复用同一个 window.SUBJECTS ——
const sandbox = { window: { SUBJECTS: {} }, String, Math, console };
vm.createContext(sandbox);
for (const f of FILES) {
  const code = fs.readFileSync(path.join(DATA_DIR, f), 'utf8');
  vm.runInContext(code, sandbox, { filename: f });
}
const subjects = sandbox.window.SUBJECTS || {};

// —— 收集所有已知卡片 id（跨学科并集；同 id 在不同学科均合法，仅用于泄漏检测） ——
const allIds = new Set();
const bySubject = {};
for (const [sid, mod] of Object.entries(subjects)) {
  const data = (mod.DATA || mod.data) || [];
  const ids = new Set();
  for (const c of data) { if (c && c.id) { allIds.add(c.id); ids.add(c.id); } }
  bySubject[sid] = { mod, data, ids };
}

// 正文里可能出现的「内部卡片编号」：2-4 个小写字母 + 1-3 位数字（如 cu26 / gm17 / we11）
const ID_TOKEN = /\b[a-z]{2,4}\d{1,3}\b/g;

let errorCount = 0;
let warnCount = 0;
const report = (kind, msg) => {
  if (kind === 'ERR') { errorCount++; console.error('  [ERR] ' + msg); }
  else { warnCount++; console.warn('  [WARN] ' + msg); }
};

console.log('=== 数据完整性 & 内容不变量校验 ===\n');

for (const [sid, { mod, data, ids }] of Object.entries(bySubject)) {
  const name = (mod.name || sid);
  const catKeys = new Set(Object.keys(mod.CATS || {}));
  const meta = mod.META || {};
  const rel = mod.REL || {};
  const example = mod.EXAMPLE || {};
  const depth = mod.DEPTH || {};
  const pitfall = mod.PITFALL || {};
  const mnem = mod.MNEM || {};
  const title = '[' + name + '] ' + sid;

  // 1) 重复 id
  const seen = new Set();
  for (const c of data) {
    if (!c || !c.id) { report('ERR', title + ' 存在缺失 id 的卡片'); continue; }
    if (seen.has(c.id)) report('ERR', title + ' 重复 id: ' + c.id);
    seen.add(c.id);
  }

  // 2) META 覆盖
  for (const id of ids) if (!meta[id]) report('ERR', title + ' META 缺失: ' + id);

  // 3) REL 目标存在
  for (const [from, arr] of Object.entries(rel)) {
    if (!ids.has(from)) { report('ERR', title + ' REL 源 id 不存在: ' + from); continue; }
    for (const r of (arr || [])) if (r && r.to && !ids.has(r.to)) report('ERR', title + ' REL 断裂: ' + from + ' -> ' + r.to);
  }

  // 4) cat 合法
  for (const c of data) if (c && c.cat && !catKeys.has(c.cat)) report('ERR', title + ' 非法 cat: ' + c.id + '.' + c.cat);

  // 5) 辅助映射 key 存在
  const auxCheck = (obj, label) => { for (const k of Object.keys(obj)) if (!ids.has(k)) report('ERR', title + ' ' + label + ' 引用不存在的 id: ' + k); };
  auxCheck(example, 'EXAMPLE');
  auxCheck(depth, 'DEPTH');
  auxCheck(pitfall, 'PITFALL');
  auxCheck(mnem, 'MNEM');

  // 6) 内容不变量：title / front / back
  const cardCount = data.length;
  let idLeak = 0, starOdd = 0, dollarOdd = 0;
  for (const c of data) {
    for (const field of ['title', 'front', 'back']) {
      const s = c && c[field];
      if (typeof s !== 'string') continue;
      // 6a) 泄漏内部卡片编号
      let m; ID_TOKEN.lastIndex = 0;
      while ((m = ID_TOKEN.exec(s)) !== null) {
        if (allIds.has(m[0])) { report('ERR', title + ' 正文泄漏内部编号: ' + c.id + '.' + field + ' 含 (' + m[0] + ')'); idLeak++; }
      }
      // 6b) `**` 成对（奇偶）
      const stars = (s.match(/\*\*/g) || []).length;
      if (stars % 2 === 1) { report('WARN', title + ' `**` 未成对: ' + c.id + '.' + field + ' (' + stars + ' 个)'); starOdd++; }
      // 6c) `$` 成对（奇偶）——排除被转义的 \$ 与 $$ 均按字符计，偶数为对
      const dollars = (s.replace(/\\\$/g, '').match(/\$/g) || []).length;
      if (dollars % 2 === 1) { report('WARN', title + ' `$` 未成对: ' + c.id + '.' + field + ' (' + dollars + ' 个)'); dollarOdd++; }
    }
  }
  console.log(`${title.padEnd(40)} ${String(cardCount).padStart(4)} 卡 | id泄漏=${idLeak} **奇=${starOdd} $奇=${dollarOdd}`);
}

console.log('');
console.log('=== 结果 ===');
console.log('学科数:', Object.keys(bySubject).length, '| 卡片总数:', allIds.size ? [...Object.values(bySubject)].reduce((a, b) => a + b.data.length, 0) : 0);
if (errorCount === 0 && warnCount === 0) {
  console.log('✅ 全绿：结构完整、无泄漏、无未闭合标记');
} else {
  console.log(`❌ ERR=${errorCount} WARN=${warnCount}`);
}
process.exit(errorCount === 0 ? 0 : 1);
