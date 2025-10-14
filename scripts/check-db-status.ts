import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '../supabase/.env' });

const supabaseUrl = 'https://edcrblaefapbynsmazdf.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVkY3JibGFlZmFwYnluc21hemRmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1OTUxNDQ5NiwiZXhwIjoyMDc1MDkwNDk2fQ.etJr9jI5-y5Lxo82RnOCr_Woikt5G9CE5rVskTaUqG0';

console.log('SUPABASE_SERVICE_ROLE_KEY loaded:', !!supabaseKey);

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkDatabaseStatus() {
  console.log('🔍 Checking Supabase database status...\n');

  try {
    // Check if properties table exists
    console.log('1. Checking properties table...');
    const { data: properties, error: propertiesError } = await supabase
      .from('properties')
      .select('id, title, status, quality_score, owner_id')
      .limit(10);

    if (propertiesError) {
      console.log('❌ Properties table error:', propertiesError.message);
    } else {
      console.log(`✅ Properties table exists. Found ${properties?.length || 0} properties:`);
      if (properties && properties.length > 0) {
        properties.forEach((prop, i) => {
          console.log(`   ${i + 1}. ${prop.title} (${prop.status}, score: ${prop.quality_score})`);
        });
      }
    }

    // Check profiles table
    console.log('\n2. Checking profiles table...');
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, role, full_name')
      .limit(5);

    if (profilesError) {
      console.log('❌ Profiles table error:', profilesError.message);
    } else {
      console.log(`✅ Profiles table exists. Found ${profiles?.length || 0} profiles:`);
      if (profiles && profiles.length > 0) {
        profiles.forEach((profile, i) => {
          console.log(`   ${i + 1}. ${profile.full_name || 'No name'} (${profile.role})`);
        });
      }
    }

    // Check auth users
    console.log('\n3. Checking auth.users...');
    const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();

    if (authError) {
      console.log('❌ Auth users error:', authError.message);
    } else {
      console.log(`✅ Found ${authUsers?.users?.length || 0} auth users:`);
      if (authUsers?.users && authUsers.users.length > 0) {
        authUsers.users.forEach((user, i) => {
          console.log(`   ${i + 1}. ${user.email} (${user.id})`);
        });
      }
    }

    // Check published properties specifically
    console.log('\n4. Checking published properties...');
    const { data: publishedProps, error: pubError } = await supabase
      .from('properties')
      .select('id, title, town, price_numeric, quality_score')
      .eq('status', 'published')
      .order('quality_score', { ascending: false });

    if (pubError) {
      console.log('❌ Published properties error:', pubError.message);
    } else {
      console.log(`✅ Found ${publishedProps?.length || 0} published properties:`);
      if (publishedProps && publishedProps.length > 0) {
        publishedProps.forEach((prop, i) => {
          const type = prop.quality_score > 0 ? 'FEATURED' : 'FREE';
          console.log(`   ${i + 1}. ${prop.title} - ${prop.town} ($${prop.price_numeric}) [${type}]`);
        });
      } else {
        console.log('   No published properties found - this explains why the app appears empty!');
      }
    }

  } catch (error) {
    console.error('❌ Database connection error:', error);
  }
}

checkDatabaseStatus();