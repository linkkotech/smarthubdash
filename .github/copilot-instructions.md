# Copilot Instructions for SmartHub Dashboard

Diretrizes Mestras do Projeto SmartHub (Versão Consolidada)

Olá, Copilot. Este é o guia definitivo para o nosso projeto. Siga estas diretrizes em todas as suas ações para garantir consistência, eficiência e alta qualidade.
Seção 0: Princípios Fundamentais de Interação (A Regra Mais Importante)

0.1. Foco Absoluto no Código: Sua única função é analisar, planejar e gerar código.

0.2. Proibido Sumários e Relatórios: Você está estritamente proibido de gerar qualquer tipo de documentação de texto que não seja código ou um plano de execução solicitado. Isso inclui resumos executivos, relatórios de correção, checklists, ou mensagens de sucesso.

0.3. Fluxo de Trabalho Estrito (Plano -> Código): Nosso processo é sempre em duas etapas: primeiro, solicitamos um "plano de execução" e, após aprovação, solicitamos a "geração do código". Não desvie deste fluxo.

0.4. NÃO REMOVA FUNCIONALIDADES EXISTENTES: Ao refatorar, NUNCA remova uma funcionalidade existente (botões, menus, etc.), a menos que o prompt peça isso expressamente.
Seção 1: Arquitetura e Padrões Críticos

1.1. Hierarquia de Providers e Contextos: A aplicação usa 3 contextos críticos, sempre nesta ordem:
code Tsx

    
<QueryClientProvider>
  <BrowserRouter>
    <AuthProvider>
      <PermissionsProvider>
        <PageHeaderProvider>
          {/* Routes */}

  

1.2. Estrutura de Layouts:

    SidebarLayout: Contém a sidebar principal e envolve todos os layouts autenticados.

    AppLayout: Para páginas da plataforma/admin (/dashboard, /clientes, etc.).

    ClientLayout: Para páginas do cliente (/app/equipe, /app/crm, etc.).

    Padding Padrão: O conteúdo principal das páginas usa p-6.

1.3. Padrão de Data Fetching (useQuery):

    Use TanStack Query para todas as operações assíncronas.

    Queries Dependentes: Use enabled: !!dependency para aguardar dados de uma query anterior.

    Segurança contra Undefined: Sempre trate os estados de loading, error e empty ANTES de tentar renderizar os dados. Ao passar dados para componentes, use um fallback: data={teamMembers || []}.

    Callbacks de Atualização: Passe a função refetch() para os modais para que eles possam invalidar os dados e atualizar a UI após uma operação de sucesso.

1.4. Padrão de Formulários (react-hook-form + Zod):

    Todos os formulários devem usar react-hook-form com zodResolver.

    A função onSubmit deve ser async e envolta em try...catch para tratar erros e exibir toasts.

    Lógica Transacional: Ao criar um usuário, (1) crie o Auth User, (2) crie o Profile. Se o passo 2 falhar, reverta o passo 1 (delete o Auth User).

1.5. Arquitetura Multi-Tenant (Isolamento por client_id):

    Toda tabela de dados de cliente deve ter uma coluna client_id.

    Toda query deve filtrar por client_id: .eq("client_id", userClientId).

    As políticas de RLS no Supabase garantem essa regra no nível do banco de dados.

1.6. Padrão de Visualização Dupla (Grid + Lista):

    Use um useState para controlar o modo de visualização ('grid' | 'list').

    Passe o estado e a função de alteração para o PageHeaderContext usando setConfig({ viewControls: ... }).

    Renderize o componente apropriado (DataTable ou um div com grid) com base no estado.

Seção 2: Prevenção de Bugs Comuns

2.1. Bug: Página Recarrega ao Clicar em Botões

    Causa: Botões sem type="button" dentro de formulários.

    Prevenção: SEMPRE use <Button type="button"> da Shadcn/UI para botões que não devem submeter o formulário (ex: abrir modais, alternar views). O botão principal do formulário é o único que pode omitir isso (ou usar type="submit").

2.2. Bug: "can't access property 'map' of undefined"

    Causa: Tentar usar .map() em dados de useQuery que ainda estão undefined (no estado de loading).

    Prevenção:

        Sempre verifique if (isLoading) primeiro.

        Sempre use um fallback de array vazio ao passar dados para componentes: <DataTable data={teamMembers || []} /> ou {(teamMembers || []).map(...) }.

        Para verificar se um array está vazio, use a checagem completa: if (!teamMembers || teamMembers.length === 0).

Seção 3: Estilo e UX

    Componentes: Use os componentes da Shadcn/ui sempre que possível.

    Cores: Use as variáveis de cor semânticas do tema (primary, secondary, destructive).

    Feedback: Use toasts (Sonner) para sucesso/falha e desabilite botões durante o loading.

    Ações Destrutivas: Exclusões devem sempre usar um AlertDialog de confirmação.

Este documento consolidado é agora a nossa única fonte da verdade. Ele é muito mais poderoso porque combina a sua visão estratégica e de processo com a análise técnica detalhada da IA.