  // ---------------- 全局配置常量（各模块共享，须最先拼接） ----------------
  // 目标倒计时
  const GOAL_DEFAULT = '考研';
  const EXAM_AUTO_MONTH = 12, EXAM_AUTO_DAY = 20; // 默认每年 12 月 20 日（0-based：12 月）
  // 每日复习时间预算（分钟）
  const MIN_PER_DAY_DEFAULT = 20;
  // 各评分档单次复习成本（秒）
  const RATING_COST_S = [9, 6, 3, 1];
  // 毕业目标稳定度与目标日可提取性
  const TARGET_S_DEFAULT = 90;
  const TARGET_CONFIDENCE = 0.9;
  const TARGET_MIN_DAYS = 14;
  // 一天毫秒数 + 自然日对齐（复习间隔按整天）
  const DAY = 86400000;
  function dayStart(ts) {
    const d = new Date(ts);
    d.setHours(0, 0, 0, 0);
    return d.getTime();
  }
  const EF_MIN = 1.3; // 向后兼容保留（FSRS 易度已由难度/稳定性替代）