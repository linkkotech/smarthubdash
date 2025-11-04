-- ============================================================================
-- MIGRATION: Corrigir política SELECT de profiles para permitir multi-tenant
-- ============================================================================
-- Data: 04 de novembro de 2025
-- Descrição: Permite que usuários de um cliente vejam outros profiles do mesmo cliente
-- ============================================================================

-- Remover política antiga muito restritiva
DROP POLICY IF EXISTS "Allow platform admins and users to see their own profile" ON public.profiles;

-- Criar nova política de SELECT que permite:
-- 1. Platform admins veem tudo
-- 2. Usuários veem seu próprio profile
-- 3. Usuários veem profiles do mesmo cliente (multi-tenant)
CREATE POLICY "Users can view profiles in their tenant"
ON public.profiles
FOR SELECT
TO authenticated
USING (
  -- Platform admins veem tudo
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
