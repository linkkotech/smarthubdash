# 🐛 PLANO DE CORREÇÃO - Bug: Página em Branco ao Adicionar Usuário

## Análise do Problema

### Sintomas Observados
1. ✗ Tela fica em branco ao clicar "+ Adicionar Usuário"
2. ✗ Usuário é criado no Supabase Auth (primeira etapa funciona)
3. ✗ Perfil NÃO é inserido em `profiles` (segunda etapa falha)
4. ✗ Recarregamento implícito da página

### Raiz Provável do Problema

**PROBLEMA 1: Botão sem atributo `type="button"`**
- Arquivo: `src/components/layout/PageHeader.tsx` (linhas ~92-98)
- Problema: Componente `Button` do Shadcn não define `type="button"` explicitamente
- Impacto: Se o `Button` estiver dentro de um contexto de form (ou em uma página que later monta um form), pode não ter comportamento de botão
- Solução: Adicionar `type="button"` explícito aos botões de ação

**PROBLEMA 2: Sem preventDefault no onClick**
- Arquivo: `src/pages/client/Equipe.tsx` (linha 75)
- Problema: O handler `() => setIsAddUserModalOpen(true)` não previne comportamento padrão
- Impacto: Se houver um form ancestral, o clique pode disparar um submit
- Solução: Adicionar `(e) => { e.preventDefault(); setIsAddUserModalOpen(true); }`

**PROBLEMA 3: Form no AddUserDialog sem proteção**
- Arquivo: `src/components/teams/AddUserDialog.tsx` (linha 241)
- Problema: A chamada `form.handleSubmit(onSubmit)` está correta, MAS falta tratamento de erro robusto
- Impacto: Se algo der errado antes do perfil ser criado, não há feedback claro
- Solução: Adicionar logs detalhados e melhorar error handling

**PROBLEMA 4: Sem validação de RLS antes do insert**
- Arquivo: Database/RLS policies
- Problema: A política RLS pode estar rejeitando o INSERT silenciosamente
- Impacto: O insert falha mas a resposta de erro não é capturada corretamente
- Solução: Verificar se a política RLS permite INSERT para este usuário

---

## 🔧 PLANO DE EXECUÇÃO (4 ETAPAS)

### ETAPA 1: Corrigir PageHeader.tsx
**Arquivo:** `src/components/layout/PageHeader.tsx`

**O que fazer:**
- Adicionar `type="button"` aos botões de ação primária e secundária
- Verificar se há um form ancestral que possa estar afetando

**Mudanças:**
```tsx
// ANTES (linhas ~92-98):
<Button
  onClick={primaryAction.onClick}
  variant={primaryAction.variant || "default"}
  size="sm"
  disabled={primaryAction.disabled}
  className="gap-2"
>

// DEPOIS:
<Button
  type="button"  // ← ADICIONAR ISSO
  onClick={primaryAction.onClick}
  variant={primaryAction.variant || "default"}
  size="sm"
  disabled={primaryAction.disabled}
  className="gap-2"
>
```

**Status:** ⏳ Pendente

---

### ETAPA 2: Corrigir Equipe.tsx - Handler do Botão
**Arquivo:** `src/pages/client/Equipe.tsx`

**O que fazer:**
- Adicionar `preventDefault()` ao handler do botão de adicionar usuário
- Adicionar `event` como parâmetro

**Mudanças:**
```tsx
// ANTES (linha 75):
onClick: () => setIsAddUserModalOpen(true),

// DEPOIS:
onClick: (event?: React.MouseEvent) => {
  event?.preventDefault();
  setIsAddUserModalOpen(true);
},
```

**Status:** ⏳ Pendente

---

### ETAPA 3: Fortalecer Error Handling em AddUserDialog.tsx
**Arquivo:** `src/components/teams/AddUserDialog.tsx`

**O que fazer:**
1. Adicionar logging detalhado em cada etapa
2. Melhorar tratamento de erros
3. Validar permissions antes de tentar insert
4. Adicionar retry logic se necessário

**Mudanças principais:**
```tsx
const onSubmit = async (data: AddUserFormData) => {
  setIsSubmitting(true);
  const operationId = `op_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
  
  try {
    console.log(`[${operationId}] ✅ Iniciando criação de usuário para:`, data.userEmail);
    
    if (!user?.id || !clientId) {
      console.error(`[${operationId}] ❌ Falha na validação inicial`);
      toast.error("Usuário não autenticado");
      return;
    }

    // ETAPA 1: Auth Signup
    console.log(`[${operationId}] 📝 Etapa 1: Criando Auth user...`);
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: data.userEmail,
      password: Math.random().toString(36).slice(-12) + "!Aa1",
    });

    if (authError) {
      console.error(`[${operationId}] ❌ Erro no Auth:`, authError);
      toast.error("Erro ao criar usuário: " + authError.message);
      return;
    }

    if (!authData.user?.id) {
      console.error(`[${operationId}] ❌ Auth user criado mas sem ID`);
      toast.error("Erro: Usuário criado mas sem ID");
      return;
    }

    const newUserId = authData.user.id;
    console.log(`[${operationId}] ✅ Auth user criado:`, newUserId);

    // ETAPA 2: Profile Insert
    console.log(`[${operationId}] 📝 Etapa 2: Inserindo profile...`);
    const profileData = {
      id: newUserId,
      full_name: data.userName,
      email: data.userEmail,
      client_id: clientId,
      client_user_role: 
        data.userRole === "admin" ? "client_admin" : 
        data.userRole === "manager" ? "client_manager" : 
        "client_user",
      unidade: data.unidade || null,
      team_id: data.teamId || null,
      status: data.userStatus === "active" ? "ativo" : "inativo",
    };

    console.log(`[${operationId}] 📤 Payload do profile:`, profileData);

    const { error: profileError, data: insertedData } = await supabase
      .from("profiles")
      .insert([profileData]);

    if (profileError) {
      console.error(`[${operationId}] ❌ Erro ao inserir profile:`, profileError);
      console.error(`[${operationId}] 🔧 Código do erro:`, profileError.code);
      console.error(`[${operationId}] 🔧 Mensagem:`, profileError.message);
      console.error(`[${operationId}] 🔧 Detalhes:`, profileError.details);
      
      // Rollback: Deletar Auth user
      console.log(`[${operationId}] 🔄 Iniciando rollback...`);
      const { error: deleteError } = await supabase.auth.admin.deleteUser(newUserId);
      if (deleteError) {
        console.error(`[${operationId}] ⚠️ AVISO: Não foi possível deletar Auth user!`, deleteError);
      } else {
        console.log(`[${operationId}] ✅ Auth user deletado com sucesso (rollback)`);
      }
      
      toast.error("Erro ao criar perfil: " + profileError.message);
      return;
    }

    console.log(`[${operationId}] ✅ Profile inserido com sucesso:`, insertedData);
    console.log(`[${operationId}] ✅ Usuário criado completamente!`);
    
    toast.success(`Usuário ${data.userName} adicionado com sucesso!`);
    
    // Reset form
    form.reset();
    onOpenChange(false);
    onSuccess?.();

  } catch (error: any) {
    console.error(`[operationId] 💥 ERRO NÃO TRATADO:`, error);
    toast.error("Erro ao adicionar usuário: " + (error.message || "Desconhecido"));
  } finally {
    setIsSubmitting(false);
  }
};
```

**Status:** ⏳ Pendente

---

### ETAPA 4: Validar Políticas RLS
**Arquivo:** Database (Supabase)

**O que fazer:**
1. Verificar se o usuário logado tem permissão para INSERT em `profiles`
2. Confirmar que a política RLS permite a operação
3. Se necessário, ajustar as políticas

**Comando para testar:**
```sql
-- Verificar se a política está permitindo INSERT
SELECT * FROM pg_policies WHERE tablename = 'profiles';

-- Verificar se o usuário atual tem acesso
SELECT auth.uid(), public.get_user_client_id(auth.uid());

-- Testar INSERT com mock
INSERT INTO public.profiles (
  id, 
  full_name, 
  email, 
  client_id, 
  client_user_role, 
  status
) VALUES (
  gen_random_uuid(),
  'Test User',
  'test@test.com',
  'client_id_aqui',
  'client_user',
  'ativo'
);
```

**Status:** ⏳ Pendente

---

## 📋 CHECKLIST DE EXECUÇÃO

### Fase 1: Correções de Frontend
- [ ] ETAPA 1: Adicionar `type="button"` em PageHeader.tsx
- [ ] ETAPA 2: Adicionar `preventDefault()` em Equipe.tsx
- [ ] ETAPA 3: Reforçar error handling em AddUserDialog.tsx
- [ ] Testar compilação: `npm run build`
- [ ] Testar localmente: abrir modal e clicar em "Adicionar Usuário"

### Fase 2: Validação de Database
- [ ] ETAPA 4: Verificar políticas RLS no Supabase
- [ ] Executar testes de INSERT manual
- [ ] Confirmar que usuário logado tem permissões

### Fase 3: Teste End-to-End
- [ ] Adicionar novo usuário pelo formulário
- [ ] Verificar console.logs detalhados
- [ ] Confirmar que Auth user foi criado
- [ ] Confirmar que Profile foi inserido
- [ ] Verificar que lista de membros se atualiza
- [ ] Verificar que não há recarregamento da página

---

## 🔍 INDICADORES DE SUCESSO

✅ Não há recarregamento de página ao clicar "+ Adicionar Usuário"
✅ Modal abre corretamente
✅ Formulário é preenchido e submetido
✅ Auth user é criado em Supabase Auth
✅ Profile é criado em `profiles` table
✅ Toast de sucesso é exibido
✅ Modal fecha automaticamente
✅ Lista de membros se atualiza sem refresh da página
✅ Console mostra logs com operation_id rastreando o fluxo

---

## 🚨 ALERTAS E ARMADILHAS

⚠️ **NÃO fazer:** Modificar a estrutura do formulário sem testar
⚠️ **NÃO fazer:** Ignorar logs de erro do console
⚠️ **NÃO fazer:** Fazer rollback sem confirmar qual etapa falhou
⚠️ **NÃO fazer:** Deixar usuários "fantasmas" no Auth sem perfil

---

## 📞 PRÓXIMOS PASSOS

Após aplicar todas as correções:
1. Executar `npm run build` para validar TypeScript
2. Testar manualmente adicionando novo usuário
3. Abrir DevTools > Console para ver os logs detalhados
4. Verificar Supabase > Auth e Database para confirmar dados
5. Se ainda falhar, compartilhar os logs do console

