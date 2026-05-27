import { auth } from '@clerk/nextjs/server'
import { NextRequest, NextResponse } from 'next/server'
import { avaliarExplicacao } from '@/lib/anthropic'
import { supabaseAdmin } from '@/lib/supabase-server'
import { avaliarExplicacaoSchema } from '@/lib/schemas'
import { checkRateLimit } from '@/lib/ratelimit'

// Groq pode demorar em avaliações longas — aumentar timeout do Vercel
export const maxDuration = 60

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
    }

    // Rate limiting
    const { success } = await checkRateLimit(userId)
    if (!success) {
      return NextResponse.json(
        { error: 'Muitas requisições. Aguarde um momento e tente novamente.' },
        { status: 429, headers: { 'Retry-After': '60' } }
      )
    }

    // Validação com Zod
    const body = await req.json()
    const parsed = avaliarExplicacaoSchema.safeParse(body)
    if (!parsed.success) {
      const msg = parsed.error.issues[0]?.message || 'Dados inválidos'
      return NextResponse.json({ error: msg }, { status: 400 })
    }
    const { bloco_id, explicacao } = parsed.data

    // Buscar bloco verificando ownership (join com study_sessions)
    const { data: bloco, error: blocoError } = await supabaseAdmin
      .from('blocks')
      .select('*, study_sessions!inner(user_id)')
      .eq('id', bloco_id)
      .eq('study_sessions.user_id', userId)
      .single()

    if (blocoError || !bloco) {
      return NextResponse.json({ error: 'Bloco não encontrado ou sem permissão' }, { status: 403 })
    }

    // Chamar IA para avaliar a explicação
    const avaliacao = await avaliarExplicacao(
      bloco.content,
      bloco.key_points,
      explicacao
    )

    // Salvar a review no banco
    const { data: review, error: reviewError } = await supabaseAdmin
      .from('reviews')
      .insert({
        block_id: bloco_id,
        user_id: userId,
        user_explanation: explicacao,
        correct_points: avaliacao.correct_points,
        missing_points: avaliacao.missing_points,
        corrections: avaliacao.corrections,
        score: avaliacao.score,
        encouragement: avaliacao.encouragement,
      })
      .select()
      .single()

    if (reviewError) throw reviewError

    // Salvar as dúvidas
    const duvidas = [
      ...avaliacao.missing_points.map((p) => ({
        user_id: userId,
        block_id: bloco_id,
        description: `Esqueceu: ${p}`,
        resolved: false,
      })),
      ...avaliacao.corrections.map((c) => ({
        user_id: userId,
        block_id: bloco_id,
        description: `Explicou errado: "${c.wrong}" → Correto: "${c.correct}"`,
        resolved: false,
      })),
    ]

    if (duvidas.length > 0) {
      const { error: doubtError } = await supabaseAdmin.from('doubts').insert(duvidas)
      if (doubtError) {
        // Dúvidas são dados de aprendizado do usuário — falha aqui é importante
        console.error('❌ Erro ao salvar dúvidas:', doubtError.message)
        // Retornar avaliação mas sinalizar que dúvidas não foram salvas
        return NextResponse.json({
          review_id: review.id,
          avaliacao,
          aviso: 'Avaliação salva, mas houve um erro ao registrar suas dúvidas. Tente avaliar novamente.',
        })
      }
    }

    return NextResponse.json({ review_id: review.id, avaliacao })
  } catch (error) {
    console.error('Erro ao avaliar explicação:', error instanceof Error ? error.message : 'erro')
    return NextResponse.json({ error: 'Erro interno ao avaliar sua explicação' }, { status: 500 })
  }
}
