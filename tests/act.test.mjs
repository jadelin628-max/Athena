import test from 'node:test';
import assert from 'node:assert/strict';
import {
  actValidateIf, actValidateThen, actValidateIfThen, actValidateObstacle,
  actFormatIfThen, actSanitize, actDefaultData, actIsThisWeek,
  ACT_IF_HINT, ACT_THEN_HINT, ACT_OBSTACLE_HINT
} from '../src/act.mjs';

test('如果：空文本不合格，提示对齐 ACT §2', () => {
  const r = actValidateIf('');
  assert.equal(r.ok, false);
  assert.equal(r.reason, 'empty');
  assert.ok(r.hint.includes('外部情境') || r.hint.includes(ACT_IF_HINT));
});

test('如果：纯内心状态不合格（「如果我有动力」）', () => {
  const r = actValidateIf('如果我有动力');
  assert.equal(r.ok, false);
  assert.equal(r.hint, ACT_IF_HINT);
});

test('如果：时间/地点/前序行为合格', () => {
  assert.equal(actValidateIf('早上 7 点闹钟响后').ok, true);
  assert.equal(actValidateIf('到图书馆坐下后').ok, true);
  assert.equal(actValidateIf('吃完晚饭收拾完桌子后').ok, true);
});

test('那么：空文本不合格，提示对齐 ACT §2', () => {
  const r = actValidateThen('');
  assert.equal(r.ok, false);
  assert.ok(r.hint.includes('无需再决策') || r.hint.includes(ACT_THEN_HINT));
});

test('那么：模糊动作不合格（「学习一会儿」）', () => {
  const r = actValidateThen('学习一会儿');
  assert.equal(r.ok, false);
  assert.equal(r.hint, ACT_THEN_HINT);
});

test('那么：具体动作合格（「打开 Anki 复习 10 张」）', () => {
  assert.equal(actValidateThen('打开 Anki 复习 10 张').ok, true);
  assert.equal(actValidateThen('写完高数作业第 3 题').ok, true);
});

test('如果-那么组合校验返回双侧结果', () => {
  const r = actValidateIfThen('早上 7 点', '学习一会儿');
  assert.equal(r.if.ok, true);
  assert.equal(r.then.ok, false);
  const ok = actValidateIfThen('睡前关灯前', '背 20 个单词');
  assert.equal(ok.if.ok, true);
  assert.equal(ok.then.ok, true);
});

test('WOOP 障碍：外部困难不合格，内心「因为我……」合格', () => {
  assert.equal(actValidateObstacle('因为没时间').ok, false);
  assert.equal(actValidateObstacle('因为我总是拖延').ok, true);
  assert.equal(actValidateObstacle('').ok, false);
  assert.ok(ACT_OBSTACLE_HINT.includes('内心'));
});

test('actFormatIfThen 拼标准句式', () => {
  assert.equal(actFormatIfThen({ if: '早上 8 点', then: '做 10 个俯卧撑' }), '如果 早上 8 点，那么我将 做 10 个俯卧撑');
});

test('actSanitize 只保留 WOOP 主干：cues 并入、丢弃旧 ifThen/envAudit', () => {
  const d = actSanitize({
    ifThen: [{ id: 'a', if: '晚上 10 点', then: '关掉手机' }],
    woops: [{
      id: 'w1',
      wish: 'w', outcome: 'o', obstacle: '因为我拖延',
      cues: [{ text: '床头手机', cueType: 'place', strategy: 'remove', method: 'digital' }],
      planIf: '晚上', planThen: '写 1 页',
      createdAt: 100
    }, { id: 'bad', wish: 'x' }],
    envAudit: { habit: '刷手机', cues: [{ text: '旧' }] },
    habits: [{ id: 'h1' }]
  });
  assert.deepEqual(Object.keys(d).sort(), ['habits', 'woops']);
  assert.equal(d.woops.length, 1);
  assert.equal(d.woops[0].id, 'w1');
  assert.equal(d.woops[0].cues.length, 1);
  assert.equal(d.woops[0].cues[0].strategy, 'remove');
  assert.equal(d.woops[0].updatedAt, 100); // 缺 updatedAt 回退 createdAt
  assert.equal(d.habits.length, 1);
  const empty = actDefaultData();
  assert.deepEqual(Object.keys(empty).sort(), ['habits', 'woops']);
});

test('actIsThisWeek 覆盖本周/更早/非法日期', () => {
  const today = new Date();
  const fmt = (d) => d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
  assert.equal(actIsThisWeek(fmt(today)), true);
  const old = new Date(today.getTime() - 20 * 86400000);
  assert.equal(actIsThisWeek(fmt(old)), false);
  assert.equal(actIsThisWeek('not-a-date'), false);
  assert.equal(actIsThisWeek(''), false);
});
