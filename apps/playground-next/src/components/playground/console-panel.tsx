'use client';

import React, { useRef, useEffect, useState } from 'react';
import {
  Card,
  CardBody,
  CardHeader,
  Button,
  Input,
  Chip,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Code
} from '@nextui-org/react';
import { usePlaygroundStore } from '@/stores/playground-store';
import type { ConsoleMessage } from '@/types';

interface ConsolePanelProps {
  /** 自定义样式类名 */
  className?: string;
  /** 是否显示输入框 */
  showInput?: boolean;
  /** 最大消息数量 */
  maxMessages?: number;
}

/**
 * 控制台面板组件
 * 显示代码运行的输出、错误和日志信息
 */
export function ConsolePanel({
  className = '',
  showInput = true,
  maxMessages = 1000
}: ConsolePanelProps) {
  const { consoleMessages, addConsoleMessage, clearConsole } = usePlaygroundStore();
  const [filter, setFilter] = useState<'all' | 'log' | 'warn' | 'error' | 'info'>('all');
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  /** 滚动到底部 */
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  /** 自动滚动到最新消息 */
  useEffect(() => {
    scrollToBottom();
  }, [consoleMessages]);

  /** 过滤消息 */
  const filteredMessages = consoleMessages.filter(message => {
    if (filter === 'all') return true;
    return message.type === filter;
  });

  /** 获取消息类型统计 */
  const getMessageStats = () => {
    const stats = { log: 0, warn: 0, error: 0, info: 0 };
    consoleMessages.forEach(message => {
      stats[message.type]++;
    });
    return stats;
  };

  /** 处理输入提交 */
  const handleInputSubmit = () => {
    if (!inputValue.trim()) return;

    // 添加用户输入到控制台
    addConsoleMessage({
      type: 'info',
      message: `> ${inputValue}`
    });

    try {
      // 尝试执行 JavaScript 代码
      const result = eval(inputValue);
      addConsoleMessage({
        type: 'log',
        message: result !== undefined ? String(result) : 'undefined'
      });
    } catch (error) {
      addConsoleMessage({
        type: 'error',
        message: error instanceof Error ? error.message : String(error)
      });
    }

    setInputValue('');
  };

  /** 处理键盘事件 */
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleInputSubmit();
    }
  };

  /** 获取消息样式 */
  const getMessageStyle = (type: ConsoleMessage['type']) => {
    const styles = {
      log: 'text-default-700',
      warn: 'text-warning-600',
      error: 'text-danger-600',
      info: 'text-primary-600'
    };
    return styles[type];
  };

  /** 获取消息图标 */
  const getMessageIcon = (type: ConsoleMessage['type']) => {
    const icons = {
      log: '📝',
      warn: '⚠️',
      error: '❌',
      info: 'ℹ️'
    };
    return icons[type];
  };

  /** 格式化时间戳 */
  const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString();
  };

  const stats = getMessageStats();

  return (
    <Card className={className}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-3">
            <h3 className="text-lg font-semibold">控制台</h3>
            <div className="flex items-center gap-2">
              <Chip size="sm" variant="flat" color="default">
                {filteredMessages.length} 条消息
              </Chip>
              {stats.error > 0 && (
                <Chip size="sm" variant="flat" color="danger">
                  {stats.error} 错误
                </Chip>
              )}
              {stats.warn > 0 && (
                <Chip size="sm" variant="flat" color="warning">
                  {stats.warn} 警告
                </Chip>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {/* 过滤器 */}
            <Dropdown>
              <DropdownTrigger>
                <Button size="sm" variant="flat">
                  过滤: {filter === 'all' ? '全部' : filter}
                </Button>
              </DropdownTrigger>
              <DropdownMenu
                selectedKeys={[filter]}
                onSelectionChange={(keys) => setFilter(Array.from(keys)[0] as any)}
              >
                <DropdownItem key="all">全部</DropdownItem>
                <DropdownItem key="log">日志</DropdownItem>
                <DropdownItem key="info">信息</DropdownItem>
                <DropdownItem key="warn">警告</DropdownItem>
                <DropdownItem key="error">错误</DropdownItem>
              </DropdownMenu>
            </Dropdown>

            {/* 清空按钮 */}
            <Button
              size="sm"
              variant="light"
              color="warning"
              onPress={clearConsole}
              isDisabled={consoleMessages.length === 0}
            >
              清空
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardBody className="p-0 flex flex-col">
        {/* 消息列表 */}
        <div 
          ref={containerRef}
          className="flex-1 overflow-auto p-3 space-y-1 bg-content1 font-mono text-sm"
          style={{ maxHeight: '400px' }}
        >
          {filteredMessages.length === 0 ? (
            <div className="text-center text-default-400 py-8">
              <p>暂无{filter === 'all' ? '' : filter}消息</p>
              <p className="text-xs mt-1">运行代码后将在这里显示输出</p>
            </div>
          ) : (
            filteredMessages.map((message, index) => (
              <div
                key={`${message.timestamp}-${index}`}
                className="flex items-start gap-2 p-2 rounded hover:bg-content2 transition-colors"
              >
                <span className="flex-shrink-0 text-xs">
                  {getMessageIcon(message.type)}
                </span>
                <div className="flex-1 min-w-0">
                  <div className={`break-words ${getMessageStyle(message.type)}`}>
                    {message.message.includes('\n') ? (
                      <Code className="whitespace-pre-wrap text-xs">
                        {message.message}
                      </Code>
                    ) : (
                      message.message
                    )}
                  </div>
                  <div className="text-xs text-default-400 mt-1">
                    {formatTimestamp(message.timestamp)}
                  </div>
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* 输入框 */}
        {showInput && (
          <div className="border-t border-divider p-3">
            <Input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="输入 JavaScript 代码并按 Enter 执行..."
              variant="bordered"
              size="sm"
              endContent={
                <Button
                  size="sm"
                  variant="light"
                  onPress={handleInputSubmit}
                  isDisabled={!inputValue.trim()}
                >
                  执行
                </Button>
              }
            />
            <p className="text-xs text-default-400 mt-1">
              提示：支持 JavaScript 表达式，按 Enter 执行
            </p>
          </div>
        )}
      </CardBody>
    </Card>
  );
}
