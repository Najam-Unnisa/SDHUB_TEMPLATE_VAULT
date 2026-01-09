-- Add reference_links (JSON array) and is_favorite (boolean) columns to templates table
ALTER TABLE templates
ADD COLUMN IF NOT EXISTS reference_links JSONB DEFAULT NULL,
ADD COLUMN IF NOT EXISTS is_favorite BOOLEAN DEFAULT false;

-- Create an index on is_favorite for faster filtering
CREATE INDEX IF NOT EXISTS idx_templates_is_favorite ON templates(is_favorite);
