'use client';

import { useState } from 'react';
import { LayoutGrid, List, KanbanSquare, Search, Filter, Plus } from 'lucide-react';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface TasksHeaderProps {
  currentView: 'overview' | 'list' | 'board' | 'kanban';
  onViewChange: (view: 'overview' | 'list' | 'board' | 'kanban') => void;
  onSearch?: (query: string) => void;
  onNewTaskClick?: () => void;
  onFilter?: () => void;
}

/**
 * TasksHeader - Barra de navegação secundária para o módulo de Tarefas
 * 
 * Componentes:
 * - Seletor de Visualização (Overview, List, Board)
 * - Botão de Filtro
 * - Campo de Busca
 * - Botão de Nova Tarefa (abre Sheet)
 */
export function TasksHeader({
  currentView,
  onViewChange,
  onSearch,
  onNewTaskClick,
  onFilter,
}: TasksHeaderProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    onSearch?.(query);
  };

  return (
    <div className="flex items-center justify-between gap-4 h-10 px-4">
      {/* Esquerda: Seletor de Visualização + Filtro */}
      <div className="flex items-center gap-2">
        {/* Toggle Group - Seletor de Visualizações */}
        <ToggleGroup
          type="single"
          value={currentView}
          onValueChange={(value) => {
            if (value) {
              onViewChange(value as 'overview' | 'list' | 'board' | 'kanban');
            }
          }}
          className="bg-muted rounded-md p-1 h-10 px-1"
        >
          <ToggleGroupItem
            value="overview"
            aria-label="Visualização Overview"
            className="data-[state=on]:bg-background h-8 px-3"
          >
            <LayoutGrid className="h-4 w-4 mr-1" />
            <span className="text-xs font-medium">Overview</span>
          </ToggleGroupItem>
          <ToggleGroupItem
            value="list"
            aria-label="Visualização Lista"
            className="data-[state=on]:bg-background h-8 px-3"
          >
            <List className="h-4 w-4 mr-1" />
            <span className="text-xs font-medium">Lista</span>
          </ToggleGroupItem>
          <ToggleGroupItem
            value="kanban"
            aria-label="Visualização Kanban"
            className="data-[state=on]:bg-background h-8 px-3"
          >
            <KanbanSquare className="h-4 w-4 mr-1" />
            <span className="text-xs font-medium">Kanban</span>
          </ToggleGroupItem>
        </ToggleGroup>

        {/* Botão de Filtro */}
        <Button
          variant="outline"
          size="sm"
          onClick={onFilter}
          className="ml-2"
        >
          <Filter className="h-4 w-4 mr-2" />
          Filtro
        </Button>
      </div>

      {/* Centro: Busca */}
      <div className="flex-1 max-w-xs">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Buscar tarefas..."
            value={searchQuery}
            onChange={handleSearchChange}
            className="pl-10 text-sm"
          />
        </div>
      </div>

      {/* Direita: Botão de Nova Tarefa */}
      <Button
        onClick={onNewTaskClick}
        size="sm"
        className="whitespace-nowrap"
      >
        <Plus className="h-4 w-4 mr-2" />
        Nova Tarefa
      </Button>
    </div>
  );
}
