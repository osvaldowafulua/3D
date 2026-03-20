import { createServerClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()

  const { pathname } = req.nextUrl
  const isLogin = pathname.startsWith('/login')
  const isApiAgente = pathname.startsWith('/api/agente/')

  // O n8n não envia cookies de sessão do operador. A protecao principal para
  // estes endpoints sera via `x-api-key` no proprio handler.
  if (isApiAgente) return res

  let session: any = null
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    if (supabaseUrl && supabaseAnonKey) {
      const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
        cookies: {
          getAll: async () =>
            req.cookies.getAll().map((c) => ({ name: c.name, value: c.value })),
          setAll: async (setCookies) => {
            for (const item of setCookies) {
              if (item.value) res.cookies.set(item.name, item.value)
              else res.cookies.delete(item.name)
            }
          },
        },
      })

      const {
        data: { session: fetchedSession },
      } = await supabase.auth.getSession()
      session = fetchedSession
    }
  } catch {
    // Em ambiente local/CI pode nao haver Supabase real.
    // Tratamos falhas de leitura de sessao como "nao autenticado".
    session = null
  }

  // Redirects principais: nao autenticado -> /login; autenticado -> /dashboard.
  if (!session) {
    if (!isLogin) return NextResponse.redirect(new URL('/login', req.url))
    return res
  }

  if (isLogin || pathname === '/') {
    return NextResponse.redirect(new URL('/dashboard', req.url))
  }

  return res
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}

