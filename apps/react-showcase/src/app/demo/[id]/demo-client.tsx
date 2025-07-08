"use client"

import { DemoLayout } from "@/components/layout/demo-layout"
import type { Demo } from "@/lib/demos"

interface DemoClientProps {
  demo: Demo
}

export function DemoClient({ demo }: DemoClientProps) {
  return (
    <DemoLayout
      demo={demo}
    />
  )
}
