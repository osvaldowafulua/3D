import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
} from '@/components/ui/sidebar'

type AgentStats = {
  totalEncomendas: number
  produtoMaisVendido: { nome: string; quantidade: number } | null
  tempoMedioProducaoDias: number | null
  filamentoMaisUsado: { nome: string; quantidade: number } | null
}

// Garante que a pagina nao seja pre-renderizada estaticamente.
// Assim os `fetch(..., cache: 'no-store')` aos endpoints do agente sao executados
// em cada request (evita "dashboard estatico").
export const dynamic = 'force-dynamic'
export const revalidate = 0

type RecentEncomendasResponse = {
  encomendas: Array<{
    encomendaId: string
    tempoProducaoDias: number | null
    tipoEntrega: string
    entregueEm: string | null
    itens: Array<{
      produto: string | null
      quantidade: number
      tipoFilamento: string | null
    }>
  }>
}

function getBaseUrl() {
  if (process.env.NEXT_PUBLIC_APP_URL) return process.env.NEXT_PUBLIC_APP_URL
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`
  return 'http://localhost:3000'
}

async function fetchAgentStats(): Promise<AgentStats | null> {
  try {
    const baseUrl = getBaseUrl()
    const res = await fetch(`${baseUrl}/api/agente/stats`, {
      method: 'GET',
      headers: { 'x-api-key': process.env.AGENTE_API_KEY ?? '' },
      cache: 'no-store',
    })
    if (!res.ok) return null
    return (await res.json()) as AgentStats
  } catch {
    return null
  }
}

async function fetchRecentEncomendas(): Promise<RecentEncomendasResponse | null> {
  try {
    const baseUrl = getBaseUrl()
    const res = await fetch(`${baseUrl}/api/agente/encomendas-recentes?limit=5`, {
      method: 'GET',
      headers: { 'x-api-key': process.env.AGENTE_API_KEY ?? '' },
      cache: 'no-store',
    })
    if (!res.ok) return null
    return (await res.json()) as RecentEncomendasResponse
  } catch {
    return null
  }
}

export default async function DashboardPage() {
  const [stats, recent] = await Promise.all([fetchAgentStats(), fetchRecentEncomendas()])

  const rows =
    recent?.encomendas?.flatMap((e) =>
      e.itens.map((i) => ({
        produto: i.produto,
        tipo: i.tipoFilamento,
        quantidade: i.quantidade,
      })),
    ) ?? []

  const topRows = rows.slice(0, 8)

  return (
    <SidebarProvider>
      <Sidebar side="left" collapsible="none">
        <SidebarHeader>
          <div className="text-sm font-semibold">3D Studio</div>
          <div className="text-xs text-muted-foreground">Operador</div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton isActive>Dashboard</SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton>Encomendas</SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton>Produtos</SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroup>
        </SidebarContent>
      </Sidebar>

      <SidebarInset>
        <div className="mx-auto w-full max-w-6xl p-4 md:p-6">
          <div className="mb-6">
            <h1 className="text-3xl font-semibold">Dashboard</h1>
            <p className="text-muted-foreground mt-1">
              Métricas atuais e últimas encomendas (via endpoints do agente).
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle>Encomendas</CardTitle>
              </CardHeader>
              <CardContent className="text-2xl font-semibold">
                {stats ? stats.totalEncomendas : <Skeleton className="h-8 w-32" />}
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Tempo médio</CardTitle>
              </CardHeader>
              <CardContent className="text-2xl font-semibold">
                {stats ? (
                  stats.tempoMedioProducaoDias != null ? (
                    <span>
                      {stats.tempoMedioProducaoDias.toFixed(1)} <span className="text-base font-normal">dias</span>
                    </span>
                  ) : (
                    <span className="text-base font-normal text-muted-foreground">Sem dados</span>
                  )
                ) : (
                  <Skeleton className="h-8 w-28" />
                )}
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Filamento mais usado</CardTitle>
              </CardHeader>
              <CardContent>
                {stats ? (
                  stats.filamentoMaisUsado ? (
                    <div className="text-2xl font-semibold">
                      {stats.filamentoMaisUsado.nome}
                      <div className="text-sm font-normal text-muted-foreground mt-1">
                        {stats.filamentoMaisUsado.quantidade} itens
                      </div>
                    </div>
                  ) : (
                    <span className="text-base font-normal text-muted-foreground">Sem dados</span>
                  )
                ) : (
                  <Skeleton className="h-8 w-40" />
                )}
              </CardContent>
            </Card>
          </div>

          <div className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Últimas encomendas</CardTitle>
              </CardHeader>
              <CardContent>
                {recent ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Produto</TableHead>
                        <TableHead>Filamento</TableHead>
                        <TableHead className="text-right">Quantidade</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {topRows.length > 0 ? (
                        topRows.map((r, idx) => (
                          <TableRow key={`${r.produto}-${idx}`}>
                            <TableCell>{r.produto ?? '—'}</TableCell>
                            <TableCell>{r.tipo ?? '—'}</TableCell>
                            <TableCell className="text-right">{r.quantidade}</TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={3} className="text-muted-foreground">
                            Sem encomendas entregues ainda.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="grid gap-2">
                    <Skeleton className="h-4 w-48" />
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-4 w-32" />
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}

