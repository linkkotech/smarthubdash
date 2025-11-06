import React, { createContext, useContext, useState, useCallback } from "react";
import type { Note, Activity } from "@/types/chat";

/**
 * Interface para o estado do Chat
 */
interface ChatContextType {
  selectedInboxId: string | null;
  selectedConversationId: string | null;
  notes: Map<string, Note[]>;
  activities: Map<string, Activity[]>;
  setSelectedInboxId: (inboxId: string | null) => void;
  setSelectedConversationId: (conversationId: string | null) => void;
  addNote: (conversationId: string, note: Note) => void;
  deleteNote: (conversationId: string, noteId: string) => void;
  getNotes: (conversationId: string) => Note[];
  addActivity: (conversationId: string, activity: Activity) => void;
  getActivities: (conversationId: string) => Activity[];
}

/**
 * Contexto para gerenciar o estado do Chat
 */
const ChatContext = createContext<ChatContextType | undefined>(undefined);

/**
 * Provider do contexto de Chat
 *
 * Fornece o estado global para o chat, permitindo que componentes
 * acessem e atualizar a inbox, conversa selecionadas, notas e atividades.
 *
 * @param {React.ReactNode} children - Os componentes filhos
 * @returns {JSX.Element} O provider do contexto
 */
export function ChatProvider({ children }: { children: React.ReactNode }) {
  const [selectedInboxId, setSelectedInboxId] = useState<string | null>(null);
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [notes, setNotes] = useState<Map<string, Note[]>>(new Map());
  const [activities, setActivities] = useState<Map<string, Activity[]>>(new Map());

  const addNote = useCallback((conversationId: string, note: Note) => {
    setNotes((prev) => {
      const newNotes = new Map(prev);
      const conversationNotes = newNotes.get(conversationId) || [];
      newNotes.set(conversationId, [...conversationNotes, note]);
      return newNotes;
    });
  }, []);

  const deleteNote = useCallback((conversationId: string, noteId: string) => {
    setNotes((prev) => {
      const newNotes = new Map(prev);
      const conversationNotes = newNotes.get(conversationId) || [];
      newNotes.set(
        conversationId,
        conversationNotes.filter((note) => note.id !== noteId)
      );
      return newNotes;
    });
  }, []);

  const getNotes = useCallback(
    (conversationId: string) => notes.get(conversationId) || [],
    [notes]
  );

  const addActivity = useCallback((conversationId: string, activity: Activity) => {
    setActivities((prev) => {
      const newActivities = new Map(prev);
      const conversationActivities = newActivities.get(conversationId) || [];
      newActivities.set(conversationId, [...conversationActivities, activity]);
      return newActivities;
    });
  }, []);

  const getActivities = useCallback(
    (conversationId: string) => activities.get(conversationId) || [],
    [activities]
  );

  const value: ChatContextType = {
    selectedInboxId,
    selectedConversationId,
    notes,
    activities,
    setSelectedInboxId: useCallback((inboxId) => setSelectedInboxId(inboxId), []),
    setSelectedConversationId: useCallback((conversationId) => setSelectedConversationId(conversationId), []),
    addNote,
    deleteNote,
    getNotes,
    addActivity,
    getActivities,
  };

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
}

/**
 * Hook para usar o contexto de Chat
 *
 * @returns {ChatContextType} O contexto do chat com todas as funções e estado
 * @throws {Error} Se usado fora do ChatProvider
 */
export function useChat() {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error("useChat deve ser usado dentro de um ChatProvider");
  }
  return context;
}