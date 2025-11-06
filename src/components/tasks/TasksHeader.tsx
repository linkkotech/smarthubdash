import { Card, CardContent, CardDescription, CardTitle } from "@/components/ui/card";
import { FileStack, Plus, Share2, StickyNote } from "lucide-react";

/**
 * @file TasksHeader.tsx
 * @description Cabeçalho da página de tarefas, exibindo uma saudação, descrição
 * e cards de features principais da plataforma.
 *
 * @component TasksHeader
 * @returns {JSX.Element} O componente de cabeçalho da página de tarefas.
 */
export function TasksHeader(): JSX.Element {
  return (
    <header className="mb-8">
      <div className="flex justify-between items-start mb-6">
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
    </header>
  );
}