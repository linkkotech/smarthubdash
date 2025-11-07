/**
 * TaskListView
 * 
 * Visualização em Tabela/Lista de tarefas
 * - Coluna: ID da tarefa
 * - Coluna: Título
 * - Coluna: Responsável
 * - Coluna: Status
 * - Coluna: Prioridade
 * - Coluna: Data de Vencimento
 * - Coluna: Ações
 */

interface TaskListViewProps {
  searchQuery?: string;
  workspaceId: string;
}

export function TaskListView({
  searchQuery,
  workspaceId,
}: TaskListViewProps) {
  return (
    <div className="p-4">
      <div className="rounded-lg border border-border overflow-hidden">
        {/* Cabeçalho da Tabela */}
        <div className="bg-muted/50 border-b border-border px-6 py-3 grid grid-cols-[1fr_2fr_2fr_1fr_1fr_1.5fr_1fr] gap-4">
          <div className="text-sm font-semibold text-foreground">ID</div>
          <div className="text-sm font-semibold text-foreground">Título</div>
          <div className="text-sm font-semibold text-foreground">Responsável</div>
          <div className="text-sm font-semibold text-foreground">Status</div>
          <div className="text-sm font-semibold text-foreground">Prioridade</div>
          <div className="text-sm font-semibold text-foreground">Vencimento</div>
          <div className="text-sm font-semibold text-foreground">Ações</div>
        </div>

        {/* Corpo da Tabela */}
        <div className="divide-y divide-border">
          {/* Placeholder: Linhas de Tarefas */}
          <div className="px-6 py-4 grid grid-cols-[1fr_2fr_2fr_1fr_1fr_1.5fr_1fr] gap-4 items-center text-sm text-muted-foreground">
            <div className="font-mono text-xs bg-muted/50 px-2 py-1 rounded">--</div>
            <div>Tarefa #1</div>
            <div>--</div>
            <div>--</div>
            <div>--</div>
            <div>--</div>
            <div className="text-right">...</div>
          </div>

          <div className="px-6 py-4 grid grid-cols-[1fr_2fr_2fr_1fr_1fr_1.5fr_1fr] gap-4 items-center text-sm text-muted-foreground">
            <div className="font-mono text-xs bg-muted/50 px-2 py-1 rounded">--</div>
            <div>Tarefa #2</div>
            <div>--</div>
            <div>--</div>
            <div>--</div>
            <div>--</div>
            <div className="text-right">...</div>
          </div>

          <div className="px-6 py-4 grid grid-cols-[1fr_2fr_2fr_1fr_1fr_1.5fr_1fr] gap-4 items-center text-sm text-muted-foreground">
            <div className="font-mono text-xs bg-muted/50 px-2 py-1 rounded">--</div>
            <div>Tarefa #3</div>
            <div>--</div>
            <div>--</div>
            <div>--</div>
            <div>--</div>
            <div className="text-right">...</div>
          </div>
        </div>

        {/* Rodapé: Informações de Paginação/Contagem */}
        <div className="bg-muted/30 border-t border-border px-6 py-3 text-xs text-muted-foreground">
          <p>
            Workspace: {workspaceId}
            {searchQuery && ` | Busca: ${searchQuery}`}
          </p>
        </div>
      </div>

      {/* Placeholder: Mensagem de Ajuda */}
      <div className="mt-8 rounded-lg border border-dashed border-muted-foreground bg-muted/20 p-8 text-center">
        <h3 className="text-sm font-semibold text-foreground mb-2">
          Visualização de Lista
        </h3>
        <p className="text-xs text-muted-foreground">
          Implemente aqui a tabela com dados reais das tarefas
        </p>
      </div>
    </div>
  );
}
