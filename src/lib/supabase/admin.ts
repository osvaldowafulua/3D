import { createClient } from '@supabase/supabase-js'

function requiredEnv(name: string): string {
  const value = process.env[name]
  if (!value) throw new Error(`Missing env var: ${name}`)
  return value
}

// Cliente "admin" com `SUPABASE_SERVICE_ROLE_KEY`.
// Usar apenas em ambiente server (Route Handlers / Server Actions),
// nunca no cliente/browsers.
export function createAdminClient() {
  const supabaseUrl = requiredEnv('NEXT_PUBLIC_SUPABASE_URL')
  const serviceRoleKey = requiredEnv('SUPABASE_SERVICE_ROLE_KEY')

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  })
}

export function getOwnerUid(): string {
  return requiredEnv('SUPABASE_OWNER_UID')
}

