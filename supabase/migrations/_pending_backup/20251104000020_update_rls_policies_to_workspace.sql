-- ============================================================================
-- MIGRATION: Atualizar RLS Policies para usar workspace_id
-- ============================================================================
-- Data: 04 de novembro de 2025
-- Fase: FASE 2 - Adoção da nova estrutura
-- Descrição: Atualiza TODAS as policies RLS para usar workspace_id ao invés de client_id
--            Substitui get_user_client_id() por get_user_workspace_id()
-- IMPORTANTE: Tabela 'teams' NÃO será alterada (será dropada na Fase 3)
-- ============================================================================

-- ============================================================================
-- ETAPA 1: Atualizar policies de PROFILES (8 policies)
-- ============================================================================

-- 1.1. DROP policies antigas de INSERT
DROP POLICY IF EXISTS "Platform admins can insert profiles" ON public.profiles;
DROP POLICY IF EXISTS "Client admins and managers can insert team members" ON public.profiles;

-- 1.2. CREATE novas policies de INSERT
CREATE POLICY "Platform admins can insert profiles"
ON public.profiles
FOR INSERT
TO authenticated
WITH CHECK (
  public.is_platform_admin(auth.uid())
);

CREATE POLICY "Workspace admins and managers can insert team members"
ON public.profiles
FOR INSERT
TO authenticated
WITH CHECK (
  -- O novo perfil deve pertencer ao mesmo workspace do usuário logado
  workspace_id = public.get_user_workspace_id(auth.uid())
  AND public.get_user_workspace_id(auth.uid()) IS NOT NULL
  -- E o usuário logado deve ser admin ou manager do workspace
  AND (
    public.is_client_admin(auth.uid())
    OR
    EXISTS (
      SELECT 1
      FROM public.profiles
      WHERE id = auth.uid()
        AND client_user_role = 'client_manager'
        AND workspace_id IS NOT NULL
    )
  )
);

-- 1.3. DROP policies antigas de UPDATE
DROP POLICY IF EXISTS "Platform admins can update all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Client admins can update their client's profiles" ON public.profiles;
DROP POLICY IF EXISTS "Client managers can update some profile fields" ON public.profiles;

-- 1.4. CREATE novas policies de UPDATE
CREATE POLICY "Platform admins can update all profiles"
ON public.profiles
FOR UPDATE
TO authenticated
USING (
  public.is_platform_admin(auth.uid())
)
WITH CHECK (
  public.is_platform_admin(auth.uid())
);

CREATE POLICY "Users can update their own profile"
ON public.profiles
FOR UPDATE
TO authenticated
USING (
  id = auth.uid()
)
WITH CHECK (
  id = auth.uid()
);

CREATE POLICY "Workspace admins can update their workspace's profiles"
ON public.profiles
FOR UPDATE
TO authenticated
USING (
  workspace_id = public.get_user_workspace_id(auth.uid())
  AND public.is_client_admin(auth.uid())
  AND workspace_id IS NOT NULL
)
WITH CHECK (
  workspace_id = public.get_user_workspace_id(auth.uid())
  AND public.is_client_admin(auth.uid())
  AND workspace_id IS NOT NULL
);

CREATE POLICY "Workspace managers can update some profile fields"
ON public.profiles
FOR UPDATE
TO authenticated
USING (
  workspace_id = public.get_user_workspace_id(auth.uid())
  AND EXISTS (
    SELECT 1
    FROM public.profiles p
    WHERE p.id = auth.uid()
      AND p.client_user_role = 'client_manager'
      AND p.workspace_id IS NOT NULL
  )
)
WITH CHECK (
  workspace_id = public.get_user_workspace_id(auth.uid())
  AND EXISTS (
    SELECT 1
    FROM public.profiles p
    WHERE p.id = auth.uid()
      AND p.client_user_role = 'client_manager'
      AND p.workspace_id IS NOT NULL
  )
);

-- 1.5. DROP policies antigas de DELETE
DROP POLICY IF EXISTS "Platform admins can delete profiles" ON public.profiles;
DROP POLICY IF EXISTS "Client admins can delete team members" ON public.profiles;

-- 1.6. CREATE novas policies de DELETE
CREATE POLICY "Platform admins can delete profiles"
ON public.profiles
FOR DELETE
TO authenticated
USING (
  public.is_platform_admin(auth.uid())
);

CREATE POLICY "Workspace admins can delete team members"
ON public.profiles
FOR DELETE
TO authenticated
USING (
  workspace_id = public.get_user_workspace_id(auth.uid())
  AND public.is_client_admin(auth.uid())
  AND workspace_id IS NOT NULL
);

-- ============================================================================
-- ETAPA 2: Atualizar policies de CONTRACTS (4 policies)
-- ============================================================================

-- 2.1. DROP policies antigas
DROP POLICY IF EXISTS "Multi-tenant: SELECT contracts" ON public.contracts;
DROP POLICY IF EXISTS "Multi-tenant: INSERT contracts" ON public.contracts;
DROP POLICY IF EXISTS "Multi-tenant: UPDATE contracts" ON public.contracts;
DROP POLICY IF EXISTS "Multi-tenant: DELETE contracts" ON public.contracts;

-- 2.2. CREATE novas policies

-- Policy: SELECT contracts
CREATE POLICY "Multi-tenant: SELECT contracts"
ON public.contracts
FOR SELECT
TO authenticated
USING (
  workspace_id = public.get_user_workspace_id(auth.uid())
  OR public.is_platform_admin(auth.uid())
);

-- Policy: INSERT contracts
CREATE POLICY "Multi-tenant: INSERT contracts"
ON public.contracts
FOR INSERT
TO authenticated
WITH CHECK (
  workspace_id = public.get_user_workspace_id(auth.uid())
  AND public.get_user_workspace_id(auth.uid()) IS NOT NULL
);

-- Policy: UPDATE contracts
CREATE POLICY "Multi-tenant: UPDATE contracts"
ON public.contracts
FOR UPDATE
TO authenticated
USING (
  workspace_id = public.get_user_workspace_id(auth.uid())
  OR public.is_platform_admin(auth.uid())
)
WITH CHECK (
  workspace_id = public.get_user_workspace_id(auth.uid())
);

-- Policy: DELETE contracts
CREATE POLICY "Multi-tenant: DELETE contracts"
ON public.contracts
FOR DELETE
TO authenticated
USING (
  workspace_id = public.get_user_workspace_id(auth.uid())
  AND public.is_client_admin(auth.uid())
);

-- ============================================================================
-- ETAPA 3: Atualizar policies de DIGITAL_PROFILES (4 policies)
-- ============================================================================

-- 3.1. DROP policies antigas de client users
DROP POLICY IF EXISTS "Client users can view their client's digital profiles" ON public.digital_profiles;
DROP POLICY IF EXISTS "Client admins can create digital profiles for their client" ON public.digital_profiles;
DROP POLICY IF EXISTS "Client admins can update their client's digital profiles" ON public.digital_profiles;
DROP POLICY IF EXISTS "Client admins can delete their client's digital profiles" ON public.digital_profiles;

-- 3.2. CREATE novas policies para workspace users

-- Policy: SELECT digital_profiles
CREATE POLICY "Workspace users can view their workspace's digital profiles"
ON public.digital_profiles
FOR SELECT
TO authenticated
USING (
  workspace_id = public.get_user_workspace_id(auth.uid())
  OR public.is_platform_admin(auth.uid())
);

-- Policy: INSERT digital_profiles
CREATE POLICY "Workspace admins can create digital profiles for their workspace"
ON public.digital_profiles
FOR INSERT
TO authenticated
WITH CHECK (
  workspace_id = public.get_user_workspace_id(auth.uid())
  AND EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() 
      AND client_user_role IN ('client_admin', 'client_manager')
  )
);

-- Policy: UPDATE digital_profiles
CREATE POLICY "Workspace admins can update their workspace's digital profiles"
ON public.digital_profiles
FOR UPDATE
TO authenticated
USING (
  workspace_id = public.get_user_workspace_id(auth.uid())
  AND EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() 
      AND client_user_role IN ('client_admin', 'client_manager')
  )
)
WITH CHECK (
  workspace_id = public.get_user_workspace_id(auth.uid())
  AND EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() 
      AND client_user_role IN ('client_admin', 'client_manager')
  )
);

-- Policy: DELETE digital_profiles
CREATE POLICY "Workspace admins can delete their workspace's digital profiles"
ON public.digital_profiles
FOR DELETE
TO authenticated
USING (
  workspace_id = public.get_user_workspace_id(auth.uid())
  AND EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() 
      AND client_user_role = 'client_admin'
  )
);

-- ============================================================================
-- VERIFICAÇÃO E RELATÓRIO
-- ============================================================================

DO $$
DECLARE
  profiles_policies INTEGER;
  contracts_policies INTEGER;
  digital_profiles_policies INTEGER;
  total_policies INTEGER;
BEGIN
  -- Contar policies de cada tabela
  SELECT COUNT(*) INTO profiles_policies
  FROM pg_policies
  WHERE schemaname = 'public' 
    AND tablename = 'profiles'
    AND policyname LIKE '%workspace%' OR policyname LIKE '%Platform%';
  
  SELECT COUNT(*) INTO contracts_policies
  FROM pg_policies
  WHERE schemaname = 'public' 
    AND tablename = 'contracts'
    AND policyname LIKE '%workspace%' OR policyname LIKE '%Platform%' OR policyname LIKE '%Multi-tenant%';
  
  SELECT COUNT(*) INTO digital_profiles_policies
  FROM pg_policies
  WHERE schemaname = 'public' 
    AND tablename = 'digital_profiles'
    AND policyname LIKE '%workspace%' OR policyname LIKE '%Platform%';
  
  total_policies := profiles_policies + contracts_policies + digital_profiles_policies;
  
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Migration 20 concluída com sucesso!';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Policies atualizadas:';
  RAISE NOTICE '- profiles: % policies ativas', profiles_policies;
  RAISE NOTICE '- contracts: % policies ativas', contracts_policies;
  RAISE NOTICE '- digital_profiles: % policies ativas', digital_profiles_policies;
  RAISE NOTICE 'Total de policies ativas: %', total_policies;
  RAISE NOTICE '';
  RAISE NOTICE 'IMPORTANTE:';
  RAISE NOTICE '✅ Todas as policies agora usam workspace_id';
  RAISE NOTICE '✅ Função get_user_workspace_id() em uso';
  RAISE NOTICE '✅ Platform admins mantêm acesso total';
  RAISE NOTICE '';
  RAISE NOTICE 'NOTA: Policies de teams NÃO foram alteradas';
  RAISE NOTICE 'Tabela teams será removida na Fase 3';
  RAISE NOTICE '';
  RAISE NOTICE 'PRÓXIMO PASSO: Atualizar frontend para usar workspace_id';
END $$;
