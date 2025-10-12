// Performance Monitoring Service
// Comprehensive monitoring for production applications

interface PerformanceMetric {
  name: string;
  value: number;
  timestamp: number;
  tags: Record<string, string>;
  metadata?: Record<string, any>;
}

interface PerformanceSpan {
  id: string;
  name: string;
  startTime: number;
  endTime?: number;
  duration?: number;
  tags: Record<string, string>;
  metadata?: Record<string, any>;
  parentId?: string;
  children: PerformanceSpan[];
}

interface ErrorMetric {
  message: string;
  stack?: string;
  timestamp: number;
  userId?: string;
  sessionId?: string;
  url: string;
  userAgent: string;
  tags: Record<string, string>;
}

interface PerformanceReport {
  period: {
    start: number;
    end: number;
  };
  metrics: {
    avgResponseTime: number;
    p95ResponseTime: number;
    p99ResponseTime: number;
    errorRate: number;
    throughput: number;
    cacheHitRate: number;
    memoryUsage: number;
  };
  topEndpoints: Array<{
    endpoint: string;
    avgTime: number;
    callCount: number;
    errorCount: number;
  }>;
  errors: ErrorMetric[];
  alerts: Array<{
    type: 'error_rate' | 'response_time' | 'memory' | 'throughput';
    severity: 'low' | 'medium' | 'high' | 'critical';
    message: string;
    value: number;
    threshold: number;
  }>;
}

class PerformanceMonitor {
  private metrics: PerformanceMetric[] = [];
  private spans: Map<string, PerformanceSpan> = new Map();
  private errors: ErrorMetric[] = [];
  private maxMetrics = 10000; // Keep last 10k metrics
  private maxErrors = 1000; // Keep last 1k errors

  // Configuration
  private config = {
    enableMetrics: true,
    enableTracing: true,
    enableErrorTracking: true,
    reportInterval: 60000, // 1 minute
    alertThresholds: {
      errorRate: 0.05, // 5%
      responseTimeP95: 2000, // 2 seconds
      memoryUsage: 100 * 1024 * 1024, // 100MB
      throughput: 100 // requests per minute
    }
  };

  constructor() {
    // Start periodic reporting
    setInterval(() => this.generateReport(), this.config.reportInterval);

    // Track page visibility for performance
    if (typeof document !== 'undefined') {
      document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
          this.recordMetric('page_hidden', 1, { event: 'visibility' });
        } else {
          this.recordMetric('page_visible', 1, { event: 'visibility' });
        }
      });
    }

    // Track memory usage
    if (typeof performance !== 'undefined' && (performance as any).memory) {
      setInterval(() => {
        const memInfo = (performance as any).memory;
        this.recordMetric('memory_used', memInfo.usedJSHeapSize, { type: 'heap' });
        this.recordMetric('memory_total', memInfo.totalJSHeapSize, { type: 'heap' });
        this.recordMetric('memory_limit', memInfo.jsHeapSizeLimit, { type: 'heap' });
      }, 30000); // Every 30 seconds
    }
  }

  // Record a performance metric
  recordMetric(
    name: string,
    value: number,
    tags: Record<string, string> = {},
    metadata?: Record<string, any>
  ): void {
    if (!this.config.enableMetrics) return;

    const metric: PerformanceMetric = {
      name,
      value,
      timestamp: Date.now(),
      tags,
      metadata
    };

    this.metrics.push(metric);

    // Maintain size limit
    if (this.metrics.length > this.maxMetrics) {
      this.metrics = this.metrics.slice(-this.maxMetrics);
    }

    // Check for alerts
    this.checkAlerts(metric);
  }

  // Start a performance span (for tracing)
  startSpan(
    name: string,
    tags: Record<string, string> = {},
    parentId?: string
  ): string {
    if (!this.config.enableTracing) return '';

    const spanId = `${name}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const span: PerformanceSpan = {
      id: spanId,
      name,
      startTime: performance.now(),
      tags,
      children: [],
      parentId
    };

    this.spans.set(spanId, span);

    // Add to parent if exists
    if (parentId && this.spans.has(parentId)) {
      const parent = this.spans.get(parentId)!;
      parent.children.push(span);
    }

    return spanId;
  }

  // End a performance span
  endSpan(spanId: string, metadata?: Record<string, any>): void {
    if (!this.config.enableTracing) return;

    const span = this.spans.get(spanId);
    if (!span) return;

    span.endTime = performance.now();
    span.duration = span.endTime - span.startTime;

    if (metadata) {
      span.metadata = { ...span.metadata, ...metadata };
    }

    // Record as metric
    this.recordMetric(
      `span_${span.name}`,
      span.duration,
      span.tags,
      { spanId, parentId: span.parentId, childrenCount: span.children.length }
    );
  }

  // Record an error
  recordError(
    error: Error | string,
    tags: Record<string, string> = {},
    context?: {
      userId?: string;
      sessionId?: string;
      url?: string;
      userAgent?: string;
    }
  ): void {
    if (!this.config.enableErrorTracking) return;

    const errorMetric: ErrorMetric = {
      message: error instanceof Error ? error.message : error,
      stack: error instanceof Error ? error.stack : undefined,
      timestamp: Date.now(),
      userId: context?.userId,
      sessionId: context?.sessionId,
      url: context?.url || (typeof window !== 'undefined' ? window.location.href : ''),
      userAgent: context?.userAgent || (typeof navigator !== 'undefined' ? navigator.userAgent : ''),
      tags
    };

    this.errors.push(errorMetric);

    // Maintain size limit
    if (this.errors.length > this.maxErrors) {
      this.errors = this.errors.slice(-this.maxErrors);
    }

    // Record as metric
    this.recordMetric('error_count', 1, { ...tags, error_type: 'application' });
  }

  // Track API call performance
  trackAPICall(
    url: string,
    method: string,
    startTime: number,
    endTime: number,
    statusCode: number,
    error?: Error
  ): void {
    const duration = endTime - startTime;

    this.recordMetric(
      'api_response_time',
      duration,
      {
        url: url.split('?')[0], // Remove query params
        method,
        status: statusCode.toString(),
        success: (statusCode >= 200 && statusCode < 300).toString()
      }
    );

    if (error) {
      this.recordError(error, {
        type: 'api_error',
        url,
        method,
        status: statusCode.toString()
      });
    }
  }

  // Track user interaction performance
  trackUserInteraction(
    interactionType: string,
    element: string,
    startTime: number,
    endTime?: number
  ): void {
    const duration = endTime ? endTime - startTime : performance.now() - startTime;

    this.recordMetric(
      'user_interaction',
      duration,
      {
        type: interactionType,
        element,
        completed: (endTime !== undefined).toString()
      }
    );
  }

  // Generate comprehensive performance report
  generateReport(timeRange: number = 300000): PerformanceReport { // Default 5 minutes
    const now = Date.now();
    const startTime = now - timeRange;

    // Filter metrics for the time range
    const relevantMetrics = this.metrics.filter(m => m.timestamp >= startTime);
    const relevantErrors = this.errors.filter(e => e.timestamp >= startTime);

    // Calculate response time metrics
    const responseTimeMetrics = relevantMetrics.filter(m =>
      m.name === 'api_response_time' || m.name.startsWith('span_')
    );

    const responseTimes = responseTimeMetrics.map(m => m.value).sort((a, b) => a - b);
    const avgResponseTime = responseTimes.length > 0 ?
      responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length : 0;

    const p95ResponseTime = this.calculatePercentile(responseTimes, 95);
    const p99ResponseTime = this.calculatePercentile(responseTimes, 99);

    // Calculate error rate
    const totalRequests = responseTimeMetrics.length;
    const errorCount = relevantMetrics.filter(m => m.tags.success === 'false').length;
    const errorRate = totalRequests > 0 ? errorCount / totalRequests : 0;

    // Calculate throughput (requests per minute)
    const throughput = totalRequests / (timeRange / 60000);

    // Calculate cache hit rate
    const cacheMetrics = relevantMetrics.filter(m => m.name.includes('cache'));
    const cacheHits = cacheMetrics.filter(m => m.tags.hit === 'true').length;
    const cacheMisses = cacheMetrics.filter(m => m.tags.hit === 'false').length;
    const cacheHitRate = (cacheHits + cacheMisses) > 0 ? cacheHits / (cacheHits + cacheMisses) : 0;

    // Get memory usage
    const memoryMetrics = relevantMetrics.filter(m => m.name === 'memory_used');
    const memoryUsage = memoryMetrics.length > 0 ?
      memoryMetrics[memoryMetrics.length - 1].value : 0;

    // Get top endpoints
    const endpointMetrics = responseTimeMetrics.filter(m => m.tags.url);
    const endpointStats = new Map<string, { totalTime: number; count: number; errors: number }>();

    endpointMetrics.forEach(metric => {
      const url = metric.tags.url!;
      const existing = endpointStats.get(url) || { totalTime: 0, count: 0, errors: 0 };

      existing.totalTime += metric.value;
      existing.count += 1;
      if (metric.tags.success === 'false') existing.errors += 1;

      endpointStats.set(url, existing);
    });

    const topEndpoints = Array.from(endpointStats.entries())
      .map(([endpoint, stats]) => ({
        endpoint,
        avgTime: stats.totalTime / stats.count,
        callCount: stats.count,
        errorCount: stats.errors
      }))
      .sort((a, b) => b.callCount - a.callCount)
      .slice(0, 10);

    // Generate alerts
    const alerts = [];

    if (errorRate > this.config.alertThresholds.errorRate) {
      alerts.push({
        type: 'error_rate' as const,
        severity: (errorRate > 0.1 ? 'critical' : 'high') as 'low' | 'medium' | 'high' | 'critical',
        message: `Error rate is ${(errorRate * 100).toFixed(1)}%, above threshold of ${(this.config.alertThresholds.errorRate * 100)}%`,
        value: errorRate,
        threshold: this.config.alertThresholds.errorRate
      });
    }

    if (p95ResponseTime > this.config.alertThresholds.responseTimeP95) {
      alerts.push({
        type: 'response_time' as const,
        severity: (p95ResponseTime > 5000 ? 'critical' : 'high') as 'low' | 'medium' | 'high' | 'critical',
        message: `P95 response time is ${p95ResponseTime.toFixed(0)}ms, above threshold of ${this.config.alertThresholds.responseTimeP95}ms`,
        value: p95ResponseTime,
        threshold: this.config.alertThresholds.responseTimeP95
      });
    }

    if (memoryUsage > this.config.alertThresholds.memoryUsage) {
      alerts.push({
        type: 'memory' as const,
        severity: 'high' as 'low' | 'medium' | 'high' | 'critical',
        message: `Memory usage is ${(memoryUsage / 1024 / 1024).toFixed(1)}MB, above threshold of ${(this.config.alertThresholds.memoryUsage / 1024 / 1024)}MB`,
        value: memoryUsage,
        threshold: this.config.alertThresholds.memoryUsage
      });
    }

    return {
      period: { start: startTime, end: now },
      metrics: {
        avgResponseTime,
        p95ResponseTime,
        p99ResponseTime,
        errorRate,
        throughput,
        cacheHitRate,
        memoryUsage
      },
      topEndpoints,
      errors: relevantErrors.slice(-50), // Last 50 errors
      alerts
    };
  }

  // Get current performance snapshot
  getSnapshot(): {
    activeSpans: number;
    recentMetrics: PerformanceMetric[];
    recentErrors: ErrorMetric[];
    memoryUsage: number;
    cacheStats?: any;
  } {
    const memoryMetrics = this.metrics.filter(m => m.name === 'memory_used');
    const memoryUsage = memoryMetrics.length > 0 ?
      memoryMetrics[memoryMetrics.length - 1].value : 0;

    return {
      activeSpans: this.spans.size,
      recentMetrics: this.metrics.slice(-20),
      recentErrors: this.errors.slice(-10),
      memoryUsage
    };
  }

  // Utility functions
  private calculatePercentile(sortedArray: number[], percentile: number): number {
    if (sortedArray.length === 0) return 0;

    const index = (percentile / 100) * (sortedArray.length - 1);
    const lower = Math.floor(index);
    const upper = Math.ceil(index);

    if (lower === upper) {
      return sortedArray[lower];
    }

    const weight = index - lower;
    return sortedArray[lower] * (1 - weight) + sortedArray[upper] * weight;
  }

  private checkAlerts(metric: PerformanceMetric): void {
    // Alert checking logic would go here
    // This is a simplified version - in production, you'd have more sophisticated alerting
  }

  // Clean up old data
  cleanup(maxAge: number = 3600000): void { // Default 1 hour
    const cutoff = Date.now() - maxAge;

    this.metrics = this.metrics.filter(m => m.timestamp > cutoff);
    this.errors = this.errors.filter(e => e.timestamp > cutoff);

    // Clean up completed spans
    for (const [id, span] of this.spans.entries()) {
      if (span.endTime && Date.now() - span.startTime > maxAge) {
        this.spans.delete(id);
      }
    }
  }
}

// Create singleton instance
export const performanceMonitor = new PerformanceMonitor();

// Convenience functions for tracking
export function trackAPIResponse(
  url: string,
  method: string,
  startTime: number,
  statusCode: number,
  error?: Error
): void {
  performanceMonitor.trackAPICall(url, method, startTime, performance.now(), statusCode, error);
}

export function trackUserInteraction(
  type: string,
  element: string,
  startTime: number,
  endTime?: number
): void {
  performanceMonitor.trackUserInteraction(type, element, startTime, endTime);
}

export function trackAIResponse(
  query: string,
  intent: string,
  responseTime: number,
  cacheHit: boolean,
  error?: string,
  tokenCount?: number
): void {
  performanceMonitor.recordMetric(
    'ai_response_time',
    responseTime,
    {
      intent,
      cache_hit: cacheHit.toString(),
      has_error: (error !== undefined).toString()
    },
    {
      query_length: query.length,
      token_count: tokenCount,
      error_message: error
    }
  );
}

// Export types
export type { PerformanceMetric, PerformanceSpan, ErrorMetric, PerformanceReport };