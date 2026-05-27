-- ============================================================
-- MIGRATION: LGPD + colunas faltantes + fix CHECK constraint
-- Executar no Supabase SQL Editor
-- ============================================================

-- Consentimento de email (LGPD Art. 7º)
ALTER TABLE notification_settings
  ADD COLUMN IF NOT EXISTS consent_given_at TIMESTAMPTZ;

-- Índice do último bloco enviado (pode estar faltando)
ALTER TABLE notification_settings
  ADD COLUMN IF NOT EXISTS last_block_index INTEGER DEFAULT -1;

-- Adicionar status 'error' ao CHECK constraint de study_sessions
-- (necessário para sessões que falharam durante processamento da IA)
ALTER TABLE study_sessions
  DROP CONSTRAINT IF EXISTS study_sessions_status_check;
ALTER TABLE study_sessions
  ADD CONSTRAINT study_sessions_status_check
    CHECK (status IN ('processing', 'ready', 'completed', 'error'));

-- Tabela de perfis para planos (Stripe)
CREATE TABLE IF NOT EXISTS profiles (
  user_id TEXT PRIMARY KEY,
  plan TEXT NOT NULL DEFAULT 'free',
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "deny_public" ON profiles;
CREATE POLICY "deny_public" ON profiles FOR ALL USING (false);
