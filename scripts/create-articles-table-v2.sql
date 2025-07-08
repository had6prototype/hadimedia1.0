-- Create articles table with proper structure
CREATE TABLE IF NOT EXISTS articles (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  excerpt TEXT,
  thumbnail_url TEXT,
  status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  is_featured BOOLEAN DEFAULT FALSE,
  tags TEXT,
  views INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create function to increment article views
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

-- Insert sample articles
INSERT INTO articles (title, content, excerpt, status, is_featured, tags) VALUES
('مقاله نمونه اول', '<h2>عنوان اصلی</h2><p>این یک مقاله نمونه است که برای تست سیستم ایجاد شده است.</p><p>محتوای این مقاله شامل <strong>متن پررنگ</strong> و <em>متن کج</em> می‌باشد.</p>', 'این یک مقاله نمونه برای تست سیستم است', 'published', true, 'نمونه, تست'),
('راهنمای استفاده از ویرایشگر', '<h2>ویژگی‌های ویرایشگر</h2><p>ویرایشگر جدید دارای امکانات زیر است:</p><ul><li>قالب‌بندی متن</li><li>درج تصویر</li><li>درج ویدیو</li><li>ایجاد لینک</li></ul><h3>نحوه استفاده</h3><p>برای استفاده از ویرایشگر، از دکمه‌های موجود در نوار ابزار استفاده کنید.</p>', 'راهنمای کامل استفاده از ویرایشگر مقالات', 'published', false, 'راهنما, ویرایشگر'),
('مقاله پیش‌نویس', '<p>این مقاله هنوز در حالت پیش‌نویس است.</p>', 'مقاله‌ای که هنوز منتشر نشده', 'draft', false, 'پیش‌نویس');
