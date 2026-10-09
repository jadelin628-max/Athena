  // ---------------- FSRS 步进调度状态机（知识卡学习调度专用） ----------------
  // 把「学习/重学时间步进 + 复习阶段 FSRS 更新」的状态迁移收敛到一处，
  // 变体只通过 opts 注入差异（错题卡不走此机器：v1.16.0 起为纯复习态，见 wrong.mjs）：
  //   stepsLearn / stepsRelearn : 学习 / 重学阶段的步长表（毫秒）
  //   lastLearnStep / lastRelearnStep : 各阶段最后一步索引（Good 越过该步即毕业）
  //   learningDue(now, steps, step) : 学习/重学阶段评分后的下次到期时刻
  //   relearnDue(now) : 复习阶段评「忘记」进入重学后的下次到期时刻
  //   graduate(c) : 毕业实现（按当前稳定度定间隔）
  //   reviewIvl(c, G) : 复习阶段 Hard/Good/Easy 的间隔天数
  // 四档评分：0 = 忘记(Again)；1 = 困难(Hard)；2 = 良好(Good)；3 = 简单(Easy)
  function applySchedRating(c, rating, opts) {
    const now = Date.now();
    const G = rating + 1; // 0=Again→1, 1=Hard→2, 2=Good→3, 3=Easy→4
    if (typeof c.step !== 'number') c.step = 0;
    // —— 学习 / 重学阶段（FSRS-6：短时记忆稳定度，Again 可降、Good/Easy 不降）——
    if (c.state === 'new' || c.state === 'learning' || c.state === 'relearning') {
      const isRelearn = (c.state === 'relearning');
      const steps = isRelearn ? opts.stepsRelearn : opts.stepsLearn;
      const lastStep = isRelearn ? opts.lastRelearnStep : opts.lastLearnStep;
      // 新卡首次评分建立初始 D/S；其后同日学习/重学步进用短时记忆稳定度更新
      if (c.state === 'new' || !(c.fsrsInit)) {
        c.diff = fsrsInitDifficulty(G);
        c.stab = fsrsInitStability(G);
        c.fsrsInit = 1;
      } else {
        c.stab = fsrsShortTermStability(c.stab, G);
      }
      if (rating === 0) { // Again：回第 0 步
        c.step = 0; c.grad = 0; c.reps = 0; c.ivl = 0;
        c.state = isRelearn ? 'relearning' : 'learning';
        c.due = opts.learningDue(now, steps, 0);
        return;
      }
      if (rating === 1) { // Hard：前进一步（不毕业）
        c.step = Math.min(c.step + 1, lastStep);
        c.state = isRelearn ? 'relearning' : 'learning';
        c.due = opts.learningDue(now, steps, c.step);
        return;
      }
      if (rating === 2) { // Good：前进一步，超过最后一步 → 毕业
        c.step = c.step + 1;
        if (c.step > lastStep) {
          opts.graduate(c);
        } else {
          c.state = isRelearn ? 'relearning' : 'learning';
          c.due = opts.learningDue(now, steps, c.step);
        }
        return;
      }
      opts.graduate(c); // Easy：直接毕业
      return;
    }
    // —— 复习阶段（FSRS-6：R(t,S) 遗忘曲线 + 难度/稳定性更新 + 期望保留率）——
    const daysSince = Math.max(0, (now - (c.lastR || c.due)) / DAY);
    const R = fsrsRetention(daysSince, c.stab);
    if (rating === 0) { // Again：遗忘 → 稳定性下降、难度上升，进入 Relearning 重学
      c.step = 0; c.state = 'relearning'; c.grad = 0; c.reps = 0; c.ivl = 0;
      c.lapses++;
      c.diff = fsrsDifficulty(c.diff, 1);
      c.stab = fsrsLapseStability(c.diff, c.stab, R);
      c.due = opts.relearnDue(now);
      return;
    }
    c.diff = fsrsDifficulty(c.diff, G);
    c.stab = fsrsSuccessStability(c.diff, c.stab, R, G);
    c.ivl = opts.reviewIvl(c, G);
    c.reps++; c.state = 'review'; c.due = dayStart(now) + c.ivl * DAY;
  }

  // ---------------- 提前复习：把「未到期」的调度中卡片立即到期（纯调度，不重置记忆历史） ----------------
  // 场景：用户浏览卡片时发现某张还没到期的卡其实已经忘了，想立刻复习（见浏览界面「立即重学」入口，
  // 自测重构「表现差 → 重学队列」也复用这里，不新增任何算法）。
  // 语义 = 提前复习、不重置历史：只把 due 落到当前时刻——
  //   stability / difficulty / 学习阶段(state/step/grad) / reps / lapses / ivl / lastR 一律不动，
  //   评分日志(revlog)也不写：这次点击不是一次复习记录。
  // 影响面只有「到期时刻」这一个纯调度字段：卡片随后由既有队列逻辑（buildSession / surfaceDue）
  // 自动收进复习队列；真正评分时仍由 applySchedRating 按原 stability/difficulty 与 lastR 计算保留率
  // 与下一个间隔（间隔与到期时间始终由既有 FSRS 算法产出，见 src/fsrs-core.mjs）。
  // 返回：true = 本次确实把未到期卡提前到期；false = 未到期条件不成立（新卡未进调度 / 已到期 / 缺 due）
  //       —— false 分支不改动任何字段，因此重复调用是幂等的。
  function markCardDueNow(c, now) {
    if (!c || typeof c !== 'object') return false;
    // 只有已进入调度状态的卡才有「到期/未到期」语义；新卡由新学队列引入，不在此处提前
    if (c.state !== 'review' && c.state !== 'learning' && c.state !== 'relearning') return false;
    if (typeof c.due !== 'number' || !isFinite(c.due)) return false; // 排期缺失/损坏：不猜测，交给 normalizeDB 自愈
    const t = (typeof now === 'number' && isFinite(now)) ? now : Date.now();
    if (c.due <= t) return false; // 已到期：幂等，一个字段都不写
    c.due = t;
    return true;
  }

export { applySchedRating, markCardDueNow };
