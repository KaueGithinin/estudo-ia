import { auth } from '@clerk/nextjs/server'
import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-server'

// GET: listar dúvidas do usuário
export async function GET() {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
    }

    const { data, error } = await supabaseAdmin
      .from('doubts')
      .select(`
        id, description, block_id, created_at,
        block:blocks(id, title, session_id, session:study_sessions(id, title, user_id))
      `)
      .eq('user_id', userId)
      .eq('resolved', false)
      .order('created_at', { ascending: false })
      .limit(200) // teto para não sobrecarregar — paginação futura se necessário

    if (error) throw error

    // Dupla proteção: filtrar no JS para garantir que os blocos pertencem ao usuário
    const doubtsSeguras = (data || []).filter((d) => {
      const sessionUserId = (d.block as { session?: { user_id?: string } } | null)?.session?.user_id
      return !sessionUserId || sessionUserId === userId
    })

    return NextResponse.json({ doubts: doubtsSeguras })
  } catch (error) {
    console.error('Erro ao buscar dúvidas:', error instanceof Error ? error.message : 'erro')
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}

// PATCH: marcar dúvida como resolvida
export async function PATCH(req: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
    }

    const body = await req.json()
    const { doubt_id } = body

    if (!doubt_id || typeof doubt_id !== 'string') {
      return NextResponse.json({ error: 'doubt_id inválido' }, { status: 400 })
    }

    const { error } = await supabaseAdmin
      .from('doubts')
      .update({ resolved: true })
      .eq('id', doubt_id)
      .eq('user_id', userId) // ownership check

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Erro ao resolver dúvida:', error instanceof Error ? error.message : 'erro')
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}
