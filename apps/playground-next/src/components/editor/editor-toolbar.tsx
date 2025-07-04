'use client';

import React from 'react';
import {
  Button,
  ButtonGroup,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Switch,
  Tooltip,
  Divider
} from '@nextui-org/react';
import { SimpleLanguageSelector } from './language-selector';
import { useEditorStore } from '@/stores/editor-store';
import { usePlaygroundStore } from '@/stores/playground-store';
import type { EditorType } from '@/types';

interface EditorToolbarProps {
  /** 编辑器类型 */
  editorType: EditorType;
  /** 自定义样式类名 */
  className?: string;
  /** 是否显示运行按钮 */
  showRunButton?: boolean;
  /** 是否显示设置按钮 */
  showSettings?: boolean;
  /** 是否紧凑模式 */
  compact?: boolean;
}

/**
 * 编辑器工具栏组件
 * 包含语言选择、格式化、设置等功能
 */
export function EditorToolbar({
  editorType,
  className = '',
  showRunButton = true,
  showSettings = true,
  compact = false
}: EditorToolbarProps) {
  const {
    configs,
    contents,
    errors,
    setEditorLanguage,
    setEditorConfig,
    formatCode,
    resetEditor,
    insertText
  } = useEditorStore();

  const { runCode, runStatus } = usePlaygroundStore();

  const config = configs[editorType];
  const content = contents[editorType];
  const hasContent = content.trim().length > 0;
  const hasErrors = errors[editorType].length > 0;
  const isRunning = runStatus === 'compiling' || runStatus === 'running';

  /** 处理语言变化 */
  const handleLanguageChange = (language: any) => {
    setEditorLanguage(editorType, language);
  };

  /** 处理格式化代码 */
  const handleFormatCode = () => {
    formatCode(editorType);
  };

  /** 处理重置编辑器 */
  const handleResetEditor = () => {
    if (confirm('确定要重置编辑器内容吗？此操作不可撤销。')) {
      resetEditor(editorType);
    }
  };

  /** 处理运行代码 */
  const handleRunCode = () => {
    runCode();
  };

  /** 处理插入代码片段 */
  const handleInsertSnippet = (snippet: string) => {
    insertText(editorType, snippet);
  };

  /** 处理编辑器设置变化 */
  const handleSettingChange = (key: string, value: any) => {
    setEditorConfig(editorType, { [key]: value });
  };

  /** 获取代码片段 */
  const getCodeSnippets = () => {
    const snippets = {
      markup: [
        { key: 'html5', label: 'HTML5 模板', code: '<!DOCTYPE html>\n<html lang="zh-CN">\n<head>\n    <meta charset="UTF-8">\n    <meta name="viewport" content="width=device-width, initial-scale=1.0">\n    <title>Document</title>\n</head>\n<body>\n    \n</body>\n</html>' },
        { key: 'div', label: 'Div 容器', code: '<div class="container">\n    \n</div>' },
        { key: 'form', label: '表单', code: '<form>\n    <input type="text" placeholder="输入内容">\n    <button type="submit">提交</button>\n</form>' }
      ],
      style: [
        { key: 'reset', label: 'CSS 重置', code: '* {\n    margin: 0;\n    padding: 0;\n    box-sizing: border-box;\n}' },
        { key: 'flexbox', label: 'Flexbox 布局', code: '.container {\n    display: flex;\n    justify-content: center;\n    align-items: center;\n    height: 100vh;\n}' },
        { key: 'grid', label: 'Grid 布局', code: '.grid {\n    display: grid;\n    grid-template-columns: repeat(3, 1fr);\n    gap: 1rem;\n}' }
      ],
      script: [
        { key: 'function', label: '函数', code: 'function myFunction() {\n    // 代码逻辑\n    return result;\n}' },
        { key: 'async', label: '异步函数', code: 'async function fetchData() {\n    try {\n        const response = await fetch(url);\n        const data = await response.json();\n        return data;\n    } catch (error) {\n        console.error(error);\n    }\n}' },
        { key: 'class', label: '类', code: 'class MyClass {\n    constructor() {\n        this.property = value;\n    }\n    \n    method() {\n        // 方法逻辑\n    }\n}' }
      ]
    };
    return snippets[editorType] || [];
  };

  return (
    <div className={`flex items-center gap-2 p-2 border-b border-divider bg-content1 ${className}`}>
      {/* 语言选择器 */}
      <div className={compact ? 'min-w-32' : 'min-w-40'}>
        <SimpleLanguageSelector
          editorType={editorType}
          value={config.language}
          onChange={handleLanguageChange}
          size={compact ? 'sm' : 'md'}
        />
      </div>

      <Divider orientation="vertical" className="h-6" />

      {/* 编辑器操作按钮 */}
      <ButtonGroup size={compact ? 'sm' : 'md'} variant="flat">
        <Tooltip content="格式化代码">
          <Button
            onClick={handleFormatCode}
            isDisabled={!hasContent}
          >
            格式化
          </Button>
        </Tooltip>

        <Tooltip content="重置编辑器">
          <Button
            color="warning"
            onClick={handleResetEditor}
            isDisabled={!hasContent}
          >
            重置
          </Button>
        </Tooltip>
      </ButtonGroup>

      {/* 代码片段 */}
      <Dropdown>
        <DropdownTrigger>
          <Button variant="flat" size={compact ? 'sm' : 'md'}>
            插入片段
          </Button>
        </DropdownTrigger>
        <DropdownMenu
          aria-label="代码片段"
          onAction={(key) => {
            const snippet = getCodeSnippets().find(s => s.key === key);
            if (snippet) {
              handleInsertSnippet(snippet.code);
            }
          }}
        >
          {getCodeSnippets().map((snippet) => (
            <DropdownItem key={snippet.key}>
              {snippet.label}
            </DropdownItem>
          ))}
        </DropdownMenu>
      </Dropdown>

      {/* 编辑器设置 */}
      {showSettings && (
        <Dropdown>
          <DropdownTrigger>
            <Button variant="light" size={compact ? 'sm' : 'md'}>
              设置
            </Button>
          </DropdownTrigger>
          <DropdownMenu aria-label="编辑器设置" closeOnSelect={false}>
            <DropdownItem key="wordWrap" textValue="自动换行">
              <div className="flex items-center justify-between w-full">
                <span>自动换行</span>
                <Switch
                  size="sm"
                  isSelected={config.wordWrap}
                  onValueChange={(value) => handleSettingChange('wordWrap', value)}
                />
              </div>
            </DropdownItem>
            <DropdownItem key="lineNumbers" textValue="行号">
              <div className="flex items-center justify-between w-full">
                <span>显示行号</span>
                <Switch
                  size="sm"
                  isSelected={config.lineNumbers}
                  onValueChange={(value) => handleSettingChange('lineNumbers', value)}
                />
              </div>
            </DropdownItem>
            <DropdownItem key="minimap" textValue="小地图">
              <div className="flex items-center justify-between w-full">
                <span>显示小地图</span>
                <Switch
                  size="sm"
                  isSelected={config.minimap}
                  onValueChange={(value) => handleSettingChange('minimap', value)}
                />
              </div>
            </DropdownItem>
          </DropdownMenu>
        </Dropdown>
      )}

      {/* 状态指示器 */}
      <div className="flex items-center gap-2 ml-auto">
        {hasErrors && (
          <Tooltip content={`${errors[editorType].length} 个错误`}>
            <div className="flex items-center gap-1 text-danger text-sm">
              <div className="w-2 h-2 bg-danger rounded-full" />
              <span>{errors[editorType].length}</span>
            </div>
          </Tooltip>
        )}

        {hasContent && !hasErrors && (
          <Tooltip content="代码正常">
            <div className="flex items-center gap-1 text-success text-sm">
              <div className="w-2 h-2 bg-success rounded-full" />
              <span>正常</span>
            </div>
          </Tooltip>
        )}
      </div>

      {/* 运行按钮 */}
      {showRunButton && (
        <>
          <Divider orientation="vertical" className="h-6" />
          <Button
            color="primary"
            onClick={handleRunCode}
            isLoading={isRunning}
            size={compact ? 'sm' : 'md'}
          >
            {isRunning ? '运行中...' : '运行代码'}
          </Button>
        </>
      )}
    </div>
  );
}
