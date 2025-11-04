-- ============================================================================
-- FIX: Adicionar search_path seguro às funções com vulnerabilidade
-- Execute este SQL no Supabase SQL Editor
-- https://supabase.com/dashboard/project/cpzodtaghdinluovuflg/sql/new
-- ============================================================================

-- 1. Corrigir função generate_short_id
CREATE OR REPLACE FUNCTION public.generate_short_id()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  chars TEXT := 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  result TEXT := '';
  i INTEGER;
  random_index INTEGER;
BEGIN
  FOR i IN 1..12 LOOP
    random_index := floor(random() * length(chars) + 1)::INTEGER;
    result := result || substr(chars, random_index, 1);
  END LOOP;
  RETURN result;
END;
$$;

-- 2. Corrigir função update_updated_at_column
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- Verificar se as funções foram atualizadas corretamente
SELECT 
  routine_name,
  routine_type,
  security_type
FROM information_schema.routines 
WHERE routine_schema = 'public' 
  AND routine_name IN ('generate_short_id', 'update_updated_at_column')
ORDER BY routine_name;
