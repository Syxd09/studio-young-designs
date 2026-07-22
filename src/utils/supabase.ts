import { createClient } from "@supabase/supabase-js";

const DEFAULT_URL = "https://pacoywekwvdmhvtndqra.supabase.co";
const DEFAULT_KEY = "sb_publishable_SeP0MxYk7Gk_h93a_nAFxg_fXXVQdnZ";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || DEFAULT_URL;
const supabaseAnonKey =
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
  DEFAULT_KEY;

export const isSupabaseConfigured = () => !!(supabaseUrl && supabaseAnonKey);

// Polyfill WebSocket on server-side Node.js environment to prevent Realtime constructor checks from throwing errors
if (typeof window === "undefined") {
  class DummyWebSocket {
    static CONNECTING = 0;
    static OPEN = 1;
    static CLOSING = 2;
    static CLOSED = 3;
    onclose = () => {};
    onerror = () => {};
    onmessage = () => {};
    onopen = () => {};
    close = () => {};
    send = () => {};
  }
  if (!(globalThis as any).WebSocket) {
    (globalThis as any).WebSocket = DummyWebSocket;
  }
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: typeof window !== "undefined",
    detectSessionInUrl: typeof window !== "undefined",
  },
});
