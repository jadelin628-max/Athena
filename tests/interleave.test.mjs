import test from 'node:test';
import assert from 'node:assert/strict';
import { DISCRIM_TAGS, buildClusters, interleaveRelated } from '../src/interleave.mjs';

test('辨析标签只包含 对比/类比/同类', () => {
  assert.deepEqual(DISCRIM_TAGS, { '对比': 1, '类比': 1, '同类': 1 });
});

test('buildClusters 把辨析相关的卡聚成同簇、其余各自成簇', () => {
  const ids = ['a', 'b', 'c', 'd', 'e'];
  const rel = {
    a: [{ to: 'b', tag: '对比' }],
    b: [{ to: 'c', tag: '类比' }],   // a-b-c 连成一片
    d: [{ to: 'e', tag: '相关' }]    // 「相关」不参与辨析聚类
  };
  const clusters = buildClusters(ids, rel);
  const clusterOfA = clusters.find((cl) => cl.indexOf('a') !== -1);
  assert.ok(clusterOfA, 'a 应在某个簇中');
  assert.deepEqual(clusterOfA.slice().sort(), ['a', 'b', 'c']);
  const clusterOfD = clusters.find((cl) => cl.indexOf('d') !== -1);
  const clusterOfE = clusters.find((cl) => cl.indexOf('e') !== -1);
  assert.notEqual(clusterOfD, clusterOfE, '「相关」不应把 d、e 聚到一起');
});

test('interleaveRelated 输出是输入的排列，且同簇卡片相邻出现', () => {
  const ids = ['a', 'b', 'c', 'd', 'e', 'f'];
  const rel = {
    a: [{ to: 'b', tag: '对比' }],
    c: [{ to: 'f', tag: '同类' }]
  };
  const catOf = function (id) { return ({ a: 'X', b: 'X', c: 'Y', d: 'Y', e: 'Z', f: 'Y' })[id]; };
  const out = interleaveRelated(ids, rel, catOf);
  // 1) 排列：元素不重不漏
  assert.deepEqual(out.slice().sort(), ids.slice().sort());
  // 2) 同簇相邻：a-b 相邻、c-f 相邻（相关卡较近出现）
  assert.equal(Math.abs(out.indexOf('a') - out.indexOf('b')), 1);
  assert.equal(Math.abs(out.indexOf('c') - out.indexOf('f')), 1);
});

test('interleaveRelated 空输入与无辨析关系时安全', () => {
  assert.deepEqual(interleaveRelated([], {}, () => '?'), []);
  const ids = ['a', 'b', 'c'];
  const out = interleaveRelated(ids, {}, () => '?');
  assert.deepEqual(out.slice().sort(), ids.slice().sort());
});
