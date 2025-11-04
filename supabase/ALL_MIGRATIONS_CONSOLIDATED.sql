-- ============================================================================
-- SMARTHUB DASHBOARD - TODAS AS MIGRATIONS CONSOLIDADAS
-- Execute no SQL Editor: https://supabase.com/dashboard/project/cpzodtaghdinluovuflg/sql/new
-- Data: 2025-11-04 12:28:22
-- ============================================================================


-- ============================================================================
-- MIGRATION: 20251023232715_c5ab5bcc-960f-438b-84e5-19a83c903d29.sql
-- ============================================================================

-- Create enum for user roles
CREATE TYPE public.app_role AS ENUM ('super_admin', 'admin', 'manager');

-- Create enum for operation modes
CREATE TYPE public.operation_mode AS ENUM ('commercial', 'support_network', 'hybrid');

-- Create enum for contract types
CREATE TYPE public.contract_type AS ENUM ('fixed_term', 'recurring');

-- Create enum for client types
CREATE TYPE public.client_type AS ENUM ('pessoa_fisica', 'pessoa_juridica');

-- Create profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create user_roles table
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, role)
);

-- Create security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- Create plans table
CREATE TABLE public.plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  operation_mode operation_mode NOT NULL,
  max_users INTEGER NOT NULL,
  features JSONB NOT NULL DEFAULT '[]'::jsonb,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create clients table
CREATE TABLE public.clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  client_type client_type NOT NULL,
  document TEXT,
  admin_name TEXT NOT NULL,
  admin_email TEXT NOT NULL,
  admin_user_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create contracts table
CREATE TABLE public.contracts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES public.clients(id) ON DELETE CASCADE NOT NULL,
  plan_id UUID REFERENCES public.plans(id) NOT NULL,
  contract_type contract_type NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE,
  billing_day INTEGER,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contracts ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- RLS Policies for user_roles (only admins can manage)
CREATE POLICY "Admins can view all user roles"
  ON public.user_roles FOR SELECT
  USING (public.has_role(auth.uid(), 'super_admin') OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Super admins can insert user roles"
  ON public.user_roles FOR INSERT
  WITH CHECK (public.has_role(auth.uid(), 'super_admin') OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Super admins can delete user roles"
  ON public.user_roles FOR DELETE
  USING (public.has_role(auth.uid(), 'super_admin') OR public.has_role(auth.uid(), 'admin'));

-- RLS Policies for plans (admins can manage)
CREATE POLICY "Authenticated users can view plans"
  ON public.plans FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Admins can insert plans"
  ON public.plans FOR INSERT
  WITH CHECK (public.has_role(auth.uid(), 'super_admin') OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update plans"
  ON public.plans FOR UPDATE
  USING (public.has_role(auth.uid(), 'super_admin') OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Super admins can delete plans"
  ON public.plans FOR DELETE
  USING (public.has_role(auth.uid(), 'super_admin'));

-- RLS Policies for clients
CREATE POLICY "Authenticated users can view clients"
  ON public.clients FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Admins can insert clients"
  ON public.clients FOR INSERT
  WITH CHECK (
    public.has_role(auth.uid(), 'super_admin') OR 
    public.has_role(auth.uid(), 'admin') OR 
    public.has_role(auth.uid(), 'manager')
  );

CREATE POLICY "Admins can update clients"
  ON public.clients FOR UPDATE
  USING (
    public.has_role(auth.uid(), 'super_admin') OR 
    public.has_role(auth.uid(), 'admin') OR 
    public.has_role(auth.uid(), 'manager')
  );

-- RLS Policies for contracts
CREATE POLICY "Authenticated users can view contracts"
  ON public.contracts FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Admins can insert contracts"
  ON public.contracts FOR INSERT
  WITH CHECK (
    public.has_role(auth.uid(), 'super_admin') OR 
    public.has_role(auth.uid(), 'admin') OR 
    public.has_role(auth.uid(), 'manager')
  );

CREATE POLICY "Admins can update contracts"
  ON public.contracts FOR UPDATE
  USING (
    public.has_role(auth.uid(), 'super_admin') OR 
    public.has_role(auth.uid(), 'admin') OR 
    public.has_role(auth.uid(), 'manager')
  );

-- Create trigger function for updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- Create triggers for updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_plans_updated_at
  BEFORE UPDATE ON public.plans
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_clients_updated_at
  BEFORE UPDATE ON public.clients
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_contracts_updated_at
  BEFORE UPDATE ON public.contracts
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create trigger to create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    NEW.email
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();


-- ============================================================================
-- MIGRATION: 20251024003233_18f17aaf-cc46-4e28-a6e8-f0b6005d8085.sql
-- ============================================================================

-- Parte 1: Adicionar Marcelo como super_admin
INSERT INTO public.user_roles (user_id, role)
VALUES ('09ead756-6279-4143-9f22-b12697f79736', 'super_admin')
ON CONFLICT (user_id, role) DO NOTHING;

-- Parte 2: Criar funÃ§Ã£o para atribuir super_admin ao primeiro usuÃ¡rio
CREATE OR REPLACE FUNCTION public.assign_first_user_as_admin()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_count INTEGER;
BEGIN
  -- Conta quantos perfis jÃ¡ existem
  SELECT COUNT(*) INTO user_count FROM public.profiles;
  
  -- Se este for o primeiro usuÃ¡rio, atribui super_admin
  IF user_count = 1 THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'super_admin')
    ON CONFLICT (user_id, role) DO NOTHING;
    
    RAISE NOTICE 'Primeiro usuÃ¡rio detectado. Role super_admin atribuÃ­da automaticamente.';
  END IF;
  
  RETURN NEW;
END;
$$;

-- Criar trigger que dispara apÃ³s inserÃ§Ã£o de perfil
CREATE TRIGGER on_first_user_create_admin
  AFTER INSERT ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.assign_first_user_as_admin();


-- ============================================================================
-- MIGRATION: 20251024030651_09eccf51-d8ec-4b51-85a4-4c746b3c2d8a.sql
-- ============================================================================

-- ============================================================================
-- FASE 1: ESTRUTURA DE DADOS PARA MULTI-TENANT
-- ============================================================================

-- 1.1: Adicionar client_id Ã  tabela profiles
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS client_id uuid REFERENCES public.clients(id) ON DELETE CASCADE;

-- Criar Ã­ndice para performance
CREATE INDEX IF NOT EXISTS idx_profiles_client_id ON public.profiles(client_id);

COMMENT ON COLUMN public.profiles.client_id IS 'ID do cliente (tenant). NULL para administradores da plataforma.';

-- 1.2: Criar funÃ§Ã£o para obter client_id do usuÃ¡rio logado
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

COMMENT ON FUNCTION public.get_user_client_id IS 'Retorna o client_id do usuÃ¡rio. NULL para admins da plataforma.';

-- 1.3: Criar funÃ§Ã£o para verificar se usuÃ¡rio Ã© admin da plataforma
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

COMMENT ON FUNCTION public.is_platform_admin IS 'Verifica se o usuÃ¡rio Ã© super_admin ou admin da plataforma.';

-- ============================================================================
-- FASE 2: POLÃTICAS RLS MULTI-TENANT
-- ============================================================================

-- 2.1: TABELA CLIENTS - PolÃ­ticas Multi-Tenant
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

-- 2.2: TABELA CONTRACTS - PolÃ­ticas Multi-Tenant
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

-- 2.3: TABELA PLANS - Acesso Global (nÃ£o Ã© multi-tenant)
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

-- 2.5: TABELA USER_ROLES - PolÃ­ticas da Plataforma
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
-- FASE 3: MIGRAÃ‡ÃƒO DE DADOS EXISTENTES
-- ============================================================================

-- Associar usuÃ¡rios que sÃ£o admin_user_id de clientes ao respectivo client_id
UPDATE public.profiles
SET client_id = c.id
FROM public.clients c
WHERE profiles.id = c.admin_user_id
  AND profiles.client_id IS NULL;


-- ============================================================================
-- MIGRATION: 20251024030801_ba2dc977-77d2-44e4-9975-44e070010b42.sql
-- ============================================================================

-- ============================================================================
-- FASE 1: ESTRUTURA DE DADOS PARA MULTI-TENANT
-- ============================================================================

-- 1.1: Adicionar client_id Ã  tabela profiles (se ainda nÃ£o existir)
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

-- 1.2: Criar funÃ§Ã£o para obter client_id do usuÃ¡rio logado
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

COMMENT ON FUNCTION public.get_user_client_id IS 'Retorna o client_id do usuÃ¡rio. NULL para admins da plataforma.';

-- 1.3: Criar funÃ§Ã£o para verificar se usuÃ¡rio Ã© admin da plataforma
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

COMMENT ON FUNCTION public.is_platform_admin IS 'Verifica se o usuÃ¡rio Ã© super_admin ou admin da plataforma.';

-- ============================================================================
-- FASE 2: REMOVER TODAS AS POLÃTICAS ANTIGAS
-- ============================================================================

-- Remover polÃ­ticas da tabela CLIENTS
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

-- Remover polÃ­ticas da tabela CONTRACTS
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

-- Remover polÃ­ticas da tabela PLANS
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

-- Remover polÃ­ticas da tabela PROFILES
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

-- Remover polÃ­ticas da tabela USER_ROLES
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
-- FASE 3: CRIAR NOVAS POLÃTICAS RLS MULTI-TENANT
-- ============================================================================

-- 3.1: TABELA CLIENTS - PolÃ­ticas Multi-Tenant
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

-- 3.2: TABELA CONTRACTS - PolÃ­ticas Multi-Tenant
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

-- 3.3: TABELA PLANS - Acesso Global (nÃ£o Ã© multi-tenant)
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

-- 3.5: TABELA USER_ROLES - PolÃ­ticas da Plataforma
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
-- FASE 4: MIGRAÃ‡ÃƒO DE DADOS EXISTENTES
-- ============================================================================

-- Associar usuÃ¡rios que sÃ£o admin_user_id de clientes ao respectivo client_id
UPDATE public.profiles
SET client_id = c.id
FROM public.clients c
WHERE profiles.id = c.admin_user_id
  AND profiles.client_id IS NULL;


-- ============================================================================
-- MIGRATION: 20251024031430_3816874e-c8ea-43f2-9450-7b3d5515f626.sql
-- ============================================================================

-- ============================================================================
-- GESTÃƒO DE USUÃRIOS DOS CLIENTES
-- ============================================================================
-- Este migration adiciona a estrutura necessÃ¡ria para gerenciar usuÃ¡rios
-- dos clientes (tenants), incluindo papÃ©is especÃ­ficos e permissÃµes.
-- ============================================================================

-- ============================================================================
-- FASE 1: ESTRUTURA DE DADOS
-- ============================================================================

-- 1.1 Criar enum para papÃ©is de usuÃ¡rios de clientes
CREATE TYPE public.client_user_role AS ENUM (
  'client_admin',    -- Administrador do cliente (acesso total dentro do tenant)
  'client_manager',  -- Gerente (pode gerenciar dados, mas nÃ£o usuÃ¡rios)
  'client_member'    -- Membro bÃ¡sico (acesso apenas leitura/ediÃ§Ã£o limitada)
);

COMMENT ON TYPE public.client_user_role IS 'PapÃ©is especÃ­ficos para usuÃ¡rios dos clientes (tenants)';

-- 1.2 Adicionar coluna client_user_role Ã  tabela profiles
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS client_user_role client_user_role NULL;

COMMENT ON COLUMN public.profiles.client_user_role IS 'Papel do usuÃ¡rio dentro do cliente. NULL para admins da plataforma.';

-- 1.3 Criar Ã­ndices para performance
CREATE INDEX IF NOT EXISTS idx_profiles_client_user_role 
ON public.profiles(client_user_role);

CREATE INDEX IF NOT EXISTS idx_profiles_client_role_composite 
ON public.profiles(client_id, client_user_role) 
WHERE client_id IS NOT NULL;

-- ============================================================================
-- FASE 2: FUNÃ‡Ã•ES DE SEGURANÃ‡A
-- ============================================================================

-- 2.1 FunÃ§Ã£o para verificar se usuÃ¡rio Ã© admin do prÃ³prio cliente
CREATE OR REPLACE FUNCTION public.is_client_admin(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE id = _user_id
      AND client_user_role = 'client_admin'
      AND client_id IS NOT NULL
  );
$$;

COMMENT ON FUNCTION public.is_client_admin IS 'Verifica se o usuÃ¡rio Ã© admin do prÃ³prio cliente';

-- ============================================================================
-- FASE 3: ATUALIZAÃ‡ÃƒO DE POLÃTICAS RLS
-- ============================================================================

-- 3.1 Remover polÃ­ticas antigas de profiles
DROP POLICY IF EXISTS "Multi-tenant: INSERT profiles" ON public.profiles;
DROP POLICY IF EXISTS "Multi-tenant: SELECT profiles" ON public.profiles;
DROP POLICY IF EXISTS "Multi-tenant: UPDATE profiles" ON public.profiles;

-- 3.2 Criar novas polÃ­ticas para profiles

-- SELECT: Admins da plataforma veem todos, client_admins veem do seu cliente, users veem a si mesmos
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

-- INSERT: Apenas admins da plataforma podem criar novos perfis
CREATE POLICY "Multi-tenant: INSERT profiles"
ON public.profiles
FOR INSERT
TO authenticated
WITH CHECK (
  public.is_platform_admin(auth.uid())
);

-- UPDATE: Admins da plataforma podem editar todos, usuÃ¡rios podem editar a si mesmos
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


-- ============================================================================
-- MIGRATION: 20251024031648_4d5ce31a-387f-4051-941d-49ca5d2fb88c.sql
-- ============================================================================

-- ============================================================================
-- GESTÃƒO DE USUÃRIOS DOS CLIENTES
-- ============================================================================
-- Este migration adiciona a estrutura necessÃ¡ria para gerenciar usuÃ¡rios
-- dos clientes (tenants), incluindo papÃ©is especÃ­ficos e permissÃµes.
-- ============================================================================

-- ============================================================================
-- FASE 1: ESTRUTURA DE DADOS
-- ============================================================================

-- 1.1 Criar enum para papÃ©is de usuÃ¡rios de clientes (se nÃ£o existir)
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'client_user_role') THEN
    CREATE TYPE public.client_user_role AS ENUM (
      'client_admin',    -- Administrador do cliente (acesso total dentro do tenant)
      'client_manager',  -- Gerente (pode gerenciar dados, mas nÃ£o usuÃ¡rios)
      'client_member'    -- Membro bÃ¡sico (acesso apenas leitura/ediÃ§Ã£o limitada)
    );
    COMMENT ON TYPE public.client_user_role IS 'PapÃ©is especÃ­ficos para usuÃ¡rios dos clientes (tenants)';
  END IF;
END $$;

-- 1.2 Adicionar coluna client_user_role Ã  tabela profiles
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS client_user_role client_user_role NULL;

COMMENT ON COLUMN public.profiles.client_user_role IS 'Papel do usuÃ¡rio dentro do cliente. NULL para admins da plataforma.';

-- 1.3 Criar Ã­ndices para performance
CREATE INDEX IF NOT EXISTS idx_profiles_client_user_role 
ON public.profiles(client_user_role);

CREATE INDEX IF NOT EXISTS idx_profiles_client_role_composite 
ON public.profiles(client_id, client_user_role) 
WHERE client_id IS NOT NULL;

-- ============================================================================
-- FASE 2: FUNÃ‡Ã•ES DE SEGURANÃ‡A
-- ============================================================================

-- 2.1 FunÃ§Ã£o para verificar se usuÃ¡rio Ã© admin do prÃ³prio cliente
CREATE OR REPLACE FUNCTION public.is_client_admin(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE id = _user_id
      AND client_user_role = 'client_admin'
      AND client_id IS NOT NULL
  );
$$;

COMMENT ON FUNCTION public.is_client_admin IS 'Verifica se o usuÃ¡rio Ã© admin do prÃ³prio cliente';

-- ============================================================================
-- FASE 3: ATUALIZAÃ‡ÃƒO DE POLÃTICAS RLS
-- ============================================================================

-- 3.1 Remover polÃ­ticas antigas de profiles
DROP POLICY IF EXISTS "Multi-tenant: INSERT profiles" ON public.profiles;
DROP POLICY IF EXISTS "Multi-tenant: SELECT profiles" ON public.profiles;
DROP POLICY IF EXISTS "Multi-tenant: UPDATE profiles" ON public.profiles;

-- 3.2 Criar novas polÃ­ticas para profiles

-- SELECT: Admins da plataforma veem todos, client_admins veem do seu cliente, users veem a si mesmos
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

-- INSERT: Apenas admins da plataforma podem criar novos perfis
CREATE POLICY "Multi-tenant: INSERT profiles"
ON public.profiles
FOR INSERT
TO authenticated
WITH CHECK (
  public.is_platform_admin(auth.uid())
);

-- UPDATE: Admins da plataforma podem editar todos, usuÃ¡rios podem editar a si mesmos
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


-- ============================================================================
-- MIGRATION: 20251025033133_5f7374e3-cec4-47da-926e-11b9586de01c.sql
-- ============================================================================

-- ETAPA 1: Criar funÃ§Ã£o is_platform_admin
CREATE OR REPLACE FUNCTION public.is_platform_admin(_user_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM user_roles
    WHERE user_id = _user_id
    AND role IN ('super_admin', 'admin', 'manager')
  )
$$;

-- ETAPA 2: Criar funÃ§Ã£o helper user_has_platform_role
CREATE OR REPLACE FUNCTION public.user_has_platform_role(_user_id uuid, _roles text[])
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM user_roles
    WHERE user_id = _user_id
    AND role = ANY(_roles)
  )
$$;

-- ETAPA 3: Corrigir polÃ­ticas RLS da tabela clients
DROP POLICY IF EXISTS "UsuÃ¡rios autenticados podem ler clientes" ON clients;
DROP POLICY IF EXISTS "UsuÃ¡rios autenticados podem inserir clientes" ON clients;
DROP POLICY IF EXISTS "UsuÃ¡rios autenticados podem atualizar clientes" ON clients;

-- Admins veem tudo, usuÃ¡rios de cliente veem apenas seu cliente
CREATE POLICY "admins_can_read_all_clients" ON clients
  FOR SELECT
  TO authenticated
  USING (
    user_has_platform_role(auth.uid(), ARRAY['super_admin', 'admin', 'manager'])
    OR
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.client_id = clients.id
    )
  );

-- Apenas admins podem criar clientes
CREATE POLICY "admins_can_insert_clients" ON clients
  FOR INSERT
  TO authenticated
  WITH CHECK (
    user_has_platform_role(auth.uid(), ARRAY['super_admin', 'admin', 'manager'])
  );

-- Apenas admins podem atualizar clientes
CREATE POLICY "admins_can_update_clients" ON clients
  FOR UPDATE
  TO authenticated
  USING (
    user_has_platform_role(auth.uid(), ARRAY['super_admin', 'admin', 'manager'])
  )
  WITH CHECK (
    user_has_platform_role(auth.uid(), ARRAY['super_admin', 'admin', 'manager'])
  );

-- Apenas super_admin pode deletar
CREATE POLICY "super_admins_can_delete_clients" ON clients
  FOR DELETE
  TO authenticated
  USING (
    user_has_platform_role(auth.uid(), ARRAY['super_admin'])
  );

-- ETAPA 4: Corrigir polÃ­ticas RLS da tabela contracts
DROP POLICY IF EXISTS "UsuÃ¡rios autenticados podem ler contratos" ON contracts;
DROP POLICY IF EXISTS "UsuÃ¡rios autenticados podem inserir contratos" ON contracts;
DROP POLICY IF EXISTS "UsuÃ¡rios autenticados podem atualizar contratos" ON contracts;
DROP POLICY IF EXISTS "UsuÃ¡rios autenticados podem deletar contratos" ON contracts;

-- Admins veem tudo, usuÃ¡rios de cliente veem apenas contratos do seu cliente
CREATE POLICY "read_contracts_policy" ON contracts
  FOR SELECT
  TO authenticated
  USING (
    user_has_platform_role(auth.uid(), ARRAY['super_admin', 'admin', 'manager'])
    OR
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.client_id = contracts.client_id
    )
  );

-- Apenas admins podem inserir contratos
CREATE POLICY "insert_contracts_policy" ON contracts
  FOR INSERT
  TO authenticated
  WITH CHECK (
    user_has_platform_role(auth.uid(), ARRAY['super_admin', 'admin', 'manager'])
  );

-- Apenas admins podem atualizar contratos
CREATE POLICY "update_contracts_policy" ON contracts
  FOR UPDATE
  TO authenticated
  USING (
    user_has_platform_role(auth.uid(), ARRAY['super_admin', 'admin', 'manager'])
  )
  WITH CHECK (
    user_has_platform_role(auth.uid(), ARRAY['super_admin', 'admin', 'manager'])
  );

-- Apenas super_admin pode deletar contratos
CREATE POLICY "delete_contracts_policy" ON contracts
  FOR DELETE
  TO authenticated
  USING (
    user_has_platform_role(auth.uid(), ARRAY['super_admin'])
  );

-- ETAPA 5: Corrigir polÃ­ticas RLS da tabela plans
DROP POLICY IF EXISTS "Administradores podem inserir planos" ON plans;
DROP POLICY IF EXISTS "Administradores podem atualizar planos" ON plans;
DROP POLICY IF EXISTS "Administradores podem deletar planos" ON plans;

-- Apenas admins podem inserir planos
CREATE POLICY "insert_plans_policy" ON plans
  FOR INSERT
  TO authenticated
  WITH CHECK (
    user_has_platform_role(auth.uid(), ARRAY['super_admin', 'admin'])
  );

-- Apenas admins podem atualizar planos
CREATE POLICY "update_plans_policy" ON plans
  FOR UPDATE
  TO authenticated
  USING (
    user_has_platform_role(auth.uid(), ARRAY['super_admin', 'admin'])
  )
  WITH CHECK (
    user_has_platform_role(auth.uid(), ARRAY['super_admin', 'admin'])
  );

-- Apenas super_admin pode deletar planos
CREATE POLICY "delete_plans_policy" ON plans
  FOR DELETE
  TO authenticated
  USING (
    user_has_platform_role(auth.uid(), ARRAY['super_admin'])
  );


-- ============================================================================
-- MIGRATION: 20251025033314_68455acc-c0e2-4513-8c1a-935ad8fe361e.sql
-- ============================================================================

-- ETAPA 1: Criar funÃ§Ã£o is_platform_admin
CREATE OR REPLACE FUNCTION public.is_platform_admin(_user_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM user_roles
    WHERE user_id = _user_id
    AND role IN ('super_admin', 'admin', 'manager')
  )
$$;

-- ETAPA 2: Criar funÃ§Ã£o helper user_has_platform_role
CREATE OR REPLACE FUNCTION public.user_has_platform_role(_user_id uuid, _roles text[])
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM user_roles
    WHERE user_id = _user_id
    AND role = ANY(_roles)
  )
$$;


-- ============================================================================
-- MIGRATION: 20251025033431_c000ae0f-2776-4d14-9f29-d822464bbc98.sql
-- ============================================================================

-- ETAPA 1: Criar funÃ§Ã£o is_platform_admin
CREATE OR REPLACE FUNCTION public.is_platform_admin(_user_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM user_roles
    WHERE user_id = _user_id
    AND role IN ('super_admin', 'admin', 'manager')
  )
$$;

-- ETAPA 2: Criar funÃ§Ã£o helper user_has_platform_role
CREATE OR REPLACE FUNCTION public.user_has_platform_role(_user_id uuid, _roles text[])
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM user_roles
    WHERE user_id = _user_id
    AND role = ANY(_roles)
  )
$$;

-- ETAPA 3: Corrigir polÃ­ticas RLS da tabela clients
DROP POLICY IF EXISTS "UsuÃ¡rios autenticados podem ler clientes" ON clients CASCADE;
DROP POLICY IF EXISTS "UsuÃ¡rios autenticados podem inserir clientes" ON clients CASCADE;
DROP POLICY IF EXISTS "UsuÃ¡rios autenticados podem atualizar clientes" ON clients CASCADE;
DROP POLICY IF EXISTS "admins_can_read_all_clients" ON clients CASCADE;
DROP POLICY IF EXISTS "admins_can_insert_clients" ON clients CASCADE;
DROP POLICY IF EXISTS "admins_can_update_clients" ON clients CASCADE;
DROP POLICY IF EXISTS "super_admins_can_delete_clients" ON clients CASCADE;

-- Admins veem tudo, usuÃ¡rios de cliente veem apenas seu cliente
CREATE POLICY "admins_can_read_all_clients" ON clients
  FOR SELECT
  TO authenticated
  USING (
    user_has_platform_role(auth.uid(), ARRAY['super_admin', 'admin', 'manager'])
    OR
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.client_id = clients.id
    )
  );

-- Apenas admins podem criar clientes
CREATE POLICY "admins_can_insert_clients" ON clients
  FOR INSERT
  TO authenticated
  WITH CHECK (
    user_has_platform_role(auth.uid(), ARRAY['super_admin', 'admin', 'manager'])
  );

-- Apenas admins podem atualizar clientes
CREATE POLICY "admins_can_update_clients" ON clients
  FOR UPDATE
  TO authenticated
  USING (
    user_has_platform_role(auth.uid(), ARRAY['super_admin', 'admin', 'manager'])
  )
  WITH CHECK (
    user_has_platform_role(auth.uid(), ARRAY['super_admin', 'admin', 'manager'])
  );

-- Apenas super_admin pode deletar
CREATE POLICY "super_admins_can_delete_clients" ON clients
  FOR DELETE
  TO authenticated
  USING (
    user_has_platform_role(auth.uid(), ARRAY['super_admin'])
  );

-- ETAPA 4: Corrigir polÃ­ticas RLS da tabela contracts
DROP POLICY IF EXISTS "UsuÃ¡rios autenticados podem ler contratos" ON contracts CASCADE;
DROP POLICY IF EXISTS "UsuÃ¡rios autenticados podem inserir contratos" ON contracts CASCADE;
DROP POLICY IF EXISTS "UsuÃ¡rios autenticados podem atualizar contratos" ON contracts CASCADE;
DROP POLICY IF EXISTS "UsuÃ¡rios autenticados podem deletar contratos" ON contracts CASCADE;
DROP POLICY IF EXISTS "read_contracts_policy" ON contracts CASCADE;
DROP POLICY IF EXISTS "insert_contracts_policy" ON contracts CASCADE;
DROP POLICY IF EXISTS "update_contracts_policy" ON contracts CASCADE;
DROP POLICY IF EXISTS "delete_contracts_policy" ON contracts CASCADE;

-- Admins veem tudo, usuÃ¡rios de cliente veem apenas contratos do seu cliente
CREATE POLICY "read_contracts_policy" ON contracts
  FOR SELECT
  TO authenticated
  USING (
    user_has_platform_role(auth.uid(), ARRAY['super_admin', 'admin', 'manager'])
    OR
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.client_id = contracts.client_id
    )
  );

-- Apenas admins podem inserir contratos
CREATE POLICY "insert_contracts_policy" ON contracts
  FOR INSERT
  TO authenticated
  WITH CHECK (
    user_has_platform_role(auth.uid(), ARRAY['super_admin', 'admin', 'manager'])
  );

-- Apenas admins podem atualizar contratos
CREATE POLICY "update_contracts_policy" ON contracts
  FOR UPDATE
  TO authenticated
  USING (
    user_has_platform_role(auth.uid(), ARRAY['super_admin', 'admin', 'manager'])
  )
  WITH CHECK (
    user_has_platform_role(auth.uid(), ARRAY['super_admin', 'admin', 'manager'])
  );

-- Apenas super_admin pode deletar contratos
CREATE POLICY "delete_contracts_policy" ON contracts
  FOR DELETE
  TO authenticated
  USING (
    user_has_platform_role(auth.uid(), ARRAY['super_admin'])
  );

-- ETAPA 5: Corrigir polÃ­ticas RLS da tabela plans
DROP POLICY IF EXISTS "Administradores podem inserir planos" ON plans CASCADE;
DROP POLICY IF EXISTS "Administradores podem atualizar planos" ON plans CASCADE;
DROP POLICY IF EXISTS "Administradores podem deletar planos" ON plans CASCADE;
DROP POLICY IF EXISTS "insert_plans_policy" ON plans CASCADE;
DROP POLICY IF EXISTS "update_plans_policy" ON plans CASCADE;
DROP POLICY IF EXISTS "delete_plans_policy" ON plans CASCADE;

-- Apenas admins podem inserir planos
CREATE POLICY "insert_plans_policy" ON plans
  FOR INSERT
  TO authenticated
  WITH CHECK (
    user_has_platform_role(auth.uid(), ARRAY['super_admin', 'admin'])
  );

-- Apenas admins podem atualizar planos
CREATE POLICY "update_plans_policy" ON plans
  FOR UPDATE
  TO authenticated
  USING (
    user_has_platform_role(auth.uid(), ARRAY['super_admin', 'admin'])
  )
  WITH CHECK (
    user_has_platform_role(auth.uid(), ARRAY['super_admin', 'admin'])
  );

-- Apenas super_admin pode deletar planos
CREATE POLICY "delete_plans_policy" ON plans
  FOR DELETE
  TO authenticated
  USING (
    user_has_platform_role(auth.uid(), ARRAY['super_admin'])
  );


-- ============================================================================
-- MIGRATION: 20251025034953_298b7bc0-68ef-441b-a6a1-b49d3371efc0.sql
-- ============================================================================

-- PolÃ­tica para permitir que admins da plataforma leiam todos os perfis
CREATE POLICY "Platform admins can read all profiles"
ON public.profiles
FOR SELECT
TO authenticated
USING (
  user_has_platform_role(auth.uid(), ARRAY['super_admin', 'admin', 'manager'])
);


-- ============================================================================
-- MIGRATION: 20251025210750_b4cb353f-206c-4a1a-9f26-116f2b835ddc.sql
-- ============================================================================

-- Drop do trigger e funÃ§Ã£o existentes
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Criar nova funÃ§Ã£o com lÃ³gica de primeiro usuÃ¡rio = super admin
CREATE OR REPLACE FUNCTION public.handle_new_user_and_assign_superadmin()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  super_admin_count INTEGER;
BEGIN
  -- 1. Inserir perfil na tabela profiles
  INSERT INTO public.profiles (id, full_name, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    NEW.email
  );
  
  -- 2. Verificar se jÃ¡ existe algum super_admin
  SELECT COUNT(*) INTO super_admin_count
  FROM public.user_roles
  WHERE role = 'super_admin';
  
  -- 3. Se nÃ£o existir super_admin, atribuir ao novo usuÃ¡rio
  IF super_admin_count = 0 THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'super_admin');
  END IF;
  
  RETURN NEW;
END;
$$;

-- Criar trigger para chamar a funÃ§Ã£o
CREATE TRIGGER on_auth_user_created_assign_superadmin
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user_and_assign_superadmin();

-- Adicionar comentÃ¡rio para documentaÃ§Ã£o
COMMENT ON FUNCTION public.handle_new_user_and_assign_superadmin() IS 
'Cria perfil do usuÃ¡rio e atribui papel de super_admin ao primeiro usuÃ¡rio cadastrado na plataforma';


-- ============================================================================
-- MIGRATION: 20251025220037_2a96a259-9bc2-4afd-9fb4-f9b12de0c603.sql
-- ============================================================================

-- Corrigir recursÃ£o infinita: Adicionar SECURITY DEFINER Ã  funÃ§Ã£o get_user_client_id
CREATE OR REPLACE FUNCTION public.get_user_client_id(_user_id uuid)
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER -- Executa com privilÃ©gios do owner, evitando recursÃ£o nas polÃ­ticas RLS
SET search_path = public
AS $$
  SELECT client_id 
  FROM public.profiles 
  WHERE id = _user_id;
$$;

-- Documentar a correÃ§Ã£o
COMMENT ON FUNCTION public.get_user_client_id(_user_id uuid) IS 
'Retorna o client_id do usuÃ¡rio. Usa SECURITY DEFINER para evitar recursÃ£o infinita nas polÃ­ticas RLS de profiles.';


-- ============================================================================
-- MIGRATION: 20251025220855_ad5a13c3-e938-4c44-82d6-f1e971abe6ab.sql
-- ============================================================================

-- ========================================
-- Script 1: Criar get_my_client_id() Simplificada
-- ========================================
CREATE OR REPLACE FUNCTION public.get_my_client_id()
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = '' -- Isola completamente a funÃ§Ã£o
AS $$
  SELECT client_id FROM public.profiles WHERE id = auth.uid();
$$;

COMMENT ON FUNCTION public.get_my_client_id() IS 
'Retorna o client_id do usuÃ¡rio autenticado. Usa SECURITY DEFINER para evitar recursÃ£o.';

-- ========================================
-- Script 2: Refatorar PolÃ­tica SELECT de Profiles
-- ========================================

-- Remover polÃ­tica problemÃ¡tica
DROP POLICY IF EXISTS "Multi-tenant: SELECT profiles" ON public.profiles;

-- Criar nova polÃ­tica sem chamada a funÃ§Ã£o customizada
CREATE POLICY "Allow users to read profiles in their own tenant"
ON public.profiles
FOR SELECT
TO authenticated
USING (
  -- Admin da plataforma vÃª tudo
  public.is_platform_admin(auth.uid())
  OR
  -- UsuÃ¡rio vÃª perfis do mesmo tenant (SUBQUERY INLINE - sem funÃ§Ã£o customizada!)
  client_id = (SELECT p.client_id FROM public.profiles p WHERE p.id = auth.uid())
);

COMMENT ON POLICY "Allow users to read profiles in their own tenant" ON public.profiles IS 
'Permite admins verem tudo e usuÃ¡rios verem perfis do prÃ³prio tenant. Usa subquery inline para evitar recursÃ£o.';

-- ========================================
-- Script 3: Atualizar PolÃ­ticas de Clients e Contracts
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


-- ============================================================================
-- MIGRATION: 20251025224941_043e555e-b40f-478c-954a-c59e098fb8dc.sql
-- ============================================================================

-- ========================================
-- Script 1: Limpar TODAS as PolÃ­ticas Recursivas de user_roles
-- ========================================
DROP POLICY IF EXISTS "Platform: SELECT user_roles" ON public.user_roles;
DROP POLICY IF EXISTS "Platform: INSERT user_roles" ON public.user_roles;
DROP POLICY IF EXISTS "Platform: DELETE user_roles" ON public.user_roles;
DROP POLICY IF EXISTS "Allow platform admins to manage user roles" ON public.user_roles;
DROP POLICY IF EXISTS "Super admins podem ler todos os roles" ON public.user_roles;
DROP POLICY IF EXISTS "Super admins podem inserir roles" ON public.user_roles;
DROP POLICY IF EXISTS "Super admins podem deletar roles" ON public.user_roles;
DROP POLICY IF EXISTS "UsuÃ¡rios podem ler seus prÃ³prios roles" ON public.user_roles;
DROP POLICY IF EXISTS "Allow authenticated users to read roles" ON public.user_roles;

-- ========================================
-- Script 2: Criar PolÃ­ticas NÃ£o-Recursivas
-- ========================================

-- LEITURA: Permitir a todos os usuÃ¡rios autenticados (quebra a recursÃ£o)
CREATE POLICY "Allow all authenticated users to read user_roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (true);

COMMENT ON POLICY "Allow all authenticated users to read user_roles" ON public.user_roles IS 
'Permite leitura irrestrita de roles. A seguranÃ§a Ã© garantida pelas polÃ­ticas das tabelas de dados (clients, contracts, etc). Esta polÃ­tica quebra o ciclo de recursÃ£o.';

-- INSERÃ‡ÃƒO: Apenas platform admins (usa SECURITY DEFINER, sem recursÃ£o)
CREATE POLICY "Only platform admins can insert user_roles"
ON public.user_roles
FOR INSERT
TO authenticated
WITH CHECK (
  public.is_platform_admin(auth.uid())
);

COMMENT ON POLICY "Only platform admins can insert user_roles" ON public.user_roles IS 
'is_platform_admin usa SECURITY DEFINER, evitando recursÃ£o ao ler user_roles.';

-- DELEÃ‡ÃƒO: Apenas platform admins (usa SECURITY DEFINER, sem recursÃ£o)
CREATE POLICY "Only platform admins can delete user_roles"
ON public.user_roles
FOR DELETE
TO authenticated
USING (
  public.is_platform_admin(auth.uid())
);

COMMENT ON POLICY "Only platform admins can delete user_roles" ON public.user_roles IS 
'is_platform_admin usa SECURITY DEFINER, evitando recursÃ£o ao ler user_roles.';


-- ============================================================================
-- MIGRATION: 20251025225137_ee2576c5-4ef2-439e-8995-3baeaa49bfd5.sql
-- ============================================================================

-- ========================================
-- Limpar PolÃ­ticas Recursivas de user_roles
-- ========================================
DROP POLICY IF EXISTS "Platform: SELECT user_roles" ON public.user_roles;
DROP POLICY IF EXISTS "Platform: INSERT user_roles" ON public.user_roles;
DROP POLICY IF EXISTS "Platform: DELETE user_roles" ON public.user_roles;
DROP POLICY IF EXISTS "Allow platform admins to manage user roles" ON public.user_roles;
DROP POLICY IF EXISTS "Super admins podem ler todos os roles" ON public.user_roles;
DROP POLICY IF EXISTS "Super admins podem inserir roles" ON public.user_roles;
DROP POLICY IF EXISTS "Super admins podem deletar roles" ON public.user_roles;
DROP POLICY IF EXISTS "UsuÃ¡rios podem ler seus prÃ³prios roles" ON public.user_roles;

-- ========================================
-- Recriar PolÃ­ticas NÃ£o-Recursivas
-- ========================================

-- Remover polÃ­ticas antigas se existirem
DROP POLICY IF EXISTS "Allow all authenticated users to read user_roles" ON public.user_roles;
DROP POLICY IF EXISTS "Only platform admins can insert user_roles" ON public.user_roles;
DROP POLICY IF EXISTS "Only platform admins can delete user_roles" ON public.user_roles;

-- LEITURA: Permitir a todos os usuÃ¡rios autenticados (quebra a recursÃ£o)
CREATE POLICY "Allow all authenticated users to read user_roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (true);

-- INSERÃ‡ÃƒO: Apenas platform admins (usa SECURITY DEFINER, sem recursÃ£o)
CREATE POLICY "Only platform admins can insert user_roles"
ON public.user_roles
FOR INSERT
TO authenticated
WITH CHECK (
  public.is_platform_admin(auth.uid())
);

-- DELEÃ‡ÃƒO: Apenas platform admins (usa SECURITY DEFINER, sem recursÃ£o)
CREATE POLICY "Only platform admins can delete user_roles"
ON public.user_roles
FOR DELETE
TO authenticated
USING (
  public.is_platform_admin(auth.uid())
);


-- ============================================================================
-- MIGRATION: 20251025230356_c8657b6a-511c-446c-8652-759122e0f8b4.sql
-- ============================================================================

-- ========================================
-- LIMPAR TODAS AS POLÃTICAS RECURSIVAS DE PROFILES
-- ========================================
DROP POLICY IF EXISTS "Allow users to read profiles in their own tenant" ON public.profiles;
DROP POLICY IF EXISTS "UsuÃ¡rios podem ler perfis do mesmo cliente" ON public.profiles;
DROP POLICY IF EXISTS "UsuÃ¡rios podem ler seu prÃ³prio perfil" ON public.profiles;
DROP POLICY IF EXISTS "Platform admins can read all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins de cliente podem gerenciar usuÃ¡rios" ON public.profiles;
DROP POLICY IF EXISTS "Multi-tenant: INSERT profiles" ON public.profiles;
DROP POLICY IF EXISTS "UsuÃ¡rios autenticados podem inserir perfis" ON public.profiles;
DROP POLICY IF EXISTS "Multi-tenant: UPDATE profiles" ON public.profiles;
DROP POLICY IF EXISTS "UsuÃ¡rios podem atualizar seu prÃ³prio perfil" ON public.profiles;
DROP POLICY IF EXISTS "Multi-tenant: SELECT profiles" ON public.profiles;
DROP POLICY IF EXISTS "Multi-tenant: DELETE profiles" ON public.profiles;

-- ========================================
-- CRIAR POLÃTICAS MINIMALISTAS (SEM RECURSÃƒO)
-- ========================================

-- SELECT: Admins veem tudo, usuÃ¡rios veem sÃ³ o prÃ³prio perfil
CREATE POLICY "Allow platform admins and users to see their own profile"
ON public.profiles
FOR SELECT
TO authenticated
USING (
  public.is_platform_admin(auth.uid())
  OR 
  id = auth.uid()
);

-- INSERT: Apenas platform admins
CREATE POLICY "Only platform admins can insert profiles"
ON public.profiles
FOR INSERT
TO authenticated
WITH CHECK (
  public.is_platform_admin(auth.uid())
);

-- UPDATE: Admins ou prÃ³prio perfil
CREATE POLICY "Platform admins and users can update own profile"
ON public.profiles
FOR UPDATE
TO authenticated
USING (
  public.is_platform_admin(auth.uid()) OR id = auth.uid()
)
WITH CHECK (
  public.is_platform_admin(auth.uid()) OR id = auth.uid()
);

-- DELETE: Apenas platform admins
CREATE POLICY "Only platform admins can delete profiles"
ON public.profiles
FOR DELETE
TO authenticated
USING (
  public.is_platform_admin(auth.uid())
);


-- ============================================================================
-- MIGRATION: 20251027160327_e797d2dd-92f3-4f7c-9b27-a1f34b0ffc3a.sql
-- ============================================================================

-- =====================================================
-- 1. CRIAR ENUM PARA TIPOS DE TEMPLATE
-- =====================================================
CREATE TYPE public.template_type AS ENUM ('profile_template', 'content_block');

-- =====================================================
-- 2. CRIAR TABELA digital_templates
-- =====================================================
CREATE TABLE public.digital_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  type public.template_type NOT NULL,
  description TEXT,
  content JSONB DEFAULT '{}'::jsonb,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =====================================================
-- 3. COMENTÃRIOS PARA DOCUMENTAÃ‡ÃƒO
-- =====================================================
COMMENT ON TABLE public.digital_templates IS 
  'Armazena perfis digitais completos e blocos de conteÃºdo reutilizÃ¡veis';

COMMENT ON COLUMN public.digital_templates.type IS 
  'Tipo do template: profile_template (perfil completo) ou content_block (bloco reutilizÃ¡vel)';

COMMENT ON COLUMN public.digital_templates.content IS 
  'Estrutura JSON flexÃ­vel que armazena os blocos e design do template';

COMMENT ON COLUMN public.digital_templates.description IS 
  'DescriÃ§Ã£o opcional do template para ajudar na identificaÃ§Ã£o';

-- =====================================================
-- 4. ÃNDICES PARA PERFORMANCE
-- =====================================================
CREATE INDEX idx_digital_templates_type ON public.digital_templates(type);
CREATE INDEX idx_digital_templates_created_by ON public.digital_templates(created_by);
CREATE INDEX idx_digital_templates_created_at ON public.digital_templates(created_at DESC);

-- Ãndice GIN para busca eficiente no JSONB
CREATE INDEX idx_digital_templates_content ON public.digital_templates USING GIN(content);

-- =====================================================
-- 5. TRIGGER PARA ATUALIZAÃ‡ÃƒO AUTOMÃTICA DE updated_at
-- =====================================================
CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON public.digital_templates
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- =====================================================
-- 6. HABILITAR ROW LEVEL SECURITY (RLS)
-- =====================================================
ALTER TABLE public.digital_templates ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- 7. POLÃTICAS RLS - LEITURA (SELECT)
-- =====================================================

-- Platform admins podem ver todos os templates
CREATE POLICY "Platform admins can view all templates"
  ON public.digital_templates
  FOR SELECT
  TO authenticated
  USING (
    user_has_platform_role(auth.uid(), ARRAY['super_admin', 'admin', 'manager'])
  );

-- UsuÃ¡rios autenticados podem ver templates criados por eles
CREATE POLICY "Users can view their own templates"
  ON public.digital_templates
  FOR SELECT
  TO authenticated
  USING (created_by = auth.uid());

-- =====================================================
-- 8. POLÃTICAS RLS - CRIAÃ‡ÃƒO (INSERT)
-- =====================================================

-- Apenas platform admins podem criar templates
CREATE POLICY "Platform admins can create templates"
  ON public.digital_templates
  FOR INSERT
  TO authenticated
  WITH CHECK (
    user_has_platform_role(auth.uid(), ARRAY['super_admin', 'admin', 'manager'])
  );

-- =====================================================
-- 9. POLÃTICAS RLS - ATUALIZAÃ‡ÃƒO (UPDATE)
-- =====================================================

-- Platform admins podem atualizar todos os templates
CREATE POLICY "Platform admins can update all templates"
  ON public.digital_templates
  FOR UPDATE
  TO authenticated
  USING (
    user_has_platform_role(auth.uid(), ARRAY['super_admin', 'admin', 'manager'])
  )
  WITH CHECK (
    user_has_platform_role(auth.uid(), ARRAY['super_admin', 'admin', 'manager'])
  );

-- UsuÃ¡rios podem atualizar apenas seus prÃ³prios templates
CREATE POLICY "Users can update their own templates"
  ON public.digital_templates
  FOR UPDATE
  TO authenticated
  USING (created_by = auth.uid())
  WITH CHECK (created_by = auth.uid());

-- =====================================================
-- 10. POLÃTICAS RLS - EXCLUSÃƒO (DELETE)
-- =====================================================

-- Apenas super_admins podem deletar templates
CREATE POLICY "Super admins can delete templates"
  ON public.digital_templates
  FOR DELETE
  TO authenticated
  USING (
    user_has_platform_role(auth.uid(), ARRAY['super_admin'])
  );


-- ============================================================================
-- MIGRATION: 20251027224505_a1f91371-fed1-4a6b-8d1e-d72f9eaaa22a.sql
-- ============================================================================

-- ============================================
-- DIGITAL PROFILES: Estrutura Completa
-- ============================================

-- 1. Criar funÃ§Ã£o para gerar short_id Ãºnico
CREATE OR REPLACE FUNCTION public.generate_short_id()
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
  chars TEXT := 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  result TEXT := '';
  i INTEGER;
  random_index INTEGER;
BEGIN
  FOR i IN 1..12 LOOP
    random_index := floor(random() * length(chars) + 1)::INTEGER;
    result := result || substr(chars, random_index, 1);
  END LOOP;
  RETURN result;
END;
$$;

-- 2. Criar tabela principal
CREATE TABLE IF NOT EXISTS public.digital_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  short_id TEXT NOT NULL UNIQUE DEFAULT public.generate_short_id(),
  slug TEXT UNIQUE,
  type TEXT NOT NULL CHECK (type IN ('personal', 'business')),
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  content JSONB DEFAULT '{}'::jsonb,
  password TEXT,
  no_index BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. Criar Ã­ndices
CREATE INDEX idx_digital_profiles_short_id ON public.digital_profiles(short_id);
CREATE INDEX idx_digital_profiles_slug ON public.digital_profiles(slug) WHERE slug IS NOT NULL;
CREATE INDEX idx_digital_profiles_client_id ON public.digital_profiles(client_id);
CREATE INDEX idx_digital_profiles_client_status ON public.digital_profiles(client_id, status);
CREATE INDEX idx_digital_profiles_type ON public.digital_profiles(type);

-- 4. Trigger para updated_at
CREATE TRIGGER update_digital_profiles_updated_at
  BEFORE UPDATE ON public.digital_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- 5. Habilitar RLS
ALTER TABLE public.digital_profiles ENABLE ROW LEVEL SECURITY;

-- 6. PolÃ­ticas RLS: Platform Admins
CREATE POLICY "Platform admins can view all digital profiles"
ON public.digital_profiles FOR SELECT TO authenticated
USING (user_has_platform_role(auth.uid(), ARRAY['super_admin', 'admin', 'manager']));

CREATE POLICY "Platform admins can create digital profiles"
ON public.digital_profiles FOR INSERT TO authenticated
WITH CHECK (user_has_platform_role(auth.uid(), ARRAY['super_admin', 'admin', 'manager']));

CREATE POLICY "Platform admins can update all digital profiles"
ON public.digital_profiles FOR UPDATE TO authenticated
USING (user_has_platform_role(auth.uid(), ARRAY['super_admin', 'admin', 'manager']))
WITH CHECK (user_has_platform_role(auth.uid(), ARRAY['super_admin', 'admin', 'manager']));

CREATE POLICY "Super admins can delete digital profiles"
ON public.digital_profiles FOR DELETE TO authenticated
USING (user_has_platform_role(auth.uid(), ARRAY['super_admin']));

-- 7. PolÃ­ticas RLS: Client Users
CREATE POLICY "Client users can view their client's digital profiles"
ON public.digital_profiles FOR SELECT TO authenticated
USING (client_id = get_user_client_id(auth.uid()));

CREATE POLICY "Client admins can create digital profiles for their client"
ON public.digital_profiles FOR INSERT TO authenticated
WITH CHECK (
  client_id = get_user_client_id(auth.uid())
  AND EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND client_user_role IN ('client_admin', 'client_manager')
  )
);

CREATE POLICY "Client admins can update their client's digital profiles"
ON public.digital_profiles FOR UPDATE TO authenticated
USING (
  client_id = get_user_client_id(auth.uid())
  AND EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND client_user_role IN ('client_admin', 'client_manager')
  )
)
WITH CHECK (
  client_id = get_user_client_id(auth.uid())
  AND EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND client_user_role IN ('client_admin', 'client_manager')
  )
);

CREATE POLICY "Client admins can delete their client's digital profiles"
ON public.digital_profiles FOR DELETE TO authenticated
USING (
  client_id = get_user_client_id(auth.uid())
  AND EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND client_user_role = 'client_admin'
  )
);

-- 8. PolÃ­tica RLS: Acesso PÃºblico
CREATE POLICY "Public can view published digital profiles without password"
ON public.digital_profiles FOR SELECT TO anon, authenticated
USING (status = 'published' AND password IS NULL);

-- 9. ComentÃ¡rios (DocumentaÃ§Ã£o)
COMMENT ON TABLE public.digital_profiles IS 'Armazena perfis digitais publicÃ¡veis (pÃ¡ginas) pertencentes a clientes';
COMMENT ON COLUMN public.digital_profiles.short_id IS 'ID Ãºnico imutÃ¡vel de 12 caracteres para URL curta';
COMMENT ON COLUMN public.digital_profiles.slug IS 'URL amigÃ¡vel editÃ¡vel pelo usuÃ¡rio';
COMMENT ON COLUMN public.digital_profiles.type IS 'Tipo do perfil: personal ou business';
COMMENT ON COLUMN public.digital_profiles.content IS 'Estrutura de blocos e design do perfil em formato JSON';
COMMENT ON COLUMN public.digital_profiles.status IS 'Status de publicaÃ§Ã£o: draft, published ou archived';
COMMENT ON COLUMN public.digital_profiles.password IS 'Senha para perfis protegidos (nullable = pÃºblico)';
COMMENT ON COLUMN public.digital_profiles.no_index IS 'Se true, instrui buscadores a nÃ£o indexar esta pÃ¡gina';


-- ============================================================================
-- MIGRATION: 20251028124947_1244f645-b4a6-431f-bc12-337176b4ee0f.sql
-- ============================================================================

-- =====================================================
-- ETAPA 1: CRIAR TEMPLATE PADRÃƒO
-- =====================================================
-- Inserir template padrÃ£o que serÃ¡ usado como fallback
INSERT INTO public.digital_templates (
  id,
  name,
  type,
  description,
  content,
  created_by
) VALUES (
  '00000000-0000-0000-0000-000000000001'::UUID,
  'Template PadrÃ£o (Sistema)',
  'profile_template'::public.template_type,
  'Template padrÃ£o criado automaticamente para perfis sem template especÃ­fico. Este template pode ser editado ou substituÃ­do.',
  '{
    "blocks": [
      {
        "id": "default-header",
        "type": "text",
        "content": {
          "text": "Bem-vindo ao meu perfil",
          "style": {
            "fontSize": "2xl",
            "fontWeight": "bold",
            "textAlign": "center"
          }
        }
      },
      {
        "id": "default-description",
        "type": "text",
        "content": {
          "text": "Este Ã© um perfil digital criado com nosso sistema. Configure seu template para personalizar esta pÃ¡gina.",
          "style": {
            "fontSize": "base",
            "textAlign": "center",
            "color": "muted"
          }
        }
      }
    ],
    "theme": {
      "primaryColor": "#3b82f6",
      "backgroundColor": "#ffffff",
      "fontFamily": "Inter"
    }
  }'::JSONB,
  NULL
)
ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- ETAPA 2: ADICIONAR COLUNA active_template_id (NULLABLE)
-- =====================================================
-- Adicionar coluna temporariamente como NULLABLE
ALTER TABLE public.digital_profiles
ADD COLUMN IF NOT EXISTS active_template_id UUID;

-- Adicionar chave estrangeira com ON DELETE RESTRICT
ALTER TABLE public.digital_profiles
ADD CONSTRAINT fk_digital_profiles_active_template
FOREIGN KEY (active_template_id)
REFERENCES public.digital_templates(id)
ON DELETE RESTRICT;

-- Criar Ã­ndice para otimizar queries que buscam perfis por template
CREATE INDEX IF NOT EXISTS idx_digital_profiles_active_template_id 
ON public.digital_profiles(active_template_id);

-- Adicionar comentÃ¡rio descritivo
COMMENT ON COLUMN public.digital_profiles.active_template_id IS 
'ID do template ativo obrigatÃ³rio que serÃ¡ exibido neste perfil/URL. Referencia digital_templates(id).';

-- =====================================================
-- ETAPA 3: POPULAR PERFIS EXISTENTES E TORNAR NOT NULL
-- =====================================================
-- Atualizar todos os perfis existentes para usar o template padrÃ£o
UPDATE public.digital_profiles
SET active_template_id = '00000000-0000-0000-0000-000000000001'::UUID
WHERE active_template_id IS NULL;

-- Verificar se todos os perfis foram atualizados
DO $$
DECLARE
  null_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO null_count
  FROM public.digital_profiles
  WHERE active_template_id IS NULL;
  
  IF null_count > 0 THEN
    RAISE EXCEPTION 'Ainda existem % perfis sem template associado. Abortando migraÃ§Ã£o.', null_count;
  END IF;
  
  RAISE NOTICE 'VerificaÃ§Ã£o concluÃ­da: Todos os perfis possuem template associado.';
END $$;

-- Tornar a coluna NOT NULL
ALTER TABLE public.digital_profiles
ALTER COLUMN active_template_id SET NOT NULL;

-- =====================================================
-- VALIDAÃ‡ÃƒO FINAL
-- =====================================================
DO $$
BEGIN
  RAISE NOTICE 'âœ… MigraÃ§Ã£o concluÃ­da com sucesso!';
  RAISE NOTICE 'ðŸ“Š Template padrÃ£o ID: 00000000-0000-0000-0000-000000000001';
  RAISE NOTICE 'ðŸ”— Coluna active_template_id criada como NOT NULL com FK';
  RAISE NOTICE 'ðŸ“ˆ Ãndice idx_digital_profiles_active_template_id criado';
END $$;


-- ============================================================================
-- MIGRATION: 20251028144847_3d478bce-2e98-4bea-9cda-7fd7ac2c83d0.sql
-- ============================================================================

-- Add status column to digital_templates
ALTER TABLE public.digital_templates 
ADD COLUMN status TEXT NOT NULL DEFAULT 'draft' 
CHECK (status IN ('draft', 'published', 'archived'));

-- Add index for performance
CREATE INDEX idx_digital_templates_status ON public.digital_templates(status);

-- Add comment
COMMENT ON COLUMN public.digital_templates.status IS 'Template status: draft (editing), published (available in gallery), archived (hidden but preserved)';


-- ============================================================================
-- MIGRATION: 20251030000001_add_unidade_team_id_status_to_profiles.sql
-- ============================================================================

-- ============================================================================
-- MIGRATION: Adicionar colunas unidade, team_id e status Ã  tabela profiles
-- ============================================================================
-- Data: 30 de outubro de 2025
-- DescriÃ§Ã£o: Adiciona suporte a unidades, equipes e status de usuÃ¡rios dos clientes
-- ============================================================================

-- 1. Adicionar coluna unidade (onde o usuÃ¡rio trabalha)
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS unidade TEXT NULL;

COMMENT ON COLUMN public.profiles.unidade IS 'Local ou unidade onde o usuÃ¡rio trabalha. Ex: EscritÃ³rio RJ - Sala 205';

-- 2. Adicionar coluna status (ativo/inativo)
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'ativo'
CHECK (status IN ('ativo', 'inativo'));

COMMENT ON COLUMN public.profiles.status IS 'Status do usuÃ¡rio: ativo ou inativo';

-- 3. Criar Ã­ndice para performance
CREATE INDEX IF NOT EXISTS idx_profiles_status ON public.profiles(status);

-- 4. Nota: A coluna team_id serÃ¡ adicionada apÃ³s a criaÃ§Ã£o da tabela teams
-- Ver migration: create_teams_table



-- ============================================================================
-- MIGRATION: 20251030000002_create_teams_table.sql
-- ============================================================================

-- ============================================================================
-- MIGRATION: Criar tabela teams (equipes/setores de clientes)
-- ============================================================================
-- Data: 30 de outubro de 2025
-- DescriÃ§Ã£o: Tabela para organizar usuÃ¡rios em equipes dentro de cada cliente
-- ============================================================================

-- 1. Criar tabela teams
CREATE TABLE IF NOT EXISTS public.teams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE public.teams IS 'Equipes ou setores dentro de um cliente (tenant)';
COMMENT ON COLUMN public.teams.id IS 'ID Ãºnico da equipe';
COMMENT ON COLUMN public.teams.client_id IS 'ID do cliente ao qual esta equipe pertence';
COMMENT ON COLUMN public.teams.name IS 'Nome da equipe/setor';
COMMENT ON COLUMN public.teams.description IS 'DescriÃ§Ã£o ou objetivo da equipe';
COMMENT ON COLUMN public.teams.created_at IS 'Data de criaÃ§Ã£o da equipe';
COMMENT ON COLUMN public.teams.updated_at IS 'Data da Ãºltima atualizaÃ§Ã£o';

-- 2. Criar Ã­ndices para performance
CREATE INDEX IF NOT EXISTS idx_teams_client_id ON public.teams(client_id);
CREATE INDEX IF NOT EXISTS idx_teams_client_name ON public.teams(client_id, name);

-- 3. Criar trigger para atualizar updated_at
DROP TRIGGER IF EXISTS update_teams_updated_at ON public.teams;
CREATE TRIGGER update_teams_updated_at
  BEFORE UPDATE ON public.teams
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- 4. Adicionar coluna team_id Ã  tabela profiles
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS team_id UUID REFERENCES public.teams(id) ON DELETE SET NULL;

COMMENT ON COLUMN public.profiles.team_id IS 'ID da equipe Ã  qual o usuÃ¡rio pertence. Nullable se nÃ£o pertence a nenhuma equipe.';

-- 5. Criar Ã­ndice para team_id
CREATE INDEX IF NOT EXISTS idx_profiles_team_id ON public.profiles(team_id);

-- 6. Habilitar RLS
ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;

-- 7. Remover polÃ­ticas antigas (se existirem)
DROP POLICY IF EXISTS "Users can view their client's teams" ON public.teams;
DROP POLICY IF EXISTS "Client users can view teams" ON public.teams;
DROP POLICY IF EXISTS "Client admins can manage teams" ON public.teams;

-- 8. Criar polÃ­ticas RLS para teams
-- Policy: Platform admins podem ler todas as teams
CREATE POLICY "Platform admins can read all teams"
ON public.teams
FOR SELECT
TO authenticated
USING (
  public.is_platform_admin(auth.uid())
);

-- Policy: UsuÃ¡rios do cliente podem ler teams do seu prÃ³prio cliente
CREATE POLICY "Client users can read their client's teams"
ON public.teams
FOR SELECT
TO authenticated
USING (
  client_id = public.get_user_client_id(auth.uid())
  AND public.get_user_client_id(auth.uid()) IS NOT NULL
);

-- Policy: Platform admins podem criar teams
CREATE POLICY "Platform admins can create teams"
ON public.teams
FOR INSERT
TO authenticated
WITH CHECK (
  public.is_platform_admin(auth.uid())
);

-- Policy: Client admins podem criar teams para seu cliente
CREATE POLICY "Client admins can create teams"
ON public.teams
FOR INSERT
TO authenticated
WITH CHECK (
  client_id = public.get_user_client_id(auth.uid())
  AND public.is_client_admin(auth.uid())
);

-- Policy: Platform admins podem atualizar qualquer team
CREATE POLICY "Platform admins can update all teams"
ON public.teams
FOR UPDATE
TO authenticated
USING (
  public.is_platform_admin(auth.uid())
)
WITH CHECK (
  public.is_platform_admin(auth.uid())
);

-- Policy: Client admins podem atualizar teams do seu cliente
CREATE POLICY "Client admins can update their teams"
ON public.teams
FOR UPDATE
TO authenticated
USING (
  client_id = public.get_user_client_id(auth.uid())
  AND public.is_client_admin(auth.uid())
)
WITH CHECK (
  client_id = public.get_user_client_id(auth.uid())
  AND public.is_client_admin(auth.uid())
);

-- Policy: Platform admins podem deletar teams
CREATE POLICY "Platform admins can delete teams"
ON public.teams
FOR DELETE
TO authenticated
USING (
  public.is_platform_admin(auth.uid())
);

-- Policy: Client admins podem deletar teams do seu cliente
CREATE POLICY "Client admins can delete their teams"
ON public.teams
FOR DELETE
TO authenticated
USING (
  client_id = public.get_user_client_id(auth.uid())
  AND public.is_client_admin(auth.uid())
);



-- ============================================================================
-- MIGRATION: 20251030000003_update_profiles_rls_policies.sql
-- ============================================================================

-- ============================================================================
-- MIGRATION: Atualizar polÃ­ticas RLS para profiles - Permitir client_admin inserir
-- ============================================================================
-- Data: 30 de outubro de 2025
-- DescriÃ§Ã£o: Permite que client_admin e client_manager criem novos perfis de usuÃ¡rios
-- dentro do seu prÃ³prio cliente (tenant)
-- ============================================================================

-- 1. Remover polÃ­tica antiga de INSERT que estava muito restritiva
DROP POLICY IF EXISTS "Multi-tenant: INSERT profiles" ON public.profiles;

-- 2. Criar nova policy: Apenas platform admins podem fazer INSERT diretamente
CREATE POLICY "Platform admins can insert profiles"
ON public.profiles
FOR INSERT
TO authenticated
WITH CHECK (
  public.is_platform_admin(auth.uid())
);

-- 3. Criar nova policy: Client admins e managers podem inserir perfis para seu cliente
CREATE POLICY "Client admins and managers can insert team members"
ON public.profiles
FOR INSERT
TO authenticated
WITH CHECK (
  -- O novo perfil deve pertencer ao mesmo cliente do usuÃ¡rio logado
  client_id = public.get_user_client_id(auth.uid())
  AND public.get_user_client_id(auth.uid()) IS NOT NULL
  -- E o usuÃ¡rio logado deve ser admin ou manager do cliente
  AND (
    public.is_client_admin(auth.uid())
    OR
    EXISTS (
      SELECT 1
      FROM public.profiles
      WHERE id = auth.uid()
        AND client_user_role = 'client_manager'
        AND client_id IS NOT NULL
    )
  )
);

-- 4. Atualizar policy de UPDATE para profiles
-- Remover policies antigas de UPDATE
DROP POLICY IF EXISTS "Multi-tenant: UPDATE profiles" ON public.profiles;

-- Policy: Platform admins podem atualizar qualquer perfil
CREATE POLICY "Platform admins can update all profiles"
ON public.profiles
FOR UPDATE
TO authenticated
USING (
  public.is_platform_admin(auth.uid())
)
WITH CHECK (
  public.is_platform_admin(auth.uid())
);

-- Policy: UsuÃ¡rios podem atualizar suas prÃ³prias informaÃ§Ãµes
CREATE POLICY "Users can update their own profile"
ON public.profiles
FOR UPDATE
TO authenticated
USING (
  id = auth.uid()
)
WITH CHECK (
  id = auth.uid()
);

-- Policy: Client admins podem atualizar perfis do seu cliente
CREATE POLICY "Client admins can update their client's profiles"
ON public.profiles
FOR UPDATE
TO authenticated
USING (
  client_id = public.get_user_client_id(auth.uid())
  AND public.is_client_admin(auth.uid())
  AND client_id IS NOT NULL
)
WITH CHECK (
  client_id = public.get_user_client_id(auth.uid())
  AND public.is_client_admin(auth.uid())
  AND client_id IS NOT NULL
);

-- Policy: Client managers podem atualizar alguns campos dos perfis do seu cliente
CREATE POLICY "Client managers can update some profile fields"
ON public.profiles
FOR UPDATE
TO authenticated
USING (
  client_id = public.get_user_client_id(auth.uid())
  AND EXISTS (
    SELECT 1
    FROM public.profiles p
    WHERE p.id = auth.uid()
      AND p.client_user_role = 'client_manager'
      AND p.client_id IS NOT NULL
  )
)
WITH CHECK (
  client_id = public.get_user_client_id(auth.uid())
  AND EXISTS (
    SELECT 1
    FROM public.profiles p
    WHERE p.id = auth.uid()
      AND p.client_user_role = 'client_manager'
      AND p.client_id IS NOT NULL
  )
);

-- 5. Adicionar policy de DELETE para profiles (admin delete)
DROP POLICY IF EXISTS "Only admins can delete" ON public.profiles;

CREATE POLICY "Platform admins can delete profiles"
ON public.profiles
FOR DELETE
TO authenticated
USING (
  public.is_platform_admin(auth.uid())
);

CREATE POLICY "Client admins can delete team members"
ON public.profiles
FOR DELETE
TO authenticated
USING (
  client_id = public.get_user_client_id(auth.uid())
  AND public.is_client_admin(auth.uid())
  AND client_id IS NOT NULL
);

-- 6. DocumentaÃ§Ã£o das polÃ­ticas
COMMENT ON COLUMN public.profiles.client_id IS 'ID do cliente (tenant). NULL para administradores da plataforma.';
COMMENT ON COLUMN public.profiles.client_user_role IS 'Papel do usuÃ¡rio dentro do cliente. NULL para admins da plataforma.';
COMMENT ON COLUMN public.profiles.unidade IS 'Local ou unidade onde o usuÃ¡rio trabalha.';
COMMENT ON COLUMN public.profiles.team_id IS 'ID da equipe Ã  qual o usuÃ¡rio pertence (opcional).';
COMMENT ON COLUMN public.profiles.status IS 'Status do usuÃ¡rio: ativo ou inativo.';



-- ============================================================================
-- MIGRATION: 20251030000004_fix_is_platform_admin_function.sql
-- ============================================================================

-- =====================================================
-- Recriar funÃ§Ã£o is_platform_admin com DROP FORCE
-- =====================================================
-- PROBLEMA IDENTIFICADO: A funÃ§Ã£o antiga estava consultando
-- a tabela `profiles` com coluna `client_user_role` em vez de
-- consultar a tabela `user_roles` com a coluna `role`.
-- =====================================================

-- IMPORTANTE: Remover a funÃ§Ã£o antiga para forÃ§ar recompilaÃ§Ã£o
DROP FUNCTION IF EXISTS public.is_platform_admin(_user_id uuid) CASCADE;

-- Recriar a funÃ§Ã£o com a lÃ³gica CORRETA
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

-- Garantir que a funÃ§Ã£o Ã© acessÃ­vel
GRANT EXECUTE ON FUNCTION public.is_platform_admin(uuid) TO authenticated, anon, service_role;



