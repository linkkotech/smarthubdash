-- ============================================================================
-- GESTÃO DE USUÁRIOS DOS CLIENTES
-- ============================================================================
-- Este migration adiciona a estrutura necessária para gerenciar usuários
-- dos clientes (tenants), incluindo papéis específicos e permissões.
-- ============================================================================

-- ============================================================================
-- FASE 1: ESTRUTURA DE DADOS
-- ============================================================================

-- 1.1 Criar enum para papéis de usuários de clientes (se não existir)
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'client_user_role') THEN
    DROP TYPE IF EXISTS public.client_user_role CASCADE;
    CREATE TYPE public.client_user_role AS ENUM (
      'client_admin',    -- Administrador do cliente (acesso total dentro do tenant)
      'client_manager',  -- Gerente (pode gerenciar dados, mas não usuários)
      'client_member'    -- Membro básico (acesso apenas leitura/edição limitada)
    );
    COMMENT ON TYPE public.client_user_role IS 'Papéis específicos para usuários dos clientes (tenants)';
  END IF;
END $$;

-- 1.2 Adicionar coluna client_user_role à tabela profiles
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS client_user_role client_user_role NULL;

COMMENT ON COLUMN public.profiles.client_user_role IS 'Papel do usuário dentro do cliente. NULL para admins da plataforma.';

-- 1.3 Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_profiles_client_user_role 
ON public.profiles(client_user_role);

CREATE INDEX IF NOT EXISTS idx_profiles_client_role_composite 
ON public.profiles(client_id, client_user_role) 
WHERE client_id IS NOT NULL;

-- ============================================================================
-- FASE 2: FUNÇÕES DE SEGURANÇA
-- ============================================================================

-- 2.1 Função para verificar se usuário é admin do próprio cliente
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

COMMENT ON FUNCTION public.is_client_admin IS 'Verifica se o usuário é admin do próprio cliente';

-- ============================================================================
-- FASE 3: ATUALIZAÇÃO DE POLÍTICAS RLS
-- ============================================================================

-- 3.1 Remover políticas antigas de profiles
DROP POLICY IF EXISTS "Multi-tenant: INSERT profiles" ON public.profiles;
DROP POLICY IF EXISTS "Multi-tenant: SELECT profiles" ON public.profiles;
DROP POLICY IF EXISTS "Multi-tenant: UPDATE profiles" ON public.profiles;

-- 3.2 Criar novas políticas para profiles

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

-- UPDATE: Admins da plataforma podem editar todos, usuários podem editar a si mesmos
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