// 卡片正文守卫（用户 m01261）：知识卡片的 front/back 必须是「文字＋公式」的知识点阐释，
// 不得直接照抄例题的题干或解答，也不得写成「求导数：…」这类题目式题面。
// 规则一（跨全部学科）：6-gram 对称 Jaccard 相似度——S1=front≈本卡例题题干(S1≥0.45 判红)、
//   S2=back≈本卡例题解答(S2≥0.55 判红)、S3=front≈同科别卡的例题题干(S3≥0.45 判红)。
//   长度门槛 front≥24 / back≥48 / 例题侧≥24，shingle 数 <8 直接返回 0——压掉「短题面/共享公式」假阳。
// 规则二（仅考试学科 math3/econ/stats）：front 以 设/已知/对任意/证明/计算/判断/试 开头且含任务动词，
//   或写成 「求极限：/求导数：/求不定积分：」 的题目式前缀。
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = (p) => readFileSync(path.join(ROOT, p), 'utf8');

const SUBJECT_FILES = readdirSync(path.join(ROOT, 'data'))
  .filter((f) => /^[a-z0-9]+\.js$/.test(f) && !f.startsWith('bank_'));
const sandbox = { window: {}, String, Math, console, Number, Object, Array };
vm.createContext(sandbox);
for (const f of SUBJECT_FILES) vm.runInContext(read('data/' + f), sandbox, { filename: f });
const SUBJECTS = sandbox.window.SUBJECTS;

const EXAM_SUBJECTS = ['math3', 'econ', 'stats'];
const STATEMENT_OPEN = /^(设|已知|对任意|证明|计算|判断|试)/;
const TASK_WORD = /求|证明|计算|判断|试证|给出/;
// 方法卡豁免：「已知…如何求…／证明…类题目的通用套路／有哪几条路线」是正当的知识点题面
const METHOD_MARK = /通用|套路|路线|流程|步骤|方法|怎么|如何|有哪些|哪几|类题目/;
const DRILL_OPEN = /^求(极限|导数|不定积分|导函数)：/;
const S1_MAX = 0.45;
const S2_MAX = 0.55;
const S3_MAX = 0.45;

const norm = (s) => String(s == null ? '' : s)
  .replace(/\\[a-zA-Z]+/g, '').replace(/[{}$^_&~\\]/g, '').replace(/\s+/g, '');
const shingles = (s, n = 6) => {
  const set = new Set();
  for (let i = 0; i + n <= s.length; i++) set.add(s.slice(i, i + n));
  return set;
};
const jac = (a, b) => {
  const A = shingles(a); const B = shingles(b);
  if (A.size < 8 || B.size < 8) return 0;
  let inter = 0;
  for (const g of A) if (B.has(g)) inter++;
  return inter / (A.size + B.size - inter);
};

// 审计：返回违规清单（供用例与反证共用）
function audit(subjects, subjectIds, examIds = EXAM_SUBJECTS) {
  const violations = [];
  for (const sid of subjectIds) {
    const S = subjects[sid];
    assert.ok(S, `data/${sid}.js 未导出 SUBJECTS.${sid}`);
    assert.ok((S.DATA || []).length > 0, `data/${sid}.js 无卡片`);
    const EX = S.EXAMPLE || {};
    const pool = Object.entries(EX)
      .filter(([, e]) => e && e.q && norm(e.q).length >= 24)
      .map(([cid, e]) => ({ cid, nq: norm(e.q) }));
    for (const c of S.DATA || []) {
      const nf = norm(c.front); const nb = norm(c.back);
      const own = EX[c.id] || null;
      let s1 = 0; let s2 = 0; let s3 = 0; let s3id = '';
      if (own && own.q && nf.length >= 24 && norm(own.q).length >= 24) s1 = jac(nf, norm(own.q));
      if (own && nb.length >= 48) {
        for (const t of [own.a, own.a2].filter(Boolean)) {
          if (norm(t).length >= 48) s2 = Math.max(s2, jac(nb, norm(t)));
        }
      }
      if (nf.length >= 24) {
        for (const p of pool) {
          if (p.cid === c.id) continue;
          const v = jac(nf, p.nq);
          if (v > s3) { s3 = v; s3id = p.cid; }
        }
      }
      if (s1 >= S1_MAX) violations.push(`${sid}/${c.id} front 照抄本卡例题题干（Jaccard ${s1.toFixed(3)} ≥ ${S1_MAX}）：${String(c.front).slice(0, 40)}`);
      if (s2 >= S2_MAX) violations.push(`${sid}/${c.id} back 照抄本卡例题解答（Jaccard ${s2.toFixed(3)} ≥ ${S2_MAX}）：${String(c.back).slice(0, 40)}`);
      if (s3 >= S3_MAX) violations.push(`${sid}/${c.id} front 照抄 ${sid}/${s3id} 的例题题干（Jaccard ${s3.toFixed(3)} ≥ ${S3_MAX}）：${String(c.front).slice(0, 40)}`);
      if (examIds.includes(sid)) {
        const f = String(c.front == null ? '' : c.front).trim();
        if (DRILL_OPEN.test(f)) violations.push(`${sid}/${c.id} 题面仍是题目式前缀：${f.slice(0, 40)}`);
        if (STATEMENT_OPEN.test(f) && TASK_WORD.test(f) && !METHOD_MARK.test(f)) violations.push(`${sid}/${c.id} 题面是具体题目（陈述式开头＋任务动词）：${f.slice(0, 40)}`);
      }
    }
  }
  return violations;
}

const mkCard = (id, front, back) => ({ id, cat: 'probe', title: id, front, back });
const probeSubjects = () => ({
  probe: {
    DATA: [
      mkCard('p1', '设 $f(x)$ 在 $(a,b)$ 内可导。证明：$f\'(x)$ 严格单调增加。', 'x'.repeat(80)),
      mkCard('p2', '复合函数等式 $f(g(x))=h(x)$ 如何反求 $f$？', 'y'.repeat(80)),
      mkCard('p3', '如何检验两个变量是否线性相关？', 'z'.repeat(80)),
      mkCard('p4', '已知 $f$ 与 $g$，如何求复合函数的导数？', 'q'.repeat(80))
    ],
    EXAMPLE: {
      p1: { q: '设 $f(x)$ 在 $(a,b)$ 内可导。证明：$f\'(x)$ 严格单调增加。', a: 'w'.repeat(80) },
      p2: { q: '已知 $f\\left(x+\\dfrac{1}{x}\\right)=x^{2}+\\dfrac{1}{x^{2}}$，怎么求 $f(t)$？', a: 'v'.repeat(80) }
    }
  }
});

test('反证：守卫能判红也能判绿（合成样本）', () => {
  const red = audit(probeSubjects(), ['probe'], ['probe']);
  assert.ok(red.some((m) => m.includes('p1 front 照抄本卡例题题干')), '照抄例题题干必须判红：' + red.join(' | '));
  assert.ok(red.some((m) => m.includes('p1 题面是具体题目')), '陈述式题面必须判红：' + red.join(' | '));
  assert.ok(!red.some((m) => m.includes('p2 ')), '知识点式题面必须判绿，实际：' + red.join(' | '));
  assert.ok(!red.some((m) => m.includes('p3 ')), '方法式题面必须判绿，实际：' + red.join(' | '));
  assert.ok(!red.some((m) => m.includes('p4 ')), '「已知…如何求…」方法卡必须判绿，实际：' + red.join(' | '));
  // 邻近不误伤：合成样本换成同主题但措辞不同的题面，不得再判红
  const green = probeSubjects();
  green.probe.DATA[0].front = '导数严格单调与割线斜率递增为什么等价？';
  assert.deepEqual(audit(green, ['probe'], ['probe']), []);
});

test('卡片正文不得照抄例题（Jaccard 门槛，全 25 学科）', () => {
  const violations = audit(SUBJECTS, SUBJECT_FILES.map((f) => f.replace(/\.js$/, '')));
  assert.deepEqual(violations, [], '卡片正文照抄例题：\n' + violations.join('\n'));
});

test('考试学科卡片题面不得是题目式表述', () => {
  const violations = audit(SUBJECTS, EXAM_SUBJECTS).filter((m) => m.includes('题面'));
  assert.deepEqual(violations, [], '题目式题面：\n' + violations.join('\n'));
});

test('守卫覆盖到三科考试学科与例题表', () => {
  for (const sid of EXAM_SUBJECTS) {
    assert.ok((SUBJECTS[sid].DATA || []).length > 100, `${sid} 卡片数异常`);
    assert.ok(Object.keys(SUBJECTS[sid].EXAMPLE || {}).length > 0, `${sid} 缺 EXAMPLE 表`);
  }
});
