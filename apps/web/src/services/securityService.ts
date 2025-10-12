// Security Service
// Production-ready security hardening with input validation, rate limiting, and secure headers

import { errorHandler } from './errorHandler';

interface RateLimitConfig {
  windowMs: number; // Time window in milliseconds
  maxRequests: number; // Maximum requests per window
  skipSuccessfulRequests?: boolean;
  skipFailedRequests?: boolean;
}

interface RateLimitEntry {
  count: number;
  resetTime: number;
  lastRequest: number;
}

interface InputValidationRule {
  field: string;
  type: 'string' | 'number' | 'email' | 'url' | 'phone' | 'custom';
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  customValidator?: (value: any) => boolean;
  sanitize?: boolean;
}

interface SecurityHeaders {
  'Content-Security-Policy'?: string;
  'X-Frame-Options'?: string;
  'X-Content-Type-Options'?: string;
  'Referrer-Policy'?: string;
  'Permissions-Policy'?: string;
  'Strict-Transport-Security'?: string;
  'X-XSS-Protection'?: string;
}

interface SecurityConfig {
  enableRateLimiting: boolean;
  enableInputValidation: boolean;
  enableSecureHeaders: boolean;
  enableCSRFProtection: boolean;
  enableAuditLogging: boolean;
  trustedOrigins: string[];
  maxRequestSize: number; // in bytes
  sessionTimeout: number; // in milliseconds
}

class SecurityService {
  private rateLimits = new Map<string, RateLimitEntry>();
  private csrfTokens = new Set<string>();
  private config: SecurityConfig;
  private auditLog: Array<{
    timestamp: number;
    action: string;
    userId?: string;
    ip?: string;
    userAgent?: string;
    details: Record<string, any>;
  }> = [];

  constructor(config: Partial<SecurityConfig> = {}) {
    this.config = {
      enableRateLimiting: true,
      enableInputValidation: true,
      enableSecureHeaders: true,
      enableCSRFProtection: true,
      enableAuditLogging: true,
      trustedOrigins: ['http://localhost:3000', 'https://guanacaste-real.com'],
      maxRequestSize: 10 * 1024 * 1024, // 10MB
      sessionTimeout: 24 * 60 * 60 * 1000, // 24 hours
      ...config
    };

    // Clean up rate limits periodically
    setInterval(() => this.cleanupRateLimits(), 60000); // Clean every minute
  }

  // Rate Limiting
  checkRateLimit(
    identifier: string,
    config: RateLimitConfig
  ): { allowed: boolean; remaining: number; resetTime: number; retryAfter?: number } {
    if (!this.config.enableRateLimiting) {
      return { allowed: true, remaining: config.maxRequests, resetTime: Date.now() + config.windowMs };
    }

    const now = Date.now();
    const key = `${identifier}_${Math.floor(now / config.windowMs)}`;
    const entry = this.rateLimits.get(key) || {
      count: 0,
      resetTime: now + config.windowMs,
      lastRequest: now
    };

    // Reset if window has passed
    if (now > entry.resetTime) {
      entry.count = 0;
      entry.resetTime = now + config.windowMs;
    }

    const allowed = entry.count < config.maxRequests;

    if (allowed) {
      entry.count++;
      entry.lastRequest = now;
      this.rateLimits.set(key, entry);
    }

    return {
      allowed,
      remaining: Math.max(0, config.maxRequests - entry.count),
      resetTime: entry.resetTime,
      retryAfter: allowed ? undefined : Math.ceil((entry.resetTime - now) / 1000)
    };
  }

  // Input Validation and Sanitization
  validateInput(data: Record<string, any>, rules: InputValidationRule[]): {
    valid: boolean;
    errors: Record<string, string>;
    sanitizedData: Record<string, any>;
  } {
    if (!this.config.enableInputValidation) {
      return { valid: true, errors: {}, sanitizedData: data };
    }

    const errors: Record<string, string> = {};
    const sanitizedData = { ...data };

    for (const rule of rules) {
      const value = data[rule.field];

      // Check required fields
      if (rule.required && (value === undefined || value === null || value === '')) {
        errors[rule.field] = `${rule.field} is required`;
        continue;
      }

      // Skip validation if field is not required and empty
      if (!rule.required && (value === undefined || value === null || value === '')) {
        continue;
      }

      // Type validation
      switch (rule.type) {
        case 'string':
          if (typeof value !== 'string') {
            errors[rule.field] = `${rule.field} must be a string`;
            continue;
          }
          break;
        case 'number':
          if (typeof value !== 'number' || isNaN(value)) {
            errors[rule.field] = `${rule.field} must be a valid number`;
            continue;
          }
          break;
        case 'email':
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (typeof value !== 'string' || !emailRegex.test(value)) {
            errors[rule.field] = `${rule.field} must be a valid email address`;
            continue;
          }
          break;
        case 'url':
          try {
            new URL(value);
          } catch {
            errors[rule.field] = `${rule.field} must be a valid URL`;
            continue;
          }
          break;
        case 'phone':
          const phoneRegex = /^\+?[\d\s\-\(\)]+$/;
          if (typeof value !== 'string' || !phoneRegex.test(value)) {
            errors[rule.field] = `${rule.field} must be a valid phone number`;
            continue;
          }
          break;
        case 'custom':
          if (rule.customValidator && !rule.customValidator(value)) {
            errors[rule.field] = `${rule.field} failed custom validation`;
            continue;
          }
          break;
      }

      // Length validation
      if (typeof value === 'string') {
        if (rule.minLength && value.length < rule.minLength) {
          errors[rule.field] = `${rule.field} must be at least ${rule.minLength} characters`;
        }
        if (rule.maxLength && value.length > rule.maxLength) {
          errors[rule.field] = `${rule.field} must be no more than ${rule.maxLength} characters`;
        }
      }

      // Pattern validation
      if (rule.pattern && typeof value === 'string' && !rule.pattern.test(value)) {
        errors[rule.field] = `${rule.field} format is invalid`;
      }

      // Sanitization
      if (rule.sanitize && typeof value === 'string') {
        sanitizedData[rule.field] = this.sanitizeString(value);
      }
    }

    return {
      valid: Object.keys(errors).length === 0,
      errors,
      sanitizedData
    };
  }

  // CSRF Protection
  generateCSRFToken(): string {
    if (!this.config.enableCSRFProtection) {
      return 'csrf_disabled';
    }

    const token = `csrf_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    this.csrfTokens.add(token);

    // Clean up old tokens (keep only last 1000)
    if (this.csrfTokens.size > 1000) {
      const tokensArray = Array.from(this.csrfTokens);
      this.csrfTokens = new Set(tokensArray.slice(-1000));
    }

    return token;
  }

  validateCSRFToken(token: string): boolean {
    if (!this.config.enableCSRFProtection) {
      return true;
    }

    const isValid = this.csrfTokens.has(token);
    if (isValid) {
      this.csrfTokens.delete(token); // One-time use
    }
    return isValid;
  }

  // Secure Headers
  getSecureHeaders(origin?: string): SecurityHeaders {
    if (!this.config.enableSecureHeaders) {
      return {};
    }

    const headers: SecurityHeaders = {
      'Content-Security-Policy': this.buildCSP(origin),
      'X-Frame-Options': 'DENY',
      'X-Content-Type-Options': 'nosniff',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
      'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
      'X-XSS-Protection': '1; mode=block'
    };

    // Add HSTS for HTTPS
    if (typeof window !== 'undefined' && window.location.protocol === 'https:') {
      headers['Strict-Transport-Security'] = 'max-age=31536000; includeSubDomains';
    }

    return headers;
  }

  // Request Size Validation
  validateRequestSize(size: number): boolean {
    return size <= this.config.maxRequestSize;
  }

  // Origin Validation
  validateOrigin(origin: string): boolean {
    return this.config.trustedOrigins.includes(origin);
  }

  // Audit Logging
  logSecurityEvent(
    action: string,
    details: Record<string, any>,
    userId?: string,
    ip?: string,
    userAgent?: string
  ): void {
    if (!this.config.enableAuditLogging) {
      return;
    }

    this.auditLog.push({
      timestamp: Date.now(),
      action,
      userId,
      ip,
      userAgent,
      details
    });

    // Keep only last 10000 entries
    if (this.auditLog.length > 10000) {
      this.auditLog = this.auditLog.slice(-10000);
    }

    // Log critical security events immediately
    if (['suspicious_activity', 'failed_login', 'rate_limit_exceeded'].includes(action)) {
      console.warn(`Security Event: ${action}`, { userId, ip, details });
    }
  }

  // Get audit log
  getAuditLog(hours: number = 24): Array<{
    timestamp: number;
    action: string;
    userId?: string;
    ip?: string;
    userAgent?: string;
    details: Record<string, any>;
  }> {
    const cutoff = Date.now() - (hours * 60 * 60 * 1000);
    return this.auditLog.filter(entry => entry.timestamp > cutoff);
  }

  // Security monitoring
  getSecurityStats(hours: number = 24): {
    totalEvents: number;
    eventsByAction: Record<string, number>;
    suspiciousActivities: number;
    rateLimitHits: number;
    recentEvents: Array<any>;
  } {
    const events = this.getAuditLog(hours);

    const eventsByAction = events.reduce((acc, event) => {
      acc[event.action] = (acc[event.action] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const suspiciousActivities = events.filter(e =>
      ['suspicious_activity', 'failed_login', 'rate_limit_exceeded'].includes(e.action)
    ).length;

    const rateLimitHits = events.filter(e => e.action === 'rate_limit_exceeded').length;

    return {
      totalEvents: events.length,
      eventsByAction,
      suspiciousActivities,
      rateLimitHits,
      recentEvents: events.slice(-20)
    };
  }

  // Private methods
  private cleanupRateLimits(): void {
    const now = Date.now();
    for (const [key, entry] of this.rateLimits.entries()) {
      if (now > entry.resetTime) {
        this.rateLimits.delete(key);
      }
    }
  }

  private sanitizeString(input: string): string {
    // Basic HTML sanitization - remove script tags and dangerous attributes
    return input
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/<[^>]*>/g, '') // Remove all HTML tags
      .trim();
  }

  private buildCSP(origin?: string): string {
    const trustedOrigins = this.config.trustedOrigins.join(' ');
    const self = "'self'";

    return [
      `default-src ${self}`,
      `script-src ${self} 'unsafe-inline' 'unsafe-eval' ${trustedOrigins}`,
      `style-src ${self} 'unsafe-inline' ${trustedOrigins}`,
      `img-src ${self} data: https: ${trustedOrigins}`,
      `font-src ${self} ${trustedOrigins}`,
      `connect-src ${self} ${trustedOrigins}`,
      `media-src ${self} ${trustedOrigins}`,
      `object-src 'none'`,
      `frame-src ${trustedOrigins}`,
      `base-uri ${self}`,
      `form-action ${self} ${trustedOrigins}`
    ].join('; ');
  }
}

// Predefined validation rules for common use cases
export const validationRules = {
  userRegistration: [
    { field: 'email', type: 'email' as const, required: true, maxLength: 254 },
    { field: 'password', type: 'string' as const, required: true, minLength: 8, maxLength: 128 },
    { field: 'fullName', type: 'string' as const, required: true, minLength: 2, maxLength: 100, sanitize: true },
    { field: 'phone', type: 'phone' as const, required: false, maxLength: 20 }
  ],

  propertyListing: [
    { field: 'title', type: 'string' as const, required: true, minLength: 5, maxLength: 200, sanitize: true },
    { field: 'description', type: 'string' as const, required: true, minLength: 10, maxLength: 5000, sanitize: true },
    { field: 'price', type: 'number' as const, required: true },
    { field: 'currency', type: 'string' as const, required: true, pattern: /^[A-Z]{3}$/ },
    { field: 'propertyType', type: 'string' as const, required: true },
    { field: 'town', type: 'string' as const, required: true, sanitize: true }
  ],

  contactForm: [
    { field: 'name', type: 'string' as const, required: true, minLength: 2, maxLength: 100, sanitize: true },
    { field: 'email', type: 'email' as const, required: true, maxLength: 254 },
    { field: 'message', type: 'string' as const, required: true, minLength: 10, maxLength: 2000, sanitize: true },
    { field: 'phone', type: 'phone' as const, required: false, maxLength: 20 }
  ],

  searchQuery: [
    { field: 'query', type: 'string' as const, required: false, maxLength: 500, sanitize: true },
    { field: 'location', type: 'string' as const, required: false, maxLength: 100, sanitize: true }
  ]
};

// Rate limiting configurations
export const rateLimitConfigs = {
  api: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 100
  },

  auth: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 5 // Very strict for auth endpoints
  },

  search: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 30
  },

  contact: {
    windowMs: 60 * 60 * 1000, // 1 hour
    maxRequests: 3
  }
};

// Create singleton instance
export const securityService = new SecurityService();

// Export types
export type { SecurityConfig, RateLimitConfig, InputValidationRule, SecurityHeaders };