-- Add columns for different video types
ALTER TABLE programs 
ADD COLUMN video_type VARCHAR(20) DEFAULT 'upload' CHECK (video_type IN ('upload', 'link', 'youtube')),
ADD COLUMN youtube_id VARCHAR(50),
ADD COLUMN external_url TEXT;

-- Update existing records to have video_type = 'upload'
UPDATE programs SET video_type = 'upload' WHERE video_type IS NULL;
