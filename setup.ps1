# B2C E-commerce Payment Setup Script for Windows
Write-Host "🚀 B2C E-commerce Payment Setup Başlıyor..." -ForegroundColor Green

# Node.js kontrol
Write-Host "📋 Node.js kontrol ediliyor..." -ForegroundColor Yellow
try {
    $nodeVersion = node --version
    Write-Host "✅ Node.js $nodeVersion bulundu" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js bulunamadı. Lütfen Node.js 18+ yükleyin." -ForegroundColor Red
    exit 1
}

# Docker kontrol
Write-Host "🐳 Docker kontrol ediliyor..." -ForegroundColor Yellow
try {
    docker --version | Out-Null
    Write-Host "✅ Docker bulundu" -ForegroundColor Green
} catch {
    Write-Host "❌ Docker bulunamadı. Lütfen Docker Desktop yükleyin." -ForegroundColor Red
    exit 1
}

# Dependencies yükle
Write-Host "📦 Dependencies yükleniyor..." -ForegroundColor Yellow
npm install
Write-Host "✅ Dependencies yüklendi" -ForegroundColor Green

# .env dosyası oluştur
Write-Host "⚙️ Environment dosyası hazırlanıyor..." -ForegroundColor Yellow
if (!(Test-Path .env)) {
    Copy-Item .env.example .env
    Write-Host "✅ .env dosyası oluşturuldu" -ForegroundColor Green
    Write-Host "⚠️ Lütfen .env dosyasındaki Stripe key'lerini güncelleyin!" -ForegroundColor Yellow
} else {
    Write-Host "✅ .env dosyası zaten mevcut" -ForegroundColor Green
}

# Docker servisleri başlat
Write-Host "🐳 Docker servisleri başlatılıyor..." -ForegroundColor Yellow
docker-compose up -d
Write-Host "✅ Docker servisleri başlatıldı" -ForegroundColor Green

# Prisma kurulumu
Write-Host "🗄️ Veritabanı hazırlanıyor..." -ForegroundColor Yellow
npx prisma generate
npx prisma db push
Write-Host "✅ Veritabanı hazırlandı" -ForegroundColor Green

Write-Host ""
Write-Host "🎉 Kurulum tamamlandı!" -ForegroundColor Green
Write-Host ""
Write-Host "📍 Sonraki adımlar:" -ForegroundColor Yellow
Write-Host "1. .env dosyasındaki Stripe key'lerini güncelleyin"
Write-Host "2. Development server'ı başlatın: " -NoNewline; Write-Host "npm run dev" -ForegroundColor Green
Write-Host "3. Tarayıcıda açın: " -NoNewline; Write-Host "http://localhost:3000" -ForegroundColor Green
Write-Host ""
Write-Host "🔧 Servisler:" -ForegroundColor Yellow
Write-Host "- 🌐 App: http://localhost:3000"
Write-Host "- 🗄️ pgAdmin: http://localhost:8080"
Write-Host "- 📊 Prisma Studio: npx prisma studio"
Write-Host ""
Write-Host "💳 Test Payment:" -ForegroundColor Yellow
Write-Host "- 💳 Stripe: http://localhost:3000/checkout"
Write-Host "- 🔐 PayThor: http://localhost:3000/paythor-login"
