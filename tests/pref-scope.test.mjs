import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';

// store.mjs 用标记块抽取偏好作用域纯函数（对应设置界面单科/全局分模块）
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const src = fs.readFileSync(path.join(root, 'src/store.mjs'), 'utf8');
const BEGIN = '// ===== BEGIN TESTABLE pref scope helpers =====';
const END = '// ===== END TESTABLE pref scope helpers =====';
const a = src.indexOf(BEGIN);
const b = src.indexOf(END);
if (a < 0 || b < 0) throw new Error('store.mjs 缺少 pref scope helpers 标记块');
const block = src.slice(a + BEGIN.length, b);
const sandbox = { GOAL_DEFAULT: '考研', TARGET_S_DEFAULT: 90 };
vm.runInNewContext(
  block + '\nthis.prefDefaults = prefDefaults;\nthis.prefSanitizeGlobal = prefSanitizeGlobal;\nthis.prefResolveScope = prefResolveScope;\nthis.prefResolveValue = prefResolveValue;\nthis.PREF_OVERLAP_KEYS = PREF_OVERLAP_KEYS;\nthis.GLOBAL_PREFS_KEY = GLOBAL_PREFS_KEY;',
  sandbox
);
const prefDefaults = () => sandbox.prefDefaults();
const prefSanitizeGlobal = (r) => sandbox.prefSanitizeGlobal(r);
const prefResolveScope = (m, k) => sandbox.prefResolveScope(m, k);
const prefResolveValue = (k, s, g, m) => sandbox.prefResolveValue(k, s, g, m);

test('GLOBAL_PREFS_KEY 与 PREF_OVERLAP_KEYS', () => {
  assert.equal(sandbox.GLOBAL_PREFS_KEY, 'athena_global_prefs_v1');
  assert.deepEqual(Array.from(sandbox.PREF_OVERLAP_KEYS), [
    'goalTitle', 'examDate', 'dailyNew', 'fdr', 'bareRecall', 'targetS', 'targetLinkExam'
  ]);
});

test('prefDefaults：学习偏好默认值', () => {
  const d = prefDefaults();
  assert.equal(d.goalTitle, '考研');
  assert.equal(d.examDate, '');
  assert.equal(d.dailyNew, 10);
  assert.equal(d.fdr, 0.9);
  assert.equal(d.bareRecall, false);
  assert.equal(d.targetS, 90);
  assert.equal(d.targetLinkExam, true);
});

test('prefResolveScope：缺省/非法一律 subject，显式 global 才全局', () => {
  assert.equal(prefResolveScope(null, 'dailyNew'), 'subject');
  assert.equal(prefResolveScope({}, 'dailyNew'), 'subject');
  assert.equal(prefResolveScope({ dailyNew: 'subject' }, 'dailyNew'), 'subject');
  assert.equal(prefResolveScope({ dailyNew: 'global' }, 'dailyNew'), 'global');
  assert.equal(prefResolveScope({ dailyNew: 'xxx' }, 'dailyNew'), 'subject');
});

test('prefResolveValue：global 取全局；subject 取本课，缺失回退全局再默认', () => {
  // global 作用域：忽略本课值
  assert.equal(prefResolveValue('dailyNew', 3, 20, { dailyNew: 'global' }), 20);
  // subject 作用域：用本课值
  assert.equal(prefResolveValue('dailyNew', 3, 20, { dailyNew: 'subject' }), 3);
  // subject 但本课未设：回退全局（新科继承）
  assert.equal(prefResolveValue('dailyNew', null, 20, {}), 20);
  // 两边都空：默认
  assert.equal(prefResolveValue('dailyNew', null, null, {}), 10);
  // global 但全局未设：默认
  assert.equal(prefResolveValue('fdr', 0.95, null, { fdr: 'global' }), 0.9);
});

test('prefSanitizeGlobal：夹取与非法回退', () => {
  assert.equal(prefSanitizeGlobal(null).dailyNew, 10);
  assert.equal(prefSanitizeGlobal({ dailyNew: 999 }).dailyNew, 99);
  assert.equal(prefSanitizeGlobal({ dailyNew: -1 }).dailyNew, 0);
  assert.equal(prefSanitizeGlobal({ fdr: 0.5 }).fdr, 0.9);
  assert.equal(prefSanitizeGlobal({ fdr: 0.95 }).fdr, 0.95);
  assert.equal(prefSanitizeGlobal({ examDate: 'bad' }).examDate, '');
  assert.equal(prefSanitizeGlobal({ examDate: '2026-12-25' }).examDate, '2026-12-25');
  assert.equal(prefSanitizeGlobal({ goalTitle: '  四六级  ' }).goalTitle, '四六级');
  assert.equal(prefSanitizeGlobal({ bareRecall: 1 }).bareRecall, true);
});
