import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

/**
 * @typedef {object} ConversationItemProps
 * @property {string} id - ID único da conversa (chave de identificação no banco)
 * @property {string} name - Nome do contato/conversação para exibição
 * @property {string} [avatar] - URL de avatar/logo do contato
 * @property {string} [lastMessage] - Preview da última mensagem (truncado na UI)
 * @property {string} [timestamp] - Timestamp relativo (ex: "2m ago", "ontem", "há 3 dias")
 * @property {boolean} [isOnline] - Flag indicando se contato está online (mostra ponto verde)
 * @property {boolean} [isSelected] - Flag para highlight visual quando conversa selecionada
 * @property {number} [unreadCount] - Número de mensagens não lidas (renderiza badge se > 0)
 * @property {() => void} [onClick] - Disparado ao clicar no item
 */

/**
 * Componente ConversationItem
 *
 * Item visual individual da lista de conversas na ChatSidebar.
 * Renderizado dentro de ScrollArea, um por conversa com estado de seleção.
 *
 * **Layout Horizontal:**
 * - Avatar (10x10, relativo) com dot verde se isOnline
 * - Conteúdo (flex-1):
 *   - Linha 1: Nome (font-semibold text-sm, truncate) + Timestamp (text-xs, flex-shrink-0)
 *   - Linha 2: Last message preview (truncate, muted-foreground)
 * - Badge de unread count se > 0 (badge rounded-full, text-xs, bg-primary)
 *
 * **Estados Visuais:**
 * - Não selecionado: hover:bg-muted
 * - Selecionado (isSelected=true): bg-primary/10 com border border-primary/20
 * - Online (isOnline=true): dot verde no canto inferior direito do avatar
 * - Unread (unreadCount > 0): badge com número (trunca em 99+)
 *
 * **Design:**
 * - Container: flex, items-center, gap-3, p-3
 * - Cursor pointer com transition-colors smooth
 * - Rounded-lg para cantos suavizados
 * - Avatar: h-10 w-10, fallback com primeira letra do nome
 * - Online indicator: absolute, h-3 w-3, bg-green-500, rounded-full, border-2 border-white
 *
 * **Integração:**
 * - Mapeado para cada conversa em ChatSidebar.conversations array
 * - onClick dispara onSelectConversation no ChatSidebar parent
 * - isSelected determinado por comparação com selectedConversationId
 *
 * @param {ConversationItemProps} props - Props do componente
 * @returns {JSX.Element} Item clicável da lista com avatar, nome, preview e indicadores
 */
export function ConversationItem({
  id,
  name,
  avatar,
  lastMessage,
  timestamp,
  isOnline = false,
  isSelected = false,
  unreadCount = 0,
  onClick,
}: {
  id: string;
  name: string;
  avatar?: string;
  lastMessage?: string;
  timestamp?: string;
  isOnline?: boolean;
  isSelected?: boolean;
  unreadCount?: number;
  onClick?: () => void;
}) {
  return (
    <div
      onClick={onClick}
      className={cn(
        "flex items-center gap-3 p-3 cursor-pointer rounded-lg transition-colors",
        isSelected
          ? "bg-primary/10 border border-primary/20"
          : "hover:bg-muted"
      )}
    >
      {/* Avatar com indicador de status */}
      <div className="relative flex-shrink-0">
        <Avatar className="h-10 w-10">
          <AvatarImage src={avatar} alt={name} />
          <AvatarFallback>{name.charAt(0).toUpperCase()}</AvatarFallback>
        </Avatar>
        {isOnline && (
          <div className="absolute bottom-0 right-0 h-3 w-3 bg-green-500 rounded-full border-2 border-white"></div>
        )}
      </div>

      {/* Conteúdo da conversa */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2 mb-1">
          <h4 className="font-semibold text-sm truncate">{name}</h4>
          {timestamp && (
            <span className="text-xs text-muted-foreground flex-shrink-0">
              {timestamp}
            </span>
          )}
        </div>
        {lastMessage && (
          <p className="text-xs text-muted-foreground truncate">
            {lastMessage}
          </p>
        )}
      </div>

      {/* Badge de mensagens não lidas */}
      {unreadCount > 0 && (
        <Badge className="bg-primary text-primary-foreground rounded-full h-5 w-5 flex items-center justify-center p-0 text-xs font-bold flex-shrink-0">
          {unreadCount > 99 ? "99+" : unreadCount}
        </Badge>
      )}
    </div>
  );
}