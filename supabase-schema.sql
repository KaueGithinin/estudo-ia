-- ═══════════════════════════════════════════════════════════════════════
-- EstudoIA — Schema do Banco de Dados (Supabase / PostgreSQL)
-- Execute esse SQL no Supabase: https://supabase.com → SQL Editor
-- ═══════════════════════════════════════════════════════════════════════

-- ─── Extensões ───────────────────────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ─── Tabela: Sessões de Estudo ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS study_sessions (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     TEXT NOT NULL,           -- ID do Clerk
  title       TEXT NOT NULL,
  original_text TEXT NOT NULL,
  status      TEXT NOT NULL DEFAULT 'processing'
                CHECK (status IN ('processing', 'ready', 'completed')),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_study_sessions_user_id ON study_sessions(user_id);

-- ─── Tabela: Blocos de Conteúdo ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS blocks (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id  UUID NOT NULL REFERENCES study_sessions(id) ON DELETE CASCADE,
  title       TEXT NOT NULL,
  content     TEXT NOT NULL,
  key_points  TEXT[] NOT NULL DEFAULT '{}',
  order_index INTEGER NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_blocks_session_id ON blocks(session_id);

-- ─── Tabela: Reviews (avaliações da explicação do aluno) ─────────────────────
CREATE TABLE IF NOT EXISTS reviews (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  block_id          UUID NOT NULL REFERENCES blocks(id) ON DELETE CASCADE,
  user_id           TEXT NOT NULL,
  user_explanation  TEXT NOT NULL,
  correct_points    TEXT[] NOT NULL DEFAULT '{}',
  missing_points    TEXT[] NOT NULL DEFAULT '{}',
  corrections       JSONB NOT NULL DEFAULT '[]',
  score             INTEGER NOT NULL CHECK (score >= 0 AND score <= 100),
  encouragement     TEXT,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_reviews_block_id ON reviews(block_id);
CREATE INDEX idx_reviews_user_id  ON reviews(user_id);

-- ─── Tabela: Dúvidas (lacunas de aprendizado) ────────────────────────────────
CREATE TABLE IF NOT EXISTS doubts (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     TEXT NOT NULL,
  block_id    UUID NOT NULL REFERENCES blocks(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  resolved    BOOLEAN NOT NULL DEFAULT FALSE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_doubts_user_id ON doubts(user_id);
CREATE INDEX idx_doubts_block_id ON doubts(block_id);

-- ─── Row Level Security (RLS) ─────────────────────────────────────────────────
-- Habilitar RLS em todas as tabelas
ALTER TABLE study_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE blocks          ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews         ENABLE ROW LEVEL SECURITY;
ALTER TABLE doubts          ENABLE ROW LEVEL SECURITY;

-- Por enquanto, permitir acesso público (a autenticação é feita pelo Clerk no backend)
-- ATENÇÃO: Em produção, substitua por políticas baseadas no user_id do Clerk
CREATE POLICY "Allow all" ON study_sessions FOR ALL USING (true);
CREATE POLICY "Allow all" ON blocks          FOR ALL USING (true);
CREATE POLICY "Allow all" ON reviews         FOR ALL USING (true);
CREATE POLICY "Allow all" ON doubts          FOR ALL USING (true);
