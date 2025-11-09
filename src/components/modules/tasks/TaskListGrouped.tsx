'use client';

import { useMemo, useState } from 'react';
import { Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { TaskGroupCard } from './TaskGroupCard';

interface Task {
  id: string;
  title: string;
  status: string;
  dueDate?: string;
  tags?: string[];
  responsible?: {
    name: string;
    avatar?: string;
  };
  isCompleted?: boolean;
}

interface TaskListGroupedProps {
  tasks: Task[];
  searchQuery?: string;
  onToggleComplete?: (id: string, completed: boolean) => void;
  onMarkAllComplete?: (status: string) => void;
  onArchiveGroup?: (status: string) => void;
}

/**
 * TaskListGrouped - Agrupa tarefas por status e renderiza TaskGroupCard para cada grupo
 * 
 * Responsabilidades:
 * - Agrupar tarefas por campo `status`
 * - Ordenar status em ordem lógica
 * - Filtrar por searchQuery
 * - Renderizar um Card para cada status
 */
export function TaskListGrouped({
  tasks,
  searchQuery = '',
  onToggleComplete,
  onMarkAllComplete,
  onArchiveGroup,
}: TaskListGroupedProps) {
  const [filterOpen, setFilterOpen] = useState(false);

  // Ordem padrão de status (personalize conforme necessário)
  const STATUS_ORDER = [
    'Em Andamento',
  ];

  // Agrupar tarefas por status
  const groupedTasks = useMemo(() => {
    const grouped: Record<string, Task[]> = {};

    // Inicializar grupos com array vazio para cada status
    STATUS_ORDER.forEach((status) => {
      grouped[status] = [];
    });

    // Filtrar tarefas por searchQuery
    const filteredTasks = tasks.filter((task) =>
      task.title.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Agrupar tarefas por status
    filteredTasks.forEach((task) => {
      const status = task.status || 'Sem Status';

      if (!grouped[status]) {
        grouped[status] = [];
      }

      grouped[status].push(task);
    });

    return grouped;
  }, [tasks, searchQuery]);

  // Ordenar grupos de acordo com STATUS_ORDER
  const orderedStatuses = Object.keys(groupedTasks).sort((a, b) => {
    const indexA = STATUS_ORDER.indexOf(a);
    const indexB = STATUS_ORDER.indexOf(b);

    // Se ambos estão em STATUS_ORDER, respeitar a ordem
    if (indexA !== -1 && indexB !== -1) {
      return indexA - indexB;
    }

    // Se apenas um está em STATUS_ORDER, ele vem primeiro
    if (indexA !== -1) return -1;
    if (indexB !== -1) return 1;

    // Se nenhum está em STATUS_ORDER, ordenar alfabeticamente
    return a.localeCompare(b);
  });

  return (
    <div className="space-y-4 bg-white p-4 rounded-lg">
      {/* Botão de Filter */}
      <div className="flex items-center justify-start mb-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setFilterOpen(!filterOpen)}
          className="gap-2"
        >
          <Filter className="w-4 h-4" />
          Filtro
        </Button>
      </div>

      {filterOpen && (
        <div className="bg-muted/50 p-3 rounded-md mb-4 text-sm text-muted-foreground">
          <p>Opções de filtro aqui...</p>
        </div>
      )}

      {orderedStatuses.length > 0 ? (
        orderedStatuses.map((status) => (
          <TaskGroupCard
            key={status}
            status={status}
            tasks={groupedTasks[status]}
            onToggleComplete={onToggleComplete}
            onMarkAllComplete={onMarkAllComplete}
            onArchiveGroup={onArchiveGroup}
          />
        ))
      ) : (
        <div className="text-center py-12">
          <p className="text-sm text-muted-foreground">
            Nenhuma tarefa encontrada
          </p>
        </div>
      )}
    </div>
  );
}
