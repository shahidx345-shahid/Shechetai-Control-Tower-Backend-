import { NextRequest } from "next/server"
import { withAuth } from "@/lib/api/middleware"
import { successResponse, errorResponse, handleApiError } from "@/lib/api/helpers"
import { Database } from "@/lib/api/database-bridge"
import { initializeFirebaseAdmin } from "@/lib/firebase/admin"

initializeFirebaseAdmin()

interface RouteContext {
  params: Promise<{
    configId: string
  }>
}

/**
 * GET /api/white-label/[configId]
 * Get white-label configuration by ID
 */
export async function GET(request: NextRequest, context: RouteContext) {
  return withAuth(request, async () => {
    try {
      const { configId } = await context.params
      
      const config = await Database.getWhiteLabel(configId)
      
      if (!config) {
        return errorResponse("Configuration not found", 404)
      }

      return successResponse(config)
    } catch (error) {
      return handleApiError(error)
    }
  })
}

/**
 * PATCH /api/white-label/[configId]
 * Update white-label configuration
 */
export async function PATCH(request: NextRequest, context: RouteContext) {
  return withAuth(request, async (req) => {
    try {
      const { configId } = await context.params
      const body = await req.json()

      const config = await Database.getWhiteLabel(configId)
      if (!config) {
        return errorResponse("Configuration not found", 404)
      }

      const updatedConfig = await Database.updateWhiteLabel(configId, body)

      return successResponse(updatedConfig, "Configuration updated successfully")
    } catch (error) {
      return handleApiError(error)
    }
  })
}

/**
 * DELETE /api/white-label/[configId]
 * Delete white-label configuration
 */
export async function DELETE(request: NextRequest, context: RouteContext) {
  return withAuth(request, async () => {
    try {
      const { configId } = await context.params

      const config = await Database.getWhiteLabel(configId)
      if (!config) {
        return errorResponse("Configuration not found", 404)
      }

      // Soft delete by setting status to disabled
      await Database.updateWhiteLabel(configId, { status: "disabled" })

      return successResponse({ configId }, "Configuration disabled successfully")
    } catch (error) {
      return handleApiError(error)
    }
  })
}
