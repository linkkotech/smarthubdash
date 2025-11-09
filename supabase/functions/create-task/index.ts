import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface CreateTaskPayload {
  workspace_id: string;
  title: string;
  priority: "baixa" | "normal" | "alta";
  status: "a_fazer" | "em_progresso" | "em_revisao" | "concluida" | "backlog";
  due_date?: string;
  description?: string;
  is_favorite?: boolean;
  assignees?: string[]; // Array of user IDs
  tags?: string[]; // Array of tag IDs
  subtasks?: Array<{ title: string }>;
}

serve(async (req) => {
  // Handle CORS
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Create Supabase client
    const authHeader = req.headers.get("Authorization") || "";
    const token = authHeader.replace("Bearer ", "");

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") || "",
      Deno.env.get("SUPABASE_ANON_KEY") || "",
      {
        global: {
          headers: { Authorization: `Bearer ${token}` },
        },
      }
    );

    // Get current user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();
    if (userError || !user) {
      throw new Error("Unauthorized");
    }

    const payload = (await req.json()) as CreateTaskPayload;

    // Validate required fields
    if (!payload.title || !payload.priority || !payload.status) {
      return new Response(
        JSON.stringify({
          error: "Missing required fields: title, priority, status",
        }),
        { status: 400, headers: corsHeaders }
      );
    }

    // Verify user is member of workspace
    const { data: memberData, error: memberError } = await supabase
      .from("workspace_members")
      .select("id")
      .eq("workspace_id", payload.workspace_id)
      .eq("user_id", user.id)
      .single();

    if (memberError || !memberData) {
      return new Response(
        JSON.stringify({ error: "Not a member of this workspace" }),
        { status: 403, headers: corsHeaders }
      );
    }

    // Start transaction: Create task
    const { data: taskData, error: taskError } = await supabase
      .from("tasks")
      .insert({
        workspace_id: payload.workspace_id,
        title: payload.title,
        priority: payload.priority,
        status: payload.status,
        due_date: payload.due_date || null,
        description: payload.description || null,
        created_by: user.id,
        is_favorite: payload.is_favorite || false,
      })
      .select()
      .single();

    if (taskError || !taskData) {
      throw new Error(`Failed to create task: ${taskError?.message}`);
    }

    // Insert assignees if provided
    if (payload.assignees && payload.assignees.length > 0) {
      const assigneeRows = payload.assignees.map((userId) => ({
        task_id: taskData.id,
        user_id: userId,
      }));

      const { error: assigneeError } = await supabase
        .from("task_assignees")
        .insert(assigneeRows);

      if (assigneeError) {
        throw new Error(`Failed to add assignees: ${assigneeError.message}`);
      }
    }

    // Insert tags if provided
    if (payload.tags && payload.tags.length > 0) {
      const tagRows = payload.tags.map((tagId) => ({
        task_id: taskData.id,
        tag_id: tagId,
      }));

      const { error: tagError } = await supabase
        .from("task_tags")
        .insert(tagRows);

      if (tagError) {
        throw new Error(`Failed to add tags: ${tagError.message}`);
      }
    }

    // Insert subtasks if provided
    if (payload.subtasks && payload.subtasks.length > 0) {
      const subtaskRows = payload.subtasks.map((subtask) => ({
        parent_task_id: taskData.id,
        title: subtask.title,
        is_completed: false,
      }));

      const { error: subtaskError } = await supabase
        .from("subtasks")
        .insert(subtaskRows);

      if (subtaskError) {
        throw new Error(`Failed to add subtasks: ${subtaskError.message}`);
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        task_id: taskData.id,
        message: "Task created successfully",
      }),
      { status: 201, headers: corsHeaders }
    );
  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Unknown error",
      }),
      { status: 500, headers: corsHeaders }
    );
  }
});
