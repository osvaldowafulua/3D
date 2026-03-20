'use server'

import { createServerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { LeadSchema, NovaEncomendaSchema } from '@/lib/validation/agente'

type ActionOk<T> = { ok: true; data: T }
type ActionErr = { ok: false; error: string }
type ActionResult<T> = ActionOk<T> | ActionErr

function requiredEnv(name: string): string {
  const value = process.env[name]
  if (!value) throw new Error(`Missing env var: ${name}`)
  return value
}

function createAuthedClient() {
  const supabaseUrl = requiredEnv('NEXT_PUBLIC_SUPABASE_URL')
  const anonKey = requiredEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY')
  const cookieStore = cookies()

  return createServerClient(supabaseUrl, anonKey, {
    cookies: {
      getAll: async () =>
        cookieStore.getAll().map((c) => ({ name: c.name, value: c.value })),
      setAll: async (setCookies) => {
        for (const item of setCookies) {
          if (item.value) cookieStore.set({ name: item.name, value: item.value })
          else cookieStore.delete(item.name)
        }
      },
    },
  })
}

async function getOwnerId() {
  const supabase = createAuthedClient()
  const {
    data: { session },
  } = await supabase.auth.getSession()

  const ownerId = session?.user?.id
  if (!ownerId) throw new Error('Operador não autenticado.')
  return ownerId
}

export async function criarOuObterCliente(params: {
  nome: string
  telefone: string
}): Promise<ActionResult<{ clienteId: string }>> {
  try {
    const ownerId = await getOwnerId()

    // Unique por (user_id, telefone) => pode usar upsert para idempotencia.
    const supabase = createAuthedClient()
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
      return { ok: false, error: 'Nao foi possivel criar/obter cliente.' }
    }

    return { ok: true, data: { clienteId: data.id } }
  } catch {
    return { ok: false, error: 'Operacao nao autorizada.' }
  }
}

export async function criarEncomendaPendente(
  input: unknown,
): Promise<ActionResult<{ encomendaId: string }>> {
  try {
    const parsed = NovaEncomendaSchema.parse(input)
    const ownerId = await getOwnerId()

    const supabase = createAuthedClient()

    const clienteId =
      parsed.clienteId ??
      (
        await criarOuObterCliente({
          nome: parsed.clienteNome,
          telefone: parsed.clienteTelefone,
        })
      ).ok
        ? (
            await criarOuObterCliente({
              nome: parsed.clienteNome,
              telefone: parsed.clienteTelefone,
            })
          ).data.clienteId
        : undefined

    if (!clienteId) {
      return { ok: false, error: 'Nao foi possivel associar cliente.' }
    }

    const { data: encomenda, error: encomendaError } = await supabase
      .from('encomendas')
      .insert({
        user_id: ownerId,
        cliente_id: clienteId,
        tipo_entrega: parsed.tipoEntrega,
        custo_entrega: parsed.custoEntrega ?? 0,
        notas: parsed.notasAgente,
        estado: 'pendente',
      })
      .select('id')
      .single()

    if (encomendaError || !encomenda) {
      return { ok: false, error: 'Nao foi possivel criar encomenda.' }
    }

    const { error: itemError } = await supabase.from('itens_encomenda').insert({
      user_id: ownerId,
      encomenda_id: encomenda.id,
      produto_id: parsed.produtoId,
      quantidade: parsed.quantidade,
    })

    if (itemError) {
      return { ok: false, error: 'Nao foi possivel criar itens da encomenda.' }
    }

    return { ok: true, data: { encomendaId: encomenda.id } }
  } catch {
    return { ok: false, error: 'Pedido invalido.' }
  }
}

export async function criarLead(input: unknown): Promise<ActionResult<{ leadId: string }>> {
  try {
    const parsed = LeadSchema.parse(input)
    const ownerId = await getOwnerId()

    const supabase = createAuthedClient()
    const { data, error } = await supabase
      .from('leads')
      .insert({
        user_id: ownerId,
        nome: parsed.nome,
        contacto: parsed.contacto,
        produto_interesse: parsed.produtoInteresse,
        origem: parsed.origem,
        estado: 'novo',
        notas: parsed.notas,
      })
      .select('id')
      .single()

    if (error || !data) {
      return { ok: false, error: 'Nao foi possivel criar lead.' }
    }

    return { ok: true, data: { leadId: data.id } }
  } catch {
    return { ok: false, error: 'Lead invalido.' }
  }
}

