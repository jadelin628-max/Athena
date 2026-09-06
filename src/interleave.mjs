  // ---------------- 交错练习 · 分块交错 ----------------
  // 原理：交错练习要「同类辨别卡在一起 + 章节之间交错」——
  //   把同一章节的卡分成小块（chunk），各章节按小块轮流出现：
  //   既让同类卡成组（便于辨别），又不整章阻塞（保持交错）。
  // 纯函数（依赖注入 catOf），便于 tools 对拍测试，不碰任何运行时全局。

  const CHUNK_SIZE = 3; // 每章节每轮吐出的卡数（同类成组的大小）

  function shuffleArr(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }

  // 分块交错：按章节分组、组内乱序，每轮从每个章节吐出最多 chunkSize 张卡
  function interleaveChunked(ids, catOf, chunkSize) {
    const size = (typeof chunkSize === 'number' && chunkSize >= 1) ? chunkSize : 1;
    const byCat = {};
    ids.forEach(function (id) {
      const c = catOf(id) || '?';
      (byCat[c] = byCat[c] || []).push(id);
    });
    const groups = Object.keys(byCat).map(function (k) { return shuffleArr(byCat[k]); });
    const out = [];
    let added = true;
    while (added) {
      added = false;
      for (let i = 0; i < groups.length; i++) {
        if (groups[i].length) {
          const n = Math.min(size, groups[i].length);
          for (let j = 0; j < n; j++) out.push(groups[i].shift());
          added = true;
        }
      }
    }
    return out;
  }

  export { CHUNK_SIZE, interleaveChunked };
