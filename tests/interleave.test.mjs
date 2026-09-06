import test from 'node:test';
import assert from 'node:assert/strict';
import { DISCRIM_TAGS, buildClusters, interleaveRelated } from '../src/interleave.mjs';

test('辨析标签只包含 对比/类比（同类/相关不参与聚类）', () => {
  assert.deepEqual(DISCRIM_TAGS, { '对比': 1, '类比': 1 });
});

test('buildClusters 把 对比/类比 相关的卡聚成同簇，同类/相关不聚类', () => {
  const ids = ['a', 'b', 'c', 'd', 'e', 'f'];
  const rel = {
    a: [{ to: 'b', tag: '对比' }],
    b: [{ to: 'c', tag: '类比' }],   // a-b-c 连成一片
    d: [{ to: 'e', tag: '同类' }],   // 同类（同章变体）不参与聚类
    e: [{ to: 'f', tag: '相关' }]    // 相关不参与聚类
  };
  const clusters = buildClusters(ids, rel);
  const clusterOfA = clusters.find((cl) => cl.indexOf('a') !== -1);
  assert.ok(clusterOfA, 'a 应在某个簇中');
  assert.deepEqual(clusterOfA.slice().sort(), ['a', 'b', 'c']);
  // d、e、f 都应各自成簇（同类/相关都不聚类）
  const clusterOfD = clusters.find((cl) => cl.indexOf('d') !== -1);
  const clusterOfE = clusters.find((cl) => cl.indexOf('e') !== -1);
  const clusterOfF = clusters.find((cl) => cl.indexOf('f') !== -1);
  assert.notEqual(clusterOfD, clusterOfE);
  assert.notEqual(clusterOfE, clusterOfF);
});

test('interleaveRelated 输出是输入的排列，且 对比/类比 同簇卡片相邻出现', () => {
  const ids = ['a', 'b', 'c', 'd', 'e', 'f'];
  const rel = {
    a: [{ to: 'b', tag: '对比' }],
    c: [{ to: 'f', tag: '类比' }]
  };
  const catOf = function (id) { return ({ a: 'X', b: 'X', c: 'Y', d: 'Y', e: 'Z', f: 'Y' })[id]; };
  const out = interleaveRelated(ids, rel, catOf);
  assert.deepEqual(out.slice().sort(), ids.slice().sort());
  assert.equal(Math.abs(out.indexOf('a') - out.indexOf('b')), 1);
  assert.equal(Math.abs(out.indexOf('c') - out.indexOf('f')), 1);
});

test('interleaveRelated 空输入与无辨析关系时安全', () => {
  assert.deepEqual(interleaveRelated([], {}, () => '?'), []);
  const ids = ['a', 'b', 'c'];
  const out = interleaveRelated(ids, {}, () => '?');
  assert.deepEqual(out.slice().sort(), ids.slice().sort());
});
