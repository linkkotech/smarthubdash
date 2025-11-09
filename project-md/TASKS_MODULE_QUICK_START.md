# 🚀 Quick Start - Testando o Módulo de Tarefas

## Pré-requisitos

- ✅ Servidor Vite rodando (`npm run dev`)
- ✅ Supabase conectado e autenticado
- ✅ Workspace criado e autenticado como work_owner

---

## 1️⃣ Acessar o Módulo de Tarefas

1. Faça login na plataforma
2. Acesse seu workspace
3. Navigate para a rota: `/workspace/[workspaceId]/tasks`

**Exemplo:**
```
http://localhost:5173/workspace/abc-123-def/tasks
```

---

## 2️⃣ Testar TasksHeader

### ✅ ToggleGroup - Alternar Visualizações

1. **Clique em "Overview"** (ícone: LayoutGrid)
   - Deve exibir cards de resumo
   - Console deve mostrar: `[TASKS_LAYOUT] Visualização alterada para: overview`

2. **Clique em "List"** (ícone: List)
   - Deve exibir tabela de tarefas
   - Console deve mostrar: `[TASKS_LAYOUT] Visualização alterada para: list`

3. **Clique em "Board"** (ícone: KanbanSquare)
   - Deve exibir Kanban board
   - Console deve mostrar: `[TASKS_LAYOUT] Visualização alterada para: board`

### ✅ Search Input - Buscar Tarefas

1. **Clique no campo de busca** (placeholder: "Buscar tarefas...")
2. **Digite uma palavra-chave:** `projeto`
3. **Verifique:**
   - Console deve mostrar: `[TASKS_LAYOUT] Busca: projeto`
   - Input deve manter o texto digitado

### ✅ Filter Button - Abrir Painel de Filtros

1. **Clique no botão "Filter"** (ícone: Filter)
   - Deve aparecer painel com mensagem de placeholder
   - Console deve mostrar: `[TASKS_LAYOUT] Filtro toggled: true`

2. **Clique novamente**
   - Painel deve desaparecer
   - Console deve mostrar: `[TASKS_LAYOUT] Filtro toggled: false`

### ✅ Nova Tarefa Button

1. **Clique no botão "+ Nova Tarefa"** (ícone: Plus)
   - Console deve mostrar: `[TASKS_LAYOUT] Criar nova tarefa no workspace: [workspace-id]`
   - (Futuramente abrirá modal de criação)

---

## 3️⃣ Testar Visualizações

### 📊 Overview View

**Aparência esperada:**
- Grid com 4 cards (1 por linha em mobile, 4 em desktop)
- Cada card mostra um resumo:
  - ℹ️ Total de Tarefas (placeholder com --)
  - ⚠️ Tarefas em Aberto (amarelo)
  - 👤 Atribuídas a Mim (azul)
  - 🔴 Tarefas Vencidas (vermelho)

### 📋 List View

**Aparência esperada:**
- Tabela com 7 colunas: ID | Título | Responsável | Status | Prioridade | Vencimento | Ações
- 3 linhas de exemplo com dados placeholder (--)
- Rodapé mostrando workspace_id

### 🎯 Board View

**Aparência esperada:**
- 4 colunas: Backlog | Todo | In Progress | Done
- Cada coluna com:
  - Contador de tarefas (placeholder com --)
  - 2 cards de exemplo
  - Botão "+ Adicionar tarefa" no rodapé

---

## 4️⃣ Validações Técnicas

### Verificar Console Browser

Abra o console do navegador (F12) e verifique:

```javascript
// Ao alternar visualizações:
[TASKS_LAYOUT] Visualização alterada para: overview

// Ao buscar:
[TASKS_LAYOUT] Busca: projeto

// Ao alternar filtro:
[TASKS_LAYOUT] Filtro toggled: true
[TASKS_LAYOUT] Filtro toggled: false

// Ao criar nova tarefa:
[TASKS_LAYOUT] Criar nova tarefa no workspace: abc-123-def
```

### Verificar Responsividade

Teste em diferentes tamanhos de tela:

- **Mobile (320px):** TasksHeader com ícones, visualizações em coluna única
- **Tablet (768px):** Grid 2 colunas para cards, tabela ajustada
- **Desktop (1200px):** Layout completo com todas as colunas visíveis

---

## 5️⃣ Testes de Integração com Layout

### Verificar Estado Compartilhado

1. **Abra DevTools React Profiler**
2. **Exporte estado do TasksLayout:**
   ```javascript
   // No console, inspecione o componente TasksLayout
   // Verifique se currentView, searchQuery, filterOpen estão sendo atualizados
   ```

### Verificar Props Passadas

1. **TasksHeader deve receber:**
   - currentView: 'overview' | 'list' | 'board'
   - onViewChange: function
   - onSearch: function
   - onFilter: function
   - onNewTask: function

2. **Children (page.tsx) deve renderizar:**
   - Placeholder com instruções
   - Mostrar workspace_id (futuro)

---

## 6️⃣ Errors Esperados e Soluções

### ❌ "Cannot find module '@/components/modules/tasks'"

**Causa:** Caminho de import incorreto

**Solução:**
```bash
# Reinicie o servidor Vite
npm run dev

# Verifique se o arquivo index.ts existe em src/components/modules/tasks/
ls -la src/components/modules/tasks/
```

### ❌ "ToggleGroup is not a component"

**Causa:** Componente shadcn/ui não instalado

**Solução:**
```bash
npx shadcn-ui@latest add toggle-group
```

### ❌ "Cannot find name 'useParams'"

**Causa:** Import de React Router faltando

**Solução:**
```typescript
import { useParams } from 'react-router-dom';
```

---

## 7️⃣ Próximas Fases

### Fase 2: Integração de Dados
- [ ] Conectar com TanStack Query (useQuery)
- [ ] Buscar tarefas do backend
- [ ] Implementar filtros reais
- [ ] Adicionar busca por título

### Fase 3: Operações CRUD
- [ ] Modal de criação de tarefa
- [ ] Editar tarefa
- [ ] Deletar tarefa
- [ ] Atualizar status

### Fase 4: Recursos Avançados
- [ ] Drag-and-drop no Kanban
- [ ] Filtros avançados
- [ ] Atribuição de tarefas
- [ ] Comentários e anexos

---

## 📊 Checklist de Testes

- [ ] ToggleGroup alterna visualizações corretamente
- [ ] Search input atualiza estado
- [ ] Filter button abre/fecha painel
- [ ] Nova Tarefa button dispara handler
- [ ] Overview View renderiza 4 cards
- [ ] List View renderiza tabela com 7 colunas
- [ ] Board View renderiza 4 colunas Kanban
- [ ] Console mostra logs esperados
- [ ] Sem erros TypeScript
- [ ] Layout responsivo em mobile/tablet/desktop

---

## 🔗 Referências

- **Documentação do Módulo:** `TASKS_MODULE_IMPLEMENTATION.md`
- **Instruções do Projeto:** `copilot-instructions.md`
- **Padrões React:** `src/components/modules/tasks/TasksHeader.tsx`

---

**Última Atualização:** 6 de Novembro de 2025  
**Status:** Pronto para Testes ✅
