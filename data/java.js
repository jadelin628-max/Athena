/*
 * Java · 知识点记忆数据库
 * 依据：Java 核心技术 + Oracle 认证（OCA/OCP）基础框架（面向对象与工程化进阶）
 * 结构与其他学科一致：id / cat / title / front / back + META / PITFALL
 * 说明：无例题学科；kind: 'qa' 驱动 UI 适配。
 */
window.SUBJECTS = window.SUBJECTS || {};
window.SUBJECTS.java = (function () {
  'use strict';
  const R = String.raw;

  const CATS = {
    basic: '基础与 JVM',
    oop: '面向对象',
    coll: '集合框架',
    exgen: '异常与泛型',
    lib: '常用类与库',
    conc: '并发基础'
  };

  const F = (id, cat, title, front, back) => ({ id, cat, title, front, back });

  const DATA = [
    // ==================== 基础与 JVM ====================
    F('ba01', 'basic', 'Java 的核心特征与运行机制',
      R`Java 的"一次编写，到处运行"是如何实现的？`,
      R`源码编译成**字节码（Bytecode）**→ 由各平台的 **JVM（Java 虚拟机）**解释与即时编译（JIT）执行——字节码是跨平台的中间层。
三大特征：**自动内存管理（GC）**、面向对象、丰富的类库与生态。
角色区分：**JDK**（开发工具包，含编译器）⊇ **JRE**（运行环境）⊇ **JVM**（虚拟机本体）。`),
    F('ba02', 'basic', '基本类型与包装类',
      R`八种基本类型与包装类的对应关系？自动装箱的坑？`,
      R`byte→Byte、short→Short、int→**Integer**、long→Long、float→Float、double→Double、char→Character、boolean→Boolean。
**自动装箱/拆箱**：编译器自动在基本类型与包装类间转换——但包装类是对象（可为 null、驻留缓存）。
经典坑：Integer 缓存 -128 至 127——此区间内两个包装类用相等比较为真、区间外为假；**比较包装类一律用 equals**。`),
    F('ba03', 'basic', 'String 的不可变性',
      R`String 为什么不可变？StringBuilder 与 StringBuffer 的区别？`,
      R`String 内部的字符容器是 **final 的**——创建后不可修改，"修改"实际是创建新对象。
不可变的好处：线程安全、可缓存哈希、字符串池（常量池复用）。
频繁拼接用 **StringBuilder**（非线程安全、快）或 **StringBuffer**（线程安全、慢）——循环中用加号拼接字符串会创建大量临时对象（性能反模式）。`),
    F('ba04', 'basic', 'main 方法与程序入口',
      R`Java 程序的入口签名是什么？`,
      R`public static void main(String[] args)——
**public**：JVM 从外部调用；**static**：不依赖实例即可调用；**void**：不返回值；**String[] args**：命令行参数。
要点：签名必须精确匹配（修饰符顺序可变、参数可用可变参数形式）；一个类可有重载 main 但 JVM 只认这一个。`),
    F('ba05', 'basic', 'equals 与相等比较',
      R`相等比较运算符与 equals 的区别？重写契约是什么？`,
      R`相等比较运算符：**引用比较**（是否同一对象）——基本类型比较值。
**equals**：逻辑相等（默认继承 Object 的引用比较，需重写）。
重写契约：自反、对称、传递、一致、非空返回 false；**重写 equals 必须同时重写 hashCode**（相等的对象必须有相同哈希码——否则 HashMap 行为错乱）。`),
    // ==================== 面向对象 ====================
    F('oo01', 'oop', '类、对象与封装',
      R`Java 的封装如何实现？JavaBean 的惯例？`,
      R`成员变量 **private** + 公共访问器（getter/setter）——通过方法控制读写与校验。
JavaBean 惯例：私有字段 + 公共访问器 + 无参构造器 + 可序列化。
**构造器**：与类同名、无返回类型；未写则编译器提供无参默认构造器（一旦写了有参构造，默认构造器消失——需要无参构造就得显式写）。`),
    F('oo02', 'oop', '继承、super 与方法重写',
      R`Java 的单继承与重写规则是什么？`,
      R`**单继承**：一个类只能 extends 一个父类（多能力通过接口实现）；所有类最终继承 Object。
**重写（Override）**：子类提供同签名方法——注解标记防拼写错误；访问权限不能更严、异常不能更宽；**静态方法与私有方法不参与重写**（隐藏与重定义）。
super 调用父类构造器必须在其构造器第一行；父类无无参构造时必须显式 super 带参。`),
    F('oo03', 'oop', '多态与动态绑定',
      R`多态如何工作？什么时候调用父类方法？`,
      R`父类引用指向子类对象：$$父类引用 = new 子类()$$ 调用**被重写的实例方法**时执行**子类版本**（动态绑定/晚绑定）。
但：**字段与静态方法没有多态**——按引用的编译期类型解析（"字段隐藏"）。
经典应用：集合存父类型、遍历调子类行为（策略模式的雏形）；instanceof 判真实类型后向下转型。`),
    F('oo04', 'oop', '抽象类与接口',
      R`抽象类与接口的区别与选择？`,
      R`**抽象类**（abstract class）：可有状态（字段）、构造器、具体方法——"是什么"的部分实现；单继承。
**接口**（interface）：纯行为契约（Java 八起可有 default 与 static 方法实现）——"能做什么"的承诺；可多实现。
选择：共享状态与模板代码 → 抽象类；定义能力契约、需要多重继承效果 → 接口。接口配合函数式接口是 lambda 的基础。`),
    F('oo05', 'oop', 'static 与 final',
      R`static 与 final 修饰成员的含义？static 块何时执行？`,
      R`**static**：属于类而非实例——静态字段全类共享一份、静态方法无 this 不能访问实例成员；**静态初始化块**在类首次加载时执行一次。
**final**：类不可继承（如 String）、方法不可重写、变量不可重新赋值（基本类型值不变、引用指向不变但对象内容可变）。
static final 常量命名全大写下划线分隔。`),
    F('oo06', 'oop', '内部类的四种形式',
      R`内部类有哪些形式？静态嵌套类与内部类的区别？`,
      R`① **成员内部类**：依赖外部类实例（可访问外部所有成员）；② **静态嵌套类**：不依赖外部实例（行为如顶层类）；③ **局部类**：方法内定义；④ **匿名类**：定义即实例化（回调与监听器的传统写法，lambda 可替代大部分函数式场景）。
要点：内部类持有外部类引用（隐藏引用可能造成内存泄漏——非静态内部类的长生命周期实例拖着外部类）。`),
    // ==================== 集合框架 ====================
    F('co01', 'coll', '集合框架总览与 List',
      R`集合框架的两大体系？ArrayList 与 LinkedList 如何选择？`,
      R`两大体系：**Collection**（List 有序可重复 / Set 不重复 / Queue 队列）与 **Map**（键值对）。
**ArrayList**：动态数组——随机访问快（下标常数时间）、中间插入删除慢（搬移）；**LinkedList**：双向链表——头尾插删快、随机访问慢（遍历）。
选择口诀：查多用 ArrayList、首尾操作多用 LinkedList（实际绝大多数场景 ArrayList 更快——缓存友好）。`),
    F('co02', 'coll', 'HashMap 的原理',
      R`HashMap 的底层结构与扩容机制？`,
      R`底层：**数组 + 链表 + 红黑树**（链表长度超阈值且数组足够大时树化，查询从线性变对数）。
流程：键的 hashCode 决定桶位置（哈希与扰动）→ 冲突挂链 → **扩容**：容量翻倍、元素重新分布（负载因子默认 0.75，超过即扩容）。
要点：键对象的 hashCode 与 equals 必须正确重写且**一致**——否则存取对不上（"存进去了取不出来"）；线程不安全（并发用 ConcurrentHashMap）。`),
    F('co03', 'coll', 'Set 家族与去重',
      R`HashSet、LinkedHashSet、TreeSet 的区别？`,
      R`**HashSet**：哈希表——最快、无序；**LinkedHashSet**：哈希表 + 链表——保持**插入顺序**；**TreeSet**：红黑树——**按排序规则有序**（自然排序或比较器）、操作对数时间。
去重原理：依赖元素的 hashCode 与 equals——自定义对象去重要重写这两个方法。
选择：默认 HashSet；要保序用 Linked；要排序用 Tree。`),
    F('co04', 'coll', '迭代器与 fail-fast',
      R`迭代器的作用？ConcurrentModificationException 从何而来？`,
      R`**Iterator**：统一遍历接口——hasNext 判断、next 取元素、remove 安全删除（遍历中删除的正确方式）。
**fail-fast**：ArrayList/HashMap 等在迭代期间被结构性修改（非迭代器自己的修改）→ 下一次操作抛并发修改异常——**早期暴露问题**而非静默错乱。
并发遍历修改的正确姿势：迭代器的 remove、或用并发容器（CopyOnWriteArrayList）。`),
    // ==================== 异常与泛型 ====================
    F('ex01', 'exgen', '异常层次与检查型异常',
      R`Java 异常的层次结构？检查型与非检查型的区别？`,
      R`Throwable → **Error**（严重系统错误，不捕获不处理：内存不足、栈溢出）与 **Exception**。
Exception 分：**检查型**（编译器强制 try 或声明抛出——IO、SQL 等外部故障）与非检查型 **RuntimeException**（程序 bug：空指针、越界、类型转换——不强制处理）。
原则：检查型异常"能处理就处理、不能处理就声明抛出"；不要吞异常（空 catch 块）。`),
    F('ex02', 'exgen', 'try-catch-finally 与 try-with-resources',
      R`finally 的执行时机？try-with-resources 的优势？`,
      R`finally **无论如何都执行**（正常、异常、甚至 try 中有 return）——释放资源的兜底（唯一的例外是虚拟机退出）。
**try-with-resources**（Java 七起）：资源类实现 AutoCloseable 接口、在 try 括号内声明——自动关闭、异常抑制处理更干净——**首选**。
多 catch：按子类到父类排序（父类放后否则编译错误）。`),
    F('ex03', 'exgen', '泛型与类型擦除',
      R`泛型的价值是什么？类型擦除的含义？`,
      R`泛型 = **编译期类型安全**的参数化类型：List<String> 只能放字符串——取出来不用强转、错误在编译期暴露。
**类型擦除**：泛型信息只在编译期存在，运行时全部变为原始类型（List）——所以运行时无法获得泛型的实际类型参数、不能 new T()。
通配符：? extends 上界（只读生产者）、? super 下界（只写消费者）——"生产者用 extends、消费者用 super"（PECS 原则）。`),
    // ==================== 常用类与库 ====================
    F('li01', 'lib', 'StringBuilder 与字符串构建',
      R`为什么循环拼接字符串要用 StringBuilder？`,
      R`String 不可变 → 循环拼接每次创建新对象与拷贝（O 的平方复杂度）；**StringBuilder** 内部可变字符容器：append 追加、toString 输出——O(n)。
**StringBuffer**：同 API 但方法带同步（线程安全、单线程场景白白多付锁开销——单线程用 StringBuilder）。
链式调用：new StringBuilder().append(a).append(b).toString()。`),
    F('li02', 'lib', 'java.time 日期时间 API',
      R`新的日期时间 API 相对旧的 Date 有何改进？`,
      R`java.time（Java 八引入，借鉴 Joda-Time）：**不可变**、线程安全、API 清晰——LocalDate（日期）、LocalTime（时间）、LocalDateTime（日期时间）、ZonedDateTime（带时区）、Duration/Period（时间段）。
旧 Date/Calendar：可变、线程不安全、月份从零开始——遗留代码需认识、新代码用 java.time。
格式化：DateTimeFormatter（线程安全的格式化器）。`),
    F('li03', 'lib', 'Lambda 与函数式接口',
      R`什么是函数式接口？lambda 的语法？`,
      R`**函数式接口**：只有一个抽象方法的接口（可标注注解）——lambda 表达式的目标类型。
lambda：参数 -> 表达式或语句块——如排序比较器写成一行的比较逻辑；方法引用（类名：:方法）进一步简化（已有方法直接引用）。
四大内置：Supplier（无参有返）、Consumer（有参无返）、Function（有参有返）、Predicate（返回布尔断言）。
配合 Stream API 是现代 Java 的核心风格。`),
    F('li04', 'lib', 'Stream API 基础',
      R`Stream 的三段式结构与惰性求值？`,
      R`流水线三段：**数据源** → 中间操作（filter 过滤 / map 映射 / sorted 排序——惰性、返回新流）→ 终端操作（collect 收集 / forEach / count / reduce——触发执行）。
**惰性求值**：中间操作不立即执行、终端操作才驱动整条流水线一次遍历。
要点：流不存数据（是数据源的视图）、一次性使用（终端后关闭）；并行流 parallelStream 对 CPU 密集大集合才有收益。`),
    // ==================== 并发基础 ====================
    F('co01x', 'conc', '线程的创建与生命周期',
      R`创建线程的两种方式与线程状态？`,
      R`① 继承 Thread 重写 run；② 实现 Runnable（或 Callable 有返回值）传入 Thread——**推荐后者**（解耦任务与执行、可配线程池）。
生命周期：新建 → 可运行 → 运行 → 阻塞/等待 → 终止。
线程不是越多越好：上下文切换有成本——用**线程池**复用（见下一卡）。`),
    F('co02x', 'conc', 'synchronized 与锁',
      R`synchronized 的三种用法与锁的对象？`,
      R`① 修饰**实例方法**：锁当前对象（this）；② 修饰**静态方法**：锁类的 Class 对象；③ 修饰**代码块**：锁指定对象——保证同一时刻仅一个线程进入临界区。
特性：**可重入**（同线程可重复获得同一把锁）；锁释放只有两种情况——代码块结束或异常。
注意：不同锁对象之间互不阻塞——锁错对象等于没锁。`),
    F('co03x', 'conc', 'volatile 与可见性',
      R`volatile 解决什么问题？不解决什么？`,
      R`**可见性**：一个线程的写入立即对其他线程可见（禁止工作缓存与指令重排的特定优化）——适合"一写多读"的状态标志位。
**不解决原子性**：volatile 的自增仍是三步操作（读-加-写）会丢更新——原子递增用 Atomic 类或 synchronized。
口诀：volatile 管可见性与有序性、不管原子性。`),
    F('co04x', 'conc', '线程池与 Executor 框架',
      R`为什么用线程池？核心参数有哪些？`,
      R`复用线程避免频繁创建销毁的开销、控制并发上限防资源耗尽、提供任务队列与治理。
核心参数（ThreadPoolExecutor）：核心线程数、最大线程数、**空闲存活时间**、**工作队列**、**拒绝策略**（队列满且到最大线程数时的处理：抛异常/丢弃/调用者执行）。
参数经验：CPU 密集 ≈ 核数、IO 密集 ≈ 核数的倍数或按等待比估算——压测定参数。`),
    F('ba06', 'basic', '数组与增强 for',
      R`Java 数组的声明与遍历写法？`,
      R`声明：int[] arr = new int[长度]（默认零值）或 int[] arr = {1, 2, 3}；长度固定（arr.length 字段）、**不可扩容**（扩容换新数组拷贝）。
遍历：传统 for（需要下标）与**增强 for**（for (元素类型 变量 : 数组或集合)——只读遍历首选）。
越界访问抛 ArrayIndexOutOfBoundsException（Java 有边界检查——比 C 安全）。`),
    F('ba07', 'basic', '运算符与控制流概览',
      R`Java 的控制流与 C 的主要差异？`,
      R`控制流语法与 C 一致（if/switch/for/while——switch 支持**字符串**与枚举，Java 七起）；无 goto（保留字但不可用）；有标号 break/continue（跳出多层）。
**String 的相等比较用 equals**——相等运算符比较引用（字符串池内字面量可能相等但语义上不可依赖）。
三元、短路逻辑与 C 相同。`),
    F('oo07', 'oop', 'Object 类的核心方法',
      R`Object 类有哪些必须掌握的方法？`,
      R`**toString**：字符串表示（打印默认是类名加哈希——通常重写）；**equals 与 hashCode**：相等的契约对（见基础卡）；**getClass**：运行时类型。
其余：clone（浅拷贝，需实现标记接口——争议设计）、wait/notify/notifyAll（线程间通信，与 synchronized 配合）。
所有对象都有这些方法——它们是 Java 面向对象的"根协议"。`),
    F('oo08', 'oop', 'static 与单例模式',
      R`static 的用途？饿汉与懒汉单例的写法？`,
      R`static 字段/方法属于类：无需实例即可访问、全类共享一份；**静态初始化块**在类首次加载时执行一次。
**单例模式**：① 饿汉式——类加载即创建（static final 字段，线程安全、可能提前占用）；② 懒汉式——首次使用创建（需同步保护，双重检查加 volatile）；③ **静态内部类**写法（借助类加载机制天然线程安全且懒加载——推荐）。
私有化构造器防止外部 new。`),
    F('co05x', 'coll', 'TreeMap 与排序接口',
      R`TreeMap 的排序依据？Comparable 与 Comparator 的区别？`,
      R`TreeMap：红黑树实现、按键**排序**遍历（自然排序或构造时传入比较器）——键必须可比较。
**Comparable**（自然排序）：类实现 compareTo 方法——"我与其他人比"；**Comparator**（外部比较器）：独立的比较逻辑——"第三方裁判"，可为同一类型定义多种排序。
用途：自定义对象排序（按字段多级比较：先比字段一再比字段二）。`),
    F('ex04', 'exgen', '自定义异常与异常链',
      R`如何设计自定义异常？异常链是什么？`,
      R`继承 Exception（检查型）或 RuntimeException（非检查型）+ 构造器传消息与原因。
**异常链**：捕获底层异常后包装成业务异常再抛出——把原始异常作为参数传入（保留完整因果栈——getCause 逐层取根因）。
原则：异常类型要有语义（如业务异常、支付失败异常），日志记完整链、对外报友好信息。`),
    F('li05x', 'lib', 'try-with-resources 与文件读写',
      R`文件读写的推荐写法？`,
      R`读文本：Files 类（readAllLines / readString）或 BufferedReader 按行（大文件流式）；写文本：Files.write / BufferedWriter。统一编码参数（标准字符集常量）。
**try-with-resources**：资源类实现 AutoCloseable 接口、在 try 括号内声明——自动关闭（含异常路径）。
路径操作用 **Path 与 Files**（现代 NIO 口径）替代旧的 File 类——不可变、API 更全。`),
    F('li06x', 'lib', 'I/O 流的分类体系',
      R`字节流与字符流的区别？缓冲流的作用？`,
      R`**字节流**（InputStream/OutputStream 家族）：处理一切二进制（图片、序列化）；**字符流**（Reader/Writer 家族）：处理文本、自动处理字符编码转换。
**缓冲流**（Buffered 前缀装饰）：内部缓冲区减少系统调用——裸流逐字节读慢得不可接受，缓冲装饰是标配。
装饰器模式：流可以层层包装（文件流套缓冲流套数据流）。`),
    F('li07x', 'lib', 'Stream API 进阶：常用操作',
      R`流的中问操作与终端操作各有哪些？`,
      R`中间操作（惰性、返回流）：filter 过滤、map 映射、sorted 排序、distinct 去重、limit/skip 截取。
终端操作（触发执行）：collect 收集（配合 Collectors.groupingBy 分组、joining 拼接）、forEach、anyMatch/allMatch、reduce 聚合。
经典组合：列表按属性分组计数、求和平均值、多条件过滤——一条流式语句替代嵌套循环。`),
    F('co05', 'conc', '线程安全的并发容器',
      R`并发场景下用什么容器替代普通集合？`,
      R`**ConcurrentHashMap**：分段细粒度锁（Java 八起 CAS 与同步桶）——并发读写性能远超旧式同步容器；**CopyOnWriteArrayList**：写时复制新数组——读多写少场景无锁读；**BlockingQueue**：阻塞队列——生产者消费者模型的现成实现。
口诀：并发容器优先于"集合加 synchronized 包装"——锁粒度更细、性能更好。
原子类（AtomicInteger 等）用 CAS 无锁更新计数器。`),
    F('co06x', 'conc', '线程间通信：wait 与 notify',
      R`wait/notify 机制的使用规则？`,
      R`必须在 **synchronized 块内**调用（否则抛非法监视器状态异常）：wait 释放锁并等待；notify 唤醒一个等待线程、notifyAll 唤醒全部。
模式：**循环检查条件**——被唤醒后重新检查条件是否成立（防虚假唤醒）：while (条件不满足) { wait(); }
生产者消费者：队列满则生产者 wait、队列空则消费者 wait，操作后 notifyAll。
高层替代：BlockingQueue 的 take 与 put 自动完成等待与通知。`),
  ];

  const META = {
    ba01: [4, 'JVM 机制'], ba02: [4, '包装类缓存'], ba03: [5, 'String 不可变'], ba04: [3, 'main 签名'], ba05: [5, 'equals 契约'],
    oo01: [3, '封装'], oo02: [5, '继承与重写'], oo03: [5, '多态'], oo04: [5, '抽象类与接口'], oo05: [4, 'static 与 final'], oo06: [3, '内部类'],
    co01: [4, 'List 选择'], co02: [5, 'HashMap 原理'], co03: [4, 'Set 家族'], co04: [3, 'fail-fast'],
    ex01: [5, '异常层次'], ex02: [4, 'try-with-resources'], ex03: [4, '泛型擦除'],
    li01: [4, 'StringBuilder'], li02: [3, 'java.time'], li03: [4, 'lambda'], li04: [4, 'Stream'],
    co01x: [3, '线程创建'], co02x: [5, 'synchronized'], co03x: [4, 'volatile'], co04x: [4, '线程池']
  };

  const PITFALL = {
    ba02: R`Integer 缓存区间内相等比较为真、区间外为假——包装类比较一律用 equals。`,
    ba05: R`重写 equals 必须同时重写 hashCode——否则该对象放进 HashMap 后"存进去了取不出来"。`,
    oo06: R`字段与静态方法没有多态——多态只对实例方法生效；值调用会切片。`,
    co02: R`自定义键放进 HashMap 必须重写 hashCode 与 equals，且两者逻辑一致。`,
    co03x: R`volatile 不保证原子性：自增计数仍会丢更新——原子性用 Atomic 类或锁。`
  };

  Object.assign(META, {
    ba06: [3, '数组与遍历'], ba07: [3, '控制流差异'],
    oo07: [4, 'Object 根协议'], oo08: [3, '单例模式'],
    co05x: [4, '排序接口'], ex04: [3, '自定义异常与异常链'], li05x: [3, '文件读写'], li06x: [3, 'IO 流分类'], li07x: [4, 'Stream 进阶'],
    co05: [4, '并发容器'], co06x: [3, 'wait 与 notify']
  });
  Object.assign(PITFALL, {
    ba06: R`增强 for 遍历集合时直接修改集合会抛并发修改异常——删除用迭代器的 remove。`,
    oo08: R`静态内部类单例借助类加载机制天然线程安全且懒加载——推荐写法。`,
    co02: R`负载因子 0.75 是空间与时间的折中；键的 hashCode 质量决定桶分布均匀度。`,
    ex02: R`try-with-resources 的资源在 try 括号内声明——自动关闭且异常抑制处理更干净。`,
    co04x: R`线程池参数不设好就是事故：队列无界可能内存耗尽、拒绝策略没配可能静默丢任务。`
  });

  return { id: 'java', name: 'Java', short: 'Java', icon: '☕', kind: 'qa', group: 'skill', CATS: CATS, DATA: DATA, META: META, REL: {}, PITFALL: PITFALL, MNEM: {}, ORDER: ['basic', 'oop', 'coll', 'exgen', 'lib', 'conc'] };
})();
