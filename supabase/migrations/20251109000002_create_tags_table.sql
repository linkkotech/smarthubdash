-- Create tags table
CREATE TABLE tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  color TEXT DEFAULT '#3b82f6',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create unique constraint for tag names per workspace
CREATE UNIQUE INDEX idx_tags_workspace_name ON tags(workspace_id, LOWER(name));

-- Create index for faster queries
CREATE INDEX idx_tags_workspace_id ON tags(workspace_id);

-- Enable RLS
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can view tags in their workspace
CREATE POLICY "Users can view tags in their workspace"
  ON tags
  FOR SELECT
  USING (
    workspace_id IN (
      SELECT workspace_id FROM workspace_members WHERE profile_id = auth.uid()
    )
  );

-- RLS Policy: Users can create tags in their workspace
CREATE POLICY "Users can create tags in their workspace"
  ON tags
  FOR INSERT
  WITH CHECK (
    workspace_id IN (
      SELECT workspace_id FROM workspace_members WHERE profile_id = auth.uid()
    )
  );

-- RLS Policy: Users can update tags in their workspace
CREATE POLICY "Users can update tags in their workspace"
  ON tags
  FOR UPDATE
  USING (
    workspace_id IN (
      SELECT workspace_id FROM workspace_members WHERE profile_id = auth.uid()
    )
  );

-- RLS Policy: Users can delete tags in their workspace
CREATE POLICY "Users can delete tags in their workspace"
  ON tags
  FOR DELETE
  USING (
    workspace_id IN (
      SELECT workspace_id FROM workspace_members WHERE profile_id = auth.uid()
    )
  );
