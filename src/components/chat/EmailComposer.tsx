import { Button } from "@/components/ui/button";
import {
  Paperclip,
  Mic,
  CornerDownLeft,
  Send,
  Trash2,
} from "lucide-react";

interface EmailComposerProps {
  /** O endereço de e-mail do remetente (usuário da plataforma). */
  fromEmail: string;
  /** O endereço de e-mail do destinatário (lead/contato). */
  toEmail: string;
  /** Função de callback acionada quando o botão de envio é clicado. */
  onSend: () => void;
  /** Função de callback acionada quando o ícone de lixeira é clicado. */
  onDelete: () => void;
}

/**
 * Componente EmailComposer
 *
 * Renderiza uma interface completa para compor e enviar e-mails dentro da janela de chat.
 * Inclui seletores de ação (Reply/From), campos de destinatário, área de texto principal
 * e uma barra de ferramentas com opções de anexo e botão de envio.
 *
 * @param {EmailComposerProps} props - As props do componente.
 * @returns {JSX.Element} A interface de composição de e-mail.
 */
export function EmailComposer({
  fromEmail,
  toEmail,
  onSend,
  onDelete,
}: EmailComposerProps) {
  return (
    <div className="flex flex-col h-full bg-white rounded-lg shadow-sm border border-gray-200">
      {/* Header */}
      <div className="flex items-center justify-between p-2 bg-gray-900 text-white rounded-t-lg">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" className="text-white hover:bg-gray-700">
            <CornerDownLeft className="w-4 h-4 mr-2" />
            Reply
          </Button>
          <span className="text-sm text-gray-400">|</span>
          <span className="text-sm">From: {fromEmail}</span>
        </div>
        <Button variant="ghost" size="icon" onClick={onDelete} className="text-white hover:bg-gray-700">
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>

      {/* To Field */}
      <div className="p-3 border-b border-gray-200">
        <span className="text-sm text-gray-500">To: {toEmail}</span>
      </div>

      {/* Message Body */}
      <div className="flex-1 p-3">
        <textarea
          className="w-full h-full resize-none border-none focus:ring-0 text-sm"
          placeholder="Hi Leonard Campbell,"
        />
      </div>

      {/* Footer Toolbar */}
      <div className="flex items-center justify-between p-2">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="text-gray-500 hover:bg-gray-100">
            <Paperclip className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="icon" className="text-gray-500 hover:bg-gray-100">
            <Mic className="w-4 h-4" />
          </Button>
        </div>
        <Button onClick={onSend} className="bg-green-500 hover:bg-green-600 text-white">
          <Send className="w-4 h-4 mr-2" />
          Send
        </Button>
      </div>
    </div>
  );
}