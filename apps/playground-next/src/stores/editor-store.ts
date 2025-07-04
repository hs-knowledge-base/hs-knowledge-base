import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type { EditorConfig, EditorType, Language } from '@/types';
import { DEFAULT_EDITOR_CONFIG } from '@/constants';

interface EditorState {
  // 编辑器配置
  configs: Record<EditorType, EditorConfig>;
  
  // 编辑器实例状态
  isLoaded: boolean;
  isLoading: boolean;
  loadError: string | null;
  
  // 当前活动的编辑器
  activeEditor: EditorType;
  
  // 编辑器内容
  contents: Record<EditorType, string>;
  
  // 编辑器选择状态
  selections: Record<EditorType, { start: number; end: number } | null>;
  
  // 编辑器焦点状态
  focusedEditor: EditorType | null;
  
  // 编辑器可见性
  visibility: Record<EditorType, boolean>;
  
  // 编辑器尺寸
  sizes: Record<EditorType, { width: number; height: number }>;
  
  // 编辑器错误状态
  errors: Record<EditorType, string[]>;
  
  // 编辑器性能指标
  performance: {
    loadTime: number;
    lastUpdateTime: number;
    updateCount: number;
  };
  
  // 根据语言切换示例代码的辅助函数
  getExampleCode: (language: Language) => string;
  
  // 语言示例代码
  exampleCodes: Record<Language, string>;
}

interface EditorActions {
  // 编辑器配置
  setEditorConfig: (type: EditorType, config: Partial<EditorConfig>) => void;
  setAllEditorConfigs: (configs: Partial<Record<EditorType, EditorConfig>>) => void;
  resetEditorConfig: (type: EditorType) => void;
  
  // 编辑器语言
  setEditorLanguage: (type: EditorType, language: Language) => void;
  
  // 编辑器主题
  setEditorTheme: (theme: 'vs-dark' | 'vs-light') => void;
  
  // 编辑器内容
  setEditorContent: (type: EditorType, content: string) => void;
  setAllEditorContents: (contents: Partial<Record<EditorType, string>>) => void;
  
  // 编辑器状态
  setEditorLoading: (isLoading: boolean) => void;
  setEditorLoaded: (isLoaded: boolean) => void;
  setEditorError: (error: string | null) => void;
  
  // 编辑器焦点和选择
  setActiveEditor: (type: EditorType) => void;
  setFocusedEditor: (type: EditorType | null) => void;
  setEditorSelection: (type: EditorType, selection: { start: number; end: number } | null) => void;
  
  // 编辑器可见性
  setEditorVisibility: (type: EditorType, visible: boolean) => void;
  toggleEditorVisibility: (type: EditorType) => void;
  
  // 编辑器尺寸
  setEditorSize: (type: EditorType, size: { width: number; height: number }) => void;
  
  // 编辑器错误
  addEditorError: (type: EditorType, error: string) => void;
  removeEditorError: (type: EditorType, error: string) => void;
  clearEditorErrors: (type: EditorType) => void;
  
  // 性能监控
  updatePerformanceMetrics: (metrics: Partial<EditorState['performance']>) => void;
  
  // 编辑器操作
  formatCode: (type: EditorType) => void;
  insertText: (type: EditorType, text: string) => void;
  replaceSelection: (type: EditorType, text: string) => void;
  
  // 重置和清理
  resetEditor: (type: EditorType) => void;
  resetAllEditors: () => void;
  
  // 获取示例代码
  getExampleCode: (language: Language) => string;
  
  // 切换语言并加载示例代码
  switchLanguageWithExample: (type: EditorType, language: Language) => void;
}

type EditorStore = EditorState & EditorActions;

// 语言示例代码
const EXAMPLE_CODES: Record<Language, string> = {
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
echo "🔥 Hello from PHP (Uniter)!\n";

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
        echo $this->name . " moved " . $distance . " meters.\n";
    }
}

// 创建实例
$cat = new Animal("小猫", "cat");
$dog = new Animal("小狗", "dog");

echo $cat->speak() . "\n";
echo $dog->speak() . "\n";

$cat->move(5);
$dog->move(10);

// 数组操作
$numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
$even_numbers = array_filter($numbers, function($n) {
    return $n % 2 == 0;
});

echo "偶数: " . implode(", ", $even_numbers) . "\n";

// 关联数组
$user_info = [
    'name' => '张三',
    'age' => 25,
    'skills' => ['PHP', 'JavaScript', 'Python']
];

echo "用户信息: " . json_encode($user_info) . "\n";

// 函数
function fibonacci($n) {
    if ($n <= 1) {
        return $n;
    }
    return fibonacci($n - 1) + fibonacci($n - 2);
}

echo "斐波那契数列 (前10项):\n";
for ($i = 0; $i < 10; $i++) {
    echo "F($i) = " . fibonacci($i) . "\n";
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
  <title>多语言代码预览</title>
</head>
<body>
  <div id="app">
    <h1>🔥 火山知识库 - 多语言代码演练场</h1>
    <p>支持多种编程语言在浏览器中运行</p>
    <button onclick="testLanguages()">测试多语言支持</button>
    <div id="output"></div>
  </div>
</body>
</html>`,

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
  max-width: 600px;
}

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
  background: #007acc;
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 16px;
  transition: background 0.2s;
  margin-bottom: 20px;
}

button:hover {
  background: #005a9e;
}

#output {
  text-align: left;
  background: #f5f5f5;
  padding: 15px;
  border-radius: 6px;
  font-family: 'Monaco', 'Consolas', monospace;
  font-size: 14px;
  max-height: 200px;
  overflow-y: auto;
  margin-top: 20px;
}`,

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
}`,

  json: `{
  "name": "火山知识库",
  "version": "1.0.0",
  "description": "多语言代码演练场",
  "languages": [
    "JavaScript",
    "TypeScript",
    "Python",
    "Go",
    "PHP",
    "Java"
  ],
  "features": {
    "realtime_preview": true,
    "multi_language": true,
    "console_output": true,
    "error_handling": true,
    "code_highlighting": true
  },
  "supported_runtimes": {
    "python": "Brython",
    "go": "GopherJS",
    "php": "Uniter",
    "java": "DoppioJVM"
  },
  "user": {
    "name": "开发者",
    "preferences": {
      "theme": "dark",
      "language": "typescript",
      "auto_run": true
    }
  }
}`,

  xml: `<?xml version="1.0" encoding="UTF-8"?>
<playground>
  <info>
    <name>火山知识库</name>
    <version>1.0.0</version>
    <description>多语言代码演练场</description>
  </info>
  
  <languages>
    <language id="javascript" type="native">JavaScript</language>
    <language id="typescript" type="transpiler">TypeScript</language>
    <language id="python" type="interpreter">Python (Brython)</language>
    <language id="go" type="transpiler">Go (GopherJS)</language>
    <language id="php" type="interpreter">PHP (Uniter)</language>
    <language id="java" type="vm">Java (DoppioJVM)</language>
  </languages>
  
  <features>
    <feature name="realtime_preview" enabled="true" />
    <feature name="multi_language" enabled="true" />
    <feature name="console_output" enabled="true" />
    <feature name="error_handling" enabled="true" />
    <feature name="code_highlighting" enabled="true" />
  </features>
  
  <user>
    <name>开发者</name>
    <preferences>
      <theme>dark</theme>
      <language>typescript</language>
      <auto_run>true</auto_run>
    </preferences>
  </user>
</playground>`,

  yaml: `# 火山知识库配置文件
name: 火山知识库
version: 1.0.0
description: 多语言代码演练场

languages:
  - name: JavaScript
    type: native
    runtime: browser
  - name: TypeScript
    type: transpiler
    runtime: browser
  - name: Python
    type: interpreter
    runtime: Brython
  - name: Go
    type: transpiler
    runtime: GopherJS
  - name: PHP
    type: interpreter
    runtime: Uniter
  - name: Java
    type: vm
    runtime: DoppioJVM

features:
  realtime_preview: true
  multi_language: true
  console_output: true
  error_handling: true
  code_highlighting: true

supported_runtimes:
  python: Brython
  go: GopherJS
  php: Uniter
  java: DoppioJVM

user:
  name: 开发者
  preferences:
    theme: dark
    language: typescript
    auto_run: true

# 语言运行时配置
runtimes:
  brython:
    version: "3.11.0"
    cdn: "https://cdn.jsdelivr.net/npm/brython@3.11.0"
  
  gopherjs:
    version: "latest"
    cdn: "https://cdn.jsdelivr.net/npm/gopherjs@latest"
  
  uniter:
    version: "latest"
    cdn: "https://cdn.jsdelivr.net/npm/uniter@latest"
  
  doppio:
    version: "latest"
    cdn: "https://cdn.jsdelivr.net/npm/doppio-jvm@latest"`
};

const initialState: EditorState = {
  configs: {
    markup: { ...DEFAULT_EDITOR_CONFIG, language: 'html' },
    style: { ...DEFAULT_EDITOR_CONFIG, language: 'css' },
    script: { ...DEFAULT_EDITOR_CONFIG, language: 'python' }
  },
  isLoaded: false,
  isLoading: false,
  loadError: null,
  activeEditor: 'script',
  contents: {
    markup: EXAMPLE_CODES.html,
    style: EXAMPLE_CODES.css,
    script: EXAMPLE_CODES.python
  },
  exampleCodes: EXAMPLE_CODES,
  selections: {
    markup: null,
    style: null,
    script: null
  },
  focusedEditor: null,
  visibility: {
    markup: true,
    style: true,
    script: true
  },
  sizes: {
    markup: { width: 0, height: 0 },
    style: { width: 0, height: 0 },
    script: { width: 0, height: 0 }
  },
  errors: {
    markup: [],
    style: [],
    script: []
  },
  performance: {
    loadTime: 0,
    lastUpdateTime: 0,
    updateCount: 0
  },
  getExampleCode: (language) => {
    return EXAMPLE_CODES[language] || '';
  }
};

export const useEditorStore = create<EditorStore>()(
  devtools(
    (set, get) => ({
        ...initialState,
        
        // 编辑器配置
        setEditorConfig: (type, config) => {
          set((state) => ({
            configs: {
              ...state.configs,
              [type]: { ...state.configs[type], ...config }
            }
          }), false, `setEditorConfig/${type}`);
        },
        
        setAllEditorConfigs: (configs) => {
          set((state) => ({
            configs: {
              ...state.configs,
              ...Object.fromEntries(
                Object.entries(configs).map(([type, config]) => [
                  type,
                  { ...state.configs[type as EditorType], ...config }
                ])
              )
            }
          }), false, 'setAllEditorConfigs');
        },
        
        resetEditorConfig: (type) => {
          set((state) => ({
            configs: {
              ...state.configs,
              [type]: { ...DEFAULT_EDITOR_CONFIG, language: state.configs[type].language }
            }
          }), false, `resetEditorConfig/${type}`);
        },
        
        // 编辑器语言
        setEditorLanguage: (type, language) => {
          set((state) => ({
            configs: {
              ...state.configs,
              [type]: { ...state.configs[type], language }
            }
          }), false, `setEditorLanguage/${type}/${language}`);
        },
        
        // 编辑器主题
        setEditorTheme: (theme) => {
          set((state) => ({
            configs: {
              markup: { ...state.configs.markup, theme },
              style: { ...state.configs.style, theme },
              script: { ...state.configs.script, theme }
            }
          }), false, `setEditorTheme/${theme}`);
        },
        
        // 编辑器内容
        setEditorContent: (type, content) => {
          set((state) => ({
            contents: { ...state.contents, [type]: content },
            performance: {
              ...state.performance,
              lastUpdateTime: Date.now(),
              updateCount: state.performance.updateCount + 1
            }
          }), false, `setEditorContent/${type}`);
        },
        
        setAllEditorContents: (contents) => {
          set((state) => ({
            contents: { ...state.contents, ...contents },
            performance: {
              ...state.performance,
              lastUpdateTime: Date.now(),
              updateCount: state.performance.updateCount + 1
            }
          }), false, 'setAllEditorContents');
        },
        
        // 编辑器状态
        setEditorLoading: (isLoading) => {
          set({ isLoading }, false, `setEditorLoading/${isLoading}`);
        },
        
        setEditorLoaded: (isLoaded) => {
          set((state) => ({
            isLoaded,
            performance: isLoaded ? {
              ...state.performance,
              loadTime: Date.now()
            } : state.performance
          }), false, `setEditorLoaded/${isLoaded}`);
        },
        
        setEditorError: (loadError) => {
          set({ loadError }, false, 'setEditorError');
        },
        
        // 编辑器焦点和选择
        setActiveEditor: (activeEditor) => {
          set({ activeEditor }, false, `setActiveEditor/${activeEditor}`);
        },
        
        setFocusedEditor: (focusedEditor) => {
          set({ focusedEditor }, false, `setFocusedEditor/${focusedEditor}`);
        },
        
        setEditorSelection: (type, selection) => {
          set((state) => ({
            selections: { ...state.selections, [type]: selection }
          }), false, `setEditorSelection/${type}`);
        },
        
        // 编辑器可见性
        setEditorVisibility: (type, visible) => {
          set((state) => ({
            visibility: { ...state.visibility, [type]: visible }
          }), false, `setEditorVisibility/${type}/${visible}`);
        },
        
        toggleEditorVisibility: (type) => {
          set((state) => ({
            visibility: { ...state.visibility, [type]: !state.visibility[type] }
          }), false, `toggleEditorVisibility/${type}`);
        },
        
        // 编辑器尺寸
        setEditorSize: (type, size) => {
          set((state) => ({
            sizes: { ...state.sizes, [type]: size }
          }), false, `setEditorSize/${type}`);
        },
        
        // 编辑器错误
        addEditorError: (type, error) => {
          set((state) => ({
            errors: {
              ...state.errors,
              [type]: [...state.errors[type], error]
            }
          }), false, `addEditorError/${type}`);
        },
        
        removeEditorError: (type, error) => {
          set((state) => ({
            errors: {
              ...state.errors,
              [type]: state.errors[type].filter(e => e !== error)
            }
          }), false, `removeEditorError/${type}`);
        },
        
        clearEditorErrors: (type) => {
          set((state) => ({
            errors: { ...state.errors, [type]: [] }
          }), false, `clearEditorErrors/${type}`);
        },
        
        // 性能监控
        updatePerformanceMetrics: (metrics) => {
          set((state) => ({
            performance: { ...state.performance, ...metrics }
          }), false, 'updatePerformanceMetrics');
        },
        
        // 编辑器操作
        formatCode: (type) => {
          // 这里会调用 Monaco Editor 的格式化功能
          console.log(`[EditorStore] 格式化代码: ${type}`);
        },
        
        insertText: (type, text) => {
          // 这里会调用 Monaco Editor 的插入文本功能
          console.log(`[EditorStore] 插入文本: ${type}`, text);
        },
        
        replaceSelection: (type, text) => {
          // 这里会调用 Monaco Editor 的替换选择功能
          console.log(`[EditorStore] 替换选择: ${type}`, text);
        },
        
        // 重置和清理
        resetEditor: (type) => {
          set((state) => {
            const newContents = { ...state.contents };
            const newConfigs = { ...state.configs };
            const language = newConfigs[type].language;
            
            // 重置为该语言的示例代码
            newContents[type] = EXAMPLE_CODES[language] || '';
            newConfigs[type] = { ...DEFAULT_EDITOR_CONFIG, language };
            
            return {
              contents: newContents,
              configs: newConfigs,
              selections: { ...state.selections, [type]: null },
              errors: { ...state.errors, [type]: [] }
            };
          }, false, `resetEditor/${type}`);
        },
        
        resetAllEditors: () => {
          set({
            configs: {
              markup: { ...DEFAULT_EDITOR_CONFIG, language: 'html' },
              style: { ...DEFAULT_EDITOR_CONFIG, language: 'css' },
              script: { ...DEFAULT_EDITOR_CONFIG, language: 'python' }
            },
            contents: {
              markup: EXAMPLE_CODES.html,
              style: EXAMPLE_CODES.css,
              script: EXAMPLE_CODES.python
            },
            selections: {
              markup: null,
              style: null,
              script: null
            },
            errors: {
              markup: [],
              style: [],
              script: []
            }
          }, false, 'resetAllEditors');
        },
        
        // 获取示例代码
        getExampleCode: (language) => {
          return EXAMPLE_CODES[language] || '';
        },
        
        // 切换语言并加载示例代码
        switchLanguageWithExample: (type: EditorType, language: Language) => {
          const { setEditorLanguage, setEditorContent, getExampleCode } = get();
          
          // 设置新语言
          setEditorLanguage(type, language);
          
          // 加载该语言的示例代码
          const exampleCode = getExampleCode(language);
          setEditorContent(type, exampleCode);
        }
    }),
    { name: 'editor-store' }
  )
);
