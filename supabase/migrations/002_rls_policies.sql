ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE discount_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE shipping_zones ENABLE ROW LEVEL SECURITY;
ALTER TABLE cms_pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE newsletter_subscribers ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

CREATE POLICY "Users can read own profile" ON profiles FOR SELECT USING (id = auth.uid());
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (id = auth.uid());
CREATE POLICY "Service role can manage profiles" ON profiles FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Admins can manage all profiles" ON profiles FOR ALL USING (is_admin());

CREATE POLICY "Anyone can view active categories" ON categories FOR SELECT USING (is_active = TRUE);
CREATE POLICY "Admins can manage categories" ON categories FOR ALL USING (is_admin());

CREATE POLICY "Anyone can view active products" ON products FOR SELECT USING (is_active = TRUE);
CREATE POLICY "Admins can manage products" ON products FOR ALL USING (is_admin());

CREATE POLICY "Anyone can view variants of active products" ON product_variants
  FOR SELECT USING (
    is_active = TRUE AND
    EXISTS (SELECT 1 FROM products p WHERE p.id = product_id AND p.is_active = TRUE)
  );
CREATE POLICY "Admins can manage variants" ON product_variants FOR ALL USING (is_admin());

CREATE POLICY "Anyone can view approved reviews" ON product_reviews FOR SELECT USING (is_approved = TRUE);
CREATE POLICY "Users can insert own reviews" ON product_reviews FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update own reviews" ON product_reviews FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "Admins can manage reviews" ON product_reviews FOR ALL USING (is_admin());

CREATE POLICY "Users can manage own addresses" ON addresses FOR ALL USING (user_id = auth.uid());
CREATE POLICY "Admins can view all addresses" ON addresses FOR SELECT USING (is_admin());

CREATE POLICY "Users can view own orders" ON orders FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Service role can manage orders" ON orders FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Admins can manage all orders" ON orders FOR ALL USING (is_admin());

CREATE POLICY "Anyone can view active discount codes" ON discount_codes FOR SELECT USING (is_active = TRUE);
CREATE POLICY "Admins can manage discount codes" ON discount_codes FOR ALL USING (is_admin());

CREATE POLICY "Anyone can view shipping zones" ON shipping_zones FOR SELECT USING (is_active = TRUE);
CREATE POLICY "Admins can manage shipping zones" ON shipping_zones FOR ALL USING (is_admin());

CREATE POLICY "Anyone can view published pages" ON cms_pages FOR SELECT USING (is_published = TRUE);
CREATE POLICY "Admins can manage cms pages" ON cms_pages FOR ALL USING (is_admin());

CREATE POLICY "Anyone can subscribe" ON newsletter_subscribers FOR INSERT WITH CHECK (TRUE);
CREATE POLICY "Users can unsubscribe by email" ON newsletter_subscribers FOR UPDATE USING (TRUE);
CREATE POLICY "Admins can view all subscribers" ON newsletter_subscribers FOR SELECT USING (is_admin());

CREATE POLICY "Admins can view audit logs" ON audit_logs FOR SELECT USING (is_admin());
CREATE POLICY "Service role can insert audit logs" ON audit_logs FOR INSERT WITH CHECK (auth.role() = 'service_role');

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    'customer'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
