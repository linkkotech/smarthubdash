# 📋 Lista de Tarefas por Fases - SmartHubDash

## 🎯 Visão Geral

Este documento detalha uma lista de tarefas organizadas por fases para implementação das melhorias recomendadas no SmartHubDash. Cada fase tem tarefas específicas com prazos, responsáveis e critérios de conclusão.

---

## 🚨 Fase 1: Segurança e Estabilidade (Semana 1-2)

### 1.1. Validação de Migrations Críticas

#### Tarefa 1.1.1: Validar Migration 06 (RLS Recursion)
- **Descrição**: Testar se a recursão infinita foi resolvida
- **Prazo**: 1 dia
- **Responsável**: DBA
- **Critérios de Conclusão**:
  - [ ] Testar em ambiente de staging
  - [ ] Validar que queries não causam loop infinito
  - [ ] Verificar performance da query
- **Artefatos**: Relatório de teste de performance

```sql
-- Script de validação
EXPLAIN ANALYZE 
SELECT wm.* 
FROM public.workspace_members wm 
WHERE wm.workspace_id = 'workspace-id'
  AND wm.profile_id = 'user-id';
```

#### Tarefa 1.1.2: Validar Migration 05 (SERVICE_ROLE)
- **Descrição**: Testar criação de workspaces via Edge Functions
- **Prazo**: 1 dia
- **Responsável**: Backend Developer
- **Critérios de Conclusão**:
  - [ ] Testar criação via Edge Function
  - [ ] Validar que owner_id é populado corretamente
  - [ ] Verificar que não há erros de NOT NULL
- **Artefatos**: Logs de teste e validação

```typescript
// Teste de Edge Function
const testWorkspaceCreation = async () => {
  const { data, error } = await supabase.functions.invoke('create-workspace', {
    body: { name: 'Test Workspace' }
  });
  
  if (error) {
    console.error('Erro na criação:', error);
    return false;
  }
  
  // Validar workspace criado
  const { data: workspace } = await supabase
    .from('workspaces')
    .select('*')
    .eq('id', data.id)
    .single();
  
  return !!workspace;
};
```

#### Tarefa 1.1.3: Criar Scripts de Rollback
- **Descrição**: Implementar scripts de rollback para todas as migrations críticas
- **Prazo**: 2 dias
- **Responsável**: DevOps
- **Critérios de Conclusão**:
  - [ ] Script de rollback para migration 06
  - [ ] Script de rollback para migration 05
  - [ ] Script de rollback para migration 12
  - [ ] Documentação de como usar os scripts
- **Artefatos**: Scripts de rollback e documentação

```sql
-- Exemplo de script de rollback
-- ROLLBACK_MIGRATION_06.sql
-- =================================

-- Reverter as funções SECURITY DEFINER
DROP FUNCTION IF EXISTS public.user_is_workspace_member(UUID, UUID);
DROP FUNCTION IF EXISTS public.user_can_manage_workspace(UUID, UUID);

-- Reverter as políticas RLS
DROP POLICY IF EXISTS "Users can view members of their workspaces" ON public.workspace_members;
DROP POLICY IF EXISTS "Owners and managers can add members" ON public.workspace_members;
DROP POLICY IF EXISTS "Owners and managers can update member roles" ON public.workspace_members;
DROP POLICY IF EXISTS "Only owners can remove members" ON public.workspace_members;

-- Recriar políticas antigas (simplificadas)
CREATE POLICY "Users can view members of their workspaces"
ON public.workspace_members
FOR SELECT
TO authenticated
USING (true);  -- Política temporária para rollback
```

### 1.2. Implementar Monitoramento de Segurança

#### Tarefa 1.2.1: Criar Sistema de Logging de Segurança
- **Descrição**: Implementar logging de tentativas de acesso e violações
- **Prazo**: 3 dias
- **Responsável**: Backend Developer
- **Critérios de Conclusão**:
  - [ ] Logging de tentativas de login
  - [ ] Alerta para violações de RLS
  - [ ] Dashboard de segurança básico
- **Artefatos**: Sistema de logging e dashboard

```typescript
// Sistema de logging de segurança
class SecurityLogger {
  private logAuthAttempt = async (email: string, success: boolean, userId?: string) => {
    await supabase.from('security_logs').insert({
      type: 'AUTH_ATTEMPT',
      email,
      success,
      user_id: userId,
      timestamp: new Date().toISOString(),
      ip: this.getClientIP()
    });
  };

  private logRLSViolation = async (table: string, userId: string, query: string) => {
    await supabase.from('security_logs').insert({
      type: 'RLS_VIOLATION',
      table,
      user_id: userId,
      query,
      timestamp: new Date().toISOString()
    });
    
    // Enviar alerta imediato
    this.sendSecurityAlert('RLS Violation detected', {
      table,
      userId,
      query
    });
  };

  private sendSecurityAlert = (message: string, details: any) => {
    // Implementar envio de alerta via email, Slack, etc.
    console.error('SECURITY ALERT:', message, details);
  };
}
```

#### Tarefa 1.2.2: Validar Dados Críticos
- **Descrição**: Criar função de validação de integridade de dados
- **Prazo**: 2 dias
- **Responsável**: DBA
- **Critérios de Conclusão**:
  - [ ] Função de validação criada
  - [ ] Script de execução agendada
  - [ ] Relatório de integridade
- **Artefatos**: Função de validação e script de agendamento

```sql
-- Função de validação de integridade
CREATE OR REPLACE FUNCTION validate_data_integrity()
RETURNS TABLE(validation_result TEXT, issues_count INTEGER, details JSONB) AS $$
DECLARE
  workspace_issues INTEGER;
  profile_issues INTEGER;
  contract_issues INTEGER;
BEGIN
  -- Validar workspace_members
  SELECT COUNT(*) INTO workspace_issues
  FROM workspace_members wm
  LEFT JOIN workspaces w ON wm.workspace_id = w.id
  WHERE w.id IS NULL;
  
  -- Validar profiles
  SELECT COUNT(*) INTO profile_issues
  FROM profiles p
  LEFT JOIN workspaces w ON p.workspace_id = w.id
  WHERE p.workspace_id IS NOT NULL AND w.id IS NULL;
  
  -- Validar contracts
  SELECT COUNT(*) INTO contract_issues
  FROM contracts c
  LEFT JOIN workspaces w ON c.workspace_id = w.id
  WHERE c.workspace_id IS NOT NULL AND w.id IS NULL;
  
  -- Retornar resultados
  RETURN QUERY SELECT 
    'workspace_members_integrity' as validation_result,
    workspace_issues as issues_count,
    jsonb_build_object('details', 'workspace members without valid workspace') as details;
  
  RETURN QUERY SELECT 
    'profiles_integrity' as validation_result,
    profile_issues as issues_count,
    jsonb_build_object('details', 'profiles with invalid workspace_id') as details;
  
  RETURN QUERY SELECT 
    'contracts_integrity' as validation_result,
    contract_issues as issues_count,
    jsonb_build_object('details', 'contracts with invalid workspace_id') as details;
END;
$$ LANGUAGE plpgsql;
```

---

## 🚀 Fase 2: Performance e Otimização (Semana 3-4)

### 2.1. Otimização de Queries e Índices

#### Tarefa 2.1.1: Adicionar Índices Críticos
- **Descrição**: Implementar índices para melhorar performance
- **Prazo**: 2 dias
- **Responsável**: DBA
- **Critérios de Conclusão**:
  - [ ] Índice em workspace_members(profile_id, role)
  - [ ] Índice em workspaces(owner_id)
  - [ ] Índice composto em profiles(workspace_id, role)
  - [ ] Testar performance após criação
- **Artefatos**: Scripts de criação de índices e relatório de performance

```sql
-- Scripts de criação de índices
-- =================================

-- Índice para queries de membros por usuário e role
CREATE INDEX IF NOT EXISTS idx_workspace_members_user_role 
ON public.workspace_members(profile_id, role);

-- Índice para queries de workspaces por owner
CREATE INDEX IF NOT EXISTS idx_workspaces_owner_id 
ON public.workspaces(owner_id);

-- Índice composto para queries de profiles por workspace e role
CREATE INDEX IF NOT EXISTS idx_profiles_workspace_role 
ON public.profiles(workspace_id, role);

-- Índice para queries de contracts por workspace
CREATE INDEX IF NOT EXISTS idx_contracts_workspace_id 
ON public.contracts(workspace_id);

-- Índice para queries de digital_profiles por workspace
CREATE INDEX IF NOT EXISTS idx_digital_profiles_workspace_id 
ON public.digital_profiles(workspace_id);
```

#### Tarefa 2.1.2: Otimizar Queries Complexas
- **Descrição**: Refatorar queries complexas para melhor performance
- **Prazo**: 3 dias
- **Responsável**: Backend Developer
- **Critérios de Conclusão**:
  - [ ] Otimizar query de workspace members
  - [ ] Otimizar query de contracts
  - [ ] Otimizar query de profiles
  - [ ] Testar performance antes/depois
- **Artefatos**: Queries otimizadas e relatório de performance

```typescript
// Query otimizada para workspace members
const getWorkspaceMembers = async (workspaceId: string) => {
  const { data, error } = await supabase
    .from('workspace_members')
    .select(`
      id,
      role,
      profiles!workspace_members_profile_id_fkey (
        id,
        full_name,
        email,
        avatar_url
      )
    `)
    .eq('workspace_id', workspaceId)
    .order('created_at', { ascending: true });
  
  if (error) throw error;
  return data;
};

// Query otimizada para contracts
const getWorkspaceContracts = async (workspaceId: string) => {
  const { data, error } = await supabase
    .from('contracts')
    .select(`
      *,
      profiles!contracts_created_by_fkey (
        full_name,
        email
      )
    `)
    .eq('workspace_id', workspaceId)
    .order('created_at', { ascending: false });
  
  if (error) throw error;
  return data;
};
```

### 2.2. Implementar Cache Estratégico

#### Tarefa 2.2.1: Criar Cache de Workspaces
- **Descrição**: Implementar cache para dados de workspaces
- **Prazo**: 2 dias
- **Responsável**: Frontend Developer
- **Critérios de Conclusão**:
  - [ ] Cache de workspaces implementado
  - [ ] Cache invalidation automático
  - [ ] Testar performance com cache
- **Artefatos**: Sistema de cache e testes de performance

```typescript
// Sistema de cache para workspaces
class WorkspaceCache {
  private cache = new Map<string, Workspace>();
  private cacheExpiry = new Map<string, number>();
  private readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutos

  getWorkspace = async (workspaceId: string): Promise<Workspace | null> => {
    // Verificar se está no cache e válido
    if (this.cache.has(workspaceId) && !this.isExpired(workspaceId)) {
      return this.cache.get(workspaceId)!;
    }

    // Buscar do banco
    const { data, error } = await supabase
      .from('workspaces')
      .select('*')
      .eq('id', workspaceId)
      .single();

    if (error || !data) {
      return null;
    }

    // Armazenar no cache
    this.setWorkspace(workspaceId, data);
    return data;
  };

  setWorkspace = (workspaceId: string, workspace: Workspace) => {
    this.cache.set(workspaceId, workspace);
    this.cacheExpiry.set(workspaceId, Date.now() + this.CACHE_TTL);
  };

  private isExpired = (workspaceId: string): boolean => {
    const expiry = this.cacheExpiry.get(workspaceId);
    return !expiry || Date.now() > expiry;
  };

  clearCache = () => {
    this.cache.clear();
    this.cacheExpiry.clear();
  };
}
```

#### Tarefa 2.2.2: Implementar Cache de Permissões
- **Descrição**: Cache de permissões de usuários para reduzir consultas
- **Prazo**: 2 dias
- **Responsável**: Backend Developer
- **Critérios de Conclusão**:
  - [ ] Cache de permissões implementado
  - [ ] Atualização automática de permissões
  - [ ] Testar com múltiplos usuários
- **Artefatos**: Sistema de cache de permissões

```typescript
// Cache de permissões
class PermissionCache {
  private userPermissions = new Map<string, string[]>();
  private cacheExpiry = new Map<string, number>();
  private readonly CACHE_TTL = 10 * 60 * 1000; // 10 minutos

  getUserPermissions = async (userId: string): Promise<string[]> => {
    // Verificar cache
    if (this.userPermissions.has(userId) && !this.isExpired(userId)) {
      return this.userPermissions.get(userId)!;
    }

    // Buscar permissões do banco
    const { data, error } = await supabase
      .from('workspace_members')
      .select('role')
      .eq('profile_id', userId);

    if (error) {
      return [];
    }

    const permissions = data.map(item => item.role);
    
    // Armazenar no cache
    this.userPermissions.set(userId, permissions);
    this.cacheExpiry.set(userId, Date.now() + this.CACHE_TTL);
    
    return permissions;
  };

  private isExpired = (userId: string): boolean => {
    const expiry = this.cacheExpiry.get(userId);
    return !expiry || Date.now() > expiry;
  };

  clearUserCache = (userId: string) => {
    this.userPermissions.delete(userId);
    this.cacheExpiry.delete(userId);
  };
}
```

---

## 🔧 Fase 3: Refatoração de Código (Semana 5-6)

### 3.1. Refatorar Migrations Complexas

#### Tarefa 3.1.1: Dividir Migration 12 em Múltiplas
- **Descrição**: Quebrar migration complexa em partes menores
- **Prazo**: 3 dias
- **Responsável**: DBA
- **Critérios de Conclusão**:
  - [ ] Migration 12a: Migrar clients → workspaces
  - [ ] Migration 12b: Atualizar workspace_id em profiles
  - [ ] Migration 12c: Criar workspace_members iniciais
  - [ ] Testar cada migration separadamente
- **Artefatos**: Novas migrations e scripts de teste

```sql
-- Migration 12a: Migrar clients → workspaces
-- ======================================
INSERT INTO public.workspaces (id, name, slug, created_at, updated_at)
SELECT 
  c.id,
  c.name,
  LOWER(REGEXP_REPLACE(TRIM(c.name), '[^a-z0-9]+', '-', 'g')),
  c.created_at,
  c.updated_at
FROM public.clients c
WHERE NOT EXISTS (SELECT 1 FROM public.workspaces w WHERE w.id = c.id);

-- Migration 12b: Atualizar workspace_id em profiles
-- ================================================
UPDATE public.profiles
SET workspace_id = client_id
WHERE client_id IS NOT NULL 
  AND workspace_id IS NULL
  AND EXISTS (SELECT 1 FROM public.workspaces WHERE id = client_id);

-- Migration 12c: Criar workspace_members para owners
-- ================================================
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
  );
```

#### Tarefa 3.1.2: Simplificar RLS Policies
- **Descrição**: Simplificar políticas RLS complexas
- **Prazo**: 3 dias
- **Responsável**: DBA
- **Critérios de Conclusão**:
  - [ ] Template de política criado
  - [ ] Policies aplicadas em todas as tabelas
  - [ ] Testar permissões de acesso
- **Artefatos**: Templates de políticas e testes

```sql
-- Template de política reutilizável
CREATE POLICY TEMPLATE "workspace_policy_template"
ON public.workspaces
FOR SELECT
TO authenticated
USING (
  public.is_platform_admin(auth.uid())
  OR workspace_id = public.get_user_workspace_id(auth.uid())
);

-- Aplicar template em todas as tabelas
-- Para profiles
CREATE POLICY "Workspace users can view profiles"
ON public.profiles
FOR SELECT
TO authenticated
USING (
  public.is_platform_admin(auth.uid())
  OR 
  id = auth.uid()
  OR
  (
    workspace_id IS NOT NULL
    AND workspace_id = public.get_user_workspace_id(auth.uid())
  )
);

-- Para contracts
CREATE POLICY "Multi-tenant: SELECT contracts"
ON public.contracts
FOR SELECT
TO authenticated
USING (
  workspace_id = public.get_user_workspace_id(auth.uid())
  OR public.is_platform_admin(auth.uid())
);
```

### 3.2. Eliminar client_id e Adotar workspace_id

#### Tarefa 3.2.1: Remover client_id de Todas as Tabelas
- **Descrição**: Eliminar completamente client_id do banco
- **Prazo**: 2 dias
- **Responsável**: DBA
- **Critérios de Conclusão**:
  - [ ] client_id removido de profiles
  - [ ] client_id removido de contracts
  - [ ] client_id removido de digital_profiles
  - [ ] Tabela clients removida
- **Artefatos**: Script de limpeza e validação

```sql
-- Migration: ELIMINAR_CLIENT_ID.sql
-- ======================================

-- ETAPA 1: Remover client_id de profiles
ALTER TABLE public.profiles DROP COLUMN IF EXISTS client_id;
ALTER TABLE public.profiles DROP COLUMN IF EXISTS client_user_role;

-- ETAPA 2: Remover client_id de contracts
ALTER TABLE public.contracts DROP COLUMN IF EXISTS client_id;

-- ETAPA 3: Remover client_id de digital_profiles
ALTER TABLE public.digital_profiles DROP COLUMN IF EXISTS client_id;

-- ETAPA 4: Remover tabela clients (se não existir mais referências)
DROP TABLE IF EXISTS public.clients CASCADE;

-- ETAPA 5: Remover tabela teams (substituída por workspace_teams)
DROP TABLE IF EXISTS public.teams CASCADE;

-- ETAPA 6: Remover funções obsoletas
DROP FUNCTION IF EXISTS public.get_user_client_id(UUID);
DROP FUNCTION IF EXISTS public.is_client_admin(UUID);
DROP FUNCTION IF EXISTS public.is_client_manager(UUID);

-- ETAPA 7: Remover policies antigas
DROP POLICY IF EXISTS "Multi-tenant: SELECT profiles" ON public.profiles;
DROP POLICY IF EXISTS "Multi-tenant: INSERT profiles" ON public.profiles;
DROP POLICY IF EXISTS "Multi-tenant: UPDATE profiles" ON public.profiles;
DROP POLICY IF EXISTS "Multi-tenant: DELETE profiles" ON public.profiles;

-- ETAPA 8: Remover índices obsoletos
DROP INDEX IF EXISTS idx_profiles_client_id;
DROP INDEX IF EXISTS idx_contracts_client_id;
DROP INDEX IF EXISTS idx_digital_profiles_client_id;
DROP INDEX IF EXISTS idx_teams_client_id;
```

#### Tarefa 3.2.2: Atualizar Frontend para workspace_id
- **Descrição**: Atualizar código frontend para usar workspace_id
- **Prazo**: 3 dias
- **Responsável**: Frontend Developer
- **Critérios de Conclusão**:
  - [ ] Contextos atualizados
  - [ ] Queries atualizadas
  - [ ] Tipos TypeScript atualizados
  - [ ] Testes funcionais
- **Artefatos**: Código atualizado e testes

```typescript
// Atualizar AuthContext.tsx
const AuthProvider = ({ children }: { children: ReactNode }) => {
  // ... código existente ...
  
  const signIn = async (email: string, password: string) => {
    try {
      // 1. Autenticar
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) throw authError;
      if (!authData.user) throw new Error("Usuário não encontrado após login.");

      // 2. Verificar papel do usuário
      const { data: isAdmin, error: rpcError } = await supabase.rpc('is_platform_admin', {
        _user_id: authData.user.id
      });

      if (rpcError) {
        console.error("Erro ao verificar papel do usuário:", rpcError);
        throw new Error("Erro ao verificar permissões do usuário.");
      }

      // 3. Redirecionar condicionalmente baseado no papel
      toast.success("Login realizado com sucesso!");
      
      if (isAdmin) {
        // Admin da Plataforma
        navigate("/dashboard");
      } else {
        // Usuário de Workspace
        navigate("/app/dashboard");
      }
    } catch (error: any) {
      toast.error(error.message || "Erro ao fazer login");
      throw error;
    }
  };
  
  // ... resto do código ...
};
```

---

## 🧪 Fase 4: Testes e Qualidade (Semana 7-8)

### 4.1. Implementar Testes Unitários

#### Tarefa 4.1.1: Testes para Funções de Workspace
- **Descrição**: Criar testes unitários para funções de workspace
- **Prazo**: 3 dias
- **Responsável**: QA Developer
- **Critérios de Conclusão**:
  - [ ] Testes para get_user_workspace_id
  - [ ] Testes para funções SECURITY DEFINER
  - [ ] Testes de permissões
  - [ ] 90%+ cobertura
- **Artefatos**: Testes unitários e relatório de cobertura

```typescript
// Testes unitários para funções de workspace
describe('Workspace Functions', () => {
  const mockUserId = 'test-user-id';
  const mockWorkspaceId = 'test-workspace-id';

  beforeEach(() => {
    // Mock das funções do Supabase
    vi.mocked(supabase.from).mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: { workspace_id: mockWorkspaceId }
          })
        })
      })
    } as any);
  });

  test('get_user_workspace_id should return correct workspace', async () => {
    const result = await get_user_workspace_id(mockUserId);
    expect(result).toBe(mockWorkspaceId);
  });

  test('get_user_workspace_id should throw error for user without workspace', async () => {
    vi.mocked(supabase.from).mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: null
          })
        })
      })
    } as any);

    await expect(get_user_workspace_id(mockUserId)).rejects.toThrow('User has no workspace');
  });

  test('is_platform_admin should return true for admin user', async () => {
    vi.mocked(supabase.rpc).mockResolvedValue({
      data: true,
      error: null
    });

    const result = await is_platform_admin(mockUserId);
    expect(result).toBe(true);
  });
});
```

#### Tarefa 4.1.2: Testes para Sistema de Cache
- **Descrição**: Testar sistema de cache de workspaces
- **Prazo**: 2 dias
- **Responsável**: QA Developer
- **Critérios de Conclusão**:
  - [ ] Testes de cache hit/miss
  - [ ] Testes de cache expiration
  - [ ] Testes de cache invalidation
  - [ ] Testes de performance
- **Artefatos**: Testes de cache e relatório de performance

```typescript
// Testes para sistema de cache
describe('Workspace Cache', () => {
  let workspaceCache: WorkspaceCache;

  beforeEach(() => {
    workspaceCache = new WorkspaceCache();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  test('should cache workspace data', async () => {
    const mockWorkspace = { id: 'test-id', name: 'Test Workspace' };
    
    vi.mocked(supabase.from).mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: mockWorkspace
          })
        })
      })
    } as any);

    const firstCall = await workspaceCache.getWorkspace('test-id');
    const secondCall = await workspaceCache.getWorkspace('test-id');

    expect(firstCall).toEqual(mockWorkspace);
    expect(secondCall).toEqual(mockWorkspace);
    
    // Verificar se a segunda chamada não fez requisição ao banco
    expect(supabase.from).toHaveBeenCalledTimes(1);
  });

  test('should expire cache after TTL', async () => {
    const mockWorkspace = { id: 'test-id', name: 'Test Workspace' };
    
    vi.mocked(supabase.from).mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: mockWorkspace
          })
        })
      })
    } as any);

    await workspaceCache.getWorkspace('test-id');
    
    // Avançar tempo além do TTL
    vi.advanceTimersByTime(6 * 60 * 1000); // 6 minutos
    
    const secondCall = await workspaceCache.getWorkspace('test-id');
    
    // Segunda chamada deve refazer a requisição
    expect(supabase.from).toHaveBeenCalledTimes(2);
  });
});
```

### 4.2. Testes de Integração

#### Tarefa 4.2.1: Testes de Fluxo Completo de Workspace
- **Descrição**: Testar fluxo completo de criação e gerenciamento de workspace
- **Prazo**: 3 dias
- **Responsável**: QA Developer
- **Critérios de Conclusão**:
  - [ ] Teste de criação de workspace
  - [ ] Teste de adição de membros
  - [ ] Teste de permissões
  - [ ] Teste de exclusão
- **Artefatos**: Testes de integração e relatório

```typescript
// Testes de integração para workspace
describe('Workspace Integration Tests', () => {
  let testWorkspaceId: string;
  let testUserId: string;

  beforeAll(async () => {
    // Criar usuário de teste
    const { data: authData } = await supabase.auth.signUp({
      email: 'test@example.com',
      password: 'test123'
    });
    testUserId = authData.user?.id || '';

    // Criar workspace de teste
    const { data: workspaceData } = await supabase
      .from('workspaces')
      .insert({ name: 'Test Workspace' })
      .select()
      .single();
    testWorkspaceId = workspaceData.id;

    // Adicionar usuário como owner
    await supabase
      .from('workspace_members')
      .insert({
        workspace_id: testWorkspaceId,
        profile_id: testUserId,
        role: 'owner'
      });
  });

  afterAll(async () => {
    // Limpar dados de teste
    await supabase
      .from('workspace_members')
      .delete()
      .eq('workspace_id', testWorkspaceId);
    
    await supabase
      .from('workspaces')
      .delete()
      .eq('id', testWorkspaceId);
  });

  test('should create workspace and add owner as member', async () => {
    // Verificar workspace criado
    const { data: workspace } = await supabase
      .from('workspaces')
      .select('*')
      .eq('id', testWorkspaceId)
      .single();
    
    expect(workspace).toBeDefined();
    expect(workspace.name).toBe('Test Workspace');

    // Verificar owner adicionado
    const { data: members } = await supabase
      .from('workspace_members')
      .select('*')
      .eq('workspace_id', testWorkspaceId);
    
    expect(members).toHaveLength(1);
    expect(members[0].role).toBe('owner');
  });

  test('should enforce workspace isolation', async () => {
    // Criar outro workspace
    const { data: otherWorkspace } = await supabase
      .from('workspaces')
      .insert({ name: 'Other Workspace' })
      .select()
      .single();

    // Tentar acessar workspace como membro (deve falhar)
    const { data: members, error } = await supabase
      .from('workspace_members')
      .select('*')
      .eq('workspace_id', otherWorkspace.id);

    expect(error).toBeNull(); // Não deve dar erro de RLS
    expect(members).toHaveLength(0); // Não deve retornar membros
  });
});
```

---

## 📚 Fase 5: Documentação (Semana 9-10)

### 5.1. Documentação Técnica

#### Tarefa 5.1.1: Documentação de Arquitetura
- **Descrição**: Criar documentação técnica completa
- **Prazo**: 2 dias
- **Responsável**: Tech Writer
- **Critérios de Conclusão**:
  - [ ] Documentação de arquitetura multi-tenant
  - [ ] Documentação de segurança RLS
  - [ ] Documentação de performance
  - [ ] Diagramas de arquitetura
- **Artefatos**: Documentação técnica completa

```markdown
# Documentação de Arquitetura - SmartHubDash

## Sistema Multi-tenant

### Visão Geral
O SmartHubDash implementa um modelo multi-tenant baseado em workspaces, onde cada workspace representa um espaço de trabalho isolado com seus próprios dados, usuários e configurações.

### Estrutura de Workspaces
```
workspaces (1:N)
├── workspace_members (N:M com profiles)
├── contracts (1:N)
├── digital_profiles (1:N)
└── workspace_teams (1:N)
```

### Segurança RLS
- Row Level Security garante isolamento entre workspaces
- Funções SECURITY DEFINER para verificações complexas
- Políticas baseadas em roles (owner, manager, user)

### Performance
- Índices otimizados para queries comuns
- Cache estratégico para dados frequentemente acessados
- Queries otimizadas com JOINs eficientes
```

#### Tarefa 5.1.2: Guia de Desenvolvimento
- **Descrição**: Criar guia de contribuição para desenvolvedores
- **Prazo**: 2 dias
- **Responsável**: Tech Lead
- **Critérios de Conclusão**:
  - [ ] Guia de criação de migrations
  - [ ] Guia de escrita de RLS policies
  - ] Guia de testes
  - [ ] Padrões de código
- **Artefatos**: Guia de desenvolvimento completo

```markdown
# Guia de Desenvolvimento - SmartHubDash

## Criando Novas Migrations

### Princípios
1. **Sempre criar backup** antes de aplicar migrations
2. **Testar em staging** primeiro
3. **Usar nomes descritivos** e comentários
4. **Incluir script de rollback**

### Template de Migration
```sql
-- Migration: DESCRICAO_DA_MIGRATION
-- =================================
-- Data: [data]
-- Descrição: [descrição detalhada]

-- ETAPA 1: [descrição da etapa]
-- Comando SQL

-- ETAPA 2: [descrição da etapa]
-- Comando SQL

-- Script de rollback
-- ROLLBACK: [descrição do rollback]
```

### Escrevendo RLS Policies

### Template de Política
```sql
CREATE POLICY "Policy Name"
ON public.table_name
FOR SELECT
TO authenticated
USING (
  public.is_platform_admin(auth.uid())
  OR condition_specific
);

-- Política de INSERT
CREATE POLICY "Policy Name"
ON public.table_name
FOR INSERT
TO authenticated
WITH CHECK (
  condition_validation
);
```

### Melhores Práticas
1. **Sempre incluir** exceção para platform admins
2. **Usar funções SECURITY DEFINER** para verificações complexas
3. **Testar com múltiplos roles** de usuário
4. **Documentar o propósito** da política
```

### 5.2. Documentação de APIs

#### Tarefa 5.2.1: Documentar APIs Internas
- **Descrição**: Documentar todas as APIs internas do sistema
- **Prazo**: 3 dias
- **Responsável**: Backend Developer
- **Critérios de Conclusão**:
  - [ ] Documentação de APIs de workspace
  - [ ] Documentação de APIs de autenticação
  - [ ] Documentação de APIs de permissões
  - [ ] Exemplos de uso
- **Artefatos**: Documentação de APIs completa

```typescript
/**
 * @function get_user_workspace_id
 * @description Retorna o workspace_id do usuário autenticado
 * @param {string} userId - ID do perfil do usuário
 * @returns {Promise<string>} ID do workspace
 * @throws {Error} Se o usuário não tiver workspace
 * 
 * @example
 * const workspaceId = await get_user_workspace_id('user-id');
 * console.log('User workspace:', workspaceId);
 */
export const get_user_workspace_id = async (userId: string): Promise<string> => {
  const { data, error } = await supabase
    .from('profiles')
    .select('workspace_id')
    .eq('id', userId)
    .single();
  
  if (error || !data?.workspace_id) {
    throw new Error('User has no workspace');
  }
  
  return data.workspace_id;
};

/**
 * @function create_workspace
 * @description Cria um novo workspace
 * @param {Object} workspaceData - Dados do workspace
 * @param {string} workspaceData.name - Nome do workspace
 * @param {string} workspaceData.slug - Slug do workspace
 * @returns {Promise<Workspace>} Workspace criado
 * 
 * @example
 * const workspace = await create_workspace({
 *   name: 'My Workspace',
 *   slug: 'my-workspace'
 * });
 */
export const create_workspace = async (workspaceData: {
  name: string;
  slug: string;
}): Promise<Workspace> => {
  const { data, error } = await supabase
    .from('workspaces')
    .insert(workspaceData)
    .select()
    .single();
  
  if (error) {
    throw new Error(`Failed to create workspace: ${error.message}`);
  }
  
  return data;
};
```

---

## 📊 Métricas de Sucesso

### Fase 1: Segurança e Estabilidade
- [ ] 0% de erros críticos em produção
- [ ] 100% das migrations críticas validadas
- [ ] Sistema de monitoramento ativo

### Fase 2: Performance e Otimização
- [ ] 50% redução em tempo de carregamento
- [ ] 99.9% uptime do sistema
- [ ] Cache hit rate > 80%

### Fase 3: Refatoração de Código
- [ ] 70% redução em complexidade de código
- [ ] 100% das migrations refatoradas
- [ ] client_id completamente removido

### Fase 4: Testes e Qualidade
- [ ] 90%+ cobertura de testes
- [ ] 0% de falhas em testes de integração
- [ ] Performance otimizada para todas as queries

### Fase 5: Documentação
- [ ] 100% da documentação atualizada
- [ ] Guia de desenvolvimento completo
- [ ] Documentação de APIs 100% coberta

---

## 📞 Contato de Emergência

- **DBA**: [contato]
- **Dev Lead**: [contato]
- **QA Lead**: [contato]
- **Tech Lead**: [contato]

---

**Última Atualização**: 06 de novembro de 2025
**Próxima Revisão**: 20 de novembro de 2025