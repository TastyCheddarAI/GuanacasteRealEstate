import { supabase } from '../contexts/AuthContext';
import { performanceMonitor, trackAPIResponse } from './performanceMonitor';
import { errorHandler, handleAsyncError } from './errorHandler';
import { securityService, rateLimitConfigs, validationRules } from './securityService';
import { databaseOptimizationService } from './databaseOptimizationService';

// Base URL for Supabase Edge Functions
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Enhanced helper function to call Edge Functions with security, error handling and performance monitoring
async function callEdgeFunction(functionName: string, body: any = {}, clientId?: string) {
  const startTime = performance.now();
  const url = `${SUPABASE_URL}/functions/v1/${functionName}`;

  // Rate limiting check
  const rateLimitResult = securityService.checkRateLimit(
    clientId || 'anonymous',
    rateLimitConfigs.api
  );

  if (!rateLimitResult.allowed) {
    securityService.logSecurityEvent('rate_limit_exceeded', {
      functionName,
      clientId: clientId || 'anonymous',
      retryAfter: rateLimitResult.retryAfter
    });

    throw new Error(`Rate limit exceeded. Try again in ${rateLimitResult.retryAfter} seconds.`);
  }

  // Request size validation
  const requestSize = JSON.stringify(body).length;
  if (!securityService.validateRequestSize(requestSize)) {
    securityService.logSecurityEvent('request_too_large', {
      functionName,
      requestSize,
      maxSize: securityService['config'].maxRequestSize
    });

    throw new Error('Request payload too large');
  }

  return errorHandler.withRetry(async () => {
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
          ...securityService.getSecureHeaders()
        },
        body: JSON.stringify(body),
      });

      const endTime = performance.now();

      // Track API performance
      trackAPIResponse(
        url,
        'POST',
        startTime,
        response.status,
        !response.ok ? new Error(`HTTP ${response.status}: ${response.statusText}`) : undefined
      );

      if (!response.ok) {
        const error = new Error(`Edge function ${functionName} failed: ${response.statusText}`);
        await errorHandler.handleError(error, {
          url,
          additionalData: { functionName, body, status: response.status }
        }, {
          severity: response.status >= 500 ? 'high' : 'medium',
          category: 'api'
        });
        throw error;
      }

      return response.json();
    } catch (error) {
      const endTime = performance.now();

      // Track failed API call
      trackAPIResponse(
        url,
        'POST',
        startTime,
        0, // No status code for network errors
        error as Error
      );

      // Log security event for failed requests
      securityService.logSecurityEvent('api_call_failed', {
        functionName,
        error: (error as Error).message,
        clientId: clientId || 'anonymous'
      });

      // Error will be handled by retry logic
      throw error;
    }
  }, {
    maxRetries: 3,
    baseDelay: 1000,
    retryCondition: (error) => {
      const message = error.message.toLowerCase();
      return message.includes('fetch') ||
             message.includes('network') ||
             message.includes('timeout') ||
             message.includes('500') ||
             message.includes('502') ||
             message.includes('503') ||
             message.includes('504');
    }
  });
}

// Search API
export const searchAPI = {
  searchProperties: async (params: {
    query?: string;
    lat?: number;
    lng?: number;
    radius_km?: number;
    type?: string;
    min_price?: number;
    max_price?: number;
    beds?: number;
    baths?: number;
    limit?: number;
    offset?: number;
  }) => {
    // Convert search params to properties API filters
    const filters: any = {};

    if (params.type && params.type !== 'all') {
      filters.type = params.type;
    }
    if (params.min_price) {
      filters.min_price = params.min_price;
    }
    if (params.max_price) {
      filters.max_price = params.max_price;
    }
    if (params.beds) {
      filters.beds = params.beds;
    }
    if (params.baths) {
      filters.baths = params.baths;
    }

    // For now, use direct properties API call
    // TODO: Implement proper search with query matching
    const page = Math.floor((params.offset || 0) / (params.limit || 20)) + 1;
    const limit = params.limit || 20;

    const result = await propertiesAPI.getProperties(filters, page, limit);

    // Format response to match expected structure
    return {
      properties: result.properties || [],
      total: result.total || 0,
      page: result.page || page,
      limit: result.limit || limit
    };
  },
};

// AI API
export const aiAPI = {
  ask: async (query: string, propertyId?: string) => {
    return callEdgeFunction('ai', {
      query,
      property_id: propertyId,
    });
  },

  searchProperties: async (filters: any) => {
    return propertiesAPI.getProperties(filters);
  },

  ingestGlobal: async (content: string, sourceRef: string, verified = false) => {
    return callEdgeFunction('ai', {
      content,
      source_ref: sourceRef,
      verified,
    });
  },

  ingestProperty: async (propertyId: string) => {
    return callEdgeFunction('ai', {
      property_id: propertyId,
    });
  },

  // Enhanced AI Document Analysis
  analyzeDocument: async (params: {
    document_type: 'legal_contract' | 'property_deed' | 'environmental_report' | 'construction_permit' | 'tax_document' | 'financial_statement' | 'general';
    content: string;
    filename?: string;
    property_id?: string;
  }) => {
    return callEdgeFunction('ai/analyze_document', params);
  },

  // Enhanced AI Image Analysis
  analyzeImage: async (params: {
    image_url: string;
    analysis_type: 'property_exterior' | 'property_interior' | 'neighborhood' | 'floor_plan' | 'damage_assessment';
    property_id?: string;
  }) => {
    return callEdgeFunction('ai/analyze_image', params);
  },
};

// Messaging API
export const messagingAPI = {
  relay: async (params: {
    from_profile_id: string;
    to_profile_id: string;
    property_id?: string;
    body: string;
  }) => {
    return callEdgeFunction('messaging', params);
  },

  notify: async (profileId: string) => {
    return callEdgeFunction('messaging', { profile_id: profileId });
  },
};

// Media API
export const mediaAPI = {
  onUpload: async (event: {
    bucketId: string;
    name: string;
    file: {
      path: string;
      id: string;
      size: number;
      mimeType: string;
      checksum: string;
    };
  }) => {
    return callEdgeFunction('media', event);
  },
};

// Properties API (direct Supabase calls for CRUD operations)
export const propertiesAPI = {
  getProperty: handleAsyncError(async (id: string) => {
    // Validate input data
    const validation = securityService.validateInput({ id }, [
      { field: 'id', type: 'string', required: true, minLength: 1 }
    ]);

    if (!validation.valid) {
      await errorHandler.handleError(
        new Error('Property ID validation failed'),
        { additionalData: { validationErrors: validation.errors } },
        { severity: 'medium', category: 'validation' }
      );
      throw new Error(`Validation failed: ${Object.values(validation.errors).join(', ')}`);
    }

    // Use optimized database query
    const result = await databaseOptimizationService.getOptimizedProperty(id);

    if (result.error) {
      await errorHandler.handleError(result.error, {
        additionalData: { operation: 'getProperty', propertyId: id }
      }, {
        severity: 'medium',
        category: 'api'
      });
      throw result.error;
    }

    return result.data;
  }),

  getProperties: handleAsyncError(async (filters: any = {}, page: number = 1, limit: number = 20) => {
    // Validate input data
    const validation = securityService.validateInput(filters, [
      { field: 'type', type: 'string', required: false },
      { field: 'town', type: 'string', required: false, sanitize: true }
    ]);

    if (!validation.valid) {
      await errorHandler.handleError(
        new Error('Property filters validation failed'),
        { additionalData: { validationErrors: validation.errors } },
        { severity: 'medium', category: 'validation' }
      );
      throw new Error(`Validation failed: ${Object.values(validation.errors).join(', ')}`);
    }

    // Use optimized database query with pagination
    const result = await databaseOptimizationService.getOptimizedProperties(
      validation.sanitizedData,
      page,
      limit
    );

    if (result.error) {
      await errorHandler.handleError(result.error, {
        additionalData: { operation: 'getProperties', filters: validation.sanitizedData, page, limit }
      }, {
        severity: 'medium',
        category: 'api'
      });
      throw result.error;
    }

    // Format the response to match expected structure
    return {
      properties: result.data || [],
      total: (result as any).count || 0,
      page,
      limit
    };
  }),

  createProperty: handleAsyncError(async (propertyData: any, clientId?: string) => {
    // Validate input data
    const validation = securityService.validateInput(propertyData, validationRules.propertyListing);
    if (!validation.valid) {
      securityService.logSecurityEvent('validation_failed', {
        operation: 'createProperty',
        errors: validation.errors,
        clientId
      });

      await errorHandler.handleError(
        new Error('Property data validation failed'),
        { additionalData: { validationErrors: validation.errors } },
        { severity: 'medium', category: 'validation' }
      );
      throw new Error(`Validation failed: ${Object.values(validation.errors).join(', ')}`);
    }

    const { data, error } = await supabase
      .from('properties')
      .insert(validation.sanitizedData)
      .select()
      .single();

    if (error) {
      await errorHandler.handleError(error, {
        additionalData: { operation: 'createProperty', propertyData: validation.sanitizedData }
      }, {
        severity: 'high',
        category: 'api'
      });
      throw error;
    }

    securityService.logSecurityEvent('property_created', {
      propertyId: data.id,
      clientId
    });

    return data;
  }),

  updateProperty: handleAsyncError(async (id: string, updates: any, clientId?: string) => {
    // Validate input data (partial validation for updates)
    const validation = securityService.validateInput(updates, validationRules.propertyListing.map(rule => ({
      ...rule,
      required: false // Make all fields optional for updates
    })));

    if (!validation.valid) {
      securityService.logSecurityEvent('validation_failed', {
        operation: 'updateProperty',
        propertyId: id,
        errors: validation.errors,
        clientId
      });

      await errorHandler.handleError(
        new Error('Property update data validation failed'),
        { additionalData: { validationErrors: validation.errors, propertyId: id } },
        { severity: 'medium', category: 'validation' }
      );
      throw new Error(`Validation failed: ${Object.values(validation.errors).join(', ')}`);
    }

    const { data, error } = await supabase
      .from('properties')
      .update(validation.sanitizedData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      await errorHandler.handleError(error, {
        additionalData: { operation: 'updateProperty', propertyId: id, updates: validation.sanitizedData }
      }, {
        severity: 'high',
        category: 'api'
      });
      throw error;
    }

    securityService.logSecurityEvent('property_updated', {
      propertyId: id,
      clientId
    });

    return data;
  }),
};

// Messages API (direct Supabase calls)
export const messagesAPI = {
  getMessages: async (threadId: string) => {
    const { data, error } = await supabase
      .from('messages')
      .select(`
        *,
        from_profile:profiles!from_profile_id (
          full_name
        ),
        to_profile:profiles!to_profile_id (
          full_name
        )
      `)
      .eq('thread_id', threadId)
      .order('created_at', { ascending: true });

    if (error) throw error;
    return data;
  },

  sendMessage: async (messageData: {
    thread_id: string;
    from_profile_id: string;
    to_profile_id: string;
    property_id?: string;
    body: string;
  }) => {
    const { data, error } = await supabase
      .from('messages')
      .insert(messageData)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  getThreads: async (profileId: string) => {
    const { data, error } = await supabase
      .from('messages')
      .select(`
        thread_id,
        property:properties (
          title,
          price_numeric,
          currency
        ),
        from_profile:profiles!from_profile_id (
          full_name
        ),
        to_profile:profiles!to_profile_id (
          full_name
        ),
        body,
        created_at,
        read_at
      `)
      .or(`from_profile_id.eq.${profileId},to_profile_id.eq.${profileId}`)
      .order('created_at', { ascending: false });

    if (error) throw error;

    // Group by thread_id and get latest message
    const threads = data.reduce((acc: any, msg: any) => {
      if (!acc[msg.thread_id]) {
        acc[msg.thread_id] = {
          thread_id: msg.thread_id,
          property: msg.property,
          other_party: msg.from_profile_id === profileId ? msg.to_profile : msg.from_profile,
          last_message: msg.body,
          last_message_at: msg.created_at,
          unread_count: msg.read_at ? 0 : 1,
        };
      }
      return acc;
    }, {});

    return Object.values(threads);
  },
};

// Leads API
export const leadsAPI = {
  createLead: handleAsyncError(async (leadData: {
    property_id: string;
    visitor_profile_id?: string;
    contact_method: string;
    message?: string;
    consent_flags?: any;
  }, clientId?: string) => {
    // Rate limiting for contact forms
    const rateLimitResult = securityService.checkRateLimit(
      clientId || 'anonymous',
      rateLimitConfigs.contact
    );

    if (!rateLimitResult.allowed) {
      securityService.logSecurityEvent('rate_limit_exceeded', {
        operation: 'createLead',
        clientId: clientId || 'anonymous',
        retryAfter: rateLimitResult.retryAfter
      });

      throw new Error(`Contact form submission limit exceeded. Try again in ${rateLimitResult.retryAfter} seconds.`);
    }

    // Validate input data
    const validation = securityService.validateInput(leadData, [
      { field: 'property_id', type: 'string', required: true, minLength: 1 },
      { field: 'contact_method', type: 'string', required: true },
      { field: 'message', type: 'string', required: false, maxLength: 2000, sanitize: true }
    ]);

    if (!validation.valid) {
      securityService.logSecurityEvent('validation_failed', {
        operation: 'createLead',
        errors: validation.errors,
        clientId
      });

      await errorHandler.handleError(
        new Error('Lead data validation failed'),
        { additionalData: { validationErrors: validation.errors } },
        { severity: 'medium', category: 'validation' }
      );
      throw new Error(`Validation failed: ${Object.values(validation.errors).join(', ')}`);
    }

    const { data, error } = await supabase
      .from('leads')
      .insert(validation.sanitizedData)
      .select()
      .single();

    if (error) {
      await errorHandler.handleError(error, {
        additionalData: { operation: 'createLead', leadData: validation.sanitizedData }
      }, {
        severity: 'high',
        category: 'api'
      });
      throw error;
    }

    securityService.logSecurityEvent('lead_created', {
      leadId: data.id,
      propertyId: leadData.property_id,
      clientId
    });

    return data;
  }),

  getLeads: handleAsyncError(async (propertyId: string, clientId?: string) => {
    const { data, error } = await supabase
      .from('leads')
      .select(`
        *,
        visitor:profiles (
          full_name,
          phone_e164
        )
      `)
      .eq('property_id', propertyId)
      .order('created_at', { ascending: false });

    if (error) {
      await errorHandler.handleError(error, {
        additionalData: { operation: 'getLeads', propertyId }
      }, {
        severity: 'medium',
        category: 'api'
      });
      throw error;
    }

    securityService.logSecurityEvent('leads_accessed', {
      propertyId,
      leadCount: data.length,
      clientId
    });

    return data;
  }),
};

// Saved searches API
export const savedSearchesAPI = {
  getSavedSearches: async (profileId: string) => {
    const { data, error } = await supabase
      .from('saved_searches')
      .select('*')
      .eq('profile_id', profileId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  createSavedSearch: async (searchData: {
    profile_id: string;
    query_json: any;
  }) => {
    const { data, error } = await supabase
      .from('saved_searches')
      .insert(searchData)
      .select()
      .single();

    if (error) throw error;
    return data;
  },
};

// Content API
export const contentAPI = {
  getContentPage: async (slug: string) => {
    const { data, error } = await supabase
      .from('content_pages')
      .select('*')
      .eq('slug', slug)
      .single();

    if (error) throw error;
    return data;
  },

  getContentPages: async () => {
    const { data, error } = await supabase
      .from('content_pages')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },
};

// Saved Properties API
export const savedPropertiesAPI = {
  getSavedProperties: async (profileId: string) => {
    const { data, error } = await supabase
      .from('saved_properties')
      .select(`
        *,
        property:properties (
          id,
          title,
          town,
          price_numeric,
          beds,
          baths,
          area_m2,
          media
        )
      `)
      .eq('profile_id', profileId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  saveProperty: async (profileId: string, propertyId: string) => {
    const { data, error } = await supabase
      .from('saved_properties')
      .insert({
        profile_id: profileId,
        property_id: propertyId
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  unsaveProperty: async (profileId: string, propertyId: string) => {
    const { error } = await supabase
      .from('saved_properties')
      .delete()
      .eq('profile_id', profileId)
      .eq('property_id', propertyId);

    if (error) throw error;
    return true;
  }
};

// Search History API
export const searchHistoryAPI = {
  getSearchHistory: async (profileId: string) => {
    const { data, error } = await supabase
      .from('search_history')
      .select('*')
      .eq('profile_id', profileId)
      .order('created_at', { ascending: false })
      .limit(20);

    if (error) throw error;
    return data;
  },

  saveSearch: async (profileId: string, searchData: {
    query?: string;
    filters: any;
    results_count: number;
  }) => {
    const { data, error } = await supabase
      .from('search_history')
      .insert({
        profile_id: profileId,
        ...searchData
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }
};

// Viewing History API
export const viewingHistoryAPI = {
  getViewingHistory: async (profileId: string) => {
    const { data, error } = await supabase
      .from('property_views')
      .select(`
        *,
        property:properties (
          id,
          title,
          town,
          price_numeric,
          media
        )
      `)
      .eq('profile_id', profileId)
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) throw error;
    return data;
  },

  recordView: async (profileId: string, propertyId: string, timeSpent?: number) => {
    const { data, error } = await supabase
      .from('property_views')
      .insert({
        profile_id: profileId,
        property_id: propertyId,
        time_spent_seconds: timeSpent
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }
};

// User Statistics API
export const userStatsAPI = {
  getUserStats: async (profileId: string) => {
    // Get saved properties count
    const { count: savedCount } = await supabase
      .from('saved_properties')
      .select('*', { count: 'exact', head: true })
      .eq('profile_id', profileId);

    // Get search history count
    const { count: searchCount } = await supabase
      .from('search_history')
      .select('*', { count: 'exact', head: true })
      .eq('profile_id', profileId);

    // Get viewing history count
    const { count: viewCount } = await supabase
      .from('property_views')
      .select('*', { count: 'exact', head: true })
      .eq('profile_id', profileId);

    // Get recommendations count (this would be calculated based on user preferences)
    const recommendationsCount = 0; // TODO: Implement recommendation algorithm

    return {
      savedProperties: savedCount || 0,
      recentSearches: searchCount || 0,
      viewedProperties: viewCount || 0,
      recommendations: recommendationsCount
    };
  }
};

// Recommendations API
export const recommendationsAPI = {
  getRecommendations: async (profileId: string) => {
    // This is a simplified recommendation algorithm
    // In a real app, this would use machine learning based on user behavior

    // Get user's search history and saved properties to understand preferences
    const [searchHistory, savedProperties] = await Promise.all([
      searchHistoryAPI.getSearchHistory(profileId),
      savedPropertiesAPI.getSavedProperties(profileId)
    ]);

    // Extract preferred towns and price ranges from search history
    const preferredTowns = new Set<string>();
    const priceRanges: number[] = [];

    searchHistory.forEach(search => {
      if (search.filters?.town) {
        preferredTowns.add(search.filters.town);
      }
      if (search.filters?.min_price) priceRanges.push(search.filters.min_price);
      if (search.filters?.max_price) priceRanges.push(search.filters.max_price);
    });

    // Get properties matching user preferences
    let query = supabase
      .from('properties')
      .select('*')
      .limit(10);

    if (preferredTowns.size > 0) {
      query = query.in('town', Array.from(preferredTowns));
    }

    if (priceRanges.length > 0) {
      const minPrice = Math.min(...priceRanges);
      const maxPrice = Math.max(...priceRanges);
      query = query.gte('price_numeric', minPrice * 0.8).lte('price_numeric', maxPrice * 1.2);
    }

    const { data: properties, error } = await query;

    if (error) throw error;

    // Calculate match scores and format recommendations
    const recommendations = properties?.map(property => ({
      id: property.id,
      title: property.title,
      location: `${property.town}, Guanacaste`,
      price: property.price_numeric,
      beds: property.beds,
      baths: property.baths,
      sqft: property.area_m2,
      image: property.media?.[0] ? `${SUPABASE_URL}/storage/v1/object/public/properties/${property.media[0].storage_path}` : '',
      match: Math.floor(70 + Math.random() * 25), // Simplified match score
      reason: 'Based on your search preferences'
    })) || [];

    return recommendations;
  }
};

// Export market data service for direct access to predictive analytics
export { marketDataService } from './marketData';