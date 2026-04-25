import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database';

const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;
const USING_PLACEHOLDER_URL = SUPABASE_URL?.includes('TU-PROYECTO');
const USING_PLACEHOLDER_KEY = SUPABASE_ANON_KEY === 'tu-anon-key-aqui';

export const isSupabaseConfigured = Boolean(
  SUPABASE_URL &&
    SUPABASE_ANON_KEY &&
    !USING_PLACEHOLDER_URL &&
    !USING_PLACEHOLDER_KEY
);

function createUnavailableClient(): SupabaseClient<Database> {
  const error = new Error(
    'Supabase no esta configurado. Revisa EXPO_PUBLIC_SUPABASE_URL y EXPO_PUBLIC_SUPABASE_ANON_KEY.'
  );

  return new Proxy(
    {},
    {
      get() {
        throw error;
      },
    }
  ) as SupabaseClient<Database>;
}

if (!isSupabaseConfigured) {
  console.warn('Supabase no esta configurado con credenciales reales. Revisa mobile/.env o EAS env.');
}

export const supabase: SupabaseClient<Database> = isSupabaseConfigured
  ? createClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: {
        storage: AsyncStorage,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
      },
    })
  : createUnavailableClient();
