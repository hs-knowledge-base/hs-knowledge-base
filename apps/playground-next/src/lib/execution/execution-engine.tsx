'use client';

import React, { useRef, useEffect, useState } from 'react';
import type { Language } from '@/types';
import { getGlobalRuntimeManager, type RuntimeResult } from '@/lib/services/language-runtimes';
import { useEditorStore } from '@/stores/editor-store';
import { usePlaygroundStore } from '@/stores/playground-store';
import { getGlobalCompilerFactory, type ConsoleMessage } from '@/lib/compiler/compiler-factory';

interface ExecutionEngineProps {
  className?: string;
}

/** 代码执行引擎组件 */
export function ExecutionEngine({ className = '' }: ExecutionEngineProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [isExecuting, setIsExecuting] = useState(false);
  const [lastExecutionTime, setLastExecutionTime] = useState(0);
  const { contents, configs } = useEditorStore();
  const { addConsoleMessage, manualRunTrigger } = usePlaygroundStore();
  const runtimeManager = getGlobalRuntimeManager();
  const compilerFactory = getGlobalCompilerFactory();

  /** 执行代码的主要逻辑 */
  const executeCode = async () => {
    if (isExecuting) return;
    
    setIsExecuting(true);
    const startTime = Date.now();
    
    try {
      addConsoleMessage({
        type: 'info',
        message: '🚀 开始执行代码...'
      });

      // 执行每个编辑器的代码
      const results = await Promise.all([
        executeEditorCode('markup'),
        executeEditorCode('style'),
        executeEditorCode('script')
      ]);

      // 生成最终的 HTML 预览
      await generatePreview(results);
      
      setLastExecutionTime(Date.now() - startTime);
      
      addConsoleMessage({
        type: 'log',
        message: `✅ 代码执行完成 (${Date.now() - startTime}ms)`
      });

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '执行失败';
      addConsoleMessage({
        type: 'error',
        message: `❌ 执行错误: ${errorMessage}`
      });
    } finally {
      setIsExecuting(false);
    }
  };

  /** 执行单个编辑器的代码 */
  const executeEditorCode = async (type: 'markup' | 'style' | 'script'): Promise<RuntimeResult> => {
    const code = contents[type];
    const language = configs[type].language;
    
    if (!code.trim()) {
      return { success: true, output: '' };
    }

    try {
      addConsoleMessage({
        type: 'info',
        message: `🔄 执行 ${language} 代码...`
      });

      const result = await runtimeManager.executeCode(language, code);
      
      if (result.success) {
        addConsoleMessage({
          type: 'log',
          message: `✅ ${language} 执行成功 ${result.duration ? `(${result.duration}ms)` : ''}`
        });
      } else {
        addConsoleMessage({
          type: 'error',
          message: `❌ ${language} 执行失败: ${result.error}`
        });
      }

      return result;
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '执行失败';
      addConsoleMessage({
        type: 'error',
        message: `❌ ${language} 执行错误: ${errorMessage}`
      });
      
      return {
        success: false,
        error: errorMessage
      };
    }
  };

  /** 生成预览 HTML */
  const generatePreview = async (results: RuntimeResult[]) => {
    const [markupResult, styleResult, scriptResult] = results;
    
    // 根据语言类型决定如何处理结果
    const markupLanguage = configs.markup.language;
    const styleLanguage = configs.style.language;
    const scriptLanguage = configs.script.language;

    // 获取最终内容
    const markupContent = await getFinalContent('markup', markupResult, markupLanguage);
    const styleContent = await getFinalContent('style', styleResult, styleLanguage);
    const scriptContent = await getFinalContent('script', scriptResult, scriptLanguage);

    // 生成预览 HTML
    const previewHtml = generatePreviewHtml(markupContent, styleContent, scriptContent, scriptLanguage);
    
    // 更新 iframe
    if (iframeRef.current) {
      iframeRef.current.srcdoc = previewHtml;
    }
  };

  /** 获取最终内容 */
  const getFinalContent = async (
    type: 'markup' | 'style' | 'script',
    result: RuntimeResult,
    language: Language
  ): Promise<string> => {
    // 如果执行失败，返回空内容
    if (!result.success) {
      return '';
    }

    // 对于不同类型的语言，处理输出
    switch (type) {
      case 'markup':
        // HTML 和 Markdown 直接返回输出
        if (['html', 'markdown'].includes(language)) {
          return result.output || contents[type];
        }
        break;
        
      case 'style':
        // CSS、SCSS、Less 返回编译后的 CSS
        if (['css', 'scss', 'less'].includes(language)) {
          return result.output || contents[type];
        }
        break;
        
      case 'script':
        // 对于脚本语言，需要特殊处理
        return await handleScriptContent(result, language);
    }

    return result.output || '';
  };

  /** 处理脚本内容 */
  const handleScriptContent = async (result: RuntimeResult, language: Language): Promise<string> => {
    try {
      // 尝试获取对应的编译器
      const compiler = await compilerFactory.getCompiler(language);
      
      // 如果编译器有processExecutionResult方法，使用它
      if (compiler && typeof compiler.processExecutionResult === 'function') {
        const executionResult = compiler.processExecutionResult(result);
        
        // 将控制台消息添加到我们的控制台
        executionResult.consoleMessages.forEach((msg: ConsoleMessage) => {
          addConsoleMessage(msg);
        });
        
        return executionResult.previewCode;
      }
      
      // 降级到默认处理（为了向后兼容）
      return getDefaultScriptContent(result, language);
      
    } catch (error) {
      console.warn('[ExecutionEngine] 无法获取编译器，使用默认处理:', error);
      return getDefaultScriptContent(result, language);
    }
  };

  /** 默认脚本内容处理（向后兼容） */
  const getDefaultScriptContent = (result: RuntimeResult, language: Language): string => {
    switch (language) {
      case 'javascript':
        return contents.script;
      case 'typescript':
        return result.output || '';
      default:
        return result.output || `// ${language} 代码已执行\nconsole.log('✅ ${language} 代码执行完成');`;
    }
  };

  /** 生成预览 HTML */
  const generatePreviewHtml = (
    markupContent: string,
    styleContent: string,
    scriptContent: string,
    scriptLanguage: Language
  ): string => {
    // 需要运行时依赖的语言
    const runtimeDeps: string[] = [];
    
    if (scriptLanguage === 'python') {
      runtimeDeps.push(
        'https://cdn.jsdelivr.net/npm/brython@3.13.1/brython.min.js',
        'https://cdn.jsdelivr.net/npm/brython@3.13.1/brython_stdlib.js'
      );
    } else if (scriptLanguage === 'php') {
      runtimeDeps.push('https://cdn.jsdelivr.net/npm/uniter@latest/dist/uniter.min.js');
    } else if (scriptLanguage === 'go') {
      runtimeDeps.push('https://cdn.jsdelivr.net/npm/gopherjs@latest/dist/gopherjs.min.js');
    }

    return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>多语言代码预览</title>
    <style>
        /* 基础样式重置 */
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.6;
            color: #333;
            background: #fff;
        }
        
        /* 用户样式 */
        ${styleContent}
    </style>
    
    ${runtimeDeps.map(dep => `<script src="${dep}"></script>`).join('\n    ')}
</head>
<body>
    ${markupContent}
    
    <script>
        // 控制台重定向到父窗口
        const originalConsole = {
            log: console.log,
            warn: console.warn,
            error: console.error,
            info: console.info
        };
        
        function sendToParent(type, args) {
            try {
                window.parent.postMessage({
                    type: 'console',
                    level: type,
                    args: Array.from(args).map(arg => {
                        if (typeof arg === 'object') {
                            try {
                                return JSON.stringify(arg, null, 2);
                            } catch {
                                return String(arg);
                            }
                        }
                        return String(arg);
                    })
                }, '*');
            } catch (e) {
                // 忽略跨域错误
            }
        }
        
        // 重写控制台方法
        ['log', 'warn', 'error', 'info'].forEach(method => {
            console[method] = function(...args) {
                originalConsole[method].apply(console, args);
                sendToParent(method, args);
            };
        });
        
        // 全局错误捕获
        window.addEventListener('error', function(event) {
            sendToParent('error', [event.message + ' (Line: ' + event.lineno + ')']);
        });
        
        window.addEventListener('unhandledrejection', function(event) {
            sendToParent('error', ['Unhandled Promise Rejection: ' + event.reason]);
        });
        
        // 运行时初始化
        async function initializeRuntimes() {
            ${scriptLanguage === 'python' ? `
                if (window.brython) {
                    window.brython();
                    sendToParent('info', ['Brython Python 运行时已初始化']);
                }
            ` : ''}
            
            ${scriptLanguage === 'php' ? `
                if (window.phpUniter) {
                    sendToParent('info', ['PHP Uniter 运行时已初始化']);
                }
            ` : ''}
        }
        
        // 页面加载完成后执行
        window.addEventListener('load', async function() {
            sendToParent('info', ['预览加载完成']);
            await initializeRuntimes();
            
            // 执行用户脚本
            try {
                ${scriptContent}
            } catch (error) {
                sendToParent('error', [error.message]);
            }
        });
    </script>
</body>
</html>`;
  };

  /** 监听消息 */
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === 'console') {
        const { level, args } = event.data;
        addConsoleMessage({
          type: level,
          message: args.join(' ')
        });
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [addConsoleMessage]);

  /** 监听内容变化，自动执行 */
  useEffect(() => {
    const timer = setTimeout(() => {
      executeCode();
    }, 1000);

    return () => clearTimeout(timer);
  }, [contents, configs]);

  /** 监听手动运行触发器 */
  useEffect(() => {
    if (manualRunTrigger > 0) {
      console.log('[ExecutionEngine] 收到手动运行触发');
      executeCode();
    }
  }, [manualRunTrigger]);

  const hasContent = contents.markup.trim() || contents.style.trim() || contents.script.trim();

  return (
    <div className={`${className} bg-white relative`}>
      {isExecuting && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/90 z-10">
          <div className="text-center">
            <div className="animate-spin w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full mx-auto"></div>
            <p className="mt-2 text-gray-600 text-sm">代码执行中...</p>
          </div>
        </div>
      )}
      
      {!hasContent ? (
        <div className="flex items-center justify-center h-full text-gray-500">
          <div className="text-center">
            <p className="text-lg font-semibold">暂无预览内容</p>
            <p className="text-sm mt-1">请在编辑器中输入代码</p>
            <p className="text-xs mt-2 text-gray-400">
              支持: JavaScript, TypeScript, Python, Go, PHP, Java 等
            </p>
          </div>
        </div>
      ) : (
        <iframe
          ref={iframeRef}
          className="w-full h-full border-0"
          sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
          title="多语言代码预览"
        />
      )}
    </div>
  );
} 