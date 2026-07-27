const { createClient } = require('@supabase/supabase-js');

// Configuration
const supabaseUrl = 'https://ibmdiynievtxkucgrkun.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlibWRpeW5pZXZ0eGt1Y2dya3VuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAzMzQ1MzksImV4cCI6MjA3NTkxMDUzOX0.KSt0YuWqlu7R5KD-P5-mMDiVgWSGTuGcoU6Ww8iT5zE';

const supabase = createClient(supabaseUrl, supabaseKey);

async function verifyMigration() {
  console.log('🔍 Verifying Supabase migration...\n');

  const tables = [
    'user_timetables',
    'timetable_templates',
    'timetable_history',
    'timetable_activities',
    'timetable_shares',
    'timetable_analytics'
  ];

  let allTablesExist = true;

  for (const table of tables) {
    try {
      const { data, error } = await supabase.from(table).select('count').limit(1);

      if (error) {
        console.log(`❌ Table '${table}' does not exist or error: ${error.message}`);
        allTablesExist = false;
      } else {
        console.log(`✅ Table '${table}' exists!`);
      }
    } catch (err) {
      console.log(`❌ Error checking table '${table}': ${err.message}`);
      allTablesExist = false;
    }
  }

  if (allTablesExist) {
    console.log('\n🎉 All tables exist! Migration successful!');
    console.log('\nYour timetable backend is now ready to use.');
  } else {
    console.log('\n⚠️ Some tables are missing. Please run the migration first.');
    console.log('See MIGRATION_INSTRUCTIONS.md for details.');
  }
}

// Run verification
verifyMigration();