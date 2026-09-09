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

  // —— LWW 决策（纯函数，供单测）——
  function decideSyncAction(localUp, remoteUp) {
    if (remoteUp && !localUp) return 'pull';      // 本地缺时间戳（旧数据）：拉取，但拉取前会归档本地，无损
    if (!remoteUp && localUp) return 'push';      // 云端还没有：首推
    if (remoteUp > localUp + SYNC_TOLERANCE_MS) return 'pull';
    if (localUp > remoteUp + SYNC_TOLERANCE_MS) return 'push';
    return 'skip';
  }

  function syncReady() {
    const cfg = syncCfg();
    return !!(cfg.enabled && cfg.token && cfg.repo && /^[^/\s]+\/[^/\s]+$/.test(cfg.repo));
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
    return SYNC_DIR + '/archive/' + sid + '/' + new Date().toISOString().replace(/[:.]/g, '-') + '.json';
  }

  // 对单个学科执行一次 LWW 决策。返回 { action: push / pull / skip }
  async function syncSubject(sid) {
    const local = syncLocalDb(sid);
    const localUp = (local && typeof local.updatedAt === 'number') ? local.updatedAt : 0;
    const remote = await ghGetJson(SYNC_DIR + '/data/' + sid + '.json');
    const remoteUp = (remote && remote.data && typeof remote.data.updatedAt === 'number') ? remote.data.updatedAt : 0;
    const action = decideSyncAction(localUp, remoteUp);

    if (action === 'pull' && remote) {
      if (local) await ghPutJson(syncArchivePath(sid), local); // 覆盖本地前先归档本地版本
      if (!syncWriteLocalDb(sid, remote.data)) throw new Error('本地写入失败（存储空间不足？）');
      return { action: 'pull' };
    }
    if (action === 'push' && local) {
      let remoteSha = null;
      if (remote) { // 覆盖云端前先归档云端旧版本
        await ghPutJson(syncArchivePath(sid), remote.data, remote.sha);
        remoteSha = remote.sha;
      }
      await ghPutJson(SYNC_DIR + '/data/' + sid + '.json', local, remoteSha);
      return { action: 'push' };
    }
    return { action: action };
  }

  // 同步全部学科。mode：auto（各学科按 LWW）/ push（本地强制胜出）/ pull（云端强制胜出）
  async function runSync(mode) {
    if (typeof fetch === 'undefined') throw new Error('当前环境不支持网络请求');
    if (!syncReady()) throw new Error('请先在设置中填写 Token 与仓库并开启自动同步');
    const summary = { pushed: [], pulled: [], skipped: [], failed: [] };
    const sids = Object.keys(subjectList());
    for (const sid of sids) {
      try {
        let res;
        if (mode === 'push' || mode === 'pull') {
          const local = syncLocalDb(sid);
          const remote = await ghGetJson(SYNC_DIR + '/data/' + sid + '.json');
          if (mode === 'push' && local) {
            if (remote) await ghPutJson(syncArchivePath(sid), remote.data, remote.sha);
            await ghPutJson(SYNC_DIR + '/data/' + sid + '.json', local, remote ? remote.sha : null);
            res = { action: 'push' };
          } else if (mode === 'pull' && remote) {
            if (local) await ghPutJson(syncArchivePath(sid), local);
            if (!syncWriteLocalDb(sid, remote.data)) throw new Error('本地写入失败（存储空间不足？）');
            res = { action: 'pull' };
          } else {
            res = { action: 'skip' };
          }
        } else {
          res = await syncSubject(sid);
        }
        if (res.action === 'push') summary.pushed.push(sid);
        else if (res.action === 'pull') summary.pulled.push(sid);
        else summary.skipped.push(sid);
      } catch (err) {
        summary.failed.push(sid + '：' + (err && err.message ? err.message : '未知错误'));
      }
    }
    const cfg = syncCfg();
    cfg.lastSyncAt = Date.now();
    cfg.lastSyncMode = mode;
    cfg.lastSyncSummary = { pushed: summary.pushed.length, pulled: summary.pulled.length, failed: summary.failed.length };
    cfg.lastError = summary.failed.length ? summary.failed.join('；') : '';
    saveSyncCfg(cfg);

    // 当前学科被云端覆盖时：重载数据并刷新界面
    if (summary.pulled.indexOf(currentSubjectId) !== -1) {
      await loadDBAsync();
      renderApp();
    }
    return summary;
  }

  // —— 自动同步调度 ——
  let syncPushTimer = null;
  function scheduleSyncPush() {
    const cfg = syncCfg();
    if (!cfg.enabled || !syncReady()) return;
    if (syncPushTimer) clearTimeout(syncPushTimer);
    syncPushTimer = setTimeout(function () {
      syncPushTimer = null;
      runSync('auto').catch(function () {});
    }, 30000); // 防抖 30s：连续评分合并为一次上传
  }
  function autoSyncOnLaunch() {
    const cfg = syncCfg();
    if (!cfg.enabled || !syncReady()) return;
    runSync('auto').then(function (summary) {
      if (summary.pulled.indexOf(currentSubjectId) !== -1) {
        buildSession(0); // 云端覆盖了当前学科：重建学习队列以纳入变化
        renderApp();
      }
    }).catch(function () {});
  }

export { b64encodeUtf8, b64decodeUtf8, decideSyncAction, runSync, syncReady, syncCfg, saveSyncCfg, syncValidate, autoSyncOnLaunch };
