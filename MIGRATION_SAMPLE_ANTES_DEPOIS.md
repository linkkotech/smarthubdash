# 🔍 MIGRATION SAMPLE - Antes e Depois (Fase 2)

## 📋 Exemplo Real de Policies a Serem Atualizadas

---

## 🗂️ TABELA: `profiles`

### ❌ **ANTES (Fase 1 - Usando client_id)**

```sql
-- ============================================================================
-- POLICY: Client admins and managers can insert team members
-- ============================================================================

CREATE POLICY "Client admins and managers can insert team members"
ON public.profiles
FOR INSERT
TO authenticated
WITH CHECK (
  client_id = public.get_user_client_id(auth.uid())
  AND public.get_user_client_id(auth.uid()) IS NOT NULL
  AND (
    public.is_client_admin(auth.uid())
    OR 
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() 
        AND client_user_role = 'client_manager'
    )
  )
);
```

### ✅ **DEPOIS (Fase 2 - Usando workspace_id)**

```sql
-- ============================================================================
-- POLICY: Workspace admins and managers can insert team members
-- ============================================================================

CREATE POLICY "Workspace admins and managers can insert team members"
ON public.profiles
FOR INSERT
TO authenticated
WITH CHECK (
  workspace_id = public.get_user_workspace_id(auth.uid())
  AND public.get_user_workspace_id(auth.uid()) IS NOT NULL
  AND (
    public.is_client_admin(auth.uid())
    OR 
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() 
        AND client_user_role = 'client_manager'
    )
  )
);
```

**🔄 Mudanças:**
- `client_id` → `workspace_id`
- `get_user_client_id()` → `get_user_workspace_id()`
- Nome da policy atualizado (opcional, mas mais semântico)

---

## 🗂️ TABELA: `teams` → **NÃO MEXER!**

### ⚠️ **IMPORTANTE: Não atualizar policies de `teams`**

```sql
-- ❌ NÃO FAZER ISSO (teams será dropada na Fase 3)

CREATE POLICY "Client users can read their client's teams"
ON public.teams
FOR SELECT
TO authenticated
USING (
  client_id = public.get_user_client_id(auth.uid())
  AND public.get_user_client_id(auth.uid()) IS NOT NULL
);
```

**Por quê?**
- A tabela `teams` será **dropada na Fase 3**
- Não vale a pena atualizar policies que serão removidas
- O foco é migrar para `workspace_teams` (que já tem policies corretas)

---

## 🗂️ TABELA: `contracts`

### ❌ **ANTES (Fase 1 - Usando client_id)**

```sql
-- ============================================================================
-- POLICY: Multi-tenant SELECT contracts
-- ============================================================================

CREATE POLICY "Multi-tenant: SELECT contracts"
ON public.contracts
FOR SELECT
TO authenticated
USING (
  client_id = public.get_user_client_id(auth.uid())
  OR public.is_platform_admin(auth.uid())
);

-- ============================================================================
-- POLICY: Multi-tenant INSERT contracts
-- ============================================================================

CREATE POLICY "Multi-tenant: INSERT contracts"
ON public.contracts
FOR INSERT
TO authenticated
WITH CHECK (
  client_id = public.get_user_client_id(auth.uid())
  AND public.get_user_client_id(auth.uid()) IS NOT NULL
);

-- ============================================================================
-- POLICY: Multi-tenant UPDATE contracts
-- ============================================================================

CREATE POLICY "Multi-tenant: UPDATE contracts"
ON public.contracts
FOR UPDATE
TO authenticated
USING (
  client_id = public.get_user_client_id(auth.uid())
  OR public.is_platform_admin(auth.uid())
)
WITH CHECK (
  client_id = public.get_user_client_id(auth.uid())
);

-- ============================================================================
-- POLICY: Multi-tenant DELETE contracts
-- ============================================================================

CREATE POLICY "Multi-tenant: DELETE contracts"
ON public.contracts
FOR DELETE
TO authenticated
USING (
  client_id = public.get_user_client_id(auth.uid())
  AND public.is_client_admin(auth.uid())
);
```

### ✅ **DEPOIS (Fase 2 - Usando workspace_id)**

```sql
-- ============================================================================
-- POLICY: Multi-tenant SELECT contracts
-- ============================================================================

CREATE POLICY "Multi-tenant: SELECT contracts"
ON public.contracts
FOR SELECT
TO authenticated
USING (
  workspace_id = public.get_user_workspace_id(auth.uid())
  OR public.is_platform_admin(auth.uid())
);

-- ============================================================================
-- POLICY: Multi-tenant INSERT contracts
-- ============================================================================

CREATE POLICY "Multi-tenant: INSERT contracts"
ON public.contracts
FOR INSERT
TO authenticated
WITH CHECK (
  workspace_id = public.get_user_workspace_id(auth.uid())
  AND public.get_user_workspace_id(auth.uid()) IS NOT NULL
);

-- ============================================================================
-- POLICY: Multi-tenant UPDATE contracts
-- ============================================================================

CREATE POLICY "Multi-tenant: UPDATE contracts"
ON public.contracts
FOR UPDATE
TO authenticated
USING (
  workspace_id = public.get_user_workspace_id(auth.uid())
  OR public.is_platform_admin(auth.uid())
)
WITH CHECK (
  workspace_id = public.get_user_workspace_id(auth.uid())
);

-- ============================================================================
-- POLICY: Multi-tenant DELETE contracts
-- ============================================================================

CREATE POLICY "Multi-tenant: DELETE contracts"
ON public.contracts
FOR DELETE
TO authenticated
USING (
  workspace_id = public.get_user_workspace_id(auth.uid())
  AND public.is_client_admin(auth.uid())
);
```

**🔄 Mudanças (4 policies):**
- Todas as referências `client_id` → `workspace_id`
- Todas as chamadas `get_user_client_id()` → `get_user_workspace_id()`
- Platform admins continuam com acesso total (`OR is_platform_admin`)

---

## 🗂️ TABELA: `digital_profiles`

### ❌ **ANTES (Fase 1 - Usando client_id)**

```sql
-- ============================================================================
-- POLICY: Multi-tenant SELECT digital_profiles
-- ============================================================================

CREATE POLICY "Multi-tenant: SELECT digital_profiles"
ON public.digital_profiles
FOR SELECT
TO authenticated
USING (
  client_id = public.get_user_client_id(auth.uid())
  OR public.is_platform_admin(auth.uid())
);

-- ============================================================================
-- POLICY: Client admins can insert digital profiles
-- ============================================================================

CREATE POLICY "Client admins can insert their client's digital profiles"
ON public.digital_profiles
FOR INSERT
TO authenticated
WITH CHECK (
  client_id = public.get_user_client_id(auth.uid())
  AND EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() 
      AND client_user_role IN ('client_admin', 'client_manager')
  )
);

-- ============================================================================
-- POLICY: Client admins can update digital profiles
-- ============================================================================

CREATE POLICY "Client admins can update their client's digital profiles"
ON public.digital_profiles
FOR UPDATE
TO authenticated
USING (
  client_id = public.get_user_client_id(auth.uid())
  AND EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() 
      AND client_user_role IN ('client_admin', 'client_manager')
  )
)
WITH CHECK (
  client_id = public.get_user_client_id(auth.uid())
  AND EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() 
      AND client_user_role IN ('client_admin', 'client_manager')
  )
);

-- ============================================================================
-- POLICY: Client admins can delete digital profiles
-- ============================================================================

CREATE POLICY "Client admins can delete their client's digital profiles"
ON public.digital_profiles
FOR DELETE
TO authenticated
USING (
  client_id = public.get_user_client_id(auth.uid())
  AND EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() 
      AND client_user_role = 'client_admin'
  )
);
```

### ✅ **DEPOIS (Fase 2 - Usando workspace_id)**

```sql
-- ============================================================================
-- POLICY: Multi-tenant SELECT digital_profiles
-- ============================================================================

CREATE POLICY "Multi-tenant: SELECT digital_profiles"
ON public.digital_profiles
FOR SELECT
TO authenticated
USING (
  workspace_id = public.get_user_workspace_id(auth.uid())
  OR public.is_platform_admin(auth.uid())
);

-- ============================================================================
-- POLICY: Workspace admins can insert digital profiles
-- ============================================================================

CREATE POLICY "Workspace admins can insert their workspace's digital profiles"
ON public.digital_profiles
FOR INSERT
TO authenticated
WITH CHECK (
  workspace_id = public.get_user_workspace_id(auth.uid())
  AND EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() 
      AND client_user_role IN ('client_admin', 'client_manager')
  )
);

-- ============================================================================
-- POLICY: Workspace admins can update digital profiles
-- ============================================================================

CREATE POLICY "Workspace admins can update their workspace's digital profiles"
ON public.digital_profiles
FOR UPDATE
TO authenticated
USING (
  workspace_id = public.get_user_workspace_id(auth.uid())
  AND EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() 
      AND client_user_role IN ('client_admin', 'client_manager')
  )
)
WITH CHECK (
  workspace_id = public.get_user_workspace_id(auth.uid())
  AND EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() 
      AND client_user_role IN ('client_admin', 'client_manager')
  )
);

-- ============================================================================
-- POLICY: Workspace admins can delete digital profiles
-- ============================================================================

CREATE POLICY "Workspace admins can delete their workspace's digital profiles"
ON public.digital_profiles
FOR DELETE
TO authenticated
USING (
  workspace_id = public.get_user_workspace_id(auth.uid())
  AND EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() 
      AND client_user_role = 'client_admin'
  )
);
```

**🔄 Mudanças (4 policies):**
- Todas as referências `client_id` → `workspace_id`
- Todas as chamadas `get_user_client_id()` → `get_user_workspace_id()`
- Nomes atualizados: "Client admins" → "Workspace admins"

---

## 📊 RESUMO DAS MUDANÇAS

### **Padrão de Substituição:**

```sql
-- PADRÃO ANTIGO:
client_id = public.get_user_client_id(auth.uid())

-- PADRÃO NOVO:
workspace_id = public.get_user_workspace_id(auth.uid())
```

### **Tabelas Afetadas:**
| Tabela | Policies | Ação |
|--------|----------|------|
| `profiles` | 4 | ✅ Atualizar |
| `contracts` | 4 | ✅ Atualizar |
| `digital_profiles` | 4 | ✅ Atualizar |
| `teams` | 7 | ❌ **NÃO MEXER** (será dropada) |
| `workspace_teams` | 5 | ✅ **JÁ CORRETO** (criado na Fase 1) |

### **Total de Policies a Atualizar: 12**

---

## 🎯 Estrutura da Migration 20

```sql
-- ============================================================================
-- MIGRATION: Atualizar RLS Policies para usar workspace_id
-- ============================================================================
-- Data: 04 de novembro de 2025
-- Fase: FASE 2 - Adoção
-- Descrição: Atualiza TODAS as policies RLS para usar workspace_id ao invés de client_id
-- IMPORTANTE: Tabela 'teams' NÃO será alterada (será dropada na Fase 3)
-- ============================================================================

-- ============================================================================
-- ETAPA 1: Atualizar policies de PROFILES
-- ============================================================================

DROP POLICY IF EXISTS "Client admins and managers can insert team members" ON public.profiles;
-- ... 3 policies

-- ============================================================================
-- ETAPA 2: Atualizar policies de CONTRACTS
-- ============================================================================

DROP POLICY IF EXISTS "Multi-tenant: SELECT contracts" ON public.contracts;
-- ... 4 policies

-- ============================================================================
-- ETAPA 3: Atualizar policies de DIGITAL_PROFILES
-- ============================================================================

DROP POLICY IF EXISTS "Multi-tenant: SELECT digital_profiles" ON public.digital_profiles;
-- ... 4 policies

-- ============================================================================
-- VERIFICAÇÃO
-- ============================================================================

DO $$
BEGIN
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Migration 20 concluída com sucesso!';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Policies atualizadas:';
  RAISE NOTICE '- profiles: 4 policies';
  RAISE NOTICE '- contracts: 4 policies';
  RAISE NOTICE '- digital_profiles: 4 policies';
  RAISE NOTICE 'Total: 12 policies';
  RAISE NOTICE '';
  RAISE NOTICE 'NOTA: Policies de teams NÃO foram alteradas';
  RAISE NOTICE 'Elas serão removidas na Fase 3';
END $$;
```

---

## ✅ Pronto para criar a migration completa?

Responda com:
- **"Criar migration 20"** → Criar arquivo completo com todas as 12 policies atualizadas
- **"Ver mais exemplos"** → Ver mais policies de outras tabelas
- **"Voltar ao plano"** → Revisar PLANO_FASE2_COMPLETO.md
