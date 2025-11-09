-- ============================================================================
-- MIGRATION: Renomear workspace_role enum (corrigido - remove DEFAULT primeiro)
-- ============================================================================
-- Data: 06 de novembro de 2025
-- Descrição: Versão final que resolve o problema do DEFAULT
-- ============================================================================

-- ============================================================================
-- ETAPA 0: REMOVER DEFAULT ANTES DE TUDO
-- ============================================================================

DO $$
BEGIN
  ALTER TABLE public.workspace_members 
  ALTER COLUMN role DROP DEFAULT;

  RAISE NOTICE 'DEFAULT removido da coluna role';
END $$;

-- ============================================================================
-- ETAPA 1: Criar novo enum com novos valores
-- ============================================================================

DO $$
BEGIN
  CREATE TYPE public.workspace_role_new AS ENUM ('work_owner', 'work_manager', 'work_user');

  RAISE NOTICE 'Novo enum workspace_role_new criado';
END $$;

-- ============================================================================
-- ETAPA 2: Converter coluna usando novo enum
-- ============================================================================

DO $$
BEGIN
  ALTER TABLE public.workspace_members
  ALTER COLUMN role TYPE public.workspace_role_new USING (
    CASE 
      WHEN role::text = 'owner' THEN 'work_owner'::public.workspace_role_new
      WHEN role::text = 'manager' THEN 'work_manager'::public.workspace_role_new
      WHEN role::text = 'user' THEN 'work_user'::public.workspace_role_new
      ELSE 'work_user'::public.workspace_role_new
    END
  );

  RAISE NOTICE 'Coluna role convertida para novo enum';
END $$;

-- ============================================================================
-- ETAPA 3: Remover enum antigo (com CASCADE)
-- ============================================================================

DO $$
BEGIN
  DROP TYPE public.workspace_role CASCADE;

  RAISE NOTICE 'Enum workspace_role antigo removido (com dependentes)';
END $$;

-- ============================================================================
-- ETAPA 4: Renomear novo enum
-- ============================================================================

DO $$
BEGIN
  ALTER TYPE public.workspace_role_new RENAME TO workspace_role;

  RAISE NOTICE 'Enum workspace_role_new renomeado para workspace_role';
END $$;

-- ============================================================================
-- ETAPA 5: Adicionar novo DEFAULT
-- ============================================================================

DO $$
BEGIN
  ALTER TABLE public.workspace_members 
  ALTER COLUMN role SET DEFAULT 'work_user'::public.workspace_role;

  RAISE NOTICE 'Novo DEFAULT definido para work_user';
END $$;

-- ============================================================================
-- ETAPA 6: Recriar funções que foram deletadas pelo CASCADE
-- ============================================================================

CREATE OR REPLACE FUNCTION public.get_user_workspace_role(
  _profile_id UUID,
  _workspace_id UUID
)
RETURNS public.workspace_role
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $func$
  SELECT role
  FROM public.workspace_members
  WHERE profile_id = _profile_id
    AND workspace_id = _workspace_id
  LIMIT 1;
$func$;

-- ============================================================================
-- VERIFICAÇÃO FINAL
-- ============================================================================

DO $$
DECLARE
  enum_values text[];
  role_counts RECORD;
BEGIN
  -- Listar valores do enum
  SELECT array_agg(enumlabel ORDER BY enumsortorder)
  INTO enum_values
  FROM pg_enum
  WHERE enumtypid = 'public.workspace_role'::regtype;
  
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Migration 12: Enum workspace_role finalizado';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Valores do enum: %', enum_values;
  
  -- Contar dados por role
  FOR role_counts IN
    SELECT role::text as role, COUNT(*) as cnt
    FROM public.workspace_members
    GROUP BY role::text
    ORDER BY cnt DESC
  LOOP
    RAISE NOTICE 'Role %: % registros', role_counts.role, role_counts.cnt;
  END LOOP;
END $$;

-- ============================================================================
-- FIM DA MIGRATION
-- ============================================================================
