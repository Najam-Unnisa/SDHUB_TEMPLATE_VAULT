-- Insert a sample user for testing (replace with real user data)
INSERT INTO users (email, name, role) VALUES
  ('admin@sdhub.local', 'Admin User', 'Director')
ON CONFLICT (email) DO NOTHING;
