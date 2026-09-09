  // ---------------- 全局配置常量（各模块共享，须最先拼接） ----------------
  // 目标倒计时
  const GOAL_DEFAULT = '考研';
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
