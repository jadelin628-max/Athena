  // ---------------- 交错练习 · 辨析聚类 ----------------
  // 原理：把「相关需辨析」的卡（REL 中 tag=同类/对比/类比）聚成簇、簇内相邻出现，
  //       簇与无关联的单卡再按章节轮转——只让「真有关系」的卡在一起，无关联的卡不硬凑。
  // 纯函数（依赖注入 rel / catOf），便于 tools 对拍测试，不碰任何运行时全局。

  const DISCRIM_TAGS = { '同类': 1, '对比': 1, '类比': 1 };

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

  // 辨析交错：相关卡聚成簇、簇内相邻出现；簇/单卡按章节轮转（同章不连续）
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
