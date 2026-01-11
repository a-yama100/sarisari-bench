import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

console.log('=== SUPABASE CONFIG ===')
console.log('URL:', supabaseUrl)
console.log('Service Key exists:', !!supabaseServiceKey)
console.log('Service Key length:', supabaseServiceKey?.length)
console.log('Service Key starts with:', supabaseServiceKey?.substring(0, 20))

// Client for browser (uses anon key with RLS)
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Client for server/API (uses service role key, bypasses RLS)
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)