-- ============================================================================
-- MIGRATION: Criar função get_user_workspace_id
-- ============================================================================
-- Data: 04 de novembro de 2025
-- Fase: PREPARAÇÃO
-- Descrição: Cria função helper para substituir get_user_client_id()
--            Retorna o workspace_id do usuário autenticado
-- ============================================================================

-- ============================================================================
-- ETAPA 1: Criar função get_user_workspace_id
-- ============================================================================

CREATE OR REPLACE FUNCTION public.get_user_workspace_id(_user_id UUID)
RETURNS UUID
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT workspace_id
  FROM profiles
  WHERE id = _user_id;
$$;

COMMENT ON FUNCTION public.get_user_workspace_id(UUID) IS 'Retorna o workspace_id do usuário. Substitui get_user_client_id(). SECURITY DEFINER permite executar sem verificação RLS.';

-- ============================================================================
-- ETAPA 2: Criar função wrapper para auth.uid()
-- ============================================================================

CREATE OR REPLACE FUNCTION public.get_current_user_workspace_id()
RETURNS UUID
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.get_user_workspace_id(auth.uid());
$$;

COMMENT ON FUNCTION public.get_current_user_workspace_id() IS 'Retorna o workspace_id do usuário autenticado (wrapper de get_user_workspace_id com auth.uid())';

-- ============================================================================
-- VERIFICAÇÃO
-- ============================================================================

DO $$
BEGIN
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Migration 13 concluída com sucesso!';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Funções criadas:';
  RAISE NOTICE '- get_user_workspace_id(user_id)';
  RAISE NOTICE '- get_current_user_workspace_id()';
  RAISE NOTICE '';
  RAISE NOTICE 'NOTA: get_user_client_id() ainda existe';
  RAISE NOTICE 'Será removida na Fase 3';
END $$;
