  // ---------------- 知识库 · 原理与依据（V2-F：左目录 + 搜索 + 条目详情） ----------------
  const KB_CATS = [
    { id: 'learn', icon: '📚', title: '学习科学' },
    { id: 'cog', icon: '🧠', title: '认知与行为' },
    { id: 'act', icon: '🚀', title: '行动方法' },
    { id: 'myth', icon: '🚫', title: '证伪与误区' },
    { id: 'appx', icon: '📎', title: '方法论附录' }
  ];

  // 条目约定：summary 一句话；points 短要点（少长科普）；
  // evidence 必含 研究者+年份+期刊或来源 与 🟢/🟡/⚠️；features 链到功能名。
  const KB_ENTRIES = [
    // ---- 学习科学 ----
    {
      id: 'retrieval', cat: 'learn', icon: '🔍', title: '检索练习',
      summary: '合上书主动回忆，远比反复阅读更牢固。',
      points: [
        '回忆本身强化记忆通路；重读只是被动接触。',
        '应用闭环：先回想 → 核对答案 → 按真实质量评分。',
        '「顺滑感」多为流畅性错觉，不代表学会。'
      ],
      evidence: [
        { g: '🟢', ref: 'Roediger & Karpicke 2006 · Psychological Science' },
        { g: '🟢', ref: 'Dunlosky et al. 2013 · Psychological Science in the Public Interest（效用 A 级）' }
      ],
      features: [{ label: '自测', nav: 'quiz' }, { label: '错题本', nav: 'wrongBrowse' }]
    },
    {
      id: 'spacing', cat: 'learn', icon: '📅', title: '间隔重复',
      summary: '同样总时长，分散到多天远优于考前突击。',
      points: [
        '间隔约为目标保留期的 10–20% 较稳。',
        'FSRS 把下次复习放在遗忘临界点，而非固定日历。',
        '突击可应付明天，撑不过下周。'
      ],
      evidence: [
        { g: '🟢', ref: 'Cepeda et al. 2006 · Psychological Bulletin（254 项研究荟萃）' },
        { g: '🟢', ref: 'Dunlosky et al. 2013（效用 A 级）' }
      ],
      features: [{ label: '知识卡', nav: 'learn' }, { label: '统计', nav: 'statistics' }]
    },
    {
      id: 'interleave', cat: 'learn', icon: '🔀', title: '交错练习',
      summary: '不同章节/题型混着练，迁移更好——练习时更「难受」是正常的。',
      points: [
        '集中刷同类题的顺滑感会高估掌握。',
        '本应用：关联卡片辨析聚类、相邻出现；「裸回忆」隐藏分类徽标。',
        '交错属合意困难：只挑战提取与辨别，不是添乱。'
      ],
      evidence: [
        { g: '🟡', ref: 'Rohrer & Taylor 2007 · Applied Cognitive Psychology' },
        { g: '🟡', ref: 'Dunlosky et al. 2013（效用 B 级）' }
      ],
      features: [{ label: '自测', nav: 'quiz' }]
    },
    {
      id: 'elaboration', cat: 'learn', icon: '❓', title: '自我解释与精细提问',
      summary: '对材料追问「为什么成立、和什么有关、用在什么题型」。',
      points: [
        '每记一个公式做三问，建立条件化网络。',
        '示例学习：先照例题仿写，尽快脱离例题独立做。'
      ],
      evidence: [
        { g: '🟡', ref: 'Dunlosky et al. 2013（效用 B 级）' },
        { g: '🟡', ref: 'Chi et al. 1989 · Cognitive Science（自我解释）' }
      ],
      features: [{ label: '知识卡', nav: 'browse' }]
    },
    {
      id: 'generation', cat: 'learn', icon: '💬', title: '生成效应 · 费曼',
      summary: '自己生成的答案记得更牢；能讲清楚才算真理解。',
      points: [
        '费曼：合上卡片讲一遍，卡壳处即盲区。',
        '自测的「给内容选名称」就是生成 + 辨认。'
      ],
      evidence: [
        { g: '🟢', ref: 'Slamecka & Graf 1978 · Journal of Experimental Psychology: Human Learning and Memory' },
        { g: '🟡', ref: 'Feynman 学习法（社区方法；生成效应为其认知基础）' }
      ],
      features: [{ label: '自测', nav: 'quiz' }]
    },
    {
      id: 'sleep', cat: 'learn', icon: '🌙', title: '睡眠与巩固',
      summary: '学之前睡好（编码效率），学之后睡够（巩固发生在深睡）。',
      points: [
        '深睡重放与纺锤波把海马痕迹移交皮层。',
        '熬夜复习净收益通常为负——优先保睡眠再谈时长。'
      ],
      evidence: [
        { g: '🟢', ref: 'Rasch & Born 2013 · Physiological Reviews' }
      ],
      features: []
    },
    {
      id: 'body', cat: 'learn', icon: '🏃', title: '身体条件：休息·运动·专注卫生',
      summary: '大脑是身体的一部分——睡眠、运动、刺激环境都算学习变量。',
      points: [
        '安静休息 10–20 分钟给海马重放留时间（不刷手机）。',
        '中等强度运动后 1–2 小时是编码窗。',
        '手机静音扣桌也会偷走工作记忆——物理隔离。',
        '咖啡因半衰期约 5 小时，睡前 8–10 小时停用。'
      ],
      evidence: [
        { g: '🟡', ref: '运动与认知：Hillman et al. 2008 · Nature Reviews Neuroscience' },
        { g: '🟢', ref: '任务切换成本：Monsell 2003 · Trends in Cognitive Sciences' },
        { g: '🟡', ref: '一般健康信息，不构成医疗建议' }
      ],
      features: []
    },
    {
      id: 'fsrs', cat: 'learn', icon: '📐', title: 'FSRS-6 调度内核',
      summary: '用难度 D / 稳定度 S / 可提取性 R 建模遗忘，对齐官方四档权重。',
      points: [
        'R(t,S)：此刻能想起的概率；评分更新 D/S，按目标保留率反推间隔。',
        '知识卡：学习步进 1→10 分钟，毕业进长期复习；错题卡添加即视为当日遗忘。',
        '调度是纯函数，与官方 ts-fsrs / fsrs-rs v6.x（21 权重）对拍。'
      ],
      evidence: [
        { g: '🟢', ref: 'ts-fsrs / fsrs-rs 官方实现 v6.x（开源调度器，21 权重；本应用对拍，不自创）' },
        { g: '🟢', ref: '遗忘曲线传统：Ebbinghaus 1885 起；FSRS 规格见 open-spaced-repetition / ts-fsrs 文档' }
      ],
      features: [{ label: '知识卡', nav: 'learn' }, { label: '统计', nav: 'statistics' }]
    },
    {
      id: 'mastery', cat: 'learn', icon: '📊', title: '掌握度与毕业目标',
      summary: '掌握度 = 稳定度 S 到毕业目标的对数压缩（⚠️ 自设计指标）。',
      points: [
        '分级：未学→初学→生疏→巩固中→已掌握→熟练→稳固→毕业。',
        '另显示当前可提取性 R（此刻想起的概率）。',
        '毕业目标可随倒计时收紧：目标日仍能 ≥90% 记得。'
      ],
      evidence: [
        { g: '⚠️', ref: '自设计：存储强度/稳定度概念 + 对数压缩（非官方 FSRS 字段）' },
        { g: '🟢', ref: '存储强度概念：Bjork 新失用理论（1992 起）' }
      ],
      features: [{ label: '统计', nav: 'statistics' }],
      liveMastery: true
    },
    {
      id: 'desirable', cat: 'learn', icon: '⚠️', title: '合意困难',
      summary: '困难若专门挑战提取与重建，就有效；否则只是干扰。',
      points: [
        '有效：检索、间隔、交错、变换例题。',
        '无效干扰：噪音、指令含混、无关复杂性。',
        '判断标准：是否逼你重建记忆。'
      ],
      evidence: [
        { g: '🟢', ref: 'Bjork 1994 · Metacognition（Metacognition: Knowing about Knowing）' },
        { g: '🟢', ref: 'Dunlosky et al. 2013' }
      ],
      features: []
    },

    // ---- 认知与行为 ----
    {
      id: 'rpe', cat: 'cog', icon: '⚡', title: '多巴胺：奖励预测误差',
      summary: '多巴胺编码「实际奖励 − 预期」，不是快乐分子。',
      points: [
        '超预期爆发、符合预期沉默、落空被抑制。',
        '教学信号会前移到预测线索——习惯渴望的神经基础。',
        '行动：小里程碑 + 即时反馈，把预期挪到过程中。'
      ],
      evidence: [
        { g: '🟢', ref: 'Schultz, Dayan & Montague 1997 · Science' }
      ],
      features: [{ label: '统计', nav: 'statistics' }]
    },
    {
      id: 'wanting', cat: 'cog', icon: '🎯', title: '想要 vs 喜欢',
      summary: '多巴胺驱动「想要」（wanting），不等于「喜欢」（liking）。',
      points: [
        '清空多巴胺仍有喜欢表情，却不再主动觅食。',
        '刷手机的冲动多半是想要，未必是喜欢。',
        '冲动时先问一句：喜欢，还是只是想要？'
      ],
      evidence: [
        { g: '🟢', ref: 'Berridge & Robinson · wanting-liking 系列（Trends in Cognitive Sciences 等）' }
      ],
      features: []
    },
    {
      id: 'habit-loop', cat: 'cog', icon: '🔁', title: '习惯回路',
      summary: '提示 → 惯常行为 → 奖赏；基底核把序列压成「块」。',
      points: [
        '习惯形成后提示一出现整段自动跑，几乎不过前额叶。',
        '旧回路永不消失，只是被抑制——压力/情境会复活。',
        '替换而非消灭：保提示与奖赏，换中间行为。'
      ],
      evidence: [
        { g: '🟢', ref: 'Graybiel 2008 · Annual Review of Neuroscience' },
        { g: '🟢', ref: 'Wood & Neal 2007 · Psychological Review（习惯-目标接口）' }
      ],
      features: [{ label: '环境审计', nav: 'actPlan' }, { label: '习惯树', nav: 'actHabit' }]
    },
    {
      id: 'habit-66', cat: 'cog', icon: '📆', title: '习惯形成：66 天',
      summary: '自动化中位数约 66 天（范围 18–254）；关键是情境一致的重复。',
      points: [
        '「21 天」是讹传，见证伪清单。',
        '漏一天用容忍天数，不搞连击惩罚。',
        '给自己两个月以上练习窗口，接受波动。'
      ],
      evidence: [
        { g: '🟢', ref: 'Lally et al. 2010 · European Journal of Social Psychology' }
      ],
      features: [{ label: '习惯树', nav: 'actHabit' }]
    },
    {
      id: 'sdt', cat: 'cog', icon: '🌱', title: 'SDT 三需要',
      summary: '动机质量重于数量：自主、胜任、关联。',
      points: [
        '自主：把「我必须」重述为「我选择，因为……」。',
        '胜任：看得到的进步（趋势、掌握度）。',
        '关联：搭子、把学的讲给别人听。'
      ],
      evidence: [
        { g: '🟢', ref: 'Deci & Ryan · 自我决定理论（含 PISA 等大样本验证）' }
      ],
      features: [{ label: '统计', nav: 'statistics' }]
    },
    {
      id: 'overjust', cat: 'cog', icon: '🚫', title: '过度辩护',
      summary: '对本来有兴趣的事给有形奖励，内在兴趣反而下降。',
      points: [
        '归因从「我喜欢」变成「我为了奖励」。',
        '口头肯定可增强；完成即给的物质奖励多削弱。',
        '本应用不做积分/兑换/连击惩罚的依据。'
      ],
      evidence: [
        { g: '🟢', ref: 'Deci, Koestner & Ryan 1999 · Psychological Bulletin（元分析）' }
      ],
      features: [{ label: '计划', nav: 'actPlan' }]
    },
    {
      id: 'emotion', cat: 'cog', icon: '🌊', title: '情绪双通路与重评',
      summary: '低路快而糙、高路慢而细；认知重评优于表达抑制。',
      points: [
        '硬讲道理往往压不住恐惧——先冷却再沟通。',
        '重评：把「他在否定我」重读为「帮我找盲点」。',
        '压抑升高生理唤醒、损害记忆与人际。'
      ],
      evidence: [
        { g: '🟢', ref: 'LeDoux · 杏仁核双通路（Current Biology 等系列）' },
        { g: '🟢', ref: 'Gross & John 2003 · Journal of Personality and Social Psychology' }
      ],
      features: []
    },
    {
      id: 'attention', cat: 'cog', icon: '👁️', title: '注意三网络',
      summary: '警觉、定向、执行控制——不是一块肌肉。',
      points: [
        '警觉：维持准备；定向：被什么吸走；执行：顶住干扰、刹住冲动。',
        '先分辨瓶颈再选练习，比盲目「练专注」有效。'
      ],
      evidence: [
        { g: '🟢', ref: 'Posner & Petersen 1990 · Annual Review of Neuroscience' }
      ],
      features: [{ label: '专注链', nav: 'actPlan' }]
    },
    {
      id: 'mindfulness', cat: 'cog', icon: '🧘', title: '正念：小而真实',
      summary: '训练「注意—漂移—带回」；效应小到中等但真实，不是大脑升级。',
      points: [
        '主要改善执行注意、工作记忆与持续注意。',
        '最稳收益在高压防衰退，不在平常状态锦上添花。',
        '每天哪怕 10 分钟，预期调成「小但真」。'
      ],
      evidence: [
        { g: '🟡', ref: 'Zainal & Newman 2021 · 元分析（111 项 RCT，n≈9538）' },
        { g: '🟡', ref: 'Jha et al. 2007 · Emotion（高压力下工作记忆）' }
      ],
      features: []
    },

    // ---- 行动方法 ----
    {
      id: 'if-then', cat: 'act', icon: '🔗', title: '执行意图（如果-那么）',
      summary: '「如果 [外部情境]，那么我将 [具体动作]」——把决策委托给线索。',
      points: [
        '「如果」必须是时间/地点/前序行为，禁纯内心状态。',
        '「那么」必须是无需再决策的动作。',
        '写下来，不要只在脑中构思。'
      ],
      evidence: [
        { g: '🟢', ref: 'Gollwitzer & Sheeran 2006 · 元分析（94 项研究，d=0.65）' }
      ],
      features: [{ label: '计划', nav: 'actPlan' }]
    },
    {
      id: 'woop', cat: 'act', icon: '🌈', title: 'WOOP',
      summary: '愿 → 果 → 障 → 计；多数人跳过障碍步，那一步才起效。',
      points: [
        '障碍必须是内心障碍「因为我……」，不是外部困难。',
        'P 生成一条如果-那么，写入计划列表。',
        '比单纯积极幻想更可迁移。'
      ],
      evidence: [
        { g: '🟢', ref: 'Oettingen · WOOP / 心理对照（含 RCT 与手册）' }
      ],
      features: [{ label: '计划', nav: 'actPlan' }]
    },
    {
      id: 'env', cat: 'act', icon: '🧹', title: '环境审计',
      summary: '移除提示 ≫ 在提示面前硬抗。',
      points: [
        '数字：删 App、关通知、手机离卧室。',
        '物理：零食不进家、运动服放床边。',
        '路线：绕开触发点。'
      ],
      evidence: [
        { g: '🟢', ref: 'Wood & Neal 2007 · Psychological Review' },
        { g: '🟢', ref: 'Graybiel 2008' }
      ],
      features: [{ label: '环境审计', nav: 'actPlan' }]
    },
    {
      id: 'rsip', cat: 'act', icon: '🌳', title: '习惯树 · RSIP（递归稳态迭代）',
      summary: '非打卡习惯：入树门槛 + 失败级联 + 内化保留 + 组容错。',
      points: [
        '入树：当日成功后可加入，每日最多 1 个新节点。',
        '失败：级联熄灭子孙，回习惯库，内化进度不丢。',
        '组容错：同组点亮数 ≥ minK 可不因本次失败移除（可编辑）。',
        '强化可 +n；失败可降级不连坐。',
        '过程反馈（勾选/次数/点阵）可以，连击惩罚不行。'
      ],
      evidence: [
        { g: '⚠️', ref: '社区技术文《递归稳态迭代》（RSIP）原文思想——非同行评议，方法论参考' },
        { g: '🟢', ref: 'Lally et al. 2010 · European Journal of Social Psychology（66 天）' },
        { g: '🟢', ref: 'Graybiel 2008（回路/替换）' }
      ],
      features: [{ label: '习惯树', nav: 'actHabit' }, { label: '帮助', nav: 'actHelp' }]
    },
    {
      id: 'ctdp', cat: 'act', icon: '⛓️', title: '专注链 · CTDP（链式时延协议）',
      summary: '工作量证明式专注：神圣座位 + #N 记录 + 下必为例判例。',
      points: [
        '神圣座位：触发说明 +「就座」启动，成功记 #N。',
        '下必为例：可疑行为 → 清链重来 | 永久允许此例外。',
        '预约链：信号后 15 分钟内启动；侦查任务 5 分钟低门槛。',
        '精锐/普通链 + 继位：精锐崩溃由最强普通链继承。'
      ],
      evidence: [
        { g: '⚠️', ref: '社区技术文《链式时延协议》（CTDP）原文思想——非同行评议，方法论参考' }
      ],
      features: [{ label: '专注链', nav: 'actPlan' }, { label: '计划', nav: 'actPlan' }]
    },
    {
      id: 'process-fb', cat: 'act', icon: '✅', title: '过程反馈（非奖励）',
      summary: '勾选、次数、进度可以；物质/娱乐兑换、连击惩罚不行。',
      points: [
        '允许：完成勾选、累计次数、近 7 日点阵、轻量肯定。',
        '禁止：「做完才能玩」交易、变率奖励、羞辱文案。',
        '依据：过度辩护 + 变率强化劫持动机。'
      ],
      evidence: [
        { g: '🟢', ref: 'Deci, Koestner & Ryan 1999 · Psychological Bulletin' },
        { g: '⚠️', ref: '产品红线（V2_PLAN）：不做物质兑换/连击惩罚' }
      ],
      features: [{ label: '习惯树', nav: 'actHabit' }]
    },

    // ---- 证伪与误区 ----
    {
      id: 'myth-styles', cat: 'myth', icon: '🚫', title: '学习风格（视觉型/听觉型）',
      summary: '没有证据支持「按偏好匹配教学更有效」。',
      points: [
        '要成立需证明匹配优于不匹配——几乎没有合格实验。',
        '按材料本身的最佳表征学；多模态对所有人更有效。'
      ],
      evidence: [
        { g: '🟢', ref: 'Pashler et al. 2008 · Psychological Science in the Public Interest（证伪）' }
      ],
      features: []
    },
    {
      id: 'myth-21', cat: 'myth', icon: '🚫', title: '21 天养成习惯',
      summary: '来自 1960 年代整形医生观察笔记，不是实证研究。',
      points: [
        '实测中位数 66 天，范围 18–254。',
        '用容忍天数吸收波动，比卡「21 天」更科学。'
      ],
      evidence: [
        { g: '⚠️', ref: '流行神话（Maxwell Maltz 1960 观察笔记，非研究）' },
        { g: '🟢', ref: 'Lally et al. 2010（实测替代）' }
      ],
      features: [{ label: '习惯树', nav: 'actHabit' }]
    },
    {
      id: 'myth-ego', cat: 'myth', icon: '🚫', title: '自我损耗 / 意志力电池',
      summary: '「意志力会被耗干」在预注册多实验室复制中效应几乎为零。',
      points: [
        '23 实验室 2141 人，d=0.04，置信区间跨零。',
        '疲劳更可能是动机/注意转移，不是资源耗尽。'
      ],
      evidence: [
        { g: '⚠️', ref: 'Hagger et al. 2016 · Perspectives on Psychological Science（RRR）' },
        { g: '🟡', ref: '把疲劳当动机信号的替代解释（仍在积累）' }
      ],
      features: []
    },
    {
      id: 'myth-10k', cat: 'myth', icon: '🚫', title: '一万小时定律',
      summary: '刻意练习重要，但远不能解释「成专家」的全部。',
      points: [
        '元分析仅解释约 12% 表现变异。',
        '质量（专注 + 反馈 + 渐进挑战）重于堆时间。'
      ],
      evidence: [
        { g: '🟡', ref: 'Macnamara, Hambrick & Oswald 2014 · Psychological Science' },
        { g: '⚠️', ref: '流行简化「一万小时」远大于实证效应' }
      ],
      features: []
    },
    {
      id: 'myth-fluency', cat: 'myth', icon: '🚫', title: '重读 / 划线 = 学会',
      summary: '流畅性错觉：感觉顺滑恰恰是低效信号。',
      points: [
        '把重读时间换成检索练习。',
        '被动输入几乎不释放可塑性信号。'
      ],
      evidence: [
        { g: '🟢', ref: 'Dunlosky et al. 2013（重读/划线效用低）' },
        { g: '🟡', ref: 'Bjork「流畅性」与元认知错觉系列' }
      ],
      features: [{ label: '自测', nav: 'quiz' }]
    },
    {
      id: 'myth-hand', cat: 'myth', icon: '✏️', title: '手写一定优于打字',
      summary: '证据混合；手写的真正价值在强迫概括与加工。',
      points: [
        '逐字打字与浅层手写都不如「生成式笔记」。',
        '选让你必须加工的工具，而不是仪式感。'
      ],
      evidence: [
        { g: '🟡', ref: 'Mueller & Oppenheimer 2014 · Psychological Science（与后续混合复制并存）' }
      ],
      features: []
    },

    // ---- 方法论附录 ----
    {
      id: 'grading', cat: 'appx', icon: '📏', title: '证据分级约定',
      summary: '🟢 高 / 🟡 中 / ⚠️ 争议·社区方法——照录来源，不编造文献。',
      points: [
        '🟢 高：独立权威来源、大规模复制或元分析。',
        '🟡 中：效应真实，但条件性强或样本有限。',
        '⚠️ 争议/社区：复现失败、流行神话、或非同行评议方法论。',
        'CTDP / RSIP 属 ⚠️ 社区技术文，与同行评议条目分离。'
      ],
      evidence: [
        { g: '⚠️', ref: '分级本身为本库编排约定（对齐来源报告口径）' }
      ],
      features: []
    },
    {
      id: 'dunlosky', cat: 'appx', icon: '🗂️', title: '学习技术效率速查',
      summary: 'Dunlosky 2013 十技术评估的压缩版：A 级优先做。',
      points: [
        'A：检索练习、间隔重复。',
        'B：交错、自我解释/精细提问、示例学习。',
        'D：重读、划线、被动摘要——时间换微量收益。',
        '应用映射：闪卡闭环=检索+间隔；辨析聚类=交错；错题本=真题检索。'
      ],
      evidence: [
        { g: '🟢', ref: 'Dunlosky et al. 2013 · Psychological Science in the Public Interest' }
      ],
      features: [{ label: '自测', nav: 'quiz' }, { label: '错题本', nav: 'wrongBrowse' }]
    },
    {
      id: 'trouble', cat: 'appx', icon: '🛠️', title: '学不进去排查',
      summary: '先查睡眠/刺激/动机需要，再谈意志力。',
      points: [
        '不想启动 → 补觉优先；两分钟启动。',
        '三分钟热度 → 补自主/胜任/关联；看微进步。',
        '学完就忘 → 是不是只重读？间隔为零？',
        '越学越麻木 → 刺激依赖？给辅助刺激做减法。',
        'burnout 前兆 → 减载 + 睡眠 + 无目标日。'
      ],
      evidence: [
        { g: '🟡', ref: '综合 SDT / 睡眠 / 刺激阈值条目（见本库对应出处）' }
      ],
      features: [{ label: '统计', nav: 'statistics' }, { label: '计划', nav: 'actPlan' }]
    },
    {
      id: 'product-map', cat: 'appx', icon: '🗺️', title: '功能 ↔ 科学依据',
      summary: '界面少科普；细节只在本知识库。',
      points: [
        '知识卡闭环 ↔ 检索 + 间隔 + FSRS。',
        '辨析聚类/裸回忆 ↔ 交错 + 生成。',
        '习惯树 ↔ 习惯回路 + 66 天 + 组容错（RSIP）。',
        '专注链 ↔ 工作量证明 + 判例（CTDP）。',
        '如果-那么 / WOOP / 环境审计 ↔ 执行意图 / 心理对照 / 提示控制。',
        '不做兑换奖励 ↔ 过度辩护 + 变率强化红线。'
      ],
      evidence: [
        { g: '🟢', ref: '映射关系；各条出处见对应条目' }
      ],
      features: [{ label: '习惯树', nav: 'actHabit' }, { label: '专注链', nav: 'actPlan' }, { label: '计划', nav: 'actPlan' }]
    }
  ];

  let kbQuery = '';
  let kbSel = null;

  function kbEntryText(e) {
    return [e.title, e.summary, (e.points || []).join(' '),
      (e.evidence || []).map(function (x) { return x.g + ' ' + x.ref; }).join(' '),
      (e.features || []).map(function (x) { return x.label; }).join(' ')
    ].join(' ');
  }

  function kbMatches(e, q) {
    if (!q) return true;
    return kbEntryText(e).toLowerCase().indexOf(q) !== -1;
  }

  function renderPrinciples() {
    const app = document.getElementById('app');
    const wrap = el('div', 'principles-wrap kb-wrap');

    wrap.appendChild(el('h2', null, '🧠 知识库 · 原理与依据'));
    wrap.appendChild(el('p', 'muted', '可检索条目库：每条写明研究者/年份/期刊或来源，并标 🟢 高 / 🟡 中 / ⚠️ 争议·社区方法。界面不堆长科普，细节只在这里。'));

    const search = el('input', 'search kb-search');
    search.type = 'search';
    search.placeholder = '搜索条目（如：睡眠 / 多巴胺 / WOOP / RSIP / 证伪）…';
    search.value = kbQuery;
    wrap.appendChild(search);

    const layout = el('div', 'kb-layout');
    const side = el('div', 'kb-side');
    const detail = el('div', 'kb-detail');
    layout.appendChild(side);
    layout.appendChild(detail);
    wrap.appendChild(layout);

    const empty = el('p', 'muted', '没有匹配的条目——换个关键词试试。');
    empty.classList.add('hidden');

    function visibleEntries() {
      const q = kbQuery.trim().toLowerCase();
      return KB_ENTRIES.filter(function (e) { return kbMatches(e, q); });
    }

    function renderSide() {
      side.innerHTML = '';
      const vis = visibleEntries();
      if (!vis.length) {
        side.appendChild(el('p', 'muted', '无匹配'));
        return;
      }
      KB_CATS.forEach(function (cat) {
        const list = vis.filter(function (e) { return e.cat === cat.id; });
        if (!list.length) return;
        const head = el('div', 'kb-cat-label', cat.icon + ' ' + cat.title);
        side.appendChild(head);
        list.forEach(function (e) {
          const item = el('button', 'kb-item' + (e.id === kbSel ? ' active' : ''), e.title);
          item.addEventListener('click', function () {
            kbSel = e.id;
            renderSide();
            renderDetail();
          });
          side.appendChild(item);
        });
      });
    }

    function renderDetail() {
      detail.innerHTML = '';
      const vis = visibleEntries();
      empty.classList.toggle('hidden', vis.length > 0 || !kbQuery.trim());
      if (!vis.length) {
        detail.appendChild(empty);
        return;
      }
      let e = KB_ENTRIES.find(function (x) { return x.id === kbSel && kbMatches(x, kbQuery.trim().toLowerCase()); });
      if (!e) {
        e = vis[0];
        kbSel = e.id;
        renderSide();
      }

      const card = el('div', 'kb-card');
      const head = el('div', 'kb-head');
      head.appendChild(el('span', 'principle-icon', e.icon));
      head.appendChild(el('strong', null, e.title));
      card.appendChild(head);
      card.appendChild(el('p', 'kb-summary', e.summary));

      if (e.points && e.points.length) {
        card.appendChild(el('div', 'mini-label', '要点'));
        const ul = el('ul', 'kb-points');
        e.points.forEach(function (p) {
          ul.appendChild(el('li', null, p));
        });
        card.appendChild(ul);
      }

      card.appendChild(el('div', 'mini-label', '依据'));
      const evBox = el('div', 'kb-evidence');
      (e.evidence || []).forEach(function (x) {
        const row = el('div', 'kb-evi-row');
        row.appendChild(el('span', 'kb-evi-grade g' + (x.g === '🟢' ? 'hi' : x.g === '🟡' ? 'mid' : 'warn'), x.g));
        row.appendChild(el('span', 'kb-evi-ref', x.ref));
        evBox.appendChild(row);
      });
      card.appendChild(evBox);

      if (e.liveMastery) {
        const s = stats();
        const legend = el('div', 'legend');
        const levels = ['未学', '初学', '生疏', '巩固中', '已掌握', '熟练', '稳固', '毕业'];
        const counts = {};
        DATA.forEach(function (f) { const l = mastery(f.id).label; counts[l] = (counts[l] || 0) + 1; });
        levels.forEach(function (lv) {
          const p = el('span', 'legend-item');
          p.textContent = lv + ' ' + (counts[lv] || 0);
          legend.appendChild(p);
        });
        card.appendChild(legend);
        card.appendChild(el('p', 'muted', '当前整体平均掌握度 ' + s.avg + '%（实时统计）。'));
      }

      if (e.features && e.features.length) {
        card.appendChild(el('div', 'mini-label', '关联功能'));
        const chips = el('div', 'chips kb-features');
        e.features.forEach(function (f) {
          const b = el('button', 'chip', f.label);
          if (f.nav) {
            b.setAttribute('data-action', 'nav');
            b.setAttribute('data-arg', f.nav);
          }
          chips.appendChild(b);
        });
        card.appendChild(chips);
      }

      if (e.id === 'rsip' || e.id === 'ctdp') {
        card.appendChild(el('p', 'muted how', '⚠️ 社区技术文条目：引用方法论原文思想，不是同行评议研究；产品实现以 docs/V2_PLAN.md 与 docs/ACT.md 为准。'));
      }

      detail.appendChild(card);
    }

    search.addEventListener('input', function () {
      kbQuery = search.value;
      renderSide();
      renderDetail();
    });

    if (!kbSel || !KB_ENTRIES.some(function (x) { return x.id === kbSel; })) kbSel = KB_ENTRIES[0].id;
    renderSide();
    renderDetail();
    app.appendChild(wrap);
  }
  // ---------------- 思维导图视图 ----------------
  function svgEl(tag, attrs) {
    const e = document.createElementNS('http://www.w3.org/2000/svg', tag);
    for (const k in attrs) e.setAttribute(k, attrs[k]);
    return e;
  }
  function mapEdge(x1, y1, w1, h1, x2, y2, w2, h2, color) {
    const rx1 = w1 / 2, ry1 = h1 / 2, rx2 = w2 / 2, ry2 = h2 / 2;
    const dx = x2 - x1, dy = y2 - y1;
    const d = Math.sqrt(dx * dx + dy * dy) || 1;
    const ux = dx / d, uy = dy / d;
    const t1 = 1 / Math.sqrt(Math.pow(ux / rx1, 2) + Math.pow(uy / ry1, 2));
    const t2 = 1 / Math.sqrt(Math.pow(ux / rx2, 2) + Math.pow(uy / ry2, 2));
    const sx = x1 + ux * t1, sy = y1 + uy * t1;
    const ex = x2 - ux * t2, ey = y2 - uy * t2;
    const midX = sx + (ex - sx) * 0.5;
    return svgEl('path', { d: 'M ' + sx + ' ' + sy + ' C ' + midX + ' ' + sy + ', ' + midX + ' ' + ey + ', ' + ex + ' ' + ey, fill: 'none', stroke: color, 'stroke-width': '1.5', 'stroke-linecap': 'round' });
  }
  function masteryColor(pct) {
    if (pct < 1) return '#EDEBE4';
    if (pct < 25) return '#D3D1C7';
    if (pct < 45) return '#B5D4F4';
    if (pct < 65) return '#76AFE8';
    if (pct < 85) return '#378ADD';
    if (pct < 95) return '#2A75C0';
    return '#D4537E'; // 樱粉=已记牢（与品牌对勾同色）
  }
  function textWidth(text, fontSize) {
    fontSize = +fontSize || 0;
    let w = 0;
    for (let i = 0; i < text.length; i++) {
      w += (text.charCodeAt(i) > 255) ? fontSize : fontSize * 0.62;
    }
    return w;
  }
  function plainText(str) {
    return String(str).replace(/\$\$?/g, '').replace(/\\[a-zA-Z]+/g, '').replace(/[{}^_]/g, '');
  }
  function measureTitle(text, fontSize) {
    const meas = document.createElement('div');
    meas.style.cssText = 'position:absolute;left:-9999px;top:-9999px;visibility:hidden;white-space:nowrap;font-size:' + fontSize + 'px;font-weight:600;line-height:1.25;';
    document.body.appendChild(meas);
    renderTex(meas, text);
    const w = meas.scrollWidth || 0;
    const h = meas.scrollHeight || fontSize;
    document.body.removeChild(meas);
    return { w: w, h: h };
  }
  function mapPillHtml(x, y, text, fill, color, ring, tip, fontSize) {
    fontSize = parseFloat(fontSize) || 13;
    const m = measureTitle(text, fontSize);
    const padX = fontSize * 0.9, padY = fontSize * 0.45;
    const w = Math.max(fontSize * 2.2, m.w + padX * 2);
    const h = Math.max(fontSize * 1.75, m.h + padY * 2);
    const p = document.createElement('div');
    p.style.cssText = 'position:absolute;transform:translate(-50%,-50%);display:flex;align-items:center;justify-content:center;text-align:center;line-height:1.25;box-sizing:border-box;left:' + x + 'px;top:' + y + 'px;width:' + Math.ceil(w) + 'px;height:' + Math.ceil(h) + 'px;background:radial-gradient(circle at 30% 25%, rgba(255,255,255,.92), ' + fill + ' 55%, ' + fill + ');border:' + (ring ? '3px solid #378ADD' : '1.3px solid #E4E1D8') + ';color:' + color + ';font-size:' + fontSize + 'px;font-weight:600;border-radius:' + Math.ceil(h / 2) + 'px;cursor:pointer;';
    if (tip) p.title = plainText(tip);
    renderTex(p, text);
    return { el: p, w: w, h: h };
  }
  function categoryAvg(cat) {
    const list = DATA.filter(function (f) { return f.cat === cat; });
    if (!list.length) return 0;
    let s = 0;
    list.forEach(function (f) { s += mastery(f.id).pct; });
    return Math.round(s / list.length);
  }
  function catOrder() {
    const subj = subjectList()[currentSubjectId];
    return (subj && Array.isArray(subj.ORDER) && subj.ORDER.length) ? subj.ORDER : Object.keys(CATS);
  }

  function renderMap() {
    const app = document.getElementById('app');
    const subj = subjectList()[currentSubjectId];
    const cats = catOrder();
    if (!mapCat || !CATS[mapCat]) mapCat = cats[0];
    const cards = DATA.filter(function (f) { return f.cat === mapCat; });

    const wrap = el('div', 'map-wrap');
    const bar = el('div', 'map-toolbar');
    bar.appendChild(el('strong', null, (subj ? subj.icon + ' ' + subj.name : '') + ' · 思维导图'));
    bar.appendChild(el('span', 'muted', '拖动/滚动查看 · Ctrl+滚轮或按钮缩放 · 点分类展开 · 点知识点看详情'));
    const zoom = el('span', 'map-zoom-ctrl');
    const mkz = function (label, arg) { const b = el('button', 'btn small', label); b.setAttribute('data-action', 'mapzoom'); b.setAttribute('data-arg', arg); zoom.appendChild(b); };
    mkz('−', 'out'); mkz('＋', 'in'); mkz('⟲', 'reset');
    bar.appendChild(zoom);
    wrap.appendChild(bar);

    const rowH = 48;
    const W = 1180;
    const H = Math.max(860, (Math.max(cats.length, cards.length) + 2) * rowH + 40);
    const scroll = el('div', 'map-scroll');
    const zoomWrap = el('div', 'map-zoom');
    zoomWrap.style.width = (W * mapScale) + 'px';
    zoomWrap.style.height = (H * mapScale) + 'px';
    const canvas = el('div', 'map-canvas');
    canvas.style.width = W + 'px';
    canvas.style.height = H + 'px';
    canvas.style.transform = 'scale(' + mapScale + ')';
    canvas.style.transformOrigin = '0 0';
    const svg = svgEl('svg', { viewBox: '0 0 ' + W + ' ' + H, width: '100%', height: '100%' });
    svg.style.cssText = 'position:absolute;left:0;top:0;pointer-events:none;';
    canvas.appendChild(svg);
    zoomWrap.appendChild(canvas);
    scroll.appendChild(zoomWrap);

    const root = mapPillHtml(90, H / 2, subj ? subj.name : '', '#D4537E', '#fff', false, subj ? subj.name : '', '18');
    canvas.appendChild(root.el);

    const catX = 330;
    const catStartY = (H - (cats.length - 1) * rowH) / 2;
    const catMeta = {};
    cats.forEach(function (k, i) {
      const y = catStartY + i * rowH;
      const avg = categoryAvg(k);
      const fill = masteryColor(avg);
      const txt = avg >= 85 ? '#fff' : '#1c2333';
      const p = mapPillHtml(catX, y, CATS[k], fill, txt, (k === mapCat), CATS[k] + ' · 平均掌握 ' + avg + '%', '15');
      catMeta[k] = { x: catX, y: y, w: p.w, h: p.h };
      svg.appendChild(mapEdge(90, H / 2, root.w, root.h, catX, y, p.w, p.h, '#DCD9D0'));
      p.el.addEventListener('click', function () { mapCat = k; mapSel = null; renderApp(); });
      canvas.appendChild(p.el);
    });

    const cardX = 660;
    const base = catMeta[mapCat];
    const cardStartY = (H - (cards.length - 1) * rowH) / 2;
    cards.forEach(function (f, i) {
      const y = cardStartY + i * rowH;
      const sel = (f.id === mapSel);
      const mp = mastery(f.id).pct;
      const fill = sel ? '#D4537E' : masteryColor(mp);
      const txt = (sel || mp >= 85) ? '#fff' : '#1c2333';
      const p = mapPillHtml(cardX, y, f.title, fill, txt, sel, f.title + ' · 掌握 ' + mp + '%', '13');
      svg.appendChild(mapEdge(base.x, base.y, base.w, base.h, cardX, y, p.w, p.h, '#DCD9D0'));
      p.el.addEventListener('click', function () { mapSel = f.id; renderApp(); });
      canvas.appendChild(p.el);
    });

    wrap.appendChild(scroll);

    app.appendChild(wrap);

    if (mapSel) {
      const f = DATA.find(function (x) { return x.id === mapSel; });
      if (f) app.appendChild(mapModal(f));
    }
  }

  function buildMapPanel(f) {
    const panel = el('div');
    const h = el('div', 'map-panel-head');
    h.appendChild(el('span', 'badge', CATS[f.cat]));
    h.appendChild(texEl('strong', null, f.title));
    h.appendChild(el('span', 'star-badge small', starText(metaOf(f.id)[0])));
    panel.appendChild(h);
    const cont = el('div', 'map-card-content');
    cont.appendChild(el('div', 'mini-label', '💡 提示'));
    const fq = el('div', 'map-front'); renderTex(fq, f.front); cont.appendChild(fq);
    cont.appendChild(el('div', 'mini-label', '答案'));
    const fa = el('div', 'map-back'); renderTex(fa, f.back); cont.appendChild(fa);
    panel.appendChild(cont);
    panel.appendChild(el('p', 'muted', (subjKind() === 'qa' ? '📌 考查方式：' : '📌 常考题型：') + metaOf(f.id)[1]));
    const mn = mnemOf(f.id);
    if (mn) {
      const mb = el('div', 'mnem-box');
      mb.appendChild(el('span', 'mnem-label', '🗝️ 助记：'));
      mb.appendChild(texEl('span', null, mn));
      panel.appendChild(mb);
    }
    const pf = pitfallOf(f.id);
    if (pf) {
      const pfb = el('div', 'pitfall-box');
      pfb.appendChild(el('span', 'pitfall-label', '⚠️ 常见陷阱：'));
      pfb.appendChild(texEl('span', null, pf));
      panel.appendChild(pfb);
    }
    const rels = relOf(f.id);
    if (rels.length) {
      const rw = el('div', 'rel-list');
      rw.appendChild(el('div', 'mini-label', '相关知识点（点击跳转）'));
      rels.forEach(function (r) {
        const tf = DATA.find(function (x) { return x.id === r.to; });
        if (!tf) return;
        const chip = texEl('button', 'chip rel-chip', (r.tag ? '[' + r.tag + '] ' : '') + tf.title);
        chip.setAttribute('data-action', 'jump');
        chip.setAttribute('data-arg', tf.id);
        rw.appendChild(chip);
      });
      panel.appendChild(rw);
    } else {
      panel.appendChild(el('p', 'muted', '暂无关联标签。'));
    }
    const exs = examplesOf(f.id);
    exs.forEach(function (ex, i) {
      const eb = el('div', 'example-box');
      const label = exs.length > 1 ? ('📝 ' + (ex.src ? '真题' : '例题') + ' ' + (i + 1)) : (ex.src ? '📝 真题' : '📝 经典例题');
      eb.appendChild(el('div', 'example-label', label));
      const q = el('div', 'example-q'); renderTex(q, ex.q); eb.appendChild(q);
      eb.appendChild(el('div', 'mini-label', '解析'));
      const a = el('div', 'example-a'); renderTex(a, ex.a); eb.appendChild(a);
      if (ex.a2) {
        eb.appendChild(el('div', 'mini-label', '💡 巧解'));
        const a2 = el('div', 'example-a'); renderTex(a2, ex.a2); eb.appendChild(a2);
      }
      if (ex.src) eb.appendChild(el('div', 'example-src', '📚 来源：' + ex.src));
      panel.appendChild(eb);
    });
    return panel;
  }

  function mapModal(f) {
    const modal = el('div', 'map-modal');
    const backdrop = el('div', 'map-modal-backdrop');
    backdrop.setAttribute('data-action', 'mapclose');
    modal.appendChild(backdrop);
    const card = el('div', 'map-modal-card');
    const close = el('button', 'map-modal-close', '×');
    close.setAttribute('data-action', 'mapclose');
    close.setAttribute('title', '关闭');
    card.appendChild(close);
    card.appendChild(buildMapPanel(f));
    modal.appendChild(card);
    return modal;
  }

  // ---------------- 动作分发 ----------------
