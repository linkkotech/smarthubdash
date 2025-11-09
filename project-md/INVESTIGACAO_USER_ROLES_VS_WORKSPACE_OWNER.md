# 📊 INVESTIGAÇÃO: Tabela user_roles e Workspace Owner

## 🎯 Conclusão: Workspace Owner NÃO Deve Entrar em user_roles

Após análise da estrutura das tabelas, concluímos que:

### ❌ Workspace Owner NÃO Deve estar em `user_roles`

**Motivos:**

1. **ENUM app_role é exclusivo para plataforma:**
   ```sql
   CREATE TYPE public.app_role AS ENUM ('super_admin', 'admin', 'manager');
   ```
   - `app_role` define apenas 3 roles de **plataforma**
   - Não inclui `workspace_owner`

2. **user_roles é para admins de plataforma:**
   ```sql
   CREATE TABLE public.user_roles (
     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
     user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
     role app_role NOT NULL,  -- ← Usa ENUM app_role (apenas plataforma)
     created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
     UNIQUE(user_id, role)
   );
   ```
   - Coluna `role` usa ENUM `app_role`
   - Apenas aceita: 'super_admin', 'admin', 'manager'
   - NÃO é para roles de workspace

3. **Workspace Owner já está em workspace_members:**
   ```sql
   -- Tabela workspace_members
   ├─ workspace_id (FK workspaces)
   ├─ profile_id (FK profiles)
   ├─ role: 'work_owner' (workspace_role ENUM)
   └─ joined_at
   ```
   - `workspace_members.role` define permissões no workspace
   - Usa ENUM `workspace_role` (work_owner, work_manager, work_user)

## 📋 Estrutura Correta de Roles

### 🏛️ Tabela: user_roles (PLATAFORMA)
```
user_roles
├─ user_id (FK profiles)
├─ role: app_role ENUM
│  ├─ super_admin → Controla toda a plataforma
│  ├─ admin → Administrador de plataforma
│  └─ manager → Gerenciador de plataforma
└─ created_at
```

### 🏢 Tabela: workspace_members (WORKSPACE)
```
workspace_members
├─ workspace_id (FK workspaces)
├─ profile_id (FK profiles)
├─ role: workspace_role ENUM
│  ├─ work_owner → Dono/admin do workspace
│  ├─ work_manager → Gerenciador do workspace
│  └─ work_user → Usuário regular do workspace
└─ joined_at
```

## 🔄 Fluxo de Permissões

```
User Autenticado
├─ user_roles (plataforma)
│  └─ role: 'admin' → Acesso admin da plataforma
│
└─ workspace_members (workspace)
   ├─ workspace_id: 'abc-123'
   └─ role: 'work_owner' → Dono deste workspace
```

## ❌ Problema Atual

Na Edge Function `create-workspace-admin`, estávamos inserindo:
```typescript
// ERRADO:
await supabaseAdmin
  .from("user_roles")
  .insert([
    {
      user_id: profileData.id,
      role: "workspace_owner"  // ❌ Não existe em app_role ENUM
    }
  ]);
```

Isso resultaria em:
```
ERROR: invalid input value for enum app_role: "workspace_owner"
```

## ✅ Solução Correta

### Opção 1: Não inserir em user_roles (RECOMENDADO)
```typescript
// ✅ CORRETO: Apenas inserir em workspace_members
await supabaseAdmin
  .from("workspace_members")
  .insert([
    {
      workspace_id: workspace_id,
      profile_id: profileData.id,
      role: "work_owner"
    }
  ]);

// Usuário é owner do workspace, mas NÃO admin de plataforma
```

### Opção 2: Se quiser que seja admin de plataforma também
```typescript
// ✅ Se workspace owner deve ser admin da plataforma:
await supabaseAdmin
  .from("user_roles")
  .insert([
    {
      user_id: profileData.id,
      role: "admin"  // Role de PLATAFORMA válida
    }
  ]);

await supabaseAdmin
  .from("workspace_members")
  .insert([
    {
      workspace_id: workspace_id,
      profile_id: profileData.id,
      role: "work_owner"
    }
  ]);
```

## 🎯 Recomendação Final

**NÃO inserir workspace_owner em user_roles**

Motivos:
- ✅ Mais simples (menos inserção no banco)
- ✅ Segurança: Workspace owner ≠ Admin de plataforma
- ✅ Separação de conceitos: workspace vs plataforma
- ✅ Sem violação de ENUM app_role

**Fluxo correto:**
1. Workspace Owner criado → APENAS em `workspace_members` com role='work_owner'
2. Se precisar ser admin de plataforma também → ENTÃO inserir em `user_roles` com role='admin'

## 📝 Ação Necessária

Remover a inserção em `user_roles` da Edge Function `create-workspace-admin`:

```typescript
// REMOVER ESTE BLOCO:
const { error: roleError } = await supabaseAdmin
  .from("user_roles")
  .insert([
    {
      user_id: profileData.id,
      role: "workspace_owner"  // ← Remover
    }
  ]);
```

Manter apenas:
```typescript
// MANTER ESTE BLOCO:
const { error: memberError } = await supabaseAdmin
  .from("workspace_members")
  .insert([
    {
      workspace_id: workspace_id,
      profile_id: profileData.id,
      role: "work_owner"
    }
  ]);
```

## 📊 Comparação: Antes vs Depois

| Aspecto | Antes | Depois |
|---------|-------|--------|
| Workspace owner em user_roles | ❌ Erro (enum invalido) | ✅ Não inserido |
| Workspace owner em workspace_members | ✅ Sim | ✅ Sim |
| Role de plataforma do owner | ❌ Nenhuma | ✅ Nenhuma (correto) |
| Se precisar ser admin de plataforma | - | ✅ Inserir separadamente em user_roles |

## 📚 Referências

- `user_roles` define: app_role ENUM (super_admin, admin, manager)
- `workspace_members` define: workspace_role ENUM (work_owner, work_manager, work_user)
- Função `has_role()` checa `user_roles` (plataforma apenas)
- RLS policies verificam `workspace_members` (workspace apenas)
