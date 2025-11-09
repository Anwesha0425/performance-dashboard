/**
 * Component Exports
 * 
 * Central export file for all dashboard components.
 * Simplifies imports across the application.
 * 
 * @example
 * import { LineChart, BarChart, FilterPanel } from '@/components';
 */

// Charts
export { default as LineChart } from './charts/LineChart';
export { default as BarChart } from './charts/BarChart';
export { default as ScatterPlot } from './charts/ScatterPlot';
export { default as Heatmap } from './charts/Heatmap';

// Controls
export { default as FilterPanel } from './controls/FilterPanel';

// UI
export { default as PerformanceMonitor } from './ui/PerformanceMonitor';