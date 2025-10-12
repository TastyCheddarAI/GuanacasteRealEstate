// Health Check Edge Function
// Provides comprehensive health monitoring endpoints for the application

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

// Mock implementations for health checks (in production, these would import actual services)
class MockHealthCheckService {
  async performFullHealthCheck() {
    // Simulate comprehensive health checks
    const checks = [
      {
        service: 'database',
        status: 'healthy',
        responseTime: Math.random() * 50 + 10,
        message: 'Database connections healthy',
        details: { connections: 5, responseTime: 25 }
      },
      {
        service: 'cache',
        status: 'healthy',
        responseTime: Math.random() * 10 + 5,
        message: 'Cache operations normal',
        details: { hitRate: 0.95, size: 1024 }
      },
      {
        service: 'api',
        status: 'healthy',
        responseTime: Math.random() * 100 + 50,
        message: 'API endpoints responding',
        details: { endpoints: 15, avgResponseTime: 75 }
      },
      {
        service: 'auth',
        status: 'healthy',
        responseTime: Math.random() * 20 + 10,
        message: 'Authentication services operational',
        details: { activeSessions: 42, failedLogins: 0 }
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
      uptime: Date.now() - 1640995200000, // Mock uptime since Jan 1, 2022
      version: '1.0.0',
      environment: 'production',
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

    const services: Record<string, string> = {};
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

  async isProductionReady() {
    const health = await this.performFullHealthCheck();

    // Simulate some issues for demonstration
    const issues = health.overall === 'healthy' ? [] : ['Simulated issue for testing'];
    const recommendations = issues.length > 0 ? ['Monitor system closely'] : [];

    return {
      ready: health.overall === 'healthy',
      issues,
      recommendations
    };
  }
}

const healthCheckService = new MockHealthCheckService();

serve(async (req: Request) => {
  const url = new URL(req.url);
  const path = url.pathname.replace('/functions/health', '');

  // CORS headers
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  };

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  // Allow anonymous access for health checks
  const authHeader = req.headers.get('authorization');
  const apiKey = req.headers.get('apikey');

  // For health endpoints, allow anonymous access
  if (!authHeader && !apiKey && (path === '/' || path === '' || path.startsWith('/'))) {
    // Continue with anonymous access for health checks
  }

  try {
    switch (path) {
      case '/':
      case '':
        // Full health check
        if (req.method !== 'GET') {
          return new Response(JSON.stringify({ error: 'Method not allowed' }), {
            status: 405,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }

        const fullHealth = await healthCheckService.performFullHealthCheck();

        // Return appropriate HTTP status based on health
        const statusCode = fullHealth.overall === 'healthy' ? 200 :
                          fullHealth.overall === 'degraded' ? 200 : 503;

        return new Response(JSON.stringify(fullHealth, null, 2), {
          status: statusCode,
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
            'Cache-Control': 'no-cache, no-store, must-revalidate'
          }
        });

      case '/summary':
        // Health summary
        if (req.method !== 'GET') {
          return new Response(JSON.stringify({ error: 'Method not allowed' }), {
            status: 405,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }

        const summary = await healthCheckService.getHealthSummary();

        return new Response(JSON.stringify(summary, null, 2), {
          status: 200,
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
            'Cache-Control': 'no-cache, no-store, must-revalidate'
          }
        });

      case '/service':
        // Individual service health
        if (req.method !== 'GET') {
          return new Response(JSON.stringify({ error: 'Method not allowed' }), {
            status: 405,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }

        const serviceName = url.searchParams.get('name');
        if (!serviceName) {
          return new Response(JSON.stringify({ error: 'Service name required' }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }

        const serviceHealth = await healthCheckService.getServiceHealth(serviceName);
        if (!serviceHealth) {
          return new Response(JSON.stringify({ error: 'Service not found' }), {
            status: 404,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }

        return new Response(JSON.stringify(serviceHealth, null, 2), {
          status: 200,
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
            'Cache-Control': 'no-cache, no-store, must-revalidate'
          }
        });

      case '/ready':
        // Production readiness check
        if (req.method !== 'GET') {
          return new Response(JSON.stringify({ error: 'Method not allowed' }), {
            status: 405,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }

        const readiness = await healthCheckService.isProductionReady();

        return new Response(JSON.stringify(readiness, null, 2), {
          status: readiness.ready ? 200 : 503,
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
            'Cache-Control': 'no-cache, no-store, must-revalidate'
          }
        });

      case '/ping':
        // Simple ping/pong health check
        return new Response(JSON.stringify({
          status: 'ok',
          timestamp: Date.now(),
          message: 'pong'
        }), {
          status: 200,
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
            'Cache-Control': 'no-cache, no-store, must-revalidate'
          }
        });

      case '/metrics':
        // Prometheus-style metrics endpoint
        if (req.method !== 'GET') {
          return new Response(JSON.stringify({ error: 'Method not allowed' }), {
            status: 405,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }

        const health = await healthCheckService.performFullHealthCheck();

        // Generate Prometheus metrics format
        let metrics = '# HELP health_check_status Overall system health status\n';
        metrics += '# TYPE health_check_status gauge\n';
        metrics += `health_check_status{status="${health.overall}"} 1\n\n`;

        metrics += '# HELP health_check_uptime System uptime in milliseconds\n';
        metrics += '# TYPE health_check_uptime counter\n';
        metrics += `health_check_uptime ${health.uptime}\n\n`;

        metrics += '# HELP health_check_services_total Total number of services checked\n';
        metrics += '# TYPE health_check_services_total gauge\n';
        metrics += `health_check_services_total ${health.summary.total}\n\n`;

        metrics += '# HELP health_check_services_healthy Number of healthy services\n';
        metrics += '# TYPE health_check_services_healthy gauge\n';
        metrics += `health_check_services_healthy ${health.summary.healthy}\n\n`;

        metrics += '# HELP health_check_services_degraded Number of degraded services\n';
        metrics += '# TYPE health_check_services_degraded gauge\n';
        metrics += `health_check_services_degraded ${health.summary.degraded}\n\n`;

        metrics += '# HELP health_check_services_unhealthy Number of unhealthy services\n';
        metrics += '# TYPE health_check_services_unhealthy gauge\n';
        metrics += `health_check_services_unhealthy ${health.summary.unhealthy}\n\n`;

        // Add individual service metrics
        health.checks.forEach(check => {
          const statusValue = check.status === 'healthy' ? 1 : check.status === 'degraded' ? 0.5 : 0;
          metrics += `# HELP health_check_service_status Status of ${check.service} service\n`;
          metrics += `# TYPE health_check_service_status gauge\n`;
          metrics += `health_check_service_status{service="${check.service}",status="${check.status}"} ${statusValue}\n\n`;

          metrics += `# HELP health_check_service_response_time Response time of ${check.service} service\n`;
          metrics += `# TYPE health_check_service_response_time gauge\n`;
          metrics += `health_check_service_response_time{service="${check.service}"} ${check.responseTime}\n\n`;
        });

        return new Response(metrics, {
          status: 200,
          headers: {
            ...corsHeaders,
            'Content-Type': 'text/plain; version=0.0.4; charset=utf-8',
            'Cache-Control': 'no-cache, no-store, must-revalidate'
          }
        });

      default:
        return new Response(JSON.stringify({ error: 'Endpoint not found' }), {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }
  } catch (error) {
    console.error('Health check error:', error);

    return new Response(JSON.stringify({
      error: 'Health check failed',
      message: error.message,
      timestamp: Date.now()
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});