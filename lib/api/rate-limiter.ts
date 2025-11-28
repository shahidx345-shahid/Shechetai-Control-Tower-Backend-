/**
 * Rate Limiting Middleware
 * Prevents API abuse and DDoS attacks
 */

import { RateLimiterMemory } from "rate-limiter-flexible"
import { NextRequest, NextResponse } from "next/server"

// Create rate limiters for different endpoints
const globalLimiter = new RateLimiterMemory({
  points: 100, // Number of requests
  duration: 60, // Per 60 seconds (1 minute)
  blockDuration: 60, // Block for 60 seconds if exceeded
})

const strictLimiter = new RateLimiterMemory({
  points: 10, // More strict for sensitive operations
  duration: 60,
  blockDuration: 300, // Block for 5 minutes
})

const authLimiter = new RateLimiterMemory({
  points: 5, // Very strict for auth endpoints
  duration: 900, // Per 15 minutes
  blockDuration: 3600, // Block for 1 hour
})

/**
 * Get client identifier from request
 */
function getClientIdentifier(request: NextRequest): string {
  // Try to get IP address from various headers
  const forwarded = request.headers.get("x-forwarded-for")
  const realIp = request.headers.get("x-real-ip")
  const cfConnectingIp = request.headers.get("cf-connecting-ip")
  
  const ip = forwarded?.split(",")[0] || realIp || cfConnectingIp || "unknown"
  
  // Also consider user agent for better fingerprinting
  const userAgent = request.headers.get("user-agent") || "unknown"
  
  return `${ip}:${userAgent.slice(0, 50)}`
}

/**
 * Rate limit middleware
 */
export async function rateLimit(
  request: NextRequest,
  type: "global" | "strict" | "auth" = "global"
): Promise<{ success: boolean; response?: Response }> {
  const clientId = getClientIdentifier(request)
  
  let limiter: RateLimiterMemory
  switch (type) {
    case "auth":
      limiter = authLimiter
      break
    case "strict":
      limiter = strictLimiter
      break
    default:
      limiter = globalLimiter
  }
  
  try {
    await limiter.consume(clientId)
    return { success: true }
  } catch (rejRes: any) {
    const retryAfter = Math.ceil(rejRes.msBeforeNext / 1000)
    
    return {
      success: false,
      response: NextResponse.json(
        {
          success: false,
          error: "Too many requests. Please try again later.",
          retryAfter,
        },
        {
          status: 429,
          headers: {
            "Retry-After": retryAfter.toString(),
            "X-RateLimit-Limit": limiter.points.toString(),
            "X-RateLimit-Remaining": "0",
            "X-RateLimit-Reset": new Date(Date.now() + rejRes.msBeforeNext).toISOString(),
          },
        }
      ),
    }
  }
}

/**
 * Rate limit wrapper for API routes
 */
export async function withRateLimit(
  request: NextRequest,
  handler: () => Promise<Response>,
  type: "global" | "strict" | "auth" = "global"
): Promise<Response> {
  const result = await rateLimit(request, type)
  
  if (!result.success) {
    return result.response!
  }
  
  return handler()
}
