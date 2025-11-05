-- ============================================================================
-- MIGRATION: Adicionar workspace_id nas tabelas existentes (Fase 1)
-- ============================================================================
-- Data: 04 de novembro de 2025
-- Fase: PREPARAÇÃO (não quebra sistema existente)
-- Descrição: Adiciona coluna workspace_id em tabelas que atualmente usam client_id
--            Permite coexistência temporária de ambas as estruturas
-- ============================================================================

-- ============================================================================
-- ETAPA 1: Adicionar workspace_id em profiles
-- ============================================================================

ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS workspace_id UUID REFERENCES public.workspaces(id) ON DELETE SET NULL;

COMMENT ON COLUMN public.profiles.workspace_id IS 'ID do workspace (tenant). Substitui client_id. NULL para administradores da plataforma.';

-- Criar índice para performance
CREATE INDEX IF NOT EXISTS idx_profiles_workspace_id ON public.profiles(workspace_id);

-- ============================================================================
-- ETAPA 2: Adicionar workspace_id em contracts
-- ============================================================================

ALTER TABLE public.contracts 
ADD COLUMN IF NOT EXISTS workspace_id UUID REFERENCES public.workspaces(id) ON DELETE CASCADE;

COMMENT ON COLUMN public.contracts.workspace_id IS 'ID do workspace ao qual este contrato pertence. Substitui client_id.';

-- Criar índice para performance
CREATE INDEX IF NOT EXISTS idx_contracts_workspace_id ON public.contracts(workspace_id);

-- ============================================================================
-- ETAPA 3: Adicionar workspace_id em digital_profiles
-- ============================================================================

-- Verificar se tabela existe antes de alterar
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'digital_profiles') THEN
    ALTER TABLE public.digital_profiles 
    ADD COLUMN IF NOT EXISTS workspace_id UUID REFERENCES public.workspaces(id) ON DELETE CASCADE;
    
    COMMENT ON COLUMN public.digital_profiles.workspace_id IS 'ID do workspace ao qual este template digital pertence. Substitui client_id.';
    
    CREATE INDEX IF NOT EXISTS idx_digital_profiles_workspace_id ON public.digital_profiles(workspace_id);
  END IF;
END $$;

-- ============================================================================
-- VERIFICAÇÃO: Listar colunas adicionadas
-- ============================================================================

DO $$
BEGIN
  RAISE NOTICE 'Migration 10 concluída com sucesso!';
  RAISE NOTICE 'Colunas workspace_id adicionadas em: profiles, contracts, digital_profiles';
  RAISE NOTICE 'NOTA: client_id ainda existe. Coexistência temporária para migração gradual.';
END $$;
