'use client';

import { memo, useEffect, useRef } from 'react';
import { HeatmapProps } from '@/lib/types';
import { getOptimizedContext, clearCanvas } from '@/lib/canvasUtils';

// ============================================================================
// HEATMAP COMPONENT
// ============================================================================

const Heatmap = memo(({
  data,
  width,
  height,
  onRenderComplete
}: HeatmapProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || data.length === 0) return;

    const ctx = getOptimizedContext(canvas);
    if (!ctx) return;

    const startTime = performance.now();

    clearCanvas(ctx, width, height);

    const padding = 40;
    const gridSize = 20;
    const cols = Math.floor((width - padding * 2) / gridSize);
    const rows = Math.floor((height - padding * 2) / gridSize);

    // Initialize grid
    const grid: number[][] = Array(rows)
      .fill(0)
      .map(() => Array(cols).fill(0));

    // Map data to grid
    data.forEach(point => {
      const col = Math.floor((point.timestamp % 1000) / 1000 * cols);
      const row = Math.floor((point.value / 100) * rows);
      if (row >= 0 && row < rows && col >= 0 && col < cols) {
        grid[row][col]++;
      }
    });

    const maxCount = Math.max(...grid.flat(), 1);

    // Draw heatmap
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const intensity = grid[r][c] / maxCount;
        const red = Math.floor(intensity * 255);
        const blue = 255 - red;
        const green = Math.floor(intensity * 100);
        
        ctx.fillStyle = `rgb(${red}, ${green}, ${blue})`;
        ctx.fillRect(
          padding + c * gridSize,
          padding + r * gridSize,
          gridSize - 1,
          gridSize - 1
        );
      }
    }

    const renderTime = performance.now() - startTime;
    onRenderComplete(renderTime);
  }, [data, width, height, onRenderComplete]);

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      className="rounded border border-gray-700"
    />
  );
});

Heatmap.displayName = 'Heatmap';

export default Heatmap;