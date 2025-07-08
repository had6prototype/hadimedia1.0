-- Create ahkam_cards table for managing Ayatollah Sistani's rulings cards
CREATE TABLE IF NOT EXISTS ahkam_cards (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  image_url VARCHAR(500),
  link_url VARCHAR(500),
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert sample data based on existing images
INSERT INTO ahkam_cards (title, description, image_url, link_url, display_order, is_active) VALUES
('احکام شرعی', 'احکام و مسائل شرعی آیت الله سیستانی', '/images/ahkam-sharei.png', '/ahkam/sharei', 1, true),
('تفاوت حقوقی', 'تفاوت‌های حقوقی در احکام اسلامی', '/images/tafavot-hoghoghi.png', '/ahkam/hoghoghi', 2, true),
('هدف از آزادی', 'هدف و مفهوم آزادی در اسلام', '/images/hadaf-az-azadi.png', '/ahkam/azadi', 3, true),
('احکام شرعی ۲', 'احکام شرعی تکمیلی', '/images/ahkam-sharei-2.png', '/ahkam/sharei-2', 4, true),
('خطبه زینب', 'خطبه حضرت زینب (س) و احکام مربوطه', '/images/khotbe-zeinab.png', '/ahkam/zeinab', 5, true),
('وسواس', 'احکام مربوط به وسواس و شک', '/images/vasvas.png', '/ahkam/vasvas', 6, true),
('حقوق خانواده', 'احکام حقوق خانواده در اسلام', '/images/hoghoogh-khanevade.png', '/ahkam/khanevade', 7, true),
('هدف امام حسین', 'هدف قیام امام حسین (ع) و احکام', '/images/hadaf-imam-hossein.png', '/ahkam/imam-hossein', 8, true);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_ahkam_cards_active_order ON ahkam_cards(is_active, display_order);
