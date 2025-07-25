// lib/prisma.ts
import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma = globalForPrisma.prisma ?? 
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    errorFormat: 'pretty',
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

// Helper function to handle Prisma connection
export async function connectToPrisma() {
  try {
    await prisma.$connect()
    console.log('✅ Connected to database successfully')
  } catch (error) {
    console.error('❌ Failed to connect to database:', error)
    throw error
  }
}

// Helper function to disconnect from Prisma
export async function disconnectFromPrisma() {
  try {
    await prisma.$disconnect()
    console.log('✅ Disconnected from database successfully')
  } catch (error) {
    console.error('❌ Failed to disconnect from database:', error)
  }
}

// Helper function to check database connection
export async function checkDatabaseConnection() {
  try {
    await prisma.$queryRaw`SELECT 1`
    return true
  } catch (error) {
    console.error('Database connection failed:', error)
    return false
  }
}

export default prisma