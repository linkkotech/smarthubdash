import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Bold, AtSign, Link2, Send } from "lucide-react";
import { useState } from "react";

/**
 * @typedef {object} MessageInputProps
 * @property {string} [senderName] - Nome de quem está enviando
 * @property {string} [senderEmail] - Email de quem está enviando
 * @property {(message: string) => void} [onSend] - Callback para enviar mensagem
 * @property {boolean} [disabled] - Desabilita o campo de entrada
 */

/**
 * Componente MessageInput
 * 
 * Renderiza o campo de entrada para novas mensagens com botões
 * de formatação (bold, @mention, link) e botão de envio.
 * 
 * @param {MessageInputProps} props - As props do componente
 * @returns {JSX.Element} O campo de entrada de mensagens
 */
export function MessageInput({
  senderName,
  senderEmail,
  onSend,
  disabled = false,
}: {
  senderName?: string;
  senderEmail?: string;
  onSend?: (message: string) => void;
  disabled?: boolean;
}) {
  const [message, setMessage] = useState("");

  const handleSend = () => {
    if (message.trim() && onSend) {
      onSend(message);
      setMessage("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="space-y-3 p-4 border-t bg-white">
      {/* Info de quem está respondendo */}
      {senderEmail && (
        <div className="bg-black text-white px-3 py-2 rounded text-xs flex items-center justify-between">
          <div>
            <span>Reply</span>
            <span className="ml-2 font-semibold">From {senderEmail}</span>
          </div>
          <span className="cursor-pointer">×</span>
        </div>
      )}

      {/* Campo de resposta com remetente */}
      {senderEmail && (
        <div className="text-xs text-muted-foreground">
          To: {senderEmail}
        </div>
      )}

      {/* Campo de entrada */}
      <div className="flex items-end gap-2">
        <Input
          placeholder="Type your message..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          className="flex-1"
        />

        {/* Botões de formatação */}
        <div className="flex gap-1">
          <Button
            variant="ghost"
            size="icon"
            disabled={disabled}
            className="h-9 w-9"
          >
            <Bold className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            disabled={disabled}
            className="h-9 w-9"
          >
            <AtSign className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            disabled={disabled}
            className="h-9 w-9"
          >
            <Link2 className="h-4 w-4" />
          </Button>

          {/* Botão Send */}
          <Button
            onClick={handleSend}
            disabled={disabled || !message.trim()}
            className="bg-green-500 hover:bg-green-600 text-white px-3"
          >
            <Send className="h-4 w-4 mr-1" />
            Send
          </Button>
        </div>
      </div>
    </div>
  );
}