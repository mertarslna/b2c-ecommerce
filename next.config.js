// next.config.js
/** @type {import('next').NextConfig} */


const isDev = process.env.NODE_ENV !== 'production';

const nextConfig = {
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: isDev
              ? "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://js.stripe.com http://gc.kis.v2.scr.kaspersky-labs.com ws://gc.kis.v2.scr.kaspersky-labs.com; object-src 'none';"
              : "script-src 'self' https://js.stripe.com http://gc.kis.v2.scr.kaspersky-labs.com ws://gc.kis.v2.scr.kaspersky-labs.com; object-src 'none';"
          }
        ]
      }
    ];
  },
};

module.exports = nextConfig;
