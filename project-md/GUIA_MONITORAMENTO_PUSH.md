# 🔍 Guia de Monitoramento - DB Push Remoto

## Situação Atual

**Comando em execução**: `supabase db push --linked`
**Projeto**: cpzodtaghdinluovuflg (Supabase remoto)
**Migrations a aplicar**:
1. ✅ 20251023232715 - Schema Inicial
2. ✅ 20251024003233 - Setup com Admin
3. ✅ 20251024030651 - Multi-tenant (CORRIGIDA)
4. ✅ 20251106000006 - Fix RLS Recursion

## O que Observar no Terminal

### ✅ Sinais de Sucesso

```
Applying migration ...
  Successfully created migration ...
Applying migration ...
  Successfully created migration ...
...
Finished successfully
```

### ❌ Sinais de Erro

```
Error: syntax error at line X
Error: column "..." already exists
Error: function "..." is not unique
```

## Após Conclusão - Próximas Ações

### Opção 1: Se Sucesso ✅

```bash
# 1. Validar que as migrations foram aplicadas
node scripts/validate_migrations_applied.ts

# 2. Executar testes completos da Migration 06
node scripts/test_migration_06_direct.ts

# 3. Verificar estrutura no Supabase
supabase db list --linked
```

### Opção 2: Se Erro ❌

```bash
# 1. Ver logs detalhados
supabase db push --linked --debug

# 2. Identificar qual migration falhou

# 3. Corrigir o arquivo em supabase/migrations/

# 4. Tentar novamente
supabase db push --linked
```

## Estrutura Esperada Após Push

```
public.profiles
├── client_id (uuid, references clients)
├── Funções:
│   ├── get_user_client_id(uuid)
│   ├── is_platform_admin(uuid)
│   ├── user_is_workspace_member(...)
│   └── user_can_manage_workspace(...)
└── Políticas RLS multi-tenant

public.clients
├── Políticas RLS multi-tenant
└── Índices

public.workspace_members
├── Funções SECURITY DEFINER
├── Políticas RLS não-recursivas
└── Índices
```

## Checklist de Validação

Após o push completar, verifique:

- [ ] Tabelas criadas (profiles, clients, contracts, etc.)
- [ ] Colunas adicionadas (client_id em profiles)
- [ ] Funções criadas (get_user_client_id, is_platform_admin)
- [ ] Funções SECURITY DEFINER criadas (user_is_workspace_member)
- [ ] Políticas RLS criadas
- [ ] RLS habilitado em todas as tabelas
- [ ] Índices criados para performance
- [ ] Sem erros de recursão em RLS

## Tempo Estimado

- Migration 01 (Schema): ~2-3 segundos
- Migration 02 (Admin): ~1-2 segundos
- Migration 03 (Multi-tenant): ~3-5 segundos
- Migration 06 (Fix RLS): ~2-3 segundos
- **Total**: ~10-15 segundos

**Tempo total com setup Supabase**: ~30-60 segundos

## Comandos Úteis Enquanto Aguarda

```bash
# Verificar status do Supabase local
supabase status

# Ver conexão com projeto remoto
supabase projects list

# Verificar migrações pendentes
ls -la supabase/migrations/

# Validar estrutura das migrations
node scripts/validate_migrations_applied.ts
```

## Logs Importantes

Procure por:

✅ **Sucesso**:
- "Applying migration 20251023232715_c5ab5bcc..."
- "Applying migration 20251024003233_18f17aaf..."
- "Applying migration 20251024030651_09eccf51..." (COM ; adicionados)
- "Applying migration 20251106000006_fix_workspace_members..." 
- "All done successfully"

❌ **Erro**:
- "syntax error at or near" → erro SQL
- "column ... already exists" → migration executada 2x
- "function ... is not unique" → função duplicada

## Próximos Passos Após Sucesso

### Fase 1: Validação Básica
```bash
node scripts/validate_migrations_applied.ts
```

### Fase 2: Testes Funcionais
```bash
node scripts/test_migration_06_direct.ts
```

### Fase 3: Testes de RLS
```bash
# Verificar que RLS está habilitado
# Verificar que não há recursão infinita
# Testar acesso multi-tenant
```

### Fase 4: Documentação
- Gerar relatório de migrations
- Documentar estrutura final
- Validar compliance com requirements

## Problema: Timeout ou Travamento

Se o comando não completar em 3+ minutos:

```bash
# 1. Cancelar (Ctrl+C)
# 2. Verificar conectividade
ping cpzodtaghdinluovuflg.supabase.co

# 3. Tentar novamente
supabase db push --linked

# 4. Se persistir, fazer reset
supabase db reset --linked --no-seed
supabase db push --linked
```

---

**Documenta**: SmartHubDash Migration Status
**Data**: 2025-11-06
**Versão**: 1.0