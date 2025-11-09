-- Create task_tags junction table
CREATE TABLE task_tags (
  task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  tag_id UUID NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
  PRIMARY KEY (task_id, tag_id)
);

-- Create indexes for faster queries
CREATE INDEX idx_task_tags_task_id ON task_tags(task_id);
CREATE INDEX idx_task_tags_tag_id ON task_tags(tag_id);

-- Enable RLS
ALTER TABLE task_tags ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can view tags for tasks in their workspace
CREATE POLICY "Users can view tags for tasks in their workspace"
  ON task_tags
  FOR SELECT
  USING (
    task_id IN (
      SELECT id FROM tasks WHERE workspace_id IN (
        SELECT workspace_id FROM workspace_members WHERE profile_id = auth.uid()
      )
    )
  );

-- RLS Policy: Users can manage tags in their workspace
CREATE POLICY "Users can manage tags in their workspace"
  ON task_tags
  FOR INSERT
  WITH CHECK (
    task_id IN (
      SELECT id FROM tasks WHERE workspace_id IN (
        SELECT workspace_id FROM workspace_members WHERE profile_id = auth.uid()
      )
    )
  );

-- RLS Policy: Users can delete tags in their workspace
CREATE POLICY "Users can delete tags in their workspace"
  ON task_tags
  FOR DELETE
  USING (
    task_id IN (
      SELECT id FROM tasks WHERE workspace_id IN (
        SELECT workspace_id FROM workspace_members WHERE profile_id = auth.uid()
      )
    )
  );
