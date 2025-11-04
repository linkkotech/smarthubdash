/**
 * Edge Function: create-workspace
 * 
 * Cria um novo workspace com seu administrador inicial.
 * Executa com SERVICE_ROLE_KEY para contornar RLS.
 * 
 * Fluxo:
 * 1. Valida payload
 * 2. Cria workspace na tabela workspaces
 * 3. Chama create-workspace-admin para criar o admin
 * 4. Se erro, reverte a criação do workspace
 * 
 * @endpoint POST /create-workspace
 * 
 * @body {Object} payload
 * @body {string} payload.name - Nome do workspace
 * @body {string} payload.slug - Slug único
 * @body {string} payload.client_type - pessoa_juridica ou pessoa_fisica
 * @body {string} payload.document - CNPJ ou CPF
 * @body {string} payload.admin_email - Email do admin
 * @body {string} payload.admin_name - Nome do admin
 * @body {string} payload.provisional_password - Senha provisória
 * 
 * @returns {Object} { success: boolean, workspace_id: string, user_id: string }
 * 
 * @throws {400} Payload inválido
 * @throws {500} Erro ao criar workspace ou admin
 */

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Inicializar Supabase Admin Client
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );

    // Parse do payload
    const { 
      name, 
      slug, 
      client_type, 
      document,
      admin_email, 
      admin_name, 
      provisional_password 
    } = await req.json();

    // Validação do payload
    if (!name || !slug || !client_type || !document || !admin_email || !admin_name || !provisional_password) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Todos os campos são obrigatórios",
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    console.log(`Criando workspace: ${name} (${slug})...`);

    // ETAPA 1: Criar workspace
    const { data: workspaceData, error: workspaceError } = await supabaseAdmin
      .from("workspaces")
      .insert([{
        name,
        slug,
        client_type,
        document,
      }])
      .select()
      .single();

    if (workspaceError || !workspaceData) {
      console.error("Erro ao criar workspace:", workspaceError);
      return new Response(
        JSON.stringify({
          success: false,
          error: `Erro ao criar workspace: ${workspaceError?.message || "Erro desconhecido"}`,
        }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    console.log(`Workspace criado: ${workspaceData.id}`);

    try {
      // ETAPA 2: Criar usuário administrador via Edge Function
      const createAdminResponse = await fetch(
        `${Deno.env.get("SUPABASE_URL")}/functions/v1/create-workspace-admin`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")}`,
          },
          body: JSON.stringify({
            workspace_id: workspaceData.id,
            email: admin_email,
            password: provisional_password,
            full_name: admin_name,
          }),
        }
      );

      const adminData = await createAdminResponse.json();

      if (!createAdminResponse.ok || !adminData.success) {
        console.error("Erro ao criar admin:", adminData);

        // ROLLBACK: Deletar workspace
        await supabaseAdmin
          .from("workspaces")
          .delete()
          .eq("id", workspaceData.id);
        
        console.log(`Workspace ${workspaceData.id} deletado (rollback)`);

        return new Response(
          JSON.stringify({
            success: false,
            error: `Erro ao criar administrador: ${adminData.error || "Erro desconhecido"}`,
          }),
          {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      console.log(`Admin criado: ${adminData.user_id}`);

      // Sucesso!
      return new Response(
        JSON.stringify({
          success: true,
          workspace_id: workspaceData.id,
          user_id: adminData.user_id,
          message: "Workspace e administrador criados com sucesso",
        }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    } catch (error: any) {
      console.error("Erro ao criar admin:", error);

      // ROLLBACK: Deletar workspace
      await supabaseAdmin
        .from("workspaces")
        .delete()
        .eq("id", workspaceData.id);
      
      console.log(`Workspace ${workspaceData.id} deletado (rollback)`);

      return new Response(
        JSON.stringify({
          success: false,
          error: `Erro inesperado: ${error.message}`,
        }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }
  } catch (error: any) {
    console.error("Erro inesperado:", error);

    return new Response(
      JSON.stringify({
        success: false,
        error: `Erro inesperado: ${error.message}`,
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
