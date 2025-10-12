// Health Check Service
// Comprehensive health monitoring for all system components

import { cacheService } from './cacheService';
import { performanceMonitor } from './performanceMonitor';
import { errorHandler } from './errorHandler';
import { securityService } from './securityService';
import { databaseOptimizationService } from './databaseOptimizationService';

interface HealthCheckResult {
  service: string;
  status: 'healthy' | 'degraded' | 'unhealthy';
  responseTime: number;
  message?: string;
  details?: Record<string, any>;
  timestamp: number;
}

interface SystemHealth {
  overall: 'healthy' | 'degraded' | 'unhealthy';
  uptime: number;
  version: string;
  environment: string;
  checks: HealthCheckResult[];
  summary: {
    total: number;
    healthy: number;
    degraded: number;
    unhealthy: number;
  };
  timestamp: number;
}

class HealthCheckService {
  private startTime = Date.now();
  private version = '1.0.0'; // Would be injected from build process
  private environment = process.env.NODE_ENV || 'development';

  // Perform comprehensive health check
  async performFullHealthCheck(): Promise<SystemHealth> {
    const checks: HealthCheckResult[] = [];
    const checkStartTime = performance.now();

    // Cache Health Check
    checks.push(await this.checkCacheHealth());

    // Performance Monitor Health Check
    checks.push(await this.checkPerformanceHealth());

    // Error Handler Health Check
    checks.push(await this.checkErrorHandlerHealth());

    // Security Service Health Check
    checks.push(await this.checkSecurityHealth());

    // Database Health Check
    checks.push(await this.checkDatabaseHealth());

    // Memory Health Check
    checks.push(await this.checkMemoryHealth());

    // Network Health Check
    checks.push(await this.checkNetworkHealth());

    const checkEndTime = performance.now();
    const totalCheckTime = checkEndTime - checkStartTime;

    // Calculate summary
    const summary = {
      total: checks.length,
      healthy: checks.filter(c => c.status === 'healthy').length,
      degraded: checks.filter(c => c.status === 'degraded').length,
      unhealthy: checks.filter(c => c.status === 'unhealthy').length
    };

    // Determine overall health
    let overall: 'healthy' | 'degraded' | 'unhealthy' = 'healthy';
    if (summary.unhealthy > 0) {
      overall = 'unhealthy';
    } else if (summary.degraded > 0 || summary.healthy < summary.total * 0.8) {
      overall = 'degraded';
    }

    return {
      overall,
      uptime: Date.now() - this.startTime,
      version: this.version,
      environment: this.environment,
      checks,
      summary,
      timestamp: Date.now()
    };
  }

  // Individual health checks
  private async checkCacheHealth(): Promise<HealthCheckResult> {
    const startTime = performance.now();

    try {
      // Test cache operations
      const testKey = `health_check_${Date.now()}`;
      const testData = { test: 'health_check_data', timestamp: Date.now() };

      // Test set operation
      await cacheService.set(testKey, testData, { ttl: 60000 });

      // Test get operation
      const retrieved = await cacheService.get(testKey);

      // Test cache stats
      const stats = cacheService.getStats();

      const responseTime = performance.now() - startTime;

      // Clean up
      await cacheService.delete(testKey);

      const isHealthy = retrieved !== null && stats.entries >= 0;

      return {
        service: 'cache',
        status: isHealthy ? 'healthy' : 'unhealthy',
        responseTime,
        message: isHealthy ? 'Cache operations working correctly' : 'Cache operations failed',
        details: {
          cacheSize: stats.entries,
          hitRate: stats.metrics.hitRate,
          testSuccessful: isHealthy
        },
        timestamp: Date.now()
      };
    } catch (error) {
      const responseTime = performance.now() - startTime;
      return {
        service: 'cache',
        status: 'unhealthy',
        responseTime,
        message: `Cache health check failed: ${(error as Error).message}`,
        details: { error: (error as Error).message },
        timestamp: Date.now()
      };
    }
  }

  private async checkPerformanceHealth(): Promise<HealthCheckResult> {
    const startTime = performance.now();

    try {
      // Get performance snapshot
      const snapshot = performanceMonitor.getSnapshot();

      // Generate a performance report
      const report = performanceMonitor.generateReport(300000); // Last 5 minutes

      const responseTime = performance.now() - startTime;

      // Check if metrics are being collected
      const hasRecentMetrics = snapshot.recentMetrics.length > 0;
      const hasRecentErrors = snapshot.recentErrors.length >= 0; // Errors can be empty

      const isHealthy = hasRecentMetrics && responseTime < 100; // Should respond quickly

      return {
        service: 'performance_monitor',
        status: isHealthy ? 'healthy' : 'degraded',
        responseTime,
        message: isHealthy ? 'Performance monitoring operational' : 'Performance monitoring degraded',
        details: {
          activeSpans: snapshot.activeSpans,
          recentMetricsCount: snapshot.recentMetrics.length,
          recentErrorsCount: snapshot.recentErrors.length,
          memoryUsage: snapshot.memoryUsage,
          avgResponseTime: report.metrics.avgResponseTime
        },
        timestamp: Date.now()
      };
    } catch (error) {
      const responseTime = performance.now() - startTime;
      return {
        service: 'performance_monitor',
        status: 'unhealthy',
        responseTime,
        message: `Performance monitor health check failed: ${(error as Error).message}`,
        details: { error: (error as Error).message },
        timestamp: Date.now()
      };
    }
  }

  private async checkErrorHandlerHealth(): Promise<HealthCheckResult> {
    const startTime = performance.now();

    try {
      // Get error statistics
      const stats = errorHandler.getErrorStats(3600000); // Last hour

      // Test error handling (without actually creating errors)
      const testError = new Error('Health check test error');
      await errorHandler.handleError(testError, {
        additionalData: { healthCheck: true }
      }, {
        severity: 'low',
        category: 'logic',
        report: false // Don't report test errors
      });

      const responseTime = performance.now() - startTime;

      // Error handler is healthy if it can process errors and provide stats
      const isHealthy = stats !== undefined && responseTime < 50;

      return {
        service: 'error_handler',
        status: isHealthy ? 'healthy' : 'degraded',
        responseTime,
        message: isHealthy ? 'Error handling operational' : 'Error handling degraded',
        details: {
          totalErrors: stats.totalErrors,
          errorsByCategory: stats.errorsByCategory,
          errorsBySeverity: stats.errorsBySeverity,
          topErrorMessages: stats.topErrorMessages.length
        },
        timestamp: Date.now()
      };
    } catch (error) {
      const responseTime = performance.now() - startTime;
      return {
        service: 'error_handler',
        status: 'unhealthy',
        responseTime,
        message: `Error handler health check failed: ${(error as Error).message}`,
        details: { error: (error as Error).message },
        timestamp: Date.now()
      };
    }
  }

  private async checkSecurityHealth(): Promise<HealthCheckResult> {
    const startTime = performance.now();

    try {
      // Test rate limiting
      const rateLimitResult = securityService.checkRateLimit('health_check', {
        windowMs: 60000,
        maxRequests: 100
      });

      // Test input validation
      const validation = securityService.validateInput(
        { test: 'valid_input' },
        [{ field: 'test', type: 'string', required: true }]
      );

      // Get security stats
      const stats = securityService.getSecurityStats(3600000); // Last hour

      const responseTime = performance.now() - startTime;

      const isHealthy = validation.valid && rateLimitResult.allowed && responseTime < 50;

      return {
        service: 'security',
        status: isHealthy ? 'healthy' : 'degraded',
        responseTime,
        message: isHealthy ? 'Security services operational' : 'Security services degraded',
        details: {
          rateLimitAllowed: rateLimitResult.allowed,
          validationWorking: validation.valid,
          totalEvents: stats.totalEvents,
          suspiciousActivities: stats.suspiciousActivities,
          rateLimitHits: stats.rateLimitHits
        },
        timestamp: Date.now()
      };
    } catch (error) {
      const responseTime = performance.now() - startTime;
      return {
        service: 'security',
        status: 'unhealthy',
        responseTime,
        message: `Security health check failed: ${(error as Error).message}`,
        details: { error: (error as Error).message },
        timestamp: Date.now()
      };
    }
  }

  private async checkDatabaseHealth(): Promise<HealthCheckResult> {
    const startTime = performance.now();

    try {
      // Perform database health check
      const healthResult = await databaseOptimizationService.healthCheck();

      // Get database statistics
      const stats = databaseOptimizationService.getDatabaseStats(3600000); // Last hour

      const responseTime = performance.now() - startTime;

      const isHealthy = healthResult.healthy && responseTime < 200; // DB should respond within 200ms

      return {
        service: 'database',
        status: isHealthy ? 'healthy' : (healthResult.healthy ? 'degraded' : 'unhealthy'),
        responseTime,
        message: isHealthy ? 'Database operational' : `Database ${healthResult.healthy ? 'slow' : 'unhealthy'}`,
        details: {
          dbResponseTime: healthResult.responseTime,
          totalQueries: stats.totalQueries,
          successfulQueries: stats.successfulQueries,
          failedQueries: stats.failedQueries,
          averageQueryTime: stats.averageQueryTime,
          slowQueries: stats.slowQueries,
          cachedQueries: stats.cachedQueries
        },
        timestamp: Date.now()
      };
    } catch (error) {
      const responseTime = performance.now() - startTime;
      return {
        service: 'database',
        status: 'unhealthy',
        responseTime,
        message: `Database health check failed: ${(error as Error).message}`,
        details: { error: (error as Error).message },
        timestamp: Date.now()
      };
    }
  }

  private async checkMemoryHealth(): Promise<HealthCheckResult> {
    const startTime = performance.now();

    try {
      // Check memory usage
      const memInfo = (performance as any).memory;
      if (!memInfo) {
        throw new Error('Memory info not available');
      }

      const usedMB = memInfo.usedJSHeapSize / 1024 / 1024;
      const limitMB = memInfo.jsHeapSizeLimit / 1024 / 1024;
      const usagePercent = (usedMB / limitMB) * 100;

      const responseTime = performance.now() - startTime;

      // Memory is healthy if usage is below 90%
      const isHealthy = usagePercent < 90;
      const isDegraded = usagePercent >= 80;

      let status: 'healthy' | 'degraded' | 'unhealthy' = 'healthy';
      if (!isHealthy) {
        status = 'unhealthy';
      } else if (isDegraded) {
        status = 'degraded';
      }

      return {
        service: 'memory',
        status,
        responseTime,
        message: `Memory usage: ${usagePercent.toFixed(1)}%`,
        details: {
          usedMB: Math.round(usedMB),
          limitMB: Math.round(limitMB),
          usagePercent: Math.round(usagePercent * 10) / 10
        },
        timestamp: Date.now()
      };
    } catch (error) {
      const responseTime = performance.now() - startTime;
      return {
        service: 'memory',
        status: 'unhealthy',
        responseTime,
        message: `Memory health check failed: ${(error as Error).message}`,
        details: { error: (error as Error).message },
        timestamp: Date.now()
      };
    }
  }

  private async checkNetworkHealth(): Promise<HealthCheckResult> {
    const startTime = performance.now();

    try {
      // Test basic network connectivity
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout

      const response = await fetch('https://httpbin.org/status/200', {
        method: 'GET',
        signal: controller.signal,
        headers: {
          'User-Agent': 'HealthCheck/1.0'
        }
      });

      clearTimeout(timeoutId);
      const responseTime = performance.now() - startTime;

      const isHealthy = response.ok && responseTime < 2000; // Should respond within 2 seconds

      return {
        service: 'network',
        status: isHealthy ? 'healthy' : 'degraded',
        responseTime,
        message: isHealthy ? 'Network connectivity good' : 'Network connectivity slow',
        details: {
          statusCode: response.status,
          responseTime: Math.round(responseTime),
          connected: true
        },
        timestamp: Date.now()
      };
    } catch (error) {
      const responseTime = performance.now() - startTime;
      return {
        service: 'network',
        status: 'unhealthy',
        responseTime,
        message: `Network health check failed: ${(error as Error).message}`,
        details: {
          error: (error as Error).message,
          connected: false
        },
        timestamp: Date.now()
      };
    }
  }

  // Get detailed health report for a specific service
  async getServiceHealth(serviceName: string): Promise<HealthCheckResult | null> {
    const fullHealth = await this.performFullHealthCheck();
    return fullHealth.checks.find(check => check.service === serviceName) || null;
  }

  // Get health status summary
  async getHealthSummary(): Promise<{
    overall: 'healthy' | 'degraded' | 'unhealthy';
    uptime: number;
    services: Record<string, 'healthy' | 'degraded' | 'unhealthy'>;
    timestamp: number;
  }> {
    const fullHealth = await this.performFullHealthCheck();

    const services: Record<string, 'healthy' | 'degraded' | 'unhealthy'> = {};
    fullHealth.checks.forEach(check => {
      services[check.service] = check.status;
    });

    return {
      overall: fullHealth.overall,
      uptime: fullHealth.uptime,
      services,
      timestamp: fullHealth.timestamp
    };
  }

  // Check if system is ready for production traffic
  async isProductionReady(): Promise<{
    ready: boolean;
    issues: string[];
    recommendations: string[];
  }> {
    const health = await this.performFullHealthCheck();
    const issues: string[] = [];
    const recommendations: string[] = [];

    // Check for unhealthy services
    health.checks.forEach(check => {
      if (check.status === 'unhealthy') {
        issues.push(`${check.service} is unhealthy: ${check.message}`);
      } else if (check.status === 'degraded') {
        issues.push(`${check.service} is degraded: ${check.message}`);
        recommendations.push(`Monitor ${check.service} performance closely`);
      }
    });

    // Check memory usage
    const memoryCheck = health.checks.find(c => c.service === 'memory');
    if (memoryCheck && memoryCheck.details?.usagePercent > 85) {
      issues.push('High memory usage detected');
      recommendations.push('Consider increasing memory limits or optimizing memory usage');
    }

    // Check database performance
    const dbCheck = health.checks.find(c => c.service === 'database');
    if (dbCheck && dbCheck.details?.averageQueryTime > 100) {
      issues.push('Slow database queries detected');
      recommendations.push('Review and optimize database queries');
    }

    // Check error rates
    const errorCheck = health.checks.find(c => c.service === 'error_handler');
    if (errorCheck && errorCheck.details?.totalErrors > 100) {
      issues.push('High error rate detected');
      recommendations.push('Investigate and fix application errors');
    }

    const ready = health.overall === 'healthy' && issues.length === 0;

    return {
      ready,
      issues,
      recommendations
    };
  }
}

// Create singleton instance
export const healthCheckService = new HealthCheckService();

// Export types
export type { HealthCheckResult, SystemHealth };