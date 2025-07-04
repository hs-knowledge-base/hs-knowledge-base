import { useEffect, useRef } from 'react';
import { useEditorStore } from '@/stores/editor-store';
import { usePlaygroundStore } from '@/stores/playground-store';
import { useUrlParams } from './use-url-params';
import type { Language } from '@/types';

/**
 * 代码初始化 hook
 * 处理从 URL 参数加载代码或使用默认代码
 */
export function useCodeInitialization() {
  const { params, isFromKnowledgeBase, hasParams } = useUrlParams();
  const { setEditorContent, setEditorLanguage } = useEditorStore();
  const { addConsoleMessage, clearConsole } = usePlaygroundStore();
  const isInitialized = useRef(false);

  useEffect(() => {
    // 避免重复初始化
    if (isInitialized.current) return;
    isInitialized.current = true;

    console.log('[CodeInitialization] 开始初始化代码');

    if (isFromKnowledgeBase || hasParams) {
      // 场景一：从知识库跳转或有 URL 参数
      initializeFromParams();
    } else {
      // 场景二：直接访问，使用默认代码
      initializeWithDefaults();
    }
  }, [params, isFromKnowledgeBase, hasParams]);

  /** 从 URL 参数初始化代码 */
  const initializeFromParams = () => {
    console.log('[CodeInitialization] 从 URL 参数初始化代码');
    
    clearConsole();
    addConsoleMessage({
      type: 'info',
      message: '🔗 从知识库加载代码...'
    });

    // 设置代码内容
    if (params.markup) {
      setEditorContent('markup', params.markup);
      console.log('[CodeInitialization] 设置 markup 内容');
    }

    if (params.style) {
      setEditorContent('style', params.style);
      console.log('[CodeInitialization] 设置 style 内容');
    }

    if (params.script) {
      setEditorContent('script', params.script);
      console.log('[CodeInitialization] 设置 script 内容');
    }

    // 设置语言类型
    if (params.markupLang) {
      setEditorLanguage('markup', params.markupLang);
      console.log('[CodeInitialization] 设置 markup 语言:', params.markupLang);
    }

    if (params.styleLang) {
      setEditorLanguage('style', params.styleLang);
      console.log('[CodeInitialization] 设置 style 语言:', params.styleLang);
    }

    if (params.scriptLang) {
      setEditorLanguage('script', params.scriptLang);
      console.log('[CodeInitialization] 设置 script 语言:', params.scriptLang);
    }

    // 如果设置了自动运行
    if (params.autoRun) {
      setTimeout(() => {
        addConsoleMessage({
          type: 'info',
          message: '🚀 自动运行代码...'
        });
        // 这里可以触发代码运行
      }, 1000);
    }

    addConsoleMessage({
      type: 'success',
      message: '✅ 代码加载完成！'
    });
  };

  /** 使用默认代码初始化 */
  const initializeWithDefaults = () => {
    console.log('[CodeInitialization] 使用默认代码初始化');
    
    clearConsole();
    addConsoleMessage({
      type: 'info',
      message: '🔥 欢迎使用火山知识库代码演练场！'
    });

    // 确保使用默认语言
    setEditorLanguage('markup', 'html');
    setEditorLanguage('style', 'css');
    setEditorLanguage('script', 'javascript');

    // 默认代码已经在 store 的 initialState 中设置
    // 这里只需要确保语言设置正确

    addConsoleMessage({
      type: 'info',
      message: '💡 你可以编辑代码并点击运行按钮查看效果'
    });

    addConsoleMessage({
      type: 'info',
      message: '🔗 也可以从知识库文档中点击"运行代码"按钮跳转到这里'
    });
  };

  return {
    isFromKnowledgeBase,
    hasParams,
    isInitialized: isInitialized.current
  };
}

/**
 * 获取当前代码的分享链接
 */
export function useShareLink() {
  const { contents, configs } = useEditorStore();

  const generateLink = (autoRun = false) => {
    const { generateShareUrl } = require('./use-url-params');
    
    return generateShareUrl(
      contents,
      {
        markup: configs.markup.language,
        style: configs.style.language,
        script: configs.script.language
      },
      autoRun
    );
  };

  return { generateLink };
}
