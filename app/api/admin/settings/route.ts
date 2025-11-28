import { NextRequest } from "next/server"
import { withAuth } from "@/lib/api/middleware"
import { successResponse, handleApiError } from "@/lib/api/helpers"
import { Database } from "@/lib/api/database-bridge"
import { initializeFirebaseAdmin } from "@/lib/firebase/admin"

initializeFirebaseAdmin()

/**
 * GET /api/admin/settings
 * Get system settings
 */
export async function GET(request: NextRequest) {
  return withAuth(request, async (req) => {
    try {
      const { searchParams } = new URL(req.url)
      const category = searchParams.get("category") || undefined

      const settings = await Database.getSettings(category)
      
      return successResponse(settings)
    } catch (error) {
      return handleApiError(error)
    }
  }, "super_admin")
}

/**
 * PUT /api/admin/settings
 * Update a system setting
 */
export async function PUT(request: NextRequest) {
  return withAuth(request, async (req, authContext) => {
    try {
      const body = await req.json()
      
      if (!body.key || body.value === undefined) {
        return successResponse({ success: false, error: "Missing required fields: key, value" })
      }

      const setting = await Database.updateSetting(body.key, body.value, authContext.userId)

      // Create audit log
      await Database.createAuditLog({
        userId: authContext.userId,
        userEmail: authContext.email,
        action: "setting_updated",
        resource: "system_setting",
        resourceId: setting.key,
        details: { key: body.key, value: body.value },
      })

      return successResponse(setting, "Setting updated successfully")
    } catch (error) {
      return handleApiError(error)
    }
  }, "super_admin")
}
