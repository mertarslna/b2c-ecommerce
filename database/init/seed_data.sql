-- Complete seed data for the e-commerce database with proper role management

-- Clear existing data in correct order
DELETE FROM shippings;
DELETE FROM payments;
DELETE FROM order_items;
DELETE FROM orders;
DELETE FROM reviews;
DELETE FROM cart_items;
DELETE FROM carts;
DELETE FROM images;
DELETE FROM products;
DELETE FROM categories;
DELETE FROM addresses;
DELETE FROM seller_profiles;
DELETE FROM customer_profiles;
DELETE FROM admin_profiles;
DELETE FROM users;

-- Insert users with specific roles
INSERT INTO users (id, email, password, first_name, last_name, phone, role, is_active, created_at, updated_at) VALUES
('550e8400-e29b-41d4-a716-446655440000', 'admin@ecommerce.com', '$2b$10$hashedpassword', 'Admin', 'User', '+1234567890', 'ADMIN', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('550e8400-e29b-41d4-a716-446655440001', 'john.doe@example.com', '$2b$10$hashedpassword', 'John', 'Doe', '+1234567891', 'CUSTOMER', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('550e8400-e29b-41d4-a716-446655440002', 'jane.smith@example.com', '$2b$10$hashedpassword', 'Jane', 'Smith', '+1234567892', 'CUSTOMER', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('550e8400-e29b-41d4-a716-446655440003', 'seller@example.com', '$2b$10$hashedpassword', 'Seller', 'Account', '+1234567893', 'SELLER', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- Insert admin profile
INSERT INTO admin_profiles (id, user_id, permissions, last_login) VALUES
('550e8400-e29b-41d4-a716-446655440010', '550e8400-e29b-41d4-a716-446655440000', ARRAY['manage_users', 'manage_products', 'manage_orders', 'view_analytics'], CURRENT_TIMESTAMP);

-- Insert customer profiles
INSERT INTO customer_profiles (id, user_id, wishlist, loyalty_points) VALUES
('550e8400-e29b-41d4-a716-446655440040', '550e8400-e29b-41d4-a716-446655440001', '[]', 100),
('550e8400-e29b-41d4-a716-446655440041', '550e8400-e29b-41d4-a716-446655440002', '[]', 250);

-- Insert seller profile
INSERT INTO seller_profiles (id, user_id, business_name, tax_number, is_verified, business_address) VALUES
('550e8400-e29b-41d4-a716-446655440030', '550e8400-e29b-41d4-a716-446655440003', 'Tech Solutions Inc', 'TAX123456789', true, '789 Business Blvd, Los Angeles, CA 90002, USA');

-- Insert addresses for all users
INSERT INTO addresses (id, user_id, title, first_name, last_name, company_name, address_line1, address_line2, city, state, postal_code, country, phone, is_default) VALUES
('550e8400-e29b-41d4-a716-446655440020', '550e8400-e29b-41d4-a716-446655440001', 'Home', 'John', 'Doe', NULL, '123 Main St', NULL, 'New York', 'NY', '10001', 'USA', '+1234567891', true),
('550e8400-e29b-41d4-a716-446655440021', '550e8400-e29b-41d4-a716-446655440002', 'Home', 'Jane', 'Smith', NULL, '456 Oak Ave', NULL, 'Los Angeles', 'CA', '90001', 'USA', '+1234567892', true),
('550e8400-e29b-41d4-a716-446655440022', '550e8400-e29b-41d4-a716-446655440002', 'Work', 'Jane', 'Smith', 'Tech Corp', '789 Business Blvd', NULL, 'Los Angeles', 'CA', '90002', 'USA', '+1234567892', false),
('550e8400-e29b-41d4-a716-446655440023', '550e8400-e29b-41d4-a716-446655440003', 'Business', 'Seller', 'Account', 'Tech Solutions Inc', '789 Business Blvd', NULL, 'Los Angeles', 'CA', '90002', 'USA', '+1234567893', true);

-- Insert categories
INSERT INTO categories (id, name, description, parent_id) VALUES
('550e8400-e29b-41d4-a716-446655440050', 'Electronics', 'Electronic devices and gadgets', NULL),
('550e8400-e29b-41d4-a716-446655440051', 'Smartphones', 'Mobile phones and accessories', '550e8400-e29b-41d4-a716-446655440050'),
('550e8400-e29b-41d4-a716-446655440052', 'Laptops', 'Laptop computers and accessories', '550e8400-e29b-41d4-a716-446655440050'),
('550e8400-e29b-41d4-a716-446655440053', 'Clothing', 'Apparel and fashion items', NULL),
('550e8400-e29b-41d4-a716-446655440054', 'Men''s Clothing', 'Men''s apparel', '550e8400-e29b-41d4-a716-446655440053'),
('550e8400-e29b-41d4-a716-446655440055', 'Women''s Clothing', 'Women''s apparel', '550e8400-e29b-41d4-a716-446655440053');

-- Insert products linked to seller profile
INSERT INTO products (id, name, description, price, stock, seller_id, category_id, is_approved, rating, created_at, updated_at) VALUES
('550e8400-e29b-41d4-a716-446655440060', 'iPhone 15 Pro', 'Latest iPhone with advanced features', 999.99, 50, '550e8400-e29b-41d4-a716-446655440030', '550e8400-e29b-41d4-a716-446655440051', true, 4.5, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('550e8400-e29b-41d4-a716-446655440061', 'MacBook Pro 16"', 'High-performance laptop for professionals', 2499.99, 25, '550e8400-e29b-41d4-a716-446655440030', '550e8400-e29b-41d4-a716-446655440052', true, 4.8, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('550e8400-e29b-41d4-a716-446655440062', 'Premium T-Shirt', 'Comfortable cotton t-shirt', 29.99, 100, '550e8400-e29b-41d4-a716-446655440030', '550e8400-e29b-41d4-a716-446655440054', true, 4.2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- Insert product images
INSERT INTO images (id, product_id, path, size, format, is_main, upload_date) VALUES
('550e8400-e29b-41d4-a716-446655440070', '550e8400-e29b-41d4-a716-446655440060', 'https://example.com/iphone15pro_main.jpg', 1024000, 'jpg', true, CURRENT_TIMESTAMP),
('550e8400-e29b-41d4-a716-446655440071', '550e8400-e29b-41d4-a716-446655440060', 'https://example.com/iphone15pro_side.jpg', 812000, 'jpg', false, CURRENT_TIMESTAMP),
('550e8400-e29b-41d4-a716-446655440072', '550e8400-e29b-41d4-a716-446655440061', 'https://example.com/macbookpro_main.jpg', 1536000, 'jpg', true, CURRENT_TIMESTAMP);

-- Insert shopping carts for customers
INSERT INTO carts (id, customer_id, total_amount, created_at, updated_at) VALUES
('550e8400-e29b-41d4-a716-446655440080', '550e8400-e29b-41d4-a716-446655440040', 1029.98, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('550e8400-e29b-41d4-a716-446655440081', '550e8400-e29b-41d4-a716-446655440041', 0.00, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- Insert cart items
INSERT INTO cart_items (id, cart_id, product_id, quantity, unit_price, created_at, updated_at) VALUES
('550e8400-e29b-41d4-a716-446655440090', '550e8400-e29b-41d4-a716-446655440080', '550e8400-e29b-41d4-a716-446655440060', 1, 999.99, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('550e8400-e29b-41d4-a716-446655440091', '550e8400-e29b-41d4-a716-446655440080', '550e8400-e29b-41d4-a716-446655440062', 1, 29.99, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- Insert sample order
INSERT INTO orders (id, customer_id, total_amount, status, order_date, shipping_address_id, billing_address_id, created_at) VALUES
('550e8400-e29b-41d4-a716-446655440100', '550e8400-e29b-41d4-a716-446655440041', 2499.99, 'DELIVERED', CURRENT_TIMESTAMP, '550e8400-e29b-41d4-a716-446655440021', '550e8400-e29b-41d4-a716-446655440021', CURRENT_TIMESTAMP);

-- Insert order items
INSERT INTO order_items (id, order_id, product_id, quantity, unit_price, total_price, delivered_at) VALUES
('550e8400-e29b-41d4-a716-446655440110', '550e8400-e29b-41d4-a716-446655440100', '550e8400-e29b-41d4-a716-446655440061', 1, 2499.99, 2499.99, CURRENT_TIMESTAMP);

-- Insert payment record
INSERT INTO payments (id, order_id, amount, method, status, transaction_id, payment_date, created_at, updated_at) VALUES
('550e8400-e29b-41d4-a716-446655440120', '550e8400-e29b-41d4-a716-446655440100', 2499.99, 'STRIPE', 'COMPLETED', 'txn_1234567890', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- Insert product review
INSERT INTO reviews (id, product_id, customer_id, order_id, rating, title, comment, pros, cons, is_verified, is_approved, helpful_count, review_date, created_at) VALUES
('550e8400-e29b-41d4-a716-446655440130', '550e8400-e29b-41d4-a716-446655440061', '550e8400-e29b-41d4-a716-446655440041', '550e8400-e29b-41d4-a716-446655440100', 5, 'Excellent laptop!', 'Amazing performance and build quality. Perfect for professional work.', ARRAY['Fast performance', 'Great display', 'Excellent build quality'], ARRAY['Expensive', 'Heavy'], true, true, 15, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- Insert shipping record
INSERT INTO shippings (id, order_id, customer_id, seller_id, shipping_address_id, tracking_number, carrier, shipping_date, estimated_delivery_date, actual_delivery_date, shipping_cost, status, last_status_update) VALUES
('550e8400-e29b-41d4-a716-446655440140', '550e8400-e29b-41d4-a716-446655440100', '550e8400-e29b-41d4-a716-446655440041', '550e8400-e29b-41d4-a716-446655440030', '550e8400-e29b-41d4-a716-446655440021', 'TRK123456789', 'FedEx', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP + INTERVAL '3 days', CURRENT_TIMESTAMP + INTERVAL '2 days', 15.50, 'DELIVERED', CURRENT_TIMESTAMP);

-- Verify the data
SELECT 'Users created:' AS info, COUNT(*) AS count FROM users
UNION ALL
SELECT 'Admin profiles:', COUNT(*) FROM admin_profiles
UNION ALL  
SELECT 'Customer profiles:', COUNT(*) FROM customer_profiles
UNION ALL
SELECT 'Seller profiles:', COUNT(*) FROM seller_profiles
UNION ALL
SELECT 'Products created:', COUNT(*) FROM products
UNION ALL
SELECT 'Orders created:', COUNT(*) FROM orders;