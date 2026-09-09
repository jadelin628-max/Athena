import test from 'node:test';
import assert from 'node:assert/strict';

// sync.mjs 顶层只声明常量与函数（localStorage/fetch 等浏览器全局仅在函数体内使用），
// Node 24 自带 btoa/atob/TextEncoder/TextDecoder，注入 localStorage 后即可安全导入。
globalThis.localStorage = { getItem: () => null, setItem: () => {}, removeItem: () => {} };
const { b64encodeUtf8, b64decodeUtf8, decideSyncAction } = await import('../src/sync.mjs');

test('b64 UTF-8 往返：中文 / LaTeX 公式 / emoji / 多行', () => {
  const cases = [
    '中文与 English 混排',
    'R(t,S) = (1 + F·t/S)^{-0.1542}，$\\frac{a}{b}$',
    '🎉 emoji 与换行\n第二行\t制表符',
    ''
  ];
  for (const s of cases) assert.equal(b64decodeUtf8(b64encodeUtf8(s)), s);
});

test('LWW 决策：云无→推，本地缺→拉（归档保底），新者胜，容差内跳过', () => {
  assert.equal(decideSyncAction(0, 5000), 'pull');    // 本地无时间戳（旧数据）
  assert.equal(decideSyncAction(5000, 0), 'push');    // 云端还没有
  assert.equal(decideSyncAction(1000, 5000), 'pull'); // 云端新 4s
  assert.equal(decideSyncAction(5000, 1000), 'push'); // 本地新 4s
  assert.equal(decideSyncAction(5000, 6000), 'skip'); // 差 1s（容差内）
  assert.equal(decideSyncAction(5000, 5000), 'skip'); // 一致
  assert.equal(decideSyncAction(0, 0), 'skip');       // 两边都没有
});
