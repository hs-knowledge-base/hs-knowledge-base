# Electron 桌面应用开发

## 简介

Electron是一个使用JavaScript、HTML和CSS构建跨平台桌面应用程序的框架。它基于Node.js和Chromium，让开发者能够使用Web技术栈开发具有原生能力的桌面应用。众多知名应用如VS Code、Slack、Discord、Figma等都是基于Electron构建的。

## 核心概念

### 进程模型
- 主进程(Main Process)
- 渲染进程(Renderer Process)
- 预加载脚本(Preload Scripts)
- 进程间通信(IPC)

### 核心模块
- BrowserWindow窗口管理
- Menu应用菜单
- Dialog对话框
- Tray系统托盘
- WebContents网页内容

### 平台集成
- 原生菜单与快捷键
- 系统通知
- 文件拖放
- 剪贴板访问
- 自动更新

## 应用架构

### 项目结构
- 主进程代码组织
- 渲染进程前端框架集成
- 资源文件管理
- 配置文件与环境变量

### 前端集成
- React/Vue/Angular集成
- TypeScript类型支持
- 状态管理方案
- 路由与多窗口管理

### 数据持久化
- SQLite本地数据库
- IndexedDB浏览器存储
- 本地文件存储
- 云同步策略

## 系统能力

### 文件系统操作
- 读写文件与目录
- 监听文件变化
- 对话框与文件选择
- 拖放文件处理

### 系统API访问
- 操作系统信息获取
- 硬件信息与状态
- 网络状态监测
- 电源管理

### 安全特性
- 上下文隔离
- 内容安全策略
- 沙箱与权限模型
- 安全通信机制

## 性能优化

### 启动性能
- 懒加载与预加载
- 窗口创建优化
- 资源压缩与打包
- 冷启动与热启动优化

### 运行时性能
- 进程通信优化
- 内存使用管理
- CPU密集任务处理
- 渲染性能优化

## 打包与部署

### 打包工具
- electron-builder
- electron-forge
- electron-packager
- 自定义打包脚本

### 自动更新
- electron-updater
- 差量更新策略
- 更新服务器搭建
- 版本控制与回滚

### 代码签名
- Windows代码签名
- macOS公证与签名
- 证书管理
- CI/CD集成签名

## 最佳实践

### 架构模式
- MVC/MVVM架构
- 模块化设计
- 插件化架构
- 多进程任务分配

### 测试策略
- 单元测试
- 集成测试
- E2E测试
- 自动化UI测试

### 调试技巧
- 开发者工具使用
- 日志与错误处理
- 性能分析
- 远程调试

## 代码示例

```javascript
// 主进程示例代码
const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');

// 保持窗口对象的全局引用
let mainWindow;

function createWindow() {
  // 创建浏览器窗口
  mainWindow = new BrowserWindow({
    width: 900,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  // 加载应用的index.html
  mainWindow.loadFile('index.html');
  
  // 打开开发者工具
  if (process.env.NODE_ENV === 'development') {
    mainWindow.webContents.openDevTools();
  }

  // 当窗口关闭时触发
  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// 当Electron完成初始化并准备创建浏览器窗口时调用此方法
app.whenReady().then(() => {
  createWindow();
  
  app.on('activate', () => {
    // 在macOS上，当点击dock图标并且没有其他窗口打开时，
    // 通常在应用程序中重新创建一个窗口。
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

// 当所有窗口关闭时退出应用
app.on('window-all-closed', () => {
  // 在macOS上，除非用户用Cmd + Q确定地退出，
  // 否则绝大部分应用及其菜单栏会保持激活。
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// 处理来自渲染进程的消息
ipcMain.handle('get-app-info', () => {
  return {
    appName: app.getName(),
    appVersion: app.getVersion(),
    electronVersion: process.versions.electron,
    nodeVersion: process.versions.node,
    platform: process.platform
  };
});
``` 