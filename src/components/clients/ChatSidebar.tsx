
import { Input } from "@/components/ui/input";
import { MessageSquare } from "lucide-react";

export function ChatSidebar() {
  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-6 border-b">
        <div className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-semibold">Assistente</h2>
        </div>
      </div>

      {/* Área de Mensagens (placeholder vazio por enquanto) */}
      <div className="flex-1 p-6 overflow-y-auto">
        <p className="text-sm text-muted-foreground text-center mt-8">
          Chat com assistente de IA será implementado em breve
        </p>
      </div>

      {/* Input na parte inferior */}
      <div className="p-4 border-t">
        <Input 
          placeholder="Pergunte algo..." 
          className="w-full"
        />
      </div>
    </div>
  );
}
