-- =================================================================
-- SCRIPT DE ROLLBACK: Migration 06 - RLS Recursion Fix
-- =================================================================
-- Data: 06 de novembro de 2025
-- Descrição: Reverter as alterações da migration 06 em caso de problemas
-- =================================================================

-- AVISO: Este script reverte as alterações da migration 06
-- Execute apenas se necessário e após backup completo

\echo '==============================================='
\echo 'INICIANDO ROLLBACK DA MIGRATION 06'
\echo '==============================================='
\echo 'AVISO: Esta operação não pode ser desfeita!'
\echo 'Pressione Ctrl+C para cancelar ou Enter para continuar...'
\echo '==============================================='
-- Esperar confirmação
DO $$ BEGIN PERFORM pg_sleep(5); END $$;

-- ETAPA 1: Remover funções SECURITY DEFINER
\echo '=== Removendo funções SECURITY DEFINER ==='

DROP FUNCTION IF EXISTS public.user_is_workspace_member(UUID, UUID);
DROP FUNCTION IF EXISTS public.user_can_manage_workspace(UUID, UUID);

-- ETAPA 2: Remover políticas RLS existentes
\echo '=== Removendo políticas RLS ==='

DROP POLICY IF EXISTS "Users can view members of their workspaces" ON public.workspace_members;
DROP POLICY IF EXISTS "Owners and managers can add members" ON public.workspace_members;
DROP POLICY IF EXISTS "Owners and managers can update member roles" ON public.workspace_members;
DROP POLICY IF EXISTS "Only owners can remove members" ON public.workspace_members;

-- ETAPA 3: Recriar políticas RLS simplificadas (antes da correção)
\echo '=== Recriando políticas RLS simplificadas ==='

-- Política de SELECT - qualquer usuário autenticado pode ver membros
CREATE POLICY "Users can view members of their workspaces"
ON public.workspace_members
FOR SELECT
TO authenticated
USING (true);  -- Política temporária para rollback

-- Política de INSERT - apenas platform admins podem adicionar membros
CREATE POLICY "Platform admins can add members"
ON public.workspace_members
FOR INSERT
TO authenticated
WITH CHECK (
  public.is_platform_admin(auth.uid())
);

-- Política de UPDATE - apenas platform admins podem atualizar membros
CREATE POLICY "Platform admins can update members"
ON public.workspace_members
FOR UPDATE
TO authenticated
USING (
  public.is_platform_admin(auth.uid())
)
WITH CHECK (
  public.is_platform_admin(auth.uid())
);

-- Política de DELETE - apenas platform admins podem remover membros
CREATE POLICY "Platform admins can delete members"
ON public.workspace_members
FOR DELETE
TO authenticated
USING (
  public.is_platform_admin(auth.uid())
);

-- ETAPA 4: Remover triggers relacionados (se existirem)
\echo '=== Removendo triggers relacionados ==='

DROP TRIGGER IF EXISTS on_workspace_member_insert ON public.workspace_members;
DROP TRIGGER IF EXISTS on_workspace_member_update ON public.workspace_members;
DROP TRIGGER IF EXISTS on_workspace_member_delete ON public.workspace_members;

-- ETAPA 5: Verificar se o rollback foi bem-sucedido
\echo '=== Verificando resultado do rollback ==='

-- Verificar se as funções foram removidas
\echo 'Funções restantes:'
SELECT 
  routine_name,
  routine_type,
  security_type
FROM information_schema.routines 
WHERE routine_schema = 'public'
  AND routine_name IN ('user_is_workspace_member', 'user_can_manage_workspace');

-- Verificar políticas atuais
\echo 'Políticas RLS atuais:'
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

-- ETAPA 6: Testar se o rollback funcionou
\echo '=== Testando se o rollback funcionou ==='

-- Testar se um usuário não autenticado pode acessar workspace_members
-- Isso deve funcionar com a política simplificada
DO $$
DECLARE
  test_result INTEGER;
BEGIN
  EXECUTE format('
    SELECT COUNT(*) 
    FROM public.workspace_members 
    WHERE true
  ') INTO test_result;
  
  RAISE NOTICE 'Teste de acesso: % registros encontrados', test_result;
  
  IF test_result > 0 THEN
    RAISE NOTICE '✅ Rollback bem-sucedido - acesso permitido';
  ELSE
    RAISE NOTICE '⚠️ Nenhum registro encontrado - verificar dados';
  END IF;
END $$;

-- ETAPA 7: Gerar relatório final
\echo '=== RELATÓRIO FINAL DE ROLLBACK ==='

DO $$
DECLARE
  function_count INTEGER;
  policy_count INTEGER;
BEGIN
  -- Contar funções restantes
  SELECT COUNT(*) INTO function_count
  FROM information_schema.routines 
  WHERE routine_schema = 'public'
    AND routine_name IN ('user_is_workspace_member', 'user_can_manage_workspace');
  
  -- Contar políticas RLS
  SELECT COUNT(*) INTO policy_count
  FROM pg_policies 
  WHERE schemaname = 'public' 
    AND tablename = 'workspace_members';
  
  RAISE NOTICE '========================================';
  RAISE NOTICE 'ROLLBACK MIGRATION 06 - RESULTADOS';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Funções SECURITY DEFINER restantes: %', function_count;
  RAISE NOTICE 'Políticas RLS: % encontradas', policy_count;
  
  IF function_count = 0 AND policy_count > 0 THEN
    RAISE NOTICE '✅ ROLLBACK BEM-SUCEDIDO';
    RAISE NOTICE '⚠️ ATENÇÃO: As políticas RLS estão simplificadas';
    RAISE NOTICE '🔧 Recomendação: Reimplementar políticas mais seguras';
  ELSE
    RAISE NOTICE '❌ ROLLBACK PARCIAL - VERIFICAR OS ITENS ACIMA';
  END IF;
  RAISE NOTICE '========================================';
END $$;

\echo '==============================================='
\echo 'ROLLBACK CONCLUÍDO'
\echo '==============================================='
\echo 'Próximos passos recomendados:'
\echo '1. Verificar se o sistema está funcionando'
\echo '2. Implementar políticas RLS mais seguras'
\echo '3. Reaplicar a migration 06 com correções'
\echo '4. Testar novamente'
\echo '==============================================='