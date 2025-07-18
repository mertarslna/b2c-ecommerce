-- Insert sample data for testing

-- Insert sample users
INSERT INTO users (id, email, password, first_name, last_name, phone) VALUES
('550e8400-e29b-41d4-a716-446655440000', 'admin@ecommerce.com', '$2b$10$hashedpassword', 'Admin', 'User', '+1234567890'),
('550e8400-e29b-41d4-a716-446655440001', 'john.doe@example.com', '$2b$10$hashedpassword', 'John', 'Doe', '+1234567891'),
('550e8400-e29b-41d4-a716-446655440002', 'jane.smith@example.com', '$2b$10$hashedpassword', 'Jane', 'Smith', '+1234567892'),
('550e8400-e29b-41d4-a716-446655440003', 'seller@example.com', '$2b$10$hashedpassword', 'Seller', 'Account', '+1234567893');

-- Insert admin
INSERT INTO admins (id, permissions, user_id) VALUES
('550e8400-e29b-41d4-a716-446655440010', ARRAY['manage_users', 'manage_products', 'manage_orders', 'view_analytics'], '550e8400-e29b-41d4-a716-446655440000');

-- Insert sample addresses
INSERT INTO addresses (id, user_id, title, first_name, last_name, company_name, address_line1, city, state, postal_code, country, phone, is_default, type) VALUES
('550e8400-e29b-41d4-a716-446655440020', '550e8400-e29b-41d4-a716-446655440001', 'Home', 'John', 'Doe', NULL, '123 Main St', 'New York', 'NY', '10001', 'USA', '+1234567891', true, 'home'),
('550e8400-e29b-41d4-a716-446655440021', '550e8400-e29b-41d4-a716-446655440002', 'Home', 'Jane', 'Smith', NULL, '456 Oak Ave', 'Los Angeles', 'CA', '90001', 'USA', '+1234567892', true, 'home'),
('550e8400-e29b-41d4-a716-446655440022', '550e8400-e29b-41d4-a716-446655440002', 'Work', 'Jane', 'Smith', 'Tech Corp', '789 Business Blvd', 'Los Angeles', 'CA', '90002', 'USA', '+1234567892', false, 'work');

-- Insert sample businesses
INSERT INTO businesses (id, business_name, tax_number, is_verified, address_id) VALUES
('550e8400-e29b-41d4-a716-446655440030', 'Tech Solutions Inc', 'TAX123456789', true, '550e8400-e29b-41d4-a716-446655440022');

-- Insert sample customers
INSERT INTO customers (id, user_id, wishlist, loyalty_points) VALUES
('550e8400-e29b-41d4-a716-446655440040', '550e8400-e29b-41d4-a716-446655440001', '[]', 100),
('550e8400-e29b-41d4-a716-446655440041', '550e8400-e29b-41d4-a716-446655440002', '[]', 250);

-- Insert sample categories
INSERT INTO categories (id, name, description, parent_id) VALUES
('550e8400-e29b-41d4-a716-446655440050', 'Electronics', 'Electronic devices and gadgets', NULL),
('550e8400-e29b-41d4-a716-446655440051', 'Smartphones', 'Mobile phones and accessories', '550e8400-e29b-41d4-a716-446655440050'),
('550e8400-e29b-41d4-a716-446655440052', 'Laptops', 'Laptop computers and accessories', '550e8400-e29b-41d4-a716-446655440050'),
('550e8400-e29b-41d4-a716-446655440053', 'Clothing', 'Apparel and fashion items', NULL),
('550e8400-e29b-41d4-a716-446655440054', 'Men''s Clothing', 'Men''s apparel', '550e8400-e29b-41d4-a716-446655440053'),
('550e8400-e29b-41d4-a716-446655440055', 'Women''s Clothing', 'Women''s apparel', '550e8400-e29b-41d4-a716-446655440053');

-- Insert sample products
INSERT INTO products (id, name, description, price, stock, images, seller_id, category_id, is_approved, rating) VALUES
('550e8400-e29b-41d4-a716-446655440060', 'iPhone 15 Pro', 'Latest iPhone with advanced features', 999.99, 50, ARRAY['https://example.com/iphone15pro.jpg'], '550e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440051', true, 4.5),
('550e8400-e29b-41d4-a716-446655440061', 'MacBook Pro 16"', 'High-performance laptop for professionals', 2499.99, 25, ARRAY['https://example.com/macbookpro.jpg'], '550e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440052', true, 4.8),
('550e8400-e29b-41d4-a716-446655440062', 'Premium T-Shirt', 'Comfortable cotton t-shirt', 29.99, 100, ARRAY['https://example.com/tshirt.jpg'], '550e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440054', true, 4.2);

-- Insert sample images
INSERT INTO images (id, product_id, url, alt, size, format, is_main, cloudinary_id) VALUES
('550e8400-e29b-41d4-a716-446655440070', '550e8400-e29b-41d4-a716-446655440060', 'https://example.com/iphone15pro_main.jpg', 'iPhone 15 Pro main image', 1024000, 'jpg', true, 'iphone15pro_main'),
('550e8400-e29b-41d4-a716-446655440071', '550e8400-e29b-41d4-a716-446655440060', 'https://example.com/iphone15pro_side.jpg', 'iPhone 15 Pro side view', 812000, 'jpg', false, 'iphone15pro_side'),
('550e8400-e29b-41d4-a716-446655440072', '550e8400-e29b-41d4-a716-446655440061', 'https://example.com/macbookpro_main.jpg', 'MacBook Pro main image', 1536000, 'jpg', true, 'macbookpro_main');

-- Insert sample carts
INSERT INTO carts (id, customer_id, total_amount) VALUES
('550e8400-e29b-41d4-a716-446655440080', '550e8400-e29b-41d4-a716-446655440040', 1029.98),
('550e8400-e29b-41d4-a716-446655440081', '550e8400-e29b-41d4-a716-446655440041', 0.00);

-- Insert sample cart items
INSERT INTO cart_items (id, cart_id, product_id, quantity, unit_price) VALUES
('550e8400-e29b-41d4-a716-446655440090', '550e8400-e29b-41d4-a716-446655440080', '550e8400-e29b-41d4-a716-446655440060', 1, 999.99),
('550e8400-e29b-41d4-a716-446655440091', '550e8400-e29b-41d4-a716-446655440080', '550e8400-e29b-41d4-a716-446655440062', 1, 29.99);

-- Insert sample orders
INSERT INTO orders (id, customer_id, total_amount, status, shipping_address_id, billing_address_id) VALUES
('550e8400-e29b-41d4-a716-446655440100', '550e8400-e29b-41d4-a716-446655440041', 2499.99, 'delivered', '550e8400-e29b-41d4-a716-446655440021', '550e8400-e29b-41d4-a716-446655440021');

-- Insert sample order items
INSERT INTO order_items (id, order_id, product_id, quantity, unit_price, total_price) VALUES
('550e8400-e29b-41d4-a716-446655440110', '550e8400-e29b-41d4-a716-446655440100', '550e8400-e29b-41d4-a716-446655440061', 1, 2499.99, 2499.99);

-- Insert sample payments
INSERT INTO payments (id, order_id, amount, method, status, transaction_id) VALUES
('550e8400-e29b-41d4-a716-446655440120', '550e8400-e29b-41d4-a716-446655440100', 2499.99, 'stripe', 'completed', 'txn_1234567890');

-- Insert sample reviews
INSERT INTO reviews (id, product_id, customer_id, order_id, rating, title, comment, pros, cons, is_verified, is_approved, helpful_count) VALUES
('550e8400-e29b-41d4-a716-446655440130', '550e8400-e29b-41d4-a716-446655440061', '550e8400-e29b-41d4-a716-446655440041', '550e8400-e29b-41d4-a716-446655440100', 5, 'Excellent laptop!', 'Amazing performance and build quality. Perfect for professional work.', ARRAY['Fast performance', 'Great display', 'Excellent build quality'], ARRAY['Expensive', 'Heavy'], true, true, 15);