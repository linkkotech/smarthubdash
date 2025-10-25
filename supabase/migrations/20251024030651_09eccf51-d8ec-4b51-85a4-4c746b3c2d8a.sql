-- ============================================================================
-- FASE 1: ESTRUTURA DE DADOS PARA MULTI-TENANT
-- ============================================================================

-- 1.1: Adicionar client_id à tabela profiles
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS client_id uuid REFERENCES public.clients(id) ON DELETE CASCADE;

-- Criar índice para performance
CREATE INDEX IF NOT EXISTS idx_profiles_client_id ON public.profiles(client_id);

COMMENT ON COLUMN public.profiles.client_id IS 'ID do cliente (tenant). NULL para administradores da plataforma.';

-- 1.2: Criar função para obter client_id do usuário logado
CREATE OR REPLACE FUNCTION public.get_user_client_id(_user_id uuid)
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT client_id
  FROM public.profiles
  WHERE id = _user_id;
$$;

COMMENT ON FUNCTION public.get_user_client_id IS 'Retorna o client_id do usuário. NULL para admins da plataforma.';

-- 1.3: Criar função para verificar se usuário é admin da plataforma
CREATE OR REPLACE FUNCTION public.is_platform_admin(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role IN ('super_admin', 'admin')
  );
$$;

COMMENT ON FUNCTION public.is_platform_admin IS 'Verifica se o usuário é super_admin ou admin da plataforma.';

-- ============================================================================
-- FASE 2: POLÍTICAS RLS MULTI-TENANT
-- ============================================================================

-- 2.1: TABELA CLIENTS - Políticas Multi-Tenant
DROP POLICY IF EXISTS "Authenticated users can view clients" ON public.clients;
DROP POLICY IF EXISTS "Admins can insert clients" ON public.clients;
DROP POLICY IF EXISTS "Admins can update clients" ON public.clients;

CREATE POLICY "Multi-tenant: SELECT clients"
ON public.clients
FOR SELECT
TO authenticated
USING (
  public.is_platform_admin(auth.uid())
  OR
  id = public.get_user_client_id(auth.uid())
);

CREATE POLICY "Multi-tenant: INSERT clients"
ON public.clients
FOR INSERT
TO authenticated
WITH CHECK (
  public.has_role(auth.uid(), 'super_admin'::app_role)
  OR
  public.has_role(auth.uid(), 'admin'::app_role)
);

CREATE POLICY "Multi-tenant: UPDATE clients"
ON public.clients
FOR UPDATE
TO authenticated
USING (
  public.is_platform_admin(auth.uid())
  OR
  id = public.get_user_client_id(auth.uid())
)
WITH CHECK (
  public.is_platform_admin(auth.uid())
  OR
  id = public.get_user_client_id(auth.uid())
);

CREATE POLICY "Multi-tenant: DELETE clients"
ON public.clients
FOR DELETE
TO authenticated
USING (
  public.has_role(auth.uid(), 'super_admin'::app_role)
);

-- 2.2: TABELA CONTRACTS - Políticas Multi-Tenant
DROP POLICY IF EXISTS "Authenticated users can view contracts" ON public.contracts;
DROP POLICY IF EXISTS "Admins can insert contracts" ON public.contracts;
DROP POLICY IF EXISTS "Admins can update contracts" ON public.contracts;

CREATE POLICY "Multi-tenant: SELECT contracts"
ON public.contracts
FOR SELECT
TO authenticated
USING (
  public.is_platform_admin(auth.uid())
  OR
  client_id = public.get_user_client_id(auth.uid())
);

CREATE POLICY "Multi-tenant: INSERT contracts"
ON public.contracts
FOR INSERT
TO authenticated
WITH CHECK (
  public.is_platform_admin(auth.uid())
  OR
  (
    client_id = public.get_user_client_id(auth.uid())
    AND
    public.has_role(auth.uid(), 'manager'::app_role)
  )
);

CREATE POLICY "Multi-tenant: UPDATE contracts"
ON public.contracts
FOR UPDATE
TO authenticated
USING (
  public.is_platform_admin(auth.uid())
  OR
  client_id = public.get_user_client_id(auth.uid())
)
WITH CHECK (
  public.is_platform_admin(auth.uid())
  OR
  client_id = public.get_user_client_id(auth.uid())
);

CREATE POLICY "Multi-tenant: DELETE contracts"
ON public.contracts
FOR DELETE
TO authenticated
USING (
  public.is_platform_admin(auth.uid())
);

-- 2.3: TABELA PLANS - Acesso Global (não é multi-tenant)
DROP POLICY IF EXISTS "Authenticated users can view plans" ON public.plans;
DROP POLICY IF EXISTS "Admins can insert plans" ON public.plans;
DROP POLICY IF EXISTS "Admins can update plans" ON public.plans;
DROP POLICY IF EXISTS "Super admins can delete plans" ON public.plans;

CREATE POLICY "Global: SELECT plans"
ON public.plans
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Global: INSERT plans"
ON public.plans
FOR INSERT
TO authenticated
WITH CHECK (
  public.is_platform_admin(auth.uid())
);

CREATE POLICY "Global: UPDATE plans"
ON public.plans
FOR UPDATE
TO authenticated
USING (
  public.is_platform_admin(auth.uid())
);

CREATE POLICY "Global: DELETE plans"
ON public.plans
FOR DELETE
TO authenticated
USING (
  public.has_role(auth.uid(), 'super_admin'::app_role)
);

-- 2.4: TABELA PROFILES - Isolamento por Cliente
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;

CREATE POLICY "Multi-tenant: SELECT profiles"
ON public.profiles
FOR SELECT
TO authenticated
USING (
  public.is_platform_admin(auth.uid())
  OR
  (
    client_id = public.get_user_client_id(auth.uid())
    AND client_id IS NOT NULL
  )
  OR
  id = auth.uid()
);

CREATE POLICY "Multi-tenant: UPDATE profiles"
ON public.profiles
FOR UPDATE
TO authenticated
USING (
  public.is_platform_admin(auth.uid())
  OR
  id = auth.uid()
)
WITH CHECK (
  public.is_platform_admin(auth.uid())
  OR
  id = auth.uid()
);

-- 2.5: TABELA USER_ROLES - Políticas da Plataforma
DROP POLICY IF EXISTS "Admins can view all user roles" ON public.user_roles;
DROP POLICY IF EXISTS "Super admins can insert user roles" ON public.user_roles;
DROP POLICY IF EXISTS "Super admins can delete user roles" ON public.user_roles;

CREATE POLICY "Platform: SELECT user_roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (
  public.is_platform_admin(auth.uid())
);

CREATE POLICY "Platform: INSERT user_roles"
ON public.user_roles
FOR INSERT
TO authenticated
WITH CHECK (
  public.is_platform_admin(auth.uid())
);

CREATE POLICY "Platform: DELETE user_roles"
ON public.user_roles
FOR DELETE
TO authenticated
USING (
  public.is_platform_admin(auth.uid())
);

-- ============================================================================
-- FASE 3: MIGRAÇÃO DE DADOS EXISTENTES
-- ============================================================================

-- Associar usuários que são admin_user_id de clientes ao respectivo client_id
UPDATE public.profiles
SET client_id = c.id
FROM public.clients c
WHERE profiles.id = c.admin_user_id
  AND profiles.client_id IS NULL;