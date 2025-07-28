import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'
import { generateOTP, sendOTPEmail } from '@/lib/otpService'

const prisma = new PrismaClient()

export async function POST(request: NextRequest) {
  try {
    console.log('🚀 Register API called')

    const body = await request.json()
    console.log('📝 Request body:', { ...body, password: '[HIDDEN]' })

    const { first_name, last_name, email, password, phone } = body

    // Validation
    if (!first_name || !last_name || !email || !password) {
      console.log('❌ Missing required fields')
      return NextResponse.json(
        { error: 'All required fields must be filled' },
        { status: 400 }
      )
    }

    if (password.length < 6) {
      console.log('❌ Password too short')
      return NextResponse.json(
        { error: 'Password must be at least 6 characters long' },
        { status: 400 }
      )
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      console.log('❌ Invalid email format')
      return NextResponse.json(
        { error: 'Please enter a valid email address' },
        { status: 400 }
      )
    }

    // Normalize email
    const normalizedEmail = email.toLowerCase().trim()

    // Check if user exists
    console.log('🔍 Checking if user exists:', normalizedEmail)
    const existingUser = await prisma.user.findUnique({
      where: { email: normalizedEmail }
    })

    if (existingUser) {
      console.log('❌ User already exists')
      return NextResponse.json(
        { error: 'This email address is already registered' },
        { status: 409 }
      )
    }

    // Hash password
    console.log('🔐 Hashing password...')
    const hashedPassword = await bcrypt.hash(password, 12)

    // Generate OTP
    const otpCode = generateOTP()
    const otpExpiry = new Date()
    otpExpiry.setMinutes(otpExpiry.getMinutes() + 10) // 10 minutes

    console.log('🔢 Generated OTP:', otpCode)

    // Create user
    console.log('👤 Creating user...')
    const result = await prisma.$transaction(async (tx) => {
      // Create user (unverified)
      const user = await tx.user.create({
        data: {
          email: normalizedEmail,
          password: hashedPassword,
          first_name: first_name.trim(),
          last_name: last_name.trim(),
          phone: phone?.trim() || null,
          role: 'CUSTOMER',
          is_verified: false, // Important: unverified
          otp_code: otpCode,
          otp_expires_at: otpExpiry,
          otp_attempts: 0
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

      // Create cart
      await tx.cart.create({
        data: {
          customer_id: customerProfile.id,
          total_amount: 0
        }
      })

      return user
    })

    console.log('✅ User created successfully:', result.id)

    // Send OTP email
    console.log('📧 Sending OTP email...')
    const emailSent = await sendOTPEmail(
      normalizedEmail,
      result.first_name,
      otpCode,
      'verification'
    )

    if (!emailSent) {
      console.error('❌ Failed to send OTP email')
    }

    // Return response
    return NextResponse.json(
      {
        message: emailSent 
          ? 'Account created successfully! Please check your email for the verification code.'
          : 'Account created successfully! But failed to send verification email. Please try again later.',
        user: {
          id: result.id,
          email: result.email,
          first_name: result.first_name,
          last_name: result.last_name,
          is_verified: result.is_verified
        },
        emailSent,
        needsVerification: true
      },
      { status: 201 }
    )

  } catch (error: any) {
    console.error('💥 Registration error:', error)
    
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'This email address is already registered' },
        { status: 409 }
      )
    }

    return NextResponse.json(
      { error: 'Registration failed. Please try again.' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}