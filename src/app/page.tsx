import Link from 'next/link'
import { ShoppingCart, CreditCard, Shield, Truck } from 'lucide-react'

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <Link href="/" className="text-2xl font-bold text-gray-900">
              B2C Store
            </Link>
            <Link
              href="/cart"
              className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ShoppingCart className="h-6 w-6 mr-2" />
              Sepet
            </Link>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-16">
        
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            B2C E-Commerce Store
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Modern, güvenli ve hızlı alışveriş deneyimi
          </p>
        </div>

        {/* Call to Action */}
        <div className="text-center bg-white rounded-lg shadow-lg p-8 mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Alışverişe Başlayın
          </h2>
          <p className="text-gray-600 mb-6">
            Sepete ürün ekleyin ve gelişmiş ödeme sistemimizi test edin.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/cart"
              className="bg-blue-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center justify-center"
            >
              <ShoppingCart className="mr-2 h-5 w-5" />
              Sepet
            </Link>
            
            <Link
              href="/checkout"
              className="bg-green-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-green-700 transition-colors flex items-center justify-center"
            >
              <CreditCard className="mr-2 h-5 w-5" />
              Demo Checkout
            </Link>
            
            <Link
              href="/paythor-login"
              className="bg-purple-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-purple-700 transition-colors flex items-center justify-center"
            >
              <Shield className="mr-2 h-5 w-5" />
              PayThor Giriş
            </Link>
          </div>
        </div>

        {/* Additional Info */}
        <div className="text-center bg-white rounded-lg shadow-sm p-6 mb-12">
          <h3 className="text-lg font-semibold mb-3">PayThor API Test Bilgileri</h3>
          <div className="text-sm text-gray-600 space-y-1">
            <div><strong>E-posta:</strong> f.rizaergin@eticsoft.com</div>
            <div><strong>Şifre:</strong> 12345678Aa.</div>
            <div><strong>API Endpoint:</strong> https://api.paythor.com/auth/signin</div>
          </div>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Shield className="h-8 w-8 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Güvenli Ödeme</h3>
            <p className="text-gray-600">Stripe ve PayThor ile güvenli ödeme altyapısı</p>
          </div>
          
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Truck className="h-8 w-8 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Hızlı Teslimat</h3>
            <p className="text-gray-600">1-3 gün içinde kapınızda</p>
          </div>
          
          <div className="text-center">
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CreditCard className="h-8 w-8 text-purple-600" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Kolay Ödeme</h3>
            <p className="text-gray-600">Kredi kartı ve alternatif ödeme yöntemleri</p>
          </div>
        </div>
      </div>
    </div>
  )
}
