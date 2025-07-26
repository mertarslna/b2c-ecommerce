import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function PUT(request: NextRequest) {
  try {
    const { id, first_name, last_name, phone } = await request.json()

    // Validation
    if (!id) {
      return NextResponse.json(
        { error: 'Kullanıcı ID gerekli' },
        { status: 400 }
      )
    }

    // Update user profile
    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        first_name: first_name || undefined,
        last_name: last_name || undefined,
        phone: phone || undefined,
        updated_at: new Date()
      },
      include: {
        customer_profile: true,
        seller_profile: true,
        admin_profile: true
      }
    })

    // Return user data without password
    const { password: _, ...userWithoutPassword } = updatedUser

    return NextResponse.json(
      { 
        message: 'Profil başarıyla güncellendi',
        user: userWithoutPassword
      },
      { status: 200 }
    )

  } catch (error) {
    console.error('Profile update error:', error)
    return NextResponse.json(
      { error: 'Profil güncellenemedi. Lütfen tekrar deneyin.' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
} 