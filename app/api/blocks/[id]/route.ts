import { auth } from '@clerk/nextjs/server'
import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-server'

// GET: bloco individual com verificação de ownership
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

    // Buscar bloco com join obrigatório em study_sessions para verificar ownership
    const { data: bloco, error } = await supabaseAdmin
      .from('blocks')
      .select('*, study_sessions!inner(user_id, id)')
      .eq('id', id)
      .eq('study_sessions.user_id', userId)
      .single()

    if (error || !bloco) {
      return NextResponse.json({ error: 'Bloco não encontrado' }, { status: 404 })
    }

    // Remover dados do join antes de enviar ao cliente (user_id não deve ir ao browser)
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { study_sessions: _join, ...blocoSemJoin } = bloco
    return NextResponse.json({ block: blocoSemJoin })
  } catch (error) {
    console.error('Erro ao buscar bloco:', error instanceof Error ? error.message : 'erro')
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}
