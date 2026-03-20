import { NextResponse } from 'next/server'
import { z } from 'zod'
import { createAdminClient, getOwnerUid } from '@/lib/supabase/admin'
import { requireAgenteApiKey } from '../_lib/apiKey'

const QuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(20).optional().default(5),
})

export async function GET(req: Request) {
  try {
    if (!requireAgenteApiKey(req)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const url = new URL(req.url)
    const parsed = QuerySchema.safeParse(Object.fromEntries(url.searchParams))
    if (!parsed.success) {
      return NextResponse.json({ error: 'Parâmetros inválidos.' }, { status: 400 })
    }

    const { limit } = parsed.data
    const ownerId = getOwnerUid()
    const supabase = createAdminClient()

    const { data: encomendas, error: encomendasError } = await supabase
      .from('encomendas')
      .select('id,tempo_producao_dias,tipo_entrega,entregue_em')
      .eq('user_id', ownerId)
      .eq('estado', 'entregue')
      .order('entregue_em', { ascending: false })
      .limit(limit)

    if (encomendasError || !encomendas) {
      return NextResponse.json(
        { error: 'Erro ao buscar encomendas recentes.' },
        { status: 500 },
      )
    }

    const encomendaIds = encomendas.map((e: any) => e.id)
    if (encomendaIds.length === 0) {
      return NextResponse.json({ encomendas: [] })
    }

    const { data: itens, error: itensError } = await supabase
      .from('itens_encomenda')
      .select(
        'encomenda_id,quantidade,produto:produtos(nome,user_id,filamento:filamentos(nome))',
      )
      .eq('user_id', ownerId)
      .in('encomenda_id', encomendaIds)

    if (itensError || !itens) {
      return NextResponse.json(
        { error: 'Erro ao buscar itens das encomendas.' },
        { status: 500 },
      )
    }

    const itensPorEncomenda = new Map<string, any[]>()
    for (const item of itens as any[]) {
      if (item.produto?.user_id && item.produto.user_id !== ownerId) continue
      const list = itensPorEncomenda.get(item.encomenda_id) ?? []
      list.push({
        produto: item.produto?.nome ?? null,
        quantidade: item.quantidade,
        tipoFilamento: item.produto?.filamento?.nome ?? null,
      })
      itensPorEncomenda.set(item.encomenda_id, list)
    }

    return NextResponse.json({
      encomendas: encomendas.map((e: any) => ({
        encomendaId: e.id,
        tempoProducaoDias: e.tempo_producao_dias,
        tipoEntrega: e.tipo_entrega,
        entregueEm: e.entregue_em,
        itens: itensPorEncomenda.get(e.id) ?? [],
      })),
    })
  } catch {
    return NextResponse.json(
      { error: 'Erro ao processar solicitação.' },
      { status: 500 },
    )
  }
}

