import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.76.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface CreateUserWithoutInviteRequest {
  email: string
  full_name: string
  client_id: string
  client_user_role: string
  unidade?: string | null
  team_id?: string | null
  status: 'ativo' | 'inativo'
  sendInvite?: boolean
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    // 1. Parse request body
    const requestBody: CreateUserWithoutInviteRequest = await req.json()

    // Extract sendInvite flag (default: true for backward compatibility)
    const sendInvite = requestBody.sendInvite ?? true

    console.log('📥 Request received:', {
      email: requestBody.email,
      full_name: requestBody.full_name,
      client_id: requestBody.client_id,
      client_user_role: requestBody.client_user_role,
      unidade: requestBody.unidade,
      team_id: requestBody.team_id,
      status: requestBody.status,
      sendInvite: sendInvite,
    })

    // 2. Validate required fields
    if (!requestBody.email || !requestBody.full_name || !requestBody.client_id || !requestBody.client_user_role) {
      return new Response(
        JSON.stringify({ error: 'Campos obrigatórios faltando: email, full_name, client_id, client_user_role' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // 3. Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(requestBody.email)) {
      return new Response(
        JSON.stringify({ error: 'Email inválido' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log('Creating user without invite for:', { email: requestBody.email, full_name: requestBody.full_name })

    // 4. Create admin client with service role
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    // 6. Create user in Auth based on sendInvite flag
    let newUserId: string
    
    if (sendInvite) {
      // Path 1: Send invite email (admin API)
      console.log(`📧 Enviando convite para: ${requestBody.email}`)
      
      const { data: authData, error: authError } = await supabaseAdmin.auth.admin.inviteUserByEmail(
        requestBody.email,
        {
          data: {
            full_name: requestBody.full_name
          }
        }
      )

      // If email already exists, retrieve the existing user instead of failing
      if (authError && authError.code === 'email_exists') {
        console.log(`⚠️ Email já existe no Auth. Buscando user ID existente...`)
        
        // List users to find the one with this email
        const { data: listData, error: listError } = await supabaseAdmin.auth.admin.listUsers()

        if (listError) {
          console.error('Erro ao listar usuários:', listError)
          return new Response(
            JSON.stringify({ 
              error: `Erro ao buscar usuário existente: ${listError.message}` 
            }),
            { 
              status: 400, 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
            }
          )
        }

        // Find user with matching email
        const existingUser = listData.users?.find((u: any) => u.email === requestBody.email)

        if (!existingUser?.id) {
          console.error('Usuário não encontrado mesmo após email_exists')
          return new Response(
            JSON.stringify({ 
              error: 'Usuário com este email não foi encontrado no Auth' 
            }),
            { 
              status: 400, 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
            }
          )
        }

        newUserId = existingUser.id
        console.log('✅ Usuário existente reutilizado. User ID:', newUserId)
      } else if (authError) {
        // Other errors - not email_exists
        console.error('Erro ao enviar convite:', authError)
        return new Response(
          JSON.stringify({ 
            error: `Erro ao enviar convite: ${authError.message}` 
          }),
          { 
            status: 400, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
      } else if (!authData.user?.id) {
        console.error('Convite enviado mas sem ID de usuário retornado')
        return new Response(
          JSON.stringify({ 
            error: 'Usuário criado no Auth mas sem ID' 
          }),
          { 
            status: 400, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
      } else {
        newUserId = authData.user.id
        console.log('📧 Convite enviado com sucesso. User ID:', newUserId)
      }
    } else {
      // Path 2: Create user directly without email notification
      console.log(`⚡ Criando usuário sem notificação: ${requestBody.email}`)

      // Generate secure temporary password
      const tempPassword = Math.random().toString(36).slice(-12) + 'Aa1!'

      const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
        email: requestBody.email,
        password: tempPassword,
        email_confirm: true, // Auto-confirm to skip email verification
        user_metadata: {
          full_name: requestBody.full_name
        }
      })

      if (authError) {
        console.error('Erro ao criar usuário no auth:', authError)
        return new Response(
          JSON.stringify({ 
            error: `Erro ao criar usuário no Auth: ${authError.message}` 
          }),
          { 
            status: 400, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
      }

      if (!authData.user?.id) {
        console.error('Auth user created but no ID returned')
        return new Response(
          JSON.stringify({ 
            error: 'Usuário criado no Auth mas sem ID' 
          }),
          { 
            status: 400, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
      }

      newUserId = authData.user.id
      console.log('Usuário criado com sucesso. User ID:', newUserId)
    }

    // 7. Prepare profile data (unified for both paths)
    const profileData = {
      id: newUserId,
      full_name: requestBody.full_name,
      email: requestBody.email,
      client_id: requestBody.client_id,
      client_user_role: requestBody.client_user_role,
      unidade: requestBody.unidade || null,
      team_id: requestBody.team_id || null,
      status: requestBody.status,
    }

    console.log('📦 Profile data prepared:', {
      id: profileData.id,
      email: profileData.email,
      client_id: profileData.client_id,
      team_id: profileData.team_id,
      status: profileData.status,
      unidade: profileData.unidade,
    })

    // 8. Insert profile into profiles table
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .insert([profileData])

    if (profileError) {
      console.error('❌ Error inserting profile:', {
        message: profileError.message,
        details: profileError.details,
        hint: profileError.hint,
        code: profileError.code,
      })
      
      // Rollback: Delete the Auth user
      console.log('🔄 Rolling back - deleting Auth user:', newUserId)
      const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(newUserId)
      
      if (deleteError) {
        console.error('Rollback failed - could not delete Auth user:', deleteError)
        return new Response(
          JSON.stringify({ 
            error: 'Erro crítico: Perfil não inserido e usuário não pôde ser removido do Auth' 
          }),
          { 
            status: 500, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
      }

      console.log('Auth user deleted successfully (rollback completed)')
      return new Response(
        JSON.stringify({ 
          error: `Erro ao inserir perfil: ${profileError.message}` 
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    console.log('Profile inserted successfully')

    // 9. Success response
    return new Response(
      JSON.stringify({ 
        success: true,
        user_id: newUserId,
        message: 'Usuário criado com sucesso sem convite de email'
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('❌ Unexpected error in create-user-without-invite:', error)
    console.error('📋 Error details:', {
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      type: typeof error,
    })
    return new Response(
      JSON.stringify({ 
        error: 'Erro interno do servidor',
        details: error instanceof Error ? error.message : String(error)
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})
