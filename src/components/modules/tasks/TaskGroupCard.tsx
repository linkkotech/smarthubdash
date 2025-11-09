'use client';

import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DataTable } from '@/components/ui/data-table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { MoreHorizontal, CheckCircle2, Archive } from 'lucide-react';
import { ColumnDef } from '@tanstack/react-table';
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

interface TaskGroupCardProps {
  status: string;
  tasks: Task[];
  onToggleComplete?: (id: string, completed: boolean) => void;
  onMarkAllComplete?: (status: string) => void;
  onArchiveGroup?: (status: string) => void;
}

/**
 * TaskGroupCard - Card que agrupa tarefas por status com DataTable
 * 
 * Componentes:
 * - CardHeader com status + contador + DropdownMenu
 * - CardContent com DataTable de tarefas
 */
export function TaskGroupCard({
  status,
  tasks,
  onToggleComplete,
  onMarkAllComplete,
  onArchiveGroup,
}: TaskGroupCardProps) {
  const taskCount = tasks.length;

  // Função auxiliar para formatar data
  const formatDate = (date: string) => {
    try {
      return format(new Date(date), 'dd MMM', { locale: ptBR });
    } catch {
      return date;
    }
  };

  // Função auxiliar para obter iniciais
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((word) => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  // Definição das colunas da DataTable
  const columns: ColumnDef<Task>[] = [
    {
      id: 'checkbox',
      header: ({ table }) => (
        <Checkbox
          checked={table.getIsSomePageRowsSelected() ? 'indeterminate' : table.getIsAllPageRowsSelected()}
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Selecionar todos"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Selecionar tarefa"
        />
      ),
      enableSorting: false,
      enableHiding: false,
      size: 50,
    },
    {
      accessorKey: 'title',
      header: 'Título',
      cell: ({ row }) => (
        <span className="font-medium text-sm">{row.getValue('title')}</span>
      ),
    },
    {
      accessorKey: 'dueDate',
      header: 'Data',
      cell: ({ row }) => {
        const date = row.getValue('dueDate') as string | undefined;
        return date ? (
          <span className="text-sm text-muted-foreground">{formatDate(date)}</span>
        ) : (
          <span className="text-sm text-muted-foreground">-</span>
        );
      },
      size: 100,
    },
    {
      accessorKey: 'tags',
      header: 'Tags',
      cell: ({ row }) => {
        const tags = row.getValue('tags') as string[] | undefined;
        if (!tags || tags.length === 0) {
          return <span className="text-sm text-muted-foreground">-</span>;
        }
        return (
          <div className="flex gap-1 flex-wrap">
            {tags.slice(0, 2).map((tag) => (
              <Badge key={tag} variant="secondary" className="text-xs">
                {tag}
              </Badge>
            ))}
            {tags.length > 2 && (
              <Badge variant="outline" className="text-xs">
                +{tags.length - 2}
              </Badge>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: 'responsible',
      header: 'Responsável',
      cell: ({ row }) => {
        const responsible = row.getValue('responsible') as
          | { name: string; avatar?: string }
          | undefined;
        if (!responsible) {
          return <span className="text-sm text-muted-foreground">-</span>;
        }
        return (
          <div className="flex items-center gap-2">
            <Avatar className="h-6 w-6">
              <AvatarImage
                src={responsible.avatar}
                alt={responsible.name}
              />
              <AvatarFallback className="text-xs">
                {getInitials(responsible.name)}
              </AvatarFallback>
            </Avatar>
            <span className="text-sm text-muted-foreground truncate max-w-[100px]">
              {responsible.name}
            </span>
          </div>
        );
      },
    },
  ];

  return (
    <Card style={{ backgroundColor: 'hsl(210, 20%, 98%)' }} className="overflow-hidden border-0">
      {/* CardHeader com Status, Badge e Menu */}
      <CardHeader className="pb-3 border-b-0">
        <div className="flex items-center justify-between">
          {/* Esquerda: Status + Badge com contagem */}
          <div className="flex items-center gap-3">
            <h3 className="text-sm font-semibold text-foreground">{status}</h3>
            <Badge variant="secondary" className="text-xs">
              {taskCount}
            </Badge>
          </div>

          {/* Direita: DropdownMenu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0 hover:bg-muted"
              >
                <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem
                onClick={() => onMarkAllComplete?.(status)}
                className="cursor-pointer"
              >
                <CheckCircle2 className="h-4 w-4 mr-2" />
                <span>Marcar todas como concluídas</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => onArchiveGroup?.(status)}
                className="cursor-pointer"
              >
                <Archive className="h-4 w-4 mr-2" />
                <span>Arquivar grupo</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>

      {/* CardContent com DataTable */}
      <CardContent className="pt-4">
        {tasks.length > 0 ? (
          <DataTable
            columns={columns}
            data={tasks}
          />
        ) : (
          <div className="text-center py-6">
            <p className="text-sm text-muted-foreground">
              Nenhuma tarefa neste status
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
