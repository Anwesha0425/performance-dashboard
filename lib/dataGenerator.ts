import { DataPoint } from './types';

// ============================================================================
// DATA GENERATION UTILITIES
// ============================================================================

const CATEGORIES = ['A', 'B', 'C', 'D'];

/**
 * Generate initial dataset with specified number of points
 * Uses sine wave pattern with random noise for realistic data
 */
export function generateInitialDataset(count: number): DataPoint[] {
  const now = Date.now();
  const points: DataPoint[] = [];
  
  for (let i = 0; i < count; i++) {
    points.push({
      timestamp: now - (count - i) * 100, // 100ms intervals
      value: generateValue(i),
      category: CATEGORIES[Math.floor(Math.random() * CATEGORIES.length)],
      metadata: {
        index: i,
        generated: true
      }
    });
  }
  
  return points;
}

/**
 * Generate a single new data point
 */
export function generateNewDataPoint(lastTimestamp: number): DataPoint {
  const timestamp = lastTimestamp + 100;
  
  return {
    timestamp,
    value: generateValue(timestamp),
    category: CATEGORIES[Math.floor(Math.random() * CATEGORIES.length)],
    metadata: {
      timestamp,
      generated: true
    }
  };
}

/**
 * Generate a realistic value using sine wave + noise
 */
function generateValue(seed: number): number {
  const sineWave = Math.sin(seed / 100) * 50;
  const noise = Math.random() * 20;
  const baseline = 50;
  
  return Math.max(0, Math.min(100, baseline + sineWave + noise));
}

/**
 * Generate batch of data points
 */
export function generateBatch(
  count: number,
  lastTimestamp: number
): DataPoint[] {
  const batch: DataPoint[] = [];
  let currentTimestamp = lastTimestamp;
  
  for (let i = 0; i < count; i++) {
    currentTimestamp += 100;
    batch.push({
      timestamp: currentTimestamp,
      value: generateValue(currentTimestamp),
      category: CATEGORIES[Math.floor(Math.random() * CATEGORIES.length)]
    });
  }
  
  return batch;
}

/**
 * Generate stress test dataset with more complex patterns
 */
export function generateStressTestDataset(count: number): DataPoint[] {
  const now = Date.now();
  const points: DataPoint[] = [];
  
  for (let i = 0; i < count; i++) {
    // Multiple sine waves for complexity
    const wave1 = Math.sin(i / 100) * 30;
    const wave2 = Math.sin(i / 50) * 20;
    const wave3 = Math.cos(i / 200) * 15;
    const noise = Math.random() * 10;
    const value = Math.max(0, Math.min(100, 50 + wave1 + wave2 + wave3 + noise));
    
    points.push({
      timestamp: now - (count - i) * 100,
      value,
      category: CATEGORIES[Math.floor(Math.random() * CATEGORIES.length)],
      metadata: {
        index: i,
        stressTest: true
      }
    });
  }
  
  return points;
}

/**
 * Aggregate data by category
 */
export function aggregateByCategory(data: DataPoint[]): Record<string, number> {
  return data.reduce((acc, point) => {
    acc[point.category] = (acc[point.category] || 0) + point.value;
    return acc;
  }, {} as Record<string, number>);
}

/**
 * Aggregate data by time window
 */
export function aggregateByTimeWindow(
  data: DataPoint[],
  windowMs: number
): DataPoint[] {
  if (data.length === 0) return [];
  
  const windows = new Map<number, { sum: number; count: number }>();
  
  data.forEach(point => {
    const windowKey = Math.floor(point.timestamp / windowMs) * windowMs;
    const window = windows.get(windowKey) || { sum: 0, count: 0 };
    window.sum += point.value;
    window.count += 1;
    windows.set(windowKey, window);
  });
  
  return Array.from(windows.entries()).map(([timestamp, { sum, count }]) => ({
    timestamp,
    value: sum / count,
    category: 'aggregated'
  }));
}