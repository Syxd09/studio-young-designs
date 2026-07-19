import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey =
  import.meta.env.VITE_SUPABASE_ANON_KEY || import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

export const isSupabaseConfigured = () => !!(supabaseUrl && supabaseAnonKey);

if (!isSupabaseConfigured() && typeof window !== "undefined") {
  console.warn(
    "Supabase environment variables (VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY) are missing. " +
      "CMS functions will fall back to mockup or static data. Please configure them in a .env or .env.local file.",
  );
}

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

export const supabase = isSupabaseConfigured()
  ? createClient(supabaseUrl!, supabaseAnonKey!, {
      auth: {
        persistSession: typeof window !== "undefined",
        detectSessionInUrl: typeof window !== "undefined",
      },
    })
  : (null as unknown as ReturnType<typeof createClient>);
