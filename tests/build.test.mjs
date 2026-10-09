// tests/build.test.mjs —— 构建接线回归守卫
//
// v2.1.0 事故：store.mjs 新增了 TESTABLE 导出块，但 tools/build.mjs 的 STRIP 没登记，
// 于是产物 app.js 残留顶层 `export { … }`，浏览器直接 SyntaxError、首屏 0 个子节点。
// 这个文件守住三件事：
//   ① 新模块必须登记 ORDER（否则永远进不了 app.js）
//   ② 含顶层 export/import 的模块必须登记 STRIP（否则产物不可解析）
//   ③ 拼接产物必须能被 node:vm 解析——这是浏览器能否加载的近似代理
// 顺带锁住 tools/build.mjs 的 CLI 行为与「导入零副作用」（导入即写盘会让测试污染仓库）。
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import vm from 'node:vm';
import { spawnSync } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const BUILD = path.join(ROOT, 'tools', 'build.mjs');
const BUILD_URL = pathToFileURL(BUILD).href;
const SRC = path.join(ROOT, 'src');
const OUT = path.join(ROOT, 'app.js');

let cached = null;
async function loadBuild() {
  if (!cached) cached = await import(BUILD_URL);
  return cached;
}

// 独立于被测实现的朴素扫描：不依赖 tools/build.mjs 的 topLevelEsmLines，
// 守卫不能拿「被守护的代码」当尺子。
function naiveTopLevelEsm(text) {
  return text
    .replace(/\r\n/g, '\n')
    .split('\n')
    .map((line, i) => ({ line: i + 1, text: line }))
    .filter((row) => /^\s*(export|import)\b/.test(row.text));
}

function srcFiles() {
  return fs.readdirSync(SRC).filter((f) => f.endsWith('.mjs'));
}

test('导入 tools/build.mjs 零副作用：不改写 app.js，也不打印构建日志', async () => {
  const before = fs.existsSync(OUT) ? fs.readFileSync(OUT, 'utf8') : null;
  const beforeStat = fs.existsSync(OUT) ? fs.statSync(OUT).mtimeMs : null;
  const chunks = [];
  const origWrite = process.stdout.write.bind(process.stdout);
  process.stdout.write = (chunk) => {
    chunks.push(String(chunk));
    return true;
  };
  try {
    // 带查询串绕过模块缓存，强制真正执行一次模块体
    await import(BUILD_URL + '?side-effect-probe=' + Date.now());
  } finally {
    process.stdout.write = origWrite;
  }
  const after = fs.existsSync(OUT) ? fs.readFileSync(OUT, 'utf8') : null;
  assert.equal(after, before, 'import tools/build.mjs 不应改写 app.js');
  if (beforeStat !== null) assert.equal(fs.statSync(OUT).mtimeMs, beforeStat, 'import 不应触碰 app.js');
  const noise = chunks.filter((c) => /built\s|与 src\/ 同步|不同步/.test(c));
  assert.deepEqual(noise, [], 'import 不应打印构建日志（CLI 只在直接运行时跑）');
});

test('tools/build.mjs 导出可测接口：ORDER 为数组、STRIP 为 Set', async () => {
  const build = await loadBuild();
  assert.ok(Array.isArray(build.ORDER), 'ORDER 应为数组');
  assert.ok(build.STRIP instanceof Set, 'STRIP 应为 Set');
  assert.equal(typeof build.buildProduct, 'function');
  assert.equal(typeof build.runCli, 'function');
});

test('ORDER 登记完整：src/ 下每个模块都在拼接顺序里（新增模块漏登记即失败）', async () => {
  const build = await loadBuild();
  const missing = srcFiles().filter((f) => !build.ORDER.includes(f));
  assert.deepEqual(
    missing,
    [],
    'src/ 下这些模块没登记进 tools/build.mjs 的 ORDER，永远不会进 app.js：' + missing.join(', ')
  );
  assert.deepEqual(
    build.ORDER.filter((rel) => !fs.existsSync(path.join(SRC, rel))),
    [],
    'ORDER 里有 src/ 下不存在的模块（拼写错误）'
  );
  assert.equal(new Set(build.ORDER).size, build.ORDER.length, 'ORDER 里出现重复条目');
});

test('src/bank.mjs 在 ORDER 中，且紧跟在 quiz.mjs 之后（题库在二级导航里紧邻自测）', async () => {
  const build = await loadBuild();
  assert.ok(build.ORDER.includes('bank.mjs'), 'ORDER 必须纳入 bank.mjs');
  assert.equal(
    build.ORDER.indexOf('bank.mjs'),
    build.ORDER.indexOf('quiz.mjs') + 1,
    'bank.mjs 应紧跟在 quiz.mjs 之后'
  );
});

test('漏登记 STRIP 即失败：含顶层 export/import 的模块必须在 STRIP 里', async () => {
  const build = await loadBuild();
  const offenders = [];
  for (const rel of build.ORDER) {
    const text = fs.readFileSync(path.join(SRC, rel), 'utf8');
    if (naiveTopLevelEsm(text).length && !build.STRIP.has(rel)) offenders.push(rel);
  }
  assert.deepEqual(
    offenders,
    [],
    '这些模块含顶层 export/import 却不在 STRIP 里——产物会 SyntaxError、整站白屏：' + offenders.join(', ')
  );
});

test('STRIP 名单有效：登记剥离的模块剥完确实没有顶层 ESM 语句', async () => {
  const build = await loadBuild();
  const stillDirty = [];
  for (const rel of build.STRIP) {
    if (!fs.existsSync(path.join(SRC, rel))) continue; // 模块被删掉不算错
    const stripped = build.stripExports(fs.readFileSync(path.join(SRC, rel), 'utf8'));
    if (naiveTopLevelEsm(stripped).length) stillDirty.push(rel);
  }
  assert.deepEqual(stillDirty, [], 'stripExports 没能剥离干净：' + stillDirty.join(', '));
});

test('拼接产物零顶层 ESM 语句，且能通过 node:vm 解析（浏览器可加载的近似代理）', async () => {
  const build = await loadBuild();
  const product = build.buildProduct();
  assert.equal(naiveTopLevelEsm(product).length, 0, '产物里残留顶层 export/import');
  assert.ok(!/^\s*export\s*\{/m.test(product), '产物里残留导出块');
  assert.equal(typeof vm.Script, 'function');
  assert.doesNotThrow(() => new vm.Script(product), '产物无法被解析（浏览器同样会白屏）');
  assert.ok(product.includes('function renderBank('), '产物应包含 bank.mjs 的 renderBank');
  assert.ok(product.includes('function bankStars('), '产物应包含 bank.mjs 的 bankStars');
  assert.ok(product.startsWith(build.BANNER), '产物应以自动生成的 banner 开头');
});

test('CLI 无参数：写出 app.js 并打印 built 行（在临时根目录里跑真实 CLI）', async () => {
  const build = await loadBuild();
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'athena-build-'));
  try {
    fs.mkdirSync(path.join(tmp, 'src'), { recursive: true });
    fs.mkdirSync(path.join(tmp, 'tools'), { recursive: true });
    for (const f of srcFiles()) fs.copyFileSync(path.join(SRC, f), path.join(tmp, 'src', f));
    fs.copyFileSync(BUILD, path.join(tmp, 'tools', 'build.mjs'));
    const cli = path.join(tmp, 'tools', 'build.mjs');

    const built = spawnSync(process.execPath, [cli], { cwd: tmp, encoding: 'utf8' });
    assert.equal(built.status, 0, built.stderr);
    assert.match(built.stdout.trim(), /^built app\.js from /, '应打印 built 行');
    const appJs = path.join(tmp, 'app.js');
    assert.ok(fs.existsSync(appJs), '无参数应写出 app.js');
    assert.equal(fs.readFileSync(appJs, 'utf8'), build.buildProduct(), '产物内容应与库函数一致');

    // 行尾容错：CRLF 检出的工作区不应让 --check 假报不一致
    fs.writeFileSync(appJs, build.buildProduct().replace(/\n/g, '\r\n'), 'utf8');
    const crlfCheck = spawnSync(process.execPath, [cli, '--check'], { cwd: tmp, encoding: 'utf8' });
    assert.equal(crlfCheck.status, 0, crlfCheck.stderr);
    assert.match(crlfCheck.stdout, /与 src\/ 同步/);

    // 漂移：只报错、exit 1，绝不写盘
    const drifted = fs.readFileSync(appJs, 'utf8') + '\n// drift\n';
    fs.writeFileSync(appJs, drifted, 'utf8');
    const bad = spawnSync(process.execPath, [cli, '--check'], { cwd: tmp, encoding: 'utf8' });
    assert.equal(bad.status, 1, '不一致时 --check 应 exit 1');
    assert.match(bad.stderr, /不同步/, '应提示与 src/ 不同步');
    assert.equal(fs.readFileSync(appJs, 'utf8'), drifted, '--check 不应写盘');
  } finally {
    fs.rmSync(tmp, { recursive: true, force: true });
  }
});

test('派发链自洽：renderApp 里派发的每个 renderXxx() 都必须能在产物里找到实现', async () => {
  const build = await loadBuild();
  const product = build.buildProduct();
  const browse = fs.readFileSync(path.join(SRC, 'browse.mjs'), 'utf8');
  const names = new Set();
  for (const line of browse.split('\n')) {
    if (!/^\s*(if|else if)\s*\(\s*currentView ===/.test(line)) continue;
    for (const m of line.matchAll(/(render[A-Za-z0-9_]+)\(\)/g)) names.add(m[1]);
  }
  assert.ok(names.size >= 8, '派发链解析异常：只抽到 ' + names.size + ' 个渲染器');
  const missing = [...names].filter((n) => !product.includes('function ' + n + '('));
  assert.deepEqual(
    missing,
    [],
    '这些视图渲染器被 renderApp 派发、却不在拼接产物里（对应模块漏登记 ORDER，点进去就是 ReferenceError）：' + missing.join(', ')
  );
});

test('视图派发与题库动作分支真实存在（排除「注释里也有这段文字」的假绿）', async () => {
  const build = await loadBuild();
  const browse = fs.readFileSync(path.join(SRC, 'browse.mjs'), 'utf8');
  const actions = fs.readFileSync(path.join(SRC, 'actions.mjs'), 'utf8');

  // 只看真正的分支行，不看注释：t4 的契约测试用 indexOf 判「是否接线」，注释也能骗过它
  const dispatch = browse
    .split('\n')
    .filter((l) => /^\s*(if|else if)\s*\(\s*currentView ===/.test(l));
  const bankLine = dispatch.find((l) => /currentView === 'bank'/.test(l));
  assert.ok(bankLine, 'renderApp 派发链缺少 bank 分支');
  assert.match(bankLine, /renderBank\(\)/, 'bank 分支必须真的调用 renderBank()');

  for (const act of ['bankFilter', 'bankOpen', 'bankAddWrong', 'bankStep', 'bankBack', 'bankReset']) {
    assert.match(actions, new RegExp("^\\s*case '" + act + "':", 'm'), 'handleAction 缺少 ' + act + ' 分支');
  }
  assert.match(
    actions,
    /arg === 'bank'\)[^;\n]*currentModule = 'cards';/,
    "handleAction 的 nav 分支应把 arg='bank' 映到 currentModule='cards'"
  );
  assert.ok(build.STRIP.has('bank.mjs') && build.STRIP.has('store.mjs'), 'bank.mjs 与 store.mjs 都必须在 STRIP 里');
});

test('runCli 可注入 IO：--check 路径不写盘、缺失文件按退出码 1 报错', async () => {
  const build = await loadBuild();
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'athena-build-io-'));
  try {
    const missing = path.join(tmp, 'not-built-yet.js');
    const errs = [];
    let code = null;
    const res = build.runCli(['--check'], {
      outFile: missing,
      log() {},
      error(...args) {
        errs.push(args.join(' '));
      },
      exit(c) {
        code = c;
      }
    });
    assert.equal(code, 1, '缺失产物时 --check 应请求 exit 1');
    assert.equal(res.exitCode, 1);
    assert.equal(res.wrote, false);
    assert.match(errs.join('\n'), /不同步/);
    assert.equal(fs.existsSync(missing), false, '--check 不应创建产物文件');

    const okFile = path.join(tmp, 'in-sync.js');
    fs.writeFileSync(okFile, build.buildProduct(), 'utf8');
    const logs = [];
    let code2 = null;
    const res2 = build.runCli(['--check'], {
      outFile: okFile,
      log(...args) {
        logs.push(args.join(' '));
      },
      error(...args) {
        logs.push('ERR ' + args.join(' '));
      },
      exit(c) {
        code2 = c;
      }
    });
    assert.equal(code2, null, '一致时不应请求退出');
    assert.equal(res2.exitCode, 0);
    assert.match(logs.join('\n'), /与 src\/ 同步/);
  } finally {
    fs.rmSync(tmp, { recursive: true, force: true });
  }
});