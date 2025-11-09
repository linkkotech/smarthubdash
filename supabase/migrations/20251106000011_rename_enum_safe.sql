-- ============================================================================
-- MIGRATION: Renomear workspace_role enum de forma segura (alternativa)
-- ============================================================================
-- Data: 06 de novembro de 2025
-- Descrição: Versão corrigida da migration que renomeia o enum
--            Usa IF NOT EXISTS para evitar erros em aplicações repetidas
-- ============================================================================

-- ============================================================================
-- ETAPA 1: Criar novo enum com novos valores (se não existir)
-- ============================================================================

DO $$
BEGIN
  -- Verificar se o novo enum já existe
  IF NOT EXISTS (
    SELECT 1 FROM pg_type WHERE typname = 'workspace_role_new'
  ) THEN
    CREATE TYPE public.workspace_role_new AS ENUM ('work_owner', 'work_manager', 'work_user');
    RAISE NOTICE 'Novo enum workspace_role_new criado';
  ELSE
    RAISE NOTICE 'Enum workspace_role_new já existe';
  END IF;
END $$;

-- ============================================================================
-- ETAPA 2: Atualizar coluna se ainda usar enum antigo
-- ============================================================================

DO $$
BEGIN
  -- Verificar qual é o tipo atual da coluna
  IF EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'workspace_members' 
    AND column_name = 'role'
    AND data_type = 'USER-DEFINED'
    AND udt_name = 'workspace_role'
  ) THEN
    -- Converter usando USING com CASE
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
  ELSE
    RAISE NOTICE 'Coluna role já usa novo enum ou não existe';
  END IF;
END $$;

-- ============================================================================
-- ETAPA 3: Remover enum antigo e renomear novo
-- ============================================================================

DO $$
BEGIN
  -- Dropar o enum antigo se existir
  IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'workspace_role' AND typtype = 'e') THEN
    DROP TYPE IF EXISTS public.workspace_role CASCADE;
    RAISE NOTICE 'Enum workspace_role antigo removido';
  END IF;
  
  -- Renomear o novo enum
  IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'workspace_role_new') THEN
    ALTER TYPE public.workspace_role_new RENAME TO workspace_role;
    RAISE NOTICE 'Enum workspace_role_new renomeado para workspace_role';
  END IF;
END $$;

-- ============================================================================
-- ETAPA 4: Atualizar DEFAULT
-- ============================================================================

DO $$
BEGIN
  -- Remover default antigo
  ALTER TABLE public.workspace_members ALTER COLUMN role DROP DEFAULT;
  
  -- Definir novo default
  ALTER TABLE public.workspace_members ALTER COLUMN role SET DEFAULT 'work_user'::public.workspace_role;
  
  RAISE NOTICE 'DEFAULT da coluna role atualizado';
END $$;

-- ============================================================================
-- VERIFICAÇÃO FINAL
-- ============================================================================

DO $$
DECLARE
  enum_values text[];
BEGIN
  -- Listar valores do enum
  SELECT array_agg(enumlabel ORDER BY enumsortorder)
  INTO enum_values
  FROM pg_enum
  WHERE enumtypid = 'public.workspace_role'::regtype;
  
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Migration 11: Enum workspace_role atualizado';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Valores atuais do enum: %', enum_values;
  
  -- Contar dados por role
  FOR rec IN
    SELECT role::text, COUNT(*) as cnt
    FROM public.workspace_members
    GROUP BY role::text
  LOOP
    RAISE NOTICE 'Role %: % registros', rec.role::text, rec.cnt;
  END LOOP;
END $$;

-- ============================================================================
-- FIM DA MIGRATION
-- ============================================================================
