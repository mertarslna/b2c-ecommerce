// src/lib/emailService.ts
import nodemailer from 'nodemailer'
import crypto from 'crypto'

// إعداد Gmail transporter - تم تصحيح اسم الدالة
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
})

/**
 * توليد verification token
 */
export function generateVerificationToken(): string {
  return crypto.randomBytes(32).toString('hex')
}

/**
 * إرسال إيميل التحقق
 */
export async function sendVerificationEmail(
  email: string,
  firstName: string,
  verificationToken: string
): Promise<boolean> {
  try {
    console.log('📧 Sending verification email to:', email)
    
    const verificationUrl = `${process.env.NEXT_PUBLIC_APP_URL}/auth/verify-email?token=${verificationToken}`
    
    const htmlContent = `
    <!DOCTYPE html>
    <html dir="rtl" lang="ar">
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>تأكيد البريد الإلكتروني</title>
    </head>
    <body style="font-family: 'Segoe UI', Tahoma, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 20px;">
      
      <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
        
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 30px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 28px; font-weight: bold;">
            مرحباً بك! 🎉
          </h1>
          <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0; font-size: 16px;">
            تحقق من بريدك الإلكتروني لإكمال التسجيل
          </p>
        </div>
        
        <!-- Content -->
        <div style="padding: 40px 30px;">
          <h2 style="color: #2d3748; margin: 0 0 20px 0; font-size: 24px;">
            أهلاً ${firstName}! 👋
          </h2>
          
          <p style="color: #4a5568; font-size: 16px; line-height: 1.6; margin-bottom: 25px;">
            شكراً لانضمامك إلينا! لإكمال إنشاء حسابك والبدء في التسوق، 
            يرجى تأكيد بريدك الإلكتروني بالضغط على الزر أدناه.
          </p>
          
          <!-- CTA Button -->
          <div style="text-align: center; margin: 35px 0;">
            <a href="${verificationUrl}" 
               style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                      color: white; 
                      padding: 15px 40px; 
                      text-decoration: none; 
                      border-radius: 8px; 
                      font-weight: bold; 
                      font-size: 16px;
                      display: inline-block;
                      box-shadow: 0 4px 6px rgba(0,0,0,0.1);
                      transition: transform 0.2s;">
              تأكيد البريد الإلكتروني ✨
            </a>
          </div>
          
          <!-- Security Notice -->
          <div style="background: #f7fafc; padding: 20px; border-radius: 8px; border-right: 4px solid #667eea; margin: 30px 0;">
            <p style="color: #2d3748; font-size: 14px; margin: 0; font-weight: 600;">
              📌 ملاحظة أمنية مهمة:
            </p>
            <p style="color: #4a5568; font-size: 14px; margin: 8px 0 0 0; line-height: 1.5;">
              هذا الرابط صالح لمدة 24 ساعة فقط لأسباب أمنية.
            </p>
          </div>
          
          <!-- Alternative Link -->
          <p style="color: #718096; font-size: 12px; line-height: 1.5; margin-top: 25px;">
            إذا لم يعمل الزر، يمكنك نسخ ولصق هذا الرابط في متصفحك:<br>
            <a href="${verificationUrl}" style="color: #667eea; word-break: break-all;">
              ${verificationUrl}
            </a>
          </p>
          
          <p style="color: #a0aec0; font-size: 12px; margin-top: 20px;">
            إذا لم تقم بإنشاء هذا الحساب، يمكنك تجاهل هذا البريد.
          </p>
        </div>
        
        <!-- Footer -->
        <div style="background: #f8fafc; padding: 20px 30px; border-top: 1px solid #e2e8f0; text-align: center;">
          <p style="color: #a0aec0; font-size: 12px; margin: 0;">
            تم إرسال هذا البريد من ${process.env.NEXT_PUBLIC_APP_URL || 'متجرنا الإلكتروني'}
          </p>
        </div>
        
      </div>
    </body>
    </html>
    `

    const mailOptions = {
      from: {
        name: 'متجرنا الإلكتروني',
        address: process.env.EMAIL_USER!
      },
      to: email,
      subject: '✨ تأكيد البريد الإلكتروني - مرحباً بك في متجرنا!',
      html: htmlContent
    }

    await transporter.sendMail(mailOptions)
    console.log('✅ Verification email sent successfully to:', email)
    return true
    
  } catch (error) {
    console.error('💥 Error sending verification email:', error)
    return false
  }
}

/**
 * اختبار إعدادات الإيميل
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