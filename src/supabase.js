import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://xcqnsqprbtphcxxcoklf.supabase.co'
const supabaseKey = 'sb_publishable_fkGCY0n0kgEQaBMABVVfTQ_LKpmrqc4'

export const supabase = createClient(supabaseUrl, supabaseKey)