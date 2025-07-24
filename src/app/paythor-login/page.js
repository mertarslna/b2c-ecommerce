'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Lock, User, Eye, EyeOff, Check, AlertCircle, Key } from 'lucide-react';
import PayThorAuth from '@/lib/paythor-auth-direct';

export default function PayThorLoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [auth] = useState(() => PayThorAuth.getInstance());
  const [currentStep, setCurrentStep] = useState('login');
  
  // Yönlendirme hedefini belirle (query param'dan veya varsayılan)
  const redirectTo = searchParams.get('redirect') || '/';
  
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  
  const [otpData, setOtpData] = useState({
    otp: '',
    email: ''
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [currentUser, setCurrentUser] = useState(null);
  const [showLoginForm, setShowLoginForm] = useState(false);

  useEffect(() => {
    // Check if already authenticated and get user info
    if (auth.isAuthenticated()) {
      // Token'dan kullanıcı bilgilerini çıkarmaya çalış
      const token = auth.getToken();
      
      // Varsayılan kullanıcı bilgisi (email localStorage'dan alınabilir)
      const userEmail = localStorage.getItem('paythor_user_email') || 'Kullanıcı';
      
      setCurrentUser({
        email: userEmail,
        token: token,
        loginTime: localStorage.getItem('paythor_login_time') || new Date().toISOString()
      });
      
      setSuccess('PayThor hesabınız aktif!');
    } else {
      setShowLoginForm(true);
    }
  }, [auth, router, redirectTo]);

  const handleLogout = () => {
    auth.logout();
    localStorage.removeItem('paythor_user_email');
    localStorage.removeItem('paythor_login_time');
    setCurrentUser(null);
    setShowLoginForm(true);
    setSuccess('');
    setError('');
  };

  const handleSwitchAccount = () => {
    setShowLoginForm(true);
    setError('');
    setSuccess('');
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError('');
  };

  const handleOtpInputChange = (value) => {
    setOtpData(prev => ({ ...prev, otp: value }));
    setError('');
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      console.log('PayThor login deneniyor:', formData.email);
      const result = await auth.login(formData.email, formData.password);
      
      console.log('PayThor login sonucu:', result);
      
      if (result.status === 'success') {
        if (result.data && result.data.verification_method === 'email') {
          setOtpData(prev => ({ ...prev, email: formData.email }));
          setCurrentStep('otp');
          setSuccess('Giriş başarılı! Lütfen e-postanıza gelen doğrulama kodunu girin.');
        } else {
          setSuccess('Giriş başarılı! Yönlendiriliyorsunuz...');
          setTimeout(() => {
            router.push(redirectTo); // Dinamik yönlendirme
          }, 2000);
        }
      } else {
        setError(result.message || 'Giriş başarısız. Lütfen bilgilerinizi kontrol edin.');
      }
    } catch (error) {
      console.error('Login error:', error);
      setError('Giriş işlemi sırasında bir hata oluştu. Lütfen tekrar deneyin.');
    } finally {
      setLoading(false);
    }
  };

  const handleOTPVerification = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      console.log('OTP doğrulama deneniyor:', otpData.otp);
      const result = await auth.verifyOTP(otpData.email, otpData.otp);
      
      console.log('OTP doğrulama sonucu:', result);
      
      if (result.status === 'success') {
        // Kullanıcı bilgilerini kaydet
        localStorage.setItem('paythor_user_email', otpData.email);
        localStorage.setItem('paythor_login_time', new Date().toISOString());
        
        // Kullanıcı bilgilerini state'e kaydet
        setCurrentUser({
          email: otpData.email,
          token: auth.getToken(),
          loginTime: new Date().toISOString()
        });
        
        setShowLoginForm(false);
        setSuccess('PayThor hesabınız başarıyla bağlandı!');
        
        // Eğer redirect varsa bekle, yoksa kullanıcı bilgilerini göster
        if (redirectTo !== '/') {
          setTimeout(() => {
            router.push(redirectTo);
          }, 2000);
        }
      } else {
        setError(result.message || 'OTP doğrulama başarısız. Lütfen kodu kontrol edin.');
      }
    } catch (error) {
      console.error('OTP verification error:', error);
      setError('OTP doğrulama işlemi sırasında bir hata oluştu. Lütfen tekrar deneyin.');
    } finally {
      setLoading(false);
    }
  };

  const getUserData = () => {
    return auth.getUserData();
  };

  const userData = getUserData();

  if (auth.isAuthenticated() && userData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <Lock className="mx-auto h-12 w-12 text-green-600" />
            <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
              PayThor Giriş Yapıldı
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Hesabınızla başarıyla giriş yaptınız
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="space-y-4">
              <div className="flex items-center p-3 bg-green-50 rounded-lg">
                <Check className="h-5 w-5 text-green-600 mr-3" />
                <span className="text-green-800 font-medium">Giriş Başarılı</span>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Ad Soyad</label>
                  <p className="text-gray-900">{userData.firstname} {userData.lastname}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">E-posta</label>
                  <p className="text-gray-900">{userData.email}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Mağaza</label>
                  <p className="text-gray-900">{userData.merchantname}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Yetki Seviyesi</label>
                  <p className="text-gray-900">{userData.user_level}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Son Giriş</label>
                  <p className="text-gray-900">{new Date(userData.last_login).toLocaleString('tr-TR')}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Token Geçerlilik</label>
                  <p className="text-gray-900">{new Date(userData.expire_date).toLocaleString('tr-TR')}</p>
                </div>
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  onClick={() => router.push(redirectTo)}
                  className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors"
                >
                  {redirectTo === '/checkout-paythor' ? 'Ödeme Sayfasına Git' : 'Devam Et'}
                </button>
                
                <button
                  onClick={handleLogout}
                  className="flex-1 bg-red-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-red-700 transition-colors"
                >
                  Çıkış Yap
                </button>
              </div>
              
              <div className="pt-2">
                <button
                  onClick={() => {
                    console.log('Token testi başlıyor...')
                    const auth = PayThorAuth.getInstance();
                    
                    console.log('=== TOKEN TEST ===')
                    console.log('1. auth.isAuthenticated():', auth.isAuthenticated())
                    console.log('2. auth.getToken():', auth.getToken() ? auth.getToken().substring(0, 20) + '...' : 'null')
                    console.log('3. auth.getTokenWithHeaders():', auth.getTokenWithHeaders())
                    
                    if (typeof window !== 'undefined') {
                      console.log('4. localStorage paythor_token:', localStorage.getItem('paythor_token') ? localStorage.getItem('paythor_token').substring(0, 20) + '...' : 'null')
                      console.log('5. localStorage paythor_token_expiry:', localStorage.getItem('paythor_token_expiry'))
                      console.log('6. localStorage paythor_user_data:', !!localStorage.getItem('paythor_user_data'))
                    }
                    
                    alert('Token test sonuçları konsola yazdırıldı. F12 ile kontrol edin.')
                  }}
                  className="w-full bg-yellow-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-yellow-700 transition-colors text-sm"
                >
                  🔍 Token Test (Debug)
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Mevcut kullanıcı bilgileri gösterimi
  if (currentUser && !showLoginForm) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <div className="mx-auto h-12 w-12 bg-green-100 rounded-full flex items-center justify-center">
              <Check className="h-6 w-6 text-green-600" />
            </div>
            <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
              PayThor Aktif
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              PayThor hesabınız bağlı ve aktif durumda
            </p>
          </div>

          <div className="bg-white shadow rounded-lg p-6 space-y-4">
            <div className="flex items-center space-x-3 mb-4">
              <div className="flex-shrink-0">
                <User className="h-8 w-8 text-blue-600" />
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-900">Hesap Bilgileri</h3>
                <p className="text-sm text-gray-500">Aktif PayThor hesabı</p>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700">E-posta</label>
                <p className="text-gray-900 break-all">{currentUser.email}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Giriş Tarihi</label>
                <p className="text-gray-900">
                  {new Date(currentUser.loginTime).toLocaleDateString('tr-TR', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Token Durumu</label>
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  ✅ Aktif
                </span>
              </div>
            </div>

            <div className="pt-4 border-t border-gray-200 space-y-3">
              <button
                onClick={handleSwitchAccount}
                className="w-full flex justify-center py-2 px-4 border border-blue-600 rounded-md shadow-sm text-sm font-medium text-blue-600 bg-white hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <Key className="w-4 h-4 mr-2" />
                Farklı Hesap ile Giriş Yap
              </button>
              
              <button
                onClick={handleLogout}
                className="w-full flex justify-center py-2 px-4 border border-red-600 rounded-md shadow-sm text-sm font-medium text-red-600 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                Çıkış Yap
              </button>

              <button
                onClick={() => router.push(redirectTo)}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Devam Et
              </button>
            </div>
          </div>

          {success && (
            <div className="bg-green-50 border border-green-200 rounded-md p-4">
              <div className="flex">
                <Check className="h-5 w-5 text-green-400" />
                <div className="ml-3">
                  <p className="text-sm text-green-800">{success}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <Lock className="mx-auto h-12 w-12 text-blue-600" />
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            {currentUser ? 'Hesap Değiştir' : 'PayThor Giriş'}
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            {currentUser ? 'Farklı bir PayThor hesabı ile giriş yapın' : 
             currentStep === 'login' 
              ? 'PayThor API erişimi için giriş yapın'
              : 'E-postanıza gelen doğrulama kodunu girin'
            }
          </p>
        </div>

        {currentStep === 'login' ? (
          <form className="mt-8 space-y-6" onSubmit={handleLogin}>
            <div className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  E-posta Adresi
                </label>
                <div className="mt-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="E-posta adresinizi girin"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Şifre
                </label>
                <div className="mt-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={formData.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    className="block w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Şifrenizi girin"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                    )}
                  </button>
                </div>
              </div>
            </div>

            {error && (
              <div className="flex items-center p-3 bg-red-50 rounded-lg">
                <AlertCircle className="h-5 w-5 text-red-600 mr-3" />
                <span className="text-red-800 text-sm">{error}</span>
              </div>
            )}

            {success && (
              <div className="flex items-center p-3 bg-green-50 rounded-lg">
                <Check className="h-5 w-5 text-green-600 mr-3" />
                <span className="text-green-800 text-sm">{success}</span>
              </div>
            )}

            <div>
              <button
                type="submit"
                disabled={loading}
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Giriş yapılıyor...
                  </div>
                ) : (
                  'Giriş Yap'
                )}
              </button>
            </div>

            <div className="text-center">
              <button
                type="button"
                onClick={() => router.push('/checkout')}
                className="text-blue-600 hover:text-blue-500 text-sm font-medium"
              >
                ← Ödeme sayfasına dön
              </button>
            </div>
          </form>
        ) : (
          <form className="mt-8 space-y-6" onSubmit={handleOTPVerification}>
            <div className="space-y-4">
              <div>
                <label htmlFor="otp" className="block text-sm font-medium text-gray-700">
                  Doğrulama Kodu (OTP)
                </label>
                <div className="mt-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Key className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="otp"
                    name="otp"
                    type="text"
                    required
                    maxLength={6}
                    value={otpData.otp}
                    onChange={(e) => handleOtpInputChange(e.target.value)}
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-center text-lg tracking-widest"
                    placeholder="123456"
                  />
                </div>
                <p className="mt-1 text-xs text-gray-500">
                  {otpData.email} adresine gönderilen 6 haneli kodu girin
                </p>
              </div>
            </div>

            {error && (
              <div className="flex items-center p-3 bg-red-50 rounded-lg">
                <AlertCircle className="h-5 w-5 text-red-600 mr-3" />
                <span className="text-red-800 text-sm">{error}</span>
              </div>
            )}

            {success && (
              <div className="flex items-center p-3 bg-green-50 rounded-lg">
                <Check className="h-5 w-5 text-green-600 mr-3" />
                <span className="text-green-800 text-sm">{success}</span>
              </div>
            )}

            <div className="space-y-3">
              <button
                type="submit"
                disabled={loading}
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Doğrulanıyor...
                  </div>
                ) : (
                  'Doğrula'
                )}
              </button>

              <button
                type="button"
                onClick={() => setCurrentStep('login')}
                className="w-full text-blue-600 hover:text-blue-500 text-sm font-medium py-2"
              >
                ← Giriş sayfasına dön
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
