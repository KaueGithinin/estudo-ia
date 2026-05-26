import { auth } from '@clerk/nextjs/server'
import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// GET: listar dúvidas do usuário
export async function GET() {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
    }

    const { data, error } = await supabase
      .from('doubts')
      .select(`
        *,
        block:blocks(id, title, session_id, content, session:study_sessions(id, title))
      `)
      .eq('user_id', userId)
      .eq('resolved', false)
      .order('created_at', { ascending: false })

    if (error) throw error

    return NextResponse.json({ doubts: data })
  } catch (error) {
    console.error('Erro ao buscar dúvidas:', error)
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

    const { doubt_id } = await req.json()

    const { error } = await supabase
      .from('doubts')
      .update({ resolved: true })
      .eq('id', doubt_id)
      .eq('user_id', userId)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Erro ao resolver dúvida:', error)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}
