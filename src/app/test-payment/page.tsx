export default function TestPaymentPage() {
  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center', 
      backgroundColor: '#f3f4f6' 
    }}>
      <div style={{
        backgroundColor: 'white',
        padding: '2rem',
        borderRadius: '0.5rem',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
        textAlign: 'center',
        maxWidth: '500px'
      }}>
        <h1 style={{ fontSize: '1.875rem', fontWeight: 'bold', marginBottom: '1rem' }}>
          Payment System Test
        </h1>
        <p style={{ color: '#6b7280', marginBottom: '2rem' }}>
          Payment sistemi başarıyla oluşturuldu ve çalışıyor!
        </p>
        
        <div style={{ 
          border: '1px solid #e5e7eb', 
          borderRadius: '0.5rem', 
          padding: '1rem',
          marginBottom: '1rem'
        }}>
          <h3 style={{ fontWeight: '600', marginBottom: '0.5rem' }}>Desteklenen Ödeme Yöntemleri:</h3>
          <ul style={{ listStyle: 'none', padding: 0 }}>
            <li>💳 Stripe (Kredi Kartı)</li>
            <li>🇹🇷 PayThor (Türkiye)</li>
            <li>🏦 Genel Kart Ödemeleri</li>
          </ul>
        </div>

        <div style={{ 
          backgroundColor: '#f3f4f6', 
          padding: '1rem', 
          borderRadius: '0.5rem',
          fontSize: '0.875rem',
          color: '#374151'
        }}>
          <p><strong>Test URL Örneği:</strong></p>
          <code style={{ backgroundColor: '#e5e7eb', padding: '0.25rem', borderRadius: '0.25rem' }}>
            /payment?orderId=123&amount=100&customerId=456&currency=TRY
          </code>
        </div>
      </div>
    </div>
  )
}
