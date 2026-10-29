const { createClient } = require('@supabase/supabase-js');

// Configuration
const supabaseUrl = 'https://ibmdiynievtxkucgrkun.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlibWRpeW5pZXZ0eGt1Y2dya3VuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAzMzQ1MzksImV4cCI6MjA3NTkxMDUzOX0.KSt0YuWqlu7R5KD-P5-mMDiVgWSGTuGcoU6Ww8iT5zE';

// Create Supabase client
const supabase = createClient(supabaseUrl, supabaseKey);

// Read the migration file
const fs = require('fs');
const path = require('path');

const migrationPath = path.join(__dirname, '../supabase/migrations/002_create_timetable_tables.sql');
const migrationSQL = fs.readFileSync(migrationPath, 'utf8');

// Split SQL into individual statements
const statements = migrationSQL
  .split(/;\s*\n/)
  .map(s => s.trim())
  .filter(s => s && !s.startsWith('--') && !s.startsWith('/*'));

async function executeMigration() {
  console.log('Starting migration execution...');
  console.log(`Found ${statements.length} SQL statements to execute`);

  for (let i = 0; i < statements.length; i++) {
    const statement = statements[i];

    if (!statement || statement.trim().length === 0) continue;

    console.log(`\nExecuting statement ${i + 1}/${statements.length}...`);
    console.log(`First 50 chars: ${statement.substring(0, 50)}...`);

    try {
      const { data, error } = await supabase.rpc('exec_sql', { sql_query: statement });

      if (error) {
        // Try direct SQL execution via REST if RPC fails
        console.log('RPC failed, trying direct execution...');
        const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${supabaseKey}`,
            'Content-Type': 'application/json',
            'apikey': supabaseKey
          },
          body: JSON.stringify({ sql_query: statement })
        });

        if (!response.ok) {
          const errorData = await response.json();
          console.error(`Statement ${i + 1} failed:`, errorData);
          // Continue with other statements
        } else {
          console.log(`✓ Statement ${i + 1} executed successfully`);
        }
      } else {
        console.log(`✓ Statement ${i + 1} executed successfully`);
      }
    } catch (err) {
      console.error(`Error executing statement ${i + 1}:`, err.message);
      // Continue with other statements
    }
  }

  console.log('\nMigration execution completed!');
}

// Alternative: Create a simple function to test table creation
async function testConnection() {
  try {
    console.log('Testing Supabase connection...');

    // Test basic connection
    const { data, error } = await supabase.from('user_timetables').select('count');

    if (error) {
      console.log('Table does not exist yet (expected):', error.message);

      // Try to create a simple test table
      console.log('\nAttempting to create test table...');
      const createTestSQL = `
        CREATE TABLE IF NOT EXISTS test_table (
          id SERIAL PRIMARY KEY,
          created_at TIMESTAMP DEFAULT NOW()
        );
      `;

      // For this to work, we need to use the service role key or run via dashboard
      console.log('Please run the migration manually in the Supabase dashboard SQL Editor.');
      console.log(`Migration file location: ${migrationPath}`);
    } else {
      console.log('Connection successful! Tables already exist.');
    }
  } catch (err) {
    console.error('Connection test failed:', err);
  }
}

// Run the test
testConnection();