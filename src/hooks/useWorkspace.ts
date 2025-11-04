import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

/**
 * Interface para Workspace com detalhes completos incluindo informações do owner
 * 
 * @property {string} id - UUID do workspace
 * @property {string} name - Nome do workspace
 * @property {string} slug - Slug único para URLs
 * @property {string} client_type - Tipo do cliente (pessoa_juridica ou pessoa_fisica)
 * @property {string} document - CPF (11 dígitos) ou CNPJ (14 dígitos) sem máscara
 * @property {string} created_at - Data de criação ISO 8601
 * @property {string} updated_at - Data de última atualização ISO 8601
 * @property {string} owner_name - Nome completo do owner (obtido via join com profiles)
 * @property {string} owner_email - Email do owner
 */
export interface WorkspaceWithDetails {
  id: string;
  name: string;
  slug: string;
  client_type: 'pessoa_juridica' | 'pessoa_fisica';
  document: string;
  created_at: string;
  updated_at: string;
  owner_name: string;
  owner_email: string;
}

/**
 * Hook para buscar um workspace individual pelo ID
 * 
 * @description
 * Busca os dados de um workspace específico incluindo informações do owner.
 * Faz JOIN com workspace_members e profiles para obter nome e email do administrador.
 * 
 * @param {string} workspaceId - UUID do workspace a ser buscado
 * 
 * @returns {Object} Objeto com dados do workspace e estados do TanStack Query
 * @returns {WorkspaceWithDetails | undefined} data - Dados do workspace com owner
 * @returns {boolean} isLoading - Estado de carregamento
 * @returns {Error | null} error - Erro caso ocorra
 * @returns {Function} refetch - Função para recarregar os dados
 * 
 * @example
 * const { data: workspace, isLoading, error } = useWorkspace(workspaceId);
 * 
 * if (isLoading) return <Skeleton />;
 * if (error) return <ErrorMessage />;
 * if (!workspace) return <NotFound />;
 * 
 * return <WorkspaceDetailCard workspace={workspace} />;
 */
export function useWorkspace(workspaceId: string) {
  return useQuery({
    queryKey: ["workspace", workspaceId],
    queryFn: async (): Promise<WorkspaceWithDetails> => {
      // @ts-ignore - workspaces table not in generated types yet
      const { data, error } = await supabase
        .from("workspaces")
        .select(`
          id,
          name,
          slug,
          client_type,
          document,
          created_at,
          updated_at,
          workspace_members!workspace_members_workspace_id_fkey (
            role,
            profiles (
              full_name,
              email
            )
          )
        `)
        .eq("id", workspaceId)
        .maybeSingle();

      if (error) {
        throw new Error(`Erro ao buscar workspace: ${error.message}`);
      }

      if (!data) {
        throw new Error("Workspace não encontrado");
      }

      // Extrai o owner dos workspace_members
      // @ts-ignore - type mismatch due to missing migration
      const ownerMember = Array.isArray(data.workspace_members)
        // @ts-ignore
        ? data.workspace_members.find((m: any) => m.role === 'owner')
        // @ts-ignore
        : data.workspace_members;

      const owner = ownerMember?.profiles;

      // Formata o resultado
      const workspace: WorkspaceWithDetails = {
        id: data.id,
        name: data.name,
        slug: data.slug,
        client_type: data.client_type,
        document: data.document,
        created_at: data.created_at,
        updated_at: data.updated_at,
        owner_name: owner?.full_name || "Sem administrador",
        owner_email: owner?.email || "",
      };

      return workspace;
    },
    enabled: !!workspaceId,
  });
}
