'use client';

import React from 'react';
import { FiChevronDown, FiChevronRight } from 'react-icons/fi';

interface ExpandableValueProps {
  /** 值 */
  value: any;
  /** 是否展开 */
  isExpanded?: boolean;
  /** 嵌套深度 */
  depth?: number;
  /** 当前路径 */
  path?: string;
  /** 点击展开回调 */
  onToggle?: () => void;
  /** 嵌套路径展开回调 */
  onPathToggle?: (path: string) => void;
  /** 已展开的路径集合 */
  expandedPaths?: Set<string>;
}

interface ParsedValue {
  type: 'object' | 'array' | 'function' | 'primitive';
  value: any;
  preview: string;
  isExpandable: boolean;
}

/**
 * 可展开值组件
 * 类似浏览器控制台的对象展开功能
 */
export function ExpandableValue({
  value,
  isExpanded = false,
  depth = 0,
  path = '',
  onToggle,
  onPathToggle,
  expandedPaths = new Set()
}: ExpandableValueProps) {
  
  /** 解析值类型和预览 */
  const parseValue = (val: any): ParsedValue => {
    if (val === null) {
      return { type: 'primitive', value: val, preview: 'null', isExpandable: false };
    }
    
    if (val === undefined) {
      return { type: 'primitive', value: val, preview: 'undefined', isExpandable: false };
    }
    
    if (typeof val === 'string') {
      const displayValue = val.length > 100 ? `${val.slice(0, 100)}...` : val;
      return { type: 'primitive', value: val, preview: `"${displayValue}"`, isExpandable: val.length > 100 };
    }
    
    if (typeof val === 'number') {
      return { type: 'primitive', value: val, preview: String(val), isExpandable: false };
    }
    
    if (typeof val === 'boolean') {
      return { type: 'primitive', value: val, preview: String(val), isExpandable: false };
    }
    
    if (typeof val === 'function') {
      const funcName = val.name || 'anonymous';
      const isArrowFunction = val.toString().includes('=>');
      const isAsync = val.toString().startsWith('async');
      const preview = `${isAsync ? 'async ' : ''}${isArrowFunction ? '() => {}' : `ƒ ${funcName}()`}`;
      return { type: 'function', value: val, preview, isExpandable: true };
    }
    
    if (Array.isArray(val)) {
      const preview = `Array(${val.length})`;
      return { type: 'array', value: val, preview, isExpandable: true };
    }
    
    if (typeof val === 'object') {
      const keys = Object.keys(val);
      const objectName = val.constructor?.name || 'Object';
      let preview = objectName;
      
      if (keys.length > 0) {
        const keyPreview = keys.slice(0, 3).join(', ');
        preview = `${objectName} {${keyPreview}${keys.length > 3 ? ', ...' : ''}}`;
      } else {
        preview = `${objectName} {}`;
      }
      
      return { type: 'object', value: val, preview, isExpandable: true };
    }
    
    return { type: 'primitive', value: val, preview: String(val), isExpandable: false };
  };

  /** 获取值的颜色 */
  const getValueColor = (val: any): string => {
    if (val === null) return 'text-gray-500';
    if (val === undefined) return 'text-gray-500';
    if (typeof val === 'string') return 'text-gray-300';
    if (typeof val === 'number') return 'text-blue-400';
    if (typeof val === 'boolean') return 'text-blue-600';
    if (typeof val === 'function') return 'text-purple-400';
    return 'text-gray-300';
  };

  const parsedValue = parseValue(value);
  const { type, preview, isExpandable } = parsedValue;

  if (!isExpandable) {
    return (
      <span className={getValueColor(value)}>
        {preview}
      </span>
    );
  }

  if (!isExpanded) {
    return (
      <span 
        className={`${getValueColor(value)} cursor-pointer hover:bg-gray-700/50 px-1 rounded transition-colors`}
        onClick={(e) => {
          e.stopPropagation();
          onToggle?.();
        }}
      >
        <FiChevronRight size={12} className="inline mr-1 text-gray-400" />
        {preview}
      </span>
    );
  }

  // 处理长字符串的展开
  if (type === 'primitive' && typeof value === 'string' && value.length > 100) {
    return (
      <div className="inline-block">
        <div className="flex items-start">
          <span 
            className={`${getValueColor(value)} cursor-pointer hover:bg-gray-700/50 px-1 rounded transition-colors`}
            onClick={(e) => {
              e.stopPropagation();
              onToggle?.();
            }}
          >
            <FiChevronDown size={12} className="inline mr-1 text-gray-400" />
            <span className="text-gray-300">"string"</span>
            <span className="text-gray-500 text-xs ml-1">({value.length} chars)</span>
          </span>
        </div>
        <div className="ml-4 mt-1 border-l-2 border-gray-600/50 pl-3">
          <div className="text-gray-300 bg-gray-800/50 p-2 rounded border border-gray-700 font-mono text-sm whitespace-pre-wrap break-words max-w-md">
            "{value}"
          </div>
        </div>
      </div>
    );
  }

  // 展开数组
  if (type === 'array') {
    return (
      <div className="inline-block">
        <div className="flex items-start">
          <span 
            className="text-gray-300 cursor-pointer hover:bg-gray-700/50 px-1 rounded transition-colors"
            onClick={(e) => {
              e.stopPropagation();
              onToggle?.();
            }}
          >
            <FiChevronDown size={12} className="inline mr-1 text-gray-400" />
            <span className="text-gray-300">Array({value.length})</span>
          </span>
        </div>
        <div className="ml-4 mt-1 border-l-2 border-gray-600/50 pl-3 space-y-1">
          {value.map((item: any, index: number) => (
            <div key={index} className="flex items-start gap-2 text-sm">
              <span className="text-blue-400 font-mono text-xs min-w-[20px] text-right">
                {index}:
              </span>
              <div className="flex-1">
                <ExpandableValue
                  value={item}
                  depth={depth + 1}
                  path={`${path}[${index}]`}
                  isExpanded={expandedPaths.has(`${path}[${index}]`)}
                  onToggle={() => onPathToggle?.(`${path}[${index}]`)}
                  onPathToggle={onPathToggle}
                  expandedPaths={expandedPaths}
                />
              </div>
            </div>
          ))}
          {value.length === 0 && (
            <div className="text-gray-500 text-xs italic">empty array</div>
          )}
        </div>
      </div>
    );
  }

  // 展开对象
  if (type === 'object') {
    const entries = Object.entries(value);
    const objectName = value.constructor?.name || 'Object';
    
    return (
      <div className="inline-block">
        <div className="flex items-start">
          <span 
            className="text-gray-300 cursor-pointer hover:bg-gray-700/50 px-1 rounded transition-colors"
            onClick={(e) => {
              e.stopPropagation();
              onToggle?.();
            }}
          >
            <FiChevronDown size={12} className="inline mr-1 text-gray-400" />
            <span className="text-gray-300">{objectName}</span>
            {entries.length > 0 && (
              <span className="text-gray-500 text-xs ml-1">({entries.length})</span>
            )}
          </span>
        </div>
        <div className="ml-4 mt-1 border-l-2 border-gray-600/50 pl-3 space-y-1">
          {entries.map(([key, val]) => (
            <div key={key} className="flex items-start gap-2 text-sm">
              <span className="text-purple-400 font-mono text-xs min-w-fit">
                {key}:
              </span>
              <div className="flex-1">
                <ExpandableValue
                  value={val}
                  depth={depth + 1}
                  path={`${path}.${key}`}
                  isExpanded={expandedPaths.has(`${path}.${key}`)}
                  onToggle={() => onPathToggle?.(`${path}.${key}`)}
                  onPathToggle={onPathToggle}
                  expandedPaths={expandedPaths}
                />
              </div>
            </div>
          ))}
          {entries.length === 0 && (
            <div className="text-gray-500 text-xs italic">empty object</div>
          )}
        </div>
      </div>
    );
  }

  // 展开函数
  if (type === 'function') {
    const funcStr = value.toString();
    const funcName = value.name || 'anonymous';
    const isArrowFunction = funcStr.includes('=>');
    const isAsync = funcStr.startsWith('async');
    
    return (
      <div className="inline-block">
        <div className="flex items-start">
          <span 
            className="text-purple-400 cursor-pointer hover:bg-gray-700/50 px-1 rounded transition-colors"
            onClick={(e) => {
              e.stopPropagation();
              onToggle?.();
            }}
          >
            <FiChevronDown size={12} className="inline mr-1 text-gray-400" />
            <span className="text-purple-400">
              {isAsync && 'async '}
              {isArrowFunction ? '() => {}' : `ƒ ${funcName}()`}
            </span>
          </span>
        </div>
        <div className="ml-4 mt-1 border-l-2 border-gray-600/50 pl-3">
          <pre className="text-xs text-gray-300 whitespace-pre-wrap bg-gray-800/50 p-2 rounded border border-gray-700 font-mono leading-relaxed">
            {funcStr}
          </pre>
        </div>
      </div>
    );
  }

  return <span>{preview}</span>;
}
