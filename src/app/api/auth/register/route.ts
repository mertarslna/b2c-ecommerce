import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

export async function POST(request: NextRequest) {
  try {
    const { first_name, last_name, email, password, phone } = await request.json()

    // Validation
    if (!first_name || !last_name || !email || !password) {
      return NextResponse.json(
        { error: 'Tüm alanlar zorunludur' },
        { status: 400 }
      )
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Şifre en az 6 karakter olmalıdır' },
        { status: 400 }
      )
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Geçersiz email formatı' },
        { status: 400 }
      )
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'Bu email adresi zaten kullanılıyor' },
        { status: 409 }
      )
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12)

    // Create user with transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create user
      const user = await tx.user.create({
        data: {
          email,
          password: hashedPassword,
          first_name,
          last_name,
          phone: phone || null,
          role: 'CUSTOMER'
        }
      })

      // Create customer profile
      const customerProfile = await tx.customerProfile.create({
        data: {
          user_id: user.id,
          wishlist: [],
          loyalty_points: 0
        }
      })

      // Create cart for customer
      await tx.cart.create({
        data: {
          customer_id: customerProfile.id,
          total_amount: 0
        }
      })

      return user
    })

    // Return success response (without password)
    const { password: _, ...userWithoutPassword } = result

    return NextResponse.json(
      { 
        message: 'Hesap başarıyla oluşturuldu',
        user: userWithoutPassword
      },
      { status: 201 }
    )

  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json(
      { error: 'Kayıt olma işlemi başarısız oldu. Lütfen tekrar deneyin.' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
} 