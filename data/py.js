/*
 * Python 知识 · 知识点记忆数据库
 * 依据：Python 三.x 通用核心语法与工程常识（入门到中级系统学习）
 * 结构与其他学科一致：id / cat / title / front / back + META / REL / PITFALL / MNEM
 * 说明：无例题学科；kind: 'qa' 驱动 UI 适配。
 * 注意：正文刻意避开会被渲染器/校验器误解的写法——幂运算符用文字描述、不写反斜杠转义、
 *       不出现"小写字母+数字"样式的标识符。
 */
window.SUBJECTS = window.SUBJECTS || {};
window.SUBJECTS.py = (function () {
  'use strict';
  const R = String.raw;

  const CATS = {
    var: '变量与数据类型',
    list: '列表与元组',
    cond: '条件判断',
    dict: '字典',
    loop: '输入与 while',
    func: '函数',
    cls: '类与面向对象',
    file: '文件与异常',
    test: '测试'
  };

  const F = (id, cat, title, front, back) => ({ id, cat, title, front, back });

  const DATA = [
    // ==================== v1.41 教材化重构 ·《Python 编程：从入门到实践》====================
    F('pp01', 'var', '变量与命名规则',
      R`想把一段消息存起来稍后使用——Python 怎么定义变量？命名有什么规矩？`,
      R`变量是**贴在值上的名字**：赋值即创建，无需声明类型（动态类型）。
~~~python

message = "Hello, Python!"   # 赋值即创建变量，无需声明类型
print(message)               # 引用变量打印值
~~~
命名规则：只用字母、数字、下划线，不能以数字开头，不能与关键字重名；惯例**小写加下划线**（user_name）。
陷阱：变量名拼错不会报"未定义变量名"以外的提示——NameError 十有八九是拼写错或大小写错。`),
    F('pp02', 'var', '字符串与引号',
      R`一段文字怎么存？单引号双引号有区别吗？`,
      R`字符串用单引号或双引号包住——**两者等价**，嵌套时换用可避免转义（"She said 'hi'"）。
~~~python

name = "Ada"        # 双引号
greeting = 'Hello'  # 单引号：两者等价
~~~
空格也是字符：带空格的串与不带的不同。字符串**不可变**——所有"修改"操作都返回新串，原串永远不变。`),
    F('pp03', 'var', '字符串常用方法',
      R`想让名字首字母大写、去掉首尾空格——用什么方法？`,
      R`title() 每个单词首字母大写；upper()/lower() 全大/全小；strip() 去首尾空格（lstrip/rstrip 单边）；replace(旧, 新) 替换。
~~~python
name = "ada lovelace"
print(name.title())   # Ada Lovelace
s = "  hi  "
print(s.strip())      # hi
~~~
方法返回**新字符串**——必须接住结果（name = name.title()），不接住等于白调。`),
    F('pp04', 'var', 'f-string 格式化字符串',
      R`想把变量的值嵌进一句话输出——怎么写最顺手？`,
      R`**f-string**：字符串前加 f，花括号里放变量或表达式，运行时求值替换——Python 3.6 起的标准写法。
~~~python

first = "ada"
last = "lovelace"
full = f"{first} {last}"          # 花括号里直接放变量
print(f"Hello, {full.title()}!")  # 花括号里也能调方法
~~~
花括号里可以直接调用方法甚至做运算（{2 + 3}）。旧的加号拼接与 format() 能看懂即可，新代码一律 f-string。`),
    F('pp05', 'var', '数字与运算符',
      R`整数和小数怎么运算？最著名的精度坑是什么？`,
      R`/ 真除法永远得 float；// 整除向下取整；两个星号是幂；求余用百分号（判断奇偶：n 求余 2 是否为 0）。
~~~python
print(3 / 2)     # 1.5
print(3 // 2)    # 1
print(2 ** 10)   # 1024
print(0.1 + 0.2) # 0.30000000000000004
~~~
float 有**二进制精度误差**——相等判断别直接比较，金额计算用整数（分）或 decimal 库。大数字可加下划线提高可读性：1_000_000。`),
    F('pp06', 'var', '注释与 Python 之禅',
      R`怎么写注释？Python 社区推崇什么代码哲学？`,
      R`注释以井号开头（整行或行尾），解释器完全忽略——写**为什么这么做**，而不是复述代码做了什么。
~~~python
# 用 title() 统一姓名格式，避免手工大小写
print(name.title())
~~~
终端敲 import this 查看《Python 之禅》：**可读性至上**、明确优于隐晦、简洁优于复杂——写代码先让"六个月后的自己"看懂。`),
    F('pp07', 'list', '列表与索引访问',
      R`一组有序的东西怎么存？怎么取第一个、最后一个？`,
      R`列表是**有序、可变**的集合，方括号包住、逗号分隔；**索引从 0 开始**，负索引从尾部数（负一即最后一个）。
~~~python

bikes = ['trek', 'cannondale', 'redline']
print(bikes[0])    # trek（索引从 0 起）
print(bikes[-1])   # redline（负索引 = 从尾数）
~~~
越界访问报 IndexError——拿不准长度先用 len()。空列表写成一对空方括号。`),
    F('pp08', 'list', '增删改元素',
      R`列表建好后怎么添加、删除、修改元素？`,
      R`append 尾部追加；insert(位置, 值) 定点插入；del 语句按索引删；pop(索引) 弹出**并返回**该值；remove(值) 按值删第一个匹配；赋值改元素。
~~~python
motorcycles = ['honda', 'yamaha']
motorcycles.append('suzuki')
first = motorcycles.pop(0)     # 弹出 honda
motorcycles.remove('yamaha')
motorcycles[0] = 'bmw'
~~~
陷阱：remove 只删**第一个**匹配（重复值要循环删）；对空列表 pop 会报错。`),
    F('pp09', 'list', '排序与长度',
      R`怎么永久排序、临时排序、反转一个列表？`,
      R`sort() **永久**排序（reverse=True 倒序）；sorted() 返回排好的**新列表**、原列表不动——只想展示时用它；reverse() 原样反转（不管字母序）；len() 求长度。
~~~python
cars = ['bmw', 'audi', 'toyota']
print(sorted(cars))   # 临时排序
cars.sort()           # 永久排序
~~~
sort/sorted 默认按字母序——列表里混有数字和字符串会报 TypeError。`),
    F('pp10', 'list', 'for 遍历列表',
      R`对列表里每个元素做同样的事——怎么写循环？`,
      R`**for 循环**：for 变量 in 列表加冒号，缩进块对每个元素执行一次。
~~~python

magicians = ['alice', 'david', 'carolina']
for m in magicians:   # m 依次取每个元素
    print(m)          # 缩进行 = 循环体
~~~
缩进是语法本体：缩进的行在循环内，**第一条不缩进的行就是循环结束**。命名惯例：列表复数、循环变量单数（for cat in cats）。循环后想做总结就写在缩进块外。`),
    F('pp11', 'list', 'range 与列表推导式',
      R`想生成一串数字做统计、或一行生成一个新列表？`,
      R`range(起, 止, 步长) **含头不含尾**；list(range()) 直接转列表；min/max/sum 快速统计。
~~~python
digits = list(range(1, 10))
squares = [v ** 2 for v in range(1, 6)]
print(min(digits), max(digits), sum(digits))
~~~
**列表推导式**（方括号里表达式加 for）一行生成整个列表——Pythonic 的标志写法；看不懂时先写成普通 for 循环，熟练后再合并。`),
    F('pp12', 'list', '切片与列表复制',
      R`只要列表的前三个元素？想复制一份列表互不影响？`,
      R`切片 [起:止] **含头不含尾**，省略一头即到边界；负索引也可用于切片。
~~~python
players = ['charles', 'martina', 'michael', 'eli']
print(players[:3])    # 前 3 个
print(players[-3:])   # 后 3 个
copy = players[:]     # 复制整个列表
~~~
**复制列表必须用切片[:]或 list()**——直接赋值只是复制引用，两个名字指向同一个列表，改一个动俩（经典坑）。`),
    F('pp13', 'list', '元组：不可变序列',
      R`一组不该被修改的值（坐标系、常量配置）怎么存？`,
      R`**元组**用圆括号——不可变的列表：索引、遍历、len 全部同列表，但修改元素直接 TypeError。
~~~python
dimensions = (200, 50)
for d in dimensions:
    print(d)
~~~
要"修改"只能给整个元组重新赋值（合法——等于换了个新元组）。单元素元组必须带逗号：(3,)，否则只是带括号的数字。`),
    F('pp14', 'cond', 'if 语句与缩进块',
      R`满足条件才执行一段代码——Python 的判断怎么写？`,
      R`if 条件后**必须加冒号**，缩进块内的行受条件控制；条件为 True 执行、False 跳过。
~~~python
age = 19
if age >= 18:
    print("You can vote!")
print("always runs")   # 不缩进 = 条件之外
~~~
与 C 系的差异：条件不用圆括号包、块不用花括号——**冒号加缩进就是语法**。同块缩进必须一致。`),
    F('pp15', 'cond', '条件测试：==、and、or、in',
      R`相等、不等、并且、或者、包含——判断表达式怎么组合？`,
      R`== 相等、!= 不等、大于小于比较、and/or/not 逻辑组合、in / not in 检查列表成员——条件测试的结果是 True/False。
~~~python
car = 'bmw'
print(car == 'bmw')               # True（== 比较；= 是赋值）
print(car != 'audi')              # True
print('bmw' in ['audi', 'bmw'])   # True
~~~
字符串比较**大小写敏感**（'Audi' 不等于 'audi'）——忽略大小写先统一 lower() 再比。`),
    F('pp16', 'cond', 'if-elif-else 链',
      R`按分数分等级这种多档判断怎么写？`,
      R`if / elif（可多个）/ else 三段式，**自上而下命中即停**——顺序有意义，范围条件按同一方向排列、别交叉。
~~~python
if score >= 90:
    grade = 'A'
elif score >= 80:
    grade = 'B'
else:
    grade = 'C'
~~~
区分两种场景：**互斥档位**用 elif 链（命中一个就停）；**彼此独立**的检查用多个平行的 if（每个都判断）。`),
    F('pp17', 'cond', '列表判空',
      R`循环处理搜索结果前，怎么先确认列表里有东西？`,
      R`空列表在布尔上下文为 **False**——if some_list 就是判"非空"，这是 Pythonic 的惯用判空。
~~~python
if req:
    for item in req:
        print(item)
else:
    print("没有找到任何结果")
~~~
处理用户输入、文件内容、搜索结果前先判空——避免"程序没报错但什么都没发生"的静默失败。`),
    F('pp18', 'dict', '字典与安全访问',
      R`键值对映射（名字对应电话）怎么存？键不存在怎么办？`,
      R`**字典**是一系列键值对，花括号包住；方括号加键访问（键不存在报 KeyError）；**get(键, 默认值)** 安全访问——不存在返回默认值而不是崩溃。
~~~python

alien = {'color': 'green', 'points': 5}
print(alien['color'])          # green（键必须存在）
print(alien.get('speed', 0))   # 0（键不存在给默认值）
~~~
键通常是字符串或数字；值可以是任何类型。需要"查不到就当默认"的逻辑一律 get，而不是先判再取。`),
    F('pp19', 'dict', '增删改键值对',
      R`字典怎么加新键、改值、删键值对？`,
      R`赋值即写入：键存在则改、不存在则增；del 按键删除整对。
~~~python

alien = {'color': 'green'}
alien['points'] = 5          # 键不存在 → 新增
alien['color'] = 'yellow'    # 键已存在 → 修改
del alien['points']          # 按键删除整对
~~~
**空字典起步、逐步填充**是常见模式（逐个收集用户输入）。陷阱：想"取值顺便默认"用 get；想"没有就创建"用 setdefault 或 get 加回写。`),
    F('pp20', 'dict', '遍历字典',
      R`想同时拿到键和值遍历字典？只要键或只要值呢？`,
      R`**items()** 同时返回键值对（解包给两个变量）；keys() / values() 单边遍历（默认遍历键，keys() 可省略）。
~~~python
fav = {'jen': 'python', 'sara': 'c'}
for name, lang in fav.items():
    print(name, '->', lang)
~~~
values() 可能重复——要统计"有哪些不同值"用 set(fav.values()) 去重。遍历中增删字典键是禁忌（会报错），先收集再处理。`),
    F('pp21', 'dict', '嵌套结构',
      R`一群对象各有属性、一个对象带多个标签——怎么组合存储？`,
      R`两大嵌套模式：**列表里放字典**（批量同构对象）、**字典里放列表**（对象带多值属性）。
~~~python
aliens = [{'color': 'green'}, {'color': 'yellow'}]
pizza = {'crust': 'thick', 'toppings': ['mushroom', 'cheese']}
~~~
嵌套**别超过两层**——再深就该拆函数或引入类。访问链式下钻：aliens[0]['color']、pizza['toppings'][0]。`),
    F('pp22', 'loop', 'input 与类型转换',
      R`问用户年龄再做比较——input 返回的是什么类型？`,
      R`**input() 永远返回字符串**——参与数学比较前必须 int()/float() 转换，这是新手第一大坑。
~~~python
age = input("How old are you? ")
age = int(age)
if age >= 18:
    print("adult")
~~~
转换非数字文本抛 ValueError——用户输入永远先假定不可靠（见异常章）。求余判断奇偶：n % 2 == 0 为偶数。`),
    F('pp23', 'loop', 'while 循环',
      R`不知道要循环几次、用户说退出才停——用什么循环？`,
      R`**while 条件:** 在条件为真期间反复执行——适合"次数不确定"；for 适合"遍历已知集合"。
~~~python

msg = ''
while msg != 'quit':      # 条件为真就反复执行
    msg = input("> ")
    print(msg)
~~~
多重退出条件用一个**标志位**（active = True，循环内置 False）更清晰。条件永远真且无出口就是死循环——终端 Ctrl+C 逃生。`),
    F('pp24', 'loop', 'break 与 continue',
      R`循环内想"立即结束"或"跳过这一轮"——两个关键字怎么用？`,
      R`**break** 立即结束整个循环；**continue** 跳过本轮剩余代码、回到循环条件判断。
~~~python
while True:
    city = input("> ")
    if city == 'quit':
        break
    if city == 'skip':
        continue
    print(city.title())
~~~
两者只作用于**最近一层**循环——嵌套循环里想影响外层用标志位。用 while True 加 break 的写法要保证 break 一定可达。`),
    F('pp25', 'loop', 'while 处理列表',
      R`边处理边清空一个列表、或删光所有指定元素？`,
      R`while 列表名 利用空列表为假——逐个弹出直到清空；删光指定值：while 值 in 列表: 列表.remove(值)。
~~~python
pets = ['dog', 'cat', 'rabbit']
owners = []
while pets:
    owners.append(pets.pop())
~~~
**for 遍历时增删同一列表是禁忌**——会跳过元素；删除场景用 while 或遍历副本（for x in lst[:]）。`),
    F('pp26', 'func', '定义函数与实参形参',
      R`一段代码要反复使用——怎么封装成函数？`,
      R`**def 函数名(形参):** 定义；调用时传**实参**，按位置对应传给形参。
~~~python

def greet(username):          # username 是形参
    print("Hello, " + username.title() + "!")

greet('ada')                  # 'ada' 是实参
~~~
函数名小写加下划线、见名知义（动词开头）。定义不等于执行——函数体只在被调用时运行。函数是"复用"的起点：写第二遍相似代码时就该抽成函数。`),
    F('pp27', 'func', '关键字实参与默认值',
      R`参数多记不住顺序？想给参数一个默认值？`,
      R`**位置实参**按顺序对位；**关键字实参**点名传递、顺序随意；**默认值**让参数可省略。
~~~python

def describe(pet, animal='dog'):   # animal 带默认值
    print(animal, pet)

describe(animal='cat', pet='tom')  # 关键字实参：顺序随意
~~~
规则：默认值形参必须排在无默认值形参**之后**。**可变默认值是知名陷阱**（默认列表/字典会被多次调用共享）——默认写 None，函数体内再新建。`),
    F('pp28', 'func', '返回值',
      R`函数算出的结果怎么交回给调用方？`,
      R`**return** 把值交回调用处，并**立即结束函数**（其后的语句不执行）。
~~~python
def get_full(first, last):
    return (first + ' ' + last).title()

musician = get_full('jimi', 'hendrix')
~~~
可返回任何类型（含字典/列表——一次交回一组结果）。没有 return 的函数返回 None。返回值常配合可选实参：形参默认空串，函数内 if 处理缺省。`),
    F('pp29', 'func', '传列表：引用与副本',
      R`把列表传给函数，函数里改了它，外面的原列表会变吗？`,
      R`函数拿到的是**引用**——函数内 append/pop 等修改**会作用到原列表**（适合真实更新场景）；不想被改就传**副本** lst[:]。
~~~python
def clear(lst):
    while lst:
        lst.pop()

users = ['a', 'b']
clear(users[:])   # 原列表安全
~~~
先明确设计意图再决定传原列表还是副本——"函数有没有副作用"要有意识。`),
    F('pp30', 'func', '任意数量实参',
      R`参数个数不定（任意种配料、任意个键值属性）怎么定义函数？`,
      R`**单星形参**收集多余位置实参为**元组**；**双星形参**收集关键字实参为**字典**。
~~~python
def make_pizza(size, *toppings):
    print(size, toppings)

def build(**info):
    print(info)

make_pizza(12, 'mushroom', 'cheese')
build(name='ada', job='math')
~~~
混排顺序固定：普通参数、单星、双星。惯例命名：单星 args、双星 kwargs。`),
    F('pp31', 'func', '模块与 import',
      R`写好的函数想跨文件复用——导入怎么写？`,
      R`**import 模块名** 后用"模块名.函数"调用；from 模块 import 函数 直接用函数名；as 起别名。
~~~python
import pizza
pizza.make_pizza(12, 'pepperoni')

from pizza import make_pizza as mp
mp(16, 'cheese')
~~~
标准库同理：import json、from collections import OrderedDict。**自己命名的文件别与标准库重名**（建一个 json.py 会让 import json 变成导入你自己的文件——经典事故）。`),
    F('pp32', 'cls', '类与 __init__',
      R`一类对象（狗）有共同属性和行为——怎么用类建模？`,
      R`**类**是创建实例的蓝图；**__init__** 方法在创建实例时自动运行；**self** 指向实例本身、必须排第一个参数；self.属性 = 值 创建属性。
~~~python

class Dog:
    def __init__(self, name, age):  # 创建实例时自动运行
        self.name = name            # self.属性 = 挂到实例上
        self.age = age

    def sit(self):                  # 方法的第一个参数永远是 self
        print(self.name, 'sat down.')
~~~
类名用**大驼峰**（Dog、ElectricCar）；方法第一个参数永远是 self（调用时不用传）。`),
    F('pp33', 'cls', '创建实例与调用方法',
      R`类定义好了，怎么造出具体对象并使用它？`,
      R`类名加括号即创建**实例**——实参传给 __init__（self 自动传入）；点号访问属性、调用方法。
~~~python

my_dog = Dog('Willie', 6)   # 类名加括号 = 创建实例
print(my_dog.name)          # 点号访问属性
my_dog.sit()                # 点号调用方法
~~~
每个实例的属性**各自独立**——再造一只狗不影响 my_dog。给属性设默认值（self.age = 0）可让部分实参可选。`),
    F('pp34', 'cls', '通过方法修改属性',
      R`里程数会增加——属性是直接改，还是通过方法改？`,
      R`三种途径：外部直接赋值、**更新方法**、**增量方法**。用方法包裹修改能加校验逻辑——这是封装的价值。
~~~python
def increment(self, miles):
    if miles >= 0:
        self.odometer += miles
~~~
直接赋值（my_car.odometer = 23）合法但绕过校验——Python 靠**约定自律**：状态修改走方法，直接赋值只用于简单场景。`),
    F('pp35', 'cls', '继承与 super',
      R`电车是汽车的特例——不想复制粘贴父类代码怎么办？`,
      R`**class 子类(父类)**——子类自动获得父类全部属性与方法；**super().__init__()** 让父类处理公共部分，子类只写增量。
~~~python

class ElectricCar(Car):          # 括号里是父类：自动继承其属性方法
    def __init__(self, make):
        super().__init__(make)   # 公共部分交给父类初始化
        self.battery = 75        # 子类新增属性
~~~
子类定义与父类**同名方法**即重写（覆盖）。继承表达 **is-a** 关系——"电车是一种汽车"成立才继承，别为省几行代码强行继承。`),
    F('pp36', 'cls', '组合：实例作属性',
      R`电池的细节越写越多，电车类太臃肿——怎么拆分？`,
      R`把一大块属性与行为拆成**独立的类**，作为属性挂进主类——组合（has-a）。
~~~python
self.battery = Battery()   # 在 ElectricCar.__init__ 里
print(my_car.battery.describe())
~~~
继承是 is-a、组合是 has-a，两者互补：拆出的类各自简单、主类保持清晰。描述细节变多时优先考虑组合。`),
    F('pp37', 'cls', '导入类',
      R`类写在一个文件里，主程序在另一个文件——怎么导入？`,
      R`与导入函数完全同法：from 模块 import 类（可多个、可 as 别名）；import 模块 后用 模块.类名。
~~~python
from car import Car, ElectricCar
my_car = ElectricCar('tesla')
~~~
标准库的类同理：from collections import OrderedDict。组织惯例：一个模块围绕一类事物（models.py 放全部模型类），避免一个文件塞下所有代码。`),
    F('pp38', 'file', '读文件与 with',
      R`想读一个文本文件的全部内容——最稳妥的写法是什么？`,
      R`**with open(路径) as 变量:**——块结束时**自动关闭**文件，不写 close 也不会泄漏句柄；read() 一次读全部。
~~~python

with open('pi.txt') as f:   # with 块结束自动关闭文件
    contents = f.read()     # 一次读入全部内容
print(contents.rstrip())    # 去掉末尾多余空行
~~~
相对路径相对**运行目录**；文件不存在报 FileNotFoundError。rstrip() 去掉读入文本末尾的多余空行。`),
    F('pp39', 'file', '逐行读取',
      R`文件很大不想一次读进内存，或要按行处理——怎么逐行读？`,
      R`文件对象**可直接 for 遍历**（逐行）；readlines() 一次拿行列表（文件不大时用）。
~~~python
with open('pi.txt') as f:
    for line in f:
        print(line.rstrip())
~~~
**每行末尾自带换行符**，print 又会加一个——所以处理前 rstrip()/strip() 是标配动作。累积内容用字符串拼接或列表收集。`),
    F('pp40', 'file', '写文件与打开模式',
      R`分析结果想存成文件——新建、覆盖、追加各怎么写？`,
      R`open 第二个参数：**'w' 写入（清空重建！）'a' 追加 'r' 读取（默认）**。
~~~python
with open('log.txt', 'w') as f:
    f.write("I love Python.\n")

with open('log.txt', 'a') as f:
    f.write("one more line\n")
~~~
write() **不自动换行**——换行符自己写。'w' 打开已有文件会**立刻清空**——误用即丢数据，追加场景一律 'a'。`),
    F('pp41', 'file', '异常：try-except-else',
      R`用户输的不是数字、文件不存在——程序不想崩溃怎么办？`,
      R`**try 包可能出错的代码；except 捕获指定异常**——出错走 except 而非崩溃；**else** 在无异常时执行。
~~~python

try:
    answer = int(input("数字? "))   # 可能出错的一句
except ValueError:                  # 捕获指定类型
    print("这不是数字")
else:                               # 无异常才执行
    print("平方是", answer ** 2)
~~~
常见类型：ValueError、ZeroDivisionError、FileNotFoundError。**裸 except（不写类型）会吞掉一切**——至少写明异常类型。`),
    F('pp42', 'file', '静默失败与 pass',
      R`有些失败本来就该被忽略（清理临时文件）——怎么"安静地"处理？`,
      R`except 块里写 **pass** 表示明确选择忽略——即"静默失败"。
~~~python
try:
    os.remove(path)
except FileNotFoundError:
    pass   # 文件本来就不存在，忽略
~~~
它同时会吞掉隐藏的 bug——纪律：**每个 pass 都注明忽略原因**；调试期先打印异常再降级为 pass。`),
    F('pp43', 'file', 'json 持久化',
      R`记住用户名、下次打开还在——怎么把数据存进文件？`,
      R`**json.dump(数据, 文件对象)** 写入、**json.load(文件对象)** 读出——JSON 是跨语言通用格式，列表/字典原样往返。
~~~python

import json                              # 标准库，无需安装
with open('num.json', 'w') as f:
    json.dump([3, 1, 4], f)              # 把对象写成 JSON 文件
~~~
配合 try/except FileNotFoundError 实现"首次使用"分支（没有记录文件就是新用户）——记住偏好的标准套路。`),
    F('pp44', 'test', '为什么要自动化测试',
      R`函数改了一处、怕弄坏别处——怎么快速确认没坏？`,
      R`**自动化测试**给函数定下"输入对应期望输出"的契约，改动后一键验证全部场景——比手动逐个点验快且不会遗漏。
~~~python
# 目标：get_full('janis', 'joplin') 应返回 'Janis Joplin'
# 让代码自动做这个验证，而不是每次手动运行
~~~
测试也是文档：看测试就知道函数怎么用。写测试是"一次性脚本"与"可维护代码"的分水岭。`),
    F('pp45', 'test', 'unittest 断言与运行',
      R`具体怎么写并运行一个测试？`,
      R`测试类继承 **unittest.TestCase**；测试方法以 **test_ 开头**才会被执行；assertEqual(实际, 期望) 断言相等（还有 assertTrue、assertIn 等）。
~~~python
import unittest
from names import get_full

class Tests(unittest.TestCase):
    def test_full(self):
        self.assertEqual(get_full('janis', 'joplin'), 'Janis Joplin')

unittest.main()
~~~
输出：句点为通过、F 为失败——失败只说明该场景不符，逐个修到全绿。`),
    F('pp46', 'test', 'setUp 与测试类',
      R`每个测试都要先创建同样的对象——重复代码怎么消掉？`,
      R`**setUp()** 方法在每个测试方法**之前自动运行**——公用实例创建一次的代码放这里，存进 self 供各测试使用。
~~~python
class TestSurvey(unittest.TestCase):
    def setUp(self):
        self.survey = Survey('lang?')

    def test_store(self):
        self.survey.store('Python')
        self.assertIn('Python', self.survey.answers)
~~~
setUp 保证每个测试从**干净状态**开始、互不影响。测试代码与产品代码一起维护——改功能先改测试。`),
    F('pp47', 'var', 'str() 类型转换与拼接陷阱',
      R`"年龄是" + 18 会发生什么？怎么正确拼接数字？`,
      R`字符串只能和字符串拼接——直接加数字抛 **TypeError: can only concatenate str**。用 str() 把数字转成字符串再拼，或直接用 f-string。
~~~python
age = 18
# print("年龄是" + age)      # TypeError！
print("年龄是 " + str(age))  # 显式转换
print(f"年龄是 {age}")       # f-string 自动转换（推荐）
~~~
注释：第一行是新手最常见报错；str()/int()/float() 是三种最常用的显式转换。`),
    F('pp48', 'var', '常量惯例：全大写命名',
      R`Python 没有真正的常量——怎么告诉别人"这个值别改"？`,
      R`惯例：**全大写加下划线**（MAX_CONNECTIONS）——语法上仍可修改，但全大写是"请勿修改"的强约定。
~~~python
MAX_RETRIES = 3          # 约定：运行期间不要改
SLOWDOWN_LIMIT = 0.5     # 与普通变量区分开
~~~
注释：写在文件顶部（import 之后），函数外的模块级名字。Python 之禅的"命名即文档"。`),
    F('pp49', 'list', 'enumerate：同时拿索引和值',
      R`遍历列表时还想拿到"这是第几个"——怎么办？`,
      R`**enumerate(列表)** 每次产出 (索引, 元素)——比手动维护计数器干净。
~~~python
for index, name in enumerate(players):
    print(index, name)          # 0 alice …

for i, m in enumerate(magicians, start=1):
    print(i, m)                 # 从 1 开始计数
~~~
注释：start=1 指定起始编号；解包到两个变量是标准写法。`),
    F('pp50', 'list', '排序键：key=str.lower',
      R`大小写混排的列表，sort 结果不符合预期怎么办？`,
      R`sort/sorted 支持 **key 参数**——按函数返回值排序。大小写敏感时大写字母排前面，key=str.lower 忽略大小写。
~~~python
cars = ['bmw', 'Audi', 'toyota']
print(sorted(cars))                  # ['Audi', 'bmw', 'toyota']（码点序）
print(sorted(cars, key=str.lower))   # ['Audi', 'bmw', 'toyota'] 按小写比
~~~
注释：key 接一个函数，对每个元素求值后按返回值排序；还可以 key=len 按长度排。`),
    F('pp51', 'cond', '布尔值与 bool()',
      R`什么值算"假"？怎么把任意值转成 True/False？`,
      R`**bool()** 把任何值转布尔。假值只有一小撮：False、None、0、空串、空列表、空字典——其余全是 True。
~~~python
print(bool(0), bool(''), bool([]))   # False False False
print(bool(42), bool('hi'))          # True True
count = 0
active = bool(count)                 # 显式转换，语义清晰
~~~
注释：这就是 if 列表 判空的原理；自定义"是否有效"时用 bool() 表达意图。`),
    F('pp52', 'dict', '字典推导式',
      R`想一行从一个字典造出另一个字典？`,
      R`**字典推导式**：花括号里"键表达式: 值表达式 + for 子句"。
~~~python
words = ['a', 'bb', 'ccc']
lengths = {w: len(w) for w in words}
# {'a': 1, 'bb': 2, 'ccc': 3}

squares = {n: n ** 2 for n in range(1, 5)}
~~~
注释：与列表推导式同族——花括号加冒号即字典版本；复杂数据变换先写普通 for 循环，跑通再压缩。`),
    F('pp53', 'loop', '标志位：多重退出条件',
      R`循环有多个退出条件（用户输入 quit 或数据用完）——怎么不写成面条？`,
      R`用一个**标志变量**统一控制 while，各分支只负责改标志。
~~~python
active = True
while active:
    cmd = input("> ")
    if cmd == 'quit':
        active = False          # 唯一的出口开关
    elif cmd == '':
        continue                # 空输入跳过
    else:
        print(cmd.title())
~~~
注释：退出逻辑集中在一处，比在多个位置写 break 清晰；这就是「while 加标志位」的完整模式。`),
    F('pp54', 'func', '文档字符串 docstring',
      R`函数的说明书写在哪里才"正规"？`,
      R`函数体第一行放**三引号字符串**（docstring）——help() 与各类工具自动读取。
~~~python
def get_full(first, last):
    """返回"名 姓"格式完整姓名，首字母大写。"""
    return (first + ' ' + last).title()

help(get_full)   # 打印 docstring
~~~
注释：docstring 写"做什么/参数含义/返回什么"一句话即可；这与 # 注释不同——# 给读代码的人，docstring 给调用函数的人。`),
    F('pp55', 'func', '没有 return 与 None 返回值',
      R`忘记写 return 的函数返回什么？会埋下什么坑？`,
      R`没有 return（或裸 return）的函数返回 **None**——把结果接住再用时，None 悄悄传出去。
~~~python
def fix_name(name):
    name.title()          # 忘了 return！

r = fix_name('ada')
print(r)                  # None
print(r.title())          # AttributeError！
~~~
注释：报错常在"使用返回值"的地方爆发，但病灶在函数定义——排查时先确认函数有没有 return。`),
    F('pp56', 'cls', '属性默认值与可选信息',
      R`有些属性创建时还不知道（里程从 0 起步）——怎么设默认值？`,
      R`__init__ 里直接给属性赋**默认值**，不必要求调用方传入。
~~~python
class Car:
    def __init__(self, make):
        self.make = make
        self.odometer = 0     # 默认值：新车里程为 0

my_car = Car('audi')          # 不传里程
print(my_car.odometer)        # 0
~~~
注释：默认值适合"客观从某值开始"的属性；"每个实例不同"的属性仍作形参传入。`),
    F('pp57', 'cls', '类风格约定',
      R`类的命名与组织有什么社区惯例？`,
      R`类名**大驼峰**（ElectricCar）；模块名小写（electric_car.py）；类内方法紧跟一个空行分组；docstring 描述类的用途。
~~~python
class ElectricCar(Car):
    """电车：在汽车基础上增加电池属性。"""

    def describe_battery(self):
        print("Battery: " + str(self.battery))
~~~
注释：一个文件一个主类（或一组强相关类）是惯例——与「导入类」一卡的导入组织配套。`),
    F('pp58', 'file', '循环追问直到输入合法',
      R`用户输错不崩溃、也不放弃——一直问到合法为止？`,
      R`while True 加 try/except：转换失败就 continue 重问，成功就 break。
~~~python
while True:
    try:
        age = int(input("年龄? "))
        break              # 转换成功：跳出
    except ValueError:
        print("请输入纯数字")
print("年龄是", age)
~~~
注释：这是"输入校验"的标准骨架——try 包转换、except 接 ValueError、break 只在成功路径。`),
    F('pp59', 'file', '文本分析：split 与计数',
      R`一篇英文文章想统计每个单词出现次数？`,
      R`**split()** 把字符串按空格切成列表，配字典计数——文本分析的起手式。
~~~python
line = "the quick the lazy the dog"
counts = {}
for word in line.split():
    counts[word] = counts.get(word, 0) + 1
print(counts)   # {'the': 3, ...}
~~~
注释：get(word, 0) 取旧计数（无则 0）再加一——"查表累加"惯用法；counts.get 与 setdefault 都值得掌握。`),
    F('pp60', 'test', '先写测试再改代码',
      R`要给函数加新功能——怎么保证不弄坏已有行为？`,
      R`流程：**先为期望行为补一条测试 → 运行确认失败 → 改函数 → 全绿收工**。
~~~python
def test_middle(self):
    r = get_full('wolfgang', 'mozart')
    self.assertEqual(r, 'Wolfgang Mozart')
# 先跑：这条测试红着；改完函数：全绿
~~~
注释：这就是 TDD 的最小闭环（红→绿）；旧测试全部保留——它们是"没弄坏别处"的证据。`),
  ];

  const META = {

    pp01: [5, '概念·变量'], pp02: [4, '语法·字符串'], pp03: [4, '语法·字符串'], pp04: [5, '语法·f-string'], pp05: [4, '规则·数字'], pp06: [2, '规则·注释'],
    pp07: [5, '语法·列表'], pp08: [5, '语法·列表'], pp09: [4, '语法·排序'], pp10: [5, '概念·for 循环'], pp11: [4, '语法·range'], pp12: [5, '陷阱·切片复制'], pp13: [3, '语法·元组'],
    pp14: [5, '语法·if'], pp15: [5, '概念·条件测试'], pp16: [4, '语法·elif 链'], pp17: [3, '概念·判空'],
    pp18: [5, '语法·字典'], pp19: [4, '语法·字典'], pp20: [4, '语法·遍历'], pp21: [3, '概念·嵌套'],
    pp22: [5, '陷阱·input'], pp23: [4, '语法·while'], pp24: [4, '语法·break'], pp25: [3, '概念·while 清列表'],
    pp26: [5, '概念·函数'], pp27: [5, '语法·实参'], pp28: [4, '语法·返回值'], pp29: [4, '陷阱·传列表'], pp30: [3, '语法·不定参'], pp31: [3, '语法·import'],
    pp32: [5, '概念·类'], pp33: [5, '语法·实例'], pp34: [4, '概念·属性修改'], pp35: [5, '概念·继承'], pp36: [3, '概念·组合'], pp37: [3, '语法·导入类'],
    pp38: [4, '语法·读文件'], pp39: [3, '语法·逐行'], pp40: [4, '陷阱·写文件'], pp41: [5, '概念·异常'], pp42: [3, '规则·静默失败'], pp43: [4, '语法·json'],
    pp44: [2, '概念·测试'], pp45: [3, '语法·unittest'], pp46: [3, '语法·setUp'],
    pp47: [3, '陷阱·类型转换'], pp48: [2, '规则·常量'], pp49: [3, '语法·enumerate'], pp50: [3, '语法·排序键'], pp51: [3, '概念·布尔'], pp52: [3, '语法·字典推导'], pp53: [3, '概念·标志位'], pp54: [3, '规则·docstring'], pp55: [4, '陷阱·None 返回'], pp56: [3, '概念·属性默认值'], pp57: [2, '规则·类风格'], pp58: [4, '概念·输入校验'], pp59: [3, '语法·文本分析'], pp60: [3, '概念·TDD'],
  };

  const PITFALL = {

    pp05: R`float 有二进制精度误差（0.1 加 0.2 不精确等于 0.3）——相等判断别直接比较；金额用整数（分）或 decimal 库。`,
    pp12: R`b = a 不是复制列表，是复制引用——改一个动俩；复制用 a[:] 或 list(a)。`,
    pp22: R`input() 永远返回字符串——参与数学计算前必须 int()/float()，这是新手第一大坑。`,
    pp27: R`默认值形参不要用可变对象（列表/字典会被多次调用共享）——默认写 None，函数体内再新建。`,
    pp29: R`函数内 append/pop 会作用到原列表（传的是引用）——不想被改就传副本 lst[:]，并写成有意的约定。`,
    pp40: R`'w' 模式打开已有文件会立刻清空全部内容——追加一律用 'a'；write() 不自动换行。`,
    pp41: R`裸 except 会吞掉包括 bug 在内的一切异常——至少写明异常类型（ValueError 等）。`,
  };

  // —— 帮助栏目文章（检索用，不参与学习调度；内容由原起步章迁移）——
  const HELP = [
    { id: 'pz01', title: 'Python 适合做什么', body: R`**解释型动态语言**：写完直接运行，不用编译——语法接近自然语言，是公认「最适合入门」的通用语言之一。
典型场景：自动化脚本（批量处理文件/表格）、数据分析（pandas 库）、人工智能（PyTorch 等）、爬虫、Web 后端。
不适合：追求极致性能的底层程序、手机 App——知道边界即可，不必纠结。` },
    { id: 'pz02', title: '安装 Python 与版本选择', body: R`去 **python.org** 下载最新稳定版安装；Windows 安装时务必勾选 **Add Python to PATH**（新手第一坑：不勾则终端找不到命令）。
验证：终端敲 python --version 或 py --version，出现版本号即成功。Mac 用户自带 python 3（终端敲 python3）。
版本纠结症不必犯：装最新稳定版即可，各版本语法差异极小。` },
    { id: 'pz03', title: '第一个程序与运行方式', body: R`① 新建文本文件 hello.py，内容一行：print("你好，世界")；② 终端切到该目录，敲 **python hello.py**——看到输出即完成第一次运行。
三个贯穿全程的细节：py 后缀、print 是内置函数、字符串用引号包住。
改代码 → 保存 → 重新运行，这个循环就是 Python 开发的全部节奏。` },
    { id: 'pz04', title: 'REPL：交互式草稿纸', body: R`终端直接敲 **python**（不带文件名）进入交互模式（提示符为三个大于号）：输入一行立刻执行一行，exit() 退出。
用途：当**草稿纸**——不确定某函数怎么用、某表达式结果是什么，先进来试一下再写进文件。
这是「边写边验证」习惯的起点，比反复改文件快得多。` },
    { id: 'pz05', title: '怎么读报错（Traceback）', body: R`报错叫 **Traceback**：**从下往上读**——最后一行是错误类型与说明，往上是调用路径（文件名与行号定位问题所在）。
先认识三大类：SyntaxError（语法写错，没跑起来）、NameError（用了未定义的名字，常是拼写错）、TypeError（类型用错，如数字加字符串）。
心态：报错不是失败，是解释器在指出路——读完报错再改，别瞎猜。` },
    { id: 'pz06', title: '注释与缩进：Python 的门面规矩', body: R`注释：**#** 开头（整行或行尾），解释器直接忽略——写给人看。
缩进是**语法本身**：同一代码块缩进必须一致（惯例 4 个空格），不像 C 系用花括号。IndentationError 是新手最高频报错，混用 Tab 与空格是典型原因。
一开始就用正经编辑器（VS Code），自动缩进与高亮能避开九成格式坑。` },
    { id: 'pz07', title: '工具链总览：编辑器与包管理', body: R`**编辑器**：VS Code 加 Python 扩展（自动补全/报错提示/一键运行）是默认答案。
**第三方包**：pip install 包名——PyPI 上有几十万个现成库，是 Python 生态的护城河。
**虚拟环境**（venv）：给每个项目独立的包空间——初学先知道概念，遇到装包冲突时再回来学。` },
    { id: 'pz08', title: 'Python 学习路径建议', body: R`① 本卡组起步章 + 基础章打底（变量/类型/控制流的直觉）；② 打通控制流后**写小脚本**：猜数字、批量改文件名——输出驱动的学习最牢固；③ 数据结构与字符串是日常主力，多练；④ 函数与面向对象在写过两百行代码后再攻。
节奏参考：每天 10 张卡 + 半小时动手，一个月可写实用脚本。
本卡组用法：起步章先过一遍，之后按 FSRS 节奏滚动，卡壳的卡配合 REPL 实操。` }
  ];

  const BEGINNER = ['var', 'list'];
  return { BEGINNER: BEGINNER, id: 'py', group: 'skill', name: 'Python 知识', short: 'Python', icon: '🐍', kind: 'qa', CATS: CATS, DATA: DATA, META: META, HELP: HELP, REL: {}, PITFALL: PITFALL, MNEM: {}, ORDER: ['var', 'list', 'cond', 'dict', 'loop', 'func', 'cls', 'file', 'test'] };
})();
