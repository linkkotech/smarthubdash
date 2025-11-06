import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import type { Note } from "@/types/chat";

/**
 * @typedef {object} NotesSectionProps
 * @property {Note[]} notes - Lista de notas existentes
 * @property {(content: string) => void} [onAddNote] - Callback para adicionar nota
 */

/**
 * Componente NotesSection
 * 
 * Renderiza uma seção para adicionar e visualizar notas associadas à conversa.
 * Inclui textarea para nova nota, botão "Adicionar Nota" e lista de notas anteriores.
 * 
 * @param {NotesSectionProps} props - As props do componente
 * @returns {JSX.Element} A seção de notas
 */
export function NotesSection({
  notes = [],
  onAddNote,
}: {
  notes?: Note[];
  onAddNote?: (content: string) => void;
}) {
  const [noteContent, setNoteContent] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleAddNote = async () => {
    if (noteContent.trim() && onAddNote) {
      setIsLoading(true);
      try {
        onAddNote(noteContent);
        setNoteContent("");
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="space-y-3">
      {/* Textarea para nova nota */}
      <Textarea
        placeholder="Write notes here..."
        value={noteContent}
        onChange={(e) => setNoteContent(e.target.value)}
        className="min-h-20 text-sm"
        disabled={isLoading}
      />

      {/* Botão Adicionar Nota */}
      <Button
        onClick={handleAddNote}
        disabled={!noteContent.trim() || isLoading}
        className="w-full"
      >
        {isLoading ? "Adicionando..." : "Adicionar Nota"}
      </Button>

      {/* Lista de notas */}
      {notes.length > 0 && (
        <div className="space-y-2 mt-4 pt-4 border-t">
          <p className="text-xs font-semibold text-muted-foreground">
            Notas Anteriores
          </p>
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {notes.map((note) => (
              <div
                key={note.id}
                className="bg-muted p-2 rounded text-xs space-y-1"
              >
                <p className="text-muted-foreground line-clamp-2">
                  {note.content}
                </p>
                <p className="text-xs text-muted-foreground">
                  {new Date(note.created_at).toLocaleDateString("pt-BR")}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}