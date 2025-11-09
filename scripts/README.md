# Scripts de Validação - Migration 06

Este diretório contém scripts para validar a Migration 06 (RLS Recursion Fix) do SmartHubDash.

## 📁 Arquivos

### 1. `validate_migration_06.sql`
Script SQL para validar a migration no banco de dados.

**Como usar:**
```bash
# Conectar ao banco de dados
psql $SUPABASE_URL -f scripts/validate_migration_06.sql
```

**O que faz:**
- ✅ Verifica se as funções SECURITY DEFINER existem
- ✅ Testa a função `user_is_workspace_member`
- ✅ Verifica as políticas RLS atuais
- ✅ Testa query que causava recursão
- ✅ Verifica performance da query
- ✅ Testa permissões de acesso
- ✅ Verifica integridade dos dados
- ✅ Gera relatório final

### 2. `test_migration_06.ts`
Script TypeScript para testar a migration no ambiente de desenvolvimento.

**Como usar:**
```bash
# Instalar dependências
npm install @supabase/supabase-js

# Rodar o script
npm run test:migration06
# ou
node scripts/test_migration_06.ts
```

**Variáveis de ambiente (opcionais):**
```bash
VITE_SUPABASE_URL=http://localhost:54321
VITE_SUPABASE_ANON_KEY=seu_anon_key_aqui
```

**O que faz:**
- ✅ Testa a função `user_is_workspace_member` via RPC
- ✅ Testa a função `user_can_manage_workspace` via RPC
- ✅ Verifica se políticas RLS bloqueam acesso não autorizado
- ✅ Testa performance da query com dados reais
- ✅ Gera relatório final com resultados

### 3. `rollback_migration_06.sql`
Script SQL para reverter a migration 06 em caso de problemas.

**⚠️ ATENÇÃO: Use apenas em emergência!**

**Como usar:**
```bash
# Conectar ao banco de dados
psql $SUPABASE_URL -f scripts/rollback_migration_06.sql
```

**O que faz:**
- ❌ Remove funções SECURITY DEFINER
- ❌ Remove políticas RLS complexas
- ❌ Recria políticas simplificadas
- ❌ Remove triggers relacionados
- ❌ Testa se o rollback funcionou
- ❌ Gera relatório final

## 🚀 Execução dos Testes

### Passo 1: Validar SQL
```bash
# Conectar ao Supabase CLI
supabase db shell

# Executar script SQL
\i scripts/validate_migration_06.sql
```

### Passo 2: Validar TypeScript
```bash
# Rodar script de teste
npm run test:migration06
```

### Passo 3: Interpretar Resultados

#### Resultados Esperados:
- ✅ **Funções SECURITY DEFINER**: 2 encontradas
- ✅ **Políticas RLS**: > 0 encontradas
- ✅ **Performance**: < 100ms
- ✅ **Integridade de dados**: OK
- ✅ **Acesso não autorizado**: Bloqueado

#### Resultados Problemáticos:
- ❌ **Funções SECURITY DEFINER**: 0 encontradas
- ❌ **Políticas RLS**: 0 encontradas
- ❌ **Performance**: > 100ms
- ❌ **Integridade de dados**: Problemas encontrados
- ❌ **Acesso não autorizado**: Permitido

## 🔧 Configuração

### Variáveis de Ambiente
Crie um arquivo `.env.local` na pasta `scripts`:
```env
VITE_SUPABASE_URL=http://localhost:54321
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Dependências
```bash
npm install @supabase/supabase-js
```

## 📊 Métricas de Sucesso

| Teste | Critério | Status |
|-------|----------|--------|
| Funções SECURITY DEFINER | 2 encontradas | ✅ |
| Políticas RLS | > 0 encontradas | ✅ |
| Performance | < 100ms | ✅ |
| Integridade de dados | Sem registros órfãos | ✅ |
| Acesso não autorizado | Bloqueado | ✅ |

## 🚨 Problemas Comuns

### 1. Funções SECURITY DEFINER não encontradas
**Solução:** Verificar se a migration 06 foi aplicada corretamente.

### 2. Performance lenta
**Solução:** Verificar se os índices necessários foram criados.

### 3. Acesso não autorizado permitido
**Solução:** Verificar se as políticas RLS estão ativas.

### 4. Problemas de integridade de dados
**Solução:** Executar script de correção de dados órfãos.

### 4. `run_migration_06_tests.sh`
Script shell para executar todos os testes de migration 06 automaticamente.

**Como usar:**
```bash
# Dar permissão de execução (Linux/macOS)
chmod +x scripts/run_migration_06_tests.sh

# Executar script
./scripts/run_migration_06_tests.sh

# Ou via npm
npm run test:migration06
```

**O que faz:**
- ✅ Verifica dependências (Node.js, psql, Supabase CLI)
- ✅ Executa testes SQL
- ✅ Executa testes TypeScript
- ✅ Verifica disponibilidade de rollback
- ✅ Gera relatório final
- ✅ Determina se migration 06 está funcionando

## 🚀 Execução Completa dos Testes

### Método 1: Script Automatizado (Recomendado)
```bash
# Executar todos os testes
./scripts/run_migration_06_tests.sh
```

### Método 2: Manual
```bash
# 1. Testes SQL
psql $SUPABASE_DB_URL -f scripts/validate_migration_06.sql

# 2. Testes TypeScript
npm run test:migration06

# 3. Verificar rollback (opcional)
psql $SUPABASE_DB_URL -f scripts/rollback_migration_06.sql
```

### Método 3: Via npm
```bash
# Executar testes via npm
npm run test:migration06
```

## 📞 Suporte

Se encontrar problemas com os scripts:
1. Verifique se as migrations foram aplicadas
2. Confirme as variáveis de ambiente
3. Verifique as permissões do banco de dados
4. Consulte o log de erros do Supabase
5. Use o script de rollback em emergências

---

**Última Atualização:** 06 de novembro de 2025
**Versão:** 1.0.0