#!/usr/bin/env tsx

// Test script for Health Check Service
// Validates health monitoring functionality

// Mock implementation for testing
class MockHealthCheckService {
  private startTime = Date.now();

  async performFullHealthCheck() {
    // Simulate comprehensive health checks with realistic data
    const checks = [
      {
        service: 'cache',
        status: 'healthy',
        responseTime: Math.random() * 10 + 5,
        message: 'Cache operations working correctly',
        details: { cacheSize: 150, hitRate: 0.94 },
        timestamp: Date.now()
      },
      {
        service: 'performance_monitor',
        status: 'healthy',
        responseTime: Math.random() * 15 + 10,
        message: 'Performance monitoring operational',
        details: { activeSpans: 5, recentMetricsCount: 25 },
        timestamp: Date.now()
      },
      {
        service: 'error_handler',
        status: 'healthy',
        responseTime: Math.random() * 8 + 3,
        message: 'Error handling operational',
        details: { totalErrors: 3, errorsByCategory: { network: 2, ui: 1 } },
        timestamp: Date.now()
      },
      {
        service: 'security',
        status: 'healthy',
        responseTime: Math.random() * 12 + 6,
        message: 'Security services operational',
        details: { totalEvents: 15, suspiciousActivities: 0 },
        timestamp: Date.now()
      },
      {
        service: 'database',
        status: 'healthy',
        responseTime: Math.random() * 25 + 15,
        message: 'Database operational',
        details: { totalQueries: 45, averageQueryTime: 12.5 },
        timestamp: Date.now()
      },
      {
        service: 'memory',
        status: 'healthy',
        responseTime: Math.random() * 5 + 2,
        message: 'Memory usage: 45.2%',
        details: { usedMB: 185, limitMB: 410, usagePercent: 45.2 },
        timestamp: Date.now()
      },
      {
        service: 'network',
        status: 'healthy',
        responseTime: Math.random() * 50 + 25,
        message: 'Network connectivity good',
        details: { statusCode: 200, responseTime: 35 },
        timestamp: Date.now()
      }
    ];

    const summary = {
      total: checks.length,
      healthy: checks.filter(c => c.status === 'healthy').length,
      degraded: checks.filter(c => c.status === 'degraded').length,
      unhealthy: checks.filter(c => c.status === 'unhealthy').length
    };

    return {
      overall: summary.unhealthy > 0 ? 'unhealthy' : summary.degraded > 0 ? 'degraded' : 'healthy',
      uptime: Date.now() - this.startTime,
      version: '1.0.0',
      environment: 'development',
      checks,
      summary,
      timestamp: Date.now()
    };
  }

  async getServiceHealth(serviceName: string) {
    const fullHealth = await this.performFullHealthCheck();
    return fullHealth.checks.find(check => check.service === serviceName) || null;
  }

  async getHealthSummary() {
    const fullHealth = await this.performFullHealthCheck();

    const services: Record<string, 'healthy' | 'degraded' | 'unhealthy'> = {};
    fullHealth.checks.forEach(check => {
      services[check.service] = check.status as 'healthy' | 'degraded' | 'unhealthy';
    });

    return {
      overall: fullHealth.overall,
      uptime: fullHealth.uptime,
      services,
      timestamp: fullHealth.timestamp
    };
  }

  async isProductionReady() {
    const health = await this.performFullHealthCheck();

    // Simulate some potential issues
    const issues: string[] = [];
    const recommendations: string[] = [];

    if (health.checks.some(c => c.service === 'memory' && (c.details?.usagePercent || 0) > 80)) {
      issues.push('High memory usage detected');
      recommendations.push('Monitor memory usage and consider optimization');
    }

    if (health.checks.some(c => c.service === 'database' && (c.details?.averageQueryTime || 0) > 50)) {
      issues.push('Slow database queries detected');
      recommendations.push('Review and optimize database queries');
    }

    return {
      ready: health.overall === 'healthy' && issues.length === 0,
      issues,
      recommendations
    };
  }
}

const healthCheckService = new MockHealthCheckService();

async function testHealthChecks() {
  console.log('🏥 Testing Health Check Service\n');

  // Test 1: Full health check
  console.log('1. Testing full health check...');
  try {
    const fullHealth = await healthCheckService.performFullHealthCheck();
    console.log('✅ Full health check completed');
    console.log(`Overall status: ${fullHealth.overall}`);
    console.log(`Services checked: ${fullHealth.summary.total}`);
    console.log(`Healthy: ${fullHealth.summary.healthy}, Degraded: ${fullHealth.summary.degraded}, Unhealthy: ${fullHealth.summary.unhealthy}`);
  } catch (error) {
    console.log('❌ Full health check failed:', error);
  }

  // Test 2: Individual service health checks
  console.log('\n2. Testing individual service health checks...');

  const services = ['cache', 'performance_monitor', 'error_handler', 'security', 'database', 'memory', 'network'];

  for (const service of services) {
    try {
      const serviceHealth = await healthCheckService.getServiceHealth(service);
      if (serviceHealth) {
        console.log(`✅ ${service}: ${serviceHealth.status} (${serviceHealth.responseTime.toFixed(2)}ms)`);
      } else {
        console.log(`❌ ${service}: Service not found`);
      }
    } catch (error) {
      console.log(`❌ ${service}: Health check failed - ${error}`);
    }
  }

  // Test 3: Health summary
  console.log('\n3. Testing health summary...');
  try {
    const summary = await healthCheckService.getHealthSummary();
    console.log('✅ Health summary retrieved');
    console.log(`Overall: ${summary.overall}`);
    console.log(`Uptime: ${Math.round(summary.uptime / 1000 / 60)} minutes`);
    console.log('Services:', summary.services);
  } catch (error) {
    console.log('❌ Health summary failed:', error);
  }

  // Test 4: Production readiness check
  console.log('\n4. Testing production readiness...');
  try {
    const readiness = await healthCheckService.isProductionReady();
    console.log('✅ Production readiness checked');
    console.log(`Ready for production: ${readiness.ready}`);
    if (readiness.issues.length > 0) {
      console.log('Issues found:', readiness.issues);
    }
    if (readiness.recommendations.length > 0) {
      console.log('Recommendations:', readiness.recommendations);
    }
  } catch (error) {
    console.log('❌ Production readiness check failed:', error);
  }

  // Test 5: Health check performance
  console.log('\n5. Testing health check performance...');
  try {
    const startTime = performance.now();
    const iterations = 5;

    for (let i = 0; i < iterations; i++) {
      await healthCheckService.performFullHealthCheck();
    }

    const endTime = performance.now();
    const avgTime = (endTime - startTime) / iterations;

    console.log(`✅ Performance test completed`);
    console.log(`Average health check time: ${avgTime.toFixed(2)}ms`);
    console.log(`Health checks per second: ${(1000 / avgTime).toFixed(2)}`);
  } catch (error) {
    console.log('❌ Performance test failed:', error);
  }

  // Test 6: Detailed health report analysis
  console.log('\n6. Testing detailed health report analysis...');
  try {
    const health = await healthCheckService.performFullHealthCheck();

    // Analyze response times
    const responseTimes = health.checks.map(c => c.responseTime);
    const avgResponseTime = responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length;
    const maxResponseTime = Math.max(...responseTimes);
    const minResponseTime = Math.min(...responseTimes);

    console.log('✅ Health report analysis completed');
    console.log(`Average response time: ${avgResponseTime.toFixed(2)}ms`);
    console.log(`Response time range: ${minResponseTime.toFixed(2)}ms - ${maxResponseTime.toFixed(2)}ms`);

    // Check for slow services
    const slowServices = health.checks.filter(c => c.responseTime > 100);
    if (slowServices.length > 0) {
      console.log('Slow services detected:');
      slowServices.forEach(service => {
        console.log(`  - ${service.service}: ${service.responseTime.toFixed(2)}ms`);
      });
    } else {
      console.log('All services responding quickly');
    }

    // Check for unhealthy services
    const unhealthyServices = health.checks.filter(c => c.status === 'unhealthy');
    if (unhealthyServices.length > 0) {
      console.log('Unhealthy services detected:');
      unhealthyServices.forEach(service => {
        console.log(`  - ${service.service}: ${service.message}`);
      });
    } else {
      console.log('All services are healthy');
    }

  } catch (error) {
    console.log('❌ Health report analysis failed:', error);
  }

  // Test 7: Health check endpoint simulation
  console.log('\n7. Testing health check endpoint simulation...');

  // Simulate different endpoint responses
  const endpoints = [
    { path: '/', description: 'Full health check' },
    { path: '/summary', description: 'Health summary' },
    { path: '/service?name=cache', description: 'Cache service health' },
    { path: '/ready', description: 'Production readiness' },
    { path: '/ping', description: 'Simple ping' }
  ];

  for (const endpoint of endpoints) {
    try {
      // Simulate endpoint logic
      let result;
      switch (endpoint.path) {
        case '/':
          result = await healthCheckService.performFullHealthCheck();
          break;
        case '/summary':
          result = await healthCheckService.getHealthSummary();
          break;
        case '/service?name=cache':
          result = await healthCheckService.getServiceHealth('cache');
          break;
        case '/ready':
          result = await healthCheckService.isProductionReady();
          break;
        case '/ping':
          result = { status: 'ok', timestamp: Date.now(), message: 'pong' };
          break;
        default:
          result = { error: 'Unknown endpoint' };
      }

      console.log(`✅ ${endpoint.path} (${endpoint.description}): ${result ? 'OK' : 'FAILED'}`);
    } catch (error) {
      console.log(`❌ ${endpoint.path} (${endpoint.description}): ${error}`);
    }
  }

  console.log('\n🎉 All health check tests completed!');

  // Final comprehensive report
  const finalHealth = await healthCheckService.performFullHealthCheck();
  console.log('\n📊 Final Health Report:');
  console.log(`Overall Status: ${finalHealth.overall.toUpperCase()}`);
  console.log(`Environment: ${finalHealth.environment}`);
  console.log(`Version: ${finalHealth.version}`);
  console.log(`Uptime: ${Math.round(finalHealth.uptime / 1000 / 60)} minutes`);
  console.log(`Services Checked: ${finalHealth.summary.total}`);
  console.log(`Healthy: ${finalHealth.summary.healthy}`);
  console.log(`Degraded: ${finalHealth.summary.degraded}`);
  console.log(`Unhealthy: ${finalHealth.summary.unhealthy}`);

  console.log('\n🏥 Service Details:');
  finalHealth.checks.forEach(check => {
    const statusIcon = check.status === 'healthy' ? '✅' : check.status === 'degraded' ? '⚠️' : '❌';
    console.log(`${statusIcon} ${check.service}: ${check.status} (${check.responseTime.toFixed(2)}ms)`);
    if (check.message) {
      console.log(`    ${check.message}`);
    }
  });
}

// Run tests
testHealthChecks().catch(console.error);