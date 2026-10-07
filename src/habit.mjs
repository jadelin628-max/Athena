  // ---------------- 行动·习惯树（RSIP · V2-B + H1 今日结算） ----------------
  // 规格：docs/V2_PLAN.md §2.1/§10.1 + docs/ACT.md §5/§11。产品名「习惯树」。
  // 数据键 athena_act_v1.habits，与学习库隔离；组 athena_habit_groups_v1；设置 athena_act_cfg_v1（H4 同 schema）。
  // H1：删除 miss 语义——未检查=未完成；全员检完才「今日结算」；零点自动结算前一日。
  // 文案红线：形成中位数 66 天（Lally 2010，18–254），不说 21 天；坏习惯替换而非消灭。
  // 禁止：连击惩罚、物质/娱乐兑换。过程反馈仅内化条 / 强化位 / 次数。

  const HABIT_DOTS_DAYS = 7;
  const HABIT_TOLERANCE_DEFAULT = 1;
  const HABIT_INTERNALIZE_MAX = 100;
  const HABIT_DAILY_ADD_LIMIT = 1;
  const HABIT_DIFFICULTY_DEFAULT = 2;
  const HABIT_MIN_K_DEFAULT = 1;
  const HABIT_MIN_K_MAX = 99;
  const HABIT_LEVEL_MAX = 9;
  // 组配置独立键：避免被 actSanitize 剥掉，且与学习库隔离
  const HABIT_GROUPS_KEY = 'athena_habit_groups_v1';
  // H4 先行 schema：行动设置（缺省用现默认；键 athena_act_cfg_v1）
  const ACT_CFG_KEY = 'athena_act_cfg_v1';
  const HABIT_STATE_KEY = 'athena_habit_state_v1';
  const HABIT_CFG_DEFAULTS = {
    dailyAddLimit: 1,
    manualLevelPerDay: 1,
    manualLevelKeepRatio: 0.5,
    failInternalizePenalty: 15,
    autoSettle: true,
    levelSteps: null
  };
  // 强化自动升阈值：内化达到后 level 保底（手动可更高）
  const HABIT_LEVEL_STEPS = [
    { internalize: 50, level: 1 },
    { internalize: 100, level: 2 }
  ];

  // ---------------- 纯函数：模型与工具 ----------------
  function habitYmd(d) {
    const dt = d instanceof Date ? d : new Date(d);
    if (isNaN(dt.getTime())) return '';
    return dt.getFullYear() + '-' + String(dt.getMonth() + 1).padStart(2, '0') + '-' + String(dt.getDate()).padStart(2, '0');
  }

  function habitToday() {
    return habitYmd(new Date());
  }

  function habitParseYmd(ymd) {
    const s = String(ymd || '');
    if (!/^\d{4}-\d{2}-\d{2}$/.test(s)) return null;
    const d = new Date(s + 'T00:00:00');
    return isNaN(d.getTime()) ? null : d;
  }

  function habitToIdSet(doneSet) {
    const s = new Set();
    if (!doneSet) return s;
    if (doneSet instanceof Set) {
      doneSet.forEach(function (x) { s.add(String(x)); });
      return s;
    }
    if (Array.isArray(doneSet)) {
      doneSet.forEach(function (x) { s.add(String(x)); });
      return s;
    }
    if (typeof doneSet === 'object') {
      Object.keys(doneSet).forEach(function (k) { if (doneSet[k]) s.add(String(k)); });
    }
    return s;
  }

  function habitNormalizeDoneDates(arr) {
    const seen = {};
    const out = [];
    (Array.isArray(arr) ? arr : []).forEach(function (d) {
      const s = String(d == null ? '' : d);
      if (/^\d{4}-\d{2}-\d{2}$/.test(s) && !seen[s]) {
        seen[s] = 1;
        out.push(s);
      }
    });
    out.sort();
    return out;
  }

  function habitClampInternalize(v) {
    const n = Number(v);
    if (!Number.isFinite(n)) return 0;
    return Math.max(0, Math.min(HABIT_INTERNALIZE_MAX, Math.round(n)));
  }

  // ---------------- 组（HabitGroup · minK 容错名额） ----------------
  // 组键：groupId 优先，否则 tag；无键节点各自为单人组。
  function habitGroupKey(n) {
    if (!n) return '';
    const g = n.groupId == null || n.groupId === '' ? '' : String(n.groupId).trim();
    if (g) return g;
    return String(n.tag == null ? '' : n.tag).trim();
  }

  function habitClampMinK(v) {
    const n = Number(v);
    if (!Number.isFinite(n)) return HABIT_MIN_K_DEFAULT;
    return Math.max(0, Math.min(HABIT_MIN_K_MAX, Math.floor(n)));
  }

  function habitSanitizeGroups(raw) {
    const src = Array.isArray(raw) ? raw : [];
    const out = [];
    const seen = {};
    src.forEach(function (x) {
      if (!x || typeof x !== 'object') return;
      const id = String(x.id == null ? '' : x.id).trim();
      if (!id || seen[id]) return;
      seen[id] = 1;
      const nameRaw = String(x.name == null ? '' : x.name).trim();
      out.push({
        id: id,
        name: nameRaw || id,
        color: x.color == null || x.color === '' ? null : String(x.color),
        minK: habitClampMinK(x.minK)
      });
    });
    return out;
  }

  // 取组 minK；未配置或单人组用默认 1
  function habitMinKOf(groups, key) {
    const k = String(key == null ? '' : key).trim();
    if (!k) return HABIT_MIN_K_DEFAULT;
    const hit = habitSanitizeGroups(groups).filter(function (g) { return g.id === k; })[0];
    return hit ? hit.minK : HABIT_MIN_K_DEFAULT;
  }

  function habitSetGroupMinK(groups, id, minK) {
    const list = habitSanitizeGroups(groups);
    const sid = String(id == null ? '' : id).trim();
    if (!sid) return { groups: list, ok: false, reason: 'bad-id', group: null };
    const mk = habitClampMinK(minK);
    let hit = list.filter(function (g) { return g.id === sid; })[0];
    if (hit) {
      hit.minK = mk;
    } else {
      hit = { id: sid, name: sid, color: null, minK: mk };
      list.push(hit);
    }
    return { groups: list, ok: true, group: hit };
  }

  function habitUpsertGroup(groups, patch) {
    const list = habitSanitizeGroups(groups);
    const p = patch || {};
    const sid = String(p.id == null ? '' : p.id).trim();
    if (!sid) return { groups: list, ok: false, reason: 'bad-id', group: null };
    let hit = list.filter(function (g) { return g.id === sid; })[0];
    if (!hit) {
      hit = { id: sid, name: sid, color: null, minK: HABIT_MIN_K_DEFAULT };
      list.push(hit);
    }
    if (p.name != null) hit.name = String(p.name).trim() || hit.id;
    if (p.color !== undefined) hit.color = p.color == null || p.color === '' ? null : String(p.color);
    if (p.minK != null) hit.minK = habitClampMinK(p.minK);
    return { groups: list, ok: true, group: hit };
  }

  // 供 UI：节点上的组汇总（key/name/成员/完成/minK）
  function habitGroupSummaries(nodes, groups, date) {
    const ymd = String(date || habitToday());
    const tree = habitOnTree(habitSanitize(nodes));
    const cfg = habitSanitizeGroups(groups);
    const byKey = {};
    tree.forEach(function (n) {
      const key = habitGroupKey(n);
      if (!key) return;
      if (!byKey[key]) {
        const hit = cfg.filter(function (g) { return g.id === key; })[0];
        byKey[key] = {
          id: key,
          name: hit ? hit.name : key,
          color: hit ? hit.color : null,
          minK: hit ? hit.minK : HABIT_MIN_K_DEFAULT,
          members: [],
          lit: 0,
          over: 0
        };
      }
      byKey[key].members.push(n.id);
      if (habitCheckStatus(n, ymd) === 'done') byKey[key].lit += 1;
      else byKey[key].over += 1;
    });
    return Object.keys(byKey).map(function (k) { return byKey[k]; });
  }

  // ---------------- 设置（H4 先行 schema） ----------------
  function habitNormalizeLevelSteps(raw) {
    if (!Array.isArray(raw) || !raw.length) return HABIT_LEVEL_STEPS.slice();
    const out = [];
    raw.forEach(function (s) {
      if (!s || typeof s !== 'object') return;
      const iv = habitClampInternalize(s.internalize);
      const lv = habitClampLevel(s.level);
      if (lv > 0) out.push({ internalize: iv, level: lv });
    });
    if (!out.length) return HABIT_LEVEL_STEPS.slice();
    out.sort(function (a, b) { return a.internalize - b.internalize; });
    return out;
  }

  function habitNormalizeCfg(raw) {
    const src = raw && typeof raw === 'object' ? raw : {};
    const d = HABIT_CFG_DEFAULTS;
    const lim = Number(src.dailyAddLimit);
    const mpd = Number(src.manualLevelPerDay);
    const ratio = Number(src.manualLevelKeepRatio);
    const pen = Number(src.failInternalizePenalty);
    return {
      dailyAddLimit: Number.isFinite(lim) && lim >= 1 ? Math.floor(lim) : d.dailyAddLimit,
      manualLevelPerDay: Number.isFinite(mpd) && mpd >= 0 ? Math.floor(mpd) : d.manualLevelPerDay,
      manualLevelKeepRatio: Number.isFinite(ratio) && ratio >= 0 && ratio <= 1 ? ratio : d.manualLevelKeepRatio,
      failInternalizePenalty: Number.isFinite(pen) && pen >= 0 ? Math.min(HABIT_INTERNALIZE_MAX, Math.round(pen)) : d.failInternalizePenalty,
      autoSettle: src.autoSettle == null ? d.autoSettle : !!src.autoSettle,
      levelSteps: habitNormalizeLevelSteps(src.levelSteps)
    };
  }

  function habitLoadCfg() {
    if (typeof window !== 'undefined' && window.__habitCfg) return habitNormalizeCfg(window.__habitCfg);
    let raw = null;
    try { raw = JSON.parse(localStorage.getItem('athena_act_cfg_v1')); } catch (e) {}
    const cfg = habitNormalizeCfg(raw);
    if (typeof window !== 'undefined') window.__habitCfg = cfg;
    return cfg;
  }

  // ---------------- 检查态（done / undone / unchecked；无 miss 计数） ----------------
  // doneDates=已完成；missDates=明确标未完成；两者皆无=未检查。
  function habitCheckStatus(node, ymd) {
    const d = String(ymd || habitToday());
    if (!node) return 'unchecked';
    const done = Array.isArray(node.doneDates) ? node.doneDates : [];
    const miss = Array.isArray(node.missDates) ? node.missDates : [];
    if (done.indexOf(d) >= 0) return 'done';
    if (miss.indexOf(d) >= 0) return 'undone';
    return 'unchecked';
  }

  // status: 'done' | 'undone' | 'unchecked'（清空当日检查）
  function habitSetCheck(nodes, id, status, ymd, now) {
    const list = habitCloneNodes(nodes);
    const hit = habitFind(list, id);
    if (!hit) return { nodes: list, ok: false, reason: 'missing', node: null };
    if (hit.removedAt) return { nodes: list, ok: false, reason: 'removed', node: hit };
    const d = String(ymd || habitToday());
    const ts = Number(now) || Date.now();
    const st = status === 'done' || status === 'undone' || status === 'unchecked' ? status : 'unchecked';
    hit.doneDates = habitNormalizeDoneDates((hit.doneDates || []).filter(function (x) { return x !== d; }));
    hit.missDates = habitNormalizeDoneDates((hit.missDates || []).filter(function (x) { return x !== d; }));
    if (st === 'done') hit.doneDates.push(d);
    if (st === 'undone') hit.missDates.push(d);
    hit.doneDates = habitNormalizeDoneDates(hit.doneDates);
    hit.missDates = habitNormalizeDoneDates(hit.missDates);
    hit.updatedAt = ts;
    return { nodes: list, ok: true, node: hit, status: st };
  }

  // 全员检查完才可结算
  function habitAllChecked(nodes, ymd) {
    const d = String(ymd || habitToday());
    const tree = habitOnTree(habitSanitize(nodes));
    const unchecked = [];
    tree.forEach(function (n) {
      if (habitCheckStatus(n, d) === 'unchecked') unchecked.push(n.id);
    });
    return { ok: unchecked.length === 0, unchecked: unchecked, total: tree.length };
  }

  // ---------------- 结算状态（已结算日 + 手动强化次数） ----------------
  function habitDefaultState() {
    return { settledDates: [], manualLevelOn: null, manualLevelCount: 0, manualLevelIds: [] };
  }

  function habitNormalizeState(raw) {
    const out = habitDefaultState();
    if (!raw || typeof raw !== 'object') return out;
    const seen = {};
    (Array.isArray(raw.settledDates) ? raw.settledDates : []).forEach(function (d) {
      const s = String(d == null ? '' : d);
      if (/^\d{4}-\d{2}-\d{2}$/.test(s) && !seen[s]) {
        seen[s] = 1;
        out.settledDates.push(s);
      }
    });
    out.settledDates.sort();
    out.manualLevelOn = /^\d{4}-\d{2}-\d{2}$/.test(String(raw.manualLevelOn || '')) ? String(raw.manualLevelOn) : null;
    const mc = Number(raw.manualLevelCount);
    out.manualLevelCount = Number.isFinite(mc) && mc > 0 ? Math.floor(mc) : 0;
    out.manualLevelIds = Array.isArray(raw.manualLevelIds)
      ? raw.manualLevelIds.map(function (x) { return String(x); }).filter(Boolean)
      : [];
    return out;
  }

  function habitLoadState() {
    if (typeof window !== 'undefined' && window.__habitState) return habitNormalizeState(window.__habitState);
    let raw = null;
    try { raw = JSON.parse(localStorage.getItem(HABIT_STATE_KEY)); } catch (e) {}
    const st = habitNormalizeState(raw);
    if (typeof window !== 'undefined') window.__habitState = st;
    return st;
  }

  function habitSaveState(state) {
    const st = habitNormalizeState(state);
    if (typeof window !== 'undefined') window.__habitState = st;
    try { localStorage.setItem(HABIT_STATE_KEY, JSON.stringify(st)); } catch (e) {}
    return st;
  }

  function habitSanitize(raw) {
    const src = Array.isArray(raw) ? raw : [];
    const out = [];
    const seen = {};
    src.forEach(function (x, idx) {
      if (!x || typeof x !== 'object') return;
      let id = String(x.id == null ? '' : x.id).trim();
      if (!id) id = 'hab_' + Date.now() + '_' + idx + '_' + Math.floor(Math.random() * 10000);
      if (seen[id]) return;
      seen[id] = 1;
      const tolRaw = Number(x.toleranceDays);
      const missRaw = Number(x.missCount);
      const diffRaw = Number(x.difficulty);
      const levelRaw = Number(x.level);
      const failRaw = Number(x.failCount);
      // 旧数据无 onTree：未硬删则视为在树上（迁移兼容）
      const onTree = x.onTree == null ? !x.removedAt : !!x.onTree;
      out.push({
        id: id,
        title: String(x.title == null ? '' : x.title).trim(),
        detail: String(x.detail == null ? '' : x.detail).trim(),
        parentId: x.parentId == null || x.parentId === '' ? null : String(x.parentId),
        groupId: x.groupId == null || x.groupId === '' ? null : String(x.groupId),
        tag: String(x.tag == null ? '' : x.tag).trim(),
        difficulty: Number.isFinite(diffRaw) && diffRaw >= 1 && diffRaw <= 5 ? Math.floor(diffRaw) : HABIT_DIFFICULTY_DEFAULT,
        level: habitClampLevel(levelRaw),
        internalize: habitClampInternalize(x.internalize),
        onTree: onTree,
        lastOk: /^\d{4}-\d{2}-\d{2}$/.test(String(x.lastOk || '')) ? String(x.lastOk) : null,
        failCount: Number.isFinite(failRaw) && failRaw > 0 ? Math.floor(failRaw) : 0,
        addedOn: /^\d{4}-\d{2}-\d{2}$/.test(String(x.addedOn || '')) ? String(x.addedOn) : null,
        toleranceDays: Number.isFinite(tolRaw) && tolRaw >= 0 ? Math.floor(tolRaw) : HABIT_TOLERANCE_DEFAULT,
        missCount: Number.isFinite(missRaw) && missRaw > 0 ? Math.floor(missRaw) : 0,
        doneDates: habitNormalizeDoneDates(x.doneDates),
        missDates: habitNormalizeDoneDates(x.missDates),
        createdAt: Number(x.createdAt) || 0,
        updatedAt: Number(x.updatedAt) || 0,
        removedAt: x.removedAt == null || x.removedAt === '' ? null : (Number(x.removedAt) || String(x.removedAt))
      });
    });
    const ids = {};
    out.forEach(function (n) { ids[n.id] = 1; });
    out.forEach(function (n) {
      if (n.parentId && !ids[n.parentId]) n.parentId = null;
    });
    return out;
  }

  function habitCloneNodes(nodes) {
    return habitSanitize(nodes).map(function (n) {
      return {
        id: n.id,
        title: n.title,
        detail: n.detail,
        parentId: n.parentId,
        groupId: n.groupId,
        tag: n.tag,
        difficulty: n.difficulty,
        level: n.level,
        internalize: n.internalize,
        onTree: n.onTree,
        lastOk: n.lastOk,
        failCount: n.failCount,
        addedOn: n.addedOn,
        toleranceDays: n.toleranceDays,
        missCount: n.missCount,
        doneDates: n.doneDates.slice(),
        missDates: (n.missDates || []).slice(),
        createdAt: n.createdAt,
        updatedAt: n.updatedAt,
        removedAt: n.removedAt
      };
    });
  }

  // 未硬删（含习惯库）
  function habitActive(nodes) {
    return (nodes || []).filter(function (n) { return n && !n.removedAt; });
  }

  // 在树上
  function habitOnTree(nodes) {
    return (nodes || []).filter(function (n) { return n && !n.removedAt && n.onTree; });
  }

  // 习惯库（未上树、未硬删）
  function habitLibrary(nodes) {
    return (nodes || []).filter(function (n) { return n && !n.removedAt && !n.onTree; });
  }

  function habitFind(nodes, id) {
    const sid = String(id);
    return (nodes || []).filter(function (n) { return n && n.id === sid; })[0] || null;
  }

  function habitChildrenOf(nodes, parentId, opts) {
    const onlyOnTree = !!(opts && opts.onTree);
    const pid = parentId == null ? null : String(parentId);
    return (nodes || []).filter(function (n) {
      if (!n || n.removedAt) return false;
      if (onlyOnTree && !n.onTree) return false;
      if (pid == null) return n.parentId == null;
      return n.parentId === pid;
    });
  }

  function habitDescendantIds(nodes, id) {
    const sid = String(id);
    const byParent = {};
    (nodes || []).forEach(function (n) {
      if (!n) return;
      const p = n.parentId == null ? '' : String(n.parentId);
      if (!byParent[p]) byParent[p] = [];
      byParent[p].push(String(n.id));
    });
    const out = [];
    const stack = [sid];
    const seen = {};
    seen[sid] = 1;
    while (stack.length) {
      const cur = stack.pop();
      const kids = byParent[cur] || [];
      kids.forEach(function (k) {
        if (seen[k]) return;
        seen[k] = 1;
        out.push(k);
        stack.push(k);
      });
    }
    return out;
  }

  function habitIsAncestorOf(nodes, maybeAncestorId, nodeId) {
    const anc = String(maybeAncestorId);
    return habitDescendantIds(nodes, anc).indexOf(String(nodeId)) >= 0;
  }

  function habitCanSetParent(nodes, id, parentId) {
    const sid = String(id);
    if (parentId == null || parentId === '') return true;
    const pid = String(parentId);
    if (pid === sid) return false;
    if (habitIsAncestorOf(nodes, sid, pid)) return false;
    return true;
  }

  /**
   * 拖拽改父级：把 dragId 拖到 targetId 上的合法性判定（纯函数，UI 与单测共用）。
   * habitCanDrop(nodes, dragId, targetId) → { ok, reason }
   * - ok=true  reason='ok'：targetId 可成为 dragId 的新父级（drop 后走 habitSetParent）。
   * - ok=false reason：
   *     'missing'        拖拽源不存在或已移除
   *     'unknown-target' 目标节点不存在或已移除
   *     'self'           拖到自己
   *     'descendant'     拖到自己的子孙（跨层级非法，会成环）
   *     'cycle'          habitCanSetParent 兜底拒绝（异常数据自环等）
   *     'same-parent'    目标已是当前父级：合法但无变化，UI 不落盘
   * 层级说明：树深度无上限（docs/ACT.md §5.1 未约束深度），故「层次不合法」= 自己/子孙这两种环；
   * 强化 level（HABIT_LEVEL_MAX）与树深度无关，不参与判定。规则语义与 habitCanSetParent 一致。
   */
  function habitCanDrop(nodes, dragId, targetId) {
    const src = habitFind(nodes, dragId);
    if (!src || src.removedAt) return { ok: false, reason: 'missing' };
    const dst = habitFind(nodes, targetId);
    if (!dst || dst.removedAt) return { ok: false, reason: 'unknown-target' };
    if (dst.id === src.id) return { ok: false, reason: 'self' };
    if (habitIsAncestorOf(nodes, src.id, dst.id)) return { ok: false, reason: 'descendant' };
    if (!habitCanSetParent(nodes, src.id, dst.id)) return { ok: false, reason: 'cycle' };
    const cur = src.parentId == null || src.parentId === '' ? null : String(src.parentId);
    if (cur === dst.id) return { ok: false, reason: 'same-parent' };
    return { ok: true, reason: 'ok' };
  }

  function habitUid(prefix) {
    return (prefix || 'hab') + '_' + Date.now() + '_' + Math.floor(Math.random() * 10000);
  }

  // 新建节点（默认进习惯库，onTree=false；返回新数组）
  function habitAddNode(nodes, fields, now) {
    const list = habitCloneNodes(nodes);
    const ts = Number(now) || Date.now();
    const f = fields || {};
    let parentId = f.parentId == null || f.parentId === '' ? null : String(f.parentId);
    if (parentId && !habitFind(list, parentId)) parentId = null;
    const tol = Number(f.toleranceDays);
    const diff = Number(f.difficulty);
    const level = Number(f.level);
    const node = {
      id: String(f.id || habitUid('hab')),
      title: String(f.title == null ? '' : f.title).trim(),
      detail: String(f.detail == null ? '' : f.detail).trim(),
      parentId: parentId,
      groupId: f.groupId == null || f.groupId === '' ? null : String(f.groupId),
      tag: String(f.tag == null ? '' : f.tag).trim(),
      difficulty: Number.isFinite(diff) && diff >= 1 && diff <= 5 ? Math.floor(diff) : HABIT_DIFFICULTY_DEFAULT,
      level: habitClampLevel(level),
      internalize: habitClampInternalize(f.internalize),
      onTree: !!f.onTree,
      lastOk: null,
      failCount: 0,
      addedOn: null,
      toleranceDays: Number.isFinite(tol) && tol >= 0 ? Math.floor(tol) : HABIT_TOLERANCE_DEFAULT,
      missCount: 0,
      doneDates: [],
      missDates: [],
      createdAt: ts,
      updatedAt: ts,
      removedAt: null
    };
    list.push(node);
    return { nodes: list, node: node };
  }

  // 编辑字段；改父级用 habitSetParent
  function habitUpdateNode(nodes, id, patch, now) {
    const list = habitCloneNodes(nodes);
    const hit = habitFind(list, id);
    if (!hit) return { nodes: list, node: null };
    const p = patch || {};
    const ts = Number(now) || Date.now();
    if (p.title != null) hit.title = String(p.title).trim();
    if (p.detail != null) hit.detail = String(p.detail).trim();
    if (p.tag != null) hit.tag = String(p.tag).trim();
    if (p.groupId != null) hit.groupId = p.groupId == null || p.groupId === '' ? null : String(p.groupId);
    if (p.toleranceDays != null) {
      const tol = Number(p.toleranceDays);
      hit.toleranceDays = Number.isFinite(tol) && tol >= 0 ? Math.floor(tol) : hit.toleranceDays;
    }
    if (p.difficulty != null) {
      const diff = Number(p.difficulty);
      if (Number.isFinite(diff) && diff >= 1 && diff <= 5) hit.difficulty = Math.floor(diff);
    }
    if (p.level != null) {
      hit.level = habitClampLevel(p.level);
    }
    hit.updatedAt = ts;
    return { nodes: list, node: hit };
  }

  function habitSetParent(nodes, id, parentId, now) {
    const list = habitCloneNodes(nodes);
    const hit = habitFind(list, id);
    if (!hit) return { nodes: list, ok: false, reason: 'missing' };
    const pid = parentId == null || parentId === '' ? null : String(parentId);
    if (pid && !habitFind(list, pid)) return { nodes: list, ok: false, reason: 'parent-missing' };
    if (!habitCanSetParent(list, hit.id, pid)) return { nodes: list, ok: false, reason: 'cycle' };
    hit.parentId = pid;
    hit.updatedAt = Number(now) || Date.now();
    return { nodes: list, ok: true, node: hit };
  }

  // 手动硬删 = 移除该节点及全部子孙（removedAt，级联）
  function habitDeleteNode(nodes, id, now) {
    const list = habitCloneNodes(nodes);
    const sid = String(id);
    const ts = Number(now) || Date.now();
    const doomed = {};
    doomed[sid] = 1;
    habitDescendantIds(list, sid).forEach(function (d) { doomed[d] = 1; });
    const removed = [];
    list.forEach(function (n) {
      if (n && doomed[n.id] && !n.removedAt) {
        n.removedAt = ts;
        n.onTree = false;
        n.updatedAt = ts;
        removed.push(n.id);
      }
    });
    return { nodes: list, removed: removed };
  }

  // ---------------- RSIP 纯函数 ----------------

  // 当日已入树次数（按 addedOn；含当日已失败回库的，名额不退还）
  function habitDailyAddCount(nodes, date) {
    const ymd = String(date || habitToday());
    return habitSanitize(nodes).filter(function (n) { return n.addedOn === ymd; }).length;
  }

  // 每日最多 N 个新节点入树（N 来自设置 dailyAddLimit）
  function habitCanAddToTree(nodes, date, cfg) {
    const limit = habitNormalizeCfg(cfg).dailyAddLimit;
    const addedToday = habitDailyAddCount(nodes, date);
    return {
      ok: addedToday < limit,
      addedToday: addedToday,
      limit: limit,
      reason: addedToday < limit ? null : 'daily-limit'
    };
  }

  /**
   * 入树（RSIP）：新建或把习惯库节点点亮到树上。
   * habitAddToTree(nodes, fields, date, now) → { nodes, ok, reason?, node?, promoted?, addedToday }
   * - 每日最多 HABIT_DAILY_ADD_LIMIT 个新节点上树（fields.id 已在库中 → 提升；否则新建并上树）。
   * - 已在树上的节点不可重复入树。
   */
  function habitAddToTree(nodes, fields, date, now) {
    const list = habitCloneNodes(nodes);
    const ymd = String(date || habitToday());
    const ts = Number(now) || Date.now();
    const f = fields || {};
    const can = habitCanAddToTree(list, ymd);
    const existingId = f.id == null || f.id === '' ? '' : String(f.id);

    if (existingId) {
      const hit = habitFind(list, existingId);
      if (hit && !hit.removedAt && hit.onTree) {
        return { nodes: list, ok: false, reason: 'already-on-tree', node: hit, addedToday: can.addedToday };
      }
    }

    if (!can.ok) {
      return { nodes: list, ok: false, reason: 'daily-limit', node: existingId ? habitFind(list, existingId) : null, addedToday: can.addedToday };
    }

    if (existingId) {
      const hit = habitFind(list, existingId);
      if (hit && !hit.removedAt) {
        hit.onTree = true;
        hit.addedOn = ymd;
        hit.updatedAt = ts;
        if (f.title != null) hit.title = String(f.title).trim();
        if (f.detail != null) hit.detail = String(f.detail).trim();
        if (f.tag != null) hit.tag = String(f.tag).trim();
        if (f.parentId !== undefined) {
          const pid = f.parentId == null || f.parentId === '' ? null : String(f.parentId);
          if (pid && habitFind(list, pid) && habitCanSetParent(list, hit.id, pid)) hit.parentId = pid;
          else if (pid == null) hit.parentId = null;
        }
        return { nodes: list, ok: true, promoted: true, node: hit, addedToday: can.addedToday + 1 };
      }
    }

    const created = habitAddNode(list, {
      id: existingId || undefined,
      title: f.title,
      detail: f.detail,
      parentId: f.parentId,
      groupId: f.groupId,
      tag: f.tag,
      difficulty: f.difficulty,
      level: f.level,
      internalize: f.internalize,
      toleranceDays: f.toleranceDays,
      onTree: true
    }, ts);
    const node = habitFind(created.nodes, created.node.id);
    if (node) {
      node.addedOn = ymd;
      node.onTree = true;
    }
    return { nodes: created.nodes, ok: true, promoted: false, node: node, addedToday: can.addedToday + 1 };
  }

  /**
   * 失败回滚（RSIP）：节点回习惯库，级联熄灭子孙；**内化进度保留**。
   * habitFailNode(nodes, id, now, opts) → { nodes, ok, reason?, failed[], cascaded[] }
   * - failed：本次判失败的节点；cascaded：被级联熄灭的子孙。
   * - 不写 removedAt（那是硬删）；仅 onTree=false，failCount 仅记在判败节点上。
   * - 强化：判败节点降级 1（opts.demote===false 可关）；子孙不连坐降级。
   */
  function habitFailNode(nodes, id, now, opts) {
    const list = habitCloneNodes(nodes);
    const sid = String(id);
    const ts = Number(now) || Date.now();
    const hit = habitFind(list, sid);
    if (!hit || hit.removedAt) return { nodes: list, ok: false, reason: 'missing', failed: [], cascaded: [] };

    const scope = {};
    scope[sid] = 1;
    habitDescendantIds(list, sid).forEach(function (d) { scope[d] = 1; });

    const failed = [];
    const cascaded = [];
    list.forEach(function (n) {
      if (!n || !scope[n.id] || n.removedAt) return;
      if (!n.onTree) return;
      n.onTree = false;
      // 内化进度失败不丢：不修改 internalize
      n.updatedAt = ts;
      if (n.id === sid) {
        n.failCount = (Number(n.failCount) || 0) + 1;
        n.level = habitDemoteLevel(n, opts);
        failed.push(n.id);
      } else {
        cascaded.push(n.id);
      }
    });
    return { nodes: list, ok: true, failed: failed, cascaded: cascaded };
  }

  /**
   * 内化更新（RSIP）：delta 可正可负，夹到 0..100。
   * habitUpdateInternalize(nodes, id, delta, now) → { nodes, ok, reason?, node }
   */
  function habitUpdateInternalize(nodes, id, delta, now) {
    const list = habitCloneNodes(nodes);
    const hit = habitFind(list, id);
    if (!hit) return { nodes: list, ok: false, reason: 'missing', node: null };
    const d = Number(delta);
    if (!Number.isFinite(d)) return { nodes: list, ok: false, reason: 'bad-delta', node: hit };
    hit.internalize = habitClampInternalize((Number(hit.internalize) || 0) + d);
    hit.updatedAt = Number(now) || Date.now();
    return { nodes: list, ok: true, node: hit };
  }

  // 履行成功时的内化增量（过程反馈，非交易奖励；难度低则略快）
  function habitInternalizeGain(node) {
    const diff = Math.min(5, Math.max(1, Number(node && node.difficulty) || HABIT_DIFFICULTY_DEFAULT));
    return diff <= 2 ? 2 : 1;
  }

  // ---------------- 强化 level（+n） ----------------
  function habitClampLevel(v) {
    const n = Number(v);
    if (!Number.isFinite(n)) return 0;
    return Math.max(0, Math.min(HABIT_LEVEL_MAX, Math.floor(n)));
  }

  // 按内化阈值的保底强化级（手动可更高；阈值可配）
  function habitLevelFloor(internalize, steps) {
    const iv = habitClampInternalize(internalize);
    const list = habitNormalizeLevelSteps(steps);
    let lv = 0;
    list.forEach(function (s) {
      if (iv >= s.internalize && s.level > lv) lv = s.level;
    });
    return habitClampLevel(lv);
  }

  // 履行成功后自动升：level = max(当前, 内化保底)
  function habitAutoLevelOnOk(node, steps) {
    const cur = habitClampLevel(node && node.level);
    return Math.max(cur, habitLevelFloor(node && node.internalize, steps));
  }

  // 失败降级 1（不连坐子孙）；可配开关，关闭时保持原级
  function habitDemoteLevel(node, opts) {
    const cur = habitClampLevel(node && node.level);
    const o = opts || {};
    if (o.demote === false) return cur;
    return Math.max(0, cur - 1);
  }

  // 手动升/降
  function habitLevelDelta(nodes, id, delta, now) {
    const list = habitCloneNodes(nodes);
    const hit = habitFind(list, id);
    if (!hit) return { nodes: list, ok: false, reason: 'missing', node: null };
    const d = Number(delta);
    if (!Number.isFinite(d)) return { nodes: list, ok: false, reason: 'bad-delta', node: hit };
    hit.level = habitClampLevel((habitClampLevel(hit.level) || 0) + Math.floor(d));
    hit.updatedAt = Number(now) || Date.now();
    return { nodes: list, ok: true, node: hit };
  }

  /**
   * 手动强化（H1）：每日有限次、仅 1 个习惯/次、内化按 keepRatio 保留。
   * habitManualLevelUp(nodes, id, date, now, opts) → { nodes, ok, reason?, node?, state, keepRatio }
   * - opts.cfg：设置；opts.state：结算状态（manualLevelOn/Count/Ids）。
   * - reason: missing | daily-limit | already-used
   */
  function habitManualLevelUp(nodes, id, date, now, opts) {
    const o = opts || {};
    const cfg = habitNormalizeCfg(o.cfg);
    const state = habitNormalizeState(o.state);
    const ymd = String(date || habitToday());
    const list = habitCloneNodes(nodes);
    const hit = habitFind(list, id);
    if (!hit || hit.removedAt) {
      return { nodes: list, ok: false, reason: 'missing', node: null, state: state, keepRatio: cfg.manualLevelKeepRatio };
    }
    const limit = cfg.manualLevelPerDay;
    if (limit <= 0) {
      return { nodes: list, ok: false, reason: 'daily-limit', node: hit, state: state, keepRatio: cfg.manualLevelKeepRatio };
    }
    // 同一习惯同日重复 → already-used（优先于名额判断，便于 UI 提示）
    if (state.manualLevelOn === ymd && state.manualLevelIds.indexOf(hit.id) >= 0) {
      return { nodes: list, ok: false, reason: 'already-used', node: hit, state: state, keepRatio: cfg.manualLevelKeepRatio };
    }
    const usedToday = state.manualLevelOn === ymd ? state.manualLevelCount : 0;
    if (usedToday >= limit) {
      return { nodes: list, ok: false, reason: 'daily-limit', node: hit, state: state, keepRatio: cfg.manualLevelKeepRatio };
    }
    const ts = Number(now) || Date.now();
    hit.level = habitClampLevel((habitClampLevel(hit.level) || 0) + 1);
    const keep = Math.max(0, Math.min(1, Number(cfg.manualLevelKeepRatio)));
    hit.internalize = habitClampInternalize(Math.round((Number(hit.internalize) || 0) * keep));
    hit.updatedAt = ts;
    const nextState = habitNormalizeState({
      settledDates: state.settledDates,
      manualLevelOn: ymd,
      manualLevelCount: state.manualLevelOn === ymd ? usedToday + 1 : 1,
      manualLevelIds: state.manualLevelOn === ymd ? state.manualLevelIds.concat([hit.id]) : [hit.id]
    });
    return { nodes: list, ok: true, node: hit, state: nextState, keepRatio: keep };
  }

  // 手动强化今日是否还能用
  function habitCanManualLevel(state, date, cfg) {
    const c = habitNormalizeCfg(cfg);
    const st = habitNormalizeState(state);
    const ymd = String(date || habitToday());
    const used = st.manualLevelOn === ymd ? st.manualLevelCount : 0;
    return {
      ok: c.manualLevelPerDay > 0 && used < c.manualLevelPerDay,
      used: used,
      limit: c.manualLevelPerDay,
      keepRatio: c.manualLevelKeepRatio,
      reason: c.manualLevelPerDay <= 0 || used >= c.manualLevelPerDay ? 'daily-limit' : null
    };
  }

  // 零点自动结算：补齐 lastSettle 到昨日的未结算日（未检查=未完成）
  function habitPendingSettleDates(state, today, minDate) {
    const st = habitNormalizeState(state);
    const settled = {};
    st.settledDates.forEach(function (d) { settled[d] = 1; });
    const start = habitParseYmd(minDate) || new Date(2020, 0, 1);
    const end = habitParseYmd(today) || new Date();
    const out = [];
    const cur = new Date(start.getFullYear(), start.getMonth(), start.getDate());
    const last = new Date(end.getFullYear(), end.getMonth(), end.getDate() - 1); // 昨日
    while (cur <= last) {
      const ymd = habitYmd(cur);
      if (!settled[ymd]) out.push(ymd);
      cur.setDate(cur.getDate() + 1);
    }
    return out;
  }

  // 累计次数 = doneDates 长度（过程反馈，非交易奖励）
  function habitDoneCount(node) {
    return node && Array.isArray(node.doneDates) ? node.doneDates.length : 0;
  }

  // 近 N 日点阵（默认 7）；endDate 为 YYYY-MM-DD
  function habitDots(node, endDate, days) {
    const n = days == null ? HABIT_DOTS_DAYS : Math.max(1, Math.floor(days));
    const end = habitParseYmd(endDate) || new Date();
    const set = {};
    ((node && node.doneDates) || []).forEach(function (d) { set[String(d)] = 1; });
    const out = [];
    for (let i = n - 1; i >= 0; i--) {
      const d = new Date(end.getFullYear(), end.getMonth(), end.getDate() - i);
      const ymd = habitYmd(d);
      out.push({ date: ymd, done: !!set[ymd] });
    }
    return out;
  }

  // 今日待检/完成（树上节点；H1：done / undone / unchecked）
  function habitDayStats(nodes, date) {
    const ymd = String(date || habitToday());
    const tree = habitOnTree(habitSanitize(nodes));
    let done = 0;
    let undone = 0;
    let unchecked = 0;
    tree.forEach(function (n) {
      const st = habitCheckStatus(n, ymd);
      if (st === 'done') done++;
      else if (st === 'undone') undone++;
      else unchecked++;
    });
    return {
      total: tree.length,
      done: done,
      undone: undone,
      unchecked: unchecked,
      due: tree.length - done
    };
  }

  // 标签/组：同 groupId 或同 tag 为一组；无键各自为组（ACT §5.3 + V2 §2.1 minK）
  function habitTagGroups(activeNodes) {
    const groups = [];
    const keyIndex = {};
    activeNodes.forEach(function (n) {
      const key = habitGroupKey(n);
      if (!key) {
        groups.push({ tag: '', key: '', members: [n] });
        return;
      }
      if (keyIndex[key] == null) {
        keyIndex[key] = groups.length;
        groups.push({ tag: key, key: key, members: [] });
      }
      groups[keyIndex[key]].members.push(n);
    });
    return groups;
  }

  /**
   * 结算预览（H1 · 纯函数，不改数据）。
   * habitSettlePreview(nodes, date, opts) → {
   *   allChecked, unchecked[], completed[], incomplete[], protected[], violations[], cascadedPreview[]
   * }
   * - 无 miss：树上节点当日「已完成 / 未完成」；未检查=未完成（violations 候选）。
   * - opts.doneSet 可显式指定完成集（自动结算历史日 / 单测）；缺省用检查态。
   * - 组保护：同组已完成数（点亮）≥ minK ⇒ 未完成成员受保护。
   */
  function habitSettlePreview(nodes, date, opts) {
    const o = opts || {};
    const dateStr = String(date || habitToday());
    const tree = habitOnTree(habitSanitize(nodes));
    const done = o.doneSet != null ? habitToIdSet(o.doneSet) : null;
    const groupsCfg = habitSanitizeGroups(o.groups);
    const completed = [];
    const incomplete = [];
    const unchecked = [];

    tree.forEach(function (n) {
      const isDone = done ? done.has(n.id) : habitCheckStatus(n, dateStr) === 'done';
      if (isDone) {
        completed.push(n.id);
        return;
      }
      if (!done && habitCheckStatus(n, dateStr) === 'unchecked') unchecked.push(n.id);
      incomplete.push(n.id);
    });

    const isDoneMap = {};
    completed.forEach(function (id) { isDoneMap[id] = 1; });
    const incompleteSet = {};
    incomplete.forEach(function (id) { incompleteSet[id] = 1; });

    const protectedIds = [];
    const violations = [];
    habitTagGroups(tree).forEach(function (g) {
      const minK = habitMinKOf(groupsCfg, g.key || g.tag);
      const lit = g.members.filter(function (n) { return isDoneMap[n.id]; });
      const over = g.members.filter(function (n) { return incompleteSet[n.id]; });
      if (!over.length) return;
      if (lit.length >= minK) {
        over.forEach(function (n) { protectedIds.push(n.id); });
      } else {
        over.forEach(function (n) { violations.push(n.id); });
      }
    });

    // 级联预览：违规根的子孙（无论是否完成）
    const cascadedPreview = [];
    const seen = {};
    violations.forEach(function (rid) {
      habitDescendantIds(tree, rid).forEach(function (d) {
        if (seen[d]) return;
        seen[d] = 1;
        cascadedPreview.push(d);
      });
    });

    return {
      allChecked: unchecked.length === 0,
      unchecked: unchecked,
      completed: completed,
      incomplete: incomplete,
      protected: protectedIds,
      violations: violations,
      cascadedPreview: cascadedPreview
    };
  }

  /**
   * 综合结算（H1）：全员检完后由「今日结算」调用；零点自动结算未检查=未完成。
   * habitSettleDay(nodes, date, now, opts) → { nodes, ...preview 字段, failed, cascaded, removed }
   * - 完成：内化+、强化自动升。
   * - 受保护未完成：不回库、不降级（只留在树上）。
   * - 违规未完成：回库 + 级联子孙 + 强化降 1 + failInternalizePenalty（默认 0=内化不丢）。
   * - 未检查视作未完成；单习惯不在结算外单独改写内化/强化。
   */
  function habitSettleDay(nodes, date, now, opts) {
    const list = habitCloneNodes(nodes);
    const dateStr = String(date || habitToday());
    const ts = Number(now) || Date.now();
    const o = opts || {};
    const cfg = habitNormalizeCfg(o.cfg);
    const preview = habitSettlePreview(list, dateStr, o);
    const steps = cfg.levelSteps;
    const doneMap = {};
    preview.completed.forEach(function (id) { doneMap[id] = 1; });
    const protectedMap = {};
    preview.protected.forEach(function (id) { protectedMap[id] = 1; });

    const completed = preview.completed.slice();
    const protectedIds = preview.protected.slice();

    // 完成 / 受保护：只调内化与强化
    list.forEach(function (n) {
      if (!n || n.removedAt || !n.onTree) return;
      if (doneMap[n.id]) {
        if (dateStr && n.doneDates.indexOf(dateStr) < 0) {
          n.doneDates.push(dateStr);
          n.doneDates = habitNormalizeDoneDates(n.doneDates);
        }
        n.missDates = habitNormalizeDoneDates((n.missDates || []).filter(function (x) { return x !== dateStr; }));
        n.lastOk = dateStr;
        n.internalize = habitClampInternalize((Number(n.internalize) || 0) + habitInternalizeGain(n));
        n.level = habitAutoLevelOnOk(n, steps);
        n.updatedAt = ts;
      } else if (protectedMap[n.id]) {
        // 组内保护：未完成但不回库；不扣内化、不降级
        if (dateStr && n.missDates.indexOf(dateStr) < 0) {
          n.missDates.push(dateStr);
          n.missDates = habitNormalizeDoneDates(n.missDates);
        }
        n.updatedAt = ts;
      }
    });

    // 违规：回库 + 级联 + 降级 + 内化罚（默认 0）
    const failed = [];
    const cascaded = [];
    const off = {};
    preview.violations.forEach(function (rid) {
      if (off[rid]) return;
      const scope = {};
      scope[rid] = 1;
      habitDescendantIds(list, rid).forEach(function (d) { scope[d] = 1; });
      list.forEach(function (n) {
        if (!n || !scope[n.id] || n.removedAt || off[n.id] || !n.onTree) return;
        n.onTree = false;
        if (dateStr && n.missDates.indexOf(dateStr) < 0 && n.doneDates.indexOf(dateStr) < 0) {
          n.missDates.push(dateStr);
          n.missDates = habitNormalizeDoneDates(n.missDates);
        }
        n.updatedAt = ts;
        off[n.id] = 1;
        if (n.id === rid) {
          n.failCount = (Number(n.failCount) || 0) + 1;
          n.level = habitDemoteLevel(n, o);
          if (cfg.failInternalizePenalty > 0) {
            n.internalize = habitClampInternalize((Number(n.internalize) || 0) - cfg.failInternalizePenalty);
          }
          failed.push(n.id);
        } else {
          cascaded.push(n.id);
        }
      });
    });

    return {
      nodes: list,
      allChecked: preview.allChecked,
      unchecked: preview.unchecked,
      completed: completed,
      incomplete: preview.incomplete,
      protected: protectedIds,
      violations: preview.violations,
      failed: failed,
      cascaded: cascaded,
      removed: failed.concat(cascaded),
      // 兼容旧字段名
      missed: preview.incomplete
    };
  }

  // 兼容旧测试/调用：语义已并入 habitSettleDay（无 miss 计数）
  function evaluateHabitDay(nodes, doneSet, date, now, opts) {
    return habitSettleDay(nodes, date, now, Object.assign({}, opts || {}, { doneSet: doneSet }));
  }

  // ---------------- SVG 导图布局（纯函数，可测） ----------------
  /**
   * habitMapLayout(nodes, opts) → { items, edges, width, height }
   * - opts.collapsed：{ nodeId: true } 折叠表；仅布局树上节点。
   * - items: { id,x,y,w,h,depth,title,internalize,level,hasChildren,collapsed,childCount }
   * - edges: { x1,y1,x2,y2,from,to }
   */
  function habitMapLayout(nodes, opts) {
    const o = opts || {};
    const collapsed = o.collapsed || {};
    const NODE_W = 168;
    const NODE_H = 52;
    const COL = 210;
    const ROW = 64;
    const PAD = 24;

    const tree = habitOnTree(habitSanitize(nodes));
    const byId = {};
    tree.forEach(function (n) { byId[n.id] = n; });

    const kids = {};
    tree.forEach(function (n) {
      const key = (n.parentId && byId[n.parentId]) ? n.parentId : '';
      if (!kids[key]) kids[key] = [];
      kids[key].push(n.id);
    });
    Object.keys(kids).forEach(function (k) {
      kids[k].sort(function (a, b) {
        const na = byId[a];
        const nb = byId[b];
        if (na.createdAt !== nb.createdAt) return na.createdAt - nb.createdAt;
        return a < b ? -1 : (a > b ? 1 : 0);
      });
    });

    const items = [];
    const edgePairs = [];
    let yCursor = PAD;
    let maxDepth = 0;

    function walk(id, depth) {
      const n = byId[id];
      const childIds = kids[id] || [];
      const isCollapsed = !!collapsed[id];
      const visibleKids = isCollapsed ? [] : childIds;
      let y;
      if (!visibleKids.length) {
        y = yCursor;
        yCursor += ROW;
      } else {
        const childYs = visibleKids.map(function (cid) { return walk(cid, depth + 1); });
        y = (childYs[0] + childYs[childYs.length - 1]) / 2;
      }
      if (depth > maxDepth) maxDepth = depth;
      items.push({
        id: id,
        x: PAD + depth * COL,
        y: y,
        w: NODE_W,
        h: NODE_H,
        depth: depth,
        title: n.title,
        internalize: Number(n.internalize) || 0,
        level: Number(n.level) || 0,
        hasChildren: childIds.length > 0,
        collapsed: isCollapsed,
        childCount: childIds.length
      });
      visibleKids.forEach(function (cid) {
        edgePairs.push({ from: id, to: cid });
      });
      return y;
    }

    (kids[''] || []).forEach(function (id) { walk(id, 0); });

    const byMap = {};
    items.forEach(function (it) { byMap[it.id] = it; });
    const edges = edgePairs.map(function (e) {
      const a = byMap[e.from];
      const b = byMap[e.to];
      return {
        from: e.from,
        to: e.to,
        x1: a.x + a.w,
        y1: a.y + a.h / 2,
        x2: b.x,
        y2: b.y + b.h / 2
      };
    });

    return {
      items: items,
      edges: edges,
      width: PAD * 2 + (maxDepth + 1) * COL,
      height: Math.max(yCursor + PAD, 120)
    };
  }

  // ---------------- 会话级 UI 状态（不落盘） ----------------
  const habitCollapsed = {};
  let habitSelectedId = null;
  let habitDotsDays = HABIT_DOTS_DAYS; // 点阵预览 7 日，可展开 30
  let habitCheckLog = null;

  function habitLoadNodes() {
    const d = loadAct();
    return habitSanitize(d.habits);
  }

  function habitSaveNodes(nodes) {
    const d = loadAct();
    d.habits = habitSanitize(nodes);
    saveAct(d);
    return d.habits;
  }

  // 组配置（minK）独立键读写；纯函数已可测，此处仅 UI 落盘
  function habitLoadGroups() {
    if (typeof window !== 'undefined' && window.__habitGroups) return habitSanitizeGroups(window.__habitGroups);
    let raw = null;
    try { raw = JSON.parse(localStorage.getItem(HABIT_GROUPS_KEY)); } catch (e) {}
    const groups = habitSanitizeGroups(raw);
    if (typeof window !== 'undefined') window.__habitGroups = groups;
    return groups;
  }

  function habitSaveGroups(groups) {
    const g = habitSanitizeGroups(groups);
    if (typeof window !== 'undefined') window.__habitGroups = g;
    try { localStorage.setItem(HABIT_GROUPS_KEY, JSON.stringify(g)); } catch (e) {}
    return g;
  }

  function habitDoneSetFor(nodes, ymd) {
    const set = new Set();
    (nodes || []).forEach(function (n) {
      if (!n || n.removedAt) return;
      if ((n.doneDates || []).indexOf(ymd) >= 0) set.add(n.id);
    });
    return set;
  }

  function habitSvgEl(tag, attrs) {
    const e = document.createElementNS('http://www.w3.org/2000/svg', tag);
    if (attrs) Object.keys(attrs).forEach(function (k) {
      if (attrs[k] != null) e.setAttribute(k, String(attrs[k]));
    });
    return e;
  }

  function habitTruncate(s, n) {
    const t = String(s == null ? '' : s);
    return t.length > n ? t.slice(0, n - 1) + '…' : t;
  }

  // ---------------- 习惯树 UI ----------------
  function renderHabitSection(wrap) {
    habitRunAutoSettle();
    const nodes = habitLoadNodes();
    const today = habitToday();
    const cfg = habitLoadCfg();
    const stats = habitDayStats(nodes, today);
    const canAdd = habitCanAddToTree(nodes, today, cfg);
    const lib = habitLibrary(nodes);
    const checkGate = habitAllChecked(nodes, today);

    const head = el('div', 'act-section-head');
    head.appendChild(el('h3', null, '习惯树 · 导图'));
    const addBtn = el('button', 'btn primary', '＋ 入树');
    addBtn.addEventListener('click', function () {
      if (!canAdd.ok) {
        toast('今日入树名额已用完（每日最多 ' + canAdd.limit + ' 个），明天再来');
        return;
      }
      habitOpenEditor(null, 'promote', habitSelectedId);
    });
    head.appendChild(addBtn);
    wrap.appendChild(head);

    const toolbar = el('div', 'habit-toolbar');
    toolbar.appendChild(el('div', 'muted',
      '今日入树 ' + canAdd.addedToday + '/' + canAdd.limit +
      ' · 已完成 ' + stats.done + '/' + stats.total +
      ' · 习惯库 ' + lib.length
    ));
    const settleBtn = el('button', 'btn primary' + (checkGate.ok ? '' : ' disabled'),
      checkGate.ok ? '今日结算' : '先检查完 ' + checkGate.unchecked.length + ' 项');
    if (checkGate.ok) {
      settleBtn.addEventListener('click', function () { habitConfirmSettle(); });
    }
    toolbar.appendChild(settleBtn);
    wrap.appendChild(toolbar);

    if (habitCheckLog) {
      const log = el('div', 'act-panel habit-check-log');
      log.appendChild(el('div', 'act-ifthen-main', '上次今日结算（' + (habitCheckLog.date || today) + '）'));
      log.appendChild(el('div', 'muted',
        '完成 ' + (habitCheckLog.completed || []).length +
        ' · 未完成 ' + (habitCheckLog.incomplete || []).length +
        ' · 回库 ' + (habitCheckLog.failed || []).length +
        ' · 级联 ' + (habitCheckLog.cascaded || []).length +
        (habitCheckLog.protected && habitCheckLog.protected.length ? ' · 组保护 ' + habitCheckLog.protected.length : '')
      ));
      wrap.appendChild(log);
    }

    const mapBox = el('div', 'habit-map-box');
    const treeNodes = habitOnTree(nodes);
    if (!treeNodes.length) {
      const empty = el('div', 'act-panel');
      empty.appendChild(illus('empty-habit'));
      empty.appendChild(el('p', null, '树上还没有习惯。从一个小而稳定的动作开始，今日入树 1 条即可。'));
      wrap.appendChild(empty);
    } else {
      mapBox.appendChild(habitRenderSvgMap(nodes));
      wrap.appendChild(mapBox);
    }

    // 当日检查清单（已完成 / 未完成）
    if (treeNodes.length) {
      wrap.appendChild(habitRenderChecklist(nodes, today));
    }

    // Inspector
    const sel = habitSelectedId ? habitFind(nodes, habitSelectedId) : null;
    if (sel && !sel.removedAt) {
      wrap.appendChild(habitRenderInspector(sel, nodes));
    }

    // 组容错 minK（仅组列表）
    wrap.appendChild(habitRenderGroupsPanel(nodes, today));

    // 习惯库
    const libHead = el('div', 'act-section-head');
    libHead.appendChild(el('h3', null, '习惯库'));
    const newLib = el('button', 'btn', '＋ 新建习惯');
    newLib.addEventListener('click', function () { habitOpenEditor(null, 'library', null); });
    libHead.appendChild(newLib);
    wrap.appendChild(libHead);

    if (!lib.length) {
      const emptyLib = el('div', 'act-panel');
      emptyLib.appendChild(el('p', 'muted', '习惯库为空。违规回库的习惯会出现在这里，内化进度按设置保留。'));
      wrap.appendChild(emptyLib);
    } else {
      const listBox = el('div', 'habit-lib');
      lib.forEach(function (n) {
        listBox.appendChild(habitLibRow(n, nodes, canAdd.ok));
      });
      wrap.appendChild(listBox);
    }
    // 规则说明在「帮助」（H5），此处不再堆长文
  }

  function habitRenderChecklist(nodes, ymd) {
    const panel = el('div', 'act-panel habit-checklist');
    panel.appendChild(el('div', 'act-ifthen-main', '今日检查'));
    const tree = habitOnTree(nodes);
    const list = el('div', 'habit-check-list');
    tree.forEach(function (n) {
      const st = habitCheckStatus(n, ymd);
      const row = el('div', 'habit-check-row' + (st === 'done' ? ' is-done' : st === 'undone' ? ' is-undone' : ''));
      const main = el('div', 'habit-check-main');
      main.appendChild(el('div', 'habit-node-title', n.title || '（未命名）'));
      const stLabel = st === 'done' ? '已完成' : st === 'undone' ? '未完成' : '未检查';
      main.appendChild(el('div', 'muted', stLabel + ' · 内化 ' + n.internalize + '% · 强化 +' + n.level));
      row.appendChild(main);

      const btns = el('div', 'habit-node-btns');
      const doneBtn = el('button', 'btn small' + (st === 'done' ? ' primary' : ''), '已完成');
      doneBtn.addEventListener('click', function () { habitSetCheckUi(n.id, 'done'); });
      btns.appendChild(doneBtn);
      const undoneBtn = el('button', 'btn small' + (st === 'undone' ? ' danger' : ''), '未完成');
      undoneBtn.addEventListener('click', function () { habitSetCheckUi(n.id, 'undone'); });
      btns.appendChild(undoneBtn);
      row.appendChild(btns);
      list.appendChild(row);
    });
    panel.appendChild(list);
    return panel;
  }

  function habitSetCheckUi(id, status) {
    const r = habitSetCheck(habitLoadNodes(), id, status, habitToday(), Date.now());
    if (!r.ok) { toast('操作失败'); return; }
    habitSaveNodes(r.nodes);
    renderApp();
  }

  function habitRenderGroupsPanel(nodes, date) {
    const panel = el('div', 'act-panel habit-groups-panel');
    panel.appendChild(el('div', 'act-ifthen-main', '组容错 · minK'));
    const groups = habitLoadGroups();
    const summaries = habitGroupSummaries(nodes, groups, date);
    if (!summaries.length) {
      panel.appendChild(el('p', 'muted', '还没有带标签/组的习惯。给节点加同名标签即可组成保护组。'));
      return panel;
    }
    const list = el('div', 'habit-group-list');
    summaries.forEach(function (g) {
      const row = el('div', 'habit-group-row');
      const main = el('div', 'habit-group-main');
      main.appendChild(el('div', 'habit-group-name', g.name));
      main.appendChild(el('div', 'muted',
        '成员 ' + g.members.length + ' · 已完成 ' + g.lit + ' · 未完成 ' + g.over
      ));
      row.appendChild(main);

      const mkWrap = el('div', 'habit-group-mink');
      mkWrap.appendChild(el('span', 'mini-label', 'minK'));
      const input = el('input', 'wrong-input habit-mink-input');
      input.type = 'number';
      input.min = '0';
      input.max = String(HABIT_MIN_K_MAX);
      input.step = '1';
      input.value = String(g.minK);
      input.addEventListener('change', function () {
        const r = habitSetGroupMinK(habitLoadGroups(), g.id, Number(input.value));
        if (!r.ok) { toast('minK 保存失败'); return; }
        habitSaveGroups(r.groups);
        renderApp();
        toast('「' + g.name + '」minK = ' + r.group.minK);
      });
      mkWrap.appendChild(input);
      row.appendChild(mkWrap);
      list.appendChild(row);
    });
    panel.appendChild(list);
    panel.appendChild(el('div', 'muted', '组内已完成数 ≥ minK 时，未完成成员受组内保护，不因本次结算回库。'));
    return panel;
  }

  // ---------------- 拖拽改父级（仅加交互；层级/内化/结算/容忍天数规则语义不动） ----------------
  // 为什么不用 HTML5 DnD（focus 树那套 draggable/dragstart）：导图节点是 SVG <g>，Chromium
  // 不派发 SVG 元素上的 dragstart（focus 树是 div 行才行）；Pointer Events 对鼠标/手写笔一致可用。
  // 触屏刻意不启动拖拽（会抢页面滚动）：移动端与无障碍沿用 Inspector 里既有的「改父级」下拉。
  // 临时高亮一律 inline style（禁改 style.css）：合法目标 = accent 虚框，非法目标 = danger 虚框。
  const HABIT_DRAG_THRESHOLD = 5;
  const habitDrag = {
    srcId: null, active: false, x0: 0, y0: 0,
    targetId: null, targetRect: null, sourceEl: null
  };
  let habitDragEndedAt = 0; // 拖拽结束后 400ms 内屏蔽 click，避免拖完误改「选中」
  let habitDragIgnoreMouse = false; // 触屏 pointerdown 之后的兼容 mousedown：吃掉，别起拖拽

  function habitDragMsg(reason) {
    if (reason === 'self') return '不能把节点挂到自己下';
    if (reason === 'descendant') return '不能把节点挂到自己的子孙下（会成环）';
    if (reason === 'unknown-target') return '目标节点不存在';
    if (reason === 'same-parent') return '它已经是该父级的子节点';
    return '不能把节点挂到自己或子孙下';
  }

  function habitDragClearTarget() {
    if (habitDrag.targetRect && habitDrag.targetRect.style) {
      habitDrag.targetRect.style.removeProperty('stroke');
      habitDrag.targetRect.style.removeProperty('stroke-width');
      habitDrag.targetRect.style.removeProperty('stroke-dasharray');
    }
    habitDrag.targetRect = null;
    habitDrag.targetId = null;
  }

  function habitDragDetach() {
    document.removeEventListener('pointermove', habitDragOnMove);
    document.removeEventListener('mousemove', habitDragOnMove);
    document.removeEventListener('pointerup', habitDragOnUp);
    document.removeEventListener('mouseup', habitDragOnUp);
    document.removeEventListener('pointercancel', habitDragOnCancel);
  }

  // 收尾：apply=false（pointercancel）只清理不改数据
  function habitDragFinish(apply) {
    if (!habitDrag.srcId) { habitDragDetach(); return; }
    const src = habitDrag.srcId;
    const moved = habitDrag.active;
    const targetId = habitDrag.targetId;
    if (habitDrag.sourceEl && habitDrag.sourceEl.style) {
      habitDrag.sourceEl.style.removeProperty('opacity');
      habitDrag.sourceEl.style.removeProperty('user-select');
      habitDrag.sourceEl.style.removeProperty('-webkit-user-select');
    }
    document.body.style.cursor = '';
    habitDragClearTarget();
    habitDragDetach();
    habitDrag.srcId = null;
    habitDrag.active = false;
    habitDrag.sourceEl = null;
    if (!moved || !apply) return; // 未超阈值＝点击，交给原 click 选中逻辑
    habitDragEndedAt = Date.now();
    if (!targetId) return; // 丢在空白处：静默，不改父级
    const chk = habitCanDrop(habitLoadNodes(), src, targetId);
    if (!chk.ok) { toast(habitDragMsg(chk.reason)); return; }
    const r = habitSetParent(habitLoadNodes(), src, targetId, Date.now());
    if (!r.ok) {
      toast(r.reason === 'cycle' ? '不能把节点挂到自己或子孙下' : '父节点不存在');
      renderApp();
      return;
    }
    habitSaveNodes(r.nodes);
    habitSelectedId = src;
    const dst = habitFind(r.nodes, targetId);
    toast('已调整父级 → ' + habitTruncate((dst && dst.title) || targetId, 12));
    renderApp();
  }

  function habitDragStart(id, ev) {
    if (!id || !ev) return;
    if (ev.button) return; // 仅主键/主指针
    if (ev.target && ev.target.closest && ev.target.closest('.habit-map-fold')) return; // 折叠钮不拖
    // 触屏不启动拖拽：不抢页面滚动（不动 touch-action），移动端沿用既有「改父级」下拉兜底。
    // 触屏序列随后还会派发兼容 mousedown，用标记位吃掉它，避免又起一次拖拽。
    if (ev.type === 'pointerdown') {
      if (ev.pointerType && ev.pointerType !== 'mouse' && ev.pointerType !== 'pen') { habitDragIgnoreMouse = true; return; }
      habitDragIgnoreMouse = false;
    } else if (ev.type === 'mousedown' && habitDragIgnoreMouse) {
      return;
    }
    // 关键：在 mousedown 上阻止默认行为，否则「按下 + 移动」会起手原生文本选择/拖放，
    // 浏览器随即发 pointercancel 把我们的拖拽静默打断（headless 实测踩到过：cancel=1、无高亮无 toast）。
    // 只对 mousedown preventDefault（不对 pointerdown：取消 pointerdown 可能连 click 一起吞掉，
    // 会破坏「未拖动＝点击选中」这条既有路径）；也不 stopPropagation，click 照常派发。
    if (ev.type === 'mousedown') ev.preventDefault();
    habitDrag.srcId = id;
    habitDrag.active = false;
    habitDrag.x0 = Number(ev.clientX) || 0;
    habitDrag.y0 = Number(ev.clientY) || 0;
    habitDrag.sourceEl = ev.currentTarget || null;
    if (habitDrag.sourceEl && habitDrag.sourceEl.style) {
      habitDrag.sourceEl.style.setProperty('user-select', 'none'); // 双保险：拖拽期间禁选中（inline，不动 style.css）
      habitDrag.sourceEl.style.setProperty('-webkit-user-select', 'none');
    }
    document.addEventListener('pointermove', habitDragOnMove);
    document.addEventListener('mousemove', habitDragOnMove);
    document.addEventListener('pointerup', habitDragOnUp);
    document.addEventListener('mouseup', habitDragOnUp);
    document.addEventListener('pointercancel', habitDragOnCancel);
  }

  function habitDragOnMove(ev) {
    if (!habitDrag.srcId || !ev) return;
    if (!habitDrag.active) {
      const dx = Number(ev.clientX) - habitDrag.x0;
      const dy = Number(ev.clientY) - habitDrag.y0;
      if (Math.abs(dx) + Math.abs(dy) < HABIT_DRAG_THRESHOLD) return;
      habitDrag.active = true;
      if (habitDrag.sourceEl && habitDrag.sourceEl.style) habitDrag.sourceEl.style.opacity = '0.45';
      document.body.style.cursor = 'grabbing';
    }
    let g = null;
    try {
      const under = document.elementFromPoint(ev.clientX, ev.clientY);
      g = under && under.closest ? under.closest('.habit-map-node') : null;
    } catch (e) { g = null; }
    const tid = g ? g.getAttribute('data-id') : null;
    if (tid === habitDrag.targetId) return; // 同一目标不必重画
    habitDragClearTarget();
    if (!g) return;
    const rect = g.querySelector ? g.querySelector('.habit-map-node-bg') : null;
    if (!rect || !rect.style) return;
    const ok = habitCanDrop(habitLoadNodes(), habitDrag.srcId, tid).ok;
    rect.style.stroke = ok ? 'var(--accent)' : 'var(--danger)';
    rect.style.strokeWidth = '2.5';
    rect.style.strokeDasharray = ok ? '5 3' : '2 4';
    habitDrag.targetRect = rect;
    habitDrag.targetId = tid;
  }

  function habitDragOnUp() { habitDragFinish(true); }
  function habitDragOnCancel() { habitDragFinish(false); }

  function habitRenderSvgMap(nodes) {
    const layout = habitMapLayout(nodes, { collapsed: habitCollapsed });
    const svg = habitSvgEl('svg', {
      viewBox: '0 0 ' + layout.width + ' ' + layout.height,
      width: '100%',
      height: String(Math.min(layout.height, 480)),
      class: 'habit-map'
    });
    svg.setAttribute('role', 'img');
    svg.setAttribute('aria-label', '习惯树导图');

    layout.edges.forEach(function (e) {
      const mx = (e.x1 + e.x2) / 2;
      const path = habitSvgEl('path', {
        d: 'M ' + e.x1 + ' ' + e.y1 + ' C ' + mx + ' ' + e.y1 + ', ' + mx + ' ' + e.y2 + ', ' + e.x2 + ' ' + e.y2,
        fill: 'none',
        stroke: 'var(--border)',
        'stroke-width': '1.5',
        'stroke-linecap': 'round',
        class: 'habit-map-edge'
      });
      svg.appendChild(path);
    });

    layout.items.forEach(function (it) {
      const g = habitSvgEl('g', {
        class: 'habit-map-node' + (habitSelectedId === it.id ? ' selected' : ''),
        'data-id': it.id,
        transform: 'translate(' + it.x + ',' + it.y + ')',
        cursor: 'pointer'
      });

      const rect = habitSvgEl('rect', {
        x: 0, y: 0, width: it.w, height: it.h, rx: 10,
        fill: 'var(--card)',
        stroke: habitSelectedId === it.id ? 'var(--accent)' : 'var(--border)',
        'stroke-width': habitSelectedId === it.id ? 2 : 1,
        class: 'habit-map-node-bg'
      });
      g.appendChild(rect);

      const title = habitSvgEl('text', {
        x: 12, y: 20,
        'font-size': '13',
        'font-weight': '600',
        fill: 'var(--text)',
        class: 'habit-map-title'
      });
      title.textContent = habitTruncate(it.title || '（未命名）', 12);
      g.appendChild(title);

      // 内化条
      const barW = it.w - 56;
      const barBg = habitSvgEl('rect', {
        x: 12, y: 32, width: barW, height: 6, rx: 3,
        fill: 'var(--border)', opacity: '0.45', class: 'habit-map-bar-bg'
      });
      g.appendChild(barBg);
      const fillW = Math.round(barW * (it.internalize / HABIT_INTERNALIZE_MAX));
      if (fillW > 0) {
        g.appendChild(habitSvgEl('rect', {
          x: 12, y: 32, width: fillW, height: 6, rx: 3,
          fill: 'var(--accent)', class: 'habit-map-bar-fill'
        }));
      }

      // 内化 0–100 + 强化 +n（两者都展示）
      const lv = habitSvgEl('text', {
        x: it.w - 12, y: 38,
        'font-size': '11',
        'text-anchor': 'end',
        fill: 'var(--muted)',
        class: 'habit-map-level'
      });
      lv.textContent = it.internalize + '%' + (it.level > 0 ? ' · +' + it.level : '');
      g.appendChild(lv);

      // 折叠钮
      if (it.hasChildren) {
        const fold = habitSvgEl('g', {
          class: 'habit-map-fold',
          transform: 'translate(' + (it.w - 10) + ',' + 10 + ')',
          cursor: 'pointer'
        });
        const fc = habitSvgEl('circle', {
          cx: 0, cy: 0, r: 8,
          fill: 'var(--bg)', stroke: 'var(--border)', 'stroke-width': 1
        });
        fold.appendChild(fc);
        const ft = habitSvgEl('text', {
          x: 0, y: 4,
          'font-size': '11',
          'text-anchor': 'middle',
          fill: 'var(--muted)'
        });
        ft.textContent = it.collapsed ? '+' : '−';
        fold.appendChild(ft);
        fold.addEventListener('click', function (ev) {
          ev.stopPropagation();
          if (habitCollapsed[it.id]) delete habitCollapsed[it.id];
          else habitCollapsed[it.id] = 1;
          renderApp();
        });
        g.appendChild(fold);
      }

      g.addEventListener('click', function () {
        if (Date.now() - habitDragEndedAt < 400) return; // 刚拖拽过：不当作选中点击
        habitSelectedId = it.id;
        renderApp();
      });

      // 拖拽改父级：把本节点拖到另一节点上 → 目标成为新父级（非法目标 drop 时 toast 拒绝）
      // 鼠标/手写笔拖拽；触屏不抢滚动，走 Inspector 里既有的「改父级」下拉兜底（无障碍同路径）。
      g.addEventListener('pointerdown', function (ev) { habitDragStart(it.id, ev); });
      g.addEventListener('mousedown', function (ev) { habitDragStart(it.id, ev); });

      const tip = habitSvgEl('title', {});
      tip.textContent = (it.title || '') + ' · 内化 ' + it.internalize + '% · 强化 +' + it.level +
        (it.childCount ? ' · 子项 ' + it.childCount : '') + ' · 拖动可改父级';
      g.appendChild(tip);

      svg.appendChild(g);
    });

    return svg;
  }

  function habitRenderInspector(node, allNodes) {
    const panel = el('div', 'act-panel habit-inspector');
    panel.appendChild(el('div', 'act-ifthen-main', '选中 · ' + (node.title || node.id)));

    const today = habitToday();
    const st = habitCheckStatus(node, today);
    const meta = el('div', 'habit-node-meta');
    meta.appendChild(el('span', null, '今日 ' + (st === 'done' ? '已完成' : st === 'undone' ? '未完成' : '未检查')));
    meta.appendChild(el('span', null, '内化 ' + node.internalize + '%'));
    meta.appendChild(el('span', 'habit-level-chip', '强化 +' + node.level));
    meta.appendChild(el('span', null, '难度 ' + node.difficulty));
    meta.appendChild(el('span', null, '累计 ' + habitDoneCount(node) + ' 次'));
    if (node.tag) meta.appendChild(el('span', 'habit-tag', node.tag));
    panel.appendChild(meta);

    // 内化大条（0–100）
    const barWrap = el('div', 'habit-inspect-bar');
    const bar = el('div', 'habit-inspect-bar-fill');
    bar.style.width = node.internalize + '%';
    barWrap.appendChild(bar);
    panel.appendChild(barWrap);
    panel.appendChild(el('div', 'habit-inspect-bar-label', '内化 ' + node.internalize + ' / 100'));

    // 近 N 日点阵（默认 7，可展开 30）
    if (!habitDotsDays) habitDotsDays = HABIT_DOTS_DAYS;
    const dotsRow = el('div', 'habit-dots-row');
    dotsRow.appendChild(el('span', 'habit-dots-label', '点阵 · 近 ' + habitDotsDays + ' 日'));
    const dots = el('div', 'habit-dots');
    const todayYmd = habitToday();
    habitDots(node, todayYmd, habitDotsDays).forEach(function (d) {
      const cell = el('div', 'habit-dot' + (d.done ? ' on' : '') + (d.date === todayYmd ? ' today' : ''));
      cell.title = d.date + (d.done ? ' · 已完成' : ' · 未完成');
      cell.textContent = d.done ? '✓' : '';
      dots.appendChild(cell);
    });
    dotsRow.appendChild(dots);
    const dotsBtn = el('button', 'btn small heat-expand-btn', habitDotsDays > HABIT_DOTS_DAYS ? '收起' : '展开 30 日');
    dotsBtn.addEventListener('click', function () {
      habitDotsDays = habitDotsDays > HABIT_DOTS_DAYS ? HABIT_DOTS_DAYS : 30;
      renderApp();
    });
    dotsRow.appendChild(dotsBtn);
    panel.appendChild(dotsRow);

    // 强化：手动升（日限）/ 降
    const cfg = habitLoadCfg();
    const state = habitLoadState();
    const canManual = habitCanManualLevel(state, today, cfg);
    const levelRow = el('div', 'habit-level-row');
    levelRow.appendChild(el('span', 'mini-label', '强化 +n'));
    const lvText = el('span', 'habit-level-value', '+' + node.level);
    const lvDown = el('button', 'btn small', '−');
    lvDown.addEventListener('click', function () {
      const r = habitLevelDelta(habitLoadNodes(), node.id, -1, Date.now());
      if (!r.ok) { toast('操作失败'); return; }
      habitSaveNodes(r.nodes);
      renderApp();
      toast('强化 +' + r.node.level);
    });
    const lvUp = el('button', 'btn small' + (canManual.ok ? '' : ' disabled'),
      canManual.ok ? '手动＋' : '今日已用');
    if (canManual.ok) {
      lvUp.addEventListener('click', function () { habitConfirmManualLevel(node); });
    }
    levelRow.appendChild(lvDown);
    levelRow.appendChild(lvText);
    levelRow.appendChild(lvUp);
    levelRow.appendChild(el('span', 'muted',
      '手动每日 ' + canManual.limit + ' 次、内化保留 ' + Math.round(canManual.keepRatio * 100) + '%'
    ));
    panel.appendChild(levelRow);

    // 改父（菜单）
    const parentRow = el('div', 'habit-reparent-row');
    parentRow.appendChild(el('span', 'mini-label', '父节点'));
    const parentSel = el('select', 'wrong-input habit-parent-sel');
    const rootOpt = el('option', null, '（根节点）');
    rootOpt.value = '';
    parentSel.appendChild(rootOpt);
    habitActive(allNodes).forEach(function (n) {
      if (n.id === node.id) return;
      if (habitIsAncestorOf(allNodes, node.id, n.id)) return;
      const depth = habitNodeDepth(allNodes, n.id);
      const pad = depth > 0 ? '　'.repeat(depth) + '└ ' : '';
      const opt = el('option', null, pad + (n.title || n.id) + (n.onTree ? '' : '（库）'));
      opt.value = n.id;
      parentSel.appendChild(opt);
    });
    parentSel.value = node.parentId || '';
    parentSel.addEventListener('change', function () {
      const r = habitSetParent(habitLoadNodes(), node.id, parentSel.value || null, Date.now());
      if (!r.ok) {
        toast(r.reason === 'cycle' ? '不能把节点挂到自己或子孙下' : '父节点不存在');
        renderApp();
        return;
      }
      habitSaveNodes(r.nodes);
      toast('已调整父级');
      renderApp();
    });
    parentRow.appendChild(parentSel);
    parentRow.appendChild(el('span', 'muted', '或把导图里的节点拖到目标节点上'));
    panel.appendChild(parentRow);

    // 单习惯：已完成 / 未完成 + 编辑 / 删除（不单独结算）
    const btns = el('div', 'habit-node-btns habit-inspect-btns');
    const doneBtn = el('button', 'btn small' + (st === 'done' ? ' primary' : ''), '已完成');
    doneBtn.addEventListener('click', function () { habitSetCheckUi(node.id, 'done'); });
    btns.appendChild(doneBtn);

    const undoneBtn = el('button', 'btn small' + (st === 'undone' ? ' danger' : ''), '未完成');
    undoneBtn.addEventListener('click', function () { habitSetCheckUi(node.id, 'undone'); });
    btns.appendChild(undoneBtn);

    const edit = el('button', 'btn small', '编辑');
    edit.addEventListener('click', function () { habitOpenEditor(node, 'edit', null); });
    btns.appendChild(edit);

    const del = el('button', 'btn small danger', '删除');
    del.addEventListener('click', function () { habitConfirmDelete(node, allNodes); });
    btns.appendChild(del);
    panel.appendChild(btns);
    return panel;
  }

  function habitLibRow(node, allNodes, canAddToday) {
    const row = el('div', 'habit-lib-row');
    const main = el('div', 'habit-node-main');
    main.appendChild(el('div', 'habit-node-title', node.title || '（未命名）'));
    const meta = el('div', 'habit-node-meta');
    meta.appendChild(el('span', null, '内化 ' + node.internalize + '%'));
    meta.appendChild(el('span', 'habit-level-chip', '强化 +' + node.level));
    meta.appendChild(el('span', null, '失败 ' + node.failCount + ' 次'));
    if (node.tag) meta.appendChild(el('span', 'habit-tag', node.tag));
    main.appendChild(meta);
    row.appendChild(main);

    const btns = el('div', 'habit-node-btns');
    const promote = el('button', 'btn small primary' + (canAddToday ? '' : ' disabled'), canAddToday ? '入树' : '今日已满');
    if (canAddToday) {
      promote.addEventListener('click', function () {
        const r = habitAddToTree(habitLoadNodes(), { id: node.id }, habitToday(), Date.now());
        if (!r.ok) {
          toast(r.reason === 'daily-limit' ? '今日入树名额已用完' : '入树失败');
          return;
        }
        habitSaveNodes(r.nodes);
        habitSelectedId = node.id;
        renderApp();
        toast('已入树 · 内化 ' + node.internalize + '% 保留');
      });
    }
    btns.appendChild(promote);

    const edit = el('button', 'btn small', '编辑');
    edit.addEventListener('click', function () { habitOpenEditor(node, 'edit', null); });
    btns.appendChild(edit);

    const del = el('button', 'btn small danger', '删除');
    del.addEventListener('click', function () { habitConfirmDelete(node, allNodes); });
    btns.appendChild(del);
    row.appendChild(btns);
    return row;
  }

  // 全员检完 → 确认框 → 综合结算
  function habitConfirmSettle() {
    const nodes = habitLoadNodes();
    const today = habitToday();
    const cfg = habitLoadCfg();
    const gate = habitAllChecked(nodes, today);
    if (!gate.ok) {
      toast('还有 ' + gate.unchecked.length + ' 项未检查，请先标「已完成 / 未完成」');
      return;
    }
    const preview = habitSettlePreview(nodes, today, { groups: habitLoadGroups(), cfg: cfg });
    const msg = '今日结算将综合判定：\n' +
      '完成 ' + preview.completed.length + ' · 未完成 ' + preview.incomplete.length + '\n' +
      '组保护 ' + preview.protected.length + ' · 违规回库 ' + preview.violations.length +
      (preview.cascadedPreview.length ? ' · 级联 ' + preview.cascadedPreview.length : '') + '\n' +
      '违规会回习惯库并熄灭子孙；内化按设置（罚 ' + cfg.failInternalizePenalty + '）。确认结算？';
    if (typeof window !== 'undefined' && !window.confirm(msg)) return;
    habitRunSettle(today);
  }

  function habitRunSettle(dateStr) {
    const nodes = habitLoadNodes();
    const cfg = habitLoadCfg();
    const d = String(dateStr || habitToday());
    const result = habitSettleDay(nodes, d, Date.now(), {
      groups: habitLoadGroups(),
      cfg: cfg
    });
    habitSaveNodes(result.nodes);
    let state = habitLoadState();
    if (state.settledDates.indexOf(d) < 0) {
      state.settledDates.push(d);
      state.settledDates.sort();
      state = habitSaveState(state);
    }
    habitCheckLog = {
      date: d,
      completed: result.completed,
      incomplete: result.incomplete,
      failed: result.failed,
      cascaded: result.cascaded,
      protected: result.protected
    };
    if (habitSelectedId && !habitFind(result.nodes, habitSelectedId)) habitSelectedId = null;
    renderApp();
    const parts = ['今日结算完成', '完成 ' + result.completed.length, '未完成 ' + result.incomplete.length];
    if (result.failed.length) parts.push('回库 ' + result.failed.length);
    if (result.cascaded.length) parts.push('级联 ' + result.cascaded.length);
    if (result.protected.length) parts.push('组保护 ' + result.protected.length);
    toast(parts.join(' · '));
  }

  // 零点自动结算前一日（未检查视作未完成）
  function habitRunAutoSettle() {
    const cfg = habitLoadCfg();
    if (!cfg.autoSettle) return;
    const state = habitLoadState();
    const today = habitToday();
    const nodes = habitLoadNodes();
    if (!nodes.length) return;
    let minDate = null;
    nodes.forEach(function (n) {
      const c = n.createdAt ? habitYmd(new Date(n.createdAt)) : null;
      if (c && (!minDate || c < minDate)) minDate = c;
      if (n.addedOn && (!minDate || n.addedOn < minDate)) minDate = n.addedOn;
    });
    const pending = habitPendingSettleDates(state, today, minDate);
    if (!pending.length) return;
    let list = nodes;
    let st = state;
    let last = null;
    pending.forEach(function (d) {
      const r = habitSettleDay(list, d, Date.now(), { groups: habitLoadGroups(), cfg: cfg });
      list = r.nodes;
      last = r;
      if (st.settledDates.indexOf(d) < 0) {
        st.settledDates.push(d);
      }
    });
    st.settledDates.sort();
    habitSaveNodes(list);
    habitSaveState(st);
    habitCheckLog = {
      date: pending[pending.length - 1],
      completed: last ? last.completed : [],
      incomplete: last ? last.incomplete : [],
      failed: last ? last.failed : [],
      cascaded: last ? last.cascaded : [],
      protected: last ? last.protected : [],
      auto: true
    };
  }

  // 手动强化：确认改写更严
  function habitConfirmManualLevel(node) {
    const today = habitToday();
    const cfg = habitLoadCfg();
    const state = habitLoadState();
    const can = habitCanManualLevel(state, today, cfg);
    if (!can.ok) {
      toast('今日手动强化次数已用完（每日 ' + can.limit + ' 次）');
      return;
    }
    const keepPct = Math.round(can.keepRatio * 100);
    const msg = '手动强化是「改写更严」的快捷键，不是白抬强化位。\n\n' +
      '· 每日仅 ' + can.limit + ' 次，且每次只作用于 1 个习惯\n' +
      '· 内化将只保留 ' + keepPct + '%（现 ' + node.internalize + '% → ' +
      Math.round((Number(node.internalize) || 0) * can.keepRatio) + '%）\n' +
      '· 请同步把「' + (node.title || node.id) + '」改写得更难、更具体\n\n' +
      '确认手动强化 +1？';
    if (typeof window !== 'undefined' && !window.confirm(msg)) return;
    const r = habitManualLevelUp(habitLoadNodes(), node.id, today, Date.now(), { cfg: cfg, state: state });
    if (!r.ok) {
      toast(r.reason === 'already-used' ? '该习惯今日已手动强化过' : '今日手动强化次数已用完');
      return;
    }
    habitSaveNodes(r.nodes);
    habitSaveState(r.state);
    renderApp();
    toast('手动强化 +' + r.node.level + ' · 内化 ' + r.node.internalize + '%（请改写更严）');
  }

  function habitConfirmDelete(node, allNodes) {
    const descendants = habitDescendantIds(allNodes || habitLoadNodes(), node.id);
    const msg = descendants.length
      ? '删除「' + (node.title || node.id) + '」将一并移除 ' + descendants.length + ' 个子孙节点。确认？'
      : '删除「' + (node.title || node.id) + '」？';
    if (typeof window !== 'undefined' && !window.confirm(msg)) return;
    const r = habitDeleteNode(habitLoadNodes(), node.id, Date.now());
    habitSaveNodes(r.nodes);
    if (habitSelectedId === node.id) habitSelectedId = null;
    renderApp();
    toast('已删除 ' + r.removed.length + ' 个节点（含级联）');
  }

  // mode: 'edit' | 'promote'（入树，含新建）| 'library'（仅库）
  // presetParentId：预填父节点
  function habitOpenEditor(node, mode, presetParentId) {
    const all = habitLoadNodes();
    const isEdit = mode === 'edit' && node;
    const isLibraryOnly = mode === 'library';
    const today = habitToday();
    const cfg = habitLoadCfg();
    const canAdd = habitCanAddToTree(all, today, cfg);

    if (!isEdit && !isLibraryOnly && !canAdd.ok) {
      toast('今日入树名额已用完（每日最多 ' + canAdd.limit + ' 个）');
      return;
    }

    const modal = el('div', 'map-modal habit-modal');
    const backdrop = el('div', 'map-modal-backdrop');
    backdrop.addEventListener('click', function () { modal.remove(); });
    modal.appendChild(backdrop);
    const card = el('div', 'map-modal-card wrong-input-card');
    const titleText = isEdit ? '✏️ 编辑习惯' : (isLibraryOnly ? '➕ 新建习惯（习惯库）' : '🌱 入树 · 新习惯');
    card.appendChild(el('h3', null, titleText));

    if (!isEdit && !isLibraryOnly) {
      card.appendChild(el('div', 'muted', '今日入树 ' + canAdd.addedToday + '/' + canAdd.limit + ' · 每日最多 ' + canAdd.limit + ' 个新节点上树'));
    }

    // 注意：变量须在函数作用域，保存回调闭包引用
    let title = null;
    let tag = null;
    let diff = null;
    let detail = null;

    card.appendChild(el('span', 'mini-label', '名称'));
    title = el('input', 'wrong-input');
    title.type = 'text';
    title.placeholder = '例如：睡前关灯前背 20 个单词';
    title.value = (node && node.title) || '';
    card.appendChild(title);

    card.appendChild(el('span', 'mini-label', '说明（可选）'));
    detail = el('input', 'wrong-input');
    detail.type = 'text';
    detail.placeholder = '触发情境 / 具体动作';
    detail.value = (node && node.detail) || '';
    card.appendChild(detail);

    card.appendChild(el('span', 'mini-label', '标签（同标签组成保护组，可选）'));
    tag = el('input', 'wrong-input');
    tag.type = 'text';
    tag.placeholder = '例如：晨间 / 考研节奏';
    tag.value = (node && node.tag) || '';
    card.appendChild(tag);

    const numRow = el('div', 'habit-edit-nums');
    const diffWrap = el('div', 'habit-edit-num');
    diffWrap.appendChild(el('span', 'mini-label', '难度 1–5'));
    diff = el('input', 'wrong-input');
    diff.type = 'number';
    diff.min = '1';
    diff.max = '5';
    diff.step = '1';
    diff.value = String(node ? node.difficulty : HABIT_DIFFICULTY_DEFAULT);
    diffWrap.appendChild(diff);
    numRow.appendChild(diffWrap);
    card.appendChild(numRow);

    card.appendChild(el('span', 'mini-label', '父节点（根节点 = 不设父级）'));
    const parentSel = el('select', 'wrong-input');
    const rootOpt = el('option', null, '（根节点）');
    rootOpt.value = '';
    parentSel.appendChild(rootOpt);
    habitActive(all).forEach(function (n) {
      if (node && n.id === node.id) return;
      if (node && habitIsAncestorOf(all, node.id, n.id)) return;
      const depth = habitNodeDepth(all, n.id);
      const pad = depth > 0 ? '　'.repeat(depth) + '└ ' : '';
      const opt = el('option', null, pad + (n.title || n.id) + (n.onTree ? '' : '（库）'));
      opt.value = n.id;
      parentSel.appendChild(opt);
    });
    const presetParent = node ? (node.parentId || '') : (presetParentId || '');
    parentSel.value = presetParent && habitFind(all, presetParent) && !habitFind(all, presetParent).removedAt
      ? presetParent
      : '';
    card.appendChild(parentSel);

    const hint = el('div', 'act-hint');
    card.appendChild(hint);

    const btns = el('div', 'wrong-input-btns');
    const save = el('button', 'btn primary', isLibraryOnly ? '存入习惯库' : '保存');
    save.addEventListener('click', function () {
      const parentId = parentSel.value || null;
      const titleV = title.value.trim();
      if (!titleV) { hint.textContent = '名称不能为空'; hint.className = 'act-hint warn'; return; }
      const diffV = Number(diff.value);
      const diffOk = Number.isFinite(diffV) && diffV >= 1 && diffV <= 5 ? Math.floor(diffV) : HABIT_DIFFICULTY_DEFAULT;

      if (isEdit) {
        const next = habitUpdateNode(habitLoadNodes(), node.id, {
          title: titleV,
          detail: detail.value.trim(),
          tag: tag.value.trim(),
          difficulty: diffOk
        }, Date.now());
        const pr = habitSetParent(next.nodes, node.id, parentId, Date.now());
        if (pr.ok) next.nodes = pr.nodes;
        habitSaveNodes(next.nodes);
        modal.remove();
        renderApp();
        toast('习惯已更新');
        return;
      }

      if (isLibraryOnly) {
        const next = habitAddNode(habitLoadNodes(), {
          title: titleV,
          detail: detail.value.trim(),
          tag: tag.value.trim(),
          difficulty: diffOk,
          parentId: parentId,
          onTree: false
        }, Date.now());
        habitSaveNodes(next.nodes);
        modal.remove();
        renderApp();
        toast('已存入习惯库');
        return;
      }

      // promote：新建并入树（或提升库内节点）
      const payload = {
        title: titleV,
        detail: detail.value.trim(),
        tag: tag.value.trim(),
        difficulty: diffOk,
        parentId: parentId
      };
      const next = habitAddToTree(habitLoadNodes(), payload, habitToday(), Date.now());
      if (!next.ok) {
        hint.textContent = next.reason === 'daily-limit'
          ? '今日入树名额已用完，明日再来'
          : '入树失败';
        hint.className = 'act-hint warn';
        return;
      }
      habitSaveNodes(next.nodes);
      if (next.node) habitSelectedId = next.node.id;
      modal.remove();
      renderApp();
      toast('已入树（今日 ' + next.addedToday + '/' + canAdd.limit + '）');
    });
    btns.appendChild(save);
    const cancel = el('button', 'btn', '取消');
    cancel.addEventListener('click', function () { modal.remove(); });
    btns.appendChild(cancel);
    card.appendChild(btns);
    modal.appendChild(card);
    document.body.appendChild(modal);
    setTimeout(function () {
      try {
        const first = modal.querySelector('input, select');
        if (first) first.focus();
      } catch (e) {}
    }, 50);
  }

  // 节点深度（根 = 0）；用于父级下拉缩进
  function habitNodeDepth(nodes, id) {
    let depth = 0;
    let cur = habitFind(nodes, id);
    const guard = {};
    while (cur && cur.parentId && !guard[cur.id]) {
      guard[cur.id] = 1;
      depth++;
      cur = habitFind(nodes, cur.parentId);
    }
    return depth;
  }

  // 主页摘要数字（供 actTodaySummary 在运行时取用）
  function habitHomeCounts() {
    const nodes = habitLoadNodes();
    const s = habitDayStats(nodes, habitToday());
    return { due: s.due, done: s.done, total: s.total, unchecked: s.unchecked, undone: s.undone };
  }

  export {
  evaluateHabitDay,
  habitSanitize,
  habitAddNode,
  habitUpdateNode,
  habitSetParent,
  habitDeleteNode,
  habitFailNode,
  habitAddToTree,
  habitCanAddToTree,
  habitDailyAddCount,
  habitUpdateInternalize,
  habitInternalizeGain,
  habitMapLayout,
  habitDescendantIds,
  habitCanSetParent,
  habitCanDrop,
  habitDayStats,
  habitDots,
  habitTagGroups,
  habitDoneCount,
  habitActive,
  habitOnTree,
  habitLibrary,
  habitFind,
  habitChildrenOf,
  habitNormalizeDoneDates,
  habitYmd,
  habitToIdSet,
  habitNodeDepth,
  habitClampInternalize,
  HABIT_DOTS_DAYS,
  HABIT_TOLERANCE_DEFAULT,
  HABIT_INTERNALIZE_MAX,
  HABIT_DAILY_ADD_LIMIT,
  HABIT_DIFFICULTY_DEFAULT,
  // T26 组 minK
  HABIT_MIN_K_DEFAULT,
  HABIT_MIN_K_MAX,
  HABIT_LEVEL_MAX,
  HABIT_LEVEL_STEPS,
  habitGroupKey,
  habitClampMinK,
  habitSanitizeGroups,
  habitMinKOf,
  habitSetGroupMinK,
  habitUpsertGroup,
  habitGroupSummaries,
  // T26/T30 强化
  habitClampLevel,
  habitLevelFloor,
  habitAutoLevelOnOk,
  habitDemoteLevel,
  habitLevelDelta,
  // T30 H1 结算
  habitNormalizeCfg,
  habitLoadCfg,
  HABIT_CFG_DEFAULTS,
  habitCheckStatus,
  habitSetCheck,
  habitAllChecked,
  habitNormalizeState,
  habitDefaultState,
  habitSettlePreview,
  habitSettleDay,
  habitManualLevelUp,
  habitCanManualLevel,
  habitPendingSettleDates
};
