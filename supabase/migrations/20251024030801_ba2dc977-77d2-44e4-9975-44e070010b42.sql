-- ============================================================================
-- FASE 1: ESTRUTURA DE DADOS PARA MULTI-TENANT
-- ============================================================================

-- 1.1: Adicionar client_id à tabela profiles (se ainda não existir)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'profiles' 
    AND column_name = 'client_id'
  ) THEN
    ALTER TABLE public.profiles
    ADD COLUMN client_id uuid REFERENCES public.clients(id) ON DELETE CASCADE;
    
    CREATE INDEX idx_profiles_client_id ON public.profiles(client_id);
    
    COMMENT ON COLUMN public.profiles.client_id IS 'ID do cliente (tenant). NULL para administradores da plataforma.';
  END IF;
END $$;

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
-- FASE 2: REMOVER TODAS AS POLÍTICAS ANTIGAS
-- ============================================================================

-- Remover políticas da tabela CLIENTS
DO $$ 
DECLARE
  policy_rec RECORD;
BEGIN
  FOR policy_rec IN 
    SELECT policyname 
    FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'clients'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.clients', policy_rec.policyname);
  END LOOP;
END $$;

-- Remover políticas da tabela CONTRACTS
DO $$ 
DECLARE
  policy_rec RECORD;
BEGIN
  FOR policy_rec IN 
    SELECT policyname 
    FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'contracts'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.contracts', policy_rec.policyname);
  END LOOP;
END $$;

-- Remover políticas da tabela PLANS
DO $$ 
DECLARE
  policy_rec RECORD;
BEGIN
  FOR policy_rec IN 
    SELECT policyname 
    FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'plans'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.plans', policy_rec.policyname);
  END LOOP;
END $$;

-- Remover políticas da tabela PROFILES
DO $$ 
DECLARE
  policy_rec RECORD;
BEGIN
  FOR policy_rec IN 
    SELECT policyname 
    FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'profiles'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.profiles', policy_rec.policyname);
  END LOOP;
END $$;

-- Remover políticas da tabela USER_ROLES
DO $$ 
DECLARE
  policy_rec RECORD;
BEGIN
  FOR policy_rec IN 
    SELECT policyname 
    FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'user_roles'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.user_roles', policy_rec.policyname);
  END LOOP;
END $$;

-- ============================================================================
-- FASE 3: CRIAR NOVAS POLÍTICAS RLS MULTI-TENANT
-- ============================================================================

-- 3.1: TABELA CLIENTS - Políticas Multi-Tenant
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

-- 3.2: TABELA CONTRACTS - Políticas Multi-Tenant
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

-- 3.3: TABELA PLANS - Acesso Global (não é multi-tenant)
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

-- 3.4: TABELA PROFILES - Isolamento por Cliente
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

-- 3.5: TABELA USER_ROLES - Políticas da Plataforma
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
-- FASE 4: MIGRAÇÃO DE DADOS EXISTENTES
-- ============================================================================

-- Associar usuários que são admin_user_id de clientes ao respectivo client_id
UPDATE public.profiles
SET client_id = c.id
FROM public.clients c
WHERE profiles.id = c.admin_user_id
  AND profiles.client_id IS NULL;