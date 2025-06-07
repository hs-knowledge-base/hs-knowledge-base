# Kafka

## 简介

Apache Kafka是一个分布式流处理平台，最初由LinkedIn开发并贡献给Apache基金会。Kafka被设计为高吞吐量、可持久化、可扩展的消息系统，特别适合处理大规模的实时数据流。

## 核心概念

### 主要组件
- **Topic**: 消息的逻辑分类，可分区
- **Producer**: 消息生产者，将消息发送到Topic
- **Consumer**: 消息消费者，从Topic读取消息
- **Broker**: Kafka服务器，存储消息
- **ZooKeeper/KRaft**: 集群协调服务(ZooKeeper正逐渐被KRaft替代)

### 分区与副本
- **Partition**: Topic的分区，提高并行处理能力
- **Replication**: 数据副本，提高可用性
- **Leader与Follower**: 分区的主副本与从副本

## 核心特性

### 高吞吐量与低延迟
- 基于日志的存储结构
- 零拷贝技术
- 批量处理与压缩

### 持久化与可靠性
- 消息持久化到磁盘
- 多副本机制
- ACK机制确保可靠传递

### 扩展性
- 水平扩展能力
- 分区自动平衡
- 动态集群调整

### 消息语义
- At-least-once(至少一次)
- At-most-once(至多一次)
- Exactly-once(精确一次)

## 高级功能

### Kafka Streams
- 轻量级流处理库
- 状态存储
- 窗口操作与聚合

### Kafka Connect
- 数据导入/导出框架
- 丰富的连接器生态
- 可扩展API

### Schema Registry
- 消息模式管理
- 向前/向后兼容性
- Avro/Protobuf/JSON Schema支持

## 典型应用场景

- **日志聚合**: 收集分布式系统的日志
- **事件溯源**: 记录状态变更事件
- **流处理**: 实时数据处理管道
- **消息系统**: 解耦系统组件
- **指标监控**: 收集和处理监控数据

## 代码示例

### Producer示例(Java)

```java
Properties props = new Properties();
props.put("bootstrap.servers", "localhost:9092");
props.put("key.serializer", "org.apache.kafka.common.serialization.StringSerializer");
props.put("value.serializer", "org.apache.kafka.common.serialization.StringSerializer");

Producer<String, String> producer = new KafkaProducer<>(props);
ProducerRecord<String, String> record = new ProducerRecord<>("test-topic", "key", "value");

producer.send(record, (metadata, exception) -> {
    if (exception != null) {
        exception.printStackTrace();
    } else {
        System.out.println("Topic: " + metadata.topic() + ", Partition: " + metadata.partition() + ", Offset: " + metadata.offset());
    }
});

producer.close();
```

### Consumer示例(Java)

```java
Properties props = new Properties();
props.put("bootstrap.servers", "localhost:9092");
props.put("group.id", "test-group");
props.put("key.deserializer", "org.apache.kafka.common.serialization.StringDeserializer");
props.put("value.deserializer", "org.apache.kafka.common.serialization.StringDeserializer");

KafkaConsumer<String, String> consumer = new KafkaConsumer<>(props);
consumer.subscribe(Arrays.asList("test-topic"));

while (true) {
    ConsumerRecords<String, String> records = consumer.poll(Duration.ofMillis(100));
    for (ConsumerRecord<String, String> record : records) {
        System.out.println("Topic: " + record.topic() + ", Key: " + record.key() + ", Value: " + record.value());
    }
}
```

## 最佳实践

- **适当分区数**: 根据处理需求和集群规模设置
- **消费者组设计**: 合理组织消费者
- **消息键设计**: 确保相关消息路由到同一分区
- **监控与告警**: 建立关键指标监控
- **安全配置**: 启用认证与授权机制 