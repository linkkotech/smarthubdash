-- ============================================================================
-- MIGRATION: Criar tabelas para a funcionalidade de Chat/Inbox
-- ============================================================================
-- Data: 05 de novembro de 2025
-- Descrição: Cria as tabelas inboxes, conversations, messages e ai_assistants
--            para suportar a nova funcionalidade de chat.
-- ============================================================================

-- ============================================================================
-- ETAPA 1: Tabela inboxes
-- Representa uma caixa de entrada dentro de um workspace.
-- ============================================================================
CREATE TABLE public.inboxes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
COMMENT ON TABLE public.inboxes IS 'Caixas de entrada para organizar conversas dentro de um workspace.';
CREATE INDEX idx_inboxes_workspace_id ON public.inboxes(workspace_id);
ALTER TABLE public.inboxes ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- ETAPA 2: Tabela conversations
-- Armazena uma conversa/chat individual.
-- ============================================================================
CREATE TYPE conversation_status AS ENUM ('open', 'closed', 'pending');
CREATE TABLE public.conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  inbox_id UUID NOT NULL REFERENCES public.inboxes(id) ON DELETE CASCADE,
  -- contact_id UUID REFERENCES public.contacts(id) ON DELETE SET NULL, -- Adicionar quando a tabela contacts existir
  status conversation_status NOT NULL DEFAULT 'open',
  last_message_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
COMMENT ON TABLE public.conversations IS 'Representa uma conversa individual com um contato.';
CREATE INDEX idx_conversations_inbox_id ON public.conversations(inbox_id);
CREATE INDEX idx_conversations_status ON public.conversations(status);
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- ETAPA 3: Tabela messages
-- Guarda cada mensagem de uma conversa.
-- ============================================================================
CREATE TYPE message_sender_type AS ENUM ('agent', 'contact', 'ai_assistant');
CREATE TABLE public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  sender_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL, -- ID do agente/usuário interno
  sender_type message_sender_type NOT NULL,
  content TEXT NOT NULL,
  attachments JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
COMMENT ON TABLE public.messages IS 'Armazena cada mensagem trocada em uma conversa.';
CREATE INDEX idx_messages_conversation_id ON public.messages(conversation_id);
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- ETAPA 4: Tabela ai_assistants
-- Armazena as configurações dos assistentes de IA.
-- ============================================================================
CREATE TABLE public.ai_assistants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  prompt TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
COMMENT ON TABLE public.ai_assistants IS 'Configurações para assistentes de IA que podem ser vinculados a inboxes.';
CREATE INDEX idx_ai_assistants_workspace_id ON public.ai_assistants(workspace_id);
ALTER TABLE public.ai_assistants ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- ETAPA 5: Políticas de Segurança (RLS)
-- Permite que membros de um workspace acessem os dados do chat.
-- ============================================================================

-- Políticas para inboxes
CREATE POLICY "Workspace members can view inboxes" ON public.inboxes FOR SELECT USING (public.is_workspace_member(auth.uid(), workspace_id));
CREATE POLICY "Workspace managers can create inboxes" ON public.inboxes FOR INSERT WITH CHECK (public.can_manage_members(auth.uid(), workspace_id));
CREATE POLICY "Workspace managers can update inboxes" ON public.inboxes FOR UPDATE USING (public.can_manage_members(auth.uid(), workspace_id));
CREATE POLICY "Workspace owners can delete inboxes" ON public.inboxes FOR DELETE USING (public.is_workspace_owner(auth.uid(), workspace_id));

-- Políticas para conversations
CREATE POLICY "Members can view conversations in their workspace" ON public.conversations FOR SELECT USING (EXISTS (SELECT 1 FROM inboxes WHERE id = inbox_id AND public.is_workspace_member(auth.uid(), workspace_id)));
CREATE POLICY "Members can create conversations" ON public.conversations FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM inboxes WHERE id = inbox_id AND public.is_workspace_member(auth.uid(), workspace_id)));
CREATE POLICY "Members can update conversations" ON public.conversations FOR UPDATE USING (EXISTS (SELECT 1 FROM inboxes WHERE id = inbox_id AND public.is_workspace_member(auth.uid(), workspace_id)));

-- Políticas para messages
CREATE POLICY "Members can view messages in their conversations" ON public.messages FOR SELECT USING (EXISTS (SELECT 1 FROM conversations c JOIN inboxes i ON c.inbox_id = i.id WHERE c.id = conversation_id AND public.is_workspace_member(auth.uid(), i.workspace_id)));
CREATE POLICY "Members can create messages" ON public.messages FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM conversations c JOIN inboxes i ON c.inbox_id = i.id WHERE c.id = conversation_id AND public.is_workspace_member(auth.uid(), i.workspace_id)));

-- Políticas para ai_assistants
CREATE POLICY "Workspace members can view assistants" ON public.ai_assistants FOR SELECT USING (public.is_workspace_member(auth.uid(), workspace_id));
CREATE POLICY "Workspace managers can create assistants" ON public.ai_assistants FOR INSERT WITH CHECK (public.can_manage_members(auth.uid(), workspace_id));
CREATE POLICY "Workspace managers can update assistants" ON public.ai_assistants FOR UPDATE USING (public.can_manage_members(auth.uid(), workspace_id));
CREATE POLICY "Workspace owners can delete assistants" ON public.ai_assistants FOR DELETE USING (public.is_workspace_owner(auth.uid(), workspace_id));

-- ============================================================================
-- ETAPA 6: Triggers para updated_at
-- ============================================================================
CREATE TRIGGER update_inboxes_updated_at BEFORE UPDATE ON public.inboxes FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_conversations_updated_at BEFORE UPDATE ON public.conversations FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_ai_assistants_updated_at BEFORE UPDATE ON public.ai_assistants FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
