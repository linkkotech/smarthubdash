/**
 * Componente: WorkspacesTable
 * 
 * Tabela responsiva para exibir workspaces com funcionalidades avançadas:
 * - Campo de busca para filtrar workspaces por nome
 * - Checkboxes para seleção em massa
 * - Chevron para expandir/recolher detalhes de cada workspace
 * - Ordenação por colunas
 * - Loading state com skeletons
 * - Empty state customizado
 * - Ações inline (editar, logar como, desativar)
 * 
 * Usa TanStack Table (React Table v8) para funcionalidades avançadas de tabela.
 * Inspirado nas páginas /app/equipe e /templates-digitais.
 * 
 * @component
 * @example
 * <WorkspacesTable
 *   data={workspaces}
 *   loading={isLoading}
 *   onEdit={(workspace) => handleEdit(workspace)}
 *   onLoginAs={(workspace) => handleLoginAs(workspace)}
 *   onDeactivate={(workspace) => handleDeactivate(workspace)}
 * />
 */

import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  SortingState,
  RowSelectionState,
  useReactTable,
} from "@tanstack/react-table";
import { useNavigate } from "react-router-dom";
import { WorkspaceTableRow } from "@/types/workspace";
import { createWorkspaceColumns } from "./WorkspaceTableColumns";
import { WorkspaceExpandedContent } from "./WorkspaceExpandedContent";
import { Skeleton } from "@/components/ui/skeleton";
import { Search } from "lucide-react";

interface WorkspacesTableProps {
  data: WorkspaceTableRow[];
  loading: boolean;
  onEdit: (workspace: WorkspaceTableRow) => void;
  onLoginAs: (workspace: WorkspaceTableRow) => void;
  onDeactivate: (workspace: WorkspaceTableRow) => void;
}

/**
 * Tabela de workspaces com busca, seleção e expansão
 * 
 * @param data - Array de workspaces para exibir
 * @param loading - Se true, mostra skeletons de carregamento
 * @param onEdit - Callback para editar workspace
 * @param onLoginAs - Callback para logar como admin do workspace
 * @param onDeactivate - Callback para desativar workspace
 */
export function WorkspacesTable({
  data,
  loading,
  onEdit,
  onLoginAs,
  onDeactivate,
}: WorkspacesTableProps) {
  const navigate = useNavigate();
  
  // Estados
  const [sorting, setSorting] = useState<SortingState>([]);
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const [searchTerm, setSearchTerm] = useState("");

  // Função para alternar expansão de uma linha
  const toggleRow = (rowId: string) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(rowId)) {
      newExpanded.delete(rowId);
    } else {
      newExpanded.add(rowId);
    }
    setExpandedRows(newExpanded);
  };

  // Criar colunas passando os callbacks e estado de expansão
  const columns = createWorkspaceColumns({
    navigate,
    onEdit,
    onLoginAs,
    onDeactivate,
    expandedRows,
    toggleRow,
  });

  const table = useReactTable({
    data: data || [],
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onSortingChange: setSorting,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      rowSelection,
      globalFilter: searchTerm,
    },
    onGlobalFilterChange: setSearchTerm,
    globalFilterFn: (row, columnId, filterValue) => {
      const workspace = row.original;
      const searchLower = String(filterValue).toLowerCase();
      return (
        workspace.name.toLowerCase().includes(searchLower) ||
        workspace.owner_name.toLowerCase().includes(searchLower) ||
        workspace.owner_email.toLowerCase().includes(searchLower) ||
        (workspace.document || "").toLowerCase().includes(searchLower)
      );
    },
  });

  // Loading state
  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-80" />
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      </div>
    );
  }

  // Empty state
  if (!data || data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <p className="text-lg font-semibold text-muted-foreground">
          Nenhum workspace encontrado
        </p>
        <p className="text-sm text-muted-foreground mt-2">
          Clique em "Adicionar Cliente" para criar o primeiro workspace.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Campo de Busca */}
      <div className="relative w-80">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Buscar workspace..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Tabela */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.map((row) => {
              const isExpanded = expandedRows.has(row.id);
              return (
                <>
                  {/* Linha Principal */}
                  <TableRow key={row.id}>
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
                  </TableRow>
                  
                  {/* Linha Expandida com Detalhes */}
                  {isExpanded && (
                    <TableRow key={`${row.id}-expanded`}>
                      <TableCell colSpan={columns.length} className="p-0">
                        <WorkspaceExpandedContent
                          workspace={row.original}
                          onEdit={() => onEdit(row.original)}
                          onLoginAs={() => onLoginAs(row.original)}
                          onOpenDetails={() => navigate(`/clientes/${row.original.id}`)}
                        />
                      </TableCell>
                    </TableRow>
                  )}
                </>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
