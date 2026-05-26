import { auth, currentUser } from '@clerk/nextjs/server'
import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// POST: salvar configuração de notificação para uma sessão
export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })

    const user = await currentUser()
    const userEmail = user?.emailAddresses[0]?.emailAddress
    if (!userEmail) return NextResponse.json({ error: 'Email não encontrado' }, { status: 400 })

    const { session_id, enabled, frequency_hours } = await req.json()

    const { error } = await supabase
      .from('notification_settings')
      .upsert({
        user_id: userId,
        session_id,
        user_email: userEmail,
        enabled,
        frequency_hours: frequency_hours || 2,
      }, { onConflict: 'user_id,session_id' })

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('❌ Erro ao configurar notificação:', error)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}

// GET: buscar configuração atual da sessão
export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })

    const session_id = req.nextUrl.searchParams.get('session_id')
    if (!session_id) return NextResponse.json({ error: 'session_id obrigatório' }, { status: 400 })

    const { data } = await supabase
      .from('notification_settings')
      .select('*')
      .eq('user_id', userId)
      .eq('session_id', session_id)
      .single()

    return NextResponse.json({ config: data })
  } catch {
    return NextResponse.json({ config: null })
  }
}
