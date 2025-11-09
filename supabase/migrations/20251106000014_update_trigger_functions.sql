-- ============================================================================
-- MIGRATION: Atualizar funções de trigger para usar novos valores do enum
-- ============================================================================
-- Data: 06 de novembro de 2025
-- Descrição: Atualiza prevent_last_owner_downgrade e sync_workspace_owner_id
--            para usar os novos valores do enum workspace_role
--            (work_owner, work_manager, work_user)
-- ============================================================================

-- ============================================================================
-- ETAPA 1: Atualizar prevent_last_owner_downgrade
-- ============================================================================
-- Função que impede que o último work_owner de um workspace seja rebaixado

CREATE OR REPLACE FUNCTION public.prevent_last_owner_downgrade()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
DECLARE
  owner_count INTEGER;
BEGIN
  -- Apenas validar se está alterando um work_owner
  IF (TG_OP = 'UPDATE' AND OLD.role = 'work_owner' AND NEW.role != 'work_owner') OR
     (TG_OP = 'DELETE' AND OLD.role = 'work_owner') THEN
    
    -- Contar quantos work_owners existem no workspace
    SELECT COUNT(*)
    INTO owner_count
    FROM public.workspace_members
    WHERE workspace_id = OLD.workspace_id
      AND role = 'work_owner';
    
    -- Se for o último work_owner, impedir a operação
    IF owner_count = 1 THEN
      RAISE EXCEPTION 'Cannot remove or downgrade the last owner of the workspace. Please assign another owner first.';
    END IF;
  END IF;
  
  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  ELSE
    RETURN NEW;
  END IF;
END;
$function$;

-- ============================================================================
-- ETAPA 2: Atualizar sync_workspace_owner_id
-- ============================================================================
-- Função que sincroniza o campo owner_id da tabela workspaces
-- com o membro que possui role 'work_owner'

CREATE OR REPLACE FUNCTION public.sync_workspace_owner_id()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  -- Quando um membro com role 'work_owner' é inserido ou atualizado
  IF NEW.role = 'work_owner' THEN
    UPDATE public.workspaces
    SET owner_id = NEW.profile_id
    WHERE id = NEW.workspace_id;
  END IF;
  
  -- Quando um owner é deletado ou role alterada, atualizar para próximo owner disponível
  IF (TG_OP = 'DELETE' OR (TG_OP = 'UPDATE' AND OLD.role = 'work_owner' AND NEW.role != 'work_owner')) THEN
    UPDATE public.workspaces
    SET owner_id = (
      SELECT profile_id 
      FROM public.workspace_members
      WHERE workspace_id = COALESCE(NEW.workspace_id, OLD.workspace_id)
        AND role = 'work_owner'
      LIMIT 1
    )
    WHERE id = COALESCE(NEW.workspace_id, OLD.workspace_id);
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$function$;

-- ============================================================================
-- ETAPA 3: Verificação
-- ============================================================================

DO $$
BEGIN
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Migration 14: Funções de trigger atualizadas';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Função 1: prevent_last_owner_downgrade';
  RAISE NOTICE '  - Verifica: role = work_owner';
  RAISE NOTICE '  - Protege: último work_owner do workspace';
  RAISE NOTICE '';
  RAISE NOTICE 'Função 2: sync_workspace_owner_id';
  RAISE NOTICE '  - Sincroniza: workspaces.owner_id';
  RAISE NOTICE '  - Com: workspace_members.profile_id (role=work_owner)';
  RAISE NOTICE '';
  RAISE NOTICE 'Valores atualizados: owner → work_owner';
  RAISE NOTICE '========================================';
END $$;

-- ============================================================================
-- FIM DA MIGRATION
-- ============================================================================
