import { auth } from '@clerk/nextjs/server'
import { NextRequest, NextResponse } from 'next/server'
import { avaliarExplicacao } from '@/lib/anthropic'
import { supabase } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
    }

    const { bloco_id, explicacao } = await req.json()

    if (!bloco_id || !explicacao || explicacao.trim().length < 20) {
      return NextResponse.json(
        { error: 'Explicação muito curta. Tente detalhar mais o que entendeu.' },
        { status: 400 }
      )
    }

    // 1. Buscar o bloco no banco
    const { data: bloco, error: blocoError } = await supabase
      .from('blocks')
      .select('*')
      .eq('id', bloco_id)
      .single()

    if (blocoError) {
      console.error('❌ Erro ao buscar bloco:', blocoError)
      return NextResponse.json({ error: `Bloco não encontrado: ${blocoError.message}` }, { status: 404 })
    }
    if (!bloco) {
      return NextResponse.json({ error: 'Bloco não encontrado' }, { status: 404 })
    }

    // 2. Chamar Claude para avaliar a explicação
    const avaliacao = await avaliarExplicacao(
      bloco.content,
      bloco.key_points,
      explicacao
    )

    // 3. Salvar a review no banco
    const { data: review, error: reviewError } = await supabase
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

    if (reviewError) {
      console.error('❌ Erro ao salvar review:', reviewError)
      throw reviewError
    }

    // 4. Salvar as dúvidas (pontos que o aluno não lembrou ou errou)
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

    console.log(`💾 Salvando ${duvidas.length} dúvidas...`)
    if (duvidas.length > 0) {
      const { error: doubtError } = await supabase.from('doubts').insert(duvidas)
      if (doubtError) console.error('❌ Erro ao salvar dúvidas:', doubtError)
      else console.log('✅ Dúvidas salvas!')
    } else {
      console.log('✅ Nenhuma dúvida — aluno acertou tudo!')
    }

    return NextResponse.json({
      review_id: review.id,
      avaliacao,
    })
  } catch (error) {
    console.error('Erro ao avaliar explicação:', error)
    return NextResponse.json(
      { error: 'Erro interno ao avaliar sua explicação' },
      { status: 500 }
    )
  }
}
