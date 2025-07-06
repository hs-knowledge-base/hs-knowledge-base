'use client';

import React from 'react';
import { Button, Chip, Dropdown, DropdownTrigger, DropdownMenu, DropdownItem, Tooltip } from '@nextui-org/react';
import { FiPlay, FiTrash2, FiFilter, FiCopy, FiDownload, FiChevronDown, FiChevronUp } from 'react-icons/fi';

type MessageType = 'log' | 'warn' | 'error' | 'info';

interface MessageFilter {
  log: boolean;
  warn: boolean;
  error: boolean;
  info: boolean;
}

interface ConsoleToolbarProps {
  /** 是否折叠 */
  isCollapsed: boolean;
  /** 自动滚动 */
  autoScroll: boolean;
  /** 过滤器 */
  filters: MessageFilter;
  /** 消息统计 */
  messageStats: {
    total: number;
    log: number;
    warn: number;
    error: number;
    info: number;
  };
  /** 折叠状态变化 */
  onCollapseChange: (collapsed: boolean) => void;
  /** 自动滚动变化 */
  onAutoScrollChange: (autoScroll: boolean) => void;
  /** 过滤器变化 */
  onFiltersChange: (filters: MessageFilter) => void;
  /** 清空控制台 */
  onClear: () => void;
  /** 手动运行 */
  onManualRun: () => void;
  /** 复制所有消息 */
  onCopyAll: () => void;
  /** 导出日志 */
  onExportLogs: () => void;
}

/**
 * 控制台工具栏组件
 * 提供控制台的各种操作功能
 */
export function ConsoleToolbar({
  isCollapsed,
  autoScroll,
  filters,
  messageStats,
  onCollapseChange,
  onAutoScrollChange,
  onFiltersChange,
  onClear,
  onManualRun,
  onCopyAll,
  onExportLogs
}: ConsoleToolbarProps) {

  /** 切换过滤器 */
  const toggleFilter = (type: MessageType) => {
    onFiltersChange({
      ...filters,
      [type]: !filters[type]
    });
  };

  /** 获取过滤器按钮样式 */
  const getFilterButtonStyle = (type: MessageType, isActive: boolean) => {
    const baseStyle = "text-xs px-1.5 py-1 rounded min-w-[20px] text-center transition-colors";
    const colors = {
      log: isActive ? "bg-gray-600 text-white hover:bg-gray-500" : "bg-gray-800 text-gray-500 hover:bg-gray-700",
      info: isActive ? "bg-blue-600 text-white hover:bg-blue-500" : "bg-gray-800 text-gray-500 hover:bg-gray-700",
      warn: isActive ? "bg-yellow-600 text-white hover:bg-yellow-500" : "bg-gray-800 text-gray-500 hover:bg-gray-700",
      error: isActive ? "bg-red-600 text-white hover:bg-red-500" : "bg-gray-800 text-gray-500 hover:bg-gray-700"
    };
    return `${baseStyle} ${colors[type]}`;
  };

  return (
    <div className="flex items-center justify-between p-2 bg-gray-800 border-b border-gray-700">
      <div className="flex items-center gap-1">
        {/* 折叠/展开按钮 */}
        <Tooltip content={isCollapsed ? "展开控制台" : "折叠控制台"}>
          <Button
            size="sm"
            variant="light"
            isIconOnly
            className="text-gray-400 hover:text-gray-200 hover:bg-gray-700"
            onPress={() => onCollapseChange(!isCollapsed)}
          >
            {isCollapsed ? <FiChevronUp size={16} /> : <FiChevronDown size={16} />}
          </Button>
        </Tooltip>

        {/* 清空按钮 */}
        <Tooltip content="清空控制台">
          <Button
            size="sm"
            variant="light"
            isIconOnly
            className="text-gray-400 hover:text-red-400 hover:bg-gray-700"
            onPress={onClear}
          >
            <FiTrash2 size={16} />
          </Button>
        </Tooltip>

        {/* 运行按钮 */}
        <Tooltip content="重新运行代码">
          <Button
            size="sm"
            variant="light"
            isIconOnly
            className="text-gray-400 hover:text-green-400 hover:bg-gray-700"
            onPress={onManualRun}
          >
            <FiPlay size={16} />
          </Button>
        </Tooltip>

        {/* 消息统计 */}
        <div className="flex items-center gap-1 text-xs text-gray-400 ml-2">
          <span>共 {messageStats.total} 条</span>
        </div>
      </div>

      <div className="flex items-center gap-1">
        {/* 过滤器 */}
        <Tooltip content="过滤消息类型">
          <Button
            size="sm"
            variant="light"
            isIconOnly
            className="text-gray-400 hover:text-gray-200 hover:bg-gray-700"
          >
            <FiFilter size={16} />
          </Button>
        </Tooltip>

        {/* 过滤器按钮组 */}
        <div className="flex items-center gap-1 ml-1">
          {(['log', 'info', 'warn', 'error'] as MessageType[]).map(type => (
            <Tooltip key={type} content={`${filters[type] ? '隐藏' : '显示'} ${type.toUpperCase()} 消息`}>
              <button
                className={getFilterButtonStyle(type, filters[type])}
                onClick={() => toggleFilter(type)}
              >
                {messageStats[type]}
              </button>
            </Tooltip>
          ))}
        </div>

        {/* 复制按钮 */}
        <Tooltip content="复制所有消息">
          <Button
            size="sm"
            variant="light"
            isIconOnly
            className="text-gray-400 hover:text-gray-200 hover:bg-gray-700"
            onPress={onCopyAll}
          >
            <FiCopy size={16} />
          </Button>
        </Tooltip>

        {/* 导出按钮 */}
        <Tooltip content="导出日志文件">
          <Button
            size="sm"
            variant="light"
            isIconOnly
            className="text-gray-400 hover:text-gray-200 hover:bg-gray-700"
            onPress={onExportLogs}
          >
            <FiDownload size={16} />
          </Button>
        </Tooltip>
      </div>
    </div>
  );
}
