'use client';

import React, { useRef, useEffect, useState } from 'react';
import { useEditorStore } from '@/stores/editor-store';
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
  const { contents } = useEditorStore();
  const { addConsoleMessage, manualRunTrigger } = usePlaygroundStore();

  /** 生成预览 HTML */
  const generatePreviewHtml = () => {
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
        ${contents.style}
    </style>
</head>
<body>
    ${contents.markup}
    
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
        
        // 用户脚本
        try {
            ${contents.script}
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
      const html = generatePreviewHtml();
      const iframe = iframeRef.current;
      
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

  /** 自动刷新预览 */
  useEffect(() => {
    const timer = setTimeout(() => {
      refreshPreview();
    }, 500);

    return () => clearTimeout(timer);
  }, [contents]);

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
