/**
 * TaskOverviewView
 * 
 * Visualização em Dashboard/Cards mostrando resumo de tarefas
 * Layout: 3 colunas responsivas (Notificações, Tarefas, Agenda)
 * Inspirado no modelo visual fornecido
 */

import { Card, CardContent, CardDescription, CardTitle } from "@/components/ui/card";
import { FileStack, Plus, Share2, StickyNote } from "lucide-react";
import { CalendarSection } from "@/components/tasks/CalendarSection";
import { TodayTasksSection } from "@/components/tasks/TodayTasksSection";

interface TaskOverviewViewProps {
  searchQuery?: string;
  workspaceId: string;
}

export function TaskOverviewView({
  searchQuery,
  workspaceId,
}: TaskOverviewViewProps) {
  return (
    <div className="p-4 space-y-4 h-full flex flex-col overflow-hidden">
      {/* Linha de Saudação + 4 Cards */}
      <div className="flex justify-between items-start flex-shrink-0">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Hi, James! 👋</h1>
          <p className="text-lg text-gray-500 mt-1">What are your plans for today?</p>
          <p className="text-sm text-gray-400 mt-4 max-w-md">
            This platform is designed to revolutionize the way you organize and access your notes.
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Card className="w-40 h-40 flex flex-col items-center justify-center text-center p-4 hover:bg-gray-50 cursor-pointer transition-colors">
            <Plus className="h-8 w-8 text-primary mb-2" />
          </Card>
          <Card className="w-40 h-40 flex flex-col items-center justify-center text-center p-4">
            <FileStack className="h-8 w-8 text-primary mb-2" />
            <CardTitle className="text-sm font-semibold">Stay organized</CardTitle>
            <CardDescription className="text-xs mt-1">A clear structure for your notes</CardDescription>
          </Card>
          <Card className="w-40 h-40 flex flex-col items-center justify-center text-center p-4">
            <StickyNote className="h-8 w-8 text-primary mb-2" />
            <CardTitle className="text-sm font-semibold">Sync your notes</CardTitle>
            <CardDescription className="text-xs mt-1">Ensure that notes are synced</CardDescription>
          </Card>
          <Card className="w-40 h-40 flex flex-col items-center justify-center text-center p-4">
            <Share2 className="h-8 w-8 text-primary mb-2" />
            <CardTitle className="text-sm font-semibold">Collaborate and share</CardTitle>
            <CardDescription className="text-xs mt-1">Share notes with colleagues</CardDescription>
          </Card>
        </div>
      </div>

      {/* Linha Superior: Today Tasks (66%) + Calendar (33%) */}
      <div className="h-[220px] flex-shrink-0">
        <div className="flex gap-5 items-start h-full w-full">
          <div className="flex-1" style={{ width: '66%' }}>
            <TodayTasksSection />
          </div>
          <div style={{ width: '33%' }}>
            <CalendarSection />
          </div>
        </div>
      </div>

      {/* Linha Inferior: Espaço vazio (pronto para novos cards) */}
      <div className="flex flex-1 gap-5 min-h-0 overflow-hidden">
        {/* Coluna vazia - flex-shrink-0 */}
      </div>
    </div>
  );
}
