# 🛒 B2C E-commerce Payment Entegrasyonu

## 📋 Sistem Gereksinimleri
- Node.js 18+
- Docker & Docker Compose
- Git

## 🚀 Kurulum Adımları

### 1. Projeyi İndir
```bash
git clone https://github.com/mertarslna/b2c-ecommerce.git
cd b2c-ecommerce
git checkout payment
```

### 2. Dependencies Yükle
```bash
npm install
```

### 3. Environment Dosyalarını Ayarla

#### `.env` Dosyası Oluştur (Ana Konfigürasyon)
```bash
cp .env.example .env
```

`.env` dosyasını düzenle:
```env
DATABASE_URL="postgresql://postgres:postgres_password@localhost:5432/ecommerce_db"
POSTGRES_DB=ecommerce_db
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres_password

# Stripe Konfigürasyonu (Gerçek değerleri gir)
STRIPE_SECRET_KEY=sk_test_51your_real_stripe_secret_key_here
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_51your_real_stripe_publishable_key_here

# JWT ve Auth
NEXTAUTH_SECRET=your-super-secret-jwt-key-here
JWT_SECRET=your-jwt-secret-here

# Redis
REDIS_URL="redis://localhost:6379"

# App Config
NODE_ENV=development
PORT=3000
NEXTAUTH_URL=http://localhost:3000
```

### 4. Docker Servisleri Başlat
```bash
# PostgreSQL, Redis, pgAdmin başlat
docker-compose up -d
```

### 5. Veritabanı Kurulumu
```bash
# Prisma schema'yı apply et
npx prisma generate
npx prisma db push

# Seed data'yı yükle (opsiyonel)
npx prisma db seed
```

### 6. Development Server'ı Başlat
```bash
npm run dev
```

## 🎯 Payment Sistemleri

### Stripe Entegrasyonu
1. [Stripe Dashboard](https://dashboard.stripe.com/)'da hesap oluştur
2. API key'lerini `.env` dosyasına ekle
3. Test: `http://localhost:3000/checkout`

### PayThor Entegrasyonu
1. PayThor hesabı oluştur
2. Giriş yap: `http://localhost:3000/paythor-login`
3. Test: `http://localhost:3000/checkout-paythor`

## 🔧 Veritabanı Erişimi

### pgAdmin (Web Interface)
- URL: `http://localhost:8080`
- Email: `admin@ecommerce.com`
- Password: `admin_password`

### Prisma Studio
```bash
npx prisma studio
```

## 🧪 Test Kart Bilgileri

### Stripe Test Cards
- **Başarılı:** 4242 4242 4242 4242
- **Declined:** 4000 0000 0000 0002
- **CVV:** 123, **Tarih:** 12/25

### PayThor Test
- PayThor login sayfasında test hesabı ile giriş yapın
- Debug console loglarını takip edin

## 🐛 Debug & Troubleshooting

### Token Sorunları
- Browser console'da PayThor debug loglarını kontrol edin
- `localStorage.getItem('paythor_token')` ile token'ı kontrol edin

### Database Sorunları
```bash
# Prisma reset
npx prisma migrate reset
npx prisma db push
```

### Docker Sorunları
```bash
# Container'ları yeniden başlat
docker-compose down
docker-compose up -d
```

## 📂 Önemli Dosyalar

### Payment Routes
- `/src/app/checkout/` - Stripe checkout
- `/src/app/checkout-paythor/` - PayThor checkout
- `/src/app/paythor-login/` - PayThor authentication

### API Routes
- `/src/app/api/stripe/` - Stripe API endpoints
- `/src/app/api/paythor/` - PayThor API endpoints

### Services
- `/src/lib/paythor-auth-direct.ts` - PayThor authentication
- `/src/lib/paythor-api.ts` - PayThor API client
- `/src/lib/services/payment.service.ts` - Payment utilities

## 🚀 Production Deployment

1. Environment variables'ları production'a ayarla
2. Database migrations'ları çalıştır
3. Static build oluştur: `npm run build`
4. Server'ı başlat: `npm start`

## 📞 Destek
Sorun durumunda:
1. Console error loglarını kontrol edin
2. Network tab'da API call'ları inceleyin
3. Database bağlantısını test edin
