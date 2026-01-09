-- Disable RLS on domains table to allow inserts (for development)
ALTER TABLE domains DISABLE ROW LEVEL SECURITY;

-- Or alternatively, add an INSERT policy:
-- CREATE POLICY "Authenticated users can create domains" ON domains FOR INSERT
--   WITH CHECK (auth.role() = 'authenticated');
