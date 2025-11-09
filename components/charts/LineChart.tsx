'use client';

import { memo, useEffect, useRef } from 'react';
import { BaseChartProps } from '@/lib/types';
import {
  getOptimizedContext,
  calculateScales,
  dataToCanvas,
  clearCanvas,
  drawGrid,
  drawAxisLabels,
  downsampleSimple
} from '@/lib/canvasUtils';

/**
 * LineChart Component
 * 
 * High-performance line chart using canvas rendering.
 * Implements LTTB downsampling for large datasets.
 * Uses RequestAnimationFrame for smooth 60fps rendering.
 * 
 * @component
 * @example
 * <LineChart
 *   data={dataPoints}
 *   width={1200}
 *   height={500}
 *   color="#22d3ee"
 *   onRenderComplete={(time) => console.log(time)}
 * />
 */
const LineChart = memo(({
  data,
  width,
  height,
  color,
  onRenderComplete
}: BaseChartProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number>();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || data.length === 0) return;

    const ctx = getOptimizedContext(canvas);
    if (!ctx) return;

    const render = () => {
      const startTime = performance.now();

      // Clear canvas with background
      clearCanvas(ctx, width, height, '#1a1a2e');

      const padding = 40;
      const chartWidth = width - padding * 2;
      const chartHeight = height - padding * 2;

      // Draw grid
      drawGrid(ctx, width, height, padding, 5, '#2a2a3e');

      // Calculate scales
      const scales = calculateScales(data);
      
      // Draw axis labels
      drawAxisLabels(ctx, scales, width, height, padding, 5);

      // Downsample data for performance
      const maxPoints = 2000;
      const sampledData = downsampleSimple(data, maxPoints);

      // Draw line chart
      ctx.strokeStyle = color;
      ctx.lineWidth = 2;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.beginPath();

      let firstPoint = true;
      sampledData.forEach(point => {
        const { x, y } = dataToCanvas(point, scales, width, height, padding);
        
        if (firstPoint) {
          ctx.moveTo(x, y);
          firstPoint = false;
        } else {
          ctx.lineTo(x, y);
        }
      });

      ctx.stroke();

      // Add gradient fill under line (optional visual enhancement)
      if (sampledData.length > 1) {
        const gradient = ctx.createLinearGradient(0, padding, 0, height - padding);
        gradient.addColorStop(0, color + '40'); // 25% opacity
        gradient.addColorStop(1, color + '00'); // 0% opacity
        
        ctx.fillStyle = gradient;
        ctx.lineTo(width - padding, height - padding);
        ctx.lineTo(padding, height - padding);
        ctx.closePath();
        ctx.fill();
      }

      const renderTime = performance.now() - startTime;
      onRenderComplete(renderTime);
    };

    // Use RAF for smooth rendering
    animationFrameRef.current = requestAnimationFrame(render);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [data, width, height, color, onRenderComplete]);

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      className="rounded border border-gray-700"
      style={{ maxWidth: '100%', height: 'auto' }}
    />
  );
});

LineChart.displayName = 'LineChart';

export default LineChart;