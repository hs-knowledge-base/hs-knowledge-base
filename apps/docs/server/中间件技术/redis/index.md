# Redis

## 简介

Redis(Remote Dictionary Server)是一个开源的、高性能的内存数据结构存储系统，可用作数据库、缓存、消息中间件和流处理引擎。它支持多种数据类型，具有内置复制、Lua脚本、LRU驱逐、事务和不同级别的磁盘持久化功能。

## 核心特性

### 数据结构
- **String**: 文本或二进制数据
- **List**: 链表结构，支持双向操作
- **Hash**: 字段-值对的集合
- **Set**: 无序不重复集合
- **Sorted Set**: 有序不重复集合
- **Bitmap**: 位操作支持
- **HyperLogLog**: 基数统计
- **Geo**: 地理位置信息
- **Stream**: 日志型数据结构

### 性能特点
- 基于内存操作，极高读写性能
- 单线程模型(Redis 6.0前)，避免锁竞争
- IO多路复用，高效网络模型
- 持久化机制，兼顾性能与可靠性

### 高级功能
- **发布/订阅**: 消息通信机制
- **Lua脚本**: 服务端脚本执行
- **事务**: 命令批量执行
- **Pipeline**: 命令批量传输
- **分布式锁**: 并发控制机制

## 持久化

### RDB (Redis Database)
- 时间点快照
- 紧凑二进制格式
- 适合备份与恢复

### AOF (Append Only File)
- 命令追加日志
- 实时持久化
- 支持重写优化

### 混合持久化
- 结合RDB与AOF优点
- 快速加载与实时性兼顾

## 分布式架构

### 主从复制
- 异步复制机制
- 读写分离支持
- 可扩展的读性能

### Redis Sentinel
- 高可用性解决方案
- 自动故障检测与转移
- 配置发现与通知

### Redis Cluster
- 分片数据存储
- 水平扩展能力
- 自动数据分区与重平衡

## 应用场景

### 缓存
- 数据加速访问
- 缓存穿透/击穿/雪崩防范
- 热点数据处理

### 计数器与限流
- 高性能计数器
- 令牌桶与漏桶算法实现
- 分布式限流

### 分布式锁
- 互斥资源访问控制
- 防止重复操作
- 集群环境下的一致性

### 排行榜
- 基于Sorted Set实现
- 实时榜单更新
- 滑动窗口支持

### 消息队列
- 轻量级队列实现
- 发布/订阅模型
- Stream持久化队列

## 代码示例

### 基本操作(Python)

```python
import redis

# 连接Redis
r = redis.Redis(host='localhost', port=6379, db=0)

# 字符串操作
r.set('key', 'value')
value = r.get('key')
print(value)  # b'value'

# 哈希表操作
r.hset('user:1000', 'name', 'John')
r.hset('user:1000', 'email', 'john@example.com')
user = r.hgetall('user:1000')
print(user)  # {b'name': b'John', b'email': b'john@example.com'}

# 列表操作
r.lpush('queue', 'item1')
r.lpush('queue', 'item2')
items = r.lrange('queue', 0, -1)
print(items)  # [b'item2', b'item1']

# 集合操作
r.sadd('tags', 'redis', 'database', 'nosql')
tags = r.smembers('tags')
print(tags)  # {b'nosql', b'database', b'redis'}

# 有序集合操作
r.zadd('ranking', {'player1': 100, 'player2': 200, 'player3': 150})
top_players = r.zrevrange('ranking', 0, 2, withscores=True)
print(top_players)  # [(b'player2', 200.0), (b'player3', 150.0), (b'player1', 100.0)]
```

### 分布式锁实现(Python)

```python
import redis
import uuid
import time

class RedisLock:
    def __init__(self, redis_client, lock_name, expire=10):
        self.redis = redis_client
        self.lock_name = lock_name
        self.expire = expire
        self.identifier = str(uuid.uuid4())
        
    def acquire(self):
        end_time = time.time() + self.expire
        while time.time() < end_time:
            if self.redis.set(self.lock_name, self.identifier, nx=True, ex=self.expire):
                return True
            time.sleep(0.1)
        return False
        
    def release(self):
        script = """
        if redis.call('get', KEYS[1]) == ARGV[1] then
            return redis.call('del', KEYS[1])
        else
            return 0
        end
        """
        return self.redis.eval(script, 1, self.lock_name, self.identifier)
```

## 最佳实践

- **合理的数据结构选择**: 针对场景选择最合适的数据类型
- **键名设计**: 使用冒号分隔的命名约定(如user:1000:profile)
- **内存管理**: 设置合理的maxmemory和驱逐策略
- **连接池管理**: 复用连接，避免频繁建立连接
- **批量操作**: 使用Pipeline减少网络往返
- **定期持久化**: 配置合适的持久化策略
- **监控指标**: 关注内存使用、命令延迟、命中率等指标 