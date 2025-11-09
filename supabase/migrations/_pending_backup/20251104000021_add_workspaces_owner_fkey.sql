-- Migration: Add owner_id column and foreign key to workspaces table
-- Description: 
-- 1. Adds owner_id column to workspaces table
-- 2. Populates owner_id from workspace_members (role = 'owner')
-- 3. Creates foreign key relationship between workspaces.owner_id and profiles.id

-- ============================================================================
-- STEP 1: Add owner_id column
-- ============================================================================
ALTER TABLE public.workspaces
ADD COLUMN IF NOT EXISTS owner_id UUID;

COMMENT ON COLUMN public.workspaces.owner_id IS 'ID do perfil que é o owner deste workspace (denormalized from workspace_members)';

-- ============================================================================
-- STEP 2: Populate owner_id from workspace_members
-- ============================================================================
UPDATE public.workspaces w
SET owner_id = (
  SELECT profile_id 
  FROM public.workspace_members wm
  WHERE wm.workspace_id = w.id 
    AND wm.role = 'owner'
  LIMIT 1
)
WHERE owner_id IS NULL;

-- ============================================================================
-- STEP 3: Add foreign key constraint
-- ============================================================================
ALTER TABLE public.workspaces
ADD CONSTRAINT workspaces_owner_id_fkey 
FOREIGN KEY (owner_id) 
REFERENCES public.profiles(id) 
ON DELETE SET NULL;

-- ============================================================================
-- STEP 4: Create index for better query performance
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_workspaces_owner_id ON public.workspaces(owner_id);

-- ============================================================================
-- STEP 5: Create trigger to keep owner_id in sync with workspace_members
-- ============================================================================
CREATE OR REPLACE FUNCTION sync_workspace_owner_id()
RETURNS TRIGGER AS $$
BEGIN
  -- When a workspace_member with role 'owner' is inserted or updated
  IF NEW.role = 'owner' THEN
    UPDATE public.workspaces
    SET owner_id = NEW.profile_id
    WHERE id = NEW.workspace_id;
  END IF;
  
  -- When an owner is deleted or role changed, update to next available owner
  IF (TG_OP = 'DELETE' OR (TG_OP = 'UPDATE' AND OLD.role = 'owner' AND NEW.role != 'owner')) THEN
    UPDATE public.workspaces
    SET owner_id = (
      SELECT profile_id 
      FROM public.workspace_members
      WHERE workspace_id = COALESCE(NEW.workspace_id, OLD.workspace_id)
        AND role = 'owner'
      LIMIT 1
    )
    WHERE id = COALESCE(NEW.workspace_id, OLD.workspace_id);
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop trigger if exists and create new one
DROP TRIGGER IF EXISTS sync_workspace_owner_id_trigger ON public.workspace_members;
CREATE TRIGGER sync_workspace_owner_id_trigger
AFTER INSERT OR UPDATE OR DELETE ON public.workspace_members
FOR EACH ROW
EXECUTE FUNCTION sync_workspace_owner_id();
