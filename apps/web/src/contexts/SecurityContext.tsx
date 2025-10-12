// Security Context for React components
// Provides CSRF tokens, security headers, and security utilities to components

import React, { createContext, useContext, useEffect, useState } from 'react';
import { securityService } from '../services/securityService';

interface SecurityContextType {
  csrfToken: string;
  generateNewCSRFToken: () => string;
  validateCSRFToken: (token: string) => boolean;
  getSecureHeaders: () => import('../services/securityService').SecurityHeaders;
  logSecurityEvent: (action: string, details: Record<string, any>) => void;
  securityStats: {
    totalEvents: number;
    suspiciousActivities: number;
    rateLimitHits: number;
  };
}

const SecurityContext = createContext<SecurityContextType | undefined>(undefined);

export const useSecurity = () => {
  const context = useContext(SecurityContext);
  if (context === undefined) {
    throw new Error('useSecurity must be used within a SecurityProvider');
  }
  return context;
};

interface SecurityProviderProps {
  children: React.ReactNode;
}

export const SecurityProvider: React.FC<SecurityProviderProps> = ({ children }) => {
  const [csrfToken, setCsrfToken] = useState<string>('');
  const [securityStats, setSecurityStats] = useState({
    totalEvents: 0,
    suspiciousActivities: 0,
    rateLimitHits: 0
  });

  useEffect(() => {
    // Generate initial CSRF token
    const token = securityService.generateCSRFToken();
    setCsrfToken(token);

    // Update security stats periodically
    const updateStats = () => {
      const stats = securityService.getSecurityStats(1); // Last hour
      setSecurityStats({
        totalEvents: stats.totalEvents,
        suspiciousActivities: stats.suspiciousActivities,
        rateLimitHits: stats.rateLimitHits
      });
    };

    updateStats();
    const interval = setInterval(updateStats, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, []);

  const generateNewCSRFToken = () => {
    const newToken = securityService.generateCSRFToken();
    setCsrfToken(newToken);
    return newToken;
  };

  const validateCSRFToken = (token: string) => {
    return securityService.validateCSRFToken(token);
  };

  const getSecureHeaders = () => {
    return securityService.getSecureHeaders();
  };

  const logSecurityEvent = (action: string, details: Record<string, any>) => {
    securityService.logSecurityEvent(action, details);
  };

  const value: SecurityContextType = {
    csrfToken,
    generateNewCSRFToken,
    validateCSRFToken,
    getSecureHeaders,
    logSecurityEvent,
    securityStats
  };

  return (
    <SecurityContext.Provider value={value}>
      {children}
    </SecurityContext.Provider>
  );
};

// Higher-order component for securing forms
export function withSecurity<T extends object>(
  Component: React.ComponentType<T & { security: SecurityContextType }>
) {
  return (props: T) => {
    const security = useSecurity();
    return <Component {...props} security={security} />;
  };
}

// Security middleware hook for API calls
export const useSecureAPI = () => {
  const security = useSecurity();

  const makeSecureRequest = async (
    url: string,
    options: RequestInit = {}
  ): Promise<Response> => {
    // Add security headers
    const secureHeaders = {
      ...security.getSecureHeaders(),
      'X-CSRF-Token': security.csrfToken,
      ...options.headers
    };

    // Add CSRF token to body if it's a state-changing request
    let body = options.body;
    if (options.method && ['POST', 'PUT', 'PATCH', 'DELETE'].includes(options.method.toUpperCase())) {
      if (typeof body === 'string') {
        try {
          const bodyData = JSON.parse(body);
          bodyData._csrf = security.csrfToken;
          body = JSON.stringify(bodyData);
        } catch {
          // If body is not JSON, add as form data
          const formData = new FormData();
          formData.append('_csrf', security.csrfToken);
          if (body) formData.append('data', body);
          body = formData;
        }
      }
    }

    const response = await fetch(url, {
      ...options,
      headers: secureHeaders,
      body
    });

    // Log security events
    if (!response.ok) {
      security.logSecurityEvent('api_request_failed', {
        url,
        method: options.method || 'GET',
        status: response.status,
        statusText: response.statusText
      });
    }

    return response;
  };

  return { makeSecureRequest };
};

// Security monitoring component
export const SecurityMonitor: React.FC = () => {
  const { securityStats } = useSecurity();

  if (securityStats.totalEvents === 0) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 bg-white shadow-lg rounded-lg p-3 border max-w-xs">
      <h4 className="text-sm font-medium text-gray-900 mb-2">Security Monitor</h4>
      <div className="space-y-1 text-xs text-gray-600">
        <div>Events: {securityStats.totalEvents}</div>
        {securityStats.suspiciousActivities > 0 && (
          <div className="text-red-600">Suspicious: {securityStats.suspiciousActivities}</div>
        )}
        {securityStats.rateLimitHits > 0 && (
          <div className="text-yellow-600">Rate Limited: {securityStats.rateLimitHits}</div>
        )}
      </div>
    </div>
  );
};