import { PerformanceMetrics, MemoryInfo } from './types';

// ============================================================================
// PERFORMANCE MONITORING UTILITIES
// ============================================================================

/**
 * Get current memory usage
 */
export function getMemoryUsage(): number {
  if (typeof performance !== 'undefined' && (performance as any).memory) {
    const memory = (performance as any).memory as MemoryInfo;
    return memory.usedJSHeapSize / (1024 * 1024); // Convert to MB
  }
  return 0;
}

/**
 * Calculate FPS from frame timestamps
 */
export function calculateFPS(frameCount: number, elapsedTime: number): number {
  if (elapsedTime === 0) return 0;
  return Math.round((frameCount * 1000) / elapsedTime);
}

/**
 * Calculate average from array of numbers
 */
export function average(numbers: number[]): number {
  if (numbers.length === 0) return 0;
  return numbers.reduce((sum, num) => sum + num, 0) / numbers.length;
}

/**
 * Create a performance observer for long tasks
 */
export function observeLongTasks(callback: (duration: number) => void): PerformanceObserver | null {
  if (typeof PerformanceObserver === 'undefined') return null;

  try {
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.duration > 50) { // Tasks longer than 50ms
          callback(entry.duration);
        }
      }
    });

    observer.observe({ entryTypes: ['longtask'] });
    return observer;
  } catch (e) {
    console.warn('Long task observation not supported');
    return null;
  }
}

/**
 * Measure function execution time
 */
export function measureExecutionTime<T>(
  fn: () => T,
  label: string = 'Function'
): { result: T; duration: number } {
  const start = performance.now();
  const result = fn();
  const duration = performance.now() - start;

  if (duration > 16.67) { // Longer than one frame at 60fps
    console.warn(`${label} took ${duration.toFixed(2)}ms (> 16.67ms frame budget)`);
  }

  return { result, duration };
}

/**
 * Throttle function calls
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  return function(this: any, ...args: Parameters<T>) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

/**
 * Debounce function calls
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;
  return function(this: any, ...args: Parameters<T>) {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), wait);
  };
}

/**
 * Request idle callback wrapper with fallback
 */
export function requestIdleCallbackPolyfill(
  callback: () => void,
  options?: { timeout?: number }
): number {
  if (typeof requestIdleCallback !== 'undefined') {
    return requestIdleCallback(callback, options);
  }
  // Fallback to setTimeout
  return setTimeout(callback, 1) as unknown as number;
}

/**
 * Cancel idle callback with fallback
 */
export function cancelIdleCallbackPolyfill(id: number): void {
  if (typeof cancelIdleCallback !== 'undefined') {
    cancelIdleCallback(id);
  } else {
    clearTimeout(id);
  }
}

/**
 * Check if we're dropping frames
 */
export function isFrameDropping(currentFPS: number, targetFPS: number = 60): boolean {
  return currentFPS < targetFPS * 0.9; // Allow 10% tolerance
}

/**
 * Get performance grade based on metrics
 */
export function getPerformanceGrade(metrics: PerformanceMetrics): {
  grade: 'A' | 'B' | 'C' | 'D' | 'F';
  color: string;
  description: string;
} {
  const { fps, renderTime } = metrics;

  if (fps >= 58 && renderTime < 10) {
    return {
      grade: 'A',
      color: '#10b981',
      description: 'Excellent performance'
    };
  } else if (fps >= 50 && renderTime < 15) {
    return {
      grade: 'B',
      color: '#3b82f6',
      description: 'Good performance'
    };
  } else if (fps >= 40 && renderTime < 20) {
    return {
      grade: 'C',
      color: '#f59e0b',
      description: 'Fair performance'
    };
  } else if (fps >= 25) {
    return {
      grade: 'D',
      color: '#ef4444',
      description: 'Poor performance'
    };
  } else {
    return {
      grade: 'F',
      color: '#dc2626',
      description: 'Critical performance issues'
    };
  }
}

/**
 * Create performance mark for profiling
 */
export function mark(name: string): void {
  if (typeof performance !== 'undefined' && performance.mark) {
    performance.mark(name);
  }
}

/**
 * Measure between two performance marks
 */
export function measure(name: string, startMark: string, endMark: string): number {
  if (typeof performance !== 'undefined' && performance.measure) {
    performance.measure(name, startMark, endMark);
    const measures = performance.getEntriesByName(name);
    if (measures.length > 0) {
      return measures[0].duration;
    }
  }
  return 0;
}

/**
 * Clear all performance marks and measures
 */
export function clearPerformanceMetrics(): void {
  if (typeof performance !== 'undefined') {
    performance.clearMarks();
    performance.clearMeasures();
  }
}

/**
 * Log performance metrics to console
 */
export function logPerformanceMetrics(metrics: PerformanceMetrics): void {
  const grade = getPerformanceGrade(metrics);
  
  console.group('📊 Performance Metrics');
  console.log(`Grade: ${grade.grade} - ${grade.description}`);
  console.log(`FPS: ${metrics.fps}`);
  console.log(`Memory: ${metrics.memoryUsage.toFixed(2)} MB`);
  console.log(`Render Time: ${metrics.renderTime.toFixed(2)} ms`);
  console.log(`Data Points: ${metrics.dataPoints.toLocaleString()}`);
  console.groupEnd();
}