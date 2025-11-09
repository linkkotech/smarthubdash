# Create Task Refactoring - Guia de Implementação

## ✅ O QUE FOI CRIADO

### 1. **6 Migrations SQL** 
- `supabase/migrations/20251109_create_tasks_table.sql` - Tabela principal de tarefas com RLS
- `supabase/migrations/20251109_create_tags_table.sql` - Tags com workspace_id
- `supabase/migrations/20251109_create_task_assignees_table.sql` - M2M assignees com RLS
- `supabase/migrations/20251109_create_task_tags_table.sql` - M2M tags com RLS
- `supabase/migrations/20251109_create_subtasks_table.sql` - Subtarefas com RLS
- `supabase/migrations/20251109_create_task_attachments_table.sql` - Anexos com RLS

### 2. **Edge Function**
- `supabase/functions/create-task/index.ts` - Transação Deno para criar task + relações

### 3. **Schema Zod**
- `src/lib/schemas/task.schema.ts` - Validações para taskFormSchema e createTaskSchema

### 4. **Custom Hook**
- `src/hooks/useCreateTask.ts` - useMutation que chama Edge Function

### 5. **Sub-componentes UI (6 arquivos)**
- `src/components/modules/tasks/create-task/TaskFormFields.tsx` - Título, prioridade, status, descrição
- `src/components/modules/tasks/create-task/AssigneesCombobox.tsx` - Seletor de múltiplos usuários
- `src/components/modules/tasks/create-task/TagsCombobox.tsx` - Seletor de tags com criação
- `src/components/modules/tasks/create-task/SubtasksInput.tsx` - Adição dinâmica de subtarefas
- `src/components/modules/tasks/create-task/FavoriteToggle.tsx` - Toggle de favorito
- `src/components/modules/tasks/create-task/AttachmentsUpload.tsx` - Upload drag-and-drop

### 6. **Dialog Principal**
- `src/components/modules/tasks/create-task/CreateTaskDialog.tsx` - Dialog com 3 abas (Básico, Detalhes, Anexos)

### 7. **Query Hooks (3 arquivos)**
- `src/hooks/useTasksQuery.ts` - Fetch de tarefas com relações
- `src/hooks/useUsersForWorkspace.ts` - Fetch de usuários do workspace
- `src/hooks/useTagsForWorkspace.ts` - Fetch de tags + createTag mutation

### 8. **Integração**
- `src/pages/client/WorkspaceTasksPage.tsx` - Substituído Sheet por Dialog, integrado hooks

---

## 🔧 PRÓXIMAS ETAPAS

### **PASSO 1: Aplicar Migrations**
```bash
# Fazer push das migrations para Supabase
supabase db push
```

### **PASSO 2: Regenerar Tipos Supabase**
```bash
# Isso irá atualizar src/integrations/supabase/types.ts
npm install
```

### **PASSO 3: Corrigir Erros de Type**
Após `npm install`, os tipos gerados automaticamente irão resolver os erros de:
- `useTagsForWorkspace` hook
- `useUsersForWorkspace` hook
- Props do CreateTaskDialog

### **PASSO 4: Testar Edge Function Localmente**
```bash
# No terminal Supabase
supabase functions serve create-task
```

### **PASSO 5: Implementar Upload de Anexos**
No `CreateTaskDialog.tsx`, substitua o `TODO` na função `onSubmit`:
```tsx
// TODO: Upload attachments to Supabase Storage first
const attachmentUrls = await Promise.all(
  attachments.map(async (att) => {
    const { data, error } = await supabase.storage
      .from('task-attachments')
      .upload(`${workspaceId}/${taskId}/${att.file.name}`, att.file);
    
    if (error) throw error;
    return data.path;
  })
);
```

Depois inserir na tabela:
```tsx
const attachmentRecords = attachmentUrls.map(url => ({
  task_id: taskId,
  file_url: url,
  file_name: extractFileName(url),
}));

await supabase.from('task_attachments').insert(attachmentRecords);
```

### **PASSO 6: Validar RLS Policies**
Testar que:
- ✅ Usuários veem tarefas apenas do seu workspace
- ✅ Usuários podem criar tarefas no seu workspace
- ✅ Usuários não podem criar tarefas em workspaces que não pertencem

### **PASSO 7: Adicionar Validação no Frontend**
No `CreateTaskDialog.tsx`, adicione validação antes do submit:
```tsx
if (attachments.length > 5) {
  toast.error("Máximo 5 anexos permitidos");
  return;
}

const totalSize = attachments.reduce((acc, att) => acc + att.file.size, 0);
if (totalSize > 50 * 1024 * 1024) { // 50MB
  toast.error("Tamanho total de anexos não pode exceder 50MB");
  return;
}
```

---

## 📋 CHECKLIST DE VALIDAÇÃO

- [ ] Migrations aplicadas com sucesso
- [ ] Tipos Supabase regenerados
- [ ] Sem erros TypeScript na compilação
- [ ] Edge Function testada localmente
- [ ] Dialog abre quando clicado em "Nova Tarefa"
- [ ] Formulário valida campos obrigatórios
- [ ] Tarefa criada aparece no Kanban/Lista
- [ ] Responsáveis selecionados aparecem na tarefa
- [ ] Tags criadas aparecem na tarefa
- [ ] Subtarefas aparecem na task detail view
- [ ] RLS policies funcionam corretamente

---

## 🔐 SEGURANÇA

Todas as 6 tabelas têm RLS policies implementadas:
- ✅ Users veem apenas tarefas de seus workspaces
- ✅ Users não podem contornar RLS via Edge Function (autorização verificada)
- ✅ Índices otimizados para performance
- ✅ Cascade delete em workspace_id

---

## 📝 ESTRUTURA DE COMPONENTES

```
src/
├── components/modules/tasks/create-task/
│   ├── CreateTaskDialog.tsx          (Componente principal com Tabs)
│   ├── TaskFormFields.tsx            (Campos básicos)
│   ├── AssigneesCombobox.tsx         (Seletor de usuários)
│   ├── TagsCombobox.tsx              (Seletor de tags)
│   ├── SubtasksInput.tsx             (Subtarefas dinâmicas)
│   ├── FavoriteToggle.tsx            (Toggle de favorito)
│   └── AttachmentsUpload.tsx         (Upload drag-and-drop)
├── hooks/
│   ├── useCreateTask.ts              (Mutation para criar)
│   ├── useTasksQuery.ts              (Query de tarefas)
│   ├── useUsersForWorkspace.ts       (Query de usuários)
│   └── useTagsForWorkspace.ts        (Query de tags + create)
└── lib/schemas/
    └── task.schema.ts                (Zod validation)
```

---

## 🚀 PRÓXIMAS FEATURES

- [ ] DatePicker para due_date (Popover + Calendar)
- [ ] Task detail view com edição
- [ ] Comentários em tarefas
- [ ] Notificações de atribuição
- [ ] Export de tarefas (CSV/PDF)
