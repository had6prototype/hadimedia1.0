-- Create function to safely increment article views
CREATE OR REPLACE FUNCTION increment_article_views(article_id INTEGER)
RETURNS VOID AS $$
BEGIN
    UPDATE articles 
    SET views = views + 1, 
        updated_at = NOW()
    WHERE id = article_id;
END;
$$ LANGUAGE plpgsql;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION increment_article_views(INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION increment_article_views(INTEGER) TO anon;
