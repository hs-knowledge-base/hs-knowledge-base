'use client';

import React from 'react';
import {
  Chip,
  Select,
  SelectItem
} from '@nextui-org/react';
import { useGlobalLanguageService } from '@/lib/services/language-service';
import { useGlobalVendorService } from '@/lib/services/vendors';
import type { EditorType, Language } from '@/types';

interface LanguageSelectorProps {
  /** 编辑器类型 */
  editorType: EditorType;
  /** 当前选中的语言 */
  value: Language;
  /** 语言变化回调 */
  onChange: (language: Language) => void;
  /** 是否禁用 */
  isDisabled?: boolean;
  /** 尺寸 */
  size?: 'sm' | 'md' | 'lg';
  /** 变体 */
  variant?: 'flat' | 'bordered' | 'faded' | 'underlined';
  /** 自定义样式类名 */
  className?: string;
  /** 是否显示描述 */
  showDescription?: boolean;
  /** 是否显示图标 */
  showIcon?: boolean;
}

/**
 * 语言选择器组件
 * 根据编辑器类型显示对应的语言选项
 */
export function LanguageSelector({
  editorType,
  value,
  onChange,
  isDisabled = false,
  size = 'md',
  variant = 'bordered',
  className = '',
  showDescription = true,
  showIcon = true
}: LanguageSelectorProps) {
  const languageService = useGlobalLanguageService();
  const vendorService = useGlobalVendorService();

  /** 获取语言选项 */
  const getLanguageOptions = () => {
    return languageService.getLanguagesByEditorType(editorType).map(lang => {
      const config = languageService.getLanguageConfig(lang);
      return {
        key: lang,
        label: languageService.getLanguageDisplayName(lang),
        shortLabel: config?.title || lang.toUpperCase(),
        needsCompiler: languageService.needsCompiler(lang),
        needsRuntime: languageService.needsRuntime(lang),
        extensions: config?.extensions || [],
        description: getLanguageDescription(lang)
      };
    });
  };

  /** 获取语言描述 */
  const getLanguageDescription = (language: Language): string => {
    const descriptions: Record<Language, string> = {
      html: '超文本标记语言',
      markdown: 'Markdown 标记语言',
      css: '层叠样式表',
      scss: 'Sass CSS 预处理器',
      less: 'Less CSS 预处理器',
      javascript: 'JavaScript 脚本语言',
      typescript: 'TypeScript 类型化 JavaScript',
      json: 'JSON 数据格式',
      xml: 'XML 标记语言',
      yaml: 'YAML 数据序列化格式'
    };
    return descriptions[language] || language;
  };



  /** 处理选择变化 */
  const handleSelectionChange = async (keys: any) => {
    const selectedKey = Array.from(keys)[0] as Language;
    if (selectedKey && selectedKey !== value) {
      try {
        // 检查是否需要加载 vendor
        const languageConfig = languageService.getLanguageConfig(selectedKey);
        if (languageConfig?.compiler?.vendorKey) {
          console.log(`[LanguageSelector] 加载 ${selectedKey} 编译器依赖: ${languageConfig.compiler.vendorKey}`);
          await vendorService.loadVendor(languageConfig.compiler.vendorKey);
        }

        onChange(selectedKey);
        console.log(`[LanguageSelector] 语言已切换到: ${selectedKey}`);
      } catch (error) {
        console.error(`[LanguageSelector] 语言切换失败:`, error);
      }
    }
  };

  const languageOptions = getLanguageOptions();
  const selectedOption = languageOptions.find(option => option.key === value);

  return (
    <Select
      label={`${getEditorTypeLabel(editorType)} 语言`}
      placeholder="选择语言"
      selectedKeys={[value]}
      onSelectionChange={handleSelectionChange}
      isDisabled={isDisabled}
      size={size}
      variant={variant}
      className={className}
      classNames={{
        trigger: "min-h-unit-8 bg-gray-700 border-gray-600 hover:bg-gray-600 data-[hover=true]:bg-gray-600",
        value: "text-small text-gray-200",
        listbox: "bg-gray-800",
        popoverContent: "bg-gray-800 border-gray-700"
      }}
      renderValue={(items) => {
        return items.map((item) => {
          const option = languageOptions.find(opt => opt.key === item.key);
          if (!option) return null;

          return (
            <div key={item.key} className="flex items-center gap-2">
              <span className="text-small font-medium text-gray-200">{option.shortLabel}</span>
              {option.needsCompiler && (
                <span className="w-2 h-2 bg-orange-500 rounded-full"></span>
              )}
            </div>
          );
        });
      }}
    >
      {languageOptions.map((option) => (
        <SelectItem
          key={option.key}
          value={option.key}
          textValue={option.label}
          className="text-gray-200 hover:bg-gray-700"
          endContent={
            <div className="flex gap-1">
              {option.needsCompiler && (
                <span className="w-2 h-2 bg-orange-500 rounded-full"></span>
              )}
            </div>
          }
        >
          <div className="flex flex-col">
            <span className="text-small font-medium">{option.label}</span>
            {showDescription && (
              <span className="text-tiny text-default-400">
                {option.description}
              </span>
            )}
            <div className="flex gap-1 mt-1">
              {option.extensions.map((ext) => (
                <Chip key={ext} size="sm" variant="flat" className="text-tiny">
                  .{ext}
                </Chip>
              ))}
            </div>
          </div>
        </SelectItem>
      ))}
    </Select>
  );
}

/** 获取编辑器类型标签 */
function getEditorTypeLabel(editorType: EditorType): string {
  const labels = {
    markup: '标记',
    style: '样式',
    script: '脚本'
  };
  return labels[editorType];
}

/** 语言选择器的简化版本 */
export function SimpleLanguageSelector({
  editorType,
  value,
  onChange,
  isDisabled = false,
  size = 'sm'
}: Pick<LanguageSelectorProps, 'editorType' | 'value' | 'onChange' | 'isDisabled' | 'size'>) {
  return (
    <LanguageSelector
      editorType={editorType}
      value={value}
      onChange={onChange}
      isDisabled={isDisabled}
      size={size}
      variant="flat"
      showDescription={false}
      showIcon={false}
      className="min-w-32"
    />
  );
}
