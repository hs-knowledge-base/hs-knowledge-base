# Node.js服务端开发

Node.js是一个基于Chrome V8引擎的JavaScript运行环境，使开发者能够使用JavaScript来编写服务端代码。由于其非阻塞I/O和事件驱动的特性，Node.js特别适合构建高性能、可扩展的网络应用。

## Node.js核心特性

### 事件驱动与非阻塞I/O

Node.js采用事件驱动、非阻塞I/O模型，使其轻量且高效：

```javascript
const fs = require('fs');

// 非阻塞文件读取
fs.readFile('example.txt', 'utf8', (err, data) => {
  if (err) {
    console.error('Error reading file:', err);
    return;
  }
  console.log('File content:', data);
});

console.log('This will be printed before file content');
```

### 单线程事件循环

Node.js运行在单线程中，通过事件循环处理并发：

```javascript
// 演示事件循环
console.log('Start');

setTimeout(() => {
  console.log('Timeout callback executed');
}, 0);

Promise.resolve().then(() => {
  console.log('Promise resolved');
});

console.log('End');

// 输出顺序：
// Start
// End
// Promise resolved
// Timeout callback executed
```

### 模块系统

Node.js提供CommonJS模块系统，允许代码模块化和重用：

```javascript
// math.js
exports.add = (a, b) => a + b;
exports.subtract = (a, b) => a - b;

// app.js
const math = require('./math');
console.log(math.add(5, 3));  // 8
```

ES模块也在新版本中得到支持：

```javascript
// mathUtils.mjs
export const multiply = (a, b) => a * b;
export const divide = (a, b) => a / b;

// app.mjs
import { multiply, divide } from './mathUtils.mjs';
console.log(multiply(4, 2));  // 8
```

## 核心模块与API

### HTTP/HTTPS服务器

创建Web服务器是Node.js的核心功能之一：

```javascript
const http = require('http');

const server = http.createServer((req, res) => {
  res.statusCode = 200;
  res.setHeader('Content-Type', 'text/plain');
  res.end('Hello World\n');
});

server.listen(3000, '127.0.0.1', () => {
  console.log('Server running at http://127.0.0.1:3000/');
});
```

### 文件系统操作

Node.js提供了丰富的文件系统操作API：

```javascript
const fs = require('fs');

// 同步读取
try {
  const data = fs.readFileSync('example.txt', 'utf8');
  console.log(data);
} catch (err) {
  console.error(err);
}

// 异步写入
fs.writeFile('output.txt', 'Hello Node.js', (err) => {
  if (err) throw err;
  console.log('File has been saved');
});

// Promise API (Node.js 10+)
const fsPromises = require('fs').promises;

async function readWriteFile() {
  try {
    const data = await fsPromises.readFile('input.txt', 'utf8');
    await fsPromises.writeFile('output.txt', data.toUpperCase());
    console.log('File operation completed');
  } catch (err) {
    console.error(err);
  }
}
```

### 网络编程

Node.js擅长网络编程，包括TCP和UDP：

```javascript
// TCP服务器
const net = require('net');

const server = net.createServer((socket) => {
  console.log('Client connected');
  
  socket.on('data', (data) => {
    console.log(`Received: ${data}`);
    socket.write(`Echo: ${data}`);
  });
  
  socket.on('end', () => {
    console.log('Client disconnected');
  });
});

server.listen(8080, () => {
  console.log('TCP Server listening on port 8080');
});
```

### 流和缓冲区

Node.js的流API用于处理数据流：

```javascript
const fs = require('fs');
const zlib = require('zlib');

// 使用流进行文件压缩
fs.createReadStream('input.txt')
  .pipe(zlib.createGzip())
  .pipe(fs.createWriteStream('input.txt.gz'))
  .on('finish', () => console.log('File compressed'));

// 使用流转换数据
const { Transform } = require('stream');

const upperCaseTransform = new Transform({
  transform(chunk, encoding, callback) {
    this.push(chunk.toString().toUpperCase());
    callback();
  }
});

process.stdin
  .pipe(upperCaseTransform)
  .pipe(process.stdout);
```

### Buffer

Buffer用于处理二进制数据：

```javascript
// 创建Buffer
const buf1 = Buffer.alloc(10);
const buf2 = Buffer.from('Hello Node.js');

// 写入Buffer
buf1.write('Hello');
console.log(buf1.toString());  // "Hello"

// Buffer转换
console.log(buf2.toString('hex'));
console.log(buf2.toString('base64'));
```

## Web开发框架

### Express

Express是最流行的Node.js Web框架：

```javascript
const express = require('express');
const app = express();

// 中间件
app.use(express.json());
app.use(express.static('public'));

// 路由
app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.get('/api/users', (req, res) => {
  const users = [
    { id: 1, name: 'Alice' },
    { id: 2, name: 'Bob' }
  ];
  res.json(users);
});

app.post('/api/users', (req, res) => {
  const newUser = req.body;
  // 处理新用户...
  res.status(201).json(newUser);
});

// 错误处理
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

app.listen(3000, () => {
  console.log('Server running on port 3000');
});
```

### Koa

Koa是由Express团队开发的更轻量、更现代的Web框架：

```javascript
const Koa = require('koa');
const Router = require('@koa/router');
const bodyParser = require('koa-bodyparser');

const app = new Koa();
const router = new Router();

app.use(bodyParser());

router.get('/', (ctx) => {
  ctx.body = 'Hello Koa';
});

router.get('/api/users', (ctx) => {
  ctx.body = [
    { id: 1, name: 'Alice' },
    { id: 2, name: 'Bob' }
  ];
});

app.use(router.routes()).use(router.allowedMethods());

app.listen(3000, () => {
  console.log('Koa server running on port 3000');
});
```

### Fastify

Fastify是一个高性能的Web框架：

```javascript
const fastify = require('fastify')({ logger: true });

fastify.get('/', async (request, reply) => {
  return { hello: 'world' };
});

fastify.get('/api/users', async () => {
  return [
    { id: 1, name: 'Alice' },
    { id: 2, name: 'Bob' }
  ];
});

const start = async () => {
  try {
    await fastify.listen(3000);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
```

## 数据库集成

### MongoDB (使用Mongoose)

```javascript
const mongoose = require('mongoose');

// 连接数据库
mongoose.connect('mongodb://localhost:27017/myapp', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

// 定义模式和模型
const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, required: true, unique: true },
  age: Number,
  createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);

// 创建用户
async function createUser() {
  try {
    const user = new User({
      name: 'John Doe',
      email: 'john@example.com',
      age: 30
    });
    
    const result = await user.save();
    console.log('User saved:', result);
  } catch (err) {
    console.error('Error saving user:', err);
  }
}

// 查询用户
async function findUsers() {
  try {
    const users = await User.find({ age: { $gte: 25 } })
      .sort({ name: 1 })
      .limit(10);
    console.log('Users found:', users);
  } catch (err) {
    console.error('Error finding users:', err);
  }
}
```

### SQL数据库 (使用Sequelize)

```javascript
const { Sequelize, DataTypes } = require('sequelize');

// 创建连接
const sequelize = new Sequelize('database', 'username', 'password', {
  host: 'localhost',
  dialect: 'mysql' // 或 'postgres', 'sqlite', 'mssql'
});

// 定义模型
const Product = sequelize.define('Product', {
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT
  }
});

// 同步模型
(async () => {
  await sequelize.sync();
  console.log('Database synchronized');
  
  // 创建产品
  const product = await Product.create({
    name: 'Laptop',
    price: 999.99,
    description: 'High-performance laptop'
  });
  
  console.log('Product created:', product.toJSON());
  
  // 查询产品
  const products = await Product.findAll({
    where: {
      price: {
        [Sequelize.Op.lt]: 1000
      }
    },
    order: [['price', 'DESC']]
  });
  
  console.log('Products found:', products.map(p => p.toJSON()));
})();
```

## 身份验证与授权

### JWT认证

```javascript
const express = require('express');
const jwt = require('jsonwebtoken');

const app = express();
app.use(express.json());

const JWT_SECRET = 'your-secret-key';

// 登录生成令牌
app.post('/login', (req, res) => {
  const { username, password } = req.body;
  
  // 验证用户（简化示例）
  if (username === 'admin' && password === 'password') {
    const token = jwt.sign(
      { userId: 1, username },
      JWT_SECRET,
      { expiresIn: '1h' }
    );
    
    res.json({ token });
  } else {
    res.status(401).json({ message: 'Authentication failed' });
  }
});

// 验证中间件
function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;
  
  if (!authHeader) {
    return res.status(401).json({ message: 'No token provided' });
  }
  
  const token = authHeader.split(' ')[1];
  
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(403).json({ message: 'Invalid token' });
  }
}

// 保护路由
app.get('/api/protected', authenticate, (req, res) => {
  res.json({ message: 'Protected data', user: req.user });
});

app.listen(3000);
```

## 异步编程模式

### Promises和Async/Await

```javascript
// Promise链
function fetchData() {
  return fetch('https://api.example.com/data')
    .then(response => {
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.json();
    })
    .then(data => {
      console.log('Data:', data);
      return data;
    })
    .catch(error => {
      console.error('Fetch error:', error);
    });
}

// Async/Await
async function fetchDataAsync() {
  try {
    const response = await fetch('https://api.example.com/data');
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    const data = await response.json();
    console.log('Data:', data);
    return data;
  } catch (error) {
    console.error('Fetch error:', error);
  }
}

// 处理多个异步操作
async function fetchMultipleData() {
  try {
    // 并行请求
    const [users, products] = await Promise.all([
      fetch('https://api.example.com/users').then(r => r.json()),
      fetch('https://api.example.com/products').then(r => r.json())
    ]);
    
    console.log('Users:', users);
    console.log('Products:', products);
    
    return { users, products };
  } catch (error) {
    console.error('Fetch error:', error);
  }
}
```

### 工具函数与模式

```javascript
// 重试函数
async function retryOperation(operation, retries = 3, delay = 1000) {
  let lastError;
  
  for (let i = 0; i < retries; i++) {
    try {
      return await operation();
    } catch (error) {
      console.log(`Attempt ${i + 1} failed, retrying...`);
      lastError = error;
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  throw lastError;
}

// 使用示例
async function fetchWithRetry() {
  try {
    const result = await retryOperation(
      () => fetch('https://api.example.com/data').then(r => r.json())
    );
    console.log('Success:', result);
  } catch (error) {
    console.error('All retries failed:', error);
  }
}
```

## 测试

### 单元测试 (Jest)

```javascript
// math.js
exports.add = (a, b) => a + b;
exports.subtract = (a, b) => a - b;

// math.test.js
const { add, subtract } = require('./math');

test('adds 1 + 2 to equal 3', () => {
  expect(add(1, 2)).toBe(3);
});

test('subtracts 5 - 2 to equal 3', () => {
  expect(subtract(5, 2)).toBe(3);
});
```

### API测试 (Supertest)

```javascript
const request = require('supertest');
const app = require('../app');

describe('User API', () => {
  it('should get all users', async () => {
    const response = await request(app)
      .get('/api/users')
      .expect('Content-Type', /json/)
      .expect(200);
    
    expect(response.body).toBeInstanceOf(Array);
  });
  
  it('should create a new user', async () => {
    const userData = { name: 'Test User', email: 'test@example.com' };
    
    const response = await request(app)
      .post('/api/users')
      .send(userData)
      .expect('Content-Type', /json/)
      .expect(201);
    
    expect(response.body).toHaveProperty('id');
    expect(response.body.name).toBe(userData.name);
  });
});
```

## 部署

### Docker容器化

```dockerfile
# Dockerfile
FROM node:14-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

EXPOSE 3000
CMD ["node", "app.js"]
```

```yaml
# docker-compose.yml
version: '3'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - MONGODB_URI=mongodb://mongo:27017/myapp
    depends_on:
      - mongo
  
  mongo:
    image: mongo:4.4
    volumes:
      - mongo-data:/data/db

volumes:
  mongo-data:
```

### PM2进程管理

```javascript
// ecosystem.config.js
module.exports = {
  apps: [{
    name: 'my-api',
    script: 'app.js',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    env_development: {
      NODE_ENV: 'development',
      PORT: 3000
    }
  }]
};
```

```bash
# 启动应用
pm2 start ecosystem.config.js

# 监控
pm2 monit

# 查看日志
pm2 logs

# 重启
pm2 restart my-api
```

## 性能优化

### 常见性能优化技巧

1. **使用集群模式**：利用多核CPU
   ```javascript
   const cluster = require('cluster');
   const os = require('os');
   const http = require('http');
   
   if (cluster.isMaster) {
     const numCPUs = os.cpus().length;
     
     console.log(`Master process ${process.pid} is running`);
     
     // 为每个CPU创建工作进程
     for (let i = 0; i < numCPUs; i++) {
       cluster.fork();
     }
     
     cluster.on('exit', (worker, code, signal) => {
       console.log(`Worker ${worker.process.pid} died`);
       cluster.fork();  // 替换死亡的工作进程
     });
   } else {
     // 工作进程共享同一个TCP连接
     http.createServer((req, res) => {
       res.writeHead(200);
       res.end('Hello from worker\n');
     }).listen(8000);
     
     console.log(`Worker ${process.pid} started`);
   }
   ```

2. **缓存**：使用内存缓存或Redis减少计算和数据库查询
3. **数据库查询优化**：索引、批量操作和连接池
4. **压缩**：使用gzip/brotli压缩响应
5. **异步操作**：避免阻塞事件循环
6. **负载均衡**：分散请求到多个实例

## 最佳实践

1. **错误处理**：始终处理错误，不要让未捕获的异常导致应用崩溃
2. **安全**：防止常见安全漏洞（XSS、CSRF、SQL注入等）
3. **日志记录**：使用结构化日志便于分析和监控
4. **配置管理**：使用环境变量管理配置
5. **代码模块化**：遵循单一责任原则
6. **使用ESLint和Prettier**：保持代码质量和一致性
7. **CI/CD**：自动化测试和部署流程

Node.js的非阻塞I/O和事件驱动架构使其成为构建高性能网络应用和API的理想选择。随着生态系统的不断发展，Node.js已成为现代Web开发的核心技术之一。 