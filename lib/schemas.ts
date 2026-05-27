import { z } from 'zod'

export const gerarBlocosSchema = z.object({
  titulo: z.string().max(200).optional(),
  texto: z.string().min(100).max(50_000),
})

export const avaliarExplicacaoSchema = z.object({
  bloco_id: z.string().uuid(),
  explicacao: z.string().min(20).max(5_000),
})

export const youtubeSchema = z.object({
  url: z.string().url(),
})

export const notificacaoSchema = z.object({
  session_id: z.string().uuid(),
  enabled: z.boolean(),
  frequency_hours: z.number().int().positive().max(168).optional(),
  consent: z.boolean().optional(),
})
