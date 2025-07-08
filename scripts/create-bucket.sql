-- Simple bucket creation
INSERT INTO storage.buckets (id, name, public)
VALUES ('videos', 'videos', true)
ON CONFLICT (id) DO NOTHING;

-- Verify bucket was created
SELECT id, name, public FROM storage.buckets WHERE id = 'videos';
