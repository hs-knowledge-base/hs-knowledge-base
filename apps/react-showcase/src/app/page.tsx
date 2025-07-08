import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowRight, Code2, Layers, Zap, Settings, Brain, Palette } from "lucide-react"
import { demos, getAllCategories } from "@/lib/demos"
import { DemoCategory } from "@/lib/demos/types";

const categories = getAllCategories()

/**
 * 为每个分类添加图标
 */
const categoryIcons: Record<DemoCategory, React.ReactNode> = {
  "React Hooks": <Zap className="h-5 w-5" />,
  "Performance": <Settings className="h-5 w-5" />,
  "Custom Hooks": <Brain className="h-5 w-5" />,
  "Components": <Layers className="h-5 w-5" />,
  "State Management": <Code2 className="h-5 w-5" />,
  "UI/UX": <Palette className="h-5 w-5" />
}

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Code2 className="h-8 w-8 text-blue-600" />
            <h1 className="text-4xl font-bold text-slate-900">React 生态展示</h1>
          </div>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto">
            为知识库文档提供 React 生态系统的交互式演示，涵盖 Hooks、组件设计等核心概念
          </p>
        </div>

        {/* Categories */}
        {categories.map(category => (
          <div key={category} className="mb-12">
            <h2 className="text-2xl font-semibold text-slate-900 mb-6 flex items-center gap-2">
              {categoryIcons[category]}
              {category}
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {demos
                .filter(demo => demo.category === category)
                .map(demo => (
                  <Card key={demo.id} className="group hover:shadow-lg transition-all duration-200 hover:-translate-y-1">
                    <CardHeader>
                      <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 rounded-lg bg-slate-100 group-hover:bg-blue-100 transition-colors">
                          {categoryIcons[category]}
                        </div>
                        <CardTitle className="text-lg">{demo.title}</CardTitle>
                      </div>
                      <CardDescription className="text-slate-600">
                        {demo.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Link href={`/demo/${demo.id}`}>
                        <Button className="w-full group-hover:bg-blue-600 transition-colors">
                          查看示例
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                      </Link>
                    </CardContent>
                  </Card>
                ))}
            </div>
          </div>
        ))}

        {/* Footer */}
        <div className="text-center mt-16 pt-8 border-t border-slate-200">
          <p className="text-slate-500">
            这是一个用于知识库的 React 展示平台，通过 iframe 嵌入到文档中使用
          </p>
        </div>
      </div>
    </div>
  )
}
