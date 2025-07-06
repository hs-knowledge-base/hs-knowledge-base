'use client';

import React, { useState } from 'react';
import {
  Card,
  CardBody,
  CardHeader,
  Tabs,
  Tab,
  Button,
  Chip,
  Code,
  Divider,
} from '@nextui-org/react';
import { useCompilerStore } from '@/stores/compiler-store';
import { useEditorStore } from '@/stores/editor-store';
import { useGlobalLanguageService } from '@/lib/services/language-service';
import { EDITOR_TYPE_LABELS } from '@/constants/editor';
import { CodeBlock } from './code-block';
import { CompilerStats } from './compiler-stats';
import type {EditorType, Language} from '@/types';

interface CompilerOutputProps {
  /** 自定义样式类名 */
  className?: string;
  /** 是否显示原代码 */
  showOriginalCode?: boolean;
  /** 是否显示统计信息 */
  showStats?: boolean;
  /** 默认活动标签 */
  defaultActiveTab?: EditorType;
}

/**
 * 编译器输出组件
 * 显示编译前后的代码对比和编译统计信息
 */
export function CompilerOutput({
  className = '',
  showOriginalCode = true,
  showStats = true,
  defaultActiveTab = 'script'
}: CompilerOutputProps) {
  const [activeTab, setActiveTab] = useState<EditorType>(defaultActiveTab);
  const [showComparison, setShowComparison] = useState(true);

  const { results, isCompiling, performance } = useCompilerStore();
  const { contents, configs } = useEditorStore();
  const languageService = useGlobalLanguageService();

  /** 获取编译结果内容 */
  const getCompiledContent = (type: EditorType): string => {
    const content = contents[type];
    const result = results[type];
    const config = configs[type];

    // 如果没有原始内容，返回空
    if (!content?.trim()) {
      return '';
    }

    // 如果有编译结果，使用编译结果
    if (result?.code?.trim()) {
      return result.code;
    }

    // 如果是原生语言（不需要编译），直接返回原始内容
    if (!languageService.needsCompiler(config.language)) {
      return content;
    }

    // 需要编译但没有结果，返回空（可能正在编译或编译失败）
    return '';
  };

  /** 获取标签信息 */
  const getTabInfo = (type: EditorType) => {
    const result = results[type];
    const content = contents[type];
    const config = configs[type];
    const compiledContent = getCompiledContent(type);

    const hasContent = content.trim().length > 0;
    const hasCompiledContent = compiledContent.trim().length > 0;
    const hasError = !!result.error;
    const needsCompilation = languageService.needsCompiler(config.language);

    return {
      title: getTabTitle(type),
      language: config.language,
      compiledLanguage: languageService.getTargetLanguage(config.language),
      hasContent,
      hasCompiledContent,
      hasError,
      needsCompilation,
      originalContent: content || '',
      compiledContent,
      originalSize: content.length,
      compiledSize: compiledContent.length
    };
  };

  /** 获取标签标题 */
  const getTabTitle = (type: EditorType): string => {
    return EDITOR_TYPE_LABELS[type];
  };

  /** 渲染代码块 */
  const renderCodeBlock = (code: string, language: Language, title: string, type: 'original' | 'compiled') => {
    return (
      <CodeBlock
        code={code}
        language={language}
        title={title}
        type={type}
      />
    );
  };

  /** 渲染编译结果 */
  const renderCompileResult = (type: EditorType) => {
    const tabInfo = getTabInfo(type);

    // 如果没有内容，显示空状态
    if (!tabInfo.hasContent) {
      return (
        <div className="flex items-center justify-center h-64 text-default-500">
          <div className="text-center">
            <p className="text-lg font-semibold">没有代码内容</p>
            <p className="text-sm mt-1">请在编辑器中输入代码</p>
          </div>
        </div>
      );
    }

    // 如果有编译错误，显示错误信息和原始代码
    if (tabInfo.hasError) {
      return (
        <div className="space-y-4">
          {/* 错误信息 */}
          <div className="p-4">
            <div className="bg-danger-50 border border-danger-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-danger font-semibold">编译错误</span>
                <Chip size="sm" color="danger" variant="flat">
                  {tabInfo.language}
                </Chip>
              </div>
              <Code color="danger" className="w-full">
                {results[type].error}
              </Code>
            </div>
          </div>

          {/* 显示原始代码 */}
          {showOriginalCode && (
            <div className="flex gap-4">
              {renderCodeBlock(
                tabInfo.originalContent,
                tabInfo.language,
                `原始代码 (${tabInfo.language.toUpperCase()})`,
                'original'
              )}
            </div>
          )}
        </div>
      );
    }

    // 正常情况：显示原始代码和编译结果
    if (showComparison) {
      return (
        <div className="flex gap-4 h-full">
          {/* 原始代码 */}
          {showOriginalCode && (
            <div className="flex-1">
              {renderCodeBlock(
                tabInfo.originalContent,
                tabInfo.language,
                `原始代码 (${tabInfo.language.toUpperCase()})`,
                'original'
              )}
            </div>
          )}

          {/* 编译结果 */}
          <div className="flex-1">
            {renderCodeBlock(
              tabInfo.compiledContent,
              tabInfo.compiledLanguage,
              `${tabInfo.needsCompilation ? '编译结果' : '代码内容'} (${tabInfo.compiledLanguage.toUpperCase()})`,
              'compiled'
            )}
          </div>
        </div>
      );
    } else {
      // 只显示编译结果
      return renderCodeBlock(
        tabInfo.compiledContent,
        tabInfo.compiledLanguage,
        `${tabInfo.needsCompilation ? '编译结果' : '代码内容'} (${tabInfo.compiledLanguage.toUpperCase()})`,
        'compiled'
      );
    }
  };

  /** 渲染统计信息 */
  const renderStats = () => {
    return (
      <CompilerStats
        performance={performance}
        show={showStats}
      />
    );
  };

  /** 获取可用的编辑器类型 */
  const availableTypes = (Object.keys(EDITOR_TYPE_LABELS) as EditorType[])
    .filter(type => {
      const tabInfo = getTabInfo(type);
      return tabInfo.hasContent; // 只要有内容就显示
    });

  if (availableTypes.length === 0) {
    return (
      <Card className={className}>
        <CardBody className="flex items-center justify-center h-64">
          <div className="text-center text-default-500">
            <p className="text-lg font-semibold">没有编译结果</p>
            <p className="text-sm mt-1">请先在编辑器中输入代码并运行</p>
          </div>
        </CardBody>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between w-full">
          <h3 className="text-lg font-semibold">编译结果</h3>
          <div className="flex items-center gap-2">
            {showOriginalCode && (
              <Button
                size="sm"
                variant="flat"
                onPress={() => setShowComparison(!showComparison)}
              >
                {showComparison ? '隐藏对比' : '显示对比'}
              </Button>
            )}
            {isCompiling && (
              <Chip size="sm" color="warning" variant="flat">
                编译中...
              </Chip>
            )}
          </div>
        </div>
      </CardHeader>
      <CardBody className="p-0">
        <Tabs
          selectedKey={activeTab}
          onSelectionChange={(key) => setActiveTab(key as EditorType)}
          variant="underlined"
          classNames={{
            tabList: "gap-6 w-full relative rounded-none p-0 border-b border-divider",
            cursor: "w-full bg-primary",
            tab: "max-w-fit px-4 h-12",
            tabContent: "group-data-[selected=true]:text-primary"
          }}
        >
          {availableTypes.map((type) => {
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
                    {tabInfo.hasError && (
                      <div className="w-2 h-2 bg-danger rounded-full" />
                    )}
                    {tabInfo.needsCompilation && !tabInfo.hasError && (
                      <div className="w-2 h-2 bg-warning rounded-full" />
                    )}
                  </div>
                }
              >
                <div className="h-[400px]">
                  {renderCompileResult(type)}
                </div>
              </Tab>
            );
          })}
        </Tabs>
        {renderStats()}
      </CardBody>
    </Card>
  );
}
