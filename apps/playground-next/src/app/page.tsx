'use client';

import { Button, Card, CardBody, Spinner, Tabs, Tab } from '@nextui-org/react';
import { usePlaygroundStore } from '@/stores/playground-store';
import { useEditorStore } from '@/stores/editor-store';
import { useCompile } from '@/lib/compiler/compiler-factory';
import dynamic from 'next/dynamic';
import { useEffect } from 'react';

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

const EnhancedConsole = dynamic(() => import('@/components/playground/enhanced-console').then(mod => ({ default: mod.EnhancedConsole })), {
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

// 动态导入执行引擎组件，避免 SSR 问题
const ExecutionEngine = dynamic(() => import('@/lib/execution/execution-engine').then(mod => ({ default: mod.ExecutionEngine })), {
  ssr: false,
  loading: () => (
    <Card className="h-[600px]">
      <CardBody className="flex items-center justify-center">
        <div className="text-center">
          <Spinner size="lg" />
          <p className="mt-2 text-default-500">执行引擎加载中...</p>
        </div>
      </CardBody>
    </Card>
  )
});

export default function Home() {
  const { addConsoleMessage, clearConsole, setRunStatus, triggerManualRun } = usePlaygroundStore();
  const { contents, configs } = useEditorStore();
  const { compile, factory } = useCompile();

  // 确保编译器工厂已初始化
  useEffect(() => {
    const initializeFactory = async () => {
      try {
        await factory.initialize();
        console.log('[Home] 编译器工厂初始化完成');
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : '编译器初始化失败';
        console.error('[Home] 编译器工厂初始化失败:', error);
        addConsoleMessage({
          type: 'error',
          message: `❌ 编译器初始化失败: ${errorMessage}`
        });
      }
    };

    initializeFactory();
  }, [factory, addConsoleMessage]);

  /** 处理运行代码 */
  const handleRunCode = async () => {
    try {
      // 清空控制台
      clearConsole();
      setRunStatus('compiling');

      // 添加运行开始消息
      addConsoleMessage({
        type: 'info',
        message: '🔄 开始编译代码...'
      });

      // 确保编译器工厂已完全初始化
      if (!factory.initialized) {
        addConsoleMessage({
          type: 'info',
          message: '⏳ 正在初始化编译器...'
        });
        await factory.initialize();
      }

      // 编译所有代码
      const compilePromises = [
        compile(contents.markup, configs.markup.language, 'markup'),
        compile(contents.style, configs.style.language, 'style'),
        compile(contents.script, configs.script.language, 'script')
      ];

      const compileResults = await Promise.all(compilePromises);

      // 检查编译错误
      const errors = compileResults.filter(result => result.error);
      if (errors.length > 0) {
        const errorMessages = errors.map(result => result.error).join('\n');
        throw new Error(`编译失败:\n${errorMessages}`);
      }

      addConsoleMessage({
        type: 'log',
        message: '✅ 代码编译成功'
      });

      setRunStatus('running');
      addConsoleMessage({
        type: 'info',
        message: '🚀 开始运行代码...'
      });

      // 触发手动运行 - 通过状态管理
      triggerManualRun();

      setTimeout(() => {
        setRunStatus('success');
        addConsoleMessage({
          type: 'log',
          message: '✅ 代码运行成功'
        });
      }, 500);

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '运行失败';
      setRunStatus('error');
      addConsoleMessage({
        type: 'error',
        message: `❌ ${errorMessage}`
      });
    }
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
            运行
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
                <h3 className="text-sm font-medium text-gray-300">多语言预览</h3>
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
                <ExecutionEngine className="h-full" />
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
                  <EnhancedConsole className="h-full" />
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
