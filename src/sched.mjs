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

export { applySchedRating };
