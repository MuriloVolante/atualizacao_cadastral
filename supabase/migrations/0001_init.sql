-- Schema da Plataforma de Formulários (v1.0)
-- Aplicado no projeto Supabase: beiejxqnulrmtnzgioml
-- Tabelas, RLS, view de contagem, bucket de anexos e RPC de envio público.
-- O conteúdo aplicado está descrito no README.

-- 0002: tabela public.profiles, RPCs admin_create_user/admin_update_user/
-- admin_reset_password/admin_delete_user/finish_password_change (SECURITY DEFINER,
-- restritas ao papel authenticated). Senha padrão: formularios2026.
