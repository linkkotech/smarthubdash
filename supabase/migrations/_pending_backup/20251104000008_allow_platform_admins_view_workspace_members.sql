-- ============================================================================
-- MIGRATION: Permitir admins da plataforma visualizarem workspace_members
-- ============================================================================
-- Data: 04 de novembro de 2025
-- Problema: Admins da plataforma não conseguem ver workspace_members ao fazer
--           join, pois a política RLS exige que sejam membros do workspace.
-- Solução: Adicionar exceção para admins da plataforma na política de SELECT.
-- ============================================================================

-- Recriar política de SELECT com exceção para admins da plataforma
DROP POLICY IF EXISTS "Users can view members of their workspaces" ON public.workspace_members;

/**
 * Política: SELECT - "Users can view members of their workspaces"
 * 
 * Permite visualizar membros se:
 * 1. O usuário é membro do workspace OU
 * 2. O usuário é admin da plataforma (super_admin/admin/manager)
 */
CREATE POLICY "Users can view members of their workspaces"
ON public.workspace_members
FOR SELECT
TO authenticated
USING (
  public.user_is_workspace_member(auth.uid(), workspace_id)
  OR public.is_platform_admin(auth.uid())
);

-- ============================================================================
-- FIM DA MIGRATION
-- ============================================================================
