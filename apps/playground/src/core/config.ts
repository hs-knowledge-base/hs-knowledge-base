import type { Config } from '@/types';

export function getDefaultConfig(): Config {
  return {
    title: '火山知识库 - 代码演练场',
    description: '多语言在线代码编辑器和运行环境',
    
    markup: {
      language: 'html',
      content: `<!DOCTYPE html>
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
</html>`
    },
    
    style: {
      language: 'css',
      content: `body {
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
}`
    },
    
    script: {
      language: 'javascript',
      content: `// 欢迎使用火山知识库代码演练场！
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
features.templateLiterals('火山');`
    },
    
    tools: {
      enabled: ['console', 'compiled'],
      active: 'console',
      status: 'open'
    },
    
    theme: 'dark',
    layout: 'horizontal',
    autoupdate: false,
    delay: 1500
  };
}
