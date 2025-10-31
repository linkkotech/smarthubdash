# PLANO DE AÇÃO - BUG: Página em Branco ao Adicionar Usuário

## PROBLEMA
- Clique em "+ Adicionar Usuário" causa recarregamento de página (tela branca)
- Auth user é criado ✅ mas profile NÃO é inserido ❌
- Hipótese: Botão está causando submit não controlado

---

## SOLUÇÃO: 3 ETAPAS DE CÓDIGO

### ETAPA 1: Neutralizar o Gatilho
**Arquivo:** `src/pages/client/Equipe.tsx`

**O que fazer:**
1. Localizar o `useEffect` que define `setConfig` (aprox. linhas 69-88)
2. Encontrar os handlers `onClick` do `primaryAction` (botão "+ Adicionar Usuário") e `secondaryAction`
3. **Ação:** Adicionar `(e) => { e?.preventDefault(); }` ANTES de chamar `setIsAddUserModalOpen(true)`

**Código esperado:**
```tsx
// ANTES:
onClick: () => setIsAddUserModalOpen(true),

// DEPOIS:
onClick: (e) => {
  e?.preventDefault?.();
  setIsAddUserModalOpen(true);
}
```

**Por quê:** Previne que um possível form ancestral capture o evento

---

### ETAPA 2: Garantir o Controle do Formulário
**Arquivo:** `src/components/teams/AddUserDialog.tsx`

**O que fazer:**
1. Localizar a tag `<form>` dentro do componente (aprox. linhas 240-250)
2. Verificar se a tag está com: `<form onSubmit={form.handleSubmit(onSubmit)}>`
3. **Validação:** A sintaxe DEVE ser exatamente assim (react-hook-form + handleSubmit)

**Código esperado:**
```tsx
<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
  {/* campos do formulário */}
</form>
```

**Por quê:** Garante que APENAS o clique em "Salvar Usuário" (type="submit") submete o form

---

### ETAPA 3: Adicionar Visibilidade ao Erro
**Arquivo:** `src/components/teams/AddUserDialog.tsx`

**O que fazer:**
1. Localizar a função `const onSubmit = async (data: AddUserFormData) => { ... }`
2. **Ação A:** Envolver TODO o código dentro dela em um bloco `try...catch` único
3. **Ação B:** No `catch`, adicionar:
   - `console.error('ERRO NA SUBMISSÃO:', error);`
   - `toast.error('Erro ao adicionar usuário: ' + error.message);`

**Código esperado:**
```tsx
const onSubmit = async (data: AddUserFormData) => {
  setIsSubmitting(true);
  
  try {
    // TODO O CÓDIGO ATUAL AQUI (validação, auth, profile insert, etc)
    
    console.log("✅ Usuário criado com sucesso:", newUserId);
    toast.success(`Usuário ${data.userName} adicionado com sucesso!`);
    form.reset();
    onOpenChange(false);
    onSuccess?.();
  } catch (error: any) {
    console.error('ERRO NA SUBMISSÃO:', error);
    toast.error('Erro ao adicionar usuário: ' + (error.message || 'Desconhecido'));
  } finally {
    setIsSubmitting(false);
  }
};
```

**Por quê:** Qualquer erro após Auth user será capturado e exibido no console + toast

---

## RESUMO EXECUTIVO

| Etapa | Arquivo | Mudança | Objetivo |
|-------|---------|---------|----------|
| 1 | Equipe.tsx | Adicionar `preventDefault()` ao onClick | Evitar submit não controlado |
| 2 | AddUserDialog.tsx | Validar `<form onSubmit={handleSubmit(...)}` | Confirmar controle do form |
| 3 | AddUserDialog.tsx | Envolver em `try...catch` + console.error | Capturar e exibir erros |

---

## ESPERADO APÓS IMPLEMENTAÇÃO

✅ Clique no botão → Modal abre (SEM recarregar página)
✅ Preencher form → Dados enviados
✅ Submissão → Auth user criado + Profile inserido
✅ Se erro → Toast mostra mensagem + console mostra erro detalhado

---

## PRÓXIMO PASSO

Após aprovação deste plano, vou:
1. Implementar as 3 mudanças nos respectivos arquivos
2. Compilar com `npm run build`
3. Validar que há 0 erros TypeScript
4. Pronto para teste manual

