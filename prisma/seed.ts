import { PrismaClient } from '@prisma/client';
import { faker, tr } from '@faker-js/faker';

const prisma = new PrismaClient();

async function main() {
  // Kullanıcı oluştur
  const user = await prisma.user.create({
    data: {
      email: faker.internet.email(),
      password: faker.internet.password(),
      firstName: faker.name.firstName(),
      lastName: faker.name.lastName(),
      phone: faker.phone.number(),
    },
  });

  // Admin oluştur
  const admin = await prisma.admin.create({
    data: {
      userId: user.id,
      permissions: ['MANAGE_PRODUCTS', 'VIEW_USERS'],
      lastLogin: new Date(),
    },
  });

  // Müşteri oluştur
  const customer = await prisma.customer.create({
    data: {
      userId: user.id,
    },
  });

  // Adres oluştur
  const address = await prisma.address.create({
    data: {
      userId: user.id,
      title: 'Ev',
      firstName: user.firstName,
      lastName: user.lastName,
      addressLine1: faker.location.streetAddress(),
      city: faker.location.city(),
      state: faker.location.state(),
      postalCode: faker.location.zipCode(),
      country: faker.location.country(),
    },
  });

  // Kategori oluştur
  const category = await prisma.category.create({
    data: {
      name: 'Elektronik',
      description: 'Elektronik ürünler',
    },
  });

  // Ürün oluştur
  const product = await prisma.product.create({
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

  // Sepet oluştur
  await prisma.cart.create({
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

  // Sipariş oluştur
  const order = await prisma.order.create({
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

  // Ödeme
  await prisma.payment.create({
    data: {
      orderId: order.id,
      amount: product.price,
      method: 'CREDIT_CARD',
    },
  });

  // Yorum
  await prisma.review.create({
    data: {
      customerId: customer.id,
      productId: product.id,
      orderId: order.id,
      rating: 5,
      pros: ['Kaliteli', 'Hızlı kargo'],
      cons: [],
      comment: 'Çok memnun kaldım!',
      isVerified: true,
      isApproved: true,
    },
  });

  // Business
  const business = await prisma.business.create({
    data: {
      businessName: 'Test İşletmesi',
      isVerified: true,  
    },
  });

  // Kargo
  await prisma.shipping.create({
    data: {
      orderId: order.id,
      customerId: customer.id,
      sellerId: business.id,
      shippingAddressId: address.id,
      carrier: 'Yurtiçi Kargo',
      shippingCost: 49.99,
    },
  });

  console.log('Seed işlemi başarıyla tamamlandı.');
}

main()
  .catch((e) => {
    console.error('Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
