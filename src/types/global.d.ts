// Özel tip tanımları ve global değişkenler
declare global {
  // PayThor için özel global tipler
  interface Window {
    PayThor?: any
  }
  
  // Çevre değişkenleri için tip tanımları
  namespace NodeJS {
    interface ProcessEnv {
      PAYTHOR_API_KEY: string
      PAYTHOR_API_SECRET: string
      PAYTHOR_BASE_URL: string
      PAYTHOR_TEST_MODE: string
      PAYTHOR_EMAIL: string
      PAYTHOR_PASSWORD: string
      STRIPE_SECRET_KEY: string
      STRIPE_PUBLISHABLE_KEY: string
      NEXTAUTH_URL: string
      DATABASE_URL: string
    }
  }
}

export {}
