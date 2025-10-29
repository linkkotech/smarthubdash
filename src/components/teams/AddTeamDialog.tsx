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
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const addTeamSchema = z.object({
  teamName: z
    .string()
    .trim()
    .min(1, { message: "Nome da equipe é obrigatório" })
    .max(100, { message: "Nome deve ter no máximo 100 caracteres" }),
  
  teamLocation: z
    .string()
    .trim()
    .max(200, { message: "Local deve ter no máximo 200 caracteres" })
    .optional()
    .or(z.literal("")),
  
  managerName: z
    .string()
    .trim()
    .min(1, { message: "Nome do responsável é obrigatório" })
    .max(100, { message: "Nome deve ter no máximo 100 caracteres" }),
  
  managerEmail: z
    .string()
    .trim()
    .email({ message: "E-mail inválido" })
    .max(255, { message: "E-mail deve ter no máximo 255 caracteres" }),
  
  managerRole: z.enum(["user", "manager", "admin"], {
    required_error: "Selecione uma permissão",
  }),
});

type AddTeamFormData = z.infer<typeof addTeamSchema>;

interface AddTeamDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddTeamDialog({ open, onOpenChange }: AddTeamDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<AddTeamFormData>({
    resolver: zodResolver(addTeamSchema),
    defaultValues: {
      teamName: "",
      teamLocation: "",
      managerName: "",
      managerEmail: "",
      managerRole: "user",
    },
  });

  const onSubmit = async (data: AddTeamFormData) => {
    setIsSubmitting(true);
    
    try {
      // TODO: Integração com Supabase virá depois
      console.log("📊 Dados do formulário validados:", data);
      
      // Simular delay de API
      await new Promise((resolve) => setTimeout(resolve, 1000));
      
      toast.success("Equipe criada com sucesso! (modo simulação)");
      
      // Resetar formulário e fechar modal
      form.reset();
      onOpenChange(false);
    } catch (error: any) {
      console.error("❌ Erro ao criar equipe:", error);
      toast.error("Erro ao criar equipe");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Adicionar Equipe</DialogTitle>
          <DialogDescription>
            Crie uma nova equipe e defina seu responsável
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Campo: Nome da Equipe */}
            <FormField
              control={form.control}
              name="teamName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome da Equipe *</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Ex: Equipe de Vendas"
                      {...field}
                      disabled={isSubmitting}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Campo: Local da Equipe */}
            <FormField
              control={form.control}
              name="teamLocation"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Local da Equipe</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Ex: Escritório SP - 3º andar"
                      {...field}
                      disabled={isSubmitting}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Campo: Responsável pela Equipe */}
            <FormField
              control={form.control}
              name="managerName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Responsável pela Equipe *</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Ex: João Silva"
                      {...field}
                      disabled={isSubmitting}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Campo: E-mail do Responsável */}
            <FormField
              control={form.control}
              name="managerEmail"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>E-mail do Responsável *</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="joao.silva@empresa.com"
                      {...field}
                      disabled={isSubmitting}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Campo: Permissão do Responsável */}
            <FormField
              control={form.control}
              name="managerRole"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Permissão do Responsável *</FormLabel>
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
                {isSubmitting ? "Salvando..." : "Salvar Equipe"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
