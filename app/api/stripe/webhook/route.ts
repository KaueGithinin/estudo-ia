import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { supabaseAdmin } from '@/lib/supabase-server'
import Stripe from 'stripe'

// Requer STRIPE_WEBHOOK_SECRET no .env.local
// Configurar em stripe.com → Webhooks → Add endpoint → /api/stripe/webhook
// Eventos: customer.subscription.created, customer.subscription.updated, customer.subscription.deleted

export async function POST(req: NextRequest) {
  const body = await req.text()
  const sig = req.headers.get('stripe-signature')

  if (!sig || !process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json({ error: 'Assinatura inválida' }, { status: 400 })
  }

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET)
  } catch {
    return NextResponse.json({ error: 'Webhook inválido' }, { status: 400 })
  }

  const getCustomerUserId = async (customerId: string): Promise<string | null> => {
    const { data } = await supabaseAdmin
      .from('profiles')
      .select('user_id')
      .eq('stripe_customer_id', customerId)
      .single()
    return data?.user_id ?? null
  }

  switch (event.type) {
    case 'customer.subscription.created':
    case 'customer.subscription.updated': {
      const sub = event.data.object as Stripe.Subscription
      const userId = await getCustomerUserId(sub.customer as string)
      if (userId) {
        const isActive = sub.status === 'active' || sub.status === 'trialing'
        await supabaseAdmin
          .from('profiles')
          .upsert({
            user_id: userId,
            plan: isActive ? 'pro' : 'free',
            stripe_subscription_id: sub.id,
          })
      }
      break
    }

    case 'customer.subscription.deleted': {
      const sub = event.data.object as Stripe.Subscription
      const userId = await getCustomerUserId(sub.customer as string)
      if (userId) {
        await supabaseAdmin
          .from('profiles')
          .update({ plan: 'free', stripe_subscription_id: null })
          .eq('user_id', userId)
      }
      break
    }
  }

  return NextResponse.json({ received: true })
}
