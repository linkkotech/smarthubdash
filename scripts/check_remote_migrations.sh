#!/bin/bash

# ============================================================================
# Script de Validação de Migrations Remotas
# ============================================================================
# Este script verifica se as migrations foram aplicadas com sucesso
# no Supabase remoto

set -e

echo ""
echo "╔════════════════════════════════════════════════════════════════╗"
echo "║  VALIDAÇÃO DE MIGRATIONS REMOTAS - SmartHubDash                ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""

# Variáveis de ambiente
PROJECT_ID=$(grep VITE_SUPABASE_PROJECT_ID .env | cut -d'=' -f2 | tr -d '"')
SUPABASE_URL=$(grep VITE_SUPABASE_URL .env | cut -d'=' -f2 | tr -d '"')

echo "📡 Projeto: $PROJECT_ID"
echo "🌐 URL: $SUPABASE_URL"
echo ""

# ============================================================================
# PASSO 1: Verificar status da conexão
# ============================================================================
echo "1️⃣  Verificando status Supabase..."
if supabase projects list | grep -q "$PROJECT_ID"; then
    echo "   ✅ Conexão estabelecida com sucesso"
else
    echo "   ❌ Não foi possível conectar ao projeto"
    exit 1
fi

echo ""

# ============================================================================
# PASSO 2: Validar estrutura das migrations
# ============================================================================
echo "2️⃣  Validando estrutura local das migrations..."
node scripts/validate_migrations_applied.ts

echo ""

# ============================================================================
# PASSO 3: Próximos passos
# ============================================================================
echo "3️⃣  Próximas ações recomendadas:"
echo ""
echo "   # Executar testes de validação da Migration 06"
echo "   $ node scripts/test_migration_06_direct.ts"
echo ""
echo "   # Ver status do banco de dados"
echo "   $ supabase status"
echo ""

echo "╔════════════════════════════════════════════════════════════════╗"
echo "║  ✅ Validação Completada                                       ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""