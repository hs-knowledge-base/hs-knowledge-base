'use client';

import { Button, Card, CardBody, CardHeader } from '@nextui-org/react';
import { usePlaygroundStore } from '@/stores/playground-store';
import { useLayoutStore } from '@/stores/layout-store';

export default function Home() {
  const { runStatus, consoleMessages, runCode, addConsoleMessage } = usePlaygroundStore();
  const { config, setDirection, togglePreview } = useLayoutStore();

  const handleTestRun = () => {
    addConsoleMessage({
      type: 'log',
      message: '🚀 测试消息：Next.js + NextUI + Zustand 集成成功！'
    });
    runCode();
  };

  return (
    <div className="min-h-screen bg-background text-foreground p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* 标题 */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">
            Code Playground
          </h1>
          <p className="text-lg text-default-500">
            基于 Next.js + TypeScript + Tailwind CSS + NextUI 构建
          </p>
        </div>

        {/* 状态卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <h3 className="text-lg font-semibold">运行状态</h3>
            </CardHeader>
            <CardBody>
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${
                  runStatus === 'idle' ? 'bg-gray-400' :
                  runStatus === 'compiling' ? 'bg-yellow-400' :
                  runStatus === 'running' ? 'bg-blue-400' :
                  runStatus === 'success' ? 'bg-green-400' :
                  'bg-red-400'
                }`} />
                <span className="capitalize">{runStatus}</span>
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <h3 className="text-lg font-semibold">布局方向</h3>
            </CardHeader>
            <CardBody>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant={config.direction === 'horizontal' ? 'solid' : 'bordered'}
                  onClick={() => setDirection('horizontal')}
                >
                  水平
                </Button>
                <Button
                  size="sm"
                  variant={config.direction === 'vertical' ? 'solid' : 'bordered'}
                  onClick={() => setDirection('vertical')}
                >
                  垂直
                </Button>
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <h3 className="text-lg font-semibold">控制台消息</h3>
            </CardHeader>
            <CardBody>
              <span className="text-2xl font-bold text-primary">
                {consoleMessages.length}
              </span>
            </CardBody>
          </Card>
        </div>

        {/* 测试按钮 */}
        <div className="flex justify-center gap-4">
          <Button
            color="primary"
            size="lg"
            onClick={handleTestRun}
            isLoading={runStatus === 'compiling' || runStatus === 'running'}
          >
            测试运行
          </Button>
          <Button
            variant="bordered"
            size="lg"
            onClick={togglePreview}
          >
            切换预览: {config.showPreview ? '开启' : '关闭'}
          </Button>
        </div>

        {/* 控制台消息 */}
        {consoleMessages.length > 0 && (
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold">控制台输出</h3>
            </CardHeader>
            <CardBody>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {consoleMessages.map((message) => (
                  <div
                    key={message.id}
                    className={`p-2 rounded text-sm font-mono ${
                      message.type === 'error' ? 'bg-red-500/10 text-red-400' :
                      message.type === 'warn' ? 'bg-yellow-500/10 text-yellow-400' :
                      'bg-blue-500/10 text-blue-400'
                    }`}
                  >
                    <span className="text-xs text-default-400">
                      {new Date(message.timestamp).toLocaleTimeString()}
                    </span>
                    <br />
                    {message.message}
                  </div>
                ))}
              </div>
            </CardBody>
          </Card>
        )}

        {/* 迁移进度 */}
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold">🚀 迁移进度</h3>
          </CardHeader>
          <CardBody>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs">✓</span>
                </div>
                <span>阶段一：项目初始化和基础设置</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 bg-yellow-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs">⚡</span>
                </div>
                <span>阶段二：核心系统迁移 (进行中)</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 bg-gray-400 rounded-full"></div>
                <span className="text-default-400">阶段三：编辑器系统重构</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 bg-gray-400 rounded-full"></div>
                <span className="text-default-400">阶段四：编译器系统适配</span>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
