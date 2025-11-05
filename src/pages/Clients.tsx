import { useEffect, useState, useCallback } from "react";
import { usePermissions } from "@/hooks/usePermissions";
import { usePageHeader } from "@/contexts/PageHeaderContext";
import { useWorkspaces } from "@/hooks/useWorkspaces";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus } from "lucide-react";
import { ClientForm } from "@/components/clients/ClientForm";
import { WorkspacesTable } from "@/components/clients/WorkspacesTable";
import { WorkspaceTableRow } from "@/types/workspace";
import { toast } from "@/hooks/use-toast";

/**
 * Página: Clientes (Workspaces)
 * 
 * Lista todos os workspaces visíveis para o usuário atual com funcionalidades avançadas:
 * - Campo de busca para filtrar workspaces por nome, owner, email ou documento
 * - Checkboxes para seleção em massa (preparado para ações futuras)
 * - Chevron para expandir/recolher detalhes de cada workspace
 * - Detalhes expansíveis com 3 colunas: informações básicas, metadados e ações rápidas
 * - Ordenação por colunas
 * - Adicionar novo workspace (somente admin/super_admin)
 * - Editar workspace existente
 * - Logar como admin do workspace
 * - Desativar workspace
 * 
 * @component
 * @example
 * // Esta página é automaticamente renderizada na rota /clientes
 * <Route path="/clientes" element={<Clients />} />
 */
export default function Clients() {
  const { setConfig } = usePageHeader();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedWorkspace, setSelectedWorkspace] = useState<WorkspaceTableRow | null>(null);
  const { isPlatformAdmin } = usePermissions();
  
  // Buscar workspaces usando TanStack Query
  const { data: workspaces = [], isLoading, refetch } = useWorkspaces();

  useEffect(() => {
    setConfig({
      title: "Lista de Workspaces",
      showSearch: true,
      primaryAction: isPlatformAdmin ? {
        label: "Adicionar Cliente",
        icon: <Plus className="h-4 w-4" />,
        onClick: () => setIsFormOpen(true),
      } : undefined,
    });
  }, [setConfig, isPlatformAdmin]);

  /**
   * Handler: Editar workspace
   * Abre o modal de edição com os dados do workspace selecionado
   */
  const handleEdit = useCallback((workspace: WorkspaceTableRow) => {
    setSelectedWorkspace(workspace);
    setIsFormOpen(true);
  }, []);

  /**
   * Handler: Logar como admin do workspace
   * TODO: Implementar funcionalidade de login como admin
   */
  const handleLoginAs = useCallback((workspace: WorkspaceTableRow) => {
    console.log("Logar como admin do workspace:", workspace);
    toast({
      title: "Funcionalidade em desenvolvimento",
      description: "Login como admin do workspace estará disponível em breve.",
    });
  }, []);

  /**
   * Handler: Desativar workspace
   * TODO: Implementar funcionalidade de desativação
   */
  const handleDeactivate = useCallback(async (workspace: WorkspaceTableRow) => {
    console.log("Desativar workspace:", workspace);
    toast({
      title: "Funcionalidade em desenvolvimento",
      description: "Desativação de workspace estará disponível em breve.",
    });
  }, []);

  /**
   * Handler: Fechar modal de formulário
   */
  const handleFormClose = useCallback(() => {
    setIsFormOpen(false);
    setSelectedWorkspace(null);
  }, []);

  /**
   * Handler: Sucesso ao salvar formulário
   * Recarrega a lista de workspaces
   */
  const handleFormSuccess = useCallback(() => {
    refetch();
    handleFormClose();
  }, [refetch, handleFormClose]);

  return (
    <div className="space-y-6">
      <WorkspacesTable
        data={workspaces}
        loading={isLoading}
        onEdit={handleEdit}
        onLoginAs={handleLoginAs}
        onDeactivate={handleDeactivate}
      />

      <ClientForm
        open={isFormOpen}
        onOpenChange={handleFormClose}
        onSuccess={handleFormSuccess}
      />
    </div>
  );
}
