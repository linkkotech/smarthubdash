-- ============================================================================
-- MIGRATION: Simplificar política de profiles para platform admins
-- ============================================================================
-- Data: 04 de novembro de 2025
-- Problema: Platform admins não conseguem ver profiles com client_id = null
--           quando fazem JOIN em queries (ex: workspaces + workspace_members + profiles)
-- Causa: A política atual tem 3 condições conectadas por OR, mas todas falham:
--        1. is_platform_admin() → TRUE ✅ (mas é ignorado em JOINs em alguns casos)
--        2. id = auth.uid() → FALSE (não é o próprio usuário)
--        3. client_id IS NOT NULL AND client_id = get_user_client_id() → FALSE (client_id é null)
-- Solução: Simplificar a política para que platform admins vejam TUDO sem condições extras
-- ============================================================================

-- Remover política atual
DROP POLICY IF EXISTS "Users can view profiles in their tenant" ON public.profiles;

/**
 * Política: SELECT - "Users can view profiles"
 * 
 * Permite visualizar profiles se:
 * 1. Usuário é platform admin (vê TUDO, incluindo profiles sem client_id) OU
 * 2. Usuário vê seu próprio profile OU
 * 3. Usuário vê profiles do mesmo cliente (multi-tenant)
 * 
 * IMPORTANTE: A primeira condição (is_platform_admin) deve vir primeiro
 * para garantir que admins da plataforma não sejam bloqueados por JOINs.
 */
CREATE POLICY "Users can view profiles"
ON public.profiles
FOR SELECT
TO authenticated
USING (
  -- Platform admins veem TUDO (incluindo profiles sem client_id)
  public.is_platform_admin(auth.uid())
  OR 
  -- Usuário vê seu próprio profile
  id = auth.uid()
  OR
  -- Usuário vê profiles do mesmo cliente
  (
    client_id IS NOT NULL
    AND client_id = public.get_user_client_id(auth.uid())
  )
);

-- ============================================================================
-- FIM DA MIGRATION
-- ============================================================================
