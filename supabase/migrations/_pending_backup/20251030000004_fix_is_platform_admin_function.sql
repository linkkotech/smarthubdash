-- =====================================================
-- Recriar função is_platform_admin com DROP FORCE
-- =====================================================
-- PROBLEMA IDENTIFICADO: A função antiga estava consultando
-- a tabela `profiles` com coluna `client_user_role` em vez de
-- consultar a tabela `user_roles` com a coluna `role`.
-- =====================================================

-- IMPORTANTE: Remover a função antiga para forçar recompilação
DROP FUNCTION IF EXISTS public.is_platform_admin(_user_id uuid) CASCADE;

-- Recriar a função com a lógica CORRETA
CREATE FUNCTION public.is_platform_admin(_user_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
    AND role IN ('super_admin', 'admin', 'manager')
  )
$$;

-- Garantir que a função é acessível
GRANT EXECUTE ON FUNCTION public.is_platform_admin(uuid) TO authenticated, anon, service_role;
