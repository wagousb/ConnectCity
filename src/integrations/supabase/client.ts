// Este arquivo é automaticamente gerado. Não o edite diretamente.
import { createClient } from '@supabase/supabase-js';

// As chaves devem ser definidas no .env.local ou no ambiente de deploy (Vercel)
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_PUBLISHABLE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_PUBLISHABLE_KEY) {
  throw new Error("Supabase URL and/or Anon Key are missing. Please check your environment variables (VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY).");
}

// Importe o cliente supabase assim:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);