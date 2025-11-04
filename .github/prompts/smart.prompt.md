---
mode: agent
---
# CONTEXTO E REGRAS PARA O PROJETO Smarthub Dash

## 1. Stack de Tecnologia Principal (Tech Stack)
O código gerado deve ser estritamente compatível com esta stack:
- **Build Tool:** Vite 5.4.21 com SWC
- **Linguagem:** TypeScript 5.8.3 (Strict Mode)
- **Framework UI:** React 18.3.1 (Componentes Funcionais com Hooks)
- **Roteamento:** React Router DOM 6.30.1
- **Estilização:** Tailwind CSS 3.4.17
- **Componentes de UI:** shadcn/ui baseado em Radix UI. Use componentes de `@/components/ui` sempre que possível.
- **Backend e Autenticação:** Supabase 2.76.1, usando o pacote `@supabase/supabase-js`.
- **State Management:** TanStack Query 5.83.0 (React Query) para server state
- **Formulários:** React Hook Form 7.61.1 com Zod 3.25.76 para validação de schemas.
- **Tabelas de Dados:** TanStack Table 8.21.3
- **Ícones:** Lucide React 0.462.0
- **Notificações:** Sonner 1.7.4
- **Armazenamento:** Supabase Storage

## 2. Padrões de Arquitetura
- **Multi-Tenancy:** A arquitetura é multi-tenant. A maioria das tabelas de negócio DEVE conter uma coluna `client_id` para ser usada com Row Level Security (RLS).
- **Componentes:** Todos os componentes são Client Components (React SPA). Use hooks como `useState`, `useEffect`, `useQuery` normalmente.
- **Importações:** Use sempre importações absolutas com o alias `@/` (ex: `import { Button } from '@/components/ui/button'`).
- **Hierarquia de Providers:** A aplicação usa contextos críticos, sempre nesta ordem:
  ```tsx
  <QueryClientProvider>
    <BrowserRouter>
      <AuthProvider>
        <PermissionsProvider>
          <PageHeaderProvider>
            {/* Routes */}
          </PageHeaderProvider>
        </PermissionsProvider>
      </AuthProvider>
    </BrowserRouter>
  </QueryClientProvider>
  ```
- **Tipos:** Use TypeScript strict mode. Defina tipos para props, estados e retornos de funções.
- **Data Fetching:** Use TanStack Query (React Query) com `useQuery` e `useMutation`. Sempre trate estados de `loading`, `error` e dados vazios.
- **Segurança de Dados:** Sempre use fallbacks em arrays: `data={items || []}` para evitar erros de undefined.

## 3. Fluxo de Trabalho e Interação
- **Plano de Execução OBRIGATÓRIO:** Para qualquer tarefa, sua PRIMEIRA resposta DEVE ser um plano de execução objetivo e conciso em formato de lista. Não use formatação de arquivo Markdown nem prosa excessiva. Apenas as etapas técnicas.
- **Aprovação Necessária:** NUNCA gere código ou execute comandos antes que eu aprove seu plano com uma mensagem explícita como "aprovado" ou "pode seguir".

## 4. Regras de Saída e Criação de Arquivos (REGRA ESTRITA)
- **PROIBIÇÃO DE ARQUIVOS DE RELATÓRIO:** **NÃO CRIE** arquivos de resumo, log, checklist, guia ou qualquer outro tipo de arquivo Markdown (`.md`) para documentar suas ações ou progresso. Seu trabalho é gerar CÓDIGO e COMANDOS, não documentação sobre seu próprio trabalho.
- **Comunicação Concisa:** Comunique o progresso de forma direta e objetiva no chat. Exemplo: "Plano aprovado. Gerando o código para a Etapa 1...", em vez de "Perfeito! Agora vou criar um documento de resumo...".
- **Exceção para Documentação:** A ÚNICA exceção para criar arquivos `.md` é se eu solicitar explicitamente a criação de um documento de projeto, que deve ser salvo exclusivamente na pasta `project-md/`.

## 5. Prevenção de Bugs Comuns (CRÍTICO)

### 5.1 Botões em Formulários
**Problema:** Botões sem `type="button"` dentro de `<form>` causam submit não intencional.
**Solução:** SEMPRE use `<Button type="button">` para botões que não devem submeter o formulário (ex: abrir modais, alternar views). Apenas o botão principal de submit pode omitir ou usar `type="submit"`.

### 5.2 Arrays Undefined em .map()
**Problema:** Tentar usar `.map()` em dados de `useQuery` que ainda estão `undefined` causa crash.
**Solução:**
```tsx
// ✅ CORRETO
if (isLoading) return <div>Carregando...</div>;
if (error) return <div>Erro ao carregar</div>;

return (
  <DataTable data={items || []} />
  // ou
  {(items || []).map(item => <div key={item.id}>{item.name}</div>)}
);
```

### 5.3 Queries Dependentes
**Problema:** Fazer query B antes de query A completar causa erros.
**Solução:** Use `enabled` para aguardar dependências:
```tsx
const { data: user } = useQuery({ queryKey: ['user'], queryFn: getUser });
const { data: profile } = useQuery({ 
  queryKey: ['profile', user?.id], 
  queryFn: () => getProfile(user.id),
  enabled: !!user?.id // só executa quando user.id existir
});
```

### 5.4 Formulários com react-hook-form
**Padrão obrigatório:**
```tsx
const form = useForm({
  resolver: zodResolver(schema),
  defaultValues: { ... }
});

const onSubmit = async (data: FormData) => {
  try {
    // lógica de submit
    toast.success("Sucesso!");
  } catch (error) {
    toast.error("Erro ao salvar");
    console.error(error);
  }
};
```

### 5.5 Multi-Tenant Isolation
**Regra crítica:** Toda query de dados de cliente DEVE filtrar por `client_id`:
```tsx
// ✅ CORRETO
const { data } = useQuery({
  queryKey: ['items', clientId],
  queryFn: async () => {
    const { data } = await supabase
      .from('items')
      .select('*')
      .eq('client_id', clientId); // OBRIGATÓRIO
    return data;
  }
});
```

### 5.6 Não Remover Funcionalidades
**Regra:** Ao refatorar, NUNCA remova funcionalidades existentes (botões, menus, features) a menos que o prompt solicite explicitamente.