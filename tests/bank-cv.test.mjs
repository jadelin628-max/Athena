// tests/bank-cv.test.mjs —— t72：tools/bank-cv.mjs（哨兵原位替换生成器）的单元与反证测试。
// 所有写盘都发生在 os.tmpdir() 的临时副本里；工作树 data/ 只读。
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import crypto from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { pathToFileURL } from 'node:url';
import {
  ROOT, TOOL, SUBJECTS, scanMarkers, inspectSentinels, sectionBodyLines, replaceSectionBody,
  parseArgs, planSubject, resolveDataDir, isWorkspaceDataDir, renderQuestion, renderType, USAGE
} from '../tools/bank-cv.mjs';

const TOOL_PATH = path.join(ROOT, TOOL);
const REPO_DATA = path.join(ROOT, 'data');
const CARD_FILES = ['math3.js', 'econ.js', 'stats.js'];
const BANK_FILES = ['bank_math3.js', 'bank_econ.js', 'bank_stats.js'];
const SIDS = ['stats', 'econ', 'math3'];

const sha = (p) => crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex');
const read = (p) => fs.readFileSync(p, 'utf8');

function mkSandbox() {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'bank-cv-test-'));
  for (const f of [...CARD_FILES, ...BANK_FILES]) fs.copyFileSync(path.join(REPO_DATA, f), path.join(dir, f));
  return dir;
}
function runCli(args) {
  const r = spawnSync(process.execPath, [TOOL_PATH, ...args], { cwd: ROOT, stdio: ['ignore', 'pipe', 'pipe'], encoding: 'utf8' });
  return { status: r.status, stdout: r.stdout || '', stderr: r.stderr || '' };
}
// 通用：删掉某学科 DATA 哨兵块内的最后一个元素（模拟「派生题被外部删掉」）
function deleteLastElement(text, sid) {
  const sec = inspectSentinels(text, subjectOf(sid)).sections.find((s) => s.name === 'questions');
  const body = sectionBodyLines(text, sec);
  let open = -1;
  for (let i = body.length - 1; i >= 0; i--) if (/^\s{4}\{$/.test(body[i])) { open = i; break; }
  assert.ok(open > 0, '应能在 ' + sid + ' 块内找到元素起点');
  const lines = text.split('\n');
  return lines.slice(0, sec.beginLine).concat(body.slice(0, open), lines.slice(sec.endLine - 1)).join('\n');
}
const repoPlan = (sid) => planSubject(subjectOf(sid), { dataDir: REPO_DATA });
function subjectOf(sid) {
  return SUBJECTS.find((c) => c.sid === sid);
}

test('parseArgs 缺省：subject=all、不写盘、无错误', () => {
  const p = parseArgs([]);
  assert.deepEqual(p.errors, []);
  assert.equal(p.subject, 'all');
  assert.equal(p.write, false);
  assert.equal(p.dryRun, false);
  assert.equal(p.sentinel, 'auto');
  assert.equal(p.allowMath3Reorder, false);
  assert.equal(p.allowWorkspaceWrite, false);
});

test('反证：非法 subject / 非法 sentinel / --write 与 --dry-run 互斥 / --data-dir 缺值 / 未知参数 均进 errors', () => {
  assert.match(parseArgs(['--subject', 'bogus']).errors.join(' '), /subject/);
  assert.match(parseArgs(['--sentinel', 'bogus']).errors.join(' '), /sentinel/);
  assert.match(parseArgs(['--write', '--dry-run']).errors.join(' '), /不能同时/);
  assert.match(parseArgs(['--data-dir']).errors.join(' '), /需要一个取值/);
  assert.match(parseArgs(['--nope']).errors.join(' '), /未知参数/);
  assert.deepEqual(parseArgs(['--subject', 'stats', '--write', '--data-dir', 'x']).errors, []);
});

test('resolveDataDir：--data-dir 优先，其次 ATHENA_DATA_DIR，最后工作树 data/', () => {
  assert.equal(resolveDataDir({ dataDir: 'tmp-x' }), path.resolve('tmp-x'));
  assert.equal(resolveDataDir({ dataDir: null }, { env: { ATHENA_DATA_DIR: 'env-y' } }), path.resolve('env-y'));
  assert.equal(resolveDataDir({ dataDir: null }, { env: {} }), REPO_DATA);
  assert.equal(isWorkspaceDataDir(REPO_DATA), true);
  assert.equal(isWorkspaceDataDir(path.join(os.tmpdir(), 'nope')), false);
});

test('真实三科：legacy 哨兵各两对，按数组归属 types / questions，且各项体检数一致', () => {
  for (const sid of SIDS) {
    const cfg = subjectOf(sid);
    const text = read(path.join(REPO_DATA, cfg.bankFile));
    const s = inspectSentinels(text, cfg);
    assert.equal(s.ok, true, sid + ' 哨兵体检应通过：' + JSON.stringify(s.errors));
    assert.equal(s.style, 'legacy');
    assert.deepEqual(s.sections.map((x) => x.name), ['types', 'questions']);
    assert.ok(s.sections[0].beginLine < s.sections[1].beginLine, sid + ' TYPES 块应在 DATA 块之前');
    assert.equal(scanMarkers(text).length, 4, sid + ' 应恰有 4 个哨兵标记');
  }
});

test('canonical 拼写：新文件用 CARD-DERIVED 拼接即被接受；显式 --sentinel legacy 时被拒', () => {
  const dir = mkSandbox();
  const p = path.join(dir, 'bank_stats.js');
  const cfg = subjectOf('stats');
  let text = read(p);
  for (const m of scanMarkers(text)) {
    const want = m.kind === 'BEGIN' ? '  // ===== BEGIN CARD-DERIVED stats =====' : '  // ===== END CARD-DERIVED stats =====';
    text = text.split('\n').map((l, i) => (i + 1 === m.line ? want : l)).join('\n');
  }
  fs.writeFileSync(p, text);
  assert.equal(inspectSentinels(read(p), cfg).style, 'canonical');
  const planOk = planSubject(cfg, { dataDir: dir, style: 'auto' });
  assert.equal(planOk.ok, true, JSON.stringify(planOk.errors));
  assert.equal(planOk.report.style, 'canonical');
  assert.equal(planOk.report.detectedStyle, 'canonical');
  assert.equal(planOk.report.changed, false, '仅换拼写不应改变块内内容');
  const planRejected = planSubject(cfg, { dataDir: dir, style: 'legacy' });
  assert.equal(planRejected.ok, false);
  assert.match(planRejected.errors.join(' '), /未找到|缺少|期望/);
});

test('replaceSectionBody：只替换 BEGIN/END 之间的行，块外（含元素间逗号）逐字节不变', () => {
  const text = [
    'window.BANK.t = {', '  var TYPES = [',
    '  // ==== BEGIN GENERATED card-questions (t32) ====', '    { key: "a" },', '  // ==== END GENERATED card-questions (t32) ====',
    '  ];', '  var DATA = [', '    { id: "x" },',
    '  // ==== BEGIN GENERATED card-questions (t32) ====', '    { id: "cv-1" },', '  // ==== END GENERATED card-questions (t32) ====',
    '  ];', '};'
  ].join('\n');
  const s = inspectSentinels(text, subjectOf('stats'));
  assert.equal(s.ok, true, JSON.stringify(s.errors));
  assert.deepEqual(s.sections.map((x) => x.name), ['types', 'questions']);
  const out = replaceSectionBody(text, s.sections[1], ['    { id: "cv-1" },', '    { id: "cv-2" },']);
  assert.equal(out, text.replace('    { id: "cv-1" },', '    { id: "cv-1" },\n    { id: "cv-2" },'), '块外逐字节不变、只重写块内');
  assert.ok(out.split('\n')[0] === text.split('\n')[0]);
  assert.ok(out.endsWith('  ];\n};'));
});

test('反证：哨兵缺失（孤立 END）→ planSubject 失败', () => {
  const dir = mkSandbox();
  const p = path.join(dir, 'bank_stats.js');
  fs.writeFileSync(p, read(p).replace(/^\s*\/\/ ={3,} BEGIN GENERATED card-questions \(t32\) ={3,}$/m, '  // (被删)'));
  const plan = planSubject(subjectOf('stats'), { dataDir: dir });
  assert.equal(plan.ok, false);
  assert.match(plan.errors.join(' '), /孤立|配对/);
});

test('反证：哨兵重复 → planSubject 失败', () => {
  const dir = mkSandbox();
  const p = path.join(dir, 'bank_econ.js');
  const text = read(p);
  const line = text.split('\n').find((l) => /BEGIN GENERATED card-questions/.test(l));
  fs.writeFileSync(p, text.replace('  var DATA = [', '  var DATA = [\n' + line + '\n  // ==== END GENERATED card-questions (t49) ===='));
  const plan = planSubject(subjectOf('econ'), { dataDir: dir });
  assert.equal(plan.ok, false);
  assert.match(plan.errors.join(' '), /未闭合|重复|嵌套|期望/);
});

test('反证：哨兵嵌套/相交（A.BEGIN < B.BEGIN < A.END）→ planSubject 失败', () => {
  const dir = mkSandbox();
  const p = path.join(dir, 'bank_math3.js');
  const lines = read(p).split('\n');
  const begin2 = lines.findIndex((l) => /BEGIN GENERATED card-questions/.test(l));
  lines.splice(begin2 + 1, 0, lines[begin2]);
  fs.writeFileSync(p, lines.join('\n'));
  const plan = planSubject(subjectOf('math3'), { dataDir: dir });
  assert.equal(plan.ok, false, '嵌套哨兵必须被拒绝');
  assert.match(plan.errors.join(' '), /未闭合|重复|嵌套/);
});

test('幂等/一致性：真实数据三科 planSubject 均报「无变化」（生成口径与库内逐字节一致）', () => {
  for (const sid of SIDS) {
    const plan = repoPlan(sid);
    assert.equal(plan.ok, true, sid + '：' + JSON.stringify(plan.errors));
    assert.equal(plan.report.changed, false, sid + ' 应与库内一致（changed=false），实际 ' + JSON.stringify(plan.report));
    assert.equal(plan.newText, plan.bankText, sid + ' 新文本应与库内逐字节相同');
  }
});

test('注入恢复：删掉一条派生题 → 报将变更且题数算式自洽；apply 后与库内逐字节相同；再次 plan 回「无变化」', () => {
  for (const sid of SIDS) {
    const dir = mkSandbox();
    const p = path.join(dir, subjectOf(sid).bankFile);
    const repoText = read(path.join(REPO_DATA, subjectOf(sid).bankFile));
    const base = repoPlan(sid).report;
    fs.writeFileSync(p, deleteLastElement(repoText, sid));
    const plan = planSubject(subjectOf(sid), { dataDir: dir });
    assert.equal(plan.ok, true, sid + '：' + JSON.stringify(plan.errors));
    assert.equal(plan.report.changed, true, sid + ' 注入后应报将变更');
    assert.equal(plan.report.newQuestions, base.newQuestions, sid + ' 生成后的题数应为库内原值');
    assert.equal(plan.report.oldQuestions, base.newQuestions - 1, sid + ' 注入后读到的题数应少 1');
    fs.writeFileSync(p, plan.newText);
    assert.equal(read(p), repoText, sid + ' 恢复后应与库内逐字节相同');
    assert.equal(planSubject(subjectOf(sid), { dataDir: dir }).report.changed, false, sid + ' 二次应报无变化');
  }
});

test('反证：块外注入改动必须被原样保留（工具不重写头部/sourceNote）', () => {
  const dir = mkSandbox();
  const p = path.join(dir, 'bank_econ.js');
  const lines = read(p).split('\n');
  const mark = '// TEST-OUTSIDE-NOTE';
  lines[0] = lines[0] + ' ' + mark;
  lines.splice(lines.length - 1, 0, '// TEST-OUTSIDE-TAIL');
  fs.writeFileSync(p, lines.join('\n'));
  const plan = planSubject(subjectOf('econ'), { dataDir: dir });
  assert.equal(plan.ok, true, JSON.stringify(plan.errors));
  assert.equal(plan.report.changed, false, '块外改动不应影响块内生成结果');
  fs.writeFileSync(p, plan.newText);
  const after = read(p);
  assert.ok(after.split('\n')[0].endsWith(mark), '首行块外标记应保留');
  assert.ok(after.includes('// TEST-OUTSIDE-TAIL'), '尾部块外标记应保留');
  fs.writeFileSync(p, deleteLastElement(after, 'econ'));
  const plan2 = planSubject(subjectOf('econ'), { dataDir: dir });
  assert.equal(plan2.report.changed, true);
  assert.ok(plan2.newText.split('\n')[0].endsWith(mark), '块被替换后块外标记仍应保留');
  assert.ok(plan2.newText.includes('// TEST-OUTSIDE-TAIL'));
});

test('反证：块外既有题与卡片派生题 id 撞车 → 写前自检报「id 不唯一」；块内的重复会被原位替换自然覆盖', () => {
  const dir = mkSandbox();
  const p = path.join(dir, 'bank_stats.js');
  const cfg = subjectOf('stats');
  const text = read(p);
  const cardId = (text.match(/^      id: "(cv-st-[^"]+)"/m) || [])[1];
  const yearMatch = text.match(/id: (["'])st-\d{4}-\d+\1/);
  assert.ok(cardId, '应能取到一个卡片派生 id');
  assert.ok(yearMatch, '应能取到一个块外真题 id');
  fs.writeFileSync(p, text.replace(yearMatch[0], 'id: "' + cardId + '"'));
  const plan = planSubject(cfg, { dataDir: dir });
  assert.equal(plan.ok, false);
  assert.match(plan.errors.join(' '), /id 不唯一/);
  // 块内重复不构成风险：块被整块重写，重复被覆盖
  const dir2 = mkSandbox();
  const p2 = path.join(dir2, 'bank_stats.js');
  const body = sectionBodyLines(text, inspectSentinels(text, cfg).sections.find((s) => s.name === 'questions'));
  const ids = body.map((l) => (l.match(/id: "([^"]+)"/) || [])[1]).filter(Boolean);
  fs.writeFileSync(p2, text.replace('id: "' + ids[1] + '"', 'id: "' + ids[0] + '"'));
  const plan2 = planSubject(cfg, { dataDir: dir2 });
  assert.equal(plan2.ok, true, JSON.stringify(plan2.errors));
  assert.equal(plan2.newText, text, '块内注入被原位替换覆盖：生成结果回到库内逐字节形态');
  assert.equal(plan2.report.changed, true, '相对「被注入过的文件」当然有变化，但产物是规范形态');
  assert.equal((plan2.newText.match(new RegExp('id: "' + ids[0] + '"', 'g')) || []).length, 1, '重复 id 被清除');
});

test('渲染单元：renderQuestion 缩进 4 空格且行尾逗号；renderType 同款', () => {
  const q = renderQuestion({
    id: 'cv-st-t1', origin: 'card', year: 2020, school: '某大学 432 统计学 2020 年', no: '卡片 t1', type: 'prob', star: 4,
    tags: ['t1'], stem: '题干', answer: '答案', src: { card: 't1', note: '卡片例题（data/stats.js 的 EXAMPLE["t1"]）来源原文：某大学 2020 年真题。' }
  });
  const lines = q.split('\n');
  assert.equal(lines[0], '    {');
  assert.equal(lines[lines.length - 1], '    },');
  assert.ok(lines.every((l) => l === '    {' || l === '    },' || l.startsWith('      ')), '元素缩进只应为 4/6 空格');
  assert.match(q, /id: "cv-st-t1", origin: 'card'/);
  assert.match(q, /src: \{ card: "t1", note: /);
  const t = renderType({ key: 'prob', name: '概率论', def: '定义', judge: '判据', sample: 'pb01、pb02、pb03' });
  assert.equal(t.split('\n')[0], '    { key: "prob", name: "概率论", def: "定义",');
  assert.ok(t.endsWith('},'));
});

test('CLI：--help exit 0 且含用法；--json 输出可解析', () => {
  const dir = mkSandbox();
  const help = runCli(['--help']);
  assert.equal(help.status, 0);
  assert.ok(help.stdout.includes('--subject'));
  assert.ok(USAGE.includes('--allow-workspace-write'));
  const j = runCli(['--subject', 'stats', '--dry-run', '--data-dir', dir, '--json']);
  assert.equal(j.status, 0, j.stderr);
  const obj = JSON.parse(j.stdout);
  assert.equal(obj.tool, TOOL);
  assert.equal(obj.subjects[0].sid, 'stats');
  assert.equal(obj.subjects[0].changed, false);
  assert.equal(obj.subjects.length, 1);
});

test('CLI 守卫：all / math3 未加 --allow-math3-reorder → exit 2；非法 subject → exit 2；--write 与 --dry-run 互斥 → exit 2', () => {
  const dir = mkSandbox();
  assert.equal(runCli(['--subject', 'all', '--dry-run', '--data-dir', dir]).status, 2);
  assert.equal(runCli(['--subject', 'math3', '--dry-run', '--data-dir', dir]).status, 2);
  assert.equal(runCli(['--subject', 'nope', '--dry-run', '--data-dir', dir]).status, 2);
  assert.equal(runCli(['--subject', 'stats', '--write', '--dry-run', '--data-dir', dir]).status, 2);
  assert.equal(runCli(['--subject', 'stats', '--dry-run', '--data-dir', dir]).status, 0);
  assert.equal(runCli(['--subject', 'all', '--dry-run', '--allow-math3-reorder', '--data-dir', dir]).status, 0);
});

test('CLI 端到端：沙盒 --write 零变化 → exit 0 且 sha 不变；注入后 --write 复原；二次 --write 幂等', () => {
  const dir = mkSandbox();
  for (const [sid, extra] of [['stats', []], ['econ', []], ['math3', ['--allow-math3-reorder']]]) {
    const f = subjectOf(sid).bankFile;
    const p = path.join(dir, f);
    const repoText = read(path.join(REPO_DATA, f));
    const before = sha(p);
    const r1 = runCli(['--subject', sid, '--write', '--data-dir', dir, ...extra]);
    assert.equal(r1.status, 0, sid + '：' + r1.stderr);
    assert.equal(sha(p), before, sid + ' 零变化应逐字节不变');
    fs.writeFileSync(p, deleteLastElement(repoText, sid));
    const r2 = runCli(['--subject', sid, '--write', '--data-dir', dir, ...extra]);
    assert.equal(r2.status, 0, sid + '：' + r2.stderr);
    assert.equal(read(p), repoText, sid + ' 注入后应复原为库内逐字节相同');
    assert.equal(sha(p), sha(path.join(REPO_DATA, f)));
    const r3 = runCli(['--subject', sid, '--write', '--data-dir', dir, ...extra]);
    assert.equal(r3.status, 0);
    assert.equal(read(p), repoText, sid + ' 二次 --write 应幂等');
  }
});

test('CLI 哨兵缺失时 --write 不落盘（exit 2，文件 sha 不变）', () => {
  const dir = mkSandbox();
  const p = path.join(dir, 'bank_econ.js');
  fs.writeFileSync(p, read(p).replace(/^\s*\/\/ ={3,} BEGIN GENERATED card-questions \(t49\) ={3,}$/m, '  // (被删)'));
  const before = sha(p);
  const r = runCli(['--subject', 'econ', '--write', '--data-dir', dir]);
  assert.equal(r.status, 2);
  assert.equal(sha(p), before);
});

test('CLI 工作树保护：副本工具（ROOT＝临时沙盒）改写「自己的工作树 data/」需 --allow-workspace-write', () => {
  const fakeRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'bank-cv-root-'));
  fs.mkdirSync(path.join(fakeRoot, 'tools'));
  fs.mkdirSync(path.join(fakeRoot, 'data'));
  fs.copyFileSync(TOOL_PATH, path.join(fakeRoot, 'tools', 'bank-cv.mjs'));
  for (const f of ['econ.js', 'bank_econ.js']) fs.copyFileSync(path.join(REPO_DATA, f), path.join(fakeRoot, 'data', f));
  const fakeTool = path.join(fakeRoot, 'tools', 'bank-cv.mjs');
  const p = path.join(fakeRoot, 'data', 'bank_econ.js');
  fs.writeFileSync(p, deleteLastElement(read(p), 'econ'));
  const injected = sha(p);
  const r1 = spawnSync(process.execPath, [fakeTool, '--subject', 'econ', '--write'], { cwd: ROOT, stdio: ['ignore', 'pipe', 'pipe'], encoding: 'utf8' });
  assert.equal(r1.status, 2, '未加 --allow-workspace-write 应拒绝（当前只对工作树 data/ 生效，副本 ROOT 即临时沙盒）');
  assert.equal(sha(p), injected, '拒绝后不得落盘');
  const r2 = spawnSync(process.execPath, [fakeTool, '--subject', 'econ', '--write', '--allow-workspace-write'], { cwd: ROOT, stdio: ['ignore', 'pipe', 'pipe'], encoding: 'utf8' });
  assert.equal(r2.status, 0, r2.stderr);
  assert.equal(read(p), read(path.join(REPO_DATA, 'bank_econ.js')), '放行后应复原');
});

test('CLI --sentinel canonical 落盘：BEGIN/END 行按 canonical 改写，块内与块外其余字节不变', () => {
  const dir = mkSandbox();
  const p = path.join(dir, 'bank_stats.js');
  const before = read(p);
  const r1 = runCli(['--subject', 'stats', '--write', '--sentinel', 'canonical', '--data-dir', dir]);
  assert.equal(r1.status, 0, r1.stderr);
  const after = read(p);
  assert.ok(after.includes('  // ===== BEGIN CARD-DERIVED stats ====='), '应写入 canonical BEGIN');
  assert.ok(after.includes('  // ===== END CARD-DERIVED stats ====='), '应写入 canonical END');
  assert.ok(!after.includes('BEGIN GENERATED card-questions'), 'legacy 标记应被替换');
  // 只有 4 行哨兵不同，其余全部逐字节相同
  const a = before.split('\n');
  const b = after.split('\n');
  assert.equal(a.length, b.length);
  const diffLines = a.map((l, i) => (l === b[i] ? 0 : i + 1)).filter(Boolean);
  assert.deepEqual(diffLines, scanMarkers(before).map((m) => m.line), '差异行恰为 4 个哨兵行');
  // 改回 legacy 亦可（幂等往返）
  const r2 = runCli(['--subject', 'stats', '--write', '--sentinel', 'legacy', '--data-dir', dir]);
  assert.equal(r2.status, 0, r2.stderr);
  assert.equal(read(p), before, '--sentinel legacy 应把文件还原为原样');
});

test('import 零副作用：被 import 时不执行 CLI；BANK_CV_NO_CLI=1 时作为入口也不执行', () => {
  const href = pathToFileURL(TOOL_PATH).href;
  const r = spawnSync(process.execPath, ['-e', 'import(' + JSON.stringify(href) + ').then(() => console.log("IMPORT-OK"))'], { cwd: ROOT, stdio: ['ignore', 'pipe', 'pipe'], encoding: 'utf8' });
  assert.equal(r.status, 0, r.stderr);
  assert.equal(r.stdout.trim(), 'IMPORT-OK');
  const r2 = spawnSync(process.execPath, [TOOL_PATH, '--subject', 'stats', '--dry-run', '--data-dir', mkSandbox()], { cwd: ROOT, stdio: ['ignore', 'pipe', 'pipe'], encoding: 'utf8', env: { ...process.env, BANK_CV_NO_CLI: '1' } });
  assert.equal(r2.stdout.trim(), '', 'BANK_CV_NO_CLI=1 时不得执行 CLI');
  assert.equal(SUBJECTS.length, 3);
});