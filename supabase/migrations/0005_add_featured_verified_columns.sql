-- Add featured and verified columns to properties table
ALTER TABLE public.properties
ADD COLUMN IF NOT EXISTS featured BOOLEAN NOT NULL DEFAULT false;

ALTER TABLE public.properties
ADD COLUMN IF NOT EXISTS verified BOOLEAN NOT NULL DEFAULT false;

-- Add indexes for the new columns
CREATE INDEX IF NOT EXISTS idx_properties_featured ON public.properties(featured);
CREATE INDEX IF NOT EXISTS idx_properties_verified ON public.properties(verified);