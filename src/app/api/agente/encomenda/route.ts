import { NextResponse } from 'next/server'
import { requireAgenteApiKey } from '../_lib/apiKey'
import { criarEncomendaPendente } from '@/app/actions/agente'

export async function POST(req: Request) {
  try {
    if (!requireAgenteApiKey(req)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    let body: unknown
    try {
      body = await req.json()
    } catch {
      return NextResponse.json({ error: 'Pedido invalido.' }, { status: 400 })
    }

    const res = await criarEncomendaPendente(body)
    if (!res.ok) {
      return NextResponse.json({ error: res.error }, { status: res.status })
    }

    return NextResponse.json(
      { encomendaId: res.data.encomendaId, estado: res.data.estado },
      { status: 201 },
    )
  } catch {
    return NextResponse.json(
      { error: 'Erro ao processar solicitação.' },
      { status: 500 },
    )
  }
}

