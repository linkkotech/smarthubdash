import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface WorkspaceUser {
  id: string;
  full_name: string;
  email: string;
}

export function useUsersForWorkspace(workspaceId: string) {
  return useQuery<WorkspaceUser[]>({
    queryKey: ["workspaceUsers", workspaceId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("workspace_members")
        .select(
          `
          user_id,
          profiles (id, full_name, email)
        `
        )
        .eq("workspace_id", workspaceId);

      if (error) throw error;

      return (data || [])
        .map((member: any) => member.profiles)
        .filter(Boolean);
    },
    enabled: !!workspaceId,
    staleTime: 1000 * 60 * 10, // 10 minutes
  });
}
