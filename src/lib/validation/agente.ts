import { z } from 'zod'

const Uuid = z.string().uuid()

export const NovaEncomendaSchema = z.object({
  clienteId: Uuid.optional(),

  clienteNome: z.string().min(1).max(120),
  clienteTelefone: z.string().min(3).max(40),

  produtoId: Uuid,
  quantidade: z.number().int().min(1).max(999),

  tipoEntrega: z.enum(['local', 'envio']),
  custoEntrega: z.number().min(0).optional(),

  notasAgente: z.string().max(500).optional(),
})

export const LeadSchema = z.object({
  nome: z.string().min(1).max(120),
  contacto: z.string().min(3).max(60),
  produtoInteresse: z.string().min(1).max(200),

  origem: z.enum(['instagram_dm', 'whatsapp', 'facebook']),
  notas: z.string().max(500).optional(),
})

export type NovaEncomendaInput = z.infer<typeof NovaEncomendaSchema>
export type LeadInput = z.infer<typeof LeadSchema>

