import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { usePageHeader } from "@/contexts/PageHeaderContext";
import { toast } from "sonner";
import { ClientSidebar } from "@/components/clients/ClientSidebar";
import { ClientMainContent } from "@/components/clients/ClientMainContent";
import { ChatSidebar } from "@/components/clients/ChatSidebar";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { FileText, Plus } from "lucide-react";

export interface ClientWithDetails {
  id: string;
  name: string;
  slug: string;
  client_type: "pessoa_fisica" | "pessoa_juridica";
  document: string | null;
  created_at: string;
  updated_at: string;
  owner: {
    id: string;
    full_name: string;
    email: string;
  };
  contracts: Array<{
    id: string;
    is_active: boolean;
    start_date: string;
    end_date: string | null;
    contract_type: string;
    billing_day: number | null;
    plans: {
      id: string;
      name: string;
      operation_mode: string;
      max_users: number;
    };
  }>;
}

function ClientDetailsSkeleton() {
  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar Skeleton (Esquerda) */}
      <aside className="w-[350px] border-r bg-card sticky top-0 h-screen overflow-y-auto">
        <div className="p-6 space-y-6">
          <div className="flex flex-col items-center space-y-3">
            <Skeleton className="h-20 w-20 rounded-full" />
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-4 w-24" />
          </div>
          <div className="grid grid-cols-3 gap-2">
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
          </div>
          <Skeleton className="h-32 w-full" />
        </div>
      </aside>

      {/* Main Content Skeleton (Centro) */}
      <main className="flex-1 overflow-x-hidden">
        <div className="p-8 space-y-6">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-12 w-full" />
          <div className="grid grid-cols-3 gap-4">
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
          </div>
        </div>
      </main>

      {/* Chat Sidebar Skeleton (Direita) */}
      <aside className="w-[300px] border-l bg-card sticky top-0 h-screen overflow-y-auto">
        <div className="p-6 space-y-4">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      </aside>
    </div>
  );
}

export default function ClientDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { setConfig } = usePageHeader();
  const [client, setClient] = useState<ClientWithDetails | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (client) {
      setConfig({
        title: client.name,
        showSearch: false,
        customActions: (
          <div className="flex gap-2">
            <Button size="sm" variant="outline">
              <FileText className="h-4 w-4 mr-2" />
              Editar Cliente
            </Button>
            <Button size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Nova Atividade
            </Button>
          </div>
        ),
      });
    }
  }, [client, setConfig]);

  useEffect(() => {
    async function fetchClient() {
      if (!id) {
        toast.error("ID do cliente não fornecido");
        navigate("/clientes");
        return;
      }

      try {
        const { data, error } = await supabase
          .from("workspaces")
          .select(`
            *,
            owner:owner_id (
              id,
              full_name,
              email
            ),
            contracts (
              id,
              is_active,
              start_date,
              end_date,
              contract_type,
              billing_day,
              plans (
                id,
                name,
                operation_mode,
                max_users
              )
            )
          `)
          .eq("id", id)
          .maybeSingle();

        if (error) throw error;

        if (!data) {
          toast.error("Workspace não encontrado");
          navigate("/clientes");
          return;
        }

        // Fix: owner vem como array, pegar o primeiro elemento
        const workspace: ClientWithDetails = {
          ...data,
          owner: Array.isArray(data.owner) ? data.owner[0] : data.owner,
          contracts: Array.isArray(data.contracts) ? data.contracts : []
        } as ClientWithDetails;

        setClient(workspace);
      } catch (error: any) {
        console.error("Error fetching workspace:", error);
        toast.error("Erro ao carregar dados do workspace");
        navigate("/clientes");
      } finally {
        setLoading(false);
      }
    }

    fetchClient();
  }, [id, navigate]);

  if (loading) {
    return <ClientDetailsSkeleton />;
  }

  if (!client) {
    return null;
  }

  return (
    <div className="flex h-full bg-background -m-8">
      {/* Coluna 1: Sidebar do Cliente (Esquerda) - Largura Fixa */}
      <aside className="w-[350px] border-r bg-card h-full overflow-y-auto">
        <ClientSidebar client={client} />
      </aside>

      {/* Coluna 2: Conteúdo Principal (Centro) - Flexível */}
      <main className="flex-1 overflow-x-hidden h-full overflow-y-auto">
        <ClientMainContent client={client} />
      </main>

      {/* Coluna 3: Chat Sidebar (Direita) - Largura Fixa */}
      <aside className="w-[300px] border-l bg-card h-full overflow-y-auto">
        <ChatSidebar />
      </aside>
    </div>
  );
}

