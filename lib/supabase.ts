/**
 * ⚠️  NÃO USAR ESTE ARQUIVO
 *
 * Este cliente usa a anon key pública e não deve ser importado em nenhum lugar.
 * Toda interação com o banco passa pelo supabaseAdmin em lib/supabase-server.ts,
 * que usa a service role key e está restrito às API routes server-side.
 *
 * Após rodar supabase-rls-migration.sql, queries via anon key retornam erro 403.
 */

export {}
