import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

// Load environment variables
config({ path: '../.env' }); // Adjust path as needed

const supabaseUrl = process.env.VITE_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Missing Supabase environment variables');
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function seedDemoData() {
  console.log('Seeding demo data...');

  // Seed demo profiles
  const { data: profiles, error: profilesError } = await supabase
    .from('profiles')
    .insert([
      {
        id: 'demo-admin-id', // Use a fixed UUID for demo
        role: 'admin',
        full_name: 'Demo Admin',
        locale: 'en',
      },
      {
        id: 'demo-owner-id',
        role: 'owner',
        full_name: 'Demo Owner',
        locale: 'en',
      },
    ])
    .select();

  if (profilesError) {
    console.error('Error seeding profiles:', profilesError);
    return;
  }

  console.log('Seeded profiles:', profiles);

  // Seed demo subscriptions
  const { data: subscriptions, error: subscriptionsError } = await supabase
    .from('subscriptions')
    .insert([
      {
        profile_id: 'demo-admin-id',
        tier: 'free',
        provider: 'stripe',
        status: 'active',
        current_period_end: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(), // 1 year from now
      },
      {
        profile_id: 'demo-owner-id',
        tier: 'owner_featured',
        provider: 'stripe',
        status: 'active',
        current_period_end: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(), // 1 year from now
      },
    ])
    .select();

  if (subscriptionsError) {
    console.error('Error seeding subscriptions:', subscriptionsError);
    return;
  }

  console.log('Seeded subscriptions:', subscriptions);

  // Seed demo properties
  const { data: properties, error: propertiesError } = await supabase
    .from('properties')
    .insert([
      {
        owner_id: 'demo-admin-id',
        status: 'published',
        title: 'Demo Beachfront House',
        type: 'house',
        price_numeric: 500000.00,
        currency: 'USD',
        town: 'Tamarindo',
        lat: 10.3000,
        lng: -85.8000,
        description_md: 'Beautiful demo beachfront house in Guanacaste.',
        is_demo: true,
        published_at: new Date().toISOString(),
      },
      {
        owner_id: 'demo-owner-id',
        status: 'published',
        title: 'Demo Mountain Villa',
        type: 'house',
        price_numeric: 350000.00,
        currency: 'USD',
        town: 'Liberia',
        lat: 10.6000,
        lng: -85.4000,
        description_md: 'Stunning demo villa in the mountains.',
        is_demo: true,
        published_at: new Date().toISOString(),
      },
    ])
    .select();

  if (propertiesError) {
    console.error('Error seeding properties:', propertiesError);
    return;
  }

  console.log('Seeded properties:', properties);

  // Seed demo overlays
  const { data: overlays, error: overlaysError } = await supabase
    .from('overlays')
    .insert([
      {
        name: 'Playa Tamarindo',
        overlay_type: 'beach',
        lat: 10.3000,
        lng: -85.8000,
        is_demo: true,
      },
      {
        name: 'Hospital Liberia',
        overlay_type: 'clinic',
        lat: 10.6000,
        lng: -85.4000,
        is_demo: true,
      },
    ])
    .select();

  if (overlaysError) {
    console.error('Error seeding overlays:', overlaysError);
    return;
  }

  console.log('Seeded overlays:', overlays);

  console.log('Demo data seeded successfully!');
}

seedDemoData().catch(console.error);