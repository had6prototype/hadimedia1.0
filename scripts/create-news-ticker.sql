-- Create news_ticker table
CREATE TABLE IF NOT EXISTS news_ticker (
  id SERIAL PRIMARY KEY,
  text TEXT NOT NULL,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert some default news ticker items
INSERT INTO news_ticker (text, display_order, is_active) VALUES
('احکام آیت الله سیستانی: نماز و روزه در سفر', 1, true),
('احکام آیت الله سیستانی: خمس و زکات', 2, true),
('احکام آیت الله سیستانی: معاملات و تجارت', 3, true),
('احکام آیت الله سیستانی: طهارت و وضو', 4, true),
('احکام آیت الله سیستانی: احکام خانواده', 5, true)
ON CONFLICT DO NOTHING;

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_news_ticker_active ON news_ticker(is_active);
CREATE INDEX IF NOT EXISTS idx_news_ticker_order ON news_ticker(display_order);
