# PLANO DE EXECUÇÃO - Novo Fluxo de Adição de Usuários (com/sem convite)

## PARTE 1: BACKEND - Nova Edge Function `create-user-without-invite`

### Estrutura de Arquivos
```
supabase/functions/
├── create-user-without-invite/
│   └── index.ts
```

### Conteúdo da Edge Function: `index.ts`

**Responsabilidades:**
1. Receber dados do usuário do corpo da requisição
2. Criar usuário no Auth com privilégios de admin (sem enviar email)
3. Inserir profile na tabela `profiles`
4. Se falhar em profile, deletar usuário do Auth (rollback)
5. Retornar sucesso ou erro

**Fluxo de Código:**

```typescript
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
  unidade?: string
  team_id?: string
  status: 'ativo' | 'inativo'
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    // 1. Parse request body
    const requestBody: CreateUserWithoutInviteRequest = await req.json()

    // 2. Validate required fields
    if (!requestBody.email || !requestBody.full_name || !requestBody.client_id || !requestBody.client_user_role) {
      return new Response(
        JSON.stringify({ error: 'Campos obrigatórios faltando' }),
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

    // 4. Create admin client
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

    // 5. Generate secure temporary password
    const tempPassword = Math.random().toString(36).slice(-12) + 'Aa1!'

    // 6. Create user in Auth (admin API - no email verification needed)
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: requestBody.email,
      password: tempPassword,
      email_confirm: true, // Auto-confirm to skip email verification
      user_metadata: {
        full_name: requestBody.full_name
      }
    })

    if (authError || !authData.user?.id) {
      console.error('Auth creation error:', authError)
      return new Response(
        JSON.stringify({ error: `Erro ao criar usuário: ${authError?.message || 'ID not returned'}` }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const newUserId = authData.user.id

    // 7. Insert profile data
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

    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .insert([profileData])

    // 8. Rollback if profile insert fails
    if (profileError) {
      console.error('Profile insert error:', profileError)
      
      // Delete the Auth user
      const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(newUserId)
      
      if (deleteError) {
        console.error('Rollback failed - could not delete Auth user:', deleteError)
        return new Response(
          JSON.stringify({ 
            error: 'Erro crítico: Perfil não inserido e usuário não pôde ser removido' 
          }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      return new Response(
        JSON.stringify({ error: `Erro ao inserir perfil: ${profileError.message}` }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // 9. Success response
    return new Response(
      JSON.stringify({ 
        success: true,
        user_id: newUserId,
        message: 'Usuário criado com sucesso'
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Unexpected error:', error)
    return new Response(
      JSON.stringify({ error: 'Erro interno do servidor' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
```

---

## PARTE 2: FRONTEND - Refatorar `AddUserDialog.tsx`

### Etapa 1: Atualizar Schema Zod

**Adicionar campo `sendInvite` ao schema:**

```typescript
const addUserSchema = z.object({
  userName: z.string().trim().min(1, "Nome obrigatório"),
  userEmail: z.string().trim().email("Email inválido"),
  userPosition: z.string().trim().optional().or(z.literal("")),
  userPhone: z.string().trim().max(20).optional().or(z.literal("")),
  userMobile: z.string().trim().max(20).optional().or(z.literal("")),
  unidade: z.string().trim().max(200).optional().or(z.literal("")),
  teamId: z.string().uuid().optional().or(z.literal("")),
  userStatus: z.enum(["active", "inactive"]),
  userRole: z.enum(["user", "manager", "admin"]),
  sendInvite: z.boolean().default(true), // NOVO CAMPO
});
```

### Etapa 2: Adicionar Checkbox no JSX

**Localizar no formulário (antes de salvar) e adicionar:**

```tsx
<FormField
  control={form.control}
  name="sendInvite"
  render={({ field }) => (
    <FormItem className="flex items-center space-x-2">
      <FormControl>
        <Checkbox
          checked={field.value}
          onCheckedChange={field.onChange}
          disabled={isSubmitting}
        />
      </FormControl>
      <FormLabel className="!mt-0">
        Deseja enviar o convite de acesso para este usuário?
      </FormLabel>
    </FormItem>
  )}
/>
```

### Etapa 3: Refatorar `onSubmit` com Lógica Condicional

**Nova estrutura (pseudocódigo):**

```typescript
const onSubmit = async (data: AddUserFormData) => {
  setIsSubmitting(true);
  const operationId = `op_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
  
  try {
    // Validações iniciais (manter igual)
    if (!user?.id || !clientId) {
      toast.error("Usuário não autenticado");
      return;
    }

    if (data.sendInvite) {
      // FLUXO ANTIGO: inviteUserByEmail + profile insert (cliente)
      await createUserWithInvite(data, operationId);
    } else {
      // FLUXO NOVO: Edge Function (admin)
      await createUserWithoutInvite(data, operationId);
    }

    toast.success(`Usuário ${data.userName} adicionado com sucesso!`);
    form.reset();
    onOpenChange(false);
    onSuccess?.();

  } catch (error: any) {
    console.error(`[${operationId}] Erro:`, error);
    toast.error(error.message || "Erro ao adicionar usuário");
  } finally {
    setIsSubmitting(false);
  }
};
```

### Etapa 3a: Helper - `createUserWithInvite()` (FLUXO ANTIGO)

```typescript
async function createUserWithInvite(data: AddUserFormData, operationId: string) {
  console.log(`[${operationId}] Fluxo: Enviando convite`);
  
  const tempPassword = Math.random().toString(36).slice(-12) + "!Aa1";

  // 1. Invite user
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email: data.userEmail,
    password: tempPassword,
  });

  if (authError || !authData.user?.id) {
    throw new Error(authError?.message || "Erro ao enviar convite");
  }

  // 2. Insert profile
  const profileData = {
    id: authData.user.id,
    full_name: data.userName,
    email: data.userEmail,
    client_id: clientId,
    client_user_role: mapRoleToClientRole(data.userRole),
    unidade: data.unidade || null,
    team_id: data.teamId || null,
    status: data.userStatus === "active" ? "ativo" : "inativo",
  };

  const { error: profileError } = await supabase
    .from("profiles")
    .insert([profileData]);

  if (profileError) {
    // Rollback
    await supabase.auth.admin.deleteUser(authData.user.id);
    throw new Error(profileError.message);
  }

  console.log(`[${operationId}] ✅ Usuário criado com convite`);
}
```

### Etapa 3b: Helper - `createUserWithoutInvite()` (FLUXO NOVO)

```typescript
async function createUserWithoutInvite(data: AddUserFormData, operationId: string) {
  console.log(`[${operationId}] Fluxo: Criação direta (sem convite)`);

  const { data: responseData, error } = await supabase.functions.invoke(
    'create-user-without-invite',
    {
      body: {
        email: data.userEmail,
        full_name: data.userName,
        client_id: clientId,
        client_user_role: mapRoleToClientRole(data.userRole),
        unidade: data.unidade || null,
        team_id: data.teamId || null,
        status: data.userStatus === "active" ? "ativo" : "inativo",
      },
    }
  );

  if (error || !responseData?.success) {
    throw new Error(error?.message || responseData?.error || "Erro na criação");
  }

  console.log(`[${operationId}] ✅ Usuário criado sem convite`);
}
```

### Etapa 3c: Helper - `mapRoleToClientRole()`

```typescript
function mapRoleToClientRole(userRole: string): string {
  switch (userRole) {
    case "admin":
      return "client_admin";
    case "manager":
      return "client_manager";
    default:
      return "client_user";
  }
}
```

---

## RESUMO DAS MUDANÇAS

| Componente | Localização | Ação |
|-----------|-----------|------|
| **Edge Function** | `supabase/functions/create-user-without-invite/index.ts` | Criar novo arquivo |
| **Schema Zod** | `AddUserDialog.tsx` linhas ~40-85 | Adicionar `sendInvite: z.boolean()` |
| **Checkbox UI** | `AddUserDialog.tsx` formulário | Adicionar checkbox "Enviar convite?" |
| **onSubmit refatorado** | `AddUserDialog.tsx` linhas ~220-270 | Refatorar para lógica condicional |
| **Helper functions** | `AddUserDialog.tsx` linhas ~271-350 | Adicionar 3 helpers |

---

## FLUXO DE RENDERIZAÇÃO ESPERADO

```
if (sendInvite = true)
  ↓
  supabase.auth.signUp() → Create Auth user
  ↓
  profiles.insert() → Create profile (client-side)

if (sendInvite = false)
  ↓
  supabase.functions.invoke('create-user-without-invite')
  ↓
  Edge Function handles Auth + Profile creation
  ↓
  Rollback on failure
```

---

## APROVAÇÃO NECESSÁRIA

✅ Plano pronto para implementação?
- Parte 1: Edge Function criada em `supabase/functions/create-user-without-invite/`
- Parte 2: AddUserDialog refatorado com checkbox + lógica condicional

