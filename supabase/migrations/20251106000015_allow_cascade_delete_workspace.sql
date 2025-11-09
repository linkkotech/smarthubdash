-- ============================================================================
-- MIGRATION: Permitir deleção em cascata de workspace members
-- ============================================================================
-- Data: 06 de novembro de 2025
-- Problema: A função prevent_last_owner_downgrade estava bloqueando a deleção
--           de workspaces porque impedia a exclusão do último work_owner, mesmo
--           quando o workspace inteiro estava sendo deletado (cascata).
-- Solução: Usar contexto (SET LOCAL) para indicar quando é deleção em cascata
--          de workspace. Quando o workspace é deletado, a constraint não deve
--          ser verificada.
-- ============================================================================

-- ============================================================================
-- ETAPA 1: Atualizar a função prevent_last_owner_downgrade
-- ============================================================================
-- Esta função agora verifica o contexto para saber se é deleção de workspace
-- em cascata. Se for, permite a deleção mesmo que seja o último owner.

CREATE OR REPLACE FUNCTION public.prevent_last_owner_downgrade()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
DECLARE
  owner_count INTEGER;
  is_cascading_delete BOOLEAN;
BEGIN
  -- Se é deleção em cascata do workspace (DELETE na workspace_members disposto
  -- por ON DELETE CASCADE de workspaces), não validar
  -- Verificamos o contexto: se current_setting retorna 'on', significa que
  -- já foi definido como cascata do workspace
  BEGIN
    is_cascading_delete := current_setting('app.deleting_workspace', true)::BOOLEAN;
  EXCEPTION WHEN OTHERS THEN
    is_cascading_delete := false;
  END;
  
  -- Se é uma cascata de workspace, permite a deleção
  IF is_cascading_delete THEN
    IF TG_OP = 'DELETE' THEN
      RETURN OLD;
    ELSE
      RETURN NEW;
    END IF;
  END IF;
  
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
-- ETAPA 2: Criar trigger BEFORE DELETE em workspaces
-- ============================================================================
-- Este trigger define o contexto antes de deletar um workspace para que
-- a função prevent_last_owner_downgrade saiba que é uma cascata

CREATE OR REPLACE FUNCTION public.set_workspace_cascade_delete_context()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  -- Definir o contexto para indicar que é uma deleção em cascata
  PERFORM set_config('app.deleting_workspace', 'true', true);
  RETURN OLD;
END;
$function$;

-- Dropar se já existe
DROP TRIGGER IF EXISTS set_workspace_cascade_delete_context_trigger ON public.workspaces;

-- Criar trigger que dispara ANTES da deleção do workspace
CREATE TRIGGER set_workspace_cascade_delete_context_trigger
  BEFORE DELETE ON public.workspaces
  FOR EACH ROW
  EXECUTE FUNCTION public.set_workspace_cascade_delete_context();

-- ============================================================================
-- ETAPA 3: Alternativa - UPDATE workspaces para iniciar DELETE direto de
--          workspace_members (mais seguro e sem restrições)
-- ============================================================================
-- Na prática, o Supabase não permite customizar triggers em tabelas do sistema.
-- A melhor solução é usar uma stored procedure ou RPC que:
-- 1. Define o contexto
-- 2. Deleta workspace_members diretamente
-- 3. Deleta o workspace

CREATE OR REPLACE FUNCTION public.delete_workspace_safely(workspace_id UUID)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
DECLARE
  v_result JSON;
BEGIN
  -- Definir contexto que vamos deletar workspace
  PERFORM set_config('app.deleting_workspace', 'true', true);
  
  -- Deletar todos os workspace_members primeiro (sem ativar a validação)
  DELETE FROM public.workspace_members
  WHERE workspace_members.workspace_id = delete_workspace_safely.workspace_id;
  
  -- Agora deletar o workspace (agora sem CASCADE bloqueando)
  DELETE FROM public.workspaces
  WHERE id = delete_workspace_safely.workspace_id;
  
  RETURN json_build_object(
    'success', true,
    'message', 'Workspace deleted successfully'
  );
EXCEPTION WHEN OTHERS THEN
  RETURN json_build_object(
    'success', false,
    'error', SQLERRM
  );
END;
$function$;

-- ============================================================================
-- ETAPA 4: Alteração na constraint ON DELETE
-- ============================================================================
-- Se a solução acima não funcionar, considerar remover CASCADE e fazer
-- DELETE manual em workspace_members primeiro.
-- Para agora, vamos apenas documentar que a RPC delete_workspace_safely
-- deve ser usada para deletar workspaces

COMMENT ON FUNCTION public.delete_workspace_safely(UUID) IS
'RPC seguro para deletar workspace. Usa contexto para evitar validação de
prevent_last_owner_downgrade durante cascata. Deve ser usado no lugar de DELETE
direto para contornar a restrição de último owner.';
