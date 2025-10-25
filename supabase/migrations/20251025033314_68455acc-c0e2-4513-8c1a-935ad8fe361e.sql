-- ETAPA 1: Criar função is_platform_admin
CREATE OR REPLACE FUNCTION public.is_platform_admin(_user_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM user_roles
    WHERE user_id = _user_id
    AND role IN ('super_admin', 'admin', 'manager')
  )
$$;

-- ETAPA 2: Criar função helper user_has_platform_role
CREATE OR REPLACE FUNCTION public.user_has_platform_role(_user_id uuid, _roles text[])
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM user_roles
    WHERE user_id = _user_id
    AND role = ANY(_roles)
  )
$$;