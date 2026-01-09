-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL DEFAULT 'Member',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create domains table
CREATE TABLE IF NOT EXISTS domains (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) UNIQUE NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create templates table
CREATE TABLE IF NOT EXISTS templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  domain_id UUID NOT NULL REFERENCES domains(id) ON DELETE CASCADE,
  created_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create saved_templates table for user favorites
CREATE TABLE IF NOT EXISTS saved_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  template_id UUID NOT NULL REFERENCES templates(id) ON DELETE CASCADE,
  saved_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, template_id)
);

-- Create saved_messages table for user's generated messages
CREATE TABLE IF NOT EXISTS saved_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  message_text TEXT NOT NULL,
  template_id UUID REFERENCES templates(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE domains ENABLE ROW LEVEL SECURITY;
ALTER TABLE templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_messages ENABLE ROW LEVEL SECURITY;

-- RLS Policies for users table
CREATE POLICY "Users can read their own profile" ON users FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON users FOR UPDATE
  USING (auth.uid() = id);

-- RLS Policies for domains table (readable by all authenticated users)
CREATE POLICY "Domains readable by authenticated users" ON domains FOR SELECT
  USING (auth.role() = 'authenticated');

-- RLS Policies for templates table
CREATE POLICY "Templates readable by authenticated users" ON templates FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Users can create templates" ON templates FOR INSERT
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update their own templates" ON templates FOR UPDATE
  USING (auth.uid() = created_by);

CREATE POLICY "Users can delete their own templates" ON templates FOR DELETE
  USING (auth.uid() = created_by);

-- RLS Policies for saved_templates table
CREATE POLICY "Users can manage their saved templates" ON saved_templates FOR ALL
  USING (auth.uid() = user_id);

-- RLS Policies for saved_messages table
CREATE POLICY "Users can manage their saved messages" ON saved_messages FOR ALL
  USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX idx_templates_domain_id ON templates(domain_id);
CREATE INDEX idx_templates_created_by ON templates(created_by);
CREATE INDEX idx_saved_templates_user_id ON saved_templates(user_id);
CREATE INDEX idx_saved_messages_user_id ON saved_messages(user_id);
