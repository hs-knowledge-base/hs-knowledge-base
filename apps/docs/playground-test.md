# LiveCodes Playground 测试页面

这个页面用于测试 LiveCodes Playground 集成功能。每个代码块的右上角应该会出现一个"运行"按钮。

## JavaScript 示例

```javascript
// JavaScript 基础示例
function greet(name) {
  return `Hello, ${name}!`;
}

console.log(greet('火山知识库'));

// 创建一个简单的计数器
let count = 0;
const button = document.createElement('button');
button.textContent = `点击次数: ${count}`;
button.onclick = () => {
  count++;
  button.textContent = `点击次数: ${count}`;
};

document.body.appendChild(button);
```

## Python 示例

```python
# Python 基础示例
def fibonacci(n):
    if n <= 1:
        return n
    return fibonacci(n-1) + fibonacci(n-2)

# 计算斐波那契数列
for i in range(10):
    print(f"fibonacci({i}) = {fibonacci(i)}")

# 列表推导式示例
squares = [x**2 for x in range(1, 11)]
print(f"前10个数的平方: {squares}")
```

## TypeScript 示例

```typescript{playground title="TypeScript 类型系统示例"}
// TypeScript 类型系统示例
interface User {
  id: number;
  name: string;
  email: string;
  isActive: boolean;
}

class UserManager {
  private users: User[] = [];

  addUser(user: User): void {
    this.users.push(user);
    console.log(`用户 ${user.name} 已添加`);
  }

  getActiveUsers(): User[] {
    return this.users.filter(user => user.isActive);
  }

  getUserById(id: number): User | undefined {
    return this.users.find(user => user.id === id);
  }
}

// 使用示例
const userManager = new UserManager();

userManager.addUser({
  id: 1,
  name: '张三',
  email: 'zhangsan@example.com',
  isActive: true
});

userManager.addUser({
  id: 2,
  name: '李四',
  email: 'lisi@example.com',
  isActive: false
});

console.log('活跃用户:', userManager.getActiveUsers());
```

## Go 示例

```go
package main

import (
    "fmt"
    "time"
)

// 定义一个结构体
type Person struct {
    Name string
    Age  int
}

// 为结构体定义方法
func (p Person) Greet() string {
    return fmt.Sprintf("你好，我是 %s，今年 %d 岁", p.Name, p.Age)
}

// 并发示例
func worker(id int, jobs <-chan int, results chan<- int) {
    for j := range jobs {
        fmt.Printf("Worker %d 开始处理任务 %d\n", id, j)
        time.Sleep(time.Second)
        fmt.Printf("Worker %d 完成任务 %d\n", id, j)
        results <- j * 2
    }
}

func main() {
    // 结构体使用
    person := Person{Name: "火山", Age: 25}
    fmt.Println(person.Greet())

    // 并发示例
    jobs := make(chan int, 100)
    results := make(chan int, 100)

    // 启动3个worker
    for w := 1; w <= 3; w++ {
        go worker(w, jobs, results)
    }

    // 发送5个任务
    for j := 1; j <= 5; j++ {
        jobs <- j
    }
    close(jobs)

    // 收集结果
    for a := 1; a <= 5; a++ {
        <-results
    }
}
```

## Rust 示例

```rust
// Rust 所有权和借用示例
#[derive(Debug)]
struct Rectangle {
    width: u32,
    height: u32,
}

impl Rectangle {
    fn new(width: u32, height: u32) -> Rectangle {
        Rectangle { width, height }
    }

    fn area(&self) -> u32 {
        self.width * self.height
    }

    fn can_hold(&self, other: &Rectangle) -> bool {
        self.width > other.width && self.height > other.height
    }
}

// 枚举和模式匹配
enum Message {
    Quit,
    Move { x: i32, y: i32 },
    Write(String),
    ChangeColor(i32, i32, i32),
}

impl Message {
    fn process(&self) {
        match self {
            Message::Quit => println!("退出程序"),
            Message::Move { x, y } => println!("移动到坐标 ({}, {})", x, y),
            Message::Write(text) => println!("写入文本: {}", text),
            Message::ChangeColor(r, g, b) => println!("改变颜色为 RGB({}, {}, {})", r, g, b),
        }
    }
}

fn main() {
    // 结构体使用
    let rect1 = Rectangle::new(30, 50);
    let rect2 = Rectangle::new(10, 40);
    let rect3 = Rectangle::new(60, 45);

    println!("矩形1的面积: {}", rect1.area());
    println!("矩形1能容纳矩形2吗? {}", rect1.can_hold(&rect2));
    println!("矩形1能容纳矩形3吗? {}", rect1.can_hold(&rect3));

    // 枚举使用
    let messages = vec![
        Message::Write("Hello, Rust!".to_string()),
        Message::Move { x: 10, y: 20 },
        Message::ChangeColor(255, 0, 0),
        Message::Quit,
    ];

    for message in messages {
        message.process();
    }
}
```

## HTML + CSS 示例

```html{playground title="响应式卡片组件"}
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>响应式卡片</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: 'Arial', sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            display: flex;
            justify-content: center;
            align-items: center;
            padding: 20px;
        }

        .card {
            background: white;
            border-radius: 20px;
            padding: 30px;
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
            max-width: 400px;
            width: 100%;
            text-align: center;
            transform: translateY(0);
            transition: all 0.3s ease;
        }

        .card:hover {
            transform: translateY(-10px);
            box-shadow: 0 30px 60px rgba(0, 0, 0, 0.2);
        }

        .card h1 {
            color: #333;
            margin-bottom: 20px;
            font-size: 2rem;
        }

        .card p {
            color: #666;
            line-height: 1.6;
            margin-bottom: 25px;
        }

        .btn {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            border: none;
            padding: 12px 30px;
            border-radius: 25px;
            cursor: pointer;
            font-size: 1rem;
            transition: all 0.3s ease;
        }

        .btn:hover {
            transform: scale(1.05);
            box-shadow: 0 10px 20px rgba(102, 126, 234, 0.4);
        }

        @media (max-width: 480px) {
            .card {
                padding: 20px;
            }
            
            .card h1 {
                font-size: 1.5rem;
            }
        }
    </style>
</head>
<body>
    <div class="card">
        <h1>🔥 火山知识库</h1>
        <p>这是一个响应式卡片组件示例，展示了现代 CSS 的强大功能，包括渐变背景、阴影效果、悬停动画和响应式设计。</p>
        <button class="btn" onclick="alert('欢迎来到火山知识库！')">
            点击体验
        </button>
    </div>
</body>
</html>
```

## 不支持在线运行的语言示例

```bash{no-playground}
# 这个代码块不会显示 playground 按钮
#!/bin/bash

echo "这是一个 Bash 脚本示例"
echo "当前目录: $(pwd)"
echo "当前用户: $(whoami)"

# 创建目录结构
mkdir -p project/{src,docs,tests}

# 列出文件
ls -la project/
```

## 使用说明

1. **支持的语言**: JavaScript, TypeScript, Python, Go, Rust, Java, HTML, CSS, Vue, React 等
2. **点击按钮**: 点击代码块右上角的"在 Playground 中运行"按钮
3. **自动配置**: 代码会自动复制到 LiveCodes，并选择对应的语言
4. **实时运行**: 在 LiveCodes 中可以实时编辑和运行代码
5. **控制台输出**: 支持查看程序的输出结果

## 高级用法

可以在代码块中使用特殊标记：

- `{playground}` - 强制启用 playground（即使语言不在默认支持列表中）
- `{no-playground}` - 禁用 playground 按钮
- `{playground title="自定义标题"}` - 设置自定义标题
