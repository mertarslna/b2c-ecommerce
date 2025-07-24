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
  private static instance: PayThorAuth
  private token: string | null = null
  private tokenExpiry: Date | null = null
  private pendingToken: string | null = null // Geçici token (OTP doğrulanmadan önce)

  private constructor() {
    // Load token from localStorage if available
    if (typeof window !== 'undefined') {
      const savedToken = localStorage.getItem('paythor_token')
      const savedExpiry = localStorage.getItem('paythor_token_expiry')
      const savedPendingToken = localStorage.getItem('paythor_pending_token')
      
      if (savedToken && savedExpiry) {
        const expiryDate = new Date(savedExpiry)
        if (expiryDate > new Date()) {
          this.token = savedToken
          this.tokenExpiry = expiryDate
        }
      }
      
      if (savedPendingToken) {
        this.pendingToken = savedPendingToken
      }
    }
  }

  static getInstance(): PayThorAuth {
    if (!PayThorAuth.instance) {
      PayThorAuth.instance = new PayThorAuth()
    }
    return PayThorAuth.instance
  }

  async login(email: string, password: string): Promise<PayThorAuthResponse> {
    try {
      // Check if we're in test mode (client-side check)
      const isTestMode = typeof window !== 'undefined' && 
        (window.location.hostname === 'localhost' || 
         localStorage.getItem('paythor_test_mode') === 'true')
      
      if (isTestMode) {
        console.log('PayThor Auth: Running in test mode')
        // Return mock success response for test mode
        const mockResponse: PayThorAuthResponse = {
          status: "success",
          message: "Token created successfully (TEST MODE)",
          meta: {
            timestamp: new Date().toISOString(),
            request_id: `test_${Date.now()}`,
            code: 1
          },
          data: {
            token_string: `test_token_${Date.now()}`,
            token_type: "time_limited",
            expire_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days
            status: "validation", // OTP gerekli olduğunu simüle et
            verification_method: "email",
            firstname: "Test",
            lastname: "User",
            email: email,
            id_user: `test_user_${Date.now()}`,
            user_level: "admin",
            last_login: new Date().toISOString(),
            merchantname: "Test Store",
            app: 102
          }
        }

        // Save mock data - status "validation" ise OTP gerekli
        if (mockResponse.data) {
          if (mockResponse.data.status === "validation") {
            // Geçici token olarak sakla, OTP doğrulanana kadar asıl token olarak kullanma
            this.pendingToken = mockResponse.data.token_string
            
            if (typeof window !== 'undefined') {
              localStorage.setItem('paythor_pending_token', this.pendingToken)
              localStorage.setItem('paythor_pending_email', email)
              localStorage.setItem('paythor_test_mode', 'true')
            }
          } else {
            // Direkt giriş
            this.token = mockResponse.data.token_string
            this.tokenExpiry = new Date(mockResponse.data.expire_date)

            if (typeof window !== 'undefined') {
              localStorage.setItem('paythor_token', this.token)
              localStorage.setItem('paythor_token_expiry', this.tokenExpiry.toISOString())
              localStorage.setItem('paythor_user_data', JSON.stringify(mockResponse.data))
              localStorage.setItem('paythor_test_mode', 'true')
            }
          }
        }

        return mockResponse
      }

      console.log('PayThor Auth: Using API route for production')
      // Use API route instead of direct fetch to avoid CSP issues
      const response = await fetch('/api/paythor/auth', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password })
      })

      const result: PayThorAuthResponse = await response.json()

      if (result.status === "success" && result.data) {
        if (result.data.status === "validation") {
          // OTP gerekli - geçici token olarak sakla
          this.pendingToken = result.data.token_string
          
          if (typeof window !== 'undefined') {
            localStorage.setItem('paythor_pending_token', this.pendingToken)
            localStorage.setItem('paythor_pending_email', email)
            localStorage.removeItem('paythor_test_mode') // Remove test mode flag
          }
        } else {
          // Direkt giriş başarılı
          this.token = result.data.token_string
          this.tokenExpiry = new Date(result.data.expire_date)

          if (typeof window !== 'undefined') {
            localStorage.setItem('paythor_token', this.token)
            localStorage.setItem('paythor_token_expiry', this.tokenExpiry.toISOString())
            localStorage.setItem('paythor_user_data', JSON.stringify(result.data))
            localStorage.removeItem('paythor_test_mode') // Remove test mode flag
          }
        }
      }

      return result
    } catch (error) {
      console.error('PayThor login error:', error)
      throw new Error('Login işlemi başarısız oldu')
    }
  }

  getToken(): string | null {
    // Check if token is still valid
    if (this.token && this.tokenExpiry && this.tokenExpiry > new Date()) {
      return this.token
    }
    
    // Token expired, clear it
    this.clearToken()
    return null
  }

  isAuthenticated(): boolean {
    return this.getToken() !== null
  }

  clearToken(): void {
    this.token = null
    this.tokenExpiry = null
    this.pendingToken = null
    
    if (typeof window !== 'undefined') {
      localStorage.removeItem('paythor_token')
      localStorage.removeItem('paythor_token_expiry')
      localStorage.removeItem('paythor_user_data')
      localStorage.removeItem('paythor_pending_token')
      localStorage.removeItem('paythor_pending_email')
    }
  }

  getUserData(): any {
    if (typeof window !== 'undefined') {
      const userData = localStorage.getItem('paythor_user_data')
      return userData ? JSON.parse(userData) : null
    }
    return null
  }

  logout(): void {
    this.clearToken()
  }

  async verifyOTP(email: string, otp: string): Promise<PayThorOTPResponse> {
    try {
      // Check if we're in test mode (client-side check)
      const isTestMode = typeof window !== 'undefined' && 
        (window.location.hostname === 'localhost' || 
         localStorage.getItem('paythor_test_mode') === 'true')
      
      if (isTestMode) {
        console.log('PayThor OTP: Running in test mode')
        // Test modunda OTP doğrulandıktan sonra pending token'ı asıl token yap
        if (this.pendingToken) {
          this.token = this.pendingToken
          this.tokenExpiry = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 gün
          this.pendingToken = null
          
          if (typeof window !== 'undefined') {
            localStorage.setItem('paythor_token', this.token)
            localStorage.setItem('paythor_token_expiry', this.tokenExpiry.toISOString())
            localStorage.removeItem('paythor_pending_token')
            localStorage.removeItem('paythor_pending_email')
            
            // Mock user data oluştur
            const mockUserData = {
              token_string: this.token,
              token_type: "time_limited",
              expire_date: this.tokenExpiry.toISOString(),
              status: "active",
              verification_method: "email",
              firstname: "Test",
              lastname: "User",
              email: email,
              id_user: `test_user_${Date.now()}`,
              user_level: "admin",
              last_login: new Date().toISOString(),
              merchantname: "Test Store",
              app: 102
            }
            localStorage.setItem('paythor_user_data', JSON.stringify(mockUserData))
          }
        }
        
        const mockResponse: PayThorOTPResponse = {
          status: "success",
          message: "OTP verified successfully (TEST MODE)",
          meta: {
            timestamp: new Date().toISOString(),
            request_id: `test_otp_${Date.now()}`,
            code: 1
          },
          data: {
            verified: true,
            email: email
          }
        }
        
        return mockResponse
      }

      console.log('PayThor OTP: Using API route for production')
      // Use API route instead of direct fetch to avoid CSP issues
      const response = await fetch('/api/paythor/otp-verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ target: email, otp })
      })

      const result: PayThorOTPResponse = await response.json()
      
      // OTP başarılı ise pending token'ı asıl token yap
      if (result.status === "success" && this.pendingToken) {
        this.token = this.pendingToken
        this.tokenExpiry = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 gün varsayım
        this.pendingToken = null
        
        if (typeof window !== 'undefined') {
          localStorage.setItem('paythor_token', this.token)
          localStorage.setItem('paythor_token_expiry', this.tokenExpiry.toISOString())
          localStorage.removeItem('paythor_pending_token')
          localStorage.removeItem('paythor_pending_email')
        }
      }
      
      return result
    } catch (error) {
      console.error('PayThor OTP verification error:', error)
      throw new Error('OTP doğrulama işlemi başarısız oldu')
    }
  }
}

export default PayThorAuth
