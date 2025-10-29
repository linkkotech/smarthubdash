import { usePageHeader } from "@/contexts/PageHeaderContext";
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Plus } from "lucide-react";
import { AddTeamDialog } from "@/components/teams/AddTeamDialog";
import { AddUserDialog } from "@/components/teams/AddUserDialog";

export default function EquipePage() {
  const { setConfig } = usePageHeader();
  const [isTeamModalOpen, setIsTeamModalOpen] = useState(false);
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);

  useEffect(() => {
    setConfig({
      title: "Equipe",
      primaryAction: {
        label: "Adicionar Usuário",
        icon: <Plus className="h-4 w-4" />,
        onClick: () => setIsUserModalOpen(true),
      },
      secondaryAction: {
        label: "Adicionar Equipe",
        onClick: () => setIsTeamModalOpen(true),
      },
    });

    return () => setConfig({ title: "" });
  }, [setConfig]);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            Equipe
          </CardTitle>
          <CardDescription>
            Gerencie os membros da sua equipe e suas permissões
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Esta página está em desenvolvimento. Em breve você terá acesso às 
            funcionalidades completas de gerenciamento de equipe.
          </p>
        </CardContent>
      </Card>

      {/* Grid de Widgets Placeholder */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card className="h-48 flex items-center justify-center">
          <p className="text-muted-foreground">Widget 1 em desenvolvimento</p>
        </Card>
        <Card className="h-48 flex items-center justify-center">
          <p className="text-muted-foreground">Widget 2 em desenvolvimento</p>
        </Card>
        <Card className="h-48 flex items-center justify-center">
          <p className="text-muted-foreground">Widget 3 em desenvolvimento</p>
        </Card>
      </div>

      {/* Modal: Adicionar Equipe */}
      <AddTeamDialog
        open={isTeamModalOpen}
        onOpenChange={setIsTeamModalOpen}
      />

      {/* Modal: Adicionar Usuário */}
      <AddUserDialog
        open={isUserModalOpen}
        onOpenChange={setIsUserModalOpen}
      />
    </div>
  );
}
