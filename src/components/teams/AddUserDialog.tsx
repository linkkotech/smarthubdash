import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQuery } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

const addUserSchema = z.object({
  userName: z
    .string()
    .trim()
    .min(1, { message: "Nome do usuário é obrigatório" })
    .max(100, { message: "Nome deve ter no máximo 100 caracteres" }),
  
  userPosition: z
    .string()
    .trim()
    .max(100, { message: "Cargo deve ter no máximo 100 caracteres" })
    .optional()
    .or(z.literal("")),
  
  userEmail: z
    .string()
    .trim()
    .email({ message: "E-mail inválido" })
    .max(255, { message: "E-mail deve ter no máximo 255 caracteres" }),
  
  userPhone: z
    .string()
    .trim()
    .max(20, { message: "Telefone deve ter no máximo 20 caracteres" })
    .optional()
    .or(z.literal("")),
  
  userMobile: z
    .string()
    .trim()
    .max(20, { message: "Celular deve ter no máximo 20 caracteres" })
    .optional()
    .or(z.literal("")),
  
  unidade: z
    .string()
    .trim()
    .max(200, { message: "Unidade deve ter no máximo 200 caracteres" })
    .optional()
    .or(z.literal("")),
  
  teamId: z
    .string()
    .uuid({ message: "Selecione uma equipe válida" })
    .optional()
    .or(z.literal("")),
  
  userStatus: z.enum(["active", "inactive"], {
    required_error: "Selecione um status",
  }),
  
  userRole: z.enum(["user", "manager", "admin"], {
    required_error: "Selecione uma permissão",
  }),
  
  sendInvite: z.boolean().default(true),
});

type AddUserFormData = z.infer<typeof addUserSchema>;

interface AddUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

interface Team {
  id: string;
  name: string;
}

export function AddUserDialog({ open, onOpenChange, onSuccess }: AddUserDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuth();
  const [workspaceId, setWorkspaceId] = useState<string | null>(null);

  // Obter workspace_id do perfil do usuário
  useEffect(() => {
    const fetchWorkspaceId = async () => {
      if (!user?.id) return;
      
      const { data } = await supabase
        .from("profiles")
        .select("workspace_id")
        .eq("id", user.id)
        .single();
      
      setWorkspaceId(data?.workspace_id || null);
    };

    if (open) {
      fetchWorkspaceId();
    }
  }, [open, user?.id]);

  // Buscar equipes do cliente
  const { data: teams = [] } = useQuery({
    queryKey: ["teams", workspaceId],
    queryFn: async () => {
      if (!workspaceId) return [];
      
      const { data, error } = await (supabase
        .from("teams" as any)
        .select("id, name")
        .eq("workspace_id", workspaceId)
        .order("name") as any);
      
      if (error) {
        console.error("Erro ao buscar equipes:", error);
        return [];
      }
      
      return (data as Team[]) || [];
    },
    enabled: !!workspaceId,
  });

  const form = useForm<AddUserFormData>({
    resolver: zodResolver(addUserSchema),
    defaultValues: {
      userName: "",
      userPosition: "",
      userEmail: "",
      userPhone: "",
      userMobile: "",
      unidade: "",
      teamId: "",
      userStatus: "active",
      userRole: "user",
    },
  });

  // Helper: Map role to client role
  const mapRoleToClientRole = (role: string): string => {
    switch (role) {
      case "admin":
        return "client_admin";
      case "manager":
        return "client_manager";
      default:
        return "client_user";
    }
  };

  // Helper: Create user WITH invite (old flow)
  const createUserWithInvite = async (data: AddUserFormData, operationId: string) => {
    console.log(`[${operationId}] 📧 Fluxo: Enviando convite por email (via Edge Function)`);

    // Use Edge Function for invite flow to avoid session switch
    const { data: responseData, error } = await supabase.functions.invoke(
      "create-user-without-invite",
      {
        body: {
          email: data.userEmail,
          full_name: data.userName,
          workspace_id: workspaceId,
          client_user_role: mapRoleToClientRole(data.userRole),
          unidade: data.unidade || null,
          team_id: data.teamId || null,
          status: data.userStatus === "active" ? "ativo" : "inativo",
          sendInvite: true,
        },
      }
    );

    if (error) {
      console.error(`[${operationId}] ❌ Erro na Edge Function:`, error);
      throw new Error(error.message || "Erro ao enviar convite");
    }

    if (!responseData?.success) {
      console.error(`[${operationId}] ❌ Edge Function retornou erro:`, responseData);
      throw new Error(responseData?.error || "Erro ao enviar convite");
    }
  };

  // Helper: Create user WITHOUT invite (new flow with Edge Function)
  const createUserWithoutInvite = async (data: AddUserFormData, operationId: string) => {
    console.log(`[${operationId}] ⚡ Fluxo: Criação direta (sem convite)`);

    const { data: responseData, error } = await supabase.functions.invoke(
      "create-user-without-invite",
      {
        body: {
          email: data.userEmail,
          full_name: data.userName,
          workspace_id: workspaceId,
          client_user_role: mapRoleToClientRole(data.userRole),
          unidade: data.unidade || null,
          team_id: data.teamId || null,
          status: data.userStatus === "active" ? "ativo" : "inativo",
          sendInvite: false,
        },
      }
    );

    if (error) {
      console.error(`[${operationId}] ❌ Erro na Edge Function:`, error);
      throw new Error(error.message || "Erro ao chamar Edge Function");
    }

    if (!responseData?.success) {
      console.error(`[${operationId}] ❌ Edge Function retornou erro:`, responseData);
      throw new Error(responseData?.error || "Erro na criação do usuário");
    }

    console.log(`[${operationId}] ✅ Usuário criado sem convite (Edge Function)`);
  };

  const onSubmit = async (data: AddUserFormData) => {
    setIsSubmitting(true);
    const operationId = `op_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;

    try {
      console.log(
        `[${operationId}] ✅ Iniciando criação de usuário para:`,
        data.userEmail,
        `(sendInvite: ${data.sendInvite})`
      );

      // Validação inicial
      if (!user?.id || !workspaceId) {
        console.error(`[${operationId}] ❌ Falha na validação inicial`);
        toast.error("Usuário não autenticado");
        return;
      }

      // Fluxo condicional
      if (data.sendInvite) {
        await createUserWithInvite(data, operationId);
      } else {
        await createUserWithoutInvite(data, operationId);
      }

      console.log(`[${operationId}] ✅ Usuário criado completamente!`);
      toast.success(`Usuário ${data.userName} adicionado com sucesso!`);

      // Chamar callback de sucesso para atualizar lista (antes de fechar modal)
      onSuccess?.();

      // Resetar formulário
      form.reset();
      onOpenChange(false);
    } catch (error: any) {
      console.error(`[${operationId}] 💥 ERRO:`, error);
      toast.error(error.message || "Erro ao adicionar usuário");
    } finally {
      setIsSubmitting(false);
      console.log(`[${operationId}] 🏁 Operação finalizada`);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Adicionar Usuário</DialogTitle>
          <DialogDescription>
            Convide um novo usuário para a equipe
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Campo: Nome do Usuário */}
            <FormField
              control={form.control}
              name="userName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome do Usuário *</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Ex: Maria Santos"
                      {...field}
                      disabled={isSubmitting}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Campo: Cargo */}
            <FormField
              control={form.control}
              name="userPosition"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cargo</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Ex: Analista de Vendas"
                      {...field}
                      disabled={isSubmitting}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Campo: E-mail */}
            <FormField
              control={form.control}
              name="userEmail"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>E-mail *</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="maria.santos@empresa.com"
                      {...field}
                      disabled={isSubmitting}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Grid: Telefone e Celular */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Campo: Telefone */}
              <FormField
                control={form.control}
                name="userPhone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Telefone</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="(11) 3456-7890"
                        {...field}
                        disabled={isSubmitting}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Campo: Celular */}
              <FormField
                control={form.control}
                name="userMobile"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Celular</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="(11) 98765-4321"
                        {...field}
                        disabled={isSubmitting}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Campo: Local do Usuário */}
            <FormField
              control={form.control}
              name="unidade"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Unidade</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Ex: Escritório RJ - Sala 205"
                      {...field}
                      disabled={isSubmitting}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Campo: Equipe/Setor */}
            <FormField
              control={form.control}
              name="teamId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Equipe/Setor (Opcional)</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    disabled={isSubmitting}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione uma equipe" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {teams.length === 0 ? (
                        <div className="p-2 text-sm text-gray-500">
                          Nenhuma equipe disponível
                        </div>
                      ) : (
                        teams.map((team) => (
                          <SelectItem key={team.id} value={team.id}>
                            {team.name}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Campo: Status (RadioGroup) */}
            <FormField
              control={form.control}
              name="userStatus"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status *</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="flex gap-4"
                      disabled={isSubmitting}
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="active" id="status-active" />
                        <Label htmlFor="status-active" className="cursor-pointer">
                          Ativo
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="inactive" id="status-inactive" />
                        <Label htmlFor="status-inactive" className="cursor-pointer">
                          Inativo
                        </Label>
                      </div>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Campo: Permissão do Usuário */}
            <FormField
              control={form.control}
              name="userRole"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Permissão do Usuário *</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    disabled={isSubmitting}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione uma permissão" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="user">
                        Visualização (user)
                      </SelectItem>
                      <SelectItem value="manager">
                        Edição (manager)
                      </SelectItem>
                      <SelectItem value="admin">
                        Total (admin)
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Campo: Checkbox - Enviar Convite */}
            <FormField
              control={form.control}
              name="sendInvite"
              render={({ field }) => (
                <FormItem className="flex items-start space-x-2 pt-2">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      disabled={isSubmitting}
                    />
                  </FormControl>
                  <div className="leading-none pt-0.5">
                    <FormLabel className="!mt-0 cursor-pointer">
                      Deseja enviar o convite de acesso para este usuário?
                    </FormLabel>
                  </div>
                </FormItem>
              )}
            />

            <DialogFooter className="gap-2 sm:gap-0">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Salvando..." : "Salvar Usuário"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
