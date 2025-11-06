import { Button } from "@/components/ui/button";
import { Bookmark, Calendar, Phone, MoreVertical } from "lucide-react";

/**
 * @typedef {object} ChatHeaderProps
 * @property {string} contactName - Nome do contato
 * @property {string} [status] - Status do lead (ex: "Applied a week ago")
 * @property {() => void} [onBookmark] - Callback para marcar como favorito
 * @property {() => void} [onSchedule] - Callback para agendar
 * @property {() => void} [onCall] - Callback para iniciar chamada
 * @property {() => void} [onMore] - Callback para mais opções
 */

/**
 * Componente ChatHeader
 * 
 * Renderiza o cabeçalho da janela de chat com Nome do contato,
 * status da aplicação e botões de ação (bookmark, calendar, phone, mais).
 * 
 * @param {ChatHeaderProps} props - As props do componente
 * @returns {JSX.Element} O cabeçalho do chat
 */
export function ChatHeader({
  contactName,
  status,
  onBookmark,
  onSchedule,
  onCall,
  onMore,
}: {
  contactName: string;
  status?: string;
  onBookmark?: () => void;
  onSchedule?: () => void;
  onCall?: () => void;
  onMore?: () => void;
}) {
  return (
    <div className="flex items-center justify-between p-4 border-b">
      <div>
        <h3 className="font-semibold text-lg">{contactName}</h3>
        {status && (
          <p className="text-xs text-muted-foreground">{status}</p>
        )}
      </div>
      <div className="flex items-center gap-1">
        <Button variant="ghost" size="icon" onClick={onBookmark}>
          <Bookmark className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" onClick={onSchedule}>
          <Calendar className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" onClick={onCall}>
          <Phone className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" onClick={onMore}>
          <MoreVertical className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}