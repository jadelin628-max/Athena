#!/usr/bin/env node
/*
 * tools/check_data.mjs —— 数据完整性 & 内容不变量校验
 *
 * 零依赖（Node ≥18）。加载 data/ 下所有学科脚本，静态校验：
 *   结构：重复 id / REL 目标存在 / META 覆盖 / cat 合法 / EXAMPLE·PITFALL·MNEM key 存在
 *   内容：面向用户文本（title/front/back）里不得泄漏「内部卡片编号」（如（cu26））
 *         markdown `**` 必须成对、数学定界 `$` 必须成对（奇偶校验，通用不变量）
 *   题库（window.BANK.<subj>，data/bank_*.js）：题型 key 唯一且每题命中 / 知识点标签
 *         必须是本学科真实卡 id / 题干·答案解析·难度·题型·标签·陷阱·提示·来源齐全
 *   题源（school）：每题必须标注来源院校/科目（非空），且来源年份与 school 一致；
 *         school 还必须与 src.file 同源（JYSG 真题册 → 含「光华」「431」；数学三解析册 → 含「数学三」）
 *   题源一致性（t21）：按（科目, 年份, 规范化后的来源）分组，同组出现 ≥2 种原始 school 写法即 ERR
 *         —— 同一份卷子被写成多种措辞，会让「年份/卷」筛选把同一年拆成多项。规范化口径：
 *         全角→半角、去首尾与内部空白、·／–— 等分隔符统一、
 *         「全国硕士研究生入学统一考试 / 入学考试 / 招生考试」视为同一考试
 *
 * 用法：  node tools/check_data.mjs
 *         ATHENA_DATA_DIR=<目录>  改用替代数据目录跑校验（反证/回归脚本用；默认 <仓库>/data）
 * 退出码：0 = 全绿；1 = 发现错误
 */

import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
// 数据目录可用环境变量替换：反证脚本把 data/ 复制到临时目录并注入缺陷，再让本校验去判红
const DATA_DIR = process.env.ATHENA_DATA_DIR
  ? path.resolve(process.env.ATHENA_DATA_DIR)
  : path.join(ROOT, 'data');
const FILES = ['math3.js', 'econ.js', 'stats.js', 'politics.js', 'corp.js', 'inv.js', 'music.js', 'poem.js', 'py.js', 'mon.js', 'fsa.js', 'sishu.js', 'acct.js', 'clang.js', 'cppl.js', 'java.js', 'js.js', 'rust.js', 'ai.js', 'social.js', 'jp.js', 'kr.js', 'fr.js', 'es.js', 'wujing.js'];
// 题库数据（POC）：window.BANK.<subj>；其 tags 必须命中同名 data/<subj>.js 的真实卡 id
const BANK_FILES = ['bank_math3.js', 'bank_econ.js', 'bank_stats.js'];

// 题源（school）同源规则：src.file 命中 fileMatch 时，school 必须含 need 里的每个关键词。
// 关键词取自来源册的题块标题（如 JYSG 真题册的「北京大学光华-431 金融学统计 20XX 年」、
// 数学三解析册的「全国硕士研究生…考试 数学三」），不允许猜测/泛指。
const SRC_SCHOOL_RULES = [
  { fileMatch: /JYSG真题册/, need: ['光华', '431'], label: '北京大学光华-431 金融学统计' },
  { fileMatch: /(?:数学三真题答案解析|考研数学三真题)/, need: ['数学三'], label: '数学三真题答案解析册' },
];

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

// 代码块（~~~围栏）内容先剥离：**（幂/kwargs）、$、标识符（x1 等）在代码里都是合法字面
const stripCode = (s) => s.split('~~~').filter((_, i) => i % 2 === 0).join('');

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
  auxCheck(pitfall, 'PITFALL');
  auxCheck(mnem, 'MNEM');

  // 6) 内容不变量：title / front / back
  const cardCount = data.length;
  let idLeak = 0, starOdd = 0, dollarOdd = 0;
  for (const c of data) {
    for (const field of ['title', 'front', 'back']) {
      const s = c && c[field];
      if (typeof s !== 'string') continue;
      const prose = stripCode(s);
      // 6a) 泄漏内部卡片编号
      let m; ID_TOKEN.lastIndex = 0;
      while ((m = ID_TOKEN.exec(prose)) !== null) {
        if (allIds.has(m[0])) { report('ERR', title + ' 正文泄漏内部编号: ' + c.id + '.' + field + ' 含 (' + m[0] + ')'); idLeak++; }
      }
      // 6b) `**` 成对（奇偶）
      const stars = (prose.match(/\*\*/g) || []).length;
      if (stars % 2 === 1) { report('WARN', title + ' `**` 未成对: ' + c.id + '.' + field + ' (' + stars + ' 个)'); starOdd++; }
      // 6c) `$` 成对（奇偶）——排除被转义的 \$ 与 $$ 均按字符计，偶数为对
      const dollars = (prose.replace(/\\\$/g, '').match(/\$/g) || []).length;
      if (dollars % 2 === 1) { report('WARN', title + ' `$` 未成对: ' + c.id + '.' + field + ' (' + dollars + ' 个)'); dollarOdd++; }
    }
  }
  console.log(`${title.padEnd(40)} ${String(cardCount).padStart(4)} 卡 | id泄漏=${idLeak} **奇=${starOdd} $奇=${dollarOdd}`);
}

console.log('');
console.log('=== 题库（window.BANK.<subj>）校验 ===\n');

// 题库沙箱：与学科数据共用同一个 window（题库要按 subjectId 反查知识点 id）
const bankSandbox = { window: { SUBJECTS: subjects, BANK: {} }, String, Math, console };
vm.createContext(bankSandbox);
let bankQuestionTotal = 0;
let cardOriginTotal = 0;   // t32：origin === 'card' 的卡片派生题数（全库）
for (const f of BANK_FILES) {
  const filePath = path.join(DATA_DIR, f);
  if (!fs.existsSync(filePath)) { report('ERR', '题库文件缺失: data/' + f); continue; }
  const code = fs.readFileSync(filePath, 'utf8');
  vm.runInContext(code, bankSandbox, { filename: f });
}

const banks = bankSandbox.window.BANK || {};
if (!Object.keys(banks).length) report('ERR', 'window.BANK 为空：data/bank_*.js 未正确挂载');

for (const f of BANK_FILES) {
  const expectSid = f.replace(/^bank_/, '').replace(/\.js$/, '');
  const bank = banks[expectSid];
  const title = '[题库] ' + expectSid;
  if (!bank) { report('ERR', '题库未挂载 window.BANK.' + expectSid + '（来自 data/' + f + '）'); continue; }
  if (bank.id !== expectSid) report('ERR', title + ' id 与文件名不符: ' + bank.id);
  if (!bank.name) report('ERR', title + ' 缺 name');
  if (typeof bank.sourceNote !== 'string' || !bank.sourceNote.trim()) report('ERR', title + ' 缺 sourceNote（题源说明）');
  if (!Array.isArray(bank.questions) || !bank.questions.length) report('ERR', title + ' questions 为空');
  if (!Array.isArray(bank.types) || !bank.types.length) report('ERR', title + ' types 为空');

  // 题型 key 唯一
  const typeKeys = new Set();
  for (const t of (bank.types || [])) {
    if (!t || !t.key) { report('ERR', title + ' 存在缺 key 的题型'); continue; }
    if (typeKeys.has(t.key)) report('ERR', title + ' 题型 key 重复: ' + t.key);
    typeKeys.add(t.key);
    for (const fld of ['name', 'def', 'judge', 'sample']) {
      if (typeof t[fld] !== 'string' || !t[fld].trim()) report('ERR', title + ' 题型 ' + t.key + ' 缺 ' + fld);
    }
  }

  // 知识点池：本学科真实卡 id
  const pool = (bySubject[expectSid] && bySubject[expectSid].ids) || new Set();
  if (!pool.size) report('ERR', title + ' 找不到对应的 data/' + expectSid + '.js 知识点池');

  const seenIds = new Set();
  const typeHits = {};
  let qLeak = 0, qStarOdd = 0, qDollarOdd = 0, qSchool = 0;
  const years = new Set(), stars = {}, schools = new Set();
  for (const q of (bank.questions || [])) {
    if (!q || !q.id) { report('ERR', title + ' 存在缺 id 的题目'); continue; }
    if (seenIds.has(q.id)) report('ERR', title + ' 题目 id 重复: ' + q.id);
    seenIds.add(q.id);
    bankQuestionTotal++;
    // 字段契约分两族（t32）：
    //   origin 缺省/'year' —— 真题册入库题（既有 55 题）：题干/解析/陷阱/提示四件套齐全；
    //   origin 'card'      —— 卡片派生题：traps/hint 只在 PITFALL/MNEM 有条目时写入（禁止编造），缺则整字段省略。
    const origin = q.origin == null ? 'year' : q.origin;
    if (origin === 'card') cardOriginTotal++;
    else if (origin !== 'year') report('ERR', title + ' ' + q.id + ' origin 非法（只能是 year / card）: ' + q.origin);
    // 必填字段（题干/答案解析）
    for (const fld of ['stem', 'answer']) {
      if (typeof q[fld] !== 'string' || !q[fld].trim()) report('ERR', title + ' ' + q.id + ' 缺字段 ' + fld);
    }
    // 条件必需：存在即非空（空串占位与编造一律判红）
    for (const fld of ['traps', 'hint']) {
      if (q[fld] == null) {
        if (origin !== 'card') report('ERR', title + ' ' + q.id + ' 缺字段 ' + fld);
        continue;
      }
      if (typeof q[fld] !== 'string' || !q[fld].trim()) report('ERR', title + ' ' + q.id + ' 字段 ' + fld + ' 存在但为空（无内容应省略该字段）');
    }
    if (!q.year) report('ERR', title + ' ' + q.id + ' 缺 year');
    else years.add(q.year);
    if (q.no == null || q.no === '') report('ERR', title + ' ' + q.id + ' 缺题号 no');
    if (!q.type) report('ERR', title + ' ' + q.id + ' 缺题型 type');
    else {
      if (!typeKeys.has(q.type)) report('ERR', title + ' ' + q.id + ' 题型不在 types 内: ' + q.type);
      typeHits[q.type] = (typeHits[q.type] || 0) + 1;
    }
    if (!Array.isArray(q.tags) || !q.tags.length) report('ERR', title + ' ' + q.id + ' 缺知识点标签 tags');
    else for (const tg of q.tags) {
      if (!pool.has(tg)) report('ERR', title + ' ' + q.id + ' 知识点标签不是真实卡 id: ' + tg);
    }
    const st = Number(q.star);
    if (!(st >= 1 && st <= 5 && Number.isInteger(st))) report('ERR', title + ' ' + q.id + ' 难度 star 非 1..5 整数: ' + q.star);
    else stars[st] = (stars[st] || 0) + 1;
    if (!q.src || typeof q.src !== 'object') report('ERR', title + ' ' + q.id + ' 缺 src 来源对象');
    else if (origin === 'card') {
      // 卡片派生题的溯源主体：src.card（本学科真实卡 id）+ src.note（例题来源原文与缺失字段说明）
      if (typeof q.src.card !== 'string' || !q.src.card.trim()) report('ERR', title + ' ' + q.id + ' src 缺 card（卡片派生题必须标注来源卡片 id）');
      else if (!pool.has(q.src.card)) report('ERR', title + ' ' + q.id + ' src.card 不是本学科真实卡 id: ' + q.src.card);
      if (typeof q.src.note !== 'string' || !q.src.note.trim()) report('ERR', title + ' ' + q.id + ' src 缺 note（来源原文与缺失字段说明）');
      else if (!q.src.note.includes(String(q.year))) report('ERR', title + ' ' + q.id + ' src.note 未含题目年份（溯源原文与 year 不一致）: ' + q.year);
    } else {
      for (const fld of ['file', 'no']) {
        if (typeof q.src[fld] !== 'string' || !q.src[fld].trim()) report('ERR', title + ' ' + q.id + ' src 缺 ' + fld);
      }
    }
    // 题源标注 school：非空 + 与 year 一致 + 与 src.file 同源
    if (typeof q.school !== 'string' || !q.school.trim()) {
      report('ERR', title + ' ' + q.id + ' 缺 school（来源院校/科目，见 audit.md 的来源题块标题）');
    } else {
      const school = q.school.trim();
      qSchool++;
      schools.add(school);
      if (!school.includes(String(q.year))) report('ERR', title + ' ' + q.id + ' school 与 year 不一致: ' + school + ' vs ' + q.year);
      const srcFile = (q.src && typeof q.src.file === 'string') ? q.src.file : '';
      // 同源规则只针对真题册文件（src.file）；卡片派生题没有真题册文件，溯源一致性由 src.card/src.note 与
      // 下方「题源一致性」分组共同约束（缺 src.file 时不再刷 WARN）
      if (srcFile) {
        let covered = false;
        for (const rule of SRC_SCHOOL_RULES) {
          if (!rule.fileMatch.test(srcFile)) continue;
          covered = true;
          for (const need of rule.need) {
            if (!school.includes(need)) report('ERR', title + ' ' + q.id + ' school 与 src.file 不同源（' + rule.label + ' 缺「' + need + '」）: ' + school + ' ← ' + srcFile);
          }
        }
        if (!covered) report('WARN', title + ' ' + q.id + ' src.file 未被同源规则覆盖，请人工确认 school: ' + srcFile);
        // 文件名里带「<四位年>年」时，school 的年份应与之一致（范围文件名如「1987-2025年」不适用）
        const yearsInFile = srcFile.match(/(?:19|20)\d{2}(?=年)/g) || [];
        if (yearsInFile.length === 1 && !school.includes(yearsInFile[0])) {
          report('WARN', title + ' ' + q.id + ' school 与 src.file 年份不一致: ' + school + ' vs ' + yearsInFile[0]);
        }
      }
    }
    // 内容不变量（与卡片同口径）：题干/解析/陷阱/提示
    for (const fld of ['stem', 'answer', 'traps', 'hint']) {
      const s = q[fld];
      if (typeof s !== 'string') continue;
      const prose = stripCode(s);
      let m; ID_TOKEN.lastIndex = 0;
      while ((m = ID_TOKEN.exec(prose)) !== null) {
        if (allIds.has(m[0])) { report('ERR', title + ' ' + q.id + '.' + fld + ' 泄漏内部编号: (' + m[0] + ')'); qLeak++; }
      }
      const starsN = (prose.match(/\*\*/g) || []).length;
      if (starsN % 2 === 1) { report('WARN', title + ' ' + q.id + '.' + fld + ' `**` 未成对 (' + starsN + ' 个)'); qStarOdd++; }
      const dollars = (prose.replace(/\\\$/g, '').match(/\$/g) || []).length;
      if (dollars % 2 === 1) { report('WARN', title + ' ' + q.id + '.' + fld + ' `$` 未成对 (' + dollars + ' 个)'); qDollarOdd++; }
    }
  }

  // 每个题型都必须有题命中（否则是无人使用的题型）
  for (const key of typeKeys) if (!typeHits[key]) report('WARN', title + ' 题型 ' + key + ' 无题目命中');

  const starText = Object.keys(stars).sort().map((k) => k + '★×' + stars[k]).join(' ');
  const qTotal = (bank.questions || []).length;
  const cardText = bank.questions.some((q) => q && q.origin === 'card') ? ' | 卡片派生=' + bank.questions.filter((q) => q && q.origin === 'card').length : '';
  console.log(`  ${title.padEnd(20)} ${String(qTotal).padStart(3)} 题 | ${typeKeys.size} 题型 | 年份 ${[...years].sort().join(',')} | 难度 ${starText || '—'} | school=${qSchool}/${qTotal}（${schools.size} 个来源）${cardText} | id泄漏=${qLeak} **奇=${qStarOdd} $奇=${qDollarOdd}`);
}

console.log('');
console.log('=== 题源一致性（同一份卷子不得多种写法）===\n');

// school 规范化：用于把「同一份卷子的不同措辞」归到同一组（组内再有 ≥2 种原始写法即 ERR）
const normalizeSchool = (s) => String(s == null ? '' : s)
  .replace(/[\uFF01-\uFF5E]/g, (ch) => String.fromCharCode(ch.charCodeAt(0) - 0xFEE0)) // 全角 ASCII → 半角
  .replace(/\u3000/g, ' ')                       // 全角空格
  .replace(/[·・•∙‧]/g, '-')                     // 间隔号类 → '-'
  .replace(/[／∕]/g, '/')                        // 全角/除号斜杠 → '/'
  .replace(/[—–―‐－]/g, '-')                     // 各种破折号/连字号 → '-'
  .replace(/\s+/g, '')                           // 去首尾与内部空白
  .replace(/入学统一考试/g, '招生考试')            // 1987-2019 旧称 ≡ 现称
  .replace(/入学考试/g, '招生考试');

const schoolGroups = new Map(); // key → { sid, year, norm, raw: Map<原始字符串, 题 id[]> }
for (const f of BANK_FILES) {
  const sid = f.replace(/^bank_/, '').replace(/\.js$/, '');
  const bank = banks[sid];
  if (!bank || !Array.isArray(bank.questions)) continue;
  for (const q of bank.questions) {
    if (!q || typeof q.school !== 'string' || !q.school.trim() || !q.year) continue;
    const raw = q.school.trim();
    const norm = normalizeSchool(raw);
    const key = sid + '\u0000' + q.year + '\u0000' + norm;
    if (!schoolGroups.has(key)) schoolGroups.set(key, { sid, year: q.year, norm, raw: new Map() });
    const g = schoolGroups.get(key);
    if (!g.raw.has(raw)) g.raw.set(raw, []);
    g.raw.get(raw).push(q.id);
  }
}

let schoolGroupCount = 0, schoolConflictCount = 0;
for (const g of schoolGroups.values()) {
  schoolGroupCount++;
  if (g.raw.size < 2) continue;
  schoolConflictCount++;
  const variants = [...g.raw.entries()].map(([raw, ids]) => '「' + raw + '」(' + ids.join('、') + ')');
  report('ERR', '[题库] ' + g.sid + ' ' + g.year + ' 年同一份卷子出现 ' + g.raw.size + ' 种 school 写法'
    + '（规范化后同为「' + g.norm + '」，会让「年份/卷」筛选拆成 ' + g.raw.size + ' 项）：' + variants.join(' vs '));
}
console.log('  (科目, 年份, 规范化来源) 分组 ' + schoolGroupCount + ' 组 | 同组多写法 ' + schoolConflictCount + ' 组'
  + (schoolConflictCount ? ' ← 必须合并为单一写法' : '（一致）'));

console.log('');
console.log('=== 结果 ===');
console.log('学科数:', Object.keys(bySubject).length, '| 卡片总数:', allIds.size ? [...Object.values(bySubject)].reduce((a, b) => a + b.data.length, 0) : 0,
  '| 题库科目:', Object.keys(banks).length, '| 真题总数:', bankQuestionTotal,
  '| 其中卡片派生题(origin=card):', cardOriginTotal);
if (errorCount === 0 && warnCount === 0) {
  console.log('✅ 全绿：结构完整、无泄漏、无未闭合标记');
} else {
  console.log(`❌ ERR=${errorCount} WARN=${warnCount}`);
}
process.exit(errorCount === 0 ? 0 : 1);
