import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { z } from 'https://deno.land/x/zod@v3.22.4/mod.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Zod schemas
const SearchPropertiesSchema = z.object({
  query: z.string().optional(),
  lat: z.number().optional(),
  lng: z.number().optional(),
  radius_km: z.number().default(50),
  type: z.string().optional(),
  min_price: z.number().optional(),
  max_price: z.number().optional(),
  beds: z.number().optional(),
  baths: z.number().optional(),
  limit: z.number().default(20),
  offset: z.number().default(0),
});

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  const url = new URL(req.url);
  const path = url.pathname.split('/').pop();

  try {
    if (path === 'properties' && req.method === 'POST') {
      return await handleSearchProperties(req);
    } else {
      return new Response(JSON.stringify({ error: 'Not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function handleSearchProperties(req: Request): Promise<Response> {
  const body = await req.json();
  const params = SearchPropertiesSchema.parse(body);

  let query = supabase
    .from('properties')
    .select(`
      id, title, type, price_numeric, currency, town, lat, lng, beds, baths, area_m2,
      media!inner(storage_path, is_primary)
    `)
    .eq('status', 'published')
    .limit(params.limit)
    .range(params.offset, params.offset + params.limit - 1);

  // FTS
  if (params.query) {
    query = query.textSearch('search_vector', params.query);
  }

  // Geo
  if (params.lat && params.lng) {
    query = query.rpc('properties_within_distance', {
      lat: params.lat,
      lng: params.lng,
      radius_km: params.radius_km,
    });
  }

  // Filters
  if (params.type) {
    query = query.eq('type', params.type);
  }
  if (params.min_price) {
    query = query.gte('price_numeric', params.min_price);
  }
  if (params.max_price) {
    query = query.lte('price_numeric', params.max_price);
  }
  if (params.beds) {
    query = query.gte('beds', params.beds);
  }
  if (params.baths) {
    query = query.gte('baths', params.baths);
  }

  const { data: properties, error } = await query;

  if (error) throw error;

  return new Response(JSON.stringify({ properties }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}