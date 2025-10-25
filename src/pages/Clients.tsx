import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { usePermissions } from "@/hooks/usePermissions";
import { usePageHeader } from "@/contexts/PageHeaderContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus } from "lucide-react";
import { ClientForm } from "@/components/clients/ClientForm";
import { ClientsTable } from "@/components/clients/ClientsTable";
import { ClientWithContract } from "@/components/clients/ClientTableColumns";
import { toast } from "@/hooks/use-toast";

export default function Clients() {
  const { setConfig } = usePageHeader();
  const [clients, setClients] = useState<ClientWithContract[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<ClientWithContract | null>(null);
  const [loading, setLoading] = useState(true);
  const { isPlatformAdmin } = usePermissions();

  useEffect(() => {
    setConfig({
      title: "Clientes",
      showSearch: true,
      primaryAction: isPlatformAdmin ? {
        label: "Adicionar Cliente",
        icon: <Plus className="h-4 w-4" />,
        onClick: () => setIsFormOpen(true),
      } : undefined,
    });
  }, [setConfig, isPlatformAdmin]);

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("clients")
      .select(`
        *,
        contracts (
          is_active,
          start_date,
          plan_id,
          contract_type,
          end_date,
          billing_day,
          plans (name)
        )
      `)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching clients:", error);
      toast({
        title: "Erro ao carregar clientes",
        description: "Não foi possível carregar a lista de clientes.",
        variant: "destructive",
      });
    } else {
      setClients(data || []);
    }
    setLoading(false);
  }, []);

  const handleEdit = useCallback((client: ClientWithContract) => {
    setSelectedClient(client);
    setIsFormOpen(true);
  }, []);

  const handleViewContract = useCallback((client: ClientWithContract) => {
    console.log("Ver contrato do cliente:", client);
    toast({
      title: "Funcionalidade em desenvolvimento",
      description: "Ver contrato estará disponível em breve.",
    });
  }, []);

  const handleLoginAs = useCallback((client: ClientWithContract) => {
    console.log("Logar como cliente:", client);
    toast({
      title: "Funcionalidade em desenvolvimento",
      description: "Login como cliente estará disponível em breve.",
    });
  }, []);

  const handleDeactivate = useCallback(async (client: ClientWithContract) => {
    console.log("Desativar cliente:", client);
    toast({
      title: "Funcionalidade em desenvolvimento",
      description: "Desativação de cliente estará disponível em breve.",
    });
  }, []);

  const handleFormClose = useCallback(() => {
    setIsFormOpen(false);
    setSelectedClient(null);
  }, []);

  const handleFormSuccess = useCallback(() => {
    fetchClients();
    handleFormClose();
  }, [fetchClients, handleFormClose]);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Lista de Clientes</CardTitle>
        </CardHeader>
        <CardContent>
          <ClientsTable
            data={clients}
            loading={loading}
            onEdit={handleEdit}
            onViewContract={handleViewContract}
            onLoginAs={handleLoginAs}
            onDeactivate={handleDeactivate}
          />
        </CardContent>
      </Card>

      <ClientForm
        open={isFormOpen}
        onOpenChange={handleFormClose}
        onSuccess={handleFormSuccess}
        client={selectedClient}
      />
    </div>
  );
}
