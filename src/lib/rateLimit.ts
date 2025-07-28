// src/lib/rateLimit.ts
import { NextRequest } from 'next/server'

interface RateLimitOptions {
  interval: number // Time window in milliseconds
  uniqueTokenPerInterval: number // Max unique tokens per interval
}

interface RateLimitStore {
  [key: string]: {
    count: number
    resetTime: number
  }
}

// In-memory store for development (use Redis in production)
const store: RateLimitStore = {}

export function rateLimit(options: RateLimitOptions) {
  return {
    check: async (request: NextRequest, limit: number, token: string) => {
      // Get client identifier (IP address + token)
      const forwarded = request.headers.get('x-forwarded-for')
      const ip = forwarded ? forwarded.split(',')[0] : request.ip || 'unknown'
      const key = `${ip}-${token}`

      const now = Date.now()
      const resetTime = now + options.interval

      // Clean up expired entries
      Object.keys(store).forEach(k => {
        if (store[k].resetTime < now) {
          delete store[k]
        }
      })

      // Check current count
      const current = store[key]
      
      if (!current) {
        // First request
        store[key] = {
          count: 1,
          resetTime
        }
        return
      }

      if (current.resetTime < now) {
        // Reset window
        store[key] = {
          count: 1,
          resetTime
        }
        return
      }

      if (current.count >= limit) {
        // Rate limit exceeded
        throw new Error('Rate limit exceeded')
      }

      // Increment count
      store[key].count++
    }
  }
}

// Advanced rate limiting with Redis (for production)
export function createAdvancedRateLimit() {
  // This would use Redis in production
  // Example implementation with @upstash/redis
  /*
  import { Redis } from '@upstash/redis'
  
  const redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL!,
    token: process.env.UPSTASH_REDIS_REST_TOKEN!,
  })
  
  return {
    check: async (identifier: string, limit: number, window: number) => {
      const key = `rate_limit:${identifier}`
      const current = await redis.incr(key)
      
      if (current === 1) {
        await redis.expire(key, window)
      }
      
      if (current > limit) {
        throw new Error('Rate limit exceeded')
      }
      
      return current
    }
  }
  */
}