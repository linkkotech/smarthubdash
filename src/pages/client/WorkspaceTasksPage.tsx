import { usePageHeader } from "@/contexts/PageHeaderContext";
import { useEffect, useState, useCallback } from "react";
import { TasksHeader, TaskOverviewView, TaskListView, TaskBoardView, NewTaskForm, KanbanBoard } from "@/components/modules/tasks";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";

// Dados placeholder para tarefas
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
  {
    id: '2',
    title: 'Tarefa #2',
    status: 'Concluído',
    dueDate: '2025-11-10',
    tags: ['Design'],
    responsible: {
      name: 'Maria Santos',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=2',
    },
    isCompleted: true,
  },
  {
    id: '4',
    title: 'Tarefa #4',
    status: 'Todo',
    dueDate: '2025-11-25',
    tags: [],
    responsible: {
      name: 'Ana Costa',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=4',
    },
    isCompleted: false,
  },
];

export default function WorkspaceTasksPage() {
  const { setConfig } = usePageHeader();
  const [currentView, setCurrentView] = useState<'overview' | 'list' | 'board' | 'kanban'>('list');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterOpen, setFilterOpen] = useState(false);
  const [isNewTaskSheetOpen, setIsNewTaskSheetOpen] = useState(false);

  // ============================================================================
  // Handlers
  // ============================================================================

  const handleViewChange = useCallback((view: 'overview' | 'list' | 'board' | 'kanban') => {
    setCurrentView(view);
  }, []);

  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
  }, []);

  const handleFilter = useCallback(() => {
    setFilterOpen(prev => !prev);
  }, []);

  // ============================================================================
  // Configurar PageHeader com TasksHeader na Linha 2
  // ============================================================================

  useEffect(() => {
    setConfig({
      title: "Tarefas",
      secondLineContent: (
        <TasksHeader
          currentView={currentView}
          onViewChange={handleViewChange}
          onSearch={handleSearch}
          onFilter={handleFilter}
          onNewTaskClick={() => setIsNewTaskSheetOpen(true)}
        />
      ),
    });
  }, [setConfig, currentView, handleViewChange, handleSearch, handleFilter]);

  // ============================================================================
  // Renderização de Conteúdo Condicional
  // ============================================================================

  const renderContent = () => {
    switch (currentView) {
      case 'overview':
        return <TaskOverviewView searchQuery={searchQuery} workspaceId="current" />;
      case 'list':
        return <TaskListView searchQuery={searchQuery} workspaceId="current" />;
      case 'board':
        return <TaskBoardView searchQuery={searchQuery} workspaceId="current" />;
      case 'kanban':
        return <KanbanBoard initialTasks={PLACEHOLDER_TASKS} workspaceId="current" />;
      default:
        return null;
    }
  };

  return (
    <div className="flex h-full bg-background gap-0">
      {/* Dashboard de Tarefas - Centro */}
      <main className="flex-1 overflow-x-hidden h-full overflow-y-auto flex flex-col">
        {/* Painel de Filtros (condicional) */}
        {filterOpen && (
          <div className="border-b border-border bg-muted/50 px-6 py-4">
            <div className="rounded-lg border border-muted-foreground bg-background p-4 text-center">
              <p className="text-sm text-muted-foreground">
                Painel de filtros será renderizado aqui
              </p>
            </div>
          </div>
        )}

        {/* Conteúdo Principal */}
        <div className="flex-1 overflow-auto">
          {renderContent()}
        </div>
      </main>

      {/* Sheet para Nova Tarefa */}
      <Sheet open={isNewTaskSheetOpen} onOpenChange={setIsNewTaskSheetOpen}>
        <SheetContent side="right" className="w-full sm:w-[540px] p-0 flex flex-col">
          <NewTaskForm onSuccess={() => setIsNewTaskSheetOpen(false)} workspaceId="current" />
        </SheetContent>
      </Sheet>
    </div>
  );
}
