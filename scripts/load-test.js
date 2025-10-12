// K6 Load Testing Script for Guanacaste Real Estate Platform
// Comprehensive performance testing under various load conditions

import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate, Trend } from 'k6/metrics';

// Custom metrics
const errorRate = new Rate('errors');
const searchResponseTime = new Trend('search_response_time');
const propertyResponseTime = new Trend('property_response_time');
const apiResponseTime = new Trend('api_response_time');

// Test configuration
export const options = {
  scenarios: {
    // Smoke test - basic functionality
    smoke_test: {
      executor: 'constant-vus',
      vus: 1,
      duration: '30s',
      tags: { test_type: 'smoke' },
    },

    // Load test - normal production load
    load_test: {
      executor: 'ramping-vus',
      stages: [
        { duration: '2m', target: 50 },   // Ramp up to 50 users
        { duration: '5m', target: 50 },   // Stay at 50 users
        { duration: '2m', target: 100 },  // Ramp up to 100 users
        { duration: '5m', target: 100 },  // Stay at 100 users
        { duration: '2m', target: 0 },    // Ramp down to 0
      ],
      tags: { test_type: 'load' },
    },

    // Stress test - maximum capacity
    stress_test: {
      executor: 'ramping-vus',
      stages: [
        { duration: '1m', target: 100 },  // Quick ramp to 100
        { duration: '3m', target: 100 },  // Stay at 100
        { duration: '1m', target: 200 },  // Ramp to 200
        { duration: '3m', target: 200 },  // Stay at 200
        { duration: '1m', target: 500 },  // Ramp to 500 (stress)
        { duration: '2m', target: 500 },  // Stay at 500
        { duration: '1m', target: 0 },    // Ramp down
      ],
      tags: { test_type: 'stress' },
    },

    // Spike test - sudden traffic spikes
    spike_test: {
      executor: 'ramping-vus',
      stages: [
        { duration: '10s', target: 10 },   // Normal load
        { duration: '10s', target: 200 },  // Spike to 200
        { duration: '30s', target: 200 },  // Stay at spike
        { duration: '10s', target: 10 },   // Back to normal
        { duration: '10s', target: 0 },    // Ramp down
      ],
      tags: { test_type: 'spike' },
    },

    // Endurance test - sustained load over time
    endurance_test: {
      executor: 'constant-vus',
      vus: 50,
      duration: '30m',  // 30 minutes of sustained load
      tags: { test_type: 'endurance' },
    },
  },

  thresholds: {
    // Overall error rate should be less than 1%
    'errors': ['rate<0.01'],

    // 95th percentile response times
    'search_response_time': ['p(95)<2000'],     // 2 seconds for search
    'property_response_time': ['p(95)<1500'],   // 1.5 seconds for property pages
    'api_response_time': ['p(95)<1000'],        // 1 second for API calls

    // HTTP request duration
    'http_req_duration': ['p(95)<2000'],        // 2 seconds overall

    // HTTP request failed rate
    'http_req_failed': ['rate<0.05'],           // Less than 5% failure rate
  },
};

// Base URL configuration
const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000';
const API_BASE = `${BASE_URL}/api`;

// Test data
const SEARCH_QUERIES = [
  'beach house',
  'ocean view',
  'luxury villa',
  'condo tamarindo',
  'house playa grande',
  'apartment nosara',
  'land guanacaste',
  'commercial property'
];

const PROPERTY_TYPES = ['house', 'condo', 'villa', 'land', 'commercial'];

function getRandomElement(array) {
  return array[Math.floor(Math.random() * array.length)];
}

function generateRandomSearchParams() {
  const params = new URLSearchParams();

  // Random search query
  if (Math.random() > 0.3) { // 70% of searches have queries
    params.append('query', getRandomElement(SEARCH_QUERIES));
  }

  // Random filters
  if (Math.random() > 0.5) { // 50% have type filter
    params.append('type', getRandomElement(PROPERTY_TYPES));
  }

  if (Math.random() > 0.6) { // 40% have price filters
    const minPrice = Math.floor(Math.random() * 500000) + 50000;
    const maxPrice = minPrice + Math.floor(Math.random() * 1000000);
    params.append('min_price', minPrice.toString());
    params.append('max_price', maxPrice.toString());
  }

  if (Math.random() > 0.7) { // 30% have location
    const locations = ['Tamarindo', 'Playa Grande', 'Nosara', 'Samara', 'Flamingo'];
    params.append('town', getRandomElement(locations));
  }

  return params.toString();
}

// Main test function
export default function () {
  const vuId = __VU; // Virtual user ID
  const iteration = __ITER; // Iteration number

  // Health check - run every 10 iterations
  if (iteration % 10 === 0) {
    const healthResponse = http.get(`${API_BASE}/health`);
    check(healthResponse, {
      'health check status is 200': (r) => r.status === 200,
    }) || errorRate.add(1);

    apiResponseTime.add(healthResponse.timings.duration);
  }

  // Property search - most common operation
  const searchParams = generateRandomSearchParams();
  const searchResponse = http.get(`${API_BASE}/search?${searchParams}`);

  const searchCheck = check(searchResponse, {
    'search status is 200': (r) => r.status === 200,
    'search response time < 2000ms': (r) => r.timings.duration < 2000,
    'search has results or empty array': (r) => {
      try {
        const data = JSON.parse(r.body);
        return Array.isArray(data) || (data.data && Array.isArray(data.data));
      } catch {
        return false;
      }
    },
  });

  if (!searchCheck) {
    errorRate.add(1);
  }

  searchResponseTime.add(searchResponse.timings.duration);
  apiResponseTime.add(searchResponse.timings.duration);

  // Property details - 30% of users view property details
  if (Math.random() < 0.3) {
    // Get a property from search results to view details
    try {
      const searchData = JSON.parse(searchResponse.body);
      const properties = Array.isArray(searchData) ? searchData : (searchData.data || []);

      if (properties.length > 0) {
        const randomProperty = getRandomElement(properties);
        const propertyId = randomProperty.id;

        const propertyResponse = http.get(`${API_BASE}/properties/${propertyId}`);

        const propertyCheck = check(propertyResponse, {
          'property status is 200': (r) => r.status === 200,
          'property response time < 1500ms': (r) => r.timings.duration < 1500,
          'property has data': (r) => {
            try {
              const data = JSON.parse(r.body);
              return data && typeof data === 'object';
            } catch {
              return false;
            }
          },
        });

        if (!propertyCheck) {
          errorRate.add(1);
        }

        propertyResponseTime.add(propertyResponse.timings.duration);
        apiResponseTime.add(propertyResponse.timings.duration);

        // Simulate user thinking time
        sleep(Math.random() * 3 + 1); // 1-4 seconds

        // AI chat - 20% of property viewers use AI assistant
        if (Math.random() < 0.2) {
          const aiResponse = http.post(`${API_BASE}/ai/ask`, {
            query: 'What are the property taxes here?',
            property_id: propertyId
          }, {
            headers: {
              'Content-Type': 'application/json',
            },
          });

          const aiCheck = check(aiResponse, {
            'AI status is 200': (r) => r.status === 200,
            'AI response time < 3000ms': (r) => r.timings.duration < 3000,
          });

          if (!aiCheck) {
            errorRate.add(1);
          }

          apiResponseTime.add(aiResponse.timings.duration);
        }
      }
    } catch (error) {
      console.log(`Error in property details flow: ${error.message}`);
      errorRate.add(1);
    }
  }

  // Contact form submission - 5% of users submit contact forms
  if (Math.random() < 0.05) {
    const contactResponse = http.post(`${API_BASE}/leads`, {
      property_id: `prop_${Math.floor(Math.random() * 1000)}`,
      contact_method: 'email',
      name: 'Test User',
      email: `test${vuId}@example.com`,
      message: 'I am interested in this property. Please contact me.',
    }, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const contactCheck = check(contactResponse, {
      'contact status is 200 or 429': (r) => r.status === 200 || r.status === 429,
      'contact response time < 2000ms': (r) => r.timings.duration < 2000,
    });

    if (!contactCheck) {
      errorRate.add(1);
    }

    apiResponseTime.add(contactResponse.timings.duration);
  }

  // Simulate user behavior - random think time between actions
  sleep(Math.random() * 5 + 2); // 2-7 seconds between actions
}

// Setup function - runs before the test starts
export function setup() {
  console.log('🚀 Starting load test for Guanacaste Real Estate Platform');
  console.log(`Target URL: ${BASE_URL}`);
  console.log('Test scenarios: smoke, load, stress, spike, endurance');

  // Warm up - make a few requests to ensure everything is ready
  const warmupResponse = http.get(`${API_BASE}/health`);
  if (warmupResponse.status !== 200) {
    console.error('❌ Warmup failed - health check returned status:', warmupResponse.status);
    return;
  }

  console.log('✅ Warmup successful - system is ready for testing');
  return { timestamp: new Date().toISOString() };
}

// Teardown function - runs after the test completes
export function teardown(data) {
  console.log('🏁 Load test completed');
  console.log(`Started at: ${data.timestamp}`);
  console.log(`Completed at: ${new Date().toISOString()}`);

  // Final health check
  const finalHealthCheck = http.get(`${API_BASE}/health`);
  console.log(`Final health check: ${finalHealthCheck.status === 200 ? '✅ PASS' : '❌ FAIL'}`);
}

// Handle summary - custom summary output
export function handleSummary(data) {
  const summary = {
    'stdout': textSummary(data, { indent: ' ', enableColors: true }),
    'load-test-results.json': JSON.stringify(data, null, 2),
    'load-test-summary.html': htmlReport(data),
  };

  return summary;
}

function textSummary(data, options) {
  return `
📊 Load Test Summary - Guanacaste Real Estate Platform
═════════════════════════════════════════════════════════

Test Duration: ${data.metrics.iteration_duration.values.avg}ms
Total Requests: ${data.metrics.http_reqs.values.count}
Failed Requests: ${data.metrics.http_req_failed.values.rate * 100}%

Response Times:
  Average: ${Math.round(data.metrics.http_req_duration.values.avg)}ms
  95th percentile: ${Math.round(data.metrics.http_req_duration.values['p(95)'])}ms
  99th percentile: ${Math.round(data.metrics.http_req_duration.values['p(99)'])}ms

Custom Metrics:
  Search Response Time (avg): ${Math.round(data.metrics.search_response_time.values.avg)}ms
  Property Response Time (avg): ${Math.round(data.metrics.property_response_time.values.avg)}ms
  API Response Time (avg): ${Math.round(data.metrics.api_response_time.values.avg)}ms
  Error Rate: ${(data.metrics.errors.values.rate * 100).toFixed(2)}%

HTTP Status Codes:
${Object.entries(data.metrics['http_req_duration{expected_response:true}'].values || {})
  .map(([status, count]) => `  ${status}: ${count}`)
  .join('\n')}

Recommendations:
${generateRecommendations(data)}
`;
}

function htmlReport(data) {
  return `
<!DOCTYPE html>
<html>
<head>
    <title>Guanacaste Real Estate - Load Test Report</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 40px; }
        .metric { background: #f5f5f5; padding: 10px; margin: 10px 0; border-radius: 5px; }
        .pass { color: green; }
        .fail { color: red; }
        .warn { color: orange; }
        table { border-collapse: collapse; width: 100%; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background-color: #f2f2f2; }
    </style>
</head>
<body>
    <h1>🚀 Guanacaste Real Estate - Load Test Report</h1>
    <p><strong>Generated:</strong> ${new Date().toISOString()}</p>

    <h2>📈 Key Metrics</h2>
    <div class="metric">
        <strong>Total Requests:</strong> ${data.metrics.http_reqs.values.count}<br>
        <strong>Failed Requests:</strong> ${(data.metrics.http_req_failed.values.rate * 100).toFixed(2)}%<br>
        <strong>Average Response Time:</strong> ${Math.round(data.metrics.http_req_duration.values.avg)}ms<br>
        <strong>95th Percentile:</strong> ${Math.round(data.metrics.http_req_duration.values['p(95)'])}ms
    </div>

    <h2>🔍 Custom Metrics</h2>
    <table>
        <tr><th>Metric</th><th>Average</th><th>95th Percentile</th></tr>
        <tr><td>Search Response Time</td><td>${Math.round(data.metrics.search_response_time.values.avg)}ms</td><td>${Math.round(data.metrics.search_response_time.values['p(95)'])}ms</td></tr>
        <tr><td>Property Response Time</td><td>${Math.round(data.metrics.property_response_time.values.avg)}ms</td><td>${Math.round(data.metrics.property_response_time.values['p(95)'])}ms</td></tr>
        <tr><td>API Response Time</td><td>${Math.round(data.metrics.api_response_time.values.avg)}ms</td><td>${Math.round(data.metrics.api_response_time.values['p(95)'])}ms</td></tr>
    </table>

    <h2>📋 Recommendations</h2>
    <pre>${generateRecommendations(data)}</pre>
</body>
</html>
`;
}

function generateRecommendations(data) {
  const recommendations = [];

  const errorRate = data.metrics.errors.values.rate;
  const p95ResponseTime = data.metrics.http_req_duration.values['p(95)'];
  const p99ResponseTime = data.metrics.http_req_duration.values['p(99)'];

  if (errorRate > 0.05) {
    recommendations.push('❌ High error rate detected. Investigate failing requests and implement better error handling.');
  }

  if (p95ResponseTime > 2000) {
    recommendations.push('⚠️ Slow response times. Consider implementing caching, database optimization, or scaling.');
  }

  if (p99ResponseTime > 5000) {
    recommendations.push('🚨 Very slow response times for some requests. Check for outliers and optimize bottlenecks.');
  }

  if (data.metrics.search_response_time.values.avg > 1500) {
    recommendations.push('🔍 Search performance needs improvement. Consider search index optimization.');
  }

  if (recommendations.length === 0) {
    recommendations.push('✅ All metrics look good! System is performing well under load.');
  }

  return recommendations.join('\n');
}