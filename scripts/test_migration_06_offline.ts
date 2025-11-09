/**
 * Script de Teste Offline: Migration 06 - RLS Recursion Fix
 * Descrição: Testar a estrutura do código sem dependências externas
 * Data: 06 de novembro de 2025
 */

import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

/**
 * Testar se os arquivos necessários existem
 */
function testFileStructure() {
  console.log('🔍 Testando estrutura de arquivos...');
  
  const requiredFiles = [
    'scripts/validate_migration_06.sql',
    'scripts/test_migration_06.ts',
    'scripts/rollback_migration_06.sql',
    'scripts/run_migration_06_tests.sh',
    'scripts/README.md',
    'package.json'
  ];
  
  const missingFiles = [];
  
  for (const file of requiredFiles) {
    if (!existsSync(file)) {
      missingFiles.push(file);
    }
  }
  
  if (missingFiles.length > 0) {
    console.error('❌ Arquivos ausentes:', missingFiles);
    return false;
  }
  
  console.log('✅ Todos os arquivos necessários existem');
  return true;
}

/**
 * Testar se o script SQL tem a estrutura correta
 */
function testSQLStructure() {
  console.log('🔍 Testando estrutura do script SQL...');
  
  try {
    const sqlContent = readFileSync('scripts/validate_migration_06.sql', 'utf8');
    
    // Verificar se contém elementos essenciais
    const requiredElements = [
      'user_is_workspace_member',
      'user_can_manage_workspace',
      'workspace_members',
      'EXPLAIN ANALYZE',
      'pg_policies',
      'RELATÓRIO FINAL'
    ];
    
    const missingElements = [];
    
    for (const element of requiredElements) {
      if (!sqlContent.includes(element)) {
        missingElements.push(element);
      }
    }
    
    if (missingElements.length > 0) {
      console.error('❌ Elementos ausentes no SQL:', missingElements);
      return false;
    }
    
    console.log('✅ Script SQL tem estrutura correta');
    return true;
    
  } catch (error) {
    console.error('❌ Erro ao ler script SQL:', error);
    return false;
  }
}

/**
 * Testar se o script TypeScript tem a estrutura correta
 */
function testTSStructure() {
  console.log('🔍 Testando estrutura do script TypeScript...');
  
  try {
    const tsContent = readFileSync('scripts/test_migration_06.ts', 'utf8');
    
    // Verificar se contém elementos essenciais
    const requiredElements = [
      'user_is_workspace_member',
      'user_can_manage_workspace',
      'workspace_members',
      '.rpc(',
      'RLS',
      'performance.now'
    ];
    
    const missingElements = [];
    
    for (const element of requiredElements) {
      if (!tsContent.includes(element)) {
        missingElements.push(element);
      }
    }
    
    if (missingElements.length > 0) {
      console.error('❌ Elementos ausentes no TypeScript:', missingElements);
      return false;
    }
    
    console.log('✅ Script TypeScript tem estrutura correta');
    return true;
    
  } catch (error) {
    console.error('❌ Erro ao ler script TypeScript:', error);
    return false;
  }
}

/**
 * Testar se o script de rollback tem a estrutura correta
 */
function testRollbackStructure() {
  console.log('🔍 Testando estrutura do script de rollback...');
  
  try {
    const rollbackContent = readFileSync('scripts/rollback_migration_06.sql', 'utf8');
    
    // Verificar se contém elementos essenciais
    const requiredElements = [
      'DROP FUNCTION IF EXISTS',
      'DROP POLICY IF EXISTS',
      'CREATE POLICY',
      'ROLLBACK',
      'AVISO'
    ];
    
    const missingElements = [];
    
    for (const element of requiredElements) {
      if (!rollbackContent.includes(element)) {
        missingElements.push(element);
      }
    }
    
    if (missingElements.length > 0) {
      console.error('❌ Elementos ausentes no rollback:', missingElements);
      return false;
    }
    
    console.log('✅ Script de rollback tem estrutura correta');
    return true;
    
  } catch (error) {
    console.error('❌ Erro ao ler script de rollback:', error);
    return false;
  }
}

/**
 * Testar se o package.json tem os scripts necessários
 */
function testPackageJSON() {
  console.log('🔍 Testando scripts no package.json...');
  
  try {
    const packageContent = readFileSync('package.json', 'utf8');
    const packageData = JSON.parse(packageContent);
    
    if (!packageData.scripts) {
      console.error('❌ Seção "scripts" não encontrada no package.json');
      return false;
    }
    
    const requiredScripts = ['test:migration06'];
    const missingScripts = [];
    
    for (const script of requiredScripts) {
      if (!packageData.scripts[script]) {
        missingScripts.push(script);
      }
    }
    
    if (missingScripts.length > 0) {
      console.error('❌ Scripts ausentes no package.json:', missingScripts);
      return false;
    }
    
    console.log('✅ Scripts necessários encontrados no package.json');
    return true;
    
  } catch (error) {
    console.error('❌ Erro ao ler package.json:', error);
    return false;
  }
}

/**
 * Testar se o README tem a estrutura correta
 */
function testREADMEStructure() {
  console.log('🔍 Testando estrutura do README...');
  
  try {
    const readmeContent = readFileSync('scripts/README.md', 'utf8');
    
    // Verificar se contém elementos essenciais
    const requiredElements = [
      'validate_migration_06.sql',
      'test_migration_06.ts',
      'rollback_migration_06.sql',
      'run_migration_06_tests.sh',
      'Métricas de Sucesso',
      'Problemas Comuns'
    ];
    
    const missingElements = [];
    
    for (const element of requiredElements) {
      if (!readmeContent.includes(element)) {
        missingElements.push(element);
      }
    }
    
    if (missingElements.length > 0) {
      console.error('❌ Elementos ausentes no README:', missingElements);
      return false;
    }
    
    console.log('✅ README tem estrutura correta');
    return true;
    
  } catch (error) {
    console.error('❌ Erro ao ler README:', error);
    return false;
  }
}

/**
 * Função principal de teste
 */
function main() {
  console.log('🚀 Iniciando teste offline da Migration 06 - RLS Recursion Fix');
  console.log('================================================================');
  
  const results = {
    fileStructure: false,
    sqlStructure: false,
    tsStructure: false,
    rollbackStructure: false,
    packageJSON: false,
    readmeStructure: false
  };
  
  // Testar estrutura de arquivos
  results.fileStructure = testFileStructure();
  
  // Testar scripts
  results.sqlStructure = testSQLStructure();
  results.tsStructure = testTSStructure();
  results.rollbackStructure = testRollbackStructure();
  
  // Testar configuração
  results.packageJSON = testPackageJSON();
  results.readmeStructure = testREADMEStructure();
  
  // Relatório final
  console.log('\n📊 RELATÓRIO FINAL DE TESTE OFFLINE');
  console.log('=====================================');
  console.log('✅ Estrutura de arquivos:', results.fileStructure ? 'PASS' : 'FAIL');
  console.log('✅ Script SQL:', results.sqlStructure ? 'PASS' : 'FAIL');
  console.log('✅ Script TypeScript:', results.tsStructure ? 'PASS' : 'FAIL');
  console.log('✅ Script de rollback:', results.rollbackStructure ? 'PASS' : 'FAIL');
  console.log('✅ Package.json:', results.packageJSON ? 'PASS' : 'FAIL');
  console.log('✅ README:', results.readmeStructure ? 'PASS' : 'FAIL');
  
  const allPassed = Object.values(results).every(result => result);
  
  if (allPassed) {
    console.log('\n🎉 TODOS OS TESTES OFFLINE PASSARAM - ESTRUTURA PRONTA PARA PRODUÇÃO');
    console.log('\n📝 Próximos passos:');
    console.log('1. Instalar Docker Desktop');
    console.log('2. Executar: supabase start');
    console.log('3. Executar: supabase db reset');
    console.log('4. Executar: npm run test:migration06');
    process.exit(0);
  } else {
    console.log('\n❌ ALGUNS TESTES OFFLINE FALHARAM - VERIFICAR A ESTRUTURA');
    process.exit(1);
  }
}

// Executar teste
try {
  main();
} catch (error) {
  console.error('❌ Erro fatal:', error);
  process.exit(1);
}