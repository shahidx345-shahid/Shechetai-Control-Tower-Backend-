import { NextRequest } from "next/server"
import { withAuth } from "@/lib/api/middleware"
import { successResponse, errorResponse, handleApiError, parsePagination, createPaginatedResponse } from "@/lib/api/helpers"
import { initializeFirebaseAdmin } from "@/lib/firebase/admin"
import { UserDatabase, AuditLogDatabase } from "@/lib/api/firestore"

// Initialize Firebase Admin
initializeFirebaseAdmin()

/**
 * GET /api/users
 * List all users with optional filters
 */
export async function GET(request: NextRequest) {
  return withAuth(request, async (req) => {
    try {
      const { searchParams } = new URL(req.url)
      const { page, limit } = parsePagination(searchParams)
      
      const filters = {
        role: searchParams.get("role") || undefined,
        status: searchParams.get("status") || undefined,
        search: searchParams.get("search") || undefined,
      }

      const users = await UserDatabase.getAll()
      
      // Apply filters
      let filtered = users
      if (filters.role) {
        filtered = filtered.filter(u => u.role === filters.role)
      }
      if (filters.status) {
        filtered = filtered.filter(u => u.status === filters.status)
      }
      if (filters.search) {
        const search = filters.search.toLowerCase()
        filtered = filtered.filter(u => 
          u.userId.toLowerCase().includes(search) ||
          u.email.toLowerCase().includes(search) ||
          u.name.toLowerCase().includes(search)
        )
      }
      
      // Apply pagination
      const start = (page - 1) * limit
      const paginatedUsers = filtered.slice(start, start + limit)
      
      const response = createPaginatedResponse(paginatedUsers, filtered.length, page, limit)
      
      return successResponse(response)
    } catch (error) {
      return handleApiError(error)
    }
  }, "super_admin")
}

/**
 * POST /api/users
 * Create a new user
 */
export async function POST(request: NextRequest) {
  return withAuth(request, async (req, authContext) => {
    try {
      const body = await req.json()
      
      // Validate required fields
      if (!body.email || !body.name) {
        return errorResponse("Missing required fields: email, name", 400)
      }

      // Check if user already exists
      const existingUser = await UserDatabase.getByEmail(body.email)
      if (existingUser) {
        return errorResponse("User with this email already exists", 400)
      }

      // Create user in Firestore with Firebase UID as the key
      const userId = `user_${Date.now()}`
      const user = await UserDatabase.create(userId, {
        email: body.email,
        name: body.name,
        role: body.role || "user",
        status: "active",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        lastLoginAt: new Date().toISOString(),
      } as any)

      // Create audit log
      await AuditLogDatabase.create({
        userId: authContext.userId,
        userEmail: authContext.email,
        action: "user_created",
        resource: "user",
        resourceId: user.userId,
        details: { email: user.email, role: user.role },
      } as any)

      return successResponse(user, "User created successfully")
    } catch (error) {
      return handleApiError(error)
    }
  }, "super_admin")
}
