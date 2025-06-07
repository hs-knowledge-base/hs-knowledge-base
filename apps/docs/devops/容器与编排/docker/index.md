# Docker容器技术

## 简介

Docker是一个开源的应用容器引擎，让开发者可以打包他们的应用以及依赖包到一个可移植的容器中，然后发布到任何流行的Linux或Windows操作系统的机器上。Docker容器技术使应用的部署、测试和分发变得更加高效和一致。

## 核心概念

### 容器与虚拟机的区别

容器与传统虚拟机的主要区别在于架构层面：

![容器与虚拟机对比](https://docs.docker.com/images/Container%402x.png)

- **容器**：轻量级，共享主机操作系统内核，启动迅速（秒级），资源占用少
- **虚拟机**：完整的操作系统副本，资源隔离更彻底，启动较慢（分钟级），资源占用大

### Docker核心组件

Docker平台由以下核心组件组成：

1. **Docker引擎**：客户端-服务器应用程序
   - Docker守护进程(dockerd)
   - REST API接口
   - 命令行界面(CLI)客户端

2. **Docker镜像**：容器的只读模板，包含创建容器的指令

3. **Docker容器**：镜像的可运行实例，可以被创建、启动、停止、移动和删除

4. **Docker注册表**：存储Docker镜像的仓库
   - Docker Hub（公共注册表）
   - 私有注册表

## 安装与配置

### 在Linux上安装Docker

```bash
# 更新apt包索引
sudo apt-get update

# 安装必要的依赖
sudo apt-get install \
    apt-transport-https \
    ca-certificates \
    curl \
    gnupg \
    lsb-release

# 添加Docker官方GPG密钥
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg

# 设置稳定版仓库
echo \
  "deb [arch=amd64 signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu \
  $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# 安装Docker引擎
sudo apt-get update
sudo apt-get install docker-ce docker-ce-cli containerd.io
```

### 在Windows/Mac上安装Docker Desktop

1. 从[Docker官网](https://www.docker.com/products/docker-desktop)下载Docker Desktop
2. 按照安装向导完成安装
3. 启动Docker Desktop应用程序

### 验证安装

```bash
# 检查Docker版本
docker --version

# 运行hello-world容器验证安装
docker run hello-world
```

## Docker基本命令

### 镜像管理

```bash
# 列出本地镜像
docker images

# 搜索镜像
docker search nginx

# 拉取镜像
docker pull nginx:latest

# 构建镜像
docker build -t myapp:1.0 .

# 删除镜像
docker rmi nginx:latest

# 保存和加载镜像
docker save -o nginx.tar nginx:latest
docker load -i nginx.tar
```

### 容器管理

```bash
# 创建并启动容器
docker run -d -p 80:80 --name webserver nginx

# 列出运行中的容器
docker ps

# 列出所有容器（包括停止的）
docker ps -a

# 启动/停止/重启容器
docker start webserver
docker stop webserver
docker restart webserver

# 删除容器
docker rm webserver

# 进入容器内部
docker exec -it webserver bash

# 查看容器日志
docker logs webserver

# 查看容器资源使用情况
docker stats webserver
```

### 数据管理

```bash
# 创建数据卷
docker volume create my-vol

# 列出数据卷
docker volume ls

# 挂载数据卷启动容器
docker run -d -v my-vol:/app nginx

# 挂载主机目录启动容器
docker run -d -v $(pwd):/usr/share/nginx/html nginx
```

### 网络管理

```bash
# 创建网络
docker network create my-net

# 列出网络
docker network ls

# 在指定网络中启动容器
docker run -d --network my-net --name db mysql

# 查看网络详情
docker network inspect my-net

# 将容器连接到网络
docker network connect my-net webserver
```

## Dockerfile详解

Dockerfile是用来构建Docker镜像的文本文件，包含了一系列指令和参数。

### 基本结构

```dockerfile
# 基础镜像
FROM node:14-alpine

# 设置工作目录
WORKDIR /app

# 环境变量
ENV NODE_ENV=production

# 复制文件
COPY package*.json ./
COPY .. .

# 运行命令
RUN npm install --production

# 暴露端口
EXPOSE 3000

# 定义数据卷
VOLUME ["/app/data"]

# 容器启动命令
CMD ["node", "server.js"]
```

### 常用指令

- **FROM**：指定基础镜像
- **WORKDIR**：设置工作目录
- **COPY/ADD**：复制文件到容器
- **RUN**：执行命令并创建新的镜像层
- **ENV**：设置环境变量
- **EXPOSE**：声明容器监听的端口
- **VOLUME**：创建挂载点
- **USER**：指定运行容器时的用户
- **CMD**：容器启动命令
- **ENTRYPOINT**：容器入口点

### 多阶段构建

多阶段构建可以显著减小最终镜像的大小：

```dockerfile
# 构建阶段
FROM node:14 AS builder
WORKDIR /app
COPY package*.json ./
COPY . .
RUN npm ci && npm run build

# 生产阶段
FROM nginx:alpine
COPY --from=builder /app/build /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

## Docker Compose

Docker Compose是用于定义和运行多容器Docker应用程序的工具。

### 安装Docker Compose

```bash
# 下载Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/download/1.29.2/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose

# 添加执行权限
sudo chmod +x /usr/local/bin/docker-compose

# 验证安装
docker-compose --version
```

### docker-compose.yml示例

```yaml
version: '3'

services:
  web:
    build: ./web
    ports:
      - "80:80"
    depends_on:
      - api
    networks:
      - frontend
      - backend

  api:
    build: ./api
    environment:
      - DB_HOST=db
      - DB_USER=root
      - DB_PASSWORD=example
    depends_on:
      - db
    networks:
      - backend

  db:
    image: mysql:5.7
    volumes:
      - db-data:/var/lib/mysql
    environment:
      - MYSQL_ROOT_PASSWORD=example
      - MYSQL_DATABASE=myapp
    networks:
      - backend

networks:
  frontend:
  backend:

volumes:
  db-data:
```

### 常用命令

```bash
# 启动所有服务
docker-compose up -d

# 查看服务状态
docker-compose ps

# 查看服务日志
docker-compose logs

# 停止所有服务
docker-compose down

# 构建服务
docker-compose build

# 扩展服务实例
docker-compose up -d --scale web=3
```

## 容器编排与管理

对于更复杂的容器编排需求，可以考虑：

- **Kubernetes**：生产级容器编排平台
- **Docker Swarm**：Docker原生集群管理工具
- **Amazon ECS/EKS**：AWS的容器服务
- **Azure AKS**：微软Azure的Kubernetes服务

## 容器安全最佳实践

### 镜像安全

1. **使用官方镜像**：优先使用Docker Hub上的官方镜像
2. **定期更新基础镜像**：保持基础镜像最新以修复安全漏洞
3. **使用特定标签**：避免使用`latest`标签
4. **镜像扫描**：使用工具扫描镜像中的安全漏洞（如Trivy、Clair）

### 容器安全

1. **以非root用户运行容器**：
   ```dockerfile
   RUN useradd -r -u 1000 appuser
   USER appuser
   ```

2. **限制容器资源**：
   ```bash
   docker run --memory=512m --cpu-shares=512 nginx
   ```

3. **使用只读文件系统**：
   ```bash
   docker run --read-only nginx
   ```

4. **使用安全计算模式(seccomp)**：限制容器可以使用的系统调用

### 运行时安全

1. **隔离网络**：使用自定义网络隔离容器
2. **限制特权**：避免使用`--privileged`标志
3. **实施内容信任**：使用Docker Content Trust验证镜像
4. **监控容器**：实施运行时安全监控

## 生产环境最佳实践

### 镜像构建

1. **优化层次结构**：减少层数和层大小
2. **合并RUN指令**：减少中间层
3. **清理不必要的文件**：减小镜像大小
4. **使用.dockerignore**：排除不需要的文件

```dockerfile
# 不好的做法
RUN apt-get update
RUN apt-get install -y curl
RUN apt-get clean

# 好的做法
RUN apt-get update && \
    apt-get install -y curl && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*
```

### 容器部署

1. **健康检查**：添加健康检查确保应用正常运行
   ```dockerfile
   HEALTHCHECK --interval=5m --timeout=3s \
     CMD curl -f http://localhost/ || exit 1
   ```

2. **优雅关闭**：处理SIGTERM信号以优雅关闭应用
3. **使用环境变量**：通过环境变量注入配置
4. **实施日志管理**：集中管理容器日志

### 容器监控

1. **收集指标**：使用Prometheus监控容器指标
2. **集中日志**：使用ELK或Loki收集容器日志
3. **可视化**：使用Grafana创建监控仪表板
4. **告警**：设置基于阈值的告警

## 常见问题排查

### 容器无法启动

```bash
# 查看容器详细信息
docker inspect container_id

# 查看容器日志
docker logs container_id

# 检查容器退出状态码
docker inspect container_id --format='{{.State.ExitCode}}'
```

### 网络连接问题

```bash
# 检查容器网络
docker network inspect network_name

# 进入容器测试网络
docker exec -it container_id ping other_container
```

### 性能问题

```bash
# 查看容器资源使用情况
docker stats

# 查看容器进程
docker top container_id
```

## 实际应用案例

### Web应用部署

```dockerfile
# Dockerfile
FROM node:14-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --production

COPY . .

EXPOSE 3000

USER node

CMD ["npm", "start"]
```

```yaml
# docker-compose.yml
version: '3'

services:
  web:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
    restart: always
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/health"]
      interval: 30s
      timeout: 10s
      retries: 3
```

### 数据库服务

```yaml
# docker-compose.yml
version: '3'

services:
  postgres:
    image: postgres:13
    volumes:
      - postgres-data:/var/lib/postgresql/data
      - ./init.sql:/docker-entrypoint-initdb.d/init.sql
    environment:
      - POSTGRES_PASSWORD=securepassword
      - POSTGRES_USER=appuser
      - POSTGRES_DB=appdb
    ports:
      - "5432:5432"
    restart: always

volumes:
  postgres-data:
```

### 微服务架构

```yaml
# docker-compose.yml
version: '3'

services:
  gateway:
    build: ./gateway
    ports:
      - "80:80"
    depends_on:
      - auth-service
      - user-service
      - product-service

  auth-service:
    build: ./auth-service
    environment:
      - DB_HOST=auth-db
    depends_on:
      - auth-db

  user-service:
    build: ./user-service
    environment:
      - DB_HOST=user-db
    depends_on:
      - user-db

  product-service:
    build: ./product-service
    environment:
      - DB_HOST=product-db
    depends_on:
      - product-db

  auth-db:
    image: mongo:4
    volumes:
      - auth-db-data:/data/db

  user-db:
    image: postgres:13
    volumes:
      - user-db-data:/var/lib/postgresql/data

  product-db:
    image: mysql:8
    volumes:
      - product-db-data:/var/lib/mysql
    environment:
      - MYSQL_ROOT_PASSWORD=secure
      - MYSQL_DATABASE=products

volumes:
  auth-db-data:
  user-db-data:
  product-db-data:
```

## 总结

Docker容器技术通过提供一致的环境、简化部署流程和提高资源利用率，彻底改变了应用程序的开发、测试和部署方式。掌握Docker的核心概念和最佳实践，是现代DevOps工程师的必备技能。

随着容器技术的不断发展，Docker已经成为云原生应用的基础设施，与Kubernetes等编排工具一起，构成了现代微服务架构的核心技术栈。通过本文介绍的Docker基础知识和最佳实践，开发者和运维人员可以更高效地构建、部署和管理容器化应用。 