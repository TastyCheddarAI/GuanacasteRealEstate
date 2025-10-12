#!/usr/bin/env tsx

// Test script for Security Service
// Validates rate limiting, input validation, CSRF protection, and security monitoring

import { securityService, validationRules, rateLimitConfigs } from '../apps/web/src/services/securityService';

async function testSecurityService() {
  console.log('🔒 Testing Security Service\n');

  // Test 1: Input validation
  console.log('1. Testing input validation...');

  // Test valid property listing data
  const validPropertyData = {
    title: 'Beautiful Beach House',
    description: 'A wonderful property with ocean views',
    price: 500000,
    currency: 'USD',
    propertyType: 'house',
    town: 'Tamarindo'
  };

  const propertyValidation = securityService.validateInput(validPropertyData, validationRules.propertyListing);
  console.log('Valid property data:', propertyValidation.valid ? '✅ PASSED' : '❌ FAILED');

  // Test invalid data
  const invalidPropertyData = {
    title: '', // Too short
    description: 'A', // Too short
    price: 'not-a-number', // Wrong type
    currency: 'USDD', // Wrong format
    propertyType: '', // Empty
    town: '<script>alert("xss")</script>' // XSS attempt
  };

  const invalidValidation = securityService.validateInput(invalidPropertyData, validationRules.propertyListing);
  console.log('Invalid property data (should fail):', !invalidValidation.valid ? '✅ PASSED' : '❌ FAILED');
  console.log('Validation errors:', invalidValidation.errors);

  // Test sanitization
  console.log('Sanitized data:', invalidValidation.sanitizedData.town); // Should remove script tags

  // Test 2: Rate limiting
  console.log('\n2. Testing rate limiting...');

  const clientId = 'test_client_' + Date.now();
  const rateLimitConfig = rateLimitConfigs.api;

  // Make requests up to the limit
  for (let i = 0; i < rateLimitConfig.maxRequests; i++) {
    const result = securityService.checkRateLimit(clientId, rateLimitConfig);
    if (!result.allowed) {
      console.log('❌ Rate limit triggered too early');
      break;
    }
  }
  console.log('✅ Rate limit respected within window');

  // Try one more request (should be blocked)
  const blockedResult = securityService.checkRateLimit(clientId, rateLimitConfig);
  console.log('Rate limit exceeded (should be blocked):', !blockedResult.allowed ? '✅ PASSED' : '❌ FAILED');

  // Test 3: CSRF protection
  console.log('\n3. Testing CSRF protection...');

  const token1 = securityService.generateCSRFToken();
  const token2 = securityService.generateCSRFToken();

  console.log('Generated tokens:', token1 !== token2 ? '✅ UNIQUE' : '❌ NOT UNIQUE');

  // Test token validation
  const validToken = securityService.validateCSRFToken(token1);
  console.log('Valid token validation:', validToken ? '✅ PASSED' : '❌ FAILED');

  // Test token reuse (should fail)
  const reusedToken = securityService.validateCSRFToken(token1);
  console.log('Token reuse prevention:', !reusedToken ? '✅ PASSED' : '❌ FAILED');

  // Test invalid token
  const invalidToken = securityService.validateCSRFToken('invalid_token');
  console.log('Invalid token rejection:', !invalidToken ? '✅ PASSED' : '❌ FAILED');

  // Test 4: Security headers
  console.log('\n4. Testing security headers...');

  const headers = securityService.getSecureHeaders();
  console.log('Security headers generated:', Object.keys(headers).length > 0 ? '✅ PASSED' : '❌ FAILED');

  // Check for essential headers
  const essentialHeaders = ['Content-Security-Policy', 'X-Frame-Options', 'X-Content-Type-Options'];
  const hasEssentialHeaders = essentialHeaders.every(header => header in headers);
  console.log('Essential headers present:', hasEssentialHeaders ? '✅ PASSED' : '❌ FAILED');

  // Test 5: Request size validation
  console.log('\n5. Testing request size validation...');

  const smallRequest = 'small data';
  const largeRequest = 'x'.repeat(15 * 1024 * 1024); // 15MB

  const smallValid = securityService.validateRequestSize(smallRequest.length);
  const largeValid = securityService.validateRequestSize(largeRequest.length);

  console.log('Small request validation:', smallValid ? '✅ PASSED' : '❌ FAILED');
  console.log('Large request validation (should fail):', !largeValid ? '✅ PASSED' : '❌ FAILED');

  // Test 6: Origin validation
  console.log('\n6. Testing origin validation...');

  const validOrigin = 'https://guanacastereal.com';
  const invalidOrigin = 'https://malicious-site.com';

  const validOriginCheck = securityService.validateOrigin(validOrigin);
  const invalidOriginCheck = securityService.validateOrigin(invalidOrigin);

  console.log('Valid origin check:', validOriginCheck ? '✅ PASSED' : '❌ FAILED');
  console.log('Invalid origin rejection:', !invalidOriginCheck ? '✅ PASSED' : '❌ FAILED');

  // Test 7: Audit logging
  console.log('\n7. Testing audit logging...');

  securityService.logSecurityEvent('test_event', {
    action: 'test_security_features',
    timestamp: Date.now()
  });

  securityService.logSecurityEvent('rate_limit_exceeded', {
    clientId: 'test_user',
    endpoint: '/api/properties'
  });

  const auditLog = securityService.getAuditLog(1); // Last hour
  console.log('Audit log entries:', auditLog.length >= 2 ? '✅ PASSED' : '❌ FAILED');

  // Test 8: Security statistics
  console.log('\n8. Testing security statistics...');

  const stats = securityService.getSecurityStats(1); // Last hour
  console.log('Security stats:', {
    totalEvents: stats.totalEvents,
    suspiciousActivities: stats.suspiciousActivities,
    rateLimitHits: stats.rateLimitHits
  });

  console.log('Stats calculation:', stats.totalEvents > 0 ? '✅ PASSED' : '❌ FAILED');

  // Test 9: Contact form validation
  console.log('\n9. Testing contact form validation...');

  const validContactData = {
    name: 'John Doe',
    email: 'john@example.com',
    message: 'I am interested in this property.'
  };

  const invalidContactData = {
    name: '',
    email: 'invalid-email',
    message: 'x'.repeat(3000) // Too long
  };

  const validContactValidation = securityService.validateInput(validContactData, validationRules.contactForm);
  const invalidContactValidation = securityService.validateInput(invalidContactData, validationRules.contactForm);

  console.log('Valid contact form:', validContactValidation.valid ? '✅ PASSED' : '❌ FAILED');
  console.log('Invalid contact form (should fail):', !invalidContactValidation.valid ? '✅ PASSED' : '❌ FAILED');

  // Test 10: Search query validation
  console.log('\n10. Testing search query validation...');

  const validSearchData = {
    query: 'beach house',
    location: 'Tamarindo'
  };

  const maliciousSearchData = {
    query: '<script>alert("xss")</script>',
    location: 'Tamarindo'
  };

  const validSearchValidation = securityService.validateInput(validSearchData, validationRules.searchQuery);
  const maliciousSearchValidation = securityService.validateInput(maliciousSearchData, validationRules.searchQuery);

  console.log('Valid search query:', validSearchValidation.valid ? '✅ PASSED' : '❌ FAILED');
  console.log('Malicious search query sanitized:', maliciousSearchValidation.sanitizedData.query !== maliciousSearchData.query ? '✅ PASSED' : '❌ FAILED');

  console.log('\n🎉 All security service tests completed!');

  // Final summary
  const finalStats = securityService.getSecurityStats();
  console.log('\n📊 Final Security Statistics:');
  console.log(`Total events: ${finalStats.totalEvents}`);
  console.log(`Rate limit hits: ${finalStats.rateLimitHits}`);
  console.log(`Suspicious activities: ${finalStats.suspiciousActivities}`);
  console.log(`Events by action:`, finalStats.eventsByAction);
}

// Run tests
testSecurityService().catch(console.error);