// src/middleware.ts
import { NextRequest, NextResponse } from 'next/server'
import { verifyAccessToken, refreshAccessToken } from '@/lib/jwt'

// Define protected routes
const protectedRoutes = [
  '/dashboard',
  '/profile',
  '/orders',
  '/cart',
  '/checkout',
  '/seller',
  '/admin'
]

// Define auth routes (redirect if already logged in)
const authRoutes = [
  '/auth/login',
  '/auth/signup',
  '/auth/forgot-password'
]

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // Check if current path is protected
  const isProtectedRoute = protectedRoutes.some(route => 
    pathname.startsWith(route)
  )
  
  // Check if current path is auth route
  const isAuthRoute = authRoutes.some(route => 
    pathname.startsWith(route)
  )

  // Get tokens from cookies
  const accessToken = request.cookies.get('accessToken')?.value
  const refreshToken = request.cookies.get('refreshToken')?.value

  // Verify access token
  let user = null
  if (accessToken) {
    user = verifyAccessToken(accessToken)
  }

  // If access token is invalid but refresh token exists, try to refresh
  if (!user && refreshToken) {
    try {
      const newAccessToken = await refreshAccessToken(refreshToken)
      if (newAccessToken) {
        // Create response to set new access token
        const response = NextResponse.next()
        response.cookies.set('accessToken', newAccessToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'strict',
          maxAge: 15 * 60, // 15 minutes
          path: '/'
        })
        
        // Verify the new token
        user = verifyAccessToken(newAccessToken)
        return response
      }
    } catch (error) {
      console.error('Token refresh failed:', error)
    }
  }

  // Handle protected routes
  if (isProtectedRoute) {
    if (!user) {
      // Redirect to login
      const loginUrl = new URL('/auth/login', request.url)
      loginUrl.searchParams.set('redirect', pathname)
      return NextResponse.redirect(loginUrl)
    }

    // Check role-based access
    if (pathname.startsWith('/admin') && user.role !== 'ADMIN') {
      return new NextResponse('Forbidden', { status: 403 })
    }

    if (pathname.startsWith('/seller') && !['SELLER', 'ADMIN'].includes(user.role)) {
      return new NextResponse('Forbidden', { status: 403 })
    }
  }

  // Handle auth routes (redirect if already logged in)
  if (isAuthRoute && user) {
    const redirectUrl = request.nextUrl.searchParams.get('redirect') || '/'
    return NextResponse.redirect(new URL(redirectUrl, request.url))
  }

  // Add user info to headers for API routes
  if (user && pathname.startsWith('/api/')) {
    const requestHeaders = new Headers(request.headers)
    requestHeaders.set('x-user-id', user.userId)
    requestHeaders.set('x-user-email', user.email)
    requestHeaders.set('x-user-role', user.role)

    return NextResponse.next({
      request: {
        headers: requestHeaders
      }
    })
  }

  return NextResponse.next()
}

// Configure which paths the middleware runs on
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api/auth (auth routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!api/auth|_next/static|_next/image|favicon.ico|public).*)',
  ],
}