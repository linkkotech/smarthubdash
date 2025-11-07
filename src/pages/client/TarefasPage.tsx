import { usePageHeader } from "@/contexts/PageHeaderContext";
import { useEffect, useState, useCallback } from "react";
import { ChatSidebar } from "@/components/clients/ChatSidebar";
import { TasksHeader, TaskOverviewView, TaskListView, TaskBoardView } from "@/components/modules/tasks";

/**
 * Página principal de tarefas do workspace
 * Layout: Sidebar de menu à esquerda, dashboard de tarefas ao centro, barra agente de IA à direita
 * @returns {JSX.Element}
 */
export default function TarefasPage() {
  const { setConfig } = usePageHeader();
  const [currentView, setCurrentView] = useState<'overview' | 'list' | 'board'>('list');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterOpen, setFilterOpen] = useState(false);

  // ============================================================================
  // Handlers
  // ============================================================================

  const handleViewChange = useCallback((view: 'overview' | 'list' | 'board') => {
    setCurrentView(view);
    console.log(`[TAREFAS PAGE] Visualização alterada para: ${view}`);
  }, []);

  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
    console.log(`[TAREFAS PAGE] Busca: ${query}`);
  }, []);

  const handleFilter = useCallback(() => {
    setFilterOpen(prev => {
      console.log(`[TAREFAS PAGE] Filtro toggled: ${!prev}`);
      return !prev;
    });
  }, []);

  const handleNewTask = useCallback(() => {
    console.log(`[TAREFAS PAGE] Criar nova tarefa`);
    // TODO: Abrir modal de criação de tarefa
  }, []);

  // ============================================================================
  // Configurar PageHeader com TasksHeader na Linha 2
  // ============================================================================

  useEffect(() => {
    console.log(`[TAREFAS PAGE] Atualizando PageHeader com currentView: ${currentView}`);
    console.log(`[TAREFAS PAGE] TasksHeader será renderizado na segunda linha`);
    
    setConfig({
      title: "Tarefas",
      secondLineContent: (
        <TasksHeader
          currentView={currentView}
          onViewChange={handleViewChange}
          onSearch={handleSearch}
          onFilter={handleFilter}
          onNewTaskClick={handleNewTask}
        />
      ),
    });
  }, [setConfig, currentView, handleViewChange, handleSearch, handleFilter, handleNewTask]);

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

      {/* Barra Agente de IA (Direita) */}
      <aside className="w-[300px] border-l bg-card h-full overflow-y-auto">
        <ChatSidebar />
      </aside>
    </div>
  );
}
