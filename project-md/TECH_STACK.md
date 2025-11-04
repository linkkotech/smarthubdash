# 🏗️ STACK TÉCNICO - novo-horizonte-lab (SmartHub)

**Versão:** 0.0.0  
**Atualizado:** Novembro 2025  
**Nome do Projeto:** vite_react_shadcn_ts  

---

## 📦 FRONTEND STACK

### Core Framework
| Tecnologia | Versão | Propósito |
|-----------|--------|----------|
| **React** | 18.3.1 | UI Framework |
| **TypeScript** | 5.8.3 | Type Safety & DX |
| **Vite** | 5.4.19 | Build Tool & Dev Server |
| **React Router DOM** | 6.30.1 | Client-side Routing |

### Build & Tooling
```
Bundler:        Vite 5.4.19 (esbuild + Rollup)
Dev Server:     Vite (port: 8080)
Plugin React:   @vitejs/plugin-react-swc 3.11.0 (SWC compiler)
Linter:         ESLint 9.32.0
TypeScript:     5.8.3
PostCSS:        8.5.6 (CSS preprocessing)
```

### UI Component Library
**shadcn/ui** (Radix UI + Tailwind CSS)

#### Componentes Disponíveis
```
✨ Accordion, Alert Dialog, Aspect Ratio, Avatar
✨ Checkbox, Collapsible, Context Menu, Dialog
✨ Dropdown Menu, Hover Card, Label, Menubar
✨ Navigation Menu, Popover, Progress, Radio Group
✨ Scroll Area, Select, Separator, Slider
✨ Switch, Tabs, Toggle, Toggle Group, Tooltip
✨ Command (Combobox), DataTable, Card, Button
✨ Input, Textarea, Form, Toast (Sonner)
```

**Radix UI Packages:**
```json
@radix-ui/react-*: 1.x (25+ primitivos)
```

### Styling
| Tecnologia | Versão | Propósito |
|-----------|--------|----------|
| **Tailwind CSS** | 3.4.17 | Utility-first CSS |
| **TailwindCSS Animate** | 1.0.7 | Animation utilities |
| **Tailwind Merge** | 2.6.0 | Class merging |
| **PostCSS** | 8.5.6 | CSS transformation |
| **Autoprefixer** | 10.4.21 | Vendor prefixes |

### State Management & Data Fetching
| Tecnologia | Versão | Propósito |
|-----------|--------|----------|
| **TanStack Query (React Query)** | 5.83.0 | Server state management |
| **TanStack React Table** | 8.21.3 | Data tables |
| **React Hook Form** | 7.61.1 | Form state & validation |

### Form & Validation
| Tecnologia | Versão | Propósito |
|-----------|--------|----------|
| **Zod** | 3.25.76 | Schema validation |
| **@hookform/resolvers** | 3.10.0 | React Hook Form resolvers |
| **input-otp** | 1.4.2 | OTP input component |

### Utilities & Helpers
| Tecnologia | Versão | Propósito |
|-----------|--------|----------|
| **date-fns** | 3.6.0 | Date formatting (pt-BR support) |
| **clsx** | 2.1.1 | Conditional CSS classes |
| **class-variance-authority** | 0.7.1 | CSS variant management |
| **cmdk** | 1.1.1 | Command menu / Combobox |
| **lucide-react** | 0.462.0 | Icon library |
| **Recharts** | 2.15.4 | Charts & visualizations |
| **Embla Carousel** | 8.6.0 | Carousel component |
| **react-resizable-panels** | 2.1.9 | Resizable panels |

### Notifications & UI Feedback
| Tecnologia | Versão | Propósito |
|-----------|--------|----------|
| **Sonner** | 1.7.4 | Toast notifications |
| **next-themes** | 0.3.0 | Dark/Light mode support |
| **vaul** | 0.9.9 | Drawer component |
| **react-day-picker** | 8.10.1 | Date picker |

---

## 🗄️ BACKEND STACK

### Database & Authentication
| Tecnologia | Versão | Propósito |
|-----------|--------|----------|
| **Supabase** | 2.54.11 (CLI) | Backend as a Service |
| **Supabase JS Client** | 2.76.1 | Frontend client |
| **PostgreSQL** | Latest (Supabase) | Database |

### Supabase Features Utilizadas
```
✨ Authentication (Auth v2)
✨ PostgreSQL Database
✨ Row Level Security (RLS)
✨ Real-time subscriptions
✨ Edge Functions (Deno)
✨ Vector storage
✨ File storage
```

### Database Features
```sql
-- Segurança
✓ RLS (Row Level Security) habilitado
✓ Multi-tenant isolation (client_id)
✓ Custom RPC functions (is_platform_admin)

-- Tabelas Principais
✓ profiles (usuários)
✓ clients (clientes)
✓ teams (equipes)
✓ user_roles (autorização)
✓ contracts (contratos)
✓ plans (planos)
✓ ... (mais de 20 tabelas)

-- Migrations
✓ Versionadas (supabase/migrations)
✓ SQL puro
✓ Reversíveis
```

### Edge Functions
```
✓ create-user-without-invite (Deno)
✓ create-super-admin (Deno)
```

---

## 🔌 INTEGRATIONS

### Protocolos & APIs
```
✓ REST API (Supabase)
✓ Real-time (WebSockets)
✓ OAuth 2.0 (Supabase Auth)
✓ JWT (JSON Web Tokens)
```

### External Services
```
[ ] Email (para implementar)
[ ] SMS (para implementar)
[ ] Webhooks (para implementar)
```

---

## 📊 PROJECT STRUCTURE

```
novo-horizonte-lab/
├── src/
│   ├── components/
│   │   ├── agents/          (AI Agent components)
│   │   ├── client-users/    (Client users management)
│   │   ├── clients/         (Clients management)
│   │   ├── dashboard/       (Dashboard widgets)
│   │   ├── layout/          (Layout components)
│   │   ├── plans/           (Plans management)
│   │   ├── profiles/        (Profile management)
│   │   ├── settings/        (Settings)
│   │   ├── teams/           (Team management)
│   │   ├── templates/       (Template components)
│   │   └── ui/              (shadcn/ui + custom)
│   ├── contexts/
│   │   ├── AuthContext.tsx
│   │   ├── PageHeaderContext.tsx
│   │   └── PermissionsContext.tsx
│   ├── hooks/
│   │   ├── use-mobile.tsx
│   │   ├── use-toast.ts
│   │   └── usePermissions.ts
│   ├── integrations/
│   │   └── supabase/        (Supabase client)
│   ├── lib/
│   │   └── utils.ts
│   ├── pages/
│   │   ├── client/
│   │   ├── settings/
│   │   └── ... (plataforma pages)
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
├── supabase/
│   ├── migrations/          (Database migrations)
│   ├── functions/           (Edge functions - Deno)
│   └── config.toml
├── public/
│   └── robots.txt
├── vite.config.ts
├── tsconfig.json
├── tailwind.config.ts
├── postcss.config.js
├── eslint.config.js
└── package.json
```

---

## 🔐 SECURITY PRACTICES

### Authentication
```
✓ Supabase Auth (JWT tokens)
✓ Session-based authentication
✓ Protected routes with ProtectedRoute component
✓ Role-based access control (RBAC)
```

### Database Security
```
✓ Row Level Security (RLS) habilitado
✓ Multi-tenant isolation por client_id
✓ RPC functions com verificação de role
✓ Policies para leitura/escrita/delete
```

### Code Quality
```
✓ TypeScript (strict mode desativado seletivamente)
✓ ESLint configuration
✓ Type-safe Zod schemas
✓ React Hook Form validation
```

---

## 🚀 PERFORMANCE

### Optimization Techniques
```
✓ Lazy loading com React Router
✓ Code splitting (Vite automatic)
✓ Query caching (TanStack Query)
✓ Image optimization (considerar)
✓ CSS-in-JS com Tailwind (purged)
```

### Build Metrics
```
Build Time:       ~12 segundos
Output Size:      ~1.08 MB (gzipped ~292 KB)
Modules:          2772 modules transformados
Bundle Analysis:  Alguns chunks > 500 KB (considerar split)
```

---

## 🧪 DEVELOPMENT & TESTING

### Dev Tools
```
✓ Vite dev server (hot reload)
✓ React DevTools
✓ React Query DevTools (opcional)
✓ ESLint (linting)
```

### Testing Stack
```
[ ] Unit tests (Jest não instalado)
[ ] E2E tests (Cypress/Playwright não instalado)
[ ] Component tests (Testing Library não instalado)
```

**Sugestão:** Adicionar Jest + React Testing Library para melhor cobertura.

---

## 📋 SCRIPTS DISPONÍVEIS

```bash
# Desenvolvimento
npm run dev              # Inicia dev server (port 8080)

# Build
npm run build            # Build para produção
npm run build:dev        # Build em modo desenvolvimento

# Qualidade de código
npm run lint             # ESLint check

# Preview
npm run preview          # Preview do build
```

---

## 🗝️ KEY TECHNOLOGIES USED

### Frontend
| Tipo | Tecnologia | Versão |
|------|-----------|--------|
| Framework | React + TypeScript | 18.3.1 + 5.8.3 |
| Build Tool | Vite | 5.4.21 |
| Styling | Tailwind CSS | 3.4.17 |
| UI Components | shadcn/ui (Radix) | Latest |
| State (Server) | TanStack Query | 5.83.0 |
| State (Form) | React Hook Form + Zod | 7.61.1 + 3.25.76 |
| Router | React Router | 6.30.1 |
| Notifications | Sonner | 1.7.4 |

### Backend
| Tipo | Tecnologia | Versão |
|------|-----------|--------|
| Backend | Supabase | 2.54.11 |
| Database | PostgreSQL | Latest |
| Auth | Supabase Auth | v2 |
| Functions | Deno | Latest |
| CLI | Supabase CLI | 2.54.11 |

---

## 🔄 DEPLOYMENT STACK

### Local Development
```
Node.js / Bun (package manager)
npm / bun (dependências)
Vite dev server (localhost:8080)
```

### Production
```
[ ] Vercel (suggested)
[ ] Netlify (suggested)
[ ] Self-hosted (Docker)
Supabase cloud (managed)
```

---

## 📈 SCALABILITY CONSIDERATIONS

### Current Strengths
✅ TanStack Query para caching eficiente  
✅ Supabase para escalabilidade automática  
✅ PostgreSQL com RLS nativo  
✅ Edge functions para processamento  
✅ Multi-tenant architecture  

### Recommendations
🔧 Adicionar Redis para cache distribuído  
🔧 Implementar CDN para assets estáticos  
🔧 Considerar GraphQL (Apollo) se complexidade crescer  
🔧 Adicionar monitoring (Sentry, LogRocket)  
🔧 Setup de CI/CD (GitHub Actions)  

---

## 📚 DOCUMENTAÇÃO RELACIONADA

- 📄 `.github/copilot-instructions.md` - Diretrizes do projeto
- 📄 `RELEASE_v1.2.0.md` - Release notes
- 📄 `package.json` - Dependências completas
- 📄 `tsconfig.json` - TypeScript config
- 📄 `vite.config.ts` - Vite config

---

## 🎯 RESUMO EXECUTIVO

**Nome:** novo-horizonte-lab (SmartHub)  
**Tipo:** SaaS Web Application  
**Stack:** React 18 + TypeScript + Supabase + TailwindCSS  
**Arquitetura:** Client-side routing + Server state (Query) + Form state (Hook Form)  
**Database:** PostgreSQL with RLS (multi-tenant)  
**Modelo:** Monorepo (frontend + migrations + functions)  

**Status:** ✅ Production-ready

---

*Última atualização: Novembro 2025*  
*Mantido por: GitHub Copilot*
