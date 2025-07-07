"use client"

import { useState } from "react"
import { LiveProvider, LiveEditor, LiveError, LivePreview } from "react-live"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger } from "@/components/ui/drawer"
import { Separator } from "@/components/ui/separator"
import { Code2, Eye, Maximize2, Minimize2 } from "lucide-react"

/**
 * Demo 布局组件的属性接口
 */
interface DemoLayoutProps {
  /** 案例标题*/
  title: string
  /** 案例描述，可选，显示在标题下方 */
  description?: string
  /** React Live 要执行的初始代码字符串 */
  initialCode: string
  /** React Live 的完整作用域对象，包含所有可用的变量、函数和组件 */
  scope?: Record<string, any>
  /** 是否显示控制台，当前未使用但保留用于未来扩展 */
  showConsole?: boolean
}

export function DemoLayout({
  title,
  description,
  initialCode,
  scope = {},
}: DemoLayoutProps) {
  const [isCodeOpen, setIsCodeOpen] = useState(false)
  const [drawerMode, setDrawerMode] = useState<'view' | 'edit'>('view')
  const [isFullscreen, setIsFullscreen] = useState(false)

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">{title}</h1>
          {description && (
            <p className="text-slate-600 text-lg">{description}</p>
          )}
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Preview Area */}
          <div className="lg:col-span-2">
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Eye className="h-5 w-5 text-slate-600" />
                  <h2 className="text-xl font-semibold text-slate-900">预览</h2>
                </div>
                <div className="flex items-center gap-2">
                  <Drawer
                    open={isCodeOpen}
                    onOpenChange={setIsCodeOpen}
                    shouldScaleBackground={false}
                  >
                    <DrawerTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        className="gap-2"
                        onClick={() => setDrawerMode('view')}
                      >
                        <Eye className="h-4 w-4" />
                        查看代码
                      </Button>
                    </DrawerTrigger>
                    <DrawerTrigger asChild>
                      <Button
                        variant="default"
                        size="sm"
                        className="gap-2"
                        onClick={() => setDrawerMode('edit')}
                      >
                        <Code2 className="h-4 w-4" />
                        编辑代码
                      </Button>
                    </DrawerTrigger>
                    <DrawerContent fullscreen={isFullscreen}>
                      <DrawerHeader>
                        <div className="flex items-center justify-between">
                          <DrawerTitle>
                            {drawerMode === 'view' ? '查看源代码' : '编辑代码'}
                          </DrawerTitle>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setIsFullscreen(!isFullscreen)}
                            className="gap-2"
                          >
                            {isFullscreen ? (
                              <>
                                <Minimize2 className="h-4 w-4" />
                                退出全屏
                              </>
                            ) : (
                              <>
                                <Maximize2 className="h-4 w-4" />
                                全屏
                              </>
                            )}
                          </Button>
                        </div>
                      </DrawerHeader>
                      <div className="flex-1 p-4 min-h-0 overflow-hidden">
                        <LiveProvider code={initialCode} scope={scope}>
                          {drawerMode === 'view' ? (
                            /* 查看模式 - 只显示只读代码 */
                            <div className={`flex flex-col ${isFullscreen ? 'h-[calc(100vh-140px)]' : 'h-[calc(80vh-140px)]'}`}>
                              <div className="flex flex-col h-full">
                                <h3 className="text-sm font-medium text-gray-700 mb-2 flex-shrink-0">源代码（只读）</h3>
                                <div className="flex-1 border rounded-lg overflow-hidden min-h-0">
                                  <LiveEditor
                                    disabled
                                    style={{
                                      fontFamily: 'Monaco, Menlo, "Ubuntu Mono", monospace',
                                      fontSize: 14,
                                      height: '100%',
                                      overflow: 'auto',
                                      padding: '16px'
                                    }}
                                  />
                                </div>
                              </div>
                            </div>
                          ) : (
                            /* 编辑模式 - 显示编辑器和实时预览 */
                            <div className={`grid grid-cols-1 lg:grid-cols-2 gap-4 ${isFullscreen ? 'h-[calc(100vh-140px)]' : 'h-[calc(80vh-140px)]'}`}>
                              {/* 编辑器 */}
                              <div className="flex flex-col min-h-0">
                                <h3 className="text-sm font-medium text-gray-700 mb-2 flex-shrink-0">代码编辑器</h3>
                                <div className="flex-1 border rounded-lg overflow-hidden min-h-0">
                                  <LiveEditor
                                    style={{
                                      fontFamily: 'Monaco, Menlo, "Ubuntu Mono", monospace',
                                      fontSize: 14,
                                      height: '100%',
                                      overflow: 'auto',
                                      padding: '16px'
                                    }}
                                  />
                                </div>
                              </div>

                              {/* 预览 */}
                              <div className="flex flex-col min-h-0">
                                <h3 className="text-sm font-medium text-gray-700 mb-2 flex-shrink-0">实时预览</h3>
                                <div className="flex-1 border rounded-lg bg-white overflow-auto min-h-0">
                                  <div className="p-4">
                                    <LivePreview />
                                  </div>
                                </div>

                                {/* 错误显示 */}
                                <div className="mt-2 flex-shrink-0">
                                  <LiveError
                                    style={{
                                      color: 'red',
                                      backgroundColor: '#fee',
                                      padding: '8px',
                                      borderRadius: '4px',
                                      fontSize: '12px',
                                      fontFamily: 'monospace'
                                    }}
                                  />
                                </div>
                              </div>
                            </div>
                          )}
                        </LiveProvider>
                      </div>
                    </DrawerContent>
                </Drawer>
              </div>
              </div>
              <Separator className="mb-6" />
              
              {/* React Live Preview Only */}
              <div className="rounded-lg border bg-white overflow-hidden min-h-[500px] p-6">
                <LiveProvider code={initialCode} scope={scope}>
                  <LivePreview />
                  <LiveError 
                    style={{
                      color: 'red',
                      backgroundColor: '#fee',
                      padding: '8px',
                      borderRadius: '4px',
                      fontSize: '12px',
                      fontFamily: 'monospace',
                      marginTop: '16px'
                    }}
                  />
                </LiveProvider>
              </div>
            </Card>
          </div>

          {/* Info Panel */}
          <div className="space-y-6">
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-3">关于此示例</h3>
              <div className="space-y-3 text-sm text-slate-600">
                <div>
                  <span className="font-medium">引擎:</span> React Live
                </div>
                <div>
                  <span className="font-medium">特性:</span> 实时编译，快速加载
                </div>
                {Object.keys(scope).length > 0 && (
                  <div>
                    <span className="font-medium">可用组件:</span>
                    <ul className="mt-1 space-y-1">
                      {Object.keys(scope).map((name) => (
                        <li key={name} className="text-xs font-mono">
                          {name}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
