import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
        storageKey: 'supabase.auth.token',
        storage: {
            getItem: (key) => {
                const value = localStorage.getItem(key);
                return value ? JSON.parse(value) : null;
            },
            setItem: (key, value) => {
                localStorage.setItem(key, JSON.stringify(value));
            },
            removeItem: (key) => {
                localStorage.removeItem(key);
            }
        }
    },
    global: {
        headers: {
            'X-Client-Info': 'supabase-js-web/2.39.0'
        }
    },
    db: {
        schema: 'public'
    }
}); 