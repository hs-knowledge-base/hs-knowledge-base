'use client';

import React, { useState, useRef, useEffect } from 'react';
import { usePlaygroundStore } from '@/stores/playground-store';
import { Button, Chip, Dropdown, DropdownTrigger, DropdownMenu, DropdownItem } from '@nextui-org/react';
import { 
  FiPlay, FiTrash2, FiFilter, FiChevronDown, FiChevronRight, 
  FiInfo, FiAlertTriangle, FiAlertCircle, FiTerminal,
  FiCopy, FiDownload
} from 'react-icons/fi';

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
 * 增强版控制台组件 - 类似 IntelliJ IDEA 控制台体验
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

  // 自动滚动到底部
  useEffect(() => {
    if (autoScroll && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [consoleMessages, autoScroll]);

  // 监听滚动，判断是否需要关闭自动滚动
  useEffect(() => {
    const handleScroll = () => {
      if (!consoleRef.current) return;
      
      const { scrollTop, scrollHeight, clientHeight } = consoleRef.current;
      const isAtBottom = scrollHeight - scrollTop <= clientHeight + 50;
      
      if (!isAtBottom && autoScroll) {
        setAutoScroll(false);
      } else if (isAtBottom && !autoScroll) {
        setAutoScroll(true);
      }
    };

    const consoleElement = consoleRef.current;
    if (consoleElement) {
      consoleElement.addEventListener('scroll', handleScroll);
      return () => consoleElement.removeEventListener('scroll', handleScroll);
    }
  }, [autoScroll]);

  /** 获取消息图标 */
  const getMessageIcon = (type: MessageType) => {
    const iconProps = { size: 14, className: "flex-shrink-0 mt-0.5" };
    
    switch (type) {
      case 'info':
        return <FiInfo {...iconProps} className={`${iconProps.className} text-blue-400`} />;
      case 'warn':
        return <FiAlertTriangle {...iconProps} className={`${iconProps.className} text-yellow-400`} />;
      case 'error':
        return <FiAlertCircle {...iconProps} className={`${iconProps.className} text-red-400`} />;
      default:
        return <FiTerminal {...iconProps} className={`${iconProps.className} text-gray-400`} />;
    }
  };

  /** 获取消息样式 */
  const getMessageStyle = (type: MessageType) => {
    const styles = {
      log: 'text-gray-300',
      warn: 'text-yellow-300',
      error: 'text-red-300',
      info: 'text-blue-300'
    };
    return styles[type] || 'text-gray-300';
  };

  /** 格式化时间戳 */
  const formatTimestamp = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('zh-CN', { 
      hour12: false, 
      hour: '2-digit', 
      minute: '2-digit', 
      second: '2-digit',
      fractionalSecondDigits: 3
    });
  };

  /** 过滤消息 */
  const filteredMessages = consoleMessages.filter(message => 
    filters[message.type as MessageType]
  );

  /** 获取消息统计 */
  const getMessageStats = () => {
    const stats = { log: 0, warn: 0, error: 0, info: 0 };
    consoleMessages.forEach(msg => {
      if (msg.type in stats) {
        stats[msg.type as MessageType]++;
      }
    });
    return stats;
  };

  /** 切换过滤器 */
  const toggleFilter = (type: MessageType) => {
    setFilters(prev => ({
      ...prev,
      [type]: !prev[type]
    }));
  };

  /** 复制所有消息 */
  const copyAllMessages = () => {
    const text = filteredMessages
      .map(msg => `[${formatTimestamp(msg.timestamp)}] ${msg.type.toUpperCase()}: ${msg.message}`)
      .join('\n');
    
    navigator.clipboard.writeText(text).then(() => {
      // 可以添加一个toast通知
      console.log('已复制到剪贴板');
    });
  };

  /** 导出日志 */
  const exportLogs = () => {
    const text = filteredMessages
      .map(msg => `[${formatTimestamp(msg.timestamp)}] ${msg.type.toUpperCase()}: ${msg.message}`)
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
      {/* 控制台头部 */}
      <div className="bg-gray-800 border-b border-gray-700 px-4 py-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="min-w-0 px-2"
          >
            {isCollapsed ? <FiChevronRight size={16} /> : <FiChevronDown size={16} />}
          </Button>
          
          <div className="flex items-center text-sm text-gray-300">
            <span className="font-medium">控制台</span>
          </div>

          {/* 消息统计 */}
          <div className="flex items-center gap-1 text-xs">
            {stats.info > 0 && (
              <Chip size="sm" variant="flat" color="primary" className="text-xs px-1">
                {stats.info}
              </Chip>
            )}
            {stats.warn > 0 && (
              <Chip size="sm" variant="flat" color="warning" className="text-xs px-1">
                {stats.warn}
              </Chip>
            )}
            {stats.error > 0 && (
              <Chip size="sm" variant="flat" color="danger" className="text-xs px-1">
                {stats.error}
              </Chip>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1">
          {/* 过滤器 */}
          <Dropdown>
            <DropdownTrigger>
              <Button
                size="sm"
                variant="ghost"
                className="min-w-0 px-2"
                title="过滤消息"
              >
                <FiFilter size={14} />
              </Button>
            </DropdownTrigger>
            <DropdownMenu aria-label="消息过滤器">
              <DropdownItem
                key="info"
                onClick={() => toggleFilter('info')}
                className={filters.info ? 'text-blue-400' : 'text-gray-500'}
              >
                <div className="flex items-center gap-2">
                  <FiInfo size={14} />
                  <span>信息 ({stats.info})</span>
                  {filters.info && <span>✓</span>}
                </div>
              </DropdownItem>
              <DropdownItem
                key="warn"
                onClick={() => toggleFilter('warn')}
                className={filters.warn ? 'text-yellow-400' : 'text-gray-500'}
              >
                <div className="flex items-center gap-2">
                  <FiAlertTriangle size={14} />
                  <span>警告 ({stats.warn})</span>
                  {filters.warn && <span>✓</span>}
                </div>
              </DropdownItem>
              <DropdownItem
                key="error"
                onClick={() => toggleFilter('error')}
                className={filters.error ? 'text-red-400' : 'text-gray-500'}
              >
                <div className="flex items-center gap-2">
                  <FiAlertCircle size={14} />
                  <span>错误 ({stats.error})</span>
                  {filters.error && <span>✓</span>}
                </div>
              </DropdownItem>
              <DropdownItem
                key="log"
                onClick={() => toggleFilter('log')}
                className={filters.log ? 'text-gray-300' : 'text-gray-500'}
              >
                <div className="flex items-center gap-2">
                  <FiTerminal size={14} />
                  <span>日志 ({stats.log})</span>
                  {filters.log && <span>✓</span>}
                </div>
              </DropdownItem>
            </DropdownMenu>
          </Dropdown>

          {/* 复制按钮 */}
          <Button
            size="sm"
            variant="ghost"
            onClick={copyAllMessages}
            className="min-w-0 px-2"
            title="复制所有消息"
          >
            <FiCopy size={14} />
          </Button>

          {/* 导出按钮 */}
          <Button
            size="sm"
            variant="ghost"
            onClick={exportLogs}
            className="min-w-0 px-2"
            title="导出日志"
          >
            <FiDownload size={14} />
          </Button>

          {/* 清空按钮 */}
          <Button
            size="sm"
            variant="ghost"
            onClick={clearConsole}
            className="min-w-0 px-2"
            title="清空控制台"
          >
            <FiTrash2 size={14} />
          </Button>

          {/* 运行按钮 */}
          <Button
            size="sm"
            color="primary"
            onClick={triggerManualRun}
            className="min-w-0 px-3"
            title="重新运行"
          >
            <FiPlay size={14} />
          </Button>
        </div>
      </div>

      {/* 控制台内容 */}
      {!isCollapsed && (
        <div 
          ref={consoleRef}
          className="flex-1 min-h-0 max-h-96 overflow-auto font-mono text-sm"
        >
          <div className="p-4">
            {filteredMessages.length === 0 ? (
              <div className="text-gray-500 text-center py-8">
                <FiTerminal size={24} className="mx-auto mb-2 opacity-50" />
                <div>控制台为空</div>
                <div className="text-xs mt-1 text-gray-600">
                  运行代码查看输出结果
                </div>
              </div>
            ) : (
              <div className="space-y-1">
                {filteredMessages.map((message) => (
                  <div
                    key={message.id}
                    className="flex items-start gap-2 py-1 px-2 rounded hover:bg-gray-800/50 group"
                  >
                    {/* 图标 */}
                    <div className="flex-shrink-0">
                      {getMessageIcon(message.type as MessageType)}
                    </div>
                    
                    {/* 时间戳 */}
                    <div className="flex-shrink-0 text-xs text-gray-500 min-w-[80px] font-mono">
                      {formatTimestamp(message.timestamp)}
                    </div>
                    
                    {/* 消息内容 */}
                    <div className="flex-1 min-w-0">
                      <div className={`break-words whitespace-pre-wrap ${getMessageStyle(message.type as MessageType)}`}>
                        {message.message}
                      </div>
                    </div>

                    {/* 复制单条消息 */}
                    <Button
                      size="sm"
                      variant="ghost"
                      className="opacity-0 group-hover:opacity-100 transition-opacity min-w-0 px-1"
                      onClick={() => navigator.clipboard.writeText(message.message)}
                      title="复制消息"
                    >
                      <FiCopy size={12} />
                    </Button>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>
        </div>
      )}

      {/* 自动滚动指示器 */}
      {!autoScroll && !isCollapsed && (
        <div className="absolute bottom-2 right-2">
          <Button
            size="sm"
            color="primary"
            variant="flat"
            onClick={() => setAutoScroll(true)}
            className="text-xs"
          >
            滚动到底部
          </Button>
        </div>
      )}
    </div>
  );
} 