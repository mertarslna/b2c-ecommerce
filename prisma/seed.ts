import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  try {
    // Clear existing data in correct order (reverse of creation)
    console.log('🧹 Cleaning existing data...');
    await prisma.shipping.deleteMany();
    await prisma.payment.deleteMany();
    await prisma.orderItem.deleteMany();
    await prisma.order.deleteMany();
    await prisma.review.deleteMany();
    await prisma.cartItem.deleteMany();
    await prisma.cart.deleteMany();
    await prisma.image.deleteMany();
    await prisma.product.deleteMany();
    await prisma.category.deleteMany();
    await prisma.address.deleteMany();
    await prisma.sellerProfile.deleteMany();
    await prisma.customerProfile.deleteMany();
    await prisma.adminProfile.deleteMany();
    await prisma.user.deleteMany();

    // 1. Create Users with specific roles
    console.log('👥 Creating users...');
    await prisma.user.createMany({
      data: [
        {
          id: '550e8400-e29b-41d4-a716-446655440000',
          email: 'admin@ecommerce.com',
          password: '$2b$10$hashedpassword',
          first_name: 'Admin',
          last_name: 'User',
          phone: '+1234567890',
          role: 'ADMIN'
        },
        {
          id: '550e8400-e29b-41d4-a716-446655440001',
          email: 'john.doe@example.com',
          password: '$2b$10$hashedpassword',
          first_name: 'John',
          last_name: 'Doe',
          phone: '+1234567891',
          role: 'CUSTOMER'
        },
        {
          id: '550e8400-e29b-41d4-a716-446655440002',
          email: 'jane.smith@example.com',
          password: '$2b$10$hashedpassword',
          first_name: 'Jane',
          last_name: 'Smith',
          phone: '+1234567892',
          role: 'CUSTOMER'
        },
        {
          id: '550e8400-e29b-41d4-a716-446655440003',
          email: 'seller@example.com',
          password: '$2b$10$hashedpassword',
          first_name: 'Seller',
          last_name: 'Account',
          phone: '+1234567893',
          role: 'SELLER'
        },
        { 
          id: '550e8400-e29b-41d4-a716-446655440004', 
          email: 'seller2@example.com', 
          password: '$2b$10$hashedpassword', 
          first_name: 'Seller', 
          last_name: 'Account2', 
          phone: '+1234567894',
          role: 'SELLER'
        },
        // ✅ Test user for cart testing
        {
          id: 'user-1',
          email: 'test@example.com',
          password: '$2b$10$hashedpassword',
          first_name: 'Test',
          last_name: 'User',
          phone: '+1234567899',
          role: 'CUSTOMER'
        }
      ],
      skipDuplicates: true,
    });

    // 2. Create role-specific profiles
    console.log('🔐 Creating admin profile...');
    await prisma.adminProfile.create({
      data: {
        id: '550e8400-e29b-41d4-a716-446655440010',
        user_id: '550e8400-e29b-41d4-a716-446655440000',
        permissions: ['manage_users', 'manage_products', 'manage_orders', 'view_analytics'],
        last_login: new Date(),
      },
    });

    console.log('🛒 Creating customer profiles...');
    await prisma.customerProfile.createMany({
      data: [
        {
          id: '550e8400-e29b-41d4-a716-446655440040',
          user_id: '550e8400-e29b-41d4-a716-446655440001',
          wishlist: [],
          loyalty_points: 100
        },
        {
          id: '550e8400-e29b-41d4-a716-446655440041',
          user_id: '550e8400-e29b-41d4-a716-446655440002',
          wishlist: [],
          loyalty_points: 250
        },
        // ✅ Test customer profile for cart testing
        {
          id: 'customer-1',
          user_id: 'user-1',
          wishlist: [],
          loyalty_points: 0
        }
      ],
      skipDuplicates: true,
    });

    console.log('🏪 Creating seller profiles...');
    await prisma.sellerProfile.createMany({
      data: [
        {
          id: '550e8400-e29b-41d4-a716-446655440030',
          user_id: '550e8400-e29b-41d4-a716-446655440003',
          business_name: 'Tech Solutions Inc',
          tax_number: 'TAX123456789',
          is_verified: true,
          business_address: '789 Business Blvd, Los Angeles, CA 90002, USA'
        },
        {
          id: '550e8400-e29b-41d4-a716-446655440031',
          user_id: '550e8400-e29b-41d4-a716-446655440004',
          business_name: 'Techno Market Inc',
          tax_number: 'TAX987654321',
          is_verified: true,
          business_address: '987 Business Blvd, Los Santos, CA 90007, USA'
        },
      ],
      skipDuplicates: true,
    });

    // 3. Create addresses for users
    console.log('📍 Creating addresses...');
    await prisma.address.createMany({
      data: [
        {
          id: '550e8400-e29b-41d4-a716-446655440020',
          user_id: '550e8400-e29b-41d4-a716-446655440001', // John Doe
          title: 'Home',
          first_name: 'John',
          last_name: 'Doe',
          address_line1: '123 Main St',
          city: 'New York',
          state: 'NY',
          postal_code: '10001',
          country: 'USA',
          phone: '+1234567891',
          is_default: true,
        },
        {
          id: '550e8400-e29b-41d4-a716-446655440021',
          user_id: '550e8400-e29b-41d4-a716-446655440002', // Jane Smith
          title: 'Home',
          first_name: 'Jane',
          last_name: 'Smith',
          address_line1: '456 Oak Ave',
          city: 'Los Angeles',
          state: 'CA',
          postal_code: '90001',
          country: 'USA',
          phone: '+1234567892',
          is_default: true,
        },
        {
          id: '550e8400-e29b-41d4-a716-446655440022',
          user_id: '550e8400-e29b-41d4-a716-446655440002', // Jane Smith work address
          title: 'Work',
          first_name: 'Jane',
          last_name: 'Smith',
          company_name: 'Tech Corp',
          address_line1: '789 Business Blvd',
          city: 'Los Angeles',
          state: 'CA',
          postal_code: '90002',
          country: 'USA',
          phone: '+1234567892',
          is_default: false,
        },
        {
          id: '550e8400-e29b-41d4-a716-446655440023',
          user_id: '550e8400-e29b-41d4-a716-446655440003', // Seller address
          title: 'Business',
          first_name: 'Seller',
          last_name: 'Account',
          company_name: 'Tech Solutions Inc',
          address_line1: '789 Business Blvd',
          city: 'Los Angeles',
          state: 'CA',
          postal_code: '90002',
          country: 'USA',
          phone: '+1234567893',
          is_default: true,
        },
        // ✅ Test user address
        {
          id: 'address-1',
          user_id: 'user-1',
          title: 'Home',
          first_name: 'Test',
          last_name: 'User',
          address_line1: '123 Test St',
          city: 'Test City',
          state: 'TS',
          postal_code: '12345',
          country: 'USA',
          phone: '+1234567899',
          is_default: true,
        },
      ],
      skipDuplicates: true,
    });

    // 4. Create categories
    console.log('📂 Creating categories...');
    await prisma.category.createMany({
      data: [
        {
          id: "a1b2c3d4-e5f6-7890-1234-567890abcdef",
          name: "Electronics",
          description: "Electronic devices and gadgets for all your needs"
        },
        {
          id: "b2c3d4e5-f6a7-8901-2345-67890abcdef0",
          name: "Smartphones",
          description: "Latest mobile phones and accessories",
          parent_id: "a1b2c3d4-e5f6-7890-1234-567890abcdef"
        },
        {
          id: "c3d4e5f6-a7b8-9012-3456-7890abcdef01",
          name: "Laptops",
          description: "Portable computers and essential accessories",
          parent_id: "a1b2c3d4-e5f6-7890-1234-567890abcdef"
        },
        {
          id: "d4e5f6a7-b8c9-0123-4567-890abcdef012",
          name: "Tablets",
          description: "Versatile tablets for work and entertainment",
          parent_id: "a1b2c3d4-e5f6-7890-1234-567890abcdef"
        },
        {
          id: "e5f6a7b8-c9d0-1234-5678-90abcdef0123",
          name: "Televisions & Audio",
          description: "TVs, sound systems, and home entertainment",
          parent_id: "a1b2c3d4-e5f6-7890-1234-567890abcdef"
        },
        {
          id: "f6a7b8c9-d0e1-2345-6789-0abcdef01234",
          name: "Home & Living",
          description: "Everything for your home and daily life"
        },
        {
          id: "a7b8c9d0-e1f2-3456-7890-abcdef012345",
          name: "Furniture",
          description: "Stylish and functional furniture for every room",
          parent_id: "f6a7b8c9-d0e1-2345-6789-0abcdef01234"
        },
        {
          id: "b8c9d0e1-f2a3-4567-8901-bcdef0123456",
          name: "Kitchenware",
          description: "Cooking tools, dinnerware, and kitchen essentials",
          parent_id: "f6a7b8c9-d0e1-2345-6789-0abcdef01234"
        },
        {
          id: "c9d0e1f2-a3b4-5678-9012-cdef01234567",
          name: "Apparel & Fashion",
          description: "Trendy clothing and accessories for all ages"
        },
        {
          id: "d0e1f2a3-b4c5-6789-0123-def012345678",
          name: "Women's Apparel",
          description: "Fashionable clothing for women",
          parent_id: "c9d0e1f2-a3b4-5678-9012-cdef01234567"
        },
        {
          id: "e1f2a3b4-c5d6-7890-1234-ef0123456789",
          name: "Men's Apparel",
          description: "Stylish clothing for men",
          parent_id: "c9d0e1f2-a3b4-5678-9012-cdef01234567"
        },
        {
          id: "f2a3b4c5-d6e7-8901-2345-f0123456789a",
          name: "Kids' & Baby Apparel",
          description: "Cute and comfortable clothing for kids and babies",
          parent_id: "c9d0e1f2-a3b4-5678-9012-cdef01234567"
        },
        {
          id: "a3b4c5d6-e7f8-9012-3456-0123456789ab",
          name: "Health & Beauty",
          description: "Products for personal care and well-being"
        },
        {
          id: "b4c5d6e7-f8a9-0123-4567-123456789abc",
          name: "Skincare",
          description: "Products for healthy and radiant skin",
          parent_id: "a3b4c5d6-e7f8-9012-3456-0123456789ab"
        },
        {
          id: "c5d6e7f8-a9b0-1234-5678-23456789abcd",
          name: "Makeup",
          description: "Cosmetics for enhancing your beauty",
          parent_id: "a3b4c5d6-e7f8-9012-3456-0123456789ab"
        },
        {
          id: "d6e7f8a9-b0c1-2345-6789-3456789abcde",
          name: "Sports & Outdoors",
          description: "Gear and apparel for an active lifestyle"
        },
        {
          id: "e7f8a9b0-c1d2-3456-7890-456789abcdef",
          name: "Fitness Equipment",
          description: "Equipment for home and gym workouts",
          parent_id: "d6e7f8a9-b0c1-2345-6789-3456789abcde"
        },
        {
          id: "f8a9b0c1-d2e3-4567-8901-56789abcdef0",
          name: "Outdoor Gear",
          description: "Camping, hiking, and outdoor adventure essentials",
          parent_id: "d6e7f8a9-b0c1-2345-6789-3456789abcde"
        }
      ],
      skipDuplicates: true,
    });

    // 5. Create products linked to seller profile
    console.log('📦 Creating products...');
    await prisma.product.createMany({
      data: [
        {
          id: '550e8400-e29b-41d4-a716-446655440060',
          name: 'iPhone 15 Pro',
          description: 'Latest iPhone with advanced features and A17 Pro chip',
          price: 999.99,
          stock: 50,
          seller_id: '550e8400-e29b-41d4-a716-446655440030',
          category_id: 'b2c3d4e5-f6a7-8901-2345-67890abcdef0',
          is_approved: true,
          rating: 4.5
        },
        {
          id: '550e8400-e29b-41d4-a716-446655440063',
          name: 'Samsung Galaxy S24 Ultra',
          description: 'Flagship Android phone with powerful performance and S Pen',
          price: 1099.99,
          stock: 45,
          seller_id: '550e8400-e29b-41d4-a716-446655440030',
          category_id: 'b2c3d4e5-f6a7-8901-2345-67890abcdef0',
          is_approved: true,
          rating: 4.6
        },
        {
          id: '550e8400-e29b-41d4-a716-446655440061',
          name: 'MacBook Pro 16',
          description: 'High-performance laptop for professionals with M3 chip',
          price: 2499.99,
          stock: 25,
          seller_id: '550e8400-e29b-41d4-a716-446655440030',
          category_id: 'c3d4e5f6-a7b8-9012-3456-7890abcdef01',
          is_approved: true,
          rating: 4.8
        },
        {
          id: '550e8400-e29b-41d4-a716-446655440064',
          name: 'Dell XPS 13',
          description: 'Compact and powerful ultrabook for daily use',
          price: 1399.99,
          stock: 30,
          seller_id: '550e8400-e29b-41d4-a716-446655440030',
          category_id: 'c3d4e5f6-a7b8-9012-3456-7890abcdef01',
          is_approved: true,
          rating: 4.4
        },
        {
          id: '550e8400-e29b-41d4-a716-446655440062',
          name: 'Premium T-Shirt',
          description: 'Comfortable premium cotton t-shirt',
          price: 29.99,
          stock: 100,
          seller_id: '550e8400-e29b-41d4-a716-446655440031',
          category_id: 'e1f2a3b4-c5d6-7890-1234-ef0123456789',
          is_approved: true,
          rating: 4.2
        },
        {
          id: '550e8400-e29b-41d4-a716-446655440065',
          name: 'Gaming Mouse RGB',
          description: 'Ergonomic gaming mouse with customizable RGB lighting',
          price: 49.99,
          stock: 150,
          seller_id: '550e8400-e29b-41d4-a716-446655440031',
          category_id: 'a1b2c3d4-e5f6-7890-1234-567890abcdef',
          is_approved: true,
          rating: 4.7
        },
        {
          id: '550e8400-e29b-41d4-a716-446655440066',
          name: 'Leather Wallet',
          description: 'Genuine leather wallet with RFID protection',
          price: 39.99,
          stock: 75,
          seller_id: '550e8400-e29b-41d4-a716-446655440031',
          category_id: 'e1f2a3b4-c5d6-7890-1234-ef0123456789',
          is_approved: true,
          rating: 4.3
        },
        {
          id: '550e8400-e29b-41d4-a716-446655440067',
          name: 'Noise Cancelling Headphones',
          description: 'Over-ear headphones with active noise cancellation',
          price: 199.99,
          stock: 60,
          seller_id: '550e8400-e29b-41d4-a716-446655440031',
          category_id: 'a1b2c3d4-e5f6-7890-1234-567890abcdef',
          is_approved: true,
          rating: 4.6
        },
        {
          id: '550e8400-e29b-41d4-a716-446655440070',
          name: 'Wireless Mechanical Keyboard',
          description: 'Compact wireless keyboard with mechanical switches and RGB lighting',
          price: 89.99,
          stock: 80,
          seller_id: '550e8400-e29b-41d4-a716-446655440031',
          category_id: 'a1b2c3d4-e5f6-7890-1234-567890abcdef',
          is_approved: true,
          rating: 4.5
        },
        {
          id: '550e8400-e29b-41d4-a716-446655440071',
          name: 'Smartwatch Series 9',
          description: 'Latest smartwatch with health tracking and cellular support',
          price: 399.99,
          stock: 55,
          seller_id: '550e8400-e29b-41d4-a716-446655440030',
          category_id: 'b2c3d4e5-f6a7-8901-2345-67890abcdef0',
          is_approved: true,
          rating: 4.4
        },
        {
          id: '550e8400-e29b-41d4-a716-446655440072',
          name: 'Ultra HD 4K Monitor',
          description: 'Professional 27-inch 4K UHD monitor for editing and gaming',
          price: 499.99,
          stock: 40,
          seller_id: '550e8400-e29b-41d4-a716-446655440030',
          category_id: 'c3d4e5f6-a7b8-9012-3456-7890abcdef01',
          is_approved: true,
          "rating": 4.6
        },
        {
          id: '550e8400-e29b-41d4-a716-446655440073',
          name: 'Bluetooth Speaker',
          description: 'Portable speaker with deep bass and waterproof design',
          price: 59.99,
          stock: 120,
          seller_id: '550e8400-e29b-41d4-a716-446655440031',
          category_id: 'a1b2c3d4-e5f6-7890-1234-567890abcdef',
          is_approved: true,
          rating: 4.3
        },
        {
          id: '550e8400-e29b-41d4-a716-446655440074',
          name: 'Slim Fit Jeans',
          description: 'Stylish slim fit jeans made with stretchable denim',
          price: 49.99,
          stock: 90,
          seller_id: '550e8400-e29b-41d4-a716-446655440031',
          category_id: 'e1f2a3b4-c5d6-7890-1234-ef0123456789',
          is_approved: true,
          rating: 4.1
        },
        {
          id: '550e8400-e29b-41d4-a716-446655440075',
          name: 'Wireless Earbuds',
          description: 'Compact true wireless earbuds with long battery life',
          price: 89.99,
          stock: 100,
          seller_id: '550e8400-e29b-41d4-a716-446655440031',
          category_id: 'a1b2c3d4-e5f6-7890-1234-567890abcdef',
          is_approved: true,
          rating: 4.4
        },
        {
          id: '550e8400-e29b-41d4-a716-446655440076',
          name: 'Smart Home Hub',
          description: 'Control all your smart home devices with one hub',
          price: 129.99,
          stock: 35,
          seller_id: '550e8400-e29b-41d4-a716-446655440030',
          category_id: 'a1b2c3d4-e5f6-7890-1234-567890abcdef',
          is_approved: true,
          rating: 4.2
        },
        {
          id: '550e8400-e29b-41d4-a716-446655440077',
          name: 'Office Chair Ergonomic',
          description: 'Comfortable and adjustable ergonomic office chair',
          price: 199.99,
          stock: 45,
          seller_id: '550e8400-e29b-41d4-a716-446655440030',
          category_id: 'f6a7b8c9-d0e1-2345-6789-0abcdef01234',
          is_approved: true,
          rating: 4.5
        },
        {
          id: '550e8400-e29b-41d4-a716-446655440078',
          name: 'Men\'s Hoodie',
          description: 'Warm and stylish hoodie made from soft fleece',
          price: 39.99,
          stock: 70,
          seller_id: '550e8400-e29b-41d4-a716-446655440031',
          category_id: 'e1f2a3b4-c5d6-7890-1234-ef0123456789',
          is_approved: true,
          rating: 4.2
        },
        {
          id: '550e8400-e29b-41d4-a716-446655440079',
          name: 'Laptop Cooling Pad',
          description: 'Silent cooling pad with adjustable fan speed and RGB lights',
          price: 34.99,
          stock: 110,
          seller_id: '550e8400-e29b-41d4-a716-446655440030',
          category_id: 'a1b2c3d4-e5f6-7890-1234-567890abcdef',
          is_approved: true,
          rating: 4.3
        }
      ],
      skipDuplicates: true,
    });

    // 6. Create images
    console.log('🖼️ Creating product images...');
    await prisma.image.createMany({
      data: [
        // iPhone 15 Pro images
        {
          id: '550e8400-e29b-41d4-a716-446655440070',
          product_id: '550e8400-e29b-41d4-a716-446655440060', // iPhone 15 Pro
          path: 'https://www.apple.com/newsroom/images/2023/09/apple-unveils-iphone-15-pro-and-iphone-15-pro-max/tile/Apple-iPhone-15-Pro-lineup-hero-230912.jpg.landing-big_2x.jpg',
          size: 1024000,
          format: 'jpg',
          is_main: true
        },
        {
          id: '550e8400-e29b-41d4-a716-446655440071',
          product_id: '550e8400-e29b-41d4-a716-446655440060', // iPhone 15 Pro
          path: 'https://images.unsplash.com/photo-1700805732158-6f1169780ca7?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8aXBob25lJTIwMTUlMjBwcm98ZW58MHx8MHx8fDA%3D',
          size: 812000,
          format: 'jpg',
          is_main: false
        },
        // MacBook Pro 16 images
        {
          id: '550e8400-e29b-41d4-a716-446655440072',
          product_id: '550e8400-e29b-41d4-a716-446655440061', // MacBook Pro 16
          path: 'https://images.unsplash.com/photo-1639087595550-e9770a85f8c0?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
          size: 1536000,
          format: 'jpg',
          is_main: true
        },
        {
          id: '550e8400-e29b-41d4-a716-446655440073',
          product_id: '550e8400-e29b-41d4-a716-446655440061', // MacBook Pro 16
          path: 'https://images.unsplash.com/photo-1675868374786-3edd36dddf04?q=80&w=1171&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
          size: 1536000,
          format: 'jpg',
          is_main: false
        },
        {
          id: '550e8400-e29b-41d4-a716-446655440074',
          product_id: '550e8400-e29b-41d4-a716-446655440061', // MacBook Pro 16
          path: 'https://images.unsplash.com/photo-1675868373607-556b8fed6464?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
          size: 1536000,
          format: 'jpg',
          is_main: false
        },
        {
          id: '550e8400-e29b-41d4-a716-446655440075',
          product_id: '550e8400-e29b-41d4-a716-446655440061', // MacBook Pro 16
          path: 'https://images.unsplash.com/photo-1675868375089-4572db453949?q=80&w=1171&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
          size: 1536000,
          format: 'jpg',
          is_main: false
        },
        // Samsung Galaxy S24 Ultra images
        {
          id: '550e8400-e29b-41d4-a716-446655440076',
          product_id: '550e8400-e29b-41d4-a716-446655440063', // Samsung Galaxy S24 Ultra
          path: 'https://images.unsplash.com/photo-1705530292519-ec81f2ace70d?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8c2Ftc3VuZyUyMHMyNCUyMHVsdHJhfGVufDB8fDB8fHww',
          size: 924000,
          format: 'jpg',
          is_main: true
        },
        // Dell XPS 13 images
        {
          id: '550e8400-e29b-41d4-a716-446655440077',
          product_id: '550e8400-e29b-41d4-a716-446655440064', // Dell XPS 13
          path: 'https://images.unsplash.com/photo-1720556405438-d67f0f9ecd44?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8RGVsbCUyMFhQUyUyMDEzfGVufDB8fDB8fHww',
          size: 512000,
          format: 'jpg',
          is_main: true
        },
        // Premium T-Shirt images
        {
          id: '550e8400-e29b-41d4-a716-446655440078',
          product_id: '550e8400-e29b-41d4-a716-446655440062', // Premium T-Shirt
          path: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600&h=600&fit=crop',
          size: 512000,
          format: 'jpg',
          is_main: true
        },
        // Gaming Mouse RGB images
        {
          id: '550e8400-e29b-41d4-a716-446655440079',
          product_id: '550e8400-e29b-41d4-a716-446655440065', // Gaming Mouse RGB
          path: 'https://images.unsplash.com/photo-1627745213598-51e38e5fc5f1?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8R2FtaW5nJTIwUkdCJTIwTW91c2V8ZW58MHx8MHx8fDA%3D',
          size: 512000,
          format: 'jpg',
          is_main: true
        },
        {
          id: '550e8400-e29b-41d4-a716-446655440080', // Adjusted ID to avoid duplicate with previous entry
          product_id: '550e8400-e29b-41d4-a716-446655440065', // Gaming Mouse RGB
          path: 'https://images.unsplash.com/photo-1627745214193-2bcefc681524?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8R2FtaW5nJTIwUkdCJTIwTW91c2V8ZW58MHx8MHx8fDA%3D',
          size: 512000,
          format: 'jpg',
          is_main: false
        },
        // Leather Wallet images
        {
          id: '550e8400-e29b-41d4-a716-446655440081',
          product_id: '550e8400-e29b-41d4-a716-446655440066', // Leather Wallet
          path: 'https://images.unsplash.com/photo-1637868796504-32f45a96d5a0?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Nnx8bGVhdGhlciUyMHdhbGxldHxlbnwwfHwwfHx8MA%3D%3D',
          size: 512000,
          format: 'jpg',
          is_main: true
        },
        // Noise Cancelling Headphones images
        {
          id: '550e8400-e29b-41d4-a716-446655440082',
          product_id: '550e8400-e29b-41d4-a716-446655440067', // Noise Cancelling Headphones
          path: 'https://images.unsplash.com/photo-1660391532247-4a8ad1060817?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8OHx8aGVhZHBob25lfGVufDB8MnwwfHx8MA%3D%3D',
          size: 512000,
          format: 'jpg',
          is_main: true
        },
        {
          id: '550e8400-e29b-41d4-a716-446655440083',
          product_id: '550e8400-e29b-41d4-a716-446655440067', // Noise Cancelling Headphones
          path: 'https://images.unsplash.com/photo-1642622039751-f74f2d1a0280?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Nnx8aGVhZHBob25lfGVufDB8MnwwfHx8MA%3D%3D',
          size: 512000,
          format: 'jpg',
          is_main: false
        },
        // Wireless Mechanical Keyboard images
        {
          id: '550e8400-e29b-41d4-a716-446655440084',
          product_id: '550e8400-e29b-41d4-a716-446655440070', // Wireless Mechanical Keyboard
          path: 'https://images.unsplash.com/photo-1694405156884-dea1ffb40ede?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8V2lyZWxlc3MlMjBNZWNoYW5pY2FsJTIwS2V5Ym9hcmR8ZW58MHx8MHx8fDA%3D',
          size: 512000,
          format: 'jpg',
          is_main: true
        },
        {
          id: '550e8400-e29b-41d4-a716-446655440085',
          product_id: '550e8400-e29b-41d4-a716-446655440070', // Wireless Mechanical Keyboard
          path: 'https://images.unsplash.com/photo-1694405145070-e58cc29771fa?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8V2lyZWxlc3MlMjBNZWNoYW5pY2FsJTIwS2V5Ym9hcmR8ZW58MHx8MHx8fDA%3D',
          size: 512000,
          format: 'jpg',
          is_main: false
        },
        // Smartwatch Series 9 images
        {
          id: '550e8400-e29b-41d4-a716-446655440086',
          product_id: '550e8400-e29b-41d4-a716-446655440071', // Smartwatch Series 9
          path: 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Nnx8U21hcnQlMjBXYXRjaHxlbnwwfHwwfHx8MA%3D%3D',
          size: 512000,
          format: 'jpg',
          is_main: true
        },
        {
          id: '550e8400-e29b-41d4-a716-446655440087',
          product_id: '550e8400-e29b-41d4-a716-446655440071', // Smartwatch Series 9
          path: 'https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8U21hcnQlMjBXYXRjaHxlbnwwfHwwfHx8MA%3D%3D',
          size: 512000,
          format: 'jpg',
          is_main: false
        },
        // Ultra HD 4K Monitor images
        {
          id: '550e8400-e29b-41d4-a716-446655440088',
          product_id: '550e8400-e29b-41d4-a716-446655440072', // Ultra HD 4K Monitor
          path: 'https://images.unsplash.com/photo-1691480195680-144318cfa695?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8TW9uaXRvcnxlbnwwfDJ8MHx8fDA%3D',
          size: 512000,
          format: 'jpg',
          is_main: true
        },
        // Bluetooth Speaker images
        {
          id: '550e8400-e29b-41d4-a716-446655440089',
          product_id: '550e8400-e29b-41d4-a716-446655440073', // Bluetooth Speaker
          path: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8Ymx1ZXRvb3RoJTIwc3BlYWtlcnxlbnwwfHwwfHx8MA%3D%3D',
          size: 512000,
          format: 'jpg',
          is_main: true
        },
        {
          id: '550e8400-e29b-41d4-a716-446655440090',
          product_id: '550e8400-e29b-41d4-a716-446655440073', // Bluetooth Speaker
          path: 'https://images.unsplash.com/photo-1632073383420-01461da1e082?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTh8fGJsdWV0b290aCUyMHNwZWFrZXJ8ZW58MHx8MHx8fDA%3D',
          size: 512000,
          format: 'jpg',
          is_main: false
        },
        // Slim Fit Jeans images
        {
          id: '550e8400-e29b-41d4-a716-446655440091',
          product_id: '550e8400-e29b-41d4-a716-446655440074', // Slim Fit Jeans
          path: 'https://images.unsplash.com/photo-1714143136367-7bb68f3f0669?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8OHx8U2xpbSUyMEZpdCUyMEplYW5zfGVufDB8MnwwfHx8MA%3D%3D',
          size: 512000,
          format: 'jpg',
          is_main: true
        },
        {
          id: '550e8400-e29b-41d4-a716-446655440092',
          product_id: '550e8400-e29b-41d4-a716-446655440074', // Slim Fit Jeans
          path: 'https://images.unsplash.com/photo-1588699767657-59562cd87205?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8U2xpbSUyMEZpdCUyMEplYW5zfGVufDB8MnwwfHx8MA%3D%3D',
          size: 512000,
          format: 'jpg',
          is_main: false
        },
        // Wireless Earbuds images
        {
          id: '550e8400-e29b-41d4-a716-446655440093',
          product_id: '550e8400-e29b-41d4-a716-446655440075', // Wireless Earbuds
          path: 'https://images.unsplash.com/photo-1648447265709-67a4e785d7e2?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8V2lyZWxlc3MlMjBFYXJidWRzfGVufDB8MnwwfHx8MA%3D%3D',
          size: 512000,
          format: 'jpg',
          is_main: true
        },
        {
          id: '550e8400-e29b-41d4-a716-446655440094',
          product_id: '550e8400-e29b-41d4-a716-446655440075', // Wireless Earbuds
          path: 'https://images.unsplash.com/photo-1648447267722-77cb7cf4c292?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8V2lyZWxlc3MlMjBFYXJidWRzfGVufDB8MnwwfHx8MA%3D%3D',
          size: 512000,
          format: 'jpg',
          is_main: false
        },
        // Smart Home Hub images
        {
          id: '550e8400-e29b-41d4-a716-446655440095',
          product_id: '550e8400-e29b-41d4-a716-446655440076', // Smart Home Hub
          path: 'https://plus.unsplash.com/premium_photo-1728681168863-2c62a62fbfda?q=80&w=1332&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
          size: 512000,
          format: 'jpg',
          is_main: true
        },
        // Office Chair Ergonomic images
        {
          id: '550e8400-e29b-41d4-a716-446655440096',
          product_id: '550e8400-e29b-41d4-a716-446655440077', // Office Chair Ergonomic
          path: 'https://images.unsplash.com/photo-1635427194796-f9fc252bbb7d?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8T2ZmaWNlJTIwQ2hhaXJ8ZW58MHwyfDB8fHww',
          size: 512000,
          format: 'jpg',
          is_main: true
        },
        // Men's Hoodie images
        {
          id: '550e8400-e29b-41d4-a716-446655440097',
          product_id: '550e8400-e29b-41d4-a716-446655440078', // Men's Hoodie
          path: 'https://images.unsplash.com/photo-1586038693164-cb7ee3fb8e2c?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Nnx8SG9vZGllfGVufDB8MnwwfHx8MA%3D%3D',
          size: 512000,
          format: 'jpg',
          is_main: true
        },
        // Laptop Cooling Pad images
        {
          id: '550e8400-e29b-41d4-a716-446655440098',
          product_id: '550e8400-e29b-41d4-a716-446655440079', // Laptop Cooling Pad
          path: 'https://m.media-amazon.com/images/I/81t9B5pBMBL._UF894%2C1000_QL80_.jpg',
          size: 512000,
          format: 'jpg',
          is_main: true
        }
      ],
      skipDuplicates: true,
    });

    console.log('✅ Database seeding completed successfully!');

    // Log summary
    const userCount = await prisma.user.count();
    const productCount = await prisma.product.count();
    const customerCount = await prisma.customerProfile.count();

    console.log(`📊 Summary: ${userCount} users, ${productCount} products, ${customerCount} customers created`);
    console.log('🛒 Test customer created: customer-1 (linked to test@example.com)');

  } catch (error) {
    console.error('❌ Error during seeding:', error);
    throw error;
  }
}

main()
  .catch((e) => {
    console.error('Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });