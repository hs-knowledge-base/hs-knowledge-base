# MySQL

## 简介

MySQL是世界上最流行的开源关系型数据库管理系统之一，以其可靠性、性能和易用性而闻名。它采用客户端-服务器架构，支持多种存储引擎，广泛应用于Web应用、企业应用和云服务等领域。

## 核心特性

### 架构特点
- **多存储引擎**: InnoDB、MyISAM、Memory等
- **插件式架构**: 可扩展功能模块
- **主从复制**: 数据同步与读写分离
- **分区表**: 逻辑数据分割管理

### 数据类型
- **数值类型**: INT, DECIMAL, FLOAT等
- **字符串类型**: VARCHAR, TEXT, CHAR等
- **时间日期类型**: DATETIME, DATE, TIMESTAMP等
- **二进制类型**: BLOB, BINARY等
- **JSON类型**: 原生JSON数据支持(5.7+)

### 存储引擎

#### InnoDB
- **ACID事务**: 完整事务支持
- **行级锁定**: 高并发性能
- **外键约束**: 参照完整性
- **崩溃恢复**: 自动恢复能力
- **缓冲池**: 内存数据缓存

#### MyISAM
- **全文索引**: 文本搜索能力
- **表级锁**: 简单锁机制
- **压缩表**: 静态只读表压缩
- **无事务支持**: 性能优先

#### Memory
- **内存表**: 极速访问
- **哈希索引**: 快速查找
- **临时数据**: 会话级数据

## 索引技术

### 索引类型
- **B+树索引**: 默认索引结构
- **哈希索引**: Memory引擎支持
- **全文索引**: 文本搜索优化
- **空间索引**: 地理数据索引

### 索引设计原则
- **选择性原则**: 高区分度字段
- **最左前缀**: 复合索引使用规则
- **索引覆盖**: 减少回表操作
- **适度原则**: 避免过多索引

### 常见索引问题
- **索引失效**: 函数使用、隐式转换
- **回表查询**: 二次访问成本
- **索引更新开销**: 写入性能影响
- **索引碎片**: 性能降低因素

## 事务与并发

### 事务特性
- **原子性(Atomicity)**: 全部完成或全部回滚
- **一致性(Consistency)**: 保持数据完整性
- **隔离性(Isolation)**: 事务间互不干扰
- **持久性(Durability)**: 提交后永久保存

### 隔离级别
- **读未提交(Read Uncommitted)**: 脏读风险
- **读已提交(Read Committed)**: 不可重复读风险
- **可重复读(Repeatable Read)**: 幻读风险
- **可串行化(Serializable)**: 完全隔离

### 锁机制
- **共享锁(S锁)**: 读锁，允许并发读
- **排他锁(X锁)**: 写锁，阻止其他访问
- **意向锁**: 表级锁定效率提升
- **间隙锁**: 防止幻读的范围锁
- **行锁、表锁**: 不同粒度的锁定

## 高可用与扩展性

### 主从复制
- **异步复制**: 标准复制模式
- **半同步复制**: 提高数据安全性
- **组复制**: 多主一致性协议
- **延迟复制**: 灾难恢复保护

### 高可用方案
- **MySQL主从切换**: 手动/自动故障转移
- **MySQL Cluster**: NDB集群存储
- **MySQL InnoDB Cluster**: 组复制架构
- **ProxySQL/MySQL Router**: 负载均衡

### 分片与分区
- **水平分片**: 跨实例数据拆分
- **垂直分片**: 按功能拆分表
- **RANGE分区**: 范围分区
- **LIST分区**: 列表分区
- **HASH分区**: 哈希分布
- **KEY分区**: 键值分布

## 性能优化

### 查询优化
- **执行计划分析**: EXPLAIN命令
- **索引优化**: 合理创建与使用索引
- **JOIN优化**: 小表驱动大表
- **子查询优化**: 转化为JOIN
- **LIMIT优化**: 避免深分页问题

### 配置优化
- **缓冲池大小**: innodb_buffer_pool_size
- **日志缓冲区**: innodb_log_buffer_size
- **并发连接数**: max_connections
- **临时表大小**: tmp_table_size
- **排序缓冲**: sort_buffer_size

### 架构优化
- **读写分离**: 分担读负载
- **缓存层**: 应用缓存减轻压力
- **慢查询分析**: 识别性能瓶颈
- **合理分区**: 减少扫描数据量

## 代码示例

### 基本连接与查询(PHP)

```php
<?php
// 创建连接
$mysqli = new mysqli("localhost", "username", "password", "database");

// 检查连接
if ($mysqli->connect_errno) {
    echo "Failed to connect to MySQL: " . $mysqli->connect_error;
    exit();
}

// 执行查询
$sql = "SELECT id, name, email FROM users WHERE status = 'active' LIMIT 10";
$result = $mysqli->query($sql);

// 处理结果
if ($result->num_rows > 0) {
    while($row = $result->fetch_assoc()) {
        echo "ID: " . $row["id"] . " - Name: " . $row["name"] . " - Email: " . $row["email"] . "<br>";
    }
} else {
    echo "0 results";
}

// 关闭连接
$mysqli->close();
?>
```

### 事务处理(Node.js)

```javascript
const mysql = require('mysql2/promise');

async function transferFunds(fromAccount, toAccount, amount) {
  // 创建连接池
  const pool = mysql.createPool({
    host: 'localhost',
    user: 'username',
    password: 'password',
    database: 'bank',
    waitForConnections: true,
    connectionLimit: 10
  });
  
  const conn = await pool.getConnection();
  
  try {
    // 开始事务
    await conn.beginTransaction();
    
    // 检查余额
    const [rows] = await conn.query('SELECT balance FROM accounts WHERE id = ? FOR UPDATE', [fromAccount]);
    if (rows.length === 0 || rows[0].balance < amount) {
      throw new Error('Insufficient funds');
    }
    
    // 从源账户扣款
    await conn.query('UPDATE accounts SET balance = balance - ? WHERE id = ?', [amount, fromAccount]);
    
    // 向目标账户加款
    await conn.query('UPDATE accounts SET balance = balance + ? WHERE id = ?', [amount, toAccount]);
    
    // 记录交易
    await conn.query(
      'INSERT INTO transactions (from_account, to_account, amount, transaction_date) VALUES (?, ?, ?, NOW())',
      [fromAccount, toAccount, amount]
    );
    
    // 提交事务
    await conn.commit();
    
    return { success: true, message: 'Transfer completed successfully' };
  } catch (error) {
    // 回滚事务
    await conn.rollback();
    return { success: false, message: error.message };
  } finally {
    // 释放连接
    conn.release();
  }
}
```

## 最佳实践

- **规范表设计**: 合理的字段类型与长度
- **合理的索引策略**: 根据查询模式设计
- **事务适度原则**: 控制事务粒度与时长
- **定期维护**: 表分析、索引优化、碎片整理
- **备份策略**: 定期备份与验证恢复
- **监控关键指标**: 连接数、查询性能、缓冲命中率
- **升级计划**: 跟进版本安全更新 