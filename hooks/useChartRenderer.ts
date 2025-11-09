import { useRef, useEffect, useCallback } from 'react';
import { DataPoint } from '@/lib/types';
import {
  getOptimizedContext,
  calculateScales,
  dataToCanvas,
  clearCanvas,
  drawGrid,
  drawAxisLabels,
  downsampleSimple
} from '@/lib/canvasUtils';

// ============================================================================
// CHART RENDERING HOOK
// ============================================================================

interface UseChartRendererOptions {
  data: DataPoint[];
  width: number;
  height: number;
  color: string;
  onRenderComplete: (time: number) => void;
  maxPoints?: number;
  padding?: number;
}

export function useChartRenderer({
  data,
  width,
  height,
  color,
  onRenderComplete,
  maxPoints = 2000,
  padding = 40
}: UseChartRendererOptions) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number>();

  /**
   * Render line chart
   */
  const renderLineChart = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || data.length === 0) return;

    const ctx = getOptimizedContext(canvas);
    if (!ctx) return;

    const startTime = performance.now();

    // Clear and setup
    clearCanvas(ctx, width, height);
    drawGrid(ctx, width, height, padding);

    // Calculate scales
    const scales = calculateScales(data);
    drawAxisLabels(ctx, scales, width, height, padding);

    // Downsample if needed
    const sampledData = downsampleSimple(data, maxPoints);

    // Draw line
    const chartWidth = width - padding * 2;
    const chartHeight = height - padding * 2;

    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.beginPath();

    sampledData.forEach((point, i) => {
      const { x, y } = dataToCanvas(point, scales, width, height, padding);
      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });

    ctx.stroke();

    const renderTime = performance.now() - startTime;
    onRenderComplete(renderTime);
  }, [data, width, height, color, padding, maxPoints, onRenderComplete]);

  /**
   * Render bar chart
   */
  const renderBarChart = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || data.length === 0) return;

    const ctx = getOptimizedContext(canvas);
    if (!ctx) return;

    const startTime = performance.now();

    clearCanvas(ctx, width, height);

    // Aggregate by category
    const aggregated = data.reduce((acc, point) => {
      acc[point.category] = (acc[point.category] || 0) + point.value;
      return acc;
    }, {} as Record<string, number>);

    const categories = Object.keys(aggregated);
    const maxValue = Math.max(...Object.values(aggregated));

    const chartWidth = width - padding * 2;
    const chartHeight = height - padding * 2;
    const barWidth = (chartWidth / categories.length) - 10;

    // Draw bars
    categories.forEach((cat, i) => {
      const value = aggregated[cat];
      const barHeight = (value / maxValue) * chartHeight;
      const x = padding + i * (chartWidth / categories.length) + 5;
      const y = padding + chartHeight - barHeight;

      ctx.fillStyle = color;
      ctx.fillRect(x, y, barWidth, barHeight);

      // Labels
      ctx.fillStyle = '#888';
      ctx.font = '12px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(cat, x + barWidth / 2, height - 20);
      ctx.fillText(value.toFixed(0), x + barWidth / 2, y - 5);
    });

    const renderTime = performance.now() - startTime;
    onRenderComplete(renderTime);
  }, [data, width, height, color, padding, onRenderComplete]);

  /**
   * Render scatter plot
   */
  const renderScatterPlot = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || data.length === 0) return;

    const ctx = getOptimizedContext(canvas);
    if (!ctx) return;

    const startTime = performance.now();

    clearCanvas(ctx, width, height);
    drawGrid(ctx, width, height, padding);

    const scales = calculateScales(data);
    const sampledData = downsampleSimple(data, maxPoints * 1.5); // Allow more points for scatter

    ctx.fillStyle = color;
    sampledData.forEach(point => {
      const { x, y } = dataToCanvas(point, scales, width, height, padding);
      ctx.beginPath();
      ctx.arc(x, y, 2, 0, Math.PI * 2);
      ctx.fill();
    });

    const renderTime = performance.now() - startTime;
    onRenderComplete(renderTime);
  }, [data, width, height, color, padding, maxPoints, onRenderComplete]);

  return {
    canvasRef,
    renderLineChart,
    renderBarChart,
    renderScatterPlot
  };
}