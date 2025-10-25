import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";

interface PlanFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  plan: any | null;
  onSuccess: () => void;
}

const availableFeatures = [
  "Agentes de IA",
  "App Mobile",
  "Análise de Dados",
  "Relatórios Avançados",
  "Integração API",
  "Suporte Prioritário",
  "Backup Automático",
  "Múltiplos Usuários",
];

export function PlanForm({ open, onOpenChange, plan, onSuccess }: PlanFormProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<{
    name: string;
    operation_mode: "commercial" | "support_network" | "hybrid";
    max_users: number;
    features: string[];
    is_active: boolean;
  }>({
    name: "",
    operation_mode: "commercial",
    max_users: 1,
    features: [],
    is_active: true,
  });

  useEffect(() => {
    if (plan) {
      setFormData({
        name: plan.name,
        operation_mode: plan.operation_mode,
        max_users: plan.max_users,
        features: plan.features || [],
        is_active: plan.is_active,
      });
    } else {
      setFormData({
        name: "",
        operation_mode: "commercial",
        max_users: 1,
        features: [],
        is_active: true,
      });
    }
  }, [plan]);

  const handleFeatureToggle = (feature: string) => {
    setFormData((prev) => ({
      ...prev,
      features: prev.features.includes(feature)
        ? prev.features.filter((f) => f !== feature)
        : [...prev.features, feature],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (plan) {
        const { error } = await supabase
          .from("plans")
          .update(formData)
          .eq("id", plan.id);

        if (error) throw error;
        toast.success("Plano atualizado com sucesso!");
      } else {
        const { error } = await supabase.from("plans").insert(formData);

        if (error) throw error;
        toast.success("Plano criado com sucesso!");
      }

      onOpenChange(false);
      onSuccess();
    } catch (error: any) {
      toast.error(error.message || "Erro ao salvar plano");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{plan ? "Editar Plano" : "Novo Plano"}</DialogTitle>
          <DialogDescription>
            {plan
              ? "Atualize as informações do plano"
              : "Crie um novo plano para os clientes"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome do Plano</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="operation_mode">Modo de Operação</Label>
              <Select
                value={formData.operation_mode}
                onValueChange={(value) =>
                  setFormData({ ...formData, operation_mode: value as "commercial" | "support_network" | "hybrid" })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="commercial">Comercial</SelectItem>
                  <SelectItem value="support_network">Rede de Apoio</SelectItem>
                  <SelectItem value="hybrid">Híbrido</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="max_users">Número de Usuários</Label>
              <Input
                id="max_users"
                type="number"
                min="1"
                value={formData.max_users}
                onChange={(e) =>
                  setFormData({ ...formData, max_users: parseInt(e.target.value) })
                }
                required
              />
            </div>

            <div className="space-y-2">
              <Label>Features Incluídas</Label>
              <div className="grid grid-cols-2 gap-3">
                {availableFeatures.map((feature) => (
                  <div key={feature} className="flex items-center space-x-2">
                    <Checkbox
                      id={feature}
                      checked={formData.features.includes(feature)}
                      onCheckedChange={() => handleFeatureToggle(feature)}
                    />
                    <label
                      htmlFor={feature}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      {feature}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="is_active"
                checked={formData.is_active}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, is_active: checked })
                }
              />
              <Label htmlFor="is_active">Plano Ativo</Label>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Salvando..." : "Salvar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
