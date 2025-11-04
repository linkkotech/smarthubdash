/**
 * Componente: WorkspacesTable
 * 
 * Tabela responsiva para exibir workspaces com:
 * - Ordenação por colunas
 * - Loading state
 * - Empty state
 * - Ações inline (editar, logar como, desativar)
 * 
 * Usa TanStack Table (React Table v8) para funcionalidades avançadas.
 */

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
} from "@tanstack/react-table";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { WorkspaceTableRow } from "@/types/workspace";
import { createWorkspaceColumns } from "./WorkspaceTableColumns";
import { Skeleton } from "@/components/ui/skeleton";

interface WorkspacesTableProps {
  data: WorkspaceTableRow[];
  loading: boolean;
  onEdit: (workspace: WorkspaceTableRow) => void;
  onLoginAs: (workspace: WorkspaceTableRow) => void;
  onDeactivate: (workspace: WorkspaceTableRow) => void;
}

/**
 * Tabela de workspaces com ordenação e ações
 * 
 * @param data - Array de workspaces para exibir
 * @param loading - Se true, mostra skeletons
 * @param onEdit - Callback para editar workspace
 * @param onLoginAs - Callback para logar como admin
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
  const [sorting, setSorting] = useState<SortingState>([]);

  const columns = createWorkspaceColumns({
    navigate,
    onEdit,
    onLoginAs,
    onDeactivate,
  });

  const table = useReactTable({
    data: data || [],
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onSortingChange: setSorting,
    state: {
      sorting,
    },
  });

  // Loading state
  if (loading) {
    return (
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
          <Skeleton key={i} className="h-16 w-full" />
        ))}
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
          {table.getRowModel().rows.map((row) => (
            <TableRow key={row.id}>
              {row.getVisibleCells().map((cell) => (
                <TableCell key={cell.id}>
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
