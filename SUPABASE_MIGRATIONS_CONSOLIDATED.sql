-- ============================================================================
-- ARQUIVO CONSOLIDADO: Todas as 3 Migrations para Supabase
-- ============================================================================
-- Execute este script completo no Supabase SQL Editor
-- Acesse: https://app.supabase.com/project/jwgysmblroscppyahtpx/sql/new
-- ============================================================================

-- ============================================================================
-- MIGRATION 1: Adicionar colunas unidade e status à tabela profiles
-- ============================================================================

ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS unidade TEXT NULL;

COMMENT ON COLUMN public.profiles.unidade IS 'Local ou unidade onde o usuário trabalha. Ex: Escritório RJ - Sala 205';

ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'ativo'
CHECK (status IN ('ativo', 'inativo'));

COMMENT ON COLUMN public.profiles.status IS 'Status do usuário: ativo ou inativo';

CREATE INDEX IF NOT EXISTS idx_profiles_status ON public.profiles(status);

-- ============================================================================
-- CRIAR FUNÇÃO is_client_admin (necessária para as políticas RLS)
-- ============================================================================

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

COMMENT ON FUNCTION public.is_client_admin(uuid) IS 'Verifica se o usuário é admin do próprio cliente';

-- ============================================================================
-- CRIAR FUNÇÃO is_platform_admin (necessária para as políticas RLS)
-- ============================================================================

CREATE OR REPLACE FUNCTION public.is_platform_admin(_user_id uuid)
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
      AND client_user_role = 'platform_admin'
      AND client_id IS NULL
  );
$$;

COMMENT ON FUNCTION public.is_platform_admin(uuid) IS 'Verifica se o usuário é admin da plataforma';

-- ============================================================================
-- CRIAR FUNÇÃO get_user_client_id (necessária para as políticas RLS)
-- ============================================================================

CREATE OR REPLACE FUNCTION public.get_user_client_id(_user_id uuid)
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT client_id
  FROM public.profiles
  WHERE id = _user_id
  LIMIT 1;
$$;

COMMENT ON FUNCTION public.get_user_client_id(uuid) IS 'Retorna o client_id do usuário (NULL se for admin da plataforma)';

-- ============================================================================
-- CRIAR FUNÇÃO update_updated_at_column (necessária para os triggers)
-- ============================================================================

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

COMMENT ON FUNCTION public.update_updated_at_column() IS 'Trigger function que atualiza a coluna updated_at automaticamente';

-- ============================================================================
-- MIGRATION 2: Criar tabela teams e adicionar team_id em profiles
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.teams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE public.teams IS 'Equipes ou setores dentro de um cliente (tenant)';
COMMENT ON COLUMN public.teams.id IS 'ID único da equipe';
COMMENT ON COLUMN public.teams.client_id IS 'ID do cliente ao qual esta equipe pertence';
COMMENT ON COLUMN public.teams.name IS 'Nome da equipe/setor';
COMMENT ON COLUMN public.teams.description IS 'Descrição ou objetivo da equipe';
COMMENT ON COLUMN public.teams.created_at IS 'Data de criação da equipe';
COMMENT ON COLUMN public.teams.updated_at IS 'Data da última atualização';

CREATE INDEX IF NOT EXISTS idx_teams_client_id ON public.teams(client_id);
CREATE INDEX IF NOT EXISTS idx_teams_client_name ON public.teams(client_id, name);

-- Criar trigger se não existir
DO $$ 
BEGIN
  IF NOT EXISTS(SELECT 1 FROM pg_trigger WHERE tgname = 'update_teams_updated_at') THEN
    CREATE TRIGGER update_teams_updated_at
      BEFORE UPDATE ON public.teams
      FOR EACH ROW
      EXECUTE FUNCTION public.update_updated_at_column();
  END IF;
END $$;

ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS team_id UUID REFERENCES public.teams(id) ON DELETE SET NULL;

COMMENT ON COLUMN public.profiles.team_id IS 'ID da equipe à qual o usuário pertence. Nullable se não pertence a nenhuma equipe.';

CREATE INDEX IF NOT EXISTS idx_profiles_team_id ON public.profiles(team_id);

ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their client's teams" ON public.teams;
DROP POLICY IF EXISTS "Client users can view teams" ON public.teams;
DROP POLICY IF EXISTS "Client admins can manage teams" ON public.teams;

CREATE POLICY "Platform admins can read all teams"
ON public.teams
FOR SELECT
TO authenticated
USING (
  public.is_platform_admin(auth.uid())
);

CREATE POLICY "Client users can read their client's teams"
ON public.teams
FOR SELECT
TO authenticated
USING (
  client_id = public.get_user_client_id(auth.uid())
  AND public.get_user_client_id(auth.uid()) IS NOT NULL
);

CREATE POLICY "Platform admins can create teams"
ON public.teams
FOR INSERT
TO authenticated
WITH CHECK (
  public.is_platform_admin(auth.uid())
);

CREATE POLICY "Client admins can create teams"
ON public.teams
FOR INSERT
TO authenticated
WITH CHECK (
  client_id = public.get_user_client_id(auth.uid())
  AND public.is_client_admin(auth.uid())
);

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

CREATE POLICY "Platform admins can delete teams"
ON public.teams
FOR DELETE
TO authenticated
USING (
  public.is_platform_admin(auth.uid())
);

CREATE POLICY "Client admins can delete their teams"
ON public.teams
FOR DELETE
TO authenticated
USING (
  client_id = public.get_user_client_id(auth.uid())
  AND public.is_client_admin(auth.uid())
);

-- ============================================================================
-- MIGRATION 3: Atualizar políticas RLS para profiles
-- ============================================================================

DROP POLICY IF EXISTS "Multi-tenant: INSERT profiles" ON public.profiles;

CREATE POLICY "Platform admins can insert profiles"
ON public.profiles
FOR INSERT
TO authenticated
WITH CHECK (
  public.is_platform_admin(auth.uid())
);

CREATE POLICY "Client admins and managers can insert team members"
ON public.profiles
FOR INSERT
TO authenticated
WITH CHECK (
  client_id = public.get_user_client_id(auth.uid())
  AND public.get_user_client_id(auth.uid()) IS NOT NULL
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

DROP POLICY IF EXISTS "Multi-tenant: UPDATE profiles" ON public.profiles;

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

COMMENT ON COLUMN public.profiles.client_id IS 'ID do cliente (tenant). NULL para administradores da plataforma.';
COMMENT ON COLUMN public.profiles.client_user_role IS 'Papel do usuário dentro do cliente. NULL para admins da plataforma.';
COMMENT ON COLUMN public.profiles.unidade IS 'Local ou unidade onde o usuário trabalha.';
COMMENT ON COLUMN public.profiles.team_id IS 'ID da equipe à qual o usuário pertence (opcional).';
COMMENT ON COLUMN public.profiles.status IS 'Status do usuário: ativo ou inativo.';

-- ============================================================================
-- FIM: Todas as migrations foram aplicadas com sucesso!
-- ============================================================================
