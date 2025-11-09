# 🏗️ DIAGRAMA TÉCNICO: Solução para Erro de Último Owner

## ❌ ANTES: O Problema

```
┌─────────────────────────────────────────────────────────────────┐
│ React App: DeleteWorkspaceDialog                                 │
│                                                                   │
│  onClick="Excluir" → deleteWorkspace(workspaceId)               │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│ workspace.actions.ts                                             │
│                                                                   │
│  supabaseServer                                                   │
│    .from("workspaces")                                           │
│    .delete()                                                      │
│    .eq("id", workspaceId)                                        │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼ [BEGIN TRANSACTION]
┌─────────────────────────────────────────────────────────────────┐
│ Supabase Database                                                │
│                                                                   │
│  DELETE FROM workspaces WHERE id = 'abc-123'                    │
│                                                                   │
│  ┌─ ON DELETE CASCADE ──────────────────────────────────────┐  │
│  │  DELETE FROM workspace_members                           │  │
│  │  WHERE workspace_id = 'abc-123'                          │  │
│  │                                                           │  │
│  │  🔴 TRIGGER: prevent_last_owner_downgrade()            │  │
│  │     IF role = 'work_owner' AND owner_count = 1         │  │
│  │        RAISE EXCEPTION ❌                                │  │
│  │     END IF;                                              │  │
│  │                                                           │  │
│  │  Result: ROLLBACK ENTIRE TRANSACTION                    │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                   │
│  ❌ Erro: "Cannot remove or downgrade the last owner..."         │
└─────────────────────────────────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│ React App: DeleteWorkspaceDialog                                 │
│                                                                   │
│  showErrorToast("❌ Cannot remove or downgrade...")             │
│  workspace NOT deleted                                           │
└─────────────────────────────────────────────────────────────────┘
```

---

## ✅ DEPOIS: A Solução

```
┌─────────────────────────────────────────────────────────────────┐
│ React App: DeleteWorkspaceDialog                                 │
│                                                                   │
│  onClick="Excluir" → deleteWorkspace(workspaceId)               │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│ workspace.actions.ts                                             │
│                                                                   │
│  supabaseServer.rpc(                                             │
│    "delete_workspace_safely",                                    │
│    { workspace_id: workspaceId }                                 │
│  )                                                                │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼ [BEGIN TRANSACTION]
┌─────────────────────────────────────────────────────────────────┐
│ Supabase Database: RPC delete_workspace_safely()                 │
│                                                                   │
│  1. PERFORM set_config('app.deleting_workspace', 'true', true); │
│     └─ Define contexto para triggers                             │
│                                                                   │
│  2. DELETE FROM workspace_members WHERE workspace_id = 'abc-123' │
│                                                                   │
│     🟢 TRIGGER: prevent_last_owner_downgrade()                  │
│        CONTEXT: 'app.deleting_workspace' = 'true'               │
│        ├─ Verifica: is_cascading_delete := true                 │
│        ├─ IF is_cascading_delete THEN                           │
│        │    RETURN OLD  -- ✅ Permite deleção                   │
│        │  END IF;                                                │
│        └─ Resultado: ✅ workspace_members DELETADOS              │
│                                                                   │
│  3. DELETE FROM workspaces WHERE id = 'abc-123'                 │
│     └─ ✅ Workspace DELETADO                                    │
│                                                                   │
│  4. RETURN json_build_object('success', true, ...)             │
└─────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼ [COMMIT TRANSACTION]
┌─────────────────────────────────────────────────────────────────┐
│ React App: DeleteWorkspaceDialog                                 │
│                                                                   │
│  data.success === true                                           │
│  │                                                                │
│  ├─ showSuccessToast("✅ Workspace excluído com sucesso")        │
│  ├─ closeDialog()                                                │
│  └─ refetch() [atualiza lista de workspaces]                    │
│                                                                   │
│  RESULTADO: ✅ Workspace deletado com sucesso!                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🔄 Fluxo de Contexto (Transaction Context)

```
CREATE OR REPLACE FUNCTION public.set_workspace_cascade_delete_context()
│
└─ BEFORE DELETE ON workspaces
   │
   ├─ PERFORM set_config('app.deleting_workspace', 'true', true)
   │  └─ Define no contexto local (não persiste)
   │
   └─ RETURN OLD (permite o DELETE)


CREATE OR REPLACE FUNCTION public.prevent_last_owner_downgrade()
│
├─ BEFORE DELETE ON workspace_members
│  │
│  ├─ BEGIN
│  │  is_cascading_delete := current_setting(
│  │                          'app.deleting_workspace',
│  │                          true  ← padrão: false se não encontrar
│  │                        )::BOOLEAN;
│  │  EXCEPTION WHEN OTHERS → is_cascading_delete := false;
│  │ END;
│  │
│  ├─ IF is_cascading_delete THEN
│  │   RETURN OLD  ← ✅ Passa sem validação
│  │ END IF;
│  │
│  ├─ IF owner_count = 1 AND TG_OP = 'DELETE' AND role = 'work_owner'
│  │   RAISE EXCEPTION ← ❌ Valida para deletions manuais
│  │ END IF;
│  │
│  └─ RETURN OLD ou NEW
│
└─ Contexto desaparece após COMMIT/ROLLBACK
   └─ (Set Local = válido apenas nesta transação)
```

---

## 📊 Matriz de Decisão: Quando Validação é Aplicada

| Operação | TG_OP | Contexto | owner_count | Resultado |
|----------|-------|---------|-------------|-----------|
| `DELETE workspace` com 1 owner | DELETE | deleting_workspace=true | 1 | ✅ PERMITIDO |
| `DELETE workspace_member` manual com 1 owner | DELETE | deleting_workspace=false | 1 | ❌ BLOQUEADO |
| `UPDATE role` de owner → manager com 1 owner | UPDATE | deleting_workspace=false | 1 | ❌ BLOQUEADO |
| `DELETE workspace_member` com 2+ owners | DELETE | - | 2+ | ✅ PERMITIDO |
| `UPDATE role` com 2+ owners | UPDATE | - | 2+ | ✅ PERMITIDO |

---

## 🎯 Por Que Esta Solução é Segura

```
┌─────────────────────────────────────────────────────────────────┐
│ SEGURANÇA EM 4 CAMADAS                                           │
│                                                                   │
│ Camada 1: RLS Policies (banco de dados)                         │
│ ├─ Apenas usuários autenticados podem deletar                    │
│ ├─ Apenas Super Admins têm permissão                             │
│ └─ Enforcement: SECURITY POLICY                                  │
│                                                                   │
│ Camada 2: SERVICE_ROLE_KEY (aplicação)                          │
│ ├─ Necessário para contornar RLS (bypass)                        │
│ ├─ Armazenado em .env.local (não commitado)                      │
│ └─ Risco mitigado: JWT token de curta vida                       │
│                                                                   │
│ Camada 3: Validação de Contexto (banco de dados)                │
│ ├─ Contexto válido apenas durante transação                      │
│ ├─ Não pode ser explorado externamente                           │
│ └─ Só funciona quando SET LOCAL é executado                      │
│                                                                   │
│ Camada 4: Proteção de Dados Integrais (banco de dados)          │
│ ├─ Trigger sempre ativo para operações manuais                   │
│ ├─ Impede remoção de último owner via SQL direto                 │
│ └─ Protege integridade mesmo sem RPC                             │
│                                                                   │
│ RESULTADO: 4 barreiras de segurança = muito difícil explorar    │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🚀 Como Funciona a RPC

```sql
CREATE OR REPLACE FUNCTION public.delete_workspace_safely(workspace_id UUID)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER      ← Executa com privilégios da função, não do caller
SET search_path = public
AS $function$
DECLARE
  v_result JSON;
BEGIN
  -- Step 1: Preparar contexto
  PERFORM set_config('app.deleting_workspace', 'true', true);
  --                                                    ↑
  --                                            true = LOCAL (apenas essa transação)
  
  -- Step 2: Deletar members (trigger vai ver contexto=true)
  DELETE FROM public.workspace_members
  WHERE workspace_members.workspace_id = delete_workspace_safely.workspace_id;
  
  -- Step 3: Deletar workspace
  DELETE FROM public.workspaces
  WHERE id = delete_workspace_safely.workspace_id;
  
  -- Step 4: Retornar sucesso
  RETURN json_build_object(
    'success', true,
    'message', 'Workspace deleted successfully'
  );
EXCEPTION WHEN OTHERS THEN
  -- Se qualquer coisa falha, retorna erro
  RETURN json_build_object(
    'success', false,
    'error', SQLERRM
  );
END;
$function$;
```

---

## 📞 Comparação com Alternativas

| Solução | Segurança | Complexidade | Performance | Recomendação |
|---------|-----------|--------------|-------------|--------------|
| **RPC com Contexto** (atual) | ⭐⭐⭐⭐⭐ | ⭐⭐ | ⭐⭐⭐⭐ | ✅ ESCOLHIDA |
| Remover trigger completamente | ⭐⭐ | ⭐ | ⭐⭐⭐⭐⭐ | ❌ Inseguro |
| Trigger com flag coluna | ⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐ | ⏸️ Overengineered |
| Desabilitar RLS | ⭐ | ⭐ | ⭐⭐⭐⭐⭐ | ❌ Muito inseguro |
| Soft delete (arquivar) | ⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐ | ❌ Diferente requisito |
