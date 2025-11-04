-- =====================================================
-- 1. CRIAR ENUM PARA TIPOS DE TEMPLATE
-- =====================================================
DROP TYPE IF EXISTS public.template_type CASCADE;$([Environment]::NewLine)CREATE TYPE public.template_type AS ENUM ('profile_template', 'content_block');

-- =====================================================
-- 2. CRIAR TABELA digital_templates
-- =====================================================
CREATE TABLE public.digital_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  type public.template_type NOT NULL,
  description TEXT,
  content JSONB DEFAULT '{}'::jsonb,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =====================================================
-- 3. COMENTÁRIOS PARA DOCUMENTAÇÃO
-- =====================================================
COMMENT ON TABLE public.digital_templates IS 
  'Armazena perfis digitais completos e blocos de conteúdo reutilizáveis';

COMMENT ON COLUMN public.digital_templates.type IS 
  'Tipo do template: profile_template (perfil completo) ou content_block (bloco reutilizável)';

COMMENT ON COLUMN public.digital_templates.content IS 
  'Estrutura JSON flexível que armazena os blocos e design do template';

COMMENT ON COLUMN public.digital_templates.description IS 
  'Descrição opcional do template para ajudar na identificação';

-- =====================================================
-- 4. ÍNDICES PARA PERFORMANCE
-- =====================================================
CREATE INDEX idx_digital_templates_type ON public.digital_templates(type);
CREATE INDEX idx_digital_templates_created_by ON public.digital_templates(created_by);
CREATE INDEX idx_digital_templates_created_at ON public.digital_templates(created_at DESC);

-- Índice GIN para busca eficiente no JSONB
CREATE INDEX idx_digital_templates_content ON public.digital_templates USING GIN(content);

-- =====================================================
-- 5. TRIGGER PARA ATUALIZAÇÃO AUTOMÁTICA DE updated_at
-- =====================================================
CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON public.digital_templates
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- =====================================================
-- 6. HABILITAR ROW LEVEL SECURITY (RLS)
-- =====================================================
ALTER TABLE public.digital_templates ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- 7. POLÍTICAS RLS - LEITURA (SELECT)
-- =====================================================

-- Platform admins podem ver todos os templates
CREATE POLICY "Platform admins can view all templates"
  ON public.digital_templates
  FOR SELECT
  TO authenticated
  USING (
    user_has_platform_role(auth.uid(), ARRAY['super_admin', 'admin', 'manager'])
  );

-- Usuários autenticados podem ver templates criados por eles
CREATE POLICY "Users can view their own templates"
  ON public.digital_templates
  FOR SELECT
  TO authenticated
  USING (created_by = auth.uid());

-- =====================================================
-- 8. POLÍTICAS RLS - CRIAÇÃO (INSERT)
-- =====================================================

-- Apenas platform admins podem criar templates
CREATE POLICY "Platform admins can create templates"
  ON public.digital_templates
  FOR INSERT
  TO authenticated
  WITH CHECK (
    user_has_platform_role(auth.uid(), ARRAY['super_admin', 'admin', 'manager'])
  );

-- =====================================================
-- 9. POLÍTICAS RLS - ATUALIZAÇÃO (UPDATE)
-- =====================================================

-- Platform admins podem atualizar todos os templates
CREATE POLICY "Platform admins can update all templates"
  ON public.digital_templates
  FOR UPDATE
  TO authenticated
  USING (
    user_has_platform_role(auth.uid(), ARRAY['super_admin', 'admin', 'manager'])
  )
  WITH CHECK (
    user_has_platform_role(auth.uid(), ARRAY['super_admin', 'admin', 'manager'])
  );

-- Usuários podem atualizar apenas seus próprios templates
CREATE POLICY "Users can update their own templates"
  ON public.digital_templates
  FOR UPDATE
  TO authenticated
  USING (created_by = auth.uid())
  WITH CHECK (created_by = auth.uid());

-- =====================================================
-- 10. POLÍTICAS RLS - EXCLUSÃO (DELETE)
-- =====================================================

-- Apenas super_admins podem deletar templates
CREATE POLICY "Super admins can delete templates"
  ON public.digital_templates
  FOR DELETE
  TO authenticated
  USING (
    user_has_platform_role(auth.uid(), ARRAY['super_admin'])
  );