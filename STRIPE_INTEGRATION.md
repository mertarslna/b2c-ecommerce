# Stripe Payment Integration Guide

Bu proje Stripe'ın resmi dökümanlarına göre güncellenmiş modern bir ödeme sistemi içerir.

## 🚀 Yeni Özellikler

### Stripe Checkout Sessions (Önerilen)
- Stripe'ın hosted checkout sayfası
- Otomatik güvenlik ve uyumluluk
- Çoklu ödeme yöntemi desteği
- Mobil optimize edilmiş

### PaymentIntent API (Özel UI için)
- Tam kontrol edilebilir ödeme deneyimi
- Özel tasarım freedom
- Gelişmiş hata yönetimi

### Webhook Handling
- Otomatik ödeme durumu güncellemeleri
- Güvenli event handling
- Async işlem desteği

## 🛠️ Kurulum

1. Environment variables'ları ayarlayın:
```bash
cp .env.example .env.local
```

2. Stripe keys'lerini `.env.local` dosyasına ekleyin:
```bash
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

3. Dependencies yükleyin:
```bash
npm install
```

4. Development server'ı başlatın:
```bash
npm run dev
```

## 💳 Stripe Test Kartları

Stripe'ın resmi test kartları:

| Kart Numarası | Sonuç |
|---------------|-------|
| 4242 4242 4242 4242 | Başarılı ödeme |
| 4000 0000 0000 9995 | Yetersiz bakiye |
| 4000 0000 0000 9987 | Çalınmış kart |
| 4000 0000 0000 0069 | Süresi dolmuş kart |

- Herhangi bir gelecek tarih (MM/YY format)
- Herhangi bir 3 haneli CVC
- Herhangi bir 5 haneli posta kodu

## 🔧 API Endpoints

### Stripe Checkout Session
```typescript
POST /api/stripe/create-checkout-session
{
  "orderId": "order_123",
  "customerEmail": "customer@example.com",
  "items": [
    {
      "name": "Product Name",
      "description": "Product Description",
      "price": 2000, // 20.00 TRY in cents
      "quantity": 1
    }
  ]
}
```

### PaymentIntent
```typescript
POST /api/stripe/payment-intent
{
  "amount": 2000, // 20.00 TRY in cents
  "currency": "try",
  "customerEmail": "customer@example.com"
}
```

### Webhook Handler
```typescript
POST /api/stripe/webhook
// Stripe webhook events için
```

## 📄 Sayfalar

1. **Checkout Page** (`/checkout-new`) - Yeni Stripe Checkout Sessions ile
2. **Payment Success** (`/payment/success`) - Stripe webhook ile güncellenen
3. **PayThor Integration** (`/payment/paythor`) - Türk bankacılık sistemi

## 🔒 Güvenlik

- Server-side validation
- CSRF protection
- Webhook signature verification
- Secure environment variables

## 📝 Best Practices

1. **Checkout Sessions kullanın** - Stripe'ın önerdiği yöntem
2. **Webhook'ları implement edin** - Async events için
3. **Test mode'da test edin** - Production'a geçmeden önce
4. **Error handling** - Tüm edge case'leri düşünün
5. **Customer data protection** - GDPR/KVKK uyumluluğu

## 🔄 Webhook Setup

1. Stripe Dashboard'da webhook endpoint ekleyin:
   `https://yourdomain.com/api/stripe/webhook`

2. Bu events'leri seçin:
   - `checkout.session.completed`
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`

3. Webhook secret'ı `.env.local`'a ekleyin

## 🐛 Troubleshooting

### Webhook Issues
- Webhook URL'nin erişilebilir olduğundan emin olun
- ngrok kullanarak local development test edin
- Webhook signature verification'ı kontrol edin

### CORS Issues
- `NEXT_PUBLIC_SITE_URL` environment variable'ının doğru olduğundan emin olun
- Stripe dashboard'da domain'lerin doğru olduğunu kontrol edin

### Payment Failures
- Test kartlarını doğru kullandığınızdan emin olun
- Amount minimumlarını kontrol edin (TRY için 50 kuruş)
- Browser console'da error mesajlarını inceleyin

## 📚 Dokümantasyon

- [Stripe Payments Documentation](https://docs.stripe.com/payments)
- [Stripe Checkout Sessions](https://docs.stripe.com/payments/checkout)
- [Stripe PaymentIntents](https://docs.stripe.com/payments/payment-intents)
- [Stripe Webhooks](https://docs.stripe.com/webhooks)

## 🔄 Migration Notes

Eski PaymentIntent tabanlı sistemden yeni Checkout Sessions'a geçiş:

1. Yeni `/checkout-new` sayfasını kullanın
2. Webhook handler'ları test edin
3. Success page URL'lerini güncelleyin
4. Error handling'i kontrol edin

## 🌟 Özelliklerin Karşılaştırması

| Özellik | Checkout Sessions | PaymentIntent |
|---------|------------------|---------------|
| Güvenlik | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| Kolay Kurulum | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ |
| Customization | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| Mobil Uyumluluk | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| Maintenance | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ |

**Önerilen:** Çoğu use case için Checkout Sessions kullanın.
