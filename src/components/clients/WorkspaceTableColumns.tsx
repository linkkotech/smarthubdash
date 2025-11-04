/**
 * Definições de colunas para a tabela de Workspaces
 * 
 * Colunas:
 * 1. Nome do Workspace (ordenável, clicável para detalhes)
 * 2. Administrador (nome do owner)
 * 3. Tipo (PJ ou PF)
 * 4. Criado em (data formatada, ordenável)
 * 5. Ações (dropdown com opções)
 */

import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowUpDown } from "lucide-react";
import { WorkspaceTableRow } from "@/types/workspace";
import { WorkspaceActionsDropdown } from "./WorkspaceActionsDropdown";

/**
 * Header ordenável para coluna "Workspace"
 */
function WorkspaceColumnHeader({ column }: { column: any }) {
  return (
    <Button
      variant="ghost"
      onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
    >
      Workspace
      <ArrowUpDown className="ml-2 h-4 w-4" />
    </Button>
  );
}

/**
 * Header ordenável para coluna "Criado em"
 */
function CreatedAtColumnHeader({ column }: { column: any }) {
  return (
    <Button
      variant="ghost"
      onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
    >
      Criado em
      <ArrowUpDown className="ml-2 h-4 w-4" />
    </Button>
  );
}

interface CreateWorkspaceColumnsProps {
  navigate: (path: string) => void;
  onEdit: (workspace: WorkspaceTableRow) => void;
  onLoginAs: (workspace: WorkspaceTableRow) => void;
  onDeactivate: (workspace: WorkspaceTableRow) => void;
}

/**
 * Cria as definições de colunas para a tabela de workspaces
 * 
 * @param navigate - Função de navegação do React Router
 * @param onEdit - Callback para editar workspace
 * @param onLoginAs - Callback para logar como admin do workspace
 * @param onDeactivate - Callback para desativar workspace
 * 
 * @returns Array de definições de colunas do TanStack Table
 */
export function createWorkspaceColumns({
  navigate,
  onEdit,
  onLoginAs,
  onDeactivate,
}: CreateWorkspaceColumnsProps): ColumnDef<WorkspaceTableRow>[] {
  return [
    {
      accessorKey: "name",
      header: WorkspaceColumnHeader,
      cell: ({ row }) => (
        <Button
          variant="link"
          className="font-medium p-0 h-auto"
          onClick={(e) => {
            e.stopPropagation();
            navigate(`/clientes/${row.original.id}`);
          }}
        >
          {row.getValue("name")}
        </Button>
      ),
    },
    {
      accessorKey: "owner_name",
      header: "Administrador",
      cell: ({ row }) => (
        <div className="flex flex-col">
          <span className="font-medium">{row.original.owner_name}</span>
          <span className="text-sm text-muted-foreground">
            {row.original.owner_email}
          </span>
        </div>
      ),
    },
    {
      accessorKey: "client_type_display",
      header: "Tipo",
      cell: ({ row }) => {
        const type = row.original.client_type_display;
        return (
          <Badge variant={type === "PJ" ? "default" : "secondary"}>
            {type}
          </Badge>
        );
      },
    },
    {
      accessorKey: "created_at",
      header: CreatedAtColumnHeader,
      cell: ({ row }) => row.original.created_at_formatted,
    },
    {
      id: "actions",
      header: "Ações",
      cell: ({ row }) => (
        <WorkspaceActionsDropdown
          workspace={row.original}
          onEdit={onEdit}
          onLoginAs={onLoginAs}
          onDeactivate={onDeactivate}
        />
      ),
    },
  ];
}
