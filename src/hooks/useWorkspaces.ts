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
  // Buscar o owner nos workspace_members
  const ownerMember = Array.isArray(workspace.workspace_members) 
    ? workspace.workspace_members.find((m: any) => m.role === 'work_owner')
    : workspace.workspace_members;
  
  const owner = ownerMember?.profiles;
  
  return {
    id: workspace.id,
    name: workspace.name,
    slug: workspace.slug,
    owner_name: owner?.full_name || "Sem administrador",
    owner_email: owner?.email || "",
    owner: owner ? {
      full_name: owner.full_name,
      email: owner.email,
    } : undefined,
    client_type_display: workspace.client_type === "pessoa_juridica" ? "Pessoa Jurídica" : "Pessoa Física",
    client_type: workspace.client_type,
    document: workspace.document,
    created_at: workspace.created_at,
    updated_at: workspace.updated_at,
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
 * Comportamento:
 * - Se o usuário é ADMIN/SUPER_ADMIN da plataforma: mostra TODOS os workspaces
 * - Se o usuário é um usuário normal: mostra apenas workspaces onde ele é membro
 * 
 * Query:
 * - Seleciona todos os workspaces
 * - Faz LEFT JOIN com workspace_members onde role = 'owner' (para pegar o admin)
 * - Faz LEFT JOIN com profiles para obter nome e email do owner
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
      workspace_members!workspace_members_workspace_id_fkey (
        role,
        profiles (
          id,
          full_name,
          email
        )
      )
    `)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(`Erro ao buscar workspaces: ${error.message}`);
  }

  if (!data || data.length === 0) {
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
