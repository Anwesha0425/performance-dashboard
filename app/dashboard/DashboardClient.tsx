'use client';

import { useState, useMemo, useCallback } from 'react';
import { DataPoint, ChartType, TimeRange } from '@/lib/types';
import { generateInitialDataset, generateStressTestDataset } from '@/lib/dataGenerator';
import { usePerformanceMonitor } from '@/hooks/usePerformanceMonitor';
import { useDataStream } from '@/hooks/useDataStream';
import PerformanceMonitor from '@/components/ui/PerformanceMonitor';
import FilterPanel from '@/components/controls/FilterPanel';
import LineChart from '@/components/charts/LineChart';
import BarChart from '@/components/charts/BarChart';
import ScatterPlot from '@/components/charts/ScatterPlot';
import Heatmap from '@/components/charts/Heatmap';

// ============================================================================
// DASHBOARD CLIENT COMPONENT
// ============================================================================

interface DashboardClientProps {
  initialData: DataPoint[];
}

export default function DashboardClient({ initialData }: DashboardClientProps) {
  const [chartType, setChartType] = useState<ChartType>('line');
  const [timeRange, setTimeRange] = useState<TimeRange>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  const { metrics, measureFrame } = usePerformanceMonitor();
  const {
    data,
    isStreaming,
    isPending,
    toggle: toggleStreaming,
    replaceData
  } = useDataStream({
    initialData,
    interval: 100,
    maxDataPoints: 15000,
    autoStart: true
  });

  // Filter data based on selections
  const filteredData = useMemo(() => {
    let filtered = data;

    // Category filter
    if (categoryFilter !== 'all') {
      filtered = filtered.filter(d => d.category === categoryFilter);
    }

    // Time range filter
    if (timeRange !== 'all') {
      const now = Date.now();
      const ranges = {
        '1min': 60 * 1000,
        '5min': 5 * 60 * 1000,
        '1hour': 60 * 60 * 1000
      };
      const cutoff = now - ranges[timeRange];
      filtered = filtered.filter(d => d.timestamp >= cutoff);
    }

    return filtered;
  }, [data, categoryFilter, timeRange]);

  const handleRenderComplete = useCallback((renderTime: number) => {
    measureFrame(renderTime, filteredData.length);
  }, [measureFrame, filteredData.length]);

  const handleStressTest = useCallback(() => {
    replaceData(generateStressTestDataset(50000));
  }, [replaceData]);

  const handleReset = useCallback(() => {
    replaceData(generateInitialDataset(10000));
  }, [replaceData]);

  // Chart dimensions (responsive)
  const chartWidth = typeof window !== 'undefined' && window.innerWidth > 768 ? 1200 : 800;
  const chartHeight = 500;

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <header className="mb-6">
          <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            Real-Time Performance Dashboard
          </h1>
          <p className="text-gray-400">
            Next.js 14 App Router • Canvas Rendering • 60fps @ 10K+ data points
          </p>
        </header>

        {/* Performance Metrics */}
        <div className="mb-6">
          <PerformanceMonitor metrics={metrics} />
        </div>

        {/* Control Panel */}
        <div className="mb-6">
          <FilterPanel
            chartType={chartType}
            timeRange={timeRange}
            categoryFilter={categoryFilter}
            isStreaming={isStreaming}
            onChartTypeChange={setChartType}
            onTimeRangeChange={setTimeRange}
            onCategoryChange={setCategoryFilter}
            onToggleStreaming={toggleStreaming}
            onStressTest={handleStressTest}
            onReset={handleReset}
          />
        </div>

        {/* Chart Display */}
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700 mb-6">
          <div className="flex items-center justify-center">
            {chartType === 'line' && (
              <LineChart
                data={filteredData}
                width={chartWidth}
                height={chartHeight}
                color="#22d3ee"
                onRenderComplete={handleRenderComplete}
              />
            )}
            {chartType === 'bar' && (
              <BarChart
                data={filteredData}
                width={chartWidth}
                height={chartHeight}
                color="#a78bfa"
                onRenderComplete={handleRenderComplete}
              />
            )}
            {chartType === 'scatter' && (
              <ScatterPlot
                data={filteredData}
                width={chartWidth}
                height={chartHeight}
                color="#34d399"
                onRenderComplete={handleRenderComplete}
              />
            )}
            {chartType === 'heatmap' && (
              <Heatmap
                data={filteredData}
                width={chartWidth}
                height={chartHeight}
                onRenderComplete={handleRenderComplete}
              />
            )}
          </div>
        </div>

        {/* Status Bar */}
        <div className="text-center text-sm text-gray-400 space-x-4">
          {isStreaming && (
            <span className="text-green-400 font-medium">
              ● LIVE STREAMING
            </span>
          )}
          {isPending && (
            <span className="text-yellow-400">
              ⟳ Updating...
            </span>
          )}
          <span>
            Total Points: <strong className="text-white">{data.length.toLocaleString()}</strong>
          </span>
          <span>
            Filtered: <strong className="text-white">{filteredData.length.toLocaleString()}</strong>
          </span>
        </div>
      </div>
    </div>
  );
}