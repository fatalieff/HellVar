import { createClient, SupportedStorage } from '@supabase/supabase-js';
import { Database } from '../types/database';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder-project-id.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-anon-public-key';

if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  console.warn(
    'Supabase URL və ya Anon Key mühit dəyişənləri tapılmadı. Zəhmət olmasa real əlaqə üçün .env.local faylını quraşdırın.'
  );
}

// Client-side cookie storage implementation to share auth session with
// Next.js Middleware and Server Components.
const customCookieStorage: SupportedStorage = {
  getItem: (key) => {
    if (typeof document === 'undefined') return null;
    const value = document.cookie
      .split('; ')
      .find((row) => row.startsWith(`${key}=`))
      ?.split('=')[1];
    return value ? decodeURIComponent(value) : null;
  },
  setItem: (key, value) => {
    if (typeof document === 'undefined') return;
    const expires = new Date();
    expires.setDate(expires.getDate() + 7); // Session stays for 7 days
    document.cookie = `${key}=${encodeURIComponent(value)}; path=/; expires=${expires.toUTCString()}; SameSite=Lax; Secure`;
  },
  removeItem: (key) => {
    if (typeof document === 'undefined') return;
    document.cookie = `${key}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax; Secure`;
  }
};

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: typeof window !== 'undefined' ? customCookieStorage : undefined,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
});
