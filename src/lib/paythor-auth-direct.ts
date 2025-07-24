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

  private constructor() {
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('paythor_token');
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
          this.token = token;
          this.userData = data.data;
          
          if (typeof window !== 'undefined') {
            localStorage.setItem('paythor_token', token);
            localStorage.setItem('paythor_user_email', email);
            localStorage.setItem('paythor_user_data', JSON.stringify(data.data));
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
        // OTP doğrulandıktan sonra token'ı kaydet (HTML örneğindeki gibi)
        if (this.pendingToken) {
          this.token = this.pendingToken;
          
          if (typeof window !== 'undefined') {
            localStorage.setItem('paythor_token', this.pendingToken);
            localStorage.setItem('paythor_user_email', email);
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
    return !!this.token;
  }

  getUserData(): any {
    return this.userData;
  }

  logout(): void {
    this.token = null;
    this.userData = null;
    this.pendingToken = null;
    
    if (typeof window !== 'undefined') {
      localStorage.removeItem('paythor_token');
      localStorage.removeItem('paythor_user_data');
      localStorage.removeItem('paythor_user_email');
    }
  }
}

export default PayThorAuth;
