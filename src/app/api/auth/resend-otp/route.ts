import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { generateOTP, sendOTPEmail } from '@/lib/otpService'

const prisma = new PrismaClient()

export async function POST(request: NextRequest) {
  try {
    console.log('🔄 Resend OTP API called')

    const { email } = await request.json()

    if (!email) {
      return NextResponse.json(
        { error: 'Email address is required' },
        { status: 400 }
      )
    }

    console.log('🔍 Looking for user:', email)

    // Find user
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'No account found with this email address' },
        { status: 404 }
      )
    }

    if (user.is_verified) {
      return NextResponse.json(
        { error: 'Email is already verified' },
        { status: 400 }
      )
    }

    // Generate new OTP
    console.log('🔄 Generating new OTP...')
    const otpCode = generateOTP()
    const otpExpiry = new Date()
    otpExpiry.setMinutes(otpExpiry.getMinutes() + 10) // 10 minutes

    // Update user with new OTP
    await prisma.user.update({
      where: { id: user.id },
      data: {
        otp_code: otpCode,
        otp_expires_at: otpExpiry,
        otp_attempts: 0, // Reset attempts
        updated_at: new Date()
      }
    })

    // Send OTP email
    console.log('📧 Sending new OTP email...')
    const emailSent = await sendOTPEmail(
      user.email,
      user.first_name,
      otpCode,
      'verification'
    )

    if (!emailSent) {
      return NextResponse.json(
        { error: 'Failed to send verification email. Please try again.' },
        { status: 500 }
      )
    }

    console.log('✅ OTP resent successfully')

    return NextResponse.json(
      {
        message: 'New verification code sent successfully! Please check your inbox.'
      },
      { status: 200 }
    )

  } catch (error: any) {
    console.error('💥 Resend OTP error:', error)
    return NextResponse.json(
      { error: 'Failed to resend verification code. Please try again.' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}