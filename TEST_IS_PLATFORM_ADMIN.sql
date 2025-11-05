-- Testar se is_platform_admin() está funcionando
SELECT 
  auth.uid() as current_user_id,
  public.is_platform_admin(auth.uid()) as is_admin,
  public.get_user_client_id(auth.uid()) as user_client_id;

-- Ver qual role você tem
SELECT ur.role
FROM user_roles ur
WHERE ur.user_id = auth.uid();
