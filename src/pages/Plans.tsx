import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { usePageHeader } from "@/contexts/PageHeaderContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus } from "lucide-react";
import { PlanForm } from "@/components/plans/PlanForm";
import { Badge } from "@/components/ui/badge";

interface Plan {
  id: string;
  name: string;
  operation_mode: string;
  max_users: number;
  features: any;
  is_active: boolean;
}

export default function Plans() {
  const { setConfig } = usePageHeader();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [loading, setLoading] = useState(true);
  const { userRole } = useAuth();

  const canManage = userRole === "super_admin" || userRole === "admin";

  useEffect(() => {
    fetchPlans();
  }, []);

  async function fetchPlans() {
    setLoading(true);
    const { data, error } = await supabase
      .from("plans")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching plans:", error);
    } else {
      setPlans(data || []);
    }
    setLoading(false);
  }

  const handleEdit = (plan: Plan) => {
    setSelectedPlan(plan);
    setIsFormOpen(true);
  };

  const handleCreate = () => {
    setSelectedPlan(null);
    setIsFormOpen(true);
  };

  useEffect(() => {
    setConfig({
      title: "Planos",
      primaryAction: canManage ? {
        label: "Novo Plano",
        icon: <Plus className="h-4 w-4" />,
        onClick: handleCreate,
      } : undefined,
    });
  }, [setConfig, canManage]);

  const getOperationModeLabel = (mode: string) => {
    switch (mode) {
      case "commercial":
        return "Comercial";
      case "support_network":
        return "Rede de Apoio";
      case "hybrid":
        return "Híbrido";
      default:
        return mode;
    }
  };

  return (
    <div className="space-y-6">
      {loading ? (
        <div className="flex justify-center py-8">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {plans.map((plan) => (
            <Card key={plan.id} className="cursor-pointer hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <CardTitle className="text-xl">{plan.name}</CardTitle>
                  <Badge variant={plan.is_active ? "default" : "secondary"}>
                    {plan.is_active ? "Ativo" : "Inativo"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground">Modo de Operação</p>
                  <p className="font-medium">{getOperationModeLabel(plan.operation_mode)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Usuários</p>
                  <p className="font-medium">{plan.max_users}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Features</p>
                  <div className="flex flex-wrap gap-2">
                    {plan.features.map((feature, index) => (
                      <Badge key={index} variant="outline">
                        {feature}
                      </Badge>
                    ))}
                  </div>
                </div>
                {canManage && (
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => handleEdit(plan)}
                  >
                    Editar
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <PlanForm
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        plan={selectedPlan}
        onSuccess={fetchPlans}
      />
    </div>
  );
}
