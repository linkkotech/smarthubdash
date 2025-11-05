# 🚀 INSTRUÇÕES - Executar Migrations Fase 1

## ⚠️ IMPORTANTE: Executar NA ORDEM

Execute cada SQL abaixo **UM POR VEZ** no Supabase Dashboard SQL Editor:
👉 https://supabase.com/dashboard/project/cpzodtaghdinluovuflg/sql

---

## ✅ MIGRATION 1 - Adicionar workspace_id nas tabelas

**Arquivo:** `20251104000010_add_workspace_id_to_tables.sql`

**Execute este SQL:**

```sql
-- Copie e cole TODO o conteúdo do arquivo:
-- supabase/migrations/20251104000010_add_workspace_id_to_tables.sql
```

**Resultado esperado:**
✅ 3 colunas adicionadas
✅ 3 índices criados
✅ Mensagem: "Migration 10 concluída com sucesso!"

---

## ✅ MIGRATION 2 - Adicionar client_type e document em workspaces

**Arquivo:** `20251104000010b_add_client_fields_to_workspaces.sql`

**Execute este SQL:**

```sql
-- Copie e cole TODO o conteúdo do arquivo:
-- supabase/migrations/20251104000010b_add_client_fields_to_workspaces.sql
```

**Resultado esperado:**
✅ Tipo `client_type` criado (se não existia)
✅ 2 colunas adicionadas em workspaces
✅ Constraint de validação criado
✅ Mensagem: "Migration 10b concluída com sucesso!"

---

## ✅ MIGRATION 3 - Criar workspace_teams

**Arquivo:** `20251104000011_create_workspace_teams.sql`

**Execute este SQL:**

```sql
-- Copie e cole TODO o conteúdo do arquivo:
-- supabase/migrations/20251104000011_create_workspace_teams.sql
```

**Resultado esperado:**
✅ Tabela `workspace_teams` criada
✅ Coluna `workspace_team_id` adicionada em profiles
✅ RLS habilitado com 5 policies
✅ Mensagem: "Migration 11 concluída com sucesso!"

---

## ✅ MIGRATION 4 - Migrar dados (CRÍTICA)

**Arquivo:** `20251104000012_migrate_clients_to_workspaces.sql`

**⚠️ ATENÇÃO: Esta migration copia TODOS os dados!**

**Execute este SQL:**

```sql
-- Copie e cole TODO o conteúdo do arquivo:
-- supabase/migrations/20251104000012_migrate_clients_to_workspaces.sql
```

**Resultado esperado:**
✅ Dados copiados de clients → workspaces
✅ Dados copiados de teams → workspace_teams
✅ FKs atualizadas em profiles, contracts
✅ workspace_members criados para admins
✅ Mensagem com estatísticas:
   - Total de workspaces: X
   - Profiles com workspace_id: X
   - Contracts com workspace_id: X
   - Workspace teams criadas: X

---

## ✅ MIGRATION 5 - Criar get_user_workspace_id()

**Arquivo:** `20251104000013_create_get_user_workspace_id.sql`

**Execute este SQL:**

```sql
-- Copie e cole TODO o conteúdo do arquivo:
-- supabase/migrations/20251104000013_create_get_user_workspace_id.sql
```

**Resultado esperado:**
✅ Função `get_user_workspace_id()` criada
✅ Função `get_current_user_workspace_id()` criada
✅ Mensagem: "Migration 13 concluída com sucesso!"

---

## 🔍 VALIDAÇÃO - Execute após todas as migrations

Rode esta query para validar:

```sql
-- Query de validação
SELECT 
  'workspaces' as tabela,
  COUNT(*) as total,
  COUNT(CASE WHEN client_type IS NOT NULL THEN 1 END) as com_client_type,
  COUNT(CASE WHEN document IS NOT NULL THEN 1 END) as com_document
FROM workspaces

UNION ALL

SELECT 
  'profiles com workspace_id',
  COUNT(*),
  COUNT(CASE WHEN workspace_id IS NOT NULL THEN 1 END),
  NULL
FROM profiles

UNION ALL

SELECT 
  'contracts com workspace_id',
  COUNT(*),
  COUNT(CASE WHEN workspace_id IS NOT NULL THEN 1 END),
  NULL
FROM contracts

UNION ALL

SELECT 
  'workspace_teams',
  COUNT(*),
  NULL,
  NULL
FROM workspace_teams

UNION ALL

SELECT 
  'workspace_members',
  COUNT(*),
  COUNT(CASE WHEN role = 'owner' THEN 1 END) as owners,
  NULL
FROM workspace_members;
```

**Resultado esperado:**
Todos os números devem estar corretos e consistentes.

---

## ✅ CHECKLIST DE EXECUÇÃO

- [ ] Migration 10 executada com sucesso
- [ ] Migration 10b executada com sucesso
- [ ] Migration 11 executada com sucesso
- [ ] Migration 12 executada com sucesso (verificar estatísticas)
- [ ] Migration 13 executada com sucesso
- [ ] Query de validação executada (números corretos)
- [ ] Nenhum erro reportado

---

## 🆘 SE ALGO DER ERRADO

As migrations são **IDEMPOTENTES** (podem ser executadas múltiplas vezes).

Se houver erro:
1. Leia a mensagem de erro
2. Corrija o problema
3. Execute novamente

**NADA FOI REMOVIDO** - estrutura antiga (`clients`, `teams`) ainda existe e funciona!

---

## 📞 APÓS EXECUTAR

Confirme aqui no chat que todas as 5 migrations foram executadas com sucesso e mostre o resultado da query de validação.
