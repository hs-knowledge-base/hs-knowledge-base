'use client';

import React, { useRef, useEffect, useState } from 'react';
import {
  Card,
  CardBody,
  CardHeader,
  Button,
  Chip,
  Spinner
} from '@nextui-org/react';
import { usePlaygroundStore } from '@/stores/playground-store';
import { useEditorStore } from '@/stores/editor-store';
import { useCompilerStore } from '@/stores/compiler-store';
import { useCompile } from '@/lib/compiler/compiler-factory';
import { useCompilerRegistry } from '@/lib/compiler/compiler-registry';

interface CodeRunnerProps {
  /** 自定义样式类名 */
  className?: string;
  /** 是否自动运行 */
  autoRun?: boolean;
  /** 运行延迟（毫秒） */
  runDelay?: number;
}

/**
 * 代码运行器组件
 * 集成编译器，支持多语言代码编译和运行
 */
export function CodeRunner({
  className = '',
  autoRun = false,
  runDelay = 1000
}: CodeRunnerProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [runError, setRunError] = useState<string | null>(null);

  const { runStatus, setRunStatus, addConsoleMessage } = usePlaygroundStore();
  const { contents, configs } = useEditorStore();
  const { results, isCompiling } = useCompilerStore();
  const { compile } = useCompile();
  const compilerRegistry = useCompilerRegistry();

  /** 编译所有代码 */
  const compileAllCode = async () => {
    try {
      setRunStatus('compiling');
      addConsoleMessage({
        type: 'info',
        message: '🔄 开始编译代码...'
      });

      const compilePromises = [
        compile(contents.markup, configs.markup.language, 'markup'),
        compile(contents.style, configs.style.language, 'style'),
        compile(contents.script, configs.script.language, 'script')
      ];

      const compileResults = await Promise.all(compilePromises);
      
      // 检查编译错误
      const errors = compileResults.filter(result => result.error);
      if (errors.length > 0) {
        const errorMessages = errors.map(result => result.error).join('\n');
        throw new Error(`编译失败:\n${errorMessages}`);
      }

      addConsoleMessage({
        type: 'log',
        message: '✅ 代码编译成功'
      });

      return compileResults;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '编译失败';
      addConsoleMessage({
        type: 'error',
        message: `❌ ${errorMessage}`
      });
      throw error;
    }
  };

  /** 生成 HTML 文档 */
  const generateHtmlDocument = () => {
    const markupResult = results.markup;
    const styleResult = results.style;
    const scriptResult = results.script;

    return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Code Playground</title>
    <style>
        /* 重置样式 */
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.6;
            color: #333;
        }
        
        /* 用户样式 */
        ${styleResult.code}
    </style>
</head>
<body>
    ${markupResult.code}
    
    <script>
        // 控制台重定向
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
        
        console.log = function(...args) {
            originalConsole.log.apply(console, args);
            sendToParent('log', args);
        };
        
        console.warn = function(...args) {
            originalConsole.warn.apply(console, args);
            sendToParent('warn', args);
        };
        
        console.error = function(...args) {
            originalConsole.error.apply(console, args);
            sendToParent('error', args);
        };
        
        console.info = function(...args) {
            originalConsole.info.apply(console, args);
            sendToParent('info', args);
        };
        
        // 错误捕获
        window.addEventListener('error', function(event) {
            sendToParent('error', [event.message + ' (Line: ' + event.lineno + ')']);
        });
        
        window.addEventListener('unhandledrejection', function(event) {
            sendToParent('error', ['Unhandled Promise Rejection: ' + event.reason]);
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

  /** 运行代码 */
  const runCode = async () => {
    try {
      setIsRunning(true);
      setRunError(null);
      setRunStatus('compiling');

      // 编译代码
      await compileAllCode();

      // 生成 HTML 文档
      const htmlDocument = generateHtmlDocument();

      // 在 iframe 中运行
      if (iframeRef.current) {
        setRunStatus('running');
        addConsoleMessage({
          type: 'info',
          message: '🚀 开始运行代码...'
        });

        const iframe = iframeRef.current;
        iframe.srcdoc = htmlDocument;

        // 等待 iframe 加载完成
        await new Promise<void>((resolve) => {
          const handleLoad = () => {
            iframe.removeEventListener('load', handleLoad);
            resolve();
          };
          iframe.addEventListener('load', handleLoad);
        });

        setRunStatus('success');
        addConsoleMessage({
          type: 'log',
          message: '✅ 代码运行成功'
        });
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '运行失败';
      setRunError(errorMessage);
      setRunStatus('error');
      addConsoleMessage({
        type: 'error',
        message: `❌ ${errorMessage}`
      });
    } finally {
      setIsRunning(false);
    }
  };

  /** 监听 iframe 消息 */
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

  /** 自动运行逻辑 */
  useEffect(() => {
    if (!autoRun) return;

    const timer = setTimeout(() => {
      if (!isCompiling && !isRunning) {
        runCode();
      }
    }, runDelay);

    return () => clearTimeout(timer);
  }, [contents, autoRun, runDelay, isCompiling, isRunning]);

  /** 获取运行状态信息 */
  const getStatusInfo = () => {
    switch (runStatus) {
      case 'compiling':
        return { color: 'warning' as const, text: '编译中...' };
      case 'running':
        return { color: 'primary' as const, text: '运行中...' };
      case 'success':
        return { color: 'success' as const, text: '运行成功' };
      case 'error':
        return { color: 'danger' as const, text: '运行失败' };
      default:
        return { color: 'default' as const, text: '就绪' };
    }
  };

  const statusInfo = getStatusInfo();
  const hasContent = contents.markup.trim() || contents.style.trim() || contents.script.trim();

  return (
    <Card className={className}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-3">
            <h3 className="text-lg font-semibold">代码运行器</h3>
            <Chip
              size="sm"
              color={statusInfo.color}
              variant="flat"
              startContent={isRunning ? <Spinner size="sm" /> : null}
            >
              {statusInfo.text}
            </Chip>
          </div>
          <Button
            color="primary"
            onPress={runCode}
            isLoading={isRunning}
            isDisabled={!hasContent || isCompiling}
          >
            {isRunning ? '运行中...' : '运行代码'}
          </Button>
        </div>
      </CardHeader>
      <CardBody className="p-0">
        {runError && (
          <div className="p-4 bg-danger-50 border-b border-danger-200">
            <div className="text-danger text-sm">
              <strong>运行错误:</strong> {runError}
            </div>
          </div>
        )}
        
        <div className="relative h-[400px] bg-white">
          {!hasContent ? (
            <div className="flex items-center justify-center h-full text-default-500">
              <div className="text-center">
                <p className="text-lg font-semibold">没有代码内容</p>
                <p className="text-sm mt-1">请在编辑器中输入代码后运行</p>
              </div>
            </div>
          ) : (
            <iframe
              ref={iframeRef}
              className="w-full h-full border-none"
              sandbox="allow-scripts allow-same-origin"
              title="代码运行结果"
            />
          )}
          
          {isRunning && (
            <div className="absolute inset-0 bg-background/80 flex items-center justify-center">
              <div className="text-center">
                <Spinner size="lg" />
                <p className="mt-2 text-default-600">
                  {runStatus === 'compiling' ? '编译代码中...' : '运行代码中...'}
                </p>
              </div>
            </div>
          )}
        </div>
      </CardBody>
    </Card>
  );
}
