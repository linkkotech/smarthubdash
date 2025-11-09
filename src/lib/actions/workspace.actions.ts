/**
 * @fileoverview Ações para Workspaces
 * 
 * Operações administrativas para gerenciar workspaces.
 * Este é um projeto Vite/React, então as operações são executadas
 * diretamente no cliente com o Supabase.
 * 
 * ⚠️ SEGURANÇA: SERVICE_ROLE_KEY é necessário para contornar RLS.
 * RLS policies no Supabase garantem que apenas Super Admins podem deletar.
 */

import { supabaseServer } from "@/lib/supabase/server";

/**
 * Interface de resposta para ações
 */
interface ActionResponse {
  success: boolean;
  message?: string;
  error?: string;
  data?: any;
}

/**
 * Delete a workspace, its owner user, and all associated data
 * 
 * Flow:
 * 1. Chama Edge Function delete-workspace-user que:
 *    - Obtém owner_id do workspace
 *    - Deleta auth.users (cascata deleta profile via FK)
 *    - Deleta workspace (cascata deleta workspace_members)
 * 2. A RPC delete_workspace_safely contorna validação de prevent_last_owner_downgrade
 * 
 * @param workspaceId - UUID do workspace a deletar
 * @returns ActionResponse com sucesso ou erro
 * 
 * @example
 * const result = await deleteWorkspace("uuid-123");
 * if (result.success) {
 *   console.log("Workspace e usuário deletados!");
 * } else {
 *   console.error(result.error);
 * }
 */
export async function deleteWorkspace(
  workspaceId: string
): Promise<ActionResponse> {
  try {
    // Validação básica
    if (!workspaceId || typeof workspaceId !== "string") {
      return {
        success: false,
        error: "ID do workspace inválido",
      };
    }

    // Log para auditoria
    console.log(`[DELETE_WORKSPACE] Iniciando exclusão do workspace: ${workspaceId}`);

    // ========================================================================
    // STEP 1: Chamar Edge Function para deletar auth.users + workspace
    // ========================================================================
    console.log(`[DELETE_WORKSPACE] Chamando Edge Function delete-workspace-user...`);

    const edgeFunctionUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/delete-workspace-user`;

    const edgeFunctionResponse = await fetch(edgeFunctionUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${(await supabaseServer.auth.getSession()).data.session?.access_token || ""}`,
      },
      body: JSON.stringify({ workspace_id: workspaceId }),
    });

    if (!edgeFunctionResponse.ok) {
      const errorData = await edgeFunctionResponse.json();
      console.error(
        `[DELETE_WORKSPACE_ERROR] Edge Function error:`,
        errorData
      );

      return {
        success: false,
        error: errorData.error || "Erro ao deletar workspace e usuário",
      };
    }

    const edgeFunctionData = await edgeFunctionResponse.json();

    if (!edgeFunctionData.success) {
      console.error(
        `[DELETE_WORKSPACE_ERROR] Edge Function retornou erro:`,
        edgeFunctionData.error
      );

      return {
        success: false,
        error: edgeFunctionData.error || "Erro ao deletar workspace e usuário",
      };
    }

    // Log de sucesso
    console.log(
      `[DELETE_WORKSPACE_SUCCESS] Workspace e usuário deletados com sucesso: ${workspaceId}`
    );

    // Nota: Em um projeto Vite/React, a atualização da UI é feita via
    // React Query refetch() ou hooks customizados, não via revalidatePath

    return {
      success: true,
      message: "Workspace e usuário excluídos com sucesso",
      data: edgeFunctionData,
    };
  } catch (error: any) {
    console.error("[DELETE_WORKSPACE_CATCH]", error);

    return {
      success: false,
      error: error.message || "Erro desconhecido ao deletar workspace",
    };
  }
}
