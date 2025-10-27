-- ============================================
-- DIGITAL PROFILES: Estrutura Completa
-- ============================================

-- 1. Criar função para gerar short_id único
CREATE OR REPLACE FUNCTION public.generate_short_id()
RETURNS TEXT
LANGUAGE plpgsql
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

-- 2. Criar tabela principal
CREATE TABLE IF NOT EXISTS public.digital_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  short_id TEXT NOT NULL UNIQUE DEFAULT public.generate_short_id(),
  slug TEXT UNIQUE,
  type TEXT NOT NULL CHECK (type IN ('personal', 'business')),
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  content JSONB DEFAULT '{}'::jsonb,
  password TEXT,
  no_index BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. Criar índices
CREATE INDEX idx_digital_profiles_short_id ON public.digital_profiles(short_id);
CREATE INDEX idx_digital_profiles_slug ON public.digital_profiles(slug) WHERE slug IS NOT NULL;
CREATE INDEX idx_digital_profiles_client_id ON public.digital_profiles(client_id);
CREATE INDEX idx_digital_profiles_client_status ON public.digital_profiles(client_id, status);
CREATE INDEX idx_digital_profiles_type ON public.digital_profiles(type);

-- 4. Trigger para updated_at
CREATE TRIGGER update_digital_profiles_updated_at
  BEFORE UPDATE ON public.digital_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- 5. Habilitar RLS
ALTER TABLE public.digital_profiles ENABLE ROW LEVEL SECURITY;

-- 6. Políticas RLS: Platform Admins
CREATE POLICY "Platform admins can view all digital profiles"
ON public.digital_profiles FOR SELECT TO authenticated
USING (user_has_platform_role(auth.uid(), ARRAY['super_admin', 'admin', 'manager']));

CREATE POLICY "Platform admins can create digital profiles"
ON public.digital_profiles FOR INSERT TO authenticated
WITH CHECK (user_has_platform_role(auth.uid(), ARRAY['super_admin', 'admin', 'manager']));

CREATE POLICY "Platform admins can update all digital profiles"
ON public.digital_profiles FOR UPDATE TO authenticated
USING (user_has_platform_role(auth.uid(), ARRAY['super_admin', 'admin', 'manager']))
WITH CHECK (user_has_platform_role(auth.uid(), ARRAY['super_admin', 'admin', 'manager']));

CREATE POLICY "Super admins can delete digital profiles"
ON public.digital_profiles FOR DELETE TO authenticated
USING (user_has_platform_role(auth.uid(), ARRAY['super_admin']));

-- 7. Políticas RLS: Client Users
CREATE POLICY "Client users can view their client's digital profiles"
ON public.digital_profiles FOR SELECT TO authenticated
USING (client_id = get_user_client_id(auth.uid()));

CREATE POLICY "Client admins can create digital profiles for their client"
ON public.digital_profiles FOR INSERT TO authenticated
WITH CHECK (
  client_id = get_user_client_id(auth.uid())
  AND EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND client_user_role IN ('client_admin', 'client_manager')
  )
);

CREATE POLICY "Client admins can update their client's digital profiles"
ON public.digital_profiles FOR UPDATE TO authenticated
USING (
  client_id = get_user_client_id(auth.uid())
  AND EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND client_user_role IN ('client_admin', 'client_manager')
  )
)
WITH CHECK (
  client_id = get_user_client_id(auth.uid())
  AND EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND client_user_role IN ('client_admin', 'client_manager')
  )
);

CREATE POLICY "Client admins can delete their client's digital profiles"
ON public.digital_profiles FOR DELETE TO authenticated
USING (
  client_id = get_user_client_id(auth.uid())
  AND EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND client_user_role = 'client_admin'
  )
);

-- 8. Política RLS: Acesso Público
CREATE POLICY "Public can view published digital profiles without password"
ON public.digital_profiles FOR SELECT TO anon, authenticated
USING (status = 'published' AND password IS NULL);

-- 9. Comentários (Documentação)
COMMENT ON TABLE public.digital_profiles IS 'Armazena perfis digitais publicáveis (páginas) pertencentes a clientes';
COMMENT ON COLUMN public.digital_profiles.short_id IS 'ID único imutável de 12 caracteres para URL curta';
COMMENT ON COLUMN public.digital_profiles.slug IS 'URL amigável editável pelo usuário';
COMMENT ON COLUMN public.digital_profiles.type IS 'Tipo do perfil: personal ou business';
COMMENT ON COLUMN public.digital_profiles.content IS 'Estrutura de blocos e design do perfil em formato JSON';
COMMENT ON COLUMN public.digital_profiles.status IS 'Status de publicação: draft, published ou archived';
COMMENT ON COLUMN public.digital_profiles.password IS 'Senha para perfis protegidos (nullable = público)';
COMMENT ON COLUMN public.digital_profiles.no_index IS 'Se true, instrui buscadores a não indexar esta página';