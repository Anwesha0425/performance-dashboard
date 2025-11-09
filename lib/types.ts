/**
 * Type Definitions
 * 
 * Central location for all TypeScript interfaces and types.
 * Used across components, hooks, and utilities.
 * 
 * @module lib/types
 */

// ============================================================================
// CORE DATA TYPES
// ============================================================================

export interface DataPoint {
  timestamp: number;
  value: number;
  category: string;
  metadata?: Record<string, any>;
}

export interface ChartConfig {
  type: 'line' | 'bar' | 'scatter' | 'heatmap';
  color: string;
  visible: boolean;
}

export interface PerformanceMetrics {
  fps: number;
  memoryUsage: number;
  renderTime: number;
  dataPoints: number;
}

export type TimeRange = '1min' | '5min' | '1hour' | 'all';

export type ChartType = 'line' | 'bar' | 'scatter' | 'heatmap';

export interface FilterOptions {
  timeRange: TimeRange;
  category: string;
}

// ============================================================================
// CHART COMPONENT PROPS
// ============================================================================

export interface BaseChartProps {
  data: DataPoint[];
  width: number;
  height: number;
  color: string;
  onRenderComplete: (time: number) => void;
}

export interface HeatmapProps {
  data: DataPoint[];
  width: number;
  height: number;
  onRenderComplete: (time: number) => void;
}

// ============================================================================
// DATA STREAM TYPES
// ============================================================================

export interface DataStreamConfig {
  interval: number;
  maxDataPoints: number;
  batchSize: number;
}

export interface AggregatedData {
  [key: string]: number;
}

// ============================================================================
// PERFORMANCE MONITORING TYPES
// ============================================================================

export interface FrameMetrics {
  frameCount: number;
  lastTime: number;
  renderTimes: number[];
}

export interface MemoryInfo {
  usedJSHeapSize: number;
  totalJSHeapSize: number;
  jsHeapSizeLimit: number;
}

declare global {
  interface Performance {
    memory?: MemoryInfo;
  }
}