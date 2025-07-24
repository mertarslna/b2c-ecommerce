interface PayThorAuthRequest {
  auth_query: {
    auth_method: "email_password_panel"
    email: string
    password: string
    program_id: number
    app_id: number
    store_url: string
  }
}

interface PayThorOTPRequest {
  target: string
  otp: string
}

interface PayThorOTPResponse {
  status: "success" | "error"
  message: string
  meta: {
    timestamp: string
    request_id: string
    code: number
  }
  data?: any
}

interface PayThorAuthResponse {
  status: "success" | "error"
  message: string
  meta: {
    timestamp: string
    request_id: string
    code: number
  }
  data?: {
    token_string: string
    token_type: string
    expire_date: string
    status: string
    verification_method: string
    firstname: string
    lastname: string
    email: string
    id_user: string
    user_level: string
    last_login: string
    merchantname: string
    app: number
  }
}

class PayThorAuth {
  private static instance: PayThorAuth;
  private token: string | null = null;
  private userData: any = null;
  private pendingToken: string | null = null;
  private tokenExpiry: string | null = null;

  private constructor() {
    console.log('PayThorAuth constructor çalışıyor...')
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('paythor_token');
      this.tokenExpiry = localStorage.getItem('paythor_token_expiry');
      const storedUserData = localStorage.getItem('paythor_user_data');
      
      console.log('Constructor localStorage bilgileri:')
      console.log('- token:', this.token ? this.token.substring(0, 20) + '...' : 'null')
      console.log('- tokenExpiry:', this.tokenExpiry)
      console.log('- storedUserData:', !!storedUserData)
      
      if (storedUserData) {
        try {
          this.userData = JSON.parse(storedUserData);
          console.log('UserData başarıyla parse edildi')
        } catch (e) {
          console.error('Error parsing stored user data:', e);
        }
      }
    } else {
      console.log('Window objesi mevcut değil (SSR)')
    }
  }

  static getInstance(): PayThorAuth {
    if (!PayThorAuth.instance) {
      PayThorAuth.instance = new PayThorAuth();
    }
    return PayThorAuth.instance;
  }

  async login(email: string, password: string): Promise<PayThorAuthResponse> {
    try {
      console.log('PayThor Login başlatılıyor:', email);
      
      // HTML örneğindeki gibi tam request formatı
      const requestBody = {
        auth_query: {
          auth_method: "email_password_panel",
          email: email,
          password: password,
          program_id: 1,
          app_id: 102, // HTML örnegindeki gibi
          store_url: "https://ornekmagaza.com"
        }
      };

      console.log('Request body:', requestBody);

      const response = await fetch('https://api.paythor.com/auth/signin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      });

      const data = await response.json();
      console.log('API Response:', { status: response.status, data });

      // Token'ı farklı yerlerden almaya çalış (HTML örneğindeki gibi)
      let token = (data.data && data.data.token_string) ||
                  data.token ||
                  (data.data && data.data.token) ||
                  response.headers.get("Authorization") ||
                  response.headers.get("authorization") ||
                  response.headers.get("X-Auth-Token") ||
                  response.headers.get("x-auth-token");

      if (response.status === 200) {
        if (data.data && data.data.status === "validation") {
          // OTP gerekli
          this.pendingToken = token;
          console.log('OTP gerekli, pending token kaydedildi:', token ? token.substring(0, 20) + '...' : 'null')
          return {
            status: 'success',
            message: 'OTP doğrulaması gerekli',
            meta: data.meta,
            data: {
              ...data.data,
              verification_method: 'email'
            }
          };
        } else if (token) {
          // Direkt giriş başarılı
          console.log('Login başarılı, token alındı:', token.substring(0, 20) + '...')
          this.token = token;
          this.userData = data.data;
          
          // Token expiry'yi kaydet
          if (data.data && data.data.expire_date) {
            this.tokenExpiry = data.data.expire_date;
            console.log('Login token expiry kaydedildi:', data.data.expire_date)
          }
          
          if (typeof window !== 'undefined') {
            localStorage.setItem('paythor_token', token);
            localStorage.setItem('paythor_user_email', email);
            localStorage.setItem('paythor_user_data', JSON.stringify(data.data));
            if (this.tokenExpiry) {
              localStorage.setItem('paythor_token_expiry', this.tokenExpiry);
            }
            console.log('Login token localStorage\'a kaydedildi')
          } else {
            console.log('Window objesi mevcut değil, localStorage kullanılamıyor')
          }
          
          return {
            status: 'success',
            message: 'Giriş başarılı',
            meta: data.meta,
            data: data.data
          };
        } else {
          return {
            status: 'error',
            message: 'API tarafından token dönmedi. Lütfen API anahtarlarınızı ve kullanıcı bilgilerinizi kontrol edin.',
            meta: data.meta
          };
        }
      } else {
        // Hata mesajını HTML örneğindeki gibi formatla
        let errorMessage = "Giriş başarısız.";
        if (data.details) {
          if (Array.isArray(data.details)) {
            errorMessage = data.details.join(", ");
          } else {
            errorMessage = data.details;
          }
        } else if (data.error) {
          errorMessage = data.error;
        } else if (data.message) {
          errorMessage = data.message;
        }

        // Özel hata mesajları (HTML örneğindeki gibi)
        if (typeof errorMessage === "string") {
          if (errorMessage.toLowerCase().includes("inactive") || errorMessage.toLowerCase().includes("not found")) {
            errorMessage = "Kullanıcı hesabınız aktif değil veya bulunamadı. Lütfen e-posta ve şifrenizi doğru girdiğinizden, hesabınızın onaylı ve aktif olduğundan emin olun.";
          } else if (errorMessage.toLowerCase().includes("otp limit exceeded")) {
            errorMessage = "Çok fazla giriş denemesi yaptınız. Lütfen birkaç dakika sonra tekrar deneyin.";
          }
        }

        return {
          status: 'error',
          message: errorMessage,
          meta: data.meta || { timestamp: new Date().toISOString(), request_id: '', code: response.status }
        };
      }
    } catch (error) {
      console.error('Login error:', error);
      return {
        status: 'error',
        message: 'Sunucuya ulaşılamadı. Lütfen internet bağlantınızı kontrol edin.',
        meta: { timestamp: new Date().toISOString(), request_id: '', code: 0 }
      };
    }
  }

  async verifyOTP(email: string, otp: string): Promise<PayThorOTPResponse> {
    try {
      console.log('OTP doğrulama başlatılıyor:', email, otp);

      const response = await fetch('https://api.paythor.com/otp/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          target: email,
          otp: otp
        })
      });

      const data = await response.json();
      console.log('OTP API Response:', { status: response.status, data });

      if (data.status === "success") {
        console.log('OTP doğrulandı, token kaydediliyor...')
        
        // OTP doğrulandıktan sonra token'ı kaydet (HTML örneğindeki gibi)
        if (this.pendingToken) {
          console.log('Pending token bulundu:', this.pendingToken.substring(0, 20) + '...')
          this.token = this.pendingToken;
          
          if (typeof window !== 'undefined') {
            localStorage.setItem('paythor_token', this.pendingToken);
            localStorage.setItem('paythor_user_email', email);
            console.log('Token localStorage\'a kaydedildi')
            
            // Eğer user data'da expiry varsa kaydet
            if (this.userData && this.userData.expire_date) {
              this.tokenExpiry = this.userData.expire_date;
              if (this.tokenExpiry) {
                localStorage.setItem('paythor_token_expiry', this.tokenExpiry);
                console.log('Token expiry kaydedildi:', this.tokenExpiry)
              }
            }
          } else {
            console.log('Window objesi mevcut değil, localStorage kullanılamıyor')
          }
          
          this.pendingToken = null;
        }

        return {
          status: 'success',
          message: 'OTP doğrulandı',
          meta: data.meta || { timestamp: new Date().toISOString(), request_id: '', code: 200 }
        };
      } else {
        const errorMessage = data.message || "Doğrulama başarısız.";
        return {
          status: 'error',
          message: errorMessage,
          meta: data.meta || { timestamp: new Date().toISOString(), request_id: '', code: response.status }
        };
      }
    } catch (error) {
      console.error('OTP verification error:', error);
      return {
        status: 'error',
        message: 'Sunucuya ulaşılamadı. Lütfen internet bağlantınızı kontrol edin.',
        meta: { timestamp: new Date().toISOString(), request_id: '', code: 0 }
      };
    }
  }

  isAuthenticated(): boolean {
    console.log('isAuthenticated() çağrıldı')
    console.log('- this.token:', this.token ? 'mevcut' : 'null')
    console.log('- this.tokenExpiry:', this.tokenExpiry)
    
    // Eğer token yoksa localStorage'dan yüklemeyi dene
    if (!this.token && typeof window !== 'undefined') {
      const storedToken = localStorage.getItem('paythor_token');
      console.log('- localStorage token kontrolü:', storedToken ? 'mevcut' : 'yok')
      
      if (storedToken) {
        this.token = storedToken;
        this.tokenExpiry = localStorage.getItem('paythor_token_expiry');
        console.log('- Token localStorage\'dan yüklendi')
      }
    }
    
    if (!this.token) {
      console.log('- Token yok, false döndürülüyor')
      return false;
    }
    
    // Token expiry kontrolü
    if (this.tokenExpiry) {
      const expiryDate = new Date(this.tokenExpiry);
      const now = new Date();
      console.log('- Token expiry kontrolü:', expiryDate, 'vs', now)
      
      if (now >= expiryDate) {
        console.log('PayThor token süresi dolmuş, temizleniyor...');
        this.logout();
        return false;
      }
    }
    
    console.log('- Token geçerli, true döndürülüyor')
    return true;
  }

  getToken(): string | null {
    console.log('getToken() çağrıldı')
    console.log('- this.token:', this.token ? this.token.substring(0, 20) + '...' : 'null')
    
    // Eğer memory'de token yoksa localStorage'dan tekrar yüklemeyi dene
    if (!this.token && typeof window !== 'undefined') {
      const storedToken = localStorage.getItem('paythor_token');
      console.log('- localStorage\'dan token yükleniyor:', storedToken ? storedToken.substring(0, 20) + '...' : 'null')
      
      if (storedToken) {
        this.token = storedToken;
        console.log('- Token memory\'e yüklendi')
        
        // Token expiry'yi de kontrol et
        const storedExpiry = localStorage.getItem('paythor_token_expiry');
        if (storedExpiry) {
          this.tokenExpiry = storedExpiry;
        }
        
        // User data'yı da yükle
        const storedUserData = localStorage.getItem('paythor_user_data');
        if (storedUserData) {
          try {
            this.userData = JSON.parse(storedUserData);
          } catch (e) {
            console.error('Error parsing stored user data:', e);
          }
        }
      }
    }
    
    if (this.isAuthenticated()) {
      console.log('- Token authenticated, döndürülüyor')
      return this.token;
    }
    
    console.log('- Token authenticated değil, null döndürülüyor')
    return null;
  }

  getTokenWithHeaders(): Record<string, string> {
    console.log('getTokenWithHeaders() çağrıldı')
    const token = this.getToken();
    console.log('- getToken() sonucu:', token ? token.substring(0, 20) + '...' : 'null')
    
    if (!token) {
      console.log('- Token yok, boş object döndürülüyor')
      return {};
    }
    
    const headers = {
      'Authorization': `Bearer ${token}`
    };
    console.log('- Headers oluşturuldu:', { 'Authorization': `Bearer ${token.substring(0, 20)}...` })
    return headers;
  }

  getUserData(): any {
    return this.userData;
  }

  // Token'ı localStorage'dan tekrar yükle
  refreshToken(): void {
    console.log('refreshToken() çağrıldı')
    if (typeof window !== 'undefined') {
      const storedToken = localStorage.getItem('paythor_token');
      const storedExpiry = localStorage.getItem('paythor_token_expiry');
      const storedUserData = localStorage.getItem('paythor_user_data');
      
      console.log('- localStorage token:', storedToken ? storedToken.substring(0, 20) + '...' : 'null')
      console.log('- localStorage expiry:', storedExpiry)
      console.log('- localStorage userData:', !!storedUserData)
      
      if (storedToken) {
        this.token = storedToken;
        this.tokenExpiry = storedExpiry;
        
        if (storedUserData) {
          try {
            this.userData = JSON.parse(storedUserData);
            console.log('- Token ve userData başarıyla yüklendi')
          } catch (e) {
            console.error('- UserData parse hatası:', e);
          }
        }
      } else {
        console.log('- localStorage\'da token bulunamadı')
      }
    }
  }

  logout(): void {
    console.log('PayThor logout işlemi başlıyor...')
    this.token = null;
    this.userData = null;
    this.pendingToken = null;
    this.tokenExpiry = null;
    
    if (typeof window !== 'undefined') {
      localStorage.removeItem('paythor_token');
      localStorage.removeItem('paythor_user_data');
      localStorage.removeItem('paythor_user_email');
      localStorage.removeItem('paythor_token_expiry');
      console.log('Tüm PayThor verileri localStorage\'dan temizlendi')
    } else {
      console.log('Window objesi mevcut değil, localStorage temizlenemedi')
    }
  }
}

export default PayThorAuth;
