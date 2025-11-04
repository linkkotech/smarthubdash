-- Parte 1: Adicionar Marcelo como super_admin (COMENTADO - deve ser feito após criar o usuário)
-- INSERT INTO public.user_roles (user_id, role)
-- VALUES ('09ead756-6279-4143-9f22-b12697f79736', 'super_admin')
-- ON CONFLICT (user_id, role) DO NOTHING;

-- Parte 2: Criar função para atribuir super_admin ao primeiro usuário
CREATE OR REPLACE FUNCTION public.assign_first_user_as_admin()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_count INTEGER;
BEGIN
  -- Conta quantos perfis já existem
  SELECT COUNT(*) INTO user_count FROM public.profiles;
  
  -- Se este for o primeiro usuário, atribui super_admin
  IF user_count = 1 THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'super_admin')
    ON CONFLICT (user_id, role) DO NOTHING;
    
    RAISE NOTICE 'Primeiro usuário detectado. Role super_admin atribuída automaticamente.';
  END IF;
  
  RETURN NEW;
END;
$$;

-- Criar trigger que dispara após inserção de perfil
CREATE TRIGGER on_first_user_create_admin
  AFTER INSERT ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.assign_first_user_as_admin();