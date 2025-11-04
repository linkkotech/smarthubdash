/**
 * Dropdown de ações para cada workspace na tabela
 * 
 * Ações disponíveis:
 * - Editar: Abre modal de edição
 * - Logar como: Faz login como admin do workspace
 * - Desativar: Desativa o workspace
 */

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Edit, LogIn, XCircle } from "lucide-react";
import { WorkspaceTableRow } from "@/types/workspace";

interface WorkspaceActionsDropdownProps {
  workspace: WorkspaceTableRow;
  onEdit: (workspace: WorkspaceTableRow) => void;
  onLoginAs: (workspace: WorkspaceTableRow) => void;
  onDeactivate: (workspace: WorkspaceTableRow) => void;
}

/**
 * Componente de dropdown com ações para um workspace
 * 
 * @param workspace - Dados do workspace
 * @param onEdit - Callback para editar
 * @param onLoginAs - Callback para logar como admin
 * @param onDeactivate - Callback para desativar
 */
export function WorkspaceActionsDropdown({
  workspace,
  onEdit,
  onLoginAs,
  onDeactivate,
}: WorkspaceActionsDropdownProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0">
          <span className="sr-only">Abrir menu</span>
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Ações</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={(e) => {
            e.stopPropagation();
            onEdit(workspace);
          }}
        >
          <Edit className="mr-2 h-4 w-4" />
          Editar
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={(e) => {
            e.stopPropagation();
            onLoginAs(workspace);
          }}
        >
          <LogIn className="mr-2 h-4 w-4" />
          Logar como
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={(e) => {
            e.stopPropagation();
            onDeactivate(workspace);
          }}
          className="text-destructive"
        >
          <XCircle className="mr-2 h-4 w-4" />
          Desativar
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
