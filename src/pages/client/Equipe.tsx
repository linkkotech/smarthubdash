import React, { useEffect, useState } from "react";
import { usePageHeader } from "@/contexts/PageHeaderContext";
import { useQuery } from "@tanstack/react-query";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableHeader,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { MoreHorizontal, Pencil, Trash2, Plus } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { columns, TeamMember } from "./columns";
import { DataTable } from "@/components/ui/data-table";
import { AddUserDialog } from "@/components/teams/AddUserDialog";
import { AddTeamDialog } from "@/components/teams/AddTeamDialog";
import { TeamMemberCard } from "@/components/teams/TeamMemberCard";

// Função para buscar o workspace_id do usuário logado
async function fetchUserWorkspace(userId: string) {
  console.log("DEBUG fetchUserWorkspace - userId:", userId);
  
  const { data, error } = await supabase
    .from("workspace_members")
    .select("workspace_id")
    .eq("profile_id", userId)
    .maybeSingle();
  
  console.log("DEBUG fetchUserWorkspace - data:", data, "error:", error);
  
  if (error) {
    console.error("Erro ao buscar workspace do usuário:", error);
    throw error;
  }
  
  return data?.workspace_id || null;
}

// Função para buscar membros do workspace
async function fetchWorkspaceMembers(workspaceId: string) {
  console.log("DEBUG fetchWorkspaceMembers - workspaceId:", workspaceId);
  
  const { data, error } = await supabase
    .from("workspace_members")
    .select(`
      id,
      role,
      joined_at,
      profiles!inner(
        id,
        full_name,
        email,
        status
      )
    `)
    .eq("workspace_id", workspaceId);
  
  console.log("DEBUG fetchWorkspaceMembers - data:", data, "error:", error);
  
  if (error) throw error;
  
  // Retornar dados mapeados para a interface TeamMember
  return (data || []).map((member: any) => ({
    id: member.profiles.id,
    full_name: member.profiles.full_name,
    email: member.profiles.email,
    client_user_role: member.role, // workspace role: owner, manager, user
    status: member.profiles.status || "ativo",
    unidade: null,
    telefone: null,
    celular: null,
    cargo: null,
    avatarUrl: null,
  }));
}

export default function Equipe() {
  const { user } = useAuth();
  const userId = user?.id;
  const { setConfig } = usePageHeader();
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
  const [isAddTeamModalOpen, setIsAddTeamModalOpen] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  useEffect(() => {
    setConfig({
      title: "Equipe",
      primaryAction: {
        label: "+ Adicionar Usuário",
        icon: <Plus className="h-4 w-4" />,
        onClick: (event?: React.MouseEvent) => {
          event?.preventDefault();
          setIsAddUserModalOpen(true);
        },
      },
      secondaryAction: {
        label: "Adicionar Equipe",
        onClick: (event?: React.MouseEvent) => {
          event?.preventDefault();
          setIsAddTeamModalOpen(true);
        },
      },
      viewControls: {
        currentView: viewMode,
        onViewChange: setViewMode,
      },
    });
    // Limpar configurações ao desmontar
    return () => setConfig({ title: "" });
  }, [setConfig, viewMode]);

  // Buscar o workspace_id do usuário logado
  const {
    data: workspaceId,
    isLoading: isLoadingWorkspace,
    isError: isErrorWorkspace,
    error: errorWorkspace,
  } = useQuery({
    queryKey: ["user-workspace", userId],
    queryFn: () => fetchUserWorkspace(userId!),
    enabled: !!userId,
  });

  // Buscar membros do workspace
  const {
    data: teamMembers,
    isLoading: isLoadingTeam,
    isError: isErrorTeam,
    error: errorTeam,
    refetch: refetchTeamMembers,
  } = useQuery({
    queryKey: ["workspace-members", workspaceId],
    queryFn: () => fetchWorkspaceMembers(workspaceId!),
    enabled: !!workspaceId,
  });

  // Callback para atualizar UI após sucesso de criação
  const handleAddUserSuccess = () => {
    setIsAddUserModalOpen(false);
    refetchTeamMembers();
  };

  // Estado de carregamento (workspace ou team)
  if (isLoadingWorkspace || isLoadingTeam) {
    return (
      <Card>
        <CardContent className="p-4">
          <div className="space-y-2">
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-6 w-full" />
            <Skeleton className="h-6 w-full" />
            <Skeleton className="h-6 w-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  // Estado de erro (workspace ou team)
  if (isErrorWorkspace || isErrorTeam) {
    return (
      <Card>
        <CardContent className="p-4">
          <div className="text-destructive">
            {errorWorkspace?.message || errorTeam?.message || "Erro ao buscar equipe"}
          </div>
        </CardContent>
      </Card>
    );
  }

  // Renderização condicional do conteúdo principal
  const content = 
    !teamMembers || teamMembers.length === 0 ? (
      // Estado vazio
      <Card className="text-center py-12">
        <CardContent className="p-4">
          <div className="mb-4 text-muted-foreground">Nenhum membro na equipe</div>
          <Button 
            type="button"
            variant="default" 
            onClick={() => setIsAddUserModalOpen(true)}
          >
            Adicionar o primeiro membro
          </Button>
        </CardContent>
      </Card>
    ) : viewMode === "list" ? (
      // Visualização em Tabela
      <Card>
        <CardContent className="p-4">
          <DataTable columns={columns} data={teamMembers || []} searchKey="email" />
        </CardContent>
      </Card>
    ) : (
      // Visualização em Cards
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4">
        {(teamMembers || []).map((member: TeamMember) => (
          <TeamMemberCard
            key={member.id}
            member={member}
          />
        ))}
      </div>
    );

  // Retorno final com conteúdo + modais
  return (
    <>
      {content}

      {/* Modal: Adicionar Usuário */}
      <AddUserDialog
        open={isAddUserModalOpen}
        onOpenChange={setIsAddUserModalOpen}
        onSuccess={handleAddUserSuccess}
      />

      {/* Modal: Adicionar Equipe */}
      <AddTeamDialog
        open={isAddTeamModalOpen}
        onOpenChange={setIsAddTeamModalOpen}
        onSuccess={() => {
          setIsAddTeamModalOpen(false);
          // Aqui você pode adicionar refetch de equipes se implementar
        }}
      />
    </>
  );
}
