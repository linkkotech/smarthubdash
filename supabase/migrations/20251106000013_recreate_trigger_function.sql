-- ============================================================================
-- MIGRATION: Recriar trigger function add_creator_as_workspace_owner
-- ============================================================================
-- Data: 06 de novembro de 2025
-- Descrição: A migration anterior (20251106000012) deletou a função
--            add_creator_as_workspace_owner ao fazer DROP TYPE ... CASCADE.
--            Esta migration a recria.
-- ============================================================================

-- ============================================================================
-- ETAPA 1: Recriar função add_creator_as_workspace_owner
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
-- ETAPA 2: Verificação
-- ============================================================================

DO $$
BEGIN
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Migration 13: Trigger function recriada';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Função add_creator_as_workspace_owner restaurada';
  RAISE NOTICE 'Agora inserirá role=work_owner automaticamente';
END $$;

-- ============================================================================
-- FIM DA MIGRATION
-- ============================================================================
