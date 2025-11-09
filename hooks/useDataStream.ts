import { useState, useEffect, useRef, useCallback, useTransition } from 'react';
import { DataPoint } from '@/lib/types';
import { generateNewDataPoint } from '@/lib/dataGenerator';

/**
 * useDataStream Hook
 * 
 * Manages real-time data streaming with automatic cleanup.
 * Implements sliding window to prevent memory leaks.
 * Uses React 18 transitions for non-blocking updates.
 * 
 * @param options - Configuration options
 * @returns {Object} Data stream utilities
 * 
 * @example
 * const { data, isStreaming, toggle, replaceData } = useDataStream({
 *   initialData: [...],
 *   interval: 100,
 *   maxDataPoints: 15000,
 *   autoStart: true
 * });
 */

interface UseDataStreamOptions {
  initialData: DataPoint[];
  interval?: number;
  maxDataPoints?: number;
  autoStart?: boolean;
}

export function useDataStream({
  initialData,
  interval = 100,
  maxDataPoints = 15000,
  autoStart = true
}: UseDataStreamOptions) {
  const [data, setData] = useState<DataPoint[]>(initialData);
  const [isStreaming, setIsStreaming] = useState(autoStart);
  const [isPending, startTransition] = useTransition();
  
  const streamInterval = useRef<NodeJS.Timeout>();

  /**
   * Add new data point(s) to the stream
   * Implements sliding window to maintain max size
   * 
   * @param newPoint - Single point or array of points to add
   */
  const addDataPoint = useCallback((newPoint: DataPoint | DataPoint[]) => {
    startTransition(() => {
      setData(prevData => {
        const points = Array.isArray(newPoint) ? newPoint : [newPoint];
        const updated = [...prevData, ...points];
        
        // Sliding window: keep only last N points
        if (updated.length > maxDataPoints) {
          return updated.slice(-maxDataPoints);
        }
        
        return updated;
      });
    });
  }, [maxDataPoints]);

  /**
   * Replace entire dataset
   * Useful for stress tests or data resets
   * 
   * @param newData - Complete new dataset
   */
  const replaceData = useCallback((newData: DataPoint[]) => {
    startTransition(() => {
      setData(newData);
    });
  }, []);

  /**
   * Clear all data points
   */
  const clearData = useCallback(() => {
    startTransition(() => {
      setData([]);
    });
  }, []);

  /**
   * Start data streaming
   */
  const start = useCallback(() => {
    setIsStreaming(true);
  }, []);

  /**
   * Stop data streaming
   */
  const stop = useCallback(() => {
    setIsStreaming(false);
  }, []);

  /**
   * Toggle streaming on/off
   */
  const toggle = useCallback(() => {
    setIsStreaming(prev => !prev);
  }, []);

  /**
   * Real-time data streaming effect
   * Automatically generates new data at specified interval
   */
  useEffect(() => {
    // Clear any existing interval
    if (streamInterval.current) {
      clearInterval(streamInterval.current);
    }

    // Don't start new interval if not streaming
    if (!isStreaming) {
      return;
    }

    // Start streaming data
    streamInterval.current = setInterval(() => {
      const lastTimestamp = data[data.length - 1]?.timestamp || Date.now();
      const newPoint = generateNewDataPoint(lastTimestamp);
      addDataPoint(newPoint);
    }, interval);

    // Cleanup on unmount or when dependencies change
    return () => {
      if (streamInterval.current) {
        clearInterval(streamInterval.current);
      }
    };
  }, [isStreaming, data, interval, addDataPoint]);

  return {
    data,
    isStreaming,
    isPending,
    addDataPoint,
    replaceData,
    clearData,
    start,
    stop,
    toggle
  };
}