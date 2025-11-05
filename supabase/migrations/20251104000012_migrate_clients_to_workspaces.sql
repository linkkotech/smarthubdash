-- ============================================================================
-- MIGRATION: Migrar dados de clients para workspaces
-- ============================================================================
-- Data: 04 de novembro de 2025
-- Fase: PREPARAÇÃO (migração de dados)
-- Descrição: Copia dados existentes de clients → workspaces e teams → workspace_teams
--            Atualiza FKs em profiles, contracts, digital_profiles
-- IMPORTANTE: Esta migration é IDEMPOTENTE (pode ser executada múltiplas vezes)
-- ============================================================================

-- ============================================================================
-- ETAPA 1: Migrar clients → workspaces
-- ============================================================================

-- Função para gerar slug a partir do nome
CREATE OR REPLACE FUNCTION generate_workspace_slug(workspace_name TEXT)
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
  base_slug TEXT;
  final_slug TEXT;
  counter INTEGER := 1;
BEGIN
  -- Converter para lowercase e substituir caracteres especiais por hífen
  base_slug := LOWER(TRIM(workspace_name));
  base_slug := REGEXP_REPLACE(base_slug, '[^a-z0-9]+', '-', 'g');
  base_slug := REGEXP_REPLACE(base_slug, '^-+|-+$', '', 'g'); -- remover hífens do início/fim
  
  -- Se slug vazio, usar 'workspace'
  IF base_slug = '' THEN
    base_slug := 'workspace';
  END IF;
  
  final_slug := base_slug;
  
  -- Verificar se slug já existe e adicionar sufixo numérico se necessário
  WHILE EXISTS (SELECT 1 FROM workspaces WHERE slug = final_slug) LOOP
    final_slug := base_slug || '-' || counter;
    counter := counter + 1;
  END LOOP;
  
  RETURN final_slug;
END;
$$;

-- Inserir workspaces baseados em clients existentes (apenas se não existirem)
INSERT INTO public.workspaces (id, name, slug, created_at, updated_at)
SELECT 
  c.id,
  c.name,
  generate_workspace_slug(c.name),
  c.created_at,
  c.updated_at
FROM public.clients c
WHERE NOT EXISTS (
  SELECT 1 FROM public.workspaces w WHERE w.id = c.id
)
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- ETAPA 2: Atualizar workspace_id em profiles
-- ============================================================================

-- Copiar client_id → workspace_id onde workspace_id ainda está NULL
UPDATE public.profiles
SET workspace_id = client_id
WHERE client_id IS NOT NULL 
  AND workspace_id IS NULL
  AND EXISTS (SELECT 1 FROM public.workspaces WHERE id = client_id);

-- ============================================================================
-- ETAPA 3: Atualizar workspace_id em contracts
-- ============================================================================

-- Copiar client_id → workspace_id onde workspace_id ainda está NULL
UPDATE public.contracts
SET workspace_id = client_id
WHERE workspace_id IS NULL
  AND EXISTS (SELECT 1 FROM public.workspaces WHERE id = client_id);

-- ============================================================================
-- ETAPA 4: Atualizar workspace_id em digital_profiles (se existir)
-- ============================================================================

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'digital_profiles') THEN
    UPDATE public.digital_profiles
    SET workspace_id = client_id
    WHERE client_id IS NOT NULL 
      AND workspace_id IS NULL
      AND EXISTS (SELECT 1 FROM public.workspaces WHERE id = client_id);
  END IF;
END $$;

-- ============================================================================
-- ETAPA 5: Migrar teams → workspace_teams
-- ============================================================================

-- Inserir workspace_teams baseados em teams existentes (apenas se não existirem)
INSERT INTO public.workspace_teams (id, workspace_id, name, description, created_at, updated_at)
SELECT 
  t.id,
  t.client_id,
  t.name,
  t.description,
  t.created_at,
  t.updated_at
FROM public.teams t
WHERE EXISTS (SELECT 1 FROM public.workspaces WHERE id = t.client_id)
  AND NOT EXISTS (SELECT 1 FROM public.workspace_teams wt WHERE wt.id = t.id)
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- ETAPA 6: Atualizar workspace_team_id em profiles
-- ============================================================================

-- Copiar team_id → workspace_team_id onde workspace_team_id ainda está NULL
UPDATE public.profiles
SET workspace_team_id = team_id
WHERE team_id IS NOT NULL 
  AND workspace_team_id IS NULL
  AND EXISTS (SELECT 1 FROM public.workspace_teams WHERE id = team_id);

-- ============================================================================
-- ETAPA 7: Criar workspace_members para owners que ainda não existem
-- ============================================================================

-- Para cada workspace criado a partir de um client, criar o workspace_member para o admin
-- se ainda não existir
INSERT INTO public.workspace_members (workspace_id, profile_id, role)
SELECT 
  w.id,
  c.admin_user_id,
  'owner'
FROM public.workspaces w
INNER JOIN public.clients c ON c.id = w.id
WHERE c.admin_user_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 
    FROM public.workspace_members wm 
    WHERE wm.workspace_id = w.id 
      AND wm.profile_id = c.admin_user_id
  )
ON CONFLICT DO NOTHING;

-- ============================================================================
-- ETAPA 8: Drop função temporária
-- ============================================================================

DROP FUNCTION IF EXISTS generate_workspace_slug(TEXT);

-- ============================================================================
-- VERIFICAÇÃO E RELATÓRIO
-- ============================================================================

DO $$
DECLARE
  workspaces_count INTEGER;
  profiles_migrated INTEGER;
  contracts_migrated INTEGER;
  teams_migrated INTEGER;
  profiles_team_migrated INTEGER;
BEGIN
  SELECT COUNT(*) INTO workspaces_count FROM public.workspaces;
  SELECT COUNT(*) INTO profiles_migrated FROM public.profiles WHERE workspace_id IS NOT NULL;
  SELECT COUNT(*) INTO contracts_migrated FROM public.contracts WHERE workspace_id IS NOT NULL;
  SELECT COUNT(*) INTO teams_migrated FROM public.workspace_teams;
  SELECT COUNT(*) INTO profiles_team_migrated FROM public.profiles WHERE workspace_team_id IS NOT NULL;
  
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Migration 12 concluída com sucesso!';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Total de workspaces: %', workspaces_count;
  RAISE NOTICE 'Profiles com workspace_id: %', profiles_migrated;
  RAISE NOTICE 'Contracts com workspace_id: %', contracts_migrated;
  RAISE NOTICE 'Workspace teams criadas: %', teams_migrated;
  RAISE NOTICE 'Profiles com workspace_team_id: %', profiles_team_migrated;
  RAISE NOTICE '========================================';
  RAISE NOTICE 'NOTA: Dados antigos (client_id, team_id) ainda existem';
  RAISE NOTICE 'Eles serão removidos na Fase 3 (após validação)';
END $$;
