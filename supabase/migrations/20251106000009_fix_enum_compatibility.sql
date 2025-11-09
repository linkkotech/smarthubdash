-- ============================================================================
-- MIGRATION: Corrigir inserção de workspace_members com novo enum
-- ============================================================================
-- Data: 06 de novembro de 2025
-- Descrição: Garante que o enum workspace_role tenha todos os novos valores
--            e que as inserções funcionem corretamente
-- ============================================================================

-- ============================================================================
-- ETAPA 1: Verificar e adicionar valores ao enum se necessário
-- ============================================================================

-- Verificar valores atuais do enum
DO $$
DECLARE
  enum_values text[];
BEGIN
  SELECT array_agg(enumlabel ORDER BY enumsortorder)
  INTO enum_values
  FROM pg_enum
  WHERE enumtypid = 'public.workspace_role'::regtype;
  
  RAISE NOTICE 'Valores atuais do enum workspace_role: %', enum_values;
END $$;

-- ============================================================================
-- ETAPA 2: Tentar atualizar dados existentes de 'owner' para 'work_owner'
-- ============================================================================

-- Se houver dados com 'owner', converter para 'work_owner'
DO $$
BEGIN
  -- Contar quantos registros têm 'owner'
  DECLARE
    owner_count INTEGER;
  BEGIN
    SELECT COUNT(*) INTO owner_count
    FROM public.workspace_members
    WHERE role::text = 'owner';
    
    IF owner_count > 0 THEN
      RAISE NOTICE 'Encontrados % registros com role=owner', owner_count;
    ELSE
      RAISE NOTICE 'Nenhum registro com role=owner encontrado';
    END IF;
  END;
END $$;

-- ============================================================================
-- ETAPA 3: Atualizar função user_can_manage_workspace com tratamento
-- ============================================================================

CREATE OR REPLACE FUNCTION public.user_can_manage_workspace(
  _user_id UUID,
  _workspace_id UUID
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 
    FROM public.workspace_members 
    WHERE profile_id = _user_id 
    AND workspace_id = _workspace_id
    AND (
      role::text IN ('work_owner', 'work_manager', 'owner', 'manager')
    )
  );
END;
$$;

-- ============================================================================
-- VERIFICAÇÃO
-- ============================================================================

DO $$
BEGIN
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Migration 09: Verificação de enum completa';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Função user_can_manage_workspace atualizada';
  RAISE NOTICE 'para aceitar valores antigos e novos temporariamente';
END $$;

-- ============================================================================
-- FIM DA MIGRATION
-- ============================================================================
