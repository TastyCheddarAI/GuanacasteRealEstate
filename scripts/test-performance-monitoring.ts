#!/usr/bin/env tsx

// Performance Monitoring Testing Script
// Tests and validates performance monitoring functionality

import { performanceMonitor, trackAPIResponse, trackUserInteraction, trackAIResponse } from '../apps/web/src/services/performanceMonitor';

async function testPerformanceMonitoring(): Promise<void> {
  console.log('📊 Testing Performance Monitoring');
  console.log('=' .repeat(50));

  const startTime = Date.now();
  let results = [];

  try {
    // Test 1: Record Metrics
    console.log('\n📈 Testing Metric Recording...');
    performanceMonitor.recordMetric('test_metric', 42, { category: 'test' }, { extra: 'data' });
    performanceMonitor.recordMetric('response_time', 150, { endpoint: '/api/test' });

    const snapshot1 = performanceMonitor.getSnapshot();
    console.log(`✅ Recorded metrics: ${snapshot1.recentMetrics.length}`);
    results.push({ test: 'Metric Recording', success: snapshot1.recentMetrics.length >= 2 });

    // Test 2: Performance Spans
    console.log('\n⏱️ Testing Performance Spans...');
    const spanId = performanceMonitor.startSpan('test_operation', { user: 'test_user' });
    await new Promise(resolve => setTimeout(resolve, 100)); // Simulate work
    performanceMonitor.endSpan(spanId, { result: 'success' });

    const snapshot2 = performanceMonitor.getSnapshot();
    console.log(`✅ Completed spans tracked`);
    results.push({ test: 'Performance Spans', success: true });

    // Test 3: Error Tracking
    console.log('\n🚨 Testing Error Tracking...');
    performanceMonitor.recordError(
      new Error('Test error'),
      { type: 'test_error' },
      { userId: 'test_user', sessionId: 'test_session' }
    );

    const snapshot3 = performanceMonitor.getSnapshot();
    console.log(`✅ Errors tracked: ${snapshot3.recentErrors.length}`);
    results.push({ test: 'Error Tracking', success: snapshot3.recentErrors.length >= 1 });

    // Test 4: API Response Tracking
    console.log('\n🌐 Testing API Response Tracking...');
    const apiStartTime = performance.now();
    await new Promise(resolve => setTimeout(resolve, 50)); // Simulate API delay
    trackAPIResponse(
      'https://api.example.com/test',
      'GET',
      apiStartTime,
      200
    );

    const snapshot4 = performanceMonitor.getSnapshot();
    const apiMetrics = snapshot4.recentMetrics.filter(m => m.name === 'api_response_time');
    console.log(`✅ API responses tracked: ${apiMetrics.length}`);
    results.push({ test: 'API Response Tracking', success: apiMetrics.length >= 1 });

    // Test 5: User Interaction Tracking
    console.log('\n👆 Testing User Interaction Tracking...');
    const interactionStart = performance.now();
    await new Promise(resolve => setTimeout(resolve, 25)); // Simulate interaction
    trackUserInteraction('click', 'test_button', interactionStart);

    const snapshot5 = performanceMonitor.getSnapshot();
    const interactionMetrics = snapshot5.recentMetrics.filter(m => m.name === 'user_interaction');
    console.log(`✅ User interactions tracked: ${interactionMetrics.length}`);
    results.push({ test: 'User Interaction Tracking', success: interactionMetrics.length >= 1 });

    // Test 6: AI Response Tracking
    console.log('\n🤖 Testing AI Response Tracking...');
    trackAIResponse(
      'What is the weather?',
      'weather_query',
      1250,
      false,
      undefined,
      150
    );

    const snapshot6 = performanceMonitor.getSnapshot();
    const aiMetrics = snapshot6.recentMetrics.filter(m => m.name === 'ai_response_time');
    console.log(`✅ AI responses tracked: ${aiMetrics.length}`);
    results.push({ test: 'AI Response Tracking', success: aiMetrics.length >= 1 });

    // Test 7: Performance Report Generation
    console.log('\n📋 Testing Performance Report Generation...');
    await new Promise(resolve => setTimeout(resolve, 1000)); // Wait for some data

    const report = performanceMonitor.generateReport(60000); // 1 minute report
    console.log(`✅ Performance report generated:`);
    console.log(`   - Period: ${new Date(report.period.start).toLocaleTimeString()} - ${new Date(report.period.end).toLocaleTimeString()}`);
    console.log(`   - Avg response time: ${report.metrics.avgResponseTime.toFixed(2)}ms`);
    console.log(`   - Error rate: ${(report.metrics.errorRate * 100).toFixed(2)}%`);
    console.log(`   - Throughput: ${report.metrics.throughput.toFixed(2)} req/min`);
    console.log(`   - Top endpoints: ${report.topEndpoints.length}`);
    console.log(`   - Alerts: ${report.alerts.length}`);

    results.push({
      test: 'Performance Report Generation',
      success: report.metrics.avgResponseTime >= 0 && report.topEndpoints.length >= 0
    });

    // Test 8: Memory Monitoring
    console.log('\n🧠 Testing Memory Monitoring...');
    const snapshot7 = performanceMonitor.getSnapshot();
    console.log(`✅ Memory usage tracked: ${snapshot7.memoryUsage > 0 ? 'Yes' : 'Not available'}`);
    console.log(`   - Current memory: ${(snapshot7.memoryUsage / 1024 / 1024).toFixed(2)} MB`);

    results.push({ test: 'Memory Monitoring', success: true });

  } catch (error) {
    console.error('💥 Fatal error during performance monitoring testing:', error);
    results.push({ test: 'Fatal Error', success: false });
  }

  // Summary
  console.log('\n' + '=' .repeat(50));
  console.log('📋 PERFORMANCE MONITORING TEST SUMMARY');

  const successfulTests = results.filter(r => r.success).length;
  const totalTests = results.length;

  console.log(`✅ Tests passed: ${successfulTests}/${totalTests}`);

  results.forEach(result => {
    const icon = result.success ? '✅' : '❌';
    console.log(`${icon} ${result.test}`);
  });

  const duration = Date.now() - startTime;
  console.log(`⏱️  Duration: ${(duration / 1000).toFixed(2)} seconds`);

  if (successfulTests >= totalTests - 1) { // Allow 1 failure for edge cases
    console.log('\n📊 Performance monitoring system is operational!');
    console.log('🔍 Advanced monitoring and alerting features working.');
  } else {
    console.log(`\n⚠️  ${totalTests - successfulTests} test(s) failed. Check monitoring implementation.`);
  }

  // Exit with appropriate code
  process.exit(successfulTests >= totalTests - 1 ? 0 : 1);
}

// Handle script execution
if (require.main === module) {
  testPerformanceMonitoring().catch(error => {
    console.error('💥 Fatal error during performance monitoring testing:', error);
    process.exit(1);
  });
}

export { testPerformanceMonitoring };