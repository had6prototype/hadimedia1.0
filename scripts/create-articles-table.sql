-- Create articles table
CREATE TABLE IF NOT EXISTS articles (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  content TEXT NOT NULL,
  excerpt TEXT,
  thumbnail_url TEXT,
  author VARCHAR(100) DEFAULT 'مدیر سایت',
  status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  is_featured BOOLEAN DEFAULT FALSE,
  views INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_articles_status ON articles(status);
CREATE INDEX IF NOT EXISTS idx_articles_slug ON articles(slug);
CREATE INDEX IF NOT EXISTS idx_articles_featured ON articles(is_featured);

-- Insert some sample articles
INSERT INTO articles (title, slug, content, excerpt, status, is_featured) VALUES
('مقاله نمونه اول', 'sample-article-1', '<h2>عنوان مقاله</h2><p>این یک مقاله نمونه است که برای تست سیستم ایجاد شده است.</p><p>محتوای این مقاله شامل متن فارسی و قالب‌بندی HTML است.</p>', 'این یک مقاله نمونه برای تست سیستم است', 'published', true),
('مقاله نمونه دوم', 'sample-article-2', '<h2>مقاله دوم</h2><p>این مقاله دوم برای تست سیستم است.</p><ul><li>نکته اول</li><li>نکته دوم</li><li>نکته سوم</li></ul>', 'مقاله دوم برای تست', 'published', false),
('مقاله پیش‌نویس', 'draft-article', '<p>این مقاله هنوز در حالت پیش‌نویس است.</p>', 'مقاله پیش‌نویس', 'draft', false);
