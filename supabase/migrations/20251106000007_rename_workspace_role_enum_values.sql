-- ============================================================================
-- MIGRATION: Renomear valores do enum workspace_role
-- ============================================================================
-- Data: 06 de novembro de 2025
-- Descrição: Renomeia os valores do enum workspace_role de:
--            'owner', 'manager', 'user'
--            para:
--            'work_owner', 'work_manager', 'work_user'
-- ============================================================================

-- ============================================================================
-- ETAPA 1: Criar novo enum com novos valores
-- ============================================================================

CREATE TYPE public.workspace_role_new AS ENUM ('work_owner', 'work_manager', 'work_user');

-- ============================================================================
-- ETAPA 2: Converter coluna na tabela workspace_members
-- ============================================================================

-- Converter dados existentes usando CASE statement
ALTER TABLE public.workspace_members
  ALTER COLUMN role TYPE public.workspace_role_new USING (
    CASE 
      WHEN role::text = 'owner' THEN 'work_owner'::public.workspace_role_new
      WHEN role::text = 'manager' THEN 'work_manager'::public.workspace_role_new
      WHEN role::text = 'user' THEN 'work_user'::public.workspace_role_new
      ELSE 'work_user'::public.workspace_role_new
    END
  );

-- ============================================================================
-- ETAPA 3: Dropar enum antigo e renomear o novo
-- ============================================================================

DROP TYPE public.workspace_role;
ALTER TYPE public.workspace_role_new RENAME TO workspace_role;

-- ============================================================================
-- ETAPA 4: Atualizar DEFAULT do campo role
-- ============================================================================

ALTER TABLE public.workspace_members
  ALTER COLUMN role DROP DEFAULT;

ALTER TABLE public.workspace_members
  ALTER COLUMN role SET DEFAULT 'work_user'::public.workspace_role;

-- ============================================================================
-- ETAPA 5: Atualizar funções que referem os valores antigos
-- ============================================================================

-- Atualizar is_workspace_member (sem mudança necessária, apenas usa EXISTS)
-- Atualizar can_manage_members
CREATE OR REPLACE FUNCTION public.can_manage_members(
  _profile_id UUID,
  _workspace_id UUID
)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.workspace_members
    WHERE profile_id = _profile_id
      AND workspace_id = _workspace_id
      AND role IN ('work_owner', 'work_manager')
  );
$$;

-- Atualizar is_workspace_owner
CREATE OR REPLACE FUNCTION public.is_workspace_owner(
  _profile_id UUID,
  _workspace_id UUID
)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.workspace_members
    WHERE profile_id = _profile_id
      AND workspace_id = _workspace_id
      AND role = 'work_owner'
  );
$$;

-- Atualizar count_workspace_owners
CREATE OR REPLACE FUNCTION public.count_workspace_owners(
  _workspace_id UUID
)
RETURNS INTEGER
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COUNT(*)::INTEGER
  FROM public.workspace_members
  WHERE workspace_id = _workspace_id
    AND role = 'work_owner';
$$;

-- Atualizar user_can_manage_workspace
CREATE OR REPLACE FUNCTION public.user_can_manage_workspace(
  _user_id UUID,
  _workspace_id UUID
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 
    FROM public.workspace_members 
    WHERE profile_id = _user_id 
    AND workspace_id = _workspace_id
    AND role IN ('work_owner', 'work_manager')
  );
END;
$$;

-- ============================================================================
-- ETAPA 6: Atualizar RLS policies
-- ============================================================================

-- Remover policies antigas que referem valores específicos
DROP POLICY IF EXISTS "Owners and managers can add members" ON public.workspace_members;
DROP POLICY IF EXISTS "Owners and managers can update member roles" ON public.workspace_members;
DROP POLICY IF EXISTS "Only owners can remove members" ON public.workspace_members;

-- Recreiar policies com novos valores

CREATE POLICY "Owners and managers can add members"
ON public.workspace_members
FOR INSERT
TO authenticated
WITH CHECK (
  public.user_can_manage_workspace(auth.uid(), workspace_id)
);

CREATE POLICY "Owners and managers can update member roles"
ON public.workspace_members
FOR UPDATE
TO authenticated
USING (
  public.user_can_manage_workspace(auth.uid(), workspace_id)
)
WITH CHECK (
  public.user_can_manage_workspace(auth.uid(), workspace_id)
);

CREATE POLICY "Only owners can remove members"
ON public.workspace_members
FOR DELETE
TO authenticated
USING (
  workspace_members.profile_id != auth.uid()
  AND public.is_workspace_owner(auth.uid(), workspace_id)
);

-- ============================================================================
-- VERIFICAÇÃO
-- ============================================================================

DO $$
BEGIN
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Migration 07: Workspace role enum atualizado';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Valores antigos → Novos:';
  RAISE NOTICE '  owner → work_owner';
  RAISE NOTICE '  manager → work_manager';
  RAISE NOTICE '  user → work_user';
  RAISE NOTICE '';
  RAISE NOTICE 'Funções atualizadas:';
  RAISE NOTICE '  - can_manage_members';
  RAISE NOTICE '  - is_workspace_owner';
  RAISE NOTICE '  - count_workspace_owners';
  RAISE NOTICE '  - user_can_manage_workspace';
  RAISE NOTICE '';
  RAISE NOTICE 'RLS policies atualizadas';
END $$;

-- ============================================================================
-- FIM DA MIGRATION
-- ============================================================================
