import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { PlusCircle, Search } from "lucide-react";
import { ConversationItem } from "./ConversationItem";
import { useState } from "react";

/**
 * @typedef {object} ConversationListItem
 * @property {string} id - ID único da conversa
 * @property {string} name - Nome do contato ou conversa
 * @property {string} [avatar] - URL da imagem de avatar do contato
 * @property {string} [lastMessage] - Preview da última mensagem enviada/recebida
 * @property {string} [timestamp] - Timestamp relativo (ex: "há 5m", "ontem")
 * @property {boolean} [isOnline] - Indica se o contato está online
 * @property {number} [unreadCount] - Número de mensagens não lidas (0 se lidas)
 */

/**
 * @typedef {object} ChatSidebarProps
 * @property {ConversationListItem[]} [conversations] - Array com a lista de todas as conversas
 * @property {string} [selectedConversationId] - ID da conversa atualmente selecionada (destacada)
 * @property {(conversationId: string) => void} [onSelectConversation] - Callback disparado ao clicar em uma conversa
 * @property {() => void} [onNewChat] - Callback disparado ao clicar em "Nova Conversa"
 */

/**
 * Componente ChatSidebar
 *
 * Barra lateral branca (25% da largura) da interface de chat com:
 * - Campo de busca por nome/contato com ícone de lupa
 * - Abas de filtro: Todos, Pessoal, Time
 * - Lista de conversas com scroll (ScrollArea)
 * - Botão "Nova Conversa" fixo no rodapé
 *
 * **Design:**
 * - Fundo branco (`bg-white`) recebe sombra do ChatLayout
 * - ScrollArea apenas para a lista de conversas
 * - Áreas fixas: header (busca/filtros) e footer (botão nova conversa)
 * - Responsivo: adapta-se ao tamanho redimensionável do painel
 *
 * **Interações:**
 * - Busca em tempo real filtra conversas por nome
 * - Clique em conversa dispara `onSelectConversation`
 * - Clique em botão dispara `onNewChat`
 *
 * @param {ChatSidebarProps} props - Props do componente
 * @returns {JSX.Element} Sidebar branca com lista de conversas
 */
export function ChatSidebar({
  conversations = [],
  selectedConversationId,
  onSelectConversation,
  onNewChat,
}: {
  conversations?: Array<{
    id: string;
    name: string;
    avatar?: string;
    lastMessage?: string;
    timestamp?: string;
    isOnline?: boolean;
    unreadCount?: number;
  }>;
  selectedConversationId?: string;
  onSelectConversation?: (conversationId: string) => void;
  onNewChat?: () => void;
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("all");

  const filteredConversations = conversations.filter((conv) =>
    conv.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header com título e busca */}
      <div className="p-4 border-b space-y-3">
        <h2 className="text-xl font-semibold">Chats</h2>
        <div className="relative">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nome, contato..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Filtros por status */}
      <div className="px-4 pt-3">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="all">Todos</TabsTrigger>
            <TabsTrigger value="personal">Pessoal</TabsTrigger>
            <TabsTrigger value="team">Time</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Lista de conversas */}
      <ScrollArea className="flex-1">
        <div className="space-y-1 p-4">
          {filteredConversations.length > 0 ? (
            filteredConversations.map((conversation) => (
              <ConversationItem
                key={conversation.id}
                id={conversation.id}
                name={conversation.name}
                avatar={conversation.avatar}
                lastMessage={conversation.lastMessage}
                timestamp={conversation.timestamp}
                isOnline={conversation.isOnline}
                unreadCount={conversation.unreadCount}
                isSelected={selectedConversationId === conversation.id}
                onClick={() => onSelectConversation?.(conversation.id)}
              />
            ))
          ) : (
            <div className="text-center py-8 text-muted-foreground text-sm">
              {searchTerm
                ? "Nenhuma conversa encontrada"
                : "Nenhuma conversa disponível"}
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Botão Nova Conversa */}
      <div className="p-4 border-t">
        <Button onClick={onNewChat} className="w-full">
          <PlusCircle className="mr-2 h-4 w-4" />
          Nova Conversa
        </Button>
      </div>
    </div>
  );
}