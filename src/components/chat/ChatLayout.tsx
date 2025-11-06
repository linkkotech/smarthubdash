import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";

/**
 * @typedef {object} ChatLayoutProps
 * @property {React.ReactNode} sidebar - Componente da barra lateral com lista de conversas (coluna esquerda, 20%).
 * @property {React.ReactNode} chatWindow - Componente principal da janela de chat com mensagens (coluna central, 55%).
 * @property {React.ReactNode} details - Componente do painel de detalhes do contato/lead (coluna direita, 25%).
 */

/**
 * Componente ChatLayout
 *
 * Layout de três colunas redimensionáveis para a interface de chat do CRM.
 * Fornece uma estrutura profissional com fundo cinza claro e cards brancos.
 *
 * **Layout:**
 * - Coluna 1 (20%): Sidebar branca - lista de conversas
 * - Coluna 2 (55%): Chat Window branca - mensagens e input
 * - Coluna 3 (25%): Details branca - informações do contato/lead
 *
 * **Features:**
 * - Fundo cinza claro (bg-slate-50) para criar contraste profissional
 * - Painéis redimensionáveis com alças (ResizableHandle)
 * - Sem overflow hidden para evitar problemas visuais
 * - Cards brancos bem delimitados dentro do fundo cinza
 *
 * @param {ChatLayoutProps} props - As props do componente
 * @returns {JSX.Element} Container com layout de 3 colunas em fundo cinza claro
 */
export function ChatLayout({
  sidebar,
  chatWindow,
  details,
}: {
  sidebar: React.ReactNode;
  chatWindow: React.ReactNode;
  details: React.ReactNode;
}) {
  return (
    <div className="h-full">
      <ResizablePanelGroup
        direction="horizontal"
        className="h-full items-stretch"
      >
        {/* Sidebar - Esquerda (20%) */}
        <ResizablePanel defaultSize={20} minSize={15} maxSize={25}>
          <div className="h-full bg-white rounded-l-lg shadow-sm">
            {sidebar}
          </div>
        </ResizablePanel>


        <ResizableHandle withHandle />

        {/* Chat Window - Centro (55%) */}
        <ResizablePanel defaultSize={55} minSize={30}>
          <div className="h-full bg-background shadow-sm">
            {chatWindow}
          </div>
        </ResizablePanel>

        <ResizableHandle withHandle />

        {/* Details - Direita (25%) */}
        <ResizablePanel defaultSize={25} minSize={20} maxSize={30}>
          <div className="h-full bg-white rounded-r-lg shadow-sm">
            {details}
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
}