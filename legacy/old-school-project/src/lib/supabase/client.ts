import { createBrowserClient } from '@supabase/ssr'

const DEFAULT_URL = 'https://zuxrndrpeopqdoxixkea.supabase.co'
const DEFAULT_ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp1eHJuZHJwZW9wcWRveGl4a2VhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODgwOTQ3NDcsImV4cCI6MjEwMzY3MDc0N30.pPg16NWYTGC82HIYXhff8ZRyepWZlg3XgVIUyCfn2BI'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || DEFAULT_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || DEFAULT_ANON
  )
}