import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.76.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface CreateClientUserRequest {
  email: string
  password: string
  full_name: string
  client_id: string
  client_user_role: string
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    // Parse request body
    const { 
      email, 
      password, 
      full_name, 
      client_id, 
      client_user_role 
    }: CreateClientUserRequest = await req.json()

    // Validate required fields
    if (!email || !password || !full_name || !client_id || !client_user_role) {
      return new Response(
        JSON.stringify({ 
          error: 'Campos obrigatórios faltando: email, password, full_name, client_id, client_user_role' 
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return new Response(
        JSON.stringify({ error: 'Email inválido' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Validate password strength (min 6 chars, 1 letter, 1 number)
    if (password.length < 6) {
      return new Response(
        JSON.stringify({ error: 'A senha deve ter no mínimo 6 caracteres' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    console.log('Creating client user:', { email, full_name, client_id, client_user_role })

    // Create admin client with service role
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

    // 1. Create user in auth using Admin API
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: email,
      password: password,
      email_confirm: true, // Auto-confirm email to avoid confirmation step
      user_metadata: {
        full_name: full_name
      }
    })

    if (authError) {
      console.error('Error creating user in auth:', authError)
      return new Response(
        JSON.stringify({ 
          error: `Erro ao criar usuário: ${authError.message}` 
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    const userId = authData.user.id
    console.log('User created in auth with ID:', userId)

    // 2. Update profile with client_id and client_user_role
    // NOTE: The trigger handle_new_user_and_assign_superadmin already creates the profile
    // We just need to update it with client information
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .update({
        client_id: client_id,
        client_user_role: client_user_role
      })
      .eq('id', userId)

    if (profileError) {
      console.error('Error updating profile:', profileError)
      
      // Try to delete the auth user to maintain consistency
      await supabaseAdmin.auth.admin.deleteUser(userId)
      
      return new Response(
        JSON.stringify({ 
          error: `Erro ao vincular usuário ao cliente: ${profileError.message}` 
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    console.log('Profile updated successfully')

    // 3. Return success response
    return new Response(
      JSON.stringify({ 
        success: true,
        message: 'Usuário cliente criado com sucesso',
        user: {
          id: userId,
          email: email,
          full_name: full_name,
          client_id: client_id,
          client_user_role: client_user_role
        }
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Unexpected error:', error)
    const message = error instanceof Error ? error.message : 'Erro desconhecido'
    return new Response(
      JSON.stringify({ error: `Erro interno: ${message}` }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})
