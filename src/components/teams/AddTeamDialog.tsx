import { useState, useCallback, useEffect } from "react";
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
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Check, ChevronsUpDown } from "lucide-react";

const addTeamSchema = z.object({
  team_name: z
    .string()
    .trim()
    .min(1, { message: "Nome da equipe é obrigatório" })
    .max(100, { message: "Nome deve ter no máximo 100 caracteres" }),
  
  description: z
    .string()
    .trim()
    .max(500, { message: "Descrição deve ter no máximo 500 caracteres" })
    .optional()
    .or(z.literal("")),
  
  team_unit: z
    .string()
    .trim()
    .min(1, { message: "Unidade é obrigatória" })
    .max(200, { message: "Unidade deve ter no máximo 200 caracteres" }),
  
  team_manager: z
    .string()
    .uuid({ message: "Selecione um responsável válido" }),
  
  team_manager_email: z
    .string()
    .trim()
    .email({ message: "E-mail inválido" })
    .max(255, { message: "E-mail deve ter no máximo 255 caracteres" }),
  
  team_manager_role: z.enum(["admin", "gerente", "usuario"], {
    required_error: "Selecione uma permissão",
  }),
});

type AddTeamFormData = z.infer<typeof addTeamSchema>;

interface AddTeamDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

// Função para buscar usuários por nome
async function fetchUsersByName(searchTerm: string, workspaceId: string) {
  if (!searchTerm.trim()) return [];
  
  const { data, error } = await supabase
    .from("profiles")
    .select("id, full_name, email")
    .eq("workspace_id", workspaceId)
    .ilike("full_name", `%${searchTerm}%`)
    .limit(10);
  
  if (error) {
    console.error("Erro ao buscar usuários:", error);
    return [];
  }
  
  return data || [];
}

export function AddTeamDialog({ open, onOpenChange, onSuccess }: AddTeamDialogProps) {
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [openCombobox, setOpenCombobox] = useState(false);
  const [workspaceId, setWorkspaceId] = useState<string | null>(null);
  const [selectedManager, setSelectedManager] = useState<{ id: string; full_name: string; email: string } | null>(null);

  // Debounce do searchTerm
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Buscar workspace_id do usuário logado
  const { data: userProfile } = useQuery({
    queryKey: ["user-profile", user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const { data } = await supabase
        .from("profiles")
        .select("workspace_id")
        .eq("id", user.id)
        .single();
      if (data?.workspace_id) setWorkspaceId(data.workspace_id);
      return data;
    },
    enabled: !!user?.id,
  });

  // Query para buscar usuários com debounce
  const { data: users = [], isLoading: isLoadingUsers, isPending } = useQuery({
    queryKey: ["team-members-search", debouncedSearchTerm, workspaceId],
    queryFn: () => fetchUsersByName(debouncedSearchTerm, workspaceId!),
    enabled: !!workspaceId && debouncedSearchTerm.length > 0,
    staleTime: 0,
    gcTime: 5 * 60 * 1000,
    retry: 1,
  });

  const form = useForm<AddTeamFormData>({
    resolver: zodResolver(addTeamSchema),
    defaultValues: {
      team_name: "",
      description: "",
      team_unit: "",
      team_manager: "",
      team_manager_email: "",
      team_manager_role: "gerente",
    },
  });

  const handleSelectManager = useCallback((managerId: string, managerEmail: string, managerName: string) => {
    form.setValue("team_manager", managerId, { shouldDirty: true, shouldValidate: true });
    form.setValue("team_manager_email", managerEmail, { shouldDirty: true, shouldValidate: true });
    
    setSelectedManager({ id: managerId, full_name: managerName, email: managerEmail });
    form.trigger("team_manager");
    
    setOpenCombobox(false);
    setSearchTerm("");
    setDebouncedSearchTerm("");
  }, [form]);

  const onSubmit = async (data: AddTeamFormData) => {
    if (!workspaceId) {
      toast.error("Não foi possível identificar seu cliente");
      return;
    }

    setIsSubmitting(true);
    
    try {
      const { error } = await supabase
        .from("workspace_teams")
        .insert({
          name: data.team_name,
          description: data.description || null,
          workspace_id: workspaceId,
        });

      if (error) throw error;

      toast.success("Equipe criada com sucesso!");
      form.reset();
      setSearchTerm("");
      setDebouncedSearchTerm("");
      setSelectedManager(null);
      onOpenChange(false);
      
      if (onSuccess) {
        onSuccess();
      }
    } catch (error: any) {
      console.error("Erro ao criar equipe:", error);
      toast.error(error.message || "Erro ao criar equipe");
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
              name="team_name"
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

            {/* Campo: Descrição da Equipe */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descrição da Equipe</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Descreva os objetivos e responsabilidades da equipe..."
                      {...field}
                      disabled={isSubmitting}
                      className="resize-none"
                      rows={3}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Campo: Unidade da Equipe */}
            <FormField
              control={form.control}
              name="team_unit"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Unidade da Equipe *</FormLabel>
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

            {/* Campo: Responsável pela Equipe (Combobox) */}
            <FormField
              control={form.control}
              name="team_manager"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Responsável pela Equipe *</FormLabel>
                  <Popover open={openCombobox} onOpenChange={setOpenCombobox}>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          role="combobox"
                          className="w-full justify-between"
                          disabled={isSubmitting}
                        >
                          {field.value && selectedManager
                            ? selectedManager.full_name
                            : "Selecione um responsável"}
                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-full p-0" align="start">
                      <Command shouldFilter={false}>
                        <CommandInput
                          placeholder="Buscar responsável..."
                          value={searchTerm}
                          onValueChange={setSearchTerm}
                        />
                        <CommandList>
                          {isPending ? (
                            <CommandEmpty>Carregando...</CommandEmpty>
                          ) : users && users.length > 0 ? (
                            <CommandGroup>
                              {users.map((user: any) => (
                                <CommandItem
                                  key={user.id}
                                  value={user.id}
                                  onSelect={() => handleSelectManager(user.id, user.email, user.full_name)}
                                  className="cursor-pointer"
                                >
                                  <Check
                                    className={`mr-2 h-4 w-4 ${
                                      field.value === user.id ? "opacity-100" : "opacity-0"
                                    }`}
                                  />
                                  <div className="flex flex-col">
                                    <span className="font-medium">{user.full_name}</span>
                                    <span className="text-xs text-gray-500">{user.email}</span>
                                  </div>
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          ) : debouncedSearchTerm.length > 0 ? (
                            <CommandEmpty>Nenhum usuário encontrado.</CommandEmpty>
                          ) : (
                            <CommandEmpty>Digite para buscar...</CommandEmpty>
                          )}
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Campo: E-mail do Responsável (Read-only) */}
            <FormField
              control={form.control}
              name="team_manager_email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>E-mail do Responsável *</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="Auto-preenchido"
                      {...field}
                      disabled={true}
                      className="bg-gray-100"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Campo: Permissão do Responsável */}
            <FormField
              control={form.control}
              name="team_manager_role"
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
                      <SelectItem value="admin">
                        <div className="flex flex-col">
                          <span className="font-medium">Administrador</span>
                          <span className="text-xs text-gray-500">Cria, Edita e Exclui Todos</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="gerente">
                        <div className="flex flex-col">
                          <span className="font-medium">Gerente</span>
                          <span className="text-xs text-gray-500">Cria, Edita e Exclui Equipe</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="usuario">
                        <div className="flex flex-col">
                          <span className="font-medium">Usuário</span>
                          <span className="text-xs text-gray-500">Edita seu Perfil</span>
                        </div>
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
              <Button type="submit" disabled={isSubmitting || !workspaceId}>
                {isSubmitting ? "Salvando..." : "Salvar Equipe"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
