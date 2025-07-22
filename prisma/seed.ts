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
          email: 'seller1@example.com', 
          password: '$2b$10$hashedpassword', 
          first_name: 'Seller', 
          last_name: 'Account1', 
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
        }
      ],
      skipDuplicates: true,
    });

    console.log('🏪 Creating seller profile...');
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
          description: 'Laptop computers and accessories', 
          parent_id: '550e8400-e29b-41d4-a716-446655440050' 
        },
        { 
          id: '550e8400-e29b-41d4-a716-446655440053', 
          name: 'Clothing', 
          description: 'Apparel and fashion items' 
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
          description: 'Latest iPhone with advanced features',
          price: 999.99,
          stock: 50,
          seller_id: '550e8400-e29b-41d4-a716-446655440030', // Seller Profile ID
          category_id: '550e8400-e29b-41d4-a716-446655440051',
          is_approved: true,
          rating: 4.5,
        },
        
        {
          id: '550e8400-e29b-41d4-a716-446655440063',
          name: 'Samsung Galaxy S24 Ultra',
          description: 'Flagship Android phone with powerful performance',
          price: 1099.99,
          stock: 45,
          seller_id: '550e8400-e29b-41d4-a716-446655440030',
          category_id: '550e8400-e29b-41d4-a716-446655440051',
          is_approved: true,
          rating: 4.6,
        },
        {
          id: '550e8400-e29b-41d4-a716-446655440061',
          name: 'MacBook Pro 16"',
          description: 'High-performance laptop for professionals',
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
          description: 'Comfortable cotton t-shirt',
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
          description: 'Ergonomic mouse with customizable lighting',
          price: 49.99,
          stock: 150,
          seller_id: '550e8400-e29b-41d4-a716-446655440031',
          category_id: '550e8400-e29b-41d4-a716-446655440053',
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
          category_id: '550e8400-e29b-41d4-a716-446655440053',
         is_approved: true,
         rating: 4.6,
        },
      ],
      skipDuplicates: true,
    });

    // 6. Create images
    console.log('🖼️ Creating product images...');
    await prisma.image.createMany({
      data: [
        {
          id: '550e8400-e29b-41d4-a716-446655440070',
          product_id: '550e8400-e29b-41d4-a716-446655440060', // Product ID
          path: 'https://example.com/iphone15pro_main.jpg',
          size: 1024000,
          format: 'jpg',
          is_main: true,
        },
        {
          id: '550e8400-e29b-41d4-a716-446655440071',
          product_id: '550e8400-e29b-41d4-a716-446655440060',
          path: 'https://example.com/iphone15pro_side.jpg',
          size: 812000,
          format: 'jpg',
          is_main: false,
        },
        {
          id: '550e8400-e29b-41d4-a716-446655440072',
          product_id: '550e8400-e29b-41d4-a716-446655440061',
          path: 'https://example.com/macbookpro_main.jpg',
          size: 1536000,
          format: 'jpg',
          is_main: true,
        },
      ],
      skipDuplicates: true,
    });

    // 7. Create carts for customers
    console.log('🛒 Creating shopping carts...');
    await prisma.cart.createMany({
      data: [
        { 
          id: '550e8400-e29b-41d4-a716-446655440080', 
          customer_id: '550e8400-e29b-41d4-a716-446655440040', // Customer Profile ID
          total_amount: 1029.98 
        },
        { 
          id: '550e8400-e29b-41d4-a716-446655440081', 
          customer_id: '550e8400-e29b-41d4-a716-446655440041',
          total_amount: 0.0 
        },
      ],
      skipDuplicates: true,
    });

    // 8. Create cart items
    console.log('🛍️ Creating cart items...');
    await prisma.cartItem.createMany({
      data: [
        {
          id: '550e8400-e29b-41d4-a716-446655440090',
          cart_id: '550e8400-e29b-41d4-a716-446655440080', // Cart ID
          product_id: '550e8400-e29b-41d4-a716-446655440060',
          quantity: 1,
          unit_price: 999.99,
        },
        {
          id: '550e8400-e29b-41d4-a716-446655440091',
          cart_id: '550e8400-e29b-41d4-a716-446655440080',
          product_id: '550e8400-e29b-41d4-a716-446655440062',
          quantity: 1,
          unit_price: 29.99,
        },
      ],
      skipDuplicates: true,
    });

    // 9. Create orders
    console.log('📋 Creating orders...');
    await prisma.order.create({
      data: {
        id: '550e8400-e29b-41d4-a716-446655440100',
        customer_id: '550e8400-e29b-41d4-a716-446655440041', // Customer Profile ID
        total_amount: 2499.99,
        status: 'DELIVERED',
        shipping_address_id: '550e8400-e29b-41d4-a716-446655440021',
        billing_address_id: '550e8400-e29b-41d4-a716-446655440021',
      },
    });

    // 10. Create order items
    console.log('📦 Creating order items...');
    await prisma.orderItem.create({
      data: {
        id: '550e8400-e29b-41d4-a716-446655440110',
        order_id: '550e8400-e29b-41d4-a716-446655440100',
        product_id: '550e8400-e29b-41d4-a716-446655440061',
        quantity: 1,
        unit_price: 2499.99,
        total_price: 2499.99,
      },
    });

    // 11. Create payments
    console.log('💳 Creating payments...');
    await prisma.payment.create({
      data: {
        id: '550e8400-e29b-41d4-a716-446655440120',
        order_id: '550e8400-e29b-41d4-a716-446655440100',
        amount: 2499.99,
        method: 'STRIPE',
        status: 'COMPLETED',
        transaction_id: 'txn_1234567890',
      },
    });

    // 12. Create reviews
    console.log('⭐ Creating reviews...');
    await prisma.review.create({
      data: {
        id: '550e8400-e29b-41d4-a716-446655440130',
        product_id: '550e8400-e29b-41d4-a716-446655440061',
        customer_id: '550e8400-e29b-41d4-a716-446655440041', // Customer Profile ID
        order_id: '550e8400-e29b-41d4-a716-446655440100',
        rating: 5,
        title: 'Excellent laptop!',
        comment: 'Amazing performance and build quality. Perfect for professional work.',
        pros: ['Fast performance', 'Great display', 'Excellent build quality'],
        cons: ['Expensive', 'Heavy'],
        is_verified: true,
        is_approved: true,
        helpful_count: 15,
      },
    });

    // 13. Create shipping
    console.log('🚚 Creating shipping records...');
    await prisma.shipping.create({
      data: {
        id: '550e8400-e29b-41d4-a716-446655440140',
        order_id: '550e8400-e29b-41d4-a716-446655440100',
        customer_id: '550e8400-e29b-41d4-a716-446655440041', // Customer Profile ID
        seller_id: '550e8400-e29b-41d4-a716-446655440030', // Seller Profile ID
        shipping_address_id: '550e8400-e29b-41d4-a716-446655440021',
        tracking_number: 'TRK123456789',
        carrier: 'FedEx',
        shipping_date: new Date(),
        estimated_delivery_date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
        actual_delivery_date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
        shipping_cost: 15.5,
        status: 'DELIVERED',
        last_status_update: new Date(),
      },
    });

    console.log('✅ Database seeding completed successfully!');
    
    // Log summary
    const userCount = await prisma.user.count();
    const productCount = await prisma.product.count();
    const orderCount = await prisma.order.count();
    
    console.log(`📊 Summary: ${userCount} users, ${productCount} products, ${orderCount} orders created`);

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