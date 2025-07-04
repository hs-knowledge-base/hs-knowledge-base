'use client';

import React, { useState, useEffect } from 'react';
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
} from '@nextui-org/react';
import { MonacoEditor } from './monaco-editor';
import { useEditorStore } from '@/stores/editor-store';
import { useGlobalLanguageService } from '@/lib/services/language-service';
import { useGlobalVendorService } from '@/lib/services/vendors';
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
  const vendorService = useGlobalVendorService();

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
  const handleLanguageChange = async (type: EditorType, language: Language) => {
    try {
      console.log(`[EditorPanel] 开始切换语言: ${language}`);

      // 检查是否需要加载 vendor
      const languageConfig = languageService.getLanguageConfig(language);
      console.log(`[EditorPanel] 语言配置:`, languageConfig);

      if (languageConfig?.compiler?.vendorKey) {
        console.log(`[EditorPanel] 需要加载编译器依赖: ${languageConfig.compiler.vendorKey}`);
        await vendorService.loadVendor(languageConfig.compiler.vendorKey);
        console.log(`[EditorPanel] 编译器依赖加载完成: ${languageConfig.compiler.vendorKey}`);
      }

      // 设置语言
      setEditorLanguage(type, language);
      console.log(`[EditorPanel] 语言已切换到: ${language}`);
    } catch (error) {
      console.error(`[EditorPanel] 语言切换失败:`, error);
    }
  };

  /** 渲染工具栏 */
  const renderToolbar = (type: EditorType) => {
    const tabInfo = getTabInfo(type);
    const languageOptions = getLanguageOptions(type);

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
                  <div className="flex  items-center gap-2 ml-2">
                    {languageService.needsCompiler(tabInfo.language) && (
                      <div className="w-2 h-2 bg-orange-400 rounded-full"></div>
                    )}
                  </div>
                }
              >
                <span className="font-medium">
                  {languageService.getLanguageDisplayName(tabInfo.language)}
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
                handleLanguageChange(type, key as Language);
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
            {tabInfo.hasContent && (
              <div className="flex items-center gap-1 text-xs text-green-400">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>已修改</span>
              </div>
            )}
            {tabInfo.hasErrors && (
              <div className="flex items-center gap-1 text-xs text-red-400">
                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                <span>{errors[type].length} 错误</span>
              </div>
            )}
          </div>
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
        <div className={showToolbar ? 'h-[calc(100%-50px)]' : 'h-full'}>
          <MonacoEditor
            key={`monaco-editor-${type}`}
            editorType={type}
            config={configs[type]}
            className="w-full h-full"
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
    <div className={`${className} bg-gray-900 flex flex-col`}>
      {/* 文件标签栏 */}
      <div className="bg-gray-850 px-1 pt-1">
        <div className="flex items-end gap-1">
          {visibleEditors.map((type) => {
            const tabInfo = getTabInfo(type);
            const isActive = activeTab === type;
            return (
              <button
                key={type}
                onClick={() => handleTabChange(type)}
                className={`
                  relative flex items-center gap-2 px-4 py-2.5 text-sm font-medium transition-all duration-200
                  rounded-t-lg border-t-2 border-l border-r
                  ${isActive
                    ? 'bg-gray-900 text-white border-blue-400 border-l-gray-600 border-r-gray-600 shadow-lg z-10'
                    : 'bg-gray-800/70 text-gray-400 border-transparent border-l-gray-700 border-r-gray-700 hover:text-gray-200 hover:bg-gray-800 hover:border-gray-600'
                  }
                `}
              >
                {/* 语言名称 */}
                <span className="font-medium whitespace-nowrap">
                  {languageService.getLanguageDisplayName(tabInfo.language)}
                </span>

                {/* 状态指示器 */}
                {tabInfo.hasErrors && (
                  <div className="w-1.5 h-1.5 bg-red-400 rounded-full animate-pulse" />
                )}
              </button>
            );
          })}
        </div>
        {/* 底部边框线 */}
        <div className="h-px bg-gray-700"></div>
      </div>

      {/* 编辑器内容区域 */}
      <div className="flex-1 bg-gray-900 relative">
        {visibleEditors.map((type) => (
          <div
            key={`editor-container-${type}`}
            className={`absolute inset-0 ${activeTab === type ? 'block' : 'hidden'}`}
          >
            {renderEditorContent(type)}
          </div>
        ))}
      </div>
    </div>
  );
}
