-- ============================================================================
-- MIGRATION: Adicionar política RLS para admins da plataforma verem todos workspaces
-- ============================================================================
-- Data: 04 de novembro de 2025
-- Problema: Admins da plataforma (super_admin/admin) não conseguem ver
--           workspaces onde não são membros.
-- Solução: Adicionar política que permite admins da plataforma visualizar
--          todos os workspaces.
-- ============================================================================

-- Remover política antiga (se existir)
DROP POLICY IF EXISTS "Platform admins can view all workspaces" ON public.workspaces;

/**
 * Política: SELECT - "Platform admins can view all workspaces"
 * 
 * Admins da plataforma (super_admin, admin, manager) podem ver TODOS os workspaces.
 * Isso permite que eles gerenciem workspaces de clientes mesmo sem serem membros.
 */
CREATE POLICY "Platform admins can view all workspaces"
ON public.workspaces
FOR SELECT
TO authenticated
USING (
  public.is_platform_admin(auth.uid())
);

-- ============================================================================
-- FIM DA MIGRATION
-- ============================================================================
