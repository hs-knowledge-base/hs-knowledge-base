import { notFound } from "next/navigation"
import { getDemoById } from "@/lib/demos"
import { DemoClient } from "./demo-client"

interface DemoPageProps {
  params: Promise<{
    id: string
  }>
}

export default async function DemoPage({ params }: DemoPageProps) {
  const { id } = await params
  const demo = getDemoById(id)

  if (!demo) {
    notFound()
  }

  return (
    <DemoClient demo={demo} />
  )
}

/**
 * 生成静态路径
 */
export async function generateStaticParams() {
  const { demos } = await import("@/lib/demos")

  return demos.map((demo) => ({
    id: demo.id,
  }))
}
