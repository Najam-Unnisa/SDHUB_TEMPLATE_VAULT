-- Insert communication domains
INSERT INTO domains (name, description) VALUES
  ('Executive / CEO', 'High-level strategic and institutional communications'),
  ('Management', 'Team leadership and operational communications'),
  ('Team', 'Team coordination and collaboration messages'),
  ('HR', 'Human resources and employee-related communications'),
  ('Client', 'Client-facing and external communications'),
  ('Academic', 'Academic and educational communications'),
  ('Mentorship', 'Mentoring and developmental communications')
ON CONFLICT (name) DO NOTHING;
