'use client';

import React, { useState } from 'react';
import { 
  Card, 
  CardBody, 
  Tabs, 
  Tab, 
  Button, 
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Chip
} from '@nextui-org/react';
import { MonacoEditor } from './monaco-editor';
import { useEditorStore } from '@/stores/editor-store';
import { useGlobalLanguageService } from '@/lib/services/language-service';
import type { EditorType, Language } from '@/types';

interface EditorPanelProps {
  /** 自定义样式类名 */
  className?: string;
  /** 是否显示工具栏 */
  showToolbar?: boolean;
  /** 默认活动的编辑器 */
  defaultActiveEditor?: EditorType;
}

/**
 * 编辑器面板组件
 * 包含多个编辑器标签页和工具栏
 */
export function EditorPanel({
  className = '',
  showToolbar = true,
  defaultActiveEditor = 'script'
}: EditorPanelProps) {
  const [activeTab, setActiveTab] = useState<EditorType>(defaultActiveEditor);
  
  const {
    configs,
    contents,
    visibility,
    errors,
    setActiveEditor,
    setEditorLanguage,
    formatCode,
    resetEditor
  } = useEditorStore();
  
  const languageService = useGlobalLanguageService();

  /** 获取编辑器标签信息 */
  const getTabInfo = (type: EditorType) => {
    const config = configs[type];
    const content = contents[type];
    const hasErrors = errors[type].length > 0;
    const hasContent = content.trim().length > 0;
    
    return {
      title: getTabTitle(type),
      language: config.language,
      hasErrors,
      hasContent,
      visible: visibility[type]
    };
  };

  /** 获取标签标题 */
  const getTabTitle = (type: EditorType): string => {
    const titles = {
      markup: 'HTML',
      style: 'CSS', 
      script: 'JS'
    };
    return titles[type];
  };

  /** 获取语言选项 */
  const getLanguageOptions = (type: EditorType) => {
    return languageService.getLanguagesByEditorType(type).map(lang => ({
      key: lang,
      label: languageService.getLanguageDisplayName(lang),
      needsCompiler: languageService.needsCompiler(lang)
    }));
  };

  /** 处理标签切换 */
  const handleTabChange = (key: string | number) => {
    const editorType = key as EditorType;
    setActiveTab(editorType);
    setActiveEditor(editorType);
  };

  /** 处理语言切换 */
  const handleLanguageChange = (type: EditorType, language: Language) => {
    setEditorLanguage(type, language);
  };

  /** 处理格式化代码 */
  const handleFormatCode = () => {
    formatCode(activeTab);
  };

  /** 处理重置编辑器 */
  const handleResetEditor = () => {
    resetEditor(activeTab);
  };

  /** 渲染工具栏 */
  const renderToolbar = (type: EditorType) => {
    const tabInfo = getTabInfo(type);
    const languageOptions = getLanguageOptions(type);

    return (
      <div className="flex items-center justify-between p-3 border-b border-divider">
        <div className="flex items-center gap-3">
          {/* 语言选择器 */}
          <Dropdown>
            <DropdownTrigger>
              <Button
                variant="flat"
                size="sm"
                endContent={
                  languageService.needsCompiler(tabInfo.language) ? (
                    <Chip size="sm" color="warning" variant="dot">编译</Chip>
                  ) : null
                }
              >
                {languageService.getLanguageDisplayName(tabInfo.language)}
              </Button>
            </DropdownTrigger>
            <DropdownMenu
              aria-label="选择语言"
              onAction={(key) => handleLanguageChange(type, key as Language)}
            >
              {languageOptions.map((option) => (
                <DropdownItem
                  key={option.key}
                  endContent={
                    option.needsCompiler ? (
                      <Chip size="sm" color="warning" variant="dot">编译</Chip>
                    ) : null
                  }
                >
                  {option.label}
                </DropdownItem>
              ))}
            </DropdownMenu>
          </Dropdown>

          {/* 状态指示器 */}
          <div className="flex items-center gap-2">
            {tabInfo.hasContent && (
              <Chip size="sm" color="success" variant="dot">
                有内容
              </Chip>
            )}
            {tabInfo.hasErrors && (
              <Chip size="sm" color="danger" variant="dot">
                {errors[type].length} 错误
              </Chip>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* 格式化按钮 */}
          <Button
            variant="light"
            size="sm"
            onClick={handleFormatCode}
            isDisabled={!tabInfo.hasContent}
          >
            格式化
          </Button>

          {/* 重置按钮 */}
          <Button
            variant="light"
            size="sm"
            color="warning"
            onClick={handleResetEditor}
            isDisabled={!tabInfo.hasContent}
          >
            重置
          </Button>
        </div>
      </div>
    );
  };

  /** 渲染编辑器内容 */
  const renderEditorContent = (type: EditorType) => {
    const tabInfo = getTabInfo(type);
    
    if (!tabInfo.visible) {
      return (
        <div className="flex items-center justify-center h-64 text-default-500">
          <p>编辑器已隐藏</p>
        </div>
      );
    }

    return (
      <div className="h-full">
        {showToolbar && renderToolbar(type)}
        <div className={showToolbar ? 'h-[calc(100%-60px)]' : 'h-full'}>
          <MonacoEditor
            editorType={type}
            config={configs[type]}
            className="h-full"
            showLineNumbers={configs[type].lineNumbers}
            showMinimap={configs[type].minimap}
          />
        </div>
      </div>
    );
  };

  /** 获取可见的编辑器类型 */
  const visibleEditors = (['markup', 'style', 'script'] as EditorType[])
    .filter(type => visibility[type]);

  if (visibleEditors.length === 0) {
    return (
      <Card className={className}>
        <CardBody className="flex items-center justify-center h-64">
          <div className="text-center text-default-500">
            <p className="text-lg font-semibold">没有可用的编辑器</p>
            <p className="text-sm mt-1">请在设置中启用至少一个编辑器</p>
          </div>
        </CardBody>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardBody className="p-0">
        <Tabs
          aria-label="编辑器标签"
          selectedKey={activeTab}
          onSelectionChange={handleTabChange}
          variant="underlined"
          classNames={{
            tabList: "gap-6 w-full relative rounded-none p-0 border-b border-divider",
            cursor: "w-full bg-primary",
            tab: "max-w-fit px-4 h-12",
            tabContent: "group-data-[selected=true]:text-primary"
          }}
        >
          {visibleEditors.map((type) => {
            const tabInfo = getTabInfo(type);
            return (
              <Tab
                key={type}
                title={
                  <div className="flex items-center gap-2">
                    <span>{tabInfo.title}</span>
                    <span className="text-xs text-default-400">
                      {languageService.getLanguageDisplayName(tabInfo.language)}
                    </span>
                    {tabInfo.hasErrors && (
                      <div className="w-2 h-2 bg-danger rounded-full" />
                    )}
                    {tabInfo.hasContent && !tabInfo.hasErrors && (
                      <div className="w-2 h-2 bg-success rounded-full" />
                    )}
                  </div>
                }
              >
                <div className="h-[500px]">
                  {renderEditorContent(type)}
                </div>
              </Tab>
            );
          })}
        </Tabs>
      </CardBody>
    </Card>
  );
}
