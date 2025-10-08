import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { z } from 'https://deno.land/x/zod@v3.22.4/mod.ts';
import sharp from 'npm:sharp';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Zod schemas
const UploadEventSchema = z.object({
  bucketId: z.string(),
  name: z.string(),
  file: z.object({
    path: z.string(),
    id: z.string(),
    size: z.number(),
    mimeType: z.string(),
    checksum: z.string(),
  }),
});

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  const url = new URL(req.url);
  const path = url.pathname.split('/').pop();

  try {
    if (path === 'on_upload' && req.method === 'POST') {
      return await handleOnUpload(req);
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

async function handleOnUpload(req: Request): Promise<Response> {
  const body = await req.json();
  const event = UploadEventSchema.parse(body);

  if (!event.file.mimeType.startsWith('image/')) {
    return new Response(JSON.stringify({ message: 'Not an image' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  // Download the file
  const { data: fileData, error: downloadError } = await supabase.storage
    .from(event.bucketId)
    .download(event.name);

  if (downloadError) throw downloadError;

  const buffer = await fileData.arrayBuffer();

  // Process with sharp
  const processed = await sharp(buffer)
    .resize(800, 600, { fit: 'inside' })
    .jpeg({ quality: 80 })
    .toBuffer();

  // Upload back with new name
  const newName = event.name.replace(/\.[^/.]+$/, '_processed.jpg');
  const { error: uploadError } = await supabase.storage
    .from(event.bucketId)
    .upload(newName, processed, {
      contentType: 'image/jpeg',
      upsert: true,
    });

  if (uploadError) throw uploadError;

  // Update media table if it's for a property
  // Assume name includes property_id or something
  const propertyId = event.name.split('/')[0]; // Assume path like property_id/filename
  if (propertyId) {
    await supabase
      .from('media')
      .insert({
        property_id: propertyId,
        storage_path: newName,
        kind: 'photo',
      });
  }

  return new Response(JSON.stringify({ success: true, processed_path: newName }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}