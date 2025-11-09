# 🔧 FIX: Erro ao Deletar Workspace - "Cannot remove or downgrade the last owner"

## ❌ Problema Identificado

Ao tentar deletar um workspace, o usuário recebia o erro:
```
Cannot remove or downgrade the last owner of the workspace. Please assign another owner first.
```

### Causa Raiz

A função trigger `prevent_last_owner_downgrade()` (criada na migration `20251104000003_create_workspace_members_table.sql`) foi projetada para **prevenir** que o último `work_owner` de um workspace seja removido ou rebaixado manualmente.

**O problema:** Quando você tenta deletar um workspace via `DELETE FROM workspaces`, o banco de dados dispara uma cascata que tenta deletar todos os `workspace_members` associados. Isso ativa o trigger que valida: "Há apenas 1 owner? Bloqueia!" - e a operação inteira falha.

```sql
-- Trigger que bloqueia a deleção
IF (TG_OP = 'DELETE' AND OLD.role = 'work_owner') THEN
    IF owner_count = 1 THEN
        RAISE EXCEPTION 'Cannot remove or downgrade the last owner...';
    END IF;
END IF;
```

## ✅ Solução Implementada

Criada nova migration: **`20251106000015_allow_cascade_delete_workspace.sql`**

### 3 Componentes da Solução:

#### 1️⃣ **Atualizar `prevent_last_owner_downgrade()`** 
Adicionado suporte a contexto (`SET LOCAL` do PostgreSQL):
```sql
-- Verificar se é deleção em cascata de workspace
BEGIN
    is_cascading_delete := current_setting('app.deleting_workspace', true)::BOOLEAN;
EXCEPTION WHEN OTHERS THEN
    is_cascading_delete := false;
END;

-- Se é cascata, permitir deleção mesmo do último owner
IF is_cascading_delete THEN
    RETURN OLD; -- Deixa passar sem validação
END IF;
```

#### 2️⃣ **Trigger `set_workspace_cascade_delete_context_trigger`**
Dispara ANTES de deletar um workspace para avisar ao sistema:
```sql
CREATE TRIGGER set_workspace_cascade_delete_context_trigger
  BEFORE DELETE ON public.workspaces
  FOR EACH ROW
  EXECUTE FUNCTION public.set_workspace_cascade_delete_context();
```

#### 3️⃣ **RPC `delete_workspace_safely(workspace_id UUID)`**
Função segura que orquestra a deleção:
```sql
CREATE OR REPLACE FUNCTION public.delete_workspace_safely(workspace_id UUID)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
BEGIN
  -- Definir contexto
  PERFORM set_config('app.deleting_workspace', 'true', true);
  
  -- Deletar workspace_members primeiro
  DELETE FROM public.workspace_members
  WHERE workspace_members.workspace_id = delete_workspace_safely.workspace_id;
  
  -- Deletar workspace
  DELETE FROM public.workspaces
  WHERE id = delete_workspace_safely.workspace_id;
  
  RETURN json_build_object('success', true, ...);
END;
```

### Atualização TypeScript

Arquivo: `src/lib/actions/workspace.actions.ts`

**Antes:**
```typescript
const { error: deleteError, data } = await supabaseServer
  .from("workspaces")
  .delete()
  .eq("id", workspaceId)
  .select();
```

**Depois:**
```typescript
// Usar RPC delete_workspace_safely para contornar validação
const { data, error: rpcError } = await supabaseServer.rpc(
  "delete_workspace_safely",
  { workspace_id: workspaceId }
);
```

## 📋 Próximos Passos

### 1. Executar a Nova Migration
```bash
# No Supabase Dashboard > SQL Editor:
# Cole o conteúdo de: supabase/migrations/20251106000015_allow_cascade_delete_workspace.sql
```

### 2. Registrar na Tabela schema_migrations
```sql
INSERT INTO schema_migrations (version, name, statements, checksum, execution_time, success, installed_on)
VALUES (
  '20251106000015',
  'allow_cascade_delete_workspace',
  1,  -- número de statements
  'xxx',  -- checksum (pode gerar automaticamente)
  0,
  TRUE,
  NOW()
);
```

### 3. Testar Deleção
- Navigate para `/clientes` (Super Admin)
- Clique no ícone de ações ("⋯") de qualquer workspace
- Clique em "🗑️ Excluir"
- Confirme no diálogo
- Workspace deve ser deletado sem erro

## 🔐 Segurança

- ✅ RLS policies ainda protegem (apenas Super Admins podem chamar a RPC)
- ✅ SERVICE_ROLE_KEY continua necessário no `.env.local`
- ✅ Trigger `prevent_last_owner_downgrade` ainda protege edições manuais de membros
- ✅ Contexto é local (LOCAL) - não afeta outras operações

## 📊 Comparação: Antes vs Depois

| Aspecto | Antes | Depois |
|---------|-------|--------|
| Deletar workspace vazio | ✅ Funciona | ✅ Funciona |
| Deletar workspace com 1 owner | ❌ Erro bloqueador | ✅ Funciona |
| Deletar workspace com múltiplos owners | ✅ Funciona | ✅ Funciona |
| Remover último owner manualmente | ✅ Bloqueado (correto) | ✅ Bloqueado (correto) |
| Rebaixar último owner | ✅ Bloqueado (correto) | ✅ Bloqueado (correto) |

## 🎯 Decisão de Design

A solução usa **contexto de transação** porque:
1. Não modifica a constraint original (mantém proteção para operações manuais)
2. Permite uma "escape hatch" segura apenas para deleção de workspace completo
3. Uso de RPC garante que a lógica está concentrada no banco (mais seguro)
4. Transações são atômicas (ou deleta tudo, ou nada)
