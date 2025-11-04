-- ============================================================================
-- MIGRATION: Criar tabela workspace_members e infraestrutura multi-tenant
-- ============================================================================
-- Data: 04 de novembro de 2025
-- Descrição: Cria a tabela intermediária workspace_members que relaciona
--            usuários (profiles) com workspaces, definindo roles e permissões.
--            Implementa segurança RLS robusta para isolamento multi-tenant.
-- ============================================================================

-- ============================================================================
-- ETAPA 1: CRIAR ENUM PARA ROLES DE WORKSPACE
-- ============================================================================

/**
 * Enum: workspace_role
 * 
 * Define os níveis de permissão dentro de um workspace:
 * - owner: Controle total do workspace (pode deletar, adicionar/remover membros, etc)
 * - manager: Pode gerenciar membros e conteúdo, mas não pode deletar o workspace
 * - user: Acesso básico, pode visualizar e interagir com o conteúdo
 */
DROP TYPE IF EXISTS public.workspace_role CASCADE;
CREATE TYPE public.workspace_role AS ENUM ('owner', 'manager', 'user');

-- ============================================================================
-- ETAPA 2: CRIAR TABELA WORKSPACE_MEMBERS
-- ============================================================================

/**
 * Tabela: workspace_members
 * 
 * Tabela intermediária (many-to-many) que relaciona usuários (profiles) com
 * workspaces, definindo o role de cada usuário em cada workspace.
 * 
 * Características:
 * - Um usuário pode participar de múltiplos workspaces
 * - Um workspace pode ter múltiplos usuários
 * - Cada combinação workspace + profile é única (constraint UNIQUE)
 * - Cada membro tem um role específico por workspace
 * 
 * Campos:
 * - id: Identificador único do registro de membership
 * - workspace_id: Referência ao workspace
 * - profile_id: Referência ao usuário/profile
 * - role: Papel do usuário no workspace (owner, manager, user)
 * - joined_at: Data em que o usuário entrou no workspace
 * - updated_at: Data da última atualização (ex: mudança de role)
 */
CREATE TABLE public.workspace_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  role public.workspace_role NOT NULL DEFAULT 'user',
  joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Constraint: Um usuário só pode ser membro de um workspace uma vez
  CONSTRAINT unique_workspace_member UNIQUE (workspace_id, profile_id)
);

-- ============================================================================
-- ETAPA 3: CRIAR ÍNDICES DE PERFORMANCE
-- ============================================================================

-- Índice para queries: "Listar todos os membros de um workspace"
CREATE INDEX idx_workspace_members_workspace_id 
ON public.workspace_members(workspace_id);

-- Índice para queries: "Listar todos os workspaces de um usuário"
CREATE INDEX idx_workspace_members_profile_id 
ON public.workspace_members(profile_id);

-- Índice composto para verificações rápidas de permissão
-- Ex: "Este usuário é owner/manager deste workspace?"
CREATE INDEX idx_workspace_members_workspace_role 
ON public.workspace_members(workspace_id, role);

-- Índice para ordenação por data de entrada
CREATE INDEX idx_workspace_members_joined_at 
ON public.workspace_members(joined_at DESC);

-- ============================================================================
-- ETAPA 4: CRIAR TRIGGER PARA ATUALIZAR updated_at
-- ============================================================================

CREATE TRIGGER update_workspace_members_updated_at
  BEFORE UPDATE ON public.workspace_members
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================================================
-- ETAPA 5: CRIAR FUNÇÕES AUXILIARES (SECURITY DEFINER)
-- ============================================================================

/**
 * Função: is_workspace_member
 * 
 * Verifica se um usuário é membro de um workspace específico.
 * 
 * @param _profile_id UUID - ID do usuário a verificar
 * @param _workspace_id UUID - ID do workspace
 * @returns BOOLEAN - true se o usuário é membro, false caso contrário
 * 
 * Uso: Validar se um usuário tem acesso a um workspace antes de permitir
 *      visualização de dados ou execução de ações.
 */
CREATE OR REPLACE FUNCTION public.is_workspace_member(
  _profile_id UUID,
  _workspace_id UUID
)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.workspace_members
    WHERE profile_id = _profile_id
      AND workspace_id = _workspace_id
  );
$$;

/**
 * Função: get_user_workspace_role
 * 
 * Retorna o role de um usuário em um workspace específico.
 * 
 * @param _profile_id UUID - ID do usuário
 * @param _workspace_id UUID - ID do workspace
 * @returns workspace_role - Role do usuário (owner, manager, user) ou NULL
 * 
 * Uso: Verificar permissões específicas de um usuário em um workspace.
 *      Retorna NULL se o usuário não for membro do workspace.
 */
CREATE OR REPLACE FUNCTION public.get_user_workspace_role(
  _profile_id UUID,
  _workspace_id UUID
)
RETURNS public.workspace_role
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role
  FROM public.workspace_members
  WHERE profile_id = _profile_id
    AND workspace_id = _workspace_id
  LIMIT 1;
$$;

/**
 * Função: can_manage_members
 * 
 * Verifica se um usuário tem permissão para adicionar/remover membros
 * em um workspace (requer role 'owner' ou 'manager').
 * 
 * @param _profile_id UUID - ID do usuário a verificar
 * @param _workspace_id UUID - ID do workspace
 * @returns BOOLEAN - true se o usuário pode gerenciar membros
 * 
 * Uso: Validar permissões antes de permitir operações de INSERT/DELETE
 *      na tabela workspace_members.
 */
CREATE OR REPLACE FUNCTION public.can_manage_members(
  _profile_id UUID,
  _workspace_id UUID
)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.workspace_members
    WHERE profile_id = _profile_id
      AND workspace_id = _workspace_id
      AND role IN ('owner', 'manager')
  );
$$;

/**
 * Função: is_workspace_owner
 * 
 * Verifica se um usuário é owner de um workspace específico.
 * 
 * @param _profile_id UUID - ID do usuário a verificar
 * @param _workspace_id UUID - ID do workspace
 * @returns BOOLEAN - true se o usuário é owner
 * 
 * Uso: Validar permissões de alto nível (deletar workspace, transferir ownership, etc).
 */
CREATE OR REPLACE FUNCTION public.is_workspace_owner(
  _profile_id UUID,
  _workspace_id UUID
)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.workspace_members
    WHERE profile_id = _profile_id
      AND workspace_id = _workspace_id
      AND role = 'owner'
  );
$$;

/**
 * Função: count_workspace_owners
 * 
 * Conta quantos owners um workspace possui.
 * 
 * @param _workspace_id UUID - ID do workspace
 * @returns INTEGER - Número de owners
 * 
 * Uso: Validar antes de remover um owner (deve sempre ter pelo menos 1).
 */
CREATE OR REPLACE FUNCTION public.count_workspace_owners(
  _workspace_id UUID
)
RETURNS INTEGER
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COUNT(*)::INTEGER
  FROM public.workspace_members
  WHERE workspace_id = _workspace_id
    AND role = 'owner';
$$;

-- ============================================================================
-- ETAPA 6: HABILITAR ROW LEVEL SECURITY
-- ============================================================================

ALTER TABLE public.workspace_members ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- ETAPA 7: CRIAR POLÍTICAS RLS
-- ============================================================================

/**
 * Política: SELECT - "Users can view members of their workspaces"
 * 
 * Um usuário pode visualizar os membros de um workspace se:
 * - Ele próprio for membro daquele workspace
 * 
 * Isso garante que apenas membros de um workspace podem ver quem
 * mais faz parte daquele workspace (isolamento multi-tenant).
 */
CREATE POLICY "Users can view members of their workspaces"
ON public.workspace_members
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.workspace_members wm
    WHERE wm.workspace_id = workspace_members.workspace_id
      AND wm.profile_id = auth.uid()
  )
);

/**
 * Política: INSERT - "Owners and managers can add members"
 * 
 * Um usuário pode adicionar novos membros a um workspace se:
 * - Ele for 'owner' ou 'manager' daquele workspace
 * 
 * Isso impede que usuários comuns ('user') adicionem novos membros.
 */
CREATE POLICY "Owners and managers can add members"
ON public.workspace_members
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM public.workspace_members wm
    WHERE wm.workspace_id = workspace_members.workspace_id
      AND wm.profile_id = auth.uid()
      AND wm.role IN ('owner', 'manager')
  )
);

/**
 * Política: UPDATE - "Owners and managers can update member roles"
 * 
 * Um usuário pode atualizar o role de um membro se:
 * - Ele for 'owner' ou 'manager' do workspace
 * 
 * Nota: A proteção contra rebaixamento do último owner deve ser implementada
 * via trigger ou no código da aplicação, pois RLS não tem acesso a OLD/NEW.
 */
CREATE POLICY "Owners and managers can update member roles"
ON public.workspace_members
FOR UPDATE
TO authenticated
USING (
  -- Pode atualizar se for owner/manager do workspace
  EXISTS (
    SELECT 1
    FROM public.workspace_members wm
    WHERE wm.workspace_id = workspace_members.workspace_id
      AND wm.profile_id = auth.uid()
      AND wm.role IN ('owner', 'manager')
  )
)
WITH CHECK (
  -- Verifica se continua sendo owner/manager
  EXISTS (
    SELECT 1
    FROM public.workspace_members wm
    WHERE wm.workspace_id = workspace_members.workspace_id
      AND wm.profile_id = auth.uid()
      AND wm.role IN ('owner', 'manager')
  )
);

/**
 * Política: DELETE - "Only owners can remove members (except themselves if last owner)"
 * 
 * Um usuário pode remover membros de um workspace se:
 * - Ele for 'owner' do workspace
 * - O membro sendo removido não é ele mesmo
 * 
 * Esta política impede:
 * - Que um owner se auto-remova (deve primeiro transferir ownership ou adicionar outro owner)
 * - Que não-owners removam membros
 * 
 * Nota: Se um owner quiser sair, ele deve primeiro promover outro membro a owner.
 */
CREATE POLICY "Only owners can remove members"
ON public.workspace_members
FOR DELETE
TO authenticated
USING (
  -- Não pode remover a si mesmo
  workspace_members.profile_id != auth.uid()
  -- E deve ser owner do workspace
  AND EXISTS (
    SELECT 1
    FROM public.workspace_members wm
    WHERE wm.workspace_id = workspace_members.workspace_id
      AND wm.profile_id = auth.uid()
      AND wm.role = 'owner'
  )
);

-- ============================================================================
-- ETAPA 8: ATUALIZAR POLÍTICAS RLS DE WORKSPACES
-- ============================================================================

/**
 * Agora que workspace_members existe, refinamos as políticas de workspaces
 * para usar verificações de membership reais.
 */

-- Remover políticas temporárias
DROP POLICY IF EXISTS "Authenticated users can view workspaces" ON public.workspaces;
DROP POLICY IF EXISTS "Authenticated users can update their workspaces" ON public.workspaces;
DROP POLICY IF EXISTS "Authenticated users can delete their workspaces" ON public.workspaces;

-- Criar políticas refinadas

/**
 * Política: SELECT - "Users can view workspaces where they are members"
 */
CREATE POLICY "Users can view their workspaces"
ON public.workspaces
FOR SELECT
TO authenticated
USING (
  public.is_workspace_member(auth.uid(), id)
);

/**
 * Política: INSERT - "Authenticated users can create workspaces"
 * 
 * Mantém a política de INSERT original para permitir que usuários autenticados
 * criem novos workspaces. Eles automaticamente se tornam owners via trigger.
 */
CREATE POLICY "Authenticated users can create workspaces"
ON public.workspaces
FOR INSERT
TO authenticated
WITH CHECK (true);

/**
 * Política: UPDATE - "Only owners can update workspace details"
 */
CREATE POLICY "Only owners can update workspaces"
ON public.workspaces
FOR UPDATE
TO authenticated
USING (
  public.is_workspace_owner(auth.uid(), id)
)
WITH CHECK (
  public.is_workspace_owner(auth.uid(), id)
);

/**
 * Política: DELETE - "Only owners can delete workspaces"
 */
CREATE POLICY "Only owners can delete workspaces"
ON public.workspaces
FOR DELETE
TO authenticated
USING (
  public.is_workspace_owner(auth.uid(), id)
);

-- ============================================================================
-- ETAPA 9: CRIAR TRIGGER PARA AUTO-ADD CREATOR AS OWNER
-- ============================================================================

/**
 * Função: add_creator_as_workspace_owner
 * 
 * Automaticamente adiciona o criador de um workspace como 'owner' inicial.
 * Este trigger é executado APÓS a criação de um novo workspace.
 * 
 * Fluxo:
 * 1. Usuário cria workspace via INSERT em workspaces
 * 2. Trigger adiciona automaticamente o criador como owner em workspace_members
 * 3. Usuário tem acesso imediato ao workspace criado
 */
CREATE OR REPLACE FUNCTION public.add_creator_as_workspace_owner()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Adicionar o criador como owner do workspace
  INSERT INTO public.workspace_members (workspace_id, profile_id, role)
  VALUES (NEW.id, auth.uid(), 'owner');
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER add_creator_as_owner_trigger
  AFTER INSERT ON public.workspaces
  FOR EACH ROW
  EXECUTE FUNCTION public.add_creator_as_workspace_owner();

-- ============================================================================
-- ETAPA 9.2: CRIAR TRIGGER PARA PREVENIR REBAIXAMENTO DO ÚLTIMO OWNER
-- ============================================================================

/**
 * Função: prevent_last_owner_downgrade
 * 
 * Impede que o último owner de um workspace seja rebaixado ou removido.
 * Este trigger é executado ANTES de UPDATE ou DELETE em workspace_members.
 * 
 * Validações:
 * - Se está tentando rebaixar um owner para manager/user
 * - Conta quantos owners existem no workspace
 * - Se for o último owner, impede a operação
 */
CREATE OR REPLACE FUNCTION public.prevent_last_owner_downgrade()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
  owner_count INTEGER;
BEGIN
  -- Apenas validar se está alterando um owner
  IF (TG_OP = 'UPDATE' AND OLD.role = 'owner' AND NEW.role != 'owner') OR
     (TG_OP = 'DELETE' AND OLD.role = 'owner') THEN
    
    -- Contar quantos owners existem no workspace
    SELECT COUNT(*)
    INTO owner_count
    FROM public.workspace_members
    WHERE workspace_id = OLD.workspace_id
      AND role = 'owner';
    
    -- Se for o último owner, impedir a operação
    IF owner_count = 1 THEN
      RAISE EXCEPTION 'Cannot remove or downgrade the last owner of the workspace. Please assign another owner first.';
    END IF;
  END IF;
  
  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  ELSE
    RETURN NEW;
  END IF;
END;
$$;

CREATE TRIGGER prevent_last_owner_downgrade_trigger
  BEFORE UPDATE OR DELETE ON public.workspace_members
  FOR EACH ROW
  EXECUTE FUNCTION public.prevent_last_owner_downgrade();

-- ============================================================================
-- ETAPA 10: ADICIONAR COMENTÁRIOS DE DOCUMENTAÇÃO
-- ============================================================================

COMMENT ON TABLE public.workspace_members IS 
'Tabela intermediária que relaciona usuários (profiles) com workspaces, definindo o role de cada usuário em cada workspace. Implementa o modelo multi-tenant com suporte a múltiplos workspaces por usuário.';

COMMENT ON COLUMN public.workspace_members.id IS 
'Identificador único do registro de membership';

COMMENT ON COLUMN public.workspace_members.workspace_id IS 
'Referência ao workspace (CASCADE delete quando workspace é deletado)';

COMMENT ON COLUMN public.workspace_members.profile_id IS 
'Referência ao usuário/profile (CASCADE delete quando profile é deletado)';

COMMENT ON COLUMN public.workspace_members.role IS 
'Role do usuário no workspace: owner (controle total), manager (gerenciamento), user (acesso básico)';

COMMENT ON COLUMN public.workspace_members.joined_at IS 
'Timestamp de quando o usuário se tornou membro do workspace';

COMMENT ON COLUMN public.workspace_members.updated_at IS 
'Timestamp da última atualização (ex: mudança de role) - atualizado via trigger';

-- ============================================================================
-- FIM DA MIGRATION
-- ============================================================================

-- Verificação de integridade (comentado - descomente para debug)
-- SELECT 'workspace_members table created successfully' AS status;
-- SELECT COUNT(*) AS total_policies FROM pg_policies WHERE tablename = 'workspace_members';
-- SELECT COUNT(*) AS total_functions FROM pg_proc WHERE proname LIKE '%workspace%';
