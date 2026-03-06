INSERT INTO categories (id, name, slug, description, sort_order, is_active) VALUES
  ('11111111-0000-0000-0000-000000000001', 'Clothing', 'clothing', 'Quality clothing for all occasions', 1, TRUE),
  ('11111111-0000-0000-0000-000000000002', 'Accessories', 'accessories', 'Premium accessories', 2, TRUE),
  ('11111111-0000-0000-0000-000000000003', 'Footwear', 'footwear', 'Shoes and boots', 3, TRUE),
  ('11111111-0000-0000-0000-000000000004', 'Homeware', 'homeware', 'Home and living essentials', 4, TRUE)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO products (id, name, slug, short_description, description, price_pence, compare_at_price_pence, sku, stock_quantity, vat_rate, is_active, is_featured, category_id, images) VALUES
  (
    '22222222-0000-0000-0000-000000000001',
    'Classic White Oxford Shirt',
    'classic-white-oxford-shirt',
    'Timeless Oxford shirt crafted from 100% premium cotton.',
    'A wardrobe essential crafted from 100% premium British cotton. Features a classic button-down collar, chest pocket, and tailored fit. Machine washable at 30°C. Made in Portugal.',
    4999,
    6999,
    'SHIRT-OXF-WHT',
    45,
    20,
    TRUE,
    TRUE,
    '11111111-0000-0000-0000-000000000001',
    ARRAY['https://images.unsplash.com/photo-1598033129183-c4f50c736f10?w=800']
  ),
  (
    '22222222-0000-0000-0000-000000000002',
    'Merino Wool Crew Neck Jumper',
    'merino-wool-crew-neck-jumper',
    'Soft and warm merino wool jumper, perfect for British winters.',
    'Crafted from 100% extra-fine merino wool sourced from New Zealand. Naturally temperature-regulating and machine washable. Available in a range of classic colours.',
    7999,
    NULL,
    'JUMP-MER-NVY',
    28,
    20,
    TRUE,
    TRUE,
    '11111111-0000-0000-0000-000000000001',
    ARRAY['https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=800']
  ),
  (
    '22222222-0000-0000-0000-000000000003',
    'Full-Grain Leather Belt',
    'full-grain-leather-belt',
    'Handcrafted full-grain leather belt with solid brass buckle.',
    'Made from full-grain English leather, this belt develops a beautiful patina over time. Features a solid brass buckle and is available in three widths.',
    3499,
    NULL,
    'BELT-LTH-TAN',
    60,
    20,
    TRUE,
    FALSE,
    '11111111-0000-0000-0000-000000000002',
    ARRAY['https://images.unsplash.com/photo-1624222247344-550fb60583dc?w=800']
  ),
  (
    '22222222-0000-0000-0000-000000000004',
    'Chelsea Leather Boots',
    'chelsea-leather-boots',
    'Classic Chelsea boots in full-grain calf leather.',
    'Handcrafted in Northampton, England using traditional Goodyear welt construction. Full-grain calf leather upper with elastic side panels. Resoleable and designed to last a lifetime.',
    19999,
    24999,
    'BOOT-CHEL-BRN',
    15,
    20,
    TRUE,
    TRUE,
    '11111111-0000-0000-0000-000000000003',
    ARRAY['https://images.unsplash.com/photo-1638247025967-b4e38f787b76?w=800']
  ),
  (
    '22222222-0000-0000-0000-000000000005',
    'Organic Cotton Tote Bag',
    'organic-cotton-tote-bag',
    'Sturdy tote bag made from 100% organic GOTS-certified cotton.',
    'Made from 100% organic GOTS-certified cotton. Natural, undyed fabric — better for you and the planet. Strong enough for your weekly shop.',
    1499,
    NULL,
    'TOTE-ORG-NAT',
    120,
    20,
    TRUE,
    FALSE,
    '11111111-0000-0000-0000-000000000002',
    ARRAY['https://images.unsplash.com/photo-1544816155-12df9643f363?w=800']
  ),
  (
    '22222222-0000-0000-0000-000000000006',
    'Scented Soy Candle — English Garden',
    'scented-soy-candle-english-garden',
    'Hand-poured soy wax candle with English garden fragrance. 40-hour burn time.',
    'Hand-poured in our Bristol workshop using 100% natural soy wax. Fragranced with essential oils evoking a classic English garden. Cotton wick, reusable glass jar, 40-hour burn time.',
    2499,
    NULL,
    'CNDL-SOY-ENG',
    75,
    20,
    TRUE,
    FALSE,
    '11111111-0000-0000-0000-000000000004',
    ARRAY['https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=800']
  )
ON CONFLICT (slug) DO NOTHING;

INSERT INTO cms_pages (slug, title, content, is_published) VALUES
  ('about', 'About Us', '<h2>Our Story</h2><p>We are a British brand committed to quality, sustainability, and timeless design. Founded in 2020, we source our materials responsibly and work with skilled artisans across the UK and Europe.</p><h2>Our Values</h2><ul><li>Quality over quantity</li><li>Sustainable sourcing</li><li>Transparent supply chain</li><li>Supporting British craftsmanship</li></ul>', TRUE),
  ('privacy-policy', 'Privacy Policy', '<h2>Privacy Policy</h2><p>This privacy policy sets out how we collect, use and protect any information that you give us when you use this website. We are committed to ensuring your privacy is protected in accordance with UK GDPR.</p><h3>What we collect</h3><p>We may collect your name, contact information, payment details, and browsing data to fulfil your orders and improve our services.</p><h3>Your rights</h3><p>Under UK GDPR, you have the right to access, rectify, erase and port your personal data. Contact us at privacy@mystore.co.uk to exercise these rights.</p>', TRUE),
  ('terms-of-service', 'Terms of Service', '<h2>Terms &amp; Conditions</h2><p>By placing an order with us, you agree to these terms and conditions. Please read them carefully before completing your purchase.</p><h3>Orders</h3><p>All orders are subject to acceptance and availability. Prices are inclusive of VAT at the applicable UK rate.</p><h3>Delivery</h3><p>We deliver to addresses within the United Kingdom only. Delivery times are estimates and we cannot guarantee exact delivery dates.</p>', TRUE),
  ('returns', 'Returns Policy', '<h2>Returns &amp; Refunds</h2><p>We offer a 30-day returns policy for all items in original condition. Items must be unworn, unwashed, and with all tags attached.</p><h3>How to return</h3><ol><li>Contact us at returns@mystore.co.uk within 30 days of delivery</li><li>We will send you a prepaid returns label</li><li>Package your items securely and drop off at your nearest collection point</li><li>Refunds are processed within 5 business days of receiving your return</li></ol>', TRUE),
  ('cookie-policy', 'Cookie Policy', '<h2>Cookie Policy</h2><p>We use cookies to improve your experience on our website. This policy explains what cookies we use and why.</p><h3>Essential cookies</h3><p>These cookies are required for the website to function and cannot be disabled.</p><h3>Analytics cookies</h3><p>These cookies help us understand how visitors use our website so we can improve it.</p><h3>Managing cookies</h3><p>You can control cookies through your browser settings. Disabling cookies may affect website functionality.</p>', TRUE)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO discount_codes (code, type, value, usage_limit, is_active) VALUES
  ('WELCOME10', 'percentage', 10, 1000, TRUE),
  ('FREESHIP', 'free_shipping', 0, NULL, TRUE),
  ('SAVE5', 'fixed_amount', 5, 500, TRUE)
ON CONFLICT (code) DO NOTHING;

INSERT INTO shipping_zones (name, zone_type, postcode_prefixes, rates, is_active) VALUES
  (
    'Mainland UK',
    'mainland_uk',
    ARRAY['ALL'],
    '[{"name":"Standard","price_pence":399,"days_min":3,"days_max":5},{"name":"Express","price_pence":699,"days_min":1,"days_max":2},{"name":"Free Standard","price_pence":0,"days_min":3,"days_max":5,"min_order_pence":5000}]',
    TRUE
  ),
  (
    'Northern Ireland',
    'northern_ireland',
    ARRAY['BT'],
    '[{"name":"Standard","price_pence":899,"days_min":3,"days_max":7}]',
    TRUE
  ),
  (
    'Highlands & Islands',
    'highlands_islands',
    ARRAY['HS','ZE','KW','IV','PH','AB','PA','KA'],
    '[{"name":"Standard","price_pence":899,"days_min":3,"days_max":7}]',
    TRUE
  )
ON CONFLICT DO NOTHING;
