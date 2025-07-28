// src/app/orders/page.tsx
'use client'

import { useState, useEffect } from 'react'
import Header from '@/components/Header'
import { useUser } from '@/contexts/UserContext'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

// Artık mockOrders yok, API'den çekilecek

const statusColors = {
  PENDING: { bg: 'bg-yellow-100', text: 'text-yellow-700', border: 'border-yellow-200' },
  processing: { bg: 'bg-yellow-100', text: 'text-yellow-700', border: 'border-yellow-200' },
  shipped: { bg: 'bg-blue-100', text: 'text-blue-700', border: 'border-blue-200' },
  delivered: { bg: 'bg-green-100', text: 'text-green-700', border: 'border-green-200' },
  cancelled: { bg: 'bg-red-100', text: 'text-red-700', border: 'border-red-200' }
}

const statusIcons = {
  PENDING: '⏳',
  processing: '⏳',
  shipped: '🚚',
  delivered: '✅',
  cancelled: '❌'
}


export default function OrdersPage() {
  const { user, isAuthenticated, isLoading } = useUser();
  const router = useRouter();
  const [orders, setOrders] = useState<any[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [showTrackingModal, setShowTrackingModal] = useState(false);

  // Redirect if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/auth/login');
    }
  }, [isAuthenticated, isLoading, router]);

  // Siparişleri API'den çek
  useEffect(() => {
    const fetchOrders = async () => {
      if (!user) return;
      try {
        const res = await fetch(`/api/orders?userId=${user.id}`);
        const data = await res.json();
        if (data.success) {
          setOrders(data.data);
        }
      } catch (e) {
        // Hata yönetimi eklenebilir
      }
    };
    fetchOrders();
  }, [user]);

  const handleReorder = (order: any) => {
    // ...aynı kod...
    console.log('Reordering:', order);
    const notification = document.createElement('div');
    notification.textContent = `🛒 ${order.items.length} items added to cart!`;
    notification.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-xl shadow-lg z-50 transform translate-x-full transition-transform duration-300';
    document.body.appendChild(notification);
    setTimeout(() => { notification.style.transform = 'translateX(0)'; }, 100);
    setTimeout(() => {
      notification.style.transform = 'translateX(100%)';
      setTimeout(() => { if (document.body.contains(notification)) { document.body.removeChild(notification); } }, 300);
    }, 3000);
  };

  const openTrackingModal = (order: any) => {
    setSelectedOrder(order);
    setShowTrackingModal(true);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50">
        <Header />
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-pink-200 border-t-pink-600 rounded-full animate-spin mx-auto mb-4"></div>
            <h2 className="text-2xl font-semibold text-pink-600">Loading Orders...</h2>
          </div>
        </div>
      </div>
    )
  }

  if (!isAuthenticated || !user) {
    return null
  }

  if (orders.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50">
        <Header />
        <div className="container mx-auto px-6 py-16">
          <div className="text-center py-20">
            <div className="bg-gradient-to-br from-pink-100 to-purple-100 rounded-3xl p-16 max-w-lg mx-auto">
              <div className="text-8xl mb-6">📦</div>
              <h2 className="text-4xl font-bold text-gray-800 mb-4">
                No Orders Yet
              </h2>
              <p className="text-xl text-gray-600 mb-8">
                You haven't placed any orders yet. Start shopping to see your order history here.
              </p>
              <Link 
                href="/"
                className="inline-block bg-gradient-to-r from-pink-500 to-purple-500 text-white px-10 py-4 rounded-xl font-semibold hover:from-pink-600 hover:to-purple-600 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                Start Shopping
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50">
      <Header />
      
      {/* Breadcrumb */}
      <div className="container mx-auto px-6 py-6">
        <nav className="text-sm">
          <ol className="flex items-center space-x-2">
            <li>
              <Link href="/" className="text-gray-500 hover:text-pink-600 transition-colors">Home</Link>
            </li>
            <li className="text-gray-400">/</li>
            <li>
              <Link href="/profile" className="text-gray-500 hover:text-pink-600 transition-colors">Profile</Link>
            </li>
            <li className="text-gray-400">/</li>
            <li className="text-pink-600 font-semibold">My Orders</li>
          </ol>
        </nav>
      </div>

      <div className="container mx-auto px-6 pb-16">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent mb-2 flex items-center gap-3">
              <span className="text-3xl">📦</span>
              My Orders
            </h1>
            <p className="text-xl text-gray-600">
              {orders.length} {orders.length === 1 ? 'order' : 'orders'} • Total: ${Number(orders.reduce((sum, order) => sum + (order.total_amount ?? 0), 0)).toFixed(2)}
            </p>
          </div>
        </div>

        {/* Orders List */}
        <div className="space-y-6">
          {orders.map((order) => (
            <div key={order.id} className="bg-white rounded-3xl shadow-xl border border-pink-100 overflow-hidden hover:shadow-2xl transition-all duration-300">
              
              {/* Order Header */}
              <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-pink-50 to-purple-50">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="text-2xl">{statusIcons[order.status as keyof typeof statusIcons]}</div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">Order #{order.id}</h3>
                      <p className="text-gray-600">Placed on {new Date(order.date).toLocaleDateString('en-US', { 
                        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' 
                      })}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <span className={`px-4 py-2 rounded-full text-sm font-semibold capitalize ${statusColors[order.status as keyof typeof statusColors].bg} ${statusColors[order.status as keyof typeof statusColors].text} ${statusColors[order.status as keyof typeof statusColors].border} border`}>
                      {order.status}
                    </span>
                    <span className="text-2xl font-bold bg-gradient-to-r from-pink-600 to-red-500 bg-clip-text text-transparent">
                      {Number(order.total_amount ?? 0).toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Order Items */}
              <div className="p-6">
                <h4 className="font-semibold text-gray-900 mb-4">Items ({order.items?.length || 0})</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                  {(order.items ?? []).map((item) => (
                    <div key={item.id} className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                      <Link href={`/product-details/${item.product?.id ?? ''}`}>
                        <img
                          src={item.product?.images?.[0]?.path || '/no-image.png'}
                          alt={item.product?.name}
                          className="w-16 h-16 object-cover rounded-lg cursor-pointer hover:scale-105 transition-transform"
                        />
                      </Link>
                      <div className="flex-1">
                        <Link href={`/product-details/${item.product?.id ?? ''}`}>
                          <h5 className="font-semibold text-gray-900 hover:text-pink-600 cursor-pointer transition-colors line-clamp-2">
                            {item.product?.name}
                          </h5>
                        </Link>
                        <p className="text-gray-600 text-sm">Qty: {item.quantity}</p>
                        <p className="font-semibold text-pink-600">${item.product?.price ?? item.price}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Order Actions */}
                <div className="flex flex-wrap gap-3 pt-4 border-t border-gray-200">
                  <button
                    onClick={() => openTrackingModal(order)}
                    className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-blue-600 hover:to-blue-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
                  >
                    📍 Track Order
                  </button>
                  
                  <button
                    onClick={() => handleReorder(order)}
                    className="bg-gradient-to-r from-green-500 to-green-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-green-600 hover:to-green-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
                  >
                    🔄 Reorder
                  </button>
                  
                  <button className="bg-gradient-to-r from-purple-500 to-purple-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-purple-600 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105">
                    📄 Invoice
                  </button>
                  
                  {order.status === 'delivered' && (
                    <button className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-orange-600 hover:to-orange-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105">
                      ⭐ Review Items
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Quick Stats */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white rounded-3xl shadow-xl border border-pink-100 p-8 text-center">
            <div className="text-4xl mb-4">📊</div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Total Orders</h3>
            <p className="text-3xl font-bold bg-gradient-to-r from-pink-600 to-red-500 bg-clip-text text-transparent">
              {orders.length}
            </p>
          </div>
          
          <div className="bg-white rounded-3xl shadow-xl border border-pink-100 p-8 text-center">
            <div className="text-4xl mb-4">💰</div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Total Spent</h3>
            <p className="text-3xl font-bold bg-gradient-to-r from-pink-600 to-red-500 bg-clip-text text-transparent">
              ${Number(orders.reduce((sum, order) => sum + Number(order.total_amount ?? 0), 0)).toFixed(2)}
            </p>
          </div>
          
          <div className="bg-white rounded-3xl shadow-xl border border-pink-100 p-8 text-center">
            <div className="text-4xl mb-4">🏆</div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Items Purchased</h3>
            <p className="text-3xl font-bold bg-gradient-to-r from-pink-600 to-red-500 bg-clip-text text-transparent">
              {orders.reduce((sum, order) => sum + (order.items ?? []).reduce((itemSum, item) => itemSum + item.quantity, 0), 0)}
            </p>
          </div>
        </div>
      </div>

      {/* Tracking Modal */}
      {showTrackingModal && selectedOrder && (
        <TrackingModal 
          order={selectedOrder} 
          onClose={() => setShowTrackingModal(false)} 
        />
      )}
    </div>
  )
}

// Tracking Modal Component
function TrackingModal({ order, onClose }: { order: any, onClose: () => void }) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="text-2xl font-bold text-gray-900">Track Order</h3>
            <p className="text-gray-600">#{order.id}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Tracking Number */}
        <div className="bg-gradient-to-r from-pink-50 to-purple-50 rounded-xl p-4 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Tracking Number</p>
              <p className="font-bold text-lg">{order.tracking.number}</p>
            </div>
            <button 
              onClick={() => navigator.clipboard.writeText(order.tracking.number)}
              className="bg-white p-2 rounded-lg hover:bg-gray-50 transition-colors"
            >
              📋
            </button>
          </div>
        </div>

        {/* Tracking Timeline */}
        <div className="space-y-4">
          <h4 className="font-semibold text-gray-900">Tracking History</h4>
          <div className="relative">
            {order.tracking.updates.map((update: any, index: number) => (
              <div key={index} className="flex items-start gap-4 pb-6 relative">
                {/* Timeline Line */}
                {index < order.tracking.updates.length - 1 && (
                  <div className="absolute left-6 top-8 w-0.5 h-12 bg-pink-200"></div>
                )}
                
                {/* Timeline Dot */}
                <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-sm z-10 ${
                  index === 0 ? 'bg-gradient-to-r from-green-500 to-emerald-500' : 'bg-gradient-to-r from-pink-500 to-purple-500'
                }`}>
                  {index === 0 ? '✓' : index + 1}
                </div>
                
                {/* Content */}
                <div className="flex-1 pt-2">
                  <div className="flex items-center justify-between mb-1">
                    <h5 className="font-semibold text-gray-900">{update.status}</h5>
                    <span className="text-sm text-gray-500">{new Date(update.date).toLocaleDateString()}</span>
                  </div>
                  <p className="text-gray-600">{update.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Shipping Info */}
        <div className="mt-8 p-4 bg-gray-50 rounded-xl">
          <h4 className="font-semibold text-gray-900 mb-2">Shipping Details</h4>
          <p className="text-gray-600 mb-1"><strong>Method:</strong> {order.shipping.method}</p>
          <p className="text-gray-600"><strong>Address:</strong> {order.shipping.address}</p>
        </div>
      </div>
    </div>
  )
}