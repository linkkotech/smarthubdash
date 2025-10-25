import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { ClientUser } from "@/pages/ClientUsers";

interface EditClientUserModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: ClientUser | null;
  onSuccess: () => void;
  onClose: () => void;
}

interface Client {
  id: string;
  name: string;
}

export function EditClientUserModal({ open, onOpenChange, user, onSuccess, onClose }: EditClientUserModalProps) {
  const [clientId, setClientId] = useState("");
  const [clientUserRole, setClientUserRole] = useState<'client_admin' | 'client_manager' | 'client_member'>('client_member');
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open && user) {
      fetchClients();
      setClientId(user.client_id);
      setClientUserRole(user.client_user_role);
    }
  }, [open, user]);

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

    if (!user) return;

    try {
      setLoading(true);

      const { error } = await supabase
        .from('profiles')
        .update({
          client_id: clientId,
          client_user_role: clientUserRole
        })
        .eq('id', user.id);

      if (error) throw error;

      toast.success('Usuário atualizado com sucesso');
      onSuccess();
      onClose();
    } catch (error: any) {
      console.error('Erro ao atualizar usuário:', error);
      toast.error('Erro ao atualizar usuário');
    } finally {
      setLoading(false);
    }
  }

  if (!user) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Editar Usuário</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Nome</Label>
            <div className="text-sm text-muted-foreground">{user.full_name}</div>
          </div>

          <div className="space-y-2">
            <Label>Email</Label>
            <div className="text-sm text-muted-foreground">{user.email}</div>
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
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Salvando..." : "Salvar Alterações"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
