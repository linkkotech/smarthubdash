import { Link } from "react-router-dom";
import { ClientWithDetails } from "@/pages/ClientDetails";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { ChevronRight, Plus, FileText, Users, Calendar, TrendingUp } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface ClientMainContentProps {
  client: ClientWithDetails;
}

export function ClientMainContent({ client }: ClientMainContentProps) {
  const activeContract = client.contracts?.find((c) => c.is_active);

  return (
    <div className="p-6">
      {/* Breadcrumb + Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
          <Link to="/clientes" className="hover:text-foreground transition-colors">
            Clientes Ativos
          </Link>
          <ChevronRight className="h-4 w-4" />
          <span className="text-foreground">{client.name}</span>
        </div>

        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-1">{client.name}</h1>
            <p className="text-sm text-muted-foreground">
              Criado em: {format(new Date(client.created_at), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
            </p>
          </div>
          <div className="flex gap-2">
            <Button size="sm" variant="outline">
              <FileText className="h-4 w-4 mr-2" />
              Editar Cliente
            </Button>
            <Button size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Nova Atividade
            </Button>
          </div>
        </div>
      </div>

      {/* Tabs de Navegação */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList>
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="contract">Contrato</TabsTrigger>
          <TabsTrigger value="documents">Documentos</TabsTrigger>
          <TabsTrigger value="activities">Atividades</TabsTrigger>
          <TabsTrigger value="history">Histórico</TabsTrigger>
        </TabsList>

        {/* Tab: Visão Geral */}
          <TabsContent value="overview" className="mt-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4 gap-6 mb-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Documentos Pendentes</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">5</div>
                <p className="text-xs text-muted-foreground mt-1">
                  Aguardando envio
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Usuários Ativos</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {activeContract ? `${activeContract.plans.max_users}` : "0"}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Usuários permitidos
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Próximo Vencimento</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {activeContract?.billing_day ? `Dia ${activeContract.billing_day}` : "-"}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Deste mês
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Status do Contrato */}
          <Card>
            <CardHeader>
              <CardTitle>Status do Contrato</CardTitle>
            </CardHeader>
            <CardContent>
              {activeContract ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <p className="text-sm font-medium">Plano Atual</p>
                      <p className="text-2xl font-bold">{activeContract.plans.name}</p>
                    </div>
                    <Badge variant="default" className="text-sm">
                      Ativo
                    </Badge>
                  </div>
                  <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                    <div>
                      <p className="text-sm text-muted-foreground">Modo de Operação</p>
                      <p className="text-sm font-medium mt-1 capitalize">
                        {activeContract.plans.operation_mode.replace("_", " ")}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Tipo de Contrato</p>
                      <p className="text-sm font-medium mt-1">
                        {activeContract.contract_type === "recurring" ? "Recorrente" : "Prazo Fixo"}
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <TrendingUp className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">Nenhum contrato ativo</p>
                  <Button className="mt-4" size="sm">
                    Criar Contrato
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab: Contrato */}
        <TabsContent value="contract" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Detalhes do Contrato</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                [Placeholder: Informações detalhadas do contrato, histórico de mudanças de plano, etc.]
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab: Documentos */}
        <TabsContent value="documents" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Documentos do Cliente</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                [Placeholder: Lista de documentos enviados, pendentes, etc.]
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab: Atividades */}
        <TabsContent value="activities" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Linha do Tempo</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                [Placeholder: Timeline de atividades, emails, ligações, reuniões, etc.]
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab: Histórico */}
        <TabsContent value="history" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Histórico de Alterações</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                [Placeholder: Log de todas as alterações feitas no cliente]
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
