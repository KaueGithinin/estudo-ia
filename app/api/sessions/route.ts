import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-server'

// GET: listar sessões do usuário logado
export async function GET() {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
    }

    const { data, error } = await supabaseAdmin
      .from('study_sessions')
      .select('id, title, status, created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(100) // teto razoável; paginação pode ser adicionada quando necessário

    if (error) throw error

    return NextResponse.json({ sessions: data || [] })
  } catch (error) {
    console.error('Erro ao buscar sessões:', error instanceof Error ? error.message : 'erro')
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}
