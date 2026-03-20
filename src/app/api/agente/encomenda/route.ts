import { NextResponse } from 'next/server'
import { NovaEncomendaSchema } from '@/lib/validation/agente'
import { createAdminClient, getOwnerUid } from '@/lib/supabase/admin'
import { requireAgenteApiKey } from '../_lib/apiKey'

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

    const parsed = NovaEncomendaSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: 'Pedido invalido.' }, { status: 400 })
    }

    const ownerId = getOwnerUid()
    const supabase = createAdminClient()

    const { data: clienteData, error: clienteError } = await supabase
      .from('clientes')
      .upsert(
        {
          user_id: ownerId,
          nome: parsed.data.clienteNome,
          telefone: parsed.data.clienteTelefone,
        },
        { onConflict: 'user_id,telefone' },
      )
      .select('id')
      .single()

    if (clienteError || !clienteData) {
      return NextResponse.json({ error: 'Erro ao criar cliente.' }, { status: 500 })
    }

    const { data: encomendaData, error: encomendaError } = await supabase
      .from('encomendas')
      .insert({
        user_id: ownerId,
        cliente_id: parsed.data.clienteId ?? clienteData.id,
        tipo_entrega: parsed.data.tipoEntrega,
        custo_entrega: parsed.data.custoEntrega ?? 0,
        notas: parsed.data.notasAgente ?? null,
        estado: 'pendente',
      })
      .select('id,estado')
      .single()

    if (encomendaError || !encomendaData) {
      return NextResponse.json({ error: 'Erro ao criar encomenda.' }, { status: 500 })
    }

    const { error: itemError } = await supabase.from('itens_encomenda').insert({
      user_id: ownerId,
      encomenda_id: encomendaData.id,
      produto_id: parsed.data.produtoId,
      quantidade: parsed.data.quantidade,
    })

    if (itemError) {
      return NextResponse.json({ error: 'Erro ao criar itens.' }, { status: 500 })
    }

    return NextResponse.json(
      { encomendaId: encomendaData.id, estado: encomendaData.estado },
      { status: 201 },
    )
  } catch {
    return NextResponse.json(
      { error: 'Erro ao processar solicitação.' },
      { status: 500 },
    )
  }
}

