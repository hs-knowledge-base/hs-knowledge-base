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
  Tooltip
} from '@nextui-org/react';
import { useCompilerStore } from '@/stores/compiler-store';
import { useEditorStore } from '@/stores/editor-store';
import { useGlobalLanguageService } from '@/lib/services/language-service';
import type { EditorType } from '@/types';

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

  /** 获取标签信息 */
  const getTabInfo = (type: EditorType) => {
    const result = results[type];
    const content = contents[type];
    const config = configs[type];
    const hasContent = content.trim().length > 0;
    const hasResult = result.code.trim().length > 0;
    const hasError = !!result.error;
    const needsCompilation = languageService.needsCompiler(config.language);

    return {
      title: getTabTitle(type),
      language: config.language,
      hasContent,
      hasResult,
      hasError,
      needsCompilation,
      originalSize: content.length,
      compiledSize: result.code.length
    };
  };

  /** 获取标签标题 */
  const getTabTitle = (type: EditorType): string => {
    const titles = {
      markup: 'Markup',
      style: 'Style',
      script: 'Script'
    };
    return titles[type];
  };

  /** 复制代码到剪贴板 */
  const copyToClipboard = async (text: string, type: 'original' | 'compiled') => {
    try {
      await navigator.clipboard.writeText(text);
      // 这里可以添加成功提示
    } catch (error) {
      console.error('复制失败:', error);
    }
  };

  /** 渲染代码块 */
  const renderCodeBlock = (code: string, language: string, title: string, type: 'original' | 'compiled') => {
    const isEmpty = !code.trim();
    
    return (
      <div className="flex-1">
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
                onPress={() => copyToClipboard(code, type)}
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
  };

  /** 渲染编译结果 */
  const renderCompileResult = (type: EditorType) => {
    const tabInfo = getTabInfo(type);
    const result = results[type];
    const content = contents[type];
    const config = configs[type];

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

    // 如果有编译错误，显示错误信息
    if (tabInfo.hasError) {
      return (
        <div className="p-4">
          <div className="bg-danger-50 border border-danger-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-danger font-semibold">编译错误</span>
              <Chip size="sm" color="danger" variant="flat">
                {config.language}
              </Chip>
            </div>
            <Code color="danger" className="w-full">
              {result.error}
            </Code>
          </div>
        </div>
      );
    }

    // 如果不需要编译，显示提示
    if (!tabInfo.needsCompilation) {
      return (
        <div className="p-4">
          <div className="bg-success-50 border border-success-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-success font-semibold">无需编译</span>
              <Chip size="sm" color="success" variant="flat">
                {config.language}
              </Chip>
            </div>
            <p className="text-sm text-success-600">
              {config.language.toUpperCase()} 是原生支持的语言，无需编译转换。
            </p>
          </div>
        </div>
      );
    }

    // 显示编译结果对比
    if (showComparison && showOriginalCode) {
      return (
        <div className="flex gap-1 h-full">
          {renderCodeBlock(content, config.language, '原代码', 'original')}
          <Divider orientation="vertical" />
          {renderCodeBlock(result.code, 'javascript', '编译结果', 'compiled')}
        </div>
      );
    }

    // 只显示编译结果
    return (
      <div className="h-full">
        {renderCodeBlock(result.code, 'javascript', '编译结果', 'compiled')}
      </div>
    );
  };

  /** 渲染统计信息 */
  const renderStats = () => {
    if (!showStats) return null;

    return (
      <div className="p-4 border-t border-divider bg-content2">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div>
            <div className="text-lg font-bold text-primary">
              {performance.totalCompiles}
            </div>
            <div className="text-xs text-default-500">总编译次数</div>
          </div>
          <div>
            <div className="text-lg font-bold text-success">
              {performance.successfulCompiles}
            </div>
            <div className="text-xs text-default-500">成功次数</div>
          </div>
          <div>
            <div className="text-lg font-bold text-danger">
              {performance.failedCompiles}
            </div>
            <div className="text-xs text-default-500">失败次数</div>
          </div>
          <div>
            <div className="text-lg font-bold text-warning">
              {performance.averageCompileTime.toFixed(0)}ms
            </div>
            <div className="text-xs text-default-500">平均耗时</div>
          </div>
        </div>
      </div>
    );
  };

  /** 获取可用的编辑器类型 */
  const availableTypes = (['markup', 'style', 'script'] as EditorType[])
    .filter(type => {
      const tabInfo = getTabInfo(type);
      return tabInfo.hasContent || tabInfo.hasResult;
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
