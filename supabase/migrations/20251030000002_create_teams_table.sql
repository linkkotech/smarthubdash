-- ============================================================================
-- MIGRATION: Criar tabela teams (equipes/setores de clientes)
-- ============================================================================
-- Data: 30 de outubro de 2025
-- Descrição: Tabela para organizar usuários em equipes dentro de cada cliente
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
COMMENT ON COLUMN public.teams.id IS 'ID único da equipe';
COMMENT ON COLUMN public.teams.client_id IS 'ID do cliente ao qual esta equipe pertence';
COMMENT ON COLUMN public.teams.name IS 'Nome da equipe/setor';
COMMENT ON COLUMN public.teams.description IS 'Descrição ou objetivo da equipe';
COMMENT ON COLUMN public.teams.created_at IS 'Data de criação da equipe';
COMMENT ON COLUMN public.teams.updated_at IS 'Data da última atualização';

-- 2. Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_teams_client_id ON public.teams(client_id);
CREATE INDEX IF NOT EXISTS idx_teams_client_name ON public.teams(client_id, name);

-- 3. Criar trigger para atualizar updated_at
CREATE TRIGGER IF NOT EXISTS update_teams_updated_at
  BEFORE UPDATE ON public.teams
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- 4. Adicionar coluna team_id à tabela profiles
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS team_id UUID REFERENCES public.teams(id) ON DELETE SET NULL;

COMMENT ON COLUMN public.profiles.team_id IS 'ID da equipe à qual o usuário pertence. Nullable se não pertence a nenhuma equipe.';

-- 5. Criar índice para team_id
CREATE INDEX IF NOT EXISTS idx_profiles_team_id ON public.profiles(team_id);

-- 6. Habilitar RLS
ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;

-- 7. Remover políticas antigas (se existirem)
DROP POLICY IF EXISTS "Users can view their client's teams" ON public.teams;
DROP POLICY IF EXISTS "Client users can view teams" ON public.teams;
DROP POLICY IF EXISTS "Client admins can manage teams" ON public.teams;

-- 8. Criar políticas RLS para teams
-- Policy: Platform admins podem ler todas as teams
CREATE POLICY "Platform admins can read all teams"
ON public.teams
FOR SELECT
TO authenticated
USING (
  public.is_platform_admin(auth.uid())
);

-- Policy: Usuários do cliente podem ler teams do seu próprio cliente
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
