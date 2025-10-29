import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Users, Package, Building2, TrendingUp } from "lucide-react";
import { usePageHeader } from "@/contexts/PageHeaderContext";
import { KpiCard } from "@/components/dashboard/KpiCard";

export default function Dashboard() {
  const { setConfig } = usePageHeader();
  const [stats, setStats] = useState({
    totalClients: 0,
    totalPlans: 0,
    activeContracts: 0,
    teamMembers: 0,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setConfig({
      title: "Dashboard",
      showNotifications: true,
      showHelp: true,
      showSearch: true,
      showShare: true,
      statusText: "Last updated now",
      showImports: true,
      showExports: true,
      onImport: () => console.log("Import clicked"),
      onExport: () => console.log("Export clicked"),
    });
  }, [setConfig]);

  useEffect(() => {
    async function fetchStats() {
      try {
        setLoading(true);
        setError(null);

        const [clients, plans, contracts, team] = await Promise.all([
          supabase.from("clients").select("*", { count: "exact", head: true }),
          supabase.from("plans").select("*", { count: "exact", head: true }).eq("is_active", true),
          supabase.from("contracts").select("*", { count: "exact", head: true }).eq("is_active", true),
          supabase.from("user_roles").select("*", { count: "exact", head: true }),
        ]);

        if (clients.error) throw clients.error;
        if (plans.error) throw plans.error;
        if (contracts.error) throw contracts.error;
        if (team.error) throw team.error;

        setStats({
          totalClients: clients.count || 0,
          totalPlans: plans.count || 0,
          activeContracts: contracts.count || 0,
          teamMembers: team.count || 0,
        });
      } catch (err) {
        console.error("Erro ao buscar estatísticas:", err);
        setError("Não foi possível carregar as estatísticas. Tente novamente.");
      } finally {
        setLoading(false);
      }
    }

    fetchStats();
  }, []);

  const cards = [
    {
      title: "Clientes Ativos",
      value: stats.totalClients,
      icon: Building2,
      color: "text-blue-500",
    },
    {
      title: "Planos Disponíveis",
      value: stats.totalPlans,
      icon: Package,
      color: "text-green-500",
    },
    {
      title: "Contratos Ativos",
      value: stats.activeContracts,
      icon: TrendingUp,
      color: "text-purple-500",
    },
    {
      title: "Membros da Equipe",
      value: stats.teamMembers,
      icon: Users,
      color: "text-orange-500",
    },
  ];

  return (
    <div className="space-y-8">
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-8">
        {loading ? (
          <>
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
          </>
        ) : (
          <>
            <KpiCard
              title="Leads"
              value={129}
              trend={8}
              contextText="+24 vs last week"
            />
            <KpiCard
              title="Conversion Rate"
              value="24%"
              trend={2}
              contextText="-8 vs last week"
            />
            <KpiCard
              title="CLV"
              value="14d"
              trend={-4}
              contextText="+1d vs last week"
            />
          </>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-8">
        {cards.map((card) => (
          <Card key={card.title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                {card.title}
              </CardTitle>
              <card.icon className={`h-4 w-4 ${card.color}`} />
            </CardHeader>
            <CardContent>
              {loading ? (
                <Skeleton className="h-8 w-16" />
              ) : (
                <div className="text-2xl font-bold">{card.value}</div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Bem-vindo ao SmartHub Studio</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Este é o painel administrativo para gerenciar toda a operação da plataforma.
            Use o menu lateral para navegar entre as diferentes seções.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
