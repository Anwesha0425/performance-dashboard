'use client';

import { memo, useEffect } from 'react';
import { BaseChartProps } from '@/lib/types';
import { useChartRenderer } from '@/hooks/useChartRenderer';

// ============================================================================
// BAR CHART COMPONENT
// ============================================================================

const BarChart = memo(({
  data,
  width,
  height,
  color,
  onRenderComplete
}: BaseChartProps) => {
  const { canvasRef, renderBarChart } = useChartRenderer({
    data,
    width,
    height,
    color,
    onRenderComplete
  });

  useEffect(() => {
    renderBarChart();
  }, [renderBarChart]);

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      className="rounded border border-gray-700"
    />
  );
});

BarChart.displayName = 'BarChart';

export default BarChart;