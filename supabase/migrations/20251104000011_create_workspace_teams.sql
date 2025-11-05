-- ============================================================================
-- MIGRATION: Criar tabela workspace_teams
-- ============================================================================
-- Data: 04 de novembro de 2025
-- Fase: PREPARAÇÃO
-- Descrição: Cria tabela workspace_teams para substituir teams
--            Estrutura idêntica a teams, mas referenciando workspaces
-- ============================================================================

-- ============================================================================
-- ETAPA 1: Criar tabela workspace_teams
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.workspace_teams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE public.workspace_teams IS 'Equipes ou setores dentro de um workspace (tenant). Substitui a tabela teams.';
COMMENT ON COLUMN public.workspace_teams.id IS 'ID único da equipe';
COMMENT ON COLUMN public.workspace_teams.workspace_id IS 'ID do workspace ao qual esta equipe pertence';
COMMENT ON COLUMN public.workspace_teams.name IS 'Nome da equipe/setor';
COMMENT ON COLUMN public.workspace_teams.description IS 'Descrição ou objetivo da equipe';
COMMENT ON COLUMN public.workspace_teams.created_at IS 'Data de criação da equipe';
COMMENT ON COLUMN public.workspace_teams.updated_at IS 'Data da última atualização';

-- ============================================================================
-- ETAPA 2: Criar índices para performance
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_workspace_teams_workspace_id 
ON public.workspace_teams(workspace_id);

CREATE INDEX IF NOT EXISTS idx_workspace_teams_workspace_name 
ON public.workspace_teams(workspace_id, name);

-- ============================================================================
-- ETAPA 3: Criar trigger para atualizar updated_at
-- ============================================================================

CREATE TRIGGER update_workspace_teams_updated_at
  BEFORE UPDATE ON public.workspace_teams
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================================================
-- ETAPA 4: Adicionar coluna workspace_team_id em profiles
-- ============================================================================

ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS workspace_team_id UUID REFERENCES public.workspace_teams(id) ON DELETE SET NULL;

COMMENT ON COLUMN public.profiles.workspace_team_id IS 'ID da equipe do workspace à qual o usuário pertence. Substitui team_id. NULL se não pertence a nenhuma equipe.';

-- Criar índice
CREATE INDEX IF NOT EXISTS idx_profiles_workspace_team_id 
ON public.profiles(workspace_team_id);

-- ============================================================================
-- ETAPA 5: Habilitar RLS
-- ============================================================================

ALTER TABLE public.workspace_teams ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- ETAPA 6: Criar políticas RLS para workspace_teams
-- ============================================================================

-- Policy: Platform admins podem ler todas as workspace_teams
CREATE POLICY "Platform admins can read all workspace_teams"
ON public.workspace_teams
FOR SELECT
TO authenticated
USING (
  public.is_platform_admin(auth.uid())
);

-- Policy: Usuários do workspace podem ler teams do seu próprio workspace
-- NOTA: Esta policy será atualizada na Fase 2 quando get_user_workspace_id() existir
CREATE POLICY "Workspace users can read their workspace teams"
ON public.workspace_teams
FOR SELECT
TO authenticated
USING (
  -- Por enquanto, permitir apenas platform admins
  -- Será atualizado quando tivermos get_user_workspace_id()
  public.is_platform_admin(auth.uid())
);

-- Policy: Platform admins podem criar workspace_teams
CREATE POLICY "Platform admins can create workspace_teams"
ON public.workspace_teams
FOR INSERT
TO authenticated
WITH CHECK (
  public.is_platform_admin(auth.uid())
);

-- Policy: Platform admins podem atualizar workspace_teams
CREATE POLICY "Platform admins can update workspace_teams"
ON public.workspace_teams
FOR UPDATE
TO authenticated
USING (
  public.is_platform_admin(auth.uid())
);

-- Policy: Platform admins podem excluir workspace_teams
CREATE POLICY "Platform admins can delete workspace_teams"
ON public.workspace_teams
FOR DELETE
TO authenticated
USING (
  public.is_platform_admin(auth.uid())
);

-- ============================================================================
-- VERIFICAÇÃO
-- ============================================================================

DO $$
BEGIN
  RAISE NOTICE 'Migration 11 concluída com sucesso!';
  RAISE NOTICE 'Tabela workspace_teams criada com RLS habilitado';
  RAISE NOTICE 'Coluna workspace_team_id adicionada em profiles';
  RAISE NOTICE 'NOTA: Policies RLS serão refinadas na Fase 2 (após get_user_workspace_id)';
END $$;
