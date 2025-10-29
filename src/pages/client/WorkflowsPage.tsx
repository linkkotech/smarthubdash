import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { usePageHeader } from "@/contexts/PageHeaderContext";
import { Bot, Search, Filter, Plus, Zap, MessageSquare, Sparkles } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { AgentSettingsSidebar } from "@/components/agents/AgentSettingsSidebar";
import { PersonalityForm } from "@/components/agents/PersonalityForm";
import { ChatSidebar } from "@/components/clients/ChatSidebar";

// Interface do agente
export interface Agent {
  id: string;
  name: string;
  model: string;
  created_at: string;
  updated_at: string;
}

export default function WorkflowsPage() {
  const navigate = useNavigate();
  const { setConfig } = usePageHeader();
  
  // Estado para gerenciar o agente em criação
  const [agent, setAgent] = useState<Agent | null>(null);
  const [activeSection, setActiveSection] = useState<string>("personalidade");
  const [activeTab, setActiveTab] = useState("onboarding");

  useEffect(() => {
    setConfig({
      title: "Workflows",
      showNotifications: true,
      showHelp: true,
      showSearch: true,
    });
  }, [setConfig]);

  return (
    <div className="space-y-6">
      {/* Título e Descrição */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Configuração</h2>
        <p className="text-muted-foreground">
          Configure seus agentes de IA, Workflows e Campanhas
        </p>
      </div>

      {/* Sistema de Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-8">
          <TabsTrigger value="onboarding">Onboarding</TabsTrigger>
          <TabsTrigger value="perfil">Perfil & Personalidade</TabsTrigger>
          <TabsTrigger value="modelo">Modelo</TabsTrigger>
          <TabsTrigger value="ferramentas">Ferramentas</TabsTrigger>
          <TabsTrigger value="workflows">Workflows</TabsTrigger>
          <TabsTrigger value="seguranca">Segurança</TabsTrigger>
          <TabsTrigger value="webhooks">Webhooks</TabsTrigger>
          <TabsTrigger value="integracoes">Integrações</TabsTrigger>
        </TabsList>

        {/* Tab: Onboarding (ATIVA POR PADRÃO) */}
        <TabsContent value="onboarding">
          {/* Container Centralizado */}
          <div className="flex items-center justify-center min-h-[600px] p-8">
            <div className="w-full max-w-2xl space-y-6">
              
              {/* 1. Título (Fora do Card) */}
              <h3 className="text-3xl md:text-4xl font-bold tracking-tight text-center">
                Quem será o seu novo funcionário?
              </h3>

              {/* 2. Card de Ação Principal */}
              <Card className="bg-muted border-muted shadow-sm">
                <CardContent className="p-6 space-y-4">
                  {/* Textarea com fundo contrastante */}
                  <Textarea
                    placeholder="Descreva o que você quer que o seu Agente faça"
                    className="min-h-[180px] resize-none text-base bg-background border-muted-foreground/20 focus-visible:ring-muted-foreground focus-visible:ring-offset-0"
                    rows={7}
                  />

                  {/* Botão Principal */}
                  <Button 
                    size="lg" 
                    className="w-full text-lg h-14 bg-foreground text-background hover:bg-foreground/90 shadow-sm"
                    onClick={() => {
                      // Cria um agente mock
                      setAgent({
                        id: "novo",
                        name: "Novo Agente",
                        model: "gpt-4o-mini",
                        created_at: new Date().toISOString(),
                        updated_at: new Date().toISOString(),
                      });
                      
                      // Troca para a aba "Perfil & Personalidade"
                      setActiveTab("perfil");
                    }}
                  >
                    Criar Agente
                  </Button>
                </CardContent>
              </Card>

              {/* 3. Botões de Atalho (Abaixo do Card) */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                <Button 
                  variant="outline" 
                  size="default"
                  className="gap-2 w-full sm:w-auto border-muted-foreground/50 text-muted-foreground hover:bg-muted hover:text-foreground hover:border-muted-foreground transition-colors"
                >
                  <Sparkles className="h-4 w-4" />
                  Quero criar um SDR Low Ticket
                </Button>

                <Button 
                  variant="outline" 
                  size="default"
                  className="gap-2 w-full sm:w-auto border-muted-foreground/50 text-muted-foreground hover:bg-muted hover:text-foreground hover:border-muted-foreground transition-colors"
                >
                  <Sparkles className="h-4 w-4" />
                  Quero criar uma Secretária
                </Button>
              </div>

            </div>
          </div>
        </TabsContent>

        {/* Tab: Perfil & Personalidade */}
        <TabsContent value="perfil">
          {agent ? (
            // Layout de 3 colunas (copiado de AgentSettingsPage)
            <div className="flex h-full bg-background -mx-6 -my-6">
              {/* Coluna 1: Sidebar de Navegação (Esquerda) */}
              <aside className="w-[350px] border-r bg-card h-full overflow-y-auto">
                <AgentSettingsSidebar 
                  agent={agent}
                  activeSection={activeSection}
                  onSectionChange={setActiveSection}
                />
              </aside>

              {/* Coluna 2: Conteúdo Principal - Formulários (Centro) */}
              <main className="flex-1 overflow-x-hidden h-full overflow-y-auto">
                {activeSection === "personalidade" && <PersonalityForm agent={agent} />}
                {activeSection === "personalidade-basico" && <PersonalityForm agent={agent} />}
                {activeSection === "personalidade-avancado" && <PersonalityForm agent={agent} />}
                {activeSection === "cargo" && <div className="p-8"><p className="text-muted-foreground">Cargo (Em breve)</p></div>}
                {activeSection === "cerebro" && <div className="p-8"><p className="text-muted-foreground">Cérebro (Em breve)</p></div>}
                {activeSection === "voz" && <div className="p-8"><p className="text-muted-foreground">Voz (Em breve)</p></div>}
                {activeSection === "visual" && <div className="p-8"><p className="text-muted-foreground">Visual (Em breve)</p></div>}
                {activeSection === "integracoes" && <div className="p-8"><p className="text-muted-foreground">Integrações (Em breve)</p></div>}
                {activeSection === "ferramentas" && <div className="p-8"><p className="text-muted-foreground">Ferramentas (Em breve)</p></div>}
              </main>

              {/* Coluna 3: Chat Preview (Direita) */}
              <aside className="w-[300px] border-l bg-card h-full overflow-y-auto">
                <ChatSidebar />
              </aside>
            </div>
          ) : (
            // Estado vazio: Mostra mensagem para criar um agente
            <Card>
              <CardHeader>
                <CardTitle>Perfil & Personalidade</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Clique em "Criar Workflow Personalizado" ou "Criar Agente" na aba Onboarding para começar a configurar seu agente.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Tab: Modelo */}
        <TabsContent value="modelo" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Modelo</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Em breve: Selecione e configure o modelo de IA a ser utilizado.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab: Ferramentas */}
        <TabsContent value="ferramentas" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Ferramentas</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Em breve: Adicione ferramentas e funcionalidades ao seu agente.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab: Workflows (ATIVA) */}
        <TabsContent value="workflows" className="space-y-6">
          {/* Barra de Filtros e Busca */}
          <div className="flex items-center justify-between gap-4 flex-wrap">
            {/* Filtros à Esquerda */}
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <Filter className="mr-2 h-4 w-4" />
                Categoria
              </Button>
              <Button variant="outline" size="sm">
                <Filter className="mr-2 h-4 w-4" />
                Tipo
              </Button>
            </div>

            {/* Busca à Direita */}
            <div className="relative w-full max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Pesquisar workflow pelo nome"
                className="pl-10"
              />
            </div>
          </div>

          {/* Grid de Workflows */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Card 1: Agente SDR */}
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <Bot className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">Agente SDR</CardTitle>
                    <p className="text-xs text-muted-foreground">workflow</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Automatize a prospecção e qualificação de leads com inteligência artificial
                </p>
              </CardContent>
            </Card>

            {/* Card 2: Suporte */}
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <MessageSquare className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">Suporte</CardTitle>
                    <p className="text-xs text-muted-foreground">workflow</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Atendimento automatizado com respostas inteligentes e contextuais
                </p>
              </CardContent>
            </Card>

            {/* Card 3: Campanha WhatsApp */}
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <Zap className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">Campanha WhatsApp</CardTitle>
                    <p className="text-xs text-muted-foreground">workflow</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Envie mensagens em massa personalizadas via WhatsApp Business API
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Tab: Segurança */}
        <TabsContent value="seguranca" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Segurança</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Em breve: Configure as permissões e políticas de segurança.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab: Webhooks */}
        <TabsContent value="webhooks" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Webhooks</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Em breve: Configure webhooks para integração com sistemas externos.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab: Integrações */}
        <TabsContent value="integracoes" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Integrações</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Em breve: Conecte seu workflow com outras plataformas e serviços.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
