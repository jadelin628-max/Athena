// tests/map.test.mjs —— 知识库「功能入口」清单的取值护栏（t22）
//
// 背景：src/map.mjs 的 KB_ENTRIES[].features[].nav 由原理库渲染时直接派发
// handleAction('nav', <nav>)（等价于二级导航项），但 map.mjs 此前没有任何测试，
// nav 取值是否可派发全靠人肉比对——9 个现存取值恰好都能落到渲染分支属巧合。
// 本文件从源码文本提取取值与派发集合，改名/删值/写错值（死链）都会先在这里判红。
//
// 注意：src/*.mjs 是「片段式」源码（浏览器里拼进同一 IIFE），map.mjs 末尾停在
// KB_ENTRIES 数组中间，不能整体 import；与 tests/wrong.test.mjs / tests/bank.test.mjs
// 同款，按文本切片 + 正则校验。
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
// 默认读仓库 src/map.mjs；反证脚本可把 ATHENA_MAP_FILE / ATHENA_ACTIONS_FILE 指向临时副本
// （与 tools/check_data.mjs 的 ATHENA_DATA_DIR 同一套路：反证只动副本，不改工作区文件）。
const MAP_FILE = process.env.ATHENA_MAP_FILE
  ? path.resolve(process.env.ATHENA_MAP_FILE)
  : path.join(ROOT, 'src', 'map.mjs');
const ACTIONS_FILE = process.env.ATHENA_ACTIONS_FILE
  ? path.resolve(process.env.ATHENA_ACTIONS_FILE)
  : path.join(ROOT, 'src', 'actions.mjs');
const RENDER_FILE = path.join(ROOT, 'src', 'browse.mjs');

const MAP_SRC = readFileSync(MAP_FILE, 'utf8');
const ACTIONS_SRC = readFileSync(ACTIONS_FILE, 'utf8');
const RENDER_SRC = readFileSync(RENDER_FILE, 'utf8');

// 切片：case 'xxx': … 到该分支的第一个 break;
function caseBody(src, name) {
  const m = src.match(new RegExp("case '" + name + "':([\\s\\S]*?)\\n\\s*break;"));
  assert.ok(m, "src/actions.mjs 应存在 case '" + name + "': … break; 分支");
  return m[1];
}
const NAV_CASE = caseBody(ACTIONS_SRC, 'nav');
const MODULE_CASE = caseBody(ACTIONS_SRC, 'module');

// 分支里显式比较过的 arg 取值（`arg === 'x'`）
function argValues(body) {
  const set = new Set();
  const re = /arg\s*===\s*'([^']+)'/g;
  let m;
  while ((m = re.exec(body)) !== null) set.add(m[1]);
  return set;
}
const NAV_DISPATCH = argValues(NAV_CASE);       // nav 分支认识的取值（含 wrongQuiz 特例）
const MODULE_DISPATCH = argValues(MODULE_CASE); // 一级模块项取值（含 wrongQuiz → wrong 特例）

// renderApp（src/browse.mjs）的 currentView 渲染分支：nav 值最终要落到某个分支，否则白屏。
function renderViews(src) {
  const set = new Set();
  const re = /currentView\s*===\s*'([^']+)'/g;
  let m;
  while ((m = re.exec(src)) !== null) set.add(m[1]);
  return set;
}
const RENDER_VIEWS = renderViews(RENDER_SRC);

// map 的 features 清单：逐条抽 { label, nav }，并校验「花括号数 == 解析出的条目数」，
// 防止字段顺序变化/字段改名时静默漏检（漏检比误报更危险）。
function featureEntries(src) {
  const out = [];
  const re = /features:\s*\[([\s\S]*?)\]/g;
  let m;
  while ((m = re.exec(src)) !== null) {
    const body = m[1];
    const items = [];
    const itemRe = /label:\s*'([^']*)'\s*,\s*nav:\s*'([^']*)'/g;
    let it;
    while ((it = itemRe.exec(body)) !== null) items.push({ label: it[1], nav: it[2] });
    const braces = (body.match(/\{/g) || []).length;
    assert.equal(
      braces, items.length,
      'features 数组里有 ' + braces + ' 个 {…} 条目，但只解析出 ' + items.length + ' 条 { label, nav }：'
      + '字段顺序/命名可能被改动了，正文：features: [' + body.trim() + ']'
    );
    out.push(...items);
  }
  return out;
}
const ENTRIES = featureEntries(MAP_SRC);
const NAV_VALUES = [...new Set(ENTRIES.map((e) => e.nav))].sort();

// 现状取值快照（改名/新增取值时必须同步本列表——这就是护栏的意义）
const EXPECTED_NAV_VALUES = [
  'actFocus', 'actHabit', 'actHelp', 'actPlan', 'browse',
  'learn', 'quiz', 'statistics', 'wrongBrowse', 'wrongQuiz'
];

test('map 功能入口：每条 features 都有非空 label 与 nav，且没有解析不到的结构', () => {
  assert.ok(ENTRIES.length >= 34, 'features 条目数不应少于 t22 的 34 条，实际 ' + ENTRIES.length);
  for (const e of ENTRIES) {
    assert.ok(e.label && e.label.trim(), 'feature 的 label 必须非空，实际「' + e.label + '」');
    assert.ok(e.nav && e.nav.trim(), 'feature 的 nav 必须非空（' + e.label + '）');
  }
});

test('map 功能入口：nav 取值集合与现状一致（改名/新增必须同步护栏）', () => {
  assert.deepEqual(NAV_VALUES, EXPECTED_NAV_VALUES, 'nav 取值集合变化：' + JSON.stringify(NAV_VALUES));
});

test('map 功能入口：每个 nav 取值都能被 nav/module 分支派发（不产生死链）', () => {
  assert.ok(NAV_DISPATCH.size >= 12, 'nav 分支解析出的取值过少，切片可能失效：' + NAV_DISPATCH.size);
  for (const v of NAV_VALUES) {
    assert.ok(
      NAV_DISPATCH.has(v) || MODULE_DISPATCH.has(v),
      'nav 取值「' + v + '」不在 src/actions.mjs 的 nav/module 派发集合内（会变成死链）；'
      + 'nav 分支认识：' + [...NAV_DISPATCH].sort().join(', ')
      + '；module 分支认识：' + [...MODULE_DISPATCH].sort().join(', ')
    );
  }
});

test('map 功能入口：每个 nav 取值最终能落到 renderApp 的渲染分支（或由 nav 分支改写视图值）', () => {
  for (const v of NAV_VALUES) {
    assert.ok(
      RENDER_VIEWS.has(v) || NAV_DISPATCH.has(v),
      'nav 取值「' + v + '」既不是 renderApp 的 currentView 分支，也没被 nav 分支改写视图值 → 点击会白屏'
    );
  }
});

test('map 功能入口：错题自测（wrongQuiz）已登记，且紧随「错题本」之后（t22 回归护栏）', () => {
  assert.ok(NAV_VALUES.indexOf('wrongQuiz') >= 0, 'nav 取值集合必须含 wrongQuiz（t18 的错题二级入口）');
  const lines = MAP_SRC.split('\n').filter((l) => l.indexOf("nav: 'wrongQuiz'") >= 0);
  assert.equal(lines.length, 2, 'wrongQuiz 应在 features 清单里登记两处（retrieval 与 dunlosky），实际 ' + lines.length);
  for (const l of lines) {
    assert.ok(
      /\{ label: '错题本', nav: 'wrongBrowse' \},\s*\{ label: '错题自测', nav: 'wrongQuiz' \}/.test(l),
      'wrongQuiz 必须追加在「错题本」之后，实际：' + l.trim()
    );
  }
  // 这两条 features 的既有项与顺序逐字不变
  const quizFirst = MAP_SRC.split('\n').filter(
    (l) => /\{ label: '自测', nav: 'quiz' \},\s*\{ label: '错题本', nav: 'wrongBrowse' \}/.test(l)
  );
  assert.equal(quizFirst.length, 2, '「自测, 错题本」两项应各保留在原来的两处 features 里');
});