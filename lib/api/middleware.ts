import { NextRequest, NextResponse } from "next/server"
import { verifyIdToken, getFirebaseDb, initializeFirebaseAdmin } from "../firebase/admin"
import { withRateLimit } from "./rate-limiter"

// Initialize Firebase Admin on first import
initializeFirebaseAdmin()

export interface AuthContext {
  userId: string
  email: string
  role: "super_admin" | "admin" | "user"
  isSuperAdmin: boolean
  firebaseUid: string
  ip?: string
  userAgent?: string
}

/**
 * Get client info from request
 */
function getClientInfo(request: NextRequest) {
  const forwarded = request.headers.get("x-forwarded-for")
  const realIp = request.headers.get("x-real-ip")
  const ip = forwarded?.split(",")[0] || realIp || "unknown"
  const userAgent = request.headers.get("user-agent") || "unknown"
  
  return { ip, userAgent }
}

/**
 * Authentication middleware using Firebase
 * Validates Firebase ID token from request headers
 */
export async function authenticate(request: NextRequest): Promise<AuthContext | null> {
  const apiKey = request.headers.get("x-api-key")
  const authHeader = request.headers.get("authorization")
  const { ip, userAgent } = getClientInfo(request)

  // Check API Key for system operations
  if (apiKey) {
    // Validate against environment variable
    if (apiKey === process.env.SUPER_ADMIN_API_KEY) {
      return {
        userId: "system",
        email: "system@shechetai.com",
        role: "super_admin",
        isSuperAdmin: true,
        firebaseUid: "system",
        ip,
        userAgent,
      }
    }
  }

  // Check Firebase ID Token
  if (authHeader?.startsWith("Bearer ")) {
    const idToken = authHeader.substring(7)
    try {
      // Verify Firebase ID token
      const decodedToken = await verifyIdToken(idToken)
      
      // Get user data from Firestore
      const db = getFirebaseDb()
      const userDoc = await db.collection("users").doc(decodedToken.uid).get()
      
      if (!userDoc.exists) {
        console.error("User not found in Firestore:", decodedToken.uid)
        return null
      }

      const userData = userDoc.data()
      
      return {
        userId: userDoc.id,
        email: decodedToken.email || userData?.email || "",
        role: userData?.role || "user",
        isSuperAdmin: userData?.role === "super_admin",
        firebaseUid: decodedToken.uid,
        ip,
        userAgent,
      }
    } catch (error) {
      console.error("Firebase authentication error:", error)
      return null
    }
  }

  return null
}

/**
 * Authorization middleware
 * Checks if user has required permissions
 */
export function authorize(context: AuthContext | null, requiredRole: "super_admin" | "admin" = "admin"): boolean {
  if (!context) return false
  
  if (requiredRole === "super_admin") {
    return context.isSuperAdmin
  }
  
  return context.role === "super_admin" || context.role === "admin"
}

/**
 * Middleware wrapper for protected API routes with rate limiting
 */
export async function withAuth(
  request: NextRequest,
  handler: (req: NextRequest, context: AuthContext) => Promise<Response>,
  requiredRole: "super_admin" | "admin" = "admin"
): Promise<Response> {
  // Apply rate limiting (stricter for auth endpoints)
  const rateLimit = await withRateLimit(
    request,
    async () => {
      const authContext = await authenticate(request)
      
      if (!authContext || !authorize(authContext, requiredRole)) {
        return NextResponse.json(
          { success: false, error: "Unauthorized" },
          { status: 401 }
        )
      }

      try {
        return await handler(request, authContext)
      } catch (error) {
        console.error("API Error:", error)
        return NextResponse.json(
          { success: false, error: "Internal server error" },
          { status: 500 }
        )
      }
    },
    requiredRole === "super_admin" ? "strict" : "global"
  )

  return rateLimit
}
