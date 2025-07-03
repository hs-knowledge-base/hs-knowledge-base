import { Logger } from './logger';
import {
  normalizeLanguage,
  getSupportedLanguages,
  getLanguageDisplayName
} from '@/services/language-service';
import {
  isLanguageLoaded,
  markLanguageLoaded,
  getCompilerUrl,
  getRuntimeUrl,
  needsCompiler,
  needsRuntime,
  languageService
} from '../services/language-service';
import { vendorService } from '../services/vendors';
import {Language, VendorCategory} from '@/types';

const logger = new Logger('MonacoLanguageLoader');

/** 显示 Python 加载状态 */
const showPythonLoadingStatus = (message: string): void => {
  // 创建或更新加载状态显示
  let statusElement = document.getElementById('python-loading-status');
  if (!statusElement) {
    statusElement = document.createElement('div');
    statusElement.id = 'python-loading-status';
    statusElement.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: #2d2d30;
      color: #cccccc;
      padding: 12px 16px;
      border-radius: 6px;
      border: 1px solid #007acc;
      font-size: 14px;
      z-index: 10000;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
      display: flex;
      align-items: center;
      gap: 8px;
    `;
    document.body.appendChild(statusElement);
  }

  statusElement.innerHTML = `
    <div style="
      width: 16px;
      height: 16px;
      border: 2px solid #007acc;
      border-top: 2px solid transparent;
      border-radius: 50%;
      animation: spin 1s linear infinite;
    "></div>
    <span>${message}</span>
  `;

  // 添加旋转动画
  if (!document.getElementById('python-loading-styles')) {
    const style = document.createElement('style');
    style.id = 'python-loading-styles';
    style.textContent = `
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
    `;
    document.head.appendChild(style);
  }
};

/** 隐藏 Python 加载状态 */
const hidePythonLoadingStatus = (): void => {
  const statusElement = document.getElementById('python-loading-status');
  if (statusElement) {
    statusElement.remove();
  }
};

/** 动态加载语言支持 */
export const loadMonacoLanguage = async (language: string): Promise<void> => {
  // 标准化语言名称
  const normalizedLang = normalizeLanguage(language) as Language;

  // 如果已经加载过，直接返回
  if (isLanguageLoaded(normalizedLang)) {
    return;
  }

  const languageConfig = languageService.getLanguageConfig(normalizedLang);
  if (!languageConfig) {
    logger.warn(`不支持的语言: ${language}`);
    return;
  }

  // 尝试加载语言所需的额外资源（编译器、运行时等）
  try {
    await loadLanguageResources(normalizedLang);
    markLanguageLoaded(normalizedLang);
    logger.info(`语言 ${language} 资源加载完成`);
  } catch (error) {
    // 即使资源加载失败，Monaco Editor 仍可提供基础语法高亮
    logger.warn(`语言 ${language} 额外资源加载失败，使用基础语法高亮:`, error);
    markLanguageLoaded(normalizedLang); // 标记为已处理，避免重复尝试
  }
};

/** 加载语言资源（编译器、运行时等） */
const loadLanguageResources = async (language: Language): Promise<void> => {
  const promises: Promise<void>[] = [];
  const config = languageService.getLanguageConfig(language);

  if (!config) {
    logger.warn(`未找到语言配置: ${language}`);
    return;
  }

  // 加载编译器（如果需要）
  if (needsCompiler(language)) {
    const compilerUrl = getCompilerUrl(language);
    if (compilerUrl) {
      logger.info(`加载 ${language} 编译器: ${compilerUrl}`);
      promises.push(loadScript(compilerUrl, `${language}-compiler`));
    }
  }

  // 加载运行时（如果需要）
  if (needsRuntime(language)) {
    const runtimeUrl = getRuntimeUrl(language);
    if (runtimeUrl) {
      logger.info(`加载 ${language} 运行时: ${runtimeUrl}`);

      // 特殊处理 Python 加载状态
      if (language === 'python') {
        showPythonLoadingStatus('正在下载 Python 运行环境...');
      }

      promises.push(loadScript(runtimeUrl, `${language}-runtime`));
    }
  }

  // 如果没有额外资源需要加载，直接返回
  if (promises.length === 0) {
    logger.info(`语言 ${language} 无需额外资源，使用 Monaco Editor 内置支持`);
    return;
  }

  // 并行加载所有资源
  await Promise.all(promises);
  logger.info(`语言 ${language} 的 ${promises.length} 个额外资源加载完成`);
};

/** 动态加载脚本 */
const loadScript = async (url: string, id: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    // 检查是否已经加载
    if (document.querySelector(`script[data-id="${id}"]`)) {
      resolve();
      return;
    }

    const script = document.createElement('script');
    script.src = url;
    script.async = true;
    script.setAttribute('data-id', id);

    script.onload = async () => {
      // 特殊处理 Skulpt 初始化
      if (id.includes('python') && typeof (window as any).Sk !== 'undefined') {
        try {
          logger.info('🐍 开始初始化 Python 运行环境 (Skulpt)...');

          // 显示加载状态
          showPythonLoadingStatus('正在加载 Python 标准库...');

          // 加载 Skulpt 标准库
          const stdlibScript = document.createElement('script');
          stdlibScript.src = vendorService.getVendorUrl(VendorCategory.COMPILER, 'skulptStdlib');
          document.head.appendChild(stdlibScript);

          await new Promise((resolve, reject) => {
            stdlibScript.onload = resolve;
            stdlibScript.onerror = reject;
          });

          showPythonLoadingStatus('正在初始化 Python 运行环境...');

          // 配置 Skulpt
          (window as any).Sk.pre = "output";
          (window as any).Sk.configure({
            output: function(text: string) {
              console.log('Python:', text);
            },
            read: function(x: string) {
              if ((window as any).Sk.builtinFiles === undefined || (window as any).Sk.builtinFiles["files"][x] === undefined)
                throw "File not found: '" + x + "'";
              return (window as any).Sk.builtinFiles["files"][x];
            }
          });

          hidePythonLoadingStatus();
          logger.info('✅ Python 运行环境准备完成 (Skulpt)');

        } catch (error) {
          hidePythonLoadingStatus();
          logger.error('❌ Python 运行环境初始化失败:', error);
          reject(error);
          return;
        }
      }
      resolve();
    };

    script.onerror = () => reject(new Error(`Failed to load script: ${url}`));

    document.head.appendChild(script);
  });
};

/** 预加载常用语言 */
export const preloadCommonLanguages = async (): Promise<void> => {
  const commonLanguages: Language[] = ['javascript', 'typescript', 'css', 'html'];

  logger.info('开始预加载常用语言...');

  const loadPromises = commonLanguages.map(lang =>
    loadMonacoLanguage(lang).catch(error => {
      logger.warn(`预加载语言 ${lang} 失败`, error);
    })
  );

  await Promise.all(loadPromises);
  logger.info('常用语言预加载完成');
};

// 重新导出语言服务的方法，保持向后兼容
export {
  getSupportedLanguages,
  getLanguageDisplayName,
  isLanguageLoaded,
  normalizeLanguage
};
