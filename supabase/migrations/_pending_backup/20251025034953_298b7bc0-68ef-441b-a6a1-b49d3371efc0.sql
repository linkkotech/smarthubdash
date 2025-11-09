-- Política para permitir que admins da plataforma leiam todos os perfis
CREATE POLICY "Platform admins can read all profiles"
ON public.profiles
FOR SELECT
TO authenticated
USING (
  user_has_platform_role(auth.uid(), ARRAY['super_admin', 'admin', 'manager'])
);