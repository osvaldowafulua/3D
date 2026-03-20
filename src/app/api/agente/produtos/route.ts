import { NextResponse } from 'next/server'
import { z } from 'zod'
import { createAdminClient, getOwnerUid } from '@/lib/supabase/admin'
import { requireAgenteApiKey } from '../_lib/apiKey'

const QuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(50).optional().default(5),
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
    const ativoParam = url.searchParams.get('ativo')
    const ativo = ativoParam === 'false' ? false : true
    const ownerId = getOwnerUid()
    const supabase = createAdminClient()

    const { data, error } = await supabase
      .from('produtos')
      .select('nome,descricao,preco,filamento:filamentos(nome)')
      .eq('user_id', ownerId)
      .eq('ativo', ativo)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error || !data) {
      return NextResponse.json(
        { error: 'Erro ao buscar produtos.' },
        { status: 500 },
      )
    }

    type ProdutoRow = {
      nome: string
      descricao: string | null
      preco: number
      filamento: { nome: string } | null
    }
    const produtos = data as ProdutoRow[]

    return NextResponse.json({
      produtos: produtos.map((p) => ({
        nome: p.nome,
        descricao: p.descricao,
        preco: p.preco,
        filamento: p.filamento?.nome ?? null,
      })),
    })
  } catch {
    return NextResponse.json({ error: 'Erro ao processar solicitação.' }, { status: 500 })
  }
}

