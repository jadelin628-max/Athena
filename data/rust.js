/*
 * Rust · 知识点记忆数据库
 * 依据：《The Rust Programming Language》（The Book）入门主干
 *       Getting Started / 通用概念 / 所有权 / 结构体 / 枚举与模式匹配 / 模块 /
 *       集合 / 错误处理 / 泛型 trait 生命周期 / 测试 / 智能指针 / 并发入门
 * 结构：id / cat / title / front / back + META / PITFALL / HELP / BEGINNER
 * 背面三段式：概念定义 → ~~~rust 最小可运行示例（含教学注释）→ 要点/陷阱
 * 说明：无例题学科；kind: 'qa' 驱动 UI 适配。
 * 进度策略=整科重置：新 id tb01 起连续编号，旧 id（ar/ba/ty/fl/da/er/cl/ec 等）全部替换，学习进度重置（对齐 Python v1.41 先例）。
 */
window.SUBJECTS = window.SUBJECTS || {};
window.SUBJECTS.rust = (function () {
  'use strict';
  const R = String.raw;

  const CATS = {
    start: '入门起步',
    base: '通用概念',
    own: '所有权',
    struct: '结构体',
    enum: '枚举与模式匹配',
    mod: '模块系统',
    coll: '常用集合',
    err: '错误处理',
    gen: '泛型与生命周期',
    test: '自动化测试',
    smart: '智能指针',
    conc: '并发入门'
  };

  const F = (id, cat, title, front, back) => ({ id, cat, title, front, back });

  const DATA = [
    // ==================== 入门起步（第 1–2 章 Getting Started / Guessing Game） ====================
    F('tb01', 'start', '安装工具链：rustup',
      R`怎么把 Rust 装进电脑？装完怎么验证？`,
      R`官方安装器 **rustup** 一套装齐：rustc 编译器、cargo 构建工具、标准库。Windows 下载 rustup-init，macOS / Linux 走一行安装脚本。
验证：终端分别敲 rustc --version 与 cargo --version，都出版本号即成功。
~~~bash
rustc --version    # 看编译器版本
cargo --version    # 看构建工具版本
~~~
要点：升级用 rustup update，六周一版节奏稳定。陷阱：只装 rustc 不装 cargo 会缺构建与包管理——官方渠道就用 rustup 全装。`),
    F('tb02', 'start', 'Cargo 项目：new / build / run',
      R`怎么新建并运行一个 Rust 项目？Cargo.toml 是什么？`,
      R`**cargo** 是构建工具 + 包管理器 + 测试器三合一。new 建项目、build 编译、run 编译并运行、check 只做快速类型检查。
项目清单写在 **Cargo.toml**（名字、版本、依赖）；源码默认放 src 下的 main 文件。
~~~bash
cargo new hello    # 生成 hello/ 项目骨架
cd hello
cargo run          # 编译并运行
~~~
要点：Rust 从第一天就是工程化姿势。陷阱：改动后不 build 直接跑旧二进制会以为「代码没生效」——用 cargo run 让它自动重编。`),
    F('tb03', 'start', 'Hello World 与 println!',
      R`最小程序怎么写？名字后的感叹号是什么？`,
      R`入口是 **main** 函数；输出用 **println!** 宏（名字带感叹号是宏的标志，不是函数）。花括号占位，变量按序或按名填入。
~~~rust
fn main() {
    // 向标准输出打印一行并换行
    println!("Hello, world!");
    println!("你好, {}!", "Rust");   // 花括号占位
}
~~~
要点：语句以分号结尾；宏调用必须带感叹号。陷阱：写成 println（少感叹号）会当函数找，直接编译报错。`),
    F('tb04', 'start', '猜数字：程序骨架与依赖',
      R`猜数字游戏的最小骨架长什么样？第三方库怎么加？`,
      R`骨架：打印提示 → 读输入 → 解析数字 → 与秘密数比较 → 循环直到猜中。随机数用第三方 crate **rand**（不是标准库）。
cargo add rand 即可写入 Cargo.toml 并解析依赖；use 语句把需要的项引进作用域。
~~~rust
use rand::Rng;   // 引入随机数 trait，后面才能调 gen_range

fn main() {
    let secret = rand::thread_rng().gen_range(1..=100); // 闭区间 1 到 100
    println!("秘密数已生成：{}", secret);
}
~~~
要点：依赖进 Cargo.toml，版本锁定写进 Cargo.lock。陷阱：忘记 cargo add 就 use，编译器找不到 crate。`),
    F('tb05', 'start', '猜数字：读输入与 parse',
      R`怎么从键盘读一行并变成数字？解析失败怎么办？`,
      R`标准输入一行用 std::io 的 stdin 读到 String；**parse** 把字符串转成数字并返回 Result——类型由左侧标注或上下文推断。
trim 去掉末尾换行，否则 parse 会失败。
~~~rust
use std::io;

fn main() {
    let mut guess = String::new();          // 可变字符串缓冲
    io::stdin()
        .read_line(&mut guess)              // 借用可变引用写入
        .expect("读取失败");
    let guess: i32 = guess.trim().parse()   // 去掉换行再解析
        .expect("请输入数字");
    println!("你猜的是：{}", guess);
}
~~~
要点：read_line 要可变引用；parse 的目标类型写在 let 后。陷阱：不 trim 直接 parse，带换行的输入必挂。`),
    F('tb06', 'start', '猜数字：比较与循环收束',
      R`怎么比较大小并让循环在猜中后结束？`,
      R`标准库 **Ordering** 枚举表达比较结果（Less / Greater / Equal）。match 穷尽匹配三种结果；猜中用 break 跳出 loop。
guess 声明要 mut——每轮循环重新绑定读入的新值（这里用遮蔽也常见）。
~~~rust
use std::cmp::Ordering;

let secret = 42;
let guess = 42;

match guess.cmp(&secret) {
    Ordering::Less => println!("小了"),
    Ordering::Greater => println!("大了"),
    Ordering::Equal => {
        println!("猜中！");
    }
}
~~~
要点：cmp 收的是引用；Equal 分支结束游戏。陷阱：把 match 写成 if 链容易漏分支——比较三态用 match 最稳。`),

    // ==================== 通用概念（第 3 章 Common Programming Concepts） ====================
    F('tb07', 'base', '变量与可变性：let 与 mut',
      R`Rust 的变量默认可变吗？怎么声明可变量？`,
      R`**默认不可变**：let 绑定后再赋值会编译错误。要改值必须写 **let mut**——可变性是显式决定，不是默认。
~~~rust
fn main() {
    let x = 5;       // 不可变：再写 x = 6 会编译失败
    let mut y = 1;   // 可变：允许重新赋值
    y = y + 1;
    println!("x = {}, y = {}", x, y);
}
~~~
要点：默认不可变减少意外修改。陷阱：忘了 mut 就赋值，报错会明确说「绑定不是可变的」——按提示加 mut 或改设计。`),
    F('tb08', 'base', '常量 const 与静态 static',
      R`常量和不可变变量差在哪？全局值怎么写？`,
      R`**const** 必须标注类型、只能用常量表达式、在整个程序生命周期有效（可写在全局）；**static** 是带静态生命周期的全局变量（可变 static 要 unsafe）。
不可变 let 只是「绑定后不能再赋」，运行期才能算出值；const 必须编译期已知。
~~~rust
const MAX_POINTS: u32 = 100_000;   // 类型标注 + 下划线分隔便于阅读

fn main() {
    let score = MAX_POINTS;        // 使用常量
    println!("{}", score);
}
~~~
要点：常量名惯例全大写下划线。陷阱：想用运行期计算的结果就用 let，别硬塞进 const。`),
    F('tb09', 'base', '遮蔽 Shadowing',
      R`同名再 let 一次是什么意思？和 mut 有何不同？`,
      R`**遮蔽**：同作用域再次 let 同名绑定——新值（且可换类型）遮住旧值，旧绑定不再可用。这与 mut 的「原地改同一变量」不同。
常用在「值的加工链」：先收字符串，再遮蔽成解析后的数字。
~~~rust
fn main() {
    let spaces = "   ";            // 字符串切片
    let spaces = spaces.len();     // 遮蔽：类型变成整数
    println!("{}", spaces);        // 3
}
~~~
要点：遮蔽可改类型，mut 不可。陷阱：内层块遮蔽只在块内有效，出块回到外层同名绑定。`),
    F('tb10', 'base', '标量与复合类型',
      R`Rust 有哪些基本类型？元组和数组怎么用？`,
      R`**标量**：整数（i8…i128、isize / u 系列）、浮点（f32、f64）、bool、char（Unicode 标量值）。**复合**：元组（定长、可异构）、数组（定长、同构、栈上）。
类型后缀可写在字面量上（如 98u8）；下标从零开始。
~~~rust
fn main() {
    let tup: (i32, f64, u8) = (500, 6.4, 1); // 元组
    let (x, y, z) = tup;                     // 解构
    let arr = [1, 2, 3, 4, 5];               // 数组
    let first = arr[0];                      // 下标访问
    println!("{} {} {}", x, y, first);
}
~~~
要点：数组定长在栈；要可增长用后面的 Vec。陷阱：元组整体类型与位置类型都可能被推错——必要时显式标注。`),
    F('tb11', 'base', '函数定义、参数与返回值',
      R`函数怎么写？参数必须标类型吗？怎么返回多个值？`,
      R`用 **fn** 定义：**参数必须标注类型**，返回类型写在箭头后；多返回值用元组。
函数体是表达式序列；命名与其他绑定一样推荐蛇形命名。
~~~rust
fn add(a: i32, b: i32) -> i32 {
    a + b          // 无分号：这是返回值
}

fn swap(x: i32, y: i32) -> (i32, i32) {
    (y, x)         // 元组返回
}

fn main() {
    let s = add(2, 3);
    let (a, b) = swap(1, 2);
    println!("{} {} {}", s, a, b);
}
~~~
要点：调用实参顺序与类型要匹配。陷阱：参数漏写类型、或返回多个裸值而不用元组——都编译不过。`),
    F('tb12', 'base', '语句与表达式',
      R`Rust 里什么是语句、什么是表达式？为什么「最后一个值」很重要？`,
      R`**语句**执行动作、不返回值（通常以分号结束）；**表达式**求值并产生结果。函数体最后一个**不带分号的表达式**就是返回值——多一个分号会变成语句，返回类型塌成单元类型。
块本身也是表达式。
~~~rust
fn five() -> i32 {
    let y = 5;     // 语句：绑定
    y              // 表达式：返回 5（不要分号）
}

fn main() {
    let x = {
        let t = 1;
        t + 2      // 块的值是 3
    };
    println!("{} {}", five(), x);
}
~~~
要点：分号把表达式变成语句。陷阱：写了 return 又在结尾写无分号表达式——风格二选一即可。`),
    F('tb13', 'base', 'if / else 表达式',
      R`if 要括号吗？能不能赋值？`,
      R`条件**不加圆括号**（加了编译器会警告），分支必须花括号。if 是**表达式**：两分支类型一致才能当值用。
条件必须是 bool——Rust **不做**非零/非空的隐式真假转换。
~~~rust
fn main() {
    let n = 6;
    if n % 4 == 0 {
        println!("整除 4");
    } else if n % 2 == 0 {
        println!("偶数");
    } else {
        println!("奇数");
    }
    let label = if n > 0 { "正" } else { "非正" };
    println!("{}", label);
}
~~~
要点：条件类型必须是 bool。陷阱：写 if n { ... } 会直接类型错误——比较结果才是条件。`),
    F('tb14', 'base', '循环：loop / while / for',
      R`三种循环各适合什么？loop 怎么返回值？`,
      R`**loop** 无限循环，break 可带值；**while** 条件为真继续；**for** 遍历迭代器（区间是迭代器）。区间 a..b 不含 b，a..=b 含 b。
没有 C 式三段 for——遍历一律走 for in。
~~~rust
fn main() {
    let mut count = 0;
    let result = loop {
        count += 1;
        if count == 3 {
            break count * 10;   // loop 作为表达式返回 30
        }
    };
    let mut i = 0;
    while i < 3 {
        i += 1;
    }
    for j in 0..3 {
        // 0、1、2
    }
    println!("{} {} {}", result, i, j);
}
~~~
要点：能确定次数就用 for。陷阱：while 里忘更新条件会死循环；loop 不 break 就永远转。`),

    // ==================== 所有权（第 4 章 Understanding Ownership） ====================
    F('tb15', 'own', '所有权三规则与作用域',
      R`Rust 的所有权规则是什么？值什么时候被丢弃？`,
      R`① 每个值有**唯一所有者**（变量）；② 同一时刻只能有一个所有者；③ 所有者离开作用域时值被 **drop**（释放）。
作用域从声明到块结束；同名遮蔽会提前结束旧绑定的「名字可见期」，旧值在不可再用后按规则释放。
~~~rust
fn main() {
    {
        let s = String::from("hi"); // s 进入作用域，拥有堆上字符串
        // 用 s ...
    }   // s 离开作用域，String 自动释放
    // 这里再用 s 会编译失败
}
~~~
要点：释放时机由作用域与所有权决定，无需手动 free。陷阱：以为「出块还能用」——所有权系统的第一课就是拒绝这种写法。`),
    F('tb16', 'own', '移动语义 Move',
      R`把 String 赋给另一个变量后，旧的还能用吗？什么是移动？`,
      R`堆上数据（如 String、Vec）赋值或传参默认 **move**：所有权转移，旧变量**失效**——这是编译器防止双重释放的手段，不是浅拷贝也不是深拷贝。
栈上的简单类型（整数、bool 等）走复制，见下一卡。
~~~rust
fn main() {
    let s1 = String::from("hello");
    let s2 = s1;              // 所有权移动到 s2
    // println!("{}", s1);    // 编译错误：s1 已失效
    println!("{}", s2);       // 只能用新所有者
}
~~~
要点：移动后旧名作废。陷阱：旧习惯「赋值后两个都能用」在 Rust 必须显式 clone。`),
    F('tb17', 'own', '复制 Copy 与克隆 Clone',
      R`什么时候是复制？想要「两份独立数据」怎么做？`,
      R`实现 **Copy** 的类型（整数、浮点、bool、char、纯 Copy 的元组与数组等）赋值时按位复制，原值仍可用。
需要堆上数据的独立副本时显式 **clone**——代价写在代码里，避免无意深拷贝。
~~~rust
fn main() {
    let a = 5;             // 整数实现 Copy
    let b = a;             // 复制，a 仍可用
    println!("{} {}", a, b);

    let s1 = String::from("hi");
    let s2 = s1.clone();   // 显式深拷贝
    println!("{} {}", s1, s2);
}
~~~
要点：Copy 与 Clone 不是一回事；Copy 隐式且便宜。陷阱：到处 clone 会掩盖所有权设计问题——先想清楚谁该拥有。`),
    F('tb18', 'own', '所有权与函数传参',
      R`传给函数会发生什么？拿得回来吗？`,
      R`传参语义与赋值相同：实现 Copy 的复制一份，否则**移动**进函数。函数想把所有权交还，用**返回值**。
需要在函数里「借用而不吞掉」就传引用——见借用卡。
~~~rust
fn take(s: String) {
    println!("got {}", s);
}   // s 在此 drop

fn give_back() -> String {
    let s = String::from("mine");
    s   // 所有权返回给调用者
}

fn main() {
    let s = String::from("hi");
    take(s);
    // 这里 s 已移动，不能再用
    let t = give_back();
    println!("{}", t);
}
~~~
要点：进出函数都可能转移所有权。陷阱：把唯一所有者传走又继续用——经典报错「值在调用处被移动」。`),
    F('tb19', 'own', '不可变引用与借用',
      R`怎么用值而不获取所有权？多个只读引用可以吗？`,
      R`**引用**（&T）让你使用值而不取得所有权，也叫**借用**。不可变引用可以同时存在多个（都是只读）。
引用的作用域是「最后一次使用」附近（非词法作用域），写完代码编译器会精确判定。
~~~rust
fn calc_len(s: &String) -> usize {
    s.len()          // 借用，不拥有
}

fn main() {
    let s = String::from("hello");
    let len = calc_len(&s);   // 传引用
    println!("{} {}", s, len); // s 仍有效
}
~~~
要点：传参优先借而不是吞。陷阱：参数写成 &String 对字面量不友好——更惯用的是字符串切片。`),
    F('tb20', 'own', '可变引用的排他规则',
      R`怎么在函数里改借用的值？为什么「只能有一个」？`,
      R`**可变引用**（&mut T）可在被借用期间修改值，但**同一时刻只允许一个**，且不能与任何不可变引用共存——从根上排除数据竞争。
要把原变量借成可变引用，原绑定也必须是 mut。
~~~rust
fn push_str(s: &mut String) {
    s.push_str(", world");   // 通过引用修改
}

fn main() {
    let mut s = String::from("hello");
    push_str(&mut s);
    println!("{}", s);
}
~~~
要点：可变借用独占。陷阱：两个 &mut 同时存活，或 & 与 &mut 并存——直接编译错误，不是运行时隐患。`),
    F('tb21', 'own', '悬垂引用与生命周期直觉',
      R`什么是悬垂引用？Rust 为什么不给写？`,
      R`**悬垂引用**：引用活得比被引用的数据还久（数据已释放，指针还在）——C/C++ 悬空指针的根源之一。
Rust **在编译期拒绝**：引用的生命不得超过数据。不必先学完整生命周期语法，也能靠所有权规则避免悬垂。
~~~rust
// 以下函数无法通过编译：返回对局部值的引用
// fn dangle() -> &String {
//     let s = String::from("hi");
//     &s   // s 函数结束就 drop，引用无处可靠
// }

fn no_dangle() -> String {
    let s = String::from("hi");
    s   // 移交所有权，安全
}
~~~
要点：返回引用时先问「数据比引用活得久吗」。陷阱：试图返回局部变量的引用——编译器会当场拦下。`),
    F('tb22', 'own', '切片 slice',
      R`什么是切片？字符串切片怎么写？为什么函数爱收切片？`,
      R`**切片**是指向集合一段连续元素的引用（指针 + 长度），不拥有数据。字符串切片类型是 **&str**；字面量本身就是 &str。
函数参数收 &str 可同时接受 String 的一部分与字面量——比固定收 &String 灵活。
~~~rust
fn first_word(s: &str) -> &str {
    let bytes = s.as_bytes();
    for (i, &b) in bytes.iter().enumerate() {
        if b == b' ' {
            return &s[..i];    // 空格前的切片
        }
    }
    &s[..]                     // 整串
}

fn main() {
    let s = String::from("hello world");
    let w = first_word(&s);
    println!("{}", w);         // hello
}
~~~
要点：切片借用原数据，不能活得比它久。陷阱：String 与 &str 是两类；解析/拼接多用 String，读接口多用 &str。`),

    // ==================== 结构体（第 5 章 Using Structs） ====================
    F('tb23', 'struct', '定义与实例化',
      R`结构体怎么定义、怎么造实例、怎么读写字段？`,
      R`用 **struct** 定义具名字段的类型；实例用「类型名 + 花括号字段」创建，字段顺序可与定义不同。可变实例才能改字段；可用字段简写（变量名与字段名相同）。
~~~rust
struct User {
    active: bool,
    username: String,
    email: String,
}

fn main() {
    let mut u = User {
        active: true,
        username: String::from("ada"),
        email: String::from("ada@example.com"),
    };
    u.email = String::from("new@example.com");  // 可变实例才能改
    println!("{}", u.username);
}
~~~
要点：结构体是「与」的组合：所有字段通常都有值。陷阱：实例字段不全会编译失败；改字段要求整个实例可变。`),
    F('tb24', 'struct', '元组结构体与单元结构体',
      R`没有字段名的结构体有什么用？`,
      R`**元组结构体**：有类型名但字段无名（按位置访问），适合**新类型**给已有类型加语义；**单元结构体**：无字段，常作标记。
整体类型不可与裸元组互换——编译器当成不同类型，这正是安全点。
~~~rust
struct Meters(f64);
struct Marker;          // 单元结构体

fn main() {
    let d = Meters(3.0);
    println!("{}", d.0); // 按下标取字段
    let _m = Marker;
}
~~~
要点：新类型防「米」和「秒」混传。陷阱：元组结构体字段用点数字访问，别写成具名字段。`),
    F('tb25', 'struct', '方法与关联函数',
      R`方法怎么写？Self 与 new 是怎么回事？`,
      R`方法写在 **impl** 块里，第一个参数是 **self**（&self 读 / &mut self 写 / self 带走所有权）。没有 self 的是**关联函数**，常用作构造器，惯例名 **new**，用类型路径调用。
方法与关联函数都通过类型或实例的点语法/路径调用。
~~~rust
struct Rectangle { w: u32, h: u32 }

impl Rectangle {
    fn area(&self) -> u32 { self.w * self.h }          // 方法
    fn square(size: u32) -> Self {                      // 关联函数
        Self { w: size, h: size }
    }
}

fn main() {
    let s = Rectangle::square(4);   // 类型调关联函数
    println!("{}", s.area());       // 实例调方法
}
~~~
要点：读方法用 &self，要改用 &mut self。陷阱：方法第一个参数忘写 self——那就成了关联函数，只能类型路径调用。`),
    F('tb26', 'struct', '结构体与所有权',
      R`结构体字段能不能放引用？什么时候必须写生命周期？`,
      R`字段默认可以是拥有类型（String、Vec 等）或引用。若字段是**引用**，必须标注**生命周期**，保证引用不比结构体实例活得久——入门阶段更常见、更省心的是字段直接拥有数据。
实例整体也可被移动或借用，规则与其它值相同。
~~~rust
struct Owned {
    name: String,     // 拥有数据：最省心
}

// 需要借用字段时才写生命周期（见泛型与生命周期章）
struct OwnedSlice<'a> {
    name: &'a str,    // 借用：活得不能超过 'a
}

fn main() {
    let o = Owned { name: String::from("ada") };
    let s = String::from("bo");
    let p = OwnedSlice { name: s.as_str() };
    println!("{} {}", o.name, p.name);
}
~~~
要点：先拥有、再借用。陷阱：字段写 &str 不写生命周期，直接编译错误。`),
    F('tb27', 'struct', '用结构体组织相关数据',
      R`为什么要把零散变量收进结构体？`,
      R`结构体把**相关数据**绑成一个概念整体，函数签名更短、语义更清楚，也为方法与泛型打基础。
从「参数列表一长串」进化到「一个有名字的值」，是抽象能力的关键一步。
~~~rust
struct Circle {
    radius: f64,
}

impl Circle {
    fn area(&self) -> f64 {
        std::f64::consts::PI * self.radius * self.radius
    }
}

fn main() {
    let c = Circle { radius: 2.0 };
    println!("{:.2}", c.area());  // 保留两位小数
}
~~~
要点：同一概念的字段收进一个结构体。陷阱：为了「方便」把无关字段硬塞一起——那只是更大的全局变量。`),

    // ==================== 枚举与模式匹配（第 6 章 Enums and Pattern Matching） ====================
    F('tb28', 'enum', '枚举变体携带数据',
      R`Rust 枚举和 C 的枚举有什么不同？`,
      R`Rust **枚举**的每个变体可以携带**不同类型、不同数量**的数据——是「或」的组合（结构体是「与」的组合），合称代数数据类型。
标准库核心枚举：Option（可能没有）与 Result（可能失败）——把常见「缺失/失败」编码进类型系统。
~~~rust
enum Message {
    Quit,
    Move { x: i32, y: i32 },
    Write(String),
}

fn main() {
    let m = Message::Write(String::from("hi"));
    // 变体可携带元组、结构体字段或什么也不带
}
~~~
要点：变体即类型安全的标签 + 数据。陷阱：以为枚举只能是常量整数——Rust 枚举远强于此。`),
    F('tb29', 'enum', 'Option：没有空值的世界',
      R`Rust 怎么表达「可能没有值」？和 nullptr 有何不同？`,
      R`**Option**  枚举：Some(值) 或 None——没有 null 空指针。要用里面的值，必须先处理 None 分支（编译器强制）。
常用：match、unwrap_or（给默认值）、unwrap_or_else（惰性默认）、map（对 Some 变换）。
~~~rust
fn main() {
    let x: Option<i32> = Some(5);
    let y: Option<i32> = None;

    match x {
        Some(v) => println!("有 {}", v),
        None => println!("没有"),
    }
    println!("{}", y.unwrap_or(0));  // None 时用 0
}
~~~
要点：缺失进了类型签名，调用方躲不掉。陷阱：无脑 unwrap——None 时直接 panic，生产代码要有理由。`),
    F('tb30', 'enum', 'match 穷尽匹配',
      R`match 的核心规则是什么？为什么会「漏分支」就编译失败？`,
      R`match 是**表达式**，分支用模式 => 结果；编译器要求**穷尽**所有可能——漏了会编译错误，用 _ 兜底补全。
没有 C switch 的隐式贯穿；每个分支独立求值。
~~~rust
fn main() {
    let n = 3;
    let text = match n {
        1 => "一",
        2 | 3 => "二或三",   // 多模式
        _ => "其它",          // 兜底：保证穷尽
    };
    println!("{}", text);
}
~~~
要点：枚举新增变体时，漏写的 match 会编译失败——这是特性不是麻烦。陷阱：_ 放太早会吞掉本想显式处理的分支。`),
    F('tb31', 'enum', 'match 解构与绑定',
      R`match 能不能把枚举/元组里的数据取出来？`,
      R`模式可以**解构**：枚举变体携带的数据、元组、结构体字段都能在模式里绑定成新变量，甚至嵌套。
这让「检查一种情况」和「取出里面的值」一步完成。
~~~rust
enum Shape {
    Circle(f64),
    Rect { w: f64, h: f64 },
}

fn area(s: &Shape) -> f64 {
    match s {
        Shape::Circle(r) => std::f64::consts::PI * r * r,
        Shape::Rect { w, h } => w * h,
    }
}

fn main() {
    let s = Shape::Circle(1.0);
    println!("{}", area(&s));
}
~~~
要点：解构绑定名自定。陷阱：结构体字段名与绑定名要对上，或用 : 重命名。`),
    F('tb32', 'enum', 'if let 与 while let',
      R`只关心一种模式时，match 会不会太啰嗦？`,
      R`**if let** 只处理一种匹配，其余忽略（可加 else）；**while let** 只要模式匹配就继续循环。
是「简洁」与「穷尽性检查」的折中：多分支用 match，单模式用 if let。
~~~rust
fn main() {
    let v = Some(3);
    if let Some(x) = v {
        println!("有 {}", x);
    } else {
        println!("没有");
    }

    let mut stack = vec![1, 2, 3];
    while let Some(top) = stack.pop() {
        // 弹到空为止
    }
}
~~~
要点：if let 不强制穷尽。陷阱：本该多分支却全塞进 if let else if let——这时 match 更清晰。`),
    F('tb33', 'enum', '用枚举建模状态与消息',
      R`什么时候该优先用枚举而不是一堆布尔标志？`,
      R`当「多个互斥的状态或消息」在业务里轮转时，枚举比 bool 组合更不易写出非法状态；配合 match 强制处理每个分支，状态机更完整。
结构体表达「同时有哪些」，枚举表达「是其中哪一个」。
~~~rust
enum State {
    Idle,
    Running { progress: u8 },
    Done,
}

fn step(s: State) -> State {
    match s {
        State::Idle => State::Running { progress: 0 },
        State::Running { progress } if progress < 100 => {
            State::Running { progress: progress + 10 }
        }
        _ => State::Done,
    }
}

fn main() {
    let s = step(State::Idle);
    let _s = step(s);
}
~~~
要点：互斥状态优先枚举。陷阱：用多个 bool 表示状态机，会出现「同时既开又关」的非法组合。`),

    // ==================== 模块系统（第 7 章 Packages, Crates, and Modules） ====================
    F('tb34', 'mod', 'crate、模块与文件',
      R`包、crate、模块分别是哪一层？mod 怎么挂文件？`,
      R`**package**（Cargo.toml 管理）可含库 crate 与二进制 crate；**crate** 是编译单元（一棵模块树）；**模块**用 mod 组织作用域与可见性。
常见布局：src/main.rs（二进制根）或 src/lib.rs（库根），子模块可拆到同名文件或目录。
~~~rust
// src/main.rs
mod garden;          // 对应 src/garden.rs 或 src/garden/mod.rs

fn main() {
    // garden 模块挂进当前 crate 树
}
~~~
要点：crate 根 → 模块 → 条目。陷阱：mod 声明了文件却不存在，或重复声明同名模块——先对齐文件树。`),
    F('tb35', 'mod', '路径：绝对与相对',
      R`跨模块怎么引用函数或类型？self、super、crate 是什么？`,
      R`路径用双冒号分段。**crate** 从 crate 根起算（绝对），**self** 当前模块，**super** 父模块；也可 use 把路径引入当前作用域起短名。
把长路径抽成 use 后，代码读起来是短名，修路径只改一处。
~~~rust
mod front {
    pub fn host() {
        println!("host");
    }
}

mod back {
    pub fn work() {
        crate::front::host();   // 从 crate 根起算
    }
}

fn main() {
    use crate::front::host;     // 引入短名
    host();
    back::work();
}
~~~
要点：路径 + 可见性一起决定能不能到。陷阱：默认可见性是私有——没 pub 的条目外模块看不到。`),
    F('tb36', 'mod', '可见性 pub 与封装',
      R`默认谁能看见？pub 的作用域是全局公开吗？`,
      R`默认**私有**（父模块可见子，子看不见兄弟的私有项）。**pub** 公开；pub 的父级若私有，外层仍到不了——「可见性像光：看不穿没开门的房间」。
常用封装：结构体字段私有，暴露方法；用 pub use **重导出**，让外部用短路径而不关心内部文件布局。
~~~rust
mod secret {
    fn hidden() { println!("no"); }

    pub fn exposed() {
        hidden();          // 同模块内可以调
        println!("yes");
    }
}

fn main() {
    secret::exposed();
    // secret::hidden();   // 编译错误：私有
}
~~~
要点：对外最小公开面。陷阱：全 pub 会失去封装收益——先想外部真正需要什么。`),
    F('tb37', 'mod', 'use、别名与重导出',
      R`use 能起别名吗？怎么把内部路径重导出？`,
      R`use 引入路径；冲突时 **as 起别名**；嵌套用树状写法一次引入多个。**pub use** 可把深层条目提升到当前模块公开面——库的常用门面技巧。
标准库也常被 use 到短名，保持签名可读。
~~~rust
use std::collections::HashMap;
use std::fmt as core_fmt;          // 别名
use std::io::{self, Write};        // 树状引入

fn main() {
    let m = HashMap::new();
    let _ = m;
    let _ = core_fmt::format(format_args!(""));
}
~~~
要点：引入是为了可读。陷阱：过度 use * 会把一堆名字倒进作用域——优先具名引入。`),
    F('tb38', 'mod', '把项目拆成多文件',
      R`文件一大就该怎么拆？拆完怎么保证测试还在？`,
      R`按「领域」拆模块：每个概念一个 mod；单元测试常收在同文件的 tests 子模块（cfg(test)）。重构时先搬类型与 impl，再搬自由函数，最后修 use。
规则：一个模块只回答一个主题；循环依赖说明边界画错了。
~~~rust
// src/shapes.rs
pub struct Square { pub side: f64 }

impl Square {
    pub fn area(&self) -> f64 { self.side * self.side }
}

// src/main.rs
mod shapes;
use shapes::Square;

fn main() {
    let s = Square { side: 2.0 };
    println!("{}", s.area());
}
~~~
要点：模块边界 = 抽象边界。陷阱：拆文件后忘了 mod 声明或 pub——「文件在却用不了」最常见。`),

    // ==================== 常用集合（第 8 章 Common Collections） ====================
    F('tb39', 'coll', 'Vec 动态数组',
      R`Vec 怎么创建、增长、安全访问？`,
      R`**Vec** 是堆上可增长数组。创建：Vec::new() 或 **vec!** 宏；push 追加、pop 弹出；下标访问越界会 panic，**get** 返回 Option。
元素类型同一；整体移动/借用规则与其它值相同。
~~~rust
fn main() {
    let mut v = vec![1, 2, 3];   // 宏创建
    v.push(4);                   // 尾部追加
    let third = &v[2];           // 下标：可能 panic
    let maybe = v.get(2);        // Option：安全
    println!("{} {:?}", third, maybe);
}
~~~
要点：可能越界优先 get。陷阱：下标访问假设一定存在——用户输入下标时必踩坑。`),
    F('tb40', 'coll', 'String 与 UTF-8',
      R`String 怎么拼接与修改？为什么不能随便按字节切？`,
      R`**String** 是拥有所有权、UTF-8 编码的堆字符串。push_str / push 追加，+ 或 **format!** 拼接；内部是字节，字符（Unicode 标量）与字节下标不是一回事。
不能对 String 做 s[i] 字符下标——合法边界不在任意字节上。
~~~rust
fn main() {
    let mut s = String::from("hello");
    s.push_str(", world");            // 追加切片
    let s2 = s + "!";                 // s 被移动进运算
    let name = String::from("Ada");
    let hi = format!("hi {}", name);  // 不夺取所有权
    println!("{} {}", s2, hi);
}
~~~
要点：多段拼接优先 format!。陷阱：用 [i] 当字符下标，或按字节切开字符——都会踩 UTF-8。`),
    F('tb41', 'coll', 'String 与 &str 的分工',
      R`为什么函数参数常写 &str？String 字面量怎么选？`,
      R`String 拥有数据，**&str** 是切片视图。读接口收 **&str**（或泛型 AsRef）能同时接受字面量与 String 的借用；要长期持有再转 String。
字面量类型是 &'static str——整段程序期间有效。
~~~rust
fn greet(name: &str) {
    println!("hi {}", name);
}

fn main() {
    let owned = String::from("ada");
    greet("bo");              // 字面量
    greet(&owned);            // String 借成切片
    let keep: String = owned; // 需要持有再用 String
    greet(&keep);
}
~~~
要点：读用 &str，拥有用 String。陷阱：签名写死 &String，调用点会被迫 clone 或失败。`),
    F('tb42', 'coll', 'HashMap 与 entry API',
      R`HashMap 怎么查改？计数器怎么写才不啰嗦？`,
      R`**HashMap** 存键值对。get 返回 Option；insert 同键覆盖；**entry().or_insert()** 做「不存在则插入默认、存在则取出可变引用」——计数器经典写法。
所有权：把拥有的键值移入表内；要复用请借或克隆。
~~~rust
use std::collections::HashMap;

fn main() {
    let mut scores = HashMap::new();
    scores.insert(String::from("blue"), 10);

    let mut counts = HashMap::new();
    for word in ["apple", "apple", "pear"] {
        let e = counts.entry(word).or_insert(0); // 不存在则插 0
        *e += 1;                                // 原地自增
    }
    println!("{:?}", counts);
}
~~~
要点：更新默认值用 entry。陷阱：get 后直接 [key] 可能 panic；insert 同键会覆盖旧值。`),
    F('tb43', 'coll', '遍历集合与所有权选择',
      R`for 循环里怎么选借用还是拿走？`,
      R`for 循环默认会取得集合的**迭代器所有权**。要只读：**for x in &v**；要消费掉：for x in v（into_iter）；要改每个元素：&mut v。
键值表遍历常写成 (k, v) 元组模式。
~~~rust
use std::collections::HashMap;

fn main() {
    let v = vec![1, 2, 3];
    for x in &v {           // 借用遍历
        println!("{}", x);
    }
    let mut m = HashMap::new();
    m.insert("a", 1);
    for (k, val) in &m {
        println!("{}={}", k, val);
    }
}
~~~
要点：循环后还要用集合就不要 into。陷阱：for x in v 后再用 v——移动后失效。`),
    F('tb44', 'coll', '集合里的所有权与克隆',
      R`把 String 放进 Vec 或 HashMap 后还能用吗？`,
      R`集合**拥有**元素：把 String 塞进去时所有权移入，原变量失效。要保留原值可 clone（显式代价）或改存引用（必须写生命周期，集合活得比数据短）。
同理取出：remove/pop 拿出所有权；get 只是借用视图。
~~~rust
fn main() {
    let name = String::from("ada");
    let mut names = Vec::new();
    names.push(name.clone());   // 表内一份，外留一份
    println!("{}", name);

    let first = names.pop();    // Option<String>：取出所有权
    println!("{:?}", first);
}
~~~
要点：进集合默认转移。陷阱：以为 push 后原 String 还在——那是 C++ 习惯，Rust 要 clone 或借用。`),

    // ==================== 错误处理（第 9 章 Error Handling） ====================
    F('tb45', 'err', 'panic! 与不可恢复错误',
      R`什么时候该 panic？unwrap 算不算错误处理？`,
      R`**panic!** 标记**不可恢复**错误：不变量被破坏、程序无法按预期继续。可给消息；调试构建打印栈轨迹。
unwrap / expect 在 Err 或 None 时 panic——原型、测试、或「逻辑上不可能失败」处可用；库代码应把决策交给调用方。
~~~rust
fn main() {
    let v = vec![1, 2, 3];
    // panic::set_hook 可自定义，默认直接 panic
    let first = v.get(0).expect("向量应当非空");
    println!("{}", first);
}
~~~
要点：panic 面向开发者。陷阱：用户输入路径上 unwrap——等于把可控错误变成崩溃。`),
    F('tb46', 'err', 'Result 与可恢复错误',
      R`Result 怎么表示失败？必须 match 吗？`,
      R`**Result**  为 Ok(值) 或 Err(错误信息)——错误出现在签名里，编译器要求处理。可 match 穷尽、或用 unwrap_or / unwrap_or_else / map 等组合子先变换。
库函数「可能失败」就返回 Result，而不是 panic 或返回魔数。
~~~rust
use std::fs;
use std::io;

fn read_conf() -> Result<String, io::Error> {
    fs::read_to_string("config.toml")
}

fn main() {
    match read_conf() {
        Ok(text) => println!("{}", text.len()),
        Err(e) => eprintln!("读取失败: {}", e),
    }
}
~~~
要点：把失败类型写进函数签名。陷阱：用 bool/i32 哨兵值代替 Result——调用方容易忽略检查。`),
    F('tb47', 'err', '? 运算符：错误传播',
      R`问号运算符做什么？和手写 match 差在哪？`,
      R`表达式后加 **?**：Ok 则取出值继续，Err 则**立刻从当前函数返回**（可经 From 转成外层错误类型）。
一行替代「match 失败分支提前 return」的样板，让错误沿调用链向上冒泡，在合适的层恢复或报告。
~~~rust
use std::fs;
use std::io;

fn first_line(path: &str) -> Result<String, io::Error> {
    let text = fs::read_to_string(path)?;   // 失败即返回 Err
    Ok(text.lines().next().unwrap_or("").to_string())
}

fn main() {
    match first_line("Cargo.toml") {
        Ok(line) => println!("{}", line),
        Err(e) => eprintln!("{}", e),
    }
}
~~~
要点：? 只能用在返回 Result（或 Option，另见）的函数里。陷阱：main 返回 () 却在其中用 ?——把 main 也改成 Result。`),
    F('tb48', 'err', '何时 panic、何时 Result',
      R`两种错误模型怎么分工？`,
      R`**库代码**优先 **Result**：调用方决定恢复还是放弃；**panic** 留给「继续跑就是错误结果」的边界（越界、破坏不变量、双端契约被撕毁）。
调用方策略：可预期的失败（文件不存在、解析失败）用 Result；「这是 bug」用 expect 带上理由。
~~~rust
fn parse_port(s: &str) -> Result<u16, std::num::ParseIntError> {
    s.trim().parse()      // 可恢复：交给调用方
}

fn main() {
    match parse_port("8080") {
        Ok(p) => println!("{}", p),
        Err(_) => println!("端口无效，用默认"),
    }
    let ids = [1, 2, 3];
    let _ = ids.get(0).expect("刚定义的数组必非空"); // 不变量
}
~~~
要点：可恢复 → Result；不可恢复 → panic。陷阱：库内一言不合就 panic，把处理权剥夺给调用方。`),
    F('tb49', 'err', '自定义错误与 From 转换',
      R`项目里错误类型怎么组织？? 如何自动转错？`,
      R`定义**自己的错误枚举**（每变体一种失败模式），实现标准 Error/Display 相关 trait；为底层错误实现 **From**，让 **?** 自动转换到外层类型。
库对外暴露具体错误类型；应用最外层可再汇总用户可读消息。
~~~rust
use std::fmt;
use std::num::ParseIntError;

#[derive(Debug)]
enum AppError {
    Parse(ParseIntError),
    Missing,
}

impl fmt::Display for AppError {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            AppError::Parse(e) => write!(f, "解析失败: {}", e),
            AppError::Missing => write!(f, "缺少配置"),
        }
    }
}

impl From<ParseIntError> for AppError {
    fn from(e: ParseIntError) -> Self {
        AppError::Parse(e)   // ? 自动调用
    }
}

fn main() {
    let _: Result<(), AppError> = Ok(());
}
~~~
要点：From 是 ? 的转换桥。陷阱：错误类型只有 String——调用方无法可靠分支处理。`),

    // ==================== 泛型与生命周期（第 10 章 Generic Types, Traits, and Lifetimes） ====================
    F('tb50', 'gen', '泛型函数',
      R`怎么写「对多种类型都成立」的函数？`,
      R`函数名后尖括号里声明**类型参数**（惯例 T），参数与返回用 T 占位。调用时传入具体类型，编译器**单态化**生成专用代码——灵活且零成本。
类型参数可在签名中多次出现，表达「输入输出类型相关」。
~~~rust
fn largest<T: PartialOrd>(list: &[T]) -> &T {
    let mut best = &list[0];
    for item in &list[1..] {
        if item > best {
            best = item;
        }
    }
    best
}

fn main() {
    let nums = vec![3, 1, 4];
    println!("{}", largest(&nums));
}
~~~
要点：泛型统一重复逻辑。陷阱：不加约束就比较——编译器不知道 T 能比，需要 PartialOrd。`),
    F('tb51', 'gen', '泛型结构体与枚举',
      R`结构体/枚举的字段类型能不能参数化？`,
      R`在类型名后声明类型参数即可。标准库大量如此：Option 、Result、Point  、Vec 都是泛型。
impl 块要对应声明；同一类型可为不同 T 写不同 impl。
~~~rust
struct Point<T> {
    x: T,
    y: T,
}

impl<T> Point<T> {
    fn x(&self) -> &T { &self.x }
}

fn main() {
    let integer = Point { x: 5, y: 10 };
    let float = Point { x: 1.0, y: 4.0 };
    println!("{} {}", integer.x(), float.x());
}
~~~
要点：先抽象结构再参数化。陷阱：实例化时两字段类型不一致（x:i32,y:f64）——同一 T 约束会拒绝，需多参数或改设计。`),
    F('tb52', 'gen', 'trait 定义与实现',
      R`trait 是什么？怎么为类型实现共享行为？`,
      R`**trait** 定义「必须提供的方法集合」；**impl Trait for Type** 为具体类型实现。同一 trait 可被多类型实现，多类型获得同一接口。
孤儿规则：实现 trait 时，trait 或类型至少有一个在本 crate——避免破坏他人一致性。
~~~rust
trait Summary {
    fn summarize(&self) -> String;
}

struct Article {
    title: String,
}

impl Summary for Article {
    fn summarize(&self) -> String {
        format!("文章：{}", self.title)
    }
}

fn main() {
    let a = Article { title: String::from("Rust") };
    println!("{}", a.summarize());
}
~~~
要点：trait = 能力契约。陷阱：漏实现某个必需方法——编译器会列出缺失清单。`),
    F('tb53', 'gen', 'trait 约束与 impl Trait',
      R`怎么限制泛型「必须会什么」？参数怎么写「实现了某 trait 的类型」？`,
      R`泛型用 **T: Trait** 约束；参数也可直接写 **impl Trait**（语法糖，本质仍是泛型）。多约束用加号：T: Display + Clone。
约束失败在**调用处**暴露——类型不够格就是不够格。
~~~rust
use std::fmt::Display;

fn notify(item: &impl Display) {
    println!("注意：{}", item);
}

fn notify_generic<T: Display>(item: &T) {
    println!("注意：{}", item);
}

fn main() {
    notify(&"构建完成");
    notify_generic(&"测试通过");
}
~~~
要点：impl Trait 写起来短，需要复用 T 再写泛型形参。陷阱：约束过严（多写不必要的 trait）会把合法调用挡在门外。`),
    F('tb54', 'gen', '生命周期标注语法',
      R`生命周期是什么？'a 这种标注怎么读？`,
      R`生命周期描述**引用有效的范围**，防止悬垂。语法是撇号加名字（如 'a），是**借用关系的约束**，不是把生命变长或变短。
多数时候省略：编译器按省略规则推断；签名变得复杂时才显式写。
~~~rust
// x 与 y 的借用至少要活到返回值用完
fn longest<'a>(x: &'a str, y: &'a str) -> &'a str {
    if x.len() > y.len() { x } else { y }
}

fn main() {
    let r;
    let s1 = String::from("long");
    {
        let s2 = String::from("x");
        r = longest(s1.as_str(), s2.as_str());
        println!("{}", r);
    }
}
~~~
要点：标注表达「引用之间的合法关系」。陷阱：把 'a 理解成「优化提示」——它是安全契约。`),
    F('tb55', 'gen', '函数与结构体中的生命周期',
      R`返回引用时必写生命周期吗？结构体存引用呢？`,
      R`函数：**输入有引用、输出也是引用**时，必须让返回值与某些输入建立生命周期关系。结构体若含引用字段，**必须**标生命周期——保证实例不比数据活得久。
入门简化：尽量返回拥有的值（String、Vec），可少写很多 'a。
~~~rust
struct Excerpt<'a> {
    part: &'a str,
}

impl<'a> Excerpt<'a> {
    fn level(&self) -> i32 { 3 }
}

fn main() {
    let novel = String::from("Call me Ishmael.");
    let e = Excerpt { part: &novel[..5] };
    println!("{} {}", e.part, e.level());
}
~~~
要点：实例活不过它借用的数据。陷阱：结构体存 &str 不写 '——编译器直接拒绝。`),
    F('tb56', 'gen', '闭包：捕获环境的匿名函数',
      R`闭包怎么写？它和函数有什么不同？`,
      R`**闭包**用竖线列参数：|x| x + 1。可**捕获**环境变量（借用、可变借用或取走所有权），类型常可推断；可存入变量、传给 map/filter 等。
能写函数指针的地方也常能传闭包——迭代器适配器的黄金搭档。
~~~rust
fn main() {
    let factor = 3;
    let scale = |x: i32| x * factor;   // 捕获 factor
    println!("{}", scale(2));          // 6

    let nums = vec![1, 2, 3];
    let doubled: Vec<i32> = nums.iter().map(|x| x * 2).collect();
    println!("{:?}", doubled);
}
~~~
要点：闭包把「小段逻辑」当数据传。陷阱：捕获所有权后外层变量失效；需要多次调用优先借用捕获。`),
    F('tb57', 'gen', '迭代器与常用适配器',
      R`迭代器惰性吗？map 之后为什么还要 collect？`,
      R`迭代器**惰性**：创建不计算，消费才驱动。**适配器**（map、filter、enumerate、zip…）返回新迭代器；**消费者**（collect、sum、for、any…）触发执行。
链式表达数据流水线，编译后可与手写循环同等快（零成本抽象）。
~~~rust
fn main() {
    let v = vec![1, 2, 3, 4];
    let evens: Vec<i32> = v
        .iter()
        .filter(|x| *x % 2 == 0)   // 适配器：仍惰性
        .map(|x| x * 10)           // 适配器
        .collect();                // 消费者：才真正跑
    println!("{:?}", evens);
}
~~~
要点：适配器链 + 最后一个消费者。陷阱：只 map 不 collect 等于什么都没做——流水线没开阀。`),

    // ==================== 自动化测试（第 11 章 Writing Automated Tests） ====================
    F('tb58', 'test', '测试函数与断言宏',
      R`怎么写第一个单元测试？怎么跑？`,
      R`在测试函数上加 **#[test]**，用 **assert!** / **assert_eq!** / **assert_ne!** 做断言。**cargo test** 运行全部测试。
测试与代码同 crate；私有函数也能测——测试模块是内部的。
~~~rust
pub fn add(a: i32, b: i32) -> i32 {
    a + b
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn adds() {
        assert_eq!(add(2, 3), 5);   // 相等断言，失败打印两侧
    }
}
~~~
要点：cargo test 一键回归。陷阱：测试名不含意义、断言过宽——失败时不知道哪里坏。`),
    F('tb59', 'test', 'should_panic 与 Result 测试',
      R`怎么测「应当失败/应当崩溃」的路径？`,
      R`期望 panic 的测试加 **#[should_panic]**（可限定 expected 消息）。测试函数也可返回 **Result**：用 ? 传播，Err 即测试失败——适合「失败也是返回值」的 API。
两种风格按被测代码选：panic 型用 should_panic，Result 型用 ?。
~~~rust
fn parse_age(s: &str) -> Result<u32, String> {
    s.trim().parse().map_err(|_| String::from("不是数字"))
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn bad_input() -> Result<(), String> {
        parse_age("x")?;
        // 到这里说明没失败——测试应失败
        Err(String::from("本应解析失败"))
    }

    #[test]
    #[should_panic(expected = "必需")]
    fn must_panic() {
        panic!("缺少必需配置");
    }
}
~~~
要点：错误路径也要测。陷阱：should_panic 太宽——中间别的 panic 也会让测试假通过。`),
    F('tb60', 'test', '测试组织与过滤运行',
      R`单元测试放哪？怎么只跑一个？集成测试呢？`,
      R`单元测试：同文件 **#[cfg(test)] mod tests**（仅测试构建包含）。集成测试：tests/ 目录，每文件像外部用户一样只调公开 API。
cargo test 名字过滤只跑匹配项；cargo test -- --nocapture 可看打印输出。
~~~rust
// 运行示例（概念）：
// cargo test add          # 只跑名字含 add 的
// cargo test -- --nocapture
// tests/integration.rs    # 集成测试：use 你的库 crate
fn main() {}
~~~
要点：单元测内部细节，集成测公共契约。陷阱：集成测试需要库 crate——只有 src/main.rs 时要先抽出 lib。`),
    F('tb61', 'test', '测试驱动的重构习惯',
      R`有了测试就随便改吗？TDD 节奏是什么？`,
      R`常见节奏：**红**（写失败测试）→ **绿**（最小实现通过）→ **重构**（在测试保护下改结构）。测试是安全网，不是事后补票。
优先覆盖：核心不变量、曾经修过的 bug、边界输入。
~~~rust
pub fn clamp01(x: f64) -> f64 {
    if x < 0.0 {
        0.0
    } else if x > 1.0 {
        1.0
    } else {
        x
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    #[test]
    fn edges() {
        assert_eq!(clamp01(-1.0), 0.0);
        assert_eq!(clamp01(0.5), 0.5);
        assert_eq!(clamp01(2.0), 1.0);
    }
}
~~~
要点：先锁行为再改实现。陷阱：只测 happy path——边界与错误分支仍是盲区。`),

    // ==================== 智能指针（第 15 章 Smart Pointers） ====================
    F('tb62', 'smart', 'Box 与堆分配',
      R`Box 什么时候用？递归类型为什么需要它？`,
      R`**Box** 把数据放上堆，指针留在栈——编译期大小已知。适合：递归类型（如链表节点含 Box 自身）、大对象转移、特化 trait 对象。
释放：Box 离开作用域自动 drop，仍归所有权系统管。
~~~rust
enum List {
    Cons(i32, Box<List>),   // 堆上才能定大小
    Nil,
}

fn main() {
    let list = List::Cons(1, Box::new(List::Nil));
    let boxed = Box::new(5);   // 5 在堆上
    println!("{}", boxed);
    let _ = list;
}
~~~
要点：需要堆或稳定大小时 Box。陷阱：链表节点直接内嵌自身——无限大小，编译不过。`),
    F('tb63', 'smart', 'Deref 与解引用强制转换',
      R`为什么 &Box 或 &String 可以当 &T / &str 用？`,
      R`实现 **Deref** 的智能指针可像引用一样用星号读内部；编译器还会做**解引用强制转换**（如 &String → &str），减少手动写星号与类型转换。
这是 Box/String/Vec 能无缝当切片用的机制。
~~~rust
fn show(s: &str) {
    println!("{}", s);
}

fn main() {
    let owned = String::from("hi");
    show(&owned);          // &String 强制成 &str
    let b = Box::new(5);
    assert_eq!(*b, 5);     // 显式解引用
}
~~~
要点：智能指针尽量透明。陷阱：滥用星号拷贝大结构——应继续走引用。`),
    F('tb64', 'smart', 'Drop 与运行时清理',
      R`怎么在值被销毁时做自定义清理？能不能提前释放？`,
      R`实现 **Drop** 的类型在离开作用域时自动跑 drop 方法——清理逻辑写进类型。需要提前释放用 **std::mem::drop**（把值移出作用域），不能只调 x.drop()。
顺序：后声明的先 drop。
~~~rust
struct Conn;

impl Drop for Conn {
    fn drop(&mut self) {
        println!("close");
    }
}

fn main() {
    let c = Conn;
    println!("工作...");
    drop(c);          // 提前关闭
    println!("结束");
}
~~~
要点：资源回收跟所有权走。陷阱：手动再调 drop 方法——所有权语义被破坏，编译器拒绝。`),
    F('tb65', 'smart', 'Rc 引用计数共享所有权',
      R`多个所有者时怎么办？Rc 何时释放？`,
      R`**Rc** 允许多个所有者共享一份数据，引用计数到零才释放。clone 是增加计数（浅共享，非深拷贝）。仅单线程；用 **Rc::strong_count** 观察计数。
图结构、多父节点等场景常用；要可变内部配合 RefCell。
~~~rust
use std::rc::Rc;

fn main() {
    let a = Rc::new(String::from("shared"));
    let b = Rc::clone(&a);      // 计数 +1
    println!("{} {}", a, b);
    println!("count = {}", Rc::strong_count(&a)); // 2
}
~~~
要点：共享所有者用 Rc。陷阱：Rc 不是线程安全计数——多线程要 Arc；循环引用会计数永不归零。`),
    F('tb66', 'smart', 'RefCell 与内部可变性',
      R`不可变引用外面怎么改内部？规则在什么时候检查？`,
      R`**RefCell** 把借用检查推迟到**运行时**：借用违规不是编译错误而是 panic。配合 Rc 可在共享时改内部（内部可变性）。
遵守动态规则：同时只能一个 borrow_mut，或多个 borrow——与编译期规则精神一致。
~~~rust
use std::cell::RefCell;

fn main() {
    let data = RefCell::new(vec![1]);
    data.borrow_mut().push(2);    // 动态可变借用
    println!("{:?}", data.borrow());
}
~~~
要点：内部可变性是逃生舱。陷阱：运行时 borrow 冲突直接 panic——比编译错误更晚、更贵。`),

    // ==================== 并发入门（第 16 章 Fearless Concurrency） ====================
    F('tb67', 'conc', '线程与 thread::spawn',
      R`怎么开新线程？主线程结束会怎样？`,
      R`**thread::spawn** 启动新线程，返回 JoinHandle；**join** 等待结束。主线程结束，其它线程会被杀——长任务要 join 或把句柄收好。
闭包 move 可把所有权移进线程，避免数据竞争。
~~~rust
use std::thread;

fn main() {
    let handle = thread::spawn(|| {
        let mut n = 0;
        for _ in 0..5 {
            n += 1;
        }
        n
    });
    println!("主线程在干活");
    println!("子线程结果 = {}", handle.join().unwrap());
}
~~~
要点：spawn + join 是最小并发。陷阱：不 join 就退出——子线程可能半路被掐。`),
    F('tb68', 'conc', '消息传递 mpsc',
      R`线程之间怎么安全传数据？`,
      R`标准库 **mpsc**（多生产者、单消费者）通道：**send** 发送、**recv** 接收；所有权随消息移入通道，天然避免共享可变。
发送端全丢弃后 recv 返回 Err——可用作「结束」信号。
~~~rust
use std::sync::mpsc;
use std::thread;

fn main() {
    let (tx, rx) = mpsc::channel();
    thread::spawn(move || {
        tx.send(String::from("job done")).unwrap();
    });
    println!("got: {}", rx.recv().unwrap());
}
~~~
要点：以通信传数据优先于共享状态。陷阱：在多处持有接收端会混乱——mpsc 只有一个消费者。`),
    F('tb69', 'conc', 'Mutex 共享状态',
      R`多线程要改同一份数据怎么办？`,
      R`**Mutex** 互斥锁：**lock** 拿到守卫后才能读写，作用域结束自动释放。多线程共享 Mutex 用 **Arc** 包裹（线程安全引用计数）。
忘记「守卫」只是锁的门卡：要改数据，得通过守卫解引用。
~~~rust
use std::sync::{Arc, Mutex};
use std::thread;

fn main() {
    let counter = Arc::new(Mutex::new(0));
    let mut handles = vec![];
    for _ in 0..4 {
        let c = Arc::clone(&counter);
        handles.push(thread::spawn(move || {
            *c.lock().unwrap() += 1;
        }));
    }
    for h in handles { h.join().unwrap(); }
    println!("{}", *counter.lock().unwrap());
}
~~~
要点：Arc + Mutex 是共享可变标准配对。陷阱：持锁调用慢函数或再 lock——易死锁；Rc 不能跨线程。`),
    F('tb70', 'conc', 'Send 与 Sync 标记',
      R`编译器怎么知道类型能不能跨线程？`,
      R`**Send**：所有权可转移到其它线程；**Sync**：可通过共享引用安全地给多线程用。它们多是自动推导的标记 trait。
反例：Rc 非 Send/Sync，故不能跨线程；RefCell 也不能随意跨线程共享。
~~~rust
use std::thread;

fn main() {
    let data = vec![1, 2, 3];   // Vec 可 Send
    thread::spawn(move || {
        println!("{:?}", data); // 所有权进线程
    }).join().unwrap();
}
~~~
要点：跨线程先问 Send/Sync。陷阱：把非线程安全包装塞进 Arc——有的类型根本不满足，编译器会拒绝。`),
    F('tb71', 'conc', '并发与所有权协作',
      R`「无畏并发」靠什么成立？数据竞争为什么到不了运行时？`,
      R`并发安全的底座仍是**所有权 + 类型系统**：要么唯一可变所有者，要么不可变共享，要么 Mutex 序列化访问；Send/Sync 把跨线程规则写进类型。
经典三类问题：数据竞争、死锁、逻辑竞态——前两类由类型/锁大幅压制，第三类仍要设计（顺序、幂等）。
~~~rust
use std::thread;

fn main() {
    let mut data = vec![1];
    let h = thread::spawn(move || {
        data.push(2);          // data 的所有权已在线程内
    });
    // 这里再用 data 会编译失败——真正的数据竞争在写法上就被禁止
    h.join().unwrap();
}
~~~
要点：把并发问题尽量提前到编译期。陷阱：用 unsafe 或全局可变绕过检查——安全网是自己关掉的。`)
  ];

  const META = {
    tb01: [4, '安装·rustup'],
    tb02: [5, '工具·cargo'],
    tb03: [5, '语法·println'],
    tb04: [3, '项目·猜数字'],
    tb05: [5, '语法·读输入'],
    tb06: [4, '语法·Ordering match'],
    tb07: [5, '语法·let mut'],
    tb08: [3, '语法·const static'],
    tb09: [4, '概念·遮蔽'],
    tb10: [4, '概念·标量复合'],
    tb11: [5, '语法·函数'],
    tb12: [4, '概念·语句表达式'],
    tb13: [4, '语法·if 表达式'],
    tb14: [5, '语法·循环'],
    tb15: [5, '概念·所有权三规则'],
    tb16: [5, '概念·移动'],
    tb17: [5, '概念·Copy Clone'],
    tb18: [5, '规则·传参所有权'],
    tb19: [5, '概念·引用借用'],
    tb20: [5, '规则·可变引用'],
    tb21: [4, '概念·悬垂引用'],
    tb22: [5, '概念·切片'],
    tb23: [5, '语法·结构体'],
    tb24: [3, '语法·元组结构体'],
    tb25: [5, '语法·方法关联函数'],
    tb26: [4, '概念·结构体所有权'],
    tb27: [3, '概念·组织数据'],
    tb28: [5, '概念·枚举 ADT'],
    tb29: [5, '概念·Option'],
    tb30: [5, '语法·match 穷尽'],
    tb31: [4, '语法·match 解构'],
    tb32: [4, '语法·if let'],
    tb33: [3, '概念·状态建模'],
    tb34: [4, '概念·crate 模块'],
    tb35: [4, '语法·路径'],
    tb36: [5, '规则·pub 可见性'],
    tb37: [4, '语法·use 别名'],
    tb38: [3, '规则·多文件'],
    tb39: [5, '语法·Vec'],
    tb40: [5, '语法·String'],
    tb41: [5, '概念·String str'],
    tb42: [5, '语法·HashMap'],
    tb43: [4, '语法·遍历集合'],
    tb44: [4, '规则·集合所有权'],
    tb45: [4, '语法·panic'],
    tb46: [5, '概念·Result'],
    tb47: [5, '语法·问号运算符'],
    tb48: [5, '规则·panic vs Result'],
    tb49: [3, '语法·自定义错误'],
    tb50: [5, '语法·泛型函数'],
    tb51: [4, '语法·泛型类型'],
    tb52: [5, '概念·trait'],
    tb53: [5, '语法·trait 约束'],
    tb54: [5, '概念·生命周期'],
    tb55: [4, '语法·生命周期标注'],
    tb56: [5, '语法·闭包'],
    tb57: [5, '语法·迭代器'],
    tb58: [5, '语法·单元测试'],
    tb59: [4, '语法·should_panic'],
    tb60: [4, '概念·测试组织'],
    tb61: [3, '规则·TDD 习惯'],
    tb62: [5, '概念·Box'],
    tb63: [3, '概念·Deref'],
    tb64: [3, '概念·Drop'],
    tb65: [4, '概念·Rc'],
    tb66: [4, '概念·RefCell'],
    tb67: [5, '语法·线程'],
    tb68: [5, '语法·mpsc'],
    tb69: [5, '语法·Mutex'],
    tb70: [4, '概念·Send Sync'],
    tb71: [4, '概念·无畏并发']
  };

  const PITFALL = {
    tb05: R`输入字符串不 trim 就 parse，末尾换行会导致解析失败——读完先去掉首尾空白。`,
    tb07: R`默认不可变：忘了 mut 就赋值是编译错误，不是运行时问题——先想清楚这个值该不该变。`,
    tb09: R`遮蔽不是修改：内层块的遮蔽出块即失效；要长期可变请用 mut 而不是层层 let。`,
    tb12: R`返回值表达式多写一个分号会变成语句，函数返回类型会塌成空——最后一步别顺手加分号。`,
    tb16: R`堆上数据赋值即移动，旧变量失效——要两份独立数据请显式 clone，别指望浅共享。`,
    tb20: R`可变引用排他：同一时刻只有一个 &mut，且不能与 & 并存——数据竞争在编译期就拒绝。`,
    tb22: R`切片不能比被借数据活得久；String 与 &str 类型不同，函数签名写错会处处不兼容。`,
    tb25: R`方法第一个参数忘写 self 会变成关联函数——只能用类型路径调用，实例点语法无效。`,
    tb29: R`Option 上无脑 unwrap——遇到 None 直接 panic；要么 match，要么给默认值。`,
    tb30: R`match 必须穷尽：靠 _ 兜底可以，但放太早会吞掉本想显式处理的分支。`,
    tb39: R`下标访问假定一定存在，越界即 panic——用户提供的下标请用 get。`,
    tb40: R`String 是 UTF-8 字节序列，不能按字符下标随机访问；用 chars()/bytes() 明确单位。`,
    tb42: R`HashMap 同键 insert 会覆盖；计数用 entry().or_insert()，别先 get 再 insert 写双倍逻辑。`,
    tb47: R`? 只能用在返回 Result（或 Option）的函数里；main 也要改成 Result 才能用问号。`,
    tb48: R`库代码一言不合就 panic 会剥夺调用方选择权——可恢复失败请返回 Result。`,
    tb54: R`生命周期是引用之间的安全契约，不是性能提示——返回引用就想清楚数据谁活更久。`,
    tb56: R`闭包 move 会夺走捕获变量的所有权，外层就不能再用；共享优先借用捕获。`,
    tb57: R`迭代器适配器是惰性的：只 map 不消费等于没跑——记得 collect 或 for。`,
    tb62: R`递归类型必须 Box 等间接层，否则类型无限大小；Box 释放仍归所有权系统。`,
    tb65: R`Rc 仅单线程且循环引用会让计数永不归零；多线程用 Arc，环形结构要 Weak。`,
    tb69: R`Arc 配 Mutex，Rc 不能跨线程；持锁别做慢操作或再抢同一把锁——防死锁。`
  };

  // —— 帮助栏目文章（检索用，不参与学习调度）——
  const HELP = [
    { id: 'rh01', title: 'Rust 适合做什么', body: R`**系统级编译语言**，两大承诺：**内存安全**（编译期杜绝悬垂指针、双重释放、数据竞争）与**零成本抽象**（高级写法不损失性能）。
场景：系统工具、命令行程序、WebAssembly、嵌入式、性能敏感后端；连续多年「最受喜爱语言」前列。
诚实预告：**所有权**是最大关卡，几乎所有人一开始都会被编译器拒绝——但报错是教科书级的，本卡组按 The Book 主线陪你过这一关。` },
    { id: 'rh02', title: '安装 rustup：一行命令全套', body: R`官方安装器 **rustup** 一套装齐 rustc + cargo + 标准库；Windows 下载 rustup-init，macOS / Linux 走官方脚本。
验证：终端敲 **cargo --version** 与 rustc --version，都出版本号即成功。
升级一条命令：rustup update——Rust 六周一版，工具链升级很省心。` },
    { id: 'rh03', title: '第一个项目：cargo new 到 cargo run', body: R`**cargo new hello** 生成项目（Cargo.toml + src/main.rs）→ 进入目录敲 **cargo run**——编译加运行一步到位。
main 是入口，println! 负责输出（带感叹号——宏的标志）。
注意：默认建的是「项目」而非单个文件——Rust 从第一天就是工程化姿势。` },
    { id: 'rh04', title: '怎么读 rustc 报错', body: R`Rust 报错是**三段式教学**：① 错误是什么（精确行号与高亮）；② **为什么**（背后的规则，如「值在这里被移动了」）；③ **怎么改**（常带可抄的修复建议）。
心法：**把编译器当老师不当拦路虎**——它拒绝你，是因为这段代码在运行时真的会出事。
看不懂时先读 suggestion，再回头读规则解释。` },
    { id: 'rh05', title: '文档注释与 cargo doc', body: R`普通注释 //（行）与块注释；Rust 特色是**文档注释 ///**——写在项目符号上方，cargo doc 自动生成 HTML 文档站。
公开 API 写文档注释（含可运行示例）是社区惯例；测试里还能直接跑文档示例。
「文档即代码的一部分」——这是 Rust 工程文化的入口。` },
    { id: 'rh06', title: '工具链：rust-analyzer 与 clippy', body: R`**rust-analyzer**：编辑器智能（补全、类型提示、行内报错）——VS Code 装 Rust 扩展即可，**第一优先级**。
**clippy**：官方 lint（cargo clippy），大量「更地道写法」建议；**rustfmt**：统一格式（cargo fmt）。
测试与文档都是内置的——入门阶段不用拼第三方全家桶。` },
    { id: 'rh07', title: 'Cargo.toml 与 crates.io', body: R`**Cargo.toml** 是项目清单：包名、版本、依赖；cargo add 包名即可从 **crates.io**（中央仓库）拉库并写进清单。
依赖解析结果锁在 Cargo.lock——保证「你机器能编过，我机器也能」。
文档入口：doc.rust-lang.org 标准库 + docs.rs 各第三方 crate。` },
    { id: 'rh08', title: '按 The Book 学：路径与节奏', body: R`主干顺序：入门起步 → 通用概念 → **所有权（最大关卡）** → 结构体/枚举模式匹配 → 模块与集合 → 错误处理 → 泛型 trait 生命周期 → 测试 → 智能指针 → 并发入门。
节奏参考：每天 10 张卡 + 每周一个小工具（猜数字增强版、todo CLI、简化 grep）。
心态：前两周被借用检查器拒绝是所有人的常态——坚持过所有权章，后面一马平川。` }
  ];

  const BEGINNER = ['start', 'base'];
  return { BEGINNER: BEGINNER, id: 'rust', name: 'Rust', short: 'Rust', icon: '🦀', kind: 'qa', group: 'skill', CATS: CATS, DATA: DATA, META: META, HELP: HELP, REL: {}, PITFALL: PITFALL, MNEM: {}, ORDER: ['start', 'base', 'own', 'struct', 'enum', 'mod', 'coll', 'err', 'gen', 'test', 'smart', 'conc'] };
})();
