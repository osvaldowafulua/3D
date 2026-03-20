import { NextResponse } from 'next/server'
import { createAdminClient, getOwnerUid } from '@/lib/supabase/admin'
import { requireAgenteApiKey } from '../_lib/apiKey'

function sumBy<T>(arr: T[], key: (t: T) => string | null, value: (t: T) => number) {
  const map = new Map<string, number>()
  for (const item of arr) {
    const k = key(item)
    if (!k) continue
    map.set(k, (map.get(k) ?? 0) + value(item))
  }
  return map
}

function pickMax(map: Map<string, number>) {
  let bestName: string | null = null
  let bestValue = 0
  for (const [name, value] of map.entries()) {
    if (bestName === null || value > bestValue) {
      bestName = name
      bestValue = value
    }
  }
  return bestName ? { nome: bestName, quantidade: bestValue } : null
}

export async function GET(req: Request) {
  try {
    if (!requireAgenteApiKey(req)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const ownerId = getOwnerUid()
    const supabase = createAdminClient()

    const { data: encomendasAll, error: encomendasAllError } = await supabase
      .from('encomendas')
      .select('id,estado,tempo_producao_dias')
      .eq('user_id', ownerId)

    if (encomendasAllError) {
      return NextResponse.json({ error: 'Erro ao calcular stats.' }, { status: 500 })
    }

    type EncomendaRow = {
      id: string
      estado: string
      tempo_producao_dias: number | null
    }

    const encomendasRows = (encomendasAll ?? []) as EncomendaRow[]
    const totalEncomendas = encomendasRows.length

    const delivered = encomendasRows.filter(
      (e) => e.estado === 'entregue' && e.tempo_producao_dias != null,
    )
    const tempoMedioProducaoDias =
      delivered.length > 0
        ? delivered.reduce((acc, e) => acc + (e.tempo_producao_dias ?? 0), 0) /
          delivered.length
        : null

    const { data: itens, error: itensError } = await supabase
      .from('itens_encomenda')
      .select('quantidade,produto:produtos(nome,user_id,filamento:filamentos(nome))')
      .eq('user_id', ownerId)

    if (itensError) {
      return NextResponse.json({ error: 'Erro ao calcular stats.' }, { status: 500 })
    }

    type ItemRow = {
      quantidade: number
      produto:
        | {
            nome: string | null
            user_id: string | null
            filamento: { nome: string | null } | null
          }
        | null
    }

    const itensRows = (itens ?? []) as unknown as ItemRow[]
    const itemsSafe = itensRows.filter((i) => i.produto?.user_id === ownerId)

    const produtosMap = sumBy(
      itemsSafe,
      (i) => i.produto?.nome ?? null,
      (i) => i.quantidade,
    )
    const filamentosMap = sumBy(
      itemsSafe,
      (i) => i.produto?.filamento?.nome ?? null,
      (i) => i.quantidade,
    )

    return NextResponse.json({
      totalEncomendas,
      produtoMaisVendido: pickMax(produtosMap),
      tempoMedioProducaoDias,
      filamentoMaisUsado: pickMax(filamentosMap),
    })
  } catch {
    return NextResponse.json(
      { error: 'Erro ao processar solicitação.' },
      { status: 500 },
    )
  }
}

