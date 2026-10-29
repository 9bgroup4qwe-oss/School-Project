# Supabase Migration Instructions

## 🚨 IMPORTANT: Run this migration in your Supabase Dashboard

The migration SQL needs to be executed manually in your Supabase dashboard SQL Editor.

### Steps:

1. **Open your Supabase Dashboard**: https://app.supabase.com
2. **Select your project**: `ibmdiynievtxkucgrkun`
3. **Go to SQL Editor** (in the left sidebar)
4. **Click "New query"**
5. **Copy the entire content** from the file below:
   - `supabase/migrations/002_create_timetable_tables.sql`
6. **Paste it into the SQL Editor**
7. **Click "Run"** to execute the migration

### What the migration creates:

- `user_timetables` - Main table for storing user timetables
- `timetable_templates` - Pre-made timetable templates
- `timetable_history` - Audit log for all changes
- `timetable_activities` - Reference table for activity types
- `timetable_shares` - Sharing permissions
- `timetable_analytics` - Usage analytics

### After running the migration:

Your timetable backend will be fully functional! The application will be able to:
- Create and save timetables
- Track all changes with history
- Share timetables with other users
- Generate analytics and insights

### Note:

The PostgreSQL syntax error has been fixed. The FILTER clause has been removed and replaced with compatible syntax.

---
Once you've run the migration, the timetable feature will work perfectly! 🎉