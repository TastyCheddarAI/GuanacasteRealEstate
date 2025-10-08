import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { z } from 'https://deno.land/x/zod@v3.22.4/mod.ts';
import { PDFDocument, rgb, StandardFonts } from 'https://esm.sh/pdf-lib@1.17.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Zod schemas
const BrochureSchema = z.object({
  property_id: z.string().uuid(),
});

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  const url = new URL(req.url);
  const path = url.pathname.split('/').pop();

  try {
    if (path === 'listing_brochure' && req.method === 'POST') {
      return await handleListingBrochure(req);
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

async function handleListingBrochure(req: Request): Promise<Response> {
  const body = await req.json();
  const { property_id } = BrochureSchema.parse(body);

  // Get property details
  const { data: property, error } = await supabase
    .from('properties')
    .select(`
      title, type, price_numeric, currency, area_m2, lot_m2, beds, baths, description_md,
      address_text, town, lat, lng, media (storage_path, kind, is_primary)
    `)
    .eq('id', property_id)
    .eq('status', 'published')
    .single();

  if (error || !property) {
    return new Response(JSON.stringify({ error: 'Property not found' }), {
      status: 404,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  // Create PDF
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage();
  const { width, height } = page.getSize();
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

  page.drawText(property.title, {
    x: 50,
    y: height - 50,
    size: 24,
    font,
    color: rgb(0, 0, 0),
  });

  page.drawText(`Type: ${property.type}`, {
    x: 50,
    y: height - 80,
    size: 12,
    font,
  });

  page.drawText(`Price: ${property.currency} ${property.price_numeric}`, {
    x: 50,
    y: height - 100,
    size: 12,
    font,
  });

  // Add more details
  let y = height - 120;
  if (property.beds) {
    page.drawText(`Beds: ${property.beds}`, { x: 50, y, size: 12, font });
    y -= 20;
  }
  if (property.baths) {
    page.drawText(`Baths: ${property.baths}`, { x: 50, y, size: 12, font });
    y -= 20;
  }
  if (property.area_m2) {
    page.drawText(`Area: ${property.area_m2} m²`, { x: 50, y, size: 12, font });
    y -= 20;
  }

  // Description
  const descLines = property.description_md.split('\n').slice(0, 10); // Limit
  descLines.forEach(line => {
    page.drawText(line, { x: 50, y, size: 10, font });
    y -= 15;
  });

  // For images, in real implementation, embed images from storage_path
  // But for simplicity, skip

  const pdfBytes = await pdfDoc.save();

  return new Response(pdfBytes, {
    headers: {
      ...corsHeaders,
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${property.title.replace(/[^a-z0-9]/gi, '_')}.pdf"`,
    },
  });
}