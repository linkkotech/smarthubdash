import { useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { usePageHeader } from "@/contexts/PageHeaderContext";
import { LayoutDashboard, TrendingUp, Users, CheckSquare } from "lucide-react";

export default function DashboardCliente() {
  const { setConfig } = usePageHeader();

  useEffect(() => {
    setConfig({
      title: "Dashboard",
      showNotifications: true,
      showHelp: true,
      showSearch: true,
      showShare: false,
      primaryAction: {
        label: "Novo Lead",
        onClick: () => console.log("Novo Lead clicked"),
      },
    });
  }, [setConfig]);

  return (
    <div className="space-y-8">
      {/* Card de Boas-Vindas */}
      <Card>
        <CardHeader className="flex flex-row items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
            <LayoutDashboard className="h-6 w-6 text-primary" />
          </div>
          <div>
            <CardTitle className="text-2xl">Bem-vindo ao Painel do Cliente</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Gerencie seus leads, pipeline e contatos em um só lugar
            </p>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
            {/* Card Leads Ativos */}
            <Card className="border-dashed">
              <CardContent className="pt-6">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <TrendingUp className="h-5 w-5 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">Este mês</span>
                  </div>
                  <div className="text-3xl font-bold text-muted-foreground">0</div>
                  <p className="text-sm text-muted-foreground">Leads Ativos</p>
                </div>
              </CardContent>
            </Card>

            {/* Card Contatos */}
            <Card className="border-dashed">
              <CardContent className="pt-6">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Users className="h-5 w-5 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">Total</span>
                  </div>
                  <div className="text-3xl font-bold text-muted-foreground">0</div>
                  <p className="text-sm text-muted-foreground">Contatos</p>
                </div>
              </CardContent>
            </Card>

            {/* Card Tarefas Pendentes */}
            <Card className="border-dashed">
              <CardContent className="pt-6">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <CheckSquare className="h-5 w-5 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">Hoje</span>
                  </div>
                  <div className="text-3xl font-bold text-muted-foreground">0</div>
                  <p className="text-sm text-muted-foreground">Tarefas Pendentes</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>

      {/* Card Primeiros Passos */}
      <Card>
        <CardHeader>
          <CardTitle>Primeiros Passos</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-3">
            <li className="flex items-start gap-2 text-sm">
              <span className="text-green-500 mt-0.5">✓</span>
              <span className="text-muted-foreground">Configure seu perfil</span>
            </li>
            <li className="flex items-start gap-2 text-sm">
              <span className="text-muted-foreground mt-0.5">•</span>
              <span className="text-muted-foreground">Adicione seu primeiro lead</span>
            </li>
            <li className="flex items-start gap-2 text-sm">
              <span className="text-muted-foreground mt-0.5">•</span>
              <span className="text-muted-foreground">Organize seu pipeline</span>
            </li>
            <li className="flex items-start gap-2 text-sm">
              <span className="text-muted-foreground mt-0.5">•</span>
              <span className="text-muted-foreground">Importe seus contatos</span>
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
