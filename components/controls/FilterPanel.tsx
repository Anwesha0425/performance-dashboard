'use client';

import { memo } from 'react';
import { ChartType, TimeRange } from '@/lib/types';

// ============================================================================
// FILTER PANEL COMPONENT
// ============================================================================

interface FilterPanelProps {
  chartType: ChartType;
  timeRange: TimeRange;
  categoryFilter: string;
  isStreaming: boolean;
  onChartTypeChange: (type: ChartType) => void;
  onTimeRangeChange: (range: TimeRange) => void;
  onCategoryChange: (category: string) => void;
  onToggleStreaming: () => void;
  onStressTest: () => void;
  onReset: () => void;
}

const FilterPanel = memo(({
  chartType,
  timeRange,
  categoryFilter,
  isStreaming,
  onChartTypeChange,
  onTimeRangeChange,
  onCategoryChange,
  onToggleStreaming,
  onStressTest,
  onReset
}: FilterPanelProps) => {
  return (
    <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Chart Type */}
        <div>
          <label className="block text-sm text-gray-400 mb-2 font-medium">
            Chart Type
          </label>
          <select
            value={chartType}
            onChange={(e) => onChartTypeChange(e.target.value as ChartType)}
            className="w-full bg-gray-700 text-white rounded px-3 py-2 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="line">📈 Line Chart</option>
            <option value="bar">📊 Bar Chart</option>
            <option value="scatter">🔵 Scatter Plot</option>
            <option value="heatmap">🔥 Heatmap</option>
          </select>
        </div>

        {/* Time Range */}
        <div>
          <label className="block text-sm text-gray-400 mb-2 font-medium">
            Time Range
          </label>
          <select
            value={timeRange}
            onChange={(e) => onTimeRangeChange(e.target.value as TimeRange)}
            className="w-full bg-gray-700 text-white rounded px-3 py-2 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">⏱️ All Data</option>
            <option value="1min">🕐 Last 1 Minute</option>
            <option value="5min">🕔 Last 5 Minutes</option>
            <option value="1hour">🕐 Last 1 Hour</option>
          </select>
        </div>

        {/* Category Filter */}
        <div>
          <label className="block text-sm text-gray-400 mb-2 font-medium">
            Category
          </label>
          <select
            value={categoryFilter}
            onChange={(e) => onCategoryChange(e.target.value)}
            className="w-full bg-gray-700 text-white rounded px-3 py-2 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">🏷️ All Categories</option>
            <option value="A">Category A</option>
            <option value="B">Category B</option>
            <option value="C">Category C</option>
            <option value="D">Category D</option>
          </select>
        </div>

        {/* Actions */}
        <div>
          <label className="block text-sm text-gray-400 mb-2 font-medium">
            Actions
          </label>
          <div className="flex gap-2">
            <button
              onClick={onToggleStreaming}
              className={`flex-1 px-3 py-2 rounded font-medium transition-colors ${
                isStreaming
                  ? 'bg-red-600 hover:bg-red-700'
                  : 'bg-green-600 hover:bg-green-700'
              }`}
              title={isStreaming ? 'Pause streaming' : 'Start streaming'}
            >
              {isStreaming ? '⏸' : '▶'}
            </button>
            <button
              onClick={onStressTest}
              className="flex-1 px-3 py-2 rounded bg-yellow-600 hover:bg-yellow-700 font-medium transition-colors"
              title="Stress test: Load 50K points"
            >
              🔥
            </button>
            <button
              onClick={onReset}
              className="flex-1 px-3 py-2 rounded bg-blue-600 hover:bg-blue-700 font-medium transition-colors"
              title="Reset to 10K points"
            >
              ↻
            </button>
          </div>
        </div>
      </div>
    </div>
  );
});

FilterPanel.displayName = 'FilterPanel';

export default FilterPanel;