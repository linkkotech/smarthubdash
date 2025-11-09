-- Create subtasks table
CREATE TABLE subtasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  is_completed BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for faster queries
CREATE INDEX idx_subtasks_parent_task_id ON subtasks(parent_task_id);
CREATE INDEX idx_subtasks_is_completed ON subtasks(is_completed);

-- Enable RLS
ALTER TABLE subtasks ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can view subtasks for tasks in their workspace
CREATE POLICY "Users can view subtasks for tasks in their workspace"
  ON subtasks
  FOR SELECT
  USING (
    parent_task_id IN (
      SELECT id FROM tasks WHERE workspace_id IN (
        SELECT workspace_id FROM workspace_members WHERE profile_id = auth.uid()
      )
    )
  );

-- RLS Policy: Users can create subtasks for tasks in their workspace
CREATE POLICY "Users can create subtasks for tasks in their workspace"
  ON subtasks
  FOR INSERT
  WITH CHECK (
    parent_task_id IN (
      SELECT id FROM tasks WHERE workspace_id IN (
        SELECT workspace_id FROM workspace_members WHERE profile_id = auth.uid()
      )
    )
  );

-- RLS Policy: Users can update subtasks for tasks in their workspace
CREATE POLICY "Users can update subtasks for tasks in their workspace"
  ON subtasks
  FOR UPDATE
  USING (
    parent_task_id IN (
      SELECT id FROM tasks WHERE workspace_id IN (
        SELECT workspace_id FROM workspace_members WHERE profile_id = auth.uid()
      )
    )
  );

-- RLS Policy: Users can delete subtasks for tasks in their workspace
CREATE POLICY "Users can delete subtasks for tasks in their workspace"
  ON subtasks
  FOR DELETE
  USING (
    parent_task_id IN (
      SELECT id FROM tasks WHERE workspace_id IN (
        SELECT workspace_id FROM workspace_members WHERE profile_id = auth.uid()
      )
    )
  );
