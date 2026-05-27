import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-server'

// GET: exportar todos os dados do usuário (LGPD Art. 20)
export async function GET() {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
    }

    const [sessions, reviews, doubts] = await Promise.all([
      supabaseAdmin
        .from('study_sessions')
        .select('*, blocks(*)')
        .eq('user_id', userId)
        .order('created_at', { ascending: false }),
      supabaseAdmin
        .from('reviews')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false }),
      supabaseAdmin
        .from('doubts')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false }),
    ])

    const exportData = {
      exported_at: new Date().toISOString(),
      user_id: userId,
      study_sessions: sessions.data || [],
      reviews: reviews.data || [],
      doubts: doubts.data || [],
    }

    return new NextResponse(JSON.stringify(exportData, null, 2), {
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="estudo-ia-dados-${new Date().toISOString().split('T')[0]}.json"`,
      },
    })
  } catch (error) {
    console.error('Erro ao exportar dados:', error instanceof Error ? error.message : 'erro')
    return NextResponse.json({ error: 'Erro ao exportar dados' }, { status: 500 })
  }
}
