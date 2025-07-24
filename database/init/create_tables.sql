-- Fixed creates_table.sql for Trendyol Clone Database
-- This file creates all tables with proper relationships and constraints

-- Drop existing tables if they exist (in reverse dependency order)
DROP TABLE IF EXISTS shippings CASCADE;
DROP TABLE IF EXISTS payments CASCADE;
DROP TABLE IF EXISTS order_items CASCADE;
DROP TABLE IF EXISTS orders CASCADE;
DROP TABLE IF EXISTS reviews CASCADE;
DROP TABLE IF EXISTS cart_items CASCADE;
DROP TABLE IF EXISTS carts CASCADE;
DROP TABLE IF EXISTS images CASCADE;
DROP TABLE IF EXISTS products CASCADE;
DROP TABLE IF EXISTS categories CASCADE;
DROP TABLE IF EXISTS addresses CASCADE;
DROP TABLE IF EXISTS seller_profiles CASCADE;
DROP TABLE IF EXISTS customer_profiles CASCADE;
DROP TABLE IF EXISTS admin_profiles CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Drop existing ENUMs if they exist
DROP TYPE IF EXISTS "UserRole" CASCADE;
DROP TYPE IF EXISTS "OrderStatus" CASCADE;
DROP TYPE IF EXISTS "PaymentMethod" CASCADE;
DROP TYPE IF EXISTS "PaymentStatus" CASCADE;
DROP TYPE IF EXISTS "ShippingStatus" CASCADE;

-- Create ENUMs
CREATE TYPE "UserRole" AS ENUM ('ADMIN', 'CUSTOMER', 'SELLER');
CREATE TYPE "OrderStatus" AS ENUM ('PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED');
CREATE TYPE "PaymentMethod" AS ENUM ('CREDIT_CARD', 'DEBIT_CARD', 'PAYPAL', 'STRIPE', 'PAYTHOR');
CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED', 'REFUNDED');
CREATE TYPE "ShippingStatus" AS ENUM ('PENDING', 'SHIPPED', 'IN_TRANSIT', 'DELIVERED', 'DELIVERY_ATTEMPTED', 'CANCELED', 'RETURNED', 'LOST');

-- Create Users table (base table)
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "first_name" TEXT NOT NULL,
    "last_name" TEXT NOT NULL,
    "phone" TEXT,
    "role" "UserRole" NOT NULL DEFAULT 'CUSTOMER',
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "users_email_key" UNIQUE ("email")
);

-- Create Admin Profiles table
CREATE TABLE "admin_profiles" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "permissions" TEXT[] DEFAULT '{}',
    "last_login" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "admin_profiles_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "admin_profiles_user_id_key" UNIQUE ("user_id"),
    CONSTRAINT "admin_profiles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- Create Customer Profiles table
CREATE TABLE "customer_profiles" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "wishlist" JSONB NOT NULL DEFAULT '[]',
    "loyalty_points" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "customer_profiles_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "customer_profiles_user_id_key" UNIQUE ("user_id"),
    CONSTRAINT "customer_profiles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- Create Seller Profiles table
CREATE TABLE "seller_profiles" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "business_name" TEXT NOT NULL,
    "tax_number" TEXT,
    "is_verified" BOOLEAN NOT NULL DEFAULT false,
    "business_address" TEXT,

    CONSTRAINT "seller_profiles_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "seller_profiles_user_id_key" UNIQUE ("user_id"),
    CONSTRAINT "seller_profiles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- Create Addresses table
CREATE TABLE "addresses" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "first_name" TEXT NOT NULL,
    "last_name" TEXT NOT NULL,
    "company_name" TEXT,
    "address_line1" TEXT NOT NULL,
    "address_line2" TEXT,
    "city" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "postal_code" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "phone" TEXT,
    "is_default" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "addresses_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "addresses_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- Create Categories table
CREATE TABLE "categories" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "parent_id" TEXT,

    CONSTRAINT "categories_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "categories_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "categories"("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- Create Products table
CREATE TABLE "products" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "price" DECIMAL(10,2) NOT NULL,
    "stock" INTEGER NOT NULL DEFAULT 0,
    "seller_id" TEXT NOT NULL,
    "category_id" TEXT NOT NULL,
    "is_approved" BOOLEAN NOT NULL DEFAULT false,
    "rating" DECIMAL(3,2) DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "products_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "products_seller_id_fkey" FOREIGN KEY ("seller_id") REFERENCES "seller_profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "products_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- Create Images table
CREATE TABLE "images" (
    "id" TEXT NOT NULL,
    "product_id" TEXT NOT NULL,
    "path" TEXT NOT NULL,
    "size" INTEGER,
    "format" TEXT,
    "is_main" BOOLEAN NOT NULL DEFAULT false,
    "upload_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "images_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "images_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- Create Carts table
CREATE TABLE "carts" (
    "id" TEXT NOT NULL,
    "customer_id" TEXT NOT NULL,
    "total_amount" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "carts_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "carts_customer_id_key" UNIQUE ("customer_id"),
    CONSTRAINT "carts_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "customer_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- Create Cart Items table
CREATE TABLE "cart_items" (
    "id" TEXT NOT NULL,
    "cart_id" TEXT NOT NULL,
    "product_id" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "unit_price" DECIMAL(10,2) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "cart_items_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "cart_items_cart_id_fkey" FOREIGN KEY ("cart_id") REFERENCES "carts"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "cart_items_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- Create Orders table
CREATE TABLE "orders" (
    "id" TEXT NOT NULL,
    "customer_id" TEXT NOT NULL,
    "total_amount" DECIMAL(10,2) NOT NULL,
    "status" "OrderStatus" NOT NULL DEFAULT 'PENDING',
    "order_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "shipping_address_id" TEXT NOT NULL,
    "billing_address_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "orders_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "orders_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "customer_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "orders_shipping_address_id_fkey" FOREIGN KEY ("shipping_address_id") REFERENCES "addresses"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "orders_billing_address_id_fkey" FOREIGN KEY ("billing_address_id") REFERENCES "addresses"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- Create Order Items table
CREATE TABLE "order_items" (
    "id" TEXT NOT NULL,
    "order_id" TEXT NOT NULL,
    "product_id" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "unit_price" DECIMAL(10,2) NOT NULL,
    "total_price" DECIMAL(10,2) NOT NULL,
    "delivered_at" TIMESTAMP(3),

    CONSTRAINT "order_items_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "order_items_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "order_items_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- Create Payments table
CREATE TABLE "payments" (
    "id" TEXT NOT NULL,
    "order_id" TEXT NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "method" "PaymentMethod" NOT NULL,
    "status" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "transaction_id" TEXT,
    "payment_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "payments_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "payments_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- Create Reviews table
CREATE TABLE "reviews" (
    "id" TEXT NOT NULL,
    "product_id" TEXT NOT NULL,
    "customer_id" TEXT NOT NULL,
    "order_id" TEXT,
    "rating" INTEGER NOT NULL,
    "title" TEXT,
    "comment" TEXT,
    "pros" TEXT[] DEFAULT '{}',
    "cons" TEXT[] DEFAULT '{}',
    "is_verified" BOOLEAN NOT NULL DEFAULT false,
    "is_approved" BOOLEAN NOT NULL DEFAULT false,
    "helpful_count" INTEGER NOT NULL DEFAULT 0,
    "review_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "reviews_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "reviews_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "reviews_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "customer_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "reviews_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- Create Shippings table
CREATE TABLE "shippings" (
    "id" TEXT NOT NULL,
    "order_id" TEXT NOT NULL,
    "customer_id" TEXT NOT NULL,
    "seller_id" TEXT NOT NULL,
    "shipping_address_id" TEXT NOT NULL,
    "tracking_number" TEXT,
    "carrier" TEXT NOT NULL,
    "shipping_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "estimated_delivery_date" TIMESTAMP(3),
    "actual_delivery_date" TIMESTAMP(3),
    "shipping_cost" DECIMAL(10,2) NOT NULL,
    "status" "ShippingStatus" NOT NULL DEFAULT 'PENDING',
    "last_status_update" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "shippings_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "shippings_tracking_number_key" UNIQUE ("tracking_number"),
    CONSTRAINT "shippings_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "shippings_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "customer_profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "shippings_seller_id_fkey" FOREIGN KEY ("seller_id") REFERENCES "seller_profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "shippings_shipping_address_id_fkey" FOREIGN KEY ("shipping_address_id") REFERENCES "addresses"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- Create indexes for better performance
CREATE INDEX "users_role_idx" ON "users"("role");
CREATE INDEX "users_email_idx" ON "users"("email");
CREATE INDEX "products_seller_id_idx" ON "products"("seller_id");
CREATE INDEX "products_category_id_idx" ON "products"("category_id");
CREATE INDEX "products_is_approved_idx" ON "products"("is_approved");
CREATE INDEX "orders_customer_id_idx" ON "orders"("customer_id");
CREATE INDEX "orders_status_idx" ON "orders"("status");
CREATE INDEX "order_items_order_id_idx" ON "order_items"("order_id");
CREATE INDEX "reviews_product_id_idx" ON "reviews"("product_id");
CREATE INDEX "reviews_customer_id_idx" ON "reviews"("customer_id");
CREATE INDEX "shippings_status_idx" ON "shippings"("status");
CREATE INDEX "shippings_tracking_number_idx" ON "shippings"("tracking_number");

-- Add comments for documentation
COMMENT ON TABLE "users" IS 'Base user table with role-based access control';
COMMENT ON TABLE "admin_profiles" IS 'Admin-specific data and permissions';
COMMENT ON TABLE "customer_profiles" IS 'Customer-specific data including loyalty and wishlist';
COMMENT ON TABLE "seller_profiles" IS 'Business seller information and verification status';
COMMENT ON TABLE "addresses" IS 'User addresses for shipping and billing';
COMMENT ON TABLE "products" IS 'Product catalog managed by sellers';
COMMENT ON TABLE "orders" IS 'Customer orders with status tracking';
COMMENT ON TABLE "shippings" IS 'Shipping and delivery tracking information';

-- Success message
SELECT 'All tables created successfully with proper relationships and indexes!' as result;