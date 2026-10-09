  // ---------------- 行动·专注链（CTDP + H2/H3） ----------------
  // 规格：docs/V2_PLAN.md §2.2 · §10.2–10.4 · docs/ACT.md §11.3。
  // UI 文案「专注链」。⚠️ CTDP 为社区技术文方法论参考，非同行评议。
  // H2：计时结束才可完成；开始必填内容；结束记达成+完成度；侦查可转正。
  // H3：#N/●N/▲N/◆N 独立流水；状态竖列树（计划并入）；主链唯一。
  // 数据键 athena_focus_v1。禁止连击惩罚、物质兑换、改 FSRS。

  const FOCUS_KEY = 'athena_focus_v1';
  const FOCUS_DURATIONS = [25, 50, 60];
  const FOCUS_DEFAULT_DURATION = 25;
  const FOCUS_SCOUT_MIN = 5;
  const FOCUS_SCOUT_EXTEND_MIN = 5;
  const FOCUS_RESERVE_WINDOW_MS = 15 * 60 * 1000;
  const FOCUS_TYPE_KEYS = ['focus', 'assault', 'life', 'plan', 'scout'];
  const FOCUS_FORMAL_TYPE_KEYS = ['focus', 'assault', 'life', 'plan'];
  const FOCUS_LEVEL_KEYS = ['unit', 'group', 'corps', 'army'];
  const FOCUS_ORG_LEVELS = ['group', 'corps', 'army'];
  const FOCUS_SEQ_KEYS = { unit: '#', group: '●', corps: '▲', army: '◆' };
  // 层次严格划分：单元的 rank=0，其上依次为组/群/集团；父级层次恒为该节点 rank+1。
  const FOCUS_LEVEL_RANK = { unit: 0, group: 1, corps: 2, army: 3 };
  // 计划参数边界（新建顶层任务 / 添加子级 两个入口共用）
  const FOCUS_MIN_CHILD_MIN = 1;
  const FOCUS_MIN_CHILD_MAX = 99;
  // 主链 tier（原「精锐」）；同一时间仅一条
  const FOCUS_TIER_MAIN = 'main';
  const FOCUS_TIER_NORMAL = 'normal';
  // 预约链：自动存在，仅计数；预约成功就座 +1，违规清零
  const FOCUS_RESERVE_CHAIN_ID = '__reserve_chain__';
  const FOCUS_ROLE_RESERVE = 'reserve';

  // 设置缺省（V2_PLAN §10.4；风味/三三制只在设置开，模块内不再放选项）
  function focusDefaultSettings() {
    return {
      unitMinutes: FOCUS_DEFAULT_DURATION,
      reserveWindowMin: 15,
      scoutMinutes: FOCUS_SCOUT_MIN,
      scoutExtendMin: FOCUS_SCOUT_EXTEND_MIN,
      structure: 'free',              // 'free' | 'triad'（仅设置）
      flavor: false,                  // 风味总开关（仅设置）
      planDueRemindDays: 3,
      triadChildCount: 3,
      typeNames: {
        focus: '专注',
        assault: '突击',
        life: '生活',
        plan: '计划',
        scout: '侦查'
      },
      levelNames: {
        unit: '任务单元',
        group: '任务组',
        corps: '任务群',
        army: '任务集团'
      }
    };
  }

  // ---------------- 纯函数：工具 ----------------

  function focusDefaultState() {
    return {
      chains: [{
        id: FOCUS_RESERVE_CHAIN_ID,
        tier: FOCUS_TIER_NORMAL,
        role: FOCUS_ROLE_RESERVE,
        seatNote: '预约信号后在窗口内就座',
        unitMinutes: FOCUS_DEFAULT_DURATION,
        status: 'idle',
        workCount: 0,
        lastUnitAt: null,
        current: null,
        reservation: null,
        awaiting: null,
        clearedAt: null,
        clearReason: '',
        inheritedFrom: null,
        createdAt: 0,
        updatedAt: 0
      }],
      precedents: [],
      activeId: FOCUS_RESERVE_CHAIN_ID,
      units: [],
      orgs: [],
      plans: [],
      planMode: false,               // 计划模式（状态模块内开关）
      seq: { unit: 0, group: 0, corps: 0, army: 0 },
      settings: focusDefaultSettings()
    };
  }

  function focusUid(prefix) {
    return (prefix || 'fc') + '_' + Date.now() + '_' + Math.floor(Math.random() * 10000);
  }

  function focusClampMinutes(v) {
    const n = Number(v);
    if (!Number.isFinite(n) || n <= 0) return FOCUS_DEFAULT_DURATION;
    return Math.max(1, Math.min(240, Math.round(n)));
  }

  function focusClampPct(v) {
    const n = Number(v);
    if (!Number.isFinite(n)) return 0;
    return Math.max(0, Math.min(100, Math.round(n)));
  }

  function focusNormalizeBehavior(s) {
    return String(s == null ? '' : s).trim().replace(/\s+/g, ' ');
  }

  function focusYmd(ts) {
    const d = new Date(Number(ts) || 0);
    if (isNaN(d.getTime())) return '';
    return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
  }

  function focusSanitizeTypeNames(raw) {
    const def = focusDefaultSettings().typeNames;
    const out = {};
    FOCUS_TYPE_KEYS.forEach(function (k) {
      const v = raw && raw[k];
      out[k] = (v == null || v === '') ? def[k] : String(v);
    });
    return out;
  }

  function focusSanitizeLevelNames(raw) {
    const def = focusDefaultSettings().levelNames;
    const out = {};
    FOCUS_LEVEL_KEYS.forEach(function (k) {
      const v = raw && raw[k];
      out[k] = (v == null || v === '') ? def[k] : String(v);
    });
    return out;
  }

  function focusSanitizeSettings(raw) {
    const def = focusDefaultSettings();
    if (!raw || typeof raw !== 'object') return def;
    const st = Number(raw.unitMinutes);
    const rw = Number(raw.reserveWindowMin);
    const sm = Number(raw.scoutMinutes);
    const se = Number(raw.scoutExtendMin);
    const prd = Number(raw.planDueRemindDays);
    const tc = Number(raw.triadChildCount);
    return {
      unitMinutes: focusClampMinutes(Number.isFinite(st) ? st : def.unitMinutes),
      reserveWindowMin: Number.isFinite(rw) && rw > 0 ? Math.min(180, Math.round(rw)) : def.reserveWindowMin,
      scoutMinutes: Number.isFinite(sm) && sm > 0 ? Math.min(60, Math.round(sm)) : def.scoutMinutes,
      scoutExtendMin: Number.isFinite(se) && se > 0 ? Math.min(60, Math.round(se)) : def.scoutExtendMin,
      structure: raw.structure === 'triad' ? 'triad' : 'free',
      flavor: !!raw.flavor,
      planDueRemindDays: Number.isFinite(prd) && prd >= 0 ? Math.min(30, Math.round(prd)) : def.planDueRemindDays,
      triadChildCount: Number.isFinite(tc) && tc > 0 ? Math.min(9, Math.round(tc)) : def.triadChildCount,
      typeNames: focusSanitizeTypeNames(raw.typeNames),
      levelNames: focusSanitizeLevelNames(raw.levelNames)
    };
  }

  function focusSanitizePrecedent(raw) {
    if (!raw || typeof raw !== 'object') return null;
    const behavior = focusNormalizeBehavior(raw.behavior);
    if (!behavior) return null;
    return {
      id: String(raw.id || focusUid('prec')),
      behavior: behavior,
      note: String(raw.note == null ? '' : raw.note),
      createdAt: Number(raw.createdAt) || 0
    };
  }

  function focusSanitizeUnit(raw) {
    if (!raw || typeof raw !== 'object') return null;
    const typeKey = FOCUS_TYPE_KEYS.indexOf(String(raw.typeKey)) >= 0 ? String(raw.typeKey) : 'focus';
    const taskText = String(raw.taskText == null ? '' : raw.taskText).trim();
    const name = String(raw.name == null ? '' : raw.name).trim();
    const startedAt = Number(raw.startedAt) || 0;
    const endedAt = Number(raw.endedAt) || 0;
    const planned = focusClampMinutes(raw.plannedMin);
    let actual = Number(raw.actualMin);
    if (!Number.isFinite(actual) || actual < 0) {
      actual = endedAt && startedAt ? Math.max(0, Math.round((endedAt - startedAt) / 60000)) : planned;
    }
    const seq = Number(raw.seq);
    return {
      id: String(raw.id || focusUid('unit')),
      seq: Number.isFinite(seq) && seq > 0 ? Math.floor(seq) : 0,
      typeKey: typeKey,
      name: name,
      taskText: taskText,
      chainId: raw.chainId == null ? null : String(raw.chainId),
      orgId: raw.orgId == null ? null : String(raw.orgId),
      planId: raw.planId == null ? null : String(raw.planId),
      startedAt: startedAt,
      endedAt: endedAt,
      plannedMin: planned,
      actualMin: Math.max(0, Math.round(actual)),
      achieved: !!raw.achieved,
      completion: focusClampPct(raw.completion),
      promotedFromScout: !!raw.promotedFromScout
    };
  }

  function focusSanitizeOrg(raw) {
    if (!raw || typeof raw !== 'object') return null;
    const level = FOCUS_ORG_LEVELS.indexOf(String(raw.level)) >= 0 ? String(raw.level) : 'group';
    const seq = Number(raw.seq);
    const minChild = Number(raw.minChildCount);
    return {
      id: String(raw.id || focusUid('org')),
      level: level,
      seq: Number.isFinite(seq) && seq > 0 ? Math.floor(seq) : 1,
      name: String(raw.name == null ? '' : raw.name),
      parentId: raw.parentId == null || raw.parentId === '' ? null : String(raw.parentId),
      planId: raw.planId == null ? null : String(raw.planId),
      fromPlan: !!raw.fromPlan,
      formalized: raw.formalized == null ? !raw.fromPlan : !!raw.formalized,
      dueAt: raw.dueAt == null ? null : (Number(raw.dueAt) || null),
      minChildCount: focusNormalizeMinChildCount(Number.isFinite(minChild) ? minChild : null, 1),
      createdAt: Number(raw.createdAt) || 0,
      updatedAt: Number(raw.updatedAt) || 0
    };
  }

  function focusSanitizePlan(raw) {
    if (!raw || typeof raw !== 'object') return null;
    const target = Number(raw.targetCount);
    const statusList = ['active', 'done', 'failed'];
    let status = String(raw.status || 'active');
    if (statusList.indexOf(status) < 0) status = 'active';
    return {
      id: String(raw.id || focusUid('plan')),
      title: String(raw.title == null ? '' : raw.title),
      dueAt: Number(raw.dueAt) || 0,
      targetCount: Number.isFinite(target) && target > 0 ? Math.floor(target) : 1,
      template: raw.template === 'triad' ? 'triad' : 'free',
      orgId: raw.orgId == null ? null : String(raw.orgId),
      status: status,
      createdAt: Number(raw.createdAt) || 0
    };
  }

  function focusSanitizeTier(raw) {
    // 兼容旧「elite」→「main」
    const t = String(raw == null ? FOCUS_TIER_NORMAL : raw);
    if (t === FOCUS_TIER_MAIN || t === 'elite') return FOCUS_TIER_MAIN;
    return FOCUS_TIER_NORMAL;
  }

  function focusSanitizeChain(raw) {
    if (!raw || typeof raw !== 'object') return null;
    const tier = focusSanitizeTier(raw.tier);
    const role = raw.role === FOCUS_ROLE_RESERVE ? FOCUS_ROLE_RESERVE : 'normal';
    const statusList = ['idle', 'running', 'reserved', 'scouting', 'awaiting_verdict', 'cleared'];
    let status = String(raw.status || 'idle');
    if (statusList.indexOf(status) < 0) status = 'idle';
    const workRaw = Number(raw.workCount);
    let current = null;
    if (raw.current && typeof raw.current === 'object') {
      const typeKey = FOCUS_TYPE_KEYS.indexOf(String(raw.current.typeKey)) >= 0
        ? String(raw.current.typeKey)
        : (raw.current.kind === 'scout' ? 'scout' : 'focus');
      const planned = focusClampMinutes(raw.current.plannedMin != null ? raw.current.plannedMin : raw.current.minutes);
      const ext = Number(raw.current.extendCount);
      const taskText = String(raw.current.taskText == null ? '' : raw.current.taskText).trim();
      current = {
        typeKey: typeKey,
        taskText: taskText,
        startedAt: Number(raw.current.startedAt) || 0,
        plannedMin: planned,
        extendCount: Number.isFinite(ext) && ext > 0 ? Math.floor(ext) : 0,
        promotedFromScout: !!raw.current.promotedFromScout,
        planId: raw.current.planId == null ? null : String(raw.current.planId)
      };
    }
    let reservation = null;
    if (raw.reservation && typeof raw.reservation === 'object') {
      const signalAt = Number(raw.reservation.signalAt) || 0;
      const deadline = Number(raw.reservation.deadline) || (signalAt + FOCUS_RESERVE_WINDOW_MS);
      reservation = { signalAt: signalAt, deadline: deadline };
    }
    let awaiting = null;
    if (raw.awaiting && typeof raw.awaiting === 'object') {
      const behavior = focusNormalizeBehavior(raw.awaiting.behavior);
      if (behavior) awaiting = { behavior: behavior, at: Number(raw.awaiting.at) || 0 };
    }
    return {
      id: String(raw.id || focusUid('chain')),
      tier: tier,
      seatNote: String(raw.seatNote == null ? '' : raw.seatNote),
      unitMinutes: focusClampMinutes(raw.unitMinutes),
      role: role,
      status: status,
      workCount: Number.isFinite(workRaw) && workRaw > 0 ? Math.floor(workRaw) : 0,
      lastUnitAt: raw.lastUnitAt == null ? null : (Number(raw.lastUnitAt) || null),
      current: current,
      reservation: reservation,
      awaiting: awaiting,
      clearedAt: raw.clearedAt == null ? null : (Number(raw.clearedAt) || null),
      clearReason: String(raw.clearReason == null ? '' : raw.clearReason),
      inheritedFrom: raw.inheritedFrom == null ? null : String(raw.inheritedFrom),
      createdAt: Number(raw.createdAt) || 0,
      updatedAt: Number(raw.updatedAt) || 0
    };
  }

  function focusSanitizeState(raw) {
    const out = focusDefaultState();
    if (!raw || typeof raw !== 'object') return out;
    out.settings = focusSanitizeSettings(raw.settings);
    out.planMode = !!raw.planMode;
    // 重建链列表（default 里的预约链随后由 ensure 补回，避免副本）
    out.chains = [];
    const seen = {};
    (Array.isArray(raw.chains) ? raw.chains : []).forEach(function (c) {
      const ch = focusSanitizeChain(c);
      if (!ch || seen[ch.id]) return;
      seen[ch.id] = 1;
      out.chains.push(ch);
    });
    // 主链唯一：仅保留最早一条 main，其余降为 normal
    let mainKept = false;
    out.chains.forEach(function (c) {
      if (c.tier !== FOCUS_TIER_MAIN) return;
      if (!mainKept) mainKept = true;
      else c.tier = FOCUS_TIER_NORMAL;
    });
    // 预约链自动存在（仅计数，无需编制）
    if (!seen[FOCUS_RESERVE_CHAIN_ID] && !focusFindChain(out, FOCUS_RESERVE_CHAIN_ID)) {
      out.chains.unshift({
        id: FOCUS_RESERVE_CHAIN_ID,
        tier: FOCUS_TIER_NORMAL,
        role: FOCUS_ROLE_RESERVE,
        seatNote: '预约信号后在窗口内就座',
        unitMinutes: out.settings.unitMinutes,
        status: 'idle',
        workCount: 0,
        lastUnitAt: null,
        current: null,
        reservation: null,
        awaiting: null,
        clearedAt: null,
        clearReason: '',
        inheritedFrom: null,
        createdAt: 0,
        updatedAt: 0
      });
    }
    const pseen = {};
    (Array.isArray(raw.precedents) ? raw.precedents : []).forEach(function (p) {
      const pr = focusSanitizePrecedent(p);
      if (!pr || pseen[pr.id]) return;
      pseen[pr.id] = 1;
      out.precedents.push(pr);
    });
    const useen = {};
    (Array.isArray(raw.units) ? raw.units : []).forEach(function (u) {
      const un = focusSanitizeUnit(u);
      if (!un || useen[un.id]) return;
      useen[un.id] = 1;
      out.units.push(un);
    });
    const oseen = {};
    (Array.isArray(raw.orgs) ? raw.orgs : []).forEach(function (o) {
      const og = focusSanitizeOrg(o);
      if (!og || oseen[og.id]) return;
      oseen[og.id] = 1;
      out.orgs.push(og);
    });
    out.orgs.forEach(function (o) {
      if (o.parentId && !oseen[o.parentId]) o.parentId = null;
    });
    out.units.forEach(function (u) {
      if (u.orgId && !oseen[u.orgId]) u.orgId = null;
    });
    const plseen = {};
    (Array.isArray(raw.plans) ? raw.plans : []).forEach(function (p) {
      const pl = focusSanitizePlan(p);
      if (!pl || plseen[pl.id]) return;
      plseen[pl.id] = 1;
      out.plans.push(pl);
    });
    out.plans.forEach(function (p) {
      if (p.orgId && !oseen[p.orgId]) p.orgId = null;
    });
    out.units.forEach(function (u) {
      if (u.planId && !plseen[u.planId]) u.planId = null;
    });
    const sq = raw.seq && typeof raw.seq === 'object' ? raw.seq : {};
    FOCUS_LEVEL_KEYS.forEach(function (k) {
      const n = Number(sq[k]);
      out.seq[k] = Number.isFinite(n) && n > 0 ? Math.floor(n) : 0;
    });
    // 计数器与现存节点取齐：同层最小空缺由 focusNextSeq 现场计算，
    // 历史状态里虚高的 seq 归位到实际最大番号（删除过的旧数据不再跳号）。
    let maxUnit = 0;
    out.units.forEach(function (u) {
      const n = Number(u && u.seq);
      if (Number.isFinite(n) && n > maxUnit) maxUnit = Math.floor(n);
    });
    out.seq.unit = maxUnit;
    FOCUS_ORG_LEVELS.forEach(function (lv) {
      let max = 0;
      out.orgs.forEach(function (o) {
        const n = Number(o && o.seq);
        if (o && o.level === lv && Number.isFinite(n) && n > max) max = Math.floor(n);
      });
      out.seq[lv] = max;
    });
    const aid = raw.activeId == null ? null : String(raw.activeId);
    out.activeId = aid && seen[aid] ? aid : (out.chains[0] ? out.chains[0].id : null);
    return out;
  }

  function focusCloneState(state) {
    return focusSanitizeState(state);
  }

  function focusFindChain(state, id) {
    const sid = String(id);
    return ((state && state.chains) || []).filter(function (c) { return c && c.id === sid; })[0] || null;
  }

  function focusActiveChain(state) {
    if (!state || !state.chains || !state.chains.length) return null;
    return focusFindChain(state, state.activeId) || state.chains[0];
  }

  function focusFindOrg(state, id) {
    const sid = String(id);
    return ((state && state.orgs) || []).filter(function (o) { return o && o.id === sid; })[0] || null;
  }

  function focusFindUnit(state, id) {
    const sid = String(id);
    return ((state && state.units) || []).filter(function (u) { return u && u.id === sid; })[0] || null;
  }

  function focusFindPlan(state, id) {
    const sid = String(id);
    return ((state && state.plans) || []).filter(function (p) { return p && p.id === sid; })[0] || null;
  }

  function focusMainChain(state) {
    return ((state && state.chains) || []).filter(function (c) { return c && c.tier === FOCUS_TIER_MAIN; })[0] || null;
  }

  // 番号标签
  function focusSeqLabel(level, seq) {
    const prefix = FOCUS_SEQ_KEYS[level] || '#';
    const v = Number(seq);
    return prefix + (Number.isFinite(v) && v > 0 ? Math.floor(v) : 0);
  }

  function focusUnitLabel(unit, settings) {
    if (!unit) return focusSeqLabel('unit', 0);
    const base = focusSeqLabel('unit', unit.seq);
    const st = settings || focusDefaultSettings();
    const nm = unit.name || unit.taskText;
    if (!st.flavor) return base + (nm ? ' · ' + nm : '');
    return base + ' · ' + (st.typeNames[unit.typeKey] || unit.typeKey) + (nm ? ' ' + nm : '');
  }

  function focusOrgLabel(org, settings) {
    if (!org) return '';
    const base = focusSeqLabel(org.level, org.seq);
    const st = settings || focusDefaultSettings();
    const levelName = st.levelNames[org.level] || org.level;
    const nm = org.name || '';
    if (!st.flavor) return base + (nm ? ' ' + nm : '');
    return base + ' · ' + levelName + (nm ? ' ' + nm : '');
  }

  function focusWorkLabel(n) {
    return focusSeqLabel('unit', n);
  }

  function focusIsPrecedent(precedents, behavior) {
    const b = focusNormalizeBehavior(behavior);
    if (!b) return null;
    return ((precedents || [])).filter(function (p) {
      return p && focusNormalizeBehavior(p.behavior) === b;
    })[0] || null;
  }

  function focusReservationRemainingMs(reservation, now) {
    if (!reservation) return 0;
    return Math.max(0, Number(reservation.deadline) - (Number(now) || 0));
  }

  function focusIsReservationOpen(reservation, now) {
    return !!reservation && focusReservationRemainingMs(reservation, now) > 0;
  }

  function focusUnitRemainingMs(current, now) {
    if (!current) return 0;
    const end = (Number(current.startedAt) || 0) + (Number(current.plannedMin) || 0) * 60000;
    return Math.max(0, end - (Number(now) || 0));
  }

  function focusCanComplete(current, now) {
    return !!current && focusUnitRemainingMs(current, now) <= 0;
  }

  function focusIsTypeKey(k) {
    return FOCUS_TYPE_KEYS.indexOf(String(k)) >= 0;
  }

  // ---------------- 纯函数：层次类型（严格四级） ----------------

  // 层次由节点自身的显式类型决定：单元看 units（恒为 unit），其余看 org.level ∈ group/corps/army。
  // 归属关系恒为「子级 rank + 1 = 父级 rank」，不再靠父级槽位（如「挂在组下所以是单元」）推断。
  function focusIsLevelKey(level) {
    return FOCUS_LEVEL_KEYS.indexOf(String(level)) >= 0;
  }

  function focusIsOrgLevel(level) {
    return FOCUS_ORG_LEVELS.indexOf(String(level)) >= 0;
  }

  function focusLevelRank(level) {
    const r = FOCUS_LEVEL_RANK[String(level)];
    return r == null ? -1 : r;
  }

  function focusLevelAtRank(rank) {
    const r = Math.floor(Number(rank));
    if (!Number.isFinite(r) || r < 0 || r >= FOCUS_LEVEL_KEYS.length) return null;
    return FOCUS_LEVEL_KEYS[r];
  }

  // 上一级 / 下一级（四级之外或无可上升层次 → null）
  function focusParentLevelOf(level) {
    const r = focusLevelRank(level);
    return r < 0 ? null : focusLevelAtRank(r + 1);
  }

  function focusChildLevelOf(level) {
    const r = focusLevelRank(level);
    return r <= 0 ? null : focusLevelAtRank(r - 1);
  }

  // 能否把 childLevel 的节点编入 parentLevel 的节点：须恰为上一级（单元→组、组→群、群→集团）
  function focusCanAttach(childLevel, parentLevel) {
    const c = focusLevelRank(childLevel);
    const p = focusLevelRank(parentLevel);
    return c >= 0 && p >= 1 && p === c + 1;
  }

  // 节点显式层次：单元 → 'unit'；org → 其 level；不存在 → null
  function focusNodeLevel(state, id) {
    if (focusFindUnit(state, id)) return 'unit';
    const org = focusFindOrg(state, id);
    return org ? org.level : null;
  }

  // 组合产物的层次 = 成员最高层 + 1（单元→组、组→群、群→集团）；已是集团 → null
  function focusCombineLevelOf(state, ids) {
    let max = -1;
    (Array.isArray(ids) ? ids : []).forEach(function (id) {
      const r = focusLevelRank(focusNodeLevel(state, id));
      if (r > max) max = r;
    });
    return max < 0 ? null : focusLevelAtRank(max + 1);
  }

  // 同层级最小空缺番号：删除编制后复用；已有节点番号不变、同层不重号
  function focusNextSeq(state, level) {
    const lv = String(level);
    const used = {};
    if (lv === 'unit') {
      ((state && state.units) || []).forEach(function (u) {
        const n = Number(u && u.seq);
        if (Number.isFinite(n) && n > 0) used[Math.floor(n)] = 1;
      });
    } else if (focusIsOrgLevel(lv)) {
      ((state && state.orgs) || []).forEach(function (o) {
        if (!o || o.level !== lv) return;
        const n = Number(o.seq);
        if (Number.isFinite(n) && n > 0) used[Math.floor(n)] = 1;
      });
    } else return 0;
    let n = 1;
    while (used[n]) n += 1;
    return n;
  }

  // 现存同层最大番号（删除后同步计数器）
  function focusMaxSeq(state, level) {
    const lv = String(level);
    let max = 0;
    function take(n) {
      const v = Math.floor(Number(n));
      if (Number.isFinite(v) && v > max) max = v;
    }
    if (lv === 'unit') {
      ((state && state.units) || []).forEach(function (u) { if (u) take(u.seq); });
    } else {
      ((state && state.orgs) || []).forEach(function (o) { if (o && o.level === lv) take(o.seq); });
    }
    return max;
  }

  // ---------------- 纯函数：计划参数（新建顶层任务 / 添加子级 共用同一校验） ----------------

  // 最小下级数：仅接受 1..99 整数；越界收敛、非法回退默认
  function focusNormalizeMinChildCount(v, dflt) {
    const d = Number(dflt);
    const def = Number.isFinite(d)
      ? Math.min(FOCUS_MIN_CHILD_MAX, Math.max(FOCUS_MIN_CHILD_MIN, Math.floor(d)))
      : FOCUS_MIN_CHILD_MIN;
    if (v == null || String(v).trim() === '') return def;
    const n = Number(v);
    if (!Number.isFinite(n)) return def;
    return Math.min(FOCUS_MIN_CHILD_MAX, Math.max(FOCUS_MIN_CHILD_MIN, Math.floor(n)));
  }

  function focusMinChildCountValid(v) {
    if (v == null || String(v).trim() === '') return false;
    const n = Number(v);
    return Number.isFinite(n) && Math.floor(n) === n && n >= FOCUS_MIN_CHILD_MIN && n <= FOCUS_MIN_CHILD_MAX;
  }

  // 截止日期：接受毫秒时间戳（number / ≥10 位数字串）、Date、'YYYY-MM-DD'（当日 23:59:59 本地）。
  // 非法一律 → null（'2024-02-31'、'abc'、0、负数均视为非法）。
  function focusNormalizeDueAt(v) {
    if (v == null || v === '') return null;
    if (v instanceof Date) {
      const t = v.getTime();
      return Number.isFinite(t) ? Math.floor(t) : null;
    }
    if (typeof v === 'number') return Number.isFinite(v) && v > 0 ? Math.floor(v) : null;
    const s = String(v).trim();
    if (/^\d{10,}$/.test(s)) {
      const n = Number(s);
      return Number.isFinite(n) && n > 0 ? Math.floor(n) : null;
    }
    const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s);
    if (!m) return null;
    const y = Number(m[1]);
    const mo = Number(m[2]);
    const d = Number(m[3]);
    const dt = new Date(y, mo - 1, d, 23, 59, 59, 0);
    if (!Number.isFinite(dt.getTime())) return null;
    // 拒绝 2 月 31 日这类被 Date 顺延的假日期
    if (dt.getFullYear() !== y || dt.getMonth() !== mo - 1 || dt.getDate() !== d) return null;
    return dt.getTime();
  }

  function focusDueDateValid(v) {
    if (v == null || v === '') return true;   // 截止日期可选
    return focusNormalizeDueAt(v) !== null;
  }

  // 计划新建表单字段：新建计划任务、添加子级两个入口共用；非法日期 → ok:false（不落库）
  function focusPlanNodeFields(raw, dfltMinChildCount) {
    const f = raw || {};
    const dueRaw = f.dueAt == null ? '' : f.dueAt;
    if (!focusDueDateValid(dueRaw)) return { ok: false, reason: 'bad_due' };
    return {
      ok: true,
      name: String(f.name == null ? '' : f.name).trim(),
      dueAt: focusNormalizeDueAt(dueRaw),
      minChildCount: focusNormalizeMinChildCount(f.minChildCount, dfltMinChildCount)
    };
  }

  // 统一「编入 / 改父」：层次由节点显式类型判定，父级须恰为上一级。
  // 单元 → 任务组；组 → 群；群 → 集团；集团不可再向上。根级（无父级）始终允许。
  function focusAttachNodes(state, nodeIds, parentId, now) {
    const next = focusCloneState(state);
    const ids = Array.isArray(nodeIds) ? nodeIds.map(String) : [];
    if (!ids.length) return { ok: false, reason: 'empty_selection', state: next };
    let parent = null;
    if (parentId != null && parentId !== '') {
      parent = focusFindOrg(next, parentId);
      if (!parent) return { ok: false, reason: 'bad_parent', state: next };
    }
    const t = Number(now) || 0;
    const touched = [];
    const skipped = [];
    ids.forEach(function (id) {
      const level = focusNodeLevel(next, id);
      if (!level) { skipped.push(id); return; }
      if (parent) {
        if (!focusCanAttach(level, parent.level)) { skipped.push(id); return; }
        if (id === parent.id || focusIsAncestorOrg(next, id, parent.id)) { skipped.push(id); return; }
      }
      const unit = focusFindUnit(next, id);
      if (unit) {
        unit.orgId = parent ? parent.id : null;
        touched.push(unit.id);
        return;
      }
      const org = focusFindOrg(next, id);
      org.parentId = parent ? parent.id : null;
      org.updatedAt = t;
      touched.push(org.id);
    });
    if (!touched.length) return { ok: false, reason: 'bad_parent', state: next, skipped: skipped };
    return { ok: true, state: next, touched: touched, skipped: skipped };
  }

  // ---------------- 纯函数：层级视觉 / 归属 ----------------

  // 四级层次的视觉规范：符号 / 字号 / 字重 / 左边框四项逐级不同（任意两层至少两项不同）。
  // 颜色取设计令牌（--accent / --accent-2 / --warn / --text-muted，均带字面回退），
  // 是「层次可辨认」的单一事实源：渲染层只读它，测试直接断言它；t9 在 style.css 落地时可比对这套数值。
  const FOCUS_LEVEL_VISUAL_KEYS = ['symbol', 'fontSize', 'fontWeight', 'borderWidth'];

  const FOCUS_LEVEL_VISUALS = {
    unit: {
      level: 'unit', rank: 0, symbol: '#', name: '任务单元',
      fontSize: 12.5, fontWeight: 400, borderWidth: 2,
      borderColor: 'var(--text-muted, #9AA3B2)', tint: 'rgba(148, 163, 184, 0.08)'
    },
    group: {
      level: 'group', rank: 1, symbol: '●', name: '任务组',
      fontSize: 14, fontWeight: 600, borderWidth: 3,
      borderColor: 'var(--accent, #3B82F6)', tint: 'rgba(59, 130, 246, 0.10)'
    },
    corps: {
      level: 'corps', rank: 2, symbol: '▲', name: '任务群',
      fontSize: 15.5, fontWeight: 700, borderWidth: 4,
      borderColor: 'var(--accent-2, #D4537E)', tint: 'rgba(212, 83, 126, 0.10)'
    },
    army: {
      level: 'army', rank: 3, symbol: '◆', name: '任务集团',
      fontSize: 17, fontWeight: 800, borderWidth: 5,
      borderColor: 'var(--warn, #F59E0B)', tint: 'rgba(245, 158, 11, 0.10)'
    }
  };

  function focusLevelVisual(level) {
    return FOCUS_LEVEL_VISUALS[String(level)] || null;
  }

  // 两层视觉差异项数（验收：任意两层 ≥ 2 项不同）；未知层次返回 -1
  function focusLevelVisualDelta(a, b) {
    const va = focusLevelVisual(a);
    const vb = focusLevelVisual(b);
    if (!va || !vb) return -1;
    if (va === vb) return 0;
    let n = 0;
    FOCUS_LEVEL_VISUAL_KEYS.forEach(function (k) { if (va[k] !== vb[k]) n += 1; });
    return n;
  }

  // 层级徽标：符号 + 层次名（+ 可选计数），名可取设置里的自定义层次名
  function focusLevelBadge(level, settings, count) {
    const v = focusLevelVisual(level);
    if (!v) return null;
    const names = (settings || {}).levelNames || {};
    const nm = String(names[v.level] || v.name);
    const n = Math.max(0, Math.floor(Number(count) || 0));
    return { level: v.level, symbol: v.symbol, name: nm, count: n, text: v.symbol + ' ' + nm + (n > 0 ? ' ' + n : '') };
  }

  // 归属可见性：子项挂在哪个父级下（父级层次符号 + 番号 + 名称）；未编入也返回一条 attached:false。
  // 归属恒由节点自身的显式类型 + parentId/orgId 决定，跨层级编入后立即反映（纯函数无缓存）。
  function focusParentAttribution(state, nodeId) {
    const st = state || {};
    const id = String(nodeId == null ? '' : nodeId);
    const unit = focusFindUnit(st, id);
    const org = unit ? null : focusFindOrg(st, id);
    if (!unit && !org) return null;
    const selfLevel = unit ? 'unit' : String(org.level);
    const parentId = unit ? (unit.orgId || null) : (org.parentId || null);
    const parent = parentId ? focusFindOrg(st, parentId) : null;
    if (!parent) {
      return {
        level: selfLevel, attached: false, parentId: null, parentLevel: null,
        parentSymbol: '·', parentSeq: 0, parentName: '', parentLabel: '', text: '未编入'
      };
    }
    const pv = focusLevelVisual(parent.level);
    const label = focusOrgLabel(parent, st.settings);
    return {
      level: selfLevel, attached: true, parentId: parent.id, parentLevel: String(parent.level),
      parentSymbol: pv ? pv.symbol : '', parentSeq: Number(parent.seq) || 0,
      parentName: String(parent.name == null ? '' : parent.name),
      parentLabel: label, text: '归属 ' + label
    };
  }

  // ---------------- 纯函数：悬浮提醒（任意视图可见的剩余时间） ----------------

  // 当前应显示的悬浮提醒：专注/侦查进行中优先，其次预约保留中；都没有则 visible:false。
  // 与 focusTickPlan 同源取数（focusUnitRemainingMs / focusReservationRemainingMs），
  // 但不读 currentView，因此任何视图下都能显示；DOM 落地见 focusReminderSync。
  function focusReminderInfo(state, now) {
    const st = state || {};
    const t = Number(now) || 0;
    const settings = st.settings || {};
    const chains = Array.isArray(st.chains) ? st.chains : [];
    const active = chains.filter(function (c) {
      return c && (c.status === 'running' || c.status === 'scouting') && c.current;
    })[0] || null;
    if (active) {
      const cur = active.current;
      const remain = focusUnitRemainingMs(cur, t);
      const isScout = String(cur.typeKey) === 'scout' && !cur.promotedFromScout;
      const planned = Number(cur.plannedMin) || 0;
      const elapsed = Math.max(0, planned * 60000 - remain);
      const typeNames = settings.typeNames || {};
      return {
        visible: true,
        mode: isScout ? 'scout' : 'focus',
        chainId: String(active.id),
        nodeId: focusUnitKey(active),
        key: focusUnitKey(active),
        level: 'unit',
        symbol: (focusLevelVisual('unit') || {}).symbol || '#',
        title: isScout ? '侦查进行中' : String(typeNames[cur.typeKey] || '专注中'),
        subtitle: focusWorkLabel(focusNextSeq(st, 'unit')) +
          (cur.taskText ? ' · ' + String(cur.taskText) : ''),
        remainMs: remain,
        expired: remain <= 0,
        clock: focusFmtClock(remain),
        startedAt: Number(cur.startedAt) || 0,
        plannedMin: planned,
        elapsedMin: Math.floor(elapsed / 60000),
        progressPct: planned > 0 ? Math.min(100, Math.round(elapsed / (planned * 60000) * 100)) : 0,
        workCount: 0
      };
    }
    const reserved = chains.filter(function (c) { return c && c.status === 'reserved' && c.reservation; })[0] || null;
    if (reserved) {
      const remain = focusReservationRemainingMs(reserved.reservation, t);
      const dl = Number(reserved.reservation.deadline) || 0;
      return {
        visible: true, mode: 'reserve', chainId: String(reserved.id), nodeId: String(reserved.id),
        key: 'reserve:' + String(reserved.id) + ':' + dl, level: 'reserve', symbol: '⏳',
        title: '预约待就座', subtitle: '座位保留' + (dl ? '至 ' + focusFmtTs(dl) : ''),
        remainMs: remain, expired: remain <= 0, clock: focusFmtClock(remain),
        startedAt: 0, plannedMin: 0, elapsedMin: 0, progressPct: 0,
        workCount: Number(reserved.workCount) || 0
      };
    }
    return {
      visible: false, mode: null, chainId: null, nodeId: null, key: null, level: null, symbol: '',
      title: '', subtitle: '', remainMs: 0, expired: false, clock: '',
      startedAt: 0, plannedMin: 0, elapsedMin: 0, progressPct: 0, workCount: 0
    };
  }

  // ---------------- 设置（纯；风味/三三制只在设置里改） ----------------

  function focusSetTypeName(state, typeKey, name, now) {
    const next = focusCloneState(state);
    if (!focusIsTypeKey(typeKey)) return { ok: false, reason: 'bad_type', state: next };
    const s = String(name == null ? '' : name).trim();
    if (!s) return { ok: false, reason: 'empty_name', state: next };
    next.settings.typeNames[typeKey] = s;
    return { ok: true, state: next };
  }

  function focusSetLevelName(state, level, name, now) {
    const next = focusCloneState(state);
    if (FOCUS_LEVEL_KEYS.indexOf(String(level)) < 0) return { ok: false, reason: 'bad_level', state: next };
    const s = String(name == null ? '' : name).trim();
    if (!s) return { ok: false, reason: 'empty_name', state: next };
    next.settings.levelNames[level] = s;
    return { ok: true, state: next };
  }

  function focusSetFlavor(state, on) {
    const next = focusCloneState(state);
    next.settings.flavor = !!on;
    return { ok: true, state: next, flavor: next.settings.flavor };
  }

  function focusSetStructure(state, structure) {
    const next = focusCloneState(state);
    next.settings.structure = structure === 'triad' ? 'triad' : 'free';
    return { ok: true, state: next, structure: next.settings.structure };
  }

  function focusSetPlanMode(state, on) {
    const next = focusCloneState(state);
    next.planMode = !!on;
    return { ok: true, state: next, planMode: next.planMode };
  }

  // ---------------- 链（主链 / 普通） ----------------

  // 创建链；主链唯一：已有 main 时拒绝，除非 inherit 覆盖
  function focusCreateChain(state, fields, now) {
    const next = focusCloneState(state);
    const f = fields || {};
    const tier = focusSanitizeTier(f.tier);
    const unit = focusClampMinutes(f.unitMinutes != null ? f.unitMinutes : next.settings.unitMinutes);
    const t = Number(now) || 0;

    if (tier === FOCUS_TIER_MAIN && focusMainChain(next)) {
      return { ok: false, reason: 'main_exists', state: next, chain: null };
    }

    const chain = {
      id: String(f.id || focusUid('chain')),
      tier: tier,
      seatNote: String(f.seatNote == null ? '' : f.seatNote),
      unitMinutes: unit,
      status: 'idle',
      workCount: 0,
      lastUnitAt: null,
      current: null,
      reservation: null,
      awaiting: null,
      clearedAt: null,
      clearReason: '',
      inheritedFrom: null,
      createdAt: t,
      updatedAt: t
    };
    if (focusFindChain(next, chain.id)) return { ok: false, reason: 'dup_id', state: next, chain: null };

    // 从普通链继承：拷贝工作量/座位/时长
    if (f.inheritFrom) {
      const src = focusFindChain(next, f.inheritFrom);
      if (!src) return { ok: false, reason: 'not_found', state: next, chain: null };
      if (src.tier === FOCUS_TIER_MAIN || src.role === FOCUS_ROLE_RESERVE) {
        return { ok: false, reason: 'bad_inherit', state: next, chain: null };
      }
      chain.workCount = src.workCount;
      chain.seatNote = src.seatNote || chain.seatNote;
      chain.unitMinutes = src.unitMinutes || chain.unitMinutes;
      chain.lastUnitAt = src.lastUnitAt;
      chain.inheritedFrom = src.id;
    }

    next.chains.push(chain);
    if (!next.activeId) next.activeId = chain.id;
    return { ok: true, state: next, chain: chain };
  }

  // 主链入口：重新创建 | 从普通链继承（同一时间只能有一个主链）
  function focusCreateMainChain(state, opts, now) {
    const o = opts || {};
    const mode = o.mode === 'inherit' ? 'inherit' : 'fresh';
    if (focusMainChain(state)) return { ok: false, reason: 'main_exists', state: focusCloneState(state) };
    if (mode === 'inherit') {
      if (!o.fromChainId) return { ok: false, reason: 'bad_inherit', state: focusCloneState(state) };
      return focusCreateChain(state, {
        tier: FOCUS_TIER_MAIN,
        inheritFrom: o.fromChainId,
        unitMinutes: o.unitMinutes
      }, now);
    }
    return focusCreateChain(state, {
      tier: FOCUS_TIER_MAIN,
      unitMinutes: o.unitMinutes,
      seatNote: o.seatNote
    }, now);
  }

  function focusSetSeatNote(state, chainId, note, now) {
    const next = focusCloneState(state);
    const ch = focusFindChain(next, chainId);
    if (!ch) return { ok: false, reason: 'not_found', state: next };
    ch.seatNote = String(note == null ? '' : note);
    ch.updatedAt = Number(now) || 0;
    return { ok: true, state: next, chain: ch };
  }

  function focusSetUnitMinutes(state, chainId, minutes, now) {
    const next = focusCloneState(state);
    const ch = focusFindChain(next, chainId);
    if (!ch) return { ok: false, reason: 'not_found', state: next };
    ch.unitMinutes = focusClampMinutes(minutes);
    ch.updatedAt = Number(now) || 0;
    return { ok: true, state: next, chain: ch };
  }

  function focusSetActive(state, chainId) {
    const next = focusCloneState(state);
    if (!focusFindChain(next, chainId)) return { ok: false, reason: 'not_found', state: next };
    next.activeId = String(chainId);
    return { ok: true, state: next };
  }

  function focusReserve(state, chainId, now) {
    const next = focusCloneState(state);
    const ch = focusFindChain(next, chainId);
    if (!ch) return { ok: false, reason: 'not_found', state: next };
    // 预约链自身不产生预约；计数绑定其他链的预约
    if (focusIsReserveChain(ch)) return { ok: false, reason: 'reserve_chain_bound', state: next };
    if (ch.status === 'running' || ch.status === 'scouting' || ch.status === 'awaiting_verdict') {
      return { ok: false, reason: 'busy', state: next };
    }
    const t = Number(now) || 0;
    const win = (next.settings.reserveWindowMin || 15) * 60000;
    ch.reservation = { signalAt: t, deadline: t + win };
    ch.status = 'reserved';
    ch.current = null;
    ch.updatedAt = t;
    return { ok: true, state: next, chain: ch, reservation: ch.reservation };
  }

  // 预约链：其他链预约违规（窗口内未就座）→ 计数从零开始
  function focusExpireReservations(state, now) {
    const next = focusCloneState(state);
    const t = Number(now) || 0;
    let expired = [];
    let reserveReset = false;
    next.chains.forEach(function (ch) {
      if (!ch || !ch.reservation) return;
      if (focusIsReservationOpen(ch.reservation, t)) return;
      ch.reservation = null;
      if (ch.status === 'reserved') ch.status = 'idle';
      ch.updatedAt = t;
      // 任一链预约违规 → 预约链清零
      if (!focusIsReserveChain(ch)) {
        reserveReset = true;
        expired.push(ch.id);
      }
    });
    if (reserveReset) {
      const rc = focusFindChain(next, FOCUS_RESERVE_CHAIN_ID);
      if (rc && rc.workCount > 0) {
        rc.workCount = 0;
        rc.updatedAt = t;
      }
    }
    return { ok: true, state: next, expired: expired, reserveReset: reserveReset };
  }

  function focusIsReserveChain(ch) {
    return !!ch && ch.role === FOCUS_ROLE_RESERVE;
  }

  // 预约链计数 +1（由其他链预约成功后就座触发）
  function focusBumpReserveCount(state, now) {
    const next = focusCloneState(state);
    const rc = focusFindChain(next, FOCUS_RESERVE_CHAIN_ID);
    if (!rc) return { ok: false, reason: 'not_found', state: next };
    const t = Number(now) || 0;
    rc.workCount += 1;
    rc.lastUnitAt = t;
    rc.updatedAt = t;
    return { ok: true, state: next, chain: rc, label: focusWorkLabel(rc.workCount) };
  }

  // ---------------- H2：单元任务化 ----------------

  function focusSitDown(state, chainId, now, opts) {
    const next = focusCloneState(state);
    const ch = focusFindChain(next, chainId);
    if (!ch) return { ok: false, reason: 'not_found', state: next };
    // 预约链仅计数，不自行就座/开单元
    if (focusIsReserveChain(ch)) return { ok: false, reason: 'reserve_chain_bound', state: next };
    if (ch.status === 'running' || ch.status === 'scouting' || ch.status === 'awaiting_verdict') {
      return { ok: false, reason: 'busy', state: next };
    }
    const o = opts || {};
    const taskText = String(o.taskText == null ? '' : o.taskText).trim();
    if (!taskText) return { ok: false, reason: 'empty_task', state: next };
    const typeKey = focusIsTypeKey(o.typeKey) ? String(o.typeKey) : 'focus';
    if (typeKey === 'scout') return { ok: false, reason: 'use_scout', state: next };
    const t = Number(now) || 0;
    let minutes = ch.unitMinutes;
    if (o.minutes != null) minutes = focusClampMinutes(o.minutes);
    let hadOpenReservation = false;
    if (ch.reservation) {
      if (!focusIsReservationOpen(ch.reservation, t)) {
        ch.reservation = null;
        if (ch.status === 'reserved') ch.status = 'idle';
        // 其他链预约违规 → 预约链从零开始
        const rc = focusFindChain(next, FOCUS_RESERVE_CHAIN_ID);
        if (rc && rc.workCount > 0) {
          rc.workCount = 0;
          rc.updatedAt = t;
        }
        return { ok: false, reason: 'reservation_expired', state: next, chain: ch };
      }
      ch.reservation = null;
      hadOpenReservation = true;
    }
    ch.current = {
      typeKey: typeKey,
      taskText: taskText,
      startedAt: t,
      plannedMin: minutes,
      extendCount: 0,
      promotedFromScout: false,
      planId: o.planId == null ? null : String(o.planId)
    };
    ch.status = 'running';
    ch.updatedAt = t;
    // 其他链预约成功就座 → 预约链 +1
    if (hadOpenReservation) {
      const rc = focusFindChain(next, FOCUS_RESERVE_CHAIN_ID);
      if (rc) {
        rc.workCount += 1;
        rc.lastUnitAt = t;
        rc.updatedAt = t;
      }
      return {
        ok: true, state: next, chain: ch,
        reserveCounted: true,
        reserveLabel: rc ? focusWorkLabel(rc.workCount) : null
      };
    }
    return { ok: true, state: next, chain: ch, reserveCounted: false };
  }

  // 完成：仅计时结束；记达成+完成度+实际分钟；入 units（name 缺省=任务内容）
  function focusCompleteUnit(state, chainId, now, opts) {
    const next = focusCloneState(state);
    const ch = focusFindChain(next, chainId);
    if (!ch) return { ok: false, reason: 'not_found', state: next };
    if (!ch.current) return { ok: false, reason: 'no_unit', state: next };
    const t = Number(now) || 0;
    const cur = ch.current;
    if (!focusCanComplete(cur, t)) {
      return { ok: false, reason: 'timer_not_done', state: next, remainingMs: focusUnitRemainingMs(cur, t) };
    }
    const o = opts || {};
    const typeKey = cur.typeKey;
    ch.current = null;
    ch.updatedAt = t;

    // 预约链：仅计数（就座时已 +1），完成不入流水/不编制
    if (focusIsReserveChain(ch)) {
      if (ch.status === 'running') ch.status = 'idle';
      return {
        ok: true, state: next, chain: ch, kind: 'reserve',
        workCount: ch.workCount, label: focusWorkLabel(ch.workCount), unit: null
      };
    }

    if (typeKey === 'scout' && !cur.promotedFromScout) {
      if (ch.status === 'scouting') ch.status = 'idle';
      return { ok: true, state: next, chain: ch, kind: 'scout', workCount: ch.workCount, label: null, unit: null };
    }

    const achieved = o.achieved == null ? true : !!o.achieved;
    const completion = focusClampPct(o.completion == null ? (achieved ? 100 : 0) : o.completion);
    // 番号：同层最小空缺号（单元不删除，等价于递增流水）
    const unitSeq = focusNextSeq(next, 'unit');
    next.seq.unit = Math.max(Number(next.seq.unit) || 0, unitSeq);
    const actualMin = Math.max(0, Math.round((t - cur.startedAt) / 60000));
    const name = String(o.name == null ? '' : o.name).trim() || cur.taskText;
    const unit = {
      id: focusUid('unit'),
      seq: unitSeq,
      typeKey: typeKey,
      name: name,
      taskText: cur.taskText,
      chainId: ch.id,
      orgId: o.orgId == null ? null : String(o.orgId),
      planId: cur.planId || null,
      startedAt: cur.startedAt,
      endedAt: t,
      plannedMin: cur.plannedMin,
      actualMin: actualMin,
      achieved: achieved,
      completion: completion,
      promotedFromScout: !!cur.promotedFromScout
    };
    next.units.push(unit);
    ch.workCount += 1;
    ch.lastUnitAt = t;
    if (ch.status === 'running' || ch.status === 'scouting') ch.status = 'idle';
    return {
      ok: true, state: next, chain: ch, kind: typeKey, unit: unit,
      workCount: ch.workCount, label: focusSeqLabel('unit', unit.seq)
    };
  }

  function focusSetUnitName(state, unitId, name, now) {
    const next = focusCloneState(state);
    const u = focusFindUnit(next, unitId);
    if (!u) return { ok: false, reason: 'not_found', state: next };
    u.name = String(name == null ? '' : name).trim();
    return { ok: true, state: next, unit: u };
  }

  function focusScoutPromote(state, chainId, typeKey, now) {
    const next = focusCloneState(state);
    const ch = focusFindChain(next, chainId);
    if (!ch) return { ok: false, reason: 'not_found', state: next };
    if (!ch.current || ch.current.typeKey !== 'scout') return { ok: false, reason: 'not_scouting', state: next };
    if (!focusCanComplete(ch.current, now)) {
      return { ok: false, reason: 'timer_not_done', state: next, remainingMs: focusUnitRemainingMs(ch.current, now) };
    }
    const tk = String(typeKey);
    if (FOCUS_FORMAL_TYPE_KEYS.indexOf(tk) < 0) return { ok: false, reason: 'bad_type', state: next };
    const t = Number(now) || 0;
    ch.current.typeKey = tk;
    ch.current.promotedFromScout = true;
    ch.status = 'running';
    ch.updatedAt = t;
    return { ok: true, state: next, chain: ch, typeKey: tk };
  }

  function focusFlagSuspicious(state, chainId, behavior, now) {
    const next = focusCloneState(state);
    const ch = focusFindChain(next, chainId);
    if (!ch) return { ok: false, reason: 'not_found', state: next };
    const b = focusNormalizeBehavior(behavior);
    if (!b) return { ok: false, reason: 'empty_behavior', state: next };
    const prec = focusIsPrecedent(next.precedents, b);
    if (prec) return { ok: true, state: next, chain: ch, alreadyAllowed: true, precedent: prec };
    if (ch.status !== 'running' && ch.status !== 'scouting') {
      return { ok: false, reason: 'not_in_unit', state: next };
    }
    const t = Number(now) || 0;
    ch.awaiting = { behavior: b, at: t };
    ch.status = 'awaiting_verdict';
    ch.updatedAt = t;
    return { ok: true, state: next, chain: ch, alreadyAllowed: false, awaiting: ch.awaiting };
  }

  function focusResolveSuspicious(state, chainId, decision, now) {
    const next = focusCloneState(state);
    const ch = focusFindChain(next, chainId);
    if (!ch) return { ok: false, reason: 'not_found', state: next };
    if (!ch.awaiting) return { ok: false, reason: 'no_pending', state: next };
    const t = Number(now) || 0;
    const behavior = ch.awaiting.behavior;
    ch.awaiting = null;
    ch.updatedAt = t;

    if (decision === 'clear') {
      ch.workCount = 0;
      ch.current = null;
      ch.status = 'cleared';
      ch.clearedAt = t;
      ch.clearReason = behavior;
      if (ch.tier === FOCUS_TIER_MAIN) {
        const suc = focusSuccession(next, t);
        const after = suc.state || next;
        return {
          ok: true, state: after, chain: focusFindChain(after, chainId),
          decision: 'clear', behavior: behavior, successorId: suc.successorId || null, workCount: 0
        };
      }
      return { ok: true, state: next, chain: ch, decision: 'clear', behavior: behavior, successorId: null, workCount: 0 };
    }

    if (decision === 'allow') {
      const exists = focusIsPrecedent(next.precedents, behavior);
      if (!exists) {
        next.precedents.push({ id: focusUid('prec'), behavior: behavior, note: '', createdAt: t });
      }
      if (ch.current) ch.status = ch.current.typeKey === 'scout' ? 'scouting' : 'running';
      else ch.status = 'idle';
      return {
        ok: true, state: next, chain: ch, decision: 'allow', behavior: behavior,
        precedent: exists || next.precedents[next.precedents.length - 1], workCount: ch.workCount
      };
    }
    return { ok: false, reason: 'bad_decision', state: next };
  }

  function focusScoutStart(state, chainId, now, opts) {
    const next = focusCloneState(state);
    const ch = focusFindChain(next, chainId);
    if (!ch) return { ok: false, reason: 'not_found', state: next };
    if (ch.status === 'running' || ch.status === 'scouting' || ch.status === 'awaiting_verdict') {
      return { ok: false, reason: 'busy', state: next };
    }
    const o = opts || {};
    const taskText = String(o.taskText == null ? '' : o.taskText).trim();
    if (!taskText) return { ok: false, reason: 'empty_task', state: next };
    const t = Number(now) || 0;
    const minutes = o.minutes != null ? focusClampMinutes(o.minutes) : next.settings.scoutMinutes;
    ch.current = {
      typeKey: 'scout', taskText: taskText, startedAt: t, plannedMin: minutes,
      extendCount: 0, promotedFromScout: false,
      planId: o.planId == null ? null : String(o.planId)
    };
    ch.status = 'scouting';
    if (ch.reservation) ch.reservation = null;
    ch.updatedAt = t;
    return { ok: true, state: next, chain: ch };
  }

  function focusScoutExtend(state, chainId, now) {
    const next = focusCloneState(state);
    const ch = focusFindChain(next, chainId);
    if (!ch) return { ok: false, reason: 'not_found', state: next };
    if (!ch.current || ch.current.typeKey !== 'scout') return { ok: false, reason: 'not_scouting', state: next };
    const t = Number(now) || 0;
    ch.current.plannedMin += next.settings.scoutExtendMin;
    ch.current.extendCount += 1;
    ch.updatedAt = t;
    return { ok: true, state: next, chain: ch, minutes: ch.current.plannedMin };
  }

  function focusScoutEnd(state, chainId, now) {
    const next = focusCloneState(state);
    const ch = focusFindChain(next, chainId);
    if (!ch) return { ok: false, reason: 'not_found', state: next };
    if (!ch.current || (ch.current.typeKey !== 'scout' && !ch.current.promotedFromScout)) {
      return { ok: false, reason: 'not_scouting', state: next };
    }
    const t = Number(now) || 0;
    ch.current = null;
    if (ch.status === 'scouting') ch.status = 'idle';
    ch.updatedAt = t;
    return { ok: true, state: next, chain: ch, workCount: ch.workCount };
  }

  function focusStrongestNormal(state) {
    const normals = ((state && state.chains) || []).filter(function (c) {
      return c && c.tier === FOCUS_TIER_NORMAL && c.status !== 'cleared' && c.role !== FOCUS_ROLE_RESERVE;
    });
    if (!normals.length) return null;
    return normals.reduce(function (best, c) {
      return (!best || c.workCount > best.workCount) ? c : best;
    }, null);
  }

  // 主链崩溃 → 最强普通链继位
  function focusSuccession(state, now) {
    const next = focusCloneState(state);
    const main = next.chains.filter(function (c) {
      return c && c.tier === FOCUS_TIER_MAIN && c.status === 'cleared';
    })[0] || null;
    const best = focusStrongestNormal(next);
    if (!main || !best) return { ok: false, state: next, successorId: null, reason: main ? 'no_normal' : 'no_elite' };
    const t = Number(now) || 0;
    best.tier = FOCUS_TIER_MAIN;
    best.inheritedFrom = main.id;
    best.updatedAt = t;
    return { ok: true, state: next, successorId: best.id, fromId: main.id, workCount: best.workCount };
  }

  // ---------------- H2：统计 ----------------

  function focusDailyMinutes(state, opts) {
    const out = {};
    ((state && state.units) || []).forEach(function (u) {
      if (!u || !u.endedAt) return;
      if (opts && opts.typeKey && u.typeKey !== opts.typeKey) return;
      const day = focusYmd(u.endedAt);
      if (!day) return;
      out[day] = (out[day] || 0) + (u.actualMin || 0);
    });
    return out;
  }

  // 日均完成度（0–100）：当日已结束单元 completion 平均
  function focusDailyAvgCompletion(state, opts) {
    const sums = {};
    const counts = {};
    ((state && state.units) || []).forEach(function (u) {
      if (!u || !u.endedAt) return;
      if (opts && opts.typeKey && u.typeKey !== opts.typeKey) return;
      const day = focusYmd(u.endedAt);
      if (!day) return;
      sums[day] = (sums[day] || 0) + focusClampPct(u.completion);
      counts[day] = (counts[day] || 0) + 1;
    });
    const out = {};
    Object.keys(sums).forEach(function (d) {
      out[d] = Math.round(sums[d] / counts[d]);
    });
    return out;
  }

  function focusTrendSeries(state, days, endDateTs) {
    const n = Math.max(1, Math.min(365, Number(days) || 30));
    const end = Number(endDateTs) || Date.now();
    const map = focusDailyMinutes(state);
    const avg = focusDailyAvgCompletion(state);
    const out = [];
    for (let i = n - 1; i >= 0; i--) {
      const ts = end - i * 86400000;
      const day = focusYmd(ts);
      out.push({
        date: day,
        minutes: map[day] || 0,
        avgCompletion: avg[day] == null ? null : avg[day]
      });
    }
    return out;
  }

  // ---------------- H3：编制树 / 聚合 ----------------

  function focusCreateOrg(state, fields, now) {
    const next = focusCloneState(state);
    const f = fields || {};
    const level = String(f.level || 'group');
    if (!focusIsOrgLevel(level)) return { ok: false, reason: 'bad_level', state: next };
    // 高层次任务创建须计划模式
    if (!next.planMode && !f.force) return { ok: false, reason: 'need_plan_mode', state: next };
    const t = Number(now) || 0;
    const fromPlan = f.fromPlan == null ? next.planMode : !!f.fromPlan;
    // 计划参数：最小下级数 1..99 + 合法截止日期（与「添加子级」入口共用同一校验）
    const plan = focusPlanNodeFields(f, 1);
    if (!plan.ok) return { ok: false, reason: plan.reason, state: next, org: null };
    const org = {
      id: String(f.id || focusUid('org')),
      level: level,
      seq: 0,
      name: plan.name,
      parentId: f.parentId == null || f.parentId === '' ? null : String(f.parentId),
      planId: f.planId == null ? null : String(f.planId),
      fromPlan: fromPlan,
      formalized: !fromPlan,
      dueAt: plan.dueAt,
      minChildCount: plan.minChildCount,
      createdAt: t,
      updatedAt: t
    };
    if (focusFindOrg(next, org.id)) return { ok: false, reason: 'dup_id', state: next, org: null };
    if (org.parentId) {
      const parent = focusFindOrg(next, org.parentId);
      if (!parent) return { ok: false, reason: 'bad_parent', state: next, org: null };
      // 层次严格：父级须恰为上一级（显式 level 判定，不看父级槽位）
      if (!focusCanAttach(level, parent.level)) return { ok: false, reason: 'bad_parent', state: next, org: null };
    }
    // 番号：同层级最小空缺号（删除后复用）；已有节点番号不变、同层不重号
    org.seq = focusNextSeq(next, level);
    next.seq[level] = Math.max(Number(next.seq[level]) || 0, org.seq);
    next.orgs.push(org);
    return { ok: true, state: next, org: org };
  }

  function focusRenameOrg(state, orgId, name, now) {
    const next = focusCloneState(state);
    const org = focusFindOrg(next, orgId);
    if (!org) return { ok: false, reason: 'not_found', state: next };
    org.name = String(name == null ? '' : name);
    org.updatedAt = Number(now) || 0;
    return { ok: true, state: next, org: org };
  }

  function focusDeleteOrg(state, orgId, now) {
    const next = focusCloneState(state);
    const org = focusFindOrg(next, orgId);
    if (!org) return { ok: false, reason: 'not_found', state: next };
    const removed = [];
    const stack = [String(orgId)];
    const kill = {};
    while (stack.length) {
      const id = stack.pop();
      if (kill[id]) continue;
      kill[id] = 1;
      removed.push(id);
      next.orgs.forEach(function (o) {
        if (o && o.parentId === id) stack.push(o.id);
      });
    }
    next.orgs = next.orgs.filter(function (o) { return o && !kill[o.id]; });
    next.units.forEach(function (u) {
      if (u && u.orgId && kill[u.orgId]) u.orgId = null;
    });
    // 番号回收：同层新节点复用最小空缺号（只有现存节点占号）
    FOCUS_ORG_LEVELS.forEach(function (lv) {
      next.seq[lv] = focusMaxSeq(next, lv);
    });
    return { ok: true, state: next, removed: removed };
  }

  // 单个单元编入 / 移出任务组
  function focusAssignUnit(state, unitId, orgId, now) {
    if (!focusFindUnit(state, unitId)) {
      const next = focusCloneState(state);
      return { ok: false, reason: 'not_found', state: next };
    }
    const r = focusAttachNodes(state, [unitId], orgId, now);
    if (!r.ok) return { ok: false, reason: 'bad_org', state: r.state };
    return { ok: true, state: r.state, unit: focusFindUnit(r.state, unitId) };
  }

  // 批量编入 / 移动（树内多选组合）；单元只能进任务组
  function focusAssignUnits(state, unitIds, orgId, now) {
    const r = focusAttachNodes(state, unitIds, orgId, now);
    if (!r.ok) {
      return { ok: false, reason: r.reason === 'empty_selection' ? 'empty_selection' : 'bad_org', state: r.state };
    }
    return { ok: true, state: r.state, touched: r.touched, skipped: r.skipped };
  }

  // 批量改父（树内多选组合到已有节点）：组→群、群→集团，逐级严格
  function focusReparentOrgs(state, orgIds, parentId, now) {
    const r = focusAttachNodes(state, orgIds, parentId, now);
    if (!r.ok) return { ok: false, reason: r.reason, state: r.state };
    return { ok: true, state: r.state, touched: r.touched, skipped: r.skipped };
  }

  // 组合：多选节点合成一个新节点。产物层次 = 成员最高层 + 1（单元→组、组→群、群→集团）；
  // 成员层次须一致且都能编入产物层次，否则整单失败（不留半个产物）。
  function focusCombineNodes(state, fields, now) {
    const next = focusCloneState(state);
    const f = fields || {};
    const rawIds = Array.isArray(f.ids) ? f.ids : (Array.isArray(f.nodeIds) ? f.nodeIds : []);
    const ids = rawIds.map(String);
    if (!ids.length) return { ok: false, reason: 'empty_selection', state: next };
    const levels = ids.map(function (id) { return focusNodeLevel(next, id); });
    if (levels.filter(Boolean).length !== ids.length) return { ok: false, reason: 'not_found', state: next };
    const derived = focusCombineLevelOf(next, ids);
    const level = f.level == null || f.level === '' ? derived : String(f.level);
    if (!level) return { ok: false, reason: 'no_level_up', state: next };
    if (!focusIsOrgLevel(level)) return { ok: false, reason: 'bad_level', state: next };
    const mismatch = ids.filter(function (id, i) { return !focusCanAttach(levels[i], level); });
    if (mismatch.length) return { ok: false, reason: 'member_level_mismatch', state: next };
    const parentId = f.parentId == null || f.parentId === '' ? null : String(f.parentId);
    if (parentId) {
      const parent = focusFindOrg(next, parentId);
      if (!parent) return { ok: false, reason: 'bad_parent', state: next };
      if (!focusCanAttach(level, parent.level)) return { ok: false, reason: 'bad_parent', state: next };
    }
    const t = Number(now) || 0;
    const plan = focusPlanNodeFields(f, 1);
    if (!plan.ok) return { ok: false, reason: plan.reason, state: next };
    const cr = focusCreateOrg(next, {
      level: level,
      name: plan.name,
      parentId: parentId,
      planId: f.planId,
      fromPlan: f.fromPlan,
      force: f.force,
      dueAt: plan.dueAt,
      minChildCount: plan.minChildCount
    }, t);
    if (!cr.ok) return { ok: false, reason: cr.reason, state: next };
    const ar = focusAttachNodes(cr.state, ids, cr.org.id, t);
    if (!ar.ok) return { ok: false, reason: 'member_level_mismatch', state: next };
    return { ok: true, state: ar.state, org: cr.org, level: level, touched: ar.touched };
  }

  function focusIsAncestorOrg(state, maybeAncestorId, nodeId) {
    let cur = focusFindOrg(state, nodeId);
    const guard = {};
    while (cur && cur.parentId && !guard[cur.id]) {
      guard[cur.id] = 1;
      if (cur.parentId === String(maybeAncestorId)) return true;
      cur = focusFindOrg(state, cur.parentId);
    }
    return false;
  }

  function focusUnassignedUnits(state) {
    return ((state && state.units) || []).filter(function (u) { return u && !u.orgId; });
  }

  // 直接下一级任务数：下一级由节点的显式层次决定（组 → 单元；群 → 组；集团 → 群），
  // 不看「哪个槽位有内容」——与 focusOrgCanFormalize / 树内展示同一口径。
  function focusNextLevelCount(state, orgId) {
    const org = focusFindOrg(state, orgId);
    if (!org) return 0;
    const childLevel = focusChildLevelOf(org.level);
    const childOrgs = ((state && state.orgs) || []).filter(function (o) { return o && o.parentId === orgId; });
    const childUnits = ((state && state.units) || []).filter(function (u) { return u && u.orgId === orgId; });
    if (childLevel === 'unit') return childUnits.length;
    if (childLevel) return childOrgs.filter(function (o) { return o.level === childLevel; }).length;
    return childOrgs.length || childUnits.length;
  }

  // 子树单元（含自身直接挂的 + 孙级）
  function focusDescendantUnitIds(state, orgId) {
    const orgs = (state && state.orgs) || [];
    const byParent = {};
    orgs.forEach(function (o) {
      if (!o) return;
      const p = o.parentId == null ? '' : String(o.parentId);
      if (!byParent[p]) byParent[p] = [];
      byParent[p].push(String(o.id));
    });
    const stack = [String(orgId)];
    const seen = {};
    const orgIds = [];
    while (stack.length) {
      const cur = stack.pop();
      if (seen[cur]) continue;
      seen[cur] = 1;
      orgIds.push(cur);
      (byParent[cur] || []).forEach(function (k) { stack.push(k); });
    }
    const idSet = {};
    orgIds.forEach(function (id) { idSet[id] = 1; });
    return ((state && state.units) || [])
      .filter(function (u) { return u && u.orgId && idSet[String(u.orgId)]; })
      .map(function (u) { return u.id; });
  }

  // 高层聚合：子树全部单元的 总起止 / 总时长 / 平均完成度
  function focusOrgAggregates(state, orgId) {
    const ids = focusDescendantUnitIds(state, orgId);
    const units = ids.map(function (id) { return focusFindUnit(state, id); }).filter(Boolean);
    if (!units.length) {
      return { unitCount: 0, startAt: null, endAt: null, totalMin: 0, avgCompletion: null, totalPlannedMin: 0 };
    }
    let startAt = units[0].startedAt || 0;
    let endAt = units[0].endedAt || 0;
    let totalMin = 0;
    let totalPlanned = 0;
    let sumPct = 0;
    units.forEach(function (u) {
      if (u.startedAt && (!startAt || u.startedAt < startAt)) startAt = u.startedAt;
      if (u.endedAt && u.endedAt > endAt) endAt = u.endedAt;
      totalMin += u.actualMin || 0;
      totalPlanned += u.plannedMin || 0;
      sumPct += focusClampPct(u.completion);
    });
    return {
      unitCount: units.length,
      startAt: startAt || null,
      endAt: endAt || null,
      totalMin: totalMin,
      totalPlannedMin: totalPlanned,
      avgCompletion: Math.round(sumPct / units.length)
    };
  }

  // 计划高层转正：下级任务数须 ≥ minChildCount（默认 1）
  function focusOrgCanFormalize(state, orgId) {
    const org = focusFindOrg(state, orgId);
    if (!org) return { ok: false, reason: 'not_found' };
    if (!org.fromPlan) return { ok: false, reason: 'not_plan' };
    if (org.formalized) return { ok: false, reason: 'already_formal' };
    const need = Math.max(1, Number(org.minChildCount) || 1);
    // 下一级由显式层次决定：组看单元、群看组、集团看群（与树内展示同一口径）
    const nextLevelCount = focusNextLevelCount(state, org.id);
    if (nextLevelCount < need) {
      return { ok: false, reason: 'need_fill', need: need, childCount: nextLevelCount };
    }
    return { ok: true, need: need, childCount: nextLevelCount };
  }

  function focusFormalizeOrg(state, orgId, now) {
    const next = focusCloneState(state);
    const chk = focusOrgCanFormalize(next, orgId);
    if (!chk.ok) return { ok: false, reason: chk.reason, state: next };
    const org = focusFindOrg(next, orgId);
    org.formalized = true;
    org.updatedAt = Number(now) || 0;
    return { ok: true, state: next, org: org };
  }

  function focusTemplateTriad(state, fields, now) {
    const next = focusCloneState(state);
    const f = fields || {};
    const count = Math.max(1, Math.min(9, Number(f.count) || next.settings.triadChildCount || 3));
    const parentId = f.parentId == null ? null : String(f.parentId);
    if (!next.planMode && !f.force) return { ok: false, reason: 'need_plan_mode', state: next, created: [] };
    let level = 'group';
    if (parentId) {
      const parent = focusFindOrg(next, parentId);
      if (!parent) return { ok: false, reason: 'bad_parent', state: next, created: [] };
      // 下一级由父级显式层次决定；组之下是单元，不能在此批量创建
      const childLevel = focusChildLevelOf(parent.level);
      if (!childLevel || !focusIsOrgLevel(childLevel)) return { ok: false, reason: 'bad_parent', state: next, created: [] };
      level = childLevel;
    }
    const created = [];
    const t = Number(now) || 0;
    const fromPlan = f.fromPlan == null ? next.planMode : !!f.fromPlan;
    // 批量创建同样共用计划参数校验（最小下级数 1..99、合法截止日期）
    if (!focusDueDateValid(f.dueAt)) return { ok: false, reason: 'bad_due', state: next, created: [] };
    const triadDueAt = focusNormalizeDueAt(f.dueAt);
    const triadMinChild = focusNormalizeMinChildCount(f.minChildCount, 1);
    for (let i = 0; i < count; i++) {
      const seq = focusNextSeq(next, level);
      next.seq[level] = Math.max(Number(next.seq[level]) || 0, seq);
      const org = {
        id: focusUid('org'),
        level: level,
        seq: seq,
        name: '',
        parentId: parentId,
        planId: f.planId == null ? null : String(f.planId),
        fromPlan: fromPlan,
        formalized: !fromPlan,
        dueAt: triadDueAt,
        minChildCount: triadMinChild,
        createdAt: t,
        updatedAt: t
      };
      next.orgs.push(org);
      created.push(org);
    }
    return { ok: true, state: next, created: created, level: level };
  }

  // 竖列树行
  function focusTreeRows(state, opts) {
    const o = opts || {};
    const collapsed = o.collapsed || {};
    const chainFilter = o.chainFilter == null ? null : String(o.chainFilter);
    const assignFilter = o.assignFilter || 'all';
    const rows = [];
    const orgs = (state && state.orgs) || [];
    const allUnits = (state && state.units) || [];
    const byChain = chainFilter
      ? allUnits.filter(function (u) { return u && String(u.chainId) === chainFilter; })
      : allUnits;
    const units = byChain.filter(function (u) {
      if (!u) return false;
      if (assignFilter === 'unassigned') return !u.orgId;
      if (assignFilter === 'assigned') return !!u.orgId;
      return true;
    });

    function unitRow(u, depth) {
      rows.push({
        kind: 'unit', depth: depth, id: u.id, unit: u,
        label: focusUnitLabel(u, state.settings),
        level: 'unit',
        visual: focusLevelVisual('unit'),
        parent: focusParentAttribution(state, u.id),
        aggregates: null
      });
    }

    function orgRow(org, depth) {
      const agg = focusOrgAggregates(state, org.id);
      rows.push({
        kind: 'org', depth: depth, id: org.id, org: org,
        label: focusOrgLabel(org, state.settings),
        level: org.level,
        visual: focusLevelVisual(org.level),
        parent: focusParentAttribution(state, org.id),
        collapsed: !!collapsed[org.id],
        aggregates: agg
      });
    }

    function childrenOf(parentId) {
      return orgs.filter(function (x) {
        return x && (x.parentId == null ? parentId == null : x.parentId === parentId);
      });
    }

    function walk(parentId, depth) {
      childrenOf(parentId).slice().sort(function (a, b) { return a.seq - b.seq; }).forEach(function (org) {
        orgRow(org, depth);
        if (!collapsed[org.id]) {
          walk(org.id, depth + 1);
          units.filter(function (u) { return u && u.orgId === org.id; })
            .sort(function (a, b) { return a.seq - b.seq; })
            .forEach(function (u) { unitRow(u, depth + 1); });
        }
      });
    }

    if (assignFilter === 'unassigned' || assignFilter === 'assigned') {
      rows.push({ kind: 'root', depth: 0, id: '__unassigned', label: assignFilter === 'unassigned' ? '未编入' : '已编入', aggregates: null });
      units.slice().sort(function (a, b) { return a.seq - b.seq; }).forEach(function (u) { unitRow(u, 1); });
      return rows;
    }

    walk(null, 0);
    const unassigned = units.filter(function (u) { return u && !u.orgId; });
    if (unassigned.length || o.showUnassignedRoot !== false) {
      rows.push({ kind: 'root', depth: 0, id: '__unassigned', label: '未编入', aggregates: null });
      if (!collapsed['__unassigned']) {
        unassigned.slice().sort(function (a, b) { return a.seq - b.seq; }).forEach(function (u) { unitRow(u, 1); });
      }
    }
    return rows;
  }

  // ---------------- 计划（并入状态模块） ----------------

  function focusPlanCreate(state, fields, now) {
    const next = focusCloneState(state);
    const f = fields || {};
    const title = String(f.title == null ? '' : f.title).trim();
    if (!title) return { ok: false, reason: 'empty_title', state: next };
    const dueAt = Number(f.dueAt) || 0;
    if (!dueAt) return { ok: false, reason: 'empty_due', state: next };
    const target = Number(f.targetCount);
    if (!Number.isFinite(target) || target < 1) return { ok: false, reason: 'bad_target', state: next };
    const t = Number(now) || 0;
    const plan = {
      id: String(f.id || focusUid('plan')),
      title: title,
      dueAt: dueAt,
      targetCount: Math.floor(target),
      template: f.template === 'triad' ? 'triad' : 'free',
      orgId: f.orgId == null ? null : String(f.orgId),
      status: 'active',
      createdAt: t
    };
    if (focusFindPlan(next, plan.id)) return { ok: false, reason: 'dup_id', state: next, plan: null };
    next.plans.push(plan);
    return { ok: true, state: next, plan: plan };
  }

  function focusPlanFilledCount(state, planId) {
    const p = focusFindPlan(state, planId);
    if (!p) return 0;
    return ((state && state.units) || []).filter(function (u) { return u && u.planId === p.id; }).length;
  }

  function focusPlanDueSoon(state, now) {
    const t = Number(now) || 0;
    const days = ((state && state.settings) || focusDefaultSettings()).planDueRemindDays;
    const win = days * 86400000;
    return ((state && state.plans) || []).filter(function (p) {
      if (!p || p.status !== 'active') return false;
      return p.dueAt && p.dueAt - t <= win && p.dueAt >= t - 86400000;
    });
  }

  function focusPlanOverdue(state, now) {
    const t = Number(now) || 0;
    return ((state && state.plans) || []).filter(function (p) {
      return p && p.status === 'active' && p.dueAt && p.dueAt < t;
    });
  }

  function focusPlanSettle(state, planId, now) {
    const next = focusCloneState(state);
    const p = focusFindPlan(next, planId);
    if (!p) return { ok: false, reason: 'not_found', state: next };
    if (p.status !== 'active') return { ok: false, reason: 'not_active', state: next };
    const filled = focusPlanFilledCount(next, planId);
    const t = Number(now) || 0;
    if (filled >= p.targetCount) {
      p.status = 'done';
      return { ok: true, state: next, plan: p, filled: filled, cleared: false };
    }
    p.status = 'failed';
    next.chains.forEach(function (c) {
      if (!c) return;
      c.workCount = 0;
      c.current = null;
      if (c.status === 'running' || c.status === 'scouting' || c.status === 'reserved' || c.status === 'awaiting_verdict') {
        c.status = 'cleared';
        c.clearedAt = t;
        c.clearReason = 'plan:' + p.id;
      }
    });
    return { ok: true, state: next, plan: p, filled: filled, cleared: true, target: p.targetCount };
  }

  // ---------------- 存储 ----------------
  function loadFocus() {
    if (typeof window !== 'undefined' && window.__focusData) return window.__focusData;
    let raw = null;
    try { raw = JSON.parse(localStorage.getItem(FOCUS_KEY)); } catch (e) {}
    const data = focusSanitizeState(raw);
    if (typeof window !== 'undefined') window.__focusData = data;
    return data;
  }

  function saveFocus(data) {
    const d = data || focusDefaultState();
    if (typeof window !== 'undefined') window.__focusData = d;
    try { localStorage.setItem(FOCUS_KEY, JSON.stringify(d)); } catch (e) {}
    return d;
  }

  // ---------------- UI 会话态 ----------------
  let focusTickTimer = null;
  const focusUiState = {
    tab: 'seat',
    collapsed: {},
    assignFilter: 'all',       // all | assigned | unassigned（是否编入）
    selected: {},          // 树内多选
    dragId: null,          // 拖动源
    chainFilter: null      // 状态页按链筛选（null=全部）
  };

  function focusClearTick() {
    if (focusTickTimer) {
      clearInterval(focusTickTimer);
      focusTickTimer = null;
    }
  }

  // 到期提示的「一次性」标记：记录已提示过的单元身份（chain.id:startedAt:阶段）。
  // 旧实现的 bug：到期分支只 focusClearTick + renderApp，而此时 chain.status 仍是
  // running/scouting、current 仍在 → renderFocusSection 重新装表 → 下一秒又进到期分支
  // → 每秒一次 renderApp + 每秒 appendChild 一个新完成度弹窗（弹窗挂在 body 上，
  // renderApp 只清 #app，不会清掉旧的），叠成一摞后输入被新弹窗盖住、页面持续重渲染。
  // 修法：同一单元只处理一次（见 focusTickPlan 的 prompt），不再重复渲染/弹窗。
  let focusCompletePromptKey = null;

  // 单元身份：同一条链上同一 startedAt + 同一阶段（侦查 / 正式）视为同一个单元。
  // 侦查到期后「转正」会换阶段 → 允许再提示一次（转正后才是完成度询问）。
  function focusUnitKey(chain) {
    if (!chain || !chain.current) return null;
    const cur = chain.current;
    const phase = (cur.typeKey === 'scout' && !cur.promotedFromScout) ? 'scout' : 'formal';
    return chain.id + ':' + (Number(cur.startedAt) || 0) + ':' + phase;
  }

  // 每秒 tick 的纯决策（不碰 DOM，便于单测）：调用处按 action 施加副作用
  function focusTickPlan(chain, now, promptedKey) {
    if (!chain) return { action: 'none' };
    if (chain.status === 'running' || chain.status === 'scouting') {
      if (!chain.current) return { action: 'none' };
      const remain = focusUnitRemainingMs(chain.current, now);
      if (remain > 0) return { action: 'countdown', remainMs: remain };
      const cur = chain.current;
      const scoutPhase = cur.typeKey === 'scout' && !cur.promotedFromScout;
      const key = focusUnitKey(chain);
      const prompt = key !== promptedKey;
      return {
        action: 'expired',
        remainMs: 0,
        key: key,
        prompt: prompt,
        scoutPhase: scoutPhase,
        openModal: prompt && !scoutPhase
      };
    }
    if (chain.status === 'reserved' && chain.reservation) {
      const remain = focusReservationRemainingMs(chain.reservation, now);
      if (remain > 0) return { action: 'countdown', remainMs: remain };
      return { action: 'reservation_expired', remainMs: 0 };
    }
    return { action: 'none' };
  }

  function focusFmtClock(ms) {
    const s = Math.max(0, Math.ceil(ms / 1000));
    const m = Math.floor(s / 60);
    const r = s % 60;
    return m + ':' + String(r).padStart(2, '0');
  }

  function focusFmtTs(ts) {
    if (!ts) return '—';
    const d = new Date(Number(ts));
    return (d.getMonth() + 1) + '/' + d.getDate() + ' ' + String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0');
  }

  function focusFmtDur(min) {
    const m = Math.max(0, Math.round(Number(min) || 0));
    if (m < 60) return m + ' 分';
    return Math.floor(m / 60) + ' 时 ' + (m % 60) + ' 分';
  }

  function focusSelectedIds() {
    return Object.keys(focusUiState.selected).filter(function (k) { return focusUiState.selected[k]; });
  }

  function focusApply(mutator, msg) {
    const st = loadFocus();
    const r = mutator(st);
    if (r && r.state) saveFocus(r.state);
    renderApp();
    if (msg && r && r.ok) toast(msg);
    else if (!r || !r.ok) {
      const map = {
        busy: '当前有进行中的单元',
        not_found: '对象不存在',
        reservation_expired: '预约已超时',
        no_unit: '没有进行中的单元',
        empty_behavior: '请描述可疑行为',
        not_in_unit: '仅专注/侦查中途可标记可疑行为',
        no_pending: '没有待裁决的可疑行为',
        bad_decision: '无效选择',
        not_scouting: '当前不在侦查任务中',
        no_normal: '没有可继位的普通链',
        no_elite: '没有崩溃的主链',
        main_exists: '同一时间只能有一个主链',
        bad_inherit: '只能从普通链继承',
        dup_id: 'id 冲突',
        empty_task: '请先填写任务内容',
        timer_not_done: '计时结束才可完成',
        use_scout: '侦查请用「侦查」入口',
        bad_type: '无效类型',
        empty_name: '名称不能为空',
        bad_level: '无效层次',
        bad_parent: '父级层次不匹配',
        bad_org: '只能编入任务组',
        bad_due: '截止日期不合法',
        member_level_mismatch: '所选层次不一致，须逐级组合',
        no_level_up: '已是最高层次，无法再组合',
        bad_min_child: '最低下级数须为 1..99',
        need_plan_mode: '请先开启计划模式',
        need_fill: '须至少填充一个下级层次',
        not_plan: '不是计划创建的节点',
        already_formal: '已转正',
        empty_selection: '请先选择节点',
        reserve_chain_bound: '预约链仅计数，由其他链预约绑定',
        empty_title: '请填写计划标题',
        empty_due: '请设置截止时间',
        bad_target: '目标单元数须 ≥ 1',
        not_active: '计划已结算'
      };
      toast(map[(r && r.reason) || ''] || '操作失败');
    }
    return r;
  }

  // ---------------- UI：主入口 ----------------
  function renderFocusSection(wrap) {
    focusClearTick();
    const st = loadFocus();
    const now = Date.now();

    // tabs：专注 | 状态 | 统计（计划已并入状态）
    const tabs = el('div', 'chips act-tabs');
    [['seat', '专注'], ['tree', '状态'], ['stats', '统计']].forEach(function (t) {
      const chip = el('button', 'chip' + (focusUiState.tab === t[0] ? ' active' : ''), t[1]);
      chip.addEventListener('click', function () { focusUiState.tab = t[0]; renderApp(); });
      tabs.appendChild(chip);
    });
    wrap.appendChild(tabs);

    if (focusUiState.tab === 'tree') {
      focusRenderTree(wrap, st, now);
      return;
    }
    if (focusUiState.tab === 'stats') {
      focusRenderStats(wrap, st, now);
      return;
    }
    focusRenderSeat(wrap, st, now);
  }

  // ---------------- UI：专注座位 ----------------
  function focusRenderSeat(wrap, st, now) {
    if (!st.chains.length) {
      const panel = el('div', 'act-panel focus-empty');
      panel.appendChild(illus('empty-focus'));
      panel.appendChild(el('p', 'muted', '专注链：开始须写清任务；计时结束后记「是否达成 + 完成度」。'));
      const btns = el('div', 'focus-btns');
      const addN = el('button', 'btn primary', '创建普通链');
      addN.addEventListener('click', function () {
        focusApply(function (s) {
          return focusCreateChain(s, { tier: FOCUS_TIER_NORMAL, unitMinutes: s.settings.unitMinutes }, Date.now());
        }, '已创建普通链');
      });
      const addM = el('button', 'btn', '创建主链…');
      addM.addEventListener('click', function () { focusOpenMainChainModal(); });
      btns.appendChild(addN);
      btns.appendChild(addM);
      panel.appendChild(btns);
      wrap.appendChild(panel);
      return;
    }

    const chips = el('div', 'chips focus-chain-chips');
    st.chains.forEach(function (c) {
      const isRes = c.role === 'reserve';
      const isMain = c.tier === FOCUS_TIER_MAIN;
      const label = isRes
        ? '预约链 ' + focusWorkLabel(c.workCount)
        : (isMain ? '主链' : '普通') + ' ' + focusWorkLabel(c.workCount);
      const chip = el('button', 'chip' + (c.id === st.activeId ? ' active' : ''), label);
      chip.addEventListener('click', function () {
        focusApply(function (s) { return focusSetActive(s, c.id); });
      });
      chips.appendChild(chip);
    });
    const addChip = el('button', 'chip', '＋ 新链');
    addChip.addEventListener('click', function () {
      if (focusMainChain(st)) focusOpenCreateModal(true);
      else focusOpenMainChainModal();
    });
    chips.appendChild(addChip);
    wrap.appendChild(chips);

    const chain = focusActiveChain(st) || st.chains[0];
    if (!chain) return;

    const seat = el('div', 'act-panel focus-seat');
    const seatHead = el('div', 'focus-seat-head');
    seatHead.appendChild(el('h3', null, '神圣座位'));
    const isResChain = chain.role === 'reserve';
    const tierTxt = isResChain ? '预约链' : (chain.tier === FOCUS_TIER_MAIN ? '主链' : '普通链');
    seatHead.appendChild(el('span', 'focus-tier-badge' + (chain.tier === FOCUS_TIER_MAIN && !isResChain ? ' elite' : ''), tierTxt));
    seat.appendChild(seatHead);
    if (isResChain) {
      seat.appendChild(el('div', 'act-hint', '预约链自动存在：其他链「预约」成功并窗口内就座则 +1；违规则从零开始。仅计数，不编制，无独立预约/侦查。'));
    }

    const noteRow = el('div', 'focus-note-row');
    noteRow.appendChild(el('div', 'muted', '触发说明'));
    noteRow.appendChild(el('div', 'focus-seat-note', chain.seatNote || '（未填写——写下你坐下的触发情境）'));
    const editNote = el('button', 'btn small', '编辑说明');
    editNote.addEventListener('click', function () { focusOpenSeatModal(chain); });
    noteRow.appendChild(editNote);
    seat.appendChild(noteRow);

    const durRow = el('div', 'focus-dur-row');
    durRow.appendChild(el('span', 'muted', '单元时长'));
    FOCUS_DURATIONS.forEach(function (d) {
      const b = el('button', 'chip' + (chain.unitMinutes === d ? ' active' : ''), d + ' 分');
      b.addEventListener('click', function () {
        focusApply(function (s) { return focusSetUnitMinutes(s, chain.id, d, Date.now()); });
      });
      durRow.appendChild(b);
    });
    seat.appendChild(durRow);

    const statusBox = el('div', 'focus-status');
    if (chain.status === 'awaiting_verdict' && chain.awaiting) {
      statusBox.appendChild(el('div', 'focus-await-title', '下必为例 · 可疑行为裁决'));
      statusBox.appendChild(el('div', 'focus-await-behavior', '「' + chain.awaiting.behavior + '」'));
      statusBox.appendChild(el('div', 'muted', '选择将作为先例约束后续同类行为。'));
      const verdictBtns = el('div', 'focus-btns');
      const bClear = el('button', 'btn danger', '清链重来');
      bClear.addEventListener('click', function () {
        const id = chain.id;
        focusApply(function (s) { return focusResolveSuspicious(s, id, 'clear', Date.now()); }, '已清链重来 · #N 归零');
      });
      const bAllow = el('button', 'btn primary', '永久允许此例外');
      bAllow.addEventListener('click', function () {
        const id = chain.id;
        focusApply(function (s) { return focusResolveSuspicious(s, id, 'allow', Date.now()); }, '已写入判例 · 单元继续');
      });
      verdictBtns.appendChild(bClear);
      verdictBtns.appendChild(bAllow);
      statusBox.appendChild(verdictBtns);
    } else if ((chain.status === 'running' || chain.status === 'scouting') && chain.current) {
      focusRenderRunning(statusBox, chain, st, now);
    } else if (isResChain) {
      // 预约链：只读计数，不提供预约/侦查/就座
      statusBox.appendChild(el('div', 'focus-run-title', '预约链 · ' + focusWorkLabel(chain.workCount)));
      statusBox.appendChild(el('div', 'muted', chain.lastUnitAt ? '最近计入 ' + focusFmtTs(chain.lastUnitAt) : '尚未计入'));
      statusBox.appendChild(el('div', 'muted', '请在其他链上点「预约」；窗口内就座则本链 +1，违规清零。'));
    } else if (chain.status === 'reserved' && chain.reservation) {
      const remain = focusReservationRemainingMs(chain.reservation, now);
      statusBox.appendChild(el('div', 'focus-run-title', '预约中 · 请在窗口内就座'));
      const clock = el('div', 'focus-clock', focusFmtClock(remain));
      clock.id = 'focusClock';
      statusBox.appendChild(clock);
      statusBox.appendChild(el('div', 'muted', '就座成功将计入预约链'));
      const revBtns = el('div', 'focus-btns');
      const bSit = el('button', 'btn primary', '就座…');
      bSit.addEventListener('click', function () { focusOpenStartModal(chain, st); });
      revBtns.appendChild(bSit);
      statusBox.appendChild(revBtns);
    } else {
      statusBox.appendChild(el('div', 'focus-run-title', chain.status === 'cleared' ? '链已清空 · 可重新开始' : '空闲 · 准备就座'));
      statusBox.appendChild(el('div', 'muted', '链上 ' + focusWorkLabel(chain.workCount) + (chain.lastUnitAt ? ' · 最近完成 ' + focusFmtTs(chain.lastUnitAt) : '')));
      const idleBtns = el('div', 'focus-btns');
      const bSit = el('button', 'btn primary', '就座…');
      bSit.addEventListener('click', function () { focusOpenStartModal(chain, st); });
      const bRes = el('button', 'btn', '预约');
      bRes.addEventListener('click', function () {
        const id = chain.id;
        focusApply(function (s) { return focusReserve(s, id, Date.now()); }, '已预约 · 窗口内就座可计入预约链');
      });
      const bScout = el('button', 'btn', '侦查…');
      bScout.addEventListener('click', function () { focusOpenStartModal(chain, st, 'scout'); });
      idleBtns.appendChild(bSit);
      idleBtns.appendChild(bRes);
      idleBtns.appendChild(bScout);
      statusBox.appendChild(idleBtns);
    }
    seat.appendChild(statusBox);
    wrap.appendChild(seat);

    // 判例（保留）；链状态面板已按要求去除
    const precPanel = el('div', 'act-panel focus-prec');
    precPanel.appendChild(el('h3', null, '判例 · 永久允许的例外'));
    if (!st.precedents.length) {
      precPanel.appendChild(el('p', 'muted', '暂无判例。'));
    } else {
      const ul = el('ul', 'focus-prec-list');
      st.precedents.forEach(function (p) {
        const li = el('li');
        li.appendChild(el('span', 'focus-prec-behavior', p.behavior));
        ul.appendChild(li);
      });
      precPanel.appendChild(ul);
    }
    wrap.appendChild(precPanel);

    // 倒计时 + 时间到自动弹出完成度询问
    if (chain.status === 'running' || chain.status === 'scouting' || chain.status === 'reserved') {
      // 装表前先清（renderFocusSection 入口已清一次，这里再保一道，防 tick 泄漏）
      focusClearTick();
      focusTickTimer = setInterval(function () {
        if (currentView !== 'actFocus') { focusClearTick(); return; }
        const clock = document.getElementById('focusClock');
        if (!clock) { focusClearTick(); return; }
        const s = loadFocus();
        const ch = focusActiveChain(s);
        const t = Date.now();
        const plan = focusTickPlan(ch, t, focusCompletePromptKey);
        if (plan.action === 'none') { focusClearTick(); return; }
        if (plan.action === 'countdown') {
          clock.textContent = focusFmtClock(plan.remainMs);
          return;
        }
        if (plan.action === 'expired') {
          clock.textContent = '时间到';
          clock.classList.add('done');
          focusClearTick();
          // 同一单元只处理一次：已提示过就直接收表，不再 renderApp、不再叠弹窗
          if (!plan.prompt) return;
          focusCompletePromptKey = plan.key;
          renderApp();
          // 计时结束：自动询问完成度（正式单元）
          if (plan.openModal) {
            setTimeout(function () { focusOpenCompleteModal(ch, loadFocus()); }, 80);
          }
          return;
        }
        if (plan.action === 'reservation_expired') {
          focusClearTick();
          const er = focusExpireReservations(s, t);
          if (er && er.state) saveFocus(er.state);
          renderApp();
          if (er && er.expired && er.expired.length) {
            toast('预约违规 · 预约链计数已从零开始');
          } else {
            toast('预约已超时');
          }
        }
      }, 1000);
    }
  }

  function focusRenderRunning(statusBox, chain, st, now) {
    const cur = chain.current;
    const remain = focusUnitRemainingMs(cur, now);
    const canDone = focusCanComplete(cur, now);
    const isScout = cur.typeKey === 'scout' && !cur.promotedFromScout;
    const typeLabel = st.settings.typeNames[cur.typeKey] || cur.typeKey;
    statusBox.appendChild(el('div', 'focus-run-title', (isScout ? '侦查' : typeLabel) + ' · ' + cur.plannedMin + ' 分钟'));
    if (st.settings.flavor) statusBox.appendChild(el('div', 'muted', '类型：' + typeLabel));
    statusBox.appendChild(el('div', 'focus-task-text', cur.taskText || '（无任务内容）'));
    const clock = el('div', 'focus-clock' + (canDone ? ' done' : ''), canDone ? '时间到' : focusFmtClock(remain));
    clock.id = 'focusClock';
    statusBox.appendChild(clock);

    const runBtns = el('div', 'focus-btns');
    if (isScout) {
      if (!canDone) {
        const bExt = el('button', 'btn', '延长 ' + st.settings.scoutExtendMin + ' 分');
        bExt.addEventListener('click', function () {
          const id = chain.id;
          focusApply(function (s) { return focusScoutExtend(s, id, Date.now()); }, '已延长');
        });
        runBtns.appendChild(bExt);
      } else {
        statusBox.appendChild(el('div', 'muted', '侦查到期：转为正式单元，或放弃（均不伤链）。'));
        const bPromote = el('button', 'btn primary', '转正…');
        bPromote.addEventListener('click', function () { focusOpenPromoteModal(chain, st); });
        runBtns.appendChild(bPromote);
      }
      const bQuit = el('button', 'btn', '放弃侦查');
      bQuit.addEventListener('click', function () {
        const id = chain.id;
        focusApply(function (s) { return focusScoutEnd(s, id, Date.now()); }, '已放弃 · 链未受伤');
      });
      runBtns.appendChild(bQuit);
    } else {
      const bDone = el('button', 'btn primary', '完成 · 记 ' + focusWorkLabel(focusNextSeq(st, 'unit')));
      if (canDone) {
        bDone.addEventListener('click', function () { focusOpenCompleteModal(chain, st); });
      } else {
        bDone.setAttribute('disabled', 'disabled');
        bDone.title = '计时结束才可完成';
      }
      runBtns.appendChild(bDone);
    }
    const bSus = el('button', 'btn', '可疑行为…');
    bSus.addEventListener('click', function () { focusOpenSuspiciousModal(chain); });
    runBtns.appendChild(bSus);
    statusBox.appendChild(runBtns);
  }

  // ---------------- UI：层级徽标 / 归属徽标 ----------------

  // 该选择器是否已由样式表接管：t9 在 style.css 落地后，本文件的 inline 兜底自动让位。
  function focusCssDeclared(selector) {
    if (typeof document === 'undefined' || !document.styleSheets) return false;
    const want = String(selector);
    for (let i = 0; i < document.styleSheets.length; i++) {
      let rules = null;
      try { rules = document.styleSheets[i].cssRules; } catch (e) { rules = null; }
      if (!rules) continue;
      for (let j = 0; j < rules.length; j++) {
        const rule = rules[j];
        if (rule && rule.selectorText && String(rule.selectorText).replace(/\s+/g, ' ').indexOf(want) >= 0) return true;
      }
    }
    return false;
  }

  // 层级徽标：符号 + 层次名 +（下级计数）
  function focusLevelBadgeEl(level, settings, count) {
    const b = focusLevelBadge(level, settings, count);
    if (!b) return null;
    const v = focusLevelVisual(b.level);
    const chip = el('span', 'focus-level-badge', b.text);
    chip.setAttribute('data-level', b.level);
    if (v && !focusCssDeclared('.focus-level-badge[data-level="' + b.level + '"]')) {
      chip.style.display = 'inline-block';
      chip.style.fontSize = v.fontSize + 'px';
      chip.style.fontWeight = String(v.fontWeight);
      chip.style.padding = '0 7px';
      chip.style.marginBottom = '2px';
      chip.style.borderRadius = '999px';
      chip.style.border = v.borderWidth + 'px solid ' + v.borderColor;
      chip.style.background = v.tint;
    }
    return chip;
  }

  // 归属徽标：父级层级符号 + 番号 + 名称（未编入时高亮提示）
  function focusParentChipEl(attr) {
    const a = attr || {};
    const chip = el('span', 'focus-parent-chip' + (a.attached ? '' : ' is-free'), String(a.text || ''));
    chip.setAttribute('data-parent-level', a.attached ? String(a.parentLevel || '') : 'none');
    chip.setAttribute('data-parent-id', a.parentId ? String(a.parentId) : '');
    chip.title = String(a.text || '');
    if (!focusCssDeclared('.focus-parent-chip')) {
      chip.style.display = 'inline-block';
      chip.style.fontSize = '11.5px';
      chip.style.fontWeight = '400';
      chip.style.padding = '0 6px';
      chip.style.marginTop = '2px';
      chip.style.borderRadius = '999px';
      chip.style.border = '1px solid var(--border, #E5E7EB)';
      chip.style.background = 'var(--bg-elevated, #FFFFFF)';
      chip.style.color = a.attached ? 'var(--text-muted, #6B7280)' : 'var(--warn, #F59E0B)';
    }
    return chip;
  }

  // ---------------- UI：悬浮提醒（任意视图可见的剩余时间） ----------------

  const FOCUS_REMINDER_UI_KEY = 'athena_focus_reminder_ui_v1';
  let focusReminderEl = null;
  let focusReminderTimer = null;
  let focusReminderUi = null; // { collapsed, closedKey }

  function focusReminderUiState() {
    if (focusReminderUi) return focusReminderUi;
    focusReminderUi = { collapsed: false, closedKey: null };
    try {
      const raw = (typeof localStorage === 'undefined') ? null : localStorage.getItem(FOCUS_REMINDER_UI_KEY);
      if (raw) {
        const o = JSON.parse(raw) || {};
        focusReminderUi.collapsed = !!o.collapsed;
      }
    } catch (e) { /* 本地偏好损坏时用默认值 */ }
    return focusReminderUi;
  }

  function focusReminderSaveUi() {
    try {
      if (typeof localStorage === 'undefined') return;
      localStorage.setItem(FOCUS_REMINDER_UI_KEY, JSON.stringify({ collapsed: !!focusReminderUiState().collapsed }));
    } catch (e) { /* 存储不可用时仅内存生效 */ }
  }

  function focusReminderEnsure() {
    if (typeof document === 'undefined' || !document.body) return null;
    if (focusReminderEl && focusReminderEl.parentNode) return focusReminderEl;
    const box = el('div', 'focus-reminder');
    box.id = 'focusReminder';
    if (!focusCssDeclared('.focus-reminder')) {
      box.style.position = 'fixed';
      box.style.right = '14px';
      box.style.bottom = 'calc(14px + var(--dock-h, 0px))';
      box.style.zIndex = '90';
      box.style.minWidth = '164px';
      box.style.padding = '8px 10px';
      box.style.borderRadius = 'var(--radius, 12px)';
      box.style.border = '1px solid var(--border, #E5E7EB)';
      box.style.background = 'var(--bg-elevated, #FFFFFF)';
      box.style.boxShadow = 'var(--shadow, 0 1px 3px rgba(27,28,31,.06))';
    }
    const head = el('div', 'focus-reminder-head');
    const mark = el('span', 'focus-reminder-level', '');
    const title = el('span', 'focus-reminder-title', '');
    if (!focusCssDeclared('.focus-reminder-head')) {
      head.style.display = 'flex';
      head.style.alignItems = 'center';
      head.style.gap = '6px';
    }
    if (!focusCssDeclared('.focus-reminder-level')) {
      mark.style.fontWeight = '700';
      mark.style.color = 'var(--accent, #3B82F6)';
    }
    if (!focusCssDeclared('.focus-reminder-title')) {
      title.style.fontSize = 'var(--text-xs, 12px)';
      title.style.flex = '1';
      title.style.whiteSpace = 'nowrap';
    }
    const fold = el('button', 'focus-reminder-fold', '–');
    fold.type = 'button';
    fold.title = '折叠 / 展开';
    fold.addEventListener('click', function (e) {
      e.stopPropagation();
      const ui = focusReminderUiState();
      ui.collapsed = !ui.collapsed;
      focusReminderSaveUi();
      focusReminderSync(Date.now(), true);
    });
    const close = el('button', 'focus-reminder-close', '×');
    close.type = 'button';
    close.title = '本次不显示（下一个专注单元自动恢复）';
    close.addEventListener('click', function (e) {
      e.stopPropagation();
      const ui = focusReminderUiState();
      ui.closedKey = focusReminderEl ? String(focusReminderEl.getAttribute('data-key') || '') : '';
      focusReminderSync(Date.now(), true);
    });
    if (!focusCssDeclared('.focus-reminder-fold') && !focusCssDeclared('.focus-reminder-close')) {
      [fold, close].forEach(function (b) {
        b.style.border = '0';
        b.style.background = 'transparent';
        b.style.cursor = 'pointer';
        b.style.color = 'var(--text-muted, #6B7280)';
        b.style.fontSize = 'var(--text-sm, 13px)';
        b.style.lineHeight = '1';
        b.style.padding = '0 2px';
      });
    }
    head.appendChild(mark);
    head.appendChild(title);
    head.appendChild(fold);
    head.appendChild(close);
    const clock = el('div', 'focus-reminder-clock', '');
    if (!focusCssDeclared('.focus-reminder-clock')) {
      clock.style.fontFamily = 'var(--font-mono, ui-monospace)';
      clock.style.fontSize = 'var(--text-xl, 20px)';
      clock.style.fontWeight = '700';
      clock.style.fontVariantNumeric = 'tabular-nums';
      clock.style.marginTop = '2px';
    }
    const meta = el('div', 'focus-reminder-meta', '');
    if (!focusCssDeclared('.focus-reminder-meta')) {
      meta.style.fontSize = 'var(--text-2xs, 11px)';
      meta.style.color = 'var(--text-muted, #6B7280)';
      meta.style.maxWidth = '210px';
    }
    box.appendChild(head);
    box.appendChild(clock);
    box.appendChild(meta);
    document.body.appendChild(box);
    focusReminderEl = box;
    return box;
  }

  // 同步悬浮提醒：任意视图可见；折叠/关闭为即时生效的会话态（折叠持久化）。
  function focusReminderSync(now, force) {
    if (typeof document === 'undefined' || !document.body) return { visible: false, rendered: false, info: null };
    const t = Number(now) || Date.now();
    const info = focusReminderInfo(loadFocus(), t);
    const ui = focusReminderUiState();
    const show = !!(info.visible && (!ui.closedKey || ui.closedKey !== info.key));
    if (!show) {
      if (focusReminderEl && focusReminderEl.parentNode) focusReminderEl.parentNode.removeChild(focusReminderEl);
      focusReminderEl = null;
      return { visible: false, rendered: false, info: info };
    }
    const box = focusReminderEnsure();
    if (!box) return { visible: true, rendered: false, info: info };
    box.setAttribute('data-mode', String(info.mode || ''));
    box.setAttribute('data-level', String(info.level || ''));
    box.setAttribute('data-key', String(info.key || ''));
    box.setAttribute('data-collapsed', ui.collapsed ? '1' : '0');
    box.classList.toggle('is-collapsed', !!ui.collapsed);
    box.classList.toggle('is-expired', !!info.expired);
    const mark = box.querySelector('.focus-reminder-level');
    const title = box.querySelector('.focus-reminder-title');
    const clock = box.querySelector('.focus-reminder-clock');
    const meta = box.querySelector('.focus-reminder-meta');
    if (mark) mark.textContent = String(info.symbol || '#');
    if (title) title.textContent = String(info.title || '');
    if (clock) {
      clock.textContent = String(info.clock || '');
      clock.style.display = ui.collapsed ? 'none' : '';
    }
    if (meta) {
      const parts = [String(info.subtitle || '')];
      if (info.mode === 'focus' && info.plannedMin > 0) {
        parts.push('已过 ' + info.elapsedMin + ' 分 / 共 ' + info.plannedMin + ' 分');
      }
      if (info.mode === 'reserve' && info.workCount > 0) parts.push('已备 ' + info.workCount + ' 次');
      if (info.expired) parts.push('已到点，可完成');
      meta.textContent = parts.filter(function (x) { return !!x; }).join(' · ');
      meta.style.display = ui.collapsed ? 'none' : '';
    }
    return { visible: true, rendered: true, info: info };
  }

  function focusReminderClear() {
    if (focusReminderTimer) {
      clearInterval(focusReminderTimer);
      focusReminderTimer = null;
    }
  }

  // 独立于专注视图的定时器：既有的 focusTickTimer 在离开 actFocus 时会停表，
  // 悬浮提醒必须在「浏览 / 统计」等任意视图下继续走秒，故自己起一个 1s 表。
  function focusReminderStart() {
    if (typeof document === 'undefined') return false;
    focusReminderSync(Date.now(), true);
    if (focusReminderTimer) return true;
    focusReminderTimer = setInterval(function () {
      try { focusReminderSync(Date.now(), false); } catch (e) { /* 提醒渲染失败不影响主流程 */ }
    }, 1000);
    return true;
  }

  if (typeof document !== 'undefined' && typeof window !== 'undefined') {
    if (document.body) focusReminderStart();
    else document.addEventListener('DOMContentLoaded', function () { focusReminderStart(); });
  }

  // ---------------- UI：状态树（编制 + 计划合并） ----------------
  function focusRenderTree(wrap, st, now) {
    // 计划模式开关
    const modeRow = el('div', 'act-section-head');
    modeRow.appendChild(el('h3', null, '状态 · 竖列树'));
    const modeBtn = el('button', 'chip' + (st.planMode ? ' active' : ''), st.planMode ? '计划模式：开' : '计划模式：关');
    modeBtn.addEventListener('click', function () {
      focusApply(function (s) { return focusSetPlanMode(s, !s.planMode); });
    });
    modeRow.appendChild(modeBtn);
    wrap.appendChild(modeRow);

    if (st.planMode) {
      wrap.appendChild(el('div', 'act-hint', '计划模式：可创建高层次任务；须手动填充至少一个下级，完成后可「转正」为正式层次。'));
    }

    // 计划摘要（合并自原计划页）
    const dueSoon = focusPlanDueSoon(st, now);
    if (dueSoon.length) {
      const warn = el('div', 'act-panel focus-plan-warn');
      warn.appendChild(el('div', 'focus-await-title', '临近截止'));
      dueSoon.forEach(function (p) {
        warn.appendChild(el('div', null, p.title + ' · 截止 ' + focusFmtTs(p.dueAt) + ' · 已填 ' + focusPlanFilledCount(st, p.id) + '/' + p.targetCount));
      });
      wrap.appendChild(warn);
    }

    // 树工具：是否编入 + 链 筛选（两类），以及多选/计划操作
    const selIds = focusSelectedIds();
    const tools = el('div', 'focus-tree-tools');
    const viewReserve = focusUiState.chainFilter === FOCUS_RESERVE_CHAIN_ID;
    if (st.planMode && !viewReserve) {
      const addPlan = el('button', 'btn small primary', '＋ 计划任务');
      addPlan.addEventListener('click', function () { focusOpenPlanTaskModal(st); });
      tools.appendChild(addPlan);
    }
    if (selIds.length && !viewReserve) {
      tools.appendChild(el('span', 'muted', '已选 ' + selIds.length + ' 项'));
      const combine = el('button', 'btn small', '组合到新上级');
      combine.addEventListener('click', function () { focusOpenCombineModal(st); });
      tools.appendChild(combine);
      const moveBtn = el('button', 'btn small', '移动到…');
      moveBtn.addEventListener('click', function () { focusOpenMoveModal(st, selIds); });
      tools.appendChild(moveBtn);
      const clear = el('button', 'btn small', '取消选择');
      clear.addEventListener('click', function () {
        focusUiState.selected = {};
        renderApp();
      });
      tools.appendChild(clear);
    }
    wrap.appendChild(tools);

    // 筛选行 1：是否编入
    const filterRow1 = el('div', 'chips focus-filter-row');
    filterRow1.appendChild(el('span', 'focus-filter-label', '编入'));
    [['all', '全部'], ['assigned', '已编入'], ['unassigned', '未编入']].forEach(function (t) {
      const chip = el('button', 'chip' + (focusUiState.assignFilter === t[0] ? ' active' : ''), t[1]);
      chip.addEventListener('click', function () {
        focusUiState.assignFilter = t[0];
        renderApp();
      });
      filterRow1.appendChild(chip);
    });
    wrap.appendChild(filterRow1);

    // 筛选行 2：链
    const filterRow2 = el('div', 'chips focus-filter-row');
    filterRow2.appendChild(el('span', 'focus-filter-label', '链'));
    const cAll = el('button', 'chip' + (!focusUiState.chainFilter ? ' active' : ''), '全部');
    cAll.addEventListener('click', function () { focusUiState.chainFilter = null; renderApp(); });
    filterRow2.appendChild(cAll);
    st.chains.forEach(function (c) {
      const isRes = c.role === 'reserve';
      const nm = isRes ? '预约链' : (c.tier === 'main' ? '主链' : '普通');
      const chip = el('button', 'chip' + (focusUiState.chainFilter === c.id ? ' active' : ''),
        nm + (isRes ? ' #' + c.workCount : ' ' + focusWorkLabel(c.workCount)));
      chip.addEventListener('click', function () {
        focusUiState.chainFilter = c.id;
        renderApp();
      });
      filterRow2.appendChild(chip);
    });
    wrap.appendChild(filterRow2);
    if (viewReserve) {
      wrap.appendChild(el('div', 'act-hint', '预约链仅计数，不支持编制操作。'));
    }

    const rows = focusTreeRows(st, {
      collapsed: focusUiState.collapsed,
      assignFilter: focusUiState.assignFilter,
      chainFilter: focusUiState.chainFilter
    });
    const tree = el('div', 'act-panel focus-tree');
    tree.id = 'focusTree';
    if (!rows.length) {
      tree.appendChild(illus('empty-focus'));
      tree.appendChild(el('p', 'muted', '暂无数据。完成专注单元后会出现在「未编入」。' + (st.planMode ? '点上方「＋ 计划任务」创建高层次。' : '开启计划模式后可创建高层次任务。')));
    }

    rows.forEach(function (r) {
      const row = el('div', 'focus-tree-row' + (focusUiState.selected[r.id] ? ' selected' : ''));
      row.style.paddingLeft = (8 + r.depth * 18) + 'px';
      row.setAttribute('data-id', r.id);
      row.setAttribute('data-kind', r.kind);

      // 层级：由显式类型（unit/group/corps/army）决定 → data-level + 可测视觉差异（符号/字号/字重/左边框/底色）
      const nodeLevel = r.level || (r.kind === 'unit' ? 'unit' : null);
      const vis = r.visual || focusLevelVisual(nodeLevel);
      if (nodeLevel) {
        row.setAttribute('data-level', nodeLevel);
        row.classList.add('focus-level-' + nodeLevel);
        if (vis && !focusCssDeclared('.focus-tree-row[data-level="' + nodeLevel + '"]')) {
          row.style.fontSize = vis.fontSize + 'px';
          row.style.fontWeight = String(vis.fontWeight);
          row.style.borderLeft = vis.borderWidth + 'px solid ' + vis.borderColor;
          row.style.background = vis.tint;
        }
      }

      // 层级标记（# / ● / ▲ / ◆）+ 缩进连接线：竖列树里层次与归属一眼可读
      if (nodeLevel) {
        const mark = el('span', 'focus-level-mark', vis ? vis.symbol : '');
        mark.setAttribute('data-level', nodeLevel);
        if (!focusCssDeclared('.focus-level-mark')) {
          mark.style.display = 'inline-block';
          mark.style.minWidth = '16px';
          mark.style.marginRight = '4px';
          mark.style.fontWeight = '700';
          mark.style.color = vis ? vis.borderColor : 'inherit';
        }
        row.appendChild(mark);
      } else {
        const guide = el('span', 'focus-tree-guide', r.depth > 0 ? '└' : '·');
        if (!focusCssDeclared('.focus-tree-guide')) {
          guide.style.marginRight = '4px';
          guide.style.color = 'var(--text-faint, #9CA3AF)';
        }
        row.appendChild(guide);
      }

      // 多选
      if (r.kind === 'unit' || r.kind === 'org') {
        const cb = el('input', 'focus-tree-check');
        cb.type = 'checkbox';
        cb.checked = !!focusUiState.selected[r.id];
        cb.addEventListener('click', function (e) {
          e.stopPropagation();
          focusUiState.selected[r.id] = !focusUiState.selected[r.id];
          renderApp();
        });
        row.appendChild(cb);
      }

      // 拖放：把选中项/自身放进目标 org
      if (r.kind === 'org') {
        row.addEventListener('dragover', function (e) { e.preventDefault(); row.classList.add('drop'); });
        row.addEventListener('dragleave', function () { row.classList.remove('drop'); });
        row.addEventListener('drop', function (e) {
          e.preventDefault();
          row.classList.remove('drop');
          const ids = focusSelectedIds();
          const src = focusUiState.dragId;
          const targetId = r.id;
          const list = ids.length ? ids : (src ? [src] : []);
          if (!list.length) return;
          focusApply(function (s) {
            // 拖放同样受层次约束：节点只能编入其上一级
            return focusAttachNodes(s, list, targetId, Date.now());
          }, '已编入 ' + r.label);
        });
      }

      if (r.kind === 'org') {
        const fold = el('button', 'focus-tree-fold', r.collapsed ? '▸' : '▾');
        fold.type = 'button';
        fold.addEventListener('click', function (e) {
          e.stopPropagation();
          focusUiState.collapsed[r.id] = !focusUiState.collapsed[r.id];
          renderApp();
        });
        row.appendChild(fold);

        const main = el('div', 'focus-tree-main');
        const tag = r.org.fromPlan && !r.org.formalized ? ' · 计划中' : '';
        const dueTxt = r.org.dueAt ? ' · 截止 ' + focusFmtTs(r.org.dueAt) : '';
        const needN = Math.max(1, Number(r.org.minChildCount) || 1);
        const nextCount = focusNextLevelCount(st, r.id);
        const badge = focusLevelBadgeEl(r.org.level, st.settings, nextCount);
        if (badge) main.appendChild(badge);
        main.appendChild(el('div', 'focus-tree-label', r.label + tag + dueTxt));
        // 归属：子项显示父级的层级符号 + 番号 + 名称（跨层级编入后下一次渲染即更新）
        if (r.parent) main.appendChild(focusParentChipEl(r.parent));
        const agg = r.aggregates;
        if (agg && agg.unitCount) {
          main.appendChild(el('div', 'focus-tree-meta',
            agg.unitCount + ' 单元 · ' + focusFmtTs(agg.startAt) + ' → ' + focusFmtTs(agg.endAt) +
            ' · 总时 ' + focusFmtDur(agg.totalMin) + ' · 均完成 ' + agg.avgCompletion + '%' +
            (r.org.fromPlan && !r.org.formalized ? ' · 下级 ' + nextCount + '/' + needN : '')));
        } else {
          main.appendChild(el('div', 'focus-tree-meta muted',
            '暂无下级单元' + (r.org.fromPlan && !r.org.formalized ? ' · 转正需下级 ≥ ' + needN + '（现有 ' + nextCount + '）' : '')));
        }
        row.appendChild(main);

        // 树内操作（非「新建」大按钮）
        const act = el('div', 'focus-tree-acts');
        const addChild = el('button', 'btn small', '＋子级');
        addChild.addEventListener('click', function (e) {
          e.stopPropagation();
          if (!st.planMode) { toast('请先开启计划模式'); return; }
          focusOpenInlineChildModal(r.org, st);
        });
        act.appendChild(addChild);

        const rename = el('button', 'btn small', '改名');
        rename.addEventListener('click', function (e) {
          e.stopPropagation();
          focusOpenRenameOrgModal(r.org);
        });
        act.appendChild(rename);

        if (r.org.fromPlan && !r.org.formalized) {
          const fin = el('button', 'btn small primary', '转正');
          fin.addEventListener('click', function (e) {
            e.stopPropagation();
            const chk = focusOrgCanFormalize(loadFocus(), r.id);
            if (!chk.ok) {
              if (chk.reason === 'need_fill') {
                toast('须至少 ' + (chk.need || 1) + ' 个下级（现有 ' + (chk.childCount || 0) + '）');
              } else {
                toast('当前不可转正');
              }
              return;
            }
            focusApply(function (s) { return focusFormalizeOrg(s, r.id, Date.now()); }, '已转正为正式层次');
          });
          act.appendChild(fin);
        }

        const del = el('button', 'btn small danger', '删');
        del.addEventListener('click', function (e) {
          e.stopPropagation();
          if (!window.confirm('删除该节点将级联子孙，单元回「未编入」。确认？')) return;
          focusApply(function (s) { return focusDeleteOrg(s, r.id, Date.now()); }, '已删除');
        });
        act.appendChild(del);
        row.appendChild(act);
      } else if (r.kind === 'unit') {
        row.draggable = true;
        row.addEventListener('dragstart', function () {
          focusUiState.dragId = r.id;
          if (!focusUiState.selected[r.id]) {
            focusUiState.selected = {};
            focusUiState.selected[r.id] = true;
          }
        });
        row.addEventListener('dragend', function () { focusUiState.dragId = null; });

        const main = el('div', 'focus-tree-main');
        main.appendChild(el('div', 'focus-tree-label', r.label));
        if (r.parent) main.appendChild(focusParentChipEl(r.parent));
        const u = r.unit;
        main.appendChild(el('div', 'focus-tree-meta',
          '完成 ' + u.completion + '% · ' + focusFmtDur(u.actualMin) +
          ' · ' + focusFmtTs(u.startedAt) + ' → ' + focusFmtTs(u.endedAt)));
        row.appendChild(main);

        const act = el('div', 'focus-tree-acts');
        const editName = el('button', 'btn small', '改名');
        editName.addEventListener('click', function (e) {
          e.stopPropagation();
          focusOpenRenameUnitModal(u);
        });
        act.appendChild(editName);
        row.appendChild(act);
      } else {
        row.appendChild(el('span', 'focus-tree-root', r.label));
      }
      tree.appendChild(row);
    });
    wrap.appendChild(tree);
  }

  // ---------------- UI：统计 ----------------
  let focusHeatExpanded = false; // 热力图：预览 8 周 ↔ 展开 26 周
  // 热力图数据：可见窗口内逐日实际完成分钟 + 色阶档位
  // 色阶锚点必须取「可见窗口内」最高日（对齐 src/stats.mjs 学习日历的惯例）：
  // 若锚定全史峰值，一个历史大日就会把可见期整片压成同一档 → 色阶失效（看上去“全部同色”）
  function focusHeatData(state, now, weeks) {
    const map = focusDailyMinutes(state);
    const today = focusYmd(now);
    const end = new Date(now);
    end.setHours(12, 0, 0, 0);
    const days = Math.max(1, Math.floor(Number(weeks) || 0)) * 7;
    const startTs = end.getTime() - (days - 1) * 86400000;
    const cells = [];
    let maxMin = 0, activeDays = 0, totalMin = 0, peakMin = 0;
    for (let i = 0; i < days; i++) {
      const day = focusYmd(startTs + i * 86400000);
      const minutes = map[day] || 0;
      if (minutes > 0) { activeDays++; totalMin += minutes; if (minutes > peakMin) peakMin = minutes; }
      if (minutes > maxMin) maxMin = minutes;
      cells.push({ day: day, minutes: minutes, lv: 0, isToday: day === today });
    }
    const scale = maxMin > 0 ? maxMin : 1;
    cells.forEach(function (c) {
      c.lv = c.minutes <= 0 ? 0 : Math.min(4, Math.ceil((c.minutes / scale) * 4));
    });
    return {
      cells: cells, maxMin: maxMin, activeDays: activeDays, totalMin: totalMin,
      peakMin: peakMin, today: today, todayMinutes: map[today] || 0
    };
  }

  function focusRenderStats(wrap, st, now) {
    wrap.appendChild(el('h3', null, '统计 · 实际完成分钟'));

    const heat = el('div', 'act-panel focus-heat chart-card');
    const weeks = focusHeatExpanded ? 26 : 8;
    const hd = focusHeatData(st, now, weeks);
    const today = hd.today;

    const head = el('div', 'chart-head');
    head.appendChild(el('span', 'chart-title', '热力图 · 日实际完成分钟'));
    const expandBtn = el('button', 'btn small heat-expand-btn', focusHeatExpanded ? '收起' : '展开完整点阵');
    expandBtn.addEventListener('click', function () {
      focusHeatExpanded = !focusHeatExpanded;
      renderApp();
    });
    head.appendChild(expandBtn);
    heat.appendChild(head);
    heat.appendChild(el('div', 'chart-label muted',
      focusHeatExpanded ? '完整视图 · 近 ' + weeks + ' 周' : '预览 · 近 ' + weeks + ' 周（可展开更完整）'));

    const grid = el('div', 'focus-heat-grid');
    hd.cells.forEach(function (c) {
      const cell = el('div', 'focus-heat-cell');
      cell.setAttribute('data-lv', String(c.lv));
      cell.title = c.day + ' · ' + c.minutes + ' 分';
      if (c.isToday) cell.classList.add('today');
      grid.appendChild(cell);
    });
    heat.appendChild(grid);
    if (focusHeatExpanded) {
      const sum = el('div', 'heat-summary');
      sum.appendChild(el('span', null, '有专注'));
      sum.appendChild(el('b', null, hd.activeDays + ' 天'));
      sum.appendChild(el('span', null, '· 合计'));
      sum.appendChild(el('b', null, hd.totalMin + ' 分'));
      sum.appendChild(el('span', null, '· 日均有记录日'));
      sum.appendChild(el('b', null, hd.activeDays ? Math.round(hd.totalMin / hd.activeDays) + ' 分' : '—'));
      sum.appendChild(el('span', null, '· 峰值日'));
      sum.appendChild(el('b', null, hd.peakMin + ' 分'));
      heat.appendChild(sum);
    }
    wrap.appendChild(heat);

    // 趋势拆成两张图：专注时间 · 完成度
    const series = focusTrendSeries(st, 30, now);
    const avgMap = focusDailyAvgCompletion(st);
    const sumMin = series.reduce(function (a, x) { return a + x.minutes; }, 0);
    const avgVals = series.filter(function (x) { return x.avgCompletion != null; }).map(function (x) { return x.avgCompletion; });
    const avgOfAvg = avgVals.length ? Math.round(avgVals.reduce(function (a, b) { return a + b; }, 0) / avgVals.length) : null;

    // 图 1 · 专注时间（柱）
    const tMin = el('div', 'act-panel focus-trend chart-card');
    const hMin = el('div', 'chart-head');
    hMin.appendChild(el('span', 'chart-title', '专注时间 · 近 30 天'));
    hMin.appendChild(el('span', 'chart-pill', sumMin + ' 分'));
    tMin.appendChild(hMin);
    tMin.appendChild(el('div', 'chart-label muted', '柱高 = 当日实际完成分钟 · 今日 ' + hd.todayMinutes + ' 分'));
    const maxV = Math.max(1, series.reduce(function (a, x) { return Math.max(a, x.minutes); }, 0));
    const bars = el('div', 'focus-trend-bars');
    series.forEach(function (x) {
      const col = el('div', 'focus-trend-col');
      const bar = el('div', 'focus-trend-bar');
      bar.style.height = Math.max(2, Math.round((x.minutes / maxV) * 88)) + 'px';
      bar.title = x.date + ' · ' + x.minutes + ' 分钟';
      col.appendChild(bar);
      bars.appendChild(col);
    });
    tMin.appendChild(bars);
    wrap.appendChild(tMin);

    // 图 2 · 完成度（折线 + 点）
    const tAvg = el('div', 'act-panel focus-trend chart-card');
    const hAvg = el('div', 'chart-head');
    hAvg.appendChild(el('span', 'chart-title', '日均完成度 · 近 30 天'));
    hAvg.appendChild(el('span', 'chart-pill', avgOfAvg == null ? '—' : avgOfAvg + '%'));
    tAvg.appendChild(hAvg);
    tAvg.appendChild(el('div', 'chart-label muted',
      '点 = 当日平均完成度 · 今日 ' + (avgMap[today] == null ? '—' : avgMap[today] + '%')));
    const compWrap = el('div', 'focus-comp-chart');
    const CW = 320, CH = 110, cpL = 28, cpR = 8, cpT = 12, cpB = 18;
    const csvg = svgEl('svg', { viewBox: '0 0 ' + CW + ' ' + CH, width: '100%', class: 'chart-svg' });
    const cx = function (i) {
      return cpL + (series.length <= 1 ? 0 : (i / (series.length - 1)) * (CW - cpL - cpR));
    };
    const cy = function (v) { return cpT + (1 - v / 100) * (CH - cpT - cpB); };
    [0, 50, 100].forEach(function (v) {
      const y = cy(v);
      csvg.appendChild(svgEl('line', {
        x1: cpL, x2: CW - cpR, y1: y, y2: y,
        class: v === 100 ? 'chart-goal' : 'chart-grid'
      }));
      csvg.appendChild(svgText('text', cpL - 5, y + 3, String(v), {
        'text-anchor': 'end', class: 'chart-axis'
      }));
    });
    const pts = [];
    series.forEach(function (x, i) {
      if (x.avgCompletion == null) return;
      pts.push(cx(i) + ',' + cy(x.avgCompletion));
    });
    if (pts.length >= 2) {
      csvg.appendChild(svgEl('polyline', { points: pts.join(' '), class: 'chart-line' }));
    }
    series.forEach(function (x, i) {
      if (x.avgCompletion == null) return;
      const isLast = i === series.length - 1;
      const dot = svgEl('circle', {
        cx: cx(i), cy: cy(x.avgCompletion), r: isLast ? 4 : 2.8,
        class: isLast ? 'chart-dot chart-dot-last' : 'chart-dot'
      });
      const tt = svgEl('title', {});
      tt.textContent = x.date + ' · 均完成 ' + x.avgCompletion + '%';
      dot.appendChild(tt);
      csvg.appendChild(dot);
    });
    csvg.appendChild(svgText('text', cpL, CH - 5, series.length ? series[0].date.slice(5) : '', { class: 'chart-axis' }));
    csvg.appendChild(svgText('text', CW - cpR, CH - 5, series.length ? series[series.length - 1].date.slice(5) : '', {
      'text-anchor': 'end', class: 'chart-axis'
    }));
    compWrap.appendChild(csvg);
    tAvg.appendChild(compWrap);
    wrap.appendChild(tAvg);
  }

  // ---------------- UI：弹窗 ----------------
  function focusOpenMainChainModal() {
    const st = loadFocus();
    const modal = el('div', 'map-modal habit-modal');
    const backdrop = el('div', 'map-modal-backdrop');
    backdrop.addEventListener('click', function () { modal.remove(); });
    modal.appendChild(backdrop);
    const card = el('div', 'map-modal-card wrong-input-card');
    card.appendChild(el('h3', null, '创建主链'));
    card.appendChild(el('p', 'muted', '同一时间只能有一个主链。可重新创建，或从现有普通链继承工作量。'));
    const modeSel = el('select', 'wrong-input');
    const oFresh = el('option', null, '重新创建');
    oFresh.value = 'fresh';
    const oInh = el('option', null, '从普通链继承');
    oInh.value = 'inherit';
    modeSel.appendChild(oFresh);
    modeSel.appendChild(oInh);
    card.appendChild(modeSel);

    const inheritWrap = el('div');
    inheritWrap.style.display = 'none';
    inheritWrap.appendChild(el('div', 'muted', '继承来源'));
    const inhSel = el('select', 'wrong-input');
    st.chains.filter(function (c) { return c && c.tier === FOCUS_TIER_NORMAL; }).forEach(function (c) {
      const o = el('option', null, '普通 ' + focusWorkLabel(c.workCount) + (c.seatNote ? ' · ' + c.seatNote : ''));
      o.value = c.id;
      inhSel.appendChild(o);
    });
    inheritWrap.appendChild(inhSel);
    card.appendChild(inheritWrap);
    modeSel.addEventListener('change', function () {
      inheritWrap.style.display = modeSel.value === 'inherit' ? '' : 'none';
    });

    const note = el('input', 'wrong-input');
    note.placeholder = '触发说明（可选）';
    card.appendChild(note);

    const btns = el('div', 'wrong-input-btns');
    const ok = el('button', 'btn primary', '创建主链');
    ok.addEventListener('click', function () {
      const mode = modeSel.value;
      const fromId = inhSel.value;
      modal.remove();
      focusApply(function (s) {
        return focusCreateMainChain(s, {
          mode: mode,
          fromChainId: mode === 'inherit' ? fromId : null,
          seatNote: note.value
        }, Date.now());
      }, '已创建主链');
    });
    const cancel = el('button', 'btn', '取消');
    cancel.addEventListener('click', function () { modal.remove(); });
    btns.appendChild(ok);
    btns.appendChild(cancel);
    card.appendChild(btns);
    modal.appendChild(card);
    document.body.appendChild(modal);
  }

  function focusOpenCreateModal(normalOnly) {
    const st = loadFocus();
    const modal = el('div', 'map-modal habit-modal');
    const backdrop = el('div', 'map-modal-backdrop');
    backdrop.addEventListener('click', function () { modal.remove(); });
    modal.appendChild(backdrop);
    const card = el('div', 'map-modal-card wrong-input-card');
    card.appendChild(el('h3', null, '新建专注链'));
    const tierSel = el('select', 'wrong-input');
    if (!normalOnly && !focusMainChain(st)) {
      const oM = el('option', null, '主链');
      oM.value = FOCUS_TIER_MAIN;
      tierSel.appendChild(oM);
    }
    const oN = el('option', null, '普通链');
    oN.value = FOCUS_TIER_NORMAL;
    tierSel.appendChild(oN);
    card.appendChild(tierSel);
    const durSel = el('select', 'wrong-input');
    FOCUS_DURATIONS.forEach(function (d) {
      const o = el('option', null, d + ' 分钟');
      o.value = String(d);
      if (d === st.settings.unitMinutes) o.selected = true;
      durSel.appendChild(o);
    });
    card.appendChild(durSel);
    const note = el('input', 'wrong-input');
    note.placeholder = '触发说明（可选）';
    card.appendChild(note);
    const btns = el('div', 'wrong-input-btns');
    const ok = el('button', 'btn primary', '创建');
    ok.addEventListener('click', function () {
      const tier = tierSel.value;
      modal.remove();
      if (tier === FOCUS_TIER_MAIN) {
        focusOpenMainChainModal();
        return;
      }
      focusApply(function (s) {
        return focusCreateChain(s, {
          tier: tier,
          unitMinutes: Number(durSel.value),
          seatNote: note.value
        }, Date.now());
      }, '已创建专注链');
    });
    const cancel = el('button', 'btn', '取消');
    cancel.addEventListener('click', function () { modal.remove(); });
    btns.appendChild(ok);
    btns.appendChild(cancel);
    card.appendChild(btns);
    modal.appendChild(card);
    document.body.appendChild(modal);
  }

  function focusOpenStartModal(chain, st, forceKind) {
    const modal = el('div', 'map-modal habit-modal');
    const backdrop = el('div', 'map-modal-backdrop');
    backdrop.addEventListener('click', function () { modal.remove(); });
    modal.appendChild(backdrop);
    const card = el('div', 'map-modal-card wrong-input-card');
    const isScout = forceKind === 'scout';
    card.appendChild(el('h3', null, isScout ? '开始侦查任务' : '就座 · 开始单元'));
    card.appendChild(el('div', 'muted', '任务内容（必填）'));
    const task = el('input', 'wrong-input');
    task.placeholder = isScout ? '例如：先看一遍提纲' : '例如：完成高数第三章习题 1–10';
    card.appendChild(task);
    let typeSel = null;
    if (!isScout) {
      card.appendChild(el('div', 'muted', '类型'));
      typeSel = el('select', 'wrong-input');
      FOCUS_FORMAL_TYPE_KEYS.forEach(function (k) {
        const o = el('option', null, st.settings.typeNames[k] || k);
        o.value = k;
        typeSel.appendChild(o);
      });
      card.appendChild(typeSel);
    }
    const btns = el('div', 'wrong-input-btns');
    const ok = el('button', 'btn primary', isScout ? '开始侦查' : '就座');
    ok.addEventListener('click', function () {
      const text = task.value;
      const tk = typeSel ? typeSel.value : 'scout';
      modal.remove();
      if (isScout) {
        focusApply(function (s) { return focusScoutStart(s, chain.id, Date.now(), { taskText: text }); }, '侦查已开始');
      } else {
        focusApply(function (s) {
          return focusSitDown(s, chain.id, Date.now(), { taskText: text, typeKey: tk });
        }, '已就座');
      }
    });
    const cancel = el('button', 'btn', '取消');
    cancel.addEventListener('click', function () { modal.remove(); });
    btns.appendChild(ok);
    btns.appendChild(cancel);
    card.appendChild(btns);
    modal.appendChild(card);
    document.body.appendChild(modal);
    setTimeout(function () { try { task.focus(); } catch (e) {} }, 50);
  }

  // 完成度询问（计时结束自动弹出 / 点完成也会弹）
  function focusOpenCompleteModal(chain, st) {
    // 同一时刻最多一个完成度弹窗：先移除既有的（防重复叠加、防旧弹窗盖住输入）
    const dup = document.querySelector('.map-modal.focus-complete-modal');
    if (dup) dup.remove();
    const modal = el('div', 'map-modal habit-modal focus-complete-modal');
    const backdrop = el('div', 'map-modal-backdrop');
    backdrop.addEventListener('click', function () { modal.remove(); });
    modal.appendChild(backdrop);
    const card = el('div', 'map-modal-card wrong-input-card');
    card.appendChild(el('h3', null, '完成单元 · 记录完成度'));
    card.appendChild(el('p', 'muted', '记录是否达成原定，以及完成度（0–100%）。将计入每日均完成度趋势。'));
    card.appendChild(el('div', 'muted', '是否达成原定'));
    const achSel = el('select', 'wrong-input');
    [['1', '达成'], ['0', '未达成']].forEach(function (t) {
      const o = el('option', null, t[1]);
      o.value = t[0];
      achSel.appendChild(o);
    });
    card.appendChild(achSel);
    card.appendChild(el('div', 'muted', '完成度 %'));
    const pct = el('input', 'wrong-input');
    pct.type = 'number';
    pct.min = '0';
    pct.max = '100';
    pct.value = '100';
    card.appendChild(pct);
    card.appendChild(el('div', 'muted', '单元名称（可选，默认为任务内容）'));
    const nameInp = el('input', 'wrong-input');
    nameInp.placeholder = (chain.current && chain.current.taskText) || '';
    card.appendChild(nameInp);

    const btns = el('div', 'wrong-input-btns');
    const ok = el('button', 'btn primary', '记录完成');
    ok.addEventListener('click', function () {
      const achieved = achSel.value === '1';
      const completion = Number(pct.value);
      const name = nameInp.value;
      modal.remove();
      focusApply(function (s) {
        return focusCompleteUnit(s, chain.id, Date.now(), {
          achieved: achieved,
          completion: completion,
          name: name
        });
      }, '已记 ' + focusWorkLabel(focusNextSeq(st, 'unit')) + ' · 完成度 ' + (Number.isFinite(completion) ? completion : 0) + '%');
    });
    const cancel = el('button', 'btn', '取消');
    cancel.addEventListener('click', function () { modal.remove(); });
    btns.appendChild(ok);
    btns.appendChild(cancel);
    card.appendChild(btns);
    modal.appendChild(card);
    document.body.appendChild(modal);
  }

  function focusOpenPromoteModal(chain, st) {
    const modal = el('div', 'map-modal habit-modal');
    const backdrop = el('div', 'map-modal-backdrop');
    backdrop.addEventListener('click', function () { modal.remove(); });
    modal.appendChild(backdrop);
    const card = el('div', 'map-modal-card wrong-input-card');
    card.appendChild(el('h3', null, '侦查转正'));
    card.appendChild(el('p', 'muted', '选择正式类型。转正后与一般单元相同。'));
    const typeSel = el('select', 'wrong-input');
    FOCUS_FORMAL_TYPE_KEYS.forEach(function (k) {
      const o = el('option', null, st.settings.typeNames[k] || k);
      o.value = k;
      typeSel.appendChild(o);
    });
    card.appendChild(typeSel);
    const btns = el('div', 'wrong-input-btns');
    const ok = el('button', 'btn primary', '转正');
    ok.addEventListener('click', function () {
      const tk = typeSel.value;
      modal.remove();
      focusApply(function (s) { return focusScoutPromote(s, chain.id, tk, Date.now()); }, '已转正');
    });
    const cancel = el('button', 'btn', '放弃');
    cancel.addEventListener('click', function () {
      modal.remove();
      focusApply(function (s) { return focusScoutEnd(s, chain.id, Date.now()); }, '已放弃 · 链未受伤');
    });
    btns.appendChild(ok);
    btns.appendChild(cancel);
    card.appendChild(btns);
    modal.appendChild(card);
    document.body.appendChild(modal);
  }

  function focusOpenSeatModal(chain) {
    const modal = el('div', 'map-modal habit-modal');
    const backdrop = el('div', 'map-modal-backdrop');
    backdrop.addEventListener('click', function () { modal.remove(); });
    modal.appendChild(backdrop);
    const card = el('div', 'map-modal-card wrong-input-card');
    card.appendChild(el('h3', null, '神圣座位 · 触发说明'));
    const note = el('input', 'wrong-input');
    note.value = chain.seatNote || '';
    card.appendChild(note);
    const btns = el('div', 'wrong-input-btns');
    const ok = el('button', 'btn primary', '保存');
    ok.addEventListener('click', function () {
      modal.remove();
      focusApply(function (s) { return focusSetSeatNote(s, chain.id, note.value, Date.now()); }, '已更新触发说明');
    });
    const cancel = el('button', 'btn', '取消');
    cancel.addEventListener('click', function () { modal.remove(); });
    btns.appendChild(ok);
    btns.appendChild(cancel);
    card.appendChild(btns);
    modal.appendChild(card);
    document.body.appendChild(modal);
  }

  function focusOpenSuspiciousModal(chain) {
    const modal = el('div', 'map-modal habit-modal');
    const backdrop = el('div', 'map-modal-backdrop');
    backdrop.addEventListener('click', function () { modal.remove(); });
    modal.appendChild(backdrop);
    const card = el('div', 'map-modal-card wrong-input-card');
    card.appendChild(el('h3', null, '标记可疑行为'));
    const input = el('input', 'wrong-input');
    input.placeholder = '例如：起身刷了手机短视频';
    card.appendChild(input);
    const btns = el('div', 'wrong-input-btns');
    const ok = el('button', 'btn primary', '进入裁决');
    ok.addEventListener('click', function () {
      const behavior = input.value;
      modal.remove();
      focusApply(function (s) { return focusFlagSuspicious(s, chain.id, behavior, Date.now()); });
    });
    const cancel = el('button', 'btn', '取消');
    cancel.addEventListener('click', function () { modal.remove(); });
    btns.appendChild(ok);
    btns.appendChild(cancel);
    card.appendChild(btns);
    modal.appendChild(card);
    document.body.appendChild(modal);
  }

  // 计划模式：创建高层次任务（根级或挂在合法父级下）
  function focusOpenPlanTaskModal(st) {
    if (!st.planMode) { toast('请先开启计划模式'); return; }
    const modal = el('div', 'map-modal habit-modal');
    const backdrop = el('div', 'map-modal-backdrop');
    backdrop.addEventListener('click', function () { modal.remove(); });
    modal.appendChild(backdrop);
    const card = el('div', 'map-modal-card wrong-input-card');
    card.appendChild(el('h3', null, '新建计划任务'));
    card.appendChild(el('p', 'muted', '层次严格逐级归属：组 → 群 → 集团；须填充至少一个下级后才能「转正」为正式层次。'));

    card.appendChild(el('div', 'muted', '层次'));
    const levelSel = el('select', 'wrong-input');
    FOCUS_ORG_LEVELS.forEach(function (lv) {
      const o = el('option', null, st.settings.levelNames[lv] || lv);
      o.value = lv;
      levelSel.appendChild(o);
    });
    card.appendChild(levelSel);

    card.appendChild(el('div', 'muted', '名称（可选）'));
    const name = el('input', 'wrong-input');
    card.appendChild(name);

    card.appendChild(el('div', 'muted', '截止日期（可选）'));
    const dueInp = el('input', 'wrong-input');
    dueInp.type = 'date';
    card.appendChild(dueInp);

    card.appendChild(el('div', 'muted', '可转正最低下一级任务数'));
    const minChild = el('input', 'wrong-input');
    minChild.type = 'number';
    minChild.min = String(FOCUS_MIN_CHILD_MIN);
    minChild.max = String(FOCUS_MIN_CHILD_MAX);
    minChild.value = '1';
    card.appendChild(minChild);

    // 父级：按层次约束过滤（父级须恰为上一级）
    card.appendChild(el('div', 'muted', '上级（可选）'));
    const parentSel = el('select', 'wrong-input');
    function fillParents() {
      parentSel.innerHTML = '';
      const none = el('option', null, '（根级）');
      none.value = '';
      parentSel.appendChild(none);
      const wantParent = focusParentLevelOf(levelSel.value);
      if (wantParent) {
        st.orgs.filter(function (o) { return o && o.level === wantParent; }).forEach(function (o) {
          const opt = el('option', null, focusOrgLabel(o, st.settings));
          opt.value = o.id;
          parentSel.appendChild(opt);
        });
      }
    }
    levelSel.addEventListener('change', fillParents);
    fillParents();
    card.appendChild(parentSel);

    const btns = el('div', 'wrong-input-btns');
    const ok = el('button', 'btn primary', '创建');
    ok.addEventListener('click', function () {
      const level = levelSel.value;
      const parentId = parentSel.value || null;
      // 与「添加子级」共用同一校验：最小下级数 1..99、合法日期
      const nf = focusPlanNodeFields({ name: name.value, dueAt: dueInp.value, minChildCount: minChild.value }, 1);
      if (!nf.ok) { toast('截止日期不合法'); return; }
      modal.remove();
      const r = focusApply(function (s) {
        return focusCreateOrg(s, {
          level: level,
          name: nf.name,
          parentId: parentId,
          fromPlan: true,
          dueAt: nf.dueAt,
          minChildCount: nf.minChildCount
        }, Date.now());
      }, '已创建计划任务');
      if (r && r.ok && r.org) {
        focusUiState.collapsed[r.org.id] = false;
      }
    });
    const cancel = el('button', 'btn', '取消');
    cancel.addEventListener('click', function () { modal.remove(); });
    btns.appendChild(ok);
    btns.appendChild(cancel);
    card.appendChild(btns);
    modal.appendChild(card);
    document.body.appendChild(modal);
    setTimeout(function () { try { name.focus(); } catch (e) {} }, 50);
  }

  // 树内：给某节点加子级（计划模式）；子级层次由父级显式层次决定，可设最小下级数与截止日期
  function focusOpenInlineChildModal(parentOrg, st) {
    const childLevel = focusChildLevelOf(parentOrg.level);   // 组→单元、群→组、集团→群
    const modal = el('div', 'map-modal habit-modal');
    const backdrop = el('div', 'map-modal-backdrop');
    backdrop.addEventListener('click', function () { modal.remove(); });
    modal.appendChild(backdrop);
    const card = el('div', 'map-modal-card wrong-input-card');
    card.appendChild(el('h3', null, '添加子级 · ' + focusOrgLabel(parentOrg, st.settings)));
    if (!childLevel || !focusIsOrgLevel(childLevel)) {
      card.appendChild(el('p', 'muted', '任务组之下是单元，由专注完成生成，不在此创建。'));
      const close = el('button', 'btn', '知道了');
      close.addEventListener('click', function () { modal.remove(); });
      card.appendChild(close);
      modal.appendChild(card);
      document.body.appendChild(modal);
      return;
    }
    card.appendChild(el('div', 'muted', '名称（可选）'));
    const name = el('input', 'wrong-input');
    card.appendChild(name);

    card.appendChild(el('div', 'muted', '截止日期（可选）'));
    const dueInp = el('input', 'wrong-input');
    dueInp.type = 'date';
    card.appendChild(dueInp);

    card.appendChild(el('div', 'muted', '可转正最低下一级任务数'));
    const minChild = el('input', 'wrong-input');
    minChild.type = 'number';
    minChild.min = String(FOCUS_MIN_CHILD_MIN);
    minChild.max = String(FOCUS_MIN_CHILD_MAX);
    minChild.value = '1';
    card.appendChild(minChild);

    const btns = el('div', 'wrong-input-btns');
    const ok = el('button', 'btn primary', '创建 ' + (st.settings.levelNames[childLevel] || childLevel));
    ok.addEventListener('click', function () {
      // 与「新建计划任务」共用同一校验：最小下级数 1..99、合法日期
      const nf = focusPlanNodeFields({ name: name.value, dueAt: dueInp.value, minChildCount: minChild.value }, 1);
      if (!nf.ok) { toast('截止日期不合法'); return; }
      modal.remove();
      focusApply(function (s) {
        return focusCreateOrg(s, {
          level: childLevel,
          name: nf.name,
          parentId: parentOrg.id,
          fromPlan: true,
          dueAt: nf.dueAt,
          minChildCount: nf.minChildCount
        }, Date.now());
      }, '已添加子级');
    });
    const cancel = el('button', 'btn', '取消');
    cancel.addEventListener('click', function () { modal.remove(); });
    btns.appendChild(ok);
    btns.appendChild(cancel);
    card.appendChild(btns);
    modal.appendChild(card);
    document.body.appendChild(modal);
    setTimeout(function () { try { name.focus(); } catch (e) {} }, 50);
  }

  // 多选 → 组合到新节点：产物层次 = 成员最高层 + 1（单元→组、组→群、群→集团），可继续向上编入
  function focusOpenCombineModal(st) {
    const ids = focusSelectedIds();
    if (!ids.length) { toast('请先选择单元或下级'); return; }
    const units = ids.filter(function (id) { return focusFindUnit(st, id); });
    const orgs = ids.filter(function (id) { return focusFindOrg(st, id); });
    if (!units.length && !orgs.length) { toast('请先选择单元或下级'); return; }
    const level = focusCombineLevelOf(st, ids);
    if (!level) {
      toast('所选已是最高层次，无法再组合');
      return;
    }
    // 成员层次必须一致：混层无法落在同一产物层次下
    const mixed = ids.filter(function (id) { return !focusCanAttach(focusNodeLevel(st, id), level); });
    if (mixed.length) {
      toast('所选层次不一致：' + (st.settings.levelNames[level] || level) + '只能由' +
        (st.settings.levelNames[focusChildLevelOf(level)] || '下一级') + '组合');
      return;
    }
    const levelName = st.settings.levelNames[level] || level;
    const modal = el('div', 'map-modal habit-modal');
    const backdrop = el('div', 'map-modal-backdrop');
    backdrop.addEventListener('click', function () { modal.remove(); });
    modal.appendChild(backdrop);
    const card = el('div', 'map-modal-card wrong-input-card');
    card.appendChild(el('h3', null, '组合到新' + levelName));
    card.appendChild(el('p', 'muted', '将 ' + units.length + ' 个单元、' + orgs.length + ' 个下级节点组合为新' + levelName + '。'));
    if (!st.planMode) {
      card.appendChild(el('div', 'focus-await-title', '需开启计划模式'));
    }
    card.appendChild(el('div', 'muted', '名称（可选）'));
    const name = el('input', 'wrong-input');
    card.appendChild(name);

    card.appendChild(el('div', 'muted', '截止日期（可选）'));
    const dueInp = el('input', 'wrong-input');
    dueInp.type = 'date';
    card.appendChild(dueInp);

    card.appendChild(el('div', 'muted', '可转正最低下一级任务数'));
    const minChild = el('input', 'wrong-input');
    minChild.type = 'number';
    minChild.min = String(FOCUS_MIN_CHILD_MIN);
    minChild.max = String(FOCUS_MIN_CHILD_MAX);
    minChild.value = '1';
    card.appendChild(minChild);

    card.appendChild(el('div', 'muted', '挂在（可选）'));
    const parentSel = el('select', 'wrong-input');
    const none = el('option', null, '（根级）');
    none.value = '';
    parentSel.appendChild(none);
    const wantParent = focusParentLevelOf(level);
    if (wantParent) {
      st.orgs.filter(function (o) { return o && o.level === wantParent; }).forEach(function (o) {
        const opt = el('option', null, focusOrgLabel(o, st.settings));
        opt.value = o.id;
        parentSel.appendChild(opt);
      });
    }
    card.appendChild(parentSel);

    const btns = el('div', 'wrong-input-btns');
    const ok = el('button', 'btn primary', '组合');
    ok.addEventListener('click', function () {
      const parentId = parentSel.value || null;
      const nf = focusPlanNodeFields({ name: name.value, dueAt: dueInp.value, minChildCount: minChild.value }, 1);
      if (!nf.ok) { toast('截止日期不合法'); return; }
      modal.remove();
      focusApply(function (s) {
        return focusCombineNodes(s, {
          ids: ids,
          level: level,
          name: nf.name,
          parentId: parentId,
          fromPlan: true,
          dueAt: nf.dueAt,
          minChildCount: nf.minChildCount
        }, Date.now());
      }, '已组合到新' + levelName);
      focusUiState.selected = {};
    });
    const cancel = el('button', 'btn', '取消');
    cancel.addEventListener('click', function () { modal.remove(); });
    btns.appendChild(ok);
    btns.appendChild(cancel);
    card.appendChild(btns);
    modal.appendChild(card);
    document.body.appendChild(modal);
  }

  // 多选 → 移动到…：目标层次 = 所选层次 + 1（单元→组、组→群、群→集团）
  function focusOpenMoveModal(st, ids) {
    const list = (Array.isArray(ids) ? ids : []).map(String);
    const levels = {};
    list.forEach(function (id) {
      const lv = focusNodeLevel(st, id);
      if (lv) levels[lv] = 1;
    });
    const keys = Object.keys(levels);
    if (!keys.length) { toast('请先选择单元或下级'); return; }
    if (keys.length > 1) { toast('所选层次不一致，请分别移动'); return; }
    const level = keys[0];
    const wantParent = focusParentLevelOf(level);
    const modal = el('div', 'map-modal habit-modal');
    const backdrop = el('div', 'map-modal-backdrop');
    backdrop.addEventListener('click', function () { modal.remove(); });
    modal.appendChild(backdrop);
    const card = el('div', 'map-modal-card wrong-input-card');
    card.appendChild(el('h3', null, '移动到…'));
    card.appendChild(el('p', 'muted',
      '所选 ' + (st.settings.levelNames[level] || level) + ' 只能编入' +
      (wantParent ? (st.settings.levelNames[wantParent] || wantParent) : '（无可上升层次）') + '或回到根级。'));
    const sel = el('select', 'wrong-input');
    const none = el('option', null, '未编入（根级）');
    none.value = '';
    sel.appendChild(none);
    if (wantParent) {
      st.orgs.filter(function (o) { return o && o.level === wantParent; }).forEach(function (o) {
        const opt = el('option', null, focusOrgLabel(o, st.settings));
        opt.value = o.id;
        sel.appendChild(opt);
      });
    }
    card.appendChild(sel);
    const btns = el('div', 'wrong-input-btns');
    const ok = el('button', 'btn primary', '移动');
    ok.addEventListener('click', function () {
      const target = sel.value || null;
      modal.remove();
      focusApply(function (s) {
        return focusAttachNodes(s, list, target, Date.now());
      }, '已移动');
      focusUiState.selected = {};
    });
    const cancel = el('button', 'btn', '取消');
    cancel.addEventListener('click', function () { modal.remove(); });
    btns.appendChild(ok);
    btns.appendChild(cancel);
    card.appendChild(btns);
    modal.appendChild(card);
    document.body.appendChild(modal);
  }

  function focusOpenRenameOrgModal(org) {
    const modal = el('div', 'map-modal habit-modal');
    const backdrop = el('div', 'map-modal-backdrop');
    backdrop.addEventListener('click', function () { modal.remove(); });
    modal.appendChild(backdrop);
    const card = el('div', 'map-modal-card wrong-input-card');
    card.appendChild(el('h3', null, '改名 · ' + focusSeqLabel(org.level, org.seq)));
    const name = el('input', 'wrong-input');
    name.value = org.name || '';
    card.appendChild(name);
    const btns = el('div', 'wrong-input-btns');
    const ok = el('button', 'btn primary', '保存');
    ok.addEventListener('click', function () {
      modal.remove();
      focusApply(function (s) { return focusRenameOrg(s, org.id, name.value, Date.now()); }, '已改名');
    });
    const cancel = el('button', 'btn', '取消');
    cancel.addEventListener('click', function () { modal.remove(); });
    btns.appendChild(ok);
    btns.appendChild(cancel);
    card.appendChild(btns);
    modal.appendChild(card);
    document.body.appendChild(modal);
  }

  function focusOpenRenameUnitModal(unit) {
    const modal = el('div', 'map-modal habit-modal');
    const backdrop = el('div', 'map-modal-backdrop');
    backdrop.addEventListener('click', function () { modal.remove(); });
    modal.appendChild(backdrop);
    const card = el('div', 'map-modal-card wrong-input-card');
    card.appendChild(el('h3', null, '改名 · ' + focusSeqLabel('unit', unit.seq)));
    const name = el('input', 'wrong-input');
    name.value = unit.name || unit.taskText || '';
    card.appendChild(name);
    const btns = el('div', 'wrong-input-btns');
    const ok = el('button', 'btn primary', '保存');
    ok.addEventListener('click', function () {
      modal.remove();
      focusApply(function (s) { return focusSetUnitName(s, unit.id, name.value, Date.now()); }, '已改名');
    });
    const cancel = el('button', 'btn', '取消');
    cancel.addEventListener('click', function () { modal.remove(); });
    btns.appendChild(ok);
    btns.appendChild(cancel);
    card.appendChild(btns);
    modal.appendChild(card);
    document.body.appendChild(modal);
  }

export {
  FOCUS_KEY,
  FOCUS_DURATIONS,
  FOCUS_DEFAULT_DURATION,
  FOCUS_SCOUT_MIN,
  FOCUS_SCOUT_EXTEND_MIN,
  FOCUS_RESERVE_WINDOW_MS,
  FOCUS_TYPE_KEYS,
  FOCUS_FORMAL_TYPE_KEYS,
  FOCUS_LEVEL_KEYS,
  FOCUS_ORG_LEVELS,
  FOCUS_LEVEL_RANK,
  FOCUS_MIN_CHILD_MIN,
  FOCUS_MIN_CHILD_MAX,
  focusIsLevelKey,
  focusIsOrgLevel,
  focusLevelRank,
  focusLevelAtRank,
  focusParentLevelOf,
  focusChildLevelOf,
  focusCanAttach,
  focusNodeLevel,
  focusCombineLevelOf,
  focusNextSeq,
  focusMaxSeq,
  focusNormalizeMinChildCount,
  focusMinChildCountValid,
  focusNormalizeDueAt,
  focusDueDateValid,
  focusPlanNodeFields,
  focusAttachNodes,
  focusCombineNodes,
  FOCUS_SEQ_KEYS,
  FOCUS_TIER_MAIN,
  FOCUS_TIER_NORMAL,
  FOCUS_RESERVE_CHAIN_ID,
  FOCUS_ROLE_RESERVE,
  focusDefaultSettings,
  focusDefaultState,
  focusUid,
  focusClampMinutes,
  focusClampPct,
  focusNormalizeBehavior,
  focusYmd,
  focusSanitizeTypeNames,
  focusSanitizeLevelNames,
  focusSanitizeSettings,
  focusSanitizePrecedent,
  focusSanitizeUnit,
  focusSanitizeOrg,
  focusSanitizePlan,
  focusSanitizeChain,
  focusSanitizeState,
  focusCloneState,
  focusFindChain,
  focusActiveChain,
  focusFindOrg,
  focusFindUnit,
  focusFindPlan,
  focusMainChain,
  focusSeqLabel,
  focusUnitLabel,
  focusOrgLabel,
  focusWorkLabel,
  focusIsPrecedent,
  focusReservationRemainingMs,
  focusIsReservationOpen,
  focusUnitRemainingMs,
  focusCanComplete,
  focusUnitKey,
  focusTickPlan,
  focusIsTypeKey,
  focusSetTypeName,
  focusSetLevelName,
  focusSetFlavor,
  focusSetStructure,
  focusSetPlanMode,
  focusCreateChain,
  focusCreateMainChain,
  focusSetSeatNote,
  focusSetUnitMinutes,
  focusSetActive,
  focusReserve,
  focusExpireReservations,
  focusIsReserveChain,
  focusBumpReserveCount,
  focusSitDown,
  focusCompleteUnit,
  focusSetUnitName,
  focusScoutPromote,
  focusFlagSuspicious,
  focusResolveSuspicious,
  focusScoutStart,
  focusScoutExtend,
  focusScoutEnd,
  focusStrongestNormal,
  focusSuccession,
  focusDailyMinutes,
  focusDailyAvgCompletion,
  focusHeatData,
  focusTrendSeries,
  focusCreateOrg,
  focusRenameOrg,
  focusDeleteOrg,
  focusAssignUnit,
  focusAssignUnits,
  focusReparentOrgs,
  focusUnassignedUnits,
  focusNextLevelCount,
  focusDescendantUnitIds,
  focusOrgAggregates,
  focusOrgCanFormalize,
  focusFormalizeOrg,
  focusTemplateTriad,
  focusTreeRows,
  focusPlanCreate,
  focusPlanFilledCount,
  focusPlanDueSoon,
  focusPlanOverdue,
  focusPlanSettle,
  FOCUS_LEVEL_VISUALS,
  FOCUS_LEVEL_VISUAL_KEYS,
  focusLevelVisual,
  focusLevelVisualDelta,
  focusLevelBadge,
  focusParentAttribution,
  focusReminderInfo,
  focusReminderSync,
  focusReminderStart,
  focusReminderClear,
  FOCUS_REMINDER_UI_KEY
};

