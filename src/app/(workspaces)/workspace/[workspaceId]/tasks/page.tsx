'use client';

/**
 * Página do Módulo de Tarefas
 * 
 * Responsabilidades:
 * - Renderizar condicionalmente as visualizações
 * - Exibir tarefas com base na busca e filtros
 * 
 * Estado é gerenciado pelo layout.tsx (TasksLayout)
 */
export default function TasksPage() {
  // TODO: Receber currentView, searchQuery e filterOpen do contexto ou props do layout

  // ============================================================================
  // Renderização de Conteúdo Condicional
  // ============================================================================

  return (
    <div className="p-6">
      <div className="rounded-lg border border-dashed border-muted-foreground bg-muted/20 p-12 text-center">
        <h3 className="text-lg font-semibold text-foreground mb-2">
          Conteúdo do Módulo de Tarefas
        </h3>
        <p className="text-sm text-muted-foreground">
          Implemente TaskOverviewView, TaskListView ou TaskBoardView aqui
        </p>
        <p className="text-xs text-muted-foreground mt-6">
          ℹ️ O estado (currentView, searchQuery) é gerenciado pelo layout.tsx
        </p>
      </div>
    </div>
  );
}
