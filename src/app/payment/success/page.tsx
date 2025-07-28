"use client"

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from '@/contexts/CartContext';
import { useUser } from '@/contexts/UserContext';

export default function PaymentSuccessPage() {
  const router = useRouter();
  const { clearCart, items, getCartTotal } = useCart();
  const { user } = useUser();

  const [orderCreated, setOrderCreated] = useState(false);
  const creatingOrder = useRef(false);
  const [orderError, setOrderError] = useState<string | null>(null);
  useEffect(() => {
    if (orderCreated || creatingOrder.current) return;
    if (!user || !items || items.length === 0) return;
    creatingOrder.current = true;
    let timeout: NodeJS.Timeout;
    const createOrderAndClearCart = async () => {
      try {
        // API portunu güncelledik (ör: 3000)
        const res = await fetch('http://localhost:3000/api/orders', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: user.id,
            items: items.map(i => ({
              id: i.id,
              name: i.name,
              price: i.price,
              quantity: i.quantity,
              image: i.image,
              selectedSize: i.selectedSize,
              selectedColor: i.selectedColor
            })),
            total: getCartTotal(),
            paymentInfo: { method: 'Credit Card' }
          })
        });
        const data = await res.json();
        console.log('Sipariş oluşturma cevabı:', data);
        if (!data.success) {
          setOrderError(data.error || 'Sipariş oluşturulamadı.');
          creatingOrder.current = false;
          return;
        }
        setOrderCreated(true);
        await clearCart();
        if (typeof window !== 'undefined') {
          localStorage.removeItem('cart');
        }
        timeout = setTimeout(() => {
          router.push("/orders");
        }, 3000);
      } catch (e) {
        setOrderError('Sipariş oluşturulurken hata: ' + String(e));
        console.error('Sipariş oluşturulurken hata:', e);
      }
    };
    createOrderAndClearCart();
    return () => { if (timeout) clearTimeout(timeout); };
  }, [orderCreated, user?.id]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="bg-white p-8 rounded-2xl shadow-lg text-center">
        {orderError ? (
          <>
            <h1 className="text-3xl font-bold text-red-600 mb-4">Sipariş Hatası</h1>
            <p className="text-lg text-red-500 mb-2">{orderError}</p>
          </>
        ) : (
          <>
            <h1 className="text-3xl font-bold text-green-600 mb-4">Ödeme Başarılı!</h1>
            <p className="text-lg text-gray-700 mb-2">Ödemeniz başarıyla tamamlandı.</p>
          </>
        )}
        <p className="text-gray-500">Sipariş detaylarınız e-posta adresinize gönderildi.</p>
        <p className="text-gray-400 mt-4 text-sm">3 saniye sonra siparişlerim ekranına yönlendirileceksiniz...</p>
      </div>
    </div>
  );
}
