// Enhanced Error Handling Service
// Production-ready error handling with reporting, retry logic, and graceful degradation

import React from 'react';

interface ErrorContext {
  userId?: string;
  sessionId?: string;
  url: string;
  userAgent: string;
  timestamp: number;
  additionalData?: Record<string, any>;
}

interface ErrorReport {
  id: string;
  error: Error;
  context: ErrorContext;
  severity: 'low' | 'medium' | 'high' | 'critical';
  category: 'network' | 'api' | 'ui' | 'logic' | 'auth' | 'validation' | 'unknown';
  handled: boolean;
  retryCount: number;
  stackTrace: string;
  breadcrumbs: string[];
}

interface RetryConfig {
  maxRetries: number;
  baseDelay: number;
  maxDelay: number;
  backoffFactor: number;
  retryCondition?: (error: Error) => boolean;
}

interface CircuitBreakerConfig {
  failureThreshold: number;
  recoveryTimeout: number;
  monitoringPeriod: number;
}

class EnhancedErrorHandler {
  private errorReports: ErrorReport[] = [];
  private maxReports = 1000;
  private breadcrumbs: string[] = [];
  private maxBreadcrumbs = 50;

  // Circuit breaker state
  private circuitBreakers = new Map<string, {
    failures: number;
    lastFailure: number;
    state: 'closed' | 'open' | 'half-open';
  }>();

  // Default configurations
  private defaultRetryConfig: RetryConfig = {
    maxRetries: 3,
    baseDelay: 1000,
    maxDelay: 30000,
    backoffFactor: 2,
    retryCondition: (error) => {
      // Retry on network errors, 5xx status codes, timeouts
      return error.message.includes('fetch') ||
             error.message.includes('network') ||
             error.message.includes('timeout') ||
             error.message.includes('500') ||
             error.message.includes('502') ||
             error.message.includes('503') ||
             error.message.includes('504');
    }
  };

  private defaultCircuitBreakerConfig: CircuitBreakerConfig = {
    failureThreshold: 5,
    recoveryTimeout: 60000, // 1 minute
    monitoringPeriod: 300000 // 5 minutes
  };

  // Private methods
  private categorizeError(error: Error): ErrorReport['category'] {
    const message = error.message.toLowerCase();

    if (message.includes('fetch') || message.includes('network') || message.includes('connection')) {
      return 'network';
    }
    if (message.includes('401') || message.includes('403') || message.includes('auth')) {
      return 'auth';
    }
    if (message.includes('400') || message.includes('422') || message.includes('validation')) {
      return 'validation';
    }
    if (message.includes('api') || message.includes('endpoint') || message.includes('http')) {
      return 'api';
    }
    if (message.includes('react') || message.includes('component') || message.includes('render')) {
      return 'ui';
    }

    return 'unknown';
  }

  private assessSeverity(error: Error, category: ErrorReport['category']): ErrorReport['severity'] {
    const message = error.message.toLowerCase();

    // Critical errors
    if (message.includes('out of memory') || message.includes('stack overflow')) {
      return 'critical';
    }

    // High severity
    if (category === 'auth' || message.includes('500') || message.includes('503')) {
      return 'high';
    }

    // Medium severity
    if (category === 'network' || category === 'api' || message.includes('400')) {
      return 'medium';
    }

    // Low severity for UI/validation errors
    return 'low';
  }

  private async reportError(report: ErrorReport): Promise<void> {
    // In production, this would send to error reporting service (Sentry, Rollbar, etc.)
    console.error('Error Report:', {
      id: report.id,
      message: report.error.message,
      category: report.category,
      severity: report.severity,
      url: report.context.url,
      timestamp: new Date(report.context.timestamp).toISOString(),
      stack: report.stackTrace.split('\n').slice(0, 5).join('\n')
    });

    // Could also send to analytics service, Slack webhook, etc.
  }

  private logError(report: ErrorReport): void {
    const logLevel = report.severity === 'critical' ? 'error' :
                    report.severity === 'high' ? 'warn' : 'info';

    const logMessage = `[${report.severity.toUpperCase()}] ${report.category}: ${report.error.message}`;

    switch (logLevel) {
      case 'error':
        console.error(logMessage, report.error);
        break;
      case 'warn':
        console.warn(logMessage, report.error);
        break;
      default:
        console.info(logMessage);
    }
  }

  private updateCircuitBreaker(key: string, failed: boolean): void {
    const breaker = this.circuitBreakers.get(key) || {
      failures: 0,
      lastFailure: 0,
      state: 'closed' as const
    };

    if (failed) {
      breaker.failures++;
      breaker.lastFailure = Date.now();

      if (breaker.failures >= this.defaultCircuitBreakerConfig.failureThreshold) {
        breaker.state = 'open';
        console.warn(`Circuit breaker opened for ${key}`);
      }
    } else {
      // Success - reset failure count
      breaker.failures = Math.max(0, breaker.failures - 1);
      if (breaker.failures === 0) {
        breaker.state = 'closed';
      }
    }

    this.circuitBreakers.set(key, breaker);
  }

  private resetCircuitBreaker(key: string): void {
    const breaker = this.circuitBreakers.get(key);
    if (breaker) {
      breaker.failures = 0;
      breaker.state = 'closed';
    }
  }

  // Public methods
  addBreadcrumb(action: string, metadata?: Record<string, any>): void {
    const breadcrumb = `${new Date().toISOString()}: ${action}${
      metadata ? ` (${JSON.stringify(metadata)})` : ''
    }`;

    this.breadcrumbs.push(breadcrumb);

    if (this.breadcrumbs.length > this.maxBreadcrumbs) {
      this.breadcrumbs = this.breadcrumbs.slice(-this.maxBreadcrumbs);
    }
  }

  async handleError(
    error: Error | string,
    context: Partial<ErrorContext> = {},
    options: {
      severity?: ErrorReport['severity'];
      category?: ErrorReport['category'];
      handled?: boolean;
      report?: boolean;
      retry?: RetryConfig;
    } = {}
  ): Promise<void> {
    const errorObj = error instanceof Error ? error : new Error(error);

    // Create error context
    const fullContext: ErrorContext = {
      userId: context.userId,
      sessionId: context.sessionId,
      url: context.url || (typeof window !== 'undefined' ? window.location.href : ''),
      userAgent: context.userAgent || (typeof navigator !== 'undefined' ? navigator.userAgent : ''),
      timestamp: Date.now(),
      additionalData: context.additionalData
    };

    // Determine error category and severity
    const category = options.category || this.categorizeError(errorObj);
    const severity = options.severity || this.assessSeverity(errorObj, category);

    // Create error report
    const report: ErrorReport = {
      id: `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      error: errorObj,
      context: fullContext,
      severity,
      category,
      handled: options.handled !== false, // Default to handled
      retryCount: 0,
      stackTrace: errorObj.stack || 'No stack trace available',
      breadcrumbs: [...this.breadcrumbs]
    };

    // Store error report
    this.errorReports.push(report);
    if (this.errorReports.length > this.maxReports) {
      this.errorReports = this.errorReports.slice(-this.maxReports);
    }

    // Report error if requested (default: true for high/critical severity)
    const shouldReport = options.report !== false && (severity === 'high' || severity === 'critical');
    if (shouldReport) {
      await this.reportError(report);
    }

    // Log error appropriately
    this.logError(report);

    // Update circuit breaker if applicable
    if (fullContext.url) {
      this.updateCircuitBreaker(fullContext.url, severity === 'critical' || category === 'network');
    }
  }

  async withRetry<T>(
    operation: () => Promise<T>,
    config: Partial<RetryConfig> = {}
  ): Promise<T> {
    const retryConfig = { ...this.defaultRetryConfig, ...config };
    let lastError: Error | undefined;

    for (let attempt = 0; attempt <= retryConfig.maxRetries; attempt++) {
      try {
        // Check circuit breaker
        const circuitOpen = this.isCircuitOpen('global_operation');
        if (circuitOpen && attempt === 0) {
          throw new Error('Circuit breaker is open - operation temporarily disabled');
        }

        this.addBreadcrumb(`Attempting operation (attempt ${attempt + 1}/${retryConfig.maxRetries + 1})`);
        const result = await operation();
        this.addBreadcrumb('Operation succeeded');

        // Reset circuit breaker on success
        if (attempt > 0) {
          this.resetCircuitBreaker('global_operation');
        }

        return result;
      } catch (error) {
        lastError = error as Error;
        this.addBreadcrumb(`Operation failed (attempt ${attempt + 1}): ${lastError.message}`);

        // Update circuit breaker
        this.updateCircuitBreaker('global_operation', true);

        // Check if we should retry
        const shouldRetry = attempt < retryConfig.maxRetries &&
                           (!retryConfig.retryCondition || retryConfig.retryCondition(lastError));

        if (!shouldRetry) {
          break;
        }

        // Calculate delay with exponential backoff
        const delay = Math.min(
          retryConfig.baseDelay * Math.pow(retryConfig.backoffFactor, attempt),
          retryConfig.maxDelay
        );

        this.addBreadcrumb(`Retrying in ${delay}ms`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }

    // All retries exhausted
    if (lastError) {
      await this.handleError(lastError, {}, {
        severity: 'high',
        category: 'network',
        handled: false
      });
      throw lastError;
    }

    throw new Error('Retry operation failed with unknown error');
  }

  async withGracefulDegradation<T>(
    primaryOperation: () => Promise<T>,
    fallbackOperation: () => Promise<T>,
    context: string = 'unknown'
  ): Promise<T> {
    try {
      this.addBreadcrumb(`Attempting primary operation: ${context}`);
      const result = await primaryOperation();
      this.addBreadcrumb(`Primary operation succeeded: ${context}`);
      return result;
    } catch (error) {
      console.warn(`Primary operation failed for ${context}, falling back:`, error);

      this.addBreadcrumb(`Primary operation failed, using fallback: ${context}`);
      await this.handleError(error as Error, { additionalData: { context, operation: 'primary' } }, {
        severity: 'medium',
        category: 'logic',
        handled: true
      });

      try {
        const fallbackResult = await fallbackOperation();
        this.addBreadcrumb(`Fallback operation succeeded: ${context}`);
        return fallbackResult;
      } catch (fallbackError) {
        console.error(`Fallback operation also failed for ${context}:`, fallbackError);

        this.addBreadcrumb(`Fallback operation failed: ${context}`);
        await this.handleError(fallbackError as Error, { additionalData: { context, operation: 'fallback' } }, {
          severity: 'high',
          category: 'logic',
          handled: false
        });

        throw fallbackError;
      }
    }
  }

  createErrorBoundary() {
    const ErrorBoundaryComponent = class extends React.Component<
      { children: React.ReactNode; fallback?: React.ComponentType<{ error: Error; reset: () => void }> },
      { hasError: boolean; error: Error | null }
    > {
      constructor(props: any) {
        super(props);
        this.state = { hasError: false, error: null };
      }

      static getDerivedStateFromError(error: Error) {
        return { hasError: true, error };
      }

      componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        errorHandler.handleError(error, {
          additionalData: {
            errorInfo,
            componentStack: errorInfo.componentStack
          }
        }, {
          severity: 'high',
          category: 'ui',
          handled: true
        });
      }

      render() {
        if (this.state.hasError && this.state.error) {
          const FallbackComponent = this.props.fallback || DefaultErrorFallback;
          return React.createElement(FallbackComponent, {
            error: this.state.error,
            reset: () => this.setState({ hasError: false, error: null })
          });
        }

        return this.props.children;
      }
    };

    return ErrorBoundaryComponent;
  }

  getErrorStats(timeRange: number = 3600000): {
    totalErrors: number;
    errorsByCategory: Record<string, number>;
    errorsBySeverity: Record<string, number>;
    recentErrors: ErrorReport[];
    topErrorMessages: Array<{ message: string; count: number }>;
  } {
    const cutoff = Date.now() - timeRange;
    const recentErrors = this.errorReports.filter(r => r.context.timestamp > cutoff);

    const errorsByCategory = recentErrors.reduce((acc, report) => {
      acc[report.category] = (acc[report.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const errorsBySeverity = recentErrors.reduce((acc, report) => {
      acc[report.severity] = (acc[report.severity] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const messageCounts = recentErrors.reduce((acc, report) => {
      const key = report.error.message;
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const topErrorMessages = Object.entries(messageCounts)
      .sort(([,a], [,b]) => (b as number) - (a as number))
      .slice(0, 10)
      .map(([message, count]) => ({ message, count: count as number }));

    return {
      totalErrors: recentErrors.length,
      errorsByCategory,
      errorsBySeverity,
      recentErrors: recentErrors.slice(-20),
      topErrorMessages
    };
  }

  isCircuitOpen(key: string): boolean {
    const breaker = this.circuitBreakers.get(key);
    if (!breaker) return false;

    if (breaker.state === 'open') {
      // Check if recovery timeout has passed
      if (Date.now() - breaker.lastFailure > this.defaultCircuitBreakerConfig.recoveryTimeout) {
        breaker.state = 'half-open';
        return false;
      }
      return true;
    }

    return false;
  }
}

// Default error fallback component
const DefaultErrorFallback: React.FC<{ error: Error; reset: () => void }> = ({ error, reset }) => {
  return React.createElement('div', { className: 'min-h-screen flex items-center justify-center bg-gray-50' },
    React.createElement('div', { className: 'max-w-md w-full bg-white shadow-lg rounded-lg p-6' },
      React.createElement('div', { className: 'flex items-center mb-4' },
        React.createElement('div', { className: 'flex-shrink-0' },
          React.createElement('svg', {
            className: 'h-8 w-8 text-red-400',
            fill: 'none',
            viewBox: '0 0 24 24',
            stroke: 'currentColor'
          },
            React.createElement('path', {
              strokeLinecap: 'round',
              strokeLinejoin: 'round',
              strokeWidth: 2,
              d: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z'
            })
          )
        ),
        React.createElement('div', { className: 'ml-3' },
          React.createElement('h3', { className: 'text-lg font-medium text-gray-900' }, 'Something went wrong'),
          React.createElement('p', { className: 'text-sm text-gray-500 mt-1' }, 'We apologize for the inconvenience. Please try again.')
        )
      ),
      React.createElement('div', { className: 'mt-4' },
        React.createElement('button', {
          onClick: reset,
          className: 'w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors'
        }, 'Try Again')
      ),
      process.env.NODE_ENV === 'development' && React.createElement('details', { className: 'mt-4' },
        React.createElement('summary', { className: 'cursor-pointer text-sm text-gray-500' }, 'Error Details (Dev Only)'),
        React.createElement('pre', { className: 'mt-2 text-xs bg-gray-100 p-2 rounded overflow-auto max-h-32' }, error.message)
      )
    )
  );
};

// Create singleton instance
export const errorHandler = new EnhancedErrorHandler();

// Convenience functions
export function handleAsyncError<T extends any[], R>(
  fn: (...args: T) => Promise<R>,
  context?: Partial<ErrorContext>
) {
  return async (...args: T): Promise<R> => {
    try {
      return await fn(...args);
    } catch (error) {
      await errorHandler.handleError(error as Error, context);
      throw error;
    }
  };
}

export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>
) {
  const ErrorBoundary = errorHandler.createErrorBoundary();

  return (props: P) => React.createElement(ErrorBoundary, null, React.createElement(Component, props));
}

// Export types
export type { ErrorContext, ErrorReport, RetryConfig, CircuitBreakerConfig };