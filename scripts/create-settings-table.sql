-- Create site_settings table
CREATE TABLE IF NOT EXISTS site_settings (
  id BIGSERIAL PRIMARY KEY,
  setting_key TEXT NOT NULL UNIQUE,
  setting_value TEXT,
  setting_type TEXT DEFAULT 'text' CHECK (setting_type IN ('text', 'email', 'url', 'phone', 'textarea')),
  display_name TEXT NOT NULL,
  category TEXT DEFAULT 'general',
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create trigger to update updated_at
DROP TRIGGER IF EXISTS update_site_settings_updated_at ON site_settings;
CREATE TRIGGER update_site_settings_updated_at
BEFORE UPDATE ON site_settings
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Insert default settings
INSERT INTO site_settings (setting_key, setting_value, setting_type, display_name, category, display_order)
VALUES 
  -- Contact Information
  ('contact_email', 'info@alhadi.co.uk', 'email', 'ایمیل تماس', 'contact', 1),
  ('contact_phone', '۰۲۱-۱۲۳۴۵۶۷۸', 'phone', 'شماره تماس', 'contact', 2),
  ('contact_address', 'لندن، انگلستان', 'text', 'آدرس', 'contact', 3),
  
  -- Social Media
  ('social_facebook', 'https://www.facebook.com/fd.haditv6/photos_by', 'url', 'فیسبوک', 'social', 1),
  ('social_instagram', 'https://www.instagram.com/fd_haditv6', 'url', 'اینستاگرام', 'social', 2),
  ('social_website', 'https://www.alhadi.co.uk', 'url', 'وب‌سایت', 'social', 3),
  ('social_youtube', '', 'url', 'یوتیوب', 'social', 4),
  ('social_telegram', '', 'url', 'تلگرام', 'social', 5),
  
  -- Site Information
  ('site_title', 'رسانه الهادی - Al-Hadi Media', 'text', 'عنوان سایت', 'general', 1),
  ('site_description', 'ارائه دهنده محتوای اسلامی و آموزشی با هدف ترویج فرهنگ اسلامی و پاسخگویی به سوالات شرعی', 'textarea', 'توضیحات سایت', 'general', 2),
  ('newsletter_text', 'برای دریافت آخرین اخبار و برنامه‌ها در خبرنامه ما عضو شوید', 'textarea', 'متن خبرنامه', 'general', 3)
ON CONFLICT (setting_key) DO NOTHING;
