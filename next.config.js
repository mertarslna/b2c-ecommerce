/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ['prisma', '@prisma/client'],
  },
  images: {
    domains: ['localhost', 'example.com'],
  },
  // Enable standalone output for Docker
  output: 'standalone',
  // Content Security Policy headers
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://js.stripe.com https://m.stripe.network https://gc.kis.v2.scr.kaspersky-labs.com",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "font-src 'self' https://fonts.gstatic.com",
              "img-src 'self' data: blob: https:",
              "connect-src 'self' https://api.stripe.com https://merchant-ui-api.stripe.com https://m.stripe.network https://api.paythor.com https://dev-api.paythor.com https://api.ipify.org http://gc.kis.v2.scr.kaspersky-labs.com ws://gc.kis.v2.scr.kaspersky-labs.com",
              "frame-src 'self' https://js.stripe.com https://m.stripe.network",
              "child-src 'self' https://js.stripe.com https://m.stripe.network"
            ].join('; ')
          }
        ]
      }
    ]
  }
}

module.exports = nextConfig
