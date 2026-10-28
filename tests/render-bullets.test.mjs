import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';

// app.mjs 用标记块抽取「卡面答案分段」纯函数（DOM/存储无关），只测展示层不碰数据
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const src = fs.readFileSync(path.join(root, 'src/app.mjs'), 'utf8');
const BEGIN = '// ===== BEGIN TESTABLE answer split =====';
const END = '// ===== END TESTABLE answer split =====';
const a = src.indexOf(BEGIN);
const b = src.indexOf(END);
if (a < 0 || b < 0) throw new Error('app.mjs 缺少 answer split 标记块');
const block = src.slice(a + BEGIN.length, b);
const EXPORTS = [
  'ANS_LABELS', 'ANS_POINT_LEAD',
  'ansTrimEdge', 'ansProtectedRanges', 'ansIsProtected', 'ansPointBoundary',
  'ansMatchLabelAt', 'ansBlankLineLen', 'splitLongProse', 'refineProse', 'splitAnswerBlocks'
];
const sandbox = {};
vm.runInNewContext(block + '\n' + EXPORTS.map((n) => `this.${n} = ${n};`).join('\n'), sandbox);
const splitAnswerBlocks = (s) => Array.from(sandbox.splitAnswerBlocks(s));
const ansPointBoundary = sandbox.ansPointBoundary;
const ANS_POINT_LEAD = sandbox.ANS_POINT_LEAD;

const types = (blocks) => blocks.map((x) => x.type);
const strip = (s) => String(s).replace(/\s+/g, '');

test('口径：分点边界只认行首/句末标点/列举引导符，逗号与普通字后不算', () => {
  // 句末标点（含半角）与列举引导符算边界
  ['。', '！', '？', '；', '!', '?', ';', '：', ':', '—', '→'].forEach((p) => {
    assert.equal(ansPointBoundary('x' + p + '①', 2), true, '标点 ' + p + ' 后应为边界');
  });
  // 行首（含缩进）、字符串开头算边界
  assert.equal(ansPointBoundary('①', 0), true);
  assert.equal(ansPointBoundary('x\n①', 2), true);
  assert.equal(ansPointBoundary('x\n  ①', 4), true);
  assert.equal(ansPointBoundary('x\n\u3000①', 3), true);
  // 普通字/逗号/分号类以外都不算：句中引用不切
  assert.equal(ansPointBoundary('由①', 1), false);
  assert.equal(ansPointBoundary('三种情形，①', 5), false);
  assert.equal(ansPointBoundary('第①', 1), false);
  assert.equal(ansPointBoundary('X_①', 2), false);
  // 边界符号集合就是这几类，避免后人误加「，」
  assert.equal(ANS_POINT_LEAD.indexOf('，'), -1);
});

test('① 句中（1）不切：一句话里的同形标号保持完整', () => {
  const t = '设函数在某区间上连续，则（1）（2）（3）三种情形都要讨论。';
  const blocks = splitAnswerBlocks(t);
  assert.deepEqual(types(blocks), ['para']);
  assert.equal(blocks[0].content, t);
});

test('② 行首（1）切：字符串开头与换行后的全角括号标号分点成块', () => {
  const blocks = splitAnswerBlocks('（1）第一点说明。\n（2）第二点说明。');
  assert.deepEqual(types(blocks), ['point', 'point']);
  assert.equal(blocks[0].content, '（1）第一点说明。');
  assert.equal(blocks[1].content, '（2）第二点说明。');
  // 缩进（半角空格 / 制表 / 全角空格）后的行首标号同样算边界
  const indented = splitAnswerBlocks('  （3）第三点说明。');
  assert.deepEqual(types(indented), ['point']);
  assert.equal(indented[0].content, '（3）第三点说明。');
});

test('③ 句中①不切：引用式标号（由①②③ / 第③条 / 条件②③）不拆句', () => {
  assert.deepEqual(types(splitAnswerBlocks('由①②③可证结论成立。')), ['para']);
  assert.deepEqual(types(splitAnswerBlocks('第③条是可列并而非任意并。')), ['para']);
  assert.deepEqual(types(splitAnswerBlocks('条件②③失效时 OLS 不再一致。')), ['para']);
  // 句中空白后的引用（由上面 ③ 的均值）也是同一句，不切
  assert.deepEqual(types(splitAnswerBlocks('**大样本拒绝域**：由上面 ③ 的均值与方差标准化。')), ['para']);
});

test('④ 行首①切：换行（可缩进）后的圈码标号分点成块', () => {
  const blocks = splitAnswerBlocks('① 甲；\n  ② 乙；\n\t③ 丙；\n\u3000④ 丁。');
  assert.deepEqual(types(blocks), ['point', 'point', 'point', 'point']);
  assert.equal(blocks[0].content, '① 甲；');
  assert.equal(blocks[1].content, '② 乙；');
  assert.equal(blocks[2].content, '③ 丙；');
  assert.equal(blocks[3].content, '④ 丁。');
  // 句末标点后的标号也算真分点（不换行也切）
  const inline = splitAnswerBlocks('结论成立。① 第一条。');
  assert.deepEqual(types(inline), ['para', 'point']);
  assert.equal(inline[1].content, '① 第一条。');
});

test('⑤ X_{(1)} 不切：下标/括号包着的标号不是分点', () => {
  const t = '设 $X_{(1)}\\le X_{(2)}\\le X_{(3)}$ 为次序统计量，$X_{(n)}$ 为最大值。';
  const blocks = splitAnswerBlocks(t);
  assert.deepEqual(types(blocks), ['para']);
  assert.equal(blocks[0].content, t);
});

test('⑥ 保护区间不切：$…$ / **…** / \\textbf{…} 内部的标号一律不切', () => {
  const t = '公式 $a①+b②$ 与 $c（1）$ 都不可切。**加粗（1）①** 也不切。\\textbf{条件（2）②} 同样不切。';
  const blocks = splitAnswerBlocks(t);
  assert.deepEqual(types(blocks), ['para']);
  assert.equal(blocks[0].content, t);
  // 保护区间判定本身也覆盖这三类
  const ranges = sandbox.ansProtectedRanges('$x①$');
  assert.equal(sandbox.ansIsProtected(ranges, 2), true);
});

test('⑦ ~~~ 代码块不被切：围栏内标号与空行都当整体', () => {
  const t = '示例：\n~~~python\nfor i in range(3):\n    print(i)  # ① 注释\nx = （1）\n~~~\n结束。';
  const blocks = splitAnswerBlocks(t);
  assert.deepEqual(types(blocks), ['para']);
  assert.equal(blocks[0].content, t);
});

test('⑧ 空行段落仍切：空行分两段（含 CRLF）', () => {
  const blocks = splitAnswerBlocks('第一段文字说明。\n\n第二段文字说明。');
  assert.deepEqual(types(blocks), ['para', 'para']);
  assert.equal(blocks[0].content, '第一段文字说明。');
  assert.equal(blocks[1].content, '第二段文字说明。');
  const crlf = splitAnswerBlocks('甲段文字。\r\n\r\n乙段文字。');
  assert.deepEqual(types(crlf), ['para', 'para']);
});

test('⑨ 结构标签仍切：行首/句末标签起块，句中同名粘着词不切', () => {
  const blocks = splitAnswerBlocks('前置说明。\n**陷阱**：不要漏条件。\n例句：Tu viens ?');
  assert.deepEqual(types(blocks), ['para', 'label', 'label']);
  assert.equal(blocks[1].label, '陷阱');
  assert.equal(blocks[2].label, '例句');
  // 字符串开头的标签同样起块
  const head = splitAnswerBlocks('定义：若 $P(A)=1$ 则称 $A$ 几乎必然发生。');
  assert.deepEqual(types(head), ['label']);
  assert.equal(head[0].label, '定义');
  // 「命名规则：」是句中粘着词，不得当标签
  assert.deepEqual(types(splitAnswerBlocks('这是命名规则：不该切块。')), ['para']);
});

test('⑩ 长句细切仍生效：超长散文按句末标点细分，短句不碎切', () => {
  const t = '样本空间是随机试验所有可能结果组成的集合，它是概率论讨论的舞台与出发点。'
    + '事件域是样本空间的子集族，对补运算与可列并要求封闭，只有这样才能讨论概率的运算。'
    + '概率是定义在事件域上的集函数，非负性、规范性、可列可加性三条公理完整刻画了它。';
  assert.ok(t.length >= 100, '样本句需超过 PROSE_SPLIT_MIN：' + t.length);
  const blocks = splitAnswerBlocks(t);
  assert.deepEqual(types(blocks), ['para', 'para', 'para']);
  // 过短句不单独成块：两句合计不足阈值时合并
  const short = '好。' + '这一句虽然稍长但整体仍不足一百个字符，用于验证短句不会被切得很碎。';
  assert.ok(short.length < 100);
  assert.equal(splitAnswerBlocks(short).length, 1);
});

test('补充口径：列举引导符（冒号/破折号/箭头）后的标号是真分点', () => {
  const colon = splitAnswerBlocks('三种检验分别为：① 甲；② 乙。');
  assert.deepEqual(types(colon), ['para', 'point', 'point']);
  const dash = splitAnswerBlocks('满足三条件——① 非空；② 封闭。');
  assert.deepEqual(types(dash), ['para', 'point', 'point']);
  const arrow = splitAnswerBlocks('写报告 → ① 列提纲；② 补数据。');
  assert.deepEqual(types(arrow), ['para', 'point', 'point']);
  // 反例：逗号不是边界，句中「，①」不切
  assert.deepEqual(types(splitAnswerBlocks('三种情形，①号情形最常见。')), ['para']);
});

test('补充口径：真英文括号年份不当分点（Transformer（2017））', () => {
  assert.deepEqual(types(splitAnswerBlocks('Transformer（2017）提出自注意力。')), ['para']);
  assert.deepEqual(types(splitAnswerBlocks('日常做①②③件事都行。')), ['para']);
});

test('块契约：type 只取 point/label/para，point 内容以标号开头，内容不丢字', () => {
  const t = '开口说明（1）在此句中。\n\n**要点**：行首分点如下——① 甲；② 乙。\n\n'
    + '长段散文第一句把随机试验的全部可能结果收进样本空间，并用事件域承载可列并。'
    + '长段散文第二句把概率定义为满足非负、规范、可列可加三条公理的集函数，到这里结束。';
  const blocks = splitAnswerBlocks(t);
  assert.ok(blocks.length >= 3, '应切出多个块：' + blocks.length);
  blocks.forEach((x) => {
    assert.ok(['point', 'label', 'para'].includes(x.type), '非法块类型 ' + x.type);
    assert.ok(x.content.length > 0 && x.content === x.content.trim(), '块内容需为非空且已裁边');
  });
  const points = blocks.filter((x) => x.type === 'point');
  assert.ok(points.length >= 2, '行首 ①② 应成 point 块');
  points.forEach((x) => assert.match(x.content, /^(?:[①-⑩]|（\d+）)/));
  // 不丢内容：所有块按序拼回的可见字符与原串一致
  assert.equal(strip(blocks.map((x) => x.content).join('')), strip(t));
  // 空串/纯空白返回空数组
  assert.deepEqual(splitAnswerBlocks(''), []);
  assert.deepEqual(splitAnswerBlocks('   \n  '), []);
});
