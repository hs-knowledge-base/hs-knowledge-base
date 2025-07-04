'use client';

import React, { useRef, useEffect, useState } from 'react';
import { useEditorStore } from '@/stores/editor-store';
import { useCompilerStore } from '@/stores/compiler-store';
import { usePlaygroundStore } from '@/stores/playground-store';

interface SimplePreviewProps {
  className?: string;
}

/**
 * 简单预览组件
 * 显示 HTML、CSS、JS 代码的运行结果
 */
export function SimplePreview({ className = '' }: SimplePreviewProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { contents, configs } = useEditorStore();
  const { results } = useCompilerStore();
  const { addConsoleMessage, manualRunTrigger } = usePlaygroundStore();

  /** 获取编译后的内容 */
  const getCompiledContent = (type: 'markup' | 'style' | 'script') => {
    // 如果编译结果存在且没有错误，使用编译结果
    if (results[type] && results[type].code && !results[type].error) {
      console.log(`[SimplePreview] 使用 ${type} 编译结果`);
      return results[type].code;
    }
    
    // 否则使用原始内容（对于不需要编译的语言）
    const language = configs[type].language;
    const needsCompilation = ['typescript', 'markdown', 'scss', 'less'].includes(language);
    
    if (needsCompilation && (!results[type] || results[type].error)) {
      console.warn(`[SimplePreview] ${type} 需要编译但编译失败，使用空内容`);
      return '';
    }
    
    console.log(`[SimplePreview] 使用 ${type} 原始内容`);
    return contents[type];
  };

  /** 生成预览 HTML */
  const generatePreviewHtml = () => {
    const markupContent = getCompiledContent('markup');
    const styleContent = getCompiledContent('style');
    const scriptContent = getCompiledContent('script');

    return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Preview</title>
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
        
        // 通知父窗口预览已加载
        window.addEventListener('load', function() {
            sendToParent('info', ['预览加载完成']);
        });
        
        // 用户脚本（编译后的 JavaScript）
        try {
            ${scriptContent}
        } catch (error) {
            sendToParent('error', [error.message]);
        }
    </script>
</body>
</html>`;
  };

  /** 刷新预览 */
  const refreshPreview = async () => {
    if (!iframeRef.current) return;

    try {
      setIsLoading(true);
      
      // 检查是否有编译错误
      const errors = Object.entries(results).filter(([_, result]) => result.error);
      if (errors.length > 0) {
        errors.forEach(([type, result]) => {
          addConsoleMessage({
            type: 'error',
            message: `${type} 编译错误: ${result.error}`
          });
        });
      }
      
      const html = generatePreviewHtml();
      const iframe = iframeRef.current;
      
      console.log('[SimplePreview] 预览 HTML 生成完成');
      
      // 设置 iframe 内容
      iframe.srcdoc = html;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '预览加载失败';
      addConsoleMessage({
        type: 'error',
        message: `预览错误: ${errorMessage}`
      });
    } finally {
      setIsLoading(false);
    }
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

  /** 监听编译结果变化，自动刷新预览 */
  useEffect(() => {
    const timer = setTimeout(() => {
      refreshPreview();
    }, 300);

    return () => clearTimeout(timer);
  }, [results, contents]);

  /** 监听手动运行触发器 */
  useEffect(() => {
    if (manualRunTrigger > 0) {
      console.log('[SimplePreview] 收到手动运行触发，刷新预览');
      refreshPreview();
    }
  }, [manualRunTrigger]);

  const hasContent = contents.markup.trim() || contents.style.trim() || contents.script.trim();

  return (
    <div className={`${className} bg-white relative`}>
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/90 z-10">
          <div className="text-center">
            <div className="animate-spin w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full mx-auto"></div>
            <p className="mt-2 text-gray-600 text-sm">预览加载中...</p>
          </div>
        </div>
      )}
      
      {!hasContent ? (
        <div className="flex items-center justify-center h-full text-gray-500">
          <div className="text-center">
            <p className="text-lg font-semibold">暂无预览内容</p>
            <p className="text-sm mt-1">请在编辑器中输入代码</p>
          </div>
        </div>
      ) : (
        <iframe
          ref={iframeRef}
          className="w-full h-full border-0"
          sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
          title="代码预览"
        />
      )}
    </div>
  );
}
