import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-server'

export async function GET() {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
    }

    // Data de 30 dias atrás para calcular streak sem carregar histórico inteiro
    const trintaDiasAtras = new Date()
    trintaDiasAtras.setDate(trintaDiasAtras.getDate() - 30)

    const [sessionsRes, reviewsCountRes, reviewsScoreRes, reviewsStreakRes, doubtsRes] = await Promise.all([
      // Total de sessões (só contagem)
      supabaseAdmin
        .from('study_sessions')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', userId),
      // Total de blocos estudados (só contagem)
      supabaseAdmin
        .from('reviews')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', userId),
      // Score médio — últimas 100 reviews (amostra representativa)
      supabaseAdmin
        .from('reviews')
        .select('score')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(100),
      // Streak — só últimos 30 dias
      supabaseAdmin
        .from('reviews')
        .select('created_at')
        .eq('user_id', userId)
        .gte('created_at', trintaDiasAtras.toISOString())
        .order('created_at', { ascending: false }),
      // Dúvidas resolvidas (só contagem)
      supabaseAdmin
        .from('doubts')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('resolved', true),
    ])

    const totalSessoes = sessionsRes.count ?? 0
    const totalBlocos = reviewsCountRes.count ?? 0
    const totalDuvidasResolvidas = doubtsRes.count ?? 0

    const scoresSample = reviewsScoreRes.data ?? []
    const scoresMedio =
      scoresSample.length > 0
        ? Math.round(scoresSample.reduce((s, r) => s + r.score, 0) / scoresSample.length)
        : 0

    // Calcular streak usando apenas os últimos 30 dias
    const diasComReview = new Set(
      (reviewsStreakRes.data ?? []).map((r) => new Date(r.created_at).toISOString().split('T')[0])
    )
    let streak = 0
    const hoje = new Date()
    for (let i = 0; i < 30; i++) {
      const d = new Date(hoje)
      d.setDate(hoje.getDate() - i)
      const key = d.toISOString().split('T')[0]
      if (diasComReview.has(key)) {
        streak++
      } else if (i > 0) {
        break
      }
    }

    // Nível de gamificação
    const nivel =
      totalBlocos >= 100 ? { emoji: '🏆', label: 'Mestre' } :
      totalBlocos >= 60  ? { emoji: '🚀', label: 'Avançado' } :
      totalBlocos >= 30  ? { emoji: '🧠', label: 'Dedicado' } :
      totalBlocos >= 10  ? { emoji: '📖', label: 'Estudante' } :
                           { emoji: '🌱', label: 'Iniciante' }

    return NextResponse.json({
      totalBlocos,
      totalSessoes,
      totalDuvidasResolvidas,
      scoresMedio,
      streak,
      nivel,
    })
  } catch (error) {
    console.error('Erro ao buscar stats:', error instanceof Error ? error.message : 'erro')
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}
