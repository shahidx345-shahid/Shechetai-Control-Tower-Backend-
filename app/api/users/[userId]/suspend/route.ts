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
 * POST /api/users/[userId]/suspend
 * Suspend a user account
 */
export async function POST(request: NextRequest, context: RouteContext) {
  return withAuth(request, async (req, authContext) => {
    try {
      const { userId } = await context.params
      const body = await req.json()

      const user = await Database.getUserById(userId)
      if (!user) {
        return errorResponse("User not found", 404)
      }

      if (user.status === "suspended") {
        return errorResponse("User is already suspended", 400)
      }

      const updatedUser = await Database.updateUser(userId, { status: "suspended" })

      // Create audit log
      await Database.createAuditLog({
        userId: authContext.userId,
        userEmail: authContext.email,
        action: "user_suspended",
        resource: "user",
        resourceId: userId,
        details: {
          reason: body.reason || "No reason provided",
          email: user.email,
        },
      })

      return successResponse(updatedUser, "User suspended successfully")
    } catch (error) {
      return handleApiError(error)
    }
  }, "super_admin")
}
