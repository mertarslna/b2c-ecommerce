import Link from 'next/link'

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50">
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
            Ödeme Sistemini Test Edin
          </h2>
          <p className="text-gray-600 mb-6">
            Gelişmiş ödeme sistemimizi test etmek için demo ürünlerle checkout sürecini deneyebilirsiniz.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/checkout"
              className="bg-blue-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              🛒 Checkout Sayfası
            </Link>
            
            <Link
              href="/test-payment"
              className="bg-green-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-green-700 transition-colors"
            >
              🧪 Test Payment
            </Link>
          </div>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">🔒</span>
            </div>
            <h3 className="text-lg font-semibold mb-2">Güvenli Ödeme</h3>
            <p className="text-gray-600">Stripe ve PayThor ile güvenli ödeme altyapısı</p>
          </div>
          
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">⚡</span>
            </div>
            <h3 className="text-lg font-semibold mb-2">Hızlı İşlem</h3>
            <p className="text-gray-600">Optimize edilmiş checkout süreci</p>
          </div>
          
          <div className="text-center">
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">🌟</span>
            </div>
            <h3 className="text-lg font-semibold mb-2">Modern Tasarım</h3>
            <p className="text-gray-600">Kullanıcı dostu arayüz ve deneyim</p>
          </div>
        </div>
      </div>
    </div>
  )
}
