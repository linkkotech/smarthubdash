-- ========================================
-- LIMPAR TODAS AS POLÍTICAS RECURSIVAS DE PROFILES
-- ========================================
DROP POLICY IF EXISTS "Allow users to read profiles in their own tenant" ON public.profiles;
DROP POLICY IF EXISTS "Usuários podem ler perfis do mesmo cliente" ON public.profiles;
DROP POLICY IF EXISTS "Usuários podem ler seu próprio perfil" ON public.profiles;
DROP POLICY IF EXISTS "Platform admins can read all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins de cliente podem gerenciar usuários" ON public.profiles;
DROP POLICY IF EXISTS "Multi-tenant: INSERT profiles" ON public.profiles;
DROP POLICY IF EXISTS "Usuários autenticados podem inserir perfis" ON public.profiles;
DROP POLICY IF EXISTS "Multi-tenant: UPDATE profiles" ON public.profiles;
DROP POLICY IF EXISTS "Usuários podem atualizar seu próprio perfil" ON public.profiles;
DROP POLICY IF EXISTS "Multi-tenant: SELECT profiles" ON public.profiles;
DROP POLICY IF EXISTS "Multi-tenant: DELETE profiles" ON public.profiles;

-- ========================================
-- CRIAR POLÍTICAS MINIMALISTAS (SEM RECURSÃO)
-- ========================================

-- SELECT: Admins veem tudo, usuários veem só o próprio perfil
CREATE POLICY "Allow platform admins and users to see their own profile"
ON public.profiles
FOR SELECT
TO authenticated
USING (
  public.is_platform_admin(auth.uid())
  OR 
  id = auth.uid()
);

-- INSERT: Apenas platform admins
CREATE POLICY "Only platform admins can insert profiles"
ON public.profiles
FOR INSERT
TO authenticated
WITH CHECK (
  public.is_platform_admin(auth.uid())
);

-- UPDATE: Admins ou próprio perfil
CREATE POLICY "Platform admins and users can update own profile"
ON public.profiles
FOR UPDATE
TO authenticated
USING (
  public.is_platform_admin(auth.uid()) OR id = auth.uid()
)
WITH CHECK (
  public.is_platform_admin(auth.uid()) OR id = auth.uid()
);

-- DELETE: Apenas platform admins
CREATE POLICY "Only platform admins can delete profiles"
ON public.profiles
FOR DELETE
TO authenticated
USING (
  public.is_platform_admin(auth.uid())
);