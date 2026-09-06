  // ---------------- 交错练习 · 辨析聚类 ----------------
  // 原理：交错练习的收益在「辨别」——让「会搞混」的卡片（REL 中 tag=对比/类比/同类）
  //       在队列里较近出现；同时按分类轮转，避免同一章节的卡连续扎堆。
  // 纯函数（依赖注入 rel / catOf），便于 tools 对拍测试，不碰任何运行时全局。

  // 「辨析相关」标签：只有这三类算「容易搞混、需辨别」，其余（前置/相关/方法/应用）不参与聚类
  const DISCRIM_TAGS = { '对比': 1, '类比': 1, '同类': 1 };

  // 并查集：把「辨析相关」的卡片聚成同一簇；簇内保持输入顺序
  function buildClusters(ids, rel) {
    const idSet = {};
    ids.forEach(function (id) { idSet[id] = 1; });
    const parent = {};
    const find = function (x) { while (parent[x] !== x) { parent[x] = parent[parent[x]]; x = parent[x]; } return x; };
    ids.forEach(function (id) { parent[id] = id; });
    ids.forEach(function (id) {
      const edges = (rel && rel[id]) || [];
      for (let i = 0; i < edges.length; i++) {
        const e = edges[i];
        const to = e && e.to;
        if (to && idSet[to] && DISCRIM_TAGS[e.tag]) {
          const ra = find(id), rb = find(to);
          if (ra !== rb) parent[ra] = rb;
        }
      }
    });
    const groups = {};
    ids.forEach(function (id) {
      const r = find(id);
      (groups[r] = groups[r] || []).push(id);
    });
    return Object.keys(groups).map(function (k) { return groups[k]; });
  }

  function shuffleArr(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }

  // 辨析交错：相关卡聚成簇、簇内相邻出现（较近），簇之间按分类轮转（同章不连续）
  function interleaveRelated(ids, rel, catOf) {
    const clusters = buildClusters(ids, rel);
    const byCat = {};
    clusters.forEach(function (cluster) {
      const c = catOf(cluster[0]) || '?';
      (byCat[c] = byCat[c] || []).push(cluster);
    });
    const groups = Object.keys(byCat).map(function (k) { return shuffleArr(byCat[k]); });
    const out = [];
    let added = true;
    while (added) {
      added = false;
      for (let i = 0; i < groups.length; i++) {
        if (groups[i].length) {
          const cluster = groups[i].shift();
          for (let j = 0; j < cluster.length; j++) out.push(cluster[j]);
          added = true;
        }
      }
    }
    return out;
  }

  export { DISCRIM_TAGS, buildClusters, interleaveRelated };
