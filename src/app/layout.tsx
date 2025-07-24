

// src/app/layout.tsx
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { CartProvider } from '@/contexts/CartContext'
import { UserProvider } from '@/contexts/UserContext'
import { WishlistProvider } from '@/contexts/WishlistContext'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'REAL Marketplace - Amazing Products at Incredible Prices',
  description: 'Discover thousands of products from trusted sellers, all in one beautiful marketplace',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <UserProvider>
          <WishlistProvider>
            <CartProvider>
              {children}
            </CartProvider>
          </WishlistProvider>
        </UserProvider>
      </body>
    </html>
  )
}