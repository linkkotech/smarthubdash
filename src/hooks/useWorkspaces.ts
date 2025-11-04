/**
 * Hook: useWorkspaces
 * 
 * Busca todos os workspaces visíveis para o usuário atual (admin/super_admin).
 * Retorna workspaces com informações do owner (nome e email).
 * 
 * @returns {Object} Query result do TanStack Query
 * @returns {WorkspaceTableRow[]} data - Lista de workspaces formatados para exibição
 * @returns {boolean} isLoading - Estado de carregamento
 * @returns {Error | null} error - Erro se houver
 * @returns {Function} refetch - Função para recarregar os dados
 */

import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { WorkspaceWithOwner, WorkspaceTableRow } from "@/types/workspace";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

/**
 * Formata um workspace com owner para exibição na tabela
 */
function formatWorkspaceForTable(workspace: WorkspaceWithOwner): WorkspaceTableRow {
  const owner = workspace.workspace_members[0]?.profiles;
  
  return {
    id: workspace.id,
    name: workspace.name,
    owner_name: owner?.full_name || "Sem administrador",
    owner_email: owner?.email || "",
    client_type_display: workspace.client_type === "pessoa_juridica" ? "PJ" : "PF",
    client_type: workspace.client_type,
    document: workspace.document,
    created_at: workspace.created_at,
    created_at_formatted: format(new Date(workspace.created_at), "dd/MM/yyyy", {
      locale: ptBR,
    }),
  };
}

/**
 * Busca workspaces do banco de dados
 * 
 * NOTA: Esta query assume que as migrations de workspaces já foram aplicadas.
 * Se você estiver vendo erros de tipo, execute as migrations primeiro:
 * - 20251104000002_create_workspaces_table.sql
 * - 20251104000003_create_workspace_members_table.sql
 * 
 * Query:
 * - Seleciona todos os workspaces
 * - Faz join com workspace_members onde role = 'owner'
 * - Faz join com profiles para obter nome e email do owner
 * - Ordena por data de criação (mais recentes primeiro)
 */
async function fetchWorkspaces(): Promise<WorkspaceTableRow[]> {
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
      workspace_members!inner (
        profiles!inner (
          id,
          full_name,
          email
        )
      )
    `)
    .eq("workspace_members.role", "owner")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Erro ao buscar workspaces:", error);
    throw new Error(`Erro ao buscar workspaces: ${error.message}`);
  }

  if (!data) {
    return [];
  }

  // @ts-ignore - type mismatch due to missing migration
  return data.map(formatWorkspaceForTable);
}

export function useWorkspaces() {
  return useQuery({
    queryKey: ["workspaces"],
    queryFn: fetchWorkspaces,
    staleTime: 1000 * 60 * 5, // 5 minutos
  });
}
