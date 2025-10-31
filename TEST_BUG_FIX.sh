#!/bin/bash

# 🚀 SCRIPT DE TESTE - Bug Fix Verification
# Use: bash TEST_BUG_FIX.sh

echo "═══════════════════════════════════════════════════════════"
echo "  🧪 BUG FIX VERIFICATION SCRIPT"
echo "═══════════════════════════════════════════════════════════"
echo ""

# Cores
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Teste 1: Verificar que arquivos foram modificados
echo -e "${YELLOW}[TEST 1] Verificando se arquivos foram modificados...${NC}"
if grep -q 'type="button"' src/components/layout/PageHeader.tsx; then
    echo -e "${GREEN}✅ PageHeader.tsx: type=\"button\" encontrado${NC}"
else
    echo -e "${RED}❌ PageHeader.tsx: type=\"button\" NÃO encontrado${NC}"
fi

if grep -q 'preventDefault' src/pages/client/Equipe.tsx; then
    echo -e "${GREEN}✅ Equipe.tsx: preventDefault encontrado${NC}"
else
    echo -e "${RED}❌ Equipe.tsx: preventDefault NÃO encontrado${NC}"
fi

if grep -q 'operationId' src/components/teams/AddUserDialog.tsx; then
    echo -e "${GREEN}✅ AddUserDialog.tsx: operationId encontrado${NC}"
else
    echo -e "${RED}❌ AddUserDialog.tsx: operationId NÃO encontrado${NC}"
fi

echo ""

# Teste 2: Verificar build
echo -e "${YELLOW}[TEST 2] Compilando projeto...${NC}"
npm run build > /tmp/build.log 2>&1

if grep -q "built in" /tmp/build.log; then
    BUILD_TIME=$(grep "built in" /tmp/build.log | sed 's/.*built in //' | sed 's/s.*//')
    echo -e "${GREEN}✅ Build SUCCESS em ${BUILD_TIME}${NC}"
else
    echo -e "${RED}❌ Build FAILED${NC}"
    cat /tmp/build.log | tail -20
fi

echo ""

# Teste 3: Verificar arquivo de logs
echo -e "${YELLOW}[TEST 3] Verificando documentação...${NC}"
for file in PLANO_CORRECAO_BUG.md RELATORIO_CORRECOES.md GUIA_RAPIDO.md BUG_FIX_MANIFEST.json EVIDENCIA_CORRECOES.md RESUMO_EXECUTIVO.md; do
    if [ -f "$file" ]; then
        echo -e "${GREEN}✅ $file criado${NC}"
    else
        echo -e "${RED}❌ $file NÃO encontrado${NC}"
    fi
done

echo ""
echo "═══════════════════════════════════════════════════════════"
echo -e "${GREEN}✅ TESTES FINALIZADOS${NC}"
echo "═══════════════════════════════════════════════════════════"
echo ""
echo "📋 Próximos passos:"
echo "   1. Abra o navegador em http://localhost:5173/app/equipe"
echo "   2. Abra DevTools (F12) > Console"
echo "   3. Clique em '+ Adicionar Usuário'"
echo "   4. Procure por [op_...] nos logs"
echo "   5. Preencha e envie o formulário"
echo "   6. Verifique toast de sucesso e lista atualizada"
echo ""
