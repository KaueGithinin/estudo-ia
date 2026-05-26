-- ═══════════════════════════════════════════════════════
-- Tabela de configurações de notificação por sessão
-- Execute no Supabase → SQL Editor
-- ═══════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS notification_settings (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         TEXT NOT NULL,
  session_id      UUID NOT NULL REFERENCES study_sessions(id) ON DELETE CASCADE,
  user_email      TEXT NOT NULL,
  enabled         BOOLEAN NOT NULL DEFAULT TRUE,
  frequency_hours INTEGER NOT NULL DEFAULT 2,
  last_sent_at    TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, session_id)
);

CREATE INDEX idx_notification_settings_user_id ON notification_settings(user_id);
CREATE INDEX idx_notification_settings_enabled ON notification_settings(enabled);

ALTER TABLE notification_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all" ON notification_settings FOR ALL USING (true);
