  // ---------------- 交错练习 · 辨析聚类 ----------------
  // 原理：把「相关需辨析」的卡（REL 中 tag=同类/对比/类比）聚成簇、簇内相邻出现，
  //       簇与无关联的单卡再按章节轮转——只让「真有关系」的卡在一起，无关联的卡不硬凑。
  // 纯函数（依赖注入 rel / catOf），便于 tools 对拍测试，不碰任何运行时全局。

  const DISCRIM_TAGS = { '同类': 1, '对比': 1, '类比': 1 };
  const MAX_CLUSTER = 6; // 簇过大时切成小段，避免同类卡整章连排成「分块」

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

  // 辨析交错：相关卡聚成簇、簇内相邻出现；大簇切成小段；簇/单卡按章节轮转（同章不连续）
  function interleaveRelated(ids, rel, catOf) {
    const clusters = buildClusters(ids, rel);
    // 大簇切成小段（每段 ≤ MAX_CLUSTER），相关卡仍较近、又不至于整章连排
    const segments = [];
    clusters.forEach(function (cluster) {
      for (let i = 0; i < cluster.length; i += MAX_CLUSTER) {
        segments.push(cluster.slice(i, i + MAX_CLUSTER));
      }
    });
    const byCat = {};
    segments.forEach(function (seg) {
      const c = catOf(seg[0]) || '?';
      (byCat[c] = byCat[c] || []).push(seg);
    });
    const groups = Object.keys(byCat).map(function (k) { return shuffleArr(byCat[k]); });
    const out = [];
    let added = true;
    while (added) {
      added = false;
      for (let i = 0; i < groups.length; i++) {
        if (groups[i].length) {
          const seg = groups[i].shift();
          for (let j = 0; j < seg.length; j++) out.push(seg[j]);
          added = true;
        }
      }
    }
    return out;
  }

  export { DISCRIM_TAGS, MAX_CLUSTER, buildClusters, interleaveRelated };
