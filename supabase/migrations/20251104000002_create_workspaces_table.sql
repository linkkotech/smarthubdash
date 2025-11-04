-- ============================================================================
-- MIGRATION: Criar tabela workspaces
-- ============================================================================
-- Data: 04 de novembro de 2025
-- Descrição: Cria a tabela central de workspaces para substituir o modelo
--            baseado em 'clients'. Um workspace representa um espaço de 
--            trabalho isolado onde múltiplos usuários podem colaborar.
-- ============================================================================

-- ============================================================================
-- ETAPA 1: CRIAR TABELA WORKSPACES
-- ============================================================================

/**
 * Tabela: workspaces
 * 
 * Representa um espaço de trabalho isolado (tenant) no sistema multi-tenant.
 * Cada workspace pode ter múltiplos membros com diferentes níveis de permissão.
 * 
 * Campos:
 * - id: Identificador único do workspace
 * - name: Nome exibido do workspace (ex: "Acme Corporation")
 * - slug: Identificador único amigável para URLs (ex: "acme-corp")
 * - created_at: Data de criação do workspace
 * - updated_at: Data da última atualização
 */
CREATE TABLE public.workspaces (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Constraints de validação
  CONSTRAINT workspace_name_not_empty CHECK (LENGTH(TRIM(name)) > 0),
  CONSTRAINT workspace_slug_format CHECK (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$')
);

-- ============================================================================
-- ETAPA 2: CRIAR ÍNDICES
-- ============================================================================

-- Índice para busca por slug (usado em URLs públicas)
CREATE INDEX idx_workspaces_slug ON public.workspaces(slug);

-- Índice para ordenação por data de criação
CREATE INDEX idx_workspaces_created_at ON public.workspaces(created_at DESC);

-- ============================================================================
-- ETAPA 3: CRIAR TRIGGER PARA ATUALIZAR updated_at
-- ============================================================================

-- Reutilizar a função existente update_updated_at_column()
CREATE TRIGGER update_workspaces_updated_at
  BEFORE UPDATE ON public.workspaces
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================================================
-- ETAPA 4: HABILITAR ROW LEVEL SECURITY
-- ============================================================================

ALTER TABLE public.workspaces ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- ETAPA 5: CRIAR POLÍTICAS RLS PARA WORKSPACES
-- ============================================================================

/**
 * Política: SELECT - "Users can view workspaces where they are members"
 * 
 * Um usuário pode visualizar um workspace se:
 * - Ele for membro daquele workspace (verificado via workspace_members)
 * 
 * Nota: Esta política depende da tabela workspace_members que será criada
 * na próxima migration. Por enquanto, permitimos que autenticados vejam tudo
 * (será restringido na migration seguinte).
 */
CREATE POLICY "Authenticated users can view workspaces"
ON public.workspaces
FOR SELECT
TO authenticated
USING (true);  -- Será refinado após criar workspace_members

/**
 * Política: INSERT - "Any authenticated user can create a workspace"
 * 
 * Qualquer usuário autenticado pode criar um novo workspace.
 * Ao criar, ele automaticamente se torna 'owner' via trigger.
 */
CREATE POLICY "Authenticated users can create workspaces"
ON public.workspaces
FOR INSERT
TO authenticated
WITH CHECK (true);

/**
 * Política: UPDATE - "Only workspace owners can update workspace details"
 * 
 * Apenas membros com role 'owner' podem atualizar informações do workspace.
 * Esta política será refinada após criar workspace_members.
 */
CREATE POLICY "Authenticated users can update their workspaces"
ON public.workspaces
FOR UPDATE
TO authenticated
USING (true)  -- Será refinado após criar workspace_members
WITH CHECK (true);

/**
 * Política: DELETE - "Only workspace owners can delete workspaces"
 * 
 * Apenas o owner pode deletar um workspace.
 * Esta ação remove todos os dados relacionados via CASCADE.
 */
CREATE POLICY "Authenticated users can delete their workspaces"
ON public.workspaces
FOR DELETE
TO authenticated
USING (true);  -- Será refinado após criar workspace_members

-- ============================================================================
-- ETAPA 6: ADICIONAR COMENTÁRIOS DE DOCUMENTAÇÃO
-- ============================================================================

COMMENT ON TABLE public.workspaces IS 
'Tabela central de workspaces (tenants) do sistema. Cada workspace representa um espaço de trabalho isolado onde múltiplos usuários podem colaborar com diferentes níveis de permissão.';

COMMENT ON COLUMN public.workspaces.id IS 
'Identificador único do workspace (UUID v4)';

COMMENT ON COLUMN public.workspaces.name IS 
'Nome exibido do workspace, usado na interface do usuário';

COMMENT ON COLUMN public.workspaces.slug IS 
'Identificador único amigável para URLs (apenas letras minúsculas, números e hífens). Exemplo: acme-corporation';

COMMENT ON COLUMN public.workspaces.created_at IS 
'Timestamp de quando o workspace foi criado';

COMMENT ON COLUMN public.workspaces.updated_at IS 
'Timestamp da última atualização do workspace (atualizado automaticamente via trigger)';
