#!/usr/bin/env node
/*
 * tools/check_version.mjs —— 版本标记一致性校验
 *
 * 零依赖。本项目版本号分散在多处，改版本时易漏。本脚本把这些标记点读出来对比：
 *   1. app.js  的 VERSION 常量
 *   2. app.js  的 CHANGELOG 最新一条 .v
 *   3. sw.js   的 VERSION（Service Worker 缓存版本，独立命名空间 ms3-vN）
 *   4. index.html 里 ?v= 的缓存戳（manifest / 图标）
 *   5. package.json 的 version（存在时）
 *   6. src-tauri/tauri.conf.json 的 version（存在时）——桌面版打包元数据
 *   7. dist/app.js 的 VERSION（存在时）——桌面版运行时拷贝，防止打包旧代码
 *
 * 规则：
 *   - app.js VERSION 必须等于 CHANGELOG 最新 .v（应用语义版本一致）
 *   - index.html 的所有 ?v= 必须一致（缓存戳内部一致）
 *   - package.json / tauri.conf.json / dist/app.js 的版本若存在，必须与 app.js VERSION 一致
 *   - sw.js 版本与 index.html ?v= 是「发布时需一起 bump」的提示，不作强相等判定
 *     （因为 sw 缓存版本 ms3-v26 与应用版本 1.4.4 是两个独立体系）
 *
 * 用法：  node tools/check_version.mjs
 * 退出码：0 = 一致；1 = 不一致（改版本时漏了某处）
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

function read(rel) { return fs.readFileSync(path.join(ROOT, rel), 'utf8'); }
function exists(rel) { return fs.existsSync(path.join(ROOT, rel)); }
function readIf(rel) { return exists(rel) ? read(rel) : null; }

const errors = [];
const warns = [];
const err = (m) => errors.push(m);
const warn = (m) => warns.push(m);

// 1 & 2: app.js
const app = read('app.js');
const appVer = (app.match(/const VERSION = '([^']+)'/) || [])[1];
const changelogVer = (app.match(/CHANGELOG = \[\s*\{ v: '([^']+)'/) || [])[1];

// 3: sw.js
const sw = read('sw.js');
const swVer = (sw.match(/const VERSION = '([^']+)'/) || [])[1];

// 4: index.html ?v=
const html = read('index.html');
const cacheStamps = [...html.matchAll(/\?v=(\d+)/g)].map((m) => m[1]);

// 5: package.json
const pkgRaw = readIf('package.json');
const pkgVer = pkgRaw ? (JSON.parse(pkgRaw).version || null) : null;

// 6: src-tauri/tauri.conf.json
const tauriRaw = readIf('src-tauri/tauri.conf.json');
const tauriVer = tauriRaw ? ((JSON.parse(tauriRaw).version) || null) : null;

// 7: dist/app.js（桌面版运行时拷贝；仅在已生成 dist/ 时校验）
const distApp = readIf('dist/app.js');
const distVer = distApp ? (distApp.match(/const VERSION = '([^']+)'/) || [])[1] || null : null;

console.log('=== 版本标记一致性校验 ===\n');
console.log('app.js VERSION :', appVer || '(未找到)');
console.log('CHANGELOG 最新 :', changelogVer || '(未找到)');
console.log('sw.js VERSION  :', swVer || '(未找到)');
console.log('index.html ?v= :', cacheStamps.join(', ') || '(无)');
console.log('package.json   :', pkgVer || '(不存在或未找到)');
console.log('tauri.conf.json:', tauriVer || '(不存在或未找到)');
console.log('dist/app.js    :', distVer || '(dist 未生成，桌面版打包前记得跑 tools/build-tauri.mjs)');
console.log('');

if (appVer !== changelogVer) err(`app.js VERSION(${appVer}) ≠ CHANGELOG 最新(${changelogVer})`);
if (cacheStamps.length && new Set(cacheStamps).size !== 1) err(`index.html ?v= 不一致: ${cacheStamps.join(', ')}`);
if (pkgVer && pkgVer !== appVer) err(`package.json version(${pkgVer}) ≠ app.js VERSION(${appVer})`);
if (tauriRaw && !tauriVer) err('src-tauri/tauri.conf.json 存在但缺少 version 字段');
if (tauriVer && tauriVer !== appVer) err(`tauri.conf.json version(${tauriVer}) ≠ app.js VERSION(${appVer})——桌面版打包元数据过期`);
if (distApp && distVer && distVer !== appVer) err(`dist/app.js VERSION(${distVer}) ≠ app.js VERSION(${appVer})——桌面版运行时是旧代码，请重跑 node tools/build-tauri.mjs`);
if (distApp && !distVer) err('dist/app.js 存在但未找到 VERSION 标记');

// 提示性（不强判）：sw 缓存版本与 index.html ?v= 都应在发布时一起 bump
if (swVer) warn('发布新版本时：sw.js 的 ' + swVer + ' 与 index.html 的 ?v= 缓存戳需一起 bump，否则浏览器可能用旧缓存');

if (errors.length === 0) {
  console.log('✅ 版本标记一致');
  warns.forEach((w) => console.warn('  [提示] ' + w));
  process.exit(0);
} else {
  errors.forEach((e) => console.error('  [ERR] ' + e));
  warns.forEach((w) => console.warn('  [提示] ' + w));
  console.error('\n❌ 版本标记不一致，改版本时漏了某处');
  process.exit(1);
}
