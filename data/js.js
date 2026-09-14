/*
 * JavaScript · 知识点记忆数据库
 * 依据：现代 JavaScript（ES2015+）+ 浏览器运行时核心框架（Web 前端与 Node 通识）
 * 结构与其他学科一致：id / cat / title / front / back + META / PITFALL
 * 说明：无例题学科；kind: 'qa' 驱动 UI 适配。
 */
window.SUBJECTS = window.SUBJECTS || {};
window.SUBJECTS.js = (function () {
  'use strict';
  const R = String.raw;

  const CATS = {
    start: '起步与环境',
    base: '语言基础',
    fn: '函数与作用域',
    proto: '对象与原型',
    dom: 'DOM 与事件',
    async: '异步编程',
    modern: '模块与生态'
  };

  const F = (id, cat, title, front, back) => ({ id, cat, title, front, back });

  const DATA = [
    // ==================== 起步与环境 ====================
    F('bs01', 'start', 'JS 适合做什么',
      R`JavaScript 是一门什么样的语言？适合哪些场景？`,
      R`**网页的专用语言**——浏览器唯一直接执行的语言，也是动态弱类型的脚本语言。
场景三件套：网页交互（前端）、服务器（Node.js）、小程序/桌面应用（Electron）——学会一门，三端通用。
特点：单线程 + 异步模型（async 章细讲）、动态类型（变量不声明类型）——灵活但容易踩坑，本卡组会逐个排雷。`),
    F('bs02', 'start', '零成本环境：浏览器控制台',
      R`怎么最快开始写 JS？一行代码都不用装。`,
      R`浏览器按 **F12**（或右键检查）打开开发者工具，切到 **Console（控制台）**——这就是一个现成的 JS 交互环境。
敲一行 console.log("你好")，回车立即执行——**不需要安装任何东西**，这是 JS 对初学者最大的善意。
控制台就是 REPL：试语法、看变量、查报错——学习全程开着它。`),
    F('bs03', 'start', '把 JS 接入网页',
      R`JS 代码怎么放进网页？`,
      R`两种方式：① 页面里直接写 script 标签；② 外部文件引用（script src="app.js"）——**外部文件是正道**（结构与逻辑分离、可缓存）。
script 标签放 body 末尾（页面元素加载完再执行，避免找不到元素）——新手期最省心的位置。
验证接入成功：在 JS 里 console.log 一句，控制台看得到即通。`),
    F('bs04', 'start', 'Node.js：脱离浏览器的 JS',
      R`Node.js 是什么？和浏览器里的 JS 什么关系？`,
      R`**Node.js = 装在电脑上的 JS 运行环境**——同一门语言，不用浏览器也能跑，还能读写文件、开服务器。
安装后：终端敲 node hello.js 直接运行；敲 node 进入交互模式（同浏览器控制台的用法）。
附带得到 **npm**（包管理器）：npm install 包名——JS 生态的万库之门。前端后端共用一套语言，正是 Node 的意义。`),
    F('bs05', 'start', '怎么读控制台报错',
      R`JS 报错怎么读？`,
      R`控制台红色信息三段式：**错误类型 + 说明 + 出错位置**（点位置链接直达代码行）。
最常见三兄弟：TypeError: x is not a function（把非函数当函数调了）、is not defined（名字拼错或未声明）、Cannot read properties of undefined（访问了不存在的东西的属性——async 章之前的高频客）。
习惯：报错先读第一行，点行号跳过去看代码——九成问题当场就能定位。`),
    F('bs06', 'start', 'let 与 const：从第一天就别用 var',
      R`声明变量用什么？`,
      R`现代 JS 只用两个：**const**（不会重新赋值的量——默认选它）与 **let**（会变的量）。**var 是历史遗留，别再用**（作用域规则反直觉，proto 章细说坑）。
直觉法：先写 const，编辑器/运行报错说要变，再改成 let——这是社区公认的最佳实践。
命名：驼峰式（userName），常量全大写下划线（MAX_SIZE）。`),
    F('bs07', 'start', '工具链总览：编辑器与生态',
      R`JS 的常用工具链有哪些？`,
      R`**编辑器**：VS Code（对 JS 支持开箱即用，装 Live Server 插件可一键起本地服务器、保存即刷新）。
**包管理**：npm（Node 自带）；**打包器**（Vite/Webpack）——把多文件项目压成浏览器友好的产物，框架时代再学。
**浏览器兼容**概念：新语法老浏览器可能不认——现代开发用打包器转译解决，初学期用最新 Chrome 即可无视。`),
    F('bs08', 'start', 'JS 学习路径建议',
      R`JS 入门的推荐节奏？`,
      R`① 起步章 + 语言基础章打底（控制台随手试每个知识点）；② **DOM 章**——学 JS 的动力来源：让网页真正动起来（按钮点击、列表渲染）；③ 函数与异步是两道坎：函数写熟后再攻异步（回调→Promise→await 一条线）；④ 原型链理解「对象从哪来」，框架的根基。
节奏参考：每天 10 张卡 + 每周一个小交互（todo 列表、图片切换）。
铁律：JS 是「开着控制台学」的语言——每个卡片的示例都亲手敲一遍。`),
    // ==================== 语言基础 ====================
    F('ba01', 'base', 'JavaScript 的运行时特征',
      R`JavaScript 是什么类型的语言？单线程如何处理并发？`,
      R`**解释型（JIT 即时编译）**、**动态弱类型**（变量无固定类型、类型可隐式转换）、**单线程**——并发靠**事件循环（Event Loop）**调度异步任务而非多线程。
运行环境：浏览器（DOM、BOM、Web API）或 Node（文件、网络、系统）。两套环境共享语言核心、宿主 API 不同。
"弱类型"的代价：类型转换规则复杂——相等比较的双等号规则是最大坑（见基础卡）。`),
    F('ba02', 'base', 'var、let 与 const',
      R`三种变量声明的区别是什么？TDZ 是什么？`,
      R`**var**：函数作用域、存在**变量提升**（声明提前、值为未定义）、可重复声明——遗留写法。
**let/const**：块级作用域（花括号内有效）、不可重复声明、存在 **TDZ（暂时性死区）**——声明前访问直接报错（不同于 var 的未定义）。
选择：默认 const（引用不变）、需要重新赋值才用 let、**永远不用 var**。`),
    F('ba03', 'base', '数据类型与类型判断',
      R`JavaScript 有哪些数据类型？typeof 的局限？`,
      R`七种原始类型：number、string、boolean、undefined、null、symbol（唯一标识）、bigint（大整数）；加 **object**（对象，含数组/函数/日期等）。
typeof 判断：返回字符串——但 **typeof null 返回 object**（历史 bug）、数组与普通对象都返回 object。
精确判断：Array.isArray 判数组、Object.prototype 上的 toString 方法判一切、instanceof 判构造链。`),
    F('ba04', 'base', '相等比较：双等号与三等号',
      R`双等号与三等号的区别？经典的转换陷阱？`,
      R`**三等号（严格相等）**：类型不同直接不等、类型相同比值——**永远用它**；**双等号**：先隐式转换再比较——规则复杂诡异。
经典陷阱：空串等于零、null 与 undefined 双等号为真但三等号为假、NaN 与任何值（包括自身）都不等。
类型转换：加号遇字符串就拼接；其余算术把字符串转数字（非数字得 NaN）。`),
    F('ba05', 'base', 'null 与 undefined 的区分',
      R`null 与 undefined 各自的含义与使用场景？`,
      R`**undefined**：变量已声明未赋值、对象缺失的属性、函数无返回值——"系统级的未初始化"；**null**：程序**主动**赋值的"空值"（语义上的"没有对象"）。
判断：null 是 object 类型（历史 bug）；判断空值用三等号分别比较。
合并默认值：空值合并运算符（两个问号）——只在 null 或 undefined 时取默认值（比逻辑或更精确：零与空串不再是"假值"）。`),
    F('ba06', 'base', '解构赋值与展开运算符',
      R`解构赋值有哪些形式？展开运算符的用途？`,
      R`**解构**：从数组/对象按模式提取值——const { name, age } = 对象、const [第一个, 第二个] = 数组；可设默认值、可嵌套、可重命名（旧名: 新名）。
**展开运算符**（三个点）：数组/对象展开合并（浅拷贝、合并配置）、函数收集剩余参数（rest 参数）。
组合：函数参数的"收集与展开"是一对镜像操作。`),
    F('ba07', 'base', '模板字符串与字符串方法',
      R`怎么优雅地拼字符串？`,
      R`**模板字符串**用反引号（键盘 Esc 下方那个键）包住字符串，变量用「美元符 + 花括号」嵌入——你好，加美元括号包 name，输出时自动替换，支持换行，是现代 JS 拼串的唯一正解。
常用方法：length、toUpperCase/lowerCase、includes、indexOf、slice、split（切成数组）、trim、replace。
老写法加号拼接能看懂但易错（类型隐转陷阱见下张卡）——新代码一律模板字符串。`),
    F('ba08', 'base', '算术运算与类型转换陷阱',
      R`为什么 1 加 1 会等于 11？`,
      R`加号**遇字符串就变拼接**：1 + "1" 得 "11"（数字被转成字符串粘上去）；而减号始终是数学：3 - "1" 得 2。
显式转换：**Number(x)**（转数字）、**String(x)**（转字符串）、**parseInt/parseFloat**（从字符串开头解析数字）。
另一个坑：0.1 + 0.2 不精确等于 0.3（二进制浮点通病）——金额计算用整数分或专用库。`),
    F('ba09', 'base', '条件与循环写法',
      R`JS 的条件与循环有哪几种？`,
      R`**条件**：if/else if/else、switch/case（记得 break）、三元运算符（条件 ? 值A : 值B——赋值场景神器）。
**循环**：for（经典计数）、**for...of**（遍历数组元素——首选）、**for...in**（遍历对象键名——别拿它遍历数组）、while/do...while。
跳出：break 退出循环、continue 跳过本次；数组另有一族高阶方法（map/filter/forEach——async 章后更顺）。`),
    F('ba10', 'base', '关键字与保留字总览',
      R`JS 有哪些关键字？`,
      R`**声明**：let/const/var/function/class/return；**控制流**：if/else/for/while/do/switch/case/break/continue；**对象与原型**：this/new/extends/super/delete/in/instanceof/typeof/void；**异常**：try/catch/finally/throw；**异步**：async/await/yield；**字面量**：true/false/null/undefined。
保留字（未来可能用）：enum、package 等——都别拿来当变量名。
typeof 是运算符不是函数：typeof x 合法、typeof(x) 也能跑但别这么写。`),
    F('ba11', 'base', 'console 调试家族',
      R`除了 log 还有哪些调试输出？`,
      R`**console.log** 万能输出；**console.warn/error**（黄/红色，语义化提示）；**console.table(数组)**——表格化展示，看数据结构神器。
**console.dir(对象)** 展开对象属性树（DOM 节点尤其有用）；console.time 加 timeEnd 测一段代码耗时。
调试心法：在关键行前后各 log 一次变量——「打印调试」是 JS 学习期最诚实的老师，断点调试（Sources 面板）随后再上。`),
    // ==================== 函数与作用域 ====================
    F('fn01', 'fn', '函数的三种定义方式',
      R`函数声明、函数表达式与箭头函数的区别？`,
      R`① **函数声明**：有提升（可在声明前调用）；② **函数表达式**：赋值给变量、无提升；③ **箭头函数**：简洁语法 + **没有自己的 this、arguments**（继承外层——见函数作用域卡）。
箭头函数不能作构造器、不能用作对象方法（this 会指向外层）——适合回调与短逻辑，不适合对象方法。`),
    F('fn02', 'fn', 'this 的四种绑定规则',
      R`this 指向由什么决定？四种绑定是什么？`,
      R`this 由**调用方式**决定（非定义位置）：① **默认绑定**：独立调用 → 全局对象或未定义（严格模式）；② **隐式绑定**：对象方法调用 → 该对象；③ **显式绑定**：call/apply 指定 this、bind 返回绑定的函数；④ **new 绑定**：指向新创建的对象。
优先级：new > 显式 > 隐式 > 默认。箭头函数无 this（词法作用域继承外层）——事件回调里保持外层 this 的利器。`),
    F('fn03', 'fn', '闭包',
      R`什么是闭包？典型用途与经典陷阱？`,
      R`函数与其**词法作用域**的组合——内层函数"记住"外层函数的变量（即使外层已返回）。
用途：数据私有化（计数器/模块模式）、柯里化、回调保持状态。
经典陷阱：循环中用 var 声明计数变量创建闭包——所有闭包共享**同一个**变量（循环结束时值为终值）；修复：用 let（每次迭代新绑定）或 IIFE 包裹。`),
    F('fn04', 'fn', '高阶函数与回调',
      R`什么是高阶函数？数组的三板斧方法？`,
      R`接收或返回函数的函数——函数是一等公民的基础。
数组三板斧：**map**（逐个变换返回新数组）、**filter**（过滤返回子集）、**reduce**（聚合为单值——累加/分组/管道）；另有 forEach（遍历无返回）、some/every（断言）。
这些方法不修改原数组（返回新数组）——不可变风格让数据流可预测。`),
    F('fn05', 'fn', '作用域链与词法作用域',
      R`JavaScript 的作用域是词法的还是动态的？`,
      R`**词法作用域（静态作用域）**：作用域由代码**书写位置**决定（嵌套时内层可访问外层变量），与调用位置无关。
查找顺序：当前作用域 → 外层逐级 → 全局——找不到即报引用错误（严格模式）。
与 this 的区别：**作用域在定义时确定、this 在调用时确定**——两者的混淆是 JS 最大认知坑。`),
    // ==================== 对象与原型 ====================
    F('pr01', 'proto', '对象的创建与属性访问',
      R`创建对象的几种方式与属性访问语法？`,
      R`① 对象字面量（花括号）；② 构造函数与 new；③ class 语法；④ Object.create（指定原型）。
属性访问：点语法（obj.key）与方括号（obj['key']——键为变量或含特殊字符时用）；属性存在性：in 运算符（含原型链）、hasOwnProperty（仅自身）。
属性的遍历：Object.keys（自身可枚举键）、values、entries；for...in 含原型链可枚举属性（慎用）。`),
    F('pr02', 'proto', '原型链与继承机制',
      R`JavaScript 的继承如何实现？__proto__ 与 prototype 的区别？`,
      R`每个对象有内部原型链接（可用 Object.getPrototypeOf 访问）——属性查找沿**原型链**逐级向上，直到找到或到达空。
**函数的 prototype 属性**：作为 new 出来的实例的原型——"构造函数的实例共享 prototype 上的方法"。
class 语法（ES2015）是原型继承的**语法糖**：extends 实现"类继承"观感、本质仍是原型链。`),
    F('pr03', 'proto', 'class 语法：定义与方法',
      R`class 的定义、构造器与方法的写法？`,
      R`class 类名 { constructor(参数) { this.属性 = 参数; } 方法() { ... } } —— constructor 在 new 时执行、方法挂于原型（实例共享）。
静态方法：static 修饰（类调用而非实例）；取值存值器（get/set）定义计算属性。
字段声明（C++ 风格的公有字段）与私有字段（井号前缀——真正的私有）是较新特性。`),
    F('pr04', 'proto', 'Map、Set 与 WeakMap',
      R`Map 与普通对象何时选择？WeakMap 的用途？`,
      R`**Map**：任意类型作键（对象也能作键）、记住插入顺序、size 属性、频繁增删性能好——键值集合首选（普通对象适合"结构化记录"）；**Set**：值唯一集合（数组去重：new Set(数组)）。
**WeakMap/WeakSet**：键为弱引用（不阻止垃圾回收）——给对象附加元数据而不阻止其回收（私有数据、缓存）。
要点：Weak 系列不可遍历（键随时可能消失）。`),
    // ==================== DOM 与事件 ====================
    F('do01', 'dom', 'DOM 树与节点操作',
      R`DOM 的查询与修改核心 API？`,
      R`查询：**querySelector**（CSS 选择器，返回首个）与 querySelectorAll（返回静态列表）；旧接口 getElementById/getElementsByClassName。
修改：textContent（纯文本，安全）、innerHTML（解析 HTML——**插入用户提供内容会 XSS**，需要净化）、createElement + appendChild 手工构建。
样式与类：classList 的 add/remove/toggle、style 内联属性。
性能：批量修改用 fragment 或先摘离再操作，减少重排重绘。`),
    F('do02', 'dom', '事件监听与事件流',
      R`事件监听的写法与事件流的三个阶段？`,
      R`监听：addEventListener(事件名, 处理函数, 选项)——同一事件可挂多个处理器（对比赋值式 on 事件属性会覆盖）；移除需**同一函数引用**。
**事件流三阶段**：捕获（自顶向下）→ 目标 → **冒泡**（自底向上）——默认在冒泡阶段处理。
阻止：stopPropagation 阻断传播、preventDefault 阻止默认行为（如链接跳转）——两者互不影响。`),
    F('do03', 'dom', '事件委托',
      R`事件委托的原理与好处是什么？`,
      R`利用**冒泡**：把监听器挂在**父容器**上，通过事件对象的 target（实际点击的子元素）分发处理——
好处：① 子元素增删无需重新绑事件（动态列表的标配）；② 一个监听器代替成百上千个（内存与性能）。
实现要点：closest 方法向上找匹配的选择器（处理嵌套子元素）、注意 target 可能是文本节点之外的元素节点。
首页的功能分发、列表项的点击处理都是委托的典型场景。`),
    F('do04', 'dom', '浏览器存储：localStorage 与 cookie',
      R`localStorage、sessionStorage 与 cookie 的区别？`,
      R`**localStorage**：持久键值存储（同源共享、约 5MB、仅字符串——对象要 JSON 序列化）；**sessionStorage**：同源但**标签页会话级**（关闭即清）；**cookie**：随每次请求自动发送到服务器（容量小 4KB、可设过期与域路径）。
分工：纯前端状态用 storage、需要随请求带给服务器的用 cookie（令牌多已改用请求头）。
安全：存储不防 XSS——敏感信息不落地、令牌设 httpOnly 由服务端管理。`),
    // ==================== 异步编程 ====================
    F('as01', 'async', '事件循环：宏任务与微任务',
      R`事件循环如何调度任务？宏任务与微任务的顺序？`,
      R`单线程的 JS 通过事件循环处理异步：执行完**同步代码** → 清空**微任务队列**（Promise 的 then、queueMicrotask）→ 取**一个宏任务**（setTimeout、I/O、UI 渲染）→ 再清微任务……循环。
推论：Promise.then 比 setTimeout 先执行（微任务优先）；微任务中再产生微任务会一直优先清空（可能的饥饿）。
验证题：同步输出 → Promise 输出 → setTimeout 输出的顺序题就是考这个。`),
    F('as02', 'async', 'Promise：状态与链式调用',
      R`Promise 的三种状态与链式调用机制？`,
      R`状态机：**pending** → fulfilled（成功）或 rejected（失败）——**状态不可逆**。
链式调用：then 返回**新 Promise**（回调的返回值传递给下一个 then）——把回调嵌套拍平成线性流水线；错误沿链传递直到被 catch 捕获（通道式错误处理）。
组合：Promise.all（全部成功才成功，一个失败即失败）、allSettled（全部完成无论成败）、race（首个完成者）、any（首个成功者）。`),
    F('as03', 'async', 'async/await',
      R`async/await 的本质与错误处理？`,
      R`**async 函数**自动返回 Promise；**await** 暂停函数执行等待 Promise 结算（不阻塞主线程——底层是微任务）——异步代码写成同步的线性风格。
错误处理：try/catch 捕获 await 的拒绝；多个 await 串行执行（需要并行时先 Promise.all 再 await）。
陷阱：循环中的 await 会串行等待——批量并行用 all 包 map 生成的 promise 数组。`),
    F('as04', 'async', 'fetch 与 JSON',
      R`fetch 的使用流程与注意事项？`,
      R`两段式：**fetch 返回的 Promise 只在网络层失败时拒绝**（404/500 也是 fulfilled！）——必须先检查响应的 ok 属性，再用响应方法（json()/text()）读取正文（第二个异步）。
POST 请求：method、headers（内容类型）、body（JSON 序列化）配置项。
要点：默认同源策略限制——跨域需服务器配合 CORS 头；凭证默认不携带（需要时配置凭证选项）。`),
    F('as05', 'async', '错误处理的最佳实践',
      R`异步代码的错误处理策略？`,
      R`① 同步与异步统一 try/catch（async 函数内 await 的拒绝可被 try 捕获）；② Promise 链末尾必须有 **catch**（否则 unhandled rejection）；③ 全局兜底：window 的未处理拒绝事件上报日志；④ 自定义 Error 子类携带业务语义（区分网络错误与业务错误）。
反模式：空 catch 吞错、把错误转成字符串丢失栈、用回调风格混搭 Promise。`),
    // ==================== 模块与生态 ====================
    F('mo01', 'modern', 'ESM 模块：import 与 export',
      R`ESM 模块的导入导出写法？与 CommonJS 的区别？`,
      R`导出：export const x = ...（具名）、export default（默认导出，每模块一个）；导入：import { x } from 路径、import 默认名 from 路径。
**ESM vs CommonJS**：ESM 是**静态结构**（导入在编译期确定——支持树摇摇除无用代码、循环引用更可控）、异步加载；CommonJS 是运行时动态加载（Node 传统）。
浏览器：script 标签加 type=module——自动严格模式、模块作用域、延迟执行。`),
    F('mo02', 'modern', '可选链与空值合并',
      R`可选链与空值合并运算符如何使用？`,
      R`**可选链**（问号点）：对象深层属性访问——任一环节为 null 或 undefined 时**短路返回 undefined**（不报错）：obj?.属性?.方法?.()。
**空值合并**（两个问号）：左操作数为 null 或 undefined 时取右侧默认值——比逻辑或精确（零、空串、false 不再被误判为"没有值"）。
组合：用户资料?.地址?.城市 ?? '未知'——深层可选数据的优雅读取。`),
    F('mo03', 'modern', 'npm 与前端工程化概览',
      R`npm 的角色与现代前端工程链是什么？`,
      R`**npm**：包管理器——package.json 声明依赖与脚本、node_modules 装依赖、语义化版本（主.次.补丁 与波浪号插入符范围）。
现代工程链：**打包器**（合并模块、压缩、按需加载的分包）、**转译器**（新语法转旧浏览器可运行的代码）、开发服务器热更新。
框架（React/Vue）解决"状态到视图"的声明式映射——但语言核心（本学科内容）是所有框架的地基。`),
  ];

  const META = {
    ba07: [4, '模板字符串'],
    ba08: [5, '算术陷阱'],
    ba09: [3, '条件循环'],
    ba10: [4, '关键字'],
    ba11: [3, 'console 调试'],

    bs01: [3, '起步·JS'], bs02: [3, '起步·JS'], bs03: [3, '起步·JS'], bs04: [3, '起步·JS'], bs05: [3, '起步·JS'], bs06: [3, '起步·JS'], bs07: [3, '起步·JS'], bs08: [3, '起步·JS'],
    ba01: [3, '运行时特征'], ba02: [5, 'var let const'], ba03: [4, '类型判断'], ba04: [5, '相等比较'], ba05: [3, 'null 与 undefined'], ba06: [4, '解构与展开'],
    fn01: [4, '函数三形态'], fn02: [5, 'this 绑定'], fn03: [5, '闭包'], fn04: [4, '高阶函数'], fn05: [3, '词法作用域'],
    pr01: [3, '对象操作'], pr02: [5, '原型链'], pr03: [4, 'class 语法'], pr04: [3, 'Map 与 Set'],
    do01: [4, 'DOM 操作'], do02: [4, '事件流'], do03: [5, '事件委托'], do04: [3, '浏览器存储'],
    as01: [5, '事件循环'], as02: [5, 'Promise'], as03: [5, 'async await'], as04: [4, 'fetch'], as05: [3, '错误处理'],
    mo01: [4, 'ESM 模块'], mo02: [4, '可选链'], mo03: [2, 'npm 与工程化']
  };

  const PITFALL = {
    ba04: R`双等号的隐式转换规则诡异（空串等于零、null 双等于 undefined）——永远用三等号。`,
    fn02: R`this 由调用方式决定而非定义位置：箭头函数、bind、对象方法三者的 this 语义完全不同。`,
    fn03: R`循环 + var + 闭包 = 所有闭包共享终值变量——用 let 每次迭代生成新绑定。`,
    as02: R`Promise 链上任何一个 then 抛错都会跳到最近的 catch——错误处理要放在链尾统一收口。`,
    do01: R`innerHTML 插入用户提供的内容就是 XSS——纯文本用 textContent、必须用 HTML 时先净化。`
  };

  const BEGINNER = ['start', 'base', 'dom'];
  return { BEGINNER: BEGINNER, id: 'js', name: 'JavaScript', short: 'JavaScript', icon: '🌐', kind: 'qa', group: 'skill', CATS: CATS, DATA: DATA, META: META, REL: {}, PITFALL: PITFALL, MNEM: {}, ORDER: ['start', 'base', 'fn', 'proto', 'dom', 'async', 'modern'] };
})();
