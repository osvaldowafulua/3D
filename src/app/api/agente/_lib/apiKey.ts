function requiredEnv(name: string): string {
  const value = process.env[name]
  if (!value) throw new Error(`Missing env var: ${name}`)
  return value
}

export function requireAgenteApiKey(req: Request) {
  const provided = req.headers.get('x-api-key')
  const expected = requiredEnv('AGENTE_API_KEY')
  if (!provided || provided !== expected) return false
  return true
}

