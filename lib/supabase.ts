import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  // Em desenvolvimento isto avisa cedo se o .env.local não estiver
  // preenchido — nunca falha silenciosamente como no site em HTML puro.
  console.warn(
    "Supabase não está configurado: define NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY em .env.local"
  );
}

// Cliente único, partilhado por toda a app (Client Components).
// A anon key é segura para expor no browser — a proteção real vem das
// políticas de RLS já configuradas no projeto Supabase do teu parceiro.
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
