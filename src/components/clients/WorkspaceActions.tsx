import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Edit, UserCircle, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
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
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { ClientForm } from "./ClientForm";
import type { WorkspaceWithDetails } from "@/types/workspace";

/**
 * Props do componente WorkspaceActions
 */
interface WorkspaceActionsProps {
  /**
   * Dados completos do workspace
   */
  workspace: WorkspaceWithDetails;
}

/**
 * WorkspaceActions - Grupo de botões de ação para o workspace
 * 
 * @description
 * Exibe 3 botões de ação no cabeçalho da página:
 * 1. ✏️ Editar Workspace - Abre modal ClientForm em modo edição
 * 2. 👤 Entrar como Cliente - Placeholder para impersonação futura
 * 3. 🗑️ Excluir Workspace - AlertDialog de confirmação + DELETE
 * 
 * Todos os botões têm feedback de loading e toasts de sucesso/erro.
 * 
 * @param {WorkspaceActionsProps} props - Props do componente
 * @param {WorkspaceWithDetails} props.workspace - Dados do workspace
 * 
 * @example
 * <WorkspaceActions workspace={workspace} />
 */
export function WorkspaceActions({ workspace }: WorkspaceActionsProps) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  /**
   * Mutation para excluir workspace
   */
  const deleteWorkspaceMutation = useMutation({
    mutationFn: async (workspaceId: string) => {
      // @ts-ignore - workspaces table not in generated types yet
      const { error } = await supabase
        .from("workspaces")
        .delete()
        .eq("id", workspaceId);

      if (error) {
        throw new Error(`Erro ao excluir workspace: ${error.message}`);
      }
    },
    onSuccess: () => {
      toast.success("Workspace excluído com sucesso!");
      queryClient.invalidateQueries({ queryKey: ["workspaces"] });
      navigate("/clientes");
    },
    onError: (error: Error) => {
      console.error("Erro ao excluir workspace:", error);
      toast.error(error.message || "Erro ao excluir workspace");
    },
  });

  /**
   * Handler para editar workspace
   */
  const handleEdit = () => {
    setShowEditModal(true);
  };

  /**
   * Handler para impersonar (placeholder)
   */
  const handleImpersonate = () => {
    toast.info("Funcionalidade de impersonação será implementada em breve!");
    // TODO: Implementar edge function impersonate-admin
  };

  /**
   * Handler para confirmar exclusão
   */
  const handleDeleteConfirm = () => {
    deleteWorkspaceMutation.mutate(workspace.id);
  };

  return (
    <>
      <div className="flex items-center gap-2">
        {/* Botão Editar */}
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleEdit}
          className="gap-2"
        >
          <Edit className="h-4 w-4" />
          Editar
        </Button>

        {/* Botão Impersonar */}
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleImpersonate}
          className="gap-2"
        >
          <UserCircle className="h-4 w-4" />
          Entrar como Cliente
        </Button>

        {/* Botão Excluir */}
        <Button
          type="button"
          variant="destructive"
          size="sm"
          onClick={() => setShowDeleteDialog(true)}
          disabled={deleteWorkspaceMutation.isPending}
          className="gap-2"
        >
          <Trash2 className="h-4 w-4" />
          {deleteWorkspaceMutation.isPending ? "Excluindo..." : "Excluir"}
        </Button>
      </div>

      {/* Modal de Edição */}
      {showEditModal && (
        <ClientForm
          open={showEditModal}
          onOpenChange={setShowEditModal}
          workspace={{
            id: workspace.id,
            name: workspace.name,
            client_type: workspace.client_type,
            document: workspace.document,
            admin_name: workspace.owner_name,
            admin_email: workspace.owner_email,
            created_at: workspace.created_at,
            updated_at: workspace.updated_at,
          }}
          onSuccess={() => {
            queryClient.invalidateQueries({ queryKey: ["workspace", workspace.id] });
            queryClient.invalidateQueries({ queryKey: ["workspaces"] });
          }}
        />
      )}

      {/* Dialog de Confirmação de Exclusão */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir o workspace{" "}
              <strong>{workspace.name}</strong>?
              <br />
              <br />
              Esta ação é <strong>irreversível</strong> e irá remover:
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Todos os membros do workspace</li>
                <li>Todas as configurações associadas</li>
                <li>Todos os dados relacionados</li>
              </ul>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Excluir Workspace
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
