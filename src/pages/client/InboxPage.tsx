import { usePageHeader } from "@/contexts/PageHeaderContext";
import { Button } from "@/components/ui/button";
import { useEffect } from "react";
import { ChatLayout } from "@/components/chat/ChatLayout";
import { ChatSidebar } from "@/components/chat/ChatSidebar";
import { ChatWindow } from "@/components/chat/ChatWindow";
import { ChatDetails } from "@/components/chat/ChatDetails";

/**
 * Página de Inbox - Interface de Chat CRM
 *
 * Renderiza a interface profissional de chat/conversas com layout de três colunas redimensionáveis:
 * - **Coluna 1 (20% - Sidebar)**: Lista de conversas com busca e filtros
 * - **Coluna 2 (55% - Chat Window)**: Área principale de mensagens e input
 * - **Coluna 3 (25% - Details)**: Informações completas do lead/contato
 *
 * **Design & UX:**
 * - Fundo cinza claro (bg-slate-50) para contraste profissional
 * - Cards brancos bem delimitados dentro do fundo cinza
 * - Sem overflow hidden para evitar problemas visuais
 * - Layout fluido e responsivo com panéis redimensionáveis
 *
 * **Integração:**
 * - Usa ChatLayout como container central
 * - Monta dados dummy para demonstração (após integração com contexto/API)
 * - Page header configurável via PageHeaderContext
 *
 * @component InboxPage
 * @returns {JSX.Element} Página completa do Inbox com layout de 3 colunas sobre fundo cinza
 */
export default function InboxPage() {
  const { setConfig } = usePageHeader();

  useEffect(() => {
    setConfig({
      title: "Inbox",
      primaryAction: {
        label: "Adicionar novo",
        onClick: () => console.log("Adicionar novo"),
      },
      secondaryAction: {
        label: "Enriquecer contato",
        onClick: () => console.log("Enriquecer contato"),
      },
      customRightContent: (
        <Button onClick={() => console.log("Gerar Proposta")}>
          Gerar Proposta
        </Button>
      ),
    });
  }, [setConfig]);

  const handleNewChat = () => {
    console.log("Nova conversa iniciada");
  };

  const handleSendMessage = (message: string) => {
    console.log("Mensagem enviada:", message);
  };

  return (
    <ChatLayout
      sidebar={<ChatSidebar onNewChat={handleNewChat} />}
      chatWindow={
        <ChatWindow
          contactName="Audrey Kelly"
          contactStatus="online"
          onSendMessage={handleSendMessage}
        />
      }
      details={
        <ChatDetails
          contactName="Audrey Kelly"
          contactStatus="Applied a week ago"
          position="Senior Product Designer"
          company="Tech Company"
          location="Yogyakarta, Indonesia"
          employmentType="Full Time"
          kanbanStatus="qualified_lead"
          email="leonardcampbell@gmail.com"
          phone="+1 (401) 592-4672"
          address="225 Cherry Street #24, New York, NY"
          skype="@leonardcamp"
          activities={[
            {
              id: "1",
              conversation_id: "conv1",
              type: "email",
              description: "Email sent with resume",
              created_by: "user1",
              created_at: new Date().toISOString(),
            },
          ]}
          notes={[
            {
              id: "1",
              conversation_id: "conv1",
              content: "Follow up next week",
              created_by: "user1",
              created_at: new Date(Date.now() - 86400000).toISOString(),
              updated_at: new Date().toISOString(),
            },
          ]}
        />
      }
    />
  );
}
