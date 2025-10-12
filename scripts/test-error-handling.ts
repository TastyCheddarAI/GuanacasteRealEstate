#!/usr/bin/env tsx

// Test script for Enhanced Error Handling System
// Validates error reporting, retry logic, graceful degradation, and circuit breaker functionality

import { errorHandler } from '../apps/web/src/services/errorHandler';
import { apiCache } from '../apps/web/src/services/cacheService';

async function testErrorHandling() {
  console.log('🧪 Testing Enhanced Error Handling System\n');

  // Test 1: Basic error handling
  console.log('1. Testing basic error handling...');
  try {
    await errorHandler.handleError(new Error('Test error'), {
      additionalData: { test: 'basic_error_handling' }
    }, {
      severity: 'low',
      category: 'logic'
    });
    console.log('✅ Basic error handling works');
  } catch (error) {
    console.log('❌ Basic error handling failed:', error);
  }

  // Test 2: Retry logic
  console.log('\n2. Testing retry logic...');
  let attemptCount = 0;
  const failingOperation = async () => {
    attemptCount++;
    if (attemptCount < 3) {
      throw new Error('Network timeout');
    }
    return { success: true };
  };

  try {
    const result = await errorHandler.withRetry(failingOperation, {
      maxRetries: 3,
      baseDelay: 100,
      retryCondition: (error) => error.message.includes('timeout')
    });
    console.log('✅ Retry logic works, final result:', result);
  } catch (error) {
    console.log('❌ Retry logic failed:', error);
  }

  // Test 3: Graceful degradation
  console.log('\n3. Testing graceful degradation...');
  const primaryOperation = async () => {
    throw new Error('Primary service unavailable');
  };

  const fallbackOperation = async () => {
    return { fallback: true, data: 'cached_data' };
  };

  try {
    const result = await errorHandler.withGracefulDegradation(
      primaryOperation,
      fallbackOperation,
      'test_service'
    );
    console.log('✅ Graceful degradation works, result:', result);
  } catch (error) {
    console.log('❌ Graceful degradation failed:', error);
  }

  // Test 4: Circuit breaker
  console.log('\n4. Testing circuit breaker...');
  const circuitBreakerTest = async () => {
    // Simulate multiple failures
    for (let i = 0; i < 6; i++) {
      try {
        await errorHandler.withRetry(
          async () => { throw new Error('Service down'); },
          { maxRetries: 0 }
        );
      } catch (error) {
        // Expected
      }
    }

    // Check if circuit is open
    const isOpen = errorHandler.isCircuitOpen('global_operation');
    console.log(`Circuit breaker state: ${isOpen ? 'OPEN' : 'CLOSED'}`);

    if (isOpen) {
      console.log('✅ Circuit breaker opened after failures');
    } else {
      console.log('❌ Circuit breaker should be open');
    }
  };

  await circuitBreakerTest();

  // Test 5: Error statistics
  console.log('\n5. Testing error statistics...');
  const stats = errorHandler.getErrorStats(3600000); // Last hour
  console.log('Error statistics:', {
    totalErrors: stats.totalErrors,
    errorsByCategory: stats.errorsByCategory,
    errorsBySeverity: stats.errorsBySeverity,
    topErrorMessages: stats.topErrorMessages.slice(0, 3)
  });

  // Test 6: Cache integration with error handling
  console.log('\n6. Testing cache with error handling...');
  try {
    const testKey = 'test_error_cache';
    const result = await apiCache.getOrSet(
      testKey,
      async () => {
        // Simulate API call that might fail
        if (Math.random() > 0.7) {
          throw new Error('API temporarily unavailable');
        }
        return { data: 'fresh_data', timestamp: Date.now() };
      },
      {
        ttl: 1000 * 60, // 1 minute
        fallbackData: { data: 'fallback_data', timestamp: Date.now() },
        staleWhileRevalidate: true
      }
    );

    console.log('✅ Cache with error handling works, result:', result);
  } catch (error) {
    console.log('❌ Cache error handling failed:', error);
  }

  // Test 7: Breadcrumb tracking
  console.log('\n7. Testing breadcrumb tracking...');
  errorHandler.addBreadcrumb('test_operation_started', { userId: 'test_user' });
  errorHandler.addBreadcrumb('test_step_1_completed');
  errorHandler.addBreadcrumb('test_operation_finished', { result: 'success' });

  // Trigger an error to see breadcrumbs in report
  try {
    throw new Error('Breadcrumb test error');
  } catch (error) {
    await errorHandler.handleError(error as Error, {
      additionalData: { test: 'breadcrumb_tracking' }
    });
  }

  console.log('✅ Breadcrumb tracking test completed');

  // Test 8: Error boundary (would need React component testing)
  console.log('\n8. Error boundary creation...');
  const ErrorBoundary = errorHandler.createErrorBoundary();
  console.log('✅ Error boundary created successfully');

  console.log('\n🎉 All error handling tests completed!');

  // Final statistics
  const finalStats = errorHandler.getErrorStats();
  console.log('\n📊 Final Error Statistics:');
  console.log(`Total errors: ${finalStats.totalErrors}`);
  console.log(`Errors by severity:`, finalStats.errorsBySeverity);
  console.log(`Errors by category:`, finalStats.errorsByCategory);
  console.log(`Top error messages:`, finalStats.topErrorMessages.slice(0, 5));
}

// Run tests
testErrorHandling().catch(console.error);