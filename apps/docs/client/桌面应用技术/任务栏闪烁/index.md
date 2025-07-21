# 任务栏图标闪烁

## 简介

通过使用 mainWindow.flashFrame() 来控制任务栏图标的闪烁。

## 步骤 1: 当有新消息来时，通过控制mainWindow.flashFrame()来实现任务栏图标闪烁。

```js
  // 任务栏闪烁控制变量
  let isFlashing = false
  let flashInterval: NodeJS.Timeout | null = null

  mainWindow.on('show', () => {
    setTaskbarFlashing(false)
  })

  mainWindow.on('focus', () => {
    setTaskbarFlashing(false)
  })

  mainWindow.on('restore', () => {
    setTaskbarFlashing(false)
  })

  // 处理新消息时的闪烁
  ipcMain.on('new-message-received', () => {
    if (!mainWindow) return

    // 只有在窗口不在前台时才闪烁
    if (mainWindow.isMinimized() || !mainWindow.isFocused() || !mainWindow.isVisible()) {
      setTaskbarFlashing(true)
    }
  })

 // 设置任务栏闪烁状态
  const setTaskbarFlashing = (shouldFlash: boolean) => {
    if (!mainWindow) return

    if (shouldFlash && !isFlashing) {
      // 开始闪烁
      isFlashing = true
      mainWindow.flashFrame(true)

      // 可选：设置持续闪烁
      flashInterval = setInterval(() => {
        if (mainWindow && isFlashing) {
          mainWindow.flashFrame(true)
        }
      }, 1000) // 每秒闪烁一次
    } else if (!shouldFlash && isFlashing) {
      // 停止闪烁
      isFlashing = false
      mainWindow.flashFrame(false)

      if (flashInterval) {
        clearInterval(flashInterval)
        flashInterval = null
      }
    }
  }
```
