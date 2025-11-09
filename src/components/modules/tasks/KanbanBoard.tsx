'use client';

import { useState, useCallback } from 'react';
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { KanbanColumn } from './KanbanColumn';
import { KanbanCard } from './KanbanCard';

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

interface KanbanBoardProps {
  initialTasks: Task[];
  workspaceId: string;
  onTaskStatusChange?: (taskId: string, newStatus: string) => void;
}

const STATUS_ORDER = [
  'Backlog',
  'Todo',
  'Em Andamento',
  'Em Review',
  'Concluído',
];

export function KanbanBoard({
  initialTasks,
  workspaceId,
  onTaskStatusChange,
}: KanbanBoardProps) {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [activeId, setActiveId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor)
  );

  const handleDragStart = (event: any) => {
    setActiveId(event.active.id);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over) return;

    const taskId = active.id as string;
    const newStatus = over.id as string;

    // Encontrar tarefa
    const task = tasks.find((t) => t.id === taskId);
    if (!task) return;

    // Se não mudou de status, não faz nada
    if (task.status === newStatus) return;

    // Atualização otimista
    setTasks((prevTasks) =>
      prevTasks.map((t) =>
        t.id === taskId ? { ...t, status: newStatus } : t
      )
    );

    // Callback para atualizar no backend
    onTaskStatusChange?.(taskId, newStatus);

    console.log(`[KANBAN] Tarefa ${taskId} movida para: ${newStatus}`);
  };

  const handleToggleComplete = useCallback((taskId: string, completed: boolean) => {
    setTasks((prevTasks) =>
      prevTasks.map((t) =>
        t.id === taskId ? { ...t, isCompleted: completed } : t
      )
    );
  }, []);

  // Agrupar tarefas por status
  const groupedTasks: Record<string, Task[]> = {};
  STATUS_ORDER.forEach((status) => {
    groupedTasks[status] = tasks.filter((t) => t.status === status);
  });

  // Encontrar tarefa sendo arrastada
  const activeTask = tasks.find((t) => t.id === activeId);

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="flex gap-4 overflow-x-auto pb-4 bg-white p-4 rounded-lg">
        {STATUS_ORDER.map((status) => (
          <KanbanColumn
            key={status}
            status={status}
            tasks={groupedTasks[status]}
            onToggleComplete={handleToggleComplete}
          />
        ))}
      </div>

      <DragOverlay>
        {activeTask && <KanbanCard task={activeTask} />}
      </DragOverlay>
    </DndContext>
  );
}
