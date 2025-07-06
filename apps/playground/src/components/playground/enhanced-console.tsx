'use client';

import React, { useState, useRef, useEffect } from 'react';
import { usePlaygroundStore } from '@/stores/playground-store';
import { ConsoleMessage } from './console-message';
import { ConsoleToolbar } from './console-toolbar';

interface EnhancedConsoleProps {
  className?: string;
}

type MessageType = 'log' | 'warn' | 'error' | 'info';

interface MessageFilter {
  log: boolean;
  warn: boolean;
  error: boolean;
  info: boolean;
}

/**
 * 控制台组件
 */
export function EnhancedConsole({ className = '' }: EnhancedConsoleProps) {
  const { consoleMessages, clearConsole, triggerManualRun } = usePlaygroundStore();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [autoScroll, setAutoScroll] = useState(true);
  const [filters, setFilters] = useState<MessageFilter>({
    log: true,
    warn: true,
    error: true,
    info: true
  });
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const consoleRef = useRef<HTMLDivElement>(null);

  /** 自动滚动到底部 */
  useEffect(() => {
    if (autoScroll && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [consoleMessages, autoScroll]);

  /** 转换消息格式 */
  const convertMessages = () => {
    return consoleMessages.map(msg => ({
      id: msg.id,
      type: msg.type as MessageType,
      args: msg.args || [msg.message],
      timestamp: msg.timestamp
    }));
  };

  /** 过滤消息 */
  const filteredMessages = convertMessages().filter(message => 
    filters[message.type]
  );

  /** 获取消息统计 */
  const getMessageStats = () => {
    const stats = { total: 0, log: 0, warn: 0, error: 0, info: 0 };
    consoleMessages.forEach(msg => {
      stats.total++;
      if (msg.type in stats) {
        stats[msg.type as MessageType]++;
      }
    });
    return stats;
  };

  /** 复制所有消息 */
  const copyAllMessages = () => {
    const text = filteredMessages
      .map(msg => `${msg.type.toUpperCase()}: ${msg.args.join(' ')}`)
      .join('\n');
    
    navigator.clipboard.writeText(text).then(() => {
      console.log('已复制到剪贴板');
    });
  };

  /** 导出日志 */
  const exportLogs = () => {
    const text = filteredMessages
      .map(msg => `${msg.type.toUpperCase()}: ${msg.args.join(' ')}`)
      .join('\n');
    
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `console-logs-${new Date().toISOString().slice(0, 19)}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const stats = getMessageStats();

  return (
    <div className={`${className} bg-gray-900 border border-gray-700 rounded-lg overflow-hidden flex flex-col`}>
      {/* 控制台工具栏 */}
      <ConsoleToolbar
        isCollapsed={isCollapsed}
        autoScroll={autoScroll}
        filters={filters}
        messageStats={stats}
        onCollapseChange={setIsCollapsed}
        onAutoScrollChange={setAutoScroll}
        onFiltersChange={setFilters}
        onClear={clearConsole}
        onManualRun={triggerManualRun}
        onCopyAll={copyAllMessages}
        onExportLogs={exportLogs}
      />

      {/* 控制台内容 */}
      {!isCollapsed && (
        <div 
          ref={consoleRef}
          className="flex-1 min-h-0 max-h-96 overflow-auto font-mono text-sm"
        >
          <div className="p-4">
            {filteredMessages.length === 0 ? (
              <div className="text-gray-500 text-center py-8">
                <div className="text-2xl mb-2">📟</div>
                <div>控制台为空</div>
                <div className="text-xs mt-1 text-gray-600">
                  运行代码查看输出结果
                </div>
              </div>
            ) : (
              <div className="space-y-1">
                {filteredMessages.map((message) => (
                  <ConsoleMessage
                    key={message.id}
                    id={message.id}
                    type={message.type}
                    args={message.args}
                    timestamp={message.timestamp}
                  />
                ))}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>
        </div>
      )}

      {/* 自动滚动指示器 */}
      {autoScroll && !isCollapsed && (
        <div className="absolute bottom-2 right-2 text-xs text-gray-500 bg-gray-800 px-2 py-1 rounded">
          自动滚动
        </div>
      )}
    </div>
  );
}
