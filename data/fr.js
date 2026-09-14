/*
 * 法语 · 知识点记忆数据库
 * 依据：法语入门通用框架（语音 → 名词与冠词 → 动词变位 → 句型 → 文化）
 * 结构与其他学科一致：id / cat / title / front / back + META / PITFALL
 * 说明：无例题学科；kind: 'qa'；group: 'lang'——卡面带 Web Speech 朗读按钮（fr-FR）。
 */
window.SUBJECTS = window.SUBJECTS || {};
window.SUBJECTS.fr = (function () {
  'use strict';
  const R = String.raw;

  const CATS = {
    start: '起步答疑',
    phon: '语音与拼读',
    noun: '名词与冠词',
    verb: '动词与变位',
    sent: '句型与表达',
    words: '高频单词',
    culture: '文化与场景'
  };

  const F = (id, cat, title, front, back) => ({ id, cat, title, front, back });

  const DATA = [
    // ==================== 起步答疑 ====================
    F('bs01', 'start', '法语拼写复杂但拼读是规律的',
      R`法语拼写看起来很乱，读音有规律吗？`,
      R`有——而且相当规律。法语的「乱」在**写法**：同一读音多种拼写（eau/au/o 都读 o）；但**读法方向是死的**：认识字母组合规则后，见词能读。
推论：学法语的正确顺序是**先攻拼读规则**（phon 章一张表的事），此后阅读永远有读音抓手——别被拼写吓退，母语者小学也在学这个。`),
    F('bs02', 'start', '发音难点预览：三座小山',
      R`法语发音的难点在哪？提前心里有数。`,
      R`三座小山，都能一周翻过：① **小舌音 r**（漱口的位置轻擦——每天含水练习法）；② **鼻化元音**（口型做元音、气流走鼻腔——四个音一套口诀）；③ **联诵**（前词尾辅音「复活」连读——规则明确，phon 章专卡）。
加一个「假坑」排除：词尾辅音大多不发音（Paris 的 s）、h 永远不发音——不是难点，是送分规律。
跟读工具：学习页 🔊 按钮（fr-FR 口音），每天跟三遍。`),
    F('bs03', 'start', '语法两大预告：阴阳性与变位',
      R`法语语法的主战场在哪？`,
      R`两座主山：① **名词阴阳性**——每个名词自带性别（与意义无关），必须连冠词整体记（记 une table 不记 table）；② **动词变位**——人称×时态的词形变化体系。
应对：阴性阳性靠「从第一天就带冠词记忆」的习惯，变位靠「先吃透高频四大」（être/avoir/aller/faire），规则动词一族一套模板。
verb 章会按这个顺序展开——预告在此，到时别慌。`),
    F('bs04', 'start', '第一周怎么过',
      R`法语第一周的推荐节奏？`,
      R`① **拼读规则先吃透**：phon 章每天 2-3 张 + 跟朗读按钮读词例——这是法语入门最值的一次投资（此后见词能读）；② 初学者模式开「起步答疑 + 语音与拼读 + 名词与冠词」，每日 10 张；③ 每天大声跟读五分钟——法语靠节奏组整块模仿，不开口学不会。
第一周目标：给一个陌生法语词，能按规则读出七成准确。
别急着啃动词变位——第一周的正确姿势是把耳朵和嘴「调成法语频道」。`),
    F('bs05', 'start', '常见放弃点与对策',
      R`法语初学最容易在哪放弃？怎么破？`,
      R`三大放弃点：
① **阴阳性记不住**——对策：永远连冠词记词（le/la 是单词的一部分），规律族（-tion 阴性、-age 阳性）先管八成。② **动词变位表劝退**——对策：只主攻高频四个 + 第一组规则模板，其余遇到一个收一个，别指望一次背完全表。③ **联诵时有时无**——对策：跟读原声材料，耳朵先于规则。
总对策：法语是「前期规则投资大、后期阅读回报高」的语言——phon 章 investment 一次，终身受用。`),
    // ==================== 语音与拼读 ====================
    F('ph01', 'phon', '法语字母与拼读透明度',
      R`法语的拼读规律性如何？`,
      R`法语 26 个字母（与英语同），拼读规则**高度规律但写法复杂**——同音多拼（音 → 字母组合方向需要记）。
核心观念：法语的"难"在**拼写**不在读音——字母组合（eau/au/o 都读 o）固定后，看词能读、读音需记拼。
字母陷阱：h 永远不发音（l'homme）、词尾辅音多数不发音（Paris 的 s、t 的多数词尾）。`),
    F('ph02', 'phon', '法语的元音与鼻化元音',
      R`法语有哪些中文没有的音？鼻化元音如何发？`,
      R`难点音：u（圆唇的"衣"——嘴唇圆成 o 发 i）、r（小舌音——漱口的位置轻擦）、é/è（闭口/开口 e）。
**鼻化元音四个**：an/en（昂）、on（翁）、in/ain（"呃"带鼻音）、un——发法：口型做好元音、软腭放下让气流分道鼻腔。
拼读对应：an/en/am/em → 同一鼻音；on/om；in/ain/ein/un → 大部分合并（现代法语 un 与 in 趋同）。`),
    F('ph03', 'phon', '联诵与省音',
      R`什么是联诵（liaison）与省音（élision）？`,
      R`**联诵**：前一词词尾本不发音的辅音 + 后词元音开头 → 辅音"复活"连读（les‿amis 读 le-za-mi；vous‿avez 读 vou-za-vé）——必要联诵（冠词/代词+名词）、禁止联诵（et 之后）、可选联诵靠语感。
**省音**：le/la/je/ne/que 等遇到元音开头词 → 缩为 l'/j'/n'/qu'（l'ami、j'aime）。
连读节奏是"一听就是法语"的关键——单词读得再准，无联诵仍不成法语。`),
    F('ph04', 'phon', '重音与节奏：等长音节链',
      R`法语的重音规则是什么？`,
      R`法语**词内无重音**——每个音节等长等重，像机关枪匀速输出；句子里**重音永远落在节奏组末尾**（最后一个重读 syllable）。
节奏组（groupe rythmique）：意义相连的词一气呵成（dans la cuisine 在厨房里——中间不换气）。
对比英语的词重音自由——法语的"平板匀速"就是发音练习的第一目标：别把某个音节读重了。`),
    F('ph05', 'phon', '法语的标音工具：音符系统',
      R`é、è、ê、ç 各是什么？`,
      R`**é**（尖音符 accent aigu）：闭口 e（café）；**è/ê/ë**（重音符等）：开口 e（très）；**ç**（软音符 cédille）：让 c 在 a/o/u 前读 s（français）；**â**：长 a。
字母组合：ou（u 的"呜"）、oi（哇）、eu/œu（"呃"圆唇）、ai（è）、eau（o）、gn（"捏"）、ill（多数读"伊"）。
这些是**看词读音**的解码表——一张表背完，生词 90% 能读。`),
    // ==================== 名词与冠词 ====================
    F('no01', 'noun', '阴阳性：法语的地基难题',
      R`法语名词的阴阳性如何应对？`,
      R`每个名词**自带性别**：le livre（书，阳性）、la table（桌子，阴性）——**无生命物也有性**，与意义无关，必须连冠词整体记（记"une table"不记"table"）。
规律可覆盖约八成：-tion/-sion/-té/-ette/-ance 阴性；-age/-ment/-eau/-acle 阳性；表人名词随性别（acteur/actrice）。
阴阳性决定冠词、形容词、过去分词的一致——性别错 = 连锁错，是法语第一地基工程。`),
    F('no02', 'noun', '冠词系统：定冠词与不定冠词',
      R`le/la/les 与 un/une/des 如何使用？`,
      R`**定冠词**（泛指全体/特指）：le（阳单）、la（阴单）、l'（元音前）、les（复数不分性）；**不定冠词**（其中一个）：un（阳）、une（阴）、des（复数）。
J'aime **le** café（喜欢咖啡这大类）；je bois **un** café（喝一杯咖啡）。
复数陷阱：les/des 的 s 不发音——靠联诵与上下文感知复数（les‿enfants）。`),
    F('no03', 'noun', '缩合冠词与部分冠词',
      R`du/de la/des 与 au/aux 从哪来？`,
      R`**缩合**：à + le = au、à + les = aux；de + le = du、de + les = des（la/l' 不缩合）——介词与冠词必须融合（je vais **au** cinéma——去电影院）。
**部分冠词**（du/de la/de l'）：取一部分不可数物——je mange **du** pain（吃点面包）、boire **de la** bière。
逻辑链：不可数/未定量的食物饮料用部分冠词——英语 a/some 的分工在法语变成了三个冠词家族。`),
    F('no04', 'noun', '否定句中的 de',
      R`为什么否定句里 un/une/des/du 变成 de？`,
      R`完全否定（ne...pas）时，不定冠词与部分冠词统一变 **de**：je mange **du** pain → je ne mange pas **de** pain（我不吃面包）。
例外：① être 系（c'est une table → ce n'est pas **une** table——表语身份不变）；② 强调量的绝对否定保留（je n'ai pas **un** frère, mais deux——不止一个）。
规则记一条：**把东西整个否定没了 → de**。`),
    F('no05', 'noun', '形容词：位置与性数一致',
      R`法语形容词放哪？如何与名词一致？`,
      R`多数形容词在名词**后**（une table ronde——圆桌子）；少数高频短形容词在前（grand 小、petit、bon、beau、joli、jeune、vieux、nouveau）。
一致：性与数都要配合——un petit garçon（阳性单数）/ une petit**e** fill**e**（阴性）/ deux petit**s** garçon**s**（复数）；词尾 s/x 不发音——书面上的一致听不出来。
价值判断类（beau/joli）常前置——"位置表"高频的十来个先记熟。`),
    F('no06', 'noun', '疑问句的三种形态',
      R`法语疑问句如何构成？`,
      R`① 语调疑问（口语）：Tu viens?（升调）——零成本；② **Est-ce que** + 陈述句：Est-ce que tu viens?——万能插入语；③ 主谓倒装（正式）：Venez-vous?——书面/郑重。
疑问词：qui（谁）、que（什么）、où（哪里）、quand（何时）、pourquoi（为何）、comment（怎样）、combien（多少）。
入门策略：口语全用语调句 + Est-ce que——倒装留给阅读与正式文书。`),
    F('no07', 'noun', '代词：主语与重读代词',
      R`je/tu/il 与 moi/toi/lui 的分工？`,
      R`**主语代词**：je、tu、il/elle、nous、vous、ils/elles——法语动词必须带主语（ unlike 中文可省）；**重读代词**：moi、toi、lui/elle、nous、vous、eux/elles——用于介词后（avec moi——和我）、强调（Moi, je...——至于我）、省略句（Moi aussi——我也是）。
vous 双义：你们 / 您（敬称）——对陌生人/长辈/复数一律 vous。
tu 与 vous 的切换（tutoyer/vouvoyer）是法语社交礼仪的一部分。`),
    // ==================== 动词与变位 ====================
    F('vb01', 'verb', '动词三组：变位的坐标系',
      R`法语动词如何分组？`,
      R`① **-er 第一组**（parler 说）——占动词八成，规则主力；② **-ir 第二组**（finir 完成）——部分规则；③ **-re 与不规则 -ir 第三组**（prendre、partir、être、avoir……）——重灾区但高频。
变位维度：人称（6 个）× 时态——法语动词是"变形金刚"，一个原形衍生成套词形。
策略：第一组变位吃透 = 面对多数动词不慌；être/avoir/aller/faire/pouvoir 五个高频不规则优先突破。`),
    F('vb02', 'verb', 'être 与 avoir：两大支柱',
      R`être 和 avoir 的变位与用途？`,
      R`**être**（是）：je suis、tu es、il est、nous sommes、vous êtes、ils sont；**avoir**（有）：j'ai、tu as、il a、nous avons、vous avez、ils ont。
用途超乎"是/有"：**avoir 是年龄的表达者**（j'ai 20 ans——我有 20 岁，不是 je suis）；两动词还是**复合时态的助动词**（复合过去时 = avoir/être + 过去分词）。
这两张变位表是法语动词大厦的地基——不熟不进下个阶段。`),
    F('vb03', 'verb', '第一组规则变位：-er 模板',
      R`parler 型动词如何变位？`,
      R`去 -er 加：**-e、-es、-e、-ons、-ez、-ent**——je parle、tu parles、il parle、nous parlons、vous parlez、ils parlent。
关键听感：单数三形（parle/parles/parle）与 ils parlent **发音完全相同**——口语靠主语代词区分。
同模板动词：travailler（工作）、aimer（爱）、manger（吃，nous 变 mangeons 保软音）、acheter（买，重读音节双写 e）。`),
    F('vb04', 'verb', 'aller 与 faire：高频不规则',
      R`aller（去）与 faire（做）的变位与用法？`,
      R`**aller**：je vais、tu vas、il va、nous allons、vous allez、ils vont——**近未来时**的载体（aller + 原形：je vais partir——我即将出发）；**faire**：je fais、tu fais、il fait、nous faisons、vous faites、ils font——万能动作词：faire du sport（运动）、faire la cuisine（做饭）、faire des courses（购物）。
aller + faire 覆盖日常动词句的半壁江山——变位不熟就天天撞墙。`),
    F('vb05', 'verb', '复合过去时（ passé composé）',
      R`法语"过去做了"如何表达？`,
      R`**avoir/être 的现在时 + 过去分词**：j'ai mangé（我吃了）、j'ai fini；**être 系动词**（aller、venir、partir、arriver、naître、mourir 等位移/状态变化 + 全部代动词）用 être 且分词随主语性数：je suis all**é**（男）/ all**ée**（女）。
过去分词构成：-er → -é、-ir → -i、prendre → pris、faire → fait、être → été。
口语叙事的主力时态——英语学习者可类比现在完成时起步。`),
    F('vb06', 'verb', '未完成过去时（imparfait）',
      R`imparfait 表达什么？与复合过去时如何分工？`,
      R`imparfait = 过去的**背景/习惯/进行中状态**：quand j'étais petit, je jouais au foot（小时候我常踢球）；构成：nous 变位词干 + -ais/-ais/-ait/-ions/-iez/-aient。
**分工铁律**：imparfait 画背景（天气、状态、习惯），passé composé 推进情节（动作事件）——il **pleuvait**（正下着雨，背景）quand je **suis sorti**（我出了门，事件）。
这是法语叙事时态的核心二分——英语没有精确对应，需重建直觉。`),
    F('vb07', 'verb', '最近将来时与简单将来时',
      R`"将要做"的两种说法？`,
      R`**最近将来时**（aller + 原形）：je vais partir（我马上出发）——口语主力，确定性强；**简单将来时**（原形 + -ai/-as/-a/-ons/-ez/-ont）：je partirai（我将出发）——正式/远期/预测。
口语 80% 用 aller + 原形——入门先把它用熟。
关系：近未来之于简单将来 ≈ going to 之于 will。`),
    F('vb08', 'verb', '代动词与命令式',
      R`se 动词与命令句如何处理？`,
      R`**代动词**（se + 动词）：je me lève（我起床）、nous nous appelons（我们叫……）——日常动作大量是代动词（s'appeler 叫什么名、se lever 起床、se coucher 睡觉）；复合时态配 être（je me suis levé）。
**命令式**：去主语留动词——Parlez!（说！）、Allons-y!（走起！）、**Va** te coucher!（去睡！aller 命令式特殊：vas → va）；否定：Ne parle pas!（别说话！）。
礼貌请求：命令式 + vous 形即可（Asseyez-vous 请坐），或条件式更委婉。`),
    // ==================== 句型与表达 ====================
    F('se01', 'sent', '问候与自我介绍',
      R`核心问候语与自我介绍怎么说？`,
      R`问候：Bonjour（白天好）、Bonsoir（晚上好）、Salut（嗨——熟人间）、Au revoir（再见）、Merci beaucoup（多谢）、S'il vous plaît（请）。
自我介绍：Je m'appelle Wang.（我叫王。）Je suis chinois(e).（我是中国人。）Enchanté(e).（幸会。）Comment allez-vous?（您好吗？）
é/enchanté 男女拼写有别（词尾 e）——口语同音、书面要对。`),
    F('se02', 'sent', '数字、时间与价格',
      R`法语数字的难点在哪？`,
      R`0-16 规则、17-19 dix-sept 系、70 = soixante-dix（60+10）、80 = quatre-vingts（4×20）、90 = quatre-vingt-dix（4×20+10）、99 = quatre-vingt-dix-neuf（4×20+10+9）——**高卢计数遗迹**是法语数字第一坑（比利时/瑞士有 septante/nonante 简化制）。
时间：Il est huit heures（八点）；价格：Ça coûte combien?（多少钱？）——C'est combien? 更口语。`),
    F('se03', 'sent', '购物与餐饮表达',
      R`购物点餐的核心句型？`,
      R`购物：Je voudrais...（我想要……——万能礼貌句式）、C'est combien?（多少钱？）、Je peux payer par carte?（能刷卡吗？）；点餐：Une table pour deux（两人桌）、La carte, s'il vous plaît（请给菜单）、L'addition, s'il vous plaît（请结账）。
Je voudrais + 名词/原形 = 法语礼貌万能钥——点餐、购物、求助通吃；比 Je veux（我要——生硬）得体得多。`),
    F('se04', 'sent', '问路与交通',
      R`出行问路的核心句？`,
      R`Où est la gare?（火车站在哪？）、Pour aller à...?（怎么去……？）、à droite/à gauche（右/左）、tout droit（直走）、à côté de（在……旁边）、en face de（对面）。
交通：prendre le métro（坐地铁——prendre 是"乘"的万能动词）、un billet pour...（一张去……的票）。
法语语流快 + 联诵——听路名先抓关键词（rue 街、avenue 大道、gare 站）。`),
    F('se05', 'sent', '表达喜好与意愿',
      R`喜欢、想要、需要的句型？`,
      R`**aimer/adorer/détester** + 名词或原形：j'aime le café（喜欢咖啡）、j'adore voyager（热爱旅行）；**vouloir**（想要）：je veux / 礼貌 je voudrais；**pouvoir**（能）：je peux...?（我能……吗——礼貌请求句首）；**devoir**（必须）：je dois partir（我得走了）。
这四个情态动词 + 原形 = 表达意愿的全部骨架——Je voudrais + Je peux 的组合就能礼貌走天下。`),
    // ==================== 文化与场景 ====================
    F('cu01', 'culture', 'tu 与 vous：敬称的社会学',
      R`tu/vous 的切换有哪些社会规则？`,
      R`默认 **vous**：陌生人、年长者、服务对象、职场上级；**tu**：家人、朋友、同辈同学；职场/学校由**上位者主动提议** tutoyer（On peut se tutoyer——咱们用你相称吧）。
时代趋势：网络与年轻人群体 tu 泛化，但初见仍 vous 稳妥——过早 tu 显冒犯，过久 vous 显生分。
对学习者：一律 vous 开局，等对方切换再跟随——零风险策略。`),
    F('cu02', 'culture', '法语的爱情与文化刻板印象核查',
      R`关于法语文化与语言的常识核查？`,
      R`法语是**联合国官方工作语言之一**、五大洲约 3 亿人使用——非洲法语人口已超欧洲（刚果、科特迪瓦、塞内加尔……），法语未来在非洲。
"法语是世界第一优雅语言"是文化叙事非语言事实——但法语确实**曾是 17-19 世纪的欧洲外交通用语**（英语的 diplomacy 词汇大量法语借词）。
法语与英语的词汇亲缘：约三分之一英语词汇源自法语（restaurant、ballet、rendezvous）——词汇迁移红利巨大。`),
    F('cu03', 'culture', '法语发音的"省略美学"',
      R`为什么说法语是"省音的语言"？`,
      R`词尾辅音不发音（petit 的 t、plural 的 s/x）、中性 e（e muet）在口语中大量吞掉（samedi 读"萨姆迪"）、联诵按条件激活——法语口语的信息密度靠**不读出来的部分**承载。
听感推论：法语听起来"圆滑连贯"是因为没有词间断裂——习得关键是**按节奏组整块模仿**，不逐词拼贴。
跟读材料推荐：慢速新闻（RFI Savoirs）→ 剧场式电影对白。`),
    F('cu04', 'culture', '法餐礼仪速览',
      R`法餐的基本礼仪？`,
      R`餐具从外向内用（每道菜一副刀叉）；面包用手掰、放盘左；手腕可搭桌沿（不藏桌下）；Bon appétit（用餐愉快）开工。
正式法餐结构：开胃菜（entrée）→ 主菜（plat）→ 奶酪（fromage）→ 甜点（dessert）——奶酪在甜点前是法式顺序。
"服务生加服务费"：法国餐厅小费非强制（账单含 service compris）——留零头即可。`),
    F('cu05', 'culture', '法语学习路径建议',
      R`法语入门的推荐节奏？`,
      R`① **语音两周**：拼读规则 + 鼻化元音 + 联诵听感（法语入门的关键投资——此后见词能读）；② **动词三件套**：être/avoir/aller 变位 → 第一组规则 → 复合过去时与 imparfait 分工；③ **教材主线**：《你好法语》或 Reflets——A1-A2 骨架；④ **输入**：慢速法语播客 + 双语字幕影视。
节奏参考：A1 约 100 小时、A2 再 150 小时、B1 再 250 小时。
本卡组用法：语音卡配朗读按钮（fr-FR）跟读纠音，变位卡按 FSRS 滚动。`),
    // ==================== 高频单词 ====================
    F('fw01', 'words', 'le temps', R`le temps`,
      R`名词（阳）· 时间；天气。多义：Je n'ai pas le temps（没时间）／Il fait beau temps（天气好）。`),
    F('fw02', 'words', "l'ami(e)", R`l'ami / l'amie`,
      R`名词（阳 ami／阴 amie）· 朋友。元音前缩合成 l'；复数：amis。`),
    F('fw03', 'words', 'la famille', R`la famille`,
      R`名词（阴）· 家庭。搭配：dans ma famille（在我家）。`),
    F('fw04', 'words', 'le professeur', R`le professeur`,
      R`名词（阳）· 老师。女教师规范形：la professeure；口语常缩为 prof。`),
    F('fw05', 'words', "aujourd'hui", R`aujourd'hui`,
      R`副词 · 今天。固定撇号词形，h 永远不发音。`),
    F('fw06', 'words', 'demain', R`demain`,
      R`副词 · 明天。搭配：à demain（明天见）。`),
    F('fw07', 'words', 'maintenant', R`maintenant`,
      R`副词 · 现在。口语常吞音读快，收听感近似「 montnang 」。`),
    F('fw08', 'words', "l'heure", R`l'heure`,
      R`名词（阴）· 钟点、小时。核心问句：Quelle heure est-il ?（现在几点）。`),
    F('fw09', 'words', 'manger', R`manger`,
      R`动词 · 吃。nous 变位加 e：mangeons（保 g 软音）；Je mange du pain。`),
    F('fw10', 'words', 'boire', R`boire`,
      R`动词 · 喝。不规则：je bois / nous buvons；搭配：boire un café。`),
    F('fw11', 'words', 'aller', R`aller`,
      R`动词 · 去。全不规则：je vais / nous allons——近未来时（aller + 原形）的载体。`),
    F('fw12', 'words', 'venir', R`venir`,
      R`动词 · 来。je viens / nous venons；venir de + 原形 = 刚刚做过某事。`),
    F('fw13', 'words', 'voir', R`voir`,
      R`动词 · 看见。je vois / nous voyons；口语：On va voir（看看再说）。`),
    F('fw14', 'words', 'écouter', R`écouter`,
      R`动词 · 听。规则 -er 变位：J'écoute de la musique（听音乐）。`),
    F('fw15', 'words', 'parler', R`parler`,
      R`动词 · 说。搭配：parler français（说法语）；Je parle un peu français。`),
    F('fw16', 'words', 'lire', R`lire`,
      R`动词 · 读。je lis / nous lisons；搭配：lire un livre（读书）。`),
    F('fw17', 'words', 'écrire', R`écrire`,
      R`动词 · 写。j'écris / nous écrivons；搭配：écrire un mail（写邮件）。`),
    F('fw18', 'words', 'acheter', R`acheter`,
      R`动词 · 买。词根重读音节加 è：j'achète / nous achetons。`),
    F('fw19', 'words', 'dormir', R`dormir`,
      R`动词 · 睡。je dors / nous dormons；搭配：dormir bien（睡得好）。`),
    F('fw20', 'words', 'travailler', R`travailler`,
      R`动词 · 工作。名词：le travail；搭配：travailler à Paris（在巴黎工作）。`),
    F('fw21', 'words', 'grand(e)', R`grand / grande`,
      R`形容词 · 大的；高的。常置名词前：une grande ville（大城市）。`),
    F('fw22', 'words', 'petit(e)', R`petit / petite`,
      R`形容词 · 小的。un petit café 既指小杯咖啡也是「浓缩咖啡」的口语说法。`),
    F('fw23', 'words', 'nouveau / nouvelle', R`nouveau / nouvelle`,
      R`形容词 · 新的。阳性元音前特殊形：un nouvel an（新年）。`),
    F('fw24', 'words', 'vieux / vieille', R`vieux / vieille`,
      R`形容词 · 旧的；老的。阳性元音前：vieil（un vieil ami 老朋友）。`),
    F('fw25', 'words', 'cher / chère', R`cher / chère`,
      R`形容词 · 贵的；亲爱的。信件开头：Cher Jean；感叹：C'est trop cher !（太贵了）。`),
    F('fw26', 'words', 'bon(ne)', R`bon / bonne`,
      R`形容词 · 好的。C'est bon !（好吃／行）；反义：mauvais。`),
    F('fw27', 'words', "l'eau", R`l'eau`,
      R`名词（阴）· 水。une bouteille d'eau（一瓶水）；气泡水：eau gazeuse。`),
    F('fw28', 'words', 'le magasin', R`le magasin`,
      R`名词（阳）· 商店。搭配：faire les magasins（逛街购物）。`),
    F('fw29', 'words', "l'école", R`l'école`,
      R`名词（阴）· 学校。搭配：aller à l'école（去上学）；大学是 université。`),
    F('fw30', 'words', 'la gare', R`la gare`,
      R`名词（阴）· 火车站。la gare de Lyon（里昂车站）——站名保持阴阳性搭配。`),
  ];

  const META = {
    bs01: [4, '起步·法语'], bs02: [4, '起步·法语'], bs03: [4, '起步·法语'], bs04: [4, '起步·法语'], bs05: [4, '起步·法语'],
    ph01: [4, '拼读规律'], ph02: [5, '鼻化元音'], ph03: [5, '联诵省音'], ph04: [3, '重音节奏'], ph05: [4, '音符系统'],
    no01: [5, '阴阳性'], no02: [5, '冠词'], no03: [4, '缩合部分冠词'], no04: [3, '否定 de'], no05: [4, '形容词一致'], no06: [3, '疑问句'], no07: [4, '代词'],
    vb01: [5, '动词三组'], vb02: [5, 'être avoir'], vb03: [5, '第一组变位'], vb04: [4, 'aller faire'], vb05: [5, '复合过去时'], vb06: [4, 'imparfait'], vb07: [3, '将来时'], vb08: [4, '代动词命令式'],
    se01: [3, '问候介绍'], se02: [4, '数字时间'], se03: [3, '购物餐饮'], se04: [3, '问路'], se05: [4, '意愿表达'],
    cu01: [3, 'tu vous'], cu02: [2, '文化核查'], cu03: [3, '省略美学'], cu04: [2, '法餐礼仪'], cu05: [2, '学习路径'],
    fw01: [4, '单词·名词'], fw02: [3, '单词·名词'], fw03: [3, '单词·名词'], fw04: [3, '单词·名词'], fw05: [4, '单词·时间'], fw06: [4, '单词·时间'],
    fw07: [3, '单词·时间'], fw08: [3, '单词·时间'], fw09: [4, '单词·动词'], fw10: [4, '单词·动词'], fw11: [5, '单词·动词'], fw12: [4, '单词·动词'],
    fw13: [3, '单词·动词'], fw14: [3, '单词·动词'], fw15: [4, '单词·动词'], fw16: [3, '单词·动词'], fw17: [3, '单词·动词'], fw18: [3, '单词·动词'],
    fw19: [3, '单词·动词'], fw20: [3, '单词·动词'], fw21: [3, '单词·形容词'], fw22: [2, '单词·形容词'], fw23: [3, '单词·形容词'], fw24: [3, '单词·形容词'],
    fw25: [3, '单词·形容词'], fw26: [3, '单词·形容词'], fw27: [3, '单词·名词'], fw28: [2, '单词·名词'], fw29: [3, '单词·名词'], fw30: [3, '单词·名词']
  };

  const PITFALL = {
    no01: R`阴阳性必须连冠词整体记（une table 而非裸记 table）——性别错引发冠词/形容词连锁错误。`,
    no04: R`否定把 un/du/des 变 de 是法语第一高频句法坑：je ne mange pas de pain。`,
    vb02: R`年龄用 avoir 不用 être：J'ai 20 ans（我有 20 岁）——直译"我是 20 岁"必错。`,
    ph03: R`没有联诵的法语单词串听起来不像法语——les amis 要读 le-za-mi。`
  };

  // 主页「语言每日一句」池：lang 为 Web Speech locale，t 原文，n 译文
  const SENTENCES = [
    { lang: 'fr-FR', t: 'Je voudrais un café, s\'il vous plaît.', n: '我想要一杯咖啡，麻烦了。（Je voudrais 是法语礼貌万能钥）' },
    { lang: 'fr-FR', t: 'Bonne chance pour ton examen !', n: '祝你的考试顺利！' },
    { lang: 'fr-FR', t: 'Excusez-moi, où sont les toilettes ?', n: '不好意思，洗手间在哪里？' },
    { lang: 'fr-FR', t: 'C\'est la vie !', n: '这就是生活啊！（法语名句，感叹人生的起伏）' },
    { lang: 'fr-FR', t: 'Ça ne prend que cinq minutes.', n: '这只要五分钟。' },
    { lang: 'fr-FR', t: 'J\'adore cette ville.', n: '我太喜欢这座城市了。' }
  ];

  const BEGINNER = ['start', 'phon', 'noun'];
  return { BEGINNER: BEGINNER, id: 'fr', name: '法语', short: '法语', icon: '🗼', kind: 'qa', group: 'lang', CATS: CATS, DATA: DATA, META: META, REL: {}, PITFALL: PITFALL, MNEM: {}, SENTENCES: SENTENCES, ORDER: ['start', 'phon', 'noun', 'verb', 'sent', 'words', 'culture'] };
})();
