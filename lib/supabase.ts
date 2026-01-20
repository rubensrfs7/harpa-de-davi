import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://mupcespepmbpvdjncjhv.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_t3kW3Zqh2VGZTzdAohtcpw_S2-hn_3m';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);