import nodemailer from 'nodemailer'
import crypto from 'crypto'

// Gmail transporter setup
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
})

/**
 * Generate 6-digit OTP code
 */
export function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

/**
 * Send OTP verification email
 */
export async function sendOTPEmail(
  email: string,
  firstName: string,
  otpCode: string,
  type: 'verification' | 'password-reset' = 'verification'
): Promise<boolean> {
  try {
    console.log('📧 Sending OTP email to:', email)
    console.log('🔢 OTP Code:', otpCode)
    
    const isVerification = type === 'verification'
    const subject = isVerification 
      ? '🔐 Your Verification Code'
      : '🔐 Password Reset Code'
    
    const htmlContent = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${subject}</title>
    </head>
    <body style="font-family: 'Segoe UI', Tahoma, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 20px;">
      
      <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
        
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 30px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 28px; font-weight: bold;">
            ${isVerification ? 'Verify Your Account' : 'Reset Your Password'} 🔐
          </h1>
          <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0; font-size: 16px;">
            Enter the code below to ${isVerification ? 'activate your account' : 'reset your password'}
          </p>
        </div>
        
        <!-- Content -->
        <div style="padding: 40px 30px; text-align: center;">
          <h2 style="color: #2d3748; margin: 0 0 20px 0; font-size: 24px;">
            Hi ${firstName}! 👋
          </h2>
          
          <p style="color: #4a5568; font-size: 16px; line-height: 1.6; margin-bottom: 30px;">
            ${isVerification 
              ? 'Welcome to our store! Use the verification code below to complete your registration:'
              : 'You requested a password reset. Use the code below to create a new password:'
            }
          </p>
          
          <!-- OTP Code Display -->
          <div style="background: #f7fafc; border: 2px dashed #cbd5e0; border-radius: 12px; padding: 30px; margin: 30px 0;">
            <p style="color: #4a5568; font-size: 14px; margin: 0 0 10px 0; text-transform: uppercase; letter-spacing: 1px;">
              Your ${isVerification ? 'Verification' : 'Reset'} Code
            </p>
            <div style="font-size: 36px; font-weight: bold; color: #2d3748; letter-spacing: 8px; font-family: 'Courier New', monospace;">
              ${otpCode}
            </div>
            <p style="color: #718096; font-size: 12px; margin: 10px 0 0 0;">
              This code expires in 10 minutes
            </p>
          </div>
          
          <!-- Instructions -->
          <div style="background: #ebf8ff; border-left: 4px solid #3182ce; padding: 20px; margin: 30px 0; text-align: left;">
            <p style="color: #2b6cb0; font-size: 14px; margin: 0; font-weight: 600;">
              📝 Instructions:
            </p>
            <ol style="color: #2b6cb0; font-size: 14px; margin: 10px 0 0 0; line-height: 1.5;">
              <li>Copy the 6-digit code above</li>
              <li>Return to the ${isVerification ? 'verification' : 'password reset'} page</li>
              <li>Enter the code and ${isVerification ? 'click "Verify"' : 'create your new password'}</li>
            </ol>
          </div>
          
          <!-- Security Notice -->
          <div style="background: #fef5e7; border-left: 4px solid #f6ad55; padding: 20px; margin: 30px 0; text-align: left;">
            <p style="color: #c05621; font-size: 14px; margin: 0; font-weight: 600;">
              🔒 Security Notice:
            </p>
            <ul style="color: #c05621; font-size: 14px; margin: 10px 0 0 0; line-height: 1.5;">
              <li>This code is valid for 10 minutes only</li>
              <li>Don't share this code with anyone</li>
              <li>If you didn't request this, please ignore this email</li>
            </ul>
          </div>
          
        </div>
        
        <!-- Footer -->
        <div style="background: #f8fafc; padding: 20px 30px; border-top: 1px solid #e2e8f0; text-align: center;">
          <p style="color: #a0aec0; font-size: 12px; margin: 0;">
            This email was sent from ${process.env.NEXT_PUBLIC_APP_URL || 'Our Store'}
          </p>
        </div>
        
      </div>
    </body>
    </html>
    `

    const mailOptions = {
      from: {
        name: 'Your Store',
        address: process.env.EMAIL_USER!
      },
      to: email,
      subject: subject,
      html: htmlContent
    }

    await transporter.sendMail(mailOptions)
    console.log('✅ OTP email sent successfully to:', email)
    return true
    
  } catch (error) {
    console.error('💥 Error sending OTP email:', error)
    return false
  }
}

/**
 * Test email connection
 */
export async function testEmailConnection(): Promise<boolean> {
  try {
    await transporter.verify()
    console.log('✅ Email connection successful')
    return true
  } catch (error) {
    console.error('❌ Email connection failed:', error)
    return false
  }
}