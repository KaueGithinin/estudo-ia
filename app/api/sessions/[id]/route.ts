import { auth } from '@clerk/nextjs/server'
import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-server'

// GET: sessão + blocos com status de review (ownership verificado)
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
    }

    const { id } = await params

    // Buscar sessão verificando ownership — excluir original_text (até 50KB, não usado no frontend)
    const { data: session, error: sessionError } = await supabaseAdmin
      .from('study_sessions')
      .select('id, title, status, created_at, user_id')
      .eq('id', id)
      .eq('user_id', userId)
      .single()

    if (sessionError || !session) {
      return NextResponse.json({ error: 'Sessão não encontrada' }, { status: 404 })
    }

    // Buscar blocos com reviews
    const { data: blocksData, error: blocksError } = await supabaseAdmin
      .from('blocks')
      .select('*, reviews(score, missing_points, created_at)')
      .eq('session_id', id)
      .order('order_index')

    if (blocksError) throw blocksError

    // Calcular status de cada bloco
    const blocks = (blocksData || []).map((block) => {
      const reviews = block.reviews || []
      if (reviews.length === 0) {
        return { ...block, review_status: 'pending', last_score: null }
      }
      const latest = reviews.sort(
        (a: { created_at: string }, b: { created_at: string }) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      )[0]
      const hasDubts = latest.missing_points && latest.missing_points.length > 0
      return {
        ...block,
        review_status: hasDubts ? 'with_doubts' : 'studied',
        last_score: latest.score,
      }
    })

    return NextResponse.json({ session, blocks })
  } catch (error) {
    console.error('Erro ao buscar sessão:', error instanceof Error ? error.message : 'erro')
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}
