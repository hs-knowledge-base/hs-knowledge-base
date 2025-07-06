import type { CodeContent, Language } from '@/types';
import { DEFAULT_LANGUAGES } from '@/constants/editor';

/**
 * 语言模板代码 - 统一的模板管理
 */
export const LANGUAGE_TEMPLATES: Record<Language, string> = {
  javascript: `// 欢迎使用火山知识库代码演练场！
console.log('🔥 Hello from 火山知识库!');

function greet() {
  const messages = [
    '你好，世界！',
    'Hello, World!',
    'Bonjour le monde!',
    'Hola, mundo!',
    'こんにちは、世界！'
  ];
  
  const randomMessage = messages[Math.floor(Math.random() * messages.length)];
  alert(randomMessage);
  console.log('问候消息:', randomMessage);
}

// 展示一些 JavaScript 特性
const features = {
  async: async () => {
    console.log('支持 async/await');
    await new Promise(resolve => setTimeout(resolve, 100));
    console.log('异步操作完成');
  },
  
  destructuring: () => {
    const [first, ...rest] = [1, 2, 3, 4, 5];
    console.log('解构赋值:', { first, rest });
  },
  
  templateLiterals: (name = '开发者') => {
    console.log(\`你好，\${name}！欢迎使用代码演练场。\`);
  }
};

// 运行示例
features.async();
features.destructuring();
features.templateLiterals('火山');`,

  typescript: `// TypeScript 编译测试
console.log('🔥 TypeScript 编译测试开始');

// 接口定义
interface User {
  name: string;
  age: number;
  email?: string;
}

// 类定义
class Animal {
  name: string;

  constructor(name: string) {
    this.name = name;
  }

  move(distance: number = 0): void {
    console.log(\`\${this.name} moved \${distance} meters.\`);
  }
}

// 测试函数
function testTypeScript(): void {
  const output = document.getElementById('output');
  if (!output) return;

  const logs: string[] = [];

  // 测试接口
  const user: User = {
    name: '张三',
    age: 25,
    email: 'zhangsan@example.com'
  };

  logs.push(\`用户信息: \${JSON.stringify(user, null, 2)}\`);

  // 测试类
  const cat = new Animal('小猫');
  cat.move(10);
  logs.push(\`动物: \${cat.name}\`);

  // 测试泛型
  function identity<T>(arg: T): T {
    return arg;
  }

  const result = identity<string>('Hello TypeScript!');
  logs.push(\`泛型测试: \${result}\`);

  // 测试数组和元组
  const numbers: number[] = [1, 2, 3, 4, 5];
  const tuple: [string, number] = ['TypeScript', 2024];
  
  logs.push(\`数组: \${numbers.join(', ')}\`);
  logs.push(\`元组: \${tuple[0]} - \${tuple[1]}\`);

  // 输出结果
  output.innerHTML = logs.map(log => \`<div>\${log}</div>\`).join('');
  
  console.log('✅ TypeScript 编译和执行成功!');
}

// 页面加载完成后自动测试
window.addEventListener('load', () => {
  console.log('页面加载完成');
  setTimeout(() => {
    console.log('开始自动测试 TypeScript 编译...');
    testTypeScript();
  }, 1000);
});`,

  python: `# Python 代码测试 (Brython)
print('🔥 Hello from Python (Brython)!')

# 定义一个类
class Animal:
    def __init__(self, name, species):
        self.name = name
        self.species = species
    
    def speak(self):
        return f"{self.name} the {self.species} says hello!"
    
    def move(self, distance=0):
        print(f"{self.name} moved {distance} meters.")

# 创建动物实例
cat = Animal("小猫", "cat")
dog = Animal("小狗", "dog")

print(cat.speak())
print(dog.speak())

cat.move(5)
dog.move(10)

# Python 特性展示
def fibonacci(n):
    """计算斐波那契数列"""
    if n <= 1:
        return n
    return fibonacci(n-1) + fibonacci(n-2)

# 列表推导式
squares = [x**2 for x in range(1, 11)]
print(f"平方数列表: {squares}")

# 字典操作
user_info = {
    'name': '张三',
    'age': 25,
    'skills': ['Python', 'JavaScript', 'TypeScript']
}

print(f"用户信息: {user_info}")

# 函数式编程
numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
even_numbers = list(filter(lambda x: x % 2 == 0, numbers))
doubled_numbers = list(map(lambda x: x * 2, even_numbers))

print(f"偶数: {even_numbers}")
print(f"偶数的两倍: {doubled_numbers}")

# 斐波那契数列
print("斐波那契数列 (前10项):")
for i in range(10):
    print(f"F({i}) = {fibonacci(i)}")`,

  go: `// Go 代码示例 (GopherJS)
package main

import "fmt"

// 定义结构体
type Person struct {
    Name string
    Age  int
}

// 方法
func (p Person) Greet() string {
    return fmt.Sprintf("Hello, I'm %s and I'm %d years old!", p.Name, p.Age)
}

// 计算斐波那契数列
func fibonacci(n int) int {
    if n <= 1 {
        return n
    }
    return fibonacci(n-1) + fibonacci(n-2)
}

func main() {
    fmt.Println("🔥 Hello from Go (GopherJS)!")
    
    // 创建 Person 实例
    person := Person{Name: "张三", Age: 25}
    fmt.Println(person.Greet())
    
    // 切片操作
    numbers := []int{1, 2, 3, 4, 5}
    fmt.Printf("Numbers: %v\\n", numbers)
    
    // 映射 (Map)
    userInfo := map[string]interface{}{
        "name": "李四",
        "age":  30,
        "city": "北京",
    }
    fmt.Printf("User Info: %v\\n", userInfo)
    
    // 斐波那契数列
    fmt.Println("斐波那契数列 (前10项):")
    for i := 0; i < 10; i++ {
        fmt.Printf("F(%d) = %d\\n", i, fibonacci(i))
    }
}`,

  php: `<?php
// PHP 代码示例 (Uniter)
echo "🔥 Hello from PHP (Uniter)!\\n";

// 定义类
class Animal {
    private $name;
    private $species;
    
    public function __construct($name, $species) {
        $this->name = $name;
        $this->species = $species;
    }
    
    public function speak() {
        return $this->name . " the " . $this->species . " says hello!";
    }
    
    public function move($distance = 0) {
        echo $this->name . " moved " . $distance . " meters.\\n";
    }
}

// 创建实例
$cat = new Animal("小猫", "cat");
$dog = new Animal("小狗", "dog");

echo $cat->speak() . "\\n";
echo $dog->speak() . "\\n";

$cat->move(5);
$dog->move(10);

// 数组操作
$numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
$even_numbers = array_filter($numbers, function($n) {
    return $n % 2 == 0;
});

echo "偶数: " . implode(", ", $even_numbers) . "\\n";

// 关联数组
$user_info = [
    'name' => '张三',
    'age' => 25,
    'skills' => ['PHP', 'JavaScript', 'Python']
];

echo "用户信息: " . json_encode($user_info) . "\\n";

// 函数
function fibonacci($n) {
    if ($n <= 1) {
        return $n;
    }
    return fibonacci($n - 1) + fibonacci($n - 2);
}

echo "斐波那契数列 (前10项):\\n";
for ($i = 0; $i < 10; $i++) {
    echo "F($i) = " . fibonacci($i) . "\\n";
}
?>`,

  java: `// Java 代码示例 (DoppioJVM - 开发中)
public class Main {
    public static void main(String[] args) {
        System.out.println("🔥 Hello from Java (DoppioJVM)!");

        // 创建对象
        Person person = new Person("张三", 25);
        System.out.println(person.greet());

        // 数组操作
        int[] numbers = {1, 2, 3, 4, 5};
        System.out.print("Numbers: ");
        for (int num : numbers) {
            System.out.print(num + " ");
        }
        System.out.println();

        // 斐波那契数列
        System.out.println("斐波那契数列 (前10项):");
        for (int i = 0; i < 10; i++) {
            System.out.printf("F(%d) = %d%n", i, fibonacci(i));
        }
    }

    // 斐波那契函数
    public static int fibonacci(int n) {
        if (n <= 1) {
            return n;
        }
        return fibonacci(n - 1) + fibonacci(n - 2);
    }
}

// Person 类
class Person {
    private String name;
    private int age;

    public Person(String name, int age) {
        this.name = name;
        this.age = age;
    }

    public String greet() {
        return String.format("Hello, I'm %s and I'm %d years old!", name, age);
    }
}`,

  html: `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Hello World</title>
</head>
<body>
  <div id="app">
    <h1>🔥 火山知识库</h1>
    <p>欢迎使用代码演练场！</p>
    <button onclick="greet()">点击问候</button>
  </div>
</body>
</html>`,

  markdown: `# 🔥 火山知识库 - 多语言代码演练场

欢迎使用支持多种编程语言的代码演练场！

## 支持的语言

### 脚本语言
- **JavaScript** - 原生浏览器支持
- **TypeScript** - 编译为 JavaScript
- **Python** - 使用 Brython 运行时
- **PHP** - 使用 Uniter 运行时
- **Go** - 使用 GopherJS 编译
- **Java** - 使用 DoppioJVM (开发中)

### 标记语言
- **HTML** - 网页结构
- **Markdown** - 文档标记
- **CSS** - 样式表
- **SCSS** - CSS 预处理器
- **Less** - CSS 预处理器

## 特性

1. **实时预览** - 代码更改即时生效
2. **多语言支持** - 在浏览器中运行多种语言
3. **控制台输出** - 查看程序运行结果
4. **错误提示** - 友好的错误信息
5. **代码高亮** - Monaco Editor 支持

## 使用方法

1. 选择你想要的编程语言
2. 在编辑器中输入代码
3. 点击运行按钮查看结果
4. 在控制台中查看输出

> **提示**: 每种语言都有示例代码，可以快速开始体验！`,

  css: `body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  margin: 0;
  padding: 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
}

#app {
  background: white;
  padding: 40px;
  border-radius: 12px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
  text-align: center;
  max-width: 400px;
}

h1 {
  color: #333;
  margin-bottom: 16px;
}

p {
  color: #666;
  margin-bottom: 24px;
  line-height: 1.6;
}

button {
  background: #007acc;
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 16px;
  transition: background 0.2s;
}

button:hover {
  background: #005a9e;
}`,

  scss: `// SCSS 示例代码
$primary-color: #007acc;
$secondary-color: #764ba2;
$font-stack: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;

// 混合器
@mixin button-style($bg-color, $text-color: white) {
  background: $bg-color;
  color: $text-color;
  border: none;
  padding: 12px 24px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 16px;
  transition: all 0.2s;

  &:hover {
    background: darken($bg-color, 10%);
    transform: translateY(-2px);
  }
}

body {
  font-family: $font-stack;
  margin: 0;
  padding: 20px;
  background: linear-gradient(135deg, $primary-color 0%, $secondary-color 100%);
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
}

#app {
  background: white;
  padding: 40px;
  border-radius: 12px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
  text-align: center;
  max-width: 600px;

  h1 {
    color: #333;
    margin-bottom: 16px;
    font-size: 24px;
  }

  p {
    color: #666;
    margin-bottom: 24px;
    line-height: 1.6;
  }

  button {
    @include button-style($primary-color);
  }
}`,

  less: `// Less 示例代码
@primary-color: #007acc;
@secondary-color: #764ba2;
@font-stack: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;

// 混合器
.button-style(@bg-color; @text-color: white) {
  background: @bg-color;
  color: @text-color;
  border: none;
  padding: 12px 24px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 16px;
  transition: all 0.2s;

  &:hover {
    background: darken(@bg-color, 10%);
    transform: translateY(-2px);
  }
}

body {
  font-family: @font-stack;
  margin: 0;
  padding: 20px;
  background: linear-gradient(135deg, @primary-color 0%, @secondary-color 100%);
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
}

#app {
  background: white;
  padding: 40px;
  border-radius: 12px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
  text-align: center;
  max-width: 600px;

  h1 {
    color: #333;
    margin-bottom: 16px;
    font-size: 24px;
  }

  p {
    color: #666;
    margin-bottom: 24px;
    line-height: 1.6;
  }

  button {
    .button-style(@primary-color);
  }
}`
} as const;

/**
 * 默认代码模板 - 使用配置化的默认语言设置
 */
export const DEFAULT_CODE: CodeContent = {
  markup: LANGUAGE_TEMPLATES[DEFAULT_LANGUAGES.markup],
  style: LANGUAGE_TEMPLATES[DEFAULT_LANGUAGES.style],
  script: LANGUAGE_TEMPLATES[DEFAULT_LANGUAGES.script]
};

/**
 * 获取指定语言的模板代码
 * @param language 语言类型
 * @returns 模板代码字符串
 */
export function getLanguageTemplate(language: Language): string {
  return LANGUAGE_TEMPLATES[language] || '';
}

/**
 * 获取默认的编辑器内容
 * @returns 默认的代码内容
 */
export function getDefaultCode(): CodeContent {
  return { ...DEFAULT_CODE };
}

/**
 * 检查语言是否有可用的模板
 * @param language 语言类型
 * @returns 是否有模板
 */
export function hasLanguageTemplate(language: Language): boolean {
  return language in LANGUAGE_TEMPLATES && LANGUAGE_TEMPLATES[language].length > 0;
}
