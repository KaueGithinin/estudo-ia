import { auth, currentUser } from '@clerk/nextjs/server'
import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-server'

// POST: salvar configuração de notificação para uma sessão
export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })

    const user = await currentUser()
    const userEmail = user?.emailAddresses[0]?.emailAddress
    if (!userEmail) return NextResponse.json({ error: 'Email não encontrado' }, { status: 400 })

    const body = await req.json()
    const { session_id, enabled, frequency_hours, consent } = body

    if (!session_id || typeof session_id !== 'string') {
      return NextResponse.json({ error: 'session_id inválido' }, { status: 400 })
    }
    if (typeof enabled !== 'boolean') {
      return NextResponse.json({ error: 'Campo "enabled" inválido' }, { status: 400 })
    }
    if (frequency_hours !== undefined) {
      const fh = Number(frequency_hours)
      if (!Number.isInteger(fh) || fh < 1 || fh > 168) {
        return NextResponse.json({ error: 'frequency_hours deve ser entre 1 e 168' }, { status: 400 })
      }
    }

    // Verificar ownership da sessão
    const { data: session } = await supabaseAdmin
      .from('study_sessions')
      .select('id')
      .eq('id', session_id)
      .eq('user_id', userId)
      .single()

    if (!session) return NextResponse.json({ error: 'Sessão não encontrada ou sem permissão' }, { status: 403 })

    const upsertData: Record<string, unknown> = {
      user_id: userId,
      session_id,
      user_email: userEmail,
      enabled,
      frequency_hours: frequency_hours || 2,
    }

    // Registrar consentimento quando ativar notificações
    if (enabled && consent) {
      upsertData.consent_given_at = new Date().toISOString()
    }

    const { error } = await supabaseAdmin
      .from('notification_settings')
      .upsert(upsertData, { onConflict: 'user_id,session_id' })

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('❌ Erro ao configurar notificação:', error instanceof Error ? error.message : 'erro')
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

    const { data } = await supabaseAdmin
      .from('notification_settings')
      .select('enabled, frequency_hours, consent_given_at')
      .eq('user_id', userId)
      .eq('session_id', session_id)
      .single()

    return NextResponse.json({ config: data })
  } catch {
    return NextResponse.json({ config: null })
  }
}
