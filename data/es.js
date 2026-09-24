/*
 * 西班牙语 · 知识点记忆数据库
 * 教材锚点：《现代西班牙语》第一册入门主干（语音 → 名词与冠词 → 动词变位 → 句型场景 → 高频词汇 → 文化）
 * 结构与其他学科一致：id / cat / title / front / back + META / PITFALL
 * 说明：无例题学科；kind: 'qa'；group: 'lang'——卡面带 Web Speech 朗读按钮（es-ES）。
 * 进度策略=**整科重置**：旧 id（bs/ph/no/vb/se/cu/ew 等）全部替换，新 id 自 xd01 起连续编号；
 *   学习进度一并重置，不继承旧 FSRS 状态。CATS/ORDER 对齐《现代西班牙语》章节骨架。
 * 语言卡三段式：规则 → 例句（原文+中文翻译）→ 活用限制。
 */
window.SUBJECTS = window.SUBJECTS || {};
window.SUBJECTS.es = (function () {
  'use strict';
  const R = String.raw;

  const CATS = {
    phon: '语音',
    noun: '名词与冠词',
    verb: '动词变位',
    sent: '句型场景',
    words: '高频词汇',
    culture: '文化'
  };

  const F = (id, cat, title, front, back) => ({ id, cat, title, front, back });

  const DATA = [
    // ==================== 语音（现代西班牙语·语音导论） ====================
    F('xd01', 'phon', '字母表与正字法总览',
      R`西语字母表有多少个字母？拼写和读音是什么关系？`,
      R`**规则**：共 **27 个字母**（a–z 加 ñ）；2010 年规范后 ch、ll 不再算独立字母，只是字母组合。西语拼读**高度透明**：5 个元音各一音、辅音与拼写基本一一对应——见词能读、听音能写。
~~~text
¿Cómo se escribe? —— 怎么拼写？
Se escribe con b larga. —— 用大写的 B 写。
~~~
**活用限制**：字母名叫「a be ce…」不是英语名；ñ 名叫 eñe，书写波浪线不可丢；重音符号 á/é/í/ó/ú 是拼写的一部分，漏写算拼写错误。`),
    F('xd02', 'phon', '五个元音：永远纯净',
      R`西语元音怎么发？和英语有什么不同？`,
      R`**规则**：只有 **a e i o u** 五个元音，各自**永远读同一个音**——不分长短、没有弱化、没有变音。双元音里的元音也保持纯净（ai 读「啊-衣」快速连读，不是英语的 I）。
~~~text
casa —— 房子（卡萨）
mesa —— 桌子（梅萨）
libro —— 书（利布罗）
~~~
**活用限制**：中文母语者容易把 e/i 读糊或吞掉——练「纯元音」是西语口音第一要务；双元音勿读成英语双元音（ai ≠ 英语 I，au ≠ 英语 ow）。`),
    F('xd03', 'phon', '重音规则三条',
      R`一个词读重哪个音节？什么时候写重音符号？`,
      R`**规则**：① 词尾是元音、n 或 s → 重音落**倒数第二**音节（casa、jóvenes 例外另记）；② 其他辅音结尾 → 重音落**最后**音节（comer、profesor）；③ 违反①②的词必须**写重音符号**（café、fácil、está、árbol）。
~~~text
la casa —— 房子（重音在 ca）
comer —— 吃（重音在 mer）
el café —— 咖啡（重音符号标出）
~~~
**活用限制**：重音符号还用来区分同形词——si（如果）/ sí（是）；el（阳性冠词）/ él（他）；tu（你的）/ tú（你）。读错重音一般仍可懂，但写漏重音符号是正字法错误。`),
    F('xd04', 'phon', '二重元音与三重元音',
      R`两个元音写在一起怎么读？算一个音节还是两个？`,
      R`**规则**：**强元音** a e o + **弱元音** i u（含重读的 í ú）组合成**二重元音**，算**一个音节**：ai/au/ei/eu/oi/ou（aire、pausa）；弱元音组合 iu/ui 也是一个音节（cuidado、viudo）。若两个都是强元音（a+e 等）或弱元音带重音符（oí、reír）则**断开为两音节**。
~~~text
bueno —— 好的（两音节：bue-no）
ciudad —— 城市（两音节：ciu-dad）
oír —— 听（两音节：o-ír，í 带重音）
~~~
**活用限制**：三重元音（弱-强-弱）算一个音节：buey、Uruguay、Paraguay；i/y 在词尾作元音时同弱元音规则（rey、ley）。`),
    F('xd05', 'phon', '分音节规则',
      R`西语单词怎么划分音节？`,
      R`**规则**：① 一个元音构成一个音节核心；② 一个辅音跟一个元音（CV）；③ 两个辅音连写**一般从中划开**（es-tu-di-ar）；④ **ch、ll、rr、pr、pl、br、bl… 等辅音连缀不可拆**（ha-blar、ca-rro）；⑤ 三个辅音连写：最后一个跟后面的元音（ins-ti-tu-to）。
~~~text
profesor —— 老师（pro-fe-sor）
estudiar —— 学习（es-tu-di-ar）
perro —— 狗（pe-rro，rr 不拆）
~~~
**活用限制**：分音节是重音规则的前置——先会切音节，才知道「倒数第二」是哪一节；ñ 是独立字母，不可与 n 归并处理。`),
    F('xd06', 'phon', '特色字母：ñ、ch、ll、rr',
      R`ñ、ch、ll、rr 各读什么？`,
      R`**规则**：**ñ** 读「恩尼」（鼻腭音，año 年）；**ch** 读「恰」（接近汉语拼音 ch，muchacho）；**ll** 读「伊」（阿根廷读 sh/zh 系，本土接近 y——calle 街）；**rr** 是**大舌颤音**（perro 狗，对 r 单颤——pero 但是）。
~~~text
el año —— 年
la calle —— 街道
el perro —— 狗
~~~
**活用限制**：año（年）丢了波浪线就是脏词 ano——书写必带 ñ；rr 练不出不影响可懂度，可用近似音过渡，后期再磨；ll 与 y 在多数口音已合并（ya/calle 同韵）。`),
    F('xd07', 'phon', 'b/v 同音与 c/z/s 分野',
      R`b 和 v 是不是一个音？c、z、s 怎么读？`,
      R`**规则**：**b 与 v 同音**（都是双唇浊塞/近音，vaca 牛与 boca 嘴听感同值）；**c**：在 a/o/u 前读「卡/科/库」的 k，在 e/i 前读咬舌 th（西班牙）或 s（拉美）；**z** 一般只在 a/o/u 前，读 th 或 s（同 c 的软音）；**s** 永远读 s。
~~~text
la vaca —— 牛
la boca —— 嘴
gracias —— 谢谢（西班牙：格拉西亚斯带咬舌）
~~~
**活用限制**：拼写必须区分 b/v（vaca/baca 意思不同），但发音不区分——**会拼不会读错，会听写不出**；写词时拿不准 b/v 查词典，靠词族记（vivir、verde 都是 v）。`),
    F('xd08', 'phon', 'g/j 与哑音 h',
      R`g 和 j 怎么读？h 真的不发音吗？`,
      R`**规则**：**j 与 g(e/i)** 读喉擦音（类似轻咳的 h——jamón、gente）；**g** 在 a/o/u 前读「嘎/哥/古」的 g（gato）；**gu + e/i** 时 u 不发音（guerra），要读 u 须写 gü（pingüino）；**h 永远不发音**（hola 读「欧拉」、hijo 读「伊霍」）。
~~~text
el gato —— 猫
la gente —— 人们（gente 的 g 读喉音）
el hotel —— 旅馆（h 不发音）
~~~
**活用限制**：h 永远哑音，但**拼写不可省**（hay/hoy 写全）；g/j 在 e/i 前合流为同一喉音，拼写靠词记（mujer 是 j、gente 是 ge）。`),
    F('xd09', 'phon', '倒问号与倒叹号',
      R`¿ 和 ¡ 是什么？必须写吗？`,
      R`**规则**：问句以**倒问号 ¿ 开头、? 结尾**（¿Cómo estás?）；感叹/祈使句以 **¡ 开头**（¡Hola!、¡Vamos!）。功能是让读者**提前**知道语气——书写系统服务语调的设计。
~~~text
¿Dónde está el baño? —— 洗手间在哪里？
¡Muchas gracias! —— 太感谢了！
~~~
**活用限制**：正式书写（考试、作文、商务）**必须成对使用**，漏写算标点错误；口语聊天里偶见只写句尾问号，正式文体不可；¿ 不是装饰符号，输入时需专门键入。`),
    F('xd10', 'phon', '连读、语调与朗读节奏',
      R`西语句子怎么连读？疑问句语调有何特点？`,
      R`**规则**：词与词之间**元音相遇常连读**（los‿amigos），辅音结尾接元音开头也顺连——语流像一条链；**一般疑问句**（¿Sí?）句尾**升调**，**特殊疑问句**（¿Dónde…?）句尾**降调**（与英语相反）；陈述句降调。
~~~text
¿Hablas español? —— 你说西语吗？（升调）
¿Cómo te llamas? —— 你叫什么名字？（降调）
~~~
**活用限制**：语速可快但**元音不可吞**——西语节奏靠音节等长，不是靠重读弱读；朗读按钮（es-ES）跟读时先慢速把元音读满，再提速。`),

    // ==================== 名词与冠词（现代西班牙语·性数与限定） ====================
    F('xd11', 'noun', '名词的阴阳性',
      R`西语名词为什么分阴阳性？怎么记？`,
      R`**规则**：每个名词**自带性别**，决定冠词与形容词形式。规律覆盖约九成：**-o 结尾多阳性**（el libro 书）、**-a 结尾多阴性**（la mesa 桌）；-ción/-dad/-tad 等抽象后缀阴性（la ciudad）；表人名词随性别（el amigo / la amiga）。
~~~text
el libro —— 书（阳）
la casa —— 房子（阴）
el problema —— 问题（阳，-ma 希腊词源例外）
~~~
**活用限制**：例外须逐词记：el día 天（阳）、la mano 手（阴）、el mapa 地图（阳）、la foto 照片（阴，来自 fotografía）；**连冠词整体记**（记「la mano」不记「mano」），性别错会连锁错形容词。`),
    F('xd12', 'noun', '名词的复数构成',
      R`名词怎么变复数？`,
      R`**规则**：① **元音结尾 + s**（libro → libros、casa → casas）；② **辅音结尾 + es**（profesor → profesores、imagen → imágenes）；③ **-z 结尾变 -ces**（lápiz → lápices）；④ **-s 结尾且重音在倒数第二音节**的词单复同形（la crisis / las crisis）。
~~~text
los libros —— 那些书
los profesores —— 老师们
los lápices —— 那些铅笔
~~~
**活用限制**：重音在最后音节的 -s 结尾词要 +es（el compás → los compases）；音节与重音在变复数时可能移动（joven → jóvenes 带上重音符号）——写复数时重读一遍音。`),
    F('xd13', 'noun', '定冠词 el / la / los / las',
      R`定冠词什么时候用？有哪些形式？`,
      R`**规则**：定冠词四形——**el**（阳单）、**la**（阴单）、**los**（阳复）、**las**（阴复）。用于：已提到过的人/物、独一无二（el sol）、泛指大类（Me gusta el café）、习惯搭配（por la mañana）。
~~~text
El libro es interesante. —— 这本书很有趣。
Me gusta el chocolate. —— 我喜欢巧克力（泛指）。
~~~
**活用限制**：el 也是直接宾语「他」的同形（Lo veo / Le digo 另论）；重读 a 开头的阴性名词用 **el** 避音（el agua、el águila），但复数回 las（las aguas）——性仍是阴性，形容词用阴性（el agua fría）。`),
    F('xd14', 'noun', '不定冠词 un / una / unos / unas',
      R`「一个」「一些」怎么说？和定冠词怎么选？`,
      R`**规则**：**un**（阳单）、**una**（阴单）、**unos/unas**（复数「一些/几个」）。用于：首次提及、数量「一」、类指中的一个典型（Es un buen médico 他是位好医生）。
~~~text
Necesito un lápiz. —— 我需要一支铅笔。
Una amiga mía es profesora. —— 我有个朋友是老师。
~~~
**活用限制**：uno 在名词前缩成 un（un libro 不说 uno libro）；un/una 也可作数量词「一」，但数字「一」单独说 **uno**（¿Cuántos? Uno.）；复数 unos 常弱化为「几个」，不一定强调数量精确。`),
    F('xd15', 'noun', '缩合冠词 del 与 al',
      R`del 和 al 是什么缩合？怎么来的？`,
      R`**规则**：**de + el = del**（……的）、**a + el = al**（到/向……）——只在与阳性单数定冠词 el 相遇时缩合；de la / a la 不缩合。
~~~text
Soy de China. → el libro del profesor —— 老师的书
Voy al cine. —— 我去看电影。
~~~
**活用限制**：复数与阴性都不缩合（de los、de la、a las）；del/al 是**强制**正字法，写成 de el / a el 算错误；leísmo 等代词现象另论，与冠词缩合无关。`),
    F('xd16', 'noun', '形容词的性数一致',
      R`形容词怎么跟着名词变？`,
      R`**规则**：形容词**性数双配**——阳性常 -o、阴性 -a、复数 +s/-es（un coche rojo / una casa roja / casas rojas）；以 -e 或辅音结尾的形容词**性不变**，只变数（un examen fácil / unos exámenes fáciles）。
~~~text
la casa blanca —— 白房子
los libros interesantes —— 有趣的书
~~~
**活用限制**：bueno/buena、grande/gran 等有缩形（见位置卡）；混合性复数用阳性覆盖（los amigos 可指男女朋友群体）；名词短语中形容词一致对象是**中心名词**，不是最近的词。`),
    F('xd17', 'noun', '形容词的位置与 gran 缩形',
      R`形容词放名词前面还是后面？意思会变吗？`,
      R`**规则**：默认**后置**（un libro interesante 一本有趣的书）；性质词可前置且常带评价/强调：**bueno → buen、malo → mal、grande → gran、primero → primer**（单数阳性前置时缩形）。
~~~text
un hombre grande —— 一个大块头的男人
un gran hombre —— 一位伟人
~~~
**活用限制**：前置往往改变词义（gran ≠ grande 的空间义）——**后置是安全默认**，前置是修辞选择；数字 + 序数：la primera vez（第一次）缩成 primer vez 仅限阳性单数。`),
    F('xd18', 'noun', '主格人称代词与省略',
      R`「我你他」的主格形式？句子能不能省主语？`,
      R`**规则**：**yo**（我）、**tú**（你）、**él/ella/usted**（他/她/您）、**nosotros/nosotras**、**vosotros/vosotras**（西班牙你们）、**ellos/ellas/ustedes**（他们/诸位）。西语动词词尾已含人称——**主语常省略**，只在对比或强调时写出。
~~~text
(Hablo español.) —— 我说西语。（主语省）
Yo soy china, tú eres español. —— 我是中国人，你是西班牙人。（对比，写出）
~~~
**活用限制**：usted/ustedes 用第三人称变位，但称「您/诸位」——勿与 él/ella 混淆；西班牙 vosotros 与拉美 ustedes 不同，学哪种就稳定用哪种；性别区分 nosotros/nosotras 看群体构成。`),
    F('xd19', 'noun', '物主形容词：mi / tu / su…',
      R`「我的你的他的」怎么修饰名词？`,
      R`**规则**：**短形物主**前置修饰名词：mi/tu/su/nuestro/vuestro/su——**只与「物主的数量」和「被修饰名词的性数」协调**：mi libro、mis libros、nuestra casa。**长形**（mío/tuyo…）后置强调或作表语（Es mío 是我的）。
~~~text
mis amigos —— 我的朋友们
nuestra escuela —— 我们的学校
un amigo mío —— 我的一个朋友
~~~
**活用限制**：su 一形多义（他的/她的/您的/他们的）——正式场合用 de él / de ella / de usted 消歧；mi/tu 在任何性数前不变，**不要**写成 mio libro；长形性数随名词（mías amigas 语序为 amigas mías）。`),
    F('xd20', 'noun', '指示形容词与指示代词',
      R`「这个、那个」怎么说？三档距离如何分？`,
      R`**规则**：**近（我侧）**：este/esta/estos/estas + este（中性 esto）；**中（你侧）**：ese/esa/esos/esas + eso；**远（双方侧）**：aquél/aquélla…（现代常写 aquel）+ aquello。指示**形容词**前置名词（este libro），指示**代词**独立用（Este es mío）。
~~~text
Este libro es mío. —— 这本书是我的。
¿Qué es eso? —— 那是什么？
~~~
**活用限制**：este/ese/aquel 有性数变化，esto/eso/aquello **无性数**（指事物/情况）；书面 aquél 的重音符现已可省，但 este/ese 不带；口语里 ese 与 aquel 距离感模糊，靠手势补。`),
    F('xd21', 'noun', 'ser：本质与身份',
      R`ser 用在哪些「是」的场景？`,
      R`**规则**：**ser** 表**本质属性、身份、来源、职业、材质、时间、事件**——相对稳定不变：Soy china（国籍）、Es profesor（职业）、Es de madera（材质）、Son las tres（时间）、Hoy es lunes（日期）。
~~~text
Soy estudiante. —— 我是学生。
La mesa es de madera. —— 桌子是木头做的。
~~~
**活用限制**：ser 不用于位置与临时感受（那用 estar）；与价格/天气搭配另看（Está nublado 多云——状态）；ser 的变位高度不规则，但使用频率极高，靠自我介绍句型可成肌肉记忆。`),
    F('xd22', 'noun', 'estar：状态与位置',
      R`estar 用在哪些「是/在」的场景？`,
      R`**规则**：**estar** 表**位置、临时状态、进行时、结果状态**：Estoy en casa（位置）、Está cansado（此刻累）、Estoy comiendo（进行）、La puerta está abierta（门开着——结果状态）。
~~~text
¿Dónde estás? —— 你在哪里？
Hoy está muy cansada. —— 她今天很累。
~~~
**活用限制**：estar 的「累/高兴/好」是**当下状态**，会变；形容词与 estar 连用常译「感到/处于……」；位置固定但用 ser 的少数：El concierto es en el auditorio（事件本质用 ser）。`),
    F('xd23', 'noun', 'ser 与 estar：经典对比',
      R`同样形容词，接 ser 还是接 estar 意思差在哪？`,
      R`**规则**：**ser + 形容词**＝本质特征；**estar + 形容词**＝临时状态/结果。经典对：Es aburrido（他这人无聊——属性）/ Está aburrido（他现在感到无聊——状态）；Es listo（他聪明）/ Está listo（准备好了）。
~~~text
Ella es alta. —— 她个子高。（本来个子高）
Ella está alta. —— （此刻/最近）她显高了。
~~~
**活用限制**：判断口诀——**「会变吗？短期会变 → estar」**；国籍、职业、材质永用 ser；位置永用 estar（即使很固定：Madrid está en España）；否定注意语序：No es fácil / No está aquí。`),
    F('xd24', 'noun', '疑问词与重音符号',
      R`西语疑问词有哪些？为什么要带重音？`,
      R`**规则**：疑问词**一律带重音符号**（与关系词区分）：**qué**（什么）、**quién**（谁）、**dónde**（哪里）、**cuándo**（何时）、**cómo**（怎样）、**cuánto/a/os/as**（多少）、**cuál**（哪一个）；por qué（为什么，两词）对 porque（因为）。
~~~text
¿Cómo estás? —— 你好吗？
¿Cuánto cuesta? —— 多少钱？
¿Por qué estudias español? —— 你为什么学西语？
~~~
**活用限制**：cuánto 性数随后面名词（¿Cuántos libros?）；qué vs cuál：qué 问「什么」、cuál 问「哪一个/是哪个」（¿Cuál es tu nombre?）；口语可只靠语调，书写必带 ¿…? 与重音符。`),

    // ==================== 动词变位（现代西班牙语·时态与式） ====================
    F('xd25', 'verb', '三组动词与变位总思路',
      R`西语动词怎么分类？变位在变什么？`,
      R`**规则**：按原形词尾分三组：**-ar**（hablar 说）、**-er**（comer 吃）、**-ir**（vivir 住）。变位＝**词干 + 人称词尾**；陈述式现在时六个人称词尾按 yo / tú / él-ella-usted / nosotros / vosotros / ellos-ellas-ustedes 排列。
~~~text
hablar → hablo, hablas, habla, hablamos, habláis, hablan
~~~
**活用限制**：主语可省——词尾已含人称信息（Hablo español 即「我说西语」）；不规则动词只改词干或整词变，词尾框架仍在；先吃透现在时三组模板，再叠时态。`),
    F('xd26', 'verb', '-ar 动词现在时变位',
      R`hablar 的现在时六个人称分别是什么？`,
      R`**规则**：去 -ar 加 **-o / -as / -a / -amos / -áis / -an**：hablar → hablo, hablas, habla, hablamos, habláis, hablan。同一模板套用：trabajar、estudiar、comprar、escuchar。
~~~text
Yo hablo español. —— 我说西语。
Nosotros estudiamos chino. —— 我们学中文。
Ellos trabajan en una oficina. —— 他们在办公室工作。
~~~
**活用限制**：vosotros（habláis）主用于西班牙；拉美用 ustedes 配 hablan；-car/-gar/-zar 结尾在 yo 时会音变（buscar → busco），碰到再收。`),
    F('xd27', 'verb', '-er 动词现在时变位',
      R`comer 的现在时怎么变？`,
      R`**规则**：去 -er 加 **-o / -es / -e / -emos / -éis / -en**：comer → como, comes, come, comemos, coméis, comen。同族：beber、leer、comprender。
~~~text
Como en casa. —— 我在家吃饭。
¿Bebes café? —— 你喝咖啡吗？
Leemos el texto. —— 我们读课文。
~~~
**活用限制**：-er 与 -ir 现在时仅 nosotros/vosotros 不同（-emos/-éis 对 -imos/-ís）；leer 的 yo leo 规则，但阅读类词干遇元音时有变体（leyó 简单过去——另卡）。`),
    F('xd28', 'verb', '-ir 动词现在时变位',
      R`vivir 的现在时怎么变？和 -er 有何不同？`,
      R`**规则**：去 -ir 加 **-o / -es / -e / -imos / -ís / -en**：vivir → vivo, vives, vive, vivimos, vivís, viven。同族：escribir、abrir、partir。
~~~text
Vivo en Beijing. —— 我住在北京。
Escribimos una carta. —— 我们写一封信。
Vivís en Madrid. —— 你们住在马德里。
~~~
**活用限制**：与 -er 比只有「我们/你们」词尾不同（-imos/-ís 对 -emos/-éis），其余同形——成对记效率最高；部分 -ir 是靴子动词（dormir/pedir），词干会变（另卡）。`),
    F('xd29', 'verb', 'ser 现在时变位',
      R`ser 六个人称的现在时是什么？`,
      R`**规则**：**soy, eres, es, somos, sois, son**——全不规则，但词形短、出现频率极高。
~~~text
Soy profesor. —— 我是老师。
¿Eres estudiante? —— 你是学生吗？
Ellos son de China. —— 他们来自中国。
~~~
**活用限制**：勿与 estar 混——身份国籍用 ser；sois 是 vosotros 的形，拉美少用；否定：No soy… / No es…；与时间：Es la una（一点）/ Son las dos（两点起复数）。`),
    F('xd30', 'verb', 'estar 现在时变位',
      R`estar 六个人称的现在时是什么？`,
      R`**规则**：**estoy, estás, está, estamos, estáis, están**——注意 yo 为 estoy（带重音符号），重音在最后音节。
~~~text
Estoy en casa. —— 我在家。
¿Cómo estás? —— 你好吗？
Están cansados. —— 他们累了。
~~~
**活用限制**：estoy/estás/están 的书写重音不可丢；estar 不表国籍职业；与形容词连用译「感到/处于」而非「是（本质）」。`),
    F('xd31', 'verb', 'ir 现在时变位与「去」',
      R`ir 怎么变？「去某地」怎么搭介词？`,
      R`**规则**：ir → **voy, vas, va, vamos, vais, van**（全不规则）；「去某地」用 **ir a + 地点**（Voy al cine / Voy a casa）；与 ser 过去时同形（fui——易混，见过去时卡）。
~~~text
Voy al trabajo. —— 我去上班。
¿Vas a la fiesta? —— 你去派对吗？
~~~
**活用限制**：ir a + **动词原形**＝近将来时（另卡）——同一结构两义，靠后接名词/动词区分；a casa 前不加冠词（ir a casa 回家），但 ir al trabajo 常带 el。`),
    F('xd32', 'verb', 'tener：有与年龄、必须',
      R`tener 怎么变？除了「有」还能表示什么？`,
      R`**规则**：tener → **tengo, tienes, tiene, tenemos, tenéis, tienen**（yo 不规则）。表「有」（Tengo un libro）、年龄（Tengo veinte años）、身体感受（Tengo hambre/frío）、以及 **tener que + 原形**（必须）。
~~~text
Tengo dos hermanas. —— 我有两个姐妹。
Tengo que estudiar. —— 我必须学习。
~~~
**活用限制**：「有」用 tener 不用 ser/haber；年龄固定 años 前用 tener，不说 Soy veinte años；tener que 表外在义务，querer 表意愿——勿混。`),
    F('xd33', 'verb', 'go 动词：hacer poner salir venir',
      R`为什么第一人称多出 g？有哪些 go 动词？`,
      R`**规则**：一批常用动词 **yo 形加 -g-**：hacer → **hago**、poner → **pongo**、salir → **salgo**、venir → **vengo**、tener → **tengo**、traer → **traigo**；其余人称规则（haces, hace…）。
~~~text
Hago la tarea. —— 我做作业。
Salgo a las ocho. —— 我八点出门。
¿Vienes conmigo? —— 你跟我来吗？
~~~
**活用限制**：只 yo 不规则，勿把 g 带到 tú/él；venir 是靴子动词兼 go 动词（vengo / vienes / viene…）；做练习时先写 yo 形过关，再全变位。`),
    F('xd34', 'verb', '词干变化：e→ie / o→ue / e→i',
      R`为什么 quiero 不是 quero？什么是靴子动词？`,
      R`**规则**：词干重读元音在**单数与第三人称复数**时变化（形如靴子）：**e→ie**（querer → quiero）、**o→ue**（poder → puedo, dormir → duermo）、**e→i**（pedir → pido）；**nosotros/vosotros 不变**（queremos, podemos）。
~~~text
Quiero un café. —— 我想要一杯咖啡。
Puedo hablar español. —— 我会说西语。
Dormimos en un hotel. —— 我们睡在旅馆。
~~~
**活用限制**：变化只发生在重读音节——nosotros 词干不重读故不靴；同族成串记（querer/quieren、poder/pueden）；cerrar（cierro）、empezar（empiezo）也是 e→ie。`),
    F('xd35', 'verb', 'poder / querer / deber',
      R`能、想、该 怎么表达？各有什么搭配？`,
      R`**规则**：**poder**（能/可以）＋原形：Puedo entrar?；**querer**（想要）＋原形或名词：Quiero estudiar / Quiero té；**deber**（应该）＋原形：Debes descansar；**deber de**（想必）＋原形：Debe de ser tarde。
~~~text
¿Puedes ayudarme? —— 你能帮我吗？
Quiero aprender español. —— 我想学西语。
Debes dormir más. —— 你该多睡。
~~~
**活用限制**：poder/querer 是靴子动词（puedo/quiero）；deber＋原形＝道义应该，deber de＋原形＝推测，漏 de 则变「应该做」；礼貌请求用 ¿Podría…?（条件式）比 ¿Puedes…? 更客气。`),
    F('xd36', 'verb', 'saber 与 conocer',
      R`「认识」「知道」为什么两个动词？`,
      R`**规则**：**saber**＝知道内容/会技能（后接 que 句、原形、学科）：Sé la respuesta、Sé nadar；**conocer**＝认识人/熟悉地方（后接人、地点）：Conozco a María、Conozco Madrid。
~~~text
Sé que tienes razón. —— 我知道你有道理。
Conozco a tu hermano. —— 我认识你弟弟。
~~~
**活用限制**：会一门语言用 **saber**（Sé español）而认识某国人用 conocer；yo 形：sé / conozco（皆不规则）；询问：¿Sabes…?（知道吗）/ ¿Conoces a…?（认识吗）。`),
    F('xd37', 'verb', '近将来时：ir a + 原形',
      R`「将要做」的口语主力句型是什么？`,
      R`**规则**：**ir（变位）+ a + 动词原形**＝打算/即将做：Voy a estudiar（我这就去学/将学习）；疑问：¿Vas a venir?；否定：No voy a ir。
~~~text
Mañana voy a comprar un libro. —— 明天我要去买本书。
¿Qué vas a hacer? —— 你打算做什么？
~~~
**活用限制**：介词 **a** 不可丢，后接**原形**非变位；与「去某地」同构（Voy a la tienda 名词 vs Voy a comprar 动词）——听时看后接；口语 80% 将来用它，简单将来偏正式/预测。`),
    F('xd38', 'verb', '简单将来时',
      R`「我会……」「将来会……」的词尾将来时怎么变？`,
      R`**规则**：**原形 + 将来词尾**：-é / -ás / -á / -emos / -éis / -án（hablaré, hablarás…；comeré…；viviré…）。不规则在词干：tener → tendré, decir → diré, hacer → haré, poder → podré, saber → sabré, venir → vendré, poner → pondré, querer → querré, salir → saldré。
~~~text
El año que viene estudiaré en España. —— 明年我将在西班牙学习。
Será difícil, pero podrás. —— 会很难，但你能行。
~~~
**活用限制**：三组同一词尾（原形保留）；不规则集在常用短动词，单独过一遍表；与近将来比：简单将来更「预测/承诺」，ir a 更「计划/马上」。`),
    F('xd39', 'verb', '条件式简式',
      R`「会……（如果）」「请……」的客气形怎么变？`,
      R`**规则**：**原形 + 条件词尾**：-ía / -ías / -ía / -íamos / -íais / -ían（hablaría…）；词干不规则同简单将来（tendría, diría, haría, podría）。
~~~text
Me gustaría un café. —— 我想要一杯咖啡。（点餐礼貌）
¿Podría ayudarme? —— 您能帮我一下吗？
~~~
**活用限制**：条件式表「假设下的结果」或**礼貌请求**——比 ¿Puedes…? 正式；词尾 -ía 带重音符号不可漏；与虚拟式未完成过去时同形，入门阶段先掌握礼貌/假设用法即可。`),
    F('xd40', 'verb', '简单过去时：规则变位',
      R`昨天做完的事用哪个过去时？规则怎么变？`,
      R`**规则**：**pretérito indefinido**（简单过去时）表**完成的点事件**。-ar：**-é / -aste / -ó / -amos / -asteis / -aron**（hablé, hablaste, habló…）；-er/-ir：**-í / -iste / -ió / -imos / -isteis / -ieron**（comí, comiste, comió…；viví…）。
~~~text
Ayer hablé con Ana. —— 我昨天和安娜说了话。
Comimos en un restaurante. —— 我们在一家餐馆吃了饭。
~~~
**活用限制**：第三人称 -ó/-ió **带重音符号**（habló 不是 hablo）；-ieron 在元音后缩成 -yeron（leyeron）；此变位与现在时完全不同套，需单独记。`),
    F('xd41', 'verb', '简单过去时：核心不规则',
      R`fui / tuve / hice 这些形从哪来？`,
      R`**规则**：高频不规则分族：**ser/ir 共用**：fui, fuiste, fue, fuimos, fuisteis, fueron；**u 族**（词干含 u）：tener→tuve、estar→estuve、poder→pude、poner→puse、saber→supe、andar→anduve、querer→quise—— ellos 用 **-ieron**（tuvieron, pusieron）；**j 族**（词干 j）：decir→dije、traer→traje、conducir→conduje—— ellos 用 **-eron**（dijeron, trajeron）；**hacer→hice/hizo**（注意 hizo 无 hice 的 e）。
~~~text
Ayer fui al cine. —— 昨天我去了电影院。
No tuve tiempo. —— 我当时没时间。
Me dijo la verdad. —— 他告诉了我真相。
~~~
**活用限制**：fui 既可「是」也可「去」——靠语境（Fui a Madrid 去了 / Fui estudiante 曾是）；j 族 ellos **eron 不用 ieron**（dijeron 不是 dijieron），u 族则正常 tuvieron/pusieron；hacer 的第三人称单数是 **hizo**（去 c），别写成 hice 的延伸。`),
    F('xd42', 'verb', '过去未完成时：背景与习惯',
      R`「那时总是……」「当时正在……」用什么过去时？`,
      R`**规则**：**imperfecto** 词尾：-ar → **-aba / -abas / -aba / -ábamos / -abais / -aban**；-er/-ir → **-ía / -ías / -ía / -íamos / -íais / -ían**。表**习惯、背景描写、进行、年龄、时间「是」**。
~~~text
Cuando era niño, jugaba en el parque. —— 小时候我常在公园玩。
Eran las ocho y llovía. —— 当时八点，天正下着雨。
~~~
**活用限制**：仅 **ser → era/eras/era…** 与 **ir → iba/ibas…** 不规则，其余全规则——比简单过去时好上手；不表「完成一次」——完成一次用 indefinido。`),
    F('xd43', 'verb', '两套过去时：indefinido vs imperfecto',
      R`同样「吃/是」，comí 与 comía、fui 与 era 怎么选？`,
      R`**规则**：**indefinido**＝推进情节的**完成点**（次、下、了）；**imperfecto**＝画背景的**持续/习惯/状态**（那时、总是、正在）。经典结构：**Cuando + imperfecto, indefinido**（Llovía cuando salí 雨下着时我出门了）／**Mientras + imperfecto, imperfecto**。
~~~text
Ayer comí paella. —— 我昨天吃了海鲜饭。（一次完成）
De pequeño comía mucha fruta. —— 小时候我常吃很多水果。（习惯）
~~~
**活用限制**：时间表达配对：ayer/anoche/la semana pasada → indefinido；antes/antes de que/antes（那时）→ imperfecto；叙事文两时混用是难点，先按「点 vs 段」口诀做句。`),
    F('xd44', 'verb', '现在进行时：estar + 副动词',
      R`「正在做」怎么说？和英语进行时一样常用吗？`,
      R`**规则**：**estar（变位）+ 副动词**：-ar → **-ando**（hablando）、-er/-ir → **-iendo**（comiendo, viviendo）。表示说话此刻正在进行。
~~~text
Estoy comiendo. —— 我正在吃饭。
¿Qué estás haciendo? —— 你在做什么？
~~~
**活用限制**：西语进行时**用得比英语少**——简单现在时也能表当下（Trabajo 现在在工作）；副动词不随人称变；少数正字：leer→leyendo、oír→oyendo、ir→yendo。`),
    F('xd45', 'verb', '自复动词：me/te/se',
      R`levantarse、lavarse 这类带 se 的动词怎么变？`,
      R`**规则**：自复代词 **me / te / se / nos / os / se** 与动词人称一致，置于变位动词前（否定前）：Me llamo Ana、Se lava las manos、No me levanto tarde。日常起居、情感、身体动作大量自复（levantarse 起床、vestirse 穿衣、sentirse 感觉）。
~~~text
Me llamo Carlos. —— 我叫卡洛斯。
Nos vemos mañana. —— 明天见。
~~~
**活用限制**：原形带 se，变位时 se 换成对应人称；命令式/进行时中代词位置会变（¡Levántate!、Estoy duchándome——变位进行时可插中间）；「叫名字」必须自复：Me llamo… 不说 Llamo…。`),
    F('xd46', 'verb', 'gustar 家族与间接宾语人',
      R`为什么说 Me gusta 而不是 Yo gusto？`,
      R`**规则**：**gustar** 逻辑是「某物使我喜欢」：主语是**被喜欢之物**，人用**间接宾语** me/te/le/nos/os/les；单物 **gusta**、复物/原形 **gustan**（Me gustan los libros / Me gusta viajar）。同族：**encantar**（酷爱）、**doler**（疼）、**parecer**（觉得）、**faltar**（缺）、**molestar**（烦）。
~~~text
Me gusta el café. —— 我喜欢咖啡。
Me gustan las películas. —— 我喜欢电影。
Le duele la cabeza. —— 他头疼。
~~~
**活用限制**：人不是主语——\*Yo gusto 必错；喜欢复数物用 gustan；明确「谁喜欢」加 A mí me gusta…（强调间接宾语）；le/les 有歧义（他/她/您/他们），靠上下文或 a él/a ella 消歧。`),

    // ==================== 句型场景（现代西班牙语·会话与表达） ====================
    F('xd47', 'sent', '问候、告别与礼貌套语',
      R`一天不同时段怎么问候？告别怎么说？`,
      R`**规则**：**Buenos días**（上午好）、**Buenas tardes**（下午好）、**Buenas noches**（晚上好/晚安）；通用 **Hola**；告别 **Adiós / Hasta luego / Hasta mañana / Nos vemos**；礼貌 **por favor / gracias / de nada / lo siento / perdón / disculpe**。
~~~text
Buenos días, ¿cómo está usted? —— 早上好，您好吗？
Muchas gracias. — De nada. —— 非常感谢。／不客气。
~~~
**活用限制**：disculpe 引起注意/轻微打扰，perdón 认错求原谅，lo siento 表遗憾同情——三者勿互换；Buenas 后的名词常省（¡Buenas!）；熟人之间只 Hola + 名字也够。`),

    F('xd48', 'sent', '自我介绍与相识',
      R`怎么报姓名、国籍、职业？「很高兴认识」怎么说？`,
      R`**规则**：**Me llamo…**（我叫）、**Soy de…**（来自）、**Soy + 职业/身份**、**Tengo… años**（年龄）；应答 **Mucho gusto / Encantado/a / Igualmente**；询问 **¿Cómo te llamas? / ¿De dónde eres? / ¿A qué te dedicas?**。
~~~text
Me llamo Li Wei. Soy de China y soy profesor. —— 我叫李伟。我来自中国，是老师。
Mucho gusto. —— 很高兴认识。
~~~
**活用限制**：Me llamo 自复结构不可简写成 Llamo；职业前**不用冠词**（Soy profesor 不说 Soy un profesor，除非强调「一位」）；正式场合用 usted：¿Cómo se llama usted?`),

    F('xd49', 'sent', '基数词 0–30 与 30–100',
      R`西语数字 0 到 100 怎么说？有哪些不规则？`,
      R`**规则**：0–15 要背：cero uno dos tres cuatro cinco seis siete ocho nueve diez once doce trece catorce quince；16–19 常 dieciséis…diecinueve；20 veinte，21–29 veintiuno…veintinueve；30+ 用 **y** 连接：treinta y uno…cuarenta…
~~~text
Tengo veintitrés años. —— 我二十三岁。
Hay cincuenta y dos estudiantes. —— 有五十二个学生。
~~~
**活用限制**：uno 在阳性名词前缩 un（veintiún libros）；y 只连最后一位数（cincuenta y dos）；金额、门牌、电话常连读，先练清 0–30。`),

    F('xd50', 'sent', '百、千与大数',
      R`一百、一千、一百万怎么说？`,
      R`**规则**：100 **cien**（整百）/ **ciento**（带零头 ciento uno）；200–900 有独立形：doscientos, trescientos…novecientos（性数随名词）；1000 **mil**（mil doscientos…）；1 000 000 **un millón**（de + 名词）。
~~~text
cien libros —— 一百本书
mil quinientos estudiantes —— 一千五百名学生
un millón de gracias —— 万分感谢（直译：一百万个谢意）
~~~
**活用限制**：cien vs ciento 看后有无数词；mil 前不加 un（mil 不说 un mil）；millón 是名词，后必须 **de**（un millón de personas）；性数：doscient**as** libros 错，应 doscientos libros。`),

    F('xd51', 'sent', '报时：¿Qué hora es?',
      R`几点几分怎么说？问时间用什么句型？`,
      R`**规则**：问 **¿Qué hora es?**；「是」用 ser——**Es la una**（一点，单数）／**Son las dos**（两点起，复数）；一刻 **y cuarto**、半 **y media**、过/差：**y** 过、**menos** 差；正式表「在几点」用 **a las**。
~~~text
Son las tres y media. —— 三点半。
Es la una menos cuarto. —— 一点差一刻。
La clase empieza a las ocho. —— 课八点开始。
~~~
**活用限制**：一点用 Es la una 不用 Son；分钟数字也可（las dos y diez）；menos 结构是「几点差几分」，中式「三点四十五」可直说 las tres y cuarenta y cinco。`),

    F('xd52', 'sent', '星期、月份与日期',
      R`星期几、几月几号怎么表达？`,
      R`**规则**：星期首字母小写：lunes martes miércoles jueves viernes sábado domingo；月份：enero febrero marzo abril mayo junio julio agosto septiembre octubre noviembre diciembre；日期顺序 **el + 日 + de + 月 + de + 年**（el tres de mayo de dos mil…）；「星期几」**¿Qué día es hoy?** / **¿A qué día…?**
~~~text
Hoy es lunes. —— 今天是星期一。
Es el quince de septiembre. —— 今天是九月十五日。
~~~
**活用限制**：星期前用 **el** 表「每周几」（el lunes）vs 裸用指本周几；月份**不加冠词**（en mayo 不说 en el mayo）；序数只第一/第二常用（primero/segundo），日期直接用基数。`),

    F('xd53', 'sent', '存在句：hay 与地点表达',
      R`「有」「哪里有」怎么说？方位介词有哪些？`,
      R`**规则**：**hay**（haber 无人称）＝有/存在，**单复数同形**（Hay un problema / Hay muchos）；否定 No hay；方位：**en**（在）、**sobre**（在……上）、**debajo de**（下）、**al lado de**（旁）、**cerca de / lejos de**、**entre**（之间）、**delante de / detrás de**。
~~~text
Hay una farmacia cerca del hotel. —— 旅馆附近有家药店。
El gato está debajo de la mesa. —— 猫在桌子下面。
~~~
**活用限制**：hay 问「有没有」（¿Hay…?），estar 问「在哪里」（¿Dónde está…?）；「在某地有」也可用 estar + 地点，但「存在/有无」用 hay；cerca de / detrás de 的 **de** 不可丢。`),

    F('xd54', 'sent', '购物与价格',
      R`买东西怎么问价、付款？核心句有哪些？`,
      R`**规则**：问价 **¿Cuánto cuesta?**（单物）/ **¿Cuánto cuestan?**（复）/ **¿Cuánto es?**（总价）；购买 **Quiero… / Quisiera…**（更礼貌）/ **Me pone…**（请给我——口语）；付款 **¿Puedo pagar con tarjeta? / En efectivo**；试穿 **¿Puedo probármelo?**。
~~~text
¿Cuánto cuesta esta camisa? —— 这件衬衫多少钱？
Quisiera probármelo. —— 我想试穿一下。
~~~
**活用限制**：cuesta 与物的数一致；价格用 ser（Son cincuenta euros）；砍价可 **¿No hay descuento? / ¿Me hace un precio?**（口语）；receipt 说 el recibo，小票 el ticket。`),

    F('xd55', 'sent', '点餐与餐饮',
      R`进餐厅怎么点菜？「买单」怎么说？`,
      R`**规则**：入座 **Una mesa para dos**；点餐 **Para mí… / Quisiera… / ¿Qué me recomienda?**；饮料主食 **una caña（小杯生啤）/ un café / la cuenta, por favor**（买单）；**La carta**（菜单）、**el plato del día**（当日特餐）。
~~~text
La cuenta, por favor. —— 请结账。
Para mí, una sopa y un café. —— 我要一份汤和一杯咖啡。
~~~
**活用限制**：要账单必须**主动喊**，服务员不主动来不是怠慢；¡Buen provecho! 是「用餐愉快」互祝；小费 no es obligatoria（西班牙），拉美视国家；por favor 放句首句尾皆可。`),

    F('xd56', 'sent', '问路与交通',
      R`问路、坐车的核心句是什么？`,
      R`**规则**：问路 **¿Dónde está…? / ¿Cómo llego a…? / ¿Está lejos?**；指路 **Siga recto / Gire a la izquierda (a la derecha) / Está al lado de…**；交通 **el metro / el autobús / el tren / el taxi / la parada**；买票 **Un billete de ida y vuelta**（往返票）。
~~~text
¿Cómo llego a la estación de metro? —— 地铁站怎么走？
Siga recto y gire a la derecha. —— 直走然后右转。
~~~
**活用限制**：llegar a + 地点（a 不可丢）；girar a la…／doblar a la… 皆可；ida y vuelta 是往返，solo ida 单程；语速快时先抓 **a la derecha/izquierda/recto** 三个方向词。`),

    F('xd57', 'sent', '天气与气候',
      R`西语怎么聊天气？hace 和 estar 怎么分工？`,
      R`**规则**：**hacer 无人称**：Hace calor/frío/sol/viento/buen tiempo/mal tiempo；**llueve**（下雨）、**nieva**（下雪）；**estar**：Está nublado/soleado/fresco。
~~~text
Hace mucho calor hoy. —— 今天很热。
En invierno nieva en el norte. —— 冬天北方下雪。
~~~
**活用限制**：「下雨/下雪」用第三人称单数无人称，不说 Hace lluvia；寒暄感叹 ¡Qué calor/frío!；「天气预报」el pronóstico del tiempo / el parte meteorológico。`),

    F('xd58', 'sent', '比较级与最高级',
      R`「比……更」「不如」「最」怎么表达？`,
      R`**规则**：**más + 形容词 + que**（更）；**menos + 形容词 + que**（不如）；**tan + 形容词 + como**（一样）；不规则：bueno→mejor、malo→peor、grande→mayor、pequeño→menor；最高级 **el/la más + 形容词** 或 **mejor/peor**。
~~~text
Esta casa es más grande que la mía. —— 这房子比我的大。
Es el mejor restaurante de la ciudad. —— 这是城里最好的餐厅。
~~~
**活用限制**：than 在人/物用 que，在群体用 **de**（el mejor de la clase）；mejor/peor 不加 más；口语 más o menos＝马马虎虎，频率极高；绝对最高级也可用 -ísimo（guapísimo）——进阶。`),

    F('xd59', 'sent', '请求、许可与禁止',
      R`「可以吗」「请不要」「必须」怎么说？`,
      R`**规则**：许可 **¿Puedo + 原形? / Está permitido…**；禁止 **No se puede + 原形 / Prohibido + 原形/名词**；义务 **tener que / hay que + 原形**（必须/得）；礼貌请求 **¿Podría…? / ¿Me puede…? / Por favor…**。
~~~text
¿Puedo pasar? —— 我可以进来吗？
No se puede fumar aquí. —— 此处禁止吸烟。
Hay que terminar hoy. —— 今天必须弄完。
~~~
**活用限制**：se puede 是无人称「可以」；prohibido 后可直接名词（Prohibido el paso 禁止通行）；hay que 无主语泛指「大家得」，tener que 有具体主语；否定命令见命令式卡。`),

    F('xd60', 'sent', '命令式：tú 肯定与否定',
      R`怎么对朋友下指令？否定命令怎么变？`,
      R`**规则**：tú **肯定命令**＝第三人称单数现在时（¡Habla! ¡Come! ¡Ven!）；**否定命令**用虚拟式现在时 tú 形加 no（¡No hables! ¡No comas!）；usted 命令：Hable/Coma/Venga usted。
~~~text
¡Ven aquí! —— 过来！
No hagas ruido. —— 别出声。
Hable más despacio, por favor. —— 请您说慢点。
~~~
**活用限制**：肯定 tú 命令**不是**原形；不规则 tú 肾定命令常见十来个要背（di/pon/sal/ven/haz/ten/sé/ve）；对陌生人/长者优先 usted 命令或疑问式请求（¿Me puede…?）。`),

    F('xd61', 'sent', '表达情感、好恶与评价',
      R`喜欢、讨厌、觉得、惊讶怎么说？`,
      R`**规则**：好恶 **gustar/encantar/odiar**（物作主语）；评价 **creer/parecer/pensar que + 陈述**；情感形容词 **estar + cansado/contento/triste/nervioso**；感叹 **¡Qué + 名词/形容词!**（¡Qué bonito!）。
~~~text
Me encanta la música española. —— 我酷爱西班牙音乐。
Creo que tienes razón. —— 我觉得你有道理。
¡Qué día tan bonito! —— 多美的一天啊！
~~~
**活用限制**：好恶对象前用 a（人）或裸名词（物）：Odio a ese profesor / Odio el ruido；parecer 人作主语是「外貌像」（Te pareces a tu madre）——与 Me parece que 两义；感叹句用 ¡…! 与 qué，勿只写感叹号。`),

    F('xd62', 'sent', '打电话、网络与求助',
      R`打电话、求助、没听懂时怎么救场？`,
      R`**规则**：打电话 **¿Está Juan? / De parte de… / Voy a llamarle**；数字报电话逐步念；没听懂 **¿Puede repetir? / No entiendo / ¿Cómo se dice…en español? / ¿Qué significa…?**；求助 **Socorro / ¿Me puede ayudar?**。
~~~text
¿Puede hablar más despacio, por favor? —— 您能说慢点吗？
¿Cómo se dice «电脑» en español? —— 「电脑」西语怎么说？
~~~
**活用限制**：se dice 是无人称「（人们）说」；repetir 礼貌加 ¿Puede/Podría…?；网络西语常缩写（tqm 等）初学先不模仿；没听懂时直接说 No entiendo 完全自然，不必装懂。`),

    // ==================== 高频词汇（课文核心词） ====================
    F('xd63', 'words', 'el tiempo / la hora',
      R`el tiempo 和 la hora 都能译「时间」吗？`,
      R`**规则**：**el tiempo**＝时间（抽象）／天气（¿Qué tiempo hace?）；**la hora**＝钟点、时刻（¿Qué hora es?）；**la vez**＝次数（una vez 一次）。
~~~text
No tengo tiempo. —— 我没时间。
¿Qué hora es? —— 现在几点？
~~~
**活用限制**：问天气用 tiempo、问几点用 hora——勿互换；time 的「一段时间」用 **un rato** / **tiempo**（Espera un rato 稍等）。`),

    F('xd64', 'words', 'la familia',
      R`家庭成员的常用词有哪些？`,
      R`**规则**：el padre/la madre（父母）、el hijo/la hija、el hermano/la hermana、los abuelos（祖父母/外祖父母）、los tíos（叔伯姑姨）、los primos（堂表兄弟姐妹）、el marido/la esposa（配偶）、la pareja（伴侣）。
~~~text
Mi familia es grande. —— 我家人多（家族大）。
Tengo dos hermanas. —— 我有两个姐妹。
~~~
**活用限制**：西语不区分叔伯（都 tío）、堂表（都 primo）——靠上下文；口语 la suegra 可作「岳母/婆婆」统称；「家人」la familia 作集合名词，动词单复数见语法习惯（用复数多）。`),

    F('xd65', 'words', 'la casa 各处',
      R`房子各房间怎么说？`,
      R`**规则**：la sala/el salón（客厅）、el dormitorio/la habitación（卧室）、la cocina（厨房）、el baño（卫生间/浴室）、el jardín（花园）、el balcón（阳台）、la escalera（楼梯）、el ascensor（电梯）。
~~~text
El gato está en la cocina. —— 猫在厨房。
Vivo en un piso con balcón. —— 我住在带阳台的公寓。
~~~
**活用限制**：piso（公寓楼层/套间）与 departamento（拉美公寓）地域有别；el cuarto 也可指小房间；baño 亦指「洗澡」动作义（voy al baño＝上厕所，很常用）。`),

    F('xd66', 'words', 'la ropa 衣物',
      R`常见衣物名词与「穿」怎么搭？`,
      R`**规则**：la camisa（衬衫）、la camiseta（T恤）、el pantalón（裤子）、la falda（裙子）、el vestido（连衣裙）、los zapatos（鞋）、la chaqueta（夹克）、el abrigo（大衣）；「穿」用 **llevar / ponerse**（Me pongo el abrigo）。
~~~text
Lleva una camisa blanca. —— 他穿着白衬衫。
Ponte el abrigo. —— 穿上大衣。
~~~
**活用限制**：llevar 表「穿着（状态）」，ponerse 表「穿上（动作）」；vestirse 是给自己穿（自复）；颜色形容词后置且性数一致（camisa blanc**a**）。`),

    F('xd67', 'words', 'el cuerpo 身体',
      R`身体部位怎么说？疼用什么动词？`,
      R`**规则**：la cabeza（头）、la mano（手）、el pie（脚）、el brazo（胳膊）、la pierna（腿）、la espalda（背）、el estómago（胃）、la garganta（喉咙）；疼用 **doler**（Me duele la cabeza / Me duelen los pies）。
~~~text
Me duele la garganta. —— 我喉咙痛。
Tiene fiebre. —— 他发烧了。
~~~
**活用限制**：doler 同 gustar 家族——身体部位是主语、人间接宾语；mano 是阴性（la mano）；看医生常用：Tengo tos/gripe/dolor de…；「发烧」tener fiebre 不说 estar fiebre。`),

    F('xd68', 'words', 'la comida 食物',
      R`常见食物与「吃喝」怎么表达？`,
      R`**规则**：el pan（面包）、la fruta / la manzana（苹果）、la carne（肉）、el pescado（鱼）、el arroz（米饭）、la sopa（汤）、el queso（奶酪）；动词 **comer / beber / tomar**（tomar 更万能：tomar un café）。
~~~text
No como carne. —— 我不吃肉。
¿Quieres tomar algo? —— 你想喝/吃点什么吗？
~~~
**活用限制**：beber 专「饮」，tomar 可吃可喝可「乘」（tomar el metro）；la comida 亦指「午饭」；素食：soy vegetariano/a；过敏：soy alérgico/a a…`),

    F('xd69', 'words', 'la ciudad 城市设施',
      R`城市常见场所怎么说？`,
      R`**规则**：la escuela/el colegio（学校）、la universidad、el hospital、la farmacia（药店）、el banco（银行）、el mercado（市场）、la tienda（商店）、el museo、la biblioteca（图书馆）、la estación（车站/也指季节——同形）。
~~~text
Voy a la farmacia. —— 我去药店。
La estación de tren está lejos. —— 火车站很远。
~~~
**活用限制**：la estación de tren 火车站 vs la estación del año 季节——同词两义；librería 是书店不是图书馆；el centro 是市中心/中心，口语高频。`),

    F('xd70', 'words', 'los transportes',
      R`交通工具与「乘坐」怎么说？`,
      R`**规则**：el metro、el autobús/el bus、el tren、el coche/el carro/el auto（地域词）、el avión、el barco、la bicicleta/bici；「乘」用 **en + 工具**（en autobús）或 **tomar / coger**（tomar el metro）。
~~~text
Voy al trabajo en metro. —— 我坐地铁上班。
Tomo el autobús a las siete. —— 我七点坐公交。
~~~
**活用限制**：coche（西班牙）/carro（拉美多）/auto（南锥）；coger 在西班牙很常用，在部分拉美国家有粗俗义——对初学者建议 **tomar** 更安全；por + 工具表方式（por correo）。`),

    F('xd71', 'words', 'los días y las horas 习惯表达',
      R`每天/有时/已经 这类时间副词怎么说？`,
      R`**规则**：hoy（今天）、mañana（明天/早上——双义）、ayer（昨天）、ahora（现在）、antes（以前）、después（以后）、siempre（总是）、nunca/jamás（从不）、a veces（有时）、ya（已经）、todavía/aún（还）、temprano/tarde（早/晚）。
~~~text
Siempre desayuno a las siete. —— 我总是七点吃早餐。
¿Ya has comido? —— 你吃过了吗？
~~~
**活用限制**：mañana 作「明天」与「早上」（por la mañana）两义；nunca 置句首可倒装强调（Nunca voy），否定一致 No…nunca；ya 与「已经」近，但更口语即时。`),

    F('xd72', 'words', 'grandes adjetivos',
      R`常用性质形容词有哪些？反义怎么配？`,
      R`**规则**：grande/pequeño、bueno/malo、nuevo/viejo（旧/老）、caro/barato、fácil/difícil、bonito/feo、rápido/lento、limpio/sucio、rico/pobre、feliz/triste。
~~~text
Es un coche nuevo y barato. —— 这是一辆又新又便宜的车。
El examen fue fácil. —— 考试很容易。
~~~
**活用限制**：形容词性数一致（见名词章）；grande 前置缩 gran 义变；viejo 可指人老物旧——与 antiguo（古旧/前）有语感差；bueno/malo 前置缩 buen/mal。`),

    F('xd73', 'words', 'verbos de movimiento',
      R`来、去、进、出、回、到 怎么说？`,
      R`**规则**：ir（去）、venir（来）、entrar（进）、salir（出）、volver（回）、llegar（到达）、subir/bajar（上/下）、pasar（经过/度过）、quedarse（留下）。
~~~text
Vuelvo a casa a las seis. —— 我六点回家。
El tren llega a las diez. —— 火车十点到。
~~~
**活用限制**：llegar a + 地点；volver a + 原形＝「再/重新做」（Vuelve a intentarlo 再试一次）；salir de + 地点（Salir de casa）；entrar en（Entrar en la sala）。`),

    F('xd74', 'words', 'comunicación 言说动词',
      R`说、问、答、告诉 怎么搭结构？`,
      R`**规则**：decir（说/告诉——decir que、decir a alguien）、preguntar（问）、contestar/responder（答）、explicar（解释）、hablar（说语言/谈话）、llamar（叫/打电话）、escribir（写）。
~~~text
Dice que está ocupado. —— 他说他忙。
Te voy a contar un secreto. —— 我要告诉你一个秘密。
~~~
**活用限制**：decir 后接 **que** 从句；preguntar 直接加内容（Pregunta la hora）或 a alguien；「告诉某人」decir + 间宾（Me dice…）；contar 既有「数」也有「讲述」。`),

    F('xd75', 'words', 'el trabajo y el estudio',
      R`工作学习相关核心词？`,
      R`**规则**：el trabajo（工作）、el empleo（就业）、la oficina（办公室）、la empresa（公司）、el jefe（上司）、el sueldo/el salario（工资）、el examen（考试）、la tarea（作业）、la clase（课）、el curso（课程）、aprobar/suspender（及格/不及格）。
~~~text
Trabajo en una empresa china. —— 我在一家中国公司工作。
Tengo que hacer la tarea. —— 我得做作业。
~~~
**活用限制**：estudiar（学习）vs trabajar（工作）对举；la escuela 与 la facultad（系/学院）层级不同；aprobar 是及格/通过，反义 suspender（挂科）；「放假」las vacaciones。`),

    F('xd76', 'words', 'emociones 常用情感形容词',
      R`高兴、累、烦、担心 怎么说？和 ser/estar 怎么配？`,
      R`**规则**：多与 **estar** 连用表状态：cansado/a（累）、contento/a（高兴）、triste、preocupado/a（担心）、nervioso/a、enfadado/a（生气——西班牙）/ enojado/a（拉美）；与 **ser** 连用表特质：alegre（乐观开朗的）。
~~~text
Estoy muy contento hoy. —— 我今天很开心。
No te preocupes. —— 别担心。
~~~
**活用限制**：情感多是「暂时状态」→ estar；性格特质 → ser；preocuparse 是自复（Me preocupo por…）；enojado/enfadado 地域分工，都可用 estar。`),

    // ==================== 文化（西语世界） ====================
    F('xd77', 'culture', '西语世界版图与两大变体',
      R`西班牙西语和拉美西语差在哪？`,
      R`**规则**：全球母语者约 5 亿——母语人数仅次于中文。两大规范：**西班牙本土**（z/ce/ci 咬舌 th、vosotros 人称、coger 常用）vs **拉美**（s 音化、ustedes 通吃、词汇：carro/auto、celular）。
~~~text
En España se dice «ordenador»; en América Latina, «computadora». —— 西班牙说「电脑」ordenador，拉美说 computadora。
~~~
**活用限制**：互通度很高——学任一变体都能听懂另一；入门建议**选定一种口音跟读**，词汇差异在场景里并轨；教材《现代西班牙语》偏西班牙本土规范，但不排斥拉美表达。`),

    F('xd78', 'culture', 'tú 与 usted：称谓选择',
      R`什么时候用 tú，什么时候用 usted？`,
      R`**规则**：**tú**（朋友、同辈、家人、孩子）；**usted**（长者、陌生人、正式、服务初次）——动词用**第三人称单数**；复数西班牙 vosotros / ustedes，拉美几乎只 ustedes。对方说 puedes tutearme 即可改 tú。
~~~text
¿Cómo estás? —— 你好吗？（tú）
¿Cómo está usted? —— 您好吗？（正式）
~~~
**活用限制**：用错称谓比用错时态更失礼——对长者**一律 usted 开局**；拉美部分国家（哥伦比亚等）usted 泛化到亲友，听对方用什么跟什么；usted 缩写 Ud.，复数 Uds.`),

    F('xd79', 'culture', '饮食与作息文化',
      R`西班牙和拉美的吃饭时间、社交习惯有何特点？`,
      R`**规则**：作息偏晚：西班牙午餐 14:00–16:00、晚餐 21:00 后；**tapas**（小碟菜）是社交形态；**siesta**（午休）传统仍在部分城市；拉美时间词 **ahorita** 弹性大（「马上」可以很弹性）。
~~~text
¿Quedamos a tomar algo? —— 聚一聚喝点什么？（邀约万能句）
¡Buen provecho! —— 用餐愉快！
~~~
**活用限制**：赴约「稍晚到」在部分文化不算失礼，但商务场合仍要准点；餐后聊天比翻台重要——别催着走；bread/water 是否收费因店而异，看清菜单。`),

    F('xd80', 'culture', '节日与社交距离',
      R`西语国家重要节日？问候礼节如何？`,
      R`**规则**：西班牙：Semana Santa（圣周）、Las Fallas、fiestas patronales（守护圣徒节，几乎城城有）；拉美：Día de los Muertos（墨西哥亡灵节）、Carnaval；问候：熟人**贴面礼**（西班牙右右两贴，拉美常一贴），友人可拥抱。
~~~text
¡Feliz cumpleaños! —— 生日快乐！
¡Feliz Año Nuevo! —— 新年快乐！
~~~
**活用限制**：贴面礼不是真亲上脸；对不熟的人握手即可；节日问候语直接用 ¡Feliz…!；同事间礼物文化比东亚淡，便饭邀约更常见。`),

    F('xd81', 'culture', '假朋友与词汇陷阱',
      R`哪些西语词「长得像英语但意思完全不同」？`,
      R`**规则**：同源词红利大，但要防**假朋友**：**embarazada**＝怀孕（不是尴尬）、**actual**＝目前的（不是实际的）、**asistir a**＝出席（不是协助）、**realizar**＝实现/进行（不一定是「意识到」）、**librería**＝书店（不是图书馆——图书馆 biblioteca）。
~~~text
Está embarazada. —— 她怀孕了。（不是「她很尴尬」）
~~~
**活用限制**：看到超像英语的词**先查再用**；realmente＝真的/其实，语用近 actually 但拼写词族不同；entrada 是门票/入口，与 entry 义近但用法别照搬。`),

    F('xd82', 'culture', '学习路径：现代西语怎么走',
      R`按《现代西班牙语》路线，入门阶段该怎么安排？`,
      R`**规则**：① **语音先导**（本卡组 phon）：元音纯、重音规则、见词能读——一周可成；② **性数冠词 + ser/estar**（noun）：语法地基；③ **现在时三组 + 核心不规则**（verb）：开口能力；④ **场景句型**（sent）：求生会话；⑤ **教材主线**精读课文与练习，词汇按课积累。
~~~text
Poco a poco se llega lejos. —— 慢慢来，能走很远。（西语谚语）
~~~
**活用限制**：大舌音 rr **不要堵在门口**——先近似音可懂度优先；每天 10 张卡 + 15 分钟跟读（es-ES 🔊）比周末突击有效；整科重置后进度从零滚动，按 BEGINNER 章（语音/名词与冠词）起步。`)
  ];

  const META = {
    xd01: [4, '字母表正字法'], xd02: [5, '五个元音'], xd03: [5, '重音规则'], xd04: [3, '二重元音'],
    xd05: [3, '分音节'], xd06: [4, 'ñ ch ll rr'], xd07: [4, 'b/v c/z/s'], xd08: [4, 'g/j 哑音h'],
    xd09: [3, '倒问倒叹'], xd10: [3, '连读语调'],
    xd11: [5, '阴阳性'], xd12: [4, '名词复数'], xd13: [5, '定冠词'], xd14: [4, '不定冠词'],
    xd15: [4, '缩合冠词'], xd16: [4, '形容词一致'], xd17: [3, '形容词位置'], xd18: [4, '主格代词省略'],
    xd19: [4, '物主形容词'], xd20: [4, '指示词'], xd21: [5, 'ser 本质'], xd22: [5, 'estar 状态'],
    xd23: [5, 'ser estar 对比'], xd24: [4, '疑问词'],
    xd25: [5, '三组动词'], xd26: [5, '-ar 现在时'], xd27: [5, '-er 现在时'], xd28: [5, '-ir 现在时'],
    xd29: [5, 'ser 变位'], xd30: [5, 'estar 变位'], xd31: [5, 'ir 变位去向'], xd32: [5, 'tener 有必须'],
    xd33: [4, 'go 动词'], xd34: [5, '词干变化靴子'], xd35: [4, 'poder querer deber'],
    xd36: [4, 'saber conocer'], xd37: [5, '近将来时'], xd38: [4, '简单将来时'], xd39: [3, '条件式'],
    xd40: [5, '简单过去时规则'], xd41: [5, '简单过去时不规则'], xd42: [5, '过去未完成时'],
    xd43: [5, '两套过去时对比'], xd44: [3, '现在进行时'], xd45: [4, '自复动词'], xd46: [5, 'gustar 家族'],
    xd47: [4, '问候告别'], xd48: [4, '自我介绍'], xd49: [4, '基数词'], xd50: [3, '百千大数'],
    xd51: [4, '报时'], xd52: [3, '星期日期'], xd53: [4, '存在句 hay'], xd54: [3, '购物价格'],
    xd55: [3, '点餐饮食'], xd56: [4, '问路交通'], xd57: [3, '天气'], xd58: [4, '比较最高级'],
    xd59: [4, '请求许可禁止'], xd60: [4, '命令式'], xd61: [3, '情感好恶'], xd62: [3, '电话求助'],
    xd63: [3, '单词·时间'], xd64: [3, '单词·家庭'], xd65: [3, '单词·房屋'], xd66: [3, '单词·衣物'],
    xd67: [3, '单词·身体'], xd68: [4, '单词·食物'], xd69: [3, '单词·城市'], xd70: [3, '单词·交通'],
    xd71: [4, '单词·时间副词'], xd72: [3, '单词·形容词'], xd73: [4, '单词·运动'], xd74: [3, '单词·言说'],
    xd75: [3, '单词·工作学习'], xd76: [3, '单词·情感'],
    xd77: [4, '西语版图'], xd78: [4, 'tú usted'], xd79: [2, '饮食作息'], xd80: [2, '节日礼仪'],
    xd81: [3, '假朋友'], xd82: [3, '学习路径']
  };

  const PITFALL = {
    xd02: R`e/i 保持纯净、勿读成英语双元音；ai 不是英语 I——元音读满是西语口音第一要务。`,
    xd03: R`词尾元音/n/s 重音在倒数第二音节，否则在最后——违反规则必须写重音符号（café/fácil）。`,
    xd07: R`b/v 发音相同但拼写必须区分；会听未必写得出——拿不准查词典，靠词族记。`,
    xd11: R`性别连冠词整体记：el día 是阳、la mano 是阴、el agua 是阴但冠词用 el（避音）。`,
    xd13: R`重读 a 开头阴性名词用 el agua，形容词仍阴性 el agua fría；复数回 las aguas。`,
    xd15: R`de + el = del、a + el = al 是强制缩合；写成 de el / a el 算正字法错误。`,
    xd23: R`Es aburrido（人无聊）vs Está aburrido（感到烦）——短期会变用 estar，本质属性用 ser。`,
    xd34: R`靴子动词 nosotros 不变形：queremos、podemos——词干变化只在重读人称。`,
    xd41: R`fui 兼「曾是」与「去了」；j 族 ellos 是 dijeron/trajeron（-eron），u 族是 tuvieron/pusieron（-ieron）；hacer 的 él 是 hizo。`,
    xd43: R`完成点用 indefinido、习惯背景用 imperfecto——ayer 常配 indefinido，antes/infancia 配 imperfecto。`,
    xd46: R`Me gustan los libros——复数物用 gustan；主语是物不是人，Yo gusto 必错。`,
    xd60: R`tú 否定命令用虚拟式 No hables，肯定命令用第三人称 ¡Habla!——两套形不同源。`
  };

  // 主页「语言每日一句」池：lang 为 Web Speech locale，t 原文，n 译文
  const SENTENCES = [
    { lang: 'es-ES', t: '¿Cómo estás?', n: '你好吗？' },
    { lang: 'es-ES', t: 'Me llamo Ana. Soy de China.', n: '我叫安娜。我来自中国。' },
    { lang: 'es-ES', t: 'Mucho gusto en conocerte.', n: '很高兴认识你。' },
    { lang: 'es-ES', t: '¿Dónde está el baño, por favor?', n: '请问洗手间在哪里？' },
    { lang: 'es-ES', t: '¿Cuánto cuesta esto?', n: '这个多少钱？' },
    { lang: 'es-ES', t: 'No entiendo. ¿Puede repetir, por favor?', n: '我不懂。请您再说一遍好吗？' },
    { lang: 'es-ES', t: 'Estoy aprendiendo español.', n: '我正在学西班牙语。' },
    { lang: 'es-ES', t: 'Hace mucho calor hoy.', n: '今天很热。' },
    { lang: 'es-ES', t: '¿Quieres tomar un café?', n: '你想喝杯咖啡吗？' },
    { lang: 'es-ES', t: 'La cuenta, por favor.', n: '请结账。' },
    { lang: 'es-ES', t: 'Hasta mañana. ¡Buenas noches!', n: '明天见。晚安！' },
    { lang: 'es-ES', t: 'No pasa nada.', n: '没关系，别担心。' },
    { lang: 'es-ES', t: '¡Buen provecho!', n: '用餐愉快！' },
    { lang: 'es-ES', t: 'Poco a poco se llega lejos.', n: '慢慢来，能走很远。' },
    { lang: 'es-ES', t: 'El que la sigue, la consigue.', n: '坚持就能成功。（谚语）' }
  ];

  // —— 帮助栏目文章（检索用，不参与学习调度）——
  const HELP = [
    { id: 'help01', title: '西语是入门成本最低的欧洲语言之一', body: R`拼读**近乎透明**：五个元音各一音永不变化、辅音与拼写基本一一对应、重音有三条规则（违反才写符号）。
推论：**一两周就能朗读任何西语文本**（哪怕不懂意思）——这是西语对初学者的头号红利。
你的记忆量因此主要砸在**词汇与动词变位**上，几乎不耗在拼写税。` },
    { id: 'help02', title: '发音难点预览：元音纯 + 一座 rr 山', body: R`真山只有一座：**大舌颤音 rr**——练习可用近似音过渡，不影响可懂度，慢慢磨即可。
先排假坑：h 永远不发音、b/v 同音、重音有规则——知道即会。
第一周目标：元音读「纯」、见词能读；跟读按钮（es-ES）每天十分钟比背字母表有用。` },
    { id: 'help03', title: '语法两大预告：ser/estar 与变位', body: R`两座主山：① **两个「是」**——本质用 ser、状态位置用 estar，口诀「短期会变吗」；② **动词变位**——人称×时态，但三组模板规则性强，主语可省略。
应对：现在时三组 + ser/estar/ir/tener 先吃透，开口覆盖大半场景；过去时两套（indefinido/imperfecto）中期再攻。
好消息：阴阳性比法语规律得多（-o 阳 -a 阴）。` },
    { id: 'help04', title: '第一周怎么过（现代西语路线）', body: R`① phon 章全过 + 每天跟读：元音纯、重音规则、分音节；② 初学者模式开「语音 + 名词与冠词」；③ 场景卡上每天练三句问候/自我介绍。
第一周目标：¿Cómo estás? / Me llamo… / Soy de… 三类句脱口，见词能读。
别堵在 rr 上——先跑通规则主线。` },
    { id: 'help05', title: '常见放弃点与对策', body: R`三大放弃点：
① **变位膨胀**——先只用现在时 + ir a + 原形就能聊；② **ser/estar**——对比卡反复，写十句自介；③ **两套过去时**——用「点 vs 段」口诀，叙事文按情节/背景拆。
总对策：每天 10 张卡是纪律不是热情；大舌音、速度、变位都靠时间，不靠天赋。` },
    { id: 'help06', title: '朗读与跟读：🔊 按钮怎么用', body: R`学习页 🔊 走 Web Speech（es-ES），SENTENCES 每日一句也可朗读。
跟读三步：① 裸听一遍；② 看原文再听；③ 影子跟读（shadowing）。
语音阶段每天 5–10 分钟跟读；长句按意群停顿再连——西语节奏靠音节等长，不是靠重读弱读。` }
  ];

  const BEGINNER = ['phon', 'noun'];
  return { BEGINNER: BEGINNER, id: 'es', name: '西班牙语', short: '西语', icon: '🌞', kind: 'qa', group: 'lang', CATS: CATS, DATA: DATA, META: META, HELP: HELP, REL: {}, PITFALL: PITFALL, MNEM: {}, SENTENCES: SENTENCES, ORDER: ['phon', 'noun', 'verb', 'sent', 'words', 'culture'] };
})();

