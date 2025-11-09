'use client';

import { useDraggable } from '@dnd-kit/core';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

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

interface KanbanCardProps {
  task: Task;
  onToggleComplete?: (id: string, completed: boolean) => void;
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export function KanbanCard({ task, onToggleComplete }: KanbanCardProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: task.id,
    data: task,
  });

  const style = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
        opacity: isDragging ? 0.5 : 1,
      }
    : undefined;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className="mb-3 cursor-grab active:cursor-grabbing"
    >
      <Card className="bg-white hover:shadow-md transition-shadow">
        <CardContent className="p-4">
          {/* Checkbox + Título */}
          <div className="flex items-start gap-2 mb-3">
            <Checkbox
              checked={task.isCompleted || false}
              onCheckedChange={(checked) => {
                onToggleComplete?.(task.id, checked as boolean);
              }}
              onClick={(e) => e.stopPropagation()}
              className="mt-1"
            />
            <div className="flex-1 min-w-0">
              <h4 className="font-medium text-sm text-foreground line-clamp-2">
                {task.title}
              </h4>
            </div>
          </div>

          {/* Tags */}
          {task.tags && task.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-3">
              {task.tags.slice(0, 2).map((tag, idx) => (
                <Badge key={idx} variant="secondary" className="text-xs">
                  {tag}
                </Badge>
              ))}
              {task.tags.length > 2 && (
                <Badge variant="secondary" className="text-xs">
                  +{task.tags.length - 2}
                </Badge>
              )}
            </div>
          )}

          {/* Footer: Data + Responsável */}
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            {task.dueDate && (
              <span>
                {format(new Date(task.dueDate), 'dd MMM', { locale: ptBR })}
              </span>
            )}
            {task.responsible && (
              <div className="flex items-center gap-1">
                <Avatar className="h-5 w-5">
                  <AvatarImage
                    src={task.responsible.avatar}
                    alt={task.responsible.name}
                  />
                  <AvatarFallback className="text-xs">
                    {getInitials(task.responsible.name)}
                  </AvatarFallback>
                </Avatar>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
