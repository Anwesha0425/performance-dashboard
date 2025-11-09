'use client';

import { memo, useEffect } from 'react';
import { BaseChartProps } from '@/lib/types';
import { useChartRenderer } from '@/hooks/useChartRenderer';

// ============================================================================
// SCATTER PLOT COMPONENT
// ============================================================================

const ScatterPlot = memo(({
  data,
  width,
  height,
  color,
  onRenderComplete
}: BaseChartProps) => {
  const { canvasRef, renderScatterPlot } = useChartRenderer({
    data,
    width,
    height,
    color,
    onRenderComplete,
    maxPoints: 3000
  });

  useEffect(() => {
    renderScatterPlot();
  }, [renderScatterPlot]);

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      className="rounded border border-gray-700"
    />
  );
});

ScatterPlot.displayName = 'ScatterPlot';

export default ScatterPlot;