import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

// Rate limiting: 10 requisições por minuto por usuário
// Requer: UPSTASH_REDIS_REST_URL e UPSTASH_REDIS_REST_TOKEN no .env.local
// Criar conta grátis em https://upstash.com

let ratelimitInstance: Ratelimit | null = null

function getRatelimit(): Ratelimit {
  if (!ratelimitInstance) {
    if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
      throw new Error('UPSTASH_REDIS_REST_URL e UPSTASH_REDIS_REST_TOKEN não configurados')
    }
    ratelimitInstance = new Ratelimit({
      redis: Redis.fromEnv(),
      limiter: Ratelimit.slidingWindow(10, '1 m'),
      analytics: true,
      prefix: 'ixa',
    })
  }
  return ratelimitInstance
}

export async function checkRateLimit(userId: string): Promise<{ success: boolean }> {
  // Se Upstash não estiver configurado, permitir em desenvolvimento
  if (!process.env.UPSTASH_REDIS_REST_URL) {
    return { success: true }
  }
  return getRatelimit().limit(`user:${userId}`)
}
