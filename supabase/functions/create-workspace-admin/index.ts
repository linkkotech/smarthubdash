/**
 * Edge Function: create-workspace-admin
 * 
 * Cria o usuário administrador de um workspace (owner) e o adiciona
 * automaticamente à tabela workspace_members.
 * 
 * Fluxo:
 * 1. Valida payload (workspace_id, email, password, full_name)
 * 2. Cria Auth User no Supabase Auth
 * 3. Cria/Atualiza Profile na tabela profiles (upsert)
 * 4. Adiciona como owner na tabela workspace_members (role='work_owner')
 * 5. ⚠️ NÃO insere em user_roles (exclusivo para admins de plataforma)
 * 6. Se erro em qualquer etapa, reverte operações (transação manual)
 * 
 * @endpoint POST /create-workspace-admin
 * 
 * @body {Object} payload
 * @body {string} payload.workspace_id - UUID do workspace
 * @body {string} payload.email - Email do administrador
 * @body {string} payload.password - Senha provisória
 * @body {string} payload.full_name - Nome completo
 * 
 * @returns {Object} { success: boolean, user_id: string, profile_id: string }
 * 
 * @throws {400} Payload inválido
 * @throws {500} Erro ao criar usuário ou profile
 */

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type"
};

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, {
      headers: corsHeaders
    });
  }

  try {
    // Inicializar Supabase Admin Client
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );

    // Parse do payload
    const { workspace_id, email, password, full_name } = await req.json();

    // Validação do payload
    if (!workspace_id || !email || !password || !full_name) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "workspace_id, email, password e full_name são obrigatórios"
        }),
        {
          status: 400,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json"
          }
        }
      );
    }

    // Validação de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Email inválido"
        }),
        {
          status: 400,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json"
          }
        }
      );
    }

    // Validação de senha
    if (password.length < 6) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "A senha deve ter no mínimo 6 caracteres"
        }),
        {
          status: 400,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json"
          }
        }
      );
    }

    // Verificar se o workspace existe
    const { data: workspace, error: workspaceError } = await supabaseAdmin
      .from("workspaces")
      .select("id")
      .eq("id", workspace_id)
      .single();

    if (workspaceError || !workspace) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Workspace não encontrado"
        }),
        {
          status: 404,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json"
          }
        }
      );
    }

    console.log(`Criando administrador para workspace ${workspace_id}...`);

    // ETAPA 1: Criar Auth User
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        full_name
      }
    });

    if (authError || !authData.user) {
      console.error("Erro ao criar Auth User:", authError);
      return new Response(
        JSON.stringify({
          success: false,
          error: `Erro ao criar usuário: ${authError?.message || "Erro desconhecido"}`
        }),
        {
          status: 500,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json"
          }
        }
      );
    }

    const userId = authData.user.id;
    console.log(`Auth User criado: ${userId}`);

    try {
      // ETAPA 2: Criar/Atualizar Profile (UPSERT para evitar duplicação)
      const { data: profileData, error: profileError } = await supabaseAdmin
        .from("profiles")
        .upsert(
          [
            {
              id: userId,
              full_name,
              email
            }
          ],
          {
            onConflict: 'id'
          }
        )
        .select()
        .single();

      if (profileError) {
        console.error("Erro ao criar Profile:", profileError);
        // ROLLBACK: Deletar Auth User
        await supabaseAdmin.auth.admin.deleteUser(userId);
        console.log(`Auth User ${userId} deletado (rollback)`);

        return new Response(
          JSON.stringify({
            success: false,
            error: `Erro ao criar profile: ${profileError.message}`
          }),
          {
            status: 500,
            headers: {
              ...corsHeaders,
              "Content-Type": "application/json"
            }
          }
        );
      }

      console.log(`Profile criado/atualizado: ${profileData.id}`);

      // ETAPA 3: Adicionar como owner do workspace
      // ⚠️ IMPORTANTE: NÃO inserir em user_roles
      // workspace_owner é uma role de workspace, não de plataforma
      // As roles de plataforma (super_admin, admin, manager) são EXCLUSIVAS para admins de plataforma
      // Workspace owner é definido via workspace_members.role = 'work_owner'
      const { error: memberError } = await supabaseAdmin
        .from("workspace_members")
        .insert([
          {
            workspace_id,
            profile_id: userId,
            role: "work_owner"  // ✅ Defini como owner do workspace
          }
        ]);

      if (memberError) {
        console.error("Erro ao adicionar workspace member:", memberError);
        // ROLLBACK: Deletar Profile e Auth User
        await supabaseAdmin.from("profiles").delete().eq("id", userId);
        await supabaseAdmin.auth.admin.deleteUser(userId);
        console.log(`Profile e Auth User ${userId} deletados (rollback)`);

        return new Response(
          JSON.stringify({
            success: false,
            error: `Erro ao adicionar membro: ${memberError.message}`
          }),
          {
            status: 500,
            headers: {
              ...corsHeaders,
              "Content-Type": "application/json"
            }
          }
        );
      }

      console.log(`Usuário ${userId} adicionado como owner do workspace ${workspace_id}`);

      // Sucesso!
      return new Response(
        JSON.stringify({
          success: true,
          user_id: userId,
          profile_id: profileData.id,
          message: "Administrador criado e adicionado ao workspace com sucesso"
        }),
        {
          status: 200,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json"
          }
        }
      );

    } catch (error) {
      console.error("Erro inesperado:", error);
      // ROLLBACK: Tentar deletar tudo
      try {
        await supabaseAdmin.from("user_roles").delete().eq("user_id", userId);
        await supabaseAdmin.from("profiles").delete().eq("id", userId);
        await supabaseAdmin.auth.admin.deleteUser(userId);
        console.log(`Rollback completo executado para usuário ${userId}`);
      } catch (deleteError) {
        console.error("Erro ao fazer rollback:", deleteError);
      }

      return new Response(
        JSON.stringify({
          success: false,
          error: `Erro inesperado: ${error.message}`
        }),
        {
          status: 500,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json"
          }
        }
      );
    }

  } catch (error) {
    console.error("Erro no Edge Function:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || "Erro interno do servidor"
      }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json"
        }
      }
    );
  }
});