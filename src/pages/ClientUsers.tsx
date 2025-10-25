import { useState, useEffect, useCallback, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { ClientUsersDataTable } from "@/components/client-users/ClientUsersDataTable";
import { InviteClientUserModal } from "@/components/client-users/InviteClientUserModal";
import { EditClientUserModal } from "@/components/client-users/EditClientUserModal";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { usePageHeader } from "@/contexts/PageHeaderContext";
import { toast } from "sonner";
import { UserCog } from "lucide-react";

export interface ClientUser {
  id: string;
  full_name: string;
  email: string;
  client_id: string;
  client_name: string;
  client_user_role: 'client_admin' | 'client_manager' | 'client_member';
  created_at: string;
}

export default function ClientUsers() {
  const { hasRole } = useAuth();
  const { setConfig } = usePageHeader();
  const [users, setUsers] = useState<ClientUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<ClientUser | null>(null);

  const canManage = hasRole('super_admin') || hasRole('admin');

  const headerConfig = useMemo(() => ({
    title: "Usuários de Clientes",
    primaryAction: canManage ? {
      label: "Convidar Usuário",
      onClick: () => setIsInviteModalOpen(true),
    } : undefined,
  }), [canManage]);

  useEffect(() => {
    setConfig(headerConfig);
  }, [setConfig, headerConfig]);

  useEffect(() => {
    fetchClientUsers();
  }, []);

  const fetchClientUsers = useCallback(async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          id,
          full_name,
          email,
          client_id,
          client_user_role,
          created_at,
          clients!inner (
            id,
            name
          )
        `)
        .not('client_id', 'is', null)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const formattedUsers: ClientUser[] = (data || []).map((user: any) => ({
        id: user.id,
        full_name: user.full_name,
        email: user.email,
        client_id: user.client_id,
        client_name: user.clients.name,
        client_user_role: user.client_user_role,
        created_at: user.created_at,
      }));

      setUsers(formattedUsers);
    } catch (error: any) {
      console.error('Erro ao buscar usuários dos clientes:', error);
      toast.error('Erro ao carregar usuários dos clientes');
    } finally {
      setLoading(false);
    }
  }, []);

  const handleEdit = useCallback((user: ClientUser) => {
    setSelectedUser(user);
    setIsEditModalOpen(true);
  }, []);

  const handleCloseEditModal = useCallback(() => {
    setSelectedUser(null);
    setIsEditModalOpen(false);
  }, []);

  const handleResetPassword = useCallback(async (user: ClientUser) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(user.email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) throw error;

      toast.success(`Email de redefinição de senha enviado para ${user.email}`);
    } catch (error: any) {
      console.error('Erro ao enviar email de redefinição:', error);
      toast.error('Erro ao enviar email de redefinição de senha');
    }
  }, []);

  const handleDeactivate = useCallback(async (user: ClientUser) => {
    toast.info('Funcionalidade de desativação será implementada em breve');
  }, []);

  const handleRemove = useCallback(async (user: ClientUser) => {
    try {
      const { error } = await supabase.auth.admin.deleteUser(user.id);

      if (error) throw error;

      toast.success('Usuário removido com sucesso');
      fetchClientUsers();
    } catch (error: any) {
      console.error('Erro ao remover usuário:', error);
      toast.error('Erro ao remover usuário');
    }
  }, [fetchClientUsers]);

  return (
    <div className="space-y-6">
      <ClientUsersDataTable
        data={users}
        loading={loading}
        onEdit={handleEdit}
        onResetPassword={handleResetPassword}
        onDeactivate={handleDeactivate}
        onRemove={handleRemove}
      />

      <InviteClientUserModal
        open={isInviteModalOpen}
        onOpenChange={setIsInviteModalOpen}
        onSuccess={fetchClientUsers}
      />

      <EditClientUserModal
        open={isEditModalOpen}
        onOpenChange={setIsEditModalOpen}
        user={selectedUser}
        onSuccess={fetchClientUsers}
        onClose={handleCloseEditModal}
      />
    </div>
  );
}
