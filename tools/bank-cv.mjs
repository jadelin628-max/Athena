// tools/bank-cv.mjs —— 卡片例题 → 题库 的**哨兵原位替换**生成通道（BOARD T141 / t72）。
//
// 背景（T134 事故的根治）
//   t32 / t49 的原始生成器（backup/scratch/bank-cv{,3}/）用「数组末尾注入」的写法：
//   它们把卡片派生块整体重新注入到 `var TYPES = [` / `var DATA = [` 的**数组末尾**。
//   t53 / t54 追加真题块（year-questions）之后，重跑那次注入就把卡片块搬到真题块之后、
//   并吞掉前一个元素的元素间逗号 ⇒ `    }` 缺逗号 → `SyntaxError`（复现点
//   backup/scratch/bank-fix5/regen-sandbox/data/bank_stats.js:186），题库整科白屏。
//
// 本工具的语义
//   ① **只做哨兵原位替换**：只重写 BEGIN/END 两个哨兵行**之间**的内容，BEGIN/END 行本身、
//      以及块外的一切（含元素间逗号、缩进、空行、文件头注释、sourceNote、行尾）逐字节不变。
//   ② 每个学科有两个哨兵块：TYPES 块（第一个，位于 `var TYPES = [` 内）与 DATA 块（第二个，
//      位于 `var DATA = [` 内）。两个块按「出现顺序 + 所在数组」双向定位，顺序颠倒即拒绝。
//   ③ 幂等：对已入库数据重跑 → 目标文本与现状逐字节相同 ⇒ 报「无变化」且不落盘。
//
// 用法
//   node tools/bank-cv.mjs                                  # 干跑（默认），但 all/math3 被守卫拒绝
//   node tools/bank-cv.mjs --subject stats                  # 干跑统计学科，打印计划与「无变化/将变更」
//   node tools/bank-cv.mjs --subject stats --write          # 落盘统计学科
//   node tools/bank-cv.mjs --subject econ --write --data-dir <dir>
//   node tools/bank-cv.mjs --subject math3 --write --allow-math3-reorder
//   node tools/bank-cv.mjs --subject all --dry-run --allow-math3-reorder --json
//
// 参数
//   --subject <math3|econ|stats|all>   学科（缺省 all）
//   --dry-run                          只算不写（**缺省行为**；与 --write 同时给出即报错）
//   --write                            落盘（只写哨兵块之间）
//   --data-dir <dir>                   数据目录（缺省 env ATHENA_DATA_DIR，再缺省 <repo>/data）
//   --sentinel <auto|legacy|canonical> 落盘时的哨兵拼写（缺省 auto＝沿用文件现状）。
//      legacy    = `  // ==== BEGIN|END GENERATED card-questions (t32|t49) ====`（现行三科题库文件即此拼写）
//      canonical = `  // ===== BEGIN|END CARD-DERIVED <subject> =====`（契约拼写，供新文件/后续批次）
//      体检一律用 auto（两种拼写都接受，但必须恰一套、不得混用、不得缺块）；显式指定时只把
//      BEGIN/END 这 4 行改写为目标拼写，块内与其余块外字节不变。缺哨兵**不会**自动插入（exit 2）。
//   --allow-math3-reorder              放行 math3 / all（历史重排风险确认；见下「守卫」）
//   --allow-workspace-write            放行「会改动工作树 data/」的落盘（见下「守卫」）
//   --json                             机器可读摘要
//   --quiet                            只输出一行结论
//   --help                             用法
//
// 守卫（一律 exit 2，且**不写任何文件**）
//   G1 math3 拒写：`--subject math3|all` 的任何调用（含干跑）都拒绝，除非显式 --allow-math3-reorder。
//      —— 契约要求（BOARD T141）；本工具本身已不重排块，该开关只是对历史风险的显式确认。
//   G2 工作树保护：`--write` 且目标目录就是工作树 data/ 且**本次会真的改动字节**时，要求
//      --allow-workspace-write。零变化的幂等重跑不受影响（仍是 exit 0）。
//   G3 哨兵体检：缺失 / 重复 / 嵌套 / 拼写混用 / 标签与本学科不符 / 不在 TYPES·DATA 数组内 → exit 2。
//   G4 写前自检：语法（vm 编译）/ id 全库唯一 / 卡片派生条数 = 计划条数 / 题数算式 / 块外骨架逐字节一致。
//
// 退出码：0 成功（含「无变化」）；2 用法、守卫、体检、自检失败；1 未预期异常。
//
// 说明：本工具**不改文件头注释与 sourceNote**（t67 已手工订正首行题量口径，且「块外逐字节不变」
// 是硬要求）。因此 data/bank_*.js 头部注释里仍在重复的「重跑 backup/scratch/bank-cv2/…」字样
// 属**数据文件侧**的待办，不在本工具范围内。
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

export const TOOL = 'tools/bank-cv.mjs';
export const TOOL_VERSION = '1 (t72)';
const HERE = path.dirname(fileURLToPath(import.meta.url));
export const ROOT = path.resolve(HERE, '..');

const YEAR_RE = /(?:19|20)\d{2}/;
const S = (v) => JSON.stringify(v);

// ---------------------------------------------------------------- 哨兵拼写
// legacy：t32 / t49 生成器写入的拼写（现行三科题库文件即此拼写，auto 下原样保留）
// canonical：契约拼写（`// ===== BEGIN CARD-DERIVED <subject> =====`），供新文件与后续批次使用
const LEGACY_MARK = /^([ \t]*)\/\/ ={3,} (BEGIN|END) GENERATED card-questions \(([^)]+)\) ={3,}$/;
const CANON_MARK = /^([ \t]*)\/\/ ={3,} (BEGIN|END) CARD-DERIVED ([A-Za-z0-9_-]+) ={3,}$/;

export const SENTINEL_STYLES = {
  legacy: {
    id: 'legacy',
    begin: (label) => '  // ==== BEGIN GENERATED card-questions (' + label + ') ====',
    end: (label) => '  // ==== END GENERATED card-questions (' + label + ') ====',
    re: LEGACY_MARK,
    labelOf: (cfg) => cfg.tag
  },
  canonical: {
    id: 'canonical',
    begin: (label) => '  // ===== BEGIN CARD-DERIVED ' + label + ' =====',
    end: (label) => '  // ===== END CARD-DERIVED ' + label + ' =====',
    re: CANON_MARK,
    labelOf: (cfg) => cfg.sid
  }
};

// 扫描全部哨兵标记（不区分学科；year-questions 等其它块的关键词不同，不会命中）
export function scanMarkers(text) {
  const out = [];
  text.split('\n').forEach((raw, i) => {
    const line = raw.replace(/\r$/, '');
    let m = line.match(LEGACY_MARK);
    if (m) { out.push({ line: i + 1, kind: m[2], label: m[3], style: 'legacy', indent: m[1], raw: line }); return; }
    m = line.match(CANON_MARK);
    if (m) out.push({ line: i + 1, kind: m[2], label: m[3], style: 'canonical', indent: m[1], raw: line });
  });
  return out;
}

// 哨兵体检：定位 TYPES 块与 DATA 块，返回 {ok, style, sections, errors}
export function inspectSentinels(text, cfg, { style = 'auto' } = {}) {
  const errors = [];
  const lines = text.split('\n');
  const all = scanMarkers(text);
  if (!all.length) {
    errors.push('未找到卡片派生哨兵块（期望拼写：' + (style === 'auto' ? 'legacy 或 canonical' : SENTINEL_STYLES[style].begin(style === 'legacy' ? cfg.tag : cfg.sid)) + '）');
    return { ok: false, style: null, sections: [], errors, markers: [] };
  }
  const styles = [...new Set(all.map((m) => m.style))];
  if (styles.length > 1) errors.push('哨兵拼写混用（' + styles.join(' + ') + '）：请先统一，本工具不猜');
  const effective = style === 'auto' ? styles[0] : style;
  const marks = all.filter((m) => m.style === effective);
  const foreign = all.filter((m) => m.style !== effective);
  if (foreign.length) errors.push('文件里另有 ' + foreign.length + ' 个其它拼写的哨兵标记（第 ' + foreign.map((m) => m.line).join('/') + ' 行）');
  const label = SENTINEL_STYLES[effective].labelOf(cfg);
  for (const m of marks) {
    if (m.label !== label) errors.push('第 ' + m.line + ' 行哨兵标签不符：本学科期望 ' + label + '，实际 ' + m.label);
  }

  // 配对（BEGIN…END），并检出重复 / 嵌套
  const pairs = [];
  let pending = null;
  for (const m of marks) {
    if (m.kind === 'BEGIN') {
      if (pending) errors.push('第 ' + pending.line + ' 行的 BEGIN 未闭合就遇到第 ' + m.line + ' 行的 BEGIN（重复或嵌套）');
      else pending = m;
      continue;
    }
    if (!pending) { errors.push('第 ' + m.line + ' 行是孤立的 END（没有配对的 BEGIN）'); continue; }
    if (m.line <= pending.line) { errors.push('第 ' + m.line + ' 行的 END 早于第 ' + pending.line + ' 行的 BEGIN'); pending = null; continue; }
    pairs.push({ beginLine: pending.line, endLine: m.line, beginRaw: lines[pending.line - 1], endRaw: lines[m.line - 1] });
    pending = null;
  }
  if (pending) errors.push('第 ' + pending.line + ' 行的 BEGIN 缺少配对的 END');

  // 按所在数组命名：`var TYPES = [` 之后、`var DATA = [` 之前＝types；`var DATA = [` 之后＝questions
  const idxOf = (needle) => lines.findIndex((l) => l.includes(needle)) + 1;
  const tTypes = idxOf('var TYPES = [');
  const tData = idxOf('var DATA = [');
  if (!tTypes || !tData) errors.push('未找到 `var TYPES = [` / `var DATA = [` 数组起点');
  const sections = [];
  for (const p of pairs) {
    if (tData && p.beginLine > tData) sections.push({ name: 'questions', ...p });
    else if (tTypes && p.beginLine > tTypes) sections.push({ name: 'types', ...p });
    else errors.push('第 ' + p.beginLine + ' 行的哨兵块不在 TYPES / DATA 数组内');
  }
  const types = sections.find((s) => s.name === 'types');
  const questions = sections.find((s) => s.name === 'questions');
  if (sections.length !== 2) errors.push('期望恰好 2 个哨兵块（TYPES 与 DATA 各一），实际 ' + sections.length + ' 个');
  if (!types) errors.push('缺少 TYPES 数组内的哨兵块');
  if (!questions) errors.push('缺少 DATA 数组内的哨兵块（卡片派生题块）');
  if (types && questions) {
    if (types.endLine > questions.beginLine) errors.push('哨兵块相交：TYPES 块 ' + types.beginLine + '-' + types.endLine
      + ' 与 DATA 块 ' + questions.beginLine + '-' + questions.endLine);
    if (tTypes && tData && !(tTypes < types.beginLine && types.endLine < tData)) {
      errors.push('TYPES 哨兵块与 `var TYPES = [` / `var DATA = [` 的位置不符（疑似两个块顺序颠倒）');
    }
    if (tData && !(questions.beginLine > tData)) errors.push('DATA 哨兵块出现在 `var DATA = [` 之前');
  }
  return { ok: errors.length === 0, style: effective, sections, errors, markers: marks };
}

// 哨兵块内的行（不含 BEGIN/END 两行）
export function sectionBodyLines(text, section) {
  return text.split('\n').slice(section.beginLine, section.endLine - 1);
}

// 原位替换：只换 BEGIN/END 之间的行，BEGIN/END 行本身按原文保留
export function replaceSectionBody(text, section, bodyLines) {
  const lines = text.split('\n');
  return lines.slice(0, section.beginLine).concat(bodyLines, lines.slice(section.endLine - 1)).join('\n');
}

// 一次替换多个块（从后往前，保证行号不失效）
export function replaceSections(text, sections, bodiesBySection) {
  const order = [...sections].sort((a, b) => b.beginLine - a.beginLine);
  let out = text;
  for (const s of order) {
    const body = bodiesBySection[s.name];
    if (body == null) continue;
    out = replaceSectionBody(out, s, body);
  }
  return out;
}

// 骨架：把两个哨兵块的内容挖掉（保留 BEGIN/END 行、块外一切、行尾），用于「块外逐字节不变」断言。
// 哨兵行统一折成 `<<<SENTINEL BEGIN|END>>>` 占位（拼写无关）——显式 --sentinel 允许改的恰好是
// 这 4 行文字，骨架对拍仍能发现行序/块位置/多余标记等结构性改动。
export function skeletonWithPlaceholders(text) {
  const out = [];
  let inBlock = false;
  for (const raw of text.split('\n')) {
    const line = raw.replace(/\r$/, '');
    const m = line.match(LEGACY_MARK) || line.match(CANON_MARK);
    if (m) {
      out.push('<<<SENTINEL ' + m[2] + '>>>');
      inBlock = m[2] === 'BEGIN';
      continue;
    }
    if (inBlock) continue;
    out.push(raw);
  }
  return out.join('\n');
}

// ---------------------------------------------------------------- 题型归类（判据沿用 t32 / t49 已裁定口径）
// —— 统计学科（t32）——
const ST_CHI_RE = /列联表|拟合优度|卡方|χ|独立性检验|同质性/;
const ST_CORR_RE = /相关/;
const ST_CAT_TO_TYPE = {
  prob_basic: 'prob',
  dist: 'dist',
  multidim: 'multi',
  numchar: 'numchar',
  limit: 'limit',
  sampling: 'sampdist',
  estimation: 'estimate',
  testing: 'testing',
  regress: 'regress'
};
export function classifyStats(cat, title) {
  const base = ST_CAT_TO_TYPE[cat];
  if (base === 'testing' && ST_CHI_RE.test(title)) return 'chi';
  if (base === 'numchar' && ST_CORR_RE.test(title)) return 'corr';
  return base || null;
}

// —— 数学三（t49）——
const M3_CAT_TO_TYPE = {
  limit: 'limit',
  infinitesimal: 'limit',
  derivative: 'deriv',
  drule: 'deriv',
  integral: 'integral',
  series: 'series',
  taylor: 'limit',
  mvt: 'proof',
  inequality: 'proof',
  ode: 'ode',
  multi: 'multivar',
  doubleint: 'dblint',
  linalg: 'linalg',
  trig: 'integral'
};
const M3_EIGEN_RE = /特征值|特征向量|二次型|标准形|正交变换|相似对角|可对角化|正定|规范形/;
// `\iint` 是 LaTeX 宏写法（trig01/trig06 的题面 $I=\iint\limits_{D}…$），必须与 Unicode ∬ 同等识别
const M3_DBLINT_RE = /∬|二重积分|\\iint/;
const M3_SERIES_RE = /幂级数|收敛半径|收敛域|和函数/;
const M3_AREA_RE = /面积/;
export function classifyMath3(cat, title, stem) {
  const base = M3_CAT_TO_TYPE[cat];
  if (!base) return null;
  const text = String(title || '') + '\n' + String(stem || '');
  if (base === 'linalg' && M3_EIGEN_RE.test(text)) return 'eigen';
  if (base === 'multivar' && M3_DBLINT_RE.test(text)) return 'dblint';
  if (base === 'integral' && M3_DBLINT_RE.test(text)) return 'dblint';
  if (base === 'limit' && M3_SERIES_RE.test(text)) return 'series';
  if (base === 'series' && M3_AREA_RE.test(text)) return 'integral';
  return base;
}

// —— 微观经济学（t49）——
const EC_CAT_TO_TYPE = {
  consumer: 'consumer',
  slutsky: 'consumer',
  competition: 'market',
  monopoly: 'market',
  moncomp: 'market',
  oligopoly: 'oligopoly',
  game: 'oligopoly',
  uncertainty: 'intertemporal',
  externality: 'externality',
  demand: 'demand',
  production: 'producer',
  cost: 'producer',
  profit: 'producer',
  factor: 'producer',
  equilibrium: 'welfare',
  welfare: 'welfare',
  information: 'information'
};
export function classifyEcon(cat) {
  return EC_CAT_TO_TYPE[cat] || null;
}

// ---------------------------------------------------------------- 新增题型键
// 统计（t32）：sample 为生成时定稿的人工样张（保持逐字节口径，勿改）
const STATS_NEW_TYPES = [
  {
    key: 'prob',
    name: '概率计算与事件运算',
    def: '古典/几何概型计数，条件概率、乘法公式、全概率与贝叶斯公式，事件运算（互斥、对立、独立）与加法公式。',
    judge: '卡片章节 cat=prob_basic（随机事件与概率）：求事件概率、判断事件关系、已知条件求条件概率。',
    sample: 'pb02、pb03、pb04'
  },
  {
    key: 'dist',
    name: '随机变量分布与密度',
    def: '分布函数与分布律/密度函数的互求、常见分布（0-1/二项/泊松/几何/均匀/正态/指数/伽马等）的识别与计算、随机变量函数的分布。',
    judge: '卡片章节 cat=dist（随机变量及分布）：给出分布或密度，求分布函数、概率、函数的分布。',
    sample: 'rv02、rv06、rv15'
  },
  {
    key: 'multi',
    name: '多维随机变量与联合分布',
    def: '联合分布函数、边缘分布、条件分布与条件密度、独立性判定、二维均匀/正态、卷积与和的分布、次序统计量。',
    judge: '卡片章节 cat=multidim（多维随机变量）：涉及两个及以上随机变量的联合/边缘/条件结构或次序统计量。',
    sample: 'mv02、mv06、xt02'
  },
  {
    key: 'numchar',
    name: '数字特征与矩',
    def: '期望与方差的定义与性质、协方差与相关系数、原点矩与中心矩、条件期望、特征函数与矩母函数、马尔可夫/切比雪夫不等式。',
    judge: '卡片章节 cat=numchar（数字特征，标题不含「相关」）：求期望/方差/协方差/矩或证明不等式。',
    sample: 'nc01、nc06、nc15'
  },
  {
    key: 'limit',
    name: '大数定律与中心极限定理',
    def: '切比雪夫/辛钦/伯努利大数定律的适用条件与结论、棣莫弗-拉普拉斯与中心极限定理的近似计算、两类极限定理的区别。',
    judge: '卡片章节 cat=limit（大数定律与中心极限定理）：判断收敛形式或做正态近似计算。',
    sample: 'll02、ll05、ll06'
  }
];

// 数学三 / 微观（t49）：sample 由 rows 现算（该 type 下首 3 个不同卡片 id）
const CV_NEW_TYPES = {
  math3: [
    {
      key: 'multivar',
      name: '多元函数微分与极值',
      def: '偏导数与全微分、复合函数与隐函数求导、多元函数极值与最值（含条件极值与拉格朗日乘数法）、二元函数可微性判定。',
      judge: '卡片章节 cat=multi（多元函数微分学，题干不含二重积分记号）：求偏导/全微分/极值，或判定可微性与连续-偏导关系。'
    }
  ],
  econ: [
    {
      key: 'demand',
      name: '需求·弹性与税收归宿',
      def: '需求价格弹性（点弹性/弧弹性）与总收益的关系、从量税与补贴的均衡变化、税负在买卖双方间的分担比例。',
      judge: '卡片章节 cat=demand（需求与弹性）：求弹性、判断降价对总收益的影响，或求征税/补贴后的新均衡与税负分担。'
    },
    {
      key: 'producer',
      name: '生产者：成本最小化与利润最大化',
      def: '生产函数（规模报酬、条件要素需求）与成本函数（固定/可变/边际/平均成本）、利润最大化的产量与要素需求、完全竞争供给。',
      judge: '卡片章节 cat=production/cost/profit/factor（生产、成本、利润与要素市场）：给出生产函数或成本函数，求要素需求/成本函数/利润最大化选择。'
    },
    {
      key: 'welfare',
      name: '一般均衡与福利',
      def: '交换经济（埃奇沃斯盒、契约曲线）、瓦尔拉斯均衡与帕累托最优、社会总剩余与福利比较（含垄断/合谋的无谓损失）。',
      judge: '卡片章节 cat=equilibrium/welfare（一般均衡与福利经济学）：涉及两人交换经济、均衡价格关系、帕累托最优或社会总剩余。'
    },
    {
      key: 'information',
      name: '信息经济学：逆向选择与信号',
      def: '不对称信息下的市场定价（逆向选择）、信号传递与分离/混同均衡、借贷市场与股权融资的信息结构。',
      judge: '卡片章节 cat=information（信息经济学）：题干出现「只有公司/企业家知道」「银行/投资者不知」等不对称信息语汇。'
    }
  ]
};

// ---------------------------------------------------------------- school 派生
// 统计（t32）：把例题 src 的年份挪到尾部，形成与既有手写题一致的「… <年份> 年」口径
export function schoolOfStats(src, year) {
  let rest = String(src).replace(YEAR_RE, '');
  rest = rest.replace(/[\s\-·—–]*年[\s\-·—–]*$/, '');
  rest = rest.replace(/^[\s\-·—–]+/, '').replace(/^年[\s\-·—–]*/, '').replace(/[\s\-·—–]+$/, '');
  rest = rest.replace(/\s{2,}/g, ' ').trim();
  if (!rest) throw new Error('school 去掉年份后为空: ' + src);
  const school = rest + ' ' + year + ' 年';
  if ((school.match(/年/g) || []).length !== 1) throw new Error('school 残留多余「年」: ' + school + ' ← ' + src);
  if ((school.match(new RegExp(String(year), 'g')) || []).length !== 1) throw new Error('school 里年份不唯一: ' + school + ' ← ' + src);
  return school;
}

// 数学三（t49）：2015 年起考试更名「招生考试」，2014 年及以前「入学统一考试」
export function schoolOfMath3(src, year) {
  if (!/数三|数学三/.test(String(src))) throw new Error('math3 例题 src 未标明数三: ' + src);
  const kind = year <= 2014 ? '入学统一考试' : '招生考试';
  return '全国硕士研究生' + kind + '-数学三 ' + year + ' 年';
}

// 微观（t49）：src 形如「2015 北大光华 431 真题」→「<机构-卷号> <年份> 年」（年份必须在尾部）
export const EC_SCHOOL_BASES = [
  { re: /北大光华/, base: '北京大学光华-431 金融学统计' },
  { re: /上海交通大学/, base: '上海交通大学-841' },
  { re: /北京交通大学/, base: '北京交通大学-820' },
  { re: /中央财经大学/, base: '中央财经大学-801' },
  { re: /北京大学经济学/, base: '北京大学经济学' }
];
export function schoolOfEcon(src, year) {
  const s = String(src);
  if (!/真题/.test(s)) throw new Error('econ 例题 src 未标明真题: ' + src);
  const hit = EC_SCHOOL_BASES.find((b) => b.re.test(s));
  if (!hit) throw new Error('econ 例题 src 无法匹配机构/卷号（需在 EC_SCHOOL_BASES 登记）: ' + src);
  const code = hit.base.match(/(\d{3})$/);
  if (code && !s.includes(code[1])) throw new Error('econ school 卷号与 src 不一致: ' + hit.base + ' ← ' + src);
  return hit.base + ' ' + year + ' 年';
}

// 与 tools/check_data.mjs 的 normalizeSchool 同口径（用于生成前自检「同组多写法」必为 0）
export const normalizeSchool = (s) => String(s == null ? '' : s)
  .replace(/[\uFF01-\uFF5E]/g, (ch) => String.fromCharCode(ch.charCodeAt(0) - 0xFEE0))
  .replace(/\u3000/g, ' ')
  .replace(/[·・•∙‧]/g, '-')
  .replace(/[／∕]/g, '/')
  .replace(/[—–―‐－]/g, '-')
  .replace(/\s+/g, '')
  .replace(/入学统一考试/g, '招生考试')
  .replace(/入学考试/g, '招生考试');

// ---------------------------------------------------------------- 学科配置
export const SUBJECTS = [
  {
    sid: 'stats',
    tag: 't32',
    alias: '统计学科',
    prefix: 'cv-st',
    cardFile: 'stats.js',
    bankFile: 'bank_stats.js',
    classify: classifyStats,
    school: schoolOfStats,
    newTypes: () => STATS_NEW_TYPES,
    adaptedNote: false,
    extraAssert: false
  },
  {
    sid: 'math3',
    tag: 't49',
    alias: '数学三',
    prefix: 'cv-m3',
    cardFile: 'math3.js',
    bankFile: 'bank_math3.js',
    classify: classifyMath3,
    school: schoolOfMath3,
    newTypes: () => CV_NEW_TYPES.math3.map((t) => ({ ...t, sample: null })), // sample 由 rows 现算
    adaptedNote: true,
    extraAssert: true
  },
  {
    sid: 'econ',
    tag: 't49',
    alias: '微观经济学',
    prefix: 'cv-ec',
    cardFile: 'econ.js',
    bankFile: 'bank_econ.js',
    classify: classifyEcon,
    school: schoolOfEcon,
    newTypes: () => CV_NEW_TYPES.econ.map((t) => ({ ...t, sample: null })),
    adaptedNote: true,
    extraAssert: true
  }
];
export const subjectOf = (sid) => SUBJECTS.find((c) => c.sid === sid) || null;

// ---------------------------------------------------------------- 读取知识卡数据
export function loadCards(cfg, dataDir) {
  const abs = path.join(dataDir, cfg.cardFile);
  const sandbox = { window: { SUBJECTS: {} }, String, Math, console };
  vm.createContext(sandbox);
  vm.runInContext(fs.readFileSync(abs, 'utf8'), sandbox, { filename: cfg.cardFile });
  const cards = sandbox.window.SUBJECTS[cfg.sid];
  if (!cards) throw new Error('未在 ' + cfg.cardFile + ' 找到 window.SUBJECTS.' + cfg.sid);
  return cards;
}

// 载入题库文件（用于写前自检与「块外骨架」对拍）
export function loadBankText(text, cfg) {
  const sandbox = { window: { BANK: {} }, String, Math, console };
  vm.createContext(sandbox);
  new vm.Script(text, { filename: cfg.bankFile }).runInContext(sandbox);
  const bank = sandbox.window.BANK[cfg.sid];
  if (!bank || !Array.isArray(bank.questions)) throw new Error(cfg.bankFile + ' 未定义 window.BANK.' + cfg.sid + '.questions');
  return bank;
}

// 卡片派生题的题号占位符（卡片例题 src 只写「年份 + 卷名」时无从得知真实题号）。
// 与 src/bank.mjs 的 BANK_NO_UNKNOWN 必须同字面量（浏览器侧不能 import tools/，故两边各写一份）。
export const CARD_NO_UNKNOWN = '未编号';

// 从卡片例题 src 里保守提取真实题号（口径：只认 src 明写的形态，绝不推断）。
//   「2024 北大光华 431 真题 一、（20 分）（答案册 PDF p141…）」→ 一、(20 分)   ← econ house style
//   「2016 年数三 二(9)（真题册 PDF p25；答案 6）」              → 二(9)        ← math3 house style
// 取不到返回 null（调用方写 CARD_NO_UNKNOWN，不得编造题号）。
export function examNoFromSrc(src) {
  const m = String(src == null ? '' : src).match(/([一二三四五六七八九十]+)\s*([、．.]?)\s*[（(]\s*(\d+)\s*(分)?\s*[)）]/);
  if (!m) return null;
  const han = m[1];
  const sep = m[2];
  const num = m[3];
  const fen = m[4];
  if (fen) return han + '、(' + num + ' 分)';
  if (sep) return han + sep + '(' + num + ')';
  return han + '(' + num + ')';
}

// ---------------------------------------------------------------- 期望题目集
export function expectedRows(cfg, cards) {
  const DATA = cards.DATA || [];
  const META = cards.META || {};
  const EXAMPLE = cards.EXAMPLE || {};
  const PITFALL = cards.PITFALL || {};
  const MNEM = cards.MNEM || {};
  const cardById = new Map(DATA.map((c) => [c.id, c]));
  const rows = [];
  const excluded = [];
  const seenId = new Set();
  for (const key of Object.keys(EXAMPLE)) {
    const v = EXAMPLE[key];
    const arr = Array.isArray(v) ? v : [v];
    for (let i = 0; i < arr.length; i++) {
      const e = arr[i] || {};
      const src = typeof e.src === 'string' ? e.src.trim() : '';
      // T142 / T149 口径：例题若已声明被某条 year 真题覆盖（subOf），不再重复收录派生题。
      // 卡片例题与 year 真题两处记录都保留，只是题库不重复出现同一道题（整题或同一小问）。
      if (e.subOf && e.subOf.id) {
        excluded.push({
          cardId: key,
          idx: i,
          src,
          reason: '例题已被 year 真题覆盖（T142/T149 口径：不重复收录）→ ' + e.subOf.id + '（' + (e.subOf.item || '?') + '）'
        });
        continue;
      }
      const m = src.match(YEAR_RE);
      const card = cardById.get(key) || {};
      if (!m) {
        excluded.push({ cardId: key, idx: i, src, reason: '例题 src 无四位年份（例题仅真题红线：不得编造年份/来源）' });
        continue;
      }
      const year = Number(m[0]);
      const id = cfg.prefix + '-' + key + (i > 0 ? '-' + (i + 1) : '');
      if (seenId.has(id)) throw new Error('id 冲突: ' + id);
      seenId.add(id);
      const meta = META[key];
      if (!meta || !Array.isArray(meta)) throw new Error('META 缺条目: ' + key);
      const type = cfg.classify(card.cat, card.title || '', e.q || '');
      if (!type) throw new Error('无法归类题型: ' + key + ' cat=' + card.cat);
      const noteParts = [
        '卡片例题（data/' + cfg.cardFile + ' 的 EXAMPLE[' + JSON.stringify(key) + ']' + (arr.length > 1 ? '[' + i + ']' : '') + '）来源原文：' + src + '。',
        cfg.adaptedNote && /改编/.test(src) ? '该题为例题来源标注的「改编」题（据真题改编，非原卷原题）。' : '',
        PITFALL[key] ? 'traps 取自 PITFALL[' + key + ']。' : 'PITFALL[' + key + '] 无条目 → 省略 traps 字段。',
        MNEM[key] ? 'hint 取自 MNEM[' + key + ']。' : 'MNEM[' + key + '] 无条目 → 省略 hint 字段。'
      ];
      const row = {
        id,
        cardId: key,
        idx: i,
        origin: 'card',
        year,
        school: cfg.school(src, year),
        no: examNoFromSrc(src) || CARD_NO_UNKNOWN,
        type,
        star: Number(meta[0]),
        tags: [key],
        stem: String(e.q == null ? '' : e.q),
        answer: String(e.a == null ? '' : e.a),
        altAnswer: e.a2 == null ? null : String(e.a2),
        traps: PITFALL[key] == null ? null : String(PITFALL[key]),
        hint: MNEM[key] == null ? null : String(MNEM[key]),
        src: { card: key, note: noteParts.join('') },
        cat: card.cat || ''
      };
      for (const f of ['stem', 'answer']) if (!row[f].trim()) throw new Error(id + ' 缺 ' + f);
      if (!Number.isInteger(row.star) || row.star < 1 || row.star > 5) throw new Error(id + ' star 非 1..5: ' + row.star);
      if (cfg.extraAssert) {
        if (!row.school.includes(String(year))) throw new Error(id + ' school 未含年份: ' + row.school);
        if (!row.src.note.includes(String(year))) throw new Error(id + ' src.note 未含年份: ' + row.src.note);
      }
      rows.push(row);
    }
  }
  return { rows, excluded, cardById };
}

// 新题型键（sample：统计为定稿人工样张；数学三 / 微观按 rows 现算首 3 个不同卡片 id）
export function newTypesFor(cfg, rows) {
  const list = cfg.newTypes();
  return list.map((t) => {
    if (t.sample != null) return { ...t };
    const ids = [...new Set(rows.filter((r) => r.type === t.key).map((r) => r.cardId))];
    return { ...t, sample: ids.slice(0, 3).join('、') };
  });
}

// ---------------------------------------------------------------- 渲染为数据文件源码（逐字节口径沿用 t32 / t49）
export function renderQuestion(q) {
  const lines = [];
  const head = [
    'id: ' + S(q.id),
    "origin: 'card'",
    'year: ' + q.year,
    'school: ' + S(q.school),
    'no: ' + S(q.no),
    'type: ' + S(q.type),
    'star: ' + q.star
  ].join(', ');
  lines.push('    {');
  lines.push('      ' + head + ',');
  lines.push('      tags: ' + S(q.tags) + ',');
  lines.push('      stem: ' + S(q.stem) + ',');
  lines.push('      answer: ' + S(q.answer) + ',');
  if (q.altAnswer != null) lines.push('      altAnswer: ' + S(q.altAnswer) + ',');
  if (q.traps != null) lines.push('      traps: ' + S(q.traps) + ',');
  if (q.hint != null) lines.push('      hint: ' + S(q.hint) + ',');
  lines.push('      src: { card: ' + S(q.src.card) + ', note: ' + S(q.src.note) + ' }');
  lines.push('    },');
  return lines.join('\n');
}
export function renderType(t) {
  return [
    '    { key: ' + S(t.key) + ', name: ' + S(t.name) + ', def: ' + S(t.def) + ',',
    '      judge: ' + S(t.judge) + ', sample: ' + S(t.sample) + ' },'
  ].join('\n');
}

// ---------------------------------------------------------------- 生成计划
// planSubject(cfg, {dataDir, style}) → {ok, errors, …}；只读，不写文件
export function planSubject(cfg, { dataDir, style = 'auto', sentinel = null } = {}) {
  const bankPath = path.join(dataDir, cfg.bankFile);
  const bankText = fs.readFileSync(bankPath, 'utf8');
  const check = inspectSentinels(bankText, cfg, { style });
  if (!check.ok) return { ok: false, errors: check.errors, sid: cfg.sid, bankPath };

  const cards = loadCards(cfg, dataDir);
  const { rows, excluded, cardById } = expectedRows(cfg, cards);
  const newTypes = newTypesFor(cfg, rows);
  const bodies = {
    types: newTypes.length ? newTypes.map(renderType) : [],
    questions: rows.map(renderQuestion)
  };
  // 落盘时的哨兵拼写：auto ＝沿用文件现状；显式指定＝把 BEGIN/END 行一并改写为该拼写
  const targetStyle = sentinel || check.style;
  const sections = check.sections.map((s) => ({ ...s }));
  if (targetStyle !== check.style) {
    const st = SENTINEL_STYLES[targetStyle];
    const label = st.labelOf(cfg);
    for (const s of sections) {
      s.beginRaw = st.begin(label);
      s.endRaw = st.end(label);
    }
  }
  let newText = replaceSections(bankText, sections, bodies);
  if (targetStyle !== check.style) {
    // 显式改拼写：把 BEGIN/END 行本身也替换掉（块外仅这两行变化，属用户显式要求）
    const st = SENTINEL_STYLES[targetStyle];
    const label = st.labelOf(cfg);
    const lines = newText.split('\n');
    for (const s of check.sections) {
      lines[s.beginLine - 1] = st.begin(label);
      lines[s.endLine - 1] = st.end(label);
    }
    newText = lines.join('\n');
  }

  // —— 自检 1：题源一致性（同 (year, normalizeSchool(school)) 不得有多种原始写法）
  const group = new Map();
  for (const r of rows) {
    const k = r.year + '\u0000' + normalizeSchool(r.school);
    if (!group.has(k)) group.set(k, new Set());
    group.get(k).add(r.school);
  }
  const conflicts = [...group.entries()].filter(([, s]) => s.size > 1);
  if (conflicts.length) {
    return { ok: false, sid: cfg.sid, bankPath, errors: ['school 规范化后同组多写法: ' + JSON.stringify(conflicts.map(([k, s]) => [k, [...s]]))] };
  }

  // —— 自检 2：语法 + 语义（vm 编译 / 载入 / 计数 / id 唯一）
  const errors = [];
  let bank = null;
  try {
    bank = loadBankText(newText, cfg);
  } catch (err) {
    errors.push('新文本载入失败（语法或结构错误）: ' + err.message);
  }
  const oldBank = loadBankText(bankText, cfg);
  const oldCardCount = oldBank.questions.filter((q) => q.origin === 'card').length;
  if (bank) {
    const ids = bank.questions.map((q) => q.id);
    const dup = ids.filter((id, i) => ids.indexOf(id) !== i);
    if (dup.length) errors.push('id 不唯一: ' + [...new Set(dup)].join(', '));
    const cardRows = bank.questions.filter((q) => q.origin === 'card');
    if (cardRows.length !== rows.length) errors.push('卡片派生条数不符：期望 ' + rows.length + '，实际 ' + cardRows.length);
    const expectTotal = oldBank.questions.length - oldCardCount + rows.length;
    if (bank.questions.length !== expectTotal) errors.push('题数算式不符：期望 ' + expectTotal + '（旧 ' + oldBank.questions.length + ' − 旧派生 ' + oldCardCount + ' + 新派生 ' + rows.length + '），实际 ' + bank.questions.length);
    for (const r of rows) if (!ids.includes(r.id)) errors.push('计划题目未出现在新文本: ' + r.id);
    if (bank.types.length < oldBank.types.length) errors.push('题型数减少：' + oldBank.types.length + ' → ' + bank.types.length);
  }

  // —— 自检 3：块外骨架逐字节一致
  if (skeletonWithPlaceholders(bankText) !== skeletonWithPlaceholders(newText)) {
    errors.push('块外骨架不一致（哨兵块之外被改动）');
  }

  // —— 自检 4：新题型键覆盖 ≥5
  const typeHits = {};
  for (const r of rows) typeHits[r.type] = (typeHits[r.type] || 0) + 1;
  for (const t of newTypes) {
    if ((typeHits[t.key] || 0) < 5) errors.push('新题型 ' + t.key + ' 覆盖不足 5 题: ' + (typeHits[t.key] || 0));
  }

  const report = {
    sid: cfg.sid,
    alias: cfg.alias,
    cardFile: cfg.cardFile,
    bankFile: cfg.bankFile,
    style: targetStyle,
    detectedStyle: check.style,
    sections: check.sections.map((s) => ({ name: s.name, beginLine: s.beginLine, endLine: s.endLine, oldBodyLines: s.endLine - s.beginLine - 1 })),
    cards: (cards.DATA || []).length,
    exampleKeys: Object.keys(cards.EXAMPLE || {}).length,
    entries: rows.length + excluded.length,
    ingested: rows.length,
    excluded: excluded.length,
    withAltAnswer: rows.filter((r) => r.altAnswer != null).length,
    withTraps: rows.filter((r) => r.traps != null).length,
    withHint: rows.filter((r) => r.hint != null).length,
    typeHits,
    newTypes: newTypes.map((t) => ({ key: t.key, sample: t.sample })),
    schools: [...new Set(rows.map((r) => r.school))].length,
    years: [...new Set(rows.map((r) => r.year))].sort().join(','),
    cardByIdSize: cardById.size,
    oldQuestions: oldBank.questions.length,
    newQuestions: bank ? bank.questions.length : null,
    oldCardRows: oldCardCount,
    changed: newText !== bankText,
    oldBytes: Buffer.byteLength(bankText),
    newBytes: Buffer.byteLength(newText)
  };
  return { ok: errors.length === 0, errors, cfg, bankPath, bankText, newText, rows, excluded, newTypes, report, sections };
}

// ---------------------------------------------------------------- CLI
export const USAGE = [
  '用法: node ' + TOOL + ' [选项]',
  '',
  '  --subject <math3|econ|stats|all>   学科（缺省 all）',
  '  --dry-run                          只算不写（缺省；与 --write 同时给出即报错）',
  '  --write                            落盘（只写两个哨兵块之间；块外逐字节不变）',
  '  --data-dir <dir>                   数据目录（缺省 env ATHENA_DATA_DIR，再缺省 <repo>/data）',
  '  --sentinel <auto|legacy|canonical> 落盘时的哨兵拼写（缺省 auto＝沿用现状；legacy＝GENERATED card-questions，canonical＝CARD-DERIVED <subject>）',
  '  --allow-math3-reorder              放行 math3 / all（历史重排风险的显式确认）',
  '  --allow-workspace-write            放行「会改动工作树 data/」的落盘',
  '  --json                             机器可读摘要',
  '  --quiet                            只输出一行结论',
  '  --help                             本帮助',
  '',
  '退出码：0 成功（含「无变化」）；2 用法 / 守卫 / 哨兵体检 / 写前自检失败；1 未预期异常。'
].join('\n');

export function parseArgs(argv) {
  const opts = {
    subject: 'all',
    write: false,
    dryRun: false,
    dataDir: null,
    sentinel: 'auto',
    allowMath3Reorder: false,
    allowWorkspaceWrite: false,
    json: false,
    quiet: false,
    help: false,
    errors: []
  };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    const need = (name) => {
      const v = argv[i + 1];
      if (v == null || v.startsWith('--')) { opts.errors.push(name + ' 需要一个取值'); return null; }
      i++;
      return v;
    };
    switch (a) {
      case '--subject': { const v = need(a); if (v != null) opts.subject = v; break; }
      case '--data-dir': { const v = need(a); if (v != null) opts.dataDir = v; break; }
      case '--sentinel': { const v = need(a); if (v != null) opts.sentinel = v; break; }
      case '--write': opts.write = true; break;
      case '--dry-run': opts.dryRun = true; break;
      case '--allow-math3-reorder': opts.allowMath3Reorder = true; break;
      case '--allow-workspace-write': opts.allowWorkspaceWrite = true; break;
      case '--json': opts.json = true; break;
      case '--quiet': opts.quiet = true; break;
      case '--help': case '-h': opts.help = true; break;
      default: opts.errors.push('未知参数: ' + a);
    }
  }
  if (!['math3', 'econ', 'stats', 'all'].includes(opts.subject)) opts.errors.push('--subject 取值只能是 math3 / econ / stats / all：' + opts.subject);
  if (opts.write && opts.dryRun) opts.errors.push('--write 与 --dry-run 不能同时给出');
  if (!['auto', 'legacy', 'canonical'].includes(opts.sentinel)) opts.errors.push('--sentinel 取值只能是 auto / legacy / canonical：' + opts.sentinel);
  return opts;
}

export function resolveDataDir(opts = {}, { env = process.env, cwd = process.cwd() } = {}) {
  const raw = opts.dataDir || env.ATHENA_DATA_DIR || path.join(ROOT, 'data');
  return path.resolve(cwd, raw);
}
export const isWorkspaceDataDir = (abs) => path.resolve(abs).toLowerCase() === path.resolve(ROOT, 'data').toLowerCase();

export function main(argv = process.argv.slice(2), io = { log: console.log, error: console.error }) {
  const opts = parseArgs(argv);
  if (opts.help) { io.log(USAGE); return 0; }
  if (opts.errors.length) {
    for (const e of opts.errors) io.error('[参数错误] ' + e);
    io.error('用法见 node ' + TOOL + ' --help');
    return 2;
  }
  // G1：math3 / all 默认拒绝（含干跑），除非显式放行——契约要求
  if (!opts.allowMath3Reorder && (opts.subject === 'all' || opts.subject === 'math3')) {
    io.error('[拒绝执行] --subject ' + opts.subject + '：math3 的历史生成器会重排 t53/t49 生成块并吞掉元素间逗号（事故见 backup/scratch/bank-fix5/）。');
    io.error('  本工具已改为哨兵原位替换，但契约要求 math3 / all 必须显式确认：加 --allow-math3-reorder。');
    io.error('  只处理统计或微观：node ' + TOOL + ' --subject stats|econ [--write]');
    return 2;
  }
  let dataDir;
  try {
    dataDir = resolveDataDir(opts);
  } catch (err) {
    io.error('[数据目录] ' + err.message);
    return 2;
  }
  if (!fs.existsSync(dataDir)) {
    io.error('[数据目录] 不存在: ' + dataDir);
    return 2;
  }
  const picked = SUBJECTS.filter((c) => opts.subject === 'all' || opts.subject === c.sid);
  if (!picked.length) { io.error('[参数错误] 未知学科: ' + opts.subject); return 2; }

  const summaries = [];
  for (const cfg of picked) {
    // 体检一律用 auto（legacy / canonical 都接受，但必须恰一套、拼写不得混用）；
    // --sentinel legacy|canonical 只是「落盘时把 BEGIN/END 两行改写为该拼写」的目标值。
    const plan = planSubject(cfg, { dataDir, style: 'auto', sentinel: opts.sentinel === 'auto' ? null : opts.sentinel });
    if (!plan.ok) {
      for (const e of plan.errors) io.error('[' + cfg.sid + ' 哨兵体检/自检失败] ' + e);
      return 2;
    }
    const s = plan.report;
    summaries.push(s);
    if (!opts.json) {
      const sec = (n) => s.sections.find((x) => x.name === n) || { beginLine: '?', endLine: '?', oldBodyLines: '?' };
      io.log('== ' + cfg.alias + '（data/' + cfg.bankFile + '）==');
      io.log('  数据目录: ' + dataDir);
      io.log('  哨兵拼写: ' + s.style + '（检出 ' + s.detectedStyle + '）｜TYPES 块 ' + sec('types').beginLine + '-' + sec('types').endLine
        + '（' + sec('types').oldBodyLines + ' 行）｜DATA 块 ' + sec('questions').beginLine + '-' + sec('questions').endLine + '（' + sec('questions').oldBodyLines + ' 行）');
      io.log('  计划：卡 ' + s.cards + ' 张 / EXAMPLE ' + s.exampleKeys + ' 键 → 条目 ' + s.entries
        + '（入库 ' + s.ingested + '，排除 ' + s.excluded + '）｜题型键 ' + Object.keys(s.typeHits).length
        + '｜来源 ' + s.schools + ' 个｜年份 ' + s.years);
      io.log('  题数：' + s.oldQuestions + ' → ' + s.newQuestions + '（卡片派生 ' + s.oldCardRows + ' → ' + s.ingested + '）');
      io.log('  结果：' + (s.changed ? '将变更（' + s.oldBytes + ' B → ' + s.newBytes + ' B）' : '无变化（已与生成口径一致，' + s.oldBytes + ' B）'));
    }
    if (opts.write) {
      if (!s.changed) {
        if (!opts.json && !opts.quiet) io.log('  （无变化，不写盘）');
        continue;
      }
      if (isWorkspaceDataDir(dataDir) && !opts.allowWorkspaceWrite) {
        io.error('[拒绝写入] 本次会改动工作树 data/：' + plan.bankPath);
        io.error('  确要写入工作树请显式加 --allow-workspace-write；或先复制到沙盒目录并用 --data-dir <dir>。');
        return 2;
      }
      fs.writeFileSync(plan.bankPath, plan.newText, 'utf8');
      if (!opts.json) io.log('  已落盘 ' + plan.bankPath + '（' + s.newBytes + ' B）');
    }
  }
  if (opts.json) {
    io.log(JSON.stringify({ tool: TOOL, version: TOOL_VERSION, dataDir, write: opts.write, subjects: summaries }, null, 2));
  } else if (opts.quiet) {
    io.log(summaries.map((s) => s.sid + ': ' + (s.changed ? '将变更 ' + s.oldBytes + '→' + s.newBytes : '无变化')).join('；'));
  } else if (!opts.write) {
    io.log('（' + picked.map((c) => c.sid).join(' / ') + '：干跑，未落盘；加 --write 落盘）');
  }
  return 0;
}

// 只有「作为可执行入口」时才跑 CLI：import 本模块零副作用
const isMain = (() => {
  const arg = process.argv[1];
  if (!arg) return false;
  try {
    return path.resolve(arg) === fileURLToPath(import.meta.url);
  } catch {
    return false;
  }
})();
if (isMain && process.env.BANK_CV_NO_CLI !== '1') {
  let code = 0;
  try {
    code = main();
  } catch (err) {
    console.error('[未预期异常] ' + (err && err.stack ? err.stack : err));
    code = 1;
  }
  process.exit(code);
}