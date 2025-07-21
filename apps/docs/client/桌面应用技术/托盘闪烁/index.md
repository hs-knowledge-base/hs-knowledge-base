# 托盘图标闪烁

## 简介

通过切换托盘图标来控制托盘图标的闪烁。

## 步骤 1: 当有新消息来时，通过切换托盘图标来控制托盘图标的闪烁。

```js
  mainWindow.on('ready-to-show', () => {
    createTray()
  })

  // 获取托盘图标
  const getIconPath = () => {
    const possiblePaths = [
      is.dev
        ? join(__dirname, '../../resources/icon.png')
        : join(process.resourcesPath, 'icon.png'),
      join(__dirname, '../../build/icon.png'),
      join(__dirname, '../../../resources/icon.png'),
      join(process.cwd(), 'resources/icon.png')
    ]

    for (const iconPath of possiblePaths) {
      if (fs.existsSync(iconPath)) {
        return iconPath
      }
    }

    console.error('未找到图标文件，使用默认路径')
    return possiblePaths[0]
  }

  // 获取透明图标路径
  const getTransparentIconPath = () => {
    const possiblePaths = [
      is.dev
        ? join(__dirname, '../../resources/transparent.png')
        : join(process.resourcesPath, 'transparent.png'),
      join(__dirname, '../../build/transparent.png'),
      join(__dirname, '../../../resources/transparent.png'),
      join(process.cwd(), 'resources/transparent.png')
    ]

    return possiblePaths[0]
  }

   let tray: Tray | null = null

  // 创建托盘
  function createTray() {
    if (!tray) {
      try {
        const trayIconPath = getIconPath()

        if (!fs.existsSync(trayIconPath)) {
          console.error('托盘图标文件不存在:', trayIconPath)
          return
        }

        tray = new Tray(trayIconPath)
        const contextMenu = Menu.buildFromTemplate([
          {
            label: '显示主窗口',
            click: () => {
              mainWindow?.show()
              clearNotificationsAndMessages()
            }
          },
          {
            label: '退出',
            click: () => {
              app.quit()
            }
          }
        ])
        tray.setToolTip('tooltip')
        tray.setContextMenu(contextMenu)

        // 点击托盘图标显示主窗口
        tray.on('click', () => {
          mainWindow?.show()
          clearNotificationsAndMessages()
        })

        // 添加鼠标悬停事件 - 显示消息预览
        tray.on('mouse-enter', () => {
          // 清除任何现有的关闭定时器
          if (previewWindowTimer) {
            clearTimeout(previewWindowTimer)
            previewWindowTimer = null
          }

          if (newMessages.length > 0) {
            createMessagePreviewWindow()
          }
        })

        // 添加鼠标离开事件 - 延迟关闭预览窗口
        tray.on('mouse-leave', () => {
          // 延长延迟时间，给用户足够时间移动到预览窗口
          if (previewWindowTimer) {
            clearTimeout(previewWindowTimer)
          }
          previewWindowTimer = setTimeout(() => {
            if (messagePreviewWindow) {
              messagePreviewWindow.close()
              messagePreviewWindow = null
            }
          }, 2000) // 增加到2秒延迟
        })
      } catch (error) {
        console.error('创建托盘失败:', error)
      }
    }
  }

  // 托盘闪烁控制函数
  const setTrayFlashing = (shouldFlash: boolean) => {
    if (!tray) return

    if (shouldFlash && !isTrayFlashing) {
      isTrayFlashing = true

      const normalIconPath = getIconPath()
      // 创建透明图标路径
      const transparentIconPath = getTransparentIconPath()

      let toggle = true
      trayFlashInterval = setInterval(() => {
        if (tray && isTrayFlashing) {
          try {
            // 在正常图标和透明图标之间切换
            tray.setImage(toggle ? normalIconPath : transparentIconPath)
            toggle = !toggle
          } catch (error) {
            console.error('设置托盘图标失败:', error)
          }
        }
      }, 500) // 每500毫秒切换一次
    } else if (!shouldFlash && isTrayFlashing) {
      isTrayFlashing = false
      if (trayFlashInterval) {
        clearInterval(trayFlashInterval)
        trayFlashInterval = null
      }
      if (tray) {
        // 恢复正常图标
        tray.setImage(getIconPath())
        tray.setToolTip('tooltip')
      }
    }
  }
```
