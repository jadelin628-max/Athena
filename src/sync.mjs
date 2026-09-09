  // ---------------- 云同步（GitHub 私仓后端，本地优先、尽力而为） ----------------
  // 数据布局（私有仓库内）：
  //   athena-sync/data/{学科id}.json                 —— 该学科完整 DB（含 updatedAt 修改时间戳）
  //   athena-sync/archive/{学科id}/{ISO时间}.json     —— 被覆盖版本的自动归档（任何覆盖前先归档，不丢数据）
  // 同步策略：单用户、时间戳新者胜（LWW，2 秒容差）；任何覆盖前把被覆盖方归档到云端，等价于版本历史。
  // 设置存 localStorage（athena_sync），不属于学习数据、不参与同步。
  // 失败永不影响本地使用：token 失效/断网时静默跳过，状态记录在设置里。

  const SYNC_CFG_KEY = 'athena_sync';
  const SYNC_DIR = 'athena-sync';
  const SYNC_TOLERANCE_MS = 2000; // 时间戳容差：2 秒内的两端写入视为一致

  function syncCfg() {
    try { return JSON.parse(localStorage.getItem(SYNC_CFG_KEY)) || {}; } catch (e) { return {}; }
  }
  function saveSyncCfg(cfg) {
    try { localStorage.setItem(SYNC_CFG_KEY, JSON.stringify(cfg)); } catch (e) {}
  }

  // —— Base64（UTF-8 安全，GitHub contents API 要求）——
  function b64encodeUtf8(str) {
    const bytes = new TextEncoder().encode(str);
    let bin = '';
    for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
    return btoa(bin);
  }
  function b64decodeUtf8(b64) {
    const bin = atob(String(b64).replace(/\s/g, ''));
    const bytes = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
    return new TextDecoder().decode(bytes);
  }

  // —— LWW 决策已被 mergeDb 合并取代：覆盖改为逐卡归并，多端同时打开安全 ——

  // 卡片合并：调度状态整组取 lastR 较新一方（一次评分产生的一致整体）；
  // 笔记独立取 noteUpd 较新一方（withNotes=true，复习与笔记互不挤掉）。
  // 注意：胜者可能是本地内存对象，notes 改写即本地收敛到合并态。
  function mergeCard(a, b, withNotes) {
    const winner = (((b.lastR || 0) > (a.lastR || 0)) ? b : a);
    if (withNotes) {
      const an = a.noteUpd || 0, bn = b.noteUpd || 0;
      if (an !== bn) winner.notes = (an > bn ? (a.notes || '') : (b.notes || ''));
      if (an || bn) winner.noteUpd = Math.max(an, bn);
    }
    return winner;
  }

  // —— 合并两侧 DB（纯函数，供单测）——
  // 卡片/错题：并集，同卡按上述规则选边；仅一侧存在的卡整卡采用。
  // 日志：daily/studyTime/counts/detail 逐日（逐字段）取大——同时段两端学习时计数取 max 而非相加，
  //       只影响统计展示精度，不影响任何学习数据；checkins 取「或」；mastery/metrics 取当日专注较长一侧。
  // 自定义内容（custom/cardOverrides/customRel）：并集，冲突本地优先（低频，archive 兜底）。
  // 设置：本地优先（正在使用的设备）。updatedAt/schemaVersion 取大。
  function mergeDb(local, remote) {
    const out = {};
    Object.keys(local).forEach(function (k) { out[k] = local[k]; });
    out.updatedAt = Math.max(local.updatedAt || 0, remote.updatedAt || 0);
    out.schemaVersion = Math.max(local.schemaVersion || 0, remote.schemaVersion || 0);

    ['cards', 'wrongs'].forEach(function (key) {
      const a = local[key] || {}, b = remote[key] || {};
      const merged = {};
      Object.keys(a).forEach(function (id) { merged[id] = a[id]; });
      Object.keys(b).forEach(function (id) {
        merged[id] = merged[id] ? mergeCard(merged[id], b[id], key === 'cards') : b[id];
      });
      out[key] = merged;
    });

    ['custom', 'cardOverrides', 'customRel'].forEach(function (key) {
      out[key] = Object.assign({}, remote[key] || {}, local[key] || {});
    });

    const lg = Object.assign({}, local.log || {});
    const rlog = remote.log || {};
    ['daily', 'studyTime'].forEach(function (k) {
      const a = (local.log && local.log[k]) || {}, b = (rlog && rlog[k]) || {};
      const m = Object.assign({}, b);
      Object.keys(a).forEach(function (d) { m[d] = Math.max(a[d] || 0, b[d] || 0); });
      lg[k] = m;
    });
    (function () { // counts：每日 {n,r,w} 逐字段取大
      const a = (local.log && local.log.counts) || {}, b = (rlog && rlog.counts) || {};
      const m = Object.assign({}, b);
      Object.keys(a).forEach(function (d) {
        m[d] = {
          n: Math.max((a[d] && a[d].n) || 0, (b[d] && b[d].n) || 0),
          r: Math.max((a[d] && a[d].r) || 0, (b[d] && b[d].r) || 0),
          w: Math.max((a[d] && a[d].w) || 0, (b[d] && b[d].w) || 0)
        };
      });
      lg.counts = m;
    })();
    (function () { // detail：逐日逐卡取大
      const a = (local.log && local.log.detail) || {}, b = (rlog && rlog.detail) || {};
      const m = Object.assign({}, b);
      Object.keys(a).forEach(function (d) {
        const day = Object.assign({}, b[d] || {});
        Object.keys(a[d]).forEach(function (id) { day[id] = Math.max(a[d][id] || 0, (b[d] && b[d][id]) || 0); });
        m[d] = day;
      });
      lg.detail = m;
    })();
    (function () { // checkins：取或
      const a = (local.log && local.log.checkins) || {}, b = (rlog && rlog.checkins) || {};
      const m = Object.assign({}, b);
      Object.keys(a).forEach(function (d) { if (a[d]) m[d] = true; });
      lg.checkins = m;
    })();
    (function () { // mastery/metrics：取当日专注较长一侧的快照
      const st = lg.studyTime || {};
      ['mastery', 'metrics'].forEach(function (k) {
        const a = (local.log && local.log[k]) || {}, b = (rlog && rlog[k]) || {};
        const m = Object.assign({}, b);
        Object.keys(a).forEach(function (d) {
          const aSt = (local.log && local.log.studyTime && local.log.studyTime[d]) || 0;
          const bSt = (rlog && rlog.studyTime && rlog.studyTime[d]) || 0;
          m[d] = (aSt >= bSt) ? a[d] : b[d];
        });
        lg[k] = m;
      });
    })();
    (function () { // newIntro：已引入新卡并集（本地在前）
      const ai = (local.log && local.log.newIntro && local.log.newIntro.ids) || [];
      const bi = (rlog && rlog.newIntro && rlog.newIntro.ids) || [];
      lg.newIntro = { ids: ai.concat(bi.filter(function (id) { return ai.indexOf(id) === -1; })) };
    })();
    out.log = lg;
    return out;
  }

  // 已配置完整（Token + 仓库格式正确）：手动同步按钮的门槛（不要求打开自动同步开关）
  function syncConfigured() {
    const cfg = syncCfg();
    return !!(cfg.token && cfg.repo && /^[^/\s]+\/[^/\s]+$/.test(cfg.repo));
  }
  // 已配置且开启自动同步：启动拉取 / 防抖推送的门槛
  function syncReady() {
    const cfg = syncCfg();
    return !!cfg.enabled && syncConfigured();
  }

  async function ghRequest(path, opts) {
    const cfg = syncCfg();
    const headers = { 'Accept': 'application/vnd.github+json' };
    if (cfg.token) headers['Authorization'] = 'Bearer ' + cfg.token;
    const init = { method: (opts && opts.method) || 'GET', headers: headers };
    if (opts && opts.body) init.body = JSON.stringify(opts.body);
    const resp = await fetch('https://api.github.com/repos/' + cfg.repo + '/contents/' + path, init);
    if (resp.status === 404) return { notFound: true };
    if (!resp.ok) {
      let msg = 'HTTP ' + resp.status;
      try { const j = await resp.json(); if (j && j.message) msg += '：' + j.message; } catch (e) {}
      if (resp.status === 401) msg = 'Token 无效或过期（' + msg + '）';
      if (resp.status === 403) msg = '无权限或触发限流（' + msg + '）';
      throw new Error(msg);
    }
    return resp.json();
  }

  async function ghGetJson(path) {
    const j = await ghRequest(path);
    if (j.notFound) return null;
    if (j.encoding !== 'base64' || typeof j.content !== 'string') throw new Error('文件内容编码异常：' + path);
    return { sha: j.sha, data: JSON.parse(b64decodeUtf8(j.content)) };
  }

  async function ghPutJson(path, obj, sha) {
    const body = { message: 'Athena 同步：' + path + '（' + new Date().toISOString() + '）', content: b64encodeUtf8(JSON.stringify(obj)) };
    if (sha) body.sha = sha;
    return ghRequest(path, { method: 'PUT', body: body });
  }

  // 验证仓库与 Token（设置页「保存并验证」）
  async function syncValidate() {
    const cfg = syncCfg();
    if (!cfg.repo || !/^[^/\s]+\/[^/\s]+$/.test(cfg.repo)) throw new Error('仓库路径格式应为：用户名/仓库名');
    const headers = { 'Accept': 'application/vnd.github+json' };
    if (cfg.token) headers['Authorization'] = 'Bearer ' + cfg.token;
    const resp = await fetch('https://api.github.com/repos/' + cfg.repo, { headers: headers });
    if (resp.status === 404) throw new Error('仓库不存在，或 Token 无权访问（404）');
    if (resp.status === 401) throw new Error('Token 无效或过期（401）');
    if (!resp.ok) throw new Error('HTTP ' + resp.status);
    const j = await resp.json();
    return (j.private === true) ? '验证成功：私有仓库 ✓' : '验证成功，但这是公开仓库——学习数据对外可见，强烈建议改用私有仓库！';
  }

  // 本地某学科的 DB 对象：当前学科取内存 DB，其他学科读 localStorage 快照
  function syncLocalDb(sid) {
    if (sid === currentSubjectId && DB) return DB;
    try { return JSON.parse(localStorage.getItem(sid + '_formula_srs_v1')); } catch (e) { return null; }
  }
  function syncWriteLocalDb(sid, db) {
    try {
      localStorage.setItem(sid + '_formula_srs_v1', JSON.stringify(db));
      try { idbSet(sid + '_formula_srs_v1', db); } catch (e) {}
      return true;
    } catch (e) { warnStorageFailure(); return false; }
  }
  function syncArchivePath(sid) {
    // 随机后缀防撞名：两台设备同毫秒归档时，PUT 无 sha 的同名新文件会失败
    return SYNC_DIR + '/archive/' + sid + '/' + new Date().toISOString().replace(/[:.]/g, '-') + '-' + Math.random().toString(36).slice(2, 6) + '.json';
  }

  // sha 冲突（HTTP 409 / 422）：PUT 与服务器当前版本不一致——另一台设备刚写过
  function isShaConflict(err) {
    return err && /409|does not match|wasn't supplied/i.test(String(err.message || err));
  }

  // 对单个学科执行一次合并式同步（内置 409 重试：两台设备同时写入时，后到的 PUT 会被
  // GitHub 以 sha 不匹配拒绝——重新拉取云端、重新合并后再写，最多 3 次）。
  // 返回 { action: push / pull / merge / skip }
  // push = 云端被本地更新；pull = 本地被云端更新；merge = 两端都更新为合并结果。
  async function syncSubject(sid) {
    const local = syncLocalDb(sid);
    const localUp = (local && typeof local.updatedAt === 'number') ? local.updatedAt : 0;
    let lastErr = null;
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        const remote = await ghGetJson(SYNC_DIR + '/data/' + sid + '.json');
        const remoteUp = (remote && remote.data && typeof remote.data.updatedAt === 'number') ? remote.data.updatedAt : 0;

        if (local && !remote) { // 首推（若另一设备恰好先推了 → 409 重试，走合并分支）
          try {
            await ghPutJson(SYNC_DIR + '/data/' + sid + '.json', local);
            return { action: 'push' };
          } catch (err) {
            if (isShaConflict(err)) { lastErr = err; continue; }
            throw err;
          }
        }
        if (!local && remote) { // 本地没有（新设备）：拉取（不写云端，无冲突可能）
          if (!syncWriteLocalDb(sid, remote.data)) throw new Error('本地写入失败（存储空间不足？）');
          return { action: 'pull' };
        }
        if (!local && !remote) return { action: 'skip' };

        // 两侧都有：合并（多端同时打开的安全基石），再按结果决定哪边需要更新
        const merged = mergeDb(local, remote.data);
        const mergedUp = (typeof merged.updatedAt === 'number') ? merged.updatedAt : 0;
        let action = 'skip';
        if (mergedUp > remoteUp + SYNC_TOLERANCE_MS) { // 合并结果比云端新 → 更新云端（先归档云端旧版）
          await ghPutJson(syncArchivePath(sid), remote.data, remote.sha);
          try {
            await ghPutJson(SYNC_DIR + '/data/' + sid + '.json', merged, remote.sha);
          } catch (err) {
            if (isShaConflict(err)) { lastErr = err; continue; } // 云端刚被别的设备更新：重拉重合
            throw err;
          }
          action = 'push';
        }
        if (mergedUp > localUp + SYNC_TOLERANCE_MS) { // 合并结果比本地新 → 更新本地（先归档本地旧版）
          await ghPutJson(syncArchivePath(sid), local);
          if (!syncWriteLocalDb(sid, merged)) throw new Error('本地写入失败（存储空间不足？）');
          action = (action === 'push') ? 'merge' : 'pull';
        }
        return { action: action };
      } catch (err) {
        if (isShaConflict(err)) { lastErr = err; continue; }
        throw err;
      }
    }
    throw new Error('云端正在被其他设备更新，重试 3 次未成功——稍后再同步即可（' + (lastErr && lastErr.message ? lastErr.message : '') + '）');
  }

  // 同步全部学科（合并式）。summary：cloud=云端被更新，local=本地被更新，both=双向合并。
  // 串行排队：启动同步/防抖推送/前台回归/手动按钮可能重叠，同一设备同一时刻只跑一轮，
  // 否则两轮并发对同一文件 GET 相同 sha 后先后 PUT，后到的一方必收 409。
  let syncChain = Promise.resolve();
  function runSync() {
    if (typeof fetch === 'undefined') return Promise.reject(new Error('当前环境不支持网络请求'));
    const p = syncChain.then(function () {
      if (!syncConfigured()) throw new Error('云同步未配置完整：请先在设置中填写 Token 与仓库名');
      return doRunSync();
    });
    syncChain = p.catch(function () {});
    return p;
  }

  async function doRunSync() {
    const summary = { cloud: [], local: [], both: [], skipped: [], failed: [] };
    const sids = Object.keys(subjectList());
    for (const sid of sids) {
      try {
        const res = await syncSubject(sid);
        if (res.action === 'push') summary.cloud.push(sid);
        else if (res.action === 'pull') summary.local.push(sid);
        else if (res.action === 'merge') summary.both.push(sid);
        else summary.skipped.push(sid);
      } catch (err) {
        summary.failed.push(sid + '：' + (err && err.message ? err.message : '未知错误'));
      }
    }
    const cfg = syncCfg();
    cfg.lastSyncAt = Date.now();
    cfg.lastSyncSummary = { cloud: summary.cloud.length, local: summary.local.length, both: summary.both.length, failed: summary.failed.length };
    cfg.lastError = summary.failed.length ? summary.failed.join('；') : '';
    saveSyncCfg(cfg);

    // 当前学科被更新时：重载数据并刷新界面
    if (summary.local.concat(summary.both).indexOf(currentSubjectId) !== -1) {
      await loadDBAsync();
      renderApp();
    }
    return summary;
  }

  // —— 自动同步调度 ——
  let syncPushTimer = null;
  function scheduleSyncPush() {
    const cfg = syncCfg();
    if (!cfg.enabled || !syncConfigured()) return;
    if (syncPushTimer) clearTimeout(syncPushTimer);
    syncPushTimer = setTimeout(function () {
      syncPushTimer = null;
      runSync().catch(function () {});
    }, 30000); // 防抖 30s：连续评分合并为一次上传
  }
  function autoSyncOnLaunch() {
    const cfg = syncCfg();
    if (!cfg.enabled || !syncConfigured()) return;
    runSync().then(function (summary) {
      if (summary.local.concat(summary.both).indexOf(currentSubjectId) !== -1) {
        buildSession(0); // 当前学科数据被更新：重建学习队列以纳入变化
        renderApp();
      }
    }).catch(function () {});
  }

export { b64encodeUtf8, b64decodeUtf8, mergeDb, runSync, syncReady, syncConfigured, syncCfg, saveSyncCfg, syncValidate, autoSyncOnLaunch };
