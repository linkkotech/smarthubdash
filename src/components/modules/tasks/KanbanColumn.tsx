'use client';

import { useDroppable } from '@dnd-kit/core';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
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

interface KanbanColumnProps {
  status: string;
  tasks: Task[];
  onToggleComplete?: (id: string, completed: boolean) => void;
}

export function KanbanColumn({
  status,
  tasks,
  onToggleComplete,
}: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: status,
  });

  return (
    <div
      ref={setNodeRef}
      className={`flex-1 min-w-72 rounded-lg p-4 transition-colors ${
        isOver ? 'bg-muted/50' : 'bg-muted/20'
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-sm">{status}</h3>
        <Badge variant="outline" className="text-xs">
          {tasks.length}
        </Badge>
      </div>

      {/* Cards Container */}
      <div className="space-y-2">
        {tasks.length > 0 ? (
          tasks.map((task) => (
            <KanbanCard
              key={task.id}
              task={task}
              onToggleComplete={onToggleComplete}
            />
          ))
        ) : (
          <div className="text-center py-8 text-xs text-muted-foreground">
            Nenhuma tarefa
          </div>
        )}
      </div>
    </div>
  );
}
