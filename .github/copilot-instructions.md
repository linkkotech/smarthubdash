# SmartHub Copilot Instructions

## Architecture Overview

**SmartHub** is a **multi-tenant SaaS dashboard** built with **Vite + React + TypeScript** connected to **Supabase**. It provides admin and client-facing interfaces for managing workspaces, teams, users, contracts, and digital profiles.

### Key Layers
- **Frontend**: React Router (SPAs), shadcn-ui components, TanStack Query (data fetching), Tailwind CSS
- **Backend**: Supabase (PostgreSQL + Auth + Edge Functions)
- **Authentication**: Supabase Auth with role-based access control (RBAC)

## Critical Data Flows

### 1. Multi-Tenant User Role Hierarchy
```
Platform Level: user_roles table
├─ super_admin / admin / manager (checked by is_platform_admin() RPC)
└─ Controls access to /dashboard, /teams, /clients

Client Level: client_user_role column in profiles
├─ client_admin / client_manager / client_member
└─ Controls access to /client/* routes within a tenant
```

**Key Files**: `src/contexts/AuthContext.tsx`, `src/contexts/PermissionsContext.tsx`, `src/components/layout/ProtectedRoute.tsx`

### 2. Authentication Flow
1. **Sign-in** → Supabase Auth (email/password)
2. **Fetch roles** → Query `user_roles` table for platform roles
3. **Check admin status** → Call `is_platform_admin()` RPC function
4. **Route conditional redirect** → Admin → /dashboard; Client → /client/dashboard

### 3. Data Fetching Pattern (TanStack Query)
All data operations use `useQuery` hooks. Example:
```tsx
const { data: workspace, isLoading, error } = useQuery({
  queryKey: ['workspace', workspaceId],
  queryFn: async () => {
    const { data } = await supabase
      .from('workspaces')
      .select('*, workspace_members(...)')
      .eq('id', workspaceId);
    return data?.[0];
  }
});
```

## Database Schema Essentials

### Core Tables
- **profiles**: User accounts (linked to auth.users)
- **user_roles**: Platform-level roles (super_admin, admin, manager)
- **clients**: Tenant/workspace records with client_type (pessoa_fisica/pessoa_juridica)
- **contracts**: Plans linked to clients with billing dates
- **plans**: Service tiers with features (JSONB) and max_users
- **digital_profiles**: Published pages/digital profiles per client
- **digital_templates**: Reusable profile templates (profile_template or content_block)
- **teams**: Client-specific teams with members

### Type Generation
Types auto-generated at `src/integrations/supabase/types.ts` — **regenerate after migrations** with:
```bash
npm install
# Or: supabase gen types typescript --project-id <PROJECT_ID>
```

## Project Structure

```
src/
├── components/        # UI components organized by feature (layout/, clients/, teams/, etc.)
├── contexts/         # Global state: AuthContext, PermissionsContext, etc.
├── hooks/            # Custom hooks (usePermissions, useWorkspace, useWorkspaces)
├── integrations/     # Supabase client & auto-generated types
├── lib/              # Utilities (supabase/server.ts, utils.ts, actions/)
├── pages/            # Route pages (Login, Dashboard, Teams, Clients, Settings, etc.)
├── types/            # Custom TypeScript interfaces
└── App.tsx           # Main routing config

supabase/
├── migrations/       # SQL migrations (version control)
├── functions/        # Deno Edge Functions (create-workspace, delete-workspace-user, etc.)
└── config.toml       # Supabase project config
```

## Development Workflows

### Start Dev Server
```bash
npm run dev          # Runs Vite on port 8080
```

### Build & Deploy
```bash
npm run build        # Optimize bundle (Vite output)
npm run build:dev    # Dev mode build (faster, unoptimized)
npm run lint         # ESLint check
```

### Database Changes
1. **Create migration**: `supabase migration new migration_name`
2. **Write SQL** in `supabase/migrations/TIMESTAMP_name.sql`
3. **Apply locally**: Supabase CLI or manual SQL execution
4. **Regenerate types**: `npm install` (auto-runs after supabase install)
5. **Test in app**: Verify permissions, queries, RLS policies

### Testing RPC Functions
Query in Supabase dashboard SQL Editor:
```sql
SELECT public.is_platform_admin('USER_UUID'::uuid);
```

## Conventions & Patterns

### 1. **Component Organization**
- Feature-based: `/components/clients/`, `/components/teams/`, `/components/ui/`
- UI primitives in `/components/ui/` (button, dialog, table, etc.)
- Page layouts in `/components/layout/` (ProtectedRoute, AppLayout, SidebarLayout)

### 2. **Form Validation**
Use **Zod** schemas for runtime validation + TypeScript inference:
```tsx
import { z } from 'zod';

const schema = z.object({
  email: z.string().email(),
  name: z.string().min(3).max(100)
});

type FormData = z.infer<typeof schema>;
```

### 3. **API Calls to Supabase**
```tsx
import { supabase } from '@/integrations/supabase/client';

// SELECT
const { data, error } = await supabase
  .from('table_name')
  .select('*')
  .eq('id', id);

// INSERT
const { error } = await supabase
  .from('table_name')
  .insert({ field: value });

// RPC (server-side function)
const { data, error } = await supabase.rpc('function_name', { param: value });
```

### 4. **Error Handling & Toasts**
```tsx
import { toast } from 'sonner';

try {
  // operation
} catch (error) {
  console.error(error);
  toast.error('Operation failed');
}
```

### 5. **Styling**
- **Tailwind CSS** for utility classes (no inline styles)
- **shadcn-ui** for ready-made components (dialog, table, form, etc.)
- Dark mode support via `next-themes` (class-based)
- Custom colors/fonts in `tailwind.config.ts`

### 6. **Role-Based UI Rendering**
```tsx
import { useAuth } from '@/contexts/AuthContext';

const { hasRole } = useAuth();
if (hasRole('admin')) {
  return <AdminPanel />;
}
```

## Common Gotchas

1. **Type mismatch after migrations** → Regenerate types: `npm install`
2. **RPC functions return `null` instead of `undefined`** → Always check `data !== null`
3. **Supabase Auth persists in localStorage** → Clear during logout; test in incognito mode
4. **TanStack Query cache** → Use `.refetch()` or `queryClient.invalidateQueries()` to refresh
5. **Missing RLS policies** → Direct table queries may fail silently in production; check Supabase dashboard

## Key Files Reference

| File | Purpose |
|------|---------|
| `src/App.tsx` | Route definitions & top-level providers |
| `src/contexts/AuthContext.tsx` | User auth state + role fetching |
| `src/contexts/PermissionsContext.tsx` | Platform admin check + caching |
| `src/integrations/supabase/client.ts` | Supabase client instance |
| `src/components/layout/ProtectedRoute.tsx` | Auth guard with role checks |
| `tailwind.config.ts` | Theme, colors, custom styles |
| `eslint.config.js` | Linting rules (minimal, lenient) |
| `supabase/migrations/` | Database version control |
| `supabase/functions/` | Deno-based serverless functions |

## When Adding Features

1. **Define Zod schema** for input validation
2. **Add Supabase table/function** if new data needed
3. **Create React component** in appropriate feature folder
4. **Add TanStack Query hook** if fetching data
5. **Wire in page** and test auth guards
6. **Verify RLS policies** allow user access in Supabase dashboard
