import { NextRequest, NextResponse } from 'next/server'
import { payThorService } from '@/lib/paythor'

export async function GET(request: NextRequest) {
  try {
    // Test PayThor configuration
    const isConfigured = payThorService.isConfigured()
    
    return NextResponse.json({
      success: true,
      isConfigured,
      environment: {
        PAYTHOR_API_KEY: process.env.PAYTHOR_API_KEY ? '***SET***' : 'NOT_SET',
        PAYTHOR_API_SECRET: process.env.PAYTHOR_API_SECRET ? '***SET***' : 'NOT_SET',
        PAYTHOR_BASE_URL: process.env.PAYTHOR_BASE_URL || 'NOT_SET',
        PAYTHOR_TEST_MODE: process.env.PAYTHOR_TEST_MODE || 'NOT_SET'
      }
    })
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
