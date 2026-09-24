/*
 * Java · 知识点记忆数据库
 * 教材锚点：Head First Java（HFJ）章序——基本概念 / 语法与类型 / 面向对象 /
 *           集合与泛型 / 异常与常用库 / 线程与实用进阶（面向初学者教材化）
 * 结构：id / cat / title / front / back + META / PITFALL / HELP / BEGINNER
 * 背面三段式：概念定义 → ~~~java 最小可运行示例（含教学注释）→ 要点/陷阱
 * 说明：无例题学科；kind: 'qa' 驱动 UI 适配。
 * 进度策略=整科重置：新 id hf01 起连续编号，学习进度从零开始（对齐 Python v1.41 先例）。
 */
window.SUBJECTS = window.SUBJECTS || {};
window.SUBJECTS.java = (function () {
  'use strict';
  const R = String.raw;

  const CATS = {
    intro: '基本概念',
    types: '语法与类型',
    oop: '面向对象',
    coll: '集合与泛型',
    lib: '异常与常用库',
    thr: '线程与实用进阶'
  };

  const F = (id, cat, title, front, back) => ({ id, cat, title, front, back });

  const DATA = [
    // ==================== 基本概念（HFJ 破冰与对象之旅） ====================
    F('hf01', 'intro', 'Java 与 JVM：一次编写到处运行',
      R`Java 的跨平台是怎么做到的？JDK、JRE、JVM 是什么关系？`,
      R`**字节码 + JVM**：源码先编译成与平台无关的**字节码**，各平台的 **JVM** 再把它翻译成本机指令执行。
~~~java
// 源码 Hello.java → javac 编译 → Hello.class（字节码）
// → java 启动 JVM 执行；换操作系统不用改源码
public class Hello {
    public static void main(String[] args) {
        System.out.println("你好，JVM");
    }
}
~~~
要点：包含关系 **JDK ⊃ JRE ⊃ JVM**——开发装 JDK，只跑程序才用 JRE。陷阱：只装 JRE 不能编译；「到处运行」靠的是各平台装好对应 JVM，不是字节码自己会跑。`),
    F('hf02', 'intro', '第一个程序：类与 main',
      R`最小的可运行 Java 程序长什么样？`,
      R`**类 + main 方法**是入口：public 类名必须与文件名一致，main 签名固定为 public static void main。
~~~java
public class Hello {                           // 类名与文件 Hello.java 一致
    public static void main(String[] args) {   // 程序入口，JVM 从这里开跑
        System.out.println("hello, world");    // 向屏幕输出一行文字
    }
}
~~~
要点：一切代码都写在类里；花括号成对、语句以分号结尾。陷阱：类名大小写必须与文件名一字不差——Hello 与 hello 是两个不同的名字。`),
    F('hf03', 'intro', '编译与运行两步走',
      R`从写出源码到看到结果，中间有哪几步？`,
      R`两步：**javac** 把 .java 编译成 .class 字节码，**java** 启动 JVM 执行字节码。
~~~java
// 终端里（示例）：
//   javac Hello.java     → 生成 Hello.class
//   java Hello           → 运行（不要带 .class 后缀）
public class Hello {
    public static void main(String[] args) {
        System.out.println("跑起来了");
    }
}
~~~
要点：改了源码必须重新 javac；java 后面写的是**类名**而不是文件名。陷阱：带成 java Hello.class 会找不到类——后缀要省掉。`),
    F('hf04', 'intro', 'main 方法签名',
      R`main 为什么写成 public static void main(String[] args)？`,
      R`四个关键字各有职责：**public** 让 JVM 能从外部调用；**static** 无需实例即可进入；**void** 不返回值；**String[] args** 接收命令行参数。
~~~java
public class App {
    public static void main(String[] args) {
        // args 是命令行参数数组；没有参数时长度为 0
        System.out.println("参数个数：" + args.length);
    }
}
~~~
要点：签名写错 JVM 就找不到入口（比如漏 static 或参数类型不对）。陷阱：String 两侧的方括号可写在类型后或变量名后，但推荐统一写 String[] args。`),
    F('hf05', 'intro', '变量与赋值',
      R`怎么声明变量并给它一个值？`,
      R`**变量**先声明类型再命名，用等号赋值；声明后类型固定，只能装兼容的值。
~~~java
int age = 18;          // 声明整型并赋值
age = 19;              // 重新赋值
double score = 92.5;   // 浮点
String name = "Ada";   // 引用类型：变量存的是「引用」
System.out.println(name + " " + age);
~~~
要点：基本类型存值本身，引用类型变量存的是指向对象的引用。陷阱：未初始化的局部变量不能直接用——编译器会报「可能尚未初始化」。`),
    F('hf06', 'intro', '输出与字符串拼接',
      R`怎么打印信息？怎么把变量嵌进一段话？`,
      R`**System.out.println** 输出并换行，**print** 不换行；加号可把字符串与变量拼在一起。
~~~java
int n = 3;
System.out.println("共 " + n + " 个");   // 拼串：共 3 个
System.out.print("下一行接着写 ");
System.out.println("好了");
~~~
要点：加号遇字符串就把另一边转成字符串再拼。陷阱：想先算数学再拼就加括号——"和是" + 1 + 2 会得到「和是12」而不是 3。`),
    F('hf07', 'intro', '对象与引用',
      R`对象和变量是什么关系？「引用」指什么？`,
      R`**对象**住在堆上，**引用变量**存的是它的「地址线索」——多个变量可以指向同一个对象。
~~~java
String a = "hi";     // a 引用一个字符串对象
String b = a;        // b 与 a 指向同一个对象
b = "bye";           // 只是让 b 指向新对象，a 仍指 "hi"
System.out.println(a); // hi
~~~
要点：改的是引用的指向，还是改对象的内容，要分清。陷阱：把引用赋给另一个变量并不会复制对象——两个名字一个对象。`),
    F('hf08', 'intro', '类：状态与行为',
      R`类是什么？它和对象的关系？`,
      R`**类**是对象的蓝图：声明**状态**（实例变量/字段）与**行为**（方法）；**对象**是类跑起来的一个实例。
~~~java
class Dog {
    String name;                 // 状态：每只狗有自己的名字
    void bark() {                // 行为：怎么叫
        System.out.println(name + "：汪");
    }
}
Dog d = new Dog();               // 造一只狗
d.name = "阿黄";                 // 填状态
d.bark();                        // 调行为 → 阿黄：汪
~~~
要点：先有类再有对象；字段描述「是什么」，方法描述「能做什么」。陷阱：忘记 new 就用变量，会空指针。`),
    F('hf09', 'intro', '实例变量与局部变量',
      R`写在类里的变量和写在方法里的变量差在哪？`,
      R`**实例变量**（字段）属于对象，有默认零值，对象活着就能用；**局部变量**属于方法，必须先初始化，出了方法就消失。
~~~java
class Counter {
    int count = 0;                 // 实例变量：默认 0，随对象走
    void add() {
        int step = 1;              // 局部变量：必须初始化
        count = count + step;
    }
}
~~~
要点：字段可被本类各方法共享；局部变量尽量小作用域。陷阱：局部变量没有默认值——不赋值就用是编译错误，不是零。`),
    F('hf10', 'intro', '注释写法',
      R`Java 的注释有哪几种？怎么写才有用？`,
      R`**三种注释**：单行注释、多行注释、文档注释（可生成 API 文档）。
~~~java
// 单行：解释「为什么」
/* 多行
   块注释 */
/**
 * 文档注释：讲这个方法做什么
 */
public class Demo {
    public static void main(String[] args) {
        int t = 0;   // 临时变量，稍后删除
    }
}
~~~
要点：注释写意图与约束，不复述代码。陷阱：多行注释不能嵌套——里头再开一对会提前结束。`),
    F('hf11', 'intro', '命名惯例',
      R`Java 的类名、变量名、常量怎么起名？`,
      R`**类**用大驼峰（PascalCase）；**方法与变量**用小驼峰（camelCase）；**常量**全大写下划线；**包名**全小写。
~~~java
class UserService {              // 类：大驼峰
    int retryCount = 0;          // 变量：小驼峰
    static final int MAX_SIZE = 10;  // 常量：全大写
    void getUserById() { }       // 方法：小驼峰
}
~~~
要点：名字讲清职责，比注释更常被读到。陷阱：大小写敏感——userName 与 username 是两个名字；关键字不能当标识符。`),
    F('hf12', 'intro', '包与 import',
      R`package 和 import 是干什么的？`,
      R`**package** 声明类所在的命名空间（惯例域名倒写）；**import** 引入其他包的类，避免到处写全限定名。
~~~java
package com.example.demo;        // 声明所在包（一般一行在最前）

import java.util.ArrayList;      // 引入要用的类
import java.util.List;

public class Demo {
    List<String> names = new ArrayList<>();
}
~~~
要点：java.lang（String/System 等）自动导入，不用手写 import。陷阱：一个源文件只能有一个 public 类，且必须与文件名相同。`),

    // ==================== 语法与类型（HFJ 原语、方法与封装起步） ====================
    F('hf13', 'types', '八种基本类型',
      R`Java 的基本类型有哪些？各占多大？`,
      R`八种：**byte/short/int/long**（整数族）、**float/double**（浮点族）、**char**（字符）、**boolean**（真假）。
~~~java
byte  b = 127;         // 1 字节
short s = 32000;       // 2 字节
int   n = 42;          // 4 字节，最常用整型
long  big = 100_000L;  // 8 字节，字面量常带 L
float  f = 1.5f;       // 4 字节，字面量带 f
double x = 3.14;       // 8 字节，浮点默认类型
char  c = 'A';         // 2 字节，单引号
boolean ok = true;     // 只有 true / false
~~~
要点：默认整数用 int、小数用 double。陷阱：long 溢出、float 精度有限；0.1 加 0.2 这类二进制浮点误差要心中有数。`),
    F('hf14', 'types', '字面量写法',
      R`数字和字符的直接量有哪些写法？`,
      R`**字面量**是写进源码的常量值：十进制、下划线分组、十六进制、长整型后缀、浮点后缀。
~~~java
int a = 1_000_000;     // 下划线分组，好读，值仍是 1000000
int h = 0xFF;          // 十六进制 255
long t = 10L;          // long 建议带 L
double d = 1.5;        // 默认 double
float g = 2.5f;        // float 必须带 f，否则编译不过
char c = '中';         // 一个字符（含汉字）
~~~
要点：下划线只是可读性辅助。陷阱：给 float 赋不带 f 的小数字面量会编译错误——那是 double。`),
    F('hf15', 'types', '算术运算',
      R`加减乘除和求余怎么写？整数除法有什么特点？`,
      R`运算符与常见语言一致：加减乘除、取余；**整数除法丢掉小数部分**。
~~~java
int a = 7, b = 2;
System.out.println(a / b);     // 3，不是 3.5
System.out.println(a % b);     // 1
System.out.println(7.0 / 2);   // 3.5，有浮点就真除
System.out.println(-7 % 3);    // -1，符号跟被除数
~~~
要点：想保留小数，让操作数里有 double。陷阱：两个 int 相除永远是 int——先转成 double 再除。`),
    F('hf16', 'types', '自增自减与赋值',
      R`加加减减和加等于怎么用？前缀后缀差在哪？`,
      R`**加加/减减**把变量加一减一；**前缀**先变再用值，**后缀**先用值再变；还有加等于、减等于等简写。
~~~java
int i = 5;
int a = i++;   // a 得 5，i 变 6（后缀：先用后变）
int b = ++i;   // i 先变 7，b 得 7（前缀：先变后用）
i += 3;        // 等价 i = i + 3，i 变 10
~~~
要点：单独成句时前后缀效果一样。陷阱：写进复杂表达式时别图省事——先拆开算清，避免顺序搞反。`),
    F('hf17', 'types', '关系与逻辑运算',
      R`比较和并且、或者、非怎么写？`,
      R`**关系运算**得 boolean：等于双等号、不等感叹加等号、大小于可带等号；**逻辑与或非**连接多个条件，且有短路。
~~~java
int a = 5, b = 8;
boolean ok = (a < b) && (b > 0);   // 与：两边都真才真
boolean no = (a > b) || (a > 0);   // 或：一边真就真
boolean no2 = !(a == b);           // 非：取反
boolean shortCircuit = (b != 0) && (a / b > 0);  // 左边假则右边不执行
~~~
要点：相等比较基本类型用双等号；引用类型比较「是不是同一个对象」。陷阱：单等号是赋值不是比较；短路时右边可能根本不跑。`),
    F('hf18', 'types', 'if-else 分支',
      R`多档条件怎么写？`,
      R`**if / else if / else** 自上而下判断，命中即停；条件必须是 boolean。
~~~java
int score = 85;
if (score >= 90) {
    System.out.println("优");
} else if (score >= 60) {
    System.out.println("过");      // 85 走这里
} else {
    System.out.println("再练");
}
~~~
要点：互斥档位用 if 链；只是独立检查就写多个 if。陷阱：if (n = 1) 编译不过（赋值表达式类型不是 boolean）——手滑少写一个等号。`),
    F('hf19', 'types', 'switch 分支',
      R`多档固定值怎么更清晰地写？`,
      R`**switch** 按表达式的值跳到对应 case，每段后建议 break（或 return），否则会**贯穿**到下一段。
~~~java
int day = 3;
switch (day) {
    case 1:
        System.out.println("一");
        break;
    case 2:
        System.out.println("二");
        break;
    default:                 // 都没命中
        System.out.println("其他");
        break;
}
~~~
要点：支持 int、char、枚举与 String（较新版本）。陷阱：漏 break 会继续执行后面的 case；default 可省但最好留着兜底。`),
    F('hf20', 'types', 'while 与 do-while',
      R`先判断再循环和先跑再判断怎么选？`,
      R`**while** 先测条件，可能一次都不进；**do-while** 至少跑一次再测。
~~~java
int n = 3;
while (n > 0) {              // 条件先测
    System.out.println(n);
    n--;                     // 别忘步进，否则死循环
}

int k = 0;
do {
    System.out.println("至少一次");
    k++;
} while (k < 0);             // 条件后测：false 也已跑过一次
~~~
要点：循环体要能改变条件，否则出不去。陷阱：do-while 的 while 后有分号；while 写错成赋值式条件会死循环。`),
    F('hf21', 'types', 'for 与增强 for',
      R`计数循环和「对每个元素」怎么写？`,
      R`**for** 把初始化、条件、步进写在一行；**增强 for**（for-each）直接取出元素，只读遍历首选。
~~~java
for (int i = 0; i < 3; i++) {     // 0,1,2
    System.out.println(i);
}
int[] nums = {1, 2, 3};
for (int x : nums) {              // 每个元素
    System.out.println(x);
}
~~~
要点：增强 for 不用下标、更短、不易越界。陷阱：增强 for 里改的是「取出的副本」，改不了数组/集合里的元素；要下标就用经典 for。`),
    F('hf22', 'types', 'break 与 continue',
      R`怎么提前结束循环或跳过本轮？`,
      R`**break** 跳出本层循环；**continue** 跳过本轮剩余、进入下一轮；可配合标号跳出多层。
~~~java
for (int i = 0; i < 5; i++) {
    if (i == 2) continue;     // 跳过 2
    if (i == 4) break;        // 到 4 就收工
    System.out.println(i);    // 打印 0 1 3
}
~~~
要点：break 也用于 switch 的防贯穿。陷阱：嵌套循环里 break 只出最内层——要出多层需标号或改写结构。`),
    F('hf23', 'types', '数组',
      R`一组同类型数据怎么存放和遍历？`,
      R`**数组**长度固定、下标从零开始；声明可用「类型[] 名」写法，创建时给长度或直接给初值。
~~~java
int[] a = new int[3];     // 三个 0（默认零值）
a[0] = 10;                // 下标赋值
int[] b = {1, 2, 3};      // 声明即初值
for (int i = 0; i < b.length; i++) {
    System.out.println(b[i]);   // 长度是 length 字段，不是方法
}
~~~
要点：要可变长请用集合。陷阱：合法下标 0 到 length 减一；越界抛 ArrayIndexOutOfBoundsException。`),
    F('hf24', 'types', '默认值与类型转换',
      R`字段不赋值是多少？大转小为什么危险？`,
      R`实例变量有**默认零值**（数值 0、boolean false、引用 null）；基本类型可自动**小转大**，**大转小**要显式强转（可能丢精度）。
~~~java
class Box {
    int n;          // 默认 0
    double x;       // 默认 0.0
    Object o;       // 默认 null
}
int big = 300;
byte small = (byte) big;   // 强转：300 超出 byte 范围会绕回
double d = 3.9;
int cut = (int) d;         // 直接砍掉小数 → 3
~~~
要点：int 运算遇到 long 要赋给 long；算式里混入 double 结果就是 double。陷阱：强转是「按位重解释」，溢出不会抛异常，只是结果莫名其妙。`),
    F('hf25', 'types', '包装类与自动装箱',
      R`基本类型怎么变成对象？有什么坑？`,
      R`每种基本类型都有**包装类**（int 对应 Integer 等）；**自动装箱/拆箱**让基本类型与包装类可自动转换。
~~~java
Integer a = 5;          // 装箱：int → Integer
int b = a;              // 拆箱：Integer → int
Integer x = 127, y = 127;
Integer u = 200, v = 200;
System.out.println(x == y);   // true：小整数有缓存
System.out.println(u == v);   // false：缓存外是不同对象
~~~
要点：集合与泛型只能装对象，所以离不开包装类。陷阱：包装类比较值请用 equals；拆箱遇 null 会空指针。`),
    F('hf26', 'types', 'String 常用方法',
      R`字符串怎么查长度、截取、查找、变换？`,
      R`**String 不可变**——所有「修改」都返回新串；常用 length、charAt、substring、indexOf、trim、toUpperCase、split、equals。
~~~java
String s = "  Hello, Java  ";
System.out.println(s.trim());              // 去首尾空白
System.out.println(s.trim().toUpperCase()); // HELLO, JAVA
System.out.println(s.indexOf("Java"));      // 子串位置
System.out.println(s.substring(2, 7));      // 含头不含尾
System.out.println(s.trim().equals("Hello, Java")); // 比内容
~~~
要点：要保存结果必须接住返回值。陷阱：内容比较用 equals——双等号比的是不是同一个对象。`),
    F('hf27', 'types', 'StringBuilder',
      R`循环拼接字符串为什么慢？该用什么？`,
      R`循环里用加号拼串会反复创建新字符串；**StringBuilder** 内部可变，append 高效，适合大量拼接。
~~~java
StringBuilder sb = new StringBuilder();
for (int i = 0; i < 3; i++) {
    sb.append(i);          // 在同一缓冲上追加
    sb.append(",");
}
String result = sb.toString();   // 最后转成 String
System.out.println(result);      // 0,1,2,
~~~
要点：单线程用 StringBuilder；要线程安全才用 StringBuffer（更慢）。陷阱：别把链式 append 的返回值丢了——append 返回自身，但最终仍要 toString。`),
    F('hf28', 'types', '方法定义与调用',
      R`怎么把一段逻辑封装成可重复使用的方法？`,
      R`**方法**由访问修饰、返回类型、名字、参数列表与方法体组成；调用时传实参，用 return 交回结果。
~~~java
public class Calc {
    static int add(int a, int b) {   // 返回 int，接收两个 int
        return a + b;
    }
    public static void main(String[] args) {
        int sum = add(3, 4);         // 调用：实参 3、4
        System.out.println(sum);     // 7
    }
}
~~~
要点：返回类型 void 表示不返回；调用时实参类型要匹配。陷阱：声明了非 void 却忘了 return，编译不过。`),
    F('hf29', 'types', '参数与按值传递',
      R`方法里改参数，外面会跟着变吗？`,
      R`Java **只有值传递**：传基本类型拷贝值；传对象拷贝引用值——可改对象内容，但改不了调用方的引用指向。
~~~java
static void trySwap(String s) {
    s = "new";              // 只改了副本引用，调用方无感
}
static void fill(int[] arr) {
    if (arr.length > 0) arr[0] = 99;   // 改内容，调用方可见
}
public static void main(String[] args) {
    String t = "old";
    trySwap(t);
    System.out.println(t);  // old
    int[] xs = {1};
    fill(xs);
    System.out.println(xs[0]); // 99
}
~~~
要点：「改对象」和「重新赋值参数」是两回事。陷阱：以为传对象就是传引用语义的「引用传递」——swap 两个对象引用会失败。`),
    F('hf30', 'types', '方法重载',
      R`同名方法怎么共存？调用怎么选？`,
      R`**重载**是同类中同名不同参数列表的方法；编译器按实参类型与个数挑选最匹配的版本。
~~~java
class Printer {
    void show(int n) {
        System.out.println("int " + n);
    }
    void show(String s) {
        System.out.println("str " + s);
    }
    void show(int n, int m) {
        System.out.println("two " + n + "," + m);
    }
}
// new Printer().show(1)   → int 版
// new Printer().show("a") → str 版
~~~
要点：只改返回类型不算重载。陷阱：重载太多会让调用处难读；浮点与整型混用时小心自动提升导致选中意外版本。`),

    // ==================== 面向对象（HFJ 继承、多态、接口与对象生灭） ====================
    F('hf31', 'oop', '封装与 getter/setter',
      R`为什么要私有字段再开方法访问？`,
      R`**封装**把字段藏成 private，用公共方法控制读写——可校验、可改内部实现而不破调用方。
~~~java
class BankAccount {
    private double balance = 0;           // 状态藏起来
    public double getBalance() {          // 只读
        return balance;
    }
    public void deposit(double amt) {     // 写要走门
        if (amt > 0) balance += amt;
    }
}
~~~
要点：JavaBean 惯例是私有字段 + 公共 getter/setter + 无参构造器。陷阱：给所有字段无脑生成 setter 等于没封装——先想清楚哪些面要对外。`),
    F('hf32', 'oop', '构造器',
      R`对象怎么被创建出来？构造器怎么写？`,
      R`**构造器**与类同名、无返回类型，用 new 调用；不写则编译器提供无参默认构造器。
~~~java
class Dog {
    String name;
    Dog(String n) {          // 有参构造器：保证出生就有名字
        name = n;
    }
    void bark() {
        System.out.println(name + " 汪");
    }
}
Dog d = new Dog("阿黄");     // new 调构造器
d.bark();
~~~
要点：构造器用于初始化。陷阱：一旦写了有参构造，**默认无参构造消失**——还要无参就自己显式写一个。`),
    F('hf33', 'oop', '构造器重载与 this',
      R`多个构造器怎么互相调用？this 指什么？`,
      R`**构造器重载**提供多种出生方式；**this(参数)** 在构造器第一行调用本类其他构造器；**this** 指当前实例。
~~~java
class Point {
    int x, y;
    Point() {
        this(0, 0);              // 先转给全参构造器
    }
    Point(int x, int y) {
        this.x = x;              // this.x 是字段，x 是参数
        this.y = y;
    }
}
~~~
要点：this(…) 与 super(…) 都必须在构造器第一行。陷阱：两个构造器互相 this 会编译期就死循环。`),
    F('hf34', 'oop', '继承 extends',
      R`子类怎么获得父类的能力？Java 的继承规则？`,
      R`**单继承**：子类 extends 一个父类，自动拥有父类非 private 成员；所有类最终继承 Object。
~~~java
class Animal {
    void eat() {
        System.out.println("吃");
    }
}
class Dog extends Animal {     // Dog 是一种 Animal
    void bark() {
        System.out.println("汪");
    }
}
Dog d = new Dog();
d.eat();   // 继承来的
d.bark();  // 自己的
~~~
要点：用「is-a」检验继承是否合理。陷阱：Java 不支持多类继承——多能力用接口；父类 private 成员子类看不见。`),
    F('hf35', 'oop', '方法重写',
      R`子类如何定制父类行为？规则是什么？`,
      R`**重写**是子类提供与父类**同签名**的方法；访问权限不能更窄，受检异常不能更宽；可加 Override 注解防拼写错误。
~~~java
class Animal {
    void speak() {
        System.out.println("…");
    }
}
class Cat extends Animal {
    @Override                    // 帮编译器查：真在重写吗？
    void speak() {
        System.out.println("喵");
    }
}
new Cat().speak();  // 喵：调的是子类版本
~~~
要点：重写是「同一行为、不同实现」。陷阱：静态方法是隐藏不是重写；参数不同那是重载不是重写。`),
    F('hf36', 'oop', 'super 与父类构造',
      R`怎么调用父类的成员和构造器？`,
      R`**super** 指父类：super.方法() 调父类实现；super(参数) 在子类构造器第一行调父类构造器。
~~~java
class Animal {
    Animal(String n) {
        System.out.println("动物 " + n);
    }
    void eat() { System.out.println("吃"); }
}
class Dog extends Animal {
    Dog() {
        super("狗");            // 必须第一行
    }
    @Override
    void eat() {
        super.eat();            // 先做父类的事
        System.out.println("啃骨头");
    }
}
~~~
要点：父类若无无参构造，子类必须显式 super 带参。陷阱：super(…) 不能写到第一行之外；与 this(…) 不能同时抢第一行。`),
    F('hf37', 'oop', '多态与动态绑定',
      R`父类变量装子类对象，会调到谁的方法？`,
      R`父类引用指向子类对象时，**被重写的实例方法**按**运行时真实类型**执行——这就是**动态绑定**。
~~~java
class Animal {
    void speak() { System.out.println("…"); }
}
class Dog extends Animal {
    @Override
    void speak() { System.out.println("汪"); }
}
class Cat extends Animal {
    @Override
    void speak() { System.out.println("喵"); }
}
Animal[] zoo = { new Dog(), new Cat() };
for (Animal a : zoo) {
    a.speak();   // 汪 / 喵：看对象，不看声明类型
}
~~~
要点：这是「同一接口、多种表现」。陷阱：字段访问与静态方法**没有多态**——按引用的编译期类型解析。`),
    F('hf38', 'oop', '抽象类',
      R`只有约定、写不完的方法怎么办？`,
      R`**抽象类**可含抽象方法（只声明不实现）与具体成员；不能直接 new，靠子类继承实现。
~~~java
abstract class Shape {
    abstract double area();            // 子类必须实现
    String kind() { return "图形"; }   // 也可以有具体方法
}
class Circle extends Shape {
    double r = 1;
    @Override
    double area() { return 3.14 * r * r; }
}
// Shape s = new Shape();  // 编译错误：抽象类不能实例化
~~~
要点：抽象类适合「共享骨架 + 强制子类填空」。陷阱：子类若不实现全部抽象方法，自己也必须声明为抽象类。`),
    F('hf39', 'oop', '接口',
      R`怎么定义「能做什么」并实现多重能力？`,
      R`**接口**是能力契约（方法签名）；类用 implements 实现接口，**可实现多个**；较新版本也可有默认实现与静态方法。
~~~java
interface Drawable {
    void draw();                       // 抽象能力
}
interface Resizable {
    void resize(double k);
}
class Box implements Drawable, Resizable {
    public void draw() { System.out.println("画框"); }
    public void resize(double k) { /* 缩放 */ }
}
~~~
要点：接口强调「能干什么」，类自己决定「怎么干」。陷阱：实现接口时方法必须是 public——权限不能比接口更窄。`),
    F('hf40', 'oop', '抽象类与接口怎么选',
      R`都要「写不完的方法」时，该用抽象类还是接口？`,
      R`要**共享状态/骨架代码**、强 is-a 关系 → **抽象类**；要**能力契约**、需要多重继承效果 → **接口**。
~~~java
abstract class BaseRepo {          // 共享骨架
    abstract String load(String id);
    void log(String msg) { System.out.println(msg); }  // 公共实现
}
interface Cacheable {              // 能力
    void put(String k, Object v);
    Object get(String k);
}
class UserRepo extends BaseRepo implements Cacheable {
    public String load(String id) { return "user"; }
    public void put(String k, Object v) { }
    public Object get(String k) { return null; }
}
~~~
要点：现代 Java 更偏接口 + 默认方法做扩展。陷阱：为了一点点代码复用就上继承，层次会很快腐化。`),
    F('hf41', 'oop', 'Object：toString 与 getClass',
      R`所有对象都自带哪些方法？打印为什么那么怪？`,
      R`**Object** 是根类：toString 给出字符串表示（默认类名加哈希，几乎总是要重写）；getClass 给出运行时类型。
~~~java
class Point {
    int x = 1, y = 2;
    @Override
    public String toString() {
        return "Point(" + x + "," + y + ")";   // 有意义的描述
    }
}
Point p = new Point();
System.out.println(p);                 // 自动用 toString → Point(1,2)
System.out.println(p.getClass().getSimpleName()); // Point
~~~
要点：日志、调试、字符串拼接都吃 toString。陷阱：不重写就打印一串难懂的哈希，排查问题很痛苦。`),
    F('hf42', 'oop', 'equals 与 hashCode',
      R`两个对象怎么算「相等」？和双等号差在哪？`,
      R`**双等号**比较引用是否同一对象；**equals** 默认也是比引用，重写后表示逻辑相等——重写 equals **必须同时重写 hashCode**。
~~~java
class Point {
    int x, y;
    Point(int x, int y) { this.x = x; this.y = y; }
    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof Point)) return false;
        Point p = (Point) o;
        return x == p.x && y == p.y;
    }
    @Override
    public int hashCode() {
        return x * 31 + y;              // 相等对象必须同哈希
    }
}
// new Point(1,2).equals(new Point(1,2)) → true
~~~
要点：放进 HashSet/HashMap 的键尤其依赖这对方法。陷阱：只重写 equals 不重写 hashCode，集合会「存进去取不出来」。`),
    F('hf43', 'oop', 'static 成员',
      R`属于类而不属于对象的成员怎么写？`,
      R`**static** 字段全类共享一份；**static 方法**无 this，不能直接访问实例成员；静态初始化块在类首次加载时执行一次。
~~~java
class Counter {
    static int total = 0;                 // 所有实例共享
    int id;
    Counter() {
        total++;
        id = total;
    }
    static int getTotal() {
        return total;                     // 只能直接摸静态
    }
}
// new Counter(); new Counter(); Counter.getTotal() → 2
~~~
要点：工具方法、常量、计数器常用 static。陷阱：静态方法里用 this 或实例字段编译不过；静态块只跑一次。`),
    F('hf44', 'oop', 'final 的三种用法',
      R`final 修饰类、方法、变量各是什么意思？`,
      R`**final 类**不可继承；**final 方法**不可重写；**final 变量**不可重新赋值（引用指向不变，对象内容仍可变）。
~~~java
final class Secrets { }          // 不能 extends Secrets
class A {
    final int max = 10;
    void run() {
        // max = 20;             // 编译错误：不能改
    }
}
~~~
要点：常量写成 static final，命名全大写。陷阱：final 数组/对象只是「锁引用」——数组元素仍可改。`),
    F('hf45', 'oop', '对象创建与构造链',
      R`new 一个对象时，内存和构造过程怎么走？`,
      R`**new** 在堆上分配空间 → 执行构造器链（先父类后子类）→ 返回引用；字段先默认零值，再跑初始化与构造器。
~~~java
class Animal {
    Animal() { System.out.println("动物构造"); }
}
class Dog extends Animal {
    Dog() {
        // 编译器自动先 super()
        System.out.println("狗构造");
    }
}
new Dog();
// 输出顺序：动物构造 → 狗构造
~~~
要点：字段初始化与实例初始化块按书写顺序穿插在父类构造之后、本类构造体之前。陷阱：构造器里调可重写方法——子类字段可能还没准备好。`),
    F('hf46', 'oop', '垃圾回收',
      R`对象用完了怎么释放？Java 要手动 free 吗？`,
      R`**垃圾回收**（GC）自动回收不再被引用的对象；程序员不写 free，但**引用还活着对象就不死**。
~~~java
void demo() {
    Object big = new Object();
    big = null;              // 主动断开：变得可回收（不保证立刻收）
}
// 作用域结束且无引用 → 进入 GC 候选
~~~
要点：置空或让引用出栈，对象才有机会被收。陷阱：静态集合、内部类隐式持有外部引用，容易把对象「粘住」造成内存泄漏。`),

    // ==================== 集合与泛型（HFJ 数据结构） ====================
    F('hf47', 'coll', '集合框架总览',
      R`Java 装一组对象用什么？集合两大体系是什么？`,
      R`**Collection** 一族（List 有序可重复 / Set 不重复 / Queue 队列）与 **Map** 一族（键值对）。数组长度固定，集合可伸缩。
~~~java
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

List<String> names = new ArrayList<>();   // 列表
names.add("Ada");
Map<String, Integer> age = new HashMap<>(); // 键值
age.put("Ada", 18);
~~~
要点：日常首选 ArrayList 与 HashMap。陷阱：集合只能装对象——装 int 要靠自动装箱成 Integer。`),
    F('hf48', 'coll', 'ArrayList',
      R`可变长列表怎么用？和数组比呢？`,
      R`**ArrayList** 是动态数组：按索引读取快，中间插入删除要搬元素。
~~~java
import java.util.ArrayList;
import java.util.List;

List<String> list = new ArrayList<>();
list.add("a");            // 尾部添加
list.add("b");
list.add(1, "x");         // 在下标 1 插入
System.out.println(list.get(0));  // a
System.out.println(list.size());  // 3
list.remove("x");                 // 按内容删
~~~
要点：get/add/remove 用得多；索引仍从零开始。陷阱：中间频繁插删代价高；遍历中直接 remove 会并发修改异常，要用迭代器。`),
    F('hf49', 'coll', 'LinkedList',
      R`大量头尾插删时选什么？`,
      R`**LinkedList** 是双向链表：头尾插入删除快，随机访问要从头走节点，慢。
~~~java
import java.util.LinkedList;
import java.util.Deque;

Deque<String> dq = new LinkedList<>();
dq.addFirst("头");
dq.addLast("尾");
System.out.println(dq.removeFirst());  // 头
System.out.println(dq.peek());         // 看一眼队首/栈顶语义
~~~
要点：需要队列/栈语义时 LinkedList 可当 Deque 用。陷阱：get(i) 在链表上是线性代价——循环用 get 会很慢，应改用迭代器。`),
    F('hf50', 'coll', 'HashSet 与去重',
      R`怎么自动去掉重复元素？`,
      R`**HashSet** 基于哈希，不保证顺序、自动去重；重复判定依赖元素的 equals 与 hashCode。
~~~java
import java.util.HashSet;
import java.util.Set;

Set<String> s = new HashSet<>();
s.add("a");
s.add("a");          // 重复，进不去
System.out.println(s.size());  // 1
System.out.println(s.contains("a")); // true
~~~
要点：要保插入顺序用 LinkedHashSet；要排序用 TreeSet。陷阱：自定义对象当元素却没重写 equals/hashCode，「逻辑相等」的两个对象会双双留下。`),
    F('hf51', 'coll', 'HashMap',
      R`按键查值怎么写？键有什么要求？`,
      R`**HashMap** 存键值对，按键取值近乎常数时间；键必须正确重写 equals 与 hashCode，且键一般应不可变。
~~~java
import java.util.HashMap;
import java.util.Map;

Map<String, Integer> map = new HashMap<>();
map.put("语文", 90);
map.put("数学", 95);
System.out.println(map.get("语文"));        // 90
System.out.println(map.containsKey("英语")); // false
for (Map.Entry<String, Integer> e : map.entrySet()) {
    System.out.println(e.getKey() + "=" + e.getValue());
}
~~~
要点：get/put/containsKey/entrySet 遍历是日常组合。陷阱：用可变字段当键，改完后可能取不出来；不要依赖遍历顺序。`),
    F('hf52', 'coll', 'TreeMap 与排序',
      R`按键排序的映射怎么用？Comparable 和 Comparator？`,
      R`**TreeMap** 按键的排序规则组织；**Comparable** 是类自带的自然顺序，**Comparator** 是外挂的比较器，可定义多种排序。
~~~java
import java.util.Comparator;
import java.util.TreeMap;
import java.util.TreeSet;

TreeMap<String, Integer> tm = new TreeMap<>();
tm.put("b", 2);
tm.put("a", 1);                 // 按 key 自然序
TreeSet<Integer> ts = new TreeSet<>(Comparator.reverseOrder());
ts.add(1); ts.add(3); ts.add(2); // 3,2,1 逆序
~~~
要点：需要排序遍历或范围查找用 Tree 系列。陷阱：键/元素无法比较且没给 Comparator 会在插入时抛异常。`),
    F('hf53', 'coll', '迭代器与 fail-fast',
      R`怎么安全地遍历并删除元素？`,
      R`**Iterator** 统一遍历：hasNext/next/remove；遍历中用集合自己的 remove 会触发 **fail-fast**（并发修改异常）。
~~~java
import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;

List<String> list = new ArrayList<>();
list.add("a"); list.add("b"); list.add("c");
Iterator<String> it = list.iterator();
while (it.hasNext()) {
    if (it.next().equals("b")) {
        it.remove();              // 安全删除
    }
}
~~~
要点：删除请走迭代器。陷阱：for-each 循环里调 list.remove 会抛 ConcurrentModificationException。`),
    F('hf54', 'coll', '泛型入门',
      R`尖括号是干什么的？为什么更安全？`,
      R`**泛型**在编译期检查元素类型：List<String> 只能放字符串，取出不用强转。
~~~java
import java.util.ArrayList;
import java.util.List;

List<String> names = new ArrayList<>();
names.add("Ada");
// names.add(1);          // 编译错误：只收 String
String first = names.get(0);   // 不用强转
for (String n : names) {       // 循环变量类型更清楚
    System.out.println(n);
}
~~~
要点：集合、比较器、可复用容器都靠泛型。陷阱：原始类型 List（不写尖括号）会失去检查——新代码一律写全泛型。`),
    F('hf55', 'coll', '类型擦除与通配符',
      R`运行时还知道 List<String> 吗？问号通配符怎么用？`,
      R`**类型擦除**：泛型只在编译期存在，运行时变回原始类型——所以不能 new T()，也不能用反射拿类型参数。通配符中，**? extends T** 偏读、**? super T** 偏写。
~~~java
import java.util.ArrayList;
import java.util.List;

static void printAll(List<? extends Number> src) {  // 只读数字序列
    for (Number n : src) {
        System.out.println(n);
    }
}
static void addInts(List<? super Integer> dst) {    // 只写整数
    dst.add(1);
}
~~~
要点：口诀「生产者用 extends、消费者用 super」。陷阱：List<?> 里除了 null 什么都不能 add（不知道装的是什么）。`),

    // ==================== 异常与常用库（HFJ 异常、文件与工具） ====================
    F('hf56', 'lib', '异常层次与检查型',
      R`错误和异常差在哪？检查型异常是什么？`,
      R`**Throwable** 下分 **Error**（严重系统问题，不处理）与 **Exception**。Exception 里，**受检异常**编译器强制你处理或声明；**RuntimeException** 多是程序 bug，可不强制。
~~~java
// 受检：文件找不到等，必须 catch 或 throws
try {
    // 可能抛受检异常的调用
} catch (Exception e) {
    System.out.println("处理：" + e.getMessage());
}

int[] a = {1};
// a[5] 运行时抛 ArrayIndexOutOfBoundsException（RuntimeException 一类）
~~~
要点：能处理就处理，不能处理就声明抛出。陷阱：空 catch 吞掉异常会把 bug 埋进坟场——至少要记日志。`),
    F('hf57', 'lib', 'try-catch-finally',
      R`捕获异常怎么写？finally 何时跑？`,
      R`**try** 放可能出错的代码，**catch** 按类型匹配处理，**finally** 无论是否异常都会执行（适合释放资源）。
~~~java
try {
    int x = 1 / 0;
} catch (ArithmeticException e) {
    System.out.println("算错了");
} finally {
    System.out.println("总会跑");   // 清理用
}
// 输出：算错了 / 总会跑
~~~
要点：多个 catch 按子类到父类排序。陷阱：finally 里写 return 会吞掉真正的返回值或异常——别这么干。`),
    F('hf58', 'lib', 'throw 与 throws',
      R`怎么主动抛异常？怎么声明我不管了？`,
      R`**throw** 真正抛出一个异常对象；**throws** 写在方法签名上，声明本方法可能抛出、交给调用方。
~~~java
static int parseAge(String s) {
    int n = Integer.parseInt(s);   // 可能抛 NumberFormatException
    if (n < 0) {
        throw new IllegalArgumentException("年龄不能为负");  // 主动抛
    }
    return n;
}
static void caller() throws Exception {
    // 也可以声明继续抛给上层
}
~~~
要点：自定义异常可继承 Exception 或 RuntimeException。陷阱：只声明 throws 却从不处理，等于把烫手山芋整层下传。`),
    F('hf59', 'lib', 'try-with-resources',
      R`资源自动关闭怎么写最省心？`,
      R`实现 AutoCloseable 的资源写在 try 括号里，结束时**自动关闭**（含异常路径）——优于手写 finally close。
~~~java
import java.io.BufferedReader;
import java.io.FileReader;
import java.io.IOException;

try (BufferedReader br = new BufferedReader(new FileReader("a.txt"))) {
    String line = br.readLine();
    System.out.println(line);
} catch (IOException e) {
    System.out.println("读失败");
}
// 不用手动 close
~~~
要点：可声明多个资源，按声明逆序关闭。陷阱：资源变量仍要把握好——try 括号里别塞无关语句。`),
    F('hf60', 'lib', '文件读写入门',
      R`怎么读一行文本、写一行文本？`,
      R`文本文件常用 **BufferedReader/Writer** 或较新的文件工具类；注意字符编码；用完关闭（优先 try-with-resources）。
~~~java
import java.io.*;
import java.nio.charset.StandardCharsets;
import java.nio.file.*;

List<String> lines = Files.readAllLines(
    Path.of("a.txt"), StandardCharsets.UTF_8);
Files.write(Path.of("b.txt"),
    lines, StandardCharsets.UTF_8);
// 大文件改用缓冲流按行读，避免一次载入
~~~
要点：小文件可用文件工具类一次读写；大文件走流式。陷阱：编码不一致会中文乱码；路径分隔符在 Windows 与类 Unix 不同。`),
    F('hf61', 'lib', '序列化入门',
      R`对象怎么存成字节流、以后再变回来？`,
      R`**序列化**把对象写成字节流，**反序列化**再重建对象；类需实现 Serializable 标记接口。
~~~java
import java.io.*;

class Player implements Serializable {
    private static final long serialVersionUID = 1L;
    String name = "Ada";
}
// 写出（示意）：ObjectOutputStream.writeObject(player)
// 读回（示意）：ObjectInputStream.readObject() 再强转
~~~
要点：适合存档、缓存、网络传对象。陷阱：改类结构可能导致反序列化失败；敏感字段用 transient 丢掉；别序列化没必要的巨大对象图。`),
    F('hf62', 'lib', 'java.time 日期时间',
      R`日期时间该用哪套 API？`,
      R`现代 Java 用 **java.time**：不可变、线程安全、语义清晰——LocalDate/LocalTime/LocalDateTime，格式化用 DateTimeFormatter。
~~~java
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;

LocalDate day = LocalDate.of(2026, 1, 15);
System.out.println(day.plusDays(7));          // 加七天，返回新对象
DateTimeFormatter fmt = DateTimeFormatter.ofPattern("yyyy-MM-dd");
System.out.println(day.format(fmt));          // 2026-01-15
~~~
要点：不可变意味着「修改」都返回新对象。陷阱：旧 Date/Calendar 月份从零开始且可变易踩坑——新代码别用。`),
    F('hf63', 'lib', '常用工具与格式化',
      R`随机数、数学、格式化输出有哪些现成轮子？`,
      R`**Math** 提供绝对值、最大最小、随机数等；**Random** 造更灵活的随机流；**System.out.printf** 与 **String.format** 按格式串输出。
~~~java
import java.util.Random;

System.out.println(Math.max(3, 7));           // 7
System.out.println(Math.random());            // [0,1) 小数
Random r = new Random();
System.out.println(r.nextInt(10));            // 0 到 9
System.out.printf("%s 得了 %.1f 分%n", "Ada", 92.25);
String s = String.format("%03d", 7);          // 007
~~~
要点：格式符里 d 整数、f 浮点、s 字符串、n 平台换行。陷阱：printf 的格式符与参数个数类型要对齐，错了运行时才炸。`),

    // ==================== 线程与实用进阶（HFJ 线程） ====================
    F('hf64', 'thr', '创建线程',
      R`怎么让两件事同时做？线程怎么建？`,
      R`**线程**是执行流。两种建法：继承 Thread 并重写 run，或实现 Runnable 交给 Thread——**更推荐 Runnable**（解耦任务与线程）。
~~~java
class Task implements Runnable {
    public void run() {
        System.out.println("干活的：" + Thread.currentThread().getName());
    }
}
public class Demo {
    public static void main(String[] args) {
        Thread t = new Thread(new Task());
        t.start();              // 启动新线程（不是调 run！）
    }
}
~~~
要点：start 才创建新执行流；直接调 run 只是普通方法调用。陷阱：忘记 start、或重复 start 已结束线程都会出问题。`),
    F('hf65', 'thr', '线程状态与 sleep',
      R`线程一生有哪几步？怎么让线程歇一下？`,
      R`大致状态：**新建 → 可运行 → 运行 → 等待/阻塞 → 终止**。Thread.sleep 让当前线程睡眠，到点后进入可运行队列再等调度。
~~~java
class Nap implements Runnable {
    public void run() {
        try {
            Thread.sleep(100);          // 睡 100 毫秒
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();  // 恢复中断标记
        }
        System.out.println("醒了");
    }
}
~~~
要点：sleep 不释放已持有的锁；是静态方法，作用于当前线程。陷阱：吞掉 InterruptedException 而不恢复中断，会坑了上层协作取消。`),
    F('hf66', 'thr', 'synchronized 与可见性',
      R`两个线程改同一个数为什么对不上？怎么加锁？`,
      R`并发修改共享状态会**丢更新**。**synchronized** 同一时间只让一个线程进临界区；**volatile** 保证可见性但不保证原子性。
~~~java
class SafeCounter {
    private int n = 0;
    public synchronized void add() {
        n++;                    // 读-改-写，必须互斥
    }
    public synchronized int get() {
        return n;
    }
}
~~~
要点：锁的是对象监视器：实例方法锁 this，静态方法锁 Class 对象。陷阱：volatile 的加加仍会丢更新；锁错对象等于没锁。`),
    F('hf67', 'thr', 'wait 与 notify',
      R`线程之间怎么「等消息、发消息」？`,
      R`**wait** 让当前线程在对象监视器上等待并**释放锁**；**notify/notifyAll** 唤醒等待者；都必须在持有该对象锁时调用。
~~~java
class Box {
    private boolean ready = false;
    public synchronized void produce() {
        ready = true;
        notifyAll();                 // 喊醒等待的人
    }
    public synchronized void consume() throws InterruptedException {
        while (!ready) {             // 循环防虚假唤醒
            wait();                  // 放锁并等
        }
        System.out.println("拿到");
    }
}
~~~
要点：条件判断一定要 while，不能 if 一次就过。陷阱：不在同步块里调 wait/notify 会抛非法监视器状态异常。`),
    F('hf68', 'thr', '线程池与并发工具',
      R`为什么不要疯狂 new Thread？现成工具有哪些？`,
      R`线程有创建销毁成本——用**线程池**复用并控制并发上限。高层工具还有 **BlockingQueue**、原子变量、以及 java.util.concurrent 一族。
~~~java
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

ExecutorService pool = Executors.newFixedThreadPool(2);
pool.submit(() -> System.out.println("任务甲"));
pool.submit(() -> System.out.println("任务乙"));
pool.shutdown();                 // 不再收新任务，已收的跑完
~~~
要点：生产代码用线程池与并发容器，少裸起线程。陷阱：用完不 shutdown 可能阻止进程退出；无界队列可能把内存吃穿。`),
  ];

  const META = {
    hf01: [5, 'JVM 跨平台'], hf02: [5, 'hello 程序'], hf03: [4, 'javac java'], hf04: [4, 'main 签名'],
    hf05: [4, '变量赋值'], hf06: [3, '输出拼接'], hf07: [5, '对象引用'], hf08: [5, '类与对象'],
    hf09: [4, '实例与局部变量'], hf10: [2, '注释'], hf11: [3, '命名惯例'], hf12: [3, '包 import'],
    hf13: [5, '基本类型'], hf14: [3, '字面量'], hf15: [4, '算术运算'], hf16: [3, '自增赋值'],
    hf17: [4, '逻辑运算'], hf18: [5, 'if 分支'], hf19: [4, 'switch'], hf20: [4, 'while 循环'],
    hf21: [5, 'for 增强for'], hf22: [3, 'break continue'], hf23: [5, '数组'], hf24: [4, '默认值强转'],
    hf25: [5, '装箱拆箱'], hf26: [5, 'String 方法'], hf27: [4, 'StringBuilder'], hf28: [5, '方法定义'],
    hf29: [5, '值传递'], hf30: [4, '方法重载'],
    hf31: [5, '封装'], hf32: [5, '构造器'], hf33: [4, 'this 构造链'], hf34: [5, '继承'],
    hf35: [5, '重写'], hf36: [5, 'super'], hf37: [5, '多态'], hf38: [5, '抽象类'],
    hf39: [5, '接口'], hf40: [4, '抽象类与接口'], hf41: [4, 'toString'], hf42: [5, 'equals hashCode'],
    hf43: [4, 'static'], hf44: [3, 'final'], hf45: [4, '对象创建'], hf46: [3, '垃圾回收'],
    hf47: [4, '集合总览'], hf48: [5, 'ArrayList'], hf49: [3, 'LinkedList'], hf50: [4, 'HashSet'],
    hf51: [5, 'HashMap'], hf52: [4, 'TreeMap 排序'], hf53: [4, '迭代器 fail-fast'], hf54: [5, '泛型'],
    hf55: [4, '类型擦除 通配符'],
    hf56: [5, '异常层次'], hf57: [5, 'try catch finally'], hf58: [4, 'throw throws'], hf59: [4, 'try-with-resources'],
    hf60: [4, '文件读写'], hf61: [3, '序列化'], hf62: [3, 'java.time'], hf63: [3, 'Math printf'],
    hf64: [4, '创建线程'], hf65: [3, '线程状态'], hf66: [5, 'synchronized'], hf67: [4, 'wait notify'], hf68: [4, '线程池']
  };

  const PITFALL = {
    hf02: R`类名与文件名大小写必须一致；public 类一个源文件只能有一个。`,
    hf04: R`main 签名写错 JVM 找不到入口——尤其别漏 static，参数写成别的类型也不行。`,
    hf07: R`引用赋值是共享对象，不是拷贝——两个变量一个对象时，改内容双方都看见。`,
    hf13: R`0.1 加 0.2 这类二进制浮点不精确；float 精度更小，别拿它算钱。`,
    hf19: R`switch 漏 break 会贯穿到下一档；default 建议保留兜底。`,
    hf21: R`增强 for 取出的是副本，改循环变量改不了集合元素；要下标就用经典 for。`,
    hf24: R`大转小强转可能溢出绕回，不会抛异常——结果不对先查类型。`,
    hf25: R`包装类比较值要用 equals；缓存区间外的双等号比较会得 false；拆箱遇 null 空指针。`,
    hf26: R`String 不可变：toUpperCase 等必须接返回值；内容比较用 equals 不用双等号。`,
    hf29: R`Java 只有值传递——方法内给参数重新赋值，调用方无感；swap 引用会失败。`,
    hf32: R`写了有参构造后，默认无参构造消失——还要无参就自己写。`,
    hf36: R`super(…) 必须在构造器第一行；父类没有无参构造时子类必须显式 super 带参。`,
    hf37: R`字段与静态方法没有多态——按引用声明类型走，容易打印出「父类字段」的错觉。`,
    hf42: R`重写 equals 必须同时重写 hashCode，否则放进 HashMap/HashSet 行为错乱。`,
    hf44: R`final 引用只锁指向，不锁对象内容——final 数组的元素仍可改。`,
    hf53: R`for-each 中直接集合 remove 会抛并发修改异常——删除用迭代器的 remove。`,
    hf55: R`运行时拿不到泛型实参；List<?> 除了 null 不能 add。`,
    hf56: R`空 catch 吞异常等于埋雷——至少打日志或重新抛出。`,
    hf57: R`finally 里 return 会覆盖返回值并吞掉异常，禁止这么写。`,
    hf66: R`volatile 只管可见性不管原子性；计数自增要用 synchronized 或原子类。`
  };

  // —— 帮助栏目文章（检索用，不参与学习调度）——
  const HELP = [
    { id: 'hj01', title: 'Java 适合做什么', body: R`**强类型、面向对象、跑在 JVM 上**的经典语言：企业后端、安卓、大数据生态的支柱。
哲学是「一次编写，到处运行」+ 严格的工程结构——语法啰嗦，换来大型项目的可靠与工具链。
对初学者：比脚本语言更啰嗦（要写类型、一切进类），但程序骨架清晰，适合打面向对象的基本功。` },
    { id: 'hj02', title: '安装 JDK 与版本选择', body: R`直接装 **LTS 版本**（例如 17 或 21）的 **JDK**——开发工具包，含编译器，不要只装运行环境。
验证：终端敲 java -version 与 javac -version 都出版本号。
包含关系：**JDK ⊃ JRE ⊃ JVM**。IDE 推荐 IntelliJ IDEA 社区版（免费）或 VS Code 加 Java 扩展。` },
    { id: 'hj03', title: '第一个程序怎么跑通', body: R`新建 Hello.java → 写 public 类与 main → 终端 javac Hello.java → java Hello。
文件名必须与 public 类同名；运行命令后**不带** .class 后缀。
打印一行 hello, world 之后，再把 println 里的内容换成自己的话——跑通比看懂更重要。` },
    { id: 'hj04', title: '字节码与 JVM：跨平台原理', body: R`javac 把源码编译成 **.class 字节码**（不是本机机器码）；各平台的 **JVM** 把字节码翻译成当地指令。
所以源码不用改，只要目标平台装好 JVM 就能跑。
直觉：字节码是「中间语言」，JVM 是「翻译官 + 管家」（还负责垃圾回收与安全沙箱）。` },
    { id: 'hj05', title: '怎么读异常堆栈', body: R`**从上往下读**：第一行是异常类型与消息（如 NullPointerException），下面的 at 行是调用栈。
找到**你自己类名**出现的那一行——行号直达出事地点。
新手三兄弟：空指针、数组下标越界、类型转换异常——先混个脸熟，九成入门报错都在这里。` },
    { id: 'hj06', title: '双等号与 equals：第一大坑', body: R`**双等号**比的是不是同一个对象（基本类型比的是值）；**equals** 默认比引用，重写后表示逻辑相等。
字符串与包装类的内容比较一律用 equals——双等号在字符串池与缓存区间上会让你误判。
放进 HashMap/HashSet 的自定义键，equals 与 hashCode 必须一起重写且逻辑一致。` },
    { id: 'hj07', title: '工具链：javac、java 与 IDE', body: R`**javac** 编译、**java** 运行、**javadoc** 生成文档——JDK 自带三件套。
IDE 负责一键编译运行、补全与重构；构建工具 Maven/Gradle 管依赖（初学先知道名字）。
调试：会打断点看变量，比 System.out.println 大海捞针高效一个数量级。` },
    { id: 'hj08', title: 'Java 学习路径建议', body: R`① 基本概念 + 语法与类型打牢（变量、控制流、数组、String）；② **面向对象是灵魂**——封装/继承/多态/接口值得双倍时间；③ 集合与泛型是日常主力；④ 异常与文件让程序能落地；⑤ 线程进阶可稍后。
节奏参考：每天 10 张卡 + 每周一个小项目（学生管理、简易记账）。
铁律：示例全部亲手敲进 IDE 跑一遍——Java 是「写会」的语言。` }
  ];

  const BEGINNER = ['intro', 'types'];
  return { BEGINNER: BEGINNER, id: 'java', name: 'Java', short: 'Java', icon: '☕', kind: 'qa', group: 'skill', CATS: CATS, DATA: DATA, META: META, HELP: HELP, REL: {}, PITFALL: PITFALL, MNEM: {}, ORDER: ['intro', 'types', 'oop', 'coll', 'lib', 'thr'] };
})();
