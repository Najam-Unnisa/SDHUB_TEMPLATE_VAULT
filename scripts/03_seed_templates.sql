-- Insert sample templates for Management domain
INSERT INTO templates (name, content, domain_id, created_by) 
SELECT 
  'Strategic Update',
  'Subject: Strategic Initiative Update

Dear Team,

This message provides an update on our strategic initiatives and upcoming milestones...',
  d.id,
  (SELECT id FROM users LIMIT 1)
FROM domains d WHERE d.name = 'Management'
ON CONFLICT DO NOTHING;

INSERT INTO templates (name, content, domain_id, created_by) 
SELECT 
  'Weekly Status Summary',
  'This week''s achievements:
- Project milestone completed
- Team performance on track
- Resource allocation optimized

Next week priorities:
- Continue momentum
- Address pending items
- Prepare for review meeting',
  d.id,
  (SELECT id FROM users LIMIT 1)
FROM domains d WHERE d.name = 'Management'
ON CONFLICT DO NOTHING;

INSERT INTO templates (name, content, domain_id, created_by) 
SELECT 
  'Project Progress Update',
  'Project Status: On Track
Completion: 65%

Completed items:
- Phase 1 delivered
- Team aligned

Upcoming:
- Phase 2 initiation
- Stakeholder review',
  d.id,
  (SELECT id FROM users LIMIT 1)
FROM domains d WHERE d.name = 'Management'
ON CONFLICT DO NOTHING;
