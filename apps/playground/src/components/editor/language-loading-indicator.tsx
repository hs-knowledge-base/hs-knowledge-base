'use client';

import React from 'react';
import { useLanguageLoadingState } from '@/lib/utils/language-loader';
import type { Language } from '@/types';

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
