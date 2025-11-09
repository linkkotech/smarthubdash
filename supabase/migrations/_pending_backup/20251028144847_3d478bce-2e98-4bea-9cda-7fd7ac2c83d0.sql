-- Add status column to digital_templates
ALTER TABLE public.digital_templates 
ADD COLUMN status TEXT NOT NULL DEFAULT 'draft' 
CHECK (status IN ('draft', 'published', 'archived'));

-- Add index for performance
CREATE INDEX idx_digital_templates_status ON public.digital_templates(status);

-- Add comment
COMMENT ON COLUMN public.digital_templates.status IS 'Template status: draft (editing), published (available in gallery), archived (hidden but preserved)';