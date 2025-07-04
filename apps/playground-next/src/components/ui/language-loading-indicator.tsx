'use client';

import React from 'react';
import { Chip, Spinner } from '@nextui-org/react';
import { useLanguageLoadingState } from '@/lib/utils/language-loader';
import type { Language } from '@/types';

interface LanguageLoadingIndicatorProps {
  /** 语言 */
  language: Language;
  /** 是否显示详细信息 */
  showDetails?: boolean;
  /** 自定义样式类名 */
  className?: string;
}

/**
 * 语言加载状态指示器
 * 显示语言的加载状态（加载中、已加载、错误）
 */
export function LanguageLoadingIndicator({
  language,
  showDetails = false,
  className = ''
}: LanguageLoadingIndicatorProps) {
  const { isLoaded, isLoading, error } = useLanguageLoadingState(language);

  // 如果已加载且没有错误，不显示指示器
  if (isLoaded && !error && !showDetails) {
    return null;
  }

  /** 获取状态颜色 */
  const getStatusColor = () => {
    if (error) return 'danger';
    if (isLoading) return 'warning';
    if (isLoaded) return 'success';
    return 'default';
  };

  /** 获取状态文本 */
  const getStatusText = () => {
    if (error) return '加载失败';
    if (isLoading) return '加载中';
    if (isLoaded) return '已加载';
    return '未加载';
  };

  /** 获取状态图标 */
  const getStatusIcon = () => {
    if (error) return '❌';
    if (isLoading) return <Spinner size="sm" />;
    if (isLoaded) return '✅';
    return '⚪';
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <Chip
        size="sm"
        color={getStatusColor()}
        variant="flat"
        startContent={getStatusIcon()}
      >
        {showDetails ? `${language.toUpperCase()} - ${getStatusText()}` : getStatusText()}
      </Chip>
      
      {error && showDetails && (
        <span className="text-xs text-danger-500" title={error}>
          {error.length > 30 ? `${error.substring(0, 30)}...` : error}
        </span>
      )}
    </div>
  );
}

interface LanguageLoadingBadgeProps {
  /** 语言 */
  language: Language;
  /** 是否显示加载状态 */
  showLoadingState?: boolean;
}

/**
 * 语言加载徽章
 * 在语言选择器中显示的简化版本
 */
export function LanguageLoadingBadge({
  language,
  showLoadingState = true
}: LanguageLoadingBadgeProps) {
  const { isLoading, error } = useLanguageLoadingState(language);

  if (!showLoadingState || (!isLoading && !error)) {
    return null;
  }

  return (
    <div className="flex items-center gap-1">
      {isLoading && (
        <span className="w-2 h-2 bg-warning-500 rounded-full animate-pulse" title="加载中" />
      )}
      {error && (
        <span className="w-2 h-2 bg-danger-500 rounded-full" title={`加载失败: ${error}`} />
      )}
    </div>
  );
}
