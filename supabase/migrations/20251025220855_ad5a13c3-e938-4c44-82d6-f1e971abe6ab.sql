-- ========================================
-- Script 1: Criar get_my_client_id() Simplificada
-- ========================================
CREATE OR REPLACE FUNCTION public.get_my_client_id()
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = '' -- Isola completamente a função
AS $$
  SELECT client_id FROM public.profiles WHERE id = auth.uid();
$$;

COMMENT ON FUNCTION public.get_my_client_id() IS 
'Retorna o client_id do usuário autenticado. Usa SECURITY DEFINER para evitar recursão.';

-- ========================================
-- Script 2: Refatorar Política SELECT de Profiles
-- ========================================

-- Remover política problemática
DROP POLICY IF EXISTS "Multi-tenant: SELECT profiles" ON public.profiles;

-- Criar nova política sem chamada a função customizada
CREATE POLICY "Allow users to read profiles in their own tenant"
ON public.profiles
FOR SELECT
TO authenticated
USING (
  -- Admin da plataforma vê tudo
  public.is_platform_admin(auth.uid())
  OR
  -- Usuário vê perfis do mesmo tenant (SUBQUERY INLINE - sem função customizada!)
  client_id = (SELECT p.client_id FROM public.profiles p WHERE p.id = auth.uid())
);

COMMENT ON POLICY "Allow users to read profiles in their own tenant" ON public.profiles IS 
'Permite admins verem tudo e usuários verem perfis do próprio tenant. Usa subquery inline para evitar recursão.';

-- ========================================
-- Script 3: Atualizar Políticas de Clients e Contracts
-- ========================================

-- CLIENTS
DROP POLICY IF EXISTS "Multi-tenant: SELECT clients" ON public.clients;

CREATE POLICY "Multi-tenant: SELECT clients" 
ON public.clients
FOR SELECT 
TO authenticated
USING (
  public.is_platform_admin(auth.uid()) 
  OR 
  id = public.get_my_client_id()
);

-- CONTRACTS
DROP POLICY IF EXISTS "Multi-tenant: SELECT contracts" ON public.contracts;

CREATE POLICY "Multi-tenant: SELECT contracts" 
ON public.contracts
FOR SELECT 
TO authenticated
USING (
  public.is_platform_admin(auth.uid()) 
  OR 
  client_id = public.get_my_client_id()
);