-- Migration 06: Fix RLS Recursion in workspace_members
-- Data: 06 de novembro de 2025
-- Descrição: Corrige a recursão infinita nas políticas RLS da tabela workspace_members

-- Criar função para verificar se usuário é membro do workspace
CREATE OR REPLACE FUNCTION public.user_is_workspace_member(
    _user_id UUID,
    _workspace_id UUID
) RETURNS BOOLEAN AS $$
BEGIN
    -- Verificar se o usuário é membro do workspace
    -- Esta função evita a recursão direta chamando a tabela workspace_members
    -- sem depender de outras funções que possam causar recursão
    RETURN EXISTS (
        SELECT 1 
        FROM public.workspace_members 
        WHERE profile_id = _user_id 
        AND workspace_id = _workspace_id
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Criar função para verificar se o usuário pode gerenciar o workspace
CREATE OR REPLACE FUNCTION public.user_can_manage_workspace(
    _user_id UUID,
    _workspace_id UUID
) RETURNS BOOLEAN AS $$
BEGIN
    -- Verificar se o usuário é owner ou manager do workspace
    -- Esta função evita a recursão direta chamando a tabela workspace_members
    -- sem depender de outras funções que possam causar recursão
    RETURN EXISTS (
        SELECT 1 
        FROM public.workspace_members 
        WHERE profile_id = _user_id 
        AND workspace_id = _workspace_id
        AND role IN ('owner', 'manager')
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Remover políticas RLS existentes que possam causar recursão
DROP POLICY IF EXISTS "Workspace members can view own membership" ON public.workspace_members;
DROP POLICY IF EXISTS "Workspace members can update own membership" ON public.workspace_members;
DROP POLICY IF EXISTS "Workspace members can delete own membership" ON public.workspace_members;

-- Criar novas políticas RLS que não causam recursão
CREATE POLICY "Workspace members can view own membership" 
ON public.workspace_members
FOR SELECT
USING (
    -- Usar a função para verificar permissão sem causar recursão
    public.user_is_workspace_member(auth.uid(), workspace_id)
);

CREATE POLICY "Workspace members can update own membership" 
ON public.workspace_members
FOR UPDATE
USING (
    -- Usar a função para verificar permissão sem causar recursão
    public.user_can_manage_workspace(auth.uid(), workspace_id)
);

CREATE POLICY "Workspace members can delete own membership" 
ON public.workspace_members
FOR DELETE
USING (
    -- Usar a função para verificar permissão sem causar recursão
    public.user_can_manage_workspace(auth.uid(), workspace_id)
);

-- Criar política para permitir admins verem todos os membros
CREATE POLICY "Platform admins can view all workspace members" 
ON public.workspace_members
FOR SELECT
USING (
    public.has_role(auth.uid(), 'super_admin')
);

-- Criar política para permitir admins gerenciarem todos os membros
CREATE POLICY "Platform admins can manage all workspace members" 
ON public.workspace_members
FOR ALL
USING (
    public.has_role(auth.uid(), 'super_admin')
);

-- Criar índice para melhor performance
CREATE INDEX IF NOT EXISTS idx_workspace_members_profile_workspace 
ON public.workspace_members (profile_id, workspace_id);

-- Criar índice para melhor performance das novas funções
CREATE INDEX IF NOT EXISTS idx_workspace_members_role 
ON public.workspace_members (role);

-- Relatório final
DO $$
BEGIN
  RAISE NOTICE 'Migration 06: Fix RLS Recursion aplicada com sucesso';
  RAISE NOTICE 'Funções criadas: user_is_workspace_member, user_can_manage_workspace';
  RAISE NOTICE 'Políticas RLS atualizadas para evitar recursão';
  RAISE NOTICE 'Índices criados para melhor performance';
END $$;