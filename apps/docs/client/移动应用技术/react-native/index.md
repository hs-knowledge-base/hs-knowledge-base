# React Native

## 简介

React Native是由Facebook开发的开源框架，允许开发者使用JavaScript和React构建原生移动应用。它的核心理念是"一次学习，随处编写"，让Web开发者能够利用已有的React知识快速进入移动应用开发领域。

## 核心特性

### 跨平台开发
- iOS和Android平台统一代码
- 平台特定组件与API
- 代码共享与复用策略
- Web与移动代码共享(React Native Web)

### 原生性能
- 原生UI组件渲染
- JavaScript与原生桥接
- 新架构(Fabric & TurboModules)
- Hermes JavaScript引擎

### 热重载与快速迭代
- Fast Refresh开发体验
- Metro打包工具
- 代码推送(CodePush)
- 开发者菜单与调试工具

## 组件与API

### 核心组件
- View/Text/Image基础组件
- ScrollView与FlatList
- TextInput与表单控件
- Animated动画系统

### 导航与路由
- React Navigation生态
- 堆栈、标签与抽屉导航
- 深层链接处理
- 屏幕过渡与动画

### 状态管理
- React Context
- Redux/MobX集成
- Recoil原子状态
- React Query数据获取

## 原生功能集成

### 原生模块开发
- 原生模块桥接
- 原生UI组件封装
- 事件发射与监听
- 线程模型与异步操作

### 设备功能访问
- 相机与图库
- 地理位置
- 推送通知
- 生物识别

## 性能优化

### 渲染优化
- 组件记忆化
- 列表性能优化
- 避免不必要的渲染
- 使用useCallback/useMemo

### 内存管理
- 图片优化
- 大列表虚拟化
- 避免内存泄漏
- 性能分析工具

## 部署与发布

### 应用打包
- iOS构建与证书
- Android签名与打包
- 自动化构建流程
- CI/CD集成

### 应用商店发布
- App Store审核准备
- Google Play发布流程
- 版本管理与更新策略
- Beta测试与灰度发布

## 代码示例

```jsx
// React Native组件示例
import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

const Counter = () => {
  const [count, setCount] = useState(0);
  
  return (
    <View style={styles.container}>
      <Text style={styles.title}>React Native 计数器</Text>
      <Text style={styles.count}>{count}</Text>
      <View style={styles.buttonRow}>
        <TouchableOpacity 
          style={styles.button} 
          onPress={() => setCount(count - 1)}
        >
          <Text style={styles.buttonText}>-</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.button} 
          onPress={() => setCount(count + 1)}
        >
          <Text style={styles.buttonText}>+</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  count: {
    fontSize: 48,
    marginVertical: 30,
  },
  buttonRow: {
    flexDirection: 'row',
    width: '60%',
    justifyContent: 'space-between',
  },
  button: {
    backgroundColor: '#007AFF',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 10,
  },
  buttonText: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
  },
});

export default Counter;
``` 