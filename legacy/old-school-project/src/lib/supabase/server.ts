import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

const DEFAULT_URL = 'https://zuxrndrpeopqdoxixkea.supabase.co'
const DEFAULT_ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp1eHJuZHJwZW9wcWRveGl4a2VhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODgwOTQ3NDcsImV4cCI6MjEwMzY3MDc0N30.pPg16NWYTGC82HIYXhff8ZRyepWZlg3XgVIUyCfn2BI'

export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || DEFAULT_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || DEFAULT_ANON,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string, options: any) {
          cookieStore.set({ name, value, ...options })
        },
        remove(name: string, options: any) {
          cookieStore.set({ name, value: '', ...options })
        },
      },
    }
  )
}

export async function createClientForServerComponent() {
  const supabase = await createClient()

  // Get user session
  const {
    data: { session },
  } = await supabase.auth.getSession()

  return { supabase, session }
}