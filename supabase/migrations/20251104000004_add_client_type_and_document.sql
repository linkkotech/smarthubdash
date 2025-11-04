-- ============================================================================
-- MIGRATION: Adicionar suporte a Pessoa Jurídica e Pessoa Física
-- ============================================================================
-- Data: 04 de novembro de 2025
-- Descrição: Adiciona colunas client_type e document na tabela workspaces
--            para suportar dois tipos de cliente (PJ com CNPJ e PF com CPF).
--            Implementa validação de formato e índice único para documentos.
-- ============================================================================

-- ============================================================================
-- ETAPA 1: CRIAR ENUM PARA TIPO DE CLIENTE
-- ============================================================================

/**
 * Enum: client_type
 * 
 * Define os tipos de cliente suportados:
 * - pessoa_juridica: Empresas (requer CNPJ)
 * - pessoa_fisica: Indivíduos (requer CPF)
 */
DROP TYPE IF EXISTS public.client_type CASCADE;
CREATE TYPE public.client_type AS ENUM ('pessoa_juridica', 'pessoa_fisica');

-- ============================================================================
-- ETAPA 2: ADICIONAR COLUNAS NA TABELA WORKSPACES
-- ============================================================================

/**
 * Adiciona duas novas colunas:
 * - client_type: Tipo do cliente (PJ ou PF)
 * - document: CNPJ ou CPF sem máscara (apenas números)
 * 
 * Nota: DEFAULT 'pessoa_juridica' para manter compatibilidade com dados existentes.
 *       Após aplicar a migration, os registros existentes devem ser atualizados manualmente.
 */
ALTER TABLE public.workspaces
  ADD COLUMN client_type public.client_type NOT NULL DEFAULT 'pessoa_juridica',
  ADD COLUMN document VARCHAR(14);

-- ============================================================================
-- ETAPA 3: CRIAR ÍNDICE ÚNICO PARA DOCUMENTO
-- ============================================================================

/**
 * Índice único para garantir que não existam dois workspaces com o mesmo CNPJ/CPF.
 * Isso impede duplicação de clientes no sistema.
 */
CREATE UNIQUE INDEX idx_workspaces_document ON public.workspaces(document);

-- ============================================================================
-- ETAPA 4: ADICIONAR CONSTRAINT DE VALIDAÇÃO DE FORMATO
-- ============================================================================

/**
 * Constraint: check_document_format
 * 
 * Valida o comprimento do documento (sem máscara, apenas números):
 * - Pessoa Física (CPF): 11 caracteres numéricos
 * - Pessoa Jurídica (CNPJ): 14 caracteres numéricos
 * 
 * Nota: A validação de dígitos verificadores é feita no frontend e backend,
 *       esta constraint apenas garante o formato.
 */
ALTER TABLE public.workspaces
  ADD CONSTRAINT check_document_format CHECK (
    CASE
      WHEN client_type = 'pessoa_fisica' THEN LENGTH(document) = 11  -- CPF: 11 dígitos
      WHEN client_type = 'pessoa_juridica' THEN LENGTH(document) = 14  -- CNPJ: 14 dígitos
    END
  );

-- ============================================================================
-- ETAPA 5: TORNAR COLUNA DOCUMENT OBRIGATÓRIA
-- ============================================================================

/**
 * Após a constraint estar em vigor, tornamos o campo document obrigatório.
 * 
 * IMPORTANTE: Se houver dados existentes na tabela workspaces, você deve:
 * 1. Primeiro atualizar todos os registros existentes com documentos válidos
 * 2. Depois executar este ALTER TABLE para tornar o campo NOT NULL
 */
-- Descomente a linha abaixo APÓS atualizar registros existentes:
-- ALTER TABLE public.workspaces ALTER COLUMN document SET NOT NULL;

-- ============================================================================
-- ETAPA 6: ADICIONAR COMENTÁRIOS DE DOCUMENTAÇÃO
-- ============================================================================

COMMENT ON COLUMN public.workspaces.client_type IS 
'Tipo de cliente: pessoa_juridica (empresa com CNPJ) ou pessoa_fisica (indivíduo com CPF)';

COMMENT ON COLUMN public.workspaces.document IS 
'Documento do cliente (CNPJ ou CPF) sem máscara. Formato: apenas números. CPF 11 dígitos, CNPJ 14 dígitos. Campo único para impedir duplicação de clientes.';

-- ============================================================================
-- FIM DA MIGRATION
-- ============================================================================

-- Verificação de integridade (comentado - descomente para debug)
-- SELECT 'client_type and document columns added successfully' AS status;
-- SELECT column_name, data_type, is_nullable FROM information_schema.columns 
-- WHERE table_name = 'workspaces' AND column_name IN ('client_type', 'document');
