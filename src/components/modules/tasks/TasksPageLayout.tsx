'use client';

import { ReactNode, useState } from 'react';
import { MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AssistantDrawer } from './AssistantDrawer';

interface TasksPageLayoutProps {
  mainContent: ReactNode;
  chatContent: ReactNode;
  filterPanel?: ReactNode;
}

/**
 * TasksPageLayout - Layout responsivo com grid 3 colunas
 * 
 * Desktop (lg:):
 * - Coluna 1: Sidebar de menu (fora deste componente)
 * - Coluna 2: Conteúdo principal (mainContent)
 * - Coluna 3: Chat assistente (sempre visível, chatContent)
 * 
 * Mobile (<lg:):
 * - Apenas mainContent visível
 * - Botão flutuante para abrir drawer de chat
 * - Chat renderizado como drawer overlay
 */
export function TasksPageLayout({
  mainContent,
  chatContent,
  filterPanel,
}: TasksPageLayoutProps) {
  const [isChatOpen, setIsChatOpen] = useState(false);

  return (
    <>
      <div className="flex h-full bg-background">
        {/* Conteúdo Principal - Centro */}
        <main className="flex-1 overflow-x-hidden h-full overflow-y-auto flex flex-col xl:col-span-2">
          {/* Painel de Filtros (condicional) */}
          {filterPanel}

          {/* Conteúdo Principal */}
          <div className="flex-1 overflow-auto">
            {mainContent}
          </div>
        </main>

        {/* Chat Assistente - Direita (Sempre visível em Desktop) */}
        {chatContent && (
          <aside className="hidden xl:block w-[320px] border-l bg-card h-full overflow-y-auto border-border">
            {chatContent}
          </aside>
        )}
      </div>

      {/* Botão Flutuante de Chat (Visível apenas em Mobile) */}
      {chatContent && (
        <Button
          onClick={() => setIsChatOpen(true)}
          size="icon"
          className="fixed bottom-6 right-6 rounded-full shadow-lg xl:hidden"
          title="Abrir assistente"
        >
          <MessageSquare className="h-5 w-5" />
        </Button>
      )}

      {/* Drawer de Chat (Mobile) */}
      <AssistantDrawer
        isOpen={isChatOpen}
        onOpenChange={setIsChatOpen}
        title="Assistente"
      >
        {chatContent}
      </AssistantDrawer>
    </>
  );
}
