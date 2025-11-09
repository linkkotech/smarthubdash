#!/bin/bash

# =================================================================
# SCRIPT DE EXECUÇÃO: Migration 06 - RLS Recursion Fix Tests
# =================================================================
# Data: 06 de novembro de 2025
# Descrição: Executa todos os testes para validar a migration 06
# =================================================================

set -e  # Parar em caso de erro

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Funções de log
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Verificar se estamos no diretório correto
if [ ! -f "package.json" ]; then
    log_error "Arquivo package.json não encontrado. Execute este script no diretório raiz do projeto."
    exit 1
fi

# Verificar dependências
log_info "Verificando dependências..."
if ! command -v node &> /dev/null; then
    log_error "Node.js não encontrado. Instale Node.js para continuar."
    exit 1
fi

if ! command -v psql &> /dev/null; then
    log_warning "psql não encontrado. Os testes SQL serão pulados."
    SQL_TESTS_AVAILABLE=false
else
    SQL_TESTS_AVAILABLE=true
fi

# Verificar Supabase CLI
if ! command -v supabase &> /dev/null; then
    log_warning "Supabase CLI não encontrado. Usando variáveis de ambiente."
    SUPABASE_CLI_AVAILABLE=false
else
    SUPABASE_CLI_AVAILABLE=true
fi

# Função para executar testes SQL
run_sql_tests() {
    log_info "Executando testes SQL..."
    
    if [ "$SQL_TESTS_AVAILABLE" = false ]; then
        log_warning "Pulando testes SQL - psql não disponível."
        return 0
    fi
    
    # Verificar se o arquivo existe
    if [ ! -f "scripts/validate_migration_06.sql" ]; then
        log_error "Arquivo validate_migration_06.sql não encontrado."
        return 1
    fi
    
    # Executar testes SQL
    log_info "Executando validate_migration_06.sql..."
    
    # Tentar obter URL do Supabase
    if [ "$SUPABASE_CLI_AVAILABLE" = true ]; then
        SUPABASE_URL=$(supabase status --output json | grep -o '"db_url":"[^"]*"' | cut -d'"' -f4)
        if [ -n "$SUPABASE_URL" ]; then
            log_info "Usando Supabase CLI para conectar ao banco..."
            psql "$SUPABASE_URL" -f scripts/validate_migration_06.sql
        else
            log_warning "Não foi possível obter URL do Supabase via CLI."
        fi
    fi
    
    # Se não conseguiu via CLI, tentar variáveis de ambiente
    if [ -z "$SUPABASE_URL" ]; then
        if [ -n "$SUPABASE_DB_URL" ]; then
            log_info "Usando variável de ambiente SUPABASE_DB_URL..."
            psql "$SUPABASE_DB_URL" -f scripts/validate_migration_06.sql
        else
            log_error "Nenhuma URL do banco de encontrada. Defina SUPABASE_DB_URL ou instale Supabase CLI."
            return 1
        fi
    fi
    
    log_success "Testes SQL executados com sucesso."
}

# Função para executar testes TypeScript
run_ts_tests() {
    log_info "Executando testes TypeScript..."
    
    if [ ! -f "scripts/test_migration_06.ts" ]; then
        log_error "Arquivo test_migration_06.ts não encontrado."
        return 1
    fi
    
    # Verificar se o script pode ser executado
    if ! node scripts/test_migration_06.ts; then
        log_error "Testes TypeScript falharam."
        return 1
    fi
    
    log_success "Testes TypeScript executados com sucesso."
}

# Função para verificar se o rollback está disponível
check_rollback_available() {
    log_info "Verificando script de rollback..."
    
    if [ -f "scripts/rollback_migration_06.sql" ]; then
        log_success "Script de rollback disponível."
        return 0
    else
        log_warning "Script de rollback não encontrado."
        return 1
    fi
}

# Função principal
main() {
    echo "================================================================="
    echo "EXECUTANDO TESTES - Migration 06 - RLS Recursion Fix"
    echo "================================================================="
    echo "Data: $(date)"
    echo "================================================================="
    
    # Executar testes
    SQL_SUCCESS=true
    TS_SUCCESS=true
    
    # Testes SQL
    if ! run_sql_tests; then
        SQL_SUCCESS=false
    fi
    
    echo ""
    
    # Testes TypeScript
    if ! run_ts_tests; then
        TS_SUCCESS=false
    fi
    
    echo ""
    
    # Verificar rollback
    ROLLBACK_AVAILABLE=false
    if check_rollback_available; then
        ROLLBACK_AVAILABLE=true
    fi
    
    # Relatório final
    echo "================================================================="
    echo "RELATÓRIO FINAL DE TESTES"
    echo "================================================================="
    
    if [ "$SQL_SUCCESS" = true ]; then
        log_success "✅ Testes SQL: PASS"
    else
        log_error "❌ Testes SQL: FAIL"
    fi
    
    if [ "$TS_SUCCESS" = true ]; then
        log_success "✅ Testes TypeScript: PASS"
    else
        log_error "❌ Testes TypeScript: FAIL"
    fi
    
    if [ "$ROLLBACK_AVAILABLE" = true ]; then
        log_success "✅ Script de rollback: DISPONÍVEL"
    else
        log_warning "❌ Script de rollback: NÃO DISPONÍVEL"
    fi
    
    # Determinar resultado geral
    if [ "$SQL_SUCCESS" = true ] && [ "$TS_SUCCESS" = true ]; then
        echo ""
        log_success "🎉 TODOS OS TESTES PASSARAM - MIGRATION 06 ESTÁ FUNCIONANDO CORRETAMENTE"
        exit 0
    else
        echo ""
        log_error "❌ ALGUNS TESTES FALHARAM - MIGRATION 06 PRECISA DE CORREÇÃO"
        
        if [ "$ROLLBACK_AVAILABLE" = true ]; then
            echo ""
            log_warning "⚠️ Script de rollback disponível para emergências."
            echo "   Execute: psql \$SUPABASE_DB_URL -f scripts/rollback_migration_06.sql"
        fi
        
        exit 1
    fi
}

# Executar função principal
main