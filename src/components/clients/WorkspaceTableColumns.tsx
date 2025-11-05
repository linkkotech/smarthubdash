/**
 * Definições de colunas para a tabela de Workspaces
 * 
 * Ordem das Colunas:
 * 1. Checkbox - Seleção em massa
 * 2. Chevron - Expandir/recolher detalhes
 * 3. Nome do Workspace (ordenável, clicável para detalhes)
 * 4. Tipo (PJ ou PF com badge)
 * 5. Documento (CPF/CNPJ formatado)
 * 6. Administrador (nome + email do owner)
 * 7. Criado em (data formatada, ordenável)
 * 8. Ações (dropdown com opções)
 */

import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowUpDown, ChevronRight, ChevronDown } from "lucide-react";
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
  expandedRows: Set<string>;
  toggleRow: (rowId: string) => void;
}

/**
 * Formata CPF (xxx.xxx.xxx-xx) ou CNPJ (xx.xxx.xxx/xxxx-xx)
 */
function formatDocument(doc: string | null): string {
  if (!doc) return "—";
  
  const numbers = doc.replace(/\D/g, "");
  
  if (numbers.length === 11) {
    return numbers.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
  }
  
  if (numbers.length === 14) {
    return numbers.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, "$1.$2.$3/$4-$5");
  }
  
  return doc;
}

/**
 * Cria as definições de colunas para a tabela de workspaces
 * 
 * @param navigate - Função de navegação do React Router
 * @param onEdit - Callback para editar workspace
 * @param onLoginAs - Callback para logar como admin do workspace
 * @param onDeactivate - Callback para desativar workspace
 * @param expandedRows - Set com IDs das linhas expandidas
 * @param toggleRow - Função para alternar expansão de uma linha
 * 
 * @returns Array de definições de colunas do TanStack Table
 */
export function createWorkspaceColumns({
  navigate,
  onEdit,
  onLoginAs,
  onDeactivate,
  expandedRows,
  toggleRow,
}: CreateWorkspaceColumnsProps): ColumnDef<WorkspaceTableRow>[] {
  return [
    // Coluna 1: Checkbox de Seleção
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={table.getIsAllPageRowsSelected()}
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Selecionar todos"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Selecionar linha"
          onClick={(e) => e.stopPropagation()}
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    // Coluna 2: Chevron de Expansão
    {
      id: "expander",
      header: () => null,
      cell: ({ row }) => {
        const isExpanded = expandedRows.has(row.id);
        return (
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              toggleRow(row.id);
            }}
            className="h-8 w-8 p-0"
          >
            {isExpanded ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </Button>
        );
      },
      enableSorting: false,
    },
    // Coluna 3: Nome do Workspace
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
    // Coluna 4: Tipo (Badge)
    {
      accessorKey: "client_type_display",
      header: "Tipo",
      cell: ({ row }) => {
        const type = row.original.client_type_display;
        return (
          <Badge variant={type === "Pessoa Jurídica" ? "default" : "secondary"}>
            {type}
          </Badge>
        );
      },
    },
    // Coluna 5: Documento (CPF/CNPJ formatado)
    {
      accessorKey: "document",
      header: "Documento",
      cell: ({ row }) => (
        <span className="font-mono text-sm">
          {formatDocument(row.original.document)}
        </span>
      ),
    },
    // Coluna 6: Administrador (Owner)
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
    // Coluna 7: Data de Criação
    {
      accessorKey: "created_at",
      header: CreatedAtColumnHeader,
      cell: ({ row }) => row.original.created_at_formatted,
    },
    // Coluna 8: Ações
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
