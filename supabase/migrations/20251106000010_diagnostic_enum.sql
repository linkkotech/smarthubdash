-- ============================================================================
-- SCRIPT DE DIAGNÓSTICO: Verificar estado do enum workspace_role
-- ============================================================================

-- 1. Listar todos os valores do enum workspace_role
SELECT 
  enumlabel as "Valor do Enum",
  enumsortorder as "Ordem"
FROM pg_enum
WHERE enumtypid = 'public.workspace_role'::regtype
ORDER BY enumsortorder;

-- 2. Contar quantos workspace_members existem por role
SELECT 
  role::text as "Role",
  COUNT(*) as "Quantidade"
FROM public.workspace_members
GROUP BY role::text
ORDER BY COUNT(*) DESC;

-- 3. Verificar se a coluna role tem constraint ou default
SELECT 
  column_name,
  data_type,
  column_default,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'workspace_members' 
AND column_name = 'role';

-- 4. Listar todas as constraints na tabela workspace_members
SELECT constraint_name, constraint_type
FROM information_schema.table_constraints
WHERE table_name = 'workspace_members';

-- 5. Verificar se há problemas de casting
-- Tentar inserir um registro de teste (comentado por segurança)
-- INSERT INTO public.workspace_members (workspace_id, profile_id, role)
-- VALUES (gen_random_uuid(), gen_random_uuid(), 'work_owner'::public.workspace_role)
-- RETURNING *;
