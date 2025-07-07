"use client"

import { DemoLayout } from "@/components/layout/demo-layout"
import { createScope } from "@/lib/react-live/scope"
import type { Demo } from "@/lib/demos"

interface DemoClientProps {
  demo: Demo
}

export function DemoClient({ demo }: DemoClientProps) {
  const scope = createScope(demo)

  return (
    <DemoLayout
      title={demo.title}
      description={demo.description}
      initialCode={demo.code}
      scope={scope}
    />
  )
}
