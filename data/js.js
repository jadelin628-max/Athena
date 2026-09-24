/*
 * JavaScript 知识 · 知识点记忆数据库
 * 依据：《JavaScript 高级程序设计》（红宝书 / Professional JavaScript for Web Developers）入门主干
 * 结构与其他学科一致：id / cat / title / front / back + META / PITFALL
 * 说明：无例题学科；kind: 'qa' 驱动 UI 适配。
 * 注意：正文刻意避开会被渲染器/校验器误解的写法——模板字符串用文字描述、不写反斜杠转义、
 *       代码块外不出现"小写字母+数字"样式的标识符（防内部编号泄漏误报）。
 * 教材化重构 · 整科重置：新 id ja01–ja77，学习进度重置（对齐 Python v1.41 先例）。
 */
window.SUBJECTS = window.SUBJECTS || {};
window.SUBJECTS.js = (function () {
  'use strict';
  const R = String.raw;

  const CATS = {
    lang: '语言基础',
    mem: '变量作用域与内存',
    ref: '引用类型',
    fn: '函数',
    oop: '对象与原型',
    dom: 'DOM',
    evt: '事件',
    err: '错误处理与调试',
    net: '异步与网络',
    mod: '模块与存储'
  };

  const F = (id, cat, title, front, back) => ({ id, cat, title, front, back });

  const DATA = [
    // ==================== v 教材化重构 ·《JavaScript 高级程序设计》入门主干 ====================
    // ==================== 语言基础（第 3 章） ====================
    F('ja01', 'lang', '变量声明：const、let 与 var',
      R`怎么声明一个变量？三种关键字有什么区别？`,
      R`**const** 声明常量（绑定不可改）、**let** 声明可变量、**var** 是历史写法（函数作用域 + 提升，新代码不用）。
~~~js
const name = 'Ada';     // 常量：不能再赋值
let age = 18;           // 变量：可以重新赋值
age = 19;
// var score = 0;      // 遗留写法，新代码避免
~~~
要点：默认写 const，需要重新赋值再改 let；块级作用域里 const/let 各自独立。陷阱：const 改属性合法（obj.x = 1），改绑定非法（obj = ...）。`),
    F('ja02', 'lang', '数据类型总览',
      R`JavaScript 有哪些数据类型？`,
      R`七种**原始类型**：number、string、boolean、undefined、null、symbol、bigint；外加 **object**（对象、数组、函数、日期都是对象）。
~~~js
let n = 42;            // number
let s = 'hi';          // string
let b = true;          // boolean
let u;                 // undefined：已声明未赋值
let z = null;          // null：主动赋值的"没有对象"
let o = { k: 1 };      // object
~~~
要点：原始类型按值传递、不可变；object 按引用。陷阱：typeof null 得到 object——历史 bug，判空要分开写。`),
    F('ja03', 'lang', 'typeof 与类型判断',
      R`怎么查一个值的类型？typeof 有什么坑？`,
      R`**typeof** 运算符返回类型字符串；数组与普通对象都得 object，null 也得 object。
~~~js
typeof 42;             // 'number'
typeof 'hi';           // 'string'
typeof null;           // 'object'（历史 bug）
Array.isArray([]);     // true：专门判数组
typeof (function () {}); // 'function'
~~~
要点：数组用 Array.isArray；精确分类可用 Object 原型上的 toString 方法。陷阱：typeof 判不出数组与 null 的真身。`),
    F('ja04', 'lang', '数字与精度',
      R`JS 的数字有什么特点？0.1 加 0.2 等于 0.3 吗？`,
      R`JS 只有一种 number（双精度浮点）——**0.1 + 0.2 不精确等于 0.3**（二进制浮点通病）；大整数还有精度上限。
~~~js
console.log(0.1 + 0.2);       // 0.30000000000000004
console.log(0.1 + 0.2 === 0.3); // false
console.log(Number.isInteger(7)); // true
~~~
要点：金额计算用**整数分**或专用库；比较浮点看误差（Math.abs(a - b) 小于极小值）。陷阱：直接三等号比较两个算出来的浮点数几乎必挂。`),
    F('ja05', 'lang', '字符串与常用方法',
      R`字符串怎么截取、查找、变换？`,
      R`字符串**不可变**——所有方法返回新串；常用：length、toUpperCase、includes、indexOf、slice、split、trim、replace。
~~~js
let s = '  Hello  ';
console.log(s.trim());        // 'Hello'
console.log(s.slice(2, 5));   // 'llo'（含头不含尾）
console.log('a,b'.split(',')); // ['a', 'b']
~~~
要点：要"修改"必须接住返回值（s = s.trim()）。陷阱：slice 的结束下标不含自己；indexOf 找不到得负一。`),
    F('ja06', 'lang', '模板字符串',
      R`怎么优雅地把变量嵌进一段文字？`,
      R`**模板字符串**用反引号包住，变量写成「美元符 + 花括号 + 表达式」——支持换行与嵌入表达式，是现代拼串正解。
~~~js
let name = 'Ada';
let age = 18;
// 反引号字符串里写 Hello 后跟美元花括号 name
let s = 'Hello, ' + name;     // 旧写法：加号拼接
console.log(s, age);
~~~
要点：多行文本直接回车；花括号里可放任意表达式。陷阱：反引号与普通引号不是一回事；旧加号拼接遇数字会隐式转字符串。`),
    F('ja07', 'lang', '布尔值与假值',
      R`什么值算假？if 里可以直接写变量吗？`,
      R`假值只有这几个：false、0、空串、null、undefined、NaN——**其余全为真**（包括空数组与空对象）。
~~~js
if ('') { console.log('真'); } else { console.log('假'); }  // 假
if ([]) { console.log('真'); }                              // 真！空数组为真
let count = 0;
if (count) { /* 不会进 */ }
~~~
要点：判空字符串写 s === '' 或 !s；判空数组别用 !arr（恒假失败——空数组是真）。陷阱：0 与空串在布尔上下文为假，但不等于 false。`),
    F('ja08', 'lang', '相等：三等号与双等号',
      R`两个等号和三个等号差在哪？该用哪个？`,
      R`**三等号（严格相等）**：类型不同直接不等，类型相同比值——**永远用它**；**双等号**会隐式转换再比，规则诡异。
~~~js
console.log(1 === '1');       // false
console.log(1 == '1');        // true（隐式转换）
console.log(null == undefined); // true
console.log(null === undefined); // false
~~~
要点：默认三等号；判 null 或 undefined 可用双等号或空值合并。陷阱：空串等于零、NaN 与任何值（含自身）都不等。`),
    F('ja09', 'lang', '算术与类型转换陷阱',
      R`为什么 1 + "1" 等于 "11"？怎么显式转换？`,
      R`加号**遇字符串就拼接**，减乘除始终是数学；显式转换用 Number、String、parseInt。
~~~js
console.log(1 + '1');         // '11'
console.log(3 - '1');         // 2
console.log(Number('12'));    // 12
console.log(parseInt('12px', 10)); // 12
~~~
要点：从字符串解析整数记得传进制 10。陷阱：Number('') 得 0、Number('abc') 得 NaN；parseInt 会从头解析到非数字。`),
    F('ja10', 'lang', '条件语句与三元运算',
      R`多档判断怎么写？赋值场景怎么简洁判断？`,
      R`**if / else if / else** 自上而下命中即停；**switch** 记得 break；**三元**（条件 ? 甲 : 乙）适合二选一赋值。
~~~js
let score = 85;
let grade = score >= 90 ? 'A' : score >= 80 ? 'B' : 'C';
if (score >= 60) {
  console.log('及格');
} else {
  console.log('再练');
}
~~~
要点：互斥档位用 if 链或 switch；独立检查用多个 if。陷阱：switch 少写 break 会贯穿到下一档。`),
    F('ja11', 'lang', '循环：for、for-of、for-in、while',
      R`遍历数组和对象各用什么循环？`,
      R`**for** 经典计数；**for-of** 遍历元素（数组首选）；**for-in** 遍历键名（对象用）；**while** 条件为真就继续。
~~~js
let arr = ['a', 'b'];
for (const x of arr) { console.log(x); }
for (const k in { n: 1 }) { console.log(k); }
let i = 0;
while (i < 2) { i++; }
~~~
要点：for-of 取值、for-in 取键。陷阱：别用 for-in 遍历数组（会带上原型链键、顺序不稳）；for-in 里键是字符串。`),
    F('ja12', 'lang', '严格模式与注释',
      R`怎么开启严格模式？注释怎么写？`,
      R`脚本或函数开头写 **use strict** 开启严格模式——禁用隐式全局、抛出更多错误，模块默认严格。
~~~js
'use strict';
// 单行注释
/* 块注释 */
let x = 1;
// y = 2;   // 严格模式下直接报错（隐式全局被禁）
~~~
要点：新模块与 class 体自动严格；注释写"为什么"而不是复述代码。陷阱：严格模式 this 不再默认指向全局对象。`),

    // ==================== 变量作用域与内存（第 4 章） ====================
    F('ja13', 'mem', '词法作用域与作用域链',
      R`变量在哪能被看见？查找顺序是怎样的？`,
      R`**词法作用域**：作用域由**书写位置**决定（内层可读外层），与谁调用无关；查找沿作用域链逐级向上。
~~~js
let out = 1;
function f() {
  let inn = 2;
  return out + inn;   // 先找 inn，再找外层 out
}
console.log(f());     // 3
~~~
要点：作用域在**定义时**锁定。陷阱：这与 this 的规则相反（this 在调用时确定）——两者别混。`),
    F('ja14', 'mem', '变量提升与暂时性死区',
      R`为什么 var 能先用后声明，let 却报错？`,
      R`**var** 有变量提升（声明提前、值为 undefined）；**let/const** 有 **TDZ（暂时性死区）**——声明前访问直接抛错。
~~~js
console.log(typeof hoisted); // undefined（var 提升）
// console.log(tdz);        // ReferenceError：TDZ
let tdz = 1;
~~~
要点：let/const 必须"先声明后使用"。陷阱：typeof 对 TDZ 变量也会抛错（与未定义变量不同）。`),
    F('ja15', 'mem', 'null 与 undefined',
      R`两个"空值"各是什么意思？怎么合并默认值？`,
      R`**undefined**：系统级未初始化（未赋值、无返回值、缺属性）；**null**：程序主动写的"空对象"。
~~~js
let a;
console.log(a);              // undefined
let b = null;
console.log(b === null);     // true
console.log(null == undefined); // true
console.log(0 || '默认');     // '默认'（0 被当假值）
console.log(0 ?? '默认');     // 0（空值合并只认 null/undefined）
~~~
要点：默认值用空值合并（两个问号），比逻辑或精确。陷阱：判空值要分别对 null 与 undefined 比较。`),
    F('ja16', 'mem', '复制与传参：值与引用',
      R`把对象赋给另一个变量，改一个另一个会变吗？`,
      R`**原始类型按值**复制；**对象按引用**共享——两个名字指向同一对象，改属性双方可见。
~~~js
let a = { n: 1 };
let b = a;
b.n = 2;
console.log(a.n);            // 2：同一对象
let c = Object.assign({}, a); // 浅拷贝：断开顶层引用
c.n = 3;
console.log(a.n);            // 2：原对象不动
~~~
要点：函数参数同规则——传对象，函数内改属性会作用到外面。陷阱：浅拷贝只复制一层，嵌套对象仍共享。`),
    F('ja17', 'mem', '垃圾回收与常见泄漏',
      R`内存什么时候释放？为什么会内存泄漏？`,
      R`引擎用**可达性**判断生死：从根（全局、调用栈）摸得到就活着，摸不到就回收——开发者不手动 free。
~~~js
let obj = { big: true };
obj = null;   // 断开引用：下次回收可释放
// 泄漏反例：定时器/监听器一直持有不用的对象
~~~
要点：组件卸载清定时器、移除不再需要的事件监听。陷阱：被遗忘的闭包或监听器会让对象一直可达，形成长期泄漏。`),
    F('ja18', 'mem', '执行上下文与调用栈',
      R`JS 代码是怎么跑起来的？递归为什么会爆栈？`,
      R`引擎解析编译后在**调用栈**上执行：每调用一个函数压入一帧，返回弹出；栈深度有限。
~~~js
function a() { return b(); }
function b() { return 1; }
console.log(a());   // 1：a 压栈 → b 压栈 → b 弹出 → a 弹出
// 无限递归会抛 RangeError: Maximum call stack size exceeded
~~~
要点：同步代码在一条栈上顺序跑完；异步回调另走事件循环（异步章）。陷阱：递归必须有出口，否则栈溢出。`),

    // ==================== 引用类型（第 5–6 章） ====================
    F('ja19', 'ref', '对象字面量与属性访问',
      R`怎么创建对象？属性怎么读写？`,
      R`最常用**对象字面量**（花括号）；点语法读写属性，方括号可在键名为变量时用；键本质是字符串。
~~~js
let user = { name: 'Ada', age: 18 };
user.name = 'A.';
console.log(user['age']);     // 18
let key = 'name';
console.log(user[key]);       // 'A.'
delete user.age;
~~~
要点：动态键用方括号；delete 删属性。陷阱：键加不加引号都是字符串（数字键会变字符串）。`),
    F('ja20', 'ref', 'Array 创建与索引',
      R`数组怎么创建？怎么取第一个和最后一个？`,
      R`数组是**有序、可变**的列表；**索引从 0 开始**，length 是长度；负索引不是原生标准（用 length 换算）。
~~~js
let arr = ['a', 'b', 'c'];
console.log(arr[0]);          // 'a'
console.log(arr[arr.length - 1]); // 'c'
arr[1] = 'B';
console.log(arr.length);      // 3
~~~
要点：稀疏赋值（arr[5] = x）会拉长数组。陷阱：越界读得 undefined 不报错；别用 for-in 遍历数组。`),
    F('ja21', 'ref', 'Array 增删改',
      R`数组怎么尾部追加、弹出、按索引删？`,
      R`**push/pop** 尾部进与出；**unshift/shift** 头部进与出；**splice** 任意位置删插改；**slice** 复制片段（不改原数组）。
~~~js
let arr = ['b', 'c'];
arr.push('d');
arr.unshift('a');
let mid = arr.splice(1, 1);   // 从下标 1 删 1 个并返回
let copy = arr.slice(0);      // 复制整个数组
~~~
要点：splice 会改原数组，slice 返回新数组。陷阱：slice 含头不含尾；splice 第二参是删除个数不是结束下标。`),
    F('ja22', 'ref', 'Array 迭代与变换',
      R`想把每个元素变一变、过滤、求和——用什么方法？`,
      R`三板斧：**map**（变换出新数组）、**filter**（过滤子集）、**reduce**（聚成单值）；forEach 只遍历，some/every 断言。
~~~js
let nums = [1, 2, 3];
let doubled = nums.map((n) => n * 2);     // [2, 4, 6]
let big = nums.filter((n) => n > 1);      // [2, 3]
let sum = nums.reduce((a, b) => a + b, 0); // 6
~~~
要点：map/filter/reduce 都返回新值、不改原数组。陷阱：forEach 无返回值；reduce 记得给初始值。`),
    F('ja23', 'ref', 'String 方法速查',
      R`查找、替换、切开字符串最常用的几个方法？`,
      R`includes 判包含、indexOf 找下标、slice 切片、split 切成数组、replace 替换（默认只换第一处）、trim 去空白。
~~~js
let s = 'Hello, JS';
console.log(s.includes('JS')); // true
console.log(s.split(', '));    // ['Hello', 'JS']
console.log(s.replace('JS', 'JS!')); // 'Hello, JS!'
~~~
要点：replace 传正则可全局替换；split 是文本分析起手式。陷阱：字符串方法都返回新串，原串不变。`),
    F('ja24', 'ref', 'Date 基础',
      R`怎么取当前时间、怎么创建指定日期？`,
      R`**Date** 表示时刻；new Date() 得当前时间，new Date(年, 月, 日) 创建指定日（**月份从 0 起**）。
~~~js
let now = new Date();
let d = new Date(2026, 0, 15); // 2026-01-15（月份 0 = 一月）
console.log(d.getFullYear());  // 2026
console.log(now.getTime());    // 毫秒时间戳
~~~
要点：比较先后用 getTime 时间戳。陷阱：第二个参数月份从 0 开始——新手第一大坑。`),
    F('ja25', 'ref', 'RegExp 入门',
      R`正则怎么在字符串里查找和替换？`,
      R`**RegExp** 描述字符模式；test 判匹配、exec 取结果、字符串的 match/search/replace 可直接用。
~~~js
let re = /\d+/;               // 一个或多个数字
console.log(re.test('a12'));  // true
console.log('a12'.match(re)); // ['12']
console.log('a12'.replace(/\d/g, '#')); // 'a#'（g 全局）
~~~
要点：量词与字符类先掌握加号、星号、方括号、锚点。陷阱：replace 默认只替换第一处，要全局请加 g 修饰符。`),
    F('ja26', 'ref', 'Map 与 Set',
      R`键值对何时用 Map？去重用什么？`,
      R`**Map**：任意类型可作键、记住插入顺序、有 size；**Set**：值唯一，常用来去重。
~~~js
let m = new Map();
m.set('k', 1);
console.log(m.get('k'), m.size); // 1 1
let uniq = new Set([1, 1, 2]);
console.log([...uniq]);          // [1, 2]
~~~
要点：普通对象适合固定结构记录，Map 适合动态键值。陷阱：WeakMap 键必须是对象且不可遍历。`),
    F('ja27', 'ref', 'JSON 序列化',
      R`对象怎么变成字符串发给服务器？字符串怎么变回对象？`,
      R`**JSON.stringify** 把值序列化成 JSON 文本；**JSON.parse** 把 JSON 文本解析成值——前后端交换的标准格式。
~~~js
let obj = { n: 1, ok: true };
let text = JSON.stringify(obj);
let back = JSON.parse(text);
console.log(back.n);          // 1
~~~
要点：能序列化的只有可 JSON 化的结构（函数、undefined 会被丢掉）。陷阱：JSON 无注释、无 undefined；循环引用会抛错。`),
    F('ja28', 'ref', 'Math 与 Number 工具',
      R`取整、随机、四舍五入有哪些现成工具？`,
      R`**Math**：floor 向下、ceil 向上、round 四舍五入、random 随机、abs/max/min；**Number**：isInteger、toFixed。
~~~js
console.log(Math.floor(1.7));  // 1
console.log(Math.round(1.5));  // 2
console.log(Math.random());    // [0, 1)
console.log((3.1416).toFixed(2)); // '3.14'
~~~
要点：random 含 0 不含 1；toFixed 返回**字符串**。陷阱：parseInt 是全局函数，toFixed 是数字实例方法。`),

    // ==================== 函数（第 10 章 / 函数表达式） ====================
    F('ja29', 'fn', '函数定义三形态',
      R`函数声明、函数表达式、箭头函数怎么选？`,
      R`① **函数声明**有提升；② **函数表达式**赋值给变量、无提升；③ **箭头函数**简洁且无自己的 this。
~~~js
function add(a, b) { return a + b; }
const add2 = function (a, b) { return a + b; };
const add3 = (a, b) => a + b;
console.log(add(1, 2), add2(1, 2), add3(1, 2));
~~~
要点：回调与短逻辑用箭头；对象方法慎用箭头（this 会指外层）。陷阱：箭头函数不能当构造器、没有 arguments。`),
    F('ja30', 'fn', '参数：默认值与剩余参数',
      R`参数可以省略吗？参数个数不定怎么办？`,
      R`**默认值**让形参可省略；**剩余参数**（三个点 + 名字）把多余实参收成数组。
~~~js
function greet(name, punct = '!') {
  return 'Hi ' + name + punct;
}
function sum(...nums) {
  return nums.reduce((a, b) => a + b, 0);
}
console.log(greet('Ada'), sum(1, 2, 3));
~~~
要点：默认值在形参后部；剩余参数必须是最后一个。陷阱：默认值是表达式时会在每次调用时求值。`),
    F('ja31', 'fn', 'arguments 与 rest 的差别',
      R`老代码里的 arguments 是什么？和 rest 什么关系？`,
      R`**arguments** 是普通函数内的类数组对象（有 length、无数组方法）；**rest** 是真数组，更现代。
~~~js
function f() {
  console.log(arguments.length);
}
f(1, 2);
const g = (...args) => args.map((x) => x);
console.log(g(1, 2));   // [1, 2]
~~~
要点：新代码一律 rest；箭头函数没有 arguments。陷阱：类数组不能直接 map/filter，要先转数组。`),
    F('ja32', 'fn', '箭头函数与 this',
      R`箭头函数为什么常写在回调里？它的 this 是谁？`,
      R`箭头函数**没有自己的 this**，沿外层词法作用域继承——回调里保持外层 this 的利器；也不能用作对象方法。
~~~js
const obj = {
  n: 1,
  bad() { [1].forEach(() => console.log(this.n)); } // 1：箭头继承外层
};
obj.bad();
~~~
要点：定时器、map/filter 回调里想拿外层 this 就用箭头。陷阱：对象方法写成箭头会导致 this 不是该对象。`),
    F('ja33', 'fn', 'this 的四种绑定',
      R`this 指向由什么决定？优先级如何？`,
      R`this 由**调用方式**决定：默认绑定（全局或 undefined）、隐式绑定（obj.m()）、显式绑定（call/bind）、new 绑定（新对象）。优先级：**new > 显式 > 隐式 > 默认**。
~~~js
const o = {
  v: 1,
  get() { return this.v; }
};
console.log(o.get());       // 1：隐式
const g = o.get;
// console.log(g());       // 默认绑定：this 丢了
console.log(g.call(o));     // 1：显式
~~~
要点：方法被赋值给变量再调用，隐式绑定就丢了。陷阱：严格模式下默认绑定 this 是 undefined 不是全局。`),
    F('ja34', 'fn', 'call、apply 与 bind',
      R`怎么强制指定 this？三个方法差别在哪？`,
      R`**call(甲, 参数...)** 与 **apply(甲, [参数])** 立即调用并指定 this；**bind(甲)** 返回一个 this 被钉死的新函数。
~~~js
function hi(greet) { return greet + ' ' + this.name; }
const o = { name: 'Ada' };
console.log(hi.call(o, 'Hello'));     // 'Hello Ada'
console.log(hi.apply(o, ['Hello']));  // 'Hello Ada'
const hiAda = hi.bind(o);
console.log(hiAda('Hi'));             // 'Hi Ada'
~~~
要点：参数列表用 call、参数数组用 apply；bind 适合预先绑好再传给事件。陷阱：bind 返回新函数，多次 bind 以第一次为准。`),
    F('ja35', 'fn', '闭包',
      R`什么是闭包？循环里的经典坑是什么？`,
      R`内层函数"记住"外层函数的变量——**函数 + 词法环境**的组合即闭包；可做数据私有与状态保持。
~~~js
function makeCounter() {
  let n = 0;
  return () => ++n;
}
const c = makeCounter();
console.log(c(), c());  // 1 2
~~~
要点：计数器、模块模式都是闭包。陷阱：循环里用 var 创建的闭包共享同一变量——改用 let 每次迭代新绑定。`),
    F('ja36', 'fn', '高阶函数：接收或返回函数',
      R`什么是高阶函数？和数组方法怎么配合？`,
      R`**高阶函数**接收或返回函数——函数是一等公民的体现；map/filter/reduce/forEach 都是高阶函数。
~~~js
const withLog = (fn) => (x) => {
  console.log('call', x);
  return fn(x);
};
const double = (n) => n * 2;
console.log(withLog(double)(3));  // call 3 / 6
~~~
要点：把"做什么"当参数传入，代码更可复用。陷阱：回调里 return 写漏会变成 undefined 流进下游。`),

    // ==================== 对象与原型（第 8 章） ====================
    F('ja37', 'oop', '对象创建方式',
      R`创建对象有哪几种写法？各自适合什么场景？`,
      R`① **对象字面量**（单例首选）；② **构造函数 + new**；③ **class**（现代标配）；④ **Object.create**（指定原型）。
~~~js
const a = { x: 1 };
function Point(x) { this.x = x; }
const p = new Point(2);
class P { constructor(x) { this.x = x; } }
const q = new P(3);
console.log(a.x, p.x, q.x);
~~~
要点：新代码用 class；字面量写配置对象。陷阱：忘记 new 时构造函数里的 this 会指错（严格模式报错更友好）。`),
    F('ja38', 'oop', '属性特性与方法定义',
      R`对象方法怎么写？属性能"只读"吗？`,
      R`方法写在对象里即可；更细粒度控制用 **Object.defineProperty**（可设只读、不可枚举）；class 方法默认可枚举到原型上共享。
~~~js
const o = {
  name: 'Ada',
  hello() { return 'hi ' + this.name; }
};
console.log(o.hello());
Object.defineProperty(o, 'id', { value: 1, writable: false });
// o.id = 2;  // 严格模式会失败
~~~
要点：共享行为挂原型/class 方法，数据挂实例。陷阱：defineProperty 默认不可写、不可枚举，和字面量属性不一样。`),
    F('ja39', 'oop', '原型与原型链',
      R`对象没有定义的方法为什么能调用？查找顺序是怎样的？`,
      R`每个对象有内部原型链接——属性查找沿**原型链**逐级向上，直到找到或到达尽头；这实现了方法共享。
~~~js
const o = { a: 1 };
console.log(o.toString());   // 来自 Object 原型
console.log(Object.getPrototypeOf(o) === Object.prototype); // true
~~~
要点：自身属性优先于原型属性（可遮蔽）。陷阱：在原型上改方法会影响所有实例；原型链尽头是 null。`),
    F('ja40', 'oop', 'prototype 与 constructor',
      R`函数身上的 prototype 是什么？和对象的原型什么关系？`,
      R`函数有 **prototype** 对象——用 new 创建的实例的原型指向它；prototype 上的 constructor 默认指回该函数。
~~~js
function Dog(name) { this.name = name; }
Dog.prototype.say = function () { return this.name + ' wang'; };
const d = new Dog('Xiao');
console.log(d.say());                 // 'Xiao wang'
console.log(Dog.prototype.constructor === Dog); // true
~~~
要点：实例共享 prototype 方法、各自持有实例属性。陷阱：整段替换 prototype 会弄丢 constructor，要手动补。`),
    F('ja41', 'oop', '继承：原型链与 class extends',
      R`JS 怎么实现继承？class 继承的本质是什么？`,
      R`经典做法是**寄生组合式继承**（构造函数偷属性 + 原型链接方法）；**class extends** 是同一套原型继承的现代语法糖。
~~~js
class Animal {
  speak() { return '...'; }
}
class Dog extends Animal {
  speak() { return super.speak() + ' wang'; }
}
console.log(new Dog().speak()); // '... wang'
~~~
要点：extends 后必须先 super 再用 this。陷阱：class 继承仍然是原型链，不是 Java 那种复制式类。`),
    F('ja42', 'oop', 'class 字段、静态与私有',
      R`class 里怎么写字段、静态方法、私有成员？`,
      R`字段直接写在类体（自动挂实例）；**static** 是类自己的方法；**井号前缀**是真私有（外部不可读）。
~~~js
class Counter {
  static zero() { return new Counter(); }
  #n = 0;
  inc() { this.#n += 1; return this.#n; }
}
console.log(Counter.zero().inc()); // 1
// Counter.zero().#n  // 语法错误：私有
~~~
要点：公共字段可写在 constructor 或类体；私有用井号。陷阱：静态成员属于类，实例上拿不到。`),
    F('ja43', 'oop', 'Object.create 与对象拷贝',
      R`想指定原型造对象？想复制一份对象？`,
      R`**Object.create(proto)** 以指定原型创建空对象；**Object.assign** 与展开语法做**浅拷贝**；深拷贝可用结构化克隆或专用库。
~~~js
const proto = { hello() { return 'hi'; } };
const o = Object.create(proto);
console.log(o.hello());          // 'hi'
const copy = { ...o, x: 1 };
console.log(copy.x);             // 1
~~~
要点：浅拷贝只复制一层，嵌套对象仍共享。陷阱：Object.assign 会改写目标对象的第一个参数。`),
    F('ja44', 'oop', '属性检测与遍历',
      R`怎么判断属性存在？怎么安全遍历？`,
      R`**in** 含原型链、**hasOwnProperty** 只看自身、**Object.keys** 得自身可枚举键数组；for-in 含原型可枚举键。
~~~js
const o = { a: 1 };
console.log('a' in o);                    // true
console.log(o.hasOwnProperty('a'));       // true
console.log('toString' in o);             // true（原型来）
console.log(Object.keys(o));              // ['a']
~~~
要点：判"自己有没有"用 hasOwnProperty 或 Object.hasOwn。陷阱：for-in 可能遍历到原型链上的枚举属性。`),

    // ==================== DOM（第 14–15 章） ====================
    F('ja45', 'dom', 'DOM 树与节点',
      R`DOM 是什么？页面元素和 JS 对象什么关系？`,
      R`浏览器把 HTML 解析成**文档对象模型（DOM）**树——每个元素、文本都是节点，JS 通过节点 API 读改页面。
~~~js
// 假设页面有 <p id="t">hi</p>
const el = document.getElementById('t');
console.log(el.tagName);    // 'P'
console.log(el.parentNode); // 父节点
console.log(el.childNodes.length);
~~~
要点：DOM 是桥——脚本改节点，页面就变。陷阱：childNodes 混有文本空白节点，遍历子元素更常用 children。`),
    F('ja46', 'dom', '查询：querySelector 系列',
      R`怎么按选择器找元素？返回的是什么？`,
      R`**querySelector** 按 CSS 选择器返回首个匹配；**querySelectorAll** 返回**静态**列表（不会随 DOM 变化自动更新）。
~~~js
const one = document.querySelector('.title');
const many = document.querySelectorAll('.item');
console.log(many.length);
const byId = document.getElementById('app');
~~~
要点：选择器写法与 CSS 一致，日常优先 querySelector。陷阱：querySelectorAll 得到的是 NodeList，不是数组（要用 forEach 或转数组）。`),
    F('ja47', 'dom', '创建、插入与删除节点',
      R`怎么动态添加或移除一个元素？`,
      R`**createElement** 建元素、**append/prepend** 插子节点、**remove** 删掉自己、**replaceWith** 换节点。
~~~js
const li = document.createElement('li');
li.textContent = 'new item';
document.querySelector('ul').append(li);
// li.remove();   // 不再需要时移除
~~~
要点：先建好再插入，结构清晰。陷阱：不要用字符串拼 HTML 塞用户输入（见下一张）。`),
    F('ja48', 'dom', 'textContent 与 innerHTML',
      R`改元素里的文字和 HTML 各用什么？安全吗？`,
      R`**textContent** 只处理纯文本（安全、快）；**innerHTML** 会解析 HTML——插入未净化的用户输入就是 **XSS**。
~~~js
const p = document.querySelector('p');
p.textContent = 'a < b';     // 原样显示，不当标签
// p.innerHTML = userInput;  // 危险：用户可注入脚本
~~~
要点：默认 textContent；确需 HTML 先净化。陷阱：innerHTML 赋值会重建子节点，原有监听可能失效。`),
    F('ja49', 'dom', 'classList 与样式',
      R`怎么给元素加样式类？和直接改 style 什么关系？`,
      R`**classList** 的 add/remove/toggle/contains 管理类名（推荐）；**style** 写内联样式；类名进 CSS 保持结构与样式分离。
~~~js
const el = document.querySelector('.box');
el.classList.add('active');
el.classList.toggle('hidden');
el.classList.contains('active'); // true
el.style.color = 'red';          // 内联，能不用就不用
~~~
要点：切换外观优先类名 + CSS。陷阱：style 里的属性是驼峰（backgroundColor 不是 background-color）。`),
    F('ja50', 'dom', '文档碎片与批量更新',
      R`一次插入很多节点，怎么做才不卡？`,
      R`在**文档碎片（DocumentFragment）**里攒好节点再一次插入——只触发一次重排；或先摘离节点改完再挂回。
~~~js
const frag = document.createDocumentFragment();
for (let i = 0; i < 3; i++) {
  const li = document.createElement('li');
  li.textContent = 'i' + i;
  frag.append(li);
}
document.querySelector('ul').append(frag);
~~~
要点：循环里少碰文档主树。陷阱：碎片本身不显示，插入后子节点才可见。`),
    F('ja51', 'dom', 'dataset 与自定义数据',
      R`怎么在元素上存一点自定义数据，又不写进可见文本？`,
      R`HTML 属性 **data-*** 通过 **dataset** 读写（连字符名转驼峰）；适合存 id、状态等轻量元数据。
~~~js
// <button data-user-id="7" data-ok="1">x</button>
const btn = document.querySelector('button');
console.log(btn.dataset.userId); // '7'（字符串）
btn.dataset.ok = '0';
~~~
要点：dataset 值永远是字符串，要数字自己转。陷阱：属性名 data-user-id 对应 dataset.userId。`),

    // ==================== 事件（第 17 章） ====================
    F('ja52', 'evt', 'addEventListener 与移除',
      R`怎么给按钮绑点击？和 onclick 什么区别？`,
      R`**addEventListener(类型, 处理函数, 选项)** 可挂多个处理器；赋值式 onclick 会覆盖旧的；移除必须是**同一函数引用**。
~~~js
function onClick() { console.log('hi'); }
const btn = document.querySelector('button');
btn.addEventListener('click', onClick);
btn.removeEventListener('click', onClick);
~~~
要点：具名函数才方便移除；once 选项可只触发一次。陷阱：传了新的箭头函数再 remove 会失效（不是同一引用）。`),
    F('ja53', 'evt', '事件流三阶段',
      R`点一个嵌套按钮，监听器触发顺序是怎样的？`,
      R`**捕获**（自顶向下）→ **目标** → **冒泡**（自底向上）；默认在冒泡阶段处理，第三个参数可改捕获。
~~~js
outer.addEventListener('click', () => console.log('outer'), true);  // 捕获
inner.addEventListener('click', () => console.log('inner'));
// 点 inner：先 outer（捕获）再 inner（冒泡路径上的目标）
~~~
要点：委托依赖冒泡。陷阱：addEventListener 第三参 true 或 { capture: true } 才走捕获。`),
    F('ja54', 'evt', '事件对象',
      R`处理函数里怎么知道点的是谁、怎么拿键盘按键？`,
      R`处理函数收到**事件对象**：**target**（实际触发元素）、**currentTarget**（绑监听的元素）、**type**、键盘事件的 **key**。
~~~js
list.addEventListener('click', (e) => {
  console.log(e.target.tagName);
  console.log(e.currentTarget === list); // true
});
~~~
要点：委托时看 target，防误判用 closest 向上找。陷阱：target 可能是内部子节点，不是你绑监听的那个元素。`),
    F('ja55', 'evt', '事件委托',
      R`列表项很多、还会动态增删——监听怎么绑最省事？`,
      R`利用**冒泡**把监听挂在**父容器**上，用 target/closest 分发——子元素增删无需重绑，性能也更好。
~~~js
document.querySelector('ul').addEventListener('click', (e) => {
  const li = e.target.closest('li');
  if (!li) return;
  console.log(li.textContent);
});
~~~
要点：动态列表、导航分发都是委托主场。陷阱：closest 找不到返回 null，先判空。`),
    F('ja56', 'evt', 'preventDefault 与 stopPropagation',
      R`怎么阻止链接跳转？怎么不让事件传给父级？`,
      R`**preventDefault** 取消默认行为（如 a 跳转、表单提交）；**stopPropagation** 阻断传播——两者**互不影响**。
~~~js
document.querySelector('a').addEventListener('click', (e) => {
  e.preventDefault();          // 不跳转
  e.stopPropagation();         // 不冒泡到父级
});
~~~
要点：要做"自定义点击行为 + 保留默认"就别 preventDefault。陷阱：阻止传播后父级委托失效，确认这是你要的。`),
    F('ja57', 'evt', '常用事件类型',
      R`除了 click 还有哪些高频事件？`,
      R`鼠标：click、dblclick、mouseenter/leave；键盘：keydown/keyup；表单：input、change、submit；生命周期：DOMContentLoaded。
~~~js
document.addEventListener('DOMContentLoaded', () => {
  // HTML 解析完即可操作 DOM
});
document.querySelector('input').addEventListener('input', (e) => {
  console.log(e.target.value);
});
~~~
要点：初始化代码放 DOMContentLoaded 或脚本放 body 末尾。陷阱：submit 不 preventDefault 会真的提交并刷新页面。`),

    // ==================== 错误处理与调试（第 21 章） ====================
    F('ja58', 'err', 'try / catch / finally',
      R`出错的代码怎么包起来才不崩？finally 何时跑？`,
      R`**try** 放可能出错的代码，**catch** 捕获错误，**finally** 无论成败都执行（适合清理）。
~~~js
try {
  JSON.parse('{bad}');
} catch (e) {
  console.log('解析失败', e.message);
} finally {
  console.log('总会执行');
}
~~~
要点：只包真正可能失败的语句。陷阱：空 catch 吞错——至少打日志；catch 参数就是 Error 实例。`),
    F('ja59', 'err', 'throw 与内置 Error 类型',
      R`怎么主动抛错？有哪些内置错误？`,
      R`**throw** 抛出任意值（惯例抛 Error）；常见类型：**TypeError**、**ReferenceError**、**SyntaxError**、**RangeError**。
~~~js
function setAge(n) {
  if (n < 0) throw new RangeError('年龄不能为负');
  return n;
}
try { setAge(-1); } catch (e) { console.log(e.name, e.message); }
~~~
要点：Error 有 name、message、stack（定位用）。陷阱：throw 字符串会丢栈信息，别这么干。`),
    F('ja60', 'err', '自定义错误类',
      R`想区分业务错误和系统错误，怎么扩展错误类型？`,
      R`**class 子类 extends Error** 自定义错误，按类型分流处理——网络错、校验错、业务错各有语义。
~~~js
class ValidationError extends Error {
  constructor(msg) {
    super(msg);
    this.name = 'ValidationError';
  }
}
try { throw new ValidationError('格式不对'); }
catch (e) {
  if (e instanceof ValidationError) console.log('业务', e.message);
}
~~~
要点：大项目给错误分类，catch 里按 instanceof 分支。陷阱：继承 Error 后 name 要手动改，否则仍是 Error。`),
    F('ja61', 'err', 'console 调试家族',
      R`除了 console.log 还有哪些调试输出？`,
      R`**log** 万能输出；**warn/error** 语义分级；**table** 表格看数组对象；**dir** 展开对象；**time/timeEnd** 测耗时。
~~~js
console.log('普通', { a: 1 });
console.table([{ id: 1 }, { id: 2 }]);
console.time('t');
// ...一段代码
console.timeEnd('t');
~~~
要点：打印调试是学习期最诚实的老师。陷阱：log 打的是引用快照——对象后续修改可能已变（要看最终值请拷贝一份）。`),
    F('ja62', 'err', '断点与调试流程',
      R`log 太乱时怎么系统排查？`,
      R`浏览器开发者工具 **Sources** 面板设断点、单步、看作用域变量；配合调用栈定位"谁调了谁"。
~~~js
function buggy(n) {
  debugger;   // 打开 DevTools 时会在此暂停（生产环境记得删）
  return n * 2;
}
buggy(21);
~~~
要点：复现 → 断点 → 看变量与调用栈 → 改一处再验。陷阱：debugger 语句若留在生产代码会拖慢甚至中断调试体验。`),

    // ==================== 异步与网络（第 11、23–24 章） ====================
    F('ja63', 'net', '事件循环',
      R`JS 单线程怎么处理异步？为什么 Promise 比 setTimeout 先跑？`,
      R`同步代码跑完 → 清空**微任务**（Promise 回调）→ 取一个**宏任务**（定时器、I/O）→ 再清微任务……如此循环。
~~~js
console.log('1 同步');
setTimeout(() => console.log('3 宏任务'), 0);
Promise.resolve().then(() => console.log('2 微任务'));
// 顺序：1 → 2 → 3
~~~
要点：微任务优先于下一个宏任务。陷阱：微任务里再排微任务会连着清空，可能拖住渲染。`),
    F('ja64', 'net', '定时器 setTimeout 与 setInterval',
      R`怎么延迟执行？怎么按间隔重复？`,
      R`**setTimeout(fn, 毫秒)** 延迟一次；**setInterval** 间隔重复；都要 **clearTimeout/clearInterval** 清理。
~~~js
const t = setTimeout(() => console.log('later'), 0);
clearTimeout(t);
let n = 0;
const iv = setInterval(() => {
  n += 1;
  if (n >= 2) clearInterval(iv);
}, 100);
~~~
要点：0 毫秒也是宏任务，不会插队微任务。陷阱：组件销毁不清定时器 = 常见泄漏。`),
    F('ja65', 'net', 'Promise 三态',
      R`Promise 是什么？三种状态如何流转？`,
      R`状态机：**pending → fulfilled** 或 **pending → rejected**，**结算后不可再改**；resolve/reject 触发转折。
~~~js
const p = new Promise((resolve, reject) => {
  resolve('ok');   // 或 reject('bad')
});
p.then((v) => console.log(v));   // 'ok'
~~~
要点：then 看成功、catch 看失败。陷阱：executor 同步抛错会变成 reject；状态只结算一次。`),
    F('ja66', 'net', 'Promise 链与组合',
      R`怎么把多步异步串成流水线？怎么并行？`,
      R`**then 返回新 Promise**，可链式传递；组合：**all**（全成才成）、**race**（首个结束）、**allSettled**（全部落定）、**any**（首个成功）。
~~~js
Promise.resolve(1)
  .then((x) => x + 1)
  .then((x) => console.log(x)); // 2
Promise.all([p1, p2]).then((vs) => console.log(vs));
~~~
要点：链尾要 catch。陷阱：all 里一个 reject 整链就 reject；想看全部结果用 allSettled。`),
    F('ja67', 'net', 'async / await',
      R`async/await 是什么？和 Promise 什么关系？`,
      R`**async 函数**自动返回 Promise；**await** 等待 Promise 结算并取出值——把异步写成同步风格（底层仍是微任务）。
~~~js
async function load() {
  const v = await Promise.resolve(1);
  return v + 1;
}
load().then((x) => console.log(x)); // 2
~~~
要点：错误用 try/catch 包 await。陷阱：循环里连续 await 会串行；要并行先 Promise.all 再 await。`),
    F('ja68', 'net', 'fetch 基础',
      R`怎么发网络请求？为什么 404 不会进 catch？`,
      R`**fetch** 返回 Promise——只有**网络层失败**才 reject；HTTP 404/500 仍是 fulfilled，必须检查 **response.ok**。
~~~js
async function get(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error('HTTP ' + res.status);
  return res.json();
}
~~~
要点：先 ok 再读 body。陷阱：res.json() 本身也是异步，要 await；跨域受同源策略与 CORS 约束。`),
    F('ja69', 'net', 'JSON 请求与 POST',
      R`怎么提交 JSON 数据给服务器？`,
      R`fetch 第二参配 **method/headers/body**：body 用 JSON.stringify；响应再 JSON.parse。
~~~js
async function post(url, data) {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  return res.json();
}
~~~
要点：请求头的 Content-Type 要与 body 格式一致。陷阱：body 不能直接塞对象；失败分支记得看 ok/status。`),
    F('ja70', 'net', '异步错误处理策略',
      R`异步代码的错误怎么兜住？`,
      R`async 内用 try/catch；Promise 链尾 **catch**；全局可监听未处理拒绝事件做上报——统一收口、别吞错。
~~~js
async function main() {
  try {
    await fetch('/api');
  } catch (e) {
    console.log('网络或解析失败', e.message);
  }
}
main();
~~~
要点：把"可恢复"与"应上报"分开处理。陷阱：忘记 await 会让 catch 接不到异步错误；空 catch 等于盲飞。`),

    // ==================== 模块与存储（第 25–26 章） ====================
    F('ja71', 'mod', 'ES 模块：import 与 export',
      R`跨文件复用代码怎么导入导出？`,
      R`**export** 导出（具名或 default）；**import** 导入；模块有独立作用域，不污染全局。
~~~js
// math.js
// export const add = (a, b) => a + b;
// main.js
// import { add } from './math.js';
console.log('模块彼此隔离');
~~~
要点：具名导出可多个；默认导出每文件一个。陷阱：浏览器里模块脚本要 type=module；路径与扩展名写对。`),
    F('ja72', 'mod', '模块 vs 脚本',
      R`type=module 的脚本和普通 script 差在哪？`,
      R`模块脚本：**默认严格模式**、独立作用域、**延迟执行**、走静态导入分析；普通脚本共享全局、可立即执行。
~~~js
// <script type="module" src="app.js"></script>
// 模块内 this 不是 window，顶层变量不进全局
console.log('module scope');
~~~
要点：现代项目默认模块。陷阱：模块跨域要 CORS；没有 type=module 时 import 会直接语法错误。`),
    F('ja73', 'mod', '可选链与空值合并',
      R`深层属性可能不存在，怎么安全读取？怎么给默认值？`,
      R`**可选链（问号点）** 任一层为空则短路得 undefined；**空值合并（两个问号）** 只在 null/undefined 时取默认。
~~~js
const user = { profile: null };
console.log(user.profile?.city);     // undefined：不抛错
console.log(user.profile?.city ?? '未知'); // '未知'
console.log(0 ?? '默认');            // 0：零不是空
~~~
要点：深层可选数据的优雅读取组合。陷阱：可选链不能用在赋值左侧当"存在才赋"。`),
    F('ja74', 'mod', 'localStorage',
      R`怎么在浏览器里持久记住设置？`,
      R`**localStorage**：同源持久键值存——字符串 only，约 5MB；setItem/getItem/removeItem 或下标属性。
~~~js
localStorage.setItem('theme', 'dark');
console.log(localStorage.getItem('theme')); // 'dark'
localStorage.removeItem('theme');
// 对象要 JSON.stringify 存、JSON.parse 取
~~~
要点：存偏好、草稿、轻量状态。陷阱：值永远是字符串；别放敏感信息（XSS 可读）。`),
    F('ja75', 'mod', 'sessionStorage',
      R`和 localStorage 什么差别？什么时候用它？`,
      R`**sessionStorage** 同源但**标签页会话级**——关了就清；API 与 localStorage 同款。
~~~js
sessionStorage.setItem('step', '2');
console.log(sessionStorage.getItem('step'));
sessionStorage.clear();
~~~
要点：向导步骤、单次会话草稿。陷阱：新开标签页是一套新的，不与旧页共享。`),
    F('ja76', 'mod', 'cookie 对比与选择',
      R`cookie、localStorage、sessionStorage 怎么选？`,
      R`**cookie**：随请求自动带给服务器（小、可设过期）；**localStorage**：持久、纯前端；**sessionStorage**：页签会话。
~~~js
// 纯前端状态用 storage；需要服务端读到的才用 cookie
localStorage.setItem('tab', 'list');
~~~
要点：登录态现代方案多在 HttpOnly Cookie 或请求头令牌。陷阱：cookie 容量小且每次请求都可能带上，别乱存大对象。`),
    F('ja77', 'mod', 'npm 与工程化概览',
      R`前端项目为什么要装一堆工具？npm 是什么？`,
      R`**npm** 管理依赖（package.json + node_modules）；现代链还有**打包器**、**转译器**、开发服务器热更新。
~~~js
// package.json 里的 scripts 用 npm run <名> 执行
// npm install 包名 --save-dev  // 开发期依赖
console.log('工具链是地基，语言核心是上层');
~~~
要点：先打牢语言与 DOM，再进框架。陷阱：语义化版本的波浪号/插入符范围别看错；node_modules 勿手改。`),
  ];

  const META = {
    ja01: [5, '语法·声明'], ja02: [5, '概念·类型'], ja03: [4, '语法·typeof'], ja04: [4, '陷阱·精度'],
    ja05: [4, '语法·字符串'], ja06: [4, '语法·模板串'], ja07: [3, '概念·假值'], ja08: [5, '陷阱·相等'],
    ja09: [5, '陷阱·类型转换'], ja10: [4, '语法·条件'], ja11: [5, '语法·循环'], ja12: [3, '规则·严格模式'],
    ja13: [5, '概念·作用域'], ja14: [5, '陷阱·提升TDZ'], ja15: [4, '概念·null undefined'], ja16: [5, '陷阱·引用传参'],
    ja17: [3, '概念·垃圾回收'], ja18: [4, '概念·调用栈'],
    ja19: [4, '语法·对象'], ja20: [5, '语法·数组'], ja21: [5, '语法·数组增删'], ja22: [5, '语法·map filter'],
    ja23: [4, '语法·字符串方法'], ja24: [3, '语法·Date'], ja25: [3, '语法·RegExp'], ja26: [4, '语法·Map Set'],
    ja27: [4, '语法·JSON'], ja28: [3, '语法·Math'],
    ja29: [5, '语法·函数定义'], ja30: [4, '语法·参数'], ja31: [3, '语法·rest'], ja32: [5, '概念·箭头this'],
    ja33: [5, '概念·this绑定'], ja34: [4, '语法·call bind'], ja35: [5, '概念·闭包'], ja36: [4, '概念·高阶函数'],
    ja37: [4, '语法·创建对象'], ja38: [3, '语法·属性'], ja39: [5, '概念·原型链'], ja40: [5, '概念·prototype'],
    ja41: [5, '概念·继承'], ja42: [4, '语法·class'], ja43: [4, '语法·拷贝'], ja44: [3, '语法·属性检测'],
    ja45: [4, '概念·DOM树'], ja46: [5, '语法·查询'], ja47: [4, '语法·节点操作'], ja48: [5, '陷阱·innerHTML'],
    ja49: [4, '语法·classList'], ja50: [3, '语法·文档碎片'], ja51: [3, '语法·dataset'],
    ja52: [5, '语法·监听'], ja53: [5, '概念·事件流'], ja54: [4, '语法·事件对象'], ja55: [5, '概念·委托'],
    ja56: [4, '语法·默认行为'], ja57: [3, '语法·常用事件'],
    ja58: [5, '语法·try catch'], ja59: [4, '语法·throw'], ja60: [3, '语法·自定义错误'], ja61: [4, '语法·console'],
    ja62: [3, '规则·调试'],
    ja63: [5, '概念·事件循环'], ja64: [4, '语法·定时器'], ja65: [5, '概念·Promise'], ja66: [5, '语法·Promise链'],
    ja67: [5, '语法·async await'], ja68: [5, '语法·fetch'], ja69: [4, '语法·POST'], ja70: [4, '规则·异步错误'],
    ja71: [4, '语法·import'], ja72: [3, '概念·模块脚本'], ja73: [5, '语法·可选链'], ja74: [4, '语法·localStorage'],
    ja75: [3, '语法·sessionStorage'], ja76: [4, '概念·存储选型'], ja77: [2, '概念·工程化']
  };

  const PITFALL = {
    ja08: R`三等号与双等号混用是隐形炸弹——默认永远三等号；NaN 与任何值都不等，判 NaN 用 Number.isNaN。`,
    ja09: R`加号遇字符串变拼接：1 + "1" 得 "11"——拼数字先 Number() 或用模板字符串。`,
    ja14: R`var 提升 + 块作用域混用会读到意外的 undefined——let/const 必须先声明后使用。`,
    ja16: R`对象赋值只是共享引用——要隔离必须浅拷贝或深拷贝，直接赋值改一个动俩。`,
    ja21: R`splice 会改原数组、slice 不会；slice 含头不含尾，splice 第二参数是个数。`,
    ja33: R`this 由调用方式决定：方法取出再调用会丢 this——需要时 bind，或改用箭头保存外层。`,
    ja35: R`循环 + var + 闭包会共享同一变量终值——用 let 让每次迭代生成新绑定。`,
    ja48: R`innerHTML 插入用户内容就是 XSS——纯文本用 textContent，必须 HTML 时先净化。`,
    ja56: R`preventDefault 与 stopPropagation 是两件事，可分别使用；阻止冒泡会让父级委托失效。`,
    ja68: R`fetch 遇到 404/500 仍会 fulfilled——必须检查 response.ok，否则把错误页当数据解析。`,
    ja73: R`空值合并只认 null/undefined：0 与空串会被逻辑或误伤，要精确默认请用两个问号。`
  };

  // —— 帮助栏目文章（检索用，不参与学习调度；描述性/答疑内容） ——
  const HELP = [
    { id: 'jh01', title: 'JS 适合做什么', body: R`**网页的专用语言**——浏览器唯一直接执行的语言，动态弱类型脚本语言。
场景三件套：网页交互（前端）、服务器（Node.js）、小程序/桌面应用——学会一门，三端可通用。
特点：单线程 + 事件循环异步、动态类型——灵活但容易踩坑，本卡组按教材主线逐个排雷。` },
    { id: 'jh02', title: '零成本环境：浏览器控制台', body: R`浏览器按 **F12**（或右键检查）打开开发者工具，切到 **Console（控制台）**——现成的 JS 交互环境。
敲一行 console.log('你好')，回车立即执行——**不需要安装任何东西**。
控制台就是 REPL：试语法、看变量、查报错——学习全程开着它。` },
    { id: 'jh03', title: '把 JS 接入网页', body: R`两种方式：① 页面里直接写 script 标签；② 外部文件引用（script 的 src 属性指向 app.js）——**外部文件是正道**。
script 放 body 末尾或加 defer——页面元素就绪后再执行，避免找不到元素。
验证：JS 里 console.log 一句，控制台看得到即通。` },
    { id: 'jh04', title: 'Node.js：脱离浏览器的 JS', body: R`**Node.js = 装在电脑上的 JS 运行环境**——同一门语言，不用浏览器也能跑，还能读写文件、开服务器。
安装后：终端敲 node hello.js 直接运行；敲 node 进入交互模式。
附带 **npm**（包管理器）——JS 生态的万库之门。前端后端共用一套语言，正是 Node 的意义。` },
    { id: 'jh05', title: '怎么读控制台报错', body: R`控制台红色信息三段式：**错误类型 + 说明 + 出错位置**（点位置链接直达代码行）。
最常见三兄弟：TypeError: x is not a function（把非函数当函数调了）、is not defined（名字拼错或未声明）、Cannot read properties of undefined（访问了不存在的东西的属性）。
习惯：报错先读第一行，点行号跳过去——九成问题当场定位。` },
    { id: 'jh06', title: 'let 与 const：从第一天就别用 var', body: R`现代 JS 只用两个：**const**（不会重新赋值的量——默认选它）与 **let**（会变的量）。**var 是历史遗留，别再用**。
直觉法：先写 const，运行报错说要变，再改成 let——社区公认最佳实践。
命名：驼峰式（userName），常量全大写下划线（MAX_SIZE）。` },
    { id: 'jh07', title: '工具链总览：编辑器与生态', body: R`**编辑器**：VS Code（对 JS 支持开箱即用，Live Server 插件可一键起本地服务器、保存即刷新）。
**包管理**：npm；**打包器**（Vite 等）——把多文件项目压成浏览器友好的产物，框架时代再学。
**兼容**：新语法老浏览器可能不认——现代开发用转译解决，初学期用最新 Chrome 即可。` },
    { id: 'jh08', title: 'JS 学习路径建议', body: R`① 语言基础 + 变量作用域打底（控制台随手试每个知识点）；② **DOM 与事件**——动力来源：让网页真正动起来；③ 函数与异步是两道坎：函数写熟后再攻异步（定时器→Promise→await）；④ 原型与 class 理解"对象从哪来"，框架的根基。
节奏参考：每天 10 张卡 + 每周一个小交互（todo 列表、图片切换）。
铁律：JS 是「开着控制台学」的语言——每个卡片的示例都亲手敲一遍。` }
  ];

  const BEGINNER = ['lang', 'mem'];
  return { BEGINNER: BEGINNER, id: 'js', group: 'skill', name: 'JavaScript 知识', short: 'JavaScript', icon: '🌐', kind: 'qa', CATS: CATS, DATA: DATA, META: META, HELP: HELP, REL: {}, PITFALL: PITFALL, MNEM: {}, ORDER: ['lang', 'mem', 'ref', 'fn', 'oop', 'dom', 'evt', 'err', 'net', 'mod'] };
})();
