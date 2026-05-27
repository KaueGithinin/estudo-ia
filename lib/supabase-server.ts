import { createClient, SupabaseClient } from '@supabase/supabase-js'

// Cliente admin com service role key — bypassa RLS
// Usar APENAS em API routes server-side. Nunca expor ao browser.
// Requer: SUPABASE_SERVICE_ROLE_KEY no .env.local
// Supabase → Project Settings → API → service_role key

let _client: SupabaseClient | null = null

export function getSupabaseAdmin(): SupabaseClient {
  if (!_client) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!url || !key) {
      throw new Error(
        'SUPABASE_SERVICE_ROLE_KEY não configurado. ' +
        'Vá em Supabase → Project Settings → API → service_role key e adicione ao .env.local'
      )
    }

    _client = createClient(url, key)
  }
  return _client
}

// Proxy para manter a API compatível com o uso direto
export const supabaseAdmin = new Proxy({} as SupabaseClient, {
  get(_target, prop) {
    return getSupabaseAdmin()[prop as keyof SupabaseClient]
  },
})
