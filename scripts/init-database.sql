-- Create programs table
CREATE TABLE IF NOT EXISTS programs (
  id BIGSERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  video_url TEXT,
  thumbnail_url TEXT,
  duration TEXT,
  views INTEGER DEFAULT 0,
  "order" INTEGER DEFAULT 1,
  status TEXT DEFAULT 'draft' CHECK (status IN ('published', 'draft', 'archived')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create tags table
CREATE TABLE IF NOT EXISTS tags (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  color TEXT DEFAULT '#50bf9e',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create program_tags table (many-to-many relationship)
CREATE TABLE IF NOT EXISTS program_tags (
  id BIGSERIAL PRIMARY KEY,
  program_id BIGINT NOT NULL REFERENCES programs(id) ON DELETE CASCADE,
  tag_id BIGINT NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
  UNIQUE(program_id, tag_id)
);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers to automatically update updated_at
DROP TRIGGER IF EXISTS update_programs_updated_at ON programs;
CREATE TRIGGER update_programs_updated_at
BEFORE UPDATE ON programs
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_tags_updated_at ON tags;
CREATE TRIGGER update_tags_updated_at
BEFORE UPDATE ON tags
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Insert some initial tags
INSERT INTO tags (name, description, color)
VALUES 
  ('احکام شرعی', 'مسائل و احکام شرعی اسلام', '#10b981'),
  ('فقه', 'مباحث فقهی و استنباط احکام', '#3b82f6'),
  ('عزاداری', 'مراسم و احکام عزاداری اهل بیت', '#ef4444'),
  ('اهل بیت', 'سیره و تعالیم اهل بیت علیهم السلام', '#8b5cf6'),
  ('حقوق خانواده', 'احکام و حقوق مربوط به خانواده', '#f59e0b'),
  ('زن و مرد', 'احکام مربوط به زن و مرد', '#ec4899'),
  ('مباحث اجتماعی', 'موضوعات اجتماعی از دیدگاه اسلام', '#06b6d4'),
  ('تاریخ اسلام', 'تاریخ و وقایع اسلامی', '#84cc16'),
  ('روانشناسی اسلامی', 'مباحث روانشناسی از منظر اسلام', '#f97316'),
  ('اخلاق اسلامی', 'اصول و مبانی اخلاق در اسلام', '#a855f7')
ON CONFLICT (name) DO NOTHING;

-- Insert some initial programs
INSERT INTO programs (title, description, thumbnail_url, duration, views, "order", status)
VALUES 
  ('احکام شرعی - عزاداری اهل بیت', 'پاسخ به سوالات شرعی در مورد عزاداری اهل بیت (علیهم السلام)', '/images/ahkam-sharei.png', '55:20', 1250, 1, 'published'),
  ('تفاوت‌های حقوقی زن و مرد', 'بررسی تفاوت‌های حقوقی زن و مرد از دیدگاه اسلام', '/images/tafavot-hoghoghi.png', '45:15', 980, 2, 'published'),
  ('هدف از آزادی', 'بررسی مفهوم آزادی و هدف از آن در اسلام', '/images/hadaf-az-azadi.png', '60:00', 750, 3, 'published'),
  ('احکام شرعی - مسائل فقهی', 'پاسخ به سوالات شرعی و مسائل فقهی', '/images/ahkam-sharei-2.png', '50:30', 650, 4, 'published'),
  ('نگاهی به خطبه حضرت زینب در کوفه', 'بررسی خطبه تاریخی حضرت زینب (س) در کوفه', '/images/khotbe-zeinab.png', '48:25', 890, 5, 'published'),
  ('وسواس (علل و درمان)', 'بررسی علل و درمان وسواس از دیدگاه اسلام', '/images/vasvas.png', '52:15', 720, 6, 'draft')
ON CONFLICT DO NOTHING;

-- Connect programs with tags
INSERT INTO program_tags (program_id, tag_id)
SELECT p.id, t.id FROM programs p, tags t
WHERE p.title = 'احکام شرعی - عزاداری اهل بیت' AND t.name = 'احکام شرعی'
ON CONFLICT DO NOTHING;

INSERT INTO program_tags (program_id, tag_id)
SELECT p.id, t.id FROM programs p, tags t
WHERE p.title = 'احکام شرعی - عزاداری اهل بیت' AND t.name = 'عزاداری'
ON CONFLICT DO NOTHING;

INSERT INTO program_tags (program_id, tag_id)
SELECT p.id, t.id FROM programs p, tags t
WHERE p.title = 'تفاوت‌های حقوقی زن و مرد' AND t.name = 'حقوق خانواده'
ON CONFLICT DO NOTHING;

INSERT INTO program_tags (program_id, tag_id)
SELECT p.id, t.id FROM programs p, tags t
WHERE p.title = 'تفاوت‌های حقوقی زن و مرد' AND t.name = 'زن و مرد'
ON CONFLICT DO NOTHING;

INSERT INTO program_tags (program_id, tag_id)
SELECT p.id, t.id FROM programs p, tags t
WHERE p.title = 'هدف از آزادی' AND t.name = 'مباحث اجتماعی'
ON CONFLICT DO NOTHING;

INSERT INTO program_tags (program_id, tag_id)
SELECT p.id, t.id FROM programs p, tags t
WHERE p.title = 'احکام شرعی - مسائل فقهی' AND t.name = 'احکام شرعی'
ON CONFLICT DO NOTHING;

INSERT INTO program_tags (program_id, tag_id)
SELECT p.id, t.id FROM programs p, tags t
WHERE p.title = 'احکام شرعی - مسائل فقهی' AND t.name = 'فقه'
ON CONFLICT DO NOTHING;

INSERT INTO program_tags (program_id, tag_id)
SELECT p.id, t.id FROM programs p, tags t
WHERE p.title = 'نگاهی به خطبه حضرت زینب در کوفه' AND t.name = 'تاریخ اسلام'
ON CONFLICT DO NOTHING;

INSERT INTO program_tags (program_id, tag_id)
SELECT p.id, t.id FROM programs p, tags t
WHERE p.title = 'نگاهی به خطبه حضرت زینب در کوفه' AND t.name = 'اهل بیت'
ON CONFLICT DO NOTHING;

INSERT INTO program_tags (program_id, tag_id)
SELECT p.id, t.id FROM programs p, tags t
WHERE p.title = 'وسواس (علل و درمان)' AND t.name = 'روانشناسی اسلامی'
ON CONFLICT DO NOTHING;
