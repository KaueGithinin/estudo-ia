# 🧠 Ixa

> SaaS de estudo com Active Recall + IA. Cole um texto ou link do YouTube, explique com suas palavras, e a IA revela o que você realmente sabe.

**Domínio:** ixa.com.br  
**Stack:** Next.js 16 · Tailwind CSS · Clerk · Supabase · Groq · Resend · Stripe · Upstash

---

## 📋 Índice

- [Funcionalidades](#funcionalidades)
- [Stack e serviços](#stack-e-serviços)
- [Estrutura do projeto](#estrutura-do-projeto)
- [Banco de dados](#banco-de-dados)
- [API Routes](#api-routes)
- [Variáveis de ambiente](#variáveis-de-ambiente)
- [Como rodar localmente](#como-rodar-localmente)
- [Deploy](#deploy)
- [Planos e monetização](#planos-e-monetização)
- [Segurança](#segurança)
- [Roadmap](#roadmap)

---

## Funcionalidades

### Core — Active Recall com IA
- **Nova sessão por texto** — cola qualquer conteúdo (mínimo 100 caracteres)
- **Nova sessão por YouTube** — cola o link, a IA extrai a transcrição automaticamente
  - Tenta legenda oficial primeiro (PT → EN → qualquer)
  - Se não houver legenda, transcreve o áudio com Whisper via Groq
  - Limite: vídeos de até 25 minutos
- **Geração de blocos** — IA (Llama 3.3 70B via Groq) divide o conteúdo em 2–8 blocos temáticos com título, conteúdo e pontos-chave
- **Active recall** — o usuário explica o bloco com suas próprias palavras
- **Avaliação por IA** — a IA retorna: pontos certos, pontos esquecidos, correções de erros conceituais e score 0–100 com mensagem encorajadora

### Minhas Dúvidas
- Dúvidas/lacunas são salvas automaticamente após cada avaliação
- Listagem de todas as dúvidas abertas com link para o bloco de origem
- Marcar dúvida como resolvida

### Notificações por Email
- Toggle por sessão para ativar/desativar notificações
- Seletor de frequência: 2h, 4h, 8h ou 24h
- Email HTML com: bloco para revisar, pontos-chave e dúvidas abertas daquele bloco
- Consentimento LGPD registrado no banco antes de ativar
- Cron job automático a cada hora (Vercel Crons) — envia emails no momento certo para cada usuário

### Perfil e Gamificação
- Estatísticas: blocos estudados, sessões concluídas, dúvidas resolvidas, score médio
- Sistema de streak (dias consecutivos de estudo)
- Sistema de nível com emoji (baseado em total de blocos estudados)
- Botão de compartilhamento de conquista (copia texto para clipboard)

### Monetização
- **Plano Grátis** — 3 sessões por mês
- **Plano Pro** — sessões ilimitadas + notificações + estatísticas (R$ 19/mês)
- Checkout via Stripe (Checkout Sessions)
- Webhook do Stripe atualiza o plano no banco automaticamente
- Verificação de plano com proteção contra race condition no servidor

### LGPD
- Exportar todos os dados em JSON (sessões, blocos, reviews, dúvidas)
- Excluir conta com confirmação — apaga todos os dados do Supabase
- Consentimento explícito para emails registrado com timestamp

---

## Stack e serviços

| Camada | Tecnologia | Por quê |
|---|---|---|
| Framework | Next.js 16 (App Router) | SSR, API Routes, Cron |
| Estilo | Tailwind CSS v4 | Utilitário, rápido |
| Auth | Clerk v7 | Login pronto, middleware simples |
| Banco | Supabase (PostgreSQL) | RLS, tempo real, grátis |
| IA — texto | Groq (Llama 3.3 70B) | Rápido, grátis, JSON mode |
| IA — áudio | Groq (Whisper Large v3) | Transcrição sem servidor próprio |
| YouTube | youtube-transcript + ytdl-core | Legenda e áudio sem API oficial |
| Email | Resend | Template HTML simples, 3k/mês grátis |
| Pagamentos | Stripe | Checkout + Webhooks |
| Rate limiting | Upstash Redis | Sliding window, sem servidor |
| Validação | Zod | Schema de inputs nas API routes |
| Deploy | Vercel | Crons nativos, CI/CD automático |

---

## Estrutura do projeto

```
ixa/
├── app/
│   ├── layout.tsx                          # Layout global — Clerk + Inter + metadata
│   ├── page.tsx                            # Landing page
│   ├── dashboard/
│   │   └── page.tsx                        # Lista de sessões do usuário
│   ├── nova-sessao/
│   │   └── page.tsx                        # Criar sessão (texto ou YouTube)
│   ├── sessao/
│   │   └── [id]/
│   │       ├── page.tsx                    # Lista de blocos da sessão
│   │       └── bloco/
│   │           └── [blocoId]/
│   │               └── page.tsx            # Estudar bloco (active recall)
│   ├── minhas-duvidas/
│   │   └── page.tsx                        # Todas as dúvidas abertas
│   ├── perfil/
│   │   └── page.tsx                        # Stats, streak, nível, LGPD
│   ├── precos/
│   │   └── page.tsx                        # Planos Grátis e Pro
│   ├── privacidade/
│   │   └── page.tsx                        # Política de Privacidade (LGPD)
│   ├── termos/
│   │   └── page.tsx                        # Termos de Uso
│   ├── (auth)/
│   │   ├── sign-in/[[...sign-in]]/page.tsx # Login (Clerk)
│   │   └── sign-up/[[...sign-up]]/page.tsx # Cadastro (Clerk)
│   └── api/
│       ├── gerar-blocos/route.ts           # POST — cria sessão e gera blocos com IA
│       ├── avaliar-explicacao/route.ts     # POST — avalia explicação do aluno
│       ├── sessions/
│       │   ├── route.ts                    # GET — lista sessões do usuário
│       │   └── [id]/route.ts               # GET — sessão + blocos
│       ├── blocks/
│       │   └── [id]/route.ts               # PATCH — marcar bloco como estudado
│       ├── duvidas/route.ts                # GET/PATCH — listar e resolver dúvidas
│       ├── notificacoes/
│       │   ├── configurar/route.ts         # GET/POST — config de notificação por sessão
│       │   └── enviar/route.ts             # POST — enviar email agora (manual)
│       ├── cron/
│       │   └── revisao/route.ts            # GET — cron automático (Vercel, 1x/hora)
│       ├── transcrever-youtube/route.ts    # POST — transcrever vídeo (legenda ou Whisper)
│       ├── stripe/
│       │   ├── checkout/route.ts           # POST — criar sessão de checkout
│       │   └── webhook/route.ts            # POST — processar eventos do Stripe
│       ├── perfil/
│       │   └── stats/route.ts              # GET — estatísticas do perfil
│       └── users/
│           ├── export/route.ts             # GET — exportar dados (LGPD)
│           └── delete/route.ts             # POST — excluir conta (LGPD)
├── components/
│   └── NotificacaoConfig.tsx               # Componente de toggle + frequência de emails
├── lib/
│   ├── anthropic.ts                        # Prompts e chamadas ao Groq (gerarBlocos, avaliarExplicacao)
│   ├── supabase.ts                         # Cliente Supabase (browser, anon key)
│   ├── supabase-server.ts                  # Cliente Supabase admin (server, service role)
│   ├── stripe.ts                           # Cliente Stripe + getOrCreateStripeCustomer
│   ├── email.ts                            # Template HTML e envio via Resend
│   ├── ratelimit.ts                        # Rate limiting com Upstash (10 req/min por usuário)
│   ├── schemas.ts                          # Schemas Zod para validar inputs das API routes
│   └── types.ts                            # Interfaces TypeScript (StudySession, Block, Review, Doubt)
├── middleware.ts                            # Proteção de rotas com Clerk
├── next.config.ts                          # Security headers (CSP, HSTS, X-Frame, etc.)
├── vercel.json                             # Cron job: /api/cron/revisao a cada hora
├── supabase-schema.sql                     # Schema inicial das tabelas
├── supabase-lgpd-migration.sql             # Tabela profiles + campos LGPD + fix status constraint
├── supabase-rls-migration.sql              # Row Level Security — bloquear acesso público
├── supabase-notificacoes.sql               # Tabela notification_settings
├── DEPLOY-CHECKLIST.md                     # Passo a passo completo para ir ao ar
└── .env.local                              # Variáveis de ambiente (nunca commitar)
```

---

## Banco de dados

### Tabelas

#### `study_sessions`
| Coluna | Tipo | Descrição |
|---|---|---|
| id | uuid | PK |
| user_id | text | ID do Clerk |
| title | text | Título da sessão |
| original_text | text | Texto colado ou transcrição do YouTube |
| status | text | `processing` → `ready` → `completed` / `error` |
| created_at | timestamptz | — |

#### `blocks`
| Coluna | Tipo | Descrição |
|---|---|---|
| id | uuid | PK |
| session_id | uuid | FK → study_sessions |
| title | text | Título do bloco |
| content | text | Conteúdo do bloco |
| key_points | text[] | Array com 3–5 pontos-chave |
| order_index | int | Ordem dentro da sessão |
| created_at | timestamptz | — |

#### `reviews`
| Coluna | Tipo | Descrição |
|---|---|---|
| id | uuid | PK |
| block_id | uuid | FK → blocks |
| user_id | text | ID do Clerk |
| user_explanation | text | O que o aluno digitou |
| correct_points | text[] | Pontos acertados (retornados pela IA) |
| missing_points | text[] | Pontos esquecidos |
| corrections | jsonb | Erros conceituais `[{wrong, correct}]` |
| score | int | 0–100 |
| encouragement | text | Frase motivadora da IA |
| created_at | timestamptz | — |

#### `doubts`
| Coluna | Tipo | Descrição |
|---|---|---|
| id | uuid | PK |
| user_id | text | ID do Clerk |
| block_id | uuid | FK → blocks |
| description | text | Descrição da dúvida/lacuna |
| resolved | bool | Se foi marcada como resolvida |
| created_at | timestamptz | — |

#### `notification_settings`
| Coluna | Tipo | Descrição |
|---|---|---|
| id | uuid | PK |
| user_id | text | ID do Clerk |
| session_id | uuid | FK → study_sessions |
| user_email | text | Email do usuário |
| enabled | bool | Notificações ativas |
| frequency_hours | int | Frequência: 2, 4, 8 ou 24 |
| last_sent_at | timestamptz | Último email enviado |
| last_block_index | int | Índice do último bloco enviado |
| consent_given_at | timestamptz | Timestamp do consentimento LGPD |

#### `profiles`
| Coluna | Tipo | Descrição |
|---|---|---|
| id | uuid | PK |
| user_id | text | ID do Clerk |
| plan | text | `free` ou `pro` |
| stripe_customer_id | text | ID do customer no Stripe |
| stripe_subscription_id | text | ID da assinatura ativa |

### Migrations (rodar em ordem no Supabase SQL Editor)

```
1. supabase-schema.sql           # Tabelas principais
2. supabase-notificacoes.sql     # notification_settings
3. supabase-lgpd-migration.sql   # profiles + campos LGPD
4. supabase-rls-migration.sql    # RLS (rodar por último)
```

---

## API Routes

### Sessões e Blocos

| Método | Rota | Descrição |
|---|---|---|
| `POST` | `/api/gerar-blocos` | Cria sessão + chama Groq para gerar blocos. Verifica plano (free: 3/mês). |
| `GET` | `/api/sessions` | Lista todas as sessões do usuário autenticado |
| `GET` | `/api/sessions/[id]` | Retorna sessão com seus blocos e status de review |
| `PATCH` | `/api/blocks/[id]` | Atualiza bloco (ex: marcar como estudado) |
| `POST` | `/api/avaliar-explicacao` | Envia explicação do aluno para a IA e salva o review + dúvidas |

### YouTube

| Método | Rota | Descrição |
|---|---|---|
| `POST` | `/api/transcrever-youtube` | Extrai texto do vídeo (legenda ou Whisper). Limite: 25 min. |

### Dúvidas

| Método | Rota | Descrição |
|---|---|---|
| `GET` | `/api/duvidas` | Lista dúvidas abertas do usuário |
| `PATCH` | `/api/duvidas` | Marca dúvida como resolvida |

### Notificações

| Método | Rota | Descrição |
|---|---|---|
| `GET` | `/api/notificacoes/configurar` | Retorna config de notificação de uma sessão |
| `POST` | `/api/notificacoes/configurar` | Salva toggle + frequência + consentimento LGPD |
| `POST` | `/api/notificacoes/enviar` | Envia email manualmente para testar |
| `GET` | `/api/cron/revisao` | Chamado pelo Vercel Cron a cada hora — envia emails devidos |

### Stripe

| Método | Rota | Descrição |
|---|---|---|
| `POST` | `/api/stripe/checkout` | Cria Checkout Session e retorna URL |
| `POST` | `/api/stripe/webhook` | Processa `subscription.created/updated/deleted` |

### Perfil e LGPD

| Método | Rota | Descrição |
|---|---|---|
| `GET` | `/api/perfil/stats` | Retorna stats: blocos, sessões, dúvidas, score médio, streak, nível |
| `GET` | `/api/users/export` | Download JSON com todos os dados do usuário |
| `POST` | `/api/users/delete` | Exclui todos os dados do Supabase e cancela conta no Clerk |

---

## Variáveis de ambiente

Criar `.env.local` na raiz com:

```env
# Groq (IA — grátis em console.groq.com)
GROQ_API_KEY=gsk_...

# Resend (email — grátis em resend.com)
RESEND_API_KEY=re_...

# URL do app
NEXT_PUBLIC_APP_URL=http://localhost:3000   # trocar para https://ixa.com.br no deploy

# Cron (gerar em: openssl rand -hex 32)
CRON_SECRET=...

# Clerk (clerk.com → seu app → API Keys)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL=/dashboard
NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL=/dashboard
NEXT_PUBLIC_CLERK_SIGN_IN_FORCE_REDIRECT_URL=/dashboard
NEXT_PUBLIC_CLERK_SIGN_UP_FORCE_REDIRECT_URL=/dashboard

# Supabase (supabase.com → Project Settings → API)
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...    # chave service_role (nunca expor no browser)

# Upstash Redis (upstash.com → banco → REST API)
UPSTASH_REDIS_REST_URL=https://...upstash.io
UPSTASH_REDIS_REST_TOKEN=...

# Stripe (stripe.com → Developers → API Keys)
STRIPE_SECRET_KEY=sk_live_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_PRICE_ID=price_...           # ID do preço mensal do produto no Stripe
STRIPE_WEBHOOK_SECRET=whsec_...     # pegar após configurar o webhook (pós-deploy)
```

---

## Como rodar localmente

```bash
# 1. Instalar dependências
npm install

# 2. Configurar variáveis (ver seção acima)
cp .env.local.example .env.local  # ou criar manualmente

# 3. Rodar migrations no Supabase SQL Editor (ordem importa)

# 4. Iniciar servidor de desenvolvimento
npm run dev
```

Acessa em **http://localhost:3000**

> **Rate limiting:** sem `UPSTASH_REDIS_REST_URL`, o rate limiting é desativado automaticamente em desenvolvimento.

---

## Deploy

Ver **`DEPLOY-CHECKLIST.md`** para o passo a passo completo com ordem exata.

Resumo das fases:
1. Configurar Supabase (service role key) + Upstash + Stripe
2. Rodar migrations SQL no Supabase
3. Deploy no Vercel + variáveis de ambiente + domínio `ixa.com.br`
4. Ativar Clerk em produção (chaves `pk_live_`)
5. Configurar webhook do Stripe apontando para a URL de produção

---

## Planos e monetização

| Recurso | Grátis | Pro (R$ 19/mês) |
|---|---|---|
| Sessões por mês | 3 | Ilimitadas |
| Geração de blocos | ✅ | ✅ |
| Avaliação de explicações | ✅ | ✅ |
| Minhas Dúvidas | ✅ | ✅ |
| Input por YouTube | ✅ | ✅ |
| Notificações por email | ❌ | ✅ |
| Perfil com estatísticas | ❌ | ✅ |
| Gamificação e streak | ❌ | ✅ |

---

## Segurança

- **Autenticação** — todas as rotas privadas verificam `auth()` do Clerk no servidor
- **Rate limiting** — 10 requisições por minuto por usuário (Upstash sliding window)
- **Validação de inputs** — todos os inputs das API routes validados com Zod
- **Service role isolada** — `supabaseAdmin` usado apenas em API routes server-side, nunca exposto ao browser
- **RLS (Row Level Security)** — ativada no Supabase após deploy (ver migration)
- **Security headers** — configurados em `next.config.ts`:
  - `X-Frame-Options: DENY`
  - `X-Content-Type-Options: nosniff`
  - `Content-Security-Policy` restrita
  - `Strict-Transport-Security` com preload
  - `Referrer-Policy: strict-origin-when-cross-origin`
- **Webhook Stripe** — validação de assinatura com `stripe.webhooks.constructEvent`
- **Cron protegido** — `/api/cron/revisao` exige `Bearer CRON_SECRET` no header

---

## Roadmap

- [x] MVP: texto → blocos → active recall → avaliação → dúvidas
- [x] Notificações por email com dúvidas e blocos em ordem
- [x] Input por YouTube (legenda automática + Whisper)
- [x] Perfil com estatísticas e gamificação
- [x] Monetização com Stripe (planos Grátis e Pro)
- [x] LGPD (exportar e excluir dados)
- [x] Rate limiting e security headers
- [ ] Deploy em produção (ixa.com.br)
- [ ] Dashboard com gráficos de evolução de score
- [ ] App mobile (React Native / Expo)
