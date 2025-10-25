-- Drop do trigger e função existentes
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Criar nova função com lógica de primeiro usuário = super admin
CREATE OR REPLACE FUNCTION public.handle_new_user_and_assign_superadmin()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  super_admin_count INTEGER;
BEGIN
  -- 1. Inserir perfil na tabela profiles
  INSERT INTO public.profiles (id, full_name, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    NEW.email
  );
  
  -- 2. Verificar se já existe algum super_admin
  SELECT COUNT(*) INTO super_admin_count
  FROM public.user_roles
  WHERE role = 'super_admin';
  
  -- 3. Se não existir super_admin, atribuir ao novo usuário
  IF super_admin_count = 0 THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'super_admin');
  END IF;
  
  RETURN NEW;
END;
$$;

-- Criar trigger para chamar a função
CREATE TRIGGER on_auth_user_created_assign_superadmin
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user_and_assign_superadmin();

-- Adicionar comentário para documentação
COMMENT ON FUNCTION public.handle_new_user_and_assign_superadmin() IS 
'Cria perfil do usuário e atribui papel de super_admin ao primeiro usuário cadastrado na plataforma';