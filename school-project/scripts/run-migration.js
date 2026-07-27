// Direct Migration Runner
// This script runs the SQL migration directly via fetch

const fs = require('fs');
const path = require('path');

const supabaseUrl = 'https://ibmdiynievtxkucgrkun.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlibWRpeW5pZXZ0eGt1Y2dya3VuIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MDMzNDUzOSwiZXhwIjoyMDc1OTEwNTM5fQ.pBfkSsN_x5-t9y2GlOVKKbG8GjvlHNfKjvvXNPZvyU0';

const sqlFilePath = path.join(__dirname, '../supabase/migrations/002_create_timetable_tables.sql');

async function runMigration() {
  console.log('='.repeat(70));
  console.log('RUNNING TIMETABLE DATABASE MIGRATION');
  console.log('='.repeat(70));
  console.log('');

  try {
    // Read SQL file
    if (!fs.existsSync(sqlFilePath)) {
      console.error('❌ Migration file not found:', sqlFilePath);
      process.exit(1);
    }

    const sql = fs.readFileSync(sqlFilePath, 'utf8');
    console.log('✓ Migration file loaded');
    console.log(`✓ SQL size: ${sql.length} characters`);
    console.log('');

    // Split SQL into individual statements
    const statements = sql
      .split(';')
      .map(s => s.trim())
      .filter(s => s && !s.startsWith('--'));

    console.log(`📝 Found ${statements.length} SQL statements to execute`);
    console.log('');

    // Execute each statement
    let successCount = 0;
    let errorCount = 0;

    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];

      // Skip empty statements or comments
      if (!statement || statement.startsWith('--') || statement.startsWith('/*')) {
        continue;
      }

      console.log(`📄 Executing statement ${i + 1}/${statements.length}...`);

      try {
        const response = await fetch(`${supabaseUrl}/rest/v1/rpc/execute_sql`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${supabaseKey}`,
            'Content-Type': 'application/json',
            'apikey': supabaseKey
          },
          body: JSON.stringify({
            sql: statement + ';'
          })
        });

        if (response.ok) {
          console.log(`   ✅ Success`);
          successCount++;
        } else {
          const error = await response.text();
          console.log(`   ❌ Failed: ${response.status} ${response.statusText}`);

          // Check if it's just an "already exists" error
          if (error.includes('already exists') || error.includes('duplicate')) {
            console.log(`   ⚠️  Object already exists (safe to ignore)`);
            successCount++;
          } else {
            console.log(`   📄 Error: ${error}`);
            errorCount++;
          }
        }
      } catch (err) {
        console.log(`   ❌ Network error: ${err.message}`);
        errorCount++;
      }
    }

    console.log('');
    console.log('='.repeat(70));
    console.log('MIGRATION SUMMARY');
    console.log('='.repeat(70));
    console.log(`✅ Successful statements: ${successCount}`);
    console.log(`❌ Failed statements: ${errorCount}`);
    console.log(`📊 Total statements: ${statements.length}`);
    console.log('');

    if (errorCount === 0) {
      console.log('🎉 Migration completed successfully!');
      console.log('');
      console.log('Your timetable tables are now ready.');
      console.log('The app should now work with cloud storage.');
    } else {
      console.log('⚠️  Migration completed with some errors.');
      console.log('Check the logs above for details.');
      console.log('');
      console.log('Note: "already exists" errors are safe and can be ignored.');
    }

  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

// Alternative approach using direct SQL execution
async function runDirectMigration() {
  console.log('📋 Running direct SQL migration...');

  try {
    const sql = fs.readFileSync(sqlFilePath, 'utf8');

    const response = await fetch(`${supabaseUrl}/rest/v1/`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${supabaseKey}`,
        'Content-Type': 'application/sql',
        'apikey': supabaseKey,
        'Prefer': 'return=minimal'
      },
      body: sql
    });

    if (response.ok) {
      console.log('✅ Migration executed successfully!');
    } else {
      const error = await response.text();
      console.error('❌ Migration failed:', error);
    }
  } catch (error) {
    console.error('❌ Error running migration:', error);
  }
}

// Main execution
if (require.main === module) {
  console.log('Note: This script will attempt to run the migration directly.');
  console.log('If it fails, please run the SQL manually in the Supabase dashboard.');
  console.log('');
  console.log('Manual steps:');
  console.log('1. Go to: https://app.supabase.com/project/ibmdiynievtxkucgrkun');
  console.log('2. Navigate to SQL Editor');
  console.log('3. Copy contents of: supabase/migrations/002_create_timetable_tables.sql');
  console.log('4. Paste and run');
  console.log('');

  runMigration().catch(console.error);
}