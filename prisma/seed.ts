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
      name: 'Test Ürünü',
      description: 'Kaliteli bir ürün',
      price: 999.99,
      stock: 50,
      sellerId: user.id,
      categoryId: category.id,
      isApproved: true,
    },
  });

  // Sepet oluştur
  await prisma.cart.create({
    data: {
      customerId: customer.id,
      items: {
        create: [
          {
            productId: product.id,
            quantity: 2,
            unitPrice: product.price,
          },
        ],
      },
    },
  });

  // Sipariş oluştur
  const order = await prisma.order.create({
    data: {
      customerId: customer.id,
      totalAmount: product.price,
      shippingAddressId: address.id,
      billingAddressId: address.id,
      orderItems: {
        create: [{
          productId: product.id,
          quantity: 1,
          unitPrice: product.price,
          totalPrice: product.price,
        }],
      },
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
