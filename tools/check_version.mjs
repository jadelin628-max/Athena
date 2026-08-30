#!/usr/bin/env node
/*
 * tools/check_version.mjs —— 版本标记一致性校验
 *
 * 零依赖。本项目版本号分散在多处，改版本时易漏。本脚本把这些标记点读出来对比：
 *   1. app.js  的 VERSION 常量
 *   2. app.js  的 CHANGELOG 最新一条 .v
 *   3. sw.js   的 VERSION（Service Worker 缓存版本，独立命名空间 ms3-vN）
 *   4. index.html 里 ?v= 的缓存戳（manifest / 图标）
 *
 * 规则：
 *   - app.js VERSION 必须等于 CHANGELOG 最新 .v（应用语义版本一致）
 *   - index.html 的所有 ?v= 必须一致（缓存戳内部一致）
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

console.log('=== 版本标记一致性校验 ===\n');
console.log('app.js VERSION :', appVer || '(未找到)');
console.log('CHANGELOG 最新 :', changelogVer || '(未找到)');
console.log('sw.js VERSION  :', swVer || '(未找到)');
console.log('index.html ?v= :', cacheStamps.join(', ') || '(无)');
console.log('');

if (appVer !== changelogVer) err(`app.js VERSION(${appVer}) ≠ CHANGELOG 最新(${changelogVer})`);
if (cacheStamps.length && new Set(cacheStamps).size !== 1) err(`index.html ?v= 不一致: ${cacheStamps.join(', ')}`);

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
