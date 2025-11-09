import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface WorkspaceTag {
  id: string;
  name: string;
  color: string;
}

export function useTagsForWorkspace(workspaceId: string) {
  const queryClient = useQueryClient();

  const query = useQuery<WorkspaceTag[]>({
    queryKey: ["tags", workspaceId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("tags")
        .select("id, name, color")
        .eq("workspace_id", workspaceId)
        .order("name", { ascending: true });

      if (error) throw error;
      return data || [];
    },
    enabled: !!workspaceId,
    staleTime: 1000 * 60 * 10, // 10 minutes
  });

  const createTagMutation = useMutation<WorkspaceTag, Error, string>({
    mutationFn: async (tagName: string) => {
      const { data, error } = await supabase
        .from("tags")
        .insert({
          workspace_id: workspaceId,
          name: tagName,
          color: generateRandomColor(),
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["tags", workspaceId],
      });
      toast.success("Tag criada com sucesso!");
    },
    onError: (error) => {
      toast.error(`Erro ao criar tag: ${error.message}`);
    },
  });

  return {
    tags: query.data || [],
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    createTag: createTagMutation.mutateAsync,
    isCreatingTag: createTagMutation.isPending,
  };
}

function generateRandomColor(): string {
  const colors = [
    "#3b82f6", // blue
    "#ef4444", // red
    "#10b981", // green
    "#f59e0b", // amber
    "#8b5cf6", // purple
    "#ec4899", // pink
    "#06b6d4", // cyan
    "#6366f1", // indigo
  ];
  return colors[Math.floor(Math.random() * colors.length)];
}
