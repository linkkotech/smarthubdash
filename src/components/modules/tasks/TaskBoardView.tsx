/**
 * TaskBoardView
 * 
 * Visualização Kanban Board com colunas de status
 * - Coluna: Backlog
 * - Coluna: Todo
 * - Coluna: In Progress
 * - Coluna: Done
 */

interface TaskBoardViewProps {
  searchQuery?: string;
  workspaceId: string;
}

export function TaskBoardView({
  searchQuery,
  workspaceId,
}: TaskBoardViewProps) {
  const columns = ['Backlog', 'Todo', 'In Progress', 'Done'];

  return (
    <div className="p-4">
      {/* Grid de Colunas Kanban */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {columns.map((column) => (
          <div
            key={column}
            className="flex flex-col bg-muted/30 border border-border rounded-lg overflow-hidden"
          >
            {/* Cabeçalho da Coluna */}
            <div className="bg-muted border-b border-border px-4 py-3">
              <h3 className="font-semibold text-sm text-foreground flex items-center justify-between">
                <span>{column}</span>
                <span className="inline-flex items-center justify-center w-6 h-6 text-xs font-bold bg-background rounded-full text-muted-foreground">
                  --
                </span>
              </h3>
            </div>

            {/* Conteúdo da Coluna */}
            <div className="flex-1 px-3 py-3 space-y-3 overflow-y-auto min-h-[300px]">
              {/* Placeholder: Card de Tarefa */}
              <div className="bg-background border border-border rounded-lg p-3 shadow-sm hover:shadow-md transition-shadow cursor-grab">
                <p className="text-sm font-medium text-foreground truncate">
                  Tarefa de exemplo
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  ID: --
                </p>
              </div>

              <div className="bg-background border border-border rounded-lg p-3 shadow-sm hover:shadow-md transition-shadow cursor-grab">
                <p className="text-sm font-medium text-foreground truncate">
                  Outra tarefa
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  ID: --
                </p>
              </div>
            </div>

            {/* Botão Adicionar Tarefa */}
            <div className="border-t border-border px-3 py-3">
              <button className="w-full text-left text-xs text-muted-foreground hover:text-foreground transition-colors py-2">
                + Adicionar tarefa
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Placeholder: Informações e Ajuda */}
      <div className="mt-8 rounded-lg border border-dashed border-muted-foreground bg-muted/20 p-8 text-center">
        <h3 className="text-sm font-semibold text-foreground mb-2">
          Visualização Kanban Board
        </h3>
        <p className="text-xs text-muted-foreground">
          Implemente aqui o Kanban com drag-and-drop para alternar status de tarefas
        </p>
        {searchQuery && (
          <p className="text-xs text-muted-foreground mt-4">
            Filtro de busca: <span className="font-mono">{searchQuery}</span>
          </p>
        )}
        <p className="text-xs text-muted-foreground mt-4">
          Workspace: {workspaceId}
        </p>
      </div>
    </div>
  );
}
