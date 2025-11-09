# 📋 PLANO DE EXECUÇÃO - FASE 2

## 🎯 Objetivo da Fase 2

Migrar TODA a aplicação para usar **workspace_id** ao invés de **client_id**.

- ✅ Estrutura nova já existe (criada na Fase 1)
- 🎯 Agora: Fazer a aplicação **usar** a estrutura nova
- ⏳ Fase 3: Remover estrutura antiga (DROP clients/teams)

---

## 📊 ANÁLISE DE IMPACTO

### 🗄️ **BACKEND (Supabase)**

#### **Tabelas afetadas:**
- `profiles` → tem `client_id` e `workspace_id`
- `contracts` → tem `client_id` e `workspace_id`
- `digital_profiles` → tem `client_id` e `workspace_id`
- `teams` → tem `client_id` (será substituída por `workspace_teams`)

#### **Funções RLS afetadas:**
```sql
-- Função atual (usa client_id)
get_user_client_id(_user_id UUID) → Retorna client_id

-- Função nova (usa workspace_id) ✅ JÁ CRIADA
get_user_workspace_id(_user_id UUID) → Retorna workspace_id
get_current_user_workspace_id() → Retorna workspace_id do auth.uid()
```

#### **Políticas RLS afetadas:**
Encontradas **20+ policies** usando `get_user_client_id()`:

**Tabela `profiles`:**
- Multi-tenant: SELECT profiles
- Allow users to read profiles in their own tenant
- Client admins can update profiles
- Client admins can insert profiles

**Tabela `contracts`:**
- Multi-tenant: SELECT contracts
- Multi-tenant: INSERT contracts
- Multi-tenant: UPDATE contracts
- Multi-tenant: DELETE contracts

**Tabela `digital_profiles`:**
- Multi-tenant: SELECT digital_profiles
- Multi-tenant: INSERT digital_profiles
- Multi-tenant: UPDATE digital_profiles
- Multi-tenant: DELETE digital_profiles
- Client admins can manage digital profiles

**Tabela `teams`:**
- Multi-tenant: SELECT teams
- Multi-tenant: INSERT teams
- Multi-tenant: UPDATE teams
- Multi-tenant: DELETE teams

---

### 💻 **FRONTEND (React/TypeScript)**

#### **Arquivos TypeScript afetados (20+ matches):**

**1. Hooks/Queries:**
- ❌ `src/pages/client/Equipe.tsx` → Busca `client_id` do usuário para filtrar equipe
- ❌ `src/components/teams/AddUserDialog.tsx` → Busca `client_id` para listar equipes
- ❌ `src/components/teams/AddTeamDialog.tsx` → Usa `client_id` para criar equipe
- ❌ `src/components/profiles/CreateProfileModal.tsx` → Usa `client_id` para criar perfil

**2. Pages:**
- ❌ `src/pages/ClientUsers.tsx` → Interface e queries usam `client_id`

**3. Integrações:**
- ❌ `src/integrations/supabase/types.ts` → Types gerados do Supabase (20+ referências)

**4. Edge Functions:**
- ❌ `supabase/functions/create-client-user/index.ts` → Atualiza `client_id` ao criar usuário

---

## 🚀 PLANO DE AÇÃO - FASE 2

### **ETAPA 2.1 - Atualizar RLS Policies (Backend)**

#### **Migration: `20251104000020_update_rls_policies_to_workspace.sql`**

**O que faz:**
1. Atualizar TODAS as policies que usam `get_user_client_id()` para usar `get_user_workspace_id()`
2. Substituir comparações de `client_id` por `workspace_id`
3. Manter fallback para platform_admin

**Estratégia:**
```sql
-- ANTES (Fase 1)
CREATE POLICY "Multi-tenant: SELECT profiles"
ON profiles FOR SELECT TO authenticated
USING (
  client_id = public.get_user_client_id(auth.uid())
  OR public.is_platform_admin(auth.uid())
);

-- DEPOIS (Fase 2)
CREATE POLICY "Multi-tenant: SELECT profiles"
ON profiles FOR SELECT TO authenticated
USING (
  workspace_id = public.get_user_workspace_id(auth.uid())
  OR public.is_platform_admin(auth.uid())
);
```

**Tabelas a atualizar:**
- ✅ `profiles` (4 policies)
- ✅ `contracts` (4 policies)
- ✅ `digital_profiles` (5 policies)
- ✅ `teams` → **NÃO MEXER** (será dropada na Fase 3)
- ✅ `workspace_teams` → **JÁ ESTÁ CORRETO** (criado na Fase 1)

**Arquivo:**
- `supabase/migrations/20251104000020_update_rls_policies_to_workspace.sql`

---

### **ETAPA 2.2 - Refatorar Frontend (React)**

#### **Sub-etapa 2.2.1 - Atualizar Types**

**Arquivo:** `src/integrations/supabase/types.ts`

**Ação:** Regenerar types do Supabase após executar migration 20
```bash
npm run gen:types
```

**Resultado esperado:**
- Types de `profiles`, `contracts`, `digital_profiles` refletem `workspace_id` como obrigatório
- Types de `workspace_teams` aparecem corretamente

---

#### **Sub-etapa 2.2.2 - Atualizar Hooks de Equipe**

**1. Arquivo:** `src/pages/client/Equipe.tsx`

**Mudanças:**
```typescript
// ❌ ANTES
async function fetchUserProfile(userId: string) {
  const { data, error } = await supabase
    .from("profiles")
    .select("client_id")
    .eq("id", userId)
    .maybeSingle();
  
  return data?.client_id || null;
}

// ✅ DEPOIS
async function fetchUserProfile(userId: string) {
  const { data, error } = await supabase
    .from("profiles")
    .select("workspace_id")
    .eq("id", userId)
    .maybeSingle();
  
  return data?.workspace_id || null;
}

// Atualizar query key também
queryKey: ["user-profile-workspace-id", userId],
```

**2. Arquivo:** `src/components/teams/AddUserDialog.tsx`

**Mudanças:**
```typescript
// ❌ ANTES
const [clientId, setClientId] = useState<string | null>(null);

const { data } = await supabase
  .from("profiles")
  .select("client_id")
  .eq("id", user.id)
  .single();

setClientId(data?.client_id || null);

// ✅ DEPOIS
const [workspaceId, setWorkspaceId] = useState<string | null>(null);

const { data } = await supabase
  .from("profiles")
  .select("workspace_id")
  .eq("id", user.id)
  .single();

setWorkspaceId(data?.workspace_id || null);

// Atualizar query de teams
queryKey: ["workspace-teams", workspaceId],
.from("workspace_teams")
.eq("workspace_id", workspaceId)
```

**3. Arquivo:** `src/components/teams/AddTeamDialog.tsx`

**Mudanças:**
```typescript
// ❌ ANTES
.eq("client_id", clientId)
.insert({ client_id: clientId, name, description })

// ✅ DEPOIS
.eq("workspace_id", workspaceId)
.insert({ workspace_id: workspaceId, name, description })
```

**4. Arquivo:** `src/components/profiles/CreateProfileModal.tsx`

**Mudanças:**
```typescript
// ❌ ANTES
.eq("client_id", clientId)
.insert({ client_id: clientId, ... })

// ✅ DEPOIS
.eq("workspace_id", workspaceId)
.insert({ workspace_id: workspaceId, ... })
```

---

#### **Sub-etapa 2.2.3 - Atualizar ClientUsers Page**

**Arquivo:** `src/pages/ClientUsers.tsx`

**Mudanças:**
```typescript
// ❌ ANTES
interface UserWithClient {
  client_id: string;
  // ...
}

.select("client_id")
.not('client_id', 'is', null)
client_id: user.client_id

// ✅ DEPOIS
interface UserWithWorkspace {
  workspace_id: string;
  // ...
}

.select("workspace_id")
.not('workspace_id', 'is', null)
workspace_id: user.workspace_id
```

---

#### **Sub-etapa 2.2.4 - Atualizar Edge Function**

**Arquivo:** `supabase/functions/create-client-user/index.ts`

**Mudanças:**
```typescript
// ❌ ANTES
const { error: profileError } = await supabaseAdmin
  .from('profiles')
  .update({
    client_id: client_id,
    client_user_role: client_user_role
  })
  .eq('id', userId)

// ✅ DEPOIS
const { error: profileError } = await supabaseAdmin
  .from('profiles')
  .update({
    workspace_id: workspace_id, // Renomear parâmetro também
    client_user_role: client_user_role
  })
  .eq('id', userId)
```

---

## 📝 CHECKLIST DE EXECUÇÃO - FASE 2

### **Backend (Supabase)**
- [ ] Criar migration `20251104000020_update_rls_policies_to_workspace.sql`
- [ ] Testar migration localmente (se possível)
- [ ] Executar migration no Supabase Dashboard
- [ ] Validar que policies foram atualizadas corretamente

### **Frontend (React)**
- [ ] Regenerar types: `npm run gen:types`
- [ ] Atualizar `src/pages/client/Equipe.tsx`
- [ ] Atualizar `src/components/teams/AddUserDialog.tsx`
- [ ] Atualizar `src/components/teams/AddTeamDialog.tsx`
- [ ] Atualizar `src/components/profiles/CreateProfileModal.tsx`
- [ ] Atualizar `src/pages/ClientUsers.tsx`
- [ ] Atualizar `supabase/functions/create-client-user/index.ts`
- [ ] Testar funcionalidades no navegador:
  - [ ] Listar equipe (página /app/equipe)
  - [ ] Adicionar usuário à equipe
  - [ ] Criar nova equipe
  - [ ] Criar novo perfil
  - [ ] Listar usuários do cliente

---

## ⚠️ PONTOS DE ATENÇÃO

### **1. Coexistência Temporária**
Durante a Fase 2, as colunas `client_id` e `workspace_id` **ainda coexistem**.
- Se algo der errado, podemos reverter as policies para usar `client_id` novamente
- Dados não são perdidos

### **2. Platform Admins**
Todas as policies devem manter:
```sql
OR public.is_platform_admin(auth.uid())
```
Platform admins devem continuar vendo TUDO.

### **3. Função get_user_client_id()**
**NÃO DELETAR na Fase 2!**
- Ela pode estar sendo usada por outras partes do sistema
- Será removida apenas na Fase 3

### **4. Tabela `teams`**
**NÃO atualizar policies de `teams`!**
- Ela será dropada na Fase 3
- Foco apenas em `workspace_teams`

### **5. Testing**
Após cada mudança de policy:
```sql
-- Testar como usuário normal
SELECT * FROM profiles; -- Deve ver apenas do próprio workspace

-- Testar como platform_admin
SELECT * FROM profiles; -- Deve ver TUDO
```

---

## 🎯 RESULTADO ESPERADO DA FASE 2

### **Backend:**
✅ Todas as policies usam `workspace_id` e `get_user_workspace_id()`
✅ Multi-tenancy funcionando com workspaces
✅ Platform admins com acesso total mantido

### **Frontend:**
✅ Todas as queries usam `workspace_id`
✅ Componentes de equipe funcionando com `workspace_teams`
✅ Criação de usuários vinculando a `workspace_id`
✅ Nenhum erro no console
✅ Nenhum crash de página

### **Segurança:**
✅ RLS garantindo isolamento por workspace
✅ Usuários só veem dados do próprio workspace
✅ Platform admins mantêm acesso total

---

## 📞 PRÓXIMOS PASSOS

Após concluir a Fase 2 com sucesso:

1. **Testar extensivamente** todas as funcionalidades
2. **Validar** que não há regressões
3. **Aguardar aprovação** para Fase 3
4. **Fase 3:** Remover estrutura antiga (DROP `clients`, `teams`, colunas `client_id`, `team_id`)

---

## 🚨 ROLLBACK (Se necessário)

Se algo der errado na Fase 2:

1. **Reverter policies para client_id:**
```sql
-- Re-executar versão antiga das policies
-- Substituir workspace_id por client_id
-- Substituir get_user_workspace_id por get_user_client_id
```

2. **Reverter código frontend:**
```bash
git revert <commit-hash>
git push
```

**IMPORTANTE:** Nenhum dado é perdido, apenas as referências mudam!

---

## ✅ PRONTO PARA COMEÇAR?

Responda com:
- **"Criar migration RLS"** → Criar migration 20 com policies atualizadas
- **"Refatorar frontend agora"** → Começar atualizando os arquivos React
- **"Ver migration sample"** → Ver exemplo de como ficará uma policy atualizada
