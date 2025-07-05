'use client';

import React from 'react';
import { Button, Chip, Code, Tooltip } from '@nextui-org/react';
import { useGlobalLanguageService } from '@/lib/services/language-service';
import { SUCCESS_MESSAGES, ERROR_MESSAGES } from '@/constants';

interface CodeBlockProps {
  /** 代码内容 */
  code: string;
  /** 语言类型 */
  language: string;
  /** 标题 */
  title: string;
  /** 代码块类型 */
  type: 'original' | 'compiled';
  /** 自定义样式类名 */
  className?: string;
}

/**
 * 代码块组件
 * 负责显示代码内容和复制功能
 */
export function CodeBlock({
  code,
  language,
  title,
  type,
  className = ''
}: CodeBlockProps) {
  const languageService = useGlobalLanguageService();
  const isEmpty = !code.trim();

  /** 复制代码到剪贴板 */
  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(code);
      console.log(SUCCESS_MESSAGES.COPY_SUCCESS);
    } catch (error) {
      console.error(ERROR_MESSAGES.OPERATION_FAILED, error);
    }
  };

  return (
    <div className={`flex-1 ${className}`}>
      <div className="flex items-center justify-between p-3 bg-content2 border-b border-divider">
        <div className="flex items-center gap-2">
          <span className="font-medium text-sm">{title}</span>
          <Chip size="sm" variant="flat">
            {languageService.getLanguageDisplayName(language as any)}
          </Chip>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-default-500">
            {code.length} 字符
          </span>
          <Tooltip content={`复制${title}`}>
            <Button
              size="sm"
              variant="light"
              onPress={copyToClipboard}
              isDisabled={isEmpty}
            >
              📋
            </Button>
          </Tooltip>
        </div>
      </div>
      <div className="p-4 bg-content1 max-h-96 overflow-auto">
        {isEmpty ? (
          <div className="text-center text-default-400 py-8">
            <p>暂无内容</p>
          </div>
        ) : (
          <Code
            className="w-full text-xs whitespace-pre-wrap"
            color={type === 'compiled' ? 'primary' : 'default'}
          >
            {code}
          </Code>
        )}
      </div>
    </div>
  );
}
