'use client';

import React, { useState } from 'react';
import { Button } from '@nextui-org/react';
import { FiInfo, FiAlertTriangle, FiAlertCircle, FiTerminal, FiCopy } from 'react-icons/fi';
import { ExpandableValue } from './expandable-value';
import { SUCCESS_MESSAGES, ERROR_MESSAGES } from '@/constants';

type MessageType = 'log' | 'warn' | 'error' | 'info';

interface ConsoleMessageProps {
  /** 消息ID */
  id: string;
  /** 消息类型 */
  type: MessageType;
  /** 消息参数 */
  args: any[];
  /** 时间戳 */
  timestamp: number;
}

/**
 * 控制台消息组件
 * 显示单条控制台消息，支持对象展开
 */
export function ConsoleMessage({
  id,
  type,
  args,
  timestamp
}: ConsoleMessageProps) {
  const [expandedArgs, setExpandedArgs] = useState<Set<number>>(new Set());
  const [expandedPaths, setExpandedPaths] = useState<Set<string>>(new Set());

  /** 获取消息图标 */
  const getMessageIcon = (messageType: MessageType) => {
    const iconProps = { size: 14, className: "flex-shrink-0 mt-0.5" };
    
    switch (messageType) {
      case 'log':
        return <FiTerminal {...iconProps} className={`${iconProps.className} text-gray-400`} />;
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
  const getMessageStyle = (messageType: MessageType): string => {
    const baseStyle = "text-sm font-mono leading-relaxed";
    
    switch (messageType) {
      case 'log':
        return `${baseStyle} text-gray-300`;
      case 'info':
        return `${baseStyle} text-blue-300`;
      case 'warn':
        return `${baseStyle} text-yellow-300`;
      case 'error':
        return `${baseStyle} text-red-300`;
      default:
        return `${baseStyle} text-gray-300`;
    }
  };

  /** 切换参数展开状态 */
  const toggleArgExpansion = (argIndex: number) => {
    setExpandedArgs(prev => {
      const newSet = new Set(prev);
      if (newSet.has(argIndex)) {
        newSet.delete(argIndex);
      } else {
        newSet.add(argIndex);
      }
      return newSet;
    });
  };

  /** 切换嵌套路径展开状态 */
  const togglePathExpansion = (path: string) => {
    setExpandedPaths(prev => {
      const newSet = new Set(prev);
      if (newSet.has(path)) {
        newSet.delete(path);
      } else {
        newSet.add(path);
      }
      return newSet;
    });
  };

  /** 复制消息内容 */
  const copyMessage = async () => {
    try {
      const text = args.join(' ');
      await navigator.clipboard.writeText(text);
      console.log(SUCCESS_MESSAGES.COPY_SUCCESS);
    } catch (error) {
      console.error(ERROR_MESSAGES.OPERATION_FAILED, error);
    }
  };

  return (
    <div className="flex items-start gap-2 py-1 px-2 rounded hover:bg-gray-800/50 group">
      {/* 图标 */}
      <div className="flex-shrink-0">
        {getMessageIcon(type)}
      </div>
      
      {/* 消息内容 */}
      <div className="flex-1 min-w-0">
        <div className="flex flex-wrap items-start gap-2 leading-relaxed">
          {args.map((arg, index) => {
            const isExpanded = expandedArgs.has(index);
            const argPath = `arg-${index}`;

            return (
              <div
                key={index}
                className="inline-block"
              >
                <ExpandableValue
                  value={arg}
                  isExpanded={isExpanded}
                  path={argPath}
                  onToggle={() => toggleArgExpansion(index)}
                  onPathToggle={togglePathExpansion}
                  expandedPaths={expandedPaths}
                />
                {index < args.length - 1 && (
                  <span className="text-gray-500 ml-1">,</span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* 复制按钮 */}
      <Button
        size="sm"
        variant="ghost"
        className="opacity-0 group-hover:opacity-100 transition-opacity min-w-0 px-1"
        onClick={copyMessage}
        title="复制消息"
      >
        <FiCopy size={12} />
      </Button>
    </div>
  );
}
