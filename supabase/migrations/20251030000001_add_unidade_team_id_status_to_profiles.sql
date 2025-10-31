-- ============================================================================
-- MIGRATION: Adicionar colunas unidade, team_id e status à tabela profiles
-- ============================================================================
-- Data: 30 de outubro de 2025
-- Descrição: Adiciona suporte a unidades, equipes e status de usuários dos clientes
-- ============================================================================

-- 1. Adicionar coluna unidade (onde o usuário trabalha)
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS unidade TEXT NULL;

COMMENT ON COLUMN public.profiles.unidade IS 'Local ou unidade onde o usuário trabalha. Ex: Escritório RJ - Sala 205';

-- 2. Adicionar coluna status (ativo/inativo)
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'ativo'
CHECK (status IN ('ativo', 'inativo'));

COMMENT ON COLUMN public.profiles.status IS 'Status do usuário: ativo ou inativo';

-- 3. Criar índice para performance
CREATE INDEX IF NOT EXISTS idx_profiles_status ON public.profiles(status);

-- 4. Nota: A coluna team_id será adicionada após a criação da tabela teams
-- Ver migration: create_teams_table
