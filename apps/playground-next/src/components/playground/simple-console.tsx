'use client';

import React from 'react';
import { usePlaygroundStore } from '@/stores/playground-store';

interface SimpleConsoleProps {
  className?: string;
}

/**
 * 简单控制台组件
 * 显示代码运行的输出信息
 */
export function SimpleConsole({ className = '' }: SimpleConsoleProps) {
  const { consoleMessages } = usePlaygroundStore();

  /** 获取消息样式 */
  const getMessageStyle = (type: string) => {
    const styles = {
      log: 'text-gray-300',
      warn: 'text-yellow-400',
      error: 'text-red-400',
      info: 'text-blue-400'
    };
    return styles[type as keyof typeof styles] || 'text-gray-300';
  };

  /** 获取消息图标 */
  const getMessageIcon = (type: string) => {
    const icons = {
      log: '📝',
      warn: '⚠️',
      error: '❌',
      info: 'ℹ️'
    };
    return icons[type as keyof typeof icons] || '📝';
  };

  /** 格式化时间戳 */
  const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString();
  };

  return (
    <div className={`${className} bg-gray-900 p-4 font-mono text-sm overflow-auto`}>
      {consoleMessages.length === 0 ? (
        <div className="text-gray-500">
          <div className="text-green-400">// 控制台输出将在这里显示</div>
          <div className="text-blue-400 mt-1">console.log('🔥 Hello from 火山知识库!');</div>
          <div className="text-gray-500 mt-2">点击运行按钮执行代码...</div>
        </div>
      ) : (
        <div className="space-y-1">
          {consoleMessages.map((message) => (
            <div
              key={message.id}
              className="flex items-start gap-2 py-1"
            >
              <span className="flex-shrink-0 text-xs">
                {getMessageIcon(message.type)}
              </span>
              <div className="flex-1 min-w-0">
                <div className={`break-words ${getMessageStyle(message.type)}`}>
                  {message.message}
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  {formatTimestamp(message.timestamp)}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
