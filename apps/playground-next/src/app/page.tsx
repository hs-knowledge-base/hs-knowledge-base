'use client';

import { Button, Card, CardBody, CardHeader, Chip } from '@nextui-org/react';
import { usePlaygroundStore } from '@/stores/playground-store';
import { useLayoutStore } from '@/stores/layout-store';
import { useGlobalServiceContainer } from '@/lib/core/service-container';
import { useConfigManager } from '@/lib/core/config-manager';
import { useGlobalLanguageService } from '@/lib/services/language-service';
import { useGlobalEventEmitter } from '@/lib/core/events';
import { useGlobalVendorService } from '@/lib/services/vendors';
import { useGlobalResourceLoader } from '@/lib/services/resource-loader';
import { useEditorStore } from '@/stores/editor-store';
import { useCompilerStore } from '@/stores/compiler-store';

export default function Home() {
  const { runStatus, consoleMessages, runCode, addConsoleMessage } = usePlaygroundStore();
  const { config, setDirection, togglePreview } = useLayoutStore();

  // 测试核心服务
  const serviceContainer = useGlobalServiceContainer();
  const configManager = useConfigManager();
  const languageService = useGlobalLanguageService();
  const eventEmitter = useGlobalEventEmitter();
  const vendorService = useGlobalVendorService();
  const resourceLoader = useGlobalResourceLoader();

  // 测试状态管理
  const { configs: editorConfigs, isLoaded: editorLoaded } = useEditorStore();
  const { isCompiling, results: compileResults } = useCompilerStore();

  const handleTestRun = () => {
    addConsoleMessage({
      type: 'log',
      message: '🚀 测试消息：Next.js + NextUI + Zustand 集成成功！'
    });
    runCode();
  };

  const handleTestServices = () => {
    // 测试服务容器
    const containerStats = serviceContainer.getStats();
    addConsoleMessage({
      type: 'info',
      message: `📦 服务容器统计: ${JSON.stringify(containerStats)}`
    });

    // 测试配置管理器
    const configStats = configManager.getStats();
    addConsoleMessage({
      type: 'info',
      message: `⚙️ 配置管理器统计: ${JSON.stringify(configStats)}`
    });

    // 测试语言服务
    const languageStats = languageService.getStats();
    addConsoleMessage({
      type: 'info',
      message: `🌐 语言服务统计: ${JSON.stringify(languageStats)}`
    });

    // 测试事件系统
    const eventStats = eventEmitter.getEventStats();
    addConsoleMessage({
      type: 'info',
      message: `📡 事件系统统计: ${JSON.stringify(eventStats)}`
    });

    // 测试 Vendor 服务
    const vendorStats = vendorService.getStats();
    addConsoleMessage({
      type: 'info',
      message: `📦 Vendor 服务统计: ${JSON.stringify(vendorStats)}`
    });

    // 测试资源加载器
    const resourceStats = resourceLoader.getStats();
    addConsoleMessage({
      type: 'info',
      message: `🔗 资源加载器统计: ${JSON.stringify(resourceStats)}`
    });

    // 触发测试事件
    eventEmitter.emit('code-change', { type: 'script', code: 'console.log("测试");' });
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

        {/* 核心服务状态 */}
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold">🔧 核心服务状态</h3>
          </CardHeader>
          <CardBody>
            <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-500">
                  {serviceContainer.getStats().totalRegistered}
                </div>
                <div className="text-sm text-default-500">注册服务</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-500">
                  {languageService.getStats().totalLanguages}
                </div>
                <div className="text-sm text-default-500">支持语言</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-500">
                  {eventEmitter.getEventStats().totalListeners}
                </div>
                <div className="text-sm text-default-500">事件监听器</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-500">
                  {configManager.getStats().listenersCount}
                </div>
                <div className="text-sm text-default-500">配置监听器</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-pink-500">
                  {vendorService.getStats().totalVendors}
                </div>
                <div className="text-sm text-default-500">Vendor 资源</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-cyan-500">
                  {resourceLoader.getStats().totalResources}
                </div>
                <div className="text-sm text-default-500">加载资源</div>
              </div>
            </div>
          </CardBody>
        </Card>

        {/* 支持的语言 */}
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold">🌐 支持的语言</h3>
          </CardHeader>
          <CardBody>
            <div className="flex flex-wrap gap-2">
              {languageService.getSupportedLanguages().map((lang) => (
                <Chip
                  key={lang}
                  variant="flat"
                  color={languageService.needsCompiler(lang) ? 'warning' : 'default'}
                >
                  {languageService.getLanguageDisplayName(lang)}
                  {languageService.needsCompiler(lang) && ' 🔧'}
                  {languageService.needsRuntime(lang) && ' ⚡'}
                </Chip>
              ))}
            </div>
          </CardBody>
        </Card>

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
            color="secondary"
            size="lg"
            onClick={handleTestServices}
          >
            测试核心服务
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
                <div className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs">✓</span>
                </div>
                <span>阶段二：核心系统迁移</span>
              </div>
              <div className="ml-7 text-sm text-default-500 space-y-1">
                <div>✅ ServiceContainer - 依赖注入容器</div>
                <div>✅ ConfigManager - 配置管理器</div>
                <div>✅ EventEmitter - 事件系统</div>
                <div>✅ LanguageService - 语言服务</div>
                <div>✅ VendorService - CDN 资源管理</div>
                <div>✅ ResourceLoader - 资源加载器</div>
                <div>✅ EditorStore - 编辑器状态管理</div>
                <div>✅ CompilerStore - 编译器状态管理</div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 bg-yellow-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs">⚡</span>
                </div>
                <span>阶段三：编辑器系统重构 (下一步)</span>
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
