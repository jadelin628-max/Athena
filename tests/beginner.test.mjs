import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';

// store.mjs 无 ESM 导出且构建不剥离 export，不能直接 import。
// 用标记块抽取初学者纯函数，在隔离上下文求值后做回归（对应 T12）。
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const src = fs.readFileSync(path.join(root, 'src/store.mjs'), 'utf8');
const BEGIN = '// ===== BEGIN TESTABLE beginner helpers =====';
const END = '// ===== END TESTABLE beginner helpers =====';
const a = src.indexOf(BEGIN);
const b = src.indexOf(END);
if (a < 0 || b < 0) throw new Error('store.mjs 缺少 beginner helpers 标记块');
const block = src.slice(a + BEGIN.length, b);
const sandbox = {};
vm.runInNewContext(block + '\nthis.beginnerCatKeys = beginnerCatKeys;\nthis.beginnerRecCats = beginnerRecCats;\nthis.resolveBeginner = resolveBeginner;', sandbox);
// vm 沙箱数组与本 realm 原型不同，deepStrictEqual 会拒；统一拷回本 realm
const norm = (arr) => Array.from(arr || []);
const beginnerCatKeys = (s) => norm(sandbox.beginnerCatKeys(s));
const beginnerRecCats = (s) => norm(sandbox.beginnerRecCats(s));
const resolveBeginner = (beg, subj, sid) => {
  const r = sandbox.resolveBeginner(beg, subj, sid);
  return { on: !!r.on, cats: norm(r.cats) };
};

// 两个假学科：B 复用部分 catKey（模拟切科后键重叠），用于验证 sid 跨科残留
const subjA = {
  id: 'a',
  CATS: { intro: '导言', types: '类型', flow: '控制流', fn: '函数' },
  ORDER: ['intro', 'types', 'flow', 'fn'],
  BEGINNER: ['intro', 'types']
};
const subjB = {
  id: 'b',
  CATS: { intro: '入门', base: '基础', adv: '进阶' },
  ORDER: ['intro', 'base', 'adv'],
  BEGINNER: ['intro', 'base']
};
const subjNoBeg = {
  id: 'nb',
  CATS: { c1: '一', c2: '二', c3: '三' },
  ORDER: ['c1', 'c2', 'c3']
  // 无 BEGINNER
};

test('beginnerCatKeys / beginnerRecCats：有 BEGINNER 用推荐路径，无则回退 ORDER 前两章', () => {
  assert.deepEqual(beginnerCatKeys(subjA), ['intro', 'types', 'flow', 'fn']);
  assert.deepEqual(beginnerRecCats(subjA), ['intro', 'types']);
  assert.deepEqual(beginnerRecCats(subjNoBeg), ['c1', 'c2']);
  assert.deepEqual(beginnerRecCats(null), []);
});

test('resolveBeginner：合法 cats 原样保留（on 只看开关）', () => {
  const r = resolveBeginner({ on: true, cats: ['flow', 'fn'], sid: 'a' }, subjA, 'a');
  assert.equal(r.on, true);
  assert.deepEqual(r.cats, ['flow', 'fn']);
  const off = resolveBeginner({ on: false, cats: ['flow'], sid: 'a' }, subjA, 'a');
  assert.equal(off.on, false);
  assert.deepEqual(off.cats, ['flow']);
});

test('resolveBeginner：教材化改键后的过期 cat 自愈到推荐起步章（不再全挡）', () => {
  // 模拟整科重置后 CATS 键已变，旧 cats 全部失效
  const r = resolveBeginner({ on: true, cats: ['old1', 'old2'], sid: 'a' }, subjA, 'a');
  assert.equal(r.on, true);
  assert.deepEqual(r.cats, ['intro', 'types']);
});

test('resolveBeginner：部分过期时只保留仍合法的键（不因脏数据清空用户勾选）', () => {
  const r = resolveBeginner({ on: true, cats: ['old', 'flow', 'fn'], sid: 'a' }, subjA, 'a');
  assert.deepEqual(r.cats, ['flow', 'fn']);
});

test('resolveBeginner：跨科残留（sid 不匹配）整段丢弃，回退当前科推荐——切科后不再错乱', () => {
  // A 科的 cats（含与 B 重叠的 intro）+ sid=a，用在 B 科
  const r = resolveBeginner({ on: true, cats: ['types', 'flow', 'intro'], sid: 'a' }, subjB, 'b');
  assert.equal(r.on, true);
  assert.deepEqual(r.cats, ['intro', 'base']); // 不能沿用 A 的 types/flow，也不该只留下重叠的 intro
});

test('resolveBeginner：无 sid 的旧数据仍按 catKey 合法性过滤（兼容升级前存档）', () => {
  const r = resolveBeginner({ on: true, cats: ['intro', 'ghost'] }, subjA, 'a');
  assert.deepEqual(r.cats, ['intro']);
});

test('resolveBeginner：cats 空/缺失/非数组 → 自愈推荐章；on=true 时不再因空 cats 变成「全放」', () => {
  assert.deepEqual(resolveBeginner({ on: true, cats: [] }, subjA, 'a').cats, ['intro', 'types']);
  assert.deepEqual(resolveBeginner({ on: true, cats: null }, subjA, 'a').cats, ['intro', 'types']);
  assert.deepEqual(resolveBeginner({ on: true }, subjA, 'a').cats, ['intro', 'types']);
  assert.deepEqual(resolveBeginner(null, subjA, 'a').cats, ['intro', 'types']);
  // 无 BEGINNER 的科回退 ORDER 前两章，开关仍可用
  const r = resolveBeginner({ on: true, cats: ['gone'] }, subjNoBeg, 'nb');
  assert.equal(r.on, true);
  assert.deepEqual(r.cats, ['c1', 'c2']);
});

test('resolveBeginner：无章节的空科不制造假章节', () => {
  const r = resolveBeginner({ on: true, cats: ['x'] }, { id: 'e', CATS: {}, ORDER: [] }, 'e');
  assert.deepEqual(r.cats, []);
});
