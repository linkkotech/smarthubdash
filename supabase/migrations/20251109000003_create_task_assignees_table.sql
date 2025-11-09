-- Create task_assignees junction table
CREATE TABLE task_assignees (
  task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (task_id, user_id)
);

-- Create indexes for faster queries
CREATE INDEX idx_task_assignees_task_id ON task_assignees(task_id);
CREATE INDEX idx_task_assignees_user_id ON task_assignees(user_id);

-- Enable RLS
ALTER TABLE task_assignees ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can view assignees for tasks in their workspace
CREATE POLICY "Users can view assignees for tasks in their workspace"
  ON task_assignees
  FOR SELECT
  USING (
    task_id IN (
      SELECT id FROM tasks WHERE workspace_id IN (
        SELECT workspace_id FROM workspace_members WHERE profile_id = auth.uid()
      )
    )
  );

-- RLS Policy: Users can manage assignees in their workspace
CREATE POLICY "Users can manage assignees in their workspace"
  ON task_assignees
  FOR INSERT
  WITH CHECK (
    task_id IN (
      SELECT id FROM tasks WHERE workspace_id IN (
        SELECT workspace_id FROM workspace_members WHERE profile_id = auth.uid()
      )
    )
  );

-- RLS Policy: Users can delete assignees in their workspace
CREATE POLICY "Users can delete assignees in their workspace"
  ON task_assignees
  FOR DELETE
  USING (
    task_id IN (
      SELECT id FROM tasks WHERE workspace_id IN (
        SELECT workspace_id FROM workspace_members WHERE profile_id = auth.uid()
      )
    )
  );
