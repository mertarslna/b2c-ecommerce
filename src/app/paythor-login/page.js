'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Lock, User, Eye, EyeOff, Check, AlertCircle, Key } from 'lucide-react';
import PayThorAuth from '@/lib/paythor-auth-direct';

export default function PayThorLoginPage() {
  const router = useRouter();
  const [auth] = useState(() => PayThorAuth.getInstance());
  const [currentStep, setCurrentStep] = useState('login');
  const [formData, setFormData] = useState({
    email: 'f.rizaergin@eticsoft.com',
    password: '12345678Aa.'
  });
  
  const [otpData, setOtpData] = useState({
    otp: '123456',
    email: ''
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    // Check if already authenticated
    if (auth.isAuthenticated()) {
      setSuccess('Zaten giriş yapmışsınız!');
      setTimeout(() => {
        router.push('/checkout-paythor');
      }, 2000);
    }
  }, [auth, router]);

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
            router.push('/checkout-paythor');
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
        setSuccess('OTP doğrulandı! Yönlendiriliyorsunuz...');
        setTimeout(() => {
          router.push('/checkout-paythor');
        }, 2000);
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

  const handleLogout = () => {
    auth.logout();
    setSuccess('Çıkış yapıldı');
    setTimeout(() => {
      window.location.reload();
    }, 1000);
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
                  onClick={() => router.push('/checkout-paythor')}
                  className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors"
                >
                  Ödeme Sayfasına Git
                </button>
                
                <button
                  onClick={handleLogout}
                  className="flex-1 bg-red-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-red-700 transition-colors"
                >
                  Çıkış Yap
                </button>
              </div>
            </div>
          </div>
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
            PayThor Giriş
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            {currentStep === 'login' 
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

        <div className="mt-6 bg-blue-50 rounded-lg p-4">
          <h3 className="text-sm font-medium text-blue-900 mb-2">
            Test Modu: Gerçek API Bağlantısı
          </h3>
          <div className="text-xs text-blue-700 space-y-1">
            <div><strong>E-posta:</strong> f.rizaergin@eticsoft.com</div>
            <div><strong>Şifre:</strong> 12345678Aa.</div>
            <div><strong>Test OTP:</strong> 123456</div>
            <div className="mt-2 text-green-700 font-medium">
              ℹ️ Gerçek PayThor API kullanılıyor - Yanlış şifre ile hata alacaksınız
            </div>
            <div className="mt-1 text-orange-700 font-medium">
              ⚠️ Console'da API yanıtlarını görebilirsiniz
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
