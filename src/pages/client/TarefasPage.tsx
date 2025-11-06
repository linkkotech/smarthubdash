import { usePageHeader } from "@/contexts/PageHeaderContext";
import { useEffect } from "react";
import { ChatSidebar } from "@/components/clients/ChatSidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckSquare } from "lucide-react";

/**
 * Página principal de tarefas do workspace
 * Layout: Sidebar de menu à esquerda, dashboard de tarefas ao centro, barra agente de IA à direita
 * @returns {JSX.Element}
 */
export default function TarefasPage() {
  const { setConfig } = usePageHeader();

  useEffect(() => {
    setConfig({
      title: "Tarefas",
    });
  }, [setConfig]);

  return (
    <div className="flex h-full bg-background">
      {/* Dashboard de Tarefas - Centro */}
      <main className="flex-1 overflow-x-hidden h-full overflow-y-auto p-8 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckSquare className="h-5 w-5 text-primary" />
              Tarefas
            </CardTitle>
            <CardDescription>
              Gerencie suas tarefas e acompanhe o progresso das atividades
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Esta página está em desenvolvimento. Em breve você terá acesso às 
              funcionalidades completas de gerenciamento de tarefas.
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
      </main>

      {/* Barra Agente de IA (Direita) */}
      <aside className="w-[300px] border-l bg-card h-full overflow-y-auto">
        <ChatSidebar />
      </aside>
    </div>
  );
}
