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
        },
        // ✅ Additional users for reviews
        {
          id: 'user-2',
          email: 'ahmed@example.com',
          password: '$2b$10$hashedpassword',
          first_name: 'Ahmed',
          last_name: 'Ali',
          phone: '+1234567800',
          role: 'CUSTOMER'
        },
        {
          id: 'user-3',
          email: 'sara@example.com',
          password: '$2b$10$hashedpassword',
          first_name: 'Sara',
          last_name: 'Hassan',
          phone: '+1234567801',
          role: 'CUSTOMER'
        },
        {
          id: 'user-4',
          email: 'omar@example.com',
          password: '$2b$10$hashedpassword',
          first_name: 'Omar',
          last_name: 'Khaled',
          phone: '+1234567802',
          role: 'CUSTOMER'
        },
        {
          id: 'user-5',
          email: 'noor@example.com',
          password: '$2b$10$hashedpassword',
          first_name: 'Noor',
          last_name: 'Mohammed',
          phone: '+1234567803',
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
        },
        // ✅ Additional customer profiles for reviews
        {
          id: 'customer-2',
          user_id: 'user-2',
          wishlist: [],
          loyalty_points: 150
        },
        {
          id: 'customer-3',
          user_id: 'user-3',
          wishlist: [],
          loyalty_points: 300
        },
        {
          id: 'customer-4',
          user_id: 'user-4',
          wishlist: [],
          loyalty_points: 80
        },
        {
          id: 'customer-5',
          user_id: 'user-5',
          wishlist: [],
          loyalty_points: 200
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
          category_id: 'b2c3d4e5-f6a7-8901-2345-67890abcdef0', // Smartphones
          is_approved: true,
          rating: 4.5
        },
        
        {
          id: '550e8400-e29b-41d4-a716-446655440061',
          name: 'MacBook Pro 16',
          description: 'High-performance laptop for professionals with M3 chip',
          price: 2499.99,
          stock: 25,
          seller_id: '550e8400-e29b-41d4-a716-446655440030',
          category_id: 'c3d4e5f6-a7b8-9012-3456-7890abcdef01', // Laptops
          is_approved: true,
          rating: 4.8
        },
        {
          id: '550e8400-e29b-41d4-a716-446655440062',
          name: 'Premium T-Shirt',
          description: 'Comfortable premium cotton t-shirt',
          price: 29.99,
          stock: 100,
          seller_id: '550e8400-e29b-41d4-a716-446655440031',
          category_id: 'e1f2a3b4-c5d6-7890-1234-ef0123456789', // Men's Apparel
          is_approved: true,
          rating: 4.2
        },
        {
          id: '550e8400-e29b-41d4-a716-446655440063',
          name: 'Samsung Galaxy S24 Ultra',
          description: 'Flagship Android phone with powerful performance and S Pen',
          price: 1099.99,
          stock: 45,
          seller_id: '550e8400-e29b-41d4-a716-446655440030',
          category_id: 'b2c3d4e5-f6a7-8901-2345-67890abcdef0', // Smartphones
          is_approved: true,
          rating: 4.6
        },
        {
          id: '550e8400-e29b-41d4-a716-446655440064',
          name: 'Dell XPS 13',
          description: 'Compact and powerful ultrabook for daily use',
          price: 1399.99,
          stock: 30,
          seller_id: '550e8400-e29b-41d4-a716-446655440030',
          category_id: 'c3d4e5f6-a7b8-9012-3456-7890abcdef01', // Laptops
          is_approved: true,
          rating: 4.4
        },
        {
          id: '550e8400-e29b-41d4-a716-446655440065',
          name: 'Gaming Mouse RGB',
          description: 'Ergonomic gaming mouse with customizable RGB lighting',
          price: 49.99,
          stock: 150,
          seller_id: '550e8400-e29b-41d4-a716-446655440031',
          category_id: 'a1b2c3d4-e5f6-7890-1234-567890abcdef', // Electronics
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
          category_id: 'e1f2a3b4-c5d6-7890-1234-ef0123456789', // Men's Apparel
          is_approved: true,
          rating: 2.3
        },
        {
          id: '550e8400-e29b-41d4-a716-446655440067',
          name: 'Noise Cancelling Headphones',
          description: 'Over-ear headphones with active noise cancellation',
          price: 199.99,
          stock: 60,
          seller_id: '550e8400-e29b-41d4-a716-446655440031',
          category_id: 'a1b2c3d4-e5f6-7890-1234-567890abcdef', // Electronics
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
          category_id: 'a1b2c3d4-e5f6-7890-1234-567890abcdef', // Electronics
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
          category_id: 'b2c3d4e5-f6a7-8901-2345-67890abcdef0', // Smartwatches
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
          category_id: 'c3d4e5f6-a7b8-9012-3456-7890abcdef01', // Laptops
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
          category_id: 'a1b2c3d4-e5f6-7890-1234-567890abcdef', // Electronics
          is_approved: true,
          rating: 4.3
        },
        {
          id: '550e8400-e29b-41d4-a716-446655440074',
          name: 'Women\'s Slim Fit Jeans',
          description: 'Stylish slim fit jeans made with stretchable denim',
          price: 49.99,
          stock: 90,
          seller_id: '550e8400-e29b-41d4-a716-446655440031',
          category_id: 'e1f2a3b4-c5d6-7890-1234-ef0123456789', // Men's Apparel
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
          category_id: 'a1b2c3d4-e5f6-7890-1234-567890abcdef', // Electronics
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
          category_id: 'a1b2c3d4-e5f6-7890-1234-567890abcdef', // Electronics
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
          category_id: 'f6a7b8c9-d0e1-2345-6789-0abcdef01234', // Furniture
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
          category_id: 'e1f2a3b4-c5d6-7890-1234-ef0123456789', // Men's Apparel
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
          category_id: 'a1b2c3d4-e5f6-7890-1234-567890abcdef', // Electronics
          is_approved: true,
          rating: 4.3
        },
        {
          id: '650e8400-e29b-41d4-a716-446655440081',
          name: 'Dell XPS 15',
          description: 'High-performance laptop for professionals with stunning display',
          price: 1899.00,
          stock: 30,
          seller_id: '550e8400-e29b-41d4-a716-446655440031',
          category_id: 'c3d4e5f6-a7b8-9012-3456-7890abcdef01', // Laptops
          is_approved: true,
          rating: 4.7
        },
        {
          id: '750e8400-e29b-41d4-a716-446655440082',
          name: 'Samsung Galaxy Tab S8',
          description: 'Versatile Android tablet for productivity and entertainment',
          price: 699.00,
          stock: 40,
          seller_id: '550e8400-e29b-41d4-a716-446655440030',
          category_id: 'd4e5f6a7-b8c9-0123-4567-890abcdef012', // Tablets
          is_approved: true,
          rating: 4.3
        },
        {
          id: '850e8400-e29b-41d4-a716-446655440083',
          name: 'LG C2 OLED TV',
          description: 'Stunning 4K OLED TV for an immersive viewing experience',
          price: 1499.99,
          stock: 25,
          seller_id: '550e8400-e29b-41d4-a716-446655440031',
          category_id: 'e5f6a7b8-c9d0-1234-5678-90abcdef0123', // Televisions & Audio
          is_approved: true,
          rating: 4.8
        },
        {
          id: '950e8400-e29b-41d4-a716-446655440084',
          name: 'Modern Sofa Set',
          description: 'Comfortable and stylish sofa set for your living room',
          price: 1200.00,
          stock: 15,
          seller_id: '550e8400-e29b-41d4-a716-446655440030',
          category_id: 'a7b8c9d0-e1f2-3456-7890-abcdef012345', // Furniture
          is_approved: true,
          rating: 4.2
        },
        {
          id: 'a50e8400-e29b-41d4-a716-446655440085',
          name: 'Non-stick Cookware Set',
          description: 'Essential cookware set for everyday cooking needs',
          price: 150.00,
          stock: 60,
          seller_id: '550e8400-e29b-41d4-a716-446655440030',
          category_id: 'b8c9d0e1-f2a3-4567-8901-bcdef0123456', // Kitchenware
          is_approved: true,
          rating: 4.6
        },
        {
          id: 'b50e8400-e29b-41d4-a716-446655440086',
          name: 'Floral Summer Dress',
          description: 'Light and airy dress perfect for summer days',
          price: 45.99,
          stock: 100,
          seller_id: '550e8400-e29b-41d4-a716-446655440030',
          category_id: 'd0e1f2a3-b4c5-6789-0123-def012345678', // Women's Apparel
          is_approved: true,
          rating: 4.1
        },
        {
          id: 'c50e8400-e29b-41d4-a716-446655440087',
          name: 'Men\'s Slim Fit Jeans',
          description: 'Classic slim fit jeans for a modern look',
          price: 59.99,
          stock: 80,
          seller_id: '550e8400-e29b-41d4-a716-446655440031',
          category_id: 'e1f2a3b4-c5d6-7890-1234-ef0123456789', // Men's Apparel
          is_approved: true,
          rating: 4.4
        },
        {
          id: 'd50e8400-e29b-41d4-a716-446655440088',
          name: 'Baby Bodysuit Set',
          description: 'Soft and comfortable bodysuits for infants',
          price: 29.99,
          stock: 120,
          seller_id: '550e8400-e29b-41d4-a716-446655440031',
          category_id: 'f2a3b4c5-d6e7-8901-2345-f0123456789a', // Kids' & Baby Apparel
          is_approved: true,
          rating: 4.7
        },
        {
          id: 'e50e8400-e29b-41d4-a716-446655440089',
          name: 'Hydrating Face Serum',
          description: 'Nourishing serum for healthy and glowing skin',
          price: 35.00,
          stock: 75,
          seller_id: '550e8400-e29b-41d4-a716-446655440031',
          category_id: 'b4c5d6e7-f8a9-0123-4567-123456789abc', // Skincare
          is_approved: true,
          rating: 4.5
        },
        {
          id: 'f50e8400-e29b-41d4-a716-446655440090',
          name: 'Eyeshadow Palette',
          description: 'Versatile eyeshadow palette with a range of colors',
          price: 25.50,
          stock: 90,
          seller_id: '550e8400-e29b-41d4-a716-446655440030',
          category_id: 'c5d6e7f8-a9b0-1234-5678-23456789abcd', // Makeup
          is_approved: true,
          rating: 4.3
        },
        {
          id: '150e8400-e29b-41d4-a716-446655440091',
          name: 'Adjustable Dumbbell Set',
          description: 'Compact and adjustable dumbbells for home workouts',
          price: 199.99,
          stock: 35,
          seller_id: '550e8400-e29b-41d4-a716-446655440031',
          category_id: 'e7f8a9b0-c1d2-3456-7890-456789abcdef', // Fitness Equipment
          is_approved: true,
          rating: 4.6
        },
        {
          id: '250e8400-e29b-41d4-a716-446655440092',
          name: 'Camping Tent (4-person)',
          description: 'Durable and easy-to-set-up tent for outdoor adventures',
          price: 120.00,
          stock: 20,
          seller_id: '550e8400-e29b-41d4-a716-446655440030',
          category_id: 'f8a9b0c1-d2e3-4567-8901-56789abcdef0', // Outdoor Gear
          is_approved: true,
          rating: 4.4
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
        // Women's Slim Fit Jeans images
        {
          id: '550e8400-e29b-41d4-a716-446655440091',
          product_id: '550e8400-e29b-41d4-a716-446655440074', // Women's Slim Fit Jeans
          path: 'https://images.unsplash.com/photo-1714143136367-7bb68f3f0669?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8OHx8U2xpbSUyMEZpdCUyMEplYW5zfGVufDB8MnwwfHx8MA%3D%3D',
          size: 512000,
          format: 'jpg',
          is_main: true
        },
        {
          id: '550e8400-e29b-41d4-a716-446655440092',
          product_id: '550e8400-e29b-41d4-a716-446655440074', // Women's Slim Fit Jeans
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
        },
        // Dell XPS 15 images
        {
            id: '150e8400-e29b-41d4-a716-446655440099',
            product_id: '650e8400-e29b-41d4-a716-446655440081', // Dell XPS 15
            path: 'https://www.notebookcheck-tr.com/uploads/tx_nbc2/DellXPS15-9510__1__03.jpg',
            size: 1000000, // Varsayılan boyut
            format: 'jpg',
            is_main: true,
        },
        // Samsung Galaxy Tab S8 images
        {
            id: '150e8400-e29b-41d4-a716-446655440100',
            product_id: '750e8400-e29b-41d4-a716-446655440082', // Samsung Galaxy Tab S8
            path: 'https://cdn.cimri.io/image/1200x1200/samsung-galaxy-tab-s8-ultra-sm-x900-wi-fi-256gb-14-6-inc-siyah-tablet-pc_647986451.jpg',
            size: 1000000,
            format: 'jpg',
            is_main: true,
        },
        {
            id: '150e8400-e29b-41d4-a716-446655440101',
            product_id: '750e8400-e29b-41d4-a716-446655440082', // Samsung Galaxy Tab S8
            path: 'https://productimages.hepsiburada.net/s/178/375-375/110000142699060.jpg',
            size: 1000000,
            format: 'jpg',
            is_main: false,
        },
        // LG C2 OLED TV images
        {
            id: '150e8400-e29b-41d4-a716-446655440102',
            product_id: '850e8400-e29b-41d4-a716-446655440083', // LG C2 OLED TV
            path: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcREbfS0Y0r4sHK-n22mpoMXsKcuEqxrL_Cu7w&s',
            size: 1000000,
            format: 'jpg',
            is_main: true,
        },
        // Modern Sofa Set images
        {
            id: '150e8400-e29b-41d4-a716-446655440103',
            product_id: '950e8400-e29b-41d4-a716-446655440084', // Modern Sofa Set
            path: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR3cPwoat3eZItNifTHBwN-buQt9wZntt-3yA&s',
            size: 1000000,
            format: 'jpg',
            is_main: true,
        },
        // Non-stick Cookware Set images
        {
            id: '150e8400-e29b-41d4-a716-446655440104',
            product_id: 'a50e8400-e29b-41d4-a716-446655440085', // Non-stick Cookware Set
            path: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQQJE1k30Dq_wV0g2-s777cOVUqfclMYVfqgQ&s',
            size: 1000000,
            format: 'jpg',
            is_main: true,
        },
        // Floral Summer Dress images
        {
            id: '150e8400-e29b-41d4-a716-446655440105',
            product_id: 'b50e8400-e29b-41d4-a716-446655440086', // Floral Summer Dress
            path: 'https://m.media-amazon.com/images/I/81MyEudgSwL._UY1000_.jpg',
            size: 1000000,
            format: 'jpg',
            is_main: true,
        },
        // Men's Slim Fit Jeans images
        {
            id: '150e8400-e29b-41d4-a716-446655440106',
            product_id: 'c50e8400-e29b-41d4-a716-446655440087', // Men's Slim Fit Jeans
            path: 'https://shopduer.com/cdn/shop/files/Performance_Denim_Slim-Galactic_8110_R_FT-ECOM-445286.jpg?v=1747252752&width=1143',
            size: 1000000,
            format: 'jpg',
            is_main: true,
        },
        // Baby Bodysuit Set images
        {
            id: '150e8400-e29b-41d4-a716-446655440107',
            product_id: 'd50e8400-e29b-41d4-a716-446655440088', // Baby Bodysuit Set
            path: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRMvDy-1g401G9DwvNe8Ig2UggcgMkYlM6M-g&s',
            size: 1000000,
            format: 'jpg',
            is_main: true,
        },
        // Hydrating Face Serum images
        {
            id: '150e8400-e29b-41d4-a716-446655440108',
            product_id: 'e50e8400-e29b-41d4-a716-446655440089', // Hydrating Face Serum
            path: 'https://omegaskinlab.com/cdn/shop/files/no7_1400x.png?v=1698826302',
            size: 1000000,
            format: 'jpg',
            is_main: true,
        },
        // Eyeshadow Palette images
        {
            id: '150e8400-e29b-41d4-a716-446655440109',
            product_id: 'f50e8400-e29b-41d4-a716-446655440090', // Eyeshadow Palette
            path: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQc7I7hq9l6zMwiRsB33LOQdyELeE1rRzcPEA&s',
            size: 1000000,
            format: 'jpg',
            is_main: true,
        },
        // Adjustable Dumbbell Set images
        {
            id: '150e8400-e29b-41d4-a716-446655440110',
            product_id: '150e8400-e29b-41d4-a716-446655440091', // Adjustable Dumbbell Set
            path: 'https://www.theflexnest.com/cdn/shop/products/1_26f7cabd-aa5a-4256-9c47-24833f009086.jpg?v=1635230112',
            size: 1000000,
            format: 'jpg',
            is_main: true,
        },
        // Camping Tent images
        {
            id: '150e8400-e29b-41d4-a716-446655440111',
            product_id: '250e8400-e29b-41d4-a716-446655440092', // Camping Tent (4-person)
            path: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR-hGYKidzYB791nQ32cvl3GYZXiWmMRTcN9Q&s',
            size: 1000000,
            format: 'jpg',
            is_main: true,
        }
      ],
      skipDuplicates: true,
    });

    // 7. ✅ CREATE REALISTIC REVIEWS FOR PRODUCTS
    console.log('⭐ Creating reviews...');
    await prisma.review.createMany({
      data: [
        // iPhone 15 Pro Reviews (ID: 550e8400-e29b-41d4-a716-446655440060)
        {
          id: 'review-iphone-1',
          product_id: '550e8400-e29b-41d4-a716-446655440060',
          customer_id: 'customer-1',
          rating: 5,
          title: 'Amazing phone, worth every penny!',
          comment: 'The iPhone 15 Pro exceeded my expectations. The camera quality is incredible, especially the night mode. The titanium build feels premium and the battery lasts all day.',
          pros: ['Excellent camera quality', 'Premium build materials', 'Great battery life', 'Fast performance'],
          cons: ['Expensive', 'No USB-C cable in box'],
          is_verified: true,
          is_approved: true,
          helpful_count: 23,
          review_date: new Date('2024-11-15'),
        },
        {
          id: 'review-iphone-2',
          product_id: '550e8400-e29b-41d4-a716-446655440060',
          customer_id: 'customer-2',
          rating: 4,
          title: 'Great upgrade from iPhone 12',
          comment: 'Switched from iPhone 12 and the difference is noticeable. The Action Button is really useful and the cameras are much better in low light.',
          pros: ['Better cameras', 'Action Button is handy', 'Faster processor'],
          cons: ['Price is high', 'Not much different in daily use'],
          is_verified: true,
          is_approved: true,
          helpful_count: 15,
          review_date: new Date('2024-11-20'),
        },
        {
          id: 'review-iphone-3',
          product_id: '550e8400-e29b-41d4-a716-446655440060',
          customer_id: 'customer-3',
          rating: 4,
          title: 'Solid phone but expensive',
          comment: 'Great performance and camera, but the price is quite steep. The titanium feels nice but I miss the Lightning cable.',
          pros: ['Excellent performance', 'Great camera system', 'Premium materials'],
          cons: ['Very expensive', 'Need new cables'],
          is_verified: false,
          is_approved: true,
          helpful_count: 8,
          review_date: new Date('2024-12-01'),
        },

        // MacBook Pro 16 Reviews (ID: 550e8400-e29b-41d4-a716-446655440061)
        {
          id: 'review-macbook-1',
          product_id: '550e8400-e29b-41d4-a716-446655440061',
          customer_id: 'customer-1',
          rating: 5,
          title: 'Perfect for professional work',
          comment: 'As a video editor, this MacBook Pro handles 4K editing like a breeze. The M3 chip is incredibly fast and the battery life is amazing for such a powerful machine.',
          pros: ['Incredible performance', 'Long battery life', 'Beautiful display', 'Quiet operation'],
          cons: ['Heavy', 'Expensive'],
          is_verified: true,
          is_approved: true,
          helpful_count: 42,
          review_date: new Date('2024-10-10'),
        },
        {
          id: 'review-macbook-2',
          product_id: '550e8400-e29b-41d4-a716-446655440061',
          customer_id: 'customer-4',
          rating: 5,
          title: 'Best laptop I have ever owned',
          comment: 'Coming from a Windows laptop, this MacBook Pro is a game changer. Everything is so smooth and the build quality is exceptional.',
          pros: ['Smooth macOS experience', 'Excellent build quality', 'Great speakers', 'Fast SSD'],
          cons: ['Learning curve coming from Windows', 'Price'],
          is_verified: true,
          is_approved: true,
          helpful_count: 18,
          review_date: new Date('2024-11-05'),
        },

        // Samsung Galaxy S24 Ultra Reviews (ID: 550e8400-e29b-41d4-a716-446655440063)
        {
          id: 'review-samsung-1',
          product_id: '550e8400-e29b-41d4-a716-446655440063',
          customer_id: 'customer-2',
          rating: 5,
          title: 'S Pen makes all the difference',
          comment: 'The S Pen functionality is incredible for taking notes and drawing. The camera zoom is also outstanding - 100x zoom actually works!',
          pros: ['Amazing S Pen', 'Incredible zoom camera', 'Large beautiful screen', 'Fast charging'],
          cons: ['Battery drains fast with heavy use', 'Large size'],
          is_verified: true,
          is_approved: true,
          helpful_count: 31,
          review_date: new Date('2024-11-12'),
        },
        {
          id: 'review-samsung-2',
          product_id: '550e8400-e29b-41d4-a716-446655440063',
          customer_id: 'customer-5',
          rating: 4,
          title: 'Great Android flagship',
          comment: 'Excellent phone with tons of features. The AI features are really helpful and the display is gorgeous. Just wish the battery lasted longer.',
          pros: ['Beautiful display', 'AI features', 'Versatile cameras', 'Good performance'],
          cons: ['Battery life could be better', 'Samsung bloatware'],
          is_verified: false,
          is_approved: true,
          helpful_count: 12,
          review_date: new Date('2024-12-03'),
        },

        // Dell XPS 13 Reviews (ID: 550e8400-e29b-41d4-a716-446655440064)
        {
          id: 'review-dell-1',
          product_id: '550e8400-e29b-41d4-a716-446655440064',
          customer_id: 'customer-3',
          rating: 4,
          title: 'Great ultrabook for students',
          comment: 'Perfect size for carrying around campus. Good performance for coding and the battery lasts through long study sessions.',
          pros: ['Lightweight and portable', 'Good battery life', 'Nice display', 'Fast boot times'],
          cons: ['Limited ports', 'Fan can get loud', 'Webcam quality'],
          is_verified: true,
          is_approved: true,
          helpful_count: 9,
          review_date: new Date('2024-11-18'),
        },

        // Premium T-Shirt Reviews (ID: 550e8400-e29b-41d4-a716-446655440062)
        {
          id: 'review-tshirt-1',
          product_id: '550e8400-e29b-41d4-a716-446655440062',
          customer_id: 'customer-4',
          rating: 4,
          title: 'Very comfortable and good quality',
          comment: 'The fabric feels really soft and the fit is perfect. Great for everyday wear and the color hasn\'t faded after multiple washes.',
          pros: ['Soft comfortable fabric', 'Good fit', 'Color stays vibrant', 'Breathable'],
          cons: ['A bit pricey for a t-shirt', 'Limited color options'],
          is_verified: true,
          is_approved: true,
          helpful_count: 7,
          review_date: new Date('2024-11-25'),
        },
        {
          id: 'review-tshirt-2',
          product_id: '550e8400-e29b-41d4-a716-446655440062',
          customer_id: 'customer-5',
          rating: 5,
          title: 'Best t-shirt I have bought',
          comment: 'Amazing quality! The cotton is premium and it fits perfectly. Will definitely buy more colors.',
          pros: ['Premium cotton', 'Perfect fit', 'Durable', 'Comfortable'],
          cons: ['Wish there were more colors'],
          is_verified: true,
          is_approved: true,
          helpful_count: 4,
          review_date: new Date('2024-12-02'),
        },

        // Gaming Mouse RGB Reviews (ID: 550e8400-e29b-41d4-a716-446655440065)
        {
          id: 'review-mouse-1',
          product_id: '550e8400-e29b-41d4-a716-446655440065',
          customer_id: 'customer-1',
          rating: 5,
          title: 'Perfect gaming mouse',
          comment: 'The RGB lighting is customizable and looks amazing. The mouse is very responsive and comfortable for long gaming sessions.',
          pros: ['Excellent responsiveness', 'Comfortable grip', 'Beautiful RGB', 'Good software'],
          cons: ['Software can be complex'],
          is_verified: true,
          is_approved: true,
          helpful_count: 16,
          review_date: new Date('2024-11-08'),
        },
        {
          id: 'review-mouse-2',
          product_id: '550e8400-e29b-41d4-a716-446655440065',
          customer_id: 'customer-3',
          rating: 4,
          title: 'Great value for money',
          comment: 'Good gaming mouse with nice RGB effects. The DPI settings are easy to adjust and it feels solid.',
          pros: ['Good value', 'Adjustable DPI', 'Nice RGB effects', 'Solid build'],
          cons: ['Cable could be longer', 'Side buttons feel cheap'],
          is_verified: false,
          is_approved: true,
          helpful_count: 3,
          review_date: new Date('2024-11-22'),
        },

        // Leather Wallet Reviews (ID: 550e8400-e29b-41d4-a716-446655440066)
        {
          id: 'review-wallet-1',
          product_id: '550e8400-e29b-41d4-a716-446655440066',
          customer_id: 'customer-2',
          rating: 2,
          title: 'Quality is not as expected',
          comment: 'The leather feels cheap and started showing wear after just a few weeks. The RFID blocking works but overall disappointed with the quality.',
          pros: ['RFID protection works', 'Good size'],
          cons: ['Poor leather quality', 'Shows wear quickly', 'Stitching came loose'],
          is_verified: true,
          is_approved: true,
          helpful_count: 11,
          review_date: new Date('2024-11-14'),
        },
        {
          id: 'review-wallet-2',
          product_id: '550e8400-e29b-41d4-a716-446655440066',
          customer_id: 'customer-4',
          rating: 3,
          title: 'Average wallet',
          comment: 'It\'s okay for the price but nothing special. The RFID blocking is the main selling point.',
          pros: ['RFID protection', 'Compact design'],
          cons: ['Leather quality could be better', 'Limited card slots'],
          is_verified: false,
          is_approved: true,
          helpful_count: 2,
          review_date: new Date('2024-12-01'),
        },

        // Noise Cancelling Headphones Reviews (ID: 550e8400-e29b-41d4-a716-446655440067)
        {
          id: 'review-headphones-1',
          product_id: '550e8400-e29b-41d4-a716-446655440067',
          customer_id: 'customer-5',
          rating: 5,
          title: 'Excellent noise cancellation',
          comment: 'These headphones are amazing for flights and noisy environments. The sound quality is excellent and they\'re very comfortable for long wear.',
          pros: ['Excellent noise cancellation', 'Great sound quality', 'Comfortable fit', 'Long battery life'],
          cons: ['A bit bulky', 'Case is large'],
          is_verified: true,
          is_approved: true,
          helpful_count: 28,
          review_date: new Date('2024-10-28'),
        },
        {
          id: 'review-headphones-2',
          product_id: '550e8400-e29b-41d4-a716-446655440067',
          customer_id: 'customer-1',
          rating: 4,
          title: 'Great for work from home',
          comment: 'Perfect for blocking out distractions while working. The microphone quality is also good for video calls.',
          pros: ['Good noise cancellation', 'Clear microphone', 'Comfortable', 'Easy controls'],
          cons: ['Can get warm during long use', 'Touch controls can be sensitive'],
          is_verified: true,
          is_approved: true,
          helpful_count: 6,
          review_date: new Date('2024-11-30'),
        }
      ],
      skipDuplicates: true,
    });

    // 8. ✅ UPDATE PRODUCT RATINGS BASED ON REVIEWS
    console.log('📊 Updating product ratings...');
    
    // iPhone 15 Pro: (5+4+4)/3 = 4.33
    await prisma.product.update({
      where: { id: '550e8400-e29b-41d4-a716-446655440060' },
      data: { rating: 4.33 }
    });

    // MacBook Pro 16: (5+5)/2 = 5.0
    await prisma.product.update({
      where: { id: '550e8400-e29b-41d4-a716-446655440061' },
      data: { rating: 5.0 }
    });

    // Samsung Galaxy S24 Ultra: (5+4)/2 = 4.5
    await prisma.product.update({
      where: { id: '550e8400-e29b-41d4-a716-446655440063' },
      data: { rating: 4.5 }
    });

    // Dell XPS 13: 4/1 = 4.0
    await prisma.product.update({
      where: { id: '550e8400-e29b-41d4-a716-446655440064' },
      data: { rating: 4.0 }
    });

    // Premium T-Shirt: (4+5)/2 = 4.5
    await prisma.product.update({
      where: { id: '550e8400-e29b-41d4-a716-446655440062' },
      data: { rating: 4.5 }
    });

    // Gaming Mouse RGB: (5+4)/2 = 4.5
    await prisma.product.update({
      where: { id: '550e8400-e29b-41d4-a716-446655440065' },
      data: { rating: 4.5 }
    });

    // Leather Wallet: (2+3)/2 = 2.5
    await prisma.product.update({
      where: { id: '550e8400-e29b-41d4-a716-446655440066' },
      data: { rating: 2.5 }
    });

    // Noise Cancelling Headphones: (5+4)/2 = 4.5
    await prisma.product.update({
      where: { id: '550e8400-e29b-41d4-a716-446655440067' },
      data: { rating: 4.5 }
    });
    
    console.log('✅ Database seeding completed successfully!');

    // Log summary
    const userCount = await prisma.user.count();
    const productCount = await prisma.product.count();
    const customerCount = await prisma.customerProfile.count();
    const reviewCount = await prisma.review.count();

    console.log(`📊 Summary: ${userCount} users, ${productCount} products, ${customerCount} customers, ${reviewCount} reviews created`);
    console.log('🛒 Test customer created: customer-1 (linked to test@example.com)');
    console.log('⭐ Reviews with realistic ratings and comments added');

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