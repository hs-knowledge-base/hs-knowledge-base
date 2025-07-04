'use client';

import { Button, Card, CardBody, CardHeader, Chip, Spinner, Tabs, Tab } from '@nextui-org/react';
import { usePlaygroundStore } from '@/stores/playground-store';
import { useLayoutStore } from '@/stores/layout-store';
import { useGlobalServiceContainer } from '@/lib/core/service-container';
import { useConfigManager } from '@/lib/core/config-manager';
import { useGlobalLanguageService } from '@/lib/services/language-service';
import { useGlobalEventEmitter } from '@/lib/core/events';
import { useGlobalVendorService } from '@/lib/services/vendors';
import { useGlobalResourceLoader } from '@/lib/services/resource-loader';
import dynamic from 'next/dynamic';
import { useEditorStore } from '@/stores/editor-store';
import { useCompilerStore } from '@/stores/compiler-store';
import { useCompilerInitialization } from '@/lib/compiler/compiler-registry';

// 动态导入编辑器相关组件，避免 SSR 问题
const EditorPanel = dynamic(() => import('@/components/editor/editor-panel').then(mod => ({ default: mod.EditorPanel })), {
  ssr: false,
  loading: () => (
    <Card className="h-[500px]">
      <CardBody className="flex items-center justify-center">
        <div className="text-center">
          <Spinner size="lg" />
          <p className="mt-2 text-default-500">编辑器加载中...</p>
        </div>
      </CardBody>
    </Card>
  )
});

const CompilerOutput = dynamic(() => import('@/components/playground/compiler-output').then(mod => ({ default: mod.CompilerOutput })), {
  ssr: false,
  loading: () => (
    <Card className="h-[600px]">
      <CardBody className="flex items-center justify-center">
        <div className="text-center">
          <Spinner size="lg" />
          <p className="mt-2 text-default-500">编译器加载中...</p>
        </div>
      </CardBody>
    </Card>
  )
});

const SimplePreview = dynamic(() => import('@/components/playground/simple-preview').then(mod => ({ default: mod.SimplePreview })), {
  ssr: false,
  loading: () => (
    <div className="h-full bg-white flex items-center justify-center">
      <div className="text-center">
        <Spinner size="lg" />
        <p className="mt-2 text-gray-500">预览加载中...</p>
      </div>
    </div>
  )
});

const SimpleConsole = dynamic(() => import('@/components/playground/simple-console').then(mod => ({ default: mod.SimpleConsole })), {
  ssr: false,
  loading: () => (
    <div className="h-full bg-gray-900 flex items-center justify-center">
      <div className="text-center">
        <Spinner size="lg" />
        <p className="mt-2 text-gray-400">控制台加载中...</p>
      </div>
    </div>
  )
});

export default function Home() {
  const { addConsoleMessage, clearConsole } = usePlaygroundStore();

  /** 处理运行代码 */
  const handleRunCode = () => {
    // 清空控制台
    clearConsole();

    // 添加运行开始消息
    addConsoleMessage({
      type: 'info',
      message: '🚀 开始运行代码...'
    });

    // 触发预览刷新（通过重新渲染实现）
    setTimeout(() => {
      addConsoleMessage({
        type: 'log',
        message: '✅ 代码运行完成！'
      });
    }, 500);
  };

  return (
    <div className="h-screen bg-gray-900 text-gray-100 flex flex-col">
      {/* 顶部工具栏 */}
      <div className="h-12 bg-gray-800 border-b border-gray-700 flex items-center justify-between px-4">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
            <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
          </div>
          <div className="text-sm font-medium text-gray-300">
            🔥 火山知识库 - 代码演练场
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="flat"
            className="bg-blue-600 text-white hover:bg-blue-700"
            onPress={handleRunCode}
          >
            🚀 运行
          </Button>
          <Button size="sm" variant="flat" className="bg-gray-700 text-gray-300">
            分享
          </Button>
          <Button size="sm" variant="flat" className="bg-gray-700 text-gray-300">
            设置
          </Button>
        </div>
      </div>

      {/* 主要内容区域 */}
      <div className="flex-1 flex">
        {/* 左侧：代码编辑区域 */}
        <div className="w-1/2 bg-gray-900 border-r border-gray-700 flex flex-col">
          <EditorPanel
            className="h-full"
            showToolbar={true}
            defaultActiveEditor="markup"
          />
        </div>

        {/* 右侧：预览和控制台区域 */}
        <div className="w-1/2 flex flex-col bg-gray-850">
          {/* 上半部分：预览区域 */}
          <div className="h-1/2 border-b border-gray-700">
            <div className="h-full bg-gray-800">
              <div className="flex items-center justify-between px-4 py-2 bg-gray-800 border-b border-gray-700">
                <h3 className="text-sm font-medium text-gray-300">预览</h3>
                <Button
                  size="sm"
                  variant="flat"
                  className="bg-blue-600 text-white hover:bg-blue-700"
                  onPress={handleRunCode}
                >
                  🚀 运行
                </Button>
              </div>
              <div className="h-[calc(100%-40px)]">
                <SimplePreview className="h-full" />
              </div>
            </div>
          </div>

          {/* 下半部分：控制台和编译结果标签页 */}
          <div className="h-1/2">
            <Tabs
              aria-label="输出标签"
              variant="underlined"
              classNames={{
                tabList: "gap-6 w-full relative rounded-none p-0 border-b border-gray-700 bg-gray-800",
                cursor: "w-full bg-blue-500",
                tab: "max-w-fit px-4 h-10",
                tabContent: "group-data-[selected=true]:text-blue-400 text-gray-400"
              }}
            >
              <Tab
                key="console"
                title={
                  <div className="flex items-center gap-2">
                    <span>📟</span>
                    <span>控制台</span>
                  </div>
                }
              >
                <div className="h-[calc(100%-40px)]">
                  <SimpleConsole className="h-full" />
                </div>
              </Tab>
              <Tab
                key="compiled"
                title={
                  <div className="flex items-center gap-2">
                    <span>🔧</span>
                    <span>编译结果</span>
                  </div>
                }
              >
                <div className="h-[calc(100%-40px)]">
                  <CompilerOutput
                    className="h-full"
                    showOriginalCode={false}
                    showStats={true}
                    defaultActiveTab="markup"
                  />
                </div>
              </Tab>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
}
