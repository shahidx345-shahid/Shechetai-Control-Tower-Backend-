import { NextRequest } from "next/server"
import { withAuth } from "@/lib/api/middleware"
import { successResponse, errorResponse, handleApiError } from "@/lib/api/helpers"
import { Database } from "@/lib/api/database-bridge"
import { initializeFirebaseAdmin } from "@/lib/firebase/admin"

initializeFirebaseAdmin()

interface RouteContext {
  params: Promise<{
    flagId: string
  }>
}

/**
 * PATCH /api/admin/feature-flags/[flagId]
 * Update a feature flag
 */
export async function PATCH(request: NextRequest, context: RouteContext) {
  return withAuth(request, async (req, authContext) => {
    try {
      const { flagId } = await context.params
      const body = await req.json()

      const flag = await Database.updateFeatureFlag(flagId, body)
      
      if (!flag) {
        return errorResponse("Feature flag not found", 404)
      }

      // Create audit log
      await Database.createAuditLog({
        userId: authContext.userId,
        userEmail: authContext.email,
        action: "feature_flag_updated",
        resource: "feature_flag",
        resourceId: flagId,
        details: body,
      })

      return successResponse(flag, "Feature flag updated successfully")
    } catch (error) {
      return handleApiError(error)
    }
  }, "super_admin")
}
