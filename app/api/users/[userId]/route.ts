import { NextRequest } from "next/server"
import { withAuth } from "@/lib/api/middleware"
import { successResponse, errorResponse, handleApiError } from "@/lib/api/helpers"
import { Database } from "@/lib/api/database-bridge"
import { initializeFirebaseAdmin } from "@/lib/firebase/admin"

initializeFirebaseAdmin()

interface RouteContext {
  params: Promise<{
    userId: string
  }>
}

/**
 * GET /api/users/[userId]
 * Get user by ID
 */
export async function GET(request: NextRequest, context: RouteContext) {
  return withAuth(request, async () => {
    try {
      const { userId } = await context.params
      
      const user = await Database.getUserById(userId)
      
      if (!user) {
        return errorResponse("User not found", 404)
      }

      return successResponse(user)
    } catch (error) {
      return handleApiError(error)
    }
  }, "admin")
}

/**
 * PATCH /api/users/[userId]
 * Update user
 */
export async function PATCH(request: NextRequest, context: RouteContext) {
  return withAuth(request, async (req, authContext) => {
    try {
      const { userId } = await context.params
      const body = await req.json()

      const user = await Database.getUserById(userId)
      if (!user) {
        return errorResponse("User not found", 404)
      }

      const updatedUser = await Database.updateUser(userId, body)

      // Create audit log
      await Database.createAuditLog({
        userId: authContext.userId,
        userEmail: authContext.email,
        action: "user_updated",
        resource: "user",
        resourceId: userId,
        details: body,
      })

      return successResponse(updatedUser, "User updated successfully")
    } catch (error) {
      return handleApiError(error)
    }
  }, "super_admin")
}

/**
 * DELETE /api/users/[userId]
 * Soft delete user
 */
export async function DELETE(request: NextRequest, context: RouteContext) {
  return withAuth(request, async (req, authContext) => {
    try {
      const { userId } = await context.params

      const user = await Database.getUserById(userId)
      if (!user) {
        return errorResponse("User not found", 404)
      }

      await Database.deleteUser(userId)

      // Create audit log
      await Database.createAuditLog({
        userId: authContext.userId,
        userEmail: authContext.email,
        action: "user_deleted",
        resource: "user",
        resourceId: userId,
        details: { email: user.email },
      })

      return successResponse({ userId }, "User deleted successfully")
    } catch (error) {
      return handleApiError(error)
    }
  }, "super_admin")
}
