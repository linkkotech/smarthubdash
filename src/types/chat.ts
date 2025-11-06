/**
 * Tipos TypeScript para a funcionalidade de Chat/Inbox
 */

/**
 * Representa uma caixa de entrada (inbox) dentro de um workspace
 */
export interface Inbox {
  id: string;
  workspace_id: string;
  name: string;
  description?: string;
  created_at: string;
  updated_at: string;
}

/**
 * Status possível de uma conversa
 */
export type ConversationStatus = 'open' | 'closed' | 'pending';

/**
 * Representa uma conversa individual
 */
export interface Conversation {
  id: string;
  inbox_id: string;
  status: ConversationStatus;
  last_message_at: string;
  created_at: string;
  updated_at: string;
}

/**
 * Tipo do remetente de uma mensagem
 */
export type MessageSenderType = 'agent' | 'contact' | 'ai_assistant';

/**
 * Representa uma mensagem dentro de uma conversa
 */
export interface Message {
  id: string;
  conversation_id: string;
  sender_id?: string;
  sender_type: MessageSenderType;
  content: string;
  attachments?: unknown;
  created_at: string;
}

/**
 * Representa um assistente de IA
 */
export interface AIAssistant {
  id: string;
  workspace_id: string;
  name: string;
  prompt?: string;
  created_at: string;
  updated_at: string;
}

/**
 * DTO para criar uma nova conversa
 */
export interface CreateConversationInput {
  inbox_id: string;
  status?: ConversationStatus;
}

/**
 * DTO para criar uma nova mensagem
 */
export interface CreateMessageInput {
  conversation_id: string;
  sender_id?: string;
  sender_type: MessageSenderType;
  content: string;
  attachments?: unknown;
}

/**
 * DTO para criar uma nova caixa de entrada
 */
export interface CreateInboxInput {
  workspace_id: string;
  name: string;
  description?: string;
}

/**
 * Status possível de um lead no Kanban do CRM
 */
export type KanbanStatus = 'prospect' | 'qualified_lead' | 'opportunity' | 'negotiation' | 'closed';

/**
 * Representa um lead associado a uma conversa
 */
export interface Lead {
  id: string;
  conversation_id: string;
  name: string;
  email: string;
  phone?: string;
  company?: string;
  position?: string;
  location?: string;
  kanban_status: KanbanStatus;
  created_at: string;
  updated_at: string;
}

/**
 * Representa uma nota em uma conversa
 */
export interface Note {
  id: string;
  conversation_id: string;
  content: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}

/**
 * Representa uma atividade/evento em uma conversa
 */
export interface Activity {
  id: string;
  conversation_id: string;
  type: 'call' | 'email' | 'meeting' | 'task' | 'note' | 'status_change';
  description: string;
  metadata?: unknown;
  created_by: string;
  created_at: string;
}

/**
 * DTO para criar uma nova nota
 */
export interface CreateNoteInput {
  conversation_id: string;
  content: string;
}

/**
 * DTO para criar uma nova atividade
 */
export interface CreateActivityInput {
  conversation_id: string;
  type: Activity['type'];
  description: string;
  metadata?: unknown;
}