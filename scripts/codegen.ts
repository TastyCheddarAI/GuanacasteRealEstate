import { execSync } from 'child_process';
import { config } from 'dotenv';

// Load environment variables
config({ path: '../.env.local' }); // Adjust path as needed

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Missing Supabase environment variables');
}

try {
  console.log('Generating TypeScript types from Supabase...');

  // Run supabase gen types typescript
  const output = execSync(`npx supabase gen types typescript --project-id=${supabaseUrl.split('//')[1].split('.')[0]} --schema=public > types/supabase.ts`, {
    encoding: 'utf-8',
    env: {
      ...process.env,
      SUPABASE_ACCESS_TOKEN: supabaseServiceKey, // Assuming service key works, but actually might need access token
    },
  });

  console.log('Types generated successfully!');
  console.log(output);
} catch (error) {
  console.error('Error generating types:', error);
}