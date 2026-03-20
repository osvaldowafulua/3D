import { NextResponse } from 'next/server'
import { LeadSchema } from '@/lib/validation/agente'
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

    const parsed = LeadSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: 'Pedido invalido.' }, { status: 400 })
    }

    const ownerId = getOwnerUid()
    const supabase = createAdminClient()

    const { data, error } = await supabase
      .from('leads')
      .insert({
        user_id: ownerId,
        nome: parsed.data.nome,
        contacto: parsed.data.contacto,
        produto_interesse: parsed.data.produtoInteresse,
        origem: parsed.data.origem,
        estado: 'novo',
        notas: parsed.data.notas ?? null,
      })
      .select('id,estado')
      .single()

    if (error || !data) {
      return NextResponse.json({ error: 'Erro ao criar lead.' }, { status: 500 })
    }

    return NextResponse.json({ leadId: data.id, estado: data.estado }, { status: 201 })
  } catch {
    return NextResponse.json(
      { error: 'Erro ao processar solicitação.' },
      { status: 500 },
    )
  }
}

