/*
 * 西班牙语 · 知识点记忆数据库
 * 依据：西班牙语入门通用框架（语音 → 名词与冠词 → 动词变位 → 句型 → 文化）
 * 结构与其他学科一致：id / cat / title / front / back + META / PITFALL
 * 说明：无例题学科；kind: 'qa'；group: 'lang'——卡面带 Web Speech 朗读按钮（es-ES）。
 */
window.SUBJECTS = window.SUBJECTS || {};
window.SUBJECTS.es = (function () {
  'use strict';
  const R = String.raw;

  const CATS = {
    base: '基础体系',
    phon: '语音与拼读',
    noun: '名词与冠词',
    verb: '动词与变位',
    sent: '句型与表达',
    words: '高频单词',
    culture: '文化与场景'
  };

  const F = (id, cat, title, front, back) => ({ id, cat, title, front, back });

  const DATA = [
    // ==================== 基础体系 ====================
    F('bs01', 'base', '西语字母表：27 个字母',
      R`西语字母表与英语差在哪？`,
      R`共 **27 个字母**：a-z 加 **ñ**（2010 年规范后 ch/ll 不再算独立字母，只是字母组合）。
字母名读音要点：ñ 读「恩尼」（año 年——丢了波浪线就是脏词 ano）；h 名叫「阿切」但永不发音；v 名叫「乌贝」（与 b 同音）。
另有重音符号 á/é/í/ó/ú 与倒问号 ¿——它们是**拼写的一部分**，不是装饰。`),
    F('bs02', 'base', '指示词与物主全表',
      R`这个/那个；我的/你的 全表？`,
      R`**指示词三档**（随性数变化）：este/esta（这）、ese/esa（那，你那边）、aquél/aquélla（那，远处）——现代书面常省重音符；中性形 esto/eso/aquello（指不知名事物）。
**物主短形**：mi/tu/su/nuestro/vuestro/su——随被修饰名词变性数（mis libros）；**长形**（mío 等）后置强调（un amigo mío 我的一个朋友）。
su 的四义（他/她/您/他们）靠语境或 de 结构消歧。`),
    F('bs03', 'base', 'gustar 家族：同类动词扩展',
      R`和 gusta 用法一样的动词还有哪些？`,
      R`与 gustar 同构（**物作主语 + 间接宾语人**）：**encantar**（热爱——Me encanta el café）、**doler**（疼——Me duele la cabeza 我头疼）、**parecer**（觉得——Me parece bien 我觉得行）、**faltar**（缺——Me faltan dos días 还差两天）、**molestar**（打扰/烦）。
共同点：动词随**物的单复数**变化，人用间接宾语 me/te/le…。
掌握家族式记忆后，这批高频表达一次全部拿下。`),
    F('bs04', 'base', '礼貌用语分工',
      R`por favor、disculpe、perdón、lo siento 各用在什么时候？`,
      R`**por favor**（请——任何请求的礼貌收尾）；**gracias / muchas gracias**（谢谢/多谢）＋ de nada（不客气）；**disculpe**（劳驾/借过——**引起注意**或轻微打扰，称呼陌生人）；**perdón**（道歉+请求原谅通用）；**lo siento**（真诚的遗憾/同情——坏消息场合）。
分工核心：**disculpe 开口、perdón 认错、lo siento 表同情**——三句不能互换。
回应感谢：de nada / no hay de qué（都不客气）。`),
    // ==================== 语音与拼读 ====================
    F('ph01', 'phon', '西班牙语：拼读近乎透明',
      R`为什么说西语是"怎么写就怎么读"的语言？`,
      R`西语拼读**高度透明**：5 个元音各一音（a e i o u——永远不变）、辅音与拼写一一对应——看词即读、听音即写（重音符号系统兜底）。
这是西语对自学者的头号红利：**第一周就能朗读任何文本**（哪怕不懂意思）。
对比英语/法语的音形脱节——西语的记忆量集中在词汇与动词，几乎不耗在拼写上。`),
    F('ph02', 'phon', '五个元音与重音规则',
      R`元音发音与书面重音符号的规则？`,
      R`元音纯化：a（啊）、e（诶）、i（衣）、o（欧）、u（乌）——**不分长短、没有弱化**，双元音也保持纯净。
重音三规则：① 词尾是元音/n/s → 重音落倒数第二音节（casa）；② 其他辅音结尾 → 落最后一音节（comer）；③ 违反①②者**带重音符号**（café、fácil、está）。
重音符号也用来区分同形词（si 是"如果"、sí 是"是"；el 冠词、él 他）。`),
    F('ph03', 'phon', '特色字母：ñ、rr、h 与 b/v',
      R`西语的特色音有哪些？`,
      R`**ñ**（大写的恩——año 年，别读成 ano）：**rr**（大舌颤音——perro 狗 vs pero 但是；练法：先发"的了"连音加速）；**h 永远不发音**（hola 读"欧拉"）；**b/v 同音**（都是双唇近 b——vaca 牛与 boca 嘴同音值）；**j 与 ge/gi**：喉擦音（类似轻咳的 h——jamón、gente）；**z 与 ce/ci**：西班牙本土读咬舌 th（gracias——"格拉西亚斯"带咬舌），拉美读 s。
g 与 c 的软硬分野：ga/go/gu 硬、ge/gi 软；gua/gwo 中 u 发音。`),
    F('ph04', 'phon', '问句与叹句的倒问号',
      R`¿ 和 ¡ 是什么？`,
      R`西语独有：问句以**倒问号 ¿ 开头、? 结尾**——¿Cómo estás?；叹句以 **¡ 开头**——¡Hola!。
功能：让读者**提前**知道语气（英语读到句尾才发现是疑问）——是书写系统服务语调的设计。
键入：¿ 是 Unicode 字符（移动端长按 ? 可出）；本应用与大多数输入法直接支持。`),
    // ==================== 名词与冠词 ====================
    F('no01', 'noun', '阴阳性与复数',
      R`西语名词的性数规则？`,
      R`性别规律覆盖九成：**-o 阳性**（libro 书）、**-a 阴性**（casa 房子）；例外须逐词记（el día 天——阳、la mano 手——阴）；表人名词随性别（amigo/amiga）。
复数：元音结尾 + s（libros）、辅音结尾 + es（profesores）；-z 结尾变 ces（lápiz → lápices）。
与法语相比西语性别**规则性强得多**——按词尾猜准确率高，是学习成本的大减负。`),
    F('no02', 'noun', '定冠词与不定冠词',
      R`el/la/los/las 与 un/una 如何使用？`,
      R`定冠词：**el**（阳单）、**la**（阴单）、**los/las**（复数）——el 用于阳性（el libro），注意 el 也是"他"的宾格形式（同形）；不定冠词：**un**（阳）、**una**（阴）、unos/unas（复数——"一些"）。
用法与法语近似：泛指大类用定冠词（Me gusta **el** café——我喜欢咖啡）、其一用不定（un café——一杯咖啡）。
陷阱：agua（水）阴性但用 **el** agua（重音 avoidance——a 开头的重读阴性名词冠词用 el）。`),
    F('no03', 'noun', '物主形容词与 ser/estar 的名词句',
      R`我的/你的与"是"的名词句？`,
      R`物主形容词（短形）：**mi**（我的）、tu（你的）、su（他/她/您的）、nuestro/a（我们的）、vuestro/a、su——随**物主数量与被修饰名词的性数**变化（mis libros——我的书们）。
名词句：Es + 名词/形容词（Es profesora——她是老师；Es grande——它很大）；否定 No es（No es difícil——不难）。
su 的歧义（他的/她的/他们的/您的）靠语境——拉美口语常改用 de él/de ella 消歧。`),
    F('no04', 'noun', 'ser 与 estar：两种"是"',
      R`ser 和 estar 如何分工？`,
      R`**ser**（本质属性）：身份（Soy estudiante）、国籍（Es china）、职业、固有特征（Es alta——她个子高）、时间事件（Son las tres——三点）；**estar**（状态位置）：位置（Estoy en casa——在家）、临时状态（Está cansado——他累了——此刻）、进行时（estoy comiendo——正吃着）。
经典对比：Es aburrido（它是无聊的——属性）vs Está aburrido（他感到无聊——状态）。
这是西语第一思维关：英语/中文一个"是"，西语要判断"本质还是状态"——问自己"会变吗？这周内会变 = estar"。`),
    F('no05', 'noun', '形容词位置与一致',
      R`西语形容词放哪？如何一致？`,
      R`默认**后置**（un libro interesante——一本有趣的书）；常用性质词可前置且前置常带强调/微义移（un gran hombre 伟人 vs un hombre grande 大块头——gran 前置缩形）。
一致：性数双配——una casa blanc**a**（白房子）、dos casas blanc**as**；阳性覆盖混性复数（amigos 可指男女朋友混合）。
与法语一致逻辑相同、规则更透明——o/a 词尾的形容词一眼可辨。`),
    F('no06', 'noun', '疑问词与重音符号',
      R`西语疑问词有哪些？为何带重音？`,
      R`**qué**（什么）、quién（谁）、dónde（哪里）、cuándo（何时）、cómo（怎样）、cuánto（多少）、por qué（为什么）——疑问词一律**带重音符号**（与关系用法区分：que/donde 不带）。
句型：¿Qué es esto?（这是什么？）、¿Dónde está el baño?（洗手间在哪？）、¿Cuánto cuesta?（多少钱？）。
por qué（为什么）与 porque（因为）——重音符号一撇之差，方向相反。`),
    // ==================== 动词与变位 ====================
    F('vb01', 'verb', '三组动词与现在时模板',
      R`西语动词如何分组与变位？`,
      R`三组：**-ar**（hablar 说）、**-er**（comer 吃）、**-ir**（vivir 住）。
现在时 -ar 模板：**-o、-as、-a、-amos、-áis、-an**（hablo/hablas/habla/hablamos/habláis/hablan）；-er：-o/-es/-e/-emos/-éis/-en；-ir：-o/-es/-e/-imos/-ís/-en（与 -er 仅 nosotros/vosotros 异）。
主语可省：动词词尾已含人称信息（Hablo español——"说西语"即"我说西语"）——西语是**省主语语言**，与法语相反。`),
    F('vb02', 'verb', 'ser 与 estar 的变位',
      R`两大"是"动词的完整变位？`,
      R`**ser**：soy、eres、es、somos、sois、son；**estar**：estoy、estás、está、estamos、estáis、están。
注意 estar 的第一人称 **estoy**（不规则——重音符号也在提醒重读）；ser 全套不规则但形态短、使用频次极高，一周内可形成肌肉记忆。
两词变位都高频出现在时间（Es la una / Son las dos）、天气（Está nublado 多云）——每天自我介绍就在练。`),
    F('vb03', 'verb', '常用不规则现在时',
      R`第一人称不规则（go 动词）与词干变化？`,
      R`**yo 特殊型**：tener→tengo（有）、hacer→hago（做）、poner→pongo（放）、salir→salgo（出去）、venir→vengo（来）——**只第一人称不规则**，其余规则。
词干元音变化：e→ie（querer→quiero 想要、poder→puedo 能）、o→ue（dormir→duermo 睡）、e→i（pedir→pido 请求）——俗称"靴子动词"（变化只发生在 1/2/3 单与 3 复）。
querer/poder 是表达意愿能力的双引擎：Quiero...（我想）/ Puedo...?（我能……吗）。`),
    F('vb04', 'verb', 'gustar：与中文思维相反的"喜欢"',
      R`为什么 gusta 不随"我"变化？`,
      R`gustar 的逻辑是"**X 使我喜欢**"：主语是**被喜欢之物**——Me gusta el café（咖啡使我喜欢 = 我喜欢咖啡）、Me gustan los libros（复数物 → gustan）。
人称变间接宾语：**me、te、le、nos、os、les**——Te gusta?（你喜欢吗？）、Le gusta viajar（他/她喜欢旅行）。
第一坑：喜欢的是**复数**动词用 gustan；第二坑：照搬"我喜欢"直译必错——永远想"什么在让我愉快"。`),
    F('vb05', 'verb', '两套过去时：pretérito 与 imperfecto',
      R`西语的复合过去时与未完成过去时如何分工？`,
      R`**pretérito indefinido**（点事件）：comí（我吃了）、fui（去了）——完成动作叙事；**imperfecto**（背景/习惯/进行）：comía（我那时候常吃）、era（那时是）——词尾 -aba/-ía。
分工与法语相同：**indefinido 推进情节、imperfecto 画背景**——Llovía（正下着雨）cuando salí（我出门了）。
注意 indefinido 变位全新一套（hablé/comí/viví）且不规则集中（fui 是 ir 与 ser 共用）——是西语动词学习的最大工程。`),
    F('vb06', 'verb', '近将来时与 ir 的变位',
      R`"将要做"如何表达？`,
      R`**ir + a + 原形**：Voy a estudiar（我要去学习 = 将学习）——口语绝对主力；ir 变位：voy、vas、va、vamos、vais、van。
简单将来时（词尾 -é/-ás/-á/-emos/-éis/-án 直接加在原形上）：estudiaré——正式/预测用。
口语策略：近将来时够用 80% 场景——Voy a + 动词原形是第一个该形成条件反射的句型。`),
    F('vb07', 'verb', '命令式与礼貌请求',
      R`如何下命令、提请求？`,
      R`肯定 tú 命令 = 第三人称单数形：¡Habla!（说！）、¡Come!、¡Vive!；usted 命令用虚拟式形：Hable usted；否定命令一律虚拟式形：No hables!（别说！）；礼貌请求：¿Puedes...?（你能……吗）、¿Podría...?（您能否……——条件式更客气）。
高频祈使：¡Vamos!（走起！）、¡Espere!（请等下！）、¡Mira!（看！）、Disculpe（劳驾——您尊称形）。
对陌生人请求用 **usted 系**（¿Podría ayudarme?）——tú 系留给朋友。`),
    F('vb08', 'verb', '现在进行时与 reflexive 动词',
      R`"正在做"与自复动词？`,
      R`**进行时 = estar + 原形去尾 + -ando（-ar）/ -iendo（-er/-ir）**：Estoy comiendo（正吃着）——比英语进行时用得少（简单现在时也能表当下）。
**自复动词**（se + 动词）：levantarse（起床——把自己抬起来）、lavarse（洗自己）、llamarse（叫自己什么名）——Me llamo Wang（我叫王）、Me levanto a las siete（我七点起）。
日常起居动作大半是自复动词——遇见新动词先看动词表是否带 se。`),
    // ==================== 句型与表达 ====================
    F('se01', 'sent', '问候与自我介绍',
      R`核心问候语与自我介绍？`,
      R`问候：Hola（你好——全天候）、Buenos días（早上好）、Buenas tardes（下午好）、Buenas noches（晚上好/晚安）、Adiós（再见）、Gracias（谢谢）、Por favor（请）。
自我介绍：Me llamo Wang.（我叫王。）Soy de China.（我来自中国。）Mucho gusto.（很高兴认识。）¿Cómo estás?（你好吗——熟人）/ ¿Cómo está usted?（您——正式）。
西语问候语感热烈——¡Hola! 配笑容是标准配置。`),
    F('se02', 'sent', '数字与时间',
      R`数字与报时的要点？`,
      R`数字：uno dos tres cuatro cinco seis siete ocho nueve diez；11 once、12 doce、13 trece……15 quince（第一段不规则）；16-29 一个词（dieciséis、veintiuno）、30+ 三十进（treinta y uno——"三十加一"）。
百：ciento（por ciento = 百分比）；千：mil；百万：un millón。
报时：Es la una（一点——单数）/ Son las dos（两点起——复数）、y cuarto（一刻）、y media（半）、menos cuarto（差一刻）——Son las tres y media（三点半）。`),
    F('se03', 'sent', '购物与餐饮',
      R`购物点餐的核心句型？`,
      R`购物：¿Cuánto cuesta?（多少钱？）、Quiero...（我要）/ 礼貌 Quisiera...（我想要）、¿Puedo pagar con tarjeta?（能刷卡吗？）；点餐：Una mesa para dos（两人桌）、La carta, por favor（请给菜单）、La cuenta, por favor（请结账）、Para llevar（打包带走）。
西语世界餐饮文化：tapas（小吃拼盘文化——西班牙）、menu del día（午市套餐——性价比之王）；La cuenta 要**主动喊**（服务生不催不来账单——不是怠慢，是文化）。`),
    F('se04', 'sent', '问路与交通',
      R`出行问路的核心句？`,
      R`¿Dónde está...?（……在哪里？）、¿Cómo llego a...?（我怎么到……？）、a la derecha/a la izquierda（右/左）、todo recto（直走）、cerca de/lejos de（近/远）。
交通：el metro（地铁）、el autobús（公交）、el taxi；¿Va al centro?（去市中心吗？）、un billete de metro（一张地铁票）。
西语语速快且吞音（拉美尤甚）——先抓动词与数字，虚词丢一半也能懂。`),
    F('se05', 'sent', '表达意愿与能力',
      R`想、能、必须的表达？`,
      R`**querer**（想）：Quiero aprender español（我想学西语）；**poder**（能）：¿Puedes repetir?（能再说一遍吗？）；**tener que**（必须——"有……要做"）：Tengo que irme（我得走了）；**deber**（应该）。
万能求助句：¿Puedes hablar más despacio, por favor?（能说慢点吗？）、No entiendo（我不懂）、¿Qué significa...?（……是什么意思？）——这三句是初学者的求生三件套。`),
    F('se06', 'sent', '存在句：hay',
      R`「有」怎么说？`,
      R`**hay**（haber 的无人称形式）＝ 有/存在着：Hay un problema（有个问题）、Hay muchos turistas（有很多游客）——单复数**同形**。
否定：No hay…（没有——No hay leche 冰箱没奶了）；疑问：¿Hay un hotel por aquí?（这附近有旅馆吗？）。
问路问店万能句：¿Hay…por aquí cerca?（这附近有……吗？）。`),
    F('se07', 'sent', '天气句型：hace',
      R`西语怎么聊天气？`,
      R`天气用 **hace**（hacer 的无人称用法）：Hace calor/frío（热/冷）、Hace sol/viento（晴天/刮风）、Hace buen/mal tiempo（天气好/糟）。
其他：Está nublado（多云——estar 系）、Llueve（下雨）、Nieva（下雪）。
Hace calor 是西语 small talk 的万能开场——配上 ¡Qué calor!（真热啊！）更有味道。`),
    F('se08', 'sent', '比较级：más / menos / tan',
      R`「更」「不如」「一样」怎么说？`,
      R`**más…que**（比……更）、**menos…que**（不如……）、**tan…como**（和……一样）：Ana es más alta que yo（Ana 比我高）。
最高级：el/la más + 形容词（el más alto 最高）；bueno/malo 有不规则形（mejor/peor）。
口语省略：más o menos（马马虎虎）——日常对话频率极高。`),
    // ==================== 文化与场景 ====================
    F('cu01', 'culture', '西语世界版图：方言与口音',
      R`西班牙语与拉丁美洲西语有何差异？`,
      R`全球约 **5 亿母语者**——西语是母语人数第二的语言（仅次中文）。主要分支：**西班牙本土**（咬舌 z/ce/ci、vosotros 二复人称）vs **拉美**（s 化、 ustedes 通吃）。
词汇差异案例：开车——coche（西）/ carro（拉美多数）/ auto（南锥）；手机——móvil / celular。
学习建议：口音选一种打底（标准 Castellano 或墨西哥/哥伦比亚腔皆可），词汇差异在场景中自然并轨——互通度远高于分歧。`),
    F('cu02', 'culture', 'tú 与 usted：敬称的使用',
      R`tú/usted 如何选择？`,
      R`**tú**：朋友、家人、同辈、小孩；**usted**（缩写 Ud.）：长者、正式场合、服务业初次接触；拉美部分国家（哥伦比亚等）usted 泛化到亲友。
动词第三人称单数配套：¿Cómo **estás**?（tú）/ ¿Cómo **está**?（usted）——动词形态暴露称谓选择。
对学习者：陌生人一律 usted 开局，对方说 "puedes tutearme"（你可以用你相称）再切 tú。`),
    F('cu03', 'culture', '英语借词红利与词汇迁移',
      R`学西语能从英语/中文借到什么力？`,
      R`**英语红利**：西英同源词极多（información、hospital、importante、familia）——阅读词汇量启动即半成；**拼写规则透明**：英语词套西语规则反推读音即可。
**文化词直通**：fiesta、siesta、tapas、paella、hola——已入全球词汇。
提示：同源词有"假朋友"（embarazada 是怀孕不是尴尬）——高相似度词汇要过一遍易错清单。`),
    F('cu04', 'culture', '西语文化关键词',
      R`fiesta、siesta 与问候的身体语言？`,
      R`**siesta**（午休文化——南欧与拉美的午后小憩传统）、**fiesta**（节庆文化——每个城镇都有守护神圣徒日）；拉美时间观："ahorita"（马上——弹性时间词，可以是 5 分钟也可以是 2 小时）。
问候身体语言：熟人贴面礼（西：右右两贴；拉美一贴）、男性友人握手/拥抱——距离感比东亚近，后退反而失礼。
口语温度：西语交流高频用 diminutive（-ito/-ita 小称——un momentito 稍等一小下）传递亲切。`),
    F('cu05', 'culture', '西语学习路径建议',
      R`西语入门的推荐节奏？`,
      R`① **拼读一周**：元音 + 重音规则 + rr 大舌音启动练习（rr 可后期慢慢磨）；② **动词三阶梯**：现在时三组 → ser/estar/gustar → 不规则 yo 与词干变化；③ **教材主线**：《现代西班牙语》第一册或 Aula Internacional；④ **输入**：西语慢速播客（Duolingo Spanish Podcast 等）+ 拉美剧（Narcos 有西语字幕）。
节奏参考：A1 约 100 小时、A2 再 150 小时、B1 再 250 小时——拼读透明使西语的"启动成本"居欧语最低。
本卡组用法：语音卡配朗读按钮（es-ES）跟读；ser/estar 与 gustar 卡是思维重建重点。`),
    // ==================== 高频单词 ====================
    F('ew01', 'words', 'el tiempo', R`el tiempo`,
      R`名词（阳）· 时间；天气。多义：No tengo tiempo（没时间）／¿Qué tiempo hace?（天气怎样）。`),
    F('ew02', 'words', 'el amigo / la amiga', R`el amigo / la amiga`,
      R`名词（阳/阴）· 朋友。复数 amigos 覆盖混性群体；阴性加 a。`),
    F('ew03', 'words', 'la familia', R`la familia`,
      R`名词（阴）· 家庭。搭配：mi familia es grande（我家人口多）。`),
    F('ew04', 'words', 'el profesor / la profesora', R`el profesor / la profesora`,
      R`名词（阳/阴）· 老师。拉美口语也用 maestro／maestra。`),
    F('ew05', 'words', 'hoy', R`hoy`,
      R`副词 · 今天。h 不发音；搭配：hoy mismo（就是今天）。`),
    F('ew06', 'words', 'mañana', R`mañana`,
      R`名词/副词 · 明天；早晨。双义：Hasta mañana（明天见）／por la mañana（在早上）。`),
    F('ew07', 'words', 'ahora', R`ahora`,
      R`副词 · 现在。拉美口语的 ahorita（「马上」）弹性极大——5 分钟到 2 小时都可能。`),
    F('ew08', 'words', 'la hora', R`la hora`,
      R`名词（阴）· 钟点。核心问句：¿Qué hora es?（现在几点）。`),
    F('ew09', 'words', 'comer', R`comer`,
      R`动词 · 吃。yo como；搭配：comer en casa（在家吃饭）。`),
    F('ew10', 'words', 'beber', R`beber`,
      R`动词 · 喝。yo bebo；拉美口语更常用 tomar（tomar agua 喝水）。`),
    F('ew11', 'words', 'ir', R`ir`,
      R`动词 · 去。全不规则：voy / vas / va；ir a + 原形 = 将要做（口语主力将来式）。`),
    F('ew12', 'words', 'venir', R`venir`,
      R`动词 · 来。vengo / vienes；命令式：¡Ven!（过来！）。`),
    F('ew13', 'words', 'ver', R`ver`,
      R`动词 · 看见。veo / ves；告别口语：Nos vemos（回头见）。`),
    F('ew14', 'words', 'escuchar', R`escuchar`,
      R`动词 · 听。规则 -ar 变位；搭配：escuchar música（听音乐）。`),
    F('ew15', 'words', 'hablar', R`hablar`,
      R`动词 · 说。hablo español（我说西语）——第一组 -ar 变位模板动词。`),
    F('ew16', 'words', 'leer', R`leer`,
      R`动词 · 读。leo / leemos；搭配：leer un libro（读书）。`),
    F('ew17', 'words', 'escribir', R`escribir`,
      R`动词 · 写。第三组 -ir：escribo / escribimos；搭配：escribir un mensaje。`),
    F('ew18', 'words', 'comprar', R`comprar`,
      R`动词 · 买。规则 -ar 变位；搭配：comprar ropa（买衣服）。`),
    F('ew19', 'words', 'dormir', R`dormir`,
      R`动词 · 睡。o→ue 靴子动词：duermo / dormimos；搭配：dormir bien（睡得好）。`),
    F('ew20', 'words', 'trabajar', R`trabajar`,
      R`动词 · 工作。搭配：trabajo en…（我在……工作）；名词：el trabajo。`),
    F('ew21', 'words', 'grande', R`grande`,
      R`形容词 · 大的。前置缩形 gran 义变：un gran hombre（伟人）≠ un hombre grande（大块头）。`),
    F('ew22', 'words', 'pequeño', R`pequeño / pequeña`,
      R`形容词 · 小的。口语也用 chico／chica；反义：grande。`),
    F('ew23', 'words', 'nuevo', R`nuevo / nueva`,
      R`形容词 · 新的。搭配：ropa nueva（新衣服）；de nuevo = 重新、再来一次。`),
    F('ew24', 'words', 'viejo', R`viejo / vieja`,
      R`形容词 · 旧的；老的。un amigo viejo（岁数大的朋友）与 antiguo（老物件）分用。`),
    F('ew25', 'words', 'caro', R`caro / cara`,
      R`形容词 · 贵的。感叹：Es muy caro !（太贵了）；反义：barato。`),
    F('ew26', 'words', 'barato', R`barato / barata`,
      R`形容词 · 便宜的。砍价用语：más barato（再便宜点）。`),
    F('ew27', 'words', 'el agua', R`el agua`,
      R`名词（阴）· 水。阴性但重读 a 开头 → 冠词用 el（el agua fría），复数 las aguas。`),
    F('ew28', 'words', 'la tienda', R`la tienda`,
      R`名词（阴）· 商店。搭配：en la tienda（在商店）；市场：el mercado。`),
    F('ew29', 'words', 'la escuela', R`la escuela`,
      R`名词（阴）· 学校。搭配：ir a la escuela（去上学）；大学：la universidad。`),
    F('ew30', 'words', 'la estación', R`la estación`,
      R`名词（阴）· 车站；季节。la estación de tren（火车站）——同词兼表四季。`),
    F('ew31', 'words', 'el gato', R`el gato`,
      R`名词（阳）· 猫。阴性 la gata；搭配：tengo un gato（我养了只猫）；狗：el perro。`),
    F('ew32', 'words', 'el perro', R`el perro`,
      R`名词（阳）· 狗。阴性 la perra；口语叫狗：¡guau guau!（汪汪）。`),
    F('ew33', 'words', 'el libro', R`el libro`,
      R`名词（阳）· 书。搭配：leer un libro（读书）；书店：la librería（与图书馆 la biblioteca 区分）。`),
    F('ew34', 'words', 'el café', R`el café`,
      R`名词（阳）· 咖啡；咖啡馆。点单：un café, por favor；去喝一杯＝tomar un café——社交邀约万能句。`),
    F('ew35', 'words', 'el dinero', R`el dinero`,
      R`名词（阳）· 钱。搭配：No tengo dinero（我没钱）；取款机：el cajero automático。`),
    F('ew36', 'words', 'la mañana', R`la mañana`,
      R`名词（阴）· 早上。搭配：por la mañana（在早上）、cada mañana（每天早上）；下午：la tarde；晚上/夜：la noche。`),
    F('ew37', 'words', 'la noche', R`la noche`,
      R`名词（阴）· 夜晚。搭配：por la noche（在夜里）、Buenas noches（晚上好/晚安）；熬夜：trasnochar。`),
    F('ew38', 'words', 'reír', R`reír`,
      R`动词 · 笑。搭配：reírse de（嘲笑/被逗笑）；名词 la risa（笑声）；网络聊天「jajaja」＝西语的哈哈哈。`),
    F('ew39', 'words', 'correr', R`correr`,
      R`动词 · 跑。搭配：correr en el parque（在公园跑步）；引申：el tiempo corre（时间飞逝）。`),
    F('ew40', 'words', 'fácil', R`fácil`,
      R`形容词 · 容易（单复数：fáciles，阴阳同形）。搭配：¡Es muy fácil!（很简单！）；反义：difícil。`),
    F('ew41', 'words', 'difícil', R`difícil`,
      R`形容词 · 难（复数：difíciles，阴阳同形）。搭配：Es difícil de creer（难以置信）。`),
    F('ew42', 'words', 'cansado', R`cansado / cansada`,
      R`形容词 · 累。搭配：Estoy cansado（我累了——男；状态用 estar！）/ cansada（女）；口头禅级：Estoy muy cansado hoy.（今天太累了）。`),
    F('ew43', 'words', 'feliz', R`feliz`,
      R`形容词 · 幸福/快乐（复数 felices）。祝福：¡Feliz cumpleaños!（生日快乐）、¡Feliz Año Nuevo!（新年快乐）。`),
    F('ew44', 'words', 'aquí', R`aquí`,
      R`副词 · 这里。搭配：Ven aquí（过来这里）；三档指示：aquí（这）→ ahí（那，你那边）→ allí（那，远处）。`),
    F('ew45', 'words', 'allí', R`allí`,
      R`副词 · 那里。搭配：Mira allí（看那边）；与 aquí 成对记；口语里 ahí（那儿）与 allí 常混用，allí 更远更明确。`),
  ];

  const META = {
    bs01: [3, '字母表'],
    bs02: [4, '指示物主全表'],
    bs03: [4, 'gustar家族'],
    bs04: [3, '礼貌用语'],

    se06: [4, '存在句'],
    se07: [3, '天气'],
    se08: [4, '比较级'],
    ew31: [3, '猫'],
    ew32: [3, '狗'],
    ew33: [3, '书'],
    ew34: [3, '咖啡'],
    ew35: [3, '钱'],
    ew36: [3, '早上'],
    ew37: [3, '夜'],
    ew38: [3, '笑'],
    ew39: [3, '跑'],
    ew40: [2, '容易'],
    ew41: [3, '难'],
    ew42: [3, '累'],
    ew43: [3, '幸福'],
    ew44: [2, '这里'],
    ew45: [2, '那里'],

    ph01: [4, '拼读透明'], ph02: [4, '元音重音'], ph03: [5, '特色字母'], ph04: [2, '倒问号'],
    no01: [4, '阴阳性'], no02: [4, '冠词'], no03: [3, '物主名词句'], no04: [5, 'ser estar'], no05: [3, '形容词一致'], no06: [4, '疑问词'],
    vb01: [5, '三组变位'], vb02: [5, 'ser estar 变位'], vb03: [5, '不规则现在时'], vb04: [5, 'gustar'], vb05: [5, '两套过去时'], vb06: [4, '近将来时'], vb07: [3, '命令式'], vb08: [4, '进行自复'],
    se01: [3, '问候介绍'], se02: [3, '数字时间'], se03: [3, '购物餐饮'], se04: [3, '问路'], se05: [4, '意愿能力'],
    cu01: [4, '西语版图'], cu02: [3, 'tú usted'], cu03: [3, '词汇迁移'], cu04: [2, '文化关键词'], cu05: [2, '学习路径'],
    ew01: [4, '单词·名词'], ew02: [3, '单词·名词'], ew03: [3, '单词·名词'], ew04: [3, '单词·名词'], ew05: [4, '单词·时间'], ew06: [4, '单词·时间'],
    ew07: [3, '单词·时间'], ew08: [3, '单词·时间'], ew09: [3, '单词·动词'], ew10: [3, '单词·动词'], ew11: [5, '单词·动词'], ew12: [3, '单词·动词'],
    ew13: [3, '单词·动词'], ew14: [3, '单词·动词'], ew15: [4, '单词·动词'], ew16: [3, '单词·动词'], ew17: [3, '单词·动词'], ew18: [3, '单词·动词'],
    ew19: [4, '单词·动词'], ew20: [3, '单词·动词'], ew21: [4, '单词·形容词'], ew22: [2, '单词·形容词'], ew23: [3, '单词·形容词'], ew24: [3, '单词·形容词'],
    ew25: [3, '单词·形容词'], ew26: [2, '单词·形容词'], ew27: [4, '单词·名词'], ew28: [2, '单词·名词'], ew29: [3, '单词·名词'], ew30: [3, '单词·名词']
  };

  const PITFALL = {
    no04: R`ser 表本质、estar 表状态位置：Es aburrido（它无聊）与 Está aburrido（他感到烦）——"会变吗"是判断口诀。`,
    vb04: R`gustar 主语是被喜欢之物：Me gustan los libros（复数物配 gustan）——照中文直译"我喜欢"必错。`,
    ph03: R`h 永远不发音：hola 读"欧拉"；año（年）的 ñ 与 ano（肛门）只差一个波浪线——别丢 tilde。`,
    vb03: R`querer/poder 是靴子动词：quiero/puedo 变化只发生在单数三形与第三人称复数，nosotros 例外规则。`
  };

  // 主页「语言每日一句」池：lang 为 Web Speech locale，t 原文，n 译文
  const SENTENCES = [
    { lang: 'es-ES', t: 'El que la sigue, la consigue.', n: '坚持就能成功。（西语谚语）' },
    { lang: 'es-ES', t: '¿Me lo puede repetir, por favor?', n: '能请您再说一遍吗？（礼貌求助句）' },
    { lang: 'es-ES', t: 'Estoy aprendiendo español.', n: '我正在学西班牙语。' },
    { lang: 'es-ES', t: '¡Buen provecho!', n: '用餐愉快！（开饭前的标准祝福）' },
    { lang: 'es-ES', t: 'No pasa nada.', n: '没关系，别担心。（西语世界的万能宽慰语）' },
    { lang: 'es-ES', t: '¡Hasta mañana!', n: '明天见！' }
  ];

  // —— 帮助栏目文章（检索用，不参与学习调度；内容由原起步章迁移）——
  const HELP = [
    { id: 'bs01', title: '西语是入门成本最低的欧洲语言', body: R`西语拼读**近乎完全透明**：五个元音各一音永不变化、辅音与拼写一一对应、重音有明确规则（不确定的带重音符标出）。
推论：**一两周就能朗读任何西语文本**（哪怕不懂意思）——这是西语对初学者独一份的红利，法语英语都比不了。
你的记忆量因此全部集中在词汇与动词变位上——没有拼写税。` },
    { id: 'bs02', title: '发音难点预览：只有一座山', body: R`真山只有一座：**大舌颤音 rr**（perro 狗）——练习法（「的了」连音加速）phon 章有专卡，且不影响可懂度，可以慢慢磨。
假坑先排掉：**h 永远不发音**（hola 读「欧拉」）、b 与 v 同音、重音有规则可循——都是知道即会的送分点。
跟读工具：学习页 🔊 按钮（es-ES 口音），元音练「纯」是第一要务。` },
    { id: 'bs03', title: '语法两大预告：ser/estar 与变位', body: R`两座主山：① **两个「是」**：ser 表本质、estar 表状态位置——英语/中文一个「是」，西语要先过思维转换关（noun 章专卡）；② **动词变位**——人称×时态变化，但规则性强（三组模板）+ 主语可省略。
应对：变位先吃透现在时三组模板与四大高频不规则（ser/estar/ir/tener），口语 80% 场景够用。
好消息预告：西语阴阳性比法语规律得多（-o 阳 -a 阴），按词尾猜准确率极高。` },
    { id: 'bs04', title: '第一周怎么过', body: R`① **拼读+元音开路**：phon 章全过 + 每天跟朗读按钮读——元音发「纯」是西语口音的命门（中文母语者注意 e/i 别吞糊）；② 初学者模式开「起步答疑 + 语音与拼读 + 名词与冠词」，每日 10 张；③ rr 每天一分钟练习即可，别给自己压力。
第一周目标：见词能读、greeting 五句脱口而出。
彩蛋：西语问句有倒问号 ¿——书写系统替你提前预告语气，第一次见到会觉得世界真友好。` },
    { id: 'bs05', title: '常见放弃点与对策', body: R`三大放弃点：
① **动词变位膨胀**——对策：先只学现在时 + 近将来时（ir a + 原形）两个时态就能聊起来，过去时两套中期再攻。② **ser/estar 分不清**——对策：问「会变吗」：身份国籍职业用 ser、位置临时状态用 estar，卡组有对比专卡。③ **语速快吞音**——对策：先听慢速播客，抓动词与数字即可懂大意。
总对策：西语是「启动最顺、正反馈最快」的欧洲语言——第一周就能朗读全文，别浪费这个快感，大声读。` }
  ];

  const BEGINNER = ['phon', 'noun'];
  return { BEGINNER: BEGINNER, id: 'es', name: '西班牙语', short: '西语', icon: '🌞', kind: 'qa', group: 'lang', CATS: CATS, DATA: DATA, META: META, HELP: HELP, REL: {}, PITFALL: PITFALL, MNEM: {}, SENTENCES: SENTENCES, ORDER: ['phon', 'base', 'noun', 'verb', 'sent', 'words', 'culture'] };
})();
