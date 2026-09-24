/*
 * C++ · 知识点记忆数据库
 * 教材锚点：C++ Primer（入门主干）
 * 章序：Getting Started / 变量与基本类型 / 字符串向量数组 / 表达式语句函数 /
 *       类 / 动态内存拷贝控制 / 泛型与 STL 入门 / 现代 C++ 必备
 * 结构：id / cat / title / front / back + META / PITFALL / HELP / BEGINNER
 * 背面三段式：概念定义 → ~~~cpp 最小可运行示例（含教学注释）→ 要点/陷阱
 * 说明：无例题学科；kind: 'qa' 驱动 UI 适配。
 * 进度策略：整科重置——新 id pr01 起连续编号，旧 id 全部替换，学习进度从零。
 * 范本：data/clang.js / data/js.js（Wave1 教材化）；卡面约定 docs/DATA_SCHEMA.md
 */
window.SUBJECTS = window.SUBJECTS || {};
window.SUBJECTS.cppl = (function () {
  'use strict';
  const R = String.raw;

  const CATS = {
    start: '入门起步',
    types: '变量与基本类型',
    seq: '字符串向量数组',
    expr: '表达式语句函数',
    cls: '类',
    mem: '动态内存拷贝控制',
    stl: '泛型与 STL 入门',
    modern: '现代 C++ 必备'
  };

  const F = (id, cat, title, front, back) => ({ id, cat, title, front, back });

  const DATA = [
    // ==================== Getting Started 入门起步 ====================
    F('pr01', 'start', '第一个程序',
      R`怎么写最简单的 C++ 程序？它由哪些部分组成？`,
      R`**C++ 程序**从 main 函数开始执行，用标准库的 cout 向屏幕输出，返回 0 表示成功。
~~~cpp
#include <iostream>   // 引入输入输出流头文件

int main()            // 程序入口，有且仅有一个
{
    std::cout << "hello, world" << std::endl;  // 输出一行
    return 0;                                  // 返回 0 表示成功
}
~~~
编译运行：g++ hello.cpp -o hello，再执行得到的可执行文件。要点：语句以分号结尾、块用花括号包裹。陷阱：漏分号或花括号会编译失败——先修第一个报错。`),
    F('pr02', 'start', '输入输出流初体验',
      R`怎么向屏幕打印、从键盘读入？和 C 的 printf 比有何不同？`,
      R`**iostream 库**提供 cin（标准输入）与 cout（标准输出）：用插入运算符写出、抽取运算符读入，自动识别类型。
~~~cpp
#include <iostream>

int main()
{
    int n = 0;
    std::cout << "输入一个整数: ";   // 提示用户
    std::cin >> n;                   // 从键盘读入整数
    std::cout << "你输入了 " << n << std::endl;
    return 0;
}
~~~
要点：endl 会换行并刷新缓冲。陷阱：往整数变量里输入字母会让流进入失败态，后续读取全部跳过——先检查输入。`),
    F('pr03', 'start', '注释与程序骨架',
      R`注释怎么写？一个完整的 C++ 文件长什么样？`,
      R`**注释**有两种：单行以两斜杠开头，多行用斜杠星号包裹（不可嵌套）。骨架自上而下：包含头文件、定义函数、写 main。
~~~cpp
#include <iostream>

// 温度换算：演示文件骨架
int fahr_to_c(int f);   // 函数声明（原型）

int main()
{
    std::cout << fahr_to_c(212) << std::endl;
    return 0;
}

int fahr_to_c(int f)    // 函数定义
{
    return 5 * (f - 32) / 9;
}
~~~
要点：注释解释「为什么」，不复述代码。陷阱：多行注释里再开一对注释会提前结束，把后面的代码注没。`),
    F('pr04', 'start', '初识控制流：if 与 while',
      R`怎么按条件分支、怎么重复执行一段代码？`,
      R`**if** 在条件为真时执行语句，可带 else；**while** 在条件为真时反复执行循环体。
~~~cpp
#include <iostream>

int main()
{
    int n = 0, sum = 0;
    std::cin >> n;
    if (n > 0) {           // 条件为真则进块
        sum = n;
    } else {
        sum = -n;          // 否则走这里
    }
    while (sum > 0) {      // 条件为真就继续
        --sum;
    }
    std::cout << sum << std::endl;
    return 0;
}
~~~
要点：条件用圆括号包裹；循环体多于一句必须加花括号。陷阱：while 条件写错会死循环或一次也不进——先用最小数据试跑。`),
    F('pr05', 'start', 'for 循环入门',
      R`想把一段代码重复固定次数，最紧凑的写法是什么？`,
      R`**for 语句**把「初始化、条件、步进」写在同一行，适合计数循环。
~~~cpp
#include <iostream>

int main()
{
    for (int i = 0; i < 5; ++i) {   // i 从 0 数到 4
        std::cout << i << " ";
    }
    std::cout << std::endl;
    return 0;
}
~~~
要点：条件在每次迭代前检查，为假则退出；步进常用前置递增。陷阱：写成小于等于会多跑一次，数组越界常由此而来。`),
    F('pr06', 'start', '类类型初体验',
      R`C++ 的「类」是什么？还没学定义时怎么先用起来？`,
      R`**类**是一种自定义类型，把数据和操作绑在一起；标准库的 string、vector 都是类。我们先学会「当作现成类型来用」。
~~~cpp
#include <iostream>
#include <string>

int main()
{
    std::string name;          // 类类型变量（对象）
    name = "Ada";              // 赋值
    std::cout << name.size()   // 调用成员函数：求长度
              << std::endl;
    return 0;
}
~~~
要点：点运算符访问成员；成员函数写在对象名后面圆括号里调用。陷阱：类的完整定义（怎么造）在「类」章——此处先会用接口。`),
    F('pr07', 'start', '标准库与命名空间',
      R`std:: 是什么？名字前面为什么总要加前缀？`,
      R`**命名空间**把名字分区，避免冲突；标准库的名字都在 **std** 里，用双冒号限定。
~~~cpp
#include <iostream>
#include <string>

int main()
{
    // 等价写法之一：逐个引入（比整体引入更可控）
    using std::cout;
    using std::endl;

    std::string s = "hi";   // string 仍写 std:: 前缀
    cout << s << endl;
    return 0;
}
~~~
要点：std::cout 表示「std 里的 cout」。陷阱：头文件里写 using namespace std 会污染所有包含者——练习可图省事，正式代码禁止。`),
    F('pr08', 'start', '从源码到可执行文件',
      R`写完代码到跑起来，中间发生了什么？编译报错怎么读？`,
      R`C++ 是**编译型**语言：预处理展开头文件 → 编译成目标文件 → 链接成可执行文件。改代码必须重新编译。
~~~cpp
// 终端两步（示意，非源码）
// g++ main.cpp -o main
// ./main
#include <iostream>

int main()
{
    std::cout << "ok" << std::endl;
    return 0;
}
~~~
要点：报错格式是文件、行号、说明——先修第一个 error。陷阱：链接错误（找不到 main 或重复定义）与编译错误是两类问题，读报错标题即可区分。`),

    // ==================== 变量与基本类型 ====================
    F('pr09', 'types', '基本内置类型',
      R`整数、浮点、字符各有哪些常用类型？怎么选？`,
      R`内置类型：**bool**、**char**、**int**、**long long**、**float**、**double** 等。默认整数写 int，浮点写 double。
~~~cpp
#include <iostream>

int main()
{
    bool ok = true;         // 真假
    char ch = 'A';          // 单个字符
    int n = 42;             // 整数
    long long big = 10000000000LL;  // 更大的整数
    double x = 3.14;        // 双精度浮点
    std::cout << n << " " << x << std::endl;
    return 0;
}
~~~
要点：浮点默认 double——float 精度常不够。陷阱：整数相除会丢掉小数部分；除零是未定义行为。`),
    F('pr10', 'types', '变量定义与初始化',
      R`怎么定义变量？初始化方式有哪些讲究？`,
      R`**定义**分配对象并起名；推荐**初始化**再使用。现代写法偏好花括号统一初始化——禁止窄化（会丢精度就报错）。
~~~cpp
#include <iostream>

int main()
{
    int a = 0;        // 拷贝初始化
    int b{1};         // 列表初始化（推荐）
    int c(2);         // 直接初始化
    double x = 3.14;
    // int bad{x};    // 编译错误：double 到 int 是窄化
    std::cout << a << b << c << x << std::endl;
    return 0;
}
~~~
要点：一行可定义多个同类型变量；初始化与赋值不是一回事。陷阱：未初始化的局部变量值是垃圾——读它是未定义行为。`),
    F('pr11', 'types', '标识符与作用域入门',
      R`变量名有什么规矩？内层和外层同名会怎样？`,
      R`名字由字母、数字、下划线组成，不能以数字开头；**作用域**决定名字可见范围，内层块可遮蔽外层同名。
~~~cpp
#include <iostream>

int main()
{
    int count = 0;       // 外层
    {
        int count = 99;  // 内层遮蔽外层
        std::cout << count << std::endl;  // 99
    }
    std::cout << count << std::endl;      // 0
    return 0;
}
~~~
要点：习惯小写加下划线或驼峰，风格统一即可。陷阱：遮蔽后容易看错「到底用的哪个」——同名不同层少用。`),
    F('pr12', 'types', '复合类型：引用',
      R`引用是什么？和「给变量起别名」有何关系？`,
      R`**引用**是对象的别名：必须初始化，绑定后**不可改绑**，使用时与原变量同名使用（无需特殊符号）。
~~~cpp
#include <iostream>

int main()
{
    int n = 42;
    int &r = n;      // r 是 n 的引用（别名）
    r = 0;           // 改 r 就是改 n
    std::cout << n << std::endl;  // 0
    return 0;
}
~~~
要点：没有空引用；函数传引用可「改外面的变量」或避免大对象拷贝。陷阱：不可返回局部变量的引用——作用域结束就悬空。`),
    F('pr13', 'types', '复合类型：指针',
      R`指针存的是什么？怎么读写它指向的对象？`,
      R`**指针**存对象的地址：取地址用与符号，解引用用星号；指针可以为空、可以改指向。
~~~cpp
#include <iostream>

int main()
{
    int n = 42;
    int *p = &n;     // p 指向 n
    *p = 0;          // 通过指针改 n
    std::cout << n << std::endl;  // 0
    int *q = nullptr;             // 空指针
    if (q) { std::cout << "有"; } // 不会进：空指针为假
    return 0;
}
~~~
要点：解引用前必须确认非空且有效。陷阱：未初始化指针或已销毁对象的指针（悬空指针）解引用是未定义行为。`),
    F('pr14', 'types', 'const 限定符',
      R`const 变量为什么不能改？const 与指针怎么组合？`,
      R`**const** 承诺不修改——定义后必须初始化。指针组合两口诀：const 在星号左是「指向常量」（值不能改），在星号右是「常量指针」（指向不能改）。
~~~cpp
#include <iostream>

int main()
{
    const int n = 42;       // n 不能改
    int x = 1, y = 2;
    const int *p = &x;      // 不能通过 p 改值
    int *const q = &x;      // q 不能改指向
    // *p = 0;              // 非法
    q = &y;                 // 非法：q 是常量指针
    *q = 3;                 // 合法
    std::cout << n << x << std::endl;
    return 0;
}
~~~
要点：读指针声明从右往左念。陷阱：const 对象只能传给 const 引用/指针——否则编译器拒绝，防止被改坏。`),
    F('pr15', 'types', '类型别名与 auto',
      R`类型名太长怎么起短名？怎么让编译器推导类型？`,
      R`**using** 给类型起别名；**auto** 从初始化表达式推导类型（忽略顶层 const 与引用）。
~~~cpp
#include <iostream>
#include <string>

int main()
{
    using Score = double;     // 类型别名
    Score s = 99.5;
    std::string name = "Ada";
    auto len = name.size();   // 推导为 size_type（整数族）
    auto &r = name;           // 要引用必须显式写
    r = "Bob";
    std::cout << s << name << len << std::endl;
    return 0;
}
~~~
要点：auto 让迭代器与长类型名变短、变好写。陷阱：推导结果「到底是什么」不直观时，优先写清类型。`),
    F('pr16', 'types', 'constexpr 与字面量',
      R`什么是常量表达式？constexpr 好在哪？`,
      R`**常量表达式**在编译期就能求值；**constexpr** 声明「编译期常量」或「编译期可求值的函数」，比 const 更强的承诺。
~~~cpp
#include <iostream>

constexpr int square(int x) { return x * x; }  // 编译期可求值

int main()
{
    constexpr int N = 10;           // 编译期常量
    int arr[square(3)];             // 长度在编译期确定
    constexpr int M = square(N);    // 编译期算出 100
    std::cout << N << M << sizeof(arr) << std::endl;
    return 0;
}
~~~
要点：数组长度、模板非类型参数等场景需要编译期常量。陷阱：constexpr 函数体受限（主要是 return）；不是所有 const 都是 constexpr。`),
    F('pr17', 'types', '自定义简单结构体',
      R`想把几个相关数据捆成一个类型，最小写法是什么？`,
      R`**struct** 定义聚合类型：花括号里声明数据成员；用点运算符访问。这是「自定义数据结构」的起点。
~~~cpp
#include <iostream>
#include <string>

struct Person          // 定义一种新类型
{
    std::string name;  // 数据成员
    int age;
};

int main()
{
    Person p{"Ada", 18};   // 聚合初始化
    std::cout << p.name << " " << p.age << std::endl;
    return 0;
}
~~~
要点：struct 末尾分号不能漏；成员默认 public。陷阱：大结构体传参考虑传引用，避免不必要的拷贝。`),
    F('pr18', 'types', '类型转换与窄化',
      R`不同算术类型混用会怎样？怎么写显式转换？`,
      R`算术运算会向「更大」的类型**转换**；赋值时可能截断或丢符号。需要显式转换时用 static_cast。
~~~cpp
#include <iostream>

int main()
{
    int i = 42;
    double d = i / 2;            // 整数除法：得 20.0
    double e = static_cast<double>(i) / 2;  // 得 21.0
    char ch = 300;               // 窄化：具体结果依赖实现
    std::cout << d << " " << e << " " << static_cast<int>(ch) << std::endl;
    return 0;
}
~~~
要点：整数与浮点混算前，先把整数转成 double。陷阱：列表初始化禁止窄化；旧式括号转换能编译但意图不明——优先 static_cast。`),

    // ==================== 字符串向量数组 ====================
    F('pr19', 'seq', 'string 定义与读写',
      R`标准库字符串怎么定义、怎么读入一行带空格的文字？`,
      R`**std::string** 是可变长字符串类型。抽取运算符读到空白为止；**getline** 读一整行（含空格）。
~~~cpp
#include <iostream>
#include <string>

int main()
{
    std::string s1, s2;
    std::cin >> s1;              // 只读到空白
    std::getline(std::cin, s2);  // 读一整行（注意吃掉残留换行）
    std::cout << s1 << " | " << s2 << std::endl;
    return 0;
}
~~~
要点：与 cin 混用 getline 时，先处理掉上一行的换行。陷阱：空行也能读到空串——用 empty 判断，勿用 size 是否为零以外的错判。`),
    F('pr20', 'seq', 'string 常用操作',
      R`字符串怎么求长度、拼接、比较、找子串？`,
      R`常用：size/empty、加号拼接、关系运算符比较（按字典序）、find 查找、substr 取子串。
~~~cpp
#include <iostream>
#include <string>

int main()
{
    std::string a = "hel", b = "lo";
    std::string s = a + b;          // "hello"
    std::cout << s.size() << " ";   // 5
    auto pos = s.find("ll");        // 下标 2
    std::cout << pos << " ";
    std::cout << s.substr(0, 3) << std::endl;  // hel
    return 0;
}
~~~
要点：下标从零开始；找不到时 find 返回 string 的 npos（一个很大的哨兵值）。陷阱：substr 参数是「起点、长度」不是「起点、终点」。`),
    F('pr21', 'seq', '范围 for 处理字符',
      R`怎么逐个处理字符串里的字符？要改字符怎么写？`,
      R`**范围 for** 把容器里每个元素依次绑到循环变量；要**改元素**用引用绑定。
~~~cpp
#include <iostream>
#include <string>
#include <cctype>

int main()
{
    std::string s = "Hello";
    for (auto &c : s) {        // 引用：就地改
        c = std::toupper(static_cast<unsigned char>(c));
    }
    std::cout << s << std::endl;  // HELLO
    return 0;
}
~~~
要点：只读时可用 const 引用或值拷贝（小元素）。陷阱：值拷贝循环里改的是副本，原串不变。`),
    F('pr22', 'seq', 'vector 定义与初始化',
      R`动态数组 vector 怎么创建、怎么给初值？`,
      R`**std::vector** 是同类型元素的可增长数组。初始化：花括号列表、圆括号「n 个初值」、再加一个初始大小。
~~~cpp
#include <iostream>
#include <vector>

int main()
{
    std::vector<int> v1{1, 2, 3};     // 三个元素
    std::vector<int> v2(5, 0);        // 5 个 0
    std::vector<std::string> v3(3);   // 3 个空串
    std::cout << v1.size() << " " << v2[0] << " " << v3.empty() << std::endl;
    return 0;
}
~~~
要点：vector 可存类类型；empty 判空、size 求个数。陷阱：圆括号与花括号含义不同——(5,0) 是 5 个零，{5,0} 是两个元素 5 和 0。`),
    F('pr23', 'seq', 'vector 增删与下标访问',
      R`怎么往 vector 里加、删、读元素？下标有什么坑？`,
      R`push_back 追加、pop_back 删尾、下标或 at 访问。下标从零开始，**合法范围是 0 到 size 减一**。
~~~cpp
#include <iostream>
#include <vector>

int main()
{
    std::vector<int> v;
    v.push_back(1);     // 追加
    v.push_back(2);
    v[0] = 10;          // 下标写
    std::cout << v[0] << " " << v.size() << std::endl;
    v.pop_back();       // 删掉最后一个
    // v[5] = 0;        // 未定义：越界
    return 0;
}
~~~
要点：范围 for + push_back 会一边加一边遍历时注意失效。陷阱：下标越界不做检查——调试期可用 at（越界抛异常）。`),
    F('pr24', 'seq', '迭代器基础',
      R`迭代器是什么？怎么用它遍历 vector？`,
      R`**迭代器**是指向容器元素的泛化指针：begin 指向首元素，end 指向「尾后」位置（不可解引用）。
~~~cpp
#include <iostream>
#include <vector>

int main()
{
    std::vector<int> v{1, 2, 3};
    for (auto it = v.begin(); it != v.end(); ++it) {
        std::cout << *it << " ";   // 解引用取元素
    }
    std::cout << std::endl;
    return 0;
}
~~~
要点：类型难写就用 auto；只读可用 cbegin/cend。陷阱：end 不是最后一个元素；解引用 end 是未定义行为。`),
    F('pr25', 'seq', '数组定义与访问',
      R`内置数组怎么定义？和 vector 比什么时候用数组？`,
      R`**数组**是固定长度、元素连续存放的复合类型：类型 名字[长度]。长度必须是编译期常量（现代更推荐 vector）。
~~~cpp
#include <iostream>

int main()
{
    int a[3] = {1, 2, 3};     // 固定 3 个元素
    for (int i = 0; i < 3; ++i) {
        std::cout << a[i] << " ";   // 下标从 0 开始
    }
    std::cout << std::endl;
    // a[3];                     // 越界：未定义
    return 0;
}
~~~
要点：长度固定、不能 push_back；范围 for 也可遍历（编译期已知长度）。陷阱：越界与「长度写错」是数组两大事故源——新代码优先 vector。`),
    F('pr26', 'seq', 'C 风格字符串与 string 的转换',
      R`遇到字符数组表示的字符串，怎么和 std::string 协作？`,
      R`C 字符串是以**空字符结尾**的字符数组。现代代码用 string；与旧接口协作时用 c_str 取只读指针。
~~~cpp
#include <iostream>
#include <string>
#include <cstring>

int main()
{
    const char *cs = "hello";      // C 字符串（字面量）
    std::string s = cs;            // 转成 string
    std::string t = s + "!";       // 用 string 的能力
    std::cout << t << " " << std::strlen(cs) << std::endl;
    // 旧接口需要 const char* 时：t.c_str()
    return 0;
}
~~~
要点：string 自动管理长度与内存。陷阱：自己填字符数组时忘补结尾空字符，按 C 字符串处理会越界读。`),
    F('pr27', 'seq', '多维数组与 vector 套 vector',
      R`二维表怎么存？两种写法各自怎么遍历？`,
      R`可用内置二维数组，或 **vector 的 vector**（每行长度还可不同）。现代更推荐后者。
~~~cpp
#include <iostream>
#include <vector>

int main()
{
    std::vector<std::vector<int>> grid = {
        {1, 2},
        {3, 4, 5}
    };
    for (const auto &row : grid) {      // 每一行
        for (int x : row) {             // 行内每个元素
            std::cout << x << " ";
        }
        std::cout << std::endl;
    }
    return 0;
}
~~~
要点：外层类型写清两层 vector。陷阱：内置二维数组的指针退化规则复杂——入门期用 vector 套 vector 更省心。`),
    F('pr28', 'seq', 'string 与 vector 的混合练习',
      R`怎么把一串单词读进 vector<string> 再统一处理？`,
      R`标准套路：循环读词 push_back，再范围 for 统计或变换——这是「容器 + 算法思想」的最小闭环。
~~~cpp
#include <iostream>
#include <string>
#include <vector>

int main()
{
    std::vector<std::string> words;
    std::string w;
    while (std::cin >> w) {     // 读到流结束
        words.push_back(w);
    }
    for (const auto &s : words) {
        std::cout << s << " ";
    }
    std::cout << "共 " << words.size() << " 个词" << std::endl;
    return 0;
}
~~~
要点：流结束（文件末或控制台结束符）会让 while 条件为假。陷阱：大文本频繁 push_back 可 reserve 预留，减少扩容拷贝。`),

    // ==================== 表达式语句函数 ====================
    F('pr29', 'expr', '算术与关系运算符',
      R`加减乘除、求余、比较怎么用？优先级要注意什么？`,
      R`**算术**：加减乘除与求余（整数才有求余）；**关系**：等于、不等于、小于、大于及带等于——结果是 bool。
~~~cpp
#include <iostream>

int main()
{
    int a = 7, b = 3;
    std::cout << a / b << " ";      // 2：整数除法
    std::cout << a % b << " ";      // 1：求余
    std::cout << (a > b) << " ";    // 1：true
    std::cout << (a == b) << std::endl;  // 0
    return 0;
}
~~~
要点：条件里写清括号，优先级一目了然。陷阱：赋值的单等号与比较的双等号写混——经典事故。`),
    F('pr30', 'expr', '逻辑运算与短路求值',
      R`与或非怎么写？为什么右边可能根本不执行？`,
      R`**逻辑与**（双与）、**逻辑或**（双或）、**逻辑非**（感叹号）。**短路**：与的左为假、或的左为真时，右表达式不执行。
~~~cpp
#include <iostream>

int main()
{
    int n = 5, limit = 3;
    if (n != 0 && limit / n > 0) {  // n!=0 为假则右边不跑
        std::cout << "yes";
    }
    if (n < 0 || n > limit) {       // 或：左为真则右边不跑
        std::cout << " out";
    }
    std::cout << std::endl;
    return 0;
}
~~~
要点：把「便宜或防崩溃」的判断放左边。陷阱：不要依赖副作用写在右操作数里——可能被短路跳过。`),
    F('pr31', 'expr', '赋值、递增与递减',
      R`前置和后置递增差在哪？复合赋值怎么写？`,
      R`**前置**先加再用值、**后置**先用值再加（多一次旧值拷贝）；**复合赋值**如加等、减等就地更新。
~~~cpp
#include <iostream>

int main()
{
    int n = 5;
    int a = n++;    // a=5，n=6
    int b = ++n;    // n=7，b=7
    n += 3;         // n=10
    std::cout << a << " " << b << " " << n << std::endl;
    return 0;
}
~~~
要点：循环步进习惯用前置；表达式里「只要更新」就用复合赋值。陷阱：同一表达式里多次改同一变量是未定义行为——拆成多条语句。`),
    F('pr32', 'expr', '成员访问与条件运算符',
      R`点运算符和箭头运算符怎么选？二选一赋值怎么一行写完？`,
      R`**点**用于对象，**箭头**用于指针（等价于解引用再点）；**条件运算符**（问号冒号）是唯一的三元运算符。
~~~cpp
#include <iostream>
#include <string>

int main()
{
    std::string s = "hi";
    std::string *p = &s;
    std::cout << s.size() << " ";    // 对象用点
    std::cout << p->size() << " ";   // 指针用箭头
    int n = 7;
    const char *lab = (n >= 60) ? "及格" : "再练";
    std::cout << lab << std::endl;
    return 0;
}
~~~
要点：箭头是「解引用 + 成员访问」的简写。陷阱：条件运算符可嵌套但可读性差——超过两层改用 if。`),
    F('pr33', 'expr', 'sizeof 与括号转换',
      R`sizeof 怎么用？显式转换为什么优先 static_cast？`,
      R`**sizeof** 得到类型或对象占用的字节数（编译期常量）。显式转换用 **static_cast** 意图清晰、可检索。
~~~cpp
#include <iostream>

int main()
{
    int n = 0;
    std::cout << sizeof(int) << " ";     // 类型
    std::cout << sizeof n << " ";        // 对象（可不加括号）
    double d = static_cast<double>(n) / 2;
    std::cout << d << std::endl;
    return 0;
}
~~~
要点：sizeof 的结果是无符号整数族。陷阱：sizeof 作用在数组上是整个数组大小，退化成指针后则是指针大小——传参后长度要另传。`),
    F('pr34', 'expr', '语句、块与作用域',
      R`空语句、复合语句是什么？块级作用域怎么影响变量寿命？`,
      R`**表达式语句**加空号收尾；**空语句**只有分号；**复合语句**（块）用花括号包住多条语句，形成新的作用域。
~~~cpp
#include <iostream>

int main()
{
    {                           // 新作用域
        int tmp = 1;
        std::cout << tmp << std::endl;
    }                           // tmp 在此销毁
    // std::cout << tmp;        // 非法：tmp 已不可见
    ;                           // 空语句（合法但通常无用）
    return 0;
}
~~~
要点：局部对象在作用域结束时自动销毁。陷阱：for 或 if 不加花括号时只有第一条语句属于它——缩进骗人，花括号不会。`),
    F('pr35', 'expr', 'switch 多分支',
      R`多档整数/字符判断怎么写？漏 break 会怎样？`,
      R`**switch** 按整型或枚举标签跳转；每个 case 末尾通常 **break**，否则会**贯穿**到下一档。
~~~cpp
#include <iostream>

int main()
{
    int grade = 2;
    switch (grade) {
        case 1:
            std::cout << "一" << std::endl;
            break;
        case 2:
            std::cout << "二" << std::endl;
            break;
        default:
            std::cout << "其他" << std::endl;
            break;
    }
    return 0;
}
~~~
要点：default 处理意外输入。陷阱：case 里定义变量要用花括号再包一层，避免跳过初始化。`),
    F('pr36', 'expr', 'while、do-while 与 for 对比',
      R`三种循环怎么选？do-while 特在哪里？`,
      R`**while** 先判断后执行；**do-while** 至少执行一次再判断；**for** 把初始化、条件、步进写在一起。
~~~cpp
#include <iostream>

int main()
{
    int i = 0;
    while (i < 3) { ++i; }          // 可能一次也不进
    int j = 0;
    do { ++j; } while (j < 0);      // 至少进一次
    for (int k = 0; k < 3; ++k) {   // 计数首选
        std::cout << k << " ";
    }
    std::cout << i << j << std::endl;
    return 0;
}
~~~
要点：计数用 for，条件未知用 while，菜单至少显示一次用 do-while。陷阱：for 的条件写成小于等于会多跑一次。`),
    F('pr37', 'expr', 'break、continue 与 goto',
      R`怎么提前结束循环、跳过本轮？goto 还能用吗？`,
      R`**break** 结束最内层循环或 switch；**continue** 跳到下一轮；**goto** 可无条件跳转，现代代码几乎不用。
~~~cpp
#include <iostream>

int main()
{
    for (int i = 0; i < 5; ++i) {
        if (i == 2) continue;   // 跳过本轮
        if (i == 4) break;      // 整个循环结束
        std::cout << i << " ";
    }
    std::cout << std::endl;
    return 0;
}
~~~
要点：能用结构化循环表达就不用 goto。陷阱：break 只出最内层；嵌套循环要跳出多层需改写条件或封装函数。`),
    F('pr38', 'expr', '函数定义与调用',
      R`一段逻辑要反复使用——怎么封装成函数？`,
      R`**函数**由返回类型、名字、参数列表与花括号体组成；调用时传实参，**return** 把结果交回。
~~~cpp
#include <iostream>

int max(int a, int b)   // 返回 int，收两个 int
{
    if (a > b) return a;
    return b;
}

int main()
{
    int m = max(3, 7);  // 调用：实参 3 与 7
    std::cout << m << std::endl;
    return 0;
}
~~~
要点：声明可放头文件，定义放源文件。陷阱：声明返回类型却在某条路径忘了 return——返回垃圾或未定义。`),
    F('pr39', 'expr', '参数传递：值与引用',
      R`在函数里改参数，调用者的变量会跟着变吗？何时用引用参数？`,
      R`**传值**只改副本；**传引用**（参数写引用）可改实参，大对象还能免拷贝；只读引用加 const。
~~~cpp
#include <iostream>

void by_val(int x)  { x = 0; }              // 改副本
void by_ref(int &x) { x = 0; }              // 改实参
void read_only(const std::string &s) {      // 只读、免拷贝
    std::cout << s.size() << std::endl;
}

int main()
{
    int n = 5;
    by_val(n);   // n 仍是 5
    by_ref(n);   // n 变成 0
    read_only("hello");
    return 0;
}
~~~
要点：想改外面用非常量引用；只读大对象用 const 引用。陷阱：不要返回局部变量的引用/指针——悬空。`),
    F('pr40', 'expr', '函数重载与默认实参',
      R`同名函数怎么共存？参数默认值怎么写？`,
      R`**重载**：同名按参数类型/个数区分，与返回值无关；**默认实参**从右往左连续给。
~~~cpp
#include <iostream>

void print(int x)               { std::cout << x << std::endl; }
void print(const std::string &s){ std::cout << s << std::endl; }
void add(int a, int b = 10)     { std::cout << a + b << std::endl; }

int main()
{
    print(42);
    print(std::string("hi"));
    add(5);      // b 取默认 10
    add(5, 1);   // b 取 1
    return 0;
}
~~~
要点：编译器按实参挑最匹配的重载。陷阱：重载与默认实参叠在一起可能造成二义调用——能拆就拆。`),

    // ==================== 类 ====================
    F('pr41', 'cls', '定义抽象数据类型',
      R`一个最小的类怎么写？数据和函数怎么组织？`,
      R`**类**把数据成员与成员函数捆成抽象数据类型：先写接口（能做什么），再写实现（怎么做）。
~~~cpp
#include <iostream>

struct Sales_item
{
    std::string book_no;      // 数据成员
    unsigned units_sold = 0;
    double revenue = 0.0;

    double avg_price() const  // 成员函数（const：不改成员）
    {
        if (units_sold == 0) return 0.0;
        return revenue / units_sold;
    }
};

int main()
{
    Sales_item item{"cpp-1", 2, 100.0};
    std::cout << item.avg_price() << std::endl;
    return 0;
}
~~~
要点：struct 默认 public，class 默认 private。陷阱：成员函数定义在类内默认 inline；长函数可类外定义。`),
    F('pr42', 'cls', '构造函数与初始化列表',
      R`对象怎么被造出来？为什么优先用初始化列表？`,
      R`**构造函数**与类同名、无返回类型、可重载；**成员初始化列表**在冒号后直接初始化成员。
~~~cpp
#include <iostream>
#include <string>

class Person
{
public:
    Person(std::string n, int a) : name(std::move(n)), age(a) {}
    // 初始化列表：直接构造成员，少一次默认构造+赋值

    void show() const { std::cout << name << " " << age << std::endl; }
private:
    std::string name;
    int age;
};

int main()
{
    Person p("Ada", 18);
    p.show();
    return 0;
}
~~~
要点：const、引用、无默认构造的成员**只能**在列表里初始化。陷阱：列表顺序按**声明顺序**，不是书写顺序——写反会有「用了未初始化成员」的错觉。`),
    F('pr43', 'cls', '析构函数与 RAII 思想',
      R`对象销毁时如何自动清理资源？RAII 是什么？`,
      R`**析构函数**（波浪号加类名）在对象生命结束时自动调用。**RAII**：资源获取即初始化——获取放构造、释放放析构。
~~~cpp
#include <iostream>

class Guard
{
public:
    Guard()  { std::cout << "acquire\n"; }
    ~Guard() { std::cout << "release\n"; }  // 出作用域自动调用
};

int main()
{
    {
        Guard g;           // 获取
        std::cout << "use\n";
    }                      // 先 release
    return 0;
}
~~~
要点：异常与提前返回也不会漏释放——这是 C++ 的工程优势。陷阱：构造函数里抛异常时，已构造的成员会被正确析构，手写一半的资源要靠智能指针兜底。`),
    F('pr44', 'cls', '访问控制、封装与友元',
      R`private 保护了什么？友元如何开「小灶」？`,
      R`**private** 仅类内与友元可访问，形成封装边界；**protected** 留给派生类；**public** 是接口。**友元**声明某个函数/类可访问私有成员。
~~~cpp
#include <iostream>

class Account
{
    friend void audit(const Account &);  // 友元：可碰 private
public:
    void deposit(double v) { balance += v; }
private:
    double balance = 0.0;
};

void audit(const Account &a)
{
    std::cout << a.balance << std::endl;  // 合法：友元
}

int main()
{
    Account a;
    a.deposit(10.0);
    audit(a);
    return 0;
}
~~~
要点：数据默认 private、通过公共接口改——不变量由类维护。陷阱：友元破坏封装、不宜滥用；友元关系不可传递。`),
    F('pr45', 'cls', 'static 成员',
      R`属于「类本身」而不是每个对象的成员怎么写？`,
      R`**static 数据成员**被所有对象共享；**static 成员函数**没有 this，只能碰 static 成员。
~~~cpp
#include <iostream>

class Counter
{
public:
    Counter() { ++count; }
    static int how_many() { return count; }  // 无 this
private:
    static int count;   // 共享计数（类内声明）
};

int Counter::count = 0;  // 类外定义并初始化

int main()
{
    Counter a, b;
    std::cout << Counter::how_many() << std::endl;  // 2
    return 0;
}
~~~
要点：static 成员可用类名直接访问。陷阱：static 数据成员要在类外定义一次（常量整型可在类内初始化）。`),
    F('pr46', 'cls', '运算符重载入门',
      R`怎么让自定义类型的加号、输出流可用？`,
      R`用 **operator 运算符** 为类定义运算符含义。成员形式左操作数是本类；流插入通常写成**非成员友元**（左操作数是流）。
~~~cpp
#include <iostream>

struct Vec2
{
    int x = 0, y = 0;
    Vec2 operator+(const Vec2 &o) const { return {x + o.x, y + o.y}; }
};

std::ostream &operator<<(std::ostream &os, const Vec2 &v)
{
    return os << "(" << v.x << "," << v.y << ")";
}

int main()
{
    Vec2 a{1, 2}, b{3, 4};
    std::cout << a + b << std::endl;
    return 0;
}
~~~
要点：不要发明新运算符，勿改优先级与结合性。陷阱：逻辑与/或等运算符不要重载——会失去短路语义。`),
    F('pr47', 'cls', '隐式转换与 explicit',
      R`构造函数为什么会引起「自动转型」？怎么禁止？`,
      R`只要**一个参数**的构造函数（或可默认其余参数）就可能被当作转换函数。加上 **explicit** 禁止隐式转换，只能显式构造。
~~~cpp
#include <iostream>
#include <string>

class Meters
{
public:
    explicit Meters(double v) : v_(v) {}   // 禁止隐式转换
    double value() const { return v_; }
private:
    double v_;
};

int main()
{
    // Meters m = 3.0;         // 非法：explicit 禁止
    Meters m(3.0);             // 显式构造：合法
    std::cout << m.value() << std::endl;
    return 0;
}
~~~
要点：单参构造默认加 explicit。陷阱：隐式转换会静默走「看起来不像拷贝」的坑路径，排查成本高。`),
    F('pr48', 'cls', '类作用域与成员函数定义',
      R`类内声明的类型和函数，在类外怎么定义？名字如何查找？`,
      R`类是一个**作用域**：成员函数体内可直接用成员；类外定义要加 **类名限定**，返回类型写在限定之前时需单独声明。
~~~cpp
#include <iostream>
#include <string>

class Screen
{
public:
    using pos = std::string::size_type;  // 类型别名
    Screen &move(pos r, pos c);
private:
    pos cursor = 0;
};

// 类外定义：返回类型在限定前时，已能看见 Screen::pos
Screen &Screen::move(pos r, pos c)
{
    cursor = r * c;
    return *this;
}

int main()
{
    Screen s;
    s.move(2, 3);
    std::cout << "ok" << std::endl;
    return 0;
}
~~~
要点：this 指向当前对象，链式接口常 return *this。陷阱：类外定义漏写类名限定会变成全局函数——链接器报「找不到」。`),
    F('pr49', 'cls', '继承与派生类基础',
      R`怎么在已有类上扩展？构造顺序是怎样的？`,
      R`**继承**：class 派生类 : public 基类。派生类对象含基类子对象；构造顺序是**基类 → 成员 → 派生构造体**，析构相反。
~~~cpp
#include <iostream>

struct Base
{
    Base() { std::cout << "Base "; }
    virtual ~Base() = default;   // 基类析构应为虚
};

struct Derived : Base
{
    Derived() { std::cout << "Derived"; }
};

int main()
{
    Derived d;
    std::cout << std::endl;
    return 0;
}
~~~
要点：public 继承表达「是一个」。陷阱：基类析构非虚时，用基类指针 delete 派生对象会不调派生析构——泄漏。`),
    F('pr50', 'cls', '虚函数与动态绑定',
      R`通过基类指针怎么调到派生类的版本？`,
      R`基类函数加 **virtual**，派生类同签名**覆盖**；通过**基类指针或引用**调用时按对象动态类型分发（动态绑定）。
~~~cpp
#include <iostream>

struct Animal
{
    virtual void speak() const { std::cout << "...\n"; }
    virtual ~Animal() = default;
};

struct Dog : Animal
{
    void speak() const override { std::cout << "wang\n"; }
};

int main()
{
    const Animal *p = new Dog();
    p->speak();          // wang：动态绑定
    delete p;
    return 0;
}
~~~
要点：override 标注防止签名写错；按值传递会发生切片，多态必须指针/引用。陷阱：基类析构必须 virtual。`),
    F('pr51', 'cls', '纯虚函数与抽象类',
      R`接口类怎么设计？抽象类能实例化吗？`,
      R`**纯虚函数**在声明后写「等于 0」；含纯虚函数的类是**抽象类**，不能定义对象，只能被继承并实现接口。
~~~cpp
#include <iostream>

struct Shape
{
    virtual double area() const = 0;   // 纯虚：接口
    virtual ~Shape() = default;
};

struct Rect : Shape
{
    double w, h;
    Rect(double w, double h) : w(w), h(h) {}
    double area() const override { return w * h; }
};

int main()
{
    // Shape s;              // 非法：抽象类
    Shape *p = new Rect(2, 3);
    std::cout << p->area() << std::endl;
    delete p;
    return 0;
}
~~~
要点：抽象类 = 接口；工厂函数返回基类指针/智能指针是常见搭配。陷阱：派生类漏实现任一纯虚函数，自己仍是抽象类。`),
    F('pr52', 'cls', '拷贝控制的「三件套」预览',
      R`编译器会默认生成哪些特殊成员？何时必须自己写？`,
      R`编译器可默认：**拷贝构造**、**拷贝赋值**、**析构**（以及移动操作）。类若管理原始资源，默认拷贝会浅复制指针——必须自己接管。
~~~cpp
#include <iostream>
#include <string>

struct HasName
{
    std::string name;           // 成员自带正确拷贝/析构
    // 不需要自定义拷贝控制：编译器默认即可
};

struct Buffer
{
    int *data;
    Buffer(int n) : data(new int[n]{}) {}
    ~Buffer() { delete[] data; }   // 有了析构，拷贝就要三思（详见动态内存章）
};

int main()
{
    HasName a{"Ada"}, b = a;   // 安全
    std::cout << b.name << std::endl;
    return 0;
}
~~~
要点：成员是 string/vector/智能指针时，默认拷贝往往就对。陷阱：只要自定义了析构/拷贝之一，就认真考虑要不要全部接管（三法则）。`),

    // ==================== 动态内存拷贝控制 ====================
    F('pr53', 'mem', '直接管理动态内存',
      R`new 和 delete 怎么用？和 malloc 有何不同？`,
      R`**new** 分配并构造对象，返回指针；**delete** 析构并释放。与 malloc/free 不同，它们会调用构造/析构。
~~~cpp
#include <iostream>

int main()
{
    int *p = new int(42);       // 分配一个 int 并初始化
    std::cout << *p << std::endl;
    delete p;                   // 释放
    p = nullptr;                // 置空，避免悬空

    int *arr = new int[3]{1, 2, 3};  // 数组
    delete[] arr;               // 数组 delete 必须配对
    return 0;
}
~~~
要点：new/delete、new[]/delete[] 必须配对。陷阱：重复释放、释放后继续用、配对错误——全是未定义行为。`),
    F('pr54', 'mem', 'unique_ptr：独占所有权',
      R`怎么让对象自动释放、还能表达「独占」？`,
      R`**unique_ptr** 独占所指对象：不可拷贝、可移动，出作用域自动 delete。
~~~cpp
#include <iostream>
#include <memory>

int main()
{
    auto p = std::make_unique<int>(42);  // 推荐工厂函数
    std::cout << *p << std::endl;
    auto q = std::move(p);               // 所有权转移
    // std::cout << *p;                  // 勿再用 p（已空）
    std::cout << *q << std::endl;
    return 0;
}
~~~
要点：不知道用哪个智能指针时，先用 unique。陷阱：move 之后源指针变空，继续解引用是未定义。`),
    F('pr55', 'mem', 'shared_ptr 与引用计数',
      R`多个地方共享一个对象，最后谁来释放？`,
      R`**shared_ptr** 共享所有权，内部**引用计数**：拷贝加一、析构减一，归零才销毁。
~~~cpp
#include <iostream>
#include <memory>

int main()
{
    auto a = std::make_shared<int>(7);
    auto b = a;                // 计数 2
    std::cout << *b << " " << a.use_count() << std::endl;
    // 作用域结束时 b、a 先后析构，计数归零后释放
    return 0;
}
~~~
要点：make_shared 一次分配控制块与对象，更省。陷阱：计数有开销；有环状共享会泄漏——见下一张。`),
    F('pr56', 'mem', 'weak_ptr 打破循环引用',
      R`两个对象互相持有对方导致永不释放，怎么破？`,
      R`把「回指」一侧改成 **weak_ptr**（弱引用不增计数）；使用前 **lock** 升级为 shared_ptr，失败说明对象已亡。
~~~cpp
#include <iostream>
#include <memory>

struct Node
{
    std::shared_ptr<Node> next;     // 强引用
    std::weak_ptr<Node>   parent;   // 弱引用：打破环
};

int main()
{
    auto a = std::make_shared<Node>();
    auto b = std::make_shared<Node>();
    a->next = b;
    b->parent = a;                  // weak：不造成泄漏
    if (auto p = b->parent.lock()) {
        std::cout << "parent alive" << std::endl;
    }
    return 0;
}
~~~
要点：观察、缓存、父指针常用 weak。陷阱：weak 不能直接解引用；expired 与 lock 结果要成对理解。`),
    F('pr57', 'mem', '拷贝构造函数',
      R`用已有对象造新对象，走什么函数？默认行为是什么？`,
      R`**拷贝构造**用同类型对象初始化新对象。默认是**逐成员拷贝**：含原始指针时只拷指针值（浅拷贝）→ 双重释放。
~~~cpp
#include <iostream>
#include <string>

struct Named
{
    std::string name;
    Named(const Named &o) : name(o.name)   // 显式拷贝构造
    {
        std::cout << "copy ctor\n";
    }
    Named(std::string n) : name(std::move(n)) {}
};

int main()
{
    Named a("Ada");
    Named b = a;            // 触发拷贝构造
    std::cout << b.name << std::endl;
    return 0;
}
~~~
要点：参数必须是 const 引用，否则传值递归。陷阱：管理裸资源的类必须自定义拷贝，或禁止拷贝。`),
    F('pr58', 'mem', '拷贝赋值与析构',
      R`对象赋值和销毁各走什么？自定义时要注意什么？`,
      R`**拷贝赋值**把另一个对象的值写进自己；**析构**释放资源。自定义赋值注意**自赋值**与异常安全。
~~~cpp
#include <iostream>
#include <string>

struct Buffer
{
    int *data;
    explicit Buffer(int n) : data(new int[n]{}) {}
    ~Buffer() { delete[] data; }

    Buffer &operator=(const Buffer &o)
    {
        if (this == &o) return *this;   // 自赋值保护
        int *p = new int[1];            // 先分配新资源（异常安全）
        delete[] data;
        data = p;
        *data = *o.data;
        return *this;
    }
};

int main()
{
    Buffer a(1), b(1);
    a = b;
    std::cout << "ok" << std::endl;
    return 0;
}
~~~
要点：赋值返回自身引用，支持链式 a=b=c。陷阱：先释放再分配，分配失败会把自己弄坏——先建好再换。`),
    F('pr59', 'mem', '三法则、五法则与零法则',
      R`什么时候必须写拷贝控制？现代首选是什么？`,
      R`**三法则**：自定义析构/拷贝构造/拷贝赋值之一，通常三个都要；移动加入后是**五法则**。现代首选**零法则**——资源交给 string、vector、智能指针成员。
~~~cpp
#include <iostream>
#include <string>
#include <vector>

struct Profile            // 零法则：不写特殊成员
{
    std::string name;
    std::vector<int> scores;
};

int main()
{
    Profile a{"Ada", {1, 2}};
    Profile b = a;        // 编译器默认拷贝：正确
    std::cout << b.name << b.scores.size() << std::endl;
    return 0;
}
~~~
要点：成员类型选对，类体可以很「笨」。陷阱：只要出现原始 new/delete，就退出零法则，认真接管五个特殊成员。`),
    F('pr60', 'mem', '右值引用与移动语义',
      R`右值引用绑的是什么？移动比拷贝好在哪？`,
      R`**右值引用**（类型后两个与）绑定即将销毁的临时对象；**移动**接管源对象的资源并把源置空，避免深拷贝。
~~~cpp
#include <iostream>
#include <string>
#include <utility>

int main()
{
    std::string s = "hello";
    std::string t = std::move(s);  // 移动构造：t 得到内容
    std::cout << t << std::endl;
    // s 仍有效但内容未指定：可析构、可赋新值
    return 0;
}
~~~
要点：std::move 只做类型转换，真正搬运靠移动构造/赋值。陷阱：move 后继续读源对象是逻辑错误。`),
    F('pr61', 'mem', '移动构造与移动赋值',
      R`自定义类如何支持移动？何时编译器会合成？`,
      R`**移动构造/赋值**用右值引用接管成员；若你自定义了拷贝控制，编译器可能**不再**合成移动——需要时显式写或 = default。
~~~cpp
#include <iostream>
#include <string>

struct Holder
{
    std::string s;
    Holder(std::string v) : s(std::move(v)) {}
    Holder(Holder &&o) noexcept : s(std::move(o.s))   // 移动构造
    {
        o.s.clear();
    }
};

int main()
{
    Holder a("abc");
    Holder b = std::move(a);
    std::cout << b.s << std::endl;
    return 0;
}
~~~
要点：移动操作标 noexcept，vector 扩容才会优先移动。陷阱：移动源要留在「可析构、可赋值」的有效状态。`),
    F('pr62', 'mem', '用智能指针写零法则类',
      R`怎样把动态资源绑进类，又不写 new/delete？`,
      R`成员用 **unique_ptr / shared_ptr**——编译器默认拷贝/移动/析构就能对，这就是**零法则**落地。
~~~cpp
#include <iostream>
#include <memory>

struct Engine
{
    std::unique_ptr<int> rpm;                 // 资源所有权在成员里
    explicit Engine(int v) : rpm(std::make_unique<int>(v)) {}
    // 不需要写析构/拷贝/移动
};

int main()
{
    Engine e(3000);
    std::cout << *e.rpm << std::endl;
    Engine f = std::move(e);                  // 可移动
    std::cout << *f.rpm << std::endl;
    return 0;
}
~~~
要点：优先成员智能指针，而不是裸 new。陷阱：unique_ptr 成员会默认让拷贝被删除——要共享就改设计或用 shared_ptr。`),

    // ==================== 泛型与 STL 入门 ====================
    F('pr63', 'stl', '顺序容器再探：list 与 deque',
      R`除了 vector，还有哪些顺序容器？怎么选？`,
      R`**vector** 随机访问快、尾部追加均摊快；**list** 双向链表，任意位置增删快、不能随机访问；**deque** 两端增删快。
~~~cpp
#include <iostream>
#include <list>
#include <deque>

int main()
{
    std::list<int> lst{1, 2, 3};
    lst.push_front(0);            // 头部追加
    std::deque<int> dq{1, 2};
    dq.push_front(0);
    dq.push_back(3);
    std::cout << lst.size() << " " << dq.size() << std::endl;
    return 0;
}
~~~
要点：默认先用 vector；要头尾操作再考虑 deque。陷阱：list 迭代器不能减减跳多步（非随机访问），sort 用成员版。`),
    F('pr64', 'stl', '容器适配器 stack 与 queue',
      R`只要栈或队列接口，底层怎么搭？`,
      R`**stack** 后进先出、**queue** 先进先出、**priority_queue** 优先级出队——它们是**适配器**，包一层顺序容器接口。
~~~cpp
#include <iostream>
#include <queue>
#include <stack>

int main()
{
    std::stack<int> st;
    st.push(1);
    st.push(2);
    std::cout << st.top() << std::endl;  // 2
    st.pop();

    std::queue<int> q;
    q.push(1);
    std::cout << q.front() << std::endl;
    q.pop();
    return 0;
}
~~~
要点：接口刻意做小，只暴露该结构该有的操作。陷阱：pop 不返回值——先 top/front 再 pop；对空容器调 top 是未定义。`),
    F('pr65', 'stl', '关联容器 map 与 set',
      R`按键快速查找、自动排序怎么实现？`,
      R`**map** 存键值对、**set** 只存键，底层平衡树，查找增删都是对数时间，遍历有序。
~~~cpp
#include <iostream>
#include <map>
#include <set>

int main()
{
    std::map<std::string, int> age;
    age["Ada"] = 18;             // 插入或更新
    age["Ada"] = 19;
    std::cout << age["Ada"] << " " << age.size() << std::endl;

    std::set<int> s{3, 1, 2};
    for (int x : s) std::cout << x << " ";  // 1 2 3 有序
    std::cout << std::endl;
    return 0;
}
~~~
要点：需要有序或范围查选用 map/set。陷阱：下标不存在的键会**插入默认值**——只查询用 find/count。`),
    F('pr66', 'stl', 'unordered_map 哈希容器',
      R`只要快速查找、不要求顺序，选什么？`,
      R`**unordered_map / unordered_set** 用哈希表，平均常数查找；不要求顺序时通常更快。
~~~cpp
#include <iostream>
#include <unordered_map>
#include <string>

int main()
{
    std::unordered_map<std::string, int> cnt;
    ++cnt["hello"];
    ++cnt["world"];
    ++cnt["hello"];
    std::cout << cnt["hello"] << " " << cnt.size() << std::endl;
    return 0;
}
~~~
要点：词频统计这类「查找+更新」首选。陷阱：自定义键要提供哈希与相等；最坏冲突会退化，但一般不用先优化。`),
    F('pr67', 'stl', '泛型算法：查找、排序、遍历',
      R`怎么对 vector 做查找、排序、累加？算法为什么不绑定具体容器？`,
      R`算法接受**迭代器区间**，与容器解耦：sort、find、count、accumulate 最常用。
~~~cpp
#include <iostream>
#include <vector>
#include <algorithm>
#include <numeric>

int main()
{
    std::vector<int> v{3, 1, 2};
    std::sort(v.begin(), v.end());            // 1 2 3
    auto it = std::find(v.begin(), v.end(), 2);
    int sum = std::accumulate(v.begin(), v.end(), 0);
    std::cout << (it != v.end()) << " " << sum << std::endl;
    return 0;
}
~~~
要点：区间习惯是左闭右开。陷阱：sort 需要随机访问迭代器（vector 可以，list 要用成员 sort）。`),
    F('pr68', 'stl', '函数对象与 lambda 作谓词',
      R`算法怎么按我的规则排序或筛选？`,
      R`许多算法接受**谓词**（返回真假的可调用对象）。**lambda** 是内联匿名函数，可捕获外部变量。
~~~cpp
#include <iostream>
#include <vector>
#include <algorithm>

int main()
{
    std::vector<int> v{1, 2, 3, 4, 5};
    int threshold = 3;
    auto it = std::find_if(v.begin(), v.end(),
        [threshold](int x) { return x > threshold; });  // 捕获 threshold
    std::cout << *it << std::endl;   // 4

    std::sort(v.begin(), v.end(), [](int a, int b) { return a > b; });
    std::cout << v.front() << std::endl;
    return 0;
}
~~~
要点：短小策略用 lambda，比写仿函数类省事。陷阱：按引用捕获的局部变量，若 lambda 活得更久会悬空。`),
    F('pr69', 'stl', '函数模板入门',
      R`怎么写一份适用于多种类型的函数？`,
      R`**函数模板**用类型参数生成具体函数；调用时按实参推导类型（也可显式指定）。
~~~cpp
#include <iostream>

template <typename T>
T my_max(T a, T b)
{
    return (a < b) ? b : a;
}

int main()
{
    std::cout << my_max(3, 7) << " "
              << my_max(2.5, 1.5) << std::endl;
    return 0;
}
~~~
要点：模板放头文件，实例化时要见定义。陷阱：两参类型不同会推导失败——可写两个类型参数或传同一类型。`),
    F('pr70', 'stl', '类模板入门',
      R`vector 这种「参数化类型」自己怎么写最小版？`,
      R`**类模板**把类型参数写在 template 里；使用时 **类名<类型>** 实例化。这就是容器背后的机制。
~~~cpp
#include <iostream>

template <typename T>
struct Box
{
    T value;
    void set(const T &v) { value = v; }
    T get() const { return value; }
};

int main()
{
    Box<int> b;
    b.set(42);
    Box<std::string> s;
    s.set("hi");
    std::cout << b.get() << " " << s.get() << std::endl;
    return 0;
}
~~~
要点：成员用到才实例化。陷阱：类外定义成员函数时，每个函数都要再写 template 与类名限定。`),

    // ==================== 现代 C++ 必备 ====================
    F('pr71', 'modern', 'auto 与 decltype 深化',
      R`复杂类型怎么让编译器帮写？decltype 和 auto 差在哪？`,
      R`**auto** 从初始化表达式推导（通常去掉引用与顶层 const）；**decltype** 查表达式类型但不求值，会保留引用。
~~~cpp
#include <iostream>
#include <string>

int main()
{
    std::string s = "hi";
    auto s2 = s;             // string（拷贝语义的推导）
    decltype(s) &r = s;      // string &（保留引用）
    r = "yo";
    std::cout << s2 << " " << s << std::endl;
    return 0;
}
~~~
要点：迭代器、lambda 类型、转发常用。陷阱：代理类型（如 vector<bool>）上 auto 可能推成意外类型。`),
    F('pr72', 'modern', '范围 for 与统一初始化',
      R`遍历和初始化的现代写法有什么优势？`,
      R`**范围 for** 遍历容器元素；**花括号初始化**统一各种定义场景，并禁止窄化。
~~~cpp
#include <iostream>
#include <vector>

int main()
{
    std::vector<int> v{1, 2, 3};
    for (auto x : v) { std::cout << x << " "; }          // 只读拷贝
    for (auto &y : v) { y *= 2; }                        // 就地改
    std::pair<int, double> p{1, 2.5};                    // 统一初始化
    std::cout << p.first << v[0] << std::endl;
    return 0;
}
~~~
要点：改元素用引用；只读大对象可用 const 引用。陷阱：循环中增删容器会使范围 for 的迭代失效。`),
    F('pr73', 'modern', 'nullptr 与空指针',
      R`空指针现代怎么写？和 0、NULL 有何不同？`,
      R`**nullptr** 是空指针字面量，类型明确，重载决议不会和整数 0 混。
~~~cpp
#include <iostream>

void f(int)        { std::cout << "int\n"; }
void f(int *)      { std::cout << "ptr\n"; }

int main()
{
    f(nullptr);    // 选 int* 重载
    // f(0);       // 会选 int 重载——坑
    int *p = nullptr;
    if (!p) std::cout << "empty" << std::endl;
    return 0;
}
~~~
要点：新代码一律 nullptr。陷阱：老代码 NULL 可能是 0 的宏，重载与类型推导会选错。`),
    F('pr74', 'modern', '异常基础与 noexcept',
      R`出错了怎么抛出和捕获？noexcept 什么时候用？`,
      R`**throw** 抛出异常，**try / catch** 捕获；**noexcept** 承诺不抛（违反则直接终止），移动操作常标它以利容器优化。
~~~cpp
#include <iostream>
#include <stdexcept>

double divide(int a, int b)
{
    if (b == 0) throw std::invalid_argument("div0");
    return static_cast<double>(a) / b;
}

int main()
{
    try {
        std::cout << divide(3, 0) << std::endl;
    } catch (const std::invalid_argument &e) {
        std::cout << "err: " << e.what() << std::endl;
    }
    return 0;
}
~~~
要点：按 const 引用捕获标准异常；该抛就抛，别用魔法数表示失败。陷阱：析构与移动里不要抛异常；函数标了 noexcept 就别抛。`),
    F('pr75', 'modern', '类型别名、using 与枚举',
      R`复杂类型怎么起短名？枚举类比旧枚举好在哪？`,
      R`**using 别名**让签名变短；**enum class** 是强类型枚举，不与整数隐式互转、作用域在枚举名下。
~~~cpp
#include <iostream>
#include <string>
#include <map>

using NameMap = std::map<std::string, int>;   // 别名

enum class Color { Red, Green };              // 强类型枚举

int main()
{
    NameMap m;
    m["a"] = 1;
    Color c = Color::Red;
    // int x = c;               // 非法：不隐式转 int
    std::cout << m["a"] << std::endl;
    return 0;
}
~~~
要点：公共别名可放头文件。陷阱：旧 enum 会污染作用域且可当整数用——新代码用 enum class。`),
    F('pr76', 'modern', '现代 C++ 实战清单',
      R`日常写代码，哪些习惯应从第一天养成？`,
      R`清单：① 变量初始化、默认 const；② 用 string/vector/map，少用裸数组；③ 用 nullptr；④ 用 auto 简化冗长类型；⑤ 资源进智能指针/容器成员（零法则）；⑥ 范围 for + lambda 表达意图；⑦ 编译开 -Wall，进动态内存就开 AddressSanitizer。
~~~cpp
#include <iostream>
#include <memory>
#include <string>
#include <vector>

int main()
{
    auto names = std::vector<std::string>{"Ada", "Bob"};
    auto owner = std::make_unique<std::string>("data");
    for (const auto &n : names) {
        std::cout << n << " ";
    }
    std::cout << *owner << std::endl;
    return 0;
}
~~~
要点：先正确再快；可读性优先于炫技。陷阱：不要为了「新语法而新语法」——每个特性都要有真实收益。`),
  ];

  const META = {
    pr01: [5, 'hello 程序'], pr02: [5, 'cin cout'], pr03: [3, '注释骨架'],
    pr04: [5, 'if while'], pr05: [5, 'for 循环'], pr06: [4, '类类型初识'],
    pr07: [4, 'std 命名空间'], pr08: [4, '编译链接'],
    pr09: [5, '基本内置类型'], pr10: [5, '变量初始化'], pr11: [3, '作用域遮蔽'],
    pr12: [5, '引用'], pr13: [5, '指针'], pr14: [5, 'const'],
    pr15: [4, 'auto 别名'], pr16: [3, 'constexpr'], pr17: [4, '结构体'], pr18: [4, '类型转换'],
    pr19: [5, 'string 读写'], pr20: [5, 'string 操作'], pr21: [4, '范围 for 字符'],
    pr22: [5, 'vector 初始化'], pr23: [5, 'vector 增删'], pr24: [5, '迭代器'],
    pr25: [4, '数组'], pr26: [3, 'C 字符串'], pr27: [3, '多维数组'], pr28: [4, '词表练习'],
    pr29: [5, '算术关系'], pr30: [4, '逻辑短路'], pr31: [4, '递增赋值'],
    pr32: [4, '成员条件运算'], pr33: [3, 'sizeof 转换'], pr34: [3, '语句作用域'],
    pr35: [4, 'switch'], pr36: [4, '循环对比'], pr37: [3, 'break continue'],
    pr38: [5, '函数定义'], pr39: [5, '值与引用传参'], pr40: [4, '重载默认参'],
    pr41: [5, '抽象数据类型'], pr42: [5, '构造初始化列表'], pr43: [5, '析构 RAII'],
    pr44: [5, '封装友元'], pr45: [4, 'static 成员'], pr46: [4, '运算符重载'],
    pr47: [4, 'explicit'], pr48: [3, '类作用域'], pr49: [5, '继承'],
    pr50: [5, '虚函数多态'], pr51: [4, '抽象类'], pr52: [5, '拷贝控制预览'],
    pr53: [5, 'new delete'], pr54: [5, 'unique_ptr'], pr55: [5, 'shared_ptr'],
    pr56: [5, 'weak_ptr 循环引用'], pr57: [5, '拷贝构造'], pr58: [5, '拷贝赋值析构'],
    pr59: [5, '三五零法则'], pr60: [5, '移动语义'], pr61: [4, '移动构造赋值'],
    pr62: [5, '零法则实践'], pr63: [3, 'list deque'], pr64: [3, 'stack queue'],
    pr65: [4, 'map set'], pr66: [4, 'unordered_map'], pr67: [5, '泛型算法'],
    pr68: [5, 'lambda 谓词'], pr69: [4, '函数模板'], pr70: [4, '类模板'],
    pr71: [4, 'decltype'], pr72: [4, '范围 for 初始化'], pr73: [4, 'nullptr'],
    pr74: [4, '异常 noexcept'], pr75: [3, 'enum class'], pr76: [3, '实战清单']
  };

  const PITFALL = {
    pr10: R`未初始化的局部变量读出来是垃圾——定义时就给初值。`,
    pr13: R`解引用空指针或悬空指针是未定义行为——用前确认有效。`,
    pr14: R`const 指针两口诀：星号左管值、星号右管指向，从右往左读声明。`,
    pr18: R`整数除法会丢小数；列表初始化禁止窄化，旧式强转意图不明优先 static_cast。`,
    pr19: R`cin 与 getline 混用会吃掉残留换行——先处理再读整行。`,
    pr22: R`vector 的圆括号与花括号含义不同：(5,0) 是 5 个零，{5,0} 是两个元素。`,
    pr23: R`下标越界不做检查——调试期用 at，发布代码保证下标合法。`,
    pr24: R`迭代器 end 是尾后位置，解引用 end 未定义；遍历时删元素会使迭代器失效。`,
    pr25: R`内置数组越界未定义；新代码优先 vector，少踩固定长度与退化的坑。`,
    pr29: R`单等号是赋值、双等号才是比较——写进 if 条件是经典事故。`,
    pr31: R`同一表达式里多次改同一变量是未定义行为——拆成多条语句。`,
    pr35: R`switch 漏写 break 会贯穿到下一档；case 内定义变量要再包一层块。`,
    pr39: R`传值只改副本；不要返回局部变量的引用或指针——悬空。`,
    pr42: R`成员初始化列表按声明顺序执行，不是书写顺序——写反会用到未初始化成员。`,
    pr43: R`构造函数抛异常时部分构造的资源要靠智能指针兜底——别裸 new 一半。`,
    pr47: R`单参构造默认加 explicit，避免静默隐式转换踩坑。`,
    pr50: R`两条铁律：多态必须通过指针或引用调用（值调用切片）；基类析构函数必须 virtual。`,
    pr53: R`new/delete 与 new[]/delete[] 必须配对；重复释放与悬空使用全是未定义。`,
    pr56: R`shared_ptr 循环引用用 weak_ptr 破解——互相强引用永不释放。`,
    pr57: R`拷贝构造参数必须是 const 引用——传值会无限递归。`,
    pr58: R`拷贝赋值先处理自赋值，并先建好新资源再释放旧资源（异常安全）。`,
    pr59: R`出现原始 new/delete 就退出零法则——认真接管五个特殊成员。`,
    pr60: R`std::move 只做类型转换；move 后的源对象只能析构或赋新值，不能继续读内容。`,
    pr65: R`map 下标不存在的键会插入默认值——只查询请用 find 或 count。`,
    pr67: R`sort 需要随机访问迭代器；list 要用成员 sort。`,
    pr68: R`lambda 按引用捕获的局部变量，在 lambda 活得更久时会悬空——异步回调优先按值捕获。`,
    pr74: R`标了 noexcept 的函数不要抛异常；析构与移动操作里抛异常等于自杀。`
  };

  // —— 帮助栏目文章（检索用，不参与学习调度）——
  const HELP = [
    { id: 'ph01', title: 'C++ 适合做什么', body: R`在 C 的基础上加上**类、模板、标准库**——既要机器级性能，又要高级抽象。
典型场景：游戏引擎、高频交易、图形渲染、浏览器内核、基础软件——性能敏感的大型系统。
本卡组按 **C++ Primer 入门主干**走：先把类型、容器、类和智能指针用扎实，再谈进阶元编程。` },
    { id: 'ph02', title: '安装编译器与验证', body: R`编译器三选一：**g++**（MinGW-w64 / WSL）、**clang++**（Mac 自带）、**MSVC**（Visual Studio）。
验证：终端敲 g++ --version 出现版本号即成功。
编辑器用 VS Code 加 C/C++ 扩展，或直接用 CLion / Visual Studio——编译与报错提示都有。编译时加 **-std=c++17** 启用现代写法。` },
    { id: 'ph03', title: '第一个程序：从源码到运行', body: R`① 新建 hello.cpp，写标准骨架（include 头文件、main、cout 输出、return 0）；② 终端敲 **g++ hello.cpp -o hello**；③ 运行得到的可执行文件。
四步走：写源码 → 编译 → 链接得到可执行文件 → 运行。
「改了代码必须重新编译」——与 Python 直接跑是本质区别，这是 C++ 的第一直觉。` },
    { id: 'ph04', title: '怎么读 C++ 报错', body: R`C++ 报错（尤其涉及模板/STL）动辄几十行——**别慌，策略有三**：
① 只看编译器给出的**第一个** error；② 在长报错里搜索**你自己文件的名字与行号**；③ 模板报错看最后的 required from 链。
开启 **-Wall**：初学阶段把警告当错误修。链接错误看「undefined reference」——多半是函数只有声明没有定义。` },
    { id: 'ph05', title: '命名空间与 using', body: R`**std** 是标准库的命名空间：std::cout、std::string 都要前缀或 using 引入。
**using 声明**（using std::cout）引入单个名字，更可控；**using namespace std** 整体引入——写小练习方便，但**禁止放在头文件**。
初学建议：正式代码老老实实写 std:: 前缀，肌肉记忆从第一天养成。` },
    { id: 'ph06', title: 'C++ Primer 怎么读', body: R`教材主干对应本卡组章序：入门 → 变量与基本类型 → 字符串向量数组 → 表达式语句函数 → 类 → 动态内存拷贝控制 → 泛型与 STL 入门 → 现代 C++。
方法：**每节先读概念，再合上书默写最小示例**，最后做书后习题——本卡组背面就是「最小示例」的提炼。
第 1–7 章与第 12–13 章是主线；输入输出细节、模板元编程可后置。` },
    { id: 'ph07', title: '工具链总览：CMake 与调试', body: R`**编译选项**：-std=c++17、-Wall -Wextra、-g（带调试信息）——记这三个起步够用。
**CMake**：多文件项目的构建系统事实标准——文件超过两三个时再学。
**gdb / lldb**：单步调试；**AddressSanitizer**（-fsanitize=address）抓内存错误——进入动态内存章后必开。` },
    { id: 'ph08', title: 'C++ 学习路径建议', body: R`① 入门 + 类型章打底（引用、const、指针画内存图）；② string/vector/迭代器写熟，先会用标准库；③ 类与拷贝控制理解「对象从生到死」；④ 智能指针是现代 C++ 的分水岭；⑤ STL 算法 + lambda 解决 90% 日常需求。
节奏参考：每天 10 张卡 + 每周一个小项目（词频统计、通讯录）。
心态：C++ 广而深——按 ORDER 走，别在模板章死磕而跳过 STL 实用主义。` }
  ];

  const BEGINNER = ['start', 'types'];
  return { BEGINNER: BEGINNER, id: 'cppl', name: 'C++', short: 'C++', icon: '➕', kind: 'qa', group: 'skill', CATS: CATS, DATA: DATA, META: META, HELP: HELP, REL: {}, PITFALL: PITFALL, MNEM: {}, ORDER: ['start', 'types', 'seq', 'expr', 'cls', 'mem', 'stl', 'modern'] };
})();
