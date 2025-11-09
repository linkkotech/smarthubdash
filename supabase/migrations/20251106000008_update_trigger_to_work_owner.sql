-- ============================================================================
-- MIGRATION: Atualizar trigger add_creator_as_workspace_owner para usar work_owner
-- ============================================================================
-- Data: 06 de novembro de 2025
-- Descrição: Atualiza o trigger e a função para inserir role='work_owner' 
--            ao invés de 'owner'
-- ============================================================================

-- ============================================================================
-- ETAPA 1: Atualizar função add_creator_as_workspace_owner
-- ============================================================================

CREATE OR REPLACE FUNCTION public.add_creator_as_workspace_owner()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Se não houver usuário autenticado (ex.: SERVICE_ROLE), não inserir automaticamente
  IF auth.uid() IS NULL THEN
    RAISE NOTICE 'add_creator_as_workspace_owner: auth.uid() is NULL, skipping auto-insert.';
    RETURN NEW;
  END IF;

  -- Adicionar o criador como work_owner do workspace
  INSERT INTO public.workspace_members (workspace_id, profile_id, role)
  VALUES (NEW.id, auth.uid(), 'work_owner'::public.workspace_role);

  RETURN NEW;
END;
$$;

-- ============================================================================
-- VERIFICAÇÃO
-- ============================================================================

DO $$
BEGIN
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Migration 08: Trigger atualizado';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Função add_creator_as_workspace_owner agora usa work_owner';
  RAISE NOTICE '';
  RAISE NOTICE 'NOTA: Edge Function create-workspace-admin também foi';
  RAISE NOTICE 'atualizada manualmente para usar work_owner';
END $$;

-- ============================================================================
-- FIM DA MIGRATION
-- ============================================================================
