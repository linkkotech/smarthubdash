-- Create task_attachments table
CREATE TABLE task_attachments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  file_url TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_size INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for faster queries
CREATE INDEX idx_task_attachments_task_id ON task_attachments(task_id);

-- Enable RLS
ALTER TABLE task_attachments ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can view attachments for tasks in their workspace
CREATE POLICY "Users can view attachments for tasks in their workspace"
  ON task_attachments
  FOR SELECT
  USING (
    task_id IN (
      SELECT id FROM tasks WHERE workspace_id IN (
        SELECT workspace_id FROM workspace_members WHERE profile_id = auth.uid()
      )
    )
  );

-- RLS Policy: Users can create attachments for tasks in their workspace
CREATE POLICY "Users can create attachments for tasks in their workspace"
  ON task_attachments
  FOR INSERT
  WITH CHECK (
    task_id IN (
      SELECT id FROM tasks WHERE workspace_id IN (
        SELECT workspace_id FROM workspace_members WHERE profile_id = auth.uid()
      )
    )
  );

-- RLS Policy: Users can delete attachments for tasks in their workspace
CREATE POLICY "Users can delete attachments for tasks in their workspace"
  ON task_attachments
  FOR DELETE
  USING (
    task_id IN (
      SELECT id FROM tasks WHERE workspace_id IN (
        SELECT workspace_id FROM workspace_members WHERE profile_id = auth.uid()
      )
    )
  );
