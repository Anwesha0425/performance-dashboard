'use client';

import { memo } from 'react';
import { PerformanceMetrics } from '@/lib/types';
import { getPerformanceGrade } from '@/lib/performanceUtils';


interface PerformanceMonitorProps {
  metrics: PerformanceMetrics;
}

const PerformanceMonitor = memo(({ metrics }: PerformanceMonitorProps) => {
  const grade = getPerformanceGrade(metrics);

  const getFPSColor = (fps: number): string => {
    if (fps >= 55) return 'text-green-400';
    if (fps >= 30) return 'text-yellow-400';
    return 'text-red-400';
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {/* FPS */}
      <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
        <div className="flex items-center justify-between mb-2">
          <div className="text-sm text-gray-400">FPS</div>
          <div
            className="w-2 h-2 rounded-full"
            style={{ backgroundColor: grade.color }}
          />
        </div>
        <div className={`text-2xl font-bold ${getFPSColor(metrics.fps)}`}>
          {metrics.fps}
        </div>
        <div className="text-xs text-gray-500 mt-1">
          Target: 60
        </div>
      </div>

      {/* Memory */}
      <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
        <div className="text-sm text-gray-400 mb-2">Memory (MB)</div>
        <div className="text-2xl font-bold text-blue-400">
          {metrics.memoryUsage.toFixed(1)}
        </div>
        <div className="text-xs text-gray-500 mt-1">
          Heap usage
        </div>
      </div>

      {/* Render Time */}
      <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
        <div className="text-sm text-gray-400 mb-2">Render (ms)</div>
        <div className={`text-2xl font-bold ${
          metrics.renderTime < 16.67 ? 'text-green-400' : 'text-yellow-400'
        }`}>
          {metrics.renderTime.toFixed(2)}
        </div>
        <div className="text-xs text-gray-500 mt-1">
          Budget: 16.67ms
        </div>
      </div>

      {/* Data Points */}
      <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
        <div className="text-sm text-gray-400 mb-2">Data Points</div>
        <div className="text-2xl font-bold text-purple-400">
          {metrics.dataPoints.toLocaleString()}
        </div>
        <div className="text-xs text-gray-500 mt-1">
          Active points
        </div>
      </div>
    </div>
  );
});

PerformanceMonitor.displayName = 'PerformanceMonitor';

export default PerformanceMonitor;