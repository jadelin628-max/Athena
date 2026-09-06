import test from 'node:test';
import assert from 'node:assert/strict';
import { CHUNK_SIZE, interleaveChunked } from '../src/interleave.mjs';

test('CHUNK_SIZE 默认成组大小合理', () => {
  assert.equal(CHUNK_SIZE, 3);
});

test('interleaveChunked 输出是输入的排列', () => {
  const ids = ['a', 'b', 'c', 'd', 'e', 'f', 'g'];
  const catOf = (id) => id[0];
  const out = interleaveChunked(ids, catOf, 3);
  assert.deepEqual(out.slice().sort(), ids.slice().sort());
});

test('interleaveChunked 同类成组：同章节连续段不超过 chunkSize', () => {
  // 两个章节、各 5 张，chunk=2：每段同类最多 2 张，且章节交替
  const ids = ['x1', 'x2', 'x3', 'x4', 'x5', 'y1', 'y2', 'y3', 'y4', 'y5'];
  const catOf = (id) => id[0];
  const out = interleaveChunked(ids, catOf, 2);
  assert.deepEqual(out.slice().sort(), ids.slice().sort());
  let maxRun = 1, run = 1;
  for (let i = 1; i < out.length; i++) {
    if (catOf(out[i]) === catOf(out[i - 1])) { run++; maxRun = Math.max(maxRun, run); }
    else run = 1;
  }
  assert.ok(maxRun <= 2, `同类连续段应≤2，实际 ${maxRun}`);
});

test('interleaveChunked 空输入与无分类时安全', () => {
  assert.deepEqual(interleaveChunked([], () => '?', 3), []);
  const ids = ['a', 'b', 'c'];
  const out = interleaveChunked(ids, () => '?', 3);
  assert.deepEqual(out.slice().sort(), ids.slice().sort());
});
