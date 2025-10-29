import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
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
import { toast } from "sonner";

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
  
  userLocation: z
    .string()
    .trim()
    .max(200, { message: "Local deve ter no máximo 200 caracteres" })
    .optional()
    .or(z.literal("")),
  
  userStatus: z.enum(["active", "inactive"], {
    required_error: "Selecione um status",
  }),
  
  userRole: z.enum(["user", "manager", "admin"], {
    required_error: "Selecione uma permissão",
  }),
});

type AddUserFormData = z.infer<typeof addUserSchema>;

interface AddUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddUserDialog({ open, onOpenChange }: AddUserDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<AddUserFormData>({
    resolver: zodResolver(addUserSchema),
    defaultValues: {
      userName: "",
      userPosition: "",
      userEmail: "",
      userPhone: "",
      userMobile: "",
      userLocation: "",
      userStatus: "active",
      userRole: "user",
    },
  });

  const onSubmit = async (data: AddUserFormData) => {
    setIsSubmitting(true);
    
    try {
      // TODO: Integração com Supabase virá depois
      console.log("👤 Dados do usuário validados:", data);
      
      // Simular delay de API
      await new Promise((resolve) => setTimeout(resolve, 1000));
      
      toast.success("Usuário adicionado com sucesso! (modo simulação)");
      
      // Resetar formulário e fechar modal
      form.reset();
      onOpenChange(false);
    } catch (error: any) {
      console.error("❌ Erro ao adicionar usuário:", error);
      toast.error("Erro ao adicionar usuário");
    } finally {
      setIsSubmitting(false);
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
              name="userLocation"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Local do Usuário</FormLabel>
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
