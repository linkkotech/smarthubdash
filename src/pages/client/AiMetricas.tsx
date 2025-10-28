import { usePageHeader } from "@/contexts/PageHeaderContext";
import { useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3, TrendingUp, Activity, Zap } from "lucide-react";

export default function AiMetricas() {
  const { setConfig } = usePageHeader();

  useEffect(() => {
    setConfig({
      title: "Métricas de IA",
    });
  }, [setConfig]);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-primary" />
            Métricas de IA
          </CardTitle>
          <CardDescription>
            Acompanhe o desempenho e uso dos seus agentes de IA
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Visualize estatísticas detalhadas sobre workflows executados, consumo de tokens, 
            taxa de sucesso e outros indicadores importantes dos seus agentes inteligentes.
          </p>
        </CardContent>
      </Card>

      {/* KPIs Placeholder */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Workflows Executados</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,234</div>
            <p className="text-xs text-muted-foreground">+20% em relação ao mês anterior</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taxa de Sucesso</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">94.5%</div>
            <p className="text-xs text-muted-foreground">+2.3% em relação à semana passada</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tempo Médio</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1.2s</div>
            <p className="text-xs text-muted-foreground">-0.3s mais rápido</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Bases Ativas</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">8</div>
            <p className="text-xs text-muted-foreground">+2 novas este mês</p>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos Placeholder */}
      <Card className="h-96 flex items-center justify-center">
        <p className="text-muted-foreground">Gráficos de métricas em desenvolvimento</p>
      </Card>
    </div>
  );
}
