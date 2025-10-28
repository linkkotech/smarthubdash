-- =====================================================
-- ETAPA 1: CRIAR TEMPLATE PADRÃO
-- =====================================================
-- Inserir template padrão que será usado como fallback
INSERT INTO public.digital_templates (
  id,
  name,
  type,
  description,
  content,
  created_by
) VALUES (
  '00000000-0000-0000-0000-000000000001'::UUID,
  'Template Padrão (Sistema)',
  'profile_template'::public.template_type,
  'Template padrão criado automaticamente para perfis sem template específico. Este template pode ser editado ou substituído.',
  '{
    "blocks": [
      {
        "id": "default-header",
        "type": "text",
        "content": {
          "text": "Bem-vindo ao meu perfil",
          "style": {
            "fontSize": "2xl",
            "fontWeight": "bold",
            "textAlign": "center"
          }
        }
      },
      {
        "id": "default-description",
        "type": "text",
        "content": {
          "text": "Este é um perfil digital criado com nosso sistema. Configure seu template para personalizar esta página.",
          "style": {
            "fontSize": "base",
            "textAlign": "center",
            "color": "muted"
          }
        }
      }
    ],
    "theme": {
      "primaryColor": "#3b82f6",
      "backgroundColor": "#ffffff",
      "fontFamily": "Inter"
    }
  }'::JSONB,
  NULL
)
ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- ETAPA 2: ADICIONAR COLUNA active_template_id (NULLABLE)
-- =====================================================
-- Adicionar coluna temporariamente como NULLABLE
ALTER TABLE public.digital_profiles
ADD COLUMN IF NOT EXISTS active_template_id UUID;

-- Adicionar chave estrangeira com ON DELETE RESTRICT
ALTER TABLE public.digital_profiles
ADD CONSTRAINT fk_digital_profiles_active_template
FOREIGN KEY (active_template_id)
REFERENCES public.digital_templates(id)
ON DELETE RESTRICT;

-- Criar índice para otimizar queries que buscam perfis por template
CREATE INDEX IF NOT EXISTS idx_digital_profiles_active_template_id 
ON public.digital_profiles(active_template_id);

-- Adicionar comentário descritivo
COMMENT ON COLUMN public.digital_profiles.active_template_id IS 
'ID do template ativo obrigatório que será exibido neste perfil/URL. Referencia digital_templates(id).';

-- =====================================================
-- ETAPA 3: POPULAR PERFIS EXISTENTES E TORNAR NOT NULL
-- =====================================================
-- Atualizar todos os perfis existentes para usar o template padrão
UPDATE public.digital_profiles
SET active_template_id = '00000000-0000-0000-0000-000000000001'::UUID
WHERE active_template_id IS NULL;

-- Verificar se todos os perfis foram atualizados
DO $$
DECLARE
  null_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO null_count
  FROM public.digital_profiles
  WHERE active_template_id IS NULL;
  
  IF null_count > 0 THEN
    RAISE EXCEPTION 'Ainda existem % perfis sem template associado. Abortando migração.', null_count;
  END IF;
  
  RAISE NOTICE 'Verificação concluída: Todos os perfis possuem template associado.';
END $$;

-- Tornar a coluna NOT NULL
ALTER TABLE public.digital_profiles
ALTER COLUMN active_template_id SET NOT NULL;

-- =====================================================
-- VALIDAÇÃO FINAL
-- =====================================================
DO $$
BEGIN
  RAISE NOTICE '✅ Migração concluída com sucesso!';
  RAISE NOTICE '📊 Template padrão ID: 00000000-0000-0000-0000-000000000001';
  RAISE NOTICE '🔗 Coluna active_template_id criada como NOT NULL com FK';
  RAISE NOTICE '📈 Índice idx_digital_profiles_active_template_id criado';
END $$;