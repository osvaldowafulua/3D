'use server'

import { createAdminClient, getOwnerUid } from '@/lib/supabase/admin'
import { LeadSchema, NovaEncomendaSchema } from '@/lib/validation/agente'

type ActionOk<T> = { ok: true; data: T }
type ActionErr = { ok: false; status: number; error: string }
type ActionResult<T> = ActionOk<T> | ActionErr

export async function criarOuObterCliente(params: {
  nome: string
  telefone: string
}): Promise<ActionResult<{ clienteId: string }>> {
  try {
    const ownerId = getOwnerUid()
    // Unique por (user_id, telefone) => pode usar upsert para idempotencia.
    const supabase = createAdminClient()
    const { data, error } = await supabase
      .from('clientes')
      .upsert(
        {
          user_id: ownerId,
          nome: params.nome,
          telefone: params.telefone,
        },
        { onConflict: 'user_id,telefone' },
      )
      .select('id')
      .single()

    if (error || !data) {
      return { ok: false, status: 500, error: 'Nao foi possivel criar/obter cliente.' }
    }

    return { ok: true, data: { clienteId: data.id } }
  } catch {
    return { ok: false, status: 500, error: 'Operacao nao autorizada.' }
  }
}

export async function criarEncomendaPendente(
  input: unknown,
): Promise<ActionResult<{ encomendaId: string; estado: string }>> {
  try {
    const parsed = NovaEncomendaSchema.safeParse(input)
    if (!parsed.success) return { ok: false, status: 400, error: 'Pedido invalido.' }

    const ownerId = getOwnerUid()
    const supabase = createAdminClient()

    const clienteRes = parsed.data.clienteId
      ? { ok: true as const, data: { clienteId: parsed.data.clienteId } }
      : await criarOuObterCliente({
          nome: parsed.data.clienteNome,
          telefone: parsed.data.clienteTelefone,
        })

    if (!clienteRes.ok) {
      return { ok: false, status: clienteRes.status, error: clienteRes.error }
    }

    const clienteId = clienteRes.data.clienteId

    const { data: encomenda, error: encomendaError } = await supabase
      .from('encomendas')
      .insert({
        user_id: ownerId,
        cliente_id: clienteId,
        tipo_entrega: parsed.data.tipoEntrega,
        custo_entrega: parsed.data.custoEntrega ?? 0,
        notas: parsed.data.notasAgente ?? null,
        estado: 'pendente',
      })
      .select('id,estado')
      .single()

    if (encomendaError || !encomenda) {
      return { ok: false, status: 500, error: 'Nao foi possivel criar encomenda.' }
    }

    const { error: itemError } = await supabase.from('itens_encomenda').insert({
      user_id: ownerId,
      encomenda_id: encomenda.id,
      produto_id: parsed.data.produtoId,
      quantidade: parsed.data.quantidade,
    })

    if (itemError) {
      return {
        ok: false,
        status: 500,
        error: 'Nao foi possivel criar itens da encomenda.',
      }
    }

    return {
      ok: true,
      data: { encomendaId: encomenda.id, estado: encomenda.estado },
    }
  } catch {
    return { ok: false, status: 500, error: 'Erro ao processar solicitação.' }
  }
}

export async function criarLead(
  input: unknown,
): Promise<ActionResult<{ leadId: string; estado: string }>> {
  try {
    const parsed = LeadSchema.safeParse(input)
    if (!parsed.success) return { ok: false, status: 400, error: 'Pedido invalido.' }

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
      return { ok: false, status: 500, error: 'Nao foi possivel criar lead.' }
    }

    return { ok: true, data: { leadId: data.id, estado: data.estado } }
  } catch {
    return { ok: false, status: 500, error: 'Erro ao processar solicitação.' }
  }
}

