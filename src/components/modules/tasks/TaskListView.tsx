/**
 * TaskListView
 * 
 * Visualização em Lista/Agrupada de tarefas por status
 * - Agrupa tarefas por status
 * - Renderiza um Card para cada status
 * - Cada card contém lista de tarefas com checkbox, título, data, tags e avatar
 */

import { TaskListGrouped } from './TaskListGrouped';

interface TaskListViewProps {
  searchQuery?: string;
  workspaceId: string;
}

// Dados placeholder para demonstração
const PLACEHOLDER_TASKS = [
  {
    id: '1',
    title: 'Tarefa #1',
    status: 'Em Andamento',
    dueDate: '2025-11-15',
    tags: ['Urgent'],
    responsible: {
      name: 'João Silva',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=1',
    },
    isCompleted: false,
  },
  {
    id: '3',
    title: 'Tarefa #3',
    status: 'Em Andamento',
    dueDate: '2025-11-20',
    tags: ['Feature', 'Backend'],
    responsible: {
      name: 'Carlos Oliveira',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=3',
    },
    isCompleted: false,
  },
];

export function TaskListView({
  searchQuery = '',
  workspaceId,
}: TaskListViewProps) {
  const handleToggleComplete = (id: string, completed: boolean) => {
    console.log(`[TASK_LIST_VIEW] Tarefa ${id} marcada como ${completed ? 'concluída' : 'pendente'}`);
  };

  const handleMarkAllComplete = (status: string) => {
    console.log(`[TASK_LIST_VIEW] Marcar todas as tarefas de "${status}" como concluídas`);
  };

  const handleArchiveGroup = (status: string) => {
    console.log(`[TASK_LIST_VIEW] Arquivar grupo "${status}"`);
  };

  return (
    <TaskListGrouped
      tasks={PLACEHOLDER_TASKS}
      searchQuery={searchQuery}
      onToggleComplete={handleToggleComplete}
      onMarkAllComplete={handleMarkAllComplete}
      onArchiveGroup={handleArchiveGroup}
    />
  );
}
