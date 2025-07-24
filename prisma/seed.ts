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
          id: '550e8400-e29b-41d4-a716-446655440050',
          name: 'Electronics',
          description: 'Electronic devices and gadgets'
        },
        {
          id: '550e8400-e29b-41d4-a716-446655440051',
          name: 'Smartphones',
          description: 'Mobile phones and accessories',
          parent_id: '550e8400-e29b-41d4-a716-446655440050'
        },
        {
          id: '550e8400-e29b-41d4-a716-446655440052',
          name: 'Laptops',
          description: 'Laptops and computer accessories',
          parent_id: '550e8400-e29b-41d4-a716-446655440050'
        },
        {
          id: '550e8400-e29b-41d4-a716-446655440053',
          name: 'Clothing',
          description: 'Fashion and clothing items'
        },
        {
          id: '550e8400-e29b-41d4-a716-446655440054',
          name: "Men's Clothing",
          description: "Men's apparel",
          parent_id: '550e8400-e29b-41d4-a716-446655440053'
        },
        {
          id: '550e8400-e29b-41d4-a716-446655440055',
          name: "Women's Clothing",
          description: "Women's apparel",
          parent_id: '550e8400-e29b-41d4-a716-446655440053'
        },
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
          category_id: '550e8400-e29b-41d4-a716-446655440051',
          is_approved: true,
          rating: 4.5,
        },
        {
          id: '550e8400-e29b-41d4-a716-446655440063',
          name: 'Samsung Galaxy S24 Ultra',
          description: 'Flagship Android phone with powerful performance and S Pen',
          price: 1099.99,
          stock: 45,
          seller_id: '550e8400-e29b-41d4-a716-446655440030',
          category_id: '550e8400-e29b-41d4-a716-446655440051',
          is_approved: true,
          rating: 4.6,
        },
        {
          id: '550e8400-e29b-41d4-a716-446655440061',
          name: 'MacBook Pro 16',
          description: 'High-performance laptop for professionals with M3 chip',
          price: 2499.99,
          stock: 25,
          seller_id: '550e8400-e29b-41d4-a716-446655440030',
          category_id: '550e8400-e29b-41d4-a716-446655440052',
          is_approved: true,
          rating: 4.8,
        },
        {
          id: '550e8400-e29b-41d4-a716-446655440064',
          name: 'Dell XPS 13',
          description: 'Compact and powerful ultrabook for daily use',
          price: 1399.99,
          stock: 30,
          seller_id: '550e8400-e29b-41d4-a716-446655440030',
          category_id: '550e8400-e29b-41d4-a716-446655440052',
          is_approved: true,
          rating: 4.4,
        },
        {
          id: '550e8400-e29b-41d4-a716-446655440062',
          name: 'Premium T-Shirt',
          description: 'Comfortable premium cotton t-shirt',
          price: 29.99,
          stock: 100,
          seller_id: '550e8400-e29b-41d4-a716-446655440031',
          category_id: '550e8400-e29b-41d4-a716-446655440054',
          is_approved: true,
          rating: 4.2,
        },
        {
          id: '550e8400-e29b-41d4-a716-446655440065',
          name: 'Gaming Mouse RGB',
          description: 'Ergonomic gaming mouse with customizable RGB lighting',
          price: 49.99,
          stock: 150,
          seller_id: '550e8400-e29b-41d4-a716-446655440031',
          category_id: '550e8400-e29b-41d4-a716-446655440050',
          is_approved: true,
          rating: 4.7,
        },
        {
          id: '550e8400-e29b-41d4-a716-446655440066',
          name: 'Leather Wallet',
          description: 'Genuine leather wallet with RFID protection',
          price: 39.99,
          stock: 75,
          seller_id: '550e8400-e29b-41d4-a716-446655440031',
          category_id: '550e8400-e29b-41d4-a716-446655440054',
          is_approved: true,
          rating: 4.3,
        },
        {
          id: '550e8400-e29b-41d4-a716-446655440067',
          name: 'Noise Cancelling Headphones',
          description: 'Over-ear headphones with active noise cancellation',
          price: 199.99,
          stock: 60,
          seller_id: '550e8400-e29b-41d4-a716-446655440031',
          category_id: '550e8400-e29b-41d4-a716-446655440050',
          is_approved: true,
          rating: 4.6,
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
          product_id: '550e8400-e29b-41d4-a716-446655440060',
          path: 'https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?w=600&h=600&fit=crop',
          size: 1024000,
          format: 'jpg',
          is_main: true,
        },
        {
          id: '550e8400-e29b-41d4-a716-446655440071',
          product_id: '550e8400-e29b-41d4-a716-446655440060',
          path: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600&h=600&fit=crop',
          size: 812000,
          format: 'jpg',
          is_main: false,
        },
        // MacBook Pro images
        {
          id: '550e8400-e29b-41d4-a716-446655440072',
          product_id: '550e8400-e29b-41d4-a716-446655440061',
          path: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=600&h=600&fit=crop',
          size: 1536000,
          format: 'jpg',
          is_main: true,
        },
        // Samsung Galaxy images
        {
          id: '550e8400-e29b-41d4-a716-446655440073',
          product_id: '550e8400-e29b-41d4-a716-446655440063',
          path: 'https://images.unsplash.com/photo-1565849904461-04a58ad377e0?w=600&h=600&fit=crop',
          size: 924000,
          format: 'jpg',
          is_main: true,
        },
        // More product images
        {
          id: '550e8400-e29b-41d4-a716-446655440074',
          product_id: '550e8400-e29b-41d4-a716-446655440062',
          path: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600&h=600&fit=crop',
          size: 512000,
          format: 'jpg',
          is_main: true,
        },
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