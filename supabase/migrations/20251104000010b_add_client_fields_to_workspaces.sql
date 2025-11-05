-- ============================================================================
-- MIGRATION: Adicionar client_type e document em workspaces
-- ============================================================================
-- Data: 04 de novembro de 2025
-- Fase: PREPARAÇÃO
-- Descrição: Adiciona campos que existem em clients para permitir migração completa
-- ============================================================================

-- ============================================================================
-- ETAPA 1: Verificar se tipo client_type existe
-- ============================================================================

DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'client_type') THEN
    CREATE TYPE client_type AS ENUM ('pessoa_fisica', 'pessoa_juridica');
  END IF;
END $$;

-- ============================================================================
-- ETAPA 2: Adicionar colunas em workspaces
-- ============================================================================

-- Adicionar client_type (se não existir)
ALTER TABLE public.workspaces 
ADD COLUMN IF NOT EXISTS client_type client_type NOT NULL DEFAULT 'pessoa_juridica';

-- Adicionar document (se não existir)
ALTER TABLE public.workspaces 
ADD COLUMN IF NOT EXISTS document TEXT;

-- ============================================================================
-- ETAPA 3: Comentários e constraints
-- ============================================================================

COMMENT ON COLUMN public.workspaces.client_type IS 'Tipo do cliente: pessoa_fisica (CPF) ou pessoa_juridica (CNPJ)';
COMMENT ON COLUMN public.workspaces.document IS 'CPF (11 dígitos) ou CNPJ (14 dígitos) sem máscara';

-- Adicionar constraint para validar documento
ALTER TABLE public.workspaces
ADD CONSTRAINT workspace_document_format CHECK (
  document IS NULL OR (
    document ~ '^\d{11}$' -- CPF: 11 dígitos
    OR document ~ '^\d{14}$' -- CNPJ: 14 dígitos
  )
);

-- ============================================================================
-- ETAPA 4: Criar índice para document
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_workspaces_document ON public.workspaces(document);
CREATE INDEX IF NOT EXISTS idx_workspaces_client_type ON public.workspaces(client_type);

-- ============================================================================
-- VERIFICAÇÃO
-- ============================================================================

DO $$
BEGIN
  RAISE NOTICE 'Migration 10b concluída com sucesso!';
  RAISE NOTICE 'Campos adicionados em workspaces: client_type, document';
END $$;
