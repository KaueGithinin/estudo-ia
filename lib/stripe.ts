import Stripe from 'stripe'

// Requer STRIPE_SECRET_KEY no .env.local
// Criar conta em https://stripe.com → Developers → API Keys

let _stripe: Stripe | null = null

export function getStripe(): Stripe {
  if (!_stripe) {
    const key = process.env.STRIPE_SECRET_KEY
    if (!key) {
      throw new Error(
        'STRIPE_SECRET_KEY não configurado. ' +
        'Vá em stripe.com → Developers → API Keys e adicione ao .env.local'
      )
    }
    _stripe = new Stripe(key, {
      apiVersion: '2026-04-22.dahlia',
    })
  }
  return _stripe
}

// Proxy para manter a API compatível com o uso direto
export const stripe = new Proxy({} as Stripe, {
  get(_target, prop) {
    return getStripe()[prop as keyof Stripe]
  },
})

// Busca ou cria customer no Stripe para o userId
export async function getOrCreateStripeCustomer(
  userId: string,
  email: string
): Promise<string> {
  // Verificar se já existe no banco
  const { supabaseAdmin } = await import('@/lib/supabase-server')
  const { data: profile } = await supabaseAdmin
    .from('profiles')
    .select('stripe_customer_id')
    .eq('user_id', userId)
    .single()

  if (profile?.stripe_customer_id) {
    return profile.stripe_customer_id
  }

  // Criar novo customer no Stripe
  const customer = await getStripe().customers.create({
    email,
    metadata: { userId },
  })

  // Salvar no banco
  await supabaseAdmin
    .from('profiles')
    .upsert({ user_id: userId, stripe_customer_id: customer.id })

  return customer.id
}
