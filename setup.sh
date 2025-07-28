#!/bin/bash

echo "🚀 B2C E-commerce Payment Setup Başlıyor..."

# Renk kodları
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Node.js kontrol
echo -e "${YELLOW}📋 Node.js kontrol ediliyor...${NC}"
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js bulunamadı. Lütfen Node.js 18+ yükleyin.${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Node.js $(node -v) bulundu${NC}"

# Docker kontrol
echo -e "${YELLOW}🐳 Docker kontrol ediliyor...${NC}"
if ! command -v docker &> /dev/null; then
    echo -e "${RED}❌ Docker bulunamadı. Lütfen Docker yükleyin.${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Docker bulundu${NC}"

# Dependencies yükle
echo -e "${YELLOW}📦 Dependencies yükleniyor...${NC}"
npm install
echo -e "${GREEN}✅ Dependencies yüklendi${NC}"

# .env dosyası oluştur
echo -e "${YELLOW}⚙️ Environment dosyası hazırlanıyor...${NC}"
if [ ! -f .env ]; then
    cp .env.example .env
    echo -e "${GREEN}✅ .env dosyası oluşturuldu${NC}"
    echo -e "${YELLOW}⚠️ Lütfen .env dosyasındaki Stripe key'lerini güncelleyin!${NC}"
else
    echo -e "${GREEN}✅ .env dosyası zaten mevcut${NC}"
fi

# Docker servisleri başlat
echo -e "${YELLOW}🐳 Docker servisleri başlatılıyor...${NC}"
docker-compose up -d
echo -e "${GREEN}✅ Docker servisleri başlatıldı${NC}"

# Prisma kurulumu
echo -e "${YELLOW}🗄️ Veritabanı hazırlanıyor...${NC}"
npx prisma generate
npx prisma db push
echo -e "${GREEN}✅ Veritabanı hazırlandı${NC}"

echo ""
echo -e "${GREEN}🎉 Kurulum tamamlandı!${NC}"
echo ""
echo -e "${YELLOW}📍 Sonraki adımlar:${NC}"
echo -e "1. .env dosyasındaki Stripe key'lerini güncelleyin"
echo -e "2. Development server'ı başlatın: ${GREEN}npm run dev${NC}"
echo -e "3. Tarayıcıda açın: ${GREEN}http://localhost:3000${NC}"
echo ""
echo -e "${YELLOW}🔧 Servisler:${NC}"
echo -e "- 🌐 App: http://localhost:3000"
echo -e "- 🗄️ pgAdmin: http://localhost:8080"
echo -e "- 📊 Prisma Studio: npx prisma studio"
echo ""
echo -e "${YELLOW}💳 Test Payment:${NC}"
echo -e "- 💳 Stripe: http://localhost:3000/checkout"
echo -e "- 🔐 PayThor: http://localhost:3000/paythor-login"
