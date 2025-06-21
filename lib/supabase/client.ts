import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables: NEXT_PUBLIC_SUPABASE_URL and/or NEXT_PUBLIC_SUPABASE_ANON_KEY');
}

let _supabase: ReturnType<typeof createClient> | undefined = undefined;

export const supabase = (() => {
  if (typeof window !== 'undefined') {
    if (!(window as any)._supabase) {
      (window as any)._supabase = createClient(supabaseUrl, supabaseAnonKey);
    }
    return (window as any)._supabase;
  } else {
    if (!_supabase) {
      _supabase = createClient(supabaseUrl, supabaseAnonKey);
    }
    return _supabase;
  }
})();
