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
const VerifyProfileSchema = z.object({
  profile_id: z.string().uuid(),
  method: z.enum(['id', 'ownership_attestation', 'doc_review']),
  status: z.enum(['pending', 'verified', 'rejected']),
  notes: z.string().optional(),
});

const ModeratePropertySchema = z.object({
  property_id: z.string().uuid(),
  action: z.enum(['approve', 'reject', 'suspend']),
  reason: z.string().optional(),
});

const ModerateReportSchema = z.object({
  report_id: z.string().uuid(),
  action: z.enum(['dismiss', 'ban_user', 'remove_content']),
});

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  const url = new URL(req.url);
  const path = url.pathname.split('/').pop();

  try {
    if (path === 'verify_profile' && req.method === 'POST') {
      return await handleVerifyProfile(req);
    } else if (path === 'moderate_property' && req.method === 'POST') {
      return await handleModerateProperty(req);
    } else if (path === 'moderate_report' && req.method === 'POST') {
      return await handleModerateReport(req);
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

async function handleVerifyProfile(req: Request): Promise<Response> {
  const body = await req.json();
  const { profile_id, method, status, notes } = VerifyProfileSchema.parse(body);

  const { error } = await supabase
    .from('verifications')
    .upsert({
      profile_id,
      method,
      status,
      notes,
      updated_at: new Date().toISOString(),
    });

  if (error) throw error;

  // If verified, update profile.verified_at
  if (status === 'verified') {
    await supabase
      .from('profiles')
      .update({ verified_at: new Date().toISOString() })
      .eq('id', profile_id);
  }

  return new Response(JSON.stringify({ success: true }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

async function handleModerateProperty(req: Request): Promise<Response> {
  const body = await req.json();
  const { property_id, action, reason } = ModeratePropertySchema.parse(body);

  let newStatus: string;
  if (action === 'approve') newStatus = 'published';
  else if (action === 'reject') newStatus = 'draft';
  else if (action === 'suspend') newStatus = 'suspended';
  else throw new Error('Invalid action');

  const { error } = await supabase
    .from('properties')
    .update({ status: newStatus })
    .eq('id', property_id);

  if (error) throw error;

  // Log audit
  await supabase
    .from('audit_logs')
    .insert({
      action: `moderate_property_${action}`,
      entity: 'properties',
      entity_id: property_id,
      diff: { reason },
    });

  return new Response(JSON.stringify({ success: true }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

async function handleModerateReport(req: Request): Promise<Response> {
  const body = await req.json();
  const { report_id, action } = ModerateReportSchema.parse(body);

  const { data: report, error: fetchError } = await supabase
    .from('abuse_reports')
    .select('*')
    .eq('id', report_id)
    .single();

  if (fetchError) throw fetchError;

  if (action === 'dismiss') {
    // Do nothing
  } else if (action === 'ban_user') {
    // Ban the reported entity if profile
    if (report.reported_entity === 'profile') {
      await supabase
        .from('profiles')
        .update({ role: 'banned' }) // Assume role enum has banned
        .eq('id', report.entity_id);
    }
  } else if (action === 'remove_content') {
    if (report.reported_entity === 'property') {
      await supabase
        .from('properties')
        .update({ status: 'archived' })
        .eq('id', report.entity_id);
    }
  }

  return new Response(JSON.stringify({ success: true }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}