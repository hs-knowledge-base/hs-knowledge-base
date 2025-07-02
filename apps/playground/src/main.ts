import { createPlayground } from './core/playground';
import { getDefaultConfig } from './core/config';
import type { Config } from './types';

async function main() {
  console.log('🔥 火山知识库 - 代码演练场启动中...');

  try {
    // 获取容器元素
    const container = document.getElementById('app');
    if (!container) {
      throw new Error('找不到应用容器');
    }

    // 从 URL 参数获取配置
    const urlConfig = getConfigFromURL();

    // 合并默认配置
    const config = {
      ...getDefaultConfig(),
      ...urlConfig
    };

    console.log('配置:', config);

    // 创建 playground 实例
    const playground = await createPlayground({
      container,
      config
    });

    console.log('✅ 代码演练场启动成功');

    // 全局暴露 API（用于调试）
    (window as any).__playground__ = playground;

  } catch (error) {
    console.error('❌ 启动失败:', error);
    showError(error as Error);
  }
}

function getConfigFromURL(): Partial<Config> {
  const urlParams = new URLSearchParams(window.location.search);
  const configParam = urlParams.get('config');

  if (!configParam) {
    return {};
  }

  try {
    return JSON.parse(decodeURIComponent(configParam));
  } catch (error) {
    console.warn('无法解析 URL 配置参数:', error);
    return {};
  }
}

function showError(error: Error) {
  const container = document.getElementById('app');
  if (!container) return;

  container.innerHTML = `
    <div style="
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      height: 100vh;
      padding: 20px;
      text-align: center;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    ">
      <h1 style="color: #d73a49; margin-bottom: 16px;">❌ 启动失败</h1>
      <p style="color: #666; margin-bottom: 20px; max-width: 600px;">
        ${error.message}
      </p>
      <button
        onclick="window.location.reload()"
        style="
          padding: 8px 16px;
          background: #007acc;
          color: white;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          font-size: 14px;
        "
      >
        重新加载
      </button>
    </div>
  `;
}

// 启动应用
main();
