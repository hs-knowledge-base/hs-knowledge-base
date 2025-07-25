# 结合 github 实现自动更新

## 简介

通过使用 electron-builder 与和 electron-updater，结合 github 可以实现自动更新。

## 步骤 1: 创建对应 github 仓库存储代码，获取到 github token

1. 登录 github，点击右上角头像，选择 Settings
2. 在左侧菜单栏中选择 Developer settings
3. 在右侧菜单栏中选择 Personal access tokens 下的 Tokens(classic)
4. 点击 Generate new token
5. 填写 Token description，选择有效期，选择 scopes 中的 repo
6. 点击 Generate token

## 步骤 2: 配置 electron-builder.yml 文件

```js
publish: provider: github;
owner: "your github name";
repo: "your github store name";
token: "your github token";
releaseType: "release";
```

## 步骤 3: 配置 upload.ts 文件

```js
import { autoUpdater } from "electron-updater";
import { BrowserWindow, ipcMain } from "electron";

export function setupUpdate(mainWindow: BrowserWindow) {
  // 默认不自动下载，等待用户确认
  autoUpdater.autoDownload = false;

  // 检测下载进度
  autoUpdater.on("download-progress", (progressObj) => {
    mainWindow.webContents.send("update-progress", {
      percent: progressObj.percent,
      transferred: progressObj.transferred,
      total: progressObj.total,
      bytesPerSecond: progressObj.bytesPerSecond,
    });
  });

  // 更新下载完成
  autoUpdater.on("update-downloaded", () => {
    mainWindow.webContents.send("update-downloaded");
  });

  // 检测到新版本
  autoUpdater.on("update-available", (info) => {
    mainWindow.webContents.send("update-available", info);
  });

  // 没有新版本
  autoUpdater.on("update-not-available", () => {
    mainWindow.webContents.send("update-not-available");
  });

  // 检查更新出错
  autoUpdater.on("error", (err) => {
    mainWindow.webContents.send("update-error", err);
  });

  // 监听开始下载的请求
  ipcMain.on("start-download", () => {
    autoUpdater.downloadUpdate();
  });

  // 监听安装更新的请求
  ipcMain.on("quit-and-install", () => {
    autoUpdater.quitAndInstall(false, true);
  });

  // 开始检查更新
  autoUpdater.checkForUpdates();
}
```

## 步骤 4: 配置 index.ts 文件

```js
import { app, shell, BrowserWindow, ipcMain, Tray, Menu } from "electron";
import { join } from "path";
import { electronApp, optimizer, is } from "@electron-toolkit/utils";
import { setupUpdate } from "./update";

let mainWindow: BrowserWindow | null = null;

function createWindow(): void {
  const iconPath = join(__dirname, "../../resources/icon.png");
  mainWindow = new BrowserWindow({
    width: 900,
    height: 670,
    show: false,
    autoHideMenuBar: true,
    icon: iconPath,
    ...(process.platform === "linux" ? { iconPath } : {}),
    webPreferences: {
      preload: join(__dirname, "../preload/index.js"),
      sandbox: false,
    },
    frame: false,
    transparent: true,
  });

  // ...

  // 获取应用版本号
  ipcMain.handle("get-version", () => {
    return app.getVersion();
  });

  // 获取应用更新
  ipcMain.handle("get-app-update", () => {
    setupUpdate(mainWindow);
  });
}
```

## 步骤 5: 配置 package.json 文件

```js
"scripts": {
    "build": "electron-vite build",
    "build:win": "npm run build && electron-builder --win --config --publish always",
  }
```

## 步骤 6: 打包后会自动发布到 github 仓库上，然后会产生一个 release 版本.

## 总结

总体思路就是：

1. 配置 github 仓库，获取到 github token
2. 配置 electron-builder.yml 文件，将代码打包到 github 仓库上
3. 配置 upload.ts 文件，监听用户的更新请求，下载更新，安装更新
4. 配置 index.ts 文件，监听用户的更新请求，获取版本号，获取应用更新
5. 配置 package.json 文件，打包命令，发布命令
