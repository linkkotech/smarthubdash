-- ============================================================================
-- VALIDAÇÃO - Migração Fase 1
-- ============================================================================
-- Execute esta query no Supabase SQL Editor para validar os dados migrados
-- ============================================================================

-- Query 1: Estatísticas gerais
SELECT 
  'workspaces' as tabela,
  COUNT(*) as total,
  COUNT(CASE WHEN client_type IS NOT NULL THEN 1 END) as com_client_type,
  COUNT(CASE WHEN document IS NOT NULL THEN 1 END) as com_document
FROM workspaces

UNION ALL

SELECT 
  'profiles com workspace_id',
  COUNT(*),
  COUNT(CASE WHEN workspace_id IS NOT NULL THEN 1 END),
  NULL
FROM profiles

UNION ALL

SELECT 
  'contracts com workspace_id',
  COUNT(*),
  COUNT(CASE WHEN workspace_id IS NOT NULL THEN 1 END),
  NULL
FROM contracts

UNION ALL

SELECT 
  'workspace_teams',
  COUNT(*),
  NULL,
  NULL
FROM workspace_teams

UNION ALL

SELECT 
  'workspace_members',
  COUNT(*),
  COUNT(CASE WHEN role = 'owner' THEN 1 END) as owners,
  NULL
FROM workspace_members;

-- ============================================================================

-- Query 2: Verificar integridade (workspace_id deve corresponder ao client_id)
SELECT 
  'profiles_integrity' as check_name,
  COUNT(*) as inconsistencias
FROM profiles
WHERE client_id IS NOT NULL 
  AND workspace_id IS NOT NULL 
  AND client_id != workspace_id

UNION ALL

SELECT 
  'contracts_integrity',
  COUNT(*)
FROM contracts
WHERE client_id IS NOT NULL 
  AND workspace_id IS NOT NULL 
  AND client_id != workspace_id;

-- ============================================================================

-- Query 3: Verificar se todos os workspaces têm slug único
SELECT 
  slug,
  COUNT(*) as duplicates
FROM workspaces
GROUP BY slug
HAVING COUNT(*) > 1;

-- ============================================================================

-- Query 4: Verificar funções criadas
SELECT 
  routine_name,
  routine_type,
  security_type
FROM information_schema.routines
WHERE routine_schema = 'public'
  AND routine_name IN ('get_user_workspace_id', 'get_current_user_workspace_id')
ORDER BY routine_name;

-- ============================================================================

-- Query 5: Verificar que workspace_teams correspondem aos teams
SELECT 
  'workspace_teams_integrity' as check_name,
  COUNT(*) as inconsistencias
FROM teams t
LEFT JOIN workspace_teams wt ON wt.id = t.id
WHERE wt.id IS NULL;

-- ============================================================================

-- Query 6: Listar primeiros 5 workspaces criados
SELECT 
  w.id,
  w.name,
  w.slug,
  w.client_type,
  w.document,
  (SELECT COUNT(*) FROM profiles WHERE workspace_id = w.id) as total_profiles,
  (SELECT COUNT(*) FROM workspace_teams WHERE workspace_id = w.id) as total_teams
FROM workspaces w
ORDER BY w.created_at
LIMIT 5;
