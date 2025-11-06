import { ScrollArea } from "@/components/ui/scroll-area";
import { ChatHeader } from "./ChatHeader";
import { MessageBubble } from "./MessageBubble";
import { EmailComposer } from "./EmailComposer";
import type { Message } from "@/types/chat";

/**
 * @typedef {object} ChatMessage
 * @property {string} id - ID único da mensagem no banco de dados
 * @property {string} content - Conteúdo textual da mensagem até 5000 caracteres
 * @property {string} senderName - Nome completo de quem enviou a mensagem
 * @property {string} [senderAvatar] - URL da imagem de avatar do remetente
 * @property {string} [senderEmail] - Email do remetente para identificação
 * @property {string} [timestamp] - ISO timestamp da mensagem (ex: "2025-11-05T17:35:39Z")
 * @property {string} [senderType] - Tipo do remetente: "agent" | "contact" | "ai_assistant"
 * @property {boolean} [isSent] - Flag indicando se foi enviado pelo usuário atual
 */

/**
 * @typedef {object} ChatWindowProps
 * @property {string} contactName - Nome do contato/lead para exibir no cabeçalho
 * @property {string} [contactStatus] - Status/informação adicional (ex: "Lead qualificado", "Em negociação")
 * @property {ChatMessage[]} [messages] - Array com todas as mensagens da conversa
 * @property {string} [senderEmail] - Email do usuário autenticado (para identificação)
 * @property {(message: string) => void} [onSendMessage] - Disparado ao enviar mensagem (arg: texto)
 * @property {() => void} [onBookmark] - Disparado ao clicar em bookmark no cabeçalho
 * @property {() => void} [onSchedule] - Disparado ao clicar em agendar no cabeçalho
 * @property {() => void} [onCall] - Disparado ao clicar em iniciar chamada
 * @property {() => void} [onMore] - Disparado ao clicar em mais opções (menu)
 */

/**
 * Componente ChatWindow
 *
 * Janela central (55% da largura) que exibe a conversa ativa com:
 * - Cabeçalho fixo com nome do contato, status e ações (bookmark, schedule, call, more)
 * - Área de scroll para histórico de mensagens
 * - Campo de input fixo no rodapé para digitar/enviar mensagens
 *
 * **Layout Vertical:**
 * 1. ChatHeader (fixo, ~60px) - Info do contato + botões de ação
 * 2. ScrollArea (flex-1) - Mensagens com scroll vertical
 * 3. MessageInput (fixo, ~100px) - Campo de entrada com botões
 *
 * **Design:**
 * - Fundo branco (`bg-white`)
 * - Sem overflow hidden (permite scroll natural)
 * - ScrollArea apenas para mensagens (flex-1)
 * - Header e Input fixos nas extremidades
 * - Mensagens com padding e espaçamento vertical
 *
 * **Comportamento:**
 * - Exibe "Selecione uma conversa" quando messages array vazio
 * - Renderiza MessageBubble para cada mensagem com tipo de remetente
 * - Dispara onSendMessage ao enviar (integra com MessageInput)
 *
 * @param {ChatWindowProps} props - Props do componente
 * @returns {JSX.Element} Janela de chat com messages scrollable e input fixo
 */
export function ChatWindow({
  contactName,
  contactStatus,
  messages = [],
  senderEmail,
  onSendMessage,
  onBookmark,
  onSchedule,
  onCall,
  onMore,
}: {
  contactName: string;
  contactStatus?: string;
  messages?: Array<{
    id: string;
    content: string;
    senderName: string;
    senderAvatar?: string;
    senderEmail?: string;
    timestamp?: string;
    senderType?: string;
    isSent?: boolean;
  }>;
  senderEmail?: string;
  onSendMessage?: (message: string) => void;
  onBookmark?: () => void;
  onSchedule?: () => void;
  onCall?: () => void;
  onMore?: () => void;
}) {
  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <ChatHeader
        contactName={contactName}
        status={contactStatus}
        onBookmark={onBookmark}
        onSchedule={onSchedule}
        onCall={onCall}
        onMore={onMore}
      />

      {/* Messages Area */}
      <ScrollArea className="flex-1">
        <div className="space-y-4 p-4">
          {messages.length > 0 ? (
            messages.map((message) => (
              <MessageBubble
                key={message.id}
                content={message.content}
                senderName={message.senderName}
                senderAvatar={message.senderAvatar}
                senderEmail={message.senderEmail}
                timestamp={message.timestamp}
                senderType={message.senderType as "agent" | "contact" | "ai_assistant"}
                isSent={message.isSent}
              />
            ))
          ) : (
            <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
              Selecione uma conversa para começar
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Message Input */}
      <div className="p-4">
        <EmailComposer
          fromEmail="angela@zooperhr.com"
          toEmail="leonardcampbell@gmail.com"
          onSend={() => console.log("Email sent!")}
          onDelete={() => console.log("Email deleted!")}
        />
      </div>
    </div>
  );
}