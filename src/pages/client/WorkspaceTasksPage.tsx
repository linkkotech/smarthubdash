/**
 * Página principal de tarefas do workspace
 * Layout: 3 colunas responsivas (Notificações, Tarefas, Agenda)
 * Inspirado no modelo visual fornecido
 */
import { usePageHeader } from "@/contexts/PageHeaderContext";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ChatSidebar } from "@/components/clients/ChatSidebar";
import { AssignmentsSection } from "@/components/tasks/AssignmentsSection";
import { CalendarSection } from "@/components/tasks/CalendarSection";
import { NotificationsSection } from "@/components/tasks/NotificationsSection";
import { ProgressSection } from "@/components/tasks/ProgressSection";
import { TodayTasksSection } from "@/components/tasks/TodayTasksSection";
import { TasksHeader } from "@/components/tasks/TasksHeader";

export default function WorkspaceTasksPage() {
  const { setConfig } = usePageHeader();

  useEffect(() => {
    setConfig({
      title: "Tarefas",
      showSearch: false,
      customActions: (
        <div className="flex gap-2">
          <Button size="sm">Nova Tarefa</Button>
          <Button size="sm" variant="outline">Ver todas as tarefas</Button>
        </div>
      ),
    });
  }, [setConfig]);

  return (
    <div className="h-full p-4">
      {/* Header removido */}
      <div className="flex flex-1 gap-4 h-full">
        {/* As colunas foram removidas temporariamente pois os componentes foram excluídos */}
        <div className="flex-1">
          <TasksHeader />
          <div className="space-y-6 mt-6">
            {/* Linha Superior */}
            <div className="h-[270px]">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5 items-start">
                <NotificationsSection />
                <AssignmentsSection />
                <CalendarSection />
              </div>
            </div>
            {/* Linha Inferior */}
            <div className="flex flex-1 gap-5 mt-6">
              {/* Coluna 1 (Flexível) */}
              <div className="flex-1">
                <TodayTasksSection />
              </div>
              {/* Coluna 2 (Fixa) */}
              <div className="w-[205px] bg-primary rounded-xl shadow-sm p-4">
                <p className="text-center text-primary-foreground">Placeholder (205px)</p>
              </div>
              {/* Coluna 3 (Fixa) */}
              <div className="w-[410px] space-y-6">
                <ProgressSection />
              </div>
            </div>
          </div>
        </div>
        <aside className="w-[340px] min-w-[300px] bg-card rounded-xl shadow-sm h-full flex flex-col">
          <ChatSidebar />
        </aside>
      </div>
    </div>
  );
}
