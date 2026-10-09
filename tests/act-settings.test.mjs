import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';

// settings.mjs 无 ESM 导出且构建不剥离 export，不能直接 import。
// 用标记块抽取行动设置纯函数，在隔离上下文求值后做回归（对应 T33）。
// schema 与 H1–H3 对齐：习惯 → habitNormalizeCfg（athena_act_cfg_v1）；专注 → focusSanitizeSettings。
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const src = fs.readFileSync(path.join(root, 'src/settings.mjs'), 'utf8');
const BEGIN = '// ===== BEGIN TESTABLE act settings helpers =====';
const END = '// ===== END TESTABLE act settings helpers =====';
const a = src.indexOf(BEGIN);
const b = src.indexOf(END);
if (a < 0 || b < 0) throw new Error('settings.mjs 缺少 act settings helpers 标记块');
const block = src.slice(a + BEGIN.length, b);
const sandbox = {};
vm.runInNewContext(
  block + '\nthis.actDefaultHabitCfg = actDefaultHabitCfg;\nthis.actDefaultFocusSettings = actDefaultFocusSettings;\nthis.actSanitizeHabitCfg = actSanitizeHabitCfg;\nthis.actSanitizeFocusSettings = actSanitizeFocusSettings;\nthis.actSanitizeSettings = actSanitizeSettings;\nthis.ACT_SETTINGS_CFG_KEY = ACT_SETTINGS_CFG_KEY;\nthis.actFocusLevelOrder = actFocusLevelOrder;\nthis.actIsFocusLevelKey = actIsFocusLevelKey;\nthis.actDefaultLevelNames = actDefaultLevelNames;',
  sandbox
);
const clone = (o) => JSON.parse(JSON.stringify(o));
const actDefaultHabitCfg = () => clone(sandbox.actDefaultHabitCfg());
const actDefaultFocusSettings = () => {
  const s = clone(sandbox.actDefaultFocusSettings());
  s.unitDurations = Array.from(s.unitDurations);
  return s;
};
const actSanitizeHabitCfg = (r) => clone(sandbox.actSanitizeHabitCfg(r));
const actSanitizeFocusSettings = (r) => {
  const s = clone(sandbox.actSanitizeFocusSettings(r));
  s.unitDurations = Array.from(s.unitDurations);
  return s;
};
const actSanitizeSettings = (r) => {
  const s = sandbox.actSanitizeSettings(r);
  return {
    habit: clone(s.habit),
    focus: actSanitizeFocusSettings(s.focus)
  };
};

test('ACT_SETTINGS_CFG_KEY 与 habit.mjs 同键', () => {
  assert.equal(sandbox.ACT_SETTINGS_CFG_KEY, 'athena_act_cfg_v1');
});

test('actDefaultHabitCfg：H4 习惯默认值', () => {
  const d = actDefaultHabitCfg();
  assert.equal(d.dailyAddLimit, 1);
  assert.equal(d.manualLevelPerDay, 1);
  assert.equal(d.manualLevelKeepRatio, 0.5);
  assert.equal(d.failInternalizePenalty, 15);
  assert.equal(d.autoSettle, true);
});

test('actDefaultFocusSettings：H4 专注/结构默认值（对齐 focusDefaultSettings）', () => {
  const d = actDefaultFocusSettings();
  assert.equal(d.unitMinutes, 25);
  assert.deepEqual(d.unitDurations, [25, 50, 60]);
  assert.equal(d.reserveWindowMin, 15);
  assert.equal(d.scoutMinutes, 5);
  assert.equal(d.planDueRemindDays, 3);
  assert.equal(d.structure, 'free');
  assert.equal(d.flavor, false);
  assert.equal(d.typeNames.focus, '专注');
  assert.equal(d.typeNames.scout, '侦查');
  assert.equal(d.levelNames.unit, '任务单元');
  assert.equal(d.levelNames.army, '任务集团');
});

test('actSanitizeHabitCfg：空/非法回默认，数值夹取', () => {
  assert.deepEqual(actSanitizeHabitCfg(null), actDefaultHabitCfg());
  assert.equal(actSanitizeHabitCfg({ dailyAddLimit: 'abc' }).dailyAddLimit, 1);
  const s = actSanitizeHabitCfg({
    dailyAddLimit: 999,
    manualLevelPerDay: -3,
    manualLevelKeepRatio: 2,
    failInternalizePenalty: -5,
    autoSettle: 0
  });
  assert.equal(s.dailyAddLimit, 99);
  assert.equal(s.manualLevelPerDay, 0);
  assert.equal(s.manualLevelKeepRatio, 1);
  assert.equal(s.failInternalizePenalty, 0);
  assert.equal(s.autoSettle, false);
});

test('actSanitizeFocusSettings：结构/风味/名称可编辑且非法回退', () => {
  const s = actSanitizeFocusSettings({
    structure: 'triad',
    flavor: true,
    levelNames: { unit: '单元', group: '组', corps: '', army: '集团' },
    typeNames: { focus: '专注', assault: '突击战', life: '生活', plan: '计划', scout: '' }
  });
  assert.equal(s.structure, 'triad');
  assert.equal(s.flavor, true);
  assert.equal(s.levelNames.unit, '单元');
  assert.equal(s.levelNames.group, '组');
  assert.equal(s.levelNames.corps, '任务群');
  assert.equal(s.levelNames.army, '集团');
  assert.equal(s.typeNames.assault, '突击战');
  assert.equal(s.typeNames.scout, '侦查');
  assert.equal(actSanitizeFocusSettings({ structure: 'nope' }).structure, 'free');
});

test('actSanitizeFocusSettings：单元时长去重保序', () => {
  const s = actSanitizeFocusSettings({ unitDurations: [50, 50, 25], unitMinutes: 50 });
  assert.deepEqual(s.unitDurations, [50, 25]);
  assert.equal(s.unitMinutes, 50);
  const empty = actSanitizeFocusSettings({ unitDurations: [] });
  assert.deepEqual(empty.unitDurations, [25, 50, 60]);
});

test('actSanitizeSettings：合并视图 habit+focus', () => {
  const m = actSanitizeSettings({
    habit: { dailyAddLimit: 3 },
    focus: { unitMinutes: 60, flavor: true }
  });
  assert.equal(m.habit.dailyAddLimit, 3);
  assert.equal(m.habit.manualLevelKeepRatio, 0.5);
  assert.equal(m.focus.unitMinutes, 60);
  assert.equal(m.focus.flavor, true);
  assert.equal(m.focus.reserveWindowMin, 15);
});

// ---- 层次键严格类型（严格四级：unit/group/corps/army，单一顺序来源）----

test('actFocusLevelOrder：严格四级顺序，且与默认层次名一一对应', () => {
  const order = Array.from(sandbox.actFocusLevelOrder());
  assert.deepEqual(order, ['unit', 'group', 'corps', 'army']);
  const names = sandbox.actDefaultLevelNames();
  assert.deepEqual(Object.keys(names), ['unit', 'group', 'corps', 'army']);
  assert.equal(names.unit, '任务单元');
  assert.equal(names.group, '任务组');
  assert.equal(names.corps, '任务群');
  assert.equal(names.army, '任务集团');
  assert.deepEqual(clone(names), actDefaultFocusSettings().levelNames);
});

test('actIsFocusLevelKey：合法四级键 true，未知/别名/空 false', () => {
  ['unit', 'group', 'corps', 'army'].forEach((k) => {
    assert.equal(sandbox.actIsFocusLevelKey(k), true);
  });
  ['', 'UNIT', 'squad', 'team', 'task', 'level', '__proto__'].forEach((k) => {
    assert.equal(sandbox.actIsFocusLevelKey(k), false);
  });
});

test('actSanitizeFocusSettings：未知层次键被丢弃，合法键保留', () => {
  const s = actSanitizeFocusSettings({
    levelNames: { unit: '单元', squad: '小队', team: '战队', corps: '群', army: '集团', bogus: '???' }
  });
  assert.deepEqual(Object.keys(s.levelNames), ['unit', 'group', 'corps', 'army']);
  assert.equal(s.levelNames.unit, '单元');
  assert.equal(s.levelNames.corps, '群');
  assert.equal(s.levelNames.army, '集团');
  assert.equal(s.levelNames.squad, undefined);
  assert.equal(s.levelNames.bogus, undefined);
  // 全空 → 回默认
  assert.deepEqual(actSanitizeFocusSettings({ levelNames: {} }).levelNames, actDefaultFocusSettings().levelNames);
});
