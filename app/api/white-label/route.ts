import { NextRequest } from "next/server"
import { withAuth } from "@/lib/api/middleware"
import { successResponse, errorResponse, handleApiError } from "@/lib/api/helpers"
import { Database } from "@/lib/api/database-bridge"
import { initializeFirebaseAdmin } from "@/lib/firebase/admin"

initializeFirebaseAdmin()

/**
 * GET /api/white-label
 * Get white-label configurations
 */
export async function GET(request: NextRequest) {
  return withAuth(request, async (req) => {
    try {
      const { searchParams } = new URL(req.url)
      const teamId = searchParams.get("teamId") || undefined

      const configs = await Database.getWhiteLabelConfigs(teamId)
      
      return successResponse(configs)
    } catch (error) {
      return handleApiError(error)
    }
  })
}

/**
 * POST /api/white-label
 * Create a new white-label configuration
 */
export async function POST(request: NextRequest) {
  return withAuth(request, async (req) => {
    try {
      const body = await req.json()
      
      // Validate required fields
      if (!body.teamId || !body.domain || !body.brandName) {
        return errorResponse("Missing required fields: teamId, domain, brandName", 400)
      }

      // Check if team exists
      const team = await Database.getTeamById(body.teamId)
      if (!team) {
        return errorResponse("Team not found", 404)
      }

      const config = await Database.createWhiteLabel({
        teamId: body.teamId,
        domain: body.domain,
        brandName: body.brandName,
        logoUrl: body.logoUrl,
        primaryColor: body.primaryColor,
        secondaryColor: body.secondaryColor,
        customCss: body.customCss,
        status: body.status || "pending",
        metadata: body.metadata,
      })

      return successResponse(config, "White-label configuration created successfully")
    } catch (error) {
      return handleApiError(error)
    }
  })
}
