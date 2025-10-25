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
import { toast } from "sonner";
import { format } from "date-fns";
import { ClientWithContract } from "./ClientTableColumns";
import { Eye, EyeOff } from "lucide-react";
import { z } from "zod";

interface ClientFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  client?: ClientWithContract | null;
}

interface Plan {
  id: string;
  name: string;
}

// Validation schema for provisional password
const provisionalPasswordSchema = z.string()
  .min(6, "A senha deve ter no mínimo 6 caracteres")
  .max(72, "A senha deve ter no máximo 72 caracteres")
  .regex(/[a-zA-Z]/, "A senha deve conter pelo menos uma letra")
  .regex(/[0-9]/, "A senha deve conter pelo menos um número");

export function ClientForm({ open, onOpenChange, onSuccess, client }: ClientFormProps) {
  const [loading, setLoading] = useState(false);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [showPassword, setShowPassword] = useState(false);
  const isEditing = !!client;
  
  const [formData, setFormData] = useState({
    // Client info
    name: "",
    client_type: "pessoa_juridica",
    document: "",
    // Contract info
    plan_id: "",
    start_date: format(new Date(), "yyyy-MM-dd"),
    contract_type: "recurring",
    end_date: "",
    billing_day: 1,
    // Admin info
    admin_name: "",
    admin_email: "",
    provisional_password: "",
  });

  useEffect(() => {
    if (open) {
      fetchPlans();
      if (client) {
        const contract = client.contracts?.[0];
        setFormData({
          name: client.name,
          client_type: client.client_type,
          document: client.document || "",
          admin_name: client.admin_name,
          admin_email: client.admin_email,
          provisional_password: "",
          plan_id: contract?.plan_id || "",
          contract_type: contract?.contract_type || "recurring",
          start_date: contract?.start_date || format(new Date(), "yyyy-MM-dd"),
          end_date: contract?.end_date || "",
          billing_day: contract?.billing_day || 1,
        });
      } else {
        setFormData({
          name: "",
          client_type: "pessoa_juridica",
          document: "",
          admin_name: "",
          admin_email: "",
          provisional_password: "",
          plan_id: "",
          contract_type: "recurring",
          start_date: format(new Date(), "yyyy-MM-dd"),
          end_date: "",
          billing_day: 1,
        });
      }
    }
  }, [open, client]);

  async function fetchPlans() {
    const { data, error } = await supabase
      .from("plans")
      .select("id, name")
      .eq("is_active", true);

    if (error) {
      console.error("Error fetching plans:", error);
    } else {
      setPlans(data || []);
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isEditing && client) {
        // Update existing client
        const { error: clientError } = await supabase
          .from("clients")
          .update({
            name: formData.name,
            client_type: formData.client_type as "pessoa_fisica" | "pessoa_juridica",
            document: formData.document || null,
            admin_name: formData.admin_name,
            admin_email: formData.admin_email,
          })
          .eq("id", client.id);

        if (clientError) throw clientError;

        // Check if there's an existing contract for this client
        const { data: existingContract, error: fetchError } = await supabase
          .from("contracts")
          .select("id")
          .eq("client_id", client.id)
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle();

        if (fetchError) throw fetchError;

        // Handle contract creation/update if plan is selected
        if (formData.plan_id) {
          // Prepare contract data
          const contractData: any = {
            client_id: client.id,
            plan_id: formData.plan_id,
            contract_type: formData.contract_type,
            start_date: formData.start_date,
            is_active: true,
          };

          // Add type-specific fields
          if (formData.contract_type === "fixed_term") {
            contractData.end_date = formData.end_date;
            contractData.billing_day = null;
          } else {
            contractData.billing_day = formData.billing_day;
            contractData.end_date = null;
          }

          if (existingContract) {
            // Update existing contract
            const { error: updateError } = await supabase
              .from("contracts")
              .update(contractData)
              .eq("id", existingContract.id);

            if (updateError) throw updateError;
          } else {
            // Create new contract
            const { error: insertError } = await supabase
              .from("contracts")
              .insert(contractData);

            if (insertError) throw insertError;
          }
        }

        toast.success("Cliente atualizado com sucesso!");
      } else {
        // Validate provisional password
        const passwordValidation = provisionalPasswordSchema.safeParse(
          formData.provisional_password
        );
        
        if (!passwordValidation.success) {
          toast.error(passwordValidation.error.errors[0].message);
          setLoading(false);
          return;
        }

        // Create client
        const { data: clientData, error: clientError } = await supabase
          .from("clients")
          .insert([{
            name: formData.name,
            client_type: formData.client_type as "pessoa_fisica" | "pessoa_juridica",
            document: formData.document || null,
            admin_name: formData.admin_name,
            admin_email: formData.admin_email,
          }])
          .select()
          .single();

        if (clientError) throw clientError;

        // Create contract
        const contractData: any = {
          client_id: clientData.id,
          plan_id: formData.plan_id,
          contract_type: formData.contract_type,
          start_date: formData.start_date,
          is_active: true,
        };

        if (formData.contract_type === "fixed_term") {
          contractData.end_date = formData.end_date;
        } else {
          contractData.billing_day = formData.billing_day;
        }

        const { error: contractError } = await supabase
          .from("contracts")
          .insert(contractData);

        if (contractError) throw contractError;

        // Create admin user for the client via Edge Function
        const { data: userData, error: userError } = await supabase.functions.invoke(
          'create-client-user',
          {
            body: {
              email: formData.admin_email,
              password: formData.provisional_password,
              full_name: formData.admin_name,
              client_id: clientData.id,
              client_user_role: 'client_admin'
            }
          }
        );

        if (userError) {
          console.error("Erro ao criar usuário admin:", userError);
          toast.error(
            `Cliente criado, mas houve um erro ao criar o usuário administrador: ${userError.message}`
          );
        } else if (userData?.success) {
          toast.success("Cliente e usuário administrador criados com sucesso!");
        } else {
          toast.success("Cliente criado com sucesso! Configure o usuário administrador manualmente.");
        }
      }

      onOpenChange(false);
      onSuccess();
      
      // Reset form
      setFormData({
        name: "",
        client_type: "pessoa_juridica",
        document: "",
        plan_id: "",
        start_date: format(new Date(), "yyyy-MM-dd"),
        contract_type: "recurring",
        end_date: "",
        billing_day: 1,
        admin_name: "",
        admin_email: "",
        provisional_password: "",
      });
    } catch (error: any) {
      toast.error(error.message || (isEditing ? "Erro ao atualizar cliente" : "Erro ao criar cliente"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Editar Cliente" : "Novo Cliente"}</DialogTitle>
          <DialogDescription>
            {isEditing ? "Atualize as informações do cliente" : "Adicione um novo cliente e configure o contrato"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="space-y-6 py-4">
            {/* Client Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Informações do Cliente</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2 space-y-2">
                  <Label htmlFor="name">Nome do Cliente</Label>
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
                  <Label htmlFor="client_type">Tipo de Cliente</Label>
                  <Select
                    value={formData.client_type}
                    onValueChange={(value) =>
                      setFormData({ ...formData, client_type: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pessoa_fisica">Pessoa Física</SelectItem>
                      <SelectItem value="pessoa_juridica">Pessoa Jurídica</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="document">
                    {formData.client_type === "pessoa_fisica" ? "CPF" : "CNPJ"}
                  </Label>
                  <Input
                    id="document"
                    value={formData.document}
                    onChange={(e) =>
                      setFormData({ ...formData, document: e.target.value })
                    }
                  />
                </div>
              </div>
            </div>

            {/* Contract Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Informações do Contrato</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2 space-y-2">
                  <Label htmlFor="plan_id">Plano</Label>
                  <Select
                    value={formData.plan_id}
                    onValueChange={(value) =>
                      setFormData({ ...formData, plan_id: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um plano" />
                    </SelectTrigger>
                    <SelectContent>
                      {plans.map((plan) => (
                        <SelectItem key={plan.id} value={plan.id}>
                          {plan.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="start_date">Data de Início</Label>
                  <Input
                    id="start_date"
                    type="date"
                    value={formData.start_date}
                    onChange={(e) =>
                      setFormData({ ...formData, start_date: e.target.value })
                    }
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="contract_type">Tipo de Vigência</Label>
                  <Select
                    value={formData.contract_type}
                    onValueChange={(value) =>
                      setFormData({ ...formData, contract_type: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="fixed_term">Prazo Definido</SelectItem>
                      <SelectItem value="recurring">Recorrente</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {formData.contract_type === "fixed_term" && (
                  <div className="col-span-2 space-y-2">
                    <Label htmlFor="end_date">Data de Término</Label>
                    <Input
                      id="end_date"
                      type="date"
                      value={formData.end_date}
                      onChange={(e) =>
                        setFormData({ ...formData, end_date: e.target.value })
                      }
                      required
                    />
                  </div>
                )}

                {formData.contract_type === "recurring" && (
                  <div className="col-span-2 space-y-2">
                    <Label htmlFor="billing_day">Dia de Cobrança</Label>
                    <Input
                      id="billing_day"
                      type="number"
                      min="1"
                      max="28"
                      value={formData.billing_day}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          billing_day: parseInt(e.target.value),
                        })
                      }
                      required
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Admin Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Administrador do Cliente</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="admin_name">Nome</Label>
                  <Input
                    id="admin_name"
                    value={formData.admin_name}
                    onChange={(e) =>
                      setFormData({ ...formData, admin_name: e.target.value })
                    }
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="admin_email">Email</Label>
                  <Input
                    id="admin_email"
                    type="email"
                    value={formData.admin_email}
                    onChange={(e) =>
                      setFormData({ ...formData, admin_email: e.target.value })
                    }
                    required
                  />
                </div>

                {!isEditing && (
                  <div className="col-span-2 space-y-2">
                    <Label htmlFor="provisional_password">
                      Senha Provisória *
                    </Label>
                    <div className="relative">
                      <Input
                        id="provisional_password"
                        type={showPassword ? "text" : "password"}
                        value={formData.provisional_password}
                        onChange={(e) =>
                          setFormData({ ...formData, provisional_password: e.target.value })
                        }
                        required={!isEditing}
                        placeholder="Mínimo 6 caracteres"
                        className="pr-10"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                        onClick={() => setShowPassword(!showPassword)}
                        tabIndex={-1}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Esta senha será usada pelo administrador do cliente para primeiro acesso
                    </p>
                  </div>
                )}
              </div>
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
              {loading ? (isEditing ? "Atualizando..." : "Criando...") : (isEditing ? "Atualizar Cliente" : "Criar Cliente")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
