# Checklist de Deploy — Ixa

> Tudo que precisa ser feito manualmente. O código está pronto e buildando.
> Siga a ordem — cada fase depende da anterior.

---

## FASE 1 — Configurar serviços externos (antes de qualquer coisa)

### 1.1 Supabase — pegar a service role key
1. Abrir [supabase.com](https://supabase.com) → seu projeto
2. **Project Settings → API**
3. Copiar a chave **service_role** (não a anon key)
4. Adicionar no `.env.local`:
   ```
   SUPABASE_SERVICE_ROLE_KEY=sua_chave_aqui
   ```

---

### 1.2 Upstash — criar banco Redis (rate limiting)
1. Criar conta em [upstash.com](https://upstash.com) (grátis)
2. **Create Database → Redis → escolher região mais próxima (us-east-1)**
3. Abrir o banco criado → aba **REST API**
4. Copiar os dois valores e adicionar no `.env.local`:
   ```
   UPSTASH_REDIS_REST_URL=https://...upstash.io
   UPSTASH_REDIS_REST_TOKEN=seu_token_aqui
   ```

---

### 1.3 Stripe — criar conta, produto e pegar chaves
1. Criar conta em [stripe.com](https://stripe.com)
2. No painel do Stripe: **Developers → API Keys**
   - Copiar **Publishable key** (`pk_live_...`)
   - Copiar **Secret key** (`sk_live_...`)
3. Criar o produto:
   - **Products → Add product**
   - Nome: `Ixa Pro`

   - Preço: `R$ 19,00` → Recorrente → Mensal
   - Salvar → copiar o **Price ID** (`price_...`)
4. Adicionar no `.env.local`:
   ```
   STRIPE_SECRET_KEY=sk_live_...
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
   STRIPE_PRICE_ID=price_...
   ```
   > O `STRIPE_WEBHOOK_SECRET` você pega na Fase 3, depois do deploy.

---

### 1.4 Resend — domínio de email personalizado
> Sem isso, os emails saem como `onboarding@resend.dev` e vão para spam.

1. [resend.com](https://resend.com) → **Domains → Add Domain**
2. Adicionar seu domínio (ex: `estudo-ia.com.br`)
3. Configurar os registros DNS que o Resend mostrar (TXT/MX)
4. Aguardar verificação (pode levar alguns minutos)
5. Abrir `lib/email.ts` linha 92 e trocar:
   ```
   from: 'Ixa <onboarding@resend.dev>',
   ```
   por:
   ```
   from: 'Ixa <noreply@seudominio.com.br>',
   ```

---

## FASE 2 — Rodar migrations no Supabase

> Rodar os dois arquivos **nesta ordem** no **Supabase → SQL Editor**.

### 2.1 Migration principal (LGPD + profiles + fix constraint)
- Abrir `supabase-lgpd-migration.sql` da raiz do projeto
- Colar no SQL Editor → **Run**
- O que faz:
  - Cria a tabela `profiles` (planos do Stripe)
  - Adiciona `consent_given_at` e `last_block_index` na tabela `notification_settings`
  - Corrige o CHECK constraint de `status` para aceitar `'error'`
  - Ativa RLS na tabela `profiles`

### 2.2 Migration de segurança (RLS — bloquear acesso público)
> ⚠️ **Só rodar depois de confirmar que as API routes estão funcionando.**
> Após isso, qualquer acesso direto via anon key ao banco retorna erro.

- Abrir `supabase-rls-migration.sql` da raiz do projeto
- Colar no SQL Editor → **Run**

---

## FASE 3 — Deploy no Vercel

### 3.1 Fazer o deploy
```bash
vercel deploy --prod
```
> Ou conectar o repositório no painel do Vercel (GitHub → Import).

---

### 3.2 Configurar variáveis de ambiente no Vercel
No painel: **Project → Settings → Environment Variables**

Adicionar todas estas:

| Variável | Onde pegar |
|---|---|
| `GROQ_API_KEY` | Mesmo valor do `.env.local` |
| `RESEND_API_KEY` | Mesmo valor do `.env.local` |
| `CRON_SECRET` | Mesmo valor do `.env.local` (o novo gerado) |
| `NEXT_PUBLIC_APP_URL` | `https://seu-dominio.vercel.app` |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Clerk (chave de produção — ver 3.3) |
| `CLERK_SECRET_KEY` | Clerk (chave de produção — ver 3.3) |
| `NEXT_PUBLIC_CLERK_SIGN_IN_URL` | `/sign-in` |
| `NEXT_PUBLIC_CLERK_SIGN_UP_URL` | `/sign-up` |
| `NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL` | `/dashboard` |
| `NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL` | `/dashboard` |
| `NEXT_PUBLIC_CLERK_SIGN_IN_FORCE_REDIRECT_URL` | `/dashboard` |
| `NEXT_PUBLIC_CLERK_SIGN_UP_FORCE_REDIRECT_URL` | `/dashboard` |
| `NEXT_PUBLIC_SUPABASE_URL` | Mesmo valor do `.env.local` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Mesmo valor do `.env.local` |
| `SUPABASE_SERVICE_ROLE_KEY` | Fase 1.1 |
| `UPSTASH_REDIS_REST_URL` | Fase 1.2 |
| `UPSTASH_REDIS_REST_TOKEN` | Fase 1.2 |
| `STRIPE_SECRET_KEY` | Fase 1.3 |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Fase 1.3 |
| `STRIPE_PRICE_ID` | Fase 1.3 |
| `STRIPE_WEBHOOK_SECRET` | Fase 3.4 (pegar depois) |

---

### 3.3 Ativar produção no Clerk
> As chaves atuais são `pk_test_` / `sk_test_` — só funcionam em dev.

1. [clerk.com](https://clerk.com) → seu app → **Production**
2. Seguir os passos de ativação (configura DNS do domínio)
3. Pegar as novas chaves `pk_live_` e `sk_live_`
4. Atualizar no `.env.local` e no Vercel

---

### 3.4 Configurar webhook do Stripe
> Só é possível depois de ter a URL de produção.

1. Stripe → **Developers → Webhooks → Add endpoint**
2. URL: `https://seu-dominio.vercel.app/api/stripe/webhook`
3. Eventos a selecionar:
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
4. Salvar → copiar o **Signing secret** (`whsec_...`)
5. Adicionar no Vercel:
   ```
   STRIPE_WEBHOOK_SECRET=whsec_...
   ```
6. Fazer um novo deploy para aplicar a variável:
   ```bash
   vercel deploy --prod
   ```

---

## FASE 4 — Verificação pós-deploy

Testar tudo com a URL de produção:

- [ ] Acessar `/dashboard` sem login → redireciona para `/sign-in`
- [ ] Criar conta → vai para `/dashboard`
- [ ] Criar nova sessão com texto → gera blocos
- [ ] Explicar um bloco → recebe avaliação
- [ ] Acessar `/precos` → clicar "Assinar agora" → abre Stripe
- [ ] Pagar com cartão de teste `4242 4242 4242 4242` (validade futura, CVC qualquer)
- [ ] Após pagamento → volta ao dashboard com banner "Plano Pro ativado! 🎉"
- [ ] Ativar notificações em uma sessão → receber email de revisão
- [ ] Verificar headers de segurança em [securityheaders.com](https://securityheaders.com)
- [ ] Fazer 11 requisições em sequência → 11ª retorna erro 429

---

## Opcional — após ter usuários

Estas coisas não bloqueiam o lançamento mas valem fazer quando tiver usuários reais:

- **`maxDuration = 60`** nas rotas `gerar-blocos` e `avaliar-explicacao`
  (evita timeout no Vercel Hobby se a Groq demorar)
  ```ts
  // Adicionar no topo das duas rotas:
  export const maxDuration = 60
  ```

- **Trocar para plano Pro do Vercel** se precisar de mais de 10s de timeout por função

- **Verificar domínio de email** — confirmar que emails chegam sem cair no spam
  (enviar para Gmail e Outlook e checar)

- **Upstash** — verificar no painel se o rate limiting está funcionando

---

> Arquivo gerado em 2026-05-26. Código buildado e auditado.
