# 🎯 Plano de Correção: Eliminação de client_id e Adoção Exclusiva de workspace_id

## 📋 Resumo Executivo

Este plano detalha a estratégia para **eliminar completamente o client_id** e **migrar para workspace_id** como única estrutura de multi-tenant no SmartHubDash. A coexistência atual está causando complexidade, inconsistências e problemas de performance.

## 🚨 Problemas Atuais com Coexistência

### 1. **Complexidade de Código**
- Funções duplicadas: `get_user_client_id()` vs `get_user_workspace_id()`
- Policies RLS com condições complexas verificando ambos os campos
- Queries JOINs precisam verificar client_id OU workspace_id

### 2. **Inconsistências de Dados**
- Registros podem ter client_id mas não workspace_id (vice-versa)
- Permissões podem funcionar de forma imprevisível
- Dados "órfãos" quando um campo é preenchido e o outro não

### 3. **Performance**
- Índices duplicados em ambas as colunas
- Queries mais complexas devido a verificações OR
- Overhead de manutenção de duas estruturas

### 4. **Segurança**
- RLS policies podem ter brechas quando client_id ≠ workspace_id
- Funções SECURITY DEFINER precisam lidar com ambos os casos

## 🎯 Objetivos da Correção

### ✅ Objetivos Primários
1. **Eliminar client_id** de todas as tabelas
2. **Padronizar workspace_id** como único campo de multi-tenant
3. **Simplificar RLS policies** para usar apenas workspace_id
4. **Remover funções obsoletas** (`get_user_client_id`)

### ✅ Objetivos Secundários
1. **Melhorar performance** com índices otimizados
2. **Reduzir complexidade** do código
3. **Facilitar manutenção** futura
4. **Garantir consistência** dos dados

## 🛠️ Plano de Ação Detalhado

### Fase 1: Preparação e Backup (Prioridade: CRÍTICA)

#### 1.1. Backup Completo
```bash
# Exportar dump completo do banco
supabase db dump --db-url $SUPABASE_URL --db-schema public > backup_pre_migration.sql

# Exportar dados específicos
psql $SUPABASE_URL -c "COPY (SELECT * FROM workspaces) TO 'workspaces_backup.csv' WITH CSV HEADER;"
psql $SUPABASE_URL -c "COPY (SELECT * FROM profiles) TO 'profiles_backup.csv' WITH CSV HEADER;"
```

#### 1.2. Validação de Dados
```sql
-- Verificar consistência entre client_id e workspace_id
SELECT 
  'profiles' as table_name,
  COUNT(*) as total_records,
  COUNT(CASE WHEN client_id IS NOT NULL AND workspace_id IS NOT NULL THEN 1 END) as both_filled,
  COUNT(CASE WHEN client_id IS NOT NULL AND workspace_id IS NULL THEN 1 END) as client_only,
  COUNT(CASE WHEN client_id IS NULL AND workspace_id IS NOT NULL THEN 1 END) as workspace_only,
  COUNT(CASE WHEN client_id IS NULL AND workspace_id IS NULL THEN 1 END) as neither_filled
FROM profiles

UNION ALL

SELECT 
  'contracts' as table_name,
  COUNT(*) as total_records,
  COUNT(CASE WHEN client_id IS NOT NULL AND workspace_id IS NOT NULL THEN 1 END) as both_filled,
  COUNT(CASE WHEN client_id IS NOT NULL AND workspace_id IS NULL THEN 1 END) as client_only,
  COUNT(CASE WHEN client_id IS NULL AND workspace_id IS NOT NULL THEN 1 END) as workspace_only,
  COUNT(CASE WHEN client_id IS NULL AND workspace_id IS NULL THEN 1 END) as neither_filled
FROM contracts;
```

### Fase 2: Migração de Dados (Prioridade: ALTA)

#### 2.1. Garantir que workspace_id está preenchido onde client_id existe
```sql
-- Para profiles: garantir workspace_id está preenchido
UPDATE profiles 
SET workspace_id = client_id 
WHERE client_id IS NOT NULL 
  AND workspace_id IS NULL
  AND EXISTS (SELECT 1 FROM workspaces WHERE id = client_id);

-- Para contracts: garantir workspace_id está preenchido
UPDATE contracts 
SET workspace_id = client_id 
WHERE client_id IS NOT NULL 
  AND workspace_id IS NULL
  AND EXISTS (SELECT 1 FROM workspaces WHERE id = client_id);

-- Para digital_profiles: garantir workspace_id está preenchido
UPDATE digital_profiles 
SET workspace_id = client_id 
WHERE client_id IS NOT NULL 
  AND workspace_id IS NULL
  AND EXISTS (SELECT 1 FROM workspaces WHERE id = client_id);
```

#### 2.2. Criar Migration de Limpeza
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

### Fase 3: Atualização de RLS Policies (Prioridade: ALTA)

#### 3.1. Simplificar Policies de Profiles
```sql
-- Migration: SIMPLIFY_PROFILES_RLS.sql
-- ======================================

-- Remover policies complexas
DROP POLICY IF EXISTS "Users can view profiles in their tenant" ON public.profiles;
DROP POLICY IF EXISTS "Platform admins can insert profiles" ON public.profiles;
DROP POLICY IF EXISTS "Workspace admins and managers can insert team members" ON public.profiles;

-- Criar policies simplificadas
CREATE POLICY "Users can view profiles"
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

CREATE POLICY "Platform admins can insert profiles"
ON public.profiles
FOR INSERT
TO authenticated
WITH CHECK (
  public.is_platform_admin(auth.uid())
);

CREATE POLICY "Workspace admins can insert team members"
ON public.profiles
FOR INSERT
TO authenticated
WITH CHECK (
  workspace_id = public.get_user_workspace_id(auth.uid())
  AND public.get_user_workspace_id(auth.uid()) IS NOT NULL
  AND EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = auth.uid() 
      AND p.workspace_id = workspace_id
      AND p.role IN ('owner', 'manager')
  )
);

-- Similar para UPDATE e DELETE policies...
```

#### 3.2. Atualizar Policies de Contracts
```sql
-- Migration: SIMPLIFY_CONTRACTS_RLS.sql
-- ======================================

DROP POLICY IF EXISTS "Multi-tenant: SELECT contracts" ON public.contracts;
DROP POLICY IF EXISTS "Multi-tenant: INSERT contracts" ON public.contracts;
DROP POLICY IF EXISTS "Multi-tenant: UPDATE contracts" ON public.contracts;
DROP POLICY IF EXISTS "Multi-tenant: DELETE contracts" ON public.contracts;

CREATE POLICY "Multi-tenant: SELECT contracts"
ON public.contracts
FOR SELECT
TO authenticated
USING (
  workspace_id = public.get_user_workspace_id(auth.uid())
  OR public.is_platform_admin(auth.uid())
);

CREATE POLICY "Multi-tenant: INSERT contracts"
ON public.contracts
FOR INSERT
TO authenticated
WITH CHECK (
  workspace_id = public.get_user_workspace_id(auth.uid())
  AND public.get_user_workspace_id(auth.uid()) IS NOT NULL
);

-- Similar para UPDATE e DELETE...
```

### Fase 4: Atualização de Código Frontend (Prioridade: MÉDIA)

#### 4.1. Atualizar Contextos e Hooks
```typescript
// Remover de src/contexts/AuthContext.tsx
// Remover referências a client_id e client_user_role

// Atualizar funções de autenticação
const signIn = async (email: string, password: string) => {
  // ... código existente ...
  
  // Remover lógica complexa de client_id
  // Simplificar para workspace_id apenas
  const { data: workspaceMembership } = await supabase
    .from('workspace_members')
    .select('role')
    .eq('profile_id', authData.user.id)
    .in('role', ['owner', 'manager']);
};
```

#### 4.2. Atualizar Tipos TypeScript
```typescript
// Atualizar src/types/workspace.ts
export interface Workspace {
  id: string;
  name: string;
  slug: string;
  client_type: 'pessoa_juridica' | 'pessoa_fisica';
  document: string;
  // ... remover referências a client_id
}

// Remover tipos relacionados a clients
// export interface Client { ... }
```

#### 4.3. Atualizar Queries
```typescript
// Atualizar queries para usar workspace_id
const { data, error } = useQuery({
  queryKey: ['workspaces', workspaceId],
  queryFn: async () => {
    const { data } = await supabase
      .from('contracts')
      .select('*')
      .eq('workspace_id', workspaceId); // usar workspace_id
    return data;
  }
});
```

### Fase 5: Testes e Validação (Prioridade: ALTA)

#### 5.1. Testes Unitários
```typescript
// Testar funções de workspace
describe('Workspace Functions', () => {
  test('get_user_workspace_id should return correct workspace', async () => {
    // ... teste ...
  });
  
  test('workspace RLS policies should work correctly', async () => {
    // ... teste ...
  });
});
```

#### 5.2. Testes de Integração
```sql
-- Testar RLS policies
-- 1. Criar workspace com owner
-- 2. Tentar acessar como membro (deve falhar)
-- 3. Tentar acessar como platform admin (deve funcionar)
-- 4. Testar INSERT/UPDATE/DELETE permissions
```

#### 5.3. Testes de Performance
```bash
# Comparar performance antes/depois
EXPLAIN ANALYZE SELECT * FROM profiles WHERE workspace_id = 'uuid';
EXPLAIN ANALYZE SELECT * FROM contracts WHERE workspace_id = 'uuid';
```

## 📅 Cronograma Sugerido

### Semana 1: Preparação
- [ ] Backup completo do banco
- [ ] Validação de dados existentes
- [ ] Documentação atual do estado atual

### Semana 2: Migração de Dados
- [ ] Executar migração de dados (Fase 2)
- [ ] Validar integridade dos dados
- [ ] Testes básicos de funcionamento

### Semana 3: Atualização de RLS
- [ ] Aplicar migrations de RLS simplificadas
- [ ] Testar permissões de acesso
- [ ] Validar segurança do sistema

### Semana 4: Frontend
- [ ] Atualizar código frontend
- [ ] Testes UI/UX
- [ ] Correção de bugs

### Semana 5: Validação Final
- [ ] Testes completos
- [ ] Performance tuning
- [ ] Documentação final

## 🚨 Riscos e Mitigação

### Risco 1: Perda de Dados
- **Mitigação**: Backup completo antes de qualquer alteração
- **Contingência**: Script de rollback pronto

### Risco 2: Quebra de Funcionalidades
- **Mitigação**: Testes incrementais em ambiente de staging
- **Contingência**: Feature flags para rollback gradual

### Risco 3: Performance Degradation
- **Mitigação**: Monitoramento contínuo de performance
- **Contingência**: Otimização de índices e queries

## 🎯 Critérios de Sucesso

### ✅ Sucesso Técnico
1. **100% dos dados migrados** sem perda
2. **RLS policies funcionando** corretamente
3. **Performance igual ou melhor** que antes
4. **Zero quebras críticas** de funcionalidade

### ✅ Sucesso Operacional
1. **Redução de 70%** na complexidade do código
2. **Migração concluída** em 5 semanas
3. **Testes automatizados** cobrindo 90%+ do código
4. **Documentação atualizada** e consistente

## 📞 Contato de Emergência

- **DBA**: [contato]
- **Dev Lead**: [contato]
- **QA Lead**: [contato]
- **Ops Lead**: [contato]

---

**Última Atualização**: 06 de novembro de 2025
**Próxima Revisão**: Após execução da Fase 1