import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // Hash passwords
  const hashedPassword = await bcrypt.hash('admin123', 12);
  const userPassword = await bcrypt.hash('user123', 12);

  // Create Users
  console.log('👤 Creating users...');
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@ecommerce.com' },
    update: {},
    create: {
      email: 'admin@ecommerce.com',
      password: hashedPassword,
      firstName: 'Admin',
      lastName: 'User',
      phone: '+1234567890',
      isActive: true,
    },
  });

  const johnDoe = await prisma.user.upsert({
    where: { email: 'john.doe@example.com' },
    update: {},
    create: {
      email: 'john.doe@example.com',
      password: userPassword,
      firstName: 'John',
      lastName: 'Doe',
      phone: '+1234567891',
      isActive: true,
    },
  });

  const janeSmith = await prisma.user.upsert({
    where: { email: 'jane.smith@example.com' },
    update: {},
    create: {
      email: 'jane.smith@example.com',
      password: userPassword,
      firstName: 'Jane',
      lastName: 'Smith',
      phone: '+1234567892',
      isActive: true,
    },
  });

  const sellerUser = await prisma.user.upsert({
    where: { email: 'seller@example.com' },
    update: {},
    create: {
      email: 'seller@example.com',
      password: userPassword,
      firstName: 'Seller',
      lastName: 'Account',
      phone: '+1234567893',
      isActive: true,
    },
  });

  // Create Admin
  console.log('👑 Creating admin...');
  await prisma.admin.upsert({
    where: { userId: adminUser.id },
    update: {},
    create: {
      userId: adminUser.id,
      permissions: ['manage_users', 'manage_products', 'manage_orders', 'view_analytics'],
      lastLogin: new Date(),
    },
  });

  // Create Addresses
  console.log('🏠 Creating addresses...');
  const johnAddress = await prisma.address.create({
    data: {
      userId: johnDoe.id,
      title: 'Home',
      firstName: 'John',
      lastName: 'Doe',
      addressLine1: '123 Main St',
      city: 'New York',
      state: 'NY',
      postalCode: '10001',
      country: 'USA',
      phone: '+1234567891',
      isDefault: true,
      type: 'HOME',
    },
  });

  const janeHomeAddress = await prisma.address.create({
    data: {
      userId: janeSmith.id,
      title: 'Home',
      firstName: 'Jane',
      lastName: 'Smith',
      addressLine1: '456 Oak Ave',
      city: 'Los Angeles',
      state: 'CA',
      postalCode: '90001',
      country: 'USA',
      phone: '+1234567892',
      isDefault: true,
      type: 'HOME',
    },
  });

  const janeWorkAddress = await prisma.address.create({
    data: {
      userId: janeSmith.id,
      title: 'Work',
      firstName: 'Jane',
      lastName: 'Smith',
      companyName: 'Tech Corp',
      addressLine1: '789 Business Blvd',
      city: 'Los Angeles',
      state: 'CA',
      postalCode: '90002',
      country: 'USA',
      phone: '+1234567892',
      isDefault: false,
      type: 'WORK',
    },
  });

  // Create Business
  console.log('🏢 Creating businesses...');
  await prisma.business.create({
    data: {
      businessName: 'Tech Solutions Inc',
      taxNumber: 'TAX123456789',
      isVerified: true,
      addressId: janeWorkAddress.id,
      userId: sellerUser.id,
    },
  });

  // Create Customers
  console.log('👥 Creating customers...');
  const johnCustomer = await prisma.customer.create({
    data: {
      userId: johnDoe.id,
      wishlist: [],
      loyaltyPoints: 100,
    },
  });

  const janeCustomer = await prisma.customer.create({
    data: {
      userId: janeSmith.id,
      wishlist: [],
      loyaltyPoints: 250,
    },
  });

  // Create Categories
  console.log('📁 Creating categories...');
  const electronicsCategory = await prisma.category.create({
    data: {
      name: 'Electronics',
      description: 'Electronic devices and gadgets',
    },
  });

  const smartphonesCategory = await prisma.category.create({
    data: {
      name: 'Smartphones',
      description: 'Mobile phones and accessories',
      parentId: electronicsCategory.id,
    },
  });

  const laptopsCategory = await prisma.category.create({
    data: {
      name: 'Laptops',
      description: 'Laptop computers and accessories',
      parentId: electronicsCategory.id,
    },
  });

  const clothingCategory = await prisma.category.create({
    data: {
      name: 'Clothing',
      description: 'Apparel and fashion items',
    },
  });

  const mensClothingCategory = await prisma.category.create({
    data: {
      name: "Men's Clothing",
      description: "Men's apparel",
      parentId: clothingCategory.id,
    },
  });

  const womensClothingCategory = await prisma.category.create({
    data: {
      name: "Women's Clothing",
      description: "Women's apparel",
      parentId: clothingCategory.id,
    },
  });

  // Create Products
  console.log('📱 Creating products...');
  const iphone = await prisma.product.create({
    data: {
      name: 'iPhone 15 Pro',
      description: 'Latest iPhone with advanced features and A17 Pro chip',
      price: 999.99,
      stock: 50,
      sellerId: sellerUser.id,
      categoryId: smartphonesCategory.id,
      isApproved: true,
      rating: 4.5,
    },
  });

  const macbook = await prisma.product.create({
    data: {
      name: 'MacBook Pro 16"',
      description: 'High-performance laptop for professionals with M3 Max chip',
      price: 2499.99,
      stock: 25,
      sellerId: sellerUser.id,
      categoryId: laptopsCategory.id,
      isApproved: true,
      rating: 4.8,
    },
  });

  const tshirt = await prisma.product.create({
    data: {
      name: 'Premium T-Shirt',
      description: 'Comfortable 100% cotton t-shirt with premium quality',
      price: 29.99,
      stock: 100,
      sellerId: sellerUser.id,
      categoryId: mensClothingCategory.id,
      isApproved: true,
      rating: 4.2,
    },
  });

  const dress = await prisma.product.create({
    data: {
      name: 'Summer Dress',
      description: 'Elegant summer dress perfect for any occasion',
      price: 79.99,
      stock: 30,
      sellerId: sellerUser.id,
      categoryId: womensClothingCategory.id,
      isApproved: true,
      rating: 4.6,
    },
  });

  // Create Images
  console.log('🖼️ Creating product images...');
  await prisma.image.createMany({
    data: [
      {
        productId: iphone.id,
        url: 'https://example.com/iphone15pro_main.jpg',
        alt: 'iPhone 15 Pro main image',
        size: 1024000,
        format: 'jpg',
        isMain: true,
        cloudinaryId: 'iphone15pro_main',
      },
      {
        productId: iphone.id,
        url: 'https://example.com/iphone15pro_side.jpg',
        alt: 'iPhone 15 Pro side view',
        size: 812000,
        format: 'jpg',
        isMain: false,
        cloudinaryId: 'iphone15pro_side',
      },
      {
        productId: macbook.id,
        url: 'https://example.com/macbookpro_main.jpg',
        alt: 'MacBook Pro main image',
        size: 1536000,
        format: 'jpg',
        isMain: true,
        cloudinaryId: 'macbookpro_main',
      },
    ],
  });

  // Create Carts
  console.log('🛒 Creating shopping carts...');
  const johnCart = await prisma.cart.create({
    data: {
      customerId: johnCustomer.id,
      totalAmount: 1029.98,
    },
  });

  const janeCart = await prisma.cart.create({
    data: {
      customerId: janeCustomer.id,
      totalAmount: 0.00,
    },
  });

  // Create Cart Items
  console.log('🛍️ Creating cart items...');
  await prisma.cartItem.createMany({
    data: [
      {
        cartId: johnCart.id,
        productId: iphone.id,
        quantity: 1,
        unitPrice: 999.99,
      },
      {
        cartId: johnCart.id,
        productId: tshirt.id,
        quantity: 1,
        unitPrice: 29.99,
      },
    ],
  });

  // Create Orders
  console.log('📦 Creating orders...');
  const janeOrder = await prisma.order.create({
    data: {
      customerId: janeCustomer.id,
      totalAmount: 2579.98,
      status: 'DELIVERED',
      shippingAddressId: janeHomeAddress.id,
      billingAddressId: janeHomeAddress.id,
    },
  });

  // Create Order Items
  console.log('📋 Creating order items...');
  await prisma.orderItem.create({
    data: {
      orderId: janeOrder.id,
      productId: macbook.id,
      quantity: 1,
      unitPrice: 2499.99,
      totalPrice: 2499.99,
    },
  });

  await prisma.orderItem.create({
    data: {
      orderId: janeOrder.id,
      productId: dress.id,
      quantity: 1,
      unitPrice: 79.99,
      totalPrice: 79.99,
    },
  });

  // Create Payments
  console.log('💳 Creating payments...');
  await prisma.payment.create({
    data: {
      orderId: janeOrder.id,
      amount: 2579.98,
      method: 'STRIPE',
      status: 'COMPLETED',
      transactionId: 'txn_1234567890',
    },
  });

  // Create Reviews
  console.log('⭐ Creating reviews...');
  await prisma.review.create({
    data: {
      productId: macbook.id,
      customerId: janeCustomer.id,
      orderId: janeOrder.id,
      rating: 5,
      title: 'Excellent laptop!',
      comment: 'Amazing performance and build quality. Perfect for professional work and creative tasks.',
      pros: ['Fast performance', 'Great display', 'Excellent build quality', 'Long battery life'],
      cons: ['Expensive', 'Heavy', 'Limited ports'],
      isVerified: true,
      isApproved: true,
      helpfulCount: 15,
    },
  });

  await prisma.review.create({
    data: {
      productId: dress.id,
      customerId: janeCustomer.id,
      orderId: janeOrder.id,
      rating: 5,
      title: 'Perfect summer dress!',
      comment: 'Love the fabric and fit. Great for summer events.',
      pros: ['Comfortable fabric', 'Great fit', 'Beautiful design'],
      cons: ['Size runs a bit small'],
      isVerified: true,
      isApproved: true,
      helpfulCount: 8,
    },
  });

  // Add more sample reviews
  await prisma.review.create({
    data: {
      productId: iphone.id,
      customerId: johnCustomer.id,
      rating: 4,
      title: 'Great phone with amazing camera',
      comment: 'The camera quality is outstanding, but battery life could be better.',
      pros: ['Excellent camera', 'Fast performance', 'Great display'],
      cons: ['Battery life', 'Price'],
      isVerified: false,
      isApproved: true,
      helpfulCount: 12,
    },
  });

  console.log('✅ Database seeding completed successfully!');
  console.log('📊 Created:');
  console.log('  - 4 Users (1 admin, 3 customers)');
  console.log('  - 1 Admin');
  console.log('  - 3 Addresses');
  console.log('  - 1 Business');
  console.log('  - 2 Customers');
  console.log('  - 6 Categories');
  console.log('  - 4 Products');
  console.log('  - 3 Product Images');
  console.log('  - 2 Shopping Carts');
  console.log('  - 2 Cart Items');
  console.log('  - 1 Order');
  console.log('  - 2 Order Items');
  console.log('  - 1 Payment');
  console.log('  - 3 Reviews');
  console.log('');
  console.log('🔐 Login credentials:');
  console.log('  Admin: admin@ecommerce.com / admin123');
  console.log('  User: john.doe@example.com / user123');
  console.log('  User: jane.smith@example.com / user123');
  console.log('  Seller: seller@example.com / user123');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });