import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.76.1'

Deno.serve(async (req) => {
  try {
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

    // Create user in auth
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: 'marcelo@linkko.tech',
      password: '123456',
      email_confirm: true,
      user_metadata: {
        full_name: 'Marcelo Dias'
      }
    })

    if (authError) {
      console.error('Error creating user:', authError)
      return new Response(
        JSON.stringify({ error: authError.message }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    }

    const userId = authData.user.id

    // Create profile
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .insert({
        id: userId,
        full_name: 'Marcelo Dias',
        email: 'marcelo@linkko.tech',
        client_id: null,
        client_user_role: null
      })

    if (profileError) {
      console.error('Error creating profile:', profileError)
      return new Response(
        JSON.stringify({ error: profileError.message }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // Add super_admin role
    const { error: roleError } = await supabaseAdmin
      .from('user_roles')
      .insert({
        user_id: userId,
        role: 'super_admin'
      })

    if (roleError) {
      console.error('Error creating role:', roleError)
      return new Response(
        JSON.stringify({ error: roleError.message }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        message: 'Super admin criado com sucesso!',
        user: {
          id: userId,
          email: 'marcelo@linkko.tech',
          full_name: 'Marcelo Dias',
          role: 'super_admin'
        }
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Unexpected error:', error)
    const message = error instanceof Error ? error.message : 'Unknown error'
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
})
