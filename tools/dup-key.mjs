// W3-i 共享去重口径（生成器 tools/bank-cv.mjs 与 tests/bank.test.mjs 同源引用，避免两份实现漂移）
// 背景：题库「严重重复」现算审计（backup/scratch/bank-wave3/dup-audit.mjs）发现 14 组派生题逐字同题，
// 另有 2 组「卡片例题 ↔ 短公式填空真题」是同一道题的两种表述，6-gram 覆盖率量具天然判 0。
// 这里把两种判据集中为纯函数，只服务于「不重复入库」的判定，不改变任何题目内容。

// ① 精确同题键：全角转半角 → 去纯排版 LaTeX 命令 → 小写 → 去空白与标点。
//    与 dup-audit.mjs 的 norm() 逐字一致；tests/bank.test.mjs 的 normStem() 更宽松（保留标点/大小写），
//    会漏掉 E04 这类仅排版写法不同的同题，故生成器去重统一用本函数。
export function dupKey(s) {
  let t = String(s == null ? '' : s)
    .replace(/[\uFF01-\uFF5E]/g, (c) => String.fromCharCode(c.charCodeAt(0) - 0xFEE0))
    .replace(/\\(?:left|right|displaystyle|textstyle|scriptstyle|quad|qquad|limits|nolimits|,|;|!|:|>| )/g, '')
    .toLowerCase()
    .replace(/[\s\u3000]+/g, '')
    .replace(/[，。、；：,.;:（）()【】\[\]{}？?！!「」『』“”"'‘’`~_=+*&#%^|—\-–\/\\]/g, '');
  return t;
}

// ② 同一道题的核心表达式：在 dupKey 之上再去掉题干的 verbal 外壳
//    —— 「（2015 数三）」年份前缀、「求极限/求/计算/证明」祈使词、填空题的「=______.」尾巴。
//    仅用于 subOf 校验里 exactSame 的补充放行：短公式填空题的 6-gram 少于 8 个时 coverRatio 恒为 0
//    （T149 已为这类盲区开过 exactSame 放行），此处延续同一口径，且要求核心长度 ≥12 才放行，防止误判。
export function coreStem(s) {
  return String(s == null ? '' : s)
    .replace(/[\uFF01-\uFF5E]/g, (c) => String.fromCharCode(c.charCodeAt(0) - 0xFEE0))
    .toLowerCase()
    .replace(/\\(?:left|right|limits|displaystyle|textstyle|scriptstyle|quad|qquad|,|;|!|:|>| )/g, '')
    .replace(/[（(]\s*(?:19|20)\d{2}\s*(?:数三|真题)?\s*[）)]/g, '')
    .replace(/[，。、；：,.;:（）()【】\[\]{}？?！!「」『』“”"'‘’`~_=+*&#%^|—\-–\/\\\s]/g, '')
    .replace(/^求极限|^求|^计算|^证明|^设/g, '')
    .replace(/_+/g, '');
}
