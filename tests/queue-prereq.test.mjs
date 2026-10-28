// T155：新卡「前置优先」推送顺序（src/browse.mjs 的 TESTABLE prereq helpers 块）
// 抽取方式与 queue-order.test.mjs 一致：读源码文本 → 按标记切块 → vm 里跑，跨 realm 数组用 Array.from。
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const BROWSE = path.join(ROOT, 'src', 'browse.mjs');
const SRC = fs.readFileSync(BROWSE, 'utf8');

const BEGIN = '// ===== BEGIN TESTABLE prereq helpers =====';
const END = '// ===== END TESTABLE prereq helpers =====';

function extractBlock() {
  const b = SRC.indexOf(BEGIN);
  const e = SRC.indexOf(END);
  assert.ok(b !== -1, '缺少 BEGIN TESTABLE prereq helpers 标记');
  assert.ok(e > b, '缺少 END TESTABLE prereq helpers 标记');
  return SRC.slice(b, e + END.length);
}

const sandbox = {};
vm.createContext(sandbox);
vm.runInContext(
  extractBlock() +
    '\nthis.prereqRelOf = prereqRelOf;' +
    '\nthis.prereqOf = prereqOf;' +
    '\nthis.prereqOrder = prereqOrder;\n',
  sandbox,
  { filename: 'browse-prereq.testable.js' }
);
const { prereqRelOf, prereqOf, prereqOrder } = sandbox;

// 跨 realm 数组统一转回本 realm 再比较
const arr = (x) => Array.from(x);
// relOf 便捷造表：{ A: ['B'] } ⇒ { A: [{ to: 'B', tag: '前置' }] }
const relTable = (map, tag) => {
  const out = {};
  for (const k of Object.keys(map)) {
    out[k] = (Array.isArray(map[k]) ? map[k] : [map[k]]).map((to) => ({ to, tag: tag || '前置' }));
  }
  return out;
};
const NOTHING_LEARNED = () => false;

test('prereqRelOf：函数与表两种取法，缺失/非法一律当空', () => {
  const table = relTable({ a: 'b' });
  assert.deepEqual(arr(prereqRelOf('a', table)), [{ to: 'b', tag: '前置' }]);
  assert.deepEqual(arr(prereqRelOf('a', (id) => table[id])), [{ to: 'b', tag: '前置' }]);
  assert.deepEqual(arr(prereqRelOf('nope', table)), []);
  assert.deepEqual(arr(prereqRelOf('a', null)), []);
  assert.deepEqual(arr(prereqRelOf('a', undefined)), []);
  assert.deepEqual(arr(prereqRelOf('a', { a: 'x' })), [], '非数组当空');
  assert.deepEqual(arr(prereqRelOf('a', { a: [{ to: 'b', tag: '前置' }] })), [{ to: 'b', tag: '前置' }]);
});

test('prereqOf：只认 前置 tag，去重保序，跳过自引用与非字符串', () => {
  const rel = {
    a: [
      { to: 'b', tag: '前置' },
      { to: 'c', tag: '同类' },
      { to: 'b', tag: '前置' }, // 重复
      { to: 'a', tag: '前置' }, // 自引用
      { to: 42, tag: '前置' }, // 非字符串
      { to: '', tag: '前置' }, // 空
      null,
      { tag: '前置' }, // 缺 to
      { to: 'd', tag: '前置' }
    ]
  };
  assert.deepEqual(arr(prereqOf('a', rel)), ['b', 'd']);
  assert.deepEqual(arr(prereqOf('a', {})), []);
  assert.deepEqual(arr(prereqOf('a', { a: 'b' })), []);
});

test('① 基础：A 的前置是 B ⇒ B 排在 A 前面', () => {
  const rel = relTable({ a: 'b' });
  assert.deepEqual(arr(prereqOrder(['a', 'b'], rel, NOTHING_LEARNED)), ['b', 'a']);
  assert.deepEqual(arr(prereqOrder(['b', 'a'], rel, NOTHING_LEARNED)), ['b', 'a']);
  // 无约束的卡不受影响
  assert.deepEqual(arr(prereqOrder(['a', 'c', 'b'], rel, NOTHING_LEARNED)), ['c', 'b', 'a']);
});

test('② 链式：A←B←C 三层，前置恒在前（任意输入排列都收敛到同一拓扑序）', () => {
  const rel = relTable({ a: 'b', b: 'c' }); // b 是 a 的前置，c 是 b 的前置
  const perms = [
    ['a', 'b', 'c'],
    ['a', 'c', 'b'],
    ['b', 'a', 'c'],
    ['b', 'c', 'a'],
    ['c', 'a', 'b'],
    ['c', 'b', 'a']
  ];
  for (const p of perms) {
    const out = arr(prereqOrder(p, rel, NOTHING_LEARNED));
    assert.deepEqual(out, ['c', 'b', 'a'], '输入 ' + p.join('') + ' 应排成 c,b,a');
  }
});

test('③ 环：A↔B 不死锁，每卡只出现一次，环内按输入序', () => {
  const rel = relTable({ a: 'b', b: 'a' });
  const out1 = arr(prereqOrder(['a', 'b'], rel, NOTHING_LEARNED));
  assert.deepEqual(out1, ['a', 'b'], '同层保持输入序');
  assert.equal(new Set(out1).size, 2);
  const out2 = arr(prereqOrder(['b', 'a'], rel, NOTHING_LEARNED));
  assert.deepEqual(out2, ['b', 'a']);
  // 环 + 环外依赖：环整体先于依赖它的卡
  const rel2 = relTable({ a: 'b', b: 'a', c: 'a' });
  assert.deepEqual(arr(prereqOrder(['c', 'a', 'b'], rel2, NOTHING_LEARNED)), ['a', 'b', 'c']);
  // 三卡环
  const rel3 = relTable({ a: 'b', b: 'c', c: 'a' });
  const out3 = arr(prereqOrder(['a', 'b', 'c'], rel3, NOTHING_LEARNED));
  assert.equal(out3.length, 3);
  assert.equal(new Set(out3).size, 3);
});

test('④ 自引用：A 把自己当前置 —— 忽略，不当环也不阻塞', () => {
  const rel = { a: [{ to: 'a', tag: '前置' }] };
  assert.deepEqual(arr(prereqOf('a', rel)), []);
  assert.deepEqual(arr(prereqOrder(['a', 'b'], rel, NOTHING_LEARNED)), ['a', 'b']);
});

test('⑤ 前置已学：learnedOf 为真的前置不再拖住该卡，直接进首层', () => {
  const rel = relTable({ a: 'b' });
  // b 尚未学（在批内）⇒ a 被压到第二层
  assert.deepEqual(arr(prereqOrder(['a', 'b'], rel, NOTHING_LEARNED)), ['b', 'a']);
  // b 已学 ⇒ 约束解除，a 回到首层，跟 c 一样按输入序
  const learned = (id) => id === 'b';
  assert.deepEqual(arr(prereqOrder(['a', 'b', 'c'], rel, learned)), ['a', 'b', 'c']);
  assert.deepEqual(arr(prereqOrder(['c', 'a', 'd'], rel, learned)), ['c', 'a', 'd']);
});

test('⑥ 前置目标不在本批（别的科目/已删）：不阻塞，原序返回', () => {
  const rel = relTable({ a: 'ghost' });
  assert.deepEqual(arr(prereqOrder(['a', 'b'], rel, NOTHING_LEARNED)), ['a', 'b']);
  assert.deepEqual(arr(prereqOrder(['b', 'a'], rel, NOTHING_LEARNED)), ['b', 'a']);
});

test('⑦ 空输入 / 单卡 / 重复 / 非法：安全且不丢卡', () => {
  const rel = relTable({ a: 'b' });
  assert.deepEqual(arr(prereqOrder([], rel, NOTHING_LEARNED)), []);
  assert.deepEqual(arr(prereqOrder(null, rel, NOTHING_LEARNED)), []);
  assert.deepEqual(arr(prereqOrder(undefined, rel, NOTHING_LEARNED)), []);
  assert.deepEqual(arr(prereqOrder(['a'], rel, NOTHING_LEARNED)), ['a']);
  assert.deepEqual(arr(prereqOrder(['a', 'a', 'b'], rel, NOTHING_LEARNED)), ['b', 'a'], '重复 id 只留一次');
  assert.deepEqual(arr(prereqOrder(['a', 42, '', null, 'b'], rel, NOTHING_LEARNED)), ['b', 'a']);
});

test('⑧ 同层保持输入顺序 + 确定性 + 不改入参', () => {
  const rel = relTable({ d: 'e' });
  const ids = ['a', 'b', 'c', 'd', 'e'];
  const before = ids.slice();
  const out = arr(prereqOrder(ids, rel, NOTHING_LEARNED));
  // a,b,c,e 同层（e 是 d 的前置，也在首层），保持输入序；d 被压到第二层
  assert.deepEqual(out, ['a', 'b', 'c', 'e', 'd']);
  assert.deepEqual(ids, before, '不得修改入参');
  assert.deepEqual(arr(prereqOrder(ids, rel, NOTHING_LEARNED)), out, '两次调用结果一致');
  // 首层的相对顺序严格跟着调用方传入的顺序（这里把 c 提到最前）
  assert.deepEqual(arr(prereqOrder(['c', 'a', 'b', 'e', 'd'], rel, NOTHING_LEARNED)), ['c', 'a', 'b', 'e', 'd']);
});

// ---------- 真实数据回归 ----------
function loadSubject(id) {
  const box = { window: {} };
  vm.createContext(box);
  vm.runInContext(fs.readFileSync(path.join(ROOT, 'data', id + '.js'), 'utf8'), box, { filename: id + '.js' });
  const subj = box.window.SUBJECTS && box.window.SUBJECTS[id];
  assert.ok(subj && Array.isArray(subj.DATA), 'data/' + id + '.js 应挂到 window.SUBJECTS.' + id);
  return subj;
}

// 直达性：从 from 沿「前置 → 依赖」方向能否走到 to（用来判定一条边是否落在环里）
function reachable(adj, from, to) {
  const seen = new Set([from]);
  const queue = [from];
  while (queue.length) {
    const cur = queue.pop();
    if (cur === to) return true;
    for (const next of adj[cur]) {
      if (!seen.has(next)) {
        seen.add(next);
        queue.push(next);
      }
    }
  }
  return false;
}

function auditSubject(id) {
  const subj = loadSubject(id);
  const ids = Array.from(subj.DATA, (c) => c.id); // 跨 realm 归一成本 realm 数组，deepEqual 才认
  const rel = subj.REL || {};
  const relOf = (x) => rel[x] || [];
  const pool = {};
  ids.forEach((x, i) => { pool[x] = i; });

  const adj = {};
  const radj = {};
  for (const x of ids) { adj[x] = []; radj[x] = []; }
  let edges = 0;
  for (const a of ids) {
    for (const p of prereqOf(a, relOf)) {
      if (pool[p] === undefined || p === a) continue;
      adj[p].push(a); // 前置 → 依赖
      radj[a].push(p);
      edges++;
    }
  }

  const out = arr(prereqOrder(ids, relOf, NOTHING_LEARNED));
  const pos = {};
  out.forEach((x, i) => { pos[x] = i; });

  let cyclicEdges = 0;
  const violations = [];
  const intraCycle = [];
  for (const a of ids) {
    for (const p of radj[a]) {
      const inCycle = reachable(adj, a, p); // a 能走回 p ⇒ p↔a 同属一个强连通分量
      const ok = pos[p] < pos[a];
      if (inCycle) {
        cyclicEdges++;
        if (!ok) intraCycle.push(p + '>' + a);
        continue;
      }
      if (!ok) violations.push(p + ' 应在 ' + a + ' 之前');
    }
  }

  // 环清单：把落在环里的卡按强连通分量聚出来（仅用于打印）
  const cyclicNodes = new Set();
  for (const a of ids) for (const p of radj[a]) if (reachable(adj, a, p)) { cyclicNodes.add(p); cyclicNodes.add(a); }
  const seen = new Set();
  const cycleGroups = [];
  for (const start of ids) {
    if (!cyclicNodes.has(start) || seen.has(start)) continue;
    const group = [];
    const stack = [start];
    seen.add(start);
    while (stack.length) {
      const cur = stack.pop();
      group.push(cur);
      for (const next of adj[cur]) {
        if (cyclicNodes.has(next) && !seen.has(next)) { seen.add(next); stack.push(next); }
      }
      for (const prev of radj[cur]) {
        if (cyclicNodes.has(prev) && !seen.has(prev)) { seen.add(prev); stack.push(prev); }
      }
    }
    cycleGroups.push(group.sort());
  }

  return { id, ids, out, edges, violations, cyclicEdges, intraCycle, cycleGroups };
}

for (const id of ['econ', 'math3', 'stats']) {
  test('真实数据回归：' + id + ' 前置优先（环外违规 = 0）', () => {
    const r = auditSubject(id);
    // 完整 + 不丢卡 + 每卡恰一次
    assert.equal(r.out.length, r.ids.length, '输出长度必须等于批内卡数');
    assert.equal(new Set(r.out).size, r.out.length, '每卡只出现一次');
    // 环外违规必须为 0；环内的边无法同时满足，只打印不断言
    assert.deepEqual(r.violations, [], id + ' 存在环外前置违规');
    console.log(
      '[' + id + '] 卡=' + r.ids.length + ' 前置边=' + r.edges +
      ' 环内卡=' + r.cycleGroups.reduce((n, g) => n + g.length, 0) +
      ' 环组=' + r.cycleGroups.length + ' 环内边=' + r.cyclicEdges +
      ' 环内被破边=' + r.intraCycle.length
    );
    if (r.cycleGroups.length) {
      console.log('  环：' + r.cycleGroups.map((g) => '(' + g.join('↔') + ')').join(' '));
    }
    if (r.intraCycle.length) {
      console.log('  环内不可解边（按输入序牺牲）：' + r.intraCycle.join(', '));
    }
  });
}

test('真实数据回归：无 前置 的学科逐字恒等（fr / cppl）', () => {
  for (const id of ['fr', 'cppl']) {
    const subj = loadSubject(id);
    const ids = Array.from(subj.DATA, (c) => c.id); // 跨 realm 归一成本 realm 数组，deepEqual 才认
    const rel = subj.REL || {};
    assert.deepEqual(arr(prereqOrder(ids, (x) => rel[x] || [], NOTHING_LEARNED)), ids, id + ' 必须原样返回');
    assert.deepEqual(arr(prereqOrder(ids, null, null)), ids, id + ' 空关系表也原样返回');
  }
});

test('性能：整科新卡池（econ 333 卡 / 231 前置边）分层排序够快', () => {
  const subj = loadSubject('econ');
  const ids = Array.from(subj.DATA, (c) => c.id); // 跨 realm 归一成本 realm 数组，deepEqual 才认
  const rel = subj.REL || {};
  const relOf = (x) => rel[x] || [];
  prereqOrder(ids, relOf, NOTHING_LEARNED); // 预热
  const rounds = 50;
  const t0 = process.hrtime.bigint();
  for (let i = 0; i < rounds; i++) prereqOrder(ids, relOf, NOTHING_LEARNED);
  const ms = Number(process.hrtime.bigint() - t0) / 1e6 / rounds;
  console.log('[perf] econ 全池 ' + ids.length + ' 卡 avg=' + ms.toFixed(3) + 'ms/call');
  assert.ok(ms < 5, '单次应远小于 5ms，实测 ' + ms.toFixed(3) + 'ms');
});

// ---------- 接线：纯函数块被 buildSession 真正用上 ----------
test('接线：buildSession 用 prereqOrder 排序，且块内不留 export（browse.mjs 不参与剥离）', () => {
  const block = extractBlock();
  assert.equal(/^\s*export\b/m.test(block), false, 'TESTABLE 块内不得有 export（browse.mjs 不在 STRIP 里）');
  assert.equal(SRC.split(BEGIN).length, 2, 'BEGIN 标记只应出现一次');
  assert.equal(SRC.split(END).length, 2, 'END 标记只应出现一次');

  const start = SRC.indexOf('function buildSession(');
  const end = SRC.indexOf('function introMore(');
  assert.ok(start !== -1 && end > start, '找不到 buildSession 函数体');
  const body = SRC.slice(start, end);
  assert.match(body, /prereqOrder\(newPool, prereqRel, prereqLearned\)/, '候选池要先分层（决定入选顺序）');
  assert.match(body, /prereqOrder\(interleaveByIds\(newOrdered\), prereqRel, prereqLearned\)/, '交错后要恢复前置序');
  assert.match(body, /const prereqRel = function \(id\) \{ return REL\[id\] \|\| \[\]; \};/, '关系表取自 REL');
  assert.match(
    body,
    /\.slice\(0, room \+ \(skipPending \? \(pendingBoost \|\| 0\) : 0\)\)/,
    '每日上限 / 再来一批的数量语义必须保持原样'
  );
  assert.match(body, /queueOrderOf\(prefGet\('queueOrder'\)\) === 'new' \? segNew\.concat\(segReview\) : segReview\.concat\(segNew\);/,
    'queueOrder 两段拼接不得被改动');
  assert.match(body, /segNew = learningDue\.concat\(newToStudy\)/, '新学会话仍 = 步进卡 + 新卡');
  // 每日上限截断的「引入」那一批也必须先过分层：否则随机引入会绕过前置序（首日前置还没进来、后继先被推上来）
  assert.match(body, /prereqOrder\(shuffle\(all\.filter/, '引入（每日上限截断）那一批要先过前置分层');
  assert.match(body, /prereqLearned\)\.slice\(0, room\)/, '层前缀截断之后才决定今日引入哪些新卡');
  assert.ok(
    body.indexOf('const prereqRel =') < body.indexOf('prereqOrder(shuffle('),
    'prereqRel / prereqLearned 必须在引入之前定义'
  );
});
