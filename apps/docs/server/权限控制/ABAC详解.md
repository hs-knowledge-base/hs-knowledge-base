# ABAC - 基于属性的访问控制

## 什么是 ABAC？

ABAC就像智能门禁：不只看你的工牌，还要看时间、地点、要做什么。

比如：张三（IT部门）在工作时间（9-18点）在办公室（内网）可以编辑文档（普通级别）。

## 核心思想

ABAC通过**四种属性**综合决策：用户属性 + 资源属性 + 环境属性 + 操作属性 → 权限决策

## 四大属性

ABAC通过四种属性来决定权限：

**用户属性**：张三、IT部门、5级、后端团队
**资源属性**：文档、普通级别、张三创建、IT部门
**环境属性**：14:30、工作日、办公室、内网
**操作属性**：读取、低风险、普通紧急度



## ABAC 决策流程

:::mermaid
sequenceDiagram
    participant U as 用户
    participant G as 权限守卫
    participant AC as 属性收集器
    participant RE as 规则引擎
    participant DE as 决策引擎
    participant DB as 数据库

    U->>G: 请求访问资源
    G->>AC: 收集所有属性

    AC->>AC: 获取用户属性
    AC->>AC: 获取资源属性
    AC->>AC: 获取环境属性
    AC->>AC: 获取操作属性

    AC-->>G: 返回属性集合
    G->>RE: 查找匹配规则
    RE->>DB: 查询权限规则
    DB-->>RE: 返回规则列表
    RE-->>G: 返回适用规则

    G->>DE: 执行权限决策
    DE->>DE: 评估所有规则
    DE-->>G: 返回决策结果

    alt 允许访问
        G-->>U: 授权成功
    else 拒绝访问
        G-->>U: 拒绝访问 (403 Forbidden)
    end
:::

## 代码示例

```typescript
// 简单的ABAC规则
const rule = {
  name: '部门文档访问',
  condition: (user, resource, env, action) =>
    action === 'read' &&
    resource.type === 'document' &&
    user.department === resource.department &&
    env.isWorkingHours
};

// 权限检查
function checkPermission(user, resource, env, action) {
  return rule.condition(user, resource, env, action);
}
```





## 优点

- **极其灵活**：可以处理复杂的权限场景
- **细粒度控制**：精确到具体资源和操作
- **上下文感知**：考虑时间、地点等环境因素
- **符合现实**：更接近真实的权限需求

## 缺点

- **复杂度高**：每次权限检查都需要复杂计算
- **性能开销大**：需要收集属性、评估规则
- **调试困难**：权限拒绝原因复杂
- **管理复杂**：规则数量多，可能冲突

## 适用场景

**适合：**
- 多租户系统（需要复杂隔离）
- 云服务平台（资源类型多样）
- 金融/医疗系统（需要考虑时间、地点、风险）

**不适合：**
- 简单的企业应用（权限需求简单）
- 小型团队项目（开发资源有限）

## 总结

ABAC灵活强大，适合复杂权限需求。但实现复杂，需要权衡成本和收益。
