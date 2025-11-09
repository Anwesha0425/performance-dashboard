import { DataPoint } from './types';

// ============================================================================
// CANVAS RENDERING UTILITIES
// ============================================================================

/**
 * Get optimized canvas context
 */
export function getOptimizedContext(
  canvas: HTMLCanvasElement
): CanvasRenderingContext2D | null {
  return canvas.getContext('2d', {
    alpha: false, // Better performance
    desynchronized: true, // Reduce latency
  });
}

/**
 * Calculate scale factors for data mapping
 */
export interface ScaleFactors {
  xMin: number;
  xMax: number;
  xRange: number;
  yMin: number;
  yMax: number;
  yRange: number;
}

export function calculateScales(data: DataPoint[]): ScaleFactors {
  if (data.length === 0) {
    return {
      xMin: 0,
      xMax: 1,
      xRange: 1,
      yMin: 0,
      yMax: 1,
      yRange: 1
    };
  }

  const timestamps = data.map(d => d.timestamp);
  const values = data.map(d => d.value);

  const xMin = Math.min(...timestamps);
  const xMax = Math.max(...timestamps);
  const yMin = Math.min(...values);
  const yMax = Math.max(...values);

  return {
    xMin,
    xMax,
    xRange: xMax - xMin || 1,
    yMin,
    yMax,
    yRange: yMax - yMin || 1
  };
}

/**
 * Map data point to canvas coordinates
 */
export function dataToCanvas(
  point: DataPoint,
  scales: ScaleFactors,
  width: number,
  height: number,
  padding: number
): { x: number; y: number } {
  const chartWidth = width - padding * 2;
  const chartHeight = height - padding * 2;

  const x = padding + ((point.timestamp - scales.xMin) / scales.xRange) * chartWidth;
  const y = padding + chartHeight - ((point.value - scales.yMin) / scales.yRange) * chartHeight;

  return { x, y };
}

/**
 * Downsample data using Largest Triangle Three Buckets algorithm
 * This maintains visual fidelity while reducing points
 */
export function downsampleLTTB(
  data: DataPoint[],
  threshold: number
): DataPoint[] {
  if (data.length <= threshold) return data;

  const sampled: DataPoint[] = [data[0]]; // Always keep first point
  const bucketSize = (data.length - 2) / (threshold - 2);

  let a = 0; // Previous selected point

  for (let i = 0; i < threshold - 2; i++) {
    const avgRangeStart = Math.floor((i + 1) * bucketSize) + 1;
    const avgRangeEnd = Math.floor((i + 2) * bucketSize) + 1;
    const avgRangeLength = Math.min(avgRangeEnd, data.length) - avgRangeStart;

    // Calculate average point in next bucket
    let avgTimestamp = 0;
    let avgValue = 0;
    for (let j = avgRangeStart; j < Math.min(avgRangeEnd, data.length); j++) {
      avgTimestamp += data[j].timestamp;
      avgValue += data[j].value;
    }
    avgTimestamp /= avgRangeLength;
    avgValue /= avgRangeLength;

    // Find point with largest triangle area
    const rangeStart = Math.floor(i * bucketSize) + 1;
    const rangeEnd = Math.floor((i + 1) * bucketSize) + 1;

    let maxArea = -1;
    let maxAreaPoint = rangeStart;

    const pointA = data[a];

    for (let j = rangeStart; j < Math.min(rangeEnd, data.length); j++) {
      const pointB = data[j];
      const area = Math.abs(
        (pointA.timestamp - avgTimestamp) * (pointB.value - pointA.value) -
        (pointA.timestamp - pointB.timestamp) * (avgValue - pointA.value)
      );

      if (area > maxArea) {
        maxArea = area;
        maxAreaPoint = j;
      }
    }

    sampled.push(data[maxAreaPoint]);
    a = maxAreaPoint;
  }

  sampled.push(data[data.length - 1]); // Always keep last point

  return sampled;
}

/**
 * Simple downsampling - just pick every Nth point
 */
export function downsampleSimple(
  data: DataPoint[],
  maxPoints: number
): DataPoint[] {
  if (data.length <= maxPoints) return data;

  const step = Math.ceil(data.length / maxPoints);
  const sampled: DataPoint[] = [];

  for (let i = 0; i < data.length; i += step) {
    sampled.push(data[i]);
  }

  // Always include last point
  if (sampled[sampled.length - 1] !== data[data.length - 1]) {
    sampled.push(data[data.length - 1]);
  }

  return sampled;
}

/**
 * Clear canvas efficiently
 */
export function clearCanvas(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  backgroundColor: string = '#1a1a2e'
): void {
  ctx.fillStyle = backgroundColor;
  ctx.fillRect(0, 0, width, height);
}

/**
 * Draw grid lines
 */
export function drawGrid(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  padding: number,
  divisions: number = 5,
  color: string = '#2a2a3e'
): void {
  const chartWidth = width - padding * 2;
  const chartHeight = height - padding * 2;

  ctx.strokeStyle = color;
  ctx.lineWidth = 1;

  // Horizontal lines
  for (let i = 0; i <= divisions; i++) {
    const y = padding + (chartHeight / divisions) * i;
    ctx.beginPath();
    ctx.moveTo(padding, y);
    ctx.lineTo(width - padding, y);
    ctx.stroke();
  }

  // Vertical lines
  for (let i = 0; i <= divisions; i++) {
    const x = padding + (chartWidth / divisions) * i;
    ctx.beginPath();
    ctx.moveTo(x, padding);
    ctx.lineTo(x, height - padding);
    ctx.stroke();
  }
}

/**
 * Draw axis labels
 */
export function drawAxisLabels(
  ctx: CanvasRenderingContext2D,
  scales: ScaleFactors,
  width: number,
  height: number,
  padding: number,
  divisions: number = 5
): void {
  const chartHeight = height - padding * 2;

  ctx.fillStyle = '#888';
  ctx.font = '10px monospace';
  ctx.textAlign = 'right';

  // Y-axis labels
  for (let i = 0; i <= divisions; i++) {
    const value = scales.yMax - (scales.yRange / divisions) * i;
    const y = padding + (chartHeight / divisions) * i;
    ctx.fillText(value.toFixed(0), padding - 10, y + 3);
  }
}

/**
 * Measure rendering performance
 */
export function measureRenderTime(callback: () => void): number {
  const start = performance.now();
  callback();
  return performance.now() - start;
}