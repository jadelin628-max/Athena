/*
 * 法语 · 知识点记忆数据库
 * 教材锚点：《简明法语教程》（语音 → 名词与冠词 → 动词变位 → 句型场景 → 文化）
 * 结构与其他学科一致：id / cat / title / front / back + META / PITFALL
 * 说明：无例题学科；kind: 'qa'；group: 'lang'——卡面带 Web Speech 朗读按钮（fr-FR）。
 * 进度策略=**整科重置**：旧 id（bs/ph/no/vb/se/cu/fw 等）全部替换为 mj01 起连续新 id，
 *   学习进度重置（Python v1.41 先例）。CATS/ORDER 对齐《简明法语教程》章节骨架。
 * 语言卡三段式：规则 → 例句（原文+中文翻译）→ 活用限制。
 */
window.SUBJECTS = window.SUBJECTS || {};
window.SUBJECTS.fr = (function () {
  'use strict';
  const R = String.raw;

  const CATS = {
    phon: '语音',
    noun: '名词与冠词',
    verb: '动词变位',
    sent: '句型场景',
    words: '高频词汇',
    culture: '文化与场景'
  };

  const F = (id, cat, title, front, back) => ({ id, cat, title, front, back });

  const DATA = [
    // ==================== 语音 ====================
    F('mj01', 'phon', '字母表与拼读总原则',
      R`法语拼读到底规不规律？见词能读吗？`,
      R`**规则**：法语 26 个字母与英语同序；拼写复杂但**读音方向高度规律**——同一读音常有多种拼法（eau/au/o 都读 o），反过来「字母组合 → 读音」基本固定。核心思路：先攻字母组合规则，再靠词汇积累拼写。
~~~text
eau —— 读 o（如 beau 美）
ch —— 读 sh（如 chat 猫）
gn —— 读「捏」（如 agneau 羔羊）
~~~
**活用限制**：h 永远不发音；词尾辅音多数不发音（c/r/f/l 常发音——口诀 CREF）；同音多拼要求「记词形」而不是「凭读音拼词」。`),
    F('mj02', 'phon', '元音字母与基本读音',
      R`a/e/i/o/u 和 y 怎么读？`,
      R`**规则**：a 读「阿」；e 单独或词首读「呃」（e muet）；é 读闭口 e、è 读开口 e；i/y 读「衣」；o 读「欧」（au/eau 也读 o）；u 读圆唇的「衣」（嘴唇撮圆再发 i）；ou 读「呜」（与 u 音不同）。
~~~text
ma —— 我的
lit —— 床
nous —— 我们（ou 读「呜」）
lune —— 月亮（u 读圆唇「衣」）
~~~
**活用限制**：u 与 ou 是两套音——中文母语者常把 u 读成「呜」，务必单独练；y 在词中 = i+i，词首 y = i。`),
    F('mj03', 'phon', '鼻化元音',
      R`an/en、on、in/un 这些「鼻音」怎么发？`,
      R`**规则**：四个鼻化元音——① an/en/am/em → 「昂」；② on/om → 「翁」；③ in/ain/ein/yn → 「呃」带鼻音；④ un/um → 与 in 趋同。发法：口型做好对应元音，软腭放下，气流分道鼻腔。
~~~text
enfant —— 孩子（en 读「昂」）
bon —— 好（on 读「翁」）
vin —— 酒（in 鼻化）
~~~
**活用限制**：元音字母后有 n/m 且其后还有元音时**不鼻化**（bonne 读 bɔn，不是「翁」）；鼻化与非鼻化会换词义，初期靠词例固定听感。`),
    F('mj04', 'phon', '辅音与小舌音 r',
      R`法语的 r 和英语有什么不同？辅音总表？`,
      R`**规则**：多数辅音同英语；特殊：**r 是小舌音**（在软腭/小舌处轻擦，像漱口的位置）；h 不发音；gn 读「捏」；qu 读 k（que/qui）；c 在 e/i/y 前读 s，否则读 k；g 在 e/i/y 前读「日」，否则读 g。
~~~text
rouge —— 红色（小舌音 r）
magnifique —— 极好的（gn 读「捏」）
français —— 法语（ç 读 s）
~~~
**活用限制**：r 初期可用喉部轻擦近似，不必执着完美小舌音；c/g 的软硬音取决于后接字母，不是「随便记」。`),
    F('mj05', 'phon', '音符系统',
      R`é、è、ê、ç 这些符号各是什么？`,
      R`**规则**：**é**（尖音符）闭口 e；**è/ê/ë** 开口 e；**ç**（软音符）让 c 在 a/o/u 前读 s；**â/î/ô/û** 元音加长或变音色（口语差别常不大，拼写必须写对）。
~~~text
café —— 咖啡（é 闭口）
très —— 很（è 开口）
français —— 法语（ç 读 s）
~~~
**活用限制**：音符是**词的一部分**，漏写可能写错词或显得不规范；电脑输入可用长按字母或组合键，练习时默写要带上音符。`),
    F('mj06', 'phon', '常见字母组合',
      R`eau、ai、oi、ill、ph 这些组合怎么读？`,
      R`**规则**：eau/au/o → o；ai/ei → è；oi → wa；ou → u 的「呜」；eu/œu → 圆唇「呃」；gn → 「捏」；ill/i+元音 → 多数「伊」音（fille）；ch → sh；ph → f；th → t；qu → k。
~~~text
beau —— 美的（eau 读 o）
français —— 法语（ai 读 è）
voix —— 声音（oi 读 wa）
~~~
**活用限制**：ill 在少数词里读 il（如 ville 城市）——按词记例外；组合规则管「读」不管「拼」，拼写仍要靠词汇量。`),
    F('mj07', 'phon', '联诵',
      R`什么是联诵？什么时候要连？`,
      R`**规则**：前词词尾本不发音的辅音 + 后词以元音或哑音 h 开头 → 辅音「复活」并连读。**必要联诵**：限定词+名词（les‿amis）、主语代词+动词（vous‿avez）；**禁止联诵**：et 之后；**可选联诵**：很多实词之间，语体越正式越倾向连。
~~~text
les‿amis —— 朋友们（读 le-za-mi）
vous‿avez —— 你们有（读 vou-za-vé）
nous‿allons —— 我们去（读 nu-za-lon）
~~~
**活用限制**：联诵辅音常按规则变音（s 读 z、x 读 z、f 读 v）；没有联诵的法语听起来「不像法语」——初期跟读原声比死记规则更有效。`),
    F('mj08', 'phon', '省音',
      R`l'、j'、n'、qu' 这些撇号是怎么来的？`,
      R`**规则**：le/la/je/ne/que/me/te/se/de 等以哑音 e 结尾的短词，遇到元音或哑音 h 开头的词 → 去掉 e，用撇号连接。
~~~text
l'ami —— 朋友（le + ami）
j'aime —— 我喜欢（je + aime）
n'est —— 不是（ne + est）
qu'il —— 他（que + il）
~~~
**活用限制**：la/le 遇元音都缩成 l'（不分阴阳）；ce 在 est 前是 **c'est**（去 e）；否定 ne 在口语可缩成 n' 甚至省略，但书面 ne 一般保留。`),
    F('mj09', 'phon', '节奏组与重音',
      R`法语单词有重音吗？句子怎么断句？`,
      R`**规则**：法语**词内几乎无固定重音**，各音节大致等长等重；**句子重音落在节奏组末尾**。节奏组 = 意义相连的一串词，一气呵成、末尾稍升调/重读。
~~~text
dans la cuisine —— 在厨房里（一个节奏组）
Je suis étudiant. —— 我是学生（重音落在 étudiant 末）
~~~
**活用限制**：不要按英语习惯给某个音节「重读」；朗读时按节奏组换气，不逐词蹦——这是「一听就是法语」的关键。`),
    F('mj10', 'phon', '词尾辅音规则',
      R`为什么 petit 的 t 不读、Paris 的 s 不读？`,
      R`**规则**：词尾辅音**多数不发音**；常发音的：**c、r、f、l**（口诀 CREF）；词尾 -e 常不发音（但影响前音）。
~~~text
petit —— 小的（t 不读）
Paris —— 巴黎（s 不读）
avec —— 和（c 发音）
par —— 经过（r 发音）
~~~
**活用限制**：复数词尾 s/x 不发音——「单复数听起来一样」靠冠词与上下文；联诵时词尾辅音会「临时复活」，与本规则不矛盾。`),
    F('mj11', 'phon', '哑音 h',
      R`法语的 h 到底发不发音？`,
      R`**规则**：h **永远不发音**（如 homme 读 omm）。分两类：**哑音 h**（可省音、可联诵——l'homme、les‿hommes）；**嘘音 h**（禁止联诵/省音——le héros，不读 l'héro）。
~~~text
l'homme —— 人（哑音 h，省音）
le héros —— 英雄（嘘音 h，保留 le）
~~~
**活用限制**：嘘音 h 词表需逐步记（haut、héro、haricot 等）；查词典常标「h aspiré」——初期混用不影响理解，但考试拼写要注意。`),
    F('mj12', 'phon', '数字的读音要点',
      R`法语数字为什么难读？有哪些拼读坑？`,
      R`**规则**：0–16 逐词记；17–19 = dix-sept 系；70 = soixante-dix；80 = quatre-vingts；90 = quatre-vingt-dix——**高卢二十进制遗迹**。读音注意联诵与开合口：cinq 的 c 在联诵中读 k、sept 的 t 常读出。
~~~text
trois —— 三（oi 读 wa 系的「特瓦」近似）
deux —— 二（eu 圆唇）
sept —— 七（t 常发音）
~~~
**活用限制**：比利时/瑞士有 septante、huitante/nonante 简化说法——正式法语考试以法国本土制为准；数字听辨靠「整块听」，不要逐字母拆。`),
    // ==================== 名词与冠词 ====================
    F('mj13', 'noun', '名词的阴阳性',
      R`为什么桌子是「她」、书是「他」？阴阳性怎么记？`,
      R`**规则**：每个名词自带语法性别——**阳性** le livre（书）、**阴性** la table（桌）。无生命物也有性，与意义无关。正确记法：**连冠词一起记**（记 une table，不记裸 table）。
~~~text
le livre —— 书（阳）
la chaise —— 椅子（阴）
l'école —— 学校（阴，元音前省音）
~~~
**活用限制**：阴阳性决定冠词、形容词、过去分词一致——错性会连锁错；表人名词随人的性别（acteur/actrice），规则与「物」不同。`),
    F('mj14', 'noun', '阴阳性词尾规律',
      R`有没有办法猜名词阴阳性？`,
      R`**规则**：可覆盖约八成——常见**阴性**词尾：-tion、-sion、-té、-ette、-ance、-ence、-ure、-ie；常见**阳性**词尾：-age、-ment、-eau、-acle、-isme、-ege。
~~~text
la nation —— 民族（-tion 阴）
le village —— 村庄（-age 阳）
la liberté —— 自由（-té 阴）
~~~
**活用限制**：规律有例外（le page 侍童、la image 的旧形等）——规律管「猜」，词典管「定」；表人/表语言的词另有习惯。`),
    F('mj15', 'noun', '名词的单复数',
      R`法语名词复数怎么变？读得出来吗？`,
      R`**规则**：一般加 **-s**（livre → livres）；以 s/x/z 结尾不变（la souris → les souris）；以 -eau/-eu/-al 等常变 -eaux/-eaux/-aux（bâteau → bâteaux，cheval → chevaux）。
~~~text
un ami —— des amis —— 朋友
un cheval —— des chevaux —— 马
~~~
**活用限制**：词尾 s **不发音**——单复数听感常相同，靠冠词 un/des、数词与上下文判断；联诵时 des‿amis 的 z 可提示复数。`),
    F('mj16', 'noun', '定冠词 le/la/les',
      R`le/la/les 什么时候用？`,
      R`**规则**：**定冠词**表特指、上文已提、独一无二、泛指全体——le（阳单）、la（阴单）、l'（元音/哑音 h 前）、les（复数不分性）。
~~~text
J'aime le café. —— 我喜欢咖啡。（泛指这类东西）
Où est la gare ? —— 火车站在哪？（特指）
L'ami de Paul —— 保罗的朋友（元音前省音）
~~~
**活用限制**：语言、学科、星期表习惯时用定冠词（le lundi 每周一）；与不定冠词对比记忆：泛指大类用 le，「一个」用 un。`),
    F('mj17', 'noun', '不定冠词 un/une/des',
      R`un/une/des 和 a/some 一样吗？`,
      R`**规则**：**不定冠词**表「一个/一些」、首次提及——un（阳）、une（阴）、des（复数）。
~~~text
J'ai un frère. —— 我有一个兄弟。
C'est une table. —— 这是一张桌子。
Il y a des touristes. —— 有一些游客。
~~~
**活用限制**：des 是复数不定冠词，否定时变 de；职业表语前常省冠词（Je suis étudiant——我是学生）；与定冠词的「一个 vs 那类」是初级核心对比。`),
    F('mj18', 'noun', '缩合冠词 au/aux/du/des',
      R`au、aux、du、des 从哪里来？`,
      R`**规则**：介词与冠词必须融合——à + le = **au**、à + les = **aux**；de + le = **du**、de + les = **des**。la/l' 不缩合（à la、à l'、de la、de l'）。
~~~text
Je vais au cinéma. —— 我去电影院。
C'est le livre du professeur. —— 这是老师的书。
Nous parlons de la France. —— 我们谈论法国。
~~~
**活用限制**：缩合是强制的——不能写 à le cinéma；du/des 也作部分冠词，靠语境分「缩合」还是「部分」；à la plage、de l'eau 保持原形。`),
    F('mj19', 'noun', '部分冠词',
      R`du pain、de la bière 里的 du/de la 是什么？`,
      R`**规则**：**部分冠词**（du/de la/de l'）表示「一些、一部分」不可数或未定量的东西——常用于食物、饮料、物质、抽象概念。
~~~text
Je mange du pain. —— 我吃点面包。
Elle boit de la bière. —— 她喝点啤酒。
Nous avons du temps. —— 我们有一些时间。
~~~
**活用限制**：与缩合冠词同形，靠「是否可数/是否取一部分」判断；否定时同样变 de（pas de pain）；英语 some/a 的分工在法语拆成三个冠词家族。`),
    F('mj20', 'noun', '否定句中的 de',
      R`为什么否定后 un/du/des 都变成 de？`,
      R`**规则**：完全否定（ne...pas）时，不定冠词与部分冠词统一变 **de**——「把东西整个否定没了」。
~~~text
Je mange du pain. → Je ne mange pas de pain.
J'ai un stylo. → Je n'ai pas de stylo.
~~~
**活用限制**：être 表语例外——Ce n'est pas une table（身份保留 un）；强调「不止一个」时也可保留 un；il y a 否定用 pas de（Il n'y a pas de problème）。`),
    F('mj21', 'noun', '形容词的位置',
      R`法语形容词放在名词前面还是后面？`,
      R`**规则**：**多数形容词放名词后**（une table ronde）；少数高频短形容词常**前置**（grand、petit、bon、mauvais、beau、joli、jeune、vieux、nouveau）。
~~~text
une voiture noire —— 一辆黑色的车（后置）
une petite ville —— 一座小城（前置）
un beau jardin —— 一座漂亮的花园（前置）
~~~
**活用限制**：有些形容词**前后意思不同**（un homme grand 高个子 vs un grand homme 伟人）——位置会换语义，属于中高级重点；价值判断类（beau/joli）常前置。`),
    F('mj22', 'noun', '形容词的性数一致',
      R`petit 为什么有时变 petite、有时加 s？`,
      R`**规则**：形容词必须与名词**性、数一致**——阳性常原形，阴性加 -e，复数加 -s；特殊：beau/belle、nouveau/nouvelle、blanc/blanche、heureux/heureuse 等。
~~~text
un petit garçon —— 一个小男孩
une petite fille —— 一个小女孩
deux petits chiens —— 两条小狗
~~~
**活用限制**：词尾 s/x 常不发音——书面一致听不出来，写作必须写对；元音前阳性特殊形：bel（beau → un bel homme）、nouvel、vieil。`),
    F('mj23', 'noun', '主有形容词',
      R`「我的、你的、他的」怎么说？和英语一样吗？`,
      R`**规则**：主有形容词**跟着名词的性数变**，不跟主人变——mon（我的，阳单）、ma（阴单）、mes（复）；ton/ta/tes；son/sa/ses（他/她/它的）；notre/votre/leur。
~~~text
mon frère —— 我的兄弟
ma sœur —— 我的姐妹
son livre —— 他的或她的书（看物品阴阳性）
~~~
**活用限制**：ma 遇元音开头阴性名词常改 mon（mon amie）——为省音；son livre 可能是「他的书」也可能是「她的书」——法语不标主人性别，靠语境。`),
    F('mj24', 'noun', '指示形容词 ce/cette/ces',
      R`「这个、那个」怎么修饰名词？`,
      R`**规则**：ce（阳单）、cette（阴单）、ces（复数）+ 名词——「这个/那个/这些/那些」，口语常配 -ci/-là 近指远指。
~~~text
ce livre —— 这本书
cette maison —— 这栋房子
ces étudiants —— 这些学生
~~~
**活用限制**：ce 遇元音开头阳性名词用 **cet**（cet ami）；指示形容词 ≠ 指示代词（celui/celle）——前者修饰名词，后者代替名词；与定冠词对比：ce 表「这个」，le 表「那个已知的」。`),
    F('mj25', 'noun', '主语代词与重读代词',
      R`je/tu/il 和 moi/toi/lui 有什么区别？`,
      R`**规则**：**主语代词** je、tu、il/elle、nous、vous、ils/elles 贴动词变位；**重读代词** moi、toi、lui/elle、nous、vous、eux/elles 用于介词后、强调、省略句。
~~~text
Je parle français. —— 我说法语。
Avec moi. —— 和我一起。
Moi, je préfère le thé. —— 至于我，我更喜欢茶。
~~~
**活用限制**：法语动词一般**不省主语**（与中文不同）；vous 可表「你们」或敬称「您」——对陌生人/长辈默认 vous；il/elle 还可作无人称主语（il pleut）。`),
    // ==================== 动词变位 ====================
    F('mj26', 'verb', '动词三组概览',
      R`法语动词怎么分组？变位从哪入手？`,
      R`**规则**：① **第一组 -er**（parler）占约八成，规则主力；② **第二组 -ir**（finir，变 issons）规则；③ **第三组**（-re 与不规则 -ir/-oir/-oir 等）——高频但不规则居多（être、avoir、aller、faire、prendre……）。
~~~text
parler —— 说（第一组）
finir —— 完成（第二组）
prendre —— 拿（第三组 -re）
~~~
**活用限制**：不要试图一次背完全表——先吃透第一组模板 + être/avoir/aller/faire，其余遇到一个收一个；第二组动词以 finir 型为准，部分 -ir 是第三组（partir）。`),
    F('mj27', 'verb', 'être 的变位与用法',
      R`être 怎么变？「是」以外还有什么用？`,
      R`**规则**：je suis、tu es、il est、nous sommes、vous êtes、ils sont。表身份/性质/状态，也作**代动词与部分位移动词**的复合时态助动词。
~~~text
Je suis étudiant. —— 我是学生。
Elle est contente. —— 她很高兴。
Nous sommes à Paris. —— 我们在巴黎。
~~~
**活用限制**：年龄**不用** être（用 avoir）；表语职业前常省冠词；与 avoir 并列为法语动词两大支柱——不熟不进复合时态。`),
    F('mj28', 'verb', 'avoir 的变位与用法',
      R`avoir 怎么变？年龄为什么用它？`,
      R`**规则**：j'ai、tu as、il a、nous avons、vous avez、ils ont。表「有」，也表年龄、状态感受，并作**复合过去时**主力助动词。
~~~text
J'ai 20 ans. —— 我 20 岁。
J'ai faim. —— 我饿了。
J'ai un frère. —— 我有一个兄弟。
~~~
**活用限制**：年龄、饥渴冷热等**用 avoir**（avoir faim/soif/froid）——直译「我是 20 岁」必错；j'ai 在元音前省音写 j'ai（本来就有撇号）；与 être 的助动词分工见复合过去时卡。`),
    F('mj29', 'verb', '第一组 -er 变位模板',
      R`parler 型动词现在时怎么变？`,
      R`**规则**：去 -er，加 **-e、-es、-e、-ons、-ez、-ent**。
~~~text
je parle / tu parles / il parle
nous parlons / vous parlez / ils parlent
~~~
**活用限制**：单数三形与 ils parlent **发音相同**——口语靠主语代词区分；manger 的 nous 保留软音 mangeons；acheter 重读音节变 è（j'achète）；这是覆盖八成动词的主模板。`),
    F('mj30', 'verb', '第二组 -ir 变位模板',
      R`finir 型动词现在时怎么变？`,
      R`**规则**：去 -ir，加 **-is、-is、-it、-issons、-issez、-issent**。
~~~text
je finis / tu finis / il finit
nous finissons / vous finissez / ils finissent
~~~
**活用限制**：只有 **finir 型**走本模板（choisir、réussir 等）；partir、sortir、dormir 等 -ir 走第三组（去词根加 s）——**同是 -ir 不同族**，按词记。`),
    F('mj31', 'verb', '第三组 -re 变位模板',
      R`prendre、vendre 型怎么变？`,
      R`**规则**：去 -re，加 **-s、-s、（无）、-ons、-ez、-ent**——第三人称单数**无词尾**。
~~~text
je prends / tu prends / il prend
nous prenons / vous prenez / ils prennent
~~~
**活用限制**：il prend 这类「光杆」第三人称是听感难点；prendre 等在 nous/vous 处换词根（prenons）；第三组内部差异大，高频词单独攻克。`),
    F('mj32', 'verb', 'aller：去与最近将来时',
      R`aller 怎么变？「将要去」为什么用它？`,
      R`**规则**：je vais、tu vas、il va、nous allons、vous allez、ils vont。**最近将来时** = aller 现在时 + 动词原形。
~~~text
Je vais au cinéma. —— 我去电影院。
Je vais partir demain. —— 我明天就要出发。
~~~
**活用限制**：aller 还用于问候 Ça va ?（还好吗）；命令式特殊：**Va** !（不是 *Vas pour le tutoiement 标准命令）；最近将来时确定性强，口语 80% 用它表达将来。`),
    F('mj33', 'verb', 'faire：做与万能搭配',
      R`faire 怎么变？为什么说它是万能动词？`,
      R`**规则**：je fais、tu fais、il fait、nous faisons、vous faites、ils font。与名词搭配表达大量日常动作。
~~~text
faire du sport —— 运动
faire la cuisine —— 做饭
Il fait beau. —— 天气好。
~~~
**活用限制**：nous faisons、vous faites 是特殊形；天气无人称用 il fait（chaud/froid/beau）；与 avoir/faire 的复合过去时：j'ai fait；不要把 faire 只当「做」译，搭配整体记。`),
    F('mj34', 'verb', 'pouvoir / vouloir / devoir',
      R`「能、想、必须」三个情态动词怎么用？`,
      R`**规则**：pouvoir（能）je peux…；vouloir（想）je veux…，礼貌 je voudrais…；devoir（应该/欠）je dois… + 原形。
~~~text
Je peux vous aider ? —— 我能帮您吗？
Je voudrais un café. —— 我想要一杯咖啡。
Je dois travailler. —— 我必须工作。
~~~
**活用限制**：三者 + 原形构成意愿能力骨架；Je veux 对陌生人偏生硬——对外用 Je voudrais 或 Je peux；devoir 还表「欠」（Je vous dois 10 euros）。`),
    F('mj35', 'verb', '复合过去时：avoir + 过去分词',
      R`「做了某事」怎么表达？`,
      R`**规则**：**复合过去时** = avoir/être 现在时 + 过去分词。avoir 系最常见：j'ai mangé（我吃了）。
~~~text
J'ai mangé une pomme. —— 我吃了一个苹果。
Elle a fini ses devoirs. —— 她做完了作业。
~~~
**活用限制**：这是口语叙事主力；英语学习者可类比现在完成时，但法语也用于昨天的完成动作；与未完成过去时的分工是法语时态核心。`),
    F('mj36', 'verb', 'être 作助动词的复合过去时',
      R`je suis allé 为什么用 être？性数怎么变？`,
      R`**规则**：位移/状态变化类（aller、venir、partir、arriver、entrer、sortir、monter、descendre、naître、mourir、rester、tomber 等）+ **全部代动词**用 être，过去分词**随主语性数**。
~~~text
Je suis allé（男）/ allée（女）. —— 我去了。
Elles sont arrivées. —— 她们到了。
~~~
**活用限制**：性数词尾常不发音——书写必须写对；部分动词（monter/descendre 等）带直接宾语时可退回 avoir（j'ai monté les valises）；记忆口诀：来去出生死、进出上下余（DR & MRS VANDERTRAMP 型）。`),
    F('mj37', 'verb', '过去分词的构成',
      R`过去分词怎么从原形变出来？`,
      R`**规则**：-er → **-é**（parler → parlé）；-ir → **-i**（finir → fini，第二组）；-re → **-u** 或不规则（vendre → vendu；prendre → pris）。
~~~text
manger → mangé —— 吃了
finir → fini —— 做完
faire → fait —— 做了（不规则）
être → été / avoir → eu（不规则）
~~~
**活用限制**：第三组不规则分词需单独记（pris、fait、écrit、ouvert、lu、mis……）；代动词分词一致规则同 être 系；读音注意 -é/-er 同音，靠上下文与拼写。`),
    F('mj38', 'verb', '未完成过去时 imparfait',
      R`「小时候、当时、正在」用什么时态？`,
      R`**规则**：构成 = **nous 现在时词干** + -ais、-ais、-ait、-ions、-iez、-aient。表过去背景、习惯、持续状态。
~~~text
Quand j'étais petit, je jouais au foot.
—— 小时候我常踢球。
Il pleuvait. —— （当时）正在下雨。
~~~
**活用限制**：词干来自 nous（nous faisons → fais- → je faisais）；être 全不规则（j'étais）；与复合过去时对比：imparfait 画背景，passé composé 推情节。`),
    F('mj39', 'verb', '复合过去时 vs 未完成过去时',
      R`两个过去时态怎么分工？一句话里如何配合？`,
      R`**规则**：**imparfait** = 背景/习惯/状态/正在进行；**passé composé** = 完成事件、推动情节。经典对比：动作打断背景。
~~~text
Il pleuvait quand je suis sorti.
—— 我出门时天在下雨。
Quand j'étais enfant, je lisais souvent.
—— 我小时候常常读书。
~~~
**活用限制**：英语没有精确对应，需重建直觉；「昨天吃了饭」用 passé composé，「当时很饿」用 imparfait；叙述文两者交织是标准范式。`),
    F('mj40', 'verb', '最近将来时',
      R`「马上就要做」怎么说？`,
      R`**规则**：**aller 现在时 + 原形**——最近将来时，口语主力，确定性/近期感强。
~~~text
Je vais sortir. —— 我要出门了。
Nous allons déménager. —— 我们就要搬家了。
~~~
**活用限制**：与简单将来时对比：最近将来 ≈ going to，简单将来 ≈ will；aller 本身有「去」义时勿误判成时态——看后接是否原形；否定：Je ne vais pas sortir。`),
    F('mj41', 'verb', '简单将来时',
      R`「我将……」正式说法是什么？`,
      R`**规则**：原形 + **-ai、-as、-a、-ons、-ez、-ont**（部分不规则：être → serai、avoir → aurai、aller → irai、faire → ferai）。
~~~text
Je parlerai demain. —— 我明天再谈。
Il fera beau. —— 天会好起来的。
~~~
**活用限制**：用于远期、承诺、预测、条件句后项；口语日常更多用最近将来时；词尾 -ai 读 è，与「我有」j'ai 不同形。`),
    F('mj42', 'verb', '命令式',
      R`「坐下！别说话！」命令句怎么造？`,
      R`**规则**：去主语，留动词——三个人称：tu、nous、vous。规则动词命令式词尾像去掉主语的现在时（Parle ! Parlons ! Parlez !）；否定 ne...pas 包围。
~~~text
Parlez plus fort ! —— 请说大声点！
Allons-y ! —— 我们走吧！
Ne fumez pas ici. —— 请勿在此吸烟。
~~~
**活用限制**：**tu 型 -er 动词命令式去掉词尾 s**（Parle，不是 *Parles）；代动词命令式：toi 肯定省 te（Lève-toi），nous/vous 保留（Asseyez-vous）；礼貌请求也可用条件式更委婉。`),
    F('mj43', 'verb', '代动词 se',
      R`se lever、s'appeler 这类动词怎么变位？`,
      R`**规则**：代动词 = 自反代词 me/te/se/nous/vous/se + 动词；复合时态用 **être**，分词可随主语一致。
~~~text
Je me lève à six heures. —— 我六点起床。
Elle s'appelle Marie. —— 她叫玛丽。
Nous nous sommes levés tôt. —— 我们早起了。
~~~
**活用限制**：意义可为自反、相互、被动或纯代动词（se souvenir）；否定包围自反代词（Je ne me lève pas）；命令式 tu 型省 te（Lève-toi !）。`),
    F('mj44', 'verb', '直接宾语代词',
      R`le/la/les 作代词时放哪里？`,
      R`**规则**：me、te、le/la、nous、vous、les 替代**直接宾语**，放在**相关动词前**；否定环绕：ne + 代词 + 动词 + pas。
~~~text
Tu vois Marie ? —— Oui, je **la** vois.
你看见玛丽了吗？——是的，我看见她了。
Je ne **le** sais pas. —— 我不知道那件事。
~~~
**活用限制**：与冠词 le/la 同形，靠位置判断；复合过去时中若无前置直接宾语，分词不变（j'ai vu Marie → je l'ai vue，代词前置则一致）；元音前 me/te 可省音 m'/t'。`),
    F('mj45', 'verb', '间接宾语代词 lui/leur',
      R`「告诉他」「给他们」怎么替换？`,
      R`**规则**：间接宾语代词 me/te/**lui**/nous/vous/**leur** 替代 **à + 人**；仍放动词前。
~~~text
Je parle à Paul. —— Je **lui** parle.
我对保罗说话。——我对他说话。
Nous téléphonons à nos parents. —— Nous **leur** téléphonons.
我们给父母打电话。——我们给他们打电话。
~~~
**活用限制**：lui/leur 只给**人**（间接）；物的 à 用 y；与直接宾语 le/la/les 同一动词前位置，**排序**：me/te/se → le/la/les → lui/leur → nous/vous/les（先直宾后间宾）。`),
    F('mj46', 'verb', '条件式现在时',
      R`「我想要……」「如果……就会」怎么说更委婉？`,
      R`**规则**：词干同简单将来时，词尾同未完成过去时：-ais、-ais、-ait、-ions、-iez、-aient。表礼貌愿望、假设结果、传闻。
~~~text
Je voudrais un thé. —— 我想要杯茶。
Si j'avais le temps, je voyagerais.
—— 如果我有时间，我就会去旅行。
~~~
**活用限制**：礼貌条件式是点餐求助万能钥；条件从句 si + imparfait → 条件式主句；si + plus-que-parfait → 条件式过去——时态配合勿跳级。`),
    F('mj47', 'verb', '虚拟式现在时',
      R`什么时候必须用虚拟式？`,
      R`**规则**：表愿望、怀疑、必须、情感等从句常用 **que + 虚拟式**。构成：去现在时 ils 词尾 -ent，加 **-e、-es、-e、-ions、-iez、-ent**（être/avoir/aller/faire 有特殊形）。
~~~text
Il faut que je parte. —— 我必须走。
Je veux que tu viennes. —— 我要你来。
~~~
**活用限制**：入门先记高频触发：il faut que、vouloir que、douter que、il est possible que；事实陈述、penser/croire 肯定多用直陈式；虚拟式是中级门槛，初期会认触发词即可。`),
    F('mj48', 'verb', '现在分词与副动词',
      R`「一边走一边说」怎么表达？`,
      R`**规则**：**现在分词** = 原形去 -er 加 -ant（parlant）；第二组去 -issant（finissant）；être/ayant/partant/voulant 不规则。**副动词** = en + 现在分词。
~~~text
En marchant, il réfléchit.
—— 他一边走一边思考。
Étant malade, elle est restée à la maison.
—— 因为生病，她留在了家里。
~~~
**活用限制**：副动词表同时或方式，主句主语必须同一人；现在分词可较书面；不要与英语 -ing 的所有用法对号入座。`),
    // ==================== 句型场景 ====================
    F('mj49', 'sent', '问候与告别',
      R`见面、分开怎么说？白天晚上有区别吗？`,
      R`**规则**：白天 **Bonjour**、晚上 **Bonsoir**；熟人 **Salut**；再见 **Au revoir**、回头见 **À bientôt**；感谢 Merci（beaucoup）；请 S'il vous plaît；抱歉 Excusez-moi / Pardon。
~~~text
Bonjour, comment allez-vous ?
—— 您好，您好吗？
Bonsoir, à demain !
—— 晚上好，明天见！
~~~
**活用限制**：对陌生人用您称与正式问候，Salut 仅同辈熟人；进店进办公室通常先说 Bonjour——不说会显得失礼；Ça va ? 既是问句也是应答「还行」。`),
    F('mj50', 'sent', '自我介绍',
      R`怎么介绍名字、国籍与身份？`,
      R`**规则**：Je m'appelle…（我叫……）；Je suis…（我是……）；Je viens de…（我来自……）；Enchanté(e)（幸会）。
~~~text
Je m'appelle Wang. Je suis chinois.
—— 我叫王。我是中国人。
Enchantée ! Moi, c'est Marie.
—— 幸会！我叫玛丽。
~~~
**活用限制**：Enchanté 阴性加 -e（书面）；职业表语前常省冠词（Je suis professeur）；中方名可在法语语境保留，介绍时读音可就近法语化。`),
    F('mj51', 'sent', '疑问句的三种形态',
      R`问句一定倒装吗？口语怎么说？`,
      R`**规则**：① **语调疑问**（口语）：Tu viens ? ② **Est-ce que** + 陈述：Est-ce que tu viens ? ③ **主谓倒装**（正式）：Viens-tu ? / Venez-vous ?
~~~text
Tu parles français ? —— 你说法语吗？
Est-ce qu'il y a un café ?
—— 这里有咖啡馆吗？
~~~
**活用限制**：口语优先语调句与 Est-ce que；倒装常见于书面与郑重场合；que 在元音前变 qu'（Qu'est-ce que c'est ?）。`),
    F('mj52', 'sent', '疑问词',
      R`谁、什么、哪里、何时、为什么、怎么问？`,
      R`**规则**：qui（谁）、que/quoi（什么）、où（哪里）、quand（何时）、pourquoi（为何）、comment（怎样）、combien（多少）。
~~~text
Où est la gare ? —— 火车站在哪？
Pourquoi apprends-tu le français ?
—— 你为什么学法语？
~~~
**活用限制**：que 作宾语疑问词在句首（Que fais-tu ?）；quoi 常在介词后或口语独立（Tu veux quoi ?）；combien 后可接 de + 名词（combien d'élèves）。`),
    F('mj53', 'sent', '否定结构 ne...pas',
      R`法语否定怎么写？口语可以省 ne 吗？`,
      R`**规则**：**ne + 动词 + pas**（其他否定词：plus、jamais、rien、personne、que）。元音前 ne 缩 n'。书面规范保留 ne。
~~~text
Je ne sais pas. —— 我不知道。
Il n'y a personne. —— 一个人都没有。
Je n'ai rien. —— 我什么都没有。
~~~
**活用限制**：口语常省 ne（Je sais pas）——考试与写作要写全；否定宾语代词 rien 的位置：Je ne vois rien；否定中冠词变 de 的规则见名词章。`),
    F('mj54', 'sent', '数字、时间与价格',
      R`几点、多少钱怎么说？数字难点在哪？`,
      R`**规则**：时间 Il est huit heures / huit heures et demie / neuf heures moins le quart；价格 Ça fait / C'est combien ?
~~~text
Quelle heure est-il ? —— 现在几点？
Il est trois heures et quart. —— 三点一刻。
C'est combien ? —— 多少钱？
~~~
**活用限制**：70/80/90 用 soixante-dix、quatre-vingts、quatre-vingt-dix；价格可用口语 C'est combien ?；钟点用 être，年龄用 avoir——勿混。`),
    F('mj55', 'sent', '日期与星期',
      R`星期几、几月几号怎么说？`,
      R`**规则**：星期与月份名词**首字母小写**；日期用 le + 日 + 月（le 3 mai）；问日：Quel jour sommes-nous ? / Quelle date sommes-nous ?
~~~text
Nous sommes lundi. —— 今天是周一。
C'est le 14 juillet. —— 今天是七月十四日。
~~~
**活用限制**：le lundi = 每周一（习惯），lundi = 这个周一（时间点）；每月第一天用 le 1er；月份前介词 en（en mai）。`),
    F('mj56', 'sent', '购物表达',
      R`想买某物、问价、付款怎么说？`,
      R`**规则**：Je voudrais…（我想要……）；C'est combien ?（多少钱）；Je peux payer par carte ?（能刷卡吗）；Je regarde, merci（我只是看看，谢谢）。
~~~text
Je voudrais ce pull, s'il vous plaît.
—— 我想要这件毛衣，劳驾。
Ça fait 25 euros. —— 一共 25 欧。
~~~
**活用限制**：Je voudrais 比 Je veux 得体；店员问 On peut vous aider ? 可答 Non merci, je regarde；试衣间 cabine d'essayage——场景词成串记。`),
    F('mj57', 'sent', '餐饮点单',
      R`餐厅怎么点餐、结账？`,
      R`**规则**：La carte, s'il vous plaît（请给菜单）；Je prends…（我要……）；L'addition, s'il vous plaît（请结账）；Pour deux（两位）。
~~~text
Une table pour deux, s'il vous plaît.
—— 请给一张两人桌。
Je prends le menu du jour.
—— 我要今日套餐。
~~~
**活用限制**：menu 在法语常指「套餐」，单点菜单用 la carte；Bon appétit 开工用语；法国小费非强制（service compris）；dans le restaurant 用 dans，不用 à。`),
    F('mj58', 'sent', '问路与交通',
      R`怎么问路、坐车？`,
      R`**规则**：Où est… ? / Pour aller à… ?；à droite / à gauche / tout droit；à côté de / en face de；prendre le métro / le bus / le train；un billet pour…
~~~text
Excusez-moi, où est le métro ?
—— 不好意思，地铁在哪？
C'est à droite, en face de la banque.
—— 在右边，银行对面。
~~~
**活用限制**：prendre 是「乘」的万能动词；听路名抓关键词（rue、avenue、place、gare）；介词 à 表方向目的地（à Paris），dans la rue 在街道空间里。`),
    F('mj59', 'sent', '天气表达',
      R`法语怎么聊天气？`,
      R`**规则**：无人称 **il fait** + 形容词/度数；il pleut（下雨）、il neige（下雪）、il y a du vent（有风）。
~~~text
Il fait beau aujourd'hui. —— 今天天气好。
Il fait 25 degrés. —— 现在 25 度。
Il pleut, prends un parapluie.
—— 下雨了，带把伞。
~~~
**活用限制**：说天气用 il fait/il pleut，不说 *il est chaud（那是人热）；人感到冷热用 avoir（j'ai froid/chaud）——与天气表达分工。`),
    F('mj60', 'sent', '存在句 il y a',
      R`「有……」为什么是 il y a？怎么否定？`,
      R`**规则**：**il y a** = 有/存在（单复数同形）；否定 il n'y a pas de…；疑问 y a-t-il…? / Est-ce qu'il y a…?
~~~text
Il y a un problème. —— 有个问题。
Il n'y a pas de café. —— 没有咖啡。
Qu'est-ce qu'il y a ? —— 怎么了／有什么？
~~~
**活用限制**：与「某人在某处」的 être 句对比：Il y a un chat（有只猫）vs Le chat est ici（猫在这）；否定中冠词变 de；il y a 也是「刚才/自从」（il y a deux jours 两天前）。`),
    F('mj61', 'sent', '比较级与最高级',
      R`「更……」「最……」怎么说？`,
      R`**规则**：plus…que（比……更）、moins…que（不如）、aussi…que（一样）；最高级 le/la/les plus + 形容词（常 + de + 范围）。不规则：bon → meilleur、bien → mieux、mauvais → pire。
~~~text
Paul est plus grand que moi.
—— 保罗比我高。
C'est le plus beau jour.
—— 这是最美的一天。
~~~
**活用限制**：形容词仍与主语性数一致（elle est plus grande）；口语 plus 词尾 s 常不读；最高级前冠词必须保留（la plus belle，不是 *plus belle 名词前裸用）。`),
    F('mj62', 'sent', '喜好与意愿',
      R`喜欢、热爱、讨厌怎么说？对象用什么介词？`,
      R`**规则**：aimer / adorer / détester + 名词或原形；aimer bien（挺喜欢）；préférer（更喜欢）；je n'aime pas beaucoup（不太喜欢）。
~~~text
J'aime le café. —— 我喜欢咖啡。
J'adore voyager. —— 我热爱旅行。
Je préfère le thé au café.
—— 茶和咖啡我更喜欢茶。
~~~
**活用限制**：aimer 指人 = 爱，aimer bien 反而更「喜欢不那么热烈」——语感微妙；préférer A à B（更爱 A 而非 B）；第三人称好恶常用条件式委婉（il aimerait）。`),
    F('mj63', 'sent', '邀请与建议',
      R`「一起去吧？」「要不要……」怎么委婉说？`,
      R`**规则**：On va…?（咱们去……好吗）；Voulez-vous…? / Tu veux…?；Ça te dit ?（你感兴趣吗）；条件式礼貌：Vous voudriez…?
~~~text
On va au cinéma ce soir ?
—— 今晚去看电影好吗？
Ça vous dit de prendre un café ?
—— 要不要一起喝杯咖啡？
~~~
**活用限制**：命令式也可邀请但偏直接（Allons-y）；拒绝留有余地：Je suis désolé, je ne peux pas；vous/tu 与邀请语气要匹配对象。`),
    F('mj64', 'sent', '描述人物与性格',
      R`怎么说「他高个子、性格好」？`,
      R`**规则**：être + 形容词描述；avoir + 身体特征（avoir les cheveux noirs）；性格形容词多后置或按价值类前置。
~~~text
Il est grand et sportif.
—— 他又高又爱运动。
Elle a les yeux bleus.
—— 她有一双蓝眼睛。
~~~
**活用限制**：眼睛/头发用 avoir 不用 être；形容词性数一致（elle est grande）；poli/gentil/sympa 等评价词注意语境与过度夸赞的语感。`),
    F('mj65', 'sent', '打电话',
      R`电话里怎么确认身份、留话？`,
      R`**规则**：Allô ?（喂）；C'est de la part de qui ?（您是哪位）；Je voudrais parler à…（我想找……）；Puis-je laisser un message ?（可以留言吗）。
~~~text
Allô, c'est Marie. Je voudrais parler à Paul.
—— 喂，我是玛丽，我想找保罗。
Un instant, je vous le passe.
—— 请稍等，我给您转接。
~~~
**活用限制**：电话用 c'est… 自报身份比 je suis 更自然；Pardon ? 表没听清要求重复；手机语境越来越短句化，但正式转接仍用敬称。`),
    F('mj66', 'sent', '因果与目的',
      R`「因为」「为了」怎么说？`,
      R`**规则**：parce que / car（因为，后接句）；à cause de / grâce à + 名词（因为/多亏）；pour + 原形 或 afin de（为了）。
~~~text
Je reste parce qu'il pleut.
—— 我留下是因为下雨。
Grâce à toi, j'ai réussi.
—— 多亏了你，我成功了。
~~~
**活用限制**：parce que 回答 pourquoi 最常用；à cause de 常偏消极、grâce à 偏积极；pour + 人 = 给某人（ce livre est pour toi）——与目的 pour + 原形区分。`),
    // ==================== 高频词汇 ====================
    F('mj67', 'words', 'le temps', R`le temps`,
      R`**词义**：名词（阳）· 时间；天气。
~~~text
Je n'ai pas le temps. —— 我没时间。
Il fait beau temps. —— 天气好。
~~~
**活用限制**：多义——时间与天气；复数 les temps 表「时代」；与 l'heure（钟点）勿混。`),
    F('mj68', 'words', "l'ami / l'amie", R`l'ami / l'amie`,
      R`**词义**：名词（阳 ami／阴 amie）· 朋友。
~~~text
C'est mon ami. —— 这是我的朋友。
~~~
**活用限制**：元音前缩合成 l'；复数 amis/amies；与 copain/copine（口语伙伴）语体不同。`),
    F('mj69', 'words', 'la famille', R`la famille`,
      R`**词义**：名词（阴）· 家庭。
~~~text
Dans ma famille, nous sommes quatre.
—— 我们家四口人。
~~~
**活用限制**：famille 集合名词；成员另词：le père、la mère、le frère、la sœur——成对记阴阳。`),
    F('mj70', 'words', 'le professeur', R`le professeur`,
      R`**词义**：名词（阳）· 老师。
~~~text
Le professeur entre dans la classe.
—— 老师走进教室。
~~~
**活用限制**：女教师规范形 la professeure；口语可缩 prof；大学层级还有 maître/moniteur 等勿混。`),
    F('mj71', 'words', "aujourd'hui", R`aujourd'hui`,
      R`**词义**：副词 · 今天。
~~~text
Aujourd'hui, il fait froid.
—— 今天很冷。
~~~
**活用限制**：固定撇号词形，h 不发音；与 ce matin / ce soir / demain / hier 组成时间小词串。`),
    F('mj72', 'words', 'maintenant', R`maintenant`,
      R`**词义**：副词 · 现在。
~~~text
Je suis occupé maintenant.
—— 我现在很忙。
~~~
**活用限制**：口语快读可吞音；toute de suite（马上）比 maintenant 更「立刻」——时间副词梯度：maintenant → bientôt → tout à l'heure。`),
    F('mj73', 'words', "l'heure", R`l'heure`,
      R`**词义**：名词（阴）· 钟点；小时。
~~~text
Quelle heure est-il ? —— 现在几点？
Ça prend une heure. —— 这要一小时。
~~~
**活用限制**：问钟点用 être（quelle heure est-il）；「有时间」用 avoir le temps；à l'heure = 准时。`),
    F('mj74', 'words', 'manger', R`manger`,
      R`**词义**：动词 · 吃。
~~~text
Je mange du pain. —— 我吃点面包。
~~~
**活用限制**：nous mangeons 保留 g 软音（加 e）；搭配 boire 吃喝成对；过去分词 mangé。`),
    F('mj75', 'words', 'boire', R`boire`,
      R`**词义**：动词 · 喝。
~~~text
Elle boit de l'eau. —— 她喝水。
~~~
**活用限制**：不规则——je bois / nous buvons / ils boivent；搭配 boire un café / un verre de vin。`),
    F('mj76', 'words', 'parler', R`parler`,
      R`**词义**：动词 · 说；讲（语言）。
~~~text
Je parle un peu français.
—— 我会说一点法语。
~~~
**活用限制**：parler + 语言不加 de；parler à qqn（对某人说）vs parler de qqch（谈论某事）——介词分工。`),
    F('mj77', 'words', 'lire / écrire', R`lire / écrire`,
      R`**词义**：动词 · 读 / 写。
~~~text
Je lis un livre. —— 我在读一本书。
J'écris un mail. —— 我在写邮件。
~~~
**活用限制**：lire 不规则（je lis / nous lisons）；écrire → écrit 过去分词；lire 还表「写着」（il est écrit）。`),
    F('mj78', 'words', 'travailler', R`travailler`,
      R`**词义**：动词 · 工作。
~~~text
Il travaille à Paris.
—— 他在巴黎工作。
~~~
**活用限制**：名词 le travail；travailler à（在……工作）vs travailler pour（为……工作）；学生用 étudier / faire ses devoirs 更贴。`),
    F('mj79', 'words', 'grand / petit', R`grand / petit(e)`,
      R`**词义**：形容词 · 大/高；小。
~~~text
une grande ville —— 一座大城市
un petit café —— 一小杯咖啡
~~~
**活用限制**：常置名词前；grand homme 伟人 vs homme grand 高个子——位置换义；petit 还指「小份」（餐饮）。`),
    F('mj80', 'words', 'bon / mauvais', R`bon / bonne · mauvais`,
      R`**词义**：形容词 · 好的；坏的。
~~~text
C'est bon ! —— 好吃！／行了！
C'est mauvais pour la santé.
—— 这对健康不好。
~~~
**活用限制**：bon 前置居多；比较级不规则 meilleur/pire；C'est bon 语义宽（好吃、行、可以）——靠语境；mêmes 勿与 mauvais 混淆拼写。`),
    // ==================== 文化与场景 ====================
    F('mj81', 'culture', 'tu 与 vous：敬称的社会学',
      R`什么时候用你？什么时候用您？`,
      R`**规则**：默认 **vous**——陌生人、长辈、职场上级、服务对象；**tu**——家人、朋友、同辈；由上位者主动提议 On peut se tutoyer。
~~~text
Vous êtes étudiant ?
—— 您是学生吗？（敬称）
On se tutoie ?
—— 咱们用你相称吧？
~~~
**活用限制**：过早 tu 显冒犯，过久 vous 显生分；学习者一律 vous 开局最稳；网络与年轻人间 tu 泛化，但初见仍vous。`),
    F('mj82', 'culture', '法语世界与法语地位',
      R`法语只在法国说吗？`,
      R`**规则**：法语是联合国工作语言之一，约三亿使用者分布欧洲、非洲、北美、大洋洲——非洲法语人口已超欧洲。
~~~text
Le français se parle en France, en Belgique, en Suisse, au Canada, en Afrique…
—— 法语通行于法国、比利时、瑞士、加拿大、非洲等地……
~~~
**活用限制**：口音与词汇有地域差异（比利时/瑞士数字说法等）；入门以法国本土标准语为准，听力可逐步拓展；「法语=优雅」是文化叙事，不是语言学事实。`),
    F('mj83', 'culture', '面贴面礼与社交距离',
      R`法国人见面真的贴脸吗？`,
      R`**规则**：熟人之间常见 **la bise**（面贴面礼，贴颊并轻声）；正式场合握手（la poignée de main）；职场初识握手，熟后可能转 bise。
~~~text
Tu fais la bise à ta famille ?
—— 你跟家人贴面礼吗？
~~~
**活用限制**：bise 次数与贴法地区有差异（两下最常见）；不熟的人贸然 bise 会尴尬——先握手；疫情后握手/bise 都更弹性，观察对方动作跟随。`),
    F('mj84', 'culture', '法餐礼仪速览',
      R`正式法餐顺序与餐具怎么用？`,
      R`**规则**：顺序常为开胃菜 → 主菜 → 奶酪 → 甜点（奶酪在甜点前）；餐具由外向内取用；面包放盘侧、可手掰；Bon appétit 开动。
~~~text
L'addition, s'il vous plaît.
—— 请结账。（用餐结束语）
~~~
**活用限制**：小费非强制（账单常含 service），留零头即可；不要在上主菜前把面包当主食堆满盘；红酒杯、水杯顺序跟主人。`),
    F('mj85', 'culture', '法语与英语的词汇亲缘',
      R`为什么很多英语词像法语？`,
      R`**规则**：英语大量词汇来自法语（诺曼征服等历史）——restaurant、ballet、rendezvous、government 等，发音英化、拼写近似。
~~~text
un restaurant / a restaurant
une nation / a nation
~~~
**活用限制**：同形词**假朋友**（false friends）要防——actuellement（目前）≠ actually（其实）、librairie（书店）≠ library（图书馆）；红利要会用，陷阱要单列。`),
    F('mj86', 'culture', '节日与公共假期',
      R`法国重要节日有哪些？`,
      R`**规则**：1月1日元旦、复活节周一、5月1日劳动节、5月8日胜利日、耶稣升天节、圣灵降临节周一、7月14日国庆、8月15日圣母升天、11月1日诸圣、11月11日一战停战、12月25日圣诞。
~~~text
Bonne année ! —— 新年好！
Joyeux Noël ! —— 圣诞快乐！
~~~
**活用限制**：许多节日依复活节浮动，年年略有不同；8月假期城市商家可能歇业——旅行要预判；节日祝语与英美不完全相同（法语不说 merry Christmas 直译）。`),
    F('mj87', 'culture', '书信与邮件称呼',
      R`给法国人写信开头结尾怎么写？`,
      R`**规则**：正式信开头 Monsieur / Madame（不知性别可用 Monsieur, Madame）；结尾 Veuillez agréer, Monsieur, l'expression de mes salutations distinguées（或简化 salutations distinguées）；熟人可用 Bien à toi / Cordialement。
~~~text
Cher Paul, —— 亲爱的保罗，
Bien à toi, —— 祝好，
~~~
**活用限制**：Cher + 名用于熟人；正式对陌生机构用 Monsieur/Madame 不带 Cher；邮件比书信可缩短套语，但完全裸奔 Hi 过于美式。`),
    F('mj88', 'culture', '法语学习路径建议',
      R`按什么顺序学《简明法语教程》最稳？`,
      R`**规则**：① 语音两周（拼读+联诵+鼻化）——见词能读；② 名词冠词与形容词一致——连冠词记词；③ 动词三件套（être/avoir/第一组）→ 复合过去时/未完成过去时分工；④ 场景句型反复输出；⑤ 阅读与听力加码。
~~~text
Un peu chaque jour. —— 每天一点。
Ça vient avec la pratique.
—— 熟了自然就会。
~~~
**活用限制**：不要跳过语音直奔变位表——发音地基坏了后期全拧；本卡组按教材章序滚动；进度策略=**整科重置**，从语音章重新开跑。`),
  ];

  const META = {
    mj01: [5, '拼读总原则'], mj02: [5, '元音读音'], mj03: [5, '鼻化元音'], mj04: [4, '辅音小舌音'],
    mj05: [4, '音符系统'], mj06: [4, '字母组合'], mj07: [5, '联诵'], mj08: [5, '省音'],
    mj09: [3, '节奏重音'], mj10: [4, '词尾辅音'], mj11: [3, '哑音h'], mj12: [3, '数字读音'],

    mj13: [5, '阴阳性'], mj14: [4, '阴阳性规律'], mj15: [4, '单复数'], mj16: [5, '定冠词'],
    mj17: [5, '不定冠词'], mj18: [4, '缩合冠词'], mj19: [4, '部分冠词'], mj20: [4, '否定de'],
    mj21: [4, '形容词位置'], mj22: [5, '性数一致'], mj23: [4, '主有形容词'], mj24: [3, '指示形容词'],
    mj25: [4, '主语重读代词'],

    mj26: [5, '动词三组'], mj27: [5, 'être'], mj28: [5, 'avoir'], mj29: [5, '第一组变位'],
    mj30: [4, '第二组变位'], mj31: [4, '第三组re'], mj32: [5, 'aller'], mj33: [5, 'faire'],
    mj34: [5, '情态动词'], mj35: [5, '复合过去时'], mj36: [5, 'être助动词'], mj37: [4, '过去分词'],
    mj38: [5, '未完成过去时'], mj39: [5, '过去时分工'], mj40: [4, '最近将来时'], mj41: [3, '简单将来时'],
    mj42: [4, '命令式'], mj43: [4, '代动词'], mj44: [5, '直接宾语代词'], mj45: [4, '间接宾语代词'],
    mj46: [3, '条件式'], mj47: [3, '虚拟式'], mj48: [3, '副动词'],

    mj49: [4, '问候告别'], mj50: [4, '自我介绍'], mj51: [4, '疑问句'], mj52: [3, '疑问词'],
    mj53: [5, '否定ne'], mj54: [4, '时间价格'], mj55: [3, '日期星期'], mj56: [3, '购物'],
    mj57: [3, '餐饮'], mj58: [3, '问路交通'], mj59: [3, '天气'], mj60: [4, '存在句'],
    mj61: [4, '比较级'], mj62: [4, '喜好意愿'], mj63: [3, '邀请建议'], mj64: [3, '描述人物'],
    mj65: [3, '打电话'], mj66: [3, '因果目的'],

    mj67: [3, '单词·时间'], mj68: [3, '单词·人物'], mj69: [3, '单词·家庭'], mj70: [3, '单词·人物'],
    mj71: [3, '单词·时间'], mj72: [3, '单词·时间'], mj73: [3, '单词·时间'], mj74: [4, '单词·动词'],
    mj75: [4, '单词·动词'], mj76: [4, '单词·动词'], mj77: [3, '单词·动词'], mj78: [3, '单词·动词'],
    mj79: [3, '单词·形容词'], mj80: [3, '单词·形容词'],

    mj81: [4, 'tu与vous'], mj82: [2, '法语世界'], mj83: [2, '面贴面礼'], mj84: [2, '法餐礼仪'],
    mj85: [3, '英法亲缘'], mj86: [2, '节日'], mj87: [2, '书信'], mj88: [3, '学习路径']
  };

  const PITFALL = {
    mj03: R`鼻化只在词尾 n/m 后接元音中断时失效——bonne 读 bɔn 不是「翁」，别见 n 就鼻化。`,
    mj07: R`没有联诵的法语单词串听起来不像法语——les‿amis 要读 le-za-mi，跟读原声比死记规则有效。`,
    mj10: R`词尾 s/x 多不发音——复数听不出来，靠 un/des 与上下文，书写必须补 -s。`,
    mj13: R`阴阳性必须连冠词整体记（une table 而非裸记 table）——性别错引发冠词/形容词连锁错误。`,
    mj20: R`否定把 un/du/des 变 de 是高频句法坑：je ne mange pas de pain；être 表语例外（ce n'est pas une table）。`,
    mj21: R`形容词位置可换义——un grand homme（伟人）≠ un homme grand（高个子），勿一律后置。`,
    mj23: R`主有形容词跟**物**的性数变，不跟主人——son livre 可能是他的也可能是她的。`,
    mj28: R`年龄、饥渴冷热用 avoir 不用 être：J'ai 20 ans / J'ai faim——直译「我是 20 岁」必错。`,
    mj30: R`partir/dormir 等 -ir 不是第二组——只有 finir 型走 issons 模板，同形尾巴不同族。`,
    mj36: R`être 系复合过去时分词随主语性数——elles sont arrivées 的 -es 书面漏写就是错。`,
    mj39: R`imparfait 画背景、passé composé 推情节——「当时下雨我出了门」必须是 il pleuvait + je suis sorti。`,
    mj42: R`tu 型 -er 命令式去掉词尾 s：Parle ! 不是 *Parles !——初级最常见拼写错。`,
    mj44: R`宾语代词放**动词前**：Je le vois，不是 *Je vois le——语序与中文英语都反。`,
    mj45: R`lui/leur 只替换「给人」的 à；给物的 à 用 y——lui 指物是中级常见误用。`,
    mj59: R`天气 il fait chaud，人感到热 j'ai chaud——être/avoir 分工，说 *il est chaud 会错意。`,
    mj80: R`C'est bon 语义很宽（好吃/行/可以），勿固定译成一句中文；mauvais 与 bon 成对记比较级。`,
    mj85: R`英法假朋友：actuellement（目前）≠ actually；librairie（书店）≠ library——同形先查再用。`
  };

  // 主页「语言每日一句」池：lang 为 Web Speech locale，t 原文，n 译文
  const SENTENCES = [
    { lang: 'fr-FR', t: 'Bonjour, comment allez-vous ?', n: '您好，您好吗？（正式问候标配）' },
    { lang: 'fr-FR', t: "Je voudrais un café, s'il vous plaît.", n: '我想要一杯咖啡，麻烦了。（礼貌万能钥）' },
    { lang: 'fr-FR', t: "Excusez-moi, où est la gare ?", n: '不好意思，火车站在哪？' },
    { lang: 'fr-FR', t: "Il fait beau aujourd'hui.", n: '今天天气真好。' },
    { lang: 'fr-FR', t: "Ça ne prend que cinq minutes.", n: '这只要五分钟。' },
    { lang: 'fr-FR', t: "Je suis désolé, je ne peux pas.", n: '抱歉，我来不了／做不到。' },
    { lang: 'fr-FR', t: "On va prendre un verre ce soir ?", n: '今晚去喝一杯好吗？' },
    { lang: 'fr-FR', t: "Bonne chance pour ton examen !", n: '祝你考试顺利！' },
    { lang: 'fr-FR', t: "C'est la vie !", n: '这就是生活啊！' },
    { lang: 'fr-FR', t: "J'adore cette ville.", n: '我太喜欢这座城市了。' },
    { lang: 'fr-FR', t: "Pardon, je ne comprends pas bien.", n: '抱歉，我听不太懂。' },
    { lang: 'fr-FR', t: "Vous êtes étudiant ?", n: '您是学生吗？' },
    { lang: 'fr-FR', t: "Enchanté ! Moi, c'est Marie.", n: '幸会！我叫玛丽。' },
    { lang: 'fr-FR', t: "L'addition, s'il vous plaît.", n: '请结账。' },
    { lang: 'fr-FR', t: "Un peu chaque jour, ça vient.", n: '每天一点，慢慢就会了。' }
  ];

  // —— 帮助栏目文章（检索用，不参与学习调度）——
  const HELP = [
    { id: 'h01', title: '法语拼写乱，但拼读是规律的', body: R`法语的「乱」在**写法**：同一读音多种拼法（eau/au/o 都读 o）；但**读法方向相当死**：字母组合 → 读音基本固定。
正确顺序：先攻语音章的组合规则，此后生词有七成以上能读对——别被拼写吓退，拼写靠词汇量慢慢补。` },
    { id: 'h02', title: '发音三座小山', body: R`① **小舌音 r**（漱口位置轻擦，可先用喉部近似）；② **鼻化元音**（口型做元音、气流走鼻腔）；③ **联诵**（前词尾辅音复活连读）。
假坑排除：词尾辅音大多不发音、h 永远不发音——这是送分规律，不是难点。
跟读工具：学习页 🔊（fr-FR），每天跟三遍。` },
    { id: 'h03', title: '语法两大主山：阴阳性与变位', body: R`① **名词阴阳性**——无生命物也有性，连冠词整体记；② **动词变位**——人称 × 时态的词形体系。
应对：阴阳性靠「第一天就带 le/la 记忆」的习惯；变位先吃透 être/avoir/第一组模板，再上复合过去时与 imparfait 分工。` },
    { id: 'h04', title: '第一周怎么过', body: R`① **拼读规则先吃透**（语音章每天 2–3 张 + 朗读）；② 初学者模式勾「语音 + 名词与冠词」；③ 大声跟读五分钟——法语靠节奏组整块模仿。
第一周目标：陌生词按规则读出七成准确。别急着啃虚拟式——先把耳朵和嘴调到法语频道。` },
    { id: 'h05', title: '常见放弃点与对策', body: R`三大放弃点：
① **阴阳性记不住**——永远连冠词记词；词尾规律（-tion 阴、-age 阳）先管八成。
② **变位表劝退**——只主攻高频五个 + 第一组模板，其余遇到一个收一个。
③ **联诵时有时无**——跟读原声，耳朵先于规则。
总对策：法语前期规则投资大、后期阅读回报高——语音章一次投入，终身受用。` },
    { id: 'h06', title: '简明法语教程：本卡组怎么走', body: R`本卡组按《简明法语教程》章节骨架重组：**语音 → 名词与冠词 → 动词变位 → 句型场景 → 高频词汇 → 文化与场景**。
建议顺序即 ORDER；初学者模式默认语音 + 名词与冠词。
**进度策略=整科重置**：旧卡 id 已全部替换，FSRS 进度重新开始——当作一门新课从语音章开跑。` },
    { id: 'h07', title: '朗读与跟读：🔊 按钮的用法', body: R`学习页 🔊 走 Web Speech（fr-FR），每日一句（SENTENCES）也可朗读。
跟读三步：① 只听不看字；② 看原文再听；③ 遮住原文影子跟读。
发音阶段每天 5–10 分钟跟读比背字母表更有效；长句按节奏组停顿再连。` }
  ];

  const BEGINNER = ['phon', 'noun'];
  return { BEGINNER: BEGINNER, id: 'fr', name: '法语', short: '法语', icon: '🗼', kind: 'qa', group: 'lang', CATS: CATS, DATA: DATA, META: META, HELP: HELP, REL: {}, PITFALL: PITFALL, MNEM: {}, SENTENCES: SENTENCES, ORDER: ['phon', 'noun', 'verb', 'sent', 'words', 'culture'] };
})();
