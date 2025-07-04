'use client';

import { Button, Card, CardBody, CardHeader, Chip, Spinner } from '@nextui-org/react';
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

const CodeRunner = dynamic(() => import('@/components/playground/code-runner').then(mod => ({ default: mod.CodeRunner })), {
  ssr: false,
  loading: () => (
    <Card className="h-[500px]">
      <CardBody className="flex items-center justify-center">
        <div className="text-center">
          <Spinner size="lg" />
          <p className="mt-2 text-default-500">运行器加载中...</p>
        </div>
      </CardBody>
    </Card>
  )
});

export default function Home() {

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
          <Button size="sm" variant="flat" className="bg-gray-700 text-gray-300">
            运行
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
            <CodeRunner
              className="h-full"
              autoRun={false}
              runDelay={1000}
            />
          </div>

          {/* 下半部分：控制台和编译结果 */}
          <div className="h-1/2">
            <CompilerOutput
              className="h-full"
              showOriginalCode={false}
              showStats={true}
              defaultActiveTab="markup"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
