import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // Clean database first (optional)
  console.log('🧹 Cleaning existing data...');
  await prisma.review.deleteMany({});
  await prisma.payment.deleteMany({});
  await prisma.orderItem.deleteMany({});
  await prisma.order.deleteMany({});
  await prisma.cartItem.deleteMany({});
  await prisma.cart.deleteMany({});
  await prisma.image.deleteMany({});
  await prisma.product.deleteMany({});
  await prisma.category.deleteMany({});
  await prisma.customer.deleteMany({});
  await prisma.business.deleteMany({});
  await prisma.address.deleteMany({});
  await prisma.admin.deleteMany({});
  await prisma.user.deleteMany({});

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
  const johnCustomer = await prisma.customer.upsert({
    where: { userId: johnDoe.id },
    update: {
      loyaltyPoints: 100,
    },
    create: {
      userId: johnDoe.id,
      wishlist: [],
      loyaltyPoints: 100,
    },
  });

  const janeCustomer = await prisma.customer.upsert({
    where: { userId: janeSmith.id },
    update: {
      loyaltyPoints: 250,
    },
    create: {
      userId: janeSmith.id,
      wishlist: [],
      loyaltyPoints: 250,
    },
  });

  // باقي الكود كما هو...
  // Create Categories
  console.log('📁 Creating categories...');
  const electronicsCategory = await prisma.category.create({
    data: {
      name: 'Electronics',
      description: 'Electronic devices and gadgets',
    },
  });

  // ... باقي الكود كما هو في الملف الأصلي

  console.log('✅ Database seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });