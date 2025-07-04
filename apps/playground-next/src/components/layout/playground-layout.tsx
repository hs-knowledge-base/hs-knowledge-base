'use client';

import React, { useState, useRef, useCallback } from 'react';
import { Card, CardBody, Button, Tooltip } from '@nextui-org/react';
import { useLayoutStore } from '@/stores/layout-store';

interface PlaygroundLayoutProps {
  /** 编辑器面板 */
  editorPanel: React.ReactNode;
  /** 预览面板 */
  previewPanel: React.ReactNode;
  /** 控制台面板 */
  consolePanel: React.ReactNode;
  /** 编译结果面板 */
  compilerPanel?: React.ReactNode;
  /** 自定义样式类名 */
  className?: string;
}

/**
 * Playground 主布局组件
 * 支持响应式布局、面板拖拽调整、全屏模式
 */
export function PlaygroundLayout({
  editorPanel,
  previewPanel,
  consolePanel,
  compilerPanel,
  className = ''
}: PlaygroundLayoutProps) {
  const { config, setDirection, togglePreview, toggleConsole, toggleFullscreen } = useLayoutStore();
  const [isDragging, setIsDragging] = useState(false);
  const [editorWidth, setEditorWidth] = useState(50); // 编辑器宽度百分比
  const [previewHeight, setPreviewHeight] = useState(60); // 预览高度百分比
  const dragRef = useRef<{ startX: number; startWidth: number } | null>(null);
  const verticalDragRef = useRef<{ startY: number; startHeight: number } | null>(null);

  /** 处理水平拖拽开始 */
  const handleHorizontalDragStart = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    dragRef.current = {
      startX: e.clientX,
      startWidth: editorWidth
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!dragRef.current) return;
      
      const deltaX = e.clientX - dragRef.current.startX;
      const containerWidth = window.innerWidth;
      const deltaPercent = (deltaX / containerWidth) * 100;
      const newWidth = Math.max(20, Math.min(80, dragRef.current.startWidth + deltaPercent));
      
      setEditorWidth(newWidth);
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      dragRef.current = null;
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  }, [editorWidth]);

  /** 处理垂直拖拽开始 */
  const handleVerticalDragStart = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    verticalDragRef.current = {
      startY: e.clientY,
      startHeight: previewHeight
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!verticalDragRef.current) return;
      
      const deltaY = e.clientY - verticalDragRef.current.startY;
      const containerHeight = window.innerHeight;
      const deltaPercent = (deltaY / containerHeight) * 100;
      const newHeight = Math.max(30, Math.min(80, verticalDragRef.current.startHeight + deltaPercent));
      
      setPreviewHeight(newHeight);
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      verticalDragRef.current = null;
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  }, [previewHeight]);

  /** 渲染工具栏 */
  const renderToolbar = () => (
    <div className="flex items-center justify-between p-2 border-b border-divider bg-content1">
      <div className="flex items-center gap-2">
        <span className="text-sm font-semibold text-default-700">Code Playground</span>
      </div>
      
      <div className="flex items-center gap-1">
        {/* 布局方向切换 */}
        <Tooltip content="切换布局方向">
          <Button
            size="sm"
            variant="light"
            onPress={() => setDirection(config.direction === 'horizontal' ? 'vertical' : 'horizontal')}
          >
            {config.direction === 'horizontal' ? '⚏' : '⚍'}
          </Button>
        </Tooltip>

        {/* 预览面板切换 */}
        <Tooltip content={config.showPreview ? '隐藏预览' : '显示预览'}>
          <Button
            size="sm"
            variant="light"
            color={config.showPreview ? 'primary' : 'default'}
            onPress={togglePreview}
          >
            👁️
          </Button>
        </Tooltip>

        {/* 控制台面板切换 */}
        <Tooltip content={config.showConsole ? '隐藏控制台' : '显示控制台'}>
          <Button
            size="sm"
            variant="light"
            color={config.showConsole ? 'primary' : 'default'}
            onPress={toggleConsole}
          >
            📟
          </Button>
        </Tooltip>

        {/* 全屏模式切换 */}
        <Tooltip content={config.isFullscreen ? '退出全屏' : '进入全屏'}>
          <Button
            size="sm"
            variant="light"
            color={config.isFullscreen ? 'warning' : 'default'}
            onPress={toggleFullscreen}
          >
            {config.isFullscreen ? '⛶' : '⛶'}
          </Button>
        </Tooltip>
      </div>
    </div>
  );

  /** 渲染水平布局 */
  const renderHorizontalLayout = () => (
    <div className="flex h-full">
      {/* 编辑器面板 */}
      <div 
        className="flex-shrink-0 border-r border-divider"
        style={{ width: `${editorWidth}%` }}
      >
        {editorPanel}
      </div>

      {/* 拖拽分隔条 */}
      <div
        className={`w-1 bg-divider hover:bg-primary cursor-col-resize flex-shrink-0 ${
          isDragging ? 'bg-primary' : ''
        }`}
        onMouseDown={handleHorizontalDragStart}
      />

      {/* 右侧面板 */}
      <div className="flex-1 flex flex-col">
        {config.showPreview && (
          <>
            <div 
              className="flex-shrink-0"
              style={{ height: `${previewHeight}%` }}
            >
              {previewPanel}
            </div>
            
            {config.showConsole && (
              <>
                {/* 垂直拖拽分隔条 */}
                <div
                  className={`h-1 bg-divider hover:bg-primary cursor-row-resize flex-shrink-0 ${
                    isDragging ? 'bg-primary' : ''
                  }`}
                  onMouseDown={handleVerticalDragStart}
                />
                
                <div className="flex-1">
                  {consolePanel}
                </div>
              </>
            )}
          </>
        )}
        
        {!config.showPreview && config.showConsole && (
          <div className="flex-1">
            {consolePanel}
          </div>
        )}
      </div>
    </div>
  );

  /** 渲染垂直布局 */
  const renderVerticalLayout = () => (
    <div className="flex flex-col h-full">
      {/* 编辑器面板 */}
      <div 
        className="flex-shrink-0 border-b border-divider"
        style={{ height: `${editorWidth}%` }}
      >
        {editorPanel}
      </div>

      {/* 拖拽分隔条 */}
      <div
        className={`h-1 bg-divider hover:bg-primary cursor-row-resize flex-shrink-0 ${
          isDragging ? 'bg-primary' : ''
        }`}
        onMouseDown={handleHorizontalDragStart}
      />

      {/* 下方面板 */}
      <div className="flex-1 flex">
        {config.showPreview && (
          <>
            <div 
              className="flex-shrink-0"
              style={{ width: `${previewHeight}%` }}
            >
              {previewPanel}
            </div>
            
            {config.showConsole && (
              <>
                <div className="w-1 bg-divider hover:bg-primary cursor-col-resize flex-shrink-0" />
                <div className="flex-1">
                  {consolePanel}
                </div>
              </>
            )}
          </>
        )}
        
        {!config.showPreview && config.showConsole && (
          <div className="flex-1">
            {consolePanel}
          </div>
        )}
      </div>
    </div>
  );

  return (
    <Card className={`h-screen ${config.isFullscreen ? 'fixed inset-0 z-50' : ''} ${className}`}>
      <CardBody className="p-0 h-full flex flex-col">
        {/* 工具栏 */}
        {renderToolbar()}
        
        {/* 主要内容区域 */}
        <div className="flex-1 overflow-hidden">
          {config.direction === 'horizontal' ? renderHorizontalLayout() : renderVerticalLayout()}
        </div>
        
        {/* 编译结果面板（可选） */}
        {compilerPanel && (
          <div className="border-t border-divider">
            {compilerPanel}
          </div>
        )}
      </CardBody>
    </Card>
  );
}
