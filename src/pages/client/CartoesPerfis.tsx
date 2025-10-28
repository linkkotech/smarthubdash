import { usePageHeader } from "@/contexts/PageHeaderContext";
import { useEffect, useState, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Plus, LayoutGrid, List } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Skeleton } from "@/components/ui/skeleton";
import { DataTable } from "@/components/ui/data-table";
import { profileColumns } from "@/components/profiles/profile-columns";
import ProfileCard from "@/components/profiles/ProfileCard";
import { CreateProfileModal } from "@/components/profiles/CreateProfileModal";

interface ProfileContent {
  name?: string;
  position?: string;
  company?: string;
  avatar_url?: string;
  plan_badge?: string;
}

interface DigitalProfile {
  id: string;
  client_id: string;
  active_template_id: string;
  content: ProfileContent;
  status: string;
  short_id: string;
  slug: string | null;
  type: string;
  created_at: string;
  updated_at: string;
}

const ITEMS_PER_PAGE = 12;

export default function CartoesPerfis() {
  const { setConfig } = usePageHeader();
  const { user } = useAuth();
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [profiles, setProfiles] = useState<DigitalProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalProfiles, setTotalProfiles] = useState(0);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [clientId, setClientId] = useState<string>("");

  // Buscar client_id do usuário
  const fetchClientId = async () => {
    if (!user?.id) return null;
    
    const { data, error } = await supabase
      .from("profiles")
      .select("client_id")
      .eq("id", user.id)
      .single();

    if (error) {
      console.error("Erro ao buscar client_id:", error);
      return null;
    }

    const foundClientId = data?.client_id || "";
    setClientId(foundClientId);
    return foundClientId;
  };

  // Buscar perfis digitais com paginação
  const fetchProfiles = async () => {
    setLoading(true);
    
    const clientId = await fetchClientId();
    if (!clientId) {
      setLoading(false);
      return;
    }

    const from = (currentPage - 1) * ITEMS_PER_PAGE;
    const to = from + ITEMS_PER_PAGE - 1;

    // Buscar total de perfis
    const { count } = await supabase
      .from("digital_profiles")
      .select("*", { count: "exact", head: true })
      .eq("client_id", clientId);

    if (count !== null) {
      setTotalProfiles(count);
    }

    // Buscar perfis paginados
    const { data, error } = await supabase
      .from("digital_profiles")
      .select("*")
      .eq("client_id", clientId)
      .order("created_at", { ascending: false })
      .range(from, to);

    if (error) {
      console.error("Erro ao buscar perfis:", error);
    } else {
      setProfiles((data || []) as DigitalProfile[]);
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchProfiles();
  }, [currentPage, user?.id]);

  // Configurar PageHeader
  useEffect(() => {
    setConfig({
      title: "Perfis Digitais",
      primaryAction: {
        label: "Criar Perfil",
        icon: <Plus className="h-4 w-4" />,
        onClick: () => setIsCreateModalOpen(true),
      },
      viewControls: {
        currentView: viewMode,
        onViewChange: (view) => setViewMode(view),
      },
    });
  }, [setConfig, viewMode]);

  const totalPages = useMemo(() => {
    return Math.ceil(totalProfiles / ITEMS_PER_PAGE);
  }, [totalProfiles]);

  // Loading state
  if (loading) {
    return (
      <div className="space-y-6">
        {viewMode === "grid" ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4">
            {Array.from({ length: 12 }).map((_, i) => (
              <Card key={i} className="p-6 space-y-4">
                <Skeleton className="h-20 w-20 rounded-full mx-auto" />
                <Skeleton className="h-4 w-16 mx-auto" />
                <Skeleton className="h-5 w-32 mx-auto" />
                <Skeleton className="h-4 w-24 mx-auto" />
                <div className="flex gap-2 pt-4">
                  <Skeleton className="h-9 flex-1" />
                  <Skeleton className="h-9 flex-1" />
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="p-6">
            <div className="space-y-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          </Card>
        )}
      </div>
    );
  }

  // Empty state
  if (profiles.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Card className="p-12 text-center max-w-md">
          <div className="space-y-4">
            <div className="mx-auto w-16 h-16 rounded-full bg-muted flex items-center justify-center">
              <LayoutGrid className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold">Nenhum perfil cadastrado</h3>
            <p className="text-sm text-muted-foreground">
              Comece criando seu primeiro perfil digital para compartilhar suas informações de contato de forma inteligente.
            </p>
            <Button onClick={() => setIsCreateModalOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Criar Primeiro Perfil
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Grid View */}
      {viewMode === "grid" && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4">
            {profiles.map((profile) => (
              <ProfileCard key={profile.id} profile={profile} />
            ))}
          </div>

          {/* Paginação */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2">
              <Button
                variant="outline"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                Anterior
              </Button>
              <span className="text-sm text-muted-foreground">
                Página {currentPage} de {totalPages}
              </span>
              <Button
                variant="outline"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
              >
                Próxima
              </Button>
            </div>
          )}
        </>
      )}

      {/* List View */}
      {viewMode === "list" && (
        <Card className="p-6">
          <DataTable columns={profileColumns} data={profiles} />
          
          {/* Paginação */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-6">
              <Button
                variant="outline"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                Anterior
              </Button>
              <span className="text-sm text-muted-foreground">
                Página {currentPage} de {totalPages}
              </span>
              <Button
                variant="outline"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
              >
                Próxima
              </Button>
            </div>
          )}
        </Card>
      )}

      {/* Modal de Criação de Perfil */}
      <CreateProfileModal
        open={isCreateModalOpen}
        onOpenChange={setIsCreateModalOpen}
        onSuccess={fetchProfiles}
        clientId={clientId}
      />
    </div>
  );
}
