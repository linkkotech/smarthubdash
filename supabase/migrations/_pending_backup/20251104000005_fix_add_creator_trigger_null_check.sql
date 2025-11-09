-- ============================================================================
-- MIGRATION: Ajustar trigger add_creator_as_workspace_owner para ignorar execuções sem auth.uid()
-- ============================================================================
-- Descrição: Evita violação de NOT NULL quando workspaces são criados por funções com SERVICE_ROLE
-- Autor: ChatGPT
-- Data: 2025-11-04
--
-- Problema: O trigger original tentava inserir profile_id = auth.uid(), mas quando
--          a criação vem de uma Edge Function com SERVICE_ROLE_KEY, auth.uid() = NULL,
--          violando a constraint NOT NULL em workspace_members.
--
-- Solução: Adicionar verificação IF auth.uid() IS NULL THEN RETURN NEW para pular
--          a inserção automática. A Edge Function create-workspace-admin já adiciona
--          o membro corretamente, então não precisamos do trigger nesse caso.
-- ============================================================================

-- ============================================================================
-- ETAPA 1: Atualizar função add_creator_as_workspace_owner
-- ============================================================================

/**
 * Função: add_creator_as_workspace_owner
 *
 * Ajuste para lidar com contextos onde auth.uid() é NULL (ex.: SERVICE_ROLE).
 * Nesses casos, o proprietário inicial será atribuído por outra rotina
 * (ex.: Edge Function create-workspace-admin). Assim, evitamos inserir um
 * registro inválido em workspace_members.
 * 
 * Comportamento:
 * 1. Se auth.uid() NÃO É NULL: Insere o usuário como owner (criação normal via UI)
 * 2. Se auth.uid() É NULL: Retorna sem fazer nada (criação via Edge Function)
 */
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

  -- Adicionar o criador como owner do workspace
  INSERT INTO public.workspace_members (workspace_id, profile_id, role)
  VALUES (NEW.id, auth.uid(), 'owner');

  RETURN NEW;
END;
$$;

-- ============================================================================
-- FIM DA MIGRATION
-- ============================================================================
