import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

// Used for client-side operations (standard Supabase JS client)
export const supabase = createClient(supabaseUrl, supabaseAnonKey)
