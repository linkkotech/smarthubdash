-- ========================================
-- Script 1: Limpar TODAS as Políticas Recursivas de user_roles
-- ========================================
DROP POLICY IF EXISTS "Platform: SELECT user_roles" ON public.user_roles;
DROP POLICY IF EXISTS "Platform: INSERT user_roles" ON public.user_roles;
DROP POLICY IF EXISTS "Platform: DELETE user_roles" ON public.user_roles;
DROP POLICY IF EXISTS "Allow platform admins to manage user roles" ON public.user_roles;
DROP POLICY IF EXISTS "Super admins podem ler todos os roles" ON public.user_roles;
DROP POLICY IF EXISTS "Super admins podem inserir roles" ON public.user_roles;
DROP POLICY IF EXISTS "Super admins podem deletar roles" ON public.user_roles;
DROP POLICY IF EXISTS "Usuários podem ler seus próprios roles" ON public.user_roles;
DROP POLICY IF EXISTS "Allow authenticated users to read roles" ON public.user_roles;

-- ========================================
-- Script 2: Criar Políticas Não-Recursivas
-- ========================================

-- LEITURA: Permitir a todos os usuários autenticados (quebra a recursão)
CREATE POLICY "Allow all authenticated users to read user_roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (true);

COMMENT ON POLICY "Allow all authenticated users to read user_roles" ON public.user_roles IS 
'Permite leitura irrestrita de roles. A segurança é garantida pelas políticas das tabelas de dados (clients, contracts, etc). Esta política quebra o ciclo de recursão.';

-- INSERÇÃO: Apenas platform admins (usa SECURITY DEFINER, sem recursão)
CREATE POLICY "Only platform admins can insert user_roles"
ON public.user_roles
FOR INSERT
TO authenticated
WITH CHECK (
  public.is_platform_admin(auth.uid())
);

COMMENT ON POLICY "Only platform admins can insert user_roles" ON public.user_roles IS 
'is_platform_admin usa SECURITY DEFINER, evitando recursão ao ler user_roles.';

-- DELEÇÃO: Apenas platform admins (usa SECURITY DEFINER, sem recursão)
CREATE POLICY "Only platform admins can delete user_roles"
ON public.user_roles
FOR DELETE
TO authenticated
USING (
  public.is_platform_admin(auth.uid())
);

COMMENT ON POLICY "Only platform admins can delete user_roles" ON public.user_roles IS 
'is_platform_admin usa SECURITY DEFINER, evitando recursão ao ler user_roles.';