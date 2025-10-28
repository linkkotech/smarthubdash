import { usePageHeader } from "@/contexts/PageHeaderContext";
import { useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BrainCircuit, TrendingUp, Users, DollarSign } from "lucide-react";
import { KpiCard } from "@/components/dashboard/KpiCard";

export default function CrmDashboard() {
  const { setConfig } = usePageHeader();

  useEffect(() => {
    setConfig({
      title: "Smart CRM",
      showNotifications: true,
      showHelp: true,
      showSearch: true,
    });
  }, [setConfig]);

  return (
    <div className="space-y-6">
      {/* KPIs de CRM */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          title="Leads Ativos"
          value="142"
          trend={12}
          contextText="vs mês anterior"
        />
        <KpiCard
          title="Taxa de Conversão"
          value="34%"
          trend={5}
          contextText="vs mês anterior"
        />
        <KpiCard
          title="Negócios Abertos"
          value="23"
          trend={15}
          contextText="vs mês anterior"
        />
        <KpiCard
          title="Receita Prevista"
          value="R$ 45.2k"
          trend={18}
          contextText="vs mês anterior"
        />
      </div>

      {/* Card de Boas-Vindas */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BrainCircuit className="h-5 w-5 text-primary" />
            Dashboard do Smart CRM
          </CardTitle>
          <CardDescription>
            Central de controle das suas operações de vendas e relacionamento
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Este é o painel principal do seu CRM. Aqui você terá acesso rápido aos principais indicadores
            e poderá navegar para as diferentes seções de vendas através do menu lateral.
          </p>
        </CardContent>
      </Card>

      {/* Placeholder para futuros widgets */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Funil de Vendas</CardTitle>
            <CardDescription>Pipeline visual dos seus negócios</CardDescription>
          </CardHeader>
          <CardContent className="h-48 flex items-center justify-center text-muted-foreground">
            Gráfico de funil em desenvolvimento
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Atividades Recentes</CardTitle>
            <CardDescription>Últimas interações com leads</CardDescription>
          </CardHeader>
          <CardContent className="h-48 flex items-center justify-center text-muted-foreground">
            Timeline de atividades em desenvolvimento
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
