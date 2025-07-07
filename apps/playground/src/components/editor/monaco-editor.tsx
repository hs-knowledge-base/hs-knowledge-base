'use client';

import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Spinner } from '@nextui-org/react';
import type { EditorConfig } from '@/types';
import { useGlobalVendorService } from '@/lib/services/vendors';
import { useEditorStore } from '@/stores/editor-store';
import { getMonacoLanguageId } from '@/utils/language-utils';
import { createMonacoConfig, updateMonacoConfig } from '@/utils/monaco-config';

// Monaco Editor 类型定义
declare global {
  interface Window {
    monaco: any;
    require: any;
  }
}

interface MonacoEditorProps {
  /** 编辑器类型 */
  editorType: 'markup' | 'style' | 'script';
  /** 编辑器配置 */
  config?: Partial<EditorConfig>;
  /** 初始值 */
  defaultValue?: string;
  /** 值变化回调 */
  onChange?: (value: string) => void;
  /** 编辑器准备就绪回调 */
  onReady?: (editor: any) => void;
  /** 自定义样式类名 */
  className?: string;
  /** 是否只读 */
  readOnly?: boolean;
  /** 是否显示行号 */
  showLineNumbers?: boolean;
  /** 是否显示小地图 */
  showMinimap?: boolean;
}

/**
 * Monaco Editor React 组件
 * 支持 SSR，自动加载 Monaco Editor 资源
 */
export function MonacoEditor({
  editorType,
  config,
  defaultValue = '',
  onChange,
  onReady,
  className = '',
  readOnly = false,
  showLineNumbers = true,
  showMinimap = false
}: MonacoEditorProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const editorRef = useRef<any>(null);
  const isUpdatingRef = useRef(false); // 防止循环更新的标志
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isMounted, setIsMounted] = useState(false);
  
  const vendorService = useGlobalVendorService();
  const { 
    configs, 
    contents, 
    setEditorContent, 
    setEditorLoaded, 
    setEditorError,
    setEditorSize 
  } = useEditorStore();

  // 获取当前编辑器配置
  const editorConfig = { ...configs[editorType], ...config };
  const currentValue = contents[editorType] || defaultValue;

  /** 加载 Monaco Editor */
  const loadMonaco = useCallback(async () => {
    try {
      setIsLoading(true);
      setLoadError(null);

      // 检查是否已经加载
      if (window.monaco) {
        return window.monaco;
      }

      // 加载 Monaco Loader
      await vendorService.loadVendor('monacoLoader');

      // 配置 Monaco 路径
      window.require.config({
        paths: {
          vs: 'https://unpkg.com/monaco-editor@0.41.0/min/vs'
        }
      });

      // 加载 Monaco Editor
      return new Promise((resolve, reject) => {
        window.require(['vs/editor/editor.main'], (monaco: any) => {
          if (monaco) {
            window.monaco = monaco;
            resolve(monaco);
          } else {
            reject(new Error('Monaco Editor 加载失败'));
          }
        }, (error: any) => {
          reject(new Error(`Monaco Editor 加载错误: ${error.message}`));
        });
      });

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '未知错误';
      setLoadError(errorMessage);
      setEditorError(errorMessage);
      throw error;
    }
  }, [vendorService, setEditorError]);

  /** 创建编辑器实例 */
  const createEditor = useCallback(async (monaco: any) => {
    if (!containerRef.current || editorRef.current) {
      return;
    }

    try {
      // 使用配置工厂创建编辑器
      const config = createMonacoConfig(editorConfig, {
        value: currentValue,
        readOnly,
        showMinimap,
        showLineNumbers
      });

      const editor = monaco.editor.create(containerRef.current, config);

      editorRef.current = editor;

      // 监听内容变化
      editor.onDidChangeModelContent(() => {
        // 如果正在更新中，跳过事件处理
        if (isUpdatingRef.current) {
          return;
        }

        const value = editor.getValue();
        setEditorContent(editorType, value);
        onChange?.(value);
      });

      // 监听尺寸变化
      editor.onDidLayoutChange(() => {
        const layout = editor.getLayoutInfo();
        setEditorSize(editorType, {
          width: layout.width,
          height: layout.height
        });
      });

      // 设置编辑器已加载
      setEditorLoaded(true);
      setIsLoading(false);

      // 触发准备就绪回调
      onReady?.(editor);

      console.info(`[MonacoEditor] 编辑器创建成功: ${editorType}`);

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '编辑器创建失败';
      setLoadError(errorMessage);
      setEditorError(errorMessage);
      setIsLoading(false);
    }
  }, [
    defaultValue,
    editorConfig.language,
    editorConfig.theme,
    editorConfig.fontSize,
    editorConfig.wordWrap,
    editorType,
    showMinimap,
    showLineNumbers,
    readOnly,
    setEditorContent,
    setEditorLoaded,
    setEditorError,
    setEditorSize,
    onChange,
    onReady
  ]);

  /** 初始化编辑器 */
  useEffect(() => {
    let mounted = true;

    const initEditor = async () => {
      try {
        const monaco = await loadMonaco();
        if (mounted && containerRef.current) {
          await createEditor(monaco);
        }
      } catch (error) {
        if (mounted) {
          console.error('[MonacoEditor] 初始化失败:', error);
        }
      }
    };

    // 只在编辑器还没有创建且容器存在时才初始化
    if (!editorRef.current && containerRef.current) {
      console.log(`[MonacoEditor] ${editorType} - 开始初始化编辑器`);
      initEditor();
    }

    return () => {
      mounted = false;
      // 不在这里销毁编辑器，让编辑器实例保持存在
    };
  }, [isMounted, editorType]); // 添加必要的依赖

  /** 组件卸载时清理编辑器 */
  useEffect(() => {
    return () => {
      if (editorRef.current) {
        console.log(`[MonacoEditor] ${editorType} - 销毁编辑器`);
        editorRef.current.dispose();
        editorRef.current = null;
      }
    };
  }, []); // 只在组件真正卸载时执行

  /** 更新编辑器配置 */
  useEffect(() => {
    if (editorRef.current && window.monaco) {
      const editor = editorRef.current;
      
      // 更新语言
      const model = editor.getModel();
      if (model) {
        window.monaco.editor.setModelLanguage(model, getMonacoLanguageId(editorConfig.language));
      }

      // 使用配置工厂更新编辑器
      updateMonacoConfig(editor, editorConfig, {
        showMinimap,
        showLineNumbers
      });
    }
  }, [editorConfig, showMinimap, showLineNumbers, readOnly]);

  /** 更新编辑器内容 */
  useEffect(() => {
    if (editorRef.current && currentValue !== editorRef.current.getValue()) {
      // 设置更新标志，防止触发 onDidChangeModelContent 事件
      isUpdatingRef.current = true;
      editorRef.current.setValue(currentValue);
      // 延迟重置标志，确保事件处理完成
      setTimeout(() => {
        isUpdatingRef.current = false;
      }, 0);
    }
  }, [currentValue]);

  // 客户端挂载检查
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // 只在客户端渲染
  if (typeof window === 'undefined' || !isMounted) {
    return (
      <div className={`${className} bg-gray-900 flex items-center justify-center`}>
        <div className="text-center">
          <Spinner size="lg" color="primary" />
          <p className="mt-2 text-gray-400">编辑器加载中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`${className} bg-gray-900 relative h-full`}>
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-900/90 z-10">
          <div className="text-center">
            <Spinner size="lg" color="primary" />
            <p className="mt-2 text-gray-400">Monaco Editor 加载中...</p>
          </div>
        </div>
      )}

      {loadError && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-900/90 z-10">
          <div className="text-center text-red-400">
            <p className="font-semibold">编辑器加载失败</p>
            <p className="text-sm mt-1">{loadError}</p>
          </div>
        </div>
      )}

      <div
        ref={containerRef}
        className="w-full h-full bg-gray-900"
        style={{ height: '100%', minHeight: '400px' }}
      />
    </div>
  );
}
