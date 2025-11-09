import { useState, useRef, useCallback } from 'react';
import { PerformanceMetrics } from '@/lib/types';
import { getMemoryUsage, calculateFPS, average } from '@/lib/performanceUtils';

/**
 * usePerformanceMonitor Hook
 * 
 * Tracks and monitors rendering performance metrics.
 * Measures FPS, memory usage, and render times.
 * Updates metrics every second for smooth UI updates.
 * 
 * @returns {Object} Performance tracking utilities
 * @returns {PerformanceMetrics} metrics - Current performance metrics
 * @returns {Function} measureFrame - Call after each frame render
 * @returns {Function} reset - Reset all metrics
 * 
 * @example
 * const { metrics, measureFrame } = usePerformanceMonitor();
 * 
 * // After rendering
 * measureFrame(renderTime, dataPointCount);
 */
export function usePerformanceMonitor() {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    fps: 60,
    memoryUsage: 0,
    renderTime: 0,
    dataPoints: 0
  });

  // Frame tracking refs
  const frameCount = useRef(0);
  const lastTime = useRef(performance.now());
  const renderTimes = useRef<number[]>([]);

  /**
   * Measure a single frame's performance
   * Call this after each render cycle
   * 
   * @param renderTime - Time taken to render frame (ms)
   * @param dataPoints - Number of data points rendered
   */
  const measureFrame = useCallback((renderTime: number, dataPoints: number) => {
    // Increment frame counter
    frameCount.current++;
    
    // Track render times (keep last 60 samples)
    renderTimes.current.push(renderTime);
    if (renderTimes.current.length > 60) {
      renderTimes.current.shift();
    }

    const now = performance.now();
    const elapsed = now - lastTime.current;

    // Update metrics every second
    if (elapsed >= 1000) {
      const fps = calculateFPS(frameCount.current, elapsed);
      const avgRenderTime = average(renderTimes.current);
      const memoryUsage = getMemoryUsage();

      setMetrics({
        fps,
        memoryUsage,
        renderTime: avgRenderTime,
        dataPoints
      });

      // Reset counters for next measurement window
      frameCount.current = 0;
      lastTime.current = now;
    }
  }, []);

  /**
   * Reset all performance metrics
   * Useful when changing chart types or data
   */
  const reset = useCallback(() => {
    frameCount.current = 0;
    lastTime.current = performance.now();
    renderTimes.current = [];
    
    setMetrics({
      fps: 60,
      memoryUsage: 0,
      renderTime: 0,
      dataPoints: 0
    });
  }, []);

  return {
    metrics,
    measureFrame,
    reset
  };
}