import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

/**
 * @typedef {object} MessageBubbleProps
 * @property {string} content - Conteúdo da mensagem
 * @property {string} senderName - Nome de quem enviou a mensagem
 * @property {string} [senderAvatar] - URL da imagem do remetente
 * @property {string} [timestamp] - Timestamp da mensagem
 * @property {string} [senderType] - Tipo do remetente ('agent', 'contact', 'ai_assistant')
 * @property {boolean} [isSent] - Se a mensagem foi enviada pelo usuário atual
 * @property {string} [senderEmail] - Email do remetente para exibição
 * @property {React.ReactNode} [attachments] - Conteúdo de anexos (opcional)
 */

/**
 * Componente MessageBubble
 * 
 * Renderiza uma bolha de mensagem dentro da conversa. Exibe informações
 * do remetente, conteúdo da mensagem, timestamp e suporte a anexos.
 * 
 * @param {MessageBubbleProps} props - As props do componente
 * @returns {JSX.Element} A bolha de mensagem
 */
export function MessageBubble({
  content,
  senderName,
  senderAvatar,
  timestamp,
  senderType = "contact",
  isSent = false,
  senderEmail,
  attachments,
}: {
  content: string;
  senderName: string;
  senderAvatar?: string;
  timestamp?: string;
  senderType?: "agent" | "contact" | "ai_assistant";
  isSent?: boolean;
  senderEmail?: string;
  attachments?: React.ReactNode;
}) {
  const formattedTime = timestamp
    ? formatDistanceToNow(new Date(timestamp), {
        addSuffix: true,
        locale: ptBR,
      })
    : "";

  return (
    <div className={`flex gap-3 ${isSent ? "flex-row-reverse" : ""}`}>
      {/* Avatar */}
      <Avatar className="h-8 w-8 flex-shrink-0">
        <AvatarImage src={senderAvatar} alt={senderName} />
        <AvatarFallback>{senderName.charAt(0).toUpperCase()}</AvatarFallback>
      </Avatar>

      {/* Conteúdo */}
      <div className={`flex flex-col gap-1 max-w-sm ${isSent ? "items-end" : ""}`}>
        {/* Header com Nome e Email */}
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold">{senderName}</span>
          {senderEmail && (
            <span className="text-xs text-muted-foreground">
              send via email
            </span>
          )}
          {timestamp && (
            <span className="text-xs text-muted-foreground">{formattedTime}</span>
          )}
        </div>

        {/* Mensagem */}
        <Card
          className={`px-4 py-2 ${
            isSent
              ? "bg-primary text-primary-foreground"
              : "bg-muted text-foreground"
          }`}
        >
          <p className="text-sm whitespace-pre-wrap break-words">{content}</p>
        </Card>

        {/* Anexos */}
        {attachments && <div className="mt-2">{attachments}</div>}
      </div>
    </div>
  );
}