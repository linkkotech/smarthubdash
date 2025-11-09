-- =================================================================
-- SCRIPT DE VALIDAÇÃO: Migration 06 - RLS Recursion Fix
-- =================================================================
-- Data: 06 de novembro de 2025
-- Descrição: Validar se a recursão infinita foi resolvida
-- =================================================================

-- ETAPA 1: Verificar se as funções SECURITY DEFINER existem
\echo '=== Verificando funções SECURITY DEFINER ==='
SELECT 
  routine_name,
  routine_type,
  security_type
FROM information_schema.routines 
WHERE routine_schema = 'public'
  AND routine_name IN ('user_is_workspace_member', 'user_can_manage_workspace')
  AND security_type = 'SECURITY DEFINER';

-- ETAPA 2: Testar a função user_is_workspace_member
\echo '=== Testando função user_is_workspace_member ==='
-- Teste com usuário existente e workspace existente
SELECT 
  public.user_is_workspace_member(
    '00000000-0000-0000-0000-000000000000'::uuid,  -- Substituir por user_id real
    '00000000-0000-0000-0000-000000000000'::uuid   -- Substituir por workspace_id real
  ) as result;

-- ETAPA 3: Verificar as políticas RLS atuais
\echo '=== Verificando políticas RLS atuais ==='
SELECT 
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies 
WHERE schemaname = 'public' 
  AND tablename = 'workspace_members'
ORDER BY policyname;

-- ETAPA 4: Testar query que causava recursão (antes da correção)
\echo '=== Testando query sem recursão ==='
-- Esta query NÃO deve causar loop infinito
EXPLAIN ANALYZE
SELECT 
  wm.id,
  wm.role,
  wm.workspace_id,
  wm.profile_id,
  p.full_name,
  p.email
FROM public.workspace_members wm
JOIN public.profiles p ON wm.profile_id = p.id
WHERE wm.workspace_id = '00000000-0000-0000-0000-000000000000'  -- Substituir por workspace_id real
  AND wm.profile_id = '00000000-0000-0000-0000-000000000000';   -- Substituir por user_id real

-- ETAPA 5: Verificar performance da query
\echo '=== Verificando performance da query ==='
-- Esta query deve ser rápida (< 100ms)
SELECT 
  query,
  calls,
  total_time,
  mean_time,
  rows
FROM pg_stat_statements 
WHERE query LIKE '%workspace_members%'
  AND query LIKE '%workspace_id%'
ORDER BY total_time DESC
LIMIT 10;

-- ETAPA 6: Testar permissões de acesso
\echo '=== Testando permissões de acesso ==='
-- Verificar se as políticas estão funcionando corretamente
SELECT 
  'Teste de acesso a workspace_members' as test_description,
  EXISTS (
    SELECT 1 
    FROM public.workspace_members 
    WHERE workspace_id = '00000000-0000-0000-0000-000000000000'  -- Substituir por workspace_id real
  ) as has_members;

-- ETAPA 7: Verificar integridade dos dados
\echo '=== Verificando integridade dos dados ==='
-- Verificar se todos os workspace_members têm workspace válido
SELECT 
  COUNT(*) as total_members,
  COUNT(CASE WHEN w.id IS NULL THEN 1 END) as orphaned_members
FROM public.workspace_members wm
LEFT JOIN public.workspaces w ON wm.workspace_id = w.id;

-- ETAPA 8: Verificar se há triggers relacionados
\echo '=== Verificando triggers relacionados ==='
SELECT 
  trigger_name,
  event_manipulation,
  event_object_table,
  action_timing,
  action_condition
FROM information_schema.triggers 
WHERE event_object_table = 'workspace_members'
  AND trigger_schema = 'public';

-- ETAPA 9: Relatório final
\echo '=== RELATÓRIO FINAL DE VALIDAÇÃO ==='
DO $$
DECLARE
  function_count INTEGER;
  policy_count INTEGER;
  performance_ok BOOLEAN;
  data_integrity_ok BOOLEAN;
BEGIN
  -- Contar funções SECURITY DEFINER
  SELECT COUNT(*) INTO function_count
  FROM information_schema.routines 
  WHERE routine_schema = 'public'
    AND routine_name IN ('user_is_workspace_member', 'user_can_manage_workspace')
    AND security_type = 'SECURITY DEFINER';
  
  -- Contar políticas RLS
  SELECT COUNT(*) INTO policy_count
  FROM pg_policies 
  WHERE schemaname = 'public' 
    AND tablename = 'workspace_members';
  
  -- Verificar performance (assumindo que < 100ms é aceitável)
  SELECT EXISTS (
    SELECT 1 FROM pg_stat_statements 
    WHERE query LIKE '%workspace_members%'
      AND mean_time < 100
  ) INTO performance_ok;
  
  -- Verificar integridade de dados
  SELECT EXISTS (
    SELECT 1 FROM workspace_members wm
    LEFT JOIN workspaces w ON wm.workspace_id = w.id
    WHERE w.id IS NULL
  ) INTO data_integrity_ok;
  
  RAISE NOTICE '========================================';
  RAISE NOTICE 'VALIDAÇÃO MIGRATION 06 - RESULTADOS';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Funções SECURITY DEFINER: % encontradas', function_count;
  RAISE NOTICE 'Políticas RLS: % encontradas', policy_count;
  RAISE NOTICE 'Performance OK: %', performance_ok;
  RAISE NOTICE 'Integridade de dados OK: %', data_integrity_ok;
  
  IF function_count = 2 AND policy_count > 0 AND performance_ok AND data_integrity_ok THEN
    RAISE NOTICE '✅ MIGRATION 06 - VALIDAÇÃO BEM-SUCEDIDA';
  ELSE
    RAISE NOTICE '❌ MIGRATION 06 - VALIDAÇÃO FALHOU - VERIFICAR OS ITENS ACIMA';
  END IF;
  RAISE NOTICE '========================================';
END $$;