"use client"

import { createBrowserClient } from '@supabase/auth-helpers-nextjs'
import { useRouter } from 'next/navigation'
import { useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { AlertTriangle, Eye, EyeOff } from 'lucide-react'

import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'

const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6).max(100),
})

type LoginInput = z.infer<typeof LoginSchema>

export default function LoginPage() {
  const router = useRouter()
  const supabase = useMemo(() => {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    return createBrowserClient(url ?? '', key ?? '')
  }, [])

  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const form = useForm<LoginInput>({
    resolver: zodResolver(LoginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  })

  async function onSubmit(values: LoginInput) {
    setError(null)
    setLoading(true)

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: values.email,
        password: values.password,
      })

      if (error) {
        setError('Credenciais inválidas.')
        return
      }

      router.push('/dashboard')
    } catch {
      // Mensagem genérica e segura (não expõe detalhes internos do erro).
      setError('Não foi possível fazer login. Tente novamente mais tarde.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="relative min-h-svh w-full overflow-hidden">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-gradient-to-b from-background via-background/50 to-background"
      />

      {/* Camadas decorativas premium (gradiente + baixa opacidade + blur). */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-[-28rem] h-[52rem] w-[52rem] -translate-x-1/2 rounded-full bg-gradient-to-tr from-purple-500/20 via-cyan-500/10 to-transparent blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-28 top-40 h-72 w-72 rounded-full bg-fuchsia-500/10 blur-3xl"
      />

      <div className="relative mx-auto w-full max-w-6xl px-4 py-10">
        <div className="grid grid-cols-1 items-center gap-8 md:grid-cols-2 md:gap-12">
          {/* Hero / Branding (lado esquerdo). */}
          <section className="relative flex justify-center py-4 md:py-0">
            <div className="relative w-full max-w-md">
              <div className="absolute left-1/2 top-1/2 -z-10 h-[28rem] w-[28rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-tr from-primary/10 via-transparent to-secondary/10 blur-2xl" />

              <div className="flex items-center gap-3">
                <img
                  src="/globe.svg"
                  alt=""
                  aria-hidden="true"
                  className="h-10 w-10"
                />
                <div>
                  <p className="text-xs font-medium tracking-widest text-muted-foreground">
                    LOGIN PREMIUM
                  </p>
                  <h1 className="mt-1 text-3xl font-semibold tracking-tight">
                    Acesso seguro
                  </h1>
                </div>
              </div>

              <p className="mt-4 text-sm text-muted-foreground">
                Entre para continuar e acessar o seu dashboard.
              </p>

              <div className="pointer-events-none relative mt-8 grid grid-cols-2 gap-4">
                <div className="flex items-center justify-center rounded-2xl border border-border/60 bg-card/50 p-4 backdrop-blur">
                  <img
                    src="/window.svg"
                    alt=""
                    aria-hidden="true"
                    className="h-10 w-10"
                  />
                </div>
                <div className="flex items-center justify-center rounded-2xl border border-border/60 bg-card/50 p-4 backdrop-blur">
                  <img
                    src="/file.svg"
                    alt=""
                    aria-hidden="true"
                    className="h-10 w-10"
                  />
                </div>
              </div>
            </div>
          </section>

          {/* Card (lado direito). */}
          <section className="flex justify-center md:justify-end">
            <div className="w-full max-w-sm">
              <Card>
                <CardHeader className="pb-6 pt-7">
                  <div className="pointer-events-none mx-auto flex h-10 w-10 items-center justify-center rounded-xl border border-border/60 bg-card/50 backdrop-blur">
                    <img
                      src="/window.svg"
                      alt=""
                      aria-hidden="true"
                      className="h-5 w-5 opacity-90"
                    />
                  </div>
                  <CardTitle
                    role="heading"
                    aria-level={1}
                    className="text-xl tracking-tight sm:text-2xl"
                  >
                    Login
                  </CardTitle>
                  <CardDescription className="max-w-[20ch] leading-relaxed">
                    Autentique-se para acessar o dashboard.
                  </CardDescription>
                  <CardAction>
                    <Button type="button" variant="link" disabled>
                      Sign Up
                    </Button>
                  </CardAction>
                </CardHeader>
                <CardContent>
                  <Form {...form}>
                    <form
                      id="login-form"
                      onSubmit={form.handleSubmit(onSubmit)}
                      className="flex flex-col gap-6"
                    >
                      <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem className="space-y-2">
                            <div className="grid gap-2">
                              <FormLabel>Email</FormLabel>
                              <FormControl>
                                <Input
                                  id="email"
                                  {...field}
                                  type="email"
                                  autoComplete="email"
                                />
                              </FormControl>
                              <FormMessage />
                            </div>
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem className="space-y-2">
                            <div className="grid gap-2">
                              <div className="flex items-center">
                                <FormLabel>Password</FormLabel>
                                <a
                                  href="#"
                                  onClick={(e) => e.preventDefault()}
                                  className="ml-auto inline-block text-sm underline-offset-4 hover:underline"
                                >
                                  Forgot your password?
                                </a>
                              </div>

                              <div className="relative">
                                <FormControl>
                                  <Input
                                    id="password"
                                    {...field}
                                    type={showPassword ? 'text' : 'password'}
                                    autoComplete="current-password"
                                    className="pr-10"
                                  />
                                </FormControl>
                                <button
                                  type="button"
                                  className="absolute right-2 top-1/2 inline-flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-md text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
                                  aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                                  onClick={() => setShowPassword((v) => !v)}
                                >
                                  {showPassword ? (
                                    <EyeOff
                                      className="h-4 w-4"
                                      aria-hidden="true"
                                    />
                                  ) : (
                                    <Eye className="h-4 w-4" aria-hidden="true" />
                                  )}
                                </button>
                              </div>

                              <FormMessage />
                            </div>
                          </FormItem>
                        )}
                      />

                      {error ? (
                        <div
                          role="alert"
                          className="flex items-start gap-2 rounded-md border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive"
                        >
                          <AlertTriangle
                            className="mt-0.5 h-4 w-4 flex-shrink-0"
                            aria-hidden="true"
                          />
                          <span>{error}</span>
                        </div>
                      ) : null}
                    </form>
                  </Form>
                </CardContent>
                <CardFooter className="flex-col gap-2">
                  <Button type="submit" form="login-form" disabled={loading} className="w-full">
                    {loading ? (
                      <span className="flex items-center gap-2">
                        <span
                          aria-hidden="true"
                          className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"
                        />
                        Entrando…
                      </span>
                    ) : (
                      'Entrar'
                    )}
                  </Button>
                  <Button type="button" variant="outline" disabled className="w-full">
                    Login with Google
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </section>
        </div>
      </div>
    </main>
  )
}

