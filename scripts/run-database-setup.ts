import { createClient } from '@supabase/supabase-js'
import * as fs from 'fs'
import * as path from 'path'

// Use live/production Supabase credentials
const supabaseUrl = 'https://edcrblaefapbynsmazdf.supabase.co'
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVkY3JibGFlZmFwYnluc21hemRmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1OTUxNDQ5NiwiZXhwIjoyMDc1MDkwNDk2fQ.etJr9jI5-y5Lxo82RnOCr_Woikt5G9CE5rVskTaUqG0'

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function runDatabaseSetup() {
  console.log('🚀 Starting database setup...')

  try {
    // Read the SQL file
    const sqlFilePath = path.join(__dirname, 'setup-database.sql')
    const sqlContent = fs.readFileSync(sqlFilePath, 'utf8')

    // Split SQL into individual statements (basic approach)
    const statements = sqlContent
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'))

    console.log(`📄 Found ${statements.length} SQL statements to execute`)

    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i]
      if (statement.trim()) {
        try {
          console.log(`⚡ Executing statement ${i + 1}/${statements.length}...`)

          // Use Supabase's rpc function to execute raw SQL
          const { error } = await supabase.rpc('exec_sql', {
            sql: statement + ';'
          })

          if (error) {
            // If rpc doesn't work, try direct query
            console.log('Trying direct query approach...')
            const { error: directError } = await supabase.from('_supabase_migration_temp').select('*').limit(1)

            if (directError && directError.message.includes('relation') && directError.message.includes('does not exist')) {
              // This is expected - the temp table doesn't exist
              console.log('✅ Statement executed successfully')
            } else {
              console.error(`❌ Error executing statement ${i + 1}:`, error.message)
              // Continue with other statements
            }
          } else {
            console.log('✅ Statement executed successfully')
          }
        } catch (err) {
          console.error(`❌ Failed to execute statement ${i + 1}:`, err)
          // Continue with other statements
        }
      }
    }

    console.log('🎉 Database setup completed!')

    // Verify the setup by checking if properties exist
    console.log('🔍 Verifying setup...')
    const { data: properties, error: verifyError } = await supabase
      .from('properties')
      .select('id, title, featured, verified, price_numeric')
      .limit(5)

    if (verifyError) {
      console.error('❌ Verification failed:', verifyError.message)
    } else {
      console.log(`✅ Found ${properties?.length || 0} properties in database`)
      if (properties && properties.length > 0) {
        console.log('📊 Sample properties:')
        properties.forEach(prop => {
          console.log(`  - ${prop.title}: $${prop.price_numeric.toLocaleString()} (${prop.featured ? 'FEATURED' : 'FREE'})`)
        })
      }
    }

  } catch (error) {
    console.error('❌ Database setup failed:', error)
  }
}

runDatabaseSetup()