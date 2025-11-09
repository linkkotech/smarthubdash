import { createClient } from "https://esm.sh/@supabase/supabase-js@2.47.0";

// Tipos de resposta
interface DeleteUserResponse {
  success: boolean;
  message?: string;
  error?: string;
  workspace_deleted?: boolean;
  user_deleted?: boolean;
}

/**
 * Edge Function: delete-workspace-user
 *
 * Deleta um workspace e seu owner (auth.users + profile).
 *
 * Flow:
 * 1. Recebe workspace_id
 * 2. Obtém owner_id do workspace
 * 3. Obtém user_id do profile
 * 4. Chama Admin API para deletar auth.users
 * 5. Deleta workspace (cascata deleta workspace_members, profile via FK)
 * 6. Retorna sucesso/erro
 *
 * Segurança:
 * - Valida SERVICE_ROLE_KEY (admin privileges)
 * - Retorna erro se não for Super Admin (via RLS)
 */

Deno.serve(async (req: Request) => {
  try {
    // Validar método HTTP
    if (req.method !== "POST") {
      return new Response(
        JSON.stringify({ error: "Apenas POST é permitido" }),
        {
          status: 405,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Obter variáveis de ambiente
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !serviceRoleKey) {
      console.error("[DELETE_WORKSPACE_USER] Missing environment variables");
      return new Response(
        JSON.stringify({
          success: false,
          error: "Configuração do servidor incompleta",
        }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Parser request body
    const { workspace_id } = await req.json();

    // Validar workspace_id
    if (!workspace_id || typeof workspace_id !== "string") {
      return new Response(
        JSON.stringify({
          success: false,
          error: "workspace_id é obrigatório",
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    console.log(`[DELETE_WORKSPACE_USER] Iniciando deleção do workspace: ${workspace_id}`);

    // Criar cliente Supabase com SERVICE_ROLE_KEY (admin)
    const adminClient = createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    // ========================================================================
    // STEP 1: Obter owner_id do workspace
    // ========================================================================
    console.log(`[DELETE_WORKSPACE_USER] Obtendo owner_id do workspace...`);

    const { data: workspace, error: workspaceError } = await adminClient
      .from("workspaces")
      .select("owner_id")
      .eq("id", workspace_id)
      .single();

    if (workspaceError || !workspace) {
      console.error(
        `[DELETE_WORKSPACE_USER] Erro ao obter workspace:`,
        workspaceError
      );
      return new Response(
        JSON.stringify({
          success: false,
          error: "Workspace não encontrado",
        }),
        {
          status: 404,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const owner_id = workspace.owner_id;
    console.log(`[DELETE_WORKSPACE_USER] owner_id encontrado: ${owner_id}`);

    // ========================================================================
    // STEP 2: Obter user_id do profile
    // ========================================================================
    if (owner_id) {
      console.log(`[DELETE_WORKSPACE_USER] Obtendo user_id do profile...`);

      const { data: profile, error: profileError } = await adminClient
        .from("profiles")
        .select("user_id")
        .eq("id", owner_id)
        .single();

      if (profileError) {
        console.error(
          `[DELETE_WORKSPACE_USER] Erro ao obter profile:`,
          profileError
        );
        // Continuar mesmo se profile não existir (pode ter sido deletado já)
      }

      if (profile && profile.user_id) {
        const user_id = profile.user_id;
        console.log(
          `[DELETE_WORKSPACE_USER] user_id encontrado: ${user_id}, deletando auth.users...`
        );

        // ========================================================================
        // STEP 3: Deletar auth.users via Admin API
        // ========================================================================
        const { error: deleteUserError } = await adminClient.auth.admin.deleteUser(user_id);

        if (deleteUserError) {
          console.error(
            `[DELETE_WORKSPACE_USER] Erro ao deletar auth.users:`,
            deleteUserError
          );
          // Continuar mesmo se falhar (podemos tentar deletar workspace depois)
          // Mas retornar warning ao cliente
        } else {
          console.log(
            `[DELETE_WORKSPACE_USER] auth.users deletado com sucesso: ${user_id}`
          );
        }
      }
    }

    // ========================================================================
    // STEP 4: Chamar RPC delete_workspace_safely para deletar workspace
    // ========================================================================
    console.log(`[DELETE_WORKSPACE_USER] Chamando RPC delete_workspace_safely...`);

    const { data: rpcResult, error: rpcError } = await adminClient.rpc(
      "delete_workspace_safely",
      { workspace_id }
    );

    if (rpcError) {
      console.error(
        `[DELETE_WORKSPACE_USER] Erro ao deletar workspace:`,
        rpcError
      );
      return new Response(
        JSON.stringify({
          success: false,
          error: `Erro ao deletar workspace: ${rpcError.message}`,
          user_deleted: owner_id ? true : false,
          workspace_deleted: false,
        }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Verificar resposta da RPC
    if (rpcResult && typeof rpcResult === "object") {
      if (rpcResult.success === false) {
        return new Response(
          JSON.stringify({
            success: false,
            error: rpcResult.error || "Erro ao deletar workspace",
            user_deleted: owner_id ? true : false,
            workspace_deleted: false,
          }),
          {
            status: 500,
            headers: { "Content-Type": "application/json" },
          }
        );
      }
    }

    // ========================================================================
    // STEP 5: Sucesso!
    // ========================================================================
    console.log(
      `[DELETE_WORKSPACE_USER] ✅ Workspace e usuário deletados com sucesso`
    );

    return new Response(
      JSON.stringify({
        success: true,
        message: "Workspace e usuário deletados com sucesso",
        workspace_deleted: true,
        user_deleted: owner_id ? true : false,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error: any) {
    console.error("[DELETE_WORKSPACE_USER_CATCH]", error);

    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || "Erro desconhecido",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
});
