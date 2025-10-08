import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { z } from 'https://deno.land/x/zod@v3.22.4/mod.ts';
import { SmtpClient } from 'https://deno.land/x/smtp@v0.7.0/mod.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const smtpHost = Deno.env.get('SMTP_HOST')!;
const smtpPort = parseInt(Deno.env.get('SMTP_PORT') || '587');
const smtpUsername = Deno.env.get('SMTP_USERNAME')!;
const smtpPassword = Deno.env.get('SMTP_PASSWORD')!;
const fromEmail = Deno.env.get('FROM_EMAIL')!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);
const smtpClient = new SmtpClient();

// Zod schemas
const RelaySchema = z.object({
  from_profile_id: z.string().uuid(),
  to_profile_id: z.string().uuid(),
  property_id: z.string().uuid().optional(),
  body: z.string(),
});

const NotifySchema = z.object({
  profile_id: z.string().uuid(),
});

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  const url = new URL(req.url);
  const path = url.pathname.split('/').pop();

  try {
    if (path === 'relay' && req.method === 'POST') {
      return await handleRelay(req);
    } else if (path === 'notify' && req.method === 'POST') {
      return await handleNotify(req);
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

async function handleRelay(req: Request): Promise<Response> {
  const body = await req.json();
  const { from_profile_id, to_profile_id, property_id, body: messageBody } = RelaySchema.parse(body);

  // Get sender and recipient emails
  const { data: fromProfile } = await supabase
    .from('profiles')
    .select('full_name')
    .eq('id', from_profile_id)
    .single();

  const { data: toProfile } = await supabase
    .from('profiles')
    .select('full_name, phone_e164')
    .eq('id', to_profile_id)
    .single();

  if (!toProfile?.phone_e164) {
    return new Response(JSON.stringify({ error: 'Recipient contact not found' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  // Anonymize sender
  const senderName = 'Anonymous User'; // or 'Interested Buyer'

  // Get property title if provided
  let propertyTitle = '';
  if (property_id) {
    const { data: property } = await supabase
      .from('properties')
      .select('title')
      .eq('id', property_id)
      .single();
    propertyTitle = property?.title || '';
  }

  const subject = `Message from ${senderName}${propertyTitle ? ` about ${propertyTitle}` : ''}`;
  const emailBody = `
Hello ${toProfile.full_name},

You have received a new message:

${messageBody}

Please respond via the app.

Best regards,
Guanacaste Real Team
  `;

  // Send email
  await smtpClient.connect({
    hostname: smtpHost,
    port: smtpPort,
    username: smtpUsername,
    password: smtpPassword,
  });

  await smtpClient.send({
    from: fromEmail,
    to: toProfile.phone_e164 + '@example.com', // Assuming email from phone, but in reality, profiles have email?
    subject,
    content: emailBody,
  });

  await smtpClient.close();

  // Store in messages table
  const threadId = crypto.randomUUID(); // New thread
  await supabase
    .from('messages')
    .insert({
      thread_id: threadId,
      property_id,
      from_profile_id,
      to_profile_id,
      body: messageBody,
    });

  return new Response(JSON.stringify({ success: true }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

async function handleNotify(req: Request): Promise<Response> {
  const body = await req.json();
  const { profile_id } = NotifySchema.parse(body);

  // Get unread messages or recent activity
  const { data: messages } = await supabase
    .from('messages')
    .select('body, created_at')
    .eq('to_profile_id', profile_id)
    .eq('read_at', null)
    .order('created_at', { ascending: false })
    .limit(10);

  if (!messages || messages.length === 0) {
    return new Response(JSON.stringify({ message: 'No new notifications' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, phone_e164')
    .eq('id', profile_id)
    .single();

  const subject = 'Your Guanacaste Real Digest';
  const emailBody = `
Hello ${profile?.full_name},

Here are your recent messages:

${messages.map(m => `- ${m.created_at}: ${m.body}`).join('\n')}

Best regards,
Guanacaste Real Team
  `;

  // Send email
  await smtpClient.connect({
    hostname: smtpHost,
    port: smtpPort,
    username: smtpUsername,
    password: smtpPassword,
  });

  await smtpClient.send({
    from: fromEmail,
    to: profile?.phone_e164 + '@example.com',
    subject,
    content: emailBody,
  });

  await smtpClient.close();

  return new Response(JSON.stringify({ success: true }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}