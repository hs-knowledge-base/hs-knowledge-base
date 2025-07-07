'use client';

import React from 'react';
import {
  Button,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
} from '@nextui-org/react';
import { useGlobalLanguageService } from '@/lib/services/language-service';
import { useLanguageLoader } from '@/lib/utils/language-loader';
import type { EditorType, Language, EditorConfig } from '@/types';

interface EditorToolbarProps {
  /** 编辑器类型 */
  editorType: EditorType;
  /** 编辑器配置 */
  config: EditorConfig;
  /** 是否有内容 */
  hasContent: boolean;
  /** 是否有错误 */
  hasErrors: boolean;
  /** 错误数量 */
  errorCount: number;
  /** 语言变化回调 */
  onLanguageChange: (language: Language) => void;
}

/**
 * 编辑器工具栏组件
 * 负责显示语言选择器和状态指示器
 */
export function EditorToolbar({
  editorType,
  config,
  hasContent,
  hasErrors,
  errorCount,
  onLanguageChange
}: EditorToolbarProps) {
  const languageService = useGlobalLanguageService();
  const { loadLanguage } = useLanguageLoader();

  /** 获取语言选项 */
  const getLanguageOptions = () => {
    return languageService.getLanguagesByEditorType(editorType).map(lang => ({
      key: lang,
      label: languageService.getLanguageDisplayName(lang),
      needsCompiler: languageService.needsCompiler(lang)
    }));
  };

  /** 处理语言切换 */
  const handleLanguageChange = async (language: Language) => {
    try {
      console.log(`[EditorToolbar] 开始切换语言: ${language}`);
      
      // 按需加载语言资源
      await loadLanguage(language);
      
      // 通知父组件
      onLanguageChange(language);
      console.log(`[EditorToolbar] 语言已切换到: ${language}`);
    } catch (error) {
      console.error(`[EditorToolbar] 语言切换失败:`, error);
    }
  };

  const languageOptions = getLanguageOptions();

  return (
    <div className="flex items-center justify-between px-4 py-2 bg-gray-800 border-b border-gray-700">
      <div className="flex items-center gap-3">
        {/* 语言选择器 */}
        <Dropdown>
          <DropdownTrigger>
            <Button
              variant="flat"
              size="md"
              className="bg-gray-700 text-gray-300 hover:bg-gray-600 border border-gray-600 min-w-32 justify-between px-3 py-2"
              endContent={
                <div className="flex items-center gap-2 ml-2">
                  {languageService.needsCompiler(config.language) && (
                    <div className="w-2 h-2 bg-orange-400 rounded-full"></div>
                  )}
                </div>
              }
            >
              <span className="font-medium">
                {languageService.getLanguageDisplayName(config.language)}
              </span>
            </Button>
          </DropdownTrigger>
          <DropdownMenu
            aria-label="选择语言"
            className="min-w-40"
            classNames={{
              base: "bg-gray-800 border border-gray-600 shadow-xl rounded-lg",
              list: "bg-gray-800 p-1"
            }}
            itemClasses={{
              base: "text-gray-300 data-[hover=true]:bg-gray-700 data-[hover=true]:text-white mx-1 px-3 py-2",
              title: "font-medium"
            }}
            onAction={(key) => {
              handleLanguageChange(key as Language);
            }}
          >
            {languageOptions.map((option) => (
              <DropdownItem
                key={option.key}
                className="flex items-center justify-between"
                endContent={
                  option.needsCompiler ? (
                    <div className="flex items-center gap-1">
                      <span className="w-2 h-2 bg-orange-400 rounded-full"></span>
                      <span className="text-xs text-gray-500">需编译</span>
                    </div>
                  ) : null
                }
              >
                <span className="font-medium">{option.label}</span>
              </DropdownItem>
            ))}
          </DropdownMenu>
        </Dropdown>

        {/* 状态指示器 */}
        <div className="flex items-center gap-2">
          {hasContent && (
            <div className="flex items-center gap-1 text-xs text-green-400">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>已修改</span>
            </div>
          )}
          {hasErrors && (
            <div className="flex items-center gap-1 text-xs text-red-400">
              <div className="w-2 h-2 bg-red-500 rounded-full"></div>
              <span>{errorCount} 错误</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
