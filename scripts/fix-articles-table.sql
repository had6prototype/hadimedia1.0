-- Add missing columns to articles table
ALTER TABLE articles ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT FALSE;
ALTER TABLE articles ADD COLUMN IF NOT EXISTS tags TEXT;
ALTER TABLE articles ADD COLUMN IF NOT EXISTS author VARCHAR(255) DEFAULT 'مدیر سایت';

-- Update existing records to have default values
UPDATE articles SET is_featured = FALSE WHERE is_featured IS NULL;
UPDATE articles SET tags = '' WHERE tags IS NULL;
UPDATE articles SET author = 'مدیر سایت' WHERE author IS NULL;

-- Create function to increment article views if it doesn't exist
CREATE OR REPLACE FUNCTION increment_article_views(article_id INTEGER)
RETURNS VOID AS $$
BEGIN
  UPDATE articles 
  SET views = views + 1 
  WHERE id = article_id;
END;
$$ LANGUAGE plpgsql;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_articles_status ON articles(status);
CREATE INDEX IF NOT EXISTS idx_articles_featured ON articles(is_featured);
CREATE INDEX IF NOT EXISTS idx_articles_created_at ON articles(created_at);
