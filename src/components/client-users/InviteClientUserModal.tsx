import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { z } from "zod";

const clientUserSchema = z.object({
  fullName: z.string()
    .trim()
    .min(3, "Nome deve ter no mínimo 3 caracteres")
    .max(100, "Nome muito longo"),
  email: z.string()
    .trim()
    .email("Email inválido")
    .max(255, "Email muito longo"),
  clientId: z.string()
    .uuid("Cliente inválido"),
  clientUserRole: z.enum(['client_admin', 'client_manager', 'client_member'], {
    errorMap: () => ({ message: "Papel inválido" })
  })
});

interface InviteClientUserModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

interface Client {
  id: string;
  name: string;
}

function generateSecurePassword(): string {
  const length = 12;
  const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*";
  let password = "";
  for (let i = 0; i < length; i++) {
    password += charset.charAt(Math.floor(Math.random() * charset.length));
  }
  return password;
}

export function InviteClientUserModal({ open, onOpenChange, onSuccess }: InviteClientUserModalProps) {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [clientId, setClientId] = useState("");
  const [clientUserRole, setClientUserRole] = useState<'client_admin' | 'client_manager' | 'client_member'>('client_member');
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (open) {
      fetchClients();
      setFullName("");
      setEmail("");
      setClientId("");
      setClientUserRole('client_member');
      setErrors({});
    }
  }, [open]);

  async function fetchClients() {
    try {
      const { data, error } = await supabase
        .from('clients')
        .select('id, name')
        .order('name');

      if (error) throw error;

      setClients(data || []);
    } catch (error: any) {
      console.error('Erro ao buscar clientes:', error);
      toast.error('Erro ao carregar lista de clientes');
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrors({});

    try {
      const validatedData = clientUserSchema.parse({
        fullName,
        email,
        clientId,
        clientUserRole,
      });

      setLoading(true);

      // Gerar senha temporária
      const tempPassword = generateSecurePassword();

      // Criar usuário no Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: validatedData.email,
        password: tempPassword,
        options: {
          data: {
            full_name: validatedData.fullName,
          },
          emailRedirectTo: `${window.location.origin}/reset-password`
        },
      });

      if (authError) throw authError;

      if (!authData.user) {
        throw new Error('Usuário não foi criado');
      }

      // Atualizar profile com client_id e client_user_role
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          client_id: validatedData.clientId,
          client_user_role: validatedData.clientUserRole
        })
        .eq('id', authData.user.id);

      if (profileError) throw profileError;

      toast.success('Usuário convidado com sucesso! Um email foi enviado com instruções.');
      onSuccess();
      onOpenChange(false);
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        const fieldErrors: Record<string, string> = {};
        error.errors.forEach((err) => {
          if (err.path[0]) {
            fieldErrors[err.path[0] as string] = err.message;
          }
        });
        setErrors(fieldErrors);
      } else {
        console.error('Erro ao convidar usuário:', error);
        toast.error(error.message || 'Erro ao convidar usuário');
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Convidar Usuário de Cliente</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="fullName">Nome Completo *</Label>
            <Input
              id="fullName"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="João Silva"
              disabled={loading}
            />
            {errors.fullName && (
              <p className="text-sm text-destructive">{errors.fullName}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email *</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="joao@empresa.com"
              disabled={loading}
            />
            {errors.email && (
              <p className="text-sm text-destructive">{errors.email}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="clientId">Cliente *</Label>
            <Select
              value={clientId}
              onValueChange={setClientId}
              disabled={loading}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione um cliente" />
              </SelectTrigger>
              <SelectContent>
                {clients.map((client) => (
                  <SelectItem key={client.id} value={client.id}>
                    {client.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.clientId && (
              <p className="text-sm text-destructive">{errors.clientId}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="clientUserRole">Papel no Cliente *</Label>
            <Select
              value={clientUserRole}
              onValueChange={(value: any) => setClientUserRole(value)}
              disabled={loading}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="client_admin">Administrador</SelectItem>
                <SelectItem value="client_manager">Gerente</SelectItem>
                <SelectItem value="client_member">Membro</SelectItem>
              </SelectContent>
            </Select>
            {errors.clientUserRole && (
              <p className="text-sm text-destructive">{errors.clientUserRole}</p>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Convidando..." : "Convidar Usuário"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
