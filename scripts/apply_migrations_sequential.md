# 📋 Plano para Aplicar Migrations Sequencialmente

## Objetivo
Refazer todas as migrations no Supabase remoto, uma por uma, com validação após cada etapa.

## Migrations a Aplicar

### 1. Migration 01: Schema Inicial
- **Arquivo**: `supabase/migrations/20251023232715_c5ab5bcc-960f-438b-84e5-19a83c903d29.sql`
- **Descrição**: Cria enums, tabelas base (profiles, plans, clients, contracts, user_roles)
- **Testes**: Verificar se as tabelas foram criadas
- **Comando**: `supabase db push --linked`

### 2. Migration 02: Atribuir Super Admin
- **Arquivo**: `supabase/migrations/20251024003233_18f17aaf-cc46-4e28-a6e8-f0b6005d8085.sql`
- **Descrição**: Cria função para atribuir super_admin ao primeiro usuário
- **Testes**: Verificar se a função foi criada
- **Comando**: `supabase db push --linked`

### 3. Migration 03: Multi-tenant e RLS
- **Arquivo**: `supabase/migrations/20251024030651_09eccf51-d8ec-4b51-85a4-4c746b3c2d8a.sql`
- **Descrição**: Adiciona suporte multi-tenant e políticas RLS
- **Testes**: Verificar se as funções e políticas foram criadas
- **Status**: ⚠️ ERRO DE SINTAXE (precisa corrigir)
- **Comando**: `supabase db push --linked`

### 4. Migration 06: Fix RLS Recursion
- **Arquivo**: `supabase/migrations/20251106000006_fix_workspace_members_rls_recursion.sql`
- **Descrição**: Corrige recursão infinita nas políticas RLS
- **Testes**: Verificar se as funções e novas políticas foram criadas
- **Comando**: `supabase db push --linked`

## Passos para Cada Migration

### Passo 1: Verificar estado atual
```bash
supabase status
```

### Passo 2: Aplicar migration
```bash
supabase db push --linked
```

### Passo 3: Validar aplicação
- Verificar no Supabase Dashboard se os objetos foram criados
- Executar script de validação

### Passo 4: Documentar resultado
- ✅ Sucesso: Passar para próxima migration
- ❌ Erro: Analisar erro e corrigir

## Problemas Conhecidos

### Migration 03 - Erro de Sintaxe
**Erro**: `syntax error at or near "DROP"`
**Causa**: Falta de ponto e vírgula após CREATE POLICY
**Solução**: Adicionar `;` após cada CREATE POLICY

**Exemplo:**
```sql
CREATE POLICY "Multi-tenant: INSERT clients"
ON public.clients
FOR INSERT
TO authenticated
WITH CHECK (
  public.has_role(auth.uid(), 'super_admin'::app_role)
  OR
  public.has_role(auth.uid(), 'admin'::app_role)
);  -- ADICIONAR PONTO E VÍRGULA AQUI

DROP POLICY IF EXISTS "Multi-tenant: UPDATE clients" ON public.clients;
```

## Checklist de Execução

- [ ] **Migration 01**: Aplicada e validada
  - [ ] Tabelas criadas
  - [ ] Enums definidos
  - [ ] RLS habilitado
  
- [ ] **Migration 02**: Aplicada e validada
  - [ ] Função `assign_first_user_as_admin` criada
  - [ ] Trigger `on_first_user_create_admin` criado
  
- [ ] **Migration 03**: Corrigida e aplicada
  - [ ] ⚠️ Corrigir erro de sintaxe primeiro
  - [ ] Funções `get_user_client_id`, `is_platform_admin` criadas
  - [ ] Políticas RLS multi-tenant criadas
  
- [ ] **Migration 06**: Aplicada e validada
  - [ ] Funções `user_is_workspace_member`, `user_can_manage_workspace` criadas
  - [ ] Novas políticas RLS criadas
  - [ ] Índices criados

## Próximos Passos Após Aplicar Todas

1. Executar testes completos
2. Validar que não há recursão infinita
3. Verificar que as políticas funcionam corretamente
4. Documentar resultados

## Comandos Úteis

```bash
# Ver status do Supabase
supabase status

# Ver logs de aplicação
supabase db push --linked --debug

# Resetar e aplicar novamente
supabase db reset --linked --no-seed
supabase db push --linked

# Conectar ao banco remoto via psql
# Usar variáveis de ambiente do Supabase
```

## Referências

- Migration 01: Create initial schema
- Migration 02: Setup first user as super admin
- Migration 03: **FIX SYNTAX ERROR FIRST**
  - Adicionar ponto e vírgula após cada CREATE POLICY
  - Separar CREATE POLICY de DROP POLICY
- Migration 06: Fix RLS recursion in workspace_members