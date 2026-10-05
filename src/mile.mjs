  // ---------------- 里程碑（T37 · V2_PLAN §12 / ACT §12） ----------------
  // 叙事里程碑：条件 + 解锁时间 +「这说明…」+ 深链。无积分/兑换/排行/连击惩罚/失败羞辱。
  // 数据键 athena_mile_v1（MilestoneHit），与学习库隔离；Def 为代码常量（含纯函数谓词）。
  // 观察者模式：只读 habit/focus/学习公开状态，不改其规则本体。
  // title 为 Steam 式风味名（T37b 扩至 50 条）；hint 仍是可核对条件，meaning 仍是「这说明…」。

  const MILE_KEY = 'athena_mile_v1';
  const MILE_KINDS = ['habit', 'focus', 'learn'];

  // ---------------- 纯日期工具（测试可独立调用） ----------------
  function mileYmd(ts) {
    const d = (ts instanceof Date) ? ts : new Date(Number(ts) || 0);
    if (isNaN(d.getTime())) return '';
    return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
  }

  function mileAddDays(ymd, n) {
    const s = String(ymd || '');
    if (!/^\d{4}-\d{2}-\d{2}$/.test(s)) return '';
    const p = s.split('-').map(Number);
    const d = new Date(Date.UTC(p[0], p[1] - 1, p[2] + (Number(n) || 0)));
    return d.getUTCFullYear() + '-' + String(d.getUTCMonth() + 1).padStart(2, '0') + '-' + String(d.getUTCDate()).padStart(2, '0');
  }

  function mileDayDiff(a, b) {
    const sa = String(a || ''), sb = String(b || '');
    if (!/^\d{4}-\d{2}-\d{2}$/.test(sa) || !/^\d{4}-\d{2}-\d{2}$/.test(sb)) return NaN;
    const pa = sa.split('-').map(Number), pb = sb.split('-').map(Number);
    return Math.round((Date.UTC(pb[0], pb[1] - 1, pb[2]) - Date.UTC(pa[0], pa[1] - 1, pa[2])) / 86400000);
  }

  // 连续日数：从 endYmd 往前数（endYmd 当天不在集合则从昨天起算，与主页连击口径一致）
  function mileConsecutiveStreak(dateSet, endYmd) {
    const set = {};
    if (Array.isArray(dateSet)) dateSet.forEach(function (d) { if (d) set[String(d)] = 1; });
    else if (dateSet && typeof dateSet === 'object') {
      Object.keys(dateSet).forEach(function (k) { if (dateSet[k]) set[k] = 1; });
    }
    let cur = String(endYmd || '');
    if (!/^\d{4}-\d{2}-\d{2}$/.test(cur)) return 0;
    if (!set[cur]) {
      cur = mileAddDays(cur, -1);
      if (!set[cur]) return 0;
    }
    let n = 0;
    while (set[cur]) { n++; cur = mileAddDays(cur, -1); }
    return n;
  }

  // ---------------- 规则谓词（纯函数，读 snapshot） ----------------
  // snapshot 口径（由 mileCollectSnapshot 从公开状态汇总，测试可手造）：
  // {
  //   habit: { maxInternalize, fullInternalize, midInternalize, settleStreak, groupStableDays,
  //            treeCount, libraryCount, maxLevel, maxDoneCount, totalDone, tagCount, oldestTreeDays },
  //   focus: { mainWorkCount, successionCount, maxDailyMinutes, totalUnits, totalMinutes,
  //            precedents, scoutPromoted, perfectUnits, typeCount, focusStreak },
  //   learn: { anyCleared, reviewStreak, totalReviews, subjectsStarted, subjectsCleared,
  //            maxDailyReviews, maxDailyStudyMin, allClearToday }
  // }
  function mileSnap(s, kind) { return (s && s[kind]) || {}; }
  function mileNum(s, kind, key) { return Number(mileSnap(s, kind)[key]) || 0; }
  function mileFlag(s, kind, key) { return !!mileSnap(s, kind)[key]; }
  function mileAtLeast(s, kind, key, n) { return mileNum(s, kind, key) >= n; }

  // 原首批 9 条（保留 id，兼容已落盘 Hit）
  function mileRuleHabitFull(s) {
    return mileAtLeast(s, 'habit', 'maxInternalize', 100) || mileNum(s, 'habit', 'fullInternalize') > 0;
  }
  function mileRuleHabitSettle7(s) { return mileAtLeast(s, 'habit', 'settleStreak', 7); }
  function mileRuleHabitGroup14(s) { return mileAtLeast(s, 'habit', 'groupStableDays', 14); }
  function mileRuleFocusMain10(s) { return mileAtLeast(s, 'focus', 'mainWorkCount', 10); }
  function mileRuleFocusMain50(s) { return mileAtLeast(s, 'focus', 'mainWorkCount', 50); }
  function mileRuleFocusSuccession(s) { return mileAtLeast(s, 'focus', 'successionCount', 1); }
  function mileRuleFocusDay120(s) { return mileAtLeast(s, 'focus', 'maxDailyMinutes', 120); }
  function mileRuleLearnClear(s) { return mileFlag(s, 'learn', 'anyCleared'); }
  function mileRuleLearnStreak7(s) { return mileAtLeast(s, 'learn', 'reviewStreak', 7); }

  // ---------------- Def 表（代码常量；rule 为纯函数谓词） ----------------
  // 解锁文案结构：条件 + 时间 +「这说明…」+ 深链（go → 习惯/专注/学习）。
  // title = 风味名（Steam 成就腔）；hint = 可核对条件；meaning 以「这说明」开头。
  const MILESTONE_DEFS = [
    // ===== 习惯 · 17 =====
    {
      id: 'mile_habit_full',
      title: '定式已成',
      kind: 'habit',
      rule: mileRuleHabitFull,
      hint: '单节点内化达到 100%',
      meaning: '这说明该行为已接近自动化，可视为定式。',
      go: 'actHabit'
    },
    {
      id: 'mile_habit_settle7',
      title: '七日之约',
      kind: 'habit',
      rule: mileRuleHabitSettle7,
      hint: '树上连续 7 日结算完成',
      meaning: '这说明日常节律已经立住，结算不再是突击。',
      go: 'actHabit'
    },
    {
      id: 'mile_habit_group14',
      title: '互相托底',
      kind: 'habit',
      rule: mileRuleHabitGroup14,
      hint: '同标签组稳定 14 日（全员强化 ≥1）',
      meaning: '这说明组内互相托底，容错机制在起作用。',
      go: 'actHabit'
    },
    {
      id: 'mile_habit_first',
      title: '破土而出',
      kind: 'habit',
      rule: function (s) { return mileAtLeast(s, 'habit', 'treeCount', 1); },
      hint: '第 1 个习惯节点入树',
      meaning: '这说明想法变成了可检查的日课，而不是停留在备忘录。',
      go: 'actHabit'
    },
    {
      id: 'mile_habit_tree5',
      title: '小树林',
      kind: 'habit',
      rule: function (s) { return mileAtLeast(s, 'habit', 'treeCount', 5); },
      hint: '树上同时有 5 个节点',
      meaning: '这说明日课已经成林，彼此能互相提醒。',
      go: 'actHabit'
    },
    {
      id: 'mile_habit_tree10',
      title: '郁郁葱葱',
      kind: 'habit',
      rule: function (s) { return mileAtLeast(s, 'habit', 'treeCount', 10); },
      hint: '树上同时有 10 个节点',
      meaning: '这说明生活骨架已经铺开，检查清单本身就是节律。',
      go: 'actHabit'
    },
    {
      id: 'mile_habit_mid',
      title: '半自动化',
      kind: 'habit',
      rule: function (s) { return mileAtLeast(s, 'habit', 'midInternalize', 1) || mileAtLeast(s, 'habit', 'maxInternalize', 50); },
      hint: '单节点内化达到 50%',
      meaning: '这说明行为已经过半自动，提醒成本在下降。',
      go: 'actHabit'
    },
    {
      id: 'mile_habit_full3',
      title: '定式量产',
      kind: 'habit',
      rule: function (s) { return mileAtLeast(s, 'habit', 'fullInternalize', 3); },
      hint: '3 个节点内化同时达到 100%',
      meaning: '这说明定式不是偶然，方法可以复制。',
      go: 'actHabit'
    },
    {
      id: 'mile_habit_settle14',
      title: '两周节律',
      kind: 'habit',
      rule: function (s) { return mileAtLeast(s, 'habit', 'settleStreak', 14); },
      hint: '树上连续 14 日结算完成',
      meaning: '这说明节律扛过了新鲜感消退期。',
      go: 'actHabit'
    },
    {
      id: 'mile_habit_settle30',
      title: '整月不落',
      kind: 'habit',
      rule: function (s) { return mileAtLeast(s, 'habit', 'settleStreak', 30); },
      hint: '树上连续 30 日结算完成',
      meaning: '这说明月级节律已经立住，接近自动化生活。',
      go: 'actHabit'
    },
    {
      id: 'mile_habit_level2',
      title: '强化到位',
      kind: 'habit',
      rule: function (s) { return mileAtLeast(s, 'habit', 'maxLevel', 2); },
      hint: '单节点强化达到 +2',
      meaning: '这说明该行为在树上站稳了，不只是打卡过。',
      go: 'actHabit'
    },
    {
      id: 'mile_habit_level5',
      title: '树上元老',
      kind: 'habit',
      rule: function (s) { return mileAtLeast(s, 'habit', 'maxLevel', 5); },
      hint: '单节点强化达到 +5',
      meaning: '这说明该行为已经是身份的一部分，而非任务清单条目。',
      go: 'actHabit'
    },
    {
      id: 'mile_habit_done50',
      title: '打卡半百',
      kind: 'habit',
      rule: function (s) { return mileAtLeast(s, 'habit', 'maxDoneCount', 50); },
      hint: '单节点累计完成 50 次',
      meaning: '这说明重复本身产生了证据，而不只是感觉。',
      go: 'actHabit'
    },
    {
      id: 'mile_habit_done100',
      title: '百次成习',
      kind: 'habit',
      rule: function (s) { return mileAtLeast(s, 'habit', 'maxDoneCount', 100); },
      hint: '单节点累计完成 100 次',
      meaning: '这说明百次重复把行为写进了日程的身体记忆。',
      go: 'actHabit'
    },
    {
      id: 'mile_habit_lib10',
      title: '休养生息',
      kind: 'habit',
      rule: function (s) { return mileAtLeast(s, 'habit', 'libraryCount', 10); },
      hint: '习惯库中存有 10 个节点',
      meaning: '这说明你允许习惯排队，而不是硬塞进每天——容量管理也是方法。',
      go: 'actHabit'
    },
    {
      id: 'mile_habit_tags5',
      title: '多线程选手',
      kind: 'habit',
      rule: function (s) { return mileAtLeast(s, 'habit', 'tagCount', 5); },
      hint: '树上出现 5 个不同标签/组',
      meaning: '这说明自我提升是多线程的，不是单点突破。',
      go: 'actHabit'
    },
    {
      id: 'mile_habit_oldest30',
      title: '满月老友',
      kind: 'habit',
      rule: function (s) { return mileAtLeast(s, 'habit', 'oldestTreeDays', 30); },
      hint: '最早入树节点在树上满 30 天',
      meaning: '这说明你和这个行为相处满月，它已经是老朋友。',
      go: 'actHabit'
    },

    // ===== 专注 · 18 =====
    {
      id: 'mile_focus_first',
      title: '坐下，开干',
      kind: 'focus',
      rule: function (s) { return mileAtLeast(s, 'focus', 'totalUnits', 1); },
      hint: '完成第 1 个任务单元',
      meaning: '这说明你把「想做」变成了「计时做完」。',
      go: 'actFocus'
    },
    {
      id: 'mile_focus_10',
      title: '热身完毕',
      kind: 'focus',
      rule: mileRuleFocusMain10,
      hint: '主链完成第 10 单元',
      meaning: '这说明专注链能持续产出，不是一次性冲刺。',
      go: 'actFocus'
    },
    {
      id: 'mile_focus_50',
      title: '深度工作',
      kind: 'focus',
      rule: mileRuleFocusMain50,
      hint: '主链完成第 50 单元',
      meaning: '这说明深度工作已嵌入日程，量级到了。',
      go: 'actFocus'
    },
    {
      id: 'mile_focus_succession',
      title: '继位大典',
      kind: 'focus',
      rule: mileRuleFocusSuccession,
      hint: '主链继位发生 1 次',
      meaning: '这说明崩溃有预案——调试器生效，而不是清零重来。',
      go: 'actFocus'
    },
    {
      id: 'mile_focus_day60',
      title: '一小时沉浸',
      kind: 'focus',
      rule: function (s) { return mileAtLeast(s, 'focus', 'maxDailyMinutes', 60); },
      hint: '单日实际专注 ≥60 分钟',
      meaning: '这说明你已经能护住一整段不被打断的时间。',
      go: 'actFocus'
    },
    {
      id: 'mile_focus_day120',
      title: '完整上午',
      kind: 'focus',
      rule: mileRuleFocusDay120,
      hint: '单日实际专注 ≥120 分钟',
      meaning: '这说明单日深度专注能达到一个完整上午的量级。',
      go: 'actFocus'
    },
    {
      id: 'mile_focus_day240',
      title: '四小时熔炉',
      kind: 'focus',
      rule: function (s) { return mileAtLeast(s, 'focus', 'maxDailyMinutes', 240); },
      hint: '单日实际专注 ≥240 分钟',
      meaning: '这说明你进入了整块深度工作日，而不是碎片拼盘。',
      go: 'actFocus'
    },
    {
      id: 'mile_focus_units10',
      title: '单元小队',
      kind: 'focus',
      rule: function (s) { return mileAtLeast(s, 'focus', 'totalUnits', 10); },
      hint: '累计完成 10 个任务单元',
      meaning: '这说明产出有了流水线，而不是灵感驱动。',
      go: 'actFocus'
    },
    {
      id: 'mile_focus_units50',
      title: '半百流水',
      kind: 'focus',
      rule: function (s) { return mileAtLeast(s, 'focus', 'totalUnits', 50); },
      hint: '累计完成 50 个任务单元',
      meaning: '这说明工作单元已经成为默认单位，大脑知道怎么切题。',
      go: 'actFocus'
    },
    {
      id: 'mile_focus_units100',
      title: '百单元俱乐部',
      kind: 'focus',
      rule: function (s) { return mileAtLeast(s, 'focus', 'totalUnits', 100); },
      hint: '累计完成 100 个任务单元',
      meaning: '这说明你已经用一百次计时证明了「坐得住」。',
      go: 'actFocus'
    },
    {
      id: 'mile_focus_total20h',
      title: '二十小时',
      kind: 'focus',
      rule: function (s) { return mileAtLeast(s, 'focus', 'totalMinutes', 1200); },
      hint: '累计实际专注 ≥1200 分钟（20 小时）',
      meaning: '这说明深度时间已经成箱入库，不是感觉「今天很忙」。',
      go: 'actFocus'
    },
    {
      id: 'mile_focus_total60h',
      title: '时间领主',
      kind: 'focus',
      rule: function (s) { return mileAtLeast(s, 'focus', 'totalMinutes', 3600); },
      hint: '累计实际专注 ≥3600 分钟（60 小时）',
      meaning: '这说明你已经支配了整整两个半工作日的深度时间。',
      go: 'actFocus'
    },
    {
      id: 'mile_focus_prec1',
      title: '下必为例',
      kind: 'focus',
      rule: function (s) { return mileAtLeast(s, 'focus', 'precedents', 1); },
      hint: '沉淀 1 条永久允许的例外（判例）',
      meaning: '这说明规则开始长出例外法理，而不是一刀切硬扛。',
      go: 'actFocus'
    },
    {
      id: 'mile_focus_prec5',
      title: '判例汇编',
      kind: 'focus',
      rule: function (s) { return mileAtLeast(s, 'focus', 'precedents', 5); },
      hint: '沉淀 5 条判例',
      meaning: '这说明你已经有了一部自己的执行法典。',
      go: 'actFocus'
    },
    {
      id: 'mile_focus_scout1',
      title: '侦察兵转正',
      kind: 'focus',
      rule: function (s) { return mileAtLeast(s, 'focus', 'scoutPromoted', 1); },
      hint: '侦查单元转正 1 次',
      meaning: '这说明五分钟低门槛入口真的能把人带进深度工作。',
      go: 'actFocus'
    },
    {
      id: 'mile_focus_perfect10',
      title: '十分完美',
      kind: 'focus',
      rule: function (s) { return mileAtLeast(s, 'focus', 'perfectUnits', 10); },
      hint: '10 个单元完成度 = 100%',
      meaning: '这说明你不仅坐下了，还把事情做到了自己认账的完成度。',
      go: 'actFocus'
    },
    {
      id: 'mile_focus_types4',
      title: '多面手',
      kind: 'focus',
      rule: function (s) { return mileAtLeast(s, 'focus', 'typeCount', 4); },
      hint: '专注/突击/生活/计划 四类单元都做过',
      meaning: '这说明深度工作覆盖了生活全谱，不是只会刷题。',
      go: 'actFocus'
    },
    {
      id: 'mile_focus_streak7',
      title: '七日入座',
      kind: 'focus',
      rule: function (s) { return mileAtLeast(s, 'focus', 'focusStreak', 7); },
      hint: '连续 7 日都有任务单元完成',
      meaning: '这说明入座已经变成每日默认动作。',
      go: 'actFocus'
    },

    // ===== 学习 · 15 =====
    {
      id: 'mile_learn_first',
      title: '第一张卡',
      kind: 'learn',
      rule: function (s) { return mileAtLeast(s, 'learn', 'totalReviews', 1); },
      hint: '完成第 1 次复习/刷卡',
      meaning: '这说明主动回忆开始了，而不只是划线。',
      go: 'learn'
    },
    {
      id: 'mile_learn_clear',
      title: '收工铃响',
      kind: 'learn',
      rule: mileRuleLearnClear,
      hint: '单科首次清空到期',
      meaning: '这说明复习节奏追上了遗忘曲线，不是被拖着走。',
      go: 'learn'
    },
    {
      id: 'mile_learn_streak7',
      title: '一周不落',
      kind: 'learn',
      rule: mileRuleLearnStreak7,
      hint: '连续 7 日有复习',
      meaning: '这说明学习已进入日常，而不是靠考前突击。',
      go: 'learn'
    },
    {
      id: 'mile_learn_streak14',
      title: '两周续航',
      kind: 'learn',
      rule: function (s) { return mileAtLeast(s, 'learn', 'reviewStreak', 14); },
      hint: '连续 14 日有复习',
      meaning: '这说明续航过了意志力消耗期，靠的是日程而不是热情。',
      go: 'learn'
    },
    {
      id: 'mile_learn_streak30',
      title: '整月续航',
      kind: 'learn',
      rule: function (s) { return mileAtLeast(s, 'learn', 'reviewStreak', 30); },
      hint: '连续 30 日有复习',
      meaning: '这说明月级学习节律已经写进生活结构。',
      go: 'learn'
    },
    {
      id: 'mile_learn_reviews100',
      title: '百次回忆',
      kind: 'learn',
      rule: function (s) { return mileAtLeast(s, 'learn', 'totalReviews', 100); },
      hint: '累计复习/刷卡 ≥100 次',
      meaning: '这说明回忆次数本身就是记忆强度的来源。',
      go: 'learn'
    },
    {
      id: 'mile_learn_reviews500',
      title: '五百次回眸',
      kind: 'learn',
      rule: function (s) { return mileAtLeast(s, 'learn', 'totalReviews', 500); },
      hint: '累计复习/刷卡 ≥500 次',
      meaning: '这说明你已经和遗忘曲线正面交手五百回合。',
      go: 'learn'
    },
    {
      id: 'mile_learn_reviews1000',
      title: '千锤百炼',
      kind: 'learn',
      rule: function (s) { return mileAtLeast(s, 'learn', 'totalReviews', 1000); },
      hint: '累计复习/刷卡 ≥1000 次',
      meaning: '这说明主动回忆已经成为肌肉，而不再需要鼓起勇气。',
      go: 'learn'
    },
    {
      id: 'mile_learn_subjects3',
      title: '三线并进',
      kind: 'learn',
      rule: function (s) { return mileAtLeast(s, 'learn', 'subjectsStarted', 3); },
      hint: '3 个科目开始学习（有非新卡）',
      meaning: '这说明你能在多条战线同时推进，而不是单科赌一把。',
      go: 'learn'
    },
    {
      id: 'mile_learn_subjects5',
      title: '五线作战',
      kind: 'learn',
      rule: function (s) { return mileAtLeast(s, 'learn', 'subjectsStarted', 5); },
      hint: '5 个科目开始学习（有非新卡）',
      meaning: '这说明知识版图已经铺开，交错练习有了土壤。',
      go: 'learn'
    },
    {
      id: 'mile_learn_day30',
      title: '三十张日',
      kind: 'learn',
      rule: function (s) { return mileAtLeast(s, 'learn', 'maxDailyReviews', 30); },
      hint: '单日复习/刷卡 ≥30 张',
      meaning: '这说明你已经能吃下一次像样的复习量，而不是象征性打卡。',
      go: 'learn'
    },
    {
      id: 'mile_learn_day50',
      title: '肝帝觉醒',
      kind: 'learn',
      rule: function (s) { return mileAtLeast(s, 'learn', 'maxDailyReviews', 50); },
      hint: '单日复习/刷卡 ≥50 张',
      meaning: '这说明爆发力也在线——记得留休息，长期主义靠续航。',
      go: 'learn'
    },
    {
      id: 'mile_learn_clear3',
      title: '三科收工',
      kind: 'learn',
      rule: function (s) { return mileAtLeast(s, 'learn', 'subjectsCleared', 3); },
      hint: '3 个科目同时清空到期',
      meaning: '这说明多科节奏都被调到了遗忘曲线前面。',
      go: 'learn'
    },
    {
      id: 'mile_learn_study60',
      title: '一小时书桌',
      kind: 'learn',
      rule: function (s) { return mileAtLeast(s, 'learn', 'maxDailyStudyMin', 60); },
      hint: '单日学习时长 ≥60 分钟',
      meaning: '这说明你护住了一小时书桌时间，大脑需要这种连续段。',
      go: 'learn'
    },
    {
      id: 'mile_learn_allclear',
      title: '今日功成',
      kind: 'learn',
      rule: function (s) { return mileFlag(s, 'learn', 'allClearToday'); },
      hint: '全库无待复习，且今天确实学过',
      meaning: '这说明今天可以安心收工——该做的都做完了。',
      go: 'learn'
    }
  ];

  function mileFindDef(id) {
    const sid = String(id || '');
    return MILESTONE_DEFS.filter(function (d) { return d.id === sid; })[0] || null;
  }

  /**
   * 纯函数：给定公开状态快照，返回已满足条件的里程碑 defId 列表。
   * 不读写存储；不产生 Hit。测试可手造 snapshot 边界值。
   */
  function evaluateMilestones(snapshot) {
    const out = [];
    MILESTONE_DEFS.forEach(function (def) {
      try {
        if (typeof def.rule === 'function' && def.rule(snapshot)) out.push(def.id);
      } catch (e) { /* 谓词异常视为未满足，不中断 */ }
    });
    return out;
  }

  /**
   * 纯函数：把「已满足」并入 Hit 列表，只新增未记录过的 defId。
   * 返回 { hits, created }；created 为本次新产生的 Hit（用于轻提示）。
   */
  function mileRecordNew(hits, metIds, now) {
    const seen = {};
    const base = Array.isArray(hits) ? hits.slice() : [];
    base.forEach(function (h) { if (h && h.defId) seen[String(h.defId)] = 1; });
    const created = [];
    const t = Number(now) || Date.now();
    (Array.isArray(metIds) ? metIds : []).forEach(function (defId) {
      const sid = String(defId || '');
      if (!sid || seen[sid] || !mileFindDef(sid)) return;
      const hit = { id: 'milehit_' + t + '_' + sid, defId: sid, at: t, note: '' };
      seen[sid] = 1;
      base.push(hit);
      created.push(hit);
    });
    return { hits: base, created: created };
  }

  // ---------------- 存储（athena_mile_v1） ----------------
  function mileNormalizeHit(raw) {
    if (!raw || typeof raw !== 'object') return null;
    const defId = String(raw.defId == null ? '' : raw.defId);
    if (!mileFindDef(defId)) return null;
    const at = Number(raw.at) || 0;
    if (!at) return null;
    return {
      id: String(raw.id || ('milehit_' + at + '_' + defId)),
      defId: defId,
      at: at,
      note: String(raw.note == null ? '' : raw.note)
    };
  }

  function mileNormalize(raw) {
    const out = { hits: [] };
    const src = raw && typeof raw === 'object' && Array.isArray(raw.hits) ? raw.hits : [];
    const seen = {};
    src.forEach(function (h) {
      const hit = mileNormalizeHit(h);
      if (!hit || seen[hit.defId]) return;
      seen[hit.defId] = 1;
      out.hits.push(hit);
    });
    out.hits.sort(function (a, b) { return a.at - b.at; });
    return out;
  }

  function mileLoad() {
    if (typeof window !== 'undefined' && window.__mileData) return mileNormalize(window.__mileData);
    let raw = null;
    try { raw = JSON.parse(localStorage.getItem(MILE_KEY)); } catch (e) {}
    const st = mileNormalize(raw);
    if (typeof window !== 'undefined') window.__mileData = st;
    return st;
  }

  function mileSave(data) {
    const st = mileNormalize(data);
    if (typeof window !== 'undefined') window.__mileData = st;
    try { localStorage.setItem(MILE_KEY, JSON.stringify(st)); } catch (e) {}
    return st;
  }

  // ---------------- 快照采集（观察者，只读公开状态） ----------------
  // 组稳定天数（简化）：同 groupId/tag 的在树成员全部强化 ≥1 时，
  // 取最早 addedOn 到今天的天数为该组稳定龄；返回所有组的最大值。
  function mileGroupStableDays(nodes, todayYmd) {
    const today = String(todayYmd || mileYmd(Date.now()));
    const groups = {};
    (nodes || []).forEach(function (n) {
      if (!n || n.removedAt || !n.onTree) return;
      let key = n.groupId == null || n.groupId === '' ? '' : String(n.groupId).trim();
      if (!key) key = String(n.tag == null ? '' : n.tag).trim();
      if (!key) return;
      if (!groups[key]) groups[key] = [];
      groups[key].push(n);
    });
    let best = 0;
    Object.keys(groups).forEach(function (k) {
      const members = groups[k];
      if (members.length < 1) return;
      const allLeveled = members.every(function (n) { return (Number(n.level) || 0) >= 1; });
      if (!allLeveled) return;
      let earliest = null;
      members.forEach(function (n) {
        const a = String(n.addedOn || '');
        if (/^\d{4}-\d{2}-\d{2}$/.test(a) && (!earliest || a < earliest)) earliest = a;
      });
      if (!earliest) return;
      const age = mileDayDiff(earliest, today);
      if (Number.isFinite(age) && age > best) best = age;
    });
    return best;
  }

  function mileEmptySnapshot() {
    return {
      habit: {
        maxInternalize: 0, fullInternalize: 0, midInternalize: 0, settleStreak: 0, groupStableDays: 0,
        treeCount: 0, libraryCount: 0, maxLevel: 0, maxDoneCount: 0, totalDone: 0, tagCount: 0, oldestTreeDays: 0
      },
      focus: {
        mainWorkCount: 0, successionCount: 0, maxDailyMinutes: 0, totalUnits: 0, totalMinutes: 0,
        precedents: 0, scoutPromoted: 0, perfectUnits: 0, typeCount: 0, focusStreak: 0
      },
      learn: {
        anyCleared: false, reviewStreak: 0, totalReviews: 0, subjectsStarted: 0, subjectsCleared: 0,
        maxDailyReviews: 0, maxDailyStudyMin: 0, allClearToday: false
      }
    };
  }

  function mileCollectSnapshot(now) {
    const t = Number(now) || Date.now();
    const today = mileYmd(t);
    const snap = mileEmptySnapshot();

    // 习惯：只读 habitLoadNodes / habitLoadState 公开状态
    try {
      if (typeof habitLoadNodes === 'function') {
        const all = habitLoadNodes() || [];
        const live = all.filter(function (n) { return n && !n.removedAt; });
        const tree = live.filter(function (n) { return n.onTree; });
        snap.habit.treeCount = tree.length;
        snap.habit.libraryCount = live.filter(function (n) { return !n.onTree; }).length;
        live.forEach(function (n) {
          const iv = Number(n.internalize) || 0;
          if (iv > snap.habit.maxInternalize) snap.habit.maxInternalize = iv;
          if (iv >= 100) snap.habit.fullInternalize += 1;
          if (iv >= 50) snap.habit.midInternalize += 1;
          const lv = Number(n.level) || 0;
          if (lv > snap.habit.maxLevel) snap.habit.maxLevel = lv;
          const done = Array.isArray(n.doneDates) ? n.doneDates.length : 0;
          if (done > snap.habit.maxDoneCount) snap.habit.maxDoneCount = done;
          snap.habit.totalDone += done;
        });
        const tagSet = {};
        tree.forEach(function (n) {
          let key = n.groupId == null || n.groupId === '' ? '' : String(n.groupId).trim();
          if (!key) key = String(n.tag == null ? '' : n.tag).trim();
          if (key) tagSet[key] = 1;
        });
        snap.habit.tagCount = Object.keys(tagSet).length;
        let oldest = 0;
        tree.forEach(function (n) {
          const a = String(n.addedOn || '');
          if (!/^\d{4}-\d{2}-\d{2}$/.test(a)) return;
          const age = mileDayDiff(a, today);
          if (Number.isFinite(age) && age > oldest) oldest = age;
        });
        snap.habit.oldestTreeDays = oldest;
        snap.habit.groupStableDays = mileGroupStableDays(tree, today);
      }
      if (typeof habitLoadState === 'function') {
        const st = habitLoadState() || {};
        snap.habit.settleStreak = mileConsecutiveStreak(st.settledDates || [], today);
      }
    } catch (e) {}

    // 专注：只读 loadFocus 公开状态
    try {
      if (typeof loadFocus === 'function') {
        const st = loadFocus() || {};
        const chains = st.chains || [];
        chains.forEach(function (c) {
          if (!c) return;
          const tier = String(c.tier || '');
          if (tier === 'main' || tier === 'elite') {
            const w = Number(c.workCount) || 0;
            if (w > snap.focus.mainWorkCount) snap.focus.mainWorkCount = w;
          }
          if (c.inheritedFrom) snap.focus.successionCount += 1;
        });
        if (typeof focusMainChain === 'function') {
          try {
            const main = focusMainChain(st);
            if (main) {
              const w = Number(main.workCount) || 0;
              if (w > snap.focus.mainWorkCount) snap.focus.mainWorkCount = w;
            }
          } catch (e2) {}
        }
        snap.focus.precedents = (st.precedents || []).length;
        const units = st.units || [];
        snap.focus.totalUnits = units.length;
        const typeSet = {};
        const daySet = {};
        units.forEach(function (u) {
          if (!u) return;
          snap.focus.totalMinutes += Number(u.actualMin) || 0;
          if (u.promotedFromScout) snap.focus.scoutPromoted += 1;
          if ((Number(u.completion) || 0) >= 100) snap.focus.perfectUnits += 1;
          const tk = String(u.typeKey || '');
          if (tk && tk !== 'scout') typeSet[tk] = 1;
          if (u.endedAt) {
            const day = mileYmd(u.endedAt);
            if (day) daySet[day] = 1;
          }
        });
        snap.focus.typeCount = Object.keys(typeSet).length;
        snap.focus.focusStreak = mileConsecutiveStreak(daySet, today);
        if (typeof focusDailyMinutes === 'function') {
          try {
            const map = focusDailyMinutes(st) || {};
            Object.keys(map).forEach(function (d) {
              const v = Number(map[d]) || 0;
              if (v > snap.focus.maxDailyMinutes) snap.focus.maxDailyMinutes = v;
            });
          } catch (e2) {}
        } else {
          const byDay = {};
          units.forEach(function (u) {
            if (!u || !u.endedAt) return;
            const day = mileYmd(u.endedAt);
            if (!day) return;
            byDay[day] = (byDay[day] || 0) + (Number(u.actualMin) || 0);
          });
          Object.keys(byDay).forEach(function (d) {
            if (byDay[d] > snap.focus.maxDailyMinutes) snap.focus.maxDailyMinutes = byDay[d];
          });
        }
      }
    } catch (e) {}

    // 学习：各科 localStorage 快照（与 home 同口径），不切换学科
    try {
      if (typeof subjectList === 'function') {
        const reviewDates = {};
        const dayReviews = {};
        let totalDue = 0, totalToday = 0;
        Object.keys(subjectList() || {}).forEach(function (sid) {
          let db = null;
          try { db = JSON.parse(localStorage.getItem(sid + '_formula_srs_v1')); } catch (e) {}
          if (!db || !db.cards) return;
          let total = 0, due = 0, nonNew = 0;
          Object.keys(db.cards).forEach(function (id) {
            const c = db.cards[id];
            if (!c || c.state === 'new') return;
            total += 1;
            nonNew += 1;
            if ((c.state === 'review' || c.state === 'learning' || c.state === 'relearning') && c.due && c.due <= t) due += 1;
          });
          if (nonNew > 0) snap.learn.subjectsStarted += 1;
          if (total > 0 && due === 0) {
            snap.learn.anyCleared = true;
            snap.learn.subjectsCleared += 1;
          }
          totalDue += due;
          const daily = (db.log && db.log.daily) || {};
          Object.keys(daily).forEach(function (d) {
            const v = Number(daily[d]) || 0;
            if (v > 0) {
              reviewDates[d] = 1;
              snap.learn.totalReviews += v;
              dayReviews[d] = (dayReviews[d] || 0) + v;
            }
          });
          const todayCount = Number(daily[today]) || 0;
          totalToday += todayCount;
          const study = (db.log && db.log.studyTime) || {};
          Object.keys(study).forEach(function (d) {
            const mins = Math.round((Number(study[d]) || 0) / 60000);
            if (mins > snap.learn.maxDailyStudyMin) snap.learn.maxDailyStudyMin = mins;
          });
        });
        Object.keys(dayReviews).forEach(function (d) {
          if (dayReviews[d] > snap.learn.maxDailyReviews) snap.learn.maxDailyReviews = dayReviews[d];
        });
        snap.learn.reviewStreak = mileConsecutiveStreak(reviewDates, today);
        snap.learn.allClearToday = (totalDue === 0 && totalToday > 0);
      }
    } catch (e) {}

    return snap;
  }

  /**
   * 观察者同步：采集快照 → evaluate → 写入新 Hit。
   * 返回 { created, hits, snapshot }；created 非空时调用方可轻提示（可跳过）。
   */
  function mileSync(now) {
    const t = Number(now) || Date.now();
    const snap = mileCollectSnapshot(t);
    const met = evaluateMilestones(snap);
    const cur = mileLoad();
    const rec = mileRecordNew(cur.hits, met, t);
    if (rec.created.length) mileSave({ hits: rec.hits });
    return { created: rec.created, hits: rec.hits, snapshot: snap };
  }

  // 主页用：最近 1 条解锁（tag/text/go），无记录返回 null
  function mileRecentHit() {
    try {
      const st = mileLoad();
      if (!st.hits.length) return null;
      const hit = st.hits[st.hits.length - 1];
      const def = mileFindDef(hit.defId);
      if (!def) return null;
      return {
        tag: def.title,
        text: def.hint + '——' + def.meaning,
        go: def.go || 'actHabit',
        at: hit.at,
        defId: def.id
      };
    } catch (e) { return null; }
  }

  // ---------------- UI ----------------
  function mileFmtTime(at) {
    const t = Number(at) || 0;
    if (!t) return '';
    const d = new Date(t);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const hh = String(d.getHours()).padStart(2, '0');
    const mm = String(d.getMinutes()).padStart(2, '0');
    return y + '-' + m + '-' + day + ' ' + hh + ':' + mm;
  }

  const MILE_KIND_LABEL = { habit: '习惯', focus: '专注', learn: '学习' };

  function mileGo(view) {
    if (view === 'learn') {
      currentModule = 'cards';
      currentView = 'learn';
    } else if (view === 'actFocus') {
      currentModule = 'act';
      currentView = 'actFocus';
    } else if (view === 'actHabit') {
      currentModule = 'act';
      currentView = 'actHabit';
    } else if (view === 'mile') {
      currentView = 'mile';
    } else {
      currentModule = 'act';
      currentView = view || 'actHabit';
    }
    renderApp();
  }

  // 分类筛选：会话内状态（all | habit | focus | learn）
  let mileUiFilter = 'all';

  function mileCard(hit, def) {
    const card = el('div', 'mile-card');
    const head = el('div', 'mile-card-head');
    head.appendChild(el('span', 'mile-kind mile-kind-' + def.kind, MILE_KIND_LABEL[def.kind] || def.kind));
    head.appendChild(el('span', 'mile-title', def.title));
    head.appendChild(el('span', 'mile-time', mileFmtTime(hit.at)));
    card.appendChild(head);
    card.appendChild(el('div', 'mile-cond', '条件 · ' + def.hint));
    card.appendChild(el('div', 'mile-meaning', def.meaning));
    const btn = el('button', 'btn small mile-go', '去看 ' + (def.go === 'learn' ? '学习' : (def.go === 'actFocus' ? '专注链' : '习惯树')));
    btn.addEventListener('click', function () { mileGo(def.go); });
    card.appendChild(btn);
    return card;
  }

  function mileLockedCard(def) {
    const card = el('div', 'mile-card mile-locked');
    const head = el('div', 'mile-card-head');
    head.appendChild(el('span', 'mile-kind mile-kind-' + def.kind, MILE_KIND_LABEL[def.kind] || def.kind));
    head.appendChild(el('span', 'mile-title', def.title));
    head.appendChild(el('span', 'mile-badge', '未解锁'));
    card.appendChild(head);
    card.appendChild(el('div', 'mile-cond', '条件 · ' + def.hint));
    card.appendChild(el('div', 'muted mile-meaning', def.meaning));
    return card;
  }

  function renderMile() {
    // 先同步一次，保证时间线与公开状态一致（解锁时轻提示）
    let created = [];
    try {
      const r = mileSync();
      created = r.created || [];
      if (created.length && typeof toast === 'function') {
        const def = mileFindDef(created[0].defId);
        toast(def ? ('里程碑解锁 · ' + def.title) : '里程碑解锁');
      }
    } catch (e) {}

    const app = document.getElementById('app');
    const wrap = el('div', 'mile-wrap');
    wrap.appendChild(el('h2', null, '🏁 里程碑'));
    wrap.appendChild(el('p', 'muted mile-intro', '叙事路标，不是积分。风味名是玩笑，条件与「这说明」才是正事。'));

    // 分类筛选
    const chips = el('div', 'chips mile-chips');
    [['all', '全部'], ['habit', '习惯'], ['focus', '专注'], ['learn', '学习']].forEach(function (c) {
      const chip = el('button', 'chip' + (mileUiFilter === c[0] ? ' active' : ''), c[1]);
      chip.addEventListener('click', function () {
        mileUiFilter = c[0];
        renderApp();
      });
      chips.appendChild(chip);
    });
    wrap.appendChild(chips);

    const data = mileLoad();
    const hitByDef = {};
    data.hits.forEach(function (h) { hitByDef[h.defId] = h; });

    // 时间线：已解锁（按解锁时间倒序）
    const unlocked = MILESTONE_DEFS.filter(function (d) {
      return hitByDef[d.id] && (mileUiFilter === 'all' || d.kind === mileUiFilter);
    }).sort(function (a, b) {
      return (hitByDef[b.id].at || 0) - (hitByDef[a.id].at || 0);
    });

    wrap.appendChild(el('h3', null, '时间线 · 已解锁 ' + unlocked.length));
    if (!unlocked.length) {
      const empty = el('div', 'mile-empty');
      empty.appendChild(illus('milestone-habit'));
      empty.appendChild(el('p', null, '还没有解锁记录。去习惯树结算、专注链做几个单元，或清一科到期——第一条里程碑会在这里落笔。'));
      wrap.appendChild(empty);
    } else {
      const list = el('div', 'mile-list');
      unlocked.forEach(function (def) {
        list.appendChild(mileCard(hitByDef[def.id], def));
      });
      wrap.appendChild(list);
    }

    // 未解锁：只显示条件与「这说明」，无失败羞辱
    const locked = MILESTONE_DEFS.filter(function (d) {
      return !hitByDef[d.id] && (mileUiFilter === 'all' || d.kind === mileUiFilter);
    });
    wrap.appendChild(el('h3', null, '未解锁 ' + locked.length));
    if (locked.length) {
      const list = el('div', 'mile-list');
      locked.forEach(function (def) { list.appendChild(mileLockedCard(def)); });
      wrap.appendChild(list);
    }

    app.appendChild(wrap);
  }

  export {
    MILE_KEY,
    MILE_KINDS,
    MILESTONE_DEFS,
    mileYmd,
    mileAddDays,
    mileDayDiff,
    mileConsecutiveStreak,
    mileRuleHabitFull,
    mileRuleHabitSettle7,
    mileRuleHabitGroup14,
    mileRuleFocusMain10,
    mileRuleFocusMain50,
    mileRuleFocusSuccession,
    mileRuleFocusDay120,
    mileRuleLearnClear,
    mileRuleLearnStreak7,
    mileEmptySnapshot,
    evaluateMilestones,
    mileRecordNew,
    mileFindDef,
    mileNormalize,
    mileNormalizeHit,
    mileLoad,
    mileSave,
    mileGroupStableDays,
    mileCollectSnapshot,
    mileSync,
    mileRecentHit,
    mileFmtTime
  };
