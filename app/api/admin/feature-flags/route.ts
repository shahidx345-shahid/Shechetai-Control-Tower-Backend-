import { NextRequest } from "next/server"
import { withAuth } from "@/lib/api/middleware"
import { successResponse, errorResponse, handleApiError } from "@/lib/api/helpers"
import { Database } from "@/lib/api/database-bridge"
import { initializeFirebaseAdmin } from "@/lib/firebase/admin"

initializeFirebaseAdmin()

/**
 * GET /api/admin/feature-flags
 * Get all feature flags
 */
export async function GET(request: NextRequest) {
  return withAuth(request, async () => {
    try {
      const flags = await Database.getFeatureFlags()
      
      return successResponse(flags)
    } catch (error) {
      return handleApiError(error)
    }
  }, "super_admin")
}

/**
 * POST /api/admin/feature-flags
 * Create a new feature flag
 */
export async function POST(request: NextRequest) {
  return withAuth(request, async (req, authContext) => {
    try {
      const body = await req.json()
      
      // Validate required fields
      if (!body.name || !body.key) {
        return errorResponse("Missing required fields: name, key", 400)
      }

      // Check if flag already exists
      const existingFlag = await Database.getFeatureFlag(body.key)
      if (existingFlag) {
        return errorResponse("Feature flag with this key already exists", 400)
      }

      const flag = await Database.createFeatureFlag({
        name: body.name,
        key: body.key,
        enabled: body.enabled !== false,
        description: body.description,
        rolloutPercentage: body.rolloutPercentage,
        enabledFor: body.enabledFor,
      })

      // Create audit log
      await Database.createAuditLog({
        userId: authContext.userId,
        userEmail: authContext.email,
        action: "feature_flag_created",
        resource: "feature_flag",
        resourceId: flag.flagId,
        details: { key: flag.key, enabled: flag.enabled },
      })

      return successResponse(flag, "Feature flag created successfully")
    } catch (error) {
      return handleApiError(error)
    }
  }, "super_admin")
}
