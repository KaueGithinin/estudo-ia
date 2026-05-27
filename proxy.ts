import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'

// Rotas públicas (sem login)
const isPublicRoute = createRouteMatcher([
  '/',
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/precos',
  '/privacidade',
  '/termos',
  '/api/cron(.*)', // protegida por CRON_SECRET, não por Clerk
])

export default clerkMiddleware(async (auth, req) => {
  if (!isPublicRoute(req)) {
    await auth.protect()
  }
})

export const config = {
  matcher: [
    // Ignora arquivos estáticos e internos do Next.js
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
}
