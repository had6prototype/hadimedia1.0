-- Create ahkam_slider table
CREATE TABLE IF NOT EXISTS ahkam_slider (
  id BIGSERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  link_url TEXT,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create trigger to update updated_at
DROP TRIGGER IF EXISTS update_ahkam_slider_updated_at ON ahkam_slider;
CREATE TRIGGER update_ahkam_slider_updated_at
BEFORE UPDATE ON ahkam_slider
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Insert sample data
INSERT INTO ahkam_slider (title, description, image_url, link_url, display_order, is_active)
VALUES 
  ('احکام شرعی', 'مجموعه کاملی از احکام شرعی و فتاوای مراجع عظام', '/images/ahkam-sharei.png', '/programs/1', 1, true),
  ('تفاوت حقوقی', 'بررسی تفاوت‌های حقوقی در مسائل شرعی', '/images/tafavot-hoghoghi.png', '/programs/2', 2, true),
  ('هدف از آزادی', 'نگاهی به مفهوم آزادی در اسلام', '/images/hadaf-az-azadi.png', '/programs/3', 3, true),
  ('احکام شرعی ۲', 'ادامه بحث احکام شرعی', '/images/ahkam-sharei-2.png', '/programs/4', 4, true),
  ('خطبه زینب', 'تحلیل خطبه حضرت زینب (س)', '/images/khotbe-zeinab.png', '/programs/5', 5, true),
  ('وسواس', 'راه‌های مقابله با وسواس', '/images/vasvas.png', '/programs/6', 6, true),
  ('حقوق خانواده', 'حقوق و وظایف اعضای خانواده', '/images/hoghoogh-khanevade.png', '/programs/7', 7, true),
  ('هدف امام حسین', 'بررسی اهداف قیام امام حسین (ع)', '/images/hadaf-imam-hossein.png', '/programs/8', 8, true)
ON CONFLICT DO NOTHING;
