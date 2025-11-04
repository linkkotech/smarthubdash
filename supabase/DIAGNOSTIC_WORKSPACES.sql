-- ============================================================================
-- QUERY DE DIAGNÓSTICO: Verificar estado das tabelas workspaces
-- ============================================================================
-- Execute no Supabase SQL Editor para diagnosticar por que não há workspaces
-- ============================================================================

-- 1. Verificar se há workspaces na tabela
SELECT 
  'workspaces' as tabela,
  COUNT(*) as total
FROM public.workspaces;

-- 2. Verificar workspaces com detalhes
SELECT 
  id,
  name,
  slug,
  client_type,
  document,
  created_at
FROM public.workspaces
ORDER BY created_at DESC
LIMIT 10;

-- 3. Verificar se há workspace_members
SELECT 
  'workspace_members' as tabela,
  COUNT(*) as total,
  COUNT(CASE WHEN role = 'owner' THEN 1 END) as owners
FROM public.workspace_members;

-- 4. Verificar workspace_members com detalhes
SELECT 
  wm.id,
  wm.workspace_id,
  wm.profile_id,
  wm.role,
  p.full_name,
  p.email,
  w.name as workspace_name
FROM public.workspace_members wm
LEFT JOIN public.profiles p ON wm.profile_id = p.id
LEFT JOIN public.workspaces w ON wm.workspace_id = w.id
ORDER BY wm.created_at DESC
LIMIT 10;

-- 5. Verificar workspaces COM owners (simulando a query do frontend)
SELECT 
  w.id,
  w.name,
  w.client_type,
  w.document,
  w.created_at,
  p.full_name as owner_name,
  p.email as owner_email
FROM public.workspaces w
INNER JOIN public.workspace_members wm ON w.id = wm.workspace_id AND wm.role = 'owner'
INNER JOIN public.profiles p ON wm.profile_id = p.id
ORDER BY w.created_at DESC;

-- 6. Verificar se o usuário atual tem acesso (substitua USER_ID pelo seu)
-- SELECT 
--   w.id,
--   w.name,
--   wm.role
-- FROM public.workspaces w
-- INNER JOIN public.workspace_members wm ON w.id = wm.workspace_id
-- WHERE wm.profile_id = 'SEU_USER_ID_AQUI';
