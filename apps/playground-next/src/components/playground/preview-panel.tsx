'use client';

import React, { useRef, useEffect, useState } from 'react';
import {
  Card,
  CardBody,
  CardHeader,
  Button,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Chip,
  Spinner
} from '@nextui-org/react';
import { usePlaygroundStore } from '@/stores/playground-store';
import { useEditorStore } from '@/stores/editor-store';
import { useCompilerStore } from '@/stores/compiler-store';

interface PreviewPanelProps {
  /** 自定义样式类名 */
  className?: string;
  /** 是否自动刷新 */
  autoRefresh?: boolean;
  /** 刷新延迟（毫秒） */
  refreshDelay?: number;
}

/**
 * 预览面板组件
 * 显示代码运行的实时预览结果
 */
export function PreviewPanel({
  className = '',
  autoRefresh = true,
  refreshDelay = 1000
}: PreviewPanelProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [previewError, setPreviewError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [scale, setScale] = useState(100);

  const { runStatus, addConsoleMessage } = usePlaygroundStore();
  const { contents } = useEditorStore();
  const { results } = useCompilerStore();

  /** 生成预览 HTML */
  const generatePreviewHtml = () => {
    const markupResult = results.markup;
    const styleResult = results.style;
    const scriptResult = results.script;

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
        ${styleResult.code}
    </style>
</head>
<body>
    ${markupResult.code}
    
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
            ${scriptResult.code}
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
      setPreviewError(null);

      const html = generatePreviewHtml();
      const iframe = iframeRef.current;
      
      // 设置 iframe 内容
      iframe.srcdoc = html;

      // 等待加载完成
      await new Promise<void>((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error('预览加载超时'));
        }, 5000);

        const handleLoad = () => {
          clearTimeout(timeout);
          iframe.removeEventListener('load', handleLoad);
          resolve();
        };

        iframe.addEventListener('load', handleLoad);
      });

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '预览加载失败';
      setPreviewError(errorMessage);
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

  /** 自动刷新逻辑 */
  useEffect(() => {
    if (!autoRefresh) return;

    const timer = setTimeout(() => {
      refreshPreview();
    }, refreshDelay);

    return () => clearTimeout(timer);
  }, [contents, results, autoRefresh, refreshDelay]);

  /** 获取视图模式样式 */
  const getViewModeStyle = () => {
    const styles = {
      desktop: { width: '100%', height: '100%' },
      tablet: { width: '768px', height: '1024px', maxWidth: '100%', maxHeight: '100%' },
      mobile: { width: '375px', height: '667px', maxWidth: '100%', maxHeight: '100%' }
    };
    return styles[viewMode];
  };

  /** 获取缩放样式 */
  const getScaleStyle = () => ({
    transform: `scale(${scale / 100})`,
    transformOrigin: 'top left'
  });

  const hasContent = contents.markup.trim() || contents.style.trim() || contents.script.trim();

  return (
    <Card className={className}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-3">
            <h3 className="text-lg font-semibold">预览</h3>
            {isLoading && (
              <Chip size="sm" variant="flat" color="primary" startContent={<Spinner size="sm" />}>
                加载中
              </Chip>
            )}
            {previewError && (
              <Chip size="sm" variant="flat" color="danger">
                错误
              </Chip>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            {/* 视图模式选择 */}
            <Dropdown>
              <DropdownTrigger>
                <Button size="sm" variant="flat">
                  {viewMode === 'desktop' ? '🖥️' : viewMode === 'tablet' ? '📱' : '📱'}
                  {viewMode}
                </Button>
              </DropdownTrigger>
              <DropdownMenu
                selectedKeys={[viewMode]}
                onSelectionChange={(keys) => setViewMode(Array.from(keys)[0] as any)}
              >
                <DropdownItem key="desktop">🖥️ 桌面</DropdownItem>
                <DropdownItem key="tablet">📱 平板</DropdownItem>
                <DropdownItem key="mobile">📱 手机</DropdownItem>
              </DropdownMenu>
            </Dropdown>

            {/* 缩放控制 */}
            <Dropdown>
              <DropdownTrigger>
                <Button size="sm" variant="flat">
                  {scale}%
                </Button>
              </DropdownTrigger>
              <DropdownMenu
                selectedKeys={[scale.toString()]}
                onSelectionChange={(keys) => setScale(Number(Array.from(keys)[0]))}
              >
                <DropdownItem key="50">50%</DropdownItem>
                <DropdownItem key="75">75%</DropdownItem>
                <DropdownItem key="100">100%</DropdownItem>
                <DropdownItem key="125">125%</DropdownItem>
                <DropdownItem key="150">150%</DropdownItem>
              </DropdownMenu>
            </Dropdown>

            {/* 刷新按钮 */}
            <Button
              size="sm"
              variant="light"
              onPress={refreshPreview}
              isLoading={isLoading}
              isDisabled={!hasContent}
            >
              🔄
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardBody className="p-0">
        {previewError ? (
          <div className="flex items-center justify-center h-64 text-danger">
            <div className="text-center">
              <p className="font-semibold">预览加载失败</p>
              <p className="text-sm mt-1">{previewError}</p>
              <Button
                size="sm"
                color="danger"
                variant="light"
                className="mt-2"
                onPress={refreshPreview}
              >
                重试
              </Button>
            </div>
          </div>
        ) : !hasContent ? (
          <div className="flex items-center justify-center h-64 text-default-500">
            <div className="text-center">
              <p className="text-lg font-semibold">暂无预览内容</p>
              <p className="text-sm mt-1">请在编辑器中输入 HTML、CSS 或 JavaScript 代码</p>
            </div>
          </div>
        ) : (
          <div className="relative h-full bg-white overflow-auto">
            {isLoading && (
              <div className="absolute inset-0 bg-background/80 flex items-center justify-center z-10">
                <div className="text-center">
                  <Spinner size="lg" />
                  <p className="mt-2 text-default-600">预览加载中...</p>
                </div>
              </div>
            )}
            
            <div 
              className="w-full h-full flex justify-center items-start p-4"
              style={viewMode !== 'desktop' ? { overflow: 'auto' } : {}}
            >
              <iframe
                ref={iframeRef}
                className="border border-divider rounded-lg bg-white"
                style={{
                  ...getViewModeStyle(),
                  ...getScaleStyle()
                }}
                sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
                title="代码预览"
              />
            </div>
          </div>
        )}
      </CardBody>
    </Card>
  );
}
