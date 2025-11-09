'use client';

import { useState } from 'react';
import { TasksHeader } from '@/components/modules/tasks';

interface TasksLayoutProps {
  children: React.ReactNode;
}

/**
 * Layout do Módulo de Tarefas
 * 
 * Responsabilidades:
 * - Gerenciar estado da visualização (overview, list, board)
 * - Renderizar TasksHeader com os controles
 * - Renderizar children (página tasks/page.tsx)
 */
export default function TasksLayout({ children }: TasksLayoutProps) {
  const [currentView, setCurrentView] = useState<'overview' | 'list' | 'board'>(
    'list'
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [filterOpen, setFilterOpen] = useState(false);

  // ============================================================================
  // Handlers
  // ============================================================================

  const handleViewChange = (view: 'overview' | 'list' | 'board') => {
    setCurrentView(view);
    console.log(`[TASKS_LAYOUT] Visualização alterada para: ${view}`);
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    console.log(`[TASKS_LAYOUT] Busca: ${query}`);
  };

  const handleFilter = () => {
    setFilterOpen(!filterOpen);
    console.log(`[TASKS_LAYOUT] Filtro toggled: ${!filterOpen}`);
  };

  const handleNewTask = () => {
    console.log(`[TASKS_LAYOUT] Criar nova tarefa`);
  };

  // ============================================================================
  // Renderização
  // ============================================================================

  return (
    <div className="flex flex-col h-screen">
      {/* TasksHeader - Barra de Navegação Secundária */}
      <TasksHeader
        currentView={currentView}
        onViewChange={handleViewChange}
        onSearch={handleSearch}
        onFilter={handleFilter}
        onNewTaskClick={handleNewTask}
      />

      {/* Painel de Filtros (quando filterOpen = true) */}
      {filterOpen && (
        <div className="border-b border-border bg-muted/50 px-6 py-4">
          <div className="rounded-lg border border-muted-foreground bg-background p-4 text-center">
            <p className="text-sm text-muted-foreground">
              Painel de filtros será renderizado aqui
            </p>
          </div>
        </div>
      )}

      {/* Conteúdo da Página (children passam currentView e searchQuery via Context ou Props) */}
      <div className="flex-1 overflow-auto">
        {children}
      </div>
    </div>
  );
}
