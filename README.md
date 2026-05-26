# 🧠 EstudoIA

> SaaS de estudo com Active Recall + IA. Cole um conteúdo, explique com suas palavras, e descubra o que você realmente sabe.

---

## ✅ Pré-requisitos

- Node.js instalado (já está no seu PC)
- Conta no [Anthropic Console](https://console.anthropic.com) (para a API do Claude)
- Conta no [Clerk](https://clerk.com) (autenticação)
- Conta no [Supabase](https://supabase.com) (banco de dados)
- Conta no [Vercel](https://vercel.com) (deploy — opcional para desenvolvimento local)

---

## 🚀 Configuração em 4 passos

### Passo 1 — Banco de dados (Supabase)

1. Acesse https://supabase.com e crie um projeto
2. Vá em **SQL Editor** → **New query**
3. Cole todo o conteúdo do arquivo `supabase-schema.sql` e execute
4. Vá em **Settings** → **API** e copie:
   - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public key` → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### Passo 2 — Autenticação (Clerk)

1. Acesse https://clerk.com e crie um **Application**
2. Escolha os métodos de login (Google recomendado + Email)
3. Em **API Keys**, copie:
   - `Publishable key` → `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
   - `Secret key` → `CLERK_SECRET_KEY`

### Passo 3 — IA (Anthropic/Claude)

1. Acesse https://console.anthropic.com
2. Vá em **API Keys** → **Create Key**
3. Copie a chave → `ANTHROPIC_API_KEY`

### Passo 4 — Configurar variáveis de ambiente

Edite o arquivo `.env.local` na raiz do projeto e substitua os valores com `COLOQUE_...` pelas chaves reais.

---

## 💻 Rodar localmente

```bash
npm run dev
```

Abra http://localhost:3000

---

## 🌐 Deploy no Vercel

1. Acesse https://vercel.com → **New Project**
2. Importe a pasta `estudo-ia` (ou via GitHub)
3. Em **Environment Variables**, adicione todas as variáveis do `.env.local`
4. Clique em **Deploy**

---

## 📁 Estrutura do projeto

```
estudo-ia/
├── app/
│   ├── page.tsx                    # Landing page
│   ├── layout.tsx                  # Layout global (Clerk + fonte)
│   ├── dashboard/page.tsx          # Lista de sessões do usuário
│   ├── nova-sessao/page.tsx        # Criar nova sessão (colar texto)
│   ├── sessao/[id]/page.tsx        # Blocos de uma sessão
│   ├── sessao/[id]/bloco/[blocoId]/page.tsx  # Estudar um bloco
│   ├── minhas-duvidas/page.tsx     # Lacunas de aprendizado
│   ├── (auth)/sign-in/             # Página de login (Clerk)
│   ├── (auth)/sign-up/             # Página de cadastro (Clerk)
│   └── api/
│       ├── gerar-blocos/route.ts   # POST: Claude gera blocos
│       ├── avaliar-explicacao/route.ts  # POST: Claude avalia explicação
│       └── duvidas/route.ts        # GET/PATCH: dúvidas do usuário
├── lib/
│   ├── anthropic.ts                # Prompts e chamadas ao Claude API
│   ├── supabase.ts                 # Cliente do Supabase
│   └── types.ts                    # Tipos TypeScript
├── middleware.ts                    # Proteção de rotas (Clerk)
├── supabase-schema.sql             # SQL para criar as tabelas
└── .env.local                      # Variáveis de ambiente (NÃO commitar!)
```

---

## 🗺️ Roadmap

- [x] MVP: texto → blocos → active recall → avaliação → dúvidas
- [ ] Input por link do YouTube (transcrição automática)
- [ ] Notificações por email com dúvidas pendentes (Resend)
- [ ] Dashboard com estatísticas de progresso
- [ ] App mobile (React Native / Expo)
- [ ] Monetização com Stripe
