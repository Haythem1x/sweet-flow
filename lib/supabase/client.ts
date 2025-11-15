import { createClient as createSupabaseClient } from "@supabase/supabase-js"

let supabaseClient: ReturnType<typeof createSupabaseClient> | null = null

export function createClient() {
  if (!supabaseClient) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://ocjxvpczgrvsomobymcg.supabase.co"
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9janh2cGN6Z3J2c29tb2J5bWNnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI4Mjc3ODYsImV4cCI6MjA3ODQwMzc4Nn0.-pdlASH6iQKdKBkNqnnOjbT9JaJyZJ1YI6PjqYmgpmY"

    supabaseClient = createSupabaseClient(url, key, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        storage: typeof window !== "undefined" ? window.localStorage : undefined,
      },
    })

    if (typeof window !== "undefined") {
      supabaseClient.auth.onAuthStateChange((event, session) => {
        if (session) {
          // Store tokens in cookies for server-side access
          document.cookie = `sb-access-token=${session.access_token}; path=/; max-age=3600; SameSite=Lax`
          document.cookie = `sb-refresh-token=${session.refresh_token}; path=/; max-age=604800; SameSite=Lax`
        } else {
          // Clear cookies on logout
          document.cookie = "sb-access-token=; path=/; max-age=0"
          document.cookie = "sb-refresh-token=; path=/; max-age=0"
        }
      })
    }
  }
  return supabaseClient
}
