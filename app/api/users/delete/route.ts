import { auth, clerkClient } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-server'
import { getStripe } from '@/lib/stripe'

// POST: excluir conta e todos os dados do usuário (LGPD Art. 18)
export async function POST() {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
    }

    // 1. Cancelar assinatura ativa no Stripe (senão usuário continua sendo cobrado)
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('stripe_subscription_id')
      .eq('user_id', userId)
      .single()

    if (profile?.stripe_subscription_id) {
      try {
        await getStripe().subscriptions.cancel(profile.stripe_subscription_id)
      } catch (e) {
        // Logar mas não bloquear a exclusão — usuário tem direito de sair
        console.error('Aviso: erro ao cancelar subscription no Stripe:', e instanceof Error ? e.message : 'erro')
      }
    }

    // 2. Excluir dados em cascata (ordem importa por causa de foreign keys)
    await supabaseAdmin.from('notification_settings').delete().eq('user_id', userId)
    await supabaseAdmin.from('doubts').delete().eq('user_id', userId)
    await supabaseAdmin.from('reviews').delete().eq('user_id', userId)
    // study_sessions: blocks são deletados em CASCADE automaticamente
    await supabaseAdmin.from('study_sessions').delete().eq('user_id', userId)
    await supabaseAdmin.from('profiles').delete().eq('user_id', userId)

    // 3. Deletar conta no Clerk
    const clerk = await clerkClient()
    await clerk.users.deleteUser(userId)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Erro ao excluir conta:', error instanceof Error ? error.message : 'erro')
    return NextResponse.json({ error: 'Erro ao excluir conta' }, { status: 500 })
  }
}
