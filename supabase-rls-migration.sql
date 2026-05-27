-- ============================================================
-- MIGRATION: Trocar RLS "Allow all" por "deny_public"
-- Executar no Supabase SQL Editor APÓS implementar as API routes
-- com supabaseAdmin (service role key).
--
-- ATENÇÃO: Após rodar isso, qualquer query via anon key retorna
-- vazio/erro. Toda a lógica de dados passa pelas API routes.
-- ============================================================

-- Remover policies permissivas
DROP POLICY IF EXISTS "Allow all" ON study_sessions;
DROP POLICY IF EXISTS "Allow all" ON blocks;
DROP POLICY IF EXISTS "Allow all" ON reviews;
DROP POLICY IF EXISTS "Allow all" ON doubts;
DROP POLICY IF EXISTS "Allow all" ON notification_settings;

-- Bloquear acesso público via anon key
CREATE POLICY "deny_public" ON study_sessions FOR ALL USING (false);
CREATE POLICY "deny_public" ON blocks FOR ALL USING (false);
CREATE POLICY "deny_public" ON reviews FOR ALL USING (false);
CREATE POLICY "deny_public" ON doubts FOR ALL USING (false);
CREATE POLICY "deny_public" ON notification_settings FOR ALL USING (false);
