import { useState, useEffect, useCallback, useMemo, useRef } from "react"
import type { Demo } from "../demos"

/**
 * 基础 React Hooks scope
 * 所有案例都需要的基础依赖
 */
const BASE_SCOPE = {
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef
}

/**
 * 创建 React Live 的 scope
 * 只包含基础 React Hooks，案例特定的依赖由案例自己提供
 */
export function createScope(demo: Demo): Record<string, any> {
  if (!demo.scope) {
    return BASE_SCOPE
  }

  return {
    ...BASE_SCOPE,
    ...demo.scope
  }
}
