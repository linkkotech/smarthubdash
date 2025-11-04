/**
 * @fileoverview Formulário de criação/edição de Workspace (Cliente)
 * 
 * IMPORTANTE: Este componente ainda é chamado ClientForm por compatibilidade,
 * mas utiliza a NOVA arquitetura baseada em WORKSPACES.
 * 
 * Fluxo de Criação:
 * 1. Super Admin preenche o formulário
 * 2. Cria workspace na tabela `workspaces`
 * 3. Chama Edge Function `create-workspace-admin` para criar admin
 * 4. Edge Function cria Auth User + Profile + adiciona como owner em workspace_members
 * 
 * Campos do formulário:
 * - Nome do Workspace
 * - Tipo de Cliente (PJ ou PF)
 * - Documento (CNPJ ou CPF com máscara)
 * - Nome do Administrador
 * - Email do Administrador
 * - Senha Provisória (apenas na criação)
 * 
 * @component
 */

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { isValid as isValidCPF } from "@fnando/cpf";
import { isValid as isValidCNPJ } from "@fnando/cnpj";
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
import { DocumentInput } from "@/components/ui/document-input";
import { toast } from "sonner";
import { Eye, EyeOff } from "lucide-react";
import type { ClientType } from "@/integrations/supabase/types/workspace.types";

/**
 * Props do ClientForm
 * 
 * @interface ClientFormProps
 * @property {boolean} open - Estado de abertura do modal
 * @property {(open: boolean) => void} onOpenChange - Callback para mudar estado do modal
 * @property {() => void} onSuccess - Callback executado após sucesso
 * @property {any} [workspace] - Workspace a ser editado (opcional)
 */
interface ClientFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  workspace?: any; // Pode ser tipado melhor depois
}

/**
 * Schema de validação Zod para o formulário
 * 
 * Validações:
 * - Nome: mínimo 3 caracteres
 * - Client Type: enum (pessoa_juridica ou pessoa_fisica)
 * - Document: validação de CPF ou CNPJ usando @fnando
 * - Admin Email: formato de email válido
 * - Admin Name: mínimo 3 caracteres
 * - Password: mínimo 6 caracteres, 1 letra e 1 número
 */
const workspaceSchema = z.object({
  name: z.string().min(3, "Nome deve ter no mínimo 3 caracteres"),
  client_type: z.enum(['pessoa_juridica', 'pessoa_fisica'], {
    required_error: "Selecione o tipo de cliente"
  }),
  document: z.string().min(11, "Documento inválido"),
  admin_email: z.string().email("Email inválido"),
  admin_name: z.string().min(3, "Nome deve ter no mínimo 3 caracteres"),
  provisional_password: z.string()
    .min(6, "A senha deve ter no mínimo 6 caracteres")
    .max(72, "A senha deve ter no máximo 72 caracteres")
    .regex(/[a-zA-Z]/, "A senha deve conter pelo menos uma letra")
    .regex(/[0-9]/, "A senha deve conter pelo menos um número")
}).refine((data) => {
  // Validação cruzada: CPF para pessoa_fisica, CNPJ para pessoa_juridica
  if (data.client_type === 'pessoa_fisica') {
    return isValidCPF(data.document);
  } else {
    return isValidCNPJ(data.document);
  }
}, {
  message: "Documento inválido para o tipo de cliente selecionado",
  path: ["document"]
});

type WorkspaceFormData = z.infer<typeof workspaceSchema>;

/**
 * ClientForm Component
 * 
 * Formulário para criar ou editar workspaces (clientes).
 * 
 * Funcionalidades:
 * - Criação de novo workspace com admin
 * - Edição de workspace existente
 * - Validação de CPF/CNPJ em tempo real
 * - Máscara automática para documentos
 * - Geração de slug automática a partir do nome
 * - Validação de senha com requisitos de segurança
 * 
 * @example
 * <ClientForm
 *   open={isModalOpen}
 *   onOpenChange={setIsModalOpen}
 *   onSuccess={() => refetchWorkspaces()}
 * />
 */
export function ClientForm({ open, onOpenChange, onSuccess, workspace }: ClientFormProps) {
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const isEditing = !!workspace;
  
  const form = useForm<WorkspaceFormData>({
    resolver: zodResolver(workspaceSchema),
    defaultValues: {
      name: "",
      client_type: "pessoa_juridica",
      document: "",
      admin_email: "",
      admin_name: "",
      provisional_password: "",
    },
  });

  /**
   * Gera slug automaticamente a partir do nome do workspace
   * 
   * Processo:
   * 1. Converte para minúsculas
   * 2. Remove acentos (normalização NFD)
   * 3. Remove caracteres especiais
   * 4. Substitui espaços por hífen
   * 5. Remove hífens duplicados
   */
  const generateSlug = (name: string): string => {
    return name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Remove acentos
      .replace(/[^\w\s-]/g, '') // Remove caracteres especiais
      .replace(/\s+/g, '-') // Substitui espaços por hífen
      .replace(/--+/g, '-') // Remove hífens duplicados
      .trim();
  };

  // Atualiza o formulário quando o workspace muda (modo edição)
  useEffect(() => {
    if (workspace) {
      form.reset({
        name: workspace.name,
        client_type: workspace.client_type,
        document: workspace.document || "",
        admin_email: workspace.admin_email || "",
        admin_name: workspace.admin_name || "",
        provisional_password: "",
      });
    } else {
      form.reset({
        name: "",
        client_type: "pessoa_juridica",
        document: "",
        admin_email: "",
        admin_name: "",
        provisional_password: "",
      });
    }
  }, [workspace, form, open]);

  /**
   * Handler de submit do formulário
   * 
   * Fluxo de Criação:
   * 1. Gera slug automaticamente a partir do nome
   * 2. Cria workspace na tabela workspaces
   * 3. Chama Edge Function create-workspace-admin
   * 4. Edge Function cria Auth User + Profile + adiciona como owner
   * 
   * Fluxo de Edição:
   * 1. Atualiza dados do workspace
   * 2. Não altera usuário admin
   */
  const handleSubmit = async (data: WorkspaceFormData) => {
    setLoading(true);

    try {
      if (isEditing && workspace) {
        // ===== MODO EDIÇÃO =====
        const { error: updateError } = await supabase
          .from("workspaces")
          .update({
            name: data.name,
            client_type: data.client_type,
            document: data.document,
          })
          .eq("id", workspace.id);

        if (updateError) throw updateError;

        toast.success("Workspace atualizado com sucesso!");
      } else {
        // ===== MODO CRIAÇÃO =====
        
        // 1. Gerar slug
        const slug = generateSlug(data.name);

        // 2. Criar workspace
        const { data: workspaceData, error: workspaceError } = await supabase
          .from("workspaces")
          .insert([{
            name: data.name,
            slug,
            client_type: data.client_type,
            document: data.document,
          }])
          .select()
          .single();

        if (workspaceError) {
          if (workspaceError.code === '23505') {
            // Unique violation (slug ou document duplicado)
            if (workspaceError.message.includes('slug')) {
              throw new Error("Este nome já está em uso. Por favor, escolha outro.");
            } else if (workspaceError.message.includes('document')) {
              throw new Error("Este documento (CPF/CNPJ) já está cadastrado.");
            }
          }
          throw workspaceError;
        }

        // 3. Criar usuário administrador via Edge Function
        const { data: userData, error: userError } = await supabase.functions.invoke(
          'create-workspace-admin',
          {
            body: {
              workspace_id: workspaceData.id,
              email: data.admin_email,
              password: data.provisional_password,
              full_name: data.admin_name,
            }
          }
        );

        if (userError) {
          console.error("Erro ao criar usuário admin:", userError);
          
          // Tentar reverter a criação do workspace
          await supabase.from("workspaces").delete().eq("id", workspaceData.id);
          
          throw new Error(
            `Erro ao criar administrador: ${userError.message}. Workspace não foi criado.`
          );
        }

        if (!userData?.success) {
          // Tentar reverter a criação do workspace
          await supabase.from("workspaces").delete().eq("id", workspaceData.id);
          
          throw new Error("Erro ao criar administrador. Workspace não foi criado.");
        }

        toast.success("Workspace e administrador criados com sucesso!");
      }

      onOpenChange(false);
      onSuccess();
      form.reset();
    } catch (error: any) {
      console.error("Erro no submit:", error);
      toast.error(error.message || (isEditing ? "Erro ao atualizar workspace" : "Erro ao criar workspace"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Editar Workspace" : "Novo Workspace"}</DialogTitle>
          <DialogDescription>
            {isEditing 
              ? "Atualize as informações do workspace" 
              : "Crie um novo workspace e configure o primeiro administrador"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6 py-4">
          {/* Workspace Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Informações do Workspace</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2 space-y-2">
                <Label htmlFor="name">Nome do Workspace *</Label>
                <Input
                  id="name"
                  {...form.register("name")}
                  placeholder="Ex: Acme Corporation"
                />
                {form.formState.errors.name && (
                  <p className="text-sm text-destructive">{form.formState.errors.name.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="client_type">Tipo de Cliente *</Label>
                <Select
                  value={form.watch("client_type")}
                  onValueChange={(value) => form.setValue("client_type", value as ClientType)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pessoa_juridica">Pessoa Jurídica</SelectItem>
                    <SelectItem value="pessoa_fisica">Pessoa Física</SelectItem>
                  </SelectContent>
                </Select>
                {form.formState.errors.client_type && (
                  <p className="text-sm text-destructive">{form.formState.errors.client_type.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="document">
                  {form.watch("client_type") === "pessoa_fisica" ? "CPF *" : "CNPJ *"}
                </Label>
                <DocumentInput
                  id="document"
                  clientType={form.watch("client_type")}
                  value={form.watch("document")}
                  onChange={(value) => form.setValue("document", value, { shouldValidate: true })}
                />
                {form.formState.errors.document && (
                  <p className="text-sm text-destructive">{form.formState.errors.document.message}</p>
                )}
              </div>
            </div>
          </div>

          {/* Admin Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Administrador do Workspace</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="admin_name">Nome Completo *</Label>
                <Input
                  id="admin_name"
                  {...form.register("admin_name")}
                  placeholder="Ex: João Silva"
                />
                {form.formState.errors.admin_name && (
                  <p className="text-sm text-destructive">{form.formState.errors.admin_name.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="admin_email">Email *</Label>
                <Input
                  id="admin_email"
                  type="email"
                  {...form.register("admin_email")}
                  placeholder="Ex: admin@empresa.com"
                />
                {form.formState.errors.admin_email && (
                  <p className="text-sm text-destructive">{form.formState.errors.admin_email.message}</p>
                )}
              </div>

              {!isEditing && (
                <div className="col-span-2 space-y-2">
                  <Label htmlFor="provisional_password">Senha Provisória *</Label>
                  <div className="relative">
                    <Input
                      id="provisional_password"
                      type={showPassword ? "text" : "password"}
                      {...form.register("provisional_password")}
                      placeholder="Mínimo 6 caracteres, 1 letra e 1 número"
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
                  {form.formState.errors.provisional_password && (
                    <p className="text-sm text-destructive">{form.formState.errors.provisional_password.message}</p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    Esta senha será usada pelo administrador para o primeiro acesso ao sistema
                  </p>
                </div>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading 
                ? (isEditing ? "Atualizando..." : "Criando...") 
                : (isEditing ? "Atualizar Workspace" : "Criar Workspace")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
