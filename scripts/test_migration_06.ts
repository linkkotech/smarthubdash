/**
 * Script de Teste: Migration 06 - RLS Recursion Fix
 * Descrição: Testar se a recursão infinita foi resolvida
 * Data: 06 de novembro de 2025
 */

import { createClient } from '@supabase/supabase-js';

// Configuração do Supabase - usar variáveis de ambiente ou valores padrão
const supabaseUrl = import.meta.env?.VITE_SUPABASE_URL || 'http://localhost:54321';
const supabaseKey = import.meta.env?.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I';

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variáveis de ambiente não configuradas');
  console.log('Usando valores padrão para desenvolvimento');
}

const supabase = createClient(supabaseUrl, supabaseKey);

/**
 * Testar se a função user_is_workspace_member existe e funciona
 */
async function testUserIsWorkspaceMember() {
  console.log('🔍 Testando função user_is_workspace_member...');
  
  try {
    // Criar um workspace de teste
    const { data: workspace, error: workspaceError } = await supabase
      .from('workspaces')
      .insert({
        name: 'Test Workspace for Migration 06',
        slug: 'test-migration-06'
      })
      .select()
      .single();
    
    if (workspaceError) {
      console.error('❌ Erro ao criar workspace:', workspaceError);
      return false;
    }
    
    console.log('✅ Workspace criado:', workspace.id);
    
    // Criar um usuário de teste
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .insert({
        full_name: 'Test User',
        email: 'test@example.com'
      })
      .select()
      .single();
    
    if (profileError) {
      console.error('❌ Erro ao criar perfil:', profileError);
      return false;
    }
    
    console.log('✅ Perfil criado:', profile.id);
    
    // Adicionar usuário como membro do workspace
    const { error: memberError } = await supabase
      .from('workspace_members')
      .insert({
        workspace_id: workspace.id,
        profile_id: profile.id,
        role: 'user'
      });
    
    if (memberError) {
      console.error('❌ Erro ao adicionar membro:', memberError);
      return false;
    }
    
    console.log('✅ Membro adicionado ao workspace');
    
    // Testar a função user_is_workspace_member via RPC
    const { data: isMember, error: rpcError } = await supabase
      .rpc('user_is_workspace_member', {
        _user_id: profile.id,
        _workspace_id: workspace.id
      });
    
    if (rpcError) {
      console.error('❌ Erro ao chamar RPC:', rpcError);
      return false;
    }
    
    console.log('✅ user_is_workspace_member result:', isMember);
    
    // Testar a função user_can_manage_workspace via RPC
    const { data: canManage, error: manageError } = await supabase
      .rpc('user_can_manage_workspace', {
        _user_id: profile.id,
        _workspace_id: workspace.id
      });
    
    if (manageError) {
      console.error('❌ Erro ao chamar RPC user_can_manage_workspace:', manageError);
      return false;
    }
    
    console.log('✅ user_can_manage_workspace result:', canManage);
    
    // Limpar dados de teste
    await supabase
      .from('workspace_members')
      .delete()
      .eq('workspace_id', workspace.id);
    
    await supabase
      .from('workspaces')
      .delete()
      .eq('id', workspace.id);
    
    await supabase
      .from('profiles')
      .delete()
      .eq('id', profile.id);
    
    console.log('✅ Dados de teste limpos');
    
    return isMember === true && canManage === false;
    
  } catch (error) {
    console.error('❌ Erro inesperado:', error);
    return false;
  }
}

/**
 * Testar se as políticas RLS estão funcionando corretamente
 */
async function testRLSPolicies() {
  console.log('🔍 Testando políticas RLS...');
  
  try {
    // Criar workspace de teste
    const { data: workspace, error: workspaceError } = await supabase
      .from('workspaces')
      .insert({
        name: 'Test Workspace RLS',
        slug: 'test-rls-policies'
      })
      .select()
      .single();
    
    if (workspaceError) {
      console.error('❌ Erro ao criar workspace:', workspaceError);
      return false;
    }
    
    console.log('✅ Workspace criado para teste RLS:', workspace.id);
    
    // Testar se um usuário não autenticado pode acessar workspace_members
    // Isso deve falhar devido às políticas RLS
    const { data: unauthorizedData, error: unauthorizedError } = await supabase
      .from('workspace_members')
      .select('*')
      .eq('workspace_id', workspace.id);
    
    // Se não houver erro, isso indica que as políticas não estão funcionando
    if (!unauthorizedError && unauthorizedData) {
      console.error('❌ Política RLS não está funcionando - usuário não autenticado acessou dados');
      return false;
    }
    
    console.log('✅ Política RLS funcionando - acesso não autorizado bloqueado');
    
    // Limpar dados de teste
    await supabase
      .from('workspaces')
      .delete()
      .eq('id', workspace.id);
    
    return true;
    
  } catch (error) {
    console.error('❌ Erro no teste RLS:', error);
    return false;
  }
}

/**
 * Testar performance da query que causava recursão
 */
async function testQueryPerformance() {
  console.log('🔍 Testando performance da query...');
  
  try {
    // Criar dados de teste
    const { data: workspace, error: workspaceError } = await supabase
      .from('workspaces')
      .insert({
        name: 'Test Performance',
        slug: 'test-performance'
      })
      .select()
      .single();
    
    if (workspaceError) {
      console.error('❌ Erro ao criar workspace:', workspaceError);
      return false;
    }
    
    // Criar múltiplos membros para teste de performance
    const members = [];
    for (let i = 0; i < 10; i++) {
      const { data: profile } = await supabase
        .from('profiles')
        .insert({
          full_name: `Test User ${i}`,
          email: `test${i}@example.com`
        })
        .select()
        .single();
      
      members.push(profile.id);
      
      await supabase
        .from('workspace_members')
        .insert({
          workspace_id: workspace.id,
          profile_id: profile.id,
          role: 'user'
        });
    }
    
    console.log('✅ Dados de performance criados:', members.length, 'membros');
    
    // Medir tempo da query
    const startTime = performance.now();
    
    const { data, error } = await supabase
      .from('workspace_members')
      .select(`
        *,
        profiles!workspace_members_profile_id_fkey (
          full_name,
          email
        )
      `)
      .eq('workspace_id', workspace.id);
    
    const endTime = performance.now();
    const duration = endTime - startTime;
    
    if (error) {
      console.error('❌ Erro na query de performance:', error);
      return false;
    }
    
    console.log(`✅ Query executada em ${duration.toFixed(2)}ms`);
    console.log(`✅ Resultados: ${data?.length || 0} membros encontrados`);
    
    // Verificar se a performance é aceitável (< 100ms)
    if (duration > 100) {
      console.warn('⚠️ Performance abaixo do ideal:', duration.toFixed(2), 'ms');
    } else {
      console.log('✅ Performance aceitável:', duration.toFixed(2), 'ms');
    }
    
    // Limpar dados de teste
    await supabase
      .from('workspace_members')
      .delete()
      .eq('workspace_id', workspace.id);
    
    await supabase
      .from('workspaces')
      .delete()
      .eq('id', workspace.id);
    
    return duration < 100;
    
  } catch (error) {
    console.error('❌ Erro no teste de performance:', error);
    return false;
  }
}

/**
 * Função principal de teste
 */
async function main() {
  console.log('🚀 Iniciando teste da Migration 06 - RLS Recursion Fix');
  console.log('=====================================================');
  
  const results = {
    userIsWorkspaceMember: false,
    rlsPolicies: false,
    queryPerformance: false
  };
  
  // Testar função user_is_workspace_member
  results.userIsWorkspaceMember = await testUserIsWorkspaceMember();
  
  // Testar políticas RLS
  results.rlsPolicies = await testRLSPolicies();
  
  // Testar performance
  results.queryPerformance = await testQueryPerformance();
  
  // Relatório final
  console.log('\n📊 RELATÓRIO FINAL DE TESTE');
  console.log('============================');
  console.log('✅ user_is_workspace_member:', results.userIsWorkspaceMember ? 'PASS' : 'FAIL');
  console.log('✅ RLS Policies:', results.rlsPolicies ? 'PASS' : 'FAIL');
  console.log('✅ Query Performance:', results.queryPerformance ? 'PASS' : 'FAIL');
  
  const allPassed = Object.values(results).every(result => result);
  
  if (allPassed) {
    console.log('\n🎉 TODOS OS TESTES PASSARAM - MIGRATION 06 ESTÁ FUNCIONANDO CORRETAMENTE');
    process.exit(0);
  } else {
    console.log('\n❌ ALGUNS TESTES FALHARAM - MIGRATION 06 PRECISA DE CORREÇÃO');
    process.exit(1);
  }
}

// Executar teste
main().catch(error => {
  console.error('❌ Erro fatal:', error);
  process.exit(1);
});