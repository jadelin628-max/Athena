  function renderSettings() {
    const app = document.getElementById('app');
    const wrap = el('div', 'settings-wrap');

    const s4 = el('div', 'setting-row');
    s4.appendChild(el('span', null, '目标名称'));
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
      updateCountdown();
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
    examInput.title = '留空则自动按每年 12 月 20 日（原考研初试日，可改）';
    examInput.addEventListener('change', function () {
      DB.settings.examDate = examInput.value || '';
      saveDB();
      updateCountdown();
      toast(examInput.value ? '目标日期已设为 ' + examInput.value : '已恢复自动（每年 12 月 20 日）');
    });
    s4b.appendChild(examInput);
    wrap.appendChild(s4b);
    wrap.appendChild(el('p', 'muted', '用于顶部「目标倒计时」与每日首启弹窗。目标名称与日期都可编辑——考研后可改成四六级/教资等，App 继续可用（复习排期不受影响，仅倒计时/毕业目标/掌握度随之更新）。留空日期 = 自动取最近一个 12 月 20 日。'));

    const s6 = el('div', 'setting-row');
    s6.appendChild(el('span', null, '每日复习时间预算'));
    const minInput = el('input', 'num');
    minInput.type = 'number';
    minInput.min = '5'; minInput.max = '120'; minInput.step = '1';
    minInput.style.width = '96px';
    minInput.value = (DB.settings && typeof DB.settings.minutesPerDay === 'number') ? DB.settings.minutesPerDay : MIN_PER_DAY_DEFAULT;
    minInput.title = '每日最多投入的复习时间（分钟）';
    minInput.addEventListener('change', function () {
      let v = parseInt(minInput.value, 10);
      if (isNaN(v)) v = MIN_PER_DAY_DEFAULT;
      v = Math.max(5, Math.min(120, v));
      DB.settings.minutesPerDay = v;
      saveDB();
      minInput.value = v;
      toast('每日复习时间预算 ' + v + ' 分钟');
      renderApp();
    });
    s6.appendChild(minInput);
    wrap.appendChild(s6);
    wrap.appendChild(el('p', 'muted', '按「时间」而非「卡片数」安排学习：到期复习优先，复习实际用时计入预算，剩余时间用来引入新卡——最小化记忆成本（SSP-MMC 成本约束）。'));

    const s7 = el('div', 'setting-row');
    s7.appendChild(el('span', null, '毕业目标稳定度'));
    const linkedCb = el('input', 'chk');
    linkedCb.type = 'checkbox';
    linkedCb.checked = targetLinked();
    linkedCb.title = '开启后：毕业目标随目标倒计时自动变化（要求目标日可提取性 ≥ 90%）';
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

    app.appendChild(wrap);
  }

  // ---------------- 记忆原理视图 ----------------
