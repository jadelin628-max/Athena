  function renderSettings() {
    const app = document.getElementById('app');
    const wrap = el('div', 'settings-wrap');
    wrap.appendChild(el('h2', null, '⚙️ 设置'));

    // 分栏（会话内切换）：学习偏好 / 数据与同步 / 关于
    let settingsTab = renderSettings._tab || 'study';
    const tabs = el('div', 'chips');
    [['study', '🎛 学习偏好'], ['data', '💾 数据与同步'], ['about', 'ℹ️ 关于']].forEach(function (t) {
      const b = el('button', 'chip' + (settingsTab === t[0] ? ' active' : ''), t[1]);
      b.addEventListener('click', function () { renderSettings._tab = t[0]; renderApp(); });
      tabs.appendChild(b);
    });
    wrap.appendChild(tabs);

    const row = function (label) { const r = el('div', 'setting-row'); r.appendChild(el('span', null, label)); return r; };
    const note = function (text) { wrap.appendChild(el('p', 'muted', text)); };

    if (settingsTab === 'study') {

    const s4 = row('目标名称');
    const goalInput = el('input', 'num');
    goalInput.type = 'text';
    goalInput.maxLength = 10;
    goalInput.style.width = '120px';
    goalInput.value = (DB.settings && typeof DB.settings.goalTitle === 'string') ? DB.settings.goalTitle : GOAL_DEFAULT;
    goalInput.title = '倒计时指向的目标名称（可编辑，如考研 / 四六级 / 教资）';
    goalInput.addEventListener('change', function () {
      const v = goalInput.value.trim() || GOAL_DEFAULT;
      DB.settings.goalTitle = v;
      saveDB();
      goalInput.value = v;
      toast('目标名称已设为「' + v + '」');
      renderApp();
    });
    s4.appendChild(goalInput);
    wrap.appendChild(s4);

    const s4b = el('div', 'setting-row');
    s4b.appendChild(el('span', null, '目标日期'));
    const examInput = el('input', 'num');
    examInput.type = 'date';
    examInput.style.width = '158px';
    examInput.value = (DB.settings && DB.settings.examDate) || '';
    examInput.title = '留空则不显示倒计时与每日弹窗';
    examInput.addEventListener('change', function () {
      DB.settings.examDate = examInput.value || '';
      saveDB();
      toast(examInput.value ? '目标日期已设为 ' + examInput.value : '已清除目标日期（倒计时关闭）');
    });
    s4b.appendChild(examInput);
    wrap.appendChild(s4b);
    wrap.appendChild(el('p', 'muted', '设置目标日期后，每次打开应用会弹出倒计时提醒；毕业目标可自动随倒计时变化。留空则全部关闭。'));

    const sBare = el('div', 'setting-row');
    sBare.appendChild(el('span', null, '裸回忆'));
    const bareCb = el('input', 'chk');
    bareCb.type = 'checkbox';
    bareCb.checked = bareRecallOn();
    bareCb.title = '开启后，学习时先隐藏分类徽标，逼你先判断「这是哪一类」再回忆，更贴合交错练习的辨别';
    bareCb.addEventListener('change', function () {
      DB.settings.bareRecall = bareCb.checked;
      saveDB();
      toast(bareCb.checked ? '裸回忆已开启（学习时隐藏分类提示）' : '裸回忆已关闭');
      renderApp();
    });
    const bareLabel = el('label', 'setting-check', '');
    bareLabel.appendChild(bareCb);
    bareLabel.appendChild(el('span', null, '学习时隐藏分类提示（先判断类别再回忆）'));
    sBare.appendChild(bareLabel);
    wrap.appendChild(sBare);
    wrap.appendChild(el('p', 'muted', '交错练习的关键是「辨别」：先判断这道题属于哪一章、该用哪个方法，再回忆内容。开启后，卡片正面不再显示分类徽标，点开答案后才出现。'));

    const s7 = el('div', 'setting-row');
    s7.appendChild(el('span', null, '毕业目标稳定度'));
    const linkedCb = el('input', 'chk');
    linkedCb.type = 'checkbox';
    linkedCb.checked = targetLinked();
    linkedCb.disabled = (countdownDays() == null);
    if (linkedCb.disabled) linkedCb.checked = false;
    linkedCb.title = '开启后：毕业目标随目标倒计时自动变化（要求目标日可提取性 ≥ 90%）；需先设置目标日期';
    linkedCb.addEventListener('change', function () {
      DB.settings.targetLinkExam = linkedCb.checked;
      saveDB();
      toast(linkedCb.checked ? '毕业目标已与目标倒计时挂钩（目标日保证 ≥90%）' : '毕业目标改用固定值');
      renderApp();
    });
    const cbLabel = el('label', 'setting-check', '');
    cbLabel.appendChild(linkedCb);
    cbLabel.appendChild(el('span', null, '与目标倒计时挂钩'));
    s7.appendChild(cbLabel);
    const tInput = el('input', 'num');
    tInput.type = 'number';
    tInput.min = '7'; tInput.max = '730'; tInput.step = '1';
    tInput.style.width = '96px';
    tInput.value = (DB.settings && typeof DB.settings.targetS === 'number') ? DB.settings.targetS : TARGET_S_DEFAULT;
    tInput.title = '关闭「与倒计时挂钩」时使用的固定目标稳定度（天）';
    tInput.addEventListener('change', function () {
      let v = parseInt(tInput.value, 10);
      if (isNaN(v)) v = TARGET_S_DEFAULT;
      v = Math.max(7, Math.min(730, v));
      DB.settings.targetS = v;
      saveDB();
      tInput.value = v;
      toast('固定毕业目标稳定度 ' + v + ' 天');
      renderApp();
    });
    s7.appendChild(tInput);
    wrap.appendChild(s7);
    wrap.appendChild(el('p', 'muted', targetLinked()
      ? '毕业目标自动随目标倒计时变化：要求「' + goalTitle() + '日仍能 ≥90% 记得」（等价稳定度 S ≥ 剩余天数）。距' + goalTitle() + ' ' + countdownDays() + ' 天 → 目标 S_N ≈ ' + Math.round(targetS()) + ' 天。'
      : '稳定度 S 达到该值即「毕业/稳固」——表示「停止复习后仍能 ≥90% 记得」的天数（固定值 ' + Math.round(targetS()) + ' 天）。勾选上方的「与目标倒计时挂钩」可改为随倒计时动态变化。'));

    }

    if (settingsTab === 'data') {

    const s2 = el('div', 'setting-row');
    s2.appendChild(el('span', null, '备份 / 迁移进度'));
    const exp = el('button', 'btn', '导出 JSON');
    exp.setAttribute('data-action', 'export');
    s2.appendChild(exp);
    const imp = el('button', 'btn primary', '导入 JSON');
    imp.setAttribute('data-action', 'importjson');
    s2.appendChild(imp);
    wrap.appendChild(s2);
    wrap.appendChild(el('p', 'muted', '换设备或换网址（如本地→线上）时：先「导出」生成备份文件，再到新位置「导入」。'));

    const s2b = el('div', 'setting-row');
    s2b.appendChild(el('span', null, '全部科目互通'));
    const expAll = el('button', 'btn', '导出全部');
    expAll.setAttribute('data-action', 'exportall');
    s2b.appendChild(expAll);
    const impAll = el('button', 'btn primary', '导入全部');
    impAll.setAttribute('data-action', 'importall');
    s2b.appendChild(impAll);
    wrap.appendChild(s2b);
    wrap.appendChild(el('p', 'muted', '把四个学科的学习进度与统计打包成单个 JSON 文件，一键迁移到另一台设备或平台（手机 / 平板 / 电脑 / 网页版）。'));

    // —— 云同步（GitHub 私仓）——
    const scfg = syncCfg();
    const sSync = el('div', 'setting-row');
    sSync.appendChild(el('span', null, '云同步 (GitHub)'));
    const autoCb = el('input', 'chk');
    autoCb.type = 'checkbox';
    autoCb.checked = !!scfg.enabled;
    const autoLabel = el('label', 'setting-check', '');
    autoLabel.appendChild(autoCb);
    autoLabel.appendChild(el('span', null, '自动同步（启动拉取 + 评分后防抖上传）'));
    autoLabel.title = '开启后：打开应用自动比对云端，评分落盘约 30 秒后自动上传有变化的学科';
    autoCb.addEventListener('change', function () {
      const c = syncCfg();
      c.enabled = autoCb.checked;
      saveSyncCfg(c);
      toast(autoCb.checked ? '自动同步已开启' : '自动同步已关闭');
    });
    sSync.appendChild(autoLabel);
    wrap.appendChild(sSync);

    const sSyncCfg = el('div', 'setting-row');
    const tokenInput = el('input', 'num');
    tokenInput.type = 'password';
    tokenInput.style.width = '240px';
    tokenInput.placeholder = 'GitHub Token（仅保存在本设备）';
    tokenInput.value = scfg.token || '';
    sSyncCfg.appendChild(tokenInput);
    const repoInput = el('input', 'num');
    repoInput.type = 'text';
    repoInput.style.width = '170px';
    repoInput.placeholder = '用户名/仓库名';
    repoInput.value = scfg.repo || '';
    sSyncCfg.appendChild(repoInput);
    const saveBtn = el('button', 'btn', '保存并验证');
    saveBtn.addEventListener('click', function () {
      const c = syncCfg();
      c.token = tokenInput.value.trim();
      c.repo = repoInput.value.trim();
      saveSyncCfg(c);
      saveBtn.disabled = true;
      toast('正在验证…');
      syncValidate().then(function (msg) {
        toast(msg);
      }).catch(function (err) {
        toast('验证失败：' + (err.message || err));
      }).finally(function () { saveBtn.disabled = false; });
    });
    sSyncCfg.appendChild(saveBtn);
    wrap.appendChild(sSyncCfg);

    const sSyncBtns = el('div', 'setting-row');
    const syncBtn = el('button', 'btn primary', '立即同步');
    syncBtn.addEventListener('click', function () {
      if (!syncConfigured()) { toast('云同步未配置完整：请先填写 Token 与仓库名并验证'); return; }
      syncBtn.disabled = true;
      toast('同步中…');
      runSync().then(function (summary) {
        let msg = '同步完成：云端更新 ' + summary.cloud.length + ' 科，本地更新 ' + summary.local.length + ' 科，双向合并 ' + summary.both.length + ' 科';
        if (summary.failed.length) msg += '，失败：' + summary.failed[0];
        toast(msg);
        renderApp();
      }).catch(function (err) {
        toast('同步失败：' + (err.message || err));
      }).finally(function () { syncBtn.disabled = false; });
    });
    sSyncBtns.appendChild(syncBtn);
    wrap.appendChild(sSyncBtns);
    const last = scfg.lastSyncAt
      ? ('上次同步：' + new Date(scfg.lastSyncAt).toLocaleString() + '（云端更新 ' + (scfg.lastSyncSummary ? scfg.lastSyncSummary.cloud : 0) + ' / 本地更新 ' + (scfg.lastSyncSummary ? scfg.lastSyncSummary.local : 0) + ' / 双向合并 ' + (scfg.lastSyncSummary ? scfg.lastSyncSummary.both : 0) + ' 科）' + (scfg.lastError ? '——上次错误：' + scfg.lastError : ''))
      : '尚未同步过。';
    note(last);
    note('准备步骤：① 在 GitHub 新建一个【私有】仓库；② 创建 Fine-grained Token，仅勾选该仓库、权限 Contents: Read and write；③ 填入上方并「保存并验证」。同步把四科整库快照存入仓库 athena-sync/ 目录；合并式同步按卡片逐张取较新记录，多端同时打开不会互相覆盖，任何合并前两侧都会自动归档到 archive/。数据为明文 JSON，请确保仓库为私有。');

    }

    if (settingsTab === 'about') {

    const s8 = el('div', 'setting-row');
    s8.appendChild(el('span', null, '更新与缓存'));
    const cc = el('button', 'btn', '强制清除缓存并更新');
    cc.setAttribute('data-action', 'clearcache');
    cc.setAttribute('title', '清除 Service Worker 与全部缓存后自动刷新，用于移动端测试最新版本');
    s8.appendChild(cc);
    wrap.appendChild(s8);
    wrap.appendChild(el('p', 'muted', '移动端看不到最新版本时使用：清除浏览器缓存（Service Worker + 静态资源缓存）后重新加载，不丢学习进度。'));

    const s3 = el('div', 'setting-row danger-row');
    s3.appendChild(el('span', null, '重置全部学习进度'));
    const reset = el('button', 'btn danger', '清空并重来');
    reset.setAttribute('data-action', 'resetall');
    s3.appendChild(reset);
    wrap.appendChild(s3);

    const s5 = el('div', 'setting-row changelog-row');
    s5.appendChild(el('span', null, '📜 更新日志'));
    const tog = el('button', 'btn small', '展开');
    tog.setAttribute('data-action', 'togglog');
    s5.appendChild(tog);
    wrap.appendChild(s5);
    wrap.appendChild(el('p', 'muted', '记录每个版本的修改内容，当前版本高亮。'));

    const cl = el('div', 'changelog-body hidden');
    CHANGELOG.forEach(function (entry) {
      const row = el('div', 'changelog-item' + (entry.v === VERSION ? ' current' : ''));
      row.appendChild(el('span', 'changelog-badge', 'v' + entry.v));
      const right = el('div', 'changelog-main');
      right.appendChild(el('span', 'changelog-date', entry.date));
      const list = el('ul', 'changelog-items');
      entry.items.forEach(function (it) { list.appendChild(el('li', null, it)); });
      right.appendChild(list);
      row.appendChild(right);
      cl.appendChild(row);
    });
    wrap.appendChild(cl);

    }

    app.appendChild(wrap);
  }

  // ---------------- 记忆原理视图 ----------------
