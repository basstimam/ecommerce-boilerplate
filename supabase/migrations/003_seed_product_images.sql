UPDATE products
SET images = CASE (abs(hashtext(id::text)) % 8)
  WHEN 0 THEN ARRAY['https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80']
  WHEN 1 THEN ARRAY['https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80']
  WHEN 2 THEN ARRAY['https://images.unsplash.com/photo-1542291026616-b53d93c2f805?w=800&q=80']
  WHEN 3 THEN ARRAY['https://images.unsplash.com/photo-1585386959984-a4155224a1ad?w=800&q=80']
  WHEN 4 THEN ARRAY['https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=800&q=80']
  WHEN 5 THEN ARRAY['https://images.unsplash.com/photo-1491553895911-0055eca6402d?w=800&q=80']
  WHEN 6 THEN ARRAY['https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=800&q=80']
  WHEN 7 THEN ARRAY['https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=800&q=80']
END
WHERE images = '{}' OR images IS NULL;
