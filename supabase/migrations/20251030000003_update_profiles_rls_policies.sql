-- ============================================================================
-- MIGRATION: Atualizar políticas RLS para profiles - Permitir client_admin inserir
-- ============================================================================
-- Data: 30 de outubro de 2025
-- Descrição: Permite que client_admin e client_manager criem novos perfis de usuários
-- dentro do seu próprio cliente (tenant)
-- ============================================================================

-- 1. Remover política antiga de INSERT que estava muito restritiva
DROP POLICY IF EXISTS "Multi-tenant: INSERT profiles" ON public.profiles;

-- 2. Criar nova policy: Apenas platform admins podem fazer INSERT diretamente
CREATE POLICY "Platform admins can insert profiles"
ON public.profiles
FOR INSERT
TO authenticated
WITH CHECK (
  public.is_platform_admin(auth.uid())
);

-- 3. Criar nova policy: Client admins e managers podem inserir perfis para seu cliente
CREATE POLICY "Client admins and managers can insert team members"
ON public.profiles
FOR INSERT
TO authenticated
WITH CHECK (
  -- O novo perfil deve pertencer ao mesmo cliente do usuário logado
  client_id = public.get_user_client_id(auth.uid())
  AND public.get_user_client_id(auth.uid()) IS NOT NULL
  -- E o usuário logado deve ser admin ou manager do cliente
  AND (
    public.is_client_admin(auth.uid())
    OR
    EXISTS (
      SELECT 1
      FROM public.profiles
      WHERE id = auth.uid()
        AND client_user_role = 'client_manager'
        AND client_id IS NOT NULL
    )
  )
);

-- 4. Atualizar policy de UPDATE para profiles
-- Remover policies antigas de UPDATE
DROP POLICY IF EXISTS "Multi-tenant: UPDATE profiles" ON public.profiles;

-- Policy: Platform admins podem atualizar qualquer perfil
CREATE POLICY "Platform admins can update all profiles"
ON public.profiles
FOR UPDATE
TO authenticated
USING (
  public.is_platform_admin(auth.uid())
)
WITH CHECK (
  public.is_platform_admin(auth.uid())
);

-- Policy: Usuários podem atualizar suas próprias informações
CREATE POLICY "Users can update their own profile"
ON public.profiles
FOR UPDATE
TO authenticated
USING (
  id = auth.uid()
)
WITH CHECK (
  id = auth.uid()
);

-- Policy: Client admins podem atualizar perfis do seu cliente
CREATE POLICY "Client admins can update their client's profiles"
ON public.profiles
FOR UPDATE
TO authenticated
USING (
  client_id = public.get_user_client_id(auth.uid())
  AND public.is_client_admin(auth.uid())
  AND client_id IS NOT NULL
)
WITH CHECK (
  client_id = public.get_user_client_id(auth.uid())
  AND public.is_client_admin(auth.uid())
  AND client_id IS NOT NULL
);

-- Policy: Client managers podem atualizar alguns campos dos perfis do seu cliente
CREATE POLICY "Client managers can update some profile fields"
ON public.profiles
FOR UPDATE
TO authenticated
USING (
  client_id = public.get_user_client_id(auth.uid())
  AND EXISTS (
    SELECT 1
    FROM public.profiles p
    WHERE p.id = auth.uid()
      AND p.client_user_role = 'client_manager'
      AND p.client_id IS NOT NULL
  )
)
WITH CHECK (
  client_id = public.get_user_client_id(auth.uid())
  AND EXISTS (
    SELECT 1
    FROM public.profiles p
    WHERE p.id = auth.uid()
      AND p.client_user_role = 'client_manager'
      AND p.client_id IS NOT NULL
  )
);

-- 5. Adicionar policy de DELETE para profiles (admin delete)
DROP POLICY IF EXISTS "Only admins can delete" ON public.profiles;

CREATE POLICY "Platform admins can delete profiles"
ON public.profiles
FOR DELETE
TO authenticated
USING (
  public.is_platform_admin(auth.uid())
);

CREATE POLICY "Client admins can delete team members"
ON public.profiles
FOR DELETE
TO authenticated
USING (
  client_id = public.get_user_client_id(auth.uid())
  AND public.is_client_admin(auth.uid())
  AND client_id IS NOT NULL
);

-- 6. Documentação das políticas
COMMENT ON COLUMN public.profiles.client_id IS 'ID do cliente (tenant). NULL para administradores da plataforma.';
COMMENT ON COLUMN public.profiles.client_user_role IS 'Papel do usuário dentro do cliente. NULL para admins da plataforma.';
COMMENT ON COLUMN public.profiles.unidade IS 'Local ou unidade onde o usuário trabalha.';
COMMENT ON COLUMN public.profiles.team_id IS 'ID da equipe à qual o usuário pertence (opcional).';
COMMENT ON COLUMN public.profiles.status IS 'Status do usuário: ativo ou inativo.';
