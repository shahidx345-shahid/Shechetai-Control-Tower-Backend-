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
 * POST /api/users/[userId]/activate
 * Reactivate a suspended user account
 */
export async function POST(request: NextRequest, context: RouteContext) {
  return withAuth(request, async (req, authContext) => {
    try {
      const { userId } = await context.params

      const user = await Database.getUserById(userId)
      if (!user) {
        return errorResponse("User not found", 404)
      }

      if (user.status === "active") {
        return errorResponse("User is already active", 400)
      }

      const updatedUser = await Database.updateUser(userId, { status: "active" })

      // Create audit log
      await Database.createAuditLog({
        userId: authContext.userId,
        userEmail: authContext.email,
        action: "user_activated",
        resource: "user",
        resourceId: userId,
        details: { email: user.email },
      })

      return successResponse(updatedUser, "User activated successfully")
    } catch (error) {
      return handleApiError(error)
    }
  }, "super_admin")
}
