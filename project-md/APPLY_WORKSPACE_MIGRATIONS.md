-- ============================================================================
-- APLICAÇÃO MANUAL: Migrations 20251104000002 e 20251104000003
-- ============================================================================
-- Execute este arquivo completo via Supabase Dashboard > SQL Editor
-- ============================================================================

-- Leia o conteúdo completo de:
-- 1. supabase/migrations/20251104000002_create_workspaces_table.sql
-- 2. supabase/migrations/20251104000003_create_workspace_members_table.sql

-- IMPORTANTE: Copie e cole o conteúdo completo de cada arquivo acima
-- diretamente no SQL Editor do Supabase Dashboard e execute.

-- Após executar, registre as migrations manualmente:
INSERT INTO supabase_migrations.schema_migrations (version, statements, name)
VALUES 
  ('20251104000002', ARRAY[]::text[], 'create_workspaces_table'),
  ('20251104000003', ARRAY[]::text[], 'create_workspace_members_table');
