/* 本文件由 tools/build.mjs 自动生成，请勿手改；修改 src/ 后运行 node tools/build.mjs 重新生成。 */
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

/*
 * 考研数学三 · 公式记忆应用 — 核心逻辑
 * 记忆原理：主动回忆（先看提示→自行回想→再核对答案）
 *         + 间隔重复（FSRS-6 算法）+ 交错练习（卡片乱序）
 */
(function () {
  'use strict';
  const VERSION = '1.18.0';

  // ---------------- 更新日志（设置页「📜 更新日志」展示） ----------------
  const CHANGELOG = [
    { v: '1.18.0', date: '2026-09', items: ['新增多端同步（GitHub 私仓）：设置页配置 Token 与仓库后，四科学习数据以整库快照存入你自己的仓库（athena-sync/ 目录），启动自动拉取、评分落盘约 30 秒后自动上传，手机 / 电脑保持一致', '同步策略：时间戳新者胜（2 秒容差），任何覆盖前自动把被覆盖版本归档到 archive/ 目录——等价版本历史、不丢数据；同步失败不影响本地使用；支持强制上传 / 强制下载', '数据以明文 JSON 存放（请确保仓库为私有）；自动同步开关可随时关闭'] },
    { v: '1.17.0', date: '2026-09', items: ['统计页新增「学习报告」：日报/周报/月报/年报聚合——专注时长、新学、复习、错题重做、学习天数、掌握度变化；新增每日完成量分类计数（学习时长自 v1.16.0、分类计数自本版起记录）', '原理页重构为「原理 · 学习科学」：吸顶目录跳转 + 关键词搜索 + 八个结构化章节（核心方法 / 交错与辨别 / FSRS 内核 / 掌握度与毕业 / 学习科学清单 / 身体与学习 / 动机与坚持 / 学不进去排查表），条目标注证据等级', '新增节律提示：连续学习约 50 分钟温和提醒起身休息；深夜（23 点后）打开应用提醒一次「睡眠是记忆巩固的一部分」——均为轻提示，不阻断学习'] },
    { v: '1.16.1', date: '2026-09', items: ['修复：移动端学科选择器无法切换学科——下拉菜单由顶栏内部改挂到页面根节点（fixed 定位 + JS 计算坐标），彻底摆脱 sticky/backdrop-filter 祖先对定位与命中测试的影响（该选择器的移动端问题第三次出现，此次根治）；点外部收起增加 touchstart 兜底，窄屏靠右时菜单自动收回屏内'] },
    { v: '1.16.0', date: '2026-09', items: ['错题算法重置（以 FSRS 为基础的探索性调整）：添加错题即视为「当天已遗忘」并直接进入复习队列（次日重现）；重做评分全部走标准 FSRS——一直做对间隔大幅延长、卡片永不消失；移除学习/重学步进与「难题」分类（旧设计残留），「已稳固」仅为掌握度标识', 'UI 改版：总体掌握度并入左上角学科选择器；移除顶栏倒计时徽标，倒计时弹窗改为每次打开应用弹出；☰ 菜单仅保留原理与设置；移动端底栏仅保留知识卡/错题本两个模块键，二级导航恢复为顶栏下方横滑条；学习页卡片右上角新增「✏️ 编辑」；沉浸模式隐藏录入/编辑按钮；统计条移除与顶栏重复的「平均掌握」', '「每日时间预算」功能移除，新增学习计时器：自动累计应用前台使用时长（按天），统计条显示「⏱ 今日已学 X 分钟」', '工程：npm run build 现在自动同步 Tauri 桌面版 dist/，版本发布不再可能打包旧代码；CI 增加实际构建验证'] },
    { v: '1.15.1', date: '2026-09', items: ['错题算法对齐设计（知识卡仍为标准 FSRS-6，不受影响）：评「算错」现为次日重现一步后再毕业（学习步进改两步，修复此前因配置提前毕业）；难题卡评「会做对」的复习间隔统一走 ×1.4 规则（此前仅困难/良好生效）', '体积：空状态/倒计时插画由 PNG 转 WebP（4.6MB → 240KB，缩小 95%），离线缓存与桌面安装包同步瘦身'] },
    { v: '1.15.0', date: '2026-09', items: ['安全：学习进度写盘失败（存储空间满/隐私模式）不再静默——立即提示并引导导出备份；「导入全部科目」写失败的学科不再误报为导入成功', '性能：评分后落盘延迟 100ms 合并写入，把 JSON 序列化挪出评分点击的绘制路径；浏览页搜索输入 150ms 防抖', '错题重做页新增键盘快捷键（1-4 评分 / Space 显示解析）与快捷键提示行，与知识卡学习页一致', '重构：知识卡与错题卡的 FSRS 步进调度状态机合并为 src/sched.mjs 共享实现（调度行为不变，新增 12 个状态迁移测试）；切换学科/导入/清空进度的会话重置统一为 resetSessionState，修复导入换科后错题队列与导图状态残留；切学科异步加载增加竞态防护', '数据：学习数据库新增 schemaVersion 字段，为后续大版本数据迁移留钩子', '工程：新增 package.json 与 GitHub Actions CI（build 同步校验 + 测试 + 数据/版本闸门）；check_version 纳入 tauri.conf.json、dist/ 与 package.json 的版本校验（修复桌面版打包旧代码）；新增 CHANGELOG.md（由 tools/changelog.mjs 从应用内更新日志生成）；清理 style.css 死代码'] },
    { v: '1.14.2', date: '2026-09', items: ['评分档「忘记」改为「再来一次」，弱化犯错带来的挫败感'] },
    { v: '1.14.1', date: '2026-09', items: ['修复：移动端沉浸模式底部 Dock 未收起、学科选择器被顶栏 overflow 裁剪而无法使用'] },
    { v: '1.14.0', date: '2026-09', items: ['移动端新增底部 Dock（模块 tab + 常用入口，大屏仍用顶栏）', '切卡/评分加入轻量滑入淡入动效'] },
    { v: '1.13.5', date: '2026-09', items: ['修复：学科下拉菜单被顶栏 overflow 裁剪、桌面端 ☰ 菜单入口被隐藏'] },
    { v: '1.13.4', date: '2026-09', items: ['修复学科图标渲染失败（SVG 内容误存为 .png → 改为 .svg）', '学科切换改为自定义图片下拉组件；顶栏背景水印改用学科图标', '沉浸模式收起二级菜单；桌面端显示 ☰ 菜单入口', '空状态与倒计时弹窗接入插画'] },
    { v: '1.13.3', date: '2026-09', items: ['学科图标改用 assets/subject_icon/ 下的自定义图片（品牌栏），并纳入离线缓存'] },
    { v: '1.13.2', date: '2026-09', items: ['更换正式 Logo 图标（深色底 + 右侧粉色卡片滑入的中间态）'] },
    { v: '1.13.1', date: '2026-09', items: ['修复：新添加的错题默认为「已做过一次」——初始即进入学习态、次日重现，并初始化 FSRS 难度/稳定性（等价首次「不会」评分）'] },
    { v: '1.13.0', date: '2026-09', items: ['UI 重置：知识卡与错题本改为两个一级界面（各含二级导航），移动端适配', '删除导图视图', '错题新增「浏览」与「统计」视图，支持手动删除、标记查重跳转', '「清空学习进度」同步重置错题记忆状态；标记例题只保留一个按钮', '自建卡支持添加关联知识点（REL，带标签）'] },
    { v: '1.12.0', date: '2026-09', items: ['内置卡片可编辑：题目/提示/答案/分类/重要度/常考题型可覆盖编辑，例题可增删改，支持软删除（隐藏）与一键恢复原卡'] },
    { v: '1.11.0', date: '2026-09', items: ['学习界面新增「手动录入知识点」：可自建卡片（标题/分类/提示/答案），自建卡与内置卡一起参与学习、交错与统计'] },
    { v: '1.10.0', date: '2026-09', items: ['错题本新增「手动录入」：可粘贴题目 + 解析并搜索关联知识点', '新增「标记为难题」：难题间隔更疏（×1.4），与错题区分', '错题重做计入每日时间预算（每题约 4 分钟）'] },
    { v: '1.9.0', date: '2026-09', items: ['新增「错题本」模块：把做错的真题/例题标记进错题本，按记忆算法重现，需动手重做后按「不会/思路错/算错/会做对」评分', '错题评分四档与 FSRS 四档一一对应，学习步进改为按天；毕业=稳定度达目标（与知识卡一致，无退出，间隔随算法延长）', '错题失败（不会/思路错）会联动降级关联的知识点卡片，提前重现补漏'] },
    { v: '1.8.4', date: '2026-09', items: ['补全四个学科的「同类」标签（新增 458 条边）：同类辨别卡真正成组出现（数三 93% / 微观 73% / 统计 82% / 政治 93% 的卡进入同类型簇）', '大簇切成小段（每段 ≤6 张），避免同类卡整章连排成「分块」'] },
    { v: '1.8.3', date: '2026-09', items: ['交错簇改为「辨析聚类」：只把 REL 中「同类/对比/类比」的相关卡聚成簇，无关联的卡不再被硬凑进同一簇'] },
    { v: '1.8.2', date: '2026-09', items: ['交错练习改为「分块交错」：同一章节的卡成组（每块 3 张）出现、章节之间轮流，让同类辨别卡真正在一起', '修复：学习中的卡被推回队尾造成「同卡两份」，学完新卡后 pos 跳回、只剩「回到当前卡片」——改为不再推回队尾，到期卡由 surfaceDue 按需重现'] },
    { v: '1.8.1', date: '2026-09', items: ['修复：新学卡交错失效——「同类」标签实为同一章节的变体，聚类后反而变成「分块」；现仅「对比/类比」参与辨析聚类，新学卡恢复按章节交错（相关跨章卡仍较近出现）'] },
    { v: '1.8.0', date: '2026-09', items: ['交错练习升级：新增「辨析聚类」算法——REL 中「对比/类比/同类」的相关卡片会较近出现，复习卡、续学卡、新学卡均生效', '新增「裸回忆」常驻设置：开启后学习时先隐藏分类徽标，逼你先判断类别再回忆，点开答案后才显示'] },
    { v: '1.7.0', date: '2026-09', items: ['新增「全部科目互通」：一键导出/导入四个学科的学习进度与统计（打包为单个 JSON），便于多平台 / 多设备迁移', '修复：PC 端四个评分挡位改为竖向全宽排布'] },
    { v: '1.6.1', date: '2026-09', items: ['移除早已弃用的「知识深度 DEPTH」残留（4 个学科数据块 + src 载入 + 校验脚本）', '工程清理：删除遗留死代码（EF_MIN、卡片 ef 字段、旧 SM-2 掌握分 s 与 initialStrength），并化简两处重复的 relearning 状态判断'] },
    { v: '1.6.0', date: '2026-09', items: ['倒计时完全用户化：删除默认 12 月 20 日兜底，未设目标日期时徽标隐藏、每日弹窗关闭、毕业目标回退固定稳定度', '学习页新增评分撤销（单步）、桌面端键盘提示、评分按钮 aria-label 与 focus-visible/reduced-motion 无障碍'] },
    { v: '1.5.6', date: '2026-09', items: ['修复：拆分模块时遗漏共享常量（DAY/dayStart/EF_MIN/每日预算/目标稳定度）导致启动 ReferenceError、页面空白——新增 src/config.mjs 最先拼接统一声明'] },
    { v: '1.5.5', date: '2026-09', items: ['性能：合并持久化写盘（同一轮多次评分只序列化并写一次，IndexedDB 低频备份，pagehide/visibilitychange 兜底 flush），修复统计页半衰期分布重复计算的 O(n²)'] },
    { v: '1.5.4', date: '2026-09', items: ['工程：app.js 拆分为 src/ 模块并由 tools/build.mjs 零依赖拼接构建，FSRS 纯函数抽离为 fsrs-core.mjs 并新增对拍测试；修正默认目标日期为 12 月 20 日、记忆原理文案统一为 FSRS-6'] },
    { v: '1.5.3', date: '2026-09', items: ['修复：复习队列最后一张卡仍显示「回到当前卡片」、无法进入新学习队列——学习/重学卡评「忘记」后被推回队尾等待重现，同时留在已学区供确认展示，同一张卡在队列中出现两份；到期时 surfaceDue 未去重，重复卡使 pos/frontier 错位。现已在归入待学区时按卡去重（队尾副本优先），到期卡唯一进入待学区，队列恢复正确', '修复：「待复习」标签误把今天刚学、仍处学习阶段的卡计入——stats() 曾把 learning/relearning 且到点的卡也算进待复习；现改为 learning/relearning 一律计入「学习中」（未学完新卡），只有 review 状态且到点的卡才计入「待复习」，与建队列时的分类一致'] },
    { v: '1.5.2', date: '2026-09', items: ['修复：复习队列结束后无法进入新学习队列——新卡引入不再被剩余时间预算封顶（此前复习完复习卡后预算耗尽、新卡不引入，导致学完复习卡直接「本轮已完成」进不了新卡），改为一次性引入全部未学新卡；时间预算仍为软上限（超出仅提示、不限制学习）', '设置页新增「强制清除缓存并更新」：注销 Service Worker + 清空全部 CacheStorage 后自动刷新，便于移动端测试最新版本（不丢学习进度）', 'README 移除「北大光华」等具体目标内容，改为通用记忆学习项目描述'] },
    { v: '1.5.1', date: '2026-09', items: ['修复：评分挡位（忘记/困难/良好/简单）在显示答案前错误可见——CSS 特异性导致 `.rating.hidden` 实际显示，违背「先回忆→显示答案→再评分」的标准流程；改为 `.hidden{display:none!important}`，现在未复习卡初始只显示题目与「显示答案」按钮，点开答案后才出现评分挡位'] },
    { v: '1.5.0', date: '2026-08', items: ['数三公式库逐卡审读与修正：修正 19 处公式不严谨（反函数/参数方程求导补条件、$a^x$·$\\arcsin$ 补 $a>0$ 条件、辅助角象限、隐函数求导 $F_y\\neq0$、方向导数需可微、面积公式改 $|f-g|$、Sylvester 不等式补 $n$ 定义、伴随 $|A^*|$ 补 $n\\ge2$、莱布尼茨补 $u_n\\ge0$、收敛半径补极限存在、阿贝尔定理前后对齐、拐点补连续、反函数补严格单调、幂零分解限定单特征值、正定/周期/单调口径修正等）', '数三补 12 张高频缺失卡：特征值继承性质、秩的等式不等式、相似矩阵性质、伴随矩阵运算、拉普拉斯分块行列式、常用数值级数和、$\\tan x-\\sin x$ 等价无穷小、极坐标面积、柱壳法体积、分部积分成品（$\\int\\ln x$、$\\int e^{ax}\\sin bx$）、方程组同解/公共解、一阶全微分形式不变性'] },
    { v: '1.4.6', date: '2026-08', items: ['修复：到期复习卡未进入学习队首——重写 surfaceDue，把「到期但不在队列」的卡（含昨天学完、今天到期的复习卡）吸收进队首，并把已学区中到期的卡重新归入待学区，修复「显示待复习好几张却学不到」的问题', '卡片与记忆模块的趋势图从「可提取性 R」改为「掌握度」：历史点统一记录每次评分后的掌握度，图表画掌握度折线 + 100% 目标参考线'] },
    { v: '1.4.5', date: '2026-08', items: ['修复：额度用完后重新打开模块误显示「最后一张卡片」——已学完会话（pos=frontier=deck.length）不再被恢复，而是重建队列，正确进入「额度用完/次日复习」界面', '修复：间隔 1 天的复习卡本应次日出现却拖到第三天——复习到期改为按自然日对齐（due = 当天 00:00 + ivl 天），不再用 now+24h 精确时刻（否则今晚 20:00 复习、明早打开还没到期）', '评分按钮的「下次约 X」对毕业后间隔按整天展示，与自然日到期一致'] },
    { v: '1.4.4', date: '2026-08', items: ['渲染器重构为字符级扫描器：`\\textbf{…}`/`\\underline{…}` 等文本命令改用括号配对读取（支持嵌套花括号如 `\\chi^{2}` 的 `{2}`）、`**…**`/`$…$`/`$$…$$` 作为整体 token 递归渲染——修复「命令内嵌数学」被 `$` 拆分截断导致 `\\textbf` 字面残留的一类 bug；`renderProse` 同时支持 markdown `**…**`→`<b>`', '毕业目标与掌握度量纲从「半衰期 h」改为「稳定度 S（天）」：毕业目标 `targetS()=剩余天数`（语义「停止复习后仍 ≥90% 记得」，毕业时机不变）；掌握度 `ln(1+S)/ln(1+S_N)` 不再虚高；学习阶段掌握度改用 FSRS 短时稳定度（随评分真实变化，非固定挡位）', '删除正文里泄漏的内部卡片编号（如 `（gm16）`/`（we11）`，共 11 处，全在微观）；修复 zb19/mk10/jj01/jj11 等 4 处数据渲染 bug（inline 矩阵 `\\`、漏 `$` 包裹、JSON 字面 `\\n`）', '工程校验工具化（tools/ 三道闸，零 npm 依赖）：`check_data.mjs`（数据完整性+内容不变量）、`check_render.mjs`（headless Chrome 跑真实渲染、断言 0 katex-error/0 残留命令）、`check_version.mjs`（版本标记一致性）；数据备份归档至 backup/'] },
    { v: '1.4.3', date: '2026-08', items: ['长答案按分点分段可视化：`renderTex` 检测 `①②③…`/全角`（1）（2）…` 分点，自动拆成带左侧竖线的段落块 `.ans-point`（跳过数学下标/命令内标记如 `X_{(1)}`、`\\textbf{①…` 以免破坏结构）；长答案更清晰分层' , '将目前确立的内容与文本规范固化为「开发标准」（见 PROGRESS）：算法来源（核心=FSRS 官方，自创需标注⚠️并请示）、内容范围（光华431=微观+统计·无宏观金融；数三=高数+线代）、例题仅真实真题且可跨知识点复用、标题公式用原始模板、正文加粗/下划线用应用字体、长答案分点分段、时间预算软上限、改数据文件禁用 PowerShell GBK 读写'] },
    { v: '1.4.2', date: '2026-08', items: ['正文文本模式命令改为**HTML 渲染**（彻底用应用字体，不再经 KaTeX 字体）：`\\textbf{…}`→`<b>`、`\\underline{…}`→`<u>`、`\\textit{…}`→`<i>`、`\\textrm`/`\\textsf`/`\\mathrm`/`\\text`→（默认字体）仅渲染内部文本；命令内部若含 `$..$` 数学则递归交给 KaTeX。→ 加粗/下划线不再出现字体不一致，也无 `\\textbf`/`\\n` 字面残留'] },
    { v: '1.4.1', date: '2026-08', items: ['修复正文渲染：此前用 \\text{} 包裹整段正文，导致（a）正文内出现 \\textbf 加粗/\\underline 下划线时字体不一致（KaTeX 字体 vs 应用字体）、（b）跨行正文（真实换行）被 KaTeX 报错、显示字面 \\\\n 等。改为「普通正文（含换行）保留为文本节点（应用字体），仅把 \\textbf{}/\\underline{}/\\textit{} 等文本模式命令片段单独交给 KaTeX」——字体统一、无 \\n/\\textbf 字面残留'] },
    { v: '1.3.9', date: '2026-08', items: ['记忆算法从 FSRS-4.5 升级为 FSRS-6（最新，2024-2025）：改用官方 21 参数默认权重（ts-fsrs/fsrs-rs v6.x DEFAULT_PARAMETERS）、遗忘曲线 R=(1+factor·t/S)^{-w20}（decay=0.1542）、引入短时记忆稳定度（学习期 Again 会降低稳定度、Good/Easy 不降）——修复此前「学习期多次遗忘→终于简单→仍给 15.69 天(16天间隔)」的不合理行为；现「遗忘后简单」毕业间隔显著缩短', 'FSRS-6 初始稳定度调整：再次=0.212 天 / 困难=1.29 天 / 良好=2.31 天 / 简单=8.30 天（原 FSRS-4.5 为 0.40/1.18/3.17/15.69）；难度更新改用线性阻尼+均值回归到 D0(Easy)；遗忘稳定度含 w17·w18 封顶；毕业/半衰期/目标 h_N 概念同步改为 FSRS-6 曲线（h≈90·S）'] },
    { v: '1.3.8', date: '2026-08', items: ['修复：卡片中 `$` 之外的文本模式 LaTeX 命令（如 \\textbf\\underline 加粗/下划线）此前不渲染、原样显示 —— 改为对含此类命令的正文段用 \\text{} 包裹后交给 KaTeX 渲染，正文中文不受影响', '修复移动端长等式溢出：行内公式过长会撑破页面导致整页缩放，改为 `.kx-inline` 过长时内部横向滚动 + 公式容器 overflow-x:auto 兜底'] },
    { v: '1.3.7', date: '2026-08', items: ['统计页重构 + 记忆算法可视化：总览 KPI、记忆算法关键指标趋势（平均掌握度/平均可提取R/待复习/已毕业/累计遗忘/学习中新卡）、记忆状态分布、记忆强度（半衰期 h）分布、各分类掌握度', '浏览页学习卡片的「我的笔记」模块上移至「记忆」模块之上（与学习页一致）', '内容拓展：统计深度补强（茆诗松/何书元/陈家鼎 + 古扎拉蒂/伍德里奇计量 + 光华431）、微观进阶补强（平新乔十八讲/范里安 + 光华431）、数学三广度拓展；例题优先真实真题，可跨知识点复用'] },
    { v: '1.3.6', date: '2026-08', items: ['掌握度改为「存储强度到目标的比」（毕业=100%）：h=半衰期、H=目标，s=ln(1+h)/ln(1+H)，达到毕业目标即满分（⚠️自设计，依据论文「存储强度」概念+对数压缩；FSRS 调度内核未动）', '"当前可提取性 R" 与掌握度解耦：趋势图专画 R（实际 vs 预测 R，同量纲）；卡面另显示存储强度 S/半衰期 h', '"考研倒计时"改为"目标倒计时"：目标名称与日期都可在设置中编辑（默认 考研 / 每年 12 月 20 日），考研后可改成四六级/教资等继续使用；每日首启弹窗与文案同步适配'] },
    { v: '1.3.5', date: '2026-08', items: ['毕业目标改为「与考研倒计时挂钩」（默认开启）：要求考试日仍能 ≥90% 记得（等价稳定度 S ≥ 剩余天数，即半衰期 h ≥ 12.79×剩余天数），目标随倒计时自动变化而非固定 90 天；可在设置中关闭并改回固定目标值。⚠️ 借 SSP-MMC「目标半衰期」概念并适配考研目标（非论文原始算法）'] },
    { v: '1.3.4', date: '2026-08', items: ['每日复习目标改称「时间预算」：由卡片数改为每日复习时间（默认 20 分钟，设置可调），到期复习优先、复习实际用时计入预算、剩余时间用于引入新卡——对齐 SSP-MMC 最小化记忆成本的成本约束', '引入「目标半衰期 h_N」毕业判据：卡片记忆强度（半衰期 h=3·S/F，由 FSRS 稳定性 S 换算）达到目标值（默认 90 天，设置可调）即视为「毕业/稳固」，取代原固定 0.9 目标保留率的毕业概念', '卡面双维度显示：掌握度（当前可提取性 R）+ 存储强度（稳定性 S / 半衰期 h / 是否已毕业），记忆框显示「目标 h_N」'] },
    { v: '1.3.3', date: '2026-08', items: ['例题清理：删除所有非真题例题（含「幕布版自测」及无来源自编题目），知识卡片的例题区**仅保留真实考研真题**（数三 125 / 微观 140 / 统计 159 条真题；原自编例题卡片不再显示例题）'] },
    { v: '1.3.2', date: '2026-08', items: ['删除自定的「期望保留率」校准机制，改用 FSRS 论文标准默认保留率(0.9)——核心调度完全对齐 FSRS-4.5 论文定义', '掌握度改为「当前可提取性 R（预测回忆概率）」：R(t,S)=(1+F·t/S)^-0.5，复习阶段显示此刻回忆起来的概率，趋势图对比实际 vs 预测 R（无自创算法，均来自论文/训练权重）'] },
    { v: '1.3.1', date: '2026-08', items: ['记忆算法升级为完整 FSRS-4.5：卡片按「难度 D + 稳定性 S」建模，幂律遗忘曲线 R(t,S)=(1+F·t/S)^-0.5，按期望保留率反推复习间隔', '引入 FSRS 官方 17 参数（默认权重由 fsrs-benchmark 训练得到）+ 难度均值回归 + 稳定性随保留率/难度非线性更新；掌握度改为由 FSRS 稳定性平滑导出', '毕业卡记忆框显示「难度 D / 稳定性 S / 目标保留率」'] },
    { v: '1.3.0', date: '2026-08', items: ['记忆算法升级：恢复四档评分（忘记/困难/良好/简单）+ 学习阶段改时间步进（1分钟→10分钟），更贴合主流 Anki', '掌握度与记忆算法绑定（近期回答质量+当前间隔平滑导出），新增记忆可视化（掌握度趋势：实际+预测双曲线，时间横轴可浏览）', '新增真实数据校准：用每次到期复习的真实回忆质量动态调整目标保留率，预测越用越准；清空进度同步清空统计', '初步引入 FSRS：卡片按「难度 D + 记忆稳定性 S」建模，幂律遗忘曲线 + 期望保留率决定复习间隔', '卡片页笔记模块上移至记忆模块之上，其余统计/UI 适配'] },
    { v: '1.2.7', date: '2026-08', items: ['记忆算法重构：两阶段（学习→复习）+ SM-2；遗忘即回退学习阶段并降低易度，答对才毕业；修复重复学/无限学/别科无卡等旧问题', '新卡改为每科软上限（每批 10 张，学完点「再来 10 张」继续），删除原「每日新卡数量」硬限制；学习界面删「剩余 x 张」，新增「待复习」「未学完新卡」标签', '内容拓展（长期）：识图/提取文本把自编例题改为真实真题（本轮数三 16 道 / 统计 15 张 / 微观 20 张，含 1.2.5 新增卡优先真题化）'] },
    { v: '1.2.5', date: '2026-08', items: ['修复：完成每日目标后「再来一轮」不再重复展示上一组卡片——队列只含到期复习 + 今日额度内新卡，已学未到期卡按 SM-2 排期不重复出现', '新增：点击左上角考研倒计时徽章可直接跳转到学习界面', '修正：上边栏「今天已学习 X 张」按去重卡片统计，不再重复计数', '内容拓展（长期推进）：细化 14 张简陋知识点、新增 9 张知识点/套路卡、补充 23 条陷阱提示（本轮第一批）'] },
    { v: '1.2.4', date: '2026-08', items: ['移动端顶栏瘦身：7 个导航入口收进「☰」抽屉菜单，顶栏保持单行（倒计时徽标与学科掌握度保留）', '修复：完成今日任务后「再来一轮」无反应——每日额度内已引入但未学完的新卡可再次进入队列，且无内容可学时不再显示无效按钮'] },
    { v: '1.2.3', date: '2026-08', items: ['考研倒计时徽章移至界面左上角（替代品牌字标），每日弹窗提示语精简', '数三 / 微观 / 统计：为尚未对应真题的卡片补充真实考研真题例题（本轮新增 155 张卡的真题来源标注：数三 +28、微观 +50、统计 +77）'] },
    { v: '1.2.2', date: '2026-08', items: ['时政分类改为仅收录 2026 年时政大事（两会·十五五纲要 / 建党 105 周年 / 中央经济工作会议 / 中央一号文件 / 中德联合声明 / 夏季达沃斯等）', '设置页新增「📜 更新日志」，可查看每个版本的修改内容'] },
    { v: '1.2.1', date: '2026-08', items: ['应用更名 Athena，美术全面换用新品牌视觉规范（新图标 / 新色板 / 深色主题）', '考研倒计时：上边栏常驻徽章 + 每日首次打开弹窗，考试日期可在设置中修改', '每日新卡数量上限（默认 10，设置可调），新卡不再一次性全部塞入学习队列', '新增「🗝️ 助记」行：政治 46 条 / 数三 9 条 / 统计 5 条背诵口诀', '新增时政分类（v1.2.2 起改为仅 2026 年时政大事）'] },
    { v: '1.2.0', date: '2026-08', items: ['新增政治学科：马原（哲学/政经/科社）、毛中特、史纲、思修·法治共 180 张背诵卡 + 8 张分析题答题套路卡', 'UI 按背诵类学科适配（搜索/自测/考查方式文案），政治专属红色主题'] },
    { v: '1.1.3', date: '2026-08', items: ['三科各新增 3 张解题套路卡（共 9 张）', '热力图可点开查看每日复习明细，导出/导入保留统计日志'] },
    { v: '1.1.0', date: '2026-07', items: ['思维导图支持缩放（按钮 / Ctrl+滚轮）', '新增「统计」视图：学习日历热力图 / 平均掌握度趋势 / 各分类掌握度进度条', '模板卡各配 1 道真题'] },
    { v: '1.0.0', date: '2026-06', items: ['初始版本：数三公式记忆，含学习（SM-2 间隔重复 + 交错练习）/ 浏览 / 导图 / 自测 / 统计 / 记忆原理 / 设置', 'PWA 离线可用，支持导出 / 导入进度备份'] }
  ];

  // ---------------- 学科管理（多学科数据注册表） ----------------
  const SUBJECT_KEY = 'formula_app_subject';
  let currentSubjectId = null;
  let CATS = null, DATA = null, META = null;
  let EXAMPLES = {}, REL = {}, PITFALL = {}, MNEM = {};
  let BASE_SUBJ = null; // 当前学科静态数据基准（DATA/META/EXAMPLE 在其上应用用户覆盖）

  const KATEX_SOURCES = [
    { js: 'katex/katex.min.js', css: 'katex/katex.min.css' },
    { js: 'https://cdn.bootcdn.net/ajax/libs/KaTeX/0.16.11/katex.min.js', css: 'https://cdn.bootcdn.net/ajax/libs/KaTeX/0.16.11/katex.min.css' },
    { js: 'https://cdn.jsdelivr.net/npm/katex@0.16.11/dist/katex.min.js', css: 'https://cdn.jsdelivr.net/npm/katex@0.16.11/dist/katex.min.css' },
    { js: 'https://unpkg.com/katex@0.16.11/dist/katex.min.js', css: 'https://unpkg.com/katex@0.16.11/dist/katex.min.css' },
    { js: 'https://cdn.staticfile.net/KaTeX/0.16.11/katex.min.js', css: 'https://cdn.staticfile.net/KaTeX/0.16.11/katex.min.css' }
  ];

  function injectKatexCss(url) {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = url;
    document.head.appendChild(link);
  }

  function bootKatex(i) {
    if (i >= KATEX_SOURCES.length) { return; }
    const src = KATEX_SOURCES[i];
    const s = document.createElement('script');
    s.src = src.js;
    s.async = true;
    let done = false;
    const ok = function () {
      if (done) return;
      done = true;
      if (typeof window.katex === 'undefined' || !window.katex.render) { bootKatex(i + 1); return; }
      injectKatexCss(src.css);
      upgradeAllMath();
    };
    const fail = function () { if (!done) { done = true; bootKatex(i + 1); } };
    s.onload = ok;
    s.onerror = fail;
    document.head.appendChild(s);
    setTimeout(fail, 12000);
  }

  // 将长答案按「分点」分段（①②③…、全角（1）（2）…），拆成可视化段落；
  // 跳过数学下标/命令内的标记（如 X_{(1)}、\textbf{①…）以免破坏结构
  function splitPoints(str) {
    const segs = [];
    const marker = /([①-⑩]|（\d+）)/g;
    let last = 0, m;
    while ((m = marker.exec(str)) !== null) {
      const idx = m.index;
      const prev = idx > 0 ? str[idx - 1] : '';
      if (prev === '{' || prev === '\\' || prev === '（' || prev === '(' || prev === '_' || prev === '^' || prev === '*' || prev === '`') continue;
      segs.push(str.slice(last, idx));
      last = idx;
    }
    segs.push(str.slice(last));
    return segs.map(function (s) { return s.trim(); }).filter(Boolean);
  }

  // ---------------- 数学渲染（KaTeX 可用则渲染，否则降级为纯文本） ----------------

  // 期望保留率：FSRS 论文标准默认值（0.9，即「到期复习时回忆概率」），不再做自定校准
  const FDR = 0.9;
  const FW = [0.212, 1.2931, 2.3065, 8.2956, 6.4133, 0.8334, 3.0194, 0.001, 1.8722, 0.1666, 0.796, 1.4835, 0.0614, 0.2629, 1.6483, 0.6014, 1.8729, 0.5425, 0.0912, 0.0658, 0.1542];
  const FSRS_DECAY = -FW[20];               // 遗忘曲线指数 decay = -w20 = -0.1542
  const FSRS_FACTOR = Math.exp(Math.log(0.9) / FSRS_DECAY) - 1; // factor = e^{ln0.9/decay} - 1 ≈ 0.98
  const FSRS_S_MIN = 0.001;
  const FSRS_S_MAX = 36500.0;
  const FSRS_HALFLIFE_K = (Math.pow(0.5, 1 / FSRS_DECAY) - 1) / FSRS_FACTOR; // 半衰期 h = K·S（FSRS-6 曲线，K≈90）
  function fsrsClamp(x, lo, hi) { return Math.min(hi, Math.max(lo, x)); }
  // 可提取性（遗忘曲线）R(t,S) = (1 + factor·t/S)^{decay}
  function fsrsRetention(daysSince, S) {
    S = Math.max(FSRS_S_MIN, S);
    return Math.pow(1 + FSRS_FACTOR * Math.max(0, daysSince) / S, FSRS_DECAY);
  }
  // 期望保留率(DR) → 下次复习间隔（天）：I(r,s) = (r^{1/decay} − 1)/factor × s，DR=0.9 时 I=S
  function fsrsInterval(S) {
    const mod = (Math.pow(FDR, 1 / FSRS_DECAY) - 1) / FSRS_FACTOR;
    return Math.max(1, Math.round(Math.max(FSRS_S_MIN, S) * mod));
  }
  // 初始稳定性 S0(G) = max(w[G-1], 0.1)，G=1..4
  function fsrsInitStability(G) { return Math.max(FW[G - 1], 0.1); }
  // 初始难度 D0(G) = w4 − e^{(G−1)·w5} + 1，钳 1..10
  function fsrsInitDifficulty(G) {
    return fsrsClamp(FW[4] - Math.exp((G - 1) * FW[5]) + 1, 1, 10);
  }
  function fsrsInitDifficulty4() { return fsrsInitDifficulty(4); } // 均值回归锚点 D0(Easy)
  // 线性阻尼：难度越接近 10，每次变化越小
  function fsrsLinearDamping(delta_d, oldD) { return (delta_d * (10 - oldD)) / 9; }
  // 难度更新：delta = -w6·(G-3) → 线性阻尼 → 均值回归到 D0(Easy)
  function fsrsDifficulty(D, G) {
    D = (typeof D === 'number' && D >= 1 && D <= 10) ? D : 7;
    const delta_d = -FW[6] * (G - 3);
    const next_d = D + fsrsLinearDamping(delta_d, D);
    const reverted = FW[7] * fsrsInitDifficulty4() + (1 - FW[7]) * next_d;
    return fsrsClamp(reverted, 1, 10);
  }
  // 成功回忆的稳定性更新（Hard 有 w15 惩罚、Easy 有 w16 加成）
  function fsrsSuccessStability(D, S, R, G) {
    const hardPenalty = (G === 2) ? FW[15] : 1;
    const easyBound = (G === 4) ? FW[16] : 1;
    const growth = Math.exp(FW[8]) * (11 - D) * Math.pow(Math.max(FSRS_S_MIN, S), -FW[9]) * (Math.exp(FW[10] * (1 - R)) - 1) * hardPenalty * easyBound;
    return fsrsClamp(Math.max(FSRS_S_MIN, S) * (1 + growth), FSRS_S_MIN, FSRS_S_MAX);
  }
  // 遗忘的稳定性更新：sForget 与「短时记忆封顶 s/e^{w17·w18}」取小（稳定性不高于遗忘前）
  function fsrsLapseStability(D, S, R) {
    const sForget = fsrsClamp(FW[11] * Math.pow(Math.max(1, D), -FW[12]) * (Math.pow(Math.max(FSRS_S_MIN, S) + 1, FW[13]) - 1) * Math.exp(FW[14] * (1 - R)), FSRS_S_MIN, FSRS_S_MAX);
    const newSMin = Math.max(FSRS_S_MIN, S) / Math.exp(FW[17] * FW[18]);
    return fsrsClamp(newSMin, FSRS_S_MIN, sForget);
  }
  // 短时记忆稳定度（同日学习步进，t≈0）：Again 可降、Hard/Good/Easy 不低于原值
  function fsrsShortTermStability(S, G) {
    const sinc = Math.pow(Math.max(FSRS_S_MIN, S), -FW[19]) * Math.exp(FW[17] * (G - 3 + FW[18]));
    const maskedSinc = (G >= 2) ? Math.max(sinc, 1) : sinc;
    return fsrsClamp(Math.max(FSRS_S_MIN, S) * maskedSinc, FSRS_S_MIN, FSRS_S_MAX);
  }

  // 半衰期 h：可提取性 R 降到 50% 的时间间隔。由 FSRS-6 曲线 R(t,S)=(1+factor·t/S)^{decay} 解 R=0.5 → h=K·S
  // h 反映「记忆强度」（仅作展示参考，不作毕业/掌握度分母——因 K≈90 放大导致目标数值失真）
  function fsrsHalflife(S) { return Math.max(FSRS_S_MIN, S) * FSRS_HALFLIFE_K; }


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


  // ---------------- 交错练习 · 辨析聚类 ----------------
  // 原理：把「相关需辨析」的卡（REL 中 tag=同类/对比/类比）聚成簇、簇内相邻出现，
  //       簇与无关联的单卡再按章节轮转——只让「真有关系」的卡在一起，无关联的卡不硬凑。
  // 纯函数（依赖注入 rel / catOf），便于 tools 对拍测试，不碰任何运行时全局。

  const DISCRIM_TAGS = { '同类': 1, '对比': 1, '类比': 1 };
  const MAX_CLUSTER = 6; // 簇过大时切成小段，避免同类卡整章连排成「分块」

  // 并查集：把「辨析相关」的卡片聚成同一簇；簇内保持输入顺序
  function buildClusters(ids, rel) {
    const idSet = {};
    ids.forEach(function (id) { idSet[id] = 1; });
    const parent = {};
    const find = function (x) { while (parent[x] !== x) { parent[x] = parent[parent[x]]; x = parent[x]; } return x; };
    ids.forEach(function (id) { parent[id] = id; });
    ids.forEach(function (id) {
      const edges = (rel && rel[id]) || [];
      for (let i = 0; i < edges.length; i++) {
        const e = edges[i];
        const to = e && e.to;
        if (to && idSet[to] && DISCRIM_TAGS[e.tag]) {
          const ra = find(id), rb = find(to);
          if (ra !== rb) parent[ra] = rb;
        }
      }
    });
    const groups = {};
    ids.forEach(function (id) {
      const r = find(id);
      (groups[r] = groups[r] || []).push(id);
    });
    return Object.keys(groups).map(function (k) { return groups[k]; });
  }

  function shuffleArr(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }

  // 辨析交错：相关卡聚成簇、簇内相邻出现；大簇切成小段；簇/单卡按章节轮转（同章不连续）
  function interleaveRelated(ids, rel, catOf) {
    const clusters = buildClusters(ids, rel);
    // 大簇切成小段（每段 ≤ MAX_CLUSTER），相关卡仍较近、又不至于整章连排
    const segments = [];
    clusters.forEach(function (cluster) {
      for (let i = 0; i < cluster.length; i += MAX_CLUSTER) {
        segments.push(cluster.slice(i, i + MAX_CLUSTER));
      }
    });
    const byCat = {};
    segments.forEach(function (seg) {
      const c = catOf(seg[0]) || '?';
      (byCat[c] = byCat[c] || []).push(seg);
    });
    const groups = Object.keys(byCat).map(function (k) { return shuffleArr(byCat[k]); });
    const out = [];
    let added = true;
    while (added) {
      added = false;
      for (let i = 0; i < groups.length; i++) {
        if (groups[i].length) {
          const seg = groups[i].shift();
          for (let j = 0; j < seg.length; j++) out.push(seg[j]);
          added = true;
        }
      }
    }
    return out;
  }


  function subjectList() { return window.SUBJECTS || {}; }
  // 学科图标（assets/subject_icon/，无对应图则回退 emoji）
  const SUBJECT_ICON_URLS = {
    math3: 'assets/subject_icon/icon-math.svg',
    econ: 'assets/subject_icon/icon-economics.svg',
    stats: 'assets/subject_icon/icon-statistics.svg',
    politics: 'assets/subject_icon/icon-politics.svg'
  };
  function subjectIconUrl(id) { return SUBJECT_ICON_URLS[id] || null; }
  // 学科内容类型：formula（公式学科）/ qa（背诵类学科，如政治），驱动界面文案适配
  function subjKind() {
    const s = subjectList()[currentSubjectId];
    return (s && s.kind) || 'formula';
  }
  function setSubject(id) {
    const list = subjectList();
    const subj = list[id] || list[Object.keys(list)[0]] || null;
    if (!subj) return false;
    currentSubjectId = subj.id;
    CATS = subj.CATS;
    DATA = subj.DATA;
    BASE_SUBJ = subj;
    META = subj.META;
    EXAMPLES = subj.EXAMPLE || {};
    REL = subj.REL || {};
    PITFALL = subj.PITFALL || {};
    MNEM = subj.MNEM || {};
    try { localStorage.setItem(SUBJECT_KEY, subj.id); } catch (e) { warnStorageFailure(); }
    document.title = subj.name;
    renderSubjectDropdown();
    document.body.setAttribute('data-subject', subj.id);
    const url = subjectIconUrl(subj.id);
    document.body.style.setProperty('--subject-watermark', url ? 'url("' + url + '")' : 'none');
    return true;
  }
  function dbKey() { return currentSubjectId + '_formula_srs_v1'; }
  function sessionKey() { return currentSubjectId + '_formula_session_v2'; }

  // 把总体掌握度写进左上角学科选择器内的百分比徽标（每轮渲染随统计刷新）
  function updateBrand() {
    const pct = document.getElementById('subjectPct');
    if (!pct || !currentSubjectId || !DB || !DATA) return;
    pct.textContent = stats().avg + '%';
  }

  function updateNavBadge() {
    if (!DB || !DATA) return;
    const due = stats().due;
    document.querySelectorAll('.nav-btn[data-arg="learn"]').forEach(function (btn) {
      let badge = btn.querySelector('.nav-badge');
      if (due > 0) {
        if (!badge) { badge = el('span', 'nav-badge'); badge.textContent = String(due); btn.appendChild(badge); }
        else badge.textContent = String(due);
      } else if (badge) { badge.remove(); }
    });
  }

  // ---------------- KaTeX 加载（多 CDN 自动回退） ----------------
  const THEME_KEY = 'ms3_formula_theme';
  let DB = null;

  function defaultCard() { return { reps: 0, ivl: 0, due: 0, lapses: 0, state: 'new', grad: 0, step: 0, diff: 5, stab: 0, fsrsInit: 0, notes: '', hist: [], lastR: 0, ivlR: 0 }; }

  // 错题卡（独立于知识卡，复用 FSRS 调度状态 + 题目字段）
  function defaultWrongCard() { return { reps: 0, ivl: 0, due: 0, lapses: 0, state: 'new', grad: 0, step: 0, diff: 5, stab: 0, fsrsInit: 0, kind: '错题', q: '', a: '', a2: '', src: '', linked: [], errType: '', lastSolveMs: 0, hist: [], lastR: 0, ivlR: 0 }; }
  function sanitizeWrongCard(w) {
    const out = defaultWrongCard();
    if (w && typeof w === 'object') {
      ['reps', 'ivl', 'due', 'lapses', 'grad', 'step', 'diff', 'stab', 'lastSolveMs', 'lastR', 'ivlR'].forEach(function (k) { if (typeof w[k] === 'number') out[k] = w[k]; });
      if (w.fsrsInit) out.fsrsInit = 1;
      out.kind = '错题'; // 难题分类已废除（v1.16.0），存量「难题」统一迁移
      if (typeof w.q === 'string') out.q = w.q;
      if (typeof w.a === 'string') out.a = w.a;
      if (typeof w.a2 === 'string') out.a2 = w.a2;
      if (typeof w.src === 'string') out.src = w.src;
      if (Array.isArray(w.linked)) out.linked = w.linked.filter(function (x) { return typeof x === 'string'; });
      if (typeof w.errType === 'string') out.errType = w.errType;
      if (Array.isArray(w.hist)) out.hist = w.hist.map(function (h) { return { t: h.t, m: h.m }; });
      if (w.state === 'new' || w.state === 'learning' || w.state === 'relearning' || w.state === 'review') out.state = w.state;
    }
    return out;
  }

  // IndexedDB（作为更持久的数据备份；localStorage 仍为主存储）
  function idbOpen() {
    return new Promise(function (resolve, reject) {
      if (typeof indexedDB === 'undefined') { reject(new Error('no idb')); return; }
      const req = indexedDB.open('ms3_formula_db', 1);
      req.onupgradeneeded = function (e) { const db = e.target.result; if (!db.objectStoreNames.contains('kv')) db.createObjectStore('kv'); };
      req.onsuccess = function () { resolve(req.result); };
      req.onerror = function () { reject(req.error); };
    });
  }
  function idbGet(key) {
    return idbOpen().then(function (db) {
      return new Promise(function (resolve, reject) {
        const tx = db.transaction('kv', 'readonly');
        const r = tx.objectStore('kv').get(key);
        r.onsuccess = function () { resolve(r.result); db.close(); };
        r.onerror = function () { reject(r.error); db.close(); };
      });
    });
  }
  function idbSet(key, value) {
    return idbOpen().then(function (db) {
      return new Promise(function (resolve, reject) {
        const tx = db.transaction('kv', 'readwrite');
        tx.objectStore('kv').put(value, key);
        tx.oncomplete = function () { resolve(); db.close(); };
        tx.onerror = function () { reject(tx.error); db.close(); };
      });
    }).catch(function () {});
  }

  function normalizeDB(raw) {
    DB = (raw && typeof raw === 'object') ? raw : { cards: {}, settings: {}, log: {} };
    // 整体 schema 版本号：为将来大迁移留钩子（旧数据无此字段，一律补为当前版本 1）
    if (DB.schemaVersion == null) DB.schemaVersion = 1;
    if (!DB.cards) DB.cards = {};
    if (!DB.settings) DB.settings = {};
    if (DB.settings.dailyNew == null) DB.settings.dailyNew = 10;
    // 旧版本用 targetH（半衰期天）作为固定毕业目标；迁移到 targetS（稳定度天）。
    //   旧 90 天半衰期 ≈ 90/K ≈ 1 天稳定度，语义已变：直接采用新默认值（不再沿用旧数值，避免误把「半衰期天」当「稳定度天」）。
    if (DB.settings.targetS == null) DB.settings.targetS = TARGET_S_DEFAULT;
    if (DB.settings.targetH != null) delete DB.settings.targetH;
    if (DB.settings.targetLinkExam == null) DB.settings.targetLinkExam = true;
    if (DB.settings.goalTitle == null) DB.settings.goalTitle = GOAL_DEFAULT;
    if (DB.settings.bareRecall == null) DB.settings.bareRecall = false;
    if (!DB.log) DB.log = {};
    if (!DB.log.counts) DB.log.counts = {}; // 每日完成量分类计数（n 新学 / r 复习 / w 错题重做）
    if (!DB.wrongs) DB.wrongs = {};
    if (!DB.custom) DB.custom = {};
    if (!DB.cardOverrides) DB.cardOverrides = {};
    if (!DB.customRel) DB.customRel = {};
    // 错题卡调度迁移（v1.16.0 重置为纯复习态）：学习/重学态 → 复习态；难题分类废除
    Object.keys(DB.wrongs).forEach(function (wid) {
      const w = DB.wrongs[wid];
      if (!w || typeof w !== 'object') return;
      if (w.kind === '难题') w.kind = '错题';
      if (w.state === 'learning' || w.state === 'relearning') w.state = 'review';
    });
    refreshData();
    DATA.forEach(function (f) {
      if (!DB.cards[f.id]) DB.cards[f.id] = defaultCard();
      const c = DB.cards[f.id];
      if (typeof c.notes !== 'string') c.notes = '';
    });
    saveDB();
  }
  function loadDBAsync() {
    return new Promise(function (resolve) {
      let local = null;
      try { local = JSON.parse(localStorage.getItem(dbKey())); } catch (e) {}
      if (local && typeof local === 'object') { normalizeDB(local); resolve(); return; }
      idbGet(dbKey()).then(function (v) {
        normalizeDB((v && typeof v === 'object') ? v : null);
        resolve();
      }).catch(function () { normalizeDB(null); resolve(); });
    });
  }
  // 把静态卡片 + 用户覆盖 + 用户自建卡片合成当前 DATA / META / EXAMPLE
  function refreshData() {
    const subj = BASE_SUBJ;
    if (!subj) return;
    const ov = (DB && DB.cardOverrides) || {};

    // DATA：静态卡应用覆盖（含隐藏）→ 追加自建卡
    DATA = subj.DATA
      .filter(function (f) { return !(ov[f.id] && ov[f.id].hidden); })
      .map(function (f) {
        const o = ov[f.id] || {};
        return {
          id: f.id,
          cat: (o.cat != null) ? o.cat : f.cat,
          title: (o.title != null) ? o.title : f.title,
          front: (o.front != null) ? o.front : f.front,
          back: (o.back != null) ? o.back : f.back
        };
      });
    if (DB && DB.custom) {
      Object.keys(DB.custom).forEach(function (id) {
        const c = DB.custom[id];
        if (c && c.id && typeof c.title === 'string' && typeof c.front === 'string' && typeof c.back === 'string') {
          DATA.push({ id: c.id, cat: c.cat || '?', title: c.title, front: c.front, back: c.back });
        }
      });
    }

    // META：star / examType 覆盖
    META = {};
    Object.keys(subj.META || {}).forEach(function (id) {
      const base = subj.META[id] || [3, '综合计算与应用'];
      const o = ov[id] || {};
      META[id] = [
        (o.star != null) ? o.star : base[0],
        (o.examType != null) ? o.examType : base[1]
      ];
    });

    // EXAMPLE：例题整段覆盖
    EXAMPLES = {};
    Object.keys(subj.EXAMPLE || {}).forEach(function (id) {
      EXAMPLES[id] = (ov[id] && Array.isArray(ov[id].examples)) ? ov[id].examples : subj.EXAMPLE[id];
    });

    // REL：静态 REL + 自建卡 REL
    REL = Object.assign({}, subj.REL || {});
    if (DB && DB.customRel) {
      Object.keys(DB.customRel).forEach(function (id) {
        if (DB.customRel[id] && DB.customRel[id].length) REL[id] = DB.customRel[id];
      });
    }
  }

  function sanitizeCustomCard(c) {
    if (!c || typeof c !== 'object' || typeof c.id !== 'string' || !c.id) return null;
    return {
      id: c.id,
      cat: (typeof c.cat === 'string') ? c.cat : '?',
      title: (typeof c.title === 'string') ? c.title : '',
      front: (typeof c.front === 'string') ? c.front : '',
      back: (typeof c.back === 'string') ? c.back : ''
    };
  }

  // 手动录入知识点（自建卡）：写入 DB.custom + DB.cards，立即合成进 DATA
  function saveCustomCard(title, front, back, cat, relList) {
    const t = (title || '').trim(), f = (front || '').trim(), b = (back || '').trim();
    if (!t || !f || !b) { toast('标题、提示、答案不能为空'); return false; }
    const id = 'cu_' + Date.now() + '_' + Math.floor(Math.random() * 10000);
    DB.custom[id] = { id: id, cat: cat || Object.keys(CATS)[0], title: t, front: f, back: b };
    DB.cards[id] = defaultCard();
    if (relList && relList.length) DB.customRel[id] = relList;
    refreshData();
    saveDB();
    renderApp();
    toast('已录入知识点');
    return true;
  }

  function sanitizeCardOverride(o) {
    if (!o || typeof o !== 'object') return null;
    const out = {};
    if (typeof o.title === 'string') out.title = o.title;
    if (typeof o.front === 'string') out.front = o.front;
    if (typeof o.back === 'string') out.back = o.back;
    if (typeof o.cat === 'string') out.cat = o.cat;
    if (typeof o.star === 'number') out.star = o.star;
    if (typeof o.examType === 'string') out.examType = o.examType;
    if (Array.isArray(o.examples)) out.examples = o.examples.filter(function (e) { return e && typeof e.q === 'string'; });
    if (o.hidden === true) out.hidden = true;
    return (Object.keys(out).length ? out : null);
  }

  // 保存对某张内置卡的覆盖（编辑题目/答案/标签/例题/隐藏）
  function saveCardOverride(id, o) {
    const ov = {};
    if (o.title != null) ov.title = String(o.title).trim();
    if (o.front != null) ov.front = String(o.front).trim();
    if (o.back != null) ov.back = String(o.back).trim();
    if (o.cat != null) ov.cat = o.cat;
    if (o.star != null) ov.star = o.star;
    if (o.examType != null) ov.examType = String(o.examType).trim();
    if (Array.isArray(o.examples) && o.examples.length) ov.examples = o.examples;
    if (o.hidden) ov.hidden = true;
    if (Object.keys(ov).length === 0) delete DB.cardOverrides[id];
    else DB.cardOverrides[id] = ov;
    refreshData();
    saveDB();
    renderApp();
    toast('已保存修改');
  }

  // 存储写失败告警（每次会话只提示一次）：配额满/隐私模式下丢的是学习进度，绝不能静默
  let storageWarned = false;
  function warnStorageFailure() {
    if (storageWarned) return;
    storageWarned = true;
    try { console.error('Athena: localStorage 写入失败（存储空间可能已满或处于隐私模式），学习进度无法保存！'); } catch (e) {}
    try { toast('⚠️ 学习进度写入失败（存储空间可能已满）——请立即到「设置」导出备份，避免进度丢失！'); } catch (e) {}
  }

  // 合并写：短时间窗口内的多次 saveDB 只落一次盘，且把序列化挪出评分点击的绘制路径。
  let saveDirty = false;
  let saveFlushScheduled = false;
  let idbBackupTimer = null;
  function flushSave() {
    if (!DB) return;
    saveDirty = false;
    saveFlushScheduled = false;
    DB.updatedAt = Date.now(); // 同步时间戳（云同步「新者胜」的依据）
    let json = null;
    try { json = JSON.stringify(DB); } catch (e) { warnStorageFailure(); return; }
    try {
      localStorage.setItem(dbKey(), json);
      if (typeof scheduleSyncPush === 'function') scheduleSyncPush(); // 脏学科防抖推送（sync.mjs）
    } catch (e) {
      warnStorageFailure();
    }
    // IndexedDB 作为低频备份：防抖 2s，避免每次评分都全量写 IDB（idbSet 内部已吞异常，备份尽力而为）
    if (idbBackupTimer) clearTimeout(idbBackupTimer);
    idbBackupTimer = setTimeout(function () {
      idbBackupTimer = null;
      idbSet(dbKey(), DB);
    }, 2000);
  }
  function saveDB() {
    saveDirty = true;
    if (saveFlushScheduled) return;
    saveFlushScheduled = true;
    // 延迟 100ms：让评分后的界面先绘制，再串行化落盘（大库时评分点击不再卡顿）；
    // 同窗口内的多次 saveDB 合并为一次写。切后台/关页由 pagehide/visibilitychange 兜底 flush。
    setTimeout(function () { if (saveDirty) flushSave(); }, 100);
  }

  function sanitizeCard(c) {
    const out = defaultCard();
    if (c && typeof c === 'object') {
      if (typeof c.reps === 'number') out.reps = c.reps;
      if (typeof c.ivl === 'number') out.ivl = c.ivl;
      if (typeof c.due === 'number') out.due = c.due;
      if (typeof c.lapses === 'number') out.lapses = c.lapses;
      if (typeof c.grad === 'number') out.grad = c.grad;
      if (typeof c.step === 'number') out.step = c.step;
      if (typeof c.diff === 'number') out.diff = c.diff;
      if (typeof c.stab === 'number') out.stab = c.stab;
      if (c.fsrsInit) out.fsrsInit = 1;
      if (Array.isArray(c.hist)) out.hist = c.hist.map(function (h) { return { t: h.t, m: h.m, ivl: h.ivl || 0 }; });
      if (typeof c.lastR === 'number') out.lastR = c.lastR;
      if (typeof c.ivlR === 'number') out.ivlR = c.ivlR;
      if (c.state === 'new' || c.state === 'learning' || c.state === 'relearning' || c.state === 'review') out.state = c.state;
      if (typeof c.notes === 'string') out.notes = c.notes;
    }
    return out;
  }
  function importDB(text) {
    let data;
    try { data = JSON.parse(text); } catch (e) { throw new Error('不是有效的 JSON 文件'); }
    let payload = data;
    let target = currentSubjectId;
    if (data && data.format === 'formula-memory' && data.db) {
      payload = data.db;
      target = data.subject || currentSubjectId;
    }
    if (!payload || typeof payload !== 'object' || !payload.cards || typeof payload.cards !== 'object') {
      throw new Error('文件格式不正确（缺少 cards 数据）');
    }
    if (target !== currentSubjectId) {
      if (!setSubject(target)) throw new Error('备份中的学科不受支持');
      resetSessionState(); // 统一会话重置（含错题队列/导图/浏览过滤，避免上一学科状态残留）
    }
    const fresh = { schemaVersion: 1, cards: {}, settings: {}, log: {}, wrongs: {}, custom: {}, cardOverrides: {}, customRel: {} };
    DATA.forEach(function (f) { fresh.cards[f.id] = sanitizeCard(payload.cards[f.id]); });
    if (payload.settings && typeof payload.settings.dailyNew === 'number') {
      fresh.settings.dailyNew = Math.max(1, Math.min(99, Math.round(payload.settings.dailyNew)));
    }
    if (payload.settings && typeof payload.settings.targetS === 'number') {
      fresh.settings.targetS = Math.max(7, Math.min(730, Math.round(payload.settings.targetS)));
    }
    if (payload.settings && typeof payload.settings.targetLinkExam === 'boolean') {
      fresh.settings.targetLinkExam = payload.settings.targetLinkExam;
    }
    if (payload.settings && typeof payload.settings.goalTitle === 'string') {
      fresh.settings.goalTitle = payload.settings.goalTitle.trim() || GOAL_DEFAULT;
    }
    if (payload.settings && typeof payload.settings.examDate === 'string') {
      fresh.settings.examDate = payload.settings.examDate;
    }
    if (payload.settings && typeof payload.settings.bareRecall === 'boolean') {
      fresh.settings.bareRecall = payload.settings.bareRecall;
    }
    if (payload.log && payload.log.checkins && typeof payload.log.checkins === 'object') {
      fresh.log.checkins = {};
      Object.keys(payload.log.checkins).forEach(function (k) { fresh.log.checkins[k] = true; });
    }
    if (payload.log && typeof payload.log === 'object') {
      ['daily', 'mastery', 'detail', 'counts'].forEach(function (k) {
        if (payload.log[k] && typeof payload.log[k] === 'object') {
          fresh.log[k] = {};
          Object.keys(payload.log[k]).forEach(function (dk) {
            const v = payload.log[k][dk];
            if (k === 'detail' || k === 'counts') {
              fresh.log[k][dk] = (v && typeof v === 'object') ? JSON.parse(JSON.stringify(v)) : {};
            } else if (typeof v === 'number') {
              fresh.log[k][dk] = v;
            }
          });
        }
      });
    }
    if (payload.wrongs && typeof payload.wrongs === 'object') {
      Object.keys(payload.wrongs).forEach(function (wid) {
        if (payload.wrongs[wid] && typeof payload.wrongs[wid] === 'object') {
          fresh.wrongs[wid] = sanitizeWrongCard(payload.wrongs[wid]);
        }
      });
    }
    if (payload.custom && typeof payload.custom === 'object') {
      Object.keys(payload.custom).forEach(function (id) {
        const c = sanitizeCustomCard(payload.custom[id]);
        if (c) fresh.custom[id] = c;
      });
    }
    if (payload.cardOverrides && typeof payload.cardOverrides === 'object') {
      Object.keys(payload.cardOverrides).forEach(function (id) {
        const o = sanitizeCardOverride(payload.cardOverrides[id]);
        if (o) fresh.cardOverrides[id] = o;
      });
    }
    if (payload.customRel && typeof payload.customRel === 'object') {
      Object.keys(payload.customRel).forEach(function (id) {
        const arr = payload.customRel[id];
        if (Array.isArray(arr)) {
          fresh.customRel[id] = arr.filter(function (e) { return e && typeof e.to === 'string' && typeof e.tag === 'string'; });
        }
      });
    }
    DB = fresh;
    refreshData();
    saveDB();
  }

  // 导出全部科目：把每个学科的 DB 序列化到单个对象（多平台互通备份）
  function exportAllSubjects() {
    const out = {};
    Object.keys(subjectList()).forEach(function (sid) {
      const key = sid + '_formula_srs_v1';
      let db = null;
      try { db = JSON.parse(localStorage.getItem(key)); } catch (e) {}
      out[sid] = (db && typeof db === 'object') ? db : { cards: {}, settings: {}, log: {} };
    });
    return out;
  }
  // 导入全部科目：把 { sid: db } 写入各科 localStorage + IndexedDB；返回成功写入的科目数。
  // 写入失败的学科不计入成功数（调用方以此判断是否提示），并触发存储告警。
  function importAllSubjects(data) {
    const subs = data && data.subjects;
    if (!subs || typeof subs !== 'object') throw new Error('文件格式不正确（缺少 subjects 数据）');
    const list = subjectList();
    let count = 0;
    let failed = false;
    Object.keys(subs).forEach(function (sid) {
      if (!list[sid]) return; // 跳过本应用不认识的学科
      const db = subs[sid];
      if (!db || typeof db !== 'object' || typeof db.cards !== 'object') return;
      const key = sid + '_formula_srs_v1';
      let ok = true;
      try { localStorage.setItem(key, JSON.stringify(db)); } catch (e) { ok = false; }
      if (!ok) { failed = true; return; }
      idbSet(key, db);
      count++;
    });
    if (failed) warnStorageFailure();
    return count;
  }

  function renderTex(el, str) {
    el.setAttribute('data-tex', str);
    el.innerHTML = '';
    if (typeof window.katex !== 'undefined' && window.katex.render) {
      const pts = splitPoints(String(str));
      if (pts.length > 1) {
        pts.forEach(function (pt) {
          const d = document.createElement('div');
          d.className = 'ans-point';
          renderInto(d, pt);
          el.appendChild(d);
        });
      } else {
        renderInto(el, String(str));
      }
    } else {
      el.textContent = String(str).replace(/\$/g, '');
    }
  }
  // 找到从 open 位置起、与第 0 层 `{` 配对的 `}`（支持嵌套花括号，如 $\chi^{2}$ 里的 {2}）；找不到返回 -1
  function matchBrace(str, open) {
    let depth = 0;
    for (let j = open; j < str.length; j++) {
      const c = str[j];
      if (c === '{') depth++;
      else if (c === '}') { depth--; if (depth === 0) return j; }
    }
    return -1;
  }
  // 返回从 from 起下一个特殊字符（$、\、*）的下标；无则 -1
  function nextSpecial(str, from) {
    for (let j = from; j < str.length; j++) {
      const c = str[j];
      if (c === '$' || c === '\\' || c === '*') return j;
    }
    return -1;
  }
  // 把字符串渲染进 el：字符级扫描器（非单条正则）——
  //   $$..$$/$..$ 走 KaTeX；\textbf/\underline/\textit/\textrm/\textsf/\mathbf/\mathrm/\text{...}
  //   与 markdown **...** 转 HTML（应用字体）；\cmd{...} 用括号配对读取，内部可再含 $..$ 数学与嵌套花括号（递归）。
  //   这样 \textbf{方差用 $\chi^{2}$} 或 \underline{$\chi^{2}$ 拟合} 也能整体匹配，不再被 {2} 截断。
  function renderInto(el, str) {
    let i = 0;
    const n = str.length;
    while (i < n) {
      const ch = str[i];
      // 1) 行间公式 $$...$$
      if (ch === '$' && str[i + 1] === '$') {
        const end = str.indexOf('$$', i + 2);
        if (end === -1) { el.appendChild(document.createTextNode(str.slice(i))); break; }
        const body = str.slice(i + 2, end);
        const d = document.createElement('div');
        d.className = 'kx-block';
        try { window.katex.render(body, d, { displayMode: true, throwOnError: false }); }
        catch (e) { d.textContent = body; }
        el.appendChild(d);
        i = end + 2;
        continue;
      }
      // 2) 行内公式 $...$
      if (ch === '$') {
        const end = str.indexOf('$', i + 1);
        if (end === -1) { el.appendChild(document.createTextNode(str.slice(i))); break; }
        const body = str.slice(i + 1, end);
        const sp = document.createElement('span');
        sp.className = 'kx-inline';
        try { window.katex.render(body, sp, { displayMode: false, throwOnError: false }); }
        catch (e) { sp.textContent = body; }
        el.appendChild(sp);
        i = end + 1;
        continue;
      }
      // 3) markdown 加粗 **...**
      if (ch === '*' && str[i + 1] === '*') {
        const end = str.indexOf('**', i + 2);
        if (end === -1) { el.appendChild(document.createTextNode(str.slice(i))); break; }
        const b = document.createElement('b');
        renderInto(b, str.slice(i + 2, end));
        el.appendChild(b);
        i = end + 2;
        continue;
      }
      // 4) 文本模式命令 \cmd{...}（括号配对，支持嵌套）
      if (ch === '\\') {
        const cm = /^\\(textbf|underline|textit|textrm|textsf|mathbf|mathrm|text)\{/.exec(str.slice(i));
        if (cm) {
          const tag = cm[1];
          const openBrace = i + cm[0].length - 1;
          const closeBrace = matchBrace(str, openBrace);
          if (closeBrace === -1) { el.appendChild(document.createTextNode(str.slice(i))); break; }
          const inner = str.slice(openBrace + 1, closeBrace);
          if (tag === 'textbf' || tag === 'mathbf') {
            const b = document.createElement('b'); renderInto(b, inner); el.appendChild(b);
          } else if (tag === 'underline') {
            const u = document.createElement('u'); renderInto(u, inner); el.appendChild(u);
          } else if (tag === 'textit') {
            const it = document.createElement('i'); renderInto(it, inner); el.appendChild(it);
          } else {
            // textrm/textsf/mathrm/text → 应用字体，无额外标签
            renderInto(el, inner);
          }
          i = closeBrace + 1;
          continue;
        }
        // 无法识别的 \xxx：按字面保留（不吞掉，避免破坏后续内容）
        el.appendChild(document.createTextNode(ch));
        i++;
        continue;
      }
      // 5) 普通文本：前进到下一个特殊字符
      const nx = nextSpecial(str, i);
      if (nx === -1) { el.appendChild(document.createTextNode(str.slice(i))); break; }
      el.appendChild(document.createTextNode(str.slice(i, nx)));
      i = nx;
    }
  }

  // KaTeX 加载完成后，原地把已渲染的纯文本升级为公式（不打断当前学习状态）
  function upgradeAllMath() {
    document.querySelectorAll('[data-tex]').forEach(function (n) {
      renderTex(n, n.getAttribute('data-tex'));
    });
  }

  // ---------------- 数据持久化 ----------------

  function card(id) { return DB.cards[id]; }
  function shuffle(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }

  // ---------------- 会话持久化（跨模块/刷新保持学习卡片） ----------------
  function saveSession() {
    try { localStorage.setItem(sessionKey(), JSON.stringify({ deck: deck, pos: pos, frontier: frontier, pendingAdvance: pendingAdvance, seenAgain: seenAgain })); } catch (e) { warnStorageFailure(); }
  }
  function loadSession() {
    try {
      const raw = localStorage.getItem(sessionKey());
      if (raw) {
        const s = JSON.parse(raw);
        if (s && Array.isArray(s.deck) && s.deck.length > 0) {
          deck = s.deck.filter(function (id) { return DATA.some(function (f) { return f.id === id; }); });
          if (!deck.length) return false;
          pos = Math.max(0, Math.min(s.pos | 0, deck.length));
          frontier = Math.max(0, Math.min(s.frontier | 0, deck.length));
          // 已学完（pos 与 frontier 都越过队尾）的会话不恢复——返回 false 让 buildSession 重建，
          // 以纳入新到期的复习卡；否则会永远停留在「额度用完」旧队列，第二天到期的卡进不来
          if (frontier >= deck.length && pos >= frontier) {
            deck = []; pos = 0; frontier = 0; pendingAdvance = false;
            return false;
          }
          // 防御：pos 越过队尾但 frontier 未学完（不应发生），回退到队尾
          if (pos >= deck.length) pos = deck.length - 1;
          pendingAdvance = !!s.pendingAdvance;
          seenAgain = s.seenAgain || {};
          return true;
        }
      }
    } catch (e) {}
    return false;
  }

  // 旧版本（单学科）数据迁移到按学科命名的新键
  function migrateLegacy() {
    const pairs = [
      ['ms3_formula_srs_v1', 'math3_formula_srs_v1'],
      ['ms3_formula_session_v1', 'math3_formula_session_v1']
    ];
    pairs.forEach(function (p) {
      try {
        if (!localStorage.getItem(p[1]) && localStorage.getItem(p[0])) {
          localStorage.setItem(p[1], localStorage.getItem(p[0]));
        }
      } catch (e) {}
    });
    try {
      idbGet('ms3_formula_srs_v1').then(function (v) {
        if (v) idbGet('math3_formula_srs_v1').then(function (n) { if (!n) idbSet('math3_formula_srs_v1', v); }).catch(function () {});
      }).catch(function () {});
    } catch (e) {}
  }

  // ---------------- 打卡与坚持天数 ----------------
  function fmtDate(d) {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return y + '-' + m + '-' + day;
  }
  function todayStr() { return fmtDate(new Date()); }
  function markReviewed(id) {
    if (!DB.log.daily) DB.log.daily = {};
    const t = todayStr();
    DB.log.daily[t] = (DB.log.daily[t] || 0) + 1;
    if (id) {
      if (!DB.log.detail) DB.log.detail = {};
      if (!DB.log.detail[t]) DB.log.detail[t] = {};
      DB.log.detail[t][id] = (DB.log.detail[t][id] || 0) + 1;
    }
    saveDB();
  }
  function todayReviewed() {
    const t = todayStr();
    // 「今天已学习 X 张」按去重卡片统计（DB.log.detail 记录每个卡 id 只出现一次），而不是每次评分累加
    const det = (DB.log && DB.log.detail && DB.log.detail[t]) || null;
    if (det && typeof det === 'object') {
      const keys = Object.keys(det).filter(function (id) { return DATA.some(function (f) { return f.id === id; }); });
      return keys.length;
    }
    return (DB.log && DB.log.daily && DB.log.daily[t]) || 0;
  }

  // ---------------- 目标倒计时（原「考研倒计时」，目标名可编辑文本，便于考研后复用） ----------------
  function goalTitle() { return (DB && DB.settings && typeof DB.settings.goalTitle === 'string' && DB.settings.goalTitle.trim()) ? DB.settings.goalTitle.trim() : GOAL_DEFAULT; }
  function examDateObj() {
    const s = (DB && DB.settings && DB.settings.examDate) || '';
    if (s) {
      const d = new Date(s + 'T00:00:00');
      if (!isNaN(d.getTime())) return d;
    }
    return null;
  }
  function countdownDays() {
    const exam = examDateObj();
    if (!exam) return null;
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    return Math.max(0, Math.round((exam - today) / 86400000));
  }
  // 倒计时弹窗：每次打开应用都弹（仅在设置了目标日期时）
  function maybeShowCountdownPopup() {
    if (countdownDays() != null) showCountdownPopup();
  }
  function showCountdownPopup() {
    const d = countdownDays();
    if (d == null) return;
    const exam = examDateObj();
    const g = goalTitle();
    const modal = el('div', 'countdown-modal');
    const backdrop = el('div', 'countdown-backdrop');
    backdrop.setAttribute('data-action', 'countdown-close');
    modal.appendChild(backdrop);
    const card = el('div', 'countdown-card');
    card.appendChild(illus('countdown'));
    card.appendChild(el('div', 'countdown-title', d === 0 ? '今天是' + g + '日！' : '距离' + g + '还有'));
    if (d > 0) {
      const days = el('div', 'countdown-days');
      days.appendChild(el('span', 'countdown-num', String(d)));
      days.appendChild(el('span', 'countdown-unit', '天'));
      card.appendChild(days);
    }
    card.appendChild(el('p', 'muted', '目标日期：' + fmtDate(exam) + '（手动设置）'));
    if (d > 0 && d <= 30) {
      card.appendChild(el('p', 'countdown-tip', '已进入冲刺阶段：稳住节奏，坚持每天复习，优先攻克高频与薄弱知识点。'));
    }
    const ok = el('button', 'btn primary', '开始学习');
    ok.setAttribute('data-action', 'countdown-close');
    card.appendChild(ok);
    modal.appendChild(card);
    document.body.appendChild(modal);
  }

  // ---------------- 统计与掌握度 ----------------
  function mastery(id) {
    const c = card(id);
    let score;
    if (c.state === 'new') {
      score = 0;
    } else {
      // 掌握度 = 稳定度 S 到目标 S_N 的比例（⚠️自设计：对数压缩，S 量纲而非半衰期 h 量纲，避免 h=90·S 放大导致虚高）
      //   学习/重学阶段用短时稳定度（FSRS 已在维护：Again 降、Good/Easy 不降，随评分真实变化）；复习阶段用长期稳定度。
      //   s = ln(1+S)/ln(1+S_N)，S≥S_N（毕业）即 100%；对数使「记忆强度增长先快后慢」、避免早期全 0。
      const S = (typeof c.stab === 'number' && c.stab > 0) ? c.stab : 0;
      const sN = targetS();
      const s = Math.max(0, Math.min(1, Math.log(1 + S) / Math.log(1 + sN)));
      score = Math.round(100 * s);
    }
    score = Math.max(0, Math.min(100, score));
    let label;
    if (isGraduated(c)) label = '毕业';
    else if (score < 10) label = '未学';
    else if (score < 25) label = '初学';
    else if (score < 45) label = '生疏';
    else if (score < 65) label = '巩固中';
    else if (score < 85) label = '已掌握';
    else if (score < 95) label = '熟练';
    else label = '稳固';
    return { pct: score, label: label };
  }

  // 当前可提取性 R（预测回忆概率，%）：与「掌握度」解耦，用于趋势图（实际 vs 预测同量纲）与卡面双维度
  function currentR(id) {
    const c = card(id);
    if (c.state !== 'review' || !(c.stab > 0)) return null;
    const days = Math.max(0, (Date.now() - (c.lastR || Date.now())) / DAY);
    return Math.round(fsrsRetention(days, c.stab) * 100);
  }

  function metaOf(id) { return (META && META[id]) || [3, '综合计算与应用']; }
  function pitfallOf(id) { return (PITFALL && PITFALL[id]) || ''; }
  function mnemOf(id) { return (MNEM && MNEM[id]) || ''; }
  function exampleOf(id) { return (EXAMPLES && EXAMPLES[id]) || null; }
  function examplesOf(id) { const ex = EXAMPLES && EXAMPLES[id]; if (!ex) return []; return Array.isArray(ex) ? ex : [ex]; }
  function relOf(id) { return (REL && REL[id]) || []; }
  function starText(n) {
    n = Math.max(1, Math.min(5, Math.round(n) || 3));
    let s = '';
    for (let i = 0; i < 5; i++) s += (i < n) ? '★' : '☆';
    return s;
  }
  function scheduleText(c) {
    if ((c.state === 'learning' || c.state === 'relearning')) return '再作答几次（答「简单」）后进入间隔记忆';
    return '间隔 ' + c.ivl + ' 天后再复习';
  }
  function masteryDeltaText() {
    if (lastMasteryDelta == null) return '已记录';
    return '掌握度 ' + (lastMasteryDelta >= 0 ? '+' : '') + lastMasteryDelta;
  }

  // 记忆算法可视化：下次复习时间 + 掌握度趋势曲线 + 实际/预测遗忘曲线
  function fmtDayMs(ts) { const d = new Date(ts); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); }
  function svgText(tag, x, y, str, attrsExtra) {
    const t = svgEl(tag, Object.assign({ x: x, y: y, 'font-size': '9', fill: '#999' }, attrsExtra || {}));
    t.textContent = str;
    return t;
  }
  function nextReviewText(c) {
    if (c.state === 'new') return '待学习';
    if ((c.state === 'learning' || c.state === 'relearning')) {
      const min = Math.max(1, Math.round((c.due - Date.now()) / 60000));
      return '学习中 · 第 ' + ((c.step | 0) + 1) + ' 步（约 ' + min + ' 分钟后重现）';
    }
    return '下次复习：' + fmtDayMs(c.due) + '（间隔 ' + c.ivl + ' 天）';
  }
  // 掌握度趋势：实际掌握度历史点（每次评分后跳变）+ 100% 目标参考线
  function svgMasteryTrend(id) {
    const c = card(id);
    const hist = (c.hist || []);
    const wrap = el('div', 'chart-wrap');
    wrap.appendChild(el('div', 'chart-label muted', '掌握度趋势（时间）· ● 每次评分后的掌握度 · ─ 目标(100%)'));
    if (hist.length < 2) { wrap.appendChild(el('p', 'muted', '📈 数据积累中——学习 2 次后显示趋势。')); return wrap; }
    let minT = hist[0].t;
    let maxT = hist[hist.length - 1].t;
    const spanT = Math.max(1, (maxT - minT) || 1);
    const W = 300, H = 118, padL = 28, padR = 8, padT = 12, padB = 18;
    const X = function (t) { return padL + (t - minT) / spanT * (W - padL - padR); };
    const Y = function (m) { return padT + (1 - m / 100) * (H - padT - padB); };
    const svg = svgEl('svg', { viewBox: '0 0 ' + W + ' ' + H, width: '100%' });
    [0, 50, 100].forEach(function (m) { const y = Y(m); svg.appendChild(svgEl('line', { x1: padL, x2: W - padR, y1: y, y2: y, stroke: '#E7E4DD', 'stroke-width': '1' })); svg.appendChild(svgText('text', padL - 4, y + 3, String(m), { 'text-anchor': 'end' })); });
    // 目标参考线（100% = 毕业/稳固）
    svg.appendChild(svgEl('line', { x1: padL, x2: W - padR, y1: Y(100), y2: Y(100), stroke: '#A9C9E8', 'stroke-width': '1', 'stroke-dasharray': '4 3' }));
    // 实际掌握度曲线 + 点
    const pts = hist.map(function (p) { return X(p.t) + ',' + Y(p.m); }).join(' ');
    svg.appendChild(svgEl('polyline', { points: pts, fill: 'none', stroke: '#D4537E', 'stroke-width': '2' }));
    hist.forEach(function (p) {
      const cEl = svgEl('circle', { cx: X(p.t), cy: Y(p.m), r: '3', fill: '#378ADD' });
      const tt = svgEl('title', {}); tt.textContent = fmtDayMs(p.t) + ' 掌握度 ' + p.m + '%';
      cEl.appendChild(tt); svg.appendChild(cEl);
    });
    // 日期横坐标
    svg.appendChild(svgText('text', padL, H - 5, fmtDayMs(minT)));
    svg.appendChild(svgText('text', W - padR, H - 5, fmtDayMs(maxT), { 'text-anchor': 'end' }));
    wrap.appendChild(svg);
    return wrap;
  }
  function memoryBox(id, hiddenClass) {
    const c = card(id);
    const box = el('div', 'memory-box' + (hiddenClass || ''));
    box.appendChild(el('div', 'memory-badge', '🧠 记忆'));
    box.appendChild(el('div', 'memory-sched muted', '🗓 ' + nextReviewText(c)));
    if (c.state === 'review') {
      const h = cardHalflife(c);
      const targetText = targetLinked()
        ? ('目标：稳至' + goalTitle() + '(≥' + Math.round(TARGET_CONFIDENCE * 100) + '%) · 距' + goalTitle() + ' ' + countdownDays() + ' 天')
        : ('目标 S_N=' + Math.round(targetS()) + ' 天');
      box.appendChild(el('div', 'memory-fsrs muted', '📐 难度 ' + (c.diff || 5).toFixed(1) + ' · 稳定性 S=' + (c.stab || 0).toFixed(1) + ' 天 · ' + targetText + (isGraduated(c) ? ' · ✔已毕业' : '')));
    }
    box.appendChild(svgMasteryTrend(id));
    return box;
  }

  function stats() {
    const now = Date.now();
    let due = 0, learn = 0, review = 0, fresh = 0, mature = 0, pctSum = 0;
    DATA.forEach(function (f) {
      const c = card(f.id);
      pctSum += mastery(f.id).pct;
      if (c.state === 'new') fresh++;
      else if ((c.state === 'learning' || c.state === 'relearning')) { learn++; }
      else { if (c.due <= now) due++; else { review++; if (isGraduated(c)) mature++; } }
    });
    return { due: due, learn: learn, review: review, fresh: fresh, mature: mature, total: DATA.length, avg: Math.round(pctSum / DATA.length) };
  }

  // 记忆算法相关指标（供统计页可视化）
  function avgCurrentR() {
    let s = 0, n = 0;
    DATA.forEach(function (f) { const r = currentR(f.id); if (r != null) { s += r; n++; } });
    return n ? Math.round(s / n) : 0;
  }
  function graduatedCount() { return DATA.filter(function (f) { return isGraduated(card(f.id)); }).length; }
  function totalLapses() { return DATA.reduce(function (a, f) { return a + (card(f.id).lapses || 0); }, 0); }
  function stateCounts() {
    let fresh = 0, learn = 0, review = 0, grad = 0;
    DATA.forEach(function (f) {
      const c = card(f.id);
      if (c.state === 'new') fresh++;
      else if ((c.state === 'learning' || c.state === 'relearning')) learn++;
      else { review++; if (isGraduated(c)) grad++; }
    });
    return { fresh: fresh, learn: learn, review: review, grad: grad };
  }
  // 记忆强度（半衰期 h，天）分桶柱状图数据：[桶标签, 张数]
  function halflifeHistogram() {
    const buckets = [
      ['<7d', 0], ['7-30d', 0], ['30-90d', 0], ['90-180d', 0], ['180-365d', 0], ['≥365d', 0]
    ];
    DATA.forEach(function (f) {
      const h = cardHalflife(card(f.id));
      if (!(h > 0)) return;
      if (h < 7) buckets[0][1]++;
      else if (h < 30) buckets[1][1]++;
      else if (h < 90) buckets[2][1]++;
      else if (h < 180) buckets[3][1]++;
      else if (h < 365) buckets[4][1]++;
      else buckets[5][1]++;
    });
    return buckets;
  }

  function cardHalflife(c) { return (c.state === 'review' && typeof c.stab === 'number') ? fsrsHalflife(c.stab) : 0; }
  // 毕业目标稳定度 S（天）：卡片稳定度达到该值即视为「毕业/稳固」——语义为「停止复习后仍能 ≥90% 记得」的天数。
  // 开「与目标倒计时挂钩」：目标 S = 剩余天数（下限 TARGET_MIN_DAYS），等价要求目标日可提取性 ≥ TARGET_CONFIDENCE（90%）。
  //   因 R(S,S)=0.9，S 目标数值即「距目标天数」，直观合理（不再用半衰期 h=90·S，避免 120 天目标被显示成 1 万多天）。
  // 关「挂钩」：回退到用户手动填的固定目标稳定度（默认 90 天）。
  function targetS() {
    const manual = (DB && DB.settings && typeof DB.settings.targetS === 'number') ? DB.settings.targetS : TARGET_S_DEFAULT;
    if (!targetLinked()) return manual;
    const days = countdownDays();
    if (days == null) return manual;
    return Math.max(TARGET_MIN_DAYS, days);
  }
  // 是否与目标倒计时挂钩（用于记忆框/设置页文案）
  function targetLinked() { return !(DB && DB.settings && DB.settings.targetLinkExam === false) && countdownDays() != null; }
  function bareRecallOn() { return !!(DB && DB.settings && DB.settings.bareRecall); }
  function isGraduated(c) { return c.state === 'review' && (typeof c.stab === 'number' ? c.stab : 0) >= targetS(); }

  // 学习计时：应用前台可见期间按天累计时长（DB.log.studyTime['yyyy-mm-dd'] = 毫秒）。
  // 结算点：每 15 秒 tick + 切后台/关页（actions.mjs 在 flush 落盘前先结算，顺序不可换）。
  function todayStudySec() { const t = todayStr(); return (DB && DB.log && DB.log.studyTime && DB.log.studyTime[t]) || 0; }
  function todayStudyMin() { return Math.round(todayStudySec() / 60000); }
  // 每日完成量分类计数（新学 n / 复习 r / 错题重做 w），供统计页学习报告聚合
  function bumpCount(kind) {
    if (!DB || !DB.log) return;
    if (!DB.log.counts) DB.log.counts = {};
    const t = todayStr();
    const c = (DB.log.counts[t] = DB.log.counts[t] || { n: 0, r: 0, w: 0 });
    c[kind] = (c[kind] || 0) + 1;
  }
  let studyTickLast = Date.now();
  let continuousSince = Date.now();  // 连续前台起点（切后台即重置）
  let lastBreakNudgeMs = 0;          // 上次「起身休息」提示时刻
  let nightNudged = false;           // 本次会话是否已提示过深夜睡眠
  function settleStudyTime() {
    const now = Date.now();
    const visible = (typeof document !== 'undefined' && document.visibilityState === 'visible');
    if (DB && visible) {
      const delta = now - studyTickLast;
      if (delta >= 5000) { // 不足 5 秒不记账；休眠/挂起后不巨量补记（单次上限 60 秒）
        if (!DB.log.studyTime) DB.log.studyTime = {};
        const t = todayStr();
        DB.log.studyTime[t] = (DB.log.studyTime[t] || 0) + Math.min(delta, 60000);
      }
      // 节律提示：连续学习约 50 分钟，温和提醒起身休息（脚手架，非强制）
      if (now - continuousSince >= 50 * 60000 && now - lastBreakNudgeMs >= 50 * 60000) {
        lastBreakNudgeMs = now;
        try { toast('⏳ 已连续学习约 50 分钟——起身远眺 5 分钟再回来，专注与巩固都会更好。'); } catch (e) {}
      }
      // 深夜提示：23 点后每次会话提醒一次（「学前睡好编码、学后睡够巩固」，A 级证据）
      const hour = new Date(now).getHours();
      if (!nightNudged && (hour >= 23 || hour < 5)) {
        nightNudged = true;
        try { toast('🌙 睡眠是记忆巩固的最后一道工序——今晚早睡，比熬夜多刷十张卡更值。'); } catch (e) {}
      }
    } else {
      continuousSince = now; // 切后台：连续计时清零
      lastBreakNudgeMs = 0;
    }
    studyTickLast = now;
  }

  // 卡面「存储强度」文本：以稳定度 S（天）为准（毕业/掌握度均按 S 判），半衰期 h 仅作「遗忘到 50% 耗时」参考展示
  function memoryStrengthText(c) {
    if (c.state !== 'review') return '';
    const h = cardHalflife(c);
    return '存储强度 S=' + (c.stab || 0).toFixed(1) + '天（半衰期 h=' + h.toFixed(1) + '天，仅供参考）' + (isGraduated(c) ? ' · ✔已毕业' : '');
  }

  // 学习毕业：毕业时用「当前稳定度」（可能已被短时记忆 / 学习期遗忘压低）确定间隔
  function graduateReview(c, stab) {
    c.grad = 1; c.reps = 1; c.state = 'review';
    c.stab = Math.max(FSRS_S_MIN, (typeof stab === 'number') ? stab : c.stab);
    c.ivl = Math.max(1, Math.round(fsrsInterval(c.stab)));
    c.due = dayStart(Date.now()) + c.ivl * DAY;
  }

  // 学习阶段：时间步进（新卡 Learning 1 分钟 → 10 分钟）；复习遗忘进入 Relearning（10 分钟一步，FSRS-6 默认）
  const STEP_MS = [60 * 1000, 10 * 60 * 1000];
  const LAST_STEP = 1;                    // learning：第 1 步为最后一步（Good 过此步毕业）
  const RELEARN_MS = [10 * 60 * 1000];    // FSRS-6 relearning_steps = ['10m']
  const RELEARN_LAST_STEP = 0;            // relearning：仅 1 步（索引 0）
  // 四档评分：0 = 忘记(Again)；1 = 困难(Hard)；2 = 良好(Good)；3 = 简单(Easy)
  // 调度状态机在 src/sched.mjs（与错题卡共用），这里只注入知识卡差异：
  // 学习步 1 分钟 → 10 分钟，重学 10 分钟一步；Again 回第 0 步，Hard 前进不毕业，Good 越过最后一步毕业。
  const LEARN_SCHED = {
    stepsLearn: STEP_MS,
    stepsRelearn: RELEARN_MS,
    lastLearnStep: LAST_STEP,
    lastRelearnStep: RELEARN_LAST_STEP,
    learningDue: function (now, steps, step) { return now + steps[step]; },
    relearnDue: function (now) { return now + RELEARN_MS[0]; },
    graduate: graduateReview,
    reviewIvl: function (c) { return Math.max(1, Math.round(fsrsInterval(c.stab))); }
  };
  function applyRatingToCard(c, rating) { applySchedRating(c, rating, LEARN_SCHED); }

  function applyRating(id, rating) { applyRatingToCard(card(id), rating); }

  // 预览：选择某个评分档后，距下次复习/重现的时长（用克隆卡跑一遍正版逻辑，不动真实数据）
  function previewNextTime(id, rating) {
    const clone = Object.assign({}, card(id));
    applyRatingToCard(clone, rating);
    // 毕业后按「自然日」展示整天间隔（与 due 对齐自然日一致，避免显示 0.2 天这种误导）；
    // 学习/重学阶段仍按精确分钟（1 分钟 / 10 分钟步进）展示。
    if (clone.state === 'review' && clone.ivl >= 1) return clone.ivl * DAY;
    return clone.due - Date.now(); // 毫秒
  }
  function fmtPreview(ms) {
    if (!(ms > 0)) return '即刻';
    const min = ms / 60000;
    if (min < 90) return Math.max(1, Math.round(min)) + ' 分钟';
    const days = min / 1440;
    return Math.round(days * 10) / 10 + ' 天';
  }

  // ---------------- 视图状态 ----------------
  let currentView = 'learn';
  let currentModule = 'cards'; // 一级界面：cards(知识卡) | wrong(错题本)
  let deck = [];
  let pos = 0;
  let frontier = 0;
  let pendingAdvance = false;
  let lastMasteryDelta = null;
  let lastRatingUndo = null;
  let seenAgain = {};
  let quiz = null;
  let mapCat = null, mapSel = null;
  let heatSel = null;
  let mapScale = 1;
  let mapTx = 0, mapTy = 0;
  let mapDragMoved = false;

  // 会话级状态一键重置（切换学科 / 导入数据时调用）。
  // ⚠️ 新增会话级可变量时必须在这里同步补上——此前 switchSubject 与 importDB 各自维护
  // 手工清单且互有遗漏（导入换科后错题队列/导图状态残留），统一到这里避免再漏。
  function resetSessionState() {
    deck = []; pos = 0; frontier = 0; pendingAdvance = false;
    lastMasteryDelta = null; lastRatingUndo = null; seenAgain = {}; quiz = null;
    mapCat = null; mapSel = null; mapScale = 1; mapTx = 0; mapTy = 0; mapDragMoved = false; heatSel = null;
    browseCat = 'all'; browseQuery = ''; browseExpanded = {}; browseMastery = 'all'; browseStars = 'all';
    wrongDeck = []; wrongFrontier = 0; wrongExpanded = {}; wrongJumpId = null;
  }

  // ---------------- 通用 DOM ----------------
  function el(tag, cls, text) {
    const e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text != null) e.textContent = text;
    return e;
  }

  function texEl(tag, cls, text) {
    const e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text != null) renderTex(e, text);
    return e;
  }

  // 插画（assets/ 下的空状态/弹窗配图，WebP 格式——PNG 原稿已删除）
  function illus(name) {
    const img = document.createElement('img');
    img.src = 'assets/' + name + '.webp';
    img.className = 'illus';
    img.alt = '';
    return img;
  }

  function toast(msg) {
    let t = document.getElementById('toast');
    if (!t) { t = el('div', 'toast'); t.id = 'toast'; document.body.appendChild(t); }
    t.textContent = msg;
    t.classList.add('show');
    clearTimeout(t._timer);
    t._timer = setTimeout(function () { t.classList.remove('show'); }, 1800);
  }

  // 渲染二级导航（随一级界面切换）
  function renderSubnav() {
    const sub = document.getElementById('subnav');
    if (!sub) return;
    sub.innerHTML = '';
    const items = currentModule === 'wrong'
      ? [['wrong', '📕 重做'], ['wrongBrowse', '📋 浏览'], ['wrongStats', '📊 统计']]
      : [['learn', '📚 学习'], ['browse', '🔍 浏览'], ['quiz', '✏️ 自测'], ['statistics', '📈 统计']];
    items.forEach(function (it) {
      const b = el('button', 'nav-btn sub-btn' + (currentView === it[0] ? ' active' : ''), it[1]);
      b.setAttribute('data-action', 'nav');
      b.setAttribute('data-arg', it[0]);
      sub.appendChild(b);
    });
  }

  // 移动端底部 Dock：仅两个一级模块；二级导航（学习/浏览等）在顶栏下方 subnav 横滑条
  function renderDock() {
    const dock = document.getElementById('dock');
    if (!dock) return;
    dock.innerHTML = '';
    [['cards', '📚 知识卡'], ['wrong', '📕 错题本']].forEach(function (m) {
      const b = el('button', 'dock-btn' + (currentModule === m[0] ? ' active' : ''), m[1]);
      b.setAttribute('data-action', 'module');
      b.setAttribute('data-arg', m[0]);
      dock.appendChild(b);
    });
  }

  function renderApp() {

    const app = document.getElementById('app');
    app.innerHTML = '';
    if (currentView === 'learn') renderLearn();
    else if (currentView === 'browse') renderBrowse();
    else if (currentView === 'quiz') renderQuiz();
    else if (currentView === 'statistics') renderStatistics();
    else if (currentView === 'wrong') renderWrongLearn();
    else if (currentView === 'wrongBrowse') renderWrongBrowse();
    else if (currentView === 'wrongStats') renderWrongStats();
    else if (currentView === 'principle') renderPrinciples();
    else if (currentView === 'settings') renderSettings();
    // 高亮一级 tab + 渲染二级导航
    document.querySelectorAll('.module-tab').forEach(function (b) {
      b.classList.toggle('active', b.getAttribute('data-arg') === currentModule);
    });
    renderSubnav();
    renderDock();
    const vf = el('div', 'app-version');
    vf.textContent = 'Athena · 版本 v' + VERSION;
    app.appendChild(vf);
    updateNavBadge();
    updateBrand();
    snapshotMastery();
  }

  function statsBar() {
    const s = stats();
    const incNew = incompleteNewCount();
    const bar = el('div', 'stats-bar');
    bar.appendChild(el('span', 'stat', '今天已学习 ' + todayReviewed() + ' 张'));
    bar.appendChild(el('span', 'stat', '⏱ 今日已学 ' + todayStudyMin() + ' 分钟'));
    bar.appendChild(el('span', 'stat', '待复习 ' + s.due + ' 张'));
    bar.appendChild(el('span', 'stat', '未学完新卡 ' + incNew + ' 张'));
    bar.appendChild(el('span', 'stat', '总计 ' + s.total));
    return bar;
  }

  // ---------------- 学习视图 · 交错练习 ----------------
  // 辨析聚类：把「真有关系」的卡（REL 中 tag=同类/对比/类比）聚成簇、簇内相邻出现，
  // 无关联的卡不硬凑、按章节轮转。纯函数在 src/interleave.mjs。
  function catOfId(id) {
    const f = DATA.find(function (x) { return x.id === id; });
    return f ? f.cat : '?';
  }
  function interleaveByIds(ids) { return interleaveRelated(ids, REL, catOfId); }
  // 到期复习：先按重要度(星)分层，层内再做辨析聚类，兼顾「重要优先」与「相关卡较近」
  function interleaveByImportance(ids) {
    const tiers = {};
    ids.forEach(function (id) {
      const star = (metaOf(id) && metaOf(id)[0]) || 0;
      (tiers[star] = tiers[star] || []).push(id);
    });
    return Object.keys(tiers)
      .sort(function (a, b) { return Number(b) - Number(a); })
      .reduce(function (acc, k) { return acc.concat(interleaveByIds(tiers[k])); }, []);
  }

  // 新卡摄入：一次性引入全部未学新卡（时间预算为软上限，超出仅提示、不封顶引入）
  function introState() {
    if (!DB.log) DB.log = {};
    if (!DB.log.newIntro || !Array.isArray(DB.log.newIntro.ids)) DB.log.newIntro = { ids: [] };
    return DB.log.newIntro;
  }
  // 未完全学习的新卡：处于学习阶段、尚未毕业（曾经点过「忘记」）
  function incompleteNewCount() {
    return DATA.filter(function (f) { const c = card(f.id); return (c.state === 'learning' || c.state === 'relearning') && (c.grad | 0) === 0; }).length;
  }

  function buildSession() {
    const now = Date.now();
    const all = DATA.map(function (f) { return f.id; });
    const st = introState();
    // 引入全部「未引入的新卡」（时间预算为软上限：超出仅提示，不封顶新卡引入）
    const pending = shuffle(all.filter(function (id) { return card(id).state === 'new' && st.ids.indexOf(id) === -1; }));
    if (pending.length) { st.ids = st.ids.concat(pending); saveDB(); }
    // 到期复习（review 且到期）
    const due = all.filter(function (id) {
      const c = card(id);
      return c.state === 'review' && c.due <= now;
    });
    due.sort(function (a, b) {
      const sa = metaOf(a)[0] || 0, sb = metaOf(b)[0] || 0;
      if (sb !== sa) return sb - sa;
      return card(a).due - card(b).due;
    });
    // 到期复习：先按重要度/到期排序，再按重要度分层做辨析交错（相关卡较近、同章不连续）
    const dueOrdered = interleaveByImportance(due);
    // 学习阶段（时间步进到点）的卡：辨析交错（相关卡较近）
    const resumeLearning = interleaveByIds(all.filter(function (id) { return (card(id).state === 'learning' || card(id).state === 'relearning') && card(id).due <= now; }));
    // 已引入但仍未学的新卡：先乱序，再辨析交错（相关新卡较近出现）
    const newToStudy = interleaveByIds(shuffle(st.ids.filter(function (id) { return card(id).state === 'new'; })));
    // 队列 = 到期复习 + 续学 + 已引入新卡
    deck = dueOrdered.concat(resumeLearning, newToStudy);
    pos = 0;
    frontier = 0;
    pendingAdvance = false;
    seenAgain = {};
    saveSession();
  }

  function surfaceDue() {
    const now = Date.now();
    const isDue = function (id) {
      const c = card(id);
      return (c.state === 'review' || c.state === 'learning' || c.state === 'relearning') && c.due <= now;
    };
    // 记住当前 pos 指向的卡，重组后尽量保持/正确回退
    const curId = (pos >= 0 && pos < deck.length) ? deck[pos] : null;
    const inDeck = {};
    deck.forEach(function (id) { inDeck[id] = true; });
    // deck 外部的到期卡（昨天学完今天到期、但不在当前队列）——吸收进队首
    const fresh = [];
    DATA.forEach(function (f) {
      if (!inDeck[f.id] && isDue(f.id)) fresh.push(f.id);
    });
    fresh.sort(function (a, b) {
      const sa = metaOf(a)[0] || 0, sb = metaOf(b)[0] || 0;
      if (sb !== sa) return sb - sa;
      return card(a).due - card(b).due;
    });
    // 拆分 head（已学）/tail（待学），把到期卡统一归到「待学区」最前
    const head = deck.slice(0, frontier);
    const tail = deck.slice(frontier);
    // 学习/重学卡评分后会被推回队尾等待重现，同时留在「已学区」供确认展示；
    // 二者指向同一张卡，到期时必须去重（队尾副本优先），否则 front 会出现重复卡、打乱队列。
    const surfaced = {};              // 已确定要进入 front 的卡（去重键）
    const dueTail = [];
    tail.forEach(function (id) {
      if (isDue(id) && !surfaced[id]) { surfaced[id] = true; dueTail.push(id); }
    });
    const dueHead = [];
    head.forEach(function (id) {
      if (isDue(id) && !surfaced[id]) { surfaced[id] = true; dueHead.push(id); }
    });
    const keepHead = head.filter(function (id) { return !surfaced[id]; });
    const restTail = tail.filter(function (id) { return !surfaced[id]; });
    const front = fresh.concat(dueHead, dueTail);
    front.sort(function (a, b) { return card(a).due - card(b).due; });
    deck = keepHead.concat(front, restTail);
    frontier = keepHead.length;
    // 恢复 pos：原卡仍在「已学区」（未到期）则保持回看；否则跳到第一张待学卡
    if (curId != null) {
      const idx = deck.indexOf(curId);
      pos = (idx >= 0 && idx < frontier) ? idx : frontier;
    } else {
      pos = frontier;
    }
    if (pos < 0) pos = 0;
    if (pos > deck.length) pos = deck.length;
  }
  // 自适应步进：学习阶段的卡若等待过久（超过阈值），把它从队列靠后拉近，尽早重现
  function renderLearn() {
    const app = document.getElementById('app');
    surfaceDue();
    const tb = el('div', 'learn-top');
    const add = el('button', 'btn small', '➕ 录入知识点');
    add.addEventListener('click', openCardInput);
    tb.appendChild(add);
    app.appendChild(tb);
    app.appendChild(statsBar());

    const done = (deck.length === 0) || (frontier >= deck.length && pos >= frontier);
    if (done) {
      const wrap = el('div', 'center-card');
      wrap.appendChild(el('h2', null, '🎉 本轮已完成'));
      wrap.appendChild(illus('learn-done'));
      wrap.appendChild(el('p', 'muted', '全部知识点已纳入学习计划，暂无更多内容——按排期到期的卡片会自动进入复习队列。'));
      app.appendChild(wrap);
      return;
    }
    renderLearnCard(deck[pos]);
  }

  // —— 手动录入知识点（自建卡）——
  function openCardInput() {
    const modal = el('div', 'map-modal');
    const backdrop = el('div', 'map-modal-backdrop');
    backdrop.addEventListener('click', closeCardInput);
    modal.appendChild(backdrop);

    const cardBox = el('div', 'map-modal-card wrong-input-card');
    cardBox.appendChild(el('h3', null, '➕ 手动录入知识点'));

    const title = el('input', 'wrong-input');
    title.type = 'text';
    title.placeholder = '标题 / 名称（必填）…';
    cardBox.appendChild(wrongField('标题', title));

    const catSel = el('select', 'wrong-input');
    Object.keys(CATS).forEach(function (k) {
      const opt = document.createElement('option');
      opt.value = k;
      opt.textContent = CATS[k];
      catSel.appendChild(opt);
    });
    cardBox.appendChild(wrongField('分类', catSel));

    const front = el('textarea', 'wrong-input');
    front.placeholder = '提示 / 正面（必填，可含公式 $..$）…';
    cardBox.appendChild(wrongField('提示（正面）', front));

    const back = el('textarea', 'wrong-input');
    back.placeholder = '答案（必填，可含公式 $..$）…';
    cardBox.appendChild(wrongField('答案', back));

    // 关联知识点（自建卡 REL，带标签，用于交错聚类）
    const relList = [];
    const relBox = el('div', 'wrong-field');
    relBox.appendChild(el('span', 'mini-label', '关联知识点（可选，用于交错聚类）'));
    const relTag = el('select', 'wrong-input');
    ['同类', '对比', '类比', '相关', '前置', '方法', '应用'].forEach(function (t) {
      const opt = document.createElement('option');
      opt.value = t;
      opt.textContent = t;
      relTag.appendChild(opt);
    });
    const relSearch = el('input', 'search');
    relSearch.type = 'search';
    relSearch.placeholder = '搜索要关联的卡片…';
    const relResults = el('div', 'wrong-results');
    const relListBox = el('div', 'wrong-results');
    relSearch.addEventListener('input', function () {
      relResults.innerHTML = '';
      const q = relSearch.value.trim().toLowerCase();
      if (!q) return;
      DATA.filter(function (f) {
        return (f.title + ' ' + f.front).toLowerCase().indexOf(q) !== -1;
      }).slice(0, 10).forEach(function (f) {
        const chip = el('button', 'chip', f.title);
        chip.addEventListener('click', function () {
          if (!relList.some(function (r) { return r.to === f.id; })) {
            relList.push({ to: f.id, tag: relTag.value });
            relListBox.appendChild(renderRelChip(f.id, relTag.value, relList));
          }
        });
        relResults.appendChild(chip);
      });
    });
    relBox.appendChild(relTag);
    relBox.appendChild(relSearch);
    relBox.appendChild(relResults);
    relBox.appendChild(relListBox);
    cardBox.appendChild(relBox);

    const btns = el('div', 'wrong-input-btns');
    const save = el('button', 'btn primary', '保存');
    save.addEventListener('click', function () {
      if (saveCustomCard(title.value, front.value, back.value, catSel.value, relList)) closeCardInput();
    });
    const cancel = el('button', 'btn', '取消');
    cancel.addEventListener('click', closeCardInput);
    btns.appendChild(save);
    btns.appendChild(cancel);
    cardBox.appendChild(btns);

    modal.appendChild(cardBox);
    document.body.appendChild(modal);
  }

  function closeCardInput() {
    const m = document.querySelector('.map-modal');
    if (m) m.remove();
  }

  function renderRelChip(id, tag, relList) {
    const f = DATA.find(function (x) { return x.id === id; });
    const chip = el('button', 'chip', '[' + tag + '] ' + (f ? f.title : id));
    chip.addEventListener('click', function () {
      const idx = relList.findIndex(function (r) { return r.to === id; });
      if (idx >= 0) relList.splice(idx, 1);
      chip.remove();
    });
    return chip;
  }

  // —— 编辑卡片（覆盖层：题目/答案/标签/例题/隐藏）——
  function renderExampleEditor(e) {
    const eb = el('div', 'example-editor');
    const q = el('textarea', 'wrong-input');
    q.placeholder = '题目';
    q.value = e.q || '';
    const a = el('textarea', 'wrong-input');
    a.placeholder = '解析';
    a.value = e.a || '';
    const a2 = el('textarea', 'wrong-input');
    a2.placeholder = '💡 巧解（可选）';
    a2.value = e.a2 || '';
    const src = el('input', 'wrong-input');
    src.type = 'text';
    src.placeholder = '来源（可选）';
    src.value = e.src || '';
    const del = el('button', 'btn small danger', '删除此例题');
    del.addEventListener('click', function () { eb.remove(); });
    eb.appendChild(el('div', 'mini-label', '题目')); eb.appendChild(q);
    eb.appendChild(el('div', 'mini-label', '解析')); eb.appendChild(a);
    eb.appendChild(el('div', 'mini-label', '巧解')); eb.appendChild(a2);
    eb.appendChild(el('div', 'mini-label', '来源')); eb.appendChild(src);
    eb.appendChild(del);
    return eb;
  }

  function collectExamples(exWrap) {
    const out = [];
    exWrap.querySelectorAll('.example-editor').forEach(function (eb) {
      const fields = eb.querySelectorAll('.wrong-input');
      const q = fields[0].value.trim(), a = fields[1].value.trim(), a2 = fields[2].value.trim(), src = fields[3].value.trim();
      if (q) out.push({ q: q, a: a, a2: a2, src: src });
    });
    return out;
  }

  function openCardEdit(id) {
    const f = DATA.find(function (x) { return x.id === id; });
    if (!f) return;
    const ov = (DB.cardOverrides && DB.cardOverrides[id]) || {};
    const meta = metaOf(id);
    const exs = examplesOf(id).map(function (e) { return { q: e.q || '', a: e.a || '', a2: e.a2 || '', src: e.src || '' }; });

    const modal = el('div', 'map-modal');
    const backdrop = el('div', 'map-modal-backdrop');
    backdrop.addEventListener('click', closeEditModal);
    modal.appendChild(backdrop);

    const box = el('div', 'map-modal-card wrong-input-card edit-card');
    box.appendChild(el('h3', null, '✏️ 编辑知识点'));

    const title = el('textarea', 'wrong-input');
    title.value = f.title;
    box.appendChild(wrongField('标题', title));

    const front = el('textarea', 'wrong-input');
    front.value = f.front;
    box.appendChild(wrongField('提示（正面）', front));

    const back = el('textarea', 'wrong-input');
    back.value = f.back;
    box.appendChild(wrongField('答案', back));

    const catSel = el('select', 'wrong-input');
    Object.keys(CATS).forEach(function (k) {
      const opt = document.createElement('option');
      opt.value = k;
      opt.textContent = CATS[k];
      if (k === f.cat) opt.selected = true;
      catSel.appendChild(opt);
    });
    box.appendChild(wrongField('分类', catSel));

    const starSel = el('select', 'wrong-input');
    [1, 2, 3, 4, 5].forEach(function (n) {
      const opt = document.createElement('option');
      opt.value = String(n);
      opt.textContent = '★'.repeat(n);
      if (n === (meta[0] || 3)) opt.selected = true;
      starSel.appendChild(opt);
    });
    box.appendChild(wrongField('重要度', starSel));

    const examType = el('input', 'wrong-input');
    examType.type = 'text';
    examType.value = meta[1] || '';
    box.appendChild(wrongField('常考题型', examType));

    const exWrap = el('div', 'wrong-field');
    exWrap.appendChild(el('span', 'mini-label', '例题（可增删改，题目留空则不保存该例题）'));
    exs.forEach(function (e) { exWrap.appendChild(renderExampleEditor(e)); });
    const addEx = el('button', 'btn small', '➕ 添加例题');
    addEx.addEventListener('click', function () { exWrap.insertBefore(renderExampleEditor({ q: '', a: '', a2: '', src: '' }), addEx); });
    exWrap.appendChild(addEx);
    box.appendChild(exWrap);

    const hiddenCb = el('input', 'chk');
    hiddenCb.type = 'checkbox';
    hiddenCb.checked = !!ov.hidden;
    const hiddenLabel = el('label', 'setting-check', '');
    hiddenLabel.appendChild(hiddenCb);
    hiddenLabel.appendChild(el('span', null, '隐藏此卡片（软删除，可恢复）'));
    box.appendChild(hiddenLabel);

    const btns = el('div', 'wrong-input-btns');
    const save = el('button', 'btn primary', '保存');
    save.addEventListener('click', function () {
      saveCardOverride(id, {
        title: title.value, front: front.value, back: back.value,
        cat: catSel.value, star: Number(starSel.value), examType: examType.value,
        examples: collectExamples(exWrap), hidden: hiddenCb.checked
      });
      closeEditModal();
    });
    const restore = el('button', 'btn', '恢复原卡');
    restore.addEventListener('click', function () {
      delete DB.cardOverrides[id];
      saveDB();
      refreshData();
      closeEditModal();
      renderApp();
      toast('已恢复原卡');
    });
    const cancel = el('button', 'btn', '取消');
    cancel.addEventListener('click', closeEditModal);
    btns.appendChild(save);
    btns.appendChild(restore);
    btns.appendChild(cancel);
    box.appendChild(btns);

    modal.appendChild(box);
    document.body.appendChild(modal);
  }

  function closeEditModal() {
    const m = document.querySelector('.map-modal');
    if (m) m.remove();
  }

  // 例题 + 相关知识点（答案区附加内容，hiddenClass 为空字符串时可见）
  function buildExtras(id, hiddenClass) {
    const exs = examplesOf(id);
    const rels = relOf(id);
    if (exs.length === 0 && rels.length === 0) return null;
    const box = el('div', 'extras' + hiddenClass);
    exs.forEach(function (ex, i) {
      const eb = el('div', 'example-box');
      const label = exs.length > 1 ? ('📝 ' + (ex.src ? '真题' : '例题') + ' ' + (i + 1)) : (ex.src ? '📝 真题' : '📝 经典例题');
      eb.appendChild(el('div', 'example-label', label));
      const q = el('div', 'example-q');
      renderTex(q, ex.q);
      eb.appendChild(q);
      eb.appendChild(el('div', 'mini-label', '解析'));
      const a = el('div', 'example-a');
      renderTex(a, ex.a);
      eb.appendChild(a);
      if (ex.a2) {
        eb.appendChild(el('div', 'mini-label', '💡 巧解'));
        const a2 = el('div', 'example-a');
        renderTex(a2, ex.a2);
        eb.appendChild(a2);
      }
      if (ex.src) eb.appendChild(el('div', 'example-src', '📚 来源：' + ex.src));
      const mark = el('button', 'btn small', '📕 标记为错题');
      mark.addEventListener('click', function () { markAsWrong(ex, id); });
      eb.appendChild(mark);
      box.appendChild(eb);
    });
    if (rels.length) {
      const rb = el('div', 'rel-box');
      rb.appendChild(el('div', 'mini-label', '相关知识点'));
      rels.forEach(function (r) {
        const tf = DATA.find(function (x) { return x.id === r.to; });
        if (!tf) return;
        const chip = texEl('button', 'chip rel-chip', (r.tag ? '[' + r.tag + '] ' : '') + tf.title);
        chip.setAttribute('data-action', 'jump');
        chip.setAttribute('data-arg', tf.id);
        rb.appendChild(chip);
      });
      box.appendChild(rb);
    }
    return box;
  }

  function jumpToCard(id) {
    currentView = 'browse';
    browseCat = 'all';
    browseQuery = '';
    browseMastery = 'all'; browseStars = 'all';
    browseExpanded = {};
    browseExpanded[id] = true;
    renderApp();
    setTimeout(function () {
      const node = document.querySelector('[data-card="' + id + '"]');
      if (node) node.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 60);
  }

  function renderLearnCard(id) {
    const app = document.getElementById('app');
    const f = DATA.find(function (x) { return x.id === id; });
    const reviewed = pos < frontier;
    const wrap = el('div', 'learn-wrap');

    const top = el('div', 'learn-top');
    const catBadge = el('span', 'badge cat-badge', CATS[f.cat]);
    if (bareRecallOn() && !reviewed) catBadge.classList.add('hidden');
    top.appendChild(catBadge);
    // 直接编辑当前卡（桌面/移动通用；沉浸模式下随 learn-top 一并隐藏）
    const editBtn = el('button', 'btn small learn-edit', '✏️ 编辑');
    editBtn.addEventListener('click', function () { openCardEdit(id); });
    top.appendChild(editBtn);
    wrap.appendChild(top);

    const m = mastery(id);
    const st = card(id);
    const meta = el('div', 'learn-meta');
    meta.appendChild(el('span', 'mastery-badge', m.label + ' ' + m.pct + '%'));
    meta.appendChild(el('span', 'star-badge', starText(metaOf(id)[0])));
    const bar = el('div', 'mastery-bar');
    const fill = el('div', 'mastery-fill');
    fill.style.width = m.pct + '%';
    bar.appendChild(fill);
    meta.appendChild(bar);
    meta.appendChild(el('span', 'muted',
      st.state === 'new' ? '尚未学习' : ((st.state === 'learning' || st.state === 'relearning') ? '学习中' : ('间隔 ' + st.ivl + ' 天' + (st.lapses > 0 ? ' · 遗忘 ' + st.lapses + ' 次' : '') + ' · ' + memoryStrengthText(st)))));
    wrap.appendChild(meta);

    const cardEl = el('div', 'card');
    const frontBox = el('div', 'front');
    if (!reviewed) { frontBox.setAttribute('data-action', 'reveal'); frontBox.setAttribute('title', '点击显示答案'); }
    renderTex(frontBox, f.front);
    cardEl.appendChild(frontBox);

    const backBox = el('div', 'back' + (reviewed ? '' : ' hidden'));
    renderTex(backBox, f.back);
    cardEl.appendChild(backBox);

    const useBox = el('div', 'use-box' + (reviewed ? '' : ' hidden'));
    useBox.appendChild(el('span', 'use-label', subjKind() === 'qa' ? '📌 考查方式：' : '📌 常考题型：'));
    useBox.appendChild(el('span', null, metaOf(id)[1]));
    cardEl.appendChild(useBox);

    const mn = mnemOf(id);
    if (mn) {
      const mb = el('div', 'mnem-box' + (reviewed ? '' : ' hidden'));
      mb.appendChild(el('span', 'mnem-label', '🗝️ 助记：'));
      mb.appendChild(texEl('span', null, mn));
      cardEl.appendChild(mb);
    }

    const pf = pitfallOf(id);
    if (pf) {
      const pfb = el('div', 'pitfall-box' + (reviewed ? '' : ' hidden'));
      pfb.appendChild(el('span', 'pitfall-label', '⚠️ 常见陷阱：'));
      pfb.appendChild(texEl('span', null, pf));
      cardEl.appendChild(pfb);
    }

    const hint = el('div', 'hint muted' + (reviewed ? '' : ' hidden'),
      reviewed
        ? (pendingAdvance ? '✅ ' + masteryDeltaText() + '，' + scheduleText(st) + '，点击「下一张」继续。' : '这是你已复习过的卡片（答案已展示），点「回到当前卡片」继续。')
        : '回想后再点击「显示答案」核对，主动回忆效果最佳。');
    cardEl.appendChild(hint);

    // 笔记模块置于真题/相关知识点模块之前
    const notesBox = el('div', 'notes-box' + (reviewed ? '' : ' hidden'));
    notesBox.appendChild(el('div', 'mini-label', '📝 我的笔记（感想 / 补充 / 易错点）'));
    const notes = el('textarea', 'card-notes');
    notes.placeholder = '在这里记录你的理解、补充或易错点…';
    notes.value = st.notes || '';
    let notesTimer;
    notes.addEventListener('input', function () {
      st.notes = notes.value;
      clearTimeout(notesTimer);
      notesTimer = setTimeout(saveDB, 400);
    });
    notesBox.appendChild(notes);
    cardEl.appendChild(notesBox);

    const extras = buildExtras(id, reviewed ? '' : ' hidden');
    if (extras) cardEl.appendChild(extras);

    cardEl.appendChild(memoryBox(id, reviewed ? '' : ' hidden'));

    wrap.appendChild(cardEl);

    const nav = el('div', 'learn-nav');
    if (pos > 0) {
      const back = el('button', 'btn small', '← 上一张');
      back.setAttribute('data-action', 'goback');
      nav.appendChild(back);
    }
    if (reviewed && lastRatingUndo) {
      const undo = el('button', 'btn small', '↩ 撤销评分');
      undo.setAttribute('data-action', 'undo');
      nav.appendChild(undo);
    }
    if (reviewed) {
      const go = el('button', 'btn small primary', pendingAdvance ? '下一张 ▶' : '回到当前卡片 →');
      go.setAttribute('data-action', 'gofront');
      nav.appendChild(go);
    }
    wrap.appendChild(nav);

    if (!reviewed) {
      const controls = el('div', 'controls');
      const reveal = el('button', 'btn primary', '显示答案');
      reveal.setAttribute('data-action', 'reveal');
      controls.appendChild(reveal);
      wrap.appendChild(controls);

      const rating = el('div', 'rating hidden');
      const mk = function (label, sub, r) {
        const prev = fmtPreview(previewNextTime(id, r)); // 预测：选此档后距下次复习的时长
        const b = el('button', 'btn rate r' + r, '');
        b.setAttribute('data-action', 'rate');
        b.setAttribute('data-arg', String(r));
        b.setAttribute('title', sub + ' · 下次约 ' + prev);
        b.setAttribute('aria-label', label + '：' + sub + '，下次约 ' + prev);
        b.appendChild(el('span', null, label));
        b.appendChild(el('small', 'rate-prev', prev));
        rating.appendChild(b);
      };
      mk('再来一次', '完全没印象', 0);
      mk('困难', '有印象但吃力', 1);
      mk('良好', '能想起，正常间隔', 2);
      mk('简单', '很轻松，拉长间隔', 3);
      const kbd = el('div', 'keyboard-hint muted', '1 再来一次 · 2 困难 · 3 良好 · 4 简单 · Space/Enter 显示答案');
      rating.appendChild(kbd);
      wrap.appendChild(rating);
    }

    app.appendChild(wrap);
  }

  function revealCurrent() {
    const app = document.getElementById('app');
    app.querySelector('.back').classList.remove('hidden');
    app.querySelector('.use-box').classList.remove('hidden');
    if (bareRecallOn()) {
      const cb = app.querySelector('.cat-badge');
      if (cb) cb.classList.remove('hidden');
    }
    const ex = app.querySelector('.extras');
    if (ex) ex.classList.remove('hidden');
    app.querySelector('.hint').classList.remove('hidden');
    const nb = app.querySelector('.notes-box');
    if (nb) nb.classList.remove('hidden');
    const pb = app.querySelector('.pitfall-box');
    if (pb) pb.classList.remove('hidden');
    const mb = app.querySelector('.mnem-box');
    if (mb) mb.classList.remove('hidden');
    const mem = app.querySelector('.memory-box');
    if (mem) mem.classList.remove('hidden');
    app.querySelector('.controls').classList.add('hidden');
    app.querySelector('.rating').classList.remove('hidden');
  }

  function doRate(r) {
    if (frontier >= deck.length) return;
    const id = deck[frontier];
    const wasNew = card(id).state === 'new'; // 评分前状态：新卡首学 vs 复习
    const beforeM = mastery(id).pct; // 评分前掌握度（存储强度到目标比例）
    // 撤销快照：卡片状态 + 今日统计计数，供评分后单步回退
    lastRatingUndo = {
      id: id,
      card: JSON.parse(JSON.stringify(card(id))),
      dailyBefore: (DB.log && DB.log.daily && DB.log.daily[todayStr()]) || 0,
      detailBefore: (DB.log && DB.log.detail && DB.log.detail[todayStr()] && DB.log.detail[todayStr()][id]) || 0
    };
    applyRating(id, r);
    const afterM = mastery(id).pct;
    lastMasteryDelta = afterM - beforeM;
    markReviewed(id);
    bumpCount(wasNew ? 'n' : 'r');
    // 记录掌握度历史快照（每次评分后的掌握度，供「掌握度趋势图」）
    {
      const c = card(id);
      if (!Array.isArray(c.hist)) c.hist = [];
      c.hist.push({ t: Date.now(), m: afterM, ivl: c.ivl || 0 });
      if (c.hist.length > 60) c.hist = c.hist.slice(-60);
      c.lastR = Date.now();
      c.ivlR = c.ivl || 0;
    }
    frontier++;
    pendingAdvance = true;
    saveDB();
    saveSession();
    renderApp();
  }

  function undoLastRating() {
    if (!lastRatingUndo) return;
    const u = lastRatingUndo;
    lastRatingUndo = null;
    const id = u.id;
    DB.cards[id] = u.card;
    const t = todayStr();
    if (DB.log && DB.log.daily && typeof DB.log.daily[t] === 'number') {
      DB.log.daily[t] = Math.max(0, DB.log.daily[t] - 1);
    }
    if (DB.log && DB.log.detail && DB.log.detail[t] && typeof DB.log.detail[t][id] === 'number') {
      DB.log.detail[t][id] = Math.max(0, DB.log.detail[t][id] - 1);
    }
    if (frontier > 0) frontier--;
    pendingAdvance = false;
    saveDB();
    saveSession();
    renderApp();
  }

  // ---------------- 浏览视图 ----------------
  let browseCat = 'all';
  let browseQuery = '';
  let browseExpanded = {};
  let browseMastery = 'all';
  let browseStars = 'all';


  // ---------------- 错题模块 ----------------
  // 错题卡独立于知识卡：动手重做 → 看解析 → 按解题结果评分（不会/思路错/算错/会做对）。
  // 调度原则（用户确认 2026-09-09）：以 FSRS-6 为基础做探索性调整，与知识卡共享同一内核——
  //   ① 添加错题即视为「当天已遗忘」：按 FSRS 首评「忘记」初始化（D0(1)/S0(1)，lapses=1），
  //      直接进入复习队列、次日重现；无学习/重学步进、无毕业事件、无难题分类（旧设计残留已删）。
  //   ② 重做评分全部走标准 FSRS：「不会」=遗忘（次日重现）；「思路错/算错/会做对」=Hard/Good/Easy，
  //      间隔由稳定度计算——一直做对间隔大幅延长，卡片永不消失。
  //   ③「已稳固」仅是掌握度标识（稳定度 ≥ 目标 S，与知识卡「毕业」同义），无退出机制。

  function wrongCard(wid) { return (DB && DB.wrongs && DB.wrongs[wid]) || null; }

  // 添加错题：视为「当天已忘记」，按 FSRS 首评 Again 初始化，直接进入复习队列（次日重现）
  function initWrongAsLapsed(c) {
    c.state = 'review';
    c.step = 0; c.grad = 0; c.reps = 0; c.ivl = 1; // 下次复习即明天（间隔 1 天）
    c.diff = fsrsInitDifficulty(1);
    c.stab = fsrsInitStability(1);
    c.fsrsInit = 1;
    c.lapses = 1;
    c.due = dayStart(Date.now()) + DAY;
  }

  // 评分 → FSRS 档位（与知识卡四档一一对应）：0 不会=Again, 1 思路错=Hard, 2 算错=Good, 3 会做对=Easy
  // 错题卡永远处于复习态：「不会」走遗忘曲线更新后次日重现（不做同日重学步进），其余档走标准成功更新
  function applyRatingToWrongCard(c, rating) {
    if (c.state === 'new') { initWrongAsLapsed(c); return; } // 兜底：未初始化的卡视为刚添加
    const now = Date.now();
    const G = rating + 1;
    const daysSince = Math.max(0, (now - (c.lastR || c.due)) / DAY);
    const R = fsrsRetention(daysSince, c.stab);
    if (rating === 0) { // 不会：遗忘 → 稳定性下降、难度上升，次日重现
      c.lapses++;
      c.diff = fsrsDifficulty(c.diff, 1);
      c.stab = fsrsLapseStability(c.diff, c.stab, R);
      c.ivl = 1;
      c.state = 'review';
      c.due = dayStart(now) + DAY;
      return;
    }
    c.diff = fsrsDifficulty(c.diff, G);
    c.stab = fsrsSuccessStability(c.diff, c.stab, R, G);
    c.ivl = Math.max(1, Math.round(fsrsInterval(c.stab)));
    c.reps++; c.state = 'review'; c.due = dayStart(now) + c.ivl * DAY;
  }

  function isWrongGraduated(c) { return c.state === 'review' && (typeof c.stab === 'number' ? c.stab : 0) >= targetS(); }

  // 错题掌握度：稳定度到目标的比例（与知识卡一致，目标随选定日期变化）
  function wrongMastery(wid) {
    const c = wrongCard(wid);
    let score = 0;
    if (c && c.state !== 'new' && typeof c.stab === 'number' && c.stab > 0) {
      const sN = targetS();
      score = Math.round(100 * Math.max(0, Math.min(1, Math.log(1 + c.stab) / Math.log(1 + sN))));
    }
    let label;
    if (!c || c.state === 'new') label = '未做';
    else if (score < 25) label = '薄弱';
    else if (score < 65) label = '巩固中';
    else if (score < 85) label = '较稳';
    else label = '已稳固';
    return { pct: score, label: label };
  }

  function wrongNextText(w) {
    if (w.state === 'new') return '待做';
    return '下次 ' + fmtDayMs(w.due) + '（间隔 ' + w.ivl + ' 天）' + (isWrongGraduated(w) ? ' · ✔已稳固' : '');
  }

  // 错题失败（不会/思路错）→ 关联知识卡降级，提前重现补漏
  function demoteLinked(linkedIds) {
    if (!linkedIds || !linkedIds.length) return;
    const now = Date.now();
    linkedIds.forEach(function (id) {
      const c = card(id);
      if (!c || c.state === 'new') return;
      const R = fsrsRetention(Math.max(0, (now - (c.lastR || c.due)) / DAY), c.stab);
      c.diff = fsrsDifficulty(c.diff, 1);
      c.stab = fsrsLapseStability(c.diff, c.stab, R);
      c.lapses = (c.lapses || 0) + 1;
      c.step = 0;
      if (c.state === 'review') { c.state = 'relearning'; c.grad = 0; c.reps = 0; c.ivl = 0; }
      c.due = dayStart(now) + DAY;
    });
  }

  // —— 错题视图状态 ——
  let wrongDeck = [];
  let wrongFrontier = 0;
  let wrongExpanded = {};
  let wrongJumpId = null;

  function buildWrongSession() {
    const now = Date.now();
    const ids = Object.keys(DB.wrongs || {});
    const due = ids.filter(function (wid) {
      const c = DB.wrongs[wid];
      return c.state === 'review' && c.due <= now;
    });
    due.sort(function (a, b) { return DB.wrongs[a].due - DB.wrongs[b].due; });
    const fresh = shuffle(ids.filter(function (wid) { return DB.wrongs[wid].state === 'new'; }));
    wrongDeck = due.concat(fresh);
    wrongFrontier = 0;
  }

  function renderWrongLearn() {
    const app = document.getElementById('app');
    const total = Object.keys(DB.wrongs || {}).length;
    const tb = el('div', 'learn-top');
    tb.appendChild(el('span', 'muted', '共 ' + total + ' 道'));
    const add = el('button', 'btn small primary', '➕ 手动录入');
    add.addEventListener('click', openWrongInput);
    tb.appendChild(add);
    app.appendChild(tb);
    if (total === 0) {
      const wrap = el('div', 'center-card');
      wrap.appendChild(el('h2', null, '📕 错题本'));
      wrap.appendChild(el('p', 'muted', '还没有错题。在「浏览」页的真题处点「标记为错题」，即可把做错的题收进来，按记忆算法重现、重做、补漏。'));
      app.appendChild(wrap);
      return;
    }
    if (!wrongDeck.length) buildWrongSession();
    if (wrongFrontier >= wrongDeck.length) {
      const wrap = el('div', 'center-card');
      wrap.appendChild(el('h2', null, '🎉 错题本轮完成'));
      wrap.appendChild(el('p', 'muted', '本轮错题已做完——按排期到期的错题会自动重现。'));
      app.appendChild(wrap);
      return;
    }
    renderWrongCard(wrongDeck[wrongFrontier]);
  }

  function renderWrongCard(wid) {
    const app = document.getElementById('app');
    const w = DB.wrongs[wid];
    const wrap = el('div', 'learn-wrap');

    const top = el('div', 'learn-top');
    top.appendChild(el('span', 'badge', '📕 错题'));
    wrap.appendChild(top);

    const m = wrongMastery(wid);
    const meta = el('div', 'learn-meta');
    meta.appendChild(el('span', 'mastery-badge', m.label + ' ' + m.pct + '%'));
    const bar = el('div', 'mastery-bar');
    const fill = el('div', 'mastery-fill');
    fill.style.width = m.pct + '%';
    bar.appendChild(fill);
    meta.appendChild(bar);
    meta.appendChild(el('span', 'muted', wrongNextText(w)));
    wrap.appendChild(meta);

    const cardEl = el('div', 'card');
    const qBox = el('div', 'front');
    renderTex(qBox, w.q);
    cardEl.appendChild(qBox);

    const aBox = el('div', 'back hidden');
    renderTex(aBox, w.a);
    cardEl.appendChild(aBox);

    if (w.a2) {
      const a2b = el('div', 'wrong-a2 hidden');
      a2b.appendChild(el('div', 'mini-label', '💡 巧解'));
      const a2c = el('div', 'example-a');
      renderTex(a2c, w.a2);
      a2b.appendChild(a2c);
      cardEl.appendChild(a2b);
    }
    if (w.src) {
      cardEl.appendChild(el('div', 'wrong-src hidden', '📚 来源：' + w.src));
    }
    if (w.linked && w.linked.length) {
      const rb = el('div', 'rel-box');
      rb.appendChild(el('div', 'mini-label', '关联知识点'));
      w.linked.forEach(function (id) {
        const f = DATA.find(function (x) { return x.id === id; });
        if (!f) return;
        const chip = texEl('button', 'chip rel-chip', f.title);
        chip.setAttribute('data-action', 'jump');
        chip.setAttribute('data-arg', id);
        rb.appendChild(chip);
      });
      cardEl.appendChild(rb);
    }
    wrap.appendChild(cardEl);

    const controls = el('div', 'controls');
    const reveal = el('button', 'btn primary', '显示解析');
    reveal.setAttribute('data-action', 'wreveal');
    controls.appendChild(reveal);
    wrap.appendChild(controls);

    const rating = el('div', 'rating hidden');
    const mk = function (label, r) {
      const b = el('button', 'btn rate r' + r, label);
      b.setAttribute('data-action', 'wrate');
      b.setAttribute('data-arg', String(r));
      rating.appendChild(b);
    };
    mk('不会', 0);
    mk('思路错', 1);
    mk('算错', 2);
    mk('会做对', 3);
    const kbd = el('div', 'keyboard-hint muted', '1 不会 · 2 思路错 · 3 算错 · 4 会做对 · Space/Enter 显示解析');
    rating.appendChild(kbd);
    wrap.appendChild(rating);

    app.appendChild(wrap);
  }

  function revealWrong() {
    const app = document.getElementById('app');
    app.querySelector('.back').classList.remove('hidden');
    const a2 = app.querySelector('.wrong-a2');
    if (a2) a2.classList.remove('hidden');
    const src = app.querySelector('.wrong-src');
    if (src) src.classList.remove('hidden');
    app.querySelector('.controls').classList.add('hidden');
    app.querySelector('.rating').classList.remove('hidden');
  }

  function doWrongRate(r) {
    if (!wrongDeck.length || wrongFrontier >= wrongDeck.length) return;
    const wid = wrongDeck[wrongFrontier];
    const w = DB.wrongs[wid];
    applyRatingToWrongCard(w, r);
    if (r <= 1) demoteLinked(w.linked); // 不会/思路错 → 关联知识卡降级
    w.lastSolveMs = Date.now();
    if (!Array.isArray(w.hist)) w.hist = [];
    w.hist.push({ t: Date.now(), m: wrongMastery(wid).pct });
    if (w.hist.length > 60) w.hist = w.hist.slice(-60);
    w.lastR = Date.now();
    w.ivlR = w.ivl || 0;
    bumpCount('w');
    wrongFrontier++;
    saveDB();
    renderApp();
  }

  // 把一道真题/例题标记为错题（linked 为关联知识点 id）
  function markAsWrong(ex, linkedId) {
    if (!ex || !ex.q) return;
    // 查重：已有相同题目的错题则跳转，不重复添加
    const existing = Object.keys(DB.wrongs || {}).find(function (wid) {
      return (DB.wrongs[wid].q || '').trim() === (ex.q || '').trim();
    });
    if (existing) {
      currentModule = 'wrong';
      currentView = 'wrongBrowse';
      wrongJumpId = existing;
      renderApp();
      toast('已在错题本中，已为你定位');
      return;
    }
    const id = 'wp_' + Date.now() + '_' + Math.floor(Math.random() * 10000);
    const w = defaultWrongCard();
    w.kind = '错题';
    w.q = ex.q; w.a = ex.a; w.a2 = ex.a2 || ''; w.src = ex.src || '';
    if (linkedId) w.linked = [linkedId];
    initWrongAsLapsed(w); // 视为当天已忘记，次日进入重做队列
    DB.wrongs[id] = w;
    saveDB();
    toast('已加入错题本');
  }

  function deleteWrongCard(wid) {
    if (!confirm('确定删除这道错题吗？（不可恢复）')) return;
    delete DB.wrongs[wid];
    saveDB();
    wrongDeck = [];
    renderApp();
    toast('已删除错题');
  }

  function renderWrongBrowse() {
    const app = document.getElementById('app');
    const ids = Object.keys(DB.wrongs || {});
    const tb = el('div', 'learn-top');
    tb.appendChild(el('span', 'muted', '共 ' + ids.length + ' 道'));
    const add = el('button', 'btn small primary', '➕ 手动录入');
    add.addEventListener('click', openWrongInput);
    tb.appendChild(add);
    app.appendChild(tb);

    if (!ids.length) {
      const wrap = el('div', 'center-card');
      wrap.appendChild(el('h2', null, '📕 错题本'));
      wrap.appendChild(illus('empty-wrong'));
      wrap.appendChild(el('p', 'muted', '还没有错题。可在「知识卡·浏览」页的真题处标记，或点上方「手动录入」。'));
      app.appendChild(wrap);
      return;
    }

    const list = el('div', 'browse-list');
    ids.forEach(function (wid) {
      const w = DB.wrongs[wid];
      const m = wrongMastery(wid);
      const item = el('div', 'browse-item');
      item.setAttribute('data-wrong', wid);
      const head = el('button', 'browse-item-head');
      head.setAttribute('data-action', 'wtoggle');
      head.setAttribute('data-arg', wid);
      const left = el('div', 'browse-title');
      left.appendChild(el('span', 'badge', '📕 错题'));
      left.appendChild(texEl('span', 'browse-name', w.q));
      const mark = el('span', 'browse-state');
      mark.textContent = m.label + ' ' + m.pct + '%';
      left.appendChild(mark);
      head.appendChild(left);
      item.appendChild(head);
      const bar = el('div', 'mastery-bar');
      const fill = el('div', 'mastery-fill');
      fill.style.width = m.pct + '%';
      bar.appendChild(fill);
      item.appendChild(bar);
      if (wrongExpanded[wid]) {
        const body = el('div', 'browse-body');
        const a = el('div', 'browse-a');
        a.appendChild(el('div', 'mini-label', '解析'));
        const ab = el('div');
        renderTex(ab, w.a);
        a.appendChild(ab);
        body.appendChild(a);
        if (w.a2) {
          const a2b = el('div', 'browse-a');
          a2b.appendChild(el('div', 'mini-label', '💡 巧解'));
          renderTex(a2b, w.a2);
          body.appendChild(a2b);
        }
        if (w.src) body.appendChild(el('p', 'muted', '📚 来源：' + w.src));
        if (w.linked && w.linked.length) {
          const rb = el('div', 'rel-box');
          rb.appendChild(el('div', 'mini-label', '关联知识点'));
          w.linked.forEach(function (id) {
            const f = DATA.find(function (x) { return x.id === id; });
            if (!f) return;
            const chip = texEl('button', 'chip rel-chip', f.title);
            chip.setAttribute('data-action', 'jump');
            chip.setAttribute('data-arg', id);
            rb.appendChild(chip);
          });
          body.appendChild(rb);
        }
        const del = el('button', 'btn small danger', '删除此题');
        del.addEventListener('click', function () { deleteWrongCard(wid); });
        body.appendChild(del);
        item.appendChild(body);
      }
      list.appendChild(item);
    });
    app.appendChild(list);

    if (wrongJumpId) {
      const target = list.querySelector('[data-wrong="' + wrongJumpId + '"]');
      if (target) {
        wrongExpanded[wrongJumpId] = true;
        const headBtn = target.querySelector('.browse-item-head');
        if (headBtn) {
          headBtn.classList.add('flash');
          target.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }
      wrongJumpId = null;
    }
  }

  function renderWrongStats() {
    const app = document.getElementById('app');
    const wrap = el('div', 'principles-wrap');
    wrap.appendChild(el('h2', null, '📊 错题统计'));

    const ids = Object.keys(DB.wrongs || {});
    if (!ids.length) {
      wrap.appendChild(el('p', 'muted', '还没有错题。'));
      app.appendChild(wrap);
      return;
    }

    let due = 0, fresh = 0, review = 0, grad = 0, pctSum = 0, lapses = 0;
    ids.forEach(function (wid) {
      const w = DB.wrongs[wid];
      pctSum += wrongMastery(wid).pct;
      lapses += (w.lapses || 0);
      if (w.state === 'new') fresh++;
      else { review++; if (isWrongGraduated(w)) grad++; }
      if (w.state === 'review' && w.due <= Date.now()) due++;
    });
    const avg = Math.round(pctSum / ids.length);

    const ov = el('div', 'stat-overview');
    const kpi = function (label, val) { const c = el('div', 'stat-kpi'); c.appendChild(el('strong', null, String(val))); c.appendChild(el('span', 'muted', label)); ov.appendChild(c); };
    kpi('总错题', ids.length);
    kpi('待重做', due);
    kpi('已稳固', grad);
    kpi('平均掌握', avg + '%');
    kpi('累计遗忘', lapses);
    wrap.appendChild(ov);

    wrap.appendChild(el('h3', null, '📌 状态分布'));
    const sd = el('div', 'stat-card');
    [['未做', fresh], ['复习中', review], ['已稳固', grad]].forEach(function (p) {
      const row = el('div', 'cat-bar-row');
      row.appendChild(el('span', 'cat-bar-name', p[0]));
      const bar = el('div', 'cat-bar');
      const fill = el('div', 'cat-bar-fill');
      fill.style.width = Math.round(p[1] / ids.length * 100) + '%';
      fill.style.background = p[0] === '已稳固' ? '#2A75C0' : '#B5D4F4';
      bar.appendChild(fill);
      row.appendChild(bar);
      row.appendChild(el('span', 'cat-bar-val', p[1] + ' 道'));
      sd.appendChild(row);
    });
    wrap.appendChild(sd);

    wrap.appendChild(el('h3', null, '💪 掌握度分布'));
    const dist = {};
    ids.forEach(function (wid) { const l = wrongMastery(wid).label; dist[l] = (dist[l] || 0) + 1; });
    const dd = el('div', 'stat-card');
    ['未做', '薄弱', '巩固中', '较稳', '已稳固'].forEach(function (l) {
      if (dist[l] == null) return;
      const row = el('div', 'cat-bar-row');
      row.appendChild(el('span', 'cat-bar-name', l));
      const bar = el('div', 'cat-bar');
      const fill = el('div', 'cat-bar-fill');
      fill.style.width = Math.round(dist[l] / ids.length * 100) + '%';
      fill.style.background = masteryColor(dist[l] ? 70 : 10);
      bar.appendChild(fill);
      row.appendChild(bar);
      row.appendChild(el('span', 'cat-bar-val', dist[l] + ' 道'));
      dd.appendChild(row);
    });
    wrap.appendChild(dd);

    app.appendChild(wrap);
  }

  // —— 手动录入错题 ——
  let wrongInput = null; // { q, a, a2, src, linked: [] }

  function wrongField(label, input) {
    const box = el('div', 'wrong-field');
    box.appendChild(el('span', 'mini-label', label));
    box.appendChild(input);
    return box;
  }

  function openWrongInput() {
    wrongInput = { linked: [] };
    const modal = el('div', 'map-modal');
    const backdrop = el('div', 'map-modal-backdrop');
    backdrop.addEventListener('click', closeWrongInput);
    modal.appendChild(backdrop);

    const cardBox = el('div', 'map-modal-card wrong-input-card');
    cardBox.appendChild(el('h3', null, '➕ 手动录入错题'));

    const q = el('textarea', 'wrong-input');
    q.placeholder = '题目（必填）…';
    cardBox.appendChild(wrongField('题目', q));

    const a = el('textarea', 'wrong-input');
    a.placeholder = '解析（必填）…';
    cardBox.appendChild(wrongField('解析', a));

    const a2 = el('textarea', 'wrong-input');
    a2.placeholder = '💡 巧解（可选）…';
    cardBox.appendChild(wrongField('巧解', a2));

    const src = el('input', 'wrong-input');
    src.type = 'text';
    src.placeholder = '来源（可选，如：2023 数三真题）…';
    cardBox.appendChild(wrongField('来源', src));

    const linkedBox = el('div', 'wrong-field');
    linkedBox.appendChild(el('span', 'mini-label', '关联知识点（可选）'));
    const search = el('input', 'search');
    search.type = 'search';
    search.placeholder = '搜索知识点名称…';
    const results = el('div', 'wrong-results');
    search.addEventListener('input', function () { renderWrongLinkedResults(search.value, results); });
    linkedBox.appendChild(search);
    linkedBox.appendChild(results);
    cardBox.appendChild(linkedBox);

    const btns = el('div', 'wrong-input-btns');
    const save = el('button', 'btn primary', '保存到错题本');
    save.addEventListener('click', function () { saveWrongInput(q.value, a.value, a2.value, src.value); });
    const cancel = el('button', 'btn', '取消');
    cancel.addEventListener('click', closeWrongInput);
    btns.appendChild(save);
    btns.appendChild(cancel);
    cardBox.appendChild(btns);

    wrongInput.q = q; wrongInput.a = a; wrongInput.a2 = a2; wrongInput.src = src; wrongInput.search = search;

    modal.appendChild(cardBox);
    document.body.appendChild(modal);
  }

  function renderWrongLinkedResults(query, container) {
    container.innerHTML = '';
    const q = query.trim().toLowerCase();
    if (!q) return;
    DATA.filter(function (f) {
      return (f.title + ' ' + f.front).toLowerCase().indexOf(q) !== -1;
    }).slice(0, 12).forEach(function (f) {
      const on = wrongInput.linked.indexOf(f.id) !== -1;
      const chip = el('button', 'chip' + (on ? ' active' : ''), f.title);
      chip.addEventListener('click', function () {
        const idx = wrongInput.linked.indexOf(f.id);
        if (idx >= 0) wrongInput.linked.splice(idx, 1); else wrongInput.linked.push(f.id);
        chip.classList.toggle('active');
      });
      container.appendChild(chip);
    });
  }

  function saveWrongInput(q, a, a2, src) {
    if (!q.trim() || !a.trim()) { toast('题目与解析不能为空'); return; }
    const id = 'wp_' + Date.now() + '_' + Math.floor(Math.random() * 10000);
    const w = defaultWrongCard();
    w.kind = '错题';
    w.q = q.trim(); w.a = a.trim(); w.a2 = a2.trim(); w.src = src.trim();
    w.linked = wrongInput.linked.slice();
    initWrongAsLapsed(w); // 视为当天已忘记，次日进入重做队列
    DB.wrongs[id] = w;
    saveDB();
    closeWrongInput();
    wrongDeck = [];
    renderApp();
    toast('已保存到错题本');
  }

  function closeWrongInput() {
    const m = document.querySelector('.map-modal');
    if (m) m.remove();
    wrongInput = null;
  }


  function renderBrowse() {
    const app = document.getElementById('app');

    const head = el('div', 'browse-head');
    const search = el('input', 'search');
    search.type = 'search';
    search.placeholder = subjKind() === 'qa' ? '搜索知识点（名称 / 内容）…' : '搜索公式（名称 / 内容）…';
    search.value = browseQuery;
    // 输入时只重绘列表，不重建整个视图（避免销毁搜索框导致输入/IME 被打断）；
    // 150ms 防抖：停止输入后才做全量过滤 + 重建列表，逐键不再卡顿
    let searchTimer = null;
    search.addEventListener('input', function () {
      browseQuery = search.value;
      clearTimeout(searchTimer);
      searchTimer = setTimeout(function () {
        const old = app.querySelector('.browse-list');
        if (old) old.replaceWith(buildBrowseList());
      }, 150);
    });
    head.appendChild(search);
    app.appendChild(head);

    const chips = el('div', 'chips');
    const allChip = el('button', 'chip' + (browseCat === 'all' ? ' active' : ''), '全部');
    allChip.setAttribute('data-action', 'bcat');
    allChip.setAttribute('data-arg', 'all');
    chips.appendChild(allChip);
    catOrder().forEach(function (k) {
      const b = el('button', 'chip' + (browseCat === k ? ' active' : ''), CATS[k]);
      b.setAttribute('data-action', 'bcat');
      b.setAttribute('data-arg', k);
      chips.appendChild(b);
    });
    app.appendChild(chips);

    const chipsM = el('div', 'chips');
    chipsM.appendChild(el('span', 'filter-label', '掌握'));
    ['all', '未学', '初学', '生疏', '巩固中', '已掌握', '熟练', '稳固', '毕业'].forEach(function (v) {
      const b = el('button', 'chip' + (browseMastery === v ? ' active' : ''), v === 'all' ? '全部' : v);
      b.setAttribute('data-action', 'bmastery');
      b.setAttribute('data-arg', v);
      chipsM.appendChild(b);
    });
    app.appendChild(chipsM);

    const chipsS = el('div', 'chips');
    chipsS.appendChild(el('span', 'filter-label', '重要'));
    ['all', '1', '2', '3', '4', '5'].forEach(function (v) {
      const b = el('button', 'chip' + (browseStars === v ? ' active' : ''), v === 'all' ? '全部' : v + '★');
      b.setAttribute('data-action', 'bstars');
      b.setAttribute('data-arg', v);
      chipsS.appendChild(b);
    });
    app.appendChild(chipsS);

    app.appendChild(buildBrowseList());
  }

  // 构建浏览列表（独立函数，供搜索输入时局部重绘，避免整页重建打断输入）
  function buildBrowseList() {
    const list = el('div', 'browse-list');
    let n = 0;
    DATA.forEach(function (f) {
      if (browseCat !== 'all' && f.cat !== browseCat) return;
      if (browseMastery !== 'all' && mastery(f.id).label !== browseMastery) return;
      if (browseStars !== 'all' && String(metaOf(f.id)[0]) !== browseStars) return;
      if (browseQuery) {
        const hay = (f.title + ' ' + f.front + ' ' + f.back).toLowerCase();
        if (hay.indexOf(browseQuery.trim().toLowerCase()) === -1) return;
      }
      n++;
      list.appendChild(browseItem(f));
    });
    if (n === 0) { list.appendChild(illus('empty-search')); list.appendChild(el('p', 'muted', subjKind() === 'qa' ? '没有匹配的知识点。' : '没有匹配的公式。')); }
    return list;
  }

  function browseItem(f) {
    const item = el('div', 'browse-item');
    item.setAttribute('data-card', f.id);
    const head = el('button', 'browse-item-head');
    head.setAttribute('data-action', 'btoggle');
    head.setAttribute('data-arg', f.id);
    const left = el('div', 'browse-title');
    left.appendChild(el('span', 'badge', CATS[f.cat]));
    left.appendChild(texEl('span', 'browse-name', f.title));
    left.appendChild(el('span', 'star-badge small', starText(metaOf(f.id)[0])));
    const m = mastery(f.id);
    const mark = el('span', 'browse-state');
    mark.textContent = m.label + ' ' + m.pct + '%';
    left.appendChild(mark);
    head.appendChild(left);
    item.appendChild(head);

    const bar = el('div', 'mastery-bar');
    const fill = el('div', 'mastery-fill');
    fill.style.width = m.pct + '%';
    bar.appendChild(fill);
    item.appendChild(bar);

    if (browseExpanded[f.id]) {
      const body = el('div', 'browse-body');
      const q = el('div', 'browse-q');
      q.appendChild(el('div', 'mini-label', '提示'));
      const qb = el('div');
      renderTex(qb, f.front);
      q.appendChild(qb);
      body.appendChild(q);
      const a = el('div', 'browse-a');
      a.appendChild(el('div', 'mini-label', '答案'));
      const ab = el('div');
      renderTex(ab, f.back);
      a.appendChild(ab);
      const ub = el('div', 'use-box');
      ub.appendChild(el('span', 'use-label', subjKind() === 'qa' ? '📌 考查方式：' : '📌 常考题型：'));
      ub.appendChild(el('span', null, metaOf(f.id)[1]));
      a.appendChild(ub);
      body.appendChild(a);
      const mn = mnemOf(f.id);
      if (mn) {
        const mb = el('div', 'mnem-box');
        mb.appendChild(el('span', 'mnem-label', '🗝️ 助记：'));
        mb.appendChild(texEl('span', null, mn));
        body.appendChild(mb);
      }
      const pf = pitfallOf(f.id);
      if (pf) {
        const pfb = el('div', 'pitfall-box');
        pfb.appendChild(el('span', 'pitfall-label', '⚠️ 常见陷阱：'));
        pfb.appendChild(texEl('span', null, pf));
        body.appendChild(pfb);
      }
      // 笔记模块置于真题/相关知识点模块之前（与学习页一致）
      const notesBox = el('div', 'notes-box');
      notesBox.appendChild(el('div', 'mini-label', '📝 我的笔记（感想 / 补充 / 易错点）'));
      const notes = el('textarea', 'card-notes');
      notes.placeholder = '在这里记录你的理解、补充或易错点…';
      notes.value = card(f.id).notes || '';
      let notesTimer;
      notes.addEventListener('input', function () {
        card(f.id).notes = notes.value;
        clearTimeout(notesTimer);
        notesTimer = setTimeout(saveDB, 400);
      });
      notesBox.appendChild(notes);
      body.appendChild(notesBox);
      const extras = buildExtras(f.id, '');
      if (extras) body.appendChild(extras);
      body.appendChild(memoryBox(f.id));
      const edit = el('button', 'btn small', '✏️ 编辑');
      edit.addEventListener('click', function () { openCardEdit(f.id); });
      body.appendChild(edit);
      const reset = el('button', 'btn small danger', '重置此卡片进度');
      reset.setAttribute('data-action', 'resetcard');
      reset.setAttribute('data-arg', f.id);
      body.appendChild(reset);
      item.appendChild(body);
    }
    return item;
  }

  // ---------------- 自测视图 ----------------
  function renderQuiz() {
    const app = document.getElementById('app');
    if (!quiz) {
      const wrap = el('div', 'center-card');
      wrap.appendChild(el('h2', null, '📝 随机自测'));
      wrap.appendChild(el('p', 'muted', subjKind() === 'qa'
        ? '每次随机抽取 10 道题：给出内容，选择它的名称。用来检验你是否真正「认得」这些知识点。'
        : '每次随机抽取 10 道题：给出公式，选择它的名称。用来检验你是否真正「认得」公式。'));
      const b = el('button', 'btn primary', '开始自测');
      b.setAttribute('data-action', 'qstart');
      wrap.appendChild(b);
      app.appendChild(wrap);
      return;
    }
    if (quiz.idx >= quiz.qs.length) {
      renderQuizResult();
      return;
    }
    renderQuizQuestion();
  }

  function renderQuizQuestion() {
    const app = document.getElementById('app');
    const q = quiz.qs[quiz.idx];
    const wrap = el('div', 'quiz-wrap');

    const top = el('div', 'learn-top');
    top.appendChild(el('span', 'muted', '第 ' + (quiz.idx + 1) + ' / ' + quiz.qs.length + ' 题'));
    top.appendChild(el('span', 'badge', '得分 ' + quiz.score));
    wrap.appendChild(top);

    const cardEl = el('div', 'card');
    const label = el('div', 'mini-label', subjKind() === 'qa' ? '这个知识点叫什么？' : '这个公式叫什么？');
    cardEl.appendChild(label);
    const fb = el('div', 'front');
    renderTex(fb, q.card.back);
    cardEl.appendChild(fb);
    wrap.appendChild(cardEl);

    const opts = el('div', 'quiz-opts');
    q.opts.forEach(function (oid) {
      const of = DATA.find(function (x) { return x.id === oid; });
      const b = texEl('button', 'btn quiz-opt', of.title);
      b.setAttribute('data-action', 'qanswer');
      b.setAttribute('data-arg', oid);
      opts.appendChild(b);
    });
    wrap.appendChild(opts);

    app.appendChild(wrap);
  }

  function doQuizAnswer(oid) {
    const q = quiz.qs[quiz.idx];
    const correct = oid === q.card.id;
    if (correct) quiz.score++;
    // 高亮反馈
    const opts = document.querySelectorAll('.quiz-opt');
    opts.forEach(function (b) {
      b.disabled = true;
      if (b.getAttribute('data-arg') === q.card.id) b.classList.add('correct');
      else if (b.getAttribute('data-arg') === oid) b.classList.add('wrong');
    });
    const wrap = document.querySelector('.quiz-wrap');
    const fb = el('div', 'quiz-fb' + (correct ? ' ok' : ' no'));
    fb.textContent = correct ? '✅ 正确' : '❌ 错误';
    wrap.appendChild(fb);
    const next = el('button', 'btn primary', quiz.idx + 1 >= quiz.qs.length ? '查看结果' : '下一题');
    next.setAttribute('data-action', 'qnext');
    wrap.appendChild(next);
  }

  function renderQuizResult() {
    const app = document.getElementById('app');
    const wrap = el('div', 'center-card');
    wrap.appendChild(el('h2', null, '测验完成'));
    wrap.appendChild(el('p', 'big-score', quiz.score + ' / ' + quiz.qs.length));
    const again = el('button', 'btn primary', '再来一组');
    again.setAttribute('data-action', 'qstart');
    wrap.appendChild(again);
    app.appendChild(wrap);
  }

  function startQuiz() {
    const picked = shuffle(DATA.slice()).slice(0, Math.min(10, DATA.length));
    quiz = {
      qs: picked.map(function (p) {
        const others = shuffle(DATA.filter(function (f) { return f.id !== p.id; })).slice(0, 3);
        return { card: p, opts: shuffle([p].concat(others)).map(function (o) { return o.id; }) };
      }),
      idx: 0,
      score: 0
    };
    renderApp();
  }

  // ---------------- 设置视图 ----------------

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
    const mkSyncBtn = function (label, mode) {
      const b = el('button', 'btn', label);
      b.addEventListener('click', function () {
        if (!syncReady()) { toast('请先填写 Token 与仓库并验证'); return; }
        b.disabled = true;
        toast('同步中…');
        runSync(mode).then(function (summary) {
          let msg = '同步完成：上传 ' + summary.pushed.length + ' 科，下载 ' + summary.pulled.length + ' 科';
          if (summary.failed.length) msg += '，失败：' + summary.failed[0];
          toast(msg);
          renderApp();
        }).catch(function (err) {
          toast('同步失败：' + (err.message || err));
        }).finally(function () { b.disabled = false; });
      });
      return b;
    };
    sSyncBtns.appendChild(mkSyncBtn('立即同步', 'auto'));
    sSyncBtns.appendChild(mkSyncBtn('强制上传本地', 'push'));
    sSyncBtns.appendChild(mkSyncBtn('强制下载云端', 'pull'));
    wrap.appendChild(sSyncBtns);
    const last = scfg.lastSyncAt
      ? ('上次同步：' + new Date(scfg.lastSyncAt).toLocaleString() + '（上传 ' + (scfg.lastSyncSummary ? scfg.lastSyncSummary.pushed : 0) + ' / 下载 ' + (scfg.lastSyncSummary ? scfg.lastSyncSummary.pulled : 0) + ' 科）' + (scfg.lastError ? '——上次错误：' + scfg.lastError : ''))
      : '尚未同步过。';
    wrap.appendChild(el('p', 'muted', last));
    wrap.appendChild(el('p', 'muted', '准备步骤：① 在 GitHub 新建一个【私有】仓库；② 创建 Fine-grained Token，仅勾选该仓库、权限 Contents: Read and write；③ 填入上方并「保存并验证」。同步把四科整库快照存入仓库 athena-sync/ 目录，时间戳新者胜，任何覆盖前自动归档被覆盖版本到 archive/（等价版本历史）。数据为明文 JSON，请确保仓库为私有。'));

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

  function snapshotMastery() {
    if (!DB || !DATA) return;
    const t = todayStr();
    if (!DB.log.mastery) DB.log.mastery = {};
    if (DB.log.mastery[t] == null) {
      const s = stats();
      DB.log.mastery[t] = s.avg;
      if (!DB.log.metrics) DB.log.metrics = {};
      DB.log.metrics[t] = {
        avg: s.avg,                 // 平均掌握度（存储强度）
        avgR: avgCurrentR(),        // 平均当前可提取性 R
        due: s.due,                 // 待复习
        grad: graduatedCount(),     // 毕业卡数
        lapses: totalLapses(),      // 累计遗忘
        newCt: s.fresh, learn: s.learn, review: s.review,
        total: DATA.length
      };
      saveDB();
    }
  }

  // 统计页折线图（从每日 metrics 快照画一条趋势线，含图例/最新值）
  function sparkTrend(title, items, color, unit, fixedMax) {
    const box = el('div', 'stat-card');
    const head = el('div', 'trend-head');
    head.appendChild(el('strong', null, title));
    if (items.length) head.appendChild(el('span', 'trend-latest muted', '最新 ' + items[items.length - 1].value + (unit || '')));
    box.appendChild(head);
    if (items.length < 2) { box.appendChild(illus('stats-growing')); box.appendChild(el('p', 'muted', '数据积累中——每天打开应用记录一次，几天后显示趋势。')); return box; }
    const W = 680, H = 150, pad = 30;
    const vals = items.map(function (i) { return i.value; });
    let mn = (fixedMax != null) ? 0 : Math.min.apply(null, vals);
    let mx = (fixedMax != null) ? fixedMax : Math.max.apply(null, vals);
    if (mx - mn < 1e-6) { mn -= 1; mx += 1; }
    const svg = svgEl('svg', { viewBox: '0 0 ' + W + ' ' + H, width: '100%' });
    [mn, (mn + mx) / 2, mx].forEach(function (v) {
      const y = H - pad - (v - mn) / (mx - mn) * (H - 2 * pad);
      svg.appendChild(svgEl('line', { x1: pad, x2: W - pad, y1: y, y2: y, stroke: '#E7E4DD', 'stroke-width': '1' }));
      svg.appendChild(svgText('text', pad - 4, y + 3, String(Math.round(v)), { 'text-anchor': 'end' }));
    });
    const pts = items.map(function (i, idx) {
      return [pad + idx * (W - 2 * pad) / (items.length - 1), H - pad - (i.value - mn) / (mx - mn) * (H - 2 * pad)];
    });
    svg.appendChild(svgEl('path', { d: 'M ' + pts.map(function (p) { return p[0] + ' ' + p[1]; }).join(' L '), fill: 'none', stroke: color, 'stroke-width': '2' }));
    pts.forEach(function (p) { svg.appendChild(svgEl('circle', { cx: p[0], cy: p[1], r: '2.5', fill: color })); });
    const li = [0, Math.floor((items.length - 1) / 2), items.length - 1];
    li.forEach(function (idx, j) {
      const x = pts[idx][0];
      svg.appendChild(svgText('text', x, H - 4, items[idx].label, j === li.length - 1 ? { 'text-anchor': 'end' } : (j === 0 ? {} : { 'text-anchor': 'middle' })));
    });
    box.appendChild(svg);
    return box;
  }

  // ---------------- 学习报告（日/周/月/年聚合） ----------------
  let reportPeriod = 'day'; // 会话内状态，不持久化
  const REPORT_PERIODS = [['day', '日报'], ['week', '周报'], ['month', '月报'], ['year', '年报']];
  const REPORT_DAYS = { day: 1, week: 7, month: 30, year: 365 };

  function fmtStudyMs(ms) {
    const min = Math.round(ms / 60000);
    if (min < 1) return '0 分钟';
    if (min < 60) return min + ' 分钟';
    return Math.floor(min / 60) + ' 小时 ' + (min % 60) + ' 分';
  }

  function renderStudyReport() {
    const box = el('div', 'stat-card');
    const chips = el('div', 'chips');
    REPORT_PERIODS.forEach(function (p) {
      const b = el('button', 'chip' + (reportPeriod === p[0] ? ' active' : ''), p[1]);
      b.addEventListener('click', function () { reportPeriod = p[0]; renderApp(); });
      chips.appendChild(b);
    });
    box.appendChild(chips);

    const days = REPORT_DAYS[reportPeriod];
    const counts = (DB.log && DB.log.counts) || {};
    const study = (DB.log && DB.log.studyTime) || {};
    const daily = (DB.log && DB.log.daily) || {};
    const masteryLog = (DB.log && DB.log.mastery) || {};

    let studyMs = 0, n = 0, r = 0, w = 0, activeDays = 0;
    for (let i = 0; i < days; i++) {
      const d = new Date(); d.setDate(d.getDate() - i);
      const key = fmtDate(d);
      const st = study[key] || 0;
      const c = counts[key];
      if (st > 0 || (daily[key] || 0) > 0 || c) activeDays++;
      studyMs += st;
      if (c) { n += (c.n || 0); r += (c.r || 0); w += (c.w || 0); }
    }

    // 掌握度变化：今日 vs 窗口起点前最近一次快照（日报即「vs 昨天」，最多回看 30 天）
    const cur = (masteryLog[todayStr()] != null) ? masteryLog[todayStr()] : stats().avg;
    let base = null;
    const lookback = (reportPeriod === 'day') ? 1 : days - 1;
    for (let i = lookback; i <= days + 30; i++) {
      const d = new Date(); d.setDate(d.getDate() - i);
      const k = fmtDate(d);
      if (masteryLog[k] != null) { base = masteryLog[k]; break; }
    }
    const deltaTxt = (base == null) ? '—' : ((cur - base >= 0 ? '+' : '') + (cur - base) + '%');

    const ov = el('div', 'stat-overview');
    const kpi = function (label, val, unit) { const c = el('div', 'stat-kpi'); c.appendChild(el('strong', null, String(val))); c.appendChild(el('span', 'muted', label + (unit || ''))); ov.appendChild(c); };
    kpi('专注时长', fmtStudyMs(studyMs), '');
    kpi('新学', n, ' 张');
    kpi('复习', r, ' 张');
    kpi('错题重做', w, ' 道');
    kpi('学习天数', activeDays + '/' + days, '');
    kpi('掌握度变化', deltaTxt, '');
    box.appendChild(ov);
    box.appendChild(el('p', 'muted', '窗口：近 ' + days + ' 天。学习时长自 v1.16.0、新学/复习/错题分类计数自 v1.17.0 起记录，更早时段的聚合不完整。'));
    return box;
  }

  function renderStatistics() {
    const app = document.getElementById('app');
    const wrap = el('div', 'principles-wrap');
    wrap.appendChild(el('h2', null, '📈 学习统计'));

    // —— 总览 ——
    const s = stats();
    const sc = stateCounts();
    const ov = el('div', 'stat-overview');
    const kpi = function (label, val, unit) { const c = el('div', 'stat-kpi'); c.appendChild(el('strong', null, String(val))); c.appendChild(el('span', 'muted', label + (unit || ''))); ov.appendChild(c); };
    kpi('总卡片', s.total, '');
    kpi('已毕业', sc.grad, '');
    kpi('待复习', s.due, '');
    kpi('平均掌握(存储)', s.avg, '%');
    kpi('平均可提取 R', avgCurrentR(), '%');
    kpi('累计遗忘', totalLapses(), '');
    wrap.appendChild(ov);

    // —— 学习报告（日/周/月/年聚合）——
    wrap.appendChild(el('h3', null, '📋 学习报告'));
    wrap.appendChild(renderStudyReport());

    wrap.appendChild(el('h3', null, '🔥 学习日历（近 16 周）'));
    const daily = (DB.log && DB.log.daily) || {};
    const detailLog = (DB.log && DB.log.detail) || {};
    const weeks = 16, total = weeks * 7;
    const start = new Date(); start.setDate(start.getDate() - (total - 1));
    const grid = el('div', 'heatmap-grid');
    grid.style.gridTemplateColumns = 'repeat(' + weeks + ', 12px)';
    for (let d = 0; d < total; d++) {
      const date = new Date(start); date.setDate(start.getDate() + d);
      const key = fmtDate(date), cnt = daily[key] || 0;
      const cell = el('div', 'heat-cell');
      cell.title = key + '：' + cnt + ' 张' + (cnt > 0 ? '（点击查看当日明细）' : '');
      cell.className += cnt >= 8 ? ' l4' : cnt >= 5 ? ' l3' : cnt >= 2 ? ' l2' : cnt > 0 ? ' l1' : ' l0';
      if (cnt > 0) {
        cell.classList.add('clickable');
        cell.setAttribute('data-action', 'heatdate');
        cell.setAttribute('data-arg', key);
      }
      if (heatSel === key) cell.classList.add('sel');
      grid.appendChild(cell);
    }
    const hb = el('div', 'stat-card'); hb.appendChild(grid);
    hb.appendChild(el('p', 'muted', '颜色越深，当天学习张数越多；点击有记录的格子可查看当日明细。'));
    wrap.appendChild(hb);

    if (heatSel) {
      const selCnt = daily[heatSel] || 0;
      const det = el('div', 'stat-card heat-detail');
      const dhead = el('div', 'heat-detail-head');
      dhead.appendChild(el('strong', null, '📅 ' + heatSel + ' · 共复习 ' + selCnt + ' 张'));
      const dclose = el('button', 'btn small', '关闭');
      dclose.setAttribute('data-action', 'heatclose');
      dhead.appendChild(dclose);
      det.appendChild(dhead);
      const detail = detailLog[heatSel] || {};
      const ids = Object.keys(detail).filter(function (id) { return DATA.some(function (f) { return f.id === id; }); });
      if (ids.length) {
        ids.sort(function (a, b) { return detail[b] - detail[a]; });
        const list = el('div', 'heat-detail-list');
        ids.forEach(function (id) {
          const f = DATA.find(function (x) { return x.id === id; });
          const row = texEl('button', 'chip heat-item', f.title + ' ×' + detail[id]);
          row.setAttribute('data-action', 'jump');
          row.setAttribute('data-arg', id);
          list.appendChild(row);
        });
        det.appendChild(list);
        det.appendChild(el('p', 'muted', '点击知识点可跳转到浏览页查看完整卡片。'));
      } else {
        det.appendChild(el('p', 'muted', '当天复习 ' + selCnt + ' 张。单卡明细从本次更新后开始记录，历史日期的明细暂未保留。'));
      }
      wrap.appendChild(det);
    }

    // —— 记忆算法关键指标趋势（每日快照 DB.log.metrics）——
    wrap.appendChild(el('h3', null, '🧠 记忆算法关键指标趋势（每日）'));
    const metrics = (DB.log && DB.log.metrics) || {};
    const mKeys = Object.keys(metrics).sort();
    const mSeries = function (f) { return mKeys.map(function (k) { return { label: k, value: metrics[k][f] }; }); };
    const tg = el('div', 'trend-grid');
    tg.appendChild(sparkTrend('平均掌握度（存储强度·%）', mSeries('avg'), '#378ADD', '%', 100));
    tg.appendChild(sparkTrend('平均可提取性 R（%）', mSeries('avgR'), '#B5D4F4', '%', 100));
    tg.appendChild(sparkTrend('待复习数量', mSeries('due'), '#D4537E', ''));
    tg.appendChild(sparkTrend('已毕业卡数', mSeries('grad'), '#2A75C0', ''));
    tg.appendChild(sparkTrend('累计遗忘次数', mSeries('lapses'), '#E24B4A', ''));
    tg.appendChild(sparkTrend('学习中新卡', mSeries('learn'), '#76AFE8', ''));
    wrap.appendChild(tg);
    wrap.appendChild(el('p', 'muted', '每天打开应用自动记录一次上述指标（掌握度按存储强度、可提取性 R 按当前回忆概率），积累几天后即可看趋势。'));

    // —— 记忆状态分布 ——
    wrap.appendChild(el('h3', null, '📌 记忆状态分布'));
    const sd = el('div', 'stat-card');
    [['新卡', sc.fresh], ['学习中', sc.learn], ['复习中', sc.review], ['已毕业', sc.grad]].forEach(function (p) {
      const row = el('div', 'cat-bar-row');
      row.appendChild(el('span', 'cat-bar-name', p[0]));
      const bar = el('div', 'cat-bar');
      const fill = el('div', 'cat-bar-fill');
      fill.style.width = s.total ? Math.round(p[1] / s.total * 100) + '%' : '0%';
      fill.style.background = p[0] === '已毕业' ? '#2A75C0' : (p[0] === '学习中' ? '#76AFE8' : '#B5D4F4');
      bar.appendChild(fill);
      row.appendChild(bar);
      row.appendChild(el('span', 'cat-bar-val', p[1] + ' 张'));
      sd.appendChild(row);
    });
    wrap.appendChild(sd);

    // —— 记忆强度（半衰期 h）分布 ——
    wrap.appendChild(el('h3', null, '💪 记忆强度分布（半衰期 h）'));
    const hb2 = el('div', 'stat-card');
    const hist = halflifeHistogram();
    const maxH = Math.max.apply(null, hist.map(function (x) { return x[1]; }).concat([1]));
    hist.forEach(function (b) {
      const row = el('div', 'cat-bar-row');
      row.appendChild(el('span', 'cat-bar-name', b[0]));
      const bar = el('div', 'cat-bar');
      const fill = el('div', 'cat-bar-fill');
      fill.style.width = Math.round(b[1] / maxH * 100) + '%';
      fill.style.background = masteryColor(b[1] ? 70 : 10);
      bar.appendChild(fill);
      row.appendChild(bar);
      row.appendChild(el('span', 'cat-bar-val', b[1] + ' 张'));
      hb2.appendChild(row);
    });
    wrap.appendChild(hb2);
    wrap.appendChild(el('p', 'muted', '半衰期 h 表示「停止复习后回忆概率掉到 50%」所需天数，越大记忆越牢固（h=3·S/F，由 FSRS 稳定性 S 换算）。'));

    wrap.appendChild(el('h3', null, '📊 各分类掌握度'));
    const cc = el('div', 'stat-card');
    catOrder().forEach(function (c) {
      const avg = categoryAvg(c);
      const row = el('div', 'cat-bar-row');
      row.appendChild(el('span', 'cat-bar-name', CATS[c]));
      const bar = el('div', 'cat-bar');
      const fill = el('div', 'cat-bar-fill');
      fill.style.width = avg + '%';
      fill.style.background = masteryColor(avg);
      bar.appendChild(fill);
      row.appendChild(bar);
      row.appendChild(el('span', 'cat-bar-val', avg + '%'));
      cc.appendChild(row);
    });
    wrap.appendChild(cc);

    app.appendChild(wrap);
  }


  // ---------------- 原理 · 学习科学（结构化文档：目录跳转 + 关键词搜索） ----------------
  const PRINCIPLE_SECTIONS = [
    {
      id: 'core', icon: '✍️', title: '核心方法：主动回忆 + 间隔重复',
      blocks: [
        { p: '学习科学里证据最强的两项技术（Dunlosky 2013 系统评估，证据等级 A）：检索练习——合上书主动回忆，远比反复阅读更牢固（Roediger & Karpicke 2006）；间隔重复——同样的总时长，分散到多天远优于考前突击（Cepeda 2006，254 项研究荟萃）。' },
        { p: '本应用的学习闭环就是这两项的组合：卡片默认只显示提示 → 先自行回想（必要时写下来）→ 点「显示答案」核对 → 按真实回忆质量评分，FSRS-6 算法把下一次复习自动安排在遗忘临界点。' },
        { muted: '重读、划线、抄写感觉「顺滑」，恰恰是低效的证据——这叫流畅性错觉。学得「难受」（合意困难）往往才是有效信号；反之，被动输入时大脑的三个可塑性信号（肾上腺素、乙酰胆碱、多巴胺）都不释放，等于白学。' }
      ]
    },
    {
      id: 'interleave', icon: '🔀', title: '交错与辨别',
      blocks: [
        { p: '交错练习（B 级）：把不同章节、不同题型混着练，远期成绩与迁移能力显著更好——练习时更「难受」，又是合意困难。集中刷同一类题的「顺滑感」是错觉。' },
        { p: '本应用的实现：带「同类/对比/类比」关联的卡片聚成簇、相邻出现（辨析聚类）；「裸回忆」开关进一步隐藏分类徽标，逼你先判断「这是哪一类、该用哪个方法」再回忆。' },
        { rows: [['自测', '随机抽卡「给内容选名称」，检验是否真正认得（生成效应：自己生成的答案记得更牢）。'], ['错题本', '真题做错后收进错题本，重做并评分，按 FSRS 排期重现；「不会/思路错」会把关联知识点一并降级、次日补漏。'], ['费曼技巧', '能用自己的话讲清楚才是真理解：合上卡片讲一遍，卡壳处即盲区（B 级）。'], ['自我解释', '每记一个公式追问：为什么成立？和什么已知有关？用在什么题型？（B 级）']] }
      ]
    },
    {
      id: 'fsrs', icon: '📐', title: '调度内核：FSRS-6',
      blocks: [
        { p: '每张卡由难度 D 与稳定度 S 建模；可提取性 R(t,S) = (1 + F·t/S)^decay 表示「此刻能想起的概率」。四档评分（再来一次/困难/良好/简单）对应 FSRS 官方四档，按官方 21 参数默认权重更新 D/S，并按期望保留率 90% 反推下次间隔。' },
        { p: '知识卡：学习阶段按时间步进（1 分钟 → 10 分钟），Good 越过最后一步毕业进入长期复习，遗忘后进入 10 分钟重学。错题卡为纯复习态：添加即视为「当天已忘记」，次日重现，之后与知识卡走同一套 FSRS 复习逻辑。' },
        { muted: '调度内核是纯函数（src/fsrs-core.mjs、sched.mjs），与官方权重做对拍测试；毕业目标可与考试倒计时挂钩（要求目标日仍能 ≥90% 记得）。' }
      ]
    },
    {
      id: 'mastery', icon: '📊', title: '掌握度与毕业目标',
      blocks: [
        { p: '掌握度 = 记忆「存储强度」到毕业目标的比例（⚠️自设计，依据论文「存储强度」概念 + 对数压缩）：达到毕业目标即 100%。分级：未学 → 初学 → 生疏 → 巩固中 → 已掌握 → 熟练 → 稳固 → 毕业。另单独显示「当前可提取性 R」表示此刻想起的概率。' },
        { p: '毕业目标默认与目标倒计时挂钩：要求目标日仍能 ≥90% 记得（等价于稳定度 S ≥ 剩余天数），随倒计时自动收紧；可在设置中改为固定目标值。' },
        { legend: true }
      ]
    },
    {
      id: 'science', icon: '📚', title: '学习科学清单：怎么学最有效',
      blocks: [
        { h: '高效（A 级，跨学科稳定）' },
        { rows: [['检索练习', '合上书先回忆：做题、默写、闪卡、给假想学生讲——本应用的核心闭环。'], ['间隔重复', '同内容隔天/隔周回顾——FSRS 自动排期；间隔约为目标保留期的 10–20%。']] },
        { h: '中效（B 级，用对场景有效）' },
        { rows: [['交错练习', '不同题型混着练（已内置辨析聚类）。'], ['精细提问 / 自我解释', '对材料追问「为什么成立、和什么有关」。'], ['示例学习', '先照例题仿写，尽快脱离例题独立做。']] },
        { h: '低效（D 级，大量时间换微量收益）' },
        { rows: [['重读 / 划线 / 被动摘要', '感觉顺滑恰恰是流畅性错觉——把这部分时间换成检索练习。']] },
        { p: '两个常见辟谣：「学习风格」（视觉型/听觉型）没有证据支持，请按材料本身的最佳表征学习（Pashler 2008，A 级负面证据）；「手写一定优于打字」证据混合，手写的真正价值在于强迫概括与加工。' }
      ]
    },
    {
      id: 'body', icon: '🌙', title: '身体是学习系统的一部分',
      blocks: [
        { rows: [['睡眠（A 级）', '「学之前睡好」（睡眠决定编码效率），「学之后睡够」（巩固发生在深睡与安静休息）。熬夜学习的净收益通常为负。'], ['安静休息（B 级）', '学完 10–20 分钟不看手机、闭眼或散步，给海马「重放」留时间。'], ['运动（A/B 级）', '规律运动改善情绪、动机与睡眠；中等强度运动后 1–2 小时是编码黄金窗——把最难的材料放在运动后学。'], ['专注（A 级常识）', '任务切换有真实成本；手机哪怕静音扣在桌上也会偷走工作记忆——学习时段物理隔离。'], ['咖啡因（A 级）', '提升警觉，但半衰期约 5 小时：睡前 8–10 小时停止摄入；每日总量 ≤400mg。']] },
        { muted: '本节为一般健康信息，不构成医疗建议；个体差异请以自身实验与医生意见为准。' }
      ]
    },
    {
      id: 'motivation', icon: '🎯', title: '动机与坚持',
      blocks: [
        { p: '最强的日常动机来源是「可见的微小进步」（Progress Principle，对 1.2 万个工作日的研究）——统计页的学习报告与趋势图就是为此设计：把注意力放在过程反馈，而非遥远的终点。' },
        { p: '对拖延：它本质是用短期情绪修复替代长期目标。对策有三——自我原谅比自责更能减少下一次拖延（B 级）；启动只承诺两分钟（启动后继续的概率远大于放弃）；把任务拆到「下一个具体物理动作」。' },
        { p: '习惯自动化的中位数约 66 天（「21 天养成」是讹传）；把新行为写成「当 X 时我就做 Y」的执行意图，是动机科学里效应量最大的廉价工具。环境设计大于意志力。' },
        { muted: '本应用刻意不做积分、抽卡、连击惩罚等设计：变率奖励是劫持动机的赌场工具，而有形奖励会侵蚀你本来就有的学习兴趣（过度合理化效应，A 级）。' }
      ]
    },
    {
      id: 'troubleshoot', icon: '🛠️', title: '学不进去排查表',
      blocks: [
        { rows: [['完全不想启动', '先查睡眠够不够、刺激密度是否过高（短视频依赖）。对策：补觉优先；两分钟启动法。'], ['三分钟热度', '查自主/胜任/关联缺了哪个。对策：把「要学」转成「我选择学」；看学习报告里的微进步；找个搭子。'], ['学完就忘', '是不是只重读不检索？间隔为零？对策：用自测与错题本；相信算法排期，到期就复习。'], ['越学越麻木', '是否形成刺激依赖（不听音乐学不了）？对策：给辅助刺激做减法与随机化；用真休息替代刷手机。'], ['burnout 前兆', '恢复是否长期不足？对策：减载 + 睡眠 + 每周一个无目标日；持续两周以上请就医。']] },
        { muted: '持续两周以上的情绪低落、兴趣丧失、睡眠食欲明显改变——请直接寻求专业帮助，这不是「调优」能解决的问题。' }
      ]
    }
  ];

  let principleQuery = '';
  function principleBlockText(sec) {
    return sec.blocks.map(function (b) {
      if (b.p) return b.p;
      if (b.muted) return b.muted;
      if (b.h) return b.h;
      if (b.rows) return b.rows.map(function (r) { return r[0] + r[1]; }).join(' ');
      return '';
    }).join(' ');
  }

  function renderPrinciples() {
    const app = document.getElementById('app');
    const wrap = el('div', 'principles-wrap');

    wrap.appendChild(el('h2', null, '🧠 原理 · 学习科学'));
    wrap.appendChild(el('p', 'muted', '本应用遵循认知科学中被反复验证的记忆与学习规律——目录跳转，或搜索关键词直达章节；条目后标注证据等级（A 强 / B 中 / C 弱）。'));

    // 搜索（实时过滤章节）
    const search = el('input', 'search');
    search.type = 'search';
    search.placeholder = '搜索关键词（如：睡眠 / 交错 / 遗忘曲线 / 拖延）…';
    search.value = principleQuery;
    wrap.appendChild(search);

    // 目录（吸顶 chips，锚点跳转）
    const toc = el('div', 'chips principle-toc');
    const tocChips = {};
    PRINCIPLE_SECTIONS.forEach(function (sec) {
      const chip = el('button', 'chip', sec.icon + ' ' + sec.title);
      chip.addEventListener('click', function () {
        const node = document.getElementById('pr-' + sec.id);
        if (node) node.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
      tocChips[sec.id] = chip;
      toc.appendChild(chip);
    });
    wrap.appendChild(toc);

    // 章节
    const boxes = {};
    PRINCIPLE_SECTIONS.forEach(function (sec) {
      const box = el('div', 'principle');
      box.id = 'pr-' + sec.id;
      const head = el('div', 'principle-head');
      head.appendChild(el('span', 'principle-icon', sec.icon));
      head.appendChild(el('strong', null, sec.title));
      box.appendChild(head);
      sec.blocks.forEach(function (b) {
        if (b.h) {
          box.appendChild(el('div', 'mini-label', b.h));
        } else if (b.p) {
          box.appendChild(el('p', null, b.p));
        } else if (b.muted) {
          box.appendChild(el('p', 'muted how', b.muted));
        } else if (b.rows) {
          b.rows.forEach(function (row) {
            const r = el('div', 'cat-bar-row');
            r.appendChild(el('span', 'cat-bar-name', row[0]));
            r.appendChild(el('span', 'pr-row-text', row[1]));
            box.appendChild(r);
          });
        } else if (b.legend) {
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
          box.appendChild(legend);
          box.appendChild(el('p', 'muted', '当前整体平均掌握度 ' + s.avg + '%（分级实时统计如上）。'));
        }
      });
      boxes[sec.id] = box;
      wrap.appendChild(box);
    });

    const empty = el('p', 'muted', '没有匹配的章节——换个关键词试试。');
    empty.classList.add('hidden');
    wrap.appendChild(empty);

    function applyFilter() {
      const q = principleQuery.trim().toLowerCase();
      let visible = 0;
      PRINCIPLE_SECTIONS.forEach(function (sec) {
        const text = (sec.title + ' ' + principleBlockText(sec)).toLowerCase();
        const show = !q || text.indexOf(q) !== -1;
        boxes[sec.id].style.display = show ? '' : 'none';
        tocChips[sec.id].style.display = show ? '' : 'none';
        if (show) visible++;
      });
      empty.classList.toggle('hidden', visible > 0 || !q);
    }
    search.addEventListener('input', function () {
      principleQuery = search.value;
      applyFilter();
    });
    applyFilter();

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


  // ---------------- 导入 / 导出共用 ----------------
  // 把对象序列化为 JSON 并触发浏览器下载
  function downloadJson(payload, filename) {
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
  // 弹出文件选择框读取 JSON 文本（单科导入与全科目导入共用）
  function pickJsonFile(onLoaded) {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'application/json,.json';
    input.onchange = function () {
      const file = input.files && input.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = function () { onLoaded(String(reader.result)); };
      reader.readAsText(file);
    };
    input.click();
  }

  function handleAction(action, arg) {
    switch (action) {
      case 'nav':
        closeDrawer();
        currentView = arg;
        if (arg === 'wrong' || arg === 'wrongBrowse' || arg === 'wrongStats') currentModule = 'wrong';
        else if (arg === 'learn' || arg === 'browse' || arg === 'quiz' || arg === 'statistics') currentModule = 'cards';
        renderApp();
        break;
      case 'module':
        closeDrawer();
        currentModule = arg;
        currentView = (arg === 'wrong') ? 'wrong' : 'learn';
        renderApp();
        break;
      case 'menuclose':
        closeDrawer();
        break;
      case 'mapclose':
        mapSel = null;
        renderApp();
        break;
      case 'countdown-close': {
        const m = document.querySelector('.countdown-modal');
        if (m) m.remove();
        break;
      }
      case 'mapzoom':
        if (arg === 'in') mapScale = Math.min(2.5, mapScale + 0.2);
        else if (arg === 'out') mapScale = Math.max(0.4, mapScale - 0.2);
        else mapScale = 1;
        renderApp();
        break;
      case 'heatdate':
        heatSel = arg;
        renderApp();
        break;
      case 'heatclose':
        heatSel = null;
        renderApp();
        break;
      case 'goback':
        if (pos > 0) { pos--; pendingAdvance = false; saveSession(); renderApp(); }
        break;
      case 'gofront':
        pos = frontier;
        pendingAdvance = false;
        saveSession();
        renderApp();
        break;
      case 'jump':
        jumpToCard(arg);
        break;
      case 'restart':
        buildSession();
        renderApp();
        break;
      case 'reveal':
        revealCurrent();
        break;
      case 'rate':
        doRate(parseInt(arg, 10));
        break;
      case 'wreveal':
        revealWrong();
        break;
      case 'wrate':
        doWrongRate(parseInt(arg, 10));
        break;
      case 'undo':
        undoLastRating();
        break;
      case 'bcat':
        browseCat = arg;
        browseExpanded = {};
        renderApp();
        break;
      case 'bmastery':
        browseMastery = arg;
        browseExpanded = {};
        renderApp();
        break;
      case 'bstars':
        browseStars = arg;
        browseExpanded = {};
        renderApp();
        break;
      case 'btoggle':
        browseExpanded[arg] = !browseExpanded[arg];
        renderApp();
        break;
      case 'wtoggle':
        wrongExpanded[arg] = !wrongExpanded[arg];
        renderApp();
        break;
      case 'resetcard':
        DB.cards[arg] = defaultCard();
        saveDB();
        renderApp();
        toast('已重置该卡片');
        break;
      case 'qstart':
        startQuiz();
        break;
      case 'qanswer':
        doQuizAnswer(arg);
        break;
      case 'qnext':
        quiz.idx++;
        renderApp();
        break;
      case 'export': {
        const subj = subjectList()[currentSubjectId];
        downloadJson(
          { format: 'formula-memory', version: 2, subject: currentSubjectId, db: DB },
          (subj ? subj.short : '公式') + (subjKind() === 'qa' ? '知识点记忆-备份.json' : '公式记忆-备份.json')
        );
        toast('已导出');
        break;
      }
      case 'importjson': {
        pickJsonFile(function (text) {
          try {
            importDB(text);
            buildSession(0);
            currentView = 'learn';
            renderApp();
            toast('导入成功');
          } catch (err) {
            toast(err.message || '导入失败');
          }
        });
        break;
      }
      case 'exportall': {
        if (typeof flushSave === 'function') flushSave();
        downloadJson({ format: 'athena-all-backup', version: 1, subjects: exportAllSubjects() }, 'Athena-全部科目备份.json');
        toast('已导出全部科目');
        break;
      }
      case 'importall': {
        pickJsonFile(function (text) {
          try {
            let data;
            try { data = JSON.parse(text); } catch (e) { throw new Error('不是有效的 JSON 文件'); }
            const n = importAllSubjects(data);
            if (n === 0) throw new Error('文件中没有可导入的科目');
            loadDBAsync().then(function () {
              buildSession(0);
              currentView = 'learn';
              renderApp();
              toast('已导入全部科目（' + n + ' 个）');
            });
          } catch (err) {
            toast(err.message || '导入失败');
          }
        });
        break;
      }
      case 'resetall':
        if (confirm('确定要清空全部学习进度吗？（知识卡与错题的记忆安排、统计一并归零，便于重新测试）')) {
          DB.cards = {};
          DATA.forEach(function (f) { DB.cards[f.id] = defaultCard(); });
          // 错题：只清记忆进度，保留题目/解析/关联内容
          Object.keys(DB.wrongs || {}).forEach(function (wid) {
            const w = DB.wrongs[wid];
            const keep = { kind: w.kind, q: w.q, a: w.a, a2: w.a2, src: w.src, linked: w.linked, errType: w.errType };
            DB.wrongs[wid] = Object.assign(defaultWrongCard(), keep);
          });
          DB.log = {};
          resetSessionState();
          buildSession(0);
          localStorage.removeItem(sessionKey());
          currentView = 'learn';
          currentModule = 'cards';
          renderApp();
          toast('已重置（统计已清空）');
        }
        break;
      case 'togglog': {
        const body = document.querySelector('.changelog-body');
        if (!body) break;
        const hidden = body.classList.toggle('hidden');
        const btn = document.querySelector('[data-action="togglog"]');
        if (btn) btn.textContent = hidden ? '展开' : '收起';
        break;
      }
      case 'clearcache': {
        // 强制清除 Service Worker 与全部缓存后刷新（用于移动端测试最新版本）
        toast('正在清除缓存…');
        const done = function () {
          if ('caches' in window && window.caches.keys) {
            window.caches.keys().then(function (keys) {
              return Promise.all(keys.map(function (k) { return window.caches.delete(k); }));
            }).then(function () { location.reload(); }).catch(function () { location.reload(); });
          } else {
            location.reload();
          }
        };
        if ('serviceWorker' in navigator && navigator.serviceWorker.getRegistration) {
          navigator.serviceWorker.getRegistration().then(function (reg) {
            if (reg) { return reg.unregister().then(function () { done(); }); }
            done();
          }).catch(function () { done(); });
        } else {
          done();
        }
        break;
      }
    }
  }

  // ---------------- 全局事件 ----------------
  document.addEventListener('click', function (e) {
    const t = e.target.closest('[data-action]');
    if (!t) return;
    handleAction(t.getAttribute('data-action'), t.getAttribute('data-arg'));
  });

  document.addEventListener('keydown', function (e) {
    // 键盘刷卡：知识卡学习页与错题重做页共用（Space/Enter 显示答案，1-4 评分）
    if (currentView !== 'learn' && currentView !== 'wrong') return;
    const isLearn = currentView === 'learn';
    if (e.key === ' ' || e.key === 'Enter') {
      const reveal = document.querySelector('.controls');
      if (reveal && !reveal.classList.contains('hidden')) {
        e.preventDefault();
        if (isLearn) revealCurrent(); else revealWrong();
        return;
      }
    }
    const rating = document.querySelector('.rating');
    if (rating && !rating.classList.contains('hidden')) {
      const map = { '1': 0, '2': 1, '3': 2, '4': 3 };
      if (map[e.key] != null) {
        if (isLearn) doRate(map[e.key]); else doWrongRate(map[e.key]);
      }
    }
  });

  // 触屏手势：右滑「上一张」，左滑「下一张/回到当前」
  let touchStart = null;
  // 判断目标是否处于（横向或纵向）可滚动容器内：容器内部滚动时不应触发卡片翻页
  function inScrollable(t) {
    let n = t;
    while (n && n !== document.body && n.nodeType === 1) {
      const cs = getComputedStyle(n);
      const ox = cs.overflowX, oy = cs.overflowY;
      if ((ox === 'auto' || ox === 'scroll') && n.scrollWidth > n.clientWidth + 2) return true;
      if ((oy === 'auto' || oy === 'scroll') && n.scrollHeight > n.clientHeight + 2) return true;
      n = n.parentElement;
    }
    return false;
  }
  document.addEventListener('touchstart', function (e) {
    if (currentView !== 'learn') return;
    if (e.touches.length === 1) touchStart = { x: e.touches[0].clientX, y: e.touches[0].clientY, scroll: inScrollable(e.target), locked: false };
  }, { passive: true });
  // 滑动过程中一旦出现明显纵向位移（页面/长答案滚动），锁定本次触摸为「滚动」，结束后不再翻页
  document.addEventListener('touchmove', function (e) {
    if (currentView !== 'learn' || !touchStart || touchStart.locked) return;
    const t = e.touches[0];
    const dx = t.clientX - touchStart.x;
    const dy = t.clientY - touchStart.y;
    if (Math.abs(dy) > 12 && Math.abs(dy) > Math.abs(dx)) touchStart.locked = true;
  }, { passive: true });
  document.addEventListener('touchend', function (e) {
    if (currentView !== 'learn' || !touchStart) return;
    const d = document.getElementById('drawer');
    if (d && d.classList.contains('open')) { touchStart = null; return; } // 抽屉打开时不触发翻页
    const dx = e.changedTouches[0].clientX - touchStart.x;
    const dy = e.changedTouches[0].clientY - touchStart.y;
    const wasScroll = touchStart.scroll || touchStart.locked;
    touchStart = null;
    if (wasScroll) return; // 公式/长答案滚动时，不触发卡片翻页
    // 需「明显水平滑动」：水平位移 ≥ 60px 且 ≥ 1.5 倍纵向位移（防止斜滑/轻微横移误翻页）
    if (Math.abs(dx) < 60 || Math.abs(dx) < 1.5 * Math.abs(dy)) return;
    if (dx < 0 && pos < frontier) handleAction('gofront');
    else if (dx > 0 && pos > 0) handleAction('goback');
  }, { passive: true });

  // iOS/移动端稳定性：切后台或关页前先结算学习计时、再强制落盘，避免合并写尚未 flush 就丢进度
  // （两个监听按注册顺序执行：先 settleStudyTime 记账，后 flushSave 写盘，顺序不可换）
  document.addEventListener('visibilitychange', function () { if (document.visibilityState === 'hidden') settleStudyTime(); });
  window.addEventListener('pagehide', settleStudyTime);
  window.addEventListener('pagehide', function () { if (typeof flushSave === 'function') flushSave(); });
  document.addEventListener('visibilitychange', function () { if (document.visibilityState === 'hidden' && typeof flushSave === 'function') flushSave(); });
  // 前台期间每 15 秒结算一次学习时长（内存记账，随各次 saveDB / 切后台落盘）
  setInterval(settleStudyTime, 15000);

  // ---------------- 主题 ----------------
  function applyTheme() {
    const t = localStorage.getItem(THEME_KEY) || 'light';
    document.documentElement.setAttribute('data-theme', t);
  }
  document.getElementById('themeToggle').addEventListener('click', function () {
    const cur = document.documentElement.getAttribute('data-theme');
    const next = cur === 'dark' ? 'light' : 'dark';
    localStorage.setItem(THEME_KEY, next);
    applyTheme();
  });

  // 沉浸模式
  const itBtn = document.getElementById('immersiveToggle');
  if (itBtn) itBtn.addEventListener('click', function () { document.body.classList.toggle('immersive'); });
  const ieBtn = document.getElementById('immersiveExit');
  if (ieBtn) ieBtn.addEventListener('click', function () { document.body.classList.remove('immersive'); });

  // ☰ 抽屉菜单（移动端导航）
  function openDrawer() {
    const d = document.getElementById('drawer');
    const b = document.getElementById('drawerBackdrop');
    if (d) d.classList.add('open');
    if (b) b.classList.add('open');
  }
  function closeDrawer() {
    const d = document.getElementById('drawer');
    const b = document.getElementById('drawerBackdrop');
    if (d) d.classList.remove('open');
    if (b) b.classList.remove('open');
  }
  const menuBtn = document.getElementById('menuToggle');
  if (menuBtn) {
    menuBtn.addEventListener('click', function () {
      const d = document.getElementById('drawer');
      if (d && d.classList.contains('open')) closeDrawer();
      else openDrawer();
    });
  }

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') { document.body.classList.remove('immersive'); closeDrawer(); const cm = document.querySelector('.countdown-modal'); if (cm) cm.remove(); }
  });

  // 导图 Ctrl+滚轮缩放
  document.addEventListener('wheel', function (e) {
    if (currentView !== 'map' || !e.ctrlKey) return;
    e.preventDefault();
    if (e.deltaY < 0) mapScale = Math.min(2.5, mapScale + 0.15);
    else mapScale = Math.max(0.4, mapScale - 0.15);
    renderApp();
  }, { passive: false });

  // ---------------- PWA / 离线 ----------------
  if ('serviceWorker' in navigator && (location.protocol === 'https:' || location.protocol === 'http:')) {
    window.addEventListener('load', function () {
      navigator.serviceWorker.register('./sw.js').catch(function () {});
    });
  }

  // ---------------- 学科切换与选择器 ----------------
  function switchSubject(id) {
    if (id === currentSubjectId || !setSubject(id)) return;
    const target = id;
    resetSessionState(); // 统一会话重置（deck/浏览过滤/导图/错题队列一次清干净）
    currentModule = 'cards';
    loadDBAsync().then(function () {
      // 竞态防护：等待期间用户又切到了别的学科时，放弃这次过期的加载结果
      if (currentSubjectId !== target) return;
      if (!loadSession()) buildSession(0);
      currentView = 'learn';
      renderApp();
    });
  }
  function renderSubjectDropdown() {
    const cur = document.getElementById('subjectCurrent');
    const menu = document.getElementById('subjectMenu');
    if (!cur || !menu) return;
    cur.innerHTML = '';
    menu.innerHTML = '';
    const list = subjectList();
    Object.keys(list).forEach(function (id) {
      const s = list[id];
      const item = el('button', 'subject-dd-item' + (id === currentSubjectId ? ' active' : ''), '');
      item.type = 'button';
      const img = document.createElement('img');
      img.src = subjectIconUrl(id) || '';
      img.className = 'subject-icon';
      img.alt = '';
      item.appendChild(img);
      item.appendChild(document.createTextNode(s.short));
      item.addEventListener('click', function () {
        closeSubjectDropdown();
        switchSubject(id);
      });
      menu.appendChild(item);
    });
    const cs = list[currentSubjectId];
    if (cs) {
      const cimg = document.createElement('img');
      cimg.src = subjectIconUrl(currentSubjectId) || '';
      cimg.className = 'subject-icon';
      cimg.alt = '';
      cur.appendChild(cimg);
      cur.appendChild(document.createTextNode(cs.short));
      // 总体掌握度徽标（数值由 renderApp → updateBrand 刷新）
      const pct = el('span', 'subject-pct', '');
      pct.id = 'subjectPct';
      cur.appendChild(pct);
    }
  }

  function setupSubjectDropdown() {
    const cur = document.getElementById('subjectCurrent');
    const menu = document.getElementById('subjectMenu');
    if (!cur || !menu) return;
    cur.addEventListener('click', function (e) {
      e.stopPropagation();
      const willShow = menu.classList.contains('hidden');
      if (willShow) {
        // 菜单挂在 body 根节点：fixed 定位到按钮下方（视口坐标），
        // 不受 sticky/backdrop-filter 祖先的包含块与命中测试影响（移动端 WebKit 曾因此无法选中其他学科）
        const r = cur.getBoundingClientRect();
        menu.style.top = (r.bottom + 4) + 'px';
        menu.style.left = r.left + 'px';
        menu.style.minWidth = Math.max(r.width, 150) + 'px';
      }
      menu.classList.toggle('hidden');
      if (!menu.classList.contains('hidden')) {
        // 屏幕右缘溢出兜底：窄屏上按钮靠右时把菜单收回屏内
        const mr = menu.getBoundingClientRect();
        if (mr.right > window.innerWidth - 8) {
          menu.style.left = Math.max(8, window.innerWidth - mr.width - 8) + 'px';
        }
      }
      cur.setAttribute('aria-expanded', willShow ? 'true' : 'false');
    });
    function isOutside(e) {
      return !e.target.closest('#subjectDropdown') && !e.target.closest('#subjectMenu');
    }
    document.addEventListener('click', function (e) {
      if (isOutside(e)) closeSubjectDropdown();
    });
    // 触屏兜底：个别移动浏览器点外部时只派发 touchstart 不派发 click，同样收起
    document.addEventListener('touchstart', function (e) {
      if (isOutside(e)) closeSubjectDropdown();
    }, { passive: true });
  }

  function closeSubjectDropdown() {
    const menu = document.getElementById('subjectMenu');
    if (menu) menu.classList.add('hidden');
    const cur = document.getElementById('subjectCurrent');
    if (cur) cur.setAttribute('aria-expanded', 'false');
  }

  // ---------------- 启动 ----------------
  function initApp() {
    applyTheme();
    setupSubjectDropdown();
    let saved = null;
    try { saved = localStorage.getItem(SUBJECT_KEY); } catch (e) {}
    setSubject(saved);
    migrateLegacy();
    loadDBAsync().then(function () {
      if (!loadSession()) buildSession(0);
      currentView = 'learn';
      currentModule = 'cards';
      renderApp();
      setTimeout(maybeShowCountdownPopup, 350);
      setTimeout(autoSyncOnLaunch, 1200); // 启动自动同步（等首屏渲染完成后再联网比对）
    });
  }

  initApp();
  bootKatex(0);

  // ---------------- 自检钩子（?selftest=1 时全量渲染校验，供 tools/check_render.mjs 使用；正常使用零影响） ----------------
  (function maybeSelftest() {
    if (typeof location === 'undefined') return;
    let want = false;
    try { want = new URLSearchParams(location.search).has('selftest'); } catch (e) { return; }
    if (!want) return;
    window.__selftestReady = false;
    window.__selftestResult = null;

    function checkField(sid, id, field, str, holder, problems, stats) {
      if (typeof str !== 'string' || str.length === 0) return;
      stats.fields++;
      const el = document.createElement('div');
      holder.appendChild(el);
      renderTex(el, str);
      // KaTeX 渲染错误（throwOnError:false 时以 .katex-error 标记）
      const kerr = el.querySelectorAll('.katex-error').length;
      // 只检查「散文文本节点」：排除 .katex 子树（其 MathML <annotation> 含原始 TeX 源码，
      // textContent 必然包含 \frac/\text 等命令，属正常现象，不能据此判错）
      let prose = '';
      const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
      let n;
      while ((n = walker.nextNode()) !== null) {
        const pEl = n.parentElement;
        if (pEl && pEl.closest && pEl.closest('.katex')) continue;
        prose += n.textContent;
      }
      const litStar = /\*\*/.test(prose);
      // 散文中残留任意 \命令 都算未渲染（renderProse 只把 textbf/underline 等转 HTML，
      // 其余 \xxx 若漏进散文就是没被处理的 LaTeX）
      const litCmd = /\\([A-Za-z]+)/.test(prose);
      if (kerr || litStar || litCmd) {
        problems.push({ sid: sid, id: id, field: field, kerr: kerr, litStar: litStar, litCmd: litCmd, snippet: prose.slice(0, 80) });
      }
      holder.removeChild(el);
    }

    function run() {
      const subs = subjectList();
      const holder = document.createElement('div');
      holder.style.cssText = 'position:absolute;left:-99999px;top:0;';
      document.body.appendChild(holder);
      const problems = [];
      const stats = { cards: 0, fields: 0 };
      for (const sid of Object.keys(subs)) {
        const mod = subs[sid];
        const data = (mod.DATA || mod.data) || [];
        for (const c of data) {
          if (!c || !c.id) continue;
          stats.cards++;
          checkField(sid, c.id, 'title', c.title, holder, problems, stats);
          checkField(sid, c.id, 'front', c.front, holder, problems, stats);
          checkField(sid, c.id, 'back', c.back, holder, problems, stats);
        }
        const ex = mod.EXAMPLE || {};
        for (const id of Object.keys(ex)) {
          const arr = Array.isArray(ex[id]) ? ex[id] : [ex[id]];
          arr.forEach(function (e, i) {
            if (!e) return;
            checkField(sid, id, 'ex' + i + '.q', e.q, holder, problems, stats);
            checkField(sid, id, 'ex' + i + '.a', e.a, holder, problems, stats);
            checkField(sid, id, 'ex' + i + '.a2', e.a2, holder, problems, stats);
          });
        }
        const pf = mod.PITFALL || {};
        for (const id of Object.keys(pf)) checkField(sid, id, 'pitfall', pf[id], holder, problems, stats);
        const mn = mod.MNEM || {};
        for (const id of Object.keys(mn)) checkField(sid, id, 'mnem', mn[id], holder, problems, stats);
      }
      document.body.removeChild(holder);
      window.__selftestResult = {
        katexOk: typeof window.katex !== 'undefined' && !!window.katex.render,
        cards: stats.cards,
        fields: stats.fields,
        problems: problems
      };
      window.__selftestReady = true;
    }

    // 等 KaTeX 就绪（bootKatex 本地优先；最多等 15s）
    const t0 = Date.now();
    (function waitKatex() {
      if (typeof window.katex !== 'undefined' && window.katex.render) { run(); return; }
      if (Date.now() - t0 > 15000) { run(); return; }
      setTimeout(waitKatex, 120);
    })();
  })();
})();

