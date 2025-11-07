/**
 * Página principal de tarefas do workspace
 * Layout: Sidebar de menu à esquerda, dashboard de tarefas ao centro, barra agente de IA à direita
 * @returns {JSX.Element}
 */
import { usePageHeader } from "@/contexts/PageHeaderContext";
import { useEffect, useState, useCallback } from "react";
import { ChatSidebar } from "@/components/clients/ChatSidebar";
import { TasksHeader, TaskOverviewView, TaskListView, TaskBoardView, NewTaskForm } from "@/components/modules/tasks";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";

export default function WorkspaceTasksPage() {
  const { setConfig } = usePageHeader();
  const [currentView, setCurrentView] = useState<'overview' | 'list' | 'board'>('list');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterOpen, setFilterOpen] = useState(false);
  const [isNewTaskSheetOpen, setIsNewTaskSheetOpen] = useState(false);

  // ============================================================================
  // Handlers
  // ============================================================================

  const handleViewChange = useCallback((view: 'overview' | 'list' | 'board') => {
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

      {/* Chat Sidebar - Direita (assistente de IA) */}
      <aside className="w-[340px] min-w-[300px] bg-card h-full flex flex-col border-l border-border">
        <ChatSidebar />
      </aside>

      {/* Sheet para Nova Tarefa */}
      <Sheet open={isNewTaskSheetOpen} onOpenChange={setIsNewTaskSheetOpen}>
        <SheetContent side="right" className="w-full sm:w-[540px] p-0 flex flex-col">
          <NewTaskForm onSuccess={() => setIsNewTaskSheetOpen(false)} workspaceId="current" />
        </SheetContent>
      </Sheet>
    </div>
  );
}
