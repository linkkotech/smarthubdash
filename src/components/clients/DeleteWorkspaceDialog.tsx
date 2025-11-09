/**
 * @fileoverview Componente: DeleteWorkspaceDialog
 * 
 * AlertDialog para confirmar a exclusão de um workspace.
 * Exibe um aviso claro sobre a irreversibilidade da ação e
 * fornece feedback de carregamento durante a exclusão.
 */

import { useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { deleteWorkspace } from "@/lib/actions/workspace.actions";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface DeleteWorkspaceDialogProps {
  workspaceId: string;
  workspaceName: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

/**
 * Dialog de confirmação para exclusão de workspace
 * 
 * @param workspaceId - UUID do workspace a deletar
 * @param workspaceName - Nome do workspace para exibição
 * @param open - Estado de abertura do dialog
 * @param onOpenChange - Callback para mudar estado do dialog
 * @param onSuccess - Callback executado após sucesso
 */
export function DeleteWorkspaceDialog({
  workspaceId,
  workspaceName,
  open,
  onOpenChange,
  onSuccess,
}: DeleteWorkspaceDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleConfirmDelete = async () => {
    setIsDeleting(true);

    try {
      const result = await deleteWorkspace(workspaceId);

      if (result.success) {
        toast.success(`Workspace "${workspaceName}" excluído com sucesso! ✓`);
        onOpenChange(false);
        onSuccess?.();
      } else {
        toast.error(result.error || "Erro ao excluir workspace");
      }
    } catch (error: any) {
      console.error("Erro ao excluir workspace:", error);
      toast.error("Erro ao excluir workspace. Tente novamente.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <span className="text-2xl">⚠️</span>
            Excluir Workspace
          </AlertDialogTitle>
        </AlertDialogHeader>

        <div className="space-y-3 py-4">
          <div className="text-sm text-muted-foreground">
            Você tem certeza que deseja excluir o workspace <strong>"{workspaceName}"</strong>?
          </div>
          
          <div className="text-sm text-destructive font-semibold">
            Esta ação não pode ser desfeita.
          </div>
          
          <div className="text-sm text-muted-foreground">
            Todos os dados associados, incluindo:
          </div>
          
          <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
            <li>Membros da equipe</li>
            <li>Dados e configurações</li>
            <li>Histórico e registros</li>
          </ul>
          
          <div className="text-destructive text-sm font-semibold">
            Serão permanentemente removidos do sistema.
          </div>
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>
            Cancelar
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirmDelete}
            disabled={isDeleting}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90 gap-2"
          >
            {isDeleting && <Loader2 className="h-4 w-4 animate-spin" />}
            {isDeleting ? "Excluindo..." : "🗑️ Confirmar Exclusão"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
