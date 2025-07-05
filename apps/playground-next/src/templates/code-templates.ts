import type { CodeContent } from '@/types';

/** 默认代码模板 */
export const DEFAULT_CODE: CodeContent = {
  markup: `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>代码演练场</title>
</head>
<body>
  <div id="app">
    <h1>🔥 火山知识库 - 代码演练场</h1>
    <p>在这里编写你的 HTML 代码</p>
    <div class="demo-box">
      <p>这是一个演示区域</p>
    </div>
  </div>
</body>
</html>`,

  style: `/* 样式代码 */
body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  margin: 0;
  padding: 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  min-height: 100vh;
}

#app {
  max-width: 800px;
  margin: 0 auto;
  text-align: center;
}

h1 {
  font-size: 2.5rem;
  margin-bottom: 1rem;
  text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
}

.demo-box {
  background: rgba(255, 255, 255, 0.1);
  padding: 2rem;
  border-radius: 12px;
  margin: 2rem 0;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
}`,

  script: `// JavaScript 代码
console.log('🚀 欢迎使用代码演练场！');

// 输出一些示例信息
console.log('💡 提示：你可以在这里编写 JavaScript 代码');
console.log('🔗 也可以从知识库文档中跳转到这里运行代码');`
};

/** 语言特定的代码模板 */
export const LANGUAGE_TEMPLATES = {
  html: `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>HTML 示例</title>
</head>
<body>
  <h1>Hello HTML!</h1>
  <p>在这里编写你的 HTML 代码</p>
</body>
</html>`,

  css: `/* CSS 样式 */
body {
  font-family: Arial, sans-serif;
  margin: 0;
  padding: 20px;
  background-color: #f5f5f5;
}

h1 {
  color: #333;
  text-align: center;
}`,

  javascript: `// JavaScript 代码
console.log('Hello JavaScript!');

// 示例函数
function greet(name) {
  return \`Hello, \${name}!\`;
}

console.log(greet('World'));`,

  typescript: `// TypeScript 代码
interface User {
  name: string;
  age: number;
}

function greet(user: User): string {
  return \`Hello, \${user.name}! You are \${user.age} years old.\`;
}

const user: User = { name: 'TypeScript', age: 10 };
console.log(greet(user));`,

  markdown: `# Markdown 示例

这是一个 **Markdown** 文档示例。

## 功能特性

- 支持 *斜体* 和 **粗体**
- 支持 \`行内代码\`
- 支持链接：[GitHub](https://github.com)

### 代码块

\`\`\`javascript
console.log('Hello Markdown!');
\`\`\`

> 这是一个引用块`,

  scss: `// SCSS 样式
$primary-color: #3498db;
$secondary-color: #2ecc71;

.container {
  padding: 20px;
  
  h1 {
    color: $primary-color;
    font-size: 2rem;
    
    &:hover {
      color: $secondary-color;
    }
  }
}`,

  less: `// Less 样式
@primary-color: #3498db;
@secondary-color: #2ecc71;

.container {
  padding: 20px;
  
  h1 {
    color: @primary-color;
    font-size: 2rem;
    
    &:hover {
      color: @secondary-color;
    }
  }
}`,

  python: `# Python 代码 (使用 Brython)
print("Hello Python!")

# 示例函数
def greet(name):
    return f"Hello, {name}!"

print(greet("World"))

# 列表操作
numbers = [1, 2, 3, 4, 5]
squares = [x**2 for x in numbers]
print("平方数:", squares)`,

  go: `// Go 代码 (使用 GopherJS)
package main

import "fmt"

func main() {
    fmt.Println("Hello Go!")
    
    // 示例函数
    name := "World"
    message := greet(name)
    fmt.Println(message)
}

func greet(name string) string {
    return fmt.Sprintf("Hello, %s!", name)
}`,

  php: `<?php
// PHP 代码 (使用 Uniter)
echo "Hello PHP!\\n";

// 示例函数
function greet($name) {
    return "Hello, " . $name . "!";
}

echo greet("World") . "\\n";

// 数组操作
$numbers = [1, 2, 3, 4, 5];
$squares = array_map(function($x) { return $x * $x; }, $numbers);
echo "平方数: " . implode(", ", $squares) . "\\n";
?>`,

  java: `// Java 代码 (使用 CheerpJ)
public class HelloWorld {
    public static void main(String[] args) {
        System.out.println("Hello Java!");
        
        // 示例方法
        String message = greet("World");
        System.out.println(message);
    }
    
    public static String greet(String name) {
        return "Hello, " + name + "!";
    }
}`
} as const;
