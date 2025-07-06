'use client';

import React from 'react';

interface CompilerStatsProps {
  /** 性能统计数据 */
  performance: {
    totalCompiles: number;
    successfulCompiles: number;
    failedCompiles: number;
    averageCompileTime: number;
  };
  /** 是否显示统计信息 */
  show?: boolean;
  /** 自定义样式类名 */
  className?: string;
}

/**
 * 编译器统计信息组件
 * 显示编译性能和统计数据
 */
export function CompilerStats({
  performance,
  show = true,
  className = ''
}: CompilerStatsProps) {
  if (!show) return null;

  const stats = [
    {
      value: performance.totalCompiles,
      label: '总编译次数',
      color: 'text-primary'
    },
    {
      value: performance.successfulCompiles,
      label: '成功次数',
      color: 'text-success'
    },
    {
      value: performance.failedCompiles,
      label: '失败次数',
      color: 'text-danger'
    },
    {
      value: `${performance.averageCompileTime.toFixed(0)}ms`,
      label: '平均耗时',
      color: 'text-warning'
    }
  ];

  return (
    <div className={`p-4 border-t border-divider bg-content2 ${className}`}>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
        {stats.map((stat, index) => (
          <div key={index}>
            <div className={`text-lg font-bold ${stat.color}`}>
              {stat.value}
            </div>
            <div className="text-xs text-default-500">{stat.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
