import { useState, useEffect, useCallback, useMemo, useRef, useReducer } from "react"
import type { Demo } from "../demos"
import { loadMultipleCDNLibraries } from "../cdn-loader"

/**
 * 基础 React Hooks scope
 * 所有案例都需要的基础依赖
 */
const BASE_SCOPE = {
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
  useReducer
}

/**
 * 创建 React Live 的 scope
 * 包含基础 React Hooks、案例特定的 scope 和 CDN 依赖
 */
export async function createScope(demo: Demo): Promise<Record<string, any>> {
  let scope: Record<string, any> = { ...BASE_SCOPE }

  // 添加案例特定的 scope
  if (demo.scope) {
    scope = { ...scope, ...demo.scope }
  }

  // 加载 CDN 依赖
  if (demo.cdnDependencies && demo.cdnDependencies.length > 0) {
    try {
      const cdnLibraries = await loadMultipleCDNLibraries(demo.cdnDependencies)

      // 将 CDN 库添加到 scope 中
      Object.entries(cdnLibraries).forEach(([name, library]) => {
        if (library) {
          // 使用库的常见全局名称
          if (name === 'lodash') {
            scope._ = library
          } else {
            scope[name] = library
          }
        }
      })
    } catch (error) {
      console.warn('Failed to load CDN dependencies:', error)
    }
  }

  return scope
}
