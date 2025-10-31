import { useParams, useNavigate } from "react-router-dom";
import { usePageHeader } from "@/contexts/PageHeaderContext";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { toast } from "sonner";

interface TeamMember {
  id: string;
  full_name: string;
  email: string;
  cargo: string | null;
  telefone: string | null;
  celular: string | null;
  unidade: string | null;
  status: "ativo" | "inativo";
  client_user_role: string | null;
  created_at: string;
}

// Função para buscar client_id do usuário logado
async function fetchUserClientId(userId: string) {
  const { data, error } = await supabase
    .from("profiles")
    .select("client_id")
    .eq("id", userId)
    .single();

  if (error) throw error;
  return data?.client_id || null;
}

// Função para buscar detalhes do membro da equipe
async function fetchMemberDetails(memberId: string, clientId: string) {
  const { data, error } = await supabase
    .from("profiles")
    .select("id, full_name, email, cargo, telefone, celular, unidade, status, client_user_role, created_at")
    .eq("id", memberId)
    .eq("client_id", clientId)
    .single();

  if (error) throw error;
  return data as TeamMember;
}

function TeamMemberDetailSkeleton() {
  return (
    <div className="flex h-full bg-background">
      {/* Sidebar Skeleton */}
      <aside className="w-[350px] border-r bg-card">
        <div className="p-6 space-y-6">
          <div className="flex flex-col items-center space-y-3">
            <Skeleton className="h-20 w-20 rounded-full" />
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-4 w-24" />
          </div>
          <Skeleton className="h-32 w-full" />
          <div className="space-y-2">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        </div>
      </aside>

      {/* Main Content Skeleton */}
      <main className="flex-1">
        <div className="p-8 space-y-6">
          <Skeleton className="h-12 w-full" />
          <div className="space-y-4">
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
          </div>
        </div>
      </main>

      {/* Right Sidebar Skeleton */}
      <aside className="w-[300px] border-l bg-card">
        <div className="p-6 space-y-4">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-32 w-full" />
        </div>
      </aside>
    </div>
  );
}

export default function TeamMemberDetailPage() {
  const { memberId } = useParams<{ memberId: string }>();
  const navigate = useNavigate();
  const { setConfig } = usePageHeader();
  const { user } = useAuth();

  // Buscar client_id do usuário logado
  const { data: clientId } = useQuery({
    queryKey: ["user-client-id", user?.id],
    queryFn: () => fetchUserClientId(user!.id),
    enabled: !!user?.id,
  });

  // Buscar detalhes do membro
  const { data: member, isLoading, isError, error } = useQuery({
    queryKey: ["team-member-detail", memberId, clientId],
    queryFn: () => fetchMemberDetails(memberId!, clientId!),
    enabled: !!memberId && !!clientId,
  });

  // Atualizar título da página
  useEffect(() => {
    if (member) {
      setConfig({
        title: member.full_name,
        showSearch: false,
      });
    }
  }, [member, setConfig]);

  // Validação: se não houver memberId, redirecionar
  useEffect(() => {
    if (!memberId) {
      toast.error("ID do membro não fornecido");
      navigate("/app/equipe");
    }
  }, [memberId, navigate]);

  // Estados de loading/error/vazio
  if (isLoading) {
    return <TeamMemberDetailSkeleton />;
  }

  if (isError) {
    return (
      <div className="flex items-center justify-center h-full bg-background">
        <Alert variant="destructive" className="max-w-md">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Erro ao carregar membro</AlertTitle>
          <AlertDescription>
            {error instanceof Error ? error.message : "Não foi possível carregar os dados do membro. Tente novamente."}
          </AlertDescription>
          <Button
            onClick={() => navigate("/app/equipe")}
            className="mt-4"
            variant="outline"
          >
            Voltar para Equipe
          </Button>
        </Alert>
      </div>
    );
  }

  if (!member) {
    toast.error("Membro não encontrado");
    navigate("/app/equipe");
    return null;
  }

  // Calcular iniciais do nome
  const initials = member.full_name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  // Formatar data de admissão
  const admissionDate = member.created_at
    ? format(new Date(member.created_at), "dd/MM/yyyy", { locale: ptBR })
    : "-";

  return (
    <div className="flex h-full bg-background -m-8">
      {/* Coluna 1: Sidebar do Perfil (Esquerda) */}
      <aside className="w-[350px] border-r bg-card h-full overflow-y-auto">
        <div className="p-6 space-y-6">
          {/* Avatar */}
          <div className="flex flex-col items-center">
            <Avatar className="h-24 w-24 border-4 border-gray-100 mb-4">
              <AvatarImage src={undefined} alt={member.full_name} />
              <AvatarFallback className="bg-blue-100 text-blue-700 text-lg font-bold">
                {initials}
              </AvatarFallback>
            </Avatar>

            {/* Nome e Cargo */}
            <h2 className="text-xl font-bold text-center">{member.full_name}</h2>
            <p className="text-sm text-gray-600">{member.cargo || "-"}</p>

            {/* Email */}
            <p className="text-xs text-gray-500 mt-2 text-center truncate max-w-[90%]">
              {member.email}
            </p>

            {/* Badge de Status */}
            <Badge
              variant={member.status === "ativo" ? "default" : "secondary"}
              className="mt-3"
            >
              {member.status === "ativo" ? "Ativo" : "Inativo"}
            </Badge>
          </div>

          {/* Informações Adicionais */}
          <Card className="bg-muted/50">
            <CardContent className="pt-4 space-y-3">
              <div>
                <p className="text-xs text-gray-500">Data de Admissão</p>
                <p className="text-sm font-medium">{admissionDate}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Celular</p>
                <p className="text-sm font-medium">{member.celular || "-"}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Telefone</p>
                <p className="text-sm font-medium">{member.telefone || "-"}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Unidade</p>
                <p className="text-sm font-medium">{member.unidade || "-"}</p>
              </div>
            </CardContent>
          </Card>

          {/* Botões de Ação */}
          <div className="space-y-2">
            <Button variant="outline" className="w-full">
              Editar Perfil
            </Button>
            <Button variant="destructive" className="w-full">
              Remover Membro
            </Button>
          </div>
        </div>
      </aside>

      {/* Coluna 2: Conteúdo Principal (Centro) */}
      <main className="flex-1 overflow-x-hidden h-full overflow-y-auto">
        <div className="p-8">
          <Tabs defaultValue="atividades" className="w-full">
            <TabsList className="grid w-full max-w-md grid-cols-3">
              <TabsTrigger value="atividades">Atividades</TabsTrigger>
              <TabsTrigger value="permissoes">Permissões</TabsTrigger>
              <TabsTrigger value="configuracoes">Configurações</TabsTrigger>
            </TabsList>

            {/* Tab 1: Atividades */}
            <TabsContent value="atividades" className="space-y-4 mt-6">
              <Card>
                <CardContent className="pt-6">
                  <p className="text-sm text-gray-600">
                    📝 Placeholder: Lista de atividades do membro será exibida aqui.
                  </p>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Tab 2: Permissões */}
            <TabsContent value="permissoes" className="space-y-4 mt-6">
              <Card>
                <CardContent className="pt-6">
                  <p className="text-sm text-gray-600">
                    🔐 Placeholder: Gerenciamento de permissões e roles será exibido aqui.
                  </p>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Tab 3: Configurações */}
            <TabsContent value="configuracoes" className="space-y-4 mt-6">
              <Card>
                <CardContent className="pt-6">
                  <p className="text-sm text-gray-600">
                    ⚙️ Placeholder: Configurações específicas do membro serão exibidas aqui.
                  </p>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>

      {/* Coluna 3: Sidebar Direita (Informações Secundárias) */}
      <aside className="w-[300px] border-l bg-card h-full overflow-y-auto">
        <div className="p-6 space-y-6">
          <div>
            <h3 className="font-semibold mb-3">Histórico Recente</h3>
            <Card className="bg-muted/50">
              <CardContent className="pt-4 text-xs text-gray-600">
                <p>📋 Placeholder: Histórico de ações e eventos.</p>
              </CardContent>
            </Card>
          </div>

          <div>
            <h3 className="font-semibold mb-3">Ações Rápidas</h3>
            <div className="space-y-2">
              <Button variant="outline" size="sm" className="w-full">
                Enviar Mensagem
              </Button>
              <Button variant="outline" size="sm" className="w-full">
                Exportar Dados
              </Button>
            </div>
          </div>
        </div>
      </aside>
    </div>
  );
}
