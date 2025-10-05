import { supabase } from '../contexts/AuthContext';

// Base URL for Supabase Edge Functions
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Helper function to call Edge Functions
async function callEdgeFunction(functionName: string, body: any = {}) {
  const response = await fetch(`${SUPABASE_URL}/functions/v1/${functionName}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    throw new Error(`Edge function ${functionName} failed: ${response.statusText}`);
  }

  return response.json();
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
    return callEdgeFunction('search', { ...params });
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
  getProperty: async (id: string) => {
    const { data, error } = await supabase
      .from('properties')
      .select(`
        *,
        media (
          storage_path,
          is_primary,
          kind
        ),
        property_docs (
          doc_type,
          storage_path,
          is_public,
          verified
        ),
        owner:profiles!owner_id (
          id,
          full_name,
          phone_e164,
          verified_at
        )
      `)
      .eq('id', id)
      .eq('status', 'published')
      .single();

    if (error) throw error;
    return data;
  },

  getProperties: async (filters: any = {}) => {
    let query = supabase
      .from('properties')
      .select(`
        *,
        media!inner (
          storage_path,
          is_primary
        ),
        owner:profiles!owner_id (
          full_name,
          verified_at
        )
      `)
      .eq('status', 'published');

    // Apply filters
    if (filters.type) query = query.eq('type', filters.type);
    if (filters.min_price) query = query.gte('price_numeric', filters.min_price);
    if (filters.max_price) query = query.lte('price_numeric', filters.max_price);
    if (filters.beds) query = query.gte('beds', filters.beds);
    if (filters.baths) query = query.gte('baths', filters.baths);
    if (filters.town) query = query.ilike('town', `%${filters.town}%`);

    const { data, error } = await query.limit(20);
    if (error) throw error;
    return data;
  },

  createProperty: async (propertyData: any) => {
    const { data, error } = await supabase
      .from('properties')
      .insert(propertyData)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  updateProperty: async (id: string, updates: any) => {
    const { data, error } = await supabase
      .from('properties')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },
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
  createLead: async (leadData: {
    property_id: string;
    visitor_profile_id?: string;
    contact_method: string;
    message?: string;
    consent_flags?: any;
  }) => {
    const { data, error } = await supabase
      .from('leads')
      .insert(leadData)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  getLeads: async (propertyId: string) => {
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

    if (error) throw error;
    return data;
  },
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