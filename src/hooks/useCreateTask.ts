import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { CreateTaskInput } from "@/lib/schemas/task.schema";
import { toast } from "sonner";

interface CreateTaskResponse {
  success: boolean;
  task_id: string;
  message: string;
}

interface CreateTaskError {
  error: string;
}

export function useCreateTask() {
  const queryClient = useQueryClient();

  return useMutation<CreateTaskResponse, Error, CreateTaskInput>({
    mutationFn: async (payload: CreateTaskInput) => {
      // Get current session
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError || !session) {
        throw new Error("Unauthorized");
      }

      // Call Edge Function
      const { data, error } = await supabase.functions.invoke("create-task", {
        body: payload,
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) {
        throw new Error(error.message || "Failed to create task");
      }

      const response = data as CreateTaskResponse | CreateTaskError;
      if ("error" in response) {
        throw new Error(response.error);
      }

      return response;
    },
    onSuccess: (data, variables) => {
      toast.success("Tarefa criada com sucesso!");

      // Invalidate tasks query
      queryClient.invalidateQueries({
        queryKey: ["tasks", variables.workspace_id],
      });

      // Optionally invalidate other related queries
      queryClient.invalidateQueries({
        queryKey: ["workspaceStats", variables.workspace_id],
      });
    },
    onError: (error) => {
      toast.error(`Erro ao criar tarefa: ${error.message}`);
    },
  });
}
