import Link from 'next/link'

export default function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
      {/* Main Footer Content */}
      <div className="container mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="space-y-6">
            <div>
              <Link href="/" className="text-3xl font-bold bg-gradient-to-r from-pink-400 to-red-400 bg-clip-text text-transparent">
                REAL
              </Link>
              <p className="text-gray-300 mt-4 leading-relaxed">
                Your trusted marketplace for authentic products from verified sellers worldwide.
              </p>
            </div>
            
            {/* Social Media */}
            <div>
              <h4 className="text-lg font-semibold mb-4 text-pink-400">Follow Us</h4>
              <div className="flex space-x-4">
                <a href="#" className="p-3 bg-gradient-to-r from-pink-500 to-red-400 rounded-full hover:from-pink-600 hover:to-red-500 transition-all duration-300 transform hover:scale-110">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/>
                  </svg>
                </a>
                <a href="#" className="p-3 bg-gradient-to-r from-pink-500 to-red-400 rounded-full hover:from-pink-600 hover:to-red-500 transition-all duration-300 transform hover:scale-110">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M22.46 6c-.77.35-1.6.58-2.46.69.88-.53 1.56-1.37 1.88-2.38-.83.5-1.75.85-2.72 1.05C18.37 4.5 17.26 4 16 4c-2.35 0-4.27 1.92-4.27 4.29 0 .34.04.67.11.98C8.28 9.09 5.11 7.38 3 4.79c-.37.63-.58 1.37-.58 2.15 0 1.49.75 2.81 1.91 3.56-.71 0-1.37-.2-1.95-.5v.03c0 2.08 1.48 3.82 3.44 4.21a4.22 4.22 0 0 1-1.93.07 4.28 4.28 0 0 0 4 2.98 8.521 8.521 0 0 1-5.33 1.84c-.34 0-.68-.02-1.02-.06C3.44 20.29 5.7 21 8.12 21 16 21 20.33 14.46 20.33 8.79c0-.19 0-.37-.01-.56.84-.6 1.56-1.36 2.14-2.23z"/>
                  </svg>
                </a>
                <a href="#" className="p-3 bg-gradient-to-r from-pink-500 to-red-400 rounded-full hover:from-pink-600 hover:to-red-500 transition-all duration-300 transform hover:scale-110">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.174-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.688 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.741.099.120.112.225.085.345-.09.375-.293 1.199-.334 1.363-.053.225-.172.271-.402.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.92-7.252 4.158 0 7.392 2.967 7.392 6.923 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.357-.629-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24.009 12.017 24.009c6.624 0 11.99-5.367 11.99-11.988C24.007 5.367 18.641.001.012.001z"/>
                  </svg>
                </a>
                <a href="#" className="p-3 bg-gradient-to-r from-pink-500 to-red-400 rounded-full hover:from-pink-600 hover:to-red-500 transition-all duration-300 transform hover:scale-110">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12.04 0C5.408 0 .017 5.4.017 12.04c0 5.994 4.391 10.954 10.124 11.944V15.504H7.302v-3.464h2.839V9.236c0-2.797 1.67-4.347 4.225-4.347 1.225 0 2.504.218 2.504.218v2.751h-1.412c-1.39 0-1.824.863-1.824 1.748v2.098h3.105l-.497 3.464h-2.608v8.48C19.592 22.994 24.017 18.063 24.017 12.04 24.017 5.4 18.592.017 12.017.017z"/>
                  </svg>
                </a>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold mb-6 text-pink-400">Quick Links</h4>
            <ul className="space-y-3">
              <li><Link href="/products" className="text-gray-300 hover:text-pink-400 transition-colors duration-300">All Products</Link></li>
              <li><Link href="/category/electronics" className="text-gray-300 hover:text-pink-400 transition-colors duration-300">Electronics</Link></li>
              <li><Link href="/category/fashion" className="text-gray-300 hover:text-pink-400 transition-colors duration-300">Fashion</Link></li>
              <li><Link href="/category/home" className="text-gray-300 hover:text-pink-400 transition-colors duration-300">Home & Garden</Link></li>
              <li><Link href="/deals" className="text-gray-300 hover:text-pink-400 transition-colors duration-300">Hot Deals</Link></li>
              <li><Link href="/new-arrivals" className="text-gray-300 hover:text-pink-400 transition-colors duration-300">New Arrivals</Link></li>
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h4 className="text-lg font-semibold mb-6 text-pink-400">Customer Service</h4>
            <ul className="space-y-3">
              <li><Link href="/contact" className="text-gray-300 hover:text-pink-400 transition-colors duration-300">Contact Us</Link></li>
              <li><Link href="/faq" className="text-gray-300 hover:text-pink-400 transition-colors duration-300">FAQ</Link></li>
              <li><Link href="/shipping" className="text-gray-300 hover:text-pink-400 transition-colors duration-300">Shipping Info</Link></li>
              <li><Link href="/returns" className="text-gray-300 hover:text-pink-400 transition-colors duration-300">Returns & Exchanges</Link></li>
              <li><Link href="/track-order" className="text-gray-300 hover:text-pink-400 transition-colors duration-300">Track Your Order</Link></li>
              <li><Link href="/support" className="text-gray-300 hover:text-pink-400 transition-colors duration-300">Support Center</Link></li>
            </ul>
          </div>

          {/* Seller Info */}
          <div>
            <h4 className="text-lg font-semibold mb-6 text-pink-400">For Sellers</h4>
            <ul className="space-y-3 mb-6">
              <li><Link href="/seller/auth" className="text-gray-300 hover:text-pink-400 transition-colors duration-300">Become a Seller</Link></li>
              <li><Link href="/seller/dashboard" className="text-gray-300 hover:text-pink-400 transition-colors duration-300">Seller Dashboard</Link></li>
              <li><Link href="/seller-guide" className="text-gray-300 hover:text-pink-400 transition-colors duration-300">Seller Guide</Link></li>
              <li><Link href="/seller-policies" className="text-gray-300 hover:text-pink-400 transition-colors duration-300">Seller Policies</Link></li>
            </ul>

            {/* Newsletter Signup */}
            <div>
              <h5 className="font-semibold mb-3 text-white">Stay Updated</h5>
              <div className="flex">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="flex-1 px-4 py-2 rounded-l-lg bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-500"
                />
                <button className="bg-gradient-to-r from-pink-500 to-red-400 px-4 py-2 rounded-r-lg hover:from-pink-600 hover:to-red-500 transition-all duration-300">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-700 bg-gray-900/50">
        <div className="container mx-auto px-6 py-6">
          <div className="flex flex-col lg:flex-row justify-between items-center space-y-4 lg:space-y-0">
            {/* Copyright */}
            <div className="text-gray-400 text-sm">
              © {currentYear} REAL Marketplace. All rights reserved.
            </div>

            {/* Legal Links */}
            <div className="flex flex-wrap justify-center lg:justify-end space-x-6 text-sm">
              <Link href="/privacy" className="text-gray-400 hover:text-pink-400 transition-colors duration-300">
                Privacy Policy
              </Link>
              <Link href="/terms" className="text-gray-400 hover:text-pink-400 transition-colors duration-300">
                Terms of Service
              </Link>
              <Link href="/cookies" className="text-gray-400 hover:text-pink-400 transition-colors duration-300">
                Cookie Policy
              </Link>
            </div>

            {/* Payment Methods */}
            <div className="flex items-center space-x-3">
              <span className="text-gray-400 text-sm mr-3">We Accept:</span>
              <div className="flex space-x-2">
                <div className="w-8 h-6 bg-gradient-to-r from-blue-600 to-blue-700 rounded flex items-center justify-center text-white text-xs font-bold">VISA</div>
                <div className="w-8 h-6 bg-gradient-to-r from-red-600 to-red-700 rounded flex items-center justify-center text-white text-xs font-bold">MC</div>
                <div className="w-8 h-6 bg-gradient-to-r from-blue-800 to-blue-900 rounded flex items-center justify-center text-white text-xs font-bold">PP</div>
                <div className="w-8 h-6 bg-gradient-to-r from-green-600 to-green-700 rounded flex items-center justify-center text-white text-xs font-bold">AP</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}