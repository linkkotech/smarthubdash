-- Corrigir recursão infinita: Adicionar SECURITY DEFINER à função get_user_client_id
CREATE OR REPLACE FUNCTION public.get_user_client_id(_user_id uuid)
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER -- Executa com privilégios do owner, evitando recursão nas políticas RLS
SET search_path = public
AS $$
  SELECT client_id 
  FROM public.profiles 
  WHERE id = _user_id;
$$;

-- Documentar a correção
COMMENT ON FUNCTION public.get_user_client_id(_user_id uuid) IS 
'Retorna o client_id do usuário. Usa SECURITY DEFINER para evitar recursão infinita nas políticas RLS de profiles.';