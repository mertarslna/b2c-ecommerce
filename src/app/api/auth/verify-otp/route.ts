import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function POST(request: NextRequest) {
  try {
    console.log('🔢 OTP verification API called')

    const { email, otp } = await request.json()
    console.log('📝 Verifying OTP for:', email)
    console.log('🔢 OTP received:', otp)

    if (!email || !otp) {
      return NextResponse.json(
        { error: 'Email and OTP code are required' },
        { status: 400 }
      )
    }

    if (otp.length !== 6 || !/^\d{6}$/.test(otp)) {
      return NextResponse.json(
        { error: 'OTP must be exactly 6 digits' },
        { status: 400 }
      )
    }

    // Find user with email
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() }
    })

    if (!user) {
      console.log('❌ User not found')
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Check if already verified
    if (user.is_verified) {
      console.log('✅ Already verified')
      return NextResponse.json(
        { 
          message: 'Email is already verified! You can now log in.',
          alreadyVerified: true 
        },
        { status: 200 }
      )
    }

    // Check if OTP exists
    if (!user.otp_code) {
      console.log('❌ No OTP found')
      return NextResponse.json(
        { error: 'No verification code found. Please request a new one.' },
        { status: 400 }
      )
    }

    // Check OTP expiration
    if (user.otp_expires_at && user.otp_expires_at < new Date()) {
      console.log('❌ OTP expired')
      return NextResponse.json(
        { error: 'Verification code has expired. Please request a new one.' },
        { status: 400 }
      )
    }

    // Check attempt limit (max 5 attempts)
    if (user.otp_attempts >= 5) {
      console.log('❌ Too many attempts')
      return NextResponse.json(
        { error: 'Too many failed attempts. Please request a new verification code.' },
        { status: 429 }
      )
    }

    // Verify OTP
    if (user.otp_code !== otp) {
      console.log('❌ Invalid OTP')
      
      // Increment attempt count
      await prisma.user.update({
        where: { id: user.id },
        data: { 
          otp_attempts: user.otp_attempts + 1,
          updated_at: new Date()
        }
      })

      const remainingAttempts = 5 - (user.otp_attempts + 1)
      return NextResponse.json(
        { 
          error: `Invalid verification code. ${remainingAttempts} attempts remaining.`,
          remainingAttempts
        },
        { status: 400 }
      )
    }

    // Verify user - OTP is correct
    console.log('✅ Verifying user...')
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        is_verified: true,
        otp_code: null,
        otp_expires_at: null,
        otp_attempts: 0,
        updated_at: new Date()
      },
      select: {
        id: true,
        email: true,
        first_name: true,
        last_name: true,
        is_verified: true,
        role: true
      }
    })

    console.log('🎉 OTP verified successfully for:', updatedUser.email)

    return NextResponse.json(
      {
        message: 'Email verified successfully! You can now log in.',
        user: updatedUser,
        success: true
      },
      { status: 200 }
    )

  } catch (error: any) {
    console.error('💥 OTP verification error:', error)
    return NextResponse.json(
      { error: 'OTP verification failed. Please try again.' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}
