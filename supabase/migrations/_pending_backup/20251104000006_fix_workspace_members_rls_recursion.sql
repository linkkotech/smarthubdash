-- ============================================================================
-- MIGRATION: Corrigir recursão infinita nas políticas RLS de workspace_members
-- ============================================================================
-- Data: 04 de novembro de 2025
-- Problema: Políticas RLS fazem SELECT na própria tabela workspace_members,
--           causando recursão infinita quando tentamos fazer queries.
-- Solução: Usar funções SECURITY DEFINER que bypassam RLS ao verificar permissões.
-- ============================================================================

-- ============================================================================
-- ETAPA 1: CRIAR FUNÇÕES HELPER COM SECURITY DEFINER
-- ============================================================================

/**
 * Função: user_is_workspace_member
 * 
 * Verifica se um usuário é membro de um workspace.
 * Usa SECURITY DEFINER para evitar recursão infinita nas políticas RLS.
 * 
 * @param _user_id UUID - ID do usuário (profile_id)
 * @param _workspace_id UUID - ID do workspace
 * @returns BOOLEAN - true se for membro
 */
CREATE OR REPLACE FUNCTION public.user_is_workspace_member(
  _user_id UUID,
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
    WHERE profile_id = _user_id
      AND workspace_id = _workspace_id
  );
$$;

/**
 * Função: user_can_manage_workspace
 * 
 * Verifica se um usuário pode gerenciar um workspace (owner ou manager).
 * Usa SECURITY DEFINER para evitar recursão infinita nas políticas RLS.
 * 
 * @param _user_id UUID - ID do usuário (profile_id)
 * @param _workspace_id UUID - ID do workspace
 * @returns BOOLEAN - true se for owner ou manager
 */
CREATE OR REPLACE FUNCTION public.user_can_manage_workspace(
  _user_id UUID,
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
    WHERE profile_id = _user_id
      AND workspace_id = _workspace_id
      AND role IN ('owner', 'manager')
  );
$$;

-- ============================================================================
-- ETAPA 2: RECRIAR POLÍTICAS RLS COM FUNÇÕES SECURITY DEFINER
-- ============================================================================

-- Remover políticas antigas
DROP POLICY IF EXISTS "Users can view members of their workspaces" ON public.workspace_members;
DROP POLICY IF EXISTS "Owners and managers can add members" ON public.workspace_members;
DROP POLICY IF EXISTS "Owners and managers can update member roles" ON public.workspace_members;
DROP POLICY IF EXISTS "Only owners can remove members" ON public.workspace_members;

-- Criar novas políticas usando funções SECURITY DEFINER

/**
 * Política: SELECT - "Users can view members of their workspaces"
 * Usa função SECURITY DEFINER para evitar recursão
 */
CREATE POLICY "Users can view members of their workspaces"
ON public.workspace_members
FOR SELECT
TO authenticated
USING (
  public.user_is_workspace_member(auth.uid(), workspace_id)
);

/**
 * Política: INSERT - "Owners and managers can add members"
 * Usa função SECURITY DEFINER para evitar recursão
 */
CREATE POLICY "Owners and managers can add members"
ON public.workspace_members
FOR INSERT
TO authenticated
WITH CHECK (
  public.user_can_manage_workspace(auth.uid(), workspace_id)
);

/**
 * Política: UPDATE - "Owners and managers can update member roles"
 * Usa função SECURITY DEFINER para evitar recursão
 */
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

/**
 * Política: DELETE - "Only owners can remove members"
 * Usa is_workspace_owner que já é SECURITY DEFINER
 */
CREATE POLICY "Only owners can remove members"
ON public.workspace_members
FOR DELETE
TO authenticated
USING (
  workspace_members.profile_id != auth.uid()
  AND public.is_workspace_owner(auth.uid(), workspace_id)
);

-- ============================================================================
-- FIM DA MIGRATION
-- ============================================================================

-- Verificação (descomente para testar)
-- SELECT 'Políticas RLS de workspace_members corrigidas' AS status;
