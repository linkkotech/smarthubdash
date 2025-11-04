import { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { usePageHeader } from "@/contexts/PageHeaderContext";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useWorkspace } from "@/hooks/useWorkspace";
import { WorkspaceDetailCard } from "@/components/clients/WorkspaceDetailCard";
import { WorkspaceActions } from "@/components/clients/WorkspaceActions";

/**
 * Skeleton para estado de carregamento da página de detalhes
 */
function WorkspaceDetailsSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Skeleton className="h-9 w-24" />
        <Skeleton className="h-8 w-48" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-32 w-full lg:col-span-2" />
      </div>
    </div>
  );
}

/**
 * ClientDetails - Página de detalhes de um workspace
 * 
 * @description
 * Exibe informações detalhadas de um workspace específico incluindo:
 * - Dados principais (nome, tipo, documento)
 * - Informações do administrador (owner)
 * - Metadados (slug, data de criação)
 * - Botões de ação (editar, impersonar, excluir)
 * 
 * Rota: /clientes/:id
 * 
 * @example
 * // Acessado via /clientes/cb8fff87-005d-4951-af4a-dd710ad153ba
 */
export default function ClientDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { setConfig } = usePageHeader();

  // Buscar workspace pelo ID
  const { data: workspace, isLoading, error } = useWorkspace(id!);

  // Configurar cabeçalho da página
  useEffect(() => {
    if (workspace) {
      setConfig({
        title: workspace.name,
        showSearch: false,
      });
    }

    // Cleanup ao desmontar
    return () => {
      setConfig({
        title: "",
        showSearch: false,
      });
    };
  }, [workspace, setConfig]);

  // Validação de ID
  useEffect(() => {
    if (!id) {
      toast.error("ID do workspace não fornecido");
      navigate("/clientes");
    }
  }, [id, navigate]);

  // Tratamento de erro
  useEffect(() => {
    if (error) {
      console.error("Erro ao carregar workspace:", error);
      toast.error("Workspace não encontrado");
      navigate("/clientes");
    }
  }, [error, navigate]);

  // Estado de loading
  if (isLoading) {
    return (
      <div className="p-6">
        <WorkspaceDetailsSkeleton />
      </div>
    );
  }

  // Estado de erro ou workspace não encontrado
  if (!workspace) {
    return null;
  }

  return (
    <div className="p-6 space-y-6">
      {/* Botão Voltar */}
      <div className="flex items-center justify-between">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => navigate("/clientes")}
          className="gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar para lista
        </Button>

        {/* Botões de ação */}
        <WorkspaceActions workspace={workspace} />
      </div>

      {/* Card com detalhes do workspace */}
      <WorkspaceDetailCard workspace={workspace} />
    </div>
  );
}
