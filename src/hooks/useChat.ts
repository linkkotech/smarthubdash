import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type {
  Inbox,
  Conversation,
  Message,
  CreateConversationInput,
  CreateMessageInput,
  CreateInboxInput,
} from "@/types/chat";

/**
 * Hook para buscar todas as inboxes de um workspace
 * @param {string} workspaceId - ID do workspace
 * @returns {object} - Objeto com dados, loading e erro
 */
export function useInboxes(workspaceId: string | undefined) {
  return useQuery({
    queryKey: ["inboxes", workspaceId],
    queryFn: async () => {
      if (!workspaceId) return [];
      const { data, error } = await (supabase as any)
        .from("inboxes")
        .select("*")
        .eq("workspace_id", workspaceId)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data as Inbox[]) || [];
    },
    enabled: !!workspaceId,
  });
}

/**
 * Hook para buscar as conversas de um inbox
 * @param {string} inboxId - ID da caixa de entrada
 * @returns {object} - Objeto com dados, loading e erro
 */
export function useConversations(inboxId: string | undefined) {
  return useQuery({
    queryKey: ["conversations", inboxId],
    queryFn: async () => {
      if (!inboxId) return [];
      const { data, error } = await (supabase as any)
        .from("conversations")
        .select("*")
        .eq("inbox_id", inboxId)
        .order("last_message_at", { ascending: false });
      if (error) throw error;
      return (data as Conversation[]) || [];
    },
    enabled: !!inboxId,
  });
}

/**
 * Hook para buscar as mensagens de uma conversa
 * @param {string} conversationId - ID da conversa
 * @returns {object} - Objeto com dados, loading e erro
 */
export function useMessages(conversationId: string | undefined) {
  return useQuery({
    queryKey: ["messages", conversationId],
    queryFn: async () => {
      if (!conversationId) return [];
      const { data, error } = await (supabase as any)
        .from("messages")
        .select("*")
        .eq("conversation_id", conversationId)
        .order("created_at", { ascending: true });
      if (error) throw error;
      return (data as Message[]) || [];
    },
    enabled: !!conversationId,
  });
}

/**
 * Hook para criar uma nova conversa
 * @returns {object} - Objeto com mutação, loading e erro
 */
export function useCreateConversation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: CreateConversationInput) => {
      const { data, error } = await (supabase as any)
        .from("conversations")
        .insert([input])
        .select()
        .single();
      if (error) throw error;
      return data as Conversation;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["conversations", variables.inbox_id] });
    },
  });
}

/**
 * Hook para criar uma nova mensagem
 * @returns {object} - Objeto com mutação, loading e erro
 */
export function useSendMessage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: CreateMessageInput) => {
      const { data, error } = await (supabase as any)
        .from("messages")
        .insert([input])
        .select()
        .single();
      if (error) throw error;

      // Atualizar last_message_at da conversa
      await (supabase as any)
        .from("conversations")
        .update({ last_message_at: new Date().toISOString() })
        .eq("id", input.conversation_id);

      return data as Message;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["messages", variables.conversation_id] });
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
    },
  });
}

/**
 * Hook para criar uma nova inbox
 * @returns {object} - Objeto com mutação, loading e erro
 */
export function useCreateInbox() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: CreateInboxInput) => {
      const { data, error } = await (supabase as any)
        .from("inboxes")
        .insert([input])
        .select()
        .single();
      if (error) throw error;
      return data as Inbox;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["inboxes", variables.workspace_id] });
    },
  });
}