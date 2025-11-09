import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface TaskWithRelations {
  id: string;
  workspace_id: string;
  title: string;
  priority: string;
  due_date: string | null;
  status: string;
  description: string | null;
  created_by: string;
  is_favorite: boolean;
  created_at: string;
  updated_at: string;
  assignees?: Array<{ id: string; full_name: string; email: string }>;
  tags?: Array<{ id: string; name: string; color: string }>;
  subtasks?: Array<{ id: string; title: string; is_completed: boolean }>;
}

export function useTasksQuery(workspaceId: string) {
  return useQuery<TaskWithRelations[]>({
    queryKey: ["tasks", workspaceId],
    queryFn: async () => {
      // Fetch tasks with their relationships
      const { data: tasksData, error } = await supabase
        .from("tasks")
        .select(
          `
          *,
          task_assignees (
            user_id,
            profiles (id, full_name, email)
          ),
          task_tags (
            tag_id,
            tags (id, name, color)
          ),
          subtasks (id, title, is_completed)
        `
        )
        .eq("workspace_id", workspaceId)
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Transform the data to flatten relationships
      return (tasksData || []).map((task: any) => ({
        ...task,
        assignees: task.task_assignees?.map((ta: any) => ta.profiles) || [],
        tags: task.task_tags?.map((tt: any) => tt.tags) || [],
        subtasks: task.subtasks || [],
      }));
    },
    enabled: !!workspaceId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}
