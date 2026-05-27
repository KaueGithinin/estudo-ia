import { auth, currentUser } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { stripe, getOrCreateStripeCustomer } from '@/lib/stripe'

export async function POST() {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
    }

    const user = await currentUser()
    const email = user?.emailAddresses[0]?.emailAddress
    if (!email) {
      return NextResponse.json({ error: 'Email não encontrado' }, { status: 400 })
    }

    const customerId = await getOrCreateStripeCustomer(userId, email)
    const appUrl = process.env.NEXT_PUBLIC_APP_URL
    if (!appUrl) {
      console.error('NEXT_PUBLIC_APP_URL não configurado — success_url vai apontar para localhost')
    }
    const baseUrl = appUrl || 'http://localhost:3000'

    // STRIPE_PRICE_ID: criar no Stripe Dashboard → Products → EstudoIA Pro → preço mensal
    const priceId = process.env.STRIPE_PRICE_ID
    if (!priceId) {
      return NextResponse.json({ error: 'Produto não configurado' }, { status: 500 })
    }

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      line_items: [{ price: priceId, quantity: 1 }],
      mode: 'subscription',
      success_url: `${baseUrl}/dashboard?plano=ativado`,
      cancel_url: `${baseUrl}/precos`,
      locale: 'pt-BR',
    })

    return NextResponse.json({ url: session.url })
  } catch (error) {
    console.error('Erro ao criar checkout:', error instanceof Error ? error.message : 'erro')
    return NextResponse.json({ error: 'Erro ao iniciar pagamento' }, { status: 500 })
  }
}
