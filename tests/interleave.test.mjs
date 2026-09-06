import test from 'node:test';
import assert from 'node:assert/strict';
import { DISCRIM_TAGS, MAX_CLUSTER, buildClusters, interleaveRelated } from '../src/interleave.mjs';

test('辨析标签只包含 同类/对比/类比', () => {
  assert.deepEqual(DISCRIM_TAGS, { '同类': 1, '对比': 1, '类比': 1 });
});

test('buildClusters 把辨析相关的卡聚成同簇，无关联的各自成簇', () => {
  const ids = ['a', 'b', 'c', 'd', 'e', 'f'];
  const rel = {
    a: [{ to: 'b', tag: '同类' }],
    b: [{ to: 'c', tag: '对比' }],   // a-b-c 连成一片
    d: [{ to: 'e', tag: '相关' }],   // 「相关」不参与辨析聚类
    e: [{ to: 'f', tag: '前置' }]    // 「前置」也不参与
  };
  const clusters = buildClusters(ids, rel);
  const clusterOfA = clusters.find((cl) => cl.indexOf('a') !== -1);
  assert.ok(clusterOfA, 'a 应在某个簇中');
  assert.deepEqual(clusterOfA.slice().sort(), ['a', 'b', 'c']);
  // d、e、f 都应各自成簇（相关/前置都不聚类）
  const clusterOfD = clusters.find((cl) => cl.indexOf('d') !== -1);
  const clusterOfE = clusters.find((cl) => cl.indexOf('e') !== -1);
  const clusterOfF = clusters.find((cl) => cl.indexOf('f') !== -1);
  assert.notEqual(clusterOfD, clusterOfE);
  assert.notEqual(clusterOfE, clusterOfF);
});

test('interleaveRelated 输出是输入的排列，且同簇卡片相邻出现', () => {
  const ids = ['a', 'b', 'c', 'd', 'e', 'f'];
  const rel = {
    a: [{ to: 'b', tag: '同类' }],
    c: [{ to: 'f', tag: '对比' }]
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

test('interleaveRelated 大簇切成小段（≤MAX_CLUSTER）', () => {
  const ids = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j'];
  const rel = {};
  for (let k = 0; k < 7; k++) rel[ids[k]] = [{ to: ids[k + 1], tag: '同类' }]; // a..h 连成 8 卡大簇
  const catOf = (id) => (id === 'i' || id === 'j') ? 'Y' : 'X';
  const out = interleaveRelated(ids, rel, catOf);
  assert.deepEqual(out.slice().sort(), ids.slice().sort());
  const xSet = new Set(['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h']);
  let maxRun = 0, run = 0;
  for (const id of out) {
    if (xSet.has(id)) { run++; maxRun = Math.max(maxRun, run); }
    else run = 0;
  }
  assert.ok(maxRun <= MAX_CLUSTER, `同类大簇连续段应≤${MAX_CLUSTER}，实际 ${maxRun}`);
});
